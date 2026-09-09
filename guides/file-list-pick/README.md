# File List Pick practice files

This package contains invented images, a one-page PDF, and text files for checking filename-list selection. It contains no personal records. The images are simple labeled illustrations rather than real photographs.

[Open File List Pick](https://hwanseek.shinhwa7848.chatgpt.site/file-list-pick) or read [the quick guide](guide.md).

The tool also has a **Try a small example** button with four invented text files. That built-in example is separate from this 16-file download. Its actual desktop Edge ZIP download was reopened and verified with three selected payload files, totaling 113 bytes, plus a matching report.

## Try the main list

1. Extract `hwanseek-file-list-pick-practice.zip` into a new folder.
2. Select the inner `file-list-pick-practice` folder in the tool.
3. Paste the contents of `request-list.txt`. Each line is one complete filename, including the extension.
4. Review the matches before exporting. For this exercise, choose **Camera B/IMG_0101.JPG** when the same name appears twice.

Expected results from the fixture contents:

| Check | Expected |
|---|---:|
| Files in the selected source folder | 16 |
| Nonblank request lines | 14 |
| Unique requested names | 13 |
| Repeated request lines | 1 |
| Unique names found in exactly one location | 9 |
| Unique names not found | 3 |
| Unique names found in multiple locations | 1 |
| Source files selected after choosing Camera B | 10 |

These expectations matched an automated core-export test under Node 24.19.0. An independent Python ZIP reader confirmed the actual exported paths, file hashes, and report. The in-app browser also selected this real folder, showed the expected results, enforced partial-bundle acknowledgement, and reached a 10-file ZIP-ready state. A browser-saved download of this full fixture was not obtained; the actual Edge download check used the separate small built-in example.

The repeated request is `Project brief.pdf`; it should not produce two copies of the same source file. The missing names are `missing-shot.jpg`, `README.txt`, and `IMG_0102`. A file named `README.TXT` exists, but exact matching distinguishes its uppercase extension. `IMG_0102` omits an extension.

The ambiguous name `IMG_0101.JPG` exists in both Camera A and Camera B. The files have different illustrated content and different hashes. A shared filename does not establish which one the requester meant.

## Check an exported ZIP

The expected selection has 10 source files totaling **77,038 bytes**. A generated report and optional folder entries add archive entries; ZIP entry count alone is not the count of selected source files.

The relative paths and SHA-256 hashes in `expected-results.json` let you compare the exported payload with the original files. `fixture-manifest.json` describes all 16 source files, including the unrequested files. The empty file is intentional and should remain zero bytes.

## Optional edge cases

`request-edge-cases.txt` exercises composed and decomposed Korean names, a filename beginning with a space, brackets and an ampersand, wrong letter case, quoted input, a path, and a wildcard. `expected-edge-cases.json` records the exact names and Unicode code points. The tool may explicitly reject unsupported input, but should not silently broaden a match.

If an application or extraction tool changes Unicode normalization or filename spelling, compare against the manifest before using that extracted folder as a test fixture.

## File formats

- Six valid 480 × 320 JPEG images.
- One valid one-page PDF, with fixture identity `PROJECT-BRIEF-01`.
- UTF-8 text files, including an intentional empty file.
- Main request list uses CRLF line endings; the optional edge list uses LF.

All source files together total **92,907 bytes**. This sample does not test large-file limits, mobile browser support, cloud-only files, or browser cancellation interaction. Separate automated core tests cover cancellation and incomplete-read failures.

## Reproduce the repository tests

The public repository stores the fixture as a ZIP. Before running `tests/file-list-pick.test.mjs`, extract it **into `guides/file-list-pick` from the repository root**. The test reads the 16 physical source files and the adjacent JSON expectations and request list. Installing dependencies alone does not extract the fixture.

Use Node.js 22.13 or newer and the repository's pnpm setup. If dependencies are not installed yet, run `pnpm install` from the repository root.

On Windows PowerShell, from a fresh repository checkout, use 7-Zip at its default installation path:

```powershell
& 'C:\Program Files\7-Zip\7z.exe' x './guides/file-list-pick/hwanseek-file-list-pick-practice.zip' '-oguides/file-list-pick' -y
node --experimental-strip-types --test tests/file-list-pick.test.mjs
```

This extraction was checked with 7-Zip 24.08 on Windows, followed by all six tests passing under Node 24.19.0. In the same check, PowerShell `Expand-Archive` removed the leading space in `Whitespace/ leading-space.txt` and caused the edge-case test to fail, so use an extractor that preserves exact names.

If extracting through an archive application's interface, the `file-list-pick-practice` folder must land at `guides/file-list-pick/file-list-pick-practice`, rather than inside an extra folder named after the ZIP. The resulting paths include:

```text
guides/file-list-pick/
  expected-results.json
  expected-edge-cases.json
  request-list.txt
  file-list-pick-practice/
    Camera A/IMG_0101.JPG
    Camera B/IMG_0101.JPG
    Documents/Project brief.pdf
    ...13 other files
```

The `-y` option allows 7-Zip to refresh the packaged sample files and supporting documents if they already exist. Use a fresh checkout if you have edited them. The sample includes exact Unicode spellings; an extractor that changes those spellings can change the test result.

These six automated tests check exact matches, the exported file bytes and report, edge cases, unsafe output paths, limits, and aborted or incomplete reads. They are core-function tests; they do not replace the separately described browser checks.
