import http from "node:http";
import { createReadStream, existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SITE_ROOT = path.dirname(fileURLToPath(import.meta.url));
const FRAMEWORK_ROOT = path.resolve(SITE_ROOT, "..");
const PUBLIC_ROOT = path.join(SITE_ROOT, "public");
const DATA_ROOT = path.join(SITE_ROOT, "data");
const LAYOUT_PATH = path.join(DATA_ROOT, "graph-layout.json");
const SKILLS_ROOT = path.join(FRAMEWORK_ROOT, "01_Skills");
const ACTIVE_SKILLS_ROOT = path.join(FRAMEWORK_ROOT, ".agents", "skills");
const WORKFLOW_PATH = path.join(FRAMEWORK_ROOT, "docs", "LITIGATION_LIFECYCLE_ACTION_MATRIX.md");
const TEMPLATE_INDEX_PATH = path.join(FRAMEWORK_ROOT, "05_Templates", "TEMPLATE_INDEX.yaml");
const SKILL_CHANGE_LOG = path.join(FRAMEWORK_ROOT, "10_Logs", "skill_change_log.md");
const DIRECT_EDIT_LOG = path.join(FRAMEWORK_ROOT, "10_Logs", "workflow_editor_direct_edits.json");
const BACKUP_ROOT = path.join(FRAMEWORK_ROOT, "10_Logs", "workflow_editor_backups");
const HOST = "127.0.0.1";
const PORT = Number(process.env.WORKFLOW_EDITOR_PORT || 4327);
const MAX_BODY_BYTES = 1024 * 1024;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

const readText = (target) => fs.readFile(target, "utf8");
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const cleanText = (value, max = 4000) => String(value ?? "").trim().slice(0, max);
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());

async function readJson(target, fallback) {
  try {
    return JSON.parse(await readText(target));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function atomicWrite(target, content) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  await fs.writeFile(temporary, content, "utf8");
  await fs.rename(temporary, target);
}

function stripMarkdown(value = "") {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/\\\|/g, "|")
    .trim();
}

function scalar(value = "") {
  const cleaned = value.trim().replace(/^['"]|['"]$/g, "");
  if (cleaned === "true") return true;
  if (cleaned === "false") return false;
  if (cleaned === "null") return null;
  return cleaned;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const result = {};
  for (const line of match[1].split(/\r?\n/)) {
    const entry = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (entry) result[entry[1]] = scalar(entry[2]);
  }
  return result;
}

function parseMetadata(content) {
  const result = {};
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\|\s*(version|status|owner|last_reviewed|validated_matters|sources)\s*\|\s*(.*?)\s*\|$/);
    if (match) result[match[1]] = stripMarkdown(match[2]);
  }
  return result;
}

function splitTableRow(line) {
  return line
    .replace(/^\|/, "")
    .replace(/\|\s*$/, "")
    .split(/(?<!\\)\|/)
    .map(stripMarkdown);
}

