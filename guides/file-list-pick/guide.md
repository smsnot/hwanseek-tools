# File List Pick guide

[Open File List Pick](https://hwanseek.shinhwa7848.chatgpt.site/file-list-pick).

## Start without choosing a folder

Choose **Try a small example**. It creates four invented text files and a five-line list in the page. Choose **Team B/notes.txt**, review the missing request, acknowledge the partial bundle, and create a ZIP. It contains three selected files plus `report.json`.

## Pick your own files

1. Select the common parent folder containing your files.
2. Paste one complete filename per line, including the extension.
3. Review found, missing, repeated-request, and same-name results.
4. Unique matches are selected initially. Deselect any you do not want. Choose candidate paths explicitly for ambiguous names, or skip those requests.
5. Acknowledge missing or skipped requests before exporting a partial bundle.
6. Download the ZIP and review `report.json`.

The archive stores selected source files under `files/`, keeping their relative paths. It contains each selected source once. It does not move or rewrite originals.

## Matching rules

Matching is exact and case-sensitive. Spaces, commas, extensions, and Unicode spelling are retained. Empty lines and one initial byte-order marker are ignored. Do not use wildcard patterns, quoted lists, shortened filenames, or path strings as filename requests.

Missing means absent from the folder you selected. It does not mean the file is absent from your device or cloud account. A shared filename does not establish identical contents or tell the tool which version someone intended.

## Limits

- 10,000 indexed source files.
- 1,000 nonempty request lines, with at most 120,000 input characters.
- 64 MiB (67,108,864 bytes) of selected source-file content. Archive and report overhead are additional.
- Unsafe or Windows-reserved output paths and paths colliding under case-insensitive or Unicode-normalized comparison are blocked.
- The ZIP uses storage without compression. It preserves file bytes and relative paths, not empty folders, permissions, or filesystem metadata.

The feature processes files locally in the browser. Its source audit found no upload, external-API, or browser-storage calls in the new file-handling code. Normal hosting requests occur when loading the webpage.

## Practice and verification

[Download the larger practice ZIP](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/guides/file-list-pick/hwanseek-file-list-pick-practice.zip). Select the inner `file-list-pick-practice` folder and paste the included request list. This is a separate 16-file sample; its README describes the expected 10-file selection.

On 2026-09-09, the built-in example's actual Edge download was reopened and its three payload files and report verified. The larger sample was tested through real folder selection and ZIP readiness in the in-app browser; its generated archive was independently checked in the automated core test. A browser-saved download of the larger sample was not obtained. Phone workflows and browser cancellation interaction were not tested.

The automated test suite checked cancellation before/during reads, incomplete read streams, and path guards. These core tests do not establish behavior for every browser, filesystem, or external destination.
