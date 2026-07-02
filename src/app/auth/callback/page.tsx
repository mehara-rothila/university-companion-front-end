'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useDarkMode } from '../../context/DarkModeContext';
import { useTranslation } from '@/contexts/TranslationContext';
import AnimatedBackground from '../../../components/AnimatedBackground';

export default function AuthCallbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const { t } = useTranslation();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (status === 'authenticated') {
      // Successful authentication, redirect to dashboard
      router.push('/dashboard');
    } else if (status === 'unauthenticated') {
      // Authentication failed, redirect to login with error
      router.push('/login?error=Authentication failed');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div
        className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}
      >
        <AnimatedBackground />

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="glass-premium-card rounded-3xl p-6 sm:p-8 w-full max-w-md animate-glass-fade-in text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 mb-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
                Authenticating...
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Please wait while we complete your sign-in process.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
