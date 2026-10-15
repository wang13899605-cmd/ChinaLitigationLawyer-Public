# 00_System

本目录保存所有 Matter 和 Skills 共用的稳定规则、机器可读数据结构和生命周期工作流。

- `Rules/`：按主题拆分的执行细则；不得复制 `AGENTS.md` 全文。
- `Schemas/`：面向 Agent 与脚本的简洁 YAML 数据合同。
- `Workflows/`：新建 Matter、律师问题闭环和结案流程。

当前跨案件规则还包括 `Rules/09_template_selection_and_fidelity.md`：新案件自动形成文书计划、选择 Word 母版并执行版式保真核验。

修改本目录前应确认该规则确实跨案件、跨 Skill 适用；只适用于某项工作的内容应放进对应 Skill，只适用于某个案件的内容应放进该 Matter。
