---
name: prc-litigation-draft-builder
description: Draft or revise PRC civil/commercial litigation and arbitration documents for a specific Matter, using its document plan, traceable analysis, lawyer decisions, and matching DOCX mother template. Use for complaints, defenses, counterclaims, appeals, applications, evidence materials, counsel submissions, post-hearing supplements, and representation documents. Not for deciding final litigation strategy, approving a document, or submitting it externally.
---

# PRC Litigation Draft Builder

## Metadata

| Field | Value |
|---|---|
| version | `0.2.2` |
| status | `draft` |
| owner | `Albert Wang` |
| last_reviewed | `2026-09-25` |
| validated_matters | `[]` |
| sources | Lawyer-confirmed G8-A01–A16 and G8-B01–B14; project template rules; official-form verification reference; lawyer-supplied legal-research and legal-provisions format references reviewed 2026-09-21; lawyer-supplied civil-complaint format reference reviewed 2026-09-22; lawyer-confirmed evidence-catalog page-range rule dated 2026-09-25 |

## Outcome and boundary

Produce a document-specific, versioned DOCX review draft and a compact review package from the *current* Matter. This Skill builds drafts; `litigation-document-qc` checks existing drafts, `lawyer-review-gate` controls lawyer decisions and output status, and filing/service operations remain outside this Skill. Neither a good draft nor a passed QC report authorizes signing, stamping, uploading, sending, filing, or `LAWYER_APPROVED`/`FINAL` status.

## Start from the Matter

1. Confirm Matter ID, our role, stage, intended document, recipient/use, deadline, current instructions/decisions, confidentiality boundary, and all relevant pleadings/notices. If the lawyer has not specified one document, update `DOCUMENT_PLAN.md` and prioritize `REQUIRED_NOW`, then `RECOMMENDED` and `CONDITIONAL`; record why an evaluated document is `NOT_NEEDED`. Explicit lawyer deliverables take priority.
2. Give each document a stable `DOC-` ID. Record the document type, selected template ID, source-decision IDs, working version and target `08_Drafts/` path in `DRAFT_REGISTER.md` (see [draft-records](references/draft-records.md)). Do not overwrite an earlier version or a mother template.
3. Assemble a per-document input ledger: party and identity records; G5 claims/defenses, compatibility and relief mapping; S3 element–fact–evidence links and Evidence IDs; G4 deadlines; G19 jurisdiction; verified legal authorities; G16 calculations when available; prior approved versions; and lawyer decisions. If G16 has not been built, apply the project's calculation-integrity rule and `legal-data-format-audit` to a reproducible calculation record; leave unresolved figures conditional. Use only sources in this Matter. A template, old case, or AI summary cannot supply current-case facts.
4. If a material claim, defense, party, admission, waiver, counterclaim, amount structure, or procedural route remains undecided, continue unaffected sections and, where useful, create a *conspicuously conditional* `REVIEW_REQUIRED` branch draft. Identify its premise and blocked use in the sidecar; do not silently choose the external position. Missing fact/number/date is a visible placeholder and review gap, never a guess.

## Select form and draft

5. Before drafting, read `05_Templates/TEMPLATE_INDEX.yaml` and `00_System/Rules/09_template_selection_and_fidelity.md`. Select by document type, forum, stage, role, language, institution and lawyer instruction. Check `enabled_for_ai_draft`, `firm_specific`, template-review restrictions and version. A firm-specific template is unusable for a different firm. New civil complaints route to `TPL-COM-002`; `TPL-COM-001` is historical only. Treat `legal_research_report` and `legal_provisions_compilation` as different document types: the former routes to `TPL-RES-001` or `TPL-RES-002`, the latter to `TPL-LAW-003`; never substitute one merely because both quote legal provisions. Check current court/arbitral form and platform requirements; the 2025 SPC model forms are a relevant source, not an assumed universal mandate (see [form checks](references/form-and-source-checks.md)). Escalate material conflicts between the mother template and applicable institutional requirements.
6. If a suitable DOCX mother exists, copy it into `08_Drafts/` and fill it *in place*. Preserve page setup, East Asian/Latin fonts, styles, paragraph spacing, lists, tables, headers/footers, pagination and signature area. Remove inapplicable optional groups and all historical-example content; never use Markdown-to-DOCX regeneration as the mother. If no comparable mother exists, create a `REVIEW_REQUIRED` DOCX under the project's confirmed no-template font/paragraph rule, record the gap as a template candidate, and inspect numeric runs and numbering for Times New Roman.
7. Route by document purpose, not by a generic complaint skeleton. Read [document-type routing](references/document-type-routing.md) for the applicable document. For a complaint, link each requested effect to legal basis, responsible party, fact, evidence and calculation; for a defense, respond separately to each opposing request and decisive factual allegation, distinguishing admission, denial, non-dispute and reserved position without making a material admission. For a legal research report, preserve separate facts, questions, complete-law, cases, analysis and case-table sections; for a legal-provisions compilation, preserve source-only issue/request groupings and omit cases and application analysis. Other documents follow their own procedural function.
   For an evidence catalog or supplemental evidence catalog, the `页码` column means the inclusive start–end page range occupied by that evidence group in the final continuously paginated evidence bundle, not the number of pages in the source file or group. Use Arabic-number ranges such as `1-3` and `4-6`; use a single number such as `7` for a one-page group. Never write `3页`, `共3页`, a source-PDF internal page count, or another quantity expression in this column. Calculate ranges cumulatively only after the included pages and evidence order are fixed. If the final evidence bundle has not yet been assembled or continuously paginated, write a visible `待编页` placeholder in the review draft and update the catalog after pagination; do not invent a final range.
