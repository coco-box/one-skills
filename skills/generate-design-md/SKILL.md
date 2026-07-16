---
name: generate-design-md
description: 从本地前端项目、在线网站 URL、页面截图或这些来源的组合中提取可复用的视觉语言，生成符合 Google DESIGN.md 格式并参考 awesome-design-md 深度的 DESIGN.md、preview.html 与 preview-dark.html。用于分析现有产品界面、反向整理公开网站设计规则、把截图沉淀为设计系统、从代码和 CSS 提取设计 token、创建明暗设计系统预览，或为 AI 编码代理创建可执行的 UI 规范。
---

# 生成 DESIGN.md

把来源中的视觉事实整理为“精确 token + 组件规则 + 设计推理”，生成能指导编码代理稳定复现设计语言的 `DESIGN.md`，并用 `preview.html` 与 `preview-dark.html` 可视化验证默认和暗色环境。不要把文档写成品牌形容词清单，也不要假装推断值是官方规范。

## 执行流程

1. 识别输入为本地项目、在线 URL、截图或混合来源。
2. 阅读 [source-workflows.md](references/source-workflows.md)，在系统临时目录中完成取证；不得把截图、snapshot、computed-style JSON 或抓取缓存写入交付目录。
3. 阅读 [analysis-playbook.md](references/analysis-playbook.md)，建立证据表并归纳系统规律。
4. 阅读 [output-contract.md](references/output-contract.md)，复制 [DESIGN.template.md](assets/DESIGN.template.md)、[preview.template.html](assets/preview.template.html) 与 [preview-dark.template.html](assets/preview-dark.template.html) 到用户要求的位置；未指定时写到目标项目根目录的 `DESIGN.md`、`preview.html` 与 `preview-dark.html`。
5. 用事实替换全部占位符，删除不适用的可选内容。保持三个文件相互一致，不保留空章节。
6. 将本文档所在目录记为 `<skill-dir>`，运行 `python3 <skill-dir>/scripts/audit_design_md.py <DESIGN.md>`，再分别运行 `python3 <skill-dir>/scripts/audit_preview_html.py <preview.html> <DESIGN.md>` 与 `python3 <skill-dir>/scripts/audit_preview_html.py <preview-dark.html> <DESIGN.md>`。修复全部错误，并审阅每条警告。所有资源路径都相对于本 `SKILL.md` 所在目录解析。
7. 若环境允许且用户接受安装或下载依赖，再用 Google CLI 做增强校验；项目使用 pnpm 时直接运行 `pnpm dlx @google/design.md lint <DESIGN.md>`。Google CLI 是校验工具，不是生成 DESIGN.md 的必要条件。
8. 在桌面和移动端分别打开两个预览做视觉复核，检查 token、组件状态、主题差异、响应式重排和文本溢出；两个预览都必须可通过本地文件直接打开。
9. 删除临时取证目录。最终只把 `DESIGN.md`、`preview.html` 与 `preview-dark.html` 作为本技能产物交付；不要保留分析截图、JSON、Markdown snapshot、抓取 HTML、日志或中间脚本。

## 证据原则

按以下优先级处理冲突：项目内设计 token 和组件源码 > 浏览器 computed style > 多张截图中的重复规律 > 单张截图推断 > 通用设计惯例。

- 精确值必须有源码、computed style 或可测量截图支持。
- 只有截图时，使用合理的近似值，并在 `Source Scope & Confidence` 中标注推断范围。
- 区分营销站、产品界面、文档站和移动端，不要把不同系统强行合并。
- 至少采样导航、正文层级、主要操作、表单、卡片或列表、反馈状态和响应式变化。来源缺失时明确写出未观察项。
- 从重复出现的关系中命名语义 token，不要为每个原始色值创建无意义 token。
- 将“观察事实”和“设计解释”分开。解释必须能追溯到多个视觉证据。

## 输出要求

- 使用 YAML front matter 保存机器可读 token，使用 Markdown 说明为什么以及如何使用。
- 输出足以实现常见页面，但避免复制第三方商标、文案、插图、照片或专有字体文件。
- 分析第三方品牌时，将名称写成 `<品牌>-inspired design analysis`，并明确它是基于公开界面的非官方归纳。
- 为专有字体提供系统字体或开源字体替代方案。
- 为组件记录默认、hover、focus、active、disabled、error 等实际观察到的状态；未观察到的状态不要编造为事实。
- 同时写出 Do 与 Don't，尤其记录最容易把该设计做成“通用 SaaS 模板”的错误。
- 默认交付且只交付 `DESIGN.md`、`preview.html` 与 `preview-dark.html`。两个预览都是设计 token 与组件语法的标本页，不是原网站复刻、营销首页或业务产品实现。
- `preview.html` 展示来源的默认或主主题，`preview-dark.html` 展示暗色环境。来源只有暗色主题时，两者可以共享规范 token，但不得杜撰一套官方浅色主题。
- 来源没有可观察暗色主题时，将 `preview-dark.html` 标注为非规范暗色演示；只调整预览外壳与必要的可访问性对比，不把推导值回写成来源事实。

## 完成标准

只有同时满足以下条件才算完成：DESIGN 审计和两次预览审计均无错误；没有占位符；token 引用可解析；颜色、字体、间距和组件规则互相一致；响应式规则有证据或明确标为推断；第三方来源与不确定项已披露；两个预览均可离线打开并覆盖核心 token、组件和响应式行为；交付目录没有本技能产生的取证残留；另一名编码代理无需查看原来源即可做出风格一致的新页面。
