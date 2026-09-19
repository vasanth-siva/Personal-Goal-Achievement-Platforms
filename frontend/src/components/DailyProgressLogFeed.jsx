import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import EmptyState from './EmptyState';
import { useToast } from './Toast';
import progressService from '../services/progressService';
import { formatDate } from '../utils/formatters';

export function DailyProgressLogFeed({ logs = [], onLogDeleted, onOpenAddModal }) {
  const toast = useToast();
  const [logToDelete, setLogToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!logToDelete) return;
    setIsDeleting(true);
    try {
      await progressService.deleteLog(logToDelete.id);
      toast.info('Daily reflection note removed.', 'Log Deleted');
      if (onLogDeleted) onLogDeleted(logToDelete.id);
      setLogToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete note', 'Error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!logs || logs.length === 0) {
    return (
      <EmptyState
        icon="📝"
        title="No Daily Reflections Yet"
        description="Record your daily progress, insights, and wins to maintain your streak and visualize momentum."
        actionLabel="+ Log First Note"
        onAction={onOpenAddModal}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {logs.map((log) => (
        <Card
          key={log.id}
          style={{
            padding: '1.25rem 1.5rem',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            borderLeft: '4px solid var(--color-primary)',
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--color-primary)',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                {log.progressPercentage}%
              </span>

              <span style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>
                {formatDate(log.progressDate)}
              </span>

              {log.goalTitle && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--color-bg-subtle, rgba(255, 255, 255, 0.05))',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.08))',
                  }}
                >
                  🎯 {log.goalTitle}
                </span>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLogToDelete(log)}
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.8rem',
                padding: '0.2rem 0.5rem',
              }}
              title="Delete reflection note"
              aria-label="Delete reflection note"
            >
              🗑️ Delete
            </Button>
          </div>

          {/* Notes Content */}
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              lineHeight: 1.55,
              color: 'var(--color-text-secondary)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {log.notes}
          </p>
        </Card>
      ))}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!logToDelete}
        onClose={() => setLogToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Reflection Note"
        message="Are you sure you want to delete this daily progress reflection? This action cannot be undone."
        confirmLabel="Yes, Delete Note"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}

export default DailyProgressLogFeed;
