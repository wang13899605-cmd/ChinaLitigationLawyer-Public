#!/usr/bin/env python3
"""Pure simple-interest arithmetic from explicit, source-labelled parameters.

No PRC legal rule, rate, day basis, allocation order or rounding convention is
selected here. JSON input is read from a file or stdin; JSON output goes to stdout.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import defaultdict
from datetime import date
from decimal import Decimal, InvalidOperation, ROUND_HALF_EVEN, ROUND_HALF_UP, localcontext
from pathlib import Path


VERSION = "0.1.0"
ROUNDING_MODES = {"ROUND_HALF_UP": ROUND_HALF_UP, "ROUND_HALF_EVEN": ROUND_HALF_EVEN}
DAY_BASES = {"fixed_360": 360, "fixed_365": 365, "fixed_366": 366}


def need_text(obj: dict, key: str) -> str:
    value = obj.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{key} must be a nonempty string")
    return value.strip()


def money_number(value: object, name: str, *, maximum: Decimal | None = None) -> Decimal:
    if not isinstance(value, str) or not re.fullmatch(r"\d+(?:\.\d+)?", value):
        raise ValueError(f"{name} must be a nonnegative decimal string")
    if len(value.replace(".", "")) > 35:
        raise ValueError(f"{name} exceeds the supported 35-digit precision")
    try:
        number = Decimal(value)
    except InvalidOperation as exc:
        raise ValueError(f"{name} is not decimal") from exc
    if not number.is_finite() or (maximum is not None and number > maximum):
        raise ValueError(f"{name} is outside supported range")
    return number


def iso_date(obj: dict, key: str) -> date:
    raw = need_text(obj, key)
    try:
        return date.fromisoformat(raw)
    except ValueError as exc:
        raise ValueError(f"{key} must be YYYY-MM-DD") from exc


def denominator(day: date, basis: str) -> int:
    if basis != "actual_actual":
        return DAY_BASES[basis]
    year = day.year
    return 366 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 365


def calculate(payload: dict) -> dict:
    if not isinstance(payload, dict):
        raise ValueError("input must be one JSON object")
    allowed_fields = {
        "scenario_id", "currency", "principal", "principal_source", "start_date", "end_date_exclusive",
        "interval_rule", "day_basis", "interest_model", "rule_source", "rates", "payments",
        "payment_allocation", "rounding",
    }
    if unknown := set(payload) - allowed_fields:
        raise ValueError(f"unsupported input fields: {sorted(unknown)}")
    scenario_id = need_text(payload, "scenario_id")
    currency = need_text(payload, "currency")
    if not re.fullmatch(r"[A-Z]{3}", currency):
        raise ValueError("currency must be a three-letter uppercase code; no FX is performed")
    principal = money_number(payload.get("principal"), "principal")
    principal_source = need_text(payload, "principal_source")
    start = iso_date(payload, "start_date")
    end = iso_date(payload, "end_date_exclusive")
    if end <= start:
        raise ValueError("end_date_exclusive must be after start_date")
    if payload.get("interval_rule") != "start_inclusive_end_exclusive":
        raise ValueError("interval_rule must explicitly be start_inclusive_end_exclusive")
    basis = payload.get("day_basis")
    if basis not in DAY_BASES and basis != "actual_actual":
        raise ValueError("day_basis must be fixed_360, fixed_365, fixed_366 or actual_actual")
    if payload.get("interest_model") != "simple":
        raise ValueError("only explicitly selected simple interest is supported")
    rule_source = need_text(payload, "rule_source")
    allocation = payload.get("payment_allocation")
    if allocation not in (["interest", "principal"], ["principal", "interest"]):
        raise ValueError("payment_allocation must explicitly order interest and principal")
    rounding = payload.get("rounding")
    if not isinstance(rounding, dict):
        raise ValueError("rounding object is required")
    if unknown := set(rounding) - {"places", "mode", "stage"}:
        raise ValueError(f"unsupported rounding fields: {sorted(unknown)}")
    places = rounding.get("places")
    if type(places) is not int or not 0 <= places <= 8:
        raise ValueError("rounding.places must be an integer from 0 through 8")
    mode_name = rounding.get("mode")
    if mode_name not in ROUNDING_MODES:
        raise ValueError("rounding.mode must be ROUND_HALF_UP or ROUND_HALF_EVEN")
    stage = rounding.get("stage")
    if stage not in {"final", "payment_and_final"}:
        raise ValueError("rounding.stage must be final or payment_and_final")
    quantum = Decimal(1).scaleb(-places)

    raw_rates = payload.get("rates")
    if not isinstance(raw_rates, list) or not raw_rates:
        raise ValueError("rates must be a nonempty list")
    rates: dict[date, tuple[Decimal, str]] = {}
    for index, entry in enumerate(raw_rates):
        if not isinstance(entry, dict):
            raise ValueError(f"rates[{index}] must be an object")
        if unknown := set(entry) - {"effective_date", "annual_rate_fraction", "source"}:
            raise ValueError(f"unsupported rates[{index}] fields: {sorted(unknown)}")
        when = iso_date(entry, "effective_date")
        if not start <= when < end or when in rates:
            raise ValueError("rate effective dates must be unique and within calculation interval")
        rate = money_number(entry.get("annual_rate_fraction"), "annual_rate_fraction", maximum=Decimal(1))
        rates[when] = (rate, need_text(entry, "source"))
    if start not in rates:
        raise ValueError("the first rate must be effective on start_date")

    raw_payments = payload.get("payments")
    if not isinstance(raw_payments, list):
        raise ValueError("payments must be an explicit list, even when empty")
    payments: dict[date, list[dict]] = defaultdict(list)
    seen_ids: set[str] = set()
    seen_sequences: set[int] = set()
    total_paid_input = Decimal(0)
    for index, entry in enumerate(raw_payments):
        if not isinstance(entry, dict):
            raise ValueError(f"payments[{index}] must be an object")
        if unknown := set(entry) - {"id", "date", "sequence", "amount", "source"}:
            raise ValueError(f"unsupported payments[{index}] fields: {sorted(unknown)}")
        pay_id = need_text(entry, "id")
        if pay_id in seen_ids:
            raise ValueError(f"duplicate payment id: {pay_id}")
        seen_ids.add(pay_id)
        when = iso_date(entry, "date")
        if not start <= when < end:
            raise ValueError(f"payment {pay_id} date is outside calculation interval")
        sequence = entry.get("sequence")
        if type(sequence) is not int or sequence < 1 or sequence in seen_sequences:
            raise ValueError("payment sequence must be a unique positive integer")
        seen_sequences.add(sequence)
        amount = money_number(entry.get("amount"), f"payment {pay_id} amount")
        if amount <= 0:
            raise ValueError("payment amount must be positive")
        source = need_text(entry, "source")
        payments[when].append({"id": pay_id, "sequence": sequence, "amount": amount, "source": source})
        total_paid_input += amount

    boundaries = set(rates) | set(payments) | {start, end}
    if basis == "actual_actual":
        boundaries.update(date(year, 1, 1) for year in range(start.year + 1, end.year + 1) if date(year, 1, 1) < end)
    ordered = sorted(boundaries)
    outstanding_principal = principal
    unpaid_interest = Decimal(0)
    interest_accrued = Decimal(0)
    interest_paid = Decimal(0)
    principal_paid = Decimal(0)
    current_rate = Decimal(0)
    current_rate_source = ""
    segments: list[dict] = []
    payment_trace: list[dict] = []

    with localcontext() as ctx:
        ctx.prec = 120
        for position, current in enumerate(ordered[:-1]):
            if current in rates:
                current_rate, current_rate_source = rates[current]
            for payment in sorted(payments[current], key=lambda item: item["sequence"]):
                if stage == "payment_and_final":
                    unpaid_interest = unpaid_interest.quantize(quantum, rounding=ROUNDING_MODES[mode_name])
                remaining = payment["amount"]
                allocations: dict[str, Decimal] = {"interest": Decimal(0), "principal": Decimal(0)}
                for component in allocation:
                    available = unpaid_interest if component == "interest" else outstanding_principal
                    applied = min(remaining, available)
                    allocations[component] += applied
                    remaining -= applied
                    if component == "interest":
                        unpaid_interest -= applied
                        interest_paid += applied
                    else:
                        outstanding_principal -= applied
                        principal_paid += applied
                if remaining:
                    raise ValueError(f"payment {payment['id']} exceeds outstanding principal plus interest")
                payment_trace.append({
                    "id": payment["id"], "date": current.isoformat(), "sequence": payment["sequence"],
                    "amount": str(payment["amount"]), "source": payment["source"],
                    "to_interest": str(allocations["interest"]), "to_principal": str(allocations["principal"]),
                    "closing_principal": str(outstanding_principal), "closing_unpaid_interest": str(unpaid_interest),
                })
            next_date = ordered[position + 1]
            days = (next_date - current).days
            accrued = outstanding_principal * current_rate * Decimal(days) / Decimal(denominator(current, basis))
            interest_accrued += accrued
            unpaid_interest += accrued
            segments.append({
                "start_inclusive": current.isoformat(), "end_exclusive": next_date.isoformat(),
                "days": days, "day_denominator": denominator(current, basis),
                "annual_rate_fraction": str(current_rate), "rate_source": current_rate_source,
                "opening_principal_after_same_day_payments": str(outstanding_principal),
                "interest_unrounded_decimal": str(accrued),
            })

        rounding_adjustment = unpaid_interest - (interest_accrued - interest_paid)
        rounded_principal = outstanding_principal.quantize(quantum, rounding=ROUNDING_MODES[mode_name])
        rounded_unpaid_interest = unpaid_interest.quantize(quantum, rounding=ROUNDING_MODES[mode_name])
        rounded_total = (outstanding_principal + unpaid_interest).quantize(quantum, rounding=ROUNDING_MODES[mode_name])
        rounded_component_sum = rounded_principal + rounded_unpaid_interest
        if principal - principal_paid != outstanding_principal or total_paid_input != principal_paid + interest_paid:
            raise ArithmeticError("internal principal/payment reconciliation failed")

    canonical_input = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return {
        "calculator": "simple_interest", "version": VERSION, "scenario_id": scenario_id,
        "input_sha256": hashlib.sha256(canonical_input).hexdigest(), "currency": currency,
        "principal_source": principal_source, "rule_source": rule_source,
        "period": {"start_inclusive": start.isoformat(), "end_exclusive": end.isoformat(), "day_basis": basis},
        "interest_model": "simple", "payment_allocation": allocation, "rounding": rounding,
        "segments": segments, "payments": payment_trace,
        "totals_unrounded": {
            "opening_principal": str(principal), "interest_accrued": str(interest_accrued),
            "interest_paid": str(interest_paid), "principal_paid": str(principal_paid),
            "closing_principal": str(outstanding_principal), "closing_unpaid_interest": str(unpaid_interest),
            "rounding_adjustment": str(rounding_adjustment),
        },
        "report_amounts": {
            "closing_principal": str(rounded_principal), "closing_unpaid_interest": str(rounded_unpaid_interest),
            "principal_plus_unpaid_interest": str(rounded_total),
            "sum_rounded_components": str(rounded_component_sum),
            "total_vs_components_rounding_delta": str(rounded_total - rounded_component_sum),
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", nargs="?", help="UTF-8 JSON file; omit to read stdin")
    args = parser.parse_args()
    try:
        raw = Path(args.input).read_text(encoding="utf-8") if args.input else sys.stdin.read()
        result = calculate(json.loads(raw))
    except (ValueError, OSError, json.JSONDecodeError, ArithmeticError) as exc:
        print(f"calculation blocked: {exc}", file=sys.stderr)
        return 2
    json.dump(result, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
