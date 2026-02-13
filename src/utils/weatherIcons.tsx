import { Sun, Cloud, CloudRain, CloudSnow, Zap, CloudFog } from 'lucide-react';
import type { ReactElement } from 'react';

interface WeatherIconConfig {
  className?: string;
  strokeWidth?: number;
}

/**
 * Returns the appropriate weather icon component based on weather code
 * @param weatherCode - Weather condition code from the API
 * @param config - Optional configuration for icon styling
 * @returns JSX.Element - The weather icon component
 */
export function getWeatherIcon(
  weatherCode: number, 
  config: WeatherIconConfig = {}
): ReactElement {
  const { 
    className = "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-cyan-300",
    strokeWidth = 1.5
  } = config;

  // Clear sky
  if (weatherCode === 0) {
    return <Sun className={className} strokeWidth={strokeWidth} />;
  }

  // Partly cloudy to overcast
  if (weatherCode >= 1 && weatherCode <= 3) {
    return <Cloud className={className} strokeWidth={strokeWidth} />;
  }

  // Fog and mist
  if (weatherCode >= 45 && weatherCode <= 48) {
    return <CloudFog className={className} strokeWidth={strokeWidth} />;
  }

  // Drizzle and rain
  if (weatherCode >= 51 && weatherCode <= 67) {
    return <CloudRain className={className} strokeWidth={strokeWidth} />;
  }

  // Snow
  if (weatherCode >= 71 && weatherCode <= 77) {
    return <CloudSnow className={className} strokeWidth={strokeWidth} />;
  }

  // Thunderstorm
  if (weatherCode >= 95 && weatherCode <= 99) {
    return <Zap className={className} strokeWidth={strokeWidth} />;
  }

  // Default fallback
  return <Cloud className={className} strokeWidth={strokeWidth} />;
}