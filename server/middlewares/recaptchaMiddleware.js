const axios = require('axios');


const verifyRecaptcha = async (req, res, next) => {
  try {
    const { recaptchaToken } = req.body;

    // Check if token is provided
    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification is required.'
      });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    // Check if secret key is configured
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY is not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error.'
      });
    }

    // Verify token with Google's API
    const verificationURL = 'https://www.google.com/recaptcha/api/siteverify';
    
    // Create form data
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', recaptchaToken);
    
    const response = await axios.post(verificationURL, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { success, 'error-codes': errorCodes } = response.data;

    if (!success) {
      console.warn('reCAPTCHA verification failed:', errorCodes);
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.'
      });
    }

    // Token is valid, remove it from body and proceed
    delete req.body.recaptchaToken;
    next();

  } catch (error) {
    console.error('reCAPTCHA verification error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify reCAPTCHA. Please try again.'
    });
  }
};

module.exports = { verifyRecaptcha };
