import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import goalService from '../services/goalService';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
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

export function CreateGoalPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Career',
    priority: 'Medium',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
        status: 'Not Started',
        progress: 0,
        startDate: formData.startDate || null,
        targetDate: formData.targetDate || null,
      };

      const res = await goalService.create(payload);
      toast.success('Goal created successfully!', 'Success');

      // Notify other components if needed
      window.dispatchEvent(new CustomEvent('goalCreated'));

      const createdId = res?.data?.id;
      if (createdId) {
        navigate(`/goals/${createdId}`);
      } else {
        navigate('/goals');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create goal', 'Creation Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-saas" style={{ maxWidth: '780px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Breadcrumb / Back Link */}
      <div style={{ marginBottom: '1.25rem', paddingTop: '0.5rem' }}>
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
          <span>🎯</span>
          <span>New Objective</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.35rem', color: 'var(--color-text-primary)' }}>
          Create New <span style={{ color: 'var(--color-primary)' }}>Goal</span>
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Define your target with clarity, schedule milestones, and set your execution priority.
        </p>
      </div>

      {/* Form Card */}
      <Card variant="default" padding="lg">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Title */}
          <div>
            <Input
              label="Goal Title"
              placeholder="e.g. Master Full-Stack Architecture, Run a Half Marathon..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={errors.title}
              required
              id="input-create-title"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="input-create-desc"
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
              id="input-create-desc"
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
                const isSelected = formData.category === cat;
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
            {errors.category && (
              <span style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>
                {errors.category}
              </span>
            )}
          </div>

          {/* Priority Selection */}
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
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {PRIORITIES.map((p) => {
                const info = getPriorityInfo(p.value);
                const isSelected = formData.priority === p.value;
                return (
                  <label
                    key={p.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? `2px solid ${info.dotColor}` : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? info.bg : 'var(--color-surface)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
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
                    <span style={{ fontSize: '0.875rem', fontWeight: '700', color: info.color }}>
                      {info.icon} {info.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Dates: Start Date & Target Date */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <Input
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                id="input-create-start-date"
              />
            </div>
            <div>
              <Input
                label="Target Date (Deadline)"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                error={errors.targetDate}
                id="input-create-target-date"
              />
            </div>
          </div>

          {/* Form Actions */}
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
            <Link to="/goals">
              <Button variant="ghost" type="button" disabled={submitting}>
                Cancel
              </Button>
            </Link>
            <Button variant="primary" type="submit" loading={submitting} icon={<span>+</span>} id="btn-submit-create-goal">
              Create Goal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default CreateGoalPage;
