// Weather Service for University of Moratuwa
// Calls backend API for weather data

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
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

interface WeatherResponse {
  current: WeatherData;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

class WeatherService {
  private backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  async getWeather(): Promise<WeatherResponse | null> {
    try {
      const response = await fetch(`${this.backendUrl}/api/weather/current`);

      if (!response.ok) {
        console.error('Failed to fetch weather from backend:', response.statusText);
        return null;
      }

      const data: WeatherResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching weather from backend:', error);
      return null;
    }
  }
}

export const weatherService = new WeatherService();
export type { WeatherResponse, WeatherData, HourlyForecast, DailyForecast };
