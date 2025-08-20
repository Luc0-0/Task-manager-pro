import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  User, 
  MessageSquare, 
  CheckCircle2, 
  Circle,
  AlertTriangle,
  Flag
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { updateTask } from '../store/tasksSlice';
import { updateUserXP } from '../store/authSlice';
import toast from 'react-hot-toast';

const TaskCard = ({ task, onClick, isDragging = false }) => {
  const dispatch = useDispatch();

  const priorityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusColors = {
    todo: 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const handleStatusToggle = async (e) => {
    e.stopPropagation();
    
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    
    try {
      const result = await dispatch(updateTask({
        taskId: task._id,
        taskData: { status: newStatus }
      })).unwrap();

      if (result.xpGained > 0) {
        dispatch(updateUserXP({
          xp: result.xpGained,
          levelUp: result.levelUp,
          newLevel: result.levelUp ? result.user?.gamification?.level : null
        }));
        
        toast.success(`Task completed! +${result.xpGained} XP`, {
          icon: '🎉',
        });

        if (result.levelUp) {
          toast.success(`Level up! You're now level ${result.user?.gamification?.level}`, {
            icon: '🚀',
            duration: 5000,
          });
        }
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className={`
        bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 
        p-4 cursor-pointer transition-all duration-200 hover:shadow-md
        ${isDragging ? 'rotate-3 scale-105 shadow-lg' : ''}
        ${isOverdue ? 'border-l-4 border-l-red-500' : ''}
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleStatusToggle}
            className="flex-shrink-0 hover:scale-110 transition-transform"
          >
            {task.status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 hover:text-green-500" />
            )}
          </button>
          
          <h3 className={`font-medium text-gray-900 dark:text-white line-clamp-2 ${
            task.status === 'completed' ? 'line-through text-gray-500' : ''
          }`}>
            {task.title}
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* Priority indicator */}
          <span className={`
            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
            ${priorityColors[task.priority]}
          `}>
            <Flag className="w-3 h-3 mr-1" />
            {task.priority}
          </span>

          {/* Overdue indicator */}
          {isOverdue && (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Progress bar for subtasks */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Subtasks</span>
            <span>{task.completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${task.completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
            >
              #{tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{task.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {/* Due date */}
          {task.dueDate && (
            <div className={`flex items-center space-x-1 ${
              isOverdue ? 'text-red-500' : ''
            }`}>
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
            </div>
          )}

          {/* Estimated time */}
          {task.estimatedTime && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{task.estimatedTime}m</span>
            </div>
          )}

          {/* Assigned user */}
          {task.assignedTo && (
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{task.assignedTo.name}</span>
            </div>
          )}

          {/* Comments count */}
          {task.comments && task.comments.length > 0 && (
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-3 h-3" />
              <span>{task.comments.length}</span>
            </div>
          )}
        </div>

        {/* Status badge */}
        <span className={`
          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
          ${statusColors[task.status]}
        `}>
          {task.status.replace('-', ' ')}
        </span>
      </div>
    </motion.div>
  );
};

export default TaskCard;