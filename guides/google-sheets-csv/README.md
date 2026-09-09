# Keep CSV identifiers intact in Google Sheets

These files contain invented records for practicing CSV import. Keep the downloaded original unchanged and use copies for experiments.

## Five-record sample

`hwanseek-csv-id-practice.csv` was tested in Google Sheets in Microsoft Edge on Windows, using the Korean interface, on 2026-09-09.

| Record | Exact identifier | Amount |
|---|---|---:|
| Leading zeros | `00123` | 12.50 |
| Short ID | `0007` | 0.00 |
| Long ID | `12345678901234567` | 99.95 |
| E-like ID | `123E5` | 7.25 |
| All-zero ID | `00000` | 3.30 |

Use File → Import → Upload, insert a new sheet, select Comma, and clear the option to convert text to numbers, dates, and formulas. The tested checkbox label was `텍스트를 숫자, 날짜, 수식으로 변환`; English menu descriptions translate that interface or follow Google's documentation.

With automatic conversion enabled, 00123 became 123, 0007 became 7, 123E5 displayed as 1.23E+07, and 00000 became 0. The 17-digit identifier already remained exact text in that default import.

With conversion disabled, all five identifiers were text and matched the source exactly. The amount cells also became text. If the imported table starts at A1, add `amount_numeric` in D1 and `=VALUE(C2)` in D2, then fill the formula through D6. `=SUM(D2:D6)` returns **123**, which can be displayed as **123.00**. Never apply VALUE to the identifier column.

## Optional larger sample

`hwanseek-csv-late-text-practice.csv` has 205 records. The first identifier is `00001`, record 200 is `00200`, and the last is `ID-A205`. Every amount is 1.00 and their expected total is **205.00**. Its raw content was verified, but this larger file was not included in the Google Sheets application test.

## Checks and limits

- Compare IDs character for character, including zeros, letters, and every digit. A changed display does not establish that the original CSV was damaged.
- CSV contains field text rather than spreadsheet cell types. Reopening a CSV in another spreadsheet can reinterpret it.
- Keep the Google spreadsheet for its formulas and cell types. Inspect any CSV export as plain text too.
- The amount helper column is an additional field. Use a separate export sheet with the exact columns required by your destination.
- Already missing digits cannot be reconstructed without a source or independently known format. Do not overwrite the only original.
- These files use comma delimiters, decimal points, UTF-8 text, and CRLF line endings. Check spreadsheet locale if amounts are interpreted differently.
- This guide covers the tested browser CSV import route. Mobile, direct Drive opening, IMPORTDATA, and external-system compatibility were not tested.

Sources: [Google file import](https://support.google.com/docs/answer/12236443?hl=en), [VALUE](https://support.google.com/docs/answer/3094220?hl=en-GB), [spreadsheet locale](https://support.google.com/docs/answer/58515?hl=en).
