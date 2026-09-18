import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useGoals from '../hooks/useGoals';
import GoalCard from '../components/GoalCard';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { GoalCardSkeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { getCategoryInfo } from '../utils/formatters';

const CATEGORIES = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'Education', label: '🎓 Education' },
  { id: 'Career', label: '💼 Career' },
  { id: 'Fitness', label: '⚡ Fitness' },
  { id: 'Finance', label: '💰 Finance' },
  { id: 'Personal', label: '🎯 Personal' },
  { id: 'Skills', label: '🛠️ Skills' },
  { id: 'Other', label: '📌 Other' },
];

const STATUSES = [
  { id: 'ALL', label: 'All Statuses' },
  { id: 'Not Started', label: 'Not Started' },
  { id: 'In Progress', label: 'In Progress' },
  { id: 'Completed', label: 'Completed' },
];

const PRIORITIES = [
  { id: 'ALL', label: 'All Priorities' },
  { id: 'High', label: '🔴 High' },
  { id: 'Medium', label: '🟡 Medium' },
  { id: 'Low', label: '🟢 Low' },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'deadline_asc', label: 'Target Date (Earliest)' },
  { id: 'deadline_desc', label: 'Target Date (Latest)' },
  { id: 'progress_desc', label: 'Progress (High to Low)' },
  { id: 'progress_asc', label: 'Progress (Low to High)' },
  { id: 'priority_desc', label: 'Priority (High to Low)' },
  { id: 'title_asc', label: 'Title (A to Z)' },
];

