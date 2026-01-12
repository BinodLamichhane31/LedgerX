const ActivityLog = require("../../models/ActivityLog");
// const User = require("../../models/User"); // Not needed if we populate

exports.getActivityLogs = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search = "", 
            action, 
            module, 
            startDate, 
            endDate,
            userId 
        } = req.query;

        const query = {};

        // Filter by Action
        if (action) {
            query.action = action;
        }

        // Filter by Module
        if (module) {
            query.module = module;
        }

        // Filter by User ID (Exact match)
        if (userId) {
            query.user_id = userId;
        }

        // Filter by Date Range
        if (startDate || endDate) {
            query.created_at = {};
            if (startDate) query.created_at.$gte = new Date(startDate);
            if (endDate) query.created_at.$lte = new Date(endDate);
        }

        // Search by User Email or Name (Requires lookup or populate filtering)
        // Since ActivityLog stores user_id, a simple regex on fields in ActivityLog isn't enough for user name search.
        // We can rely on frontend sending a userId from a user search dropdown, 
        // OR we can perform a look-up. For simplicity/performance now, we'll support searching 
        // metadata (which might contain emails) or IP address.
        if (search) {
            query.$or = [
                { 'metadata.email': { $regex: search, $options: 'i' } },
                { 'metadata.reason': { $regex: search, $options: 'i' } },
                { ip_address: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sort = { created_at: -1 };

        const [logs, totalToals] = await Promise.all([
            ActivityLog.find(query)
                .populate('user_id', 'fname lname email role')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            ActivityLog.countDocuments(query)
        ]);

        return res.status(200).json({
            success: true,
            message: "Activity logs fetched successfully.",
            data: logs,
            pagination: {
                totalRecords: totalToals,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalToals / parseInt(limit)),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: "Server Error: " + error.message 
        });
    }
};

exports.getLogModules = async (req, res) => {
    try {
        // Get unique list of modules and actions for filter dropdowns
        const modules = await ActivityLog.distinct('module');
        const actions = await ActivityLog.distinct('action');

        return res.status(200).json({
            success: true,
            data: {
                modules,
                actions
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
