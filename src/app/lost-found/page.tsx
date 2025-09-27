// src/app/lost-found/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import lostFoundService, { LostFoundItem, LostFoundStats, LostFoundItemRequest } from '@/services/lostFoundService';

// --- Local Interfaces ---

interface ItemCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

interface LocationArea {
  id: string;
  name: string;
  zone: string;
  frequency: number;
}

export default function LostFoundPage() {
  const { isDarkMode } = useDarkMode();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');
  const [viewMode, setViewMode] = useState<'lost' | 'found' | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [itemPosted, setItemPosted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Backend state
  const [lostFoundItems, setLostFoundItems] = useState<LostFoundItem[]>([]);
  const [stats, setStats] = useState<LostFoundStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for posting new items
  const [newItemForm, setNewItemForm] = useState<LostFoundItemRequest>({
    type: 'LOST',
    title: '',
    description: '',
    category: 'Electronics',
    location: 'Main Library',
    contactMethod: 'DIRECT',
    priority: 'MEDIUM',
    tags: []
  });

  // Load data on component mount
  useEffect(() => {
    loadItems();
    loadStats();
  }, []);

  // Reload items when filters change
  useEffect(() => {
    loadItems();
  }, [viewMode, selectedCategory, selectedLocation, searchQuery]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        type: viewMode === 'all' ? undefined : viewMode.toUpperCase(),
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        location: selectedLocation === 'all' ? undefined : selectedLocation,
        search: searchQuery || undefined,
        status: 'ACTIVE'
      };
      
      const items = await lostFoundService.getItems(filters);
      setLostFoundItems(items);
    } catch (err) {
      setError('Failed to load items. Please try again.');
      console.error('Error loading items:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await lostFoundService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const categories: ItemCategory[] = [
    {
      id: 'all',
      name: 'All Items',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
      count: lostFoundItems.length,
      color: 'purple'
    },
    ...(stats?.categories || []).map(category => ({
      id: category,
      name: category,
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
      count: lostFoundItems.filter(item => item.category === category).length,
      color: 'blue'
    }))
  ];

  const locations: LocationArea[] = [
    { id: 'all', name: 'All Locations', zone: 'Campus Wide', frequency: 100 },
    ...(stats?.locations || []).map(location => ({
      id: location.toLowerCase().replace(/\s+/g, '-'),
      name: location,
      zone: 'Campus',
      frequency: Math.floor(Math.random() * 50) + 10
    }))
  ];

  // Items are already filtered by the backend, so we just use them directly
  const filteredItems = lostFoundItems;

  // Handle item posting
  const handlePostItem = async () => {
    try {
      setLoading(true);
      await lostFoundService.createItem(newItemForm);
      setItemPosted(true);
      setShowPostModal(false);
      setNewItemForm({
        type: 'LOST',
        title: '',
        description: '',
        category: 'Electronics',
        location: 'Main Library',
        contactMethod: 'DIRECT',
        priority: 'MEDIUM',
        tags: []
      });
      await loadItems();
      await loadStats();
      setTimeout(() => setItemPosted(false), 5000);
    } catch (err) {
      setError('Failed to post item. Please try again.');
      console.error('Error posting item:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle contact
  const handleContact = (item: LostFoundItem) => {
    setSelectedItem(item);
    setShowContactModal(true);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-500';
      case 'resolved': return 'text-purple-500';
      case 'expired': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const tabs = [
    { id: 'browse', name: 'Browse Items', icon: '🔍' },
    { id: 'my-items', name: 'My Items', icon: '📦' },
    { id: 'success-stories', name: 'Success Stories', icon: '✨' }
  ];

  return (
    <>
      <Navigation />
      <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
        
        <AnimatedBackground variant="dashboard" />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="text-center">
              <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center justify-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Lost & Found
              </h1>
              <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto mb-6`}>
                Community platform to help reunite lost items with their owners. Post what you&apos;ve lost or found to connect with others on campus.
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-4">
                {isAuthenticated ? (
                  <button 
                    onClick={() => setShowPostModal(true)}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Report Lost/Found Item
                  </button>
                ) : (
                  <Link 
                    href="/login"
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Login to Report Items
                  </Link>
                )}
                
                <Link 
                  href="/navigation"
                  className={`px-6 py-3 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Campus Map
                </Link>

                <Link 
                  href="/help"
                  className={`px-6 py-3 ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-blue-200' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'} rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Help & Support
                </Link>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {itemPosted && (
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'} animate-fade-in`}>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className={`${isDarkMode ? 'text-green-300' : 'text-green-800'} font-medium`}>
                  Item posted successfully! Others can now see your listing and contact you if they have information.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'} animate-fade-in`}>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`${isDarkMode ? 'text-red-300' : 'text-red-800'} font-medium`}>
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'} animate-fade-in`}>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats?.totalItems || 0}</div>
              <div className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>Total Items</div>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'} animate-fade-in`}>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.lostItems || 0}</div>
              <div className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>Lost Items</div>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'} animate-fade-in`}>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.foundItems || 0}</div>
              <div className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Found Items</div>
            </div>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'} animate-fade-in`}>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.resolvedItems || 0}</div>
              <div className={`text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>Items Reunited</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm mb-6 animate-fade-in`}>
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-0 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm animate-fade-in`}>

            {/* Browse Items Tab */}
            {activeTab === 'browse' && (
              <div className="p-8">
                {/* Filters */}
                <div className="mb-8 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-wrap gap-3">
                      {/* Type Filter */}
                      <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                        {[
                          { id: 'all', name: 'All Items', count: stats?.totalItems || 0 },
                          { id: 'lost', name: 'Lost', count: stats?.lostItems || 0 },
                          { id: 'found', name: 'Found', count: stats?.foundItems || 0 }
                        ].map((type) => (
                          <button
                            key={type.id}
                            onClick={() => setViewMode(type.id as 'all' | 'lost' | 'found')}
                            className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                              viewMode === type.id
                                ? 'bg-purple-600 text-white'
                                : isDarkMode 
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {type.name} ({type.count})
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search items..."
                        className={`pl-10 pr-4 py-2 w-full lg:w-80 rounded-lg border transition-all duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className={`absolute left-3 top-2.5 h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Category and Location Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name} ({category.count})
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    >
                      {locations.map(location => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading items...</p>
                  </div>
                )}

                {/* Items Grid */}
                {!loading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                      <div key={item.id} className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} transition-all duration-200 hover:shadow-md`}>
                      
                      {/* Item Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.type === 'LOST' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {item.type}
                          </span>
                          {item.priority && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                          )}
                        </div>
                        <span className={`text-xs ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>

                      {/* Item Image Placeholder */}
                      {item.imageUrl && (
                        <div className="w-full h-40 bg-gray-200 dark:bg-gray-600 rounded-lg mb-4 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}

                      {/* Item Details */}
                      <div className="space-y-3">
                        <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {item.title}
                        </h3>
                        
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-3`}>
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.location}</span>
                          </div>
                          <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(item.dateReported).toLocaleDateString()}
                          </span>
                        </div>

                        {item.reward && (
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                              ${item.reward} Reward
                            </span>
                          </div>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {item.tags && item.tags.slice(0, 3).map(tag => (
                            <span key={tag} className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                              #{tag}
                            </span>
                          ))}
                          {item.tags && item.tags.length > 3 && (
                            <span className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 pt-2">
                          <button 
                            onClick={() => handleContact(item)}
                            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                          >
                            Contact
                          </button>
                          <Link 
                            href="/navigation"
                            className={`px-4 py-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg text-sm font-medium transition-all duration-200 flex items-center`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                )}

                {!loading && filteredItems.length === 0 && (
                  <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No items found matching your criteria.</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-2`}>Try adjusting your filters or search terms.</p>
                  </div>
                )}
              </div>
            )}

            {/* My Items Tab */}
            {activeTab === 'my-items' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>My Items</h2>
                  <button 
                    onClick={() => setShowPostModal(true)}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Post New Item
                  </button>
                </div>

                {/* User's Items */}
                <div className="space-y-4">
                  {lostFoundItems.filter(item => item.postedByUserId === 1).map((item) => (
                    <div key={item.id} className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} transition-all duration-200`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {item.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              item.type === 'LOST' 
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                              {item.type}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              item.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                              'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                            {item.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              📍 {item.location}
                            </span>
                            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(item.dateReported).toLocaleDateString()}
                            </span>
                            {item.reward && (
                              <span className={`${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                                💰 ${item.reward} reward
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className={`px-4 py-2 text-sm ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg transition-all duration-200`}>
                            Edit
                          </button>
                          <button className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Stories Tab */}
            {activeTab === 'success-stories' && (
              <div className="p-8">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>Success Stories</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      title: "Wedding Ring Reunited After 3 Days",
                      story: "Lost my grandmother's wedding ring at the gym. Someone found it and posted here. We connected and I got it back the next day!",
                      user: "Emily R.",
                      reward: "$100",
                      icon: "💍"
                    },
                    {
                      title: "Laptop Found Before Important Presentation",
                      story: "Left my laptop in the library and panicked. Someone posted it here and I contacted them immediately. Got it back just in time!",
                      user: "David K.",
                      reward: "$75",
                      icon: "💻"
                    },
                    {
                      title: "Lost Keys Returned Same Day",
                      story: "Dropped my car keys somewhere on campus. Posted here and someone had already found them! Amazing community.",
                      user: "Maria S.",
                      reward: "$25",
                      icon: "🗝️"
                    },
                    {
                      title: "Textbooks Saved My Semester",
                      story: "Lost my bag with all my textbooks for finals. A kind student found it and posted here. Saved my semester!",
                      user: "James L.",
                      reward: "$50",
                      icon: "📚"
                    }
                  ].map((story, index) => (
                    <div key={index} className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} transition-all duration-200`}>
                      <div className="flex items-start space-x-4">
                        <div className="text-3xl">{story.icon}</div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                            {story.title}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 italic`}>
                            &quot;{story.story}&quot;
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                — {story.user}
                              </p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className={`text-xs ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                                  💰 {story.reward} reward
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Post Item Modal */}
        {showPostModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Report Lost/Found Item</h2>
                <button 
                  onClick={() => setShowPostModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Type Selection */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Item Status</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setNewItemForm({...newItemForm, type: 'LOST'})}
                      className={`p-4 border-2 rounded-lg text-center font-medium transition-all duration-200 ${
                        newItemForm.type === 'LOST'
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                          : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 opacity-50'
                      }`}
                    >
                      📢 I Lost Something
                    </button>
                    <button 
                      onClick={() => setNewItemForm({...newItemForm, type: 'FOUND'})}
                      className={`p-4 border-2 rounded-lg text-center font-medium transition-all duration-200 ${
                        newItemForm.type === 'FOUND'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 opacity-50'
                      }`}
                    >
                      🎯 I Found Something
                    </button>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Item Title</label>
                    <input
                      type="text"
                      value={newItemForm.title}
                      onChange={(e) => setNewItemForm({...newItemForm, title: e.target.value})}
                      placeholder="e.g., Black iPhone 14 Pro"
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Category</label>
                    <select 
                      value={newItemForm.category}
                      onChange={(e) => setNewItemForm({...newItemForm, category: e.target.value})}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}>
                      <option value="Electronics">Electronics</option>
                      <option value="Bags & Backpacks">Bags & Backpacks</option>
                      <option value="Keys & Accessories">Keys & Accessories</option>
                      <option value="Personal Items">Personal Items</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Description</label>
                  <textarea
                    rows={4}
                    value={newItemForm.description}
                    onChange={(e) => setNewItemForm({...newItemForm, description: e.target.value})}
                    placeholder="Provide detailed description including color, brand, distinctive features..."
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Location</label>
                  <select 
                    value={newItemForm.location}
                    onChange={(e) => setNewItemForm({...newItemForm, location: e.target.value})}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}>
                    <option value="Main Library">Main Library</option>
                    <option value="Student Union">Student Union</option>
                    <option value="Engineering Building">Engineering Building</option>
                    <option value="Gym & Recreation">Gym & Recreation</option>
                    <option value="Dining Areas">Dining Areas</option>
                    <option value="Parking Lots">Parking Lots</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Photo Upload */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Photo (Optional)</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                      isDarkMode 
                        ? 'border-gray-600 hover:border-purple-500 bg-gray-700/50' 
                        : 'border-gray-300 hover:border-purple-500 bg-gray-50'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Click to upload photo</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Helps others identify your item</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
                </div>

                {/* Reward */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Reward (Optional)</label>
                  <div className="flex items-center space-x-2">
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>$</span>
                    <input
                      type="number"
                      value={newItemForm.reward || ''}
                      onChange={(e) => setNewItemForm({...newItemForm, reward: e.target.value ? parseFloat(e.target.value) : undefined})}
                      placeholder="0"
                      min="0"
                      className={`w-24 px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>for safe return</span>
                  </div>
                </div>

                {/* Privacy Options */}
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>Contact Preferences</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="contact" 
                        value="DIRECT" 
                        checked={newItemForm.contactMethod === 'DIRECT'}
                        onChange={(e) => setNewItemForm({...newItemForm, contactMethod: e.target.value as 'DIRECT' | 'ANONYMOUS'})}
                        className="mr-3" 
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Allow direct contact</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="contact" 
                        value="ANONYMOUS" 
                        checked={newItemForm.contactMethod === 'ANONYMOUS'}
                        onChange={(e) => setNewItemForm({...newItemForm, contactMethod: e.target.value as 'DIRECT' | 'ANONYMOUS'})}
                        className="mr-3" 
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Anonymous contact only</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowPostModal(false)}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handlePostItem}
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Post Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Modal */}
        {showContactModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Contact Owner</h2>
                <button 
                  onClick={() => setShowContactModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                  {selectedItem.title}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  {selectedItem.contactMethod === 'anonymous' 
                    ? 'This user prefers anonymous contact. Your message will be forwarded securely.'
                    : `Contact ${selectedItem.postedBy} directly about this item.`
                  }
                </p>

                <div className="space-y-3">
                  <button className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Send Message
                  </button>
                  
                  {selectedItem.contactMethod === 'direct' && (
                    <button className={`w-full px-6 py-3 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg font-medium transition-all duration-200 flex items-center justify-center`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Call Directly
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}