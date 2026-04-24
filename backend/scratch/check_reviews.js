const pool = require('../config/db');

async function checkTable() {
    try {
        const { rows } = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'reviews'");
        console.log(rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkTable();
