import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';

export function NotFoundPage() {
  return (
    <div className="container-saas" style={{ padding: '6rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <Card
        variant="default"
        padding="lg"
        style={{
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          padding: '3.5rem 2rem',
        }}
      >
        <div
          style={{
            fontSize: '5.5rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
            marginBottom: '1rem',
          }}
        >
          404
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
          Objective Not Located
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto 2rem', lineHeight: 1.5 }}>
          The coordinate you are navigating to does not exist in your GoalForge workspace or has been relocated.
        </p>
        <Link to="/dashboard">
          <Button variant="primary" size="md">
            Return to Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  );
}

export default NotFoundPage;

