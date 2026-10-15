const NS = "http://www.w3.org/2000/svg";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  data: null,
  activeView: "workflow",
  canvasMode: "overview",
  selectedStage: null,
  selectedAction: null,
  positions: {},
  defaultPositions: {},
  labels: {},
  notes: {},
  layoutEditing: false,
  viewport: { x: 0, y: 0, scale: 1 },
  draggingNode: null,
  panning: null,
  editor: { name: null, baseHash: null, previewValid: false, previewSignature: null },
};

const coverageLabels = { covered: "已覆盖", partial: "部分", missing: "缺失", rule: "规则" };
const BPMN_OVERVIEW_NODE = { width: 236, height: 96 };
const stageTemplateMap = {
  B: ["authorization", "firm", "engagement"],
  I: ["legal_research", "legal_provisions"],
  L: ["complaint", "defense", "appeal", "arbitration", "preservation", "evidence_catalog", "client_report"],
  N: ["evidence", "examination"],
  O: ["hearing", "legal_provisions"],
  P: ["submission", "post_hearing"],
  R: ["appeal"],
};

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);
}

function svgElement(tag, attributes = {}, text = null) {
  const element = document.createElementNS(NS, tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  if (text !== null) element.textContent = text;
  return element;
}

function wrapText(text, maxCharacters = 20, maxLines = 3) {
  const source = String(text || "").replace(/\s+/g, " ").trim();
  if (!source) return ["—"];
  const lines = [];
  let current = "";
  for (const character of source) {
    current += character;
    if (current.length >= maxCharacters) {
      lines.push(current);
      current = "";
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);
  const used = lines.join("").length;
  if (used < source.length) lines[lines.length - 1] = `${lines[lines.length - 1].slice(0, -1)}…`;
  return lines;
}

function appendMultilineText(parent, text, x, y, className, maxCharacters, maxLines, lineHeight = 17) {
  const element = svgElement("text", { x, y, class: className });
  wrapText(text, maxCharacters, maxLines).forEach((line, index) => {
    element.append(svgElement("tspan", { x, dy: index === 0 ? 0 : lineHeight }, line));
  });
  parent.append(element);
  return element;
}

function wrapTextAll(text, maxCharacters = 18) {
  const source = String(text || "").replace(/\s+/g, " ").trim();
  if (!source) return ["—"];
  const lines = [];
  let current = "";
  for (const character of source) {
    current += character;
    if (current.length >= maxCharacters) {
      lines.push(current);
      current = "";
    }
  }
  if (current) lines.push(current);
  return lines;
}

function appendCenteredLines(parent, lines, x, y, className, lineHeight = 16) {
  const element = svgElement("text", { x, y, class: className, "text-anchor": "middle" });
  lines.forEach((line, index) => element.append(svgElement("tspan", { x, dy: index === 0 ? 0 : lineHeight }, line)));
  parent.append(element);
  return element;
}

function nextPatchVersion(version) {
  const match = String(version || "").match(/^(\d+)\.(\d+)\.(\d+)$/);
  return match ? `${match[1]}.${match[2]}.${Number(match[3]) + 1}` : "0.1.0";
}

function toast(message, type = "success") {
  const item = document.createElement("div");
  item.className = `toast ${type === "error" ? "error" : ""}`;
  item.textContent = message;
  $("#toastRegion").append(item);
  setTimeout(() => item.remove(), 4200);
}

async function api(url, options = {}) {
  const response = await fetch(url, { cache: "no-store", ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || `请求失败：${response.status}`), { data, status: response.status });
  return data;
}

function buildDefaultPositions(stages) {
  const positions = {};
  const columns = 5;
  const nodeWidth = BPMN_OVERVIEW_NODE.width;
  const horizontalGap = 68;
  const verticalGap = 86;
  stages.forEach((stage, index) => {
    const row = Math.floor(index / columns);
    const withinRow = index % columns;
    const column = row % 2 === 0 ? withinRow : columns - 1 - withinRow;
    positions[stage.code] = { x: 88 + column * (nodeWidth + horizontalGap), y: 72 + row * (BPMN_OVERVIEW_NODE.height + verticalGap) };
  });
  return positions;
}

function stageMatches(stage, query) {
  if (!query) return true;
  const source = [stage.code, stage.title, stage.note, state.labels[stage.code], state.notes[stage.code], ...stage.actions.flatMap((action) => [
    action.id, action.action, action.output, action.support, action.specialist,
    ...action.linkedSkills.map((skill) => skill.name),
  ])].join(" ").toLowerCase();
  return source.includes(query.toLowerCase());
}

function stageDisplayTitle(stage) {
  return state.labels[stage.code] || stage.title;
}

function stageDisplayNote(stage) {
  return state.notes[stage.code] || stage.note;
}

function filteredStages() {
  const query = $("#workflowSearch")?.value.trim() || "";
  return state.data.workflow.stages.filter((stage) => stageMatches(stage, query));
}

function renderStageRail() {
  const stages = state.data.workflow.stages;
  const visible = new Set(filteredStages().map((stage) => stage.code));
  $("#stageCount").textContent = `${stages.length}阶段`;
  $("#stageList").innerHTML = stages.map((stage) => `
    <button class="stage-link ${stage.code === state.selectedStage ? "is-active" : ""} ${visible.has(stage.code) ? "" : "is-hidden"}" type="button" data-stage="${stage.code}" role="listitem">
      <span class="stage-code-small">${stage.code}</span>
      <span class="stage-name-small">${escapeHtml(stageDisplayTitle(stage))}</span>
      <em>${stage.actions.length}</em>
    </button>
  `).join("");
  $("#railSummary").innerHTML = `
    <strong>${state.data.stats.actionCount}</strong>项动作 · <strong>${state.data.stats.skillCount}</strong>个Skill<br>
    流程矩阵 v${escapeHtml(state.data.workflow.version)} · ${escapeHtml(state.data.workflow.updated)}
  `;
}

function getPosition(code) {
  return state.positions[code] || state.defaultPositions[code] || { x: 0, y: 0 };
}

function renderOverview() {
  const stages = filteredStages();
  const nodeLayer = $("#nodeLayer");
  const edgeLayer = $("#edgeLayer");
  nodeLayer.replaceChildren();
  edgeLayer.replaceChildren();
  $("#graphEmpty").hidden = stages.length > 0;
  const visibleCodes = new Set(stages.map((stage) => stage.code));
  const ordered = state.data.workflow.stages.filter((stage) => visibleCodes.has(stage.code));

  for (let index = 0; index < ordered.length - 1; index += 1) {
    const from = getPosition(ordered[index].code);
    const to = getPosition(ordered[index + 1].code);
    const startX = from.x + 238;
    const startY = from.y + 54;
    const endX = to.x;
    const endY = to.y + 54;
    const horizontal = Math.abs(endX - startX) > 100;
    const path = horizontal
      ? `M ${startX} ${startY} C ${startX + (endX - startX) * .45} ${startY}, ${startX + (endX - startX) * .55} ${endY}, ${endX} ${endY}`
      : `M ${startX - 119} ${from.y + 108} C ${startX - 119} ${from.y + 145}, ${endX + 119} ${to.y - 37}, ${endX + 119} ${to.y}`;
    edgeLayer.append(svgElement("path", {
      d: path,
      class: `graph-edge ${ordered[index].code === state.selectedStage || ordered[index + 1].code === state.selectedStage ? "is-active" : ""}`,
    }));
  }

  stages.forEach((stage) => {
    const position = getPosition(stage.code);
    const group = svgElement("g", {
      class: `stage-node ${stage.code === state.selectedStage ? "is-selected" : ""} ${state.layoutEditing ? "is-draggable" : ""}`,
      transform: `translate(${position.x} ${position.y})`,
      "data-stage": stage.code,
      tabindex: "0",
      role: "button",
      "aria-label": `${stage.code}. ${stageDisplayTitle(stage)}`,
    });
    group.append(svgElement("rect", { class: "node-card", x: 0, y: 0, width: 238, height: 108, rx: 12 }));
    group.append(svgElement("path", { class: "node-accent", d: "M0 12 Q0 0 12 0 H48 V108 H12 Q0 108 0 96 Z" }));
    group.append(svgElement("text", { class: "node-code", x: 24, y: 60, "text-anchor": "middle" }, stage.code));
    appendMultilineText(group, stageDisplayTitle(stage), 62, 29, "node-title", 13, 2, 18);
    group.append(svgElement("text", { class: "node-meta", x: 62, y: 78 }, `${stage.actions.length}项动作 · ${stage.skills.length} Skill`));
    const statuses = ["covered", "partial", "missing", "rule"];
    let dotX = 62;
    statuses.forEach((status) => {
      const count = stage.coverage[status];
      if (!count) return;
      group.append(svgElement("circle", { cx: dotX + 4, cy: 94, r: 4, class: `node-status-${status}` }));
      group.append(svgElement("text", { x: dotX + 12, y: 98, class: "node-meta" }, `${coverageLabels[status]} ${count}`));
      dotX += 58;
    });
    nodeLayer.append(group);
  });
  bindOverviewNodes();
}

function overviewSequencePath(from, to) {
  const width = BPMN_OVERVIEW_NODE.width;
  const height = BPMN_OVERVIEW_NODE.height;
  const fromCenterX = from.x + width / 2;
  const fromCenterY = from.y + height / 2;
  const toCenterX = to.x + width / 2;
  const toCenterY = to.y + height / 2;
  if (Math.abs(fromCenterY - toCenterY) < 18) {
    if (toCenterX >= fromCenterX) return "M " + (from.x + width) + " " + fromCenterY + " H " + to.x;
    return "M " + from.x + " " + fromCenterY + " H " + (to.x + width);
  }
  const midY = from.y + height + Math.max(18, (to.y - (from.y + height)) / 2);
  return "M " + fromCenterX + " " + (from.y + height) + " V " + midY + " H " + toCenterX + " V " + to.y;
}

function renderBpmnEvent(parent, x, y, type, label) {
  const group = svgElement("g", { class: "bpmn-event-group is-" + type });
  group.append(svgElement("circle", { cx: x, cy: y, r: 17, class: "bpmn-event bpmn-event-" + type }));
  if (type === "end") group.append(svgElement("circle", { cx: x, cy: y, r: 13, class: "bpmn-event-inner" }));
  group.append(svgElement("text", { x, y: y + 34, class: "bpmn-event-label", "text-anchor": "middle" }, label));
  parent.append(group);
  return group;
}

function renderBpmnOverview() {
  const stages = state.data.workflow.stages;
  const matchingCodes = new Set(filteredStages().map((stage) => stage.code));
  const nodeLayer = $("#nodeLayer");
  const edgeLayer = $("#edgeLayer");
  nodeLayer.replaceChildren();
  edgeLayer.replaceChildren();
  $("#graphEmpty").hidden = matchingCodes.size > 0;
  const ordered = stages;
  if (!ordered.length) return;

  const positions = ordered.map((stage) => getPosition(stage.code));
  const minX = Math.min(...positions.map((item) => item.x));
  const minY = Math.min(...positions.map((item) => item.y));
  const maxX = Math.max(...positions.map((item) => item.x + BPMN_OVERVIEW_NODE.width));
  const maxY = Math.max(...positions.map((item) => item.y + BPMN_OVERVIEW_NODE.height));
  const pool = { x: minX - 82, y: minY - 48, width: maxX - minX + 164, height: maxY - minY + 96 };
  edgeLayer.append(svgElement("rect", { x: pool.x, y: pool.y, width: pool.width, height: pool.height, class: "bpmn-pool" }));
  edgeLayer.append(svgElement("line", { x1: pool.x + 42, y1: pool.y, x2: pool.x + 42, y2: pool.y + pool.height, class: "bpmn-pool-divider" }));
  edgeLayer.append(svgElement("text", {
    x: 0,
    y: 0,
    class: "bpmn-pool-label",
    "text-anchor": "middle",
    transform: "translate(" + (pool.x + 22) + " " + (pool.y + pool.height / 2) + ") rotate(-90)",
  }, "诉讼全生命周期"));

  for (let index = 0; index < ordered.length - 1; index += 1) {
    const from = getPosition(ordered[index].code);
    const to = getPosition(ordered[index + 1].code);
    edgeLayer.append(svgElement("path", {
      d: overviewSequencePath(from, to),
      class: "bpmn-sequence-flow " + (ordered[index].code === state.selectedStage || ordered[index + 1].code === state.selectedStage ? "is-active" : ""),
    }));
  }

  const firstPosition = getPosition(ordered[0].code);
  const lastPosition = getPosition(ordered[ordered.length - 1].code);
  const previousPosition = ordered.length > 1 ? getPosition(ordered[ordered.length - 2].code) : firstPosition;
  const endOnLeft = lastPosition.x < previousPosition.x;
  const startEvent = { x: firstPosition.x - 42, y: firstPosition.y + BPMN_OVERVIEW_NODE.height / 2 };
  const endEvent = { x: endOnLeft ? lastPosition.x - 44 : lastPosition.x + BPMN_OVERVIEW_NODE.width + 44, y: lastPosition.y + BPMN_OVERVIEW_NODE.height / 2 };
  edgeLayer.append(svgElement("path", {
    d: "M " + (startEvent.x + 17) + " " + startEvent.y + " H " + firstPosition.x,
    class: "bpmn-sequence-flow",
  }));
  edgeLayer.append(svgElement("path", {
    d: endOnLeft
      ? "M " + lastPosition.x + " " + endEvent.y + " H " + (endEvent.x + 17)
      : "M " + (lastPosition.x + BPMN_OVERVIEW_NODE.width) + " " + endEvent.y + " H " + (endEvent.x - 17),
    class: "bpmn-sequence-flow",
  }));
  renderBpmnEvent(nodeLayer, startEvent.x, startEvent.y, "start", "开始");
  renderBpmnEvent(nodeLayer, endEvent.x, endEvent.y, "end", "归档");

  stages.forEach((stage) => {
    const position = getPosition(stage.code);
    const group = svgElement("g", {
      class: "stage-node " + (stage.code === state.selectedStage ? "is-selected " : "") + (state.layoutEditing ? "is-draggable " : "") + (matchingCodes.has(stage.code) ? "" : "is-search-muted"),
      transform: "translate(" + position.x + " " + position.y + ")",
      "data-stage": stage.code,
      tabindex: "0",
      role: "button",
      "aria-label": stage.code + ". " + stageDisplayTitle(stage),
    });
    group.append(svgElement("rect", { class: "bpmn-subprocess", x: 0, y: 0, width: BPMN_OVERVIEW_NODE.width, height: BPMN_OVERVIEW_NODE.height, rx: 9 }));
    group.append(svgElement("text", { class: "bpmn-stage-code", x: 14, y: 21 }, stage.code));
    appendMultilineText(group, stageDisplayTitle(stage), 34, 30, "bpmn-task-title", 16, 2, 19);
    group.append(svgElement("text", { class: "bpmn-task-meta", x: 34, y: 75 }, stage.actions.length + "项活动 · " + stage.skills.length + "个Skill"));
    group.append(svgElement("rect", { class: "bpmn-collapse-box", x: BPMN_OVERVIEW_NODE.width / 2 - 7, y: BPMN_OVERVIEW_NODE.height - 18, width: 14, height: 14 }));
    group.append(svgElement("line", { class: "bpmn-collapse-mark", x1: BPMN_OVERVIEW_NODE.width / 2 - 4, y1: BPMN_OVERVIEW_NODE.height - 11, x2: BPMN_OVERVIEW_NODE.width / 2 + 4, y2: BPMN_OVERVIEW_NODE.height - 11 }));
    group.append(svgElement("line", { class: "bpmn-collapse-mark", x1: BPMN_OVERVIEW_NODE.width / 2, y1: BPMN_OVERVIEW_NODE.height - 15, x2: BPMN_OVERVIEW_NODE.width / 2, y2: BPMN_OVERVIEW_NODE.height - 7 }));
    nodeLayer.append(group);
  });
  bindOverviewNodes();
}

function laneCard(parent, x, y, width, height, title, copy, type = "") {
  const group = svgElement("g", { class: "lane-item" });
  group.append(svgElement("rect", { x, y, width, height, rx: 8, class: `lane-card ${type ? `is-${type}` : ""}` }));
  appendMultilineText(group, title, x + 10, y + 21, "lane-card-title", 15, 1, 15);
  appendMultilineText(group, copy, x + 10, y + 42, "lane-card-copy", 23, 3, 14);
  parent.append(group);
  return group;
}

function renderLanes() {
  const stage = state.data.workflow.stages.find((item) => item.code === state.selectedStage) || state.data.workflow.stages[0];
  const nodeLayer = $("#nodeLayer");
  const edgeLayer = $("#edgeLayer");
  nodeLayer.replaceChildren();
  edgeLayer.replaceChildren();
  $("#graphEmpty").hidden = Boolean(stage);
  if (!stage) return;
  const labels = ["律师操作", "AI自动处理", "律师判断门槛", "调用Skill", "记录与产出"];
  const laneHeight = 114;
  const labelWidth = 148;
  const cardWidth = 190;
  const columnGap = 22;
  const startX = 178;
  const startY = 38;
  labels.forEach((label, index) => {
    const y = startY + index * laneHeight;
    nodeLayer.append(svgElement("rect", { x: 20, y, width: labelWidth, height: 94, rx: 9, class: "lane-label" }));
    nodeLayer.append(svgElement("text", { x: 94, y: y + 52, class: "lane-label-text", "text-anchor": "middle" }, label));
    nodeLayer.append(svgElement("rect", { x: startX, y, width: Math.max(900, stage.actions.length * (cardWidth + columnGap)), height: 94, rx: 9, class: "lane-bg" }));
  });

  stage.actions.forEach((action, index) => {
    const x = startX + 12 + index * (cardWidth + columnGap);
    const skillText = action.linkedSkills.length ? action.linkedSkills.map((skill) => skill.name).join(" / ") : action.support;
    const cards = [
      [action.id, action.lawyerGate ? "下达指令、补充材料或完成专业判断" : "提供输入并监督执行", ""],
      [action.id, action.action, ""],
      [action.lawyerGate ? "需律师判断" : "可按规则继续", action.specialist, action.lawyerGate ? "gate" : ""],
      [action.linkedSkills.map((skill) => skill.code).join(" + ") || "规则/工具", skillText, "skill"],
      ["输出", action.output, "output"],
    ];
    cards.forEach(([title, copy, type], laneIndex) => {
      const card = laneCard(nodeLayer, x, startY + laneIndex * laneHeight + 7, cardWidth, 80, title, copy, type);
      card.setAttribute("data-action", action.id);
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.addEventListener("click", () => selectAction(stage.code, action.id));
    });
  });
}

function bpmnDetailMetrics(stage) {
  const taskWidth = 236;
  const taskGap = 276;
  const maxLines = Math.max(1, ...stage.actions.map((action) => wrapTextAll(action.action, 15).length));
  const taskHeight = Math.max(92, 48 + maxLines * 16);
  const laneHeight = Math.max(190, taskHeight + 68);
  const poolX = 28;
  const poolY = 54;
  const laneHeaderWidth = 58;
  const firstTaskX = poolX + laneHeaderWidth + 112;
  const poolWidth = laneHeaderWidth + 178 + Math.max(1, stage.actions.length) * taskGap + 64;
  return {
    taskWidth,
    taskGap,
    taskHeight,
    laneHeight,
    poolX,
    poolY,
    laneHeaderWidth,
    firstTaskX,
    poolWidth,
    poolHeight: laneHeight * 2,
  };
}

function bpmnDetailSequencePath(from, to) {
  if (Math.abs(from.y - to.y) < 4) return "M " + from.x + " " + from.y + " H " + to.x;
  const midX = from.x + (to.x - from.x) / 2;
  return "M " + from.x + " " + from.y + " H " + midX + " V " + to.y + " H " + to.x;
}

function renderBpmnLanes() {
  const stage = state.data.workflow.stages.find((item) => item.code === state.selectedStage) || state.data.workflow.stages[0];
  const nodeLayer = $("#nodeLayer");
  const edgeLayer = $("#edgeLayer");
  nodeLayer.replaceChildren();
  edgeLayer.replaceChildren();
  $("#graphEmpty").hidden = Boolean(stage);
  if (!stage) return;

  const metric = bpmnDetailMetrics(stage);
  edgeLayer.append(svgElement("text", {
    x: metric.poolX + metric.laneHeaderWidth,
    y: metric.poolY - 18,
    class: "bpmn-diagram-title",
  }, stage.code + " · " + stageDisplayTitle(stage)));
  edgeLayer.append(svgElement("rect", {
    x: metric.poolX,
    y: metric.poolY,
    width: metric.poolWidth,
    height: metric.poolHeight,
    class: "bpmn-pool",
  }));
  edgeLayer.append(svgElement("line", {
    x1: metric.poolX,
    y1: metric.poolY + metric.laneHeight,
    x2: metric.poolX + metric.poolWidth,
    y2: metric.poolY + metric.laneHeight,
    class: "bpmn-lane-divider",
  }));
  edgeLayer.append(svgElement("line", {
    x1: metric.poolX + metric.laneHeaderWidth,
    y1: metric.poolY,
    x2: metric.poolX + metric.laneHeaderWidth,
    y2: metric.poolY + metric.poolHeight,
    class: "bpmn-pool-divider",
  }));
  [
    ["律师", metric.poolY + metric.laneHeight / 2],
    ["AI / Codex", metric.poolY + metric.laneHeight + metric.laneHeight / 2],
  ].forEach(([label, centerY]) => {
    edgeLayer.append(svgElement("text", {
      x: 0,
      y: 0,
      class: "bpmn-lane-label",
      "text-anchor": "middle",
      transform: "translate(" + (metric.poolX + metric.laneHeaderWidth / 2) + " " + centerY + ") rotate(-90)",
    }, label));
  });

  const taskPositions = stage.actions.map((action, index) => {
    const laneIndex = action.lawyerGate ? 0 : 1;
    return {
      action,
      x: metric.firstTaskX + index * metric.taskGap,
      y: metric.poolY + laneIndex * metric.laneHeight + (metric.laneHeight - metric.taskHeight) / 2,
      laneIndex,
    };
  });
  const firstTask = taskPositions[0];
  const lastTask = taskPositions[taskPositions.length - 1];
  const startEvent = {
    x: metric.poolX + metric.laneHeaderWidth + 48,
    y: metric.poolY + (firstTask?.laneIndex || 0) * metric.laneHeight + metric.laneHeight / 2,
  };
  const endEvent = {
    x: (lastTask?.x || metric.firstTaskX) + metric.taskWidth + 54,
    y: metric.poolY + (lastTask?.laneIndex || 0) * metric.laneHeight + metric.laneHeight / 2,
  };

  if (firstTask) {
    edgeLayer.append(svgElement("path", {
      d: bpmnDetailSequencePath(
        { x: startEvent.x + 17, y: startEvent.y },
        { x: firstTask.x, y: firstTask.y + metric.taskHeight / 2 },
      ),
      class: "bpmn-sequence-flow",
    }));
  }
  for (let index = 0; index < taskPositions.length - 1; index += 1) {
    const from = taskPositions[index];
    const to = taskPositions[index + 1];
    edgeLayer.append(svgElement("path", {
      d: bpmnDetailSequencePath(
        { x: from.x + metric.taskWidth, y: from.y + metric.taskHeight / 2 },
        { x: to.x, y: to.y + metric.taskHeight / 2 },
      ),
      class: "bpmn-sequence-flow " + (state.selectedAction === from.action.id || state.selectedAction === to.action.id ? "is-active" : ""),
    }));
  }
  if (lastTask) {
    edgeLayer.append(svgElement("path", {
      d: bpmnDetailSequencePath(
        { x: lastTask.x + metric.taskWidth, y: lastTask.y + metric.taskHeight / 2 },
        { x: endEvent.x - 17, y: endEvent.y },
      ),
      class: "bpmn-sequence-flow",
    }));
  }

  renderBpmnEvent(nodeLayer, startEvent.x, startEvent.y, "start", "阶段开始");
  renderBpmnEvent(nodeLayer, endEvent.x, endEvent.y, "end", "阶段完成");
  taskPositions.forEach(({ action, x, y, laneIndex }) => {
    const group = svgElement("g", {
      class: "bpmn-task-group " + (state.selectedAction === action.id ? "is-selected" : ""),
      "data-action": action.id,
      role: "button",
      tabindex: "0",
      "aria-label": action.id + ". " + action.action,
    });
    group.append(svgElement("rect", {
      x,
      y,
      width: metric.taskWidth,
      height: metric.taskHeight,
      rx: 9,
      class: "bpmn-task " + (laneIndex === 0 ? "is-user-task" : "is-ai-task"),
    }));
    group.append(svgElement("text", { x: x + 12, y: y + 20, class: "bpmn-action-id" }, action.id));
    const lines = wrapTextAll(action.action, 15);
    const firstLineY = y + metric.taskHeight / 2 - ((lines.length - 1) * 16) / 2 + 4;
    appendCenteredLines(group, lines, x + metric.taskWidth / 2, firstLineY, "bpmn-action-label", 16);
    if (action.lawyerGate) {
      group.append(svgElement("circle", { cx: x + 16, cy: y + metric.taskHeight - 17, r: 4, class: "bpmn-user-head" }));
      group.append(svgElement("path", { d: "M " + (x + 10) + " " + (y + metric.taskHeight - 7) + " Q " + (x + 16) + " " + (y + metric.taskHeight - 14) + " " + (x + 22) + " " + (y + metric.taskHeight - 7), class: "bpmn-user-body" }));
      group.append(svgElement("text", { x: x + 28, y: y + metric.taskHeight - 8, class: "bpmn-task-kind" }, "律师判断"));
    } else {
      group.append(svgElement("circle", { cx: x + 15, cy: y + metric.taskHeight - 12, r: 7, class: "bpmn-service-ring" }));
      group.append(svgElement("circle", { cx: x + 15, cy: y + metric.taskHeight - 12, r: 2, class: "bpmn-service-core" }));
      group.append(svgElement("text", { x: x + 28, y: y + metric.taskHeight - 8, class: "bpmn-task-kind" }, "AI自动处理"));
    }
    group.addEventListener("click", () => selectAction(stage.code, action.id));
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") selectAction(stage.code, action.id);
    });
    nodeLayer.append(group);
  });
}

