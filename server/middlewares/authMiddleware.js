const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshSession = require('../models/RefreshSession');
const crypto = require('crypto');

exports.protect = async (req, res, next) => {    
    const token = req.cookies.token;
    const refreshToken = req.cookies.refreshToken;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }
    try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

        const currentUser = await User.findById(decodedPayload.id).select('-password');

        if (!currentUser) {
            return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }

        if (!currentUser.isActive) {
            return res.status(403).json({ success: false, message: 'Forbidden: Account is disabled' });
        }

        // Check securityStamp - invalidate tokens issued before security-sensitive changes
        if (currentUser.securityStamp) {
            const tokenIssuedAt = decodedPayload.iat; // seconds
            const securityStampTime = Math.floor(currentUser.securityStamp.getTime() / 1000); // seconds
            
            if (tokenIssuedAt < securityStampTime) {
                // Log token invalidation
                const { logActivity } = require('../services/activityLogger');
                await logActivity({
                    req,
                    userId: currentUser._id,
                    action: 'TOKEN_INVALIDATED',
                    module: 'Auth',
                    metadata: { reason: 'Token issued before securityStamp' }
                });
                
                return res.status(401).json({ 
                    success: false, 
                    message: 'Session expired due to security update. Please login again.' 
                });
            }
        }

        // CRITICAL: Check if refresh session is revoked (immediate logout on revocation)
        if (refreshToken) {
            const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
            const session = await RefreshSession.findOne({ 
                refreshTokenHash, 
                userId: currentUser._id 
            });
            
            if (session && session.revokedAt) {
                console.log('[PROTECT] Revoked session detected for user:', currentUser._id);
                // Clear cookies
                const { getAuthCookieOptions, getRefreshCookieOptions } = require('../utils/cookieOptions');
                const authOptions = { ...getAuthCookieOptions(), expires: new Date(0) };
                const refreshOptions = { ...getRefreshCookieOptions(), expires: new Date(0) };
                res.cookie('token', '', authOptions);
                res.cookie('refreshToken', '', refreshOptions);
                
                return res.status(401).json({
                    success: false,
                    message: 'Session has been revoked. Please login again.'
                });
            }
        }

        req.user = currentUser;
        
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token failed'
        });
    }
};


exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: User role '${req.user.role}' is not authorized to access this route`
            });
        }
        next();
    };
};

// Middleware to protect MFA verification route (validates tempToken from Authorization header)
exports.protectTempToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided'
            });
        }

        const token = authHeader.split(' ')[1];
        
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verify this is a tempToken (has mfaPending flag)
        if (!decodedPayload.mfaPending) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type'
            });
        }

        const currentUser = await User.findById(decodedPayload.id).select('-password');

        if (!currentUser) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        if (!currentUser.isActive) {
            return res.status(403).json({ success: false, message: 'Account is disabled' });
        }

        req.user = currentUser;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, invalid token'
        });
    }
};