const express = require('express');
const { 
  getProjects, 
  createProject, 
  getProject, 
  updateProject, 
  deleteProject,
  addCollaborator,
  removeCollaborator,
  getProjectAnalytics
} = require('../controllers/projectController');
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

router.route('/:id/analytics')
  .get(getProjectAnalytics);

router.route('/:id/collaborators')
  .post(addCollaborator);

router.route('/:id/collaborators/:userId')
  .delete(removeCollaborator);

module.exports = router;


