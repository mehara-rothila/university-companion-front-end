'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import enMessages from '../../messages/en.json';
import siMessages from '../../messages/si.json';
import taMessages from '../../messages/ta.json';

type Locale = 'en' | 'si' | 'ta';
type Messages = typeof enMessages;

const messages: Record<Locale, Messages> = {
  en: enMessages,
  si: siMessages,
  ta: taMessages,
};

interface TranslationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  messages: Messages;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    // Load saved language from localStorage
    const saved = localStorage.getItem('app-locale');
    if (saved && (saved === 'en' || saved === 'si' || saved === 'ta')) {
      setLocaleState(saved as Locale);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('app-locale', newLocale);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = messages[locale];

    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t, messages: messages[locale] }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}
