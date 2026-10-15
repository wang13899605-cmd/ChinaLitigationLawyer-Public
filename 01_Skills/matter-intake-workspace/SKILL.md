---
name: matter-intake-workspace
description: Open or normalize a PRC litigation, arbitration, enforcement, or related dispute Matter by capturing core instructions, creating the approved isolated workspace, registering original materials, deadlines, and initial document plan. Use when a lawyer asks to start, import, or reorganize a case; do not use for substantive merits conclusions.
---

# Matter Intake Workspace

## Metadata

| Field | Value |
|---|---|
| version | `0.1.2` |
| status | `draft` |
| owner | `Albert Wang` |
| last_reviewed | `2026-09-20` |
| validated_matters | `[]` |
| sources | AgentCounsel `create-matter-workspace`, `legal-intake-triage`, `matter-intake`; claude-for-legal-ZH `matter-intake`, `matter-workspace`; project `new_matter.md`; lawyer-confirmed G4-B reminder authorization rule |

## Outcome

Create a unique, isolated Matter that can be processed without altering source materials. Populate only supported information, identify immediate deadline risks, and leave a usable first-round work plan.

## Required Inputs

- Client; our procedural role; opposing parties.
- Short dispute description and client objective.
- Current procedural stage and nearest stated deadline.
- Full path to source materials and authority to copy them into the Matter.
- Matter destination: default framework-managed `08_Cases` location or a lawyer-specified absolute external `MATTER_ROOT`. When invoked through `$china-litigation-workflow`, use its live `FRAMEWORK_ROOT`/`MATTER_ROOT` mapping rather than the current Codex project's relative paths.
- Proactive-reminder choice, recipient, delivery method, and covered deadline types. If not supplied, collect these once during Matter creation; they do not block safe intake work.

Proceed with partial information when the Matter can still be identified. Use `null`, empty lists, `UNKNOWN`, or `unverified`; never infer missing identities, dates, jurisdiction, forum, case number, claims, or deadline calculations.

## Workflow

1. Check whether an existing Matter covers the same engagement. If identity is uncertain or a Matter ID/path conflicts, stop creation and list the collision.
2. Resolve the live template at `FRAMEWORK_ROOT/08_Cases/_MATTER_TEMPLATE/`. By default create a unique framework-managed directory under `FRAMEWORK_ROOT/08_Cases/` using `YYYY-NNN_short-name`; when the lawyer specifies an external absolute destination, initialize that directory as `MATTER_ROOT` from the same live template. Never overwrite or merge an existing normalized Matter. If a proposed external directory already contains loose incoming files, inventory them before creating missing Matter structure; copy authorized originals into `MATTER_ROOT/00_Original/` without moving or changing the source files.
3. Populate `matter.yaml` and `LAWYER_INSTRUCTIONS.md` from the lawyer's words. Attribute client or party statements; do not turn them into confirmed facts.
4. Confirm the Matter-level proactive-reminder policy once. Record `authorized`, `disabled`, or `unconfirmed`, plus recipient, method, covered deadline types, confirmer, and confirmation time. Do not create proactive reminders under `unconfirmed` or `disabled`.
5. Inventory the source path before copying. Record unreadable, encrypted, duplicated, missing, suspicious, or version-conflicted files.
6. Copy authorized materials into `00_Original/`, preserving names and relative organization. Do not move, rename, rewrite, convert, or annotate originals. Record origin, copy time, and SHA-256 when practical.
7. Seed `01_Index/` with the file inventory and proposed Evidence IDs. Derived OCR or extraction belongs in `02_Extracted/` and must retain its parent reference.
8. Record every supplied date exactly as supplied with its source and `unverified` status until independently checked. Escalate a possibly imminent or expired deadline; never calculate silently. Hand calculation and ongoing control to `procedure-deadline-control`.
9. Update `DOCUMENT_PLAN.md` with `REQUIRED_NOW`, `RECOMMENDED`, `CONDITIONAL`, or `NOT_NEEDED`, separating lawyer-dependent decisions from unblocked work.
10. Produce the first-round intake report: known/unknown/conflicted facts, materials anomalies, deadlines, preliminary issue map, work already unblocked, and only decision-gate questions.

## Lawyer Decision Gates

- Matter identity or conflicts-check result; scope of engagement; use of external/cloud services.
- Jurisdiction, forum, procedural posture, deadline, preservation, filing, or claim choice when not established by reliable material.
- Any movement, deletion, external transmission, or disclosure of source materials.

## Outputs

- Matter root, whether framework-managed or external: populated `matter.yaml` including `reminder_policy`, `LAWYER_INSTRUCTIONS.md`, `DOCUMENT_PLAN.md`, and any `LAWYER_QUESTIONS.md` entries.
- `01_Index/`: source inventory, copy log, anomalies, duplicate/version relationships, and Evidence ID register.
- Status: `AI_DRAFT` or `REVIEW_REQUIRED` only.

## Quality Invariants

- Matter ID and directory are unique; no existing Matter was overwritten.
- `FRAMEWORK_ROOT` and `MATTER_ROOT` are explicit; shared framework paths and Matter-specific paths are not confused.
- Originals are byte-preserved and isolated; all derived files are outside `00_Original/`.
- Client, role, opponents, objective, stage, nearest deadline, and source path are recorded or explicitly missing.
- Dates have source and verification status; immediate risks are visible.
- Reminder authorization is Matter-specific and is never borrowed from another Matter or inferred from silence.
- Unknowns are not multiplied into unnecessary lawyer questions, and unblocked work continues.

## Failure Handling

- Missing minimum identity: prepare an intake-gap list without creating a possibly wrong Matter.
- Source inaccessible: create the Matter if otherwise safe, record the inaccessible path, and do not claim materials were imported.
- Collision or suspicious file: isolate the affected action and continue only with unaffected records.
- External destination inside another Git repository, synchronized folder, or location with unclear access/confidentiality policy: warn and record the risk; do not enable synchronization, upload, or silently relocate the Matter.

## Tests

Use `tests/cases.yaml`. Relevant Eval dimensions: Fact Accuracy, Evidence Traceability, Lawyer Question Quality, and Critical Error Count.
