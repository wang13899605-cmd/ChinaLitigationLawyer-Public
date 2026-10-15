# Output Fields

All files sit under `06_Analysis/` and carry status, version, updated date, and reviewer fields. Use stable `REL-`, `CD-`, `PL-`, `ISSUE-`, `RELIEF-`, `F-`, and `E-` IDs. Do not duplicate the canonical evidence register or element-evidence matrix.

## `LEGAL_RELATIONSHIP_MAP.yaml`

For each `REL-` record: subjects, conduct/funds/performance, candidate characterization, rights/duties, relationship stage, Fact IDs, competing characterization, source status, confidence rationale, and affected candidates.

## `CLAIM_DEFENSE_CANDIDATES.yaml`

For each `CD-` record: proponent, opponent, class, relationship, legal effect, basis/source status, temporal fit, element-tree reference, prerequisites, responsible party, remedy candidates, burden/evidence-matrix reference, strongest opposition, fatal element, cure/fallback, G4/G16/G19 dependencies, status (`PRIMARY`, `ALTERNATIVE`, `CONDITIONAL`, `DEFENSIVE_ONLY`, `REJECTED`), status reason, reopening condition, and lawyer gate.

The `class` field distinguishes at minimum: claim, factual denial, legal denial, right-impeding defense, right-extinguishing defense, defense right, setoff, limitation, procedural defense, counterclaim, or other verified category.

## `THEORY_COMPATIBILITY_MATRIX.md`

Pairwise candidate table with relationship (`cumulative`, `primary_alternative`, `alternative_only`, `conditional`, `contradictory`, `moot_if_other_succeeds`), named condition, common or inconsistent fact premise, admission/double-recovery risk, pleading treatment candidate, and lawyer decision.

## `RELIEF_BASIS_MAPPING.md`

For each `RELIEF-`: applicant/claimant, obligor, requested act or payment, object, amount/formula reference, period, currency, responsibility form, sequence/condition, interest/ancillary category, costs, supporting `CD-` basis, available legal effect, double-recovery/setoff relation, enforcement note, and status.

## `CLAIM_DEFENSE_OPTIONS.md`

Start with the AI-recommended primary plan, then alternative, conditional, defensive and rejected routes. For each plan record fact premise, basis, relief, elements, evidence/burden, opponent response, fatal element, cure, fallback, deadlines, jurisdiction, amount, preservation/enforcement effects, rank by stated dimensions, and decisions required. Never state an unsupported success probability.

## `LEGAL_ISSUE_TREE.md`

Hierarchical issues labeled decisive, material, or background; link every issue to candidates, facts, evidence, authority, unresolved question, downstream document, and update trigger.

## Downstream references

- `claim_element_evidence_matrix.yaml` remains owned by `claim-element-evidence-matrix`.
- Amount workbooks/calculations remain owned by G16 and audit controls.
- `DEADLINE_REGISTER.yaml` remains owned by G4.
- jurisdiction artifacts remain owned by G19.
- Material lawyer choices go to `LAWYER_QUESTIONS.md`; answers go to `LAWYER_DECISIONS.md`.
