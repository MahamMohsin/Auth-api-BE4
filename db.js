const path = require('path');
const Database = require('better-sqlite3');

// tasks.db is created automatically the first time this file runs
// (better-sqlite3 creates the file on disk if it doesn't exist yet)
const dbPath = path.join(__dirname, 'tasks.db');
const db = new Database(dbPath);

// create the table only if it doesn't already exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT    NOT NULL,
    done  BOOLEAN NOT NULL DEFAULT 0
  )
`);

// seed example tasks only the very first time (table empty)
const { count } = db.prepare('SELECT COUNT(*) AS count FROM tasks').get();

if (count === 0) {
  const seed = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  seed.run('Buy milk', 0);
  seed.run('Complete Internship task', 0);
  seed.run('Complete assignment', 1);
}

module.exports = db;