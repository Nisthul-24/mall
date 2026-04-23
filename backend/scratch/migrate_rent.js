const pool = require('../config/db');

async function migrate() {
    console.log('🚀 Starting Database Migration...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('📦 Updating shops table...');
        await client.query(`
            ALTER TABLE shops 
            ADD COLUMN IF NOT EXISTS total_balance FLOAT DEFAULT 0,
            ADD COLUMN IF NOT EXISTS last_billed_month VARCHAR(7) DEFAULT NULL;
        `);

        console.log('🔔 Creating notifications table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                message TEXT NOT NULL,
                type VARCHAR(20) DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Initialize last_billed_month for existing shops to the current month 
        // if it's already "Paid" to avoid double billing this month.
        const currentMonth = new Date().toISOString().slice(0, 7);
        await client.query(`
            UPDATE shops 
            SET last_billed_month = $1 
            WHERE last_billed_month IS NULL AND rent_status = 'Paid';
        `, [currentMonth]);

        await client.query('COMMIT');
        console.log('✅ Migration completed successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
