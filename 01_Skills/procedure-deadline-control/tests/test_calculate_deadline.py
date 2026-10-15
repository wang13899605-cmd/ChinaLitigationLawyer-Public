import importlib.util
import unittest
from pathlib import Path


SCRIPT = Path(__file__).parents[1] / "scripts" / "calculate_deadline.py"
SPEC = importlib.util.spec_from_file_location("calculate_deadline", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
SPEC.loader.exec_module(MODULE)


class DeadlineCalculationTests(unittest.TestCase):
    def test_calendar_days_excludes_trigger_and_rolls_from_weekend(self):
        result = MODULE.calculate({
            "deadline_id": "D-001",
            "trigger_at": "2026-09-04",
            "unit": "calendar_days",
            "length": 1,
            "count_trigger": False,
            "roll_if_non_working": "next_working_day",
        })
        self.assertEqual(result["base_due_at"], "2026-09-05")
        self.assertEqual(result["computed_due_at"], "2026-09-07")

    def test_business_days_respects_holiday_and_makeup_workday(self):
        result = MODULE.calculate({
            "trigger_at": "2026-09-25",
            "unit": "business_days",
            "length": 3,
            "holidays": ["2026-09-28"],
            "makeup_workdays": ["2026-09-27"],
        })
        self.assertEqual(result["computed_due_at"], "2026-09-30")

    def test_month_end_clamping_is_explicit(self):
        result = MODULE.calculate({
            "trigger_at": "2025-01-31",
            "unit": "months",
            "length": 1,
        })
        self.assertEqual(result["computed_due_at"], "2025-02-28")

    def test_leap_year_clamping_is_explicit(self):
        result = MODULE.calculate({
            "trigger_at": "2024-02-29",
            "unit": "years",
            "length": 1,
        })
        self.assertEqual(result["computed_due_at"], "2025-02-28")

    def test_hours_preserve_timezone(self):
        result = MODULE.calculate({
            "trigger_at": "2026-09-13T10:30:00+08:00",
            "timezone": "Asia/Shanghai",
            "unit": "hours",
            "length": 36,
        })
        self.assertEqual(result["computed_due_at"], "2026-09-14T22:30:00+08:00")

    def test_rejects_zero_length(self):
        with self.assertRaises(ValueError):
            MODULE.calculate({"trigger_at": "2026-09-13", "unit": "calendar_days", "length": 0})


if __name__ == "__main__":
    unittest.main()
