import React, { useMemo } from 'react';
import './PhaseTimeline.css';

export function PhaseTimeline({ phases = [], activePhaseId, onSelectPhase }) {
  // Sort phases by phaseOrder
  const sortedPhases = useMemo(() => {
    return [...phases].sort((a, b) => (a.phaseOrder || 0) - (b.phaseOrder || 0));
  }, [phases]);

  // Determine current active phase index: the first phase that is not completed
  const currentActiveIndex = useMemo(() => {
    const idx = sortedPhases.findIndex(
      (p) => (p.status || '').toUpperCase() !== 'COMPLETED' && (Number(p.progressPercentage) || 0) < 100
    );
    return idx; // -1 if all are completed
  }, [sortedPhases]);

  if (sortedPhases.length === 0) {
    return null;
  }

  return (
    <div className="phase-timeline-container">
      <div className="phase-timeline-track">
        {sortedPhases.map((phase, index) => {
          const isExplicitlyCompleted =
            (phase.status || '').toUpperCase() === 'COMPLETED' ||
            (Number(phase.progressPercentage) || 0) === 100;

          let stepState = 'upcoming';
          if (isExplicitlyCompleted) {
            stepState = 'completed';
          } else if (index === currentActiveIndex) {
            stepState = 'current';
          } else if (currentActiveIndex === -1) {
            stepState = 'completed';
          } else if (index < currentActiveIndex) {
            stepState = 'completed';
          } else {
            stepState = 'upcoming';
          }

          // Connector line state
          const connectorState =
            index === 0
              ? 'none'
              : stepState === 'completed'
              ? 'completed'
              : stepState === 'current'
              ? 'current'
              : 'upcoming';

          const isSelected = activePhaseId === phase.id;

          return (
            <div
              key={phase.id}
              className={`phase-timeline-step ${stepState} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectPhase && onSelectPhase(phase.id)}
              title={`${phase.phaseName}: ${stepState.toUpperCase()} (${phase.progressPercentage || 0}%)`}
            >
              {/* Connector line leading to this step */}
              {index > 0 && <div className={`phase-step-connector ${connectorState}`} />}

              {/* Step Node Circle */}
              <div className="phase-node-circle">
                {stepState === 'completed' ? (
                  <span>✓</span>
                ) : stepState === 'current' ? (
                  <span>⚡</span>
                ) : (
                  <span>{phase.phaseOrder || index + 1}</span>
                )}
              </div>

              {/* Step Content */}
              <div className="phase-step-content">
                <span className="phase-step-order">Phase {phase.phaseOrder || index + 1}</span>
                <span className="phase-step-title">{phase.phaseName}</span>

                <span className={`phase-step-badge ${stepState}`}>
                  {stepState === 'completed' && '✓ Completed'}
                  {stepState === 'current' && '⚡ Current'}
                  {stepState === 'upcoming' && '⚪ Upcoming'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PhaseTimeline;
