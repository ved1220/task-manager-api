const express = require('express');
const { sequelize } = require('./models');
const errorHandler = require('./middleware/errorHandler');
const app = express();
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
require('dotenv').config();
app.use(express.json());
app.use(require('cors')());
app.use(errorHandler);

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

sequelize.sync({ alter: true }).then(() => {
  console.log('Database connected.');
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});
