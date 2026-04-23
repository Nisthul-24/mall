const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { adminAuth } = require('../middleware/auth');

// Get Admin Analytics
router.get('/admin-overview', adminAuth, async (req, res) => {
    try {
        // 1. Revenue by Shop
        const shopRevenueQuery = `
            SELECT s.name AS shop_name, SUM(p.price * sa.quantity_sold) AS revenue
            FROM sales sa
            JOIN products p ON sa.product_id = p.id
            JOIN shops s ON p.shop_id = s.id
            GROUP BY s.id, s.name
        `;
        const { rows: shopRevenue } = await pool.query(shopRevenueQuery);

        // 2. Revenue by Category
        const categoryRevenueQuery = `
            SELECT p.category, SUM(p.price * sa.quantity_sold) AS revenue
            FROM sales sa
            JOIN products p ON sa.product_id = p.id
            GROUP BY p.category
        `;
        const { rows: categoryRevenue } = await pool.query(categoryRevenueQuery);

        // 3. Profit Analytics (Monthly Trends)
        const monthlyProfitQuery = `
            SELECT TO_CHAR(sa.date, 'Mon YYYY') AS month, SUM(p.price * sa.quantity_sold) AS revenue
            FROM sales sa
            JOIN products p ON sa.product_id = p.id
            GROUP BY TO_CHAR(sa.date, 'Mon YYYY'), DATE_TRUNC('month', sa.date)
            ORDER BY DATE_TRUNC('month', sa.date)
        `;
        const { rows: monthlyProfit } = await pool.query(monthlyProfitQuery);

        // 4. Rent Prediction (Expected Revenue Next Month)
        // Logic: Total Base Rent + (Predicted Performance Bonus based on current month's sales)
        const currentMonth = new Date().toISOString().slice(0, 7);
        const predictionQuery = `
            SELECT 
                SUM(rent_amount) AS total_base_rent,
                SUM(COALESCE(sub.monthly_sales, 0) * performance_rate) AS predicted_bonus
            FROM shops s
            LEFT JOIN (
                SELECT p.shop_id, SUM(p.price * sa.quantity_sold) AS monthly_sales
                FROM sales sa
                JOIN products p ON sa.product_id = p.id
                WHERE TO_CHAR(sa.date, 'YYYY-MM') = $1
                GROUP BY p.shop_id
            ) sub ON s.id = sub.shop_id
        `;
        const { rows: prediction } = await pool.query(predictionQuery, [currentMonth]);

        res.json({
            shopRevenue,
            categoryRevenue,
            monthlyProfit,
            prediction: {
                totalBaseRent: parseFloat(prediction[0].total_base_rent || 0),
                predictedBonus: parseFloat(prediction[0].predicted_bonus || 0),
                expectedTotal: parseFloat(prediction[0].total_base_rent || 0) + parseFloat(prediction[0].predicted_bonus || 0)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
