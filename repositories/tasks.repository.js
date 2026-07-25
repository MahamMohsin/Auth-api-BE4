//array that stores tasks
let tasks = [
  { id: 1, title: "Buy milk", done: false },
  { id: 2, title: "Complete Internship task", done: false },
  { id: 3, title: "Complete assignment", done: true }
];
let nextId = 4;

//shows all tasks
exports.findAll = () => tasks;

//finding task by id
exports.findById = (id) => tasks.find(t => t.id === id);

exports.add = (data) => {
  const task = { id: nextId++, ...data };
  tasks.push(task);
  return task;
};

exports.update = (id, data) => {
  const task = tasks.find(t => t.id === id);
  if (data.title !== undefined) task.title = data.title;
  if (data.done !== undefined) task.done = data.done;
  return task;
};

exports.remove = (id) => {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  return true;
};