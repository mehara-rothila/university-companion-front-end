// src/app/profile/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import { useTranslation } from '@/contexts/TranslationContext';

// --- Interfaces ---
interface UserProfile {
  personalInfo: {
    name: string;
    email: string;
    studentId: string;
    university: string;
    major: string;
    academicYear: string;
    phone: string;
    emergencyContact: string;
  };
  preferences: {
    studyPreferences: string[];
    learningStyle: string;
    accessibility: string[];
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      academic: boolean;
      wellness: boolean;
      social: boolean;
      dining: boolean;
    };
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    dataSharing: boolean;
    analyticsOptIn: boolean;
    locationTracking: boolean;
  };
  aiFeatures: {
    chatbot: boolean;
    studySpaceRecommendations: boolean;
    scheduleOptimization: boolean;
    wellnessCheckins: boolean;
    careerGuidance: boolean;
    smartNavigation: boolean;
  };
}

interface ActivityStats {
  totalLogins: number;
  studySessionsBooked: number;
  wellnessCheckins: number;
  aiInteractions: number;
  lastLogin: string;
}

export default function ProfilePage() {
  const { isDarkMode } = useDarkMode();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    personalInfo: {
      name: 'Mehara Rothila',
      email: 'ranawakaramr.22@uom.lk',
      studentId: '225089N',
      university: 'University of Moratuwa',
      major: 'Information Technology (Undergraduate)',
      academicYear: '3rd Year Undergraduate',
      phone: '+94 78 710 2992',
      emergencyContact: '+94 77 987 6543'
    },
    preferences: {
      studyPreferences: ['Quiet Spaces', 'Library', 'Late Night Study'],
      learningStyle: 'Visual',
      accessibility: ['None'],
      notifications: {
        email: true,
        push: true,
        sms: false,
        academic: true,
        wellness: true,
        social: true,
        dining: false
      }
    },
    privacy: {
      profileVisibility: 'friends',
      dataSharing: false,
      analyticsOptIn: true,
      locationTracking: true
    },
    aiFeatures: {
      chatbot: true,
      studySpaceRecommendations: true,
      scheduleOptimization: true,
      wellnessCheckins: true,
      careerGuidance: true,
      smartNavigation: true
    }
  });

  const [activityStats] = useState<ActivityStats>({
    totalLogins: 142,
    studySessionsBooked: 38,
    wellnessCheckins: 45,
    aiInteractions: 267,
    lastLogin: 'Today at 2:34 PM'
  });

  // Handle profile updates
  const handleProfileUpdate = (
    section: keyof UserProfile, 
    field: string, 
    value: string | boolean | string[] | UserProfile['preferences']['notifications']
  ) => {
    setUserProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle save
  const handleSave = async () => {
    setSaveStatus('saving');
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('saved');
      setIsEditing(false);
      setTimeout(() => setSaveStatus(null), 2000);
    }, 1000);
  };

  // Tab navigation
  const tabs = [
    { id: 'personal', name: t('profile.tabs.personal'), icon: '👤' },
    { id: 'preferences', name: t('profile.tabs.preferences'), icon: '⚙️' },
    { id: 'privacy', name: t('profile.tabs.privacy'), icon: '🔒' },
    { id: 'ai-features', name: t('profile.tabs.aiFeatures'), icon: '🤖' },
    { id: 'activity', name: t('profile.tabs.activity'), icon: '📊' }
  ];

  return (
    <>
      <Navigation />
      <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
        
        <AnimatedBackground variant="dashboard" />

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className={`flex flex-col md:flex-row md:items-center md:justify-between p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm shadow-lg`}>
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                  {userProfile.personalInfo.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-1`}>
                    {userProfile.personalInfo.name}
                  </h1>
                  <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {userProfile.personalInfo.major} • {userProfile.personalInfo.academicYear}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 md:mt-0 flex space-x-3">
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {t('profile.buttons.editProfile')}
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleSave}
                      disabled={saveStatus === 'saving'}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                    >
                      {saveStatus === 'saving' ? (
                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {saveStatus === 'saving' ? t('profile.buttons.saving') : t('profile.buttons.saveChanges')}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className={`px-6 py-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-300 hover:bg-gray-400 text-gray-700'} rounded-lg font-medium transition-all duration-200`}
                    >
                      {t('profile.buttons.cancel')}
                    </button>
                  </div>
                )}

                {/* Save Status Indicator */}
                {saveStatus === 'saved' && (
                  <div className="flex items-center text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">{t('profile.buttons.saved')}</span>
                  </div>
                )}
              </div>
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

          {/* Tab Content */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-8 animate-fade-in`}>
            
            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>{t('profile.personal.title')}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('profile.personal.fullName')}</label>
                    <input
                      type="text"
                      value={userProfile.personalInfo.name}
                      onChange={(e) => handleProfileUpdate('personalInfo', 'name', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'focus:ring-2 focus:ring-purple-500 focus:border-transparent'}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('profile.personal.studentId')}</label>
                    <input
                      type="text"
                      value={userProfile.personalInfo.studentId}
                      disabled
                      className={`w-full px-4 py-3 rounded-lg border opacity-60 cursor-not-allowed ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'bg-gray-100 border-gray-300 text-gray-900'
                      }`}
                    />
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{t('profile.personal.studentIdNote')}</p>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('profile.personal.email')}</label>
                    <input
                      type="email"
                      value={userProfile.personalInfo.email}
                      onChange={(e) => handleProfileUpdate('personalInfo', 'email', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'bg-white border-gray-300 text-gray-900'
                      } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'focus:ring-2 focus:ring-purple-500 focus:border-transparent'}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('profile.personal.phone')}</label>
                    <input
                      type="tel"
                      value={userProfile.personalInfo.phone}
                      onChange={(e) => handleProfileUpdate('personalInfo', 'phone', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'focus:ring-2 focus:ring-purple-500 focus:border-transparent'}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('profile.personal.major')}</label>
                    <input
                      type="text"
                      value={userProfile.personalInfo.major}
                      onChange={(e) => handleProfileUpdate('personalInfo', 'major', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'bg-white border-gray-300 text-gray-900'
                      } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'focus:ring-2 focus:ring-purple-500 focus:border-transparent'}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('profile.personal.academicYear')}</label>
                    <select
                      value={userProfile.personalInfo.academicYear}
                      onChange={(e) => handleProfileUpdate('personalInfo', 'academicYear', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'bg-white border-gray-300 text-gray-900'
                      } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'focus:ring-2 focus:ring-purple-500 focus:border-transparent'}`}
                    >
                      <option value="Year 1">{t('profile.personal.year1')}</option>
                      <option value="Year 2">{t('profile.personal.year2')}</option>
                      <option value="Year 3">{t('profile.personal.year3')}</option>
                      <option value="Year 4">{t('profile.personal.year4')}</option>
                      <option value="Postgraduate">{t('profile.personal.postgraduate')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('profile.personal.emergencyContact')}</label>
                  <input
                    type="tel"
                    value={userProfile.personalInfo.emergencyContact}
                    onChange={(e) => handleProfileUpdate('personalInfo', 'emergencyContact', e.target.value)}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } ${!isEditing ? 'opacity-60 cursor-not-allowed' : 'focus:ring-2 focus:ring-purple-500 focus:border-transparent'}`}
                  />
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>{t('profile.preferences.title')}</h2>

                {/* Notification Preferences */}
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>{t('profile.preferences.notificationPreferences')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(userProfile.preferences.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} capitalize`}>
                          {t(`profile.preferences.${key}`)}
                        </label>
                        <button
                          onClick={() => handleProfileUpdate('preferences', 'notifications', {
                            ...userProfile.preferences.notifications,
                            [key]: !value
                          })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Study Preferences */}
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>{t('profile.preferences.studyPreferences')}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { key: 'Quiet Spaces', label: t('profile.preferences.quietSpaces') },
                      { key: 'Group Study', label: t('profile.preferences.groupStudy') },
                      { key: 'Library', label: t('profile.preferences.library') },
                      { key: 'Outdoor Areas', label: t('profile.preferences.outdoorAreas') },
                      { key: 'Cafes', label: t('profile.preferences.cafes') },
                      { key: 'Late Night Study', label: t('profile.preferences.lateNightStudy') }
                    ].map((pref) => (
                      <button
                        key={pref.key}
                        onClick={() => {
                          const current = userProfile.preferences.studyPreferences;
                          const updated = current.includes(pref.key)
                            ? current.filter(p => p !== pref.key)
                            : [...current, pref.key];
                          handleProfileUpdate('preferences', 'studyPreferences', updated);
                        }}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                          userProfile.preferences.studyPreferences.includes(pref.key)
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {pref.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Learning Style */}
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>{t('profile.preferences.learningStyle')}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { key: 'Visual', label: t('profile.preferences.visual') },
                      { key: 'Auditory', label: t('profile.preferences.auditory') },
                      { key: 'Reading/Writing', label: t('profile.preferences.readingWriting') },
                      { key: 'Kinesthetic', label: t('profile.preferences.kinesthetic') }
                    ].map((style) => (
                      <button
                        key={style.key}
                        onClick={() => handleProfileUpdate('preferences', 'learningStyle', style.key)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                          userProfile.preferences.learningStyle === style.key
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>{t('profile.privacy.title')}</h2>

                <div className="space-y-6">
                  {/* Profile Visibility */}
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>{t('profile.privacy.profileVisibility')}</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {['public', 'friends', 'private'].map((level) => (
                        <button
                          key={level}
                          onClick={() => handleProfileUpdate('privacy', 'profileVisibility', level)}
                          className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                            userProfile.privacy.profileVisibility === level
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                              : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <h4 className="font-medium capitalize">{t(`profile.privacy.${level}`)}</h4>
                          <p className="text-xs opacity-70 mt-1">
                            {t(`profile.privacy.${level}Desc`)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Privacy Controls */}
                  <div className="space-y-4">
                    {[
                      { key: 'dataSharing', label: t('profile.privacy.dataSharing'), desc: t('profile.privacy.dataSharingDesc') },
                      { key: 'analyticsOptIn', label: t('profile.privacy.analytics'), desc: t('profile.privacy.analyticsDesc') },
                      { key: 'locationTracking', label: t('profile.privacy.locationTracking'), desc: t('profile.privacy.locationTrackingDesc') }
                    ].map((setting) => (
                      <div key={setting.key} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{setting.label}</h4>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{setting.desc}</p>
                          </div>
                          <button
                            onClick={() => handleProfileUpdate('privacy', setting.key, !userProfile.privacy[setting.key as keyof typeof userProfile.privacy])}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 ${
                              userProfile.privacy[setting.key as keyof typeof userProfile.privacy] ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                userProfile.privacy[setting.key as keyof typeof userProfile.privacy] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Data Management */}
                  <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-800'} mb-4`}>{t('profile.privacy.dataManagement')}</h3>
                    <div className="space-y-3">
                      <Link href="/ai-ethics" className={`inline-flex items-center text-sm ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-700 hover:text-red-800'} transition-colors duration-200`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {t('profile.privacy.exportData')}
                      </Link>

                      <Link href="/privacy" className={`inline-flex items-center text-sm ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-700 hover:text-red-800'} transition-colors duration-200 ml-6`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('profile.privacy.viewDataPolicy')}
                      </Link>

                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className={`inline-flex items-center text-sm ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-700 hover:text-red-800'} transition-colors duration-200 ml-6`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {t('profile.privacy.deleteAccount')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Features Tab */}
            {activeTab === 'ai-features' && (
              <div className="space-y-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>{t('profile.aiFeatures.title')}</h2>

                <div className="space-y-4">
                  {[
                    { key: 'chatbot', name: t('profile.aiFeatures.chatbot'), desc: t('profile.aiFeatures.chatbotDesc') },
                    { key: 'studySpaceRecommendations', name: t('profile.aiFeatures.studySpaceRecs'), desc: t('profile.aiFeatures.studySpaceRecsDesc') },
                    { key: 'scheduleOptimization', name: t('profile.aiFeatures.scheduleOptimization'), desc: t('profile.aiFeatures.scheduleOptimizationDesc') },
                    { key: 'wellnessCheckins', name: t('profile.aiFeatures.wellnessCheckins'), desc: t('profile.aiFeatures.wellnessCheckinsDesc') },
                    { key: 'careerGuidance', name: t('profile.aiFeatures.careerGuidance'), desc: t('profile.aiFeatures.careerGuidanceDesc') },
                    { key: 'smartNavigation', name: t('profile.aiFeatures.smartNavigation'), desc: t('profile.aiFeatures.smartNavigationDesc') }
                  ].map((feature) => (
                    <div key={feature.key} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{feature.name}</h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{feature.desc}</p>
                        </div>
                        <button
                          onClick={() => handleProfileUpdate('aiFeatures', feature.key, !userProfile.aiFeatures[feature.key as keyof typeof userProfile.aiFeatures])}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 ${
                            userProfile.aiFeatures[feature.key as keyof typeof userProfile.aiFeatures] ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              userProfile.aiFeatures[feature.key as keyof typeof userProfile.aiFeatures] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Ethics Link */}
                <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} mb-3`}>{t('profile.aiFeatures.aiTransparency')}</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'} mb-4`}>
                    {t('profile.aiFeatures.aiTransparencyDesc')}
                  </p>
                  <Link
                    href="/ai-ethics"
                    className={`inline-flex items-center text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-700 hover:text-blue-800'} transition-colors duration-200`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('profile.aiFeatures.viewEthicsDashboard')}
                  </Link>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>{t('profile.activity.title')}</h2>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{activityStats.totalLogins}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>{t('profile.activity.totalLogins')}</div>
                  </div>

                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activityStats.studySessionsBooked}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>{t('profile.activity.studySessions')}</div>
                  </div>

                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activityStats.wellnessCheckins}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>{t('profile.activity.wellnessCheckins')}</div>
                  </div>

                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'}`}>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{activityStats.aiInteractions}</div>
                    <div className={`text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>{t('profile.activity.aiInteractions')}</div>
                  </div>
                </div>

                {/* Last Login */}
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>{t('profile.activity.lastLogin')}</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{activityStats.lastLogin}</p>
                </div>

                {/* Quick Links */}
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>{t('profile.activity.quickLinks')}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { name: 'Dashboard', route: '/dashboard', icon: '🏠' },
                      { name: 'AI Assistant', route: '/chatbot', icon: '🤖' },
                      { name: 'Study Spaces', route: '/study-spaces', icon: '📚' },
                      { name: 'Wellness', route: '/wellness', icon: '💚' },
                      { name: 'Help & Support', route: '/help', icon: '❓' },
                      { name: 'AI Ethics', route: '/ai-ethics', icon: '⚖️' }
                    ].map((link) => (
                      <Link
                        key={link.route}
                        href={link.route}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                          isDarkMode 
                            ? 'border-gray-600 hover:border-purple-500 hover:bg-gray-700/50' 
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-lg">{link.icon}</span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{link.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>{t('profile.deleteModal.title')}</h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  {t('profile.deleteModal.warning')}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    {t('profile.deleteModal.cancel')}
                  </button>
                  <button className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200">
                    {t('profile.deleteModal.confirm')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
