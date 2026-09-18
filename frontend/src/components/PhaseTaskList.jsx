import React, { useState, useEffect, useCallback, useMemo } from 'react';
import taskService from '../services/taskService';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import ConfirmModal from './ConfirmModal';
import EmptyState from './EmptyState';
import { TaskItemSkeleton } from './Skeleton';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import { useToast } from './Toast';
import { formatDate, getDeadlineStatus, getPriorityInfo } from '../utils/formatters';
import './PhaseTaskList.css';

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];

export function PhaseTaskList({ phaseId, phaseName, onProgressChange }) {
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('created');

  // Delete Task Modal
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  // Add Task Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Pending',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Task Modal
  const [editingTask, setEditingTask] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!phaseId) return;
    setLoading(true);
    try {
      const res = await taskService.getTasksByPhase(phaseId);
      if (res && Array.isArray(res.data)) {
        setTasks(res.data);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, [phaseId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Toggle task complete (Cascading progress trigger)
  const handleToggleTask = async (task) => {
    const newCompleted = !task.completed;
    try {
      await taskService.toggleComplete(task.id, newCompleted);
      toast.success(
        newCompleted ? 'Task marked complete! Progress updated.' : 'Task reopened.',
        'Progress Updated'
      );
      await fetchTasks();
      if (onProgressChange) onProgressChange();
    } catch (err) {
      toast.error(err.message || 'Failed to update task', 'Error');
    }
  };

  // Add Task Submit
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskData.title.trim()) {
      toast.error('Task title is required', 'Validation Error');
      return;
    }

    setIsSubmitting(true);
    try {
      await taskService.createTask(phaseId, {
        title: newTaskData.title.trim(),
        description: newTaskData.description.trim(),
        dueDate: newTaskData.dueDate || null,
        priority: newTaskData.priority,
        status: newTaskData.status,
        completed: newTaskData.status === 'Completed',
      });

      toast.success('Task added to phase.', 'Task Created');
      setIsAddModalOpen(false);
      setNewTaskData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        status: 'Pending',
      });
      await fetchTasks();
      if (onProgressChange) onProgressChange();
    } catch (err) {
      toast.error(err.message || 'Failed to create task', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Task Submit
  const handleSaveEditedTask = async (e) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) {
      toast.error('Task title is required', 'Validation Error');
      return;
    }

    setIsSubmitting(true);
    try {
      await taskService.updateTask(editingTask.id, {
        title: editingTask.title.trim(),
        description: editingTask.description ? editingTask.description.trim() : '',
        dueDate: editingTask.dueDate || null,
        priority: editingTask.priority,
        status: editingTask.status,
        completed: editingTask.status === 'Completed' || editingTask.completed,
      });

      toast.success('Task updated.', 'Task Saved');
      setIsEditModalOpen(false);
      setEditingTask(null);
      await fetchTasks();
      if (onProgressChange) onProgressChange();
    } catch (err) {
      toast.error(err.message || 'Failed to update task', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Task
  const handleConfirmDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsDeletingTask(true);
    try {
      await taskService.deleteTask(taskToDelete.id);
      toast.info(`Task "${taskToDelete.title}" removed.`, 'Task Deleted');
      setTaskToDelete(null);
      await fetchTasks();
      if (onProgressChange) onProgressChange();
    } catch (err) {
      toast.error(err.message || 'Failed to delete task', 'Error');
    } finally {
      setIsDeletingTask(false);
    }
  };

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const inTitle = (t.title || '').toLowerCase().includes(q);
          const inDesc = (t.description || '').toLowerCase().includes(q);
          if (!inTitle && !inDesc) return false;
        }
        if (statusFilter !== 'ALL') {
          if ((t.status || '').toUpperCase() !== statusFilter.toUpperCase()) return false;
        }
        if (priorityFilter !== 'ALL') {
          if ((t.priority || '').toUpperCase() !== priorityFilter.toUpperCase()) return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'dueDate_asc': {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
          }
          case 'dueDate_desc': {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(b.dueDate) - new Date(a.dueDate);
          }
          case 'priority_desc': {
            const rank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
            return (rank[(b.priority || '').toUpperCase()] || 0) - (rank[(a.priority || '').toUpperCase()] || 0);
          }
          case 'title_asc':
            return (a.title || '').localeCompare(b.title || '');
          default:
            return (a.id || 0) - (b.id || 0);
        }
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy]);

  const completedCount = tasks.filter((t) => t.completed || t.status === 'Completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="phase-task-manager">
      {/* Header Bar with Accordion Toggle */}
      <div className="phase-task-toggle-header" onClick={() => setExpanded(!expanded)}>
        <div className="phase-task-toggle-left">
          <span className={`phase-task-toggle-icon ${expanded ? 'expanded' : ''}`}>▶</span>
          <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
            Phase Tasks &amp; Action Items
          </span>
          <span className="phase-task-count-pill">
            {completedCount} / {tasks.length} ({progressPercent}%)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            style={{ fontSize: '0.775rem', padding: '0.2rem 0.5rem' }}
          >
            + Add Task
          </Button>
        </div>
      </div>

      {/* Expanded Task Content */}
      {expanded && (
        <div style={{ marginTop: '0.5rem' }}>
          {/* Toolbar: Search, Filter, Sort */}
          {tasks.length > 0 && (
            <div className="phase-task-toolbar">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="phase-task-search-input"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="phase-task-select"
              >
                <option value="ALL">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="phase-task-select"
              >
                <option value="ALL">All Priority</option>
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="phase-task-select"
              >
                <option value="created">Default Order</option>
                <option value="dueDate_asc">Due Date (Earliest)</option>
                <option value="dueDate_desc">Due Date (Latest)</option>
                <option value="priority_desc">Priority (High to Low)</option>
                <option value="title_asc">Title (A to Z)</option>
              </select>
            </div>
          )}

          {/* Task List */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: '0.5rem 0' }}>
              <TaskItemSkeleton />
              <TaskItemSkeleton />
              <TaskItemSkeleton />
            </div>
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              icon="📋"
              title={tasks.length === 0 ? 'No tasks in this phase yet' : 'No matching tasks found'}
              description={
                tasks.length === 0
                  ? 'Add actionable tasks to complete this milestone and advance your goal.'
                  : 'Try changing your search keywords or clearing active filters.'
              }
              actionLabel={tasks.length === 0 ? '+ Add Task' : 'Reset Filters'}
              onAction={
                tasks.length === 0
                  ? () => setIsAddModalOpen(true)
                  : () => {
                      setSearchQuery('');
                      setStatusFilter('ALL');
                      setPriorityFilter('ALL');
                    }
              }
            />
          ) : (
            <div className="phase-task-items-list">
              {filteredTasks.map((task) => {
                const isTaskDone = task.completed || task.status === 'Completed';
                const deadlineInfo = getDeadlineStatus(task.dueDate);

                return (
                  <div key={task.id} className={`phase-task-row ${isTaskDone ? 'completed' : ''}`}>
                    <div className="phase-task-main">
                      <input
                        type="checkbox"
                        checked={isTaskDone}
                        onChange={() => handleToggleTask(task)}
                        className="phase-task-checkbox"
                        id={`task-check-${task.id}`}
                      />

                      <div className="phase-task-text-block">
                        <label
                          htmlFor={`task-check-${task.id}`}
                          className="phase-task-title"
                        >
                          {task.title}
                        </label>
                        {task.description && (
                          <p className="phase-task-desc">{task.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Meta: Due date, Priority, Actions */}
                    <div className="phase-task-badges">
                      {task.dueDate && (
                        <span
                          className="phase-task-due-pill"
                          style={{
                            backgroundColor: deadlineInfo.isOverdue
                              ? 'var(--color-danger-light)'
                              : deadlineInfo.isUrgent
                              ? 'var(--color-warning-light)'
                              : 'var(--color-bg-subtle)',
                            color: deadlineInfo.isOverdue
                              ? 'var(--color-danger-text)'
                              : deadlineInfo.isUrgent
                              ? 'var(--color-warning-text)'
                              : 'var(--color-text-muted)',
                            border: `1px solid ${
                              deadlineInfo.isOverdue
                                ? 'var(--color-danger-border)'
                                : deadlineInfo.isUrgent
                                ? 'var(--color-warning-border)'
                                : 'var(--color-border)'
                            }`,
                          }}
                        >
                          📅 {formatDate(task.dueDate)} ({deadlineInfo.label})
                        </span>
                      )}

                      <PriorityBadge priority={task.priority} size="sm" />
                      <StatusBadge status={task.status} size="sm" />

                      <div className="phase-task-actions">
                        <button
                          type="button"
                          className="phase-task-icon-btn"
                          title="Edit Task"
                          onClick={() => {
                            setEditingTask({ ...task });
                            setIsEditModalOpen(true);
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="phase-task-icon-btn delete"
                          title="Delete Task"
                          aria-label={`Delete task ${task.title}`}
                          onClick={() => setTaskToDelete(task)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add Task to ${phaseName}`}
        description="Create an actionable task item. Completing tasks automatically advances this phase and your goal!"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddTask} loading={isSubmitting}>
              Create Task
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <Input
            label="Task Title"
            placeholder="e.g. Master Generics & Type Erasure..."
            value={newTaskData.title}
            onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
            required
            id="input-task-title"
          />

          <div>
            <label
              htmlFor="input-task-desc"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                marginBottom: '0.4rem',
              }}
            >
              Description
            </label>
            <textarea
              id="input-task-desc"
              rows={2}
              placeholder="Key notes or requirements for completing this task..."
              value={newTaskData.description}
              onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <Input
                label="Due Date"
                type="date"
                value={newTaskData.dueDate}
                onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
                id="input-task-due-date"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                Priority
              </label>
              <select
                value={newTaskData.priority}
                onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  fontSize: '0.875rem',
                }}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p} Priority
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      {editingTask && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTask(null);
          }}
          title="Edit Task"
          description="Update task details, deadline, priority, or status."
          size="md"
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingTask(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveEditedTask} loading={isSubmitting}>
                Save Task
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveEditedTask} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <Input
              label="Task Title"
              value={editingTask.title}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              required
              id="input-edit-task-title"
            />

            <div>
              <label
                htmlFor="input-edit-task-desc"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                  marginBottom: '0.4rem',
                }}
              >
                Description
              </label>
              <textarea
                id="input-edit-task-desc"
                rows={2}
                value={editingTask.description || ''}
                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <Input
                  label="Due Date"
                  type="date"
                  value={editingTask.dueDate || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  id="input-edit-task-due-date"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                  Priority
                </label>
                <select
                  value={editingTask.priority || 'Medium'}
                  onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    fontSize: '0.875rem',
                  }}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p} Priority
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.4rem' }}>
                  Status
                </label>
                <select
                  value={editingTask.status || 'Pending'}
                  onChange={(e) => {
                    const st = e.target.value;
                    setEditingTask({
                      ...editingTask,
                      status: st,
                      completed: st === 'Completed',
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    fontSize: '0.875rem',
                  }}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Task Confirmation Modal */}
      <ConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDeleteTask}
        title="Delete Task"
        message={
          taskToDelete
            ? `Are you sure you want to remove "${taskToDelete.title}" from this phase?`
            : ''
        }
        confirmLabel="Yes, Delete Task"
        variant="danger"
        loading={isDeletingTask}
      />
    </div>
  );
}

export default PhaseTaskList;
