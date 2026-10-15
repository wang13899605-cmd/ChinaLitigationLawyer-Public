# 诉讼 Skill 候选清单

- 盘点日期：2026-09-06
- 原始候选：73 个
- 当前项目业务Skill：18个已于2026-09-16激活，用于受控真实案件测试；仍未标记为`validated`
- 当前原始候选状态：73个候选快照均未验证、未激活
- 律师决定：2026-09-06暂时接受本清单的默认建议；2026-09-16进一步决定激活已经完成项目化重建的18个业务Skill。后者不包括`raw/`第三方候选，不授权直接启用未经中国法适配和安全审查的外部Skill。

## 一、结论与使用原则

“先广泛搜集，再筛选精进”的方向可行；“把所有候选直接激活”不可行。外部 Skill 的最大价值是提供任务拆分、检查点和输出结构，不是直接提供可依赖的中国法律结论。

本轮采取以下处理：

1. 下载到 `raw/<source>/`，保留来源分组；
2. 不连接到 `.agents/skills/`；
3. 不把原始快照提交 Git；
4. 后续按 `A/B/C/D/E` 决定逐个吸收、重建或删除；
5. 任何进入正式区的 Skill 都必须服从根目录 `AGENTS.md`，删除外国法默认值、外部发送动作和不具备的工具依赖，并通过回归测试。

## 二、过去工作中实际出现过的 Skills

以下数据来自本机既有 Codex 任务记录中对 `SKILL.md` 的明确读取痕迹；数字为出现该 Skill 的不同任务记录数，用于判断使用频度，不等同于质量评价。

| Skill | 历史记录数 | 当前来源 | 初步建议 | 你的决定 |
|---|---:|---|---|---|
| `documents` | 47 | OpenAI 运行时 | `C`：Word 创建、修订、评论和版式核验的基础依赖，不复制改写 |  |
| `bankruptcy-restructuring-lawyer` | 41 | 本机个人 Skill | `A`：高价值，但应作为破产专业域而非一般诉讼总规则 |  |
| `legal` | 34 | 本机个人 Skill | `B`：过于宽泛，与 `AGENTS.md` 重叠，提取有效方法后不直接激活 |  |
| `data-format-audit` | 30 | 本机个人 Skill | `A`：表格、金额、Word 表格和格式核验高度相关，优先适配 |  |
| `pdf` | 27 | OpenAI 运行时 | `C`：PDF 提取、渲染和核验基础依赖，不复制改写 |  |
| `spreadsheets` | 21 | OpenAI 运行时 | `C`：证据表、金额表、债权表等基础依赖 |  |
| `computer-use` | 9 | OpenAI 运行时 | `C/D`：只在必须操作图形界面时使用，不作为法律 Skill |  |
| `contract-review` | 6 | 本机第三方 Skill | `D`：可用于合同争议前置审查，但 CUAD/域外假设需重点改造 |  |
| `mqc-litigation-visual-redraw` | 3 | 本机个人 Skill | `A`：诉讼时间线、关系图和流程图的成熟专项能力 |  |
| `presentations` | 3 | OpenAI 运行时 | `C/D`：汇报或可视化时调用，不属于核心诉讼分析 |  |
| `law` | 2 | 本机个人 Skill | `B/E`：与 `legal`、`AGENTS.md` 重叠，名称和范围过宽 |  |
| `template-creator` | 1 | OpenAI 运行时 | `C`：将律师认可的 Word/Excel/PPT 转成可复用模板时使用 |  |

历史任务还出现过浏览器、飞书、GitHub 和深度研究等 Skills。它们属于检索、通信或软件协作能力，不应复制为本项目诉讼 Skill；尤其飞书发送属于外部动作，仍需遵守 Matter 授权和对外发送规则。

本轮已把六个本机个人 Skill 快照放入 `raw/local-history/`：

- `bankruptcy-restructuring-lawyer`
- `contract-review`
- `data-format-audit`
- `law`
- `legal`
- `mqc-litigation-visual-redraw`

## 三、OpenAI 官方候选（2 个）

来源：https://github.com/openai/skills

| Skill | 可能用途 | 初步建议 | 你的决定 |
|---|---|---|---|
| `pdf` | PDF 阅读、创建、渲染和视觉核验 | `C`：当前桌面环境已有更新的运行时版本；候选快照仅作来源留档 |  |
| `transcribe` | 庭审录音、访谈或会议音频转录 | `D`：有用，但应先明确录音合法性、保密、说话人识别和人工校对规则 |  |

