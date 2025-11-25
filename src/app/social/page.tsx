// src/app/social/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import { achievementService } from '@/services/achievementService';
import type { StudentAchievement } from '@/types/achievement';
import { Trophy, Heart, MessageCircle, Share2, Calendar, Users, Newspaper, Search } from 'lucide-react';
import Image from 'next/image';

type ActiveTab = 'achievements' | 'events' | 'clubs' | 'feed' | 'discover';

export default function SocialPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('achievements');
  const [isLoading, setIsLoading] = useState(true);
  const [showAchievementModal, setShowAchievementModal] = useState(false);

  // Achievements data from API
  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [likedAchievements, setLikedAchievements] = useState<Set<number>>(new Set());

  // Initialize component
  useEffect(() => {
    const loadData = async () => {
      try {
        const achievementsData = await achievementService.getApprovedAchievements();
        setAchievements(achievementsData);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle achievement like
  const handleAchievementLike = useCallback(async (achievementId: number) => {
    const isLiked = likedAchievements.has(achievementId);

    try {
      if (isLiked) {
        await achievementService.unlikeAchievement(achievementId);
        setLikedAchievements(prev => {
          const newSet = new Set(prev);
          newSet.delete(achievementId);
          return newSet;
        });
      } else {
        await achievementService.likeAchievement(achievementId);
        setLikedAchievements(prev => new Set(prev).add(achievementId));
      }

      // Update local state
      setAchievements(prev =>
        prev.map(achievement =>
          achievement.id === achievementId
            ? {
                ...achievement,
                likes: isLiked ? achievement.likes - 1 : achievement.likes + 1
              }
            : achievement
        )
      );
    } catch (error) {
      console.error('Error liking achievement:', error);
    }
  }, [likedAchievements]);

  // Handle achievement share
  const handleAchievementShare = useCallback(async (achievementId: number) => {
    try {
      await achievementService.shareAchievement(achievementId);
      setAchievements(prev =>
        prev.map(achievement =>
          achievement.id === achievementId
            ? { ...achievement, shares: achievement.shares + 1 }
            : achievement
        )
      );
    } catch (error) {
      console.error('Error sharing achievement:', error);
    }
  }, []);

  // Get category color for achievements
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Competition': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'Academic': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'Project': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'Award': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Research': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      'Sports': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      'Cultural': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
      'Leadership': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
      'Community Service': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Coming Soon placeholder component
  const ComingSoonPlaceholder = ({ title, icon: Icon, description }: { title: string; icon: any; description: string }) => (
    <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-12 text-center`}>
      <Icon size={64} className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
      <h3 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{title}</h3>
      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{description}</p>
      <div className="mt-6">
        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
          Coming Soon
        </span>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 flex items-center justify-center`}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading social activities...</p>
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
          <div className="mb-8">
            <div className={`${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm shadow-lg rounded-xl p-6 animate-fade-in`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2 flex items-center`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Social & Activities
                  </h1>
                  <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Discover events, join communities, and connect with peers
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 md:mt-0 flex gap-3 flex-wrap">
                  {user && (
                    <>
                      <a
                        href="/my-achievements"
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                      >
                        <Trophy className="h-5 w-5 mr-2" />
                        <span className="hidden sm:inline">My Achievements</span>
                        <span className="sm:hidden">My</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setShowAchievementModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg font-medium hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
                      >
                        <Trophy className="h-5 w-5 mr-2" />
                        <span className="hidden sm:inline">Share Achievement</span>
                        <span className="sm:hidden">Share</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={`mb-8 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm animate-fade-in`}>
            <div className="flex overflow-x-auto">
              {[
                { id: 'achievements', label: 'Achievements', icon: '🏆', count: achievements.length },
                { id: 'events', label: 'Events', icon: '📅', count: null },
                { id: 'clubs', label: 'Clubs', icon: '🏛️', count: null },
                { id: 'feed', label: 'Feed', icon: '📰', count: null },
                { id: 'discover', label: 'Discover', icon: '🔍', count: null }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex-1 px-6 py-4 font-medium transition-colors duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? `${isDarkMode ? 'text-purple-400 border-purple-400' : 'text-purple-600 border-purple-600'} border-b-2`
                      : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {tab.count !== null && (
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

          {/* Tab Content */}
          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Trophy size={64} className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    No achievements yet. Be the first to share your accomplishments!
                  </p>
                </div>
              ) : (
                achievements.map((achievement, index) => (
                  <div
                    key={achievement.id}
                    className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Achievement Image */}
                    <div className="relative h-56 bg-gradient-to-br from-purple-500 to-pink-600">
                      {achievement.imageUrl ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(achievement.imageUrl)}`}
                          alt={achievement.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Trophy size={64} className="text-white opacity-50" />
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(achievement.category)}`}>
                          {achievement.category}
                        </span>
                      </div>
                    </div>

                    {/* Achievement Content */}
                    <div className="p-6">
                      {/* Student Info */}
                      <div className="flex items-center mb-4">
                        <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} flex items-center justify-center mr-3 flex-shrink-0`}>
                          {achievement.studentImageUrl ? (
                            <Image
                              src={achievement.studentImageUrl}
                              alt={achievement.studentName || 'Student'}
                              width={40}
                              height={40}
                              className="rounded-full"
                              unoptimized
                            />
                          ) : (
                            <span className="text-lg font-bold">
                              {achievement.studentName?.charAt(0) || 'S'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} truncate`}>
                            {achievement.studentName}
                          </h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                            {achievement.studentMajor || 'Student'}
                            {achievement.studentYear && ` • Year ${achievement.studentYear}`}
                          </p>
                        </div>
                      </div>

                      {/* Achievement Title */}
                      <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} line-clamp-2`}>
                        {achievement.title}
                      </h3>

                      {/* Achievement Description */}
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 line-clamp-3`}>
                        {achievement.description}
                      </p>

                      {/* Achievement Date */}
                      {achievement.achievementDate && (
                        <div className="flex items-center gap-2 text-sm mb-4">
                          <Calendar size={16} className="text-purple-500" />
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                            {formatDate(achievement.achievementDate)}
                          </span>
                        </div>
                      )}

                      {/* Engagement Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleAchievementLike(achievement.id)}
                          className={`flex items-center space-x-2 transition-colors duration-200 ${
                            likedAchievements.has(achievement.id)
                              ? 'text-red-500 hover:text-red-600'
                              : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          <Heart
                            size={20}
                            className={likedAchievements.has(achievement.id) ? 'fill-current' : ''}
                          />
                          <span className="text-sm font-medium">{achievement.likes}</span>
                        </button>

                        <button
                          className={`flex items-center space-x-2 transition-colors duration-200 ${
                            isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          <MessageCircle size={20} />
                          <span className="text-sm font-medium">{achievement.comments}</span>
                        </button>

                        <button
                          onClick={() => handleAchievementShare(achievement.id)}
                          className={`flex items-center space-x-2 transition-colors duration-200 ${
                            isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          <Share2 size={20} />
                          <span className="text-sm font-medium">{achievement.shares}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <ComingSoonPlaceholder 
              title="Events" 
              icon={Calendar} 
              description="Campus events and activities will be available here soon." 
            />
          )}

          {activeTab === 'clubs' && (
            <ComingSoonPlaceholder 
              title="Clubs & Organizations" 
              icon={Users} 
              description="Join clubs and connect with student organizations coming soon." 
            />
          )}

          {activeTab === 'feed' && (
            <ComingSoonPlaceholder 
              title="University Feed" 
              icon={Newspaper} 
              description="Stay updated with university news and announcements coming soon." 
            />
          )}

          {activeTab === 'discover' && (
            <ComingSoonPlaceholder 
              title="Discover" 
              icon={Search} 
              description="Discover new opportunities and connections coming soon." 
            />
          )}
        </div>

        {/* Share Achievement Modal */}
        {showAchievementModal && user && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-2xl w-full p-6 my-8`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} flex items-center`}>
                  <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
                  Share Your Achievement
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAchievementModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);

                  try {
                    const achievementData = {
                      studentId: user.id,
                      title: formData.get('title') as string,
                      description: formData.get('description') as string,
                      category: formData.get('category') as string,
                      achievementDate: formData.get('achievementDate') as string,
                    };

                    await achievementService.createAchievement(achievementData);
                    alert('Achievement submitted successfully! It will be visible after admin approval.');
                    setShowAchievementModal(false);
                    e.currentTarget.reset();
                  } catch (error: any) {
                    alert(error.response?.data?.error || 'Failed to submit achievement');
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Achievement Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="e.g., First Place in National Hackathon"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="">Select a category</option>
                    <option value="Competition">Competition</option>
                    <option value="Academic">Academic</option>
                    <option value="Project">Project</option>
                    <option value="Award">Award</option>
                    <option value="Research">Research</option>
                    <option value="Sports">Sports</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Community Service">Community Service</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    rows={4}
                    placeholder="Describe your achievement in detail..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Achievement Date
                  </label>
                  <input
                    type="date"
                    name="achievementDate"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'} mb-1`}>
                        Admin Approval Required
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                        Your achievement will be reviewed by an admin before appearing in the social feed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg font-medium hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Submit Achievement
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAchievementModal(false)}
                    className={`px-4 py-2 ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } rounded-lg font-medium transition-all duration-200`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
