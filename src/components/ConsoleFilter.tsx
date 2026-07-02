'use client';

import { useEffect } from 'react';

export default function ConsoleFilter() {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    // Store original console methods
    const originalWarn = console.warn;
    const originalLog = console.log;

    // Filter out annoying Next.js warnings
    console.warn = (...args: any[]) => {
      const message = args.join(' ');

      // Filter out "Skipping auto-scroll" warnings
      if (message.includes('Skipping auto-scroll behavior')) {
        return;
      }

      // Call original warn for other messages
      originalWarn.apply(console, args);
    };

    console.log = (...args: any[]) => {
      const message = args.join(' ');

      // Filter out "Skipping auto-scroll" logs
      if (message.includes('Skipping auto-scroll behavior')) {
        return;
      }

      // Call original log for other messages
      originalLog.apply(console, args);
    };

    // Cleanup on unmount
    return () => {
      console.warn = originalWarn;
      console.log = originalLog;
    };
  }, []);

  return null;
}
