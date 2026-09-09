# Shift-row calendar: competitor evidence and build decision

Checked September 10, 2026. This report separates live browser observations, public documentation, and untested calendar behavior.

## Decision

**Build a small monthly row-to-calendar review tool, not another generic shift-code converter.** The credible value is preserving day positions when pasting a spreadsheet row and refusing unresolved cells before export. Replace manual row transposition, date assignment, and repeated code entry with one paste-and-review flow. Existing conversion, night shifts, and preview features alone are not differentiators.

For users whose schedule is already one known code per line, a guide to the existing converter is the lower-effort choice. For a single Amazon Flex screenshot, the supplied Reddit thread describes a different workflow and already links an AI-assisted Shortcut; this monthly-row tool does not solve that input.

## Existing app: what was actually tested

[Penguin Shift Plan to ICS Converter](https://penguinshift2ics.streamlit.app/) was initially asleep. I used its public wake button, waited for the real form, and entered synthetic codes only. No account sign-in or real work schedule was used.

The live form provides a start-date picker, one-code-per-line text, custom shift types/descriptions, all-day and next-day settings, optional exclusion of free days, dated preview, counts/distribution, and an ICS download button. It already includes overnight presets. No time-zone control was visible in the inspected form or expanded overnight configuration.

| Synthetic input/action | Observed output | Interpretation |
|---|---|---|
| `ND2\nDF\nIMC`, initial date 2026-09-09 | Three consecutive preview dates. ND2 shows 20:00–08:45 (+1 day); DF all day; IMC 08:00–16:54. | Basic mapping and overnight preview already work. |
| `ND2\tDF\tIMC`, date set to 2026-09-30 | Warning that the entire tab-separated line is an unknown code; one all-day event; successful-generation message and download button. The visible ICS preview has an all-day DTSTART for September 30. | Pasting a spreadsheet row is not supported as separate daily cells. The warning does not prevent export. |
| `ND2\n\nIMC\nBOGUS`, start 2026-09-30 | ND2 on Sep 30, IMC on Oct 1, BOGUS on Oct 2 as all day; warning plus success. | Empty lines are compacted away. If an empty source cell represented a day, subsequent assignments shift. Unknown code is exported as an all-day entry. |
| Same last test | Month changes to October correctly, and Sep 30 ND2 still says +1 day. | Ordinary month rollover is already represented correctly in preview; it is not a newly discovered gap. |
| ND2 preset: uncheck Ends next day while retaining 20:00 start and 08:45 end; convert `ND2` | Preview shows same-day 20:00–08:45 and a success message; export remains available. | An inconsistent overnight setting is not blocked in the visible flow. Full ICS end field and calendar import were not inspected. |
| First event on Sep 30 changed from the unknown tabbed row to ND2 | Visible ICS previews retained `shift-20260930-0@shiftcalendar.com` as UID while summary changed. | Identity is not tied to the code for that slot. This does not establish how Google will handle corrections. |

The download button was clicked once for the one-item synthetic case, but no downloaded file was located and inspected. Therefore this report does not claim a full-file parse or successful calendar import. Visible first-ten-line ICS output and dated previews are the live evidence. No Google, Apple, or Outlook calendar was modified.

## Public source: related, not proven deployed source

The app exposed creator `kjappelbaum`. A focused search found the same author's [Shift file generator gist](https://gist.github.com/kjappelbaum/14e3bcfd1d5f91ed19c0108f4054e524), created April 26, 2025. Its documentation and Python source were read directly. It uses one code per day, skips empty lines, supplies overnight presets, falls back to an all-day event for unknown codes, and builds date/index UIDs.

**Do not present this gist as the deployed web app's exact source.** The gist takes the first whitespace token from each line, while the live app treated the complete tabbed line as one code; the implementations differ. No exact deployed repository or commit was verified from the app. No competitor code was executed or copied into a new tool.

## Google Calendar: import is a snapshot

[Google's official import instructions](https://support.google.com/calendar/answer/37118?hl=en) support ICS/CSV import on a computer and choosing a destination calendar; the primary calendar is the default. They explicitly say imported events do not remain synchronized. [Official import troubleshooting](https://support.google.com/calendar/answer/45654?hl=en) explains that importing an already-processed file again may process zero new events, and that source/destination time zones should agree.

These documents do **not** establish a universal replacement rule for regenerated files, changed shifts, changed UIDs, or a second person's roster. Do not promise that reimporting corrects old events or is duplicate-proof. Use a separate calendar and inspect a small import before relying on it. Changed schedules need an explicit reconciliation decision, not another blind import. No actual repeat-import test was performed here.

## Demand: close matches and limits

- **September 3, 2019:** a worker receives a spreadsheet each month, identifies their own row as line 56, and wants it in Google Calendar. This is a direct row-extraction pain, although weeks are on separate tabs rather than one clean monthly row. [Original r/excel thread](https://www.reddit.com/r/excel/comments/cz08yv/turning_a_spreadsheet_into_my_calendar/)
- **June 1, 2023:** an employer's new roster system loses Google Calendar integration; the worker can export a monthly table PDF and asks how to add/update calendar entries. This is a direct monthly-roster transfer problem, but PDF extraction and ongoing updates exceed the proposed tool's scope. [Independent r/sheets thread](https://www.reddit.com/r/sheets/comments/13xbrjg/how_to_convert_a_pdf_roster_to_google_calendar/)
- **January 3, 2025:** a user asks Gemini to extract their day/night shifts from Excel, but the resulting ICS attempt does not complete. [r/GeminiAI thread](https://www.reddit.com/r/GeminiAI/comments/1hspymu)
- The supplied [Amazon Flex screenshot thread](https://www.reddit.com/r/shortcuts/comments/1q7vh3n/shortcut_to_add_work_schedule_from_screenshot_to/) concerns individual job listings, including location and start/end time. It is context for repeated entry friction, not direct evidence for monthly code-row demand. The thread already links a ChatGPT-assisted Shortcut; that Shortcut was not executed.

The two closest monthly examples are old. They establish recurring types of friction, not current search volume, broad adoption, or product demand. No such numbers were measured.

## Minimum credible build slice

1. Select a month and work time zone. Paste exactly that month's daily code cells, optionally with the matching day-number header. Preserve empty tab-separated cells; never remove them and shift later dates.
2. Collect distinct codes. Require the user to assign each to shift times or OFF. Do not guess what `N`, `D`, `0`, or a blank means. Reject unknown codes, empty cells, invalid headers, and a day-count mismatch.
3. Show original cell position/code alongside the actual date and resulting start/end. Permit an overnight end in the next month. Reject zero/negative intervals and DST wall times that are ambiguous or do not exist; do not silently choose an occurrence.
4. Export a static ICS only after the input resolves. Explain destination-calendar choice and repeat-import limits beside the download. This replaces the conversion flow; it is not an extra checker users must run before another converter.

Leave OCR, arbitrary PDF extraction, automatic shift-pattern prediction, direct Google account access, recurring synchronization, team rosters, and change reconciliation out of this build. They are separate products or workflows.

## Stress cases the new build must pass

- **Position loss:** 30-day month, copied TSV contains a blank on day 10. Keep it as unresolved day 10; never relabel day 11's code as day 10.
- **False work event:** one misspelled code among known ones. Block export instead of generating an all-day work entry.
- **Month/DST collision:** last-day overnight shift must end next month; a skipped or repeated local clock time must require correction rather than silent normalization.
- **Intentional misuse:** someone inserts an empty cell or a made-up code into a copied row, skips the warning, and tries to export. The intended behavior is no downloadable calendar until every original day is accounted for. This is a synthetic test, not an allegation of malicious activity by the competitor.

Conventional alternative: put one known code on every line in the existing app, fill explicit OFF codes, and review every date. More radical alternative: make the calendar converter refuse to infer missing days or code meanings at all. The latter is less permissive but removes the hidden date-repair work that starts after an apparently successful import.
