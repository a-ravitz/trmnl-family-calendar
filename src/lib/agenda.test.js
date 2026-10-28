import { describe, expect, test } from 'bun:test';
import { addDays, agendaDays, fmtClock, weekStart } from './agenda.js';

const timed = (summary, d, s, e, color = '') => ({
  summary, color, all_day: false,
  start_full: `${d}T${s}:00.000-04:00`, end_full: `${d}T${e}:00.000-04:00`, date_time: `${d}T${s}:00.000-04:00`,
});
const allDay = (summary, d, dEnd, color = '') => ({
  summary, color, all_day: true,
  start_full: `${d}T00:00:00.000-04:00`, end_full: `${dEnd}T00:00:00.000-04:00`,
});

describe('addDays', () => {
  test('crosses month and year ends', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-10-28', 2)).toBe('2026-10-30');
  });
});

describe('weekStart', () => {
  test('finds the Sunday that starts the week', () => {
    expect(weekStart('2026-10-28', 0)).toBe('2026-10-25');
    expect(weekStart('2026-10-25', 0)).toBe('2026-10-25');
    expect(weekStart('2026-10-31', 0)).toBe('2026-10-25');
  });

  test('honors a Monday week start', () => {
    expect(weekStart('2026-10-28', 1)).toBe('2026-10-26');
    expect(weekStart('2026-10-25', 1)).toBe('2026-10-19');
  });

  test('crosses month and year ends', () => {
    expect(weekStart('2027-01-01', 0)).toBe('2026-12-27');
  });
});

describe('fmtClock', () => {
  test('formats minutes as an easy-to-read 12-hour clock', () => {
    expect(fmtClock(19 * 60)).toBe('7:00 PM');
    expect(fmtClock(9 * 60 + 30)).toBe('9:30 AM');
    expect(fmtClock(0)).toBe('12:00 AM');
    expect(fmtClock(12 * 60)).toBe('12:00 PM');
    expect(fmtClock(1440)).toBe('12:00 AM');
  });
});

describe('agendaDays', () => {
  test('returns the requested number of consecutive days from today', () => {
    const days = agendaDays([], '2026-10-30', 3);
    expect(days.map((d) => d.date)).toEqual(['2026-10-30', '2026-10-31', '2026-11-01']);
  });

  test('sorts timed events by start time within a day', () => {
    const days = agendaDays([
      timed('Dinner', '2026-10-28', '19:00', '21:00'),
      timed('Dentist', '2026-10-28', '09:00', '10:00'),
      timed('Lunch', '2026-10-28', '12:00', '13:00'),
    ], '2026-10-28', 1);
    expect(days[0].timed.map((e) => e.ev.summary)).toEqual(['Dentist', 'Lunch', 'Dinner']);
    expect(days[0].timed[0].sm).toBe(9 * 60);
    expect(days[0].timed[0].em).toBe(10 * 60);
  });

  test('keeps all-day events apart from timed ones', () => {
    const days = agendaDays([
      allDay('Halloween', '2026-10-31', '2026-11-01', '8'),
      timed('Party', '2026-10-31', '18:00', '21:00'),
    ], '2026-10-31', 1);
    expect(days[0].allDay.map((e) => e.summary)).toEqual(['Halloween']);
    expect(days[0].timed.map((e) => e.ev.summary)).toEqual(['Party']);
  });

  test('puts a multi-day all-day event on each day it covers (end is exclusive)', () => {
    const days = agendaDays([allDay('Trip', '2026-11-06', '2026-11-09')], '2026-11-05', 5);
    expect(days.map((d) => d.allDay.length)).toEqual([0, 1, 1, 1, 0]);
  });

  test('ignores events outside the window', () => {
    const days = agendaDays([timed('Later', '2026-11-05', '10:00', '11:00')], '2026-10-28', 3);
    expect(days.every((d) => d.timed.length === 0)).toBe(true);
  });

  test('an event that ends at or before it starts gets one hour', () => {
    const days = agendaDays([timed('Odd', '2026-10-28', '10:00', '10:00')], '2026-10-28', 1);
    expect(days[0].timed[0].em).toBe(11 * 60);
  });

  test('an event that ends after midnight ends at midnight for that day', () => {
    const ev = timed('Late show', '2026-10-28', '22:00', '23:00');
    ev.end_full = '2026-10-29T01:00:00.000-04:00';
    const days = agendaDays([ev], '2026-10-28', 1);
    expect(days[0].timed[0].em).toBe(1440);
  });
});
