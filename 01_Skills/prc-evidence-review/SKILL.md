---
name: prc-evidence-review
description: Review evidence in a PRC civil or commercial litigation, arbitration, enforcement, or related Matter by classifying legal and technical attributes, tracing provenance, analyzing authenticity, legality, relevance, completeness, proof purpose and probative role, building fact-evidence chains, anticipating objections, and proposing strengthening measures. Use for initial evidence review, written examination opinions, or newly supplemented evidence; do not make final proof-sufficiency or costly evidence-strategy decisions without lawyer confirmation.
---

# PRC Evidence Review

## Metadata

| Field | Value |
|---|---|
| version | `0.1.1` |
| status | `draft` |
| owner | `Albert Wang` |
| last_reviewed | `2026-09-12` |
| validated_matters | `[]` |
| sources | Lawyer-confirmed G3-A and G3-B standards dated 2026-09-12; lifecycle actions F01-F16; project evidence, fact, confidentiality, legal-authority, and lawyer-gate rules |

## Outcome

Create a reproducible evidence review that keeps source files intact, distinguishes each item's legal category from its technical carrier, connects every material proof purpose to facts and claims, exposes contrary material and gaps, and gives the lawyer a reasoned basis for the two reserved decisions: overall probative assessment and whether to take material strengthening measures.

## Required Inputs

- Current Matter ID and our procedural role, stage, claims/defenses or issues presently in scope.
- Original evidence path or the path of a clearly identified supplemental-evidence batch. For a supplemental batch, Matter plus path is enough to start the intake dialogue; collect missing source and receipt metadata before formal registration.
- Existing Evidence IDs, fact records, claim-element matrix, prior review, and current submission deadlines when available.
- Authorization to process the identified real-client materials in the current environment. A file path alone identifies location; the instruction to review or update the Matter supplies the task authorization but does not replace any required client or firm permission.

Proceed with partial legal theory or incomplete records. Mark the affected fields `UNKNOWN`, identify the missing input, and complete all unaffected classification and preservation work.

## Modes

- **Initial review:** inventory the full in-scope evidence set and establish the baseline register, per-item review, fact-evidence chains, objections, and strengthening plan.
- **Supplemental review:** when the lawyer provides only the Matter and new-evidence path, verify the Matter/path without modifying files, then automatically ask one consolidated question for batch source/transfer method, actual receipt date, and an optional batch note. If current-environment processing authorization is not already recorded for the Matter or the instruction does not request processing, include that confirmation in the same question. After the reply, formally register and review the append-only batch, allocate new IDs only to new evidence units, preserve previous evaluations, and propagate only demonstrated changes. Read [references/supplemental-evidence-intake.md](references/supplemental-evidence-intake.md).

## Workflow

1. **Fix scope and inventory.** Identify the Matter and files actually accessible. For supplemental evidence, do not require the lawyer to supply full metadata in the first message: after receiving the path, ask once for any missing batch source/transfer method, actual receipt date, and optional note, plus processing authorization only if not already established. Do not repeat a field already supplied, and do not block on an omitted optional note. After the reply, record the metadata and any missing, damaged, encrypted, unreadable, suspicious, duplicated, near-duplicated, or version-conflicted items before substantive review.
2. **Define evidence units.** Allocate one `E-` ID per legally independently assessable evidence unit. Keep one main record for the same original file; use pinpoints or child references for independently relevant attachments, pages, messages, rows, or clips. Do not inflate evidence count with copies or OCR.
3. **Preserve source and derivatives.** Do not move, rename, overwrite, annotate, or convert files in `00_Original/`. Record hash when practical. Put OCR, transcription, extraction, image enhancement, translation, and format conversion in `02_Extracted/`, linked by `derivative_of`.
4. **Classify two dimensions.** Record the applicable current legal evidence category only after verifying the relevant procedural regime; separately record the technical carrier or acquisition form, such as original paper, scanned copy, screenshot, native export, database extract, audio, video, or device image.
5. **Trace provenance.** Record provider, acquirer, formation actor, formation time and place, system/device, acquisition time and method, transfer path, custody, and metadata. Preserve unknowns and explain how each gap affects authenticity or weight.
6. **Analyze authenticity.** State supporting indicators, contrary indicators, original-comparison conditions, signature/seal/e-signature issues, metadata consistency, alteration risk, and verification steps. A copy or screenshot is not automatically false; nor is a native-looking file automatically authentic.
7. **Analyze legality.** Review acquisition method, privacy, personal information, communications secrecy, business secrets, recording, access authority, internal permissions, preservation, compelled production, and other applicable procedural risks. Distinguish admissibility risk from ethical, confidentiality, or collateral-liability risk.
8. **Analyze relevance and proof purpose.** Link each item to specific `F-` IDs and claim/defense elements. State what it supports, contradicts, or cannot establish; reject generic “relevant to the case” descriptions and proof purposes exceeding the content.
9. **Analyze completeness and role.** Check sequence, surrounding messages, attachments, preceding/following pages, contract components, ledgers, source databases, time zones, export settings, and truncation. Classify the item's proposed role as direct, indirect, corroborative, rebuttal, impeachment, or investigative lead, and direction as favorable, adverse, bidirectional, neutral, or lead only.
10. **Verify burden and standard.** Use current, applicable legal authority to analyze burden, standard of proof, presumptions, production duties, and any alleged shift or adjustment. Keep uncertain or locally variable propositions `待核验`; do not derive them from habit.
11. **Assess individual and combined probative strength.** Consider formation timing, actor and interest, originality, completeness, stability, acquisition, objective traces, cross-corroboration, challenge history, and competing explanations. Use `strong`, `moderate`, `weak`, or `undetermined` only with conditions, defects, and facts that could change the assessment. Do not substitute a mechanical win probability.
12. **Build fact-evidence chains.** For each material fact, identify principal evidence, corroboration, adverse/conflicting evidence, investigative leads, and remaining gap. Repetition is not independent corroboration. Evaluate both single-item defects and the combined chain.
13. **Resolve conflicts transparently.** Never silently choose between incompatible items. Compare provenance, timing, interest, objective traces, context, and verifiability; state the effect of each possible resolution on claims, defenses, deadlines, and drafts.
14. **Run adversarial review.** Predict the opponent's strongest authenticity, legality, relevance, completeness, proof-purpose, and probative-weight objections and identify responsive sources or concessions. Do not import foreign exclusion labels as PRC rules without verified authority.
15. **Design strengthening measures.** Compare original verification, full exports, missing attachments, preservation, notarization, authentication, appraisal, inspection, witness, expert assistant, investigation order, court investigation, and other lawful options. For each, state need, feasibility, cost, deadline, proof benefit, exposure, and risk of not acting. Prioritize `immediate`, `before filing/evidence deadline`, `responsive`, or `defer/low value`.
16. **Update outputs and route decisions.** Preserve version history, update the evidence register and affected fact/claim/document records, and send only the F12/F14 or other material strategy choices to the lawyer gate. Never submit, disclose, withhold, destroy, or externally obtain evidence without the applicable authorization.

