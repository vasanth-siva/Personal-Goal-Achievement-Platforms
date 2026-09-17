import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-bg)',
        backgroundImage: `
          radial-gradient(ellipse 60% 50% at 50% -10%, rgba(79, 70, 229, 0.09) 0%, transparent 70%),
          radial-gradient(ellipse 40% 40% at 90% 100%, rgba(6, 182, 212, 0.06) 0%, transparent 70%)
        `,
        backgroundAttachment: 'fixed',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="/src/assets/logo.svg"
            alt="GoalForge Logo"
            style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)' }}
          />
          <div>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.4rem',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              Goal<span style={{ color: 'var(--color-primary)' }}>Forge</span>
            </span>
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'var(--color-secondary)',
                letterSpacing: '0.02em',
                lineHeight: 1,
              }}
            >
              Plan. Progress. Achieve.
            </p>
          </div>
        </Link>

        <div
          style={{
            fontSize: '0.8125rem',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <span>🔒</span>
          <span>Encrypted Client Session</span>
        </div>
      </header>

      {/* Centered Auth Card Container */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}
      >
        <div
          className="animate-slideUp"
          style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xl)',
            padding: '2.5rem 2.25rem',
            position: 'relative',
          }}
        >
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '1.5rem',
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <p>© 2026 GoalForge Inc. All rights reserved. Plan. Progress. Achieve.</p>
      </footer>
    </div>
  );
}

export default AuthLayout;
