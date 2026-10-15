const state = {
  data: null,
  route: "overview",
  selectedStage: "A",
  skillFilter: "all",
  templateFilter: "all",
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const categoryLabels = {
  appeal: "上诉",
  arbitration: "仲裁",
  client_report: "客户报告",
  complaint: "起诉",
  defense: "答辩",
  engagement: "委托手续",
  evidence: "证据",
  hearing: "庭审",
  legal_authority: "法律法规",
  preservation: "保全",
  submissions: "代理意见",
};

const coverageLabels = {
  covered: "已覆盖",
  partial: "部分覆盖",
  missing: "待建设",
  rule: "规则/工具",
};

const severityLabels = {
  low: "体验改进",
  medium: "一般影响",
  high: "重要偏差",
  critical: "重大风险",
};

const phases = [
  { range: "A–B", title: "接案与委托", codes: ["A", "B"] },
  { range: "C–E", title: "访谈、材料与事实", codes: ["C", "D", "E"] },
  { range: "F–J", title: "证据、程序、法律与金额", codes: ["F", "G", "H", "I", "J"] },
  { range: "K–P", title: "策略、起草与庭审", codes: ["K", "L", "M", "N", "O", "P"] },
  { range: "Q–T", title: "和解、救济、执行与沉淀", codes: ["Q", "R", "S", "T"] },
];

function formatDate(value, withTime = false) {
  if (!value) return "未记录";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

function fileSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function setLoading(loading) {
  $("#loadingState").hidden = !loading;
  if (loading) {
    $("#errorState").hidden = true;
    $$(".view").forEach((view) => view.classList.remove("is-active"));
  }
}

function showError(message) {
  setLoading(false);
  $("#errorState").hidden = false;
  $("#errorMessage").textContent = message;
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "error" : ""}`;
  toast.textContent = message;
  $("#toastRegion").append(toast);
  window.setTimeout(() => toast.remove(), 3600);
}

async function fetchSystem({ quiet = false } = {}) {
  if (!quiet) setLoading(true);
  try {
    const response = await fetch("/api/system", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "读取失败");
    state.data = payload;
    renderAll();
    $("#errorState").hidden = true;
    if (!quiet) showToast("已读取本地最新工作流");
  } catch (error) {
    showError(error.message || "无法连接本地工作流服务");
  } finally {
    setLoading(false);
    navigate(location.hash.slice(1) || state.route, false);
  }
}

function renderAll() {
  renderHero();
  renderPhases();
  renderStageGrid();
  renderStageDetail();
  renderSkills();
  renderTemplateFilters();
  renderTemplates();
  renderUploadForm();
  renderUploadQueue();
  renderFeedbackForm();
  renderFeedbackQueue();
}

function renderHero() {
  const { stats, revision, workflow, generatedAt } = state.data;
  $("#heroRevision").textContent = `本地版本 ${revision}`;
  $("#heroUpdated").textContent = `读取于 ${formatDate(generatedAt, true)}`;
  const items = [
    [stats.stageCount, "流程阶段"],
    [stats.actionCount, "专业动作"],
    [stats.activeSkillCount, "已激活 Skills"],
    [stats.templateCount, "Word 母版"],
  ];
  $("#heroStats").innerHTML = items.map(([value, label]) => `
    <div class="hero-stat"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>
  `).join("");
  $("#heroUpdated").title = `流程矩阵 v${workflow.version}，标注更新 ${workflow.updated}`;
}

function renderPhases() {
  $("#phaseStrip").innerHTML = phases.map((phase) => `
    <button class="phase-item" type="button" data-phase-stage="${phase.codes[0]}">
      <span>${phase.range}</span><strong>${escapeHtml(phase.title)}</strong>
    </button>
  `).join("");
}

function coverageBar(stage) {
  return Object.entries(stage.coverage).map(([key, value]) => `
    <i class="${key} grow-${Math.min(value, 20)}" title="${coverageLabels[key]} ${value}项"></i>
  `).join("");
}

function workflowQuery() {
  return $("#workflowSearch")?.value.trim().toLowerCase() || "";
}

function stageMatches(stage, query) {
  if (!query) return true;
  const haystack = [stage.code, stage.title, stage.note, ...stage.actions.flatMap((action) => [action.id, action.action, action.output, action.support, action.specialist, ...action.linkedSkills.map((item) => item.name)])].join(" ").toLowerCase();
  return haystack.includes(query);
}

function renderStageGrid() {
  const query = workflowQuery();
  const stages = state.data.workflow.stages.filter((stage) => stageMatches(stage, query));
  $("#stageGrid").innerHTML = stages.length ? stages.map((stage) => `
    <button type="button" class="stage-card ${state.selectedStage === stage.code ? "is-selected" : ""}" data-stage="${stage.code}">
      <div class="stage-topline"><span class="stage-code">${stage.code}</span><span class="stage-skill-count">${stage.skills.length} Skills</span></div>
      <h3>${escapeHtml(stage.title)}</h3>
      <p>${stage.actions.length} 项动作 · ${stage.coverage.missing ? `${stage.coverage.missing} 项待建设` : "已有支撑"}</p>
      <span class="coverage-bar" aria-label="覆盖情况">${coverageBar(stage)}</span>
    </button>
  `).join("") : `<div class="empty-card">没有匹配的流程动作</div>`;
}

function renderStageDetail() {
  const stage = state.data.workflow.stages.find((item) => item.code === state.selectedStage);
  if (!stage) {
    $("#stageDetail").innerHTML = `<div class="stage-detail-empty">选择一个流程阶段查看动作与 Skill 调用关系</div>`;
    return;
  }
  const skills = stage.skills.length ? stage.skills.map((skill) => `<button type="button" class="skill-pill" data-open-skill="${escapeHtml(skill.name)}">${escapeHtml(skill.code)} · ${escapeHtml(skill.name)}</button>`).join("") : `<span class="skill-pill">规则、模板或工具支撑</span>`;
  $("#stageDetail").innerHTML = `
    <div class="stage-detail-head"><span>STAGE ${stage.code}</span><h3>${escapeHtml(stage.title)}</h3>${stage.note ? `<p>${escapeHtml(stage.note)}</p>` : ""}</div>
    <div class="stage-skills">${skills}</div>
    <div class="action-list">${stage.actions.map((action) => `
      <article class="action-item">
        <div class="action-id-line"><span class="action-id">${escapeHtml(action.id)}</span><span class="coverage-label">${escapeHtml(coverageLabels[action.coverage])}</span></div>
        <h4>${escapeHtml(action.action)}</h4>
        <p><strong>输出：</strong>${escapeHtml(action.output)}</p>
        <p><strong>支撑：</strong>${escapeHtml(action.support)}</p>
        <button class="text-link" type="button" data-report-action="${escapeHtml(action.id)}" data-report-stage="${stage.code}">反馈此步骤 →</button>
      </article>
    `).join("")}</div>
  `;
}

function renderSkills() {
  const query = $("#skillSearch")?.value.trim().toLowerCase() || "";
  const skills = state.data.skills.filter((skill) => {
    const matchesFilter = state.skillFilter === "all" || (state.skillFilter === "active" && skill.active) || (state.skillFilter === "draft" && skill.status.toLowerCase() === "draft");
    return matchesFilter && `${skill.name} ${skill.description} ${skill.version}`.toLowerCase().includes(query);
  });
  $("#skillGrid").innerHTML = skills.length ? skills.map((skill) => `
    <button type="button" class="skill-card" data-open-skill="${escapeHtml(skill.name)}">
      <div class="skill-card-top"><span class="status-badge ${skill.active ? "active" : "disabled"}">${skill.active ? "ACTIVE FOR TESTING" : "未激活"}</span><span class="skill-version">v${escapeHtml(skill.version)}</span></div>
      <h3>${escapeHtml(skill.name)}</h3>
      <p>${escapeHtml(skill.description)}</p>
      <footer><span>${escapeHtml(skill.status)}</span><span>${escapeHtml(skill.lastReviewed || "未标注日期")}</span></footer>
    </button>
  `).join("") : `<div class="empty-card">没有匹配的 Skill</div>`;
}

function openSkill(name) {
  const skill = state.data.skills.find((item) => item.name === name);
  if (!skill) return;
  const prompt = `请检查并改进 ChinaLitigationLawyer 中的 ${skill.name} Skill。文件：${skill.relativePath}。请先结合我指出的问题分析影响范围，再按版本、日志和回归纪律做最小修改；不要改变无关 Skill。`;
  $("#dialogContent").innerHTML = `
    <div class="dialog-head"><p class="section-kicker">SKILL DETAIL</p><h2>${escapeHtml(skill.name)}</h2></div>
    <div class="dialog-body">
      <p>${escapeHtml(skill.description)}</p>
      <div class="meta-grid">
        <div><span>版本</span><strong>${escapeHtml(skill.version)}</strong></div>
        <div><span>状态</span><strong>${escapeHtml(skill.status)}</strong></div>
        <div><span>激活</span><strong>${skill.active ? "是" : "否"}</strong></div>
        <div><span>负责人</span><strong>${escapeHtml(skill.owner || "未标注")}</strong></div>
        <div><span>最近复核</span><strong>${escapeHtml(skill.lastReviewed || "未标注")}</strong></div>
        <div><span>路径</span><strong>${escapeHtml(skill.relativePath)}</strong></div>
      </div>
      <p class="section-kicker">可复制给 CODEX 的修改指令</p>
      <div class="prompt-box">${escapeHtml(prompt)}</div>
      <button class="text-link" type="button" data-copy-text="${escapeHtml(prompt)}">复制修改指令 →</button>
    </div>
  `;
  $("#detailDialog").showModal();
}

function renderTemplateFilters() {
  const categories = [...new Set(state.data.templates.map((item) => item.category))];
  $("#templateFilters").innerHTML = ["all", ...categories].map((category) => `
    <button type="button" class="filter-chip ${state.templateFilter === category ? "is-active" : ""}" data-template-filter="${escapeHtml(category)}">${category === "all" ? "全部" : escapeHtml(categoryLabels[category] || category)}</button>
  `).join("");
}

function renderTemplates() {
  const query = $("#templateSearch")?.value.trim().toLowerCase() || "";
  const templates = state.data.templates.filter((template) => {
    const filter = state.templateFilter === "all" || state.templateFilter === template.category;
    const haystack = `${template.id} ${template.title} ${template.document_type} ${template.stage} ${template.path}`.toLowerCase();
    return filter && haystack.includes(query);
  });
  $("#templateTableBody").innerHTML = templates.length ? templates.map((template) => `
    <tr>
      <td><span class="template-title">${escapeHtml(template.title)}</span><span class="template-id">${escapeHtml(template.id)} · ${escapeHtml(categoryLabels[template.category] || template.category)}</span></td>
      <td>${escapeHtml(template.stage || "未标注")}<br><span class="template-id">${escapeHtml(template.party_role || "any")}</span></td>
      <td><span class="status-badge ${template.enabled_for_ai_draft ? "active" : "disabled"}">${template.enabled_for_ai_draft ? "起草启用" : "历史/停用"}</span><br><span class="template-id">${escapeHtml(template.lawyer_approval || "未标注")}</span></td>
      <td><span class="template-path">${escapeHtml(template.relativePath || "")}</span>${template.exists ? `<a class="text-link" href="/api/templates/download?id=${encodeURIComponent(template.id)}">下载副本 →</a><span class="template-id">${fileSize(template.size)}</span>` : `<span class="template-id">文件缺失</span>`}</td>
    </tr>
  `).join("") : `<tr><td colspan="4"><div class="empty-card">没有匹配的模板</div></td></tr>`;
}

function renderUploadForm() {
  const categorySelect = $("#uploadCategory");
  const currentCategory = categorySelect.value;
  categorySelect.innerHTML = state.data.templateCategories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(categoryLabels[category] || category)}</option>`).join("");
  if (state.data.templateCategories.includes(currentCategory)) categorySelect.value = currentCategory;
  const replaceSelect = $("#replaceTemplateId");
  const currentTemplate = replaceSelect.value;
  replaceSelect.innerHTML = `<option value="">请选择</option>${state.data.templates.map((template) => `<option value="${escapeHtml(template.id)}">${escapeHtml(template.id)} · ${escapeHtml(template.title)}</option>`).join("")}`;
  if (state.data.templates.some((template) => template.id === currentTemplate)) replaceSelect.value = currentTemplate;
}

