'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import AnimatedBackground from '@/components/AnimatedBackground';
import {
  Brain,
  MapPin,
  BookOpen,
  Users,
  Heart,
  Search,
  Bot,
  Sparkles,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Crown,
} from 'lucide-react';

export default function Home() {
  const { isDarkMode } = useDarkMode();
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: <Bot className="h-8 w-8" />,
      title: t('homepage.features.aiAssistant.title'),
      description: t('homepage.features.aiAssistant.description'),
      color: 'from-purple-500 to-blue-500',
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: t('homepage.features.smartNavigation.title'),
      description: t('homepage.features.smartNavigation.description'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: t('homepage.features.studySpaces.title'),
      description: t('homepage.features.studySpaces.description'),
      color: 'from-cyan-500 to-teal-500',
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: t('homepage.features.lostFound.title'),
      description: t('homepage.features.lostFound.description'),
      color: 'from-teal-500 to-emerald-500',
    },
  ];

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <>
      <div
        className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}
      >
        <ScrollProgress />
        <AnimatedBackground />
        <Navigation />

        <main id="main-content" className="relative z-10">
          {/* Hero Section */}
          <section className="relative pt-20" aria-label="Hero section with main call-to-action">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
              <div className="text-center">
                {/* Logo/Icon */}
                <div className="flex justify-center mb-8">
                  <div
                    className={`p-5 rounded-2xl ${isDarkMode ? 'bg-purple-900/40' : 'bg-purple-100'}`}
                  >
                    <Brain
                      className={`h-14 w-14 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}
                    />
                  </div>
                </div>

                {/* Main Title */}
                <h1
                  className={`text-5xl sm:text-6xl lg:text-7xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}
                >
                  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {t('homepage.hero.title')}
                  </span>
                </h1>

                <div
                  className={`${isDarkMode ? '' : 'bg-white/80 backdrop-blur-sm'} rounded-2xl px-6 py-4 inline-block mb-8`}
                >
                  <h2
                    className={`text-xl sm:text-2xl lg:text-3xl font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('homepage.hero.subtitle')}
                  </h2>
                </div>

                <div
                  className={`${isDarkMode ? '' : 'bg-white/80 backdrop-blur-sm'} rounded-2xl px-6 py-4 max-w-3xl mx-auto mb-12`}
                >
                  <p
                    className={`text-lg sm:text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}
                  >
                    {t('homepage.hero.description')}
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                  {!isAuthenticated ? (
                    <>
                      <Link
                        href="/login"
                        className="group flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:from-purple-700 focus:to-blue-700 text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-xl transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                      >
                        {t('homepage.hero.getStarted')}
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-focus:translate-x-1 transition-transform" />
                      </Link>
                      <Link
                        href="/signup"
                        className={`px-8 py-4 ${isDarkMode ? 'bg-gray-800/50 hover:bg-gray-700/50 focus:bg-gray-700/50 text-gray-200 border-gray-600' : 'bg-white/50 hover:bg-white/70 focus:bg-white/70 text-gray-700 border-gray-300'} border backdrop-blur-lg rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-xl transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50`}
                      >
                        {t('homepage.hero.createAccount')}
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="group flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      {t('homepage.hero.welcomeBack', { name: user?.firstName || '' })}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                  <Link
                    href="/plus"
                    className="group flex items-center px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 focus:from-amber-600 focus:to-yellow-600 text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-xl transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-500/50"
                  >
                    <Crown className="mr-2 h-5 w-5" />
                    Athena Plus
                  </Link>
                </div>

                {/* Rotating Feature Showcase */}
                <div className="max-w-xl mx-auto">
                  <div
                    className={`${isDarkMode ? 'bg-gray-800/60' : 'bg-white'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200'} rounded-2xl p-8 shadow-lg`}
                  >
                    <div className="flex items-center justify-center mb-5">
                      <div
                        className={`p-4 rounded-xl transition-all duration-500 ${
                          currentFeature === 0
                            ? 'bg-purple-100 dark:bg-purple-900/40'
                            : currentFeature === 1
                              ? 'bg-blue-100 dark:bg-blue-900/40'
                              : currentFeature === 2
                                ? 'bg-cyan-100 dark:bg-cyan-900/40'
                                : 'bg-teal-100 dark:bg-teal-900/40'
                        }`}
                      >
                        <div
                          className={`transition-all duration-500 ${
                            currentFeature === 0
                              ? 'text-purple-600 dark:text-purple-400'
                              : currentFeature === 1
                                ? 'text-blue-600 dark:text-blue-400'
                                : currentFeature === 2
                                  ? 'text-cyan-600 dark:text-cyan-400'
                                  : 'text-teal-600 dark:text-teal-400'
                          }`}
                        >
                          {features[currentFeature].icon}
                        </div>
                      </div>
                    </div>
                    <h3
                      className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-3 transition-all duration-500`}
                    >
                      {features[currentFeature].title}
                    </h3>
                    <p
                      className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed transition-all duration-500`}
                    >
                      {features[currentFeature].description}
                    </p>

                    {/* Feature Dots */}
                    <div className="flex justify-center mt-6 space-x-3">
                      {features.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          aria-label={`View feature ${index + 1}`}
                          onClick={() => setCurrentFeature(index)}
                          className={`w-2 h-2 min-w-0 min-h-0 p-0 rounded-full transition-all duration-300 appearance-none border-0 ${
                            index === currentFeature
                              ? 'bg-purple-500 dark:bg-purple-400 scale-150'
                              : isDarkMode
                                ? 'bg-gray-600 hover:bg-gray-500'
                                : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Features Grid */}
          <section className="py-20" aria-label="Key features and services overview">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div
                className={`text-center mb-16 ${isDarkMode ? '' : 'bg-white/80 backdrop-blur-sm'} rounded-2xl px-6 py-6 max-w-3xl mx-auto`}
              >
                <h2
                  className={`text-3xl sm:text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}
                >
                  {t('homepage.everythingYouNeed.title')}
                </h2>
                <p
                  className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}
                >
                  {t('homepage.everythingYouNeed.subtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: <Bot className="h-7 w-7" />,
                    title: t('homepage.quickFeatures.aiChat.title'),
                    description: t('homepage.quickFeatures.aiChat.description'),
                    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
                    iconColor: 'text-purple-600 dark:text-purple-400',
                    hoverBorder: 'hover:border-purple-300 dark:hover:border-purple-600',
                  },
                  {
                    icon: <MapPin className="h-7 w-7" />,
                    title: t('homepage.quickFeatures.interactiveMaps.title'),
                    description: t('homepage.quickFeatures.interactiveMaps.description'),
                    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
                    iconColor: 'text-emerald-600 dark:text-emerald-400',
                    hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-600',
                  },
                  {
                    icon: <BookOpen className="h-7 w-7" />,
                    title: t('homepage.quickFeatures.studyResources.title'),
                    description: t('homepage.quickFeatures.studyResources.description'),
                    iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',
                    iconColor: 'text-cyan-600 dark:text-cyan-400',
                    hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-600',
                  },
                  {
                    icon: <Search className="h-7 w-7" />,
                    title: t('homepage.quickFeatures.lostFound.title'),
                    description: t('homepage.quickFeatures.lostFound.description'),
                    iconBg: 'bg-slate-100 dark:bg-slate-800/60',
                    iconColor: 'text-slate-600 dark:text-slate-400',
                    hoverBorder: 'hover:border-slate-300 dark:hover:border-slate-600',
                  },
                  {
                    icon: <Heart className="h-7 w-7" />,
                    title: t('homepage.quickFeatures.wellnessHub.title'),
                    description: t('homepage.quickFeatures.wellnessHub.description'),
                    iconBg: 'bg-green-100 dark:bg-green-900/40',
                    iconColor: 'text-green-600 dark:text-green-400',
                    hoverBorder: 'hover:border-green-300 dark:hover:border-green-600',
                  },
                  {
                    icon: <Users className="h-7 w-7" />,
                    title: t('homepage.quickFeatures.community.title'),
                    description: t('homepage.quickFeatures.community.description'),
                    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
                    iconColor: 'text-amber-600 dark:text-amber-400',
                    hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-600',
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className={`group relative ${isDarkMode ? 'bg-gray-800/60' : 'bg-white'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200'} ${feature.hoverBorder} p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
                  >
                    <div
                      className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${feature.iconBg} mb-5 transition-transform duration-300 group-hover:scale-110`}
                    >
                      <div className={feature.iconColor}>{feature.icon}</div>
                    </div>
                    <h3
                      className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}
                    >
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-20" aria-label="Platform statistics and achievements">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div
                className={`${isDarkMode ? 'bg-gray-800/60' : 'bg-white'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200'} rounded-2xl p-8 sm:p-10 shadow-lg`}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
                  {[
                    {
                      icon: <Star className="h-6 w-6" />,
                      number: '99%',
                      label: t('homepage.stats.studentSatisfaction'),
                      iconBg: 'bg-amber-100 dark:bg-amber-900/40',
                      iconColor: 'text-amber-600 dark:text-amber-400',
                      numberColor: 'text-amber-600 dark:text-amber-400',
                    },
                    {
                      icon: <Shield className="h-6 w-6" />,
                      number: '24/7',
                      label: t('homepage.stats.aiAssistance'),
                      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
                      iconColor: 'text-purple-600 dark:text-purple-400',
                      numberColor: 'text-purple-600 dark:text-purple-400',
                    },
                    {
                      icon: <Zap className="h-6 w-6" />,
                      number: '<1s',
                      label: t('homepage.stats.responseTime'),
                      iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
                      iconColor: 'text-emerald-600 dark:text-emerald-400',
                      numberColor: 'text-emerald-600 dark:text-emerald-400',
                    },
                  ].map((stat, index) => (
                    <div key={index} className="flex flex-col items-center text-center space-y-3">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.iconBg}`}
                      >
                        <div className={stat.iconColor}>{stat.icon}</div>
                      </div>
                      <div className={`text-3xl sm:text-4xl font-bold ${stat.numberColor}`}>
                        {stat.number}
                      </div>
                      <div
                        className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Footer CTA */}
          <section className="py-20" aria-label="Final call-to-action to join the platform">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div
                className={`${isDarkMode ? 'bg-gray-800/60' : 'bg-white'} backdrop-blur-sm border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200'} rounded-2xl p-10 sm:p-12 shadow-lg`}
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-xl ${isDarkMode ? 'bg-purple-900/40' : 'bg-purple-100'} mb-6`}
                >
                  <Sparkles
                    className={`h-8 w-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}
                  />
                </div>
                <h2
                  className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}
                >
                  {t('homepage.cta.title')}
                </h2>
                <p
                  className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-8 max-w-xl mx-auto leading-relaxed`}
                >
                  {t('homepage.cta.description')}
                </p>
                {!isAuthenticated && (
                  <Link
                    href="/signup"
                    className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {t('homepage.cta.startJourney')}
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </>
  );
}
