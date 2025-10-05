'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import axios from 'axios';

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

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const API_BASE = `${API_BASE_URL}/api`;

  // Helper function to get auth headers
  const getAuthHeaders = () => ({
    'Authorization': `Bearer fake-jwt-token`,
    'Content-Type': 'application/json'
  });

  // Load dashboard stats
  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/dashboard/stats`, {
        headers: getAuthHeaders()
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setError('Failed to load dashboard statistics');
    }
  };

  // Load users
  const loadUsers = async () => {
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
  };

  // Delete user
  const deleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

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
    
    if (!confirm(`Are you sure you want to ${action} ${selectedUsers.length} user(s)?`)) return;

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
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p>You need admin privileges to access this page.</p>
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="text-center">
              <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center justify-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Dashboard
              </h1>
              <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto mb-6`}>
                Comprehensive administrative control panel for managing users, financial aid applications, and system-wide settings.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
            {[
              { 
                title: 'Total Users', 
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
                title: 'Students', 
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
                title: 'Faculty', 
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
                title: 'Admins', 
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-fade-in">
            {/* User Management */}
            <div className={`glass-card ${isDarkMode ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/30' : 'bg-gradient-to-br from-blue-50/90 to-blue-100/90 border-blue-200/50'} backdrop-blur-lg border p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 cursor-pointer h-full flex flex-col`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-800/50' : 'bg-blue-100'} flex-shrink-0`}>
                  <svg className={`w-8 h-8 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-600'} block`}>
                    {stats?.totalUsers || 0}
                  </span>
                  <span className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                    Total Users
                  </span>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                  User Management
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 leading-relaxed`}>
                  Manage student, faculty, and admin accounts with comprehensive user control features
                </p>
              </div>
              <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-600'} flex items-center justify-end`}>
                  Manage Users
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Financial Aid Management */}
            <Link href="/admin/financial-aid">
              <div className={`glass-card ${isDarkMode ? 'bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/30' : 'bg-gradient-to-br from-green-50/90 to-green-100/90 border-green-200/50'} backdrop-blur-lg border p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 cursor-pointer h-full flex flex-col`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-800/50' : 'bg-green-100'} flex-shrink-0`}>
                    <svg className={`w-8 h-8 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-600'} bg-gradient-to-r ${isDarkMode ? 'from-green-400 to-green-300' : 'from-green-600 to-green-500'} bg-clip-text text-transparent block`}>
                      ACTIVE
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-500'}`}>
                      Available
                    </span>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                    Financial Aid
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 leading-relaxed`}>
                    Review and manage financial aid applications, track funding status, and process approvals
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-600'} flex items-center justify-end`}>
                    Manage Applications
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>

            {/* System Settings */}
            <div className={`glass-card ${isDarkMode ? 'bg-gradient-to-br from-purple-900/20 to-purple-800/20 border-purple-700/30' : 'bg-gradient-to-br from-purple-50/90 to-purple-100/90 border-purple-200/50'} backdrop-blur-lg border p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 cursor-pointer opacity-60 h-full flex flex-col`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-800/50' : 'bg-purple-100'} flex-shrink-0`}>
                  <svg className={`w-8 h-8 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-600'} bg-gradient-to-r ${isDarkMode ? 'from-purple-400 to-purple-300' : 'from-purple-600 to-purple-500'} bg-clip-text text-transparent block`}>
                    SOON
                  </span>
                  <span className={`text-xs ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`}>
                    Coming
                  </span>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                  System Settings
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 leading-relaxed`}>
                  Configure system-wide settings, manage preferences, and control platform features
                </p>
              </div>
              <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-600'} flex items-center justify-end opacity-60`}>
                  Coming Soon
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={`glass-card ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm mb-8 animate-fade-in`}>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => openUserModal()}
                className={`p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105 ${
                  isDarkMode 
                    ? 'border-gray-600 hover:border-blue-500 bg-gray-700/30 hover:bg-blue-900/20' 
                    : 'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50'
                }`}
              >
                <div className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mb-2`}>
                  <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Add New User
                </span>
              </button>

              <Link href="/admin/financial-aid">
                <div className={`p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105 cursor-pointer ${
                  isDarkMode 
                    ? 'border-gray-600 hover:border-green-500 bg-gray-700/30 hover:bg-green-900/20' 
                    : 'border-gray-300 hover:border-green-400 bg-gray-50 hover:bg-green-50'
                }`}>
                  <div className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} mb-2`}>
                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Review Applications
                  </span>
                </div>
              </Link>

              <button
                onClick={() => {
                  loadStats();
                  loadUsers();
                }}
                className={`p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:scale-105 ${
                  isDarkMode 
                    ? 'border-gray-600 hover:border-purple-500 bg-gray-700/30 hover:bg-purple-900/20' 
                    : 'border-gray-300 hover:border-purple-400 bg-gray-50 hover:bg-purple-50'
                }`}
              >
                <div className={`${isDarkMode ? 'text-purple-400' : 'text-purple-600'} mb-2`}>
                  <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Refresh Data
                </span>
              </button>

              <button
                disabled
                className={`p-4 rounded-lg border-2 border-dashed transition-all duration-200 opacity-50 cursor-not-allowed ${
                  isDarkMode 
                    ? 'border-gray-600 bg-gray-700/30' 
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mb-2`}>
                  <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Analytics (Soon)
                </span>
              </button>
            </div>
          </div>

          {/* User Management Section */}
          <div className={`glass-card ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 lg:mb-0`}>
                User Management
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
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
                <div className="relative dropdown-container">
                  <button
                    type="button"
                    onClick={() => setShowRoleFilterDropdown(!showRoleFilterDropdown)}
                    className={`glass-input px-4 py-2 rounded-lg transition-all duration-200 text-left min-w-[120px] ${
                      isDarkMode ? 'text-gray-100' : 'text-gray-900'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  >
                    {roleFilter === '' ? 'All Roles' : 
                     roleFilter === 'STUDENT' ? 'Students' :
                     roleFilter === 'FACULTY' ? 'Faculty' : 'Admins'}
                    <div className={`absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {showRoleFilterDropdown && (
                    <div className={`absolute z-10 w-full mt-1 rounded-lg border shadow-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}>
                      {[
                        { value: '', label: 'All Roles' },
                        { value: 'STUDENT', label: 'Students' },
                        { value: 'FACULTY', label: 'Faculty' },
                        { value: 'ADMIN', label: 'Admins' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setRoleFilter(option.value);
                            setShowRoleFilterDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg ${
                            isDarkMode ? 'text-gray-100' : 'text-gray-900'
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
                  Add User
                </button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className={`flex items-center gap-4 p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => performBulkAction('enable')}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                  >
                    Enable
                  </button>
                  <button 
                    onClick={() => performBulkAction('disable')}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded transition-colors"
                  >
                    Disable
                  </button>
                  <button 
                    onClick={() => performBulkAction('delete')}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
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
                      User
                    </th>
                    <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Role
                    </th>
                    <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Details
                    </th>
                    <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Status
                    </th>
                    <th className={`text-left p-4 font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
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
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {user.studentId && (
                            <div>ID: {user.studentId}</div>
                          )}
                          {user.major && (
                            <div>Major: {user.major}</div>
                          )}
                          {user.year && (
                            <div>Year: {user.year}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.enabled 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {user.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openUserModal(user)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                            title="Edit"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className="p-2 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded transition-colors"
                            title={user.enabled ? 'Disable' : 'Enable'}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                            title="Delete"
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

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing {((users?.currentPage || 0) * pageSize) + 1} to {Math.min(((users?.currentPage || 0) + 1) * pageSize, users?.totalItems || 0)} of {users?.totalItems || 0} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={!users?.hasPrevious}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                <span className={`px-3 py-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Page {(users?.currentPage || 0) + 1} of {users?.totalPages || 1}
                </span>
                <button
                  disabled={!users?.hasNext}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Next
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
                  {selectedUser ? 'Edit User' : 'Add New User'}
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
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>First Name</label>
                    <input
                      type="text"
                      required
                      value={userForm.firstName}
                      onChange={(e) => setUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter first name"
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Last Name</label>
                    <input
                      type="text"
                      required
                      value={userForm.lastName}
                      onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter last name"
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Email Address</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@university.edu"
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Username</label>
                  <input
                    type="text"
                    required
                    value={userForm.username}
                    onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>

                {!selectedUser && (
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Password</label>
                    <input
                      type="password"
                      required={!selectedUser}
                      value={userForm.password}
                      onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter secure password"
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    />
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>User Role</label>
                  <div className="relative dropdown-container">
                    <button
                      type="button"
                      onClick={() => setShowUserRoleDropdown(!showUserRoleDropdown)}
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 text-left ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    >
                      {userForm.role === 'STUDENT' ? 'Student' :
                       userForm.role === 'FACULTY' ? 'Faculty Member' : 'Administrator'}
                      <div className={`absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    
                    {showUserRoleDropdown && (
                      <div className={`absolute z-10 w-full mt-1 rounded-lg border shadow-lg ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-white border-gray-300'
                      }`}>
                        {[
                          { value: 'STUDENT', label: 'Student' },
                          { value: 'FACULTY', label: 'Faculty Member' },
                          { value: 'ADMIN', label: 'Administrator' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setUserForm(prev => ({ ...prev, role: option.value as 'STUDENT' | 'FACULTY' | 'ADMIN' }));
                              setShowUserRoleDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg ${
                              isDarkMode ? 'text-gray-100' : 'text-gray-900'
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
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>Student Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Student ID</label>
                        <input
                          type="text"
                          value={userForm.studentId}
                          onChange={(e) => setUserForm(prev => ({ ...prev, studentId: e.target.value }))}
                          placeholder="e.g., CS/2021/001"
                          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Academic Year</label>
                        <input
                          type="number"
                          min="1"
                          max="8"
                          value={userForm.year || ''}
                          onChange={(e) => setUserForm(prev => ({ ...prev, year: e.target.value ? parseInt(e.target.value) : undefined }))}
                          placeholder="1-8"
                          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Major/Department</label>
                      <input
                        type="text"
                        value={userForm.major}
                        onChange={(e) => setUserForm(prev => ({ ...prev, major: e.target.value }))}
                        placeholder="e.g., Computer Science"
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                          isDarkMode 
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
                    Account enabled (user can log in)
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowUserModal(false)}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveUser}
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {selectedUser ? 'Update User' : 'Create User'}
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