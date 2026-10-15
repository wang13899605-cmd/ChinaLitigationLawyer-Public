# Legal AI Eval Rubric v0.1

## 使用方式

- 对每项相关指标按 `0–4` 评分：`0` 不可用，`1` 严重不足，`2` 部分达到，`3` 基本可靠，`4` 达到律师认可的目标标准。
- 不适用项标记 `N/A`，不得以零分代替。
- 除分数外必须记录具体遗漏、错误、来源和是否属于 Critical Error。
- 总分不能抵消重大错误：一项 Critical Error 即需要人工阻断，并通常不能升级 Skill 为 validated。

## 1. Key Issue Recall

是否识别律师预设或 Gold Standard 中的关键争点、请求/抗辩基础与决定性例外。建议同时报告“识别数 / 应识别数”。

## 2. Fact Accuracy

事实陈述是否与原始材料一致，主体、日期、金额、行为和程序状态是否正确；是否把推论或单方主张当成事实。

## 3. Evidence Traceability

重大事实和结论能否定位到正确 Evidence ID、文件及页码/表格行/消息位置；引用是否真正支持相应陈述。

## 4. Evidence Omission

是否遗漏关键有利、不利或相互冲突的证据。建议报告关键证据召回率及遗漏清单。

## 5. Unsupported Inference Rate

无来源或超出来源合理含义的实质推论占全部实质结论的比例；同时区分已明确标记的合理推论和伪装成事实的推论。

## 6. Adverse Evidence Recognition

是否识别对我方不利的事实、证据、规则、例外和对方最强反驳，而非只生成支持我方的材料。

## 7. Legal Authority Accuracy

法条、司法解释、案例、裁判文号、机关和规则内容是否真实、准确；引文是否支持结论。

## 8. Current-Law Accuracy

是否核验法律的现行有效状态、适用时间与法域；是否记录检索截止日期和潜在修法风险。

## 9. Calculation Accuracy

输入、口径、公式、期间、利率、舍入和结果是否可复算且正确；是否披露假设与不同口径结果。

## 10. Lawyer Question Quality

是否只提出真正需要律师判断的问题；问题是否具体、附带证据和影响、区分受阻与不受影响工作；是否遗漏必须升级的问题。

## 11. Drafting Quality

结构、表达、法律论证、对事实与证据的使用、格式适配和交付对象匹配度是否达到目标；不得用文采掩盖事实或法源问题。

## 12. Critical Error Count

至少包括：虚构法条/案例/证据；关键主体或金额错误；错过程序期限风险；跨 Matter 污染；未获授权泄露；擅自作出律师保留决定；将未审稿标为 FINAL；会实质损害客户权益的重大遗漏。

## 回归结果模板

```yaml
eval_id: "EVAL-YYYYMMDD-001"
skill: ""
skill_version_before: ""
skill_version_after: ""
test_set: []
model_and_tools: ""
scores_before: {}
scores_after: {}
improvements: []
regressions: []
critical_errors_before: []
critical_errors_after: []
reviewer: ""
recommendation: "keep / revise / revert / more_testing"
```

