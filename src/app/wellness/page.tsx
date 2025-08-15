// src/app/wellness/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

// --- Interfaces ---
interface MoodEntry {
  id: string;
  date: Date;
  mood: 'very-happy' | 'happy' | 'neutral' | 'sad' | 'very-sad';
  energy: number; // 1-10
  stress: number; // 1-10
  sleep: number; // hours
  notes?: string;
  tags: string[];
}

interface WellnessResource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'exercise' | 'meditation' | 'counseling' | 'crisis';
  duration?: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  isRecommended?: boolean;
  isFavorite?: boolean;
  url?: string;
}

interface CheckInQuestion {
  id: string;
  text: string;
  type: 'scale' | 'multiple-choice' | 'text';
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  required: boolean;
}

interface WellnessGoal {
  id: string;
  title: string;
  description: string;
  type: 'meditation' | 'exercise' | 'sleep' | 'mood' | 'stress';
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  status: 'active' | 'completed' | 'paused';
}

interface AIRecommendation {
  id: string;
  type: 'resource' | 'activity' | 'appointment' | 'emergency';
  title: string;
  description: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  action: string;
}

export default function WellnessPage() {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [currentMood, setCurrentMood] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  const [moodEntries] = useState<MoodEntry[]>([
    {
      id: '1',
      date: new Date(),
      mood: 'neutral',
      energy: 6,
      stress: 7,
      sleep: 6,
      notes: 'Feeling okay but a bit stressed about upcoming exams',
      tags: ['exams', 'academic stress']
    },
    {
      id: '2',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      mood: 'happy',
      energy: 8,
      stress: 4,
      sleep: 8,
      notes: 'Had a great day, spent time with friends',
      tags: ['social', 'positive']
    }
  ]);

  const [wellnessResources] = useState<WellnessResource[]>([
    {
      id: '1',
      title: '5-Minute Stress Relief Meditation',
      type: 'meditation',
      duration: '5 min',
      description: 'Quick meditation to reduce stress and anxiety, perfect for between classes.',
      category: 'Stress Management',
      difficulty: 'beginner',
      rating: 4.8,
      isRecommended: true
    },
    {
      id: '2',
      title: 'Understanding Academic Anxiety',
      type: 'article',
      duration: '10 min read',
      description: 'Learn about common causes of academic anxiety and practical coping strategies.',
      category: 'Mental Health',
      difficulty: 'beginner',
      rating: 4.6
    },
    {
      id: '3',
      title: 'Progressive Muscle Relaxation',
      type: 'exercise',
      duration: '15 min',
      description: 'Physical technique to release tension and promote relaxation.',
      category: 'Stress Relief',
      difficulty: 'beginner',
      rating: 4.7,
      isRecommended: true
    },
    {
      id: '4',
      title: 'Crisis Counseling Services',
      type: 'crisis',
      description: '24/7 professional support for students experiencing mental health crises.',
      category: 'Emergency Support',
      difficulty: 'beginner',
      rating: 5.0
    }
  ]);

  const [wellnessGoals] = useState<WellnessGoal[]>([
    {
      id: '1',
      title: 'Daily Meditation',
      description: 'Practice meditation for at least 10 minutes daily',
      type: 'meditation',
      target: 10,
      current: 7,
      unit: 'days this week',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      id: '2',
      title: 'Adequate Sleep',
      description: 'Get 7-8 hours of sleep nightly',
      type: 'sleep',
      target: 8,
      current: 6.5,
      unit: 'hours avg',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active'
    }
  ]);

  const [aiRecommendations] = useState<AIRecommendation[]>([
    {
      id: '1',
      type: 'activity',
      title: 'Take a Mindful Break',
      description: 'AI detected elevated stress patterns. A 5-minute breathing exercise could help.',
      confidence: 89,
      urgency: 'medium',
      action: 'Start breathing exercise'
    },
    {
      id: '2',
      type: 'resource',
      title: 'Sleep Hygiene Tips',
      description: 'Your sleep data suggests irregular patterns. Consider our sleep improvement guide.',
      confidence: 76,
      urgency: 'low',
      action: 'View sleep resources'
    }
  ]);

  const checkInQuestions: CheckInQuestion[] = [
    {
      id: '1',
      text: 'How are you feeling right now?',
      type: 'multiple-choice',
      options: ['Very Happy', 'Happy', 'Neutral', 'Sad', 'Very Sad'],
      required: true
    },
    {
      id: '2',
      text: 'Rate your stress level (1-10)',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      required: true
    },
    {
      id: '3',
      text: 'Rate your energy level (1-10)',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
      required: true
    },
    {
      id: '4',
      text: 'How many hours did you sleep last night?',
      type: 'scale',
      scaleMin: 0,
      scaleMax: 12,
      required: false
    }
  ];

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  // Get mood emoji
  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'very-happy': return '😄';
      case 'happy': return '😊';
      case 'neutral': return '😐';
      case 'sad': return '😞';
      case 'very-sad': return '😢';
      default: return '😐';
    }
  };

  // Get mood color
  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'very-happy': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'happy': return 'text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'neutral': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'sad': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
      case 'very-sad': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Calculate wellness score
  const calculateWellnessScore = () => {
    if (moodEntries.length === 0) return 0;
    const recent = moodEntries.slice(0, 7); // Last 7 entries
    const avgMood = recent.reduce((sum, entry) => {
      const moodScore = {
        'very-sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very-happy': 5
      }[entry.mood] || 3;
      return sum + moodScore;
    }, 0) / recent.length;
    
    const avgEnergy = recent.reduce((sum, entry) => sum + entry.energy, 0) / recent.length;
    const avgStress = recent.reduce((sum, entry) => sum + (10 - entry.stress), 0) / recent.length;
    const avgSleep = recent.reduce((sum, entry) => sum + Math.min(entry.sleep / 8, 1) * 10, 0) / recent.length;
    
    return Math.round(((avgMood * 20) + (avgEnergy * 10) + (avgStress * 10) + (avgSleep * 10)) / 4);
  };

  const tabs = [
    { id: 'dashboard', name: 'Wellness Dashboard', icon: '📊' },
    { id: 'check-in', name: 'AI Check-In', icon: '🤖' },
    { id: 'resources', name: 'Resources', icon: '📚' },
    { id: 'goals', name: 'Goals & Progress', icon: '🎯' },
    { id: 'support', name: 'Get Support', icon: '🤝' }
  ];

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 flex items-center justify-center`}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading your wellness data...</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="text-center">
              <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center justify-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Health & Wellness Center
              </h1>
              <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto mb-6`}>
                AI-powered mental health support and wellness tracking to help you thrive academically and personally.
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => setShowCheckInModal(true)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Daily Check-In
                </button>
                
                <button 
                  onClick={() => setShowEmergencyModal(true)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Crisis Support
                </button>

                <Link 
                  href="/academic"
                  className={`px-6 py-3 ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-blue-200' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'} rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l6 6m0-6l-6 6m6-6H4" />
                  </svg>
                  Academic Balance
                </Link>
              </div>
            </div>
          </div>

          {/* Wellness Score & Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'} text-center animate-fade-in`}>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {calculateWellnessScore()}%
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>Wellness Score</div>
            </div>
            
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'} text-center animate-fade-in`}>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {moodEntries.length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Check-ins This Week</div>
            </div>
            
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'} text-center animate-fade-in`}>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {wellnessGoals.filter(g => g.status === 'active').length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>Active Goals</div>
            </div>
            
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'} text-center animate-fade-in`}>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                24/7
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>Crisis Support</div>
            </div>
          </div>

          {/* AI Recommendations */}
          {aiRecommendations.length > 0 && (
            <div className={`mb-8 ${isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} rounded-2xl p-6 border animate-fade-in`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-800'} mb-4 flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                AI Wellness Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiRecommendations.map((rec) => (
                  <div key={rec.id} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{rec.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(rec.urgency)}`}>
                        {rec.urgency}
                      </span>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>{rec.description}</p>
                    <button className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
                      {rec.action} →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm mb-6 animate-fade-in`}>
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-0 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600 dark:text-green-400'
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

          {/* Tab Content */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm animate-fade-in`}>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Mood Tracking */}
                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                      Recent Mood Tracking
                    </h3>
                    
                    <div className="space-y-4">
                      {moodEntries.slice(0, 5).map((entry) => (
                        <div key={entry.id} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600/50' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                              <div>
                                <span className={`text-sm font-medium px-2 py-1 rounded-full ${getMoodColor(entry.mood)}`}>
                                  {entry.mood.replace('-', ' ')}
                                </span>
                              </div>
                            </div>
                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {entry.date.toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div className="text-center">
                              <div className={`text-lg font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                {entry.energy}/10
                              </div>
                              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Energy</div>
                            </div>
                            <div className="text-center">
                              <div className={`text-lg font-bold ${entry.stress > 7 ? 'text-red-500' : entry.stress > 4 ? 'text-yellow-500' : 'text-green-500'}`}>
                                {entry.stress}/10
                              </div>
                              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stress</div>
                            </div>
                            <div className="text-center">
                              <div className={`text-lg font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                {entry.sleep}h
                              </div>
                              <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sleep</div>
                            </div>
                          </div>
                          
                          {entry.notes && (
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} italic`}>
                              "{entry.notes}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Goals Progress */}
                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                      Wellness Goals Progress
                    </h3>
                    
                    <div className="space-y-6">
                      {wellnessGoals.map((goal) => (
                        <div key={goal.id} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600/50' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {goal.title}
                            </h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              goal.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                              goal.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {goal.status}
                            </span>
                          </div>
                          
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                            {goal.description}
                          </p>
                          
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Progress
                              </span>
                              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                {goal.current}/{goal.target} {goal.unit}
                              </span>
                            </div>
                            <div className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2`}>
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  goal.type === 'meditation' ? 'bg-purple-500' :
                                  goal.type === 'sleep' ? 'bg-blue-500' :
                                  goal.type === 'exercise' ? 'bg-green-500' :
                                  'bg-orange-500'
                                }`}
                                style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Due: {goal.deadline.toLocaleDateString()}
                            </span>
                            <button className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium">
                              Update Progress
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="p-8">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                  Wellness Resources
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wellnessResources.map((resource) => (
                    <div key={resource.id} className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} transition-all duration-200 hover:shadow-md`}>
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            resource.type === 'meditation' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                            resource.type === 'exercise' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            resource.type === 'article' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            resource.type === 'crisis' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {resource.type}
                          </span>
                          {resource.isRecommended && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                              🤖 AI Recommended
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {resource.rating}
                          </span>
                        </div>
                      </div>

                      <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                        {resource.title}
                      </h3>
                      
                      {resource.duration && (
                        <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mb-2`}>
                          ⏱️ {resource.duration}
                        </p>
                      )}
                      
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                        {resource.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          resource.difficulty === 'beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          resource.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {resource.difficulty}
                        </span>
                        
                        <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200">
                          {resource.type === 'crisis' ? 'Get Help Now' : 'Start Session'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Check-In Modal */}
        {showCheckInModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Daily Wellness Check-In</h2>
                <button 
                  onClick={() => setShowCheckInModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {checkInQuestions.map((question, index) => (
                  <div key={question.id}>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                      {index + 1}. {question.text}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {question.type === 'multiple-choice' && (
                      <div className="space-y-2">
                        {question.options?.map((option, optIndex) => (
                          <label key={optIndex} className="flex items-center">
                            <input 
                              type="radio" 
                              name={question.id} 
                              value={option}
                              className="mr-3 text-green-600"
                              onChange={(e) => question.id === '1' && setCurrentMood(e.target.value)}
                            />
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {option} {question.id === '1' && getMoodEmoji(option.toLowerCase().replace(' ', '-'))}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {question.type === 'scale' && (
                      <div>
                        <input 
                          type="range" 
                          min={question.scaleMin} 
                          max={question.scaleMax}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>{question.scaleMin}</span>
                          <span>{question.scaleMax}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Any additional notes? (Optional)
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="How are you feeling today? Any specific concerns or highlights?"
                    className={`w-full px-3 py-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowCheckInModal(false)}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Skip Today
                  </button>
                  <button 
                    onClick={() => {
                      setShowCheckInModal(false);
                      // In real app, would save the check-in data
                    }}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Complete Check-In
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Support Modal */}
        {showEmergencyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                  Crisis Support Resources
                </h2>
                
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  If you're experiencing a mental health crisis, please reach out for help immediately. You're not alone.
                </p>

                <div className="space-y-3">
                  <button className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                    🚨 Emergency Services (911)
                  </button>
                  
                  <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                    📞 Crisis Counseling (24/7)
                  </button>
                  
                  <button className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                    💬 Text Crisis Support
                  </button>
                  
                  <button className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                    🏥 Campus Health Center
                  </button>
                </div>

                <button 
                  onClick={() => setShowEmergencyModal(false)}
                  className={`mt-6 px-6 py-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg font-medium transition-all duration-200`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}