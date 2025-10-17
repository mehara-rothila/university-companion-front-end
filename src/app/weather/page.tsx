'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import { CloudRain, Wind, Droplets, Eye, Sun, CloudSun, Cloud, CloudDrizzle } from 'lucide-react';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  sunrise: string;
  sunset: string;
}

interface HourlyForecast {
  time: string;
  temperature: number;
  condition: string;
  precipitation: number;
}

interface DailyForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  precipitation: number;
}

export default function WeatherPage() {
  const { isDarkMode } = useDarkMode();
  const [currentWeather, setCurrentWeather] = useState<WeatherData>({
    temperature: 24,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    feelsLike: 26,
    uvIndex: 7,
    visibility: 10,
    pressure: 1013,
    sunrise: '6:15 AM',
    sunset: '6:30 PM'
  });

  const [hourlyForecast] = useState<HourlyForecast[]>([
    { time: '12 PM', temperature: 24, condition: 'Partly Cloudy', precipitation: 10 },
    { time: '1 PM', temperature: 25, condition: 'Partly Cloudy', precipitation: 15 },
    { time: '2 PM', temperature: 26, condition: 'Sunny', precipitation: 5 },
    { time: '3 PM', temperature: 27, condition: 'Sunny', precipitation: 0 },
    { time: '4 PM', temperature: 26, condition: 'Partly Cloudy', precipitation: 10 },
    { time: '5 PM', temperature: 25, condition: 'Cloudy', precipitation: 20 },
    { time: '6 PM', temperature: 23, condition: 'Cloudy', precipitation: 30 },
    { time: '7 PM', temperature: 22, condition: 'Rainy', precipitation: 60 },
  ]);

  const [dailyForecast] = useState<DailyForecast[]>([
    { day: 'Monday', high: 28, low: 22, condition: 'Sunny', precipitation: 10 },
    { day: 'Tuesday', high: 27, low: 21, condition: 'Partly Cloudy', precipitation: 20 },
    { day: 'Wednesday', high: 26, low: 20, condition: 'Cloudy', precipitation: 40 },
    { day: 'Thursday', high: 25, low: 19, condition: 'Rainy', precipitation: 70 },
    { day: 'Friday', high: 26, low: 20, condition: 'Partly Cloudy', precipitation: 30 },
    { day: 'Saturday', high: 27, low: 21, condition: 'Sunny', precipitation: 10 },
    { day: 'Sunday', high: 28, low: 22, condition: 'Sunny', precipitation: 5 },
  ]);

  const getWeatherIcon = (condition: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-6 w-6',
      md: 'h-12 w-12',
      lg: 'h-20 w-20'
    };

    const iconClass = sizeClasses[size];

    switch (condition.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className={`${iconClass} text-yellow-500`} strokeWidth={1.5} />;
      case 'partly cloudy':
        return <CloudSun className={`${iconClass} text-blue-400`} strokeWidth={1.5} />;
      case 'cloudy':
        return <Cloud className={`${iconClass} text-gray-400`} strokeWidth={1.5} />;
      case 'rainy':
        return <CloudRain className={`${iconClass} text-blue-600`} strokeWidth={1.5} />;
      case 'drizzle':
        return <CloudDrizzle className={`${iconClass} text-blue-500`} strokeWidth={1.5} />;
      default:
        return <CloudSun className={`${iconClass} text-blue-400`} strokeWidth={1.5} />;
    }
  };

  const getUVIndexColor = (index: number) => {
    if (index <= 2) return 'text-green-500';
    if (index <= 5) return 'text-yellow-500';
    if (index <= 7) return 'text-orange-500';
    if (index <= 10) return 'text-red-500';
    return 'text-purple-500';
  };

  const getUVIndexLabel = (index: number) => {
    if (index <= 2) return 'Low';
    if (index <= 5) return 'Moderate';
    if (index <= 7) return 'High';
    if (index <= 10) return 'Very High';
    return 'Extreme';
  };

  return (
    <>
      <Navigation />
      <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-blue-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
        <AnimatedBackground variant="default" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className={`text-3xl sm:text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
              University Weather
            </h1>
            <p className={`text-sm sm:text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              University of Moratuwa Weather Forecast
            </p>
          </div>

          {/* Current Weather - Large Card */}
          <div className={`${isDarkMode ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700' : 'bg-gradient-to-br from-white/90 to-blue-50/90 border-blue-100'} rounded-3xl shadow-2xl p-8 border backdrop-blur-sm mb-8`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Side - Main Weather */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    <h2 className={`text-7xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {Math.round(currentWeather.temperature)}°
                    </h2>
                    <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
                      {currentWeather.condition}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      Feels like {Math.round(currentWeather.feelsLike)}°C
                    </p>
                  </div>
                  <div>
                    {getWeatherIcon(currentWeather.condition, 'lg')}
                  </div>
                </div>
              </div>

              {/* Right Side - Weather Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`${isDarkMode ? 'bg-gray-700/30' : 'bg-white/70'} rounded-xl p-4`}>
                  <div className="flex items-center mb-2">
                    <Droplets className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Humidity</p>
                  </div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {currentWeather.humidity}%
                  </p>
                </div>

                <div className={`${isDarkMode ? 'bg-gray-700/30' : 'bg-white/70'} rounded-xl p-4`}>
                  <div className="flex items-center mb-2">
                    <Wind className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Wind Speed</p>
                  </div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {currentWeather.windSpeed} km/h
                  </p>
                </div>

                <div className={`${isDarkMode ? 'bg-gray-700/30' : 'bg-white/70'} rounded-xl p-4`}>
                  <div className="flex items-center mb-2">
                    <Sun className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>UV Index</p>
                  </div>
                  <p className={`text-2xl font-bold ${getUVIndexColor(currentWeather.uvIndex)}`}>
                    {currentWeather.uvIndex} - {getUVIndexLabel(currentWeather.uvIndex)}
                  </p>
                </div>

                <div className={`${isDarkMode ? 'bg-gray-700/30' : 'bg-white/70'} rounded-xl p-4`}>
                  <div className="flex items-center mb-2">
                    <Eye className={`h-5 w-5 mr-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Visibility</p>
                  </div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {currentWeather.visibility} km
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-300/30 dark:border-gray-700/30">
              <div className="text-center">
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pressure</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {currentWeather.pressure} mb
                </p>
              </div>
              <div className="text-center">
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sunrise</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {currentWeather.sunrise}
                </p>
              </div>
              <div className="text-center">
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sunset</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {currentWeather.sunset}
                </p>
              </div>
              <div className="text-center">
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Location</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Moratuwa
                </p>
              </div>
            </div>
          </div>

          {/* Hourly Forecast */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm mb-8`}>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
              Hourly Forecast
            </h3>
            <div className="flex overflow-x-auto space-x-4 pb-4">
              {hourlyForecast.map((hour, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-4 text-center min-w-[100px]`}
                >
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    {hour.time}
                  </p>
                  <div className="flex justify-center mb-2">
                    {getWeatherIcon(hour.condition, 'sm')}
                  </div>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-1`}>
                    {Math.round(hour.temperature)}°
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {hour.precipitation}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
              7-Day Forecast
            </h3>
            <div className="space-y-3">
              {dailyForecast.map((day, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'} rounded-xl p-4`}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} w-24`}>
                      {day.day}
                    </p>
                    <div className="flex items-center space-x-2">
                      {getWeatherIcon(day.condition, 'sm')}
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {day.condition}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      💧 {day.precipitation}%
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {Math.round(day.high)}°
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {Math.round(day.low)}°
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
