# NAPS2 searchable-PDF practice: test report

Date: September 9, 2026. All documents are newly authored synthetic English notes. This is a small reproducible example, not a comparative OCR benchmark.

## Actual execution and independent checks

The OCR run used **NAPS2 8.3.2, official Windows x64 portable release, English recognition, default Fast mode**, through `NAPS2.Console.exe`. English components were installed using its official component-install command. No scanner was used. Inputs and outputs had separate filenames.

The article's graphical instructions follow [NAPS2's official OCR documentation](https://www.naps2.com/doc/ocr); the graphical interface was **not directly tested**. The completed processing used the official console commands below. Search checks were case-sensitive substring checks on each page's separately extracted text, not a claim that a PDF reader's Find/Copy interface was exercised.

Independent read-only verification used pypdf and PDFium through pypdfium2. Both parsed each page separately. Each output was compared with the source-text oracle that existed before OCR. Whitespace normalization collapses whitespace runs to one space and strips endpoints; it does not change case, punctuation, or incorrect characters.

All five output pages were rendered with Poppler `pdftoppm 26.07.0` at 120 DPI and inspected. Every input page had also been separately inspected. Original input hashes, output hashes during validation, and the frozen oracle were unchanged.

## Page-specific findings

| File/page | Before | After | Full source-text match after whitespace normalization |
|---|---|---|---|
| Clear, page 1 | No extractable text | MAPLE-0427, cobalt notebook, BATCH-0018 and 73.50 all present | Yes, both parsers |
| Clear, page 2 | No extractable text | MAPLE-0427 and LAMP-6209 present | Yes, both parsers |
| Degraded, page 1 | No extractable text | All four applicable selected terms present; other text incorrect | No, both parsers |
| Control, page 1 | Complete native text | Same native text retained | Yes, both parsers |
| Control, page 2 | Real-text header only | Same header only; all four image-body terms still absent | No: the image body was not recognized |

The control's page-1 matches must not be counted as OCR success on page 2. That second page contains existing text in its header, consistent with NAPS2's documented rule to leave imported pages with text alone.

## Actual degraded-output errors

The selected terms `MAPLE-0427`, `cobalt notebook`, `BATCH-0018` and `73.50` were all present. Nevertheless, the output contained these errors:

| Visible source | Extracted output |
|---|---|
| `Project ID` | `Project 1D` |
| `Synthetic practice` | `‘Synihietic penctice` |
| `Check the printed list before filing the pages.` | `Check the printed list before filing the pages:` |

The JSON report retains the complete expected and actual text. These errors establish that passing four selected searches is insufficient; they do not establish an accuracy rate for typical scans.

## Appearance, geometry and sizes

The clear output had intact headings, lines, footers, margins and page order. No visible clipping or missing sections appeared at the reviewed scale. The degraded output retained the input's blur, compression artifacts, low contrast and slight tilt; OCR did not visually repair those defects. No new visible text overprint was observed.

All page counts matched: clear 2, degraded 1, control 2. The clean media/crop boxes changed from 612 × 792 points to 612.001 × 792.002 points. At native 120-DPI rendering, this rounded to 1021 × 1321 pixels instead of 1020 × 1320. Maximum page-box coordinate change was approximately 0.002 point.

Fresh same-size renders of the clean pages had mean absolute RGB-channel differences of 1.44853 and 1.49025 on a 0–255 scale. They were not pixel-identical. The degraded page kept exact page boxes but also had changed pixels. Both control pages were pixel-identical with this renderer at this DPI. These renderer-specific measurements are not a universal layout guarantee or an OCR accuracy percentage.

| Case | Input bytes | Output bytes |
|---|---:|---:|
| Clear | 382,594 | 375,607 |
| Degraded | 56,801 | 64,253 |
| Existing-text control | 263,563 | 335,432 |

The run emitted a SixLabors.Fonts `Table name missing` warning and exited with code 0. We validated the actual saved files rather than relying on that exit code. The warning did not prevent these files from opening, rendering, or producing the measured text; that does not establish its effect in other environments.

## Reproduce the command-line workflow

Download the **8.3.2 Windows x64 portable ZIP** from [the official NAPS2 download page](https://www.naps2.com/download), extract it completely, and keep the practice `fixtures` directory. The example below assumes the extracted application directory is named `naps2-8.3.2` next to `fixtures`; adjust that directory name to yours. Run PowerShell in their parent directory. Use new output filenames that do not already exist.

```powershell
$naps2 = '.\naps2-8.3.2\App\NAPS2.Console.exe'
& $naps2 --install ocr-eng
& $naps2 -i '.\fixtures\clean-image-only.pdf' -o '.\reproduced-clean.pdf' -n 0 --ocrlang eng
& $naps2 -i '.\fixtures\degraded-image-only.pdf' -o '.\reproduced-degraded.pdf' -n 0 --ocrlang eng
& $naps2 -i '.\fixtures\existing-text-control.pdf' -o '.\reproduced-control.pdf' -n 0 --ocrlang eng
```

These use the same processing arguments as the completed runs, with portable relative paths substituted for the test machine's paths. `-n 0` prevents a scanner acquisition, and `--ocrlang eng` enables English OCR. The initial component download needs Internet access. Our run used the default Fast recognition mode; changed saved OCR settings may affect a reproduction. See the [official command-line reference](https://www.naps2.com/doc/command-line).

Then open each output, inspect every page, and compare its extracted text with [expected-transcription.json](fixtures/expected-transcription.json). Check characters as well as phrases. Different application versions, language data or settings can change recognition and PDF bytes. The reference output hashes identify our actual artifacts, not an expected hash for every rerun.

## Download the comparison files

- [Clear input](fixtures/clean-image-only.pdf) and [actual clear output](results/clean-searchable.pdf)
- [Degraded input](fixtures/degraded-image-only.pdf) and [actual degraded output, including OCR errors](results/degraded-searchable.pdf)
- [Existing-text control input](fixtures/existing-text-control.pdf). Its processed output was inspected and is described per page in the report; it is not one of the public PDF downloads.
- [Detailed report with exact expected/actual text, hashes and metrics](report.json)

There are **five public PDFs: three inputs and two actual NAPS2 outputs**. No application binaries or private documents are included. The original inputs are preserved. No handwriting, multilingual, screen-reader structure, general repair, speed, or comparative-engine accuracy claim is made.
