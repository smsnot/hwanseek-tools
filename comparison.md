# A small line-break experiment

Date: September 9, 2026. Existing tools were run in Edge. These are synthetic text strings, not PDF files supplied by the Reddit authors. The HWANSEEK transformations below were checked with automated tests of the same engine used by its page. They are not a usability study or a timed comparison.

## A: ordinary prose with a blank paragraph separator

Input:
```text
Copy text from a PDF
without fixing every line.

Keep this paragraph separate.
```

PDF Text Cleaner (English, Preserve Lists on, Conservative or Aggressive), TextFixer (Preserve paragraphs when possible), and HWANSEEK (join the first break with a space) all produce:
```text
Copy text from a PDF without fixing every line.

Keep this paragraph separate.
```

The existing tools already handle this example. There is no demonstrated advantage for HWANSEEK here.

## B: heading boundaries without blank lines

Input:
```text
Keep these headings separate
Chapter two
A normal sentence
continues here.
```

PDF Text Cleaner with the two modes above and TextFixer with paragraph preservation produced:
```text
Keep these headings separate Chapter two A normal sentence continues here.
```

HWANSEEK with only the break between lines 3 and 4 joined produces:
```text
Keep these headings separate
Chapter two
A normal sentence continues here.
```

This outcome depends on a person identifying the headings. HWANSEEK's bulk Join single breaks action alone would also merge all four lines. Its difference is an explicit review control for each break, not better automatic interpretation.

## C: numbers and list items

Input:
```text
The value is 1,200.
Do not change it.

- Keep this item
- And this item
```

PDF Text Cleaner, with the stated settings, retained the input unchanged. TextFixer's paragraph-preserving option joined the first two lines and also joined the two list items, keeping the blank paragraph separator. HWANSEEK, joining only the first break, produced:
```text
The value is 1,200. Do not change it.

- Keep this item
- And this item
```

These are different choices, not evidence of an overall accuracy ranking. PDF Text Cleaner already includes a Preserve Lists option.

## What remains untested

No OCR, PDF extraction, multi-column recovery, complex tables, hyphen repair, speed gains, revenue, or general accuracy rate was tested. No independent audit of competitor data handling was performed. HWANSEEK's optional experimental WebMCP registration has not been verified in a supporting browser; its normal interface does not depend on WebMCP.

## Sources

- [Reddit: PDF text pasted into Pages, March 10, 2026](https://www.reddit.com/r/MacOS/comments/1rpjt68/how_to_avoid_line_breaks_while_copy_pasting/)
- [Reddit: Google Docs workflow, November 10, 2022](https://www.reddit.com/r/googledocs/comments/yr023k/how_to_copypaste_text_seamlessly/) — this thread includes an existing add-on solution accepted by its author.
- [PDF Text Cleaner](https://www.pdftextcleaner.org/) — current feature descriptions and direct synthetic runs.
- [TextFixer: Remove Line Breaks](https://www.textfixer.com/tools/remove-line-breaks.php) — current feature descriptions and direct synthetic runs.
