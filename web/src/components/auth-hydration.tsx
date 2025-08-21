'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useRouter, usePathname } from 'next/navigation';

export function AuthHydration({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const { isAuthenticated, token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || hasCheckedAuth) return;

    // Check if we have a token in localStorage but no cookie
    if (token && isAuthenticated) {
      // Ensure cookie is set for middleware
      const cookieExists = document.cookie
        .split(';')
        .some(cookie => cookie.trim().startsWith('auth-token='));
      
      if (!cookieExists) {
        // Set the cookie if it doesn't exist
        document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
      }
    }

    // Handle routing based on authentication state
    const isProtectedRoute = pathname.startsWith('/dashboard');
    const isAuthRoute = pathname.startsWith('/auth');

    if (isProtectedRoute && !isAuthenticated) {
      router.push('/auth/sign-in');
    } else if (isAuthRoute && isAuthenticated) {
      router.push('/dashboard');
    } else if (pathname === '/' && isAuthenticated) {
      router.push('/dashboard');
    }

    setHasCheckedAuth(true);
  }, [isHydrated, token, isAuthenticated, pathname, router, hasCheckedAuth]);

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}