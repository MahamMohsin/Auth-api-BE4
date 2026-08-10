const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');
const tasksRoutes = require('./routes/tasks.routes');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

app.get('/health', async (req, res) => {
  try {
    const pool = require('./db');
    await pool.query('SELECT 1');
    res.json({ status: "ok", db: "ok" });
  } catch (err) {
    res.status(500).json({ status: "ok", db: "unreachable" });
  }
});

app.use('/tasks', tasksRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

module.exports = app;