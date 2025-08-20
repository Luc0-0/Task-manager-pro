const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  getTaskAnalytics
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

router.get('/analytics', getTaskAnalytics);

router.route('/:id')
  .get(getTask)
  .put(validateTaskUpdate, updateTask)
  .delete(deleteTask);

router.post('/:id/comments', addComment);

module.exports = router;