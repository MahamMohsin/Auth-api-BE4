const db = require('../db');

// SQLite has no real boolean type -- it stores 0/1.
// Converting here keeps the API contract identical (done: true/false)
// so the service/controller layers above never notice the storage change.
const toApiTask = (row) => row && ({ ...row, done: !!row.done });

// shows all tasks
exports.findAll = () => {
  const rows = db.prepare('SELECT * FROM tasks ORDER BY id').all();
  return rows.map(toApiTask);
};

// finding task by id
exports.findById = (id) => {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  return toApiTask(row);
};

exports.add = (data) => {
  const { title, done = false } = data;
  const result = db
    .prepare('INSERT INTO tasks (title, done) VALUES (?, ?)')
    .run(title, done ? 1 : 0);

  return exports.findById(result.lastInsertRowid);
};

exports.update = (id, data) => {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) return undefined;

  const title = data.title !== undefined ? data.title : existing.title;
  const done = data.done !== undefined ? (data.done ? 1 : 0) : existing.done;

  db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(title, done, id);

  return exports.findById(id);
};

exports.remove = (id) => {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return result.changes > 0;
};