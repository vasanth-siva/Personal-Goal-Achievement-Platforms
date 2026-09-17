import React from 'react';
import Modal from './Modal';
import Button from './Button';

/**
 * Accessible confirmation dialog for destructive or important actions.
 * Supports 'danger' (default for delete), 'warning', and 'info' variants.
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  isLoading = false,
  confirmButtonProps = {},
}) {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return (
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              flexShrink: 0,
            }}
          >
            ⚠️
          </div>
        );
      case 'warning':
        return (
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              flexShrink: 0,
            }}
          >
            🔔
          </div>
        );
      default:
        return (
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              color: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              flexShrink: 0,
            }}
          >
            ℹ️
          </div>
        );
    }
  };

  const footer = (
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
      <Button
        variant="ghost"
        onClick={onClose}
        disabled={isLoading}
        type="button"
      >
        {cancelText}
      </Button>
      <Button
        variant={variant === 'danger' ? 'danger' : 'primary'}
        onClick={onConfirm}
        isLoading={isLoading}
        type="button"
        {...confirmButtonProps}
      >
        {confirmText}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      size="sm"
      closeOnOverlayClick={!isLoading}
      closeOnEsc={!isLoading}
      footer={footer}
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingTop: '0.5rem' }}>
        {getIcon()}
        <div>
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: '0.5rem',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {message}
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmModal;
