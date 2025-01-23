const express = require('express');
const { Project } = require('../models');
const { body, param, query, validationResult } = require('express-validator');
const { authenticateAdmin, authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');

const router = express.Router();

router.post('/', authenticateToken , checkPermission('Admin'),[
  body('name').notEmpty(),
  body('description').optional(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, description } = req.body;
  try {
    const project = await Project.create({ name, description });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/',authenticateToken,checkPermission('Admin'),[
    query('page').optional().isInt({ min: 1 }).withMessage({ min: 1}),
    query('size').optional().isInt({ min: 1 }).withMessage({min: 1}),
    query('name').optional().isString().withMessage('Name must be a valid string'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { page, size, name } = req.query;
    const currentPage = parseInt(page) || 1;
    const limit = parseInt(size) || 10; 
    const offset = (currentPage - 1) * limit;

    try {
      const where = name ? { name: { [Op.like]: `%${name}%` } } : {};
      const projects = await Project.findAndCountAll({
        where,
        limit,
        offset,
      });
      res.json({
        total: projects.count, 
        projects: projects.rows, 
        currentPage,
        totalPages: Math.ceil(projects.count / limit), 
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;

router.put('/:id',authenticateToken,checkPermission('Admin'), [
  param('id').isInt(),
  body('name').optional(),
  body('description').optional(),
], async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    await project.update({ name, description });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id',authenticateToken,checkPermission('Admin'), [
  param('id').isInt(),
], async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.destroy({ where: { project_id: id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
