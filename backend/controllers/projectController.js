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
 
// Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isCollab = project.collaborators.some(c => c.user.toString() === req.user._id.toString());
    if (!isOwner && !isCollab) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, data: { project } });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update project (owner only)
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can update this project' });
    }
    const { name, description, color, icon, settings, isArchived } = req.body;
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (color !== undefined) project.color = color;
    if (icon !== undefined) project.icon = icon;
    if (settings !== undefined) project.settings = { ...project.settings, ...settings };
    if (isArchived !== undefined) project.isArchived = isArchived;
    await project.save();
    res.json({ success: true, message: 'Project updated', data: { project } });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete project (owner only)
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can delete this project' });
    }
    await project.deleteOne();
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getProjects, createProject, getProject, updateProject, deleteProject };


