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

  // Call Gemini AI API
  const callGeminiAI = async (userMessage: string): Promise<string> => {
    const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    const weatherContext = generateWeatherContext();

    const systemPrompt = `You are a helpful weather assistant for University of Moratuwa students.

Current Weather Data:
${weatherContext}

Guidelines:
- Provide accurate weather information based on the data above
- Be conversational and friendly
- Give practical campus-specific recommendations (e.g., "bring umbrella to library", "great day for sports complex")
- Keep responses concise (max 150 words)
- Use emojis moderately for clarity
- Focus on how weather affects campus life

User Question: ${userMessage}

Provide a helpful response:`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: systemPrompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini AI error:', error);
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
      className={`${
        isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'
      } rounded-2xl shadow-lg border backdrop-blur-sm h-[600px] flex flex-col`}
    >
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mr-3">
            <svg
              className="w-6 h-6 text-white"
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
          </div>
          <div>
            <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Weather Assistant
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Powered by AI
            </p>
          </div>
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
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                  ? 'bg-gray-700 text-gray-100'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
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
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about the weather..."
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeatherChatbot;
