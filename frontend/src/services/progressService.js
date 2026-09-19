import api from './api';

export const progressService = {
  // Get aggregated progress statistics, charts data, and streaks
  getStatistics: async () => {
    return await api.get('/progress/stats');
  },

  // Get all user daily progress logs
  getLogs: async () => {
    return await api.get('/progress/logs');
  },

  // Create a new daily progress reflection note
  createLog: async (logData) => {
    return await api.post('/progress/logs', logData);
  },

  // Update a daily progress log
  updateLog: async (id, logData) => {
    return await api.put(`/progress/logs/${id}`, logData);
  },

  // Delete a daily progress log
  deleteLog: async (id) => {
    return await api.delete(`/progress/logs/${id}`);
  },
};

export default progressService;
