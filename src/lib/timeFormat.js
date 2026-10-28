// Pure 12-hour time formatting and grid-range rules. This module is the single
// source; the build step (build.mjs, `bun run build`) inlines it into the
// generated `src/full.liquid`. Never edit that generated copy. See src/AGENTS.md
// and adr/0006-extracted-testable-helpers-with-inline-copies.md.

/**
 * Split minutes-since-midnight into a 12-hour clock reading.
 * @param {number} m - minutes since midnight (1440 counts as midnight)
 * @returns {Object} h (1-12), mm (0-59), and pm (boolean)
 */
function split12(m) {
  var t = ((m % 1440) + 1440) % 1440;
  var h24 = Math.floor(t / 60), mm = t % 60;
  var h = h24 % 12; if (h === 0) h = 12;
  return { h: h, mm: mm, pm: h24 >= 12 };
}

/**
 * Compact 12-hour time: "9am", "2:30pm", "12pm".
 * @param {number} m - minutes since midnight
 * @returns {string}
 */
export function fmt12(m) {
  var p = split12(m);
  return p.h + (p.mm ? ':' + (p.mm < 10 ? '0' : '') + p.mm : '') + (p.pm ? 'pm' : 'am');
}

/**
 * Compact 12-hour range. The am/pm suffix appears once when both ends share
 * it ("7-10pm") and on both ends when the range crosses noon ("11:30am-1pm").
 * @param {number} s - start, minutes since midnight
 * @param {number} e - end, minutes since midnight
 * @returns {string}
 */
export function fmtRange12(s, e) {
  var a = fmt12(s), b = fmt12(e);
  if (split12(s).pm === split12(e).pm) a = a.replace(/[ap]m$/, '');
  return a + '-' + b;
}

/**
 * Hour label for the time axis: "7 AM", "12 PM".
 * @param {number} m - minutes since midnight, on the hour
 * @returns {string}
 */
export function hourLabel12(m) {
  var p = split12(m);
  return p.h + (p.pm ? ' PM' : ' AM');
}

/**
 * Visible grid range. The grid always covers the fixed default range so the
 * layout stays steady from week to week; it grows to whole hours only when an
 * event starts earlier or ends later.
 * @param {number} earliest - earliest event start (minutes), any value when there are no events
 * @param {number} latest - latest event end (minutes)
 * @param {boolean} hasTimed - whether any timed event exists
 * @param {number} defMin - fixed range start (minutes)
 * @param {number} defMax - fixed range end (minutes)
 * @returns {Object} min and max, in minutes, on whole hours
 */
export function gridRange(earliest, latest, hasTimed, defMin, defMax) {
  var min = defMin, max = defMax;
  if (hasTimed) {
    if (earliest < min) min = Math.floor(earliest / 60) * 60;
    if (latest > max) max = Math.min(1440, Math.ceil(latest / 60) * 60);
  }
  return { min: min, max: max };
}
