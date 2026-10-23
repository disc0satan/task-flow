import { pool } from '../config/db.js';

const COLUMNS = 'id, title, description, status, created_at, updated_at';
const UPDATABLE_FIELDS = ['title', 'description', 'status'];

export async function findAll() {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM tasks ORDER BY created_at DESC, id DESC`
  );
  return rows;
}

export async function create({ title, description }) {
  const { rows } = await pool.query(
    `INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING ${COLUMNS}`,
    [title, description]
  );
  return rows[0];
}

export async function update(id, fields) {
  // Column names come from a fixed whitelist; values are always parameterised.
  const columns = UPDATABLE_FIELDS.filter((name) => name in fields);
  const assignments = columns.map((name, i) => `${name} = $${i + 1}`);
  const values = columns.map((name) => fields[name]);

  const { rows } = await pool.query(
    `UPDATE tasks SET ${assignments.join(', ')}, updated_at = NOW()
     WHERE id = $${columns.length + 1} RETURNING ${COLUMNS}`,
    [...values, id]
  );
  return rows[0] ?? null;
}

export async function toggle(id) {
  const { rows } = await pool.query(
    `UPDATE tasks
     SET status = CASE WHEN status = 'pending' THEN 'completed' ELSE 'pending' END,
         updated_at = NOW()
     WHERE id = $1 RETURNING ${COLUMNS}`,
    [id]
  );
  return rows[0] ?? null;
}

export async function remove(id) {
  const { rows } = await pool.query(
    `DELETE FROM tasks WHERE id = $1 RETURNING ${COLUMNS}`,
    [id]
  );
  return rows[0] ?? null;
}
