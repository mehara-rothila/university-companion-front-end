'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import { competitionService, Competition } from '@/services/competitionService';
import { Shield, Check, X, Calendar, MapPin, Users, ExternalLink, Image as ImageIcon } from 'lucide-react';

export default function AdminCompetitionsPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const router = useRouter();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'ADMIN') {
      alert('Access denied. Admin privileges required.');
      router.push('/dashboard');
      return;
    }

    if (user?.id) {
      loadPendingCompetitions();
    }
  }, [user, router]);

  const loadPendingCompetitions = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await competitionService.getPendingCompetitions(user.id);
      setCompetitions(data);
    } catch (error) {
      console.error('Error loading pending competitions:', error);
      alert('Failed to load pending competitions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (competitionId: number) => {
    if (!user?.id) return;

    try {
      setActionLoading(true);
      await competitionService.approveCompetition(competitionId, user.id);
      alert('Competition approved successfully!');
      loadPendingCompetitions();
    } catch (error) {
      console.error('Error approving competition:', error);
      alert('Failed to approve competition');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!user?.id || !selectedCompetition) return;

    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      await competitionService.rejectCompetition(selectedCompetition.id, user.id, rejectionReason);
      alert('Competition rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedCompetition(null);
      loadPendingCompetitions();
    } catch (error) {
      console.error('Error rejecting competition:', error);
      alert('Failed to reject competition');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 flex items-center justify-center`}>
          <div className="text-center">
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Please log in to continue</p>
          </div>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 flex items-center justify-center`}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading pending competitions...</p>
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2 flex items-center`}>
                  <Shield className="h-10 w-10 mr-3 text-purple-500" />
                  Admin - Competition Review
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Review and approve pending competition submissions
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                  Pending: <span className="font-bold text-lg">{competitions.length}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Competitions List */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-8`}>

            {competitions.length === 0 ? (
              <div className="text-center py-12">
                <Shield className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No pending competitions
                </p>
                <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                  All competitions have been reviewed!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {competitions.map((competition) => (
                  <div
                    key={competition.id}
                    className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} transition-all duration-200`}
                  >
                    {/* Competition Image */}
                    {competition.imageUrl && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img
                          src={competition.imageUrl}
                          alt={competition.title}
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`font-bold text-xl ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {competition.title}
                          </h3>
                          {competition.category && (
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                              {competition.category}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                          {competition.description}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Submitted on {formatDate(competition.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center">
                        <Calendar className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <div>
                          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-xs font-medium`}>Start Date</p>
                          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>{formatDate(competition.startDate)}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Calendar className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <div>
                          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-xs font-medium`}>End Date</p>
                          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>{formatDate(competition.endDate)}</p>
                        </div>
                      </div>

                      {competition.registrationDeadline && (
                        <div className="flex items-center">
                          <Calendar className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <div>
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-xs font-medium`}>Registration Deadline</p>
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>{formatDate(competition.registrationDeadline)}</p>
                          </div>
                        </div>
                      )}

                      {competition.location && (
                        <div className="flex items-center">
                          <MapPin className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <div>
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-xs font-medium`}>Location</p>
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>{competition.location}</p>
                          </div>
                        </div>
                      )}

                      {competition.maxParticipants && (
                        <div className="flex items-center">
                          <Users className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                          <div>
                            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-xs font-medium`}>Max Participants</p>
                            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>{competition.maxParticipants}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Prizes */}
                    {competition.prizes && (
                      <div className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-600/50' : 'bg-gray-100'}`}>
                        <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Prizes:</p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{competition.prizes}</p>
                      </div>
                    )}

                    {/* Enrollment Options */}
                    <div className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-600/50' : 'bg-gray-100'}`}>
                      <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Enrollment Options:</p>
                      <div className="space-y-1 text-sm">
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          • Internal Enrollment: {competition.internalEnrollmentEnabled ? '✓ Enabled' : '✗ Disabled'}
                        </p>
                        {competition.internalEnrollmentEnabled && competition.formFields && (
                          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            • Form Fields: {competition.formFields.length} custom fields
                          </p>
                        )}
                        {competition.externalEnrollmentUrl && (
                          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center`}>
                            • External Link:
                            <a
                              href={competition.externalEnrollmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 text-blue-500 hover:underline flex items-center"
                            >
                              View <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApprove(competition.id)}
                        disabled={actionLoading}
                        className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center disabled:opacity-50"
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCompetition(competition);
                          setShowRejectModal(true);
                        }}
                        disabled={actionLoading}
                        className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center disabled:opacity-50"
                      >
                        <X className="w-5 h-5 mr-2" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reject Modal */}
        {showRejectModal && selectedCompetition && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Reject Competition
                </h2>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedCompetition(null);
                  }}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  You are about to reject: <span className="font-semibold">{selectedCompetition.title}</span>
                </p>

                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={4}
                  className={`w-full px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'}`}
                  required
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedCompetition(null);
                  }}
                  className={`flex-1 px-6 py-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
