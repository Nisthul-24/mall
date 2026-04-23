const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// Get user wishlist
router.get('/', auth, async (req, res) => {
    try {
        const query = `
            SELECT w.id AS wishlist_id, p.* 
            FROM wishlists w 
            JOIN products p ON w.product_id = p.id 
            WHERE w.user_id = $1
        `;
        const { rows } = await pool.query(query, [req.user.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add to wishlist
router.post('/:productId', auth, async (req, res) => {
    try {
        // Check if already in wishlist
        const check = await pool.query('SELECT * FROM wishlists WHERE user_id = $1 AND product_id = $2', [req.user.id, req.params.productId]);
        if (check.rows.length > 0) return res.status(400).json({ message: 'Item already in wishlist' });

        const query = 'INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2) RETURNING *';
        const { rows } = await pool.query(query, [req.user.id, req.params.productId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Remove from wishlist
router.delete('/:productId', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2', [req.user.id, req.params.productId]);
        res.json({ message: 'Removed from wishlist' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
