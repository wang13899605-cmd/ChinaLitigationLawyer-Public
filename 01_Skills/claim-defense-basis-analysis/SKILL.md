---
name: claim-defense-basis-analysis
description: Identify, screen, compare, and rank PRC civil or commercial claims, defenses, counterclaims, procedural contentions, and precise relief structures from Matter facts and verified law. Use after fact/evidence organization and before litigation drafting, including when facts or evidence change; do not use it to make the lawyer's final pleading, admission, waiver, party, or strategy decision.
---

# Claim Defense Basis Analysis

## Metadata

| Field | Value |
|---|---|
| version | `0.1.0` |
| status | `draft` |
| owner | `Albert Wang` |
| last_reviewed | `2026-09-13` |
| validated_matters | `[]` |
| sources | Lawyer-confirmed G5-A/G5-B standards; PRC Civil Code, Civil Procedure Law, SPC civil-evidence rules, Contract Part General Provisions interpretation, and current cause-of-action rules |

## Outcome

Turn the Matter's facts, objectives, procedural posture, and evidence status into a traceable set of legally distinct litigation options: a recommended primary route, viable alternative or conditional routes, defensive and counterclaim routes, rejected candidates with reasons, and the precise lawyer decisions still required.

## Required Inputs

- Current Matter role, procedural stage, client objectives, pleaded positions, target result, and known deadlines.
- Fact records with project fact-status labels and stable Fact IDs.
- Evidence register and available `prc-evidence-review` conclusions with Evidence IDs and pinpoints.
- Existing legal research, jurisdiction, deadline, and calculation records; missing current authority may be routed to the appropriate Skill.

If a material input is absent, identify the gap, state any narrow provisional assumption, continue every unaffected branch, and ask only questions that cross a lawyer decision gate.

## Operating Modes

1. **Claimant mode**: design claims and relief while predicting all serious defenses and counterclaims.
2. **Defendant mode**: separate factual denials, legal denials, right-defeating/extinguishing defenses, defense rights, setoff or limitation defenses, procedural defenses, and independent counterclaims.
3. **Incremental mode**: when facts, evidence, pleadings, procedure, or law change, preserve stable IDs, identify affected outputs, and rerun only affected candidates and downstream documents.

## Workflow

### 1. Establish the analysis frame

Record party role, procedural stage, client goal, minimum acceptable result, prohibited outcomes, opponent, existing pleadings, and the exact judicial or arbitral effect sought. Translate commercial descriptions such as “recover the money” or “bear no liability” into candidate legal effects—payment, confirmation, formation/change/termination, return, restoration, cessation, damages, or another verified form—without treating them as final relief.

### 2. Reconstruct relationships from conduct

Use acts, declarations, funds, delivery, performance, loss, and party relationships rather than client legal labels. Build a relationship map showing subjects, asserted rights and duties, fact sources, and confidence status. For contract disputes, separately review negotiation, formation, effectiveness, performance, modification, assignment, rescission, termination, settlement, and breach. Keep cause of action, claim/defense basis, relief, and factual grounds as four linked but distinct fields.

### 3. Generate complete candidate pools

Generate, when supported by the Matter:

- our claims, including theories the client did not name;
- the opponent's claims and strongest coherent theory;
- factual and legal denials, right-defeating or extinguishing defenses, defense rights, exemption/reduction, mitigation, setoff, limitation, subject/standing, procedural and abuse-of-right defenses;
- independent counterclaims and procedural contentions such as joinder, additional parties, third-party participation, declaratory relief, or jurisdiction objections.

For each candidate, identify legal relationship, proponent, opponent, target effect, possible liable parties, prerequisites, time applicability, and the complete element structure: right-generation, impediment, extinction, exercise limits, exceptions, presumptions, exemptions, and consequence.

### 4. Verify law and hand off specialized issues

Do not state a candidate as current law without a verified, temporally applicable source. Use `prc-legal-research` for unsettled or missing authority and record retrieval date and source status. Route:

- every retained candidate to `claim-element-evidence-matrix` for element–fact–evidence–burden testing;
- evidence-characterization disputes to `prc-evidence-review`;
- limitation, exclusion-period, objection, counterclaim, appeal, and other deadlines to `procedure-deadline-control`;
- forum, jurisdiction-clause, level, exclusive, specialist, concentrated, and foreign-jurisdiction issues to `prc-jurisdiction-analysis`;
- principal, interest, liquidated damages, loss, setoff, and scenario arithmetic to `damages-interest-calculation` when available, with `legal-data-format-audit` as a verification control.

