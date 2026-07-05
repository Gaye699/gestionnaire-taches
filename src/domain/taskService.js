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

function updateTask(id, changes) {
  const task = getTaskById(id);
  if (!task) {
    throw new Error('Tâche introuvable');
  }
  if ('title' in changes) {
    if (!changes.title || changes.title.trim() === '') {
      throw new Error('Le titre est obligatoire');
    }
    task.title = changes.title.trim();
  }
  if ('priority' in changes) {
    if (!PRIORITES_AUTORISEES.includes(changes.priority)) {
      throw new Error(`Priorité invalide : ${changes.priority}`);
    }
    task.priority = changes.priority;
  }
  if ('dueDate' in changes) {
    if (changes.dueDate !== null && isNaN(Date.parse(changes.dueDate))) {
      throw new Error('Date d\'échéance invalide');
    }
    task.dueDate = changes.dueDate;
  }
  return task;
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

function filterByStatus(status) {
  if (status === 'terminee') return tasks.filter((t) => t.done);
  if (status === 'en-cours') return tasks.filter((t) => !t.done);
  throw new Error(`Statut inconnu : ${status}`);
}

module.exports = {
  PRIORITES_AUTORISEES,
  resetTasks,
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  completeTask,
  isLate,
  countLateTasks,
  filterByStatus,
};
