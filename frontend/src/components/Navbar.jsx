import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import notificationService from '../services/notificationService';

export function Navbar({
  onToggleSidebar,
  isSidebarOpen,
  onOpenNewGoal,
  onTriggerNotification,
  notificationCount = 3,
}) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [liveUnreadCount, setLiveUnreadCount] = useState(0);

  const menuRef = useRef(null);
  const notifRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount(),
      ]);
      if (listRes && listRes.data) setLiveNotifications(listRes.data);
      if (countRes && countRes.data) setLiveUnreadCount(countRes.data.unreadCount || 0);
    } catch {
      // Keep graceful
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const handleUpdate = () => loadNotifications();
    window.addEventListener('notificationUpdated', handleUpdate);
    return () => window.removeEventListener('notificationUpdated', handleUpdate);
  }, [loadNotifications]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.info('You have been signed out.', 'Session Ended');
    navigate('/login', { replace: true });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/goals?search=${encodeURIComponent(searchQuery.trim())}`);
      toast.info(`Searching for "${searchQuery.trim()}"...`);
    }
  };

  const displayName = user?.name || user?.fullName || 'Alex Morgan';
  const displayEmail = user?.email || 'alex@goalforge.io';
  const displayAvatar = user?.avatar || displayName.substring(0, 2).toUpperCase();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 1.5rem',
          gap: '1rem',
          height: '68px',
        }}
      >
        {/* Left Side: Hamburger (mobile/tablet) + Logo & Tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label="Toggle navigation drawer"
              style={{
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.45rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-secondary)',
                fontSize: '1.2rem',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              ☰
            </button>
          )}

          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            <img
              src="/src/assets/logo.svg"
              alt="GoalForge Logo"
              style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    color: 'var(--color-text-primary)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Goal<span style={{ color: 'var(--color-primary)' }}>Forge</span>
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.725rem',
                  fontWeight: '600',
                  color: 'var(--color-secondary)',
                  letterSpacing: '0.01em',
                  lineHeight: 1.1,
                }}
              >
                Plan. Progress. Achieve.
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div style={{ flex: '1 1 360px', maxWidth: '480px', minWidth: '180px' }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.9rem',
                color: 'var(--color-text-muted)',
                pointerEvents: 'none',
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Search goals, tasks, targets... (Ctrl + K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 1rem 0.55rem 2.3rem',
                backgroundColor: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--color-text-primary)',
                outline: 'none',
                fontSize: '0.85rem',
                transition: 'border-color var(--transition-fast), background-color var(--transition-fast)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)';
                e.target.style.backgroundColor = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border)';
                e.target.style.backgroundColor = 'var(--color-bg-subtle)';
              }}
            />
          </form>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {/* Create Goal Action */}
          {onOpenNewGoal && (
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenNewGoal}
              icon={<span>+</span>}
              style={{ fontWeight: '600' }}
            >
              New Goal
            </Button>
          )}

          {/* Notifications Bell & Dropdown */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
              style={{
                position: 'relative',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                fontSize: '1.05rem',
                transition: 'background var(--transition-fast), border-color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
                e.currentTarget.style.borderColor = 'var(--color-primary-border)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              🔔
              {liveUnreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    border: '2px solid var(--color-surface)',
                    boxShadow: '0 0 6px rgba(239, 68, 68, 0.4)',
                  }}
                  data-testid="navbar-unread-badge"
                >
                  {liveUnreadCount > 9 ? '9+' : liveUnreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.85rem',
                  minWidth: '300px',
                  maxWidth: '340px',
                  zIndex: 50,
                  animation: 'fadeIn 0.15s ease-out',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                    Notifications ({liveUnreadCount})
                  </span>
                  {liveUnreadCount > 0 && (
                    <span
                      style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '600', cursor: 'pointer' }}
                      onClick={async () => {
                        await notificationService.markAllAsRead();
                        loadNotifications();
                        toast.success('All marked as read');
                      }}
                    >
                      Mark all read
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '260px', overflowY: 'auto' }}>
                  {liveNotifications.slice(0, 4).map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        padding: '0.5rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: !notif.isRead ? 'rgba(99, 102, 241, 0.08)' : 'var(--color-bg-subtle)',
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                      }}
                      onClick={async () => {
                        if (!notif.isRead) {
                          await notificationService.markAsRead(notif.id);
                          loadNotifications();
                        }
                        toast.info(notif.message);
                      }}
                    >
                      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{notif.icon || '🔔'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: !notif.isRead ? '700' : '500', color: 'var(--color-text-primary)', fontSize: '0.8rem', lineHeight: '1.3' }}>
                          {notif.message}
                        </div>
                      </div>
                    </div>
                  ))}

                  {liveNotifications.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                      No notifications yet
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/notifications');
                  }}
                  style={{
                    marginTop: '0.65rem',
                    width: '100%',
                    padding: '0.5rem',
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.775rem',
                    fontWeight: '700',
                    color: '#4f46e5',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  View All in Notification Center →
                </button>
              </div>
            )}
          </div>

          {/* User Name & Avatar Profile Menu */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.35rem 0.65rem 0.35rem 0.4rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'border-color var(--transition-fast), background var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary-border)';
                e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                }}
              >
                {displayAvatar}
              </div>

              {/* User Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span
                  style={{
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    color: 'var(--color-text-primary)',
                    maxWidth: '120px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {displayName}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>▼</span>
              </div>
            </div>

            {/* Profile Dropdown Menu */}
            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.75rem',
                  minWidth: '220px',
                  zIndex: 50,
                  animation: 'fadeIn 0.15s ease-out',
                }}
              >
                <div style={{ padding: '0.25rem 0.5rem 0.75rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <p style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                    {displayName}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {displayEmail}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.5rem 0' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.45rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.825rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span>👤</span>
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/goals');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.45rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.825rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span>🎯</span>
                    <span>My Goals</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/progress');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.45rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.825rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span>📈</span>
                    <span>Progress Tracking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.45rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.825rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span>⚙️</span>
                    <span>Settings</span>
                  </button>
                </div>

                <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--color-border-subtle)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--color-danger)',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-danger-light)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span>🚪</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

