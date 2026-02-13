import { NetworkError, CityNotFoundError, ApiError } from '../utils/errors';
import { getGeocodingUrl, getWeatherUrl } from '../config/api';
import { CITY_POPULATION_THRESHOLDS } from '../constants/text';

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

// Extend the validation interface with originalName for API layer
export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  population?: number;
  originalName?: string; // Preserve user's input
}

export interface GeocodingApiResponse {
  results?: GeocodingResult[];
  generationtime_ms?: number;
}

/**
 * Fetches city suggestions for autocomplete
 * @param query - Partial city name to search for
 * @returns Array of matching cities
 */
export async function getCitySuggestions(query: string): Promise<GeocodingResult[]> {
  if (!query.trim() || query.trim().length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      `${getGeocodingUrl()}?name=${encodeURIComponent(query.trim())}&count=10&language=en&format=json`
    );
    
    if (!response.ok) {
      return [];
    }

    const data: GeocodingApiResponse = await response.json();
    return data.results || [];
  } catch {
    return [];
  }
}

export async function getCoordinates(city: string): Promise<GeocodingResult> {
  if (!city?.trim()) {
    throw new CityNotFoundError();
  }

  const trimmedCity = city.trim();
  
  try {
    const response = await fetch(
      `${getGeocodingUrl()}?name=${encodeURIComponent(trimmedCity)}&count=10&language=en&format=json`
    );
    
    if (!response.ok) {
      throw new NetworkError();
    }
    
    const data: GeocodingApiResponse = await response.json();
    
    if (!data.results?.length) {
      throw new CityNotFoundError();
    }
    
    // Find the best major city match
    const bestResult = findBestMajorCity(data.results);
    
    if (!bestResult) {
      throw new CityNotFoundError();
    }
    
    return {
      ...bestResult,
      originalName: trimmedCity,
    };
    
  } catch (error) {
    if (error instanceof CityNotFoundError) throw error;
    throw new NetworkError();
  }
}

// Intelligent city selection prioritizing exact matches over population
function findBestMajorCity(results: GeocodingResult[]): GeocodingResult | null {
  if (!results.length) return null;
  
  // Strategy 1: Look for exact name matches first (case-insensitive)
  const exactMatches = results.filter(result => 
    result.name.toLowerCase() === results[0].name.toLowerCase()
  );
  
  if (exactMatches.length > 0) {
    // Among exact matches, prefer those with population data and larger populations
    const exactMatchesWithPop = exactMatches.filter(result => 
      result.population && result.population > CITY_POPULATION_THRESHOLDS.MIN_VALID
    );
    if (exactMatchesWithPop.length > 0) {
      return exactMatchesWithPop.reduce((largest, current) => 
        (current.population || 0) > (largest.population || 0) ? current : largest
      );
    }
    // If no population data, return first exact match
    return exactMatches[0];
  }
  
  // Strategy 2: Look for major cities (100K+ population)
  const majorCities = results.filter(result => 
    result.population && result.population >= CITY_POPULATION_THRESHOLDS.MAJOR_CITY
  );
  
  if (majorCities.length > 0) {
    return majorCities.reduce((largest, current) => 
      (current.population || 0) > (largest.population || 0) ? current : largest
    );
  }
  
  // Strategy 3: For smaller cities, prefer those with population data
  const citiesWithPopulation = results.filter(result => 
    result.population && result.population > CITY_POPULATION_THRESHOLDS.MIN_VALID
  );
  
  if (citiesWithPopulation.length > 0) {
    return citiesWithPopulation.reduce((largest, current) => 
      (current.population || 0) > (largest.population || 0) ? current : largest
    );
  }
  
  // Strategy 4: No good population data - return first result
  return results[0];
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
