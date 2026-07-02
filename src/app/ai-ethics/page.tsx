// src/app/ai-ethics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

// --- Interfaces ---
interface AIDecision {
  id: string;
  timestamp: Date;
  service: string;
  decision: string;
  confidence: number;
  explanation: string;
  factorsUsed: DecisionFactor[];
  outcome: string;
  userImpact: 'low' | 'medium' | 'high';
  canAppeal: boolean;
  appealed: boolean;
}

interface DecisionFactor {
  id: string;
  name: string;
  value: string | number;
  weight: number;
  description: string;
  isPersonal: boolean;
}

interface BiasReport {
  id: string;
  date: Date;
  algorithm: string;
  biasType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedGroups: string[];
  mitigationSteps: string[];
  status: 'detected' | 'investigating' | 'mitigated' | 'resolved';
  confidence: number;
}

interface AlgorithmUpdate {
  id: string;
  date: Date;
  algorithm: string;
  version: string;
  updateType: 'enhancement' | 'bugfix' | 'bias-mitigation' | 'security' | 'feature';
  description: string;
  impactLevel: 'low' | 'medium' | 'high';
  affectedFeatures: string[];
  performanceChange: {
    accuracy: number;
    fairness: number;
    speed: number;
  };
  userNotification: boolean;
}

interface EthicsMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: 'improving' | 'stable' | 'declining';
  description: string;
  category: 'fairness' | 'transparency' | 'accountability' | 'privacy' | 'safety';
  lastUpdated: Date;
}

interface DataUsage {
  id: string;
  dataType: string;
  purpose: string;
  algorithms: string[];
  retentionPeriod: string;
  sharingStatus: 'not-shared' | 'internal' | 'partner' | 'research';
  userConsent: boolean;
  lastAccessed: Date;
  accessFrequency: number;
}

interface OptOutOption {
  id: string;
  feature: string;
  description: string;
  impact: string;
  isOptedOut: boolean;
  canOptOut: boolean;
  category: 'recommendations' | 'personalization' | 'analytics' | 'research';
  dependencies: string[];
}

interface TransparencyReport {
  id: string;
  period: string;
  totalDecisions: number;
  averageConfidence: number;
  appealRate: number;
  biasIncidents: number;
  algorithmUpdates: number;
  userOptOuts: number;
  complianceScore: number;
}