function renderGraph() {
  if (!state.data) return;
  if (state.canvasMode === "overview") renderBpmnOverview();
  else renderBpmnLanes();
  $("#canvasHelp").textContent = state.canvasMode === "overview"
    ? "BPMN 2.0：开始事件 → 折叠子流程 → 结束事件 · 点击子流程查看全部活动"
    : "BPMN 2.0：Pool内以律师、AI / Codex两条Lane组织原有活动 · 拖动画布横向浏览全部Task";
  applyViewport();
}

function applyViewport() {
  $("#graphTransform").setAttribute("transform", `translate(${state.viewport.x} ${state.viewport.y}) scale(${state.viewport.scale})`);
  $("#zoomValue").textContent = `${Math.round(state.viewport.scale * 100)}%`;
}

function graphBounds() {
  if (state.canvasMode === "lanes") {
    const stage = state.data.workflow.stages.find((item) => item.code === state.selectedStage);
    if (!stage) return { x: 0, y: 0, width: 1100, height: 520 };
    const metric = bpmnDetailMetrics(stage);
    return { x: 0, y: 10, width: metric.poolX + metric.poolWidth + 42, height: metric.poolY + metric.poolHeight + 72 };
  }
  const matches = filteredStages();
  if (!matches.length) return { x: 0, y: 0, width: 1000, height: 700 };
  const stages = state.data.workflow.stages;
  const xs = stages.map((stage) => getPosition(stage.code).x);
  const ys = stages.map((stage) => getPosition(stage.code).y);
  const minX = Math.min(...xs) - 92;
  const minY = Math.min(...ys) - 58;
  const maxX = Math.max(...xs) + BPMN_OVERVIEW_NODE.width + 74;
  const maxY = Math.max(...ys) + BPMN_OVERVIEW_NODE.height + 58;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function fitGraph() {
  const viewport = $("#graphViewport");
  const bounds = graphBounds();
  const width = viewport.clientWidth || 1000;
  const height = viewport.clientHeight || 700;
  if (state.canvasMode === "lanes") {
    const scale = Math.min(1, Math.max(.58, (height / bounds.height) * .88));
    state.viewport.scale = scale;
    state.viewport.x = 24 - bounds.x * scale;
    state.viewport.y = (height - bounds.height * scale) / 2 - bounds.y * scale;
    applyViewport();
    return;
  }
  const scale = Math.min(1.18, Math.max(.28, Math.min(width / bounds.width, height / bounds.height) * .92));
  state.viewport.scale = scale;
  state.viewport.x = (width - bounds.width * scale) / 2 - bounds.x * scale;
  state.viewport.y = (height - bounds.height * scale) / 2 - bounds.y * scale;
  applyViewport();
}

function zoomAt(factor, screenX = null, screenY = null) {
  const rect = $("#graphViewport").getBoundingClientRect();
  const cx = screenX ?? rect.width / 2;
  const cy = screenY ?? rect.height / 2;
  const oldScale = state.viewport.scale;
  const nextScale = Math.min(2.2, Math.max(.25, oldScale * factor));
  const worldX = (cx - state.viewport.x) / oldScale;
  const worldY = (cy - state.viewport.y) / oldScale;
  state.viewport.scale = nextScale;
  state.viewport.x = cx - worldX * nextScale;
  state.viewport.y = cy - worldY * nextScale;
  applyViewport();
}

function bindOverviewNodes() {
  $$(".stage-node", $("#nodeLayer")).forEach((node) => {
    const code = node.dataset.stage;
    node.addEventListener("click", (event) => {
      if (state.draggingNode?.moved) return;
      event.stopPropagation();
      selectStage(code);
    });
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") selectStage(code);
    });
    node.addEventListener("pointerdown", (event) => {
      if (!state.layoutEditing) return;
      event.stopPropagation();
      node.setPointerCapture(event.pointerId);
      const position = getPosition(code);
      state.draggingNode = {
        code,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        nodeX: position.x,
        nodeY: position.y,
        moved: false,
      };
    });
    node.addEventListener("pointermove", (event) => {
      const drag = state.draggingNode;
      if (!drag || drag.code !== code || drag.pointerId !== event.pointerId) return;
      const dx = (event.clientX - drag.startX) / state.viewport.scale;
      const dy = (event.clientY - drag.startY) / state.viewport.scale;
      if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
      state.positions[code] = { x: Math.round(drag.nodeX + dx), y: Math.round(drag.nodeY + dy) };
      renderOverview();
      applyViewport();
    });
    node.addEventListener("pointerup", (event) => {
      if (state.draggingNode?.pointerId === event.pointerId) {
        setTimeout(() => { state.draggingNode = null; }, 0);
      }
    });
  });
}

