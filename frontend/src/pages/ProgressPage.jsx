import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import StatWidget from '../components/StatWidget';
import WeeklyProgressLineChart from '../components/charts/WeeklyProgressLineChart';
import GoalCompletionChart from '../components/charts/GoalCompletionChart';
import TaskCompletionBarChart from '../components/charts/TaskCompletionBarChart';
import MonthlyActivityChart from '../components/charts/MonthlyActivityChart';
import AddDailyProgressModal from '../components/AddDailyProgressModal';
import DailyProgressLogFeed from '../components/DailyProgressLogFeed';
import progressService from '../services/progressService';
import { ProgressSkeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';

export function ProgressPage() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes] = await Promise.all([
        progressService.getStatistics(),
        progressService.getLogs(),
      ]);

      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }
      if (logsRes && logsRes.data) {
        setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load progress statistics', 'Error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogSuccess = () => {
    loadData();
  };

  const handleLogDeleted = () => {
    loadData();
  };

  if (loading && !stats) {
    return <ProgressSkeleton />;
  }

  return (
    <div className="container-saas" style={{ paddingBottom: '4rem' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          paddingTop: '0.5rem',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.85rem',
              fontWeight: '800',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.025em',
              marginBottom: '0.35rem',
            }}
          >
            Progress & Momentum Tracking
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Live performance analytics, consistency streaks, and milestone reflections.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="secondary" size="md" onClick={loadData} title="Refresh live statistics">
            🔄 Refresh
          </Button>
          <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
            ✍️ Log Daily Progress
          </Button>
        </div>
      </div>

      {/* 7 Key Statistics Widgets Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {/* 1. Overall Goal Progress */}
        <StatWidget
          title="Overall Goal Progress"
          value={`${stats?.overallGoalProgress || 0}%`}
          icon="🎯"
          trend="Lifetime target average"
          variant="primary"
        />

        {/* 2. Daily Progress */}
        <StatWidget
          title="Daily Progress"
          value={`${stats?.dailyProgress || 0}%`}
          icon="☀️"
          trend="Today's activity rating"
          variant="cyan"
        />

        {/* 3. Weekly Progress */}
        <StatWidget
          title="Weekly Progress"
          value={`${stats?.weeklyProgress || 0}%`}
          icon="📅"
          trend="Past 7 days velocity"
          variant="purple"
        />

        {/* 4. Monthly Progress */}
        <StatWidget
          title="Monthly Progress"
          value={`${stats?.monthlyProgress || 0}%`}
          icon="📊"
          trend="Past 30 days momentum"
          variant="warning"
        />

        {/* 5. Task Completion Rate */}
        <StatWidget
          title="Task Completion Rate"
          value={`${stats?.taskCompletionRate || 0}%`}
          icon="✅"
          trend={`${stats?.taskCompletionData?.completedTasks || 0} of ${stats?.taskCompletionData?.totalTasks || 0} tasks`}
          variant="success"
        />

        {/* 6. Current Streak */}
        <StatWidget
          title="Current Streak"
          value={`${stats?.currentStreak || 0} Days`}
          icon="🔥"
          trend="Consecutive active days"
          variant="danger"
        />

        {/* 7. Best Streak */}
        <StatWidget
          title="Best Streak"
          value={`${stats?.bestStreak || 0} Days`}
          icon="⚡"
          trend="All-time consistency record"
          variant="primary"
        />
      </div>

      {/* Charts Grid: 2 columns on desktop, 1 on mobile */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Chart 1: Weekly Progress Line Chart */}
        <Card
          title="1. Weekly Progress Velocity"
          subtitle="7-day momentum curve across recorded daily milestones"
        >
          <WeeklyProgressLineChart data={stats?.weeklyTrend || []} height={250} />
        </Card>

        {/* Chart 2: Goal Completion Status Chart */}
        <Card
          title="2. Goal Completion Breakdown"
          subtitle="Distribution of targets by completion phase"
        >
          <GoalCompletionChart data={stats?.goalCompletionData} />
        </Card>

        {/* Chart 3: Task Completion Bar Chart */}
        <Card
          title="3. Daily Task Completion Ratio"
          subtitle="Completed vs. pending tasks tracked across the past week"
        >
          <TaskCompletionBarChart data={stats?.taskCompletionData} height={250} />
        </Card>

        {/* Chart 4: Monthly Activity Chart */}
        <Card
          title="4. Monthly Activity Density"
          subtitle="30-day consistency heatmap and reflection density"
        >
          <MonthlyActivityChart data={stats?.monthlyActivity || []} />
        </Card>
      </div>

      {/* Daily Progress Reflection Notes Feed */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
              Daily Progress Notes & Reflections
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Chronological log of your progress observations, wins, and milestones.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
            + Add New Note
          </Button>
        </div>

        <DailyProgressLogFeed
          logs={logs}
          onLogDeleted={handleLogDeleted}
          onOpenAddModal={() => setIsModalOpen(true)}
        />
      </div>

      {/* Modal for Adding Daily Progress */}
      <AddDailyProgressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleLogSuccess}
      />
    </div>
  );
}

export default ProgressPage;
