const rateLimit = require('express-rate-limit');

exports.globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    handler: (req, res, next) => {
        res.status(429).json({ success: false, message: 'Too many requests. Please try again after 15 minutes.' });
    },
    standardHeaders: true,
    legacyHeaders: false,   
})
