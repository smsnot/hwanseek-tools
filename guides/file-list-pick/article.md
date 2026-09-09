# Pick files from a filename list and check what is missing

A client sends filenames, but the files are spread across folders. Some names are missing, and one appears twice. [File List Pick](https://hwanseek.shinhwa7848.chatgpt.site/file-list-pick) helps you review that list, choose the intended files, and download a ZIP with a report.

Start with **Try a small example** to explore the tool without granting folder access. For your own files, select a folder and paste one complete filename per line. The tool prepares a download rather than moving the originals. Its file-handling code runs locally in the browser; loading the webpage still makes normal hosting requests.

## The original requests

A Reddit user wanted to copy files from many subfolders using an externally supplied filename list. They wanted the folder structure preserved and a list of files that could not be copied. Replies suggested command-line tools and scripts, but the thread did not establish that the original task had been completed. [Read the MacOS discussion](https://www.reddit.com/r/MacOS/comments/1snmkus/program_or_script_to_copy_files_from_a_directory/).

A Lightroom user also asked how to select photos from a pasted filename list. Their follow-up shared a command-line method with an explicit condition that all files were in one directory. That is a narrower case than a folder tree containing repeated names. [Read the Lightroom discussion](https://www.reddit.com/r/Lightroom/comments/1btafgs/how_to_select_specific_photos_all_at_once/).

## Existing tools may fit your workflow

Capture One documents **Select → Select By → Filename List** for catalog or session images, with configurable delimiters and an option to ignore extensions. If you already manage images there, check that feature first. [Capture One's instructions](https://support.captureone.com/hc/en-us/articles/360002486138-Selecting-images).

Everything's developer documentation describes **File List Slots** for multiline lists and name-based searches. This is an **Everything 1.5+** feature. On September 9, 2026, the official download page listed 1.5 as Beta alongside 1.4. [Developer documentation](https://www.voidtools.com/forum/viewtopic.php?t=10633), [official downloads](https://www.voidtools.com/downloads/).

These are documented capabilities, not tools we timed against ours. File List Pick combines a small browser-based review with ZIP packaging; filename-list selection itself is an established feature.

## Try the built-in example

Click **Try a small example**. It loads four invented text files and a five-line request list. The list has four unique names, including one missing name, one name with two possible paths, and one repeated request.

Choose **Team B/notes.txt**, acknowledge that the missing request makes the bundle partial, then create the ZIP. This example selects **three source files**, plus `report.json`. It is separate from the larger downloadable practice folder below.

## Use a folder and your own list

1. Select the folder that contains the files. Choose their common parent if you need several subfolders searched.
2. Paste **one complete filename per line**, including the extension. A filename containing a space or comma still belongs on one line.
3. Review the results. Exact matching is case-sensitive: `README.TXT` and `README.txt` differ.
4. Unique matches start selected. Deselect any you do not want. For a same-name result, explicitly select the intended candidate paths or mark that request as skipped.
5. If names are missing or skipped, acknowledge that the bundle is partial before exporting.
6. Download the ZIP. Selected files appear under `files/`, with their original relative paths. `report.json` records requests, candidate paths, selections, and unresolved names.

A missing result means the name was not found in the folder you selected. The tool does not search the rest of your computer or your cloud account. If the candidate paths do not tell you which version was intended, ask the requester to clarify.

## Practice with nested folders

[Download the practice ZIP](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/guides/file-list-pick/hwanseek-file-list-pick-practice.zip), extract it, and select its inner `file-list-pick-practice` folder. Paste the included `request-list.txt`, or [open the same list here](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/guides/file-list-pick/request-list.txt).

This larger fixture contains **16 invented files**: JPEG illustrations, a one-page PDF, and text files. Its 14-line list has 13 unique names: **9 found once, 3 missing, and 1 ambiguous**, plus one repeated request.

`IMG_0101.JPG` exists in Camera A and Camera B with different contents. Choose **Camera B/IMG_0101.JPG** for this exercise. The selection then contains **10 source files**. `Project brief.pdf` appears once in the output even though it was requested twice.

## What we verified

Tests were performed on September 9, 2026. The two sample sets were checked separately:

| Test | What was checked | Result |
|---|---|---|
| Built-in four-file example in desktop Edge on Windows | Actual downloaded ZIP reopened | Three payload files, totaling 113 bytes, matched the expected paths and contents. The report matched the selections. |
| External 16-file fixture in the in-app browser | Real folder selection, review, ambiguity choice, and partial-bundle acknowledgement | The expected review counts appeared and a 10-file ZIP reached the ready state. |
| External 16-file fixture in an automated export test | Actual generated ZIP independently reopened and hashed | All 10 payload files, totaling 77,038 bytes, matched their original paths and SHA-256 hashes. All 16 original files remained unchanged. |

The automated export ran under Node 24.19.0 and was independently read with Python. We did **not** obtain a browser-saved download of the full external fixture; that result is distinct from the verified Edge download of the small built-in example.

The new feature's source audit found no file-upload, external-API, or browser-storage calls. Ordinary webpage hosting requests still occur. Automated tests covered cancellation before and during reading, incomplete streams, and unsafe or colliding output paths. Browser cancellation interaction was not separately tested.

## Limits to keep in mind

- Up to **10,000 indexed files**, **1,000 nonempty request lines**, and **120,000 input characters**.
- At most **64 MiB** (67,108,864 bytes) of selected source-file data. The ZIP and report add overhead.
- Exact filenames include case, spaces, extensions, and Unicode spelling. Empty lines and one initial byte-order marker are ignored; wildcards, partial names, and missing extensions are not guessed.
- Unsafe or Windows-reserved paths, and output paths that would collide when case or Unicode normalization is ignored, are blocked. Some unusual filenames therefore cannot be exported.
- File contents and relative paths are preserved. Empty folders, permissions, and filesystem metadata are not preserved.

This version stores files in the ZIP without compressing them. It packages selected files rather than shrinking photos, repairing damaged documents, or restoring cloud-only files. Desktop browser behavior was checked as described above; phone and other browser workflows remain untested.

## Connect it to a photo review

Our [Photo Sheet guide](https://hwanseek.blogspot.com/2026/09/create-photo-contact-sheet-with-filenames.html) explains making a thumbnail overview with filenames. Share an overview, collect the chosen names, then use File List Pick to prepare the corresponding originals. Keep enough folder context to clarify repeated names.

[Open File List Pick](https://hwanseek.shinhwa7848.chatgpt.site/file-list-pick) · [Practice files and guide](https://github.com/smsnot/hwanseek-tools/tree/main/guides/file-list-pick) · [Tool source](https://github.com/smsnot/hwanseek-tools/tree/main/app/file-list-pick)

## Five-card visual guide

<figure style="margin:24px auto;max-width:720px;"><img src="https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/file-list-pick/card-01.png" alt="Card 1 of 5. They sent a list and you need the files. A requester list contains Beach walk 01.jpg, Project brief.pdf, and IMG_0101.JPG. The workflow is to find, review, and package files across the selected folder. Enter one complete filename per line, including its extension." width="1080" height="1350" loading="eager" style="display:block;width:100%;max-width:720px;height:auto;border-radius:16px;" /><figcaption style="font-size:14px;color:#52636b;margin-top:8px;">1 of 5 · They sent a list. You need the files.</figcaption></figure>

<figure style="margin:24px auto;max-width:720px;"><img src="https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/file-list-pick/card-02.png" alt="Card 2 of 5. Check your existing tools. Capture One documents Filename List selection for Catalog or Session images. Everything 1.5 documents File List Slots; the 1.5 release is listed as Beta separately from 1.4. This comparison uses official documentation, not a head-to-head speed test." width="1080" height="1350" loading="lazy" style="display:block;width:100%;max-width:720px;height:auto;border-radius:16px;" /><figcaption style="font-size:14px;color:#52636b;margin-top:8px;">2 of 5 · Check your existing tools.</figcaption></figure>

<figure style="margin:24px auto;max-width:720px;"><img src="https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/file-list-pick/card-03.png" alt="Card 3 of 5. Review the list before exporting. In the external 16-file practice folder, the 14-line list has 13 unique names: 9 names found once, 3 missing, and 1 requiring a path choice. One request is repeated. Unique matches start selected, and a repeated request does not create another copy." width="1080" height="1350" loading="lazy" style="display:block;width:100%;max-width:720px;height:auto;border-radius:16px;" /><figcaption style="font-size:14px;color:#52636b;margin-top:8px;">3 of 5 · Review the list before exporting.</figcaption></figure>

<figure style="margin:24px auto;max-width:720px;"><img src="https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/file-list-pick/card-04.png" alt="Card 4 of 5. Same name, different files. Camera A/IMG_0101.JPG and Camera B/IMG_0101.JPG are separate candidates. Camera B is explicitly selected in the practice example. The core export produced 10 source files plus report.json; independent checks confirmed exact file bytes and unchanged original files." width="1080" height="1350" loading="lazy" style="display:block;width:100%;max-width:720px;height:auto;border-radius:16px;" /><figcaption style="font-size:14px;color:#52636b;margin-top:8px;">4 of 5 · Same name. Different files.</figcaption></figure>

<figure style="margin:24px auto;max-width:720px;"><img src="https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/file-list-pick/card-05.png" alt="Card 5 of 5. Try it before you pick a folder. The Try a small example button loads four invented text files without accessing a folder. This built-in demo is separate from the downloadable 16-file practice folder. The tool allows up to 64 MiB of selected source files. Full guide and free tool are linked from the blog." width="1080" height="1350" loading="lazy" style="display:block;width:100%;max-width:720px;height:auto;border-radius:16px;" /><figcaption style="font-size:14px;color:#52636b;margin-top:8px;">5 of 5 · Try it before you pick a folder.</figcaption></figure>

The cards are AI-assisted instructional diagrams, not application screenshots. Test results are limited to the samples and environments described above.
