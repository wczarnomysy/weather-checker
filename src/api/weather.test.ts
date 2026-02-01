import { describe, it, expect, afterEach, jest } from '@jest/globals';
import { getCoordinates, getWeather, getWeatherDescription } from './weather';
import { NetworkError, CityNotFoundError, ApiError } from '../utils/errors';

// Mock the config module
jest.mock('../config/api', () => ({
  getGeocodingUrl: () => 'https://geocoding-api.test',
  getWeatherUrl: () => 'https://weather-api.test',
}));

// Store original fetch
const originalFetch = global.fetch;

describe('weather API', () => {
  afterEach(() => {
    // Restore fetch after each test
    global.fetch = originalFetch;
  });

  describe('getCoordinates', () => {
    it('should return coordinates for a valid city', async () => {
      const mockResponse = {
        results: [
          {
            id: 1,
            name: 'London',
            latitude: 51.5074,
            longitude: -0.1278,
            country: 'United Kingdom',
            population: 9000000,
          },
        ],
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockResponse,
        } as Response)
      ) as any;

      const result = await getCoordinates('London');

      expect(result).toEqual(mockResponse.results[0]);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('name=London')
      );
    });

    it('should encode city name in URL', async () => {
      const mockResponse = {
        results: [
          {
            id: 1,
            name: 'New York',
            latitude: 40.7128,
            longitude: -74.006,
            country: 'United States',
          },
        ],
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockResponse,
        } as Response)
      ) as any;

      await getCoordinates('New York');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('name=New%20York')
      );
    });

    it('should throw NetworkError when fetch fails', async () => {
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network failure'))
      ) as any;

      await expect(getCoordinates('London')).rejects.toThrow(NetworkError);
    });

    it('should throw NetworkError when response is not ok', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: async () => ({}),
        } as Response)
      ) as any;

      await expect(getCoordinates('London')).rejects.toThrow(NetworkError);
    });

    it('should throw CityNotFoundError when no results', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ results: [] }),
        } as Response)
      ) as any;

      await expect(getCoordinates('InvalidCity')).rejects.toThrow(CityNotFoundError);
    });

    it('should throw CityNotFoundError when results is undefined', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({}),
        } as Response)
      ) as any;

      await expect(getCoordinates('InvalidCity')).rejects.toThrow(CityNotFoundError);
    });

    it('should return first result when multiple results', async () => {
      const mockResponse = {
        results: [
          {
            id: 1,
            name: 'London',
            latitude: 51.5074,
            longitude: -0.1278,
            country: 'United Kingdom',
          },
          {
            id: 2,
            name: 'London',
            latitude: 42.9834,
            longitude: -81.233,
            country: 'Canada',
          },
        ],
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockResponse,
        } as Response)
      ) as any;

      const result = await getCoordinates('London');

      expect(result).toEqual(mockResponse.results[0]);
      expect(result.country).toBe('United Kingdom');
    });

    it('should include all query parameters in request', async () => {
      const mockResponse = {
        results: [
          {
            id: 1,
            name: 'Tokyo',
            latitude: 35.6762,
            longitude: 139.6503,
            country: 'Japan',
          },
        ],
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockResponse,
        } as Response)
      ) as any;

      await getCoordinates('Tokyo');

      const fetchCall = (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls[0][0] as string;
      expect(fetchCall).toContain('count=1');
      expect(fetchCall).toContain('language=en');
      expect(fetchCall).toContain('format=json');
    });
  });

  describe('getWeather', () => {
    it('should return weather data for valid coordinates', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 20.5,
          wind_speed_10m: 15.2,
          weather_code: 0,
          relative_humidity_2m: 65,
          apparent_temperature: 18.3,
        },
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockResponse,
        } as Response)
      ) as any;

      const result = await getWeather(51.5074, -0.1278);

      expect(result).toEqual({
        temperature: 20.5,
        windSpeed: 15.2,
        weatherCode: 0,
        humidity: 65,
        feelsLike: 18.3,
      });
    });

    it('should include latitude and longitude in request', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 20,
          wind_speed_10m: 15,
          weather_code: 0,
          relative_humidity_2m: 65,
          apparent_temperature: 18,
        },
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockResponse,
        } as Response)
      ) as any;

      await getWeather(40.7128, -74.006);

      const fetchCall = (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls[0][0] as string;
      expect(fetchCall).toContain('latitude=40.7128');
      expect(fetchCall).toContain('longitude=-74.006');
    });

    it('should include all required weather parameters', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 20,
          wind_speed_10m: 15,
          weather_code: 0,
          relative_humidity_2m: 65,
          apparent_temperature: 18,
        },
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockResponse,
        } as Response)
      ) as any;

      await getWeather(51.5074, -0.1278);

      const fetchCall = (global.fetch as jest.MockedFunction<typeof fetch>).mock.calls[0][0] as string;
      expect(fetchCall).toContain('temperature_2m');
      expect(fetchCall).toContain('weather_code');
      expect(fetchCall).toContain('wind_speed_10m');
      expect(fetchCall).toContain('relative_humidity_2m');
      expect(fetchCall).toContain('apparent_temperature');
    });

    it('should throw ApiError when fetch fails', async () => {
      global.fetch = jest.fn(() =>
        Promise.reject(new Error('Network failure'))
      ) as any;

      await expect(getWeather(51.5074, -0.1278)).rejects.toThrow(ApiError);
    });

    it('should throw ApiError when response is not ok', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: async () => ({}),
        } as Response)
      ) as any;

      await expect(getWeather(51.5074, -0.1278)).rejects.toThrow(ApiError);
    });

    it('should map API response field names to our domain model', async () => {
      const mockResponse = {
        current: {
          temperature_2m: 25,
          wind_speed_10m: 10,
          weather_code: 1,
          relative_humidity_2m: 70,
          apparent_temperature: 24,
        },
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockResponse,
        } as Response)
      ) as any;

      const result = await getWeather(35.6762, 139.6503);

      // Verify field mapping
      expect(result).toHaveProperty('temperature');
      expect(result).toHaveProperty('windSpeed');
      expect(result).toHaveProperty('weatherCode');
      expect(result).toHaveProperty('humidity');
      expect(result).toHaveProperty('feelsLike');

      // Verify no API field names leaked
      expect(result).not.toHaveProperty('temperature_2m');
      expect(result).not.toHaveProperty('wind_speed_10m');
    });
  });

  describe('getWeatherDescription', () => {
    it('should return "Clear sky" for code 0', () => {
      expect(getWeatherDescription(0)).toBe('Clear sky');
    });

    it('should return "Partly cloudy" for codes 1-3', () => {
      expect(getWeatherDescription(1)).toBe('Partly cloudy');
      expect(getWeatherDescription(2)).toBe('Partly cloudy');
      expect(getWeatherDescription(3)).toBe('Partly cloudy');
    });

    it('should return "Fog" for codes 45-48', () => {
      expect(getWeatherDescription(45)).toBe('Fog');
      expect(getWeatherDescription(46)).toBe('Fog');
      expect(getWeatherDescription(47)).toBe('Fog');
      expect(getWeatherDescription(48)).toBe('Fog');
    });

    it('should return "Rain" for codes 51-67', () => {
      expect(getWeatherDescription(51)).toBe('Rain');
      expect(getWeatherDescription(60)).toBe('Rain');
      expect(getWeatherDescription(67)).toBe('Rain');
    });

    it('should return "Snow" for codes 71-77', () => {
      expect(getWeatherDescription(71)).toBe('Snow');
      expect(getWeatherDescription(75)).toBe('Snow');
      expect(getWeatherDescription(77)).toBe('Snow');
    });

    it('should return "Thunderstorm" for codes 95-99', () => {
      expect(getWeatherDescription(95)).toBe('Thunderstorm');
      expect(getWeatherDescription(96)).toBe('Thunderstorm');
      expect(getWeatherDescription(99)).toBe('Thunderstorm');
    });

    it('should return "Unknown" for invalid codes', () => {
      expect(getWeatherDescription(-1)).toBe('Unknown');
      expect(getWeatherDescription(100)).toBe('Unknown');
      expect(getWeatherDescription(50)).toBe('Unknown');
      expect(getWeatherDescription(4)).toBe('Unknown');
    });

    it('should handle boundary values correctly', () => {
      expect(getWeatherDescription(0)).toBe('Clear sky');
      expect(getWeatherDescription(1)).toBe('Partly cloudy');
      expect(getWeatherDescription(3)).toBe('Partly cloudy');
      expect(getWeatherDescription(4)).toBe('Unknown');
      
      expect(getWeatherDescription(44)).toBe('Unknown');
      expect(getWeatherDescription(45)).toBe('Fog');
      expect(getWeatherDescription(48)).toBe('Fog');
      expect(getWeatherDescription(49)).toBe('Unknown');
    });
  });
});
