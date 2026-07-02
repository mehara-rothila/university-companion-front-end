'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import axios from 'axios';

interface Notification {
  id: number;
  title: string;
  message: string;
  type:
    | 'GENERAL'
    | 'ACADEMIC'
    | 'FINANCIAL_AID'
    | 'LOST_FOUND'
    | 'WELLNESS'
    | 'DINING'
    | 'LIBRARY'
    | 'SOCIAL'
    | 'SYSTEM';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  target: 'ALL_STUDENTS' | 'SPECIFIC_USERS' | 'ADMIN_ONLY';
  targetUserIds?: number[];
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  createdByName: string;
  createdById: number;
}

interface User {
  id: number;
  username: string;
  email: string;
}

interface NotificationForm {
  title: string;
  message: string;
  type: string;
  priority: string;
  target: string;
  targetUserIds: number[];
  expiresAt: string;
}

export default function AdminNotifications() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [notificationForm, setNotificationForm] = useState<NotificationForm>({
    title: '',
    message: '',
    type: 'GENERAL',
    priority: 'MEDIUM',
    target: 'ALL_STUDENTS',
    targetUserIds: [],
    expiresAt: '',
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const API_BASE = `${API_BASE_URL}/api`;

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  };

  const loadNotifications = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/notifications/admin/all?page=${currentPage}&size=10`,
        {
          headers: getAuthHeaders(),
        }
      );
      setNotifications(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/notifications/admin/users`, {
        headers: getAuthHeaders(),
      });
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const createNotification = async () => {
    try {
      const requestData = {
        ...notificationForm,
        targetUserIds: notificationForm.target === 'SPECIFIC_USERS' ? selectedUsers : null,
        expiresAt: notificationForm.expiresAt
          ? new Date(notificationForm.expiresAt).toISOString()
          : null,
      };

      console.log('Sending notification request:', requestData);

      await axios.post(`${API_BASE}/notifications/admin/create`, requestData, {
        headers: getAuthHeaders(),
      });

      setSuccessMessage('Notification created successfully!');
      setShowCreateModal(false);
      resetForm();
      loadNotifications();
    } catch (error) {
      console.error('Failed to create notification:', error);
      setError('Failed to create notification');
    }
  };

  const toggleNotification = async (id: number) => {
    try {
      await axios.put(
        `${API_BASE}/notifications/admin/${id}/toggle`,
        {},
        {
          headers: getAuthHeaders(),
        }
      );
      setSuccessMessage('Notification status updated');
      loadNotifications();
    } catch (error) {
      console.error('Failed to toggle notification:', error);
      setError('Failed to update notification status');
    }
  };

  const deleteNotification = async (id: number) => {
    if (!confirm(t('admin.notifications.confirmDelete'))) return;

    try {
      await axios.delete(`${API_BASE}/notifications/admin/${id}`, {
        headers: getAuthHeaders(),
      });
      setSuccessMessage(t('admin.notifications.deleteSuccess'));
      loadNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
      setError(t('admin.notifications.failedToDelete'));
    }
  };

  const resetForm = () => {
    setNotificationForm({
      title: '',
      message: '',
      type: 'GENERAL',
      priority: 'MEDIUM',
      target: 'ALL_STUDENTS',
      targetUserIds: [],
      expiresAt: '',
    });
    setSelectedUsers([]);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      GENERAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      ACADEMIC: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      FINANCIAL_AID: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      LOST_FOUND: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      WELLNESS: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      DINING: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      LIBRARY: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      SOCIAL: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      SYSTEM: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[type as keyof typeof colors] || colors.GENERAL;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      URGENT: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[priority as keyof typeof colors] || colors.MEDIUM;
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadNotifications();
      loadUsers();
    }
  }, [user, currentPage]);

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  if (user?.role !== 'ADMIN') {
    return (
      <>
        <Navigation />
        <main
          className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}
        >
          <AnimatedBackground variant="dashboard" />
          <div className="flex items-center justify-center h-screen">
            <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p>You need admin privileges to access this page.</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main
        className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}
      >
        <AnimatedBackground variant="dashboard" />

        {/* Messages */}
        {error && (
          <div className="fixed top-20 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {successMessage}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div
              className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1
                    className={`text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 mr-3 text-amber-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h3.586a1 1 0 00.707-1.707L17 13V9a5 5 0 10-10 0v4l-2.293 2.293A1 1 0 005.414 17H9m6 0a3 3 0 11-6 0m6 0H9"
                      />
                    </svg>
                    Notification Management
                  </h1>
                  <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Create and manage notifications for students and faculty
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Link href="/admin">
                    <button
                      className={`px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    >
                      Back to Admin
                    </button>
                  </Link>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Create Notification
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div
            className={`glass-card ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}
          >
            <h2
              className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}
            >
              All Notifications
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No notifications found. Create your first notification!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-6 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                    } ${!notification.isActive ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                          >
                            {notification.title}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getTypeColor(notification.type)}`}
                          >
                            {notification.type.replace('_', ' ')}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              notification.target === 'ALL_STUDENTS'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                            }`}
                          >
                            {notification.target === 'ALL_STUDENTS'
                              ? 'All Students'
                              : 'Specific Users'}
                          </span>
                        </div>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                          {notification.message}
                        </p>
                        <div
                          className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} space-y-1`}
                        >
                          <p>Created by: {notification.createdByName}</p>
                          <p>Created: {new Date(notification.createdAt).toLocaleString()}</p>
                          {notification.expiresAt && (
                            <p>Expires: {new Date(notification.expiresAt).toLocaleString()}</p>
                          )}
                          {notification.targetUserIds && notification.targetUserIds.length > 0 && (
                            <p>Target Users: {notification.targetUserIds.length} user(s)</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => toggleNotification(notification.id)}
                          className={`p-2 rounded transition-colors ${
                            notification.isActive
                              ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30'
                              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          title={notification.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={
                                notification.isActive
                                  ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                                  : 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
                              }
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="Delete"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-6 gap-2">
                <button
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                <span
                  className={`px-3 py-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Create Notification Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                >
                  Create New Notification
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    value={notificationForm.title}
                    onChange={(e) =>
                      setNotificationForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Notification title"
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                  >
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={notificationForm.message}
                    onChange={(e) =>
                      setNotificationForm((prev) => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Notification message"
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                    >
                      Type
                    </label>
                    <select
                      value={notificationForm.type}
                      onChange={(e) =>
                        setNotificationForm((prev) => ({ ...prev, type: e.target.value }))
                      }
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                    >
                      <option value="GENERAL">General</option>
                      <option value="ACADEMIC">Academic</option>
                      <option value="FINANCIAL_AID">Financial Aid</option>
                      <option value="LOST_FOUND">Lost & Found</option>
                      <option value="WELLNESS">Wellness</option>
                      <option value="DINING">Dining</option>
                      <option value="LIBRARY">Library</option>
                      <option value="SOCIAL">Social</option>
                      <option value="SYSTEM">System</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                    >
                      Priority
                    </label>
                    <select
                      value={notificationForm.priority}
                      onChange={(e) =>
                        setNotificationForm((prev) => ({ ...prev, priority: e.target.value }))
                      }
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                  >
                    Target
                  </label>
                  <select
                    value={notificationForm.target}
                    onChange={(e) =>
                      setNotificationForm((prev) => ({ ...prev, target: e.target.value }))
                    }
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  >
                    <option value="ALL_STUDENTS">All Students</option>
                    <option value="SPECIFIC_USERS">Specific Users</option>
                  </select>
                </div>

                {notificationForm.target === 'SPECIFIC_USERS' && (
                  <div>
                    <label
                      className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                    >
                      Select Users
                    </label>
                    <div
                      className={`max-h-32 overflow-y-auto border rounded-lg p-2 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}
                    >
                      {users.map((user) => (
                        <label
                          key={user.id}
                          className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers((prev) => [...prev, user.id]);
                              } else {
                                setSelectedUsers((prev) => prev.filter((id) => id !== user.id));
                              }
                            }}
                            className="mr-2"
                          />
                          <span
                            className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            {user.username} ({user.email})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label
                    className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                  >
                    Expires At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={notificationForm.expiresAt}
                    onChange={(e) =>
                      setNotificationForm((prev) => ({ ...prev, expiresAt: e.target.value }))
                    }
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-amber-500 focus:border-transparent`}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createNotification}
                    disabled={!notificationForm.title || !notificationForm.message}
                    className="flex-1 px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Create Notification
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
