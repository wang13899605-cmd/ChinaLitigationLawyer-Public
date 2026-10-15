---
name: litigation-chronology
description: Build or update a source-linked chronology for a PRC dispute, separating event dates, document dates, allegations, inferences, conflicts, and deadline candidates. Use for fact reconstruction, pleading preparation, evidence review, or new-material updates; not for deciding disputed facts or legal merits.
---

# Litigation Chronology

## Metadata

| Field | Value |
|---|---|
| version | `0.1.0` |
| status | `draft` |
| owner | `Albert Wang` |
| last_reviewed | `2026-09-09` |
| validated_matters | `[]` |
| sources | AgentCounsel `litigation-chronology`; claude-for-legal-ZH `chronology`; project fact/evidence rules |

## Outcome

Produce an auditable chronology that reveals sequence, gaps, contradictions, and possible legal significance without presenting inference or a party's account as established fact.

## Required Inputs

- Current Matter and materials in scope.
- Existing Evidence IDs or permission to create provisional IDs.
- Relevant time window, issue, or document set when the whole Matter is not requested.

## Workflow

1. Define scope and use the current Matter only. Prefer original evidence over OCR, summaries, file names, or earlier timelines.
2. Extract separately: event date/time, document creation/signing/sending date, receipt date, effective date, and stated deadline. Do not collapse them.
3. Assign or cite Fact IDs and Evidence IDs. Give page, paragraph, table row, message timestamp, sheet/cell, or other reproducible location.
4. Apply the project's six fact states. A chronology row may contain more than one competing version, but each version retains its own source and status.
5. Normalize dates for sorting only when the source supports the precision. Preserve the original expression; unknown day/month remains unknown.
6. Mark source type, actors, event, relevance, favorable/adverse/neutral direction, and whether the date is a deadline candidate requiring verification.
7. Detect missing intervals, impossible sequence, unexplained delay, duplicate records, conflicting dates, and dates relevant to limitations, notice, performance, preservation, appeal, or enforcement.
8. Update rather than recreate an existing chronology: preserve stable IDs, record superseded interpretations, and add a change summary.

## Lawyer Decision Gates

- Choosing between materially conflicting event versions.
- Treating a date as the legally operative date for limitations or procedure.
- Characterizing a disputed communication as admission, termination, waiver, settlement, or other legally consequential conduct.

## Output

- `03_Facts/chronology.yaml` or `.xlsx` as structured working data; `03_Facts/chronology.md` as a readable view.
- Columns: Event ID, date as stated, normalized date/range, actors, event, fact status, Evidence ID and pinpoint, source type, significance, adverse indication, conflict/gap, verification status.
- Separate sections for conflicts, missing periods, deadline candidates, and update changes. Status is `AI_DRAFT` or `REVIEW_REQUIRED`.

## Quality Invariants

- Every material row has a source or is explicitly `UNKNOWN`/`AI_INFERENCE`.
- Document date is not substituted for event date; date precision is not fabricated.
- Both favorable and adverse events are included.
- Conflicting versions remain visible and traceable.
- Deadline candidates are never presented as verified merely because they appear in the chronology.

## Tests

Use `tests/cases.yaml`. Relevant Eval dimensions: Fact Accuracy, Evidence Traceability, Evidence Omission, Adverse Evidence Recognition, and Critical Error Count.
