const express = require('express')
const { registerUser, loginUser, getProfile, updateProfile, changePassword, deleteAccount, logout, uploadProfileImage, viewProfileImage, selectShop, checkPasswordExpiration, googleOAuthInitiate, googleOAuthCallback, forgotPassword, resetPassword } = require('../controllers/authController')
const { registerValidation, loginValidation, changePasswordValidation, updateProfileValidation, resetPasswordValidation } = require('../validator/authValidator')
const validate = require('../middlewares/validate')
const loginLimiter = require('../middlewares/loginLimiter')
const { authLimiter, passwordResetLimiter } = require('../middlewares/rateLimiter')
const { protect } = require('../middlewares/authMiddleware')
const { verifyRecaptcha } = require('../middlewares/recaptchaMiddleware')
const upload = require('../middlewares/upload')
const router = express.Router()

router.post(
    "/register",
    verifyRecaptcha,
    registerValidation,
    validate,
    registerUser
)

const loginMiddleware = [
    authLimiter,
    verifyRecaptcha,
    loginValidation,
    validate
];

if (process.env.NODE_ENV !== 'test') {
    loginMiddleware.unshift(loginLimiter);
}

// Google OAuth
router.get("/google", googleOAuthInitiate);
router.get("/google/callback", googleOAuthCallback);

router.post(
    "/login",
    ...loginMiddleware, 
    loginUser
);
router.get(
    "/profile",
    protect,
    getProfile
)

router.put(
  "/profile",
  protect,
  updateProfileValidation,
  validate,
  updateProfile
);

router.put(
  "/change-password",
  protect,
  changePasswordValidation,
  validate,
  changePassword
);

router.delete(
  "/delete-account",
  protect,
  deleteAccount
);

router.post(
  "/logout",
  protect,
  logout
)

router.put(
  "/upload-profile-image",
  protect,
  upload.single('image'),
  uploadProfileImage
)
router.get(
  "/uploads/:filename", 
  viewProfileImage
);

router.get(
  "/check-password-expiration",
  protect,
  checkPasswordExpiration
);

router.post(
  "/forgot-password",
  passwordResetLimiter,
  forgotPassword
);

router.put(
  "/reset-password/:resettoken",
  resetPasswordValidation,
  validate,
  resetPassword
);

module.exports = router