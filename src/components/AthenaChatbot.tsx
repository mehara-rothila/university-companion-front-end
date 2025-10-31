'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Upload, X, FileText, Image as ImageIcon, Send, Loader } from 'lucide-react';
import TokenUsageDisplay, { triggerTokenRefresh } from './TokenUsageDisplay';
import { tokenCountingService } from '@/services/tokenCountingService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Array<{
    type: 'image' | 'pdf';
    name: string;
    url: string;
  }>;
}

interface AthenaChatbotProps {
  isDarkMode: boolean;
}

const AthenaChatbot: React.FC<AthenaChatbotProps> = ({ isDarkMode }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `👋 Hi! I'm Athena, your University of Moratuwa AI Assistant. I can help you with:

📚 Academic planning and assignments
🗺️ Campus navigation and services
📄 Analyzing documents (PDFs, images)
💰 Financial aid and scholarships
🏛️ Library and study spaces
🌤️ Weather updates

You can also upload images or PDFs for me to analyze! What would you like help with?`,
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    type: 'image' | 'pdf';
    file: File;
    preview: string;
    url?: string;
  }>>([]);
  const [isUploading, setIsUploading] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';

      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        alert(`${file.name} is not a supported file type. Only images and PDFs are allowed.`);
        continue;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      try {
        // Upload to S3
        const uploadedUrl = await uploadFileToS3(file, fileType);

        setUploadedFiles(prev => [...prev, {
          type: fileType,
          file,
          preview: previewUrl,
          url: uploadedUrl
        }]);
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload file to S3 via backend
  const uploadFileToS3 = async (file: File, fileType: 'image' | 'pdf'): Promise<string> => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const formData = new FormData();
    formData.append('file', file);

    const uploadEndpoint = fileType === 'image'
      ? `${backendUrl}/api/upload/image`
      : `${backendUrl}/api/upload/pdf`;

    const response = await fetch(uploadEndpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();

    // Handle different response formats (imageUrl, pdfUrl, or fileUrl)
    const fileUrl = data.fileUrl || data.imageUrl || data.pdfUrl;

    // Validate fileUrl exists
    if (!fileUrl) {
      console.error('Upload response missing file URL:', data);
      throw new Error('Upload succeeded but no file URL returned');
    }

    // Track in database if user is logged in
    if (user?.id) {
      try {
        await trackUpload(user.id, fileUrl, file.name, fileType, file.size);
        console.log('✅ Upload tracked in database');
      } catch (error) {
        console.error('❌ Failed to track upload in database:', error);
        // Don't throw error - file uploaded successfully to S3
      }
    } else {
      console.warn('⚠️ User not logged in - upload will not be tracked in "My Uploads"');
    }

    return fileUrl;
  };

  // Track upload in database
  const trackUpload = async (
    userId: number,
    fileUrl: string,
    fileName: string,
    fileType: 'image' | 'pdf',
    fileSize: number
  ) => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    // Validate inputs
    if (!fileUrl || !fileName) {
      throw new Error('Missing required upload information');
    }

    const response = await fetch(`${backendUrl}/api/chatbot/uploads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        fileUrl,
        fileName,
        fileType: fileType.toUpperCase(),
        fileSize,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to track upload: ${errorData.error || response.statusText}`);
    }

    return response.json();
  };

  // Remove uploaded file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Send message to chatbot
  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && uploadedFiles.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage || '(File uploaded for analysis)',
      timestamp: new Date(),
      attachments: uploadedFiles.map(f => ({
        type: f.type,
        name: f.file.name,
        url: f.url || ''
      }))
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      // Prepare request with file URLs
      const imageUrls = uploadedFiles.filter(f => f.type === 'image').map(f => f.url).filter(Boolean);
      const pdfUrls = uploadedFiles.filter(f => f.type === 'pdf').map(f => f.url).filter(Boolean);

      const response = await fetch(`${backendUrl}/api/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage || 'Please analyze the uploaded files.',
          userId: user?.id || null,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
          pdfUrls: pdfUrls.length > 0 ? pdfUrls : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.error || 'Sorry, I could not process that.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Clear uploaded files after sending
      uploadedFiles.forEach(f => URL.revokeObjectURL(f.preview));
      setUploadedFiles([]);

      // Record token usage with REAL token counts from backend
      const inputTokens = data.inputTokens || 0;
      const outputTokens = data.outputTokens || 0;
      if (inputTokens > 0 || outputTokens > 0) {
        // Use real token counts from Gemini API
        tokenCountingService.recordTokenUsage(inputTokens, outputTokens, 'chat');
        console.log(`✅ Real token consumption: ${inputTokens} input + ${outputTokens} output = ${inputTokens + outputTokens} total`);
      } else {
        // Fallback to estimation if API doesn't return real counts
        tokenCountingService.recordTokenUsage(100, 300, 'chat');
      }

      // Refresh token display after successful response
      setTimeout(() => triggerTokenRefresh(), 100);

    } catch (error) {
      console.error('Chat error:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);

      // Refresh token display even on error
      setTimeout(() => triggerTokenRefresh(), 100);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={`${
        isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'
      } rounded-2xl shadow-lg border backdrop-blur-sm h-[700px] flex flex-col`}
    >
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Athena AI Assistant
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              University of Moratuwa • Powered by Gemini 2.5 Pro
            </p>
          </div>
        </div>

        {/* Token Usage Display */}
        <div className="mt-3">
          <TokenUsageDisplay compact={true} />
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-100'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mb-2 space-y-1">
                  {message.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                        message.role === 'user'
                          ? 'bg-white/20'
                          : isDarkMode
                          ? 'bg-gray-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      {att.type === 'image' ? (
                        <ImageIcon className="w-3 h-3" />
                      ) : (
                        <FileText className="w-3 h-3" />
                      )}
                      <span className="truncate">{att.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.role === 'user'
                    ? 'text-white/70'
                    : isDarkMode
                    ? 'text-gray-400'
                    : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div
              className={`rounded-2xl px-4 py-3 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Loader className="w-4 h-4 animate-spin text-purple-500" />
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                  Thinking...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File Upload Preview */}
      {uploadedFiles.length > 0 && (
        <div className={`px-4 py-2 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}
              >
                {file.type === 'image' ? (
                  <img src={file.preview} alt={file.file.name} className="w-8 h-8 rounded object-cover" />
                ) : (
                  <FileText className="w-6 h-6 text-red-500" />
                )}
                <span className={`text-xs truncate max-w-[120px] ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {file.file.name}
                </span>
                <button
                  onClick={() => removeFile(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-end space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,application/pdf"
            multiple
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isUploading}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            } ${(isLoading || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Upload image or PDF"
          >
            <Upload className="w-5 h-5" />
          </button>

          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything or upload files..."
            disabled={isLoading}
            rows={1}
            className={`flex-1 px-4 py-2 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />

          <button
            onClick={handleSendMessage}
            disabled={isLoading || (!inputMessage.trim() && uploadedFiles.length === 0)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AthenaChatbot;
