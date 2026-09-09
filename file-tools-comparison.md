# HWANSEEK releases 003–005: scope and comparison

Date: 2026-09-09. All fixtures are synthetic and contain no user documents. No speed, accuracy rate, revenue, or universal superiority claim is made.

## Screenshot Cut Review

Demand: [Windows11 request](https://www.reddit.com/r/Windows11/comments/1soeaz8/snipping_tool_needs_a_cut_out_tool_remove_the/) and [tall-image workflow](https://www.reddit.com/r/fossdroid/comments/1tfm3ew/any_fossy_app_that_lets_me_crop_something_in_the/).

TheToolApp's [browser cut tool](https://thetoolapp.com/crop-out-image/) was exercised in Edge on a 600×1000 PNG with five 200px bands: KEEP A, REMOVE1, KEEP B, REMOVE2, KEEP C. Selecting 20–40% produced a 600×800 preview. Changing to 60–80% produced another 600×800 result: the first removed band returned and only the new selection was removed. No multi-region list or seam option was visible in the inspected workflow. Its downloaded pixels were not audited.

The HWANSEEK browser workflow removed both original-coordinate intervals together. The actual downloaded PNG was 600×656: 600 rows of retained content plus two 28px omission strips. All three retained regions were pixel-identical to the corresponding original regions. Removing the first saved cut restored it and changed the result to 600×828. Pure tests also cover overlap, touching cuts, invalid intervals, image limits, and undo.

[Snagit](https://www.techsmith.com/snagit/features/) and [EasySnaps](https://easysnaps.org/docs/) already document internal cuts; EasySnaps also documents seam markers. Those apps were not executed. The difference is a small browser flow for reviewing multiple cuts, not a new invention or proof of higher demand. One image at a time does not automate a 30–40-image daily workload.

## Subtitle Pair Review

Demand: [Reddit Plex filename request](https://www.reddit.com/r/PleX/comments/1ctrbzr/subtitle_files_mass_rename/). A similar 4chan request, post106981527, was found in search results; its original thread returned404, so it is not treated as a directly read live source.

[AllSubConverter](https://www.allsubconverter.com/batch-rename/) documents browser renaming/ZIP output. [SubRenamer](https://github.com/qwqcode/SubRenamer/blob/main/README.en.md) already documents matching, manual adjustments, multiple languages, and backups. These capabilities were read in official documentation, not executed in this comparison.

HWANSEEK's actual browser example showed two unique suggestions, one missing episode, an ambiguous episode with two videos, and English.srt with no episode. No row was automatically confirmed. Confirming the first two tracks produced a ZIP with exactly Example.Show.S01E01.en.srt and Example.Show.S01E01.fr.forced.srt. Both downloaded contents matched the original bytes. Changing the second name to collide with the first disabled both from export. Pure tests additionally verify multi-episode rejection, unsafe names, case-insensitive collisions, BOM/CRLF and non-UTF8 byte preservation through ZIP.

This tool cannot infer missing folder information, content language, correct releases, or timing. It offers a browser copy workflow, not functionality unavailable elsewhere.

## PDF Highlight Review

Demand: [Reddit replace-underlying-PDF post](https://www.reddit.com/r/Onyx_Boox/comments/1gke5j4/replace_underlying_pdf/) was edited by its author to report a cpdf solution. The [official cpdf annotation-copy documentation](https://www.coherentpdf.com/cpdfmanual/cpdfmanualch10.html) is a valid existing option; cpdf was not executed in this comparison. A different-edition transfer request from 4chan post108418302 was read in a cached board listing; the dedicated thread could not be retrieved.

The actual HWANSEEK browser test extracted two partial-line quotes from an old PDF and found each once on page2 of a revised PDF. The first quote wrapped into two lines. Downloading both confirmed transfers produced a two-page PDF with annotation counts [0,3]: the existing blue target highlight plus two new yellow Highlight annotations. Independent re-opening and page rendering verified those properties. A separate duplicate-phrase file showed three candidate locations without selecting one automatically. Changed wording showed zero candidates; a rotated PDF produced a clear unsupported-page error.

The initial unadjusted output revealed text-layer boundary error: the left edge of the WWW iii example was about3.44PDF points inside the known glyph start. The tool therefore includes optional per-selection left and right edge adjustments (0–6 points each, default0). Padding changes clear that selection's confirmation, and identical padded geometry is used for preview and export. Padding may reach neighboring text and cannot fix extraction order. Do not claim exact glyph boundaries or arbitrary-edition compatibility.

## Validation boundary

Core tests, TypeScript checking, a production build, and the described local in-app-browser workflows were run. The PDF output was additionally inspected through independent PDF parsing and rendering. This is not a mobile-device or cross-browser compatibility audit, a privacy/network audit, or a test on real-world books. Input caps and supported document scope remain important. The application source performs no file-upload request or AI call.

