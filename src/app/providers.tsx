'use client';

import { SessionProvider } from 'next-auth/react';
import { DarkModeProvider } from './context/DarkModeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';

function NotificationProviderWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  return (
    <NotificationProvider userId={user?.id?.toString()}>
      {children}
    </NotificationProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <DarkModeProvider>
          <NotificationProviderWrapper>
            {children}
          </NotificationProviderWrapper>
        </DarkModeProvider>
      </AuthProvider>
    </SessionProvider>
  );
}