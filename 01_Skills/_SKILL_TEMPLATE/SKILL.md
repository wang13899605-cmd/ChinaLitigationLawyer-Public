---
name: skill-name
description: Replace this sentence with a concise description of the exact task this skill handles and the situations in which it should trigger.
---

# Skill Name

> 复制本母版后，先替换 `name`、`description`、标题和所有方括号占位内容；删除不需要的目录或章节。`name` 仅使用小写字母、数字和连字符，并与目录名一致。

## Metadata

| Field | Value |
|---|---|
| version | `0.1.0` |
| status | `draft` (`draft` / `testing` / `validated` / `deprecated`) |
| owner | `[LAWYER OR TEAM]` |
| last_reviewed | `[YYYY-MM-DD]` |
| validated_matters | `[]` |
| replaces | `null` |
| replaced_by | `null` |

## Purpose

[说明这个 Skill 解决的一个具体、稳定、可复用的专业任务，以及成功标准。]

## When to Use

- [列出应触发的任务、输入或工作阶段。]

## Do Not Use When

- [列出相近但不适用的场景，以及应改用的处理方式。]

## Required Inputs

- [完成任务所需的最低必要输入；说明缺失时是停止、提问还是降级继续。]

## Optional Inputs

- [能提高质量但不是继续工作前提的输入。]

## Dependencies

- Rules / Schemas: [仅列真正使用的项目规则或 Schema。]
- Knowledge / Experience: [按需列出，避免把真实案件事实写入 Skill。]
- Templates / Tools / Other Skills: [说明版本或调用边界。]

## Professional Principles

- [只固定能改变专业判断或质量的原则。]
- 遵守根目录 `AGENTS.md`；本节不复制通用保密、事实和审批规则。
- 允许 Agent 根据 Matter 实际情况调整非关键顺序，但不得跳过质量不变量。

## Workflow

1. [识别任务范围、输入和预期输出。]
2. [执行本 Skill 特有的专业分析。]
3. [保留事实、证据、法源、计算或其他必要追溯关系。]
4. [处理反方观点、例外和不利材料。]
5. [生成输出并执行质量检查。]

## Lawyer Decision Gates

- [只写本 Skill 特有、达到律师决策门槛的事项。]
- 通用门槛引用 `AGENTS.md` 与 `00_System/Rules/04_lawyer_decision_gate.md`，不要重复。

## Output

- Files: [输出文件名或命名规则。]
- Location: [输出到当前 Matter 的哪个目录。]
- Structure: [必须包含的章节或机器可读字段。]
- Status: [通常为 `AI_DRAFT` 或 `REVIEW_REQUIRED`。]

## Quality Checks

- [列出可观察、可验证的检查，而非“确保质量高”。]
- [检查是否遗漏不利证据、例外、冲突或关键输入。]
- [检查输出能否回溯到来源和当前 Matter。]

## Failure / Uncertainty Handling

- 资料缺失： [允许的降级输出与明确缺口。]
- 资料冲突： [并列冲突、分析影响、是否形成 Lawyer Question。]
- 工具失败： [保留输入与错误，采用可验证替代方案或停止受影响部分。]
- 超出范围： [说明交回通用任务或其他 Skill 的边界。]

## Examples

按需读取 `examples/`。示例必须脱敏，并说明它示范的是输入、输出还是边界情况；示例不构成当前 Matter 事实。

## References

按需读取 `references/` 中与当前子任务有关的文件。每个引用应说明“何时读取”，不要默认加载全部资料。

## Tests

- 回归用例位置：`tests/`
- 最低测试：至少一个正向用例、一个边界/失败用例；实质修改后至少跑一个既有历史 Matter 或 Gold Standard 对照。
- 评价标准：链接 `07_Evals/eval_rubric.md` 中真正相关的指标，并记录基线、变更后结果、退化和重大错误。

