import React, { useState, useEffect, useRef } from 'react';
import { SEARCH_TEXT, ERROR_TEXT, AUTOCOMPLETE_CONFIG } from '../constants/text';
import { getGeocodingUrl } from '../config/api';
import type { GeocodingResult, GeocodingApiResponse } from '../api/weather';

interface SearchBarProps {
  onSearch: (city: string) => void;
  onInputChange?: () => void;
  isLoading?: boolean;
  hasWeatherData?: boolean;
}

export function SearchBar({ onSearch, onInputChange, isLoading, hasWeatherData }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [noResults, setNoResults] = useState(false);
  const debounceTimerRef = useRef<number | undefined>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  // Fetch suggestions with debouncing
  useEffect(() => {
    // Don't show autocomplete if weather data is already displayed or loading
    if (hasWeatherData || isLoading) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    if (query.trim().length < AUTOCOMPLETE_CONFIG.MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setShowSuggestions(false);
      setNoResults(false);
      return;
    }

    // Check for numbers
    if (/\d/.test(query)) {
      setSuggestions([]);
      setShowSuggestions(false);
      setNoResults(false);
      return;
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = window.setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(
          `${getGeocodingUrl()}?name=${encodeURIComponent(query.trim())}&count=10&language=en&format=json`
        );
        const data: GeocodingApiResponse = await response.json();
        
        if (data.results && data.results.length > 0) {
          // Filter cities with population data and >= MIN_POPULATION to avoid small villages
          // Also filter to only show cities whose names actually match the query
          const filteredResults = data.results
            .filter((result: GeocodingResult) => {
              const matchesQuery = result.name.toLowerCase().startsWith(query.trim().toLowerCase());
              const hasValidPopulation = result.population && result.population >= AUTOCOMPLETE_CONFIG.MIN_POPULATION;
              return matchesQuery && hasValidPopulation;
            });
          
          // Deduplicate by city name + country to avoid showing same city multiple times
          const uniqueResults = filteredResults
            .filter((result: GeocodingResult, index: number, self: GeocodingResult[]) => 
              index === self.findIndex(r => r.name === result.name && r.country === result.country)
            )
            // Prioritize cities with larger populations
            .sort((a: GeocodingResult, b: GeocodingResult) => (b.population || 0) - (a.population || 0))
            .slice(0, AUTOCOMPLETE_CONFIG.MAX_SUGGESTIONS);
          
          if (uniqueResults.length > 0) {
            setSuggestions(uniqueResults);
            setShowSuggestions(true);
            setNoResults(false);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
            setNoResults(true);
          }
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
          setNoResults(true);
        }
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
        setNoResults(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, AUTOCOMPLETE_CONFIG.DEBOUNCE_DELAY_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, hasWeatherData, isLoading]);

  const handleSuggestionClick = (suggestion: GeocodingResult) => {
    // Clear any pending debounce timer to prevent re-fetching
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    setQuery(suggestion.name);
    setShowSuggestions(false);
    setSuggestions([]);
    setError('');
    onSearch(suggestion.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) {
      return;
    }
    
    // Check if query contains numbers
    if (/\d/.test(trimmedQuery)) {
      setError(ERROR_TEXT.cityWithNumbers);
      return;
    }
    
    setError('');
    setShowSuggestions(false);
    onSearch(trimmedQuery);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (error) {
      setError('');
    }
    // Notify parent that input is changing (to clear previous results)
    if (onInputChange) {
      onInputChange();
    }
  };

  return (
    <>
      <div ref={wrapperRef} className="w-full max-w-lg mx-auto mb-6 relative">
        <form onSubmit={handleSubmit}>
          <div className="glass-panel flex items-center p-2 select-none">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={SEARCH_TEXT.placeholder}
              className="flex-1 bg-transparent border-none outline-none text-slate-50 px-4 py-2 text-base md:text-lg placeholder:text-slate-400 placeholder:opacity-70 select-text"
              disabled={isLoading}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="bg-accent text-slate-400 border-2 border-slate-400 px-4 py-2 md:px-6 md:py-2 rounded-lg font-semibold cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:text-slate-300 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:text-slate-400 disabled:hover:border-slate-400 select-none text-sm md:text-base"
            >
              {SEARCH_TEXT.buttonText}
            </button>
          </div>
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-panel max-h-60 overflow-y-auto z-10 fade-in">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id || index}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-4 py-3 cursor-pointer transition-colors border-b border-slate-400/20 last:border-b-0 ${
                  index === highlightedIndex ? 'bg-slate-400/30' : 'hover:bg-slate-400/20'
                }`}
              >
                <div className="text-slate-50 font-medium text-sm md:text-base">
                  {suggestion.name}
                </div>
                <div className="text-slate-400 text-xs md:text-sm">
                  {suggestion.country}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading indicator for suggestions */}
        {isLoadingSuggestions && query.trim().length >= AUTOCOMPLETE_CONFIG.MIN_QUERY_LENGTH && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-panel px-4 py-3 text-slate-400 text-sm text-center fade-in-fast">
            {SEARCH_TEXT.loadingSuggestions}
          </div>
        )}

        {/* No results message */}
        {noResults && !isLoadingSuggestions && query.trim().length >= AUTOCOMPLETE_CONFIG.MIN_QUERY_LENGTH && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-panel px-4 py-3 text-slate-400 text-sm text-center fade-in">
            {SEARCH_TEXT.noSuggestionsFound}
          </div>
        )}
      </div>
      
      {error && (
        <div className="text-center mb-6 fade-in">
          <div className="glass-panel inline-block px-4 py-2 md:px-6 md:py-3 text-slate-300 select-none text-sm md:text-base">
            {error}
          </div>
        </div>
      )}
    </>
  );
}
