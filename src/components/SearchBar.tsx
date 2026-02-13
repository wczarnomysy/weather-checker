import { useState, useEffect, useRef } from 'react';
import { SEARCH_TEXT, AUTOCOMPLETE_CONFIG } from '../constants/text';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { validateSearchSubmission } from '../utils/validation';
import type { GeocodingResult } from '../api/weather';

interface SearchBarProps {
  onSearch: (city: string) => void;
  onSuggestionSelect?: (suggestion: GeocodingResult) => void;
  onInputChange?: () => void;
  isLoading?: boolean;
  hasWeatherData?: boolean;
  searchError?: Error | null;
}

export function SearchBar({ onSearch, onSuggestionSelect, onInputChange, isLoading, hasWeatherData, searchError }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Use the custom autocomplete hook
  const {
    suggestions,
    showSuggestions,
    isLoadingSuggestions,
    noResults,
    highlightedIndex,
    setHighlightedIndex,
    setShowSuggestions,
    clearSuggestions
  } = useAutocomplete(query, {
    disabled: hasWeatherData || isLoading
  });

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowSuggestions]);

  const handleSuggestionClick = (suggestion: GeocodingResult) => {
    // Immediately close dropdown and clear suggestions for instant feedback
    setShowSuggestions(false);
    clearSuggestions();
    
    // Keep the selected city name in input for consistent UX
    setQuery(suggestion.name);
    
    // Don't modify the user's input - keep it as they typed it
    setValidationMessage('');
    
    // Use direct suggestion selection if available, otherwise fall back to search
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    } else {
      // Search with the suggestion name only
      onSearch(suggestion.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = highlightedIndex < suggestions.length - 1 ? highlightedIndex + 1 : 0;
      setHighlightedIndex(nextIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = highlightedIndex > 0 ? highlightedIndex - 1 : suggestions.length - 1;
      setHighlightedIndex(prevIndex);
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
    
    // Clear any pending autocomplete requests immediately
    clearSuggestions();
    
    if (!trimmedQuery) {
      return;
    }
    
    // Use the validation utility
    const validation = validateSearchSubmission(trimmedQuery);
    
    if (!validation.isValid && validation.message) {
      setValidationMessage(validation.message);
      return;
    }
    
    setValidationMessage('');
    onSearch(trimmedQuery);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (validationMessage) {
      setValidationMessage('');
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
              role="combobox"
              aria-expanded={showSuggestions && suggestions.length > 0}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              aria-label="Search for a city"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="bg-accent text-slate-400 border-2 border-slate-400 px-4 py-2 md:px-6 md:py-2 rounded-lg font-semibold cursor-pointer transition-all duration-150 ease-out [@media(hover:hover)]:hover:scale-105 [@media(hover:hover)]:hover:text-slate-300 [@media(hover:hover)]:hover:border-slate-300 active:scale-95 active:duration-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:text-slate-400 disabled:hover:border-slate-400 select-none text-sm md:text-base"
            >
              {SEARCH_TEXT.buttonText}
            </button>
          </div>
        </form>

        {/* Suggestions Dropdown */}
        {!searchError && showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 z-10 fade-in" role="listbox">
            {suggestions.length > 0 ? (
              <div className="glass-panel overflow-hidden max-h-60">
                <div className="overflow-y-auto max-h-60 custom-scrollbar">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id || index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onMouseLeave={() => setHighlightedIndex(-1)}
                      className={`w-full text-left px-4 py-3 cursor-pointer transition-colors duration-200 ease-in-out focus:outline-none active:bg-cyan-600/60 active:duration-75 border-0 ${
                        index === highlightedIndex 
                          ? 'bg-cyan-500/50' 
                          : '[@media(hover:hover)]:hover:bg-slate-400/25'
                      }`}
                      role="option"
                      aria-selected={index === highlightedIndex}
                      tabIndex={-1}
                    >
                      <div className="text-slate-50 font-medium text-sm">
                        {suggestion.name}
                      </div>
                      <div className="text-slate-400 text-xs mt-0.5">
                        {suggestion.country}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : isLoadingSuggestions && query.trim().length >= AUTOCOMPLETE_CONFIG.MIN_QUERY_LENGTH ? (
              <div className="glass-panel px-4 py-3 text-slate-400 text-sm text-center">
                {SEARCH_TEXT.loadingSuggestions}
              </div>
            ) : noResults && !isLoadingSuggestions && query.trim().length >= AUTOCOMPLETE_CONFIG.MIN_QUERY_LENGTH ? (
              <div className="glass-panel px-4 py-3 text-slate-400 text-sm text-center">
                {SEARCH_TEXT.noSuggestionsFound}
              </div>
            ) : null}
          </div>
        )}
      </div>
      
      {validationMessage  && (
        <div className="text-center mb-6 fade-in">
          <div className="glass-panel inline-block px-4 py-2 md:px-6 md:py-3 text-slate-300 select-none text-sm md:text-base">
            {validationMessage}
          </div>
        </div>
      )}
    </>
  );
}
