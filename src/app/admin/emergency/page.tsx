'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import axios from 'axios';
import { AlertTriangle, ChevronRight, Trash2, Eye, EyeOff, X } from 'lucide-react';

interface EmergencyNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  target: string;
  targetUserIds?: number[];
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  createdByName: string;
  createdById: number;
  totalUsers: number;
  seenCount: number;
  dismissedCount: number;
  currentUserDismissed: boolean;
  currentUserSeen: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
}

interface EmergencyForm {
  title: string;
  message: string;
  target: string;
  targetUserIds: number[];
  expiresAt: string;
}

export default function AdminEmergency() {
  const { isDarkMode } = useDarkMode();
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const [emergencies, setEmergencies] = useState<EmergencyNotification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [emergencyForm, setEmergencyForm] = useState<EmergencyForm>({
    title: '',
    message: '',
    target: 'ALL_STUDENTS',
    targetUserIds: [],
    expiresAt: ''
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const API_BASE = `${API_BASE_URL}/api`;

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  // Safe date formatting helper
  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const loadEmergencies = async () => {
    try {
      const response = await axios.get(`${API_BASE}/emergency/admin/all`, {
        headers: getAuthHeaders()
      });

      const emergenciesData = response.data || [];
      console.log('📥 Loaded emergencies:', emergenciesData);
      console.log('📊 Emergency IDs:', emergenciesData.map((e: any) => e.id));

      // De-duplicate by ID just in case
      const uniqueEmergencies: EmergencyNotification[] = Array.from(
        new Map(emergenciesData.map((e: any) => [e.id, e])).values()
      );

      console.log('✅ After de-duplication:', uniqueEmergencies.length, 'emergencies');
      setEmergencies(uniqueEmergencies);
    } catch (error) {
      console.error('Failed to load emergencies:', error);
      setError('Failed to load emergencies');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/notifications/admin/users`, {
        headers: getAuthHeaders()
      });
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const createEmergency = async () => {
    if (!emergencyForm.title.trim() || !emergencyForm.message.trim()) {
      setError('Title and message are required');
      return;
    }

    // Prevent double submission
    if (creating) {
      console.log('⚠️ Already creating emergency, skipping duplicate request');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      if (!token) {
        setError('Authentication required. Please log in first.');
        return;
      }

      const requestData = {
        title: emergencyForm.title,
        message: emergencyForm.message,
        type: 'EMERGENCY',
        priority: 'URGENT',
        target: emergencyForm.target,
        targetUserIds: emergencyForm.target === 'SPECIFIC_USERS' && selectedUsers.length > 0 ? selectedUsers : undefined,
        expiresAt: emergencyForm.expiresAt ? new Date(emergencyForm.expiresAt).toISOString() : undefined
      };

      console.log('🚀 Sending emergency data:', requestData);
      console.log('🔑 Auth headers:', { Authorization: `Bearer ${token?.substring(0, 20)}...` });

      const response = await axios.post(`${API_BASE}/emergency/create`, requestData, {
        headers: getAuthHeaders()
      });

      console.log('✅ Emergency created:', response.data);
      setSuccessMessage('Emergency alert sent successfully!');
      setShowCreateModal(false);
      resetForm();
      loadEmergencies();
    } catch (error: any) {
      console.error('❌ Failed to create emergency:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to send emergency alert';
      setError(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  const deleteEmergency = async (id: number) => {
    if (!confirm(t('admin.emergency.confirmDelete'))) return;

    try {
      await axios.delete(`${API_BASE}/emergency/${id}`, {
        headers: getAuthHeaders()
      });
      setSuccessMessage(t('admin.emergency.deleteSuccess'));
      loadEmergencies();
    } catch (error) {
      console.error('Failed to delete emergency:', error);
      setError(t('admin.emergency.failedToDelete'));
    }
  };

  const resetForm = () => {
    setEmergencyForm({
      title: '',
      message: '',
      target: 'ALL_STUDENTS',
      targetUserIds: [],
      expiresAt: ''
    });
    setSelectedUsers([]);
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadEmergencies();
      loadUsers();
    }
  }, [user]);

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
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
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
      <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
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
            <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/90'} backdrop-blur-sm shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2 flex items-center`}>
                    <AlertTriangle className="w-10 h-10 mr-3 text-red-600" />
                    Emergency Alerts
                  </h1>
                  <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Send urgent notifications to all students or specific users with real-time delivery
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <Link href="/admin">
                    <button className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>
                      Back
                    </button>
                  </Link>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center whitespace-nowrap"
                  >
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    New Alert
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Alerts List */}
          <div className={`glass-card ${isDarkMode ? 'bg-gray-800/90 border-gray-700/50' : 'bg-white/95 border-gray-200'} rounded-2xl shadow-xl p-8 border backdrop-blur-sm animate-fade-in`}>
            <div className="mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Active Emergency Alerts
              </h2>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Real-time emergency notifications with acknowledgment tracking
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              </div>
            ) : emergencies.length === 0 ? (
              <div className="text-center py-16">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} mb-4`}>
                  <AlertTriangle className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  No Active Emergencies
                </p>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Create an emergency alert to notify students
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {emergencies.map((emergency) => (
                  <div
                    key={emergency.id}
                    className={`p-6 rounded-xl border-l-4 border-l-red-600 transition-all duration-200 hover:shadow-lg ${
                      isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30">
                              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 animate-pulse" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {emergency.title}
                            </h3>
                          </div>
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-600 text-white whitespace-nowrap">
                            URGENT
                          </span>
                        </div>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 text-sm leading-relaxed whitespace-pre-wrap`}>
                          {emergency.message}
                        </p>

                        {/* Stats Section */}
                        <div className={`grid grid-cols-3 gap-4 p-4 rounded-xl mb-3 ${isDarkMode ? 'bg-gray-600/30' : 'bg-gray-50'}`}>
                          <div className="text-center">
                            <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Total Users
                            </p>
                            <p className={`text-xl font-bold mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {emergency.totalUsers}
                            </p>
                          </div>
                          <div className="text-center border-l border-r border-gray-300 dark:border-gray-600">
                            <p className="text-xs font-medium text-green-600 dark:text-green-400">
                              Seen
                            </p>
                            <p className="text-xl font-bold mt-1 text-green-600 dark:text-green-400">
                              {emergency.seenCount}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                              Dismissed
                            </p>
                            <p className="text-xl font-bold mt-1 text-amber-600 dark:text-amber-400">
                              {emergency.dismissedCount}
                            </p>
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} space-y-1`}>
                          <p>Created by <span className="font-medium text-gray-600 dark:text-gray-400">{emergency.createdByName}</span></p>
                          <p>Created: {formatDate(emergency.createdAt)}</p>
                          {emergency.expiresAt && (
                            <p>Expires: <span className="font-medium">{formatDate(emergency.expiresAt)}</span></p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => deleteEmergency(emergency.id)}
                          className={`p-2 rounded-lg transition-all duration-200 ${isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-100'}`}
                          title="Delete emergency alert"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Emergency Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Send Emergency Alert
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className={`p-2 rounded-lg transition-colors duration-200 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'}`}
                  title="Close modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className={`p-4 rounded-xl border border-red-200 ${isDarkMode ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50'}`}>
                  <p className={`text-sm font-semibold flex items-center ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    This alert will be sent immediately with URGENT priority to all recipients
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Alert Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emergencyForm.title}
                    onChange={(e) => setEmergencyForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Campus Evacuation Order"
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-500 focus:bg-gray-700'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-600 focus:bg-white'
                    } focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Alert Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={emergencyForm.message}
                    onChange={(e) => setEmergencyForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Provide detailed information about the emergency..."
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 resize-none ${
                      isDarkMode
                        ? 'bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-500 focus:bg-gray-700'
                        : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-600 focus:bg-white'
                    } focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Send To
                  </label>
                  <select
                    value={emergencyForm.target}
                    onChange={(e) => {
                      setEmergencyForm(prev => ({ ...prev, target: e.target.value }));
                      setSelectedUsers([]);
                    }}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700/50 border-gray-600 text-gray-100 focus:bg-gray-700'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white'
                    } focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none`}
                  >
                    <option value="ALL_STUDENTS">All Students</option>
                    <option value="SPECIFIC_USERS">Specific Users</option>
                  </select>
                </div>

                {emergencyForm.target === 'SPECIFIC_USERS' && (
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      Select Users
                    </label>
                    <div className={`max-h-48 overflow-y-auto border rounded-xl p-3 ${isDarkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-50'}`}>
                      {users.map((userItem) => (
                        <label key={userItem.id} className={`flex items-center p-2 rounded cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(userItem.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers(prev => [...prev, userItem.id]);
                              } else {
                                setSelectedUsers(prev => prev.filter(id => id !== userItem.id));
                              }
                            }}
                            className="mr-3 rounded accent-red-500"
                          />
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            <span className="font-medium">{userItem.username}</span>
                            <span className={`ml-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>({userItem.email})</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Expires At <span className={`font-normal ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>(Optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={emergencyForm.expiresAt}
                    onChange={(e) => setEmergencyForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700/50 border-gray-600 text-gray-100 focus:bg-gray-700'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white'
                    } focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none`}
                  />
                </div>

                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 active:scale-95'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700 active:scale-95'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={createEmergency}
                    disabled={!emergencyForm.title.trim() || !emergencyForm.message.trim() || creating}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className={`w-5 h-5 ${creating ? 'animate-pulse' : ''}`} />
                    {creating ? 'Creating...' : 'Send Emergency Alert'}
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
