const express = require('express')
const { route } = require('../userRoutes')
const { createUser, getAllUsers, updateUserByAdmin, deleteUserByAdmin, toggleUserStatus, getUserById, getUserGrowthStats, bulkDeleteUsers, bulkToggleStatus } = require('../../controllers/admin/userManagement')
const { getActivityLogs, getLogModules } = require("../../controllers/admin/activityLogController");
const { registerValidation } = require('../../validator/authValidator')
const validate = require('../../middlewares/validate')
const { protect, authorize } = require('../../middlewares/authMiddleware');
const { adminLimiter } = require('../../middlewares/rateLimiter');
const router = express.Router();
router.use(adminLimiter);

// System Logs (Winston)
// Assuming 'getLogs' is a controller function and 'admin' is a middleware like authorize('admin')
// For now, I'll use authorize('admin') for consistency with existing routes.
// If 'getLogs' is not defined, this line will cause an error. I'll comment it out or assume it needs to be imported.
// router.get("/logs", protect, authorize('admin'), getLogs);

// Activity Logs (Audit)
router.get("/activity-logs", protect, authorize('admin'), getActivityLogs);
router.get("/activity-logs/modules", protect, authorize('admin'), getLogModules);

router.post(
    '/users',
    protect,
    authorize('admin'),
    registerValidation,
    validate,
    createUser
)

router.get(
    '/users',
    protect,
    authorize('admin'),
    getAllUsers
)

router.get(
    '/users/:id',
    protect,
    authorize('admin'),
    getUserById
)

router.put(
    '/users/:id',
    protect,
    authorize('admin'),
    updateUserByAdmin
)

router.delete(
    '/users/:id',
    protect,
    authorize('admin'),
    deleteUserByAdmin
)

router.patch(
    '/users/:id/status',
    protect,
    authorize('admin'),
    toggleUserStatus
)

router.post(
    '/users/bulk-delete',
    protect,
    authorize('admin'),
    bulkDeleteUsers
)

router.patch(
    '/users/bulk-status',
    protect,
    authorize('admin'),
    bulkToggleStatus
)

router.get(
    '/stats/user-growth',
    protect,
    authorize('admin'),
    getUserGrowthStats
)

module.exports = router