## 四、Themis 诉状起草候选（12 个）

来源：https://github.com/Themis-Legal-Framework/themis-skills ｜ MIT ｜ 法域中立设计，但表达和诉状结构仍偏英美法。

| Skill | 初步建议 | 你的决定 |
|---|---|---|
| `claims-and-elements-builder` | `A`：吸收“请求/抗辩—要件—事实”方法 |  |
| `convert-facts-to-numbered-allegations` | `B`：改造成中国诉状“事实与理由”组织方法 |  |
| `draft-amended-pleading` | `D`：待建立中国程序变更诉请/补充事实规则后处理 |  |
| `draft-answer-and-defenses` | `A`：吸收答辩逐项回应和避免不利自认方法 |  |
| `draft-complaint` | `A`：作为起诉状 Skill 的结构参考，必须重建 |  |
| `draft-counterclaims-crossclaims-thirdparty` | `D`：大量概念与中国程序不对应 |  |
| `exhibit-and-attachment-plan` | `A`：改造成证据目录、证明目的和提交计划 |  |
| `litigation-drafting-core` | `B`：只提取通用起草原则，避免形成第二套总规则 |  |
| `overlay-jurisdiction-pleadings` | `A`：改造成中国法院/仲裁机构格式覆盖层 |  |
| `overlay-style-and-voice` | `A`：可承载所属律所及个人行文风格 |  |
| `pleading-qc-and-risk-audit` | `A`：优先改造成诉讼文书提交前质检 Skill |  |
| `pleadings-core` | `B`：与项目规则合并去重，不直接启用 |  |

## 五、AgentCounsel 候选（30 个）

来源：https://github.com/zgbrenner/agentcounsel ｜ MIT ｜ 方法结构较好，但法律内容和术语主要面向美国。

### 5.1 优先吸收或重建

| Skill | 初步建议 | 你的决定 |
|---|---|---|
| `create-matter-workspace` | `A`：新案件自动建档入口参考 |  |
| `legal-intake-triage` | `A`：接案分类和路由参考 |  |
| `matter-intake` | `A`：与本项目八项核心信息合并 |  |
| `litigation-chronology` | `A`：事实时间线核心候选 |  |
| `claim-chart` | `A`：请求/抗辩要件与证据矩阵核心候选 |  |
| `assumption-audit` | `A`：识别推断、缺失事实和隐含前提 |  |
| `citation-integrity-check` | `A`：法条、案例和引用完整性检查 |  |
| `hallucination-red-team` | `A`：事实和法源幻觉专项检查 |  |
| `source-validation` | `A`：来源存在性、权威性和有效性检查 |  |
| `attorney-review-gate` | `A`：与现有律师审批门槛整合 |  |
| `privilege-confidentiality-check` | `A`：改造成保密、脱敏和外发检查 |  |
| `red-team-verifier` | `A`：最终法律成果反方压力测试 |  |
| `research-plan` | `A`：法律检索计划 |  |
| `legal-research-memo` | `A`：法律研究备忘录 |  |
| `authority-synthesis` | `A`：多个法源的规则归纳与冲突处理 |  |
| `statutory-interpretation` | `A`：法条解释工作表方法 |  |
| `risk-assessment` | `A`：风险等级、前提和行动建议 |  |
| `legal-prose-polish` | `B`：作为最后表达层，不得掩盖事实或法源缺陷 |  |
| `output-format-compliance-check` | `A`：检查模板、交付对象和格式要求 |  |
| `brief-section-drafter` | `B`：改造成代理意见/法律分析分节起草 |  |

### 5.2 暂缓或仅作域外程序参考

| Skill | 原因 | 初步建议 | 你的决定 |
|---|---|---|---|
| `litigation-cold-start-interview` | 用于建设实践画像，而非处理案件 | `D` |  |
| `case-brief` | 美国判例法式 case brief；中国案例定位不同 | `B/D` |  |
| `negative-treatment-check` | 依赖类似 citator 的判例负面处理体系 | `D` |  |
| `demand-letter` | 诉前催告可用，但非首轮核心 | `D` |  |
| `deposition-prep` | deposition 非中国民诉常规程序 | `E` |  |
| `discovery-response-workflow` | 美国 discovery/RFA/interrogatory 体系 | `E` |  |
| `legal-hold` | 可借鉴证据保全意识，但制度语境不同 | `B/D` |  |
| `motion-opposition-drafter` | 美国 motion practice 结构 | `E` |  |
| `privilege-log-review` | 依赖美国 privilege/discovery 机制 | `E` |  |
| `subpoena-triage` | 美国 subpoena 机制 | `E` |  |

