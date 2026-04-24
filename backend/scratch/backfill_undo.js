const pool = require('../config/db');

async function backfillUndo() {
    try {
        const { rowCount } = await pool.query(`
            UPDATE shops 
            SET last_cleared_amount = rent_amount, last_cleared_date = NOW()
            WHERE (total_balance <= 0 OR rent_status = 'Paid') AND (last_cleared_amount = 0 OR last_cleared_amount IS NULL)
        `);
        console.log(`Backfilled last_cleared_amount for ${rowCount} shops.`);
        process.exit(0);
    } catch (e) {
        console.error("Failed to backfill", e);
        process.exit(1);
    }
}

backfillUndo();
