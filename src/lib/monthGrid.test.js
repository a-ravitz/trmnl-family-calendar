import { describe, expect, test } from 'bun:test';
import { monthWeeks, weatherText } from './monthGrid.js';

const timed = (summary, d, s, e, color = '') => ({
  summary, color, all_day: false,
  start_full: `${d}T${s}:00.000-05:00`, end_full: `${d}T${e}:00.000-05:00`, date_time: `${d}T${s}:00.000-05:00`,
});
const allDay = (summary, d, dEnd, color = '') => ({
  summary, color, all_day: true,
  start_full: `${d}T00:00:00.000-05:00`, end_full: `${dEnd}T00:00:00.000-05:00`,
});

describe('monthWeeks', () => {
  test('returns the requested weeks of seven consecutive days', () => {
    const weeks = monthWeeks([], '2026-10-25', 5);
    expect(weeks.length).toBe(5);
    expect(weeks[0].days).toEqual(['2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31']);
    expect(weeks[4].days[6]).toBe('2026-11-28');
  });

  test('a multi-day all-day event becomes one bar across its days', () => {
    const weeks = monthWeeks([allDay('Honesdale', '2026-11-06', '2026-11-09')], '2026-11-01', 2);
    expect(weeks[0].bars).toEqual([{ ev: expect.any(Object), col: 5, span: 2, lane: 0, contL: false, contR: true }]);
    expect(weeks[1].bars).toEqual([{ ev: expect.any(Object), col: 0, span: 1, lane: 0, contL: true, contR: false }]);
    expect(weeks[0].lanes).toBe(1);
  });

  test('overlapping bars stack in separate lanes, longest first', () => {
    const weeks = monthWeeks([
      allDay('Short', '2026-11-03', '2026-11-05'),
      allDay('Long', '2026-11-02', '2026-11-07'),
    ], '2026-11-01', 1);
    const byName = Object.fromEntries(weeks[0].bars.map((b) => [b.ev.summary, b]));
    expect(byName.Long.lane).toBe(0);
    expect(byName.Short.lane).toBe(1);
    expect(weeks[0].lanes).toBe(2);
  });

  test('bars that do not overlap share a lane', () => {
    const weeks = monthWeeks([
      allDay('A', '2026-11-01', '2026-11-03'),
      allDay('B', '2026-11-04', '2026-11-06'),
    ], '2026-11-01', 1);
    expect(weeks[0].bars.map((b) => b.lane)).toEqual([0, 0]);
  });

  test('single-day items list all-day ones first, then timed ones by start time', () => {
    const weeks = monthWeeks([
      timed('Late', '2026-11-03', '19:30', '22:30'),
      allDay('Election Day', '2026-11-03', '2026-11-04', '8'),
      timed('Early', '2026-11-03', '09:00', '10:00'),
    ], '2026-11-01', 1);
    expect(weeks[0].items[2].map((it) => it.ev.summary)).toEqual(['Election Day', 'Early', 'Late']);
    expect(weeks[0].items[2][1].sm).toBe(9 * 60);
    expect(weeks[0].items[2][0].sm).toBe(-1);
  });

  test('events outside the grid are ignored', () => {
    const weeks = monthWeeks([timed('Later', '2026-12-25', '10:00', '11:00')], '2026-11-01', 2);
    expect(weeks.every((w) => w.items.every((d) => d.length === 0) && w.bars.length === 0)).toBe(true);
  });
});

describe('weatherText', () => {
  test('describes common WMO weather codes in plain English', () => {
    expect(weatherText(0)).toBe('Clear');
    expect(weatherText(2)).toBe('Partly cloudy');
    expect(weatherText(3)).toBe('Overcast');
    expect(weatherText(61)).toBe('Rain');
    expect(weatherText(71)).toBe('Snow');
    expect(weatherText(95)).toBe('Thunderstorm');
  });

  test('returns an empty string for a missing code', () => {
    expect(weatherText(null)).toBe('');
    expect(weatherText(undefined)).toBe('');
  });
});
