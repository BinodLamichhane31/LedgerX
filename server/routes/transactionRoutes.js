const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { transactionLimiter } = require('../middlewares/rateLimiter');
const { createTransaction, getTransactions, getTransactionById } = require("../controllers/transactionController");
const router = express.Router()
router.use(transactionLimiter);

router.post(
    '/',
    protect,
    createTransaction
)

router.get(
    '/',
    protect,
    getTransactions
)

router.get(
    '/:id',
    protect,
    getTransactionById
)

module.exports = router;