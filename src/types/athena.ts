// Athena AI Assistant Types

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'athena' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: QuickAction[];
  attachments?: ChatAttachment[];
  isTyping?: boolean;
}

export interface QuickAction {
  id?: string;
  text: string;
  action: string;
  route?: string;
  icon?: React.ReactNode;
}

export interface ChatAttachment {
  type: 'image' | 'file' | 'pdf' | 'video';
  name: string;
  size: number;
  content: string;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'error';
  extractedText?: string;
  transcription?: string;
}

export interface ChatResponse {
  content: string;
  suggestions?: QuickAction[];
  intent?: string;
  attachments?: ChatAttachment[];
  metadata?: {
    tokens?: number;
    responseTime?: number;
    confidence?: number;
    attachmentsProcessed?: number;
  };
}

export interface UniversityContext {
  university: string;
  currentSemester: string;
  availableServices: string[];
  studentResources: {
    library: {
      name: string;
      hours: string;
      floors: number;
      studySpaces: string[];
    };
    diningHalls: Array<{
      name: string;
      status: string;
      waitTime: string;
    }>;
    buildings: string[];
  };
  emergencyContacts: {
    security: string;
    medical: string;
    counseling: string;
  };
  timestamp: Date;
}

export interface AthenaConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  conversationHistory: number;
}

export interface TokenUsage {
  used: number;
  limit: number;
  resetTime: Date;
  sessionsToday: number;
}

export interface AICapabilities {
  textGeneration: boolean;
  imageAnalysis: boolean;
  pdfProcessing: boolean;
  voiceInput: boolean;
  weatherIntegration: boolean;
  universityDataAccess: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notificationSettings: {
    emergencyAlerts: boolean;
    academicReminders: boolean;
    weatherUpdates: boolean;
    serviceUpdates: boolean;
  };
  accessibilitySettings: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
  };
}