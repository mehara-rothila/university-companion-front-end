'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { weatherService } from '@/services/weatherService';
import Link from 'next/link';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  uvIndex: number;
  visibility: number;
}

export default function WeatherCard() {
  const { isDarkMode } = useDarkMode();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await weatherService.getWeather();
        if (data && data.current) {
          setWeatherData({
            temperature: data.current.temperature,
            condition: data.current.condition,
            humidity: data.current.humidity,
            windSpeed: data.current.windSpeed,
            feelsLike: data.current.feelsLike,
            uvIndex: data.current.uvIndex,
            visibility: data.current.visibility,
          });
        }
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();

    // Refresh weather data every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        );
      case 'clouds':
      case 'cloudy':
      case 'partly cloudy':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.002 4.002 0 003 15z"
            />
          </svg>
        );
      case 'rain':
      case 'drizzle':
      case 'rainy':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.002 4.002 0 003 15z M8 19l-1 2 M12 19l-1 2 M16 19l-1 2"
            />
          </svg>
        );
      case 'thunderstorm':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.002 4.002 0 003 15z M13 16l-2 4h3l-2 4"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.002 4.002 0 003 15z"
            />
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <div
        className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}
      >
        <div className="animate-pulse space-y-3">
          <div className={`h-5 w-32 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className={`h-10 w-20 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className="grid grid-cols-2 gap-3">
            <div className={`h-14 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            <div className={`h-14 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <Link href="/weather" className="block">
        <div
          className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700 hover:bg-gray-800' : 'bg-white/90 border-gray-100 hover:bg-white'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm transition-all duration-300 transform hover:scale-[1.02] cursor-pointer`}
        >
          <h3
            className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} flex items-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.002 4.002 0 003 15z"
              />
            </svg>
            University Weather
          </h3>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Weather data unavailable. Click to retry.
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link href="/weather" className="block">
      <div
        className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700 hover:bg-gray-800' : 'bg-white/90 border-gray-100 hover:bg-white'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm transition-all duration-300 transform hover:scale-[1.02] cursor-pointer`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} flex items-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.002 4.002 0 003 15z"
              />
            </svg>
            University Weather
          </h3>
          <div className="text-yellow-500">{getWeatherIcon(weatherData.condition)}</div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span
                className={`text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
              >
                {Math.round(weatherData.temperature)}°C
              </span>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                {weatherData.condition}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className={`${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-lg p-3`}>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs mb-1`}>
                Humidity
              </p>
              <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'} font-semibold`}>
                {weatherData.humidity}%
              </p>
            </div>
            <div className={`${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-lg p-3`}>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs mb-1`}>
                Wind
              </p>
              <p className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'} font-semibold`}>
                {weatherData.windSpeed} km/h
              </p>
            </div>
          </div>

          <div
            className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} flex items-center justify-center pt-2`}
          >
            <span>Click for detailed forecast</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