function renderUploadQueue() {
  const pending = state.data.uploadQueue.filter((item) => item.status === "pending_review").slice(0, 5);
  $("#uploadQueue").innerHTML = pending.length ? `<p class="section-kicker">待处理上传</p>${pending.map((item) => `
    <div class="queue-item"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.id)} · ${formatDate(item.createdAt, true)}</span></div>
  `).join("")}` : "";
}

function renderFeedbackForm() {
  const stages = state.data.workflow.stages;
  const stageSelect = $("#feedbackStage");
  const currentStage = stageSelect.value;
  stageSelect.innerHTML = `<option value="">请选择</option>${stages.map((stage) => `<option value="${stage.code}">${stage.code} · ${escapeHtml(stage.title)}</option>`).join("")}`;
  if (stages.some((stage) => stage.code === currentStage)) stageSelect.value = currentStage;
  updateFeedbackActions();
  const skillSelect = $("#feedbackSkill");
  const currentSkill = skillSelect.value;
  skillSelect.innerHTML = `<option value="">请选择</option>${state.data.skills.map((skill) => `<option value="${escapeHtml(skill.name)}">${escapeHtml(skill.name)}</option>`).join("")}`;
  if (state.data.skills.some((skill) => skill.name === currentSkill)) skillSelect.value = currentSkill;
}

