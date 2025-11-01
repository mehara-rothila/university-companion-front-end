'use client';

import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import AthenaChatbot from '@/components/AthenaChatbot';
import { FileText, Image, MessageCircle, Zap } from 'lucide-react';

export default function ChatbotPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <AnimatedBackground />
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'} backdrop-blur-sm shadow-lg text-center`}>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
              Athena AI Assistant
            </h1>
            <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Your intelligent university companion powered by Gemini 2.5 Pro
            </p>
            {user && (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Welcome back, {user.firstName}! 👋
              </p>
            )}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className={`p-4 rounded-xl ${
            isDarkMode
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-white/50 border border-gray-200'
          } backdrop-blur-sm`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Smart Chat
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Natural conversations
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${
            isDarkMode
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-white/50 border border-gray-200'
          } backdrop-blur-sm`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Image className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Image Analysis
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Upload & analyze
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${
            isDarkMode
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-white/50 border border-gray-200'
          } backdrop-blur-sm`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  PDF Reader
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Extract & summarize
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl ${
            isDarkMode
              ? 'bg-gray-800/50 border border-gray-700'
              : 'bg-white/50 border border-gray-200'
          } backdrop-blur-sm`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  Fast Response
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Instant answers
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Tips */}
        <div className={`mb-8 p-6 rounded-xl ${
          isDarkMode
            ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50'
            : 'bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200'
        }`}>
          <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
            💡 Quick Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <strong>📸 Image Upload:</strong> Upload screenshots, notes, diagrams, or photos for analysis
            </div>
            <div>
              <strong>📄 PDF Upload:</strong> Upload assignments, forms, or documents for summarization
            </div>
            <div>
              <strong>🔍 Ask Questions:</strong> "What's in this image?", "Summarize this PDF"
            </div>
            <div>
              <strong>🎯 Get Help:</strong> Academic planning, campus navigation, wellness support
            </div>
          </div>
        </div>

        {/* Main Chatbot */}
        <div className="mb-8">
          <AthenaChatbot isDarkMode={isDarkMode} />
        </div>

        {/* Example Queries */}
        <div className={`p-6 rounded-xl ${
          isDarkMode
            ? 'bg-gray-800/50 border border-gray-700'
            : 'bg-white/50 border border-gray-200'
        } backdrop-blur-sm`}>
          <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
            📝 Example Queries
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              'Help me understand this assignment',
              'What building is the library in?',
              'Summarize this document for me',
              'How do I apply for financial aid?',
              'What are my study space options?',
              'Translate this image to English',
            ].map((query, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-105 ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  "{query}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Athena uses Gemini 2.5 Pro for intelligent, context-aware responses
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            All uploaded files are securely stored and processed
          </p>
        </div>
      </div>
    </div>
  );
}
