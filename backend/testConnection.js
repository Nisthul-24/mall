const pool = require('./config/db');

async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    const res = await client.query('SELECT NOW(), version()');
    console.log('✅ Connected to Supabase PostgreSQL!');
    console.log('🕐 Server time:', res.rows[0].now);
    console.log('📦 DB version:', res.rows[0].version);
  } catch (error) {
    console.error('❌ Unable to connect to the Supabase database:', error.message);
  } finally {
    if (client) client.release();
    await pool.end();
    process.exit(0);
  }
}

testConnection();
