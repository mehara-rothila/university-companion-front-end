// Athena AI Assistant Utility Functions

import { ChatMessage, QuickAction } from '@/types/athena';

// Generate unique ID for messages
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Format timestamp for display
export const formatTimestamp = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get greeting based on time of day
export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning! 🌅';
  if (hour < 17) return 'Good afternoon! ☀️';
  if (hour < 20) return 'Good evening! 🌆';
  return 'Good night! 🌙';
};

// Generate welcome message with personalized greeting
export const generateWelcomeMessage = (): ChatMessage => {
  const greeting = getTimeBasedGreeting();

  return {
    id: generateId(),
    type: 'athena',
    content: `${greeting} I'm Athena, your AI assistant for University of Moratuwa! 

I'm powered by Google Gemini and can help you with any questions about university life, services, academics, and more. 

How can I assist you today?`,
    timestamp: new Date(),
    suggestions: [
      { text: 'University services', action: 'services_overview' },
      { text: 'Ask me anything', action: 'general_help' },
      { text: 'Lost & Found', action: 'lost_found', route: '/lost-found' },
      { text: 'Financial Aid', action: 'financial_aid', route: '/financial-aid' },
    ],
  };
};

// Quick action suggestions based on user intent
export const getQuickActions = (intent: string): QuickAction[] => {
  const actionMap: Record<string, QuickAction[]> = {
    library: [
      { text: 'Search books', action: 'search_books', route: '/library' },
      { text: 'Book study room', action: 'book_room', route: '/library' },
      { text: 'Library hours', action: 'library_hours', route: '/library' },
    ],
    lost_found: [
      { text: 'Report lost item', action: 'report_lost', route: '/lost-found' },
      { text: 'Search found items', action: 'search_found', route: '/lost-found' },
      { text: 'View all items', action: 'view_all', route: '/lost-found' },
    ],
    financial_aid: [
      { text: 'Apply for aid', action: 'apply_aid', route: '/financial-aid' },
      { text: 'View applications', action: 'view_applications', route: '/financial-aid' },
      { text: 'Donation info', action: 'donate', route: '/financial-aid' },
    ],
    navigation: [
      { text: 'Open campus map', action: 'open_map', route: '/navigation' },
      { text: 'Find building', action: 'find_building', route: '/navigation' },
      { text: 'Parking info', action: 'find_parking', route: '/navigation' },
    ],
    wellness: [
      { text: 'Wellness check-in', action: 'wellness_checkin', route: '/wellness' },
      { text: 'Counseling services', action: 'counseling', route: '/wellness' },
      { text: 'Mental health resources', action: 'mental_health', route: '/wellness' },
    ],
    weather: [
      { text: "Today's weather", action: 'today_weather', route: '/weather' },
      { text: 'Weekly forecast', action: 'weekly_forecast', route: '/weather' },
      { text: 'Weather alerts', action: 'weather_alerts', route: '/weather' },
    ],
    notifications: [
      { text: 'View notifications', action: 'view_notifications', route: '/notifications' },
      { text: 'Mark all read', action: 'mark_all_read', route: '/notifications' },
      { text: 'Settings', action: 'notification_settings', route: '/notifications' },
    ],
    emergency: [
      { text: 'Call security', action: 'call_security' },
      { text: 'Medical emergency', action: 'medical_emergency' },
      { text: 'Campus safety info', action: 'safety_info' },
    ],
    general: [
      { text: 'University services', action: 'services_overview' },
      { text: 'Quick stats', action: 'quick_stats' },
      { text: 'Help & FAQ', action: 'help_faq' },
      { text: 'Contact support', action: 'contact_support' },
    ],
  };

  return actionMap[intent] || actionMap.general;
};

