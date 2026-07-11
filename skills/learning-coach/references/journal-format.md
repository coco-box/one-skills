# 学习档案规范

## 总体结构

`learning/` 是统一入口；每个独立学习目标使用一个自包含 track：

```text
learning/
├── INDEX.md
└── tracks/
    └── YYYY-MM-DD-<topic-slug>/
        ├── PROGRESS.md
        ├── plan.md
        ├── sessions/
        └── artifacts/
            └── phase-NN/
                └── NNN-<topic-slug>/
                    ├── lesson.md
                    ├── quiz.md
                    └── quiz-review.md
```

不要创建空目录、空模板或全局 `PROGRESS.md`。所有主题专属状态必须留在对应 track 内，避免多个主题互相污染。

## Track 标识与创建

目录名使用首次建档日期和稳定主题标识：`YYYY-MM-DD-<topic-slug>`。

- 日期使用用户所在时区的首次建档日期，后续续学不改名。
- slug 使用简短、可读、文件系统安全的 kebab-case；能自然表达时优先小写英文，否则可用简短中文并以短横线分隔。
- slug 表达长期学习目标，不使用单次课标题。例如使用 `ai-llm-math-foundations`，不要使用 `lesson-2-powers`。
- 同日同 slug 已存在且确为不同目标时追加 `-2`、`-3`；不要覆盖。
- 新建 track 后立即在 `learning/INDEX.md` 登记。

以下情况视为同一 track：目标和材料主体未变，只是换一种说法、进入新章节、调整计划或暂停后继续。仅当学习领域或独立成果目标发生实质变化时新建 track。

## 选择已有 Track

写入前先读取 `learning/INDEX.md`；索引缺失时扫描 `learning/tracks/*/PROGRESS.md` 重建最小索引。

按以下顺序选择：

1. 用户明确指定的目录、标题或材料对应的 track；
2. 与当前主题、目标、材料和最近会话一致的活动 track；
3. 只有一个活动 track 且用户仅说“继续上次”时，使用该 track；
4. 多个候选同样合理且选择会改变档案归属时，询问用户，不要猜测或新建重复 track。

## 统一索引

`learning/INDEX.md` 至少包含：track 标题、目录、状态、创建日期、最后学习日期、当前阶段和下一步。状态限定为 `active`、`paused`、`completed`。

每次留痕同步目标 track 的最后学习日期、当前阶段、下一步和状态。索引只做导航与跨主题概览，不复制详细进度、错题或完整计划。

## Track 内部文件

### 会话记录

文件名使用 `sessions/YYYY-MM-DD-NNN-slug.md`。编号在 track 内递增，优先读取该 track 的 `PROGRESS.md` 最后一条会话记录；没有历史记录时从 `001` 开始。

每份记录包含：

1. 背景与本次目标；
2. 关键结论；
3. 决策、假设与约定；
4. 产出物及仓库相对路径；
5. 待办复选框；
6. 与本 track 计划、进度和前次会话的关联。

仅保留帮助理解学习决策的少量关键原话。摘要必须脱离聊天上下文仍可理解。

### 进度与计划

每个 track 的 `PROGRESS.md` 至少维护：当前阶段、阶段进度、里程碑、会话索引、待办和薄弱点。每次留痕确保会话待办、track 进度和根索引一致，并为已完成里程碑附上该 track 内的证据路径。

只有目标、阶段或时间预算发生实质变化时才更新该 track 的 `plan.md`，并在会话记录中说明原因。

### 产出归档

先按阶段存入 `artifacts/phase-NN/`，阶段编号固定使用两位数，例如 `phase-01`、`phase-02`，保证按名称排序时顺序稳定。

每个知识点或紧密关联的学习单元使用一个 `NNN-<topic-slug>/` 目录：

- `NNN` 是该阶段内三位递增序号，从 `001` 开始；初始摸底等正式课程前置材料可使用 `000`。
- `<topic-slug>` 描述知识点或学习单元，例如 `001-functions-and-rate-of-change`。
- 同一知识单元的讲义、练习、答卷、批改与复测放在同一目录，不按文件类型分散到不同位置。
- 单元内优先使用稳定角色名：`lesson.md`、`quiz.md`、`quiz-response.md`、`quiz-review.md`、`homework.md`、`review.md`。
- 一个文件同时保存题目、用户作答和解析时使用 `quiz-review.md`，不要为了形式拆成空壳文件。
- 同一角色确有多份时追加三位序号，例如 `quiz-001.md`、`quiz-review-001.md`；不要使用含义不明的 `final-v2.md`。

跨多个知识点的周复盘或阶段综合测验，使用下一个独立有序单元，例如 `090-week-1-review/` 或 `099-phase-review/`。批改记录注明日期、表现证据、薄弱点和下一步，不只给分数。

## 旧结构迁移

若发现旧版 `learning/PROGRESS.md`、`learning/plan.md`、`learning/sessions/` 或 `learning/artifacts/`：

1. 从计划、进度和最早会话识别主题及首次建档日期；
2. 创建一个对应 track，并把旧版主题文件迁入；产物同时整理为 `artifacts/phase-NN/NNN-topic-slug/`；
3. 更新迁移文件中的仓库相对路径和相互引用；
4. 创建或更新 `learning/INDEX.md`；
5. 确认没有遗漏后移除已迁移的旧版主题入口，不保留两份可继续写入的副本；
6. 若旧目录混有多个主题，按内容拆分；归属不明确时停止并询问用户。
