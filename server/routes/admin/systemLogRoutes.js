const express = require('express')
const { getLogs } = require('../../controllers/admin/systemLogController')
const { protect, authorize } = require('../../middlewares/authMiddleware');
const { adminLimiter } = require('../../middlewares/rateLimiter');
const router = express.Router();
router.use(adminLimiter);

router.get(
    '/logs',
    protect,
    authorize('admin'),
    getLogs
)

module.exports = router

