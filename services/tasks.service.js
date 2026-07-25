const repo = require('../repositories/tasks.repository');
//extracting data basically from the exports part

exports.getAll = () => repo.findAll();

exports.getById = (id) => repo.findById(id);

//business rule: title must be there in string format and not empty
//if everything fine then new task created
exports.create = (title) => {
  if (!title || title.trim() === '') return { error: "title is required" };
  const task = repo.add({ title, done: false });
  return { task };
};

//check everything if all good then actual update done from repository layer
exports.update = (id, body) => {
  const task = repo.findById(id);
  if (!task) return { error: 'not_found' };
  const { title, done } = body;
  if (title === undefined && done === undefined) return { error: 'invalid' };
  const updated = repo.update(id, { title, done });
  return { task: updated };
};

//remove via id
exports.remove = (id) => repo.remove(id);