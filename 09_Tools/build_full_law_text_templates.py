"""Derive v2 hearing/legal-authority mothers with full-law-text prompts.

The source mothers are immutable; only word/document.xml text nodes are edited.
"""

from pathlib import Path
from zipfile import ZipFile

from lxml import etree


ROOT = Path(__file__).resolve().parents[1]
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

TEMPLATES = (
    (
        ROOT / "05_Templates/hearing/TPL-HRG-001_民商事庭审提纲_标准母版.docx",
        ROOT / "05_Templates/hearing/TPL-HRG-002_民商事庭审提纲_法条原文母版.docx",
        {
            14: "法律依据：【逐条照录经核验的完整法条原文，含全部款项】",
        },
    ),
    (
        ROOT / "05_Templates/legal_authority/TPL-LAW-001_庭前法律法规汇编_标准母版.docx",
        ROOT / "05_Templates/legal_authority/TPL-LAW-002_庭前法律法规汇编_法条原文母版.docx",
        {
            10: "第[条]条  [逐字录入经核验的完整原文，含全部款项]",
            11: "关联争点：[填写]",
            17: "第[条]条  [逐字录入经核验的完整原文，含全部款项]",
            18: "关联争点：[填写]",
        },
    ),
)


def derive(source: Path, target: Path, edits: dict[int, str]) -> None:
    with ZipFile(source) as package:
        xml = etree.fromstring(package.read("word/document.xml"))
        paragraphs = xml.findall(f".//{W}body/{W}p")
        assert max(edits) < len(paragraphs), (source, len(paragraphs))
        for index, new_text in edits.items():
            paragraph = paragraphs[index]
            nodes = paragraph.findall(f".//{W}t")
            assert nodes, (source, index)
            old_text = "".join(node.text or "" for node in nodes)
            assert old_text != new_text, (source, index)
            assert ("法律依据" in old_text or "逐字录入" in old_text or "适用说明" in old_text), (
                source, index, old_text
            )
            nodes[0].text = new_text
            for node in nodes[1:]:
                node.text = ""
            print(f"{target.name} paragraph {index}: {old_text!r} -> {new_text!r}")
        changed = etree.tostring(xml, encoding="UTF-8", xml_declaration=True, standalone=True)
        with ZipFile(target, "w") as result:
            for info in package.infolist():
                data = changed if info.filename == "word/document.xml" else package.read(info.filename)
                result.writestr(info, data)


if __name__ == "__main__":
    for source_path, target_path, replacements in TEMPLATES:
        assert source_path.is_file(), source_path
        assert not target_path.exists(), target_path
        derive(source_path, target_path, replacements)
