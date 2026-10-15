# 如何运行一个 Matter

本项目既支持 `08_Cases/<Matter>`，也支持通过全局 `$china-litigation-workflow` 指定的其他绝对本地目录。后者的详细调用方法见 `docs/HOW_TO_INVOKE_WORKFLOW_ANYWHERE.md`；两种模式适用相同的事实、证据、法源、计算、模板、保密、律师门槛和输出状态规则。

## A. Intake：建立案件

1. 从 `_MATTER_TEMPLATE` 复制，分配唯一 Matter ID。
2. 填写案件名称、客户、我方地位、对方、法域、程序阶段、目标、期限和保密等级。
3. 把当前特殊要求写入 `LAWYER_INSTRUCTIONS.md`。
4. 确认材料来源和处理边界。公开发行版没有预置真实客户材料的处理授权；使用者须先按 LR-01 确认当前 AI 环境及 Matter 的处理范围，并遵守更严格的客户、律所或法律限制。不得由内部处理授权推定可向其他服务上传、公开或纳入共享测试/训练数据。
5. 一次性确认主动期限提醒：是否启用、接收人、提醒方式和覆盖期限类型。未确认或不同意时，Codex只维护台账和风险清单。

## B. Original：复制原始材料

- 只复制，不移动、不改名、不覆盖来源原件。
- 保留来源路径、复制日期和目录关系；条件允许时记录哈希。
- `00_Original` 视为只读。OCR、转录、批注、裁剪、格式转换进入 `02_Extracted`。

## C. Index：先知道有什么

在 `01_Index` 记录文件名、类型、日期、主体、版本、页数/工作表、可读性、重复关系和异常。优先识别程序性文件、合同体系、核心往来、付款凭证、鉴定材料和既有裁判文书。

### 客户补充新证据

- 优先放入 `00_Original/Client_Supplements/YYYY-MM-DD_batch-N/`，每批单独建目录并保留客户原始文件名和目录关系。
- 不覆盖上一批同名文件；重复件、旧版本和新版本均保留，并在 `01_Index/EVIDENCE_INTAKE_LOG.md` 记录关系。
- 告诉Codex当前Matter和绝对路径，并要求执行新证据增量更新。
- Codex先核对路径，再自动一次性询问缺少的来源/接收方式、实际接收日期和可选说明；如处理授权尚未记录，也在同一次提问中确认。
- 你回答后，Codex执行正式登记、哈希/完整性检查、去重、Evidence ID、证据审查和影响传播；不得改动原文件。
- 对话框附件仅视为临时输入，除非已经另存进Matter并完成登记，不得声称其已进入正式案卷。

### 收到法院、仲裁机构或其他程序文件

- 将新传票、通知、裁定、送达记录或平台截图放入当前Matter的 `00_Original/` 下，并保留原文件名；变更通知不能覆盖旧通知。
- 告诉Codex当前Matter和新文件的绝对路径，要求“执行程序文件与期限增量更新”。
- 如果你没有同时说明，Codex会一次性询问：来源/接收方式、实际接收日期和时间、是否变更或替代此前通知、可选说明。
- 你回答后，Codex登记程序文件，区分文书日期、发送日期、实际接收日和法律触发日，核验规则，复算受影响期限，更新庭审卡、期限台账、文书计划和提醒计划。
- 新的开庭安排由Codex先更新为 `REVIEW_REQUIRED`，再由律师确认；任何提交是否完成以平台成功记录、回执、缴费凭证或送达凭证为准。

### 主动期限提醒

- Matter中的 `reminder_policy` 是授权依据。`authorized` 时，达到确认门槛且在授权范围内的期限可自动创建或更新提醒；`unconfirmed` 或 `disabled` 时只维护 `DEADLINE_REGISTER.yaml` 和风险清单。
- 默认关键期限提醒点为14/7/3/1日前，普通期限为7/3/1日前；不足7日立即提示并重排。该提醒计划不改变法定或指定截止时间。
- 本地项目的主动提醒依赖ChatGPT桌面应用的计划任务能力；运行时电脑需开机、桌面应用需运行，且项目目录仍可访问。期限台账始终是正式审计记录，不能仅依赖通知。

