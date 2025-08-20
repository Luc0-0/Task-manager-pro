import api from './api';

const authService = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    
    if (response.data.success) {
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { user, token };
    }
    
    throw new Error(response.data.message);
  },

  // Login user
  login: async (userData) => {
    const response = await api.post('/auth/login', userData);
    
    if (response.data.success) {
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { user, token };
    }
    
    throw new Error(response.data.message);
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    
    if (response.data.success) {
      const { user } = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      return { user };
    }
    
    throw new Error(response.data.message);
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    
    if (response.data.success) {
      const { user } = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      return { user };
    }
    
    throw new Error(response.data.message);
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/password', passwordData);
    
    if (response.data.success) {
      return response.data;
    }
    
    throw new Error(response.data.message);
  },

  // Logout user
  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
      console.log('Logout error:', error);
    }
  },
};

export default authService;