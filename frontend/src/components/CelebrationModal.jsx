import React, { useEffect, useRef, useState } from 'react';
import './CelebrationModal.css';

export function CelebrationModal({ isOpen, achievements = [], onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  const currentAchievement = achievements[currentIndex] || achievements[0];
  const totalCount = achievements.length;

  // Synthesize pleasant victory fanfare using Web Audio API (zero external files required)
  const playVictoryChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + idx * 0.1 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.1 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.7);
      });
    } catch {
      // Graceful fallback if audio is blocked
    }
  };

  // Confetti canvas animation
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    playVictoryChime();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#eab308'];
    const particleCount = 120;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 80,
        y: height / 2 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 18 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
        opacity: 1,
        decay: Math.random() * 0.008 + 0.005,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.98; // air drag
        p.rotation += p.rotSpeed;
        p.opacity = Math.max(0, p.opacity - p.decay);

        if (p.opacity > 0) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });

      const stillActive = particles.some((p) => p.opacity > 0 && p.y < height + 50);
      if (stillActive) {
        animationFrameId.current = requestAnimationFrame(render);
      }
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isOpen, currentIndex]);

  if (!isOpen || !currentAchievement) return null;

  const handleNext = () => {
    if (currentIndex < totalCount - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setCurrentIndex(0);
    onClose();
  };

  return (
    <div className="celebration-overlay" role="dialog" aria-modal="true">
      <canvas ref={canvasRef} className="celebration-canvas" />

      <div className="celebration-dialog">
        <button
          type="button"
          className="celebration-close-btn"
          onClick={handleClose}
          aria-label="Close celebration"
        >
          ✕
        </button>

        <div className="celebration-badge-hero">
          <div className="celebration-sunburst" />
          <div className="celebration-icon-bubble">
            <span className="celebration-icon" role="img" aria-label={currentAchievement.title}>
              {currentAchievement.icon || '🏆'}
            </span>
          </div>
        </div>

        <div className="celebration-content">
          <div className="celebration-kicker">
            <span className="kicker-sparkle">✨</span>
            ACHIEVEMENT UNLOCKED
            <span className="kicker-sparkle">✨</span>
          </div>

          <h2 className="celebration-title">{currentAchievement.title}</h2>
          <p className="celebration-desc">{currentAchievement.description}</p>

          <div className="celebration-pill-row">
            <span className="celebration-pill">
              🎯 Requirement: {currentAchievement.requirement || 'Milestone achieved'}
            </span>
            <span className="celebration-pill unlocked-now-pill">
              🔥 Mastered!
            </span>
          </div>

          {totalCount > 1 && (
            <div className="celebration-stepper">
              Unlock {currentIndex + 1} of {totalCount}
            </div>
          )}

          <div className="celebration-actions">
            {currentIndex < totalCount - 1 ? (
              <button
                type="button"
                className="btn-celebrate-primary"
                onClick={handleNext}
              >
                Next Unlock ({currentIndex + 2}/{totalCount}) →
              </button>
            ) : (
              <button
                type="button"
                className="btn-celebrate-primary"
                onClick={handleClose}
              >
                Claim Badge & Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CelebrationModal;
