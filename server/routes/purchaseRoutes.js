const express = require('express');

const { protect, authorize } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { transactionLimiter } = require('../middlewares/rateLimiter');
const { createPurchase, getPurchases, cancelPurchase, recordPaymentForPurchase, getPurchaseById } = require('../controllers/purchaseController');

const router = express.Router();
router.use(transactionLimiter);

router.post(
    "/",
    protect,
    createPurchase
)

router.get(
    "/",
    protect,
    getPurchases
)
router.get('/:id',protect,getPurchaseById)
router.put('/:id/cancel', protect,cancelPurchase); 
router.put('/:id/payment', protect,recordPaymentForPurchase);


module.exports = router;