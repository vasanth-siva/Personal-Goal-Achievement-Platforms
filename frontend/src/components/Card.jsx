import React from 'react';

export function Card({
  children,
  variant = 'default', // 'default' | 'interactive' | 'bordered' | 'flat'
  padding = 'md', // 'none' | 'sm' | 'md' | 'lg'
  className = '',
  style = {},
  onClick,
  ...rest
}) {
  const paddings = {
    none: '0',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
  };

  const isInteractive = variant === 'interactive' || Boolean(onClick);

  const baseStyles = {
    backgroundColor: variant === 'flat' ? 'var(--color-bg-subtle)' : 'var(--color-surface)',
    borderRadius: 'var(--radius-lg)',
    border: variant === 'bordered' ? '1.5px solid var(--color-border)' : '1px solid var(--color-border)',
    boxShadow: variant === 'flat' ? 'none' : 'var(--shadow-card)',
    padding: paddings[padding] || paddings.md,
    transition: 'var(--transition-normal)',
    position: 'relative',
    cursor: isInteractive ? 'pointer' : 'default',
    ...style,
  };

  return (
    <div
      className={`goalforge-card ${className}`}
      onClick={onClick}
      style={baseStyles}
      onMouseEnter={(e) => {
        if (isInteractive) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
          e.currentTarget.style.borderColor = 'var(--color-primary-border)';
        }
      }}
      onMouseLeave={(e) => {
        if (isInteractive) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-card)';
          e.currentTarget.style.borderColor = 'var(--color-border)';
        }
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, style = {}, className = '' }) {
  return (
    <div
      className={`goalforge-card-header ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

Card.Title = function CardTitle({ children, style = {}, className = '', as: Component = 'h3' }) {
  return (
    <Component
      className={`goalforge-card-title ${className}`}
      style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1.2rem',
        fontWeight: '700',
        color: 'var(--color-text-primary)',
        letterSpacing: '-0.02em',
        ...style,
      }}
    >
      {children}
    </Component>
  );
};

Card.Description = function CardDescription({ children, style = {}, className = '' }) {
  return (
    <p
      className={`goalforge-card-desc ${className}`}
      style={{
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
        marginTop: '0.25rem',
        lineHeight: 1.5,
        ...style,
      }}
    >
      {children}
    </p>
  );
};

Card.Body = function CardBody({ children, style = {}, className = '' }) {
  return (
    <div
      className={`goalforge-card-body ${className}`}
      style={{
        color: 'var(--color-text-primary)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ children, style = {}, className = '' }) {
  return (
    <div
      className={`goalforge-card-footer ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '1.25rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--color-border-subtle)',
        fontSize: '0.85rem',
        color: 'var(--color-text-muted)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Card;
