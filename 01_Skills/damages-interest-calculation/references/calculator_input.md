# Simple-interest calculator input contract

`scripts/calculate_interest.py` accepts one JSON object from a UTF-8 file path or standard input and emits JSON to standard output. No default legal rate, start date, day-count basis, payment order, currency conversion or rounding method is supplied. Use only after the Matter parameter card identifies the legal/contractual basis and source of each value. Keep real-client input and output only in the authorized Matter working area, not this Skill or a public repo.

## Required shape

```json
{
  "scenario_id": "SYNTHETIC-1",
  "currency": "CNY",
  "principal": "1000.00",
  "principal_source": "synthetic/source#row1",
  "start_date": "2025-01-01",
  "end_date_exclusive": "2025-02-01",
  "interval_rule": "start_inclusive_end_exclusive",
  "day_basis": "fixed_365",
  "interest_model": "simple",
  "rule_source": "synthetic/verified-rule",
  "rates": [
    {"effective_date": "2025-01-01", "annual_rate_fraction": "0.12", "source": "synthetic/rate#1"}
  ],
  "payments": [
    {"id": "P-1", "date": "2025-01-16", "sequence": 1, "amount": "500.00", "source": "synthetic/payment#1"}
  ],
  "payment_allocation": ["interest", "principal"],
  "rounding": {"places": 2, "mode": "ROUND_HALF_UP", "stage": "payment_and_final"}
}
```

- The interval includes `start_date` and excludes `end_date_exclusive`. A payment made on a date applies **before** that date's accrual. To calculate through a calendar date inclusively, set the exclusive end to the following date only after that convention is confirmed.
- `annual_rate_fraction` is a fraction, e.g. `0.12` for 12%; the script rejects a value greater than `1` to catch a likely percent/fraction mix-up. It does **not** test legal rate caps. The first rate must begin on `start_date`; subsequent rates apply from their listed date. No gaps or duplicate rate dates.
- `day_basis` is `fixed_360`, `fixed_365`, `fixed_366`, or `actual_actual` (year-specific 365/366 denominator). These are mathematical conventions, **not** legal defaults.
- `payment_allocation` must be exactly `interest, principal` or `principal, interest` as chosen from verified governing terms. Overpayment is rejected rather than silently recorded as credit. Payment `sequence` resolves multiple payments on the same date. For refunds, setoff, fees, multiple parties, multiple currencies, capitalization or a different legal waterfall, use another verified model.
- `rounding.stage` is `final` or `payment_and_final`. In the latter case the outstanding accrued interest is rounded immediately before each payment is allocated. Specify places `0` through `8` and one of `ROUND_HALF_UP` or `ROUND_HALF_EVEN`; this is a scenario parameter, not an assumed legal rule.
- Outputs retain 120-digit-precision, **unrounded decimal** period interest as text and rounded report totals; repeating divisions are not represented as mathematically exact fractions. The claimed total is closing principal plus **unpaid** interest; interest previously paid must not be added again. The program makes no claim that either component is legally recoverable.

The script rejects missing source strings, invalid dates, duplicate IDs, rates after the end, out-of-range payments, unknown fields, more than 35 significant amount digits and unsupported models. It reports any difference between the rounded total and the sum of rounded components as `total_vs_components_rounding_delta`; resolve that difference according to the verified rounding rule before using a figure in a pleading. It never writes to `00_Original/` or selects the applicable rate. An input hash supports version comparison but is not independent proof that the source documents were correct.
