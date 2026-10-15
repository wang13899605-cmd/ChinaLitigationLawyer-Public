#!/usr/bin/env python3
"""Create an anonymized, layout-preserving DOCX template from a source DOCX."""

from __future__ import annotations

import argparse
import json
import re
import tempfile
import zipfile
from copy import deepcopy
from pathlib import Path

from lxml import etree


W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
CT_NS = "http://schemas.openxmlformats.org/package/2006/content-types"
CP_NS = "http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
DC_NS = "http://purl.org/dc/elements/1.1/"
DCTERMS_NS = "http://purl.org/dc/terms/"
EP_NS = "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
XML_NS = "http://www.w3.org/XML/1998/namespace"
NS = {"w": W_NS, "r": R_NS}


def qn(namespace: str, local: str) -> str:
    return f"{{{namespace}}}{local}"


def parse_xml(data: bytes) -> etree._Element:
    return etree.fromstring(data)


def serialize_xml(root: etree._Element) -> bytes:
    return etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)


def accept_tracked_changes(root: etree._Element) -> None:
    for tag in ("del", "moveFrom"):
        for node in list(root.xpath(f".//w:{tag}", namespaces=NS)):
            parent = node.getparent()
            if parent is not None:
                parent.remove(node)
    for tag in ("ins", "moveTo"):
        for node in list(root.xpath(f".//w:{tag}", namespaces=NS)):
            parent = node.getparent()
            if parent is None:
                continue
            position = parent.index(node)
            for child in list(node):
                parent.insert(position, child)
                position += 1
            parent.remove(node)


def remove_comment_anchors(root: etree._Element) -> None:
    for tag in ("commentRangeStart", "commentRangeEnd", "commentReference"):
        for node in list(root.xpath(f".//w:{tag}", namespaces=NS)):
            parent = node.getparent()
            if parent is not None:
                parent.remove(node)


def remove_note_references(root: etree._Element) -> None:
    for tag in ("footnoteReference", "endnoteReference"):
        for node in list(root.xpath(f".//w:{tag}", namespaces=NS)):
            parent = node.getparent()
            if parent is not None:
                parent.remove(node)


def remove_rsid_attributes(root: etree._Element) -> None:
    for node in root.iter():
        for attr in list(node.attrib):
            if etree.QName(attr).namespace == W_NS and etree.QName(attr).localname.startswith("rsid"):
                del node.attrib[attr]


def replace_paragraph_text(paragraph: etree._Element, value: str) -> None:
    text_nodes = paragraph.xpath(".//w:t", namespaces=NS)
    if text_nodes:
        first = text_nodes[0]
        first.text = value
        if value.startswith(" ") or value.endswith(" "):
            first.set(qn(XML_NS, "space"), "preserve")
        else:
            first.attrib.pop(qn(XML_NS, "space"), None)
        for node in text_nodes[1:]:
            node.text = ""
        return

    runs = paragraph.xpath("./w:r", namespaces=NS)
    if runs:
        run = runs[0]
    else:
        run = etree.Element(qn(W_NS, "r"))
        ppr = paragraph.find(qn(W_NS, "pPr"))
        paragraph.insert(1 if ppr is not None else 0, run)
    text = etree.Element(qn(W_NS, "t"))
    text.text = value
    if value.startswith(" ") or value.endswith(" "):
        text.set(qn(XML_NS, "space"), "preserve")
    run.append(text)


def replace_run_texts(paragraph: etree._Element, values: list[str]) -> None:
    """Replace text run by run so character-level formatting remains attached."""
    text_nodes = paragraph.xpath(".//w:t", namespaces=NS)
    if len(values) > len(text_nodes):
        raise ValueError(
            f"Run replacement has {len(values)} values but paragraph only has "
            f"{len(text_nodes)} text nodes"
        )
    for index, node in enumerate(text_nodes):
        value = values[index] if index < len(values) else ""
        node.text = value
        if value.startswith(" ") or value.endswith(" "):
            node.set(qn(XML_NS, "space"), "preserve")
        else:
            node.attrib.pop(qn(XML_NS, "space"), None)


def clear_blank_paragraph_artifacts(paragraph: etree._Element) -> None:
    """Remove legacy page-break and non-text payloads from a deliberately blank slot."""
    for tag in (
        "br",
        "cr",
        "tab",
        "drawing",
        "pict",
        "object",
        "sym",
        "fldChar",
        "instrText",
        "delText",
        "lastRenderedPageBreak",
        "separator",
        "continuationSeparator",
    ):
        for node in list(paragraph.xpath(f".//w:{tag}", namespaces=NS)):
            parent = node.getparent()
            if parent is not None:
                parent.remove(node)
    for node in list(paragraph.xpath("./w:pPr/w:pageBreakBefore", namespaces=NS)):
        parent = node.getparent()
        if parent is not None:
            parent.remove(node)


