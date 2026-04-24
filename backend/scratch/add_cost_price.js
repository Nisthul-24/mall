const pool = require('../config/db');

async function addCostPriceColumn() {
    try {
        await pool.query(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;
            
            -- Backfill cost_price as 80% of price for existing products to have realistic data
            UPDATE products SET cost_price = price * 0.8 WHERE cost_price = 0 OR cost_price IS NULL;
        `);
        console.log("cost_price column added and backfilled.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
addCostPriceColumn();
