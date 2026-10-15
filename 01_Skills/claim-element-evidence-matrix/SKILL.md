---
name: claim-element-evidence-matrix
description: Map proposed claims, defenses, counterclaims, and procedural issues in a PRC dispute to verified legal elements, material facts, supporting and adverse evidence, burdens, and gaps. Use before drafting or when testing case theory; not to select final claims or resolve contested legal elements without lawyer review.
---

# Claim Element Evidence Matrix

## Metadata

| Field | Value |
|---|---|
| version | `0.1.0` |
| status | `draft` |
| owner | `Albert Wang` |
| last_reviewed | `2026-09-09` |
| validated_matters | `[]` |
| sources | Themis `claims-and-elements-builder`; AgentCounsel `claim-chart`; claude-for-legal-ZH `claim-chart`; project claim schema |

## Outcome

Expose exactly what must be established or defeated, which materials support each proposition, what cuts the other way, and which gaps affect pleading, proof, or procedure.

## Required Inputs

- Our role, procedural stage, proposed or pleaded claims/defenses, and intended use.
- Current facts and Evidence IDs in scope.
- Verified controlling authority, or a clear `待核验` placeholder and research task.

## Workflow

1. Separate each claim, defense, counterclaim, and procedural issue. Assign stable `C-` IDs and identify proponent and requested result.
2. Extract elements from verified current PRC authority. Preserve alternative formulations and time applicability. Never import common-law elements as Chinese law.
3. For every element, map Fact IDs and supporting Evidence IDs with pinpoint locations; map adverse and conflicting evidence with equal specificity.
4. Separate ultimate fact, evidentiary fact, legal conclusion, and inference. Record burden of proof and applicable standard only when supported by verified authority.
5. Assess each element using the project schema: `supported`, `partially_supported`, `unsupported`, `conflicted`, or `unknown`. Explain the basis without predicting the final judgment.
6. Identify conditions precedent, limitations/period issues, jurisdiction, standing/party qualification, causation, amount, mitigation, enforceability, and procedural prerequisites when genuinely applicable.
7. Produce an ordered gap plan: missing material, possible lawful source, responsible person, urgency, and which output is affected.
8. Present the opponent's strongest supported position and test whether any single missing or adverse element materially changes the theory.

## Lawyer Decision Gates

- Final claim/request, defense, alternative theory, admission, burden strategy, withdrawal, waiver, or concession.
- Choosing a controlling element formulation when authorities conflict or local practice matters.
- Characterizing evidence as sufficient for filing or as likely accepted by a court.

## Output

- `06_Analysis/claim_element_evidence_matrix.yaml` plus readable `.md` or `.xlsx` when useful.
- For each element: authority/source status, burden, Fact IDs, supporting Evidence IDs, adverse Evidence IDs, assessment, gap, next action, and lawyer decision dependency.
- Begin with the critical gap list; end with strongest adverse theory and affected documents. Status: `AI_DRAFT` or `REVIEW_REQUIRED`.

## Quality Invariants

- No element is asserted as current law without a verified source and applicable date.
- No evidence reference is accepted without a reproducible pinpoint.
- Absence of material is recorded as a gap, not converted into a fact.
- Adverse evidence and alternative explanations are not omitted.
- Matrix does not silently become the final litigation strategy.

## Tests

Use `tests/cases.yaml`. Relevant Eval dimensions: Key Issue Recall, Fact Accuracy, Evidence Traceability, Evidence Omission, Adverse Evidence Recognition, Legal Authority Accuracy, and Lawyer Question Quality.