function selectStage(code) {
  state.selectedStage = code;
  state.selectedAction = null;
  renderStageRail();
  renderInspector();
  renderGraph();
  $("#inspector").classList.add("is-open");
}

function selectAction(stageCode, actionId) {
  state.selectedStage = stageCode;
  state.selectedAction = actionId;
  renderStageRail();
  renderInspector();
  $("#inspector").classList.add("is-open");
}

function templatesForStage(stageCode) {
  const needles = stageTemplateMap[stageCode] || [];
  if (!needles.length) return [];
  return state.data.templates.filter((template) => needles.some((needle) => `${template.documentType} ${template.stage}`.includes(needle))).slice(0, 8);
}

function renderInspector() {
  const stage = state.data.workflow.stages.find((item) => item.code === state.selectedStage);
  if (!stage) return;
  const templates = templatesForStage(stage.code);
  $("#inspector").innerHTML = `
    <div class="inspector-content">
      <section class="inspector-stage-head">
        <div class="stage-title-row"><span class="stage-letter">${stage.code}</span><div><p class="section-label">WORKFLOW STAGE</p><h2>${escapeHtml(stageDisplayTitle(stage))}</h2></div></div>
        <p>${escapeHtml(stageDisplayNote(stage) || "本阶段按项目规则、适用Skill和当前Matter指令执行。")}</p>
        <div class="metric-row">
          <div><span>动作</span><strong>${stage.actions.length}</strong></div>
          <div><span>关联Skill</span><strong>${stage.skills.length}</strong></div>
          <div><span>律师门槛</span><strong>${stage.actions.filter((item) => item.lawyerGate).length}</strong></div>
        </div>
      </section>
      ${state.layoutEditing ? `<section class="inspector-section visual-edit">
        <div class="inspector-section-head"><h3>图示显示设置</h3><span class="section-label">LOCAL LAYOUT</span></div>
        <label><span>阶段显示名称</span><input id="visualStageTitle" value="${escapeHtml(stageDisplayTitle(stage))}" maxlength="80"></label>
        <label><span>阶段显示备注</span><textarea id="visualStageNote" rows="3" maxlength="500">${escapeHtml(stageDisplayNote(stage) || "")}</textarea></label>
        <button id="applyVisualStageEdit" class="tool-button" type="button">应用到图示</button>
        <p class="field-hint">仅修改本网站的显示层，不改动生命周期矩阵或Skill正文；点击顶部“保存布局”后持久化。</p>
      </section>` : ""}
      <section class="inspector-section">
        <div class="inspector-section-head"><h3>调用的Skill</h3><span class="section-label">DIRECT EDIT</span></div>
        <div class="skill-chips">${stage.skills.length ? stage.skills.map((skill) => `<button class="skill-chip" type="button" data-edit-skill="${escapeHtml(skill.name)}">${escapeHtml(skill.code)} · ${escapeHtml(skill.name)}</button>`).join("") : "<span class='template-path'>本阶段以规则、模板或尚待建立的专用Skill为主</span>"}</div>
      </section>
      ${templates.length ? `<section class="inspector-section"><div class="inspector-section-head"><h3>相关模板</h3></div><div class="skill-chips">${templates.map((item) => `<span class="skill-chip">${escapeHtml(item.id)} · ${escapeHtml(item.title)}</span>`).join("")}</div></section>` : ""}
      <section class="inspector-section">
        <div class="inspector-section-head"><h3>阶段动作</h3><span class="section-label">${stage.actions.length} ACTIONS</span></div>
        <div class="action-list">${stage.actions.map((action) => `
          <article class="action-card">
            <button type="button" data-action-select="${action.id}">
              <span class="action-id">${action.id}</span><span class="action-title">${escapeHtml(action.action)}</span>${action.lawyerGate ? "<i class='gate-dot' title='存在律师判断门槛'></i>" : "<span></span>"}
            </button>
            ${state.selectedAction === action.id ? `<div class="action-detail"><p><strong>输出：</strong>${escapeHtml(action.output)}</p><p><strong>支撑：</strong>${escapeHtml(action.support)}</p><p><strong>专责判断：</strong>${escapeHtml(action.specialist)}</p>${action.linkedSkills.length ? `<div class="skill-chips">${action.linkedSkills.map((skill) => `<button class="skill-chip" type="button" data-edit-skill="${escapeHtml(skill.name)}">编辑 ${escapeHtml(skill.name)}</button>`).join("")}</div>` : ""}</div>` : ""}
          </article>
        `).join("")}</div>
      </section>
    </div>
  `;
  $$('[data-edit-skill]', $("#inspector")).forEach((button) => button.addEventListener("click", () => openSkillEditor(button.dataset.editSkill)));
  $$('[data-action-select]', $("#inspector")).forEach((button) => button.addEventListener("click", () => selectAction(stage.code, button.dataset.actionSelect)));
  $("#applyVisualStageEdit", $("#inspector"))?.addEventListener("click", () => {
    const title = $("#visualStageTitle").value.trim();
    const note = $("#visualStageNote").value.trim();
    if (!title) {
      toast("阶段显示名称不能为空", "error");
      return;
    }
    if (title === stage.title) delete state.labels[stage.code];
    else state.labels[stage.code] = title;
    if (note === (stage.note || "")) delete state.notes[stage.code];
    else if (note) state.notes[stage.code] = note;
    else delete state.notes[stage.code];
    renderStageRail();
    renderInspector();
    renderGraph();
    $("#layoutStatus").textContent = "显示修改尚未保存";
  });
}