## D. Model：建立案件模型

按需形成：

1. 当事人与关系；
2. 关键事实与时间线；
3. 请求、抗辩、反请求和程序问题；
4. 无争议、争议、未知与冲突事实；
5. 争点与构成要件；
6. 举证责任与证据映射；
7. 不利证据、证据缺口和补证；
8. 法律依据与相反观点；
9. 金额、利息和期限计算；
10. 主位、备位和最低方案。

### 管辖分析

- 起诉前、收到起诉材料或管辖发生变化时，调用 `prc-jurisdiction-analysis`。
- Codex先建立请求/当事人分析单元和管辖事实矩阵，再依次核验专属/专门/集中管辖、级别、协议、法定地域、竞合法院及在先程序。
- 固定更新 `JURISDICTION_FACTS.yaml`、`JURISDICTION_AUTHORITY_TABLE.md`、`JURISDICTION_AGREEMENT_CARD.md`、`JURISDICTION_CANDIDATE_MATRIX.md` 和 `JURISDICTION_MEMO.md`。
- AI应提供首选、备选、高风险和不建议方案及对方最强异议；最终起诉法院或是否提出、放弃、撤回管辖异议由律师确认。
- 管辖异议、上诉或其他期间交给G4计算和提醒，G19不自行静默计算期限。

### 请求权、抗辩和诉讼方案分析

- 在事实与证据初步整理后、起草起诉状/答辩状/反诉状/代理意见前，调用 `claim-defense-basis-analysis`。
- Codex从当事人实际行为和目标出发，区分案由、法律基础、诉讼请求及事实理由，建立我方请求、对方请求、各类抗辩、反诉和程序主张候选池。
- 每个保留候选交给 `claim-element-evidence-matrix` 核对要件、事实、证据与举证责任；期限交G4、管辖交G19、金额交G16（建立后）处理。
- 固定更新 `LEGAL_RELATIONSHIP_MAP.yaml`、`CLAIM_DEFENSE_CANDIDATES.yaml`、`THEORY_COMPATIBILITY_MATRIX.md`、`RELIEF_BASIS_MAPPING.md`、`CLAIM_DEFENSE_OPTIONS.md` 和 `LEGAL_ISSUE_TREE.md`。
- Codex应先给出主位、备位、条件性和防御方案及理由，列出淘汰路径、致命要件、对方最强理论、自认/矛盾/重复获偿风险；不得只把问题抛给律师。
- 最终请求、抗辩、反诉、诉讼处分、主备位结构、当事人及对外案件理论由律师确认。

## E. Lawyer Loop：只问高价值问题

达到决策门槛的事项写入 `LAWYER_QUESTIONS.md`。每个问题说明为什么重要、证据、AI 初步意见、受阻输出和可继续工作。你的答案写入 `LAWYER_DECISIONS.md` 后，只重跑受影响部分。

## F. Draft 与 Final

- 先维护 Matter 根目录的 `DOCUMENT_PLAN.md`，由 Codex 根据地位、阶段、目标、程序文件和期限判断需要哪些文书；
- 起草时按 `prc-litigation-draft-builder` 核对当前Matter输入及律师决定，读取 `05_Templates/TEMPLATE_INDEX.yaml`，优先复制精确匹配的 Word 母版并保留其字体、行距、表格和分页规则；无可对照母版时才适用已确认的默认字体、数字字体及段落规则；
- 每份草稿在 `08_Drafts/DRAFT_REGISTER.md` 登记DOC ID、版本、模板、起草依据、待决事项、侧车审阅记录及QC结果；旧版本不覆盖；
- 用现有 `litigation-document-qc` 检查内容、证据法源、跨文书一致性及逐页版式；未完成渲染或存在重大缺陷时，不称为可供最终审批；
- `08_Drafts`：AI_DRAFT / REVIEW_REQUIRED；
- `09_Final`：只有律师明确批准的具体版本及用途；
- `10_Archive`：旧版本和阶段性归档，不用于替代原始材料。

