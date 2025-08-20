const Project = require('../models/Project');

// @desc    Get projects for current user (owner or collaborator)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { 'collaborators.user': userId }
      ],
      isArchived: false,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: { projects } });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { name, description, color, icon, settings } = req.body;

    const project = await Project.create({
      name,
      description,
      color,
      icon,
      owner: req.user._id,
      settings,
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project },
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getProjects, createProject };


