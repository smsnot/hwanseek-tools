# List Count Review: scope and checks

September 9, 2026. [Public tool](https://hwanseek.shinhwa7848.chatgpt.site/list-count-review).

## The motivating question

An [r/excel customer-ID comparison question](https://www.reddit.com/r/excel/comments/1jgjity/formula_to_find_matches/) describes repeated IDs that need to match one occurrence at a time. This is a public request, not a user testimonial for HWANSEEK. The examples used here are synthetic and contain no customer's records.

## Same input, different questions

List A: `A100\nA100\nB200`. List B: `A100\nB200\nB200`.

Existing tools were exercised in Edge through their visible interfaces. [ListCombinator](https://www.listcombinator.com/tools/compare-lists/) with Case sensitive off showed two common unique values and zero values unique to either list. Its documented function is a unique-value comparison.

[ListContrast](https://listcontrast.com/) defaults were Remove duplicates on, Ignore surrounding whitespace on, Ignore empty lines on, Ignore case off. Its default result was Only in A 0, In both 2, Only in B 0. Turning only Remove duplicates off produced Only in A 1 (A100), In both 2, Only in B 1 (B200). It already solves unmatched-occurrence comparison. No first, unique, or universal-superiority claim is made.

HWANSEEK's tested core result with both optional rules off is:

| Key | A count | B count | A minus B | A input lines | B input lines |
| --- | ---: | ---: | ---: | --- | --- |
| A100 | 2 | 1 | 1 | 1, 2 | 1 |
| B200 | 1 | 2 | -1 | 3 | 2, 3 |

This is a consolidated presentation with traceable input positions. We did not measure preference, task speed, demand, or revenue.

## Validation method and limits

Ten automated core tests cover opposite count gaps, reordered lists, the Reddit-style numeric example, string IDs and special property names, blank lines and original positions, optional normalization and raw variants, empty/one-sided inputs, whole-input limits, copy-report content, and count conservation at 2,000 lines. The seven existing PDF transformation tests also pass. TypeScript checking, a production build, and a non-browser HTTP route check succeeded. HWANSEEK browser click-through and clipboard permissions were not separately exercised in this release.

The report is plain text, not an Excel/CSV import file. Every data-bearing line has a descriptive prefix; values are JSON-quoted. Matching uses literal strings by default. Ignoring case uses JavaScript lowercase, not language-aware identity matching. Blank/whitespace-only lines are skipped under every setting. Original positions include those skipped lines. Results do not tell you which occurrence should be deleted or which source is correct.

External-tool observations apply only to the fixtures and settings described. We did not inspect their network traffic or audit their privacy implementations.
