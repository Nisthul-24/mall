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
                   s.status AS "Shop_status",
                   (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) AS rating_count
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
            description: row.description,
            average_rating: row.average_rating,
            rating_count: parseInt(row.rating_count) || 0,
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
        const { name, price, quantity, image_url, shop_id, category, description, cost_price } = req.body;
        const query = `
            INSERT INTO products (name, price, quantity, image_url, shop_id, category, description, cost_price, average_rating)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0)
            RETURNING *
        `;
        const { rows } = await pool.query(query, [name, price, quantity, image_url || '', shop_id, category || 'General', description || '', cost_price || 0]);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── UPDATE PRODUCT (Shop Owner only) ─────────────────────────────────────────
router.put('/:id', shopOwnerAuth, async (req, res) => {
    try {
        const { name, price, quantity, image_url, category, description, cost_price } = req.body;
        const query = `
            UPDATE products 
            SET name = $1, price = $2, quantity = $3, image_url = $4, category = $5, description = $6, cost_price = $7, "updatedAt" = NOW()
            WHERE id = $8
            RETURNING *
        `;
        const { rows } = await pool.query(query, [name, price, quantity, image_url || '', category || 'General', description || '', cost_price || 0, req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── DELETE PRODUCT (Shop Owner only) ─────────────────────────────────────────
router.delete('/:id', shopOwnerAuth, async (req, res) => {
    try {
        const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
