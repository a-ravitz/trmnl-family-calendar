// Pure rule that picks the ink for the AQI number in the legend bar. This
// module is the single source; the build step (build.mjs, `bun run build`)
// inlines it into the generated `src/full.liquid`. Never edit that generated
// copy. See src/AGENTS.md and
// adr/0006-extracted-testable-helpers-with-inline-copies.md.

/**
 * Shade for a US AQI value: light gray when the air is good, dark gray when it
 * is moderate, bold black when it is unhealthy. The bands follow the US EPA
 * AQI categories (0-50 good, 51-100 moderate, 101+ unhealthy for some or all).
 * Only native 2-bit shades are returned, so the number never dithers (ADR 0004).
 * The return type is written without a double brace on purpose: this source
 * is inlined into a Liquid template, where a double brace opens a Liquid tag.
 * @param {number|null|undefined} aqi
 * @returns {Object|null} color (hex) and bold (boolean), or null when there is no usable value
 */
export function aqiShade(aqi) {
  if (aqi === null || aqi === undefined || isNaN(aqi)) return null;
  if (aqi <= 50) return { color: '#AAA', bold: false };
  if (aqi <= 100) return { color: '#555', bold: false };
  return { color: '#000', bold: true };
}
