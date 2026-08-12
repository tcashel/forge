import {
  populateCommonDb
} from "./chunk-main-swn2pgxb.js";
import {
  parse
} from "./chunk-main-95eqee0w.js";
import"./chunk-main-rhjqzyw5.js";
import"./chunk-main-rnwcyf5v.js";
import"./chunk-main-3chqn6nd.js";
import"./chunk-main-v7705ax4.js";
import"./chunk-main-93jkhrwv.js";
import"./chunk-main-yyhgqcf9.js";
import"./chunk-main-gk3514dg.js";
import"./chunk-main-wrrkcnjj.js";
import"./chunk-main-vxc4sxhk.js";
import {
  selectSvgElement
} from "./chunk-main-f3t3xmmb.js";
import {
  cleanAndMerge
} from "./chunk-main-vvfzntzy.js";
import"./chunk-main-ck580f0k.js";
import {
  clear,
  configureSvgSize,
  getAccDescription,
  getAccTitle,
  getConfig,
  getConfig2,
  getDiagramTitle,
  getThemeVariables3,
  setAccDescription,
  setAccTitle,
  setDiagramTitle
} from "./chunk-main-aws590jt.js";
import {
  __name,
  log
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-x0xz2rje.js";
import"./chunk-main-rxe1mr61.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/wardleyDiagram-YWT4CUSO.mjs
var toPercent = /* @__PURE__ */ __name((value, context) => {
  const normalized = value <= 1 ? value * 100 : value;
  if (normalized < 0 || normalized > 100) {
    throw new Error(`${context} must be between 0-1 (decimal) or 0-100 (percentage). Received: ${value}`);
  }
  return normalized;
}, "toPercent");
var toCoordinates = /* @__PURE__ */ __name((visibility, evolution, context) => {
  return {
    x: toPercent(evolution, `${context} evolution`),
    y: toPercent(visibility, `${context} visibility`)
  };
}, "toCoordinates");
var getFlowFromPort = /* @__PURE__ */ __name((port) => {
  if (!port) {
    return;
  }
  if (port === "+<>") {
    return "bidirectional";
  }
  if (port === "+<") {
    return "backward";
  }
  if (port === "+>") {
    return "forward";
  }
  return;
}, "getFlowFromPort");
var extractFlowFromArrow = /* @__PURE__ */ __name((arrow) => {
  if (!arrow?.startsWith("+")) {
    return {};
  }
  const labelMatch = /^\+'([^']*)'/.exec(arrow);
  const flowLabel = labelMatch?.[1];
  if (arrow.includes("<>")) {
    return { flow: "bidirectional", label: flowLabel };
  }
  if (arrow.includes("<")) {
    return { flow: "backward", label: flowLabel };
  }
  if (arrow.includes(">")) {
    return { flow: "forward", label: flowLabel };
  }
  return { label: flowLabel };
}, "extractFlowFromArrow");
var populateDb = /* @__PURE__ */ __name((ast, db) => {
  populateCommonDb(ast, db);
  if (ast.size) {
    db.setSize(ast.size.width, ast.size.height);
  }
  if (ast.evolution) {
    const stages = ast.evolution.stages.map((stage) => {
      if (stage.secondName) {
        return `${stage.name.trim()} / ${stage.secondName.trim()}`;
      }
      return stage.name.trim();
    });
    const stageBoundaries = ast.evolution.stages.filter((stage) => stage.boundary !== undefined).map((stage) => stage.boundary);
    db.updateAxes({ stages, stageBoundaries });
  }
  ast.anchors.forEach((anchor) => {
    const coords = toCoordinates(anchor.visibility, anchor.evolution, `Anchor "${anchor.name}"`);
    db.addNode(anchor.name, anchor.name, coords.x, coords.y, "anchor");
  });
  ast.components.forEach((component) => {
    const coords = toCoordinates(component.visibility, component.evolution, `Component "${component.name}"`);
    const labelOffsetX = component.label ? (component.label.negX ? -1 : 1) * component.label.offsetX : undefined;
    const labelOffsetY = component.label ? (component.label.negY ? -1 : 1) * component.label.offsetY : undefined;
    const sourceStrategy = component.decorator?.strategy;
    db.addNode(component.name, component.name, coords.x, coords.y, "component", labelOffsetX, labelOffsetY, component.inertia, sourceStrategy);
  });
  ast.notes.forEach((note) => {
    const coords = toCoordinates(note.visibility, note.evolution, `Note "${note.text}"`);
    db.addNote(note.text, coords.x, coords.y);
  });
  ast.pipelines.forEach((pipeline) => {
    const parentNode = db.getNode(pipeline.parent);
    if (!parentNode || typeof parentNode.y !== "number") {
      throw new Error(`Pipeline "${pipeline.parent}" must reference an existing component with coordinates.`);
    }
    const parentY = parentNode.y;
    db.startPipeline(pipeline.parent);
    pipeline.components.forEach((component) => {
      const componentId = `${pipeline.parent}_${component.name}`;
      const labelOffsetX = component.label ? (component.label.negX ? -1 : 1) * component.label.offsetX : undefined;
      const labelOffsetY = component.label ? (component.label.negY ? -1 : 1) * component.label.offsetY : undefined;
      const x = toPercent(component.evolution, `Pipeline component "${component.name}" evolution`);
      db.addNode(componentId, component.name, x, parentY, "pipeline-component", labelOffsetX, labelOffsetY);
      db.addPipelineComponent(pipeline.parent, componentId);
    });
  });
  ast.links.forEach((link) => {
    const isDashed = !!link.arrow && (link.arrow.includes("-.->") || link.arrow.includes(".-."));
    let flow = getFlowFromPort(link.fromPort) ?? getFlowFromPort(link.toPort);
    const { flow: arrowFlow, label: flowLabel } = extractFlowFromArrow(link.arrow);
    if (!flow && arrowFlow) {
      flow = arrowFlow;
    }
    const annotation = link.linkLabel;
    const label = flowLabel ?? annotation;
    db.addLink(db.resolveNodeId(link.from), db.resolveNodeId(link.to), isDashed, label, flow);
  });
  ast.evolves.forEach((evolve) => {
    const node = db.getNode(evolve.component);
    if (node?.y !== undefined) {
      const target = toPercent(evolve.target, `Evolve target for "${evolve.component}"`);
      db.addTrend(evolve.component, target, node.y);
    }
  });
  if (ast.annotations.length > 0) {
    const annotationsBox = ast.annotations[0];
    const coords = toCoordinates(annotationsBox.x, annotationsBox.y, "Annotations box");
    db.setAnnotationsBox(coords.x, coords.y);
  }
  ast.annotation.forEach((annotation) => {
    const coords = toCoordinates(annotation.x, annotation.y, `Annotation ${annotation.number}`);
    db.addAnnotation(annotation.number, [{ x: coords.x, y: coords.y }], annotation.text);
  });
  ast.accelerators.forEach((accelerator) => {
    const coords = toCoordinates(accelerator.x, accelerator.y, `Accelerator "${accelerator.name}"`);
    db.addAccelerator(accelerator.name, coords.x, coords.y);
  });
  ast.deaccelerators.forEach((deaccelerator) => {
    const coords = toCoordinates(deaccelerator.x, deaccelerator.y, `Deaccelerator "${deaccelerator.name}"`);
    db.addDeaccelerator(deaccelerator.name, coords.x, coords.y);
  });
}, "populateDb");
var parser = {
  parser: {
    yy: undefined
  },
  parse: /* @__PURE__ */ __name(async (input) => {
    const ast = await parse("wardley", input);
    log.debug(ast);
    const db = parser.parser?.yy;
    if (!db || typeof db.addNode !== "function") {
      throw new Error("parser.parser?.yy was not a WardleyDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.");
    }
    populateDb(ast, db);
  }, "parse")
};
var WardleyBuilder = class {
  constructor() {
    this.nodes = /* @__PURE__ */ new Map;
    this.links = [];
    this.trends = /* @__PURE__ */ new Map;
    this.pipelines = /* @__PURE__ */ new Map;
    this.annotations = [];
    this.notes = [];
    this.accelerators = [];
    this.deaccelerators = [];
    this.axes = {};
  }
  static {
    __name(this, "WardleyBuilder");
  }
  addNode(node) {
    const existing = this.nodes.get(node.id) ?? { id: node.id, label: node.label };
    const merged = {
      ...existing,
      ...node,
      className: node.className ?? existing.className,
      labelOffsetX: node.labelOffsetX ?? existing.labelOffsetX,
      labelOffsetY: node.labelOffsetY ?? existing.labelOffsetY
    };
    this.nodes.set(node.id, merged);
  }
  addLink(link) {
    this.links.push(link);
  }
  addTrend(trend) {
    this.trends.set(trend.nodeId, trend);
  }
  startPipeline(nodeId) {
    this.pipelines.set(nodeId, { nodeId, componentIds: [] });
    const node = this.nodes.get(nodeId);
    if (node) {
      node.isPipelineParent = true;
    }
  }
  addPipelineComponent(pipelineNodeId, componentId) {
    const pipeline = this.pipelines.get(pipelineNodeId);
    if (pipeline) {
      pipeline.componentIds.push(componentId);
    }
    const node = this.nodes.get(componentId);
    if (node) {
      node.inPipeline = true;
    }
  }
  addAnnotation(annotation) {
    this.annotations.push(annotation);
  }
  addNote(note) {
    this.notes.push(note);
  }
  addAccelerator(accelerator) {
    this.accelerators.push(accelerator);
  }
  addDeaccelerator(deaccelerator) {
    this.deaccelerators.push(deaccelerator);
  }
  setAnnotationsBox(x, y) {
    this.annotationsBox = { x, y };
  }
  setAxes(partial) {
    this.axes = {
      ...this.axes,
      ...partial
    };
  }
  setSize(width, height) {
    this.size = { width, height };
  }
  getNode(id) {
    return this.nodes.get(id);
  }
  resolveNodeId(name) {
    if (this.nodes.has(name)) {
      return name;
    }
    for (const [id, node] of this.nodes) {
      if (node.label === name) {
        return id;
      }
    }
    return name;
  }
  build() {
    const nodes = [];
    for (const node of this.nodes.values()) {
      if (typeof node.x !== "number" || typeof node.y !== "number") {
        throw new Error(`Node "${node.label}" is missing coordinates`);
      }
      nodes.push(node);
    }
    return {
      nodes,
      links: [...this.links],
      trends: [...this.trends.values()],
      pipelines: [...this.pipelines.values()],
      annotations: [...this.annotations],
      notes: [...this.notes],
      accelerators: [...this.accelerators],
      deaccelerators: [...this.deaccelerators],
      annotationsBox: this.annotationsBox,
      axes: { ...this.axes },
      size: this.size
    };
  }
  clear() {
    this.nodes.clear();
    this.links = [];
    this.trends.clear();
    this.pipelines.clear();
    this.annotations = [];
    this.notes = [];
    this.accelerators = [];
    this.deaccelerators = [];
    this.annotationsBox = undefined;
    this.axes = {};
    this.size = undefined;
  }
};
var builder = new WardleyBuilder;
function getConfig3() {
  return getConfig2()["wardley-beta"];
}
__name(getConfig3, "getConfig");
function addNode(id, label, x, y, className, labelOffsetX, labelOffsetY, inertia, sourceStrategy) {
  builder.addNode({
    id,
    label,
    x,
    y,
    className,
    labelOffsetX,
    labelOffsetY,
    inertia,
    sourceStrategy
  });
}
__name(addNode, "addNode");
function addLink(sourceId, targetId, dashed = false, label, flow) {
  builder.addLink({
    source: sourceId,
    target: targetId,
    dashed,
    label,
    flow
  });
}
__name(addLink, "addLink");
function addTrend(nodeId, targetX, targetY) {
  builder.addTrend({ nodeId, targetX, targetY });
}
__name(addTrend, "addTrend");
function addAnnotation(number, coordinates, text) {
  builder.addAnnotation({
    number,
    coordinates,
    text
  });
}
__name(addAnnotation, "addAnnotation");
function addNote(text, x, y) {
  builder.addNote({
    text,
    x,
    y
  });
}
__name(addNote, "addNote");
function addAccelerator(name, x, y) {
  builder.addAccelerator({
    name,
    x,
    y
  });
}
__name(addAccelerator, "addAccelerator");
function addDeaccelerator(name, x, y) {
  builder.addDeaccelerator({
    name,
    x,
    y
  });
}
__name(addDeaccelerator, "addDeaccelerator");
function setAnnotationsBox(x, y) {
  builder.setAnnotationsBox(x, y);
}
__name(setAnnotationsBox, "setAnnotationsBox");
function setSize(width, height) {
  builder.setSize(width, height);
}
__name(setSize, "setSize");
function startPipeline(nodeId) {
  builder.startPipeline(nodeId);
}
__name(startPipeline, "startPipeline");
function addPipelineComponent(pipelineNodeId, componentId) {
  builder.addPipelineComponent(pipelineNodeId, componentId);
}
__name(addPipelineComponent, "addPipelineComponent");
function updateAxes(partial) {
  builder.setAxes(partial);
}
__name(updateAxes, "updateAxes");
function getNode(id) {
  return builder.getNode(id);
}
__name(getNode, "getNode");
function resolveNodeId(name) {
  return builder.resolveNodeId(name);
}
__name(resolveNodeId, "resolveNodeId");
function getWardleyData() {
  return builder.build();
}
__name(getWardleyData, "getWardleyData");
function clear2() {
  builder.clear();
  clear();
}
__name(clear2, "clear");
var wardleyDb_default = {
  getConfig: getConfig3,
  addNode,
  addLink,
  addTrend,
  addAnnotation,
  addNote,
  addAccelerator,
  addDeaccelerator,
  setAnnotationsBox,
  setSize,
  startPipeline,
  addPipelineComponent,
  updateAxes,
  getNode,
  resolveNodeId,
  getWardleyData,
  clear: clear2,
  setAccTitle,
  getAccTitle,
  setDiagramTitle,
  getDiagramTitle,
  getAccDescription,
  setAccDescription
};
var DEFAULT_STAGES = ["Genesis", "Custom Built", "Product", "Commodity"];
var getTheme = /* @__PURE__ */ __name(() => {
  const { themeVariables } = getConfig2();
  return {
    backgroundColor: themeVariables.wardley?.backgroundColor ?? themeVariables.background ?? "#fff",
    axisColor: themeVariables.wardley?.axisColor ?? "#000",
    axisTextColor: themeVariables.wardley?.axisTextColor ?? themeVariables.primaryTextColor ?? "#222",
    gridColor: themeVariables.wardley?.gridColor ?? "rgba(100, 100, 100, 0.2)",
    componentFill: themeVariables.wardley?.componentFill ?? "#fff",
    componentStroke: themeVariables.wardley?.componentStroke ?? "#000",
    componentLabelColor: themeVariables.wardley?.componentLabelColor ?? themeVariables.primaryTextColor ?? "#222",
    linkStroke: themeVariables.wardley?.linkStroke ?? "#000",
    evolutionStroke: themeVariables.wardley?.evolutionStroke ?? "#dc3545",
    annotationStroke: themeVariables.wardley?.annotationStroke ?? "#000",
    annotationTextColor: themeVariables.wardley?.annotationTextColor ?? themeVariables.primaryTextColor ?? "#222",
    annotationFill: themeVariables.wardley?.annotationFill ?? themeVariables.background ?? "#fff"
  };
}, "getTheme");
var getConfigValues = /* @__PURE__ */ __name(() => {
  const wardleyConfig = getConfig2()["wardley-beta"];
  return {
    width: wardleyConfig?.width ?? 900,
    height: wardleyConfig?.height ?? 600,
    padding: wardleyConfig?.padding ?? 48,
    nodeRadius: wardleyConfig?.nodeRadius ?? 6,
    nodeLabelOffset: wardleyConfig?.nodeLabelOffset ?? 8,
    axisFontSize: wardleyConfig?.axisFontSize ?? 12,
    labelFontSize: wardleyConfig?.labelFontSize ?? 10,
    showGrid: wardleyConfig?.showGrid ?? false,
    useMaxWidth: wardleyConfig?.useMaxWidth ?? true
  };
}, "getConfigValues");
var draw = /* @__PURE__ */ __name((text, id, _version, diagObj) => {
  log.debug(`Rendering Wardley map
` + text);
  const configValues = getConfigValues();
  const theme = getTheme();
  const squareSize = configValues.nodeRadius * 1.6;
  const db = diagObj.db;
  const data = db.getWardleyData();
  const title = db.getDiagramTitle();
  const width = data.size?.width ?? configValues.width;
  const height = data.size?.height ?? configValues.height;
  const svg = selectSvgElement(id);
  svg.selectAll("*").remove();
  configureSvgSize(svg, height, width, configValues.useMaxWidth);
  svg.attr("viewBox", `0 0 ${width} ${height}`);
  const root = svg.append("g").attr("class", "wardley-map");
  const defs = svg.append("defs");
  defs.append("marker").attr("id", `arrow-${id}`).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto-start-reverse").append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", theme.evolutionStroke).attr("stroke", "none");
  defs.append("marker").attr("id", `link-arrow-end-${id}`).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerWidth", 5).attr("markerHeight", 5).attr("orient", "auto").append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("fill", theme.linkStroke).attr("stroke", "none");
  defs.append("marker").attr("id", `link-arrow-start-${id}`).attr("viewBox", "0 0 10 10").attr("refX", 1).attr("refY", 5).attr("markerWidth", 5).attr("markerHeight", 5).attr("orient", "auto").append("path").attr("d", "M 10 0 L 0 5 L 10 10 z").attr("fill", theme.linkStroke).attr("stroke", "none");
  root.append("rect").attr("class", "wardley-background").attr("width", width).attr("height", height).attr("fill", theme.backgroundColor);
  const chartWidth = width - configValues.padding * 2;
  const chartHeight = height - configValues.padding * 2;
  if (title) {
    root.append("text").attr("class", "wardley-title").attr("x", width / 2).attr("y", configValues.padding / 2).attr("fill", theme.axisTextColor).attr("font-size", configValues.axisFontSize * 1.05).attr("font-weight", "bold").attr("text-anchor", "middle").attr("dominant-baseline", "middle").text(title);
  }
  const projectX = /* @__PURE__ */ __name((value) => configValues.padding + value / 100 * chartWidth, "projectX");
  const projectY = /* @__PURE__ */ __name((value) => height - configValues.padding - value / 100 * chartHeight, "projectY");
  const axisGroup = root.append("g").attr("class", "wardley-axes");
  axisGroup.append("line").attr("x1", configValues.padding).attr("x2", width - configValues.padding).attr("y1", height - configValues.padding).attr("y2", height - configValues.padding).attr("stroke", theme.axisColor).attr("stroke-width", 1);
  axisGroup.append("line").attr("x1", configValues.padding).attr("x2", configValues.padding).attr("y1", configValues.padding).attr("y2", height - configValues.padding).attr("stroke", theme.axisColor).attr("stroke-width", 1);
  const xLabel = data.axes.xLabel ?? "Evolution";
  const yLabel = data.axes.yLabel ?? "Visibility";
  axisGroup.append("text").attr("class", "wardley-axis-label wardley-axis-label-x").attr("x", configValues.padding + chartWidth / 2).attr("y", height - configValues.padding / 4).attr("fill", theme.axisTextColor).attr("font-size", configValues.axisFontSize).attr("font-weight", "bold").attr("text-anchor", "middle").text(xLabel);
  axisGroup.append("text").attr("class", "wardley-axis-label wardley-axis-label-y").attr("x", configValues.padding / 3).attr("y", configValues.padding + chartHeight / 2).attr("fill", theme.axisTextColor).attr("font-size", configValues.axisFontSize).attr("font-weight", "bold").attr("text-anchor", "middle").attr("transform", `rotate(-90 ${configValues.padding / 3} ${configValues.padding + chartHeight / 2})`).text(yLabel);
  const stages = data.axes.stages && data.axes.stages.length > 0 ? data.axes.stages : DEFAULT_STAGES;
  if (stages.length > 0) {
    const stageGroup = root.append("g").attr("class", "wardley-stages");
    const boundaries = data.axes.stageBoundaries;
    const stagePositions = [];
    if (boundaries && boundaries.length === stages.length) {
      let prevBoundary = 0;
      boundaries.forEach((boundary) => {
        stagePositions.push({ start: prevBoundary, end: boundary });
        prevBoundary = boundary;
      });
    } else {
      const stageWidth = 1 / stages.length;
      stages.forEach((_, index) => {
        stagePositions.push({
          start: index * stageWidth,
          end: (index + 1) * stageWidth
        });
      });
    }
    stages.forEach((stage, index) => {
      const pos = stagePositions[index];
      const startX = configValues.padding + pos.start * chartWidth;
      const endX = configValues.padding + pos.end * chartWidth;
      const centerX = (startX + endX) / 2;
      if (index > 0) {
        stageGroup.append("line").attr("x1", startX).attr("x2", startX).attr("y1", configValues.padding).attr("y2", height - configValues.padding).attr("stroke", "#000").attr("stroke-width", 1).attr("stroke-dasharray", "5 5").attr("opacity", 0.8);
      }
      stageGroup.append("text").attr("class", "wardley-stage-label").attr("x", centerX).attr("y", height - configValues.padding / 1.5).attr("fill", theme.axisTextColor).attr("font-size", configValues.axisFontSize - 2).attr("text-anchor", "middle").text(stage);
    });
  }
  if (configValues.showGrid) {
    const gridGroup = root.append("g").attr("class", "wardley-grid");
    for (let i = 1;i < 4; i++) {
      const ratio = i / 4;
      const x = configValues.padding + chartWidth * ratio;
      gridGroup.append("line").attr("x1", x).attr("x2", x).attr("y1", configValues.padding).attr("y2", height - configValues.padding).attr("stroke", theme.gridColor).attr("stroke-dasharray", "2 6");
      gridGroup.append("line").attr("x1", configValues.padding).attr("x2", width - configValues.padding).attr("y1", height - configValues.padding - chartHeight * ratio).attr("y2", height - configValues.padding - chartHeight * ratio).attr("stroke", theme.gridColor).attr("stroke-dasharray", "2 6");
    }
  }
  const positions = /* @__PURE__ */ new Map;
  data.nodes.forEach((node) => {
    positions.set(node.id, {
      x: projectX(node.x),
      y: projectY(node.y),
      node
    });
  });
  if (data.pipelines.length > 0) {
    const pipelineGroup = root.append("g").attr("class", "wardley-pipelines");
    const pipelineLinksGroup = root.append("g").attr("class", "wardley-pipeline-links");
    data.pipelines.forEach((pipeline) => {
      if (pipeline.componentIds.length === 0) {
        return;
      }
      const sortedComponents = pipeline.componentIds.map((id2) => ({ id: id2, pos: positions.get(id2), node: data.nodes.find((n) => n.id === id2) })).filter((c) => c.pos && c.node).sort((a, b) => a.node.x - b.node.x);
      for (let i = 0;i < sortedComponents.length - 1; i++) {
        const current = sortedComponents[i];
        const next = sortedComponents[i + 1];
        pipelineLinksGroup.append("line").attr("class", "wardley-pipeline-evolution-link").attr("x1", current.pos.x).attr("y1", current.pos.y).attr("x2", next.pos.x).attr("y2", next.pos.y).attr("stroke", theme.linkStroke).attr("stroke-width", 1).attr("stroke-dasharray", "4 4");
      }
      let minX = Infinity;
      let maxX = -Infinity;
      let y = 0;
      pipeline.componentIds.forEach((componentId) => {
        const pos = positions.get(componentId);
        if (pos) {
          minX = Math.min(minX, pos.x);
          maxX = Math.max(maxX, pos.x);
          y = pos.y;
        }
      });
      if (minX !== Infinity && maxX !== -Infinity) {
        const padding = 15;
        const height2 = configValues.nodeRadius * 4;
        const boxTop = y - height2 / 2;
        const parentPos = positions.get(pipeline.nodeId);
        if (parentPos) {
          const centerX = (minX + maxX) / 2;
          parentPos.x = centerX;
          parentPos.y = boxTop - squareSize / 6;
        }
        pipelineGroup.append("rect").attr("class", "wardley-pipeline-box").attr("x", minX - padding).attr("y", boxTop).attr("width", maxX - minX + padding * 2).attr("height", height2).attr("fill", "none").attr("stroke", theme.axisColor).attr("stroke-width", 1.5).attr("rx", 4).attr("ry", 4);
      }
    });
  }
  const linksGroup = root.append("g").attr("class", "wardley-links");
  const pipelineMap = /* @__PURE__ */ new Map;
  data.pipelines.forEach((pipeline) => {
    pipelineMap.set(pipeline.nodeId, new Set(pipeline.componentIds));
  });
  const validLinks = data.links.filter((link) => {
    if (!positions.has(link.source) || !positions.has(link.target)) {
      return false;
    }
    const pipelineComponents = pipelineMap.get(link.target);
    if (pipelineComponents?.has(link.source)) {
      return false;
    }
    return true;
  });
  linksGroup.selectAll("line").data(validLinks).enter().append("line").attr("class", (link) => `wardley-link${link.dashed ? " wardley-link--dashed" : ""}`).attr("x1", (link) => {
    const sourcePos = positions.get(link.source);
    const targetPos = positions.get(link.target);
    const sourceNode = data.nodes.find((n) => n.id === link.source);
    const radius = sourceNode.isPipelineParent ? squareSize / Math.sqrt(2) : configValues.nodeRadius;
    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return sourcePos.x + dx / distance * radius;
  }).attr("y1", (link) => {
    const sourcePos = positions.get(link.source);
    const targetPos = positions.get(link.target);
    const sourceNode = data.nodes.find((n) => n.id === link.source);
    const radius = sourceNode.isPipelineParent ? squareSize / Math.sqrt(2) : configValues.nodeRadius;
    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return sourcePos.y + dy / distance * radius;
  }).attr("x2", (link) => {
    const sourcePos = positions.get(link.source);
    const targetPos = positions.get(link.target);
    const targetNode = data.nodes.find((n) => n.id === link.target);
    const radius = targetNode.isPipelineParent ? squareSize / Math.sqrt(2) : configValues.nodeRadius;
    const dx = sourcePos.x - targetPos.x;
    const dy = sourcePos.y - targetPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return targetPos.x + dx / distance * radius;
  }).attr("y2", (link) => {
    const sourcePos = positions.get(link.source);
    const targetPos = positions.get(link.target);
    const targetNode = data.nodes.find((n) => n.id === link.target);
    const radius = targetNode.isPipelineParent ? squareSize / Math.sqrt(2) : configValues.nodeRadius;
    const dx = sourcePos.x - targetPos.x;
    const dy = sourcePos.y - targetPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return targetPos.y + dy / distance * radius;
  }).attr("stroke", theme.linkStroke).attr("stroke-width", 1).attr("stroke-dasharray", (link) => link.dashed ? "6 6" : null).attr("marker-end", (link) => {
    if (link.flow === "forward" || link.flow === "bidirectional") {
      return `url(#link-arrow-end-${id})`;
    }
    return null;
  }).attr("marker-start", (link) => {
    if (link.flow === "backward" || link.flow === "bidirectional") {
      return `url(#link-arrow-start-${id})`;
    }
    return null;
  });
  linksGroup.selectAll("text").data(validLinks.filter((link) => link.label)).enter().append("text").attr("class", "wardley-link-label").attr("x", (link) => {
    const sourcePos = positions.get(link.source);
    const targetPos = positions.get(link.target);
    const midX = (sourcePos.x + targetPos.x) / 2;
    const dy = targetPos.y - sourcePos.y;
    const dx = targetPos.x - sourcePos.x;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const offset = 8;
    const perpX = dy / distance;
    return midX + perpX * offset;
  }).attr("y", (link) => {
    const sourcePos = positions.get(link.source);
    const targetPos = positions.get(link.target);
    const midY = (sourcePos.y + targetPos.y) / 2;
    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const offset = 8;
    const perpY = -dx / distance;
    return midY + perpY * offset;
  }).attr("fill", theme.axisTextColor).attr("font-size", configValues.labelFontSize).attr("text-anchor", "middle").attr("dominant-baseline", "middle").attr("transform", (link) => {
    const sourcePos = positions.get(link.source);
    const targetPos = positions.get(link.target);
    const midX = (sourcePos.x + targetPos.x) / 2;
    const midY = (sourcePos.y + targetPos.y) / 2;
    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const offset = 8;
    const perpX = dy / distance;
    const perpY = -dx / distance;
    const labelX = midX + perpX * offset;
    const labelY = midY + perpY * offset;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle > 90 || angle < -90) {
      angle += 180;
    }
    return `rotate(${angle} ${labelX} ${labelY})`;
  }).text((link) => link.label);
  const trendGroup = root.append("g").attr("class", "wardley-trends");
  const trendsWithPositions = data.trends.map((trend) => {
    const origin = positions.get(trend.nodeId);
    if (!origin) {
      return null;
    }
    const targetX = projectX(trend.targetX);
    const targetY = projectY(trend.targetY);
    const dx = targetX - origin.x;
    const dy = targetY - origin.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const shortenBy = configValues.nodeRadius + 2;
    const adjustedX2 = distance > shortenBy ? targetX - dx / distance * shortenBy : targetX;
    const adjustedY2 = distance > shortenBy ? targetY - dy / distance * shortenBy : targetY;
    return {
      origin,
      targetX,
      targetY,
      adjustedX2,
      adjustedY2
    };
  }).filter((trend) => trend !== null);
  trendGroup.selectAll("line").data(trendsWithPositions).enter().append("line").attr("class", "wardley-trend").attr("x1", (trend) => trend.origin.x).attr("y1", (trend) => trend.origin.y).attr("x2", (trend) => trend.adjustedX2).attr("y2", (trend) => trend.adjustedY2).attr("stroke", theme.evolutionStroke).attr("stroke-width", 1).attr("stroke-dasharray", "4 4").attr("marker-end", `url(#arrow-${id})`);
  const nodesGroup = root.append("g").attr("class", "wardley-nodes");
  const nodeEnter = nodesGroup.selectAll("g").data(data.nodes).enter().append("g").attr("class", (node) => ["wardley-node", node.className ? `wardley-node--${node.className}` : ""].filter(Boolean).join(" "));
  nodeEnter.filter((node) => node.sourceStrategy === "outsource").append("circle").attr("class", "wardley-outsource-overlay").attr("cx", (node) => positions.get(node.id).x).attr("cy", (node) => positions.get(node.id).y).attr("r", configValues.nodeRadius * 2).attr("fill", "#666").attr("stroke", theme.componentStroke).attr("stroke-width", 1);
  nodeEnter.filter((node) => node.sourceStrategy === "buy").append("circle").attr("class", "wardley-buy-overlay").attr("cx", (node) => positions.get(node.id).x).attr("cy", (node) => positions.get(node.id).y).attr("r", configValues.nodeRadius * 2).attr("fill", "#ccc").attr("stroke", theme.componentStroke).attr("stroke-width", 1);
  nodeEnter.filter((node) => node.sourceStrategy === "build").append("circle").attr("class", "wardley-build-overlay").attr("cx", (node) => positions.get(node.id).x).attr("cy", (node) => positions.get(node.id).y).attr("r", configValues.nodeRadius * 2).attr("fill", "#eee").attr("stroke", "#000").attr("stroke-width", 1);
  const marketNodes = nodeEnter.filter((node) => node.sourceStrategy === "market");
  marketNodes.append("circle").attr("class", "wardley-market-overlay").attr("cx", (node) => positions.get(node.id).x).attr("cy", (node) => positions.get(node.id).y).attr("r", configValues.nodeRadius * 2).attr("fill", "white").attr("stroke", theme.componentStroke).attr("stroke-width", 1);
  nodeEnter.filter((node) => !node.isPipelineParent && node.sourceStrategy !== "market" && node.className !== "anchor").append("circle").attr("cx", (node) => positions.get(node.id).x).attr("cy", (node) => positions.get(node.id).y).attr("r", configValues.nodeRadius).attr("fill", theme.componentFill).attr("stroke", theme.componentStroke).attr("stroke-width", 1);
  const smallCircleRadius = configValues.nodeRadius * 0.7;
  const triangleRadius = configValues.nodeRadius * 1.2;
  marketNodes.append("line").attr("class", "wardley-market-line").attr("x1", (node) => positions.get(node.id).x).attr("y1", (node) => positions.get(node.id).y - triangleRadius).attr("x2", (node) => positions.get(node.id).x - triangleRadius * Math.cos(Math.PI / 6)).attr("y2", (node) => positions.get(node.id).y + triangleRadius * Math.sin(Math.PI / 6)).attr("stroke", theme.componentStroke).attr("stroke-width", 1);
  marketNodes.append("line").attr("class", "wardley-market-line").attr("x1", (node) => positions.get(node.id).x - triangleRadius * Math.cos(Math.PI / 6)).attr("y1", (node) => positions.get(node.id).y + triangleRadius * Math.sin(Math.PI / 6)).attr("x2", (node) => positions.get(node.id).x + triangleRadius * Math.cos(Math.PI / 6)).attr("y2", (node) => positions.get(node.id).y + triangleRadius * Math.sin(Math.PI / 6)).attr("stroke", theme.componentStroke).attr("stroke-width", 1);
  marketNodes.append("line").attr("class", "wardley-market-line").attr("x1", (node) => positions.get(node.id).x + triangleRadius * Math.cos(Math.PI / 6)).attr("y1", (node) => positions.get(node.id).y + triangleRadius * Math.sin(Math.PI / 6)).attr("x2", (node) => positions.get(node.id).x).attr("y2", (node) => positions.get(node.id).y - triangleRadius).attr("stroke", theme.componentStroke).attr("stroke-width", 1);
  marketNodes.append("circle").attr("class", "wardley-market-dot").attr("cx", (node) => positions.get(node.id).x).attr("cy", (node) => positions.get(node.id).y - triangleRadius).attr("r", smallCircleRadius).attr("fill", "white").attr("stroke", theme.componentStroke).attr("stroke-width", 2);
  marketNodes.append("circle").attr("class", "wardley-market-dot").attr("cx", (node) => positions.get(node.id).x - triangleRadius * Math.cos(Math.PI / 6)).attr("cy", (node) => positions.get(node.id).y + triangleRadius * Math.sin(Math.PI / 6)).attr("r", smallCircleRadius).attr("fill", "white").attr("stroke", theme.componentStroke).attr("stroke-width", 2);
  marketNodes.append("circle").attr("class", "wardley-market-dot").attr("cx", (node) => positions.get(node.id).x + triangleRadius * Math.cos(Math.PI / 6)).attr("cy", (node) => positions.get(node.id).y + triangleRadius * Math.sin(Math.PI / 6)).attr("r", smallCircleRadius).attr("fill", "white").attr("stroke", theme.componentStroke).attr("stroke-width", 2);
  nodeEnter.filter((node) => node.isPipelineParent === true).append("rect").attr("x", (node) => positions.get(node.id).x - squareSize / 2).attr("y", (node) => positions.get(node.id).y - squareSize / 2).attr("width", squareSize).attr("height", squareSize).attr("fill", theme.componentFill).attr("stroke", theme.componentStroke).attr("stroke-width", 1);
  nodeEnter.filter((node) => node.inertia === true).append("line").attr("class", "wardley-inertia").attr("x1", (node) => {
    const pos = positions.get(node.id);
    let offset = node.isPipelineParent ? squareSize / 2 + 15 : configValues.nodeRadius + 15;
    if (node.sourceStrategy) {
      offset += configValues.nodeRadius + 10;
    }
    return pos.x + offset;
  }).attr("y1", (node) => {
    const pos = positions.get(node.id);
    const lineHeight = node.isPipelineParent ? squareSize : configValues.nodeRadius * 2;
    return pos.y - lineHeight / 2;
  }).attr("x2", (node) => {
    const pos = positions.get(node.id);
    let offset = node.isPipelineParent ? squareSize / 2 + 15 : configValues.nodeRadius + 15;
    if (node.sourceStrategy) {
      offset += configValues.nodeRadius + 10;
    }
    return pos.x + offset;
  }).attr("y2", (node) => {
    const pos = positions.get(node.id);
    const lineHeight = node.isPipelineParent ? squareSize : configValues.nodeRadius * 2;
    return pos.y + lineHeight / 2;
  }).attr("stroke", theme.componentStroke).attr("stroke-width", 6);
  nodeEnter.append("text").attr("x", (node) => {
    const pos = positions.get(node.id);
    if (node.className === "anchor") {
      return node.labelOffsetX !== undefined ? pos.x + node.labelOffsetX : pos.x;
    }
    let defaultOffset = configValues.nodeLabelOffset;
    if (node.sourceStrategy && node.labelOffsetX === undefined) {
      defaultOffset += 10;
    }
    const customOffset = node.labelOffsetX ?? defaultOffset;
    return pos.x + customOffset;
  }).attr("y", (node) => {
    const pos = positions.get(node.id);
    if (node.className === "anchor") {
      return node.labelOffsetY !== undefined ? pos.y + node.labelOffsetY : pos.y - 3;
    }
    let defaultOffset = -configValues.nodeLabelOffset;
    if (node.sourceStrategy && node.labelOffsetY === undefined) {
      defaultOffset -= 10;
    }
    const customOffset = node.labelOffsetY ?? defaultOffset;
    return pos.y + customOffset;
  }).attr("class", "wardley-node-label").attr("fill", (node) => {
    if (node.className === "evolved") {
      return theme.evolutionStroke;
    }
    if (node.className === "anchor") {
      return "#000";
    }
    return theme.componentLabelColor;
  }).attr("font-size", configValues.labelFontSize).attr("font-weight", (node) => node.className === "anchor" ? "bold" : "normal").attr("text-anchor", (node) => node.className === "anchor" ? "middle" : "start").attr("dominant-baseline", (node) => node.className === "anchor" ? "middle" : "auto").text((node) => node.label);
  if (data.annotations.length > 0) {
    const annotationsGroup = root.append("g").attr("class", "wardley-annotations");
    data.annotations.forEach((annotation) => {
      const projectedCoords = annotation.coordinates.map((coord) => ({
        x: projectX(coord.x),
        y: projectY(coord.y)
      }));
      if (projectedCoords.length > 1) {
        for (let i = 0;i < projectedCoords.length - 1; i++) {
          annotationsGroup.append("line").attr("class", "wardley-annotation-line").attr("x1", projectedCoords[i].x).attr("y1", projectedCoords[i].y).attr("x2", projectedCoords[i + 1].x).attr("y2", projectedCoords[i + 1].y).attr("stroke", theme.axisColor).attr("stroke-width", 1.5).attr("stroke-dasharray", "4 4");
        }
      }
      projectedCoords.forEach((coord) => {
        const annotationNode = annotationsGroup.append("g").attr("class", "wardley-annotation");
        annotationNode.append("circle").attr("cx", coord.x).attr("cy", coord.y).attr("r", 10).attr("fill", "white").attr("stroke", theme.axisColor).attr("stroke-width", 1.5);
        annotationNode.append("text").attr("x", coord.x).attr("y", coord.y).attr("text-anchor", "middle").attr("dominant-baseline", "central").attr("font-size", 10).attr("fill", theme.axisTextColor).attr("font-weight", "bold").text(annotation.number);
      });
    });
    if (data.annotationsBox) {
      let boxX = projectX(data.annotationsBox.x);
      let boxY = projectY(data.annotationsBox.y);
      const padding = 10;
      const lineHeight = 16;
      const fontSize = 11;
      const textBoxGroup = annotationsGroup.append("g").attr("class", "wardley-annotations-box");
      const sortedAnnotations = [...data.annotations].filter((a) => a.text).sort((a, b) => a.number - b.number);
      const textElements = [];
      sortedAnnotations.forEach((annotation, idx) => {
        const text2 = textBoxGroup.append("text").attr("x", boxX + padding).attr("y", boxY + padding + (idx + 1) * lineHeight).attr("font-size", fontSize).attr("fill", theme.axisTextColor).attr("text-anchor", "start").attr("dominant-baseline", "middle").text(`${annotation.number}. ${annotation.text}`);
        textElements.push(text2);
      });
      if (textElements.length > 0) {
        let maxWidth = 0;
        let maxHeight = 0;
        textElements.forEach((text2) => {
          const textNode = text2.node();
          const textWidth = textNode.getComputedTextLength();
          maxWidth = Math.max(maxWidth, textWidth);
          const bbox = textNode.getBBox();
          maxHeight = Math.max(maxHeight, bbox.height);
        });
        const boxWidth = maxWidth + padding * 2 + 105;
        const boxHeight = sortedAnnotations.length * lineHeight + padding * 2 + maxHeight / 2;
        const minX = configValues.padding;
        const maxX = width - configValues.padding - boxWidth;
        const minY = configValues.padding;
        const maxY = height - configValues.padding - boxHeight;
        boxX = Math.max(minX, Math.min(boxX, maxX));
        boxY = Math.max(minY, Math.min(boxY, maxY));
        textElements.forEach((text2, idx) => {
          text2.attr("x", boxX + padding).attr("y", boxY + padding + (idx + 1) * lineHeight);
        });
        textBoxGroup.insert("rect", "text").attr("x", boxX).attr("y", boxY).attr("width", boxWidth).attr("height", boxHeight).attr("fill", "white").attr("stroke", theme.axisColor).attr("stroke-width", 1.5).attr("rx", 4).attr("ry", 4);
      }
    }
  }
  if (data.notes.length > 0) {
    const notesGroup = root.append("g").attr("class", "wardley-notes");
    data.notes.forEach((note) => {
      const noteX = projectX(note.x);
      const noteY = projectY(note.y);
      notesGroup.append("text").attr("x", noteX).attr("y", noteY).attr("text-anchor", "start").attr("font-size", 11).attr("fill", theme.axisTextColor).attr("font-weight", "bold").text(note.text);
    });
  }
  if (data.accelerators.length > 0) {
    const acceleratorsGroup = root.append("g").attr("class", "wardley-accelerators");
    data.accelerators.forEach((accelerator) => {
      const accX = projectX(accelerator.x);
      const accY = projectY(accelerator.y);
      const arrowWidth = 60;
      const arrowHeight = 30;
      const arrowHeadWidth = 20;
      const arrowPath = `
        M ${accX} ${accY - arrowHeight / 2}
        L ${accX + arrowWidth - arrowHeadWidth} ${accY - arrowHeight / 2}
        L ${accX + arrowWidth - arrowHeadWidth} ${accY - arrowHeight / 2 - 8}
        L ${accX + arrowWidth} ${accY}
        L ${accX + arrowWidth - arrowHeadWidth} ${accY + arrowHeight / 2 + 8}
        L ${accX + arrowWidth - arrowHeadWidth} ${accY + arrowHeight / 2}
        L ${accX} ${accY + arrowHeight / 2}
        Z
      `;
      acceleratorsGroup.append("path").attr("d", arrowPath).attr("fill", "white").attr("stroke", theme.componentStroke).attr("stroke-width", 1);
      acceleratorsGroup.append("text").attr("x", accX + arrowWidth / 2).attr("y", accY + arrowHeight / 2 + 15).attr("text-anchor", "middle").attr("font-size", 10).attr("fill", theme.axisTextColor).attr("font-weight", "bold").text(accelerator.name);
    });
  }
  if (data.deaccelerators.length > 0) {
    const deacceleratorsGroup = root.append("g").attr("class", "wardley-deaccelerators");
    data.deaccelerators.forEach((deaccelerator) => {
      const decX = projectX(deaccelerator.x);
      const decY = projectY(deaccelerator.y);
      const arrowWidth = 60;
      const arrowHeight = 30;
      const arrowHeadWidth = 20;
      const arrowPath = `
        M ${decX + arrowWidth} ${decY - arrowHeight / 2}
        L ${decX + arrowHeadWidth} ${decY - arrowHeight / 2}
        L ${decX + arrowHeadWidth} ${decY - arrowHeight / 2 - 8}
        L ${decX} ${decY}
        L ${decX + arrowHeadWidth} ${decY + arrowHeight / 2 + 8}
        L ${decX + arrowHeadWidth} ${decY + arrowHeight / 2}
        L ${decX + arrowWidth} ${decY + arrowHeight / 2}
        Z
      `;
      deacceleratorsGroup.append("path").attr("d", arrowPath).attr("fill", "white").attr("stroke", theme.componentStroke).attr("stroke-width", 1);
      deacceleratorsGroup.append("text").attr("x", decX + arrowWidth / 2).attr("y", decY + arrowHeight / 2 + 15).attr("text-anchor", "middle").attr("font-size", 10).attr("fill", theme.axisTextColor).attr("font-weight", "bold").text(deaccelerator.name);
    });
  }
}, "draw");
var wardleyRenderer_default = {
  draw
};
var styles = /* @__PURE__ */ __name(({
  wardley
} = {}) => {
  const defaultThemeVariables = getThemeVariables3();
  const currentConfig = getConfig();
  const themeVariables = cleanAndMerge(defaultThemeVariables, currentConfig.themeVariables);
  const w = cleanAndMerge(themeVariables.wardley, wardley);
  return `
  .wardley-background {
    fill: ${w.backgroundColor};
  }
  .wardley-axes line, .wardley-axes path {
    stroke: ${w.axisColor};
  }
  .wardley-axis-label {
    fill: ${w.axisTextColor};
  }
  .wardley-stage-label {
    fill: ${w.axisTextColor};
  }
  .wardley-grid line {
    stroke: ${w.gridColor};
  }
  .wardley-node circle {
    fill: ${w.componentFill};
    stroke: ${w.componentStroke};
  }
  .wardley-node-label {
    fill: ${w.componentLabelColor};
  }
  .wardley-link {
    stroke: ${w.linkStroke};
  }
  .wardley-link--dashed {
    stroke-dasharray: 4 4;
  }
  .wardley-link-label {
    fill: ${w.axisTextColor};
  }
  .wardley-trend line {
    stroke: ${w.evolutionStroke};
  }
  .wardley-annotation-line {
    stroke: ${w.annotationStroke};
  }
  .wardley-annotation circle {
    fill: ${w.annotationFill};
    stroke: ${w.annotationStroke};
  }
  .wardley-annotation text {
    fill: ${w.annotationTextColor};
  }
  .wardley-annotations-box rect {
    fill: ${w.annotationFill};
    stroke: ${w.annotationStroke};
  }
  .wardley-annotations-box text {
    fill: ${w.annotationTextColor};
  }
  .wardley-pipeline-box {
    stroke: ${w.componentStroke};
  }
  .wardley-notes text {
    fill: ${w.axisTextColor};
  }
  `;
}, "styles");
var diagram = {
  parser,
  db: wardleyDb_default,
  renderer: wardleyRenderer_default,
  styles
};
export {
  diagram
};

