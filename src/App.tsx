import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCoordinates, getWeather } from './api/weather'
import { SearchBar } from './components/SearchBar'
import { WeatherCard } from './components/WeatherCard'
import { WeatherCardSkeleton } from './components/WeatherCardSkeleton'
import { APP_TEXT } from './constants/text'
import { getErrorMessage } from './utils/errors'

function App() {
  const [city, setCity] = useState('')

  // First query to get coordinates
  const { data: geoData, isLoading: isGeoLoading, error: geoError } = useQuery({
    queryKey: ['geo', city],
    queryFn: () => getCoordinates(city),
    enabled: !!city,
    retry: false,
    networkMode: 'always',
    staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep in cache for 10 minutes
  })

  // Second query to get weather (dependent on first)
  const { data: weather, isLoading: isWeatherLoading, error: weatherError } = useQuery({
    queryKey: ['weather', geoData?.latitude, geoData?.longitude],
    queryFn: () => getWeather(geoData!.latitude, geoData!.longitude),
    enabled: !!geoData,
    retry: false,
    networkMode: 'always',
    staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
    gcTime: 10 * 60 * 1000,   // Keep in cache for 10 minutes
  })

  // Determine overall loading/error state
  const isLoading = isGeoLoading || isWeatherLoading
  // Simplistic error handling
  const error = geoError || weatherError

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
        onSearch={setCity} 
        onInputChange={() => setCity('')}
        isLoading={isLoading}
        hasWeatherData={!!weather}
        searchError={error}
      />

      {isLoading && <WeatherCardSkeleton />}

      {error && !isLoading && !weather && (
        <div className="text-center mb-6 fade-in">
            <div className="text-red-400 bg-red-400/10 px-4 py-2 sm:px-4 sm:py-3 rounded-lg inline-block text-sm sm:text-base">
                {getErrorMessage(error)}
            </div>
        </div>
      )}

      {weather && geoData && !error && (
        <WeatherCard
          temperature={weather.temperature}
          windSpeed={weather.windSpeed}
          weatherCode={weather.weatherCode}
          city={geoData.name}
          country={geoData.country}
          humidity={weather.humidity}
          feelsLike={weather.feelsLike}
        />
      )}
    </div>
  )
}

export default App
