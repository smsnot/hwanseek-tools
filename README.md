# HWANSEEK — PDF Line Break Review

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

The pure transformation tests run with a Node.js release that supports TypeScript type stripping: `node --experimental-strip-types --test tests/linebreaks.test.mjs`.

## Validation and comparison

See [comparison.md](comparison.md) for synthetic examples and clearly scoped results. Test strings are invented for this experiment; they are not PDF files supplied by Reddit users. No speed, revenue, accuracy-rate or universal superiority claim is made.

## License

MIT. Third-party dependencies retain their own licenses.
