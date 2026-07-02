'use client';

import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import {
  Brain,
  MapPin,
  BookOpen,
  Users,
  Heart,
  Search,
  Bot,
  Mail,
  Phone,
  Github,
  Twitter,
  Linkedin,
  ArrowUp,
  ExternalLink,
} from 'lucide-react';

export default function Footer() {
  const { isDarkMode } = useDarkMode();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`relative ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1 space-y-5">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2.5 rounded-xl ${isDarkMode ? 'bg-purple-900/40' : 'bg-purple-100'}`}
              >
                <Brain
                  className={`h-7 w-7 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}
                />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Athena
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Smart University Companion
                </p>
              </div>
            </div>
            <p
              className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}
            >
              Your intelligent university companion, enhancing campus life through AI-powered
              assistance.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-2">
              {[
                { icon: <Github className="h-4 w-4" />, href: '#', label: 'GitHub' },
                { icon: <Twitter className="h-4 w-4" />, href: '#', label: 'Twitter' },
                { icon: <Linkedin className="h-4 w-4" />, href: '#', label: 'LinkedIn' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className={`p-2.5 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900'} transition-all duration-200`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Features Links */}
          <div className="space-y-4">
            <h4
              className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
            >
              Features
            </h4>
            <ul className="space-y-3">
              {[
                {
                  icon: <Bot className="h-4 w-4" />,
                  name: 'AI Assistant',
                  href: '/chatbot',
                  color: 'text-purple-500',
                },
                {
                  icon: <MapPin className="h-4 w-4" />,
                  name: 'Navigation',
                  href: '/navigation',
                  color: 'text-emerald-500',
                },
                {
                  icon: <BookOpen className="h-4 w-4" />,
                  name: 'Study Spaces',
                  href: '/study-spaces',
                  color: 'text-cyan-500',
                },
                {
                  icon: <Search className="h-4 w-4" />,
                  name: 'Lost & Found',
                  href: '/lost-found',
                  color: 'text-slate-500',
                },
                {
                  icon: <Heart className="h-4 w-4" />,
                  name: 'Wellness Hub',
                  href: '/wellness',
                  color: 'text-green-500',
                },
                {
                  icon: <Users className="h-4 w-4" />,
                  name: 'Community',
                  href: '/social',
                  color: 'text-amber-500',
                },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`group flex items-center space-x-2.5 text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200`}
                  >
                    <span className={link.color}>{link.icon}</span>
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h4
              className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
            >
              Support
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Help Center', href: '/help' },
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms of Service', href: '/terms' },
                { name: 'Accessibility', href: '/accessibility' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4
              className={`text-sm font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}
            >
              Contact
            </h4>
            <div className="space-y-4">
              <a
                href="mailto:support@athena.edu"
                className={`flex items-center space-x-3 text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200`}
              >
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <Mail className="h-4 w-4" />
                </div>
                <span>support@athena.edu</span>
              </a>

              <a
                href="tel:+94112650301"
                className={`flex items-center space-x-3 text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200`}
              >
                <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <Phone className="h-4 w-4" />
                </div>
                <span>+94 11 265 0301</span>
              </a>

              {/* AI Support Card */}
              <div
                className={`p-4 rounded-xl ${isDarkMode ? 'bg-purple-900/20 border-purple-800/30' : 'bg-purple-50 border-purple-100'} border`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Bot
                    className={`h-4 w-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}
                  />
                  <p
                    className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}
                  >
                    24/7 AI Support
                  </p>
                </div>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Get instant help anytime with our AI assistant.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          className={`mt-12 pt-8 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div
              className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} text-center md:text-left`}
            >
              <p>© {currentYear} Athena. All rights reserved.</p>
              <p className="mt-1 flex items-center justify-center md:justify-start space-x-1">
                <span>L3 Project</span>
                <span>·</span>
                <a
                  href="https://uom.lk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center ${isDarkMode ? 'hover:text-white' : 'hover:text-gray-900'} transition-colors`}
                >
                  University of Moratuwa
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </p>
            </div>

            {/* Back to Top Button */}
            <button
              type="button"
              onClick={scrollToTop}
              className={`group flex items-center space-x-2 px-4 py-2.5 rounded-xl ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white' : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transition-all duration-200 shadow-sm hover:shadow-md`}
            >
              <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
              <span className="text-sm font-medium">Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
