# Keep leading zeros when importing a CSV into Google Sheets

Google Sheets changed `00123` to `123` in our test when automatic conversion was enabled. Clearing the conversion option during CSV import preserved every identifier in our five-record sample. The extra step: the amounts arrived as text too, so we converted only those values for calculations.

[Get the free practice CSV](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/guides/google-sheets-csv/hwanseek-csv-id-practice.csv). If your browser shows its text, save the file with its `.csv` extension. All records are invented. You can follow this Google Sheets workflow without opening Excel.

## The problem people reported

A Google Sheets user said importing a CSV removed leading zeros. They initially accepted a formatting suggestion, then clarified that it helped with pasted data but the file import still lost zeros. That later reply explains why simply changing the format is not a complete import guide. [Read the Reddit discussion](https://www.reddit.com/r/googlesheets/comments/vwtkbs).

If the stored identifier has already become `123`, a format cannot tell whether its original prefix was `0`, `00`, or something else. Check the unchanged CSV in a plain-text editor first. Another user discovered that their zeros were still in the raw file, even though opening it in Sheets made them appear missing. [Read that follow-up](https://www.reddit.com/r/GoogleAppsScript/comments/1mup0c3).

## What changed in our test

We imported the same synthetic file twice in Google Sheets on **September 9, 2026**, using **Microsoft Edge on Windows with the Korean interface**. The conversion option was checked by default.

| Original identifier | Conversion on | Conversion off |
|---|---|---|
| `00123` | `123` | `00123` |
| `0007` | `7` | `0007` |
| `12345678901234567` | Exact text retained | Exact text retained |
| `123E5` | `1.23E+07` | `123E5` |
| `00000` | `0` | `00000` |

With conversion off, all five identifiers were text and matched the source character for character. The 17-digit identifier also survived the default import as text; **our test did not show that value being damaged**.

## Import without changing the identifiers

1. Open a practice spreadsheet in Google Sheets on a computer.
2. Choose **File → Import → Upload** and select the CSV.
3. Set the import location to **Insert new sheet(s)** and the separator to **Comma** for this sample.
4. Clear the option to **convert text to numbers, dates, and formulas**.
5. Import the file and check the `identifier` column against the table above.

The checkbox we tested was labeled **텍스트를 숫자, 날짜, 수식으로 변환**. English menu descriptions above follow Google's documentation or translate the observed Korean interface; we did not separately test an English-language account. [Google's file-import instructions](https://support.google.com/docs/answer/12236443?hl=en).

This test used the browser's CSV import dialog. Opening files from Drive, pasting cells, mobile apps, and IMPORTDATA formulas are separate workflows.

## Make the amounts usable for calculations

Turning conversion off preserved the amount cells as text too. Keep the original imported columns and add one numeric column:

1. With the imported table starting at A1, type `amount_numeric` in D1.
2. In D2, enter `=VALUE(C2)`.
3. Fill the formula down through D6 for the five records.
4. In an empty cell, enter `=SUM(D2:D6)`.

Our numeric results were **12.50, 0.00, 99.95, 7.25, and 3.30**, totaling **123.00**. These are synthetic amounts with no assigned currency. A display of `123` is the same numeric total; two decimal places are optional formatting.

VALUE converts a recognized numeric string to a number. Apply it only to fields you intend to calculate, such as amounts. Leave the identifier column as text. [Google's VALUE documentation](https://support.google.com/docs/answer/3094220?hl=en-GB).

## Check the source and the output

Keep the original CSV unchanged. This workflow cannot reconstruct unknown digits if an altered file overwrote your only source.

Our sample uses decimal points. If an amount is interpreted incorrectly, check **File → Settings → Locale** in your practice spreadsheet. Locale affects the spreadsheet's default number formatting, and changing it affects the entire spreadsheet. [Google's locale settings](https://support.google.com/docs/answer/58515?hl=en).

If you download another CSV, inspect that exported text as well. The new `amount_numeric` column is an extra field: prepare a separate export sheet with the required columns if another system expects the original three-column layout. Our validation here covers import, exact identifier checks, and numeric conversion; it does not certify an external system's import requirements.

Using Google Sheets uploads the sample to your Google account. These downloads contain only invented data; HWANSEEK does not need your real records.

## Practice files and references

- [Five-record practice CSV](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/guides/google-sheets-csv/hwanseek-csv-id-practice.csv): the file used in our Google Sheets test.
- [Optional 205-record practice CSV](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/guides/google-sheets-csv/hwanseek-csv-late-text-practice.csv): first ID `00001`, final ID `ID-A205`, expected amount total **205.00**. Its raw contents were checked, but it was not included in the Google Sheets app test.
- [Files and instructions on GitHub](https://github.com/smsnot/hwanseek-tools/tree/main/guides/google-sheets-csv).
- [Microsoft's separate Excel import guide](https://support.microsoft.com/en-us/excel/keeping-leading-zeros-and-large-numbers), for readers using that application.

## Five-card visual guide

<figure style="margin:24px auto;max-width:720px;"><img src="https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/google-sheets-csv/card-01.png" alt="Card 1 of 5. Where did the zeros go? A simplified diagram shows source identifier 00123 becoming 123 during CSV import with text conversion enabled. This change was observed with the five-record practice CSV." width="1080" height="1350" loading="eager" style="display:block;width:100%;max-width:720px;height:auto;border-radius:16px;" /><figcaption style="font-size:14px;color:#52636b;margin-top:8px;">1 of 5 · Where did the zeros go?</figcaption></figure>

<figure style="margin:24px auto;max-width:720px;"><img src="https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/google-sheets-csv/card-02.png" alt="Card 2 of 5. Formatting cannot guess lost zeros. A number 123 remains 123 when treated as text. The value alone cannot reveal whether the original identifier was 00123 or 000123. Re-import an unchanged CSV." width="1080" height="1350" loading="lazy" style="display:block;width:100%;max-width:720px;height:auto;border-radius:16px;" /><figcaption style="font-size:14px;color:#52636b;margin-top:8px;">2 of 5 · Formatting cannot guess lost zeros.</figcaption></figure>

<figure style="margin:24px auto;max-width:720px;"><img src="https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/google-sheets-csv/card-03.png" alt="Card 3 of 5. Turn conversion off first. In Google Sheets on a computer, use File, Import, Upload, choose the CSV and separator, and uncheck Convert text to numbers, dates, and formulas before importing. Then check every identifier. The checkbox is a simplified diagram, not an app screenshot." width="1080" height="1350" loading="lazy" style="display:block;width:100%;max-width:720px;height:auto;border-radius:16px;" /><figcaption style="font-size:14px;color:#52636b;margin-top:8px;">3 of 5 · Turn conversion off first.</figcaption></figure>

<figure style="margin:24px auto;max-width:720px;"><img src="https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/google-sheets-csv/card-04.png" alt="Card 4 of 5. Convert amounts and keep identifiers as text. In the five-record practice file starting at A1, enter =VALUE(C2) in D2 and fill down through D6. Sum D2:D6. The tested sample total is 123, shown here with two decimal places. The identifiers remain text." width="1080" height="1350" loading="lazy" style="display:block;width:100%;max-width:720px;height:auto;border-radius:16px;" /><figcaption style="font-size:14px;color:#52636b;margin-top:8px;">4 of 5 · Convert amounts. Keep IDs as text.</figcaption></figure>

<figure style="margin:24px auto;max-width:720px;"><img src="https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/google-sheets-csv/card-05.png" alt="Card 5 of 5. Keep every character. Compare imported identifiers with the original CSV, including 00123, all 17 digits of 12345678901234567, and 123E5. Inspect exports and the final row. The full guide and free CSV are on the blog, linked from the profile." width="1080" height="1350" loading="lazy" style="display:block;width:100%;max-width:720px;height:auto;border-radius:16px;" /><figcaption style="font-size:14px;color:#52636b;margin-top:8px;">5 of 5 · Keep every character.</figcaption></figure>

The cards are AI-assisted editorial diagrams, not screenshots of Google Sheets. The results described above come from the stated application test.