function renderSkills() {
  const query = $("#skillSearch").value.trim().toLowerCase();
  const skills = state.data.skills.filter((skill) => `${skill.name} ${skill.description} ${skill.version}`.toLowerCase().includes(query));
  $("#skillGrid").innerHTML = skills.length ? skills.map((skill) => `
    <button class="skill-card" type="button" data-edit-skill="${escapeHtml(skill.name)}">
      <div class="skill-card-top"><span class="status-badge ${skill.active ? "active" : "disabled"}">${skill.active ? "ACTIVE FOR TESTING" : "未激活"}</span><span class="skill-version">v${escapeHtml(skill.version)}</span></div>
      <h3>${escapeHtml(skill.name)}</h3>
      <p>${escapeHtml(skill.description)}</p>
      <footer><span>${escapeHtml(skill.status)}</span><span>${escapeHtml(skill.lastReviewed || "未标注日期")}</span></footer>
    </button>
  `).join("") : `<div class="empty-table">没有匹配的Skill</div>`;
  $$('[data-edit-skill]', $("#skillGrid")).forEach((button) => button.addEventListener("click", () => openSkillEditor(button.dataset.editSkill)));
}

function renderTemplates() {
  const query = $("#templateSearch").value.trim().toLowerCase();
  const templates = state.data.templates.filter((template) => `${template.id} ${template.title} ${template.documentType} ${template.stage} ${template.path}`.toLowerCase().includes(query));
  $("#templateTableBody").innerHTML = templates.length ? templates.map((template) => `
    <tr>
      <td><strong>${escapeHtml(template.title)}</strong><span class="template-id">${escapeHtml(template.id)}</span></td>
      <td>${escapeHtml(template.documentType || "未标注")}</td>
      <td>${escapeHtml(template.stage || "未标注")}</td>
      <td><span class="status-badge ${template.enabled ? "active" : "disabled"}">${template.enabled ? "起草启用" : "历史/停用"}</span></td>
      <td><span class="template-path">${escapeHtml(template.path)}</span></td>
    </tr>
  `).join("") : `<tr><td colspan="5" class="empty-table">没有匹配的模板</td></tr>`;
}

