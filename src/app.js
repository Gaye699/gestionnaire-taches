const express = require('express');
const path = require('path');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api/tasks', taskRoutes);

module.exports = app;
