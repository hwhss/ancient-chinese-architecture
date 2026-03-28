/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (error) {
  // dotenv is optional when environment variables are already injected.
}

const DEFAULT_DATABASE_URL = 'postgresql://postgres:postgres123@localhost:5432/ancient_architecture';
const databaseUrl = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
const schemaFile = path.join(__dirname, '001_initial_schema.sql');

async function applyMigration() {
  if (!fs.existsSync(schemaFile)) {
    throw new Error(`Schema file not found: ${schemaFile}`);
  }

  const sql = fs.readFileSync(schemaFile, 'utf8');
  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();
    await client.query(sql);
    console.log('[SUCCESS] Migration applied: 001_initial_schema.sql');
  } finally {
    await client.end();
  }
}

applyMigration().catch((error) => {
  console.error('[ERROR] Failed to apply migration:', error.message);
  process.exit(1);
});
