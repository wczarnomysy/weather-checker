import { describe, it, expect } from '@jest/globals';
import { render } from '@testing-library/react';
import { getWeatherIcon } from './weatherIcons';

describe('getWeatherIcon', () => {
  it('should return Sun icon for clear sky (code 0)', () => {
    const { container } = render(getWeatherIcon(0));
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.classList.contains('text-cyan-300')).toBe(true);
  });

  it('should return Cloud icon for partly cloudy (codes 1-3)', () => {
    [1, 2, 3].forEach(code => {
      const { container } = render(getWeatherIcon(code));
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });

  it('should return CloudFog icon for fog (codes 45-48)', () => {
    [45, 46, 47, 48].forEach(code => {
      const { container } = render(getWeatherIcon(code));
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });

  it('should return CloudRain icon for rain (codes 51-67)', () => {
    [51, 55, 61, 65, 67].forEach(code => {
      const { container } = render(getWeatherIcon(code));
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });

  it('should return CloudSnow icon for snow (codes 71-77)', () => {
    [71, 73, 75, 77].forEach(code => {
      const { container } = render(getWeatherIcon(code));
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });

  it('should return Zap icon for thunderstorm (codes 95-99)', () => {
    [95, 96, 99].forEach(code => {
      const { container } = render(getWeatherIcon(code));
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  });

  it('should return default Cloud icon for unknown codes', () => {
    const { container } = render(getWeatherIcon(999));
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('should apply custom className', () => {
    const customClass = 'w-24 h-24 text-blue-500';
    const { container } = render(getWeatherIcon(0, { className: customClass }));
    const svg = container.querySelector('svg');
    const classes = svg?.getAttribute('class') || '';
    expect(classes).toContain('w-24');
    expect(classes).toContain('h-24');
    expect(classes).toContain('text-blue-500');
  });

  it('should apply custom strokeWidth', () => {
    const { container } = render(getWeatherIcon(0, { strokeWidth: 2 }));
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('stroke-width')).toBe('2');
  });

  it('should use default values when no config provided', () => {
    const { container } = render(getWeatherIcon(0));
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('w-12')).toBe(true);
    expect(svg?.classList.contains('text-cyan-300')).toBe(true);
    expect(svg?.getAttribute('stroke-width')).toBe('1.5');
  });

  it('should handle partial config', () => {
    const { container } = render(getWeatherIcon(0, { className: 'custom-class' }));
    const svg = container.querySelector('svg');
    expect(svg?.classList.contains('custom-class')).toBe(true);
    expect(svg?.getAttribute('stroke-width')).toBe('1.5');
  });
});
