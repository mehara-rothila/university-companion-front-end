// Weather Chatbot Component for University of Moratuwa
// AI-Powered weather assistant using Kimi AI

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
  const callKimiAI = async (userMessage: string): Promise<string> => {
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

    const { current, daily } = weatherData;
    const query = userQuery.toLowerCase();

    // Handle yesterday/past weather queries
    if (query.includes('yesterday') || query.includes('last week') || query.includes('last month') ||
      query.includes('previous') || query.includes('past')) {
      return `📅 I'm sorry, I don't have access to historical weather data. I can only provide current conditions and forecasts for the upcoming days.

Would you like to know about today's weather or tomorrow's forecast instead?`;
    }

    // Handle tomorrow weather queries
    if (query.includes('tomorrow')) {
      if (daily && daily.length > 1) {
        const tomorrow = daily[1]; // Index 1 is tomorrow
        return `🌤️ Tomorrow's weather at University of Moratuwa:
📍 ${tomorrow.day}
🌡️ High: ${tomorrow.high}°C, Low: ${tomorrow.low}°C
☁️ Condition: ${tomorrow.condition}
🌧️ Rain chance: ${tomorrow.precipitation}%

${tomorrow.precipitation > 50 ? '☔ Consider bringing an umbrella!' : '☀️ Looks like a good day!'}`;
      }
      return '🌤️ Tomorrow\'s forecast data is currently unavailable. Please try again later.';
    }

    // Handle day after tomorrow
    if (query.includes('day after tomorrow') || query.includes('2 days')) {
      if (daily && daily.length > 2) {
        const dayAfter = daily[2];
        return `🌤️ Weather for ${dayAfter.day} at University of Moratuwa:
🌡️ High: ${dayAfter.high}°C, Low: ${dayAfter.low}°C
☁️ Condition: ${dayAfter.condition}
🌧️ Rain chance: ${dayAfter.precipitation}%`;
      }
    }

    // Handle weekly forecast
    if (query.includes('week') || query.includes('forecast') || query.includes('next few days')) {
      if (daily && daily.length > 0) {
        let forecast = '📅 7-Day Forecast for University of Moratuwa:\n\n';
        daily.forEach((day, i) => {
          const label = i === 0 ? '(Today)' : i === 1 ? '(Tomorrow)' : '';
          forecast += `${day.day} ${label}: ${day.high}°C/${day.low}°C - ${day.condition} 🌧️${day.precipitation}%\n`;
        });
        return forecast;
      }
    }

    // Smart fallback based on user query
    if (query.includes('umbrella')) {
      if (current.condition.toLowerCase().includes('rain')) {
        return `🌧️ Yes, bring an umbrella! It's currently ${current.condition} with ${current.temperature}°C at UoM campus.`;
      }
      return `☀️ No need for an umbrella right now! It's ${current.condition} with ${current.temperature}°C at UoM campus.`;
    }

    if (query.includes('hot') || query.includes('cold')) {
      return `🌡️ Current temperature at University of Moratuwa is ${current.temperature}°C (feels like ${current.feelsLike}°C). ${current.condition} conditions with ${current.humidity}% humidity.`;
    }

    // Handle general chatbot questions
    if (query.includes('model') || query.includes('who are you') || query.includes('what are you') ||
      query.includes('your name') || query.includes('about you')) {
      return `🤖 I'm the University of Moratuwa Weather Assistant, powered by Kimi AI! 

I can help you with:
• Current weather conditions on campus
• Weather forecasts for the next 7 days
• Advice on whether to bring an umbrella
• Best times for outdoor activities

Try asking me about today's weather or tomorrow's forecast!`;
    }

    // Handle greetings
    if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('good morning') || query.includes('good evening')) {
      return `👋 Hello! I'm your UoM Weather Assistant.

Right now at campus it's ${current.temperature}°C with ${current.condition} conditions.

What would you like to know about the weather?`;
    }

    // Handle thanks
    if (query.includes('thank') || query.includes('thanks')) {
      return `😊 You're welcome! Feel free to ask me about the weather anytime. Stay safe on campus!`;
    }

    // Check if the query is weather-related
    const weatherKeywords = [
      'weather', 'temperature', 'temp', 'rain', 'sunny', 'cloud', 'humid', 'wind',
      'forecast', 'hot', 'cold', 'warm', 'cool', 'degree', 'celsius', 'outside',
      'today', 'now', 'current', 'climate', 'storm', 'thunder', 'lightning',
      'uv', 'sunrise', 'sunset', 'visibility', 'pressure', 'feels like',
      'morning', 'afternoon', 'evening', 'night', 'weekend', 'outdoor'
    ];

    const isWeatherRelated = weatherKeywords.some(keyword => query.includes(keyword));

    // If not weather-related, show out-of-scope message
    if (!isWeatherRelated) {
      return `🤖 I'm the UoM Weather Assistant and I can only help with weather-related questions!

Try asking me things like:
• "What's the weather today?"
• "Will it rain tomorrow?"
• "Should I bring an umbrella?"
• "What's the forecast for this week?"

Current conditions: ${current.temperature}°C, ${current.condition}`;
    }

    // Default response for weather-related queries - current weather
    return `🌤️ Current weather at University of Moratuwa:
📍 ${current.temperature}°C, ${current.condition}
💨 Wind: ${current.windSpeed} km/h
💧 Humidity: ${current.humidity}%`;
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    let msgCounter = 0;
    const userMessage: Message = {
      id: `${Date.now()}-${msgCounter++}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Try Kimi AI first
      const aiResponse = await callKimiAI(inputMessage);

      const assistantMessage: Message = {
        id: `${Date.now()}-${msgCounter++}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Fallback to smart response
      const fallbackMessage: Message = {
        id: `${Date.now()}-fallback`,
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
      className={`relative ${isDarkMode
          ? 'bg-gradient-to-br from-gray-800/95 via-gray-900/95 to-gray-800/95 border-blue-500/30'
          : 'bg-gradient-to-br from-white/95 via-blue-50/30 to-white/95 border-blue-300/40'
        } rounded-3xl shadow-2xl border-2 backdrop-blur-xl h-[calc(100vh-180px)] md:h-[700px] flex flex-col overflow-hidden group hover:shadow-blue-500/20 transition-all duration-500`}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-cyan-600/5 to-blue-600/5 animate-gradient-shift pointer-events-none"></div>

      {/* Header */}
      <div className={`relative z-10 p-3 md:p-5 border-b-2 ${isDarkMode ? 'border-blue-500/30 bg-gray-900/50' : 'border-blue-300/40 bg-white/50'} backdrop-blur-md`}>
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
              Powered by Kimi AI
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className={`relative z-10 flex-1 overflow-y-auto p-6 space-y-5 ${isDarkMode ? 'bg-gradient-to-b from-transparent to-gray-900/20' : 'bg-gradient-to-b from-transparent to-blue-50/10'
          }`}
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-appear`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-lg ${message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 text-white shadow-blue-500/30'
                  : isDarkMode
                    ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-100 border border-gray-600/50 shadow-gray-900/50'
                    : 'bg-gradient-to-br from-white to-gray-50 text-gray-900 border border-gray-200/50 shadow-gray-300/30'
                } transition-all duration-300 hover:scale-[1.02]`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-1 ${message.role === 'user'
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
              className={`rounded-2xl px-5 py-4 ${isDarkMode
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
      <div className={`relative z-10 p-3 md:p-5 border-t-2 ${isDarkMode ? 'border-blue-500/30 bg-gray-900/50' : 'border-blue-300/40 bg-white/50'
        } backdrop-blur-md`}>
        <div className="flex items-end gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about the weather..."
            disabled={isLoading}
            className={`flex-1 px-3 py-2 md:px-5 md:py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-md ${isDarkMode
                ? 'bg-gray-800/80 border-gray-600/50 text-gray-100 placeholder-gray-400 focus:bg-gray-800/90 focus:border-blue-500/50'
                : 'bg-white/80 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-400/50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="group px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-700 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105 disabled:hover:scale-100"
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
