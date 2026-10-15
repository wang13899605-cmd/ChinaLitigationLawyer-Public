---
name: china-litigation-workflow
description: Explicitly invoke the latest local ChinaLitigationLawyer workflow for one PRC litigation, arbitration, enforcement, or related Matter located either inside the framework's 08_Cases directory or at another absolute local path. Use only when the user names this skill or expressly asks to call the ChinaLitigationLawyer workflow; do not auto-apply it to unrelated legal work.
---

# China Litigation Workflow

## Fixed source of truth

Set `FRAMEWORK_ROOT` to `__FRAMEWORK_ROOT__`. The installer replaces this placeholder with the absolute path of the local clone. If it remains unresolved, ask the user to run the installer or supply the framework path; do not guess a path.

This global skill is an entry point, not a copy of the framework. On every invocation, read the live files under `FRAMEWORK_ROOT`; never cache, fork, or duplicate the framework's rules, project Skills, templates, tools, knowledge, or version. This guarantees that a later invocation uses the latest saved local version.

Set `MATTER_ROOT` to the absolute Matter directory supplied by the user. It may be:

- `FRAMEWORK_ROOT\08_Cases\<Matter>`; or
- any other absolute local directory expressly identified by the user.

Never treat another case folder, the current Codex project, or the framework root as `MATTER_ROOT` merely because it is nearby.

## Invocation boundary

Run only when explicitly invoked. The normal form is:

`调用 $china-litigation-workflow，处理案件文件夹：<绝对路径>。本次任务是：<任务>。`

If the user invokes the workflow but omits `MATTER_ROOT`, ask only for the Matter path unless the user clearly asks to create a new Matter under the framework's default `08_Cases` directory. If a requested mutation or import lacks a material authorization required by active instructions, obtain that authorization; otherwise continue with reasonable assumptions and identify them.

## Startup contract

Before substantive Matter work:

1. Resolve and verify `FRAMEWORK_ROOT` and `MATTER_ROOT`. Confirm the required framework files exist and the Matter path is readable; test write access only when the requested task requires writes. Do not create, move, merge, or overwrite a Matter during this check.
2. Read `FRAMEWORK_ROOT\AGENTS.md` completely. Then read only the system rules and workflow files relevant to the task. Treat them as the governing workflow contract subject to platform instructions, the user's current instruction, and any active instructions of the current Codex project.
3. Check for a material conflict between the current project's active instructions and the framework contract. Do not silently reconcile a conflict that affects facts, confidentiality, evidence handling, legal sources, calculations, deadlines, document format, approval, or external action. Report the conflict and continue only with unaffected work.
4. Read the current Matter's `matter.yaml`, `LAWYER_INSTRUCTIONS.md`, `LAWYER_DECISIONS.md`, unresolved `LAWYER_QUESTIONS.md`, and the registers relevant to the requested task. If the directory is not yet a normalized Matter, route first to the live `matter-intake-workspace` Skill.
5. Enumerate the live directories under `FRAMEWORK_ROOT\01_Skills`. Use the frontmatter descriptions to select every genuinely applicable project Skill. Read each selected `SKILL.md` completely and follow its linked references only as required. Do not load all Skills mechanically and do not use `_Candidate_Library` or `_SKILL_TEMPLATE` as active Skills.
6. Resolve templates through the live `FRAMEWORK_ROOT\05_Templates\TEMPLATE_INDEX.yaml` and tools through `FRAMEWORK_ROOT\09_Tools`. Use absolute paths when operating outside the framework repository.

The framework `AGENTS.md`, project Skills, template index, and tools must be reread on each new invocation or resumed task where their version may have changed. Never state that a version is current merely because it was seen in an earlier conversation.

## New Matter modes

### Framework-managed Matter

Use `FRAMEWORK_ROOT\08_Cases` as the default destination when the user does not request another storage location. Create the new Matter from the live `_MATTER_TEMPLATE` through `matter-intake-workspace`, assign a unique Matter identifier, and preserve the framework's Git-ignore and isolation rules.

### Externally stored Matter

When the user specifies another absolute directory, treat that directory as `MATTER_ROOT` while keeping all shared rules, Skills, templates, and tools at `FRAMEWORK_ROOT`. Initialize or normalize the Matter from the same live `_MATTER_TEMPLATE` without changing the source of truth.

- Never overwrite or merge an existing normalized Matter.
- Never move, rename, rewrite, or delete source materials.
- If the target contains loose incoming files, inventory them first. With the user's existing processing authorization, copy byte-preserved materials into `MATTER_ROOT\00_Original` and record the original absolute path; leave the source files in place.
- If copying would create ambiguity, collision, excessive duplication, or violate an active instruction, stop only that operation, record the issue, and continue unaffected intake work.
- Warn when the external Matter appears to be inside another Git repository, cloud-synced folder, or location whose confidentiality, backup, or access policy has not been established. Do not upload or enable synchronization.

Interpret project-relative paths in a selected Skill as follows unless that Skill expressly requires another meaning:

- shared path such as `00_System`, `01_Skills`, `05_Templates`, `09_Tools`, `docs`, `03_Private_Knowledge`, `04_Experience`, or `06_Gold_Standard` resolves under `FRAMEWORK_ROOT`;
- Matter path such as `08_Cases/<Matter>` or a Matter register/output resolves under `MATTER_ROOT`;
- no current-project directory becomes a shared or Matter path without explicit mapping.

## Execution and outputs

Apply the live framework's fact states, evidence traceability, law-source verification, calculation records, lawyer decision gates, output statuses, template fidelity, confidentiality, Matter isolation, versioning, and change-control rules without reducing them for an external Matter.

Write Matter-specific work only under `MATTER_ROOT` unless the user expressly requests an authorized framework-level change. Do not write customer facts or materials into the global skill, framework Skills, reusable knowledge, templates, evaluations, or logs.

For a new or materially updated Matter, maintain the required Matter records rather than relying on chat history. This enables another Codex task to resume by rereading the folder. Report selected Skills, outputs created or updated, unresolved lawyer decisions, deadlines, and any routing or access problem that could reduce functionality.

The workflow may prepare and review drafts, but it does not itself authorize filing, sending, signing, stamping, disclosure, deletion, or designation as `LAWYER_APPROVED` or `FINAL`.

## Continuity and current-version check

At the start of each invocation, record in the working report or process log, when one exists:

- the resolved `FRAMEWORK_ROOT` and `MATTER_ROOT`;
- the framework Git commit if available, plus whether the working tree contains uncommitted changes;
- the selected project Skills and their declared versions/statuses;
- the template IDs used;
- any active instruction conflict or unavailable dependency.

An uncommitted but saved local framework file is still the latest local version. Do not require a Git commit before using it. Do not modify the framework merely to make the working tree clean.
