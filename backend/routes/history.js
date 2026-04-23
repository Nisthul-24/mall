const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// Get recently viewed items
router.get('/', auth, async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT ON (rv.product_id) p.*, rv.viewed_at 
            FROM recently_viewed rv 
            JOIN products p ON rv.product_id = p.id 
            WHERE rv.user_id = $1 
            ORDER BY rv.product_id, rv.viewed_at DESC 
            LIMIT 10
        `;
        const { rows } = await pool.query(query, [req.user.id]);
        
        // Final sort by viewed_at because DISTINCT ON requires order by prefix
        rows.sort((a, b) => new Date(b.viewed_at) - new Date(a.viewed_at));
        
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add to recently viewed
router.post('/:productId', auth, async (req, res) => {
    try {
        const query = 'INSERT INTO recently_viewed (user_id, product_id) VALUES ($1, $2) RETURNING *';
        const { rows } = await pool.query(query, [req.user.id, req.params.productId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