def apply_paragraph_plan(
    root: etree._Element,
    plan: dict[str, object],
    *,
    remove_unlisted_non_table: bool = False,
) -> tuple[int, int]:
    replacements = {int(key): str(value) for key, value in plan.get("replace", {}).items()}
    run_replacements = {
        int(key): [str(value) for value in values]
        for key, values in plan.get("run_replace", {}).items()
    }
    blank_unlisted = bool(plan.get("blank_unlisted", False))
    paragraphs = root.xpath(".//w:p", namespaces=NS)
    planned_indexes = set(replacements) | set(run_replacements)
    overlap = set(replacements) & set(run_replacements)
    if overlap:
        raise ValueError(f"Paragraph indexes present in both replace and run_replace: {sorted(overlap)}")
    out_of_range = [index for index in planned_indexes if index < 0 or index >= len(paragraphs)]
    if out_of_range:
        raise ValueError(f"Paragraph indexes out of range: {out_of_range}")
    remove_after: list[etree._Element] = []
    for index, paragraph in enumerate(paragraphs):
        if index in run_replacements:
            replace_run_texts(paragraph, run_replacements[index])
        elif index in replacements:
            replace_paragraph_text(paragraph, replacements[index])
        elif blank_unlisted:
            in_table = bool(paragraph.xpath("ancestor::w:tc", namespaces=NS))
            has_section_break = bool(paragraph.xpath("./w:pPr/w:sectPr", namespaces=NS))
            if remove_unlisted_non_table and not in_table and not has_section_break:
                remove_after.append(paragraph)
            else:
                replace_paragraph_text(paragraph, "")
                clear_blank_paragraph_artifacts(paragraph)
    for paragraph in reversed(remove_after):
        parent = paragraph.getparent()
        if parent is not None:
            parent.remove(paragraph)
    return len(paragraphs), len(planned_indexes)


def scrub_core_properties(root: etree._Element, title: str) -> None:
    replacements = {
        qn(DC_NS, "title"): title,
        qn(DC_NS, "subject"): "经脱敏的诉讼文书格式母版",
        qn(DC_NS, "creator"): "",
        qn(CP_NS, "lastModifiedBy"): "",
        qn(DC_NS, "description"): "",
        qn(CP_NS, "keywords"): "",
        qn(CP_NS, "category"): "",
        qn(CP_NS, "contentStatus"): "AI_DRAFT_TEMPLATE",
    }
    for tag, value in replacements.items():
        nodes = root.findall(tag)
        if nodes:
            for node in nodes:
                node.text = value
        elif value:
            node = etree.SubElement(root, tag)
            node.text = value
    for tag in (qn(DCTERMS_NS, "created"), qn(DCTERMS_NS, "modified")):
        for node in root.findall(tag):
            node.text = "2026-09-06T00:00:00Z"


def scrub_extended_properties(root: etree._Element) -> None:
    for local in ("Company", "Manager", "HyperlinkBase"):
        for node in root.findall(qn(EP_NS, local)):
            node.text = ""


def scrub_relationships(root: etree._Element) -> set[str]:
    removed_ids: set[str] = set()
    for rel in list(root):
        rel_type = rel.get("Type", "")
        target_mode = rel.get("TargetMode", "")
        target = rel.get("Target", "")
        if (
            target_mode == "External"
            or "comments" in rel_type.lower()
            or "customxml" in target.lower()
            or rel_type.lower().endswith("/custom-properties")
            or "oleobject" in rel_type.lower()
            or rel_type.lower().endswith("/package")
            or "printersettings" in target.lower()
            or "embeddings" in target.lower()
            or "activex" in target.lower()
            or "glossary" in target.lower()
        ):
            removed_ids.add(rel.get("Id", ""))
            root.remove(rel)
    return removed_ids


def remove_dangling_relationship_nodes(root: etree._Element, removed_ids: set[str]) -> None:
    if not removed_ids:
        return
    for node in list(root.xpath(".//*[@r:id]", namespaces=NS)):
        if node.get(qn(R_NS, "id")) in removed_ids:
            parent = node.getparent()
            if parent is not None:
                parent.remove(node)


def scrub_content_types(root: etree._Element) -> bool:
    changed = False
    for node in list(root):
        part_name = (node.get("PartName") or "").lower()
        content_type = (node.get("ContentType") or "").lower()
        if any(
            token in part_name or token in content_type
            for token in (
                "comments",
                "custom-properties",
                "customxml",
                "people",
                "person.xml",
                "thumbnail",
                "oleobject",
                "printersettings",
                "activex",
                "glossary",
            )
        ):
            root.remove(node)
            changed = True
    return changed


def should_drop_part(name: str) -> bool:
    lower = name.lower()
    return (
        lower.startswith("customxml/")
        or lower.startswith("word/embeddings/")
        or lower.startswith("word/activex/")
        or lower.startswith("word/glossary/")
        or lower.startswith("word/printersettings/")
        or lower in {"docprops/custom.xml", "docprops/thumbnail.jpeg"}
        or "comments" in lower
        or lower in {"word/people.xml", "word/person.xml"}
    )


