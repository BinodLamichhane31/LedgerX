const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Payment = require('../models/Payment');

exports.initiateSubscriptionPayment = async (req, res) => {
    try {
        const { plan } = req.body;
        
        // Validate environment variables
        if (!process.env.KHALTI_SECRET_KEY) {
            console.error('KHALTI_SECRET_KEY is not configured');
            return res.status(500).json({
                success: false,
                message: 'Payment system is not configured. Please contact support.'
            });
        }
        
        if (!process.env.CLIENT_WEB_URL) {
            console.error('CLIENT_WEB_URL is not configured');
            return res.status(500).json({
                success: false,
                message: 'Payment system is not configured. Please contact support.'
            });
        }
        
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

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
        const purchase_order_name = `LedgerX ${plan} Subscription`;

        const payment = await Payment.create({
            user: user._id,
            transactionUUID,
            productCode: plan,
            amount: amountNpr,
            paymentMethod: 'KHALTI',
            status: 'PENDING'
        });

        const payload = {
            return_url: `${process.env.CLIENT_WEB_URL}/payment/success`,
            website_url: process.env.CLIENT_WEB_URL,
            amount: amountPaisa,
            purchase_order_id: purchase_order_id,
            purchase_order_name: purchase_order_name,
            customer_info: {
                name: `${user.fname} ${user.lname}`.substring(0, 100), // Max 100 chars
                email: user.email.substring(0, 50), // Max 50 chars
                phone: (user.phone || '9800000000').replace(/[^0-9]/g, '').substring(0, 16) // Max 16 chars, numbers only
            }
        };

        console.log('Initiating Khalti payment for user:', user.email, 'Plan:', plan);
        
        const khaltiResponse = await axios.post(
            process.env.KHALTI_INITIATE_URL || 'https://a.khalti.com/api/v2/epayment/initiate/',
            payload,
            {
                headers: {
                    'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000 // 10 second timeout
            }
        );

        if (khaltiResponse.data && khaltiResponse.data.pidx) {
            payment.khaltiPidx = khaltiResponse.data.pidx;
            await payment.save();
            
            console.log('Payment initiated successfully. PIDX:', khaltiResponse.data.pidx);

            res.status(200).json({
                success: true,
                message: "Payment initiated.",
                payment_url: khaltiResponse.data.payment_url,
                pidx: khaltiResponse.data.pidx
            });
        } else {
            console.error('Khalti response missing pidx:', khaltiResponse.data);
            throw new Error('Invalid response from payment gateway');
        }

    } catch (error) {
        console.error('Payment initiation error:', error.response?.data || error.message);
        
        // Provide user-friendly error messages
        let errorMessage = 'Failed to initiate payment. Please try again.';
        
        if (error.response?.data) {
            // Khalti API error
            errorMessage = error.response.data.detail || error.response.data.message || errorMessage;
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Payment gateway timeout. Please try again.';
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            errorMessage = 'Cannot connect to payment gateway. Please try again later.';
        }
        
        res.status(500).json({ 
            success: false, 
            message: errorMessage
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
        
        // Validate environment variable
        if (!process.env.KHALTI_SECRET_KEY) {
            console.error('KHALTI_SECRET_KEY is not configured');
            return res.status(500).json({
                success: false,
                message: 'Payment system is not configured. Please contact support.'
            });
        }

        const paymentRecord = await Payment.findOne({ khaltiPidx: pidx });
        
        if (!paymentRecord) {
            return res.status(404).json({ 
                success: false, 
                message: 'Payment record not found.' 
            });
        }
        
        // Prevent duplicate verification
        if (paymentRecord.status === 'COMPLETE') {
            return res.status(400).json({
                success: false,
                message: 'This payment has already been verified.'
            });
        }
        
        // Verify the payment belongs to the requesting user
        if (paymentRecord.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized access to payment record.'
            });
        }

        console.log('Verifying payment for user:', req.user.email, 'PIDX:', pidx);
        
        const khaltiResponse = await axios.post(
            process.env.KHALTI_LOOKUP_URL || 'https://a.khalti.com/api/v2/epayment/lookup/',
            { pidx },
            {
                headers: {
                    'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000 // 10 second timeout
            }
        );

        const { status, total_amount, transaction_id } = khaltiResponse.data;
        
        // Verify amount matches
        const expectedAmount = paymentRecord.amount * 100; // Convert to paisa
        if (total_amount !== expectedAmount) {
            console.error('Amount mismatch. Expected:', expectedAmount, 'Received:', total_amount);
            return res.status(400).json({
                success: false,
                message: 'Payment amount mismatch. Please contact support.'
            });
        }

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

            console.log('Payment verification successful:', user.email, 'Plan:', paymentRecord.productCode);

            res.status(200).json({
                success: true,
                message: `Successfully upgraded to ${paymentRecord.productCode} plan.`,
                plan: user.subscription.plan
            });
        } else {
             // Handle Failed/Pending/etc
             const statusMap = {
                 'Pending': 'PENDING',
                 'Refunded': 'REFUNDED',
                 'Expired': 'EXPIRED',
                 'User canceled': 'CANCELLED'
             };
             
             paymentRecord.status = statusMap[status] || status.toUpperCase();
             await paymentRecord.save();
             
             console.log('Payment verification failed. Status:', status, 'User:', req.user.email);
             
             res.status(400).json({
                success: false,
                message: `Payment ${status.toLowerCase()}. Please try again or contact support.`
             });
        }

    } catch (error) {
        console.error('Payment verification error:', error.response?.data || error.message);
        
        let errorMessage = 'Failed to verify payment. Please try again.';
        
        if (error.response?.data) {
            errorMessage = error.response.data.detail || error.response.data.message || errorMessage;
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Payment gateway timeout. Please try again.';
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            errorMessage = 'Cannot connect to payment gateway. Please try again later.';
        }
        
        res.status(500).json({ 
            success: false, 
            message: errorMessage
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
