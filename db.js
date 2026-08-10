const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id serial PRIMARY KEY,
      title text NOT NULL,
      done boolean NOT NULL DEFAULT false
    )
  `);

  const { rows } = await pool.query('SELECT COUNT(*) FROM tasks');
  if (parseInt(rows[0].count) === 0) {
    await pool.query(
      `INSERT INTO tasks (title, done) VALUES
        ('Buy milk', false),
        ('Walk dog', false),
        ('Write code', true)`
    );
  }
}

init().catch((err) => {
  console.error('Failed to initialize database:', err.message);
});

module.exports = pool;