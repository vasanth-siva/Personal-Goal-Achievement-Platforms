import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import { ToastProvider, useToast } from '../components/Toast';
import useGoals from '../hooks/useGoals';

function MainLayoutContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const toast = useToast();
  const { addGoal } = useGoals();

  // Create Goal Form State
  const defaultTargetDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('CAREER');
  const [newTargetDate, setNewTargetDate] = useState(defaultTargetDate());
  const [newProgress, setNewProgress] = useState(0);
  const [newDescription, setNewDescription] = useState('');
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;
      setIsMobile(mobile);
      setIsTablet(tablet);

      if (mobile) {
        setIsSidebarOpen(false);
        setIsCollapsed(false);
      } else if (tablet) {
        setIsSidebarOpen(true);
        setIsCollapsed(true);
      } else {
        setIsSidebarOpen(true);
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for open modal events from anywhere in the app
  useEffect(() => {
    const handleOpen = () => setIsCreateModalOpen(true);
    window.addEventListener('openNewGoalModal', handleOpen);
    return () => window.removeEventListener('openNewGoalModal', handleOpen);
  }, []);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen((prev) => !prev);
    } else if (isTablet) {
      setIsCollapsed((prev) => !prev);
    } else {
      setIsSidebarOpen((prev) => !prev);
    }
  };

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setFormError(null);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Goal title is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const goalPayload = {
        title: newTitle.trim(),
        category: newCategory,
        targetDate: newTargetDate,
        progress: Number(newProgress) || 0,
        status: Number(newProgress) === 100 ? 'COMPLETED' : Number(newProgress) > 0 ? 'IN_PROGRESS' : 'PLANNED',
        description: newDescription.trim(),
      };

      await addGoal(goalPayload);
      toast.success(`"${goalPayload.title}" has been successfully forged!`, 'New Goal Created');

      // Reset form
      setNewTitle('');
      setNewCategory('CAREER');
      setNewTargetDate(defaultTargetDate());
      setNewProgress(0);
      setNewDescription('');
      setIsCreateModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to create goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={isSidebarOpen}
        onOpenNewGoal={() => setIsCreateModalOpen(true)}
        onTriggerNotification={() => toast.info('GoalForge platform synchronized.', 'System Notification')}
      />

      {/* Main SaaS Body: Sidebar + Main View */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          isMobile={isMobile}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic Page Content */}
        <main
          style={{
            flex: 1,
            padding: '2rem 1.5rem',
            overflowY: 'auto',
            minWidth: 0,
          }}
        >
          <Outlet context={{ openCreateGoalModal: () => setIsCreateModalOpen(true) }} />
        </main>
      </div>

      {/* Global New Goal Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title="Forge a New Goal"
        description="Define an actionable objective with target milestone date and discipline."
        size="md"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={handleCloseModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleCreateSubmit}
              loading={isSubmitting}
              icon={<span>+</span>}
            >
              Forge Objective
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            label="Goal Title"
            placeholder="e.g., Master Spring Boot 3 & Supabase Architecture"
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value);
              if (formError) setFormError(null);
            }}
            error={formError}
            icon={<span>🎯</span>}
            required
            autoFocus
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                  marginBottom: '0.4rem',
                }}
              >
                Discipline / Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  fontWeight: '500',
                }}
              >
                <option value="CAREER">💼 Career &amp; Tech</option>
                <option value="FITNESS">⚡ Health &amp; Fitness</option>
                <option value="FINANCE">💰 Finance &amp; Wealth</option>
                <option value="LEARNING">📚 Reading &amp; Growth</option>
                <option value="PERSONAL">🎯 Personal Trajectory</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                  marginBottom: '0.4rem',
                }}
              >
                Target Completion Date
              </label>
              <input
                type="date"
                value={newTargetDate}
                onChange={(e) => setNewTargetDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Initial Progress
              </label>
              <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                {newProgress}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={newProgress}
              onChange={(e) => setNewProgress(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--color-primary)',
                cursor: 'pointer',
              }}
            />
          </div>

          <Input
            label="Key Strategy & Notes (Optional)"
            placeholder="Outline milestones, metrics, and key results..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            isTextarea={true}
            rows={3}
          />
        </form>
      </Modal>
    </div>
  );
}

export function MainLayout() {
  return <MainLayoutContent />;
}

export default MainLayout;