export default function AIEthicsPage() {
  const { isDarkMode } = useDarkMode();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<AIDecision | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock AI decisions
  const [aiDecisions] = useState<AIDecision[]>([
    {
      id: '1',
      timestamp: new Date('2024-01-25T14:30:00'),
      service: 'Study Space Finder',
      decision: 'Recommended Library Level 3, Section B',
      confidence: 89,
      explanation: 'Based on your study patterns, noise preferences, and current occupancy levels',
      factorsUsed: [
        {
          id: '1',
          name: 'Study Pattern',
          value: 'Afternoon Preference',
          weight: 30,
          description: 'You typically study better in afternoon hours',
          isPersonal: true,
        },
        {
          id: '2',
          name: 'Noise Level',
          value: 'Quiet',
          weight: 25,
          description: 'Historical preference for quiet study environments',
          isPersonal: true,
        },
        {
          id: '3',
          name: 'Current Occupancy',
          value: '23%',
          weight: 20,
          description: 'Real-time occupancy data for library sections',
          isPersonal: false,
        },
        {
          id: '4',
          name: 'Academic Subject',
          value: 'Mathematics',
          weight: 15,
          description: 'Subject being studied affects space recommendation',
          isPersonal: true,
        },
        {
          id: '5',
          name: 'Success Rate',
          value: '92%',
          weight: 10,
          description: 'Previous success rate at similar locations',
          isPersonal: true,
        },
      ],
      outcome: 'Accepted',
      userImpact: 'medium',
      canAppeal: true,
      appealed: false,
    },
    {
      id: '2',
      timestamp: new Date('2024-01-24T09:15:00'),
      service: 'Academic Assistant',
      decision: 'Suggested 2-hour study block for Calculus',
      confidence: 94,
      explanation: 'Optimal study duration based on your focus patterns and upcoming exam schedule',
      factorsUsed: [
        {
          id: '6',
          name: 'Focus Duration',
          value: '110 min avg',
          weight: 35,
          description: 'Your average sustained focus time',
          isPersonal: true,
        },
        {
          id: '7',
          name: 'Exam Schedule',
          value: '3 days',
          weight: 30,
          description: 'Time until next calculus exam',
          isPersonal: true,
        },
        {
          id: '8',
          name: 'Current Progress',
          value: '67%',
          weight: 20,
          description: 'Completion rate for current chapter',
          isPersonal: true,
        },
        {
          id: '9',
          name: 'Time of Day',
          value: 'Morning',
          weight: 15,
          description: 'Peak performance time based on historical data',
          isPersonal: true,
        },
      ],
      outcome: 'Accepted',
      userImpact: 'high',
      canAppeal: true,
      appealed: false,
    },
    {
      id: '3',
      timestamp: new Date('2024-01-23T16:45:00'),
      service: 'Wellness Assistant',
      decision: 'Recommended 15-minute mindfulness break',
      confidence: 76,
      explanation: 'Detected elevated stress indicators and prolonged screen time',
      factorsUsed: [
        {
          id: '10',
          name: 'Stress Indicators',
          value: 'Elevated',
          weight: 40,
          description: 'Based on usage patterns and self-reported mood',
          isPersonal: true,
        },
        {
          id: '11',
          name: 'Screen Time',
          value: '4.2 hours',
          weight: 30,
          description: 'Continuous screen time without break',
          isPersonal: true,
        },
        {
          id: '12',
          name: 'Previous Effectiveness',
          value: '85%',
          weight: 20,
          description: 'Success rate of mindfulness recommendations',
          isPersonal: true,
        },
        {
          id: '13',
          name: 'Time Available',
          value: '30 min',
          weight: 10,
          description: 'Break time available in current schedule',
          isPersonal: true,
        },
      ],
      outcome: 'Declined',
      userImpact: 'low',
      canAppeal: true,
      appealed: true,
    },
  ]);

  // Mock bias reports
  const [biasReports] = useState<BiasReport[]>([
    {
      id: '1',
      date: new Date('2024-01-20'),
      algorithm: 'Study Space Recommendation',
      biasType: 'Geographic Bias',
      severity: 'medium',
      description:
        'Algorithm showed preference for library locations over other study spaces for students from certain dormitories',
      affectedGroups: ['East University Residents', 'Off-University Students'],
      mitigationSteps: [
        'Updated distance weighting algorithm',
        'Added transportation time factors',
        'Implemented fairness constraints',
      ],
      status: 'mitigated',
      confidence: 87,
    },
    {
      id: '2',
      date: new Date('2024-01-18'),
      algorithm: 'Challenge Recommendation',
      biasType: 'Academic Year Bias',
      severity: 'low',
      description:
        'System recommended fewer advanced challenges to first-year students regardless of ability',
      affectedGroups: ['First-year Students'],
      mitigationSteps: [
        'Removed academic year as primary factor',
        'Increased weight of skill assessment',
        'Added challenge progression tracking',
      ],
      status: 'resolved',
      confidence: 92,
    },
    {
      id: '3',
      date: new Date('2024-01-15'),
      algorithm: 'Team Formation Assistant',
      biasType: 'Gender Representation',
      severity: 'high',
      description:
        'Team formation algorithm showed imbalanced gender distribution in technical challenges',
      affectedGroups: ['Female Students in STEM'],
      mitigationSteps: [
        'Implemented diversity constraints',
        'Bias testing with synthetic data',
        'Regular monitoring dashboard created',
      ],
      status: 'investigating',
      confidence: 91,
    },
  ]);

  // Mock algorithm updates
  const [algorithmUpdates] = useState<AlgorithmUpdate[]>([
    {
      id: '1',
      date: new Date('2024-01-22'),
      algorithm: 'Study Space Finder v2.3.1',
      version: '2.3.1',
      updateType: 'bias-mitigation',
      description: 'Improved geographic fairness and accessibility considerations',
      impactLevel: 'medium',
      affectedFeatures: ['Location Recommendations', 'Accessibility Filters'],
      performanceChange: { accuracy: 2, fairness: 15, speed: -3 },
      userNotification: true,
    },
    {
      id: '2',
      date: new Date('2024-01-19'),
      algorithm: 'Academic Assistant v1.8.2',
      version: '1.8.2',
      updateType: 'enhancement',
      description: 'Enhanced focus time prediction and break recommendations',
      impactLevel: 'high',
      affectedFeatures: ['Study Scheduling', 'Break Reminders', 'Focus Analytics'],
      performanceChange: { accuracy: 8, fairness: 3, speed: 5 },
      userNotification: true,
    },
    {
      id: '3',
      date: new Date('2024-01-16'),
      algorithm: 'Wellness Tracker v3.1.0',
      version: '3.1.0',
      updateType: 'feature',
      description: 'Added mood pattern recognition and personalized intervention timing',
      impactLevel: 'high',
      affectedFeatures: ['Mood Tracking', 'Intervention Timing', 'Pattern Analysis'],
      performanceChange: { accuracy: 12, fairness: 7, speed: -2 },
      userNotification: true,
    },
  ]);

  // Mock ethics metrics
  const [ethicsMetrics] = useState<EthicsMetric[]>([
    {
      id: '1',
      name: 'Algorithmic Fairness Score',
      value: 87,
      target: 90,
      trend: 'improving',
      description: 'Measures fairness across different demographic groups',
      category: 'fairness',
      lastUpdated: new Date('2024-01-25'),
    },
    {
      id: '2',
      name: 'Decision Transparency Rate',
      value: 94,
      target: 95,
      trend: 'stable',
      description: 'Percentage of AI decisions with available explanations',
      category: 'transparency',
      lastUpdated: new Date('2024-01-25'),
    },
    {
      id: '3',
      name: 'User Control Index',
      value: 91,
      target: 85,
      trend: 'improving',
      description: 'Level of user control over AI recommendations',
      category: 'accountability',
      lastUpdated: new Date('2024-01-24'),
    },
    {
      id: '4',
      name: 'Privacy Protection Score',
      value: 96,
      target: 95,
      trend: 'stable',
      description: 'Adherence to privacy protection guidelines',
      category: 'privacy',
      lastUpdated: new Date('2024-01-25'),
    },
    {
      id: '5',
      name: 'Safety Compliance Rate',
      value: 98,
      target: 99,
      trend: 'improving',
      description: 'Compliance with AI safety guidelines',
      category: 'safety',
      lastUpdated: new Date('2024-01-25'),
    },
  ]);

  // Mock data usage
  const [dataUsage] = useState<DataUsage[]>([
    {
      id: '1',
      dataType: 'Study Patterns',
      purpose: 'Personalized study recommendations',
      algorithms: ['Study Space Finder', 'Academic Assistant', 'Schedule Optimizer'],
      retentionPeriod: '2 years',
      sharingStatus: 'not-shared',
      userConsent: true,
      lastAccessed: new Date('2024-01-25'),
      accessFrequency: 45,
    },
    {
      id: '2',
      dataType: 'Location Data',
      purpose: 'University navigation and space recommendations',
      algorithms: ['Navigation Assistant', 'Study Space Finder'],
      retentionPeriod: '90 days',
      sharingStatus: 'not-shared',
      userConsent: false,
      lastAccessed: new Date('2024-01-20'),
      accessFrequency: 12,
    },
    {
      id: '3',
      dataType: 'Academic Performance',
      purpose: 'Progress tracking and academic support',
      algorithms: ['Academic Assistant', 'Challenge Recommender'],
      retentionPeriod: '7 years',
      sharingStatus: 'internal',
      userConsent: true,
      lastAccessed: new Date('2024-01-24'),
      accessFrequency: 23,
    },
  ]);

  // Mock opt-out options
  const [optOutOptions, setOptOutOptions] = useState<OptOutOption[]>([
    {
      id: '1',
      feature: 'Personalized Study Recommendations',
      description: 'AI-powered suggestions for study locations, timing, and methods',
      impact: 'You will receive generic recommendations instead of personalized ones',
      isOptedOut: false,
      canOptOut: true,
      category: 'recommendations',
      dependencies: ['Study Pattern Analysis', 'Location Preferences'],
    },
    {
      id: '2',
      feature: 'Predictive Wellness Interventions',
      description: 'AI detection of stress patterns and proactive wellness suggestions',
      impact: 'Wellness suggestions will be based on manual check-ins only',
      isOptedOut: false,
      canOptOut: true,
      category: 'recommendations',
      dependencies: ['Mood Pattern Recognition', 'Usage Analytics'],
    },
    {
      id: '3',
      feature: 'Academic Performance Analytics',
      description: 'AI analysis of academic progress and performance predictions',
      impact: 'Progress tracking will be manual without predictive insights',
      isOptedOut: false,
      canOptOut: true,
      category: 'analytics',
      dependencies: ['Grade Analysis', 'Study Time Correlation'],
    },
    {
      id: '4',
      feature: 'Behavioral Pattern Research',
      description: 'Anonymous data contribution to university wellness research',
      impact: 'Your anonymized data will not contribute to research insights',
      isOptedOut: true,
      canOptOut: true,
      category: 'research',
      dependencies: ['Anonymization Engine'],
    },
  ]);

  // Mock transparency report
  const [transparencyReport] = useState<TransparencyReport>({
    id: '1',
    period: 'January 2024',
    totalDecisions: 1247,
    averageConfidence: 86.4,
    appealRate: 3.2,
    biasIncidents: 3,
    algorithmUpdates: 8,
    userOptOuts: 14,
    complianceScore: 94.2,
  });

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  // Toggle opt-out option
  const toggleOptOut = (optionId: string) => {
    setOptOutOptions((prev) =>
      prev.map((option) =>
        option.id === optionId ? { ...option, isOptedOut: !option.isOptedOut } : option
      )
    );
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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'mitigated':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30';
      case 'investigating':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'detected':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Get trend color
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-500';
      case 'stable':
        return 'text-blue-500';
      case 'declining':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Ethics Dashboard', icon: '📊' },
    { id: 'decisions', name: 'AI Decisions', icon: '🤖' },
    { id: 'bias-detection', name: 'Bias Reports', icon: '⚖️' },
    { id: 'algorithms', name: 'Algorithm Updates', icon: '🔄' },
    { id: 'data-usage', name: 'Data Usage', icon: '📋' },
    { id: 'controls', name: 'User Controls', icon: '🎛️' },
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
              Loading AI ethics data...
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
                  className="h-10 w-10 mr-3 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                AI Ethics & Transparency
              </h1>
              <p
                className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto mb-6`}
              >
                Complete transparency into AI decision-making with bias detection, algorithmic
                accountability, and user control mechanisms.
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setShowDecisionModal(true)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
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
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  View Recent Decisions
                </button>

                <Link
                  href="/privacy"
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Privacy Settings
                </Link>

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
                  AI Ethics Guide
                </Link>
              </div>
            </div>
          </div>

          {/* Ethics Metrics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {ethicsMetrics.map((metric) => (
              <div
                key={metric.id}
                className={`p-4 rounded-xl ${isDarkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'} text-center animate-fade-in`}
              >
                <div
                  className={`text-2xl font-bold mb-1 ${
                    metric.value >= metric.target
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-orange-600 dark:text-orange-400'
                  }`}
                >
                  {metric.value}%
                </div>
                <div
                  className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-700'} mb-1`}
                >
                  {metric.name}
                </div>
                <div
                  className={`text-xs flex items-center justify-center ${getTrendColor(metric.trend)}`}
                >
                  {metric.trend === 'improving' ? '↗' : metric.trend === 'declining' ? '↘' : '→'}{' '}
                  {metric.trend}
                </div>
              </div>
            ))}
          </div>

          {/* Ethics Health Status */}
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
              AI Ethics Status: Excellent Compliance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <h4
                  className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}
                >
                  ✅ Transparent AI
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  All AI decisions include explanations and can be reviewed by users
                </p>
              </div>
              <div
                className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <h4
                  className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}
                >
                  ⚖️ Bias Monitoring
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Continuous bias detection with immediate mitigation protocols
                </p>
              </div>
              <div
                className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <h4
                  className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}
                >
                  🎛️ User Control
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Full control over AI features with easy opt-out mechanisms
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
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
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
            {/* Ethics Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Transparency Report */}
                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3
                      className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}
                    >
                      Monthly Transparency Report
                    </h3>

                    <div className="space-y-4">
                      <div
                        className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600/50' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span
                              className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                            >
                              {transparencyReport.totalDecisions.toLocaleString()}
                            </span>
                            <p
                              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              AI Decisions Made
                            </p>
                          </div>
                          <div>
                            <span
                              className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}
                            >
                              {transparencyReport.averageConfidence}%
                            </span>
                            <p
                              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              Avg Confidence
                            </p>
                          </div>
                          <div>
                            <span
                              className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}
                            >
                              {transparencyReport.appealRate}%
                            </span>
                            <p
                              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              Appeal Rate
                            </p>
                          </div>
                          <div>
                            <span
                              className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}
                            >
                              {transparencyReport.complianceScore}%
                            </span>
                            <p
                              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              Compliance Score
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h3
                      className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}
                    >
                      Recent Ethics Activity
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
                              Bias detection completed
                            </p>
                            <p
                              className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              3 issues detected and mitigated • Today
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
                              Algorithm update deployed
                            </p>
                            <p
                              className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              Study Space Finder v2.3.1 • 3 days ago
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-600/50' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <div>
                            <p
                              className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                            >
                              Ethics compliance audit
                            </p>
                            <p
                              className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              Score: 94.2% • 5 days ago
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
                              User appeal processed
                            </p>
                            <p
                              className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              Wellness recommendation adjusted • 1 week ago
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Decisions Tab */}
            {activeTab === 'decisions' && (
              <div className="p-8">
                <h2
                  className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}
                >
                  Recent AI Decisions
                </h2>

                <div className="space-y-6">
                  {aiDecisions.map((decision) => (
                    <div
                      key={decision.id}
                      className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3
                              className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                            >
                              {decision.service}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getImpactColor(decision.userImpact)}`}
                            >
                              {decision.userImpact} impact
                            </span>
                          </div>
                          <p
                            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            {decision.decision}
                          </p>
                        </div>

                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${decision.confidence >= 80 ? 'text-green-500' : decision.confidence >= 60 ? 'text-yellow-500' : 'text-red-500'}`}
                          >
                            {decision.confidence}%
                          </div>
                          <div
                            className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                          >
                            confidence
                          </div>
                        </div>
                      </div>

                      {/* Decision Explanation */}
                      <div
                        className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'} mb-4`}
                      >
                        <h4
                          className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} mb-2`}
                        >
                          Why this decision was made:
                        </h4>
                        <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                          {decision.explanation}
                        </p>
                      </div>

                      {/* Decision Factors */}
                      <div className="mb-4">
                        <h4
                          className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}
                        >
                          Factors Considered:
                        </h4>
                        <div className="space-y-2">
                          {decision.factorsUsed.map((factor) => (
                            <div
                              key={factor.id}
                              className={`flex items-center justify-between p-3 rounded ${isDarkMode ? 'bg-gray-600/50' : 'bg-white'}`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span
                                    className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                                  >
                                    {factor.name}
                                  </span>
                                  {factor.isPersonal && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                      personal
                                    </span>
                                  )}
                                </div>
                                <p
                                  className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}
                                >
                                  {factor.description}
                                </p>
                              </div>

                              <div className="ml-4 text-right">
                                <div
                                  className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                                >
                                  {factor.value}
                                </div>
                                <div
                                  className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                                >
                                  {factor.weight}% weight
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div
                          className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                          {decision.timestamp.toLocaleString()} • Outcome: {decision.outcome}
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedDecision(decision);
                              setShowDecisionModal(true);
                            }}
                            className={`px-4 py-2 text-sm ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg transition-all duration-200`}
                          >
                            View Details
                          </button>
                          {decision.canAppeal && !decision.appealed && (
                            <button
                              onClick={() => {
                                setSelectedDecision(decision);
                                setShowAppealModal(true);
                              }}
                              className="px-4 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all duration-200"
                            >
                              Appeal Decision
                            </button>
                          )}
                          {decision.appealed && (
                            <span className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg cursor-not-allowed">
                              Appeal Submitted
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bias Detection Tab */}
            {activeTab === 'bias-detection' && (
              <div className="p-8">
                <h2
                  className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}
                >
                  Bias Detection Reports
                </h2>

                <div className="space-y-6">
                  {biasReports.map((report) => (
                    <div
                      key={report.id}
                      className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3
                              className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                            >
                              {report.algorithm}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(report.severity)}`}
                            >
                              {report.severity} severity
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getStatusColor(report.status)}`}
                            >
                              {report.status}
                            </span>
                          </div>
                          <p
                            className={`text-sm font-medium ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}
                          >
                            {report.biasType}
                          </p>
                        </div>

                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                          >
                            {report.confidence}%
                          </div>
                          <div
                            className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                          >
                            confidence
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p
                        className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}
                      >
                        {report.description}
                      </p>

                      {/* Affected Groups */}
                      <div className="mb-4">
                        <h4
                          className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                        >
                          Affected Groups:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {report.affectedGroups.map((group) => (
                            <span
                              key={group}
                              className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}
                            >
                              {group}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Mitigation Steps */}
                      <div className="mb-4">
                        <h4
                          className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                        >
                          Mitigation Steps Taken:
                        </h4>
                        <ul className="space-y-1">
                          {report.mitigationSteps.map((step, index) => (
                            <li
                              key={index}
                              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 mr-2 text-green-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-xs text-gray-500">
                        Detected: {report.date.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Algorithm Updates Tab */}
            {activeTab === 'algorithms' && (
              <div className="p-8">
                <h2
                  className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}
                >
                  Algorithm Updates & Changes
                </h2>

                <div className="space-y-6">
                  {algorithmUpdates.map((update) => (
                    <div
                      key={update.id}
                      className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3
                              className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                            >
                              {update.algorithm}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getImpactColor(update.impactLevel)}`}
                            >
                              {update.impactLevel} impact
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                update.updateType === 'bias-mitigation'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                  : update.updateType === 'security'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                    : update.updateType === 'feature'
                                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {update.updateType}
                            </span>
                          </div>
                          <p
                            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            Version {update.version}
                          </p>
                        </div>

                        <div
                          className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                          {update.date.toLocaleDateString()}
                        </div>
                      </div>

                      {/* Description */}
                      <p
                        className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}
                      >
                        {update.description}
                      </p>

                      {/* Performance Changes */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div
                          className={`p-3 rounded ${isDarkMode ? 'bg-gray-600/50' : 'bg-white'} text-center`}
                        >
                          <div
                            className={`text-lg font-bold ${update.performanceChange.accuracy >= 0 ? 'text-green-500' : 'text-red-500'}`}
                          >
                            {update.performanceChange.accuracy >= 0 ? '+' : ''}
                            {update.performanceChange.accuracy}%
                          </div>
                          <div
                            className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            Accuracy
                          </div>
                        </div>
                        <div
                          className={`p-3 rounded ${isDarkMode ? 'bg-gray-600/50' : 'bg-white'} text-center`}
                        >
                          <div
                            className={`text-lg font-bold ${update.performanceChange.fairness >= 0 ? 'text-green-500' : 'text-red-500'}`}
                          >
                            {update.performanceChange.fairness >= 0 ? '+' : ''}
                            {update.performanceChange.fairness}%
                          </div>
                          <div
                            className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            Fairness
                          </div>
                        </div>
                        <div
                          className={`p-3 rounded ${isDarkMode ? 'bg-gray-600/50' : 'bg-white'} text-center`}
                        >
                          <div
                            className={`text-lg font-bold ${update.performanceChange.speed >= 0 ? 'text-green-500' : 'text-red-500'}`}
                          >
                            {update.performanceChange.speed >= 0 ? '+' : ''}
                            {update.performanceChange.speed}%
                          </div>
                          <div
                            className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            Speed
                          </div>
                        </div>
                      </div>

                      {/* Affected Features */}
                      <div className="mb-4">
                        <h4
                          className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                        >
                          Affected Features:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {update.affectedFeatures.map((feature) => (
                            <span
                              key={feature}
                              className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      {update.userNotification && (
                        <div
                          className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}
                        >
                          ✓ Users were notified of this update
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Usage Tab */}
            {activeTab === 'data-usage' && (
              <div className="p-8">
                <h2
                  className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}
                >
                  Data Usage Transparency
                </h2>

                <div className="space-y-6">
                  {dataUsage.map((usage) => (
                    <div
                      key={usage.id}
                      className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3
                            className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}
                          >
                            {usage.dataType}
                          </h3>
                          <p
                            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                          >
                            {usage.purpose}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              usage.userConsent
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            }`}
                          >
                            {usage.userConsent ? 'Consented' : 'No Consent'}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              usage.sharingStatus === 'not-shared'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : usage.sharingStatus === 'internal'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            }`}
                          >
                            {usage.sharingStatus}
                          </span>
                        </div>
                      </div>

                      {/* Usage Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4
                            className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                          >
                            Used by Algorithms:
                          </h4>
                          <ul className="space-y-1">
                            {usage.algorithms.map((algorithm, index) => (
                              <li
                                key={index}
                                className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center`}
                              >
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></span>
                                {algorithm}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span
                              className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              Retention:
                            </span>
                            <p
                              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              {usage.retentionPeriod}
                            </p>
                          </div>
                          <div>
                            <span
                              className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              Last Accessed:
                            </span>
                            <p
                              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              {usage.lastAccessed.toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span
                              className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              Access Frequency:
                            </span>
                            <p
                              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              {usage.accessFrequency} times this month
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Link
                          href="/privacy"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                        >
                          Manage Consent
                        </Link>
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

            {/* User Controls Tab */}
            {activeTab === 'controls' && (
              <div className="p-8">
                <h2
                  className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}
                >
                  AI Feature Controls
                </h2>

                <div className="space-y-6">
                  {['recommendations', 'personalization', 'analytics', 'research'].map(
                    (category) => (
                      <div key={category} className="mb-8">
                        <h3
                          className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4 capitalize`}
                        >
                          {category}
                        </h3>

                        <div className="space-y-4">
                          {optOutOptions
                            .filter((option) => option.category === category)
                            .map((option) => (
                              <div
                                key={option.id}
                                className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4
                                      className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}
                                    >
                                      {option.feature}
                                    </h4>
                                    <p
                                      className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}
                                    >
                                      {option.description}
                                    </p>

                                    {/* Impact */}
                                    <div
                                      className={`p-3 rounded ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'} mb-3`}
                                    >
                                      <h5
                                        className={`text-sm font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'} mb-1`}
                                      >
                                        Impact of opting out:
                                      </h5>
                                      <p
                                        className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}
                                      >
                                        {option.impact}
                                      </p>
                                    </div>

                                    {/* Dependencies */}
                                    {option.dependencies.length > 0 && (
                                      <div className="mb-3">
                                        <h5
                                          className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                                        >
                                          Related Features:
                                        </h5>
                                        <div className="flex flex-wrap gap-1">
                                          {option.dependencies.map((dep) => (
                                            <span
                                              key={dep}
                                              className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
                                            >
                                              {dep}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="ml-6">
                                    {option.canOptOut ? (
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={!option.isOptedOut}
                                          onChange={() => toggleOptOut(option.id)}
                                          className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        <span
                                          className={`ml-3 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                                        >
                                          {option.isOptedOut ? 'Opted Out' : 'Active'}
                                        </span>
                                      </label>
                                    ) : (
                                      <span className="text-sm text-gray-500">
                                        Required Feature
                                      </span>
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
              </div>
            )}
          </div>
        </div>

        {/* Decision Details Modal */}
        {showDecisionModal && selectedDecision && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                >
                  AI Decision Details
                </h2>
                <button
                  onClick={() => {
                    setShowDecisionModal(false);
                    setSelectedDecision(null);
                  }}
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

              <div className="space-y-4">
                <div>
                  <h3
                    className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                  >
                    {selectedDecision.service}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedDecision.decision}
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                  <h4
                    className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} mb-2`}
                  >
                    Explanation:
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                    {selectedDecision.explanation}
                  </p>
                </div>

                <div>
                  <h4
                    className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}
                  >
                    Decision Factors:
                  </h4>
                  <div className="space-y-2">
                    {selectedDecision.factorsUsed.map((factor) => (
                      <div
                        key={factor.id}
                        className={`p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span
                              className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                            >
                              {factor.name}
                            </span>
                            <p
                              className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              {factor.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}
                            >
                              {factor.value}
                            </div>
                            <div
                              className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                              {factor.weight}% weight
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span
                      className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Confidence:
                    </span>
                    <p
                      className={`${selectedDecision.confidence >= 80 ? 'text-green-500' : 'text-yellow-500'}`}
                    >
                      {selectedDecision.confidence}%
                    </p>
                  </div>
                  <div>
                    <span
                      className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      Impact:
                    </span>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedDecision.userImpact}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appeal Modal */}
        {showAppealModal && selectedDecision && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                >
                  Appeal AI Decision
                </h2>
                <button
                  onClick={() => {
                    setShowAppealModal(false);
                    setSelectedDecision(null);
                  }}
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
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-orange-600 dark:text-orange-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>

                <h3
                  className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}
                >
                  Submit Appeal
                </h3>

                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  Your appeal will be reviewed by our ethics team within 24 hours. Please explain
                  why you believe this decision was incorrect.
                </p>

                <textarea
                  placeholder="Explain your appeal..."
                  className={`w-full px-3 py-2 border rounded-lg mb-4 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'} focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  rows={4}
                />

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowAppealModal(false);
                      setSelectedDecision(null);
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
                    onClick={() => {
                      setShowAppealModal(false);
                      setSelectedDecision(null);
                      // In real app, would submit appeal
                    }}
                    className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Submit Appeal
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
