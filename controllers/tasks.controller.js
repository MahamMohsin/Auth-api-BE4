const service = require('../services/tasks.service');

exports.getAllTasks = (req, res) => {
  res.json(service.getAll());
};

exports.getTaskById = (req, res) => {
  const task = service.getById(parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: `Task ${req.params.id} not found` });
  res.json(task);
};

exports.createTask = (req, res) => {
  const { title } = req.body;
  const result = service.create(title);
  if (result.error) return res.status(400).json({ error: result.error });
  res.status(201).json(result.task);
};

exports.updateTask = (req, res) => {
  const result = service.update(parseInt(req.params.id), req.body);
  if (result.error === 'not_found') return res.status(404).json({ error: "not found" });
  if (result.error === 'invalid') return res.status(400).json({ error: "nothing to update" });
  res.json(result.task);
};

exports.deleteTask = (req, res) => {
  const deleted = service.remove(parseInt(req.params.id));
  if (!deleted) return res.status(404).json({ error: "not found" });
  res.status(204).send();
};