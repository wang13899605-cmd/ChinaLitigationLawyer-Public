---
name: legal-data-format-audit
description: Verify source-to-output mappings, classifications, calculations, totals, identifiers, and DOCX/XLSX/PDF format fidelity for data-heavy or template-heavy legal work. Use for claim schedules, damages tables, evidence lists, Word tables, and filing attachments; not for deciding disputed legal classifications or substantive case strategy.
---

# Legal Data Format Audit

## Metadata

| Field | Value |
|---|---|
| version | `0.1.0` |
| status | `draft` |
| owner | `Albert Wang` |
| last_reviewed | `2026-09-09` |
| validated_matters | `[]` |
| sources | local `data-format-audit`; AgentCounsel `output-format-compliance-check`; project calculation and template-fidelity rules |

## Outcome

Create an independently reproducible audit showing where each output field came from, whether every total and classification reconciles, and whether the rendered artifact preserves the approved template.

## Required Inputs

- Authoritative source files and target output/template with full paths and versions or modification times.
- Meaning of structured fields, classification rules, calculation rule/period/rate, and intended use.
- Current Matter ID and applicable approved template entry.

## Workflow

1. Identify authoritative source and target versions. Convert legacy files fresh when needed; do not reuse stale extracted data without timestamp/hash comparison.
2. Create a field map: source file, sheet/table, row/header/cell, field meaning, target field, transformation, status, and verification method.
3. Preserve structured classifications. Do not infer legal/data status from narrative text where an authoritative structured field exists; flag conflicts.
4. Reconcile records independently by unique identifier and by party/name or another suitable second key. Record duplicates, missing records, many-to-one matches, and normalization used.
5. Recalculate every material line, subtotal, grand total, period, interest/rate, and rounding using deterministic formulas or spreadsheet logic. Preserve Input, Rule, Formula, Output, Assumptions, Source, and Verification Status.
6. Separate declared, claimed, reviewed, admitted, disputed, recognized, and paid amounts; preserve meaningful zero values. Do not collapse legally distinct categories.
7. Compare output against the approved DOCX/XLSX/PDF template: styles, East Asian fonts, sizes, indents, spacing, margins, orientation, numbering, table merges/borders/widths, headers/footers, page numbers, signature block, formulas, print areas, and pagination.
8. Render DOCX/PDF and inspect all pages; recalculate spreadsheets in a compatible engine and inspect formula errors, hidden content, filters, and print output.
9. Produce a variance list before correction. If correction is requested, edit a derivative/output copy, rerun both reconciliations and rendering, and preserve the audit trail.

## Lawyer Decision Gates

- Any legal classification not mechanically determined by an approved rule.
- Choice among disputed calculation rules, rates, dates, allocation methods, or rounding conventions with material effect.
- Material departure from a court/tribunal/firm template or removal of source rows.

## Output

- Field map, reconciliation report, calculation record, variance list, and render-QA record adjacent to the target or under the corresponding Matter analysis folder.
- State sources used, totals recomputed, unresolved conflicts, visual QA completed, and target version/hash.
- Status: `AI_DRAFT` or `REVIEW_REQUIRED`.

## Quality Invariants

- Every output row and material number can be traced and recomputed.
- Two independent reconciliation keys are used when the data permits; inability is disclosed.
- Displayed totals are never trusted without recalculation.
- Data correctness and formatting correctness are both tested.
- No unresolved material mismatch is hidden by producing a polished document.

## Tests

Use `tests/cases.yaml`. Relevant Eval dimensions: Fact Accuracy, Evidence Traceability, Calculation Accuracy, Drafting Quality, and Critical Error Count.
