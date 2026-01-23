const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const Shop = require("../models/Shop");
const RefreshSession = require("../models/RefreshSession");
const { checkPasswordHistory, addToPasswordHistory, isPasswordExpired, isCommonPassword } = require("../utils/passwordUtils");
const securityLogger = require("../utils/securityLogger");
const { logActivity } = require("../services/activityLogger");
const crypto = require('crypto');
const axios = require('axios');
const { matchedData } = require("express-validator");
const sendEmail = require("../utils/sendEmail");
const { validateImageFile } = require("../utils/fileValidation");
const speakeasy = require("speakeasy");
const { decrypt } = require("../utils/encryption");
const { getAuthCookieOptions, getRefreshCookieOptions } = require("../utils/cookieOptions");

const sendTokenToResponse = async (user, statusCode, res, currentShop, req) =>{
  // Generate access token (short-lived)
  const token = jwt.sign({id: user._id, role: user.role},process.env.JWT_SECRET,{
      expiresIn: process.env.JWT_EXPIRE
  });

  // Generate refresh token (long-lived, random)
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  // Get client info
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Create refresh session
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await RefreshSession.create({
    userId: user._id,
    refreshTokenHash,
    createdAt: new Date(),
    lastUsedAt: new Date(),
    expiresAt,
    ip,
    userAgent
  });

  const authOptions = getAuthCookieOptions();
  const refreshOptions = getRefreshCookieOptions();
   
  // Log successful login
  await logActivity({
      req,
      userId: user._id,
      action: 'LOGIN_SUCCESS',
      module: 'Auth',
      metadata: { email: user.email, role: user.role }
  });

  res.status(statusCode)
    .cookie("token", token, authOptions)
    .cookie("refreshToken", refreshToken, refreshOptions)
    .json({
      success: true,
      message:"Login successful.",
      data: {
        user:{
          id: user._id,
          fname: user.fname,
          lname: user.lname,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage,
          shops: user.shops,
          currentShopId: currentShop ? currentShop._id : null,
          passwordLastUpdated: user.passwordLastUpdated
        }
      }
    });
};


/**
 * @desc    Register a new user
 * @route   PUT /api/v1/auth/register
 * @access  Public
 */
exports.registerUser = async (req, res) => {
  const data = matchedData(req)
  const { fname, lname, email, phone, password } = data;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: "Email already exists.",
      });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(409).json({ 
        success: false,
        message: "This phone number is already used.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fname,
      lname,
      email,
      phone,
      password: hashedPassword,
      passwordLastUpdated: Date.now(),
      passwordHistory: []
    });
    await newUser.save();

    return res.status(201).json({ 
      success: true,
      message: "User Registered Successfully",
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

/**
 * @desc    Initiate Google OAuth flow
 * @route   GET /api/auth/google
 * @access  Public
 */
exports.googleOAuthInitiate = async (req, res) => {
  try {

    const state = crypto.randomBytes(32).toString('hex');

    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000, 
      secure: process.env.NODE_ENV === "production"
    };

    res.cookie('oauth_state', state, cookieOptions);

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.append('client_id', process.env.GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.append('redirect_uri', process.env.GOOGLE_CALLBACK_URL);
    googleAuthUrl.searchParams.append('response_type', 'code');
    googleAuthUrl.searchParams.append('scope', 'openid email profile');
    googleAuthUrl.searchParams.append('state', state);

    await logActivity({
      req,
      action: 'GOOGLE_OAUTH_INITIATED',
      module: 'Auth',
      metadata: { state_generated: true }
    });

    res.redirect(googleAuthUrl.toString());

  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate Google OAuth'
    });
  }
};

