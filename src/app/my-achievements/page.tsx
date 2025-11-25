'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import AuthGuard from '@/components/AuthGuard';
import { achievementService } from '@/services/achievementService';
import type { StudentAchievement } from '@/types/achievement';
import { Trophy, Clock, CheckCircle, XCircle, Calendar, Edit2, Trash2, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type FilterStatus = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function MyAchievementsPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();

  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<StudentAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<StudentAchievement | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    achievementDate: ''
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAchievement, setDeletingAchievement] = useState<StudentAchievement | null>(null);

  // Fetch user's achievements
  const fetchAchievements = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');
      const data = await achievementService.getAchievementsByStudent(user.id);
      setAchievements(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load your achievements');
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  // Filter achievements
  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredAchievements(achievements);
    } else {
      setFilteredAchievements(achievements.filter(a => a.status === filterStatus));
    }
  }, [achievements, filterStatus]);

  // Open edit modal
  const openEditModal = (achievement: StudentAchievement) => {
    setEditingAchievement(achievement);
    setEditForm({
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      achievementDate: achievement.achievementDate || ''
    });
    setShowEditModal(true);
  };

  // Handle edit submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !editingAchievement) return;

    try {
      setActionLoading(true);
      await achievementService.updateAchievement(editingAchievement.id, user.id, editForm);
      setShowEditModal(false);
      setEditingAchievement(null);
      await fetchAchievements();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update achievement');
    } finally {
      setActionLoading(false);
    }
  };

  // Open delete modal
  const openDeleteModal = (achievement: StudentAchievement) => {
    setDeletingAchievement(achievement);
    setShowDeleteModal(true);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!user?.id || !deletingAchievement) return;

    try {
      setActionLoading(true);
      await achievementService.deleteAchievement(deletingAchievement.id, user.id);
      setShowDeleteModal(false);
      setDeletingAchievement(null);
      await fetchAchievements();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete achievement');
    } finally {
      setActionLoading(false);
    }
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

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <Clock size={14} className="mr-1" />
            Pending Review
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle size={14} className="mr-1" />
            Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <XCircle size={14} className="mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  // Get category color
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

  // Count by status
  const countByStatus = (status: string) => achievements.filter(a => a.status === status).length;

  return (
    <AuthGuard>
      <Navigation />
      <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>

        <AnimatedBackground variant="dashboard" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">

          {/* Back Button */}
          <Link
            href="/social"
            className={`inline-flex items-center mb-6 px-4 py-2 rounded-lg transition-colors duration-200 ${
              isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Social
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className={`text-center p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm shadow-lg`}>
              <h1 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center justify-center`}>
                <Trophy className="h-10 w-10 mr-3 text-yellow-500" />
                My Achievements
              </h1>
              <p className={`text-lg md:text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Track and manage your submitted achievements
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-xl shadow-lg border backdrop-blur-sm p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
                  <p className="text-2xl font-bold text-purple-500">{achievements.length}</p>
                </div>
                <Trophy size={32} className="text-purple-500 opacity-20" />
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-xl shadow-lg border backdrop-blur-sm p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
                  <p className="text-2xl font-bold text-yellow-500">{countByStatus('PENDING')}</p>
                </div>
                <Clock size={32} className="text-yellow-500 opacity-20" />
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-xl shadow-lg border backdrop-blur-sm p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Approved</p>
                  <p className="text-2xl font-bold text-green-500">{countByStatus('APPROVED')}</p>
                </div>
                <CheckCircle size={32} className="text-green-500 opacity-20" />
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-xl shadow-lg border backdrop-blur-sm p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rejected</p>
                  <p className="text-2xl font-bold text-red-500">{countByStatus('REJECTED')}</p>
                </div>
                <XCircle size={32} className="text-red-500 opacity-20" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm mb-8`}>
            <div className="flex overflow-x-auto">
              {[
                { id: 'all', label: 'All', count: achievements.length },
                { id: 'PENDING', label: 'Pending', count: countByStatus('PENDING') },
                { id: 'APPROVED', label: 'Approved', count: countByStatus('APPROVED') },
                { id: 'REJECTED', label: 'Rejected', count: countByStatus('REJECTED') }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id as FilterStatus)}
                  className={`flex-1 px-6 py-4 font-medium transition-colors duration-200 whitespace-nowrap ${
                    filterStatus === tab.id
                      ? `${isDarkMode ? 'text-purple-400 border-purple-400' : 'text-purple-600 border-purple-600'} border-b-2`
                      : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    filterStatus === tab.id
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className={`${isDarkMode ? 'bg-gray-800/70' : 'bg-white/70'} backdrop-blur-sm rounded-2xl p-12 text-center`}>
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading your achievements...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <p className={`${isDarkMode ? 'text-red-300' : 'text-red-800'} font-medium`}>
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Achievements List */}
          {!loading && !error && (
            <>
              {filteredAchievements.length === 0 ? (
                <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-12 text-center`}>
                  <Trophy size={64} className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <h3 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {filterStatus === 'all' ? 'No achievements yet' : `No ${filterStatus.toLowerCase()} achievements`}
                  </h3>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {filterStatus === 'all'
                      ? 'Share your first achievement from the Social page!'
                      : 'Try changing the filter to see more achievements.'}
                  </p>
                  {filterStatus === 'all' && (
                    <Link
                      href="/social"
                      className="inline-flex items-center mt-6 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg font-medium hover:from-yellow-700 hover:to-orange-700 transition-all duration-200"
                    >
                      <Trophy className="mr-2" size={20} />
                      Share Achievement
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm overflow-hidden transition-all duration-200 hover:shadow-xl`}
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* Achievement Image */}
                        <div className="relative w-full lg:w-72 h-48 lg:h-auto bg-gradient-to-br from-purple-500 to-pink-600 flex-shrink-0">
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
                              <Trophy size={48} className="text-white opacity-50" />
                            </div>
                          )}

                          {/* Category Badge */}
                          <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(achievement.category)}`}>
                              {achievement.category}
                            </span>
                          </div>

                          {/* Hidden Badge */}
                          {achievement.hidden && (
                            <div className="absolute top-4 right-4">
                              <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-900/70 text-gray-200 flex items-center">
                                <EyeOff size={14} className="mr-1" />
                                Hidden
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Achievement Details */}
                        <div className="flex-1 p-6">
                          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                            <div>
                              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                {achievement.title}
                              </h3>
                              <div className="mt-2">
                                {getStatusBadge(achievement.status)}
                              </div>
                            </div>

                            {/* Action Buttons - Only for pending achievements */}
                            {achievement.status === 'PENDING' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openEditModal(achievement)}
                                  className={`p-2 rounded-lg transition-colors duration-200 ${
                                    isDarkMode
                                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                  }`}
                                  title="Edit"
                                >
                                  <Edit2 size={18} />
                                </button>
                                <button
                                  onClick={() => openDeleteModal(achievement)}
                                  className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 transition-colors duration-200"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            )}
                          </div>

                          <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {achievement.description}
                          </p>

                          {/* Dates */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {achievement.achievementDate && (
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar size={16} className="text-purple-500" />
                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                  Achieved: {formatDate(achievement.achievementDate)}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <Clock size={16} className="text-blue-500" />
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                Submitted: {formatDate(achievement.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Rejection Reason */}
                          {achievement.status === 'REJECTED' && achievement.rejectionReason && (
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                              <div className="flex items-start">
                                <XCircle size={18} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                                    Rejection Reason:
                                  </p>
                                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                                    {achievement.rejectionReason}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Approval Info */}
                          {achievement.status === 'APPROVED' && achievement.approvedAt && (
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                              <div className="flex items-center">
                                <CheckCircle size={18} className="text-green-500 mr-2" />
                                <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                                  Approved on {formatDate(achievement.approvedAt)}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Engagement Stats for Approved */}
                          {achievement.status === 'APPROVED' && (
                            <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center gap-6`}>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                <span className="font-semibold text-red-500">{achievement.likes}</span> likes
                              </div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                <span className="font-semibold text-blue-500">{achievement.comments}</span> comments
                              </div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                <span className="font-semibold text-green-500">{achievement.shares}</span> shares
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && editingAchievement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-2xl w-full p-6 my-8`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} flex items-center`}>
                  <Edit2 className="h-6 w-6 mr-2 text-purple-500" />
                  Edit Achievement
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAchievement(null);
                  }}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Achievement Title *
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Category *
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
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
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                    rows={4}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Achievement Date
                  </label>
                  <input
                    type="date"
                    value={editForm.achievementDate}
                    onChange={(e) => setEditForm({ ...editForm, achievementDate: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                    <p className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                      Your achievement will remain pending and will need to be reviewed again after editing.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    {actionLoading ? 'Saving...' : 'Save Changes'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingAchievement(null);
                    }}
                    disabled={actionLoading}
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

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deletingAchievement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                  Delete Achievement?
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                  Are you sure you want to delete this achievement?
                </p>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
                  &quot;{deletingAchievement.title}&quot;
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletingAchievement(null);
                    }}
                    disabled={actionLoading}
                    className={`flex-1 px-4 py-2 ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } rounded-lg font-medium transition-all duration-200`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    {actionLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
