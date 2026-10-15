import http from "node:http";
import { createReadStream, existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";

const SITE_ROOT = path.dirname(fileURLToPath(import.meta.url));
const FRAMEWORK_ROOT = path.resolve(SITE_ROOT, "..");
const PUBLIC_ROOT = path.join(SITE_ROOT, "public");
const SKILLS_ROOT = path.join(FRAMEWORK_ROOT, "01_Skills");
const ACTIVE_SKILLS_ROOT = path.join(FRAMEWORK_ROOT, ".agents", "skills");
const TEMPLATE_ROOT = path.join(FRAMEWORK_ROOT, "05_Templates");
const INCOMING_ROOT = path.join(TEMPLATE_ROOT, "_Incoming");
const TEMPLATE_QUEUE_PATH = path.join(TEMPLATE_ROOT, "TEMPLATE_UPLOAD_QUEUE.json");
const FEEDBACK_PATH = path.join(FRAMEWORK_ROOT, "10_Logs", "workflow_feedback_queue.json");
const WORKFLOW_PATH = path.join(FRAMEWORK_ROOT, "docs", "LITIGATION_LIFECYCLE_ACTION_MATRIX.md");
const TEMPLATE_INDEX_PATH = path.join(TEMPLATE_ROOT, "TEMPLATE_INDEX.yaml");
const HOST = "127.0.0.1";
const PORT = Number(process.env.WORKFLOW_SITE_PORT || 4317);
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const stripMarkdown = (value = "") => value
  .replace(/`([^`]+)`/g, "$1")
  .replace(/\*\*([^*]+)\*\*/g, "$1")
  .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
  .replace(/<br\s*\/?\s*>/gi, " ")
  .replace(/\\\|/g, "|")
  .trim();

const scalar = (value = "") => {
  const cleaned = value.trim().replace(/^['"]|['"]$/g, "");
  if (cleaned === "true") return true;
  if (cleaned === "false") return false;
  if (cleaned === "null") return null;
  return cleaned;
};

const readText = (target) => fs.readFile(target, "utf8");

async function readJson(target, fallback = []) {
  try {
    return JSON.parse(await readText(target));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

let writeChain = Promise.resolve();
function serializeWrite(operation) {
  const next = writeChain.then(operation, operation);
  writeChain = next.catch(() => {});
  return next;
}

async function writeJson(target, value) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
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

function parseMetadataTable(content) {
  const result = {};
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\|\s*(version|status|owner|last_reviewed|validated_matters)\s*\|\s*(.*?)\s*\|$/);
    if (match) result[match[1]] = stripMarkdown(match[2]);
  }
  return result;
}

async function loadSkills() {
  const entries = await fs.readdir(SKILLS_ROOT, { withFileTypes: true });
  const skills = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
    const skillPath = path.join(SKILLS_ROOT, entry.name, "SKILL.md");
    if (!existsSync(skillPath)) continue;
    const content = await readText(skillPath);
    const frontmatter = parseFrontmatter(content);
    const metadata = parseMetadataTable(content);
    const stat = await fs.stat(skillPath);
    const active = existsSync(path.join(ACTIVE_SKILLS_ROOT, entry.name));
    skills.push({
      name: frontmatter.name || entry.name,
      description: frontmatter.description || "",
      version: metadata.version || "未标注",
      status: metadata.status || "未标注",
      owner: metadata.owner || "",
      lastReviewed: metadata.last_reviewed || "",
      validatedMatters: metadata.validated_matters || "[]",
      active,
      relativePath: path.relative(FRAMEWORK_ROOT, skillPath).replaceAll("\\", "/"),
      modifiedAt: stat.mtime.toISOString(),
    });
  }
  return skills.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
}

function splitTableRow(line) {
  return line
    .replace(/^\|/, "")
    .replace(/\|\s*$/, "")
    .split(/(?<!\\)\|/)
    .map(stripMarkdown);
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
  for (const line of lines) {
    const heading = line.match(/^###\s+([A-T])\.\s+(.+)$/);
    if (heading) {
      current = { code: heading[1], title: heading[2].trim(), note: "", actions: [] };
      stages.push(current);
      tableStarted = false;
      continue;
    }
    if (!current) continue;
    if (!tableStarted && line.startsWith(">")) {
      const note = stripMarkdown(line.replace(/^>\s?/, ""));
      current.note = [current.note, note].filter(Boolean).join(" ").slice(0, 500);
      continue;
    }
    if (/^\|\s*ID\s*\|/.test(line)) {
      tableStarted = true;
      continue;
    }
    if (!tableStarted || !/^\|\s*[A-T]-?\d{2}\s*\|/.test(line)) continue;
    const cells = splitTableRow(line);
    if (cells.length < 5) continue;
    const [id, action, output, support, specialist] = cells;
    const codes = [...new Set(`${support} ${specialist}`.match(/\b(?:S|G)\d+\b/g) || [])];
    const linkedSkills = codes
      .map((code) => ({ code, name: codeMap[code] || "" }))
      .filter((item) => item.name && skillNames.has(item.name));
    const coverage = /缺失/.test(support) ? "missing"
      : /部分/.test(support) ? "partial"
      : /(完整|已建立|已覆盖|v0\.)/.test(`${support} ${specialist}`) ? "covered"
      : "rule";
    current.actions.push({ id, action, output, support, specialist, coverage, linkedSkills });
  }

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

  const version = content.match(/^#\s+.*?v([\d.]+)/m)?.[1] || "未标注";
  const updated = content.match(/最近更新：`([^`]+)`/)?.[1] || "未标注";
  return { version, updated, stages, actionCount: stages.reduce((sum, stage) => sum + stage.actions.length, 0) };
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
  for (const template of templates) {
    const absolutePath = path.resolve(FRAMEWORK_ROOT, template.path || "");
    const safe = absolutePath.startsWith(`${TEMPLATE_ROOT}${path.sep}`);
    template.exists = safe && existsSync(absolutePath);
    template.category = template.path?.split(/[\\/]/)[1] || "other";
    template.relativePath = template.path;
    if (template.exists) {
      const stat = await fs.stat(absolutePath);
      template.size = stat.size;
      template.modifiedAt = stat.mtime.toISOString();
    }
  }
  const meta = {
    schemaVersion: content.match(/^schema_version:\s*(.+)$/m)?.[1]?.trim() || "",
    lastUpdated: content.match(/^last_updated:\s*(.+)$/m)?.[1]?.trim() || "",
    canonicalFormat: content.match(/^canonical_format:\s*(.+)$/m)?.[1]?.trim() || "docx",
  };
  return { meta, templates };
}

