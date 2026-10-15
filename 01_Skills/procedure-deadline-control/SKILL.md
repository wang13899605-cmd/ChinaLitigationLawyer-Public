---
name: procedure-deadline-control
description: Control procedural documents, service events, hearing information, statutory or directed periods, internal due dates, and reminders in a PRC litigation, arbitration, enforcement, or related Matter. Use when a new summons, notice, ruling, service record, platform message, hearing change, or possible deadline enters the Matter, or when calculating, verifying, updating, or monitoring a procedural deadline. The skill does not choose final jurisdiction, limitation-period treatment, waiver, or another material procedural position without lawyer confirmation.
---

# Procedure and Deadline Control

## Metadata

| Field | Value |
|---|---|
| version | `0.1.0` |
| status | `draft` |
| owner | `Albert Wang` |
| last_reviewed | `2026-09-13` |
| validated_matters | `[]` |
| sources | Lawyer-confirmed G4-A and G4-B standards dated 2026-09-12 and 2026-09-13; lifecycle G-05 to G-12, M07-M08, N02, O01, P05, R01 and cross-stage updates; project fact, evidence, legal-authority, calculation, output-status, and lawyer-gate rules |

## Outcome

Maintain an append-only procedural record in which every operative date can be traced to a document or receipt event, every deadline can be recalculated from explicit parameters, every change preserves the prior version, and proactive reminders occur only under the Matter's recorded reminder authorization.

## Scope Boundary

- This skill identifies the current procedural stage, registers procedural files and service events, computes candidate deadlines, maintains hearing information, and prepares or updates reminder plans.
- `prc-legal-research` verifies the current legal rule, official holiday arrangement, court or arbitral rule, and platform cutoff when the source is not already authoritative and current.
- `litigation-chronology` may supply fact chronology; this skill remains authoritative for deadline cards and procedure-document version history.
- `prc-jurisdiction-analysis` addresses G-03. Do not convert a route or jurisdiction candidate into the final filing position here.
- Treat limitation and exclusion periods as a distinct high-risk stream. This skill may register and model scenarios, but interruption, suspension, extension, starting-point disputes, or loss-of-right conclusions require lawyer review.

## Required Inputs

- Current Matter ID, procedural role, stage, and accessible source path.
- The procedure document, service record, platform record, lawyer-confirmed event, or verified legal rule that may trigger the date.
- For a new procedure-file batch: source or transfer method, actual receipt date/time, whether it replaces or changes an earlier notice, and an optional note. If missing, ask one consolidated question after verifying the path.
- Matter reminder policy: `unconfirmed`, `authorized`, or `disabled`; if authorized, recipients, delivery method, and covered deadline types.

Continue all unaffected registration and analysis when an input is missing. Mark the affected field `UNKNOWN`, `CONFLICTED`, `待核验`, or `REVIEW_REQUIRED`; never infer a service date or legal trigger merely from the document date.

## Workflow

1. **Fix the Matter and preserve the source.** Read the Matter rules and existing deadline records. Do not move, rename, overwrite, annotate, or replace a source file in `00_Original/`. Allocate a unique Procedure File ID and link any derivative text to it.
2. **Collect missing receipt metadata once.** When the lawyer gives only a path, verify it read-only, then ask one consolidated question for source/transfer method, actual receipt date/time, whether the notice changes or supersedes an earlier notice, and an optional note. Do not repeat supplied fields and do not block on an omitted optional note.
3. **Separate the four dates.** Record document date, sent/published date, actual receipt date/time, and candidate legal trigger date/time independently. Each must have a source or an explicit status. Preserve the operative deadline wording verbatim with a pinpoint.
4. **Register and compare versions.** Record issuing body, case number, document type, participants, attachments, signature/seal, platform and anomalies. Compare a new notice with all relevant prior notices; preserve both and create an explicit `changes` relation. Never silently overwrite a prior hearing or deadline.
5. **Identify current procedure state.** State the verified stage, completed procedural acts, pending acts, next expected event, and supporting source. Distinguish a verified state from a route prediction.
6. **Enumerate deadline candidates.** Search every in-scope file and event for statutory, court/arbitral-directed, contractual, and internal deadlines. Include hearing, response, jurisdiction objection, evidence, appeal/remedy, preservation, payment, filing, service, enforcement, limitation, exclusion, and other plausible candidates without assuming each is operative.
7. **Verify the governing rule before calculation.** Record the current authoritative text, status/effective date, retrieval date, source, applicable procedure, unit, starting rule, excluded/included day, holiday rule, extension rule, timezone, platform cutoff, and any discretionary order. Unverified propositions remain `待核验` and cannot support an external filing date.
8. **Separate factual from legal triggers.** The factual trigger is what happened and when; the legal trigger is the event the verified rule treats as starting the period. Link both to evidence and explain any difference.
9. **Calculate explicit scenarios.** Create a complete Deadline Card using [references/deadline-records.md](references/deadline-records.md). Use `scripts/calculate_deadline.py` only after the legal parameters are fixed; it performs arithmetic, not legal interpretation. When a parameter is disputed, produce named scenarios rather than one false-precision answer.
10. **Apply calendar and filing controls.** Verify calendar day, working day, month, year, or hour units; official annual holiday and adjusted-working-day arrangements; last-day extension; electronic platform timezone, cutoff, maintenance, and successful-upload evidence. Do not assume a platform remains available until midnight.
11. **Independently verify.** Every material deadline requires two independently described checks, normally deterministic calculation plus manual timeline review or a second verified tool. Record checker, method, timestamp, agreement, and unresolved variance.
12. **Set protective and internal dates.** When trigger or rule is uncertain, use the earliest plausible due time as the protective control date while preserving all scenarios. Default internal due date is two working days before the official deadline; increase the lead for complex documents, signature/seal circulation, client approval, translation, cross-border logistics, or known platform risk.
13. **Classify risk and ownership.** Assign owner and reviewer; AI cannot mark either as accepted. Immediately route expired/potentially expired, under-seven-day, conflicting-source, uncertain-rule, rights-loss, waiver, limitation/exclusion, and material-procedure-choice items to the lawyer gate, together with analysis and protective action candidates.
14. **Plan reminders under authorization.** Read [references/reminder-policy.md](references/reminder-policy.md). Critical deadlines normally use 14/7/3/1-day reminders; ordinary deadlines use 7/3/1-day reminders. If fewer than seven days remain, surface immediately and rebuild the remaining schedule. If the Matter policy is `authorized`, confirmed deadlines may create or update proactive scheduled reminders without per-deadline reauthorization. If it is `unconfirmed` or `disabled`, maintain only the register and risk list.
15. **Update hearing information with confirmation.** Extract court/tribunal, case number, hearing date/time, timezone, place/link, chamber, participants, attendance requirements, and source. Mark changed hearing information `REVIEW_REQUIRED` until the lawyer confirms the currently operative arrangement.
16. **Require completion evidence.** Do not mark a deadline completed merely because a draft exists or an upload was attempted. Link receipt, platform success page, payment voucher, delivery confirmation, filing acknowledgement, or equivalent proof. Otherwise use `pending_confirmation` or `submission_attempted`.
17. **Propagate incremental changes.** A new notice or receipt event triggers recalculation only of affected deadlines and updates the procedure status, hearing card, document plan, tasks, drafts, and reminder schedule. Record old value, new value, reason, source, affected outputs, and lawyer dependency.

