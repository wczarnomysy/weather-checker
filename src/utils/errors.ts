import { ERROR_TEXT } from '../constants/text';

// Custom error classes for type-safe error handling
export class CityNotFoundError extends Error {
  constructor() {
    super('City not found');
    this.name = 'CityNotFoundError';
  }
}

export class NetworkError extends Error {
  constructor() {
    super('Network error');
    this.name = 'NetworkError';
  }
}

export class ApiError extends Error {
  constructor() {
    super('API error');
    this.name = 'ApiError';
  }
}

/**
 * Maps error instances to user-friendly messages
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof CityNotFoundError) {
    return ERROR_TEXT.cityNotFound;
  }
  if (error instanceof NetworkError) {
    return ERROR_TEXT.networkError;
  }
  if (error instanceof ApiError) {
    return ERROR_TEXT.apiError;
  }
  if (error instanceof Error) {
    return error.message || ERROR_TEXT.generic;
  }
  return ERROR_TEXT.generic;
}
