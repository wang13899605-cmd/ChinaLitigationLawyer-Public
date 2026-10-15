# 安装与使用（Windows / Codex）

本仓库提供通用工作流和空白模板，不包含真实案件材料。建议先克隆到本机受控目录，并确保新案件材料不会进入公开 Git。

## 安装

1. 安装 Git、Node.js 和 Codex；确保 PowerShell 中的 `git`、`node` 命令可用。
2. 克隆本仓库到你选择的本地目录。不要克隆到公开同步的客户材料目录。
3. 在仓库根目录运行：

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File .\setup\Install-Workflow.ps1 -CheckOnly
   powershell -NoProfile -ExecutionPolicy Bypass -File .\setup\Install-Workflow.ps1
   ```

   安装脚本只在本机复制18个项目 Skill 到 Codex 发现目录，并把 `$china-litigation-workflow` 复制到你的 Codex Skills 目录，写入当前克隆的绝对路径。若目标位置已有同名 Skill，脚本会停止，不会覆盖。重启 Codex 或新开任务后再调用。`01_Skills` 始终是权威版本；安装副本只供发现，不应直接编辑。

4. 双击 `启动工作流网站.cmd` 或 `启动可编辑流程图.cmd` 可在本机查看网站。它们只监听 `127.0.0.1`，并非通过 GitHub 托管的公开网站。

## 开始案件

推荐为每个真实案件建立独立的受控文件夹，并在新 Codex 项目中明确说：

```text
调用 $china-litigation-workflow，处理案件文件夹：<案件绝对路径>。
本次任务是：<需要完成的事项>。
请先读取材料、建立索引，告知我需要判断的问题；不要发送或提交对外文件。
```

若未安装全局入口，也可将本仓库作为 Codex 项目，直接提供 Matter 路径和任务；Codex 应按仓库 `AGENTS.md` 和适用 Skill 工作。具体文件结构、模板选用和律师审阅门槛见 `README.md` 与 `docs/MANUAL.md`。

## 更新

在本机仓库执行 `git pull` 后，已安装的全局入口仍指向同一克隆路径，显式调用会读取更新后的 `01_Skills`；但 `.agents/skills` 中供自动发现的18个副本不会自动刷新。更新后应请 Codex核对并重新同步这些副本。若移动或重新克隆仓库，先人工检查旧入口，再在新目录重新安装；安装脚本不会自动覆盖旧入口。

不要将真实案件材料、网站反馈日志、评测结果、临时上传模板或私有经验提交到公开仓库。新模板须先检查权属、脱敏、元数据和版式，再决定是否公开。
