const repo = require('../repositories/tasks.repository');

exports.getAll = () => repo.findAll();

exports.getById = (id) => repo.findById(id);

exports.create = async (title) => {
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return { error: "title is required" };
  }
  const task = await repo.add({ title, done: false });
  return { task };
};

exports.update = async (id, body) => {
  const existing = await repo.findById(id);
  if (!existing) return { error: 'not_found' };

  const { title, done } = body || {};
  if (title === undefined && done === undefined) {
    return { error: 'invalid' };
  }
  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return { error: 'invalid' };
  }

  const updated = await repo.update(id, { title, done });
  return { task: updated };
};

exports.remove = (id) => repo.remove(id);