## 六、中文版 litigation-legal 候选（19 个）

来源：https://github.com/CSlawyer1985/claude-for-legal-ZH ｜ Apache-2.0。

这些文件虽然是中文，但约有大量 `CLAUDE.md` 和 `~/.claude/` 路径依赖，且多数仍保留英美诉讼概念。建议主要用于中文输出结构比较，不直接启用。

| Skill | 初步建议 | 你的决定 |
|---|---|---|
| `chronology` | `A/B`：与 AgentCounsel 时间线候选比较后重建 |  |
| `claim-chart` | `A/B`：证据矩阵输出值得吸收 |  |
| `matter-intake` | `A/B`：与现有 Matter Schema 合并 |  |
| `matter-workspace` | `A/B`：与本项目目录结构比较 |  |
| `matter-briefing` | `A`：案件阶段性简报候选 |  |
| `matter-update` | `A`：新增材料后的增量更新候选 |  |
| `matter-close` | `B`：与现有结案工作流比较 |  |
| `brief-section-drafter` | `B`：改造成中国诉讼文书分节起草 |  |
| `demand-intake` | `D`：诉前函件阶段备用 |  |
| `demand-draft` | `D`：诉前函件阶段备用 |  |
| `demand-received` | `D`：诉前函件阶段备用 |  |
| `oc-status` | `D`：对方律师沟通记录备用 |  |
| `portfolio-status` | `D`：多案件组合管理，暂非当前核心 |  |
| `cold-start-interview` | `D`：实践画像访谈，后续使用 |  |
| `customize` | `E`：面向原 Claude 插件的配置工具 |  |
| `deposition-prep` | `E`：不符合中国常规程序 |  |
| `legal-hold` | `B/D`：仅吸收证据保存方法 |  |
| `privilege-log-review` | `E`：制度依赖不匹配 |  |
| `subpoena-triage` | `E`：制度依赖不匹配 |  |

## 七、Midpage 候选（4 个）

来源：https://github.com/midpage-ai/litigation-skills ｜ MIT。

这些 Skill 依赖 Midpage MCP 和订阅，并主要面向美国判例、docket 和法院规则。当前环境没有该依赖，因此不能直接使用。

| Skill | 可借鉴内容 | 初步建议 | 你的决定 |
|---|---|---|---|
| `cite-check` | 引用逐项核验、无法核验时明确标记 | `B` |  |
| `draft-brief` | 研究先行、反方观点、法院规则核验 | `B` |  |
| `draft-long-form-memo` | 客观预测型长篇法律备忘录 | `B` |  |
| `litigation-update-post` | 对外公开诉讼动态文章 | `D/E` |  |

## 八、建议你优先决定的第一批

不建议一次审查 73 个文件。第一轮只需要决定以下 12 项：

1. `matter-intake`：是否作为新案件入口；
2. `create-matter-workspace`：是否与其合并；
3. `litigation-chronology` / `chronology`：选择哪套方法作为底稿；
4. `claim-chart` / `claims-and-elements-builder`：选择证据矩阵底稿；
5. `assumption-audit`：是否作为每次重大分析的必做检查；
6. `source-validation`；
7. `citation-integrity-check`；
8. `hallucination-red-team`；
9. `attorney-review-gate`；
10. `pleading-qc-and-risk-audit`；
11. `data-format-audit`；
12. `bankruptcy-restructuring-lawyer` 是否保留为独立专业域。

建议默认决定：第 1—11 项进入“吸收并重建”；第 12 项保留为破产重整专项体系，不并入一般诉讼 Skill。

律师于 2026-09-06 暂时接受上述默认决定。每个新 Skill 仍须分别完成重复用途检查、草稿、测试、律师审阅和激活步骤。

## 九、下一步审查方式

律师无需逐行审查外部英文 Skill。对每个优先候选，应由 Codex先形成一页中文比较报告：

- 它解决什么问题；
- 哪些方法值得吸收；
- 哪些内容不适用中国大陆诉讼；
- 哪些条款与本项目规则冲突；
- 建议形成的新 Skill 名称、输入、输出和律师决策门槛；
- 建议 `A/B/C/D/E`。

律师只需确认专业取舍。确认后再创建本项目自己的 Skill，不直接在第三方原件上打补丁。
