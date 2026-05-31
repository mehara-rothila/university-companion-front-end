'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import { competitionService, Competition, FormField } from '@/services/competitionService';
import { Trophy, Calendar, MapPin, Users, Award, ExternalLink, Plus } from 'lucide-react';
import CreateCompetitionModal from '@/components/CreateCompetitionModal';
import EnrollmentModal from '@/components/EnrollmentModal';
import MyCompetitionsView from '@/components/MyCompetitionsView';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function ChallengesPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('explore');
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadCompetitions();
  }, []);

  useEffect(() => {
    if (user?.id && competitions.length > 0) {
      checkEnrollmentStatuses();
    }
  }, [user, competitions]);

  const loadCompetitions = async () => {
    try {
      setLoading(true);
      const data = await competitionService.getApprovedCompetitions();
      setCompetitions(data);
    } catch (error) {
      console.error('Error loading competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatuses = async () => {
    if (!user?.id) return;

    const statuses: Record<number, boolean> = {};
    for (const comp of competitions) {
      if (comp.internalEnrollmentEnabled) {
        try {
          const isEnrolled = await competitionService.isUserEnrolled(comp.id);
          statuses[comp.id] = isEnrolled;
        } catch (error) {
          statuses[comp.id] = false;
        }
      }
    }
    setEnrollmentStatuses(statuses);
  };

  const handleEnroll = (competition: Competition) => {
    setSelectedCompetition(competition);
    setShowEnrollModal(true);
  };

  const handleEnrollmentSuccess = () => {
    setShowEnrollModal(false);
    setSelectedCompetition(null);
    checkEnrollmentStatuses();
    loadCompetitions();
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadCompetitions();
  };

  const filteredCompetitions = competitions.filter(comp => {
    if (selectedCategory === 'all') return true;
    return comp.category?.toLowerCase() === selectedCategory;
  });

  const categories = [
    { id: 'all', name: 'All', count: competitions.length },
    { id: 'sports', name: 'Sports', count: competitions.filter(c => c.category?.toLowerCase() === 'sports').length },
    { id: 'academic', name: 'Academic', count: competitions.filter(c => c.category?.toLowerCase() === 'academic').length },
    { id: 'tech', name: 'Tech', count: competitions.filter(c => c.category?.toLowerCase() === 'tech').length },
    { id: 'cultural', name: 'Cultural', count: competitions.filter(c => c.category?.toLowerCase() === 'cultural').length },
  ];

  const getCategoryColor = (category: string) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('sport')) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
    if (cat.includes('academic')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
    if (cat.includes('tech')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
    if (cat.includes('cultural')) return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date();
  };

  const isActive = (startDate: string, endDate: string) => {
    const now = new Date();
    return new Date(startDate) <= now && new Date(endDate) >= now;
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 flex items-center justify-center`}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading competitions...</p>
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">

          {/* Header */}
          <div className="mb-8">
            <div className={`text-center p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm shadow-lg`}>
              <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center justify-center`}>
                <Trophy className="h-10 w-10 mr-3 text-purple-500" />
                Competitions & Challenges
              </h1>
              <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto mb-6`}>
                Discover upcoming competitions, showcase your skills, and compete with peers
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Competition
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm mb-6`}>
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('explore')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeTab === 'explore'
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Explore Competitions
              </button>
              <button
                onClick={() => setActiveTab('my-competitions')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                  activeTab === 'my-competitions'
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                My Competitions
              </button>
            </div>
          </div>

          {/* Explore Tab */}
          {activeTab === 'explore' && (
            <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-8`}>

              {/* Category Filter */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-purple-600 text-white'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name} ({category.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Competitions Grid */}
              {filteredCompetitions.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No competitions found
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                    Be the first to create one!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredCompetitions.map((competition) => (
                    <div
                      key={competition.id}
                      className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} transition-all duration-200 hover:shadow-md`}
                    >
                      {/* Image */}
                      {competition.imageUrl && (
                        <div className="mb-4 rounded-lg overflow-hidden">
                          <img
                            src={`${API_URL}/api/upload/image/serve?url=${encodeURIComponent(competition.imageUrl)}`}
                            alt={competition.title}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          {competition.category && (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(competition.category)}`}>
                              {competition.category}
                            </span>
                          )}
                          {isUpcoming(competition.startDate) && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              Upcoming
                            </span>
                          )}
                          {isActive(competition.startDate, competition.endDate) && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                              Active
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                        {competition.title}
                      </h3>

                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 line-clamp-2`}>
                        {competition.description}
                      </p>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="flex items-center">
                          <Calendar className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <div>
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-xs`}>Start Date</p>
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>{formatDate(competition.startDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <div>
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-xs`}>End Date</p>
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>{formatDate(competition.endDate)}</p>
                          </div>
                        </div>
                        {competition.location && (
                          <div className="flex items-center col-span-2">
                            <MapPin className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>{competition.location}</p>
                          </div>
                        )}
                        {competition.maxParticipants && (
                          <div className="flex items-center col-span-2">
                            <Users className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                              Max {competition.maxParticipants} participants
                              {competition.enrollmentCount && ` • ${competition.enrollmentCount} enrolled`}
                            </p>
                          </div>
                        )}
                        {competition.prizes && (
                          <div className="flex items-start col-span-2">
                            <Award className={`w-4 h-4 mr-2 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs line-clamp-2`}>{competition.prizes}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        {enrollmentStatuses[competition.id] ? (
                          <button className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium cursor-not-allowed">
                            Enrolled ✓
                          </button>
                        ) : (
                          <>
                            {competition.internalEnrollmentEnabled && (
                              <button
                                onClick={() => handleEnroll(competition)}
                                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                              >
                                Enroll Now
                              </button>
                            )}
                            {competition.externalEnrollmentUrl && (
                              <a
                                href={competition.externalEnrollmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex-1 px-4 py-2 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center`}
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Register
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Competitions Tab */}
          {activeTab === 'my-competitions' && user && (
            <MyCompetitionsView userId={user.id} isDarkMode={isDarkMode} />
          )}
        </div>

        {/* Create Competition Modal */}
        {showCreateModal && user && (
          <CreateCompetitionModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateSuccess}
            organizerId={user.id}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Enrollment Modal */}
        {showEnrollModal && selectedCompetition && user && (
          <EnrollmentModal
            isOpen={showEnrollModal}
            onClose={() => {
              setShowEnrollModal(false);
              setSelectedCompetition(null);
            }}
            competition={selectedCompetition}
            userId={user.id}
            isDarkMode={isDarkMode}
            onSuccess={handleEnrollmentSuccess}
          />
        )}
      </main>
    </>
  );
}
