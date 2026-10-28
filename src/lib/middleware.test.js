import { describe, it, expect } from "bun:test";
import { cleanText, cacheKey, forecastUrl } from "./middleware.js";

// Characterization tests pinning the behavior also inlined in
// src/middleware/calendar_weather_proxy.gs.

describe("cleanText", () => {
  it("strips HTML tags and collapses whitespace", () => {
    expect(cleanText("<b>Hi</b> there", 200)).toBe("Hi there");
  });

  it("collapses runs of whitespace", () => {
    expect(cleanText("  multiple   spaces  ", 200)).toBe("multiple spaces");
  });

  it("truncates and appends an ellipsis past the limit", () => {
    expect(cleanText("aaaaaaaaaa", 5)).toBe("aaaaa...");
  });

  it("returns an empty string for falsy input", () => {
    expect(cleanText("", 200)).toBe("");
    expect(cleanText(null, 200)).toBe("");
  });
});

describe("cacheKey", () => {
  it("builds a per-location key from source and coordinates", () => {
    expect(cacheKey("cal", { lat: 41.39, lon: 2.17, tz: "Europe/Madrid" }))
      .toBe("cal:41.39,2.17,Europe/Madrid");
  });
});

describe("forecastUrl", () => {
  it("builds the Open-Meteo forecast URL with the location", () => {
    const url = forecastUrl({ lat: 41.39, lon: 2.17, tz: "Europe/Madrid" });
    expect(url).toContain("latitude=41.39");
    expect(url).toContain("longitude=2.17");
    expect(url).toContain("timezone=Europe%2FMadrid"); // encodeURIComponent
    expect(url).toContain("forecast_days=7");
  });

  it("asks for Fahrenheit, mph, and the daily wind the templates show", () => {
    const url = forecastUrl({ lat: 39.92, lon: -75.18, tz: "America/New_York" });
    expect(url).toContain("temperature_unit=fahrenheit");
    expect(url).toContain("wind_speed_unit=mph");
    expect(url).toContain("wind_speed_10m_max");
    expect(url).toContain("wind_gusts_10m_max");
  });
});
