# Interview Package Field Guide

Read this reference when creating or updating the G2 interview package. It supplements, and does not replace, the project Fact and Lawyer Question schemas.

## 1. Client Statement Record

For each interview or supplied oral-account record, capture:

- `session_id`, date/time as supplied, participants, medium, note-taker, materials reviewed, and recording/transcription authorization;
- `statement_id`, speaker, material original wording, source location or timestamp, and whether wording is verbatim, approximate, or paraphrased;
- confirmation status: unconfirmed, client-confirmed, lawyer-confirmed for internal use, or superseded, with date and scope;
- related `F-` IDs and any confidentiality or audience restriction.

Do not label an AI-generated transcript as verbatim unless it has been checked against the recording. A client-confirmed statement remains a party statement unless the project fact rule supports a different fact status.

## 2. Atomic Fact Extension

Use the required fields in `00_System/Schemas/fact.schema.yaml`. The schema permits these G2 extensions:

```yaml
fact_id: F-0001
statement: ""
status: PARTY_ALLEGATION
date: null
actors: []
evidence_ids: []
source_location: []
materiality: high
notes: null
statement_nature: firsthand | third_party_report | speculation | evaluation | legal_label | desired_outcome
raw_statement_ids: []
place: null
conduct: null
object: null
amount: null
result: null
confidence_qualifier: exact | approximate | uncertain | disputed
confirmation_history: []
```

One record should express one independently confirmable or disputable proposition. Preserve different speakers' incompatible accounts as separate source statements and connect them to a `CONFLICTED` fact record where useful.

## 3. Legal-Characterization Candidate

Each candidate should state:

- `candidate_id` and candidate legal relationship or issue;
- the client's original label, if any;
- supporting `F-` IDs and contrary `F-` IDs;
- conduct or transaction features supporting the candidate;
- missing facts and missing materials;
- competing characterization and practical consequence;
- current status: preliminary, needs research, needs evidence, or lawyer decision required.

Do not write “the relationship is X” unless the lawyer has decided it or the statement is clearly identified as an approved external position.

## 4. Follow-up Item

Each factual question or material request should identify:

- question/request;
- why it matters;
- expected respondent or likely source;
- related `F-` or candidate IDs;
- affected document, deadline, analysis, or decision;
- urgency and whether work can continue without it.

Consolidate initial questions. Do not route an ordinary fact gap into `LAWYER_QUESTIONS.md` unless it requires the lawyer's professional or strategic decision.

## 5. Goal–Relief Separation

Maintain four distinct fields:

1. desired commercial outcome;
2. legally available relief candidate;
3. minimum acceptable result;
4. prohibited concession or disclosure.

Only the first is a client objective by default. None of the four becomes an approved pleading, settlement authority, waiver, or external instruction without the required confirmation.
