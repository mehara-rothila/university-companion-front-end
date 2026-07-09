'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface BackgroundContextType {
  isBackgroundEnabled: boolean;
  toggleBackground: () => void;
}

const BackgroundContext = createContext<BackgroundContextType>({
  isBackgroundEnabled: true,
  toggleBackground: () => {},
});

export const useBackground = () => useContext(BackgroundContext);

interface BackgroundProviderProps {
  children: React.ReactNode;
}

export const BackgroundProvider: React.FC<BackgroundProviderProps> = ({ children }) => {
  const [isBackgroundEnabled, setIsBackgroundEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('backgroundEnabled');
      return stored !== 'false'; // default: enabled
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('backgroundEnabled', String(isBackgroundEnabled));
  }, [isBackgroundEnabled]);

  const toggleBackground = () => {
    setIsBackgroundEnabled((prev) => !prev);
  };

  return (
    <BackgroundContext.Provider value={{ isBackgroundEnabled, toggleBackground }}>
      {children}
    </BackgroundContext.Provider>
  );
};
