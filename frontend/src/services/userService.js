import api from './api';

export const userService = {
  // Get authenticated user's profile and stats
  getProfile: async () => {
    return await api.get('/users/profile');
  },

  // Update authenticated user's profile (name, avatar)
  updateProfile: async (profileData) => {
    return await api.put('/users/profile', profileData);
  },

  // Change password
  changePassword: async (passwordData) => {
    return await api.put('/users/password', passwordData);
  },

  // Update preferences (theme, notifications)
  updatePreferences: async (preferencesData) => {
    return await api.put('/users/preferences', preferencesData);
  },
};

export default userService;
