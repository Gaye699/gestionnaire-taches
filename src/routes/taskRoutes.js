const express = require('express');
const taskService = require('../domain/taskService');

const router = express.Router();

// Liste des tâches (avec filtre optionnel ?status=terminee|en-cours)
router.get('/', (req, res) => {
  try {
    if (req.query.status) {
      return res.json(taskService.filterByStatus(req.query.status));
    }
    return res.json(taskService.getTasks());
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Nombre de tâches en retard
router.get('/late/count', (req, res) => {
  res.json({ count: taskService.countLateTasks() });
});

// Créer une tâche
router.post('/', (req, res) => {
  try {
    const task = taskService.createTask(req.body);
    return res.status(201).json(task);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Modifier une tâche
router.put('/:id', (req, res) => {
  try {
    const task = taskService.updateTask(Number(req.params.id), req.body);
    return res.json(task);
  } catch (err) {
    if (err.message === 'Tâche introuvable') {
      return res.status(404).json({ error: err.message });
    }
    return res.status(400).json({ error: err.message });
  }
});

// Marquer une tâche comme terminée
router.patch('/:id/done', (req, res) => {
  try {
    const task = taskService.completeTask(Number(req.params.id));
    return res.json(task);
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
});

module.exports = router;
