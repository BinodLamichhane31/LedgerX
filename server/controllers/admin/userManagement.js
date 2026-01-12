const User = require("../../models/User");
const bcrypt = require("bcrypt");
const logger = require("../../utils/logger");

exports.createUser = async (req, res) => {
    const { fname, lname, email, phone, password } = req.body;
    try {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({ success: false, message: "This email is already used." });
        }

        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(409).json({ success: false, message: "This phone is already used." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ 
            fname, 
            lname, 
            email, 
            phone, 
            password: hashedPassword,
            passwordLastUpdated: Date.now(),
            passwordHistory: []
        });
        await newUser.save();

        logger.info("[%s] %s created a new user: %s", req.user?.role, req.user?.email, email);
        return res.status(201).json({ success: true, message: "New user added." });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", role, status } = req.query;

        const skip = (page - 1) * limit;
        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        const sortBy = { [sortField]: sortOrder };

        const searchQuery = {
            $or: [
                { fname: { $regex: search, $options: 'i' } },
                { lname: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        };

        if (role) {
            searchQuery.role = role;
        }

        if (status) {
             // status is passed as 'active' or 'inactive' from frontend
             if (status === 'active') searchQuery.isActive = true;
             if (status === 'inactive') searchQuery.isActive = false;
        }

        const totalUsers = await User.countDocuments(searchQuery);
        const users = await User.find(searchQuery)
            .sort(sortBy)
            .skip(skip)
            .limit(Number(limit))
            .select('-password');
        
        // logger.info("[%s] %s fetched all user", req.user?.role, req.user?.email);

        return res.status(200).json({
            success: true,
            message: "Users data fetched",
            data: users,
            pagination: {
                totalUsers,
                currentPage: Number(page),
                totalPages: Math.ceil(totalUsers / limit),
                limit: Number(limit)
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server Error"+error });
        
    }
};

exports.bulkDeleteUsers = async (req, res) => {
    try {
        const { userIds } = req.body; // Array of IDs

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ success: false, message: "No users selected for deletion." });
        }

        // Security: Filter out requester's own ID
        const filteredUserIds = userIds.filter(id => id !== req.user.id);
        
        if (filteredUserIds.length < userIds.length) {
             // Optional: Log attempting to delete self
             logger.warn("[%s] %s attempted to bulk delete self", req.user?.role, req.user?.email);
        }

        if (filteredUserIds.length === 0) {
            return res.status(400).json({ success: false, message: "Cannot delete your own account." });
        }

        const result = await User.deleteMany({ _id: { $in: filteredUserIds } });

        logger.info("[%s] %s bulk deleted %d users", req.user?.role, req.user?.email, result.deletedCount);

        return res.status(200).json({
            success: true,
            message: `${result.deletedCount} users deleted successfully.`
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};

exports.bulkToggleStatus = async (req, res) => {
    try {
        const { userIds, status } = req.body; // status: true (active) or false (inactive)

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
             return res.status(400).json({ success: false, message: "No users selected." });
        }
        
        if (typeof status !== 'boolean') {
             return res.status(400).json({ success: false, message: "Invalid status value." });
        }

        // Security: Filter out requester's own ID
        const filteredUserIds = userIds.filter(id => id !== req.user.id);

        if (filteredUserIds.length < userIds.length) {
            logger.warn("[%s] %s attempted to bulk change status of self", req.user?.role, req.user?.email);
        }

        if (filteredUserIds.length === 0) {
            return res.status(400).json({ success: false, message: "Cannot change status of your own account." });
        }

        const result = await User.updateMany(
            { _id: { $in: filteredUserIds } },
            { $set: { isActive: status } }
        );

        logger.info("[%s] %s bulk updated status for %d users to %s", req.user?.role, req.user?.email, result.modifiedCount, status);

        return res.status(200).json({
            success: true,
            message: `${result.modifiedCount} users updated successfully.`
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};

exports.getUserById = async (req,res) => {
    try {
        const user = await User.findById(req.params.id).select("-password")

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found."
            })
        }

        logger.info("[%s] %s viewed user with email: %s", req.user?.role, req.user?.email, req.params.email);

        return res.status(200).json({
            success: true,
            message: "User data fetched.",
            data: user
        })


        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal Server Error: "+error
        })
        
    }
}

exports.updateUserByAdmin = async (req, res) => {
  const { fname, lname, phone, role } = req.body;
  
  // Security: Prevent updating own role
  if (req.params.id === req.user.id) {
       if (role && role !== req.user.role) {
           return res.status(400).json({ success: false, message: "You cannot change your own role." });
       }
  }

  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { fname, lname, phone, role },
      { new: true, runValidators: true }
    ).select("-password");
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    logger.info("[%s] %s updated user: %s", req.user?.role, req.user?.email, updated.email);
    return res.status(200).json({
        success: true, 
        message: "User updated.", 
        data: updated 
    });
  } catch (error) {
    return res.status(500).json({
        success: false, 
        message: `Server error: ${error.message}` 
    });
  }
};

exports.deleteUserByAdmin = async (req, res) => {
  if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account." });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    logger.info("[%s] %s deleted user: %s", req.user?.role, req.user?.email, deletedUser.email);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

exports.toggleUserStatus = async (req,res) =>{
    if (req.params.id === req.user.id) {
        return res.status(400).json({ success: false, message: "You cannot change the status of your own account." });
    }

    try {
        const user = await User.findById(req.params.id)
        if(!user){
            return res.status(404).json({
                success:false,
                message: "User not found."
            })
        }

        user.isActive = !user.isActive
        await user.save();

        logger.info("[%s] %s toggled user %s status to: %s", req.user?.role, req.user?.email, user.email, user.isActive ? "active" : "inactive");

        return res.status(200).json({
            success: true, 
            message: `User ${user.isActive ? "enabled" : "disabled"}.` 
        });

        
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: `Server error: ${error.message}` 
        });
        
    }

}



exports.getUserGrowthStats = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const stats = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Fill in missing dates with 0 counts
        const filledStats = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            const dateString = date.toISOString().split('T')[0];
            
            const found = stats.find(s => s._id === dateString);
            filledStats.push({
                date: dateString,
                users: found ? found.count : 0
            });
        }

        return res.status(200).json({
            success: true,
            data: filledStats
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error: " + error.message
        });
    }
};
