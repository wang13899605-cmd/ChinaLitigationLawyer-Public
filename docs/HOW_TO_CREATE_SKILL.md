# 如何创建一个 Skill

## 何时值得创建

优先满足三个条件：

1. 该任务真实出现过至少两次，或虽只出现一次但高频、关键且方法稳定；
2. 固定方法能明显降低遗漏、错误或返工，而不只是把提示词写长；
3. 能用历史 Matter、Gold Standard 或可观察标准验证效果。

一次性个案策略、客户专属事实、普通模型自然能完成的机械操作通常不应做成通用 Skill。

## 标准流程

真实工作需求 → 搜集自身经验 → 公共最佳实践研究 → Skill draft → 律师 review → 历史 Matter 测试 → Eval → 修改 → validated → 律师决定是否激活。

## 第一步：先研究，不急着写

你可以直接说：

```text
我要开始设计 [skill-name] Skill。

目标：[这个 Skill 解决的具体任务]
我的经验：[列出你实际采用的方法、常见错误和边界]
希望输出：[文件、表格、结论或检查清单]
可用于测试的历史 Matter / Gold Standard：[如有，只给路径或名称，不复制敏感内容]

先不要写 Skill。请先：
1. 阅读 AGENTS.md、01_Skills/README.md 和 _SKILL_TEMPLATE；
2. 检查是否已存在功能重叠的 Skill；
3. 研究必要的官方规则、公开最佳实践和相关 Legal AI 工作流；
4. 将“建议吸收、建议不吸收、与我的经验冲突、需要我决定”的内容分别汇报；
5. 不上传任何真实案件材料，不修改项目文件。
```

## 第二步：确认设计后再落盘

```text
根据我们已经确认的设计，创建 01_Skills/[skill-name]/。

要求：
1. 使用 01_Skills/_SKILL_TEMPLATE，但删除不需要的空目录和占位文字；
2. SKILL.md 的 name、description 和目录名一致，描述清楚触发边界；
3. 只固定真正影响专业判断与质量的规则；
4. 不复制 AGENTS.md 的通用规则；
5. 不含真实客户身份或未脱敏案件事实；
6. 新版本标记为 0.1.0 / draft；
7. 建立至少一个正向测试和一个边界/失败测试；
8. 使用相关 Eval 指标形成基线；
9. 运行结构校验和测试；
10. 更新 10_Logs/skill_change_log.md；
11. 暂不连接到 .agents/skills，不自动 commit。

完成后列出文件、设计取舍、测试结果和仍需律师决定的问题。
```

## 第三步：测试与验证

- 测试输入与律师/Gold Standard 答案隔离，避免模型看到答案后“复述正确”。
- 至少比较：关键问题识别、事实准确、证据可追溯、不利材料、法律依据、计算、律师问题和重大错误。
- 记录基线与新版；有重大退化或 Critical Error 时保持 testing 或回退。
- 只有律师明确确认后把 `status` 改为 `validated`。

## 第四步：激活

验证后你可以说：

```text
请激活 01_Skills/[skill-name]。先确认其 status=validated、结构校验通过且最近回归没有 Critical Error；然后在 .agents/skills/ 建立指向该 Skill 权威目录的链接，不复制第二份可编辑副本。更新 skill_change_log。不要修改其他 Skill，也不要配置远程仓库。
```

Codex 会自动发现 Skill 变更；若界面未出现，再重启 Codex。官方用法支持显式调用（例如 `$skill-name`）和基于 description 的隐式匹配。
