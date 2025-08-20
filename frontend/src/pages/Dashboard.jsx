import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Plus,
  Calendar,
  Target,
  Award
} from 'lucide-react';
import { getTasks, getTaskAnalytics } from '../store/tasksSlice';
import TaskCard from '../components/TaskCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { tasks, isLoading, analytics } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);
  const [selectedPeriod, setSelectedPeriod] = useState('7');

  useEffect(() => {
    dispatch(getTasks({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }));
    dispatch(getTaskAnalytics(selectedPeriod));
  }, [dispatch, selectedPeriod]);

  // Calculate dashboard stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'completed').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    overdue: tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < new Date() && 
      task.status !== 'completed'
    ).length,
  };

  // Get this week's tasks
  const thisWeekTasks = tasks.filter(task => {
    const taskDate = new Date(task.createdAt);
    return isWithinInterval(taskDate, {
      start: startOfWeek(new Date()),
      end: endOfWeek(new Date())
    });
  });

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: Target,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-blue-100">
              You have {stats.inProgress} tasks in progress and {stats.overdue} overdue tasks.
            </p>
          </div>
          
          {/* Gamification Stats */}
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5" />
              <span className="text-lg font-semibold">Level {user?.gamification?.level}</span>
            </div>
            <div className="text-sm text-blue-100">
              {user?.gamification?.xp} XP
            </div>
            <div className="text-sm text-blue-100">
              🔥 {user?.gamification?.streak} day streak
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bgColor} rounded-lg p-6 border border-gray-200 dark:border-gray-700`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Weekly Progress
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <TrendingUp className="w-4 h-4" />
            <span>{completionRate}% completion rate</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Overall Progress</span>
              <span>{stats.completed}/{stats.total} tasks</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {thisWeekTasks.filter(t => t.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-500">Completed this week</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {thisWeekTasks.filter(t => t.status === 'in-progress').length}
              </div>
              <div className="text-xs text-gray-500">In progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {thisWeekTasks.filter(t => t.status === 'todo').length}
              </div>
              <div className="text-xs text-gray-500">To do</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Tasks
          </h2>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </button>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tasks yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Create your first task to get started with your productivity journey.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.slice(0, 6).map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => {
                  // Handle task click - open task details modal
                  console.log('Open task:', task._id);
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full w-12 h-12 mx-auto mb-4">
            <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Create Task</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add a new task to your list
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
          <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full w-12 h-12 mx-auto mb-4">
            <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">View Calendar</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            See your tasks in calendar view
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
          <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full w-12 h-12 mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">View Analytics</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track your productivity
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;