import api from './api';

export const phaseService = {
  // Get all phases for a goal
  getPhases: async (goalId) => {
    return await api.get(`/goals/${goalId}/phases`);
  },

  // Add a new phase
  addPhase: async (goalId, phaseData) => {
    return await api.post(`/goals/${goalId}/phases`, phaseData);
  },

  // Update existing phase
  updatePhase: async (goalId, phaseId, phaseData) => {
    return await api.put(`/goals/${goalId}/phases/${phaseId}`, phaseData);
  },

  // Toggle phase completed status
  toggleComplete: async (goalId, phaseId) => {
    return await api.patch(`/goals/${goalId}/phases/${phaseId}/complete`);
  },

  // Delete phase
  deletePhase: async (goalId, phaseId) => {
    return await api.delete(`/goals/${goalId}/phases/${phaseId}`);
  },

  // Reorder phases
  reorderPhases: async (goalId, phaseIds) => {
    return await api.put(`/goals/${goalId}/phases/reorder`, { phaseIds });
  },
};

export default phaseService;
