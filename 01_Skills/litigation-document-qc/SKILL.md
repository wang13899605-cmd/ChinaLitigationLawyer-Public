---
name: litigation-document-qc
description: Review and, when requested, correct a PRC litigation draft for required structure, party and request consistency, factual/evidentiary support, authority status, template fidelity, formatting, and attack surface. Use after a document exists and before lawyer review or filing preparation; not to decide final claims, strategy, or approval.
---

# Litigation Document Qc

## Metadata

| Field | Value |
|---|---|
| version | `0.1.2` |
| status | `draft` |
| owner | `Albert Wang` |
| last_reviewed | `2026-09-22` |
| validated_matters | `[]` |
| sources | Themis `litigation-drafting-core`, `pleadings-core`, `pleading-qc-and-risk-audit`, `exhibit-and-attachment-plan`; AgentCounsel `brief-section-drafter`, `output-format-compliance-check`, `legal-prose-polish`; project template rules; lawyer-supplied civil-complaint format reference reviewed 2026-09-22 |

## Outcome

Determine whether a draft is complete enough for meaningful lawyer review, identify defects with exact locations and impact, and create a corrected review draft only within the existing approved theory and instructions.

## Required Inputs

- Draft, document type, intended recipient/use, procedural stage, and deadline context.
- Current Matter facts/evidence, source ledger, lawyer instructions/decisions, and document plan.
- Applicable entry in `05_Templates/TEMPLATE_INDEX.yaml` and the DOCX mother template when one matches.

## Workflow

1. Confirm document identity, version, Matter, authoring status, audience, and purpose. Do not review a partial extract as if it were the complete filing.
2. Select the template under `09_template_selection_and_fidelity.md`. Treat the DOCX mother as formatting authority; do not rebuild it from Markdown.
3. Check structure required for the document and forum: parties, requests/relief, facts/reasons, jurisdiction or procedural basis where applicable, evidence/attachments, signature area, dates, copies, and any institution-specific fields. Do not invent missing content.
4. Reconcile every party name, role, request, amount, date, defined term, annex number, Evidence ID, citation, and cross-reference across the draft and Matter records.
5. Trace material assertions and law; flag unsupported facts, overstatement, missing adverse matter, unverified authority, and mismatch between request, element, fact, evidence, and calculation.
   For a 法律检索报告, 庭审提纲 legal-authority section, 法律规定整理 or 法律法规汇编, compare every quoted law article with the official applicable-version original character-for-character. Require the entire article, including all paragraphs/items/subitems and punctuation; flag excerpts, ellipses, compressed wording, substituted AI interpretations, missing source/version/date metadata and text not independently verified. Keep internal analysis outside these documents' law-original sections.
6. Attack-test the document for threshold defects, ambiguity, unintended admission, inconsistency, omitted prerequisite, relief exceeding the approved theory, and likely opposing response.
7. Check language for precision and economy only after substance. Do not polish away qualifications, uncertainty, source markers, or lawyer-review items.
8. For DOCX/PDF, render and inspect every page: page setup, fonts/East Asian fonts, paragraph/line spacing, numbering, tables, headers/footers, pagination, signature block, orphan lines, and blank pages. For a civil complaint, compare against `TPL-COM-002`: the centered title must be only `民事起诉状`, no cause-of-action line or subtitle may appear beneath it, party information must follow the title spacing, and the mother template's font family/size, page setup, automatic numbering, paragraph indentation/spacing and signature layout must be preserved unless a verified mandatory institutional form and lawyer decision require otherwise.
9. If correction is authorized, edit a copy in `08_Drafts/`, preserve the template and previous version, and issue a change summary. Otherwise provide findings only.

## Lawyer Decision Gates

- Any change to relief, claim/defense theory, material allegation/admission, evidence position, deadline, amount, waiver, settlement, or external tone with substantive effect.
- Use of a nonmatching institutional template or material departure from the approved template.

## Output

- QC report adjacent to the draft with status: `READY_FOR_LAWYER_REVIEW`, `CONDITIONALLY_READY`, or `NOT_READY`—never `LAWYER_APPROVED` or `FINAL`.
- Finding table: location, type, severity, evidence/source, impact, proposed correction, lawyer decision required.
- When authorized: corrected `08_Drafts/` copy, version/change log, template ID, and render-QA record.

## Quality Invariants

- Formal completeness never overrides substantive defects.
- Missing content remains a visible placeholder or finding; it is never fabricated.
- Template layout is preserved and visually verified when document format matters.
- No external submission, sending, signing, stamping, or status promotion occurs.
- The strongest obvious attack point is stated, not hidden by drafting quality.

## Tests

Use `tests/cases.yaml`. Relevant Eval dimensions: Fact Accuracy, Evidence Traceability, Legal Authority Accuracy, Calculation Accuracy, Drafting Quality, Lawyer Question Quality, and Critical Error Count.
