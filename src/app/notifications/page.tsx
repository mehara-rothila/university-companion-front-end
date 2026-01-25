// src/app/notifications/page.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import AuthGuard from '@/components/AuthGuard';
import axios from 'axios';
import { Bell, BookOpen, Users, Settings, Heart, Smartphone, Utensils, Library as LibraryIcon, DollarSign, Search, Check, Archive, Clock, Calendar, AlertTriangle, Info, CheckCircle } from 'lucide-react';

// --- Interfaces ---
interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'GENERAL' | 'ACADEMIC' | 'FINANCIAL_AID' | 'LOST_FOUND' | 'WELLNESS' | 'DINING' | 'LIBRARY' | 'SOCIAL' | 'SYSTEM';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  target: 'ALL_STUDENTS' | 'SPECIFIC_USERS' | 'ADMIN_ONLY';
  targetUserIds?: number[];
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  createdByName: string;
  createdById: number;
  isRead?: boolean;
  isArchived?: boolean;
}

interface NotificationSettings {
  academic: {
    enabled: boolean;
    assignments: boolean;
    grades: boolean;
    scheduleChanges: boolean;
    deadlineReminders: boolean;
  };
  social: {
    enabled: boolean;
    events: boolean;
    clubs: boolean;
    friendUpdates: boolean;
    invitations: boolean;
  };
  system: {
    enabled: boolean;
    maintenance: boolean;
    updates: boolean;
    security: boolean;
  };
  wellness: {
    enabled: boolean;
    checkInReminders: boolean;
    goalProgress: boolean;
    moodTracking: boolean;
  };
  emergency: {
    enabled: boolean;
    universityAlerts: boolean;
    weatherWarnings: boolean;
    safetyUpdates: boolean;
  };
  delivery: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  schedule: {
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    weekends: boolean;
  };
}

interface NotificationFilter {
  type: string;
  priority: string;
  timeframe: string;
  readStatus: string;
}

// --- Constants ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_BASE = `${API_BASE_URL}/api`;

