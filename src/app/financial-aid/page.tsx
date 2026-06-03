// src/app/financial-aid/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import ImageUpload from '@/components/ImageUpload';
import financialAidService, { FinancialAidApplication, FinancialAidRequest, DonationRequest as ServiceDonationRequest, FinancialAidStats } from '@/services/financialAidService';
import paymentService from '@/services/paymentService';
import stripeService from '@/services/stripeService';

// --- Interfaces ---
interface FinancialAidOpportunity {
  id: string;
  title: string;
  type: 'scholarship' | 'grant' | 'work-study' | 'loan' | 'emergency';
  amount: number;
  deadline: Date;
  eligibility: string[];
  requirements: string[];
  description: string;
  provider: string;
  applicationStatus?: 'not-started' | 'in-progress' | 'submitted' | 'approved' | 'rejected';
  renewableYears?: number;
}

interface DonationRequest {
  id: string;
  title: string;
  description: string;
  requestedAmount: number;
  raisedAmount: number;
  studentId: string;
  isAnonymous: boolean;
  category: 'tuition' | 'books' | 'housing' | 'food' | 'technology' | 'emergency' | 'other';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  deadline: Date;
  status: 'active' | 'funded' | 'expired' | 'verified';
  verificationLevel: 'unverified' | 'basic' | 'full';
  story: string;
  supporters: number;
  updates: DonationUpdate[];
}

interface DonationUpdate {
  id: string;
  date: Date;
  message: string;
  amount?: number;
}

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  remaining: number;
  color: string;
}

interface FinancialProfile {
  totalIncome: number;
  totalExpenses: number;
  availableAid: number;
  gpa: number;
  creditHours: number;
  familyIncome: number;
  isFirstGen: boolean;
  hasFinancialNeed: boolean;
}

