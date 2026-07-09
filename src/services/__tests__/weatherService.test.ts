import { weatherService, WeatherResponse } from '../weatherService';

const sampleWeather: WeatherResponse = {
  current: {
    temperature: 29,
    condition: 'Clouds',
    humidity: 78,
    windSpeed: 12,
    feelsLike: 32,
    pressure: 1010,
    visibility: 10,
    uvIndex: -1,
    sunrise: '6:02 AM',
    sunset: '6:24 PM',
  },
  hourly: [
    {
      time: '3:00 PM',
      temperature: 29,
      condition: 'Clouds',
      precipitation: 30,
    },
  ],
  daily: [
    {
      day: 'Thursday',
      high: 31,
      low: 26,
      condition: 'Rain',
      precipitation: 60,
    },
  ],
};

describe('weatherService.getWeather', () => {
  const originalFetch = global.fetch;
  const originalWarn = console.warn;

  beforeEach(() => {
    console.warn = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    console.warn = originalWarn;
  });

  it('returns parsed weather data from the backend', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => sampleWeather,
    });
    global.fetch = fetchMock as jest.Mock;

    await expect(weatherService.getWeather()).resolves.toEqual(sampleWeather);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/weather/current',
      expect.objectContaining({
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })
    );
  });

  it('returns null when the backend responds with an error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    }) as jest.Mock;

    await expect(weatherService.getWeather()).resolves.toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      'Weather service returned 500 Internal Server Error'
    );
  });

  it('returns null without logging a raw fetch TypeError stack when fetch rejects', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch')) as jest.Mock;

    await expect(weatherService.getWeather()).resolves.toBeNull();
    expect(console.warn).toHaveBeenCalledWith('Weather service is unavailable');
  });

  it('returns null when the backend response shape is invalid', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ current: sampleWeather.current }),
    }) as jest.Mock;

    await expect(weatherService.getWeather()).resolves.toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      'Weather service returned an unexpected response shape'
    );
  });
});
