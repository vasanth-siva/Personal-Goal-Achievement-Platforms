import React, { useState, forwardRef } from 'react';

export const Input = forwardRef(function Input(
  {
    label,
    helperText,
    error,
    icon,
    suffix,
    type = 'text',
    size = 'md',
    fullWidth = true,
    disabled = false,
    clearable = false,
    value,
    onChange,
    onClear,
    className = '',
    style = {},
    id,
    placeholder,
    isTextarea = false,
    rows = 3,
    ...rest
  },
  ref
) {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  const sizeStyles = {
    sm: {
      padding: '0.45rem 0.75rem',
      fontSize: '0.8125rem',
      borderRadius: 'var(--radius-sm)',
    },
    md: {
      padding: '0.625rem 0.95rem',
      fontSize: '0.875rem',
      borderRadius: 'var(--radius-md)',
    },
    lg: {
      padding: '0.8rem 1.15rem',
      fontSize: '1rem',
      borderRadius: 'var(--radius-md)',
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  let borderColor = 'var(--color-border)';
  let boxShadow = 'var(--shadow-xs)';

  if (error) {
    borderColor = 'var(--color-danger)';
    if (isFocused) {
      boxShadow = 'var(--shadow-focus-danger)';
    }
  } else if (isFocused) {
    borderColor = 'var(--color-primary)';
    boxShadow = 'var(--shadow-focus-ring)';
  }

  const Component = isTextarea ? 'textarea' : 'input';

  return (
    <div
      className={`goalforge-input-group ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: fullWidth ? '100%' : 'auto',
        fontFamily: 'var(--font-body)',
        ...style,
      }}
    >
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.8125rem',
            fontWeight: '600',
            color: error ? 'var(--color-danger)' : 'var(--color-text-primary)',
            marginBottom: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{label}</span>
          {error && (
            <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--color-danger)' }}>
              {error}
            </span>
          )}
        </label>
      )}

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: isTextarea ? 'flex-start' : 'center',
          backgroundColor: disabled ? 'var(--color-bg-subtle)' : 'var(--color-surface)',
          border: `1px solid ${borderColor}`,
          borderRadius: currentSize.borderRadius,
          boxShadow: boxShadow,
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
        }}
      >
        {icon && (
          <span
            style={{
              paddingLeft: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              color: isFocused ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontSize: '1rem',
              pointerEvents: 'none',
              transition: 'color var(--transition-fast)',
              marginTop: isTextarea ? '0.65rem' : '0',
            }}
          >
            {icon}
          </span>
        )}

        <Component
          ref={ref}
          id={inputId}
          type={isTextarea ? undefined : type}
          rows={isTextarea ? rows : undefined}
          disabled={disabled}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-primary)',
            fontSize: currentSize.fontSize,
            padding: currentSize.padding,
            paddingLeft: icon ? '0.5rem' : currentSize.padding.split(' ')[1],
            paddingRight: (clearable && value) || suffix ? '2.25rem' : currentSize.padding.split(' ')[1],
            resize: isTextarea ? 'vertical' : 'none',
          }}
          {...rest}
        />

        {/* Clear button if value exists */}
        {clearable && value && !disabled && (
          <button
            type="button"
            onClick={onClear}
            style={{
              position: 'absolute',
              right: suffix ? '2.25rem' : '0.65rem',
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              padding: '0.2rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ✕
          </button>
        )}

        {suffix && (
          <span
            style={{
              paddingRight: '0.85rem',
              color: 'var(--color-text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {suffix}
          </span>
        )}
      </div>

      {!error && helperText && (
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            marginTop: '0.3rem',
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
