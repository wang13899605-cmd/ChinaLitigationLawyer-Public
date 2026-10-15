---
name: prc-jurisdiction-analysis
description: Analyze court jurisdiction for a PRC civil or commercial litigation Matter by identifying procedural route, claims and parties, jurisdictional facts and evidence, exclusive or specialized jurisdiction, court level, jurisdiction agreements, statutory territorial connections, competing courts, foreign-related issues, and objection risks. Use before filing, when responding to a complaint, or when jurisdiction changes or is disputed. Do not make the final forum choice or decide to raise, waive, or withdraw a jurisdiction objection without lawyer confirmation.
---

# PRC Jurisdiction Analysis

## Metadata

| Field | Value |
|---|---|
| version | `0.1.0` |
| status | `draft` |
| owner | `Albert Wang` |
| last_reviewed | `2026-09-13` |
| validated_matters | `[]` |
| sources | Lawyer-confirmed G19-A and G19-B standards dated 2026-09-13; lifecycle G-01 to G-04 and M09; current official PRC procedural sources listed in `references/current-authority-baseline.md` |

## Outcome

Produce an evidence-linked, current-law jurisdiction analysis that shows every plausible court and objection path, explains why each is supported or not, and gives the lawyer a reasoned primary, alternative, and rejected set of options without silently selecting jurisdictional facts or making the final procedural choice.

## Scope and Routing

- This skill analyzes PRC court jurisdiction. Route arbitration-agreement validity and arbitral institution issues to the later `arbitration-procedure-overlay`; preserve parallel court analysis when route is disputed.
- Route deadline calculation and monitoring, including the jurisdiction-objection period, to `procedure-deadline-control`.
- Use `prc-legal-research` to verify current nationwide rules, local high-court approvals, concentrated-jurisdiction notices, specialist-court rules, and target-court practice.
- Use the applicable substantive claim analysis to identify the real legal relationship and relief sought. A case title, client label, or draft cause of action is not conclusive.

## Modes

- **Pre-filing / claimant:** identify all legally supportable courts, compare filing and downstream risks, and recommend a primary and alternative forum.
- **Responding / defendant:** test the seised court's jurisdiction, predict preservation and merits consequences, and prepare the lawyer decision on whether to object, while G4 controls the deadline.
- **Changed or disputed jurisdiction:** analyze a new party, amended claim, transfer, first-filed case, jurisdiction ruling, parallel foreign proceeding, or new authoritative rule without erasing prior versions.

## Required Inputs

- Matter ID, our role, procedural stage, relief sought, material legal relationships, parties, and current or proposed court.
- All agreements and versions that may contain arbitration or jurisdiction clauses.
- Evidence for domicile/residence, principal office, registration, performance, signing, delivery, payment, property, tort, loss, specialist subject matter, amount in controversy, foreign elements, and earlier proceedings.
- Known filing, service, response, objection, transfer, preservation, or parallel-proceeding records.

Proceed with incomplete inputs. Use `UNKNOWN`, `CONFLICTED`, or `待核验`, identify the affected conclusions, and continue all unaffected research and comparison.

## Workflow

### 1. Build jurisdictional fact units

1. Determine the route candidates: civil litigation, arbitration, enforcement, bankruptcy-related, administrative, or civil-criminal overlap. Do not decide a disputed route from a clause heading alone.
2. Split materially different claims, counterclaims, defendants, parties, and legal relationships into separate jurisdiction-analysis units. Do not assume one court can hear every proposed claim merely because joinder is convenient.
3. Identify the legal relationship and current cause-of-action candidate from the requested relief and underlying conduct, using the currently effective cause-of-action rules.
4. Verify each party's legal identity and procedural role, including natural person, entity, branch, sole proprietor, partnership, deregistered entity, and foreign party.
5. Record natural-person domicile, habitual residence and actual residence separately; record an entity's principal office, registered address and actual operating place separately. Every asserted place requires a source and fact status.
6. Extract contract-performance, tort, property, corporate, negotiable-instrument, transport, insurance, internet, intellectual-property, maritime, inheritance, and other possible special connections without overstating what the evidence proves.
7. Extract every jurisdiction clause from the complete contract set, amendments, orders, platform terms, and assignment documents. Preserve text, version, parties, covered disputes, chosen place/court, form-term notice, and evidence of actual connection.
8. Identify specialist, exclusive, and concentrated-jurisdiction signals before ordinary territorial convenience; collect amount-in-controversy, cross-province, foreign-related, impact and complexity facts needed for court-level analysis.
9. Identify prior filings, arbitration, objections, transfers, jurisdiction rulings and parallel proceedings with reliable dates and sources.
10. Build the jurisdictional-facts and connection-evidence matrix described in [references/output-fields.md](references/output-fields.md). Preserve all competing versions.

### 2. Apply current rules in a fixed order

