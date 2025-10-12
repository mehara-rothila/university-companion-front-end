'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import financialAidService, { FinancialAidApplication, AdminReviewRequest, AdminDashboard, AdminFinancialAidRequest } from '@/services/financialAidService';
import { User } from '@/app/context/AuthContext';

export default function AdminFinancialAidPage() {
  const { isDarkMode } = useDarkMode();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applications, setApplications] = useState<FinancialAidApplication[]>([]);
  const [pendingApplications, setPendingApplications] = useState<FinancialAidApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<FinancialAidApplication | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [createSubmitted, setCreateSubmitted] = useState(false);

  // Review form state
  const [reviewForm, setReviewForm] = useState<AdminReviewRequest>({
    status: 'PENDING',
    adminNotes: '',
    isDonationEligible: false
  });

  // Create application state
  const [users, setUsers] = useState<User[]>([]);
  const [createForm, setCreateForm] = useState<AdminFinancialAidRequest>({
    applicantUserId: 0,
    title: '',
    description: '',
    aidType: 'SCHOLARSHIP',
    category: '',
    requestedAmount: 0,
    priority: 'MEDIUM',
    urgency: 'MEDIUM',
    isAnonymous: false,
    supportingDocuments: '',
    personalStory: '',
    applicationDeadline: '',
    isDonationEligible: false,
    adminNotes: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboard();
      loadApplications();
      loadPendingApplications();
      loadUsers();
    }
  }, [isAuthenticated]);

  const loadDashboard = async () => {
    try {
      const data = await financialAidService.getAdminDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard');
    }
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await financialAidService.getAllApplicationsForAdmin();
      setApplications(data);
    } catch (err) {
      console.error('Error loading applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingApplications = async () => {
    try {
      const data = await financialAidService.getPendingApplicationsForAdmin();
      setPendingApplications(data);
    } catch (err) {
      console.error('Error loading pending applications:', err);
    }
  };

  const loadUsers = async () => {
    try {
      // We'll use a mock API call for users - in real implementation this would come from a user service
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer fake-jwt-token`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      // Mock users for demo
      setUsers([
        { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', username: 'johndoe', role: 'STUDENT' },
        { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', username: 'janesmith', role: 'STUDENT' },
      ]);
    }
  };

  const handleReviewApplication = (application: FinancialAidApplication) => {
    setSelectedApplication(application);
    setReviewForm({
      status: application.status === 'DRAFT' || application.status === 'FUNDED' || application.status === 'EXPIRED' 
        ? 'PENDING' 
        : application.status,
      approvedAmount: application.approvedAmount,
      adminNotes: application.adminNotes || '',
      rejectionReason: application.rejectionReason || '',
      isDonationEligible: application.isDonationEligible
    });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedApplication) return;

    try {
      setLoading(true);
      await financialAidService.reviewApplication(selectedApplication.id, reviewForm);
      setReviewSubmitted(true);
      setShowReviewModal(false);
      setSelectedApplication(null);
      await loadApplications();
      await loadPendingApplications();
      await loadDashboard();
      setTimeout(() => setReviewSubmitted(false), 5000);
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      console.error('Error submitting review:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApplication = async () => {
    try {
      setLoading(true);
      await financialAidService.createApplicationForUser(createForm);
      setCreateSubmitted(true);
      setShowCreateModal(false);
      // Reset form
      setCreateForm({
        applicantUserId: 0,
        title: '',
        description: '',
        aidType: 'SCHOLARSHIP',
        category: '',
        requestedAmount: 0,
        priority: 'MEDIUM',
        urgency: 'MEDIUM',
        isAnonymous: false,
        supportingDocuments: '',
        personalStory: '',
        applicationDeadline: '',
        isDonationEligible: false,
        adminNotes: ''
      });
      // Reload data
      await loadApplications();
      await loadPendingApplications();
      await loadDashboard();
      setTimeout(() => setCreateSubmitted(false), 5000);
    } catch (err) {
      setError('Failed to create application. Please try again.');
      console.error('Error creating application:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'REJECTED': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'PENDING': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'UNDER_REVIEW': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'pending', name: 'Pending Review', icon: '⏳' },
    { id: 'all', name: 'All Applications', icon: '📋' }
  ];

  if (!isAuthenticated) {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 flex items-center justify-center`}>
          <div className="text-center">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>Access Denied</h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>You need to be logged in as an admin to access this page.</p>
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
          <div className="mb-8 animate-fade-in">
            <div className="text-center">
              <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center justify-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Financial Aid Administration
              </h1>
              <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto mb-6`}>
                Review and manage financial aid applications from students.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center mx-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Application
              </button>
            </div>
          </div>

          {/* Success Messages */}
          {reviewSubmitted && (
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'} animate-fade-in`}>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className={`${isDarkMode ? 'text-green-300' : 'text-green-800'} font-medium`}>
                  Application review submitted successfully!
                </p>
              </div>
            </div>
          )}

          {createSubmitted && (
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'} animate-fade-in`}>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className={`${isDarkMode ? 'text-green-300' : 'text-green-800'} font-medium`}>
                  Financial aid application created successfully!
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'} animate-fade-in`}>
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

          {/* Dashboard Stats */}
          {dashboard && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'} animate-fade-in`}>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{dashboard.totalApplications}</div>
                <div className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Total Applications</div>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'} animate-fade-in`}>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{dashboard.pendingReview}</div>
                <div className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Pending Review</div>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'} animate-fade-in`}>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{dashboard.approved}</div>
                <div className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>Approved</div>
              </div>
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'} animate-fade-in`}>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{dashboard.criticalUrgency}</div>
                <div className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>Critical Priority</div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm mb-6 animate-fade-in`}>
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-0 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className={`${isDarkMode ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-md animate-fade-in relative z-10`}>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="p-8">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                  Admin Dashboard
                </h2>
                
                {dashboard?.recentPendingApplications && dashboard.recentPendingApplications.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                      Recent Pending Applications
                    </h3>
                    <div className="space-y-4">
                      {dashboard.recentPendingApplications.map((app) => (
                        <div key={app.id} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                {app.title}
                              </h4>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Rs. {app.requestedAmount.toLocaleString()} - {app.category}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(app.urgency)}`}>
                                  {app.urgency}
                                </span>
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {new Date(app.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleReviewApplication(app)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                            >
                              Review
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pending Applications Tab */}
            {activeTab === 'pending' && (
              <div className="p-8">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                  Pending Applications
                </h2>
                
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading applications...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingApplications.map((app) => (
                      <div key={app.id} className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                {app.title}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(app.urgency)}`}>
                                {app.urgency}
                              </span>
                            </div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                              {app.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Amount: Rs. {app.requestedAmount.toLocaleString()}
                              </span>
                              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Category: {app.category}
                              </span>
                              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {new Date(app.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleReviewApplication(app)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                          >
                            Review Application
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {pendingApplications.length === 0 && (
                      <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No pending applications to review.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* All Applications Tab */}
            {activeTab === 'all' && (
              <div className="p-8">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                  All Applications
                </h2>
                
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div key={app.id} className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {app.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                              {app.status.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(app.urgency)}`}>
                              {app.urgency}
                            </span>
                          </div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            {app.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Amount: Rs. {app.requestedAmount.toLocaleString()}
                            </span>
                            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Category: {app.category}
                            </span>
                            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleReviewApplication(app)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                        >
                          {app.status === 'PENDING' ? 'Review' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Review Modal */}
        {showReviewModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Review Application: {selectedApplication.title}
                </h2>
                <button 
                  onClick={() => setShowReviewModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Application Details */}
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                    Application Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Description</label>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedApplication.description}</p>
                    </div>
                    
                    {selectedApplication.personalStory && (
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Personal Story</label>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedApplication.personalStory}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Category</label>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedApplication.category}</p>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Requested Amount</label>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Rs. {selectedApplication.requestedAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Priority</label>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(selectedApplication.priority)}`}>
                          {selectedApplication.priority}
                        </span>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Urgency</label>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(selectedApplication.urgency)}`}>
                          {selectedApplication.urgency}
                        </span>
                      </div>
                    </div>
                    
                    {selectedApplication.supportingDocuments && (
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Supporting Documents</label>
                        <img 
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(selectedApplication.supportingDocuments)}`} 
                          alt="Supporting Document"
                          className="w-full max-w-md h-48 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Review Form */}
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                    Review Decision
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Status</label>
                      <select 
                        value={reviewForm.status}
                        onChange={(e) => setReviewForm({...reviewForm, status: e.target.value as any})}
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}>
                        <option value="PENDING">Pending</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                    
                    {reviewForm.status === 'APPROVED' && (
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Approved Amount (LKR)</label>
                        <input
                          type="number"
                          value={reviewForm.approvedAmount || ''}
                          onChange={(e) => setReviewForm({...reviewForm, approvedAmount: parseFloat(e.target.value) || undefined})}
                          placeholder={selectedApplication.requestedAmount.toString()}
                          min="0"
                          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Admin Notes</label>
                      <textarea
                        rows={4}
                        value={reviewForm.adminNotes}
                        onChange={(e) => setReviewForm({...reviewForm, adminNotes: e.target.value})}
                        placeholder="Add notes about your review decision..."
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>
                    
                    {reviewForm.status === 'REJECTED' && (
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Rejection Reason</label>
                        <textarea
                          rows={3}
                          value={reviewForm.rejectionReason}
                          onChange={(e) => setReviewForm({...reviewForm, rejectionReason: e.target.value})}
                          placeholder="Explain why this application was rejected..."
                          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        />
                      </div>
                    )}
                    
                    {reviewForm.status === 'APPROVED' && (
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={reviewForm.isDonationEligible}
                          onChange={(e) => setReviewForm({...reviewForm, isDonationEligible: e.target.checked})}
                          className="mr-3" 
                        />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Allow community donations for this application
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-8">
                <button 
                  onClick={() => setShowReviewModal(false)}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmitReview}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Application Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Create Financial Aid Application
                </h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Applicant Selection */}
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Select Applicant *
                      </label>
                      <select
                        value={createForm.applicantUserId}
                        onChange={(e) => setCreateForm({...createForm, applicantUserId: Number(e.target.value)})}
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      >
                        <option value={0}>Select a user...</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Title */}
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Application Title *
                      </label>
                      <input
                        type="text"
                        value={createForm.title}
                        onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                        placeholder="Enter application title"
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>

                    {/* Aid Type */}
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Aid Type *
                      </label>
                      <select
                        value={createForm.aidType}
                        onChange={(e) => setCreateForm({...createForm, aidType: e.target.value as any})}
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      >
                        <option value="SCHOLARSHIP">Scholarship</option>
                        <option value="GRANT">Grant</option>
                        <option value="EMERGENCY_FUND">Emergency Fund</option>
                        <option value="LOAN">Loan</option>
                        <option value="WORK_STUDY">Work Study</option>
                        <option value="CUSTOM">Custom</option>
                      </select>
                    </div>

                    {/* Category */}
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Category *
                      </label>
                      <input
                        type="text"
                        value={createForm.category}
                        onChange={(e) => setCreateForm({...createForm, category: e.target.value})}
                        placeholder="e.g., Medical, Academic, Family Emergency"
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>

                    {/* Requested Amount */}
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Requested Amount (Rs.) *
                      </label>
                      <input
                        type="number"
                        value={createForm.requestedAmount}
                        onChange={(e) => setCreateForm({...createForm, requestedAmount: Number(e.target.value)})}
                        placeholder="0"
                        min="1"
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>

                    {/* Priority & Urgency */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Priority
                        </label>
                        <select
                          value={createForm.priority}
                          onChange={(e) => setCreateForm({...createForm, priority: e.target.value as any})}
                          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-gray-100' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Urgency
                        </label>
                        <select
                          value={createForm.urgency}
                          onChange={(e) => setCreateForm({...createForm, urgency: e.target.value as any})}
                          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-gray-100' 
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="CRITICAL">Critical</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Description */}
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Description *
                      </label>
                      <textarea
                        rows={4}
                        value={createForm.description}
                        onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                        placeholder="Describe the financial assistance needed"
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        required
                      />
                    </div>

                    {/* Personal Story */}
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Personal Story
                      </label>
                      <textarea
                        rows={3}
                        value={createForm.personalStory}
                        onChange={(e) => setCreateForm({...createForm, personalStory: e.target.value})}
                        placeholder="Additional context or personal circumstances"
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>

                    {/* Admin Notes */}
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Admin Notes
                      </label>
                      <textarea
                        rows={3}
                        value={createForm.adminNotes}
                        onChange={(e) => setCreateForm({...createForm, adminNotes: e.target.value})}
                        placeholder="Internal notes about this application"
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={createForm.isAnonymous}
                          onChange={(e) => setCreateForm({...createForm, isAnonymous: e.target.checked})}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                        />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Make this application anonymous
                        </span>
                      </label>

                      <label className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={createForm.isDonationEligible}
                          onChange={(e) => setCreateForm({...createForm, isDonationEligible: e.target.checked})}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                        />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Allow community donations for this application
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateApplication}
                  disabled={loading || !createForm.applicantUserId || !createForm.title || !createForm.description || !createForm.category || !createForm.requestedAmount}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Application'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}