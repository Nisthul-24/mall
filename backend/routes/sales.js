const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Record a sale
router.post('/', async (req, res) => {
    try {
        const { product_id, quantity_sold } = req.body;
        
        const product = await Product.findById(product_id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        
        if (product.quantity < quantity_sold) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }
        
        product.quantity -= quantity_sold;
        await product.save();
        
        const newSale = new Sale({ product_id, quantity_sold });
        const savedSale = await newSale.save();
        
        res.status(201).json(savedSale);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get sales by shop
router.get('/shop/:shopId', async (req, res) => {
    try {
        const products = await Product.find({ shop_id: req.params.shopId });
        const productIds = products.map(p => p._id);
        
        const sales = await Sale.find({ product_id: { $in: productIds } }).populate('product_id', 'name price');
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
