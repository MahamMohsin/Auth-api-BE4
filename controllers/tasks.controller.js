const service = require('../services/tasks.service');

exports.getAllTasks = async (req, res) => {
  res.json(await service.getAll());
};

exports.getTaskById = async (req, res) => {
  const id = parseInt(req.params.id);
  const task = await service.getById(id);
  if (!task) return res.status(404).json({ error: `Task ${req.params.id} not found` });
  res.json(task);
};

exports.createTask = async (req, res) => {
  const { title } = req.body || {};
  const result = await service.create(title);
  if (result.error) return res.status(400).json({ error: result.error });
  res.status(201).json(result.task);
};

exports.updateTask = async (req, res) => {
  const id = parseInt(req.params.id);
  const result = await service.update(id, req.body);
  if (result.error === 'not_found') {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  if (result.error === 'invalid') {
    return res.status(400).json({ error: "provide a valid title and/or done value" });
  }
  res.json(result.task);
};

exports.deleteTask = async (req, res) => {
  const id = parseInt(req.params.id);
  const deleted = await service.remove(id);
  if (!deleted) return res.status(404).json({ error: `Task ${req.params.id} not found` });
  res.status(204).send();
};