export default function NotificationsPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived' | 'settings'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [emergencyNotifications, setEmergencyNotifications] = useState<any[]>([]);
  const [emergencyCount, setEmergencyCount] = useState(0);

  const [filters, setFilters] = useState<NotificationFilter>({
    type: 'all',
    priority: 'all',
    timeframe: 'all',
    readStatus: 'all'
  });

  const [settings, setSettings] = useState<NotificationSettings>({
    academic: {
      enabled: true,
      assignments: true,
      grades: true,
      scheduleChanges: true,
      deadlineReminders: true
    },
    social: {
      enabled: true,
      events: true,
      clubs: true,
      friendUpdates: false,
      invitations: true
    },
    system: {
      enabled: true,
      maintenance: true,
      updates: false,
      security: true
    },
    wellness: {
      enabled: true,
      checkInReminders: true,
      goalProgress: true,
      moodTracking: false
    },
    emergency: {
      enabled: true,
      universityAlerts: true,
      weatherWarnings: true,
      safetyUpdates: true
    },
    delivery: {
      push: true,
      email: true,
      sms: false,
      inApp: true
    },
    schedule: {
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      },
      weekends: false
    }
  });

  // API Functions
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    };
  };

  // Safe date formatting helper
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const loadNotifications = async () => {
    // Check for both user and token
    const token = localStorage.getItem('token');

    console.log('🔍 Notification page - Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });

    if (!user?.id || !token) {
      console.log('❌ User not authenticated or token missing');
      setNotifications([]);
      return;
    }

    try {
      setIsLoading(true);
      const headers = getAuthHeaders();
      console.log('📤 Sending request with headers:', {
        ...headers,
        Authorization: headers.Authorization ? `${headers.Authorization.substring(0, 30)}...` : 'none'
      });

      const response = await axios.get(`${API_BASE}/notifications/student/my?page=${currentPage}&size=10`, {
        headers
      });

      const notificationData = response.data.content || [];
      const notificationsWithReadStatus = notificationData.map((notification: Notification) => ({
        ...notification,
        isRead: false, // Default to unread for new notifications
        isArchived: false
      }));

      setNotifications(notificationsWithReadStatus);
      setTotalPages(response.data.totalPages || 0);
      setError(null);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setError('Please log in to view notifications');
      } else if (axios.isAxiosError(error) && error.response?.status === 403) {
        setError('Session expired. Please log out and log in again.');
      } else if (axios.isAxiosError(error) && error.response?.status === 400) {
        setError('Invalid request. Please try logging in again.');
      } else {
        setError('Failed to load notifications');
      }
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load emergency notifications
  const loadEmergencyNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!user?.id || !token) return;

    try {
      const response = await axios.get(`${API_BASE}/emergency/active`, {
        headers: getAuthHeaders()
      });

      const activeEmergencies = response.data?.filter((e: any) => !e.currentUserDismissed) || [];
      setEmergencyNotifications(activeEmergencies);
      setEmergencyCount(activeEmergencies.length);
    } catch (error) {
      console.error('Failed to load emergency notifications:', error);
      setEmergencyNotifications([]);
      setEmergencyCount(0);
    }
  };

  // Dismiss emergency notification
  const dismissEmergency = async (emergencyId: number) => {
    try {
      const headers = getAuthHeaders();
      await axios.post(`${API_BASE}/emergency/${emergencyId}/dismiss`, {}, { headers });

      // Reload emergency notifications
      await loadEmergencyNotifications();
    } catch (error) {
      console.error('Failed to dismiss emergency:', error);
    }
  };

  // Dismiss all emergencies
  const dismissAllEmergencies = async () => {
    try {
      const headers = getAuthHeaders();

      // Dismiss each emergency
      await Promise.all(
        emergencyNotifications.map(emergency =>
          axios.post(`${API_BASE}/emergency/${emergency.id}/dismiss`, {}, { headers })
        )
      );

      // Reload emergency notifications
      await loadEmergencyNotifications();
    } catch (error) {
      console.error('Failed to dismiss all emergencies:', error);
    }
  };

  // Initialize component
  useEffect(() => {
    if (user) {
      loadNotifications();
      loadEmergencyNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentPage]);

  // Filter notifications based on active tab and filters using useMemo for performance
  const filteredNotificationsMemo = useMemo(() => {
    let filtered = notifications;

    // Filter by tab
    switch (activeTab) {
      case 'unread':
        filtered = filtered.filter(n => !n.isRead);
        break;
      case 'archived':
        filtered = filtered.filter(n => n.isArchived);
        break;
      case 'all':
      default:
        filtered = filtered.filter(n => !n.isArchived);
        break;
    }

    // Apply additional filters
    if (filters.type !== 'all') {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }

    if (filters.readStatus !== 'all') {
      filtered = filtered.filter(n =>
        filters.readStatus === 'read' ? n.isRead : !n.isRead
      );
    }

    // Filter by timeframe
    if (filters.timeframe !== 'all') {
      const cutoff = new Date();

      switch (filters.timeframe) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoff.setDate(cutoff.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(cutoff.getMonth() - 1);
          break;
      }

      if (filters.timeframe !== 'all') {
        filtered = filtered.filter(n => new Date(n.createdAt) >= cutoff);
      }
    }

    // Sort by createdAt (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered;
  }, [notifications, activeTab, filters]);

  // Update filteredNotifications when memo changes
  useEffect(() => {
    setFilteredNotifications(filteredNotificationsMemo);
  }, [filteredNotificationsMemo]);

  // Get notification type icon
  const getTypeIcon = (type: string) => {
    const iconClass = "w-6 h-6";
    switch (type) {
      case 'ACADEMIC':
        return <BookOpen className={`${iconClass} text-blue-500`} />;
      case 'SOCIAL':
        return <Users className={`${iconClass} text-pink-500`} />;
      case 'SYSTEM':
        return <Settings className={`${iconClass} text-gray-500`} />;
      case 'WELLNESS':
        return <Heart className={`${iconClass} text-green-500`} />;
      case 'GENERAL':
        return <Smartphone className={`${iconClass} text-purple-500`} />;
      case 'DINING':
        return <Utensils className={`${iconClass} text-orange-500`} />;
      case 'LIBRARY':
        return <LibraryIcon className={`${iconClass} text-indigo-500`} />;
      case 'FINANCIAL_AID':
        return <DollarSign className={`${iconClass} text-yellow-500`} />;
      case 'LOST_FOUND':
        return <Search className={`${iconClass} text-teal-500`} />;
      default:
        return <Bell className={`${iconClass} text-gray-400`} />;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'HIGH':
        return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
      case 'MEDIUM':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'LOW':
        return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Mark notification as read
  const markAsRead = useCallback((id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, []);

  // Archive notification
  const archiveNotification = useCallback((id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isArchived: true } : n)
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  }, []);

  // Get unread count
  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length;

  // Get time ago string
  const getTimeAgo = (timestamp: string) => {
    const notificationDate = new Date(timestamp);
    const diff = new Date().getTime() - notificationDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 flex items-center justify-center`}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('notificationsPage.messages.loading')}</p>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 flex items-center justify-center`}>
          <div className="text-center">
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('notificationsPage.messages.pleaseLogin')}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <AuthGuard>
      <Navigation />
      <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>

        <AnimatedBackground variant="dashboard" />

        {/* Error Message */}
        {error && (
          <div className="fixed top-20 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">

          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className={`flex flex-col md:flex-row md:items-center md:justify-between p-4 sm:p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm shadow-lg`}>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2 flex items-center`}>
                  <Bell className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-purple-500" />
                  {t('notificationsPage.title')}
                  {unreadCount > 0 && (
                    <span className="ml-2 sm:ml-3 px-2 py-1 text-xs sm:text-sm font-medium bg-red-500 text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h1>
                <p className={`text-base sm:text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('notificationsPage.subtitle')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${unreadCount > 0
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                    }`}
                >
                  {t('notificationsPage.buttons.markAllRead')}
                </button>
                <button
                  onClick={dismissAllEmergencies}
                  disabled={emergencyCount === 0}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${emergencyCount > 0
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                    }`}
                >
                  Dismiss All Emergencies ({emergencyCount})
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t('notificationsPage.buttons.settings')}
                </button>
              </div>
            </div>
          </div>

          {/* Emergency Notifications Section */}
          {emergencyCount > 0 && activeTab === 'all' && (
            <div className={`mb-6 p-6 rounded-xl border-2 ${isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'} backdrop-blur-sm shadow-lg animate-fade-in`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-red-300' : 'text-red-700'} flex items-center`}>
                  🚨 Active Emergencies ({emergencyCount})
                </h2>
              </div>
              <div className="space-y-3">
                {emergencyNotifications.map((emergency) => (
                  <div
                    key={emergency.id}
                    className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/30' : 'bg-white'} border ${isDarkMode ? 'border-red-800' : 'border-red-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className={`font-bold text-lg ${isDarkMode ? 'text-red-200' : 'text-red-800'} mb-2`}>
                          {emergency.title}
                        </h3>
                        <p className={`${isDarkMode ? 'text-red-300' : 'text-red-700'} mb-2`}>
                          {emergency.message}
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                          {formatDate(emergency.createdAt)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => dismissEmergency(emergency.id)}
                        className={`ml-4 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${isDarkMode
                          ? 'bg-red-800 text-red-200 hover:bg-red-700'
                          : 'bg-red-600 text-white hover:bg-red-700'
                          }`}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className={`mb-8 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm animate-fade-in`}>
            <div className="flex overflow-x-auto">
              {[
                { id: 'all', label: t('notificationsPage.tabs.all'), count: notifications.filter(n => !n.isArchived).length },
                { id: 'unread', label: t('notificationsPage.tabs.unread'), count: unreadCount },
                { id: 'archived', label: t('notificationsPage.tabs.archived'), count: notifications.filter(n => n.isArchived).length },
                { id: 'settings', label: t('notificationsPage.tabs.settings'), count: null }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'all' | 'unread' | 'archived' | 'settings')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors duration-200 ${activeTab === tab.id
                    ? `${isDarkMode ? 'text-purple-400 border-purple-400' : 'text-purple-600 border-purple-600'} border-b-2`
                    : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
                    }`}
                >
                  {tab.label}
                  {tab.count !== null && tab.count > 0 && (
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${activeTab === tab.id
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Settings Panel */}
          {(showSettings || activeTab === 'settings') && (
            <div className={`mb-8 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                {t('notificationsPage.settings.title')}
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Notification Categories */}
                <div>
                  <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                    {t('notificationsPage.settings.categories')}
                  </h4>

                  <div className="space-y-4">
                    {Object.entries(settings).filter(([key]) => !['delivery', 'schedule'].includes(key)).map(([category, categorySettings]) => (
                      <div key={category} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{getTypeIcon(category)}</span>
                            <h5 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {t(`notifications.settings.categoryLabels.${category}`)}
                            </h5>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={categorySettings.enabled}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                [category]: { ...categorySettings, enabled: e.target.checked }
                              }))}
                              className="sr-only peer"
                            />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                          </label>
                        </div>

                        {categorySettings.enabled && (
                          <div className="space-y-2 ml-6">
                            {Object.entries(categorySettings).filter(([key]) => key !== 'enabled').map(([setting, value]) => (
                              <label key={setting} className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={value as boolean}
                                  onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    [category]: {
                                      ...categorySettings,
                                      [setting]: e.target.checked
                                    }
                                  }))}
                                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {t(`notifications.settings.${category}Options.${setting}`)}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery & Schedule Settings */}
                <div className="space-y-6">
                  {/* Delivery Methods */}
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                      {t('notificationsPage.settings.deliveryMethods')}
                    </h4>
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} space-y-3`}>
                      {Object.entries(settings.delivery).map(([method, enabled]) => (
                        <label key={method} className="flex items-center justify-between">
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t(`notifications.settings.deliveryOptions.${method}`)}
                          </span>
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              delivery: { ...prev.delivery, [method]: e.target.checked }
                            }))}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Quiet Hours */}
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                      {t('notificationsPage.settings.schedule')}
                    </h4>
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} space-y-4`}>
                      <label className="flex items-center justify-between">
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('notificationsPage.settings.scheduleOptions.enableQuietHours')}
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.schedule.quietHours.enabled}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            schedule: {
                              ...prev.schedule,
                              quietHours: { ...prev.schedule.quietHours, enabled: e.target.checked }
                            }
                          }))}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </label>

                      {settings.schedule.quietHours.enabled && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                              {t('notificationsPage.settings.scheduleOptions.startTime')}
                            </label>
                            <input
                              type="time"
                              value={settings.schedule.quietHours.start}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                schedule: {
                                  ...prev.schedule,
                                  quietHours: { ...prev.schedule.quietHours, start: e.target.value }
                                }
                              }))}
                              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-100'
                                : 'bg-white border-gray-300 text-gray-900'
                                } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                              {t('notificationsPage.settings.scheduleOptions.endTime')}
                            </label>
                            <input
                              type="time"
                              value={settings.schedule.quietHours.end}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                schedule: {
                                  ...prev.schedule,
                                  quietHours: { ...prev.schedule.quietHours, end: e.target.value }
                                }
                              }))}
                              className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-gray-100'
                                : 'bg-white border-gray-300 text-gray-900'
                                } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                            />
                          </div>
                        </div>
                      )}

                      <label className="flex items-center justify-between">
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t('notificationsPage.settings.scheduleOptions.reduceWeekends')}
                        </span>
                        <input
                          type="checkbox"
                          checked={settings.schedule.weekends}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            schedule: { ...prev.schedule, weekends: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={() => {
                      alert(t('notificationsPage.messages.settingsSaved'));
                      setShowSettings(false);
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                  >
                    {t('notificationsPage.buttons.saveSettings')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          {/* Filters */}
          {activeTab !== 'settings' && (
            <div className={`mb-6 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-4 border backdrop-blur-sm animate-fade-in`}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    {t('notificationsPage.filters.type')}
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border text-sm transition-all duration-200 ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  >
                    <option value="all">{t('notificationsPage.filterOptions.allTypes')}</option>
                    <option value="GENERAL">{t('notificationsPage.types.general')}</option>
                    <option value="ACADEMIC">{t('notificationsPage.types.academic')}</option>
                    <option value="SOCIAL">{t('notificationsPage.types.social')}</option>
                    <option value="WELLNESS">{t('notificationsPage.types.wellness')}</option>
                    <option value="SYSTEM">{t('notificationsPage.types.system')}</option>
                    <option value="FINANCIAL_AID">{t('notificationsPage.types.financialAid')}</option>
                    <option value="DINING">{t('notificationsPage.types.dining')}</option>
                    <option value="LIBRARY">{t('notificationsPage.types.library')}</option>
                    <option value="LOST_FOUND">{t('notificationsPage.types.lostFound')}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    {t('notificationsPage.filters.priority')}
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border text-sm transition-all duration-200 ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  >
                    <option value="all">{t('notificationsPage.filterOptions.allPriorities')}</option>
                    <option value="URGENT">{t('notificationsPage.priorities.urgent')}</option>
                    <option value="HIGH">{t('notificationsPage.priorities.high')}</option>
                    <option value="MEDIUM">{t('notificationsPage.priorities.medium')}</option>
                    <option value="LOW">{t('notificationsPage.priorities.low')}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    {t('notificationsPage.filters.time')}
                  </label>
                  <select
                    value={filters.timeframe}
                    onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border text-sm transition-all duration-200 ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  >
                    <option value="all">{t('notificationsPage.filterOptions.allTime')}</option>
                    <option value="today">{t('notificationsPage.filterOptions.today')}</option>
                    <option value="week">{t('notificationsPage.filterOptions.week')}</option>
                    <option value="month">{t('notificationsPage.filterOptions.month')}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    {t('notificationsPage.filters.status')}
                  </label>
                  <select
                    value={filters.readStatus}
                    onChange={(e) => setFilters(prev => ({ ...prev, readStatus: e.target.value }))}
                    className={`w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg border text-sm transition-all duration-200 ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100'
                      : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  >
                    <option value="all">{t('notificationsPage.filterOptions.all')}</option>
                    <option value="read">{t('notificationsPage.filterOptions.read')}</option>
                    <option value="unread">{t('notificationsPage.filterOptions.unread')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          {activeTab !== 'settings' && (
            <div className="space-y-4">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 animate-fade-in ${isDarkMode
                      ? 'bg-gray-800/60 border-gray-700/50 hover:border-purple-500/40 backdrop-blur-md'
                      : 'bg-white/80 border-gray-100 hover:border-purple-200 backdrop-blur-sm'
                      } ${!notification.isRead
                        ? (isDarkMode ? 'shadow-[inset_4px_0_0_0_#a855f7] bg-gradient-to-r from-purple-900/10 to-transparent' : 'shadow-[inset_4px_0_0_0_#9333ea] bg-gradient-to-r from-purple-50/50 to-transparent')
                        : 'opacity-95 hover:opacity-100'
                      }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Background decoration for unread */}
                    {!notification.isRead && (
                      <div className={`absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none transition-opacity duration-500`} />
                    )}

                    <div className="p-4 sm:p-6 relative z-10">
                      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                        {/* Type Icon Container */}
                        <div className={`flex-shrink-0 p-3.5 rounded-2xl ${isDarkMode
                          ? 'bg-gray-700/50 ring-1 ring-white/10'
                          : 'bg-white shadow-sm ring-1 ring-black/5'
                          } group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 hidden sm:flex items-center justify-center`}>
                          {getTypeIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex flex-col-reverse sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-3">
                            <div>
                              <div className="flex items-center gap-3 mb-1.5">
                                <span className="sm:hidden text-2xl p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                                  {getTypeIcon(notification.type)}
                                </span>
                                <h3 className={`text-lg sm:text-xl font-bold leading-tight tracking-tight ${isDarkMode ? 'text-gray-50' : 'text-gray-900'
                                  }`}>
                                  {notification.title}
                                </h3>
                                {!notification.isRead && (
                                  <span className="flex h-2.5 w-2.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center flex-wrap gap-3 text-sm">
                                <span className={`flex items-center gap-1.5 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'} font-semibold`}>
                                  {notification.createdByName}
                                </span>
                                <span className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`}>|</span>
                                <span className={`flex items-center gap-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <Clock className="w-3.5 h-3.5" />
                                  {getTimeAgo(notification.createdAt)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                              <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </span>
                            </div>
                          </div>

                          <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-5 leading-relaxed font-normal`}>
                            {notification.message}
                          </p>

                          {/* Footer Info & Actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-gray-100/50 dark:border-gray-700/30 gap-4">
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium">
                              <span className={`flex items-center gap-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Calendar className="w-4 h-4 opacity-70" />
                                {formatDate(notification.createdAt)}
                              </span>
                              {notification.expiresAt && (
                                <span className={`flex items-center gap-1.5 ${isDarkMode ? 'text-red-300' : 'text-red-600'} bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md`}>
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  {t('notificationsPage.timeLabels.expires')}: {formatDate(notification.expiresAt)}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 self-end sm:self-auto">
                              {!notification.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className={`group/btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md ${isDarkMode
                                    ? 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/20'
                                    : 'bg-white text-purple-600 hover:bg-purple-50 border border-purple-100'
                                    }`}
                                  title={t('notificationsPage.actions.markAsRead')}
                                >
                                  <Check className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                                  <span className="">{t('notificationsPage.actions.markAsRead')}</span>
                                </button>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  archiveNotification(notification.id);
                                }}
                                className={`group/btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md ${isDarkMode
                                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200 border border-gray-700'
                                  : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-gray-200'
                                  }`}
                                title={t('notificationsPage.actions.archive')}
                              >
                                <Archive className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                                <span className="">{t('notificationsPage.actions.archive')}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-12 rounded-2xl ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} border backdrop-blur-sm shadow-lg`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H6a1 1 0 00-1 1v1m14 0V4a1 1 0 00-1-1H6a1 1 0 00-1 1v1" />
                  </svg>
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    {t('notificationsPage.messages.noNotifications')}
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {activeTab === 'unread' ? t('notificationsPage.messages.allCaughtUp') : t('notificationsPage.messages.adjustFilters')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {
            activeTab !== 'settings' && totalPages > 1 && (
              <div className="flex items-center justify-center mt-8 gap-2">
                <button
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-4 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('notificationsPage.pagination.previous')}
                </button>
                <span className={`px-4 py-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('notificationsPage.pagination.page')} {currentPage + 1} {t('notificationsPage.pagination.of')} {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-4 py-2 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('notificationsPage.pagination.next')}
                </button>
              </div>
            )
          }
        </div >
      </main >
    </AuthGuard >
  );
}
