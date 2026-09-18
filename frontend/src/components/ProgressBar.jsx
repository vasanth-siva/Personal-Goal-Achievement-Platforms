import React from 'react';

export function ProgressBar({
  value = 0,
  max = 100,
  size = 'md', // 'sm' | 'md' | 'lg'
  variant = 'primary', // 'primary' | 'cyan' | 'success' | 'warning' | 'danger' | 'gradient'
  label,
  showValue = true,
  animated = false,
  className = '',
  style = {},
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeHeights = {
    sm: '5px',
    md: '8px',
    lg: '12px',
  };

  const variantColors = {
    primary: 'var(--color-primary)',
    cyan: 'var(--color-secondary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
    gradient: 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)',
  };

  const currentHeight = sizeHeights[size] || sizeHeights.md;
  const currentColor = variantColors[variant] || variantColors.primary;

  return (
    <div
      className={`goalforge-progress-wrapper ${className}`}
      style={{
        width: '100%',
        fontFamily: 'var(--font-body)',
        ...style,
      }}
    >
      {(label || showValue) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.375rem',
            fontSize: '0.8125rem',
          }}
        >
          {label && (
            <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
              {label}
            </span>
          )}
          {showValue && (
            <span style={{ fontWeight: '700', color: 'var(--color-text-secondary)', marginLeft: 'auto' }}>
              {percentage}%
            </span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          width: '100%',
          height: currentHeight,
          backgroundColor: 'var(--color-border)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: currentColor,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            backgroundImage: animated
              ? 'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)'
              : 'none',
            backgroundSize: '1rem 1rem',
          }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
