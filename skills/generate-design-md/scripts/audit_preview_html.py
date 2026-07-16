#!/usr/bin/env python3
"""审计明暗预览的自包含结构及其与 DESIGN.md token 的一致性。"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:  # pragma: no cover - 环境依赖提示
    yaml = None


PLACEHOLDER_RE = re.compile(
    r"<(?=[A-Z0-9_ -]+>)[A-Z0-9_ -]+>|\b(?:TODO|TO_FILL|PLACEHOLDER)\b"
)
REQUIRED_MARKERS = {
    "viewport": r'<meta\s+name=["\']viewport["\']',
    "内联样式": r"<style(?:\s|>)",
    "颜色标本": r'id=["\']colors["\']',
    "字体标本": r'id=["\']typography["\']',
    "组件标本": r'id=["\']components["\']',
    "基础标本": r'id=["\']foundations["\']',
    "移动端规则": r"@media\s*\([^)]*max-width",
    "键盘焦点": r":focus-visible",
    "减少动效规则": r"prefers-reduced-motion",
}


def split_frontmatter(text: str) -> str:
    match = re.match(r"\A---\s*\n(.*?)\n---\s*(?:\n|\Z)", text, re.DOTALL)
    if not match:
        raise ValueError("DESIGN.md 缺少 YAML front matter")
    return match.group(1)


def iter_scalar_tokens(group: Any):
    if isinstance(group, dict):
        for value in group.values():
            yield from iter_scalar_tokens(value)
    elif isinstance(group, (str, int, float)):
        yield str(group)


def main() -> int:
    parser = argparse.ArgumentParser(description="审计 preview HTML 与 DESIGN.md")
    parser.add_argument("preview", type=Path, help="待检查的 preview.html 或 preview-dark.html")
    parser.add_argument("design", type=Path, help="对应的 DESIGN.md")
    args = parser.parse_args()

    if not args.preview.is_file() or not args.design.is_file():
        print("错误：preview.html 或 DESIGN.md 不存在", file=sys.stderr)
        return 2
    if yaml is None:
        print("错误：缺少 PyYAML，无法解析 DESIGN.md", file=sys.stderr)
        return 2

    html = args.preview.read_text(encoding="utf-8")
    design_text = args.design.read_text(encoding="utf-8")
    errors: list[str] = []
    warnings: list[str] = []

    expected_names = {"preview.html", "preview-dark.html"}
    if args.preview.name not in expected_names:
        warnings.append("建议将预览文件命名为 preview.html 或 preview-dark.html")
    if args.preview.name == "preview-dark.html" and not re.search(
        r'data-preview-mode=["\']dark["\']', html, re.IGNORECASE
    ):
        errors.append("preview-dark.html 的根元素缺少 data-preview-mode=\"dark\"")
    if PLACEHOLDER_RE.search(html):
        errors.append("preview.html 仍包含占位符、TODO 或 TO_FILL")
    if not re.search(r"<!doctype\s+html>", html, re.IGNORECASE):
        errors.append("缺少 HTML5 doctype")
    if re.search(r"<(?:script|link)[^>]+(?:src|href)=[\"'](?!https?://|#|data:)", html, re.IGNORECASE):
        errors.append("引用了额外本地 CSS、JavaScript 或资源文件")

    for label, pattern in REQUIRED_MARKERS.items():
        if not re.search(pattern, html, re.IGNORECASE):
            errors.append(f"缺少{label}")

    try:
        data = yaml.safe_load(split_frontmatter(design_text))
    except (ValueError, yaml.YAMLError) as exc:
        print(f"错误：无法解析 DESIGN.md：{exc}", file=sys.stderr)
        return 2

    html_lower = html.lower()
    for group_name in ("colors", "rounded", "spacing"):
        for value in set(iter_scalar_tokens(data.get(group_name, {}))):
            if "{" in value:
                continue
            if value.lower() not in html_lower:
                warnings.append(f"{group_name} token 未在预览中直接出现：{value}")

    typography = data.get("typography", {})
    if isinstance(typography, dict):
        for token_name, token in typography.items():
            if not isinstance(token, dict):
                continue
            font_size = token.get("fontSize")
            if font_size is not None and str(font_size).lower() not in html_lower:
                warnings.append(f"字体层级未在预览中直接出现：{token_name} / {font_size}")

    for message in errors:
        print(f"[ERROR] {message}")
    for message in warnings:
        print(f"[WARNING] {message}")
    print(f"审计完成：{len(errors)} 个错误，{len(warnings)} 个警告")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