8. Draft material assertions with current Matter Fact IDs/status and reproducible Evidence ID pinpoints. A party allegation or conflicted fact remains qualified; inference is not rewritten as established fact. Use only verified, temporally applicable law and authentic citations. Keep unverified authority outside a proposed external text and in the sidecar research gap. Do not fabricate case numbers, quotations, dates, amounts, entities, signatures or attachment locations.
   For a civil complaint, preserve `TPL-COM-002` exactly as the formatting authority: the centered title is only `民事起诉状`; do not insert a cause-of-action line or subtitle beneath it, and begin party information immediately after the title spacing. Preserve the mother template's font family and size, page setup, automatic numbering, paragraph indentation/spacing and signature layout. For a factually simple complaint, prefer a compact chronological account of material client-favorable facts under `事实与理由`, without gratuitous analytical subheadings or repetitive legal exposition. Internal evidence-audit phrases (for example, “现有截图至少显示”) belong in the sidecar, not the pleading; state the refund/payment fact directly only to the extent its status permits. Preserve material uncertainty in the sidecar and use a visible placeholder if it cannot safely be alleged. Do not include attorney fees without a current lawyer instruction. An identified counsel's name is enough to prepare an authorization/firm-letter draft; do not request that lawyer's practice certificate from the lawyer-user as a drafting precondition. Any certificate required by the forum is a later firm-side filing check.
9. Reconcile party names/roles, definitions, claim order, amounts/formulas, dates, law, evidence references, attachment order and page pinpoints across the draft and contemporaneous documents. Respect G5 primary/alternative/conditional compatibility; test accidental admissions and double recovery. A critical unresolved inconsistency keeps the draft `REVIEW_REQUIRED`.

## Verify, version, and hand off

10. Send each complete draft, current Matter records, template entry and source ledger through `litigation-document-qc` (read `01_Skills/litigation-document-qc/SKILL.md` directly while that Skill remains unactivated); use `legal-data-format-audit` for material tabular/amount/format cross-checks when applicable. Render *every page* of DOCX/PDF with a Word-compatible process and inspect text plus layout, including font runs, line/paragraph spacing, lists, tables, headings, headers/footers, pagination, signature area, orphan lines and blank pages. If rendering or visual inspection is unavailable, record the unperformed check and mark `NOT_READY` for final lawyer approval; never claim the layout passed.
11. QC distinguishes critical, major and minor defects with exact location, impact and suggested fix. Correct defects without changing the current lawyer-decided position, rerun affected checks, and preserve old versions. A proposed correction that changes relief, theory, material fact/admission, amount, deadline or external stance goes to the lawyer rather than being silently incorporated.
12. Deliver together: the versioned DOCX in `08_Drafts/`; its [sidecar](references/draft-records.md) with source/decision/template IDs, unresolved fields, conditional premises, material changes and page-QA status; the QC report; and a short lawyer review list with AI recommendations and strongest adverse issue. For bilingual work, check Chinese/English correspondence and keep translation review unresolved until the lawyer or qualified reviewer confirms it.
13. When the lawyer decides or new material arrives, preserve prior versions, update affected input/decision links, rebuild only affected drafts and rerun content plus visual QC. Update `DOCUMENT_PLAN.md` and `DRAFT_REGISTER.md` to point to the current review version; never infer approval from a filename, a review comment, or a QC pass.

## Lawyer decision gates

Final claims, defenses, counterclaims, parties, requested relief and order, primary/alternative structure, material admission/non-dispute/waiver, settlement or preservation choices, use of a disputed institutional form, material template deviation, bilingual external meaning, and every externally filed or sent version require lawyer confirmation. For each question, give an AI preliminary view, alternatives, source/evidence status, consequence, deadline, affected document IDs and work that can proceed meanwhile.

## Required invariants

- Every draft is in the current Matter's `08_Drafts/`, with only `AI_DRAFT` or `REVIEW_REQUIRED` status.
- An unresolved *critical* field, source, calculation, contradiction or render check cannot be described as ready for final approval or submission.
- Template typography is preserved when a matching mother exists; the no-template font rule applies only when there is no comparable mother.
- Numeric typography, numbering, paragraph indentation and spacing are checked in the actual DOCX, not assumed from the text description.
- Evidence-catalog `页码` values are final continuous evidence-bundle page locations (`1-3`, `4-6`, `7`), never page quantities (`3页`) or unverified source-PDF pagination.
- A conditional draft is explicitly conditional and not suitable for external use until its premise and lawyer decision are resolved.
- No filing, external communication, signing, stamping, payment, approval promotion or destructive change occurs under this Skill.

## Tests

Use `tests/cases.yaml` for synthetic scenarios. Structural validation and scenario specifications do not prove behavioral correctness. Before promotion beyond `draft`, run an approved historical Matter or Gold Standard end-to-end, including template fill, page rendering, QC defects, lawyer corrections and version regeneration; record critical-error count and whether the draft actually reduced lawyer revision work.
