// Athena AI Assistant Service with Gemini 2.5 Pro Integration
import { ChatMessage, ChatResponse, UniversityContext, ChatAttachment } from '@/types/athena';
import { fileUploadService, FileProcessingResult } from './fileUploadService';
import { tokenCountingService } from './tokenCountingService';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';

class AthenaService {
  private context: UniversityContext | null = null;
  private conversationHistory: ChatMessage[] = [];

  async initializeContext(): Promise<UniversityContext> {
    // Initialize university-specific context
    this.context = {
      university: 'University of Moratuwa',
      currentSemester: 'Semester 1, 2025',
      availableServices: [
        'Lost & Found',
        'Financial Aid',
        'Library Services', 
        'Study Spaces',
        'Wellness Support',
        'Academic Planning',
        'Navigation',
        'Dining Services',
        'Weather Updates',
        'Notifications'
      ],
      studentResources: {
        library: {
          name: 'Main Library',
          hours: '24/7',
          floors: 5,
          studySpaces: ['Silent Study Zone', 'Group Study Rooms', 'Computer Labs', 'Discussion Areas']
        },
        diningHalls: [
          { name: 'North Dining Hall', status: 'Open', waitTime: '5-10 mins' },
          { name: 'South Dining Hall', status: 'Open', waitTime: '15-20 mins' },
          { name: 'Engineering Cafeteria', status: 'Open', waitTime: '3-5 mins' }
        ],
        buildings: [
          'Engineering Building',
          'Science Building', 
          'Architecture Building',
          'IT Building',
          'Administration Building',
          'Library',
          'Student Center'
        ]
      },
      emergencyContacts: {
        security: '+94-11-2640051',
        medical: '+94-11-2642941',
        counseling: '+94-11-2640456'
      },
      timestamp: new Date()
    };

    return this.context;
  }

  async processMessage(message: string, conversationHistory: ChatMessage[] = [], attachments?: ChatAttachment[]): Promise<ChatResponse> {
    try {
      await this.initializeContext();
      this.conversationHistory = conversationHistory;

      // Check token limits before processing
      const estimatedInputTokens = tokenCountingService.estimateTokenCount(message);
      if (!tokenCountingService.canMakeRequest(estimatedInputTokens + 500)) {
        const usage = tokenCountingService.getTokenUsage();
        return {
          content: `⚠️ **Daily Token Limit Reached**\n\nYou've used ${usage.used.toLocaleString()} out of your ${usage.limit.toLocaleString()} daily tokens.\n\nYour limit will reset at midnight (${usage.resetTime.toLocaleTimeString()}).\n\nIn the meantime, you can browse university services directly using the buttons below.`,
          suggestions: [
            { text: 'Lost & Found', action: 'lost_found', route: '/lost-found' },
            { text: 'Financial Aid', action: 'financial_aid', route: '/financial-aid' },
            { text: 'Library Services', action: 'library', route: '/library' },
            { text: 'Contact Support', action: 'contact_support' }
          ],
          intent: 'token_limit_exceeded'
        };
      }

      // Process any attachments first
      let attachmentContext = '';
      
      if (attachments && attachments.length > 0) {
        for (const attachment of attachments) {
          if (attachment.extractedText) {
            attachmentContext += `\n\n**${attachment.type.toUpperCase()} Content:** ${attachment.extractedText}`;
          }
        }
      }

      // Build system prompt with university context
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(message + attachmentContext);

      console.log('🤖 Sending to Gemini 2.5 Pro...');

      const response = await this.callGeminiAPI(systemPrompt, userPrompt);
      
      // Record token usage
      const outputTokens = tokenCountingService.estimateTokenCount(response);
      tokenCountingService.recordTokenUsage(
        estimatedInputTokens,
        outputTokens,
        attachments && attachments.length > 0 ? 'chat_with_files' : 'chat'
      );
      
      const chatResponse = this.parseResponse(response, message);
      
      // Add token usage metadata
      chatResponse.metadata = {
        tokens: estimatedInputTokens + outputTokens,
        responseTime: Date.now(),
        attachmentsProcessed: attachments?.length || 0
      };
      
      return chatResponse;
      
    } catch (error) {
      console.error('❌ Error processing message:', error);
      return {
        content: "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment. If the issue persists, you can reach out to university support services.",
        suggestions: [
          { text: 'Try again', action: 'retry' },
          { text: 'Contact support', action: 'contact_support' },
          { text: 'View help', action: 'help' }
        ],
        intent: 'error'
      };
    }
  }

