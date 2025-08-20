import api from './api';

const projectService = {
  getProjects: async () => {
    const response = await api.get('/projects');
    if (response.data.success) {
      return response.data.data.projects;
    }
    throw new Error(response.data.message);
  },
  createProject: async (data) => {
    const response = await api.post('/projects', data);
    if (response.data.success) {
      return response.data.data.project;
    }
    throw new Error(response.data.message);
  },
};

export default projectService;


