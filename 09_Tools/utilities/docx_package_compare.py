#!/usr/bin/env python3
"""Compare the package parts of two DOCX files by SHA-256."""

from __future__ import annotations

import argparse
import hashlib
import json
import zipfile
from pathlib import Path


def package_hashes(path: Path) -> dict[str, str]:
    with zipfile.ZipFile(path) as archive:
        return {
            name: hashlib.sha256(archive.read(name)).hexdigest().upper()
            for name in archive.namelist()
        }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("baseline", type=Path)
    parser.add_argument("candidate", type=Path)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    baseline = package_hashes(args.baseline)
    candidate = package_hashes(args.candidate)
    common = set(baseline) & set(candidate)
    result = {
        "baseline": str(args.baseline.resolve()),
        "candidate": str(args.candidate.resolve()),
        "added": sorted(set(candidate) - set(baseline)),
        "removed": sorted(set(baseline) - set(candidate)),
        "changed": sorted(name for name in common if baseline[name] != candidate[name]),
        "unchanged": sorted(name for name in common if baseline[name] == candidate[name]),
    }
    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print("added:", ", ".join(result["added"]) or "-")
        print("removed:", ", ".join(result["removed"]) or "-")
        print("changed:", ", ".join(result["changed"]) or "-")


if __name__ == "__main__":
    main()
