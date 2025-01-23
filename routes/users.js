const express = require('express');
const { User } = require('../models');
const { body, param, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const { Op } = require('sequelize');

const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

//router.use(authenticateAdmin);

router.post('/', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['Admin', 'User']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const { role, page = 1, size = 10 , name } = req.query;

  try {
    const where = name ? { name: { [Op.like]: `%${name}%` } } : {};
    if (role) where.role = role; 

    const limit = parseInt(size);
    const offset = (parseInt(page) - 1) * limit;

    const users = await User.findAndCountAll({
      where,
      limit,
      offset,
    });

    res.json({
      totalUsers: users.count,
      totalPages: Math.ceil(users.count / limit),
      currentPage: parseInt(page),
      users: users.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', [
  param('id').isInt(),
], async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.destroy({ where: { user_id: id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
