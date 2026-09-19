import api from './api';

export const achievementService = {
  // Fetch all achievements with unlocked/locked status and calculated progress
  getAchievements: async () => {
    return await api.get('/achievements');
  },

  // Trigger an explicit evaluation check
  checkAchievements: async () => {
    return await api.post('/achievements/check');
  },
};

export default achievementService;
