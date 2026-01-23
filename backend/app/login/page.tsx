'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setFormError('Invalid email or password');
        setIsLoading(false);
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setFormError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setFormError('');

    try {
      const result = await signIn('credentials', {
        isGuest: 'true',
        redirect: false,
        callbackUrl,
      });

      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setFormError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="screen-header" style={{ textAlign: 'center', paddingTop: '3rem' }}>
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
          💪
        </div>
        <h1 className="screen-title" style={{ marginBottom: '0.5rem' }}>Welcome Back</h1>
        <p className="text-secondary">Sign in to continue your journey</p>
      </header>

      {/* Form */}
      <div style={{ padding: 'var(--spacing-lg)', flex: 1 }}>
        {(error || formError) && (
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
            {formError || 'Authentication failed. Please try again.'}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={isLoading}
            aria-busy={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: 'var(--spacing-xl) 0',
          gap: 'var(--spacing-md)',
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span className="text-tertiary" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
            or
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Guest Mode */}
        <button
          type="button"
          className="btn btn-secondary btn-full"
          onClick={handleGuestLogin}
          disabled={isLoading}
          style={{ opacity: isLoading ? 0.7 : 1 }}
        >
          Continue as Guest
        </button>

        <p className="text-secondary text-center" style={{ marginTop: 'var(--spacing-md)', fontSize: '0.75rem' }}>
          Demo mode - no account required
        </p>
      </div>

      {/* Sign up link */}
      <div style={{
        padding: 'var(--spacing-lg)',
        paddingBottom: 'calc(var(--spacing-lg) + env(safe-area-inset-bottom, 0px))',
        textAlign: 'center',
        borderTop: '1px solid var(--border-light)',
      }}>
        <p className="text-secondary">
          Don't have an account?{' '}
          <Link
            href="/signup"
            style={{
              color: 'var(--brand-primary)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="animate-fade-in" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: 200, height: 200, borderRadius: 20 }} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
