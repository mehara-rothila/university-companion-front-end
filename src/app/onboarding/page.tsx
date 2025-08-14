// src/app/onboarding/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/app/context/DarkModeContext';
import AnimatedBackground from '@/components/AnimatedBackground';
import Link from 'next/link';

interface OnboardingData {
  // Step 1: Personal Preferences
  name: string;
  studentId: string;
  university: string;
  studyPreferences: string[];
  learningStyle: string;
  
  // Step 2: Campus Information
  campus: string;
  dormitory: string;
  favoriteSpots: string[];
  accessibilityNeeds: string[];
  
  // Step 3: Schedule & Academic
  academicYear: string;
  major: string;
  courses: string[];
  scheduleImport: boolean;
  
  // Step 4: AI & Notifications
  aiFeatures: string[];
  notificationPreferences: string[];
  privacyLevel: string;
}

export default function OnboardingFlow() {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [isLoading, setIsLoading] = useState(false);

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    name: '',
    studentId: '',
    university: '',
    studyPreferences: [],
    learningStyle: '',
    campus: '',
    dormitory: '',
    favoriteSpots: [],
    accessibilityNeeds: [],
    academicYear: '',
    major: '',
    courses: [],
    scheduleImport: false,
    aiFeatures: [],
    notificationPreferences: [],
    privacyLevel: 'balanced',
  });

  const updateData = (field: keyof OnboardingData, value: any) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof OnboardingData, item: string) => {
    const currentArray = onboardingData[field] as string[];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateData(field, newArray);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    // Simulate API call to save preferences
    setTimeout(() => {
      console.log('Onboarding completed:', onboardingData);
      setIsLoading(false);
      // Navigate to dashboard
      router.push('/dashboard');
    }, 2000);
  };

  // Progress calculation
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Header with Progress */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-600 dark:from-purple-800 dark:to-purple-700 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-white hover:text-purple-200 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Welcome to Smart Campus</h1>
              <p className="text-purple-100">Let's personalize your experience</p>
            </div>
            <div className="text-right">
              <span className="text-sm text-purple-200">Step {currentStep} of {totalSteps}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative overflow-hidden">
        {/* Background Animation */}
        <AnimatedBackground variant="features" />
        
        <div className="max-w-4xl mx-auto p-6 relative z-10">
          
          {/* Step 1: Personal Preferences */}
          {currentStep === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 animate-fadeIn">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Tell us about yourself</h2>
                <p className="text-gray-600 dark:text-gray-400">Help us personalize your Smart Campus experience</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={onboardingData.name}
                      onChange={(e) => updateData('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student ID</label>
                    <input
                      type="text"
                      value={onboardingData.studentId}
                      onChange={(e) => updateData('studentId', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Your student ID"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">University/College</label>
                  <input
                    type="text"
                    value={onboardingData.university}
                    onChange={(e) => updateData('university', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Your institution name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">What's your preferred learning style?</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic'].map((style) => (
                      <button
                        key={style}
                        onClick={() => updateData('learningStyle', style)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                          onboardingData.learningStyle === style
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Study Preferences (Select all that apply)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Quiet Spaces', 'Group Study', 'Library', 'Outdoor Areas', 'Cafes', 'Late Night Study'].map((pref) => (
                      <button
                        key={pref}
                        onClick={() => toggleArrayItem('studyPreferences', pref)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                          onboardingData.studyPreferences.includes(pref)
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Campus Information */}
          {currentStep === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 animate-fadeIn">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Campus Information</h2>
                <p className="text-gray-600 dark:text-gray-400">Help us understand your campus environment</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Campus/Location</label>
                    <input
                      type="text"
                      value={onboardingData.campus}
                      onChange={(e) => updateData('campus', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Main Campus, North Campus, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dormitory/Residence (Optional)</label>
                    <input
                      type="text"
                      value={onboardingData.dormitory}
                      onChange={(e) => updateData('dormitory', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Residence hall name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Favorite Campus Spots (Select all that apply)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Library', 'Student Union', 'Gym/Recreation', 'Dining Hall', 'Computer Labs', 'Study Lounges', 'Outdoor Spaces', 'Coffee Shops', 'Academic Buildings'].map((spot) => (
                      <button
                        key={spot}
                        onClick={() => toggleArrayItem('favoriteSpots', spot)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                          onboardingData.favoriteSpots.includes(spot)
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {spot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Accessibility Needs (Optional)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Wheelchair Access', 'Visual Aids', 'Hearing Assistance', 'Elevator Priority', 'Close Parking', 'None'].map((need) => (
                      <button
                        key={need}
                        onClick={() => toggleArrayItem('accessibilityNeeds', need)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                          onboardingData.accessibilityNeeds.includes(need)
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {need}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Schedule & Academic */}
          {currentStep === 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 animate-fadeIn">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l6 6m0-6l-6 6m6-6H4" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Academic Setup</h2>
                <p className="text-gray-600 dark:text-gray-400">Configure your academic profile and schedule</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Academic Year</label>
                    <select
                      value={onboardingData.academicYear}
                      onChange={(e) => updateData('academicYear', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select your year</option>
                      <option value="freshman">Freshman</option>
                      <option value="sophomore">Sophomore</option>
                      <option value="junior">Junior</option>
                      <option value="senior">Senior</option>
                      <option value="graduate">Graduate</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Major/Field of Study</label>
                    <input
                      type="text"
                      value={onboardingData.major}
                      onChange={(e) => updateData('major', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Computer Science, Business, etc."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Courses (Optional)</label>
                  <textarea
                    value={onboardingData.courses.join(', ')}
                    onChange={(e) => updateData('courses', e.target.value.split(', ').filter(c => c.trim()))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter course names separated by commas (e.g., Math 101, Computer Science 201, English 150)"
                    rows={3}
                  />
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="scheduleImport"
                        type="checkbox"
                        checked={onboardingData.scheduleImport}
                        onChange={(e) => updateData('scheduleImport', e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="scheduleImport" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Import Schedule from University System
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Allow Smart Campus to sync with your university's scheduling system for automatic calendar integration and class reminders.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: AI Features & Notifications */}
          {currentStep === 4 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 animate-fadeIn">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">AI Features & Preferences</h2>
                <p className="text-gray-600 dark:text-gray-400">Customize your AI assistant and notification settings</p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Enable AI Features (Select all that apply)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'chatbot', name: 'AI Chatbot Assistant', desc: 'Natural language campus assistance' },
                      { key: 'studySpaces', name: 'Smart Study Space Finder', desc: 'ML-powered availability predictions' },
                      { key: 'navigation', name: 'Intelligent Navigation', desc: 'Route optimization and crowd analysis' },
                      { key: 'academic', name: 'Academic Assistant', desc: 'Smart calendar and schedule optimization' },
                      { key: 'wellness', name: 'Wellness Check-ins', desc: 'Mood tracking and mental health support' },
                      { key: 'recommendations', name: 'Personalized Recommendations', desc: 'Campus activities and resources' },
                    ].map((feature) => (
                      <div
                        key={feature.key}
                        onClick={() => toggleArrayItem('aiFeatures', feature.key)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          onboardingData.aiFeatures.includes(feature.key)
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 flex items-center justify-center ${
                            onboardingData.aiFeatures.includes(feature.key)
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-gray-300 dark:border-gray-500'
                          }`}>
                            {onboardingData.aiFeatures.includes(feature.key) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{feature.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Notification Preferences</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['Study Reminders', 'Class Notifications', 'Wellness Check-ins', 'Campus Events', 'AI Recommendations', 'Emergency Alerts'].map((pref) => (
                      <button
                        key={pref}
                        onClick={() => toggleArrayItem('notificationPreferences', pref)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                          onboardingData.notificationPreferences.includes(pref)
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Privacy Level</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: 'minimal', name: 'Minimal', desc: 'Basic features only' },
                      { key: 'balanced', name: 'Balanced', desc: 'Recommended settings' },
                      { key: 'full', name: 'Full Experience', desc: 'All features enabled' },
                    ].map((level) => (
                      <button
                        key={level.key}
                        onClick={() => updateData('privacyLevel', level.key)}
                        className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                          onboardingData.privacyLevel === level.key
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <h3 className="font-medium">{level.name}</h3>
                        <p className="text-sm opacity-70">{level.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">AI Ethics & Transparency</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        All AI features use transparent algorithms with bias detection. You maintain full control over your data and can adjust these settings anytime in your profile.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentStep === 1
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={isLoading}
              className={`flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Setting up...
                </>
              ) : (
                <>
                  {currentStep < totalSteps ? 'Next' : 'Complete Setup'}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}