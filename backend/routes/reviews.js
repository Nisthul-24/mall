const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
    try {
        const userId = req.query.userId || null;
        const query = `
            SELECT r.*, u.name AS user_name,
                   (SELECT COUNT(*) FROM review_votes WHERE review_id = r.id AND vote_type = 1) AS helpful_count,
                   (SELECT COUNT(*) FROM review_votes WHERE review_id = r.id AND vote_type = -1) AS not_helpful_count,
                   (SELECT vote_type FROM review_votes WHERE review_id = r.id AND user_id = $2) AS user_vote
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.product_id = $1 
            ORDER BY r."createdAt" DESC
        `;
        const { rows } = await pool.query(query, [req.params.productId, userId]);
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
            SET average_rating = COALESCE((SELECT AVG(score) FROM reviews WHERE product_id = $1), 0) 
            WHERE id = $1
        `, [product_id]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a review
router.delete('/product/:productId', auth, async (req, res) => {
    try {
        await pool.query('DELETE FROM reviews WHERE user_id = $1 AND product_id = $2', [req.user.id, req.params.productId]);
        await pool.query(`
            UPDATE products 
            SET average_rating = COALESCE((SELECT AVG(score) FROM reviews WHERE product_id = $1), 0) 
            WHERE id = $1
        `, [req.params.productId]);
        res.json({ message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Vote on a review
router.post('/:id/vote', auth, async (req, res) => {
    try {
        const { vote_type } = req.body; // 1 for helpful, -1 for not helpful, 0 to remove vote
        const check = await pool.query('SELECT id FROM review_votes WHERE user_id = $1 AND review_id = $2', [req.user.id, req.params.id]);
        
        if (check.rows.length > 0) {
            if (vote_type === 0) {
                await pool.query('DELETE FROM review_votes WHERE id = $1', [check.rows[0].id]);
            } else {
                await pool.query('UPDATE review_votes SET vote_type = $1 WHERE id = $2', [vote_type, check.rows[0].id]);
            }
        } else if (vote_type !== 0) {
            await pool.query('INSERT INTO review_votes (user_id, review_id, vote_type) VALUES ($1, $2, $3)', [req.user.id, req.params.id, vote_type]);
        }
        res.json({ message: 'Vote recorded' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
