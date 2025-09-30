const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Socket.io authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return next(new Error('Authentication error: Invalid user'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};

// Socket event handlers
const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.id})`);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    
    // Join project rooms for real-time collaboration
    socket.on('join_project', (projectId) => {
      socket.join(`project_${projectId}`);
      console.log(`User ${socket.user.name} joined project ${projectId}`);
    });

    socket.on('leave_project', (projectId) => {
      socket.leave(`project_${projectId}`);
      console.log(`User ${socket.user.name} left project ${projectId}`);
    });

    // Task events
    socket.on('task_created', (data) => {
      socket.to(`project_${data.projectId}`).emit('task_created', {
        ...data,
        user: {
          id: socket.userId,
          name: socket.user.name,
          avatar: socket.user.avatar
        }
      });
    });

    socket.on('task_updated', (data) => {
      socket.to(`project_${data.projectId}`).emit('task_updated', {
        ...data,
        user: {
          id: socket.userId,
          name: socket.user.name,
          avatar: socket.user.avatar
        }
      });
    });

    socket.on('task_deleted', (data) => {
      socket.to(`project_${data.projectId}`).emit('task_deleted', {
        ...data,
        user: {
          id: socket.userId,
          name: socket.user.name,
          avatar: socket.user.avatar
        }
      });
    });

    // Project events
    socket.on('project_updated', (data) => {
      socket.to(`project_${data.projectId}`).emit('project_updated', {
        ...data,
        user: {
          id: socket.userId,
          name: socket.user.name,
          avatar: socket.user.avatar
        }
      });
    });

    // Comment events
    socket.on('comment_added', (data) => {
      socket.to(`project_${data.projectId}`).emit('comment_added', {
        ...data,
        user: {
          id: socket.userId,
          name: socket.user.name,
          avatar: socket.user.avatar
        }
      });
    });

    // Typing indicators
    socket.on('typing_start', (data) => {
      socket.to(`project_${data.projectId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name,
        taskId: data.taskId
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(`project_${data.projectId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        taskId: data.taskId
      });
    });

    // Online status
    socket.on('user_online', () => {
      socket.broadcast.emit('user_online', {
        userId: socket.userId,
        userName: socket.user.name,
        avatar: socket.user.avatar
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.id})`);
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        userName: socket.user.name
      });
    });
  });
};

// Utility function to emit to project room
const emitToProject = (io, projectId, event, data) => {
  io.to(`project_${projectId}`).emit(event, data);
};

// Utility function to emit to user
const emitToUser = (io, userId, event, data) => {
  io.to(`user_${userId}`).emit(event, data);
};

module.exports = {
  authenticateSocket,
  setupSocketHandlers,
  emitToProject,
  emitToUser
};
