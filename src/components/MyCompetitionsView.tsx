'use client';

import { useState, useEffect } from 'react';
import { competitionService, Competition, Enrollment } from '@/services/competitionService';
import { Calendar, MapPin, Users, Download, Eye, Trash2 } from 'lucide-react';

interface MyCompetitionsViewProps {
  userId: number;
  isDarkMode: boolean;
}

export default function MyCompetitionsView({ userId, isDarkMode }: MyCompetitionsViewProps) {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [showEnrollmentsModal, setShowEnrollmentsModal] = useState(false);

  useEffect(() => {
    loadMyCompetitions();
  }, [userId]);

  const loadMyCompetitions = async () => {
    try {
      setLoading(true);
      const data = await competitionService.getMyCompetitions(userId);
      setCompetitions(data);
    } catch (error) {
      console.error('Error loading my competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewEnrollments = async (competition: Competition) => {
    try {
      setSelectedCompetition(competition);
      const data = await competitionService.getCompetitionEnrollments(competition.id, userId);
      setEnrollments(data);
      setShowEnrollmentsModal(true);
    } catch (error) {
      console.error('Error loading enrollments:', error);
      alert('Failed to load enrollments');
    }
  };

  const downloadEnrollments = async (competitionId: number) => {
    try {
      await competitionService.exportEnrollments(competitionId, userId);
    } catch (error) {
      console.error('Error downloading enrollments:', error);
      alert('Failed to download enrollments');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-8`}>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading your competitions...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-8`}>
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
          My Created Competitions
        </h2>

        {competitions.length === 0 ? (
          <div className="text-center py-12">
            <Users className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              You haven't created any competitions yet
            </p>
            <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
              Create your first competition to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {competitions.map((competition) => (
              <div
                key={competition.id}
                className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {competition.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(competition.status)}`}>
                        {competition.status}
                      </span>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                      {competition.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="flex items-center">
                    <Calendar className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-xs`}>Start</p>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>{formatDate(competition.startDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <div>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-xs`}>End</p>
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>{formatDate(competition.endDate)}</p>
                    </div>
                  </div>

                  {competition.location && (
                    <div className="flex items-center">
                      <MapPin className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <div>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-xs`}>Location</p>
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>{competition.location}</p>
                      </div>
                    </div>
                  )}

                  {competition.internalEnrollmentEnabled && (
                    <div className="flex items-center">
                      <Users className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <div>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-xs`}>Enrolled</p>
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                          {competition.enrollmentCount || 0}
                          {competition.maxParticipants && `/${competition.maxParticipants}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {competition.rejectionReason && (
                  <div className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'} mb-1`}>
                      Rejection Reason:
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                      {competition.rejectionReason}
                    </p>
                  </div>
                )}

                {competition.status === 'APPROVED' && competition.internalEnrollmentEnabled && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => viewEnrollments(competition)}
                      className={`flex-1 px-4 py-2 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Enrollments
                    </button>
                    <button
                      onClick={() => downloadEnrollments(competition.id)}
                      className={`px-4 py-2 ${isDarkMode ? 'bg-green-600 hover:bg-green-500' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enrollments Modal */}
      {showEnrollmentsModal && selectedCompetition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-4xl w-full my-8`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Enrollments for {selectedCompetition.title}
                </h2>
                <button
                  onClick={() => setShowEnrollmentsModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  ✕
                </button>
              </div>

              {enrollments.length === 0 ? (
                <div className="text-center py-8">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No enrollments yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {enrollment.userName || 'Unknown User'}
                          </p>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {enrollment.userEmail}
                          </p>
                        </div>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatDate(enrollment.enrolledAt)}
                        </span>
                      </div>

                      {enrollment.formResponses && (
                        <div className="mt-3">
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            Form Responses:
                          </p>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                            {Object.entries(JSON.parse(enrollment.formResponses)).map(([key, value]) => (
                              <div key={key} className="flex">
                                <span className="font-medium mr-2">{key}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => downloadEnrollments(selectedCompetition.id)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
