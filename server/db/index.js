const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.connect((err) => {
  if (err) console.error('DB connection failed:', err.message);
  else console.log('PostgreSQL connected');
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};