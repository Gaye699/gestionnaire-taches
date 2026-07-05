// Logique métier du gestionnaire de tâches.
// Cette couche ne connaît ni Express ni le frontend : elle est testable seule.

const PRIORITES_AUTORISEES = ['basse', 'normale', 'haute'];

// Stockage en mémoire (suffisant pour le périmètre du projet)
let tasks = [];
let nextId = 1;

function resetTasks() {
  tasks = [];
  nextId = 1;
}

function createTask({ title, priority = 'normale', dueDate = null }) {
  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new Error('Le titre est obligatoire');
  }
  if (!PRIORITES_AUTORISEES.includes(priority)) {
    throw new Error(`Priorité invalide : ${priority}`);
  }
  if (dueDate !== null && isNaN(Date.parse(dueDate))) {
    throw new Error('Date d\'échéance invalide');
  }

  const task = {
    id: nextId++,
    title: title.trim(),
    priority,
    dueDate,
    done: false,
  };
  tasks.push(task);
  return task;
}

function getTasks() {
  return tasks;
}

function getTaskById(id) {
  return tasks.find((t) => t.id === id) || null;
}

function completeTask(id) {
  const task = getTaskById(id);
  if (!task) {
    throw new Error('Tâche introuvable');
  }
  task.done = true;
  return task;
}

// Une tâche est en retard si sa date d'échéance est passée ET qu'elle n'est pas terminée.
function isLate(task, now = new Date()) {
  if (task.done) return false;
  if (!task.dueDate) return false;
  return new Date(task.dueDate) < now;
}

function countLateTasks(now = new Date()) {
  return tasks.filter((t) => isLate(t, now)).length;
}

module.exports = {
  PRIORITES_AUTORISEES,
  resetTasks,
  createTask,
  getTasks,
  getTaskById,
  completeTask,
  isLate,
  countLateTasks,
};
