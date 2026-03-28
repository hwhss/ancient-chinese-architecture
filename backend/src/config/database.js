const { Pool } = require('pg');

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.DB_POOL_IDLE_TIMEOUT || 30000),
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT || 2000)
};

let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool(dbConfig);
    pool.on('error', (err) => {
      console.error('PostgreSQL pool error:', err.message);
    });
  }
  return pool;
}

async function testConnection() {
  try {
    const client = await getPool().connect();
    const result = await client.query('SELECT NOW() AS time');
    client.release();
    return {
      success: true,
      time: result.rows[0].time
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function query(sql, params = []) {
  const client = await getPool().connect();
  try {
    const result = await client.query(sql, params);
    return result.rows;
  } finally {
    client.release();
  }
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  getPool,
  testConnection,
  query,
  closePool
};
