// src/app/privacy/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

// --- Interfaces ---
interface DataCategory {
  id: string;
  name: string;
  description: string;
  dataTypes: string[];
  purpose: string;
  retention: string;
  isEnabled: boolean;
  isRequired: boolean;
  lastUpdated: Date;
  dataSize: string;
}

interface PrivacySetting {
  id: string;
  category: string;
  name: string;
  description: string;
  type: 'toggle' | 'select' | 'slider';
  value: boolean | string | number;
  options?: string[];
  isEnabled: boolean;
  requiresRestart?: boolean;
}

interface DataRequest {
  id: string;
  type: 'export' | 'delete' | 'rectify';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestDate: Date;
  completedDate?: Date;
  description: string;
  dataCategories: string[];
}

interface ThirdPartyIntegration {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
  connectedDate: Date;
  lastAccess: Date;
  dataShared: string[];
  logo?: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  isGranted: boolean;
  isRequired: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

interface DataInsight {
  category: string;
  totalSize: string;
  recordCount: number;
  lastActivity: Date;
  growthRate: string;
  retentionDays: number;
}

interface PrivacyAudit {
  id: string;
  date: Date;
  type: 'automated' | 'manual' | 'compliance';
  status: 'passed' | 'warning' | 'failed';
  findings: AuditFinding[];
  score: number;
}

interface AuditFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  recommendation: string;
  isResolved: boolean;
}

