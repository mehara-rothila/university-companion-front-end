'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const DarkModeContext = createContext<DarkModeContextType>({
  isDarkMode: false, // Changed to false for light mode default
  toggleDarkMode: () => { console.warn("DarkModeContext: toggleDarkMode called without a Provider"); },
});

export const useDarkMode = () => useContext(DarkModeContext);

interface DarkModeProviderProps {
  children: React.ReactNode;
}

export const DarkModeProvider: React.FC<DarkModeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false); // Changed to false for light mode default

  useEffect(() => {
    let initialDarkMode = false; // Changed to false for light mode default
    try {
      const savedTheme = localStorage.getItem('theme');
      initialDarkMode = savedTheme ? savedTheme === 'dark' : false; // Changed to false for light mode default
    } catch (error) {
      console.error("Could not access localStorage for theme", error);
    }
    setIsDarkMode(initialDarkMode);
    applyTheme(initialDarkMode);
  }, []);

  const applyTheme = (isDark: boolean) => {
    if (typeof window !== 'undefined') {
      try {
        const root = document.documentElement;
        root.setAttribute('data-theme', isDark ? 'dark' : 'light');

        if (isDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      } catch (error) {
        console.error("Could not apply theme to documentElement", error);
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('theme', newMode ? 'dark' : 'light');
        }
      } catch (error) {
        console.error("Could not save theme to localStorage", error);
      }
      applyTheme(newMode);
      return newMode;
    });
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const DarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className="flex items-center justify-center relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      style={{
        backgroundColor: isDarkMode ? '#6366f1' : '#e5e7eb',
      }}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Track */}
      <span className="sr-only">Dark mode toggle</span>
      
      {/* Thumb */}
      <span
        className={`
          absolute left-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center
          ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}
        `}
      >
        {isDarkMode ? (
          // Moon Icon
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          // Sun Icon
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </span>
    </button>
  );
};