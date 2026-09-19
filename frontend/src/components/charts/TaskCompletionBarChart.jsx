import React, { useState } from 'react';

export function TaskCompletionBarChart({ data, height = 240 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const taskDays = data?.taskDays || [];
  const totalTasks = data?.totalTasks || 0;
  const completedTasks = data?.completedTasks || 0;
  const pendingTasks = data?.pendingTasks || 0;
  const rate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (taskDays.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
        No task activity recorded yet.
      </div>
    );
  }

  const padding = { top: 25, right: 20, bottom: 35, left: 30 };
  const width = 500;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(
    5,
    ...taskDays.map((d) => Math.max(d.completed || 0, d.pending || 0))
  );

  const groupWidth = chartWidth / taskDays.length;
  const barWidth = Math.min(18, (groupWidth - 12) / 2);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Quick Summary Pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.825rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-secondary)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#10b981' }} />
            Completed: <strong style={{ color: '#10b981' }}>{completedTasks}</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-text-secondary)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#f59e0b' }} />
            Pending: <strong style={{ color: '#f59e0b' }}>{pendingTasks}</strong>
          </span>
        </div>
        <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>
          {rate}% Completed
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio) => {
          const y = padding.top + chartHeight - ratio * chartHeight;
          const val = Math.round(ratio * maxVal);
          return (
            <g key={ratio}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="var(--color-border-subtle, rgba(255, 255, 255, 0.08))"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padding.left - 6}
                y={y + 3}
                textAnchor="end"
                fontSize="10"
                fill="var(--color-text-muted, #94a3b8)"
                fontFamily="var(--font-mono, monospace)"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {taskDays.map((d, idx) => {
          const groupX = padding.left + idx * groupWidth;
          const centerX = groupX + groupWidth / 2;

          const compHeight = ((d.completed || 0) / maxVal) * chartHeight;
          const pendHeight = ((d.pending || 0) / maxVal) * chartHeight;

          const compY = padding.top + chartHeight - compHeight;
          const pendY = padding.top + chartHeight - pendHeight;

          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Hover highlight background column */}
              {isHovered && (
                <rect
                  x={groupX + 2}
                  y={padding.top}
                  width={groupWidth - 4}
                  height={chartHeight}
                  fill="rgba(255, 255, 255, 0.04)"
                  rx="6"
                />
              )}

              {/* Completed Bar (Green) */}
              <rect
                x={centerX - barWidth - 2}
                y={compY}
                width={barWidth}
                height={Math.max(2, compHeight)}
                fill="#10b981"
                rx="3"
                style={{ transition: 'all 0.2s ease', opacity: isHovered ? 1 : 0.85 }}
              />

              {/* Pending Bar (Amber) */}
              <rect
                x={centerX + 2}
                y={pendY}
                width={barWidth}
                height={Math.max(2, pendHeight)}
                fill="#f59e0b"
                rx="3"
                style={{ transition: 'all 0.2s ease', opacity: isHovered ? 1 : 0.85 }}
              />

              {/* Day Label */}
              <text
                x={centerX}
                y={padding.top + chartHeight + 18}
                textAnchor="middle"
                fontSize="11"
                fontWeight={isHovered ? '700' : '500'}
                fill={isHovered ? 'var(--color-primary)' : 'var(--color-text-muted)'}
                fontFamily="var(--font-body)"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredIdx !== null && taskDays[hoveredIdx] && (
        <div
          style={{
            position: 'absolute',
            left: `${((padding.left + hoveredIdx * groupWidth + groupWidth / 2) / width) * 100}%`,
            top: '30px',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--color-surface, #1e293b)',
            border: '1px solid var(--color-border, #334155)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            padding: '6px 12px',
            pointerEvents: 'none',
            zIndex: 10,
            whiteSpace: 'nowrap',
            fontSize: '12px',
          }}
        >
          <div style={{ fontWeight: '700', marginBottom: '2px', color: 'var(--color-text-primary)' }}>
            {taskDays[hoveredIdx].label}
          </div>
          <div style={{ color: '#10b981' }}>✓ Completed: {taskDays[hoveredIdx].completed}</div>
          <div style={{ color: '#f59e0b' }}>⏳ Pending: {taskDays[hoveredIdx].pending}</div>
        </div>
      )}
    </div>
  );
}

export default TaskCompletionBarChart;
