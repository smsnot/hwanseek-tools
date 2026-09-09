# Save selected Google Docs pages as a PDF

A free practice package for Google Docs in Microsoft Edge on Windows. It shows how to use **File → Print → Save as PDF → custom pages 1-2** to leave unwanted pages out of a PDF.

- [Read the step-by-step guide](guide.md)
- [Download the practice DOCX](google-docs-pdf-page-range-practice.docx)
- [Open the checked two-page PDF](google-docs-selected-pages-verified.pdf)
- [Open Google Docs](https://docs.google.com/)

The practice DOCX contains two content pages followed by an intentionally blank page. Open it in Google Docs; Microsoft Word is not required for this exercise. Check the imported layout before printing.

## Validation

Checked on September 9, 2026. The account owner manually saved pages 1-2 in Edge 152 on Windows. An AI assistant inspected the resulting PDF and rendered both pages for visual review. It has exactly two Letter-size pages, complete matching text, both green header bands, and a hyperlink to https://hwanseek.blogspot.com/.

The included checked PDF is the actual saved output, not a PDF assembled by extracting pages afterward. Its SHA-256 is `73f60fa723e4ac73df29635de755889f2a67ccdc30a7bff041809d17a3528773`.

An earlier full Google Docs export had three pages. An initial Edge save without changing the page selection had four pages, including two blanks. The reason for that extra blank page was not diagnosed. The checked custom-range output contains only the two requested pages.

## Scope

Page selection changes the PDF output and leaves the original document intact. It does not repair the document's formatting or guarantee identical layout when importing other Word templates. Mobile, Firefox and Safari workflows were not tested. No time-saving percentage is claimed.

The card illustrations are explanatory diagrams, not application screenshots. Sources and the remaining limitations are listed in the guide.