export default function FinancialAidPage() {
  const { isDarkMode } = useDarkMode();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<FinancialAidApplication | null>(null);
  const [selectedAid, setSelectedAid] = useState<FinancialAidOpportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [donationSubmitted, setDonationSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAidTypeDropdown, setShowAidTypeDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showUrgencyDropdown, setShowUrgencyDropdown] = useState(false);
  
  // Real data from backend
  const [applications, setApplications] = useState<FinancialAidApplication[]>([]);
  const [donationEligibleApps, setDonationEligibleApps] = useState<FinancialAidApplication[]>([]);
  const [userApplications, setUserApplications] = useState<FinancialAidApplication[]>([]);
  const [realStats, setRealStats] = useState<FinancialAidStats | null>(null);
  
  // Application form state
  const [newApplicationForm, setNewApplicationForm] = useState<FinancialAidRequest>({
    title: '',
    description: '',
    aidType: 'CUSTOM',
    category: 'Emergency',
    requestedAmount: 0,
    priority: 'MEDIUM',
    urgency: 'MEDIUM',
    isAnonymous: false,
    personalStory: '',
    isDonationEligible: false
  });
  
  // Donation form state
  const [donationForm, setDonationForm] = useState<ServiceDonationRequest>({
    financialAidId: 0,
    amount: 0,
    isAnonymous: false,
    message: ''
  });

  // Financial profile - will be loaded from backend or calculated
  const [financialProfile, setFinancialProfile] = useState<FinancialProfile>({
    totalIncome: 0,
    totalExpenses: 0,
    availableAid: 0,
    gpa: 0,
    creditHours: 0,
    familyIncome: 0,
    isFirstGen: false,
    hasFinancialNeed: false
  });

  // Budget data - persisted in localStorage
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [budgetForm, setBudgetForm] = useState({ name: '', budgeted: 0, spent: 0, color: '#3B82F6' });

  const budgetColors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#06B6D4'];

  // Load budget from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('budget_categories');
      if (saved) {
        try { setBudgetCategories(JSON.parse(saved)); } catch {}
      }
    }
  }, []);

  // Save budget to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && budgetCategories.length > 0) {
      localStorage.setItem('budget_categories', JSON.stringify(budgetCategories));
    }
  }, [budgetCategories]);

  const addOrUpdateBudgetCategory = () => {
    if (!budgetForm.name.trim() || budgetForm.budgeted <= 0) return;
    const remaining = budgetForm.budgeted - budgetForm.spent;
    if (editingBudgetId) {
      setBudgetCategories(prev => prev.map(c => c.id === editingBudgetId
        ? { ...c, name: budgetForm.name, budgeted: budgetForm.budgeted, spent: budgetForm.spent, remaining, color: budgetForm.color }
        : c
      ));
      setEditingBudgetId(null);
    } else {
      setBudgetCategories(prev => [...prev, {
        id: Date.now().toString(),
        name: budgetForm.name,
        budgeted: budgetForm.budgeted,
        spent: budgetForm.spent,
        remaining,
        color: budgetForm.color,
      }]);
    }
    setBudgetForm({ name: '', budgeted: 0, spent: 0, color: budgetColors[budgetCategories.length % budgetColors.length] });
    setShowAddBudgetModal(false);
  };

  const deleteBudgetCategory = (id: string) => {
    const updated = budgetCategories.filter(c => c.id !== id);
    setBudgetCategories(updated);
    if (updated.length === 0 && typeof window !== 'undefined') {
      localStorage.removeItem('budget_categories');
    }
  };

  const startEditBudget = (cat: BudgetCategory) => {
    setBudgetForm({ name: cat.name, budgeted: cat.budgeted, spent: cat.spent, color: cat.color });
    setEditingBudgetId(cat.id);
    setShowAddBudgetModal(true);
  };

  // Aid opportunities - will be loaded from backend
  const [aidOpportunities, setAidOpportunities] = useState<FinancialAidOpportunity[]>([]);

  // Donation requests - now using real data from donationEligibleApps
  const [donationRequests] = useState<DonationRequest[]>([]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          loadApplications(),
          loadDonationEligibleApplications(),
          loadStats(),
          ...(isAuthenticated && user ? [loadUserApplications()] : [])
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isAuthenticated, user]);

  const loadApplications = async () => {
    try {
      const data = await financialAidService.getApplications();
      setApplications(data);
    } catch (err) {
      console.error('Error loading applications:', err);
      setError('Failed to load applications');
    }
  };

  const loadDonationEligibleApplications = async () => {
    try {
      const data = await financialAidService.getDonationEligibleApplications();
      setDonationEligibleApps(data);
    } catch (err) {
      console.error('Error loading donation eligible applications:', err);
    }
  };

  const loadUserApplications = async () => {
    if (!user) return;
    try {
      const data = await financialAidService.getUserApplications();
      setUserApplications(data);
    } catch (err) {
      console.error('Error loading user applications:', err);
    }
  };

  const loadStats = async () => {
    try {
      const data = await financialAidService.getStats();
      setRealStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
      // Set default stats on error to prevent NaN displays
      setRealStats({
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        totalApprovedAmount: 0,
        totalRaisedAmount: 0,
        categories: []
      });
    }
  };

  // Handle application submission
  const handleSubmitApplication = async () => {
    try {
      setIsLoading(true);
      await financialAidService.createApplication(newApplicationForm);
      setApplicationSubmitted(true);
      setShowApplicationModal(false);
      setNewApplicationForm({
        title: '',
        description: '',
        aidType: 'CUSTOM',
        category: 'Emergency',
        requestedAmount: 0,
        priority: 'MEDIUM',
        urgency: 'MEDIUM',
        isAnonymous: false,
        personalStory: '',
        isDonationEligible: false
      });
      await loadApplications();
      await loadUserApplications();
      await loadStats();
      setTimeout(() => setApplicationSubmitted(false), 5000);
    } catch (err) {
      setError('Failed to submit application. Please try again.');
      console.error('Error submitting application:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle donation submission via Stripe
  const handleSubmitDonation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Donations must target a real application — general/"#0" donations aren't supported
      if (!donationForm.financialAidId || donationForm.financialAidId <= 0) {
        setError('Please choose a financial aid application to contribute to (click "Contribute" on an application).');
        setIsLoading(false);
        return;
      }

      // Close modal before redirect
      setShowDonationModal(false);

      // Use Stripe Checkout (user will be redirected to Stripe)
      await stripeService.startPayment({
        financialAidId: donationForm.financialAidId,
        amount: donationForm.amount,
        isAnonymous: donationForm.isAnonymous,
        message: donationForm.message,
        donorName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Anonymous Donor',
        donorEmail: user?.email || undefined
      });

      // User will be redirected to Stripe, so we won't reach here

    } catch (err: any) {
      setError(err?.message || 'Failed to process donation. Please try again.');
      console.error('Error processing donation:', err);
      setIsLoading(false);
      setShowDonationModal(true); // Reopen modal on error
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors = {
      'tuition': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'books': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'housing': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'food': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      'technology': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
      'emergency': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      'other': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Get application status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'submitted': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
      case 'in-progress': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'not-started': return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
      case 'rejected': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Calculate financial health score from user's own applications
  const calculateFinancialHealth = () => {
    if (userApplications.length === 0) return 0;
    const approved = userApplications.filter(a => a.status === 'APPROVED' || a.status === 'FUNDED').length;
    const totalRequested = userApplications.reduce((sum, a) => sum + (a.requestedAmount || 0), 0);
    const totalRaised = userApplications.reduce((sum, a) => sum + (a.raisedAmount || 0) + (a.approvedAmount || 0), 0);
    const approvalScore = (approved / userApplications.length) * 50;
    const fundingScore = totalRequested > 0 ? Math.min((totalRaised / totalRequested) * 50, 50) : 0;
    return Math.round(approvalScore + fundingScore);
  };

  const tabs = [
    { id: 'dashboard', name: 'Financial Dashboard', icon: '📊', count: null as number | null },
    { id: 'aid-finder', name: 'Aid Opportunities', icon: '🔍', count: aidOpportunities.length },
    { id: 'donations', name: 'Community Support', icon: '🤝', count: donationEligibleApps.length },
    { id: 'budget', name: 'Budget Tracker', icon: '💰', count: null as number | null },
    { id: 'applications', name: 'My Applications', icon: '📝', count: userApplications.length }
  ];

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 flex items-center justify-center`}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading your financial data...</p>
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className={`text-center p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm shadow-lg`}>
              <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center justify-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Financial Aid & Community Support
              </h1>
              <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto mb-6`}>
                Comprehensive financial assistance platform with community support, eligibility tracking, and budget management tools.
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => setShowApplicationModal(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Apply for Aid
                </button>
                
                <button
                  onClick={() => setActiveTab('donations')}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Make Donation
                </button>

                <button 
                  onClick={() => setShowRequestModal(true)}
                  className={`px-6 py-3 ${isDarkMode ? 'bg-purple-700 hover:bg-purple-600 text-purple-200' : 'bg-purple-100 hover:bg-purple-200 text-purple-700'} rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Request Support
                </button>
              </div>
            </div>
          </div>

          {/* Success Messages */}
          {applicationSubmitted && (
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'} animate-fade-in`}>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className={`${isDarkMode ? 'text-green-300' : 'text-green-800'} font-medium`}>
                  Application submitted successfully! You will be notified once it has been reviewed.
                </p>
              </div>
            </div>
          )}

          {donationSubmitted && (
            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'} animate-fade-in`}>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className={`${isDarkMode ? 'text-blue-300' : 'text-blue-800'} font-medium`}>
                  Thank you for your donation! Your support helps fellow students in need.
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

          {/* Financial Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'} text-center animate-fade-in group relative`}>
              {(() => {
                const healthScore = calculateFinancialHealth();
                const approved = userApplications.filter(a => a.status === 'APPROVED' || a.status === 'FUNDED').length;
                const totalRequested = userApplications.reduce((sum, a) => sum + (a.requestedAmount || 0), 0);
                const totalRaised = userApplications.reduce((sum, a) => sum + (a.raisedAmount || 0) + (a.approvedAmount || 0), 0);
                const approvalPct = userApplications.length > 0 ? Math.round((approved / userApplications.length) * 50) : 0;
                const fundingPct = totalRequested > 0 ? Math.round(Math.min((totalRaised / totalRequested) * 50, 50)) : 0;
                return (
                  <>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {Math.round(healthScore)}%
                    </div>
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'} mb-2`}>Financial Health</div>
                    {/* Progress bar */}
                    <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-blue-100'} overflow-hidden mb-2`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${healthScore >= 75 ? 'bg-green-500' : healthScore >= 40 ? 'bg-blue-500' : 'bg-orange-500'}`}
                        style={{ width: `${healthScore}%` }}
                      />
                    </div>
                    {/* Breakdown */}
                    <div className={`text-xs space-y-1 ${isDarkMode ? 'text-blue-400/70' : 'text-blue-600/70'}`}>
                      {userApplications.length === 0 ? (
                        <p>Submit an application to start tracking</p>
                      ) : (
                        <>
                          <p>Approvals: {approvalPct}/50 &middot; Funding: {fundingPct}/50</p>
                        </>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
            
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'} text-center animate-fade-in`}>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                Rs. {userApplications.filter(a => a.status === 'APPROVED' || a.status === 'FUNDED').reduce((sum, a) => sum + (a.approvedAmount || 0), 0).toLocaleString()}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>My Approved Aid</div>
            </div>
            
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'} text-center animate-fade-in`}>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {donationEligibleApps.length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>Open for Donations</div>
            </div>

            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'} text-center animate-fade-in`}>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                Rs. {userApplications.reduce((sum, a) => sum + (a.raisedAmount || 0), 0).toLocaleString()}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>Raised for Me</div>
            </div>
          </div>

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
                    <span className="hidden sm:inline">{tab.name}</span>
                    {tab.count !== null && tab.count > 0 && (
                      <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full ${
                        activeTab === tab.id
                          ? 'bg-blue-500 text-white'
                          : isDarkMode
                            ? 'bg-gray-600 text-gray-200'
                            : 'bg-gray-200 text-gray-700'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm animate-fade-in`}>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* My Financial Overview - user's own data */}
                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                      {userApplications.length > 0 ? 'My Financial Overview' : 'Get Started'}
                    </h3>

                    {userApplications.length === 0 ? (
                      <div className="space-y-4">
                        <div className={`p-5 rounded-lg text-center ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                          <div className="text-4xl mb-3">🎓</div>
                          <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Need Financial Help?</h4>
                          <p className={`text-sm mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                            Apply for scholarships, grants, or emergency funds. Our community is here to support you.
                          </p>
                          <button
                            onClick={() => setActiveTab('applications')}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
                          >
                            Apply for Aid
                          </button>
                        </div>
                        <div className={`p-5 rounded-lg text-center ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                          <div className="text-4xl mb-3">🤝</div>
                          <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>Support a Fellow Student</h4>
                          <p className={`text-sm mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                            {donationEligibleApps.length > 0
                              ? `${donationEligibleApps.length} student${donationEligibleApps.length > 1 ? 's' : ''} currently need${donationEligibleApps.length === 1 ? 's' : ''} your help.`
                              : 'Check back later for donation opportunities.'}
                          </p>
                          {donationEligibleApps.length > 0 && (
                            <button
                              onClick={() => setActiveTab('donations')}
                              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all"
                            >
                              View Campaigns
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-green-100 dark:bg-green-900/20">
                          <div>
                            <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>My Approved Aid</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                              Rs. {userApplications.filter(a => a.status === 'APPROVED' || a.status === 'FUNDED').reduce((sum, a) => sum + (a.approvedAmount || 0), 0).toLocaleString()}
                            </p>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                          <div>
                            <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Raised for Me</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              Rs. {userApplications.reduce((sum, a) => sum + (a.raisedAmount || 0), 0).toLocaleString()}
                            </p>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                              {userApplications.filter(a => a.status === 'PENDING' || a.status === 'UNDER_REVIEW').length}
                            </p>
                            <p className={`text-xs ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Pending</p>
                          </div>
                          <div className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                              {userApplications.filter(a => a.status === 'APPROVED' || a.status === 'FUNDED').length}
                            </p>
                            <p className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>Approved</p>
                          </div>
                          <div className={`p-3 rounded-lg text-center ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                              {userApplications.filter(a => a.status === 'REJECTED').length}
                            </p>
                            <p className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>Rejected</p>
                          </div>
                        </div>

                        <div className={`flex items-center justify-between p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-100'}`}>
                          <div>
                            <p className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>My Supporters</p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                              {userApplications.reduce((sum, a) => sum + (a.supporterCount || 0), 0)}
                            </p>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recent Aid Applications */}
                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                      Recent Applications
                    </h3>

                    <div className="space-y-4">
                      {userApplications.length === 0 ? (
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          No applications yet. Apply for financial aid to get started.
                        </p>
                      ) : (
                        userApplications.slice(0, 5).map((app) => (
                          <div key={app.id} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600/50' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                {app.title}
                              </h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                app.status === 'APPROVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                app.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              }`}>
                                {app.status}
                              </span>
                            </div>

                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                              Rs. {app.requestedAmount.toLocaleString()} • {app.category}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className={`text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400`}>
                                {app.aidType}
                              </span>
                              <button
                                type="button"
                                onClick={() => { setSelectedApplication(app); setShowDetailsModal(true); }}
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Aid Opportunities Tab */}
            {activeTab === 'aid-finder' && (
              <div className="p-8">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                  Available Aid Opportunities
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {aidOpportunities.map((aid) => (
                    <div key={aid.id} className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} transition-all duration-200 hover:shadow-md`}>
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(aid.type)}`}>
                            {aid.type}
                          </span>
                        </div>
                        
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            Rs. {aid.amount.toLocaleString()}
                          </p>
                          {aid.renewableYears && (
                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Renewable for {aid.renewableYears} years
                            </p>
                          )}
                        </div>
                      </div>

                      <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                        {aid.title}
                      </h3>
                      
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                        {aid.description}
                      </p>

                      <div className="mb-4">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Eligibility Requirements:
                        </p>
                        <ul className="space-y-1">
                          {aid.eligibility.map((req, index) => (
                            <li key={index} className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Provider: {aid.provider}
                          </p>
                          <p className={`text-sm ${aid.deadline < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'text-red-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Deadline: {aid.deadline.toLocaleDateString()}
                          </p>
                        </div>
                        
                        <button 
                          onClick={() => {
                            setSelectedAid(aid);
                            setShowApplicationModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community Support Tab */}
            {activeTab === 'donations' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Community Support Network
                  </h2>
                  <div className="flex space-x-3">
                    {isAuthenticated && (
                      <button 
                        onClick={() => setShowApplicationModal(true)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200"
                      >
                        Request Support
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {donationEligibleApps.map((app) => (
                    <div key={app.id} className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} transition-all duration-200`}>
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(app.category.toLowerCase())}`}>
                            {app.category}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(app.urgency)}`}>
                            {app.urgency}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            Verified
                          </span>
                        </div>
                        
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          app.raisedAmount >= app.requestedAmount ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {app.raisedAmount >= app.requestedAmount ? 'Funded' : 'Active'}
                        </span>
                      </div>

                      <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                        {app.title}
                      </h3>
                      
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                        {app.personalStory || app.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Progress
                          </span>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Rs. {app.raisedAmount.toLocaleString()} / Rs. {app.requestedAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2`}>
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              app.raisedAmount >= app.requestedAmount ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min((app.raisedAmount / app.requestedAmount) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <p>{app.supporterCount} supporters</p>
                          <p>Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                          {!app.isAnonymous && app.applicantName && (
                            <p>By: {app.applicantName}</p>
                          )}
                        </div>
                        
                        {app.raisedAmount < app.requestedAmount && isAuthenticated && (
                          <button 
                            onClick={() => {
                              setDonationForm({...donationForm, financialAidId: app.id});
                              setShowDonationModal(true);
                            }}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                          >
                            Contribute
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {donationEligibleApps.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No donation requests available at the moment.</p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-2`}>Check back later for community support opportunities.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Budget Tracker Tab */}
            {activeTab === 'budget' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Budget Tracker
                  </h2>
                  <button
                    onClick={() => { setBudgetForm({ name: '', budgeted: 0, spent: 0, color: budgetColors[budgetCategories.length % budgetColors.length] }); setEditingBudgetId(null); setShowAddBudgetModal(true); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Add Category
                  </button>
                </div>

                {/* Add/Edit Budget Modal */}
                {showAddBudgetModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAddBudgetModal(false)}>
                    <div className={`w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
                      <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {editingBudgetId ? 'Edit Category' : 'Add Budget Category'}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category Name</label>
                          <input
                            type="text"
                            value={budgetForm.name}
                            onChange={e => setBudgetForm({...budgetForm, name: e.target.value})}
                            placeholder="e.g. Tuition, Food, Transport"
                            className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 outline-none`}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Budget (Rs.)</label>
                            <input
                              type="number"
                              value={budgetForm.budgeted || ''}
                              onChange={e => setBudgetForm({...budgetForm, budgeted: parseFloat(e.target.value) || 0})}
                              placeholder="0"
                              min="0"
                              className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 outline-none`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Spent (Rs.)</label>
                            <input
                              type="number"
                              value={budgetForm.spent || ''}
                              onChange={e => setBudgetForm({...budgetForm, spent: parseFloat(e.target.value) || 0})}
                              placeholder="0"
                              min="0"
                              className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 outline-none`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Color</label>
                          <div className="flex gap-2 flex-wrap">
                            {budgetColors.map(c => (
                              <button
                                key={c}
                                onClick={() => setBudgetForm({...budgetForm, color: c})}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${budgetForm.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowAddBudgetModal(false)} className={`flex-1 px-4 py-2 rounded-lg font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                          Cancel
                        </button>
                        <button
                          onClick={addOrUpdateBudgetCategory}
                          disabled={!budgetForm.name.trim() || budgetForm.budgeted <= 0}
                          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium"
                        >
                          {editingBudgetId ? 'Update' : 'Add'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {budgetCategories.length === 0 ? (
                  <div className={`text-center py-16 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <div className="text-5xl mb-4">📊</div>
                    <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>No Budget Categories Yet</h3>
                    <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Start tracking your monthly spending by adding budget categories like Tuition, Food, Transport, etc.
                    </p>
                    <button
                      onClick={() => { setBudgetForm({ name: '', budgeted: 0, spent: 0, color: '#3B82F6' }); setEditingBudgetId(null); setShowAddBudgetModal(true); }}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    >
                      Add Your First Category
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Budget Categories */}
                    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                        Budget Categories
                      </h3>

                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                        {budgetCategories.map((category) => (
                          <div key={category.id} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600/50' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                                <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                  {category.name}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-medium ${category.remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                  {category.remaining < 0 ? 'Over by ' : 'Left: '}Rs. {Math.abs(category.remaining).toLocaleString()}
                                </span>
                                <button onClick={() => startEditBudget(category)} className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-500 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} title="Edit">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button onClick={() => deleteBudgetCategory(category.id)} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500" title="Delete">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            </div>

                            <div className="mb-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Spent: Rs. {category.spent.toLocaleString()}
                                </span>
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Budget: Rs. {category.budgeted.toLocaleString()}
                                </span>
                              </div>
                              <div className={`w-full rounded-full h-2.5 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-200'}`}>
                                <div
                                  className={`h-2.5 rounded-full transition-all duration-300`}
                                  style={{
                                    width: `${Math.min((category.spent / category.budgeted) * 100, 100)}%`,
                                    backgroundColor: category.spent > category.budgeted ? '#EF4444' : category.spent > category.budgeted * 0.8 ? '#F59E0B' : category.color
                                  }}
                                ></div>
                              </div>
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                {Math.round((category.spent / category.budgeted) * 100)}% used
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Budget Summary */}
                    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                        Budget Summary
                      </h3>

                      {/* Total Overview */}
                      <div className={`p-5 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-600/50 border border-gray-500' : 'bg-white border border-gray-200'}`}>
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Budgeted</p>
                            <p className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              Rs. {budgetCategories.reduce((sum, c) => sum + c.budgeted, 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Spent</p>
                            <p className={`text-lg font-bold ${budgetCategories.reduce((sum, c) => sum + c.spent, 0) > budgetCategories.reduce((sum, c) => sum + c.budgeted, 0) ? 'text-red-500' : isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                              Rs. {budgetCategories.reduce((sum, c) => sum + c.spent, 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs uppercase tracking-wide ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Remaining</p>
                            <p className={`text-lg font-bold ${budgetCategories.reduce((sum, c) => sum + c.remaining, 0) < 0 ? 'text-red-500' : isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              Rs. {budgetCategories.reduce((sum, c) => sum + c.remaining, 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className={`w-full rounded-full h-3 ${isDarkMode ? 'bg-gray-500' : 'bg-gray-200'}`}>
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                              budgetCategories.reduce((sum, c) => sum + c.spent, 0) / budgetCategories.reduce((sum, c) => sum + c.budgeted, 0) > 1 ? 'bg-red-500' :
                              budgetCategories.reduce((sum, c) => sum + c.spent, 0) / budgetCategories.reduce((sum, c) => sum + c.budgeted, 0) > 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((budgetCategories.reduce((sum, c) => sum + c.spent, 0) / budgetCategories.reduce((sum, c) => sum + c.budgeted, 0)) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {Math.round((budgetCategories.reduce((sum, c) => sum + c.spent, 0) / budgetCategories.reduce((sum, c) => sum + c.budgeted, 0)) * 100)}% of total budget used
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                          <h4 className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} mb-1`}>Monthly Progress</h4>
                          <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                            Tracking {budgetCategories.length} {budgetCategories.length === 1 ? 'category' : 'categories'} this month.
                          </p>
                        </div>

                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                          <h4 className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-800'} mb-1`}>On Track</h4>
                          <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                            {budgetCategories.filter(c => c.spent <= c.budgeted).length} of {budgetCategories.length} categories within budget.
                          </p>
                        </div>

                        {budgetCategories.some(c => c.spent > c.budgeted) && (
                          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                            <h4 className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'} mb-1`}>Over Budget</h4>
                            <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                              {budgetCategories.filter(c => c.spent > c.budgeted).map(c => c.name).join(', ')} exceeded limits.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* My Applications Tab */}
            {activeTab === 'applications' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    My Applications
                  </h2>
                  {isAuthenticated && (
                    <button 
                      onClick={() => setShowApplicationModal(true)}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      New Application
                    </button>
                  )}
                </div>
                
                {!isAuthenticated ? (
                  <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>Please log in to view your applications.</p>
                    <Link 
                      href="/login"
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      Log In
                    </Link>
                  </div>
                ) : userApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>You haven't submitted any applications yet.</p>
                    <button
                      type="button"
                      onClick={() => setShowApplicationModal(true)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      Apply for Financial Aid
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userApplications.map((app) => (
                      <div key={app.id} className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} transition-all duration-200`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                {app.title}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(app.category.toLowerCase())}`}>
                                {app.aidType.replace('_', ' ')}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status.toLowerCase())}`}>
                                {app.status.replace('_', ' ')}
                              </span>
                              {app.isDonationEligible && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                  Donation Eligible
                                </span>
                              )}
                            </div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                              {app.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Requested: Rs. {app.requestedAmount.toLocaleString()}
                              </span>
                              {app.approvedAmount && (
                                <span className={`text-green-600 dark:text-green-400`}>
                                  Approved: Rs. {app.approvedAmount.toLocaleString()}
                                </span>
                              )}
                              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {new Date(app.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {app.isDonationEligible && app.raisedAmount > 0 && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Community Support
                                  </span>
                                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Rs. {app.raisedAmount.toLocaleString()} raised by {app.supporterCount} supporters
                                  </span>
                                </div>
                                <div className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2`}>
                                  <div 
                                    className="h-2 bg-purple-500 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min((app.raisedAmount / app.requestedAmount) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedApplication(app);
                                setShowDetailsModal(true);
                              }}
                              className={`px-4 py-2 text-sm ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg transition-all duration-200`}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {userApplications.length === 0 && (
                      <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>You haven't submitted any applications yet.</p>
                        <button 
                          onClick={() => setShowApplicationModal(true)}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                        >
                          Submit Your First Application
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Application Modal */}
        {showApplicationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Apply for Financial Aid
                </h2>
                <button 
                  onClick={() => {
                    setShowApplicationModal(false);
                    setSelectedAid(null);
                  }}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                  aria-label="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Application Title</label>
                    <input
                      type="text"
                      value={newApplicationForm.title}
                      onChange={(e) => setNewApplicationForm({...newApplicationForm, title: e.target.value})}
                      placeholder="e.g., Emergency Tuition Support"
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Aid Type</label>
                    <div className="relative dropdown-container">
                      <button
                        type="button"
                        onClick={() => setShowAidTypeDropdown(!showAidTypeDropdown)}
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 text-left ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        aria-label="Select aid type"
                        aria-haspopup="listbox"
                        aria-expanded={showAidTypeDropdown}
                      >
                        {newApplicationForm.aidType ? newApplicationForm.aidType.replace('_', ' ') : 'Select aid type'}
                        <div className={`absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {showAidTypeDropdown && (
                        <div className={`absolute z-10 w-full mt-1 rounded-lg border shadow-lg ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-white border-gray-300'
                        }`}>
                          {[
                            { value: 'SCHOLARSHIP', label: 'Scholarship' },
                            { value: 'GRANT', label: 'Grant' },
                            { value: 'EMERGENCY_FUND', label: 'Emergency Fund' },
                            { value: 'LOAN', label: 'Loan' },
                            { value: 'WORK_STUDY', label: 'Work Study' },
                            { value: 'CUSTOM', label: 'Custom Request' }
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setNewApplicationForm({...newApplicationForm, aidType: option.value as any});
                                setShowAidTypeDropdown(false);
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Category</label>
                    <div className="relative dropdown-container">
                      <button
                        type="button"
                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 text-left ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        aria-label="Select category"
                        aria-haspopup="listbox"
                        aria-expanded={showCategoryDropdown}
                      >
                        {newApplicationForm.category || 'Select a category'}
                        <div className={`absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {showCategoryDropdown && (
                        <div className={`absolute z-10 w-full mt-1 rounded-lg border shadow-lg ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-white border-gray-300'
                        }`}>
                          {['Tuition', 'Books', 'Housing', 'Food', 'Technology', 'Emergency', 'Other'].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setNewApplicationForm({...newApplicationForm, category: option});
                                setShowCategoryDropdown(false);
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg ${
                                isDarkMode ? 'text-gray-100' : 'text-gray-900'
                              }`}
                            >
                              {option === 'Books' ? 'Books & Supplies' : option === 'Food' ? 'Food & Meals' : option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Requested Amount (LKR)</label>
                    <input
                      type="number"
                      value={newApplicationForm.requestedAmount || ''}
                      onChange={(e) => setNewApplicationForm({...newApplicationForm, requestedAmount: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                      min="0"
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Description</label>
                  <textarea
                    rows={4}
                    value={newApplicationForm.description}
                    onChange={(e) => setNewApplicationForm({...newApplicationForm, description: e.target.value})}
                    placeholder="Provide detailed description of your financial need..."
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Personal Story (Optional)</label>
                  <textarea
                    rows={4}
                    value={newApplicationForm.personalStory}
                    onChange={(e) => setNewApplicationForm({...newApplicationForm, personalStory: e.target.value})}
                    placeholder="Share your story to help reviewers understand your situation..."
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>

                {/* Supporting Documents Upload */}
                <ImageUpload
                  onImageUpload={(imageUrl) => {
                    setNewApplicationForm({...newApplicationForm, supportingDocuments: imageUrl});
                  }}
                  currentImage={newApplicationForm.supportingDocuments}
                  onImageRemove={() => {
                    setNewApplicationForm({...newApplicationForm, supportingDocuments: ''});
                  }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Priority Level</label>
                    <div className="relative dropdown-container">
                      <button
                        type="button"
                        onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 text-left ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        aria-label="Select priority level"
                        aria-haspopup="listbox"
                        aria-expanded={showPriorityDropdown}
                      >
                        {newApplicationForm.priority ? newApplicationForm.priority.charAt(0) + newApplicationForm.priority.slice(1).toLowerCase() : 'Select priority'}
                        <div className={`absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {showPriorityDropdown && (
                        <div className={`absolute z-10 w-full mt-1 rounded-lg border shadow-lg ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-white border-gray-300'
                        }`}>
                          {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setNewApplicationForm({...newApplicationForm, priority: option as any});
                                setShowPriorityDropdown(false);
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg ${
                                isDarkMode ? 'text-gray-100' : 'text-gray-900'
                              }`}
                            >
                              {option.charAt(0) + option.slice(1).toLowerCase()}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Urgency</label>
                    <div className="relative dropdown-container">
                      <button
                        type="button"
                        onClick={() => setShowUrgencyDropdown(!showUrgencyDropdown)}
                        className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 text-left ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        aria-label="Select urgency level"
                        aria-haspopup="listbox"
                        aria-expanded={showUrgencyDropdown}
                      >
                        {newApplicationForm.urgency ? newApplicationForm.urgency.charAt(0) + newApplicationForm.urgency.slice(1).toLowerCase() : 'Select urgency'}
                        <div className={`absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {showUrgencyDropdown && (
                        <div className={`absolute z-10 w-full mt-1 rounded-lg border shadow-lg ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-white border-gray-300'
                        }`}>
                          {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setNewApplicationForm({...newApplicationForm, urgency: option as any});
                                setShowUrgencyDropdown(false);
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg ${
                                isDarkMode ? 'text-gray-100' : 'text-gray-900'
                              }`}
                            >
                              {option.charAt(0) + option.slice(1).toLowerCase()}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Privacy Options */}
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>Privacy & Donation Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={newApplicationForm.isAnonymous}
                        onChange={(e) => setNewApplicationForm({...newApplicationForm, isAnonymous: e.target.checked})}
                        className="mr-3" 
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Keep my identity anonymous</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={newApplicationForm.isDonationEligible}
                        onChange={(e) => setNewApplicationForm({...newApplicationForm, isDonationEligible: e.target.checked})}
                        className="mr-3" 
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Allow community donations if approved</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={() => setShowApplicationModal(false)}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmitApplication}
                    disabled={!newApplicationForm.title || !newApplicationForm.description || !newApplicationForm.requestedAmount || isLoading}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Donation Modal */}
        {showDonationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Make a Donation</h2>
                <button 
                  onClick={() => setShowDonationModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                  aria-label="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                  Support Fellow Students
                </h3>
                
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  Your donation helps students in need cover essential expenses like textbooks, housing, and emergency costs.
                </p>

                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDonationForm({...donationForm, amount: 5000})}
                      className={`px-4 py-2 border rounded-lg transition-all duration-200 ${
                        donationForm.amount === 5000
                          ? 'border-green-600 bg-green-600 text-white'
                          : 'border-green-300 text-green-700 dark:border-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                    >
                      Rs. 5,000
                    </button>
                    <button
                      type="button"
                      onClick={() => setDonationForm({...donationForm, amount: 10000})}
                      className={`px-4 py-2 border rounded-lg transition-all duration-200 ${
                        donationForm.amount === 10000
                          ? 'border-green-600 bg-green-600 text-white'
                          : 'border-green-300 text-green-700 dark:border-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                    >
                      Rs. 10,000
                    </button>
                    <button
                      type="button"
                      onClick={() => setDonationForm({...donationForm, amount: 20000})}
                      className={`px-4 py-2 border rounded-lg transition-all duration-200 ${
                        donationForm.amount === 20000
                          ? 'border-green-600 bg-green-600 text-white'
                          : 'border-green-300 text-green-700 dark:border-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                    >
                      Rs. 20,000
                    </button>
                  </div>

                  <input
                    type="number"
                    placeholder="Custom amount"
                    value={donationForm.amount || ''}
                    onChange={(e) => setDonationForm({...donationForm, amount: Number(e.target.value)})}
                    className={`w-full px-4 py-3 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />

                  <button
                    type="button"
                    onClick={handleSubmitDonation}
                    disabled={!donationForm.amount || donationForm.amount <= 0 || isLoading}
                    className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg ${
                      !donationForm.amount || donationForm.amount <= 0 || isLoading
                        ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isLoading ? 'Processing...' : `Donate Rs. ${donationForm.amount?.toLocaleString() || 0}`}
                  </button>

                  <label className="flex items-center text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={donationForm.isAnonymous}
                      onChange={(e) => setDonationForm({...donationForm, isAnonymous: e.target.checked})}
                      className="mr-2 w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Make this donation anonymous</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Request Support Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Request Support</h2>
                <button 
                  onClick={() => setShowRequestModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                  aria-label="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                  Request Community Support
                </h3>
                
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  Create a verified support request to receive help from fellow students and community members.
                </p>

                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      setShowRequestModal(false);
                      setShowApplicationModal(true);
                    }}
                    className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Create Application
                  </button>
                  
                  <Link 
                    href="/help"
                    className={`block w-full px-6 py-3 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg font-medium transition-all duration-200 text-center`}
                  >
                    Get Guidance First
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Application Details Modal */}
        {showDetailsModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Application Details
                </h2>
                <button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedApplication(null);
                  }}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                  aria-label="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                      {selectedApplication.title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedApplication.status.toLowerCase())}`}>
                        {selectedApplication.status.replace('_', ' ')}
                      </span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getUrgencyColor(selectedApplication.urgency)}`}>
                        {selectedApplication.urgency} Priority
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="mb-2">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Requested Amount</span>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        Rs. {selectedApplication.requestedAmount.toLocaleString()}
                      </p>
                    </div>
                    {selectedApplication.approvedAmount && (
                      <div>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Approved Amount</span>
                        <p className={`text-xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          Rs. {selectedApplication.approvedAmount.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Description</h4>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedApplication.description}</p>
                </div>
                
                {selectedApplication.personalStory && (
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Personal Story</h4>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedApplication.personalStory}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Category</h4>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedApplication.category}</p>
                  </div>
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Application Type</h4>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedApplication.aidType.replace('_', ' ')}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Applied On</h4>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{new Date(selectedApplication.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Last Updated</h4>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{new Date(selectedApplication.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {selectedApplication.isDonationEligible && (
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-800'} mb-2`}>Community Support</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                        Rs. {selectedApplication.raisedAmount.toLocaleString()} raised by {selectedApplication.supporterCount} supporters
                      </span>
                    </div>
                    <div className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2`}>
                      <div 
                        className="h-2 bg-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((selectedApplication.raisedAmount / selectedApplication.requestedAmount) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {selectedApplication.adminNotes && (
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} mb-2`}>Admin Review Notes</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>{selectedApplication.adminNotes}</p>
                    {selectedApplication.reviewedAt && (
                      <p className={`text-xs ${isDarkMode ? 'text-blue-500' : 'text-blue-600'} mt-2`}>
                        Reviewed on {new Date(selectedApplication.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
                
                {selectedApplication.rejectionReason && (
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-red-300' : 'text-red-800'} mb-2`}>Rejection Reason</h4>
                    <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>{selectedApplication.rejectionReason}</p>
                  </div>
                )}
                
                {selectedApplication.supportingDocuments && (
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Supporting Documents</h4>
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/upload/image/serve?url=${encodeURIComponent(selectedApplication.supportingDocuments)}`} 
                      alt="Supporting Document"
                      className="w-full max-w-md h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedApplication(null);
                  }}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}