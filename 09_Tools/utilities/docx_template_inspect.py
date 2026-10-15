#!/usr/bin/env python3
"""Inspect DOCX packages for template import without modifying the source."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import zipfile
from collections import Counter
from pathlib import Path

from lxml import etree


W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main"
NS = {"w": W_NS, "a": A_NS}

SENSITIVE_PATTERNS = {
    "email": re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"),
    "mobile": re.compile(r"(?<!\d)1[3-9]\d{9}(?!\d)"),
    "id_number": re.compile(r"(?<![0-9A-Za-z])\d{17}[0-9Xx](?![0-9A-Za-z])"),
    "credit_code": re.compile(r"(?<![0-9A-Za-z])[0-9A-HJ-NPQRTUWXY]{18}(?![0-9A-Za-z])"),
    "bank_account": re.compile(r"(?<!\d)\d{16,19}(?!\d)"),
    "case_number": re.compile(r"[（(]\d{4}[）)]\s*[^\s，。；：:]{1,12}\s*\d+\s*号"),
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest().upper()


def read_xml(zf: zipfile.ZipFile, name: str) -> etree._Element | None:
    try:
        return etree.fromstring(zf.read(name))
    except (KeyError, etree.XMLSyntaxError):
        return None


def text_from(root: etree._Element | None) -> str:
    if root is None:
        return ""
    blocks: list[str] = []
    for paragraph in root.xpath(".//w:p", namespaces=NS):
        text = "".join(paragraph.xpath(".//w:t/text()", namespaces=NS))
        if text.strip():
            blocks.append(text)
    return "\n".join(blocks)


def paragraph_inventory(root: etree._Element | None) -> list[dict[str, object]]:
    if root is None:
        return []
    result: list[dict[str, object]] = []
    for index, paragraph in enumerate(root.xpath(".//w:p", namespaces=NS)):
        result.append(
            {
                "index": index,
                "text": "".join(paragraph.xpath(".//w:t/text()", namespaces=NS)),
                "in_table": bool(paragraph.xpath("ancestor::w:tc", namespaces=NS)),
                "style": next(
                    iter(paragraph.xpath("./w:pPr/w:pStyle/@w:val", namespaces=NS)),
                    None,
                ),
                "runs": [
                    "".join(run.xpath(".//w:t/text()", namespaces=NS))
                    for run in paragraph.xpath("./w:r", namespaces=NS)
                ],
            }
        )
    return result


def property_inventory(root: etree._Element | None) -> dict[str, str]:
    if root is None:
        return {}
    return {
        etree.QName(child).localname: "".join(child.itertext())
        for child in root
    }


def style_summary(zf: zipfile.ZipFile) -> dict[str, object]:
    styles = read_xml(zf, "word/styles.xml")
    if styles is None:
        return {"style_count": 0, "fonts": [], "sizes_half_points": []}
    fonts: Counter[str] = Counter()
    sizes: Counter[str] = Counter()
    for node in styles.xpath(".//w:rFonts", namespaces=NS):
        for key in ("ascii", "hAnsi", "eastAsia", "cs"):
            value = node.get(f"{{{W_NS}}}{key}")
            if value:
                fonts[value] += 1
    for node in styles.xpath(".//w:sz | .//w:szCs", namespaces=NS):
        value = node.get(f"{{{W_NS}}}val")
        if value:
            sizes[value] += 1
    return {
        "style_count": len(styles.xpath(".//w:style", namespaces=NS)),
        "fonts": [name for name, _ in fonts.most_common()],
        "sizes_half_points": [name for name, _ in sizes.most_common()],
    }


def inspect_docx(path: Path) -> dict[str, object]:
    with zipfile.ZipFile(path) as zf:
        names = zf.namelist()
        story_names = [
            name
            for name in names
            if name == "word/document.xml"
            or re.fullmatch(r"word/(header|footer)\d*\.xml", name)
            or name
            in {
                "word/comments.xml",
                "word/footnotes.xml",
                "word/endnotes.xml",
            }
        ]
        stories: dict[str, str] = {}
        full_text_parts: list[str] = []
        for name in sorted(story_names):
            root = read_xml(zf, name)
            value = text_from(root)
            stories[name] = value
            full_text_parts.append(value)
        paragraph_data = {
            name: paragraph_inventory(read_xml(zf, name)) for name in sorted(story_names)
        }
        full_text = "\n".join(full_text_parts)

        core = property_inventory(read_xml(zf, "docProps/core.xml"))
        custom = property_inventory(read_xml(zf, "docProps/custom.xml"))
        external_relationships = 0
        for name in names:
            if not name.endswith(".rels"):
                continue
            rel_root = read_xml(zf, name)
            if rel_root is not None:
                external_relationships += len(
                    rel_root.xpath("./*[local-name()='Relationship'][@TargetMode='External']")
                )
        detected = {
            label: sorted(set(pattern.findall(full_text)))
            for label, pattern in SENSITIVE_PATTERNS.items()
        }
        document = read_xml(zf, "word/document.xml")
        section_count = (
            len(document.xpath(".//w:sectPr", namespaces=NS)) if document is not None else 0
        )
        return {
            "path": str(path.resolve()),
            "size": path.stat().st_size,
            "modified": path.stat().st_mtime,
            "sha256": sha256(path),
            "package_entries": names,
            "stories": stories,
            "paragraphs": paragraph_data,
            "detected": detected,
            "metadata_text": {"core": core, "custom": custom},
            "features": {
                "comments": "word/comments.xml" in names,
                "tracked_insertions": any(
                    bool(read_xml(zf, name).xpath(".//w:ins", namespaces=NS))
                    for name in story_names
                    if read_xml(zf, name) is not None
                ),
                "tracked_deletions": any(
                    bool(read_xml(zf, name).xpath(".//w:del", namespaces=NS))
                    for name in story_names
                    if read_xml(zf, name) is not None
                ),
                "images": len([name for name in names if name.startswith("word/media/")]),
                "embeddings": len(
                    [name for name in names if name.startswith("word/embeddings/")]
                ),
                "external_relationships": external_relationships,
                "section_count": section_count,
            },
            "styles": style_summary(zf),
        }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    paths = (
        sorted(args.input.rglob("*.docx"))
        if args.input.is_dir()
        else [args.input]
    )
    result = [inspect_docx(path) for path in paths]
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8"
    )


if __name__ == "__main__":
    main()
