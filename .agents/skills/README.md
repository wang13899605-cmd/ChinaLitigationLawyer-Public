# 已激活 Skills

Codex 会扫描本目录。运行安装脚本后，当前18个项目业务Skill可供自动发现；真实案件材料处理权限仍由使用者独立确认。

Skill 的唯一权威开发版本保存在 `01_Skills/<skill-name>/`。公开发行版的安装脚本会把18个Skill复制到本目录供Codex发现；这些副本属于本机配置，已被Git忽略，不应单独编辑。仓库更新后，显式全局入口直接读取权威版本；本目录的自动发现副本需重新同步。

## 当前激活清单

1. `claim-defense-basis-analysis`
2. `claim-element-evidence-matrix`
3. `client-interview-fact-characterization`
4. `confidentiality-output-check`
5. `damages-interest-calculation`
6. `lawyer-review-gate`
7. `legal-data-format-audit`
8. `litigation-chronology`
9. `litigation-document-qc`
10. `litigation-integrity-audit`
11. `matter-intake-workspace`
12. `matter-update-control`
13. `prc-evidence-review`
14. `prc-hearing-preparation-and-record`
15. `prc-jurisdiction-analysis`
16. `prc-legal-research`
17. `prc-litigation-draft-builder`
18. `procedure-deadline-control`

## 状态边界

- 激活表示Codex可根据任务自动发现并调用；不表示该Skill已经`validated`。
- 当前Skill继续保留各自文件内的`draft`状态，并以真实Matter作持续行为测试；输出仍受律师决策门槛、`REVIEW_REQUIRED`及对外提交规则约束。
- 后续任务自动组合调用全部真正适用的已激活Skill，不因尚未完成测试而跳过，也不为了测试而调用无关Skill。
- 律师发现遗漏、错误、过度提问、格式偏差或工作逻辑不合适时，可直接指出；修改后按版本、日志和回归要求处理。
- Codex在执行中自行发现Skill问题时，应立即说明涉及Skill、问题、影响、临时处理和建议修改范围；继续处理不受影响的工作。未经当次指令授权，不静默修改通用Skill。
- 外部候选库`01_Skills/_Candidate_Library/raw/`中的原始第三方Skill没有激活。
- 新任务通常会自动读取本目录；如当前任务未刷新Skill清单，重新打开项目或新建任务后生效。

具体创建、测试、修改、激活和停用方法见：

- `01_Skills/README.md`
- `docs/HOW_TO_CREATE_SKILL.md`
- `docs/HOW_TO_MODIFY_SKILL.md`