async function listSkillDirectories() {
  const entries = await fs.readdir(SKILLS_ROOT, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_") && /^[a-z0-9-]+$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

async function resolveSkillFile(name) {
  if (!/^[a-z0-9-]+$/.test(name)) throw Object.assign(new Error("Skill名称无效"), { status: 400 });
  const known = await listSkillDirectories();
  if (!known.includes(name)) throw Object.assign(new Error("未找到Skill"), { status: 404 });
  const target = path.join(SKILLS_ROOT, name, "SKILL.md");
  if (!existsSync(target)) throw Object.assign(new Error("Skill缺少SKILL.md"), { status: 404 });
  const realRoot = await fs.realpath(SKILLS_ROOT);
  const realTarget = await fs.realpath(target);
  if (!realTarget.startsWith(`${realRoot}${path.sep}`)) throw Object.assign(new Error("Skill路径越界"), { status: 403 });
  return realTarget;
}

async function loadSkills() {
  const names = await listSkillDirectories();
  const skills = [];
  for (const name of names) {
    const target = await resolveSkillFile(name);
    const content = await readText(target);
    const frontmatter = parseFrontmatter(content);
    const metadata = parseMetadata(content);
    const stat = await fs.stat(target);
    skills.push({
      name,
      displayName: frontmatter.name || name,
      description: frontmatter.description || "",
      version: metadata.version || "未标注",
      status: metadata.status || "未标注",
      owner: metadata.owner || "",
      lastReviewed: metadata.last_reviewed || "",
      active: existsSync(path.join(ACTIVE_SKILLS_ROOT, name)),
      relativePath: path.relative(FRAMEWORK_ROOT, target).replaceAll("\\", "/"),
      modifiedAt: stat.mtime.toISOString(),
      hash: sha256(content),
    });
  }
  return skills;
}

async function loadSkillDetail(name) {
  const target = await resolveSkillFile(name);
  const content = await readText(target);
  return {
    name,
    content,
    hash: sha256(content),
    frontmatter: parseFrontmatter(content),
    metadata: parseMetadata(content),
    relativePath: path.relative(FRAMEWORK_ROOT, target).replaceAll("\\", "/"),
  };
}

async function loadWorkflow(skillNames) {
  const content = await readText(WORKFLOW_PATH);
  const lines = content.split(/\r?\n/);
  const codeMap = {};
  for (const line of lines) {
    const mapping = line.match(/^\|\s*((?:S|G)\d+)\s*\|\s*`([^`]+)`/);
    if (mapping) codeMap[mapping[1]] = mapping[2].split("：")[0];
  }

  const stages = [];
  let current = null;
  let tableStarted = false;
  lines.forEach((line, index) => {
    const heading = line.match(/^###\s+([A-T])\.\s+(.+)$/);
    if (heading) {
      current = { code: heading[1], title: heading[2].trim(), note: "", actions: [], sourceLine: index + 1 };
      stages.push(current);
      tableStarted = false;
      return;
    }
    if (!current) return;
    if (!tableStarted && line.startsWith(">")) {
      const note = stripMarkdown(line.replace(/^>\s?/, ""));
      current.note = [current.note, note].filter(Boolean).join(" ").slice(0, 1000);
      return;
    }
    if (/^\|\s*ID\s*\|/.test(line)) {
      tableStarted = true;
      return;
    }
    if (!tableStarted || !/^\|\s*[A-T]-?\d{2}\s*\|/.test(line)) return;
    const cells = splitTableRow(line);
    if (cells.length < 5) return;
    const [id, action, output, support, specialist] = cells;
    const codes = [...new Set(`${support} ${specialist}`.match(/\b(?:S|G)\d+\b/g) || [])];
    const linkedSkills = codes
      .map((code) => ({ code, name: codeMap[code] || "" }))
      .filter((item) => item.name && skillNames.has(item.name));
    const coverage = /缺失/.test(support) ? "missing"
      : /部分/.test(support) ? "partial"
      : /(完整|已建立|已覆盖|v0\.)/.test(`${support} ${specialist}`) ? "covered"
      : "rule";
    const lawyerGate = /(律师|确认|决定|审批|门槛|不代决定)/.test(`${output} ${support} ${specialist}`);
    current.actions.push({ id, action, output, support, specialist, coverage, lawyerGate, linkedSkills, sourceLine: index + 1 });
  });

  for (const stage of stages) {
    const uniqueSkills = new Map();
    stage.actions.flatMap((action) => action.linkedSkills).forEach((skill) => uniqueSkills.set(skill.name, skill));
    stage.skills = [...uniqueSkills.values()];
    stage.coverage = {
      covered: stage.actions.filter((item) => item.coverage === "covered").length,
      partial: stage.actions.filter((item) => item.coverage === "partial").length,
      missing: stage.actions.filter((item) => item.coverage === "missing").length,
      rule: stage.actions.filter((item) => item.coverage === "rule").length,
    };
  }

  return {
    version: content.match(/^#\s+.*?v([\d.]+)/m)?.[1] || "未标注",
    updated: content.match(/最近更新：`([^`]+)`/)?.[1] || "未标注",
    hash: sha256(content),
    stages,
    actionCount: stages.reduce((sum, stage) => sum + stage.actions.length, 0),
  };
}

async function loadTemplates() {
  const content = await readText(TEMPLATE_INDEX_PATH);
  const templates = [];
  let current = null;
  for (const line of content.split(/\r?\n/)) {
    const id = line.match(/^\s{2}-\s+id:\s*(.+)$/);
    if (id) {
      current = { id: scalar(id[1]) };
      templates.push(current);
      continue;
    }
    if (!current) continue;
    const field = line.match(/^\s{4}([a-zA-Z0-9_]+):\s*(.*)$/);
    if (field) current[field[1]] = scalar(field[2]);
  }
  return templates.map((item) => ({
    id: item.id,
    title: item.title || item.id,
    documentType: item.document_type || "",
    stage: item.stage || "",
    enabled: item.enabled_for_ai_draft === true,
    path: item.path || "",
  }));
}

async function loadLayout() {
  return readJson(LAYOUT_PATH, { schemaVersion: "1.0", updatedAt: null, positions: {}, labels: {}, notes: {} });
}

async function buildSystemPayload() {
  const skills = await loadSkills();
  const workflow = await loadWorkflow(new Set(skills.map((skill) => skill.name)));
  const templates = await loadTemplates();
  return {
    generatedAt: new Date().toISOString(),
    frameworkRoot: FRAMEWORK_ROOT,
    workflow,
    skills,
    templates,
    directEdits: (await readJson(DIRECT_EDIT_LOG, [])).slice(0, 50),
    layout: await loadLayout(),
    stats: {
      stageCount: workflow.stages.length,
      actionCount: workflow.actionCount,
      skillCount: skills.length,
      activeSkillCount: skills.filter((skill) => skill.active).length,
      templateCount: templates.length,
    },
  };
}

function parseSemver(value) {
  const match = String(value || "").match(/^(\d+)\.(\d+)\.(\d+)$/);
  return match ? match.slice(1).map(Number) : null;
}

function semverGreater(next, previous) {
  const a = parseSemver(next);
  const b = parseSemver(previous);
  if (!a || !b) return false;
  for (let index = 0; index < 3; index += 1) {
    if (a[index] > b[index]) return true;
    if (a[index] < b[index]) return false;
  }
  return false;
}

function applyManagedMetadata(content, newVersion) {
  let updated = content.replace(/^\|\s*version\s*\|\s*`?[^|`]+`?\s*\|$/m, `| version | \`${newVersion}\` |`);
  updated = updated.replace(/^\|\s*last_reviewed\s*\|\s*`?[^|`]+`?\s*\|$/m, `| last_reviewed | \`${today()}\` |`);
  return updated;
}

