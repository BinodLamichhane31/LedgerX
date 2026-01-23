const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Payment = require('../models/Payment');

exports.initiateSubscriptionPayment = async (req, res) => {
    try {
        const { plan } = req.body;
        const user = await User.findById(req.user._id);

        if (!['BASIC', 'PRO'].includes(plan)) {
            return res.status(400).json({
                success: false,
                message: "Invalid plan selected. Choose 'BASIC' or 'PRO'."
            });
        }

        if (user.subscription.plan === plan && user.subscription.status === 'ACTIVE') {
            return res.status(400).json({ 
                success: false, 
                message: `You are already on the ${plan} plan.` 
            });
        }

        const transactionUUID = uuidv4();
        // Amount in Paisa (1 NPR = 100 Paisa)
        // Basic: 500 NPR = 50000 Paisa
        // Pro: 1000 NPR = 100000 Paisa
        const amountNpr = plan === 'BASIC' ? 500 : 1000;
        const amountPaisa = amountNpr * 100;
        
        const purchase_order_id = transactionUUID;
        const purchase_order_name = `Ledger X ${plan} Subscription`;

        const payment = await Payment.create({
            user: user._id,
            transactionUUID,
            productCode: plan,
            amount: amountNpr,
            status: 'PENDING'
        });

        const payload = {
            return_url: `${process.env.CLIENT_WEB_URL}/payment/success`,
            website_url: process.env.CLIENT_WEB_URL,
            amount: amountPaisa,
            purchase_order_id: purchase_order_id,
            purchase_order_name: purchase_order_name,
            customer_info: {
                name: `${user.fname} ${user.lname}`,
                email: user.email,
                phone: user.phone || '9800000000'
            }
        };

        const khaltiResponse = await axios.post(
            'https://a.khalti.com/api/v2/epayment/initiate/',
            payload,
            {
                headers: {
                    'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        if (khaltiResponse.data) {
            payment.khaltiPidx = khaltiResponse.data.pidx;
            await payment.save();

            res.status(200).json({
                success: true,
                message: "Payment initiated.",
                payment_url: khaltiResponse.data.payment_url,
                pidx: khaltiResponse.data.pidx
            });
        } else {
            throw new Error('Failed to initiate payment with Khalti');
        }

    } catch (error) {
        console.error('Payment initiation error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error: ' + (error.response?.data?.detail || error.message) 
        });
    }
};

exports.verifySubscriptionPayment = async (req, res) => {
    try {
        const { pidx } = req.body;

        if (!pidx) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing pidx for verification.' 
            });
        }

        const paymentRecord = await Payment.findOne({ khaltiPidx: pidx });
        
        if (!paymentRecord) {
            return res.status(404).json({ 
                success: false, 
                message: 'Payment record not found.' 
            });
        }

        const khaltiResponse = await axios.post(
            'https://a.khalti.com/api/v2/epayment/lookup/',
            { pidx },
            {
                headers: {
                    'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        const { status, total_amount, transaction_id } = khaltiResponse.data;

        if (status === 'Completed') {
            const user = await User.findById(paymentRecord.user);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }

            // Update User Subscription
            user.subscription.plan = paymentRecord.productCode; // 'BASIC' or 'PRO'
            user.subscription.status = 'ACTIVE';
            user.subscription.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 Year
            await user.save();

            // Update Payment Record
            paymentRecord.status = 'COMPLETE';
            paymentRecord.khaltiTransactionId = transaction_id;
            await paymentRecord.save();

            console.log('Payment verification successful:', user.email);

            res.status(200).json({
                success: true,
                message: `Successfully upgraded to ${paymentRecord.productCode} plan.`,
                plan: user.subscription.plan
            });
        } else {
             // Handle Failed/Pending/etc
             paymentRecord.status = status.toUpperCase(); // REFUNDED, EXPIRED, etc.
             await paymentRecord.save();
             
             res.status(400).json({
                success: false,
                message: 'Payment verification failed. Status: ' + status
             });
        }

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error: ' + error.message 
        });
    }
};

exports.getPaymentHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getUserPaymentHistoryByAdmin = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.params.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Error fetching user payment history:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