export function GoalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Delete Confirmation Modal State
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { goals, loading, reload, deleteGoal, updateGoal } = useGoals();
  const toast = useToast();

  const handleUpdateProgress = async (id, updatedData) => {
    try {
      await updateGoal(id, updatedData);
      if (updatedData.status === 'Completed' || updatedData.status === 'COMPLETED') {
        toast.success('Goal completed! Outstanding achievement.', 'Milestone Reached');
      } else {
        toast.info(`Goal progress updated to ${updatedData.progress}%.`, 'Progress Recorded');
      }
    } catch {
      toast.error('Failed to update progress.', 'Update Error');
    }
  };

  const promptDeleteGoal = (goal) => {
    setGoalToDelete(goal);
  };

  const handleConfirmDelete = async () => {
    if (!goalToDelete) return;
    try {
      setIsDeleting(true);
      await deleteGoal(goalToDelete.id);
      toast.info(`"${goalToDelete.title}" removed from active targets.`, 'Goal Deleted');
      setGoalToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete goal.', 'Delete Error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterCategory('ALL');
    setFilterStatus('ALL');
    setFilterPriority('ALL');
    setSortBy('newest');
  };

  const filteredAndSortedGoals = useMemo(() => {
    return goals
      .filter((goal) => {
        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const inTitle = (goal.title || '').toLowerCase().includes(query);
          const inDesc = (goal.description || '').toLowerCase().includes(query);
          if (!inTitle && !inDesc) return false;
        }

        // Category filter
        if (filterCategory !== 'ALL') {
          const cat = (goal.category || '').toUpperCase();
          if (cat !== filterCategory.toUpperCase()) return false;
        }

        // Status filter
        if (filterStatus !== 'ALL') {
          const normGoalStatus = (goal.status || '').replace(/[\s_-]+/g, '_').toUpperCase();
          const normFilterStatus = filterStatus.replace(/[\s_-]+/g, '_').toUpperCase();
          if (normGoalStatus !== normFilterStatus) return false;
        }

        // Priority filter
        if (filterPriority !== 'ALL') {
          const p = (goal.priority || '').toUpperCase();
          if (p !== filterPriority.toUpperCase()) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'deadline_asc': {
            if (!a.targetDate) return 1;
            if (!b.targetDate) return -1;
            return new Date(a.targetDate) - new Date(b.targetDate);
          }
          case 'deadline_desc': {
            if (!a.targetDate) return 1;
            if (!b.targetDate) return -1;
            return new Date(b.targetDate) - new Date(a.targetDate);
          }
          case 'progress_desc':
            return (Number(b.progress) || 0) - (Number(a.progress) || 0);
          case 'progress_asc':
            return (Number(a.progress) || 0) - (Number(b.progress) || 0);
          case 'priority_desc': {
            const rank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
            const rA = rank[(a.priority || '').toUpperCase()] || 0;
            const rB = rank[(b.priority || '').toUpperCase()] || 0;
            return rB - rA;
          }
          case 'title_asc':
            return (a.title || '').localeCompare(b.title || '');
          case 'newest':
          default: {
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return (b.id || 0) - (a.id || 0);
          }
        }
      });
  }, [goals, searchQuery, filterCategory, filterStatus, filterPriority, sortBy]);

  const hasActiveFilters = searchQuery || filterCategory !== 'ALL' || filterStatus !== 'ALL' || filterPriority !== 'ALL' || sortBy !== 'newest';

  return (
    <div className="container-saas" style={{ paddingBottom: '3.5rem' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          paddingTop: '0.5rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              fontSize: '0.8rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
            }}
          >
            <span>🎯</span>
            <span>Active Goal Repository</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.35rem', color: 'var(--color-text-primary)' }}>
            Goal <span style={{ color: 'var(--color-primary)' }}>Directory</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', maxWidth: '600px' }}>
            Explore, filter, and track all your active and completed objectives across every discipline.
          </p>
        </div>

        <Link to="/goals/create">
          <Button variant="primary" icon={<span>+</span>} id="btn-create-goal-page">
            Create Goal
          </Button>
        </Link>
      </div>

      {/* Filter and Control Bar Card */}
      <Card variant="default" padding="md" style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.85rem',
            alignItems: 'center',
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.95rem',
                color: 'var(--color-text-muted)',
                pointerEvents: 'none',
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search goals by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="input-search-goals"
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.4rem',
                backgroundColor: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                fontSize: '0.875rem',
                transition: 'border-color var(--transition-fast)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              id="select-filter-category"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              id="select-filter-status"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              {STATUSES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              id="select-filter-priority"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              {PRIORITIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Option */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              id="select-sort-goals"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              {SORT_OPTIONS.map((sort) => (
                <option key={sort.id} value={sort.id}>
                  Sort: {sort.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count & Reset row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.85rem',
            paddingTop: '0.65rem',
            borderTop: '1px solid var(--color-border-subtle)',
            fontSize: '0.825rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span>
            Showing <strong>{filteredAndSortedGoals.length}</strong> of <strong>{goals.length}</strong> objectives
          </span>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.825rem',
                }}
              >
                Reset Filters
              </button>
            )}

            <Button variant="ghost" size="sm" onClick={() => reload()} title="Refresh goals">
              🔄 Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Goals Grid or Empty State */}
      {loading && goals.length === 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          <GoalCardSkeleton />
          <GoalCardSkeleton />
          <GoalCardSkeleton />
          <GoalCardSkeleton />
          <GoalCardSkeleton />
          <GoalCardSkeleton />
        </div>
      ) : filteredAndSortedGoals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title={hasActiveFilters ? 'No matching goals found' : 'No goals created yet'}
          description={
            hasActiveFilters
              ? 'No objectives matched your current search and filter settings. Try adjusting criteria or clearing filters.'
              : 'Start forging your ambitious roadmap. Create your first milestone-driven goal to establish momentum.'
          }
          actionLabel="Forge a Goal"
          onAction={() => window.location.assign('/goals/create')}
          secondaryLabel={hasActiveFilters ? 'Reset Filters' : undefined}
          onSecondaryAction={hasActiveFilters ? handleResetFilters : undefined}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredAndSortedGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onUpdateProgress={handleUpdateProgress}
              onDelete={() => promptDeleteGoal(goal)}
            />
          ))}
        </div>
      )}

      {/* Delete Goal Confirmation Dialog */}
      <ConfirmModal
        isOpen={!!goalToDelete}
        onClose={() => !isDeleting && setGoalToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete "${goalToDelete?.title || 'Objective'}"?`}
        message={`Deleting "${goalToDelete?.title}" will permanently remove all associated execution phases, tasks, and tracking records. This action cannot be undone.`}
        confirmText="Yes, Delete Goal"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default GoalsPage;
