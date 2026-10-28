# TRMNL Family Calendar

Three [TRMNL](https://usetrmnl.com) e-ink views of one shared family Google Calendar, with weather and air quality. They run as three private plugins in one playlist on a **TRMNL X** (1872 x 1404, 4-bit grayscale).

| Plugin | What it shows |
|---|---|
| **Calendar + Weather (X)** | The week as an hour-by-hour time grid (7 AM to 10 PM), with hourly temperature and rain behind each day |
| **Week Agenda (X)** | The current week, Sunday to Saturday, as easy-to-read event lists in a 4 x 2 grid, plus a weather tile for today |
| **Month at a Glance (X)** | Today's date, holidays, and weather on top, then five weeks as a month grid |

This project is a fork of [guplem/trmnl-cal-weather](https://github.com/guplem/trmnl-cal-weather). That project built the time-grid view, the Apps Script middleware, and the test and build setup. This fork adapts them for the TRMNL X and a family calendar, and adds the two other views.

## Features

**In all three views**

- **Person color code.** Each Google Calendar event color stands for a person. The screen draws each person with a different grayscale bar pattern, and the legend names the color to use.

  | Google color | Who |
  |---|---|
  | Tomato | Family |
  | Banana | Lindy |
  | Grape | Adam |
  | Basil | Julian |
  | Blueberry | Birthdays |
  | Graphite | Holidays (white text on black) |
  | Any other color | Other |

- **12-hour times**, Fahrenheit, mph, and the US air quality index (AQI)
- **Earlier days and finished events in dark gray**, so they stay readable on e-ink
- **Fits the TRMNL X screen.** The views also work on the 800 x 480 TRMNL OG.

**Calendar + Weather (X)**

- Events at their real time slots, with overlapping events side by side
- A fixed 7 AM to 10 PM range that grows to fit an earlier or later event
- The current half hour highlighted; weekends shaded
- Sunrise, sunset, UV index, wind and gusts, and AQI in the legend; the AQI number gets darker as air quality gets worse

**Week Agenda (X)**

- Sunday to Saturday, with today outlined in black
- Each event shows its start time, end time, title, and location
- A busy day ends with "+ N more" instead of a cut-off row

**Month at a Glance (X)**

- Five weeks from the start of the current week
- Multi-day events (trips, school closures) drawn as one bar across their days
- Long event names wrap when the day has room
- Today's holidays listed under the date

## How it works

```
TRMNL polls three URLs (about every 15 min)
    |
    +--> ?src=cal      events from the start of this week, 35 days ahead
    +--> ?src=weather  Open-Meteo forecast (Fahrenheit, mph)
    +--> ?src=aqi      Open-Meteo air quality (US AQI)
              |
    Google Apps Script middleware (free, on your own Google account)
        reads Google Calendar directly
        serves everything from a cache that a 15-minute trigger keeps warm
              |
    Three Liquid templates (one per plugin), all reading the same data:
        src/full.liquid     Calendar + Weather
        src/agenda.liquid   Week Agenda
        src/month.liquid    Month at a Glance
```

All three plugins use the same middleware and the same three polling URLs.

## Setup

### Step 1: Deploy the middleware

Follow **[MIDDLEWARE_SETUP.md](MIDDLEWARE_SETUP.md)** to deploy `src/middleware/calendar_weather_proxy.gs` as a Google Apps Script web app. It takes about 10 minutes and needs no server.

In the script's `CONFIG`:

- Set `token` to a long random secret. Never commit it; the repo copy keeps the `YOUR_SECRET_TOKEN` placeholder.
- Optionally list your calendar IDs in `calendarIds`. Left empty, the script reads every calendar that is checked in Google Calendar.
- `firstDayOfWeek` is `0` (Sunday). Use `1` for Monday.

You end up with a web app URL (ends in `/exec`) and your token.

### Step 2: Create the three private plugins

For each plugin: go to **Plugins > Private Plugin > Add new**, then:

1. Give it a name, for example `Week Agenda (X)`.
2. Set **Strategy** to `Polling` and **Polling Verb** to `GET`.
3. Add the three polling URLs, one per line. Replace the capitalized parts:

   ```
   YOUR_SCRIPT_URL?token=YOUR_SECRET_TOKEN&src=cal&tz=YOUR_TIMEZONE
   YOUR_SCRIPT_URL?token=YOUR_SECRET_TOKEN&src=weather&lat=YOUR_LAT&lon=YOUR_LON&tz=YOUR_TIMEZONE
   YOUR_SCRIPT_URL?token=YOUR_SECRET_TOKEN&src=aqi&lat=YOUR_LAT&lon=YOUR_LON&tz=YOUR_TIMEZONE
   ```

   To keep the token out of the URL field, paste the form fields from [`src/form_fields.yml`](src/form_fields.yml) into the plugin's custom fields and use `{{ middleware_url }}` and `{{ middleware_token }}` in the URLs. The token then lives in a password field.

4. Save, then open **Edit Markup** (Full view) and paste the whole matching file:

   | Plugin | Paste this file |
   |---|---|
   | Calendar + Weather (X) | [`src/full.liquid`](src/full.liquid) |
   | Week Agenda (X) | [`src/agenda.liquid`](src/agenda.liquid) |
   | Month at a Glance (X) | [`src/month.liquid`](src/month.liquid) |

5. Save, click **Force Refresh**, and add the plugin to your playlist. TRMNL sometimes adds a new plugin to the playlist by itself; remove any duplicate.

### Step 3: Color-code your events

In Google Calendar, give each event the color of the person it belongs to (see the table above). Events with no color show as "Other". Put holidays in Graphite to get white-on-black labels.

To change the people or colors, edit `PERSON_COLORS` and `PERSON_ORDER` in [`src/lib/eventColors.js`](src/lib/eventColors.js), then rebuild (see below).

## Customization

- **Location:** change `lat`, `lon`, and `tz` in the polling URLs. Find coordinates at [open-meteo.com](https://open-meteo.com/en/docs).
- **Ignore events:** fill the **Ignored phrases** plugin setting with comma-separated, case-insensitive patterns, for example `^Work$`.
- **Declined events** are hidden by the middleware. Set `CONFIG.hideDeclinedEvents` to `false` to show them.
- **Hours on the time grid:** change the `7*60, 22*60` range passed to `gridRange` in `src/full.liquid.template`.

## Development

The shared logic lives once in `src/lib/`, each part with unit tests. A build step inlines it into the four generated files that you paste into TRMNL and Apps Script: `src/full.liquid`, `src/agenda.liquid`, `src/month.liquid`, and `src/middleware/calendar_weather_proxy.gs`. Never edit those four by hand.

With [Bun](https://bun.sh):

```bash
bun run build   # regenerate the four files after editing src/lib or a *.template
bun test .      # run all tests, including a check that the generated files are current
```

After a build, paste the regenerated file into the matching TRMNL markup editor. After editing the Apps Script, deploy it as a **New version** (Deploy > Manage deployments > edit) so the `/exec` URL keeps working.

## Troubleshooting

- **Only part of the calendar shows on the TRMNL X:** use the current templates. The X renderer draws the page at 1040 x 780, then resizes it to 1872 x 1404 before the capture, and the templates re-fit on that resize.
- **New events do not appear:** the middleware cache refreshes every 15 minutes. Run `refreshUpstreamCaches` in the Apps Script editor to refresh it now, then **Force Refresh** the plugin.
- **Later weeks are empty in the month view:** check that `CONFIG.daysAhead` is `35` in the deployed script.

More debugging steps are in **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)**.

## Credits

The time-grid view, the middleware, and the build and test setup come from [guplem/trmnl-cal-weather](https://github.com/guplem/trmnl-cal-weather). Weather and air quality data come from [Open-Meteo](https://open-meteo.com).
