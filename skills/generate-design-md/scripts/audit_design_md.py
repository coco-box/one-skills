#!/usr/bin/env python3
"""审计 DESIGN.md 的结构、引用和常见生成残留。"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:  # pragma: no cover - 环境依赖提示
    yaml = None


CANONICAL_SECTIONS = [
    "Overview",
    "Colors",
    "Typography",
    "Layout",
    "Elevation & Depth",
    "Shapes",
    "Components",
    "Do's and Don'ts",
    "Responsive Behavior",
    "Agent Prompt Guide",
    "Source Scope & Confidence",
    "Iteration Guide",
    "Known Gaps",
]
REQUIRED_SECTIONS = {
    "Overview",
    "Colors",
    "Typography",
    "Layout",
    "Components",
    "Do's and Don'ts",
    "Responsive Behavior",
    "Source Scope & Confidence",
}
PLACEHOLDER_RE = re.compile(
    r"<(?=[A-Z0-9_ -]+>)[A-Z0-9_ -]+>|\b(?:TODO|TO_FILL|PLACEHOLDER)\b"
)
TOKEN_REF_RE = re.compile(r"\{([a-zA-Z0-9_.-]+)\}")
HEADING_RE = re.compile(r"^##\s+(.+?)\s*$", re.MULTILINE)


def add(findings: list[dict[str, str]], severity: str, message: str) -> None:
    findings.append({"severity": severity, "message": message})


def split_frontmatter(text: str) -> tuple[str, str]:
    match = re.match(r"\A---\s*\n(.*?)\n---\s*(?:\n|\Z)", text, re.DOTALL)
    if not match:
        raise ValueError("文件必须以由 --- 包围的 YAML front matter 开头")
    return match.group(1), text[match.end() :]


def iter_values(value: Any):
    if isinstance(value, dict):
        for child in value.values():
            yield from iter_values(child)
    elif isinstance(value, list):
        for child in value:
            yield from iter_values(child)
    elif isinstance(value, str):
        yield value


def resolves_token(data: dict[str, Any], path: str) -> bool:
    current: Any = data
    for part in path.split("."):
        if not isinstance(current, dict) or part not in current:
            return False
        current = current[part]
    return True


def audit(path: Path) -> list[dict[str, str]]:
    findings: list[dict[str, str]] = []
    text = path.read_text(encoding="utf-8")

    if path.name != "DESIGN.md":
        add(findings, "warning", "建议将交付文件命名为 DESIGN.md")
    if PLACEHOLDER_RE.search(text):
        add(findings, "error", "文件仍包含占位符、TODO 或 TO_FILL")

    try:
        yaml_text, body = split_frontmatter(text)
    except ValueError as exc:
        add(findings, "error", str(exc))
        return findings

    if yaml is None:
        add(findings, "error", "缺少 PyYAML，无法解析 front matter；请安装 pyyaml")
        return findings

    try:
        data = yaml.safe_load(yaml_text)
    except yaml.YAMLError as exc:
        add(findings, "error", f"YAML 解析失败：{exc}")
        return findings

    if not isinstance(data, dict):
        add(findings, "error", "front matter 必须是 YAML 对象")
        return findings

    if not isinstance(data.get("name"), str) or not data["name"].strip():
        add(findings, "error", "front matter 缺少非空 name")

    for key in ("colors", "typography", "components"):
        value = data.get(key)
        if not isinstance(value, dict) or not value:
            add(findings, "warning", f"{key} 缺失或为空")

    typography = data.get("typography")
    if isinstance(typography, dict) and len(typography) < 4:
        add(findings, "warning", "typography 少于 4 个角色，可能不足以覆盖常见页面层级")

    components = data.get("components")
    if isinstance(components, dict) and len(components) < 4:
        add(findings, "warning", "components 少于 4 个条目，建议核对核心组件与已观察状态")

    colors = data.get("colors")
    if isinstance(colors, dict) and "primary" not in colors:
        add(findings, "warning", "colors 已定义但缺少 primary")

    for value in iter_values(data):
        for ref in TOKEN_REF_RE.findall(value):
            if not resolves_token(data, ref):
                add(findings, "error", f"token 引用无法解析：{{{ref}}}")

    headings = HEADING_RE.findall(body)
    duplicates = sorted({heading for heading in headings if headings.count(heading) > 1})
    for heading in duplicates:
        add(findings, "error", f"重复的二级章节：{heading}")

    for heading in sorted(REQUIRED_SECTIONS - set(headings)):
        add(findings, "warning", f"缺少建议章节：{heading}")

    known_positions = [CANONICAL_SECTIONS.index(h) for h in headings if h in CANONICAL_SECTIONS]
    if known_positions != sorted(known_positions):
        add(findings, "warning", "标准章节顺序不符合输出规范")

    if len(body.strip()) < 800:
        add(findings, "warning", "正文少于 800 字符，可能不足以描述可执行的设计语言")

    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description="审计 DESIGN.md")
    parser.add_argument("file", type=Path, help="待检查的 DESIGN.md 路径")
    parser.add_argument("--json", action="store_true", help="以 JSON 输出结果")
    args = parser.parse_args()

    if not args.file.is_file():
        print(f"错误：文件不存在：{args.file}", file=sys.stderr)
        return 2

    findings = audit(args.file)
    counts = {
        severity: sum(item["severity"] == severity for item in findings)
        for severity in ("error", "warning")
    }

    if args.json:
        print(json.dumps({"findings": findings, "summary": counts}, ensure_ascii=False, indent=2))
    else:
        for item in findings:
            print(f"[{item['severity'].upper()}] {item['message']}")
        print(f"审计完成：{counts['error']} 个错误，{counts['warning']} 个警告")

    return 1 if counts["error"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
