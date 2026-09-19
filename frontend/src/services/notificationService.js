import api from './api';

export const notificationService = {
  // Get all user notifications
  getNotifications: async () => {
    return await api.get('/notifications');
  },

  // Get unread notification count
  getUnreadCount: async () => {
    return await api.get('/notifications/unread-count');
  },

  // Mark single notification as read
  markAsRead: async (id) => {
    return await api.patch(`/notifications/${id}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return await api.patch('/notifications/read-all');
  },

  // Delete a notification
  deleteNotification: async (id) => {
    return await api.delete(`/notifications/${id}`);
  },

  // Clear all notifications
  clearAll: async () => {
    return await api.delete('/notifications');
  },
};

export default notificationService;
