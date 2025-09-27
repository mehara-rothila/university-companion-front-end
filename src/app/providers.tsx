'use client';

import { DarkModeProvider } from './context/DarkModeContext';
import { AuthProvider } from './context/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DarkModeProvider>
        {children}
      </DarkModeProvider>
    </AuthProvider>
  );
}