export default function DataPrivacyPage() {
  const { isDarkMode } = useDarkMode();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data categories
  const [dataCategories, setDataCategories] = useState<DataCategory[]>([
    {
      id: '1',
      name: 'Academic Information',
      description: 'Course enrollments, grades, academic progress, and study patterns',
      dataTypes: ['Course Records', 'Grades', 'Study Analytics', 'Assignment Data'],
      purpose: 'Academic planning and progress tracking',
      retention: '7 years after graduation',
      isEnabled: true,
      isRequired: true,
      lastUpdated: new Date('2024-01-15'),
      dataSize: '2.3 MB',
    },
    {
      id: '2',
      name: 'Wellness & Health Data',
      description: 'Mood tracking, wellness check-ins, and mental health support data',
      dataTypes: ['Mood Entries', 'Wellness Goals', 'Check-in Data', 'Usage Patterns'],
      purpose: 'Personalized wellness recommendations and support',
      retention: '3 years or until account deletion',
      isEnabled: true,
      isRequired: false,
      lastUpdated: new Date('2024-01-20'),
      dataSize: '1.8 MB',
    },
    {
      id: '3',
      name: 'Social & Community Data',
      description: 'Challenge participation, team memberships, and social interactions',
      dataTypes: ['Challenge History', 'Team Data', 'Social Connections', 'Community Posts'],
      purpose: 'Social features and community building',
      retention: '2 years after last activity',
      isEnabled: true,
      isRequired: false,
      lastUpdated: new Date('2024-01-18'),
      dataSize: '956 KB',
    },
    {
      id: '4',
      name: 'Location & Navigation',
      description: 'University location data, navigation history, and check-ins',
      dataTypes: [
        'GPS Coordinates',
        'Navigation Routes',
        'Check-in Locations',
        'Movement Patterns',
      ],
      purpose: 'Navigation assistance and location-based services',
      retention: '90 days',
      isEnabled: false,
      isRequired: false,
      lastUpdated: new Date('2024-01-10'),
      dataSize: '1.2 MB',
    },
    {
      id: '5',
      name: 'Financial Information',
      description: 'Financial aid data, donation history, and budget tracking',
      dataTypes: ['Aid Applications', 'Payment History', 'Budget Data', 'Transaction Records'],
      purpose: 'Financial assistance and budget management',
      retention: '7 years for compliance',
      isEnabled: true,
      isRequired: false,
      lastUpdated: new Date('2024-01-22'),
      dataSize: '687 KB',
    },
    {
      id: '6',
      name: 'Device & Technical Data',
      description: 'Device information, app usage, and technical diagnostics',
      dataTypes: ['Device Info', 'Usage Analytics', 'Error Reports', 'Performance Data'],
      purpose: 'App improvement and technical support',
      retention: '1 year',
      isEnabled: true,
      isRequired: true,
      lastUpdated: new Date('2024-01-25'),
      dataSize: '445 KB',
    },
  ]);

  // Mock privacy settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySetting[]>([
    {
      id: '1',
      category: 'Data Collection',
      name: 'Analytics Tracking',
      description: 'Allow collection of usage analytics to improve app performance',
      type: 'toggle',
      value: true,
      isEnabled: true,
    },
    {
      id: '2',
      category: 'Data Collection',
      name: 'Location Services',
      description: 'Enable location tracking for navigation and location-based features',
      type: 'toggle',
      value: false,
      isEnabled: true,
    },
    {
      id: '3',
      category: 'Personalization',
      name: 'AI Recommendations',
      description: 'Use personal data to provide AI-powered recommendations',
      type: 'toggle',
      value: true,
      isEnabled: true,
    },
    {
      id: '4',
      category: 'Personalization',
      name: 'Content Personalization Level',
      description: 'How much personal data to use for customizing your experience',
      type: 'select',
      value: 'balanced',
      options: ['minimal', 'balanced', 'comprehensive'],
      isEnabled: true,
    },
    {
      id: '5',
      category: 'Communication',
      name: 'Marketing Communications',
      description: 'Receive emails about new features and university events',
      type: 'toggle',
      value: false,
      isEnabled: true,
    },
    {
      id: '6',
      category: 'Communication',
      name: 'Research Participation',
      description: 'Allow anonymized data to be used for academic research',
      type: 'toggle',
      value: true,
      isEnabled: true,
    },
    {
      id: '7',
      category: 'Sharing',
      name: 'Profile Visibility',
      description: 'Control who can see your profile information',
      type: 'select',
      value: 'friends',
      options: ['private', 'friends', 'university', 'public'],
      isEnabled: true,
    },
    {
      id: '8',
      category: 'Sharing',
      name: 'Activity Sharing',
      description: 'Share your challenge progress and achievements with others',
      type: 'toggle',
      value: true,
      isEnabled: true,
    },
  ]);

  // Mock data requests
  const [dataRequests] = useState<DataRequest[]>([
    {
      id: '1',
      type: 'export',
      status: 'completed',
      requestDate: new Date('2024-01-10'),
      completedDate: new Date('2024-01-12'),
      description: 'Complete data export in JSON format',
      dataCategories: ['Academic Information', 'Wellness & Health Data', 'Social & Community Data'],
    },
    {
      id: '2',
      type: 'delete',
      status: 'processing',
      requestDate: new Date('2024-01-20'),
      description: 'Delete location and navigation data',
      dataCategories: ['Location & Navigation'],
    },
  ]);

  // Mock third-party integrations
  const [integrations, setIntegrations] = useState<ThirdPartyIntegration[]>([
    {
      id: '1',
      name: 'Google Calendar',
      description: 'Sync academic events and deadlines with your Google Calendar',
      permissions: [
        {
          id: '1',
          name: 'Read Calendar',
          description: 'View your calendar events',
          isGranted: true,
          isRequired: true,
          riskLevel: 'low',
        },
        {
          id: '2',
          name: 'Create Events',
          description: 'Add new events to your calendar',
          isGranted: true,
          isRequired: true,
          riskLevel: 'medium',
        },
        {
          id: '3',
          name: 'Edit Events',
          description: 'Modify existing calendar events',
          isGranted: false,
          isRequired: false,
          riskLevel: 'medium',
        },
      ],
      isActive: true,
      connectedDate: new Date('2024-01-05'),
      lastAccess: new Date('2024-01-25'),
      dataShared: ['Academic Schedule', 'Assignment Deadlines', 'Event Reminders'],
    },
    {
      id: '2',
      name: 'Fitbit',
      description: 'Connect your fitness tracker for wellness challenges',
      permissions: [
        {
          id: '4',
          name: 'Activity Data',
          description: 'Access your daily activity and exercise data',
          isGranted: true,
          isRequired: true,
          riskLevel: 'low',
        },
        {
          id: '5',
          name: 'Heart Rate',
          description: 'Read heart rate and health metrics',
          isGranted: true,
          isRequired: false,
          riskLevel: 'medium',
        },
        {
          id: '6',
          name: 'Sleep Data',
          description: 'Access sleep patterns and quality',
          isGranted: false,
          isRequired: false,
          riskLevel: 'medium',
        },
      ],
      isActive: false,
      connectedDate: new Date('2024-01-15'),
      lastAccess: new Date('2024-01-22'),
      dataShared: ['Step Count', 'Exercise Sessions', 'Wellness Goals'],
    },
    {
      id: '3',
      name: 'Microsoft Teams',
      description: 'Integration with university Teams for academic collaboration',
      permissions: [
        {
          id: '7',
          name: 'Profile Access',
          description: 'Read your basic profile information',
          isGranted: true,
          isRequired: true,
          riskLevel: 'low',
        },
        {
          id: '8',
          name: 'Team Membership',
          description: 'See your team memberships and roles',
          isGranted: true,
          isRequired: true,
          riskLevel: 'low',
        },
        {
          id: '9',
          name: 'File Access',
          description: 'Access shared files in your teams',
          isGranted: true,
          isRequired: false,
          riskLevel: 'high',
        },
      ],
      isActive: true,
      connectedDate: new Date('2023-12-20'),
      lastAccess: new Date('2024-01-24'),
      dataShared: ['Academic Teams', 'Project Files', 'Collaboration Data'],
    },
  ]);

  // Mock data insights
  const [dataInsights] = useState<DataInsight[]>([
    {
      category: 'Academic',
      totalSize: '2.3 MB',
      recordCount: 1247,
      lastActivity: new Date('2024-01-25'),
      growthRate: '+12%',
      retentionDays: 2555,
    },
    {
      category: 'Wellness',
      totalSize: '1.8 MB',
      recordCount: 892,
      lastActivity: new Date('2024-01-24'),
      growthRate: '+8%',
      retentionDays: 1095,
    },
    {
      category: 'Social',
      totalSize: '956 KB',
      recordCount: 356,
      lastActivity: new Date('2024-01-23'),
      growthRate: '+24%',
      retentionDays: 730,
    },
    {
      category: 'Financial',
      totalSize: '687 KB',
      recordCount: 234,
      lastActivity: new Date('2024-01-22'),
      growthRate: '+5%',
      retentionDays: 2555,
    },
    {
      category: 'Technical',
      totalSize: '445 KB',
      recordCount: 1890,
      lastActivity: new Date('2024-01-25'),
      growthRate: '+3%',
      retentionDays: 365,
    },
  ]);

  // Mock privacy audit
  const [privacyAudit] = useState<PrivacyAudit>({
    id: '1',
    date: new Date('2024-01-20'),
    type: 'automated',
    status: 'passed',
    score: 94,
    findings: [
      {
        id: '1',
        severity: 'low',
        category: 'Data Retention',
        description: 'Some technical data exceeds recommended retention period',
        recommendation: 'Implement automated cleanup for technical logs older than 6 months',
        isResolved: false,
      },
      {
        id: '2',
        severity: 'medium',
        category: 'Third-party Access',
        description: 'Microsoft Teams has file access permissions that may not be necessary',
        recommendation: 'Review and potentially revoke file access permissions',
        isResolved: false,
      },
    ],
  });

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  // Toggle privacy setting
  const togglePrivacySetting = (settingId: string) => {
    setPrivacySettings((prev) =>
      prev.map((setting) =>
        setting.id === settingId ? { ...setting, value: !setting.value } : setting
      )
    );
  };

  // Update privacy setting value
  const updatePrivacySetting = (settingId: string, newValue: string | number) => {
    setPrivacySettings((prev) =>
      prev.map((setting) => (setting.id === settingId ? { ...setting, value: newValue } : setting))
    );
  };

  // Toggle data category
  const toggleDataCategory = (categoryId: string) => {
    setDataCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId ? { ...category, isEnabled: !category.isEnabled } : category
      )
    );
  };

  // Toggle integration
  const toggleIntegration = (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId
          ? { ...integration, isActive: !integration.isActive }
          : integration
      )
    );
  };

  // Get risk level color
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'medium':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'high':
        return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'passed':
        return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'processing':
      case 'pending':
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
      case 'failed':
      case 'warning':
        return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'high':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Privacy Overview', icon: '🛡️' },
    { id: 'data-collection', name: 'Data Collection', icon: '📊' },
    { id: 'privacy-settings', name: 'Privacy Settings', icon: '⚙️' },
    { id: 'data-requests', name: 'Data Requests', icon: '📄' },
    { id: 'integrations', name: 'Third-party Apps', icon: '🔗' },
    { id: 'audit', name: 'Privacy Audit', icon: '🔍' },
  ];

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main
          className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 flex items-center justify-center`}
        >
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading privacy settings...
            </p>
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="text-center">
              <h1
                className={`text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center justify-center`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 mr-3 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Data Privacy Center
              </h1>
              <p
                className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto mb-6`}
              >
                Complete control over your personal data with transparency, security, and compliance
                at every step.
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export My Data
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete Data
                </button>

                <Link
                  href="/help"
                  className={`px-6 py-3 ${isDarkMode ? 'bg-green-700 hover:bg-green-600 text-green-200' : 'bg-green-100 hover:bg-green-200 text-green-700'} rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Privacy Help
                </Link>
              </div>
            </div>
          </div>

          {/* Privacy Score Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div
              className={`p-6 rounded-xl ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'} text-center animate-fade-in`}
            >
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {privacyAudit.score}%
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                Privacy Score
              </div>
            </div>

            <div
              className={`p-6 rounded-xl ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'} text-center animate-fade-in`}
            >
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {dataCategories.filter((c) => c.isEnabled).length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                Active Data Types
              </div>
            </div>

            <div
              className={`p-6 rounded-xl ${isDarkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'} text-center animate-fade-in`}
            >
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {integrations.filter((i) => i.isActive).length}
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                Connected Apps
              </div>
            </div>

            <div
              className={`p-6 rounded-xl ${isDarkMode ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'} text-center animate-fade-in`}
            >
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                7.8 MB
              </div>
              <div className={`text-sm ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                Total Data Size
              </div>
            </div>
          </div>

          {/* Privacy Health Alert */}
          <div
            className={`mb-8 ${isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} rounded-2xl p-6 border animate-fade-in`}
          >
            <h3
              className={`text-lg font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-800'} mb-4 flex items-center`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Privacy Health: Excellent
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <h4
                  className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}
                >
                  ✅ Strong Protection
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your privacy settings provide robust protection for personal data
                </p>
              </div>
              <div
                className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <h4
                  className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}
                >
                  🔒 Minimal Sharing
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Data sharing is limited to essential services only
                </p>
              </div>
              <div
                className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <h4
                  className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}
                >
                  ⏰ Regular Cleanup
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Automated data retention policies keep storage minimal
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm mb-6 animate-fade-in`}
          >
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
          <div
            className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm animate-fade-in`}
          >
            {/* Privacy Overview Tab */}
            {activeTab === 'overview' && (
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Data Insights */}
                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3
                      className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}
                    >
                      Your Data Overview
                    </h3>

                    <div className="space-y-4">
                      {dataInsights.map((insight) => (
                        <div
                          key={insight.category}
                          className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600/50' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4
                              className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                            >
                              {insight.category} Data
                            </h4>
                            <span
                              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              {insight.totalSize}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Records:
                              </span>
                              <p
                                className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                              >
                                {insight.recordCount.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Growth:
                              </span>
                              <p
                                className={`font-medium ${insight.growthRate.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}
                              >
                                {insight.growthRate}
                              </p>
                            </div>
                            <div>
                              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Retention:
                              </span>
                              <p
                                className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                              >
                                {Math.floor(insight.retentionDays / 365)}y
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3
                      className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}
                    >
                      Recent Privacy Activity
                    </h3>

                    <div className="space-y-4">
                      <div
                        className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600/50' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p
                              className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                            >
                              Privacy audit completed
                            </p>
                            <p
                              className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              Score: 94% • {privacyAudit.date.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600/50' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div>
                            <p
                              className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                            >
                              Data export completed
                            </p>
                            <p
                              className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              JSON format • January 12, 2024
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600/50' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <div>
                            <p
                              className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                            >
                              Location services disabled
                            </p>
                            <p
                              className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              User preference • January 10, 2024
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600/50' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p
                              className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                            >
                              Google Calendar connected
                            </p>
                            <p
                              className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              Integration approved • January 5, 2024
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Collection Tab */}
            {activeTab === 'data-collection' && (
              <div className="p-8">
                <h2
                  className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}
                >
                  Data Collection Transparency
                </h2>

                <div className="space-y-6">
                  {dataCategories.map((category) => (
                    <div
                      key={category.id}
                      className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3
                              className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                            >
                              {category.name}
                            </h3>
                            {category.isRequired && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                Required
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}
                          >
                            {category.description}
                          </p>
                        </div>

                        <div className="ml-4">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={category.isEnabled}
                              onChange={() =>
                                !category.isRequired && toggleDataCategory(category.id)
                              }
                              disabled={category.isRequired}
                              className="sr-only peer"
                            />
                            <div
                              className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${category.isRequired ? 'opacity-50 cursor-not-allowed' : ''}`}
                            ></div>
                          </label>
                        </div>
                      </div>

                      {/* Data Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4
                            className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                          >
                            Data Types Collected:
                          </h4>
                          <ul className="space-y-1">
                            {category.dataTypes.map((type, index) => (
                              <li
                                key={index}
                                className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center`}
                              >
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                                {type}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <span
                              className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              Purpose:
                            </span>
                            <p
                              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              {category.purpose}
                            </p>
                          </div>
                          <div>
                            <span
                              className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              Retention:
                            </span>
                            <p
                              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              {category.retention}
                            </p>
                          </div>
                          <div>
                            <span
                              className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              Data Size:
                            </span>
                            <p
                              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              {category.dataSize}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 border-t pt-3 mt-3 border-gray-300 dark:border-gray-600">
                        Last updated: {category.lastUpdated.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Settings Tab */}
            {activeTab === 'privacy-settings' && (
              <div className="p-8">
                <h2
                  className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}
                >
                  Privacy Settings
                </h2>

                {['Data Collection', 'Personalization', 'Communication', 'Sharing'].map(
                  (category) => (
                    <div key={category} className="mb-8">
                      <h3
                        className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}
                      >
                        {category}
                      </h3>

                      <div className="space-y-4">
                        {privacySettings
                          .filter((setting) => setting.category === category)
                          .map((setting) => (
                            <div
                              key={setting.id}
                              className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4
                                    className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-1`}
                                  >
                                    {setting.name}
                                  </h4>
                                  <p
                                    className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                                  >
                                    {setting.description}
                                  </p>
                                </div>

                                <div className="ml-4">
                                  {setting.type === 'toggle' && (
                                    <label className="relative inline-flex items-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={setting.value as boolean}
                                        onChange={() => togglePrivacySetting(setting.id)}
                                        className="sr-only peer"
                                      />
                                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                  )}

                                  {setting.type === 'select' && setting.options && (
                                    <select
                                      value={setting.value as string}
                                      onChange={(e) =>
                                        updatePrivacySetting(setting.id, e.target.value)
                                      }
                                      className={`px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                    >
                                      {setting.options.map((option) => (
                                        <option key={option} value={option}>
                                          {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Data Requests Tab */}
            {activeTab === 'data-requests' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                  >
                    Data Requests
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowExportModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      Export Data
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      Request Deletion
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {dataRequests.map((request) => (
                    <div
                      key={request.id}
                      className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3
                              className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                            >
                              {request.type === 'export'
                                ? 'Data Export'
                                : request.type === 'delete'
                                  ? 'Data Deletion'
                                  : 'Data Rectification'}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}
                            >
                              {request.status}
                            </span>
                          </div>
                          <p
                            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            {request.description}
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            Requested: {request.requestDate.toLocaleDateString()}
                          </p>
                          {request.completedDate && (
                            <p
                              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              Completed: {request.completedDate.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Data Categories */}
                      <div className="mb-4">
                        <h4
                          className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                        >
                          Affected Data Categories:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {request.dataCategories.map((category) => (
                            <span
                              key={category}
                              className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        {request.status === 'completed' && request.type === 'export' && (
                          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200">
                            Download Export
                          </button>
                        )}
                        <button
                          className={`px-4 py-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg text-sm font-medium transition-all duration-200`}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Third-party Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="p-8">
                <h2
                  className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}
                >
                  Third-party App Permissions
                </h2>

                <div className="space-y-6">
                  {integrations.map((integration) => (
                    <div
                      key={integration.id}
                      className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {integration.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3
                              className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-1`}
                            >
                              {integration.name}
                            </h3>
                            <p
                              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              {integration.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              integration.isActive
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            }`}
                          >
                            {integration.isActive ? 'Active' : 'Inactive'}
                          </span>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={integration.isActive}
                              onChange={() => toggleIntegration(integration.id)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>

                      {/* Integration Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4
                            className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                          >
                            Data Shared:
                          </h4>
                          <ul className="space-y-1">
                            {integration.dataShared.map((data, index) => (
                              <li
                                key={index}
                                className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center`}
                              >
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                                {data}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span
                              className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              Connected:
                            </span>
                            <p
                              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              {integration.connectedDate.toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span
                              className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              Last Access:
                            </span>
                            <p
                              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              {integration.lastAccess.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Permissions */}
                      <div className="mb-4">
                        <h4
                          className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}
                        >
                          Permissions:
                        </h4>
                        <div className="space-y-2">
                          {integration.permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className={`flex items-center justify-between p-3 rounded ${isDarkMode ? 'bg-gray-600/50' : 'bg-white'}`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span
                                    className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                                  >
                                    {permission.name}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${getRiskLevelColor(permission.riskLevel)}`}
                                  >
                                    {permission.riskLevel} risk
                                  </span>
                                  {permission.isRequired && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                      required
                                    </span>
                                  )}
                                </div>
                                <p
                                  className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}
                                >
                                  {permission.description}
                                </p>
                              </div>

                              {!permission.isRequired && (
                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                  <input
                                    type="checkbox"
                                    checked={permission.isGranted}
                                    onChange={() => {
                                      // Toggle permission logic here
                                    }}
                                    className="sr-only peer"
                                  />
                                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          className={`px-4 py-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg text-sm font-medium transition-all duration-200`}
                        >
                          Review Permissions
                        </button>
                        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all duration-200">
                          Revoke Access
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Audit Tab */}
            {activeTab === 'audit' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                  >
                    Privacy Audit Report
                  </h2>
                  <div className="flex items-center space-x-4">
                    <div
                      className={`text-3xl font-bold ${privacyAudit.score >= 90 ? 'text-green-500' : privacyAudit.score >= 70 ? 'text-yellow-500' : 'text-red-500'}`}
                    >
                      {privacyAudit.score}%
                    </div>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200">
                      Run New Audit
                    </button>
                  </div>
                </div>

                {/* Audit Summary */}
                <div
                  className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} mb-6`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}
                      >
                        {privacyAudit.score}%
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Overall Score
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                      >
                        {privacyAudit.findings.length}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Findings
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}
                      >
                        {privacyAudit.type}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Audit Type
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit Findings */}
                <div className="space-y-4">
                  <h3
                    className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                  >
                    Audit Findings
                  </h3>

                  {privacyAudit.findings.map((finding) => (
                    <div
                      key={finding.id}
                      className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(finding.severity)}`}
                          >
                            {finding.severity}
                          </span>
                          <h4
                            className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                          >
                            {finding.category}
                          </h4>
                        </div>

                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            finding.isResolved
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}
                        >
                          {finding.isResolved ? 'Resolved' : 'Pending'}
                        </span>
                      </div>

                      <p
                        className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}
                      >
                        {finding.description}
                      </p>

                      <div
                        className={`p-3 rounded ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}
                      >
                        <h5
                          className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} mb-1`}
                        >
                          Recommendation:
                        </h5>
                        <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                          {finding.recommendation}
                        </p>
                      </div>

                      {!finding.isResolved && (
                        <div className="mt-4">
                          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200">
                            Mark as Resolved
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export Data Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                >
                  Export Your Data
                </h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                <h3
                  className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}
                >
                  Request Data Export
                </h3>

                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  We&apos;ll prepare a complete export of your data in machine-readable format.
                  You&apos;ll receive an email when it&apos;s ready.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowExportModal(false);
                      // In real app, would initiate export process
                    }}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    📦 Request Export
                  </button>

                  <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Export will include all data categories you have enabled. Processing typically
                    takes 24-48 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Data Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                >
                  Delete Data
                </h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-600 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>

                <h3
                  className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}
                >
                  Request Data Deletion
                </h3>

                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  ⚠️ This action cannot be undone. Some data may be retained for legal compliance
                  requirements.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      // In real app, would initiate deletion process
                    }}
                    className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    🗑️ Request Deletion
                  </button>

                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className={`w-full px-6 py-3 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg font-medium transition-all duration-200`}
                  >
                    Cancel
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
