const pool = require('../config/db');

async function updateDB() {
    try {
        await pool.query(`
            ALTER TABLE shops ADD COLUMN IF NOT EXISTS last_cleared_amount NUMERIC DEFAULT 0;
            ALTER TABLE shops ADD COLUMN IF NOT EXISTS last_cleared_date TIMESTAMP;
        `);
        console.log("Shops table updated with undo columns.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
updateDB();
