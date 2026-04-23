const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ─── RECORD A SALE ────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const { product_id, quantity_sold } = req.body;

        // 1. Raw SQL: Find the product by ID
        const { rows: products } = await pool.query(
            'SELECT * FROM products WHERE id = $1', [product_id]
        );
        if (products.length === 0) return res.status(404).json({ message: 'Product not found' });
        const product = products[0];

        // 2. Validate stock
        if (product.quantity < quantity_sold) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        // 3. Raw SQL: Reduce product stock
        await pool.query(
            'UPDATE products SET quantity = quantity - $1 WHERE id = $2',
            [quantity_sold, product_id]
        );

        // 4. Raw SQL: Insert the sale record
        const { rows: newSale } = await pool.query(
            'INSERT INTO sales (product_id, quantity_sold, date) VALUES ($1, $2, NOW()) RETURNING *',
            [product_id, quantity_sold]
        );

        res.status(201).json(newSale[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET SALES BY SHOP ────────────────────────────────────────────────────────
// Raw SQL: JOIN sales with products to get product name and price in one query
router.get('/shop/:shopId', async (req, res) => {
    try {
        const query = `
            SELECT s.*, 
                   p.name AS "Product_name", 
                   p.price AS "Product_price"
            FROM sales s
            JOIN products p ON s.product_id = p.id
            WHERE p.shop_id = $1
        `;
        const { rows } = await pool.query(query, [req.params.shopId]);

        // Map rows to keep nested Product object React expects (for sales analytics chart)
        const sales = rows.map(row => ({
            id: row.id,
            quantity_sold: row.quantity_sold,
            date: row.date,
            product_id: row.product_id,
            Product: {
                name: row.Product_name,
                price: row.Product_price
            }
        }));

        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
