import React from 'react';
import { formatDate } from '../utils/formatters';
import './AchievementCard.css';

export function AchievementCard({ achievement, onCelebrate }) {
  const {
    title,
    description,
    icon,
    unlocked,
    unlockedAt,
    currentValue = 0,
    targetValue = 1,
    progressPercentage = 0,
    requirement,
  } = achievement;

  const remaining = Math.max(0, targetValue - currentValue);

  return (
    <div
      className={`achievement-card ${unlocked ? 'achievement-unlocked' : 'achievement-locked'}`}
      data-testid={`achievement-card-${achievement.achievementType}`}
    >
      {/* Glow highlight for unlocked */}
      {unlocked && <div className="achievement-glow" aria-hidden="true" />}

      <div className="achievement-header">
        <div className="achievement-icon-wrapper">
          <span className="achievement-icon" role="img" aria-label={title}>
            {icon || '🏆'}
          </span>
          {!unlocked && (
            <span className="achievement-lock-badge" title="Locked">
              🔒
            </span>
          )}
          {unlocked && (
            <span className="achievement-unlocked-badge" title="Unlocked">
              ✨
            </span>
          )}
        </div>

        <div className="achievement-status-tag">
          {unlocked ? (
            <span className="status-pill status-unlocked">
              <span className="status-dot"></span> Unlocked
            </span>
          ) : (
            <span className="status-pill status-locked">
              <span className="status-dot"></span> Locked
            </span>
          )}
        </div>
      </div>

      <div className="achievement-body">
        <h3 className="achievement-title">{title}</h3>
        <p className="achievement-desc">{description}</p>
      </div>

      <div className="achievement-footer">
        {unlocked ? (
          <div className="achievement-unlocked-info">
            <div className="unlocked-date-row">
              <span className="unlocked-date-icon">🗓️</span>
              <span className="unlocked-date-text">
                Unlocked on {unlockedAt ? formatDate(unlockedAt) : 'Recently'}
              </span>
            </div>
            {onCelebrate && (
              <button
                type="button"
                className="btn-replay-celebration"
                onClick={() => onCelebrate(achievement)}
                title="Celebrate this achievement!"
              >
                🎉 Celebrate
              </button>
            )}
          </div>
        ) : (
          <div className="achievement-progress-info">
            <div className="achievement-progress-labels">
              <span className="requirement-text">{requirement || `Target: ${targetValue}`}</span>
              <span className="progress-fraction">
                <strong>{currentValue}</strong> / {targetValue} ({progressPercentage}%)
              </span>
            </div>
            <div className="achievement-progress-bar-track">
              <div
                className="achievement-progress-bar-fill"
                style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
              />
            </div>
            <p className="achievement-remaining-hint">
              {remaining === 1
                ? 'Only 1 step remaining to unlock!'
                : `${remaining} more to achieve this milestone`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AchievementCard;
