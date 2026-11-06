---
name: setup-family-calendar
description: Walk a new user through setting up this TRMNL family calendar end to end - interview the household (people, colors, location, week start, chores), customize the code, deploy the Google Apps Script middleware, create the three TRMNL private plugins, and color-code the calendar. Use when someone asks to set up, install, or adapt this project for their own family or TRMNL.
---

# Set up the family calendar for a new household

This skill turns a fresh clone of this repo into a working setup on the user's own TRMNL. The user ends with three private plugins in one playlist: **Calendar + Weather (X)**, **Week Agenda (X)**, and **Month at a Glance (X)**. All three read one Google Apps Script middleware on the user's Google account.

Work in five phases, in order. Track them with a task list. Finish each phase before you start the next one, because later phases need the answers from earlier ones.

## Safety rules (apply to every phase)

- **The user handles every secret and every approval.** The user pastes the token into Apps Script and into TRMNL. The user approves the Google permission prompt, sets "Who has access: Anyone", and turns on TRMNL Developer perks. Never type a token or password into a website yourself. You may show the token to the user in chat so they can copy it.
- **Never commit a secret or a private ID.** Keep `CONFIG.token` as `YOUR_SECRET_TOKEN` and `CONFIG.calendarIds` as `[]` in the repo. Keep real URLs out of `src/settings.yml`. Before every commit, run `git diff --cached` and check for the token, the `/exec` URL, and calendar IDs (long strings ending in `@group.calendar.google.com`).
- **Ask before you change the user's calendar.** Show a list of the events or color changes, and wait for a yes.
- **Follow the repo rules in `AGENTS.md`.** Edit `src/lib/*.js` and the `*.template` files only, run `bun run build`, then `bun test .`. Use the `write-commit` skill for commits.

## Phase 1: Interview the household

Ask with the AskUserQuestion tool where the answers are choices, and in chat where they are free text. Batch related questions. Record every answer in the task list.

1. **Device.** TRMNL X (1872 x 1404) or TRMNL OG (800 x 480)? The three views are tuned for the X. On the OG, tell the user that the month and agenda views will be crowded, and suggest the Calendar + Weather view only.
2. **Views.** All three, or a subset?
3. **Account.** Does the user have the TRMNL Developer add-on or a BYOD license? Private plugins need one of them. If not, tell the user to turn on **Developer perks** in TRMNL account settings.
4. **Calendar.** Which Google calendar holds the family events? Recommend one shared calendar that every adult can edit (Google Calendar > Settings > Share with specific people). Note the Google account that will run the script: it must be able to see that calendar.
5. **People and categories.** Ask how many people are in the household and their names (adults and kids). Then suggest these shared categories, and ask which to keep: **Family** (everyone), **Birthdays**, **Holidays**. A category can also be a pet, a nanny, or "Work".
6. **Colors.** Assign one Google Calendar event color to each person and category. Use the table below. Suggest a default (Tomato for Family, Blueberry for Birthdays, Graphite for Holidays) and let the user change it. Two entries must never share a color.
7. **Location.** Ask for the town or ZIP code. Look up its latitude and longitude (for example with the Open-Meteo geocoding page or a web search), and confirm the place name with the user. Ask for the IANA time zone (for example `America/New_York`); derive it from the location and confirm.
8. **Week start.** Sunday or Monday?
9. **Time grid hours** (Calendar + Weather only). The default is 7 AM to 10 PM; the grid grows to fit an earlier or later event.
10. **Weekly chore notes** (Week Agenda only). Ask for recurring chores by weekday, for example "Monday: Trash and recycling go out". These are drawn on the screen and are not calendar events.
11. **Ignored events.** Any event titles to hide, for example `^Work$`?
12. **Calendar fill (optional).** Should you add holidays (which traditions: US federal, Jewish, Christian, Muslim, Hindu, other) and family birthdays as all-day events?

### Google Calendar event colors

| colorId | Google name | colorId | Google name |
|---|---|---|---|
| 1 | Lavender | 7 | Peacock |
| 2 | Sage | 8 | Graphite |
| 3 | Grape | 9 | Blueberry |
| 4 | Flamingo | 10 | Basil |
| 5 | Banana | 11 | Tomato |
| 6 | Tangerine | | |

An event with no color, or with a color that is not mapped, shows as **Other**.

### The pattern limit

The e-ink screen draws each person as a grayscale bar pattern, not a color. The Week Agenda and Month views define these bar patterns: `0, 1, 2, 4, 7, 10` for people and `5` for Other. So **six people and categories** fit without code changes. For more, copy the missing `.cw-bar-3`, `.cw-bar-6`, `.cw-bar-8`, and `.cw-bar-9` rules from `src/full.liquid.template` into `src/agenda.liquid.template` (as `.ag-bar-N`) and `src/month.liquid.template` (as `.mo-bar-N`), and preview them.

Give **Holidays** `invert: true` (white text on black) and give **Birthdays** the outlined bar `2`. Give the most common category (usually Family) the solid black bar `1`.

## Phase 2: Customize the code