正式对外提交或发送始终需要实际授权；文件已标 FINAL 也不等于已授权发送。

当前G8仍为`draft`，但已于2026-09-16连接`.agents/skills/`并激活用于真实案件持续测试。Codex应在起草诉讼文书时自动识别并调用；G8专业标准和自动调用均不等于Skill已经通过律师验证，具体文书仍须审阅。

## F.1 Hearing：开庭准备与庭后材料

- 律师上传新的开庭或变更通知后，先执行G4程序文件登记、期限更新和开庭安排确认；正式开庭前要求Codex读取 `01_Skills/prc-hearing-preparation-and-record/SKILL.md`，更新 `HEARING_PREP_REGISTER.md`。
- 每次正式开庭都要有两份**独立**的待审DOCX：使用 `TPL-HRG-002` 的庭审提纲和使用 `TPL-LAW-003` 的法律规定整理/法律法规汇编。前者匹配本次庭审活动与争点，后者按诉请或争点逐条核验官方法源、版本、检索日期及适用时间；两份文件法条栏目均照录完整原文，保留全部款项及标点。法规汇编不写案例或适用分析；均登记DOC ID、版本和逐页QC。
- 庭后把正式笔录、律师笔记、法院要求或个人说明放入当前Matter并告知路径。Codex一次性补问缺少的来源及实际接收日期，更新 `HEARING_SESSION_LOG.md`、`HEARING_FOLLOWUP_REGISTER.md`，再将期限交G4、新证据交G3、方案变化交G5、补充文书交G8处理。
- 没有正式笔录时不得说“笔录核对完成”；涉及承认、请求变更、放弃、和解或申请笔录补正，由律师判断。所有对外提交仍须单独授权。
- G10当前仍为`draft`，但已激活用于真实案件持续测试；收到正式开庭安排或庭后材料时，Codex应自动识别并调用。庭审记录和材料的正式性由来源决定，不由AI整理后的文件名决定。

## G. Close：结案与沉淀

按 `00_System/Workflows/close_matter.md` 核对后续期限、最终文件、留档和复盘。Experience、Gold Standard、Skill 修改和 Eval 都需经过脱敏、验证和律师决定，不自动发生。

## 常用指令

### 从任意Codex项目调用最新版工作流

```text
调用 $china-litigation-workflow，处理案件文件夹：<案件绝对路径>。
本次任务是：<具体任务>。
```

每次调用均从你在全局入口 Skill 中配置的 `FRAMEWORK_ROOT` 读取最新保存的规则、Skills、模板和工具，不使用复制的旧版本。

### 继续一个 Matter

```text
请处理 08_Cases/[Matter]。先读取 matter.yaml、LAWYER_INSTRUCTIONS.md、LAWYER_DECISIONS.md 和未回答的 LAWYER_QUESTIONS.md，再完成 [具体任务]。不要修改 00_Original；只使用当前 Matter 的事实。结果放入 [目标目录]，状态为 AI_DRAFT 或 REVIEW_REQUIRED。
```

### 检查当前进度

```text
请只读检查 08_Cases/[Matter] 的当前状态，向我报告：材料索引、事实/证据/法律/分析完成度、开放的律师问题、临近期限、主要缺口和建议下一步。不要修改文件。
```

### 处理客户补充证据

```text
请处理Matter：08_Cases/[Matter]。
客户补充证据位置：[绝对路径]。
请执行新证据增量更新。
```

Codex随后自动询问缺少的批次来源/接收方式、实际接收日期和可选说明；你回答后才完成正式登记和后续更新。