/**
 * @desc    Handle Google OAuth callback
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
exports.googleOAuthCallback = async (req, res) => {
  try {
    const { state } = req.query;
    const storedState = req.cookies.oauth_state;

    // 1. Validate state parameter (CSRF protection)
    if (!state || !storedState || state !== storedState) {
      await logActivity({
        req,
        action: 'GOOGLE_OAUTH_FAILED',
        module: 'Auth',
        metadata: { reason: 'Invalid state parameter - possible CSRF attack' }
      });
      return res.redirect(`${process.env.CLIENT_WEB_URL}/login?error=invalid_state`);
    }

    // Extract code manually from originalUrl to ensure correct parsing
    const urlParams = new URLSearchParams(req.originalUrl.split('?')[1]);
    const code = urlParams.get('code');

    // 2. Validate authorization code
    if (!code) {
      await logActivity({
        req,
        action: 'GOOGLE_OAUTH_FAILED',
        module: 'Auth',
        metadata: { reason: 'No authorization code received' }
      });
      return res.redirect(`${process.env.CLIENT_WEB_URL}/login?error=no_code`);
    }

    // 3. Exchange authorization code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code'
    }));

    const { access_token } = tokenResponse.data;

    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const googleUser = userInfoResponse.data;

    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      user = await User.create({
        fname: googleUser.given_name || 'User',
        lname: googleUser.family_name || '',
        email: googleUser.email,
        phone: `google_${Date.now()}`,
        authProvider: 'google',
        isActive: true
      });

      await logActivity({
        req,
        userId: user._id,
        action: 'USER_CREATED_VIA_GOOGLE_OAUTH',
        module: 'Auth',
        metadata: { email: user.email }
      });
    } else {
      if (user.authProvider !== 'google') {
        await logActivity({
          req,
          userId: user._id,
          action: 'GOOGLE_OAUTH_FAILED',
          module: 'Auth',
          metadata: { reason: 'Email already registered with local auth' }
        });
        return res.redirect(`${process.env.CLIENT_WEB_URL}/login?error=email_exists`);
      }
    }

    // 6. Check if account is active
    if (!user.isActive) {
      await logActivity({
        req,
        userId: user._id,
        action: 'GOOGLE_OAUTH_FAILED',
        module: 'Auth',
        metadata: { reason: 'Account disabled' }
      });
      return res.redirect(`${process.env.CLIENT_WEB_URL}/login?error=account_disabled`);
    }

    // 7. Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // 8. Clear OAuth state cookie
    res.clearCookie('oauth_state');

    // 9. Get active shop for user
    let activeShop = null;
    if (user.shops && user.shops.length > 0) {
      const lastShop = user.shops.find(s => s._id.equals(user.activeShop));
      if (lastShop) {
        activeShop = lastShop;
      } else {
        activeShop = user.shops[0];
      }
    }

    // 10. Generate tokens and create refresh session (for OAuth, set cookies but don't send JSON)
    const token = jwt.sign({id: user._id, role: user.role},process.env.JWT_SECRET,{
      expiresIn: process.env.JWT_EXPIRE
    });

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    await RefreshSession.create({
      userId: user._id,
      refreshTokenHash,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      expiresAt,
      ip,
      userAgent
    });

    const authOptions = getAuthCookieOptions();
    const refreshOptions = getRefreshCookieOptions();
    
    res.cookie("token", token, authOptions);
    res.cookie("refreshToken", refreshToken, refreshOptions);

    await logActivity({
      req,
      userId: user._id,
      action: 'LOGIN_SUCCESS_VIA_GOOGLE_OAUTH',
      module: 'Auth',
      metadata: { email: user.email, role: user.role }
    });

    // 11. Redirect to frontend WITHOUT token in URL
    if (!user.shops || user.shops.length === 0) {
      res.redirect(`${process.env.CLIENT_WEB_URL}/create-first-shop`);
    } else {
      res.redirect(`${process.env.CLIENT_WEB_URL}/dashboard`);
    }

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    
    await logActivity({
      req,
      action: 'GOOGLE_OAUTH_ERROR',
      module: 'Auth',
      metadata: { error: error.message }
    });

    res.redirect(`${process.env.CLIENT_WEB_URL}/login?error=oauth_failed`);
  }
};

exports.loginUser = async (req, res) => {
  const data = matchedData(req);
  const { email, password } = data;
  try {
    const getUser = await User.findOne({ email }).populate({
      path: 'shops',
      populate: {
        path: 'owner',
        select: 'fname lname email'
      }})
    if (!getUser) {
      securityLogger.logFailedLogin(email, 'USER_NOT_FOUND');
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials.",
      });
    }

    if(!getUser.isActive){
      securityLogger.logFailedLogin(email, 'ACCOUNT_DISABLED');
      return res.status(403).json({
        success:false,
        message: "Your account has been disabled. Please contact support."
      })
    }

    if (getUser.lockUntil && getUser.lockUntil > Date.now()) {
      securityLogger.logFailedLogin(email, 'ACCOUNT_LOCKED');
      return res.status(429).json({
        success: false,
        message: "Account is temporarily locked. Please try again later."
      });
    }

    // Prevent Google OAuth users from logging in with password
    if (getUser.authProvider === 'google') {
      await logActivity({
        req,
        userId: getUser._id,
        action: 'LOGIN_FAILED',
        module: 'Auth',
        metadata: { email, reason: 'Google OAuth user attempted password login' }
      });
      return res.status(400).json({
        success: false,
        message: "This account uses Google Sign-In. Please use 'Continue with Google' to login."
      });
    }

    const checkPassword = await bcrypt.compare(password, getUser.password);
    if (!checkPassword) {
      // Increment failed attempts
      getUser.failedLoginAttempts += 1;

      // Check if should lock
      if (getUser.failedLoginAttempts >= 5) {
        getUser.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
        getUser.failedLoginAttempts = 0;
      }
      
      await getUser.save({ validateBeforeSave: false });

      securityLogger.logFailedLogin(email, 'INVALID_PASSWORD');
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials.",
      });
    }

    // Check if password has expired
    const expirationDays = parseInt(process.env.PASSWORD_EXPIRATION_DAYS) || 90;
    if (isPasswordExpired(getUser.passwordLastUpdated, expirationDays)) {
      securityLogger.logExpiredPasswordLogin(getUser._id.toString(), email);
      return res.status(403).json({
        success: false,
        message: "Your password has expired. Please update your password to continue.",
        passwordExpired: true
      });
    }

    getUser.lastLogin = Date.now();
    getUser.failedLoginAttempts = 0;
    getUser.lockUntil = undefined;
    await getUser.save({validateBeforeSave:false})

    securityLogger.logSuccessfulLogin(getUser._id.toString(), email);

    // Check for MFA
    if (getUser.mfa && getUser.mfa.enabled) {
        // Create temp token for MFA verification
        const tempToken = jwt.sign({ id: getUser._id, mfaPending: true }, process.env.JWT_SECRET, { expiresIn: '10m' });
        
        // Log MFA challenge issued
        await logActivity({
            userId: getUser._id,
            action: 'MFA_CHALLENGE_ISSUED',
            module: 'Auth',
            metadata: { email, ip: req.ip }
        });
        
        return res.status(200).json({
            success: false,
            mfaRequired: true,
            tempToken,
            message: "MFA code required"
        });
    }

    let activeShop = null
    if (getUser.shops && getUser.shops.length > 0) {
      const lastShop = getUser.shops.find(s => s._id.equals(getUser.activeShop));
      if (lastShop) {
        activeShop = lastShop;
      } else {
        activeShop = getUser.shops[0];
      }
    }

    await sendTokenToResponse(getUser,200,res,activeShop, req)

    
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      message: "Server Error "+error,
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/profile
 * @access  Private
 */
