import { useState, useEffect, useCallback } from 'react';
import goalService from '../services/goalService';

const LOCAL_STORAGE_KEY = 'goalforge_goals_cache';

const INITIAL_DEMO_GOALS = [
  {
    id: 1,
    title: 'Master Full-Stack Architecture',
    description: 'Build enterprise-ready full-stack applications with Spring Boot, React, and PostgreSQL.',
    category: 'CAREER',
    progress: 65,
    status: 'IN_PROGRESS',
    targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 2,
    title: 'Run 10km Endurance Race',
    description: 'Maintain a consistent 4-day weekly running schedule and increase stamina.',
    category: 'FITNESS',
    progress: 40,
    status: 'IN_PROGRESS',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 3,
    title: 'Build Financial Freedom Plan',
    description: 'Automate savings, establish emergency fund, and build diversified investment portfolio.',
    category: 'FINANCE',
    progress: 100,
    status: 'COMPLETED',
    targetDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 4,
    title: 'Complete System Design Mastery',
    description: 'Read and summarize 5 major distributed system whitepapers and case studies.',
    category: 'LEARNING',
    progress: 20,
    status: 'PLANNED',
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
];

function getCachedGoals() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn('Failed to read cached goals:', e);
  }
  return INITIAL_DEMO_GOALS;
}

function setCachedGoals(goals) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(goals));
  } catch (e) {
    console.warn('Failed to cache goals:', e);
  }
}

export function useGoals(filters = {}) {
  const [goals, setGoals] = useState(() => getCachedGoals());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await goalService.getAll(filters);
      if (response && response.data && Array.isArray(response.data)) {
        setGoals(response.data);
        setCachedGoals(response.data);
        setIsBackendConnected(true);
      }
    } catch (err) {
      console.info('Backend unreachable or using offline cache:', err.message);
      // Fallback to cached or demo goals without breaking the UI
      const cached = getCachedGoals();
      setGoals(cached);
      setIsBackendConnected(false);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Synchronize across multiple mounted components on goal change
  useEffect(() => {
    const handleGoalChange = () => fetchGoals();
    window.addEventListener('goalChange', handleGoalChange);
    window.addEventListener('goalCreated', handleGoalChange);
    return () => {
      window.removeEventListener('goalChange', handleGoalChange);
      window.removeEventListener('goalCreated', handleGoalChange);
    };
  }, [fetchGoals]);

  const addGoal = async (newGoal) => {
    let createdGoal;
    try {
      const res = await goalService.create(newGoal);
      createdGoal = res.data;
    } catch (err) {
      console.warn('Saving goal locally (backend offline):', err.message);
      createdGoal = {
        id: Date.now(),
        ...newGoal,
        progress: Number(newGoal.progress) || 0,
        status: newGoal.status || (Number(newGoal.progress) === 100 ? 'COMPLETED' : Number(newGoal.progress) > 0 ? 'IN_PROGRESS' : 'PLANNED'),
        targetDate: newGoal.targetDate || new Date().toISOString().split('T')[0],
      };
    }

    setGoals((prev) => {
      const updated = [createdGoal, ...prev.filter((g) => g.id !== createdGoal.id)];
      setCachedGoals(updated);
      return updated;
    });

    window.dispatchEvent(new CustomEvent('goalChange'));
    return createdGoal;
  };

  const updateGoal = async (id, updatedData) => {
    let updated;
    try {
      const res = await goalService.update(id, updatedData);
      updated = res.data;
    } catch (err) {
      console.warn('Updating goal locally (backend offline):', err.message);
      setGoals((prev) => {
        const next = prev.map((g) => (g.id === id ? { ...g, ...updatedData } : g));
        setCachedGoals(next);
        return next;
      });
      window.dispatchEvent(new CustomEvent('goalChange'));
      return { id, ...updatedData };
    }

    setGoals((prev) => {
      const next = prev.map((g) => (g.id === id ? updated : g));
      setCachedGoals(next);
      return next;
    });

    window.dispatchEvent(new CustomEvent('goalChange'));
    return updated;
  };

  const deleteGoal = async (id) => {
    try {
      await goalService.delete(id);
    } catch (err) {
      console.warn('Deleting goal locally (backend offline):', err.message);
    }

    setGoals((prev) => {
      const next = prev.filter((g) => g.id !== id);
      setCachedGoals(next);
      return next;
    });

    window.dispatchEvent(new CustomEvent('goalChange'));
  };

  return {
    goals,
    loading,
    error,
    isBackendConnected,
    reload: fetchGoals,
    addGoal,
    updateGoal,
    deleteGoal,
  };
}

export default useGoals;

