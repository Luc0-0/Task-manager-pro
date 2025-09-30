const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

class AnalyticsService {
  // Get user productivity analytics
  async getUserAnalytics(userId, period = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const [
      taskStats,
      completionTrend,
      priorityDistribution,
      projectStats,
      timeStats
    ] = await Promise.all([
      this.getTaskStats(userId, startDate),
      this.getCompletionTrend(userId, startDate),
      this.getPriorityDistribution(userId, startDate),
      this.getProjectStats(userId, startDate),
      this.getTimeStats(userId, startDate)
    ]);

    return {
      taskStats,
      completionTrend,
      priorityDistribution,
      projectStats,
      timeStats,
      period
    };
  }

  // Get task statistics
  async getTaskStats(userId, startDate) {
    const stats = await Task.aggregate([
      {
        $match: {
          createdBy: userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    const completed = stats.find(s => s._id === 'completed')?.count || 0;
    const inProgress = stats.find(s => s._id === 'in-progress')?.count || 0;
    const todo = stats.find(s => s._id === 'todo')?.count || 0;
    const cancelled = stats.find(s => s._id === 'cancelled')?.count || 0;

    return {
      total,
      completed,
      inProgress,
      todo,
      cancelled,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  // Get completion trend over time
  async getCompletionTrend(userId, startDate) {
    return await Task.aggregate([
      {
        $match: {
          createdBy: userId,
          status: 'completed',
          completedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$completedAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
  }

  // Get priority distribution
  async getPriorityDistribution(userId, startDate) {
    return await Task.aggregate([
      {
        $match: {
          createdBy: userId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);
  }

  // Get project statistics
  async getProjectStats(userId, startDate) {
    const projects = await Project.find({
      $or: [
        { owner: userId },
        { 'collaborators.user': userId }
      ],
      createdAt: { $gte: startDate }
    });

    const projectStats = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const completedTasks = tasks.filter(t => t.status === 'completed');
        
        return {
          projectId: project._id,
          projectName: project.name,
          totalTasks: tasks.length,
          completedTasks: completedTasks.length,
          completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0
        };
      })
    );

    return projectStats;
  }

  // Get time statistics
  async getTimeStats(userId, startDate) {
    const timeStats = await Task.aggregate([
      {
        $match: {
          createdBy: userId,
          createdAt: { $gte: startDate },
          estimatedTime: { $exists: true, $gt: 0 },
          actualTime: { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalEstimated: { $sum: '$estimatedTime' },
          totalActual: { $sum: '$actualTime' },
          count: { $sum: 1 }
        }
      }
    ]);

    if (timeStats.length === 0) {
      return {
        totalEstimated: 0,
        totalActual: 0,
        averageEstimated: 0,
        averageActual: 0,
        timeAccuracy: 0
      };
    }

    const stats = timeStats[0];
    const averageEstimated = stats.totalEstimated / stats.count;
    const averageActual = stats.totalActual / stats.count;
    const timeAccuracy = stats.totalEstimated > 0 ? 
      Math.round((stats.totalActual / stats.totalEstimated) * 100) : 0;

    return {
      totalEstimated: stats.totalEstimated,
      totalActual: stats.totalActual,
      averageEstimated: Math.round(averageEstimated),
      averageActual: Math.round(averageActual),
      timeAccuracy
    };
  }

  // Get productivity insights
  async getProductivityInsights(userId, period = 30) {
    const analytics = await this.getUserAnalytics(userId, period);
    const insights = [];

    // Completion rate insight
    if (analytics.taskStats.completionRate < 50) {
      insights.push({
        type: 'warning',
        title: 'Low Completion Rate',
        message: `Your completion rate is ${analytics.taskStats.completionRate}%. Try breaking down large tasks into smaller ones.`,
        suggestion: 'Consider using subtasks to make tasks more manageable.'
      });
    } else if (analytics.taskStats.completionRate > 80) {
      insights.push({
        type: 'success',
        title: 'Excellent Completion Rate',
        message: `Great job! Your completion rate is ${analytics.taskStats.completionRate}%.`,
        suggestion: 'Keep up the excellent work!'
      });
    }

    // Overdue tasks insight
    const overdueTasks = await Task.countDocuments({
      createdBy: userId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    });

    if (overdueTasks > 0) {
      insights.push({
        type: 'error',
        title: 'Overdue Tasks',
        message: `You have ${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''}.`,
        suggestion: 'Review your overdue tasks and update their due dates or priorities.'
      });
    }

    // Time estimation insight
    if (analytics.timeStats.timeAccuracy < 80 && analytics.timeStats.timeAccuracy > 0) {
      insights.push({
        type: 'info',
        title: 'Time Estimation',
        message: `Your time estimation accuracy is ${analytics.timeStats.timeAccuracy}%.`,
        suggestion: 'Try to improve your time estimation by tracking actual vs estimated time.'
      });
    }

    // Streak insight
    const user = await User.findById(userId);
    if (user.gamification.streak > 7) {
      insights.push({
        type: 'success',
        title: 'Great Streak!',
        message: `You have a ${user.gamification.streak} day streak!`,
        suggestion: 'Keep the momentum going!'
      });
    }

    return insights;
  }

  // Get team analytics (for project owners)
  async getTeamAnalytics(projectId, period = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const teamMembers = [
      { userId: project.owner, role: 'owner' },
      ...project.collaborators.map(c => ({ userId: c.user, role: c.role }))
    ];

    const teamStats = await Promise.all(
      teamMembers.map(async (member) => {
        const user = await User.findById(member.userId);
        const tasks = await Task.find({
          project: projectId,
          $or: [
            { createdBy: member.userId },
            { assignedTo: member.userId }
          ],
          createdAt: { $gte: startDate }
        });

        const completedTasks = tasks.filter(t => t.status === 'completed');
        const assignedTasks = tasks.filter(t => t.assignedTo && t.assignedTo.toString() === member.userId.toString());

        return {
          userId: member.userId,
          userName: user.name,
          role: member.role,
          totalTasks: tasks.length,
          completedTasks: completedTasks.length,
          assignedTasks: assignedTasks.length,
          completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0
        };
      })
    );

    return {
      project: {
        name: project.name,
        totalMembers: teamMembers.length
      },
      teamStats,
      period
    };
  }

  // Get system-wide analytics (admin only)
  async getSystemAnalytics(period = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const [
      userStats,
      taskStats,
      projectStats,
      activityStats
    ] = await Promise.all([
      this.getSystemUserStats(startDate),
      this.getSystemTaskStats(startDate),
      this.getSystemProjectStats(startDate),
      this.getSystemActivityStats(startDate)
    ]);

    return {
      userStats,
      taskStats,
      projectStats,
      activityStats,
      period
    };
  }

  async getSystemUserStats(startDate) {
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: startDate } });

    return {
      totalUsers,
      newUsers,
      activeUsers,
      userGrowth: newUsers
    };
  }

  async getSystemTaskStats(startDate) {
    const totalTasks = await Task.countDocuments();
    const newTasks = await Task.countDocuments({ createdAt: { $gte: startDate } });
    const completedTasks = await Task.countDocuments({ 
      status: 'completed',
      completedAt: { $gte: startDate }
    });

    return {
      totalTasks,
      newTasks,
      completedTasks,
      completionRate: newTasks > 0 ? Math.round((completedTasks / newTasks) * 100) : 0
    };
  }

  async getSystemProjectStats(startDate) {
    const totalProjects = await Project.countDocuments();
    const newProjects = await Project.countDocuments({ createdAt: { $gte: startDate } });
    const activeProjects = await Project.countDocuments({ 
      isArchived: false,
      updatedAt: { $gte: startDate }
    });

    return {
      totalProjects,
      newProjects,
      activeProjects
    };
  }

  async getSystemActivityStats(startDate) {
    // This would typically come from an activity log
    // For now, we'll use task creation as a proxy for activity
    const dailyActivity = await Task.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    return {
      dailyActivity,
      totalActivity: dailyActivity.reduce((sum, day) => sum + day.count, 0)
    };
  }
}

module.exports = new AnalyticsService();
