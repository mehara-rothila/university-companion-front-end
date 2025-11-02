'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

interface LocaleProviderProps {
  messages: Record<string, unknown>;
  locale: string;
  children: ReactNode;
}

export function LocaleProvider({ messages, locale, children }: LocaleProviderProps) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
