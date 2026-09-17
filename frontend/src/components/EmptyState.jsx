import React from 'react';
import Button from './Button';
import './EmptyState.css';

export function EmptyState({
  icon = '🎯',
  title = 'No Items Found',
  description = 'There are no items recorded yet. Get started by taking the first step.',
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
  style = {},
}) {
  return (
    <div className={`empty-state-container ${className}`} style={style}>
      <div className="empty-state-icon-bubble" aria-hidden="true">
        {icon}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="empty-state-actions">
          {actionLabel && (
            <Button
              variant="primary"
              size="md"
              onClick={onAction}
              icon={actionIcon ? <span>{actionIcon}</span> : null}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button
              variant="outline"
              size="md"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
