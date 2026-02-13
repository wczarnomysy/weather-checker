import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { SearchBar } from './SearchBar';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    React.createElement(QueryClientProvider, { client: testQueryClient }, component)
  );
};

describe('SearchBar', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render input field with correct placeholder', () => {
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      expect(input).toBeTruthy();
    });

    it('should render search button', () => {
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} />);
      
      const button = screen.getByRole('button', { name: 'Search' });
      expect(button).toBeTruthy();
    });

    it('should disable button when input is empty', () => {
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} />);
      
      const button = screen.getByRole('button', { name: 'Search' });
      expect(button).toHaveProperty('disabled', true);
    });

    it('should disable input and button when isLoading is true', () => {
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} isLoading={true} />);
      
      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      const button = screen.getByRole('button', { name: 'Search' });
      
      expect(input).toHaveProperty('disabled', true);
      expect(button).toHaveProperty('disabled', true);
    });
  });

  describe('Form Submission', () => {
    it('should call onSearch with trimmed city name on submit', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      const button = screen.getByRole('button', { name: 'Search' });
      
      await user.type(input, 'London');
      await user.click(button);
      
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('London');
    });

    it('should trim whitespace before submitting', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      await user.type(input, '  Paris  ');
      await user.keyboard('{Enter}');
      
      expect(mockOnSearch).toHaveBeenCalledWith('Paris');
    });

    it('should not submit when query is empty', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} />);
      
      const button = screen.getByRole('button', { name: 'Search' });
      await user.click(button);
      
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should not submit when query contains only whitespace', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      await user.type(input, '   ');
      await user.keyboard('{Enter}');
      
      expect(mockOnSearch).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should show error when city name contains numbers', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      await user.type(input, 'City123');
      await user.keyboard('{Enter}');
      
      expect(screen.getByText('Please enter a valid city name without numbers')).toBeTruthy();
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should clear error message when user starts typing', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      
      // Trigger error
      await user.type(input, 'City123');
      await user.keyboard('{Enter}');
      expect(screen.getByText('Please enter a valid city name without numbers')).toBeTruthy();
      
      // Start typing again
      await user.clear(input);
      await user.type(input, 'L');
      
      expect(screen.queryByText('Please enter a valid city name without numbers')).toBeNull();
    });
  });

  describe('Input Change Callback', () => {
    it('should call onInputChange when user types', async () => {
      const user = userEvent.setup();
      const mockOnInputChange = jest.fn();
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} onInputChange={mockOnInputChange} />);
      
      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      await user.type(input, 'L');
      
      expect(mockOnInputChange).toHaveBeenCalled();
    });

    it('should not call onInputChange when callback is not provided', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      
      // Should not throw error
      await user.type(input, 'London');
      expect(mockOnSearch).toBeDefined();
    });
  });

  describe('Button State', () => {
    it('should enable button when input has value', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      const button = screen.getByRole('button', { name: 'Search' });
      
      expect(button).toHaveProperty('disabled', true);
      
      await user.type(input, 'L');
      
      expect(button).toHaveProperty('disabled', false);
    });

    it('should keep button disabled when loading', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} isLoading={true} />);
      
      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      const button = screen.getByRole('button', { name: 'Search' });
      
      await user.type(input, 'London');
      
      expect(button).toHaveProperty('disabled', true);
    });
  });

  describe('Autocomplete Behavior', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should not fetch suggestions for queries shorter than 2 characters', async () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch as any;
      
      const user = userEvent.setup({ delay: null });
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      await user.type(input, 'L');
      
      jest.advanceTimersByTime(300);
      
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should not show autocomplete when hasWeatherData is true', async () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch as any;
      
      const user = userEvent.setup({ delay: null });
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} hasWeatherData={true} />);
      
      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      await user.type(input, 'London');
      
      jest.advanceTimersByTime(300);
      
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should not show autocomplete when isLoading is true', async () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch as any;
      
      const user = userEvent.setup({ delay: null });
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} isLoading={true} />);
      
      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      await user.type(input, 'London');
      
      jest.advanceTimersByTime(300);
      
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should not trigger autocomplete for queries with numbers', async () => {
      const mockFetch = jest.fn();
      global.fetch = mockFetch as any;
      
      const user = userEvent.setup({ delay: null });
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      await user.type(input, 'City123');
      
      jest.advanceTimersByTime(300);
      
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should submit form when Enter is pressed in input', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      await user.type(input, 'Tokyo{Enter}');
      
      expect(mockOnSearch).toHaveBeenCalledWith('Tokyo');
    });
  });

  describe('Edge Cases', () => {
    it('should reject very long city names', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} />);
      
      const longCityName = 'A'.repeat(100);
      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      
      await user.type(input, longCityName);
      await user.keyboard('{Enter}');
      
      // Should show validation error for too long
      expect(screen.getByText('City name is too long')).toBeTruthy();
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should reject special unicode characters in city names', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      await user.type(input, "Saint-Jean-d'Angély");
      await user.keyboard('{Enter}');
      
      // \u00e9 (é) is not in [a-zA-Z\s\-'], so validation should reject it
      expect(screen.getByText('Please enter a valid city name with only letters, spaces, hyphens, and apostrophes')).toBeTruthy();
      expect(mockOnSearch).not.toHaveBeenCalled();
    });

    it('should reject unicode characters', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SearchBar onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('London, Tokyo, New York...');
      await user.type(input, 'Москва'); // Moscow in Russian
      await user.keyboard('{Enter}');
      
      // Should show validation error - only Latin characters allowed
      expect(screen.getByText('Please enter a valid city name with only letters, spaces, hyphens, and apostrophes')).toBeTruthy();
      expect(mockOnSearch).not.toHaveBeenCalled();
    });
  });
});
