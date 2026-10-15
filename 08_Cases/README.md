# 08_Cases：真实案件 Matter

每个案件必须是一个独立 Matter。不同 Matter 的事实、证据、客户指令、策略、中间产物和最终稿不得混放。

## 新建方式

1. 复制 `_MATTER_TEMPLATE/`，命名为 `YYYY-NNN_简短案件名`；
2. 填写 `matter.yaml` 与 `LAWYER_INSTRUCTIONS.md`；
3. 经授权后把来源材料“复制”到 `00_Original/`，不得移动或修改来源原件；
4. 按 `00_System/Workflows/new_matter.md` 建索引、事实、证据、法律、分析和草稿；
5. 律师问题与决定分别集中记录，不只保留在聊天中。

详细说明见 `docs/HOW_TO_RUN_MATTER.md`。

## 与外部案件目录的关系

`08_Cases/` 是默认推荐位置，但不是调用整套工作流的必要条件。律师可在其他本地目录建立一案一目录，并通过全局 `$china-litigation-workflow` 指定绝对路径；系统仍实时读取本项目的最新规则、Skills、模板和工具。外部 Matter 必须维持相同目录结构、隔离、原件只读、版本、审阅和保密要求，且应另行核对该位置是否被 Git 跟踪或云盘同步。

## 安全边界

- `_MATTER_TEMPLATE` 不得含真实客户数据。
- `.gitignore` 默认排除除本说明与母版之外的全部 `08_Cases` 内容。
- 不得因此推定允许云端处理或上传；是否允许取决于律师对具体 Matter 的明确指令和律所规则。
- `09_Final` 只接收律师确认的指定版本；AI 不能自行标记最终。