function validateSkillContent(name, content, previousVersion, newVersion) {
  const errors = [];
  const warnings = [];
  if (content.length < 200 || content.length > 250000) errors.push("SKILL.md长度异常");
  if (/\u0000/.test(content)) errors.push("文件包含无效空字符");
  const frontmatter = parseFrontmatter(content);
  if (frontmatter.name !== name) errors.push(`frontmatter name必须保持为 ${name}`);
  if (!frontmatter.description || frontmatter.description.length < 20) errors.push("frontmatter description缺失或过短");
  const metadata = parseMetadata(content);
  if (!metadata.version) errors.push("Metadata缺少version");
  if (!metadata.status) errors.push("Metadata缺少status");
  if (!semverGreater(newVersion, previousVersion)) errors.push(`新版本必须高于当前版本 ${previousVersion}`);
  if (metadata.status !== "draft") warnings.push("当前项目Skill通常保持draft，除非已经完成律师确认的验证升级");
  if (!/^#\s+/.test(content.replace(/^---[\s\S]*?---\s*/, ""))) warnings.push("正文没有一级标题");
  return { errors, warnings };
}

function diffSummary(before, after) {
  const a = before.split(/\r?\n/);
  const b = after.split(/\r?\n/);
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start += 1;
  let aEnd = a.length - 1;
  let bEnd = b.length - 1;
  while (aEnd >= start && bEnd >= start && a[aEnd] === b[bEnd]) {
    aEnd -= 1;
    bEnd -= 1;
  }
  return {
    startLine: start + 1,
    removedLines: Math.max(0, aEnd - start + 1),
    addedLines: Math.max(0, bEnd - start + 1),
    before: a.slice(start, Math.min(aEnd + 1, start + 14)).join("\n"),
    after: b.slice(start, Math.min(bEnd + 1, start + 14)).join("\n"),
  };
}

async function externalSkillValidation(name, content) {
  const profile = process.env.USERPROFILE || process.env.HOME || "";
  const python = path.join(profile, ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "python", "python.exe");
  const validator = path.join(profile, ".codex", "skills", ".system", "skill-creator", "scripts", "quick_validate.py");
  if (!existsSync(python) || !existsSync(validator)) return { available: false, ok: true, output: "结构校验器不可用，已执行网站内置检查" };
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "workflow-skill-"));
  const temporarySkill = path.join(temporaryRoot, name);
  try {
    await fs.mkdir(temporarySkill, { recursive: true });
    await fs.writeFile(path.join(temporarySkill, "SKILL.md"), content, "utf8");
    const result = spawnSync(python, ["-X", "utf8", validator, temporarySkill], { encoding: "utf8", timeout: 12000, windowsHide: true });
    const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
    return { available: true, ok: result.status === 0, output: output || `校验器退出码 ${result.status}` };
  } finally {
    await fs.rm(temporaryRoot, { recursive: true, force: true });
  }
}

