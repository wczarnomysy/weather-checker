import { NetworkError, CityNotFoundError, ApiError } from '../utils/errors';
import { getGeocodingUrl, getWeatherUrl } from '../config/api';

export interface WeatherData {
  current: {
    temperature: number;
    windSpeed: number;
    weatherCode: number;
    humidity?: number;
    feelsLike?: number;
  };
  location: string;
}

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  population?: number;
}

export interface GeocodingApiResponse {
  results?: GeocodingResult[];
  generationtime_ms?: number;
}

export async function getCoordinates(city: string): Promise<GeocodingResult> {
  let response;
  let data;
  
  try {
    response = await fetch(`${getGeocodingUrl()}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    data = await response.json();
  } catch {
    // Fetch failed (network error, CORS, etc.)
    throw new NetworkError();
  }
  
  // Check response status after successful fetch
  if (!response.ok) {
    throw new NetworkError();
  }
  
  // Check if city was found
  if (!data.results || data.results.length === 0) {
    throw new CityNotFoundError();
  }
  
  return data.results[0];
}

export async function getWeather(lat: number, lon: number): Promise<WeatherData['current']> {
  let response;
  let data;
  
  try {
    response = await fetch(`${getWeatherUrl()}?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,apparent_temperature`);
    data = await response.json();
  } catch {
    // Fetch failed (network error, CORS, etc.)
    throw new ApiError();
  }
  
  // Check response status after successful fetch
  if (!response.ok) {
    throw new ApiError();
  }
  
  return {
    temperature: data.current.temperature_2m,
    windSpeed: data.current.wind_speed_10m,
    weatherCode: data.current.weather_code,
    humidity: data.current.relative_humidity_2m,
    feelsLike: data.current.apparent_temperature,
  };
}

// Helper to map weather code to description/icon (simplified)
export function getWeatherDescription(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code >= 1 && code <= 3) return 'Partly cloudy';
  if (code >= 45 && code <= 48) return 'Fog';
  if (code >= 51 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Unknown';
}
