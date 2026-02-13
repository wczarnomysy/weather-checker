import { useMemo } from 'react';
import { getWeatherDescription } from '../api/weather';
import { WEATHER_TEXT } from '../constants/text';
import { getWeatherIcon } from '../utils/weatherIcons';
import { formatCityDisplayName } from '../utils/validation';

interface WeatherCardProps {
  temperature: number;
  windSpeed: number;
  weatherCode: number;
  city: string;
  country?: string;
  humidity?: number;
  feelsLike?: number;
}

export function WeatherCard({ temperature, windSpeed, weatherCode, city, country, humidity, feelsLike }: WeatherCardProps) {
  // Memoize computed values to prevent recalculation on every render
  const weatherInfo = useMemo(() => ({
    description: getWeatherDescription(weatherCode),
    roundedTemp: Math.round(temperature),
    roundedFeelsLike: feelsLike !== undefined ? Math.round(feelsLike) : undefined,
    locationDisplay: formatCityDisplayName(city, country),
    humidityDisplay: humidity !== undefined ? `${humidity}%` : '--'
  }), [weatherCode, temperature, feelsLike, city, country, humidity]);

  return (
    <div className="glass-panel max-w-xl w-full mx-auto p-4 sm:p-6 md:p-8 text-center transition-transform duration-300 ease-in-out [@media(hover:hover)]:hover:scale-105 select-none fade-in">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 text-slate-300">{weatherInfo.locationDisplay}</h2>
      
      {/* Weather Icon */}
      <div className="flex justify-center mb-4">
        {getWeatherIcon(weatherCode, {
          className: "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-cyan-300",
          strokeWidth: 1.5
        })}
      </div>
      
      <div className="text-base sm:text-lg md:text-xl text-slate-300 capitalize mb-6 sm:mb-8">{weatherInfo.description}</div>
      
      <div className="mb-6 sm:mb-8">
        <div className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-300 mb-2 leading-none">
          {weatherInfo.roundedTemp}°C
        </div>
        {weatherInfo.roundedFeelsLike !== undefined && (
          <div className="text-sm sm:text-base md:text-lg text-slate-400">{WEATHER_TEXT.feelsLike} {weatherInfo.roundedFeelsLike}°C</div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 max-w-sm mx-auto">
        <div className="glass-panel p-3 sm:p-4 rounded-xl">
          <div className="text-xs sm:text-sm uppercase tracking-wider text-slate-400 mb-1 sm:mb-2">{WEATHER_TEXT.wind}</div>
          <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-300">{windSpeed} km/h</div>
        </div>
        {humidity !== undefined && (
          <div className="glass-panel p-3 sm:p-4 rounded-xl">
            <div className="text-xs sm:text-sm uppercase tracking-wider text-slate-400 mb-1 sm:mb-2">{WEATHER_TEXT.humidity}</div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-300">
              {weatherInfo.humidityDisplay}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
