'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

// --- Interfaces ---
interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
}

interface WellnessCheckIn {
  mood: 'excellent' | 'good' | 'okay' | 'stressed' | 'overwhelmed' | null;
  energy: number;
  sleep: number;
  notes: string;
}

interface ActivityItem {
  id: string;
  type: 'study' | 'quiz' | 'wellness' | 'navigation' | 'social';
  title: string;
  description: string;
  timestamp: string;
  completed?: boolean;
}

interface CampusUpdate {
  id: string;
  title: string;
  description: string;
  type: 'event' | 'announcement' | 'alert' | 'maintenance';
  timestamp: string;
  urgent?: boolean;
}

export default function Dashboard() {
  const { isDarkMode } = useDarkMode();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName] = useState('Mehara');
  const [wellnessCheckIn, setWellnessCheckIn] = useState<WellnessCheckIn>({
    mood: null,
    energy: 5,
    sleep: 7,
    notes: ''
  });
  const [showWellnessModal, setShowWellnessModal] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');

  // Mock data - in real app, this would come from APIs
  const [weatherData] = useState<WeatherData>({
    temperature: 24,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12
  });

  const [recentActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'quiz',
      title: 'Welcome to UoM Smart Campus',
      description: 'Explore the available features and stay tuned for more',
      timestamp: '2 hours ago',
      completed: true
    },
    {
      id: '2',
      type: 'study',
      title: 'Lost & Found Available',
      description: 'You can now report and search for lost items',
      timestamp: '4 hours ago',
      completed: true
    },
    {
      id: '3',
      type: 'wellness',
      title: 'Financial Aid Portal Active',
      description: 'Apply for scholarships and community support',
      timestamp: 'Yesterday',
      completed: true
    },
    {
      id: '4',
      type: 'navigation',
      title: 'Profile Management Ready',
      description: 'Update your personal information and preferences',
      timestamp: 'Yesterday',
      completed: true
    }
  ]);

  const [campusUpdates] = useState<CampusUpdate[]>([
    {
      id: '1',
      title: 'Platform Launch',
      description: 'UoM Smart Campus platform is now live with initial features',
      type: 'announcement',
      timestamp: '3 hours ago'
    },
    {
      id: '2',
      title: 'More Features Coming',
      description: 'AI Assistant, Study Spaces, and Campus Navigation launching soon',
      type: 'event',
      timestamp: '6 hours ago'
    },
    {
      id: '3',
      title: 'System Updates',
      description: 'Regular updates will bring new features and improvements',
      type: 'maintenance',
      timestamp: '8 hours ago'
    }
  ]);

  // Active features list
  const activeFeatures = ['lost-found', 'financial-aid', 'profile'];

  // Handle coming soon click
  const handleComingSoonClick = (featureName: string) => {
    setComingSoonFeature(featureName);
    setShowComingSoonModal(true);
  };

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get mood color and icon
  const getMoodConfig = (mood: string | null) => {
    switch (mood) {
      case 'excellent':
        return { 
          color: 'text-green-500', 
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'good':
        return { 
          color: 'text-blue-500', 
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          borderColor: 'border-blue-200 dark:border-blue-800',
          icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'okay':
        return { 
          color: 'text-yellow-500', 
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'stressed':
        return { 
          color: 'text-orange-500', 
          bgColor: 'bg-orange-100 dark:bg-orange-900/30',
          borderColor: 'border-orange-200 dark:border-orange-800',
          icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'overwhelmed':
        return { 
          color: 'text-red-500', 
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          borderColor: 'border-red-200 dark:border-red-800',
          icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      default:
        return { 
          color: 'text-gray-500', 
          bgColor: 'bg-gray-100 dark:bg-gray-700',
          borderColor: 'border-gray-200 dark:border-gray-600',
          icon: (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
    }
  };

  const handleWellnessSubmit = () => {
    console.log('Wellness check-in submitted:', wellnessCheckIn);
    setShowWellnessModal(false);
  };

  return (
    <>
      <Navigation />
      <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
        
        <AnimatedBackground variant="dashboard" />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                  {getGreeting()}, {userName}!
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              {/* Emergency Quick Access */}
              <div className="mt-4 md:mt-0 flex space-x-3">
                <button 
                  onClick={() => handleComingSoonClick('Emergency Services')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.25C13.83 15.932 18 12.813 18 8.25a6.75 6.75 0 1 0-13.5 0c0 4.563 4.17 7.682 6 10z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z" />
                  </svg>
                  Emergency
                </button>
                <button 
                  onClick={() => handleComingSoonClick('Wellness Support')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Wellness Support
                </button>
              </div>
            </div>
          </div>

          {/* Top Row - Weather, Wellness Check-in */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Weather & Campus Info */}
            <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.002 4.002 0 003 15z" />
                </svg>
                Campus Weather
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {weatherData.temperature}°C
                  </span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {weatherData.condition}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>Humidity: {weatherData.humidity}%</span>
                  </div>
                  <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>Wind: {weatherData.windSpeed} km/h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wellness Check-in */}
            <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm md:col-span-2`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Daily Wellness Check-in
                <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-full">
                  Coming Soon
                </span>
              </h3>
              
              <div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  Wellness tracking and mood monitoring will be available soon to help personalize your campus experience.
                </p>
                <button 
                  onClick={() => handleComingSoonClick('Wellness Check-in')}
                  className="px-4 py-2 bg-gray-400 text-gray-600 rounded-lg font-medium cursor-not-allowed flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="space-y-8 mb-8">
            {/* Primary Actions */}
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { 
                    title: 'AI Assistant', 
                    url: '/chatbot', 
                    color: 'from-blue-500/20 to-blue-600/20',
                    borderColor: 'border-blue-400/30',
                    iconColor: 'text-blue-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                      </svg>
                    )
                  },
                  { 
                    title: 'Study Spaces', 
                    url: '/study-spaces', 
                    color: 'from-emerald-500/20 to-emerald-600/20',
                    borderColor: 'border-emerald-400/30',
                    iconColor: 'text-emerald-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                      </svg>
                    )
                  },
                  { 
                    title: 'Campus Navigation', 
                    url: '/navigation', 
                    color: 'from-purple-500/20 to-purple-600/20',
                    borderColor: 'border-purple-400/30',
                    iconColor: 'text-purple-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    )
                  },
                  { 
                    title: 'Academic Hub', 
                    url: '/academic', 
                    color: 'from-orange-500/20 to-orange-600/20',
                    borderColor: 'border-orange-400/30',
                    iconColor: 'text-orange-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443a55.381 55.381 0 015.25 2.882V15" />
                      </svg>
                    )
                  }
                ].map((action) => {
                  const isActive = activeFeatures.includes(action.url.replace('/', ''));
                  
                  if (isActive) {
                    return (
                      <Link
                        key={action.title}
                        href={action.url}
                        className={`relative group bg-gradient-to-br ${action.color} backdrop-blur-lg border ${action.borderColor} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1`}
                      >
                        <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex flex-col items-center text-center space-y-3">
                          <div className={`${action.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                            {action.icon}
                          </div>
                          <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
                            {action.title}
                          </span>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 rounded-full shadow-lg border border-green-400/30 font-medium">
                          Available
                        </div>
                      </Link>
                    );
                  }
                  
                  return (
                    <button
                      key={action.title}
                      onClick={() => handleComingSoonClick(action.title)}
                      className={`relative group bg-gradient-to-br ${action.color} backdrop-blur-lg border ${action.borderColor} p-6 rounded-2xl shadow-lg opacity-75 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1`}
                    >
                      <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex flex-col items-center text-center space-y-3">
                        <div className={`${action.iconColor} opacity-60 transition-transform duration-300 group-hover:scale-110`}>
                          {action.icon}
                        </div>
                        <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>
                          {action.title}
                        </span>
                      </div>
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs px-2 py-1 rounded-full shadow-lg border border-amber-400/30 font-medium">
                        Coming Soon
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campus Services */}
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                Campus Services
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { 
                    title: 'Notifications', 
                    url: '/notifications', 
                    color: 'from-red-500/20 to-red-600/20',
                    borderColor: 'border-red-400/30',
                    iconColor: 'text-red-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                      </svg>
                    )
                  },
                  { 
                    title: 'Social & Events', 
                    url: '/social', 
                    color: 'from-pink-500/20 to-pink-600/20',
                    borderColor: 'border-pink-400/30',
                    iconColor: 'text-pink-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    )
                  },
                  { 
                    title: 'Dining', 
                    url: '/dining', 
                    color: 'from-amber-500/20 to-amber-600/20',
                    borderColor: 'border-amber-400/30',
                    iconColor: 'text-amber-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.125-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265zm-3 0a.375.375 0 11-.53 0L9 2.845l.265.265zm6 0a.375.375 0 11-.53 0L15 2.845l.265.265z" />
                      </svg>
                    )
                  },
                  { 
                    title: 'Wellness', 
                    url: '/wellness', 
                    color: 'from-teal-500/20 to-teal-600/20',
                    borderColor: 'border-teal-400/30',
                    iconColor: 'text-teal-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    )
                  },
                  { 
                    title: 'Lost & Found', 
                    url: '/lost-found', 
                    color: 'from-indigo-500/20 to-indigo-600/20',
                    borderColor: 'border-indigo-400/30',
                    iconColor: 'text-indigo-400',
                    isActive: true,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                    )
                  },
                  { 
                    title: 'Library', 
                    url: '/library', 
                    color: 'from-emerald-500/20 to-emerald-600/20',
                    borderColor: 'border-emerald-400/30',
                    iconColor: 'text-emerald-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    )
                  }
                ].map((action) => {
                  const isActive = activeFeatures.includes(action.url.replace('/', ''));
                  
                  if (isActive) {
                    return (
                      <Link
                        key={action.title}
                        href={action.url}
                        className={`relative group bg-gradient-to-br ${action.color} backdrop-blur-lg border ${action.borderColor} p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5`}
                      >
                        <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex flex-col items-center text-center space-y-2">
                          <div className={`${action.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                            {action.icon}
                          </div>
                          <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {action.title}
                          </span>
                        </div>
                        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-1.5 py-0.5 rounded-full shadow-lg border border-green-400/30 font-medium">
                          ✓
                        </div>
                      </Link>
                    );
                  }
                  
                  return (
                    <button
                      key={action.title}
                      onClick={() => handleComingSoonClick(action.title)}
                      className={`relative group bg-gradient-to-br ${action.color} backdrop-blur-lg border ${action.borderColor} p-4 rounded-xl shadow-md opacity-75 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5`}
                    >
                      <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex flex-col items-center text-center space-y-2">
                        <div className={`${action.iconColor} opacity-60 transition-transform duration-300 group-hover:scale-110`}>
                          {action.icon}
                        </div>
                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {action.title}
                        </span>
                      </div>
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs px-1.5 py-0.5 rounded-full shadow-lg border border-amber-400/30 font-medium">
                        Soon
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Services */}
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                Additional Services
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { 
                    title: 'Career Services', 
                    url: '/career', 
                    color: 'from-violet-500/20 to-violet-600/20',
                    borderColor: 'border-violet-400/30',
                    iconColor: 'text-violet-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                      </svg>
                    )
                  },
                  { 
                    title: 'Financial Aid', 
                    url: '/financial-aid', 
                    color: 'from-amber-500/20 to-amber-600/20',
                    borderColor: 'border-amber-400/30',
                    iconColor: 'text-amber-400',
                    isActive: true,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )
                  },
                  { 
                    title: 'Challenges', 
                    url: '/challenges', 
                    color: 'from-rose-500/20 to-rose-600/20',
                    borderColor: 'border-rose-400/30',
                    iconColor: 'text-rose-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                      </svg>
                    )
                  },
                  { 
                    title: 'Profile', 
                    url: '/profile', 
                    color: 'from-slate-500/20 to-slate-600/20',
                    borderColor: 'border-slate-400/30',
                    iconColor: 'text-slate-400',
                    isActive: true,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )
                  },
                  { 
                    title: 'Help & Support', 
                    url: '/help', 
                    color: 'from-cyan-500/20 to-cyan-600/20',
                    borderColor: 'border-cyan-400/30',
                    iconColor: 'text-cyan-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                      </svg>
                    )
                  }
                ].map((action) => {
                  const isActive = activeFeatures.includes(action.url.replace('/', ''));
                  
                  if (isActive) {
                    return (
                      <Link
                        key={action.title}
                        href={action.url}
                        className={`relative group bg-gradient-to-br ${action.color} backdrop-blur-lg border ${action.borderColor} p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5`}
                      >
                        <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex flex-col items-center text-center space-y-2">
                          <div className={`${action.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                            {action.icon}
                          </div>
                          <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} leading-tight`}>
                            {action.title}
                          </span>
                        </div>
                        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-1.5 py-0.5 rounded-full shadow-lg border border-green-400/30 font-medium">
                          ✓
                        </div>
                      </Link>
                    );
                  }
                  
                  return (
                    <button
                      key={action.title}
                      onClick={() => handleComingSoonClick(action.title)}
                      className={`relative group bg-gradient-to-br ${action.color} backdrop-blur-lg border ${action.borderColor} p-4 rounded-xl shadow-md opacity-75 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5`}
                    >
                      <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex flex-col items-center text-center space-y-2">
                        <div className={`${action.iconColor} opacity-60 transition-transform duration-300 group-hover:scale-110`}>
                          {action.icon}
                        </div>
                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} leading-tight`}>
                          {action.title}
                        </span>
                      </div>
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs px-1.5 py-0.5 rounded-full shadow-lg border border-amber-400/30 font-medium">
                        Soon
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Platform Status */}
            <div className={`lg:col-span-2 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6 flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Platform Status & Development
              </h3>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                      Now Available
                    </h4>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-700'} mb-2`}>
                    Core platform features are now live and ready to use.
                  </p>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    ✓ Lost & Found System • ✓ Financial Aid Portal • ✓ Profile Management
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                      Coming Soon - Phase 1
                    </h4>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-amber-400' : 'text-amber-700'} mb-2`}>
                    Smart features launching in the next few weeks.
                  </p>
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    🤖 AI Assistant • 📚 Study Spaces • 🗺️ Campus Navigation
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                      Coming Soon - Phase 2
                    </h4>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'} mb-2`}>
                    Enhanced campus services and community features.
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    🍽️ Dining Services • 💚 Wellness Hub • 📱 Social & Events • 📚 Library Integration
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              
              {/* Recent Activities */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Platform Updates
                </h3>
                
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${
                        activity.type === 'quiz' ? 'bg-purple-500' :
                        activity.type === 'study' ? 'bg-green-500' :
                        activity.type === 'wellness' ? 'bg-blue-500' :
                        activity.type === 'navigation' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`}></div>
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {activity.title}
                        </h4>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                          {activity.description}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campus Updates */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  Development News
                </h3>
                
                <div className="space-y-3">
                  {campusUpdates.map((update) => (
                    <div key={update.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {update.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          update.type === 'alert' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          update.type === 'event' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          update.type === 'maintenance' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {update.type}
                        </span>
                      </div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                        {update.description}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {update.timestamp}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Modal */}
        {showComingSoonModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Coming Soon
                </h2>
                <button 
                  onClick={() => setShowComingSoonModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                  {comingSoonFeature}
                </h3>
                
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  This feature is currently under development and will be available soon. We are working hard to bring you the best campus experience possible.
                </p>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'} mb-6`}>
                  <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} font-medium mb-2`}>
                    Currently Available:
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className={`${isDarkMode ? 'text-blue-400' : 'text-blue-700'} flex items-center`}>
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Lost & Found System
                    </div>
                    <div className={`${isDarkMode ? 'text-blue-400' : 'text-blue-700'} flex items-center`}>
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Financial Aid Portal
                    </div>
                    <div className={`${isDarkMode ? 'text-blue-400' : 'text-blue-700'} flex items-center`}>
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Profile Management
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowComingSoonModal(false)}
                  className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Got it, thanks!
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}