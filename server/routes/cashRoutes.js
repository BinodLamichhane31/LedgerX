const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { transactionLimiter } = require('../middlewares/rateLimiter');
const { recordCashIn, recordCashOut } = require("../controllers/cashController");
const router = express.Router()
router.use(transactionLimiter);

router.post(
    "/in",
    protect,
    recordCashIn
)

router.post(
    "/out",
    protect,
    recordCashOut
)

module.exports = router