async function prepareSkillChange(name, body) {
  const current = await loadSkillDetail(name);
  if (body.baseHash !== current.hash) throw Object.assign(new Error("Skill已在其他位置发生变化，请刷新后重新编辑"), { status: 409 });
  const newVersion = cleanText(body.newVersion, 30);
  const reason = cleanText(body.reason, 2000);
  const summary = cleanText(body.summary, 4000);
  if (!reason || !summary) throw Object.assign(new Error("必须填写修改原因和修改摘要"), { status: 400 });
  const managedContent = applyManagedMetadata(String(body.content || ""), newVersion);
  if (managedContent === current.content) throw Object.assign(new Error("没有检测到内容或版本变化"), { status: 400 });
  const validation = validateSkillContent(name, managedContent, current.metadata.version, newVersion);
  const external = validation.errors.length ? { available: false, ok: false, output: "内置检查未通过" } : await externalSkillValidation(name, managedContent);
  if (!external.ok) validation.errors.push(`结构校验失败：${external.output}`);
  return { current, managedContent, newVersion, reason, summary, validation, external, diff: diffSummary(current.content, managedContent) };
}

async function recordDirectEdit({ name, previousVersion, newVersion, reason, summary, backupRelativePath, hash }) {
  const entry = {
    id: `WFE-${new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14)}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`,
    editedAt: new Date().toISOString(),
    skill: name,
    previousVersion,
    newVersion,
    reason,
    summary,
    backupRelativePath,
    newHash: hash,
    regressionStatus: "pending",
    source: "local-workflow-editor",
  };
  const entries = await readJson(DIRECT_EDIT_LOG, []);
  entries.unshift(entry);
  await atomicWrite(DIRECT_EDIT_LOG, `${JSON.stringify(entries, null, 2)}\n`);

  const logEntry = `## ${today()} — ${name} v${newVersion}（网页直接编辑）\n\n- 变更类型：本地工作流编辑器直接写入；状态保持\`draft\` / \`active_for_testing\`。\n- 修改原因：${reason.replace(/\r?\n/g, " ")}\n- 修改摘要：${summary.replace(/\r?\n/g, " ")}\n- 版本：\`${previousVersion}\` → \`${newVersion}\`。\n- 自动控制：已校验frontmatter、Metadata和Skill结构；写入前备份位于\`${backupRelativePath}\`。\n- 回归状态：\`pending\`；页面直接修改不等于行为回归或律师验证。\n\n`;
  const existing = await readText(SKILL_CHANGE_LOG).catch((error) => {
    if (error.code === "ENOENT") return "# Skill Change Log\n";
    throw error;
  });
  const updated = existing.startsWith("# Skill Change Log")
    ? existing.replace(/^# Skill Change Log\s*/, `# Skill Change Log\n\n${logEntry}`)
    : `# Skill Change Log\n\n${logEntry}${existing}`;
  await atomicWrite(SKILL_CHANGE_LOG, updated);
  return entry;
}

async function saveSkill(name, prepared) {
  if (prepared.validation.errors.length) throw Object.assign(new Error(prepared.validation.errors.join("；")), { status: 422 });
  const target = await resolveSkillFile(name);
  const latest = await readText(target);
  if (sha256(latest) !== prepared.current.hash) throw Object.assign(new Error("Skill在校验后又发生变化，本次写入已取消"), { status: 409 });
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const backupFolder = path.join(BACKUP_ROOT, `${stamp}_${crypto.randomBytes(3).toString("hex")}`, name);
  const backupPath = path.join(backupFolder, "SKILL.md");
  await fs.mkdir(backupFolder, { recursive: true });
  await fs.copyFile(target, backupPath);
  await atomicWrite(target, prepared.managedContent);
  const saved = await readText(target);
  if (saved !== prepared.managedContent) {
    await fs.copyFile(backupPath, target);
    throw Object.assign(new Error("写入复核失败，已恢复原文件"), { status: 500 });
  }
  const backupRelativePath = path.relative(FRAMEWORK_ROOT, backupPath).replaceAll("\\", "/");
  const audit = await recordDirectEdit({
    name,
    previousVersion: prepared.current.metadata.version,
    newVersion: prepared.newVersion,
    reason: prepared.reason,
    summary: prepared.summary,
    backupRelativePath,
    hash: sha256(saved),
  });
  return { detail: await loadSkillDetail(name), backupRelativePath, audit };
}

function isLocalWrite(request) {
  const origin = request.headers.origin;
  const marker = request.headers["x-workflow-editor"];
  const allowedOrigin = !origin || origin === `http://${HOST}:${PORT}` || origin === `http://localhost:${PORT}`;
  return marker === "1" && allowedOrigin;
}

async function readBody(request, limit = MAX_BODY_BYTES) {
  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    total += chunk.length;
    if (total > limit) throw Object.assign(new Error("请求内容过大"), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    throw Object.assign(new Error("JSON格式无效"), { status: 400 });
  }
}

async function saveLayout(body) {
  const positions = {};
  const labels = {};
  const notes = {};
  for (const [code, value] of Object.entries(body.positions || {})) {
    if (!/^[A-T]$/.test(code)) continue;
    const x = Number(value?.x);
    const y = Number(value?.y);
    if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > 10000 || Math.abs(y) > 10000) continue;
    positions[code] = { x: Math.round(x), y: Math.round(y) };
  }
  for (const [code, value] of Object.entries(body.labels || {})) {
    if (/^[A-T]$/.test(code) && cleanText(value, 80)) labels[code] = cleanText(value, 80);
  }
  for (const [code, value] of Object.entries(body.notes || {})) {
    if (/^[A-T]$/.test(code) && cleanText(value, 1000)) notes[code] = cleanText(value, 1000);
  }
  const layout = { schemaVersion: "1.0", updatedAt: new Date().toISOString(), positions, labels, notes };
  await atomicWrite(LAYOUT_PATH, `${JSON.stringify(layout, null, 2)}\n`);
  return layout;
}

