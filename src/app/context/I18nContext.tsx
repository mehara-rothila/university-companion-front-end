'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'si' | 'ta';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (namespace: string, key: string, defaultValue?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<Language, Translations>>({
    en: {},
    si: {},
    ta: {},
  });
  const [loading, setLoading] = useState(true);

  // Load translations on mount and language change
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setLoading(true);
        const namespaces = ['common', 'auth', 'chatbot', 'dashboard', 'uploads', 'navigation', 'errors', 'footer', 'forgotPassword', 'resetPassword', 'career', 'challenges', 'dining', 'financialAid', 'help', 'library', 'lostFound', 'myUploads', 'home', 'onboarding'];
        const newTranslations: Record<Language, Translations> = {
          en: {},
          si: {},
          ta: {},
        };

        for (const lang of ['en', 'si', 'ta'] as Language[]) {
          for (const ns of namespaces) {
            const response = await fetch(`/locales/${lang}/${ns}.json`);
            if (response.ok) {
              const data = await response.json();
              newTranslations[lang][ns] = data;
            }
          }
        }

        setTranslations(newTranslations);
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        setLoading(false);
      }
    };

    // Load saved language preference
    const savedLanguage = localStorage.getItem('i18n-language') as Language | null;
    if (savedLanguage && ['en', 'si', 'ta'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }

    loadTranslations();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('i18n-language', lang);
    // Update HTML lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  const t = (namespace: string, key: string, defaultValue?: string): string => {
    const value = translations[language]?.[namespace]?.[key];
    return value || defaultValue || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
