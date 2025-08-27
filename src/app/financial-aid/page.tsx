// src/app/financial-aid/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

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
  matchPercentage?: number;
  isRecommended?: boolean;
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

interface AIRecommendation {
  id: string;
  type: 'aid' | 'donation' | 'budget' | 'saving';
  title: string;
  description: string;
  potentialSaving: number;
  confidence: number;
  action: string;
  priority: 'low' | 'medium' | 'high';
}

export default function FinancialAidPage() {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedAid, setSelectedAid] = useState<FinancialAidOpportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock financial profile
  const [financialProfile] = useState<FinancialProfile>({
    totalIncome: 600000, // LKR per year
    totalExpenses: 750000, // LKR per year
    availableAid: 200000, // LKR
    gpa: 3.6,
    creditHours: 15,
    familyIncome: 1200000, // LKR per year
    isFirstGen: true,
    hasFinancialNeed: true
  });

  // Mock budget data
  const [budgetCategories] = useState<BudgetCategory[]>([
    { id: '1', name: 'University Fees', budgeted: 120000, spent: 120000, remaining: 0, color: 'blue' },
    { id: '2', name: 'Books & Supplies', budgeted: 60000, spent: 45000, remaining: 15000, color: 'green' },
    { id: '3', name: 'Accommodation', budgeted: 240000, spent: 200000, remaining: 40000, color: 'purple' },
    { id: '4', name: 'Food & Meals', budgeted: 180000, spent: 165000, remaining: 15000, color: 'orange' },
    { id: '5', name: 'Transportation', budgeted: 48000, spent: 42000, remaining: 6000, color: 'teal' },
    { id: '6', name: 'Personal', budgeted: 60000, spent: 75000, remaining: -15000, color: 'red' }
  ]);

  // Mock aid opportunities
  const [aidOpportunities] = useState<FinancialAidOpportunity[]>([
    {
      id: '1',
      title: 'Mahapola Higher Education Scholarship',
      type: 'scholarship',
      amount: 60000, // LKR per year
      deadline: new Date('2024-03-31'),
      eligibility: ['Sri Lankan citizen', 'GPA ≥ 3.5', 'Family income criteria'],
      requirements: ['Income certificate', 'Academic transcripts', 'Application form'],
      description: 'Government scholarship for deserving students based on academic merit and financial need.',
      provider: 'Mahapola Higher Education Scholarship Trust Fund',
      matchPercentage: 88,
      isRecommended: true,
      applicationStatus: 'not-started',
      renewableYears: 4
    },
    {
      id: '2',
      title: 'UoM Merit Scholarship',
      type: 'scholarship',
      amount: 50000, // LKR per semester
      deadline: new Date('2024-04-15'),
      eligibility: ['Current UoM student', 'GPA ≥ 3.7', 'Academic excellence'],
      requirements: ['Academic transcripts', 'Recommendation letters'],
      description: 'University-specific merit-based scholarship for outstanding academic performance.',
      provider: 'University of Moratuwa',
      matchPercentage: 92,
      isRecommended: true,
      applicationStatus: 'in-progress'
    },
    {
      id: '3',
      title: 'Bursary for Needy Students',
      type: 'grant',
      amount: 25000, // LKR
      deadline: new Date('2024-05-30'),
      eligibility: ['Demonstrated financial need', 'Good academic standing'],
      requirements: ['Income verification', 'Grama Niladhari certificate'],
      description: 'Need-based financial assistance for students from low-income families.',
      provider: 'University Welfare Committee',
      matchPercentage: 76,
      applicationStatus: 'not-started'
    },
    {
      id: '4',
      title: 'Emergency Student Support Fund',
      type: 'emergency',
      amount: 15000, // LKR
      deadline: new Date('2024-12-31'),
      eligibility: ['Current UoM student', 'Unexpected financial crisis'],
      requirements: ['Crisis documentation', 'Faculty recommendation'],
      description: 'Immediate financial support for students facing unexpected hardships.',
      provider: 'Student Welfare Services UoM',
      matchPercentage: 84
    },
    {
      id: '5',
      title: 'Research Assistant Allowance',
      type: 'work-study',
      amount: 30000, // LKR per semester
      deadline: new Date('2024-03-20'),
      eligibility: ['3rd/4th year student', 'Research interest', 'Professor recommendation'],
      requirements: ['CV submission', 'Research proposal', 'Faculty endorsement'],
      description: 'Part-time research assistance positions with academic departments.',
      provider: 'Research & Development Office UoM',
      matchPercentage: 71
    }
  ]);

  // Mock donation requests
  const [donationRequests] = useState<DonationRequest[]>([
    {
      id: '1',
      title: 'Help with Textbooks for Engineering',
      description: 'Need assistance purchasing required textbooks for engineering courses.',
      requestedAmount: 800,
      raisedAmount: 450,
      studentId: 'anonymous-001',
      isAnonymous: true,
      category: 'books',
      urgency: 'medium',
      deadline: new Date('2024-02-15'),
      status: 'active',
      verificationLevel: 'full',
      story: 'I am a sophomore engineering student struggling to afford textbooks for this semester. I work part-time but the cost of books is overwhelming.',
      supporters: 12,
      updates: [
        { id: '1', date: new Date('2024-01-10'), message: 'Thank you to everyone who has contributed so far!', amount: 200 }
      ]
    },
    {
      id: '2',
      title: 'Emergency Housing Support',
      description: 'Lost job and need help with rent to avoid homelessness.',
      requestedAmount: 1200,
      raisedAmount: 1200,
      studentId: 'verified-student-002',
      isAnonymous: false,
      category: 'housing',
      urgency: 'critical',
      deadline: new Date('2024-01-20'),
      status: 'funded',
      verificationLevel: 'full',
      story: 'Recently lost my part-time job due to budget cuts. I am at risk of losing my housing and need emergency assistance.',
      supporters: 28,
      updates: [
        { id: '1', date: new Date('2024-01-15'), message: 'Goal reached! Thank you all so much!', amount: 1200 }
      ]
    },
    {
      id: '3',
      title: 'Technology for Online Learning',
      description: 'Need a laptop for remote classes and research.',
      requestedAmount: 600,
      raisedAmount: 150,
      studentId: 'anonymous-003',
      isAnonymous: true,
      category: 'technology',
      urgency: 'high',
      deadline: new Date('2024-02-28'),
      status: 'active',
      verificationLevel: 'basic',
      story: 'My old laptop broke and I cannot afford a replacement. I need it for online classes and completing assignments.',
      supporters: 5,
      updates: []
    }
  ]);

  // Mock AI recommendations
  const [aiRecommendations] = useState<AIRecommendation[]>([
    {
      id: '1',
      type: 'aid',
      title: 'High-Match Scholarship Available',
      description: 'AI identified a 95% match for Merit-Based Academic Scholarship. Deadline in 45 days.',
      potentialSaving: 5000,
      confidence: 95,
      action: 'Apply now',
      priority: 'high'
    },
    {
      id: '2',
      type: 'budget',
      title: 'Reduce Dining Expenses',
      description: 'Consider meal prep to save $150/month based on your spending patterns.',
      potentialSaving: 150,
      confidence: 82,
      action: 'View meal planning tips',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'donation',
      title: 'Eligible for Community Support',
      description: 'Your profile matches criteria for peer donation assistance.',
      potentialSaving: 400,
      confidence: 74,
      action: 'Create support request',
      priority: 'medium'
    }
  ]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

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

  // Calculate financial health score
  const calculateFinancialHealth = () => {
    const income = financialProfile.totalIncome + financialProfile.availableAid;
    const ratio = income / financialProfile.totalExpenses;
    return Math.min(ratio * 100, 100);
  };

  const tabs = [
    { id: 'dashboard', name: 'Financial Dashboard', icon: '📊' },
    { id: 'aid-finder', name: 'Aid Finder', icon: '🔍' },
    { id: 'donations', name: 'Community Support', icon: '🤝' },
    { id: 'budget', name: 'Budget Tracker', icon: '💰' },
    { id: 'applications', name: 'My Applications', icon: '📝' }
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
            <div className="text-center">
              <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center justify-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Financial Aid & Community Support
              </h1>
              <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto mb-6`}>
                AI-powered financial assistance platform with peer-to-peer support, eligibility matching, and smart budget tracking.
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
                  onClick={() => setShowDonationModal(true)}
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

          {/* Financial Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'} text-center animate-fade-in`}>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {Math.round(calculateFinancialHealth())}%
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Financial Health</div>
            </div>
            
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'} text-center animate-fade-in`}>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                ${financialProfile.availableAid.toLocaleString()}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>Available Aid</div>
            </div>
            
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'} text-center animate-fade-in`}>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {aidOpportunities.filter(aid => aid.isRecommended).length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>AI Matches</div>
            </div>
            
            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'} text-center animate-fade-in`}>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                $2,150
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>Community Raised</div>
            </div>
          </div>

          {/* AI Recommendations */}
          {aiRecommendations.length > 0 && (
            <div className={`mb-8 ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} rounded-2xl p-6 border animate-fade-in`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} mb-4 flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                AI Financial Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiRecommendations.map((rec) => (
                  <div key={rec.id} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{rec.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>{rec.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        Save ${rec.potentialSaving}
                      </span>
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                        {rec.action} →
                      </button>
                    </div>
                  </div>
                ))}
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
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm animate-fade-in`}>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Financial Overview */}
                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                      Financial Overview
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-green-100 dark:bg-green-900/20">
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>Total Income + Aid</p>
                          <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            ${(financialProfile.totalIncome + financialProfile.availableAid).toLocaleString()}
                          </p>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg bg-red-100 dark:bg-red-900/20">
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>Total Expenses</p>
                          <p className={`text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                            ${financialProfile.totalExpenses.toLocaleString()}
                          </p>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>

                      <div className={`flex items-center justify-between p-4 rounded-lg ${
                        financialProfile.totalIncome + financialProfile.availableAid >= financialProfile.totalExpenses 
                          ? 'bg-blue-100 dark:bg-blue-900/20' 
                          : 'bg-orange-100 dark:bg-orange-900/20'
                      }`}>
                        <div>
                          <p className={`text-sm ${
                            financialProfile.totalIncome + financialProfile.availableAid >= financialProfile.totalExpenses 
                              ? isDarkMode ? 'text-blue-300' : 'text-blue-700'
                              : isDarkMode ? 'text-orange-300' : 'text-orange-700'
                          }`}>
                            {financialProfile.totalIncome + financialProfile.availableAid >= financialProfile.totalExpenses ? 'Surplus' : 'Shortfall'}
                          </p>
                          <p className={`text-2xl font-bold ${
                            financialProfile.totalIncome + financialProfile.availableAid >= financialProfile.totalExpenses 
                              ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                              : isDarkMode ? 'text-orange-400' : 'text-orange-600'
                          }`}>
                            ${Math.abs((financialProfile.totalIncome + financialProfile.availableAid) - financialProfile.totalExpenses).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Aid Applications */}
                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                      Recent Applications
                    </h3>
                    
                    <div className="space-y-4">
                      {aidOpportunities.filter(aid => aid.applicationStatus && aid.applicationStatus !== 'not-started').map((aid) => (
                        <div key={aid.id} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600/50' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {aid.title}
                            </h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(aid.applicationStatus!)}`}>
                              {aid.applicationStatus?.replace('-', ' ')}
                            </span>
                          </div>
                          
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                            ${aid.amount.toLocaleString()} • Due: {aid.deadline.toLocaleDateString()}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(aid.type)}`}>
                              {aid.type}
                            </span>
                            <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                              View Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Aid Finder Tab */}
            {activeTab === 'aid-finder' && (
              <div className="p-8">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                  AI-Powered Aid Finder
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {aidOpportunities.map((aid) => (
                    <div key={aid.id} className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} transition-all duration-200 hover:shadow-md`}>
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(aid.type)}`}>
                            {aid.type}
                          </span>
                          {aid.isRecommended && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              🤖 AI Match: {aid.matchPercentage}%
                            </span>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            ${aid.amount.toLocaleString()}
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
                    <button 
                      onClick={() => setShowDonationModal(true)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      💚 Donate
                    </button>
                    <button 
                      onClick={() => setShowRequestModal(true)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      🙏 Request Help
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {donationRequests.map((request) => (
                    <div key={request.id} className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} transition-all duration-200`}>
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(request.category)}`}>
                            {request.category}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(request.urgency)}`}>
                            {request.urgency}
                          </span>
                          {request.verificationLevel === 'full' && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          request.status === 'funded' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          request.status === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {request.status}
                        </span>
                      </div>

                      <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                        {request.title}
                      </h3>
                      
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                        {request.story}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Progress
                          </span>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            ${request.raisedAmount.toLocaleString()} / ${request.requestedAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2`}>
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              request.raisedAmount >= request.requestedAmount ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min((request.raisedAmount / request.requestedAmount) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <p>{request.supporters} supporters</p>
                          <p>Due: {request.deadline.toLocaleDateString()}</p>
                        </div>
                        
                        {request.status === 'active' && (
                          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200">
                            Contribute
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Budget Tracker Tab */}
            {activeTab === 'budget' && (
              <div className="p-8">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                  Smart Budget Tracker
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Budget Categories */}
                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                      Budget Categories
                    </h3>
                    
                    <div className="space-y-4">
                      {budgetCategories.map((category) => (
                        <div key={category.id} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600/50' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {category.name}
                            </h4>
                            <span className={`text-sm font-medium ${
                              category.remaining < 0 ? 'text-red-500' : 'text-green-500'
                            }`}>
                              {category.remaining < 0 ? 'Over by ' : 'Remaining: '}
                              ${Math.abs(category.remaining).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Spent: ${category.spent.toLocaleString()}
                              </span>
                              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Budget: ${category.budgeted.toLocaleString()}
                              </span>
                            </div>
                            <div className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2`}>
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  category.spent > category.budgeted ? 'bg-red-500' :
                                  category.spent > category.budgeted * 0.8 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min((category.spent / category.budgeted) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Spending Insights */}
                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                      AI Spending Insights
                    </h3>
                    
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                        <h4 className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} mb-2`}>
                          💡 Spending Pattern Analysis
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                          You spend 23% more on dining during exam weeks. Consider meal prep to save $180/month.
                        </p>
                      </div>

                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                        <h4 className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-800'} mb-2`}>
                          ✅ Budget Achievement
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                          Great job staying under budget in 4/6 categories this month!
                        </p>
                      </div>

                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
                        <h4 className={`font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'} mb-2`}>
                          ⚠️ Budget Alert
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                          Personal spending is $200 over budget. Consider reducing discretionary purchases.
                        </p>
                      </div>

                      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
                        <h4 className={`font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-800'} mb-2`}>
                          🎯 Savings Opportunity
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                          Switch to used textbooks and save an average of $420 per semester.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Application Modal */}
        {showApplicationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {selectedAid ? `Apply for ${selectedAid.title}` : 'Financial Aid Application'}
                </h2>
                <button 
                  onClick={() => {
                    setShowApplicationModal(false);
                    setSelectedAid(null);
                  }}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                  Application Process
                </h3>
                
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  Applications are processed through our secure portal. You&apos;ll be redirected to complete the application with all required documents.
                </p>

                <div className="space-y-3">
                  <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                    📝 Start Application
                  </button>
                  
                  <Link 
                    href="/help"
                    className={`block w-full px-6 py-3 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg font-medium transition-all duration-200 text-center`}
                  >
                    📞 Get Application Help
                  </Link>
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
                    <button className="px-4 py-2 border border-green-300 text-green-700 dark:border-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20">
                      $25
                    </button>
                    <button className="px-4 py-2 border border-green-300 text-green-700 dark:border-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20">
                      $50
                    </button>
                    <button className="px-4 py-2 border border-green-300 text-green-700 dark:border-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20">
                      $100
                    </button>
                  </div>
                  
                  <input 
                    type="number"
                    placeholder="Custom amount"
                    className={`w-full px-4 py-3 border rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                  
                  <button className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                    💚 Donate Now
                  </button>
                  
                  <label className="flex items-center text-sm">
                    <input type="checkbox" className="mr-2" />
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
                  <button className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                    📝 Create Request
                  </button>
                  
                  <Link 
                    href="/help"
                    className={`block w-full px-6 py-3 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg font-medium transition-all duration-200 text-center`}
                  >
                    📞 Get Guidance First
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}