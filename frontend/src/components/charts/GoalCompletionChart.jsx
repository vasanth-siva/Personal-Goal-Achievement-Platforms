import React, { useState } from 'react';

export function GoalCompletionChart({ data }) {
  const [hoveredStatus, setHoveredStatus] = useState(null);

  const total = data?.totalGoals || 0;
  const completed = data?.completedGoals || 0;
  const inProgress = data?.inProgressGoals || 0;
  const notStarted = data?.notStartedGoals || 0;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Donut SVG parameters
  const size = 200;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const completedPct = total > 0 ? completed / total : 0;
  const inProgressPct = total > 0 ? inProgress / total : 0;
  const notStartedPct = total > 0 ? notStarted / total : 0;

  const completedDash = completedPct * circumference;
  const inProgressDash = inProgressPct * circumference;
  const notStartedDash = notStartedPct * circumference;

  const inProgressOffset = -completedDash;
  const notStartedOffset = -(completedDash + inProgressDash);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1.5rem' }}>
        {/* Donut Chart SVG */}
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="var(--color-bg-subtle, rgba(255, 255, 255, 0.05))"
              strokeWidth={strokeWidth}
            />

            {/* Completed Segment (Green) */}
            {completed > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#10b981"
                strokeWidth={hoveredStatus === 'completed' ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${completedDash} ${circumference}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                onMouseEnter={() => setHoveredStatus('completed')}
                onMouseLeave={() => setHoveredStatus(null)}
                style={{ transition: 'stroke-width 0.2s ease', cursor: 'pointer' }}
              />
            )}

            {/* In Progress Segment (Indigo) */}
            {inProgress > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#6366f1"
                strokeWidth={hoveredStatus === 'inProgress' ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${inProgressDash} ${circumference}`}
                strokeDashoffset={inProgressOffset}
                strokeLinecap="round"
                onMouseEnter={() => setHoveredStatus('inProgress')}
                onMouseLeave={() => setHoveredStatus(null)}
                style={{ transition: 'stroke-width 0.2s ease', cursor: 'pointer' }}
              />
            )}

            {/* Not Started Segment (Slate) */}
            {notStarted > 0 && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#64748b"
                strokeWidth={hoveredStatus === 'notStarted' ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${notStartedDash} ${circumference}`}
                strokeDashoffset={notStartedOffset}
                strokeLinecap="round"
                onMouseEnter={() => setHoveredStatus('notStarted')}
                onMouseLeave={() => setHoveredStatus(null)}
                style={{ transition: 'stroke-width 0.2s ease', cursor: 'pointer' }}
              />
            )}
          </svg>

          {/* Center Info Text */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
              {completionRate}%
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Completed
            </span>
          </div>
        </div>

        {/* Legend Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '160px' }}>
          <div
            onMouseEnter={() => setHoveredStatus('completed')}
            onMouseLeave={() => setHoveredStatus(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: hoveredStatus === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-bg-subtle, rgba(255, 255, 255, 0.03))',
              transition: 'background 0.2s ease',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--color-text-secondary)' }}>Completed</span>
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#10b981' }}>{completed}</span>
          </div>

          <div
            onMouseEnter={() => setHoveredStatus('inProgress')}
            onMouseLeave={() => setHoveredStatus(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: hoveredStatus === 'inProgress' ? 'rgba(99, 102, 241, 0.15)' : 'var(--color-bg-subtle, rgba(255, 255, 255, 0.03))',
              transition: 'background 0.2s ease',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#6366f1' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--color-text-secondary)' }}>In Progress</span>
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#6366f1' }}>{inProgress}</span>
          </div>

          <div
            onMouseEnter={() => setHoveredStatus('notStarted')}
            onMouseLeave={() => setHoveredStatus(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              backgroundColor: hoveredStatus === 'notStarted' ? 'rgba(100, 116, 139, 0.15)' : 'var(--color-bg-subtle, rgba(255, 255, 255, 0.03))',
              transition: 'background 0.2s ease',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#64748b' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--color-text-secondary)' }}>Not Started</span>
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#94a3b8' }}>{notStarted}</span>
          </div>
        </div>
      </div>

      {/* Per-Goal Progress Pills */}
      {data?.goals && data.goals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Targets Breakdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '160px', overflowY: 'auto' }}>
            {data.goals.map((g) => (
              <div
                key={g.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0.65rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-bg-subtle, rgba(255, 255, 255, 0.02))',
                  border: '1px solid var(--color-border-subtle, rgba(255, 255, 255, 0.05))',
                  fontSize: '0.825rem',
                }}
              >
                <span style={{ fontWeight: '500', color: 'var(--color-text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                  {g.title}
                </span>
                <span style={{ fontWeight: '700', color: g.progress === 100 ? '#10b981' : g.progress > 0 ? '#6366f1' : 'var(--color-text-muted)' }}>
                  {g.progress}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GoalCompletionChart;
