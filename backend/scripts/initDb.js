import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pool } from '../src/config/db.js';

const schemaPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../db/schema.sql'
);

async function initDb() {
  const sql = await readFile(schemaPath, 'utf8');
  await pool.query(sql);
  console.log('Database ready: "tasks" table exists.');
}

initDb()
  .catch((err) => {
    console.error('Database setup failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
