const { Pool } = require('pg');
require('dotenv').config();

// Initialize the raw PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.SUPABASE_URI,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
