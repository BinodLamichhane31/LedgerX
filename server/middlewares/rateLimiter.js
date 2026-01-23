const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message, keyGenerator) => {
    return rateLimit({
        windowMs,
        max,
        message,
        handler: (req, res, next) => {
            res.status(429).json({ success: false, message: message || 'Too many requests. Please try again later.' });
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: keyGenerator || ((req) => req.ip),
    });
};

exports.globalLimiter = createLimiter(
    15 * 60 * 1000, 
    300, 
    'Too many requests from this IP, please try again after 15 minutes.'
);

exports.authLimiter = createLimiter(
    15 * 60 * 1000,
    5,
    'Too many login attempts. Please try again after 15 minutes.',
    (req) => `${req.ip}_${req.body.email || ''}`
);

exports.transactionLimiter = createLimiter(
    10 * 60 * 1000,
    100,
    'Transaction limit exceeded. Please try again after 10 minutes.',
    (req) => req.user ? req.user._id.toString() : req.ip
);

exports.inventoryLimiter = createLimiter(
    10 * 60 * 1000,
    120,
    'Inventory operation limit exceeded. Please try again after 10 minutes.',
    (req) => req.user ? req.user._id.toString() : req.ip
);

exports.reportLimiter = createLimiter(
    10 * 60 * 1000,
    20,
    'Report generation limit exceeded. Please try again after 10 minutes.',
    (req) => req.user ? req.user._id.toString() : req.ip
);

exports.adminLimiter = createLimiter(
    15 * 60 * 1000,
    300,
    'Admin API limit exceeded. Please try again after 15 minutes.',
    (req) => req.user ? req.user._id.toString() : req.ip
);

exports.passwordResetLimiter = createLimiter(
    15 * 60 * 1000,
    3,
    'Too many password reset emails sent. Please try again after 15 minutes.',
    (req) => req.body.email || req.ip
);

exports.resetSubmitLimiter = createLimiter(
    60 * 60 * 1000, // 1 hour
    5,
    'Too many password reset attempts. Please try again after an hour.',
    (req) => req.ip // Rate limit by IP for safety
);

exports.mfaLimiter = createLimiter(
    15 * 60 * 1000,
    5,
    'Too many 2FA attempts. Please try again after 15 minutes.',
    (req) => req.user ? req.user._id.toString() : req.ip
);

exports.paymentLimiter = createLimiter(
    15 * 60 * 1000,
    5,
    'Too many payment attempts. Please try again after 15 minutes.',
    (req) => req.user ? req.user._id.toString() : req.ip
);
