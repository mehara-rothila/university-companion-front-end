// src/app/chatbot/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

// --- Interfaces ---
interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: QuickAction[];
  attachments?: ChatAttachment[];
}

interface QuickAction {
  id: string;
  text: string;
  action: string;
  icon?: React.ReactNode;
  route?: string;
}

interface ChatAttachment {
  type: 'image' | 'file' | 'location' | 'link';
  content: string;
  metadata?: any;
}

interface TypingIndicator {
  isTyping: boolean;
  duration: number;
}

export default function ChatbotPage() {
  const { isDarkMode } = useDarkMode();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState<TypingIndicator>({ isTyping: false, duration: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick action suggestions
  const quickActions: QuickAction[] = [
    {
      id: '1',
      text: 'Find study spaces',
      action: 'find_study_spaces',
      route: '/study-spaces',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: '2',
      text: 'Campus navigation',
      action: 'campus_navigation',
      route: '/navigation',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: '3',
      text: 'Academic schedule',
      action: 'academic_schedule',
      route: '/academic',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l6 6m0-6l-6 6m6-6H4" />
        </svg>
      )
    },
    {
      id: '4',
      text: 'Wellness check-in',
      action: 'wellness_checkin',
      route: '/wellness',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    }
  ];

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your Smart Campus AI assistant. I can help you with study spaces, navigation, academic planning, wellness support, and much more. How can I assist you today?",
      timestamp: new Date(),
      suggestions: quickActions.slice(0, 3)
    };
    setMessages([welcomeMessage]);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingIndicator.isTyping]);

  // Handle sending message
  const handleSendMessage = async (content: string = inputValue) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI typing
    setTypingIndicator({ isTyping: true, duration: 2000 });

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(content);
      setMessages(prev => [...prev, aiResponse]);
      setTypingIndicator({ isTyping: false, duration: 0 });
      setIsLoading(false);
    }, 2000);
  };

  // Generate AI response (mock implementation)
  const generateAIResponse = (userInput: string): ChatMessage => {
    const input = userInput.toLowerCase();
    let response = '';
    let suggestions: QuickAction[] = [];

    if (input.includes('study') || input.includes('library')) {
      response = "I can help you find the perfect study space! Based on your preferences and current availability, I recommend checking out the quiet study zones in the Main Library Level 3. They're less crowded right now and have great natural lighting.";
      suggestions = [
        { id: 'study-1', text: 'Find available spaces', action: 'find_spaces', route: '/study-spaces' },
        { id: 'study-2', text: 'Book a study room', action: 'book_room', route: '/study-spaces' },
        { id: 'study-3', text: 'View library hours', action: 'library_hours', route: '/library' }
      ];
    } else if (input.includes('navigation') || input.includes('direction') || input.includes('where')) {
      response = "I'd be happy to help you navigate campus! I can provide optimal routes considering current foot traffic, accessibility needs, and construction updates. Where would you like to go?";
      suggestions = [
        { id: 'nav-1', text: 'Open campus map', action: 'open_map', route: '/navigation' },
        { id: 'nav-2', text: 'Find parking', action: 'find_parking', route: '/navigation' },
        { id: 'nav-3', text: 'Accessibility routes', action: 'accessibility', route: '/navigation' }
      ];
    } else if (input.includes('schedule') || input.includes('class') || input.includes('academic')) {
      response = "Let me help you with your academic schedule! I can optimize your calendar, suggest study times, and help manage deadlines. Your next class is Physics 201 in Engineering Building Room 105 at 2:00 PM.";
      suggestions = [
        { id: 'academic-1', text: 'View full schedule', action: 'view_schedule', route: '/academic' },
        { id: 'academic-2', text: 'Add study time', action: 'add_study', route: '/academic' },
        { id: 'academic-3', text: 'Check assignments', action: 'check_assignments', route: '/academic' }
      ];
    } else if (input.includes('wellness') || input.includes('stress') || input.includes('health')) {
      response = "I notice you're asking about wellness - that's great self-care! I can help you track your mood, find stress management resources, or connect you with campus wellness services. How are you feeling today?";
      suggestions = [
        { id: 'wellness-1', text: 'Daily check-in', action: 'daily_checkin', route: '/wellness' },
        { id: 'wellness-2', text: 'Stress resources', action: 'stress_help', route: '/wellness' },
        { id: 'wellness-3', text: 'Contact counseling', action: 'counseling', route: '/wellness' }
      ];
    } else if (input.includes('food') || input.includes('dining') || input.includes('meal')) {
      response = "Looking for food options? I can show you current dining hall menus, wait times, and even suggest meals based on your dietary preferences. The North Dining Hall has shorter lines right now!";
      suggestions = [
        { id: 'dining-1', text: 'View menus', action: 'view_menus', route: '/dining' },
        { id: 'dining-2', text: 'Check wait times', action: 'wait_times', route: '/dining' },
        { id: 'dining-3', text: 'Dietary options', action: 'dietary', route: '/dining' }
      ];
    } else {
      response = "I understand you're looking for help with campus life. I'm equipped to assist with study spaces, navigation, academic planning, wellness support, dining options, and much more. What specific area would you like help with?";
      suggestions = quickActions.slice(0, 4);
    }

    return {
      id: `ai-${Date.now()}`,
      type: 'ai',
      content: response,
      timestamp: new Date(),
      suggestions
    };
  };

  // Handle quick action click
  const handleQuickAction = (action: QuickAction) => {
    if (action.route) {
      // For demo, we'll send a message instead of navigating
      handleSendMessage(action.text);
    }
  };

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <Navigation />
      <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
        
        <AnimatedBackground variant="dashboard" />

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2 flex items-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  AI Campus Assistant
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your intelligent companion for campus life
                </p>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Online</span>
              </div>
            </div>
          </div>

          {/* Chat Container */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm flex flex-col animate-fade-in`} style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    
                    {/* Avatar */}
                    <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      }`}>
                        {message.type === 'user' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      
                      {/* Message Content */}
                      <div className={`flex-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block p-4 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-purple-600 text-white'
                            : isDarkMode 
                              ? 'bg-gray-700 text-gray-100 border border-gray-600'
                              : 'bg-gray-100 text-gray-900 border border-gray-200'
                        }`}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className={`text-xs mt-2 ${
                            message.type === 'user' 
                              ? 'text-purple-200' 
                              : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        {/* Suggestions */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.suggestions.map((suggestion) => (
                              <button
                                key={suggestion.id}
                                onClick={() => handleQuickAction(suggestion)}
                                className={`inline-flex items-center px-3 py-2 text-xs rounded-full transition-all duration-200 mr-2 mb-2 ${
                                  isDarkMode
                                    ? 'bg-gray-600 text-gray-200 hover:bg-gray-500 border border-gray-500'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300'
                                }`}
                              >
                                {suggestion.icon && <span className="mr-1.5">{suggestion.icon}</span>}
                                {suggestion.text}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {typingIndicator.isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-100 border border-gray-200'}`}>
                      <div className="flex space-x-1">
                        <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'}`} style={{ animationDelay: '0.1s' }}></div>
                        <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-400' : 'bg-gray-500'}`} style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4`}>
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about campus life..."
                    disabled={isLoading}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>
                
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center ${
                    !inputValue.trim() || isLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                      : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg'
                  }`}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Quick Actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className={`inline-flex items-center px-3 py-1.5 text-xs rounded-full transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {action.icon && <span className="mr-1.5">{action.icon}</span>}
                    {action.text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Ethics Notice */}
          <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'} animate-fade-in`}>
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} mb-1`}>AI Transparency Notice</h4>
                <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                  This AI assistant uses ethical algorithms designed to help students. All conversations are processed transparently and your privacy is protected. 
                  <Link href="/ai-ethics" className="underline hover:no-underline ml-1">Learn more about our AI ethics</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}