import api from './api';

const taskService = {
  // Get all tasks
  getTasks: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/tasks?${queryString}`);
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message);
  },

  // Get single task
  getTask: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}`);
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message);
  },

  // Create task
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message);
  },

  // Update task
  updateTask: async (taskId, taskData) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message);
  },

  // Delete task
  deleteTask: async (taskId) => {
    const response = await api.delete(`/tasks/${taskId}`);
    
    if (response.data.success) {
      return response.data;
    }
    
    throw new Error(response.data.message);
  },

  // Add comment to task
  addComment: async (taskId, commentData) => {
    const response = await api.post(`/tasks/${taskId}/comments`, commentData);
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message);
  },

  // Get task analytics
  getAnalytics: async (period = '30') => {
    const response = await api.get(`/tasks/analytics?period=${period}`);
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message);
  },

  // Bulk update tasks
  bulkUpdateTasks: async (taskIds, updateData) => {
    const response = await api.patch('/tasks/bulk', {
      taskIds,
      updateData
    });
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message);
  },

  // Search tasks
  searchTasks: async (query) => {
    const response = await api.get(`/tasks/search?q=${encodeURIComponent(query)}`);
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message);
  },
};

export default taskService;