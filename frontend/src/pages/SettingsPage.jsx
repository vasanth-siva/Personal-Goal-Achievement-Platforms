import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import { SettingsSkeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import './SettingsPage.css';

const AVATAR_OPTIONS = ['🚀', '⚡', '🎯', '👑', '🌟', '🔥', '💻', '🧠', '🏆', '🥋', '🦊', '🦅'];

export function SettingsPage() {
  const { logout, user: authUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('🚀');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Preferences Form State
  const [themePreference, setThemePreference] = useState('system');
  const [notifyTaskDue, setNotifyTaskDue] = useState(true);
  const [notifyGoalCompleted, setNotifyGoalCompleted] = useState(true);
  const [notifyStreak, setNotifyStreak] = useState(true);
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Read hash from URL if navigating with #security, #notifications, etc.
  useEffect(() => {
    if (location.hash) {
      const sec = location.hash.replace('#', '');
      if (['profile', 'security', 'notifications', 'theme', 'logout'].includes(sec)) {
        setActiveSection(sec);
      }
    }
  }, [location.hash]);

  const loadUserData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getProfile();
      if (res && res.data) {
        const d = res.data;
        setFullName(d.fullName || '');
        setEmail(d.email || '');
        setAvatar(d.avatar || '🚀');
        setThemePreference(d.themePreference || 'system');
        setNotifyTaskDue(d.notifyTaskDue !== false);
        setNotifyGoalCompleted(d.notifyGoalCompleted !== false);
        setNotifyStreak(d.notifyStreak !== false);
        setNotifyWeeklyDigest(Boolean(d.notifyWeeklyDigest));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load user settings', 'Error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // 1. Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Full name is required.');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await userService.updateProfile({
        fullName: fullName.trim(),
        avatar,
      });
      if (res && res.data) {
        toast.success('Profile updated successfully!', 'Saved');
        // Dispatch event so navbar and sidebar can update immediately
        window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: res.data }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // 2. Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Current password is required.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      toast.success('Password changed successfully!', 'Security Updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  // 3. Handle Preferences Update (Theme or Notifications)
  const handlePreferencesSubmit = async (e) => {
    if (e) e.preventDefault();
    setSavingPreferences(true);
    try {
      const res = await userService.updatePreferences({
        themePreference,
        notifyTaskDue,
        notifyGoalCompleted,
        notifyStreak,
        notifyWeeklyDigest,
      });
      if (res && res.data) {
        toast.success('Preferences saved successfully!', 'Updated');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save preferences.');
    } finally {
      setSavingPreferences(false);
    }
  };

  // 4. Handle Logout
  const handleLogout = () => {
    logout();
    toast.info('You have been signed out.', 'Logged Out');
    navigate('/login', { replace: true });
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="settings-page container-saas">
      {/* Header Banner */}
      <div className="settings-hero">
        <div className="settings-hero-tag">⚙️ Preferences & Controls</div>
        <h1 className="settings-hero-title">Account Settings</h1>
        <p className="settings-hero-subtitle">
          Manage your personal identity, login security, notification alerts, and theme preferences.
        </p>
      </div>

      {/* Main Settings Layout: Sidebar Navigation + Active Panel */}
      <div className="settings-layout">
        {/* Settings Navigation Nav */}
        <div className="settings-nav-sidebar">
          <button
            type="button"
            className={`settings-nav-btn ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            <span className="nav-btn-icon">👤</span>
            <span className="nav-btn-label">Edit Profile</span>
          </button>
          <button
            type="button"
            className={`settings-nav-btn ${activeSection === 'security' ? 'active' : ''}`}
            onClick={() => setActiveSection('security')}
          >
            <span className="nav-btn-icon">🔒</span>
            <span className="nav-btn-label">Change Password</span>
          </button>
          <button
            type="button"
            className={`settings-nav-btn ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveSection('notifications')}
          >
            <span className="nav-btn-icon">🔔</span>
            <span className="nav-btn-label">Notification Preferences</span>
          </button>
          <button
            type="button"
            className={`settings-nav-btn ${activeSection === 'theme' ? 'active' : ''}`}
            onClick={() => setActiveSection('theme')}
          >
            <span className="nav-btn-icon">🎨</span>
            <span className="nav-btn-label">Theme Preference</span>
          </button>
          <button
            type="button"
            className={`settings-nav-btn btn-nav-danger ${activeSection === 'logout' ? 'active' : ''}`}
            onClick={() => setActiveSection('logout')}
          >
            <span className="nav-btn-icon">🚪</span>
            <span className="nav-btn-label">Sign Out</span>
          </button>
        </div>

        {/* Content Panels */}
        <div className="settings-panel-content">
          {/* 1. EDIT PROFILE SECTION */}
          {activeSection === 'profile' && (
            <div className="settings-card" data-testid="settings-profile-section">
              <div className="settings-card-header">
                <h2>Profile Information</h2>
                <p>Update your public full name and milestone avatar.</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="settings-form">
                {/* Avatar Selection */}
                <div className="form-group">
                  <label className="form-label">Milestone Avatar</label>
                  <div className="avatar-picker-grid">
                    {AVATAR_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`avatar-option-btn ${avatar === opt ? 'selected' : ''}`}
                        onClick={() => setAvatar(opt)}
                        title={`Select ${opt} avatar`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Full Name */}
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    className="settings-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    required
                  />
                </div>

                {/* Email (Read-only) */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    className="settings-input input-readonly"
                    value={email}
                    disabled
                    readOnly
                  />
                  <span className="form-help-text">Email address cannot be changed directly.</span>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-settings-primary"
                    disabled={savingProfile}
                  >
                    {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. CHANGE PASSWORD SECTION */}
          {activeSection === 'security' && (
            <div className="settings-card" data-testid="settings-security-section">
              <div className="settings-card-header">
                <h2>Security & Password</h2>
                <p>Ensure your account is protected with a strong, distinct password.</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="settings-form">
                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    className="settings-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    className="settings-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                  />
                  <span className="form-help-text">Must be at least 6 characters long.</span>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="settings-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-settings-primary"
                    disabled={savingPassword}
                  >
                    {savingPassword ? 'Updating...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. NOTIFICATION PREFERENCES SECTION */}
          {activeSection === 'notifications' && (
            <div className="settings-card" data-testid="settings-notifications-section">
              <div className="settings-card-header">
                <h2>Notification Preferences</h2>
                <p>Control which real-time alerts and progress highlights you receive.</p>
              </div>

              <form onSubmit={handlePreferencesSubmit} className="settings-form">
                <div className="toggle-list">
                  {/* Task Due Alert */}
                  <div className="toggle-item">
                    <div className="toggle-text">
                      <span className="toggle-title">⏰ Task Due Reminders</span>
                      <span className="toggle-desc">
                        Get alerted when a task deadline is approaching tomorrow ("Your Java task is due tomorrow.")
                      </span>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notifyTaskDue}
                        onChange={(e) => setNotifyTaskDue(e.target.checked)}
                      />
                      <span className="slider round" />
                    </label>
                  </div>

                  {/* Goal Completed Alert */}
                  <div className="toggle-item">
                    <div className="toggle-text">
                      <span className="toggle-title">🏆 Goal Completion Celebrations</span>
                      <span className="toggle-desc">
                        Receive instant celebratory notification when a goal reaches 100% completion.
                      </span>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notifyGoalCompleted}
                        onChange={(e) => setNotifyGoalCompleted(e.target.checked)}
                      />
                      <span className="slider round" />
                    </label>
                  </div>

                  {/* Streak Alert */}
                  <div className="toggle-item">
                    <div className="toggle-text">
                      <span className="toggle-title">🔥 Streak & Momentum Alerts</span>
                      <span className="toggle-desc">
                        Get celebrated when you hit consistency milestones like 7-day and 30-day streaks.
                      </span>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notifyStreak}
                        onChange={(e) => setNotifyStreak(e.target.checked)}
                      />
                      <span className="slider round" />
                    </label>
                  </div>

                  {/* Weekly Digest */}
                  <div className="toggle-item">
                    <div className="toggle-text">
                      <span className="toggle-title">📧 Weekly Summary Digest</span>
                      <span className="toggle-desc">
                        Receive a rolling weekly summary of completed tasks and velocity stats.
                      </span>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={notifyWeeklyDigest}
                        onChange={(e) => setNotifyWeeklyDigest(e.target.checked)}
                      />
                      <span className="slider round" />
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-settings-primary"
                    disabled={savingPreferences}
                  >
                    {savingPreferences ? 'Saving...' : 'Save Notification Preferences'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 4. THEME PREFERENCE SECTION */}
          {activeSection === 'theme' && (
            <div className="settings-card" data-testid="settings-theme-section">
              <div className="settings-card-header">
                <h2>Theme Preference</h2>
                <p>Choose your preferred interface appearance and contrast mode.</p>
              </div>

              <form onSubmit={handlePreferencesSubmit} className="settings-form">
                <div className="theme-options-grid">
                  {/* Light Theme */}
                  <div
                    className={`theme-card ${themePreference === 'light' ? 'selected' : ''}`}
                    onClick={() => setThemePreference('light')}
                  >
                    <div className="theme-card-preview preview-light">
                      <div className="preview-top-bar" />
                      <div className="preview-body">
                        <div className="preview-block block-sm" />
                        <div className="preview-block block-lg" />
                      </div>
                    </div>
                    <div className="theme-card-footer">
                      <span className="theme-title">☀️ Light Theme</span>
                      <span className="theme-desc">Crisp, clean high-contrast daytime interface</span>
                    </div>
                  </div>

                  {/* Dark Theme */}
                  <div
                    className={`theme-card ${themePreference === 'dark' ? 'selected' : ''}`}
                    onClick={() => setThemePreference('dark')}
                  >
                    <div className="theme-card-preview preview-dark">
                      <div className="preview-top-bar" />
                      <div className="preview-body">
                        <div className="preview-block block-sm" />
                        <div className="preview-block block-lg" />
                      </div>
                    </div>
                    <div className="theme-card-footer">
                      <span className="theme-title">🌙 Dark Theme</span>
                      <span className="theme-desc">Deep obsidian palette, gentle on low-light eyes</span>
                    </div>
                  </div>

                  {/* System Theme */}
                  <div
                    className={`theme-card ${themePreference === 'system' ? 'selected' : ''}`}
                    onClick={() => setThemePreference('system')}
                  >
                    <div className="theme-card-preview preview-system">
                      <div className="preview-top-bar" />
                      <div className="preview-body">
                        <div className="preview-block block-sm" />
                        <div className="preview-block block-lg" />
                      </div>
                    </div>
                    <div className="theme-card-footer">
                      <span className="theme-title">💻 System Auto</span>
                      <span className="theme-desc">Synchronized with OS dark/light mode preference</span>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-settings-primary"
                    disabled={savingPreferences}
                  >
                    {savingPreferences ? 'Saving...' : 'Save Theme Preference'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 5. LOGOUT SECTION */}
          {activeSection === 'logout' && (
            <div className="settings-card card-logout" data-testid="settings-logout-section">
              <div className="settings-card-header">
                <h2>Sign Out of Account</h2>
                <p>Disconnect active session tokens from this device.</p>
              </div>

              <div className="logout-content-wrap">
                <div className="logout-warning-box">
                  <div className="warning-icon">⚠️</div>
                  <div className="warning-text">
                    <h4>Are you sure you want to sign out?</h4>
                    <p>
                      You will be logged out of your GoalForge session on this browser. You can log back in at any time with your email and password.
                    </p>
                  </div>
                </div>

                <div className="logout-btn-wrap">
                  <button
                    type="button"
                    className="btn-logout-confirm"
                    onClick={() => setShowLogoutModal(true)}
                  >
                    🚪 Yes, Sign Out Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Sign Out of GoalForge"
        message="Are you sure you want to end your current authenticated session on this device? You can sign back in anytime."
        confirmLabel="Yes, Sign Out"
        variant="warning"
      />
    </div>
  );
}

export default SettingsPage;
