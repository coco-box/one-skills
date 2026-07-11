# 贡献指南

## 提交前

- 一个 skill 只处理一个连贯的能力边界，名称使用小写字母、数字和短横线。
- `description` 同时说明“做什么”和“何时触发”，正文尽量控制在 500 行内。
- 参考资料、脚本和资产只在确有复用价值时加入，避免把临时审计产物发布进 skill 包。
- 文档和代码注释默认使用中文；外部标准术语可保留原文。
- 不在 skill 中执行未告知用户的网络请求、全局安装、提交、推送或破坏性操作。

运行以下检查：

```bash
pnpm check
pnpm test
pnpm pack
```

## 版本策略

遵循语义化版本：修正文案或兼容修复使用 patch，新增兼容能力或 skill 使用 minor，破坏 CLI 或 skill 契约使用 major。维护者通过 `pnpm release` 交互完成 npm 发布、Git 标签和 GitHub Release。
