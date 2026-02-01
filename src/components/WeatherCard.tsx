import { getWeatherDescription } from '../api/weather';
import { WEATHER_TEXT } from '../constants/text';
import { Sun, Cloud, CloudRain, CloudSnow, Zap, CloudFog } from 'lucide-react';

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
  const description = getWeatherDescription(weatherCode);
  const iconClassName = "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-cyan-300";
  const strokeWidth = 1.5;

  return (
    <div className="glass-panel max-w-xl w-full mx-auto p-4 sm:p-6 md:p-8 text-center transition-transform duration-300 ease-in-out hover:scale-105 select-none fade-in">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 text-slate-300">{city}{country ? `, ${country}` : ''}</h2>
      
      {/* Weather Icon */}
      <div className="flex justify-center mb-4">
        {weatherCode === 0 && <Sun className={iconClassName} strokeWidth={strokeWidth} />}
        {weatherCode >= 1 && weatherCode <= 3 && <Cloud className={iconClassName} strokeWidth={strokeWidth} />}
        {weatherCode >= 45 && weatherCode <= 48 && <CloudFog className={iconClassName} strokeWidth={strokeWidth} />}
        {weatherCode >= 51 && weatherCode <= 67 && <CloudRain className={iconClassName} strokeWidth={strokeWidth} />}
        {weatherCode >= 71 && weatherCode <= 77 && <CloudSnow className={iconClassName} strokeWidth={strokeWidth} />}
        {weatherCode >= 95 && weatherCode <= 99 && <Zap className={iconClassName} strokeWidth={strokeWidth} />}
        {weatherCode > 99 && <Cloud className={iconClassName} strokeWidth={strokeWidth} />}
      </div>
      
      <div className="text-base sm:text-lg md:text-xl text-slate-300 capitalize mb-6 sm:mb-8">{description}</div>
      
      <div className="mb-6 sm:mb-8">
        <div className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-300 mb-2 leading-none">
          {Math.round(temperature)}°C
        </div>
        {feelsLike !== undefined && (
          <div className="text-sm sm:text-base md:text-lg text-slate-400">{WEATHER_TEXT.feelsLike} {Math.round(feelsLike)}°C</div>
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
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-300">{humidity}%</div>
          </div>
        )}
      </div>
    </div>
  );
}
