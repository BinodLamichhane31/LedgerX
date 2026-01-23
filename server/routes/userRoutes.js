const express = require('express')
const { registerUser, loginUser, getProfile, updateProfile, changePassword, deleteAccount, logout, uploadProfileImage, selectShop, checkPasswordExpiration, googleOAuthInitiate, googleOAuthCallback, forgotPassword, resetPassword, verifyMFA, refreshToken, logoutAll, getSessions, revokeSession } = require('../controllers/authController')
const { registerValidation, loginValidation, changePasswordValidation, updateProfileValidation, resetPasswordValidation } = require('../validator/authValidator')
const validate = require('../middlewares/validate')
const loginLimiter = require('../middlewares/loginLimiter')
const { authLimiter, passwordResetLimiter, resetSubmitLimiter } = require('../middlewares/rateLimiter')
const { protect, authorize, protectTempToken } = require("../middlewares/authMiddleware");
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
router.post(
    "/mfa",
    protectTempToken, // Validates tempToken from Authorization header
    verifyMFA
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
  upload.processImage,  // SECURITY: Re-encode, resize, strip metadata
  uploadProfileImage
)


router.get(
  "/check-password-expiration",
  protect,
  checkPasswordExpiration
);

router.post(
  "/forgot-password",
  passwordResetLimiter,
  verifyRecaptcha,
  forgotPassword
);

router.put(
  "/reset-password/:resettoken",
  resetSubmitLimiter,
  resetPasswordValidation,
  validate,
  resetPassword
);

// Refresh token endpoint (public, uses refresh token cookie)
router.post("/refresh", refreshToken);

// Logout from all devices
router.post("/logout-all", protect, logoutAll);

// Session management
router.get("/sessions", protect, getSessions);
router.delete("/sessions/:id", protect, revokeSession);

module.exports = router