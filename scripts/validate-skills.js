import { readFile, readdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const catalog = JSON.parse(await readFile(join(root, "skills.json"), "utf8"));
const errors = [];
const declared = new Set();

for (const skill of catalog.skills) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skill.name)) errors.push(`${skill.name}：名称格式无效`);
  if (declared.has(skill.name)) errors.push(`${skill.name}：名称重复`);
  declared.add(skill.name);
  const directory = join(root, skill.path);
  try {
    if (!(await stat(directory)).isDirectory()) errors.push(`${skill.path}：不是目录`);
    const content = await readFile(join(directory, "SKILL.md"), "utf8");
    const name = content.match(/^name:\s*(.+)$/m)?.[1]?.trim();
    const description = content.match(/^description:\s*(.+)$/m)?.[1]?.trim();
    if (name !== skill.name) errors.push(`${skill.name}：目录清单与 SKILL.md 名称不一致`);
    if (!description) errors.push(`${skill.name}：缺少单行 description`);
    if (content.split("\n").length > 500) errors.push(`${skill.name}：SKILL.md 超过 500 行`);
  } catch (error) { errors.push(`${skill.name}：${error.message}`); }
}

for (const entry of await readdir(join(root, "skills"), { withFileTypes: true })) {
  if (entry.isDirectory() && !declared.has(entry.name)) errors.push(`${entry.name}：未登记到 skills.json`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}
console.log(`校验通过：${catalog.skills.length} 个 skill`);
