import { describe, expect, test } from 'bun:test';
import { aqiShade } from './aqiShade.js';

describe('aqiShade', () => {
  test('good air (US AQI 0-50) is light gray', () => {
    expect(aqiShade(0)).toEqual({ color: '#AAA', bold: false });
    expect(aqiShade(50)).toEqual({ color: '#AAA', bold: false });
  });

  test('moderate air (51-100) is dark gray', () => {
    expect(aqiShade(51)).toEqual({ color: '#555', bold: false });
    expect(aqiShade(100)).toEqual({ color: '#555', bold: false });
  });

  test('unhealthy air (101+) is bold black', () => {
    expect(aqiShade(101)).toEqual({ color: '#000', bold: true });
    expect(aqiShade(320)).toEqual({ color: '#000', bold: true });
  });

  test('only native 2-bit shades are used (ADR 0004)', () => {
    for (const v of [0, 25, 50, 75, 100, 150, 250, 500]) {
      expect(['#000', '#555', '#AAA']).toContain(aqiShade(v).color);
    }
  });

  test('missing or invalid values fall back to the default legend color', () => {
    expect(aqiShade(null)).toBeNull();
    expect(aqiShade(undefined)).toBeNull();
    expect(aqiShade(NaN)).toBeNull();
  });
});
