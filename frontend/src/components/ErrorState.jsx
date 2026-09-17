import React from 'react';
import Button from './Button';

/**
 * Standard error state component for failed data fetching or operations.
 */
export function ErrorState({
  title = 'Failed to load content',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry,
  retryText = 'Try Again',
  secondaryAction,
  className = '',
  compact = false,
}) {
  return (
    <div
      className={`goalforge-error-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: compact ? '2rem 1.5rem' : '3.5rem 2rem',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        boxShadow: 'var(--shadow-sm)',
        margin: '1rem 0',
      }}
      role="alert"
    >
      <div
        style={{
          width: compact ? '48px' : '64px',
          height: compact ? '48px' : '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: compact ? '1.5rem' : '2rem',
          marginBottom: '1rem',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}
      >
        ⚠️
      </div>

      <h3
        style={{
          fontSize: compact ? '1.1rem' : '1.25rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '0.5rem',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.9rem',
          color: 'var(--color-text-secondary)',
          maxWidth: '420px',
          lineHeight: 1.5,
          marginBottom: onRetry || secondaryAction ? '1.5rem' : 0,
        }}
      >
        {message}
      </p>

      {(onRetry || secondaryAction) && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {onRetry && (
            <Button variant="primary" onClick={onRetry} size={compact ? 'sm' : 'md'}>
              🔄 {retryText}
            </Button>
          )}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export default ErrorState;
