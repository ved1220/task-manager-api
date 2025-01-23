-- SQL Script to create the database and tables
CREATE DATABASE IF NOT EXISTS taskManagerDB;

USE taskManagerDB;

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'User') DEFAULT 'User',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Projects table
CREATE TABLE IF NOT EXISTS Projects (
  project_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Tasks table
CREATE TABLE IF NOT EXISTS Tasks (
  task_id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  assigned_to INT,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
  due_date DATE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES Projects(project_id),
  FOREIGN KEY (assigned_to) REFERENCES Users(user_id)
);

-- Insert sample data
INSERT INTO Users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', 'adminpassword', 'Admin'),
('Regular User', 'user@example.com', 'userpassword', 'User');

INSERT INTO Projects (name, description) VALUES
('Project 1', 'Description for Project 1'),
('Project 2', 'Description for Project 2');

INSERT INTO Tasks (project_id, assigned_to, title, description, due_date) VALUES
(1, 2, 'Task 1', 'Description for Task 1', '2025-01-25'),
(2, 1, 'Task 2', 'Description for Task 2', '2025-02-25');