function json(response, status, value) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
  response.end(JSON.stringify(value));
}

async function serveStatic(url, response) {
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const target = path.resolve(PUBLIC_ROOT, `.${pathname}`);
  if (!target.startsWith(`${PUBLIC_ROOT}${path.sep}`)) return json(response, 403, { error: "路径无效" });
  try {
    const stat = await fs.stat(target);
    if (!stat.isFile()) throw Object.assign(new Error("not file"), { code: "ENOENT" });
    response.writeHead(200, {
      "Content-Type": MIME[path.extname(target).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": "default-src 'self'; img-src 'self' data: blob:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    });
    createReadStream(target).pipe(response);
  } catch (error) {
    if (error.code === "ENOENT") return json(response, 404, { error: "页面不存在" });
    throw error;
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${HOST}:${PORT}`);
    if (request.method === "GET" && url.pathname === "/api/health") return json(response, 200, { ok: true, time: new Date().toISOString() });
    if (request.method === "GET" && url.pathname === "/api/system") return json(response, 200, await buildSystemPayload());
    if (request.method === "PUT" && url.pathname === "/api/layout") {
      if (!isLocalWrite(request)) return json(response, 403, { error: "仅接受本地编辑器操作" });
      return json(response, 200, { layout: await saveLayout(await readBody(request)) });
    }
    const skillRoute = url.pathname.match(/^\/api\/skills\/([a-z0-9-]+)$/);
    const previewRoute = url.pathname.match(/^\/api\/skills\/([a-z0-9-]+)\/preview$/);
    if (request.method === "GET" && skillRoute) return json(response, 200, await loadSkillDetail(skillRoute[1]));
    if (request.method === "POST" && previewRoute) {
      if (!isLocalWrite(request)) return json(response, 403, { error: "仅接受本地编辑器操作" });
      const prepared = await prepareSkillChange(previewRoute[1], await readBody(request));
      return json(response, prepared.validation.errors.length ? 422 : 200, {
        ok: prepared.validation.errors.length === 0,
        validation: prepared.validation,
        externalValidation: prepared.external,
        diff: prepared.diff,
        managedContent: prepared.managedContent,
      });
    }
    if (request.method === "PUT" && skillRoute) {
      if (!isLocalWrite(request)) return json(response, 403, { error: "仅接受本地编辑器操作" });
      const prepared = await prepareSkillChange(skillRoute[1], await readBody(request));
      const saved = await saveSkill(skillRoute[1], prepared);
      return json(response, 200, { ok: true, ...saved, warnings: prepared.validation.warnings });
    }
    if (request.method === "GET" || request.method === "HEAD") return serveStatic(url, response);
    return json(response, 405, { error: "不支持的请求方法" });
  } catch (error) {
    console.error(error);
    return json(response, error.status || 500, { error: error.status ? error.message : "本地工作流编辑器发生错误" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`汪佳成诉讼律师工作流编辑器：http://${HOST}:${PORT}`);
  console.log(`直接编辑Skill母库：${SKILLS_ROOT}`);
});