G5 decides legal categories and relationships, not the numeric result, calendar deadline, exact forum, or evidentiary sufficiency.

### 5. Screen candidates before ranking

Test each candidate against current authority, temporal applicability, required elements, available and adverse facts, evidence status and burden, legal effect, prerequisites, procedure, and enforceability. Assign one status and explain it:

- `PRIMARY`: AI-recommended primary route, still subject to lawyer confirmation.
- `ALTERNATIVE`: viable fallback that cannot or should not operate cumulatively with the primary route.
- `CONDITIONAL`: viable only under a named unresolved fact, law, procedure, or evidence scenario.
- `DEFENSIVE_ONLY`: useful to defeat or reduce the opponent's position but not an independent affirmative claim.
- `REJECTED`: screened out, with the decisive reason and what change could justify reopening it.

Never use an unsupported probability of success. Rank retained candidates by legal fit, temporal fit, element completeness, evidence/burden position, relief adequacy, procedural cost, preservation and enforcement value, contradiction/admission risk, and fallback resilience.

### 6. Test compatibility and factual consistency

For every pair of retained theories, label whether they are cumulative, primary/alternative, alternative only, conditional by named scenario, contradictory, or moot after another theory succeeds. Do not assume claim concurrence permits double recovery. Mutually exclusive factual versions stay in separate conditional branches and may not both be marked `CONFIRMED_FACT`. Identify language that could create a judicial admission, waive a defense, or undermine another theory; AI may not make a material adverse admission.

### 7. Design primary, alternative, and defensive plans

For each plan, state: fact premise, verified basis, target relief, elements, evidence/burden position, prerequisites, opponent's best answer, fatal or near-fatal element, lawful cure or mitigation, fallback route, jurisdiction/deadline/calculation dependencies, preservation value, and enforceability. A rejected route is not hidden; include the rejection reason.

### 8. Draft precise relief candidates

Each relief candidate must specify claimant/applicant, obligor, act or payment, object, amount or reproducible formula, period, currency, responsibility form, sequence/conditions, interest or ancillary categories, and costs where applicable. Map every relief to at least one verified basis and every retained basis to a legally available effect. Vague language such as “bear liability according to law” is insufficient by itself. Do not combine inconsistent recovery or calculate amounts inside this Skill.

### 9. Produce outputs and submit lawyer gates

Update the files listed in `references/output-fields.md`. Lead with the AI recommendation and its strongest adverse path, then submit only material decisions. Continue unaffected work while a decision is pending. Outputs remain `AI_DRAFT` or `REVIEW_REQUIRED`.

## Lawyer Decision Gates

The lawyer decides:

- final claims, order, amount structure, defenses, counterclaims, procedural contentions, and external case theory;
- primary, alternative, conditional, cumulative, or mutually exclusive pleading structure;
- any admission, non-dispute position, concession, abandonment, waiver, setoff, limitation position, or defense-right exercise;
- party addition/removal, responsible-subject selection, and any structure affecting jurisdiction or procedure;
- reliance on a disputed legal basis, fatal-element tolerance, or high-risk enforcement/preservation tradeoff.

Before asking, give a reasoned AI recommendation, alternatives, supporting and adverse facts/evidence, legal source status, consequences of each option, affected outputs, and a default treatment if the decision can safely wait. Never file, serve, send, concede, waive, or amend pleadings.

## Quality Invariants

- No client label substitutes for conduct-based legal characterization.
- No retained candidate lacks a current-law source status, target effect, element tree, evidence handoff, and opposition path.
- No rejected candidate lacks a reason; no conditional candidate lacks a named condition.
- No primary or alternative plan conceals a fatal element, adverse evidence, inconsistent fact, double-recovery issue, or enforcement weakness.
- No amount, deadline, jurisdiction, evidence sufficiency, admission, waiver, or final strategy is silently decided outside its assigned control.
- Cause of action is not treated as the claim basis, relief, or filing condition; use the current official cause-of-action rules only for their proper classification function.

## References

- `references/current-authority-baseline.md`: minimum official-source baseline and refresh rules.
- `references/output-fields.md`: fixed Matter artifacts and required fields.
- `tests/cases.yaml`: synthetic behavior specifications.

## Tests

Run the official Skill validator and parse every YAML file. Check every scenario and forbidden behavior in `tests/cases.yaml`. Before promotion beyond `draft`, run the Skill on at least one lawyer-approved historical Matter or Gold Standard and record omissions, false positives, lawyer-question quality, and downstream drafting changes.
