---
name: prc-hearing-preparation-and-record
description: Prepare a PRC civil or commercial litigation or arbitration hearing, then process lawyer-supplied hearing records and court directions for a specific Matter. Use when a hearing is scheduled or changed, an opponent evidence batch needs hearing examination preparation, or the lawyer uploads a transcript or post-hearing note. Not for appearing live, making material concessions, approving drafts, or filing externally.
---

# Hearing Preparation and Record

## Metadata

| Field | Value |
|---|---|
| version | `0.1.2` |
| status | `draft` |
| owner | `Albert Wang` |
| last_reviewed | `2026-09-21` |
| validated_matters | `[]` |
| sources | Lawyer-confirmed G10-A01/A07/A12/A17/A19/A20 and G10-B01–B10; previously retained O/P stage actions; project rules and current Matter sources |

## Outcome and boundaries

Maintain an activity-specific hearing preparation record and, for each formal hearing, two **separate** `REVIEW_REQUIRED` DOCX drafts: a hearing outline and a legal-authority compilation. After a hearing, process only records the lawyer actually supplies; distinguish their provenance, identify material changes and court directions, update affected Matter work, and prepare appropriate post-hearing drafts for lawyer review.

This Skill does not observe or record a live hearing, determine final positions, request a procedural measure, agree to settlement, correct an official transcript, contact a court/tribunal/client, or submit a document. A successful AI check is not lawyer approval. G10-A is limited to the six confirmed entries; other O-stage baseline actions are not added here as separate required G10-A tasks.

## Start and routing

1. Fix the current Matter and check its material-processing authorization and confidentiality instructions before reading client files. Then confirm our role, forum, procedure stage, latest notice, hearing activity and current lawyer decisions. Read `06_Analysis/HEARING_CARD.md` and relevant G4 source history. If a new summons or changed arrangement was supplied, route it to `procedure-deadline-control`; show the difference and require lawyer confirmation of the operative arrangement. Do not overwrite the previous schedule or infer a date from an old notice.
2. Distinguish a pretrial conference, evidence exchange, inquiry, formal court hearing and arbitration hearing. The activity controls which preparation is useful. A formal hearing triggers both separate DOCX deliverables below; another activity does not automatically trigger a full hearing packet. Record the classification and reason in `06_Analysis/HEARING_PREP_REGISTER.md`.
3. Read the current Matter facts, Evidence IDs, claims/defenses, issue map, verified legal research, existing pleadings, procedural orders, `DOCUMENT_PLAN.md`, `LAWYER_INSTRUCTIONS.md` and `LAWYER_DECISIONS.md`. A historical template or previous Matter is a format/method reference, never a fact or applicable authority for this Matter.

## Before a hearing — confirmed G10-A

4. For each opponent exhibit expected to be examined, prepare a source-pinned position on authenticity, legality, relevance, completeness, claimed proof purpose and weight; distinguish the opponent's assertion from our proposed response and anticipate the strongest reply. Route evidence legal nature and material proof-effect choices through the G3 lawyer gate. Do not invent a missing original or claim the court has accepted the exhibit.
5. List plausible procedural options raised by this hearing, such as new or supplemental evidence, evidence investigation, appraisal, postponement or objection. Verify the actual forum's current rule, order and timing with G4/research; provide consequences and a proposed course, but let the lawyer decide whether to assert or apply. A proposal is not an instruction to the court.
6. Run a source-grounded adversarial rehearsal: simulate opposing questions and likely responses, mark what is known, disputed or missing, and record resulting gaps. A simulated answer is not a client statement, admission or `CONFIRMED_FACT`.
7. For each formal hearing, update `DOCUMENT_PLAN.md` with **two distinct** required-now documents: `hearing_outline` using `TPL-HRG-002`, and `legal_provisions_compilation` using `TPL-LAW-003`. Select the actual indexed DOCX mothers and use `prc-litigation-draft-builder` for in-place filling, versioning and `DRAFT_REGISTER.md`; do not rebuild their format from Markdown or overwrite a mother. The outline reflects this session's activity, current issues, evidence, questions and conditional procedural choices. In the outline's legal-authority section and throughout the separate compilation, quote each verified applicable-version legal article in full, preserving all paragraphs/items/subitems and punctuation; never excerpt, ellipsize, condense or substitute AI understanding. Keep exact title/article, governing version and applicable time, issuing body/status, official source and retrieval date outside the original-text block. The compilation groups provisions by issue, claim or requested relief and contains no case analysis or strategy. Analysis, if needed, goes in a legal research report or separate internal memo. Unverified propositions stay in the research gap, not a purported verified compilation. Never carry the historical exemplar's law or case facts forward.
8. Apply document QC and page-render inspection to both DOCX drafts; keep them separate and mark `REVIEW_REQUIRED`. Put material testimony, evidence-effect, procedural and external-position decisions in `LAWYER_QUESTIONS.md` with an AI preliminary view and safe work that can continue. Do not label an unrendered or legally unverified draft hearing-ready.

