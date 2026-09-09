# Turn a monthly shift row into a calendar you can check

**Quick answer:** copy only your daily shift cells for one complete month, paste them into [Shift Calendar Review](https://hwanseek.shinhwa7848.chatgpt.site/shift-calendar-review), set what each code means, and compare the dated preview with your roster before downloading the calendar file. Import the file into a separate calendar so you can inspect it before relying on it.

This is for a monthly row of codes such as `D`, `N`, and `OFF`. A screenshot, a PDF, a whole staff table, or a single delivery-job listing needs a different starting point. If your employer already offers a calendar subscription or a working calendar export, use that and skip rebuilding the schedule.

## Keep the dates attached to the cells

The main risk is a plausible calendar with the wrong dates. If a blank cell disappears during conversion, every later shift can move one day. If an unfamiliar code becomes a generic all-day event, the calendar can look complete while the actual work hours are missing.

The purpose of this flow is to remove manual transposition and repeated date entry while keeping the original daily positions visible. The roster remains the source of truth.

## 1. Copy one complete monthly row

Select **Month** and **Work time zone** under **Your monthly row**. Use the time zone where the work takes place. Do not assume the zone of the phone or computer you are currently using is the work zone.

Copy your own daily cells, beginning on day 1 and ending on the month's final day. Leave names, employee numbers, totals, and other people's rows out. A 30-day month needs 30 daily cells, including days off.

Paste them into **Codes, from day 1 to the last day**. You may include a matching day-number header from `1` through the last day above the row. A tab-separated spreadsheet row is the best way to retain empty daily cells. Plain comma-separated codes or one code per line also preserve empty positions; a space-separated row works when every day has a code. A blank is unresolved information: check the source and replace it with the correct code or an explicit day-off code. Do not close the gap by deleting it.

## 2. Tell the tool what every code means

Under **What each code means**, confirm each distinct code as either work hours or a day off. Codes are case-sensitive: `N` and `n` are different entries.

The starting examples are `D` at 07:00–19:00, `N` at 19:00–07:00, and `OFF` as a skipped day. These are examples, not definitions supplied by your employer. Change them to match your own roster before exporting. An OFF day must retain its place in the month even though it creates no work event.

For an overnight shift, confirm that the end is on the next date. A September 30 shift from 22:00 to 06:00 belongs on September 30 and ends on October 1. A short-looking clock interval is not permission to guess the intended day.

## 3. Review the dated result against the roster

Use **Dates beside your codes** to compare each original day and code with its dated start and end. Check the first shift, the last shift, days around every OFF code, and every overnight shift. Resolve blanks, unassigned codes, an incorrect header, or a wrong day count before downloading.

Daylight-saving changes need extra care. Some local clock times do not occur when clocks jump forward; other times occur twice when clocks move back. The tool rejects those start or end times. It cannot choose the first or second occurrence of a repeated hour. If your schedule needs that distinction, use the employer's export or another deliberate calendar-entry method for that schedule. Do not change a work day to OFF just to make the file export.

## 4. Download, then import into a separate calendar

Choose **Download calendar (.ics)** after the preview matches the roster. The file is a snapshot of this version of the month. It is not a connection to the employer's schedule.

For Google Calendar, use a computer. Open **Settings → Import & export**, select the `.ics` file, choose the destination calendar, and import. Google defaults to the primary calendar, so select your separate shift calendar deliberately. These steps follow [Google's official import instructions](https://support.google.com/calendar/answer/37118?hl=en).

Inspect the imported first and last shifts, an overnight shift, and a day off. Confirm times in the calendar's intended time zone. This guide does not claim a Google, Apple, or Outlook import was executed as part of its verification.

## When the roster changes

Google says imported events do not stay synchronized with the original source. Its [import troubleshooting page](https://support.google.com/calendar/answer/45654?hl=en) also explains that reimporting a file already processed can add zero new events. Neither behavior makes a regenerated file a reliable schedule-update mechanism.

Do not assume a second import will replace a changed shift or avoid all duplicates. Compare the old and new versions, then deliberately reconcile the affected events in the destination calendar. If the employer offers a subscription, that is the better fit for a changing schedule. Keep the original roster available until you have checked the calendar.

## Two failure cases to catch before relying on the calendar

**A blank day could shift the rest of the month.** You copy 30 cells, but day 10 is empty. Removing that cell changes the relationship between the source and the date. The tool keeps the empty position and blocks download until it is resolved. In the local browser check, an empty September 2 stayed on September 2, September 3's `N` stayed on September 3, and download was disabled. Resolve the missing day in place, then check its neighbors against the original row.

**An overnight shift can cross a month or clock change.** A shift on the last day may end next month. Automated checks covered leap-day rollover and December 31 ending in the next year. They also confirmed rejection of a missing New York clock time on March 8, 2026 and a repeated time on November 1, 2026. These checks protect against silent date or clock guesses; you still need to confirm both dates and the work zone against your source.

An intentional misuse check tries to insert a line break and a fake calendar property into a shift code, then download the file. The tested validation rejects control characters in codes, and permitted punctuation is escaped in calendar text. Separate tests reject unresolved codes and blanks before export. These are tested safeguards, not reports of current tool failures.

## What changed in this workflow

The conventional route is to put one known code on every line, assign a start date, convert, and inspect the result. [Penguin's existing converter](https://penguinshift2ics.streamlit.app/) already provides custom codes, a dated preview, and overnight shifts.

Shift Calendar Review starts with the month and the original daily positions. It keeps the review beside the conversion, so there is no separate cleanup tool between the spreadsheet and the calendar. Its narrower input rule means an incomplete or ambiguous row needs correction first.

## Limits and verification

This tool accepts one full month from 2000 through 2100, with up to 8,000 pasted characters and one shift or day off per date. It does not support split shifts, 24-hour shifts, or equal start and end times. Overlapping adjacent shifts are rejected. An all-OFF month can be reviewed but has no file to export. Shift codes are case-sensitive, 1–32 characters, and cannot contain spaces, commas, or control characters.

It does not read screenshots, extract a PDF, infer your shift pattern, import a team roster, subscribe to an employer system, or reconcile revised calendars. A full monthly row and confirmed code meanings are required. An employer's reliable export is usually the shortest route.

**Checked September 10, 2026:** ten automated checks, the production build, and the TypeScript check passed. A local Edge download was reopened and independently compared against the synthetic September roster: all 20 event starts, ends, and summaries matched; 10 OFF days were excluded; all 20 event IDs were unique; and line endings were valid. No personal roster, phone action, or calendar-app import was tested. See the [test report](https://github.com/smsnot/hwanseek-tools/blob/main/guides/shift-calendar-review/test-report.md) for the exact scope.

To repeat the basic check safely, use a synthetic full month, add one blank and one unfamiliar code, and confirm that export stops. Restore valid codes, include a final-day overnight shift, download, and inspect the resulting dates before trying any calendar import. Use a separate calendar if you choose to test importing.

## Sources

- [Google Calendar: Import events](https://support.google.com/calendar/answer/37118?hl=en)
- [Google Calendar: Fix problems importing](https://support.google.com/calendar/answer/45654?hl=en)
- [Penguin Shift Plan to ICS Converter](https://penguinshift2ics.streamlit.app/), live synthetic browser observations checked September 10, 2026
- [Public same-author Shift file generator gist](https://gist.github.com/kjappelbaum/14e3bcfd1d5f91ed19c0108f4054e524), related source, not confirmed as the exact deployed app

The recurring task appears in a [monthly spreadsheet-to-calendar request from September 3, 2019](https://www.reddit.com/r/excel/comments/cz08yv/turning_a_spreadsheet_into_my_calendar/) and an independent [monthly roster transfer request from June 1, 2023](https://www.reddit.com/r/sheets/comments/13xbrjg/how_to_convert_a_pdf_roster_to_google_calendar/). Their input layouts differ from this tool's exact scope; they are examples of the problem, not evidence of current search volume.

[Open Shift Calendar Review](https://hwanseek.shinhwa7848.chatgpt.site/shift-calendar-review) · [GitHub guide](https://github.com/smsnot/hwanseek-tools/tree/main/guides/shift-calendar-review)
