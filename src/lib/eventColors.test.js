import { describe, expect, test } from 'bun:test';
import { personForColor, PERSON_COLORS, PERSON_ORDER } from './eventColors.js';

describe('PERSON_ORDER', () => {
  test('lists every mapped person exactly once', () => {
    const names = Object.values(PERSON_COLORS).map((p) => p.name).sort();
    expect([...PERSON_ORDER].sort()).toEqual(names);
  });
});

describe('personForColor', () => {
  test('maps the family color code to people', () => {
    expect(personForColor('5').name).toBe('Lindy');
    expect(personForColor('3').name).toBe('Adam');
    expect(personForColor('10').name).toBe('Julian');
    expect(personForColor('11').name).toBe('Family');
    expect(personForColor('9').name).toBe('Birthdays');
  });

  test('maps Graphite to holidays, drawn inverted', () => {
    expect(personForColor('8').name).toBe('Holidays');
    expect(personForColor('8').invert).toBe(true);
    expect(personForColor('5').invert).toBeFalsy();
  });

  test('every entry names its Google Calendar color for the legend', () => {
    expect(personForColor('11').colorName).toBe('Tomato');
    expect(personForColor('5').colorName).toBe('Banana');
    expect(personForColor('3').colorName).toBe('Grape');
    expect(personForColor('10').colorName).toBe('Basil');
    expect(personForColor('9').colorName).toBe('Blueberry');
    expect(personForColor('8').colorName).toBe('Graphite');
  });

  test('accepts numeric color ids', () => {
    expect(personForColor(5).name).toBe('Lindy');
  });

  test('every person has a distinct bar pattern', () => {
    const bars = Object.values(PERSON_COLORS).map((p) => p.bar);
    expect(new Set(bars).size).toBe(bars.length);
  });

  test('unknown or default colors return null so the calendar bar is used', () => {
    expect(personForColor('')).toBeNull();
    expect(personForColor(undefined)).toBeNull();
    expect(personForColor('7')).toBeNull();
  });
});