//# debugId=AAD7F6C9AAADBA4564756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL3dhcmRsZXlEaWFncmFtLVlXVDRDVVNPLm1qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJpbXBvcnQge1xuICBzZWxlY3RTdmdFbGVtZW50XG59IGZyb20gXCIuL2NodW5rLVdVNU1ZRzJHLm1qc1wiO1xuaW1wb3J0IHtcbiAgcG9wdWxhdGVDb21tb25EYlxufSBmcm9tIFwiLi9jaHVuay00QlgyVlVBQi5tanNcIjtcbmltcG9ydCB7XG4gIGNsZWFuQW5kTWVyZ2Vcbn0gZnJvbSBcIi4vY2h1bmstNVpRWUhYS1UubWpzXCI7XG5pbXBvcnQge1xuICBjbGVhcixcbiAgY29uZmlndXJlU3ZnU2l6ZSxcbiAgZ2V0QWNjRGVzY3JpcHRpb24sXG4gIGdldEFjY1RpdGxlLFxuICBnZXRDb25maWcsXG4gIGdldENvbmZpZzIsXG4gIGdldERpYWdyYW1UaXRsZSxcbiAgZ2V0VGhlbWVWYXJpYWJsZXMsXG4gIHNldEFjY0Rlc2NyaXB0aW9uLFxuICBzZXRBY2NUaXRsZSxcbiAgc2V0RGlhZ3JhbVRpdGxlXG59IGZyb20gXCIuL2NodW5rLUNTQ0lISzdRLm1qc1wiO1xuaW1wb3J0IHtcbiAgX19uYW1lLFxuICBsb2dcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIHNyYy9kaWFncmFtcy93YXJkbGV5L3dhcmRsZXlQYXJzZXIudHNcbmltcG9ydCB7IHBhcnNlIH0gZnJvbSBcIkBtZXJtYWlkLWpzL3BhcnNlclwiO1xudmFyIHRvUGVyY2VudCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHZhbHVlLCBjb250ZXh0KSA9PiB7XG4gIGNvbnN0IG5vcm1hbGl6ZWQgPSB2YWx1ZSA8PSAxID8gdmFsdWUgKiAxMDAgOiB2YWx1ZTtcbiAgaWYgKG5vcm1hbGl6ZWQgPCAwIHx8IG5vcm1hbGl6ZWQgPiAxMDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgJHtjb250ZXh0fSBtdXN0IGJlIGJldHdlZW4gMC0xIChkZWNpbWFsKSBvciAwLTEwMCAocGVyY2VudGFnZSkuIFJlY2VpdmVkOiAke3ZhbHVlfWBcbiAgICApO1xuICB9XG4gIHJldHVybiBub3JtYWxpemVkO1xufSwgXCJ0b1BlcmNlbnRcIik7XG52YXIgdG9Db29yZGluYXRlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHZpc2liaWxpdHksIGV2b2x1dGlvbiwgY29udGV4dCkgPT4ge1xuICByZXR1cm4ge1xuICAgIHg6IHRvUGVyY2VudChldm9sdXRpb24sIGAke2NvbnRleHR9IGV2b2x1dGlvbmApLFxuICAgIHk6IHRvUGVyY2VudCh2aXNpYmlsaXR5LCBgJHtjb250ZXh0fSB2aXNpYmlsaXR5YClcbiAgfTtcbn0sIFwidG9Db29yZGluYXRlc1wiKTtcbnZhciBnZXRGbG93RnJvbVBvcnQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChwb3J0KSA9PiB7XG4gIGlmICghcG9ydCkge1xuICAgIHJldHVybiB2b2lkIDA7XG4gIH1cbiAgaWYgKHBvcnQgPT09IFwiKzw+XCIpIHtcbiAgICByZXR1cm4gXCJiaWRpcmVjdGlvbmFsXCI7XG4gIH1cbiAgaWYgKHBvcnQgPT09IFwiKzxcIikge1xuICAgIHJldHVybiBcImJhY2t3YXJkXCI7XG4gIH1cbiAgaWYgKHBvcnQgPT09IFwiKz5cIikge1xuICAgIHJldHVybiBcImZvcndhcmRcIjtcbiAgfVxuICByZXR1cm4gdm9pZCAwO1xufSwgXCJnZXRGbG93RnJvbVBvcnRcIik7XG52YXIgZXh0cmFjdEZsb3dGcm9tQXJyb3cgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChhcnJvdykgPT4ge1xuICBpZiAoIWFycm93Py5zdGFydHNXaXRoKFwiK1wiKSkge1xuICAgIHJldHVybiB7fTtcbiAgfVxuICBjb25zdCBsYWJlbE1hdGNoID0gL15cXCsnKFteJ10qKScvLmV4ZWMoYXJyb3cpO1xuICBjb25zdCBmbG93TGFiZWwgPSBsYWJlbE1hdGNoPy5bMV07XG4gIGlmIChhcnJvdy5pbmNsdWRlcyhcIjw+XCIpKSB7XG4gICAgcmV0dXJuIHsgZmxvdzogXCJiaWRpcmVjdGlvbmFsXCIsIGxhYmVsOiBmbG93TGFiZWwgfTtcbiAgfVxuICBpZiAoYXJyb3cuaW5jbHVkZXMoXCI8XCIpKSB7XG4gICAgcmV0dXJuIHsgZmxvdzogXCJiYWNrd2FyZFwiLCBsYWJlbDogZmxvd0xhYmVsIH07XG4gIH1cbiAgaWYgKGFycm93LmluY2x1ZGVzKFwiPlwiKSkge1xuICAgIHJldHVybiB7IGZsb3c6IFwiZm9yd2FyZFwiLCBsYWJlbDogZmxvd0xhYmVsIH07XG4gIH1cbiAgcmV0dXJuIHsgbGFiZWw6IGZsb3dMYWJlbCB9O1xufSwgXCJleHRyYWN0Rmxvd0Zyb21BcnJvd1wiKTtcbnZhciBwb3B1bGF0ZURiID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoYXN0LCBkYikgPT4ge1xuICBwb3B1bGF0ZUNvbW1vbkRiKGFzdCwgZGIpO1xuICBpZiAoYXN0LnNpemUpIHtcbiAgICBkYi5zZXRTaXplKGFzdC5zaXplLndpZHRoLCBhc3Quc2l6ZS5oZWlnaHQpO1xuICB9XG4gIGlmIChhc3QuZXZvbHV0aW9uKSB7XG4gICAgY29uc3Qgc3RhZ2VzID0gYXN0LmV2b2x1dGlvbi5zdGFnZXMubWFwKChzdGFnZSkgPT4ge1xuICAgICAgaWYgKHN0YWdlLnNlY29uZE5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGAke3N0YWdlLm5hbWUudHJpbSgpfSAvICR7c3RhZ2Uuc2Vjb25kTmFtZS50cmltKCl9YDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdGFnZS5uYW1lLnRyaW0oKTtcbiAgICB9KTtcbiAgICBjb25zdCBzdGFnZUJvdW5kYXJpZXMgPSBhc3QuZXZvbHV0aW9uLnN0YWdlcy5maWx0ZXIoKHN0YWdlKSA9PiBzdGFnZS5ib3VuZGFyeSAhPT0gdm9pZCAwKS5tYXAoKHN0YWdlKSA9PiBzdGFnZS5ib3VuZGFyeSk7XG4gICAgZGIudXBkYXRlQXhlcyh7IHN0YWdlcywgc3RhZ2VCb3VuZGFyaWVzIH0pO1xuICB9XG4gIGFzdC5hbmNob3JzLmZvckVhY2goKGFuY2hvcikgPT4ge1xuICAgIGNvbnN0IGNvb3JkcyA9IHRvQ29vcmRpbmF0ZXMoYW5jaG9yLnZpc2liaWxpdHksIGFuY2hvci5ldm9sdXRpb24sIGBBbmNob3IgXCIke2FuY2hvci5uYW1lfVwiYCk7XG4gICAgZGIuYWRkTm9kZShhbmNob3IubmFtZSwgYW5jaG9yLm5hbWUsIGNvb3Jkcy54LCBjb29yZHMueSwgXCJhbmNob3JcIik7XG4gIH0pO1xuICBhc3QuY29tcG9uZW50cy5mb3JFYWNoKChjb21wb25lbnQpID0+IHtcbiAgICBjb25zdCBjb29yZHMgPSB0b0Nvb3JkaW5hdGVzKFxuICAgICAgY29tcG9uZW50LnZpc2liaWxpdHksXG4gICAgICBjb21wb25lbnQuZXZvbHV0aW9uLFxuICAgICAgYENvbXBvbmVudCBcIiR7Y29tcG9uZW50Lm5hbWV9XCJgXG4gICAgKTtcbiAgICBjb25zdCBsYWJlbE9mZnNldFggPSBjb21wb25lbnQubGFiZWwgPyAoY29tcG9uZW50LmxhYmVsLm5lZ1ggPyAtMSA6IDEpICogY29tcG9uZW50LmxhYmVsLm9mZnNldFggOiB2b2lkIDA7XG4gICAgY29uc3QgbGFiZWxPZmZzZXRZID0gY29tcG9uZW50LmxhYmVsID8gKGNvbXBvbmVudC5sYWJlbC5uZWdZID8gLTEgOiAxKSAqIGNvbXBvbmVudC5sYWJlbC5vZmZzZXRZIDogdm9pZCAwO1xuICAgIGNvbnN0IHNvdXJjZVN0cmF0ZWd5ID0gY29tcG9uZW50LmRlY29yYXRvcj8uc3RyYXRlZ3k7XG4gICAgZGIuYWRkTm9kZShcbiAgICAgIGNvbXBvbmVudC5uYW1lLFxuICAgICAgY29tcG9uZW50Lm5hbWUsXG4gICAgICBjb29yZHMueCxcbiAgICAgIGNvb3Jkcy55LFxuICAgICAgXCJjb21wb25lbnRcIixcbiAgICAgIGxhYmVsT2Zmc2V0WCxcbiAgICAgIGxhYmVsT2Zmc2V0WSxcbiAgICAgIGNvbXBvbmVudC5pbmVydGlhLFxuICAgICAgc291cmNlU3RyYXRlZ3lcbiAgICApO1xuICB9KTtcbiAgYXN0Lm5vdGVzLmZvckVhY2goKG5vdGUpID0+IHtcbiAgICBjb25zdCBjb29yZHMgPSB0b0Nvb3JkaW5hdGVzKG5vdGUudmlzaWJpbGl0eSwgbm90ZS5ldm9sdXRpb24sIGBOb3RlIFwiJHtub3RlLnRleHR9XCJgKTtcbiAgICBkYi5hZGROb3RlKG5vdGUudGV4dCwgY29vcmRzLngsIGNvb3Jkcy55KTtcbiAgfSk7XG4gIGFzdC5waXBlbGluZXMuZm9yRWFjaCgocGlwZWxpbmUpID0+IHtcbiAgICBjb25zdCBwYXJlbnROb2RlID0gZGIuZ2V0Tm9kZShwaXBlbGluZS5wYXJlbnQpO1xuICAgIGlmICghcGFyZW50Tm9kZSB8fCB0eXBlb2YgcGFyZW50Tm9kZS55ICE9PSBcIm51bWJlclwiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBQaXBlbGluZSBcIiR7cGlwZWxpbmUucGFyZW50fVwiIG11c3QgcmVmZXJlbmNlIGFuIGV4aXN0aW5nIGNvbXBvbmVudCB3aXRoIGNvb3JkaW5hdGVzLmBcbiAgICAgICk7XG4gICAgfVxuICAgIGNvbnN0IHBhcmVudFkgPSBwYXJlbnROb2RlLnk7XG4gICAgZGIuc3RhcnRQaXBlbGluZShwaXBlbGluZS5wYXJlbnQpO1xuICAgIHBpcGVsaW5lLmNvbXBvbmVudHMuZm9yRWFjaCgoY29tcG9uZW50KSA9PiB7XG4gICAgICBjb25zdCBjb21wb25lbnRJZCA9IGAke3BpcGVsaW5lLnBhcmVudH1fJHtjb21wb25lbnQubmFtZX1gO1xuICAgICAgY29uc3QgbGFiZWxPZmZzZXRYID0gY29tcG9uZW50LmxhYmVsID8gKGNvbXBvbmVudC5sYWJlbC5uZWdYID8gLTEgOiAxKSAqIGNvbXBvbmVudC5sYWJlbC5vZmZzZXRYIDogdm9pZCAwO1xuICAgICAgY29uc3QgbGFiZWxPZmZzZXRZID0gY29tcG9uZW50LmxhYmVsID8gKGNvbXBvbmVudC5sYWJlbC5uZWdZID8gLTEgOiAxKSAqIGNvbXBvbmVudC5sYWJlbC5vZmZzZXRZIDogdm9pZCAwO1xuICAgICAgY29uc3QgeCA9IHRvUGVyY2VudChjb21wb25lbnQuZXZvbHV0aW9uLCBgUGlwZWxpbmUgY29tcG9uZW50IFwiJHtjb21wb25lbnQubmFtZX1cIiBldm9sdXRpb25gKTtcbiAgICAgIGRiLmFkZE5vZGUoXG4gICAgICAgIGNvbXBvbmVudElkLFxuICAgICAgICBjb21wb25lbnQubmFtZSxcbiAgICAgICAgeCxcbiAgICAgICAgcGFyZW50WSxcbiAgICAgICAgXCJwaXBlbGluZS1jb21wb25lbnRcIixcbiAgICAgICAgbGFiZWxPZmZzZXRYLFxuICAgICAgICBsYWJlbE9mZnNldFlcbiAgICAgICk7XG4gICAgICBkYi5hZGRQaXBlbGluZUNvbXBvbmVudChwaXBlbGluZS5wYXJlbnQsIGNvbXBvbmVudElkKTtcbiAgICB9KTtcbiAgfSk7XG4gIGFzdC5saW5rcy5mb3JFYWNoKChsaW5rKSA9PiB7XG4gICAgY29uc3QgaXNEYXNoZWQgPSAhIWxpbmsuYXJyb3cgJiYgKGxpbmsuYXJyb3cuaW5jbHVkZXMoXCItLi0+XCIpIHx8IGxpbmsuYXJyb3cuaW5jbHVkZXMoXCIuLS5cIikpO1xuICAgIGxldCBmbG93ID0gZ2V0Rmxvd0Zyb21Qb3J0KGxpbmsuZnJvbVBvcnQpID8/IGdldEZsb3dGcm9tUG9ydChsaW5rLnRvUG9ydCk7XG4gICAgY29uc3QgeyBmbG93OiBhcnJvd0Zsb3csIGxhYmVsOiBmbG93TGFiZWwgfSA9IGV4dHJhY3RGbG93RnJvbUFycm93KGxpbmsuYXJyb3cpO1xuICAgIGlmICghZmxvdyAmJiBhcnJvd0Zsb3cpIHtcbiAgICAgIGZsb3cgPSBhcnJvd0Zsb3c7XG4gICAgfVxuICAgIGNvbnN0IGFubm90YXRpb24gPSBsaW5rLmxpbmtMYWJlbDtcbiAgICBjb25zdCBsYWJlbCA9IGZsb3dMYWJlbCA/PyBhbm5vdGF0aW9uO1xuICAgIGRiLmFkZExpbmsoZGIucmVzb2x2ZU5vZGVJZChsaW5rLmZyb20pLCBkYi5yZXNvbHZlTm9kZUlkKGxpbmsudG8pLCBpc0Rhc2hlZCwgbGFiZWwsIGZsb3cpO1xuICB9KTtcbiAgYXN0LmV2b2x2ZXMuZm9yRWFjaCgoZXZvbHZlKSA9PiB7XG4gICAgY29uc3Qgbm9kZSA9IGRiLmdldE5vZGUoZXZvbHZlLmNvbXBvbmVudCk7XG4gICAgaWYgKG5vZGU/LnkgIT09IHZvaWQgMCkge1xuICAgICAgY29uc3QgdGFyZ2V0ID0gdG9QZXJjZW50KGV2b2x2ZS50YXJnZXQsIGBFdm9sdmUgdGFyZ2V0IGZvciBcIiR7ZXZvbHZlLmNvbXBvbmVudH1cImApO1xuICAgICAgZGIuYWRkVHJlbmQoZXZvbHZlLmNvbXBvbmVudCwgdGFyZ2V0LCBub2RlLnkpO1xuICAgIH1cbiAgfSk7XG4gIGlmIChhc3QuYW5ub3RhdGlvbnMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGFubm90YXRpb25zQm94ID0gYXN0LmFubm90YXRpb25zWzBdO1xuICAgIGNvbnN0IGNvb3JkcyA9IHRvQ29vcmRpbmF0ZXMoYW5ub3RhdGlvbnNCb3gueCwgYW5ub3RhdGlvbnNCb3gueSwgXCJBbm5vdGF0aW9ucyBib3hcIik7XG4gICAgZGIuc2V0QW5ub3RhdGlvbnNCb3goY29vcmRzLngsIGNvb3Jkcy55KTtcbiAgfVxuICBhc3QuYW5ub3RhdGlvbi5mb3JFYWNoKChhbm5vdGF0aW9uKSA9PiB7XG4gICAgY29uc3QgY29vcmRzID0gdG9Db29yZGluYXRlcyhhbm5vdGF0aW9uLngsIGFubm90YXRpb24ueSwgYEFubm90YXRpb24gJHthbm5vdGF0aW9uLm51bWJlcn1gKTtcbiAgICBkYi5hZGRBbm5vdGF0aW9uKGFubm90YXRpb24ubnVtYmVyLCBbeyB4OiBjb29yZHMueCwgeTogY29vcmRzLnkgfV0sIGFubm90YXRpb24udGV4dCk7XG4gIH0pO1xuICBhc3QuYWNjZWxlcmF0b3JzLmZvckVhY2goKGFjY2VsZXJhdG9yKSA9PiB7XG4gICAgY29uc3QgY29vcmRzID0gdG9Db29yZGluYXRlcyhhY2NlbGVyYXRvci54LCBhY2NlbGVyYXRvci55LCBgQWNjZWxlcmF0b3IgXCIke2FjY2VsZXJhdG9yLm5hbWV9XCJgKTtcbiAgICBkYi5hZGRBY2NlbGVyYXRvcihhY2NlbGVyYXRvci5uYW1lLCBjb29yZHMueCwgY29vcmRzLnkpO1xuICB9KTtcbiAgYXN0LmRlYWNjZWxlcmF0b3JzLmZvckVhY2goKGRlYWNjZWxlcmF0b3IpID0+IHtcbiAgICBjb25zdCBjb29yZHMgPSB0b0Nvb3JkaW5hdGVzKFxuICAgICAgZGVhY2NlbGVyYXRvci54LFxuICAgICAgZGVhY2NlbGVyYXRvci55LFxuICAgICAgYERlYWNjZWxlcmF0b3IgXCIke2RlYWNjZWxlcmF0b3IubmFtZX1cImBcbiAgICApO1xuICAgIGRiLmFkZERlYWNjZWxlcmF0b3IoZGVhY2NlbGVyYXRvci5uYW1lLCBjb29yZHMueCwgY29vcmRzLnkpO1xuICB9KTtcbn0sIFwicG9wdWxhdGVEYlwiKTtcbnZhciBwYXJzZXIgPSB7XG4gIHBhcnNlcjoge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBXYXJkbGV5REIgaXMgbm90IGFzc2lnbmFibGUgdG8gRGlhZ3JhbURCXG4gICAgeXk6IHZvaWQgMFxuICB9LFxuICBwYXJzZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAoaW5wdXQpID0+IHtcbiAgICBjb25zdCBhc3QgPSBhd2FpdCBwYXJzZShcIndhcmRsZXlcIiwgaW5wdXQpO1xuICAgIGxvZy5kZWJ1Zyhhc3QpO1xuICAgIGNvbnN0IGRiID0gcGFyc2VyLnBhcnNlcj8ueXk7XG4gICAgaWYgKCFkYiB8fCB0eXBlb2YgZGIuYWRkTm9kZSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIFwicGFyc2VyLnBhcnNlcj8ueXkgd2FzIG5vdCBhIFdhcmRsZXlEQi4gVGhpcyBpcyBkdWUgdG8gYSBidWcgd2l0aGluIE1lcm1haWQsIHBsZWFzZSByZXBvcnQgdGhpcyBpc3N1ZSBhdCBodHRwczovL2dpdGh1Yi5jb20vbWVybWFpZC1qcy9tZXJtYWlkL2lzc3Vlcy5cIlxuICAgICAgKTtcbiAgICB9XG4gICAgcG9wdWxhdGVEYihhc3QsIGRiKTtcbiAgfSwgXCJwYXJzZVwiKVxufTtcblxuLy8gc3JjL2RpYWdyYW1zL3dhcmRsZXkvd2FyZGxleUJ1aWxkZXIudHNcbnZhciBXYXJkbGV5QnVpbGRlciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5ub2RlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgdGhpcy5saW5rcyA9IFtdO1xuICAgIHRoaXMudHJlbmRzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICB0aGlzLnBpcGVsaW5lcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgdGhpcy5hbm5vdGF0aW9ucyA9IFtdO1xuICAgIHRoaXMubm90ZXMgPSBbXTtcbiAgICB0aGlzLmFjY2VsZXJhdG9ycyA9IFtdO1xuICAgIHRoaXMuZGVhY2NlbGVyYXRvcnMgPSBbXTtcbiAgICB0aGlzLmF4ZXMgPSB7fTtcbiAgfVxuICBzdGF0aWMge1xuICAgIF9fbmFtZSh0aGlzLCBcIldhcmRsZXlCdWlsZGVyXCIpO1xuICB9XG4gIGFkZE5vZGUobm9kZSkge1xuICAgIGNvbnN0IGV4aXN0aW5nID0gdGhpcy5ub2Rlcy5nZXQobm9kZS5pZCkgPz8geyBpZDogbm9kZS5pZCwgbGFiZWw6IG5vZGUubGFiZWwgfTtcbiAgICBjb25zdCBtZXJnZWQgPSB7XG4gICAgICAuLi5leGlzdGluZyxcbiAgICAgIC4uLm5vZGUsXG4gICAgICBjbGFzc05hbWU6IG5vZGUuY2xhc3NOYW1lID8/IGV4aXN0aW5nLmNsYXNzTmFtZSxcbiAgICAgIGxhYmVsT2Zmc2V0WDogbm9kZS5sYWJlbE9mZnNldFggPz8gZXhpc3RpbmcubGFiZWxPZmZzZXRYLFxuICAgICAgbGFiZWxPZmZzZXRZOiBub2RlLmxhYmVsT2Zmc2V0WSA/PyBleGlzdGluZy5sYWJlbE9mZnNldFlcbiAgICB9O1xuICAgIHRoaXMubm9kZXMuc2V0KG5vZGUuaWQsIG1lcmdlZCk7XG4gIH1cbiAgYWRkTGluayhsaW5rKSB7XG4gICAgdGhpcy5saW5rcy5wdXNoKGxpbmspO1xuICB9XG4gIGFkZFRyZW5kKHRyZW5kKSB7XG4gICAgdGhpcy50cmVuZHMuc2V0KHRyZW5kLm5vZGVJZCwgdHJlbmQpO1xuICB9XG4gIHN0YXJ0UGlwZWxpbmUobm9kZUlkKSB7XG4gICAgdGhpcy5waXBlbGluZXMuc2V0KG5vZGVJZCwgeyBub2RlSWQsIGNvbXBvbmVudElkczogW10gfSk7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMubm9kZXMuZ2V0KG5vZGVJZCk7XG4gICAgaWYgKG5vZGUpIHtcbiAgICAgIG5vZGUuaXNQaXBlbGluZVBhcmVudCA9IHRydWU7XG4gICAgfVxuICB9XG4gIGFkZFBpcGVsaW5lQ29tcG9uZW50KHBpcGVsaW5lTm9kZUlkLCBjb21wb25lbnRJZCkge1xuICAgIGNvbnN0IHBpcGVsaW5lID0gdGhpcy5waXBlbGluZXMuZ2V0KHBpcGVsaW5lTm9kZUlkKTtcbiAgICBpZiAocGlwZWxpbmUpIHtcbiAgICAgIHBpcGVsaW5lLmNvbXBvbmVudElkcy5wdXNoKGNvbXBvbmVudElkKTtcbiAgICB9XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMubm9kZXMuZ2V0KGNvbXBvbmVudElkKTtcbiAgICBpZiAobm9kZSkge1xuICAgICAgbm9kZS5pblBpcGVsaW5lID0gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgYWRkQW5ub3RhdGlvbihhbm5vdGF0aW9uKSB7XG4gICAgdGhpcy5hbm5vdGF0aW9ucy5wdXNoKGFubm90YXRpb24pO1xuICB9XG4gIGFkZE5vdGUobm90ZSkge1xuICAgIHRoaXMubm90ZXMucHVzaChub3RlKTtcbiAgfVxuICBhZGRBY2NlbGVyYXRvcihhY2NlbGVyYXRvcikge1xuICAgIHRoaXMuYWNjZWxlcmF0b3JzLnB1c2goYWNjZWxlcmF0b3IpO1xuICB9XG4gIGFkZERlYWNjZWxlcmF0b3IoZGVhY2NlbGVyYXRvcikge1xuICAgIHRoaXMuZGVhY2NlbGVyYXRvcnMucHVzaChkZWFjY2VsZXJhdG9yKTtcbiAgfVxuICBzZXRBbm5vdGF0aW9uc0JveCh4LCB5KSB7XG4gICAgdGhpcy5hbm5vdGF0aW9uc0JveCA9IHsgeCwgeSB9O1xuICB9XG4gIHNldEF4ZXMocGFydGlhbCkge1xuICAgIHRoaXMuYXhlcyA9IHtcbiAgICAgIC4uLnRoaXMuYXhlcyxcbiAgICAgIC4uLnBhcnRpYWxcbiAgICB9O1xuICB9XG4gIHNldFNpemUod2lkdGgsIGhlaWdodCkge1xuICAgIHRoaXMuc2l6ZSA9IHsgd2lkdGgsIGhlaWdodCB9O1xuICB9XG4gIGdldE5vZGUoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5ub2Rlcy5nZXQoaWQpO1xuICB9XG4gIC8qKlxuICAgKiBSZXNvbHZlIGEgbmFtZSB0byBhIG5vZGUgSUQuIFRyaWVzIGV4YWN0IElEIG1hdGNoIGZpcnN0LFxuICAgKiB0aGVuIGZhbGxzIGJhY2sgdG8gZmluZGluZyBhIG5vZGUgd2hvc2UgbGFiZWwgbWF0Y2hlcyB0aGUgbmFtZVxuICAgKiAoaGFuZGxlcyBwaXBlbGluZSBjb21wb25lbnRzIHdoaWNoIGhhdmUgc3ludGhldGljIElEcyBsaWtlIFwiUGFyZW50X0NoaWxkXCIpLlxuICAgKi9cbiAgcmVzb2x2ZU5vZGVJZChuYW1lKSB7XG4gICAgaWYgKHRoaXMubm9kZXMuaGFzKG5hbWUpKSB7XG4gICAgICByZXR1cm4gbmFtZTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBbaWQsIG5vZGVdIG9mIHRoaXMubm9kZXMpIHtcbiAgICAgIGlmIChub2RlLmxhYmVsID09PSBuYW1lKSB7XG4gICAgICAgIHJldHVybiBpZDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5hbWU7XG4gIH1cbiAgYnVpbGQoKSB7XG4gICAgY29uc3Qgbm9kZXMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2YgdGhpcy5ub2Rlcy52YWx1ZXMoKSkge1xuICAgICAgaWYgKHR5cGVvZiBub2RlLnggIT09IFwibnVtYmVyXCIgfHwgdHlwZW9mIG5vZGUueSAhPT0gXCJudW1iZXJcIikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vZGUgXCIke25vZGUubGFiZWx9XCIgaXMgbWlzc2luZyBjb29yZGluYXRlc2ApO1xuICAgICAgfVxuICAgICAgbm9kZXMucHVzaChub2RlKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIG5vZGVzLFxuICAgICAgbGlua3M6IFsuLi50aGlzLmxpbmtzXSxcbiAgICAgIHRyZW5kczogWy4uLnRoaXMudHJlbmRzLnZhbHVlcygpXSxcbiAgICAgIHBpcGVsaW5lczogWy4uLnRoaXMucGlwZWxpbmVzLnZhbHVlcygpXSxcbiAgICAgIGFubm90YXRpb25zOiBbLi4udGhpcy5hbm5vdGF0aW9uc10sXG4gICAgICBub3RlczogWy4uLnRoaXMubm90ZXNdLFxuICAgICAgYWNjZWxlcmF0b3JzOiBbLi4udGhpcy5hY2NlbGVyYXRvcnNdLFxuICAgICAgZGVhY2NlbGVyYXRvcnM6IFsuLi50aGlzLmRlYWNjZWxlcmF0b3JzXSxcbiAgICAgIGFubm90YXRpb25zQm94OiB0aGlzLmFubm90YXRpb25zQm94LFxuICAgICAgYXhlczogeyAuLi50aGlzLmF4ZXMgfSxcbiAgICAgIHNpemU6IHRoaXMuc2l6ZVxuICAgIH07XG4gIH1cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5ub2Rlcy5jbGVhcigpO1xuICAgIHRoaXMubGlua3MgPSBbXTtcbiAgICB0aGlzLnRyZW5kcy5jbGVhcigpO1xuICAgIHRoaXMucGlwZWxpbmVzLmNsZWFyKCk7XG4gICAgdGhpcy5hbm5vdGF0aW9ucyA9IFtdO1xuICAgIHRoaXMubm90ZXMgPSBbXTtcbiAgICB0aGlzLmFjY2VsZXJhdG9ycyA9IFtdO1xuICAgIHRoaXMuZGVhY2NlbGVyYXRvcnMgPSBbXTtcbiAgICB0aGlzLmFubm90YXRpb25zQm94ID0gdm9pZCAwO1xuICAgIHRoaXMuYXhlcyA9IHt9O1xuICAgIHRoaXMuc2l6ZSA9IHZvaWQgMDtcbiAgfVxufTtcblxuLy8gc3JjL2RpYWdyYW1zL3dhcmRsZXkvd2FyZGxleURiLnRzXG52YXIgYnVpbGRlciA9IG5ldyBXYXJkbGV5QnVpbGRlcigpO1xuZnVuY3Rpb24gZ2V0Q29uZmlnMygpIHtcbiAgcmV0dXJuIGdldENvbmZpZzIoKVtcIndhcmRsZXktYmV0YVwiXTtcbn1cbl9fbmFtZShnZXRDb25maWczLCBcImdldENvbmZpZ1wiKTtcbmZ1bmN0aW9uIGFkZE5vZGUoaWQsIGxhYmVsLCB4LCB5LCBjbGFzc05hbWUsIGxhYmVsT2Zmc2V0WCwgbGFiZWxPZmZzZXRZLCBpbmVydGlhLCBzb3VyY2VTdHJhdGVneSkge1xuICBidWlsZGVyLmFkZE5vZGUoe1xuICAgIGlkLFxuICAgIGxhYmVsLFxuICAgIHgsXG4gICAgeSxcbiAgICBjbGFzc05hbWUsXG4gICAgbGFiZWxPZmZzZXRYLFxuICAgIGxhYmVsT2Zmc2V0WSxcbiAgICBpbmVydGlhLFxuICAgIHNvdXJjZVN0cmF0ZWd5XG4gIH0pO1xufVxuX19uYW1lKGFkZE5vZGUsIFwiYWRkTm9kZVwiKTtcbmZ1bmN0aW9uIGFkZExpbmsoc291cmNlSWQsIHRhcmdldElkLCBkYXNoZWQgPSBmYWxzZSwgbGFiZWwsIGZsb3cpIHtcbiAgYnVpbGRlci5hZGRMaW5rKHtcbiAgICBzb3VyY2U6IHNvdXJjZUlkLFxuICAgIHRhcmdldDogdGFyZ2V0SWQsXG4gICAgZGFzaGVkLFxuICAgIGxhYmVsLFxuICAgIGZsb3dcbiAgfSk7XG59XG5fX25hbWUoYWRkTGluaywgXCJhZGRMaW5rXCIpO1xuZnVuY3Rpb24gYWRkVHJlbmQobm9kZUlkLCB0YXJnZXRYLCB0YXJnZXRZKSB7XG4gIGJ1aWxkZXIuYWRkVHJlbmQoeyBub2RlSWQsIHRhcmdldFgsIHRhcmdldFkgfSk7XG59XG5fX25hbWUoYWRkVHJlbmQsIFwiYWRkVHJlbmRcIik7XG5mdW5jdGlvbiBhZGRBbm5vdGF0aW9uKG51bWJlciwgY29vcmRpbmF0ZXMsIHRleHQpIHtcbiAgYnVpbGRlci5hZGRBbm5vdGF0aW9uKHtcbiAgICBudW1iZXIsXG4gICAgY29vcmRpbmF0ZXMsXG4gICAgdGV4dFxuICB9KTtcbn1cbl9fbmFtZShhZGRBbm5vdGF0aW9uLCBcImFkZEFubm90YXRpb25cIik7XG5mdW5jdGlvbiBhZGROb3RlKHRleHQsIHgsIHkpIHtcbiAgYnVpbGRlci5hZGROb3RlKHtcbiAgICB0ZXh0LFxuICAgIHgsXG4gICAgeVxuICB9KTtcbn1cbl9fbmFtZShhZGROb3RlLCBcImFkZE5vdGVcIik7XG5mdW5jdGlvbiBhZGRBY2NlbGVyYXRvcihuYW1lLCB4LCB5KSB7XG4gIGJ1aWxkZXIuYWRkQWNjZWxlcmF0b3Ioe1xuICAgIG5hbWUsXG4gICAgeCxcbiAgICB5XG4gIH0pO1xufVxuX19uYW1lKGFkZEFjY2VsZXJhdG9yLCBcImFkZEFjY2VsZXJhdG9yXCIpO1xuZnVuY3Rpb24gYWRkRGVhY2NlbGVyYXRvcihuYW1lLCB4LCB5KSB7XG4gIGJ1aWxkZXIuYWRkRGVhY2NlbGVyYXRvcih7XG4gICAgbmFtZSxcbiAgICB4LFxuICAgIHlcbiAgfSk7XG59XG5fX25hbWUoYWRkRGVhY2NlbGVyYXRvciwgXCJhZGREZWFjY2VsZXJhdG9yXCIpO1xuZnVuY3Rpb24gc2V0QW5ub3RhdGlvbnNCb3goeCwgeSkge1xuICBidWlsZGVyLnNldEFubm90YXRpb25zQm94KHgsIHkpO1xufVxuX19uYW1lKHNldEFubm90YXRpb25zQm94LCBcInNldEFubm90YXRpb25zQm94XCIpO1xuZnVuY3Rpb24gc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KSB7XG4gIGJ1aWxkZXIuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcbn1cbl9fbmFtZShzZXRTaXplLCBcInNldFNpemVcIik7XG5mdW5jdGlvbiBzdGFydFBpcGVsaW5lKG5vZGVJZCkge1xuICBidWlsZGVyLnN0YXJ0UGlwZWxpbmUobm9kZUlkKTtcbn1cbl9fbmFtZShzdGFydFBpcGVsaW5lLCBcInN0YXJ0UGlwZWxpbmVcIik7XG5mdW5jdGlvbiBhZGRQaXBlbGluZUNvbXBvbmVudChwaXBlbGluZU5vZGVJZCwgY29tcG9uZW50SWQpIHtcbiAgYnVpbGRlci5hZGRQaXBlbGluZUNvbXBvbmVudChwaXBlbGluZU5vZGVJZCwgY29tcG9uZW50SWQpO1xufVxuX19uYW1lKGFkZFBpcGVsaW5lQ29tcG9uZW50LCBcImFkZFBpcGVsaW5lQ29tcG9uZW50XCIpO1xuZnVuY3Rpb24gdXBkYXRlQXhlcyhwYXJ0aWFsKSB7XG4gIGJ1aWxkZXIuc2V0QXhlcyhwYXJ0aWFsKTtcbn1cbl9fbmFtZSh1cGRhdGVBeGVzLCBcInVwZGF0ZUF4ZXNcIik7XG5mdW5jdGlvbiBnZXROb2RlKGlkKSB7XG4gIHJldHVybiBidWlsZGVyLmdldE5vZGUoaWQpO1xufVxuX19uYW1lKGdldE5vZGUsIFwiZ2V0Tm9kZVwiKTtcbmZ1bmN0aW9uIHJlc29sdmVOb2RlSWQobmFtZSkge1xuICByZXR1cm4gYnVpbGRlci5yZXNvbHZlTm9kZUlkKG5hbWUpO1xufVxuX19uYW1lKHJlc29sdmVOb2RlSWQsIFwicmVzb2x2ZU5vZGVJZFwiKTtcbmZ1bmN0aW9uIGdldFdhcmRsZXlEYXRhKCkge1xuICByZXR1cm4gYnVpbGRlci5idWlsZCgpO1xufVxuX19uYW1lKGdldFdhcmRsZXlEYXRhLCBcImdldFdhcmRsZXlEYXRhXCIpO1xuZnVuY3Rpb24gY2xlYXIyKCkge1xuICBidWlsZGVyLmNsZWFyKCk7XG4gIGNsZWFyKCk7XG59XG5fX25hbWUoY2xlYXIyLCBcImNsZWFyXCIpO1xudmFyIHdhcmRsZXlEYl9kZWZhdWx0ID0ge1xuICBnZXRDb25maWc6IGdldENvbmZpZzMsXG4gIGFkZE5vZGUsXG4gIGFkZExpbmssXG4gIGFkZFRyZW5kLFxuICBhZGRBbm5vdGF0aW9uLFxuICBhZGROb3RlLFxuICBhZGRBY2NlbGVyYXRvcixcbiAgYWRkRGVhY2NlbGVyYXRvcixcbiAgc2V0QW5ub3RhdGlvbnNCb3gsXG4gIHNldFNpemUsXG4gIHN0YXJ0UGlwZWxpbmUsXG4gIGFkZFBpcGVsaW5lQ29tcG9uZW50LFxuICB1cGRhdGVBeGVzLFxuICBnZXROb2RlLFxuICByZXNvbHZlTm9kZUlkLFxuICBnZXRXYXJkbGV5RGF0YSxcbiAgY2xlYXI6IGNsZWFyMixcbiAgc2V0QWNjVGl0bGUsXG4gIGdldEFjY1RpdGxlLFxuICBzZXREaWFncmFtVGl0bGUsXG4gIGdldERpYWdyYW1UaXRsZSxcbiAgZ2V0QWNjRGVzY3JpcHRpb24sXG4gIHNldEFjY0Rlc2NyaXB0aW9uXG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMvd2FyZGxleS93YXJkbGV5UmVuZGVyZXIudHNcbnZhciBERUZBVUxUX1NUQUdFUyA9IFtcIkdlbmVzaXNcIiwgXCJDdXN0b20gQnVpbHRcIiwgXCJQcm9kdWN0XCIsIFwiQ29tbW9kaXR5XCJdO1xudmFyIGdldFRoZW1lID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiB7XG4gIGNvbnN0IHsgdGhlbWVWYXJpYWJsZXMgfSA9IGdldENvbmZpZzIoKTtcbiAgcmV0dXJuIHtcbiAgICBiYWNrZ3JvdW5kQ29sb3I6IHRoZW1lVmFyaWFibGVzLndhcmRsZXk/LmJhY2tncm91bmRDb2xvciA/PyB0aGVtZVZhcmlhYmxlcy5iYWNrZ3JvdW5kID8/IFwiI2ZmZlwiLFxuICAgIGF4aXNDb2xvcjogdGhlbWVWYXJpYWJsZXMud2FyZGxleT8uYXhpc0NvbG9yID8/IFwiIzAwMFwiLFxuICAgIGF4aXNUZXh0Q29sb3I6IHRoZW1lVmFyaWFibGVzLndhcmRsZXk/LmF4aXNUZXh0Q29sb3IgPz8gdGhlbWVWYXJpYWJsZXMucHJpbWFyeVRleHRDb2xvciA/PyBcIiMyMjJcIixcbiAgICBncmlkQ29sb3I6IHRoZW1lVmFyaWFibGVzLndhcmRsZXk/LmdyaWRDb2xvciA/PyBcInJnYmEoMTAwLCAxMDAsIDEwMCwgMC4yKVwiLFxuICAgIGNvbXBvbmVudEZpbGw6IHRoZW1lVmFyaWFibGVzLndhcmRsZXk/LmNvbXBvbmVudEZpbGwgPz8gXCIjZmZmXCIsXG4gICAgY29tcG9uZW50U3Ryb2tlOiB0aGVtZVZhcmlhYmxlcy53YXJkbGV5Py5jb21wb25lbnRTdHJva2UgPz8gXCIjMDAwXCIsXG4gICAgY29tcG9uZW50TGFiZWxDb2xvcjogdGhlbWVWYXJpYWJsZXMud2FyZGxleT8uY29tcG9uZW50TGFiZWxDb2xvciA/PyB0aGVtZVZhcmlhYmxlcy5wcmltYXJ5VGV4dENvbG9yID8/IFwiIzIyMlwiLFxuICAgIGxpbmtTdHJva2U6IHRoZW1lVmFyaWFibGVzLndhcmRsZXk/LmxpbmtTdHJva2UgPz8gXCIjMDAwXCIsXG4gICAgZXZvbHV0aW9uU3Ryb2tlOiB0aGVtZVZhcmlhYmxlcy53YXJkbGV5Py5ldm9sdXRpb25TdHJva2UgPz8gXCIjZGMzNTQ1XCIsXG4gICAgYW5ub3RhdGlvblN0cm9rZTogdGhlbWVWYXJpYWJsZXMud2FyZGxleT8uYW5ub3RhdGlvblN0cm9rZSA/PyBcIiMwMDBcIixcbiAgICBhbm5vdGF0aW9uVGV4dENvbG9yOiB0aGVtZVZhcmlhYmxlcy53YXJkbGV5Py5hbm5vdGF0aW9uVGV4dENvbG9yID8/IHRoZW1lVmFyaWFibGVzLnByaW1hcnlUZXh0Q29sb3IgPz8gXCIjMjIyXCIsXG4gICAgYW5ub3RhdGlvbkZpbGw6IHRoZW1lVmFyaWFibGVzLndhcmRsZXk/LmFubm90YXRpb25GaWxsID8/IHRoZW1lVmFyaWFibGVzLmJhY2tncm91bmQgPz8gXCIjZmZmXCJcbiAgfTtcbn0sIFwiZ2V0VGhlbWVcIik7XG52YXIgZ2V0Q29uZmlnVmFsdWVzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiB7XG4gIGNvbnN0IHdhcmRsZXlDb25maWcgPSBnZXRDb25maWcyKClbXCJ3YXJkbGV5LWJldGFcIl07XG4gIHJldHVybiB7XG4gICAgd2lkdGg6IHdhcmRsZXlDb25maWc/LndpZHRoID8/IDkwMCxcbiAgICBoZWlnaHQ6IHdhcmRsZXlDb25maWc/LmhlaWdodCA/PyA2MDAsXG4gICAgcGFkZGluZzogd2FyZGxleUNvbmZpZz8ucGFkZGluZyA/PyA0OCxcbiAgICBub2RlUmFkaXVzOiB3YXJkbGV5Q29uZmlnPy5ub2RlUmFkaXVzID8/IDYsXG4gICAgbm9kZUxhYmVsT2Zmc2V0OiB3YXJkbGV5Q29uZmlnPy5ub2RlTGFiZWxPZmZzZXQgPz8gOCxcbiAgICBheGlzRm9udFNpemU6IHdhcmRsZXlDb25maWc/LmF4aXNGb250U2l6ZSA/PyAxMixcbiAgICBsYWJlbEZvbnRTaXplOiB3YXJkbGV5Q29uZmlnPy5sYWJlbEZvbnRTaXplID8/IDEwLFxuICAgIHNob3dHcmlkOiB3YXJkbGV5Q29uZmlnPy5zaG93R3JpZCA/PyBmYWxzZSxcbiAgICB1c2VNYXhXaWR0aDogd2FyZGxleUNvbmZpZz8udXNlTWF4V2lkdGggPz8gdHJ1ZVxuICB9O1xufSwgXCJnZXRDb25maWdWYWx1ZXNcIik7XG52YXIgZHJhdyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHRleHQsIGlkLCBfdmVyc2lvbiwgZGlhZ09iaikgPT4ge1xuICBsb2cuZGVidWcoXCJSZW5kZXJpbmcgV2FyZGxleSBtYXBcXG5cIiArIHRleHQpO1xuICBjb25zdCBjb25maWdWYWx1ZXMgPSBnZXRDb25maWdWYWx1ZXMoKTtcbiAgY29uc3QgdGhlbWUgPSBnZXRUaGVtZSgpO1xuICBjb25zdCBzcXVhcmVTaXplID0gY29uZmlnVmFsdWVzLm5vZGVSYWRpdXMgKiAxLjY7XG4gIGNvbnN0IGRiID0gZGlhZ09iai5kYjtcbiAgY29uc3QgZGF0YSA9IGRiLmdldFdhcmRsZXlEYXRhKCk7XG4gIGNvbnN0IHRpdGxlID0gZGIuZ2V0RGlhZ3JhbVRpdGxlKCk7XG4gIGNvbnN0IHdpZHRoID0gZGF0YS5zaXplPy53aWR0aCA/PyBjb25maWdWYWx1ZXMud2lkdGg7XG4gIGNvbnN0IGhlaWdodCA9IGRhdGEuc2l6ZT8uaGVpZ2h0ID8/IGNvbmZpZ1ZhbHVlcy5oZWlnaHQ7XG4gIGNvbnN0IHN2ZyA9IHNlbGVjdFN2Z0VsZW1lbnQoaWQpO1xuICBzdmcuc2VsZWN0QWxsKFwiKlwiKS5yZW1vdmUoKTtcbiAgY29uZmlndXJlU3ZnU2l6ZShzdmcsIGhlaWdodCwgd2lkdGgsIGNvbmZpZ1ZhbHVlcy51c2VNYXhXaWR0aCk7XG4gIHN2Zy5hdHRyKFwidmlld0JveFwiLCBgMCAwICR7d2lkdGh9ICR7aGVpZ2h0fWApO1xuICBjb25zdCByb290ID0gc3ZnLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwid2FyZGxleS1tYXBcIik7XG4gIGNvbnN0IGRlZnMgPSBzdmcuYXBwZW5kKFwiZGVmc1wiKTtcbiAgZGVmcy5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGBhcnJvdy0ke2lkfWApLmF0dHIoXCJ2aWV3Qm94XCIsIFwiMCAwIDEwIDEwXCIpLmF0dHIoXCJyZWZYXCIsIDkpLmF0dHIoXCJyZWZZXCIsIDUpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCA2KS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDYpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvLXN0YXJ0LXJldmVyc2VcIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0gMCAwIEwgMTAgNSBMIDAgMTAgelwiKS5hdHRyKFwiZmlsbFwiLCB0aGVtZS5ldm9sdXRpb25TdHJva2UpLmF0dHIoXCJzdHJva2VcIiwgXCJub25lXCIpO1xuICBkZWZzLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgYGxpbmstYXJyb3ctZW5kLSR7aWR9YCkuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMTAgMTBcIikuYXR0cihcInJlZlhcIiwgOSkuYXR0cihcInJlZllcIiwgNSkuYXR0cihcIm1hcmtlcldpZHRoXCIsIDUpLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgNSkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0gMCAwIEwgMTAgNSBMIDAgMTAgelwiKS5hdHRyKFwiZmlsbFwiLCB0aGVtZS5saW5rU3Ryb2tlKS5hdHRyKFwic3Ryb2tlXCIsIFwibm9uZVwiKTtcbiAgZGVmcy5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGBsaW5rLWFycm93LXN0YXJ0LSR7aWR9YCkuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMTAgMTBcIikuYXR0cihcInJlZlhcIiwgMSkuYXR0cihcInJlZllcIiwgNSkuYXR0cihcIm1hcmtlcldpZHRoXCIsIDUpLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgNSkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0gMTAgMCBMIDAgNSBMIDEwIDEwIHpcIikuYXR0cihcImZpbGxcIiwgdGhlbWUubGlua1N0cm9rZSkuYXR0cihcInN0cm9rZVwiLCBcIm5vbmVcIik7XG4gIHJvb3QuYXBwZW5kKFwicmVjdFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJ3YXJkbGV5LWJhY2tncm91bmRcIikuYXR0cihcIndpZHRoXCIsIHdpZHRoKS5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCkuYXR0cihcImZpbGxcIiwgdGhlbWUuYmFja2dyb3VuZENvbG9yKTtcbiAgY29uc3QgY2hhcnRXaWR0aCA9IHdpZHRoIC0gY29uZmlnVmFsdWVzLnBhZGRpbmcgKiAyO1xuICBjb25zdCBjaGFydEhlaWdodCA9IGhlaWdodCAtIGNvbmZpZ1ZhbHVlcy5wYWRkaW5nICogMjtcbiAgaWYgKHRpdGxlKSB7XG4gICAgcm9vdC5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJjbGFzc1wiLCBcIndhcmRsZXktdGl0bGVcIikuYXR0cihcInhcIiwgd2lkdGggLyAyKS5hdHRyKFwieVwiLCBjb25maWdWYWx1ZXMucGFkZGluZyAvIDIpLmF0dHIoXCJmaWxsXCIsIHRoZW1lLmF4aXNUZXh0Q29sb3IpLmF0dHIoXCJmb250LXNpemVcIiwgY29uZmlnVmFsdWVzLmF4aXNGb250U2l6ZSAqIDEuMDUpLmF0dHIoXCJmb250LXdlaWdodFwiLCBcImJvbGRcIikuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpLmF0dHIoXCJkb21pbmFudC1iYXNlbGluZVwiLCBcIm1pZGRsZVwiKS50ZXh0KHRpdGxlKTtcbiAgfVxuICBjb25zdCBwcm9qZWN0WCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHZhbHVlKSA9PiBjb25maWdWYWx1ZXMucGFkZGluZyArIHZhbHVlIC8gMTAwICogY2hhcnRXaWR0aCwgXCJwcm9qZWN0WFwiKTtcbiAgY29uc3QgcHJvamVjdFkgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCh2YWx1ZSkgPT4gaGVpZ2h0IC0gY29uZmlnVmFsdWVzLnBhZGRpbmcgLSB2YWx1ZSAvIDEwMCAqIGNoYXJ0SGVpZ2h0LCBcInByb2plY3RZXCIpO1xuICBjb25zdCBheGlzR3JvdXAgPSByb290LmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwid2FyZGxleS1heGVzXCIpO1xuICBheGlzR3JvdXAuYXBwZW5kKFwibGluZVwiKS5hdHRyKFwieDFcIiwgY29uZmlnVmFsdWVzLnBhZGRpbmcpLmF0dHIoXCJ4MlwiLCB3aWR0aCAtIGNvbmZpZ1ZhbHVlcy5wYWRkaW5nKS5hdHRyKFwieTFcIiwgaGVpZ2h0IC0gY29uZmlnVmFsdWVzLnBhZGRpbmcpLmF0dHIoXCJ5MlwiLCBoZWlnaHQgLSBjb25maWdWYWx1ZXMucGFkZGluZykuYXR0cihcInN0cm9rZVwiLCB0aGVtZS5heGlzQ29sb3IpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMSk7XG4gIGF4aXNHcm91cC5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJ4MVwiLCBjb25maWdWYWx1ZXMucGFkZGluZykuYXR0cihcIngyXCIsIGNvbmZpZ1ZhbHVlcy5wYWRkaW5nKS5hdHRyKFwieTFcIiwgY29uZmlnVmFsdWVzLnBhZGRpbmcpLmF0dHIoXCJ5MlwiLCBoZWlnaHQgLSBjb25maWdWYWx1ZXMucGFkZGluZykuYXR0cihcInN0cm9rZVwiLCB0aGVtZS5heGlzQ29sb3IpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMSk7XG4gIGNvbnN0IHhMYWJlbCA9IGRhdGEuYXhlcy54TGFiZWwgPz8gXCJFdm9sdXRpb25cIjtcbiAgY29uc3QgeUxhYmVsID0gZGF0YS5heGVzLnlMYWJlbCA/PyBcIlZpc2liaWxpdHlcIjtcbiAgYXhpc0dyb3VwLmFwcGVuZChcInRleHRcIikuYXR0cihcImNsYXNzXCIsIFwid2FyZGxleS1heGlzLWxhYmVsIHdhcmRsZXktYXhpcy1sYWJlbC14XCIpLmF0dHIoXCJ4XCIsIGNvbmZpZ1ZhbHVlcy5wYWRkaW5nICsgY2hhcnRXaWR0aCAvIDIpLmF0dHIoXCJ5XCIsIGhlaWdodCAtIGNvbmZpZ1ZhbHVlcy5wYWRkaW5nIC8gNCkuYXR0cihcImZpbGxcIiwgdGhlbWUuYXhpc1RleHRDb2xvcikuYXR0cihcImZvbnQtc2l6ZVwiLCBjb25maWdWYWx1ZXMuYXhpc0ZvbnRTaXplKS5hdHRyKFwiZm9udC13ZWlnaHRcIiwgXCJib2xkXCIpLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBcIm1pZGRsZVwiKS50ZXh0KHhMYWJlbCk7XG4gIGF4aXNHcm91cC5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJjbGFzc1wiLCBcIndhcmRsZXktYXhpcy1sYWJlbCB3YXJkbGV5LWF4aXMtbGFiZWwteVwiKS5hdHRyKFwieFwiLCBjb25maWdWYWx1ZXMucGFkZGluZyAvIDMpLmF0dHIoXCJ5XCIsIGNvbmZpZ1ZhbHVlcy5wYWRkaW5nICsgY2hhcnRIZWlnaHQgLyAyKS5hdHRyKFwiZmlsbFwiLCB0aGVtZS5heGlzVGV4dENvbG9yKS5hdHRyKFwiZm9udC1zaXplXCIsIGNvbmZpZ1ZhbHVlcy5heGlzRm9udFNpemUpLmF0dHIoXCJmb250LXdlaWdodFwiLCBcImJvbGRcIikuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICBgcm90YXRlKC05MCAke2NvbmZpZ1ZhbHVlcy5wYWRkaW5nIC8gM30gJHtjb25maWdWYWx1ZXMucGFkZGluZyArIGNoYXJ0SGVpZ2h0IC8gMn0pYFxuICApLnRleHQoeUxhYmVsKTtcbiAgY29uc3Qgc3RhZ2VzID0gZGF0YS5heGVzLnN0YWdlcyAmJiBkYXRhLmF4ZXMuc3RhZ2VzLmxlbmd0aCA+IDAgPyBkYXRhLmF4ZXMuc3RhZ2VzIDogREVGQVVMVF9TVEFHRVM7XG4gIGlmIChzdGFnZXMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IHN0YWdlR3JvdXAgPSByb290LmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwid2FyZGxleS1zdGFnZXNcIik7XG4gICAgY29uc3QgYm91bmRhcmllcyA9IGRhdGEuYXhlcy5zdGFnZUJvdW5kYXJpZXM7XG4gICAgY29uc3Qgc3RhZ2VQb3NpdGlvbnMgPSBbXTtcbiAgICBpZiAoYm91bmRhcmllcyAmJiBib3VuZGFyaWVzLmxlbmd0aCA9PT0gc3RhZ2VzLmxlbmd0aCkge1xuICAgICAgbGV0IHByZXZCb3VuZGFyeSA9IDA7XG4gICAgICBib3VuZGFyaWVzLmZvckVhY2goKGJvdW5kYXJ5KSA9PiB7XG4gICAgICAgIHN0YWdlUG9zaXRpb25zLnB1c2goeyBzdGFydDogcHJldkJvdW5kYXJ5LCBlbmQ6IGJvdW5kYXJ5IH0pO1xuICAgICAgICBwcmV2Qm91bmRhcnkgPSBib3VuZGFyeTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzdGFnZVdpZHRoID0gMSAvIHN0YWdlcy5sZW5ndGg7XG4gICAgICBzdGFnZXMuZm9yRWFjaCgoXywgaW5kZXgpID0+IHtcbiAgICAgICAgc3RhZ2VQb3NpdGlvbnMucHVzaCh7XG4gICAgICAgICAgc3RhcnQ6IGluZGV4ICogc3RhZ2VXaWR0aCxcbiAgICAgICAgICBlbmQ6IChpbmRleCArIDEpICogc3RhZ2VXaWR0aFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBzdGFnZXMuZm9yRWFjaCgoc3RhZ2UsIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBwb3MgPSBzdGFnZVBvc2l0aW9uc1tpbmRleF07XG4gICAgICBjb25zdCBzdGFydFggPSBjb25maWdWYWx1ZXMucGFkZGluZyArIHBvcy5zdGFydCAqIGNoYXJ0V2lkdGg7XG4gICAgICBjb25zdCBlbmRYID0gY29uZmlnVmFsdWVzLnBhZGRpbmcgKyBwb3MuZW5kICogY2hhcnRXaWR0aDtcbiAgICAgIGNvbnN0IGNlbnRlclggPSAoc3RhcnRYICsgZW5kWCkgLyAyO1xuICAgICAgaWYgKGluZGV4ID4gMCkge1xuICAgICAgICBzdGFnZUdyb3VwLmFwcGVuZChcImxpbmVcIikuYXR0cihcIngxXCIsIHN0YXJ0WCkuYXR0cihcIngyXCIsIHN0YXJ0WCkuYXR0cihcInkxXCIsIGNvbmZpZ1ZhbHVlcy5wYWRkaW5nKS5hdHRyKFwieTJcIiwgaGVpZ2h0IC0gY29uZmlnVmFsdWVzLnBhZGRpbmcpLmF0dHIoXCJzdHJva2VcIiwgXCIjMDAwXCIpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMSkuYXR0cihcInN0cm9rZS1kYXNoYXJyYXlcIiwgXCI1IDVcIikuYXR0cihcIm9wYWNpdHlcIiwgMC44KTtcbiAgICAgIH1cbiAgICAgIHN0YWdlR3JvdXAuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJ3YXJkbGV5LXN0YWdlLWxhYmVsXCIpLmF0dHIoXCJ4XCIsIGNlbnRlclgpLmF0dHIoXCJ5XCIsIGhlaWdodCAtIGNvbmZpZ1ZhbHVlcy5wYWRkaW5nIC8gMS41KS5hdHRyKFwiZmlsbFwiLCB0aGVtZS5heGlzVGV4dENvbG9yKS5hdHRyKFwiZm9udC1zaXplXCIsIGNvbmZpZ1ZhbHVlcy5heGlzRm9udFNpemUgLSAyKS5hdHRyKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIikudGV4dChzdGFnZSk7XG4gICAgfSk7XG4gIH1cbiAgaWYgKGNvbmZpZ1ZhbHVlcy5zaG93R3JpZCkge1xuICAgIGNvbnN0IGdyaWRHcm91cCA9IHJvb3QuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJ3YXJkbGV5LWdyaWRcIik7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCA0OyBpKyspIHtcbiAgICAgIGNvbnN0IHJhdGlvID0gaSAvIDQ7XG4gICAgICBjb25zdCB4ID0gY29uZmlnVmFsdWVzLnBhZGRpbmcgKyBjaGFydFdpZHRoICogcmF0aW87XG4gICAgICBncmlkR3JvdXAuYXBwZW5kKFwibGluZVwiKS5hdHRyKFwieDFcIiwgeCkuYXR0cihcIngyXCIsIHgpLmF0dHIoXCJ5MVwiLCBjb25maWdWYWx1ZXMucGFkZGluZykuYXR0cihcInkyXCIsIGhlaWdodCAtIGNvbmZpZ1ZhbHVlcy5wYWRkaW5nKS5hdHRyKFwic3Ryb2tlXCIsIHRoZW1lLmdyaWRDb2xvcikuYXR0cihcInN0cm9rZS1kYXNoYXJyYXlcIiwgXCIyIDZcIik7XG4gICAgICBncmlkR3JvdXAuYXBwZW5kKFwibGluZVwiKS5hdHRyKFwieDFcIiwgY29uZmlnVmFsdWVzLnBhZGRpbmcpLmF0dHIoXCJ4MlwiLCB3aWR0aCAtIGNvbmZpZ1ZhbHVlcy5wYWRkaW5nKS5hdHRyKFwieTFcIiwgaGVpZ2h0IC0gY29uZmlnVmFsdWVzLnBhZGRpbmcgLSBjaGFydEhlaWdodCAqIHJhdGlvKS5hdHRyKFwieTJcIiwgaGVpZ2h0IC0gY29uZmlnVmFsdWVzLnBhZGRpbmcgLSBjaGFydEhlaWdodCAqIHJhdGlvKS5hdHRyKFwic3Ryb2tlXCIsIHRoZW1lLmdyaWRDb2xvcikuYXR0cihcInN0cm9rZS1kYXNoYXJyYXlcIiwgXCIyIDZcIik7XG4gICAgfVxuICB9XG4gIGNvbnN0IHBvc2l0aW9ucyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIGRhdGEubm9kZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgIHBvc2l0aW9ucy5zZXQobm9kZS5pZCwge1xuICAgICAgeDogcHJvamVjdFgobm9kZS54KSxcbiAgICAgIHk6IHByb2plY3RZKG5vZGUueSksXG4gICAgICBub2RlXG4gICAgfSk7XG4gIH0pO1xuICBpZiAoZGF0YS5waXBlbGluZXMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IHBpcGVsaW5lR3JvdXAgPSByb290LmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwid2FyZGxleS1waXBlbGluZXNcIik7XG4gICAgY29uc3QgcGlwZWxpbmVMaW5rc0dyb3VwID0gcm9vdC5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcIndhcmRsZXktcGlwZWxpbmUtbGlua3NcIik7XG4gICAgZGF0YS5waXBlbGluZXMuZm9yRWFjaCgocGlwZWxpbmUpID0+IHtcbiAgICAgIGlmIChwaXBlbGluZS5jb21wb25lbnRJZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNvcnRlZENvbXBvbmVudHMgPSBwaXBlbGluZS5jb21wb25lbnRJZHMubWFwKChpZDIpID0+ICh7IGlkOiBpZDIsIHBvczogcG9zaXRpb25zLmdldChpZDIpLCBub2RlOiBkYXRhLm5vZGVzLmZpbmQoKG4pID0+IG4uaWQgPT09IGlkMikgfSkpLmZpbHRlcigoYykgPT4gYy5wb3MgJiYgYy5ub2RlKS5zb3J0KChhLCBiKSA9PiBhLm5vZGUueCAtIGIubm9kZS54KTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc29ydGVkQ29tcG9uZW50cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IHNvcnRlZENvbXBvbmVudHNbaV07XG4gICAgICAgIGNvbnN0IG5leHQgPSBzb3J0ZWRDb21wb25lbnRzW2kgKyAxXTtcbiAgICAgICAgcGlwZWxpbmVMaW5rc0dyb3VwLmFwcGVuZChcImxpbmVcIikuYXR0cihcImNsYXNzXCIsIFwid2FyZGxleS1waXBlbGluZS1ldm9sdXRpb24tbGlua1wiKS5hdHRyKFwieDFcIiwgY3VycmVudC5wb3MueCkuYXR0cihcInkxXCIsIGN1cnJlbnQucG9zLnkpLmF0dHIoXCJ4MlwiLCBuZXh0LnBvcy54KS5hdHRyKFwieTJcIiwgbmV4dC5wb3MueSkuYXR0cihcInN0cm9rZVwiLCB0aGVtZS5saW5rU3Ryb2tlKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDEpLmF0dHIoXCJzdHJva2UtZGFzaGFycmF5XCIsIFwiNCA0XCIpO1xuICAgICAgfVxuICAgICAgbGV0IG1pblggPSBJbmZpbml0eTtcbiAgICAgIGxldCBtYXhYID0gLUluZmluaXR5O1xuICAgICAgbGV0IHkgPSAwO1xuICAgICAgcGlwZWxpbmUuY29tcG9uZW50SWRzLmZvckVhY2goKGNvbXBvbmVudElkKSA9PiB7XG4gICAgICAgIGNvbnN0IHBvcyA9IHBvc2l0aW9ucy5nZXQoY29tcG9uZW50SWQpO1xuICAgICAgICBpZiAocG9zKSB7XG4gICAgICAgICAgbWluWCA9IE1hdGgubWluKG1pblgsIHBvcy54KTtcbiAgICAgICAgICBtYXhYID0gTWF0aC5tYXgobWF4WCwgcG9zLngpO1xuICAgICAgICAgIHkgPSBwb3MueTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAobWluWCAhPT0gSW5maW5pdHkgJiYgbWF4WCAhPT0gLUluZmluaXR5KSB7XG4gICAgICAgIGNvbnN0IHBhZGRpbmcgPSAxNTtcbiAgICAgICAgY29uc3QgaGVpZ2h0MiA9IGNvbmZpZ1ZhbHVlcy5ub2RlUmFkaXVzICogNDtcbiAgICAgICAgY29uc3QgYm94VG9wID0geSAtIGhlaWdodDIgLyAyO1xuICAgICAgICBjb25zdCBwYXJlbnRQb3MgPSBwb3NpdGlvbnMuZ2V0KHBpcGVsaW5lLm5vZGVJZCk7XG4gICAgICAgIGlmIChwYXJlbnRQb3MpIHtcbiAgICAgICAgICBjb25zdCBjZW50ZXJYID0gKG1pblggKyBtYXhYKSAvIDI7XG4gICAgICAgICAgcGFyZW50UG9zLnggPSBjZW50ZXJYO1xuICAgICAgICAgIHBhcmVudFBvcy55ID0gYm94VG9wIC0gc3F1YXJlU2l6ZSAvIDY7XG4gICAgICAgIH1cbiAgICAgICAgcGlwZWxpbmVHcm91cC5hcHBlbmQoXCJyZWN0XCIpLmF0dHIoXCJjbGFzc1wiLCBcIndhcmRsZXktcGlwZWxpbmUtYm94XCIpLmF0dHIoXCJ4XCIsIG1pblggLSBwYWRkaW5nKS5hdHRyKFwieVwiLCBib3hUb3ApLmF0dHIoXCJ3aWR0aFwiLCBtYXhYIC0gbWluWCArIHBhZGRpbmcgKiAyKS5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodDIpLmF0dHIoXCJmaWxsXCIsIFwibm9uZVwiKS5hdHRyKFwic3Ryb2tlXCIsIHRoZW1lLmF4aXNDb2xvcikuYXR0cihcInN0cm9rZS13aWR0aFwiLCAxLjUpLmF0dHIoXCJyeFwiLCA0KS5hdHRyKFwicnlcIiwgNCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgY29uc3QgbGlua3NHcm91cCA9IHJvb3QuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJ3YXJkbGV5LWxpbmtzXCIpO1xuICBjb25zdCBwaXBlbGluZU1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIGRhdGEucGlwZWxpbmVzLmZvckVhY2goKHBpcGVsaW5lKSA9PiB7XG4gICAgcGlwZWxpbmVNYXAuc2V0KHBpcGVsaW5lLm5vZGVJZCwgbmV3IFNldChwaXBlbGluZS5jb21wb25lbnRJZHMpKTtcbiAgfSk7XG4gIGNvbnN0IHZhbGlkTGlua3MgPSBkYXRhLmxpbmtzLmZpbHRlcigobGluaykgPT4ge1xuICAgIGlmICghcG9zaXRpb25zLmhhcyhsaW5rLnNvdXJjZSkgfHwgIXBvc2l0aW9ucy5oYXMobGluay50YXJnZXQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHBpcGVsaW5lQ29tcG9uZW50cyA9IHBpcGVsaW5lTWFwLmdldChsaW5rLnRhcmdldCk7XG4gICAgaWYgKHBpcGVsaW5lQ29tcG9uZW50cz8uaGFzKGxpbmsuc291cmNlKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG4gIGxpbmtzR3JvdXAuc2VsZWN0QWxsKFwibGluZVwiKS5kYXRhKHZhbGlkTGlua3MpLmVudGVyKCkuYXBwZW5kKFwibGluZVwiKS5hdHRyKFwiY2xhc3NcIiwgKGxpbmspID0+IGB3YXJkbGV5LWxpbmske2xpbmsuZGFzaGVkID8gXCIgd2FyZGxleS1saW5rLS1kYXNoZWRcIiA6IFwiXCJ9YCkuYXR0cihcIngxXCIsIChsaW5rKSA9PiB7XG4gICAgY29uc3Qgc291cmNlUG9zID0gcG9zaXRpb25zLmdldChsaW5rLnNvdXJjZSk7XG4gICAgY29uc3QgdGFyZ2V0UG9zID0gcG9zaXRpb25zLmdldChsaW5rLnRhcmdldCk7XG4gICAgY29uc3Qgc291cmNlTm9kZSA9IGRhdGEubm9kZXMuZmluZCgobikgPT4gbi5pZCA9PT0gbGluay5zb3VyY2UpO1xuICAgIGNvbnN0IHJhZGl1cyA9IHNvdXJjZU5vZGUuaXNQaXBlbGluZVBhcmVudCA/IHNxdWFyZVNpemUgLyBNYXRoLnNxcnQoMikgOiBjb25maWdWYWx1ZXMubm9kZVJhZGl1cztcbiAgICBjb25zdCBkeCA9IHRhcmdldFBvcy54IC0gc291cmNlUG9zLng7XG4gICAgY29uc3QgZHkgPSB0YXJnZXRQb3MueSAtIHNvdXJjZVBvcy55O1xuICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgICByZXR1cm4gc291cmNlUG9zLnggKyBkeCAvIGRpc3RhbmNlICogcmFkaXVzO1xuICB9KS5hdHRyKFwieTFcIiwgKGxpbmspID0+IHtcbiAgICBjb25zdCBzb3VyY2VQb3MgPSBwb3NpdGlvbnMuZ2V0KGxpbmsuc291cmNlKTtcbiAgICBjb25zdCB0YXJnZXRQb3MgPSBwb3NpdGlvbnMuZ2V0KGxpbmsudGFyZ2V0KTtcbiAgICBjb25zdCBzb3VyY2VOb2RlID0gZGF0YS5ub2Rlcy5maW5kKChuKSA9PiBuLmlkID09PSBsaW5rLnNvdXJjZSk7XG4gICAgY29uc3QgcmFkaXVzID0gc291cmNlTm9kZS5pc1BpcGVsaW5lUGFyZW50ID8gc3F1YXJlU2l6ZSAvIE1hdGguc3FydCgyKSA6IGNvbmZpZ1ZhbHVlcy5ub2RlUmFkaXVzO1xuICAgIGNvbnN0IGR4ID0gdGFyZ2V0UG9zLnggLSBzb3VyY2VQb3MueDtcbiAgICBjb25zdCBkeSA9IHRhcmdldFBvcy55IC0gc291cmNlUG9zLnk7XG4gICAgY29uc3QgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgIHJldHVybiBzb3VyY2VQb3MueSArIGR5IC8gZGlzdGFuY2UgKiByYWRpdXM7XG4gIH0pLmF0dHIoXCJ4MlwiLCAobGluaykgPT4ge1xuICAgIGNvbnN0IHNvdXJjZVBvcyA9IHBvc2l0aW9ucy5nZXQobGluay5zb3VyY2UpO1xuICAgIGNvbnN0IHRhcmdldFBvcyA9IHBvc2l0aW9ucy5nZXQobGluay50YXJnZXQpO1xuICAgIGNvbnN0IHRhcmdldE5vZGUgPSBkYXRhLm5vZGVzLmZpbmQoKG4pID0+IG4uaWQgPT09IGxpbmsudGFyZ2V0KTtcbiAgICBjb25zdCByYWRpdXMgPSB0YXJnZXROb2RlLmlzUGlwZWxpbmVQYXJlbnQgPyBzcXVhcmVTaXplIC8gTWF0aC5zcXJ0KDIpIDogY29uZmlnVmFsdWVzLm5vZGVSYWRpdXM7XG4gICAgY29uc3QgZHggPSBzb3VyY2VQb3MueCAtIHRhcmdldFBvcy54O1xuICAgIGNvbnN0IGR5ID0gc291cmNlUG9zLnkgLSB0YXJnZXRQb3MueTtcbiAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgcmV0dXJuIHRhcmdldFBvcy54ICsgZHggLyBkaXN0YW5jZSAqIHJhZGl1cztcbiAgfSkuYXR0cihcInkyXCIsIChsaW5rKSA9PiB7XG4gICAgY29uc3Qgc291cmNlUG9zID0gcG9zaXRpb25zLmdldChsaW5rLnNvdXJjZSk7XG4gICAgY29uc3QgdGFyZ2V0UG9zID0gcG9zaXRpb25zLmdldChsaW5rLnRhcmdldCk7XG4gICAgY29uc3QgdGFyZ2V0Tm9kZSA9IGRhdGEubm9kZXMuZmluZCgobikgPT4gbi5pZCA9PT0gbGluay50YXJnZXQpO1xuICAgIGNvbnN0IHJhZGl1cyA9IHRhcmdldE5vZGUuaXNQaXBlbGluZVBhcmVudCA/IHNxdWFyZVNpemUgLyBNYXRoLnNxcnQoMikgOiBjb25maWdWYWx1ZXMubm9kZVJhZGl1cztcbiAgICBjb25zdCBkeCA9IHNvdXJjZVBvcy54IC0gdGFyZ2V0UG9zLng7XG4gICAgY29uc3QgZHkgPSBzb3VyY2VQb3MueSAtIHRhcmdldFBvcy55O1xuICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgICByZXR1cm4gdGFyZ2V0UG9zLnkgKyBkeSAvIGRpc3RhbmNlICogcmFkaXVzO1xuICB9KS5hdHRyKFwic3Ryb2tlXCIsIHRoZW1lLmxpbmtTdHJva2UpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMSkuYXR0cihcInN0cm9rZS1kYXNoYXJyYXlcIiwgKGxpbmspID0+IGxpbmsuZGFzaGVkID8gXCI2IDZcIiA6IG51bGwpLmF0dHIoXCJtYXJrZXItZW5kXCIsIChsaW5rKSA9PiB7XG4gICAgaWYgKGxpbmsuZmxvdyA9PT0gXCJmb3J3YXJkXCIgfHwgbGluay5mbG93ID09PSBcImJpZGlyZWN0aW9uYWxcIikge1xuICAgICAgcmV0dXJuIGB1cmwoI2xpbmstYXJyb3ctZW5kLSR7aWR9KWA7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9KS5hdHRyKFwibWFya2VyLXN0YXJ0XCIsIChsaW5rKSA9PiB7XG4gICAgaWYgKGxpbmsuZmxvdyA9PT0gXCJiYWNrd2FyZFwiIHx8IGxpbmsuZmxvdyA9PT0gXCJiaWRpcmVjdGlvbmFsXCIpIHtcbiAgICAgIHJldHVybiBgdXJsKCNsaW5rLWFycm93LXN0YXJ0LSR7aWR9KWA7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9KTtcbiAgbGlua3NHcm91cC5zZWxlY3RBbGwoXCJ0ZXh0XCIpLmRhdGEodmFsaWRMaW5rcy5maWx0ZXIoKGxpbmspID0+IGxpbmsubGFiZWwpKS5lbnRlcigpLmFwcGVuZChcInRleHRcIikuYXR0cihcImNsYXNzXCIsIFwid2FyZGxleS1saW5rLWxhYmVsXCIpLmF0dHIoXCJ4XCIsIChsaW5rKSA9PiB7XG4gICAgY29uc3Qgc291cmNlUG9zID0gcG9zaXRpb25zLmdldChsaW5rLnNvdXJjZSk7XG4gICAgY29uc3QgdGFyZ2V0UG9zID0gcG9zaXRpb25zLmdldChsaW5rLnRhcmdldCk7XG4gICAgY29uc3QgbWlkWCA9IChzb3VyY2VQb3MueCArIHRhcmdldFBvcy54KSAvIDI7XG4gICAgY29uc3QgZHkgPSB0YXJnZXRQb3MueSAtIHNvdXJjZVBvcy55O1xuICAgIGNvbnN0IGR4ID0gdGFyZ2V0UG9zLnggLSBzb3VyY2VQb3MueDtcbiAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgY29uc3Qgb2Zmc2V0ID0gODtcbiAgICBjb25zdCBwZXJwWCA9IGR5IC8gZGlzdGFuY2U7XG4gICAgcmV0dXJuIG1pZFggKyBwZXJwWCAqIG9mZnNldDtcbiAgfSkuYXR0cihcInlcIiwgKGxpbmspID0+IHtcbiAgICBjb25zdCBzb3VyY2VQb3MgPSBwb3NpdGlvbnMuZ2V0KGxpbmsuc291cmNlKTtcbiAgICBjb25zdCB0YXJnZXRQb3MgPSBwb3NpdGlvbnMuZ2V0KGxpbmsudGFyZ2V0KTtcbiAgICBjb25zdCBtaWRZID0gKHNvdXJjZVBvcy55ICsgdGFyZ2V0UG9zLnkpIC8gMjtcbiAgICBjb25zdCBkeCA9IHRhcmdldFBvcy54IC0gc291cmNlUG9zLng7XG4gICAgY29uc3QgZHkgPSB0YXJnZXRQb3MueSAtIHNvdXJjZVBvcy55O1xuICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgICBjb25zdCBvZmZzZXQgPSA4O1xuICAgIGNvbnN0IHBlcnBZID0gLWR4IC8gZGlzdGFuY2U7XG4gICAgcmV0dXJuIG1pZFkgKyBwZXJwWSAqIG9mZnNldDtcbiAgfSkuYXR0cihcImZpbGxcIiwgdGhlbWUuYXhpc1RleHRDb2xvcikuYXR0cihcImZvbnQtc2l6ZVwiLCBjb25maWdWYWx1ZXMubGFiZWxGb250U2l6ZSkuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpLmF0dHIoXCJkb21pbmFudC1iYXNlbGluZVwiLCBcIm1pZGRsZVwiKS5hdHRyKFwidHJhbnNmb3JtXCIsIChsaW5rKSA9PiB7XG4gICAgY29uc3Qgc291cmNlUG9zID0gcG9zaXRpb25zLmdldChsaW5rLnNvdXJjZSk7XG4gICAgY29uc3QgdGFyZ2V0UG9zID0gcG9zaXRpb25zLmdldChsaW5rLnRhcmdldCk7XG4gICAgY29uc3QgbWlkWCA9IChzb3VyY2VQb3MueCArIHRhcmdldFBvcy54KSAvIDI7XG4gICAgY29uc3QgbWlkWSA9IChzb3VyY2VQb3MueSArIHRhcmdldFBvcy55KSAvIDI7XG4gICAgY29uc3QgZHggPSB0YXJnZXRQb3MueCAtIHNvdXJjZVBvcy54O1xuICAgIGNvbnN0IGR5ID0gdGFyZ2V0UG9zLnkgLSBzb3VyY2VQb3MueTtcbiAgICBjb25zdCBkaXN0YW5jZSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgY29uc3Qgb2Zmc2V0ID0gODtcbiAgICBjb25zdCBwZXJwWCA9IGR5IC8gZGlzdGFuY2U7XG4gICAgY29uc3QgcGVycFkgPSAtZHggLyBkaXN0YW5jZTtcbiAgICBjb25zdCBsYWJlbFggPSBtaWRYICsgcGVycFggKiBvZmZzZXQ7XG4gICAgY29uc3QgbGFiZWxZID0gbWlkWSArIHBlcnBZICogb2Zmc2V0O1xuICAgIGxldCBhbmdsZSA9IE1hdGguYXRhbjIoZHksIGR4KSAqIDE4MCAvIE1hdGguUEk7XG4gICAgaWYgKGFuZ2xlID4gOTAgfHwgYW5nbGUgPCAtOTApIHtcbiAgICAgIGFuZ2xlICs9IDE4MDtcbiAgICB9XG4gICAgcmV0dXJuIGByb3RhdGUoJHthbmdsZX0gJHtsYWJlbFh9ICR7bGFiZWxZfSlgO1xuICB9KS50ZXh0KChsaW5rKSA9PiBsaW5rLmxhYmVsKTtcbiAgY29uc3QgdHJlbmRHcm91cCA9IHJvb3QuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJ3YXJkbGV5LXRyZW5kc1wiKTtcbiAgY29uc3QgdHJlbmRzV2l0aFBvc2l0aW9ucyA9IGRhdGEudHJlbmRzLm1hcCgodHJlbmQpID0+IHtcbiAgICBjb25zdCBvcmlnaW4gPSBwb3NpdGlvbnMuZ2V0KHRyZW5kLm5vZGVJZCk7XG4gICAgaWYgKCFvcmlnaW4pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB0YXJnZXRYID0gcHJvamVjdFgodHJlbmQudGFyZ2V0WCk7XG4gICAgY29uc3QgdGFyZ2V0WSA9IHByb2plY3RZKHRyZW5kLnRhcmdldFkpO1xuICAgIGNvbnN0IGR4ID0gdGFyZ2V0WCAtIG9yaWdpbi54O1xuICAgIGNvbnN0IGR5ID0gdGFyZ2V0WSAtIG9yaWdpbi55O1xuICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgICBjb25zdCBzaG9ydGVuQnkgPSBjb25maWdWYWx1ZXMubm9kZVJhZGl1cyArIDI7XG4gICAgY29uc3QgYWRqdXN0ZWRYMiA9IGRpc3RhbmNlID4gc2hvcnRlbkJ5ID8gdGFyZ2V0WCAtIGR4IC8gZGlzdGFuY2UgKiBzaG9ydGVuQnkgOiB0YXJnZXRYO1xuICAgIGNvbnN0IGFkanVzdGVkWTIgPSBkaXN0YW5jZSA+IHNob3J0ZW5CeSA/IHRhcmdldFkgLSBkeSAvIGRpc3RhbmNlICogc2hvcnRlbkJ5IDogdGFyZ2V0WTtcbiAgICByZXR1cm4ge1xuICAgICAgb3JpZ2luLFxuICAgICAgdGFyZ2V0WCxcbiAgICAgIHRhcmdldFksXG4gICAgICBhZGp1c3RlZFgyLFxuICAgICAgYWRqdXN0ZWRZMlxuICAgIH07XG4gIH0pLmZpbHRlcigodHJlbmQpID0+IHRyZW5kICE9PSBudWxsKTtcbiAgdHJlbmRHcm91cC5zZWxlY3RBbGwoXCJsaW5lXCIpLmRhdGEodHJlbmRzV2l0aFBvc2l0aW9ucykuZW50ZXIoKS5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJjbGFzc1wiLCBcIndhcmRsZXktdHJlbmRcIikuYXR0cihcIngxXCIsICh0cmVuZCkgPT4gdHJlbmQub3JpZ2luLngpLmF0dHIoXCJ5MVwiLCAodHJlbmQpID0+IHRyZW5kLm9yaWdpbi55KS5hdHRyKFwieDJcIiwgKHRyZW5kKSA9PiB0cmVuZC5hZGp1c3RlZFgyKS5hdHRyKFwieTJcIiwgKHRyZW5kKSA9PiB0cmVuZC5hZGp1c3RlZFkyKS5hdHRyKFwic3Ryb2tlXCIsIHRoZW1lLmV2b2x1dGlvblN0cm9rZSkuYXR0cihcInN0cm9rZS13aWR0aFwiLCAxKS5hdHRyKFwic3Ryb2tlLWRhc2hhcnJheVwiLCBcIjQgNFwiKS5hdHRyKFwibWFya2VyLWVuZFwiLCBgdXJsKCNhcnJvdy0ke2lkfSlgKTtcbiAgY29uc3Qgbm9kZXNHcm91cCA9IHJvb3QuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJ3YXJkbGV5LW5vZGVzXCIpO1xuICBjb25zdCBub2RlRW50ZXIgPSBub2Rlc0dyb3VwLnNlbGVjdEFsbChcImdcIikuZGF0YShkYXRhLm5vZGVzKS5lbnRlcigpLmFwcGVuZChcImdcIikuYXR0cihcbiAgICBcImNsYXNzXCIsXG4gICAgKG5vZGUpID0+IFtcIndhcmRsZXktbm9kZVwiLCBub2RlLmNsYXNzTmFtZSA/IGB3YXJkbGV5LW5vZGUtLSR7bm9kZS5jbGFzc05hbWV9YCA6IFwiXCJdLmZpbHRlcihCb29sZWFuKS5qb2luKFwiIFwiKVxuICApO1xuICBub2RlRW50ZXIuZmlsdGVyKChub2RlKSA9PiBub2RlLnNvdXJjZVN0cmF0ZWd5ID09PSBcIm91dHNvdXJjZVwiKS5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImNsYXNzXCIsIFwid2FyZGxleS1vdXRzb3VyY2Utb3ZlcmxheVwiKS5hdHRyKFwiY3hcIiwgKG5vZGUpID0+IHBvc2l0aW9ucy5nZXQobm9kZS5pZCkueCkuYXR0cihcImN5XCIsIChub2RlKSA9PiBwb3NpdGlvbnMuZ2V0KG5vZGUuaWQpLnkpLmF0dHIoXCJyXCIsIGNvbmZpZ1ZhbHVlcy5ub2RlUmFkaXVzICogMikuYXR0cihcImZpbGxcIiwgXCIjNjY2XCIpLmF0dHIoXCJzdHJva2VcIiwgdGhlbWUuY29tcG9uZW50U3Ryb2tlKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDEpO1xuICBub2RlRW50ZXIuZmlsdGVyKChub2RlKSA9PiBub2RlLnNvdXJjZVN0cmF0ZWd5ID09PSBcImJ1eVwiKS5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImNsYXNzXCIsIFwid2FyZGxleS1idXktb3ZlcmxheVwiKS5hdHRyKFwiY3hcIiwgKG5vZGUpID0+IHBvc2l0aW9ucy5nZXQobm9kZS5pZCkueCkuYXR0cihcImN5XCIsIChub2RlKSA9PiBwb3NpdGlvbnMuZ2V0KG5vZGUuaWQpLnkpLmF0dHIoXCJyXCIsIGNvbmZpZ1ZhbHVlcy5ub2RlUmFkaXVzICogMikuYXR0cihcImZpbGxcIiwgXCIjY2NjXCIpLmF0dHIoXCJzdHJva2VcIiwgdGhlbWUuY29tcG9uZW50U3Ryb2tlKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDEpO1xuICBub2RlRW50ZXIuZmlsdGVyKChub2RlKSA9PiBub2RlLnNvdXJjZVN0cmF0ZWd5ID09PSBcImJ1aWxkXCIpLmFwcGVuZChcImNpcmNsZVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJ3YXJkbGV5LWJ1aWxkLW92ZXJsYXlcIikuYXR0cihcImN4XCIsIChub2RlKSA9PiBwb3NpdGlvbnMuZ2V0KG5vZGUuaWQpLngpLmF0dHIoXCJjeVwiLCAobm9kZSkgPT4gcG9zaXRpb25zLmdldChub2RlLmlkKS55KS5hdHRyKFwiclwiLCBjb25maWdWYWx1ZXMubm9kZVJhZGl1cyAqIDIpLmF0dHIoXCJmaWxsXCIsIFwiI2VlZVwiKS5hdHRyKFwic3Ryb2tlXCIsIFwiIzAwMFwiKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDEpO1xuICBjb25zdCBtYXJrZXROb2RlcyA9IG5vZGVFbnRlci5maWx0ZXIoKG5vZGUpID0+IG5vZGUuc291cmNlU3RyYXRlZ3kgPT09IFwibWFya2V0XCIpO1xuICBtYXJrZXROb2Rlcy5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImNsYXNzXCIsIFwid2FyZGxleS1tYXJrZXQtb3ZlcmxheVwiKS5hdHRyKFwiY3hcIiwgKG5vZGUpID0+IHBvc2l0aW9ucy5nZXQobm9kZS5pZCkueCkuYXR0cihcImN5XCIsIChub2RlKSA9PiBwb3NpdGlvbnMuZ2V0KG5vZGUuaWQpLnkpLmF0dHIoXCJyXCIsIGNvbmZpZ1ZhbHVlcy5ub2RlUmFkaXVzICogMikuYXR0cihcImZpbGxcIiwgXCJ3aGl0ZVwiKS5hdHRyKFwic3Ryb2tlXCIsIHRoZW1lLmNvbXBvbmVudFN0cm9rZSkuYXR0cihcInN0cm9rZS13aWR0aFwiLCAxKTtcbiAgbm9kZUVudGVyLmZpbHRlcihcbiAgICAobm9kZSkgPT4gIW5vZGUuaXNQaXBlbGluZVBhcmVudCAmJiBub2RlLnNvdXJjZVN0cmF0ZWd5ICE9PSBcIm1hcmtldFwiICYmIG5vZGUuY2xhc3NOYW1lICE9PSBcImFuY2hvclwiXG4gICkuYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJjeFwiLCAobm9kZSkgPT4gcG9zaXRpb25zLmdldChub2RlLmlkKS54KS5hdHRyKFwiY3lcIiwgKG5vZGUpID0+IHBvc2l0aW9ucy5nZXQobm9kZS5pZCkueSkuYXR0cihcInJcIiwgY29uZmlnVmFsdWVzLm5vZGVSYWRpdXMpLmF0dHIoXCJmaWxsXCIsIHRoZW1lLmNvbXBvbmVudEZpbGwpLmF0dHIoXCJzdHJva2VcIiwgdGhlbWUuY29tcG9uZW50U3Ryb2tlKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDEpO1xuICBjb25zdCBzbWFsbENpcmNsZVJhZGl1cyA9IGNvbmZpZ1ZhbHVlcy5ub2RlUmFkaXVzICogMC43O1xuICBjb25zdCB0cmlhbmdsZVJhZGl1cyA9IGNvbmZpZ1ZhbHVlcy5ub2RlUmFkaXVzICogMS4yO1xuICBtYXJrZXROb2Rlcy5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJjbGFzc1wiLCBcIndhcmRsZXktbWFya2V0LWxpbmVcIikuYXR0cihcIngxXCIsIChub2RlKSA9PiBwb3NpdGlvbnMuZ2V0KG5vZGUuaWQpLngpLmF0dHIoXCJ5MVwiLCAobm9kZSkgPT4gcG9zaXRpb25zLmdldChub2RlLmlkKS55IC0gdHJpYW5nbGVSYWRpdXMpLmF0dHIoXCJ4MlwiLCAobm9kZSkgPT4gcG9zaXRpb25zLmdldChub2RlLmlkKS54IC0gdHJpYW5nbGVSYWRpdXMgKiBNYXRoLmNvcyhNYXRoLlBJIC8gNikpLmF0dHIoXCJ5MlwiLCAobm9kZSkgPT4gcG9zaXRpb25zLmdldChub2RlLmlkKS55ICsgdHJpYW5nbGVSYWRpdXMgKiBNYXRoLnNpbihNYXRoLlBJIC8gNikpLmF0dHIoXCJzdHJva2VcIiwgdGhlbWUuY29tcG9uZW50U3Ryb2tlKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDEpO1xuICBtYXJrZXROb2Rlcy5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJjbGFzc1wiLCBcIndhcmRsZXktbWFya2V0LWxpbmVcIikuYXR0cihcIngxXCIsIChub2RlKSA9PiBwb3NpdGlvbnMuZ2V0KG5vZGUuaWQpLnggLSB0cmlhbmdsZVJhZGl1cyAqIE1hdGguY29zKE1hdGguUEkgLyA2KSkuYXR0cihcInkxXCIsIChub2RlKSA9PiBwb3NpdGlvbnMuZ2V0KG5vZGUuaWQpLnkgKyB0cmlhbmdsZVJhZGl1cyAqIE1hdGguc2luKE1hdGguUEkgLyA2KSkuYXR0cihcIngyXCIsIChub2RlKSA9PiBwb3NpdGlvbnMuZ2V0KG5vZGUuaWQpLnggKyB0cmlhbmdsZVJhZGl1cyAqIE1hdGguY29zKE1hdGguUEkgLyA2KSkuYXR0cihcInkyXCIsIChub2RlKSA9PiBwb3NpdGlvbnMuZ2V0KG5vZGUuaWQpLnkgKyB0cmlhbmdsZVJhZGl1cyAqIE1hdGguc2luKE1hdGguUEkgLyA2KSkuYXR0cihcInN0cm9rZVwiLCB0aGVtZS5jb21wb25lbnRTdHJva2UpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMSk7XG4gIG1hcmtldE5vZGVzLmFwcGVuZChcImxpbmVcIikuYXR0cihcImNsYXNzXCIsIFwid2FyZGxleS1tYXJrZXQtbGluZVwiKS5hdHRyKFwieDFcIiwgKG5vZGUpID0+IHBvc2l0aW9ucy5nZXQobm9kZS5pZCkueCArIHRyaWFuZ2xlUmFkaXVzICogTWF0aC5jb3MoTWF0aC5QSSAvIDYpKS5hdHRyKFwieTFcIiwgKG5vZGUpID0+IHBvc2l0aW9ucy5nZXQobm9kZS5pZCkueSArIHRyaWFuZ2xlUmFkaXVzICogTWF0aC5zaW4oTWF0aC5QSSAvIDYpKS5hdHRyKFwieDJcIiwgKG5vZGUpID0+IHBvc2l0aW9ucy5nZXQobm9kZS5pZCkueCkuYXR0cihcInkyXCIsIChub2RlKSA9PiBwb3NpdGlvbnMuZ2V0KG5vZGUuaWQpLnkgLSB0cmlhbmdsZVJhZGl1cykuYXR0cihcInN0cm9rZVwiLCB0aGVtZS5jb21wb25lbnRTdHJva2UpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMSk7XG4gIG1hcmtldE5vZGVzLmFwcGVuZChcImNpcmNsZVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJ3YXJkbGV5LW1hcmtldC1kb3RcIikuYXR0cihcImN4XCIsIChub2RlKSA9PiBwb3NpdGlvbnMuZ2V0KG5vZGUuaWQpLngpLmF0dHIoXCJjeVwiLCAobm9kZSkgPT4gcG9zaXRpb25zLmdldChub2RlLmlkKS55IC0gdHJpYW5nbGVSYWRpdXMpLmF0dHIoXCJyXCIsIHNtYWxsQ2lyY2xlUmFkaXVzKS5hdHRyKFwiZmlsbFwiLCBcIndoaXRlXCIpLmF0dHIoXCJzdHJva2VcIiwgdGhlbWUuY29tcG9uZW50U3Ryb2tlKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDIpO1xuICBtYXJrZXROb2Rlcy5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImNsYXNzXCIsIFwid2FyZGxleS1tYXJrZXQtZG90XCIpLmF0dHIoXCJjeFwiLCAobm9kZSkgPT4gcG9zaXRpb25zLmdldChub2RlLmlkKS54IC0gdHJpYW5nbGVSYWRpdXMgKiBNYXRoLmNvcyhNYXRoLlBJIC8gNikpLmF0dHIoXCJjeVwiLCAobm9kZSkgPT4gcG9zaXRpb25zLmdldChub2RlLmlkKS55ICsgdHJpYW5nbGVSYWRpdXMgKiBNYXRoLnNpbihNYXRoLlBJIC8gNikpLmF0dHIoXCJyXCIsIHNtYWxsQ2lyY2xlUmFkaXVzKS5hdHRyKFwiZmlsbFwiLCBcIndoaXRlXCIpLmF0dHIoXCJzdHJva2VcIiwgdGhlbWUuY29tcG9uZW50U3Ryb2tlKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDIpO1xuICBtYXJrZXROb2Rlcy5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImNsYXNzXCIsIFwid2FyZGxleS1tYXJrZXQtZG90XCIpLmF0dHIoXCJjeFwiLCAobm9kZSkgPT4gcG9zaXRpb25zLmdldChub2RlLmlkKS54ICsgdHJpYW5nbGVSYWRpdXMgKiBNYXRoLmNvcyhNYXRoLlBJIC8gNikpLmF0dHIoXCJjeVwiLCAobm9kZSkgPT4gcG9zaXRpb25zLmdldChub2RlLmlkKS55ICsgdHJpYW5nbGVSYWRpdXMgKiBNYXRoLnNpbihNYXRoLlBJIC8gNikpLmF0dHIoXCJyXCIsIHNtYWxsQ2lyY2xlUmFkaXVzKS5hdHRyKFwiZmlsbFwiLCBcIndoaXRlXCIpLmF0dHIoXCJzdHJva2VcIiwgdGhlbWUuY29tcG9uZW50U3Ryb2tlKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDIpO1xuICBub2RlRW50ZXIuZmlsdGVyKChub2RlKSA9PiBub2RlLmlzUGlwZWxpbmVQYXJlbnQgPT09IHRydWUpLmFwcGVuZChcInJlY3RcIikuYXR0cihcInhcIiwgKG5vZGUpID0+IHBvc2l0aW9ucy5nZXQobm9kZS5pZCkueCAtIHNxdWFyZVNpemUgLyAyKS5hdHRyKFwieVwiLCAobm9kZSkgPT4gcG9zaXRpb25zLmdldChub2RlLmlkKS55IC0gc3F1YXJlU2l6ZSAvIDIpLmF0dHIoXCJ3aWR0aFwiLCBzcXVhcmVTaXplKS5hdHRyKFwiaGVpZ2h0XCIsIHNxdWFyZVNpemUpLmF0dHIoXCJmaWxsXCIsIHRoZW1lLmNvbXBvbmVudEZpbGwpLmF0dHIoXCJzdHJva2VcIiwgdGhlbWUuY29tcG9uZW50U3Ryb2tlKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDEpO1xuICBub2RlRW50ZXIuZmlsdGVyKChub2RlKSA9PiBub2RlLmluZXJ0aWEgPT09IHRydWUpLmFwcGVuZChcImxpbmVcIikuYXR0cihcImNsYXNzXCIsIFwid2FyZGxleS1pbmVydGlhXCIpLmF0dHIoXCJ4MVwiLCAobm9kZSkgPT4ge1xuICAgIGNvbnN0IHBvcyA9IHBvc2l0aW9ucy5nZXQobm9kZS5pZCk7XG4gICAgbGV0IG9mZnNldCA9IG5vZGUuaXNQaXBlbGluZVBhcmVudCA/IHNxdWFyZVNpemUgLyAyICsgMTUgOiBjb25maWdWYWx1ZXMubm9kZVJhZGl1cyArIDE1O1xuICAgIGlmIChub2RlLnNvdXJjZVN0cmF0ZWd5KSB7XG4gICAgICBvZmZzZXQgKz0gY29uZmlnVmFsdWVzLm5vZGVSYWRpdXMgKyAxMDtcbiAgICB9XG4gICAgcmV0dXJuIHBvcy54ICsgb2Zmc2V0O1xuICB9KS5hdHRyKFwieTFcIiwgKG5vZGUpID0+IHtcbiAgICBjb25zdCBwb3MgPSBwb3NpdGlvbnMuZ2V0KG5vZGUuaWQpO1xuICAgIGNvbnN0IGxpbmVIZWlnaHQgPSBub2RlLmlzUGlwZWxpbmVQYXJlbnQgPyBzcXVhcmVTaXplIDogY29uZmlnVmFsdWVzLm5vZGVSYWRpdXMgKiAyO1xuICAgIHJldHVybiBwb3MueSAtIGxpbmVIZWlnaHQgLyAyO1xuICB9KS5hdHRyKFwieDJcIiwgKG5vZGUpID0+IHtcbiAgICBjb25zdCBwb3MgPSBwb3NpdGlvbnMuZ2V0KG5vZGUuaWQpO1xuICAgIGxldCBvZmZzZXQgPSBub2RlLmlzUGlwZWxpbmVQYXJlbnQgPyBzcXVhcmVTaXplIC8gMiArIDE1IDogY29uZmlnVmFsdWVzLm5vZGVSYWRpdXMgKyAxNTtcbiAgICBpZiAobm9kZS5zb3VyY2VTdHJhdGVneSkge1xuICAgICAgb2Zmc2V0ICs9IGNvbmZpZ1ZhbHVlcy5ub2RlUmFkaXVzICsgMTA7XG4gICAgfVxuICAgIHJldHVybiBwb3MueCArIG9mZnNldDtcbiAgfSkuYXR0cihcInkyXCIsIChub2RlKSA9PiB7XG4gICAgY29uc3QgcG9zID0gcG9zaXRpb25zLmdldChub2RlLmlkKTtcbiAgICBjb25zdCBsaW5lSGVpZ2h0ID0gbm9kZS5pc1BpcGVsaW5lUGFyZW50ID8gc3F1YXJlU2l6ZSA6IGNvbmZpZ1ZhbHVlcy5ub2RlUmFkaXVzICogMjtcbiAgICByZXR1cm4gcG9zLnkgKyBsaW5lSGVpZ2h0IC8gMjtcbiAgfSkuYXR0cihcInN0cm9rZVwiLCB0aGVtZS5jb21wb25lbnRTdHJva2UpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgNik7XG4gIG5vZGVFbnRlci5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJ4XCIsIChub2RlKSA9PiB7XG4gICAgY29uc3QgcG9zID0gcG9zaXRpb25zLmdldChub2RlLmlkKTtcbiAgICBpZiAobm9kZS5jbGFzc05hbWUgPT09IFwiYW5jaG9yXCIpIHtcbiAgICAgIHJldHVybiBub2RlLmxhYmVsT2Zmc2V0WCAhPT0gdm9pZCAwID8gcG9zLnggKyBub2RlLmxhYmVsT2Zmc2V0WCA6IHBvcy54O1xuICAgIH1cbiAgICBsZXQgZGVmYXVsdE9mZnNldCA9IGNvbmZpZ1ZhbHVlcy5ub2RlTGFiZWxPZmZzZXQ7XG4gICAgaWYgKG5vZGUuc291cmNlU3RyYXRlZ3kgJiYgbm9kZS5sYWJlbE9mZnNldFggPT09IHZvaWQgMCkge1xuICAgICAgZGVmYXVsdE9mZnNldCArPSAxMDtcbiAgICB9XG4gICAgY29uc3QgY3VzdG9tT2Zmc2V0ID0gbm9kZS5sYWJlbE9mZnNldFggPz8gZGVmYXVsdE9mZnNldDtcbiAgICByZXR1cm4gcG9zLnggKyBjdXN0b21PZmZzZXQ7XG4gIH0pLmF0dHIoXCJ5XCIsIChub2RlKSA9PiB7XG4gICAgY29uc3QgcG9zID0gcG9zaXRpb25zLmdldChub2RlLmlkKTtcbiAgICBpZiAobm9kZS5jbGFzc05hbWUgPT09IFwiYW5jaG9yXCIpIHtcbiAgICAgIHJldHVybiBub2RlLmxhYmVsT2Zmc2V0WSAhPT0gdm9pZCAwID8gcG9zLnkgKyBub2RlLmxhYmVsT2Zmc2V0WSA6IHBvcy55IC0gMztcbiAgICB9XG4gICAgbGV0IGRlZmF1bHRPZmZzZXQgPSAtY29uZmlnVmFsdWVzLm5vZGVMYWJlbE9mZnNldDtcbiAgICBpZiAobm9kZS5zb3VyY2VTdHJhdGVneSAmJiBub2RlLmxhYmVsT2Zmc2V0WSA9PT0gdm9pZCAwKSB7XG4gICAgICBkZWZhdWx0T2Zmc2V0IC09IDEwO1xuICAgIH1cbiAgICBjb25zdCBjdXN0b21PZmZzZXQgPSBub2RlLmxhYmVsT2Zmc2V0WSA/PyBkZWZhdWx0T2Zmc2V0O1xuICAgIHJldHVybiBwb3MueSArIGN1c3RvbU9mZnNldDtcbiAgfSkuYXR0cihcImNsYXNzXCIsIFwid2FyZGxleS1ub2RlLWxhYmVsXCIpLmF0dHIoXCJmaWxsXCIsIChub2RlKSA9PiB7XG4gICAgaWYgKG5vZGUuY2xhc3NOYW1lID09PSBcImV2b2x2ZWRcIikge1xuICAgICAgcmV0dXJuIHRoZW1lLmV2b2x1dGlvblN0cm9rZTtcbiAgICB9XG4gICAgaWYgKG5vZGUuY2xhc3NOYW1lID09PSBcImFuY2hvclwiKSB7XG4gICAgICByZXR1cm4gXCIjMDAwXCI7XG4gICAgfVxuICAgIHJldHVybiB0aGVtZS5jb21wb25lbnRMYWJlbENvbG9yO1xuICB9KS5hdHRyKFwiZm9udC1zaXplXCIsIGNvbmZpZ1ZhbHVlcy5sYWJlbEZvbnRTaXplKS5hdHRyKFwiZm9udC13ZWlnaHRcIiwgKG5vZGUpID0+IG5vZGUuY2xhc3NOYW1lID09PSBcImFuY2hvclwiID8gXCJib2xkXCIgOiBcIm5vcm1hbFwiKS5hdHRyKFwidGV4dC1hbmNob3JcIiwgKG5vZGUpID0+IG5vZGUuY2xhc3NOYW1lID09PSBcImFuY2hvclwiID8gXCJtaWRkbGVcIiA6IFwic3RhcnRcIikuYXR0cihcImRvbWluYW50LWJhc2VsaW5lXCIsIChub2RlKSA9PiBub2RlLmNsYXNzTmFtZSA9PT0gXCJhbmNob3JcIiA/IFwibWlkZGxlXCIgOiBcImF1dG9cIikudGV4dCgobm9kZSkgPT4gbm9kZS5sYWJlbCk7XG4gIGlmIChkYXRhLmFubm90YXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBhbm5vdGF0aW9uc0dyb3VwID0gcm9vdC5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcIndhcmRsZXktYW5ub3RhdGlvbnNcIik7XG4gICAgZGF0YS5hbm5vdGF0aW9ucy5mb3JFYWNoKChhbm5vdGF0aW9uKSA9PiB7XG4gICAgICBjb25zdCBwcm9qZWN0ZWRDb29yZHMgPSBhbm5vdGF0aW9uLmNvb3JkaW5hdGVzLm1hcCgoY29vcmQpID0+ICh7XG4gICAgICAgIHg6IHByb2plY3RYKGNvb3JkLngpLFxuICAgICAgICB5OiBwcm9qZWN0WShjb29yZC55KVxuICAgICAgfSkpO1xuICAgICAgaWYgKHByb2plY3RlZENvb3Jkcy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvamVjdGVkQ29vcmRzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgIGFubm90YXRpb25zR3JvdXAuYXBwZW5kKFwibGluZVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJ3YXJkbGV5LWFubm90YXRpb24tbGluZVwiKS5hdHRyKFwieDFcIiwgcHJvamVjdGVkQ29vcmRzW2ldLngpLmF0dHIoXCJ5MVwiLCBwcm9qZWN0ZWRDb29yZHNbaV0ueSkuYXR0cihcIngyXCIsIHByb2plY3RlZENvb3Jkc1tpICsgMV0ueCkuYXR0cihcInkyXCIsIHByb2plY3RlZENvb3Jkc1tpICsgMV0ueSkuYXR0cihcInN0cm9rZVwiLCB0aGVtZS5heGlzQ29sb3IpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMS41KS5hdHRyKFwic3Ryb2tlLWRhc2hhcnJheVwiLCBcIjQgNFwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcHJvamVjdGVkQ29vcmRzLmZvckVhY2goKGNvb3JkKSA9PiB7XG4gICAgICAgIGNvbnN0IGFubm90YXRpb25Ob2RlID0gYW5ub3RhdGlvbnNHcm91cC5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcIndhcmRsZXktYW5ub3RhdGlvblwiKTtcbiAgICAgICAgYW5ub3RhdGlvbk5vZGUuYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJjeFwiLCBjb29yZC54KS5hdHRyKFwiY3lcIiwgY29vcmQueSkuYXR0cihcInJcIiwgMTApLmF0dHIoXCJmaWxsXCIsIFwid2hpdGVcIikuYXR0cihcInN0cm9rZVwiLCB0aGVtZS5heGlzQ29sb3IpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMS41KTtcbiAgICAgICAgYW5ub3RhdGlvbk5vZGUuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwieFwiLCBjb29yZC54KS5hdHRyKFwieVwiLCBjb29yZC55KS5hdHRyKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIikuYXR0cihcImRvbWluYW50LWJhc2VsaW5lXCIsIFwiY2VudHJhbFwiKS5hdHRyKFwiZm9udC1zaXplXCIsIDEwKS5hdHRyKFwiZmlsbFwiLCB0aGVtZS5heGlzVGV4dENvbG9yKS5hdHRyKFwiZm9udC13ZWlnaHRcIiwgXCJib2xkXCIpLnRleHQoYW5ub3RhdGlvbi5udW1iZXIpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgaWYgKGRhdGEuYW5ub3RhdGlvbnNCb3gpIHtcbiAgICAgIGxldCBib3hYID0gcHJvamVjdFgoZGF0YS5hbm5vdGF0aW9uc0JveC54KTtcbiAgICAgIGxldCBib3hZID0gcHJvamVjdFkoZGF0YS5hbm5vdGF0aW9uc0JveC55KTtcbiAgICAgIGNvbnN0IHBhZGRpbmcgPSAxMDtcbiAgICAgIGNvbnN0IGxpbmVIZWlnaHQgPSAxNjtcbiAgICAgIGNvbnN0IGZvbnRTaXplID0gMTE7XG4gICAgICBjb25zdCB0ZXh0Qm94R3JvdXAgPSBhbm5vdGF0aW9uc0dyb3VwLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwid2FyZGxleS1hbm5vdGF0aW9ucy1ib3hcIik7XG4gICAgICBjb25zdCBzb3J0ZWRBbm5vdGF0aW9ucyA9IFsuLi5kYXRhLmFubm90YXRpb25zXS5maWx0ZXIoKGEpID0+IGEudGV4dCkuc29ydCgoYSwgYikgPT4gYS5udW1iZXIgLSBiLm51bWJlcik7XG4gICAgICBjb25zdCB0ZXh0RWxlbWVudHMgPSBbXTtcbiAgICAgIHNvcnRlZEFubm90YXRpb25zLmZvckVhY2goKGFubm90YXRpb24sIGlkeCkgPT4ge1xuICAgICAgICBjb25zdCB0ZXh0MiA9IHRleHRCb3hHcm91cC5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJ4XCIsIGJveFggKyBwYWRkaW5nKS5hdHRyKFwieVwiLCBib3hZICsgcGFkZGluZyArIChpZHggKyAxKSAqIGxpbmVIZWlnaHQpLmF0dHIoXCJmb250LXNpemVcIiwgZm9udFNpemUpLmF0dHIoXCJmaWxsXCIsIHRoZW1lLmF4aXNUZXh0Q29sb3IpLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBcInN0YXJ0XCIpLmF0dHIoXCJkb21pbmFudC1iYXNlbGluZVwiLCBcIm1pZGRsZVwiKS50ZXh0KGAke2Fubm90YXRpb24ubnVtYmVyfS4gJHthbm5vdGF0aW9uLnRleHR9YCk7XG4gICAgICAgIHRleHRFbGVtZW50cy5wdXNoKHRleHQyKTtcbiAgICAgIH0pO1xuICAgICAgaWYgKHRleHRFbGVtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxldCBtYXhXaWR0aCA9IDA7XG4gICAgICAgIGxldCBtYXhIZWlnaHQgPSAwO1xuICAgICAgICB0ZXh0RWxlbWVudHMuZm9yRWFjaCgodGV4dDIpID0+IHtcbiAgICAgICAgICBjb25zdCB0ZXh0Tm9kZSA9IHRleHQyLm5vZGUoKTtcbiAgICAgICAgICBjb25zdCB0ZXh0V2lkdGggPSB0ZXh0Tm9kZS5nZXRDb21wdXRlZFRleHRMZW5ndGgoKTtcbiAgICAgICAgICBtYXhXaWR0aCA9IE1hdGgubWF4KG1heFdpZHRoLCB0ZXh0V2lkdGgpO1xuICAgICAgICAgIGNvbnN0IGJib3ggPSB0ZXh0Tm9kZS5nZXRCQm94KCk7XG4gICAgICAgICAgbWF4SGVpZ2h0ID0gTWF0aC5tYXgobWF4SGVpZ2h0LCBiYm94LmhlaWdodCk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBib3hXaWR0aCA9IG1heFdpZHRoICsgcGFkZGluZyAqIDIgKyAxMDU7XG4gICAgICAgIGNvbnN0IGJveEhlaWdodCA9IHNvcnRlZEFubm90YXRpb25zLmxlbmd0aCAqIGxpbmVIZWlnaHQgKyBwYWRkaW5nICogMiArIG1heEhlaWdodCAvIDI7XG4gICAgICAgIGNvbnN0IG1pblggPSBjb25maWdWYWx1ZXMucGFkZGluZztcbiAgICAgICAgY29uc3QgbWF4WCA9IHdpZHRoIC0gY29uZmlnVmFsdWVzLnBhZGRpbmcgLSBib3hXaWR0aDtcbiAgICAgICAgY29uc3QgbWluWSA9IGNvbmZpZ1ZhbHVlcy5wYWRkaW5nO1xuICAgICAgICBjb25zdCBtYXhZID0gaGVpZ2h0IC0gY29uZmlnVmFsdWVzLnBhZGRpbmcgLSBib3hIZWlnaHQ7XG4gICAgICAgIGJveFggPSBNYXRoLm1heChtaW5YLCBNYXRoLm1pbihib3hYLCBtYXhYKSk7XG4gICAgICAgIGJveFkgPSBNYXRoLm1heChtaW5ZLCBNYXRoLm1pbihib3hZLCBtYXhZKSk7XG4gICAgICAgIHRleHRFbGVtZW50cy5mb3JFYWNoKCh0ZXh0MiwgaWR4KSA9PiB7XG4gICAgICAgICAgdGV4dDIuYXR0cihcInhcIiwgYm94WCArIHBhZGRpbmcpLmF0dHIoXCJ5XCIsIGJveFkgKyBwYWRkaW5nICsgKGlkeCArIDEpICogbGluZUhlaWdodCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0ZXh0Qm94R3JvdXAuaW5zZXJ0KFwicmVjdFwiLCBcInRleHRcIikuYXR0cihcInhcIiwgYm94WCkuYXR0cihcInlcIiwgYm94WSkuYXR0cihcIndpZHRoXCIsIGJveFdpZHRoKS5hdHRyKFwiaGVpZ2h0XCIsIGJveEhlaWdodCkuYXR0cihcImZpbGxcIiwgXCJ3aGl0ZVwiKS5hdHRyKFwic3Ryb2tlXCIsIHRoZW1lLmF4aXNDb2xvcikuYXR0cihcInN0cm9rZS13aWR0aFwiLCAxLjUpLmF0dHIoXCJyeFwiLCA0KS5hdHRyKFwicnlcIiwgNCk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGlmIChkYXRhLm5vdGVzLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCBub3Rlc0dyb3VwID0gcm9vdC5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcIndhcmRsZXktbm90ZXNcIik7XG4gICAgZGF0YS5ub3Rlcy5mb3JFYWNoKChub3RlKSA9PiB7XG4gICAgICBjb25zdCBub3RlWCA9IHByb2plY3RYKG5vdGUueCk7XG4gICAgICBjb25zdCBub3RlWSA9IHByb2plY3RZKG5vdGUueSk7XG4gICAgICBub3Rlc0dyb3VwLmFwcGVuZChcInRleHRcIikuYXR0cihcInhcIiwgbm90ZVgpLmF0dHIoXCJ5XCIsIG5vdGVZKS5hdHRyKFwidGV4dC1hbmNob3JcIiwgXCJzdGFydFwiKS5hdHRyKFwiZm9udC1zaXplXCIsIDExKS5hdHRyKFwiZmlsbFwiLCB0aGVtZS5heGlzVGV4dENvbG9yKS5hdHRyKFwiZm9udC13ZWlnaHRcIiwgXCJib2xkXCIpLnRleHQobm90ZS50ZXh0KTtcbiAgICB9KTtcbiAgfVxuICBpZiAoZGF0YS5hY2NlbGVyYXRvcnMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGFjY2VsZXJhdG9yc0dyb3VwID0gcm9vdC5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcIndhcmRsZXktYWNjZWxlcmF0b3JzXCIpO1xuICAgIGRhdGEuYWNjZWxlcmF0b3JzLmZvckVhY2goKGFjY2VsZXJhdG9yKSA9PiB7XG4gICAgICBjb25zdCBhY2NYID0gcHJvamVjdFgoYWNjZWxlcmF0b3IueCk7XG4gICAgICBjb25zdCBhY2NZID0gcHJvamVjdFkoYWNjZWxlcmF0b3IueSk7XG4gICAgICBjb25zdCBhcnJvd1dpZHRoID0gNjA7XG4gICAgICBjb25zdCBhcnJvd0hlaWdodCA9IDMwO1xuICAgICAgY29uc3QgYXJyb3dIZWFkV2lkdGggPSAyMDtcbiAgICAgIGNvbnN0IGFycm93UGF0aCA9IGBcbiAgICAgICAgTSAke2FjY1h9ICR7YWNjWSAtIGFycm93SGVpZ2h0IC8gMn1cbiAgICAgICAgTCAke2FjY1ggKyBhcnJvd1dpZHRoIC0gYXJyb3dIZWFkV2lkdGh9ICR7YWNjWSAtIGFycm93SGVpZ2h0IC8gMn1cbiAgICAgICAgTCAke2FjY1ggKyBhcnJvd1dpZHRoIC0gYXJyb3dIZWFkV2lkdGh9ICR7YWNjWSAtIGFycm93SGVpZ2h0IC8gMiAtIDh9XG4gICAgICAgIEwgJHthY2NYICsgYXJyb3dXaWR0aH0gJHthY2NZfVxuICAgICAgICBMICR7YWNjWCArIGFycm93V2lkdGggLSBhcnJvd0hlYWRXaWR0aH0gJHthY2NZICsgYXJyb3dIZWlnaHQgLyAyICsgOH1cbiAgICAgICAgTCAke2FjY1ggKyBhcnJvd1dpZHRoIC0gYXJyb3dIZWFkV2lkdGh9ICR7YWNjWSArIGFycm93SGVpZ2h0IC8gMn1cbiAgICAgICAgTCAke2FjY1h9ICR7YWNjWSArIGFycm93SGVpZ2h0IC8gMn1cbiAgICAgICAgWlxuICAgICAgYDtcbiAgICAgIGFjY2VsZXJhdG9yc0dyb3VwLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgYXJyb3dQYXRoKS5hdHRyKFwiZmlsbFwiLCBcIndoaXRlXCIpLmF0dHIoXCJzdHJva2VcIiwgdGhlbWUuY29tcG9uZW50U3Ryb2tlKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDEpO1xuICAgICAgYWNjZWxlcmF0b3JzR3JvdXAuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwieFwiLCBhY2NYICsgYXJyb3dXaWR0aCAvIDIpLmF0dHIoXCJ5XCIsIGFjY1kgKyBhcnJvd0hlaWdodCAvIDIgKyAxNSkuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpLmF0dHIoXCJmb250LXNpemVcIiwgMTApLmF0dHIoXCJmaWxsXCIsIHRoZW1lLmF4aXNUZXh0Q29sb3IpLmF0dHIoXCJmb250LXdlaWdodFwiLCBcImJvbGRcIikudGV4dChhY2NlbGVyYXRvci5uYW1lKTtcbiAgICB9KTtcbiAgfVxuICBpZiAoZGF0YS5kZWFjY2VsZXJhdG9ycy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgZGVhY2NlbGVyYXRvcnNHcm91cCA9IHJvb3QuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJ3YXJkbGV5LWRlYWNjZWxlcmF0b3JzXCIpO1xuICAgIGRhdGEuZGVhY2NlbGVyYXRvcnMuZm9yRWFjaCgoZGVhY2NlbGVyYXRvcikgPT4ge1xuICAgICAgY29uc3QgZGVjWCA9IHByb2plY3RYKGRlYWNjZWxlcmF0b3IueCk7XG4gICAgICBjb25zdCBkZWNZID0gcHJvamVjdFkoZGVhY2NlbGVyYXRvci55KTtcbiAgICAgIGNvbnN0IGFycm93V2lkdGggPSA2MDtcbiAgICAgIGNvbnN0IGFycm93SGVpZ2h0ID0gMzA7XG4gICAgICBjb25zdCBhcnJvd0hlYWRXaWR0aCA9IDIwO1xuICAgICAgY29uc3QgYXJyb3dQYXRoID0gYFxuICAgICAgICBNICR7ZGVjWCArIGFycm93V2lkdGh9ICR7ZGVjWSAtIGFycm93SGVpZ2h0IC8gMn1cbiAgICAgICAgTCAke2RlY1ggKyBhcnJvd0hlYWRXaWR0aH0gJHtkZWNZIC0gYXJyb3dIZWlnaHQgLyAyfVxuICAgICAgICBMICR7ZGVjWCArIGFycm93SGVhZFdpZHRofSAke2RlY1kgLSBhcnJvd0hlaWdodCAvIDIgLSA4fVxuICAgICAgICBMICR7ZGVjWH0gJHtkZWNZfVxuICAgICAgICBMICR7ZGVjWCArIGFycm93SGVhZFdpZHRofSAke2RlY1kgKyBhcnJvd0hlaWdodCAvIDIgKyA4fVxuICAgICAgICBMICR7ZGVjWCArIGFycm93SGVhZFdpZHRofSAke2RlY1kgKyBhcnJvd0hlaWdodCAvIDJ9XG4gICAgICAgIEwgJHtkZWNYICsgYXJyb3dXaWR0aH0gJHtkZWNZICsgYXJyb3dIZWlnaHQgLyAyfVxuICAgICAgICBaXG4gICAgICBgO1xuICAgICAgZGVhY2NlbGVyYXRvcnNHcm91cC5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIGFycm93UGF0aCkuYXR0cihcImZpbGxcIiwgXCJ3aGl0ZVwiKS5hdHRyKFwic3Ryb2tlXCIsIHRoZW1lLmNvbXBvbmVudFN0cm9rZSkuYXR0cihcInN0cm9rZS13aWR0aFwiLCAxKTtcbiAgICAgIGRlYWNjZWxlcmF0b3JzR3JvdXAuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwieFwiLCBkZWNYICsgYXJyb3dXaWR0aCAvIDIpLmF0dHIoXCJ5XCIsIGRlY1kgKyBhcnJvd0hlaWdodCAvIDIgKyAxNSkuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpLmF0dHIoXCJmb250LXNpemVcIiwgMTApLmF0dHIoXCJmaWxsXCIsIHRoZW1lLmF4aXNUZXh0Q29sb3IpLmF0dHIoXCJmb250LXdlaWdodFwiLCBcImJvbGRcIikudGV4dChkZWFjY2VsZXJhdG9yLm5hbWUpO1xuICAgIH0pO1xuICB9XG59LCBcImRyYXdcIik7XG52YXIgd2FyZGxleVJlbmRlcmVyX2RlZmF1bHQgPSB7XG4gIGRyYXdcbn07XG5cbi8vIHNyYy9kaWFncmFtcy93YXJkbGV5L3N0eWxlcy50c1xudmFyIHN0eWxlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHtcbiAgd2FyZGxleVxufSA9IHt9KSA9PiB7XG4gIGNvbnN0IGRlZmF1bHRUaGVtZVZhcmlhYmxlcyA9IGdldFRoZW1lVmFyaWFibGVzKCk7XG4gIGNvbnN0IGN1cnJlbnRDb25maWcgPSBnZXRDb25maWcoKTtcbiAgY29uc3QgdGhlbWVWYXJpYWJsZXMgPSBjbGVhbkFuZE1lcmdlKGRlZmF1bHRUaGVtZVZhcmlhYmxlcywgY3VycmVudENvbmZpZy50aGVtZVZhcmlhYmxlcyk7XG4gIGNvbnN0IHcgPSBjbGVhbkFuZE1lcmdlKHRoZW1lVmFyaWFibGVzLndhcmRsZXksIHdhcmRsZXkpO1xuICByZXR1cm4gYFxuICAud2FyZGxleS1iYWNrZ3JvdW5kIHtcbiAgICBmaWxsOiAke3cuYmFja2dyb3VuZENvbG9yfTtcbiAgfVxuICAud2FyZGxleS1heGVzIGxpbmUsIC53YXJkbGV5LWF4ZXMgcGF0aCB7XG4gICAgc3Ryb2tlOiAke3cuYXhpc0NvbG9yfTtcbiAgfVxuICAud2FyZGxleS1heGlzLWxhYmVsIHtcbiAgICBmaWxsOiAke3cuYXhpc1RleHRDb2xvcn07XG4gIH1cbiAgLndhcmRsZXktc3RhZ2UtbGFiZWwge1xuICAgIGZpbGw6ICR7dy5heGlzVGV4dENvbG9yfTtcbiAgfVxuICAud2FyZGxleS1ncmlkIGxpbmUge1xuICAgIHN0cm9rZTogJHt3LmdyaWRDb2xvcn07XG4gIH1cbiAgLndhcmRsZXktbm9kZSBjaXJjbGUge1xuICAgIGZpbGw6ICR7dy5jb21wb25lbnRGaWxsfTtcbiAgICBzdHJva2U6ICR7dy5jb21wb25lbnRTdHJva2V9O1xuICB9XG4gIC53YXJkbGV5LW5vZGUtbGFiZWwge1xuICAgIGZpbGw6ICR7dy5jb21wb25lbnRMYWJlbENvbG9yfTtcbiAgfVxuICAud2FyZGxleS1saW5rIHtcbiAgICBzdHJva2U6ICR7dy5saW5rU3Ryb2tlfTtcbiAgfVxuICAud2FyZGxleS1saW5rLS1kYXNoZWQge1xuICAgIHN0cm9rZS1kYXNoYXJyYXk6IDQgNDtcbiAgfVxuICAud2FyZGxleS1saW5rLWxhYmVsIHtcbiAgICBmaWxsOiAke3cuYXhpc1RleHRDb2xvcn07XG4gIH1cbiAgLndhcmRsZXktdHJlbmQgbGluZSB7XG4gICAgc3Ryb2tlOiAke3cuZXZvbHV0aW9uU3Ryb2tlfTtcbiAgfVxuICAud2FyZGxleS1hbm5vdGF0aW9uLWxpbmUge1xuICAgIHN0cm9rZTogJHt3LmFubm90YXRpb25TdHJva2V9O1xuICB9XG4gIC53YXJkbGV5LWFubm90YXRpb24gY2lyY2xlIHtcbiAgICBmaWxsOiAke3cuYW5ub3RhdGlvbkZpbGx9O1xuICAgIHN0cm9rZTogJHt3LmFubm90YXRpb25TdHJva2V9O1xuICB9XG4gIC53YXJkbGV5LWFubm90YXRpb24gdGV4dCB7XG4gICAgZmlsbDogJHt3LmFubm90YXRpb25UZXh0Q29sb3J9O1xuICB9XG4gIC53YXJkbGV5LWFubm90YXRpb25zLWJveCByZWN0IHtcbiAgICBmaWxsOiAke3cuYW5ub3RhdGlvbkZpbGx9O1xuICAgIHN0cm9rZTogJHt3LmFubm90YXRpb25TdHJva2V9O1xuICB9XG4gIC53YXJkbGV5LWFubm90YXRpb25zLWJveCB0ZXh0IHtcbiAgICBmaWxsOiAke3cuYW5ub3RhdGlvblRleHRDb2xvcn07XG4gIH1cbiAgLndhcmRsZXktcGlwZWxpbmUtYm94IHtcbiAgICBzdHJva2U6ICR7dy5jb21wb25lbnRTdHJva2V9O1xuICB9XG4gIC53YXJkbGV5LW5vdGVzIHRleHQge1xuICAgIGZpbGw6ICR7dy5heGlzVGV4dENvbG9yfTtcbiAgfVxuICBgO1xufSwgXCJzdHlsZXNcIik7XG5cbi8vIHNyYy9kaWFncmFtcy93YXJkbGV5L3dhcmRsZXlEaWFncmFtLnRzXG52YXIgZGlhZ3JhbSA9IHtcbiAgcGFyc2VyLFxuICBkYjogd2FyZGxleURiX2RlZmF1bHQsXG4gIHJlbmRlcmVyOiB3YXJkbGV5UmVuZGVyZXJfZGVmYXVsdCxcbiAgc3R5bGVzXG59O1xuZXhwb3J0IHtcbiAgZGlhZ3JhbVxufTtcbiIKICBdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNkJBLElBQUksNEJBQTRCLE9BQU8sQ0FBQyxPQUFPLFlBQVk7QUFBQSxFQUN6RCxNQUFNLGFBQWEsU0FBUyxJQUFJLFFBQVEsTUFBTTtBQUFBLEVBQzlDLElBQUksYUFBYSxLQUFLLGFBQWEsS0FBSztBQUFBLElBQ3RDLE1BQU0sSUFBSSxNQUNSLEdBQUcsMEVBQTBFLE9BQy9FO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLEdBQ04sV0FBVztBQUNkLElBQUksZ0NBQWdDLE9BQU8sQ0FBQyxZQUFZLFdBQVcsWUFBWTtBQUFBLEVBQzdFLE9BQU87QUFBQSxJQUNMLEdBQUcsVUFBVSxXQUFXLEdBQUcsbUJBQW1CO0FBQUEsSUFDOUMsR0FBRyxVQUFVLFlBQVksR0FBRyxvQkFBb0I7QUFBQSxFQUNsRDtBQUFBLEdBQ0MsZUFBZTtBQUNsQixJQUFJLGtDQUFrQyxPQUFPLENBQUMsU0FBUztBQUFBLEVBQ3JELElBQUksQ0FBQyxNQUFNO0FBQUEsSUFDVDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLElBQUksU0FBUyxPQUFPO0FBQUEsSUFDbEIsT0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLElBQUksU0FBUyxNQUFNO0FB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LGNBQ0EsRUFBRTtBQUFBO0FBQUE7QUFBQSxZQUdKLEVBQUU7QUFBQTtBQUFBO0FBQUEsY0FHQSxFQUFFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBTUosRUFBRTtBQUFBO0FBQUE7QUFBQSxjQUdBLEVBQUU7QUFBQTtBQUFBO0FBQUEsY0FHRixFQUFFO0FBQUE7QUFBQTtBQUFBLFlBR0osRUFBRTtBQUFBLGNBQ0EsRUFBRTtBQUFBO0FBQUE7QUFBQSxZQUdKLEVBQUU7QUFBQTtBQUFBO0FBQUEsWUFHRixFQUFFO0FBQUEsY0FDQSxFQUFFO0FBQUE7QUFBQTtBQUFBLFlBR0osRUFBRTtBQUFBO0FBQUE7QUFBQSxjQUdBLEVBQUU7QUFBQTtBQUFBO0FBQUEsWUFHSixFQUFFO0FBQUE7QUFBQTtBQUFBLEdBR1gsUUFBUTtBQUdYLElBQUksVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBLElBQUk7QUFBQSxFQUNKLFVBQVU7QUFBQSxFQUNWO0FBQ0Y7IiwKICAiZGVidWdJZCI6ICJBQUQ3RjZDOUFBQURCQTQ1NjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
