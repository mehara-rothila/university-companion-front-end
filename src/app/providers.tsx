'use client';

import { DarkModeProvider } from './context/DarkModeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DarkModeProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </DarkModeProvider>
    </AuthProvider>
  );
}