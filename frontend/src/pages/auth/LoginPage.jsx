import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import Button from '../../components/Button';
import Input from '../../components/Input';

export function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState(null);

  // Redirect target: explicitly default to /dashboard
  const from = location.state?.from?.pathname && location.state?.from?.pathname !== '/' ? location.state.from.pathname : '/dashboard';

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login(formData.email, formData.password, formData.rememberMe);
      toast.success(`Welcome back, ${user.name}!`, 'Signed In');
      navigate(from, { replace: true });
    } catch (err) {
      setGeneralError(err.message || 'Invalid credentials. Please verify and try again.');
      toast.error(err.message || 'Failed to sign in', 'Authentication Error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setFormData({
      email: 'alex.morgan@goalforge.io',
      password: 'Password123!',
      rememberMe: true,
    });
    setErrors({});
    setGeneralError(null);
    toast.info('Demo credentials pre-filled!', 'Quick Fill');
  };

  return (
    <div>
      {/* Brand & Heading */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-light)',
            marginBottom: '1rem',
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
          Welcome Back
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Sign in to track your objectives and momentum.
        </p>
      </div>

      {/* General Alert Banner */}
      {generalError && (
        <div
          style={{
            backgroundColor: 'var(--color-danger-light)',
            border: '1px solid var(--color-danger-border)',
            color: 'var(--color-danger-text)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>⚠️</span>
          <span>{generalError}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <Input
          label="Email Address"
          type="email"
          placeholder="you@domain.com"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (errors.email) setErrors({ ...errors, email: null });
          }}
          error={errors.email}
          icon={<span>✉️</span>}
          disabled={loading}
          autoComplete="email"
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              if (errors.password) setErrors({ ...errors, password: null });
            }}
            error={errors.password}
            icon={<span>🔑</span>}
            disabled={loading}
            autoComplete="current-password"
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            }
          />
        </div>

        {/* Remember Me & Forgot Password Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.825rem',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              style={{
                accentColor: 'var(--color-primary)',
                width: '16px',
                height: '16px',
                cursor: 'pointer',
              }}
            />
            <span>Remember me</span>
          </label>

          <Link
            to="/forgot-password"
            style={{
              color: 'var(--color-primary)',
              fontWeight: '600',
              transition: 'color var(--transition-fast)',
            }}
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
          style={{ marginTop: '0.5rem' }}
        >
          {loading ? 'Signing In...' : 'Sign In to GoalForge'}
        </Button>

        {/* Quick Demo Credentials Action */}
        <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleFillDemo}
            style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}
          >
            ⚡ Auto-Fill Demo Credentials
          </Button>
        </div>
      </form>

      {/* Register Footer Link */}
      <div
        style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--color-border-subtle)',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        <span>Don't have an account? </span>
        <Link to="/register" style={{ fontWeight: '700', color: 'var(--color-primary)' }}>
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;
