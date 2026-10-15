"""Check derived full-law-text mothers against their sanitized source mothers."""

import re
from pathlib import Path
from zipfile import ZipFile

from docx import Document

from build_full_law_text_templates import TEMPLATES


SENSITIVE_PATTERNS = (
    re.compile(r"\b1[3-9]\d{9}\b"),
    re.compile(r"\b\d{17}[\dXx]\b"),
    re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"),
)


for source, target, edits in TEMPLATES:
    assert target.is_file(), target
    with ZipFile(source) as old, ZipFile(target) as new:
        assert set(old.namelist()) == set(new.namelist())
        changed_parts = [name for name in old.namelist() if old.read(name) != new.read(name)]
        assert changed_parts == ["word/document.xml"], (target, changed_parts)
        assert not any("embeddings/" in name or "customXml/" in name for name in new.namelist())
        for name in new.namelist():
            data = new.read(name)
            if name.endswith(".rels"):
                assert b'TargetMode="External"' not in data, (target, name)
            if name.endswith(".xml"):
                decoded = data.decode("utf-8", "ignore")
                for pattern in SENSITIVE_PATTERNS:
                    assert not pattern.search(decoded), (target, name, pattern.pattern)
        print(f"{target.name}: {len(new.namelist())} package parts; changed only {changed_parts[0]}; no basic identifier/external-link hits")
    paragraphs = Document(target).paragraphs
    for index, text in edits.items():
        assert paragraphs[index].text == text, (target, index, paragraphs[index].text)
    if "LAW" in target.name:
        assert not any("适用说明" in paragraph.text for paragraph in paragraphs)
    print(f"{target.name}: {len(edits)} requested paragraph edits verified")
