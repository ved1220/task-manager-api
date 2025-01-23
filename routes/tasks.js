const express = require('express');
const { Task, Project, User } = require('../models');
const { body, param, query, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const sendEmail = require('../middleware/sendEmail');
const { Op } = require('sequelize');
const { checkPermission } = require('../middleware/checkPermission');

const router = express.Router();

router.post('/', authenticateToken,checkPermission('Admin'), [
  body('project_id').isInt({min :1}),
  body('assigned_to').isInt({min:1}),
  body('title').isString().isLength({min :1}),
  body('description').optional(),
  body('due_date').optional().isISO8601(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { project_id, assigned_to, title, description, due_date } = req.body;
  try {
    const task = await Task.create({ project_id, assigned_to, title, description, due_date });
    const user = await User.findByPk(assigned_to);
    if (user) {
      await sendEmail(
        user.email,
        'New Task Assigned',
        `You have been assigned a new task: ${title}`,
      );
    }
    res.status(201).json({ message: 'Task created and email sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get(
  '/',
  authenticateToken,
  [
    query('project_id').optional().isInt(),
    query('assigned_to').optional().isInt(),
    query('status').optional().isString(),
    query('page').optional().isInt({ min: 1 }),
    query('size').optional().isInt({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let { project_id, assigned_to, status, page, size } = req.query;
    page = parseInt(page) || 1; 
    size = parseInt(size) || 10; 

    try {
      const where = {};
      if (project_id) where.project_id = project_id;
      if (assigned_to) where.assigned_to = assigned_to;
      if (status) where.status = status;

      const limit = size; 
      const offset = (page - 1) * limit; 
      const tasks = await Task.findAndCountAll({
        where,
        limit,
        offset,
      });
      res.json({
        totalTasks: tasks.count,
        totalPages: Math.ceil(tasks.count / limit),
        currentPage: page,
        tasks: tasks.rows,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);


router.put('/:id', authenticateToken, [
  param('id').isInt(),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']),
  body('title').optional(),
  body('description').optional(),
  body('due_date').optional().isISO8601(),
], async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await task.update(updates);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, [
  param('id').isInt(),
], async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.destroy({ where: { task_id: id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
