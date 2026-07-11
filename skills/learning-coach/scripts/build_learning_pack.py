#!/usr/bin/env python3
"""根据 JSON 配置生成确定性的学习计划骨架。"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def distribute(topics: list[str], weeks: int) -> list[list[str]]:
    """尽量均匀地按周分配主题，并保留全部主题。"""
    return [topics[index::weeks] for index in range(weeks)]


def build(config: dict) -> dict:
    required = ("subject", "learner_level", "duration_weeks", "time_per_week_hours", "goals", "topics")
    missing = [key for key in required if key not in config]
    if missing:
        raise ValueError(f"缺少配置字段：{', '.join(missing)}")

    weeks = config["duration_weeks"]
    topics = config["topics"]
    if not isinstance(weeks, int) or weeks < 1:
        raise ValueError("duration_weeks 必须是正整数")
    if not isinstance(topics, list) or not topics or not all(isinstance(item, str) and item.strip() for item in topics):
        raise ValueError("topics 必须是非空字符串数组")

    allocation = distribute(topics, weeks)
    plan = []
    for week, items in enumerate(allocation, start=1):
        focus = items or ["综合复习与查漏补缺"]
        plan.append({
            "week": week,
            "focus": focus,
            "time_budget_hours": config["time_per_week_hours"],
            "tasks": [f"学习并整理：{topic}" for topic in focus] + ["完成练习并更新错题记录"],
            "acceptance": "用一次闭卷复述或小测验证本周目标，并记录正确率与用时",
        })

    return {
        "schema_version": 1,
        "profile": {key: config[key] for key in required},
        "plan": plan,
        "review_rule": "依据正确率、完成度和错误类型调整下一周任务，不达标主题优先复测",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="生成学习计划 JSON 骨架")
    parser.add_argument("--config", required=True, type=Path, help="输入配置 JSON")
    parser.add_argument("--output", required=True, type=Path, help="输出 JSON")
    args = parser.parse_args()
    config = json.loads(args.config.read_text(encoding="utf-8"))
    payload = build(config)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"已生成：{args.output}")


if __name__ == "__main__":
    main()
