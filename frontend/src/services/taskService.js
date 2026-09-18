import api from './api';

export const taskService = {
  // Get all tasks across all goals/phases with optional search, status, priority
  getAllTasks: async (params = {}) => {
    return await api.get('/tasks', { params });
  },

  // Get all tasks for a specific phase with optional search, status, priority, sort
  getTasksByPhase: async (phaseId, params = {}) => {
    return await api.get(`/phases/${phaseId}/tasks`, { params });
  },

  // Create a new task inside a phase
  createTask: async (phaseId, taskData) => {
    return await api.post(`/phases/${phaseId}/tasks`, taskData);
  },

  // Update a task (title, description, dueDate, priority, status, completed)
  updateTask: async (taskId, taskData) => {
    return await api.put(`/tasks/${taskId}`, taskData);
  },

  // Delete a task
  deleteTask: async (taskId) => {
    return await api.delete(`/tasks/${taskId}`);
  },

  // Toggle completion helper
  toggleComplete: async (taskId, completed) => {
    return await api.put(`/tasks/${taskId}`, {
      completed,
      status: completed ? 'Completed' : 'Pending',
    });
  },
};

export default taskService;
