const pool = require('../db');

exports.findAll = async () => {
  const result = await pool.query('SELECT * FROM tasks ORDER BY id');
  return result.rows;
};

exports.findById = async (id) => {
  const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
  return result.rows[0];
};

exports.add = async (data) => {
  const result = await pool.query(
    'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
    [data.title, data.done]
  );
  return result.rows[0];
};

exports.update = async (id, data) => {
  const existing = await exports.findById(id);
  if (!existing) return null;

  const newTitle = data.title !== undefined ? data.title : existing.title;
  const newDone = data.done !== undefined ? data.done : existing.done;

  const result = await pool.query(
    'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
    [newTitle, newDone, id]
  );
  return result.rows[0];
};

exports.remove = async (id) => {
  const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  return result.rowCount > 0;
};