import React from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import ProgressBar from './ProgressBar';
import { formatDate, getCategoryInfo, getDeadlineStatus } from '../utils/formatters';

export function GoalCard({ goal, onUpdateProgress, onDelete }) {
  const categoryInfo = getCategoryInfo(goal.category);
  const deadlineInfo = getDeadlineStatus(goal.targetDate);
  const progress = Math.min(100, Math.max(0, Number(goal.progress) || 0));
  const isCompleted = progress === 100 || (goal.status || '').replace(/[\s_-]+/g, '_').toUpperCase() === 'COMPLETED';

  const handleQuickBump = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!onUpdateProgress) return;
    const newProgress = Math.min(100, progress + 10);
    const newStatus = newProgress === 100 ? 'Completed' : 'In Progress';
    onUpdateProgress(goal.id, { progress: newProgress, status: newStatus });
  };

  return (
    <Card
      variant="default"
      padding="md"
      className="animate-fadeIn"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: '260px',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal)',
        position: 'relative',
      }}
    >
      {/* Top Header: Category Tag & Status Badge */}
      <Card.Header style={{ marginBottom: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              color: categoryInfo.color,
              backgroundColor: categoryInfo.bg || `${categoryInfo.color}14`,
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${categoryInfo.border || `${categoryInfo.color}28`}`,
            }}
          >
            <span>{categoryInfo.icon}</span>
            <span>{categoryInfo.label}</span>
          </div>

          {goal.priority && <PriorityBadge priority={goal.priority} size="sm" />}
        </div>

        <StatusBadge status={goal.status} size="sm" />
      </Card.Header>

      {/* Main Content */}
      <Card.Body style={{ flex: 1, marginBottom: '1rem' }}>
        <Link
          to={`/goals/${goal.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Card.Title
            as="h4"
            style={{
              fontSize: '1.15rem',
              lineHeight: 1.35,
              marginBottom: '0.4rem',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
          >
            {goal.title}
          </Card.Title>
        </Link>

        {goal.description && (
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              margin: '0 0 0.75rem 0',
            }}
          >
            {goal.description}
          </p>
        )}
      </Card.Body>

      {/* Progress & Quick Action */}
      <div style={{ marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.775rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
            Progress
          </span>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: isCompleted ? 'var(--color-success-text)' : 'var(--color-primary)' }}>
            {progress}%
          </span>
        </div>
        <ProgressBar
          value={progress}
          variant={isCompleted ? 'success' : 'gradient'}
          size="md"
          showValue={false}
        />
      </div>

      {/* Deadline Info Banner */}
      {goal.targetDate && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.35rem 0.6rem',
            backgroundColor: deadlineInfo.isOverdue
              ? 'var(--color-danger-light)'
              : deadlineInfo.isUrgent
              ? 'var(--color-warning-light)'
              : 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-xs)',
            marginBottom: '0.85rem',
            fontSize: '0.75rem',
          }}
        >
          <span style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>📅</span>
            <span>Target: {formatDate(goal.targetDate)}</span>
          </span>
          <span
            style={{
              fontWeight: '700',
              color: deadlineInfo.isOverdue
                ? 'var(--color-danger-text)'
                : deadlineInfo.isUrgent
                ? 'var(--color-warning-text)'
                : 'var(--color-text-muted)',
            }}
          >
            {deadlineInfo.label}
          </span>
        </div>
      )}

      {/* Footer: +10% Bump, Details, Edit, Delete */}
      <Card.Footer
        style={{
          marginTop: 0,
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {onUpdateProgress && progress < 100 && (
            <button
              type="button"
              onClick={handleQuickBump}
              title="Add +10% progress"
              style={{
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary-border)',
                borderRadius: 'var(--radius-xs)',
                padding: '0.25rem 0.55rem',
                fontSize: '0.725rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-light)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
            >
              +10%
            </button>
          )}

          <Link
            to={`/goals/${goal.id}`}
            style={{
              textDecoration: 'none',
              fontSize: '0.775rem',
              fontWeight: '600',
              color: 'var(--color-primary)',
              padding: '0.25rem 0.4rem',
            }}
          >
            View Details &rarr;
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Link
            to={`/goals/${goal.id}/edit`}
            title="Edit Goal"
            style={{
              textDecoration: 'none',
              color: 'var(--color-text-muted)',
              fontSize: '0.85rem',
              padding: '0.25rem 0.4rem',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            ✏️
          </Link>

          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete(goal.id);
              }}
              title="Delete Goal"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: '0.25rem 0.4rem',
                borderRadius: 'var(--radius-xs)',
                fontSize: '0.9rem',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-danger-light)';
                e.currentTarget.style.color = 'var(--color-danger)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-muted)';
              }}
            >
              🗑️
            </button>
          )}
        </div>
      </Card.Footer>
    </Card>
  );
}

export default GoalCard;
