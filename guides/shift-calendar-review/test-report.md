# Shift Calendar Review: test report

Checked September 10, 2026 using synthetic schedules only. **Ten core tests passed, along with the production build and TypeScript check.** Local Edge validation and an actual browser-downloaded calendar file were also checked. Public deployment and calendar-app import are outside this report's verified scope.

## Automated checks

The ten tests in `tests/shift-calendar.test.mjs` cover these behaviors:

| Area | Checked result |
|---|---|
| Complete September row | 30 original daily positions; 20 work events; 10 OFF days excluded |
| Blank preservation | Empty TSV, comma-separated, and newline cells retain positions; unresolved rows cannot export |
| Month/header integrity | Wrong daily count and missing/repeated day-number headers rejected |
| Code meanings | Unknown and case-mismatched codes block export; no fallback all-day event |
| Month/year boundary | Leap February 2028 and December 31, 2026 overnight shifts end in the next month/year |
| Time zones | New York's missing 2026-03-08 02:30 and repeated 2026-11-01 01:30 rejected; ordinary DST and Kolkata half-hour offsets correct |
| Invalid/colliding input | Equal hours, adjacent overlaps, null, infinity, negative/invalid month, bad types, invalid zone, and oversized input rejected |
| Untrusted code text | Control-character injection rejected; allowed punctuation escaped; prototype-like code names handled as data; UTF-8 lines folded within 75 bytes |
| Export consistency | Export snapshots the plan before asynchronous work; later edits do not mix schedules; identical plan data has stable event IDs |
| All-OFF month | Valid for review; no empty, misleading calendar export |

The supported input is one full month from 2000 through 2100, up to 8,000 pasted characters, and one shift or OFF per date. Equal start/end and 24-hour shifts are unsupported. A work interval crossing a clock change may have a different elapsed duration from its wall-clock span.

## Local browser and downloaded file

In Edge, a blank September 2 stayed on September 2, September 3's `N` stayed on September 3, and download was disabled. A synthetic `ZZ` code produced the unknown-code warning. The normal sample displayed 30 days, 20 work events, and 10 OFF days.

The sample calendar was downloaded through the local app's actual button and reopened. An independent check using Python date arithmetic compared every start, end, and summary with the source row.

- 20 events matched their expected dates, times, and summaries.
- 10 OFF days created no events.
- All 20 event IDs were unique.
- CRLF line endings were valid.
- File SHA-256: `383c18fd11efb75bcb593ed1608d001a2ae7a01381a20979c62a26b21e8deb7c`.

The publication artifacts include `example-row.txt`, `example-september.ics`, and `browser-download-verification.json`. The sample uses the default D 07:00–19:00 and N 19:00–07:00 definitions in Asia/Seoul. These are synthetic examples, not employer-standard code meanings.

## Structural hazards and tested prevention

**Date compaction:** deleting a blank daily cell can shift every later event while leaving a plausible calendar. Tests confirmed that the original blank position remains visible and blocks export; it is not silently removed.

**Date/time collision:** a night shift can cross a month boundary, overlap the following day's shift, or encounter a missing/repeated local clock time. Rollover, overlap rejection, and clock-change rejection were tested. The tool does not guess which repeated hour was intended.

**Concurrent editing:** a user can change a row or code definition while event IDs are being generated. The test changes both after export starts and confirms the file remains a complete snapshot of the original plan.

**Deliberate misuse sequence:** define a code containing a line break followed by a fake calendar property, assign it to a day, and attempt export. Control-character validation rejects that code. A separate allowed-punctuation case confirms that semicolons/backslashes are escaped and cannot introduce an alarm or additional event. Prototype-like code names remain ordinary code data. These are preventive tests, not claims of unresolved vulnerabilities.

## What these checks do not establish

No Google, Apple, or Outlook calendar import was executed. No phone was used. No real roster, personal calendar, subscription, or employer system was accessed. A valid downloaded file does not establish client-specific display, reimport replacement, duplicate handling, reminders, or ongoing synchronization.

[Google's import help](https://support.google.com/calendar/answer/37118?hl=en) states that imported events do not stay synchronized. Its [troubleshooting help](https://support.google.com/calendar/answer/45654?hl=en) describes an already-processed file adding zero new events. Neither is a guarantee that a revised export replaces an earlier schedule. Use a separate destination calendar and inspect the result before relying on it.
