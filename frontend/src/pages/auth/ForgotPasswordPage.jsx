import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import Button from '../../components/Button';
import Input from '../../components/Input';

export function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email);
      setIsSubmitted(true);
      toast.success('Password reset instructions sent to your email.', 'Email Dispatched');
    } catch (err) {
      setError(err.message || 'Failed to dispatch reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Brand & Logo */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-light)',
            marginBottom: '0.85rem',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <img src="/src/assets/logo.svg" alt="GoalForge" style={{ width: '36px', height: '36px' }} />
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.75rem',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.025em',
            marginBottom: '0.35rem',
          }}
        >
          Reset Password
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Enter the email associated with your GoalForge account.
        </p>
      </div>

      {isSubmitted ? (
        /* Success Confirmation View */
        <div className="animate-slideUp" style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success-light)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 1.25rem',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
            }}
          >
            ✓
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              color: 'var(--color-text-primary)',
            }}
          >
            Check Your Inbox
          </h3>

          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            We have dispatched password recovery instructions to:
            <br />
            <strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/login">
              <Button variant="primary" fullWidth size="lg">
                Return to Sign In
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
            >
              Try another email address
            </Button>
          </div>
        </div>
      ) : (
        /* Request Form View */
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input
            label="Account Email"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            error={error}
            icon={<span>✉️</span>}
            disabled={loading}
            autoComplete="email"
            helperText="We will send a secure password reset link to this address."
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? 'Sending Link...' : 'Send Reset Instructions'}
          </Button>

          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <Link
              to="/login"
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--color-text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              &larr; Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default ForgotPasswordPage;
