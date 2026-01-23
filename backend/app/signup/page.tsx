'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function SignUpForm() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Register user via API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError('Account created but sign in failed. Please try logging in.');
        setIsLoading(false);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="screen-header" style={{ textAlign: 'center', paddingTop: '2rem' }}>
        <div style={{
          width: 80,
          height: 80,
          margin: '0 auto 1rem',
          borderRadius: 20,
          background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
        }}>
          🚀
        </div>
        <h1 className="screen-title" style={{ marginBottom: '0.5rem' }}>Create Account</h1>
        <p className="text-secondary">Start your recovery journey today</p>
      </header>

      {/* Form */}
      <div style={{ padding: 'var(--spacing-lg)', flex: 1 }}>
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              background: '#FEE2E2',
              color: '#991B1B',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-lg)',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label
              htmlFor="name"
              style={{
                display: 'block',
                marginBottom: 'var(--spacing-xs)',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              className="input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: 'var(--spacing-xs)',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                marginBottom: 'var(--spacing-xs)',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <label
              htmlFor="confirmPassword"
              style={{
                display: 'block',
                marginBottom: 'var(--spacing-xs)',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="input"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={isLoading}
            aria-busy={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-tertiary text-center" style={{ marginTop: 'var(--spacing-lg)', fontSize: '0.75rem' }}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {/* Sign in link */}
      <div style={{
        padding: 'var(--spacing-lg)',
        paddingBottom: 'calc(var(--spacing-lg) + env(safe-area-inset-bottom, 0px))',
        textAlign: 'center',
        borderTop: '1px solid var(--border-light)',
      }}>
        <p className="text-secondary">
          Already have an account?{' '}
          <Link
            href="/login"
            style={{
              color: 'var(--brand-primary)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="animate-fade-in" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: 200, height: 200, borderRadius: 20 }} />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
