---
name: damages-interest-calculation
description: Build source-traceable, reproducible monetary calculations for one PRC litigation, arbitration, or enforcement Matter. Use for principal, payments, interest, liquidated damages, loss, costs, or alternative amount scenarios. Verify legal parameters and reconcile source data before calculating; do not choose final claims, rate rules, or lawyer-approved amounts.
---

# Damages and Interest Calculation

## Metadata

| Field | Value |
|---|---|
| version | `0.1.1` |
| status | `draft` |
| owner | `Albert Wang` |
| last_reviewed | `2026-09-14` |
| validated_matters | `[]` |
| sources | Lawyer-confirmed G16-A01–A16 and G16-B01–B16; project calculation, legal-source, data-format, lawyer-gate and output-status rules |

## Boundary

G16 turns a G5-defined monetary claim or defense into an auditable calculation. It does not create the final relief structure, select a disputed legal rule, decide recoverability, deem a loss proved, or submit a number externally. S4 verifies applicable legal text and time; G3/source records establish evidence; G4 controls procedure deadlines; G13 owns enforcement planning; G14 orchestrates later updates; G8 owns versioned document drafting. A source value, rate or date is not confirmed merely because it fits a formula.

The bundled `scripts/calculate_interest.py` performs **only** explicitly parameterized simple-interest balance arithmetic with fixed or dated annual rate changes and partial payments. It does not determine PRC law, compute compound interest, infer LPR/FX, value damages, set a payment waterfall, or automatically implement execution-delay interest. Use a separately specified, tested deterministic method for unsupported models; do not force them through this script.

## Establish the amount basis — G16-A

1. Fix the Matter, role, stage and actual amount issue. Obtain from G5 each candidate's claimant, obligor, legal basis, responsibility boundary and relationship to main/alternative relief. Keep distinct principal, in-term interest, overdue interest, liquidated damages, proved/estimated loss, fees, paid amounts, setoff and execution-stage components. Not every Matter needs every component.
2. Inventory the actual contracts and amendments, account records, invoices, payment instruments, bank statements, judgments and other sources with full path, version/modified time, record ID and pinpoint. Preserve originals. Map source fields before creating a calculation: structured value, unit/currency, gross/net/tax, stated versus verified versus disputed status and target field. Prefer structured entries over narrative where they conflict, but flag the conflict.
3. Give each obligation, accrual event, payment, refund, setoff and adjustment a stable transaction ID and source. Match records on transaction ID and independently on party/account or another available key; note duplicate, missing and many-to-one rows and unresolved variance. A receipt, invoice or accounting entry is not automatically payment. Do not count duplicate copies twice; preserve meaningful zeroes.
4. For each component, record the contract clause, judgment or current official legal source with text/version, legal applicability date and retrieval date. Distinguish the site's page date from the normative effective date. S4 resolves law; this Skill records the verified parameter. Compare amendments and settlements without silently replacing an older version. Do not use LPR, contractual rate, statutory cap, a sale-contract method, or execution-delay interest as a universal default.
5. Determine separately the sourced dates for due, demand, breach, accrual start/end and each partial payment. Record explicit convention for interval inclusivity, year denominator, floating rate change, simple/compound model, base amount, payment allocation, currency/FX, rounding and treatment of taxes/fees. Where a material date, rate, ordering or legal standard is disputed, preserve named alternatives and send a source-based preliminary view to the lawyer. Continue independent work; no single authoritative total until the decisive parameter is settled.
6. For loss, expectation loss, penalty adjustment and fees, separate observed amount from projection and describe causation, proof, applicable limits, mitigation and possible overlap as issues for G5/S4/lawyer analysis. G16 may quantify a stated scenario but must not relabel it proved or recoverable.

## Calculate, reconcile and deliver — G16-B

