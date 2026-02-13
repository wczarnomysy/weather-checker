import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAutocomplete } from './useAutocomplete';
import React, { type ReactNode } from 'react';

// Mock fetch
const mockFetch = jest.fn<typeof fetch>();
global.fetch = mockFetch as any;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useAutocomplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  it('should return empty suggestions for empty query', () => {
    const { result } = renderHook(() => useAutocomplete(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.showSuggestions).toBe(false);
    expect(result.current.isLoadingSuggestions).toBe(false);
  });

  it('should return empty suggestions for short query', () => {
    const { result } = renderHook(() => useAutocomplete('Pa'), {
      wrapper: createWrapper(),
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.showSuggestions).toBe(false);
  });

  it('should not fetch for queries with numbers', () => {
    const { result } = renderHook(() => useAutocomplete('Paris123'), {
      wrapper: createWrapper(),
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.showSuggestions).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should debounce query and fetch suggestions', async () => {
    const mockResults = [
      {
        id: 1,
        name: 'Paris',
        latitude: 48.8566,
        longitude: 2.3522,
        country: 'France',
        population: 2161000,
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults }),
    } as Response);

    const { result } = renderHook(
      ({ query }) => useAutocomplete(query, { debounceDelay: 100 }),
      {
        wrapper: createWrapper(),
        initialProps: { query: 'Paris' },
      }
    );

    // Wait for debounce and fetch
    await waitFor(
      () => {
        expect(result.current.suggestions.length).toBeGreaterThan(0);
      },
      { timeout: 500 }
    );

    expect(result.current.suggestions[0].name).toBe('Paris');
  });

  it('should filter out cities with low population', async () => {
    const mockResults = [
      {
        id: 1,
        name: 'Paris',
        latitude: 48.8566,
        longitude: 2.3522,
        country: 'France',
        population: 2161000,
      },
      {
        id: 2,
        name: 'Paris',
        latitude: 40.0,
        longitude: -75.0,
        country: 'USA',
        population: 500, // Too small
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults }),
    } as Response);

    const { result } = renderHook(() => useAutocomplete('Paris', { debounceDelay: 100 }), {
      wrapper: createWrapper(),
    });

    await waitFor(
      () => {
        expect(result.current.suggestions.length).toBe(1);
      },
      { timeout: 500 }
    );

    expect(result.current.suggestions[0].population).toBeGreaterThan(1000);
  });

  it('should show noResults when no cities match', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);

    const { result } = renderHook(() => useAutocomplete('XYZ A', { debounceDelay: 50 }), {
      wrapper: createWrapper(),
    });

    // Wait longer for debounce (50ms) + query + state updates
    await waitFor(
      () => {
        expect(result.current.noResults).toBe(true);
      },
      { timeout: 2000 }
    );
  });

  it('should clear suggestions when disabled', () => {
    const { result, rerender } = renderHook(
      ({ disabled }) => useAutocomplete('Paris', { disabled }),
      {
        wrapper: createWrapper(),
        initialProps: { disabled: false },
      }
    );

    rerender({ disabled: true });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.showSuggestions).toBe(false);
  });

  it('should clearSuggestions when called', async () => {
    const mockResults = [
      {
        id: 1,
        name: 'Paris',
        latitude: 48.8566,
        longitude: 2.3522,
        country: 'France',
        population: 2161000,
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults }),
    } as Response);

    const { result } = renderHook(() => useAutocomplete('Paris', { debounceDelay: 100 }), {
      wrapper: createWrapper(),
    });

    await waitFor(
      () => {
        expect(result.current.suggestions.length).toBeGreaterThan(0);
      },
      { timeout: 500 }
    );

    act(() => {
      result.current.clearSuggestions();
    });

    expect(result.current.showSuggestions).toBe(false);
  });

  it('should handle highlighted index changes', () => {
    const { result } = renderHook(() => useAutocomplete(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.highlightedIndex).toBe(-1);

    act(() => {
      result.current.setHighlightedIndex(2);
    });

    expect(result.current.highlightedIndex).toBe(2);
  });
});
