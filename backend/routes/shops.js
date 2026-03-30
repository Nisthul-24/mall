const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const { adminAuth, shopOwnerAuth, auth } = require('../middleware/auth');

// Get all shops (Public)
router.get('/', async (req, res) => {
    try {
        const shops = await Shop.find().populate('owner_id', 'name email');
        res.json(shops);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get shop by owner (Protected by auth)
router.get('/owner/:ownerId', auth, async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner_id: req.params.ownerId });
        res.json(shop);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create shop (Admin only)
router.post('/', adminAuth, async (req, res) => {
    try {
        const newShop = new Shop(req.body);
        const savedShop = await newShop.save();
        res.status(201).json(savedShop);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update shop (Admin and Shop Owner)
router.put('/:id', shopOwnerAuth, async (req, res) => {
    try {
        const updatedShop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedShop);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete shop (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        await Shop.findByIdAndDelete(req.params.id);
        res.json({ message: 'Shop deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
