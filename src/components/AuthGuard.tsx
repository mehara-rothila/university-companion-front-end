'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: string[];
}

export default function AuthGuard({ 
  children, 
  requireAuth = true,
  redirectTo = '/login',
  allowedRoles 
}: AuthGuardProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Check authentication
    if (requireAuth && !isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`${redirectTo}?from=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Check role authorization
    if (allowedRoles && user && !allowedRoles.includes(user.role.toLowerCase())) {
      router.push('/dashboard'); // Redirect to dashboard if role not allowed
      return;
    }

    setIsAuthorized(true);
  }, [user, isAuthenticated, loading, requireAuth, allowedRoles, router, redirectTo]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children until authorized
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
