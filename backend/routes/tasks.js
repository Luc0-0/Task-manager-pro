const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  getTaskAnalytics,
  bulkUpdateTasks,
  searchTasks,
  getOverdueTasks,
  getTasksDueToday
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { validateTask, validateTaskUpdate } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// Task routes
router.route('/')
  .get(getTasks)
  .post(validateTask, createTask);

// Special task endpoints
router.get('/analytics', getTaskAnalytics);
router.get('/search', searchTasks);
router.get('/overdue', getOverdueTasks);
router.get('/due-today', getTasksDueToday);
router.patch('/bulk', bulkUpdateTasks);

// Individual task routes
router.route('/:id')
  .get(getTask)
  .put(validateTaskUpdate, updateTask)
  .delete(deleteTask);

router.post('/:id/comments', addComment);

module.exports = router;