// Weather Chatbot Component for University of Moratuwa
// AI-Powered weather assistant using Gemini AI

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { WeatherResponse } from '@/services/weatherService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface WeatherChatbotProps {
  weatherData: WeatherResponse | null;
  isDarkMode: boolean;
}

const WeatherChatbot: React.FC<WeatherChatbotProps> = ({ weatherData, isDarkMode }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `🌤️ Hi! I'm your University of Moratuwa Weather Assistant. I can help you with:

• Current weather on campus
• Hourly & daily forecasts
• Weather-based recommendations
• Best times for outdoor activities

What would you like to know about the weather?`,
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Generate weather context for AI
  const generateWeatherContext = (): string => {
    if (!weatherData) return 'No weather data available.';

    const { current, hourly, daily } = weatherData;

    const context = `
Current Weather at University of Moratuwa:
- Temperature: ${current.temperature}°C (Feels like ${current.feelsLike}°C)
- Condition: ${current.condition}
- Humidity: ${current.humidity}%
- Wind Speed: ${current.windSpeed} km/h
- Visibility: ${current.visibility} km
- Sunrise: ${current.sunrise}, Sunset: ${current.sunset}

Next 6 Hours:
${hourly.map((h, i) => `${h.time}: ${h.temperature}°C, ${h.condition}, Rain: ${h.precipitation}%`).join('\n')}

7-Day Forecast:
${daily.map((d, i) => `${d.day}: High ${d.high}°C, Low ${d.low}°C, ${d.condition}, Rain: ${d.precipitation}%`).join('\n')}
`;

    return context;
  };

  // Call Backend Chat API
  const callGeminiAI = async (userMessage: string): Promise<string> => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    try {
      const response = await fetch(
        `${backendUrl}/api/weather/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            userId: null, // Set to user ID when auth is implemented
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      return data.response;
    } catch (error) {
      console.error('Backend Chat error:', error);
      throw error;
    }
  };

  // Generate fallback response
  const generateFallbackResponse = (userQuery: string): string => {
    if (!weatherData) {
      return '🌤️ Weather data is currently unavailable. Please try again in a moment.';
    }

    const { current } = weatherData;

    // Smart fallback based on user query
    if (userQuery.toLowerCase().includes('umbrella')) {
      if (current.condition.toLowerCase().includes('rain')) {
        return `🌧️ Yes, bring an umbrella! It's currently ${current.condition} with ${current.temperature}°C at UoM campus.`;
      }
      return `☀️ No need for an umbrella right now! It's ${current.condition} with ${current.temperature}°C at UoM campus.`;
    }

    if (userQuery.toLowerCase().includes('hot') || userQuery.toLowerCase().includes('cold')) {
      return `🌡️ Current temperature at University of Moratuwa is ${current.temperature}°C (feels like ${current.feelsLike}°C). ${current.condition} conditions with ${current.humidity}% humidity.`;
    }

    // Default response
    return `🌤️ Current weather at University of Moratuwa:
📍 ${current.temperature}°C, ${current.condition}
💨 Wind: ${current.windSpeed} km/h
💧 Humidity: ${current.humidity}%`;
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Try Gemini AI first
      const aiResponse = await callGeminiAI(inputMessage);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Fallback to smart response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateFallbackResponse(inputMessage),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, fallbackMessage]);
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
      className={`relative ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-800/95 via-gray-900/95 to-gray-800/95 border-blue-500/30'
          : 'bg-gradient-to-br from-white/95 via-blue-50/30 to-white/95 border-blue-300/40'
      } rounded-3xl shadow-2xl border-2 backdrop-blur-xl h-[600px] flex flex-col overflow-hidden group hover:shadow-blue-500/20 transition-all duration-500`}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-cyan-600/5 to-blue-600/5 animate-gradient-shift pointer-events-none"></div>

      {/* Header */}
      <div className={`relative z-10 p-5 border-b-2 ${isDarkMode ? 'border-blue-500/30 bg-gray-900/50' : 'border-blue-300/40 bg-white/50'} backdrop-blur-md`}>
        <div className="flex items-center">
          <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
            {/* Pulsing indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div className="flex-1">
            <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Weather Assistant
            </h3>
            <p className={`text-xs font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} flex items-center gap-1`}>
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Powered by Gemini AI
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className={`relative z-10 flex-1 overflow-y-auto p-6 space-y-5 ${
          isDarkMode ? 'bg-gradient-to-b from-transparent to-gray-900/20' : 'bg-gradient-to-b from-transparent to-blue-50/10'
        }`}
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-appear`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-lg ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 text-white shadow-blue-500/30'
                  : isDarkMode
                  ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-100 border border-gray-600/50 shadow-gray-900/50'
                  : 'bg-gradient-to-br from-white to-gray-50 text-gray-900 border border-gray-200/50 shadow-gray-300/30'
              } transition-all duration-300 hover:scale-[1.02]`}
            >
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
          <div className="flex justify-start animate-appear">
            <div
              className={`rounded-2xl px-5 py-4 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600/50'
                  : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200/50'
              } shadow-lg`}
            >
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className={`relative z-10 p-5 border-t-2 ${
        isDarkMode ? 'border-blue-500/30 bg-gray-900/50' : 'border-blue-300/40 bg-white/50'
      } backdrop-blur-md`}>
        <div className="flex items-end gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about the weather..."
            disabled={isLoading}
            className={`flex-1 px-5 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-md ${
              isDarkMode
                ? 'bg-gray-800/80 border-gray-600/50 text-gray-100 placeholder-gray-400 focus:bg-gray-800/90 focus:border-blue-500/50'
                : 'bg-white/80 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-400/50'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="group px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-700 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105 disabled:hover:scale-100"
          >
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeatherChatbot;