function updateFeedbackActions(preferred = "") {
  const stage = state.data?.workflow.stages.find((item) => item.code === $("#feedbackStage").value);
  const actionSelect = $("#feedbackAction");
  actionSelect.innerHTML = `<option value="">请选择</option>${(stage?.actions || []).map((action) => `<option value="${escapeHtml(action.id)}">${escapeHtml(action.id)} · ${escapeHtml(action.action)}</option>`).join("")}`;
  if (preferred) actionSelect.value = preferred;
}

function feedbackPrompt(item) {
  const location = [item.stage && `阶段${item.stage}`, item.actionId && `动作${item.actionId}`, item.skill && `Skill ${item.skill}`].filter(Boolean).join("、") || "工作流相关位置";
  return `请处理网站反馈 ${item.id}。定位：${location}。\n发现的问题：${item.problem}\n期望改进：${item.expected || "请结合项目规则提出最小修订方案"}\n${item.example ? `复现场景：${item.example}\n` : ""}请先读取当前最新规则及相关 Skill，分析影响范围后修改本地文件；按项目变更纪律升级版本、更新日志并执行回归。修改完成后核对网站能够读取更新结果。`;
}

function renderFeedbackQueue() {
  const open = state.data.feedback.filter((item) => item.status !== "resolved");
  $("#feedbackCount").textContent = open.length;
  $("#feedbackQueue").innerHTML = open.length ? open.map((item) => `
    <article class="feedback-item" data-severity="${escapeHtml(item.severity)}">
      <div class="feedback-item-head"><strong>${escapeHtml(item.id)}</strong><span>${escapeHtml(severityLabels[item.severity] || item.severity)}</span></div>
      <p>${escapeHtml(item.problem)}</p>
      <footer>${escapeHtml([item.stage, item.actionId, item.skill].filter(Boolean).join(" · ") || "未定位")}</footer>
      <button class="text-link" type="button" data-copy-feedback="${escapeHtml(item.id)}">复制给 Codex →</button>
    </article>
  `).join("") : `<div class="empty-card">目前没有待处理反馈</div>`;
}

