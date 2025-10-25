// Weather Service for University of Moratuwa
// Fetches real-time weather data from OpenWeatherMap API

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
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes

  // University of Moratuwa coordinates
  private readonly UOM_LOCATION = {
    name: 'University of Moratuwa',
    lat: 6.7951276,
    lon: 79.900867,
  };

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenWeather API key not found in environment variables');
    }
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  private getFromCache<T>(key: string): T | null {
    if (this.isCacheValid(key)) {
      return this.cache.get(key)!.data as T;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private async fetchCurrentWeather(): Promise<any> {
    const cacheKey = 'current_weather';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/weather?lat=${this.UOM_LOCATION.lat}&lon=${this.UOM_LOCATION.lon}&appid=${this.apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      return null;
    }
  }

  private async fetchForecast(): Promise<any> {
    const cacheKey = 'forecast';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/forecast?lat=${this.UOM_LOCATION.lat}&lon=${this.UOM_LOCATION.lon}&appid=${this.apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      return null;
    }
  }

  private formatTime(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  private getDayName(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  async getWeather(): Promise<WeatherResponse | null> {
    try {
      const [currentData, forecastData] = await Promise.all([
        this.fetchCurrentWeather(),
        this.fetchForecast(),
      ]);

      if (!currentData || !forecastData) {
        return null;
      }

      // Parse current weather
      const current: WeatherData = {
        temperature: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
        feelsLike: Math.round(currentData.main.feels_like),
        pressure: currentData.main.pressure,
        visibility: Math.round((currentData.visibility || 10000) / 1000), // Convert to km
        uvIndex: 7, // OpenWeather free tier doesn't include UV, using default
        sunrise: this.formatTime(currentData.sys.sunrise),
        sunset: this.formatTime(currentData.sys.sunset),
      };

      // Parse hourly forecast (next 6 hours, every 3 hours from API)
      const hourly: HourlyForecast[] = forecastData.list
        .slice(0, 6)
        .map((item: any) => ({
          time: this.formatTime(item.dt),
          temperature: Math.round(item.main.temp),
          condition: item.weather[0].main,
          precipitation: Math.round((item.pop || 0) * 100), // Probability of precipitation
        }));

      // Parse daily forecast (7 days)
      const dailyMap = new Map<string, any[]>();

      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyMap.has(date)) {
          dailyMap.set(date, []);
        }
        dailyMap.get(date)!.push(item);
      });

      const daily: DailyForecast[] = Array.from(dailyMap.entries())
        .slice(0, 7)
        .map(([date, items]) => {
          const temps = items.map(i => i.main.temp);
          const high = Math.round(Math.max(...temps));
          const low = Math.round(Math.min(...temps));
          const avgPrecipitation = Math.round(
            (items.reduce((sum, i) => sum + (i.pop || 0), 0) / items.length) * 100
          );

          return {
            day: this.getDayName(items[0].dt),
            high,
            low,
            condition: items[0].weather[0].main,
            precipitation: avgPrecipitation,
          };
        });

      return {
        current,
        hourly,
        daily,
      };
    } catch (error) {
      console.error('Error in getWeather:', error);
      return null;
    }
  }

  getLocationName(): string {
    return this.UOM_LOCATION.name;
  }
}

// Export singleton instance
export const weatherService = new WeatherService();
export type { WeatherData, HourlyForecast, DailyForecast, WeatherResponse };