## Lawyer Decision Gates

### F12 — Overall probative assessment

AI must first provide the per-item assessment, combined chain, conflicts, alternative conclusions, supporting reasons, and effect on claims/defenses. The lawyer confirms or changes any conclusion that an element is sufficiently proved, that a chain should be relied on externally, or that a material conflict should be resolved in a particular way.

### F14 — Material strengthening measures

AI must first provide ranked options with necessity, feasibility, cost, timing, expected value, evidence exposure, and non-action risk. The lawyer decides whether to undertake appraisal, notarization/authentication, preservation, inspection, witness or expert participation, court investigation, investigation order, compelled production, or another material/costly/irreversible step.

Also escalate decisions to delay disclosure, omit key evidence, concede authenticity or facts, waive an objection, change a pleaded position, or use potentially unlawful evidence externally. Ordinary requests for a missing page or full chat export remain follow-up tasks unless they cross a material gate.

## Outputs

When needed, create or update:

- `01_Index/EVIDENCE_INTAKE_LOG.md`: receipt batch, source, authorization, inventory, duplicate/version mapping, hashes, and anomalies.
- `04_Evidence/EVIDENCE_REGISTER.yaml`: evidence records compliant with the project schema plus G3 fields.
- `04_Evidence/EVIDENCE_REVIEW.md`: per-item attributes, authenticity, legality, relevance, completeness, proof purpose, role, direction, and provisional weight.
- `06_Analysis/FACT_EVIDENCE_CHAIN.yaml`: material fact/element to principal, corroborative, adverse, conflicted, lead-only, and missing evidence.
- `06_Analysis/ADVERSARIAL_EVIDENCE_ANALYSIS.md`: predicted objections and responses.
- `06_Analysis/EVIDENCE_STRENGTHENING_PLAN.md`: ranked measures, costs, deadlines, benefits, risks, and lawyer-decision dependencies.
- `LAWYER_QUESTIONS.md`: F12, F14, and other decision-gate issues only.

Read [references/review-fields.md](references/review-fields.md) when creating these records. Status remains `AI_DRAFT` or `REVIEW_REQUIRED`.

## Quality Invariants

- Every Evidence ID resolves to one Matter path and reproducible pinpoint; derivatives identify their original.
- Legal evidence category, technical carrier, and evidentiary role are three separate judgments.
- Supporting, adverse, bidirectional, neutral, and lead-only material are all represented where present.
- Each material proof purpose points to a fact or element and is no broader than the item's content.
- Copies, screenshots, self-produced records, and interested testimony receive reasoned evaluation, not automatic acceptance or rejection.
- Overall sufficiency, burden allocation, and strengthening recommendations state legal-source status and uncertainty.
- Supplemental evidence never erases the prior record; changes identify the new source, affected outputs, old conclusion, new provisional conclusion, and lawyer dependency.

## Failure and Uncertainty Handling

- If a batch is provided only in chat or a temporary location, review it only within the authorized task and state that it is not yet durably archived in the Matter.
- If source or actual receipt date is missing, ask the standard consolidated supplemental-batch question before formal registration. Accept `UNKNOWN` or an approximate date with a qualifier; do not invent metadata. If processing permission is unclear, include that issue in the same question and pause content review.
- If a technical format cannot be read, preserve the file and error, use a verified local conversion on a copy when available, and do not describe unseen content.
- If new evidence suggests an urgent deadline, spoliation risk, or need for preservation, surface the trigger immediately and hand deadline computation or external action to the applicable workflow.

## Tests

Use `tests/cases.yaml`. Relevant Eval dimensions: Fact Accuracy, Evidence Traceability, Evidence Omission, Adverse Evidence Recognition, Legal Authority Accuracy, Current-Law Accuracy, Lawyer Question Quality, and Critical Error Count.
