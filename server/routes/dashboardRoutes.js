const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { dashboardLimiter } = require('../middlewares/rateLimiter');
const { getDashboardStats, getChartData } = require("../controllers/dashboardController");
const router = express.Router();
router.use(dashboardLimiter);
router.get(
    '/stats',
    protect,
    getDashboardStats
)

router.get(
    '/chart',
    protect,
    getChartData
)
module.exports = router
