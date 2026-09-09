# HWANSEEK — Small browser tools

## Image Fit Review

[Open the tool](https://hwanseek.shinhwa7848.chatgpt.site/image-fit-review). Fit up to 30 still JPG, PNG, or WebP images into one exact canvas size, preserving the complete image and aspect ratio. Choose white or transparent padding, inspect each preview, and download distinct PNG copies in a ZIP. Enlargement is off by default. Canvas sides are limited to 4,096 pixels and the canvas to 12 million pixels; generated output is limited to 100 MB. Padding is not AI background extension; PNG copies may be larger than the source.

## Image Size Check

[Open the tool](https://hwanseek.shinhwa7848.chatgpt.site/image-size-check). Create a white-background JPG candidate below an entered maximum file size and width. The bounded search tries quality settings and proportional resizing, measures the actual encoded bytes, and explicitly reports failure when no passing candidate is found. Compare at actual pixels before downloading. One KB means 1,000 bytes. It does not validate a receiving site's content, identity, minimum-resolution, or other upload rules; the search does not guarantee the best possible compression.

## Photo Sheet

[Open the tool](https://hwanseek.shinhwa7848.chatgpt.site/photo-sheet). Arrange up to 60 photos, edit display filenames without renaming originals, and create a multipage A4 or US Letter PDF with two to four columns. Filenames wrap and remain real selectable text. Smaller JPG previews are flattened on white; this is an overview, not a color proof or full-resolution archive. Many Latin, Korean, Chinese, and Japanese characters are supported. Unsupported characters require editing the display name. Unicode labels embed the bundled font and can increase PDF size.

All three image tools process selected files in the browser, with no image-content uploads, AI calls, or browser-storage persistence. Ordinary page and font requests still occur. Shared input limits are 20 MB per file, 12 million pixels per image, 12,000 pixels per source side, and 100 MB total. Animated images and RAW/HEIC are outside scope. Metadata and color profiles are not preserved. See [image-tools-comparison.md](image-tools-comparison.md) for actual tests and qualified competitor observations.

## Screenshot Cut Review

[Open the tool](https://hwanseek.shinhwa7848.chatgpt.site/screenshot-cut-review). Choose a PNG, JPG, or still WebP and mark several full-width horizontal bands. Review the original and result, edit or remove individual cuts, and download a PNG with visible omission markers. Overlapping or touching bands merge. Original pixel width and retained pixels are preserved in the full-size PNG; the preview is scaled. File size may increase.

Limits: 20 MB, 12 million pixels, width 8,000 px, height 20,000 px, 30 cuts. No automatic ad detection, OCR, background reconstruction, redaction check, animation, or batch processing.

## Subtitle Pair Review

[Open the tool](https://hwanseek.shinhwa7848.chatgpt.site/subtitle-pair-review). Paste video names or select videos to read their names only. Choose subtitle files, review S01E01/1x01 episode candidates, select ambiguous pairs manually, edit output filenames, and confirm each row. Download only confirmed, valid subtitle copies as a ZIP. Contents are not rewritten. Language/forced/SDH tags require review; ambiguous generic names and parent-folder context cannot be inferred.

Limits: 100 video names, 100 subtitle files, 2 MB per subtitle, 25 MB total. SRT/ASS/SSA/VTT/text SUB only; VobSub pairs are outside scope. Common Windows filename restrictions and case-insensitive output collisions are checked. There is no timing, translation, video-content, or subtitle-language analysis. Extract the ZIP and place copies beside matching videos yourself.

## PDF Highlight Review

[Open the tool](https://hwanseek.shinhwa7848.chatgpt.site/pdf-highlight-review). Choose an old PDF with embedded Highlight annotations and a revised text PDF. Review extracted passages, correct extraction errors, choose exact-text candidates, inspect both pages, optionally expand the left and right boundaries independently by 0–6 points, and confirm each transfer. Download a separate PDF with real yellow Highlight annotations. Existing target annotations are appended to rather than replaced; the tested existing highlight remains intact.

Matching collapses whitespace but preserves case, punctuation, numbers, and hyphens. Repeated passages require choosing a location. Character positions come from PDF.js's browser text layer and can differ from original PDF glyph boundaries. Manual review and optional padding help; they do not establish perfect alignment. Old highlight colors and comments are not copied.

Limits: 15 MB and 20 pages per file, 100 highlights, 8,000 text characters per page. Simple horizontal left-to-right, single-column selectable text only. No OCR, fuzzy matching, cross-page passages, flattened/external annotations, tables, multicolumn layouts, encrypted files, forms, or signature preservation. Desktop browser recommended. The output is reopened to verify page and Highlight counts before download; check appearance in your PDF reader too.

All three tools process files in the browser without document uploads, AI calls, or browser-storage persistence. Ordinary hosting requests still occur. See [file-tools-comparison.md](file-tools-comparison.md) for actual synthetic tests and fair alternatives.

## List Count Review

[Compare two lists](https://hwanseek.shinhwa7848.chatgpt.site/list-count-review) by occurrence counts. Repeated values count separately. One table shows each matching key, counts in A and B, the difference, and all original pasted line positions. Expand a line cell to see original values. Copy the selected view as a plain-text report, including every page.

Exact string matching is the default. Optional rules ignore case (JavaScript lowercase) or surrounding whitespace; original values remain available. IDs are not converted to numbers, so `001` and `1` remain different. Empty and whitespace-only lines are always skipped, but keep their source positions. Input is limited to 2,000 lines and 100,000 characters per list, with no partial results if exceeded. Results paginate at 50 matching keys.

This is a frequency review, not fuzzy identity matching, row-order comparison, workbook parsing, or quantity-column summation. Line positions refer to pasted input, not original spreadsheet row numbers. The tool cannot decide which source or repeated row is incorrect. Pasted lists are processed locally, without upload, AI calls, or browser storage. See [list-count-comparison.md](list-count-comparison.md) for scoped validation and fair alternatives.

## PDF Line Break Review

A small, free browser tool for text copied from PDFs. Paste a passage, review each line boundary, and choose **Keep break**, **Join with space**, or **Join without space**. The original remains alongside the result.

- [Use the tool](https://hwanseek.shinhwa7848.chatgpt.site/)
- [Research and guides](https://hwanseek.blogspot.com/)
- [Instagram](https://www.instagram.com/hwan_seek/)

## What it does

Nothing is changed automatically on input. You can start with individual joins, or use **Join single breaks** and restore exceptions. Blank and whitespace-only paragraph separators are always protected. Restore all breaks returns the original. Copy uses the browser clipboard and offers a manual selection fallback.

The first version accepts up to 20,000 characters and 200 line breaks. It is deliberately intended for short passages.

## Limits

This is a manual review aid, not automatic paragraph detection. It cannot read PDFs, perform OCR, repair reading order or columns, reconstruct tables, or remove hyphens. Headings, lists, code and poetry require judgment. Existing spaces remain; joining with a space adds one separator space. Line endings may be normalized by the browser textarea, although the core transformation preserves the original separator when a break is kept.

The browser code does not send pasted text to a server, use an AI service, or save it in browser storage. Hosting still entails ordinary page requests. The experimental WebMCP action, if supported by a browser and intentionally invoked by an agent, stages text and returns the result to that invoking agent.

## Development

Use Node.js 22.13+ and pnpm. Install dependencies with `pnpm install`. Then run `pnpm dev`. Run `pnpm build` for the production build. Dependency installation may require explicit approval of the esbuild, workerd and sharp build scripts under your package manager's policy.

The pure transformation tests run with a Node.js release that supports TypeScript type stripping: `node --experimental-strip-types --test tests/*.test.mjs`.

## Validation and comparison

See [comparison.md](comparison.md) for synthetic examples and clearly scoped results. Test strings are invented for this experiment; they are not PDF files supplied by Reddit users. No speed, revenue, accuracy-rate or universal superiority claim is made.

## License

MIT. Third-party dependencies retain their own licenses.

