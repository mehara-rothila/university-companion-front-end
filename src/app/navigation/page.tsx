// src/components/Navigation.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { Home, BookOpen, HelpCircle, LogIn, UserPlus, User, Bot, MapPin, Calendar, Heart } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Removed unused isDarkMode variable
  useDarkMode();

  // Effect to close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { 
        setIsOpen(false); 
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function handleToggle() { 
    setIsOpen(!isOpen); 
  }
  
  const handleNavigation = () => { 
    if (isOpen) { 
      setIsOpen(false); 
    } 
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700/10 relative z-30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo */}
        <div className="flex items-center">
          <Link 
            href="/dashboard" 
            className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-purple-600 dark:from-purple-400 dark:to-purple-300" 
            onClick={handleNavigation}
          >
            L3 Individual Project
            <span className="text-purple-800 dark:text-purple-400 block text-xs">Smart University</span>
          </Link>
        </div>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center space-x-6">
          {/* Smart University Navigation Links - Only existing routes */}
          <Link href="/dashboard" className="nav-link" onClick={handleNavigation}>
            <Home className="inline h-4 w-4 mr-1" />
            Home
          </Link>
          <Link href="/chatbot" className="nav-link" onClick={handleNavigation}>
            <Bot className="inline h-4 w-4 mr-1" />
            AI Assistant
          </Link>
          <Link href="/navigation" className="nav-link" onClick={handleNavigation}>
            <MapPin className="inline h-4 w-4 mr-1" />
            Navigation
          </Link>
          <Link href="/library" className="nav-link" onClick={handleNavigation}>
            <BookOpen className="inline h-4 w-4 mr-1" />
            Library
          </Link>
          <Link href="/challenges" className="nav-link" onClick={handleNavigation}>
            <Calendar className="inline h-4 w-4 mr-1" />
            Challenges
          </Link>
          <Link href="/profile" className="nav-link" onClick={handleNavigation}>
            <User className="inline h-4 w-4 mr-1" />
            Profile
          </Link>

          {/* Dark Mode Toggle */}
          <div className="flex items-center">
            {/* Dark mode toggle would go here */}
          </div>

          {/* Auth Links */}
          <Link 
            href="/profile" 
            className="text-white bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 px-5 py-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg dark:shadow-purple-900/20 flex items-center" 
            onClick={handleNavigation}
          >
            <LogIn className="inline h-5 w-5 mr-1" /> Login
          </Link>
        </nav>

        {/* Mobile Hamburger button area */}
        <div className="md:hidden flex items-center space-x-3">
          {/* Dark Mode Toggle for Mobile */}
          <div className="flex items-center justify-center">
            {/* Dark mode toggle would go here */}
          </div>

          {/* Hamburger Button */}
          <button 
            type="button" 
            aria-label={isOpen ? "Close menu" : "Open menu"} 
            className="p-2 rounded-md flex items-center transition-all duration-200 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500" 
            onClick={handleToggle}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu flyout */}
      <div
        className={`md:hidden bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/30 absolute w-full transform transition-all duration-300 ease-in-out ${
          isOpen 
            ? 'opacity-100 translate-y-0 max-h-[1000px]' 
            : 'opacity-0 -translate-y-4 pointer-events-none max-h-0'
        }`}
        style={{ 
          overflow: 'hidden', 
          transitionProperty: 'transform, opacity, max-height' 
        }}
        aria-hidden={!isOpen}
      >
        <div className="p-5 space-y-3 border-t border-gray-100 dark:border-gray-700">
          {/* Mobile Smart University Navigation Links - Only existing routes */}
          <Link 
            href="/dashboard" 
            className="mobile-nav-link flex items-center" 
            onClick={handleNavigation}
          >
            <Home className="inline h-5 w-5 mr-2"/> Dashboard
          </Link>
          <Link 
            href="/chatbot" 
            className="mobile-nav-link flex items-center" 
            onClick={handleNavigation}
          >
            <Bot className="inline h-5 w-5 mr-2"/> AI Assistant
          </Link>
          <Link 
            href="/navigation" 
            className="mobile-nav-link flex items-center" 
            onClick={handleNavigation}
          >
            <MapPin className="inline h-5 w-5 mr-2"/> University Navigation
          </Link>
          <Link 
            href="/library" 
            className="mobile-nav-link flex items-center" 
            onClick={handleNavigation}
          >
            <BookOpen className="inline h-5 w-5 mr-2"/> Library
          </Link>
          <Link 
            href="/challenges" 
            className="mobile-nav-link flex items-center" 
            onClick={handleNavigation}
          >
            <Calendar className="inline h-5 w-5 mr-2"/> Challenges
          </Link>
          <Link 
            href="/notifications" 
            className="mobile-nav-link flex items-center" 
            onClick={handleNavigation}
          >
            <Heart className="inline h-5 w-5 mr-2"/> Notifications
          </Link>
          <Link 
            href="/lost-found" 
            className="mobile-nav-link flex items-center" 
            onClick={handleNavigation}
          >
            <HelpCircle className="inline h-5 w-5 mr-2"/> Lost & Found
          </Link>
          <Link 
            href="/financial-aid" 
            className="mobile-nav-link flex items-center" 
            onClick={handleNavigation}
          >
            <UserPlus className="inline h-5 w-5 mr-2"/> Financial Aid
          </Link>

          {/* Mobile Auth Buttons */}
          <div className="pt-3 space-y-3">
            <Link 
              href="/profile" 
              className="mobile-login-button w-full flex items-center justify-center" 
              onClick={handleNavigation}
            >
              <LogIn className="inline h-5 w-5 mr-2" /> Profile
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;