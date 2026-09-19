/**
 * Format ISO date string into a user-friendly format (e.g. "Oct 15, 2026")
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'No target date';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Format category tag with readable labels and styling cues
 * Requested categories: Education, Career, Fitness, Finance, Personal, Skills, Other
 */
export function getCategoryInfo(category) {
  const map = {
    EDUCATION: { label: 'Education', color: '#3b82f6', icon: '🎓', bg: '#eff6ff', border: '#bfdbfe' },
    CAREER: { label: 'Career', color: '#6366f1', icon: '💼', bg: '#eef2ff', border: '#c7d2fe' },
    FITNESS: { label: 'Fitness', color: '#10b981', icon: '⚡', bg: '#ecfdf5', border: '#a7f3d0' },
    FINANCE: { label: 'Finance', color: '#f59e0b', icon: '💰', bg: '#fffbeb', border: '#fde68a' },
    PERSONAL: { label: 'Personal', color: '#ec4899', icon: '🎯', bg: '#fdf2f8', border: '#fbcfe8' },
    SKILLS: { label: 'Skills', color: '#06b6d4', icon: '🛠️', bg: '#ecfeff', border: '#a5f3fc' },
    OTHER: { label: 'Other', color: '#64748b', icon: '📌', bg: '#f8fafc', border: '#e2e8f0' },
    LEARNING: { label: 'Education', color: '#3b82f6', icon: '🎓', bg: '#eff6ff', border: '#bfdbfe' }, // backward compat
  };

  const key = (category || 'OTHER').toUpperCase().trim();
  return map[key] || { label: category || 'Other', color: '#64748b', icon: '📌', bg: '#f8fafc', border: '#e2e8f0' };
}

/**
 * Format priority badge info
 * Requested priorities: Low, Medium, High
 */
export function getPriorityInfo(priority) {
  const map = {
    HIGH: {
      label: 'High',
      color: 'var(--color-danger-text)',
      bg: 'var(--color-danger-light)',
      border: 'var(--color-danger-border)',
      dotColor: 'var(--color-danger)',
      icon: '🔴',
    },
    MEDIUM: {
      label: 'Medium',
      color: 'var(--color-warning-text)',
      bg: 'var(--color-warning-light)',
      border: 'var(--color-warning-border)',
      dotColor: 'var(--color-warning)',
      icon: '🟡',
    },
    LOW: {
      label: 'Low',
      color: 'var(--color-success-text)',
      bg: 'var(--color-success-light)',
      border: 'var(--color-success-border)',
      dotColor: 'var(--color-success)',
      icon: '🟢',
    },
  };

  const key = (priority || 'MEDIUM').toUpperCase().trim();
  return map[key] || map.MEDIUM;
}

/**
 * Calculate remaining days and deadline urgency status
 */
export function getDeadlineStatus(targetDateStr) {
  if (!targetDateStr) {
    return { daysRemaining: null, label: 'No deadline', isUrgent: false, isOverdue: false, isDueToday: false };
  }

  try {
    const target = new Date(targetDateStr);
    const now = new Date();
    // Normalize both to midnight for day comparison
    target.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - now.getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (days < 0) {
      const pastDays = Math.abs(days);
      return {
        daysRemaining: days,
        label: pastDays === 1 ? '1 day overdue' : `${pastDays} days overdue`,
        isUrgent: true,
        isOverdue: true,
        isDueToday: false,
      };
    }

    if (days === 0) {
      return {
        daysRemaining: 0,
        label: 'Due today',
        isUrgent: true,
        isOverdue: false,
        isDueToday: true,
      };
    }

    if (days === 1) {
      return {
        daysRemaining: 1,
        label: 'Due tomorrow',
        isUrgent: true,
        isOverdue: false,
        isDueToday: false,
      };
    }

    return {
      daysRemaining: days,
      label: `${days} days left`,
      isUrgent: days <= 7,
      isOverdue: false,
      isDueToday: false,
    };
  } catch {
    return { daysRemaining: null, label: 'Invalid date', isUrgent: false, isOverdue: false, isDueToday: false };
  }
}
