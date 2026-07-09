'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import enMessages from '../../messages/en.json';
import siMessages from '../../messages/si.json';
import taMessages from '../../messages/ta.json';

type Locale = 'en' | 'si' | 'ta';
type Messages = typeof enMessages;

const messages: Record<Locale, Messages> = {
  en: enMessages,
  // @ts-ignore - message type mismatch across locale files
  si: siMessages,
  // @ts-ignore - message type mismatch across locale files
  ta: taMessages,
};

interface TranslationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
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

  const t = (key: string, variables?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: unknown = messages[locale];
    let found = true;

    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        found = false;
        break;
      }
    }

    // Fallback to English if translation is missing in the current locale
    if (!found || typeof value !== 'string') {
      value = enMessages;
      found = true;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          found = false;
          break;
        }
      }
    }

    let result = found && typeof value === 'string' ? value : key;

    // Replace variables like {{name}} with actual values
    if (variables) {
      Object.entries(variables).forEach(([varKey, varValue]) => {
        result = result.replace(new RegExp(`{{${varKey}}}`, 'g'), String(varValue));
      });
    }

    return result;
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
