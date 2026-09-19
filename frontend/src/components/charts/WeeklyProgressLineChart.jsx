import React, { useState } from 'react';

export function WeeklyProgressLineChart({ data = [], height = 240 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
        No weekly momentum data recorded yet.
      </div>
    );
  }

  const padding = { top: 25, right: 25, bottom: 35, left: 35 };
  const width = 540;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1 || 1)) * chartWidth;
    const y = padding.top + chartHeight - (Math.min(100, Math.max(0, item.progressPercentage || 0)) / 100) * chartHeight;
    return { x, y, ...item };
  });

  // Generate smooth path using Bezier curves
  const linePath = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cx1 = prev.x + (point.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (point.x - prev.x) / 2;
    const cy2 = point.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${point.x} ${point.y}`;
  }, '');

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
    : '';

  const gridYValues = [0, 25, 50, 75, 100];

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.35)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0.0)" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6366f1" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Horizontal Grid lines */}
        {gridYValues.map((val) => {
          const y = padding.top + chartHeight - (val / 100) * chartHeight;
          return (
            <g key={val}>
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
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="var(--color-text-muted, #94a3b8)"
                fontFamily="var(--font-mono, monospace)"
              >
                {val}%
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Line stroke */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Data points */}
        {points.map((pt, idx) => {
          const isHovered = hoveredIndex === idx;
          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Invisible touch/hover target */}
              <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

              {/* Point outer halo */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 8 : 4.5}
                fill="#ffffff"
                stroke="#6366f1"
                strokeWidth={isHovered ? 3 : 2}
                style={{ transition: 'all 0.2s ease' }}
              />

              {/* X-axis labels */}
              <text
                x={pt.x}
                y={padding.top + chartHeight + 20}
                textAnchor="middle"
                fontSize="11"
                fontWeight={isHovered ? '700' : '500'}
                fill={isHovered ? 'var(--color-primary, #6366f1)' : 'var(--color-text-muted, #94a3b8)'}
                fontFamily="var(--font-body)"
              >
                {pt.dayOfWeek || pt.date}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div
          style={{
            position: 'absolute',
            left: `${(points[hoveredIndex].x / width) * 100}%`,
            top: `${(points[hoveredIndex].y / height) * 100}%`,
            transform: 'translate(-50%, -125%)',
            backgroundColor: 'var(--color-surface, #1e293b)',
            border: '1px solid var(--color-border, #334155)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            padding: '6px 12px',
            pointerEvents: 'none',
            zIndex: 10,
            whiteSpace: 'nowrap',
            fontSize: '12px',
            textAlign: 'center',
          }}
        >
          <div style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: '500' }}>
            {points[hoveredIndex].date} ({points[hoveredIndex].dayOfWeek})
          </div>
          <div style={{ color: 'var(--color-primary, #818cf8)', fontWeight: '700', fontSize: '14px' }}>
            {points[hoveredIndex].progressPercentage}% Progress
          </div>
        </div>
      )}
    </div>
  );
}

export default WeeklyProgressLineChart;
