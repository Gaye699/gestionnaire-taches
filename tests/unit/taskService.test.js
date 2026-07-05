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
