// src/app/chatbot/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import { athenaService } from '@/services/athenaService';
import { 
  generateId, 
  formatTimestamp, 
  generateWelcomeMessage, 
  classifyIntent, 
  calculateTypingDuration,
  formatFileSize 
} from '@/utils/athenaUtils';

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
  type: 'image' | 'file' | 'video' | 'pdf' | 'location' | 'link';
  name: string;
  size: number;
  content: string;
  transcription?: string;
  extractedText?: string;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'error';
  metadata?: Record<string, unknown>;
}

interface TypingIndicator {
  isTyping: boolean;
  duration: number;
}

interface TokenUsage {
  used: number;
  limit: number;
  resetTime: Date;
}

// --- Constants ---
const QUICK_ACTIONS: QuickAction[] = [
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
      text: 'University navigation',
      action: 'university_navigation',
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

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_FILE_TYPES = {
  pdf: ['application/pdf'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

export default function ChatbotPage() {
  const { isDarkMode } = useDarkMode();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState<TypingIndicator>({ isTyping: false, duration: 0 });
  const [tokenUsage, setTokenUsage] = useState<TokenUsage>({ 
    used: 247823, 
    limit: 1000000, 
    resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000) 
  });
  const [dragActive, setDragActive] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with Athena welcome message and token usage
  useEffect(() => {
    const welcomeMessage = generateWelcomeMessage();
    // Convert to local ChatMessage format
    const localWelcomeMessage: ChatMessage = {
      id: welcomeMessage.id,
      type: 'ai',
      content: welcomeMessage.content,
      timestamp: welcomeMessage.timestamp,
      suggestions: welcomeMessage.suggestions
    };
    setMessages([localWelcomeMessage]);
    
    // Initialize with real token usage
    const currentUsage = athenaService.getTokenUsage();
    setTokenUsage({
      used: currentUsage.used,
      limit: currentUsage.limit,
      resetTime: currentUsage.resetTime
    });
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingIndicator.isTyping]);

  // Real token usage update
  const updateTokenUsage = useCallback((tokens: number) => {
    // Token counting is now handled by athenaService/tokenCountingService
    // Update UI state to reflect current usage
    const currentUsage = athenaService.getTokenUsage();
    setTokenUsage({
      used: currentUsage.used,
      limit: currentUsage.limit,
      resetTime: currentUsage.resetTime
    });
  }, []);

  // Mock file processing functions
  const extractPDFText = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Extracted text from ${file.name}:\n\nThis is simulated PDF content. In a real implementation, this would contain the actual text extracted from the PDF document using libraries like PDF.js or similar tools. The content would include all readable text from the document pages.`);
      }, 2000 + Math.random() * 3000);
    });
  };

  const transcribeVideo = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
  resolve(`Video transcription for ${file.name}:\n\n[00:00] Hello and welcome to this video\n[00:15] Today we&apos;ll be discussing university resources\n[00:30] First, let&apos;s talk about the library services\n[01:00] The study spaces are available 24/7\n[01:30] Don&apos;t forget to check out the wellness center\n\nNote: This is a simulated transcription. In production, this would use services like OpenAI Whisper, Google Speech-to-Text, or Azure Speech Services.`);
      }, 5000 + Math.random() * 5000);
    });
  };

  // File handling functions
  const processFile = useCallback(async (file: File, attachment: ChatAttachment, messageId: string) => {
    updateTokenUsage(500); // Base token cost for file processing
    
    try {
      // Update attachment status
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? {
          ...msg,
          attachments: msg.attachments?.map(att => 
            att.name === attachment.name ? { ...att, processingStatus: 'processing' } : att
          )
        } : msg
      ));

      let processedContent = '';
      let additionalTokens = 0;

      if (attachment.type === 'pdf') {
        processedContent = await extractPDFText(file);
        additionalTokens = Math.floor(processedContent.length / 4); // Rough token estimate
        attachment.extractedText = processedContent;
      } else if (attachment.type === 'video') {
        processedContent = await transcribeVideo(file);
        additionalTokens = Math.floor(processedContent.length / 4);
        attachment.transcription = processedContent;
      }

      updateTokenUsage(additionalTokens);

      // Update attachment status to completed
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? {
          ...msg,
          attachments: msg.attachments?.map(att => 
            att.name === attachment.name ? { 
              ...att, 
              processingStatus: 'completed',
              extractedText: attachment.extractedText,
              transcription: attachment.transcription
            } : att
          )
        } : msg
      ));

      // Add AI response about the processed file
      setTimeout(() => {
        const aiResponse: ChatMessage = {
          id: `ai-${Date.now()}-processed`,
          type: 'ai',
          content: `I&apos;ve successfully processed your ${attachment.type}! ${
            attachment.type === 'pdf' 
              ? 'I can now help you analyze the document content, answer questions about it, or summarize key points.' 
              : 'I can now help you search through the transcription, summarize the content, or answer questions about what was discussed.'
          } What would you like to know?`,
          timestamp: new Date(),
          suggestions: [
            { id: 'summarize', text: 'Summarize content', action: 'summarize' },
            { id: 'key-points', text: 'Extract key points', action: 'key_points' },
            { id: 'ask-questions', text: 'Ask questions', action: 'ask_questions' }
          ]
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);

    } catch {
      // Update attachment status to error
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? {
          ...msg,
          attachments: msg.attachments?.map(att => 
            att.name === attachment.name ? { ...att, processingStatus: 'error' } : att
          )
        } : msg
      ));
    }
  }, [updateTokenUsage]);

  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} is too large. Maximum size is 100MB.`);
        continue;
      }

      try {
        // Upload file using Athena service
        const { attachment } = await athenaService.uploadFile(file);
        
        const userMessage: ChatMessage = {
          id: generateId(),
          type: 'user',
          content: `Uploaded ${attachment.type}: ${attachment.name}`,
          timestamp: new Date(),
          attachments: [attachment]
        };

        setMessages(prev => [...prev, userMessage]);

        // Process the attachment with AI
        try {
          const processedAttachment = await athenaService.processAttachment(attachment);
          
          // Update the message with processed attachment
          setMessages(prev => prev.map(msg => 
            msg.id === userMessage.id ? {
              ...msg,
              attachments: [processedAttachment]
            } : msg
          ));

          // Update token usage
          updateTokenUsage(0);

          // Send AI response about the processed file
          setTimeout(async () => {
            const response = await athenaService.processMessage(
              `I've uploaded a ${attachment.type} file: ${attachment.name}. Can you analyze it for me?`,
              messages,
              [processedAttachment]
            );
            
            const aiMessage: ChatMessage = {
              id: generateId(),
              type: 'ai',
              content: response.content,
              timestamp: new Date(),
              suggestions: response.suggestions
            };
            
            setMessages(prev => [...prev, aiMessage]);
            updateTokenUsage(0);
          }, 1000);

        } catch (processingError) {
          console.error('File processing error:', processingError);
          // Update attachment status to error
          setMessages(prev => prev.map(msg => 
            msg.id === userMessage.id ? {
              ...msg,
              attachments: msg.attachments?.map(att => ({
                ...att,
                processingStatus: 'error'
              }))
            } : msg
          ));
        }

      } catch (uploadError) {
        alert(`Upload failed for ${file.name}: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
      }
    }
  }, [messages, updateTokenUsage]);

  const getFileType = (file: File): string | null => {
    if (ACCEPTED_FILE_TYPES.pdf.includes(file.type)) return 'pdf';
    if (ACCEPTED_FILE_TYPES.video.includes(file.type)) return 'video';
    if (ACCEPTED_FILE_TYPES.image.includes(file.type)) return 'image';
    return null;
  };

  // Generate AI response using Athena service
  const generateAIResponse = useCallback(async (userInput: string, hasAttachments = false): Promise<ChatMessage> => {
    const input = userInput.toLowerCase();
    let tokenCost = Math.floor(Math.random() * 200) + 50;

    if (hasAttachments) {
      updateTokenUsage(tokenCost + 100);
      return {
        id: generateId(),
        type: 'ai',
        content: "I can see you've uploaded a file! I'm processing it now and will be able to help you analyze the content once it's ready. In the meantime, feel free to ask me anything else!",
        timestamp: new Date(),
        suggestions: [
          { text: 'How can I help?', action: 'help' },
          { text: 'University services', action: 'services' }
        ]
      };
    }

    try {
      // Use Athena service for real AI responses
      const response = await athenaService.processMessage(userInput, messages);
      
      updateTokenUsage(tokenCost);

      return {
        id: generateId(),
        type: 'ai',
        content: response.content,
        timestamp: new Date(),
        suggestions: response.suggestions || []
      };
    } catch (error) {
      console.error('Athena service error:', error);
      updateTokenUsage(tokenCost);
      
      return {
        id: generateId(),
        type: 'ai',
        content: "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment.",
        timestamp: new Date(),
        suggestions: [
          { text: 'Try again', action: 'retry' },
          { text: 'Contact support', action: 'contact_support' }
        ]
      };
    }
  }, [updateTokenUsage, messages]);

  // Handle sending message
  const handleSendMessage = useCallback(async (content: string = inputValue) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Calculate dynamic typing duration based on expected response length
    const typingDuration = calculateTypingDuration(content.length);
    setTypingIndicator({ isTyping: true, duration: typingDuration });

    try {
      // Get AI response from Athena service
      const aiResponse = await generateAIResponse(content);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: ChatMessage = {
        id: generateId(),
        type: 'ai',
        content: "I apologize for the inconvenience. I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date(),
        suggestions: [
          { text: 'Try again', action: 'retry' },
          { text: 'Contact support', action: 'contact_support' }
        ]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setTypingIndicator({ isTyping: false, duration: 0 });
      setIsLoading(false);
    }
  }, [inputValue, generateAIResponse]);

  // Handle quick action click
  const handleQuickAction = useCallback((action: QuickAction) => {
    if (action.route) {
      handleSendMessage(action.text);
    }
  }, [handleSendMessage]);

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get time until reset
  const getTimeUntilReset = (): string => {
    const now = new Date();
    const diff = tokenUsage.resetTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <>
      <Navigation />
      <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
        
        <AnimatedBackground variant="dashboard" />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24 flex gap-6">
          
          {/* Sidebar - Token Usage */}
          <div className="w-80 flex-shrink-0">
            <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm p-6 animate-fade-in`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Token Usage
              </h3>

              {/* Usage Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {tokenUsage.used.toLocaleString()} / {tokenUsage.limit.toLocaleString()}
                  </span>
                  <span className={`text-sm font-medium ${
                    tokenUsage.used / tokenUsage.limit > 0.8 
                      ? 'text-red-500' 
                      : tokenUsage.used / tokenUsage.limit > 0.6 
                        ? 'text-yellow-500' 
                        : 'text-green-500'
                  }`}>
                    {Math.round((tokenUsage.used / tokenUsage.limit) * 100)}%
                  </span>
                </div>
                <div className={`w-full bg-gray-200 rounded-full h-3 ${isDarkMode ? 'bg-gray-700' : ''}`}>
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      tokenUsage.used / tokenUsage.limit > 0.8 
                        ? 'bg-gradient-to-r from-red-500 to-red-600' 
                        : tokenUsage.used / tokenUsage.limit > 0.6 
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
                          : 'bg-gradient-to-r from-green-500 to-green-600'
                    }`}
                    style={{ width: `${(tokenUsage.used / tokenUsage.limit) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Reset Timer */}
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'} mb-4`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Resets in:
                  </span>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {getTimeUntilReset()}
                  </span>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Messages</span>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {Math.floor(tokenUsage.used / 150)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Files Processed</span>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {messages.filter(m => m.attachments?.length).length}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Remaining</span>
                  <span className={`text-sm font-medium text-green-500`}>
                    {(tokenUsage.limit - tokenUsage.used).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Upgrade Notice */}
              {tokenUsage.used / tokenUsage.limit > 0.8 && (
                <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>
                        You&apos;re approaching your daily limit. Consider upgrading for unlimited access.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1">
            {/* Header */}
            <div className="mb-8 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2 flex items-center`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Athena AI Assistant
                  </h1>
                  <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your intelligent companion for university life
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
            <div 
              className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm flex flex-col animate-fade-in relative ${dragActive ? 'ring-4 ring-purple-500 ring-opacity-50' : ''}`} 
              style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              
              {/* Drag Overlay */}
              {dragActive && (
                <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center z-50 rounded-2xl border-2 border-dashed border-purple-500">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-purple-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Drop your files here
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      PDFs, Videos, and Images supported
                    </p>
                  </div>
                </div>
              )}

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
                              {formatTimestamp(message.timestamp)}
                            </p>
                          </div>

                          {/* File Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.attachments.map((attachment, index) => (
                                <div key={index} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/50">
                                        {attachment.type === 'pdf' && (
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707L16.414 6.5A1 1 0 0016 6H7a2 2 0 00-2 2v11a2 2 0 002 2z" />
                                          </svg>
                                        )}
                                        {attachment.type === 'video' && (
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                          </svg>
                                        )}
                                      </div>
                                      <div>
                                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                          {attachment.name}
                                        </p>
                                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                          {formatFileSize(attachment.size)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {attachment.processingStatus === 'processing' && (
                                        <div className="flex items-center space-x-2">
                                          <svg className="animate-spin h-4 w-4 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Processing...</span>
                                        </div>
                                      )}
                                      {attachment.processingStatus === 'completed' && (
                                        <div className="flex items-center space-x-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                          <span className={`text-xs text-green-500`}>Ready</span>
                                        </div>
                                      )}
                                      {attachment.processingStatus === 'error' && (
                                        <div className="flex items-center space-x-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                          <span className={`text-xs text-red-500`}>Error</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Show extracted content if available */}
                                  {attachment.processingStatus === 'completed' && (attachment.extractedText || attachment.transcription) && (
                                    <div className={`mt-3 p-3 rounded border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-100'}`}>
                                      <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                        {attachment.type === 'pdf' ? 'Extracted Text Preview:' : 'Transcription Preview:'}
                                      </p>
                                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-3`}>
                                        {(attachment.extractedText || attachment.transcription)?.substring(0, 200)}...
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

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
                      placeholder="Ask me anything about university life..."
                      disabled={isLoading}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  
                  {/* File Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-3 rounded-xl border transition-all duration-200 ${
                      isDarkMode
                        ? 'border-gray-600 text-gray-400 hover:bg-gray-700 hover:border-gray-500'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                    title="Upload files"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  
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
                  {QUICK_ACTIONS.map((action) => (
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

                {/* File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.mp4,.webm,.ogg,.avi,.mov,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                  className="hidden"
                />
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
                    This AI assistant uses ethical algorithms designed to help students. All conversations and uploaded files are processed transparently and your privacy is protected. 
                    <Link href="/ai-ethics" className="underline hover:no-underline ml-1">Learn more about our AI ethics</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}