const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { adminAuth, shopOwnerAuth, auth } = require('../middleware/auth');

// Get all shops (Public)
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT s.*, u.name AS owner_name, u.email AS owner_email 
            FROM shops s 
            LEFT JOIN users u ON s.owner_id = u.id
        `;
        const { rows } = await pool.query(query);
        
        // Map raw SQL rows to match the nested JSON structure React expects
        const shops = rows.map(row => ({
            id: row.id,
            name: row.name,
            owner_id: row.owner_id,
            status: row.status,
            rent_status: row.rent_status,
            rent_amount: row.rent_amount,
            total_balance: row.total_balance,
            last_billed_month: row.last_billed_month,
            rating: row.rating,
            User: {
                name: row.owner_name,
                email: row.owner_email
            }
        }));

        res.json(shops);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get shop by owner (Protected)
router.get('/owner/:ownerId', auth, async (req, res) => {
    try {
        const query = 'SELECT * FROM shops WHERE owner_id = $1';
        const { rows } = await pool.query(query, [req.params.ownerId]);
        
        if (rows.length === 0) return res.json(null);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create shop (Admin only)
router.post('/', adminAuth, async (req, res) => {
    try {
        const { name, owner_id, status, rent_status, rent_amount } = req.body;
        const currentMonth = new Date().toISOString().slice(0, 7);
        const query = `
            INSERT INTO shops (name, owner_id, status, rent_status, rent_amount, total_balance, last_billed_month, rating) 
            VALUES ($1, $2, $3, $4, $5, $5, $6, 0) RETURNING *
        `;
        // We initialize total_balance with the first month's rent ($5)
        const values = [name, owner_id, status || 'open', rent_status || 'Pending', rent_amount || 1000, currentMonth];
        
        const { rows } = await pool.query(query, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Pay Rent (Admin or Shop Owner)
router.post('/pay/:id', shopOwnerAuth, async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid payment amount' });

        const { rows: currentShop } = await pool.query('SELECT total_balance, name FROM shops WHERE id = $1', [req.params.id]);
        if (currentShop.length === 0) return res.status(404).json({ message: 'Shop not found' });

        const newBalance = Math.max(0, currentShop[0].total_balance - amount);
        const newStatus = newBalance === 0 ? 'Paid' : 'Pending';

        const { rows } = await pool.query(
            'UPDATE shops SET total_balance = $1, rent_status = $2 WHERE id = $3 RETURNING *',
            [newBalance, newStatus, req.params.id]
        );

        // Add notification for the payment
        await pool.query(
            'INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3)',
            [rows[0].owner_id, `Payment received for ${rows[0].name}: ₹${amount}. Remaining balance: ₹${newBalance}.`, 'payment_received']
        );

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update shop (Admin and Shop Owner)
router.put('/:id', shopOwnerAuth, async (req, res) => {
    try {
        const fields = Object.keys(req.body);
        const values = Object.values(req.body);
        
        if (fields.length === 0) return res.status(400).json({ message: 'No fields to update' });

        // Dynamically build SET query 
        const setClauses = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
        values.push(req.params.id); // Add ID to values array for the WHERE clause
        
        const query = `UPDATE shops SET ${setClauses} WHERE id = $${values.length} RETURNING *`;
        const { rows } = await pool.query(query, values);

        if (rows.length === 0) return res.status(404).json({ message: 'Shop not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete shop (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const query = 'DELETE FROM shops WHERE id = $1';
        await pool.query(query, [req.params.id]);
        res.json({ message: 'Shop deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
