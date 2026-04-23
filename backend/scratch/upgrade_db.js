const pool = require('../config/db');

async function upgrade() {
    console.log('🚀 Starting System Pro Migration...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('📦 Updating products table (category)...');
        await client.query(`
            ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'General';
        `);

        console.log('🛍️ Updating shops table (rates & fees)...');
        await client.query(`
            ALTER TABLE shops 
            ADD COLUMN IF NOT EXISTS performance_rate FLOAT DEFAULT 0.05,
            ADD COLUMN IF NOT EXISTS penalty_fee FLOAT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS pending_late_fee BOOLEAN DEFAULT false;
        `);

        console.log('⭐ Upgrading ratings to reviews...');
        await client.query(`
            ALTER TABLE ratings ADD COLUMN IF NOT EXISTS comment TEXT;
            ALTER TABLE ratings ADD COLUMN IF NOT EXISTS review_image_url VARCHAR(500);
            -- Optional: Rename table if you want, but for backward compatibility we can keep 'ratings' 
            -- and just use it as reviews. Let's rename for cleanliness.
            ALTER TABLE ratings RENAME TO reviews;
        `);

        console.log('❤️ Creating wishlists table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS wishlists (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                product_id INT REFERENCES products(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('🕒 Creating recently_viewed table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS recently_viewed (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                product_id INT REFERENCES products(id) ON DELETE CASCADE,
                viewed_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Populate some categories for diversity
        await client.query(`
            UPDATE products SET category = 'Electronics' WHERE name ILIKE '%Headphones%' OR name ILIKE '%Watch%' OR name ILIKE '%TV%' OR name ILIKE '%Mouse%' OR name ILIKE '%Power Bank%';
            UPDATE products SET category = 'Fashion' WHERE name ILIKE '%Jacket%' OR name ILIKE '%T-Shirt%' OR name ILIKE '%Wallet%' OR name ILIKE '%Sneakers%';
            UPDATE products SET category = 'Groceries' WHERE name ILIKE '%Apples%' OR name ILIKE '%Bread%' OR name ILIKE '%Rice%';
            UPDATE products SET category = 'Books' WHERE name ILIKE '%Habits%' OR name ILIKE '%Dad%';
        `);

        await client.query('COMMIT');
        console.log('✅ Pro Migration completed successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
}

upgrade();
