'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
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
  Zap
} from 'lucide-react';

export default function Home() {
  const { isDarkMode } = useDarkMode();
  const { user, isAuthenticated } = useAuth();
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: <Bot className="h-8 w-8" />,
      title: "AI Assistant",
      description: "Meet Athena, your intelligent university companion",
      color: "from-purple-500 to-blue-500"
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Smart Navigation",
      description: "Never get lost on university again",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Study Spaces",
      description: "Find the perfect place to learn",
      color: "from-cyan-500 to-teal-500"
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: "Lost & Found",
      description: "Reunite with your belongings",
      color: "from-teal-500 to-emerald-500"
    }
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
      {/* Skip to main content link for accessibility - only visible when focused via keyboard */}
      <a 
        href="#main-content" 
        className="absolute -top-full left-4 bg-purple-600 text-white px-4 py-2 rounded-md z-[100] transition-all duration-200 focus:top-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        Skip to main content
      </a>
      
      <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
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
                <div className={`p-6 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-lg border ${isDarkMode ? 'border-purple-400/30' : 'border-purple-400/40'} shadow-2xl`}>
                  <Brain className={`h-16 w-16 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
              </div>

              {/* Main Title */}
              <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Athena
                </span>
              </h1>
              
              <h2 className={`text-xl sm:text-2xl lg:text-3xl font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-8`}>
                Your Intelligent University Companion
              </h2>

              <p className={`text-lg sm:text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-12 max-w-3xl mx-auto leading-relaxed`}>
                Experience the future of university life with AI-powered assistance, 
                smart navigation, and seamless university integration designed to enhance your academic journey.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                {!isAuthenticated ? (
                  <>
                    <Link 
                      href="/login" 
                      className="group flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:from-purple-700 focus:to-blue-700 text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-xl transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-focus:translate-x-1 transition-transform" />
                    </Link>
                    <Link 
                      href="/signup" 
                      className={`px-8 py-4 ${isDarkMode ? 'bg-gray-800/50 hover:bg-gray-700/50 focus:bg-gray-700/50 text-gray-200 border-gray-600' : 'bg-white/50 hover:bg-white/70 focus:bg-white/70 text-gray-700 border-gray-300'} border backdrop-blur-lg rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl focus:shadow-xl transform hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50`}
                    >
                      Create Account
                    </Link>
                  </>
                ) : (
                  <Link 
                    href="/dashboard" 
                    className="group flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Welcome back, {user?.firstName}!
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>

              {/* Rotating Feature Showcase */}
              <div className="max-w-2xl mx-auto">
                <div className={`glass-card backdrop-blur-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-3xl p-8 shadow-2xl`}>
                  <div className="flex items-center justify-center mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${features[currentFeature].color} text-white shadow-lg transform transition-all duration-500`}>
                      {features[currentFeature].icon}
                    </div>
                  </div>
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 transition-all duration-500`}>
                    {features[currentFeature].title}
                  </h3>
                  <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-all duration-500`}>
                    {features[currentFeature].description}
                  </p>
                  
                  {/* Feature Dots */}
                  <div className="flex justify-center mt-6 space-x-2">
                    {features.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentFeature(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentFeature 
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 scale-125' 
                            : isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400'
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
            <div className="text-center mb-16">
              <h2 className={`text-3xl sm:text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                Everything You Need
              </h2>
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
                Athena brings together all essential university services in one intelligent platform
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Bot className="h-8 w-8" />,
                  title: "AI Chat Assistant",
                  description: "Get instant answers to any university question",
                  color: "from-purple-500/20 to-blue-500/20",
                  borderColor: "border-purple-400/30"
                },
                {
                  icon: <MapPin className="h-8 w-8" />,
                  title: "Interactive Maps",
                  description: "Navigate university with real-time directions",
                  color: "from-blue-500/20 to-cyan-500/20",
                  borderColor: "border-blue-400/30"
                },
                {
                  icon: <BookOpen className="h-8 w-8" />,
                  title: "Study Resources",
                  description: "Find spaces, books, and study materials",
                  color: "from-cyan-500/20 to-teal-500/20",
                  borderColor: "border-cyan-400/30"
                },
                {
                  icon: <Search className="h-8 w-8" />,
                  title: "Lost & Found",
                  description: "Report and recover lost belongings",
                  color: "from-teal-500/20 to-emerald-500/20",
                  borderColor: "border-teal-400/30"
                },
                {
                  icon: <Heart className="h-8 w-8" />,
                  title: "Wellness Hub",
                  description: "Access mental health and wellness resources",
                  color: "from-emerald-500/20 to-green-500/20",
                  borderColor: "border-emerald-400/30"
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  title: "Community",
                  description: "Connect with students and faculty",
                  color: "from-green-500/20 to-yellow-500/20",
                  borderColor: "border-green-400/30"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`glass-card bg-gradient-to-br ${feature.color} backdrop-blur-lg border ${feature.borderColor} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1`}
                >
                  <div className={`flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} border ${feature.borderColor} mb-4`}>
                    <div className={`${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-3`}>
                    {feature.title}
                  </h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20" aria-label="Platform statistics and achievements">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`glass-card backdrop-blur-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-3xl p-12 shadow-2xl`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                {[
                  { icon: <Star className="h-8 w-8" />, number: "99%", label: "Student Satisfaction" },
                  { icon: <Shield className="h-8 w-8" />, number: "24/7", label: "AI Assistance" },
                  { icon: <Zap className="h-8 w-8" />, number: "<1s", label: "Response Time" }
                ].map((stat, index) => (
                  <div key={index} className="space-y-4">
                    <div className={`flex justify-center ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {stat.icon}
                    </div>
                    <div className={`text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`}>
                      {stat.number}
                    </div>
                    <div className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className={`glass-card bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-lg border ${isDarkMode ? 'border-purple-400/30' : 'border-purple-400/40'} rounded-3xl p-12 shadow-2xl`}>
              <Sparkles className={`h-16 w-16 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} mx-auto mb-6`} />
              <h2 className={`text-3xl sm:text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                Ready to Transform Your University Experience?
              </h2>
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-8 max-w-2xl mx-auto`}>
                Join thousands of students who are already experiencing the future of university life with Athena.
              </p>
              {!isAuthenticated && (
                <Link 
                  href="/signup" 
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Start Your Journey
                  <Sparkles className="ml-2 h-5 w-5" />
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