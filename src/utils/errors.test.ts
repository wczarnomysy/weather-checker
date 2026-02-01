import { describe, it, expect } from '@jest/globals';
import { 
  CityNotFoundError, 
  NetworkError, 
  ApiError, 
  getErrorMessage 
} from './errors';
import { ERROR_TEXT } from '../constants/text';

describe('Error Classes', () => {
  describe('CityNotFoundError', () => {
    it('should create an error with correct name and message', () => {
      const error = new CityNotFoundError();
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('CityNotFoundError');
      expect(error.message).toBe('City not found');
    });
  });

  describe('NetworkError', () => {
    it('should create an error with correct name and message', () => {
      const error = new NetworkError();
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('NetworkError');
      expect(error.message).toBe('Network error');
    });
  });

  describe('ApiError', () => {
    it('should create an error with correct name and message', () => {
      const error = new ApiError();
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('API error');
    });
  });
});

describe('getErrorMessage', () => {
  it('should return city not found message for CityNotFoundError', () => {
    const error = new CityNotFoundError();
    const message = getErrorMessage(error);
    
    expect(message).toBe(ERROR_TEXT.cityNotFound);
  });

  it('should return network error message for NetworkError', () => {
    const error = new NetworkError();
    const message = getErrorMessage(error);
    
    expect(message).toBe(ERROR_TEXT.networkError);
  });

  it('should return API error message for ApiError', () => {
    const error = new ApiError();
    const message = getErrorMessage(error);
    
    expect(message).toBe(ERROR_TEXT.apiError);
  });

  it('should return error message for generic Error with message', () => {
    const error = new Error('Custom error message');
    const message = getErrorMessage(error);
    
    expect(message).toBe('Custom error message');
  });

  it('should return generic error message for Error without message', () => {
    const error = new Error('');
    const message = getErrorMessage(error);
    
    expect(message).toBe(ERROR_TEXT.generic);
  });

  it('should return generic error message for unknown error types', () => {
    const message = getErrorMessage('string error');
    
    expect(message).toBe(ERROR_TEXT.generic);
  });

  it('should return generic error message for null', () => {
    const message = getErrorMessage(null);
    
    expect(message).toBe(ERROR_TEXT.generic);
  });

  it('should return generic error message for undefined', () => {
    const message = getErrorMessage(undefined);
    
    expect(message).toBe(ERROR_TEXT.generic);
  });
});
