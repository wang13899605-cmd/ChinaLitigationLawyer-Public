#!/usr/bin/env python3
"""Build a sanitized complaint mother from a lawyer-supplied DOCX reference."""

from __future__ import annotations

import argparse
import sys
import tempfile
import zipfile
from copy import deepcopy
from pathlib import Path

from lxml import etree


ROOT = Path(__file__).resolve().parents[1]
UTILITIES = ROOT / "09_Tools" / "utilities"
sys.path.insert(0, str(UTILITIES))
from docx_template_sanitize import sanitize  # noqa: E402


W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
XML_NS = "http://www.w3.org/XML/1998/namespace"
CP_NS = "http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
NS = {"w": W_NS}


def qn(namespace: str, local: str) -> str:
    return f"{{{namespace}}}{local}"


def replace_paragraph(paragraph: etree._Element, parts: list[tuple[str, int]]) -> None:
    """Replace visible content while preserving paragraph and selected run formatting."""
    source_runs = paragraph.xpath("./w:r", namespaces=NS)
    source_rprs = [
        deepcopy(run.find(qn(W_NS, "rPr")))
        if run.find(qn(W_NS, "rPr")) is not None
        else None
        for run in source_runs
    ]
    for child in list(paragraph):
        if child.tag != qn(W_NS, "pPr"):
            paragraph.remove(child)
    for text, source_index in parts:
        run = etree.Element(qn(W_NS, "r"))
        if source_rprs:
            rpr = source_rprs[min(source_index, len(source_rprs) - 1)]
            if rpr is not None:
                run.append(deepcopy(rpr))
        text_node = etree.Element(qn(W_NS, "t"))
        text_node.text = text
        if text.startswith(" ") or text.endswith(" "):
            text_node.set(qn(XML_NS, "space"), "preserve")
        run.append(text_node)
        paragraph.append(run)


def remove_last_printed(path: Path) -> None:
    """Remove historical print metadata without rewriting preserve-only parts."""
    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False, dir=path.parent) as handle:
        temporary = Path(handle.name)
    try:
        with zipfile.ZipFile(path, "r") as source_zip:
            core = etree.fromstring(source_zip.read("docProps/core.xml"))
            for node in core.findall(qn(CP_NS, "lastPrinted")):
                core.remove(node)
            core_xml = etree.tostring(
                core, xml_declaration=True, encoding="UTF-8", standalone=True
            )
            with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED) as target_zip:
                for item in source_zip.infolist():
                    payload = core_xml if item.filename == "docProps/core.xml" else source_zip.read(item.filename)
                    target_zip.writestr(item, payload)
        temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)


def build(source: Path, output: Path) -> None:
    replacements: dict[int, list[tuple[str, int]]] = {
        0: [("民事起诉状", 0)],
        1: [("", 0)],
        2: [
            ("原      告", 0),
            ("：", 1),
            ("【姓名或单位名称】", 2),
            ("，", 3),
            ("【按主体类型填写身份信息、住所地及联系方式】", 4),
        ],
        3: [("", 0)],
        4: [
            ("被 ", 0),
            ("     ", 1),
            ("告：", 2),
            ("【姓名或单位名称】", 3),
            ("，", 4),
            ("【按主体类型填写身份信息、住所地及联系方式】", 5),
        ],
        5: [("", 0)],
        6: [("诉讼请求：", 0)],
        7: [("【填写第一项诉讼请求】；", 0)],
        8: [("【填写第二项诉讼请求；无则删除本项】；", 0)],
        9: [("【填写诉讼费、保全费等费用承担请求；编号按实际调整】。", 0)],
        10: [("事实与理由：", 0)],
        11: [
            (
                "【按时间顺序写明与诉讼请求有关的关键事实、被告行为、履行或损害结果及证据对应关系；以有证据支持且对我方有利的事实经过为主体。】",
                0,
            )
        ],
        12: [("综上，原告特向贵院提起诉讼，请依法支持原告的诉讼请求。", 0)],
        13: [("此致", 0)],
        14: [("【有管辖权的人民法院】", 0)],
        15: [("具状人：【原告/法定代表人签名或盖章】", 0)],
        16: [("", 0)],
        17: [("日  期：【提交日期】", 0)],
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".docx", delete=False, dir=output.parent) as handle:
        temporary = Path(handle.name)
    try:
        with zipfile.ZipFile(source, "r") as source_zip:
            root = etree.fromstring(source_zip.read("word/document.xml"))
            paragraphs = root.xpath("//w:body/w:p", namespaces=NS)
            if len(paragraphs) != 18:
                raise ValueError(f"Unexpected reference structure: {len(paragraphs)} paragraphs")
            for index, parts in replacements.items():
                replace_paragraph(paragraphs[index], parts)
            document_xml = etree.tostring(
                root, xml_declaration=True, encoding="UTF-8", standalone=True
            )
            with zipfile.ZipFile(temporary, "w", compression=zipfile.ZIP_DEFLATED) as target_zip:
                for item in source_zip.infolist():
                    payload = document_xml if item.filename == "word/document.xml" else source_zip.read(item.filename)
                    target_zip.writestr(item, payload)
        sanitize(
            temporary,
            output,
            {
                "title": "民事起诉状律师指定版式脱敏母版",
                "parts": {},
                "remove_unlisted_non_table": False,
                "blank_headers": True,
                "blank_notes": True,
            },
        )
        remove_last_printed(output)
    finally:
        temporary.unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    build(args.source, args.output)


if __name__ == "__main__":
    main()
