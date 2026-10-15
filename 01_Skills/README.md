# 01_Skills：Skill 开发与生命周期管理

本目录是 Skill 的唯一权威开发区。每个 Skill 解决一个稳定、可复用的具体专业任务，包含指令、按需参考资料、必要脚本、示例和测试。

## 设计原则

- 小而可组合：不建立“全部诉讼案件处理”或“万能诉讼律师”超级 Skill。
- 真实需求优先：通常只有同类需求真实出现两次以上，且方法具有稳定复用价值，才优先沉淀为 Skill。
- 专业判断优先：固定专业标准、输入输出、决策门槛和质量检查；不把强模型本可灵活完成的普通机械动作写成长篇僵化步骤。
- 不含客户事实：不得写入真实客户身份、案件事实、未脱敏材料或可反推出具体 Matter 的敏感细节。
- 生命周期明确：新 Skill 默认为 `draft`；经过测试可进入 `testing`；只有律师确认并通过历史 Matter 或 Gold Standard 回归后才能标记 `validated`。
- 最小修改：一次失败不应导致通用 Skill 对单一案件过拟合。

## 建议目录

复制 `_SKILL_TEMPLATE/` 后按实际需要保留：

```text
skill-name/
├── SKILL.md
├── README.md
├── references/
├── examples/
├── scripts/
└── tests/
```

不需要的空目录可以删除。仅在重复逻辑需要确定性执行时增加脚本；大量条件性知识放入 `references/`，避免 `SKILL.md` 过长。

## 从草稿到验证

真实工作需求 → 汇总个人经验 → 研究公开最佳实践 → Skill draft → 律师审阅 → 历史 Matter 测试 → Eval → 最小修正 → 律师确认 `validated`。

具体流程见 `docs/HOW_TO_CREATE_SKILL.md` 与 `docs/HOW_TO_MODIFY_SKILL.md`。

## 激活给 Codex 使用

Codex 会从项目的 `.agents/skills/` 发现本地 Skill，而不会自动扫描本目录。为避免草稿自动触发：

1. 草稿、测试版和完整历史都保存在 `01_Skills/<skill-name>/`；
2. 仅在律师决定启用后，将该 Skill 以目录链接方式连接到 `.agents/skills/<skill-name>/`；
3. 链接必须指向本目录中的唯一权威版本，不复制出第二份可编辑副本；
4. 需要停用时移除链接，不删除本目录中的 Skill；
5. Skill 变更后记录版本与 Eval，并在必要时重启 Codex 使发现状态刷新。

激活/停用属于项目配置变更，应由律师明确提出，并记录到 `10_Logs/skill_change_log.md`。

律师已于2026-09-16明确决定，将当前18个项目业务Skill全部连接至`.agents/skills/`，用于真实案件中的受控使用和持续测试。此次激活不改变各Skill的`draft`状态，也不等于`validated`；每次发现问题仍须记录来源、影响、修订、版本和回归结果。
