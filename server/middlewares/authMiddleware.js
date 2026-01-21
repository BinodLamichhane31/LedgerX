const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

exports.protect = async (req, res, next) => {    
    const token = req.cookies.token;

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

        if (currentUser.passwordLastUpdated) {
            const tokenIssuedAt = decodedPayload.iat; // seconds
            const passwordUpdated = Math.floor(currentUser.passwordLastUpdated.getTime() / 1000); // seconds
            
            if (passwordUpdated > tokenIssuedAt) {
                return res.status(401).json({ success: false, message: 'Password recently changed. Please login again.' });
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