'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Sun, Moon } from 'lucide-react';

interface DarkModeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
  // The button's visual state will still toggle
  const [isDarkMode, setIsDarkMode] = useState(false);

  // This effect is the key change.
  // It now ONLY removes dark mode classes, ensuring light mode is always active.
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Always remove dark mode attributes, regardless of the 'isDarkMode' state.
    root.classList.remove('dark');
    root.removeAttribute('data-theme');
    
    // We keep the dependency array so the button's state change still triggers a re-render,
    // but the effect's logic ensures we stay in light mode.
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    // This will still update the button's state, so it animates,
    // but the useEffect above prevents the theme from changing.
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

export const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="dark-mode-toggle"
      aria-label={isDarkMode ? 'Activate light mode' : 'Activate dark mode'}
    >
      <div className={`dark-mode-toggle-track ${isDarkMode ? 'active' : ''}`}></div>
      <div className={`dark-mode-toggle-thumb ${isDarkMode ? 'active' : ''}`}>
        {isDarkMode ? (
          <Moon className="h-3 w-3 text-purple-600" />
        ) : (
          <Sun className="h-3 w-3 text-yellow-500" />
        )}
      </div>
    </button>
  );
};