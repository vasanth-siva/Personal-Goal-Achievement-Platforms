import api from './api';

export const calendarService = {
  // Get all calendar events (goal deadlines, task deadlines, milestones, completed tasks)
  getEvents: async () => {
    return await api.get('/calendar/events');
  },
};

export default calendarService;
