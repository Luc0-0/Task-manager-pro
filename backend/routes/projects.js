const express = require('express');
const { getProjects, createProject } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { validateProject } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(validateProject, createProject);

module.exports = router;


