'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import lostFoundMessageService, { UserReport } from '@/services/lostFoundMessageService';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  Check,
  X,
  Clock,
  User,
  MessageSquare,
  Trash2,
  Eye,
  Shield,
  ChevronDown,
} from 'lucide-react';

type ReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED' | 'ALL';

const REPORT_REASON_LABELS: Record<string, string> = {
  HARASSMENT: 'Harassment',
  SPAM: 'Spam',
  INAPPROPRIATE_CONTENT: 'Inappropriate Content',
  SCAM: 'Scam',
  FAKE_ITEM: 'Fake Item',
  OFFENSIVE_LANGUAGE: 'Offensive Language',
  OTHER: 'Other',
};

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; icon: any }> = {
  PENDING: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: Clock,
  },
  REVIEWING: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: Eye,
  },
  RESOLVED: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    icon: Check,
  },
  DISMISSED: {
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-700',
    icon: X,
  },
};

export default function AdminReportsPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReportStatus>('PENDING');
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      alert('Access denied. Admin privileges required.');
      router.push('/dashboard');
      return;
    }

    if (user?.id) {
      loadReports();
    }
  }, [user, router, filter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const status = filter === 'ALL' ? undefined : filter;
      const data = await lostFoundMessageService.getAdminReports(status);
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
      alert('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: number, newStatus: string) => {
    try {
      setActionLoading(true);
      await lostFoundMessageService.updateReportStatus(reportId, newStatus, adminNotes);
      setShowDetailModal(false);
      setSelectedReport(null);
      setAdminNotes('');
      loadReports();
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReport) return;

    try {
      setActionLoading(true);
      await lostFoundMessageService.deleteReport(selectedReport.id);
      setShowDeleteModal(false);
      setSelectedReport(null);
      loadReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report');
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
      minute: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderUserAvatar = (name: string, imageUrl?: string, size: string = 'w-10 h-10') => {
    if (imageUrl) {
      return (
        <img
          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(imageUrl)}`}
          alt={name}
          className={`${size} rounded-full object-cover`}
        />
      );
    }
    return (
      <div
        className={`${size} rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm`}
      >
        {getInitials(name || 'U')}
      </div>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Navigation />
      <main
        className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}
      >
        <AnimatedBackground variant="dashboard" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          {/* Breadcrumbs */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/admin"
              className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full border bg-white/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-700/50 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 shadow-sm backdrop-blur-sm transition-all duration-200`}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Admin Panel
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div
              className={`flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl border bg-white/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-700/50 shadow-md backdrop-blur-sm gap-4`}
            >
              <div>
                <h1
                  className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2 flex items-center`}
                >
                  <Shield className="h-8 w-8 mr-3 text-red-500" />
                  User Reports
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Review and manage user reports
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div
                  className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} flex-wrap gap-1`}
                >
                  {(['PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED', 'ALL'] as ReportStatus[]).map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                          filter === status
                            ? status === 'PENDING'
                              ? 'bg-yellow-600 text-white shadow-sm'
                              : status === 'REVIEWING'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : status === 'RESOLVED'
                                  ? 'bg-green-600 text-white shadow-sm'
                                  : status === 'DISMISSED'
                                    ? 'bg-gray-600 text-white shadow-sm'
                                    : 'bg-purple-600 text-white shadow-sm'
                            : isDarkMode
                              ? 'text-gray-400 hover:text-gray-200'
                              : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {status === 'ALL'
                          ? 'All'
                          : status.charAt(0) + status.slice(1).toLowerCase()}
                      </button>
                    )
                  )}
                </div>

                <div
                  className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-red-900/30 border border-red-700/30' : 'bg-red-100 border border-red-200'}`}
                >
                  <p
                    className={`text-sm font-medium ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}
                  >
                    {loading ? '...' : reports.length} Reports
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div
            className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-6`}
          >
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Loading reports...
                </p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <Shield
                  className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500/50' : 'text-gray-400/50'}`}
                />
                <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {filter === 'PENDING'
                    ? 'No pending reports'
                    : filter === 'REVIEWING'
                      ? 'No reports under review'
                      : filter === 'RESOLVED'
                        ? 'No resolved reports'
                        : filter === 'DISMISSED'
                          ? 'No dismissed reports'
                          : 'No reports found'}
                </p>
                <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                  {filter === 'PENDING'
                    ? 'All reports have been reviewed!'
                    : 'No reports match this filter.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => {
                  const StatusIcon = STATUS_CONFIG[report.status]?.icon || Clock;
                  return (
                    <div
                      key={report.id}
                      className={`p-5 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600 hover:border-gray-500' : 'bg-gray-50 border border-gray-200 hover:border-gray-300'} transition-all duration-200 hover:shadow-md`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Reporter & Reported User */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-4 mb-3">
                            {/* Reporter */}
                            <div className="flex items-center gap-2">
                              {renderUserAvatar(
                                report.reporterFullName,
                                report.reporterImage,
                                'w-8 h-8'
                              )}
                              <div>
                                <p
                                  className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                                >
                                  Reporter
                                </p>
                                <p
                                  className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                                >
                                  {report.reporterFullName || report.reporterUsername}
                                </p>
                              </div>
                            </div>

                            <AlertTriangle
                              className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}
                            />

                            {/* Reported User */}
                            <div className="flex items-center gap-2">
                              {renderUserAvatar(
                                report.reportedFullName,
                                report.reportedUserImage,
                                'w-8 h-8'
                              )}
                              <div>
                                <p
                                  className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                                >
                                  Reported
                                </p>
                                <p
                                  className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                                >
                                  {report.reportedFullName || report.reportedUsername}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Reason & Description */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span
                              className={`px-2.5 py-1 text-xs font-medium rounded-full ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'}`}
                            >
                              {REPORT_REASON_LABELS[report.reason] || report.reason}
                            </span>
                            <span
                              className={`px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_CONFIG[report.status]?.bgColor} ${STATUS_CONFIG[report.status]?.color}`}
                            >
                              <StatusIcon className="w-3 h-3 inline mr-1" />
                              {report.status}
                            </span>
                            {report.conversationId && (
                              <span
                                className={`px-2.5 py-1 text-xs font-medium rounded-full ${isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'}`}
                              >
                                <MessageSquare className="w-3 h-3 inline mr-1" />
                                Conv #{report.conversationId}
                              </span>
                            )}
                          </div>

                          {report.description && (
                            <p
                              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}
                            >
                              {report.description}
                            </p>
                          )}

                          <p
                            className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                          >
                            Reported on {formatDate(report.createdAt)}
                            {report.reviewedAt && ` | Reviewed on ${formatDate(report.reviewedAt)}`}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setAdminNotes(report.adminNotes || '');
                              setShowDetailModal(true);
                            }}
                            className={`px-4 py-2 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg text-sm font-medium transition-colors flex items-center`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReport(report);
                              setShowDeleteModal(true);
                            }}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Detail/Review Modal */}
        {showDetailModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} flex items-center`}
                >
                  <Shield className="w-6 h-6 mr-2 text-red-500" />
                  Report Details
                </h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedReport(null);
                  }}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Users Info */}
              <div
                className={`p-4 rounded-xl mb-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}
              >
                <div className="flex items-center justify-between">
                  {/* Reporter */}
                  <div className="flex items-center gap-3">
                    {renderUserAvatar(
                      selectedReport.reporterFullName,
                      selectedReport.reporterImage,
                      'w-12 h-12'
                    )}
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Reporter
                      </p>
                      <p
                        className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                      >
                        {selectedReport.reporterFullName || 'Unknown'}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        @{selectedReport.reporterUsername}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center px-4">
                    <AlertTriangle
                      className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}
                    />
                    <span
                      className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    >
                      reported
                    </span>
                  </div>

                  {/* Reported User */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Reported User
                      </p>
                      <p
                        className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                      >
                        {selectedReport.reportedFullName || 'Unknown'}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        @{selectedReport.reportedUsername}
                      </p>
                    </div>
                    {renderUserAvatar(
                      selectedReport.reportedFullName,
                      selectedReport.reportedUserImage,
                      'w-12 h-12'
                    )}
                  </div>
                </div>
              </div>

              {/* Report Info */}
              <div className="space-y-4 mb-6">
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Reason
                  </label>
                  <span
                    className={`inline-block px-3 py-1.5 text-sm font-medium rounded-lg ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'}`}
                  >
                    {REPORT_REASON_LABELS[selectedReport.reason] || selectedReport.reason}
                  </span>
                </div>

                {selectedReport.description && (
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Description
                    </label>
                    <p
                      className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {selectedReport.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Current Status
                    </label>
                    <span
                      className={`inline-block px-3 py-1.5 text-sm font-medium rounded-lg ${STATUS_CONFIG[selectedReport.status]?.bgColor} ${STATUS_CONFIG[selectedReport.status]?.color}`}
                    >
                      {selectedReport.status}
                    </span>
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Reported On
                    </label>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {formatDate(selectedReport.createdAt)}
                    </p>
                  </div>
                </div>

                {selectedReport.conversationId && (
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Related Conversation
                    </label>
                    <span
                      className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg ${isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'}`}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Conversation #{selectedReport.conversationId}
                    </span>
                  </div>
                )}

                {/* Admin Notes */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this report..."
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  Cancel
                </button>
                {selectedReport.status === 'PENDING' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'REVIEWING')}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Mark as Reviewing
                  </button>
                )}
                {(selectedReport.status === 'PENDING' || selectedReport.status === 'REVIEWING') && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(selectedReport.id, 'RESOLVED')}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Resolve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedReport.id, 'DISMISSED')}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium flex items-center justify-center"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Dismiss
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-4">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h2
                  className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                >
                  Delete Report
                </h2>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                Are you sure you want to delete this report?
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'} mb-6`}>
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`flex-1 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                >
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
