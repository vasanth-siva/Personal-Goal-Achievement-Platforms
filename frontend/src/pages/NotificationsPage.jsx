import React, { useState, useEffect, useCallback, useMemo } from 'react';
import notificationService from '../services/notificationService';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { NotificationsSkeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import './NotificationsPage.css';

export function NotificationsPage() {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'read'
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'TASK_DUE' | 'GOAL_COMPLETED' | 'STREAK'
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, countRes] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount(),
      ]);

      if (listRes && listRes.data) {
        setNotifications(listRes.data);
      }
      if (countRes && countRes.data) {
        setUnreadCount(countRes.data.unreadCount || 0);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load notifications', 'Error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success('Notification marked as read.', 'Updated');
    } catch (err) {
      toast.error('Could not mark notification as read.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read.', 'Cleared Unread');
    } catch (err) {
      toast.error('Failed to mark all as read.');
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      const target = notifications.find((n) => n.id === id);
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.info('Notification cleared.', 'Removed');
    } catch (err) {
      toast.error('Failed to clear notification.');
    }
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    setIsClearModalOpen(true);
  };

  const handleConfirmClearAll = async () => {
    setIsClearing(true);
    try {
      await notificationService.clearAll();
      setNotifications([]);
      setUnreadCount(0);
      toast.info('All notifications cleared.', 'Inbox Empty');
      setIsClearModalOpen(false);
    } catch (err) {
      toast.error('Failed to clear all notifications.');
    } finally {
      setIsClearing(false);
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return 'Just now';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Tab filter
      if (activeTab === 'unread' && n.isRead) return false;
      if (activeTab === 'read' && !n.isRead) return false;

      // Type filter
      if (filterType !== 'ALL' && n.type !== filterType) return false;

      return true;
    });
  }, [notifications, activeTab, filterType]);

  const readCount = notifications.length - unreadCount;

  return (
    <div className="notifications-page container-saas">
      {/* Header Banner */}
      <div className="notifications-hero">
        <div className="notifications-hero-content">
          <div className="notifications-hero-badge">
            <span className="bell-icon">🔔</span> Notification Center
            {unreadCount > 0 && (
              <span className="hero-unread-pill" data-testid="hero-unread-count">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <h1 className="notifications-hero-title">Stay on Top of Your Momentum</h1>
          <p className="notifications-hero-subtitle">
            Real-time alerts on upcoming task deadlines, milestone celebrations, and execution consistency streaks.
          </p>
        </div>

        <div className="notifications-hero-actions">
          <button
            type="button"
            className="btn-notif-action btn-mark-all"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            ✓ Mark All as Read
          </button>
          <button
            type="button"
            className="btn-notif-action btn-clear-all"
            onClick={handleClearAll}
            disabled={notifications.length === 0}
          >
            🗑️ Clear All
          </button>
        </div>
      </div>

      {/* Toolbar & Filter Tabs */}
      <div className="notifications-toolbar">
        <div className="notifications-tabs">
          <button
            type="button"
            className={`notif-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All <span className="tab-count">{notifications.length}</span>
          </button>
          <button
            type="button"
            className={`notif-tab ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            Unread{' '}
            {unreadCount > 0 && (
              <span className="tab-count count-unread">{unreadCount}</span>
            )}
          </button>
          <button
            type="button"
            className={`notif-tab ${activeTab === 'read' ? 'active' : ''}`}
            onClick={() => setActiveTab('read')}
          >
            Read <span className="tab-count">{readCount}</span>
          </button>
        </div>

        <div className="notifications-type-filters">
          <button
            type="button"
            className={`type-pill ${filterType === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            All Types
          </button>
          <button
            type="button"
            className={`type-pill ${filterType === 'TASK_DUE' ? 'active' : ''}`}
            onClick={() => setFilterType('TASK_DUE')}
          >
            ⏰ Tasks Due
          </button>
          <button
            type="button"
            className={`type-pill ${filterType === 'GOAL_COMPLETED' ? 'active' : ''}`}
            onClick={() => setFilterType('GOAL_COMPLETED')}
          >
            🏆 Goals Done
          </button>
          <button
            type="button"
            className={`type-pill ${filterType === 'STREAK' ? 'active' : ''}`}
            onClick={() => setFilterType('STREAK')}
          >
            🔥 Streaks
          </button>
        </div>
      </div>

      {/* Notifications Feed */}
      {loading && notifications.length === 0 ? (
        <NotificationsSkeleton />
      ) : filteredNotifications.length > 0 ? (
        <div className="notifications-list" data-testid="notifications-list">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification-item ${notif.isRead ? 'item-read' : 'item-unread'}`}
              data-testid={`notification-item-${notif.id}`}
            >
              <div className="notif-icon-col">
                <div className={`notif-icon-bubble notif-type-${(notif.type || 'system').toLowerCase()}`}>
                  {notif.icon || '🔔'}
                </div>
              </div>

              <div className="notif-content-col">
                <div className="notif-meta-row">
                  <span className={`notif-type-tag tag-${(notif.type || 'system').toLowerCase()}`}>
                    {notif.type?.replace('_', ' ') || 'ALERT'}
                  </span>
                  <span className="notif-time">{formatTimestamp(notif.createdAt)}</span>
                </div>
                <p className="notif-message">{notif.message}</p>
              </div>

              <div className="notif-actions-col">
                {!notif.isRead ? (
                  <button
                    type="button"
                    className="btn-action-read"
                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                    title="Mark as read"
                  >
                    Mark read
                  </button>
                ) : (
                  <span className="read-checkmark" title="Read">✓</span>
                )}
                <button
                  type="button"
                  className="btn-action-delete"
                  onClick={(e) => handleDelete(notif.id, e)}
                  title="Clear notification"
                >
                  ✕
                </button>
              </div>

              {!notif.isRead && <div className="unread-dot" />}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🎉"
          title="All caught up!"
          description={
            activeTab === 'unread'
              ? 'No unread notifications at the moment. Keep crushing your goals!'
              : 'No notifications found matching your filter criteria.'
          }
          actionLabel={filterType !== 'ALL' || activeTab !== 'all' ? 'Reset Filters' : undefined}
          onAction={() => {
            setActiveTab('all');
            setFilterType('ALL');
          }}
        />
      )}

      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleConfirmClearAll}
        title="Clear All Notifications"
        message="Are you sure you want to clear all notifications from your feed? This action cannot be undone."
        confirmLabel="Yes, Clear All"
        variant="danger"
        loading={isClearing}
      />
    </div>
  );
}

export default NotificationsPage;
