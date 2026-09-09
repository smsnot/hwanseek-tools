# Image tool comparison observations

## HWANSEEK downloaded results

All input images were synthetic test fixtures. These measurements describe Edge on this test date, not every image or browser.

- Image Fit Review: six inputs (landscape, portrait, transparent PNG and JPEG EXIF orientations 2, 6, and 8), 1920 × 1080, no enlargement. All six downloaded white-background PNGs had the exact requested dimensions; retained photo pixels matched the oriented, white-composited sources exactly in a pixel comparison. A second ZIP using transparent padding had fully transparent corner pixels in all six files.
- Image Size Check: the same 2,884,895-byte, 1200 × 800 noise PNG used for Pi7 produced a downloaded JPG of 173,742 bytes, 936 × 624, at requested encoder quality 52%, under the entered 200,000-byte limit. At a new limit of 173,741 bytes, the UI produced a 144,770-byte candidate. These are bounded-search results, not a best-quality claim. A 1 × 12,000 strip at a 1,000-byte target explicitly reported failure (18,949-byte candidate). Animated WebP was rejected with an explanation.
- Photo Sheet: 24 inputs, A4, three columns, portrait moved first, mixed Latin/Korean/Chinese/Japanese name and a long repeated name. The downloaded PDF had two pages, 12 photos per page. Independent rendering showed all images and labels, correct order, wrapped captions within their column, and no overlap or clipped labels. Independent text extraction recovered all 24 exact filenames and numbered labels. Full Unicode font embedding and disabled localized glyph substitution fix the missing-outline and digit-width issues found during validation. Unsupported glyphs fail explicitly rather than producing replacement characters.
- All 37 automated tests passed, including the existing five tools, and the production build completed. No speed or revenue claim is made. Metadata preservation, exact color matching and receiving-site acceptance are outside the image tools' scope.

## Existing-tool observations

Test date: 9 September 2026. Tested through an Edge browser session using only synthetic fixtures from `work/image-validation/fixtures`. These are bounded UI observations, not a product ranking or an exhaustive feature audit. No competitor output file was obtained or independently inspected.

## A. BatchPNGTools — canvas sizing

Source: [Batch Canvas Resizer](https://www.batchpngtools.com/change-canvas-size)

- Inputs: `landscape.png` (900 × 600), `portrait.png` (600 × 900), and `transparent.png`, selected together. The UI accepted all three and displayed a 3-image gallery.
- Settings: **Fit to Canvas / Scale to Fit All**; custom width **1920** and height **1080**; background **#ffffff**; **Mark Boundaries** turned off for the portrait observation.
- Observed result: the portrait preview showed the full image, including top-left and bottom-left labels, centered on a wide white canvas with white side margins. The transparent fixture preview displayed its colored rectangle on white. The selected Fit mode and 1920 × 1080 fields were visible in the screenshots inspected during the session.
- Export observation: **All (ZIP)** was clicked. The browser did not report a download event within 10 seconds, and the subsequent page state showed no success or error message. ZIP export remains **unverified**; this does not establish that the site's export is broken.
- Scope limit: no exported dimensions, pixel values, file sizes, or alpha channels were measured. The site also exposes Center Inside and Fully Covered modes, but those modes were not tested. No separate enlargement control was evaluated.

## B. Pi7 — 200 KB compression

Source: [Compress Image To 200kb](https://image.pi7.org/compress-image-to-200kb)

- Input: `noise.png`, **1200 × 800**, local fixture size **2,884,895 bytes**.
- Settings: target **200**, unit **KB**; clicked **Compress**.
- Before compression, the UI listed the selected file as `noise.jpeg`, displayed **3 MB**, width **1200 PX**, and height **800 PX**.
- Observed completed result: the result panel displayed **198 KB**, **was 773 KB**, and **74% smaller**, with output name **noise-200kb.jpeg** and a **Download Image** link.
- Measurement limit: **198 KB is the site's displayed result**, not an independent byte count. The result panel did not display output dimensions. No output was downloaded. The displayed “was 773 KB” differs from the input listing of 3 MB and the local fixture byte count; the reason was not investigated.
- Documentation distinction: the result panel said processing happened on-device with nothing uploaded, while the page footer described removing images from a server after 30 minutes. Neither privacy/processing claim was independently verified.

## C. CAPA — contact sheet and filenames

Requested source: [CAPA](https://www.capa.cx/)

- Intended inputs: `landscape.png`, `portrait.png`, the long `long_filename_abc123_…png` fixture, and `photo_서울_漢字_かな_カナ_é.png`.
- Actual blocker: opening the requested URL failed with browser error **net::ERR_NAME_NOT_RESOLVED**.
- No input was uploaded to CAPA; contact-sheet generation, export, long labels, and multilingual filenames could not be evaluated in this session. This is an access failure for this test, not evidence that CAPA lacks any of those capabilities.

## Downloaded artifacts

None. All results above are explicitly limited to the observed UI and the known synthetic inputs.