function renderHistory() {
  const entries = state.data.directEdits || [];
  $("#historyList").innerHTML = entries.length ? entries.map((entry) => `
    <article class="history-item">
      <div class="history-head"><strong>${escapeHtml(entry.skill)} · v${escapeHtml(entry.newVersion)}</strong><span>${new Date(entry.editedAt).toLocaleString("zh-CN")}</span></div>
      <p><strong>原因：</strong>${escapeHtml(entry.reason)}</p><p><strong>摘要：</strong>${escapeHtml(entry.summary)}</p>
      <div class="history-meta"><span>${escapeHtml(entry.previousVersion)} → ${escapeHtml(entry.newVersion)}</span><span>回归：${escapeHtml(entry.regressionStatus)}</span><span>${escapeHtml(entry.id)}</span></div>
    </article>
  `).join("") : `<div class="empty-table">尚无网页直接修改记录</div>`;
}

function navigate(view) {
  state.activeView = view;
  $$(".view-tab").forEach((item) => item.classList.toggle("is-active", item.dataset.view === view));
  $$(".app-view").forEach((item) => item.classList.toggle("is-active", item.id === `${view}View`));
  if (view === "workflow") setTimeout(fitGraph, 0);
}

async function openSkillEditor(name) {
  try {
    const detail = await api(`/api/skills/${encodeURIComponent(name)}`);
    state.editor = { name, baseHash: detail.hash, previewValid: false, previewSignature: null };
    $("#editorTitle").textContent = name;
    $("#editorPath").textContent = detail.relativePath;
    $("#currentVersion").value = detail.metadata.version || "";
    $("#newVersion").value = nextPatchVersion(detail.metadata.version);
    $("#editReason").value = "";
    $("#editSummary").value = "";
    $("#skillContent").value = detail.content;
    $("#diffPanel").hidden = true;
    $("#saveSkillButton").hidden = true;
    $("#editorStatus").textContent = "";
    $("#skillEditor").showModal();
  } catch (error) {
    toast(error.message, "error");
  }
}

