import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import { ProfileSkeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import './ProfilePage.css';

export function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getProfile();
      if (res && res.data) {
        setProfile(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load profile details', 'Error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    logout();
    toast.info('You have been signed out.', 'Logged Out');
    navigate('/login', { replace: true });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading && !profile) {
    return <ProfileSkeleton />;
  }

  const {
    fullName = 'Alex Morgan',
    email = 'alex@goalforge.io',
    avatar = '🚀',
    createdAt,
    totalGoals = 0,
    completedGoals = 0,
    currentStreak = 0,
  } = profile || {};

  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <div className="profile-page container-saas">
      {/* Profile Hero Header */}
      <div className="profile-hero-card">
        <div className="profile-hero-glow" aria-hidden="true" />

        <div className="profile-hero-main">
          {/* Avatar Bubble */}
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-bubble" data-testid="profile-avatar">
              <span className="avatar-char">{avatar || '🚀'}</span>
            </div>
            <Link to="/settings" className="avatar-edit-badge" title="Change Avatar in Settings">
              ✏️
            </Link>
          </div>

          {/* User Details */}
          <div className="profile-user-info">
            <div className="profile-badge-row">
              <span className="role-pill">PRO MEMBER</span>
              <span className="verified-pill">✓ Verified</span>
            </div>
            <h1 className="profile-full-name" data-testid="profile-full-name">{fullName}</h1>
            <p className="profile-email" data-testid="profile-email">
              ✉️ {email}
            </p>
            <div className="profile-created-date">
              🗓️ Member since {formatDate(createdAt)}
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="profile-hero-action">
          <Link to="/settings" className="btn-edit-profile-hero">
            ⚙️ Edit Profile & Settings
          </Link>
        </div>
      </div>

      {/* Core Momentum KPI Stats Grid */}
      <div className="profile-stats-grid">
        {/* Total Goals */}
        <div className="profile-stat-card card-total-goals">
          <div className="stat-card-top">
            <div className="stat-icon-wrap icon-goals">🎯</div>
            <span className="stat-card-badge">Targets</span>
          </div>
          <div className="stat-card-content">
            <div className="stat-big-number" data-testid="profile-total-goals">{totalGoals}</div>
            <div className="stat-label-title">Total Goals Created</div>
            <p className="stat-sub-caption">Active personal development initiatives</p>
          </div>
        </div>

        {/* Completed Goals */}
        <div className="profile-stat-card card-completed-goals">
          <div className="stat-card-top">
            <div className="stat-icon-wrap icon-completed">🏆</div>
            <span className="stat-card-badge badge-green">{completionRate}% Completed</span>
          </div>
          <div className="stat-card-content">
            <div className="stat-big-number" data-testid="profile-completed-goals">{completedGoals}</div>
            <div className="stat-label-title">Completed Goals</div>
            <p className="stat-sub-caption">Fully accomplished target milestones</p>
          </div>
        </div>

        {/* Current Streak */}
        <div className="profile-stat-card card-current-streak">
          <div className="stat-card-top">
            <div className="stat-icon-wrap icon-streak">🔥</div>
            <span className="stat-card-badge badge-orange">Momentum</span>
          </div>
          <div className="stat-card-content">
            <div className="stat-big-number" data-testid="profile-current-streak">
              {currentStreak} <span className="streak-unit">Days</span>
            </div>
            <div className="stat-label-title">Current Streak</div>
            <p className="stat-sub-caption">Consecutive days of action & reflection</p>
          </div>
        </div>
      </div>

      {/* Quick Access Settings Hub */}
      <div className="profile-hub-section">
        <h2 className="profile-hub-title">Account Quick Actions</h2>
        <div className="profile-hub-grid">
          <Link to="/settings#profile" className="profile-hub-card">
            <div className="hub-card-icon">👤</div>
            <div className="hub-card-info">
              <h3>Edit Profile</h3>
              <p>Change your display name, choose a new avatar</p>
            </div>
            <span className="hub-card-arrow">→</span>
          </Link>

          <Link to="/settings#security" className="profile-hub-card">
            <div className="hub-card-icon">🔒</div>
            <div className="hub-card-info">
              <h3>Change Password</h3>
              <p>Update your authentication password credentials</p>
            </div>
            <span className="hub-card-arrow">→</span>
          </Link>

          <Link to="/settings#notifications" className="profile-hub-card">
            <div className="hub-card-icon">🔔</div>
            <div className="hub-card-info">
              <h3>Notification Preferences</h3>
              <p>Control task deadline and streak celebration alerts</p>
            </div>
            <span className="hub-card-arrow">→</span>
          </Link>

          <Link to="/settings#theme" className="profile-hub-card">
            <div className="hub-card-icon">🎨</div>
            <div className="hub-card-info">
              <h3>Theme Preference</h3>
              <p>Customize light, dark, or system appearance</p>
            </div>
            <span className="hub-card-arrow">→</span>
          </Link>
        </div>
      </div>

      {/* Sign Out Card */}
      <div className="profile-danger-zone">
        <div className="danger-zone-info">
          <h3>Sign Out of GoalForge</h3>
          <p>End your current authenticated session on this browser.</p>
        </div>
        <button type="button" className="btn-profile-logout" onClick={() => setShowLogoutModal(true)}>
          🚪 Sign Out
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Sign Out of GoalForge"
        message="Are you sure you want to log out of your current session? You can sign back in at any time."
        confirmLabel="Yes, Sign Out"
        variant="warning"
      />
    </div>
  );
}

export default ProfilePage;