exports.getProfile = async (req, res) => {
  
  try {
    const userWithDetails = await User.findById(req.user._id).populate({
        path: 'shops',
        populate: { 
          path: 'owner',
          select: 'fname lname email' 
        }
      })
      .populate({ 
        path: 'activeShop',
        populate: {
          path: 'owner',
          select: 'fname lname email'
        }
      });

    if (!userWithDetails) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message:"Fetched profile data",
      data: userWithDetails, 
    });
  } catch (error) {
     return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
  const userId = req.user._id;
  const { fname, lname, phone } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fname, lname, phone },
      { new: true, runValidators: true }
    ).select("-password");

    await logActivity({
        req,
        userId,
        action: 'PROFILE_UPDATE',
        module: 'Auth',
        metadata: { fname, lname, phone }
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.phone) {
        return res.status(409).json({
            success: false,
            message: "Phone number already in use by another account."
        });
    }
    console.log(error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res) => {
  const userId = req.user._id;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      securityLogger.logPasswordChangeAttempt(userId.toString(), user.email, false, 'INCORRECT_OLD_PASSWORD');
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Check if password is a common/weak password
    if (isCommonPassword(newPassword)) {
      securityLogger.logPasswordChangeAttempt(userId.toString(), user.email, false, 'COMMON_PASSWORD');
      return res.status(400).json({
        success: false,
        message: "This password is too common or weak. Please choose a stronger password.",
      });
    }

    // Check if new password contains user's first or last name
    const lowerPassword = newPassword.toLowerCase();
    if (user.fname && lowerPassword.includes(user.fname.toLowerCase())) {
      securityLogger.logPasswordChangeAttempt(userId.toString(), user.email, false, 'CONTAINS_PERSONAL_INFO');
      return res.status(400).json({
        success: false,
        message: "Password does not meet security requirements.",
      });
    }
    if (user.lname && lowerPassword.includes(user.lname.toLowerCase())) {
      securityLogger.logPasswordChangeAttempt(userId.toString(), user.email, false, 'CONTAINS_PERSONAL_INFO');
      return res.status(400).json({
        success: false,
        message: "Password does not meet security requirements.",
      });
    }

    // Check if new password is the same as current password
    const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (isSameAsCurrent) {
      securityLogger.logPasswordReuseAttempt(userId.toString(), user.email);
      return res.status(400).json({
        success: false,
        message: "This password cannot be used. Please choose a different password.",
      });
    }

    // Check if new password matches any password in history
    const historyLimit = parseInt(process.env.PASSWORD_HISTORY_LIMIT) || 5;
    const isPasswordReused = await checkPasswordHistory(newPassword, user.passwordHistory);
    
    if (isPasswordReused) {
      securityLogger.logPasswordReuseAttempt(userId.toString(), user.email);
      return res.status(400).json({
        success: false,
        message: "This password cannot be used. Please choose a different password.",
      });
    }

    // Add current password to history before changing it
    const updatedHistory = addToPasswordHistory(user.password, user.passwordHistory, historyLimit);

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    user.passwordHistory = updatedHistory;
    user.passwordLastUpdated = Date.now();
    user.securityStamp = Date.now(); // Update security stamp to invalidate all tokens
    await user.save();

    // Revoke all refresh sessions (force re-login on all devices)
    await RefreshSession.updateMany(
      { userId: user._id, revokedAt: null },
      { revokedAt: new Date() }
    );

    securityLogger.logPasswordChangeAttempt(userId.toString(), user.email, true);
    securityLogger.logPasswordChanged(userId.toString(), user.email, req);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/v1/auth/delete-account
 * @access  Private
 */
exports.deleteAccount = async (req, res) => {
  const userId = req.user._id;

  try {
    await User.findByIdAndDelete(userId);
    return res.status(200).json({
      success: true,
      message: "Account deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

exports.logout = async (req, res) => {
    try {
      // Get refresh token from cookie
      const refreshToken = req.cookies.refreshToken;
      
      if (refreshToken) {
        // Hash and revoke the refresh session
        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const result = await RefreshSession.updateOne(
          { refreshTokenHash, revokedAt: null },
          { revokedAt: new Date() }
        );
        console.log('[LOGOUT] Session revoked - matched:', result.matchedCount, 'modified:', result.modifiedCount);
      }

      // Clear both cookies with identical options (must match set options exactly)
      const authOptions = { ...getAuthCookieOptions(), expires: new Date(0) };
      const refreshOptions = { ...getRefreshCookieOptions(), expires: new Date(0) };

      res.cookie('token', '', authOptions);
      res.cookie('refreshToken', '', refreshOptions);
      console.log('[LOGOUT] Cookies cleared - path:', authOptions.path, 'sameSite:', authOptions.sameSite, 'secure:', authOptions.secure);
      
      res.status(200).json({ success: true, message: "Logged out successfully." });
    } catch (error) {
      return res.status(500).json({ success: false, message: `Server error: ${error.message}` });
    }
};

exports.uploadProfileImage = async (req, res) => {
  const userId = req.user._id;

  try {
    if(!req.file){
      res.status(400).json({
        success: false,
        message:"No image file uploaded."
      })
    }

    const relativePath = path.join("uploads",req.file.filename)
    const absolutePath = path.join(__dirname, "..", relativePath);

    // Validate magic bytes
    const validationResult = await validateImageFile(absolutePath);
    if (!validationResult.isValid) {
      // Delete the invalid file
      fs.unlinkSync(absolutePath);
      return res.status(400).json({
        success: false,
        message: validationResult.error || "Invalid file content."
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: relativePath },
      { new: true}
    ).select("-password");

    await logActivity({
        req,
        userId,
        action: 'PROFILE_IMAGE_UPDATE',
        module: 'Auth',
        metadata: { filename: req.file.filename, detectedType: validationResult.detectedType }
    });

    return res.status(200).json({
      success: true,
      message: "Profile image uploaded.",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

exports.viewProfileImage = (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, "..", "uploads", filename);
  res.sendFile(imagePath);
};

exports.verifyMFA = async (req, res) => {
    const { code, recoveryCode } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        
        if (!user.mfa.enabled) {
             return res.status(400).json({ success: false, message: "MFA not enabled for this user." });
        }

        let verified = false;

        if (code) {
             // TOTP Verification with Anti-Replay
            const decryptedSecret = decrypt(user.mfa.secret);
            const delta = speakeasy.totp.verifyDelta({
                secret: decryptedSecret,
                encoding: "base32",
                token: code,
                window: 1 // Allow 30s slack
            });

            if (delta) {
                const currentStep = Math.floor(Date.now() / 30000);
                const tokenStep = currentStep + delta.delta;

                if (user.mfa.lastTotpStep && user.mfa.lastTotpStep >= tokenStep) {
                    // Replay detected
                    verified = false;
                } else {
                    verified = true;
                    user.mfa.lastTotpStep = tokenStep;
                    await user.save();
                    
                    // Log successful TOTP verification
                    await logActivity({
                        userId: user._id,
                        action: 'MFA_SUCCESS',
                        module: 'Auth',
                        metadata: { method: 'totp', ip: req.ip }
                    });
                }
            } else {
                verified = false;
                // Log failed TOTP attempt
                await logActivity({
                    userId: user._id,
                    action: 'MFA_FAILED',
                    module: 'Auth',
                    metadata: { method: 'totp', ip: req.ip }
                });
            }
        } else if (recoveryCode) {
            // Recovery Code Verification
            for (let i = 0; i < user.mfa.recoveryCodes.length; i++) {
                const isMatch = await bcrypt.compare(recoveryCode, user.mfa.recoveryCodes[i]);
                if (isMatch) {
                    verified = true;
                    // Remove used recovery code (single-use)
                    user.mfa.recoveryCodes.splice(i, 1);
                    await user.save();
                    
                    // Log recovery code usage
                    await logActivity({
                        userId: user._id,
                        action: 'RECOVERY_CODE_USED',
                        module: 'Auth',
                        metadata: { remainingCodes: user.mfa.recoveryCodes.length }
                    });
                    break;
                }
            }
            if (!verified) {
                await logActivity({
                    userId: user._id,
                    action: 'MFA_FAILED',
                    module: 'Auth',
                    metadata: { method: 'recovery_code', ip: req.ip }
                });
                return res.status(401).json({ success: false, message: "Invalid recovery code" });
            }
        } else {
             return res.status(400).json({ success: false, message: "Code or recovery code required" });
        }

        if (!verified) {
             return res.status(401).json({ success: false, message: "Invalid MFA code" });
        }

        // Success! Issue full token
        const currentShop = user.activeShop ? await Shop.findById(user.activeShop) : null;
        sendTokenToResponse(user, 200, res, currentShop, req);

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};




exports.switchShop = async (req, res) => {
  
  const { shopID } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
        
    const shopIsValid = user.shops.some(s => s.equals(shopID));

    if (!shopIsValid) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this shop.",
      });
    }

    user.activeShop = shopID;
    await user.save({validateBeforeSave: false});
    
    const shop = await Shop.findById(shopID);

    res.status(200).json({
      success: true,
      message: `Active shop switched to ${shop.name}.`,
      data: {
        currentShopId: shopID
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

/**
 * @desc    Check if user's password has expired
 * @route   GET /api/v1/auth/check-password-expiration
 * @access  Private
 */
exports.checkPasswordExpiration = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    const expirationDays = parseInt(process.env.PASSWORD_EXPIRATION_DAYS) || 90;
    const expired = isPasswordExpired(user.passwordLastUpdated, expirationDays);

    if (expired) {
      return res.status(200).json({
        success: true,
        passwordExpired: true,
        message: "Your password has expired. Please change your password."
      });
    }

    // Calculate days until expiration
    const lastUpdated = new Date(user.passwordLastUpdated);
    const now = new Date();
    const daysSinceUpdate = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));
    const daysUntilExpiration = expirationDays - daysSinceUpdate;

    return res.status(200).json({
      success: true,
      passwordExpired: false,
      daysUntilExpiration: daysUntilExpiration,
      message: `Your password will expire in ${daysUntilExpiration} days.`
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`
    });
  }
};


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      await logActivity({
          req,
          action: 'PASSWORD_RESET_REQUEST_UNKNOWN',
          module: 'Auth',
          metadata: { email } // Will be masked by logger
      });
      return res.status(200).json({
        success: true,
        message: "If that email is registered, you will receive a password reset link.",
      });
    }
    
    // Check if user uses social login
    if (user.authProvider === 'google') {
        return res.status(200).json({
            success: true,
            message: "If that email is registered, you will receive a password reset link.",
        });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.CLIENT_WEB_URL}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Inter', sans-serif; background-color: #f4f4f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .header { background: #4f46e5; padding: 32px; text-align: center; }
          .logo { color: white; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; }
          .content { padding: 40px 32px; color: #334155; line-height: 1.6; }
          .h1 { font-size: 24px; font-weight: 700; color: #1e293b; margin-bottom: 24px; text-align: center; }
          .button-container { text-align: center; margin: 32px 0; }
          .button { display: inline-block; background-color: #4f46e5; color: #ffffff !important; font-weight: 600; padding: 14px 28px; border-radius: 8px; text-decoration: none; transition: background-color 0.2s; }
          .button:hover { background-color: #4338ca; }
          .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 14px; color: #64748b; }
          .link { color: #4f46e5; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">LedgerX</div>
          </div>
          <div class="content">
            <h1 class="h1">Reset Your Password</h1>
            <p>Hello,</p>
            <p>We received a request to reset the password for your LedgerX account. If you didn't make this request, you can safely ignore this email.</p>
            <div class="button-container">
              <a href="${resetUrl}" class="button" target="_blank">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="${resetUrl}" class="link">${resetUrl}</a></p>
            <p>This link will expire in 10 minutes.</p>
            <p>Best regards,<br>The LedgerX Team</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} LedgerX. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await logActivity({
        req,
        userId: user._id,
        action: 'PASSWORD_RESET_REQUEST',
        module: 'Auth',
        metadata: { email: user.email }
      });

      await sendEmail({
        email: user.email,
        subject: 'Reset your LedgerX password',
        message: message, // Plain text fallback
        html: html
      });

      return res.status(200).json({
        success: true,
        message: "If that email is registered, you will receive a password reset link.",
      });
    } catch (err) {
      console.error("Email send failed:", err.message);

      if (process.env.NODE_ENV === 'development') {
        console.log("###########################################################");
        console.log("DEV MODE - Password Reset Link:");
        console.log(resetUrl);
        console.log("###########################################################");
        
        // Return success in dev mode so we can test the flow
        return res.status(200).json({
          success: true,
          message: "Developer Mode: Check server console for reset link.",
        });
      }

      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Email could not be sent",
      });
    }
  } catch (error) {
    return res.status(500).json({
        success: false,
        message: `Server error: ${error.message}`,
    });
  }
};


exports.resetPassword = async (req, res) => {
  const { password } = req.body;
  const { resettoken } = req.params;

  try {
    // Get hashed token
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resettoken)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Check if password is a common/weak password
    if (isCommonPassword(password)) {
      securityLogger.logPasswordChangeAttempt(user._id.toString(), user.email, false, 'COMMON_PASSWORD');
      return res.status(400).json({
        success: false,
        message: "This password is too common or weak. Please choose a stronger password.",
      });
    }

    // Check if new password contains user's first or last name
    const lowerPassword = password.toLowerCase();
    if (user.fname && lowerPassword.includes(user.fname.toLowerCase())) {
        return res.status(400).json({
            success: false,
            message: "Password cannot contain your first name.",
        });
    }
    if (user.lname && lowerPassword.includes(user.lname.toLowerCase())) {
        return res.status(400).json({
            success: false,
            message: "Password cannot contain your last name.",
        });
    }

    // Check if new password matches any password in history
    const isPasswordReused = await checkPasswordHistory(password, user.passwordHistory);
    if (isPasswordReused) {
        return res.status(400).json({
            success: false,
            message: "This password has been used recently. Please choose a different password.",
        });
    }

    // Set new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Add old password to history
    user.passwordHistory = addToPasswordHistory(user.password, user.passwordHistory);
    
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // Update passwordLastUpdated to invalidate sessions
    user.passwordLastUpdated = Date.now();

    await user.save();

    await logActivity({
        req,
        userId: user._id,
        action: 'PASSWORD_RESET_SUCCESS',
        module: 'Auth',
        metadata: { email: user.email }
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

/**
 * @desc    Refresh access token using refresh token
 * @route   POST /api/auth/refresh
 * @access  Public (uses refresh token cookie)
 */
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    console.log('[REFRESH] Cookie present:', refreshToken ? 'yes' : 'no');

    if (!refreshToken) {
      console.log('[REFRESH] No refresh token provided');
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided'
      });
    }

    // Hash the refresh token
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const hashPrefix = refreshTokenHash.substring(0, 6);
    console.log('[REFRESH] Hash prefix:', hashPrefix);

    // Find the session
    const session = await RefreshSession.findOne({ refreshTokenHash });

    if (!session) {
      console.log('[REFRESH] Session not found for hash:', hashPrefix);
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    console.log('[REFRESH] Session found - revokedAt:', session.revokedAt ? 'yes' : 'no', 'expiresAt:', session.expiresAt);

    // Check if session is revoked (REUSE DETECTION)
    if (session.revokedAt) {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      console.log('[REFRESH] Revoked session detected, revoking all sessions for user:', session.userId);
      
      // SECURITY: Revoke ALL sessions for this user
      await RefreshSession.updateMany(
        { userId: session.userId },
        { revokedAt: new Date() }
      );

      // Clear cookies with identical options (must match set options exactly)
      const authOptions = { ...getAuthCookieOptions(), expires: new Date(0) };
      const refreshOptions = { ...getRefreshCookieOptions(), expires: new Date(0) };
      res.cookie('token', '', authOptions);
      res.cookie('refreshToken', '', refreshOptions);
      console.log('[REFRESH] Cookies cleared - path:', authOptions.path, 'sameSite:', authOptions.sameSite, 'secure:', authOptions.secure);

      // Log the reuse attempt
      securityLogger.logRefreshReuseDetected(session.userId.toString(), ip, req);

      return res.status(401).json({
        success: false,
        message: 'Token reuse detected. All sessions have been revoked for security.'
      });
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      console.log('[REFRESH] Session expired');
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    }

    // Get user
    const user = await User.findById(session.userId).populate('shops');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Generate new tokens (rotation)
    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    // Revoke old session
    session.revokedAt = new Date();
    await session.save();

    // Create new session
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await RefreshSession.create({
      userId: user._id,
      refreshTokenHash: newRefreshTokenHash,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      expiresAt,
      ip,
      userAgent
    });

    // Set new cookies
    const authOptions = getAuthCookieOptions();
    const refreshOptions = getRefreshCookieOptions();

    res.cookie('token', newAccessToken, authOptions);
    res.cookie('refreshToken', newRefreshToken, refreshOptions);
    console.log('[REFRESH] New tokens set - path:', authOptions.path, 'sameSite:', authOptions.sameSite);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`
    });
  }
};

/**
 * @desc    Logout from all devices
 * @route   POST /api/auth/logout-all
 * @access  Private
 */
exports.logoutAll = async (req, res) => {
  try {
    const userId = req.user._id;

    // Revoke all refresh sessions
    const result = await RefreshSession.updateMany(
      { userId, revokedAt: null },
      { revokedAt: new Date() }
    );
    console.log('[LOGOUT-ALL] Revoked sessions - matched:', result.matchedCount, 'modified:', result.modifiedCount);

    // Clear cookies with identical options (must match set options exactly)
    const authOptions = { ...getAuthCookieOptions(), expires: new Date(0) };
    const refreshOptions = { ...getRefreshCookieOptions(), expires: new Date(0) };

    res.cookie('token', '', authOptions);
    res.cookie('refreshToken', '', refreshOptions);
    console.log('[LOGOUT-ALL] Cookies cleared - path:', authOptions.path, 'sameSite:', authOptions.sameSite, 'secure:', authOptions.secure);

    await logActivity({
      req,
      userId,
      action: 'LOGOUT_ALL_DEVICES',
      module: 'Auth',
      metadata: { email: req.user.email }
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out from all devices successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`
    });
  }
};

/**
 * @desc    Get all active sessions for current user
 * @route   GET /api/auth/sessions
 * @access  Private
 */
exports.getSessions = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentRefreshToken = req.cookies.refreshToken;
    let currentRefreshTokenHash = null;

    if (currentRefreshToken) {
      currentRefreshTokenHash = crypto.createHash('sha256').update(currentRefreshToken).digest('hex');
      console.log('[GET-SESSIONS] Current token hash prefix:', currentRefreshTokenHash.substring(0, 6));
    } else {
      console.log('[GET-SESSIONS] No current refresh token cookie');
    }

    // Get all active sessions
    const sessions = await RefreshSession.find({
      userId,
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    }).sort({ lastUsedAt: -1 });

    console.log('[GET-SESSIONS] Found', sessions.length, 'active sessions');

    // Mask IP and add isCurrent flag
    const maskedSessions = sessions.map(session => {
      const ipParts = session.ip.split('.');
      const maskedIp = ipParts.length === 4 
        ? `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.xxx`
        : session.ip.substring(0, session.ip.length - 3) + 'xxx';

      const isCurrent = session.refreshTokenHash === currentRefreshTokenHash;
      console.log('[GET-SESSIONS] Session', session._id, '- hash prefix:', session.refreshTokenHash.substring(0, 6), 'isCurrent:', isCurrent);

      return {
        id: session._id,
        createdAt: session.createdAt,
        lastUsedAt: session.lastUsedAt,
        ip: maskedIp,
        userAgent: session.userAgent,
        isCurrent: isCurrent
      };
    });

    return res.status(200).json({
      success: true,
      data: maskedSessions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`
    });
  }
};

/**
 * @desc    Revoke a specific session
 * @route   DELETE /api/auth/sessions/:id
 * @access  Private
 */
exports.revokeSession = async (req, res) => {
  try {
    const userId = req.user._id;
    const sessionId = req.params.id;
    const currentRefreshToken = req.cookies.refreshToken;

    // Find the session
    const session = await RefreshSession.findById(sessionId);

    if (!session) {
      console.log('[REVOKE] Session not found:', sessionId);
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Verify ownership
    if (!session.userId.equals(userId)) {
      console.log('[REVOKE] Ownership mismatch - session userId:', session.userId, 'request userId:', userId);
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to revoke this session'
      });
    }

    // Check if this is the current session
    let isCurrentSession = false;
    if (currentRefreshToken) {
      const currentRefreshTokenHash = crypto.createHash('sha256').update(currentRefreshToken).digest('hex');
      isCurrentSession = session.refreshTokenHash === currentRefreshTokenHash;
      console.log('[REVOKE] Current token hash prefix:', currentRefreshTokenHash.substring(0, 6), 'session hash prefix:', session.refreshTokenHash.substring(0, 6), 'isCurrent:', isCurrentSession);
    }

    // Revoke the session
    session.revokedAt = new Date();
    await session.save();
    console.log('[REVOKE] Session revoked - revokedAt set:', session.revokedAt);

    await logActivity({
      req,
      userId,
      action: 'SESSION_REVOKED',
      module: 'Auth',
      metadata: { sessionId, isCurrent: isCurrentSession }
    });

    // If revoking current session, clear cookies with identical options
    if (isCurrentSession) {
      const authOptions = { ...getAuthCookieOptions(), expires: new Date(0) };
      const refreshOptions = { ...getRefreshCookieOptions(), expires: new Date(0) };

      res.cookie('token', '', authOptions);
      res.cookie('refreshToken', '', refreshOptions);
      console.log('[REVOKE] Current session - cookies cleared - path:', authOptions.path, 'sameSite:', authOptions.sameSite);

      return res.status(200).json({
        success: true,
        message: 'Current session revoked. You have been logged out.',
        isCurrentSession: true
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Session revoked successfully',
      isCurrentSession: false
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`
    });
  }
};
