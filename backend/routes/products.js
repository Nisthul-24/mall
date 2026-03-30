const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const { shopOwnerAuth, auth } = require('../middleware/auth');

// Get all products (Public)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().populate('shop_id', 'name status');
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get products by shop (Public)
router.get('/shop/:shopId', async (req, res) => {
    try {
        const products = await Product.find({ shop_id: req.params.shopId });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create product
router.post('/', shopOwnerAuth, async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update product
router.put('/:id', shopOwnerAuth, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete product
router.delete('/:id', shopOwnerAuth, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rate product
router.post('/:id/rate', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const score = Number(req.body.score);
        if (score < 1 || score > 5 || isNaN(score)) {
            return res.status(400).json({ message: 'Score must be between 1 and 5' });
        }

        // Update or add rating
        const existingRating = product.ratings.find(r => r.user.toString() === req.user.id);
        if (existingRating) {
            existingRating.score = score;
        } else {
            product.ratings.push({ user: req.user.id, score });
        }

        // Calculate product average
        const totalScore = product.ratings.reduce((acc, item) => acc + item.score, 0);
        product.average_rating = Number((totalScore / product.ratings.length).toFixed(1));
        await product.save();

        // Update Shop's average rating dynamically
        const allShopProducts = await Product.find({ shop_id: product.shop_id });
        const ratedProducts = allShopProducts.filter(p => p.ratings.length > 0);
        
        let shopRating = 0;
        if (ratedProducts.length > 0) {
            const totalProjScore = ratedProducts.reduce((acc, p) => acc + p.average_rating, 0);
            shopRating = Number((totalProjScore / ratedProducts.length).toFixed(1));
        }

        await Shop.findByIdAndUpdate(product.shop_id, { rating: shopRating });

        res.json({ message: 'Review added/updated successfully', product });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
