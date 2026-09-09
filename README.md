# HWANSEEK — Small browser tools

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
