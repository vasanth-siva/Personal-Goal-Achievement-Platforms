import React from 'react';
import useGoals from '../hooks/useGoals';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import { ProgressSkeleton } from '../components/Skeleton';
import { getCategoryInfo } from '../utils/formatters';

export function AnalyticsPage() {
  const { goals, loading } = useGoals();

  const totalGoals = goals.length;
  const completed = goals.filter((g) => (g.status || '').toUpperCase() === 'COMPLETED').length;
  const inProgress = goals.filter((g) => (g.status || '').toUpperCase() === 'IN_PROGRESS').length;
  const planned = goals.filter((g) => (g.status || '').toUpperCase() === 'PLANNED').length;
  const completionRate = totalGoals > 0 ? Math.round((completed / totalGoals) * 100) : 0;
  const avgProgress = totalGoals > 0 ? Math.round(goals.reduce((acc, g) => acc + (Number(g.progress) || 0), 0) / totalGoals) : 0;

  // Breakdown by category
  const categories = ['CAREER', 'FITNESS', 'FINANCE', 'LEARNING', 'PERSONAL'];
  const categoryCounts = categories.map((cat) => {
    const count = goals.filter((g) => (g.category || '').toUpperCase() === cat).length;
    const info = getCategoryInfo(cat);
    const percentage = totalGoals > 0 ? Math.round((count / totalGoals) * 100) : 0;
    return { ...info, cat, count, percentage };
  });

  return (
    <div className="container-saas" style={{ paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '2.5rem', paddingTop: '0.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            fontSize: '0.8rem',
            fontWeight: '700',
            marginBottom: '0.6rem',
          }}
        >
          <span>📊</span>
          <span>Insights &amp; Velocity</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem', color: 'var(--color-text-primary)' }}>
          Performance <span style={{ color: 'var(--color-primary)' }}>Analytics</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Visual analysis of your execution velocity, completion consistency, and life discipline distribution.
        </p>
      </div>

      {loading && goals.length === 0 ? (
        <ProgressSkeleton />
      ) : goals.length === 0 ? (
        <EmptyState
          icon="📊"
          title="No analytics data available"
          description="Create and track goals to start generating velocity trends, discipline breakdowns, and execution metrics."
          actionLabel="Forge First Goal"
          onAction={() => window.dispatchEvent(new CustomEvent('openNewGoalModal'))}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
          {/* Completion Rate Card */}
          <Card
            variant="default"
            padding="lg"
            className="animate-fadeIn"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <Card.Header style={{ marginBottom: '0.5rem' }}>
                <Card.Title as="h3" style={{ fontSize: '1.25rem' }}>
                  Execution Completion Rate
                </Card.Title>
              </Card.Header>
              <Card.Description>Overall milestone fulfillment ratio across active plans.</Card.Description>
            </div>

            <div style={{ textAlign: 'center', margin: '2.5rem 0' }}>
              <div
                style={{
                  fontSize: '4.25rem',
                  fontWeight: '800',
                  fontFamily: 'var(--font-heading)',
                  lineHeight: 1,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {completionRate}%
              </div>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.75rem', fontWeight: '500' }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>{completed}</strong> of{' '}
                <strong style={{ color: 'var(--color-text-primary)' }}>{totalGoals}</strong> defined objectives
                fulfilled
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                textAlign: 'center',
                borderTop: '1px solid var(--color-border-subtle)',
                paddingTop: '1.25rem',
              }}
            >
              <div
                style={{
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-success-light)',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--color-success-text)', fontWeight: '600' }}>
                  Completed
                </span>
                <p style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--color-success)', margin: 0 }}>
                  {completed}
                </p>
              </div>

              <div
                style={{
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-primary-light)',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '600' }}>
                  In Progress
                </span>
                <p style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--color-primary)', margin: 0 }}>
                  {inProgress}
                </p>
              </div>

              <div
                style={{
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-warning-light)',
                }}
              >
                <span style={{ fontSize: '0.75rem', color: 'var(--color-warning-text)', fontWeight: '600' }}>
                  Planned
                </span>
                <p style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--color-warning)', margin: 0 }}>
                  {planned}
                </p>
              </div>
            </div>
          </Card>

          {/* Category Distribution Card */}
          <Card variant="default" padding="lg" className="animate-fadeIn">
            <Card.Header style={{ marginBottom: '0.5rem' }}>
              <Card.Title as="h3" style={{ fontSize: '1.25rem' }}>
                Discipline Distribution
              </Card.Title>
            </Card.Header>
            <Card.Description style={{ marginBottom: '1.5rem' }}>
              Distribution of targets across life categories.
            </Card.Description>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {categoryCounts.map((item) => (
                <div key={item.cat}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.4rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{item.icon}</span>
                      <span style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>{item.label}</span>
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: '700', fontSize: '0.8rem' }}>
                      {item.count} goals ({item.percentage}%)
                    </span>
                  </div>

                  <div
                    style={{
                      height: '8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-border)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${item.percentage}%`,
                        height: '100%',
                        backgroundColor: item.color,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '1.75rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--color-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
              }}
            >
              <span style={{ color: 'var(--color-text-secondary)' }}>Overall Average Velocity:</span>
              <strong style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>{avgProgress}%</strong>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;
