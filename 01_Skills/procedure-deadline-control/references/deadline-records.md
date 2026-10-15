# Deadline records

## Procedure File record

- `procedure_file_id`
- Matter and source path
- issuing body, case number, title, document type
- document date, sent/published date, actual receipt date/time, receipt source
- attachments, signature/seal, platform, readable status
- related prior file IDs, `changes`, `supersedes` claim and verification status
- original deadline wording and pinpoint
- fact status and output status

## Deadline Card

Each card must contain:

- `deadline_id`, Matter, item, deadline type and risk class
- rule text, authority, effectiveness/status, source URL/path, retrieval date
- factual trigger, factual-trigger source, fact status
- legal trigger, trigger rule and explanation of any difference
- length, unit, count-start rule, holiday/adjusted-workday rule, final-day rule
- timezone, filing platform, platform cutoff and successful-upload requirement
- formula or deterministic-tool name/version, run time, input file or embedded input, output, and anomaly record
- official due date/time, protective date/time, internal due date/time
- named alternative scenarios and assumptions
- first verification and independent verification, discrepancy and resolution
- owner, reviewer, acceptance status
- reminder policy and reminder points
- completion status, completion proof and pinpoint
- version, source change, affected outputs and output status

## Allowed operational statuses

- `candidate`: a possible deadline not yet legally verified.
- `calculating`: rule or trigger still being verified.
- `active`: the operative control date is sufficiently verified for internal control.
- `review_required`: a lawyer-gate issue exists.
- `submission_attempted`: an act was attempted but completion proof is incomplete.
- `completed`: completion proof is linked.
- `cancelled`: a verified source cancels the obligation; preserve the history.
- `superseded`: a later verified event changes the operative record; preserve both versions.

These operational statuses do not replace the project output statuses `AI_DRAFT`, `REVIEW_REQUIRED`, `LAWYER_APPROVED`, and `FINAL`.