  private buildSystemPrompt(): string {
    const context = this.context!;
    
    return `You are Athena, the AI assistant for ${context.university}. You are a knowledgeable, friendly, and helpful university companion designed to assist students with their academic and campus life.

🏛️ **UNIVERSITY CONTEXT:**
- University: ${context.university}
- Current: ${context.currentSemester}
- Available Services: ${context.availableServices.join(', ')}

📚 **LIBRARY INFORMATION:**
- ${context.studentResources.library.name} - ${context.studentResources.library.hours}
- ${context.studentResources.library.floors} floors with various study spaces
- Study Areas: ${context.studentResources.library.studySpaces.join(', ')}

🏢 **CAMPUS BUILDINGS:**
${context.studentResources.buildings.map(building => `- ${building}`).join('\n')}

🍽️ **DINING OPTIONS:**
${context.studentResources.diningHalls.map(hall => `- ${hall.name}: ${hall.status} (Wait: ${hall.waitTime})`).join('\n')}

🚨 **EMERGENCY CONTACTS:**
- Security: ${context.emergencyContacts.security}
- Medical: ${context.emergencyContacts.medical}
- Counseling: ${context.emergencyContacts.counseling}

**YOUR CAPABILITIES:**
1. **Academic Support**: Help with course planning, study schedules, assignment management
2. **Campus Navigation**: Provide directions, building information, accessibility routes
3. **Student Services**: Assist with Lost & Found, Financial Aid, Library services
4. **Wellness Support**: Offer mental health resources, stress management tips
5. **Campus Life**: Dining info, weather updates, event notifications
6. **Emergency Assistance**: Provide emergency contacts and safety information

**PERSONALITY GUIDELINES:**
- Be warm, empathetic, and supportive
- Use a conversational but professional tone
- Provide specific, actionable advice
- Show understanding of student challenges
- Be encouraging and positive
- Reference actual university services and locations

**RESPONSE FORMAT:**
- Give clear, concise answers
- Provide relevant follow-up suggestions
- Include specific building names, service hours, and contact information when relevant
- Always prioritize student safety and wellbeing

Remember: You represent ${context.university} and should embody the values of academic excellence, student support, and community care.`;
  }

  private buildUserPrompt(message: string): string {
    const recentHistory = this.conversationHistory.slice(-5); // Last 5 messages for context
    
    let prompt = `STUDENT MESSAGE: "${message}"\n\n`;

    if (recentHistory.length > 0) {
      prompt += `RECENT CONVERSATION:\n`;
      recentHistory.forEach(msg => {
        prompt += `${msg.type === 'user' ? 'Student' : 'Athena'}: ${msg.content}\n`;
      });
      prompt += '\n';
    }

    prompt += `Please provide a helpful response as Athena, the University of Moratuwa AI assistant. Include specific information about university services, buildings, or resources when relevant. If the student needs immediate help or emergency assistance, prioritize their safety and wellbeing.`;

    return prompt;
  }

