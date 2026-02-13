import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGeocoding, useWeather, useWeatherFlow } from './useWeatherQueries';
import React, { type ReactNode } from 'react';
import * as weatherApi from '../api/weather';

// Mock the API
jest.mock('../api/weather');

const mockedGetCoordinates = weatherApi.getCoordinates as jest.MockedFunction<typeof weatherApi.getCoordinates>;
const mockedGetWeather = weatherApi.getWeather as jest.MockedFunction<typeof weatherApi.getWeather>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useGeocoding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not fetch when no city or suggestion provided', () => {
    const { result } = renderHook(
      () => useGeocoding({ city: '', selectedSuggestion: null }),
      { wrapper: createWrapper() }
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should fetch coordinates when city is provided', async () => {
    const mockGeoData = {
      id: 1,
      name: 'London',
      latitude: 51.5074,
      longitude: -0.1278,
      country: 'United Kingdom',
    };

    mockedGetCoordinates.mockResolvedValueOnce(mockGeoData);

    const { result } = renderHook(() => useGeocoding({ city: 'London', selectedSuggestion: null }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockGeoData);
    });
  });

  it('should use selectedSuggestion directly without fetching', async () => {
    const mockSuggestion = {
      id: 1,
      name: 'Paris',
      latitude: 48.8566,
      longitude: 2.3522,
      country: 'France',
    };

    const { result } = renderHook(
      () => useGeocoding({ city: '', selectedSuggestion: mockSuggestion }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockSuggestion);
    });

    expect(weatherApi.getCoordinates).not.toHaveBeenCalled();
  });

  it('should prefer selectedSuggestion over city', async () => {
    const mockSuggestion = {
      id: 1,
      name: 'Paris',
      latitude: 48.8566,
      longitude: 2.3522,
      country: 'France',
    };

    const { result } = renderHook(
      () => useGeocoding({ city: 'London', selectedSuggestion: mockSuggestion }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockSuggestion);
    });

    expect(weatherApi.getCoordinates).not.toHaveBeenCalled();
  });
});

describe('useWeather', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not fetch when coordinates are missing', () => {
    const { result } = renderHook(() => useWeather({ latitude: undefined, longitude: undefined }), {
      wrapper: createWrapper(),
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should fetch weather when coordinates are provided', async () => {
    const mockWeatherData = {
      temperature: 20,
      windSpeed: 10,
      weatherCode: 0,
      humidity: 65,
      feelsLike: 19,
    };

    mockedGetWeather.mockResolvedValueOnce(mockWeatherData);

    const { result } = renderHook(() => useWeather({ latitude: 51.5074, longitude: -0.1278 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockWeatherData);
    });

    expect(weatherApi.getWeather).toHaveBeenCalledWith(51.5074, -0.1278);
  });

  it('should respect enabled flag', () => {
    const { result } = renderHook(
      () => useWeather({ latitude: 51.5074, longitude: -0.1278, enabled: false }),
      { wrapper: createWrapper() }
    );

    expect(result.current.data).toBeUndefined();
    expect(weatherApi.getWeather).not.toHaveBeenCalled();
  });
});

describe('useWeatherFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useWeatherFlow({ city: '', selectedSuggestion: null }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.geoData).toBeUndefined();
    expect(result.current.weatherData).toBeUndefined();
  });

  it('should fetch geocoding and weather data in sequence', async () => {
    const mockGeoData = {
      id: 1,
      name: 'London',
      latitude: 51.5074,
      longitude: -0.1278,
      country: 'United Kingdom',
    };

    const mockWeatherData = {
      temperature: 20,
      windSpeed: 10,
      weatherCode: 0,
      humidity: 65,
      feelsLike: 19,
    };

    mockedGetCoordinates.mockResolvedValueOnce(mockGeoData);
    mockedGetWeather.mockResolvedValueOnce(mockWeatherData);

    const { result } = renderHook(() => useWeatherFlow({ city: 'London', selectedSuggestion: null }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.geoData).toEqual(mockGeoData);
    });

    await waitFor(() => {
      expect(result.current.weatherData).toEqual(mockWeatherData);
    });

    expect(result.current.hasWeatherData).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle geocoding errors', async () => {
    const mockError = new Error('City not found');
    mockedGetCoordinates.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useWeatherFlow({ city: 'InvalidCity', selectedSuggestion: null }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.geoData).toBeUndefined();
    expect(result.current.weatherData).toBeUndefined();
  });

  it('should provide separate loading states', async () => {
    const mockGeoData = {
      id: 1,
      name: 'London',
      latitude: 51.5074,
      longitude: -0.1278,
      country: 'United Kingdom',
    };

    mockedGetCoordinates.mockResolvedValueOnce(mockGeoData);
    mockedGetWeather.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    const { result } = renderHook(() => useWeatherFlow({ city: 'London', selectedSuggestion: null }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isGeoLoading).toBe(false);
    });

    expect(result.current.isWeatherLoading).toBe(true);
  });
});