function skillEditPayload() {
  return {
    baseHash: state.editor.baseHash,
    newVersion: $("#newVersion").value.trim(),
    reason: $("#editReason").value.trim(),
    summary: $("#editSummary").value.trim(),
    content: $("#skillContent").value,
  };
}

function payloadSignature(payload) {
  return JSON.stringify(payload);
}

function invalidatePreview() {
  state.editor.previewValid = false;
  state.editor.previewSignature = null;
  $("#saveSkillButton").hidden = true;
  if (!$("#diffPanel").hidden) $("#editorStatus").textContent = "内容已变化，请重新检查";
}

function showValidation(result) {
  const messages = [];
  (result.validation?.errors || []).forEach((message) => messages.push(`<div class="error">错误：${escapeHtml(message)}</div>`));
  (result.validation?.warnings || []).forEach((message) => messages.push(`<div class="warning">提示：${escapeHtml(message)}</div>`));
  if (result.externalValidation?.ok && !(result.validation?.errors || []).length) messages.push(`<div class="pass">结构校验通过：${escapeHtml(result.externalValidation.output)}</div>`);
  $("#validationMessages").innerHTML = messages.join("") || `<div class="pass">检查通过</div>`;
  $("#diffStats").textContent = `第${result.diff.startLine}行起 · 删除${result.diff.removedLines}行 · 新增${result.diff.addedLines}行`;
  $("#diffBefore").textContent = result.diff.before || "（无）";
  $("#diffAfter").textContent = result.diff.after || "（无）";
  $("#diffPanel").hidden = false;
}

