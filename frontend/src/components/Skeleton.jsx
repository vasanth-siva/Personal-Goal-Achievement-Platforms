import React from 'react';
import './Skeleton.css';

export function Skeleton({
  width = '100%',
  height = '1rem',
  variant = 'rect',
  borderRadius,
  className = '',
  style = {},
}) {
  const getRadius = () => {
    if (borderRadius) return borderRadius;
    if (variant === 'circle') return '50%';
    if (variant === 'text') return '4px';
    if (variant === 'card') return '12px';
    return '8px';
  };

  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius: getRadius(),
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="skeleton-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="40%" height="0.875rem" />
        <Skeleton width="36px" height="36px" variant="circle" />
      </div>
      <Skeleton width="60%" height="2rem" style={{ marginTop: '0.5rem' }} />
      <Skeleton width="75%" height="0.75rem" style={{ marginTop: '0.25rem' }} />
    </div>
  );
}

export function GoalCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: '70%' }}>
          <Skeleton width="40%" height="0.75rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="90%" height="1.25rem" />
        </div>
        <Skeleton width="60px" height="24px" borderRadius="12px" />
      </div>
      <Skeleton width="100%" height="2.5rem" />
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <Skeleton width="25%" height="0.75rem" />
          <Skeleton width="15%" height="0.75rem" />
        </div>
        <Skeleton width="100%" height="8px" borderRadius="4px" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        <Skeleton width="35%" height="0.75rem" />
        <Skeleton width="25%" height="1.75rem" borderRadius="6px" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ width: '300px' }}>
          <Skeleton width="70%" height="2rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="100%" height="1rem" />
        </div>
        <Skeleton width="150px" height="42px" borderRadius="8px" />
      </div>

      {/* Stats grid */}
      <div className="skeleton-dashboard-grid">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Main section: 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div className="skeleton-card" style={{ minHeight: '360px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <Skeleton width="40%" height="1.25rem" />
            <Skeleton width="20%" height="0.875rem" />
          </div>
          <Skeleton width="100%" height="180px" borderRadius="8px" />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <Skeleton width="33%" height="1rem" />
            <Skeleton width="33%" height="1rem" />
            <Skeleton width="33%" height="1rem" />
          </div>
        </div>

        <div className="skeleton-card" style={{ minHeight: '360px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <Skeleton width="50%" height="1.25rem" />
            <Skeleton width="20%" height="0.875rem" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <Skeleton width="100%" height="52px" borderRadius="8px" />
            <Skeleton width="100%" height="52px" borderRadius="8px" />
            <Skeleton width="100%" height="52px" borderRadius="8px" />
            <Skeleton width="100%" height="52px" borderRadius="8px" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', paddingBottom: '3rem' }}>
      <Skeleton width="120px" height="1.5rem" style={{ marginBottom: '1.5rem' }} />
      <div className="skeleton-card" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <Skeleton width="60%" height="1.75rem" />
          <Skeleton width="80px" height="28px" borderRadius="14px" />
        </div>
        <Skeleton width="100%" height="3rem" style={{ marginBottom: '1rem' }} />
        <Skeleton width="100%" height="10px" borderRadius="5px" style={{ marginBottom: '1.25rem' }} />
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Skeleton width="25%" height="1rem" />
          <Skeleton width="25%" height="1rem" />
          <Skeleton width="25%" height="1rem" />
        </div>
      </div>
      <div className="skeleton-card">
        <Skeleton width="40%" height="1.5rem" style={{ marginBottom: '1rem' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Skeleton width="100%" height="70px" borderRadius="8px" />
          <Skeleton width="100%" height="70px" borderRadius="8px" />
          <Skeleton width="100%" height="70px" borderRadius="8px" />
        </div>
      </div>
    </div>
  );
}

export function TaskItemSkeleton() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
      <Skeleton width="20px" height="20px" borderRadius="4px" />
      <div style={{ flex: 1 }}>
        <Skeleton width="60%" height="1rem" style={{ marginBottom: '0.35rem' }} />
        <Skeleton width="40%" height="0.75rem" />
      </div>
      <Skeleton width="65px" height="22px" borderRadius="11px" />
    </div>
  );
}

export function ProgressSkeleton() {
  return (
    <div className="container-saas" style={{ paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <Skeleton width="35%" height="2rem" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="60%" height="1rem" />
      </div>
      <div className="skeleton-dashboard-grid">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="skeleton-card" style={{ height: '320px' }}>
          <Skeleton width="45%" height="1.25rem" />
          <Skeleton width="100%" height="220px" borderRadius="8px" />
        </div>
        <div className="skeleton-card" style={{ height: '320px' }}>
          <Skeleton width="45%" height="1.25rem" />
          <Skeleton width="100%" height="220px" borderRadius="8px" />
        </div>
        <div className="skeleton-card" style={{ height: '320px' }}>
          <Skeleton width="45%" height="1.25rem" />
          <Skeleton width="100%" height="220px" borderRadius="8px" />
        </div>
        <div className="skeleton-card" style={{ height: '320px' }}>
          <Skeleton width="45%" height="1.25rem" />
          <Skeleton width="100%" height="220px" borderRadius="8px" />
        </div>
      </div>
    </div>
  );
}

export function AchievementsSkeleton() {
  return (
    <div className="container-saas" style={{ paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <Skeleton width="30%" height="2rem" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="55%" height="1rem" />
      </div>
      <div className="skeleton-dashboard-grid">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton-card" style={{ height: '180px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Skeleton width="50px" height="50px" variant="circle" />
              <div style={{ flex: 1 }}>
                <Skeleton width="70%" height="1.1rem" style={{ marginBottom: '0.35rem' }} />
                <Skeleton width="90%" height="0.8rem" />
              </div>
            </div>
            <Skeleton width="100%" height="8px" borderRadius="4px" style={{ marginTop: 'auto' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="container-saas" style={{ paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Skeleton width="280px" height="2rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="400px" height="1rem" />
        </div>
        <Skeleton width="220px" height="42px" borderRadius="8px" />
      </div>
      <div className="skeleton-card" style={{ minHeight: '520px', padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} width="100%" height="28px" borderRadius="4px" />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
          {[...Array(35)].map((_, i) => (
            <Skeleton key={i} width="100%" height="75px" borderRadius="6px" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function NotificationsSkeleton() {
  return (
    <div className="container-saas" style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Skeleton width="220px" height="2rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="340px" height="1rem" />
        </div>
        <Skeleton width="120px" height="36px" borderRadius="6px" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton-card" style={{ padding: '1.15rem 1.35rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Skeleton width="36px" height="36px" variant="circle" />
              <div style={{ flex: 1 }}>
                <Skeleton width="40%" height="0.8rem" style={{ marginBottom: '0.4rem' }} />
                <Skeleton width="85%" height="1rem" />
              </div>
              <Skeleton width="60px" height="28px" borderRadius="6px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="container-saas" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div className="skeleton-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Skeleton width="88px" height="88px" variant="circle" />
          <div style={{ flex: 1 }}>
            <Skeleton width="35%" height="1.75rem" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="50%" height="1rem" />
          </div>
          <Skeleton width="100px" height="36px" borderRadius="6px" />
        </div>
      </div>
      <div className="skeleton-dashboard-grid">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="container-saas" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', paddingTop: '0.5rem' }}>
        <Skeleton width="260px" height="2rem" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="450px" height="1rem" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.75rem' }}>
        <div className="skeleton-card" style={{ height: '240px' }}>
          <Skeleton width="100%" height="36px" borderRadius="6px" />
          <Skeleton width="100%" height="36px" borderRadius="6px" />
          <Skeleton width="100%" height="36px" borderRadius="6px" />
          <Skeleton width="100%" height="36px" borderRadius="6px" />
        </div>
        <div className="skeleton-card" style={{ minHeight: '380px' }}>
          <Skeleton width="40%" height="1.5rem" style={{ marginBottom: '1.25rem' }} />
          <Skeleton width="100%" height="45px" borderRadius="8px" style={{ marginBottom: '1rem' }} />
          <Skeleton width="100%" height="45px" borderRadius="8px" style={{ marginBottom: '1rem' }} />
          <Skeleton width="140px" height="42px" borderRadius="8px" style={{ marginTop: '1rem' }} />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
