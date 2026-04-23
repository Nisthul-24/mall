require('dotenv').config();
const pool = require('./config/db');
const bcrypt = require('bcryptjs');

const seedDB = async () => {
    const client = await pool.connect();
    try {
        console.log('🌱 Starting database seeding...');
        
        // ── STEP 1: DROP EXISTING TABLES (with CASCADE for foreign key safety) ──
        await client.query(`
            DROP TABLE IF EXISTS ratings CASCADE;
            DROP TABLE IF EXISTS sales CASCADE;
            DROP TABLE IF EXISTS products CASCADE;
            DROP TABLE IF EXISTS shops CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        `);
        console.log('🗑️  Old tables dropped.');

        // ── STEP 2: CREATE TABLES WITH RAW DDL SQL ──────────────────────────────
        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'shop_owner', 'admin')),
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW()
            );
            
            CREATE TABLE shops (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                status VARCHAR(10) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
                rent_status VARCHAR(10) DEFAULT 'Pending' CHECK (rent_status IN ('Paid', 'Pending')),
                rent_amount FLOAT NOT NULL DEFAULT 1000,
                rating FLOAT DEFAULT 0,
                owner_id INT REFERENCES users(id) ON DELETE CASCADE,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW()
            );
            
            CREATE TABLE products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price FLOAT NOT NULL,
                quantity INT NOT NULL DEFAULT 0,
                image_url VARCHAR(500) DEFAULT '',
                average_rating FLOAT DEFAULT 0,
                shop_id INT REFERENCES shops(id) ON DELETE CASCADE,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW()
            );
            
            CREATE TABLE sales (
                id SERIAL PRIMARY KEY,
                quantity_sold INT NOT NULL,
                date TIMESTAMP DEFAULT NOW(),
                product_id INT REFERENCES products(id) ON DELETE CASCADE
            );
            
            CREATE TABLE ratings (
                id SERIAL PRIMARY KEY,
                score INT NOT NULL CHECK (score >= 1 AND score <= 5),
                product_id INT REFERENCES products(id) ON DELETE CASCADE,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                "createdAt" TIMESTAMP DEFAULT NOW(),
                "updatedAt" TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ Tables created.');

        // ── STEP 3: SEED DATA WITH RAW INSERT QUERIES ────────────────────────────
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('pass', salt);

        // Insert Users
        const { rows: users } = await client.query(`
            INSERT INTO users (name, email, password, role) VALUES
            ('Admin User', 'admin@mail.com', $1, 'admin'),
            ('Jane Doe', 'cust@mail.com', $1, 'customer'),
            ('Tech Haven Owner', 'shop@mail.com', $1, 'shop_owner'),
            ('Boutique Owner', 'shop2@mail.com', $1, 'shop_owner'),
            ('Amit Singh', 'groceries@mail.com', $1, 'shop_owner'),
            ('Neha Gupta', 'books@mail.com', $1, 'shop_owner')
            RETURNING id, email, role
        `, [passwordHash]);

        const owner1 = users.find(u => u.email === 'shop@mail.com').id;
        const owner2 = users.find(u => u.email === 'shop2@mail.com').id;
        const owner3 = users.find(u => u.email === 'groceries@mail.com').id;
        const owner4 = users.find(u => u.email === 'books@mail.com').id;
        console.log('👤 Users seeded.');

        // Insert Shops
        const { rows: shops } = await client.query(`
            INSERT INTO shops (name, owner_id, status, rent_status, rent_amount, rating) VALUES
            ('Tech Haven', $1, 'open', 'Paid', 15000, 0),
            ('Fashion Boutique', $2, 'open', 'Pending', 12000, 0),
            ('Fresh Groceries Mart', $3, 'open', 'Paid', 8000, 0),
            ('Neha Books Corner', $4, 'open', 'Pending', 5000, 0)
            RETURNING id, name
        `, [owner1, owner2, owner3, owner4]);

        const shop1 = shops.find(s => s.name === 'Tech Haven').id;
        const shop2 = shops.find(s => s.name === 'Fashion Boutique').id;
        const shop3 = shops.find(s => s.name === 'Fresh Groceries Mart').id;
        const shop4 = shops.find(s => s.name === 'Neha Books Corner').id;
        console.log('🏪 Shops seeded.');

        // Insert Products
        const { rows: products } = await client.query(`
            INSERT INTO products (name, shop_id, price, quantity, image_url) VALUES
            ('Wireless Headphones', $1, 5999, 15, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'),
            ('Smart Watch', $1, 12999, 3, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'),
            ('Gaming Mouse', $1, 1499, 0, 'https://images.unsplash.com/photo-1527814050087-379381547926?w=500'),
            ('4K Ultra HD Smart TV', $1, 55000, 8, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500'),
            ('Power Bank 20000mAh', $1, 2500, 50, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500'),
            ('Denim Jacket', $2, 3500, 20, 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500'),
            ('Basic T-Shirt', $2, 599, 50, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'),
            ('Classic Leather Wallet', $2, 1200, 30, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500'),
            ('Running Sneakers', $2, 4500, 25, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'),
            ('Organic Apples (1kg)', $3, 250, 100, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6fac6?w=500'),
            ('Whole Wheat Bread', $3, 50, 20, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500'),
            ('Basmati Rice (5kg)', $3, 550, 35, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500'),
            ('The Atomic Habits', $4, 450, 40, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500'),
            ('Rich Dad Poor Dad', $4, 399, 25, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQg5PAv5-ESxj5bypvhNjzFZP6W_JWcL1HnMA&s')
            RETURNING id, name
        `, [shop1, shop2, shop3, shop4]);

        const prod1 = products.find(p => p.name === 'Wireless Headphones').id;
        const prod2 = products.find(p => p.name === 'Smart Watch').id;
        const prod4 = products.find(p => p.name === 'Denim Jacket').id;
        console.log('📦 Products seeded.');

        // Insert Sales
        await client.query(`
            INSERT INTO sales (product_id, quantity_sold, date) VALUES
            ($1, 2, NOW()),
            ($1, 3, NOW()),
            ($2, 1, NOW()),
            ($3, 5, NOW())
        `, [prod1, prod2, prod4]);
        console.log('💰 Sales seeded.');

        console.log('\n🎉 Database seeded successfully with raw SQL on Supabase!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
    }
};

seedDB();
