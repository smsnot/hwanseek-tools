# Prompt Anonymizer: synthetic execution and source review

Reviewed 10 September 2026.

Prompt Anonymizer successfully reused labels and exactly restored our ordinary repeated English names and email addresses. It also exhibited consequential failures: a manual deny-list entry exposed surname text that the name model otherwise masked; pre-existing placeholder text was corrupted during restoration; and an older response could be restored with a newer document's email address. It should not be presented as a guarantee that a prompt is safe to send.

This is a test of the existing project, not a replacement implementation. We downloaded the public source at commit [`d7d5771ffd684d1f5dde4d0ba38d3c4f8cf3d3d7`](https://github.com/akazah/prompt-anonymizer/commit/d7d5771ffd684d1f5dde4d0ba38d3c4f8cf3d3d7), dated 22 July 2026. The core declares version 0.3.3. Node's built-in TypeScript transformation removed types from the unmodified upstream TypeScript files; the resulting upstream code was executed directly.

## What was actually run

- Windows, Node v24.19.0, `@huggingface/transformers` 4.2.0, `ibantools` 4.5.4.
- Upstream `Anonymizer`, `deanonymize`, `restoreText`, and `RestoreSession`.
- Regex-only detection on 13 synthetic fixtures, plus English NER on eight cases using `Xenova/bert-base-NER`, q8, CPU.
- One public model download to a work folder. The final reproducibility run used the cached model with `allowRemoteModels=false` and succeeded in the network-restricted environment.
- All text was invented. All email examples use `example.com`. No user documents, real secrets, customer files, accounts, or external LLM requests were used. Dependencies were confined to work folders and installed with package scripts disabled.

The GUI, Chrome extension, desktop installer, Python core, other languages, GPU/WASM, and a real LLM round trip were not tested. No browser network audit, comprehensive dependency audit, regulatory compliance assessment, or claim of zero retention was made. A local core run cannot certify the privacy behavior of every distributed surface.

`executed-results.json` contains the exact inputs, outputs, entity spans, mappings, and restoration results. `provenance.json` records source and model SHA256 hashes. Counts describe these fixtures only, not accuracy on real prompts.

## Observed controls and detection misses

| Fixture | Mode | Observed result |
|---|---|---|
| `ordinary_email_repeated` | Regex | Both identical addresses became `<Email_1>`. Newline and text restored exactly. |
| `ordinary_name_repeated` | English NER | Both occurrences of Mara Ellison used `<Name_1>`; both Riley North occurrences used `<Name_2>`. Exact restoration. |
| `name_email_mixed` | English NER + regex | Names and email were masked with separate consistent labels. Exact restoration. |
| `ordinary_name_repeated` | Regex only | Names remained visible. This is an intentional mode limit: regex-only does not run a name model. |
| `lowercase_name` | English NER | `Customer mara ellison asked riley north to reply.` remained entirely unchanged; no entities. |
| `quoted_email` | Both modes | `"riley north"@example.com` remained entirely visible; no entities. |
| `unicode_email` | Both modes | `élise.morin@example.com` became `é<Email_1>`. The leading character remained; the mapping contained only `lise.morin@example.com`. |
| `obfuscated_email` | Regex | `mara dot ellison at example dot com` remained unchanged. |
| `long_prompt_late_name` | English NER | A 7,962-character fixture with 180 repeated neutral sentences followed by `Customer Mara Ellison asked for an answer.` returned no entities and retained the name. |
| `unicode_offsets` and `empty_text` | Regex | Emoji, accents, newline/tab placement, and empty input survived exact restoration in these controls. |

The long-input miss is consistent with the tested model's 512-token maximum and the installed token-classification pipeline's truncating tokenizer call. The upstream NER wrapper passes the full string in a single pipeline call. This is a source-supported explanation, not a measured universal maximum number of characters. Token counts vary with text. [Upstream NER wrapper](https://github.com/akazah/prompt-anonymizer/blob/d7d5771ffd684d1f5dde4d0ba38d3c4f8cf3d3d7/web/packages/core/src/ner.ts), [tested dependency](https://www.npmjs.com/package/@huggingface/transformers/v/4.2.0)

Exact restoration is not proof of adequate masking. The unchanged lowercase-name and quoted-email fixtures restored exactly precisely because nothing had been removed.

## Consequential failure 1: adding manual masking reveals part of a detected name

Executed with the same English model, same text, and default settings except for the indicated deny list:

```text
Input:              Mara Ellison met Mara Ellison.
NER, no deny list:  <Name_1> met <Name_1>.
NER, deny [Mara]:   <Custom_1> Ellison met <Custom_1> Ellison.
```

The manual entry removes each full PERSON span from consideration because it overlaps a structured/deny-list span. The surnames that were previously masked become visible. This is distinct from the model failing to recognize a name: the baseline on the exact same input recognized both full names. The core's overlap filter precedes label merging. [Overlap filter](https://github.com/akazah/prompt-anonymizer/blob/d7d5771ffd684d1f5dde4d0ba38d3c4f8cf3d3d7/web/packages/core/src/index.ts#L102-L117)

Practical consequence: someone adding an extra rule to be more cautious can accidentally weaken masking. Re-check the whole resulting name after a manual override; do not infer that more deny-list entries always mean more coverage. The observed behavior is in the TypeScript core. Python behavior was not executed.

## Consequential failure 2: literal placeholders corrupt a reversible round trip

Executed without a model:

```text
Input:      Email: mara.ellison@example.com; literal template: <Email_1>
Anonymized: Email: <Email_1>; literal template: <Email_1>
Restored:   Email: mara.ellison@example.com; literal template: mara.ellison@example.com
```

The final literal token is changed even when the anonymized text is fed straight back, without any LLM. Label allocation does not reserve placeholder-shaped text already in the source, and restoration performs global replacement. [Label allocation and restoration](https://github.com/akazah/prompt-anonymizer/blob/d7d5771ffd684d1f5dde4d0ba38d3c4f8cf3d3d7/web/packages/core/src/labeling.ts#L365-L392)

A second executed fixture put the literal `<Email_1>` in the deny list. The output became `Literal <Custom_1>; email <Email_1>`. Restoration first expanded `<Custom_1>` into `<Email_1>`, then expanded that new token into the email address. Both collision fixtures failed the exact round-trip comparison.

Practical consequence: quoted templates, examples, or supplied text can acquire a real value in a place where it never occurred. The restored output needs review before it is used or shared. This test demonstrates local corruption, not automatic network exfiltration.

## Consequential failure 3: another document can replace the mapping needed by an older reply

Executed using one upstream `RestoreSession`:

1. Anonymize `Write to mara.ellison@example.com.` and retain the output `Write to <Email_1>.`.
2. Anonymize `Write to riley.north@example.com.` in the same session.
3. Restore the first output.

Observed: `Write to riley.north@example.com.` with `unresolved: []`. The session stores the latest mapping only; it does not identify which document a response belongs to. This is a consequential session design limitation, not a claim that all interfaces promise multiple simultaneous conversations. [Session save and restore](https://github.com/akazah/prompt-anonymizer/blob/d7d5771ffd684d1f5dde4d0ba38d3c4f8cf3d3d7/web/packages/core/src/session.ts#L128-L147)

A related deterministic concurrency test wrapped the real anonymizer in a delayed adapter: begin anonymization, clear the session, then allow the in-flight operation to finish. The mapping was null immediately after clear and was populated again afterward. That sequence was executed against `RestoreSession`; the adapter controlled timing only. No GUI race was executed. Web UI source awaits language detection before disabling controls, which warrants a separate UI test rather than a claim that we reproduced a click race. [Web handler source](https://github.com/akazah/prompt-anonymizer/blob/d7d5771ffd684d1f5dde4d0ba38d3c4f8cf3d3d7/web/apps/web/src/main.ts#L403-L410)

## Concrete abuse sequence, using invented text only

An attacker role supplies a reusable prompt template containing a literal `<Email_1>`, knowing the tool starts email labels at 1. The defender role adds the synthetic address `mara.ellison@example.com` and anonymizes the combined text. Both the actual address and the attacker's literal token now have the same label. Feeding that output into Restore changes the attacker's literal-token location into the address. If the user later shares that restored text without reading it, the address can appear somewhere they did not intend.

The `literal_placeholder_collision` fixture executes the relevant transformation without contacting an LLM or a recipient. No real address is used and no outbound leak is claimed. The same test can be used as a compact visual demonstration of why a successful replacement count is not an integrity check.

## Hazards not established as bugs

- Ordinary exact repeated values reused their labels successfully. We did not establish random label instability.
- The library explicitly presents detection as best effort. Regex-only leaving names visible is documented configuration behavior, not a missing-model defect. [Project README](https://github.com/akazah/prompt-anonymizer/blob/d7d5771ffd684d1f5dde4d0ba38d3c4f8cf3d3d7/README.md)
- An invented unknown token `<Email_99>` was left unresolved and reported. HTML-escaped `&lt;Email_1&gt;` and bare `Email_1` were unchanged without an unresolved-token report; this shows the report covers a particular token syntax, not every way an LLM might alter a label. No real LLM behavior was tested.
- Allow-list precedence appears intentional in source. We do not call a user's explicit exemption a security flaw by itself.
- No observed result establishes telemetry, hidden uploads, or automatic exfiltration by this tool. Conversely, these tests do not certify that none exists in every release or surface.

## Existing-tool guide direction

The underlying demand is real: a Reddit user described the time spent manually removing client details and asked for a local tool with manual overrides. That post is demand evidence, not a testimonial for this repository; the thread names another product in a later comment. [Demand thread](https://www.reddit.com/r/ChatGPTPromptGenius/comments/1k25nfb/prompt_anonymizer/)

The bottleneck is deciding what may leave the device while preserving relationships in the prompt. The premise to challenge is that every source detail must enter the prompt before being anonymized.

Conventional option: use this existing tool on a small, reviewed excerpt; keep one anonymize/restore job together, inspect the masked text, and inspect the restored result. A guide should first demonstrate a passing repeated-name/email sample and then the actual failure cases above. This is a conditional workflow, not an unrestricted tool endorsement.

Subtraction-first alternative: for tasks that do not depend on identity, remove identifying lines before forming the prompt and keep role names such as Customer A through the final answer. This eliminates the restoration step and its mapping problems. It also reduces material to review. It is unsuitable when exact names must appear in a finished document or identities materially affect the task. This process alternative was reasoned about, not experimentally timed or measured.

Do not build another anonymizer for this article. An appropriate angle is **“Mask a prompt, then check what escaped—and what comes back wrong.”** A one-click-safe positioning is not supported by these results.

## Reproduction

Included files: `fixtures.json`, `long-prompt-fixture.txt`, `executed-results.json`, `provenance.json`, `reproduce.mjs`, `runtime-package.json`, and `runtime-lock.yaml`.

The delivered `reproduce.mjs` was itself executed successfully against the cached model. It is a test harness that executes upstream source; it does not implement replacement detection logic. Use Node 24.19.0 or a compatible Node version with `stripTypeScriptTypes`.

For a fresh environment, download the source archive at the commit above into a source folder, create a separate runtime folder, copy `runtime-package.json` to its `package.json` and `runtime-lock.yaml` to its `pnpm-lock.yaml`, and install those dependencies with `pnpm install --ignore-scripts --frozen-lockfile`. Keep these folders separate from private files.

From the runtime folder:

```powershell
node ../report/reproduce.mjs --source=../prompt-anonymizer-source --ner --download-model
node ../report/reproduce.mjs --source=../prompt-anonymizer-source --ner
```

The first command allows the public English model download; the second permits cached-model use only. The harness writes results beside itself and model cache under a sibling work folder. Omit `--ner` for the regex/session tests. Network restrictions may prevent the initial download; that is an environment limitation and must be reported rather than counted as detection failure. Exact source and model hashes are in `provenance.json` so later releases can be distinguished from the tested snapshot.
