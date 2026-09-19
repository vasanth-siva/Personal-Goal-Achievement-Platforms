import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { useToast } from './Toast';
import progressService from '../services/progressService';
import goalService from '../services/goalService';

export function AddDailyProgressModal({ isOpen, onClose, onSuccess }) {
  const toast = useToast();
  const [goals, setGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(false);

  const [formData, setFormData] = useState({
    goalId: '',
    progressDate: new Date().toISOString().split('T')[0],
    progressPercentage: 50,
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available goals when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoadingGoals(true);
      goalService
        .getAll()
        .then((res) => {
          setGoals(Array.isArray(res?.data) ? res.data : []);
        })
        .catch(() => {
          setGoals([]);
        })
        .finally(() => {
          setLoadingGoals(false);
        });

      // Reset form
      setFormData({
        goalId: '',
        progressDate: new Date().toISOString().split('T')[0],
        progressPercentage: 50,
        notes: '',
      });
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.notes.trim()) {
      setError('Please add a reflection note describing your progress.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        goalId: formData.goalId ? Number(formData.goalId) : null,
        progressDate: formData.progressDate,
        progressPercentage: Number(formData.progressPercentage),
        notes: formData.notes.trim(),
      };

      await progressService.createLog(payload);
      toast.success('Daily progress logged successfully! Streak updated.', 'Momentum Recorded');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to log daily progress.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Daily Progress & Reflection"
      size="md"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && (
          <div
            style={{
              backgroundColor: 'var(--color-danger-light)',
              border: '1px solid var(--color-danger-border)',
              color: 'var(--color-danger-text)',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Date Field */}
        <Input
          label="Progress Date"
          type="date"
          value={formData.progressDate}
          onChange={(e) => setFormData({ ...formData, progressDate: e.target.value })}
          required
        />

        {/* Associated Goal Dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
            Associated Goal (Optional)
          </label>
          <select
            value={formData.goalId}
            onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
            style={{
              padding: '0.625rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
            }}
          >
            <option value="">🎯 General Overall Momentum</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title} ({g.progress}%)
              </option>
            ))}
          </select>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Select a target to link this reflection, or leave as General Momentum.
          </span>
        </div>

        {/* Progress Percentage Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              Estimated Momentum / Progress
            </label>
            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--color-primary)' }}>
              {formData.progressPercentage}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={formData.progressPercentage}
            onChange={(e) => setFormData({ ...formData, progressPercentage: Number(e.target.value) })}
            style={{
              width: '100%',
              accentColor: 'var(--color-primary)',
              cursor: 'pointer',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <span>0% Starting out</span>
            <span>50% Solid Work</span>
            <span>100% Major Milestone</span>
          </div>
        </div>

        {/* Reflection Notes Textarea */}
        <Input
          label="Reflection Notes & Wins *"
          placeholder="What milestones did you tackle today? Any blockers conquered or key takeaways?"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          isTextarea={true}
          rows={4}
          required
        />

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            {submitting ? 'Recording...' : 'Save Daily Progress'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddDailyProgressModal;
