'use client';

import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import AnimatedBackground from '@/components/AnimatedBackground';
import {
  Crown,
  Check,
  Zap,
  Bot,
  FileText,
  Sparkles,
  Heart,
  ArrowRight,
  Shield,
} from 'lucide-react';

export default function PlusPage() {
  const { isDarkMode } = useDarkMode();
  const { isAuthenticated } = useAuth();

  // What actually changes when a student upgrades — grouped across the whole app.
  const sections = [
    {
      title: 'Athena AI',
      rows: [
        { label: 'AI usage', free: '100,000 tokens / day', plus: 'Unlimited', highlight: 'no daily cap' },
        { label: 'AI model', free: 'Standard', plus: 'Priority — fastest & most capable' },
        { label: 'PDF & past-paper analysis', free: '3 per day', plus: 'Unlimited + advanced exam prep', highlight: 'unlimited' },
        { label: 'Image analysis', free: '3 per day', plus: 'Unlimited, higher resolution', highlight: 'unlimited' },
        { label: 'Upload size & context', free: 'Standard', plus: 'Larger uploads, longer context' },
        { label: 'Chatbot file storage', free: '100 MB', plus: '10 GB for notes, PDFs & images', highlight: '100×' },
        { label: 'Chat history', free: 'Last 7 days', plus: 'Saved & organised forever' },
        { label: 'When you hit the limit', free: 'Athena pauses', plus: 'Never interrupted' },
      ],
    },
    {
      title: 'Across campus',
      rows: [
        { label: 'Profile', free: 'Standard', plus: 'Plus crown badge + exclusive themes' },
        { label: 'Challenges & competitions', free: 'Standard challenges', plus: 'Plus-only challenges, 2× reward points', highlight: '2× points' },
        { label: 'Event registration', free: 'General queue', plus: 'Early-bird access + priority waitlist' },
        { label: 'Your events & book listings', free: 'Standard visibility', plus: '2 free boosts every month' },
        { label: 'Study spaces', free: 'Live occupancy view', plus: 'Alerts when your favourite space frees up' },
        { label: 'Weather', free: "Today's forecast", plus: '7-day outlook + severe-weather alerts' },
        { label: 'Career tools', free: 'Standard resources', plus: 'AI CV & cover-letter review' },
        { label: 'New features', free: '—', plus: 'Early access' },
        { label: 'Experience', free: 'Standard', plus: 'Ad-free' },
        { label: 'Support', free: 'Community', plus: 'Priority support' },
      ],
    },
  ];

  const freeFeatures = [
    '100,000 AI tokens per day',
    '3 PDF / image analyses per day',
    '100 MB chatbot file storage',
    'Chat history kept for 7 days',
    'Standard challenges & event queue',
    "Today's weather & live study spaces",
    'All campus features included',
  ];

  const plusFeatures = [
    'Unlimited AI chat — no daily cap',
    'Priority model + unlimited PDF & image analysis',
    'Advanced past-paper & exam-prep mode',
    '10 GB chatbot storage for notes, PDFs & images',
    'Chat history saved forever',
    'Plus crown badge & exclusive themes',
    'Plus-only challenges with 2× reward points',
    'Early-bird event registration & priority waitlist',
    '2 free boosts a month for your events & listings',
    'Study-space alerts & 7-day weather outlook',
    'AI CV review · ad-free · priority support',
  ];

  return (
    <>
      <div
        className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}
      >
        <ScrollProgress />
        <AnimatedBackground />
        <Navigation />

        <main id="main-content" className="relative z-10 pt-20">
          {/* Hero */}
          <section className="relative" aria-label="Athena Plus overview">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
              <div className="flex justify-center mb-8">
                <div
                  className={`p-5 rounded-2xl ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100'}`}
                >
                  <Crown
                    className={`h-14 w-14 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`}
                  />
                </div>
              </div>

              <h1
                className={`text-5xl sm:text-6xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}
              >
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  Athena Plus
                </span>
              </h1>

              <div
                className={`${isDarkMode ? '' : 'bg-white/80 backdrop-blur-sm'} rounded-2xl px-6 py-4 max-w-2xl mx-auto mb-8`}
              >
                <p
                  className={`text-lg sm:text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}
                >
                  One upgrade for your whole campus life — unlimited Athena AI, plus perks across
                  challenges, events, study spaces, weather, career tools and more.
                </p>
              </div>

              <div className="flex justify-center mb-2">
                <div
                  className={`inline-flex flex-col sm:flex-row items-center justify-center gap-x-3 gap-y-1 ${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white/80 border-gray-200'} backdrop-blur-sm border rounded-2xl px-6 py-4 shadow-sm`}
                >
                  <span
                    className={`text-4xl sm:text-5xl font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`}
                  >
                    LKR&nbsp;490
                  </span>
                  <span className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    / month · or LKR&nbsp;4,900 / year (2 months free)
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* What changes */}
          <section className="pb-8" aria-label="How Free compares to Plus">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div
                className={`text-center mb-10 ${isDarkMode ? '' : 'bg-white/80 backdrop-blur-sm'} rounded-2xl px-6 py-6 max-w-3xl mx-auto`}
              >
                <h2
                  className={`text-3xl sm:text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}
                >
                  What changes when you go Plus
                </h2>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Not just AI — Plus upgrades every corner of the app.
                </p>
              </div>

              <div
                className={`${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm border rounded-2xl shadow-lg overflow-hidden`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr
                        className={`${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}
                      >
                        <th
                          className={`px-6 py-4 text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          What you get
                        </th>
                        <th
                          className={`px-6 py-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                          Free
                        </th>
                        <th
                          className={`px-6 py-4 text-sm font-semibold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <Crown className="h-4 w-4" /> Plus
                          </span>
                        </th>
                      </tr>
                    </thead>
                    {sections.map((section) => (
                      <tbody key={section.title}>
                        <tr>
                          <td
                            colSpan={3}
                            className={`px-6 pt-5 pb-2 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-amber-400/90 bg-gray-900/30' : 'text-amber-600 bg-amber-50/60'}`}
                          >
                            {section.title}
                          </td>
                        </tr>
                        {section.rows.map((row, i) => (
                          <tr
                            key={row.label}
                            className={`${isDarkMode ? 'border-gray-700/50' : 'border-gray-100'} ${i < section.rows.length - 1 ? 'border-b' : ''}`}
                          >
                            <td
                              className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                            >
                              {row.label}
                            </td>
                            <td
                              className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                              {row.free}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`${isDarkMode ? 'text-gray-100' : 'text-gray-900'} font-medium`}>
                                {row.plus}
                              </span>
                              {row.highlight && (
                                <span
                                  className={`ml-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${isDarkMode ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700'}`}
                                >
                                  {row.highlight}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    ))}
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* Plan cards */}
          <section className="py-14" aria-label="Free and Plus plans">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* Free */}
                <div
                  className={`${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm border rounded-2xl p-8 shadow-lg flex flex-col`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <Bot className={`h-6 w-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      Athena Free
                    </h3>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-5`}>
                    For every student, always
                  </p>
                  <div className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                    LKR&nbsp;0
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {freeFeatures.map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className={`h-5 w-5 mt-0.5 flex-none ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={isAuthenticated ? '/chatbot' : '/signup'}
                    className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 border ${isDarkMode ? 'bg-gray-700/50 hover:bg-gray-700 text-gray-200 border-gray-600' : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300'}`}
                  >
                    {isAuthenticated ? 'Your current plan' : 'Start free'}
                  </Link>
                </div>

                {/* Plus */}
                <div
                  className={`relative bg-gradient-to-b ${isDarkMode ? 'from-amber-900/20 to-gray-800/60 border-amber-500/40' : 'from-amber-50 to-white border-amber-300'} backdrop-blur-sm border-2 rounded-2xl p-8 shadow-xl flex flex-col`}
                >
                  <span className="absolute -top-3 left-8 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full shadow">
                    Recommended
                  </span>
                  <div className="flex items-center gap-3 mb-1">
                    <Crown className={`h-6 w-6 ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      Athena Plus
                    </h3>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-5`}>
                    For coursework &amp; exam season
                  </p>
                  <div className="mb-6">
                    <span className={`text-3xl font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`}>
                      LKR&nbsp;490
                    </span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}> / month</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plusFeatures.map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className={`h-5 w-5 mt-0.5 flex-none ${isDarkMode ? 'text-amber-400' : 'text-amber-500'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={isAuthenticated ? '/chatbot' : '/login'}
                    className="group w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    Upgrade to Plus
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Top-up note */}
              <div
                className={`mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-center ${isDarkMode ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white border-gray-200'} border rounded-2xl px-6 py-5`}
              >
                <Zap className={`h-5 w-5 ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  No subscription? <span className="font-semibold">Token top-up</span> — add
                  1,000,000 tokens for <span className="font-semibold">LKR&nbsp;190</span>, one-time.
                  They never expire.
                </p>
              </div>
            </div>
          </section>

          {/* Mission */}
          <section className="pb-20" aria-label="Free where it counts">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <div
                className={`flex items-start gap-4 rounded-2xl p-6 ${isDarkMode ? 'bg-green-900/15 border-green-800/40' : 'bg-green-50 border-green-200'} border`}
              >
                <div
                  className={`inline-flex items-center justify-center w-11 h-11 rounded-xl flex-none ${isDarkMode ? 'bg-green-900/40' : 'bg-green-100'}`}
                >
                  <Heart className={`h-6 w-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div>
                  <h3 className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-1`}>
                    Free where it counts
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                    Financial aid, lost &amp; found and emergency alerts are never behind a paywall.
                    Plus only enhances Athena — never the things students rely on in a pinch.
                  </p>
                </div>
              </div>

              <p className={`text-center text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-6 flex items-center justify-center gap-1.5`}>
                <Shield className="h-3.5 w-3.5" />
                Pricing shown is illustrative for demonstration.
              </p>
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </>
  );
}
