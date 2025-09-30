import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  // Connect to socket server
  connect(token, userId) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const serverUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      auth: {
        token,
        userId
      },
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      this.emit('user_online');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  // Disconnect from socket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Emit event to server
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  // Listen to server events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Store listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      if (this.listeners.has(event)) {
        const listeners = this.listeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
      this.listeners.delete(event);
    }
  }

  // Join project room for real-time collaboration
  joinProject(projectId) {
    this.emit('join_project', { projectId });
  }

  // Leave project room
  leaveProject(projectId) {
    this.emit('leave_project', { projectId });
  }

  // Task events
  emitTaskCreated(task, projectId) {
    this.emit('task_created', { task, projectId });
  }

  emitTaskUpdated(task, projectId) {
    this.emit('task_updated', { task, projectId });
  }

  emitTaskDeleted(taskId, projectId) {
    this.emit('task_deleted', { taskId, projectId });
  }

  // Project events
  emitProjectUpdated(project) {
    this.emit('project_updated', { project, projectId: project._id });
  }

  // Comment events
  emitCommentAdded(comment, taskId, projectId) {
    this.emit('comment_added', { comment, taskId, projectId });
  }

  // Typing indicators
  emitTypingStart(taskId, projectId) {
    this.emit('typing_start', { taskId, projectId });
  }

  emitTypingStop(taskId, projectId) {
    this.emit('typing_stop', { taskId, projectId });
  }

  // Listen to real-time events
  onTaskCreated(callback) {
    this.on('task_created', callback);
  }

  onTaskUpdated(callback) {
    this.on('task_updated', callback);
  }

  onTaskDeleted(callback) {
    this.on('task_deleted', callback);
  }

  onProjectUpdated(callback) {
    this.on('project_updated', callback);
  }

  onCommentAdded(callback) {
    this.on('comment_added', callback);
  }

  onUserTyping(callback) {
    this.on('user_typing', callback);
  }

  onUserStoppedTyping(callback) {
    this.on('user_stopped_typing', callback);
  }

  onUserOnline(callback) {
    this.on('user_online', callback);
  }

  onUserOffline(callback) {
    this.on('user_offline', callback);
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
