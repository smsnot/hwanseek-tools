# Prompt Anonymizer Test: What It Misses and Restores Wrong

*HWANSEEK · Existing-tool test · September 10, 2026*

Prompt Anonymizer gave repeated names and emails consistent labels in our ordinary English examples. It also missed identifiable text and restored some text incorrectly. Use the masked output as something to review before sharing, and keep each document with the exact mapping produced for it.

If the AI task can be done without customer details, leave those details out from the start. Asking for a reusable template can remove both the anonymization work and the restoration step.

**What we tested:** the existing open-source TypeScript core, version 0.3.3 at commit [`d7d5771`](https://github.com/akazah/prompt-anonymizer/commit/d7d5771ffd684d1f5dde4d0ba38d3c4f8cf3d3d7), with regex detection and the English name model on a local CPU. All inputs were invented. We did not test the browser interface, extension, desktop app, Python version, or a real LLM conversation. The cards illustrate recorded results and a suggested workflow; they are not screenshots.

![HWANSEEK Prompt Anonymizer test. Masked does not mean safe. The existing TypeScript core reused labels for ordinary repeated names and email addresses, but synthetic tests also found missed text, a masking-rule conflict, and wrong restoration. Local core test with English NER and regex; no GUI or LLM test.](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/prompt-anonymizer-review/card-01.png)

## What the tool does

[Prompt Anonymizer](https://github.com/akazah/prompt-anonymizer) replaces detected information with labels such as `<Name_1>` and `<Email_1>`. A separate mapping connects each label to its original value. That mapping can restore the original values after the response comes back. The project is MIT-licensed and offers a [browser version](https://akazah.github.io/prompt-anonymizer/), among other interfaces. Those interfaces are documented by the project; this article's executed results come from its core.

This addresses a concrete frustration: a [Reddit user asking for a prompt anonymizer](https://www.reddit.com/r/ChatGPTPromptGenius/comments/1k25nfb/prompt_anonymizer/) described spending time removing client details by hand and wanted local processing with manual overrides. That thread is evidence of the problem, not an endorsement of the repository tested here.

## First, a sample that worked

With English name detection enabled, this invented input:

```text
Mara Ellison met Riley North. Mara Ellison will contact Riley North tomorrow.
```

became:

```text
<Name_1> met <Name_2>. <Name_1> will contact <Name_2> tomorrow.
```

The repeated names kept the same labels. Restoring with that result's mapping reproduced the input exactly. An ordinary repeated `mara.ellison@example.com` address also kept one label and restored exactly, including our line break.

These are passing examples, not a general accuracy figure. We ran 13 regex-only fixtures and eight English-model cases; the full inputs and outputs are available below.

## The shortest workflow worth keeping

1. **Choose the smallest useful excerpt.** Remove identifying material the AI does not need. Start with the invented practice text in this guide when trying an interface for the first time.
2. **Check the detection mode.** The project's regex-only mode covers structured patterns such as ordinary email addresses; it does not run a name model. Our name tests used English NER. The project documents an initial model download for browser name detection.
3. **Keep one document and its mapping together.** Finish that anonymize-and-restore job before starting another in the same session. Keep the mapping local and separate from anything sent to an AI: it contains the original values. If a matching mapping is unavailable, do not guess which document a label belongs to.
4. **Review both outputs.** Before sharing masked text, inspect what remains, especially after adding a manual rule. After restoration, check names, addresses, and literal labels again before using the result.

This is a suggested workflow informed by the executed core tests. It is not a walkthrough of buttons we clicked in a browser.

![Two exact English NER test outputs remained unchanged: Customer mara ellison asked riley north to reply. Reply to "riley north"@example.com about the invented project. Neither synthetic example produced detected entities. Local core test; no GUI or LLM test.](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/prompt-anonymizer-review/card-02.png)

## What got through

These two inputs remained completely unchanged even with the tested English name model enabled:

```text
Customer mara ellison asked riley north to reply.
```

```text
Reply to "riley north"@example.com about the invented project.
```

Neither produced a detected entity. A different address, `élise.morin@example.com`, became `é<Email_1>`: its leading accented character remained outside the mask.

We also placed `Customer Mara Ellison asked for an answer.` after 180 repeated neutral sentences. The 7,962-character input returned no entities, leaving the name visible. The tested model configuration has a 512-token maximum, and its pipeline truncates input. This supports a length-related explanation; it is not a universal character limit. The [technical report](https://github.com/smsnot/hwanseek-tools/blob/main/guides/prompt-anonymizer-review/report.md) records the test and scope.

All those unchanged inputs could still be restored “exactly.” That check alone says nothing about whether sensitive content was masked.

![For the synthetic input Mara Ellison met Mara Ellison., English NER without a deny list produced <Name_1> met <Name_1>. Adding Mara to the deny list produced <Custom_1> Ellison met <Custom_1> Ellison. The surnames became visible. Local core test; no GUI or LLM test.](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/prompt-anonymizer-review/card-03.png)

## A manual rule exposed more of a name

We used the same input and English model twice:

```text
Input: Mara Ellison met Mara Ellison.
```

Without a deny-list entry, the result was:

```text
<Name_1> met <Name_1>.
```

After adding `Mara` to the deny list, it became:

```text
<Custom_1> Ellison met <Custom_1> Ellison.
```

The surnames had been masked in the first run and were visible in the second. The [source's overlap filter](https://github.com/akazah/prompt-anonymizer/blob/d7d5771ffd684d1f5dde4d0ba38d3c4f8cf3d3d7/web/packages/core/src/index.ts#L102-L117) drops an entire name-model span when it overlaps a structured or deny-list span.

The practical check is simple: after changing a manual masking rule, inspect the whole output again. More rules did not mean more coverage in this case.

![One RestoreSession first masked Write to mara.ellison@example.com., then masked Write to riley.north@example.com. Restoring the first output returned Write to riley.north@example.com. The latest mapping replaced the first; unresolved labels: none. Local core session test; no GUI or LLM test.](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/prompt-anonymizer-review/card-04.png)

## The wrong mapping can restore the wrong person

In one `RestoreSession`, we anonymized this first:

```text
Write to mara.ellison@example.com.
```

We kept its output, `Write to <Email_1>.`, then anonymized a second document containing `riley.north@example.com`. Restoring the first output through that session returned:

```text
Write to riley.north@example.com.
```

There was no unresolved-label warning. The session held the latest mapping, so the label was valid but belonged to the other document. This is a limitation of the tested [single-mapping session](https://github.com/akazah/prompt-anonymizer/blob/d7d5771ffd684d1f5dde4d0ba38d3c4f8cf3d3d7/web/packages/core/src/session.ts#L128-L147). We did not reproduce this through a particular app interface.

Keeping one job and its matching mapping together removes the need to reconstruct which set of labels belonged to which document.

## A label that was already in the source can change meaning

No model or AI reply was needed for this failure:

```text
Input:
Email: mara.ellison@example.com; literal template: <Email_1>

Anonymized:
Email: <Email_1>; literal template: <Email_1>

Restored:
Email: mara.ellison@example.com; literal template: mara.ellison@example.com
```

The final `<Email_1>` was supposed to remain literal text. The [label allocation and global restoration](https://github.com/akazah/prompt-anonymizer/blob/d7d5771ffd684d1f5dde4d0ba38d3c4f8cf3d3d7/web/packages/core/src/labeling.ts#L365-L392) treated it as another generated label instead.

For a harmless adversarial check, put that literal token in a supplied template, add the invented email, anonymize, and feed the output straight into restoration. Compare it with the original. This models how externally supplied text could cause a value to appear in an unintended place. Our test changed local text; it did not send anything to an attacker or demonstrate automatic exfiltration.

![Conventional workflow: keep one anonymize-and-restore job together and review both outputs. Alternative: ask for a reusable template without customer details, then fill in names locally. The alternative removes mapping and restoration from the AI exchange. Process proposal, not a measured result. Local core tests used English NER and regex; no GUI or LLM test.](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/media/prompt-anonymizer-review/card-05.png)

## A simpler alternative: ask for the template

The usual approach is to mask a customer-specific request, inspect it, send it, restore the response, and inspect it again. That retains specific context, but it also retains the mapping problem.

For tasks such as drafting a routine customer email, reverse the order. Ask for a reusable template without customer details:

> Draft a reusable email asking a customer to confirm their delivery address. Use plain role labels for the customer and order reference. Leave blanks for details I will fill in locally. Keep the tone friendly and concise.

Then fill in the actual details locally. There is no source name for the detector to miss, and no anonymizer mapping to apply afterward. This is a proposed process simplification, not a measured time-saving result or an executed LLM response. It will not fit a task whose reasoning depends on customer-specific facts.

The core decision comes before tool selection: does the AI need those identifying details at all?

## Free practice files and exact results

- [Synthetic fixtures](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/guides/prompt-anonymizer-review/fixtures.json): the short practice inputs and options.
- [Long-input fixture](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/guides/prompt-anonymizer-review/long-prompt-fixture.txt): the text used for the late-name check.
- [Recorded execution results](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/guides/prompt-anonymizer-review/executed-results.json): complete masked text, mappings, spans, and restoration results.
- [Technical report](https://github.com/smsnot/hwanseek-tools/blob/main/guides/prompt-anonymizer-review/report.md): reproducibility, additional session checks, and limits.
- [Reproduction harness](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/guides/prompt-anonymizer-review/reproduce.mjs) and [provenance](https://raw.githubusercontent.com/smsnot/hwanseek-tools/main/guides/prompt-anonymizer-review/provenance.json): run the upstream core against the included fixtures; no replacement anonymizer is provided.

The final recorded model run used its local cache with remote-model downloads disabled. That demonstrates this tested core could run with cached files; it does not certify every interface's network behavior, data retention, or compliance. The project itself describes detection as best effort. [Project documentation at the tested commit](https://github.com/akazah/prompt-anonymizer/blob/d7d5771ffd684d1f5dde4d0ba38d3c4f8cf3d3d7/README.md).
