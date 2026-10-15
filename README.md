# ChinaLitigationLawyer

这是一个面向中国民商事诉讼律师长期维护的本地 AI 工作系统。它不是 Prompt 仓库，也不能替代律师判断；它把案件材料、律师指令、可验证的工作方法、模板、确定性工具和质量评测组织成可持续迭代的工作流。本仓库为独立公开发行版，不包含真实案件材料和原私有仓库的 Git 历史。

## 核心目标

- 每个真实案件以独立 Matter 管理，事实和材料不串案。
- 重要事实、证据、法律依据与计算可定位、可复核、可重跑。
- AI 尽量完成可以完成的工作，把真正需要律师判断的问题集中呈交。
- Skills、Experience、Gold Standard 与 Evals 通过真实案件反馈不断改进。
- 原始材料、AI 草稿、律师批准稿和最终稿状态分明。

## 目录地图

| 目录 | 用途 |
|---|---|
| `00_System` | 全项目共用规则、Schema 与标准工作流 |
| `01_Skills` | Skill 的开发、测试和生命周期管理区 |
| `.agents/skills` | 运行安装脚本后创建的本机 Skill 发现副本；权威版本在 `01_Skills` |
| `02_Public_Knowledge` | 经核验的公开法律来源与索引 |
| `03_Private_Knowledge` | 律师个人的一般方法、策略笔记和行业认识 |
| `04_Experience` | 从真实案件抽象并脱敏的可复用经验 |
| `05_Templates` | 经律师确认的文书与工作成果模板 |
| `06_Gold_Standard` | 律师认可、可用于学习和评测的高质量成果 |
| `07_Evals` | Skill 与系统的评测标准、回归集和结果 |
| `08_Cases` | 相互隔离的真实案件 Matter |
| `09_Tools` | 计算、解析、核对等确定性工具 |
| `10_Logs` | Skill 与系统变更记录 |
| `11_Workflow_Website` | 本地可视化工作流、Skill中枢、模板上传和问题反馈工作台 |
| `12_Editable_Workflow_Flowchart` | 完全独立的可编辑流程图网站；可调整图示并受控直写现有Skill |
| `docs` | 面向律师的使用、维护和审阅说明 |

## 第一次使用

1. 先按 `INSTALL.md` 在本机安装入口并运行检查，再阅读 `docs/LAWYER_REVIEW.md`，确认七项政策性选择。未确认前，系统采用其中列出的保守默认值。
2. 阅读 `docs/MANUAL.md`，理解日常只需要接触的少数入口。
3. 新案件按 `docs/HOW_TO_RUN_MATTER.md` 创建 Matter，把原始材料复制到 `00_Original`，不得修改原件。
   如需从其他Codex项目或外部案件目录调用，使用全局 `$china-litigation-workflow`，见 `docs/HOW_TO_INVOKE_WORKFLOW_ANYWHERE.md`。
4. AI 的待判断事项集中查看 `LAWYER_QUESTIONS.md`；你的决定写入 `LAWYER_DECISIONS.md`。
5. 每个案件结束后，按匿名化要求提炼 Experience、选取 Gold Standard，并决定是否改进 Skill。

如需查看综合工作台、上传待处理模板或登记反馈，双击根目录的`启动工作流网站.cmd`。如需编辑流程图或直接修订现有Skill，双击`启动可编辑流程图.cmd`。两个网站互相独立、均只在本机开放，并实时读取本项目最新文件。

## 保密警告

`08_Cases` 中的真实案件默认不进入 Git。`03_Private_Knowledge`、`04_Experience`、`05_Templates` 和 `06_Gold_Standard` 也可能含有执业敏感信息：除非律师已确认完成脱敏、具有处理权限且允许进入相应远程仓库，否则不得推送到公共 Git 远程仓库或上传外部服务。

公开仓库仅包含通用工作流、经审查的空白模板及示例结构。使用者不得把真实案件目录、客户材料、内部意见或未审查的新模板提交到公开仓库。

## 当前阶段

安装后，18个项目业务Skill处于 `active_for_testing`，并可通过全局 `$china-litigation-workflow` 从任意Codex项目显式调用当前本地工作流；激活不等于 `validated`，个案结论和对外文件仍受律师审阅门槛控制。

## 许可与边界

仓库自有代码、文档、Skill及已获授权的空白母版按 `LICENSE` 中的 Apache-2.0 许可发布。法律、法院及机构原始材料若通过链接引用，其权利归各自权利人；本仓库不对具体案件提供法律意见。公开版的改动不会自动同步到作者的私有工作仓库。
