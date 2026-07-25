const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');
const tasksRoutes = require('./routes/tasks.routes');

const app = express();
//middleware runs on every incoming req
//parses every json inc req and puts in req.body
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});
app.get('/health', (req, res) => res.json({ status: "ok" }));

app.use('/tasks', tasksRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

module.exports = app;