### 跨流程处理一批新材料

当同一批资料可能同时影响证据、期限、法律分析或既有文书时，可直接说：

```text
请处理Matter：08_Cases/[Matter]。
本次新材料位置：[绝对路径]。
请先读取 01_Skills/matter-update-control/SKILL.md，按G14增量更新流程核对接收信息、保留旧版本、分析影响并选择性更新相关成果；需要我决定的事项集中提出。不要发送或提交任何文件。
```

Codex会合并询问尚缺的来源与实际接收日期，并在`06_Analysis/MATTER_UPDATE_REGISTER.md`留下批次、变化、专责流程和版本记录。G14目前是`draft`，首次真实案件使用时请明确指定Skill路径并核查结果。

### 计算诉讼请求金额或对方金额主张

```text
请处理Matter：08_Cases/[Matter]。
请先读取 01_Skills/damages-interest-calculation/SKILL.md，对[请求/抗辩对应的金额项目]进行来源核对、法律/合同口径分流及可复算测算。关键口径有争议时先给出并列方案和你的初步意见，再集中问我；不要自行确定最终诉讼请求金额或修改已批准文书。
```

计算记录在`06_Analysis/MONETARY_TRANSACTIONS.md`及`MONETARY_CALCULATIONS.md`。Codex先报告能支持的金额数字，再给逐笔来源、扣减及公式表；律师已确认的金额可以先明确呈现，同时记录尚缺的原生凭证。未另指示利息时先做一年期LPR命名情景，但须核该案法定利率、归责与起算，不能把LPR当普遍可获支持的结论；未指示律师费则不列。内置工具只处理参数明确的分段单利及部分付款；复杂损失、复利、外币或执行特殊利息必须另行确定适用方法。G16当前为`draft`，真实案件使用需核查源数据、独立复核和文书数字。

### 处理新的程序文件或开庭通知

```text
请处理Matter：08_Cases/[Matter]。
新程序文件位置：[绝对路径]。
请执行程序文件与期限增量更新。
```

Codex随后自动补问缺少的接收元数据，更新期限及庭审信息，并把必须由律师判断的冲突、临期或权利丧失风险写入 `LAWYER_QUESTIONS.md`。

### 执行管辖分析

```text
请处理Matter：08_Cases/[Matter]。
请调用 prc-jurisdiction-analysis，完成当前阶段的管辖分析。列出全部合理候选法院、管辖协议效力、专属/专门/集中及级别管辖、对方最强异议、首选和备选方案；把最终法院或是否提出管辖异议提交我确认，并将相关期限交给G4。
```

### 执行请求权、抗辩和诉讼方案分析

```text
请处理Matter：08_Cases/[Matter]。
请调用 claim-defense-basis-analysis，结合当前事实、证据和现行法，建立并筛选我方请求、对方可能请求、抗辩、反诉及程序主张候选；形成主位、备位、条件性和防御方案，列明理论兼容性、精确救济、致命要件、对方最强路径和被淘汰方案。要件证据交给S3，期限交G4，管辖交G19，金额交G16。请先给出你的推荐，再把最终策略问题提交我确认。
```

### 测试G8文书起草

```text
请处理Matter：08_Cases/[Matter]。请先读取 01_Skills/prc-litigation-draft-builder/SKILL.md，按照 DOCUMENT_PLAN.md 为当前必需的[文书类型]制作待审稿。优先使用匹配的Word母版；无可对照母版时使用已确认的默认排版。请登记版本，完成逐页渲染和独立质检，交付DOCX、质检说明及需要我决定的问题。不要签署、盖章、发送、上传或标记定稿。
```

### 结案复盘

```text
请按 close_matter 工作流为 08_Cases/[Matter] 准备结案复盘草稿。不要删除或移动原始材料；不要自动创建 validated Experience、Gold Standard 或修改 Skill。只提出可沉淀候选和脱敏风险，等我决定。
```
