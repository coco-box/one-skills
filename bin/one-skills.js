#!/usr/bin/env node

import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(await readFile(join(root, "skills.json"), "utf8"));
const agents = {
  codex: { project: ".codex/skills", global: ".codex/skills" },
  cursor: { project: ".cursor/skills", global: ".cursor/skills" },
  claude: { project: ".claude/skills", global: ".claude/skills" },
};

function usage() {
  console.log(`one-skills：跨客户端管理 Agent Skills

用法：
  one-skills list
  one-skills install [skill...] --agent <codex,cursor,claude|all> [--global] [--dry-run] [--force]
  one-skills update [skill...] --agent <...> [--global] [--dry-run]
  one-skills uninstall [skill...] --agent <...> [--global] [--dry-run]

说明：未指定 skill 时安装、更新或卸载全部 skill；默认写入当前项目。`);
}

function parse(argv) {
  const result = { command: argv[0], skills: [], agent: null, global: false, dryRun: false, force: false };
  if (result.command === "--help" || result.command === "-h") result.command = "help";
  for (let index = 1; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--agent" || value === "--tools") result.agent = argv[++index];
    else if (value === "--global") result.global = true;
    else if (value === "--dry-run") result.dryRun = true;
    else if (value === "--force") result.force = true;
    else if (value === "--all") result.skills = [];
    else if (value === "--help" || value === "-h") result.command = "help";
    else if (value.startsWith("-")) throw new Error(`未知选项：${value}`);
    else result.skills.push(value);
  }
  return result;
}

function selectedAgents(value) {
  if (!value) throw new Error("请使用 --agent 指定 codex、cursor、claude 或 all");
  const values = value === "all" ? Object.keys(agents) : value.split(",");
  for (const name of values) if (!agents[name]) throw new Error(`不支持的客户端：${name}`);
  return [...new Set(values)];
}

function selectedSkills(names) {
  const values = names.length ? names : catalog.skills.map((skill) => skill.name);
  return values.map((name) => {
    const skill = catalog.skills.find((item) => item.name === name);
    if (!skill) throw new Error(`不存在 skill：${name}`);
    return skill;
  });
}

function targetRoot(agent, global) {
  return global ? join(homedir(), agents[agent].global) : resolve(agents[agent].project);
}

async function checksum(path) {
  const hash = createHash("sha256");
  async function walk(current, relative = "") {
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const nextRelative = join(relative, entry.name);
      const next = join(current, entry.name);
      if (entry.isDirectory()) await walk(next, nextRelative);
      else {
        hash.update(nextRelative);
        hash.update(await readFile(next));
      }
    }
  }
  await walk(path);
  return hash.digest("hex");
}

async function exists(path) {
  try { await stat(path); return true; } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function mutate(options) {
  const version = JSON.parse(await readFile(join(root, "package.json"), "utf8")).version;
  for (const agent of selectedAgents(options.agent)) {
    const destinationRoot = targetRoot(agent, options.global);
    for (const skill of selectedSkills(options.skills)) {
      const source = join(root, skill.path);
      const destination = join(destinationRoot, skill.name);
      const present = await exists(destination);
      const marker = join(destination, ".one-skills.json");
      const owned = present && await exists(marker);
      const verb = options.command === "uninstall" ? "卸载" : present ? "更新" : "安装";
      console.log(`${options.dryRun ? "[预览] " : ""}${verb} ${skill.name} → ${destination}`);
      if (options.dryRun) continue;

      if (options.command === "uninstall") {
        if (present && !owned && !options.force) throw new Error(`${destination} 不是 one-skills 管理的目录；如确认删除请使用 --force`);
        if (present) await rm(destination, { recursive: true, force: true });
        continue;
      }
      if (options.command === "install" && present && !options.force) {
        throw new Error(`${destination} 已存在；使用 update 或 --force 覆盖`);
      }
      if (options.command === "update" && present && !owned && !options.force) {
        throw new Error(`${destination} 不是 one-skills 管理的目录；如确认覆盖请使用 --force`);
      }
      await mkdir(destinationRoot, { recursive: true });
      await rm(destination, { recursive: true, force: true });
      await cp(source, destination, { recursive: true });
      await writeFile(join(destination, ".one-skills.json"), JSON.stringify({
        package: "@coco-box/one-skills", version, skill: skill.name, agent, checksum: await checksum(source)
      }, null, 2) + "\n");
    }
  }
}

try {
  const options = parse(process.argv.slice(2));
  if (!options.command || options.command === "help") usage();
  else if (options.command === "list") {
    for (const skill of catalog.skills) console.log(`${skill.name}\t${skill.description}`);
  } else if (["install", "update", "uninstall"].includes(options.command)) await mutate(options);
  else throw new Error(`未知命令：${options.command}`);
} catch (error) {
  console.error(`错误：${error.message}`);
  process.exitCode = 1;
}
