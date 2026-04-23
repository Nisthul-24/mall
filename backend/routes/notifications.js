const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// Get notifications for current user
router.get('/', auth, async (req, res) => {
    try {
        const query = `
            SELECT * FROM notifications 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT 50
        `;
        const { rows } = await pool.query(query, [req.user.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        const query = 'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *';
        const { rows } = await pool.query(query, [req.params.id, req.user.id]);
        
        if (rows.length === 0) return res.status(404).json({ message: 'Notification not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark all as read
router.put('/read-all', auth, async (req, res) => {
    try {
        const query = 'UPDATE notifications SET is_read = TRUE WHERE user_id = $1';
        await pool.query(query, [req.user.id]);
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
