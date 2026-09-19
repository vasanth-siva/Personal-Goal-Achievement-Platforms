import api from './api';

export const profileService = {
  // Retrieve profile details and account metrics
  getProfile: async () => {
    return await api.get('/users/profile');
  },

  // Update name and biography
  updateProfile: async (profileData) => {
    return await api.put('/users/profile', profileData);
  },

  // Change account password
  changePassword: async (passwordData) => {
    return await api.post('/users/change-password', passwordData);
  },
};

export default profileService;
