const pool = require('../config/db');

async function addDescriptionColumn() {
    try {
        await pool.query(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
        `);
        console.log("description column added to products.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
addDescriptionColumn();