## After a hearing — confirmed G10-B

9. Trigger this phase when the lawyer supplies an official transcript, personal notes, court direction or other hearing record. Verify each path read-only and register source, actual receipt date, author/origin, whether official or recollection, and any missing pages in `06_Analysis/HEARING_SESSION_LOG.md`. Ask once for missing source/receipt metadata that affects reliability; continue unaffected extraction. Allocate one stable Hearing Session ID and unique Event IDs. An AI reconstruction does not become a new primary source.
10. Reconstruct actual events in order with actor, stated position/action, source pinpoint and status. Keep formal transcript, lawyer contemporaneous note, client recollection, opposing statement and AI inference distinct; retain conflicts rather than silently merging. Record court focus and instructions with the exact available wording and whether oral, written, confirmed or disputed.
11. Route each court-ordered supplement, form, deadline and later hearing notice to G4 for source registration and deadline verification. Do not calculate from an uncertain oral direction as if it were a confirmed written order. Record new opponent allegations, evidence and theories separately; route new evidence to G3 and a material claim/defense change to G5. A document displayed at hearing is not automatically in our `00_Original/` or accepted by the court.
12. Flag possible party admission, request/defense amendment, waiver, settlement or other material external position immediately for lawyer decision. Do not characterize a contested statement as a binding admission or change the approved strategy on AI judgment alone. Preserve the original wording and source alongside the risk analysis.
13. If an official transcript is available, compare it with the lawyer's notes and identified events. Produce a pinpointed list of omission, mistake or ambiguity in `06_Analysis/HEARING_FOLLOWUP_REGISTER.md`; give the lawyer a proposed correction and timing/rule-check prompt. Do not alter the official original or make the request independently. If no official transcript is available, mark comparison `PENDING_SOURCE`, not “passed.” For court proceedings, the currently applicable transcript-review rule must be rechecked; arbitration follows its own institutional rules.
14. Update affected facts, Evidence IDs, issues, risks, claim/defense options, hearing card, deadlines and document plan incrementally. Cite the new event/source and record old value, proposed new value, uncertainty and dependent outputs in `HEARING_FOLLOWUP_REGISTER.md`. Do not wait for a future G14 Skill to perform safe local updates; G14 may later orchestrate broader propagation.
15. Identify court-required and strategically useful post-hearing documents separately. Use G8 to draft any applicable supplemental counsel submission, examination opinion, factual explanation or other document, then run template/QC/confidentiality and lawyer-review gates. Do not produce every possible document or send/upload it. If another hearing is scheduled, rerun the relevant G10-A steps and refresh both separate formal-hearing documents.
16. Deliver an internal post-hearing brief to the lawyer: verified events, disputed records, court directions, deadline candidates, changed risk, required drafts, exact lawyer decisions and next owners. Client-facing reporting belongs to G17 and requires the appropriate lawyer approval.

## Stable records and handoffs

- `06_Analysis/HEARING_PREP_REGISTER.md`: session/activity, operative notice and confirmation, G10-A work, two DOC IDs and review status.
- `06_Analysis/HEARING_SESSION_LOG.md`: source batches, stable session/event IDs, chronological events and source status.
- `06_Analysis/HEARING_FOLLOWUP_REGISTER.md`: directions, transcript differences, impact propagation, tasks, deadlines and documents.
- `DOCUMENT_PLAN.md`, `08_Drafts/DRAFT_REGISTER.md` and `LAWYER_QUESTIONS.md`: use existing Matter controls; do not create a parallel approval system.

## Stop and quality conditions

- Work on unaffected items continues when a transcript, notice, source detail, legal rule or lawyer decision is missing. State the exact blocked output and next input needed.
- No event lacks a source pinpoint and provenance label; no legal authority in a review compilation lacks version, source, retrieval date and applicability check; no deadline is silently inferred; no significant concession or procedural choice is silently adopted.
- No law article in either pre-hearing document is a paraphrase or truncated extract; verify the complete text against its official applicable version before marking the draft review-ready.
- A formal hearing cannot be reported as fully prepared unless both independent DOCX drafts exist, have passed source/QC and page-layout checks, and outstanding lawyer decisions are visible. This is readiness for *review*, never authority for external use.
- The only AI output statuses are `AI_DRAFT` and `REVIEW_REQUIRED`; no signing, filing, sending, scheduling a hearing, editing source records or promotion to `LAWYER_APPROVED`/`FINAL` under this Skill.

## Validation

Use `tests/cases.yaml` for synthetic edge cases. Structural and scenario-specification checks alone do not validate real-Matter behavior. Before `validated`, run at least one lawyer-approved historical or Gold Standard Matter across a formal-hearing preparation and post-hearing update, including actual DOCX fill/render, event provenance, transcript comparison, deadlines, lawyer corrections and downstream re-draft.
