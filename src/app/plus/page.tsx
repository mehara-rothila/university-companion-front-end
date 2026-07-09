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

  // What actually changes when a student upgrades — the core of the pitch.
  const changes = [
    { label: 'Daily AI tokens', free: '500,000', plus: '5,000,000', highlight: '10× more' },
    { label: 'AI model', free: 'Standard', plus: 'Priority — faster & sharper' },
    { label: 'PDF & past-paper analysis', free: 'Basic', plus: 'Advanced exam prep' },
    { label: 'Image analysis', free: 'Included', plus: 'Higher limits' },
    { label: 'Daily cap interruptions', free: 'Pauses at the limit', plus: 'None' },
    { label: 'Support', free: 'Standard', plus: 'Priority' },
    { label: 'All campus features', free: 'Included', plus: 'Included' },
  ];

  const freeFeatures = [
    '500,000 AI tokens every day',
    'Chat, image & PDF analysis',
    'Standard model with daily reset',
    'Every campus feature included',
  ];

  const plusFeatures = [
    '5,000,000 AI tokens every day (10×)',
    'Priority model — faster, sharper answers',
    'Advanced PDF & past-paper exam prep',
    'No mid-session cap interruptions',
    'Priority support',
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
                  Everything on the Smart University Companion stays free. Plus supercharges the one
                  thing students lean on hardest — your Athena AI study companion.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-2">
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
                  Same app, same free features — a much bigger Athena.
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
                    <tbody>
                      {changes.map((row, i) => (
                        <tr
                          key={i}
                          className={`${isDarkMode ? 'border-gray-700/50' : 'border-gray-100'} ${i < changes.length - 1 ? 'border-b' : ''}`}
                        >
                          <td
                            className={`px-6 py-4 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                          >
                            {row.label}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} whitespace-nowrap`}
                          >
                            {row.free}
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap">
                            <span className={`${isDarkMode ? 'text-gray-100' : 'text-gray-900'} font-medium`}>
                              {row.plus}
                            </span>
                            {row.highlight && (
                              <span
                                className={`ml-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${isDarkMode ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700'}`}
                              >
                                {row.highlight}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
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
