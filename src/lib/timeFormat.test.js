import { describe, expect, test } from 'bun:test';
import { fmt12, fmtRange12, hourLabel12, gridRange } from './timeFormat.js';

describe('fmt12', () => {
  test('whole hours drop the minutes', () => {
    expect(fmt12(9 * 60)).toBe('9am');
    expect(fmt12(19 * 60)).toBe('7pm');
  });
  test('noon and midnight', () => {
    expect(fmt12(12 * 60)).toBe('12pm');
    expect(fmt12(0)).toBe('12am');
    expect(fmt12(24 * 60)).toBe('12am');
  });
  test('minutes are kept when not on the hour', () => {
    expect(fmt12(14 * 60 + 30)).toBe('2:30pm');
    expect(fmt12(20 * 60 + 5)).toBe('8:05pm');
  });
});

describe('fmtRange12', () => {
  test('same half of the day shows the suffix once', () => {
    expect(fmtRange12(19 * 60, 22 * 60)).toBe('7-10pm');
    expect(fmtRange12(14 * 60 + 30, 15 * 60 + 30)).toBe('2:30-3:30pm');
  });
  test('crossing noon shows both suffixes', () => {
    expect(fmtRange12(11 * 60 + 30, 13 * 60)).toBe('11:30am-1pm');
  });
  test('noon to 1pm is the same half', () => {
    expect(fmtRange12(12 * 60, 13 * 60)).toBe('12-1pm');
  });
});

describe('hourLabel12', () => {
  test('labels the grid hours', () => {
    expect(hourLabel12(7 * 60)).toBe('7 AM');
    expect(hourLabel12(12 * 60)).toBe('12 PM');
    expect(hourLabel12(22 * 60)).toBe('10 PM');
    expect(hourLabel12(0)).toBe('12 AM');
  });
});

describe('gridRange', () => {
  test('defaults to the fixed range when events fit inside it', () => {
    expect(gridRange(10 * 60, 21 * 60, true, 7 * 60, 22 * 60)).toEqual({ min: 420, max: 1320 });
  });
  test('expands to fit earlier or later events, rounded to whole hours', () => {
    expect(gridRange(6 * 60 + 30, 23 * 60 + 15, true, 420, 1320)).toEqual({ min: 360, max: 1440 });
  });
  test('uses the fixed range when there are no timed events', () => {
    expect(gridRange(1440, 0, false, 420, 1320)).toEqual({ min: 420, max: 1320 });
  });
});
