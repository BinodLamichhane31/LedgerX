const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { setupMFA, verifySetup, disableMFA } = require("../controllers/mfaController");
const { verifyMFA } = require("../controllers/authController");
const { mfaLimiter } = require("../middlewares/rateLimiter");
const router = express.Router();

router.post("/setup", mfaLimiter, protect, setupMFA);
router.post("/verify-setup", mfaLimiter, protect, verifySetup);
router.post("/disable", mfaLimiter, protect, disableMFA);

router.post("/verify", mfaLimiter, protect, verifyMFA);

module.exports = router;
