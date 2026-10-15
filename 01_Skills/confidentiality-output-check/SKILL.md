---
name: confidentiality-output-check
description: Review a Matter artifact or proposed distribution for confidentiality, personal-information minimization, cross-Matter leakage, external-service exposure, privilege/work-product sensitivity, and redaction needs. Use before sharing, exporting, using a third party, or creating reusable knowledge; not to decide privilege law or authorize disclosure.
---

# Confidentiality Output Check

## Metadata

| Field | Value |
|---|---|
| version | `0.1.0` |
| status | `draft` |
| owner | `Albert Wang` |
| last_reviewed | `2026-09-09` |
| validated_matters | `[]` |
| sources | AgentCounsel `privilege-confidentiality-check`; project confidentiality/matter-isolation and output-status rules |

## Outcome

Produce a recipient-specific disclosure and redaction plan that minimizes unnecessary exposure while preserving the artifact's legal function. This check flags privilege/work-product questions but does not decide them.

## Required Inputs

- Target artifact or data set; current Matter ID.
- Intended recipient, purpose, channel/system, distribution scope, and whether the use is internal, client-facing, court/tribunal-facing, opponent-facing, vendor-facing, or public.
- Matter confidentiality instructions, protective order/NDA, and lawyer-approved service boundary if available.

If recipient, purpose, or channel is unknown, the artifact is not cleared for external use.

## Workflow

1. Verify Matter identity and scan for facts, names, strategies, metadata, comments, tracked changes, hidden text, attachments, links, or file properties belonging to another Matter.
2. Inventory personal information, sensitive personal information, account/identity/contact data, trade secrets, nonpublic business facts, settlement positions, legal strategy, attorney communications, and third-party confidential material.
3. For each item, ask whether it is necessary for this recipient and purpose. Prefer deletion, neutral labels, ranges, summaries, pseudonyms, masking, or a separate internal annex where functionality permits.
4. Flag—without deciding—attorney-client communication, legal advice, work-product/mental-impression, waiver, common-interest, protective-order, NDA, and confidentiality-law questions.
5. Review transmission and processing path. Until lawyer rules are confirmed, use local/minimum-necessary handling and do not upload Matter content to external services, public repositories, or unapproved tools.
6. Inspect file-level leakage: comments/revisions, document properties, embedded objects, hidden sheets/rows/columns, formulas, speaker metadata, OCR layers, thumbnails, and recoverable prior text.
7. Create an internal risk report and, if authorized and technically safe, a separate redacted derivative. Never alter `00_Original/` or overwrite the internal source.
8. Verify the redacted derivative visually and by text/metadata inspection; record method, residual risks, intended-use limit, and version.

## Lawyer Decision Gates

- Whether disclosure is authorized; whether privilege/work-product/confidentiality protection applies or may be waived.
- Use of a third-party/cloud service; release of strategy, settlement position, trade secret, or sensitive personal information.
- Whether a redaction is legally sufficient for filing, production, client, opponent, regulator, or public use.

## Output

- Risk table: location/item, category, recipient necessity, risk, proposed treatment, decision owner, status.
- Redaction/distribution plan and, only when authorized, a separate derivative file with a QA record.
- Result: `NOT_CLEARED`, `REVIEW_REQUIRED`, or `CLEARED_FOR_SPECIFIED_INTERNAL_PROCESSING`; never authorization to transmit.

## Quality Invariants

- Review is tied to a named recipient, purpose, channel, and version.
- The report itself does not unnecessarily repeat sensitive data.
- Cross-Matter leakage and document metadata are checked.
- Redaction is verified beyond visual black boxes.
- Reusable Skills, examples, Public Knowledge, and public Git contain no real client or Matter data.

## Tests

Use `tests/cases.yaml`. Relevant Eval dimensions: Fact Accuracy and Critical Error Count, with zero tolerance for cross-Matter contamination or unauthorized disclosure.
