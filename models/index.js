const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

const User = sequelize.define('User', {
  user_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('Admin', 'User'), defaultValue: 'User' },
});

const Project = sequelize.define('Project', {
  project_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
});

const Task = sequelize.define('Task', {
  task_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  project_id: { type: DataTypes.INTEGER, allowNull: false },
  assigned_to: { type: DataTypes.INTEGER },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('Pending', 'In Progress', 'Completed'), defaultValue: 'Pending' },
  due_date: { type: DataTypes.DATE },
});


Project.hasMany(Task, { foreignKey: 'project_id', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'project_id' });
User.hasMany(Task, { foreignKey: 'assigned_to', onDelete: 'SET NULL' });
Task.belongsTo(User, { foreignKey: 'assigned_to' });
module.exports = { sequelize, User, Project, Task };
