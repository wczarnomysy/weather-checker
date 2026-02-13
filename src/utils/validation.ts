/**
 * Input validation utilities for the weather app
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validates if a city name input is acceptable
 * @param input - The city name input to validate
 * @returns ValidationResult - Object containing validation status and message
 */
export function validateCityInput(input: string): ValidationResult {
  const trimmed = input.trim();

  // Empty input is considered valid (but not ready for search)
  if (!trimmed) {
    return { isValid: true };
  }

  // Check if input contains numbers
  if (/\d/.test(trimmed)) {
    return {
      isValid: false,
      message: 'Please enter a valid city name without numbers'
    };
  }

  // Check for minimum length
  if (trimmed.length < 2) {
    return {
      isValid: false,
      message: 'City name must be at least 2 characters long'
    };
  }

  // Check for maximum reasonable length
  if (trimmed.length > 50) {
    return {
      isValid: false,
      message: 'City name is too long'
    };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const validCharacters = /^[a-zA-Z\s\-']+$/;
  if (!validCharacters.test(trimmed)) {
    return {
      isValid: false,
      message: 'Please enter a valid city name with only letters, spaces, hyphens, and apostrophes'
    };
  }

  return { isValid: true };
}

/**
 * Checks if input is ready for search submission
 * @param input - The input string to check
 * @returns ValidationResult - Object containing validation status and message
 */
export function validateSearchSubmission(input: string): ValidationResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      isValid: false,
      message: 'Please enter a city name'
    };
  }

  return validateCityInput(trimmed);
}

/**
 * Normalizes city display name for consistent formatting
 * @param name - City name
 * @param country - Country name (optional)
 * @returns string - Formatted display name
 */
export function formatCityDisplayName(name: string, country?: string): string {
  const cityName = name.trim();
  if (!country) {
    return cityName;
  }
  return `${cityName}, ${country.trim()}`;
}