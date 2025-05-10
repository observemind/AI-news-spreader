const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'newsspreader',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait before timing out when connecting a new client
});

// Connect function
const connect = async () => {
  try {
    // Test the connection
    const client = await pool.connect();
    client.release();
    console.log('PostgreSQL connected successfully');
    return true;
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    throw error;
  }
};

// Disconnect function
const disconnect = async () => {
  try {
    await pool.end();
    console.log('PostgreSQL pool has ended');
    return true;
  } catch (error) {
    console.error('Error closing PostgreSQL pool:', error);
    throw error;
  }
};

// Query function
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  // Log slow queries for monitoring
  if (duration > 1000) {
    console.log('Slow query:', { text, duration, rows: res.rowCount });
  }
  
  return res;
};

// Transaction function
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  connect,
  disconnect,
  query,
  transaction,
  pool
};