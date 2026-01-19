const { isPasswordExpired } = require('../utils/passwordUtils');


const checkPasswordExpiration = async (req, res, next) => {
  try {
    // Skip check if user is not authenticated
    if (!req.user) {
      return next();
    }

    const expirationDays = parseInt(process.env.PASSWORD_EXPIRATION_DAYS) || 90;
    
    if (isPasswordExpired(req.user.passwordLastUpdated, expirationDays)) {
      return res.status(403).json({
        success: false,
        message: "Your password has expired. Please change your password to continue.",
        passwordExpired: true
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`
    });
  }
};

module.exports = { checkPasswordExpiration };
