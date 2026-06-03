// src/components/Navigation.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Home, BookOpen, HelpCircle, LogIn, UserPlus, User, Bot, MapPin, Calendar, Heart, LogOut, Settings, Cloud, FolderOpen, Globe, UserCircle, LayoutDashboard, Bell, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import MobileMenuContent from './MobileMenuContent';
import { getThumbnailUrl } from '@/utils/imageUtils';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [emergencyCount, setEmergencyCount] = useState(0);
  const { isDarkMode } = useDarkMode();
  const { user, isAuthenticated, logout } = useAuth();
  const { locale, setLocale, t } = useTranslation();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const API_BASE = `${API_BASE_URL}/api`;

  // Language options
  const languages = [
    { code: 'si', name: 'සිංහල', nativeName: 'Sinhala' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ta', name: 'தமிழ்', nativeName: 'Tamil' }
  ];

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === locale) || languages[1];
  };

  // Fetch active emergency count
  const fetchEmergencyCount = async () => {
    if (!isAuthenticated) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE}/emergency/active`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Count non-dismissed emergencies
      const activeCount = response.data?.filter((e: any) => !e.currentUserDismissed).length || 0;
      setEmergencyCount(activeCount);
    } catch (error) {
      console.error('Failed to fetch emergency count:', error);
      setEmergencyCount(0);
    }
  };

  // Fetch emergency count on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchEmergencyCount();

      // Poll every 30 seconds to update count
      const interval = setInterval(fetchEmergencyCount, 30000);
      return () => clearInterval(interval);
    } else {
      setEmergencyCount(0);
    }
  }, [isAuthenticated, user]);

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
              <LayoutDashboard className="inline h-4 w-4 mr-1.5" />
              {t('nav.dashboard')}
            </Link>
          )}

          {/* Profile - Only show when authenticated */}
          {isAuthenticated && (
            <Link href="/profile" className="nav-link text-sm font-medium" onClick={handleNavigation}>
              <UserCircle className="inline h-4 w-4 mr-1.5" />
              {t('nav.profile')}
            </Link>
          )}

          {/* My Uploads - Only show when authenticated */}
          {isAuthenticated && (
            <Link href="/my-uploads" className="nav-link text-sm font-medium" onClick={handleNavigation}>
              <FolderOpen className="inline h-4 w-4 mr-1.5" />
              {t('nav.myUploads')}
            </Link>
          )}

          {/* My Donations - Only show when authenticated */}
          {isAuthenticated && (
            <Link href="/my-donations" className="nav-link text-sm font-medium" onClick={handleNavigation}>
              <Heart className="inline h-4 w-4 mr-1.5" />
              My Donations
            </Link>
          )}

          {/* Emergency Notifications Badge - Only show when authenticated */}
          {isAuthenticated && (
            <Link
              href="/notifications"
              className="relative nav-link text-sm font-medium flex items-center"
              onClick={handleNavigation}
              title="Emergency Notifications"
            >
              <Bell className="h-5 w-5" />
              {emergencyCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse shadow-lg">
                  {emergencyCount}
                </span>
              )}
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
                    className={`w-full px-3 py-2 text-left text-sm transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${locale === language.code
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
                    src={user.image.includes('amazonaws.com')
                      ? getThumbnailUrl(user.image, 64)
                      : user.image}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
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
          {/* Emergency Badge - Mobile Icon */}
          {isAuthenticated && emergencyCount > 0 && (
            <Link
              href="/notifications"
              className="relative p-2"
              title="Emergency Notifications"
            >
              <Bell className="h-6 w-6 text-purple-700 dark:text-purple-400" />
              <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse">
                {emergencyCount}
              </span>
            </Link>
          )}

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
        className={`lg:hidden bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/30 absolute w-full transform transition-all duration-300 ease-in-out ${isOpen
          ? 'opacity-100 translate-y-0 max-h-[1000px]'
          : 'opacity-0 -translate-y-4 pointer-events-none max-h-0'
          }`}
        style={{
          overflow: 'hidden',
          transitionProperty: 'transform, opacity, max-height'
        }}
        aria-hidden={!isOpen}
      >
        <MobileMenuContent closeMenu={handleNavigation} emergencyCount={emergencyCount} />
      </div>
    </header>
  );
};

export default Navigation;
