#!/usr/bin/env python3
"""Deterministic deadline arithmetic from lawyer-verified parameters.

This script never selects a legal rule or decides which trigger is operative.
It reads one JSON object from a file path argument or stdin and writes JSON.
"""

from __future__ import annotations

import argparse
import calendar
import json
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


SUPPORTED_UNITS = {"calendar_days", "business_days", "months", "years", "hours"}
SUPPORTED_ROLLS = {"none", "next_working_day", "previous_working_day"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", nargs="?", help="JSON input file; omit to read stdin")
    return parser.parse_args()


def load_payload(path: str | None) -> dict:
    raw = Path(path).read_text(encoding="utf-8") if path else sys.stdin.read()
    payload = json.loads(raw)
    if not isinstance(payload, dict):
        raise ValueError("input must be one JSON object")
    return payload


def parse_iso(value: str, unit: str, timezone_name: str) -> date | datetime:
    if unit == "hours":
        parsed = datetime.fromisoformat(value)
        zone = ZoneInfo(timezone_name)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=zone)
        else:
            parsed = parsed.astimezone(zone)
        return parsed
    return date.fromisoformat(value[:10])


def is_working_day(value: date, weekend_days: set[int], holidays: set[date], makeup: set[date]) -> bool:
    if value in makeup:
        return True
    return value.weekday() not in weekend_days and value not in holidays


def add_counted_days(start: date, amount: int, count_trigger: bool, working_only: bool,
                     weekend_days: set[int], holidays: set[date], makeup: set[date]) -> tuple[date, list[str]]:
    current = start
    remaining = amount
    steps: list[str] = []
    if count_trigger and (not working_only or is_working_day(current, weekend_days, holidays, makeup)):
        remaining -= 1
        steps.append(f"counted trigger date {current.isoformat()}")
    while remaining > 0:
        current += timedelta(days=1)
        if not working_only or is_working_day(current, weekend_days, holidays, makeup):
            remaining -= 1
            steps.append(f"counted {current.isoformat()}")
        else:
            steps.append(f"skipped non-working day {current.isoformat()}")
    return current, steps


def add_months(start: date, months: int) -> date:
    total = start.year * 12 + start.month - 1 + months
    year, month_index = divmod(total, 12)
    month = month_index + 1
    day = min(start.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def add_years(start: date, years: int) -> date:
    target_year = start.year + years
    day = min(start.day, calendar.monthrange(target_year, start.month)[1])
    return date(target_year, start.month, day)


def roll_date(value: date, method: str, weekend_days: set[int], holidays: set[date],
              makeup: set[date]) -> tuple[date, list[str]]:
    steps: list[str] = []
    if method == "none":
        return value, steps
    direction = 1 if method == "next_working_day" else -1
    current = value
    while not is_working_day(current, weekend_days, holidays, makeup):
        steps.append(f"rolled from non-working day {current.isoformat()}")
        current += timedelta(days=direction)
    return current, steps


def calculate(payload: dict) -> dict:
    unit = payload.get("unit")
    if unit not in SUPPORTED_UNITS:
        raise ValueError(f"unit must be one of {sorted(SUPPORTED_UNITS)}")
    amount = payload.get("length")
    if not isinstance(amount, int) or amount <= 0:
        raise ValueError("length must be a positive integer")
    trigger_at = payload.get("trigger_at")
    if not isinstance(trigger_at, str):
        raise ValueError("trigger_at must be an ISO date or datetime string")
    timezone_name = payload.get("timezone", "Asia/Shanghai")
    try:
        parsed = parse_iso(trigger_at, unit, timezone_name)
    except ZoneInfoNotFoundError as exc:
        raise ValueError(f"unknown timezone: {timezone_name}") from exc

    weekend_days = set(payload.get("weekend_days", [5, 6]))
    if not weekend_days.issubset(set(range(7))):
        raise ValueError("weekend_days must use Python weekday numbers 0..6")
    holidays = {date.fromisoformat(x) for x in payload.get("holidays", [])}
    makeup = {date.fromisoformat(x) for x in payload.get("makeup_workdays", [])}
    roll_method = payload.get("roll_if_non_working", "none")
    if roll_method not in SUPPORTED_ROLLS:
        raise ValueError(f"roll_if_non_working must be one of {sorted(SUPPORTED_ROLLS)}")

    count_trigger = bool(payload.get("count_trigger", False))
    steps: list[str] = []
    if unit == "hours":
        assert isinstance(parsed, datetime)
        if count_trigger:
            raise ValueError("count_trigger is not used for hour calculations")
        if roll_method != "none":
            raise ValueError("hour calculations do not support date rolling; encode the verified rule separately")
        base = parsed + timedelta(hours=amount)
        due: date | datetime = base
        steps.append(f"added {amount} elapsed hours in {timezone_name}")
    else:
        assert isinstance(parsed, date) and not isinstance(parsed, datetime)
        if unit == "calendar_days":
            base, steps = add_counted_days(parsed, amount, count_trigger, False, weekend_days, holidays, makeup)
        elif unit == "business_days":
            base, steps = add_counted_days(parsed, amount, count_trigger, True, weekend_days, holidays, makeup)
        elif unit == "months":
            if count_trigger:
                raise ValueError("count_trigger is not used for month calculations")
            base = add_months(parsed, amount)
            steps.append(f"added {amount} calendar months using end-of-month clamping")
        else:
            if count_trigger:
                raise ValueError("count_trigger is not used for year calculations")
            base = add_years(parsed, amount)
            steps.append(f"added {amount} calendar years using leap-day clamping")
        due, roll_steps = roll_date(base, roll_method, weekend_days, holidays, makeup)
        steps.extend(roll_steps)

    return {
        "deadline_id": payload.get("deadline_id"),
        "input": payload,
        "base_due_at": base.isoformat(),
        "computed_due_at": due.isoformat(),
        "calculation_steps": steps,
        "verification_status": "arithmetic_completed",
        "warning": "Arithmetic only. Verify the governing rule, trigger, official calendar, platform cutoff, and result independently before reliance.",
    }


def main() -> int:
    try:
        result = calculate(load_payload(parse_args().input))
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        json.dump({"error": str(exc)}, sys.stdout, ensure_ascii=False, indent=2)
        sys.stdout.write("\n")
        return 2
    json.dump(result, sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
