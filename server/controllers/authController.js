const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const Shop = require("../models/Shop");
const { checkPasswordHistory, addToPasswordHistory, isPasswordExpired } = require("../utils/passwordUtils");
const securityLogger = require("../utils/securityLogger");
const { logActivity } = require("../services/activityLogger");
const { matchedData } = require("express-validator");

const sendTokenToResponse = async (user, statusCode, res, currentShop, req) =>{
  const token = jwt.sign({id: user._id, role: user.role},process.env.JWT_SECRET,{
    expiresIn:process.env.JWT_EXPIRE
  })
  const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true, 
    };

  if(process.env.NODE_ENV=="production"){
    options.secure = true
  }

  const userResponse = { ...user.toObject() };
  delete userResponse.password;

  // Log successful login
  await logActivity({
      req,
      userId: user._id,
      action: 'LOGIN_SUCCESS',
      module: 'Auth',
      metadata: { email: user.email, role: user.role }
  });

  res.status(statusCode)
    .cookie('token',token,options)
    .json({
      success:true,
      message:"Login successful.",
      data: {
        user: {
          id: user._id,
          fname: user.fname,
          lname: user.lname,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        shops: user.shops,
        currentShopId : currentShop ? currentShop._id : null
      }
    })

}


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
 * @desc    Authenticate user and generate token (login)
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
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

    if(getUser.role === 'admin'){
      await sendTokenToResponse(getUser, 200, res, null, req)
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
    await user.save();

    securityLogger.logPasswordChangeAttempt(userId.toString(), user.email, true);

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
    res.cookie('token', 'none', {
        expires: new Date(0),
        httpOnly: true,
    });
    res.status(200).json({ success: true, message: "Logged out." });
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
        metadata: { filename: req.file.filename }
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

  if (!fs.existsSync(imagePath)) {

    
    return res.status(404).json({ 
      success: false,
      message: "Image not found.", 
    });
  }

  return res.sendFile(imagePath);
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
