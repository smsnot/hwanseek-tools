# HWANSEEK searchable-PDF practice inputs

These are invented English project notes. They contain no real customer, medical, legal, or financial records. The small reference amount is only a transcription check.

The package separates three PDF conditions before any OCR is performed:

| Input | Pages | What is visible | What can initially be extracted |
|---|---:|---|---|
| `clean-image-only.pdf` | 2 | Clear printed notes, embedded as 300 DPI page images | No text on either page |
| `degraded-image-only.pdf` | 1 | The same source content as clean page 1, reduced to 72 DPI, blurred, and slightly rotated | No text |
| `existing-text-control.pdf` | 2 | Page 1: native text. Page 2: a real-text header above an image of the same notes | Page 1: full text. Page 2: only its header |

The PDF files were reopened with pypdf and every page was rendered with Poppler for visual inspection. Both image-only inputs have zero extractable characters. The control has 431 extractable characters on page 1 and 43 on page 2, excluding surrounding whitespace. These checks describe the inputs, not an OCR result.

## Compare against the source

`expected-transcription.json` is the independent source-text oracle, defined before any OCR run. It includes the full expected transcription of each page. Search for these terms and check which page contains the result:

- `MAPLE-0427`: clean pages 1 and 2.
- `cobalt notebook`: clean page 1.
- `BATCH-0018`: clean page 1.
- `73.50`: clean page 1.
- `LAMP-6209`: clean page 2.

The degraded input contains the first four terms. The control visually contains the first four on both pages, but they are initially searchable only on page 1. A search hit on control page 1 must not be counted as a successful OCR result for page 2.

## What to check after OCR

1. Save results as separate PDF files and keep these inputs unchanged.
2. Reopen the output, confirm its page count, and inspect the page appearance.
3. Search the listed terms on the expected pages.
4. Copy a paragraph, an identifier, and the reference amount; compare letters, digits, hyphens, and punctuation with the source text.
5. Record the clear and degraded input results separately, including any wrong or missing text.
6. Treat the existing-text control separately. Its first page does not need OCR. Check whether the second page's image body becomes searchable or remains skipped.

Line wrapping and spacing can change during text extraction; they should not conceal incorrect characters. Passing these selected checks is not an accuracy percentage or a guarantee for other documents. The degraded page is an intentional challenge, not a representative sample of every scan.

`fixture-manifest.json` records exact input hashes, page counts, initial extracted-text counts, and how image quality was changed. OCR output verification is performed separately and is not claimed by this input package.
