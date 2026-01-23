const Payment = require('../../models/Payment');
const moment = require('moment');

exports.getRevenueStats = async (req, res) => {
    try {
        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'COMPLETE' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalAmount = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

        // Monthly Revenue (Last 6 Months)
        const sixMonthsAgo = moment().subtract(5, 'months').startOf('month').toDate();
        
        const monthlyRevenue = await Payment.aggregate([
            { 
                $match: { 
                    status: 'COMPLETE',
                    createdAt: { $gte: sixMonthsAgo }
                } 
            },
            {
                $group: {
                    _id: { $month: "$createdAt" }, // Groups by month number (1-12)
                    year: { $first: { $year: "$createdAt" } },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { "year": 1, "_id": 1 } }
        ]);

        // Format for frontend
        const formattedMonthlyResponse = monthlyRevenue.map(item => {
             // Create a date object to get the month name
            const date = new Date(item.year, item._id - 1); 
            return {
                name: date.toLocaleString('default', { month: 'short' }),
                total: item.total
            };
        });

        res.status(200).json({
            success: true,
            totalRevenue: totalAmount,
            monthlyRevenue: formattedMonthlyResponse
        });

    } catch (error) {
        console.error('Error fetching revenue stats:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
