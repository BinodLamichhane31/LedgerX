const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { inventoryLimiter } = require('../middlewares/rateLimiter');
const { addSupplier, getSuppliersByShop, getSupplierById, updateSupplier, deleteSupplier } = require("../controllers/supplierController");
const router = express.Router()
router.use(inventoryLimiter);

router.post(
    "/",
    protect,
    addSupplier
)

router.get(
    '/',
    protect,
    getSuppliersByShop
)

router.get(
    '/:supplierId',
    protect,
    getSupplierById
)

router.put(
    '/:supplierId',
    protect,
    updateSupplier
)

router.delete(
    '/:supplierId',
    protect,
    deleteSupplier
)

module.exports = router