"""Synthetic arithmetic and rejection tests; no client data or legal-rule selection."""

from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import unittest
from copy import deepcopy
from datetime import date
from decimal import Decimal, ROUND_HALF_EVEN, ROUND_HALF_UP
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "calculate_interest.py"
SPEC = importlib.util.spec_from_file_location("calculate_interest", SCRIPT)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def base() -> dict:
    return {
        "scenario_id": "SYN-1", "currency": "CNY", "principal": "1000.00",
        "principal_source": "synthetic/ledger#1", "start_date": "2025-01-01",
        "end_date_exclusive": "2026-01-01", "interval_rule": "start_inclusive_end_exclusive",
        "day_basis": "fixed_365", "interest_model": "simple", "rule_source": "synthetic/rule#1",
        "rates": [{"effective_date": "2025-01-01", "annual_rate_fraction": "0.12", "source": "synthetic/rate#1"}],
        "payments": [], "payment_allocation": ["interest", "principal"],
        "rounding": {"places": 2, "mode": "ROUND_HALF_UP", "stage": "final"},
    }


class InterestCalculatorTests(unittest.TestCase):
    def test_one_year_simple(self) -> None:
        result = MODULE.calculate(base())
        self.assertEqual(result["report_amounts"]["closing_unpaid_interest"], "120.00")
        self.assertEqual(result["report_amounts"]["principal_plus_unpaid_interest"], "1120.00")
        self.assertEqual(result["segments"][0]["days"], 365)

    def test_actual_actual_leap_year(self) -> None:
        data = base()
        data["start_date"] = "2024-01-01"
        data["end_date_exclusive"] = "2025-01-01"
        data["day_basis"] = "actual_actual"
        data["rates"][0]["effective_date"] = "2024-01-01"
        result = MODULE.calculate(data)
        self.assertEqual(result["segments"][0]["day_denominator"], 366)
        self.assertEqual(result["report_amounts"]["closing_unpaid_interest"], "120.00")

    def test_actual_actual_crosses_new_year(self) -> None:
        data = base()
        data["start_date"] = "2023-12-31"
        data["end_date_exclusive"] = "2024-01-02"
        data["day_basis"] = "actual_actual"
        data["rates"][0]["effective_date"] = "2023-12-31"
        result = MODULE.calculate(data)
        self.assertEqual([row["day_denominator"] for row in result["segments"]], [365, 366])
        expected = Decimal("1000") * Decimal("0.12") / Decimal(365) + Decimal("1000") * Decimal("0.12") / Decimal(366)
        self.assertEqual(Decimal(result["totals_unrounded"]["interest_accrued"]).quantize(Decimal("0.01")), expected.quantize(Decimal("0.01")))

    def test_dated_rate_change_independent_formula(self) -> None:
        data = base()
        data["end_date_exclusive"] = "2025-01-31"
        data["rates"].append({"effective_date": "2025-01-16", "annual_rate_fraction": "0.06", "source": "synthetic/rate#2"})
        result = MODULE.calculate(data)
        independent = Decimal("1000") * (Decimal("0.12") * Decimal(15) + Decimal("0.06") * Decimal(15)) / Decimal(365)
        self.assertEqual(Decimal(result["totals_unrounded"]["interest_accrued"]).quantize(Decimal("0.01")), independent.quantize(Decimal("0.01")))
        self.assertEqual([row["days"] for row in result["segments"]], [15, 15])

    def test_payment_before_same_day_accrual_and_allocation(self) -> None:
        data = base()
        data["end_date_exclusive"] = "2025-02-01"
        data["payments"] = [{"id": "P-1", "date": "2025-01-16", "sequence": 1, "amount": "500.00", "source": "synthetic/bank#1"}]
        data["rounding"]["stage"] = "payment_and_final"
        result = MODULE.calculate(data)
        first_interest = (Decimal("1000") * Decimal("0.12") * Decimal(15) / Decimal(365)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        self.assertEqual(Decimal(result["payments"][0]["to_interest"]), first_interest)
        self.assertEqual(Decimal(result["payments"][0]["closing_principal"]), Decimal("500") + first_interest)
        self.assertEqual(result["segments"][1]["opening_principal_after_same_day_payments"], str(Decimal("500") + first_interest))
        self.assertEqual(Decimal(result["totals_unrounded"]["principal_paid"]) + Decimal(result["totals_unrounded"]["closing_principal"]), Decimal("1000"))

    def test_allocation_order_changes_result(self) -> None:
        data = base()
        data["end_date_exclusive"] = "2025-02-01"
        data["payments"] = [{"id": "P-1", "date": "2025-01-16", "sequence": 1, "amount": "500.00", "source": "synthetic/bank#1"}]
        interest_first = MODULE.calculate(data)
        data["payment_allocation"] = ["principal", "interest"]
        principal_first = MODULE.calculate(data)
        self.assertNotEqual(interest_first["report_amounts"], principal_first["report_amounts"])
        self.assertEqual(Decimal(principal_first["payments"][0]["to_interest"]), Decimal(0))

    def test_multiple_same_day_payments_use_sequence(self) -> None:
        data = base()
        data["end_date_exclusive"] = "2025-01-17"
        data["payments"] = [
            {"id": "P-2", "date": "2025-01-16", "sequence": 2, "amount": "100.00", "source": "synthetic/bank#2"},
            {"id": "P-1", "date": "2025-01-16", "sequence": 1, "amount": "100.00", "source": "synthetic/bank#1"},
        ]
        result = MODULE.calculate(data)
        self.assertEqual([row["id"] for row in result["payments"]], ["P-1", "P-2"])

    def test_final_rounding_modes(self) -> None:
        data = base()
        data["principal"] = "1.00"
        data["start_date"] = "2025-01-01"
        data["end_date_exclusive"] = "2025-01-02"
        data["rates"][0]["annual_rate_fraction"] = "0.5"
        data["day_basis"] = "fixed_360"
        data["rounding"]["places"] = 3
        half_up = MODULE.calculate(data)
        data["rounding"]["mode"] = "ROUND_HALF_EVEN"
        half_even = MODULE.calculate(data)
        unrounded = Decimal(half_up["totals_unrounded"]["interest_accrued"])
        self.assertEqual(Decimal(half_up["report_amounts"]["closing_unpaid_interest"]), unrounded.quantize(Decimal("0.001"), rounding=ROUND_HALF_UP))
        self.assertEqual(Decimal(half_even["report_amounts"]["closing_unpaid_interest"]), unrounded.quantize(Decimal("0.001"), rounding=ROUND_HALF_EVEN))

    def test_rejects_unverified_or_unsupported_parameters(self) -> None:
        changes = [
            ("missing_rule", lambda d: d.pop("rule_source")),
            ("compound", lambda d: d.update(interest_model="compound")),
            ("rate_percent_mixup", lambda d: d["rates"][0].update(annual_rate_fraction="12")),
            ("missing_start_rate", lambda d: d["rates"][0].update(effective_date="2025-01-02")),
            ("wrong_interval", lambda d: d.update(interval_rule="both_inclusive")),
            ("float_principal", lambda d: d.update(principal=1000.0)),
            ("missing_allocation", lambda d: d.pop("payment_allocation")),
            ("unknown_compounding_flag", lambda d: d.update(compounding=True)),
        ]
        for name, change in changes:
            with self.subTest(name=name):
                data = base()
                change(data)
                with self.assertRaises(ValueError):
                    MODULE.calculate(data)

    def test_rejects_duplicate_or_out_of_period_payment(self) -> None:
        data = base()
        payment = {"id": "P-1", "date": "2025-01-10", "sequence": 1, "amount": "100.00", "source": "synthetic/bank#1"}
        data["payments"] = [payment, {**payment, "sequence": 2}]
        with self.assertRaisesRegex(ValueError, "duplicate payment"):
            MODULE.calculate(data)
        data["payments"] = [{**payment, "date": "2026-01-01"}]
        with self.assertRaisesRegex(ValueError, "outside"):
            MODULE.calculate(data)

    def test_rejects_overpayment(self) -> None:
        data = base()
        data["payments"] = [{"id": "P-1", "date": "2025-01-01", "sequence": 1, "amount": "1000.01", "source": "synthetic/bank#1"}]
        with self.assertRaisesRegex(ValueError, "exceeds"):
            MODULE.calculate(data)

    def test_cli_outputs_valid_json_without_writing(self) -> None:
        result = subprocess.run([sys.executable, str(SCRIPT)], input=json.dumps(base()), text=True, capture_output=True, check=False)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout)["report_amounts"]["principal_plus_unpaid_interest"], "1120.00")


if __name__ == "__main__":
    unittest.main()
