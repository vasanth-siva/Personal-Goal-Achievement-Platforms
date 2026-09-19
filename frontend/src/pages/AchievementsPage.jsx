import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import AchievementCard from '../components/AchievementCard';
import CelebrationModal from '../components/CelebrationModal';
import EmptyState from '../components/EmptyState';
import { AchievementsSkeleton } from '../components/Skeleton';
import achievementService from '../services/achievementService';
import { useToast } from '../components/Toast';
import './AchievementsPage.css';

export function AchievementsPage() {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unlocked' | 'locked'
  const [searchQuery, setSearchQuery] = useState('');

  // Celebration state
  const [celebrationQueue, setCelebrationQueue] = useState([]);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);

  const fetchAchievements = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // If manual refresh, trigger the evaluation endpoint
      const res = isManualRefresh
        ? await achievementService.checkAchievements()
        : await achievementService.getAchievements();

      if (res && res.data) {
        setSummary(res.data);

        // If newly unlocked achievements detected from evaluation
        if (res.data.newlyUnlocked && res.data.newlyUnlocked.length > 0) {
          setCelebrationQueue(res.data.newlyUnlocked);
          setIsCelebrationOpen(true);
          toast.success(
            `🎉 Unlocked ${res.data.newlyUnlocked.length} new milestone!`,
            'Achievement Unlocked!'
          );
        } else if (isManualRefresh) {
          toast.info('All achievements evaluated against latest progress.', 'Up to date');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load achievements', 'Error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  // Handle celebration click on individual unlocked card
  const handleCardCelebrate = (achievement) => {
    setCelebrationQueue([achievement]);
    setIsCelebrationOpen(true);
  };

  const unlockedList = useMemo(() => {
    if (!summary || !summary.unlocked) return [];
    return summary.unlocked.filter(
      (a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [summary, searchQuery]);

  const lockedList = useMemo(() => {
    if (!summary || !summary.locked) return [];
    return summary.locked.filter(
      (a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [summary, searchQuery]);

  if (loading && !summary) {
    return <AchievementsSkeleton />;
  }

  const totalCount = summary ? summary.totalAchievements : 7;
  const unlockedCount = summary ? summary.unlockedCount : 0;
  const lockedCount = summary ? summary.lockedCount : 0;
  const completionPct = summary ? summary.completionPercentage : 0;

  return (
    <div className="achievements-page container-saas">
      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={isCelebrationOpen}
        achievements={celebrationQueue}
        onClose={() => setIsCelebrationOpen(false)}
      />

      {/* Hero Banner */}
      <div className="achievements-hero-card">
        <div className="achievements-hero-glow" aria-hidden="true" />
        <div className="achievements-hero-content">
          <div className="achievements-hero-tag">
            <span className="trophy-icon">🏆</span> Milestone Hall of Fame
          </div>
          <h1 className="achievements-hero-title">Achievements & Badges</h1>
          <p className="achievements-hero-subtitle">
            Earn distinctive recognition as you forge unstoppable momentum, finish goals, and complete daily tasks.
          </p>
        </div>

        <div className="achievements-hero-actions">
          <button
            type="button"
            className="btn-refresh-achievements"
            onClick={() => fetchAchievements(true)}
            disabled={refreshing}
          >
            <span className={`refresh-icon ${refreshing ? 'spinning' : ''}`}>🔄</span>
            {refreshing ? 'Evaluating...' : 'Check Unlocks'}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="achievements-kpi-grid">
        <div className="kpi-card kpi-total">
          <div className="kpi-icon-bubble">🎖️</div>
          <div className="kpi-info">
            <span className="kpi-label">Total Badges</span>
            <span className="kpi-value">{totalCount}</span>
          </div>
        </div>

        <div className="kpi-card kpi-unlocked">
          <div className="kpi-icon-bubble">✨</div>
          <div className="kpi-info">
            <span className="kpi-label">Unlocked</span>
            <span className="kpi-value">{unlockedCount}</span>
          </div>
        </div>

        <div className="kpi-card kpi-locked">
          <div className="kpi-icon-bubble">🔒</div>
          <div className="kpi-info">
            <span className="kpi-label">Locked</span>
            <span className="kpi-value">{lockedCount}</span>
          </div>
        </div>

        <div className="kpi-card kpi-progress">
          <div className="kpi-info-full">
            <div className="kpi-progress-header">
              <span className="kpi-label">Mastery Progress</span>
              <span className="kpi-value-small">{completionPct}%</span>
            </div>
            <div className="kpi-progress-bar">
              <div
                className="kpi-progress-fill"
                style={{ width: `${Math.min(100, Math.max(0, completionPct))}%` }}
              />
            </div>
            <span className="kpi-progress-subtext">
              {unlockedCount} of {totalCount} completed
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Toolbar: Tabs + Search Filter */}
      <div className="achievements-toolbar">
        <div className="achievements-tabs">
          <button
            type="button"
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Badges <span className="tab-badge">{totalCount}</span>
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'unlocked' ? 'active' : ''}`}
            onClick={() => setActiveTab('unlocked')}
          >
            Unlocked <span className="tab-badge badge-green">{unlockedCount}</span>
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'locked' ? 'active' : ''}`}
            onClick={() => setActiveTab('locked')}
          >
            Locked <span className="tab-badge badge-slate">{lockedCount}</span>
          </button>
        </div>

        <div className="achievements-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search badges by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="achievements-content-area">
        {/* UNLOCKED ACHIEVEMENTS SECTION */}
        {(activeTab === 'all' || activeTab === 'unlocked') && (
          <section className="achievements-section" data-testid="unlocked-achievements-section">
            <div className="section-header">
              <div className="section-title-wrap">
                <span className="section-icon">🌟</span>
                <h2 className="section-title">Unlocked Achievements</h2>
                <span className="section-count-tag">{unlockedList.length}</span>
              </div>
              <p className="section-description">
                Milestones you've successfully conquered through persistent action.
              </p>
            </div>

            {unlockedList.length > 0 ? (
              <div className="achievements-grid">
                {unlockedList.map((ach) => (
                  <AchievementCard
                    key={ach.achievementType}
                    achievement={ach}
                    onCelebrate={handleCardCelebrate}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="🎯"
                title="No unlocked achievements found"
                description={
                  searchQuery
                    ? `No unlocked achievements match "${searchQuery}".`
                    : 'Start by creating a goal or completing your first task to claim your first badge!'
                }
                actionLabel={searchQuery ? 'Clear Search' : undefined}
                onAction={searchQuery ? () => setSearchQuery('') : undefined}
              />
            )}
          </section>
        )}

        {/* LOCKED ACHIEVEMENTS SECTION */}
        {(activeTab === 'all' || activeTab === 'locked') && (
          <section className="achievements-section" data-testid="locked-achievements-section">
            <div className="section-header">
              <div className="section-title-wrap">
                <span className="section-icon">🔒</span>
                <h2 className="section-title">Locked Achievements</h2>
                <span className="section-count-tag">{lockedList.length}</span>
              </div>
              <p className="section-description">
                Upcoming targets. Fulfill the conditions below to automatically unlock each badge.
              </p>
            </div>

            {lockedList.length > 0 ? (
              <div className="achievements-grid">
                {lockedList.map((ach) => (
                  <AchievementCard
                    key={ach.achievementType}
                    achievement={ach}
                    onCelebrate={handleCardCelebrate}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="👑"
                title="All milestones conquered!"
                description={
                  searchQuery
                    ? `No locked achievements match "${searchQuery}".`
                    : 'Incredible work! You have successfully unlocked every badge in this tier.'
                }
                actionLabel={searchQuery ? 'Clear Search' : undefined}
                onAction={searchQuery ? () => setSearchQuery('') : undefined}
              />
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default AchievementsPage;
