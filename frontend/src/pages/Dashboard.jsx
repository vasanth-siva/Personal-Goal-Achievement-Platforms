import React, { useState, useEffect, useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useGoals from '../hooks/useGoals';
import GoalCard from '../components/GoalCard';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { StatCardSkeleton, GoalCardSkeleton } from '../components/Skeleton';
import ProgressBar from '../components/ProgressBar';
import { useToast } from '../components/Toast';
import { formatDate, getCategoryInfo } from '../utils/formatters';
import achievementService from '../services/achievementService';
import progressService from '../services/progressService';
import './Dashboard.css';

const DEFAULT_WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function Dashboard() {
  const { user } = useAuth();
  const { goals, loading, reload, deleteGoal, updateGoal } = useGoals();
  const outletContext = useOutletContext();
  const toast = useToast();

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('goalforge_today_tasks');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [realAchievements, setRealAchievements] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [achRes, statsRes] = await Promise.all([
          achievementService.getAchievements().catch(() => null),
          progressService.getStatistics().catch(() => null),
        ]);
        if (achRes && achRes.data?.unlocked) {
          setRealAchievements(achRes.data.unlocked);
        }
        if (statsRes && statsRes.data?.weeklyTrend) {
          setWeeklyStats(statsRes.data.weeklyTrend);
        }
      } catch {
        // graceful fallback
      }
    };
    fetchDashboardData();
    window.addEventListener('goalChange', fetchDashboardData);
    window.addEventListener('taskChange', fetchDashboardData);
    return () => {
      window.removeEventListener('goalChange', fetchDashboardData);
      window.removeEventListener('taskChange', fetchDashboardData);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('goalforge_today_tasks', JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  // Greeting based on current local hour
  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const userName = user?.fullName || user?.name || 'Alex';

  // Global Goal Modal Trigger
  const openCreateModal = () => {
    if (outletContext?.openCreateGoalModal) {
      outletContext.openCreateGoalModal();
    } else {
      window.dispatchEvent(new CustomEvent('openNewGoalModal'));
    }
  };

  // Goal update actions
  const handleUpdateProgress = async (id, updatedData) => {
    try {
      await updateGoal(id, updatedData);
      if (updatedData.status === 'COMPLETED') {
        toast.success('Goal accomplished! Fantastic execution.', 'Milestone Achieved');
      } else {
        toast.info(`Goal progress updated to ${updatedData.progress}%.`, 'Progress Recorded');
      }
    } catch {
      toast.error('Failed to update progress.', 'Update Error');
    }
  };

  // Goal Delete Confirmation State
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [isDeletingGoal, setIsDeletingGoal] = useState(false);

  const promptDeleteGoal = (goal) => {
    setGoalToDelete(goal);
  };

  const handleConfirmDeleteGoal = async () => {
    if (!goalToDelete) return;
    try {
      setIsDeletingGoal(true);
      await deleteGoal(goalToDelete.id);
      toast.info(`"${goalToDelete.title}" removed from active plan.`, 'Goal Deleted');
      setGoalToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to remove goal.', 'Delete Error');
    } finally {
      setIsDeletingGoal(false);
    }
  };

  // Task Actions
  const toggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const addTask = (e) => {
    e.preventDefault();
    const trimmed = newTaskInput.trim();
    if (!trimmed) return;
    const newTask = {
      id: Date.now(),
      text: trimmed,
      category: 'GENERAL',
      completed: false,
    };
    setTasks((prev) => [newTask, ...prev]);
    setNewTaskInput('');
    toast.success('Task scheduled for today.', 'Task Added');
  };

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Computed Statistics
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => (g.status || '').toUpperCase() === 'COMPLETED').length;
  const activeGoals = goals.filter((g) => (g.status || '').toUpperCase() === 'IN_PROGRESS').length;
  const currentStreak = '14 Days';

  // Average Progress
  const overallProgress = totalGoals > 0
    ? Math.round(goals.reduce((acc, g) => acc + (Number(g.progress) || 0), 0) / totalGoals)
    : 0;

  // Category breakdown calculation
  const categories = ['CAREER', 'FITNESS', 'FINANCE', 'LEARNING'];
  const categoryProgress = useMemo(() => {
    return categories.map((cat) => {
      const catGoals = goals.filter((g) => (g.category || '').toUpperCase() === cat);
      const avg = catGoals.length > 0
        ? Math.round(catGoals.reduce((acc, g) => acc + (Number(g.progress) || 0), 0) / catGoals.length)
        : 0;
      const info = getCategoryInfo(cat);
      return {
        key: cat,
        label: info.label,
        color: info.color,
        icon: info.icon,
        progress: avg,
        count: catGoals.length,
      };
    });
  }, [goals]);

  // Upcoming Deadlines (sorted by nearest target date)
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return goals
      .filter((g) => g.targetDate && (g.status || '').toUpperCase() !== 'COMPLETED')
      .map((g) => {
        const target = new Date(g.targetDate);
        const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...g,
          diffDays,
        };
      })
      .sort((a, b) => a.diffDays - b.diffDays)
      .slice(0, 4);
  }, [goals]);

  // Active Goals for section 1
  const displayedGoals = useMemo(() => {
    return goals.filter((g) => {
      if (activeCategory === 'ALL') return true;
      return (g.category || '').toUpperCase() === activeCategory;
    });
  }, [goals, activeCategory]);

  // Today's day index for weekly chart
  const currentDayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
  const adjustedDayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1; // 0 is Mon, 6 is Sun

  const chartDays = useMemo(() => {
    if (Array.isArray(weeklyStats) && weeklyStats.length > 0) {
      return weeklyStats.map((item) => ({
        day: item.day || item.name || 'Day',
        value: Number(item.progressPercentage || item.value || item.progress || 0),
        label: `${item.progressPercentage || item.value || 0}% velocity`,
      }));
    }
    return DEFAULT_WEEK_DAYS.map((d) => ({
      day: d,
      value: 0,
      label: '0 tasks logged',
    }));
  }, [weeklyStats]);

  const completedTasksCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="container-saas dashboard-page">
      {/* 1. Header / Greeting Section */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-header">
          <div>
            <div className="dashboard-greeting-tag">
              <span>🚀</span>
              <span>Personal Momentum Engine</span>
            </div>
            <h1 className="dashboard-greeting-title">
              {greetingText}, <span style={{ color: 'var(--color-primary)' }}>{userName}</span> 👋
            </h1>
            <p className="dashboard-subtitle">
              Let's make progress toward your goals today.
            </p>
          </div>

          <div className="dashboard-hero-actions">
            <Button variant="primary" onClick={openCreateModal} icon={<span>+</span>} id="btn-dashboard-new-goal">
              Create Goal
            </Button>
            <Link to="/goals">
              <Button variant="outline" id="btn-dashboard-all-goals">
                View All Goals &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. 4 Key Statistics Cards */}
      <section className="stats-grid">
        {/* Total Goals */}
        <Card variant="default" padding="md" className="stat-card animate-fadeIn">
          <div className="stat-card-inner">
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              🎯
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Goals</p>
              <div className="stat-value-row">
                <h3 className="stat-value">{loading ? '...' : totalGoals}</h3>
                <span className="stat-badge" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                  Tracked
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Active Goals */}
        <Card variant="default" padding="md" className="stat-card animate-fadeIn">
          <div className="stat-card-inner">
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--color-secondary-light)', color: 'var(--color-secondary)' }}>
              ⚡
            </div>
            <div className="stat-info">
              <p className="stat-label">Active Goals</p>
              <div className="stat-value-row">
                <h3 className="stat-value">{loading ? '...' : activeGoals}</h3>
                <span className="stat-badge" style={{ backgroundColor: 'var(--color-secondary-light)', color: 'var(--color-secondary-hover)' }}>
                  In Flight
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Completed Goals */}
        <Card variant="default" padding="md" className="stat-card animate-fadeIn">
          <div className="stat-card-inner">
            <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}>
              🏆
            </div>
            <div className="stat-info">
              <p className="stat-label">Completed Goals</p>
              <div className="stat-value-row">
                <h3 className="stat-value">{loading ? '...' : completedGoals}</h3>
                <span className="stat-badge" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success-text)' }}>
                  Done
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Current Streak */}
        <Card variant="default" padding="md" className="stat-card animate-fadeIn">
          <div className="stat-card-inner">
            <div className="stat-icon-wrapper" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>
              🔥
            </div>
            <div className="stat-info">
              <p className="stat-label">Current Streak</p>
              <div className="stat-value-row">
                <h3 className="stat-value">{currentStreak}</h3>
                <span className="stat-badge" style={{ backgroundColor: '#ffedd5', color: '#c2410c' }}>
                  Top 5%
                </span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 3. Main Dashboard 2-Column Responsive Layout */}
      <div className="dashboard-main-grid">
        {/* Left / Primary Column */}
        <div className="dashboard-column">
          {/* Section 1: Active Goals */}
          <section id="section-active-goals">
            <div className="section-header">
              <div className="section-title-wrap">
                <h2 className="section-title">Active Goals</h2>
                <p className="section-subtitle">Core targets and milestones currently in execution</p>
              </div>

              {/* Category Filter Chips */}
              <div className="category-filter-bar">
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'CAREER', label: '💼 Career' },
                  { id: 'FITNESS', label: '⚡ Fitness' },
                  { id: 'FINANCE', label: '💰 Finance' },
                  { id: 'LEARNING', label: '📚 Learning' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`filter-chip ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}

                <Button variant="ghost" size="sm" onClick={() => reload()} title="Refresh goals">
                  🔄
                </Button>
              </div>
            </div>

            {loading && goals.length === 0 ? (
              <div className="goals-grid">
                <GoalCardSkeleton />
                <GoalCardSkeleton />
                <GoalCardSkeleton />
              </div>
            ) : displayedGoals.length === 0 ? (
              <EmptyState
                icon="🎯"
                title={activeCategory === 'ALL' ? 'No goals forged yet' : `No ${activeCategory.toLowerCase()} goals found`}
                description={
                  activeCategory === 'ALL'
                    ? 'Transform your aspirations into actionable objectives with structured phases and deadlines.'
                    : `You don't have any goals under the ${activeCategory} discipline right now.`
                }
                actionLabel="Forge a Goal"
                onAction={openCreateModal}
                secondaryLabel={activeCategory !== 'ALL' ? 'View All Goals' : undefined}
                onSecondaryAction={activeCategory !== 'ALL' ? () => setActiveCategory('ALL') : undefined}
              />
            ) : (
              <div className="goals-grid">
                {displayedGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdateProgress={handleUpdateProgress}
                    onDelete={() => promptDeleteGoal(goal)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Section 2: Today's Tasks (id="tasks" for direct anchor navigation) */}
          <section id="tasks">
            <Card variant="default" padding="lg">
              <div className="section-header" style={{ marginBottom: '1rem' }}>
                <div className="section-title-wrap">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h2 className="section-title">Today's Tasks</h2>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                      }}
                    >
                      {completedTasksCount} of {tasks.length} completed
                    </span>
                  </div>
                  <p className="section-subtitle">Micro-commitments driving your high-level objectives</p>
                </div>
              </div>

              {/* Tasks Checklist */}
              <div className="tasks-container">
                {tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>🎯</div>
                    <p style={{ margin: 0 }}>No daily tasks committed yet. Add a quick commitment below to build momentum!</p>
                  </div>
                ) : (
                  tasks.map((task) => {
                  const catInfo = getCategoryInfo(task.category);
                  return (
                    <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                      <div className="task-left">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                          className="task-checkbox"
                          id={`task-${task.id}`}
                        />
                        <label htmlFor={`task-${task.id}`} className="task-label">
                          {task.text}
                        </label>
                      </div>

                      <div className="task-meta">
                        <span
                          className="task-category-tag"
                          style={{
                            backgroundColor: `${catInfo.color}14`,
                            color: catInfo.color,
                            border: `1px solid ${catInfo.color}25`,
                          }}
                        >
                          {catInfo.icon} {task.category}
                        </span>
                        <button
                          type="button"
                          className="task-delete-btn"
                          onClick={() => deleteTask(task.id)}
                          title="Delete task"
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

                {/* Inline Quick Add Task */}
                <form onSubmit={addTask} className="task-add-form">
                  <input
                    type="text"
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    placeholder="Add a new task for today... (Press Enter)"
                    className="task-add-input"
                    id="input-add-task"
                  />
                  <Button type="submit" variant="primary" size="sm">
                    Add Task
                  </Button>
                </form>
              </div>
            </Card>
          </section>

          {/* Section 4: Weekly Activity Chart */}
          <section id="section-weekly-activity">
            <Card variant="default" padding="lg">
              <div className="section-header" style={{ marginBottom: '0.75rem' }}>
                <div className="section-title-wrap">
                  <h2 className="section-title">Weekly Activity</h2>
                  <p className="section-subtitle">Daily effort distribution and momentum over the past 7 days</p>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--color-success)',
                    backgroundColor: 'var(--color-success-light)',
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  ⚡ +18% vs last week
                </span>
              </div>

              <div className="weekly-chart-wrapper">
                <div className="weekly-chart">
                  {chartDays.map((item, index) => {
                    const isToday = index === adjustedDayIndex;
                    const maxVal = Math.max(10, ...chartDays.map((d) => d.value));
                    const heightPercent = maxVal > 0 ? Math.round((item.value / maxVal) * 100) : 0;

                    return (
                      <div key={item.day} className="chart-day-col">
                        <div className="chart-bar-container">
                          <span className="chart-bar-val">{item.value}</span>
                          <div
                            className={`chart-bar ${isToday ? 'today' : ''}`}
                            style={{ height: `${heightPercent}%` }}
                            title={`${item.day}: ${item.label}`}
                          />
                        </div>
                        <span className={`chart-day-label ${isToday ? 'today' : ''}`}>
                          {item.day} {isToday ? '•' : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="weekly-footer-stat">
                  <span>
                    <strong>{completedTasksCount} tasks</strong> completed today
                  </span>
                  <span>
                    Active focus streak: <strong>{user?.currentStreak || 0} days</strong>
                  </span>
                </div>
              </div>
            </Card>
          </section>
        </div>

        {/* Right / Secondary Column */}
        <div className="dashboard-column">
          {/* Section 3: Overall Progress */}
          <section id="section-overall-progress">
            <Card variant="default" padding="lg" className="progress-ring-card">
              <div className="section-title-wrap">
                <h2 className="section-title">Overall Progress</h2>
                <p className="section-subtitle">Cumulative completion rate across active objectives</p>
              </div>

              {/* Radial Gauge */}
              <div className="radial-progress-wrapper">
                <svg width="140" height="140" viewBox="0 0 140 140" className="radial-chart-svg">
                  <circle
                    cx="70"
                    cy="70"
                    r="56"
                    strokeWidth="12"
                    fill="none"
                    className="radial-track"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="56"
                    strokeWidth="12"
                    fill="none"
                    className="radial-fill"
                    strokeDasharray={2 * Math.PI * 56}
                    strokeDashoffset={(2 * Math.PI * 56) * (1 - overallProgress / 100)}
                  />
                  <text x="70" y="70" className="radial-center-text">
                    {overallProgress}%
                  </text>
                </svg>

                <div>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      marginBottom: '0.4rem',
                    }}
                  >
                    Discipline Velocity
                  </div>
                  <h4 style={{ fontSize: '1.2rem', margin: '0 0 0.3rem', color: 'var(--color-text-primary)' }}>
                    High Execution
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    {completedGoals} achieved out of {totalGoals} planned targets
                  </p>
                </div>
              </div>

              {/* Category Breakdown Bars */}
              <div className="category-bars-list">
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Progress by Discipline
                </h4>
                {categoryProgress.map((cat) => (
                  <div key={cat.key} className="category-bar-item">
                    <div className="category-bar-header">
                      <span>
                        {cat.icon} {cat.label} ({cat.count})
                      </span>
                      <span style={{ color: cat.color }}>{cat.progress}%</span>
                    </div>
                    <div className="category-bar-track">
                      <div
                        className="category-bar-fill"
                        style={{
                          width: `${cat.progress}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Section 6: Upcoming Deadlines */}
          <section id="section-upcoming-deadlines">
            <Card variant="default" padding="lg">
              <div className="section-header" style={{ marginBottom: '1rem' }}>
                <div className="section-title-wrap">
                  <h2 className="section-title">Upcoming Deadlines</h2>
                  <p className="section-subtitle">Target dates approaching in your schedule</p>
                </div>
              </div>

              <div className="deadline-list">
                {upcomingDeadlines.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                    No upcoming deadlines set.
                  </p>
                ) : (
                  upcomingDeadlines.map((goal) => {
                    const catInfo = getCategoryInfo(goal.category);
                    const isUrgent = goal.diffDays <= 7;
                    return (
                      <div key={goal.id} className="deadline-item">
                        <div className="deadline-info">
                          <span className="deadline-title" title={goal.title}>
                            {goal.title}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: catInfo.color, fontWeight: '600' }}>
                              {catInfo.icon} {catInfo.label}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              • {formatDate(goal.targetDate)}
                            </span>
                          </div>
                        </div>

                        <span
                          className="deadline-badge"
                          style={{
                            backgroundColor: isUrgent ? 'var(--color-danger-light)' : 'var(--color-primary-light)',
                            color: isUrgent ? 'var(--color-danger-text)' : 'var(--color-primary)',
                            border: `1px solid ${isUrgent ? 'var(--color-danger-border)' : 'var(--color-primary-border)'}`,
                          }}
                        >
                          {goal.diffDays <= 0
                            ? 'Due today'
                            : goal.diffDays === 1
                            ? '1 day left'
                            : `${goal.diffDays} days left`}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </section>

          {/* Section 5: Recent Achievements */}
          <section id="section-recent-achievements">
            <Card variant="default" padding="lg">
              <div className="section-header" style={{ marginBottom: '1rem' }}>
                <div className="section-title-wrap">
                  <h2 className="section-title">Recent Achievements</h2>
                  <p className="section-subtitle">Milestones and honor badges unlocked</p>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: '#d97706',
                    backgroundColor: '#fef3c7',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {realAchievements.length} Unlocked
                </span>
              </div>

              <div className="achievement-list">
                {realAchievements.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>🌟</div>
                    <p style={{ margin: 0 }}>No achievements unlocked yet. Create a goal and conquer your tasks to earn badges!</p>
                  </div>
                ) : (
                  realAchievements.slice(0, 4).map((ach) => (
                    <div key={ach.id || ach.achievementType} className="achievement-card">
                      <div
                        className="achievement-icon-wrap"
                        style={{ backgroundColor: ach.iconBackground || '#fef3c7', color: ach.iconColor || '#d97706' }}
                      >
                        {ach.icon || '🏆'}
                      </div>
                      <div className="achievement-details">
                        <div className="achievement-title-row">
                          <h4 className="achievement-title">{ach.title}</h4>
                          <span className="achievement-date">
                            {ach.unlockedAt ? formatDate(ach.unlockedAt) : 'Unlocked'}
                          </span>
                        </div>
                        <p className="achievement-desc">{ach.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </section>
        </div>
      </div>

      {/* Standardized Delete Goal ConfirmModal */}
      <ConfirmModal
        isOpen={!!goalToDelete}
        onClose={() => !isDeletingGoal && setGoalToDelete(null)}
        onConfirm={handleConfirmDeleteGoal}
        title={`Delete "${goalToDelete?.title || 'Objective'}"?`}
        message={`Are you sure you want to permanently delete "${goalToDelete?.title}"? All associated phases, milestone tasks, and progress records will be removed.`}
        confirmText="Yes, Delete Goal"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeletingGoal}
      />
    </div>
  );
}

export default Dashboard;
