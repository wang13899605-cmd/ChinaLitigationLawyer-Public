# Jurisdiction output fields

## JURISDICTION_FACTS.yaml

For each analysis unit record:

- `unit_id`, requested relief, legal-relationship candidate and cause-of-action candidate;
- parties and procedural roles;
- contract, tort, property, corporate, specialist and foreign-related attributes;
- amount in controversy and its source;
- each location fact, fact status, source and pinpoint;
- each jurisdictional connection, supporting/adverse evidence and missing proof;
- jurisdiction-clause IDs and earlier-proceeding IDs;
- assumptions, conflicts and affected outputs.

Never merge domicile, habitual residence, actual residence, principal office, registered address, actual operation, agreed performance place, actual performance place, signing place, delivery place and loss place merely because two values happen to match.

## JURISDICTION_AUTHORITY_TABLE.md

For every relied-on rule record the complete title, issuing authority, provision or proposition, promulgation and effective date, status, applicable time, official URL or local source, retrieval date, hierarchy, matter fit, and any later/conflicting rule.

## JURISDICTION_AGREEMENT_CARD.md

Create one card for each clause/version:

- complete text and pinpoint;
- instrument, version, execution status and parties;
- disputes covered and excluded;
- chosen region/court and whether ascertainable at filing;
- written-form and form-term controls;
- actual-connection rule and evidence;
- assignment, amendment, incorporation and conflicting-clause issues;
- interaction with arbitration, court level, exclusive, specialist and concentrated jurisdiction;
- claimant interpretation, opponent interpretation and provisional classification;
- missing material and lawyer dependency.

## JURISDICTION_CANDIDATE_MATRIX.md

One row per court and analysis unit:

- exact court and level;
- route: agreement, general territorial, special territorial, exclusive, specialist, concentrated, designated, transfer, foreign-related or other;
- rule and current-law status;
- connection fact and evidence;
- adverse fact and strongest objection;
- agreement effect, court-level fit and specialist/exclusive checks;
- first-filed, transfer, parallel-proceeding and deadline effect;
- filing, preservation, service, evidence, hearing and enforcement considerations;
- classification: `SUPPORTED`, `CONDITIONAL`, `HIGH_RISK`, or `UNSUPPORTED`;
- assumptions and exact fact or rule that would change the result.

## JURISDICTION_MEMO.md

Use this order:

1. Question presented and procedural posture.
2. Short preliminary recommendation.
3. Material facts and unresolved conflicts.
4. Current authorities and rule hierarchy.
5. Separate application for each analysis unit and candidate court.
6. Jurisdiction-agreement analysis.
7. Specialist/exclusive/concentrated and court-level analysis.
8. Foreign-related branch when applicable.
9. Strongest opposing objection and response.
10. Primary, alternative, high-risk and rejected options.
11. Operational comparison that does not replace legal authority.
12. Deadline handoff to G4, protective action and blocked outputs.
13. Lawyer decision requested.

All outputs carry version, date, author/reviewer field and project output status.
