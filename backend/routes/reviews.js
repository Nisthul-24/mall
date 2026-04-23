const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
    try {
        const query = `
            SELECT r.*, u.name AS user_name 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.product_id = $1 
            ORDER BY r.created_at DESC
        `;
        const { rows } = await pool.query(query, [req.params.productId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Post a review
router.post('/', auth, async (req, res) => {
    try {
        const { product_id, score, comment, review_image_url } = req.body;
        
        // Upsert review (one per user per product)
        const checkQuery = 'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2';
        const check = await pool.query(checkQuery, [req.user.id, product_id]);

        let result;
        if (check.rows.length > 0) {
            const updateQuery = `
                UPDATE reviews 
                SET score = $1, comment = $2, review_image_url = $3, "updatedAt" = NOW() 
                WHERE id = $4 RETURNING *
            `;
            result = await pool.query(updateQuery, [score, comment, review_image_url, check.rows[0].id]);
        } else {
            const insertQuery = `
                INSERT INTO reviews (user_id, product_id, score, comment, review_image_url) 
                VALUES ($1, $2, $3, $4, $5) RETURNING *
            `;
            result = await pool.query(insertQuery, [req.user.id, product_id, score, comment, review_image_url]);
        }

        // Update average rating on product
        await pool.query(`
            UPDATE products 
            SET average_rating = (SELECT AVG(score) FROM reviews WHERE product_id = $1) 
            WHERE id = $1
        `, [product_id]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
