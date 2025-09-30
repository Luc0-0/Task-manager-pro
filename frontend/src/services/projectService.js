import api from './api';

const projectService = {
  // Get all projects
  getProjects: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/projects?${queryString}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message);
  },

  // Get single project
  getProject: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    if (response.data.success) {
      return response.data.data.project;
    }
    throw new Error(response.data.message);
  },

  // Create project
  createProject: async (data) => {
    const response = await api.post('/projects', data);
    if (response.data.success) {
      return response.data.data.project;
    }
    throw new Error(response.data.message);
  },

  // Update project
  updateProject: async (projectId, data) => {
    const response = await api.put(`/projects/${projectId}`, data);
    if (response.data.success) {
      return response.data.data.project;
    }
    throw new Error(response.data.message);
  },

  // Delete project
  deleteProject: async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`);
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message);
  },

  // Add collaborator
  addCollaborator: async (projectId, collaboratorData) => {
    const response = await api.post(`/projects/${projectId}/collaborators`, collaboratorData);
    if (response.data.success) {
      return response.data.data.project;
    }
    throw new Error(response.data.message);
  },

  // Remove collaborator
  removeCollaborator: async (projectId, userId) => {
    const response = await api.delete(`/projects/${projectId}/collaborators/${userId}`);
    if (response.data.success) {
      return response.data.data.project;
    }
    throw new Error(response.data.message);
  },

  // Get project analytics
  getProjectAnalytics: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/analytics`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message);
  },

  // Search projects
  searchProjects: async (query) => {
    const response = await api.get(`/projects/search?q=${encodeURIComponent(query)}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message);
  }
};

export default projectService;


