import { describe, it, expect } from '@jest/globals';
import {
  validateCityInput,
  validateSearchSubmission,
  formatCityDisplayName
} from './validation';

describe('validateCityInput', () => {
  it('should accept valid city names', () => {
    const result = validateCityInput('London');
    expect(result.isValid).toBe(true);
    expect(result.message).toBeUndefined();
  });

  it('should accept city names with spaces', () => {
    const result = validateCityInput('New York');
    expect(result.isValid).toBe(true);
  });

  it('should accept city names with hyphens', () => {
    const result = validateCityInput('Saint-Denis');
    expect(result.isValid).toBe(true);
  });

  it('should accept city names with apostrophes', () => {
    const result = validateCityInput("L'Aquila");
    expect(result.isValid).toBe(true);
  });

  it('should reject city names with numbers', () => {
    const result = validateCityInput('Paris123');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Please enter a valid city name without numbers');
  });

  it('should reject city names that are too short', () => {
    const result = validateCityInput('A');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('City name must be at least 2 characters long');
  });

  it('should reject city names that are too long', () => {
    const result = validateCityInput('A'.repeat(51));
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('City name is too long');
  });

  it('should reject city names with invalid characters', () => {
    const result = validateCityInput('Paris@City');
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('only letters, spaces, hyphens, and apostrophes');
  });

  it('should accept empty input as valid', () => {
    const result = validateCityInput('');
    expect(result.isValid).toBe(true);
  });

  it('should trim whitespace before validation', () => {
    const result = validateCityInput('  London  ');
    expect(result.isValid).toBe(true);
  });

  it('should handle mixed case', () => {
    const result = validateCityInput('NeW yOrK');
    expect(result.isValid).toBe(true);
  });
});

describe('validateSearchSubmission', () => {
  it('should accept valid city names', () => {
    const result = validateSearchSubmission('London');
    expect(result.isValid).toBe(true);
    expect(result.message).toBeUndefined();
  });

  it('should reject empty input', () => {
    const result = validateSearchSubmission('');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Please enter a city name');
  });

  it('should reject whitespace-only input', () => {
    const result = validateSearchSubmission('   ');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Please enter a city name');
  });

  it('should reject invalid city names', () => {
    const result = validateSearchSubmission('Paris123');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Please enter a valid city name without numbers');
  });

  it('should trim input before validation', () => {
    const result = validateSearchSubmission('  Tokyo  ');
    expect(result.isValid).toBe(true);
  });
});

describe('formatCityDisplayName', () => {
  it('should format city with country', () => {
    const result = formatCityDisplayName('Paris', 'France');
    expect(result).toBe('Paris, France');
  });

  it('should return only city name when no country provided', () => {
    const result = formatCityDisplayName('London');
    expect(result).toBe('London');
  });

  it('should handle undefined country', () => {
    const result = formatCityDisplayName('Tokyo', undefined);
    expect(result).toBe('Tokyo');
  });

  it('should trim whitespace from city and country', () => {
    const result = formatCityDisplayName('  New York  ', '  USA  ');
    expect(result).toBe('New York, USA');
  });

  it('should handle empty country string', () => {
    const result = formatCityDisplayName('Berlin', '');
    expect(result).toBe('Berlin');
  });
});
