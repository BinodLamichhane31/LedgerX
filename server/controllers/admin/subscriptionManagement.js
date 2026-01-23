const User = require('../../models/User');

exports.getAllSubscriptions = async (req, res) => {
    try {
        const users = await User.find({})
            .select('fname lname email subscription')
            .sort({ 'subscription.updatedAt': -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateUserSubscription = async (req, res) => {
    try {
        const { plan, status } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (plan) {
            if (!['FREE', 'BASIC', 'PRO'].includes(plan)) {
                return res.status(400).json({ success: false, message: 'Invalid plan' });
            }
            user.subscription.plan = plan;
        }

        if (status) {
            if (!['ACTIVE', 'INACTIVE', 'EXPIRED'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }
            user.subscription.status = status;
        }
        
    
        await user.save();

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
