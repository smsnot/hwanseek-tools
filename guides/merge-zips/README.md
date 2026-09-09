# Multiple ZIPs, one folder tree

A free 7-Zip workflow guide with synthetic practice archives. This is instructional material, not a new extraction tool.

- Read the [full guide](guide.md).
- Normal exercise: [practice-01.zip](practice-01.zip), [practice-02.zip](practice-02.zip), [practice-03.zip](practice-03.zip). Select these three only. Expected result: one `Takeout` tree, nine files.
- Separate collision exercise: [conflict-01.zip](conflict-01.zip) and [conflict-02.zip](conflict-02.zip). Both contain the same path with different bytes; do not mix them into the normal exercise.
- Verify with [expected-tree.txt](expected-tree.txt), [practice-manifest.json](practice-manifest.json), [archive SHA256 sums](SHA256SUMS.txt), and [test-results.json](test-results.json).

Actual test: 7-Zip 24.08 x64 command-line edition, Windows 10 Home 22H2, September 9, 2026. All nine file paths and SHA-256 hashes matched; source archives were unchanged. Collision and missing-archive cases were also tested. GUI settings are source-backed; a completed graphical extraction was not verified. No speedup or large-export completeness claim is made.

The ZIPs are independent archives, not `.001` split volumes. Folder extraction does not restore Google Photos JSON metadata. Keep original archives and review same-path conflicts before overwriting.

Download 7-Zip from [7-zip.org](https://7-zip.org/). The official page listed 26.03 when checked; that release was not the installed test version.

All practice file contents and instructional illustrations were created for HWANSEEK. The synthetic practice contents may be reused for any purpose. 7-Zip and Google are separate products; this guide is not affiliated with their publishers.