async function previewSkillEdit() {
  const payload = skillEditPayload();
  $("#editorStatus").textContent = "正在执行结构检查…";
  try {
    const result = await api(`/api/skills/${encodeURIComponent(state.editor.name)}/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Workflow-Editor": "1" },
      body: JSON.stringify(payload),
    });
    $("#skillContent").value = result.managedContent;
    const managedPayload = skillEditPayload();
    state.editor.previewValid = result.ok;
    state.editor.previewSignature = payloadSignature(managedPayload);
    showValidation(result);
    $("#saveSkillButton").hidden = !result.ok;
    $("#editorStatus").textContent = result.ok ? "检查通过，确认后将直接写入" : "检查未通过";
  } catch (error) {
    if (error.data?.validation && error.data?.diff) showValidation(error.data);
    $("#editorStatus").textContent = error.message;
    toast(error.message, "error");
  }
}

async function saveSkillEdit() {
  const payload = skillEditPayload();
  if (!state.editor.previewValid || state.editor.previewSignature !== payloadSignature(payload)) {
    invalidatePreview();
    toast("内容已变化，请重新检查后再写入", "error");
    return;
  }
  $("#editorStatus").textContent = "正在备份并写入…";
  $("#saveSkillButton").disabled = true;
  try {
    const result = await api(`/api/skills/${encodeURIComponent(state.editor.name)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Workflow-Editor": "1" },
      body: JSON.stringify(payload),
    });
    toast(`已写入 ${state.editor.name} v${result.detail.metadata.version}`);
    $("#skillEditor").close();
    await loadSystem(false);
    navigate("skills");
  } catch (error) {
    $("#editorStatus").textContent = error.message;
    toast(error.message, "error");
  } finally {
    $("#saveSkillButton").disabled = false;
  }
}

function setLayoutEditing(enabled) {
  state.layoutEditing = enabled;
  $("#layoutEditButton").hidden = enabled || state.canvasMode !== "overview";
  $("#layoutSaveButton").hidden = !enabled || state.canvasMode !== "overview";
  $("#layoutResetButton").hidden = !enabled || state.canvasMode !== "overview";
  $("#graphViewport").classList.toggle("is-editing", enabled);
  $("#canvasNotice").hidden = !enabled;
  $("#canvasNotice").textContent = enabled ? "BPMN布局编辑已开启：拖动折叠子流程，完成后点击“保存布局”。这不会修改活动内容或Skill。" : "";
  renderInspector();
  renderGraph();
}

async function saveLayout() {
  try {
    const result = await api("/api/layout", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Workflow-Editor": "1" },
      body: JSON.stringify({ positions: state.positions, labels: state.labels, notes: state.notes }),
    });
    state.data.layout = result.layout;
    $("#layoutStatus").textContent = `布局已保存 · ${new Date(result.layout.updatedAt).toLocaleString("zh-CN")}`;
    setLayoutEditing(false);
    toast("流程图布局已保存");
  } catch (error) {
    toast(error.message, "error");
  }
}

function resetLayout() {
  state.positions = structuredClone(state.defaultPositions);
  state.labels = {};
  state.notes = {};
  renderStageRail();
  renderInspector();
  renderGraph();
  fitGraph();
  $("#layoutStatus").textContent = "已恢复默认布局，尚未保存";
}

