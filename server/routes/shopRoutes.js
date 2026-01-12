const express = require('express')
const { protect } = require("../middlewares/authMiddleware");
const { inventoryLimiter } = require('../middlewares/rateLimiter');
const { createShop, getShops, getShopById, updateShop, deleteShop } = require('../controllers/shopController')
const { switchShop } = require('../controllers/authController')
const { getTransactions } = require('../controllers/saleController')
const router = express.Router();
router.use(inventoryLimiter);

router.post(
    "/",
    protect,
    createShop
)

router.get(
    '/',
    protect,
    getShops
)

router.get(
    '/:id',
    protect,
    getShopById
)

router.put(
    '/:id',
    protect,
    updateShop
)

router.delete(
    '/:id',
    protect,
    deleteShop
)

router.post(
  "/select-shop",
  protect,
  switchShop
);



module.exports = router