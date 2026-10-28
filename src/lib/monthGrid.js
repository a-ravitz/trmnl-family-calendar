// Pure helpers for the month-at-a-glance view. This module is the single
// source; the build step (build.mjs, `bun run build`) inlines it into the
// generated `src/month.liquid`. Never edit that generated copy. See
// src/AGENTS.md and adr/0006-extracted-testable-helpers-with-inline-copies.md.

import { toMin } from './eventLayout.js';
import { addDays } from './agenda.js';

/**
 * Lay out events on a grid of whole weeks. Each multi-day all-day event
 * becomes one bar per week row (`col`, `span`, a `lane` so that overlapping
 * bars stack, and `contL`/`contR` when it continues from or into another
 * week). Everything else goes in `items`, one list per day: single-day
 * all-day events first (`sm` = -1), then timed events by start minute.
 * @param {Array<Object>} events - flat event array from the middleware
 * @param {string} start - "YYYY-MM-DD", the first day of the grid
 * @param {number} weeks - number of week rows
 * @returns {Array<Object>} days, bars, lanes, and items for each week
 */
export function monthWeeks(events, start, weeks) {
  var rows = [], index = {};
  for (var w = 0; w < weeks; w++) {
    var row = { days: [], bars: [], lanes: 0, items: [[], [], [], [], [], [], []] };
    for (var c = 0; c < 7; c++) {
      var iso = addDays(start, w * 7 + c);
      row.days.push(iso); index[iso] = { w: w, c: c };
    }
    rows.push(row);
  }
  var gridEnd = addDays(start, weeks * 7);
  for (var i = 0; i < events.length; i++) {
    var ev = events[i];
    if (ev.all_day) {
      var sd = (ev.start_full || ev.start || '').substring(0, 10);
      var ed = (ev.end_full || ev.end || '').substring(0, 10) || addDays(sd, 1);
      if (!sd || ed <= start || sd >= gridEnd) continue;
      if (addDays(sd, 1) >= ed) { var p = index[sd]; if (p) rows[p.w].items[p.c].push({ ev: ev, sm: -1, em: -1 }); continue; }
      var from = sd < start ? start : sd, to = ed > gridEnd ? gridEnd : ed;
      while (from < to) {
        var at = index[from], weekEnd = addDays(rows[at.w].days[0], 7);
        var segEnd = to < weekEnd ? to : weekEnd, span = 0;
        for (var d = from; d < segEnd; d = addDays(d, 1)) span++;
        rows[at.w].bars.push({ ev: ev, col: at.c, span: span, lane: 0, contL: from > sd, contR: segEnd < ed });
        from = segEnd;
      }
    } else {
      var dk = (ev.date_time || ev.start_full || '').substring(0, 10);
      var q = index[dk];
      if (!q) continue;
      var sm = toMin(ev.start, ev.start_full || ev.date_time);
      if (sm < 0) continue;
      rows[q.w].items[q.c].push({ ev: ev, sm: sm, em: toMin(ev.end, ev.end_full) });
    }
  }
  for (var r = 0; r < rows.length; r++) {
    var bars = rows[r].bars;
    bars.sort(function (a, b) { return a.col - b.col || b.span - a.span; });
    var laneEnds = [];
    // Longest bars claim the top lanes first so long trips read as one line.
    var order = bars.slice().sort(function (a, b) { return b.span - a.span || a.col - b.col; });
    for (var k = 0; k < order.length; k++) {
      var bar = order[k], lane = 0;
      while (laneEnds[lane] && laneEnds[lane].some(function (o) { return bar.col < o.col + o.span && o.col < bar.col + bar.span; })) lane++;
      bar.lane = lane;
      (laneEnds[lane] = laneEnds[lane] || []).push(bar);
    }
    rows[r].lanes = laneEnds.length;
    for (var dc = 0; dc < 7; dc++) rows[r].items[dc].sort(function (a, b) { return a.sm - b.sm; });
  }
  return rows;
}

/**
 * Plain-English name for a WMO weather code (Open-Meteo `weather_code`).
 * @param {number|string|null|undefined} code
 * @returns {string}
 */
export function weatherText(code) {
  if (code === null || code === undefined || code === '') return '';
  var c = +code;
  if (c === 0) return 'Clear';
  if (c === 1) return 'Mostly clear';
  if (c === 2) return 'Partly cloudy';
  if (c === 3) return 'Overcast';
  if (c === 45 || c === 48) return 'Fog';
  if (c >= 51 && c <= 57) return 'Drizzle';
  if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82)) return 'Rain';
  if ((c >= 71 && c <= 77) || c === 85 || c === 86) return 'Snow';
  if (c >= 95) return 'Thunderstorm';
  return '';
}
