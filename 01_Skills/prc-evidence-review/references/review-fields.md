# G3 Evidence Review Field Guide

Read this reference when creating or updating the G3 output files. The project Evidence schema remains controlling for required base fields.

## Evidence Register Extensions

```yaml
evidence_id: E-0001
file_name: ""
relative_path: ""
file_hash_sha256: null
evidence_type: ""
technical_carrier: ""
originality: original | original_object | copy | scan | screenshot | native_export | extracted | ocr | summary | unknown
provider: null
acquired_by: null
acquired_at: null
acquisition_method: null
formation_actor: null
formation_date: null
formation_system_or_device: null
custody_chain: []
derivative_of: null
duplicate_of: null
version_relation: null
summary: ""
supports: []
contradicts: []
authenticity_status: unreviewed
authenticity_indicators: []
authenticity_risks: []
legality_status: unreviewed | no_issue_identified | risk_identified | disputed | needs_research
legality_risks: []
completeness_status: complete | partial | context_missing | attachment_missing | unknown
proof_purposes: []
evidentiary_roles: []
direction: favorable | adverse | bidirectional | neutral | lead_only
provisional_weight: strong | moderate | weak | undetermined
weight_reasons: []
weight_change_triggers: []
source_location: []
review_status: ai_reviewed
reviewed_at: null
review_version: ""
```

Use controlled values as aids to consistency, not substitutes for analysis. If a legal category, burden, presumption, or exclusion question is material, record the verified authority and applicable date in the analysis output.

## Fact-Evidence Chain Record

```yaml
fact_id: F-0001
claim_or_element_ids: []
principal_evidence_ids: []
corroborative_evidence_ids: []
adverse_evidence_ids: []
conflicting_evidence_ids: []
investigative_lead_ids: []
remaining_gap: ""
burden_and_standard: ""
authority_status: verified | pending_verification | disputed
ai_chain_assessment: strong | moderate | weak | undetermined
alternative_assessments: []
lawyer_confirmation_required: true
```

Do not treat repeated copies, copied account summaries, or several derivative exports from the same source as independent corroboration.

## Strengthening Measure Record

For each proposed measure capture:

- target fact, element, and Evidence IDs;
- proposed action and lawful source/path;
- expected proof value and limitation;
- feasibility, responsible person, cost, deadline, and dependencies;
- confidentiality, evidence-exposure, procedural, and collateral risks;
- consequence of not acting;
- priority and AI recommendation;
- lawyer decision status.

## F12/F14 Lawyer Question Minimum

The question must include current evidence, AI's reasoned preliminary view, realistic options, affected outputs, urgency, reversible work that continues, and the exact choice requested. Do not ask “请律师判断证明力” or “是否需要补证” without the completed analysis.
