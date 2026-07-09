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
  private readonly backendUrl = this.normalizeBackendUrl(process.env.NEXT_PUBLIC_API_URL);
  private readonly requestTimeoutMs = 8000;

  async getWeather(): Promise<WeatherResponse | null> {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller
      ? setTimeout(() => {
          controller.abort();
        }, this.requestTimeoutMs)
      : undefined;

    try {
      const response = await fetch(`${this.backendUrl}/api/weather/current`, {
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
        },
        signal: controller?.signal,
      });

      if (!response.ok) {
        console.warn(
          `Weather service returned ${response.status || 'an error'} ${response.statusText || ''}`.trim()
        );
        return null;
      }

      const data = await response.json();
      if (!this.isWeatherResponse(data)) {
        console.warn('Weather service returned an unexpected response shape');
        return null;
      }

      return data;
    } catch (error) {
      console.warn(
        this.isAbortError(error)
          ? 'Weather service request timed out'
          : 'Weather service is unavailable'
      );
      return null;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  private normalizeBackendUrl(url?: string): string {
    const fallbackUrl = 'http://localhost:8080';
    const normalized = (url || fallbackUrl).trim();
    return (normalized || fallbackUrl).replace(/\/+$/, '');
  }

  private isWeatherResponse(data: unknown): data is WeatherResponse {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const candidate = data as Partial<WeatherResponse>;
    return Boolean(
      candidate.current &&
        typeof candidate.current === 'object' &&
        Array.isArray(candidate.hourly) &&
        Array.isArray(candidate.daily)
    );
  }

  private isAbortError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error as { name?: string }).name === 'AbortError'
    );
  }
}

export const weatherService = new WeatherService();
export type { WeatherResponse, WeatherData, HourlyForecast, DailyForecast };
