---
name: litigation-integrity-audit
description: Audit litigation analysis or drafts for unsupported facts, hidden assumptions, omitted adverse material, source mismatches, invented precision, cross-Matter contamination, and overconfident conclusions. Use as an adversarial review after substantive work or before lawyer review; not as a substitute for source research or document-format QA.
---

# Litigation Integrity Audit

## Metadata

| Field | Value |
|---|---|
| version | `0.1.0` |
| status | `draft` |
| owner | `Albert Wang` |
| last_reviewed | `2026-09-09` |
| validated_matters | `[]` |
| sources | AgentCounsel `assumption-audit`, `hallucination-red-team`, `red-team-verifier`, `citation-integrity-check`; project fact/evidence/legal-authority rules |

## Outcome

Return a severity-ranked defect report with precise locations, sources checked, correction route, and a clear distinction between a correctable defect and an issue requiring lawyer judgment.

## Required Inputs

- Target draft/analysis and its intended use.
- Current Matter source set, Fact/Evidence/Source IDs, instructions and lawyer decisions.
- Known calculation, deadline, and prior-QC records when relevant.

If the source set is unavailable, perform only an internal-consistency audit and label the scope limitation prominently.

## Workflow

1. Confirm Matter ID and intended audience. Test for names, dates, facts, citations, or strategy apparently drawn from another Matter or template.
2. Break the target into material factual, legal, procedural, quantitative, and strategic propositions.
3. Trace each proposition to source and pinpoint. Classify supported, overstated, contradicted, unverified, or unsupported; do not treat repeated derivative text as independent support.
4. Locate hidden assumptions, ambiguity resolved without basis, missing conditions, invented precision, and uncertainty concealed by polished language.
5. Search the available record for adverse facts, missing context, inconsistent versions, contrary authority, exceptions, and the opponent's strongest supported explanation.
6. Check identities, role, forum, case number, procedural stage, dates/deadlines, amounts, formulas, quotations, article/case numbers, and output status.
7. Assign severity: `CRITICAL` if reliance could cause a project Critical Error; `HIGH` if it may materially change position/output; `MEDIUM` if correction is needed but effect is bounded; `LOW` for clarity/housekeeping.
8. Recommend correction: fix from source, perform research/recalculation, preserve branches, remove assertion, or create a narrowly framed Lawyer Question. Re-audit changed passages only after correction.

## Lawyer Decision Gates

- Any proposed correction that changes a claim, defense, material admission, legal position, deadline treatment, amount, settlement posture, or external representation.
- Whether conflicting evidence or authority should be resolved in a formal position.

## Output

- `06_Analysis/integrity_audit_<target>.md` or adjacent review file.
- Finding table: ID, severity, target location, proposition, defect type, source checked, impact, correction, owner/status.
- Sections: scope limits, Critical findings, adverse/omitted material, assumption register, source/citation defects, cross-Matter check, ready/not-ready recommendation.
- Status: `REVIEW_REQUIRED` when any material finding remains.

## Quality Invariants

- Findings identify exact target and source locations, not generic cautions.
- Lack of source access is not reported as proof of falsehood.
- Adverse evidence and contrary authority are actively sought.
- The audit does not silently rewrite a lawyer-reserved position.
- A Critical Error cannot be offset by a high aggregate score.

## Tests

Use `tests/cases.yaml`. Relevant Eval dimensions: Fact Accuracy, Evidence Omission, Unsupported Inference Rate, Adverse Evidence Recognition, Legal Authority Accuracy, Current-Law Accuracy, and Critical Error Count.
