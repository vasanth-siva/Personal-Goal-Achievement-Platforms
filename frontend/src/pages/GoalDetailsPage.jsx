import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import goalService from '../services/goalService';
import phaseService from '../services/phaseService';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import PhaseTimeline from '../components/PhaseTimeline';
import PhaseTaskList from '../components/PhaseTaskList';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { DetailsSkeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { formatDate, getCategoryInfo, getDeadlineStatus } from '../utils/formatters';

export function GoalDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [goal, setGoal] = useState(null);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingGoal, setIsDeletingGoal] = useState(false);

  const [phaseToDelete, setPhaseToDelete] = useState(null);
  const [isDeletingPhase, setIsDeletingPhase] = useState(false);

  const [isAddPhaseModalOpen, setIsAddPhaseModalOpen] = useState(false);
  const [newPhaseData, setNewPhaseData] = useState({ phaseName: '', description: '', progressPercentage: 0 });
  const [isSubmittingPhase, setIsSubmittingPhase] = useState(false);

  const [editingPhase, setEditingPhase] = useState(null);
  const [isEditingPhaseModalOpen, setIsEditingPhaseModalOpen] = useState(false);

  const [activePhaseId, setActivePhaseId] = useState(null);

  // Load Goal and its Phases
  const loadGoalAndPhases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [goalRes, phasesRes] = await Promise.all([
        goalService.getById(id),
        phaseService.getPhases(id).catch(() => ({ data: [] })),
      ]);

      if (goalRes && goalRes.data) {
        setGoal(goalRes.data);
        const loadedPhases = Array.isArray(phasesRes?.data) ? phasesRes.data : [];
        setPhases(loadedPhases);
      } else {
        setError('Goal not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load goal details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadGoalAndPhases();
  }, [loadGoalAndPhases]);

  // Goal-level Progress Bump (when no phases, or manual adjustment)
  const handleUpdateGoalProgress = async (newProgress, newStatus) => {
    if (!goal) return;
    try {
      const clamped = Math.min(100, Math.max(0, newProgress));
      const status = newStatus || (clamped === 100 ? 'Completed' : clamped > 0 ? 'In Progress' : 'Not Started');
      const updated = await goalService.update(goal.id, { progress: clamped, status });
      setGoal(updated.data);
      window.dispatchEvent(new CustomEvent('goalChange'));

      if (clamped === 100) {
        toast.success('Goal accomplished! Congratulations!', 'Milestone Reached');
      } else {
        toast.info(`Progress updated to ${clamped}%.`, 'Progress Updated');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update progress', 'Update Error');
    }
  };

  // Delete Entire Goal
  const handleDeleteGoal = async () => {
    if (!goal) return;
    setIsDeletingGoal(true);
    try {
      await goalService.delete(goal.id);
      toast.info('Goal removed from active targets.', 'Goal Deleted');
      window.dispatchEvent(new CustomEvent('goalChange'));
      navigate('/goals');
    } catch (err) {
      toast.error(err.message || 'Failed to delete goal', 'Delete Error');
      setIsDeletingGoal(false);
      setIsDeleteModalOpen(false);
    }
  };

  // --------------------------------------------------------------------------
  // Phase Actions
  // --------------------------------------------------------------------------

  // Add Phase
  const handleAddPhase = async (e) => {
    e.preventDefault();
    if (!newPhaseData.phaseName.trim()) {
      toast.error('Phase name is required', 'Validation Error');
      return;
    }

    setIsSubmittingPhase(true);
    try {
      await phaseService.addPhase(goal.id, {
        phaseName: newPhaseData.phaseName.trim(),
        description: newPhaseData.description.trim(),
        progressPercentage: Number(newPhaseData.progressPercentage) || 0,
      });

      toast.success('New phase added to roadmap.', 'Phase Added');
      setIsAddPhaseModalOpen(false);
      setNewPhaseData({ phaseName: '', description: '', progressPercentage: 0 });

      // Refresh goal and phases to sync auto-calculated progress
      await loadGoalAndPhases();
      window.dispatchEvent(new CustomEvent('goalChange'));
    } catch (err) {
      toast.error(err.message || 'Failed to add phase', 'Error');
    } finally {
      setIsSubmittingPhase(false);
    }
  };

  // Edit Phase Submit
  const handleSaveEditedPhase = async (e) => {
    e.preventDefault();
    if (!editingPhase || !editingPhase.phaseName.trim()) {
      toast.error('Phase name is required', 'Validation Error');
      return;
    }

    setIsSubmittingPhase(true);
    try {
      const progress = Number(editingPhase.progressPercentage) || 0;
      const status = progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started';

      await phaseService.updatePhase(goal.id, editingPhase.id, {
        phaseName: editingPhase.phaseName.trim(),
        description: editingPhase.description ? editingPhase.description.trim() : '',
        status: editingPhase.status || status,
        progressPercentage: progress,
      });

      toast.success('Phase updated successfully.', 'Phase Saved');
      setIsEditingPhaseModalOpen(false);
      setEditingPhase(null);

      // Refresh to update parent goal progress
      await loadGoalAndPhases();
      window.dispatchEvent(new CustomEvent('goalChange'));
    } catch (err) {
      toast.error(err.message || 'Failed to update phase', 'Error');
    } finally {
      setIsSubmittingPhase(false);
    }
  };

  // Toggle Phase Complete
  const handleTogglePhaseComplete = async (phaseId) => {
    try {
      await phaseService.toggleComplete(goal.id, phaseId);
      toast.success('Phase completion status updated.', 'Status Toggled');
      await loadGoalAndPhases();
      window.dispatchEvent(new CustomEvent('goalChange'));
    } catch (err) {
      toast.error(err.message || 'Failed to update phase status', 'Error');
    }
  };

  // Delete Phase
  const handleConfirmDeletePhase = async () => {
    if (!phaseToDelete) return;
    setIsDeletingPhase(true);
    try {
      await phaseService.deletePhase(goal.id, phaseToDelete.id);
      toast.info(`"${phaseToDelete.phaseName}" removed from roadmap.`, 'Phase Deleted');
      setPhaseToDelete(null);
      await loadGoalAndPhases();
      window.dispatchEvent(new CustomEvent('goalChange'));
    } catch (err) {
      toast.error(err.message || 'Failed to delete phase', 'Error');
    } finally {
      setIsDeletingPhase(false);
    }
  };

  // Reorder Phases (Move Up / Down)
  const handleMovePhase = async (phaseIndex, direction) => {
    const targetIndex = direction === 'up' ? phaseIndex - 1 : phaseIndex + 1;
    if (targetIndex < 0 || targetIndex >= phases.length) return;

    const newPhases = [...phases];
    const [moved] = newPhases.splice(phaseIndex, 1);
    newPhases.splice(targetIndex, 0, moved);

    const reorderedIds = newPhases.map((p) => p.id);
    setPhases(newPhases); // optimistic update

    try {
      await phaseService.reorderPhases(goal.id, reorderedIds);
      toast.success('Phases reordered.', 'Sequence Updated');
      await loadGoalAndPhases();
    } catch (err) {
      toast.error(err.message || 'Failed to reorder phases', 'Error');
      await loadGoalAndPhases();
    }
  };

  // Quick adjust phase progress
  const handleQuickAdjustPhaseProgress = async (phase, delta) => {
    const newProgress = Math.min(100, Math.max(0, (Number(phase.progressPercentage) || 0) + delta));
    const newStatus = newProgress === 100 ? 'Completed' : newProgress > 0 ? 'In Progress' : 'Not Started';

    try {
      await phaseService.updatePhase(goal.id, phase.id, {
        progressPercentage: newProgress,
        status: newStatus,
      });
      await loadGoalAndPhases();
      window.dispatchEvent(new CustomEvent('goalChange'));
    } catch (err) {
      toast.error(err.message || 'Failed to update phase progress', 'Error');
    }
  };

  if (loading) {
    return (
      <div className="container-saas" style={{ maxWidth: '920px', margin: '0 auto', paddingBottom: '3.5rem' }}>
        <DetailsSkeleton />
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className="container-saas" style={{ maxWidth: '600px', margin: '3rem auto' }}>
        <ErrorState
          title="Goal Not Found"
          message={error || 'The requested objective may have been removed or does not belong to your account.'}
          onRetry={loadGoalAndPhases}
          secondaryAction={
            <Link to="/goals">
              <Button variant="outline">Return to Goals</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(goal.category);
  const deadlineInfo = getDeadlineStatus(goal.targetDate);
  const progress = Math.min(100, Math.max(0, Number(goal.progress) || 0));

  const completedPhasesCount = phases.filter(
    (p) => (p.status || '').toUpperCase() === 'COMPLETED' || Number(p.progressPercentage) === 100
  ).length;

  return (
    <div className="container-saas" style={{ maxWidth: '920px', margin: '0 auto', paddingBottom: '3.5rem' }}>
      {/* Top Breadcrumb & Action Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          paddingTop: '0.5rem',
        }}
      >
        <Link
          to="/goals"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--color-text-secondary)',
            fontSize: '0.875rem',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          &larr; Back to Goals
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to={`/goals/${goal.id}/edit`}>
            <Button variant="outline" size="sm" icon={<span>✏️</span>} id="btn-edit-goal">
              Edit Goal
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            icon={<span>🗑️</span>}
            id="btn-delete-goal"
          >
            Delete Goal
          </Button>
        </div>
      </div>

      {/* Main Goal Overview Card */}
      <Card variant="default" padding="lg" style={{ marginBottom: '1.75rem' }}>
        {/* Badges Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: categoryInfo.color,
              backgroundColor: categoryInfo.bg,
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${categoryInfo.border}`,
            }}
          >
            <span>{categoryInfo.icon}</span>
            <span>{categoryInfo.label}</span>
          </div>

          <PriorityBadge priority={goal.priority} size="md" />
          <StatusBadge status={goal.status} size="md" />
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: '800',
            lineHeight: 1.25,
            color: 'var(--color-text-primary)',
            marginBottom: '1rem',
          }}
        >
          {goal.title}
        </h1>

        {/* Description */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
            Description &amp; Strategy
          </h4>
          <p
            style={{
              fontSize: '1rem',
              lineHeight: 1.65,
              color: 'var(--color-text-secondary)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {goal.description || 'No detailed description provided for this objective.'}
          </p>
        </div>

        {/* Timeline Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            padding: '1.25rem',
            backgroundColor: 'var(--color-bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Start Date
            </span>
            <p style={{ margin: '0.2rem 0 0', fontWeight: '700', color: 'var(--color-text-primary)', fontSize: '1rem' }}>
              📅 {formatDate(goal.startDate)}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Target Deadline
            </span>
            <p style={{ margin: '0.2rem 0 0', fontWeight: '700', color: 'var(--color-text-primary)', fontSize: '1rem' }}>
              🏁 {formatDate(goal.targetDate)}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
              Timeline Status
            </span>
            <p
              style={{
                margin: '0.2rem 0 0',
                fontWeight: '700',
                fontSize: '1rem',
                color: deadlineInfo.isOverdue
                  ? 'var(--color-danger)'
                  : deadlineInfo.isUrgent
                  ? 'var(--color-warning-text)'
                  : 'var(--color-primary)',
              }}
            >
              ⏰ {deadlineInfo.label}
            </p>
          </div>
        </div>
      </Card>

      {/* Overall Progress Section */}
      <Card variant="default" padding="lg" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
                Overall Progress
              </h3>
              {phases.length > 0 && (
                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: '700',
                    color: 'var(--color-primary)',
                    backgroundColor: 'var(--color-primary-light)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  ⚡ Auto-Calculated from {phases.length} Phases
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0.2rem 0 0' }}>
              {phases.length > 0
                ? `${completedPhasesCount} of ${phases.length} phases completed`
                : 'Manual progress tracking (add phases below to enable auto-calculation)'}
            </p>
          </div>

          <span style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--color-primary)' }}>
            {progress}%
          </span>
        </div>

        <ProgressBar
          value={progress}
          variant={progress === 100 ? 'success' : 'gradient'}
          size="lg"
          showValue={false}
        />
      </Card>

      {/* ======================================================================
          GOAL PHASES & VISUAL TIMELINE SECTION
          ====================================================================== */}
      <section id="goal-phases-section" style={{ marginBottom: '2rem' }}>
        <Card variant="default" padding="lg">
          {/* Section Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.25rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--color-border-subtle)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-text-primary)', margin: 0 }}>
                  Execution Roadmap &amp; Phases
                </h2>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: '#4338ca',
                    backgroundColor: 'var(--color-primary-light)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  {phases.length} {phases.length === 1 ? 'Phase' : 'Phases'}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0.25rem 0 0' }}>
                Sequential milestones breaking down this objective into actionable execution stages.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={<span>+</span>}
              onClick={() => setIsAddPhaseModalOpen(true)}
              id="btn-add-phase"
            >
              Add Phase
            </Button>
          </div>

          {/* Visual Stepping Timeline */}
          {phases.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Milestone Sequence
                </span>
                <span style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>
                  Click a phase node to highlight
                </span>
              </div>

              <PhaseTimeline
                phases={phases}
                activePhaseId={activePhaseId}
                onSelectPhase={(phaseId) => {
                  setActivePhaseId(phaseId);
                  const el = document.getElementById(`phase-card-${phaseId}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              />
            </div>
          )}

          {/* Phases List */}
          {phases.length === 0 ? (
            <EmptyState
              icon="🗺️"
              title="No execution phases defined yet"
              description={`Break down "${goal.title}" into clear sequential stages (e.g. Fundamentals, Practice, Milestones).`}
              actionLabel="+ Create Phase 1"
              onAction={() => setIsAddPhaseModalOpen(true)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {phases.map((phase, index) => {
                const isCompleted =
                  (phase.status || '').toUpperCase() === 'COMPLETED' ||
                  Number(phase.progressPercentage) === 100;
                const isFirst = index === 0;
                const isLast = index === phases.length - 1;
                const isSelected = activePhaseId === phase.id;

                return (
                  <div
                    key={phase.id}
                    id={`phase-card-${phase.id}`}
                    style={{
                      padding: '1.15rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected
                        ? '2px solid var(--color-primary)'
                        : isCompleted
                        ? '1px solid var(--color-success-border)'
                        : '1px solid var(--color-border)',
                      backgroundColor: isCompleted
                        ? 'var(--color-success-light)'
                        : 'var(--color-surface)',
                      boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-xs)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {/* Phase Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: isCompleted ? 'var(--color-success)' : 'var(--color-primary-light)',
                            color: isCompleted ? '#ffffff' : 'var(--color-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: '800',
                            flexShrink: 0,
                          }}
                        >
                          {isCompleted ? '✓' : phase.phaseOrder || index + 1}
                        </span>

                        <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
                          {phase.phaseName}
                        </h4>

                        <StatusBadge status={phase.status} size="sm" />
                      </div>

                      {/* Reorder Buttons & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={() => handleMovePhase(index, 'up')}
                          disabled={isFirst}
                          title="Move Phase Up"
                          style={{
                            padding: '0.2rem 0.45rem',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-surface)',
                            color: isFirst ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
                            cursor: isFirst ? 'not-allowed' : 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMovePhase(index, 'down')}
                          disabled={isLast}
                          title="Move Phase Down"
                          style={{
                            padding: '0.2rem 0.45rem',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-surface)',
                            color: isLast ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
                            cursor: isLast ? 'not-allowed' : 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          ▼
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingPhase({ ...phase });
                            setIsEditingPhaseModalOpen(true);
                          }}
                          title="Edit Phase"
                          style={{
                            padding: '0.2rem 0.45rem',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-surface)',
                            color: 'var(--color-text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          onClick={() => setPhaseToDelete(phase)}
                          title="Delete Phase"
                          aria-label={`Delete phase ${phase.phaseName}`}
                          style={{
                            padding: '0.2rem 0.45rem',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-surface)',
                            color: 'var(--color-danger)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Phase Description */}
                    {phase.description && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0 0 0.85rem 2.3rem', lineHeight: 1.5 }}>
                        {phase.description}
                      </p>
                    )}

                    {/* Phase Progress Bar & Controls */}
                    <div style={{ marginLeft: '2.3rem', marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>
                          Phase Progress
                        </span>
                        <span style={{ fontSize: '0.825rem', fontWeight: '800', color: isCompleted ? 'var(--color-success-text)' : 'var(--color-primary)' }}>
                          {phase.progressPercentage || 0}%
                        </span>
                      </div>

                      <ProgressBar
                        value={phase.progressPercentage || 0}
                        variant={isCompleted ? 'success' : 'primary'}
                        size="sm"
                        showValue={false}
                      />

                      {/* Phase Micro Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        <Button
                          variant={isCompleted ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => handleTogglePhaseComplete(phase.id)}
                        >
                          {isCompleted ? '↩ Reopen Phase' : '✓ Mark Phase Complete'}
                        </Button>

                        {!isCompleted && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleQuickAdjustPhaseProgress(phase, -10)}
                              style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: 'var(--radius-xs)',
                                border: '1px solid var(--color-border)',
                                backgroundColor: 'var(--color-surface)',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                fontWeight: '600',
                              }}
                            >
                              -10%
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickAdjustPhaseProgress(phase, +10)}
                              style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: 'var(--radius-xs)',
                                border: '1px solid var(--color-border)',
                                backgroundColor: 'var(--color-surface)',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                fontWeight: '600',
                              }}
                            >
                              +10%
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickAdjustPhaseProgress(phase, +25)}
                              style={{
                                padding: '0.2rem 0.5rem',
                                borderRadius: 'var(--radius-xs)',
                                border: '1px solid var(--color-border)',
                                backgroundColor: 'var(--color-surface)',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                fontWeight: '600',
                              }}
                            >
                              +25%
                            </button>
                          </>
                        )}
                      </div>
                      {/* Embedded Phase Tasks & Cascading Action Items */}
                      <PhaseTaskList
                        phaseId={phase.id}
                        phaseName={phase.phaseName}
                        onProgressChange={async () => {
                          await loadGoalAndPhases();
                          window.dispatchEvent(new CustomEvent('goalChange'));
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </section>

      {/* ======================================================================
          MODALS
          ====================================================================== */}

      {/* Add Phase Modal */}
      <Modal
        isOpen={isAddPhaseModalOpen}
        onClose={() => setIsAddPhaseModalOpen(false)}
        title="Add Execution Phase"
        description="Define a concrete sequential milestone for this goal."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddPhaseModalOpen(false)} disabled={isSubmittingPhase}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddPhase} loading={isSubmittingPhase} id="btn-submit-add-phase">
              Add Phase
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddPhase} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            label="Phase Name"
            placeholder="e.g. Java Fundamentals, Advanced Concurrency, Capstone Project..."
            value={newPhaseData.phaseName}
            onChange={(e) => setNewPhaseData({ ...newPhaseData, phaseName: e.target.value })}
            required
            id="input-new-phase-name"
          />

          <div>
            <label
              htmlFor="input-new-phase-desc"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                marginBottom: '0.4rem',
              }}
            >
              Description &amp; Key Deliverables
            </label>
            <textarea
              id="input-new-phase-desc"
              rows={3}
              placeholder="List specific concepts, modules, or outputs required to finish this phase..."
              value={newPhaseData.description}
              onChange={(e) => setNewPhaseData({ ...newPhaseData, description: e.target.value })}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label htmlFor="input-new-phase-prog" style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                Initial Progress
              </label>
              <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                {newPhaseData.progressPercentage}%
              </span>
            </div>
            <input
              id="input-new-phase-prog"
              type="range"
              min="0"
              max="100"
              step="5"
              value={newPhaseData.progressPercentage}
              onChange={(e) => setNewPhaseData({ ...newPhaseData, progressPercentage: Number(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--color-primary)' }}
            />
          </div>
        </form>
      </Modal>

      {/* Edit Phase Modal */}
      {editingPhase && (
        <Modal
          isOpen={isEditingPhaseModalOpen}
          onClose={() => {
            setIsEditingPhaseModalOpen(false);
            setEditingPhase(null);
          }}
          title="Edit Phase"
          description="Update milestone details, status, or completion percentage."
          size="md"
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditingPhaseModalOpen(false);
                  setEditingPhase(null);
                }}
                disabled={isSubmittingPhase}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveEditedPhase} loading={isSubmittingPhase} id="btn-save-edited-phase">
                Save Phase
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveEditedPhase} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input
              label="Phase Name"
              value={editingPhase.phaseName}
              onChange={(e) => setEditingPhase({ ...editingPhase, phaseName: e.target.value })}
              required
              id="input-edit-phase-name"
            />

            <div>
              <label
                htmlFor="input-edit-phase-desc"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                  marginBottom: '0.4rem',
                }}
              >
                Description
              </label>
              <textarea
                id="input-edit-phase-desc"
                rows={3}
                value={editingPhase.description || ''}
                onChange={(e) => setEditingPhase({ ...editingPhase, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label htmlFor="input-edit-phase-prog" style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                  Progress Percentage
                </label>
                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                  {editingPhase.progressPercentage}%
                </span>
              </div>
              <input
                id="input-edit-phase-prog"
                type="range"
                min="0"
                max="100"
                step="5"
                value={editingPhase.progressPercentage}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const st = val === 100 ? 'Completed' : val > 0 ? 'In Progress' : 'Not Started';
                  setEditingPhase({ ...editingPhase, progressPercentage: val, status: st });
                }}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Goal Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteGoal}
        title="Delete Objective"
        message={`Deleting "${goal.title}" will also permanently delete all associated execution phases and remove it from your statistics.`}
        confirmLabel="Yes, Delete Goal"
        variant="danger"
        loading={isDeletingGoal}
      />

      {/* Delete Phase Modal */}
      <ConfirmModal
        isOpen={!!phaseToDelete}
        onClose={() => setPhaseToDelete(null)}
        onConfirm={handleConfirmDeletePhase}
        title="Delete Execution Phase"
        message={
          phaseToDelete
            ? `Are you sure you want to delete phase "${phaseToDelete.phaseName}" and all associated tasks? This action cannot be undone.`
            : ''
        }
        confirmLabel="Yes, Delete Phase"
        variant="danger"
        loading={isDeletingPhase}
      />
    </div>
  );
}

export default GoalDetailsPage;