  private async callGeminiAPI(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured. Please check your environment variables.');
    }

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH', 
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  }

  private parseResponse(aiResponse: string, userMessage: string): ChatResponse {
    const content = aiResponse.trim();
    const lowerUserMessage = userMessage.toLowerCase();
    
    // Determine intent and generate appropriate suggestions
    let intent = 'general';
    let suggestions = [];

    if (lowerUserMessage.includes('lost') || lowerUserMessage.includes('found')) {
      intent = 'lost_found';
      suggestions = [
        { text: 'Report lost item', action: 'report_lost', route: '/lost-found' },
        { text: 'Search found items', action: 'search_found', route: '/lost-found' },
        { text: 'View all items', action: 'view_all', route: '/lost-found' }
      ];
    } else if (lowerUserMessage.includes('financial') || lowerUserMessage.includes('aid') || lowerUserMessage.includes('scholarship')) {
      intent = 'financial_aid';
      suggestions = [
        { text: 'Apply for aid', action: 'apply_aid', route: '/financial-aid' },
        { text: 'View applications', action: 'view_applications', route: '/financial-aid' },
        { text: 'Donation opportunities', action: 'donate', route: '/financial-aid' }
      ];
    } else if (lowerUserMessage.includes('library') || lowerUserMessage.includes('book') || lowerUserMessage.includes('study')) {
      intent = 'library';
      suggestions = [
        { text: 'Search catalog', action: 'search_books', route: '/library' },
        { text: 'Book a room', action: 'book_room', route: '/library' },
        { text: 'Library hours', action: 'library_hours', route: '/library' }
      ];
    } else if (lowerUserMessage.includes('navigation') || lowerUserMessage.includes('direction') || lowerUserMessage.includes('where')) {
      intent = 'navigation';
      suggestions = [
        { text: 'Open map', action: 'open_map', route: '/navigation' },
        { text: 'Find building', action: 'find_building', route: '/navigation' },
        { text: 'Accessibility routes', action: 'accessibility', route: '/navigation' }
      ];
    } else if (lowerUserMessage.includes('wellness') || lowerUserMessage.includes('health') || lowerUserMessage.includes('stress')) {
      intent = 'wellness';
      suggestions = [
        { text: 'Wellness check-in', action: 'wellness_checkin', route: '/wellness' },
        { text: 'Counseling services', action: 'counseling', route: '/wellness' },
        { text: 'Mental health resources', action: 'mental_health', route: '/wellness' }
      ];
    } else if (lowerUserMessage.includes('weather')) {
      intent = 'weather';
      suggestions = [
        { text: 'Full weather report', action: 'weather_report', route: '/weather' },
        { text: 'Weekly forecast', action: 'weekly_forecast', route: '/weather' },
        { text: 'Weather alerts', action: 'weather_alerts', route: '/weather' }
      ];
    } else if (lowerUserMessage.includes('notification') || lowerUserMessage.includes('alert')) {
      intent = 'notifications';
      suggestions = [
        { text: 'View all notifications', action: 'view_notifications', route: '/notifications' },
        { text: 'Notification settings', action: 'notification_settings', route: '/notifications' },
        { text: 'Mark as read', action: 'mark_read', route: '/notifications' }
      ];
    } else {
      suggestions = [
        { text: 'Lost & Found', action: 'lost_found', route: '/lost-found' },
        { text: 'Financial Aid', action: 'financial_aid', route: '/financial-aid' },
        { text: 'Library Services', action: 'library', route: '/library' },
        { text: 'Campus Navigation', action: 'navigation', route: '/navigation' }
      ];
    }

    return {
      content,
      suggestions,
      intent
    };
  }

  // Quick action handlers
  async getQuickStats(): Promise<ChatResponse> {
    return await this.processMessage("Show me quick university statistics and current status");
  }

  async getEmergencyInfo(): Promise<ChatResponse> {
    return await this.processMessage("I need emergency information and university contact numbers");
  }

  // File upload methods
  async uploadFile(file: File, userId?: number): Promise<{ attachment: ChatAttachment; uploadResult: any }> {
    try {
      const fileType = fileUploadService.getFileType(file);
      if (!fileType) {
        throw new Error('Unsupported file type');
      }

      let uploadResult;

      switch (fileType) {
        case 'image':
          uploadResult = await fileUploadService.uploadImage(file);
          break;
        case 'pdf':
          uploadResult = await fileUploadService.uploadPdf(file);
          break;
        case 'video':
          uploadResult = await fileUploadService.uploadVideo(file);
          break;
        default:
          throw new Error(`File type ${fileType} not supported`);
      }

      // Track upload in database if userId is provided
      if (userId && uploadResult.fileUrl) {
        try {
          await this.trackChatbotUpload({
            userId,
            fileUrl: uploadResult.fileUrl,
            fileName: uploadResult.fileName,
            fileType: fileType,
            fileSize: uploadResult.fileSize
          });
          console.log('✅ Chatbot upload tracked in database');
        } catch (dbError) {
          // Log error but don't fail the upload
          console.error('⚠️ Failed to track upload in database:', dbError);
        }
      }

      const attachment: ChatAttachment = {
        type: fileType,
        name: uploadResult.fileName,
        size: uploadResult.fileSize,
        content: uploadResult.fileUrl,
        processingStatus: 'completed'
      };

      return { attachment, uploadResult };
    } catch (error) {
      throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async trackChatbotUpload(uploadData: {
    userId: number;
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize?: number;
  }): Promise<void> {
    const response = await fetch('http://localhost:8080/api/chatbot/uploads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadData),
    });

    if (!response.ok) {
      throw new Error(`Failed to track upload: ${response.statusText}`);
    }
  }

  async processAttachment(attachment: ChatAttachment): Promise<ChatAttachment> {
    try {
      attachment.processingStatus = 'processing';

      let processingResult: FileProcessingResult | undefined;

      if (attachment.type === 'image') {
        processingResult = await fileUploadService.processImageWithAI(
          attachment.content,
          GEMINI_API_KEY
        );
        attachment.extractedText = processingResult.extractedText;
      } else if (attachment.type === 'pdf') {
        processingResult = await fileUploadService.processPdfWithAI(
          attachment.content,
          GEMINI_API_KEY
        );
        attachment.extractedText = processingResult.extractedText;
      }

      // Record processing tokens
      if (processingResult!) {
        tokenCountingService.recordTokenUsage(
          processingResult.tokensUsed,
          0,
          `${attachment.type}_processing`
        );
      }

      attachment.processingStatus = 'completed';
      return attachment;
    } catch (error) {
      console.error('Error processing attachment:', error);
      attachment.processingStatus = 'error';
      throw error;
    }
  }

  // Token usage methods
  getTokenUsage() {
    return tokenCountingService.getTokenUsage();
  }

  getUsageStats() {
    return tokenCountingService.getUsageStats();
  }

  canMakeRequest(estimatedTokens: number = 0): boolean {
    return tokenCountingService.canMakeRequest(estimatedTokens);
  }
}

export const athenaService = new AthenaService();