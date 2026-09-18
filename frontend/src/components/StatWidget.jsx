import React from 'react';

export function StatWidget({
  title,
  value,
  icon,
  trend,
  variant = 'primary',
  style = {},
}) {
  const variantStyles = {
    primary: {
      accent: 'var(--color-primary, #6366f1)',
      bg: 'rgba(99, 102, 241, 0.1)',
      border: 'rgba(99, 102, 241, 0.2)',
    },
    success: {
      accent: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.2)',
    },
    warning: {
      accent: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.2)',
    },
    danger: {
      accent: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.2)',
    },
    purple: {
      accent: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.1)',
      border: 'rgba(168, 85, 247, 0.2)',
    },
    cyan: {
      accent: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.1)',
      border: 'rgba(6, 182, 212, 0.2)',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px solid var(--color-border)',
        padding: '1.25rem 1.15rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.1))',
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      {/* Top row with Title and Icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: '600',
            color: 'var(--color-text-secondary)',
            letterSpacing: '0.01em',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </span>
        {icon && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: currentVariant.bg,
              border: `1px solid ${currentVariant.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Main Value Display */}
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.75rem',
          fontWeight: '800',
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>

      {/* Bottom Trend / Subtitle */}
      {trend && (
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            marginTop: 'auto',
          }}
        >
          {trend}
        </div>
      )}

      {/* Subtle bottom accent line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          backgroundColor: currentVariant.accent,
          opacity: 0.8,
        }}
      />
    </div>
  );
}

export default StatWidget;
