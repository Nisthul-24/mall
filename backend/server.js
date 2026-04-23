require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shops');
const productRoutes = require('./routes/products');
const saleRoutes = require('./routes/sales');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const wishlistRoutes = require('./routes/wishlist');
const historyRoutes = require('./routes/history');
const reviewRoutes = require('./routes/reviews');
const { initCron } = require('./services/cronService');

const app = express();

// Initialize Cron Jobs
initCron();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/reviews', reviewRoutes);

// Test raw db connection on startup
pool.query('SELECT NOW()').then(res => {
    console.log('✅ Connected to Supabase PostgreSQL at:', res.rows[0].now);
}).catch(err => {
    console.error('❌ Database connection failed:', err.message);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
