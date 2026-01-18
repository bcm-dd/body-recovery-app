'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * AuthGuard Component
 *
 * Protects routes by checking authentication status.
 * Redirects unauthenticated users to the login page.
 *
 * Usage:
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return; // Still checking auth status

    if (!session) {
      // Redirect to login with callback URL
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [session, status, router, pathname]);

  // Loading state
  if (status === 'loading') {
    return (
      fallback || (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 'var(--spacing-md)',
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: '3px solid var(--border-light)',
            borderTopColor: 'var(--brand-primary)',
            animation: 'spin 1s linear infinite',
          }} />
          <style jsx>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <p className="text-secondary">Loading...</p>
        </div>
      )
    );
  }

  // Not authenticated - will redirect in useEffect
  if (!session) {
    return (
      fallback || (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}>
          <p className="text-secondary">Redirecting to login...</p>
        </div>
      )
    );
  }

  // Authenticated - render children
  return <>{children}</>;
}

/**
 * useRequireAuth Hook
 *
 * Alternative hook-based approach for requiring authentication.
 * Returns session data and loading state.
 *
 * Usage:
 * const { session, isLoading } = useRequireAuth();
 * if (isLoading) return <Loading />;
 * // session is guaranteed to exist here
 */
export function useRequireAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      const callbackUrl = encodeURIComponent(pathname);
      router.push(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [session, status, router, pathname]);

  return {
    session,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
  };
}

export default AuthGuard;
