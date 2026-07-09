'use client';

import { SessionProvider } from 'next-auth/react';
import { DarkModeProvider } from './context/DarkModeContext';
import { BackgroundProvider } from './context/BackgroundContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import { TranslationProvider } from '../contexts/TranslationContext';

function NotificationProviderWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return <NotificationProvider userId={user?.id?.toString()}>{children}</NotificationProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <TranslationProvider>
          <DarkModeProvider>
            <BackgroundProvider>
              <NotificationProviderWrapper>{children}</NotificationProviderWrapper>
            </BackgroundProvider>
          </DarkModeProvider>
        </TranslationProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
