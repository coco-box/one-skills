# 三产物输出规范

默认交付恰好包含三个由本技能生成的文件：`DESIGN.md`、`preview.html` 与 `preview-dark.html`。前者是规范源，后两者是默认和暗色视觉验证面；截图、JSON、snapshot、日志和抓取缓存不属于交付物。

## 格式

文件由两部分组成：顶部 YAML front matter 保存规范值，Markdown 正文解释设计意图、使用方式与限制。YAML 中的 token 是规范值，正文不得与其冲突。

Front matter 只在有证据时添加 token，核心结构如下：

```yaml
---
version: alpha
name: Example
description: 一句话说明核心设计语言与分析范围。
colors: {}
typography: {}
rounded: {}
spacing: {}
components: {}
---
```

颜色使用合法 CSS 颜色。尺寸使用带单位的值。token 引用使用 `{colors.primary}`、`{typography.body-md}` 形式。字体 token 可包含 `fontFamily`、`fontSize`、`fontWeight`、`lineHeight`、`letterSpacing`、`fontFeature`、`fontVariation`。

组件优先使用 Google 规范可识别的属性：`backgroundColor`、`textColor`、`typography`、`rounded`、`padding`、`size`、`height`、`width`。边框、阴影、布局、图标和动效规则优先写入组件正文，避免制造大量未知 YAML 字段。

状态变体使用独立键，例如 `button-primary`、`button-primary-hover`、`button-primary-disabled`。

## DESIGN.md 正文章节

按以下顺序写存在的章节：

1. `Overview`
2. `Colors`
3. `Typography`
4. `Layout`
5. `Elevation & Depth`
6. `Shapes`
7. `Components`
8. `Do's and Don'ts`
9. `Responsive Behavior`
10. `Agent Prompt Guide`
11. `Source Scope & Confidence`

来源足够丰富时，可在标准章节内部增加 `### Brand & Accent`、`### Surface`、`### Text`、`### Semantic`、`### Font Family`、`### Hierarchy`、`### Grid & Container`、`### Touch Targets`、`### Collapsing Strategy` 与 `### Signature Components` 等三级标题。还可在标准章节之后增加 `Iteration Guide` 和 `Known Gaps`。不要为了模仿上游篇幅而填写无证据内容。

前八项沿用 Google 规范的主体顺序，后面三项是为了达到 `awesome-design-md` 风格的可执行深度。未知章节可保留，但不得重复标题。

## 内容深度

- `Overview`：用一段话说明产品类型、视觉气质、信息密度和最关键的 2 至 4 个辨识度杠杆。
- `Colors`：解释每个语义色的角色、组合与禁用方式，不重复罗列 YAML。
- `Typography`：写字体替代、层级表、字重和字距原则，以及数字或代码处理。
- `Layout`：写基础间距、容器、网格、section 节奏和常见布局模式。
- `Elevation & Depth`：定义表面层级、边框与阴影的使用条件。
- `Shapes`：定义圆角和固定比例元素的使用范围。
- `Components`：覆盖项目实际需要的核心组件及观察到的状态。
- `Do's and Don'ts`：至少各 4 条具体约束，聚焦辨识度与常见退化。
- `Responsive Behavior`：写有证据的断点和折叠策略；推断值必须标注。
- `Agent Prompt Guide`：提供一段简短的执行提示，引用 token 和关键规则，不复制原站文案。
- `Source Scope & Confidence`：列出分析日期、来源范围、视口、证据类型、高/中/低置信项和未观察内容。
- `Iteration Guide`（可选）：给出 5 至 8 条高价值的后续实现顺序和 token 使用纪律，不重复 Agent Prompt Guide。
- `Known Gaps`（可选）：集中列出字体许可、未覆盖产品表面、未观察状态、动画或素材限制。

## 预览页面契约

`preview.html` 与 `preview-dark.html` 都是可直接双击打开的单文件、响应式设计系统标本页。它们必须使用 `DESIGN.md` 的 token 和组件规则，不复刻来源站点的商标、原文案、图片、头像或投稿内容。

- `preview.html`：展示来源默认或主要主题。
- `preview-dark.html`：展示暗色主题或暗色承载环境，并在根元素添加 `data-preview-mode="dark"`。
- 来源原生支持明暗主题时，两个页面分别使用观察到的两套 token 和组件状态。
- 来源只有暗色主题时，两个页面可共享规范色板；`preview.html` 仍表示默认主题，`preview-dark.html` 明确表示暗色验证面，不反向虚构浅色主题。
- 来源没有暗色证据时，`preview-dark.html` 必须标注“非规范暗色演示”。派生值只服务预览外壳和可访问性，不得写入 `DESIGN.md` 或声称来自来源。

至少覆盖：

1. 简短的系统标题和 2 至 4 个辨识度杠杆。
2. 全部核心颜色 token，显示语义名、值和用途。
3. 实际字体层级，显示字号、字重、行高和字体替代；不得依赖专有字体文件。
4. 核心按钮及已观察状态、表单控件、卡片/列表、导航或工具栏。
5. 来源独有的一个或多个签名组件/编排模式。
6. spacing、rounded、border/elevation 的可视化标本。
7. 移动端重排；内容在约 390px 宽视口不横向溢出。

实现约束：

- 单文件内联 CSS 和必要的少量 JavaScript；不得生成额外 CSS、JS、图片或字体文件。
- 可使用系统字体栈；如使用网络字体，只能作为渐进增强，离线回退仍须可用。
- 所有示例操作使用中性占位文案，不链接或模拟真实品牌服务。
- 状态演示不得编造来源未观察到的精确颜色。建议状态可标为“建议”，或只在文档 Known Gaps 中披露。
- 两个预览都必须独立完整，不依赖另一个 HTML 文件运行。
- 不把预览做成营销 landing page。页面首屏应直接进入设计系统概览和 token 标本。
- 使用语义 HTML、可见 focus、合理触控目标和 `prefers-reduced-motion`；没有必要时不添加动画。

## 第三方分析声明

对公开第三方网站使用以下语义，不必逐字照抄：这是根据公开可见界面整理的非官方、启发式设计分析；token 可能随网站更新；商标、内容与专有资产不包含在可复用规范中。

## 质量门槛

- 不保留 `<PLACEHOLDER>`、`TODO`、`TO_FILL` 或空 token。
- 不为无法观察的状态、字体名称或断点制造伪精确值。
- 不把页面文案、商标和具体图片当作设计 token。
- 不用整页形容词代替组件级规则。
- 每个 front matter token 至少在正文、组件 token 或实现提示中有实际用途。
- 主文字和交互组件应满足合理的对比度与触控目标；发现来源本身不满足时记录事实，不要悄悄改写为官方值。
- YAML 中每个核心颜色、字体、圆角和间距值都应在两个预览中出现或被组件实际使用。
- 两个预览与 DESIGN.md 不得出现相互冲突的色值、字号、圆角、组件尺寸或断点。
- 最终回复只列出三个交付文件；临时证据必须已删除。用户明确要求保留证据时除外。
