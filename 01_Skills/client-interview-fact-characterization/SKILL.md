---
name: client-interview-fact-characterization
description: Prepare and process client interviews for a PRC litigation Matter by reading existing materials first, preserving material original wording, splitting statements into traceable atomic facts, distinguishing statement types, identifying adverse facts and gaps, and proposing legal-characterization candidates. Use for intake follow-up, interview notes, oral accounts, or incomplete case instructions; do not use to make final claim, admission, settlement, or external-position decisions.
---

# Client Interview Fact Characterization

## Metadata

| Field | Value |
|---|---|
| version | `0.1.0` |
| status | `draft` |
| owner | `Albert Wang` |
| last_reviewed | `2026-09-12` |
| validated_matters | `[]` |
| sources | Lawyer-confirmed G2 standards dated 2026-09-12; lifecycle actions C01-C12; project fact and lawyer-question rules |

## Outcome

Turn incomplete instructions, client narratives, interview notes, recordings, or transcripts into a source-preserving interview package that exposes what is known, alleged, inferred, adverse, conflicted, and still missing. Produce legal-characterization candidates without converting labels or expectations into final legal conclusions.

## Required Inputs and Intake Behavior

- Use the current Matter, materials in scope, lawyer instructions, available client narrative, procedural stage, and stated urgency.
- Read available materials and the lawyer's intake note before asking questions. Build a known/unknown/conflicted table and do not ask for information already reliably available.
- If the intake note is missing or incomplete, ask one consolidated minimum-information set covering: client and actual principal; our procedural role; opposing parties; dispute outline; desired and minimum acceptable result; current stage; nearest stated deadline; source-material path; known court/forum, case number, and jurisdiction information; and urgent preservation, service, hearing, or negotiation events.
- Proceed with partial information. Use `UNKNOWN`, preserve the gap, and continue unaffected analysis. Ask a second round only when the answer could materially change a deadline, legal characterization, claim/defense, evidence plan, or immediate action.

## Workflow

1. **Set interview scope.** Record date, participants, medium, note-taker, materials reviewed, and whether recording or transcription was authorized. If authorization is absent, do not record or imply that a verbatim transcript exists.
2. **Prepare questions from the record.** Start with open chronology questions, then verification questions tied to gaps, conflicts, adverse indications, and missing source material. For each material question, know what decision or output the answer affects.
3. **Preserve material original wording.** Keep the client's own words for legally significant statements, disputed terms, admissions, labels, dates, amounts, and instructions. Store paraphrase and analysis separately; never replace the source wording with legal terminology.
4. **Split into atomic facts.** Assign stable `F-` IDs and separate actor, time, place, conduct, object, amount, result, and source. Do not combine several independently disputable propositions into one fact record.
5. **Classify statement nature.** Distinguish firsthand account, third-party report, speculation, evaluation, legal label, and desired outcome. Client statements begin as `PARTY_ALLEGATION`; upgrade only under the project fact-integrity rule, with source and change history.
6. **Test legal labels through conduct.** For labels such as loan, investment, nominee holding, cooperation, fraud, guarantee, dismissal, agency, or partnership, identify the actual acts, payment path, control, risk allocation, communications, performance, and competing explanations. Generate candidates and missing-element questions; do not select the final legal relationship.
7. **Deepen oral-agreement facts.** Identify formation time and place, participants, exact or approximate wording, context, authority, essential terms, later performance, objections, messages, payments, witnesses, and other corroboration. State clearly when recollection is approximate.
8. **Seek adverse facts deliberately.** Ask about our side's non-performance or delay, prior promises or concessions, payments/refunds/set-off/restructuring, contradictory accounts, opponent-held material, authority defects, internal responsibility, and facts affecting limitation, jurisdiction, party status, credibility, preservation, or urgency.
9. **Separate the client's objective.** Record desired commercial outcome, legally available relief candidate, minimum acceptable result, and prohibited concession or disclosure. Do not treat any of these as an approved claim, settlement authority, or external position.
10. **Create the interview package.** Produce the records described below, update existing Matter facts rather than creating duplicate versions, and route only genuine lawyer decisions to `LAWYER_QUESTIONS.md`.

## Lawyer Decision Gates

Escalate with issue, current sources, preliminary view, affected outputs, and unblocked work when the task requires:

- choosing between materially conflicting factual versions;
- acknowledging or using a significant adverse fact as an external admission;
- selecting the final legal relationship, claim, counterclaim, defense, or requested relief;
- changing a pleaded or planned claim/defense or adopting an external position;
- accepting or communicating a settlement floor, waiver, concession, or prohibited disclosure;
- sending an interview note or fact-confirmation document to the client;
- placing an unconfirmed client statement into a formal external filing.

Do not send ordinary factual follow-up questions to the lawyer-decision file merely because information is incomplete. Put them in the interview follow-up list unless they cross a decision gate.

## Outputs

When a Matter exists, update or create only what the task needs:

- `03_Facts/CLIENT_STATEMENT_RECORD.md`: interview metadata, material original wording, speaker/source, and confirmation history.
- `03_Facts/ATOMIC_FACTS.yaml`: `F-` records compliant with `00_System/Schemas/fact.schema.yaml`, plus statement nature and raw-source linkage.
- `06_Analysis/INTERVIEW_ANALYSIS.md`: legal-characterization candidates, competing explanations, adverse facts, goal-relief gap, and affected work.
- `01_Index/INTERVIEW_FOLLOW_UP.md`: unanswered questions, requested materials, likely source, urgency, and affected output.
- `LAWYER_QUESTIONS.md`: only questions crossing a lawyer decision gate, using the project schema.

Before a Matter exists, present the same structure in the current task without inventing a case path, then hand the confirmed intake fields to `matter-intake-workspace`. Outputs remain `AI_DRAFT` or `REVIEW_REQUIRED`; nothing is sent to the client automatically.

For the field structure and status rules, read [references/output-schema.md](references/output-schema.md) when creating or updating an interview package.

## Quality Invariants

- Every material paraphrase or atomic fact points to an original statement, file, recording timestamp, transcript line, or lawyer instruction.
- Original wording, factual paraphrase, legal characterization, and client objective remain distinguishable.
- No client legal label becomes a confirmed legal relationship merely by repetition, detail, or apparent credibility.
- The output includes material adverse facts, contradictions, alternative explanations, and missing corroboration.
- Questions already answered in reviewed material are not repeated; the first gap request is consolidated and later questions are material and targeted.
- Unknown dates, amounts, identities, authority, and deadlines remain explicit; urgency is surfaced without silent calculation.
- Client confirmation, lawyer confirmation, and evidence-based confirmation are recorded separately.

## Failure and Uncertainty Handling

- **Unreadable or unavailable source:** identify the inaccessible item and do not claim it was reviewed or transcribed; continue with other sources.
- **Conflicting accounts:** preserve each version with its speaker and source, mark the proposition `CONFLICTED`, explain impact, and escalate only if a lawyer choice is required now.
- **Approximate recollection:** retain qualifiers such as “大约”“可能”“记不清”, and do not replace them with precise dates, amounts, or wording.
- **Possible emergency:** surface the stated event and source immediately; route deadline calculation and procedural verification to the applicable deadline/procedure workflow.
- **New evidence after interview:** keep the original statement record, update fact status with a new source and timestamp, and propagate the effect through the Matter update workflow.

## Tests

Use `tests/cases.yaml`. Relevant Eval dimensions: Fact Accuracy, Evidence Traceability, Unsupported Inference Rate, Adverse Evidence Recognition, Lawyer Question Quality, and Critical Error Count.
