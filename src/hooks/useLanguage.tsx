'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

type Locale = 'en' | 'si' | 'ta';

interface LanguageContextType {
  currentLanguage: Locale;
  setLanguage: (lang: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [currentLanguage, setCurrentLanguage] = useState<Locale>(locale);

  useEffect(() => {
    // Load saved language from localStorage on mount
    const saved = localStorage.getItem('preferred-language') as Locale;
    if (saved && ['en', 'si', 'ta'].includes(saved)) {
      setCurrentLanguage(saved);
    }
  }, []);

  const setLanguage = (lang: Locale) => {
    setCurrentLanguage(lang);
    localStorage.setItem('preferred-language', lang);
    // Force a re-render by triggering a router refresh
    router.refresh();
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
