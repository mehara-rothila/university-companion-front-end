'use client';

import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import AthenaChatbot from '@/components/AthenaChatbot';
import { FileText, Image, MessageCircle, Zap } from 'lucide-react';

export default function ChatbotPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className={`relative min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="fixed inset-0 z-0">
        <AnimatedBackground />
      </div>
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
        {/* Header */}
        <div className="mb-8 animate-appear">
          <div className={`relative p-4 sm:p-6 md:p-8 rounded-2xl overflow-hidden ${
            isDarkMode
              ? 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-purple-500/20'
              : 'bg-gradient-to-br from-white/95 to-purple-50/80 border border-purple-200/50'
          } backdrop-blur-xl shadow-2xl text-center group hover:shadow-purple-500/20 transition-all duration-500`}>
            {/* Animated gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 animate-gradient-shift ${
              isDarkMode ? 'opacity-50' : 'opacity-30'
            }`}></div>

            {/* Content */}
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-500 bg-clip-text text-transparent mb-4">
                {t('chatbot.title')}
              </h1>
              <p className={`text-base sm:text-xl md:text-2xl font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
                {t('chatbot.subtitle')}
              </p>
              {user && (
                <div className={`inline-block px-6 py-2 rounded-full ${
                  isDarkMode ? 'bg-purple-900/40 border border-purple-500/30' : 'bg-purple-100 border border-purple-300/50'
                } backdrop-blur-sm mt-2`}>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                    {t('chatbot.welcomeBack', { name: user.firstName })} 👋
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className={`group p-5 rounded-xl ${
            isDarkMode
              ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-purple-500/30'
              : 'bg-gradient-to-br from-white/80 to-purple-50/50 border border-purple-200/40'
          } backdrop-blur-md hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer`}>
            <div className="flex items-start gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                  {t('chatbot.features.smartChat.title')}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('chatbot.features.smartChat.description')}
                </p>
              </div>
            </div>
          </div>

          <div className={`group p-5 rounded-xl ${
            isDarkMode
              ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-blue-500/30'
              : 'bg-gradient-to-br from-white/80 to-blue-50/50 border border-blue-200/40'
          } backdrop-blur-md hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer`}>
            <div className="flex items-start gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Image className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                  {t('chatbot.features.imageAnalysis.title')}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('chatbot.features.imageAnalysis.description')}
                </p>
              </div>
            </div>
          </div>

          <div className={`group p-5 rounded-xl ${
            isDarkMode
              ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-red-500/30'
              : 'bg-gradient-to-br from-white/80 to-red-50/50 border border-red-200/40'
          } backdrop-blur-md hover:scale-105 hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300 cursor-pointer`}>
            <div className="flex items-start gap-3">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                  {t('chatbot.features.pdfReader.title')}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('chatbot.features.pdfReader.description')}
                </p>
              </div>
            </div>
          </div>

          <div className={`group p-5 rounded-xl ${
            isDarkMode
              ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-green-500/30'
              : 'bg-gradient-to-br from-white/80 to-green-50/50 border border-green-200/40'
          } backdrop-blur-md hover:scale-105 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 cursor-pointer`}>
            <div className="flex items-start gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                  {t('chatbot.features.fastResponse.title')}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('chatbot.features.fastResponse.description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Tips */}
        <div className={`hidden sm:block mb-8 p-4 sm:p-5 md:p-7 rounded-2xl relative overflow-hidden ${
          isDarkMode
            ? 'bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-purple-900/40 border border-purple-500/40'
            : 'bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 border border-purple-300/50'
        } backdrop-blur-sm shadow-lg`}>
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"></div>

          <h3 className="font-bold text-xl mb-5 text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">💡</span> {t('chatbot.tips.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300 relative z-10">
            <div className={`p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-white/60'
            } backdrop-blur-sm hover:scale-105 transition-transform duration-200`}>
              <strong className="text-lg">📸</strong> {t('chatbot.tips.imageUpload')}
            </div>
            <div className={`p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-white/60'
            } backdrop-blur-sm hover:scale-105 transition-transform duration-200`}>
              <strong className="text-lg">📄</strong> {t('chatbot.tips.pdfUpload')}
            </div>
            <div className={`p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-white/60'
            } backdrop-blur-sm hover:scale-105 transition-transform duration-200`}>
              <strong className="text-lg">🔍</strong> {t('chatbot.tips.askQuestions')}
            </div>
            <div className={`p-4 rounded-xl ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-white/60'
            } backdrop-blur-sm hover:scale-105 transition-transform duration-200`}>
              <strong className="text-lg">🎯</strong> {t('chatbot.tips.getHelp')}
            </div>
          </div>
        </div>

        {/* Main Chatbot */}
        <div className="mb-8">
          <AthenaChatbot isDarkMode={isDarkMode} />
        </div>

        {/* Footer Info */}
        <div className={`mt-8 text-center py-4 px-4 rounded-xl ${isDarkMode ? 'bg-gray-900/60' : 'bg-white/70'} backdrop-blur-sm`}>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {t('chatbot.footer.poweredBy')}
          </p>
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('chatbot.footer.security')}
          </p>
        </div>
      </div>
    </div>
  );
}
