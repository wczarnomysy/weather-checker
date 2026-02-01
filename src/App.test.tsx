import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import * as weatherApi from './api/weather';
import { NetworkError, ApiError } from './utils/errors';

// Mock the API module
jest.mock('./api/weather', () => ({
  getCoordinates: jest.fn(),
  getWeather: jest.fn(),
  getWeatherDescription: jest.fn((code: number) => {
    if (code === 0) return 'Clear sky';
    if (code >= 1 && code <= 3) return 'Partly cloudy';
    if (code >= 45 && code <= 48) return 'Fog';
    if (code >= 51 && code <= 67) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Unknown';
  }),
}));

const mockedGetCoordinates = weatherApi.getCoordinates as jest.MockedFunction<typeof weatherApi.getCoordinates>;
const mockedGetWeather = weatherApi.getWeather as jest.MockedFunction<typeof weatherApi.getWeather>;

describe('App', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Create a new QueryClient for each test to ensure isolation
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  const renderApp = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
  };

  describe('Initial Render', () => {
    it('should render the app title', () => {
      renderApp();
      expect(screen.getByText('WeatherChecker')).toBeTruthy();
    });

    it('should render the subtitle', () => {
      renderApp();
      expect(screen.getByText('Instant global weather forecast')).toBeTruthy();
    });

    it('should render the search instruction', () => {
      renderApp();
      expect(screen.getByText('Search for a city to see the weather')).toBeTruthy();
    });

    it('should render the search bar', () => {
      renderApp();
      expect(screen.getByPlaceholderText('London, Tokyo, New York...')).toBeTruthy();
    });

    it('should render the search button', () => {
      renderApp();
      expect(screen.getByRole('button', { name: 'Search' })).toBeTruthy();
    });

    it('should not show weather card initially', () => {
      renderApp();
      expect(screen.queryByText('Wind')).toBeNull();
    });

    it('should not show error message initially', () => {
      renderApp();
      expect(screen.queryByText(/unable to connect/i)).toBeNull();
    });

    it('should not show loading skeleton initially', () => {
      renderApp();
      expect(screen.queryByTestId('weather-card-skeleton')).toBeNull();
    });
  });

  describe('Successful Weather Search', () => {
    const mockGeoData = {
      id: 1,
      name: 'London',
      latitude: 51.5074,
      longitude: -0.1278,
      country: 'United Kingdom',
    };

    const mockWeatherData = {
      temperature: 20,
      windSpeed: 15,
      weatherCode: 0,
      humidity: 65,
      feelsLike: 18,
    };

    beforeEach(() => {
      mockedGetCoordinates.mockResolvedValue(mockGeoData);
      mockedGetWeather.mockResolvedValue(mockWeatherData);
    });

    it('should display weather data after successful search', async () => {
      const user = userEvent.setup();
      renderApp();

      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      const searchButton = screen.getByRole('button', { name: 'Search' });

      await user.type(input, 'London');
      await user.click(searchButton);

      // Wait for the weather temperature to appear (which means both queries completed)
      await waitFor(() => {
        expect(screen.getByText(/20/)).toBeTruthy();
      }, { timeout: 3000 });

      // Now check for city - use heading role
      expect(screen.getByRole('heading', { name: /London/i })).toBeTruthy();
      expect(screen.getByText(/United Kingdom/i)).toBeTruthy();
    });

    it('should call getCoordinates with correct city name', async () => {
      const user = userEvent.setup();
      renderApp();

      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      const searchButton = screen.getByRole('button', { name: 'Search' });

      await user.type(input, 'Tokyo');
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockedGetCoordinates).toHaveBeenCalledWith('Tokyo');
      });
    });

    it('should call getWeather with correct coordinates', async () => {
      const user = userEvent.setup();
      renderApp();

      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      const searchButton = screen.getByRole('button', { name: 'Search' });

      await user.type(input, 'London');
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockedGetWeather).toHaveBeenCalledWith(51.5074, -0.1278);
      });
    });

    it('should display all weather details', async () => {
      const user = userEvent.setup();
      renderApp();

      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      const searchButton = screen.getByRole('button', { name: 'Search' });

      await user.type(input, 'London');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Wind')).toBeTruthy();
      });

      expect(screen.getByText('Humidity')).toBeTruthy();
      expect(screen.getByText(/Feels like/)).toBeTruthy();
      expect(screen.getByText(/15.*km\/h/)).toBeTruthy();
      expect(screen.getByText(/65/)).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should display network error', async () => {
      mockedGetCoordinates.mockRejectedValue(new NetworkError());
      
      const user = userEvent.setup();
      renderApp();

      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      const searchButton = screen.getByRole('button', { name: 'Search' });

      await user.type(input, 'London');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Unable to connect. Please try again.')).toBeTruthy();
      });
    });

    it('should display API error from weather service', async () => {
      const mockGeoData = {
        id: 1,
        name: 'London',
        latitude: 51.5074,
        longitude: -0.1278,
        country: 'United Kingdom',
      };

      mockedGetCoordinates.mockResolvedValue(mockGeoData);
      mockedGetWeather.mockRejectedValue(new ApiError());
      
      const user = userEvent.setup();
      renderApp();

      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      const searchButton = screen.getByRole('button', { name: 'Search' });

      await user.type(input, 'London');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Cannot reach weather service. Please try again.')).toBeTruthy();
      });
    });

    it('should not show error when weather data is displayed', async () => {
      const mockGeoData = {
        id: 1,
        name: 'London',
        latitude: 51.5074,
        longitude: -0.1278,
        country: 'United Kingdom',
      };

      const mockWeatherData = {
        temperature: 20,
        windSpeed: 15,
        weatherCode: 0,
        humidity: 65,
        feelsLike: 18,
      };

      mockedGetCoordinates.mockResolvedValue(mockGeoData);
      mockedGetWeather.mockResolvedValue(mockWeatherData);
      
      const user = userEvent.setup();
      renderApp();

      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      const searchButton = screen.getByRole('button', { name: 'Search' });

      await user.type(input, 'London');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /London/i })).toBeTruthy();
      });

      // Should not show error when weather is displayed
      expect(screen.queryByText(/error/i)).toBeNull();
      expect(screen.queryByText(/unable to connect/i)).toBeNull();
    });

    it('should not show skeleton when error occurs', async () => {
      mockedGetCoordinates.mockRejectedValue(new NetworkError());
      
      const user = userEvent.setup();
      renderApp();

      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      const searchButton = screen.getByRole('button', { name: 'Search' });

      await user.type(input, 'London');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Unable to connect. Please try again.')).toBeTruthy();
      });

      expect(screen.queryByTestId('weather-card-skeleton')).toBeNull();
    });
  });

  describe('Search Interaction', () => {
    it('should submit search when pressing Enter', async () => {
      const mockGeoData = {
        id: 1,
        name: 'Paris',
        latitude: 48.8566,
        longitude: 2.3522,
        country: 'France',
      };

      const mockWeatherData = {
        temperature: 22,
        windSpeed: 10,
        weatherCode: 1,
        humidity: 70,
        feelsLike: 20,
      };

      mockedGetCoordinates.mockResolvedValue(mockGeoData);
      mockedGetWeather.mockResolvedValue(mockWeatherData);

      const user = userEvent.setup();
      renderApp();

      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      await user.type(input, 'Paris{Enter}');

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Paris/i })).toBeTruthy();
      });
    });

    it('should handle multiple searches', async () => {
      const mockGeoData1 = {
        id: 1,
        name: 'London',
        latitude: 51.5074,
        longitude: -0.1278,
        country: 'United Kingdom',
      };

      const mockGeoData2 = {
        id: 2,
        name: 'Tokyo',
        latitude: 35.6762,
        longitude: 139.6503,
        country: 'Japan',
      };

      const mockWeatherData = {
        temperature: 25,
        windSpeed: 12,
        weatherCode: 2,
        humidity: 60,
        feelsLike: 24,
      };

      const user = userEvent.setup();
      renderApp();

      // First search
      mockedGetCoordinates.mockResolvedValue(mockGeoData1);
      mockedGetWeather.mockResolvedValue(mockWeatherData);

      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      const searchButton = screen.getByRole('button', { name: 'Search' });

      await user.type(input, 'London');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /London/i })).toBeTruthy();
      });

      // Clear and search again
      await user.clear(input);
      
      mockedGetCoordinates.mockResolvedValue(mockGeoData2);
      
      await user.type(input, 'Tokyo');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Tokyo/i })).toBeTruthy();
      });

      expect(screen.getByText(/Japan/i)).toBeTruthy();
    });
  });

  describe('Component Integration', () => {
    it('should pass hasWeatherData prop to SearchBar when weather is displayed', async () => {
      const mockGeoData = {
        id: 1,
        name: 'London',
        latitude: 51.5074,
        longitude: -0.1278,
        country: 'United Kingdom',
      };

      const mockWeatherData = {
        temperature: 20,
        windSpeed: 15,
        weatherCode: 0,
        humidity: 65,
        feelsLike: 18,
      };

      mockedGetCoordinates.mockResolvedValue(mockGeoData);
      mockedGetWeather.mockResolvedValue(mockWeatherData);

      const user = userEvent.setup();
      renderApp();

      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      const searchButton = screen.getByRole('button', { name: 'Search' });

      await user.type(input, 'London');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /London/i })).toBeTruthy();
      });

      // Weather card should be visible
      expect(screen.getByText('Wind')).toBeTruthy();
    });
  });
});
