import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AUTOCOMPLETE_CONFIG } from '../constants/text';
import { QUERY_CACHE_CONFIG } from '../config/query';
import { getCitySuggestions } from '../api/weather';
import type { GeocodingResult } from '../api/weather';

interface UseAutocompleteOptions {
  minQueryLength?: number;
  maxSuggestions?: number;
  debounceDelay?: number;
  minPopulation?: number;
  disabled?: boolean;
}

interface UseAutocompleteReturn {
  suggestions: GeocodingResult[];
  showSuggestions: boolean;
  isLoadingSuggestions: boolean;
  noResults: boolean;
  highlightedIndex: number;
  setHighlightedIndex: (index: number) => void;
  setShowSuggestions: (show: boolean) => void;
  clearSuggestions: () => void;
}

export function useAutocomplete(
  query: string,
  options: UseAutocompleteOptions = {}
): UseAutocompleteReturn {
  const {
    minQueryLength = AUTOCOMPLETE_CONFIG.MIN_QUERY_LENGTH,
    maxSuggestions = AUTOCOMPLETE_CONFIG.MAX_SUGGESTIONS,
    debounceDelay = AUTOCOMPLETE_CONFIG.DEBOUNCE_DELAY_MS,
    minPopulation = AUTOCOMPLETE_CONFIG.MIN_POPULATION,
    disabled = false
  } = options;

  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [hideAfterSubmit, setHideAfterSubmit] = useState(false);
  const [queryWhenHidden, setQueryWhenHidden] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [lastQuery, setLastQuery] = useState('');

  // Compute if dropdown should be manually hidden
  // Reset manual hide when user changes the input after submission
  const manualHide = hideAfterSubmit && query === queryWhenHidden;

  // Debounce the query input
  useEffect(() => {
    const trimmed = query.trim();
    
    // Determine what the debounced value should be
    const shouldDebounce = !disabled && trimmed.length >= minQueryLength && !/\d/.test(trimmed);
    
    const timer = setTimeout(() => {
      setDebouncedQuery(shouldDebounce ? trimmed : '');
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [query, disabled, minQueryLength, debounceDelay]);

  // Fetch suggestions using React Query
  const { data: rawSuggestions, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ['citySuggestions', debouncedQuery] as const,
    queryFn: () => getCitySuggestions(debouncedQuery),
    enabled: Boolean(debouncedQuery && !disabled),
    staleTime: QUERY_CACHE_CONFIG.STALE_TIME,
    gcTime: QUERY_CACHE_CONFIG.GC_TIME,
  });

  // Filter and process suggestions
  const suggestions = useMemo(() => {
    if (!rawSuggestions || rawSuggestions.length === 0) return [];

    // Filter cities with population data and >= MIN_POPULATION
    const filteredResults = rawSuggestions
      .filter((result: GeocodingResult) => {
        const matchesQuery = result.name.toLowerCase().startsWith(debouncedQuery.toLowerCase());
        const hasValidPopulation = result.population && result.population >= minPopulation;
        return matchesQuery && hasValidPopulation;
      });
    
    // Deduplicate by city name + country
    const uniqueResults = filteredResults
      .filter((result: GeocodingResult, index: number, self: GeocodingResult[]) => 
        index === self.findIndex(r => r.name === result.name && r.country === result.country)
      )
      // Prioritize cities with larger populations
      .sort((a: GeocodingResult, b: GeocodingResult) => (b.population || 0) - (a.population || 0))
      .slice(0, maxSuggestions);
    
    return uniqueResults;
  }, [rawSuggestions, debouncedQuery, minPopulation, maxSuggestions]);

  const noResults = debouncedQuery.length > 0 && !isLoadingSuggestions && suggestions.length === 0;

  // Derive showSuggestions as computed value to avoid setState in effects
  const showSuggestions = useMemo(() => {
    if (manualHide || disabled || debouncedQuery.length === 0) {
      return false;
    }
    // Show dropdown if we have suggestions, are loading, or need to show no results
    return suggestions.length > 0 || isLoadingSuggestions || noResults;
  }, [manualHide, disabled, debouncedQuery, suggestions.length, isLoadingSuggestions, noResults]);

  // Reset highlighted index when debounced query changes
  const effectiveHighlightedIndex = useMemo(() => {
    if (debouncedQuery !== lastQuery) {
      return -1;
    }
    return highlightedIndex;
  }, [debouncedQuery, lastQuery, highlightedIndex]);

  const clearSuggestions = () => {
    setDebouncedQuery('');
    setHideAfterSubmit(true);
    setQueryWhenHidden(''); // Hide for empty query
  };

  const setShowSuggestionsManual = (show: boolean) => {
    if (!show) {
      setHideAfterSubmit(true);
      setQueryWhenHidden(query);
    } else {
      setHideAfterSubmit(false);
      setQueryWhenHidden('');
    }
  };

  const setHighlightedIndexSafe = (index: number) => {
    setLastQuery(debouncedQuery);
    setHighlightedIndex(index);
  };

  return {
    suggestions,
    showSuggestions,
    isLoadingSuggestions,
    noResults,
    highlightedIndex: effectiveHighlightedIndex,
    setHighlightedIndex: setHighlightedIndexSafe,
    setShowSuggestions: setShowSuggestionsManual,
    clearSuggestions
  };
}