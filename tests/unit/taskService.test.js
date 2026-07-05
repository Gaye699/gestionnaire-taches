const taskService = require('../../src/domain/taskService');

describe('taskService - création de tâches', () => {
  beforeEach(() => {
    taskService.resetTasks();
  });

  // Cas nominal
  test('une tâche valide est créée avec un id et le statut "non terminée"', () => {
    const task = taskService.createTask({ title: 'Réviser le partiel', priority: 'haute' });

    expect(task.id).toBe(1);
    expect(task.title).toBe('Réviser le partiel');
    expect(task.priority).toBe('haute');
    expect(task.done).toBe(false);
  });

  test('la priorité par défaut est "normale"', () => {
    const task = taskService.createTask({ title: 'Faire les courses' });
    expect(task.priority).toBe('normale');
  });

  // Cas d'erreur
  test('une tâche sans titre est refusée', () => {
    expect(() => taskService.createTask({ title: '' })).toThrow('Le titre est obligatoire');
  });

  // Cas limite : titre composé uniquement d'espaces
  test('une tâche avec un titre composé uniquement d\'espaces est refusée', () => {
    expect(() => taskService.createTask({ title: '   ' })).toThrow('Le titre est obligatoire');
  });

  test('une priorité hors liste autorisée est refusée', () => {
    expect(() => taskService.createTask({ title: 'Test', priority: 'urgente' })).toThrow(
      'Priorité invalide : urgente'
    );
  });

  test('une date d\'échéance invalide est refusée', () => {
    expect(() => taskService.createTask({ title: 'Test', dueDate: 'pas-une-date' })).toThrow(
      "Date d'échéance invalide"
    );
  });
});

describe('taskService - tâches en retard', () => {
  beforeEach(() => {
    taskService.resetTasks();
  });

  const now = new Date('2026-07-05T12:00:00Z');

  // Cas nominal
  test('une tâche avec une échéance passée est en retard', () => {
    const task = taskService.createTask({ title: 'Rendre le TP', dueDate: '2026-07-01' });
    expect(taskService.isLate(task, now)).toBe(true);
  });

  test('une tâche avec une échéance future n\'est pas en retard', () => {
    const task = taskService.createTask({ title: 'Rendre le TP', dueDate: '2026-08-01' });
    expect(taskService.isLate(task, now)).toBe(false);
  });

  // Règle métier importante : une tâche terminée n'est plus en retard
  test('une tâche terminée avec une échéance passée n\'est plus en retard', () => {
    const task = taskService.createTask({ title: 'Rendre le TP', dueDate: '2026-07-01' });
    taskService.completeTask(task.id);
    expect(taskService.isLate(task, now)).toBe(false);
  });

  // Cas limite : pas de date d'échéance
  test('une tâche sans échéance n\'est jamais en retard', () => {
    const task = taskService.createTask({ title: 'Sans échéance' });
    expect(taskService.isLate(task, now)).toBe(false);
  });

  test('countLateTasks compte uniquement les tâches en retard non terminées', () => {
    taskService.createTask({ title: 'En retard 1', dueDate: '2026-07-01' });
    taskService.createTask({ title: 'En retard 2', dueDate: '2026-06-30' });
    taskService.createTask({ title: 'Dans les temps', dueDate: '2026-08-01' });
    const done = taskService.createTask({ title: 'Terminée en retard', dueDate: '2026-07-01' });
    taskService.completeTask(done.id);

    expect(taskService.countLateTasks(now)).toBe(2);
  });
});
