# Draft records and review handoff

`08_Cases/<Matter>/08_Drafts/DRAFT_REGISTER.md` is the Matter's draft index. Keep one row per document version. Suggested fields: `DOC-ID`, document type, role/stage/use, source decision IDs, template ID or no-template reason, version, created/updated time, DOCX path, sidecar path, QC report path, visual-QA status, output status, open lawyer-question IDs, superseded-by link. `DOCUMENT_PLAN.md` remains the master list of which documents are needed; the register records what actually exists.

For each draft, create a same-stem `.review.md` sidecar containing:

1. Matter and document identity, intended recipient/use, procedural stage and deadline source.
2. Inputs: lawyer decisions, G5 plan/relief IDs, Fact/Evidence IDs, authority retrieval dates, G4/G19/G16 result references, template ID/version and any applicable form requirement.
3. Conditional premises and unresolved fields, with precise location in the DOCX and reason they cannot be filled.
4. QC report path; critical/major/minor defect count; page count and per-page render/visual-QA outcome. An unperformed visual check is explicit.
5. Material changes from the previous version, their reason/source, and which analysis or cross-document checks were rerun.
6. Lawyer review list: recommendation, strongest adverse path, exact decision, alternatives, affected outputs and whether the draft may be used externally (default: no).

Use stable `DOC-` IDs from `DOCUMENT_PLAN.md`, plus `v01`, `v02`, etc. Never overwrite an old version. File names and sidecars are records, not approval evidence. `LAWYER_QUESTIONS.md` and `LAWYER_DECISIONS.md` remain the authoritative decision trail; link to them instead of duplicating a decision narrative.
