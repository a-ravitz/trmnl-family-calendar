// Pure mapping from Google Calendar event colors to the people they stand for.
// This module is the single source; the build step (build.mjs, `bun run build`)
// inlines it into the generated `src/full.liquid`. Never edit that generated
// copy. See src/AGENTS.md and
// adr/0006-extracted-testable-helpers-with-inline-copies.md.

/**
 * Google Calendar event colorId to person. Each person gets one of the
 * existing grayscale bar patterns (cw-bar-N) so no new color dithers (ADR 0004).
 * colorName is the Google Calendar color name, shown in the legend so the
 * family remembers which color to pick. `invert` draws the event as white
 * text on black (holidays) instead of a patterned bar.
 */
export var PERSON_COLORS = {
  '11': { name: 'Family', bar: 1, colorName: 'Tomato' },
  '5': { name: 'Lindy', bar: 0, colorName: 'Banana' },
  '3': { name: 'Adam', bar: 4, colorName: 'Grape' },
  '10': { name: 'Julian', bar: 7, colorName: 'Basil' },
  '9': { name: 'Birthdays', bar: 2, colorName: 'Blueberry' },
  '8': { name: 'Holidays', bar: 10, colorName: 'Graphite', invert: true }
};

/**
 * Legend order. Kept as an array because a JavaScript object iterates its
 * integer-like keys (the colorIds) in numeric order, not insertion order.
 */
export var PERSON_ORDER = ['Family', 'Lindy', 'Adam', 'Julian', 'Birthdays', 'Holidays'];

/**
 * Person for an event color, or null when the event has no mapped color.
 * @param {string|number|undefined} colorId - Google Calendar event colorId
 * @returns {Object|null} name and bar index, or null
 */
export function personForColor(colorId) {
  if (colorId === undefined || colorId === null || colorId === '') return null;
  return PERSON_COLORS[String(colorId)] || null;
}
