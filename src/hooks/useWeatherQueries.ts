import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { QUERY_CACHE_CONFIG } from '../config/query';
import { getCoordinates, getWeather, type GeocodingResult } from '../api/weather';

interface UseGeocodingOptions {
  city: string;
  selectedSuggestion: GeocodingResult | null;
}

/**
 * Custom hook for geocoding queries
 * Handles both direct city search and autocomplete suggestion selection
 */
export function useGeocoding({ city, selectedSuggestion }: UseGeocodingOptions) {
  const geoQueryOptions = useMemo(() => ({
    queryKey: ['geo', city, selectedSuggestion?.id] as const,
    queryFn: async () => {
      // Use direct suggestion if available (from autocomplete selection)
      if (selectedSuggestion) {
        return selectedSuggestion;
      }
      // Otherwise do normal geocoding search
      return getCoordinates(city);
    },
    enabled: Boolean(city || selectedSuggestion),
    retry: false,
    staleTime: QUERY_CACHE_CONFIG.STALE_TIME,
    gcTime: QUERY_CACHE_CONFIG.GC_TIME,
  }), [city, selectedSuggestion]);

  return useQuery(geoQueryOptions);
}

interface UseWeatherOptions {
  latitude?: number;
  longitude?: number;
  enabled?: boolean;
}

/**
 * Custom hook for weather data queries
 * Fetches weather data based on coordinates
 */
export function useWeather({ latitude, longitude, enabled = true }: UseWeatherOptions) {
  const weatherQueryOptions = useMemo(() => ({
    queryKey: ['weather', latitude, longitude] as const,
    queryFn: () => getWeather(latitude!, longitude!),
    enabled: Boolean(latitude && longitude && enabled),
    retry: false,
    staleTime: QUERY_CACHE_CONFIG.STALE_TIME,
    gcTime: QUERY_CACHE_CONFIG.GC_TIME,
  }), [latitude, longitude, enabled]);

  return useQuery(weatherQueryOptions);
}

/**
 * Combined hook that manages both geocoding and weather fetching
 * Provides a unified interface for the complete weather flow
 */
export function useWeatherFlow({ city, selectedSuggestion }: UseGeocodingOptions) {
  // First query to get coordinates
  const geoQuery = useGeocoding({ city, selectedSuggestion });
  
  // Second query to get weather (dependent on first)
  const weatherQuery = useWeather({
    latitude: geoQuery.data?.latitude,
    longitude: geoQuery.data?.longitude
  });

  // Simple derived state - no need for useMemo here
  return {
    isLoading: geoQuery.isLoading || weatherQuery.isLoading,
    error: geoQuery.error || weatherQuery.error,
    hasWeatherData: Boolean(weatherQuery.data),
    geoData: geoQuery.data,
    weatherData: weatherQuery.data,
    isGeoLoading: geoQuery.isLoading,
    isWeatherLoading: weatherQuery.isLoading,
    geoError: geoQuery.error,
    weatherError: weatherQuery.error
  };
}