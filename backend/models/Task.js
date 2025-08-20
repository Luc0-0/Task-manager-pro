const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Subtask title cannot exceed 200 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed', 'cancelled'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(date) {
        return !date || date > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  completedAt: Date,
  estimatedTime: {
    type: Number, // in minutes
    min: [1, 'Estimated time must be at least 1 minute']
  },
  actualTime: {
    type: Number, // in minutes
    default: 0
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  subtasks: [subtaskSchema],
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  recurrence: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    interval: {
      type: Number,
      min: 1,
      default: 1
    },
    endDate: Date,
    nextDue: Date
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'push', 'sms'],
      default: 'push'
    },
    time: {
      type: Number, // minutes before due date
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  order: {
    type: Number,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1, dueDate: 1 });
taskSchema.index({ tags: 1 });
taskSchema.index({ createdBy: 1, createdAt: -1 });

// Virtual for completion percentage based on subtasks
taskSchema.virtual('completionPercentage').get(function() {
  if (this.subtasks.length === 0) {
    return this.status === 'completed' ? 100 : 0;
  }
  const completed = this.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completed / this.subtasks.length) * 100);
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < new Date() && this.status !== 'completed';
});

// Pre-save middleware to handle task completion
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.completedAt = new Date();
    // Mark all subtasks as completed
    this.subtasks.forEach(subtask => {
      if (!subtask.completed) {
        subtask.completed = true;
        subtask.completedAt = new Date();
      }
    });
  } else if (this.isModified('status') && this.status !== 'completed') {
    this.completedAt = undefined;
  }
  
  // Auto-update status based on subtasks
  if (this.subtasks.length > 0) {
    const completedSubtasks = this.subtasks.filter(subtask => subtask.completed).length;
    if (completedSubtasks === this.subtasks.length && this.status !== 'completed') {
      this.status = 'completed';
      this.completedAt = new Date();
    } else if (completedSubtasks > 0 && this.status === 'todo') {
      this.status = 'in-progress';
    }
  }
  
  next();
});

// Method to create recurring task
taskSchema.methods.createRecurringTask = function() {
  if (!this.recurrence.type) return null;
  
  const nextTask = new this.constructor({
    title: this.title,
    description: this.description,
    priority: this.priority,
    project: this.project,
    assignedTo: this.assignedTo,
    createdBy: this.createdBy,
    tags: this.tags,
    subtasks: this.subtasks.map(st => ({ title: st.title, order: st.order })),
    recurrence: this.recurrence,
    estimatedTime: this.estimatedTime,
    reminders: this.reminders.map(r => ({ type: r.type, time: r.time }))
  });
  
  // Calculate next due date
  const nextDue = new Date(this.dueDate);
  switch (this.recurrence.type) {
    case 'daily':
      nextDue.setDate(nextDue.getDate() + this.recurrence.interval);
      break;
    case 'weekly':
      nextDue.setDate(nextDue.getDate() + (7 * this.recurrence.interval));
      break;
    case 'monthly':
      nextDue.setMonth(nextDue.getMonth() + this.recurrence.interval);
      break;
    case 'yearly':
      nextDue.setFullYear(nextDue.getFullYear() + this.recurrence.interval);
      break;
  }
  
  nextTask.dueDate = nextDue;
  nextTask.recurrence.nextDue = nextDue;
  
  return nextTask;
};

module.exports = mongoose.model('Task', taskSchema);