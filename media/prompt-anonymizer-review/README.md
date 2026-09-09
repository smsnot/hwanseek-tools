# Prompt Anonymizer Test: What It Misses and Restores Wrong

HWANSEEK · Five English cards · 1080 × 1350 pixels

Synthetic tests of the upstream TypeScript core with regex and English NER. No GUI or LLM test. These vector illustrations show recorded results and a suggested process; they are not screenshots.

[Read the guide](../../guides/prompt-anonymizer-review/README.md) for evidence, sources, and limits.

## Cards and alternate text

### Card 1: Masked does not mean safe.

[PNG](card-01.png) · [SVG](card-01.svg)

Alt text: HWANSEEK Prompt Anonymizer test. Masked does not mean safe. The existing TypeScript core reused labels for ordinary repeated names and email addresses, but synthetic tests also found missed text, a masking-rule conflict, and wrong restoration. Local core test with English NER and regex; no GUI or LLM test.

### Card 2: Some text still gets through.

[PNG](card-02.png) · [SVG](card-02.svg)

Alt text: Two exact English NER test outputs remained unchanged: Customer mara ellison asked riley north to reply. Reply to "riley north"@example.com about the invented project. Neither synthetic example produced detected entities. Local core test; no GUI or LLM test.

### Card 3: More masking can reveal more.

[PNG](card-03.png) · [SVG](card-03.svg)

Alt text: For the synthetic input Mara Ellison met Mara Ellison., English NER without a deny list produced <Name_1> met <Name_1>. Adding Mara to the deny list produced <Custom_1> Ellison met <Custom_1> Ellison. The surnames became visible. Local core test; no GUI or LLM test.

### Card 4: Keep one job with one mapping.

[PNG](card-04.png) · [SVG](card-04.svg)

Alt text: One RestoreSession first masked Write to mara.ellison@example.com., then masked Write to riley.north@example.com. Restoring the first output returned Write to riley.north@example.com. The latest mapping replaced the first; unresolved labels: none. Local core session test; no GUI or LLM test.

### Card 5: Skip the customer details.

[PNG](card-05.png) · [SVG](card-05.svg)

Alt text: Conventional workflow: keep one anonymize-and-restore job together and review both outputs. Alternative: ask for a reusable template without customer details, then fill in names locally. The alternative removes mapping and restoration from the AI exchange. Process proposal, not a measured result. Local core tests used English NER and regex; no GUI or LLM test.
