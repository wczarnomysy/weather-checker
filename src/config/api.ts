/**
 * API configuration for external services
 */

const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1';
const WEATHER_BASE_URL = 'https://api.open-meteo.com/v1';

export const API_CONFIG = {
  geocoding: {
    baseUrl: GEOCODING_BASE_URL,
    endpoints: {
      search: '/search',
    },
  },
  weather: {
    baseUrl: WEATHER_BASE_URL,
    endpoints: {
      forecast: '/forecast',
    },
  },
} as const;

// Helper functions to build full URLs
export const getGeocodingUrl = () => 
  `${API_CONFIG.geocoding.baseUrl}${API_CONFIG.geocoding.endpoints.search}`;

export const getWeatherUrl = () => 
  `${API_CONFIG.weather.baseUrl}${API_CONFIG.weather.endpoints.forecast}`;
