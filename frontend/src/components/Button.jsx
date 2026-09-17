import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  style = {},
  ...rest
}) {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: {
      padding: '0.45rem 0.85rem',
      fontSize: '0.8125rem',
      borderRadius: 'var(--radius-sm)',
      gap: '0.4rem',
    },
    md: {
      padding: '0.625rem 1.25rem',
      fontSize: '0.875rem',
      borderRadius: 'var(--radius-md)',
      gap: '0.5rem',
    },
    lg: {
      padding: '0.8rem 1.65rem',
      fontSize: '1rem',
      borderRadius: 'var(--radius-md)',
      gap: '0.6rem',
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-text-inverse)',
      border: '1px solid transparent',
      boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
      hoverBg: 'var(--color-primary-hover)',
      hoverShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
    },
    secondary: {
      backgroundColor: 'var(--color-secondary)',
      color: 'var(--color-text-inverse)',
      border: '1px solid transparent',
      boxShadow: '0 2px 6px rgba(6, 182, 212, 0.25)',
      hoverBg: 'var(--color-secondary-hover)',
      hoverShadow: '0 4px 12px rgba(6, 182, 212, 0.35)',
    },
    outline: {
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-xs)',
      hoverBg: 'var(--color-bg-subtle)',
      hoverBorder: 'var(--color-primary-border)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-secondary)',
      border: '1px solid transparent',
      hoverBg: 'var(--color-bg-subtle)',
      hoverColor: 'var(--color-text-primary)',
    },
    success: {
      backgroundColor: 'var(--color-success)',
      color: 'var(--color-text-inverse)',
      border: '1px solid transparent',
      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
      hoverBg: 'var(--color-success-hover)',
      hoverShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
    },
    danger: {
      backgroundColor: 'var(--color-danger)',
      color: 'var(--color-text-inverse)',
      border: '1px solid transparent',
      boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)',
      hoverBg: 'var(--color-danger-hover)',
      hoverShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;
  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`goalforge-btn ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-body)',
        fontWeight: '600',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.65 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'var(--transition-fast)',
        userSelect: 'none',
        outline: 'none',
        lineHeight: 1,
        ...currentSize,
        ...currentVariant,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor = currentVariant.hoverBg || currentVariant.backgroundColor;
          if (currentVariant.hoverShadow) e.currentTarget.style.boxShadow = currentVariant.hoverShadow;
          if (currentVariant.hoverBorder) e.currentTarget.style.borderColor = currentVariant.hoverBorder;
          if (currentVariant.hoverColor) e.currentTarget.style.color = currentVariant.hoverColor;
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor = currentVariant.backgroundColor;
          e.currentTarget.style.boxShadow = currentVariant.boxShadow || 'none';
          e.currentTarget.style.borderColor = currentVariant.border?.split(' ')[2] || 'transparent';
          e.currentTarget.style.color = currentVariant.color;
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
      onMouseDown={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(1px)';
        }
      }}
      onMouseUp={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      {...rest}
    >
      {loading ? (
        <span
          style={{
            display: 'inline-block',
            width: size === 'sm' ? '13px' : '16px',
            height: size === 'sm' ? '13px' : '16px',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      ) : (
        icon && iconPosition === 'left' && <span style={{ display: 'inline-flex' }}>{icon}</span>
      )}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span style={{ display: 'inline-flex' }}>{icon}</span>
      )}
    </button>
  );
}

export default Button;
