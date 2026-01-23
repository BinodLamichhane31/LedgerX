const { initiateSubscriptionPayment, verifySubscriptionPayment, getPaymentHistory } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');
const express = require('express');


const router = express.Router();


const { paymentLimiter } = require('../middlewares/rateLimiter');

router.get('/history', protect, getPaymentHistory);
router.post('/initiate-subscription', protect, paymentLimiter, initiateSubscriptionPayment);
router.post('/verify-subscription', protect, paymentLimiter, verifySubscriptionPayment);

module.exports = router;