def sanitize(input_path: Path, output_path: Path, plan: dict[str, object]) -> dict[str, object]:
    part_plans = plan.get("parts", {})
    title = str(plan.get("title", output_path.stem))
    report: dict[str, object] = {
        "input": str(input_path.resolve()),
        "output": str(output_path.resolve()),
        "title": title,
        "parts": {},
        "dropped_parts": [],
        "removed_external_relationship_ids": [],
    }

    with zipfile.ZipFile(input_path, "r") as source:
        source_names = source.namelist()
        parsed: dict[str, etree._Element] = {}
        removed_rel_ids: dict[str, set[str]] = {}
        modified_names: set[str] = set()

        for name in source_names:
            if not name.endswith((".xml", ".rels")):
                continue
            try:
                parsed[name] = parse_xml(source.read(name))
            except etree.XMLSyntaxError:
                continue

        story_names = [
            name
            for name in parsed
            if name == "word/document.xml"
            or re.fullmatch(r"word/(header|footer)\d*\.xml", name)
            or name in {"word/footnotes.xml", "word/endnotes.xml"}
        ]
        for name in story_names:
            root = parsed[name]
            modified_names.add(name)
            accept_tracked_changes(root)
            remove_comment_anchors(root)
            remove_note_references(root)
            remove_rsid_attributes(root)
            if name in part_plans:
                total, changed = apply_paragraph_plan(
                    root,
                    part_plans[name],
                    remove_unlisted_non_table=(
                        name == "word/document.xml"
                        and bool(plan.get("remove_unlisted_non_table", True))
                    ),
                )
                report["parts"][name] = {"paragraphs": total, "planned": changed}
            elif bool(plan.get("blank_headers", False)) and re.fullmatch(
                r"word/header\d*\.xml", name
            ):
                total, changed = apply_paragraph_plan(
                    root, {"blank_unlisted": True, "replace": {}}
                )
                report["parts"][name] = {"paragraphs": total, "planned": changed}

        if bool(plan.get("blank_notes", False)):
            for name, tag in (
                ("word/footnotes.xml", "footnote"),
                ("word/endnotes.xml", "endnote"),
            ):
                root = parsed.get(name)
                if root is None:
                    continue
                modified_names.add(name)
                for note in list(root.xpath(f"./w:{tag}", namespaces=NS)):
                    note_id = note.get(qn(W_NS, "id"), "0")
                    if note_id not in {"-1", "0"}:
                        root.remove(note)
        settings = parsed.get("word/settings.xml")
        if settings is not None:
            modified_names.add("word/settings.xml")
            for node in list(settings.xpath(".//w:trackRevisions", namespaces=NS)):
                parent = node.getparent()
                if parent is not None:
                    parent.remove(node)
            for node in list(settings.xpath(".//w:docVars", namespaces=NS)):
                parent = node.getparent()
                if parent is not None:
                    parent.remove(node)
            remove_rsid_attributes(settings)

        core = parsed.get("docProps/core.xml")
        if core is not None:
            modified_names.add("docProps/core.xml")
            scrub_core_properties(core, title)
        app = parsed.get("docProps/app.xml")
        if app is not None:
            modified_names.add("docProps/app.xml")
            scrub_extended_properties(app)

        for name, root in parsed.items():
            if name.endswith(".rels"):
                removed = scrub_relationships(root)
                if removed:
                    removed_rel_ids[name] = removed
                    modified_names.add(name)
                    report["removed_external_relationship_ids"].extend(sorted(removed))
            elif name == "[Content_Types].xml":
                if scrub_content_types(root):
                    modified_names.add(name)

        for rel_name, removed_ids in removed_rel_ids.items():
            if rel_name == "word/_rels/document.xml.rels":
                document = parsed.get("word/document.xml")
                if document is not None:
                    remove_dangling_relationship_nodes(document, removed_ids)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(
            prefix=output_path.stem + "_", suffix=".docx", delete=False, dir=output_path.parent
        ) as temp_handle:
            temp_path = Path(temp_handle.name)
        try:
            with zipfile.ZipFile(temp_path, "w", compression=zipfile.ZIP_DEFLATED) as target:
                for name in source_names:
                    if should_drop_part(name):
                        report["dropped_parts"].append(name)
                        continue
                    if name in parsed and name in modified_names:
                        target.writestr(name, serialize_xml(parsed[name]))
                    else:
                        target.writestr(name, source.read(name))
            temp_path.replace(output_path)
        finally:
            if temp_path.exists():
                temp_path.unlink()
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--plan", type=Path, required=True)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()

    plans = json.loads(args.plan.read_text(encoding="utf-8"))
    plan_key = args.input.name
    plan = plans.get(plan_key)
    if plan is None:
        raise KeyError(f"No plan found for {plan_key}")
    report = sanitize(args.input, args.output, plan)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(
            json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
        )
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
