'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import AuthGuard from '@/components/AuthGuard';
import axios from 'axios';
import {
  Users,
  GraduationCap,
  Building,
  Shield,
  DollarSign,
  Bell,
  Settings,
  ChevronRight,
  Clock,
  Trophy,
  Calendar,
  Search
} from 'lucide-react';

// Types
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN';
  studentId?: string;
  major?: string;
  year?: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  provider?: string;
  providerId?: string;
  imageUrl?: string;
}

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalFaculty: number;
  totalAdmins: number;
  timestamp: string;
}

interface PaginatedUsers {
  users: User[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export default function AdminPanel() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<PaginatedUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleFilterDropdown, setShowRoleFilterDropdown] = useState(false);
  const [showUserRoleDropdown, setShowUserRoleDropdown] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showUserModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showUserModal]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // User form state
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    role: 'STUDENT' as 'STUDENT' | 'FACULTY' | 'ADMIN',
    studentId: '',
    major: '',
    year: undefined as number | undefined,
    enabled: true
  });

  // Get auth token from context
  const { token } = useAuth();

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const API_BASE = `${API_BASE_URL}/api`;

  // Helper function to get auth headers
  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  // Load dashboard stats
  const loadStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/dashboard/stats`, {
        headers: getAuthHeaders()
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setError('Failed to load dashboard statistics');
    }
  }, []);

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        sortBy: 'createdAt',
        sortDir: 'desc'
      });

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      if (roleFilter) {
        params.append('role', roleFilter);
      }

      const response = await axios.get(`${API_BASE}/admin/users?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, roleFilter]);

  // Delete user
  const deleteUser = async (userId: number) => {
    if (!confirm(t('admin.messages.confirmDelete'))) return;

    try {
      await axios.delete(`${API_BASE}/admin/users/${userId}`, {
        headers: getAuthHeaders()
      });
      setSuccessMessage('User deleted successfully');
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Failed to delete user:', error);
      setError('Failed to delete user');
    }
  };

  // Toggle user status
  const toggleUserStatus = async (userId: number) => {
    try {
      await axios.patch(`${API_BASE}/admin/users/${userId}/toggle-status`, {}, {
        headers: getAuthHeaders()
      });
      setSuccessMessage('User status updated successfully');
      loadUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      setError('Failed to update user status');
    }
  };

  // Save user (create or update)
  const saveUser = async () => {
    try {
      if (selectedUser) {
        // Update user
        await axios.put(`${API_BASE}/admin/users/${selectedUser.id}`, userForm, {
          headers: getAuthHeaders()
        });
        setSuccessMessage('User updated successfully');
      } else {
        // Create user - we'll use the signup endpoint for now
        const signupData = {
          ...userForm,
          preferences: []
        };
        await axios.post(`${API_BASE}/auth/signup`, signupData, {
          headers: { 'Content-Type': 'application/json' }
        });
        setSuccessMessage('User created successfully');
      }

      setShowUserModal(false);
      resetForm();
      loadUsers();
      loadStats();
    } catch (error: unknown) {
      console.error('Failed to save user:', error);
      setError((error as any)?.response?.data || 'Failed to save user');
    }
  };

  // Bulk actions
  const performBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    if (!confirm(t('admin.messages.confirmBulkAction', { action, count: selectedUsers.length }))) return;

    try {
      await axios.post(`${API_BASE}/admin/users/bulk-action`, {
        userIds: selectedUsers,
        action: action
      }, {
        headers: getAuthHeaders()
      });

      setSuccessMessage(`Bulk ${action} completed successfully`);
      setSelectedUsers([]);
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
      setError(`Failed to perform bulk ${action}`);
    }
  };

  // Reset form
  const resetForm = () => {
    setUserForm({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      role: 'STUDENT',
      studentId: '',
      major: '',
      year: undefined,
      enabled: true
    });
    setSelectedUser(null);
  };

  // Open user modal
  const openUserModal = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setUserForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        password: '', // Don't prefill password for security
        role: user.role,
        studentId: user.studentId || '',
        major: user.major || '',
        year: user.year,
        enabled: user.enabled
      });
    } else {
      resetForm();
    }
    setShowUserModal(true);
  };

  // Handle user selection
  const handleUserSelect = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedUsers.length === users?.users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users?.users.map(user => user.id) || []);
    }
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'FACULTY':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'STUDENT':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadStats();
      loadUsers();
    }
  }, [currentPage, searchTerm, roleFilter, user, loadStats, loadUsers]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // Redirect if not admin
  if (user?.role !== 'ADMIN') {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
          <AnimatedBackground variant="dashboard" />
          <div className="flex items-center justify-center h-screen">
            <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <h1 className="text-2xl font-bold mb-4">{t('admin.accessDenied.title')}</h1>
              <p>{t('admin.accessDenied.message')}</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
          <AnimatedBackground variant="dashboard" />
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        </main>
      </>
    );
  }

  return (
    <AuthGuard allowedRoles={['admin']}>
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">

          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className={`text-center p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm shadow-lg`}>
              <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center justify-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t('admin.title')}
              </h1>
              <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto mb-6`}>
                {t('admin.subtitle')}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
            {[
              {
                title: t('admin.stats.totalUsers'),
                value: stats?.totalUsers || 0,
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                color: 'from-blue-500/20 to-blue-600/20',
                borderColor: 'border-blue-400/30'
              },
              {
                title: t('admin.stats.students'),
                value: stats?.totalStudents || 0,
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                ),
                color: 'from-green-500/20 to-green-600/20',
                borderColor: 'border-green-400/30'
              },
              {
                title: t('admin.stats.faculty'),
                value: stats?.totalFaculty || 0,
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                color: 'from-purple-500/20 to-purple-600/20',
                borderColor: 'border-purple-400/30'
              },
              {
                title: t('admin.stats.admins'),
                value: stats?.totalAdmins || 0,
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                color: 'from-amber-500/20 to-amber-600/20',
                borderColor: 'border-amber-400/30'
              }
            ].map((stat) => (
              <div
                key={stat.title}
                className={`glass-card bg-gradient-to-br ${stat.color} backdrop-blur-lg border ${stat.borderColor} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.title}
                    </p>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Admin Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 animate-fade-in">
            {/* User Management */}
            <div className={`glass-card ${isDarkMode ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/30' : 'bg-gradient-to-br from-blue-50/90 to-blue-100/90 border-blue-200/50'} backdrop-blur-lg border p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 cursor-pointer h-full flex flex-col`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-800/50' : 'bg-blue-100'} flex-shrink-0`}>
                  <Users className={`w-8 h-8 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-600'} block`}>
                    {stats?.totalUsers || 0}
                  </span>
                  <span className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                    {t('admin.modules.userManagement.statusLabel')}
                  </span>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                  {t('admin.modules.userManagement.title')}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 leading-relaxed`}>
                  {t('admin.modules.userManagement.description')}
                </p>
              </div>
              <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-600'} flex items-center justify-end`}>
                  {t('admin.modules.userManagement.action')}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </div>
            </div>

            {/* Financial Aid Management */}
            <Link href="/admin/financial-aid">
              <div className={`glass-card ${isDarkMode ? 'bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/30' : 'bg-gradient-to-br from-green-50/90 to-green-100/90 border-green-200/50'} backdrop-blur-lg border p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 cursor-pointer h-full flex flex-col`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-800/50' : 'bg-green-100'} flex-shrink-0`}>
                    <DollarSign className={`w-8 h-8 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} />
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-600'} bg-gradient-to-r ${isDarkMode ? 'from-green-400 to-green-300' : 'from-green-600 to-green-500'} bg-clip-text text-transparent block`}>
                      {t('admin.modules.financialAid.status')}
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-500'}`}>
                      {t('admin.modules.financialAid.availability')}
                    </span>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                    {t('admin.modules.financialAid.title')}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 leading-relaxed`}>
                    {t('admin.modules.financialAid.description')}
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-600'} flex items-center justify-end`}>
                    {t('admin.modules.financialAid.action')}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
            </Link>

            {/* Notification Management */}
            <Link href="/admin/notifications">
              <div className={`glass-card ${isDarkMode ? 'bg-gradient-to-br from-amber-900/20 to-amber-800/20 border-amber-700/30' : 'bg-gradient-to-br from-amber-50/90 to-amber-100/90 border-amber-200/50'} backdrop-blur-lg border p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 cursor-pointer h-full flex flex-col`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-amber-800/50' : 'bg-amber-100'} flex-shrink-0`}>
                    <Bell className={`w-8 h-8 ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`} />
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-amber-300' : 'text-amber-600'} bg-gradient-to-r ${isDarkMode ? 'from-amber-400 to-amber-300' : 'from-amber-600 to-amber-500'} bg-clip-text text-transparent block`}>
                      {t('admin.modules.notifications.status')}
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`}>
                      {t('admin.modules.notifications.availability')}
                    </span>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                    {t('admin.modules.notifications.title')}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 leading-relaxed`}>
                    {t('admin.modules.notifications.description')}
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-amber-300' : 'text-amber-600'} flex items-center justify-end`}>
                    {t('admin.modules.notifications.action')}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
            </Link>

            {/* Competition Management */}
            <Link href="/admin/competitions">
              <div className={`glass-card ${isDarkMode ? 'bg-gradient-to-br from-orange-900/20 to-orange-800/20 border-orange-700/30' : 'bg-gradient-to-br from-orange-50/90 to-orange-100/90 border-orange-200/50'} backdrop-blur-lg border p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 cursor-pointer h-full flex flex-col`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-orange-800/50' : 'bg-orange-100'} flex-shrink-0`}>
                    <Trophy className={`w-8 h-8 ${isDarkMode ? 'text-orange-300' : 'text-orange-600'}`} />
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-orange-300' : 'text-orange-600'} bg-gradient-to-r ${isDarkMode ? 'from-orange-400 to-orange-300' : 'from-orange-600 to-orange-500'} bg-clip-text text-transparent block`}>
                      {t('admin.modules.competitions.status')}
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`}>
                      {t('admin.modules.competitions.availability')}
                    </span>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                    {t('admin.modules.competitions.title')}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 leading-relaxed`}>
                    {t('admin.modules.competitions.description')}
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-orange-300' : 'text-orange-600'} flex items-center justify-end`}>
                    {t('admin.modules.competitions.action')}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
            </Link>

            {/* Lost & Found Management */}
            <Link href="/admin/lost-found">
              <div className={`glass-card ${isDarkMode ? 'bg-gradient-to-br from-cyan-900/20 to-cyan-800/20 border-cyan-700/30' : 'bg-gradient-to-br from-cyan-50/90 to-cyan-100/90 border-cyan-200/50'} backdrop-blur-lg border p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 cursor-pointer h-full flex flex-col`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-cyan-800/50' : 'bg-cyan-100'} flex-shrink-0`}>
                    <Search className={`w-8 h-8 ${isDarkMode ? 'text-cyan-300' : 'text-cyan-600'}`} />
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-600'} bg-gradient-to-r ${isDarkMode ? 'from-cyan-400 to-cyan-300' : 'from-cyan-600 to-cyan-500'} bg-clip-text text-transparent block`}>
                      Active
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-cyan-400' : 'text-cyan-500'}`}>
                      Review Items
                    </span>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                    Lost & Found
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 leading-relaxed`}>
                    Review and approve lost and found submissions
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-cyan-300' : 'text-cyan-600'} flex items-center justify-end`}>
                    Manage Items
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
            </Link>

            {/* Events Management */}
            <Link href="/admin/events">
              <div className={`glass-card ${isDarkMode ? 'bg-gradient-to-br from-pink-900/20 to-pink-800/20 border-pink-700/30' : 'bg-gradient-to-br from-pink-50/90 to-pink-100/90 border-pink-200/50'} backdrop-blur-lg border p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 cursor-pointer h-full flex flex-col`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-pink-800/50' : 'bg-pink-100'} flex-shrink-0`}>
                    <Calendar className={`w-8 h-8 ${isDarkMode ? 'text-pink-300' : 'text-pink-600'}`} />
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-pink-300' : 'text-pink-600'} bg-gradient-to-r ${isDarkMode ? 'from-pink-400 to-pink-300' : 'from-pink-600 to-pink-500'} bg-clip-text text-transparent block`}>
                      Active
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-pink-400' : 'text-pink-500'}`}>
                      Available Now
                    </span>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                    Events Management
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 leading-relaxed`}>
                    Review and approve pending events, manage event submissions, and moderate social activities
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-pink-300' : 'text-pink-600'} flex items-center justify-end`}>
                    Manage Events
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
            </Link>

            {/* Achievements Management */}
            <Link href="/admin/achievements">
              <div className={`glass-card ${isDarkMode ? 'bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-700/30' : 'bg-gradient-to-br from-yellow-50/90 to-yellow-100/90 border-yellow-200/50'} backdrop-blur-lg border p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 cursor-pointer h-full flex flex-col`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-yellow-800/50' : 'bg-yellow-100'} flex-shrink-0`}>
                    <Trophy className={`w-8 h-8 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`} />
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'} bg-gradient-to-r ${isDarkMode ? 'from-yellow-400 to-yellow-300' : 'from-yellow-600 to-yellow-500'} bg-clip-text text-transparent block`}>
                      Active
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`}>
                      Review Pending
                    </span>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                    Achievements
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 leading-relaxed`}>
                    Review and approve student achievement submissions for the social feed
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'} flex items-center justify-end`}>
                    Manage Achievements
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
            </Link>

            {/* System Settings */}
            <div className={`glass-card ${isDarkMode ? 'bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/30' : 'bg-gradient-to-br from-purple-50/90 to-purple-100/90 border-purple-200/50'} backdrop-blur-lg border p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 cursor-pointer opacity-60 h-full flex flex-col`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-800/50' : 'bg-purple-100'} flex-shrink-0`}>
                  <Settings className={`w-8 h-8 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} />
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-600'} bg-gradient-to-r ${isDarkMode ? 'from-purple-400 to-purple-300' : 'from-purple-600 to-purple-500'} bg-clip-text text-transparent block`}>
                    {t('admin.modules.systemSettings.status')}
                  </span>
                  <span className={`text-xs ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`}>
                    {t('admin.modules.systemSettings.availability')}
                  </span>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                  {t('admin.modules.systemSettings.title')}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 leading-relaxed`}>
                  {t('admin.modules.systemSettings.description')}
                </p>
              </div>
              <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-600'} flex items-center justify-end opacity-60`}>
                  {t('admin.modules.systemSettings.action')}
                  <Clock className="w-4 h-4 ml-1" />
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`glass-card ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm mb-8 animate-fade-in`}>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
              {t('admin.quickActions.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => openUserModal()}
                className={`p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105 flex flex-col items-center text-center ${isDarkMode
                  ? 'border-gray-600 hover:border-blue-500 bg-gray-700/30 hover:bg-blue-900/20'
                  : 'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50'
                  }`}
              >
                <div className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mb-2`}>
                  <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-center`}>
                  {t('admin.quickActions.addUser')}
                </span>
              </button>

              <Link href="/admin/financial-aid">
                <div className={`p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105 cursor-pointer flex flex-col items-center text-center ${isDarkMode
                  ? 'border-gray-600 hover:border-green-500 bg-gray-700/30 hover:bg-green-900/20'
                  : 'border-gray-300 hover:border-green-400 bg-gray-50 hover:bg-green-50'
                  }`}>
                  <div className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} mb-2`}>
                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-center`}>
                    {t('admin.quickActions.reviewApplications')}
                  </span>
                </div>
              </Link>

              <button
                onClick={() => {
                  loadStats();
                  loadUsers();
                }}
                className={`p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105 flex flex-col items-center text-center ${isDarkMode
                  ? 'border-gray-600 hover:border-purple-500 bg-gray-700/30 hover:bg-purple-900/20'
                  : 'border-gray-300 hover:border-purple-400 bg-gray-50 hover:bg-purple-50'
                  }`}
              >
                <div className={`${isDarkMode ? 'text-purple-400' : 'text-purple-600'} mb-2`}>
                  <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-center`}>
                  {t('admin.quickActions.refreshData')}
                </span>
              </button>

              <button
                disabled
                className={`p-4 rounded-lg border-2 border-dashed transition-all duration-200 opacity-50 cursor-not-allowed flex flex-col items-center text-center ${isDarkMode
                  ? 'border-gray-600 bg-gray-700/30'
                  : 'border-gray-300 bg-gray-50'
                  }`}
              >
                <div className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mb-2`}>
                  <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-center`}>
                  {t('admin.quickActions.analytics')}
                </span>
              </button>
            </div>
          </div>

          {/* User Management Section */}
          <div className={`glass-card ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 lg:mb-0`}>
                {t('admin.userManagement.title')}
              </h2>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('admin.userManagement.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`glass-input pl-10 pr-4 py-2 rounded-lg w-full sm:w-64 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Role Filter */}
                <div className="relative dropdown-container z-20">
                  <button
                    type="button"
                    onClick={() => setShowRoleFilterDropdown(!showRoleFilterDropdown)}
                    className={`glass-input px-4 py-2 pr-8 rounded-lg transition-all duration-200 text-left min-w-[120px] relative ${isDarkMode ? 'text-gray-100' : 'text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  >
                    {roleFilter === '' ? t('admin.userManagement.filters.allRoles') :
                      roleFilter === 'STUDENT' ? t('admin.userManagement.filters.students') :
                        roleFilter === 'FACULTY' ? t('admin.userManagement.filters.faculty') : t('admin.userManagement.filters.admins')}
                    <span className={`absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>

                  {showRoleFilterDropdown && (
                    <div className={`absolute z-50 w-full mt-1 rounded-lg border shadow-xl ${isDarkMode
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-white border-gray-300'
                      }`}>
                      {[
                        { value: '', label: t('admin.userManagement.filters.allRoles') },
                        { value: 'STUDENT', label: t('admin.userManagement.filters.students') },
                        { value: 'FACULTY', label: t('admin.userManagement.filters.faculty') },
                        { value: 'ADMIN', label: t('admin.userManagement.filters.admins') }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setRoleFilter(option.value);
                            setShowRoleFilterDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add User Button */}
                <button
                  onClick={() => openUserModal()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('admin.userManagement.addUser')}
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className={`flex items-center gap-4 p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  {selectedUsers.length} {t('admin.userManagement.bulkActions.selected')}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => performBulkAction('enable')}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                  >
                    {t('admin.userManagement.bulkActions.enable')}
                  </button>
                  <button
                    onClick={() => performBulkAction('disable')}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded transition-colors"
                  >
                    {t('admin.userManagement.bulkActions.disable')}
                  </button>
                  <button
                    onClick={() => performBulkAction('delete')}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                  >
                    {t('admin.userManagement.bulkActions.delete')}
                  </button>
                </div>
              </div>
            )}

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className="text-left p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users?.users.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </th>
                    <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('admin.userManagement.table.headers.user')}
                    </th>
                    <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('admin.userManagement.table.headers.role')}
                    </th>
                    <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('admin.userManagement.table.headers.details')}
                    </th>
                    <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('admin.userManagement.table.headers.status')}
                    </th>
                    <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {t('admin.userManagement.table.headers.actions')}
                    </th>
                  </tr>
                </thead>
              </table>
              {/* Scrollable table body container - max 5 users visible at once */}
              <div className={`max-h-[400px] overflow-y-auto ${isDarkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
                <table className="w-full">
                  <tbody>
                  {users?.users.map((user) => (
                    <tr
                      key={user.id}
                      className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/30' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserSelect(user.id)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {user.imageUrl ? (
                            <img
                              src={user.imageUrl}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {user.firstName} {user.lastName}
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {user.email}
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)} w-fit`}>
                            {user.role}
                          </span>
                          {user.provider && user.provider !== 'local' && (
                            <span className={`px-2 py-1 text-xs rounded-full w-fit ${user.provider === 'google'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              }`}>
                              {user.provider === 'google' ? '🔐 Google' : `🔐 ${user.provider}`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {user.studentId && (
                            <div>{t('admin.userManagement.table.details.id')}: {user.studentId}</div>
                          )}
                          {user.major && (
                            <div>{t('admin.userManagement.table.details.major')}: {user.major}</div>
                          )}
                          {user.year && (
                            <div>{t('admin.userManagement.table.details.year')}: {user.year}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${user.enabled
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                          {user.enabled ? t('admin.userManagement.table.status.active') : t('admin.userManagement.table.status.disabled')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openUserModal(user)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                            title={t('admin.userManagement.table.actions.edit')}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className="p-2 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded transition-colors"
                            title={user.enabled ? t('admin.userManagement.table.actions.disable') : t('admin.userManagement.table.actions.enable')}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                            title={t('admin.userManagement.table.actions.delete')}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('admin.userManagement.pagination.showing')} {((users?.currentPage || 0) * pageSize) + 1} {t('admin.userManagement.pagination.to')} {Math.min(((users?.currentPage || 0) + 1) * pageSize, users?.totalItems || 0)} {t('admin.userManagement.pagination.of')} {users?.totalItems || 0} {t('admin.userManagement.pagination.users')}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={!users?.hasPrevious}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('admin.userManagement.pagination.previous')}
                </button>
                <span className={`px-3 py-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('admin.userManagement.pagination.page')} {(users?.currentPage || 0) + 1} {t('admin.userManagement.pagination.of')} {users?.totalPages || 1}
                </span>
                <button
                  disabled={!users?.hasNext}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('admin.userManagement.pagination.next')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {selectedUser ? t('admin.modal.editUser') : t('admin.modal.addUser')}
                </h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('admin.modal.fields.firstName')}</label>
                    <input
                      type="text"
                      required
                      value={userForm.firstName}
                      onChange={(e) => setUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder={t('admin.modal.placeholders.firstName')}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('admin.modal.fields.lastName')}</label>
                    <input
                      type="text"
                      required
                      value={userForm.lastName}
                      onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder={t('admin.modal.placeholders.lastName')}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('admin.modal.fields.email')}</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={t('admin.modal.placeholders.email')}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('admin.modal.fields.username')}</label>
                  <input
                    type="text"
                    required
                    value={userForm.username}
                    onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder={t('admin.modal.placeholders.username')}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>

                {!selectedUser && (
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('admin.modal.fields.password')}</label>
                    <input
                      type="password"
                      required={!selectedUser}
                      value={userForm.password}
                      onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder={t('admin.modal.placeholders.password')}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    />
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('admin.modal.fields.role')}</label>
                  <div className="relative dropdown-container">
                    <button
                      type="button"
                      onClick={() => setShowUserRoleDropdown(!showUserRoleDropdown)}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 text-left ${isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100'
                        : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    >
                      {userForm.role === 'STUDENT' ? t('admin.modal.roles.student') :
                        userForm.role === 'FACULTY' ? t('admin.modal.roles.faculty') : t('admin.modal.roles.admin')}
                      <div className={`absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {showUserRoleDropdown && (
                      <div className={`absolute z-10 w-full mt-1 rounded-lg border shadow-lg ${isDarkMode
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-white border-gray-300'
                        }`}>
                        {[
                          { value: 'STUDENT', label: t('admin.modal.roles.student') },
                          { value: 'FACULTY', label: t('admin.modal.roles.faculty') },
                          { value: 'ADMIN', label: t('admin.modal.roles.admin') }
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setUserForm(prev => ({ ...prev, role: option.value as 'STUDENT' | 'FACULTY' | 'ADMIN' }));
                              setShowUserRoleDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-900'
                              }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Student Information */}
                {userForm.role === 'STUDENT' && (
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>{t('admin.modal.sections.studentInfo')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('admin.modal.fields.studentId')}</label>
                        <input
                          type="text"
                          value={userForm.studentId}
                          onChange={(e) => setUserForm(prev => ({ ...prev, studentId: e.target.value }))}
                          placeholder={t('admin.modal.placeholders.studentId')}
                          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('admin.modal.fields.academicYear')}</label>
                        <input
                          type="number"
                          min="1"
                          max="8"
                          value={userForm.year || ''}
                          onChange={(e) => setUserForm(prev => ({ ...prev, year: e.target.value ? parseInt(e.target.value) : undefined }))}
                          placeholder={t('admin.modal.placeholders.academicYear')}
                          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{t('admin.modal.fields.major')}</label>
                      <input
                        type="text"
                        value={userForm.major}
                        onChange={(e) => setUserForm(prev => ({ ...prev, major: e.target.value }))}
                        placeholder={t('admin.modal.placeholders.major')}
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                      />
                    </div>
                  </div>
                )}

                {/* Account Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={userForm.enabled}
                    onChange={(e) => setUserForm(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="mr-3"
                  />
                  <label htmlFor="enabled" className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('admin.modal.accountEnabled')}
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                  >
                    {t('admin.modal.buttons.cancel')}
                  </button>
                  <button
                    onClick={saveUser}
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {selectedUser ? t('admin.modal.buttons.update') : t('admin.modal.buttons.create')}
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