## Lawyer Decision Gates

Send a fully analyzed item to `LAWYER_QUESTIONS.md` when it involves:

- final jurisdiction, route, waiver, extension request, procedural objection, or another material procedural choice;
- disputed or uncertain legal trigger, conflicting service evidence, a potentially expired deadline, or less than seven days remaining;
- limitation or exclusion-period interruption, suspension, starting point, expiry, or rights-loss consequences;
- reliance on a changed hearing arrangement, changed court direction, or ambiguous notice;
- whether a filing, payment, service, or other act is legally complete where the required confirmation is absent or contested.

For each question, provide the source set, competing scenarios, earliest protective date, preliminary view, consequences, safe work that continues, and exact decision requested. Ordinary clear deadlines with verified rule and trigger may be registered automatically but remain `AI_DRAFT` until lawyer approval rules are satisfied.

## Outputs

Create or update as needed:

- `01_Index/PROCEDURE_FILE_LOG.md`: procedure-file receipt, source, dates, versions, replacements, and anomalies.
- `06_Analysis/PROCEDURE_STATUS.md`: current stage, completed and pending acts, next events, and sources.
- `06_Analysis/DEADLINE_REGISTER.yaml`: current deadline cards and statuses.
- `06_Analysis/DEADLINE_CALCULATIONS.md`: inputs, rules, formulas, scenarios, and independent verification.
- `06_Analysis/DEADLINE_CHANGE_LOG.md`: append-only old/new values and downstream effects.
- `06_Analysis/HEARING_CARD.md`: current and historical hearing arrangements, with lawyer-confirmation status.
- `06_Analysis/REMINDER_REGISTER.yaml`: authorization, recipients, planned/created reminder points, external task IDs if any, and update/cancellation history.
- `LAWYER_QUESTIONS.md`: only material procedural decisions and high-risk anomalies.

All AI-created content remains `AI_DRAFT` or `REVIEW_REQUIRED`. Creating a register or scheduled reminder does not authorize a filing, payment, communication, appearance, or submission.

## Quality Invariants

- No deadline exists without a unique Deadline ID, Matter, type, source, trigger, rule status, formula, due time, assumptions, owner, reviewer, and verification status.
- Document date, send date, actual receipt date, and legal trigger remain separate even when equal.
- A new source never erases the earlier notice, calculation, hearing entry, or reminder history.
- The earliest plausible date is visible whenever scenarios diverge.
- Official due date, internal due date, reminder date, and completion date are different fields.
- Current-law and annual-calendar checks record retrieval date and authoritative source.
- `completed` always resolves to external or institutional proof of completion.

## Failure and Uncertainty Handling

- If a document is unreadable or attachments are missing, preserve the error and register only visible metadata; do not describe unseen content.
- If source or receipt time is unknown, ask the standard consolidated question; if the answer remains unknown, maintain scenarios and the protective date.
- If the calculation tool does not support the verified legal method, calculate in a reviewable worksheet or script and document the method; do not force the case into an unsupported formula.
- If proactive reminder creation is unavailable, record `planned_not_created`, explain why, and keep the risk item visible. Never imply that a reminder exists without a returned task identifier or visible scheduled-task record.

## Tests

Use `tests/cases.yaml` and `tests/test_calculate_deadline.py`. Relevant Ring 1 Eval dimensions: Current-Law Accuracy, Fact Accuracy, Evidence Traceability, Calculation Reproducibility, Deadline Recall, Lawyer Question Quality, Update Integrity, and Critical Error Count. Passing synthetic tests does not make the skill `validated`.