function navigate(route, updateHash = true) {
  const allowed = ["overview", "skills", "templates", "feedback"];
  state.route = allowed.includes(route) ? route : "overview";
  if (updateHash && location.hash !== `#${state.route}`) location.hash = state.route;
  $$("[data-route]").forEach((item) => item.classList.toggle("is-active", item.dataset.route === state.route));
  $$("[data-view]").forEach((item) => item.classList.toggle("is-active", item.dataset.view === state.route));
  $$("[data-view-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.viewPanel === state.route && Boolean(state.data)));
  if (state.data) window.scrollTo({ top: document.querySelector(".hero").offsetHeight - 40, behavior: "smooth" });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("已复制，可直接发送给 Codex");
  } catch {
    showToast("浏览器未允许复制，请手动选择文字", "error");
  }
}

document.addEventListener("click", (event) => {
  const routeLink = event.target.closest("[data-route]");
  if (routeLink) { event.preventDefault(); navigate(routeLink.dataset.route); return; }
  const rail = event.target.closest("[data-view]");
  if (rail) { navigate(rail.dataset.view); return; }
  const phase = event.target.closest("[data-phase-stage]");
  if (phase) { state.selectedStage = phase.dataset.phaseStage; renderStageGrid(); renderStageDetail(); return; }
  const stage = event.target.closest("[data-stage]");
  if (stage) { state.selectedStage = stage.dataset.stage; renderStageGrid(); renderStageDetail(); return; }
  const skill = event.target.closest("[data-open-skill]");
  if (skill) { openSkill(skill.dataset.openSkill); return; }
  const report = event.target.closest("[data-report-action]");
  if (report) {
    navigate("feedback");
    $("#feedbackStage").value = report.dataset.reportStage;
    updateFeedbackActions(report.dataset.reportAction);
    $("#feedbackForm textarea[name='problem']").focus();
    return;
  }
  const skillFilter = event.target.closest("[data-skill-filter]");
  if (skillFilter) {
    state.skillFilter = skillFilter.dataset.skillFilter;
    $$("[data-skill-filter]").forEach((item) => item.classList.toggle("is-active", item.dataset.skillFilter === state.skillFilter));
    renderSkills();
    return;
  }
  const templateFilter = event.target.closest("[data-template-filter]");
  if (templateFilter) { state.templateFilter = templateFilter.dataset.templateFilter; renderTemplateFilters(); renderTemplates(); return; }
  const copy = event.target.closest("[data-copy-text]");
  if (copy) { copyText(copy.dataset.copyText); return; }
  const feedbackCopy = event.target.closest("[data-copy-feedback]");
  if (feedbackCopy) {
    const item = state.data.feedback.find((entry) => entry.id === feedbackCopy.dataset.copyFeedback);
    if (item) copyText(feedbackPrompt(item));
  }
});

