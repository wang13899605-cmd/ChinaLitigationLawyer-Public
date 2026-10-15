---
name: prc-legal-research
description: Plan, perform, document, and synthesize current-law research for PRC litigation, arbitration, enforcement, or related disputes, with authority hierarchy, temporal validity, contrary-authority search, and citation verification. Use when a legal proposition or citation must be supported; not for unverified memory-based answers.
---

# Prc Legal Research

## Metadata

| Field | Value |
|---|---|
| version | `0.2.0` |
| status | `draft` |
| owner | `Albert Wang` |
| last_reviewed | `2026-09-21` |
| validated_matters | `[]` |
| sources | AgentCounsel `research-plan`, `legal-research-memo`, `source-validation`, `citation-integrity-check`, `authority-synthesis`; project legal-authority and research rules; three lawyer-supplied legal-research reports and one lawyer-supplied legal-authority compilation reviewed 2026-09-21 |

## Outcome

Produce a reproducible research record and an issue-answering legal research report in which each material rule, case proposition and application step can be checked against an authoritative source, valid version, applicable time, and the facts to which it is applied. Keep a legal-research report distinct from a source-only legal-provisions compilation.

## Required Inputs

- Precise research questions, our role, intended use, and decision deadline.
- PRC jurisdiction, relevant locality/forum, and facts/dates that affect applicable law.
- Lawyer-approved source boundary. Until LR-06 is confirmed, use official primary sources for key conclusions and treat other sources as navigation only.

## Workflow

1. Convert the request into discrete propositions and subissues; identify outcome-determinative facts and alternative factual branches.
2. Build a search plan covering statutes, administrative regulations, judicial interpretations, procedural/arbitration rules, official cases/documents, contrary authority, local guidance, and amendment history as applicable.
3. Search secondary material only to discover terminology, disputes, and sources. Return key propositions to official text whenever available.
4. For every source create a `SRC-` record: full name, issuing body, publication/effective dates, validity status, applicable time, authority/reliability level, official URL or local path, pinpoint, and checked date.
5. Verify each quoted legal article character-for-character against the official applicable-version full text, including every paragraph, item, subitem and punctuation. Do not excerpt, ellipsize, paraphrase, splice or write an interpretation as if it were original text. Verify case court, case number, date, level, cause of action, procedural posture, disposition, and relevance; do not imply binding force from mere similarity.
6. Search for exceptions, transition provisions, contrary authorities, different local approaches, and facts that would change the answer.
7. Determine the requested document type before drafting:
   - **法律检索报告** answers concrete questions. Use the applicable `TPL-RES-` mother and include: concise case facts; discrete research questions; complete verified legal provisions with source/version/status metadata; supporting, limiting and contrary cases; analysis that connects rules and cases to the stated facts; risks, alternatives and preliminary conclusions; and a case overview table. Keep quotations and analysis visibly separate. The four-column case table is the default; use the six-column version when judgment dates and outcomes are material comparison fields.
   - **法律规定整理/法律法规汇编** is a source-only reference. Use `TPL-LAW-003`, group provisions by claim, issue or requested relief, optionally state the objective mapping note, and reproduce complete verified articles. Do not add case summaries, application analysis, strategy or conclusions.
8. An additional internal analysis memo is optional when the audience, privilege sensitivity, volume or lawyer instruction warrants a separate document; it is not a mandatory substitute for the analysis section of a legal research report.
9. Run a citation ledger before any citation enters an outward-facing draft. Mark unresolved material `待核验` and prevent it from supporting a formal conclusion.

## Lawyer Decision Gates

- Selecting among materially conflicting legal interpretations or local approaches.
- Reliance on nonofficial, paywalled, unavailable, or otherwise lawyer-unapproved sources for a key conclusion.
- Final legal opinion, litigation position, case-selection strategy, or statement that a rule definitively controls.

## Output

- `05_Law/research_plan.md`, `05_Law/source_registry.yaml`, `05_Law/citation_ledger.md`, and `05_Law/legal_research_report.md` as applicable. When a finished Word work product is requested, create the DOCX from `TPL-RES-001` or `TPL-RES-002`; use `TPL-LAW-003` only for a separate legal-provisions compilation.
- Legal research report sections: case facts; research questions; complete verified article originals and metadata; cases; analysis; risks/alternatives/preliminary conclusions; case overview table; unresolved verification gaps; research cutoff. The analysis may be in the same report but must never alter or interleave with an original-law quotation.
- Legal provisions compilation sections: issue/claim/request mapping; statute name and article; complete verified original text and metadata; unresolved verification gaps and cutoff. No case or application analysis.
- Optional `05_Law/internal_analysis_memo.md` only when separately useful or instructed.
- Status: `AI_DRAFT` or `REVIEW_REQUIRED`.

## Quality Invariants

- Every material legal proposition has a source and pinpoint or is `待核验`.
- Current validity and temporal applicability are checked and dated.
- Search includes contrary and limiting authority.
- Quotation, holding, procedural posture, and cited proposition match.
- No secondary article or model memory is the sole support for a key conclusion.
- No article in the three lawyer-specified document types is shortened or replaced with interpretation; full-text verification failure remains visible instead of being filled from memory.
- A legal research report is not reduced to a statute dump, and a legal-provisions compilation is not expanded into a research report.

## Failure Handling

- Official source unavailable: retain the discovery source, describe attempts, mark unverified, and do not overstate.
- Conflicting authority: preserve both and identify hierarchy, time, locality, facts, and lawyer decision required.
- No result: report search path and limits; absence of a result is not proof of absence.

## Tests

Use `tests/cases.yaml`. Relevant Eval dimensions: Legal Authority Accuracy, Current-Law Accuracy, Unsupported Inference Rate, Adverse Evidence Recognition, and Critical Error Count.
