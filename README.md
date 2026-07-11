# one-skills

个人维护、可分享的 Agent Skills 集合。一个 npm CLI 将同一份 skill 安装到 Codex、Cursor 和 Claude Code，支持项目级与用户级安装、按需选择、更新、卸载和预览。

## 快速开始

发布到 npm 后，无需全局安装：

```bash
# 查看可用 skill
pnpm dlx @coco-box/one-skills list

# 给当前项目的 Codex 安装一个 skill
pnpm dlx @coco-box/one-skills install learning-coach --agent codex

# 给三个客户端安装全部 skill
pnpm dlx @coco-box/one-skills install --agent all

# 安装到当前用户；可用 codex、cursor、claude 或逗号分隔组合
pnpm dlx @coco-box/one-skills install --agent codex,claude --global

# 更新或卸载
pnpm dlx @coco-box/one-skills update --agent all
pnpm dlx @coco-box/one-skills uninstall learning-coach --agent cursor
```

使用 npm/npx 时，把 `pnpm dlx` 换成 `npx` 即可。

安装目标：

| 客户端 | 项目级 | 用户级 |
|---|---|---|
| Codex | `.codex/skills/` | `~/.codex/skills/` |
| Cursor | `.cursor/skills/` | `~/.cursor/skills/` |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |

项目级目录适合随项目提交并与团队共享；用户级目录适合跨项目使用。安装器复制完整 skill 包，并写入 `.one-skills.json` 记录来源版本。

## CLI

```text
one-skills list
one-skills install [skill...] --agent <codex,cursor,claude|all> [--global] [--dry-run] [--force]
one-skills update [skill...] --agent <...> [--global] [--dry-run]
one-skills uninstall [skill...] --agent <...> [--global] [--dry-run]
```

- 未给 skill 名时处理全部 skill。
- `--dry-run` 只展示将发生的文件变更。
- `install` 遇到同名目录会停止，避免覆盖用户文件；使用 `update` 或明确传入 `--force`。
- `update` 用当前 npm 包内版本替换目标 skill，只覆盖带 one-skills 安装标记的目录。要先获取最新版，可使用 `pnpm dlx @coco-box/one-skills@latest update ...`。

## 仓库结构

```text
skills/                    # 唯一事实来源：每个子目录是一个独立 skill
  learning-coach/
    SKILL.md
    references/
    scripts/
bin/one-skills.js          # 无运行时依赖的跨平台 CLI
skills.json                # 对外 skill 清单
scripts/validate-skills.js # 静态校验
test/                      # CLI 集成测试
.github/workflows/         # CI 与 npm 发布
```

## 维护一个 skill

1. 在 `skills/<name>/` 新建或修改 `SKILL.md`；目录名必须与 frontmatter 的 `name` 一致。
2. 大段参考资料放进 `references/`，确定性或重复性操作放进 `scripts/`，模板等输出资源放进 `assets/`。
3. 在 `skills.json` 登记新 skill。
4. 执行：

   ```bash
   pnpm check
   pnpm test
   pnpm pack
   ```

5. 运行 `pnpm release`，在交互界面中选择检查、版本更新、CHANGELOG、npm 发布和 Git 发布步骤。

skill 应保持单一、可辨认的能力边界。只有当两个能力经常共同触发、共享状态并构成同一闭环时才合并；若能独立安装、独立复用或拥有不同安全边界，则维持拆分。

## npm 首次发布

1. 确认 npm 组织 `@coco-box` 已创建，并且发布账号具有该组织的包发布权限。
2. 执行 `npm login --registry https://registry.npmjs.org/` 完成 npm 登录。
3. 确保工作区干净且位于 `main` 分支，然后执行 `pnpm release`。

交互脚本默认执行检查、选择版本、生成更新日志、发布 npm、提交并推送标签，以及通过 `gh` 创建 GitHub Release。GitHub 仅用于源码和版本记录，skill 的安装与更新始终通过 npm。

### 交互式发布

```bash
pnpm release
```

发布脚本会：

1. 让你多选本次执行的步骤；
2. 检查干净工作区、`main` 分支、Git remote、npm 登录状态、测试和打包；
3. 交互选择 `patch`、`minor`、`major` 或自定义 SemVer；
4. 根据上一个 Git 标签以来的提交生成 `CHANGELOG.md`；
5. 二次确认后向 `https://registry.npmjs.org/` 发布 `@coco-box/one-skills`；
6. 提交版本文件、创建 `vX.Y.Z` 标签、推送，并尝试创建 GitHub Release。

配置位于 `scripts/release.config.cjs`。可以通过 `ONE_SKILLS_NPM_REGISTRY`、`ONE_SKILLS_NPM_TAG` 和 `ONE_SKILLS_RELEASE_BRANCH` 临时覆盖配置，仓库中不保存 npm Token。

## 当前 skills

- `learning-coach`：整合学习计划、辅导、练习与解析、错题诊断、动态复盘，以及用户明确要求时的项目留痕。

## 兼容性说明

仓库采用通用的 Agent Skills 目录结构：每个 skill 都以带 `name` 和 `description` frontmatter 的 `SKILL.md` 为入口，额外资源按需加载。各客户端仍可能调整发现路径；CLI 将路径差异集中在一个映射中，后续只需更新安装器而无需复制 skill 内容。

## 许可证

[MIT](LICENSE)
