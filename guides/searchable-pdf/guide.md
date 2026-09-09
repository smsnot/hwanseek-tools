# PDF Search Not Working? Make a Scanned PDF Searchable

If a PDF looks readable but Find cannot locate a visible word, the page may contain a picture of text. **OCR adds a text layer that a PDF reader can search and copy.** For a clear, image-only scan, the free desktop app [NAPS2](https://www.naps2.com/) provides an existing-PDF workflow; you do not need a scanner.

First try selecting a sentence. If some text already selects or copies, use the troubleshooting section below before assuming the whole PDF needs OCR. A failed search alone does not identify the cause.

## Quick steps

1. Open NAPS2 and choose **Import** to load the PDF.
2. Open **OCR**, download the document's language if needed, and enable **Make PDFs searchable using OCR**.
3. Choose **Save PDF** and use a new filename.
4. Open that saved copy in a PDF reader. Search for a visible phrase, then copy a sentence and compare it with the page.

NAPS2 normally performs recognition while saving. Importing the file or downloading a language does not by itself create the finished searchable PDF. [Official OCR instructions](https://www.naps2.com/doc/ocr)

![Card 1 of 5. The words are there, but search finds nothing. A scanned PDF can contain page images, and OCR can add searchable text. The invented practice page visibly says Keep the cobalt notebook beside the sample tray. Before OCR, neither page of our clean two-page sample had extractable text. This is an instructional diagram, not a PDF viewer screenshot.](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/searchable-pdf/card-01.png)

## Why this problem is easy to misdiagnose

A page can look like a document while storing its words only as image pixels. Find has no recognized words to match. Repeatedly searching the same image-only file will not add that missing text.

The workflow can also be confusing after choosing an OCR app. In [this Reddit discussion about using NAPS2 on an existing PDF](https://www.reddit.com/r/software/comments/1s2lbsi/how_the_heck_do_i_use_naps2_ocr_on_a_pdf_document/), the author had installed the app and language files but still could not get the expected result. Replies discussed enabling OCR and saving another PDF. The original input was not available to us, so we do not assign its cause or treat a comment as a benchmark.

![Card 2 of 5. A text layer makes the difference. After NAPS2 OCR, the clean sample contained the phrase cobalt notebook. The full extracted text of both pages matched the independent source after whitespace normalization, in both pypdf and PDFium. This is a result for the synthetic sample, not a general accuracy guarantee. The tested environment was NAPS2 8.3.2 portable on Windows, using the console with English OCR in Fast mode.](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/searchable-pdf/card-02.png)

## Before and after: what our practice files showed

The intended result is the same document pages with recognized text that a reader can use. A successful search is useful, but it does not prove that every number, name, or sentence is correct.

Our free practice set contains invented English project notes: a clear two-page image-only PDF, a deliberately degraded one-page version, and a two-page existing-text control. In the control, page 1 has ordinary text while page 2 has a real-text header above an image body. Each page needs its own check: finding a phrase on page 1 says nothing about page 2.

![Card 3 of 5. Make a searchable PDF with NAPS2. The documented app workflow is to import a PDF, open OCR setup, select or download the appropriate language, check Make PDFs searchable using OCR, and save a new PDF. Reopen the saved file to search and copy text. These graphical steps are based on official NAPS2 documentation; the measured test used the NAPS2 console, and no live graphical-app walkthrough was completed.](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/searchable-pdf/card-03.png)

**Test method, September 9, 2026:** results were produced with NAPS2 **8.3.2 for Windows**, English OCR, and its official command-line interface; the button steps follow its documentation. We compared the PDF text layer with the original source text and inspected every output page. [Detailed method](test-report.md)

| Sample | Before OCR | Verified output |
|---|---|---|
| Clear scan, 2 pages | Neither page had extractable text. | Both pages' complete text matched the source after normalizing whitespace, in both parsers. Each applicable test phrase appeared on its expected page. |
| Degraded scan, 1 page | No extractable text. | All four selected phrases appeared, yet the full text contained errors: `Project ID` became `Project 1D`, among other mistakes. |
| Control, page 1 | Ordinary text was already present. | Its extracted text stayed unchanged. |
| Control, page 2 | Only the real-text header was extractable; the body was an image. | Only that header remained extractable. The body phrases were still absent. |

This is why a search hit is only the start of verification. The degraded file passed the selected phrase checks while still producing incorrect text elsewhere.

All original pages remained in order, with no visible clipping or missing sections in our review. OCR did not improve the blurred scan's appearance. The saved files were not identical to the inputs; the [detailed test report](test-report.md) records page dimensions, rendering differences, file sizes, and exact command-line steps.

![Card 4 of 5. Search hits can still contain mistakes. All four selected terms on the degraded practice page were found in its extracted OCR text, but the full transcription had errors. The source says Project ID: MAPLE-0427. The output says Project 1D: MAPLE-0427, substituting the digit 1 for the capital letter I. Compare copied text with the visible page. These are exact source and output excerpts presented as a diagram, not screenshots.](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/searchable-pdf/card-04.png)

## How to make an existing scanned PDF searchable with NAPS2

### 1. Get the official application

Use the [official NAPS2 download page](https://www.naps2.com/download). It lists a Windows x64 portable ZIP and installers. The release checked for this guide is **8.3.2**. With the portable option, extract the whole ZIP into a folder before opening its launcher.

Keep your original PDF. For your first run, use the small practice file linked below so it is easy to compare pages and spot an unexpected result.

### 2. Import the pages and choose the recognition language

Import your PDF and check that the page thumbnails appear in the expected order. Configure OCR as shown in the quick steps. Use the language printed in the document; the app's interface language is a separate setting.

The application and recognition-language files need an initial download. OCR can run locally after setup; NAPS2 also documents [offline deployment of language files](https://www.naps2.com/doc/org-use).

### 3. Save a separate PDF and open the result

Use a name such as `notes-searchable.pdf`. Wait for saving to finish, then open that exact new file rather than the original input. Check that all wanted pages were included.

### 4. Check more than one search result

On the clear practice file, search for `cobalt notebook` on page 1 and `LAMP-6209` on page 2. Copy a sentence and inspect the project code `MAPLE-0427` and amount `73.50`. Compare letters, digits, punctuation, page count, page order, and appearance against the original. These are selected checks, not a whole-document accuracy score.

## NAPS2, Adobe online OCR, or Google Docs?

| Option | Useful when | What to account for |
|---|---|---|
| [NAPS2](https://www.naps2.com/) | You want a free desktop workflow for a searchable PDF. | Set up the app and OCR languages first. Pages containing existing text have a limitation described below. |
| [Adobe online OCR](https://www.adobe.com/acrobat/online/ocr-pdf.html) | You prefer a browser service and are comfortable uploading the file. | Adobe advertises free OCR. Its instructions require an upload and sign-in to download the searchable result. We did not test its accuracy, quotas, or speed. |
| [Google Drive → Google Docs](https://support.google.com/drive/answer/176692?hl=en) | You mainly want extracted text in an editable document. | Google's guidance recommends files of 2 MB or smaller and warns that tables, columns, lists, and notes may not transfer. That output goal differs from adding search to the scanned PDF. |

These are workflow differences, not a claim that one engine recognizes text better than the others.

## Why NAPS2 OCR may still leave text unsearchable

**The imported page already contains text.** NAPS2's documented rule skips such pages. Even a small real-text header may matter when the rest of the page is a scan. The basic sequence is therefore not a repair method for every bad existing OCR layer. [Imported-document behavior](https://www.naps2.com/doc/ocr)

**The image is difficult to read.** Blur, low resolution, skew, noise, and complicated layouts affect recognition. A clearer rescan can be more useful than enlarging a blurry image; enlarging it does not recover missing detail. See [Tesseract's image-quality guidance](https://tesseract-ocr.github.io/tessdoc/ImproveQuality.html).

**The text exists, but it is inaccurate or poorly structured.** Searchable does not mean error-free, ready for important calculations, correctly tagged for screen readers, or faithfully editable as a table. Check consequential text against the visible original. Handwriting and every language/layout combination are outside this small English practice test.

**The wrong file is open.** Verify the saved filename and repeat the search in the new copy. If text already copies correctly but Find still behaves unexpectedly, check the search phrase and reader behavior before processing the document again.

![Card 5 of 5. Check the body of every page. In the mixed-page control, a native-text header was searchable before and after processing, while the image body received no OCR text. NAPS2 left this page with existing text unchanged. A search hit on another page does not prove that this image body was processed. The blog contains the full guide and free practice PDFs. This card is a simplified diagram of the observed control result.](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/searchable-pdf/card-05.png)

## Free practice PDFs and follow-up help

- [Clear two-page scan](fixtures/clean-image-only.pdf)
- [Degraded one-page scan](fixtures/degraded-image-only.pdf)
- [Existing-text and mixed-page control](fixtures/existing-text-control.pdf)
- [Verified clear output, two pages](results/clean-searchable.pdf)
- [Degraded output with the observed recognition errors](results/degraded-searchable.pdf)
- [Expected source text and search checks](fixtures/expected-transcription.json)
- [Practice file manifest](fixtures/fixture-manifest.json)
- [Page-specific test report and reproducible command-line steps](test-report.md)
- [Detailed machine-readable comparison](report.json)
- [Guide and supporting files on GitHub](https://github.com/smsnot/hwanseek-tools/tree/main/guides/searchable-pdf)

If you can now copy the words but each visual line becomes an unwanted break, continue with [PDF Line Break Review: keep or join breaks without merging everything](https://hwanseek.blogspot.com/2026/09/remove-pdf-line-breaks-without-merging.html). That is a separate cleanup step after extracting and checking the text; it does not perform OCR.

NAPS2 is an existing open-source project. HWANSEEK supplies this guide and its synthetic practice files; we did not create the OCR application. [NAPS2 source and license](https://github.com/cyanfish/naps2)