$("#refreshButton").addEventListener("click", () => fetchSystem());
$("#retryButton").addEventListener("click", () => fetchSystem());
$("#workflowSearch").addEventListener("input", renderStageGrid);
$("#skillSearch").addEventListener("input", renderSkills);
$("#templateSearch").addEventListener("input", renderTemplates);
$("#feedbackStage").addEventListener("change", () => updateFeedbackActions());
$("#uploadMode").addEventListener("change", (event) => { $("#replaceIdLabel").hidden = event.target.value !== "update"; });
$("#templateFile").addEventListener("change", (event) => {
  const file = event.target.files[0];
  $("#fileDrop").classList.toggle("has-file", Boolean(file));
  $("#fileDrop span").textContent = file ? file.name : "选择或拖入 DOCX / DOTX";
});

$("#feedbackForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = $("button[type='submit']", form);
  const status = $("#feedbackStatus");
  button.disabled = true;
  status.className = "form-status";
  status.textContent = "正在登记…";
  try {
    const payload = Object.fromEntries(new FormData(form).entries());
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Workflow-Request": "1" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "登记失败");
    status.classList.add("is-success");
    status.textContent = `${result.entry.id} 已登记。可在右侧复制给 Codex。`;
    form.reset();
    updateFeedbackActions();
    await fetchSystem({ quiet: true });
  } catch (error) {
    status.classList.add("is-error");
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

$("#templateUploadForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = $("button[type='submit']", form);
  const status = $("#uploadStatus");
  button.disabled = true;
  status.className = "form-status";
  status.textContent = "正在写入本地待处理区…";
  try {
    const response = await fetch("/api/templates/upload", {
      method: "POST",
      headers: { "X-Workflow-Request": "1" },
      body: new FormData(form),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "上传失败");
    status.classList.add("is-success");
    status.textContent = `${result.entry.id} 已同步。请让 Codex 处理模板上传队列。`;
    form.reset();
    $("#replaceIdLabel").hidden = true;
    $("#fileDrop").classList.remove("has-file");
    $("#fileDrop span").textContent = "选择或拖入 DOCX / DOTX";
    await fetchSystem({ quiet: true });
  } catch (error) {
    status.classList.add("is-error");
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

$("#detailDialog .dialog-close").addEventListener("click", () => $("#detailDialog").close());
$("#detailDialog").addEventListener("click", (event) => {
  if (event.target === $("#detailDialog")) $("#detailDialog").close();
});

window.addEventListener("hashchange", () => navigate(location.hash.slice(1), false));
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && $("#detailDialog").open) $("#detailDialog").close();
});

fetchSystem();