7. Freeze one parameter card per named scenario in `06_Analysis/MONETARY_CALCULATIONS.md`: Input, Rule, Formula, Output, Assumptions, Source and Verification Status. Include calculator/tool version, run date and input file hash. Do not mix parameters from competing scenarios. For supported simple interest, read [calculator input contract](references/calculator_input.md), provide every required legal/accounting parameter, and run `scripts/calculate_interest.py` on a **working copy outside `00_Original/`**. An input-validation error blocks this stream; do not supply invented defaults to make the program run.
8. Calculate days and rate periods from explicit events; apply dated rate changes and payment allocation as specified. Record opening/closing balances per segment and per payment. For multiple obligations, parties, currencies or liability structures, run separately and aggregate only after G5 confirms non-overlap and responsibility. Execution-stage calculations require an effective instrument, performance term and separately verified special rule; route to G13 and use a distinct model/record, never silently add them to pre-judgment interest.
9. Show each scenario's line items, subtotals, payments, outstanding amount and delta from alternatives. Recompute totals from rows, not displayed totals. Compare by independent transaction and party/account keys where data permits. Investigate any negative balance, overpayment, unexplained zero, duplicate, mismatch or rate gap at the source/rule level; never edit a tool output to make it fit the requested figure.
   In the lawyer-facing answer and `MONETARY_CALCULATIONS.md`, lead with the best supported numeric result (or clearly named scenario result), then show a concise calculation table with each deduction, source and formula. Do not bury the amount behind a narrative of evidence gaps. A lawyer-confirmed balance may be reported as such while independently missing transaction receipts remain noted in the table or sidecar.
10. Independently verify each material result by a second described method, such as separately structured spreadsheet formulas or an independently written sample-period calculation, including boundary cases, rate transitions, payment dates and rounding. A re-run of the same script on unchanged input is reproducibility, **not** independent verification. State checker, date, method, agreement and unresolved difference.
11. Compare each candidate total against evidence records, G5 relief structure, `DOCUMENT_PLAN.md`, any pleading, fee basis and other document numbers. Distinguish an amount calculated *through a stated date* from a prospective formula through actual payment. Use G8 for any DOCX/XLSX output, the indexed mother when applicable, formula recalculation and rendered page/print QA; retain version, status and QC record. This Skill does not make a draft externally ready.
12. On new payment, evidence or lawyer decision, ask G14 to rerun only affected streams while preserving prior parameter card, run output, approved document and variance explanation. Material choices in amount, rate, dates, allocation, penalty/loss treatment, final claim or settlement range go into `LAWYER_QUESTIONS.md` with alternatives and the AI recommendation; the lawyer's answer is recorded in `LAWYER_DECISIONS.md`. Continue unblocked scenario work. AI status remains `AI_DRAFT` or `REVIEW_REQUIRED`.

## Delivery and stop conditions

Give the lawyer the source list; field/transaction mapping and unresolved differences; legal parameter/status; named scenario results and line detail; tool input/output and hash; totals recomputed; independent check; affected draft versions; questions; and whether DOCX/XLSX visual QA was done. Use `06_Analysis/MONETARY_CALCULATIONS.md` and `06_Analysis/MONETARY_TRANSACTIONS.md` as Matter records, not substitutes for originals.

Do not report a unique final amount when material parameters remain disputed, a source row is untraced, law is unverified, totals do not reconcile, independent verification fails, or a needed document render has not been checked. A professionally formatted table does not cure any of these defects.

If the lawyer gives no interest instruction, calculate a named one-year LPR scenario by default and disclose its rate date, accrual start, payment timing and assumptions. This is an analytical default, **not** a conclusion that LPR is legally recoverable in every case: verify the governing rule and identify any different statutory or contractual rate and any cause-dependent trigger before adopting it in a claim. Do not calculate or include attorney fees absent an express lawyer instruction or another current Matter decision.

The Skill remains `draft` after synthetic tests. Before `validated`, run an authorized desensitized historical or Gold Standard Matter through real source extraction, legal-parameter review, independently checked calculation, document integration and lawyer correction, then obtain lawyer confirmation.
