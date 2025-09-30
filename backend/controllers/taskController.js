const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      project,
      tags,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {
      $or: [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ],
      isArchived: false
    };

    // Add filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (project) query.project = project;
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) {
      query.$and = [
        query.$or ? { $or: query.$or } : {},
        {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      ];
      delete query.$or;
    }

    // Execute query with pagination
    const tasks = await Task.find(query)
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('dependencies', 'title status')
      .populate('comments.user', 'name avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check access
    const hasAccess = task.createdBy._id.toString() === req.user._id.toString() ||
                     (task.assignedTo && task.assignedTo._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task'
      });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Validate project access
    const project = await Project.findById(taskData.project);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const task = await Task.create(taskData);
    
    // Update project stats
    await project.updateStats();
    
    // Add XP to user
    const xpResult = req.user.addXP(10);
    await req.user.save();

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { 
        task: populatedTask,
        xpGained: 10,
        levelUp: xpResult.levelUp
      }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check access
    const hasAccess = task.createdBy.toString() === req.user._id.toString() ||
                     (task.assignedTo && task.assignedTo.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    const wasCompleted = task.status === 'completed';
    
    task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('project', 'name color')
     .populate('assignedTo', 'name email avatar')
     .populate('createdBy', 'name email avatar');

    // Update project stats
    const project = await Project.findById(task.project._id);
    await project.updateStats();

    // Award XP for task completion
    let xpGained = 0;
    let levelUp = false;
    if (!wasCompleted && task.status === 'completed') {
      const xpPoints = task.priority === 'urgent' ? 50 : 
                      task.priority === 'high' ? 30 : 
                      task.priority === 'medium' ? 20 : 10;
      const xpResult = req.user.addXP(xpPoints);
      await req.user.save();
      xpGained = xpPoints;
      levelUp = xpResult.levelUp;
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { 
        task,
        xpGained,
        levelUp
      }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check access
    if (task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Update project stats
    const project = await Project.findById(task.project);
    if (project) {
      await project.updateStats();
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.comments.push({
      user: req.user._id,
      text
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('comments.user', 'name avatar');

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: { comments: updatedTask.comments }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get task analytics
// @route   GET /api/tasks/analytics
// @access  Private
const getTaskAnalytics = async (req, res) => {
  try {
    const analyticsService = require('../utils/analyticsService');
    const userId = req.user._id;
    const { period = '30' } = req.query;
    
    const analytics = await analyticsService.getUserAnalytics(userId, parseInt(period));
    const insights = await analyticsService.getProductivityInsights(userId, parseInt(period));

    res.json({
      success: true,
      data: {
        ...analytics,
        insights
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Bulk update tasks
// @route   PATCH /api/tasks/bulk
// @access  Private
const bulkUpdateTasks = async (req, res) => {
  try {
    const { taskIds, updateData } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task IDs array is required'
      });
    }

    // Verify all tasks belong to user
    const tasks = await Task.find({
      _id: { $in: taskIds },
      $or: [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ]
    });

    if (tasks.length !== taskIds.length) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update some tasks'
      });
    }

    // Bulk update
    const result = await Task.updateMany(
      { _id: { $in: taskIds } },
      { $set: updateData }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} tasks updated successfully`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search tasks
// @route   GET /api/tasks/search
// @access  Private
const searchTasks = async (req, res) => {
  try {
    const { q, project, status, priority, tags, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    // Build search query
    const query = {
      $or: [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ],
      isArchived: false,
      $text: { $search: q }
    };

    // Add filters
    if (project) query.project = project;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (tags) query.tags = { $in: tags.split(',') };

    const tasks = await Task.find(query)
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Search tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get overdue tasks
// @route   GET /api/tasks/overdue
// @access  Private
const getOverdueTasks = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const query = {
      $or: [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ],
      isArchived: false,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    };

    const tasks = await Task.find(query)
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ dueDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get tasks due today
// @route   GET /api/tasks/due-today
// @access  Private
const getTasksDueToday = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const query = {
      $or: [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ],
      isArchived: false,
      dueDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'completed' }
    };

    const tasks = await Task.find(query)
      .populate('project', 'name color')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ priority: 1, dueDate: 1 });

    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Get tasks due today error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
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
};