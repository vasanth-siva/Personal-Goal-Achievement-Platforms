import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import calendarService from '../services/calendarService';
import { CalendarSkeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import './CalendarPage.css';

const EVENT_TYPES = {
  GOAL_DEADLINE: { key: 'GOAL_DEADLINE', label: 'Goal Deadlines', icon: '🎯', color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe' },
  TASK_DEADLINE: { key: 'TASK_DEADLINE', label: 'Task Deadlines', icon: '⏰', color: '#ea580c', bg: '#ffedd5', border: '#fed7aa' },
  MILESTONE: { key: 'MILESTONE', label: 'Milestones', icon: '🏆', color: '#ca8a04', bg: '#fef9c3', border: '#fef08a' },
  COMPLETED_TASK: { key: 'COMPLETED_TASK', label: 'Completed Tasks', icon: '✅', color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0' },
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarPage() {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active month cursor
  const [currentDate, setCurrentDate] = useState(new Date());

  // Selected date string "YYYY-MM-DD" for Day Inspector
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Active filter types
  const [activeFilters, setActiveFilters] = useState({
    GOAL_DEADLINE: true,
    TASK_DEADLINE: true,
    MILESTONE: true,
    COMPLETED_TASK: true,
  });

  // Detailed event inspection modal
  const [inspectedEvent, setInspectedEvent] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await calendarService.getEvents();
      if (res && res.data) {
        setEvents(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load calendar events', 'Error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const toggleFilter = (typeKey) => {
    setActiveFilters((prev) => ({
      ...prev,
      [typeKey]: !prev[typeKey],
    }));
  };

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Calendar Grid Calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Map events by date "YYYY-MM-DD"
  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      if (!ev.date) return;
      if (!activeFilters[ev.type]) return;

      const dStr = ev.date;
      if (!map[dStr]) map[dStr] = [];
      map[dStr].push(ev);
    });
    return map;
  }, [events, activeFilters]);

  // Generate calendar grid cells (42 cells: 6 weeks x 7 days)
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = prevDate.toISOString().split('T')[0];
      cells.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const curDate = new Date(year, month, dayNum);
      // Format YYYY-MM-DD carefully with local numbers
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(dayNum).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;

      cells.push({
        dateStr,
        dayNum,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Next month filler days to complete 35 or 42 cells
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextDate = new Date(year, month + 1, dayNum);
      const mStr = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dStr = String(dayNum).padStart(2, '0');
      const dateStr = `${nextDate.getFullYear()}-${mStr}-${dStr}`;

      cells.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    return cells;
  }, [year, month]);

  // Selected date events list
  const selectedDayEvents = eventsByDate[selectedDateStr] || [];

  // Summary counts for current active month
  const monthCounts = useMemo(() => {
    let goals = 0;
    let tasks = 0;
    let milestones = 0;
    let completed = 0;

    events.forEach((ev) => {
      if (!ev.date) return;
      const [evYear, evMonth] = ev.date.split('-').map(Number);
      if (evYear === year && evMonth === month + 1) {
        if (ev.type === 'GOAL_DEADLINE') goals++;
        if (ev.type === 'TASK_DEADLINE') tasks++;
        if (ev.type === 'MILESTONE') milestones++;
        if (ev.type === 'COMPLETED_TASK') completed++;
      }
    });

    return { goals, tasks, milestones, completed, total: goals + tasks + milestones + completed };
  }, [events, year, month]);

  if (loading && events.length === 0) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="calendar-page container-saas">
      {/* Event Details Inspection Modal */}
      {inspectedEvent && (
        <div className="event-modal-overlay" onClick={() => setInspectedEvent(null)}>
          <div className="event-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="event-modal-close"
              onClick={() => setInspectedEvent(null)}
            >
              ✕
            </button>

            <div className="event-modal-header">
              <span
                className="event-modal-type-badge"
                style={{
                  background: EVENT_TYPES[inspectedEvent.type]?.bg,
                  color: EVENT_TYPES[inspectedEvent.type]?.color,
                  border: `1px solid ${EVENT_TYPES[inspectedEvent.type]?.border}`,
                }}
              >
                {EVENT_TYPES[inspectedEvent.type]?.icon} {EVENT_TYPES[inspectedEvent.type]?.label}
              </span>
              <span className="event-modal-date">📅 {inspectedEvent.date}</span>
            </div>

            <h2 className="event-modal-title">{inspectedEvent.title}</h2>

            {inspectedEvent.details && (
              <p className="event-modal-details">{inspectedEvent.details}</p>
            )}

            <div className="event-modal-meta-grid">
              {inspectedEvent.goalTitle && (
                <div className="meta-item">
                  <span className="meta-label">Associated Goal</span>
                  <Link
                    to={`/goals/${inspectedEvent.goalId}`}
                    className="meta-value-link"
                    onClick={() => setInspectedEvent(null)}
                  >
                    🎯 {inspectedEvent.goalTitle} →
                  </Link>
                </div>
              )}

              <div className="meta-item">
                <span className="meta-label">Status</span>
                <span className={`meta-status-tag status-${(inspectedEvent.status || 'pending').toLowerCase().replace(' ', '-')}`}>
                  {inspectedEvent.status || 'Pending'}
                </span>
              </div>

              {inspectedEvent.priority && (
                <div className="meta-item">
                  <span className="meta-label">Priority</span>
                  <span className="meta-priority-text">{inspectedEvent.priority}</span>
                </div>
              )}

              {inspectedEvent.category && (
                <div className="meta-item">
                  <span className="meta-label">Category</span>
                  <span className="meta-category-text">{inspectedEvent.category}</span>
                </div>
              )}
            </div>

            <div className="event-modal-footer">
              {inspectedEvent.goalId && (
                <Link
                  to={`/goals/${inspectedEvent.goalId}`}
                  className="btn-event-view-goal"
                  onClick={() => setInspectedEvent(null)}
                >
                  View Full Goal Details
                </Link>
              )}
              <button
                type="button"
                className="btn-event-close"
                onClick={() => setInspectedEvent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="calendar-hero">
        <div className="calendar-hero-content">
          <div className="calendar-hero-tag">
            <span className="cal-icon">📅</span> Execution Schedule
          </div>
          <h1 className="calendar-hero-title">Milestone & Deadline Calendar</h1>
          <p className="calendar-hero-subtitle">
            Synchronized master timeline showing goal target dates, upcoming task deadlines, milestone badges, and completed accomplishments.
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div className="calendar-nav-card">
          <div className="calendar-nav-buttons">
            <button
              type="button"
              className="btn-nav-arrow"
              onClick={handlePrevMonth}
              title="Previous Month"
            >
              ←
            </button>
            <span className="current-month-display">{monthName}</span>
            <button
              type="button"
              className="btn-nav-arrow"
              onClick={handleNextMonth}
              title="Next Month"
            >
              →
            </button>
          </div>
          <button type="button" className="btn-nav-today" onClick={handleToday}>
            Today
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="calendar-kpi-strip">
        <div className="cal-kpi-item">
          <span className="cal-kpi-dot dot-goal" />
          <span className="cal-kpi-label">Goal Targets</span>
          <strong className="cal-kpi-val">{monthCounts.goals}</strong>
        </div>
        <div className="cal-kpi-item">
          <span className="cal-kpi-dot dot-task" />
          <span className="cal-kpi-label">Pending Tasks</span>
          <strong className="cal-kpi-val">{monthCounts.tasks}</strong>
        </div>
        <div className="cal-kpi-item">
          <span className="cal-kpi-dot dot-milestone" />
          <span className="cal-kpi-label">Milestones</span>
          <strong className="cal-kpi-val">{monthCounts.milestones}</strong>
        </div>
        <div className="cal-kpi-item">
          <span className="cal-kpi-dot dot-completed" />
          <span className="cal-kpi-label">Completed</span>
          <strong className="cal-kpi-val">{monthCounts.completed}</strong>
        </div>
      </div>

      {/* Filter Toggle Pills */}
      <div className="calendar-filters-row">
        <span className="filter-row-title">Display:</span>
        {Object.values(EVENT_TYPES).map((type) => (
          <button
            key={type.key}
            type="button"
            className={`filter-chip ${activeFilters[type.key] ? 'chip-active' : 'chip-inactive'}`}
            onClick={() => toggleFilter(type.key)}
            style={{
              borderColor: activeFilters[type.key] ? type.color : '#cbd5e1',
              backgroundColor: activeFilters[type.key] ? type.bg : '#ffffff',
              color: activeFilters[type.key] ? type.color : '#94a3b8',
            }}
          >
            <span>{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Calendar Grid & Day Inspector Layout */}
      <div className="calendar-layout-grid">
        {/* Main 7-Day Month Grid */}
        <div className="calendar-grid-card">
          <div className="calendar-weekdays-header">
            {WEEKDAYS.map((day) => (
              <div key={day} className="weekday-header-cell">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-month-cells">
            {calendarCells.map((cell) => {
              const cellEvents = eventsByDate[cell.dateStr] || [];
              const isSelected = cell.dateStr === selectedDateStr;

              return (
                <div
                  key={cell.dateStr}
                  className={`calendar-day-cell ${cell.isCurrentMonth ? 'in-month' : 'out-month'} ${cell.isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  data-testid={`cal-cell-${cell.dateStr}`}
                >
                  <div className="day-cell-header">
                    <span className={`day-number ${cell.isToday ? 'today-badge' : ''}`}>
                      {cell.dayNum}
                    </span>
                    {cellEvents.length > 0 && (
                      <span className="day-event-count" title={`${cellEvents.length} events`}>
                        {cellEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="day-cell-events">
                    {cellEvents.slice(0, 3).map((ev) => {
                      const typeConfig = EVENT_TYPES[ev.type] || EVENT_TYPES.TASK_DEADLINE;
                      return (
                        <div
                          key={ev.id}
                          className="event-pill"
                          style={{
                            backgroundColor: typeConfig.bg,
                            color: typeConfig.color,
                            borderLeftColor: typeConfig.color,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDateStr(cell.dateStr);
                            setInspectedEvent(ev);
                          }}
                          title={`${ev.title} (${typeConfig.label})`}
                        >
                          <span className="pill-icon">{typeConfig.icon}</span>
                          <span className="pill-title">{ev.title}</span>
                        </div>
                      );
                    })}

                    {cellEvents.length > 3 && (
                      <div className="event-pill-overflow">
                        +{cellEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Inspector Side Panel */}
        <div className="calendar-inspector-panel">
          <div className="inspector-header">
            <h3 className="inspector-title">
              📅 {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </h3>
            <span className="inspector-badge">{selectedDayEvents.length} Events</span>
          </div>

          <div className="inspector-events-list">
            {selectedDayEvents.length > 0 ? (
              selectedDayEvents.map((ev) => {
                const typeConfig = EVENT_TYPES[ev.type] || EVENT_TYPES.TASK_DEADLINE;
                return (
                  <div
                    key={ev.id}
                    className="inspector-event-card"
                    onClick={() => setInspectedEvent(ev)}
                  >
                    <div className="inspector-event-top">
                      <span
                        className="inspector-type-tag"
                        style={{
                          background: typeConfig.bg,
                          color: typeConfig.color,
                        }}
                      >
                        {typeConfig.icon} {typeConfig.label}
                      </span>
                      {ev.priority && (
                        <span className="inspector-priority-tag">{ev.priority}</span>
                      )}
                    </div>

                    <h4 className="inspector-event-name">{ev.title}</h4>

                    {ev.goalTitle && (
                      <p className="inspector-goal-subtext">
                        🎯 {ev.goalTitle}
                      </p>
                    )}

                    <div className="inspector-card-footer">
                      <span className={`inspector-status-dot status-${(ev.status || 'pending').toLowerCase()}`}>
                        {ev.status || 'Pending'}
                      </span>
                      <span className="inspector-view-hint">Inspect →</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="inspector-empty">
                <div className="inspector-empty-icon">🏖️</div>
                <p className="inspector-empty-title">No events scheduled</p>
                <p className="inspector-empty-sub">
                  Select another day on the calendar to view its targets and milestones.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;
