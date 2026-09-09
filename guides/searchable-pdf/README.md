# Searchable scanned PDF practice guide

Use the existing free [NAPS2 application](https://www.naps2.com/) to add OCR text to image-only scanned PDFs. This HWANSEEK package contains synthetic English practice PDFs and a guide; it does not redistribute NAPS2 or provide a new OCR application.

- [Read the step-by-step guide](guide.md)
- [Download NAPS2 from the official project](https://www.naps2.com/download)
- [Clear image-only PDF, two pages](fixtures/clean-image-only.pdf)
- [Degraded image-only PDF, one page](fixtures/degraded-image-only.pdf)
- [Existing-text control, two pages](fixtures/existing-text-control.pdf)
- [Actual clear searchable output, two pages](results/clean-searchable.pdf)
- [Actual degraded searchable output, one page, including OCR errors](results/degraded-searchable.pdf)
- [Expected transcription and page-specific checks](fixtures/expected-transcription.json)
- [Fixture manifest and input hashes](fixtures/fixture-manifest.json)
- [Test report and exact command-line reproduction steps](test-report.md)
- [Detailed page-level comparison](report.json)
- [Source references](sources.json)

## Verified scope

NAPS2 8.3.2 portable for Windows was run through its official console, with English OCR and default Fast mode. The clear two-page PDF's full whitespace-normalized text matched the source in both pypdf and PDFium. All four selected terms were present in the degraded output, but other text was incorrect, including `ID` becoming `1D`. The control retained native text on page 1; page 2 retained only its header and did not gain its image-body text.

Every output page was inspected. Page counts stayed 2, 1 and 2, but the conversion is not described as lossless: rendered pixels changed and the clean page boxes changed by approximately 0.002 point at most. The graphical instructions are based on official documentation, not a completed graphical-interface test. Per-page phrase checks use extracted text, not a test of a particular reader's Find button.

There are five public PDFs: three inputs and two actual NAPS2 outputs. The control output remains part of the internal verification; its complete page-specific results are in `report.json`. App binaries are not included.

Preserve the input and save to a new filename. After OCR, search on each page and compare copied text, numbers, page order, and appearance. A successful phrase search is not an accuracy guarantee. NAPS2 normally skips imported pages that already contain text, including a page with a real-text header above an image body.

## License and attribution

The newly authored HWANSEEK guide, synthetic practice documents and their generated outputs are provided under this repository's [MIT license](../../LICENSE). They contain invented practice material, not private records. NAPS2 is a separate project under its own license; see its [source repository and license](https://github.com/cyanfish/naps2). No NAPS2 binaries are redistributed here.
