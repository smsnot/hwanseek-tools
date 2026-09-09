# Shift Calendar Review: editorial and source check

Checked September 10, 2026. The local build, ten automated tests, browser validation, and an actual downloaded file were verified. Public deployment is not verified by this report. All described work schedules are synthetic. No calendar-app import, phone action, private roster, or employer-system connection was tested.

## Suggested metadata

- Title: Turn a Monthly Shift Row into a Calendar You Can Check
- Search description: Paste a monthly shift row, confirm each code and date, then export an ICS file. Check blanks, overnight shifts, time zones, and repeat-import limits.
- Labels: Work schedules, Calendar, Google Calendar, Spreadsheets, Free tools
- Product name: Shift Calendar Review
- Planned tool URL: https://hwanseek.shinhwa7848.chatgpt.site/shift-calendar-review
- GitHub guide: https://github.com/smsnot/hwanseek-tools/tree/main/guides/shift-calendar-review
- Card media prefix: https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/shift-calendar-review/

## Evidence boundaries

| Claim | Basis | Status |
|---|---|---|
| Existing converter already offers custom codes, dated preview, and overnight shifts | Live app with synthetic ND2/DF/IMC examples | Observed September 10, 2026 |
| Existing converter compacts blank lines and permits unknown all-day output | Synthetic tabbed row and blank-line tests in live app | Observed; complete downloaded ICS not inspected |
| Existing inconsistent same-day overnight setting still shows success/export | Synthetic ND2 configuration test | Visible flow observed; downstream import untested |
| Same-author gist is the exact deployed source | No matching deployed commit found; parsing behavior differs | Not established; never claim |
| Google ICS import uses a computer and destination-calendar selection | Google official import help | Documented |
| Import is static, not synchronization | Google official import help | Documented |
| Reimport reliably replaces a revised roster | Not guaranteed by official help; no calendar account test | Do not claim |
| HWANSEEK monthly positions, code resolution, month rollover, DST blocking, snapshot consistency, and ICS safeguards | Ten passing core tests; source reviewed | Tested on the local build; see test-report.md |
| HWANSEEK local browser retains blank date positions and prevents unresolved export | Edge: empty September 2 stayed September 2, September 3 N unchanged, download disabled; unknown ZZ warning | Observed |
| Actual local-browser download contains the expected synthetic schedule | Independently reopened file: 20 matching events, 10 OFF excluded, 20 unique IDs, CRLF valid | Verified; calendar-app import not executed |
| HWANSEEK production build and TypeScript check | Completed checks | Passed |
| Public deployed URL loads and downloads a usable ICS | Separate deployment verification | Not verified by this report |

## Primary references

- [Penguin converter](https://penguinshift2ics.streamlit.app/)
- [Related public source by kjappelbaum](https://gist.github.com/kjappelbaum/14e3bcfd1d5f91ed19c0108f4054e524), created April 26, 2025; related, not confirmed deployed source
- [Google Calendar import instructions](https://support.google.com/calendar/answer/37118?hl=en)
- [Google Calendar import troubleshooting](https://support.google.com/calendar/answer/45654?hl=en)

## Demand references and fit

- [September 3, 2019: monthly spreadsheet, own row, Google Calendar](https://www.reddit.com/r/excel/comments/cz08yv/turning_a_spreadsheet_into_my_calendar/). Direct row-transcription pain; weeks span tabs, so the supplied input is not directly pasteable into this narrow tool.
- [June 1, 2023: monthly roster table, lost calendar integration](https://www.reddit.com/r/sheets/comments/13xbrjg/how_to_convert_a_pdf_roster_to_google_calendar/). Independent demand, but PDF extraction and automatic update are outside scope.
- [User-supplied Amazon Flex screenshot request](https://www.reddit.com/r/shortcuts/comments/1q7vh3n/shortcut_to_add_work_schedule_from_screenshot_to/). Different input: individual job screenshot with a start, end, and location. Do not use it as direct monthly-row demand or promise that this tool solves it.

The monthly examples are old. Do not make current adoption, quantified search-volume, or measured time-saving claims.

## Bottleneck and subtraction

The bottleneck is rebuilding the connection between a code's cell position and its actual date, then repeating the same code-to-time mapping. The assumption to challenge is that a converter may discard blank space because only visible codes matter. In a daily row, an empty cell is still a date.

First remove avoidable conversion: use the employer's reliable calendar export or subscription if one exists. Otherwise combine paste, code mapping, and dated review in one flow. Do not add a second repair utility after conversion.

Conventional alternative: prepare one known code per line for an existing converter and manually review dates. More radical alternative: require a complete month's positions before creating any event. This sacrifices permissive partial input to expose missing information before it becomes a plausible calendar.

## Synthetic-only checks completed

1. A 30-day row with a blank retained its original date; later codes did not move. TSV, comma-separated, and one-code-per-line blanks were covered. Missing days and incorrect headers were rejected.
2. Unknown and case-mismatched codes blocked export. OFF retained its date and produced no event. An all-OFF month did not create an empty calendar.
3. February 29, 2028 and December 31, 2026 overnight shifts ended in the next month/year. Adjacent overlaps and equal hours were rejected.
4. New York's missing March 8, 2026 02:30 and repeated November 1, 2026 01:30 were rejected. Ordinary DST timing and Kolkata's half-hour offset matched expected UTC instants.
5. Code injection, prototype-like code names, invalid types, oversized input, and edits during asynchronous export were covered. Calendar text escaping, UTF-8 line folding, and stable same-plan IDs were checked.
6. The actual local Edge download was reopened and compared independently with Python date arithmetic: 20 event starts, ends, and summaries matched, 10 OFF dates were absent, 20 IDs were unique, and CRLF was valid. This is file verification, not a calendar-app import.

Two critical failures are source-cell compaction shifting later dates and an overnight shift crossing a month or DST boundary with the wrong instant. A corrected-file reimport is a separate collision risk; the guide directs deliberate reconciliation and makes no automatic-update promise.

## Scope of this report

This report covers source review, local product checks, and the downloaded example file. It does not establish the availability or behavior of a public deployment. The local UI labels, input formats, and default examples have been reconciled with the guide.

The five cards are synthetic diagrams, not screenshots. Their PNGs were visually checked, and each has matching descriptive alternate text.
