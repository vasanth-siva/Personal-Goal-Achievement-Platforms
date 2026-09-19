import React, { useState } from 'react';

export function MonthlyActivityChart({ data = [] }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
        No monthly activity recorded yet.
      </div>
    );
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 4:
        return { bg: '#8b5cf6', border: '#a78bfa', glow: '0 0 10px rgba(139, 92, 246, 0.5)' };
      case 3:
        return { bg: '#6366f1', border: '#818cf8', glow: 'none' };
      case 2:
        return { bg: 'rgba(6, 182, 212, 0.6)', border: '#22d3ee', glow: 'none' };
      case 1:
        return { bg: 'rgba(6, 182, 212, 0.25)', border: 'rgba(6, 182, 212, 0.4)', glow: 'none' };
      default:
        return { bg: 'var(--color-bg-subtle, rgba(255, 255, 255, 0.04))', border: 'var(--color-border-subtle, rgba(255, 255, 255, 0.08))', glow: 'none' };
    }
  };

  const totalLogs = data.reduce((acc, d) => acc + (d.logsCount || 0), 0);
  const activeDaysCount = data.filter((d) => d.activityLevel > 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Metrics Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>
          Active Days (Last 30d): <strong style={{ color: 'var(--color-primary)' }}>{activeDaysCount} of {data.length}</strong>
        </span>
        <span style={{ color: 'var(--color-text-secondary)' }}>
          Total Reflection Logs: <strong style={{ color: '#06b6d4' }}>{totalLogs}</strong>
        </span>
      </div>

      {/* Heatmap Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(36px, 1fr))',
          gap: '8px',
          padding: '0.5rem 0',
          position: 'relative',
        }}
      >
        {data.map((day, idx) => {
          const styleInfo = getLevelColor(day.activityLevel);
          const isHovered = hoveredDay?.date === day.date;
          const dayNumber = day.date ? new Date(day.date).getDate() : idx + 1;

          return (
            <div
              key={day.date || idx}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              style={{
                aspectRatio: '1',
                borderRadius: '8px',
                backgroundColor: styleInfo.bg,
                border: `1px solid ${styleInfo.border}`,
                boxShadow: styleInfo.glow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: day.activityLevel > 0 ? '700' : '400',
                color: day.activityLevel >= 2 ? '#ffffff' : 'var(--color-text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isHovered ? 'scale(1.15) translateY(-2px)' : 'none',
                zIndex: isHovered ? 10 : 1,
              }}
            >
              {dayNumber}
            </div>
          );
        })}
      </div>

      {/* Floating Tooltip info */}
      <div
        style={{
          minHeight: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          padding: '0.4rem 0.75rem',
          borderRadius: '6px',
          backgroundColor: 'var(--color-bg-subtle, rgba(255, 255, 255, 0.03))',
        }}
      >
        {hoveredDay ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-text-primary)' }}>
            <span>📅 <strong>{hoveredDay.date}</strong></span>
            <span>⚡ Progress: <strong>{hoveredDay.progressPercentage}%</strong></span>
            <span>📝 Notes: <strong>{hoveredDay.logsCount}</strong></span>
            <span>✓ Tasks: <strong>{hoveredDay.tasksCompleted}</strong></span>
          </div>
        ) : (
          <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            Hover over any day square to inspect daily activity and reflection details.
          </span>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((lvl) => {
            const col = getLevelColor(lvl);
            return (
              <span
                key={lvl}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  backgroundColor: col.bg,
                  border: `1px solid ${col.border}`,
                  display: 'inline-block',
                }}
              />
            );
          })}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

export default MonthlyActivityChart;
