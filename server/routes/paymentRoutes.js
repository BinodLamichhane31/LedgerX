const { initiateSubscriptionPayment, verifySubscriptionPayment, getPaymentHistory } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');
const express = require('express');


const router = express.Router();


router.get('/history', protect, getPaymentHistory);
router.post('/initiate-subscription', protect,initiateSubscriptionPayment);
router.post('/verify-subscription', protect,verifySubscriptionPayment);

module.exports = router;