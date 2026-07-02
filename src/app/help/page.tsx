// src/app/help/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

// --- Interfaces ---
interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  helpful: number;
  tags: string[];
}

interface TutorialItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  videoUrl?: string;
  steps: string[];
}

interface ContactMethod {
  type: 'email' | 'chat' | 'phone' | 'office';
  title: string;
  description: string;
  availability: string;
  contact: string;
  icon: React.ReactNode;
}

export default function HelpSupportPage() {
  const { isDarkMode } = useDarkMode();
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // FAQ Data
  const [faqItems] = useState<FAQItem[]>([
    {
      id: '1',
      category: 'Getting Started',
      question: 'How do I set up my Smart University account?',
      answer:
        'After downloading the app, click "Get Started" on the welcome screen. You&apos;ll go through a 4-step onboarding process where you can set your preferences, connect your academic schedule, and customize AI features. The process takes about 5 minutes.',
      helpful: 47,
      tags: ['onboarding', 'setup', 'account'],
    },
    {
      id: '2',
      category: 'AI Features',
      question: 'How does the AI chatbot understand my questions?',
      answer:
        'Our AI chatbot uses advanced Natural Language Processing (NLP) to understand your questions in everyday language. It&apos;s trained specifically on university-related topics and can help with study spaces, navigation, academic planning, and wellness support. The more you use it, the better it becomes at understanding your specific needs.',
      helpful: 52,
      tags: ['ai', 'chatbot', 'nlp'],
    },
    {
      id: '3',
      category: 'Study Spaces',
      question: 'How accurate are the study space availability predictions?',
      answer:
        'Our AI analyzes historical usage patterns, current bookings, and real-time data to predict availability with 85-90% accuracy. Predictions are updated every 15 minutes and become more accurate over time as the system learns university patterns.',
      helpful: 38,
      tags: ['study-spaces', 'predictions', 'accuracy'],
    },
    {
      id: '4',
      category: 'Privacy & Security',
      question: 'What data does Smart University collect about me?',
      answer:
        'We collect only what&apos;s necessary to provide personalized services: your preferences, usage patterns, and academic schedule (if you choose to share it). All data is encrypted, stored securely, and you have full control over what&apos;s shared. Visit our Privacy Center for complete details.',
      helpful: 41,
      tags: ['privacy', 'data', 'security'],
    },
    {
      id: '5',
      category: 'Navigation',
      question: 'Why isn&apos;t university navigation working for me?',
      answer:
        'Navigation requires location permissions. Check that you&apos;ve enabled location services for the Smart University app in your device settings. If issues persist, try refreshing the app or ensuring you have a stable internet connection.',
      helpful: 29,
      tags: ['navigation', 'location', 'troubleshooting'],
    },
    {
      id: '6',
      category: 'Wellness',
      question: 'Is my wellness data private and secure?',
      answer:
        'Yes, absolutely. Wellness check-ins and mood data are encrypted and stored securely. This information is never shared with anyone without your explicit consent. You can view, edit, or delete your wellness data anytime in the Privacy Center.',
      helpful: 44,
      tags: ['wellness', 'privacy', 'security'],
    },
    {
      id: '7',
      category: 'AI Features',
      question: 'Can I turn off specific AI features?',
      answer:
        'Yes! Go to Profile & Settings > AI Features to enable or disable any AI functionality. You can use Smart University with minimal AI features if you prefer, though some advanced features like personalized recommendations won&apos;t be available.',
      helpful: 33,
      tags: ['ai', 'settings', 'control'],
    },
    {
      id: '8',
      category: 'Technical Issues',
      question: 'The app is running slowly. How can I fix this?',
      answer:
        'Try these steps: 1) Close and restart the app, 2) Check your internet connection, 3) Clear the app cache in settings, 4) Restart your device, 5) Update to the latest app version. If problems persist, contact our technical support.',
      helpful: 26,
      tags: ['performance', 'technical', 'troubleshooting'],
    },
  ]);

  // Tutorial Data
  const [tutorials] = useState<TutorialItem[]>([
    {
      id: '1',
      title: 'Getting Started with Smart University',
      description: 'Complete walkthrough of setting up your account and basic features',
      duration: '8 minutes',
      difficulty: 'beginner',
      category: 'Getting Started',
      steps: [
        'Download and install the app',
        'Complete the onboarding process',
        'Set your preferences and privacy settings',
        'Connect your academic schedule',
        'Explore the main dashboard features',
      ],
    },
    {
      id: '2',
      title: 'Mastering the AI Chatbot',
      description: 'Learn how to get the most out of your AI university assistant',
      duration: '12 minutes',
      difficulty: 'intermediate',
      category: 'AI Features',
      steps: [
        'Understanding natural language commands',
        'Using quick action buttons effectively',
        'Getting study space recommendations',
        'Academic planning assistance',
        'Wellness support features',
      ],
    },
    {
      id: '3',
      title: 'Smart Study Space Booking',
      description: 'Find and book the perfect study spaces using AI recommendations',
      duration: '6 minutes',
      difficulty: 'beginner',
      category: 'Study Spaces',
      steps: [
        'Browse available spaces',
        'Set your study preferences',
        'Use AI recommendations',
        'Book and manage reservations',
        'Rate and review spaces',
      ],
    },
    {
      id: '4',
      title: 'Privacy and Data Control',
      description: 'Manage your privacy settings and understand data usage',
      duration: '10 minutes',
      difficulty: 'intermediate',
      category: 'Privacy',
      steps: [
        'Understanding data collection',
        'Configuring privacy settings',
        'Managing AI feature permissions',
        'Exporting your data',
        'Account security best practices',
      ],
    },
  ]);

  // Contact Methods
  const contactMethods: ContactMethod[] = [
    {
      type: 'chat',
      title: 'Live Chat Support',
      description: 'Get instant help from our support team',
      availability: '24/7 via AI, Human agents 9 AM - 6 PM',
      contact: 'Available in app',
      icon: (
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
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      type: 'email',
      title: 'Email Support',
      description: 'Send detailed questions and get comprehensive answers',
      availability: 'Response within 24 hours',
      contact: 'support@smartuniversity.edu',
      icon: (
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
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      type: 'phone',
      title: 'Phone Support',
      description: 'Speak directly with our technical support team',
      availability: 'Monday - Friday, 9 AM - 6 PM',
      contact: '+1 (555) UNIVERSITY-1',
      icon: (
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
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
    },
    {
      type: 'office',
      title: 'University IT Office',
      description: 'Visit us in person for hands-on assistance',
      availability: 'Monday - Friday, 8 AM - 5 PM',
      contact: 'Student Center, Room 205',
      icon: (
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
  ];

  // Filter FAQs based on search and category
  const filteredFAQs = faqItems.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(faqItems.map((item) => item.category)))];

  // Handle ticket submission
  const handleTicketSubmit = () => {
    setTicketSubmitted(true);
    setShowTicketForm(false);
    setTimeout(() => setTicketSubmitted(false), 5000);
  };

  // Section navigation
  const sections = [
    { id: 'faq', name: 'FAQ', icon: '❓' },
    { id: 'tutorials', name: 'Tutorials', icon: '🎓' },
    { id: 'contact', name: 'Contact', icon: '📞' },
    { id: 'tickets', name: 'Support Tickets', icon: '🎫' },
    { id: 'feedback', name: 'Feedback', icon: '💬' },
  ];

  return (
    <>
      <Navigation />
      <main
        className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}
      >
        <AnimatedBackground variant="dashboard" />

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
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
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Help & Support Center
              </h1>
              <p
                className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto`}
              >
                Get help with Smart University features, troubleshoot issues, and learn how to make
                the most of your AI-powered university assistant.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Link
                href="/chatbot"
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Ask AI Assistant
              </Link>

              <button
                onClick={() => setShowTicketForm(true)}
                className={`px-6 py-3 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center`}
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
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                </svg>
                Submit Ticket
              </button>

              <Link
                href="/ai-ethics"
                className={`px-6 py-3 ${isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-blue-200' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'} rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center`}
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                AI Ethics Info
              </Link>
            </div>
          </div>

          {/* Success Message */}
          {ticketSubmitted && (
            <div
              className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'} animate-fade-in`}
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500 mr-3"
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
                <p className={`${isDarkMode ? 'text-green-300' : 'text-green-800'} font-medium`}>
                  Support ticket submitted successfully! We&apos;ll get back to you within 24 hours.
                </p>
              </div>
            </div>
          )}

          {/* Section Navigation */}
          <div
            className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm mb-6 animate-fade-in`}
          >
            <div className="flex overflow-x-auto">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex-1 min-w-0 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeSection === section.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg">{section.icon}</span>
                    <span className="hidden sm:inline">{section.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Sections */}
          <div
            className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-8 animate-fade-in`}
          >
            {/* FAQ Section */}
            {activeSection === 'faq' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <h2
                    className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                  >
                    Frequently Asked Questions
                  </h2>

                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search FAQs..."
                        className={`pl-10 pr-4 py-2 rounded-lg border transition-all duration-200 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`absolute left-3 top-2.5 h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>

                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <div
                      key={faq.id}
                      className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} transition-all duration-200 hover:shadow-md`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}
                          >
                            {faq.question}
                          </h3>
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'}`}
                          >
                            {faq.category}
                          </span>
                        </div>
                      </div>
                      <p
                        className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4 leading-relaxed`}
                      >
                        {faq.answer}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {faq.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                          >
                            Was this helpful?
                          </span>
                          <button className="text-green-500 hover:text-green-600 transition-colors duration-200">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                              />
                            </svg>
                          </button>
                          <span
                            className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                          >
                            {faq.helpful}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredFAQs.length === 0 && (
                  <div className="text-center py-12">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-16 w-16 mx-auto mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No FAQs found matching your search.
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-2`}>
                      Try adjusting your search terms or category filter.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tutorials Section */}
            {activeSection === 'tutorials' && (
              <div className="space-y-6">
                <h2
                  className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}
                >
                  Video Tutorials & Guides
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tutorials.map((tutorial) => (
                    <div
                      key={tutorial.id}
                      className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} transition-all duration-200 hover:shadow-md`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}
                          >
                            {tutorial.title}
                          </h3>
                          <p
                            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}
                          >
                            {tutorial.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mb-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}
                        >
                          {tutorial.duration}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            tutorial.difficulty === 'beginner'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              : tutorial.difficulty === 'intermediate'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}
                        >
                          {tutorial.difficulty}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'}`}
                        >
                          {tutorial.category}
                        </span>
                      </div>

                      <div className="mb-4">
                        <h4
                          className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                        >
                          What you&apos;ll learn:
                        </h4>
                        <ul className="space-y-1">
                          {tutorial.steps.slice(0, 3).map((step, index) => (
                            <li
                              key={index}
                              className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center`}
                            >
                              <span className="w-1 h-1 bg-purple-500 rounded-full mr-2"></span>
                              {step}
                            </li>
                          ))}
                          {tutorial.steps.length > 3 && (
                            <li
                              className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} italic`}
                            >
                              +{tutorial.steps.length - 3} more steps...
                            </li>
                          )}
                        </ul>
                      </div>

                      <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Watch Tutorial
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Section */}
            {activeSection === 'contact' && (
              <div className="space-y-6">
                <h2
                  className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}
                >
                  Contact Support
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {contactMethods.map((method) => (
                    <div
                      key={method.type}
                      className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} transition-all duration-200 hover:shadow-md`}
                    >
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-4">
                          <div className="text-purple-600 dark:text-purple-400">{method.icon}</div>
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}
                          >
                            {method.title}
                          </h3>
                          <p
                            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}
                          >
                            {method.description}
                          </p>
                          <div className="space-y-1">
                            <p
                              className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              <span className="font-medium">Contact:</span> {method.contact}
                            </p>
                            <p
                              className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              <span className="font-medium">Available:</span> {method.availability}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Emergency Contact */}
                <div
                  className={`p-6 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-red-500 mr-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <div>
                      <h3
                        className={`font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-800'} mb-1`}
                      >
                        Emergency Support
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                        For urgent technical issues affecting university safety or security, call
                        University Emergency: <strong>911</strong> or University Security:{' '}
                        <strong>(555) 123-4567</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Support Tickets Section */}
            {activeSection === 'tickets' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2
                    className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                  >
                    Support Tickets
                  </h2>
                  <button
                    onClick={() => setShowTicketForm(true)}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    New Ticket
                  </button>
                </div>

                {/* Ticket Status Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}
                  >
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2</div>
                    <div className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      Open
                    </div>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}
                  >
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">1</div>
                    <div
                      className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}
                    >
                      In Progress
                    </div>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}
                  >
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">8</div>
                    <div className={`text-sm ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>
                      Resolved
                    </div>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}
                  >
                    <div
                      className={`text-2xl font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      11
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Total
                    </div>
                  </div>
                </div>

                {/* Recent Tickets */}
                <div>
                  <h3
                    className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}
                  >
                    Recent Tickets
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        id: '#2024-001',
                        subject: 'AI chatbot not responding',
                        status: 'in-progress',
                        priority: 'medium',
                        date: '2 hours ago',
                      },
                      {
                        id: '#2024-002',
                        subject: 'Study space booking error',
                        status: 'resolved',
                        priority: 'low',
                        date: '1 day ago',
                      },
                      {
                        id: '#2024-003',
                        subject: 'Navigation not loading',
                        status: 'open',
                        priority: 'high',
                        date: '3 days ago',
                      },
                    ].map((ticket) => (
                      <div
                        key={ticket.id}
                        className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} transition-all duration-200 hover:shadow-md`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span
                                className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                              >
                                {ticket.id}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  ticket.status === 'open'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                    : ticket.status === 'in-progress'
                                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                }`}
                              >
                                {ticket.status.replace('-', ' ')}
                              </span>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  ticket.priority === 'high'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                    : ticket.priority === 'medium'
                                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {ticket.priority}
                              </span>
                            </div>
                            <h4
                              className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-1`}
                            >
                              {ticket.subject}
                            </h4>
                            <p
                              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              {ticket.date}
                            </p>
                          </div>
                          <button
                            className={`text-sm ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'} transition-colors duration-200`}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Section */}
            {activeSection === 'feedback' && (
              <div className="space-y-6">
                <h2
                  className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}
                >
                  Send Feedback
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Feedback Form */}
                  <div>
                    <h3
                      className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}
                    >
                      Share Your Thoughts
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label
                          className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                        >
                          Feedback Type
                        </label>
                        <select
                          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100'
                              : 'bg-white border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                        >
                          <option>Feature Request</option>
                          <option>Bug Report</option>
                          <option>General Feedback</option>
                          <option>Improvement Suggestion</option>
                        </select>
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                        >
                          Subject
                        </label>
                        <input
                          type="text"
                          placeholder="Brief description of your feedback"
                          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                        >
                          Details
                        </label>
                        <textarea
                          rows={6}
                          placeholder="Please provide detailed feedback..."
                          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                        />
                      </div>

                      <button className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center">
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
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                        Send Feedback
                      </button>
                    </div>
                  </div>

                  {/* Feedback Stats */}
                  <div>
                    <h3
                      className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}
                    >
                      Community Feedback
                    </h3>
                    <div className="space-y-4">
                      <div
                        className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            Overall Satisfaction
                          </span>
                          <span className="text-lg font-bold text-green-500">4.7/5</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: '94%' }}
                          ></div>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
                      >
                        <h4
                          className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}
                        >
                          Recent Improvements
                        </h4>
                        <ul className="space-y-2">
                          <li
                            className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center`}
                          >
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                            Faster AI response times
                          </li>
                          <li
                            className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center`}
                          >
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                            Improved study space predictions
                          </li>
                          <li
                            className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center`}
                          >
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                            Enhanced accessibility features
                          </li>
                        </ul>
                      </div>

                      <div
                        className={`p-4 rounded-lg ${isDarkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}
                      >
                        <h4
                          className={`font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-800'} mb-2`}
                        >
                          Feature Voting
                        </h4>
                        <p
                          className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-700'} mb-3`}
                        >
                          Help us prioritize new features by voting on what matters most to you!
                        </p>
                        <button
                          className={`text-sm ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'} transition-colors duration-200 flex items-center`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          Vote on Features
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Support Ticket Modal */}
        {showTicketForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                >
                  Submit Support Ticket
                </h2>
                <button
                  onClick={() => setShowTicketForm(false)}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                    >
                      Category
                    </label>
                    <select
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    >
                      <option>Technical Issue</option>
                      <option>AI Features</option>
                      <option>Academic Support</option>
                      <option>Privacy Concern</option>
                      <option>General Question</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                    >
                      Priority
                    </label>
                    <select
                      className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-100'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of your issue"
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}
                  >
                    Description
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Please provide detailed information about your issue..."
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowTicketForm(false)}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTicketSubmit}
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Submit Ticket
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
