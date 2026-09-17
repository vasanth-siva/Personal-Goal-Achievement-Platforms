import React, { useEffect } from 'react';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className = '',
}) {
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeWidths = {
    sm: '420px',
    md: '540px',
    lg: '680px',
    xl: '820px',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        animation: 'fadeIn 0.2s ease-out forwards',
      }}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        className={`goalforge-modal animate-slideUp ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: sizeWidths[size] || sizeWidths.md,
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        {(title || onClose) && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--color-border-subtle)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              {title && (
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: 'var(--color-text-primary)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {title}
                </h3>
              )}
              {description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                  {description}
                </p>
              )}
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  transition: 'background var(--transition-fast), color var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-muted)';
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1,
            color: 'var(--color-text-secondary)',
            fontSize: '0.95rem',
          }}
        >
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--color-border-subtle)',
              backgroundColor: 'var(--color-surface-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
