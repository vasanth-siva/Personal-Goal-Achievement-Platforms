import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import goalService from '../services/goalService';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { DetailsSkeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import { getCategoryInfo, getPriorityInfo } from '../utils/formatters';

const CATEGORIES = [
  'Education',
  'Career',
  'Fitness',
  'Finance',
  'Personal',
  'Skills',
  'Other',
];

const PRIORITIES = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];

const STATUSES = [
  { value: 'Not Started', label: 'Not Started' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
];

export function EditGoalPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Career',
    priority: 'Medium',
    status: 'In Progress',
    progress: 0,
    startDate: '',
    targetDate: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchGoal = useCallback(async () => {
    setLoading(true);
    try {
      const res = await goalService.getById(id);
      if (res && res.data) {
        const g = res.data;
        setFormData({
          title: g.title || '',
          description: g.description || '',
          category: g.category || 'Career',
          priority: g.priority || 'Medium',
          status: g.status || 'Not Started',
          progress: Number(g.progress) || 0,
          startDate: g.startDate || '',
          targetDate: g.targetDate || '',
        });
      } else {
        toast.error('Goal not found', 'Error');
        navigate('/goals');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load goal', 'Load Error');
      navigate('/goals');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (formData.startDate && formData.targetDate && formData.startDate > formData.targetDate) {
      newErrors.targetDate = 'Target date must be on or after start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        progress: Number(formData.progress),
        startDate: formData.startDate || null,
        targetDate: formData.targetDate || null,
      };

      await goalService.update(id, payload);
      toast.success('Goal updated successfully!', 'Saved');
      window.dispatchEvent(new CustomEvent('goalChange'));
      navigate(`/goals/${id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update goal', 'Update Error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <DetailsSkeleton />;
  }

  return (
    <div className="container-saas" style={{ maxWidth: '780px', margin: '0 auto', paddingBottom: '3.5rem' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '1.25rem', paddingTop: '0.5rem' }}>
        <Link
          to={`/goals/${id}`}
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
          &larr; Back to Goal Details
        </Link>
      </div>

      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            fontSize: '0.8rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
          }}
        >
          <span>✏️</span>
          <span>Edit Milestone</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.35rem', color: 'var(--color-text-primary)' }}>
          Edit <span style={{ color: 'var(--color-primary)' }}>Goal</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Update your objective scope, timeline, priority, and completion velocity.
        </p>
      </div>

      {/* Form Card */}
      <Card variant="default" padding="lg">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Title */}
          <div>
            <Input
              label="Goal Title"
              placeholder="e.g. Master Full-Stack Architecture..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={errors.title}
              required
              id="input-edit-title"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="input-edit-desc"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                marginBottom: '0.4rem',
              }}
            >
              Description &amp; Strategy
            </label>
            <textarea
              id="input-edit-desc"
              rows={4}
              placeholder="Outline the core milestones, resources, or reason for achieving this target..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
                transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)';
                e.target.style.boxShadow = 'var(--shadow-focus-ring)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Category Selector */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
                marginBottom: '0.5rem',
              }}
            >
              Category <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => {
                const info = getCategoryInfo(cat);
                const isSelected = formData.category.toUpperCase() === cat.toUpperCase();
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.9rem',
                      borderRadius: 'var(--radius-full)',
                      border: isSelected ? `2px solid ${info.color}` : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? info.bg : 'var(--color-surface)',
                      color: isSelected ? info.color : 'var(--color-text-secondary)',
                      fontWeight: isSelected ? '700' : '500',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <span>{info.icon}</span>
                    <span>{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority & Status row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {/* Priority */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                  marginBottom: '0.5rem',
                }}
              >
                Priority
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {PRIORITIES.map((p) => {
                  const info = getPriorityInfo(p.value);
                  const isSelected = formData.priority.toUpperCase() === p.value.toUpperCase();
                  return (
                    <label
                      key={p.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 0.8rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? `2px solid ${info.dotColor}` : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? info.bg : 'var(--color-surface)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        color: info.color,
                      }}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={p.value}
                        checked={isSelected}
                        onChange={() => setFormData({ ...formData, priority: p.value })}
                        style={{ accentColor: info.dotColor }}
                      />
                      <span>{info.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Status */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--color-text-primary)',
                  marginBottom: '0.5rem',
                }}
              >
                Status
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {STATUSES.map((s) => {
                  const isSelected = formData.status.replace(/[\s_-]+/g, '_').toUpperCase() === s.value.replace(/[\s_-]+/g, '_').toUpperCase();
                  return (
                    <label
                      key={s.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 0.8rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-surface)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? '700' : '500',
                        color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      }}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={s.value}
                        checked={isSelected}
                        onChange={() => {
                          const newStatus = s.value;
                          let newProg = formData.progress;
                          if (newStatus === 'Completed') newProg = 100;
                          if (newStatus === 'Not Started' && newProg === 100) newProg = 0;
                          setFormData({ ...formData, status: newStatus, progress: newProg });
                        }}
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <span>{s.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Progress Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label
                htmlFor="input-edit-progress"
                style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text-primary)' }}
              >
                Current Progress
              </label>
              <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                {formData.progress}%
              </span>
            </div>
            <input
              id="input-edit-progress"
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.progress}
              onChange={(e) => {
                const val = Number(e.target.value);
                const status = val === 100 ? 'Completed' : val > 0 ? 'In Progress' : 'Not Started';
                setFormData({ ...formData, progress: val, status });
              }}
              style={{
                width: '100%',
                cursor: 'pointer',
                accentColor: 'var(--color-primary)',
              }}
            />
          </div>

          {/* Dates: Start Date & Target Date */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <Input
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                id="input-edit-start-date"
              />
            </div>
            <div>
              <Input
                label="Target Date (Deadline)"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                error={errors.targetDate}
                id="input-edit-target-date"
              />
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--color-border-subtle)',
            }}
          >
            <Link to={`/goals/${id}`}>
              <Button variant="ghost" type="button" disabled={submitting}>
                Cancel
              </Button>
            </Link>
            <Button variant="primary" type="submit" loading={submitting} id="btn-save-goal">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default EditGoalPage;