async function loadTemplateCategories() {
  const entries = await fs.readdir(TEMPLATE_ROOT, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_") && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort();
}

async function gitRevision() {
  try {
    const head = (await readText(path.join(FRAMEWORK_ROOT, ".git", "HEAD"))).trim();
    if (head.startsWith("ref:")) {
      const ref = head.slice(5).trim();
      return (await readText(path.join(FRAMEWORK_ROOT, ".git", ref))).trim().slice(0, 12);
    }
    return head.slice(0, 12);
  } catch {
    return "未读取";
  }
}

async function buildSystemPayload() {
  const skills = await loadSkills();
  const workflow = await loadWorkflow(new Set(skills.map((skill) => skill.name)));
  const templateData = await loadTemplates();
  const feedback = await readJson(FEEDBACK_PATH, []);
  const uploadQueue = await readJson(TEMPLATE_QUEUE_PATH, []);
  return {
    generatedAt: new Date().toISOString(),
    frameworkRoot: FRAMEWORK_ROOT,
    revision: await gitRevision(),
    workflow,
    skills,
    templates: templateData.templates,
    templateMeta: templateData.meta,
    templateCategories: await loadTemplateCategories(),
    feedback,
    uploadQueue,
    stats: {
      stageCount: workflow.stages.length,
      actionCount: workflow.actionCount,
      skillCount: skills.length,
      activeSkillCount: skills.filter((skill) => skill.active).length,
      templateCount: templateData.templates.length,
      enabledTemplateCount: templateData.templates.filter((item) => item.enabled_for_ai_draft === true).length,
      openFeedbackCount: feedback.filter((item) => item.status !== "resolved").length,
      pendingUploadCount: uploadQueue.filter((item) => item.status === "pending_review").length,
    },
  };
}

function json(response, status, value) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(value));
}

function isLocalWrite(request) {
  const origin = request.headers.origin;
  const marker = request.headers["x-workflow-request"];
  return marker === "1" && (!origin || origin === `http://${HOST}:${PORT}` || origin === `http://localhost:${PORT}`);
}

async function readBody(request, limit = 512 * 1024) {
  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    total += chunk.length;
    if (total > limit) throw Object.assign(new Error("请求内容过大"), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

const cleanText = (value, max = 2000) => String(value || "").trim().slice(0, max);

async function handleFeedback(request, response) {
  if (!isLocalWrite(request)) return json(response, 403, { error: "仅接受本地网站操作" });
  const body = JSON.parse(await readBody(request));
  const problem = cleanText(body.problem, 4000);
  if (!problem) return json(response, 400, { error: "请填写具体问题" });
  const entry = await serializeWrite(async () => {
    const queue = await readJson(FEEDBACK_PATH, []);
    const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
    const sequence = String(queue.filter((item) => item.id?.startsWith(`WF-${date}`)).length + 1).padStart(3, "0");
    const value = {
      id: `WF-${date}-${sequence}`,
      createdAt: new Date().toISOString(),
      status: "open",
      stage: cleanText(body.stage, 20),
      actionId: cleanText(body.actionId, 20),
      skill: cleanText(body.skill, 100),
      severity: ["low", "medium", "high", "critical"].includes(body.severity) ? body.severity : "medium",
      problem,
      expected: cleanText(body.expected, 4000),
      example: cleanText(body.example, 4000),
    };
    queue.unshift(value);
    await writeJson(FEEDBACK_PATH, queue);
    return value;
  });
  return json(response, 201, { entry });
}

function safeFileStem(value) {
  return cleanText(value, 120)
    .normalize("NFKC")
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/^\.+|\.+$/g, "") || "template";
}

async function webRequestFromNode(request) {
  const headers = new Headers();
  Object.entries(request.headers).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((item) => headers.append(key, item));
    else if (value !== undefined) headers.set(key, value);
  });
  return new Request(`http://${HOST}:${PORT}${request.url}`, {
    method: request.method,
    headers,
    body: Readable.toWeb(request),
    duplex: "half",
  });
}

