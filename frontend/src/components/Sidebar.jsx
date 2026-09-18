import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import ConfirmModal from './ConfirmModal';
import notificationService from '../services/notificationService';

export function Sidebar({
  isOpen = true,
  isCollapsed = false,
  onToggleCollapse,
  onClose,
  isMobile = false,
  activeItem,
  onSelectItem,
  onOpenNewGoal,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const toast = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationService.getUnreadCount();
        if (res && res.data && res.data.unreadCount !== undefined) {
          setUnreadCount(res.data.unreadCount);
        }
      } catch {}
    };
    fetchUnread();
    window.addEventListener('notificationUpdated', fetchUnread);
    return () => window.removeEventListener('notificationUpdated', fetchUnread);
  }, []);

  const navSections = [
    {
      title: 'Command Center',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'goals', label: 'My Goals', icon: '🎯', path: '/goals' },
        { id: 'create-goal', label: 'Create Goal', icon: '➕', path: '/goals/create', action: 'create-goal' },
        { id: 'tasks', label: 'Tasks', icon: '📋', path: '/tasks' },
      ],
    },
    {
      title: 'Tracking & Mastery',
      items: [
        { id: 'progress', label: 'Progress Tracking', icon: '📈', path: '/progress' },
        { id: 'analytics', label: 'Analytics', icon: '📉', path: '/analytics' },
        { id: 'achievements', label: 'Achievements', icon: '🏆', path: '/achievements' },
        { id: 'calendar', label: 'Calendar', icon: '📅', path: '/calendar' },
      ],
    },
    {
      title: 'Account & System',
      items: [
        {
          id: 'notifications',
          label: 'Notifications',
          icon: '🔔',
          badge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : String(unreadCount)) : null,
          badgeColor: '#ef4444',
          path: '/notifications',
        },
        { id: 'profile', label: 'Profile', icon: '👤', path: '/profile' },
        { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
      ],
    },
  ];

  const handleItemClick = (item) => {
    if (onSelectItem) onSelectItem(item.id);

    if (item.action === 'create-goal') {
      if (onOpenNewGoal) {
        onOpenNewGoal();
      } else {
        window.dispatchEvent(new CustomEvent('openNewGoalModal'));
      }
    } else if (item.path) {
      if (item.path.includes('#')) {
        const [targetPath, hash] = item.path.split('#');
        navigate(targetPath);
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        navigate(item.path);
      }
    }

    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    toast.info('You have been signed out successfully.', 'Session Ended');
    navigate('/login', { replace: true });
    if (isMobile && onClose) onClose();
  };

  const isPathActive = (item) => {
    if (activeItem) return activeItem === item.id;
    if (item.id === 'dashboard' && (location.pathname === '/' || location.pathname === '/dashboard')) {
      return true;
    }
    if (item.id === 'goals' && (location.pathname === '/goals' || location.pathname.startsWith('/goals/'))) {
      if (location.pathname === '/goals/create') return item.id === 'create-goal';
      return item.id === 'goals';
    }
    if (item.id === 'create-goal' && location.pathname === '/goals/create') return true;
    if (item.path && location.pathname === item.path) return true;
    return false;
  };

  const sidebarWidth = isMobile ? '280px' : isCollapsed ? '72px' : '260px';

  const sidebarContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        width: sidebarWidth,
        padding: isCollapsed ? '1rem 0.5rem' : '1.25rem 1rem',
        userSelect: 'none',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxSizing: 'border-box',
      }}
    >
      {/* Mobile Drawer Header */}
      {isMobile && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid var(--color-border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <img src="/src/assets/logo.svg" alt="GoalForge" style={{ width: '28px', height: '28px' }} />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', fontSize: '1.15rem' }}>
              Goal<span style={{ color: 'var(--color-primary)' }}>Forge</span>
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.25rem',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Tablet Mini-Rail Collapse Toggle Button */}
      {!isMobile && onToggleCollapse && (
        <div
          style={{
            display: 'flex',
            justifyContent: isCollapsed ? 'center' : 'flex-end',
            marginBottom: '0.75rem',
          }}
        >
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              fontSize: '0.8rem',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {isCollapsed ? '▶' : '◀'}
          </button>
        </div>
      )}

      {/* Navigation Sections */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {navSections.map((section, idx) => (
          <div key={idx}>
            {!isCollapsed ? (
              <p
                style={{
                  fontSize: '0.675rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-muted)',
                  marginBottom: '0.35rem',
                  paddingLeft: '0.65rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {section.title}
              </p>
            ) : (
              <div
                style={{
                  height: '1px',
                  backgroundColor: 'var(--color-border-subtle)',
                  margin: '0.5rem 0.25rem',
                }}
              />
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {section.items.map((item) => {
                const isActive = isPathActive(item);
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={isCollapsed ? item.label : undefined}
                    onClick={() => handleItemClick(item)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isCollapsed ? 'center' : 'space-between',
                      width: '100%',
                      padding: isCollapsed ? '0.6rem' : '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      fontWeight: isActive ? '600' : '500',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      position: 'relative',
                      transition: 'background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {item.icon}
                      </span>
                      {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                    </div>

                    {/* Badge */}
                    {item.badge && (
                      <span
                        style={{
                          fontSize: '0.675rem',
                          fontWeight: '700',
                          padding: isCollapsed ? '0.1rem 0.35rem' : '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: item.badgeColor || (isActive ? 'var(--color-primary)' : 'var(--color-bg-subtle)'),
                          color: '#ffffff',
                          position: isCollapsed ? 'absolute' : 'static',
                          top: isCollapsed ? '4px' : 'auto',
                          right: isCollapsed ? '4px' : 'auto',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom User Profile & Standard Sign Out */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <div
          onClick={() => navigate('/profile')}
          title="View profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '0.65rem',
            padding: isCollapsed ? '0.45rem' : '0.5rem 0.65rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-subtle)',
            cursor: 'pointer',
            transition: 'background var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-light)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)')}
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
              fontSize: '0.75rem',
              flexShrink: 0,
            }}
          >
            {user?.avatar || (user?.name || 'Alex').substring(0, 2).toUpperCase()}
          </div>
          {!isCollapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: 'var(--color-text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  margin: 0,
                }}
              >
                {user?.name || user?.fullName || 'Alex Morgan'}
              </p>
              <p style={{ fontSize: '0.675rem', color: 'var(--color-text-muted)', margin: 0 }}>
                GoalForge Pro
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          title="Logout"
          aria-label="Logout"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '0.65rem',
            width: '100%',
            padding: isCollapsed ? '0.5rem' : '0.55rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            color: '#ef4444',
            fontWeight: '600',
            fontSize: '0.825rem',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ef4444';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
            e.currentTarget.style.color = '#ef4444';
          }}
        >
          <span style={{ fontSize: '1rem' }}>🚪</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Standardized Logout Confirmation Dialog */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out of GoalForge?"
        message="Are you sure you want to end your current session? You will need to log back in to access your goals."
        confirmText="Yes, Sign Out"
        cancelText="Stay Signed In"
        variant="warning"
      />
    </div>
  );

  // If mobile drawer, wrap in fixed overlay with animation
  if (isMobile) {
    if (!isOpen) return null;
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: 'slideInRight 0.25s ease-out',
            height: '100%',
            maxWidth: '85vw',
          }}
        >
          {sidebarContent}
        </div>
      </div>
    );
  }

  // Desktop / Tablet Sidebar
  return (
    <aside
      style={{
        flexShrink: 0,
        height: 'calc(100vh - 68px)',
        position: 'sticky',
        top: '68px',
        zIndex: 30,
      }}
    >
      {sidebarContent}
    </aside>
  );
}

export default Sidebar;