1. **People and colors.** Edit `PERSON_COLORS` and `PERSON_ORDER` in `src/lib/eventColors.js`. Each entry is `'<colorId>': { name, bar, colorName }`, plus `invert: true` for holidays. `PERSON_ORDER` sets the legend order.
2. **Tests.** Update `src/lib/eventColors.test.js` to the new names and colors. Its tests pin the current family's names, so they fail until you change them.
3. **Chore notes.** Set `DAY_NOTES` in `src/agenda.liquid.template` (keys are weekdays, `0` = Sunday). Use `{}` for no notes.
4. **Time grid hours.** Change `7*60, 22*60` in the `gridRange(...)` call in `src/full.liquid.template`.
5. **Week start.** Set `CONFIG.firstDayOfWeek` in `src/middleware/calendar_weather_proxy.gs.template` (`0` = Sunday, `1` = Monday). Keep `CONFIG.daysAhead` at `35` or more, because the month view shows five weeks.
6. Run `bun run build`, then `bun test .`. Fix every failure.
7. **Preview.** Render each view with sample events that use the new names and colors, take a screenshot at 1872 x 1404, and show it to the user. Run the render with `TZ=UTC`, because the templates do all-day date math in local time and TRMNL renders in UTC. A view that renders blank usually means a broken script; check the browser console.
8. Commit the customization (without secrets) if the user keeps a fork.

## Phase 3: Deploy the middleware

Follow `MIDDLEWARE_SETUP.md` with the user, one step at a time. Wait for the user to confirm each step.

1. **Make the token.** Run `openssl rand -hex 24` and show the result to the user. Tell the user to save it in a password manager. Do not write it to any file in the repo.
2. The user creates a project at script.google.com and pastes the generated `src/middleware/calendar_weather_proxy.gs` into `Code.gs`.
3. The user sets the project time zone (Project Settings) to the time zone from Phase 1.
4. The user replaces `YOUR_SECRET_TOKEN` with the token in `CONFIG`. Leave `calendarIds` as `[]` unless the user wants to limit the calendars; then the user pastes the calendar ID (Google Calendar > calendar settings > Integrate calendar).
5. The user runs `testCalendarPayload` and approves the Google permission prompt ("unverified app" > Advanced > Go to project).
6. The user deploys a **Web app**: Execute as **Me**, Who has access **Anyone**. The user copies the URL that ends in `/exec`.
7. The user opens the three test URLs from `MIDDLEWARE_SETUP.md` Step 7 and confirms each returns JSON. Write the URLs out with the user's real latitude, longitude, and time zone filled in, and leave the token and script URL as placeholders for the user to fill.
8. The user adds a time-driven trigger for `refreshUpstreamCaches`, every 15 minutes.

Tell the user: every later code edit in Apps Script needs **Deploy > Manage deployments > pencil > Version: New version > Deploy**, or the live URL keeps the old code.

## Phase 4: Create the TRMNL plugins

Repeat for each view that the user picked.

1. **Plugins > Private Plugin > Add new.** Name it, for example `Week Agenda (X)`.
2. **Strategy:** Polling. **Polling Verb:** GET.
3. Paste the form fields from `src/form_fields.yml` into the plugin's custom fields. The user then fills **Middleware URL** and **Middleware token** (a password field), and you give the latitude, longitude, and time zone values to type.
4. Set the three polling URLs, one per line, in this order:

   ```
   {{ middleware_url }}?token={{ middleware_token }}&src=cal&tz={{ timezone }}
   {{ middleware_url }}?token={{ middleware_token }}&src=weather&lat={{ latitude }}&lon={{ longitude }}&tz={{ timezone }}
   {{ middleware_url }}?token={{ middleware_token }}&src=aqi&lat={{ latitude }}&lon={{ longitude }}&tz={{ timezone }}
   ```

5. Save. Open **Edit Markup**, select the **Full** view, and paste the whole matching file: `src/full.liquid`, `src/agenda.liquid`, or `src/month.liquid`. Save.
6. Click **Force Refresh**. The render happens the next time the device checks in.
7. Add the plugin to the playlist. TRMNL sometimes adds a new plugin to the playlist by itself; remove any duplicate.

If you have a browser tool and the user asks you to do steps 4 to 7, you may do them, but the user still types the token. In the TRMNL markup editor (CodeMirror 6), set the text through `document.querySelector('.cm-content').cmView.view.dispatch(...)`, then click the "Save Changes" button. Typing a 25,000-character file key by key is slow and unreliable.

## Phase 5: Fill and color the calendar

Do this only with the user's approval, and only if a Google Calendar tool is available.

1. **Existing events.** List the next few weeks of events. Propose a color for each event by person, show the list, and apply it after a yes.
2. **Holidays** (if asked in Phase 1). Show the list first. Add each one as an all-day event in the Holidays color, marked **free** (does not block time), with notifications off. Holidays with several days get a "first day" and a "last day" entry, not one long bar (for example "Hanukkah (1st night)" and "Hanukkah (8th night)").
3. **Birthdays.** Add each one as a yearly all-day event in the Birthdays color, with notifications off.
4. **Long events.** Sports games and concerts usually need a 3-hour block. Ask the user for their usual lengths.

## Finish

1. Ask the user to send a photo of the screen after the next refresh, and compare it with your preview.
2. Explain the color legend at the bottom of each screen: it names the Google color for each person, so the family knows which color to pick.
3. Point the user to `TROUBLESHOOTING.md` for an empty screen, stale events, or a diagnostic pop-up. Recommend turning off **Show diagnostic overlay** once the screen works.

## Gotchas

- **Stale data after a change:** the middleware cache refreshes every 15 minutes. Run `refreshUpstreamCaches` in the Apps Script editor, then Force Refresh the plugin.
- **Empty later weeks in the month view:** `CONFIG.daysAhead` is below 35 in the deployed script.
- **Part of the screen is cut off on the TRMNL X:** an old copy of the markup is still pasted. Paste the current generated file again.
- **All-day events one day off in a local preview:** run the preview with `TZ=UTC`.
- **Gray text looks too faint on the device:** the TRMNL X shows 16 native grays (multiples of `#111`), so `#333` and `#DDD` render solid there. The OG shows four (`#000`, `#555`, `#AAA`, `#fff`); see ADR 0004.
