const express = require('express');
const { getProjects, createProject, getProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { validateProject } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(validateProject, createProject);

router.route('/:id')
  .get(getProject)
  .put(validateProject, updateProject)
  .delete(deleteProject);

module.exports = router;


