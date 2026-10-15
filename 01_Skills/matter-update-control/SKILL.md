---
name: matter-update-control
description: Coordinate a source-traceable incremental update of one PRC litigation or arbitration Matter after new material, a procedural notice, hearing record, lawyer decision, or verified legal authority arrives. Identify changed and affected work, selectively rerun specialist workflows, preserve versions, and report lawyer decisions. Not for cross-Matter monitoring, independent specialist legal conclusions, or external submission.
---

# Matter Update Control

## Metadata

| Field | Value |
|---|---|
| version | `0.1.0` |
| status | `draft` |
| owner | `Albert Wang` |
| last_reviewed | `2026-09-13` |
| validated_matters | `[]` |
| sources | Lawyer-confirmed G14-A01–A11 and G14-B01–B11; current project rules and Matter records |

## Outcome and authority

Process an explicit update event in one identified Matter, leaving a trace from source batch through baseline, change, affected record, specialist owner, quality check and lawyer handoff. Keep the update selective and idempotent. This Skill orchestrates; it does not replace `prc-evidence-review`, `procedure-deadline-control`, `prc-hearing-preparation-and-record`, `prc-legal-research`, calculation controls, or `prc-litigation-draft-builder`.

Do not scan other Matters, monitor in the background, treat a path as permission to use external/cloud services, alter `00_Original/`, overwrite prior or approved versions, contact outsiders, submit a document, or mark an AI revision `LAWYER_APPROVED`/`FINAL`.

## Receive and establish the change (G14-A)

1. Fix the Matter and explicit trigger: new file, supplemental evidence, procedural notice, hearing record, new lawyer decision, or newly verified legal authority. Read its processing permissions, `LAWYER_INSTRUCTIONS.md`, active `LAWYER_DECISIONS.md` and current stage. No cross-Matter sweep. Verify each supplied path read-only before any intake write. Ask one consolidated question only for missing material batch provenance, transfer method, actual receipt date/time and relevant permission; pass supplied answers to routed workflows so they are not asked again. Do not block on an optional note. A possible new law is not a verified authority until the legal-research workflow checks its current text, status and temporal applicability.
2. Assign or reuse a stable Update ID in `06_Analysis/MATTER_UPDATE_REGISTER.md`; if the register does not yet exist in an older Matter, create it from the project Matter mother. Compare source identity, content/hash where available, issuer, date, attachment and existing intake IDs. Repeated content links to existing Evidence/Procedure File IDs rather than creating duplicates; preserve a genuinely separate receipt/service event and send any possible new deadline trigger to G4. A changed version links to its predecessor without replacing it. Preserve source files and all previous records.
3. Snapshot only the potentially affected baseline: fact statuses, issue/claim positions, evidence and legal citations, lawyer decisions, deadlines, hearing arrangements, `DOCUMENT_PLAN.md`, draft IDs/versions, approved/final output identifiers and sources. Record the baseline in the update register *before* downstream edits. If a baseline artifact is missing, record `UNKNOWN` and proceed with unaffected work; do not invent its prior state.
4. Extract genuinely new, changed or conflicting propositions with exact source location and provenance. Keep `CONFIRMED_FACT`, `LAWYER_CONFIRMED_FACT`, `PARTY_ALLEGATION`, `AI_INFERENCE`, `UNKNOWN` and `CONFLICTED` distinct. A newer file, secondary summary, opponent assertion or AI extraction never automatically supersedes an older verified fact. Preserve both conflict versions and their possible consequences.
5. Triage immediately for near or potentially expired deadlines, hearing changes, evidence cutoffs, material adverse facts and potentially inaccurate approved documents. Route urgent items to the corresponding specialist and lawyer gate without waiting for the full update map.
6. For each domain—facts, evidence, claims/defenses, law, amount, deadlines, hearing records, drafts, approved/final files—record `DIRECT`, `POSSIBLE`, `NONE` or `UNKNOWN` impact with source and reason. Build a selective work graph with specialist owner, dependency and due-date status; do not rerun the whole Matter just because a file arrived. One batch may trigger several branches.

## Propagate and control the result (G14-B)

7. Record the update batch and task status in the register. Run affected foundational work first: evidence intake/review with G3, procedure/service/deadline with G4, hearing record with G10, facts/chronology with S2 and applicable legal source verification with S4. Then rerun only dependent issue/claim analysis, reproducible calculations, strategy, document plan and drafts. A specialist owns its legal or calculation conclusion; G14 records the handoff and completion evidence. Never propagate an unverified base value as confirmed.
8. For each substantive result, log the old value, proposed new value, change reason, source pinpoint, affected downstream IDs, verification status and responsible workflow. Summarize unfavorable changes and unresolved alternatives as visibly as favorable ones. Preserve stable IDs where the object is the same; allocate a new ID only for a genuinely new object.
9. Revise an affected draft under the same DOC ID with a new version; keep the prior draft, source mapping, change note, template selection and `08_Drafts/DRAFT_REGISTER.md` entry. Use G8 for DOCX production and page checks. Do not amend an approved/final or previously filed/sent artifact in place. Flag any need to supplement, correct or notify as a lawyer decision; a revised version does not inherit prior approval, and no external action follows automatically.
10. Put material changes to facts, claim/defense, relief, amount, procedure, evidence strategy, approved text or external position in `LAWYER_QUESTIONS.md` with source-based AI preliminary assessment, alternatives, consequence, blocked outputs and safe work that continues. Record the lawyer's answer in `LAWYER_DECISIONS.md` without silently replacing the old decision, then reopen only dependent work branches. Do not manufacture a decision from a conversation fragment or treat a pending question as consent.
11. Run affected-output QC: fact status and source pinpoints, Evidence IDs, legal authority and retrieval/applicability checks, reproducible calculations, deadline verification, cross-document consistency, confidentiality, template fidelity, version and output status. An incomplete check or unresolved material conflict remains `REVIEW_REQUIRED`; no AI update becomes external-ready merely because the orchestration tasks are finished.
12. Give the lawyer a concise internal update: what arrived, what changed or conflicted, urgency, affected versions, completed and blocked branches, required decisions, next owner and deadline status. Client-facing reporting belongs to G17 and requires the applicable review/authorization. Close the Update ID only when every impact row is completed or explicitly pending with reason, owner and next trigger. A later source or decision may reopen its dependent branch; unchanged repeat input must not create duplicate work.

## Record and completion check

Use `06_Analysis/MATTER_UPDATE_REGISTER.md` as the one cross-workflow event ledger. It links rather than duplicates the specialist registers, `DOCUMENT_PLAN.md`, `DRAFT_REGISTER.md`, `LAWYER_QUESTIONS.md` and `LAWYER_DECISIONS.md`. Write only to the current Matter's permitted working records; original sources and old versions remain intact.

Before reporting completion, verify that the batch is not duplicated, relevant baseline was preserved, every `DIRECT`/`POSSIBLE`/`UNKNOWN` impact has a disposition, specialist conclusions have actual completion evidence, urgent and material decisions reached the lawyer, revised drafts have distinct versions and QC, approved/external files were not modified, and pending branches are clearly owned. The highest AI-assigned output status is `REVIEW_REQUIRED`.

## Validation gate

Use `tests/cases.yaml` for synthetic routing and failure scenarios. Structural and synthetic checks do not establish real-Matter reliability. Keep `draft` until an authorized, desensitized historical Matter or Gold Standard update tests intake, selective propagation, specialist handoff, version/QC and lawyer revision end to end, followed by lawyer confirmation.
