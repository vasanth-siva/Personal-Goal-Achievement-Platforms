import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ProgressBar from '../../components/ProgressBar';

export function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Dynamic Password Strength Evaluation
  const evaluatePassword = (pass) => {
    const checks = {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass) && /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      symbol: /[^A-Za-z0-9]/.test(pass),
    };

    let score = 0;
    if (checks.length) score += 1;
    if (checks.uppercase) score += 1;
    if (checks.number) score += 1;
    if (checks.symbol) score += 1;

    let strength = 'Weak';
    let variant = 'danger';
    let percent = 25;

    if (pass.length === 0) {
      strength = '';
      percent = 0;
    } else if (score === 1) {
      strength = 'Weak';
      variant = 'danger';
      percent = 25;
    } else if (score === 2) {
      strength = 'Fair';
      variant = 'warning';
      percent = 50;
    } else if (score === 3) {
      strength = 'Good';
      variant = 'cyan';
      percent = 75;
    } else if (score >= 4) {
      strength = 'Strong';
      variant = 'success';
      percent = 100;
    }

    return { checks, score, strength, variant, percent };
  };

  const passwordAnalysis = evaluatePassword(formData.password);

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      toast.success(`Account created! Welcome to GoalForge, ${user.name}.`, 'Registration Complete');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Registration failed', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Brand & Heading */}
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
          Create Your Account
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
          Start forging your personal and career milestones.
        </p>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <Input
          label="Full Name"
          type="text"
          placeholder="Alex Morgan"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: null });
          }}
          error={errors.name}
          icon={<span>👤</span>}
          disabled={loading}
          autoComplete="name"
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="alex@domain.com"
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
            label="Create Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              if (errors.password) setErrors({ ...errors, password: null });
            }}
            error={errors.password}
            icon={<span>🔑</span>}
            disabled={loading}
            autoComplete="new-password"
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

          {/* Real-time Password Strength Indicator */}
          {formData.password.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Password Strength</span>
                <span
                  style={{
                    fontWeight: '700',
                    color:
                      passwordAnalysis.strength === 'Strong'
                        ? 'var(--color-success)'
                        : passwordAnalysis.strength === 'Good'
                        ? 'var(--color-secondary)'
                        : passwordAnalysis.strength === 'Fair'
                        ? 'var(--color-warning)'
                        : 'var(--color-danger)',
                  }}
                >
                  {passwordAnalysis.strength}
                </span>
              </div>

              <ProgressBar
                value={passwordAnalysis.percent}
                variant={passwordAnalysis.variant}
                size="sm"
                showValue={false}
              />

              {/* Requirement Pills */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.4rem',
                  marginTop: '0.65rem',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ color: passwordAnalysis.checks.length ? 'var(--color-success)' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>{passwordAnalysis.checks.length ? '✓' : '○'}</span>
                  <span>8+ characters</span>
                </div>
                <div style={{ color: passwordAnalysis.checks.uppercase ? 'var(--color-success)' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>{passwordAnalysis.checks.uppercase ? '✓' : '○'}</span>
                  <span>Upper &amp; lowercase</span>
                </div>
                <div style={{ color: passwordAnalysis.checks.number ? 'var(--color-success)' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>{passwordAnalysis.checks.number ? '✓' : '○'}</span>
                  <span>At least 1 number</span>
                </div>
                <div style={{ color: passwordAnalysis.checks.symbol ? 'var(--color-success)' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>{passwordAnalysis.checks.symbol ? '✓' : '○'}</span>
                  <span>Special character</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Repeat password"
            value={formData.confirmPassword}
            onChange={(e) => {
              setFormData({ ...formData, confirmPassword: e.target.value });
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
            }}
            error={errors.confirmPassword}
            icon={<span>🔒</span>}
            disabled={loading}
            autoComplete="new-password"
            suffix={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            }
          />
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
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      {/* Login Footer Link */}
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
        <span>Already have an account? </span>
        <Link to="/login" style={{ fontWeight: '700', color: 'var(--color-primary)' }}>
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default RegisterPage;