function exportSvg() {
  const original = $("#workflowGraph");
  const clone = original.cloneNode(true);
  const bounds = graphBounds();
  clone.setAttribute("xmlns", NS);
  clone.setAttribute("viewBox", `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);
  clone.setAttribute("width", String(Math.round(bounds.width)));
  clone.setAttribute("height", String(Math.round(bounds.height)));
  const transform = $("#graphTransform", clone);
  transform.removeAttribute("transform");
  const style = svgElement("style", {}, `
    .node-card{fill:#fff;stroke:#cdd1d4;stroke-width:1.4}.node-accent{fill:#7f1828}.node-code{fill:#fff;font:800 18px 'Microsoft YaHei'}
    .node-title{fill:#161a1d;font:700 14px 'Microsoft YaHei'}.node-meta{fill:#687078;font:11px 'Microsoft YaHei'}
    .graph-edge{fill:none;stroke:#aeb4b9;stroke-width:2}.lane-label,.lane-card,.lane-bg{fill:#fff;stroke:#d7dadd}.lane-label-text,.lane-card-title{fill:#161a1d;font:700 13px 'Microsoft YaHei'}.lane-card-copy{fill:#5f666c;font:11px 'Microsoft YaHei'}
    .node-status-covered{fill:#247254}.node-status-partial{fill:#a2601b}.node-status-missing{fill:#a62d32}.node-status-rule{fill:#687078}
    .bpmn-pool{fill:#fff;stroke:#8e959a;stroke-width:1.4}.bpmn-pool-divider,.bpmn-lane-divider{stroke:#aab0b5;stroke-width:1.2}
    .bpmn-pool-label,.bpmn-lane-label{fill:#343a3f;font:700 13px 'Microsoft YaHei'}.bpmn-diagram-title{fill:#161a1d;font:700 17px SimSun,serif}
    .bpmn-sequence-flow{fill:none;stroke:#555d62;stroke-width:1.8;marker-end:url(#arrowHead)}.bpmn-event{fill:#fff;stroke:#2f3438;stroke-width:1.8}.bpmn-event-end{stroke-width:2.8}.bpmn-event-inner{fill:none;stroke:#2f3438}.bpmn-event-label{fill:#4d5459;font:600 11px 'Microsoft YaHei'}
    .bpmn-subprocess,.bpmn-task{fill:#fff;stroke:#596066;stroke-width:1.5}.bpmn-stage-code,.bpmn-action-id{fill:#7f1828;font:800 11px 'Microsoft YaHei'}.bpmn-task-title{fill:#161a1d;font:700 14px 'Microsoft YaHei'}.bpmn-task-meta,.bpmn-task-kind{fill:#687078;font:10px 'Microsoft YaHei'}.bpmn-action-label{fill:#161a1d;font:600 12.5px 'Microsoft YaHei'}
    .bpmn-collapse-box{fill:#fff;stroke:#4f565b}.bpmn-collapse-mark,.bpmn-user-head,.bpmn-user-body,.bpmn-service-ring{fill:none;stroke:#555d62}.bpmn-service-core{fill:#555d62}
  `);
  clone.insertBefore(style, clone.firstChild);
  const xml = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `汪佳成诉讼律师工作流_${state.canvasMode === "overview" ? "全生命周期" : state.selectedStage}.svg`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function bindGraphPanAndZoom() {
  const svg = $("#workflowGraph");
  svg.addEventListener("wheel", (event) => {
    event.preventDefault();
    const rect = svg.getBoundingClientRect();
    zoomAt(event.deltaY < 0 ? 1.1 : .9, event.clientX - rect.left, event.clientY - rect.top);
  }, { passive: false });
  svg.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".stage-node") || event.target.closest(".lane-item")) return;
    svg.setPointerCapture(event.pointerId);
    state.panning = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: state.viewport.x, y: state.viewport.y };
    $("#graphViewport").classList.add("is-panning");
  });
  svg.addEventListener("pointermove", (event) => {
    if (!state.panning || state.panning.pointerId !== event.pointerId) return;
    state.viewport.x = state.panning.x + event.clientX - state.panning.startX;
    state.viewport.y = state.panning.y + event.clientY - state.panning.startY;
    applyViewport();
  });
  svg.addEventListener("pointerup", (event) => {
    if (state.panning?.pointerId === event.pointerId) state.panning = null;
    $("#graphViewport").classList.remove("is-panning");
  });
}

function bindEvents() {
  $$(".view-tab").forEach((button) => button.addEventListener("click", () => navigate(button.dataset.view)));
  $("#workflowSearch").addEventListener("input", () => { renderStageRail(); renderGraph(); fitGraph(); });
  $("#skillSearch").addEventListener("input", renderSkills);
  $("#templateSearch").addEventListener("input", renderTemplates);
  $("#stageList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-stage]");
    if (button) selectStage(button.dataset.stage);
  });
  $$('[data-canvas-mode]').forEach((button) => button.addEventListener("click", () => {
    if (state.layoutEditing) setLayoutEditing(false);
    state.canvasMode = button.dataset.canvasMode;
    $$('[data-canvas-mode]').forEach((item) => item.classList.toggle("is-active", item === button));
    if (state.canvasMode === "lanes" && !state.selectedStage) state.selectedStage = state.data.workflow.stages[0]?.code;
    $("#layoutEditButton").hidden = state.canvasMode !== "overview";
    renderStageRail(); renderInspector(); renderGraph(); setTimeout(fitGraph, 0);
  }));
  $("#layoutEditButton").addEventListener("click", () => setLayoutEditing(true));
  $("#layoutSaveButton").addEventListener("click", saveLayout);
  $("#layoutResetButton").addEventListener("click", resetLayout);
  $("#zoomInButton").addEventListener("click", () => zoomAt(1.12));
  $("#zoomOutButton").addEventListener("click", () => zoomAt(.88));
  $("#zoomValue").addEventListener("click", fitGraph);
  $("#exportButton").addEventListener("click", exportSvg);
  $("#printButton").addEventListener("click", () => window.print());
  $("#previewSkillButton").addEventListener("click", previewSkillEdit);
  $("#saveSkillButton").addEventListener("click", saveSkillEdit);
  $("#skillEditorForm").addEventListener("input", invalidatePreview);
  bindGraphPanAndZoom();
  window.addEventListener("resize", () => { if (state.data && state.activeView === "workflow") fitGraph(); });
}

async function loadSystem(initial = true) {
  $("#syncStatus").textContent = "正在读取母库";
  try {
    const data = await api("/api/system");
    state.data = data;
    state.defaultPositions = buildDefaultPositions(data.workflow.stages);
    state.positions = { ...structuredClone(state.defaultPositions), ...(data.layout?.positions || {}) };
    state.labels = { ...(data.layout?.labels || {}) };
    state.notes = { ...(data.layout?.notes || {}) };
    if (!state.selectedStage) state.selectedStage = data.workflow.stages[0]?.code || null;
    $("#syncStatus").textContent = `${data.stats.stageCount}阶段 · ${data.stats.skillCount} Skills`;
    $("#layoutStatus").textContent = data.layout?.updatedAt ? `布局更新 ${new Date(data.layout.updatedAt).toLocaleString("zh-CN")}` : "当前为默认布局";
    renderStageRail();
    renderInspector();
    renderGraph();
    renderSkills();
    renderTemplates();
    renderHistory();
    registerWebMcpTools();
    if (initial) requestAnimationFrame(fitGraph);
  } catch (error) {
    $("#syncStatus").textContent = "母库读取失败";
    toast(error.message, "error");
  }
}

let webMcpRegistered = false;
function registerWebMcpTools() {
  if (webMcpRegistered || !document.modelContext?.registerTool || !state.data) return;
  webMcpRegistered = true;
  const report = (error) => console.warn("WebMCP tool registration failed", error);
  const stageCodes = state.data.workflow.stages.map((stage) => stage.code);
  const skillNames = state.data.skills.map((skill) => skill.name);
  void Promise.resolve(document.modelContext.registerTool({
    name: "inspect_workflow_stage",
    title: "查看诉讼工作流阶段",
    description: "在可视化流程图中选择并展示一个A至T阶段的动作、Skill、律师判断门槛和输出。只改变当前页面视图，不修改文件。",
    inputSchema: {
      type: "object",
      properties: { stageCode: { type: "string", enum: stageCodes } },
      required: ["stageCode"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    async execute(input) {
      if (!stageCodes.includes(input?.stageCode)) throw new Error("无效的阶段编号");
      navigate("workflow");
      selectStage(input.stageCode);
      const stage = state.data.workflow.stages.find((item) => item.code === input.stageCode);
      return { stageCode: stage.code, title: stageDisplayTitle(stage), actionCount: stage.actions.length, skills: stage.skills.map((item) => item.name) };
    },
  })).catch(report);
  void Promise.resolve(document.modelContext.registerTool({
    name: "start_skill_edit",
    title: "打开Skill编辑器",
    description: "打开指定Skill的本地编辑界面。此工具只开始编辑，不保存或写入SKILL.md。",
    inputSchema: {
      type: "object",
      properties: { skillName: { type: "string", enum: skillNames } },
      required: ["skillName"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    async execute(input) {
      if (!skillNames.includes(input?.skillName)) throw new Error("无效的Skill名称");
      navigate("skills");
      await openSkillEditor(input.skillName);
      return { skillName: input.skillName, editorOpened: true, saved: false };
    },
  })).catch(report);
}

bindEvents();
loadSystem();
