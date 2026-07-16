# one-skills

个人维护、可分享的 Agent Skills 集合。一个 npm CLI 将同一份 skill 安装到 Codex、Cursor 和 Claude Code，支持项目级与用户级安装、按需选择、更新、卸载和预览。

## 安装

无需全局安装 CLI，推荐始终使用 npm 上的最新版本：

```bash
# 查看当前提供的 skill
pnpm dlx @coco-box/one-skills@latest list
```

### 安装单个 skill

```bash
# 学习规划、辅导、练习、复盘与留痕
pnpm dlx @coco-box/one-skills@latest install learning-coach --agent codex

# 从项目、网站或截图生成 DESIGN.md 与明暗预览
pnpm dlx @coco-box/one-skills@latest install generate-design-md --agent codex
```

将 `codex` 换成 `cursor` 或 `claude`，即可安装到对应客户端的当前项目目录。

### 安装多个或全部 skill

```bash
# 一次安装指定的两个 skill
pnpm dlx @coco-box/one-skills@latest install \
  learning-coach generate-design-md \
  --agent codex

# 给当前项目的三个客户端安装全部 skill
pnpm dlx @coco-box/one-skills@latest install --agent all

# 安装到当前用户，供所有项目使用
pnpm dlx @coco-box/one-skills@latest install --agent codex,cursor,claude --global
```

使用 npm 时，可以把 `pnpm dlx` 换成 `npx`：

```bash
npx @coco-box/one-skills@latest list
```

安装目标：

| 客户端      | 项目级            | 用户级              |
| ----------- | ----------------- | ------------------- |
| Codex       | `.codex/skills/`  | `~/.codex/skills/`  |
| Cursor      | `.cursor/skills/` | `~/.cursor/skills/` |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |

项目级目录适合随项目提交并与团队共享；用户级目录适合跨项目使用。安装器复制完整 skill 包，并写入 `.one-skills.json` 记录来源版本。

## 使用

安装后不需要执行额外命令。Codex、Cursor 或 Claude Code 会读取对应目录中的 `SKILL.md`，并在请求匹配时自动使用 skill；也可以在提示中直接点名 skill。

### `learning-coach`

适合学习计划、备考安排、练习与解析、错题诊断、复盘调整，以及用户明确要求时的项目学习留痕。

示例：

```text
请使用 learning-coach，根据我每周 6 小时的时间，制定一个 8 周的线性代数学习计划。
```

```text
继续上次的机器学习数学学习，先读取 learning/INDEX.md 和对应 track，给我安排今天的课程和测验，结束后记录本次进度。
```

学习档案采用多主题结构：

```text
learning/
├── INDEX.md
└── tracks/
    └── YYYY-MM-DD-topic-slug/
        ├── PROGRESS.md
        ├── plan.md
        ├── sessions/
        └── artifacts/
```

### `generate-design-md`

适合从本地前端项目、公开网站 URL、页面截图或混合来源中提取设计 token、组件规则与设计推理，并生成：

- `DESIGN.md`
- `preview.html`
- `preview-dark.html`

示例：

```text
请使用 generate-design-md，分析当前前端项目的组件、CSS 和设计 token，在项目根目录生成 DESIGN.md、preview.html 和 preview-dark.html。
```

```text
请根据这个公开网站 URL 和我提供的移动端截图整理一套非官方设计系统，明确哪些值来自证据、哪些是推断，并生成明暗预览。
```

该 skill 会运行自带的 Python 审计脚本检查 token 引用、占位符、预览结构和文档一致性。分析网站或截图时，客户端仍需具备相应的浏览器、截图或联网能力。

## 更新与卸载

```bash
# 更新当前项目 Codex 中的一个 skill
pnpm dlx @coco-box/one-skills@latest update learning-coach --agent codex

# 更新当前项目三个客户端中的全部 skill
pnpm dlx @coco-box/one-skills@latest update --agent all

# 更新用户级安装
pnpm dlx @coco-box/one-skills@latest update --agent codex,cursor,claude --global

# 卸载指定 skill
pnpm dlx @coco-box/one-skills@latest uninstall generate-design-md --agent cursor
```

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
  generate-design-md/
    SKILL.md
    agents/
    assets/
    references/
    scripts/
bin/one-skills.js          # 无运行时依赖的跨平台 CLI
skills.json                # 对外 skill 清单
scripts/validate-skills.js # 静态校验
test/                      # CLI 集成测试
.github/workflows/         # 持续集成检查
```

## 当前 skills

- `learning-coach`：整合学习计划、辅导、练习与解析、错题诊断、动态复盘，以及用户明确要求时的项目留痕。
- `generate-design-md`：从本地前端项目、在线网站或截图中提取可复用的视觉语言，生成 `DESIGN.md`、`preview.html` 与 `preview-dark.html`，并执行一致性审计。

## 兼容性说明

仓库采用通用的 Agent Skills 目录结构：每个 skill 都以带 `name` 和 `description` frontmatter 的 `SKILL.md` 为入口，额外资源按需加载。各客户端仍可能调整发现路径；CLI 将路径差异集中在一个映射中，后续只需更新安装器而无需复制 skill 内容。

## 许可证

[MIT](LICENSE)
