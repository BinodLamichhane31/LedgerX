const Product = require('../models/Product');
const { logActivity } = require('../services/activityLogger');
const Shop = require('../models/Shop');
const path = require('path');
const fs = require("fs");
const { deleteFromCloudinary } = require("../utils/cloudinary");


const verifyShopOwner = async (shopId, userId) => {
    const shop = await Shop.findById(shopId);
    if (!shop) {
        return { error: 'Shop not found.', status: 404 };
    }
    if (shop.owner.toString() !== userId.toString()) {
        return { error: 'You are not authorized to manage products for this shop.', status: 403 };
    }
    return { shop };
};

exports.addProduct = async (req, res) => {
    try {
        
        const { name, sellingPrice, purchasePrice, quantity, category, description, reorderLevel, shopId } = req.body;
        const userId = req.user._id;

        const { error, status, shop } = await verifyShopOwner(shopId, userId);
        if (error) {
            return res.status(status).json({ success: false, message: error });
        }

        const newProduct = new Product({
            name,
            sellingPrice,
            purchasePrice,
            quantity,
            category,
            description,
            reorderLevel,
            shopId: shopId,
        });

         if (req.file) {
            newProduct.image = req.file.cloudinaryUrl;
            newProduct.imageId = req.file.cloudinaryPublicId;
        }

        await newProduct.save();

        await logActivity({
            req,
            userId,
            action: 'PRODUCT_CREATE',
            module: 'Product',
            metadata: { productId: newProduct._id, name, shopId }
        });

        res.status(201).json({
            success: true,
            message: 'Product added successfully.',
            data: newProduct,
        });

    } catch (error) {
        if (req.file && req.file.cloudinaryPublicId) {
             await deleteFromCloudinary(req.file.cloudinaryPublicId);
        }
        res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
    }
};

exports.getProductsByShop = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", shopId } = req.query;
        const userId = req.user._id;

        const { error, status } = await verifyShopOwner(shopId, userId);
        if (error) {
            return res.status(status).json({ success: false, message: error });
        }

        const skip = (page - 1) * limit;
        const searchQuery = {
            shopId: shopId,
            name: { $regex: search, $options: 'i' },
        };

        const totalProducts = await Product.countDocuments(searchQuery);
        const products = await Product.find(searchQuery)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                totalProducts,
                currentPage: Number(page),
                totalPages: Math.ceil(totalProducts / limit),
            },
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const { error, status } = await verifyShopOwner(product.shopId, req.user._id);
        if (error) {
            return res.status(status).json({ success: false, message: error });
        }

        res.status(200).json({ success: true, data: product });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const updates = req.body;
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const { error, status } = await verifyShopOwner(product.shopId, req.user._id);
        if (error) {
            if (req.file && req.file.cloudinaryPublicId) {
                await deleteFromCloudinary(req.file.cloudinaryPublicId);
            }
            return res.status(status).json({ success: false, message: error });
        }
        delete updates._id; 
        delete updates.shopId;

        if (req.file) {
            if (product.imageId) {
                await deleteFromCloudinary(product.imageId);
            }
            updates.image = req.file.cloudinaryUrl;
            updates.imageId = req.file.cloudinaryPublicId;
        }

        const updatedProduct = await Product.findByIdAndUpdate(productId, { $set: updates }, { new: true, runValidators: true });

        await logActivity({
            req,
            userId: req.user._id,
            action: 'PRODUCT_UPDATE',
            module: 'Product',
            metadata: { productId: product._id, updates }
        });

        res.status(200).json({
            success: true,
            message: 'Product updated successfully.',
            data: updatedProduct,
        });

    } catch (error) {
        if (req.file && req.file.cloudinaryPublicId) {
             await deleteFromCloudinary(req.file.cloudinaryPublicId);
        }
        res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const { error, status } = await verifyShopOwner(product.shopId, req.user._id);
        if (error) {
            return res.status(status).json({ success: false, message: error });
        }

        
        

        if (product.imageId) {
            await deleteFromCloudinary(product.imageId);
        }
        
        await Product.findByIdAndDelete(productId);

        await logActivity({
            req,
            userId: req.user._id,
            action: 'PRODUCT_DELETE',
            module: 'Product',
            metadata: { productId, name: product.name }
        });

        res.status(200).json({ success: true, message: 'Product deleted successfully.' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
    }
};