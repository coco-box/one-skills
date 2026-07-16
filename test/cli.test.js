import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { spawnSync } from "node:child_process";

const cli = resolve(import.meta.dirname, "../bin/one-skills.js");

function run(args, cwd) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8" });
}

test("列出清单", () => {
  const result = run(["list"], process.cwd());
  assert.equal(result.status, 0);
  assert.match(result.stdout, /learning-coach/);
  assert.match(result.stdout, /generate-design-md/);
});

test("显示帮助", () => {
  const result = run(["--help"], process.cwd());
  assert.equal(result.status, 0);
  assert.match(result.stdout, /跨客户端管理 Agent Skills/);
});

test("安装、更新和卸载项目 skill", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "one-skills-"));
  assert.equal(run(["install", "learning-coach", "--agent", "codex"], cwd).status, 0);
  const installed = join(cwd, ".codex/skills/learning-coach");
  assert.match(await readFile(join(installed, "SKILL.md"), "utf8"), /name: learning-coach/);
  assert.equal(run(["update", "--agent", "codex"], cwd).status, 0);
  assert.equal(run(["uninstall", "--agent", "codex"], cwd).status, 0);
  assert.notEqual(run(["install", "unknown", "--agent", "codex"], cwd).status, 0);
});

test("预览不写文件", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "one-skills-preview-"));
  const result = run(["install", "--agent", "all", "--dry-run"], cwd);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /\[预览\]/);
});

test("安装 generate-design-md 及其配套资源", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "one-skills-design-"));
  const result = run(["install", "generate-design-md", "--agent", "cursor"], cwd);
  assert.equal(result.status, 0);
  const installed = join(cwd, ".cursor/skills/generate-design-md");
  assert.match(await readFile(join(installed, "SKILL.md"), "utf8"), /name: generate-design-md/);
  assert.match(await readFile(join(installed, "assets/DESIGN.template.md"), "utf8"), /Source Scope/);
  assert.match(await readFile(join(installed, "scripts/audit_design_md.py"), "utf8"), /python/);
});
