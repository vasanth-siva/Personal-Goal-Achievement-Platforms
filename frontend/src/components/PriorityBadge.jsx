import React from 'react';
import { getPriorityInfo } from '../utils/formatters';

export function PriorityBadge({ priority, size = 'md' }) {
  const info = getPriorityInfo(priority);
  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '0.3rem' : '0.45rem',
        padding: isSmall ? '0.15rem 0.5rem' : '0.25rem 0.65rem',
        borderRadius: 'var(--radius-full)',
        fontSize: isSmall ? '0.7rem' : '0.75rem',
        fontWeight: '700',
        letterSpacing: '0.01em',
        backgroundColor: info.bg,
        color: info.color,
        border: `1px solid ${info.border}`,
        lineHeight: 1.3,
        userSelect: 'none',
      }}
    >
      <span
        style={{
          width: isSmall ? '5px' : '6px',
          height: isSmall ? '5px' : '6px',
          borderRadius: '50%',
          backgroundColor: info.dotColor,
          flexShrink: 0,
        }}
      />
      {info.label} Priority
    </span>
  );
}

export default PriorityBadge;
