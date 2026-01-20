'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import AuthGuard from '@/components/AuthGuard';
import { achievementService } from '@/services/achievementService';
import type { StudentAchievement } from '@/types/achievement';
import { Trophy, CheckCircle, XCircle, AlertCircle, Calendar, Trash2, Filter, User, Pencil, Upload, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { fileUploadService } from '@/services/fileUploadService';

export default function AdminAchievementsPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<StudentAchievement | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (user?.id && user?.role === 'ADMIN') {
      loadAchievements();
    }
  }, [user, filter]);

  const loadAchievements = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');

      let data: StudentAchievement[];
      if (filter === 'PENDING') {
        data = await achievementService.getPendingAchievements();
      } else {
        // Try to get all achievements, fallback to approved + pending
        try {
          data = await achievementService.getAllAchievements();
          if (filter !== 'ALL') {
            data = data.filter(achievement => achievement.status === filter);
          }
        } catch {
          const approved = await achievementService.getApprovedAchievements();
          const pending = await achievementService.getPendingAchievements();
          data = [...approved, ...pending];
          if (filter !== 'ALL') {
            data = data.filter(achievement => achievement.status === filter);
          }
        }
      }
      setAchievements(data);
    } catch (err: any) {
      setError(err.response?.data?.error || t('admin.achievements.failedToLoad'));
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (achievementId: number) => {
    if (!user?.id || !confirm(t('admin.achievements.confirmApprove'))) return;

    try {
      setActionLoading(true);
      await achievementService.approveAchievement(achievementId);
      await loadAchievements();
    } catch (err: any) {
      alert(err.response?.data?.error || t('admin.achievements.failedToApprove'));
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (achievement: StudentAchievement) => {
    setSelectedAchievement(achievement);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!user?.id || !selectedAchievement || !rejectionReason.trim()) {
      alert(t('admin.achievements.provideRejectionReason'));
      return;
    }

    try {
      setActionLoading(true);
      await achievementService.rejectAchievement(selectedAchievement.id, { reason: rejectionReason });
      setShowRejectModal(false);
      setSelectedAchievement(null);
      setRejectionReason('');
      await loadAchievements();
    } catch (err: any) {
      alert(err.response?.data?.error || t('admin.achievements.failedToReject'));
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (achievement: StudentAchievement) => {
    setSelectedAchievement(achievement);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!user?.id || !selectedAchievement) return;

    try {
      setActionLoading(true);
      await achievementService.deleteAchievement(selectedAchievement.id, user.id);
      setShowDeleteModal(false);
      setSelectedAchievement(null);
      await loadAchievements();
    } catch (err: any) {
      alert(err.response?.data?.error || t('admin.achievements.failedToDelete'));
    } finally {
      setActionLoading(false);
    }
  };

  const openImageModal = (achievement: StudentAchievement) => {
    setSelectedAchievement(achievement);
    setShowImageModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedAchievement || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    try {
      setImageUploading(true);
      const result = await fileUploadService.uploadImage(file, 'achievements');
      await achievementService.updateAchievementImage(selectedAchievement.id, result.fileUrl);
      setShowImageModal(false);
      setSelectedAchievement(null);
      await loadAchievements();
    } catch (err: any) {
      alert(err.response?.data?.error || t('admin.achievements.failedToUpload'));
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!selectedAchievement) return;

    try {
      setImageUploading(true);
      await achievementService.updateAchievementImage(selectedAchievement.id, null);
      setShowImageModal(false);
      setSelectedAchievement(null);
      await loadAchievements();
    } catch (err: any) {
      alert(err.response?.data?.error || t('admin.achievements.failedToRemove'));
    } finally {
      setImageUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">{t('admin.achievements.approved')}</span>;
      case 'PENDING':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">{t('admin.achievements.pending')}</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">{t('admin.achievements.rejected')}</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300">{status}</span>;
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <AuthGuard>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
          <AnimatedBackground variant="dashboard" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`${isDarkMode ? 'text-red-300' : 'text-red-800'} font-medium`}>
                  {t('admin.common.accessDeniedMessage')}
                </p>
              </div>
            </div>
          </div>
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Navigation />
      <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>

        <AnimatedBackground variant="dashboard" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">

          {/* Header */}
          <div className="mb-8">
            <div className={`text-center p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm shadow-lg`}>
              <h1 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center justify-center`}>
                <Trophy className="h-10 w-10 mr-3 text-yellow-500" />
                {t('admin.achievements.title')}
              </h1>
              <p className={`text-lg md:text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('admin.achievements.subtitle')}
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-4 mb-8`}>
            <div className="flex items-center gap-2 mb-4">
              <Filter className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('admin.achievements.filterByStatus')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('PENDING')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'PENDING'
                    ? 'bg-yellow-600 text-white shadow-md'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-yellow-900/30 hover:text-yellow-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700'
                }`}
              >
                {t('admin.achievements.pending')}
              </button>
              <button
                onClick={() => setFilter('APPROVED')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'APPROVED'
                    ? 'bg-green-600 text-white shadow-md'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-green-900/30 hover:text-green-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                }`}
              >
                {t('admin.achievements.approved')}
              </button>
              <button
                onClick={() => setFilter('REJECTED')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'REJECTED'
                    ? 'bg-red-600 text-white shadow-md'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-red-900/30 hover:text-red-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                }`}
              >
                {t('admin.achievements.rejected')}
              </button>
              <button
                onClick={() => setFilter('ALL')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filter === 'ALL'
                    ? 'bg-purple-600 text-white shadow-md'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-purple-900/30 hover:text-purple-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700'
                }`}
              >
                {t('admin.achievements.allAchievements')}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-6 mb-8`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {filter === 'ALL' ? t('admin.achievements.totalAchievements') : `${t(`admin.achievements.${filter.toLowerCase()}`)} ${t('achievements')}`}
                </p>
                <p className="text-3xl font-bold text-yellow-500">{achievements.length}</p>
              </div>
              <AlertCircle size={48} className="text-yellow-500 opacity-20" />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className={`${isDarkMode ? 'bg-gray-800/70' : 'bg-white/70'} backdrop-blur-sm rounded-2xl p-12 text-center`}>
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
              <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('admin.achievements.loading')}</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`${isDarkMode ? 'text-red-300' : 'text-red-800'} font-medium`}>
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Achievements List */}
          {!loading && !error && (
            <>
              {achievements.length === 0 ? (
                <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-12 text-center`}>
                  <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
                  <h3 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{t('admin.achievements.noAchievements')}</h3>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {t('admin.achievements.noAchievementsMatch')}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`${isDarkMode ? 'bg-gray-700/50 border border-gray-600 hover:border-gray-500' : 'bg-gray-50 border border-gray-200 hover:border-gray-300'} rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md`}
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* Achievement Image */}
                        <div className="relative w-full lg:w-80 h-64 bg-gradient-to-br from-yellow-500 to-orange-600 flex-shrink-0">
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
                          <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(achievement.category)}`}>
                              {achievement.category}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <div className="absolute top-4 right-4">
                            {getStatusBadge(achievement.status)}
                          </div>
                        </div>

                        {/* Achievement Details */}
                        <div className="flex-1 p-6">
                          <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{achievement.title}</h3>
                          <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {achievement.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Achievement Date */}
                            {achievement.achievementDate && (
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar size={16} className="text-yellow-500" />
                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                  {t('admin.achievements.achieved')} {formatDate(achievement.achievementDate)}
                                </span>
                              </div>
                            )}

                            {/* Submission Date */}
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar size={16} className="text-blue-500" />
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                {t('admin.achievements.submitted')} {formatDate(achievement.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Student Info */}
                          <div className={`text-sm mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <User size={14} className="text-yellow-500" />
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                <strong>{t('admin.achievements.student')}</strong> {achievement.studentName}
                              </span>
                            </div>
                            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                              {t('admin.achievements.email')} {achievement.studentEmail}
                            </p>
                            {achievement.studentMajor && (
                              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                                {t('admin.achievements.major')} {achievement.studentMajor}
                                {achievement.studentYear && ` (Year ${achievement.studentYear})`}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => openImageModal(achievement)}
                              disabled={actionLoading}
                              className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'} disabled:bg-gray-400 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} rounded-lg text-sm transition-colors font-medium`}
                            >
                              <Pencil size={16} />
                              {t('admin.achievements.editImage')}
                            </button>

                            {(achievement.status === 'PENDING' || achievement.status === 'REJECTED') && (
                              <button
                                onClick={() => handleApprove(achievement.id)}
                                disabled={actionLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors font-medium"
                              >
                                <CheckCircle size={16} />
                                {t('admin.achievements.approve')}
                              </button>
                            )}

                            {(achievement.status === 'PENDING' || achievement.status === 'APPROVED') && (
                              <button
                                onClick={() => openRejectModal(achievement)}
                                disabled={actionLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors font-medium"
                              >
                                <XCircle size={16} />
                                {t('admin.achievements.reject')}
                              </button>
                            )}

                            <button
                              onClick={() => openDeleteModal(achievement)}
                              disabled={actionLoading}
                              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg text-sm transition-colors font-medium"
                            >
                              <Trash2 size={16} />
                              {t('admin.achievements.delete')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Rejection Modal */}
          {showRejectModal && selectedAchievement && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-4">
                    <XCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {t('admin.achievements.rejectAchievement')}
                  </h2>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  {selectedAchievement.imageUrl && (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(selectedAchievement.imageUrl)}`}
                      alt={selectedAchievement.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedAchievement.title}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{selectedAchievement.category} • {selectedAchievement.studentName}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('admin.achievements.rejectionReason')}
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg border transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder={t('admin.achievements.rejectionPlaceholder')}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleReject}
                    disabled={actionLoading || !rejectionReason.trim()}
                    className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    {actionLoading ? t('admin.achievements.rejecting') : t('admin.achievements.confirmReject')}
                  </button>

                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setSelectedAchievement(null);
                      setRejectionReason('');
                    }}
                    disabled={actionLoading}
                    className={`px-4 py-2 ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } rounded-lg font-medium transition-all duration-200`}
                  >
                    {t('admin.achievements.cancel')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Modal */}
          {showDeleteModal && selectedAchievement && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-4">
                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {t('admin.achievements.deleteAchievement')}
                  </h2>
                </div>

                <div className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  {selectedAchievement.imageUrl && (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(selectedAchievement.imageUrl)}`}
                      alt={selectedAchievement.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{selectedAchievement.title}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{selectedAchievement.category} • {selectedAchievement.studentName}</p>
                  </div>
                </div>

                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                  {t('admin.achievements.deleteConfirm')}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-6 font-medium`}>
                  {t('admin.achievements.deleteWarning')}
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    {actionLoading ? t('admin.achievements.deleting') : t('admin.achievements.deletePermanently')}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedAchievement(null);
                    }}
                    disabled={actionLoading}
                    className={`px-4 py-2 ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } rounded-lg font-medium transition-all duration-200`}
                  >
                    {t('admin.achievements.cancel')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Image Edit Modal */}
          {showImageModal && selectedAchievement && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-4">
                    <ImageIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {t('admin.achievements.editAchievementImage')}
                  </h2>
                </div>

                {/* Current Image Preview */}
                <div className={`mb-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('admin.achievements.currentImage')}
                  </p>
                  <div className={`w-full h-40 rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center`}>
                    {selectedAchievement.imageUrl ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(selectedAchievement.imageUrl)}`}
                        alt={selectedAchievement.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <Trophy className={`w-12 h-12 mx-auto ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t('admin.achievements.noImage')}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload New Image */}
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('admin.achievements.uploadNewImage')}
                  </label>
                  <label className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'border-gray-600 hover:border-purple-500 bg-gray-700/30' : 'border-gray-300 hover:border-purple-500 bg-gray-50'}`}>
                    <Upload className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {imageUploading ? t('admin.achievements.uploading') : t('admin.achievements.clickToUpload')}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImageModal(false);
                      setSelectedAchievement(null);
                    }}
                    disabled={imageUploading}
                    className={`flex-1 px-4 py-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg font-medium transition-all duration-200`}
                  >
                    {t('admin.achievements.cancel')}
                  </button>
                  {selectedAchievement.imageUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={imageUploading}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      {imageUploading ? t('admin.achievements.removing') : t('admin.achievements.removeImage')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
