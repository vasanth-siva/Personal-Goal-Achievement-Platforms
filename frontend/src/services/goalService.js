import api from './api';

export const goalService = {
  // Check backend health and Supabase DB connection status
  checkHealth: async () => {
    return await api.get('/health');
  },

  // Get list of goals with optional filter parameters
  getAll: async (params = {}) => {
    return await api.get('/goals', { params });
  },

  // Get single goal by ID
  getById: async (id) => {
    return await api.get(`/goals/${id}`);
  },

  // Create a new goal
  create: async (goalData) => {
    return await api.post('/goals', goalData);
  },

  // Update existing goal
  update: async (id, goalData) => {
    return await api.put(`/goals/${id}`, goalData);
  },

  // Delete a goal
  delete: async (id) => {
    return await api.delete(`/goals/${id}`);
  },
};

export default goalService;
