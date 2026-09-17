import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children, position = 'bottom-right' }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, message, type = 'info', duration = 4000 }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newToast = { id, title, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = {
    show: addToast,
    success: (message, title = 'Success') => addToast({ title, message, type: 'success' }),
    error: (message, title = 'Error') => addToast({ title, message, type: 'danger' }),
    warning: (message, title = 'Warning') => addToast({ title, message, type: 'warning' }),
    info: (message, title = 'Info') => addToast({ title, message, type: 'info' }),
    remove: removeToast,
  };

  const positionStyles = {
    'top-right': { top: '1.5rem', right: '1.5rem' },
    'top-left': { top: '1.5rem', left: '1.5rem' },
    'bottom-right': { bottom: '1.5rem', right: '1.5rem' },
    'bottom-left': { bottom: '1.5rem', left: '1.5rem' },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Floating Toast Container */}
      <div
        style={{
          position: 'fixed',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '380px',
          width: '100%',
          pointerEvents: 'none',
          ...positionStyles[position],
        }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastItem({ toast, onClose }) {
  const typeConfigs = {
    success: {
      bg: 'var(--color-success-light)',
      border: 'var(--color-success-border)',
      color: 'var(--color-success-text)',
      icon: '✓',
      iconBg: 'var(--color-success)',
    },
    danger: {
      bg: 'var(--color-danger-light)',
      border: 'var(--color-danger-border)',
      color: 'var(--color-danger-text)',
      icon: '✕',
      iconBg: 'var(--color-danger)',
    },
    warning: {
      bg: 'var(--color-warning-light)',
      border: 'var(--color-warning-border)',
      color: 'var(--color-warning-text)',
      icon: '!',
      iconBg: 'var(--color-warning)',
    },
    info: {
      bg: 'var(--color-info-light)',
      border: 'var(--color-info-border)',
      color: 'var(--color-info-text)',
      icon: 'ℹ',
      iconBg: 'var(--color-info)',
    },
  };

  const config = typeConfigs[toast.type] || typeConfigs.info;

  return (
    <div
      style={{
        pointerEvents: 'auto',
        backgroundColor: 'var(--color-surface)',
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        padding: '0.9rem 1.1rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.85rem',
        animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fontFamily: 'var(--font-body)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Type Icon Badge */}
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: config.iconBg,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          fontSize: '0.75rem',
          flexShrink: 0,
          marginTop: '0.1rem',
        }}
      >
        {config.icon}
      </div>

      {/* Message Text */}
      <div style={{ flex: 1 }}>
        {toast.title && (
          <h4
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.875rem',
              fontWeight: '700',
              color: 'var(--color-text-primary)',
              lineHeight: 1.3,
            }}
          >
            {toast.title}
          </h4>
        )}
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--color-text-secondary)',
            marginTop: toast.title ? '0.2rem' : '0',
            lineHeight: 1.4,
          }}
        >
          {toast.message}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          padding: '0.15rem',
          fontSize: '0.9rem',
          lineHeight: 1,
          borderRadius: 'var(--radius-xs)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default ToastProvider;