11. Verify the current authority baseline and task-specific rules before application. Read [references/current-authority-baseline.md](references/current-authority-baseline.md); treat it as a research starting point, never as proof that no later or local rule exists.
12. Apply this order unless a verified special rule requires otherwise: competent dispute system and route; specialist/exclusive/concentrated jurisdiction; court level; jurisdiction agreement; statutory territorial jurisdiction; competing courts and first-filed or transfer effects. Do not choose a preferred court first and reverse-engineer the basis.
13. Test a jurisdiction agreement for written form, parties, dispute scope, ascertainable place or court, actual connection when required, form-term controls, assignment and version issues, and conflict with court level, exclusive, specialist or concentrated jurisdiction.
14. Separately analyze multiple courts, multiple places, a region without a named court, a court outside listed statutory places, and an arbitration-or-litigation clause. Do not use a binary validity shortcut.
15. Where no effective clause controls, apply the verified general and special territorial rules to each analysis unit. Apply specialist and exclusive rules before ordinary territorial candidates.
16. Determine court level using the current nationwide and applicable local standards, amount in controversy, party-location pattern, foreign-related status, case type, impact, novelty and complexity. Never reuse an old threshold or a threshold for another case category.
17. Run a separate foreign-related branch for PRC international jurisdiction, domestic territorial and level jurisdiction, choice of foreign or PRC court, PRC exclusive jurisdiction, parallel proceedings, appropriate connection and forum non conveniens.

### 3. Compare, challenge, and route the decision

18. For each candidate court, state the rule, jurisdictional fact, evidence for and against, missing evidence, strongest counterargument, likely transfer/objection path, and downstream effect. Classify only as `SUPPORTED`, `CONDITIONAL`, `HIGH_RISK`, or `UNSUPPORTED`, with reasons; do not invent a probability.
19. Test multiple-claim and multiple-defendant structures for joinder, severance, inconsistent-clause, artificial-defendant, manufactured-connection, and partial-transfer risk. Never recommend adding a party or reshaping relief solely to fabricate jurisdiction.
20. Present the opponent's strongest jurisdiction objection and the best available response. Include waiver or deemed-acceptance risks only after verifying the applicable procedural rule and facts.
21. For legally supportable alternatives, compare filing feasibility, objection/transfer risk, preservation coordination, service, evidence and appearance burden, elapsed time, enforcement linkage, and current local filing requirements. Practical convenience cannot replace legal authority.
22. Verify target-court and local high-court notices, specialist divisions, concentrated jurisdiction and filing requirements. Record a phone or counter response as dated practice information, not binding authority.
23. Send every jurisdiction deadline or changed service event to G4. The existence of an objection deadline does not authorize filing an objection.
24. Update all fixed outputs, record source retrieval dates, and submit the final forum or objection choice to the lawyer only after giving a clear preliminary recommendation, alternatives, risks, and affected work.

## Lawyer Decision Gates

AI completes the factual, legal, adversarial, and comparative analysis first. The lawyer must confirm:

- the final court in which to file;
- reliance on a disputed or high-risk jurisdiction agreement or connection;
- use of a `HIGH_RISK` forum strategy;
- whether to raise, waive, withdraw, appeal, or otherwise dispose of a jurisdiction objection;
- whether to change claims, parties, counterclaims, or case structure in a way that affects jurisdiction;
- a foreign-court choice, parallel-proceeding strategy, forum-non-conveniens position, or other material foreign-related route.

Create a `LAWYER_QUESTION` with the competing courts, source matrix, preliminary recommendation, strongest adverse case, objection or filing deadline, protective next step, downstream effect, and exact decision requested. Continue all research, drafting branches and evidence organization that do not depend on the decision.

## Outputs

Create or update as needed:

- `06_Analysis/JURISDICTION_FACTS.yaml`: analysis units, party/location facts, connections, evidence and fact status.
- `06_Analysis/JURISDICTION_AUTHORITY_TABLE.md`: current authorities, scope, effect, retrieval date and source.
- `06_Analysis/JURISDICTION_AGREEMENT_CARD.md`: each clause, version, scope, validity factors and competing interpretation.
- `06_Analysis/JURISDICTION_CANDIDATE_MATRIX.md`: every candidate court, classification, evidence, adverse argument and operational comparison.
- `06_Analysis/JURISDICTION_MEMO.md`: issue, rule, application, primary/alternative/rejected courts, objection analysis, risk and recommendation.
- `LAWYER_QUESTIONS.md`: final forum, objection and other material procedural decisions only.

All AI outputs remain `AI_DRAFT` or `REVIEW_REQUIRED`. A recommendation does not authorize filing, objecting, communicating with a court, changing claims or adding parties.

## Quality Invariants

- Every proposed court resolves to a verified rule, specific connection, supporting source and analysis unit.
- Cause of action, requested relief, substantive legal relationship and jurisdictional characterization remain distinguishable.
- Specialist/exclusive/concentrated jurisdiction and court level are tested before convenience-driven selection.
- All clause versions and all materially plausible courts remain visible; adverse facts and arguments are not omitted.
- A local notice or court-counter response records date, source and authority type; no informal response is presented as law.
- A defendant-side analysis always checks the objection deadline through G4 and the consequences of merits response or counterclaim under current law.
- Final forum and objection decisions always remain lawyer-controlled.

## Failure and Uncertainty Handling

- If a clause or contract set is incomplete, preserve the visible text, mark scope and version uncertain, and request the missing instrument without treating the clause as operative.
- If residence, performance, signing or actual connection is disputed, produce named factual scenarios and show which courts survive each scenario.
- If a current local or specialist rule cannot be verified, mark it `待核验`, do not label the court `SUPPORTED`, and identify the fastest authoritative verification route.
- If the matter is outside ordinary PRC civil or commercial litigation, route to the applicable professional domain instead of stretching this skill.

## Tests

Use `tests/cases.yaml`. Relevant Eval dimensions: Current-Law Accuracy, Legal Authority Accuracy, Fact Accuracy, Evidence Traceability, Adverse Position Recognition, Jurisdiction Candidate Recall, Lawyer Question Quality, Update Integrity, and Critical Error Count. Synthetic tests do not make the skill `validated`.
