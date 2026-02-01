export const APP_TEXT = {
  title: 'WeatherChecker',
  subtitle: 'Instant global weather forecast',
  searchInstruction: 'Search for a city to see the weather',
} as const;

export const SEARCH_TEXT = {
  placeholder: 'London, Tokyo, New York...',
  buttonText: 'Search',
  loadingSuggestions: 'Loading suggestions...',
  noSuggestionsFound: 'No suggestions found. Type the full city name and press Enter or click the Search button.',
} as const;

export const ERROR_TEXT = {
  generic: 'An error occurred.',
  cityWithNumbers: 'City names cannot contain numbers.',
  cityNotFound: 'City not found. Please check the spelling and try again.',
  networkError: 'Unable to connect. Please try again.',
  apiError: 'Cannot reach weather service. Please try again.',
} as const;

export const WEATHER_TEXT = {
  wind: 'Wind',
  humidity: 'Humidity',
  feelsLike: 'Feels like',
} as const;

export const AUTOCOMPLETE_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MIN_POPULATION: 10000,
  MAX_SUGGESTIONS: 3,
  DEBOUNCE_DELAY_MS: 300,
} as const;
