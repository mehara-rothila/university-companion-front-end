// src/app/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

// --- Interfaces ---
interface Notification {
  id: string;
  type: 'academic' | 'social' | 'system' | 'wellness' | 'emergency' | 'dining' | 'transportation';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  isArchived: boolean;
  actionRequired: boolean;
  actionText?: string;
  actionUrl?: string;
  source: string;
  metadata?: {
    course?: string;
    location?: string;
    deadline?: Date;
    eventId?: string;
  };
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
    campusAlerts: boolean;
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
// Moved outside component to prevent re-creation on render
const MOCK_NOTIFICATIONS: Notification[] = [
    {
      id: '1',
      type: 'emergency',
      title: 'Campus Weather Alert',
      message: 'Severe thunderstorm warning issued for campus area. Seek indoor shelter immediately.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      priority: 'urgent',
      isRead: false,
      isArchived: false,
      actionRequired: true,
      actionText: 'View Safety Guidelines',
      actionUrl: '/safety',
      source: 'Campus Safety'
    },
    {
      id: '2',
      type: 'academic',
      title: 'Assignment Due Tomorrow',
      message: 'Data Structures Implementation project is due tomorrow at 11:59 PM.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      priority: 'high',
      isRead: false,
      isArchived: false,
      actionRequired: true,
      actionText: 'View Assignment',
      actionUrl: '/academic',
      source: 'CS 101',
      metadata: {
        course: 'CS 101',
        deadline: new Date(Date.now() + 22 * 60 * 60 * 1000)
      }
    },
    {
      id: '3',
      type: 'wellness',
      title: 'Daily Check-in Reminder',
      message: 'Don\'t forget to complete your daily wellness check-in! Your mental health matters.',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      priority: 'medium',
      isRead: true,
      isArchived: false,
      actionRequired: true,
      actionText: 'Complete Check-in',
      actionUrl: '/wellness',
      source: 'Wellness Center'
    },
    {
      id: '4',
      type: 'social',
      title: 'New Event: Tech Talk Tomorrow',
      message: 'Join us for "AI in Healthcare" presentation by Dr. Sarah Chen tomorrow at 2 PM in Student Union.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      priority: 'medium',
      isRead: false,
      isArchived: false,
      actionRequired: false,
      actionText: 'RSVP Now',
      actionUrl: '/social',
      source: 'Tech Club',
      metadata: {
        location: 'Student Union',
        eventId: 'tech-talk-123'
      }
    },
    {
      id: '5',
      type: 'dining',
      title: 'New Menu Items Available',
      message: 'Check out our new healthy options in North Dining Hall, including vegan bowls and fresh salads!',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      priority: 'low',
      isRead: true,
      isArchived: false,
      actionRequired: false,
      actionText: 'View Menu',
      actionUrl: '/dining',
      source: 'Dining Services',
      metadata: {
        location: 'North Dining Hall'
      }
    },
    {
      id: '6',
      type: 'transportation',
      title: 'Shuttle Service Update',
      message: 'Campus shuttle will have extended hours during finals week (24/7 service).',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      priority: 'medium',
      isRead: true,
      isArchived: false,
      actionRequired: false,
      source: 'Transportation Services'
    },
    {
      id: '7',
      type: 'academic',
      title: 'Grade Posted: Physics Quiz',
      message: 'Your grade for Physics I Quiz #3 has been posted. Score: 92/100. Great job!',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      priority: 'medium',
      isRead: false,
      isArchived: false,
      actionRequired: false,
      actionText: 'View Details',
      actionUrl: '/academic',
      source: 'PHYS 151',
      metadata: {
        course: 'PHYS 151'
      }
    },
    {
      id: '8',
      type: 'system',
      title: 'App Update Available',
      message: 'Smart Campus Companion v2.1 is now available with improved AI recommendations.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      priority: 'low',
      isRead: true,
      isArchived: false,
      actionRequired: false,
      actionText: 'Update Now',
      source: 'System'
    }
];

export default function NotificationsPage() {
  const { isDarkMode } = useDarkMode();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived' | 'settings'>('all');
  const [showSettings, setShowSettings] = useState(false);
  
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
      campusAlerts: true,
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

  // Initialize component
  useEffect(() => {
    setTimeout(() => {
      setNotifications(MOCK_NOTIFICATIONS);
      setFilteredNotifications(MOCK_NOTIFICATIONS);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter notifications based on active tab and filters
  useEffect(() => {
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
        filtered = filtered.filter(n => n.timestamp >= cutoff);
      }
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setFilteredNotifications(filtered);
  }, [notifications, activeTab, filters]);

  // Get notification type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'academic':
        return '📚';
      case 'social':
        return '👥';
      case 'system':
        return '⚙️';
      case 'wellness':
        return '💚';
      case 'emergency':
        return '🚨';
      case 'dining':
        return '🍽️';
      case 'transportation':
        return '🚌';
      default:
        return '📱';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'high':
        return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
      case 'medium':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low':
        return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  // Archive notification
  const archiveNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isArchived: true } : n)
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  // Get unread count
  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length;

  // Get time ago string
  const getTimeAgo = (timestamp: Date) => {
    const diff = new Date().getTime() - timestamp.getTime();
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
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading notifications...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
        
        <AnimatedBackground variant="dashboard" />

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2 flex items-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12" />
                  </svg>
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-3 px-2 py-1 text-sm font-medium bg-red-500 text-white rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Stay updated with smart notifications and AI-powered prioritization
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 md:mt-0 flex space-x-3">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    unreadCount > 0
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                  }`}
                >
                  Mark All Read
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={`mb-8 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm animate-fade-in`}>
            <div className="flex overflow-x-auto">
              {[
                { id: 'all', label: 'All', count: notifications.filter(n => !n.isArchived).length },
                { id: 'unread', label: 'Unread', count: unreadCount },
                { id: 'archived', label: 'Archived', count: notifications.filter(n => n.isArchived).length },
                { id: 'settings', label: 'Settings', count: null }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'all' | 'unread' | 'archived' | 'settings')}
                  className={`flex-1 px-6 py-4 font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? `${isDarkMode ? 'text-purple-400 border-purple-400' : 'text-purple-600 border-purple-600'} border-b-2`
                      : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && tab.count > 0 && (
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.id
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
                Notification Settings
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Notification Categories */}
                <div>
                  <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                    Categories
                  </h4>
                  
                  <div className="space-y-4">
                    {Object.entries(settings).filter(([key]) => !['delivery', 'schedule'].includes(key)).map(([category, categorySettings]) => (
                      <div key={category} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{getTypeIcon(category)}</span>
                            <h5 className={`font-medium capitalize ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {category}
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
                                <span className={`ml-2 text-sm capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {setting.replace(/([A-Z])/g, ' $1').toLowerCase()}
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
                      Delivery Methods
                    </h4>
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} space-y-3`}>
                      {Object.entries(settings.delivery).map(([method, enabled]) => (
                        <label key={method} className="flex items-center justify-between">
                          <span className={`capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {method === 'inApp' ? 'In-App' : method}
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
                      Schedule
                    </h4>
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} space-y-4`}>
                      <label className="flex items-center justify-between">
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Enable Quiet Hours
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
                              Start Time
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
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                              End Time
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
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                            />
                          </div>
                        </div>
                      )}
                      
                      <label className="flex items-center justify-between">
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Reduce notifications on weekends
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
                      alert('Settings saved successfully!');
                      setShowSettings(false);
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          {activeTab !== 'settings' && (
            <div className={`mb-6 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-4 border backdrop-blur-sm animate-fade-in`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="all">All Types</option>
                    <option value="academic">Academic</option>
                    <option value="social">Social</option>
                    <option value="wellness">Wellness</option>
                    <option value="system">System</option>
                    <option value="emergency">Emergency</option>
                    <option value="dining">Dining</option>
                    <option value="transportation">Transportation</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Priority
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Time
                  </label>
                  <select
                    value={filters.timeframe}
                    onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Status
                  </label>
                  <select
                    value={filters.readStatus}
                    onChange={(e) => setFilters(prev => ({ ...prev, readStatus: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="all">All</option>
                    <option value="read">Read</option>
                    <option value="unread">Unread</option>
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
                    className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-fade-in ${
                      !notification.isRead ? (isDarkMode ? 'border-l-4 border-l-purple-500' : 'border-l-4 border-l-purple-600') : ''
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        {/* Type Icon */}
                        <div className="text-2xl mr-4 mt-1">
                          {getTypeIcon(notification.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} ${!notification.isRead ? 'font-bold' : ''}`}>
                                {notification.title}
                              </h3>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                {notification.source} • {getTimeAgo(notification.timestamp)}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded-full capitalize ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </span>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          
                          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 leading-relaxed`}>
                            {notification.message}
                          </p>
                          
                          {/* Metadata */}
                          {notification.metadata && (
                            <div className={`mb-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {notification.metadata.course && (
                                <span className="mr-4">📚 {notification.metadata.course}</span>
                              )}
                              {notification.metadata.location && (
                                <span className="mr-4">📍 {notification.metadata.location}</span>
                              )}
                              {notification.metadata.deadline && (
                                <span className="mr-4">⏰ Due: {notification.metadata.deadline.toLocaleDateString()}</span>
                              )}
                            </div>
                          )}
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-3">
                            {notification.actionText && notification.actionUrl && (
                              <Link
                                href={notification.actionUrl}
                                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium text-sm transition-colors duration-200"
                              >
                                {notification.actionText} →
                              </Link>
                            )}
                            
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                              >
                                Mark as read
                              </button>
                            )}
                            
                            <button
                              onClick={() => archiveNotification(notification.id)}
                              className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                            >
                              Archive
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H6a1 1 0 00-1 1v1m14 0V4a1 1 0 00-1-1H6a1 1 0 00-1 1v1" />
                  </svg>
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    No notifications found
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {activeTab === 'unread' ? "You're all caught up!" : 'Try adjusting your filters to see more notifications.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
