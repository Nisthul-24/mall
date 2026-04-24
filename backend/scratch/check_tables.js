const pool = require('../config/db');

async function checkTable() {
    try {
        const { rows } = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log(rows.map(r => r.table_name));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkTable();
