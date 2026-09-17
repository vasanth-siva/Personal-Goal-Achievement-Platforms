import api from './api';

export const authService = {
  // Authenticate user credentials and return JWT
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  // Register a new user account
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  // Retrieve authenticated user profile
  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },

  // Clear local authentication state
  logout: () => {
    localStorage.removeItem('goalforge_auth_token');
    localStorage.removeItem('goalforge_auth_user');
    sessionStorage.removeItem('goalforge_auth_token');
    sessionStorage.removeItem('goalforge_auth_user');
  },
};

export default authService;
