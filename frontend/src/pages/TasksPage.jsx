import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import taskService from '../services/taskService';
import goalService from '../services/goalService';
import phaseService from '../services/phaseService';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { TaskItemSkeleton } from '../components/Skeleton';
import StatusBadge from '../components/StatusBadge';

export default function TasksPage() {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [togglingId, setTogglingId] = useState(null);

  // Deletion modal state
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Create Task Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [goals, setGoals] = useState([]);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [phases, setPhases] = useState([]);
  const [selectedPhaseId, setSelectedPhaseId] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');
  const [creating, setCreating] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskService.getAllTasks();
      if (res && res.data) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
      toast.error('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Load goals for the Create Task modal
  useEffect(() => {
    if (showCreateModal) {
      goalService.getAll().then((res) => {
        if (res && res.data) {
          setGoals(res.data);
          if (res.data.length > 0) {
            setSelectedGoalId(res.data[0].id);
          }
        }
      }).catch(console.error);
    }
  }, [showCreateModal]);

  // Load phases when selectedGoalId changes
  useEffect(() => {
    if (selectedGoalId) {
      phaseService.getPhases(selectedGoalId).then((res) => {
        if (res && res.data) {
          setPhases(res.data);
          if (res.data.length > 0) {
            setSelectedPhaseId(res.data[0].id);
          } else {
            setSelectedPhaseId('');
          }
        }
      }).catch(console.error);
    } else {
      setPhases([]);
      setSelectedPhaseId('');
    }
  }, [selectedGoalId]);

  const handleToggleComplete = async (task) => {
    const nextCompleted = !task.completed;
    setTogglingId(task.id);
    try {
      const res = await taskService.toggleComplete(task.id, nextCompleted);
      if (res && res.data) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, completed: nextCompleted, status: nextCompleted ? 'Completed' : 'Pending' } : t))
        );
        toast.success(nextCompleted ? 'Task marked as completed! 🎯' : 'Task restored to pending');
      }
    } catch (err) {
      toast.error('Failed to update task status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      setDeleting(true);
      await taskService.deleteTask(taskToDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      toast.success('Task deleted successfully');
      setTaskToDelete(null);
    } catch (err) {
      toast.error('Failed to delete task');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast.warning('Task title is required');
      return;
    }
    if (!selectedPhaseId) {
      toast.warning('Please select an execution phase');
      return;
    }

    try {
      setCreating(true);
      const res = await taskService.createTask(selectedPhaseId, {
        title: newTaskTitle.trim(),
        dueDate: newTaskDueDate || null,
        priority: newTaskPriority,
        status: 'Pending',
        completed: false,
      });

      if (res && res.data) {
        toast.success('Task created successfully! 🚀');
        setShowCreateModal(false);
        setNewTaskTitle('');
        setNewTaskDueDate('');
        fetchTasks();
      }
    } catch (err) {
      toast.error('Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        !search ||
        (t.title && t.title.toLowerCase().includes(search.toLowerCase())) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
        (t.goalTitle && t.goalTitle.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'COMPLETED' && (t.completed || t.status === 'Completed')) ||
        (statusFilter === 'PENDING' && !t.completed && t.status !== 'Completed');

      const matchesPriority =
        priorityFilter === 'ALL' ||
        (t.priority && t.priority.toUpperCase() === priorityFilter.toUpperCase());

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const completedCount = tasks.filter((t) => t.completed || t.status === 'Completed').length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="tasks-page-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: 'var(--text-primary, #f8fafc)' }}>
            All Tasks
          </h1>
          <p style={{ color: 'var(--text-secondary, #94a3b8)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Execute daily milestones and monitor execution velocity across all active goals
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            backgroundColor: 'var(--accent-primary, #6366f1)',
            color: '#fff',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <span>➕</span> Add Task
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #334155)' }}>
          <div style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.85rem' }}>Total Tasks</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary, #f8fafc)', marginTop: '4px' }}>{tasks.length}</div>
        </div>
        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #334155)' }}>
          <div style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.85rem' }}>Pending Execution</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>{pendingCount}</div>
        </div>
        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #334155)' }}>
          <div style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.85rem' }}>Completed</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>{completedCount}</div>
        </div>
        <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #334155)' }}>
          <div style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.85rem' }}>Completion Velocity</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary, #6366f1)', marginTop: '4px' }}>
            {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div style={{ background: 'var(--card-bg, #1e293b)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color, #334155)', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: '1', minWidth: '240px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search tasks by title, notes, or goal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'var(--input-bg, #0f172a)',
              border: '1px solid var(--border-color, #334155)',
              color: 'var(--text-primary, #f8fafc)',
              fontSize: '0.9rem',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Status Pill Filters */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)' }}>Status:</span>
          {['ALL', 'PENDING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === st ? 'var(--accent-primary, #6366f1)' : 'var(--border-color, #334155)',
                color: '#fff',
                transition: 'all 0.2s',
              }}
            >
              {st === 'ALL' ? 'All' : st === 'PENDING' ? 'Pending' : 'Done'}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)' }}>Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'var(--input-bg, #0f172a)',
              border: '1px solid var(--border-color, #334155)',
              color: 'var(--text-primary, #f8fafc)',
              fontSize: '0.85rem',
            }}
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TaskItemSkeleton />
          <TaskItemSkeleton />
          <TaskItemSkeleton />
          <TaskItemSkeleton />
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon="📋"
          title={tasks.length === 0 ? 'No tasks created yet' : 'No matching tasks'}
          description={
            tasks.length === 0
              ? 'Start by creating your first actionable task linked to a milestone phase.'
              : 'Try clearing search terms or selecting a different filter.'
          }
          primaryAction={
            tasks.length === 0
              ? { label: '+ Add Your First Task', onClick: () => setShowCreateModal(true) }
              : { label: 'Clear Filters', onClick: () => { setSearch(''); setStatusFilter('ALL'); setPriorityFilter('ALL'); } }
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderRadius: '12px',
                background: 'var(--card-bg, #1e293b)',
                border: '1px solid var(--border-color, #334155)',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
            >
              {/* Checkbox and Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                <input
                  type="checkbox"
                  checked={Boolean(task.completed || task.status === 'Completed')}
                  disabled={togglingId === task.id}
                  onChange={() => handleToggleComplete(task)}
                  style={{
                    width: '20px',
                    height: '20px',
                    accentColor: 'var(--accent-primary, #6366f1)',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: task.completed ? 'var(--text-secondary, #94a3b8)' : 'var(--text-primary, #f8fafc)',
                      textDecoration: task.completed ? 'line-through' : 'none',
                    }}
                  >
                    {task.title}
                  </div>
                  {task.description && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', marginTop: '2px' }}>
                      {task.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    {task.goalTitle && (
                      <Link to={`/goals/${task.goalId}`} style={{ color: 'var(--accent-primary, #6366f1)', textDecoration: 'none' }}>
                        🎯 {task.goalTitle}
                      </Link>
                    )}
                    {task.phaseName && <span>• 🗺️ {task.phaseName}</span>}
                    {task.dueDate && <span>• 📅 Due: {task.dueDate}</span>}
                  </div>
                </div>
              </div>

              {/* Badges & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '16px' }}>
                <StatusBadge value={task.priority || 'Medium'} type="priority" />
                <button
                  onClick={() => setTaskToDelete(task)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '6px',
                    borderRadius: '6px',
                  }}
                  title="Delete Task"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This will automatically recalculate phase and goal progress.`}
        confirmText="Delete Task"
        variant="danger"
        isLoading={deleting}
        onConfirm={handleDeleteTask}
        onClose={() => setTaskToDelete(null)}
      />

      {/* Create Task Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--card-bg, #1e293b)',
              padding: '28px',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              border: '1px solid var(--border-color, #334155)',
            }}
          >
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.3rem', color: 'var(--text-primary, #f8fafc)' }}>
              Create Action Task
            </h2>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '6px' }}>
                  Target Goal *
                </label>
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'var(--input-bg, #0f172a)',
                    border: '1px solid var(--border-color, #334155)',
                    color: 'var(--text-primary, #f8fafc)',
                  }}
                >
                  {goals.map((g) => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '6px' }}>
                  Milestone Phase *
                </label>
                {phases.length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: '#f59e0b' }}>
                    No phases found for this goal. Please add a phase to this goal first.
                  </div>
                ) : (
                  <select
                    value={selectedPhaseId}
                    onChange={(e) => setSelectedPhaseId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'var(--input-bg, #0f172a)',
                      border: '1px solid var(--border-color, #334155)',
                      color: 'var(--text-primary, #f8fafc)',
                    }}
                  >
                    {phases.map((p) => (
                      <option key={p.id} value={p.id}>{p.phaseName}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '6px' }}>
                  Task Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Spring Security Stateless JWT Filter"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'var(--input-bg, #0f172a)',
                    border: '1px solid var(--border-color, #334155)',
                    color: 'var(--text-primary, #f8fafc)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '6px' }}>
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'var(--input-bg, #0f172a)',
                      border: '1px solid var(--border-color, #334155)',
                      color: 'var(--text-primary, #f8fafc)',
                    }}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '6px' }}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'var(--input-bg, #0f172a)',
                      border: '1px solid var(--border-color, #334155)',
                      color: 'var(--text-primary, #f8fafc)',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: '1px solid var(--border-color, #334155)',
                    color: 'var(--text-secondary, #94a3b8)',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !selectedPhaseId}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: 'var(--accent-primary, #6366f1)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: creating || !selectedPhaseId ? 'not-allowed' : 'pointer',
                    opacity: creating || !selectedPhaseId ? 0.6 : 1,
                  }}
                >
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