// Parse user message for intent classification
export const classifyIntent = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  // Intent patterns
  const patterns = {
    library: ['library', 'book', 'study', 'research', 'catalog', 'borrow'],
    lost_found: ['lost', 'found', 'missing', 'left behind', 'forget'],
    financial_aid: ['financial', 'aid', 'scholarship', 'money', 'fee', 'payment', 'loan'],
    navigation: ['where', 'direction', 'map', 'building', 'location', 'find', 'navigate'],
    wellness: ['wellness', 'health', 'stress', 'counseling', 'mental', 'anxiety', 'depression'],
    weather: ['weather', 'rain', 'temperature', 'forecast', 'sunny', 'cloudy'],
    notifications: ['notification', 'alert', 'announcement', 'update', 'news'],
    emergency: ['emergency', 'urgent', 'help', 'crisis', 'danger', 'accident'],
    dining: ['food', 'eat', 'dining', 'meal', 'cafeteria', 'restaurant'],
    academic: ['class', 'course', 'grade', 'exam', 'assignment', 'professor', 'semester'],
  };

  // Match whole words only, so e.g. "feeling" does not match the keyword "fee"
  for (const [intent, keywords] of Object.entries(patterns)) {
    if (keywords.some((keyword) => new RegExp(`\\b${keyword}\\b`).test(lowerMessage))) {
      return intent;
    }
  }

  return 'general';
};

// Extract entities from user message
export const extractEntities = (message: string): Record<string, any> => {
  const entities: Record<string, any> = {};

  // Extract building names
  const buildings = [
    'engineering building',
    'science building',
    'architecture building',
    'it building',
    'administration building',
    'library',
    'student center',
  ];

  const foundBuildings = buildings.filter((building) => message.toLowerCase().includes(building));

  if (foundBuildings.length > 0) {
    entities.buildings = foundBuildings;
  }

  // Extract time references
  const timePatterns =
    /\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|morning|afternoon|evening|night|\d{1,2}:\d{2})\b/gi;
  const timeMatches = message.match(timePatterns);

  if (timeMatches) {
    entities.timeReferences = timeMatches;
  }

  // Extract urgency level
  const urgentWords = ['urgent', 'emergency', 'asap', 'immediately', 'now', 'critical'];
  const isUrgent = urgentWords.some((word) => message.toLowerCase().includes(word));

  if (isUrgent) {
    entities.urgency = 'high';
  }

  return entities;
};

// Calculate response confidence based on intent matching
export const calculateConfidence = (message: string, intent: string): number => {
  const patterns = {
    library: ['library', 'book', 'study', 'research'],
    lost_found: ['lost', 'found', 'missing'],
    financial_aid: ['financial', 'aid', 'scholarship'],
    navigation: ['where', 'direction', 'map', 'building'],
    wellness: ['wellness', 'health', 'stress', 'counseling'],
    weather: ['weather', 'rain', 'temperature', 'forecast'],
    emergency: ['emergency', 'urgent', 'help', 'crisis'],
  };

  const intentKeywords = patterns[intent as keyof typeof patterns] || [];
  if (intentKeywords.length === 0) {
    return 25; // Unknown intent — fall back to minimum confidence instead of NaN
  }

  const lowerMessage = message.toLowerCase();

  const matchCount = intentKeywords.filter((keyword) =>
    new RegExp(`\\b${keyword}\\b`).test(lowerMessage)
  ).length;

  const confidence = Math.min((matchCount / intentKeywords.length) * 100, 100);
  return Math.max(confidence, 25); // Minimum 25% confidence
};

// Format AI response with markdown-like styling
export const formatResponse = (content: string): string => {
  return (
    content
      // Headers
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Bullet points
      .replace(
        /^• (.*$)/gm,
        '<div class="flex items-start gap-2 my-1"><span class="text-blue-500 font-bold">•</span><span>$1</span></div>'
      )
      // Line breaks
      .replace(/\n/g, '<br/>')
  );
};

// Scroll to bottom of chat
export const scrollToBottom = (elementRef: React.RefObject<HTMLDivElement>) => {
  elementRef.current?.scrollIntoView({
    behavior: 'smooth',
    block: 'end',
  });
};

// Check if message contains sensitive information
export const containsSensitiveInfo = (message: string): boolean => {
  const sensitivePatterns = [
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email (might be sensitive in context)
    /\bpassword\b/i,
    /\bpin\b/i,
  ];

  return sensitivePatterns.some((pattern) => pattern.test(message));
};

// Generate typing indicator duration based on response length
export const calculateTypingDuration = (responseLength: number): number => {
  // Base duration of 1 second, plus 30ms per character, max 5 seconds
  const baseDuration = 1000;
  const perCharDuration = 30;
  const maxDuration = 5000;

  return Math.min(baseDuration + responseLength * perCharDuration, maxDuration);
};
