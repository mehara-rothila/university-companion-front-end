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
  Facebook,
  ArrowUp
} from 'lucide-react';

export default function Footer() {
  const { isDarkMode } = useDarkMode();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className={`relative ${isDarkMode ? 'bg-gray-900/95' : 'bg-gray-50/95'} backdrop-blur-lg border-t ${isDarkMode ? 'border-gray-700/30' : 'border-gray-200/30'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-lg border ${isDarkMode ? 'border-purple-400/30' : 'border-purple-400/40'}`}>
                <Brain className={`h-8 w-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div>
                <h3 className={`text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`}>
                  Athena
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Smart University
                </p>
              </div>
            </div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
              Your intelligent university companion, designed to enhance university life through AI-powered assistance and seamless integration.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {[
                { icon: <Github className="h-5 w-5" />, href: "#" },
                { icon: <Twitter className="h-5 w-5" />, href: "#" },
                { icon: <Linkedin className="h-5 w-5" />, href: "#" },
                { icon: <Facebook className="h-5 w-5" />, href: "#" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-purple-400' : 'hover:bg-gray-200 text-gray-600 hover:text-purple-600'} transition-all duration-200`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              Features
            </h4>
            <ul className="space-y-3">
              {[
                { icon: <Bot className="h-4 w-4" />, name: "AI Assistant", href: "/chatbot" },
                { icon: <MapPin className="h-4 w-4" />, name: "Navigation", href: "/navigation" },
                { icon: <BookOpen className="h-4 w-4" />, name: "Study Spaces", href: "/study-spaces" },
                { icon: <Search className="h-4 w-4" />, name: "Lost & Found", href: "/lost-found" },
                { icon: <Heart className="h-4 w-4" />, name: "Wellness", href: "/wellness" },
                { icon: <Users className="h-4 w-4" />, name: "Community", href: "/community" }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-400 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'} transition-colors duration-200`}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              Support
            </h4>
            <ul className="space-y-3">
              {[
                { name: "Help Center", href: "/help" },
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
                { name: "Academic Guidelines", href: "/academic-guidelines" },
                { name: "Accessibility", href: "/accessibility" },
                { name: "Contact Support", href: "/support" }
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className={`${isDarkMode ? 'text-gray-400 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'} transition-colors duration-200`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              Contact
            </h4>
            <div className="space-y-3">
              <div className={`flex items-center space-x-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Mail className="h-5 w-5" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:support@athena.edu" className={`text-sm ${isDarkMode ? 'hover:text-purple-400' : 'hover:text-purple-600'} transition-colors`}>
                    support@athena.edu
                  </a>
                </div>
              </div>
              
              <div className={`flex items-center space-x-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Phone className="h-5 w-5" />
                <div>
                  <p className="font-medium">Support</p>
                  <a href="tel:+1234567890" className={`text-sm ${isDarkMode ? 'hover:text-purple-400' : 'hover:text-purple-600'} transition-colors`}>
                    +1 (234) 567-890
                  </a>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-purple-50'} border ${isDarkMode ? 'border-gray-700' : 'border-purple-200'}`}>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'} mb-2`}>
                  24/7 AI Support
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Get instant help with Athena's AI assistant anytime, anywhere.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={`mt-12 pt-8 border-t ${isDarkMode ? 'border-gray-700/30' : 'border-gray-200/30'} flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0`}>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center md:text-left`}>
            <p>
              © {currentYear} Athena Smart University Companion. All rights reserved.
            </p>
            <p className="mt-1">
              Developed as part of L3 Individual Project at University of Moratuwa.
            </p>
          </div>

          {/* Back to Top Button */}
          <button
            onClick={scrollToTop}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-200' : 'bg-white hover:bg-gray-50 text-gray-700'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} transition-all duration-200 shadow-sm hover:shadow-md`}
          >
            <ArrowUp className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
}