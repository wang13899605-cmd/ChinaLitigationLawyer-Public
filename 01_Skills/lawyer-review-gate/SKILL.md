---
name: lawyer-review-gate
description: Consolidate unresolved factual, legal, evidentiary, calculation, deadline, confidentiality, and strategy issues into a decision-ready lawyer review gate for a specific work product. Use before reliance, approval, filing, or external transmission; never use to approve, finalize, send, or decide lawyer-reserved matters.
---

# Lawyer Review Gate

## Metadata

| Field | Value |
|---|---|
| version | `0.1.0` |
| status | `draft` |
| owner | `Albert Wang` |
| last_reviewed | `2026-09-09` |
| validated_matters | `[]` |
| sources | AgentCounsel `attorney-review-gate`; project lawyer decision gate, question loop, and output-status rules |

## Outcome

Tell the lawyer whether the work product is ready for meaningful review, what must be checked or decided, what can proceed, and exactly which outputs remain blocked. "Ready for lawyer review" never means approved or ready to send.

## Required Inputs

- Complete target version and intended use/recipient.
- Matter instructions, decisions, source records, deadline/calculation records, and applicable prior QC.
- Current output status and next proposed action.

## Workflow

1. Confirm target version, Matter ID, intended recipient/use, stage, deadline, and whether the next action is internal review, client delivery, filing, or another external act.
2. Consolidate, without duplicating, unresolved material facts, conflicting evidence, unverified law/citations, calculation/deadline issues, confidentiality risks, template defects, and prior QC findings.
3. Apply `04_lawyer_decision_gate.md`. Create a Lawyer Question only for a material choice that cannot safely be resolved by source checking or a reversible assumption.
4. Each question must include importance, issue, impact, current evidence, AI preliminary view, the smallest answer needed, blocked outputs, and unblocked work. Split independent decisions.
5. Check that every prior lawyer decision remains applicable to this version and has not been superseded by new evidence or assumptions.
6. Assign one gate result:
   - `NOT_READY_FOR_LAWYER_REVIEW`: defects prevent meaningful review.
   - `READY_FOR_LAWYER_REVIEW`: complete enough for review, with confirmation items clearly listed.
   - `LAWYER_DECISION_REQUIRED`: a reserved decision blocks the stated next use, while unaffected work may continue.
7. On a lawyer answer, record it in `LAWYER_DECISIONS.md`, close/link the question, identify affected outputs, and rerun only the impacted analysis or drafts.

## Non-Negotiable Boundary

This Skill cannot mark anything `LAWYER_APPROVED` or `FINAL`; cannot check a lawyer confirmation box; and cannot file, send, publish, sign, stamp, waive, settle, or otherwise act externally.

## Output

- Gate report with target/version/use, result, reasons, must-confirm facts/law/citations/calculations/deadlines, confidentiality and template flags, Lawyer Questions, unblocked work, and rerun plan.
- Structured questions in `LAWYER_QUESTIONS.md`; answers in `LAWYER_DECISIONS.md` only after the lawyer supplies them.
- Status: `REVIEW_REQUIRED`.

## Quality Invariants

- Questions meet the materiality threshold and are not generic "please confirm" items.
- Each blocking item names affected and unaffected outputs.
- Existing decisions are applied by scope and version, not globally assumed.
- No unresolved Critical Error is hidden by a "ready" result.
- Gate terminology cannot be mistaken for legal approval or transmission authority.

## Tests

Use `tests/cases.yaml`. Relevant Eval dimensions: Lawyer Question Quality, Fact Accuracy, Legal Authority Accuracy, Current-Law Accuracy, and Critical Error Count.
