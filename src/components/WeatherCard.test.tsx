import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { WeatherCard } from './WeatherCard';

describe('WeatherCard', () => {
  const defaultProps = {
    temperature: 22,
    windSpeed: 15,
    weatherCode: 0,
    city: 'London',
  };

  it('should render city name', () => {
    render(<WeatherCard {...defaultProps} />);
    
    expect(screen.getByText('London')).toBeTruthy();
  });

  it('should render city and country when country is provided', () => {
    render(<WeatherCard {...defaultProps} country="United Kingdom" />);
    
    expect(screen.getByText('London, United Kingdom')).toBeTruthy();
  });

  it('should display rounded temperature', () => {
    render(<WeatherCard {...defaultProps} temperature={22.7} />);
    
    expect(screen.getByText('23°C')).toBeTruthy();
  });

  it('should display wind speed', () => {
    render(<WeatherCard {...defaultProps} />);
    
    expect(screen.getByText('Wind')).toBeTruthy();
    expect(screen.getByText('15 km/h')).toBeTruthy();
  });

  it('should display humidity when provided', () => {
    render(<WeatherCard {...defaultProps} humidity={65} />);
    
    expect(screen.getByText('Humidity')).toBeTruthy();
    expect(screen.getByText('65%')).toBeTruthy();
  });

  it('should not display humidity section when not provided', () => {
    render(<WeatherCard {...defaultProps} />);
    
    expect(screen.queryByText('Humidity')).toBeNull();
  });

  it('should display feels like temperature when provided', () => {
    render(<WeatherCard {...defaultProps} feelsLike={20} />);
    
    expect(screen.getByText('Feels like 20°C')).toBeTruthy();
  });

  it('should not display feels like when not provided', () => {
    render(<WeatherCard {...defaultProps} />);
    
    expect(screen.queryByText(/Feels like/)).toBeNull();
  });

  describe('Weather descriptions', () => {
    it('should display "Clear sky" for weather code 0', () => {
      render(<WeatherCard {...defaultProps} weatherCode={0} />);
      
      expect(screen.getByText('Clear sky')).toBeTruthy();
    });

    it('should display "Partly cloudy" for weather codes 1-3', () => {
      render(<WeatherCard {...defaultProps} weatherCode={2} />);
      
      expect(screen.getByText('Partly cloudy')).toBeTruthy();
    });

    it('should display "Fog" for weather codes 45-48', () => {
      render(<WeatherCard {...defaultProps} weatherCode={45} />);
      
      expect(screen.getByText('Fog')).toBeTruthy();
    });

    it('should display "Rain" for weather codes 51-67', () => {
      render(<WeatherCard {...defaultProps} weatherCode={61} />);
      
      expect(screen.getByText('Rain')).toBeTruthy();
    });

    it('should display "Snow" for weather codes 71-77', () => {
      render(<WeatherCard {...defaultProps} weatherCode={73} />);
      
      expect(screen.getByText('Snow')).toBeTruthy();
    });

    it('should display "Thunderstorm" for weather codes 95-99', () => {
      render(<WeatherCard {...defaultProps} weatherCode={95} />);
      
      expect(screen.getByText('Thunderstorm')).toBeTruthy();
    });
  });

  it('should round down temperatures with decimals below 0.5', () => {
    render(<WeatherCard {...defaultProps} temperature={18.4} />);
    
    expect(screen.getByText('18°C')).toBeTruthy();
  });

  it('should round up temperatures with decimals 0.5 and above', () => {
    render(<WeatherCard {...defaultProps} temperature={18.5} />);
    
    expect(screen.getByText('19°C')).toBeTruthy();
  });

  it('should handle negative temperatures', () => {
    render(<WeatherCard {...defaultProps} temperature={-5} />);
    
    expect(screen.getByText('-5°C')).toBeTruthy();
  });

  it('should display all optional fields when provided', () => {
    render(
      <WeatherCard 
        {...defaultProps} 
        country="UK"
        humidity={70}
        feelsLike={19}
      />
    );
    
    expect(screen.getByText('London, UK')).toBeTruthy();
    expect(screen.getByText('Humidity')).toBeTruthy();
    expect(screen.getByText('70%')).toBeTruthy();
    expect(screen.getByText('Feels like 19°C')).toBeTruthy();
  });
});
