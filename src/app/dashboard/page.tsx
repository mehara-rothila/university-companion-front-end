'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import Navigation from '@/components/Navigation'; // <-- Added import
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

interface AIRecommendation {
  id: string;
  type: 'study' | 'wellness' | 'social' | 'academic' | 'location';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionText: string;
  actionUrl: string;
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
  const [userName] = useState('Mehara'); // This would come from user context
  const [isLoading, setIsLoading] = useState(true);
  const [wellnessCheckIn, setWellnessCheckIn] = useState<WellnessCheckIn>({
    mood: null,
    energy: 5,
    sleep: 7,
    notes: ''
  });
  const [showWellnessModal, setShowWellnessModal] = useState(false);

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
      title: 'Physics Quiz Completed',
      description: 'Scored 87% on Modern Physics fundamentals',
      timestamp: '2 hours ago',
      completed: true
    },
    {
      id: '2',
      type: 'study',
      title: 'Study Space Booked',
      description: 'Reserved quiet study room in Library Level 3',
      timestamp: '4 hours ago',
      completed: true
    },
    {
      id: '3',
      type: 'wellness',
      title: 'Wellness Check-in',
      description: 'Completed daily mood tracking',
      timestamp: 'Yesterday',
      completed: true
    },
    {
      id: '4',
      type: 'navigation',
      title: 'Campus Navigation Used',
      description: 'Found optimal route to Chemistry Building',
      timestamp: 'Yesterday',
      completed: true
    }
  ]);

  const [aiRecommendations] = useState<AIRecommendation[]>([
    {
      id: '1',
      type: 'study',
      title: 'Optimal Study Time Detected',
      description: 'Based on your patterns, you focus best between 2-4 PM. Library quiet zones are less crowded now.',
      priority: 'high',
      actionText: 'Find Study Space',
      actionUrl: '/study-spaces'
    },
    {
      id: '2',
      type: 'wellness',
      title: 'Stress Level Alert',
      description: 'Your usage patterns suggest increased stress. Consider taking a wellness break or visiting the counseling center.',
      priority: 'high',
      actionText: 'View Wellness Resources',
      actionUrl: '/wellness'
    },
    {
      id: '3',
      type: 'academic',
      title: 'Assignment Deadline Approaching',
      description: 'Physics lab report due in 3 days. AI suggests starting with data analysis section first.',
      priority: 'medium',
      actionText: 'Open Academic Hub',
      actionUrl: '/academic'
    },
    {
      id: '4',
      type: 'location',
      title: 'Campus Event Nearby',
      description: 'Tech Talk: "AI in Healthcare" starting in Student Union in 30 minutes. Matches your interests.',
      priority: 'medium',
      actionText: 'Get Directions',
      actionUrl: '/navigation'
    }
  ]);

  const [campusUpdates] = useState<CampusUpdate[]>([
    {
      id: '1',
      title: 'Library Hours Extended',
      description: 'Main library now open 24/7 during finals week',
      type: 'announcement',
      timestamp: '3 hours ago'
    },
    {
      id: '2',
      title: 'Cafeteria Menu Update',
      description: 'New healthy options available in the North dining hall',
      type: 'event',
      timestamp: '6 hours ago'
    },
    {
      id: '3',
      title: 'Network Maintenance',
      description: 'WiFi may be intermittent in Engineering building today 2-4 PM',
      type: 'maintenance',
      timestamp: '8 hours ago'
    }
  ]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1500);
    
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
    // Here you would typically send the data to your API
    console.log('Wellness check-in submitted:', wellnessCheckIn);
    setShowWellnessModal(false);
    // Show success message or update UI accordingly
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 flex items-center justify-center`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
        
        <AnimatedBackground variant="dashboard" />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          
          {/* Welcome Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                  {getGreeting()}, {userName}! 👋
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
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.25C13.83 15.932 18 12.813 18 8.25a6.75 6.75 0 1 0-13.5 0c0 4.563 4.17 7.682 6 10z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z" />
                  </svg>
                  Emergency
                </button>
                <Link href="/wellness" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Wellness Support
                </Link>
              </div>
            </div>
          </div>

          {/* Top Row - Weather, Wellness Check-in */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Weather & Campus Info */}
            <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
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

            {/* AI Wellness Check-in */}
            <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in md:col-span-2`} style={{ animationDelay: '0.1s' }}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Daily Wellness Check-in
              </h3>
              
              {wellnessCheckIn.mood ? (
                <div className={`p-4 rounded-lg ${getMoodConfig(wellnessCheckIn.mood).bgColor} ${getMoodConfig(wellnessCheckIn.mood).borderColor} border`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`${getMoodConfig(wellnessCheckIn.mood).color} mr-2`}>
                        {getMoodConfig(wellnessCheckIn.mood).icon}
                      </div>
                      <span className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        Feeling {wellnessCheckIn.mood} today
                      </span>
                    </div>
                    <button 
                      onClick={() => setShowWellnessModal(true)}
                      className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                    >
                      Update
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    How are you feeling today? AI wellness tracking helps personalize your campus experience.
                  </p>
                  <button 
                    onClick={() => setShowWellnessModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Complete Check-in
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { 
                title: 'AI Assistant', 
                url: '/chatbot', 
                color: 'from-blue-500 to-blue-600',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                )
              },
              { 
                title: 'Study Spaces', 
                url: '/study-spaces', 
                color: 'from-green-500 to-green-600',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )
              },
              { 
                title: 'Navigation', 
                url: '/navigation', 
                color: 'from-purple-500 to-purple-600',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )
              },
              { 
                title: 'Academic Hub', 
                url: '/academic', 
                color: 'from-orange-500 to-orange-600',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l6 6m0-6l-6 6m6-6H4" />
                  </svg>
                )
              }
            ].map((action, index) => (
              <Link 
                key={action.title}
                href={action.url}
                className={`bg-gradient-to-r ${action.color} text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in`}
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="flex flex-col items-center text-center">
                  {action.icon}
                  <span className="mt-2 text-sm font-medium">{action.title}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* AI Recommendations */}
            <div className={`lg:col-span-2 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`} style={{ animationDelay: '0.6s' }}>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6 flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                AI Recommendations
              </h3>
              
              <div className="space-y-4">
                {aiRecommendations.map((rec, index) => (
                  <div 
                    key={rec.id} 
                    className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} border transition-all duration-300 hover:shadow-md animate-fade-in`}
                    style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            rec.priority === 'high' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                              : rec.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {rec.priority.toUpperCase()}
                          </span>
                        </div>
                        <h4 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                          {rec.title}
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                          {rec.description}
                        </p>
                        <Link 
                          href={rec.actionUrl}
                          className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium transition-colors duration-200 flex items-center"
                        >
                          {rec.actionText}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              
              {/* Recent Activities */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`} style={{ animationDelay: '0.8s' }}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Recent Activities
                </h3>
                
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => (
                    <div key={activity.id} className="flex items-start animate-fade-in" style={{ animationDelay: `${0.9 + index * 0.1}s` }}>
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
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`} style={{ animationDelay: '1.0s' }}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  Campus Updates
                </h3>
                
                <div className="space-y-3">
                  {campusUpdates.map((update, index) => (
                    <div key={update.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'} animate-fade-in`} style={{ animationDelay: `${1.1 + index * 0.1}s` }}>
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

        {/* Wellness Check-in Modal */}
        {showWellnessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Daily Wellness Check-in
                </h2>
                <button 
                  onClick={() => setShowWellnessModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Mood Selection */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                    How are you feeling today?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'excellent', label: 'Excellent' },
                      { key: 'good', label: 'Good' },
                      { key: 'okay', label: 'Okay' },
                      { key: 'stressed', label: 'Stressed' },
                      { key: 'overwhelmed', label: 'Overwhelmed' }
                    ].map((mood) => (
                      <button
                        key={mood.key}
                        onClick={() => setWellnessCheckIn(prev => ({ ...prev, mood: mood.key as any }))}
                        className={`p-3 rounded-lg text-center transition-all duration-200 ${
                          wellnessCheckIn.mood === mood.key
                            ? 'bg-purple-100 border-2 border-purple-500 text-purple-700 dark:bg-purple-900/30 dark:border-purple-400 dark:text-purple-300'
                            : `${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'} border-2`
                        }`}
                      >
                        <div className="text-2xl mb-1">{getMoodConfig(mood.key).icon}</div>
                        <div className="text-xs font-medium">{mood.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy Level */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Energy Level: {wellnessCheckIn.energy}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={wellnessCheckIn.energy}
                    onChange={(e) => setWellnessCheckIn(prev => ({ ...prev, energy: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                {/* Sleep Quality */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Sleep Quality: {wellnessCheckIn.sleep}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={wellnessCheckIn.sleep}
                    onChange={(e) => setWellnessCheckIn(prev => ({ ...prev, sleep: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Anything you'd like to share? (Optional)
                  </label>
                  <textarea
                    value={wellnessCheckIn.notes}
                    onChange={(e) => setWellnessCheckIn(prev => ({ ...prev, notes: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                    rows={3}
                    placeholder="How can we help you today?"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleWellnessSubmit}
                  disabled={!wellnessCheckIn.mood}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    wellnessCheckIn.mood 
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                  }`}
                >
                  Complete Check-in
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}