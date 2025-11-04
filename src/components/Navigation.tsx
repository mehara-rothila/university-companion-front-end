// src/components/Navigation.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
// import { useDarkMode, DarkModeToggle } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Home, BookOpen, HelpCircle, LogIn, UserPlus, User, Bot, MapPin, Calendar, Heart, LogOut, Settings, Cloud, FolderOpen, Globe } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const isDarkMode = false;
  const { user, isAuthenticated, logout } = useAuth();
  const { locale, setLocale, t } = useTranslation();

  // Language options
  const languages = [
    { code: 'si', name: 'සිංහල', nativeName: 'Sinhala' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ta', name: 'தமிழ்', nativeName: 'Tamil' }
  ];

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === locale) || languages[1];
  };

  // Effect to close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { 
        setIsOpen(false); 
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as Element).closest('header')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  function handleToggle() { 
    setIsOpen(!isOpen); 
  }
  
  const handleNavigation = () => { 
    if (isOpen) { 
      setIsOpen(false); 
    } 
  };

  return (
    <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-sm dark:shadow-gray-700/10 fixed top-0 left-0 right-0 z-50 transition-colors duration-300 border-b border-gray-200/20 dark:border-gray-700/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo */}
        <div className="flex items-center">
          <Link 
            href="/" 
            className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-purple-600 dark:from-purple-400 dark:to-purple-300" 
            onClick={handleNavigation}
          >
            <span className="hidden sm:block">{t('nav.brandName')}</span>
            <span className="sm:hidden">{t('nav.brandName')}</span>
            <span className="text-purple-800 dark:text-purple-400 block text-xs">{t('nav.brandTagline')}</span>
          </Link>
        </div>

        {/* Desktop menu */}
        <nav className="hidden lg:flex items-center space-x-6">
          {/* Dashboard - Only show when authenticated */}
          {isAuthenticated && (
            <Link href="/dashboard" className="nav-link text-sm font-medium" onClick={handleNavigation}>
              <User className="inline h-4 w-4 mr-1.5" />
              {t('nav.dashboard')}
            </Link>
          )}

          {/* Admin Panel Link - Only show for admin users */}
          {isAuthenticated && user?.role === 'ADMIN' && (
            <Link href="/admin" className="nav-link text-sm bg-purple-100 dark:bg-purple-900/30 px-3 py-1.5 rounded-lg font-medium" onClick={handleNavigation}>
              <Settings className="inline h-4 w-4 mr-1.5" />
              {t('nav.admin')}
            </Link>
          )}

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">{getCurrentLanguage().name}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showLanguageDropdown && (
              <div className="absolute top-full right-0 mt-1 w-44 rounded-lg shadow-lg border bg-white dark:bg-gray-800 dark:border-gray-700 z-50">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => {
                      setLocale(language.code as 'en' | 'si' | 'ta');
                      setShowLanguageDropdown(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                      locale === language.code
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{language.name}</span>
                      {locale === language.code && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {language.nativeName}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth Links */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user?.image && (
                  <img 
                    src={user.image} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-gray-700 dark:text-gray-300">
                  Hi, {user?.firstName || user?.name?.split(' ')[0]}!
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  handleNavigation();
                }}
                className="text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 px-5 py-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
              >
                <LogOut className="inline h-5 w-5 mr-1" /> {t('nav.logout')}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-white bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 px-5 py-2 rounded-md transition-all duration-200 shadow-md hover:shadow-lg dark:shadow-purple-900/20 flex items-center"
              onClick={handleNavigation}
            >
              <LogIn className="inline h-5 w-5 mr-1" /> {t('nav.login')}
            </Link>
          )}
        </nav>

        {/* Mobile Hamburger button area */}
        <div className="lg:hidden flex items-center space-x-3">
          {/* Hamburger Button */}
          <button
            type="button"
            aria-label={isOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={isOpen}
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
        className={`lg:hidden bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/30 absolute w-full transform transition-all duration-300 ease-in-out ${
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
          {/* Mobile Smart University Navigation Links */}
          <Link
            href="/"
            className="mobile-nav-link flex items-center"
            onClick={handleNavigation}
          >
            <Home className="inline h-5 w-5 mr-2"/> {t('nav.home')}
          </Link>
          <Link
            href="/dashboard"
            className="mobile-nav-link flex items-center"
            onClick={handleNavigation}
          >
            <User className="inline h-5 w-5 mr-2"/> {t('nav.dashboard')}
          </Link>
          <Link
            href="/chatbot"
            className="mobile-nav-link flex items-center"
            onClick={handleNavigation}
          >
            <Bot className="inline h-5 w-5 mr-2"/> {t('nav.aiAssistant')}
          </Link>
          <Link
            href="/navigation"
            className="mobile-nav-link flex items-center"
            onClick={handleNavigation}
          >
            <MapPin className="inline h-5 w-5 mr-2"/> {t('nav.universityNavigation')}
          </Link>
          <Link
            href="/study-spaces"
            className="mobile-nav-link flex items-center"
            onClick={handleNavigation}
          >
            <BookOpen className="inline h-5 w-5 mr-2"/> {t('nav.studySpaces')}
          </Link>
          <Link
            href="/academic"
            className="mobile-nav-link flex items-center"
            onClick={handleNavigation}
          >
            <Calendar className="inline h-5 w-5 mr-2"/> {t('nav.academicHub')}
          </Link>
          <Link
            href="/events"
            className="mobile-nav-link flex items-center"
            onClick={handleNavigation}
          >
            <Calendar className="inline h-5 w-5 mr-2"/> Events & Socials
          </Link>
          <Link
            href="/wellness"
            className="mobile-nav-link flex items-center"
            onClick={handleNavigation}
          >
            <Heart className="inline h-5 w-5 mr-2"/> {t('nav.healthWellness')}
          </Link>
          <Link
            href="/weather"
            className="mobile-nav-link flex items-center"
            onClick={handleNavigation}
          >
            <Cloud className="inline h-5 w-5 mr-2"/> {t('nav.weather')}
          </Link>

          {/* Mobile My Uploads Link - Only show for authenticated users */}
          {isAuthenticated && (
            <Link
              href="/my-uploads"
              className="mobile-nav-link flex items-center"
              onClick={handleNavigation}
            >
              <FolderOpen className="inline h-5 w-5 mr-2"/> {t('nav.myUploads')}
            </Link>
          )}

          <Link
            href="/help"
            className="mobile-nav-link flex items-center"
            onClick={handleNavigation}
          >
            <HelpCircle className="inline h-5 w-5 mr-2"/> {t('nav.helpSupport')}
          </Link>

          {/* Mobile Admin Panel Link - Only show for admin users */}
          {isAuthenticated && user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="mobile-nav-link flex items-center"
              onClick={handleNavigation}
            >
              <Settings className="inline h-5 w-5 mr-2"/> {t('nav.adminPanel')}
            </Link>
          )}

          {/* Mobile Auth Buttons */}
          <div className="pt-3 space-y-3">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="text-gray-700 dark:text-gray-300 px-3 py-2 text-center flex items-center justify-center space-x-2">
                  {user?.image && (
                    <img 
                      src={user.image} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span>Hi, {user?.firstName || user?.name?.split(' ')[0]}!</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    handleNavigation();
                  }}
                  className="mobile-login-button w-full flex items-center justify-center bg-red-600 hover:bg-red-700"
                >
                  <LogOut className="inline h-5 w-5 mr-2" /> {t('nav.logout')}
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/onboarding"
                  className="mobile-nav-link flex items-center"
                  onClick={handleNavigation}
                >
                  <UserPlus className="inline h-5 w-5 mr-2"/> {t('nav.getStarted')}
                </Link>
                <Link
                  href="/login"
                  className="mobile-login-button w-full flex items-center justify-center"
                  onClick={handleNavigation}
                >
                  <LogIn className="inline h-5 w-5 mr-2" /> {t('nav.signIn')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
