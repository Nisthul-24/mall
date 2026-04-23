const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { shopOwnerAuth, auth } = require('../middleware/auth');

// ─── GET ALL PRODUCTS (Public) ────────────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        let query = `
            SELECT p.*, 
                   s.id AS "Shop_id", 
                   s.name AS "Shop_name", 
                   s.status AS "Shop_status"
            FROM products p
            LEFT JOIN shops s ON p.shop_id = s.id
        `;
        const values = [];

        if (category) {
            query += ' WHERE p.category = $1';
            values.push(category);
        }

        const { rows } = await pool.query(query, values);

        const products = rows.map(row => ({
            id: row.id,
            name: row.name,
            price: row.price,
            quantity: row.quantity,
            category: row.category,
            image_url: row.image_url,
            average_rating: row.average_rating,
            shop_id: row.shop_id,
            Shop: {
                id: row.Shop_id,
                name: row.Shop_name,
                status: row.Shop_status
            }
        }));

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET CATEGORIES
router.get('/categories', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT DISTINCT category FROM products');
        res.json(rows.map(r => r.category));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET PRODUCT BY ID
router.get('/:id', async (req, res) => {
    try {
        const query = `
            SELECT p.*, s.name AS shop_name 
            FROM products p 
            JOIN shops s ON p.shop_id = s.id 
            WHERE p.id = $1
        `;
        const { rows } = await pool.query(query, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET PRODUCTS BY SHOP (Public) ────────────────────────────────────────────
router.get('/shop/:shopId', async (req, res) => {
    try {
        const query = 'SELECT * FROM products WHERE shop_id = $1';
        const { rows } = await pool.query(query, [req.params.shopId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── CREATE PRODUCT (Shop Owner only) ─────────────────────────────────────────
router.post('/', shopOwnerAuth, async (req, res) => {
    try {
        const { name, price, quantity, image_url, shop_id, category } = req.body;
        const query = `
            INSERT INTO products (name, price, quantity, image_url, shop_id, category, average_rating)
            VALUES ($1, $2, $3, $4, $5, $6, 0)
            RETURNING *
        `;
        const { rows } = await pool.query(query, [name, price, quantity, image_url || '', shop_id, category || 'General']);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

