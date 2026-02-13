import { useState, useCallback } from 'react'
import { type GeocodingResult } from './api/weather'
import { SearchBar } from './components/SearchBar'
import { WeatherCard } from './components/WeatherCard'
import { WeatherCardSkeleton } from './components/WeatherCardSkeleton'
import { APP_TEXT } from './constants/text'
import { getErrorMessage } from './utils/errors'
import { useWeatherFlow } from './hooks/useWeatherQueries'

function App() {
  const [city, setCity] = useState('')
  const [selectedSuggestion, setSelectedSuggestion] = useState<GeocodingResult | null>(null)

  // Use the custom hook for all weather-related queries
  const {
    isLoading,
    error,
    hasWeatherData,
    geoData,
    weatherData
  } = useWeatherFlow({ city, selectedSuggestion });

  // Memoized event handlers to prevent unnecessary re-renders
  const handleSearch = useCallback((searchCity: string) => {
    setCity(searchCity);
    setSelectedSuggestion(null);
  }, []);

  const handleSuggestionSelect = useCallback((suggestion: GeocodingResult) => {
    setSelectedSuggestion(suggestion);
    setCity(''); // Clear city to prevent duplicate queries
  }, []);

  const handleInputChange = useCallback(() => {
    // Clear both city and suggestion state when input changes
    setCity('');
    setSelectedSuggestion(null);
  }, []);

  return (
    <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
          {APP_TEXT.title}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base md:text-lg">{APP_TEXT.subtitle}</p>
      </div>

      <p className="text-center text-slate-300 mb-3 text-sm sm:text-base">{APP_TEXT.searchInstruction}</p>

      <SearchBar 
        onSearch={handleSearch}
        onSuggestionSelect={handleSuggestionSelect}
        onInputChange={handleInputChange}
        isLoading={isLoading}
        hasWeatherData={hasWeatherData}
        searchError={error}
      />

      {isLoading && <WeatherCardSkeleton />}

      {error && !isLoading && !weatherData && (
        <div className="text-center mb-6 fade-in">
            <div className="text-red-400 bg-red-400/10 px-4 py-2 sm:px-4 sm:py-3 rounded-lg inline-block text-sm sm:text-base">
                {getErrorMessage(error)}
            </div>
        </div>
      )}

      {weatherData && geoData && !error && (
        <WeatherCard
          temperature={weatherData.temperature}
          windSpeed={weatherData.windSpeed}
          weatherCode={weatherData.weatherCode}
          city={geoData.name}
          country={geoData.country}
          humidity={weatherData.humidity}
          feelsLike={weatherData.feelsLike}
        />
      )}
    </div>
  )
}

export default App