async function handleTemplateUpload(request, response) {
  if (!isLocalWrite(request)) return json(response, 403, { error: "仅接受本地网站操作" });
  const length = Number(request.headers["content-length"] || 0);
  if (length > MAX_UPLOAD_BYTES + 1024 * 1024) return json(response, 413, { error: "文件超过50MB限制" });
  const categories = await loadTemplateCategories();
  const webRequest = await webRequestFromNode(request);
  const form = await webRequest.formData();
  const file = form.get("file");
  const title = cleanText(form.get("title"), 200);
  const category = cleanText(form.get("category"), 80);
  const mode = form.get("mode") === "update" ? "update" : "new";
  const replaceId = cleanText(form.get("replaceId"), 80);
  const notes = cleanText(form.get("notes"), 2000);
  if (!(file instanceof File) || file.size === 0) return json(response, 400, { error: "请选择Word模板文件" });
  if (file.size > MAX_UPLOAD_BYTES) return json(response, 413, { error: "文件超过50MB限制" });
  if (!categories.includes(category)) return json(response, 400, { error: "模板分类无效" });
  const extension = path.extname(file.name).toLowerCase();
  if (![".docx", ".dotx"].includes(extension)) return json(response, 400, { error: "仅支持DOCX或DOTX模板" });
  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer[0] !== 0x50 || buffer[1] !== 0x4b) return json(response, 400, { error: "文件不是有效的Office Open XML文档" });

  const now = new Date();
  const stamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const uploadId = `TUP-${stamp}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
  const folder = path.join(INCOMING_ROOT, uploadId);
  const filename = `${safeFileStem(title || path.basename(file.name, extension))}${extension}`;
  const storedPath = path.join(folder, filename);
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");

  const entry = await serializeWrite(async () => {
    await fs.mkdir(folder, { recursive: true });
    await fs.writeFile(storedPath, buffer, { flag: "wx" });
    const value = {
      id: uploadId,
      createdAt: now.toISOString(),
      status: "pending_review",
      mode,
      replaceTemplateId: mode === "update" ? replaceId || null : null,
      title: title || path.basename(file.name, extension),
      category,
      originalFilename: path.basename(file.name),
      storedRelativePath: path.relative(FRAMEWORK_ROOT, storedPath).replaceAll("\\", "/"),
      size: buffer.length,
      sha256: hash,
      notes,
      requiredNextStep: "脱敏、版式核验、模板ID分配或版本替换、TEMPLATE_INDEX.yaml更新、律师确认",
    };
    await writeJson(path.join(folder, "upload.json"), value);
    const queue = await readJson(TEMPLATE_QUEUE_PATH, []);
    queue.unshift(value);
    await writeJson(TEMPLATE_QUEUE_PATH, queue);
    return value;
  });
  return json(response, 201, { entry, message: "已同步至本地模板库待处理区" });
}

async function handleTemplateDownload(url, response) {
  const id = cleanText(url.searchParams.get("id"), 80);
  const { templates } = await loadTemplates();
  const template = templates.find((item) => item.id === id && item.exists);
  if (!template) return json(response, 404, { error: "未找到模板" });
  const target = path.resolve(FRAMEWORK_ROOT, template.relativePath);
  if (!target.startsWith(`${TEMPLATE_ROOT}${path.sep}`)) return json(response, 403, { error: "模板路径无效" });
  const filename = path.basename(target).replace(/[\r\n"]/g, "_");
  response.writeHead(200, {
    "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    "X-Content-Type-Options": "nosniff",
  });
  createReadStream(target).pipe(response);
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
      "Cache-Control": pathname.startsWith("/assets/") ? "public, max-age=3600" : "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
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
    if (request.method === "GET" && url.pathname === "/api/system") return json(response, 200, await buildSystemPayload());
    if (request.method === "POST" && url.pathname === "/api/feedback") return await handleFeedback(request, response);
    if (request.method === "POST" && url.pathname === "/api/templates/upload") return await handleTemplateUpload(request, response);
    if (request.method === "GET" && url.pathname === "/api/templates/download") return await handleTemplateDownload(url, response);
    if (request.method === "GET" || request.method === "HEAD") return await serveStatic(url, response);
    return json(response, 405, { error: "不支持的请求方法" });
  } catch (error) {
    console.error(error);
    return json(response, error.status || 500, { error: error.status ? error.message : "本地工作流网站发生错误" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`汪佳成诉讼律师自动化工作流：http://${HOST}:${PORT}`);
  console.log(`实时读取母库：${FRAMEWORK_ROOT}`);
});
