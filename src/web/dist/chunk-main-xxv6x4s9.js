import {
  at
} from "./chunk-main-2se6cwec.js";
import {
  compileStyles,
  solidStateFill,
  styles2String,
  userNodeOverrides
} from "./chunk-main-4ceh9h9g.js";
import {
  configureLabelImages,
  getSubGraphTitleMargins
} from "./chunk-main-s8463nwg.js";
import {
  createText,
  getIconSVG
} from "./chunk-main-wsp4jakw.js";
import {
  calculateTextWidth,
  decodeEntities,
  handleUndefinedAttr
} from "./chunk-main-vvfzntzy.js";
import {
  evaluate,
  getConfig,
  getConfig2,
  getEffectiveHtmlLabels,
  hasKatex,
  parseGenericTypes,
  sanitizeText,
  sanitizeText3
} from "./chunk-main-aws590jt.js";
import {
  __name,
  log,
  select_default
} from "./chunk-main-vcnyggwp.js";

// node_modules/mermaid/dist/chunks/mermaid.core/chunk-3OPIFGDE.mjs
var labelHelper = /* @__PURE__ */ __name(async (parent, node, _classes) => {
  let cssClasses;
  const useHtmlLabels = node.useHtmlLabels || evaluate(getConfig2()?.htmlLabels);
  if (!_classes) {
    cssClasses = "node default";
  } else {
    cssClasses = _classes;
  }
  const shapeSvg = parent.insert("g").attr("class", cssClasses).attr("id", node.domId || node.id);
  const labelEl = shapeSvg.insert("g").attr("class", "label").attr("style", handleUndefinedAttr(node.labelStyle));
  let label;
  if (node.label === undefined) {
    label = "";
  } else {
    label = typeof node.label === "string" ? node.label : node.label[0];
  }
  const addBackground = !!node.icon || !!node.img;
  const isMarkdown = node.labelType === "markdown";
  const text2 = await createText(labelEl, sanitizeText(decodeEntities(label), getConfig2()), {
    useHtmlLabels,
    width: node.width || getConfig2().flowchart?.wrappingWidth,
    classes: isMarkdown ? "markdown-node-label" : "",
    style: node.labelStyle,
    addSvgBackground: addBackground,
    markdown: isMarkdown
  }, getConfig2());
  let bbox = text2.getBBox();
  const halfPadding = (node?.padding ?? 0) / 2;
  if (useHtmlLabels) {
    const div = text2.children[0];
    const dv = select_default(text2);
    await configureLabelImages(div, label);
    bbox = div.getBoundingClientRect();
    dv.attr("width", bbox.width);
    dv.attr("height", bbox.height);
  }
  if (useHtmlLabels) {
    labelEl.attr("transform", "translate(" + -bbox.width / 2 + ", " + -bbox.height / 2 + ")");
  } else {
    labelEl.attr("transform", "translate(0, " + -bbox.height / 2 + ")");
  }
  if (node.centerLabel) {
    labelEl.attr("transform", "translate(" + -bbox.width / 2 + ", " + -bbox.height / 2 + ")");
  }
  labelEl.insert("rect", ":first-child");
  return { shapeSvg, bbox, halfPadding, label: labelEl };
}, "labelHelper");
var insertLabel = /* @__PURE__ */ __name(async (parent, label, options) => {
  const useHtmlLabels = options.useHtmlLabels ?? getEffectiveHtmlLabels(getConfig2());
  const labelEl = parent.insert("g").attr("class", "label").attr("style", options.labelStyle || "");
  const text2 = await createText(labelEl, sanitizeText(decodeEntities(label), getConfig2()), {
    useHtmlLabels,
    width: options.width || getConfig2()?.flowchart?.wrappingWidth,
    style: options.labelStyle,
    addSvgBackground: !!options.icon || !!options.img
  });
  let bbox = text2.getBBox();
  const halfPadding = options.padding / 2;
  if (getEffectiveHtmlLabels(getConfig2())) {
    const div = text2.children[0];
    const dv = select_default(text2);
    bbox = div.getBoundingClientRect();
    dv.attr("width", bbox.width);
    dv.attr("height", bbox.height);
  }
  if (useHtmlLabels) {
    labelEl.attr("transform", "translate(" + -bbox.width / 2 + ", " + -bbox.height / 2 + ")");
  } else {
    labelEl.attr("transform", "translate(0, " + -bbox.height / 2 + ")");
  }
  if (options.centerLabel) {
    labelEl.attr("transform", "translate(" + -bbox.width / 2 + ", " + -bbox.height / 2 + ")");
  }
  labelEl.insert("rect", ":first-child");
  return { shapeSvg: parent, bbox, halfPadding, label: labelEl };
}, "insertLabel");
var updateNodeBounds = /* @__PURE__ */ __name((node, element) => {
  const bbox = element.node().getBBox();
  node.width = bbox.width;
  node.height = bbox.height;
}, "updateNodeBounds");
var getNodeClasses = /* @__PURE__ */ __name((node, extra) => (node.look === "handDrawn" ? "rough-node" : "node") + " " + node.cssClasses + " " + (extra || ""), "getNodeClasses");
function createPathFromPoints(points) {
  const pointStrings = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`);
  pointStrings.push("Z");
  return pointStrings.join(" ");
}
__name(createPathFromPoints, "createPathFromPoints");
function generateFullSineWavePoints(x1, y1, x2, y2, amplitude, numCycles) {
  const points = [];
  const steps = 50;
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  const cycleLength = deltaX / numCycles;
  const frequency = 2 * Math.PI / cycleLength;
  const midY = y1 + deltaY / 2;
  for (let i = 0;i <= steps; i++) {
    const t = i / steps;
    const x = x1 + t * deltaX;
    const y = midY + amplitude * Math.sin(frequency * (x - x1));
    points.push({ x, y });
  }
  return points;
}
__name(generateFullSineWavePoints, "generateFullSineWavePoints");
function generateCirclePoints(centerX, centerY, radius, numPoints, startAngle, endAngle) {
  const points = [];
  const startAngleRad = startAngle * Math.PI / 180;
  const endAngleRad = endAngle * Math.PI / 180;
  const angleRange = endAngleRad - startAngleRad;
  const angleStep = angleRange / (numPoints - 1);
  for (let i = 0;i < numPoints; i++) {
    const angle = startAngleRad + i * angleStep;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x: -x, y: -y });
  }
  return points;
}
__name(generateCirclePoints, "generateCirclePoints");
function mergePaths(roughElement) {
  const paths = Array.from(roughElement.childNodes).filter((node) => node.tagName === "path");
  const mergedPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const combinedPathData = paths.map((path) => path.getAttribute("d")).filter((d) => d !== null).join(" ");
  mergedPath.setAttribute("d", combinedPathData);
  const fillPath = paths.find((path) => path.getAttribute("fill") !== "none");
  const strokePath = paths.find((path) => path.getAttribute("stroke") !== "none");
  const getAttr = /* @__PURE__ */ __name((element, attr) => {
    return element?.getAttribute(attr) ?? undefined;
  }, "getAttr");
  if (fillPath) {
    const fillAttrs = {
      fill: getAttr(fillPath, "fill"),
      "fill-opacity": getAttr(fillPath, "fill-opacity") ?? "1"
    };
    Object.entries(fillAttrs).forEach(([attr, value]) => {
      if (value) {
        mergedPath.setAttribute(attr, value);
      }
    });
  }
  if (strokePath) {
    const strokeAttrs = {
      stroke: getAttr(strokePath, "stroke"),
      "stroke-width": getAttr(strokePath, "stroke-width") ?? "1",
      "stroke-opacity": getAttr(strokePath, "stroke-opacity") ?? "1"
    };
    Object.entries(strokeAttrs).forEach(([attr, value]) => {
      if (value) {
        mergedPath.setAttribute(attr, value);
      }
    });
  }
  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.appendChild(mergedPath);
  return group;
}
__name(mergePaths, "mergePaths");
var intersectRect = /* @__PURE__ */ __name((node, point) => {
  var x = node.x;
  var y = node.y;
  var dx = point.x - x;
  var dy = point.y - y;
  var w = node.width / 2;
  var h = node.height / 2;
  var sx, sy;
  if (Math.abs(dy) * w > Math.abs(dx) * h) {
    if (dy < 0) {
      h = -h;
    }
    sx = dy === 0 ? 0 : h * dx / dy;
    sy = h;
  } else {
    if (dx < 0) {
      w = -w;
    }
    sx = w;
    sy = dx === 0 ? 0 : w * dy / dx;
  }
  return { x: x + sx, y: y + sy };
}, "intersectRect");
var intersect_rect_default = intersectRect;
var createLabel = /* @__PURE__ */ __name(async (element, _vertexText, style, isTitle = false, isNode = false) => {
  let vertexText = _vertexText || "";
  if (typeof vertexText === "object") {
    vertexText = vertexText[0];
  }
  const config = getConfig2();
  const useHtmlLabels = getEffectiveHtmlLabels(config);
  return await createText(element, vertexText, {
    style,
    isTitle,
    useHtmlLabels,
    markdown: false,
    isNode,
    width: Number.POSITIVE_INFINITY
  }, config);
}, "createLabel");
var createLabel_default = createLabel;
var createRoundedRectPathD = /* @__PURE__ */ __name((x, y, totalWidth, totalHeight, radius) => [
  "M",
  x + radius,
  y,
  "H",
  x + totalWidth - radius,
  "A",
  radius,
  radius,
  0,
  0,
  1,
  x + totalWidth,
  y + radius,
  "V",
  y + totalHeight - radius,
  "A",
  radius,
  radius,
  0,
  0,
  1,
  x + totalWidth - radius,
  y + totalHeight,
  "H",
  x + radius,
  "A",
  radius,
  radius,
  0,
  0,
  1,
  x,
  y + totalHeight - radius,
  "V",
  y + radius,
  "A",
  radius,
  radius,
  0,
  0,
  1,
  x + radius,
  y,
  "Z"
].join(" "), "createRoundedRectPathD");
var rect = /* @__PURE__ */ __name(async (parent, node) => {
  log.info("Creating subgraph rect for ", node.id, node);
  const siteConfig = getConfig2();
  const { themeVariables, handDrawnSeed } = siteConfig;
  const { clusterBkg, clusterBorder } = themeVariables;
  const { labelStyles, nodeStyles, borderStyles, backgroundStyles } = styles2String(node);
  const shapeSvg = parent.insert("g").attr("class", "cluster " + node.cssClasses).attr("id", node.domId).attr("data-look", node.look);
  const useHtmlLabels = getEffectiveHtmlLabels(siteConfig);
  const labelEl = shapeSvg.insert("g").attr("class", "cluster-label ");
  let text2;
  if (node.labelType === "markdown") {
    text2 = await createText(labelEl, node.label, {
      style: node.labelStyle,
      useHtmlLabels,
      isNode: true,
      width: node.width
    });
  } else {
    text2 = await createLabel_default(labelEl, node.label, node.labelStyle || "", false, true);
  }
  let bbox = text2.getBBox();
  if (getEffectiveHtmlLabels(siteConfig)) {
    const div = text2.children[0];
    const dv = select_default(text2);
    bbox = div.getBoundingClientRect();
    dv.attr("width", bbox.width);
    dv.attr("height", bbox.height);
  }
  const width = node.width <= bbox.width + node.padding ? bbox.width + node.padding : node.width;
  if (node.width <= bbox.width + node.padding) {
    node.diff = (width - node.width) / 2 - node.padding;
  } else {
    node.diff = -node.padding;
  }
  const height = node.height;
  const x = node.x - width / 2;
  const y = node.y - height / 2;
  log.trace("Data ", node, JSON.stringify(node));
  let rect2;
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const options = userNodeOverrides(node, {
      roughness: 0.7,
      fill: clusterBkg,
      stroke: clusterBorder,
      fillWeight: 3,
      seed: handDrawnSeed
    });
    const roughNode = rc.path(createRoundedRectPathD(x, y, width, height, 0), options);
    rect2 = shapeSvg.insert(() => {
      log.debug("Rough node insert CXC", roughNode);
      return roughNode;
    }, ":first-child");
    rect2.select("path:nth-child(2)").attr("style", borderStyles.join(";"));
    rect2.select("path").attr("style", backgroundStyles.join(";").replace("fill", "stroke"));
  } else {
    rect2 = shapeSvg.insert("rect", ":first-child");
    rect2.attr("style", nodeStyles).attr("rx", node.rx).attr("ry", node.ry).attr("x", x).attr("y", y).attr("width", width).attr("height", height);
  }
  const { subGraphTitleTopMargin } = getSubGraphTitleMargins(siteConfig);
  labelEl.attr("transform", `translate(${node.x - bbox.width / 2}, ${node.y - node.height / 2 + subGraphTitleTopMargin})`);
  if (labelStyles) {
    const span = labelEl.select("span");
    if (span) {
      span.attr("style", labelStyles);
    }
  }
  const rectBox = rect2.node().getBBox();
  node.offsetX = 0;
  node.width = rectBox.width;
  node.height = rectBox.height;
  node.offsetY = bbox.height - node.padding / 2;
  node.intersect = function(point) {
    return intersect_rect_default(node, point);
  };
  return { cluster: shapeSvg, labelBBox: bbox };
}, "rect");
var noteGroup = /* @__PURE__ */ __name((parent, node) => {
  const shapeSvg = parent.insert("g").attr("class", "note-cluster").attr("id", node.domId);
  const rect2 = shapeSvg.insert("rect", ":first-child");
  const padding = 0 * node.padding;
  const halfPadding = padding / 2;
  rect2.attr("rx", node.rx).attr("ry", node.ry).attr("x", node.x - node.width / 2 - halfPadding).attr("y", node.y - node.height / 2 - halfPadding).attr("width", node.width + padding).attr("height", node.height + padding).attr("fill", "none");
  const rectBox = rect2.node().getBBox();
  node.width = rectBox.width;
  node.height = rectBox.height;
  node.intersect = function(point) {
    return intersect_rect_default(node, point);
  };
  return { cluster: shapeSvg, labelBBox: { width: 0, height: 0 } };
}, "noteGroup");
var roundedWithTitle = /* @__PURE__ */ __name(async (parent, node) => {
  const siteConfig = getConfig2();
  const { themeVariables, handDrawnSeed } = siteConfig;
  const { altBackground, compositeBackground, compositeTitleBackground, nodeBorder } = themeVariables;
  const shapeSvg = parent.insert("g").attr("class", node.cssClasses).attr("id", node.domId).attr("data-id", node.id).attr("data-look", node.look);
  const outerRectG = shapeSvg.insert("g", ":first-child");
  const label = shapeSvg.insert("g").attr("class", "cluster-label");
  let innerRect = shapeSvg.append("rect");
  const text2 = await createLabel_default(label, node.label, node.labelStyle, undefined, true);
  let bbox = text2.getBBox();
  if (getEffectiveHtmlLabels(siteConfig)) {
    const div = text2.children[0];
    const dv = select_default(text2);
    bbox = div.getBoundingClientRect();
    dv.attr("width", bbox.width);
    dv.attr("height", bbox.height);
  }
  const padding = 0 * node.padding;
  const halfPadding = padding / 2;
  const width = (node.width <= bbox.width + node.padding ? bbox.width + node.padding : node.width) + padding;
  if (node.width <= bbox.width + node.padding) {
    node.diff = (width - node.width) / 2 - node.padding;
  } else {
    node.diff = -node.padding;
  }
  const height = node.height + padding;
  const innerHeight = node.height + padding - bbox.height - 6;
  const x = node.x - width / 2;
  const y = node.y - height / 2;
  node.width = width;
  const innerY = node.y - node.height / 2 - halfPadding + bbox.height + 2;
  let rect2;
  if (node.look === "handDrawn") {
    const isAlt = node.cssClasses.includes("statediagram-cluster-alt");
    const rc = at.svg(shapeSvg);
    const roughOuterNode = node.rx || node.ry ? rc.path(createRoundedRectPathD(x, y, width, height, 10), {
      roughness: 0.7,
      fill: compositeTitleBackground,
      fillStyle: "solid",
      stroke: nodeBorder,
      seed: handDrawnSeed
    }) : rc.rectangle(x, y, width, height, { seed: handDrawnSeed });
    rect2 = shapeSvg.insert(() => roughOuterNode, ":first-child");
    const roughInnerNode = rc.rectangle(x, innerY, width, innerHeight, {
      fill: isAlt ? altBackground : compositeBackground,
      fillStyle: isAlt ? "hachure" : "solid",
      stroke: nodeBorder,
      seed: handDrawnSeed
    });
    rect2 = shapeSvg.insert(() => roughOuterNode, ":first-child");
    innerRect = shapeSvg.insert(() => roughInnerNode);
  } else {
    rect2 = outerRectG.insert("rect", ":first-child");
    const outerRectClass = "outer";
    rect2.attr("class", outerRectClass).attr("x", x).attr("y", y).attr("width", width).attr("height", height).attr("data-look", node.look);
    innerRect.attr("class", "inner").attr("x", x).attr("y", innerY).attr("width", width).attr("height", innerHeight);
  }
  label.attr("transform", `translate(${node.x - bbox.width / 2}, ${y + 1 - (getEffectiveHtmlLabels(siteConfig) ? 0 : 3)})`);
  const rectBox = rect2.node().getBBox();
  node.height = rectBox.height;
  node.offsetX = 0;
  node.offsetY = bbox.height - node.padding / 2;
  node.labelBBox = bbox;
  node.intersect = function(point) {
    return intersect_rect_default(node, point);
  };
  return { cluster: shapeSvg, labelBBox: bbox };
}, "roundedWithTitle");
var kanbanSection = /* @__PURE__ */ __name(async (parent, node) => {
  log.info("Creating subgraph rect for ", node.id, node);
  const siteConfig = getConfig2();
  const { themeVariables, handDrawnSeed } = siteConfig;
  const { clusterBkg, clusterBorder } = themeVariables;
  const { labelStyles, nodeStyles, borderStyles, backgroundStyles } = styles2String(node);
  const shapeSvg = parent.insert("g").attr("class", "cluster " + node.cssClasses).attr("id", node.domId).attr("data-look", node.look);
  const useHtmlLabels = getEffectiveHtmlLabels(siteConfig);
  const labelEl = shapeSvg.insert("g").attr("class", "cluster-label ");
  const text2 = await createText(labelEl, node.label, {
    style: node.labelStyle,
    useHtmlLabels,
    isNode: true,
    width: node.width
  });
  let bbox = text2.getBBox();
  if (getEffectiveHtmlLabels(siteConfig)) {
    const div = text2.children[0];
    const dv = select_default(text2);
    bbox = div.getBoundingClientRect();
    dv.attr("width", bbox.width);
    dv.attr("height", bbox.height);
  }
  const width = node.width <= bbox.width + node.padding ? bbox.width + node.padding : node.width;
  if (node.width <= bbox.width + node.padding) {
    node.diff = (width - node.width) / 2 - node.padding;
  } else {
    node.diff = -node.padding;
  }
  const height = node.height;
  const x = node.x - width / 2;
  const y = node.y - height / 2;
  log.trace("Data ", node, JSON.stringify(node));
  let rect2;
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const options = userNodeOverrides(node, {
      roughness: 0.7,
      fill: clusterBkg,
      stroke: clusterBorder,
      fillWeight: 4,
      seed: handDrawnSeed
    });
    const roughNode = rc.path(createRoundedRectPathD(x, y, width, height, node.rx), options);
    rect2 = shapeSvg.insert(() => {
      log.debug("Rough node insert CXC", roughNode);
      return roughNode;
    }, ":first-child");
    rect2.select("path:nth-child(2)").attr("style", borderStyles.join(";"));
    rect2.select("path").attr("style", backgroundStyles.join(";").replace("fill", "stroke"));
  } else {
    rect2 = shapeSvg.insert("rect", ":first-child");
    rect2.attr("style", nodeStyles).attr("rx", node.rx).attr("ry", node.ry).attr("x", x).attr("y", y).attr("width", width).attr("height", height);
  }
  const { subGraphTitleTopMargin } = getSubGraphTitleMargins(siteConfig);
  labelEl.attr("transform", `translate(${node.x - bbox.width / 2}, ${node.y - node.height / 2 + subGraphTitleTopMargin})`);
  if (labelStyles) {
    const span = labelEl.select("span");
    if (span) {
      span.attr("style", labelStyles);
    }
  }
  const rectBox = rect2.node().getBBox();
  node.offsetX = 0;
  node.width = rectBox.width;
  node.height = rectBox.height;
  node.offsetY = bbox.height - node.padding / 2;
  node.intersect = function(point) {
    return intersect_rect_default(node, point);
  };
  return { cluster: shapeSvg, labelBBox: bbox };
}, "kanbanSection");
var divider = /* @__PURE__ */ __name((parent, node) => {
  const siteConfig = getConfig2();
  const { themeVariables, handDrawnSeed } = siteConfig;
  const { nodeBorder } = themeVariables;
  const shapeSvg = parent.insert("g").attr("class", node.cssClasses).attr("id", node.domId).attr("data-look", node.look);
  const outerRectG = shapeSvg.insert("g", ":first-child");
  const padding = 0 * node.padding;
  const width = node.width + padding;
  node.diff = -node.padding;
  const height = node.height + padding;
  const x = node.x - width / 2;
  const y = node.y - height / 2;
  node.width = width;
  let rect2;
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const roughOuterNode = rc.rectangle(x, y, width, height, {
      fill: "lightgrey",
      roughness: 0.5,
      strokeLineDash: [5],
      stroke: nodeBorder,
      seed: handDrawnSeed
    });
    rect2 = shapeSvg.insert(() => roughOuterNode, ":first-child");
  } else {
    rect2 = outerRectG.insert("rect", ":first-child");
    let outerRectClass = "outer";
    if (node.look === "neo") {
      outerRectClass = "divider";
    } else {
      outerRectClass = "divider";
    }
    rect2.attr("class", outerRectClass).attr("x", x).attr("y", y).attr("width", width).attr("height", height).attr("data-look", node.look);
  }
  const rectBox = rect2.node().getBBox();
  node.height = rectBox.height;
  node.offsetX = 0;
  node.offsetY = 0;
  node.intersect = function(point) {
    return intersect_rect_default(node, point);
  };
  return { cluster: shapeSvg, labelBBox: {} };
}, "divider");
var squareRect = rect;
var shapes = {
  rect,
  squareRect,
  roundedWithTitle,
  noteGroup,
  divider,
  kanbanSection
};
var clusterElems = /* @__PURE__ */ new Map;
var insertCluster = /* @__PURE__ */ __name(async (elem, node) => {
  const shape = node.shape || "rect";
  const cluster = await shapes[shape](elem, node);
  clusterElems.set(node.id, cluster);
  return cluster;
}, "insertCluster");
var clear = /* @__PURE__ */ __name(() => {
  clusterElems = /* @__PURE__ */ new Map;
}, "clear");
function intersectNode(node, point) {
  return node.intersect(point);
}
__name(intersectNode, "intersectNode");
var intersect_node_default = intersectNode;
function intersectEllipse(node, rx, ry, point) {
  var cx = node.x;
  var cy = node.y;
  var px = cx - point.x;
  var py = cy - point.y;
  var det = Math.sqrt(rx * rx * py * py + ry * ry * px * px);
  var dx = Math.abs(rx * ry * px / det);
  if (point.x < cx) {
    dx = -dx;
  }
  var dy = Math.abs(rx * ry * py / det);
  if (point.y < cy) {
    dy = -dy;
  }
  return { x: cx + dx, y: cy + dy };
}
__name(intersectEllipse, "intersectEllipse");
var intersect_ellipse_default = intersectEllipse;
function intersectCircle(node, rx, point) {
  return intersect_ellipse_default(node, rx, rx, point);
}
__name(intersectCircle, "intersectCircle");
var intersect_circle_default = intersectCircle;
function intersectLine(p1, p2, q1, q2) {
  {
    const a1 = p2.y - p1.y;
    const b1 = p1.x - p2.x;
    const c1 = p2.x * p1.y - p1.x * p2.y;
    const r3 = a1 * q1.x + b1 * q1.y + c1;
    const r4 = a1 * q2.x + b1 * q2.y + c1;
    const epsilon = 0.000001;
    if (r3 !== 0 && r4 !== 0 && sameSign(r3, r4)) {
      return;
    }
    const a2 = q2.y - q1.y;
    const b2 = q1.x - q2.x;
    const c2 = q2.x * q1.y - q1.x * q2.y;
    const r1 = a2 * p1.x + b2 * p1.y + c2;
    const r2 = a2 * p2.x + b2 * p2.y + c2;
    if (Math.abs(r1) < epsilon && Math.abs(r2) < epsilon && sameSign(r1, r2)) {
      return;
    }
    const denom = a1 * b2 - a2 * b1;
    if (denom === 0) {
      return;
    }
    const offset = Math.abs(denom / 2);
    let num = b1 * c2 - b2 * c1;
    const x = num < 0 ? (num - offset) / denom : (num + offset) / denom;
    num = a2 * c1 - a1 * c2;
    const y = num < 0 ? (num - offset) / denom : (num + offset) / denom;
    return { x, y };
  }
}
__name(intersectLine, "intersectLine");
function sameSign(r1, r2) {
  return r1 * r2 > 0;
}
__name(sameSign, "sameSign");
var intersect_line_default = intersectLine;
function intersectPolygon(node, polyPoints, point) {
  let x1 = node.x;
  let y1 = node.y;
  let intersections = [];
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  if (typeof polyPoints.forEach === "function") {
    polyPoints.forEach(function(entry) {
      minX = Math.min(minX, entry.x);
      minY = Math.min(minY, entry.y);
    });
  } else {
    minX = Math.min(minX, polyPoints.x);
    minY = Math.min(minY, polyPoints.y);
  }
  let left = x1 - node.width / 2 - minX;
  let top = y1 - node.height / 2 - minY;
  for (let i = 0;i < polyPoints.length; i++) {
    let p1 = polyPoints[i];
    let p2 = polyPoints[i < polyPoints.length - 1 ? i + 1 : 0];
    let intersect = intersect_line_default(node, point, { x: left + p1.x, y: top + p1.y }, { x: left + p2.x, y: top + p2.y });
    if (intersect) {
      intersections.push(intersect);
    }
  }
  if (!intersections.length) {
    return node;
  }
  if (intersections.length > 1) {
    intersections.sort(function(p, q) {
      let pdx = p.x - point.x;
      let pdy = p.y - point.y;
      let distp = Math.sqrt(pdx * pdx + pdy * pdy);
      let qdx = q.x - point.x;
      let qdy = q.y - point.y;
      let distq = Math.sqrt(qdx * qdx + qdy * qdy);
      return distp < distq ? -1 : distp === distq ? 0 : 1;
    });
  }
  return intersections[0];
}
__name(intersectPolygon, "intersectPolygon");
var intersect_polygon_default = intersectPolygon;
var intersect_default = {
  node: intersect_node_default,
  circle: intersect_circle_default,
  ellipse: intersect_ellipse_default,
  polygon: intersect_polygon_default,
  rect: intersect_rect_default
};
function anchor(parent, node) {
  const { labelStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const classes = getNodeClasses(node);
  let cssClasses = classes;
  if (!classes) {
    cssClasses = "anchor";
  }
  const shapeSvg = parent.insert("g").attr("class", cssClasses).attr("id", node.domId || node.id);
  const radius = 1;
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, { fill: "black", stroke: "none", fillStyle: "solid" });
  if (node.look !== "handDrawn") {
    options.roughness = 0;
  }
  const roughNode = rc.circle(0, 0, radius * 2, options);
  const circleElem = shapeSvg.insert(() => roughNode, ":first-child");
  circleElem.attr("class", "anchor").attr("style", handleUndefinedAttr(cssStyles));
  updateNodeBounds(node, circleElem);
  node.intersect = function(point) {
    log.info("Circle intersect", node, radius, point);
    return intersect_default.circle(node, radius, point);
  };
  return shapeSvg;
}
__name(anchor, "anchor");
function generateArcPoints(x1, y1, x2, y2, rx, ry, clockwise) {
  const numPoints = 20;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const dx = (x2 - x1) / 2;
  const dy = (y2 - y1) / 2;
  const transformedX = dx / rx;
  const transformedY = dy / ry;
  const distance = Math.sqrt(transformedX ** 2 + transformedY ** 2);
  if (distance > 1) {
    throw new Error("The given radii are too small to create an arc between the points.");
  }
  const scaledCenterDistance = Math.sqrt(1 - distance ** 2);
  const centerX = midX + scaledCenterDistance * ry * Math.sin(angle) * (clockwise ? -1 : 1);
  const centerY = midY - scaledCenterDistance * rx * Math.cos(angle) * (clockwise ? -1 : 1);
  const startAngle = Math.atan2((y1 - centerY) / ry, (x1 - centerX) / rx);
  const endAngle = Math.atan2((y2 - centerY) / ry, (x2 - centerX) / rx);
  let angleRange = endAngle - startAngle;
  if (clockwise && angleRange < 0) {
    angleRange += 2 * Math.PI;
  }
  if (!clockwise && angleRange > 0) {
    angleRange -= 2 * Math.PI;
  }
  const points = [];
  for (let i = 0;i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const angle2 = startAngle + t * angleRange;
    const x = centerX + rx * Math.cos(angle2);
    const y = centerY + ry * Math.sin(angle2);
    points.push({ x, y });
  }
  return points;
}
__name(generateArcPoints, "generateArcPoints");
function calculateArcSagitta(chord, radiusX, radiusY) {
  const [semiMajorAxis, semiMinorAxis] = [radiusX, radiusY].sort((a, b) => b - a);
  return semiMinorAxis * (1 - Math.sqrt(1 - (chord / semiMajorAxis / 2) ** 2));
}
__name(calculateArcSagitta, "calculateArcSagitta");
async function bowTieRect(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingX = node.look === "neo" ? 16 : nodePadding;
  const labelPaddingY = node.look === "neo" ? 12 : nodePadding;
  const calcTotalHeight = /* @__PURE__ */ __name((labelHeight) => labelHeight + labelPaddingY, "calcTotalHeight");
  const calcEllipseRadius = /* @__PURE__ */ __name((totalHeight2) => {
    const ry2 = totalHeight2 / 2;
    const rx2 = ry2 / (2.5 + totalHeight2 / 50);
    return [rx2, ry2];
  }, "calcEllipseRadius");
  const { shapeSvg, bbox } = await labelHelper(parent, node, getNodeClasses(node));
  const totalHeight = calcTotalHeight(node?.height ? node?.height : bbox.height);
  const [rx, ry] = calcEllipseRadius(totalHeight);
  const sagitta = calculateArcSagitta(totalHeight, rx, ry);
  const totalWidth = (node?.width ? node?.width : bbox.width) + labelPaddingX * 2 + sagitta;
  const w = totalWidth - sagitta;
  const h = totalHeight;
  const { cssStyles } = node;
  const points = [
    { x: w / 2, y: -h / 2 },
    { x: -w / 2, y: -h / 2 },
    ...generateArcPoints(-w / 2, -h / 2, -w / 2, h / 2, rx, ry, false),
    { x: w / 2, y: h / 2 },
    ...generateArcPoints(w / 2, h / 2, w / 2, -h / 2, rx, ry, true)
  ];
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const bowTieRectPath = createPathFromPoints(points);
  const bowTieRectShapePath = rc.path(bowTieRectPath, options);
  const bowTieRectShape = shapeSvg.insert(() => bowTieRectShapePath, ":first-child");
  bowTieRectShape.attr("class", "basic label-container outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    bowTieRectShape.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    bowTieRectShape.selectAll("path").attr("style", nodeStyles);
  }
  bowTieRectShape.attr("transform", `translate(${rx / 2}, 0)`);
  updateNodeBounds(node, bowTieRectShape);
  node.intersect = function(point) {
    const pos = intersect_default.polygon(node, points, point);
    return pos;
  };
  return shapeSvg;
}
__name(bowTieRect, "bowTieRect");
function insertPolygonShape(parent, w, h, points) {
  return parent.insert("polygon", ":first-child").attr("points", points.map(function(d) {
    return d.x + "," + d.y;
  }).join(" ")).attr("class", "label-container").attr("transform", "translate(" + -w / 2 + "," + h / 2 + ")");
}
__name(insertPolygonShape, "insertPolygonShape");
var NOTCH_SIZE = 12;
async function card(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingX = node.look === "neo" ? 28 : nodePadding;
  const labelPaddingY = node.look === "neo" ? 24 : nodePadding;
  const { shapeSvg, bbox } = await labelHelper(parent, node, getNodeClasses(node));
  const w = (node?.width ?? bbox.width) + (node.look === "neo" ? labelPaddingX * 2 : labelPaddingX + NOTCH_SIZE);
  const h = (node?.height ?? bbox.height) + (node.look === "neo" ? labelPaddingY * 2 : labelPaddingY);
  const left = 0;
  const right = w;
  const top = -h;
  const bottom = 0;
  const points = [
    { x: left + NOTCH_SIZE, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
    { x: left, y: top + NOTCH_SIZE },
    { x: left + NOTCH_SIZE, y: top }
  ];
  let polygon;
  const { cssStyles } = node;
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const options = userNodeOverrides(node, {});
    const pathData = createPathFromPoints(points);
    const roughNode = rc.path(pathData, options);
    polygon = shapeSvg.insert(() => roughNode, ":first-child").attr("transform", `translate(${-w / 2}, ${h / 2})`);
    if (cssStyles) {
      polygon.attr("style", cssStyles);
    }
  } else {
    polygon = insertPolygonShape(shapeSvg, w, h, points);
  }
  if (nodeStyles) {
    polygon.attr("style", nodeStyles);
  }
  updateNodeBounds(node, polygon);
  node.intersect = function(point) {
    return intersect_default.polygon(node, points, point);
  };
  return shapeSvg;
}
__name(card, "card");
function choice(parent, node) {
  const { nodeStyles } = styles2String(node);
  node.label = "";
  const shapeSvg = parent.insert("g").attr("class", getNodeClasses(node)).attr("id", node.domId ?? node.id);
  const { cssStyles } = node;
  const s = Math.max(28, node.width ?? 0);
  const points = [
    { x: 0, y: s / 2 },
    { x: s / 2, y: 0 },
    { x: 0, y: -s / 2 },
    { x: -s / 2, y: 0 }
  ];
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const choicePath = createPathFromPoints(points);
  const roughNode = rc.path(choicePath, options);
  const choiceShape = shapeSvg.insert(() => roughNode, ":first-child");
  if (cssStyles && node.look !== "handDrawn") {
    choiceShape.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    choiceShape.selectAll("path").attr("style", nodeStyles);
  }
  node.width = 28;
  node.height = 28;
  node.intersect = function(point) {
    return intersect_default.polygon(node, points, point);
  };
  return shapeSvg;
}
__name(choice, "choice");
async function circle(parent, node, options) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const { shapeSvg, bbox, halfPadding } = await labelHelper(parent, node, getNodeClasses(node));
  const labelPadding = 16;
  const padding = options?.padding ?? halfPadding;
  const radius = node.look === "neo" ? bbox.width / 2 + labelPadding * 2 : bbox.width / 2 + padding;
  let circleElem;
  const { cssStyles } = node;
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const options2 = userNodeOverrides(node, {});
    const roughNode = rc.circle(0, 0, radius * 2, options2);
    circleElem = shapeSvg.insert(() => roughNode, ":first-child");
    circleElem.attr("class", "basic label-container").attr("style", handleUndefinedAttr(cssStyles));
  } else {
    circleElem = shapeSvg.insert("circle", ":first-child").attr("class", "basic label-container").attr("style", nodeStyles).attr("r", radius).attr("cx", 0).attr("cy", 0);
  }
  updateNodeBounds(node, circleElem);
  node.calcIntersect = function(bounds, point) {
    const radius2 = bounds.width / 2;
    return intersect_default.circle(bounds, radius2, point);
  };
  node.intersect = function(point) {
    log.info("Circle intersect", node, radius, point);
    return intersect_default.circle(node, radius, point);
  };
  return shapeSvg;
}
__name(circle, "circle");
function createLine(r) {
  const xAxis45 = Math.cos(Math.PI / 4);
  const yAxis45 = Math.sin(Math.PI / 4);
  const lineLength = r * 2;
  const pointQ1 = { x: lineLength / 2 * xAxis45, y: lineLength / 2 * yAxis45 };
  const pointQ2 = { x: -(lineLength / 2) * xAxis45, y: lineLength / 2 * yAxis45 };
  const pointQ3 = { x: -(lineLength / 2) * xAxis45, y: -(lineLength / 2) * yAxis45 };
  const pointQ4 = { x: lineLength / 2 * xAxis45, y: -(lineLength / 2) * yAxis45 };
  return `M ${pointQ2.x},${pointQ2.y} L ${pointQ4.x},${pointQ4.y}
                   M ${pointQ1.x},${pointQ1.y} L ${pointQ3.x},${pointQ3.y}`;
}
__name(createLine, "createLine");
function crossedCircle(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  node.label = "";
  const shapeSvg = parent.insert("g").attr("class", getNodeClasses(node)).attr("id", node.domId ?? node.id);
  const radius = Math.max(30, node?.width ?? 0);
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const circleNode = rc.circle(0, 0, radius * 2, options);
  const linePath = createLine(radius);
  const lineNode = rc.path(linePath, options);
  const crossedCircle2 = shapeSvg.insert(() => circleNode, ":first-child");
  crossedCircle2.insert(() => lineNode);
  crossedCircle2.attr("class", "outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    crossedCircle2.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    crossedCircle2.selectAll("path").attr("style", nodeStyles);
  }
  updateNodeBounds(node, crossedCircle2);
  node.intersect = function(point) {
    log.info("crossedCircle intersect", node, { radius, point });
    const pos = intersect_default.circle(node, radius, point);
    return pos;
  };
  return shapeSvg;
}
__name(crossedCircle, "crossedCircle");
function generateCirclePoints2(centerX, centerY, radius, numPoints = 100, startAngle = 0, endAngle = 180) {
  const points = [];
  const startAngleRad = startAngle * Math.PI / 180;
  const endAngleRad = endAngle * Math.PI / 180;
  const angleRange = endAngleRad - startAngleRad;
  const angleStep = angleRange / (numPoints - 1);
  for (let i = 0;i < numPoints; i++) {
    const angle = startAngleRad + i * angleStep;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x: -x, y: -y });
  }
  return points;
}
__name(generateCirclePoints2, "generateCirclePoints");
async function curlyBraceLeft(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));
  const paddingX = node.look === "neo" ? 18 : node.padding ?? 0;
  const paddingY = node.look === "neo" ? 12 : node.padding ?? 0;
  const w = bbox.width + paddingX;
  const h = bbox.height + paddingY;
  const radius = Math.max(5, h * 0.1);
  const { cssStyles } = node;
  const points = [
    ...generateCirclePoints2(w / 2, -h / 2, radius, 30, -90, 0),
    { x: -w / 2 - radius, y: radius },
    ...generateCirclePoints2(w / 2 + radius * 2, -radius, radius, 20, -180, -270),
    ...generateCirclePoints2(w / 2 + radius * 2, radius, radius, 20, -90, -180),
    { x: -w / 2 - radius, y: -h / 2 },
    ...generateCirclePoints2(w / 2, h / 2, radius, 20, 0, 90)
  ];
  const rectPoints = [
    { x: w / 2, y: -h / 2 - radius },
    { x: -w / 2, y: -h / 2 - radius },
    ...generateCirclePoints2(w / 2, -h / 2, radius, 20, -90, 0),
    { x: -w / 2 - radius, y: -radius },
    ...generateCirclePoints2(w / 2 + w * 0.1, -radius, radius, 20, -180, -270),
    ...generateCirclePoints2(w / 2 + w * 0.1, radius, radius, 20, -90, -180),
    { x: -w / 2 - radius, y: h / 2 },
    ...generateCirclePoints2(w / 2, h / 2, radius, 20, 0, 90),
    { x: -w / 2, y: h / 2 + radius },
    { x: w / 2, y: h / 2 + radius }
  ];
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, { fill: "none" });
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const curlyBraceLeftPath = createPathFromPoints(points);
  const newCurlyBracePath = curlyBraceLeftPath.replace("Z", "");
  const curlyBraceLeftNode = rc.path(newCurlyBracePath, options);
  const rectPath = createPathFromPoints(rectPoints);
  const rectShape = rc.path(rectPath, { ...options });
  const curlyBraceLeftShape = shapeSvg.insert("g", ":first-child");
  curlyBraceLeftShape.insert(() => rectShape, ":first-child").attr("stroke-opacity", 0);
  curlyBraceLeftShape.insert(() => curlyBraceLeftNode, ":first-child");
  curlyBraceLeftShape.attr("class", "text");
  if (cssStyles && node.look !== "handDrawn") {
    curlyBraceLeftShape.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    curlyBraceLeftShape.selectAll("path").attr("style", nodeStyles);
  }
  curlyBraceLeftShape.attr("transform", `translate(${radius}, 0)`);
  label.attr("transform", `translate(${-w / 2 + radius - (bbox.x - (bbox.left ?? 0))},${-h / 2 + (node.padding ?? 0) / 2 - (bbox.y - (bbox.top ?? 0))})`);
  updateNodeBounds(node, curlyBraceLeftShape);
  node.intersect = function(point) {
    const pos = intersect_default.polygon(node, rectPoints, point);
    return pos;
  };
  return shapeSvg;
}
__name(curlyBraceLeft, "curlyBraceLeft");
function generateCirclePoints3(centerX, centerY, radius, numPoints = 100, startAngle = 0, endAngle = 180) {
  const points = [];
  const startAngleRad = startAngle * Math.PI / 180;
  const endAngleRad = endAngle * Math.PI / 180;
  const angleRange = endAngleRad - startAngleRad;
  const angleStep = angleRange / (numPoints - 1);
  for (let i = 0;i < numPoints; i++) {
    const angle = startAngleRad + i * angleStep;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y });
  }
  return points;
}
__name(generateCirclePoints3, "generateCirclePoints");
async function curlyBraceRight(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));
  const labelPaddingX = node.look === "neo" ? 18 : node.padding ?? 0;
  const labelPaddingY = node.look === "neo" ? 12 : node.padding ?? 0;
  const w = bbox.width + (node.look === "neo" ? labelPaddingX * 2 : labelPaddingX);
  const h = bbox.height + (node.look === "neo" ? labelPaddingY * 2 : labelPaddingY);
  const radius = Math.max(5, h * 0.1);
  const { cssStyles } = node;
  const points = [
    ...generateCirclePoints3(w / 2, -h / 2, radius, 20, -90, 0),
    { x: w / 2 + radius, y: -radius },
    ...generateCirclePoints3(w / 2 + radius * 2, -radius, radius, 20, -180, -270),
    ...generateCirclePoints3(w / 2 + radius * 2, radius, radius, 20, -90, -180),
    { x: w / 2 + radius, y: h / 2 },
    ...generateCirclePoints3(w / 2, h / 2, radius, 20, 0, 90)
  ];
  const rectPoints = [
    { x: -w / 2, y: -h / 2 - radius },
    { x: w / 2, y: -h / 2 - radius },
    ...generateCirclePoints3(w / 2, -h / 2, radius, 20, -90, 0),
    { x: w / 2 + radius, y: -radius },
    ...generateCirclePoints3(w / 2 + radius * 2, -radius, radius, 20, -180, -270),
    ...generateCirclePoints3(w / 2 + radius * 2, radius, radius, 20, -90, -180),
    { x: w / 2 + radius, y: h / 2 },
    ...generateCirclePoints3(w / 2, h / 2, radius, 20, 0, 90),
    { x: w / 2, y: h / 2 + radius },
    { x: -w / 2, y: h / 2 + radius }
  ];
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, { fill: "none" });
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const curlyBraceRightPath = createPathFromPoints(points);
  const newCurlyBracePath = curlyBraceRightPath.replace("Z", "");
  const curlyBraceRightNode = rc.path(newCurlyBracePath, options);
  const rectPath = createPathFromPoints(rectPoints);
  const rectShape = rc.path(rectPath, { ...options });
  const curlyBraceRightShape = shapeSvg.insert("g", ":first-child");
  curlyBraceRightShape.insert(() => rectShape, ":first-child").attr("stroke-opacity", 0);
  curlyBraceRightShape.insert(() => curlyBraceRightNode, ":first-child");
  curlyBraceRightShape.attr("class", "text");
  if (cssStyles && node.look !== "handDrawn") {
    curlyBraceRightShape.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    curlyBraceRightShape.selectAll("path").attr("style", nodeStyles);
  }
  curlyBraceRightShape.attr("transform", `translate(${-radius}, 0)`);
  label.attr("transform", `translate(${-w / 2 + (node.padding ?? 0) / 2 - (bbox.x - (bbox.left ?? 0))},${-h / 2 + (node.padding ?? 0) / 2 - (bbox.y - (bbox.top ?? 0))})`);
  updateNodeBounds(node, curlyBraceRightShape);
  node.intersect = function(point) {
    const pos = intersect_default.polygon(node, rectPoints, point);
    return pos;
  };
  return shapeSvg;
}
__name(curlyBraceRight, "curlyBraceRight");
function generateCirclePoints4(centerX, centerY, radius, numPoints = 100, startAngle = 0, endAngle = 180) {
  const points = [];
  const startAngleRad = startAngle * Math.PI / 180;
  const endAngleRad = endAngle * Math.PI / 180;
  const angleRange = endAngleRad - startAngleRad;
  const angleStep = angleRange / (numPoints - 1);
  for (let i = 0;i < numPoints; i++) {
    const angle = startAngleRad + i * angleStep;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x: -x, y: -y });
  }
  return points;
}
__name(generateCirclePoints4, "generateCirclePoints");
async function curlyBraces(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));
  const labelPaddingX = node.look === "neo" ? 18 : node.padding ?? 0;
  const labelPaddingY = node.look === "neo" ? 12 : node.padding ?? 0;
  const w = bbox.width + (node.look === "neo" ? labelPaddingX * 2 : labelPaddingX);
  const h = bbox.height + (node.look === "neo" ? labelPaddingY * 2 : labelPaddingY);
  const radius = Math.max(5, h * 0.1);
  const { cssStyles } = node;
  const leftCurlyBracePoints = [
    ...generateCirclePoints4(w / 2, -h / 2, radius, 30, -90, 0),
    { x: -w / 2 - radius, y: radius },
    ...generateCirclePoints4(w / 2 + radius * 2, -radius, radius, 20, -180, -270),
    ...generateCirclePoints4(w / 2 + radius * 2, radius, radius, 20, -90, -180),
    { x: -w / 2 - radius, y: -h / 2 },
    ...generateCirclePoints4(w / 2, h / 2, radius, 20, 0, 90)
  ];
  const rightCurlyBracePoints = [
    ...generateCirclePoints4(-w / 2 + radius + radius / 2, -h / 2, radius, 20, -90, -180),
    { x: w / 2 - radius / 2, y: radius },
    ...generateCirclePoints4(-w / 2 - radius / 2, -radius, radius, 20, 0, 90),
    ...generateCirclePoints4(-w / 2 - radius / 2, radius, radius, 20, -90, 0),
    { x: w / 2 - radius / 2, y: -radius },
    ...generateCirclePoints4(-w / 2 + radius + radius / 2, h / 2, radius, 30, -180, -270)
  ];
  const rectPoints = [
    { x: w / 2, y: -h / 2 - radius },
    { x: -w / 2, y: -h / 2 - radius },
    ...generateCirclePoints4(w / 2, -h / 2, radius, 20, -90, 0),
    { x: -w / 2 - radius, y: -radius },
    ...generateCirclePoints4(w / 2 + radius * 2, -radius, radius, 20, -180, -270),
    ...generateCirclePoints4(w / 2 + radius * 2, radius, radius, 20, -90, -180),
    { x: -w / 2 - radius, y: h / 2 },
    ...generateCirclePoints4(w / 2, h / 2, radius, 20, 0, 90),
    { x: -w / 2, y: h / 2 + radius },
    { x: w / 2 - radius - radius / 2, y: h / 2 + radius },
    ...generateCirclePoints4(-w / 2 + radius + radius / 2, -h / 2, radius, 20, -90, -180),
    { x: w / 2 - radius / 2, y: radius },
    ...generateCirclePoints4(-w / 2 - radius / 2, -radius, radius, 20, 0, 90),
    ...generateCirclePoints4(-w / 2 - radius / 2, radius, radius, 20, -90, 0),
    { x: w / 2 - radius / 2, y: -radius },
    ...generateCirclePoints4(-w / 2 + radius + radius / 2, h / 2, radius, 30, -180, -270)
  ];
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, { fill: "none" });
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const leftCurlyBracePath = createPathFromPoints(leftCurlyBracePoints);
  const newLeftCurlyBracePath = leftCurlyBracePath.replace("Z", "");
  const leftCurlyBraceNode = rc.path(newLeftCurlyBracePath, options);
  const rightCurlyBracePath = createPathFromPoints(rightCurlyBracePoints);
  const newRightCurlyBracePath = rightCurlyBracePath.replace("Z", "");
  const rightCurlyBraceNode = rc.path(newRightCurlyBracePath, options);
  const rectPath = createPathFromPoints(rectPoints);
  const rectShape = rc.path(rectPath, { ...options });
  const curlyBracesShape = shapeSvg.insert("g", ":first-child");
  curlyBracesShape.insert(() => rectShape, ":first-child").attr("stroke-opacity", 0);
  curlyBracesShape.insert(() => leftCurlyBraceNode, ":first-child");
  curlyBracesShape.insert(() => rightCurlyBraceNode, ":first-child");
  curlyBracesShape.attr("class", "text");
  if (cssStyles && node.look !== "handDrawn") {
    curlyBracesShape.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    curlyBracesShape.selectAll("path").attr("style", nodeStyles);
  }
  curlyBracesShape.attr("transform", `translate(${radius - radius / 4}, 0)`);
  label.attr("transform", `translate(${-w / 2 + (node.padding ?? 0) / 2 - (bbox.x - (bbox.left ?? 0))},${-h / 2 + (node.padding ?? 0) / 2 - (bbox.y - (bbox.top ?? 0))})`);
  updateNodeBounds(node, curlyBracesShape);
  node.intersect = function(point) {
    const pos = intersect_default.polygon(node, rectPoints, point);
    return pos;
  };
  return shapeSvg;
}
__name(curlyBraces, "curlyBraces");
async function curvedTrapezoid(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingX = node.look === "neo" ? 16 : nodePadding;
  const labelPaddingY = node.look === "neo" ? 12 : nodePadding;
  const minWidth = 20, minHeight = 5;
  const { shapeSvg, bbox } = await labelHelper(parent, node, getNodeClasses(node));
  const w = Math.max(minWidth, (bbox.width + labelPaddingX * 2) * 1.25, node?.width ?? 0);
  const h = Math.max(minHeight, bbox.height + labelPaddingY * 2, node?.height ?? 0);
  const radius = h / 2;
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const totalWidth = w, totalHeight = h;
  const rw = totalWidth - radius;
  const tw = totalHeight / 4;
  const points = [
    { x: rw, y: 0 },
    { x: tw, y: 0 },
    { x: 0, y: totalHeight / 2 },
    { x: tw, y: totalHeight },
    { x: rw, y: totalHeight },
    ...generateCirclePoints(-rw, -totalHeight / 2, radius, 50, 270, 90)
  ];
  const pathData = createPathFromPoints(points);
  const shapeNode = rc.path(pathData, options);
  const polygon = shapeSvg.insert(() => shapeNode, ":first-child");
  polygon.attr("class", "basic label-container outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    polygon.selectChildren("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    polygon.selectChildren("path").attr("style", nodeStyles);
  }
  polygon.attr("transform", `translate(${-w / 2}, ${-h / 2})`);
  updateNodeBounds(node, polygon);
  node.intersect = function(point) {
    const pos = intersect_default.polygon(node, points, point);
    return pos;
  };
  return shapeSvg;
}
__name(curvedTrapezoid, "curvedTrapezoid");
var createCylinderPathD = /* @__PURE__ */ __name((x, y, width, height, rx, ry) => {
  return [
    `M${x},${y + ry}`,
    `a${rx},${ry} 0,0,0 ${width},0`,
    `a${rx},${ry} 0,0,0 ${-width},0`,
    `l0,${height}`,
    `a${rx},${ry} 0,0,0 ${width},0`,
    `l0,${-height}`
  ].join(" ");
}, "createCylinderPathD");
var createOuterCylinderPathD = /* @__PURE__ */ __name((x, y, width, height, rx, ry) => {
  return [
    `M${x},${y + ry}`,
    `M${x + width},${y + ry}`,
    `a${rx},${ry} 0,0,0 ${-width},0`,
    `l0,${height}`,
    `a${rx},${ry} 0,0,0 ${width},0`,
    `l0,${-height}`
  ].join(" ");
}, "createOuterCylinderPathD");
var createInnerCylinderPathD = /* @__PURE__ */ __name((x, y, width, height, rx, ry) => {
  return [`M${x - width / 2},${-height / 2}`, `a${rx},${ry} 0,0,0 ${width},0`].join(" ");
}, "createInnerCylinderPathD");
var MIN_HEIGHT = 8;
var MIN_WIDTH = 8;
async function cylinder(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingX = node.look === "neo" ? 24 : nodePadding;
  const labelPaddingY = node.look === "neo" ? 24 : nodePadding;
  if (node.width || node.height) {
    const originalWidth = node.width ?? 0;
    node.width = (node.width ?? 0) - labelPaddingY;
    if (node.width < MIN_WIDTH) {
      node.width = MIN_WIDTH;
    }
    const rx2 = originalWidth / 2;
    const ry2 = rx2 / (2.5 + originalWidth / 50);
    node.height = (node.height ?? 0) - labelPaddingX - ry2 * 3;
    if (node.height < MIN_HEIGHT) {
      node.height = MIN_HEIGHT;
    }
  }
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));
  const w = (node.width ? node.width : bbox.width) + labelPaddingY;
  const rx = w / 2;
  const ry = rx / (2.5 + w / 50);
  const h = (node.height ? node.height : bbox.height) + labelPaddingX + ry;
  let cylinder2;
  const { cssStyles } = node;
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const outerPathData = createOuterCylinderPathD(0, 0, w, h, rx, ry);
    const innerPathData = createInnerCylinderPathD(0, ry, w, h, rx, ry);
    const options = userNodeOverrides(node, {});
    const outerNode = rc.path(outerPathData, options);
    const innerLine = rc.path(innerPathData, userNodeOverrides(node, { fill: "none" }));
    cylinder2 = shapeSvg.insert(() => innerLine, ":first-child");
    cylinder2 = shapeSvg.insert(() => outerNode, ":first-child");
    cylinder2.attr("class", "basic label-container");
    if (cssStyles) {
      cylinder2.attr("style", cssStyles);
    }
  } else {
    const pathData = createCylinderPathD(0, 0, w, h, rx, ry);
    cylinder2 = shapeSvg.insert("path", ":first-child").attr("d", pathData).attr("class", "basic label-container outer-path").attr("style", handleUndefinedAttr(cssStyles)).attr("style", nodeStyles);
  }
  cylinder2.attr("label-offset-y", ry);
  cylinder2.attr("transform", `translate(${-w / 2}, ${-(h / 2 + ry)})`);
  updateNodeBounds(node, cylinder2);
  label.attr("transform", `translate(${-(bbox.width / 2) - (bbox.x - (bbox.left ?? 0))}, ${-(bbox.height / 2) + (node.padding ?? 0) / 1.5 - (bbox.y - (bbox.top ?? 0))})`);
  node.intersect = function(point) {
    const pos = intersect_default.rect(node, point);
    const x = pos.x - (node.x ?? 0);
    if (rx != 0 && (Math.abs(x) < (node.width ?? 0) / 2 || Math.abs(x) == (node.width ?? 0) / 2 && Math.abs(pos.y - (node.y ?? 0)) > (node.height ?? 0) / 2 - ry)) {
      let y = ry * ry * (1 - x * x / (rx * rx));
      if (y > 0) {
        y = Math.sqrt(y);
      }
      y = ry - y;
      if (point.y - (node.y ?? 0) > 0) {
        y = -y;
      }
      pos.y += y;
    }
    return pos;
  };
  return shapeSvg;
}
__name(cylinder, "cylinder");
async function drawRect(parent, node, options) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const { shapeSvg, bbox } = await labelHelper(parent, node, getNodeClasses(node));
  const totalWidth = Math.max(bbox.width + options.labelPaddingX * 2, node?.width || 0);
  const totalHeight = Math.max(bbox.height + options.labelPaddingY * 2, node?.height || 0);
  const x = -totalWidth / 2;
  const y = -totalHeight / 2;
  let rect2;
  let { rx, ry } = node;
  const { cssStyles } = node;
  if (options?.rx && options.ry) {
    rx = options.rx;
    ry = options.ry;
  }
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const options2 = userNodeOverrides(node, {});
    const roughNode = rx || ry ? rc.path(createRoundedRectPathD(x, y, totalWidth, totalHeight, rx || 0), options2) : rc.rectangle(x, y, totalWidth, totalHeight, options2);
    rect2 = shapeSvg.insert(() => roughNode, ":first-child");
    rect2.attr("class", "basic label-container").attr("style", handleUndefinedAttr(cssStyles));
  } else {
    rect2 = shapeSvg.insert("rect", ":first-child");
    rect2.attr("class", "basic label-container").attr("style", nodeStyles).attr("rx", handleUndefinedAttr(rx)).attr("ry", handleUndefinedAttr(ry)).attr("x", x).attr("y", y).attr("width", totalWidth).attr("height", totalHeight);
  }
  updateNodeBounds(node, rect2);
  node.calcIntersect = function(bounds, point) {
    return intersect_default.rect(bounds, point);
  };
  node.intersect = function(point) {
    return intersect_default.rect(node, point);
  };
  return shapeSvg;
}
__name(drawRect, "drawRect");
async function datastore(parent, node) {
  const { cssClasses, labelPaddingX, labelPaddingY, padding, width, height } = node;
  const rectOptions = {
    rx: 0,
    ry: 0,
    classes: cssClasses ?? "",
    labelPaddingX: labelPaddingX ?? (padding ?? 0) * 2,
    labelPaddingY: labelPaddingY ?? padding ?? 0
  };
  const rect2 = await drawRect(parent, node, rectOptions);
  if (node.look === "handDrawn") {
    const rc = at.svg(rect2);
    const nodeOverrideOptions = userNodeOverrides(node, {});
    const borderSelection = rect2.select(".basic.label-container > path:nth-child(2)");
    const borderPath = borderSelection.node();
    if (!borderPath) {
      return rect2;
    }
    let bbox = null;
    if (borderPath instanceof SVGGraphicsElement) {
      bbox = borderPath.getBBox();
    } else {
      return rect2;
    }
    rect2.insert(() => rc.line(bbox.x, bbox.y, bbox.x + bbox.width, bbox.y, nodeOverrideOptions), ".basic.label-container g.label");
    rect2.insert(() => rc.line(bbox.x, bbox.y + bbox.height, bbox.x + bbox.width, bbox.y + bbox.height, nodeOverrideOptions), ".basic.label-container g.label");
    borderSelection.remove();
    return rect2;
  }
  const selection = rect2.select(".basic.label-container");
  const datastoreWidth = (Number(selection.attr("width")) || width) ?? 0;
  const datastoreHeight = (Number(selection.attr("height")) || height) ?? 0;
  if (datastoreWidth > 0 && datastoreHeight > 0) {
    selection.attr("stroke-dasharray", `${datastoreWidth} ${datastoreHeight}`);
  }
  return rect2;
}
__name(datastore, "datastore");
async function dividedRectangle(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const paddingX = node.look === "neo" ? 16 : node.padding ?? 0;
  const paddingY = node.look === "neo" ? 16 : node.padding ?? 0;
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));
  const w = bbox.width + paddingX;
  const h = bbox.height + paddingY;
  const rectOffset2 = h * 0.2;
  const x = -w / 2;
  const y = -h / 2 - rectOffset2 / 2;
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const pts = [
    { x, y: y + rectOffset2 },
    { x: -x, y: y + rectOffset2 },
    { x: -x, y: -y },
    { x, y: -y },
    { x, y },
    { x: -x, y },
    { x: -x, y: y + rectOffset2 }
  ];
  const poly = rc.polygon(pts.map((p) => [p.x, p.y]), options);
  const polygon = shapeSvg.insert(() => poly, ":first-child");
  polygon.attr("class", "basic label-container outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    polygon.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    polygon.selectAll("path").attr("style", nodeStyles);
  }
  label.attr("transform", `translate(${x + (node.padding ?? 0) / 2 - (bbox.x - (bbox.left ?? 0))}, ${y + rectOffset2 + (node.padding ?? 0) / 2 - (bbox.y - (bbox.top ?? 0))})`);
  updateNodeBounds(node, polygon);
  node.intersect = function(point) {
    const pos = intersect_default.rect(node, point);
    return pos;
  };
  return shapeSvg;
}
__name(dividedRectangle, "dividedRectangle");
async function doublecircle(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  const gap = node.look === "neo" ? 12 : 5;
  node.labelStyle = labelStyles;
  const padding = node.padding ?? 0;
  const labelPadding = node.look === "neo" ? 16 : padding;
  const { shapeSvg, bbox } = await labelHelper(parent, node, getNodeClasses(node));
  const outerRadius = (node?.width ? node?.width / 2 : bbox.width / 2) + (labelPadding ?? 0);
  const innerRadius = outerRadius - gap;
  let circleGroup;
  const { cssStyles } = node;
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const outerOptions = userNodeOverrides(node, { roughness: 0.2, strokeWidth: 2.5 });
    const innerOptions = userNodeOverrides(node, { roughness: 0.2, strokeWidth: 1.5 });
    const outerRoughNode = rc.circle(0, 0, outerRadius * 2, outerOptions);
    const innerRoughNode = rc.circle(0, 0, innerRadius * 2, innerOptions);
    circleGroup = shapeSvg.insert("g", ":first-child");
    circleGroup.attr("class", handleUndefinedAttr(node.cssClasses)).attr("style", handleUndefinedAttr(cssStyles));
    circleGroup.node()?.appendChild(outerRoughNode);
    circleGroup.node()?.appendChild(innerRoughNode);
  } else {
    circleGroup = shapeSvg.insert("g", ":first-child");
    const outerCircle = circleGroup.insert("circle", ":first-child");
    const innerCircle = circleGroup.insert("circle");
    circleGroup.attr("class", "basic label-container").attr("style", nodeStyles);
    outerCircle.attr("class", "outer-circle").attr("style", nodeStyles).attr("r", outerRadius).attr("cx", 0).attr("cy", 0);
    innerCircle.attr("class", "inner-circle").attr("style", nodeStyles).attr("r", innerRadius).attr("cx", 0).attr("cy", 0);
  }
  updateNodeBounds(node, circleGroup);
  node.intersect = function(point) {
    log.info("DoubleCircle intersect", node, outerRadius, point);
    return intersect_default.circle(node, outerRadius, point);
  };
  return shapeSvg;
}
__name(doublecircle, "doublecircle");
function filledCircle(parent, node, { config: { themeVariables } }) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.label = "";
  node.labelStyle = labelStyles;
  const shapeSvg = parent.insert("g").attr("class", getNodeClasses(node)).attr("id", node.domId ?? node.id);
  const radius = 7;
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const { nodeBorder } = themeVariables;
  const options = userNodeOverrides(node, { fillStyle: "solid" });
  if (node.look !== "handDrawn") {
    options.roughness = 0;
  }
  const circleNode = rc.circle(0, 0, radius * 2, options);
  const filledCircle2 = shapeSvg.insert(() => circleNode, ":first-child");
  filledCircle2.selectAll("path").attr("style", `fill: ${nodeBorder} !important;`);
  if (cssStyles && cssStyles.length > 0 && node.look !== "handDrawn") {
    filledCircle2.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    filledCircle2.selectAll("path").attr("style", nodeStyles);
  }
  updateNodeBounds(node, filledCircle2);
  node.intersect = function(point) {
    log.info("filledCircle intersect", node, { radius, point });
    const pos = intersect_default.circle(node, radius, point);
    return pos;
  };
  return shapeSvg;
}
__name(filledCircle, "filledCircle");
var MIN_HEIGHT2 = 10;
var MIN_WIDTH2 = 10;
async function flippedTriangle(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingX = node.look === "neo" ? nodePadding * 2 : nodePadding;
  if (node.width || node.height) {
    node.height = node?.height ?? 0;
    if (node.height < MIN_HEIGHT2) {
      node.height = MIN_HEIGHT2;
    }
    node.width = (node?.width ?? 0) - labelPaddingX - labelPaddingX / 2;
    if (node.width < MIN_WIDTH2) {
      node.width = MIN_WIDTH2;
    }
  }
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));
  const w = (node?.width ? node?.width : bbox.width) + (labelPaddingX ?? 0);
  const h = node?.height ? node?.height : w + bbox.height;
  const tw = h;
  const points = [
    { x: 0, y: -h },
    { x: tw, y: -h },
    { x: tw / 2, y: 0 }
  ];
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const pathData = createPathFromPoints(points);
  const roughNode = rc.path(pathData, options);
  const flippedTriangle2 = shapeSvg.insert(() => roughNode, ":first-child").attr("transform", `translate(${-h / 2}, ${h / 2})`).attr("class", "outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    flippedTriangle2.selectChildren("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    flippedTriangle2.selectChildren("path").attr("style", nodeStyles);
  }
  node.width = w;
  node.height = h;
  updateNodeBounds(node, flippedTriangle2);
  label.attr("transform", `translate(${-bbox.width / 2 - (bbox.x - (bbox.left ?? 0))}, ${-h / 2 + (node.padding ?? 0) / 2 + (bbox.y - (bbox.top ?? 0))})`);
  node.intersect = function(point) {
    log.info("Triangle intersect", node, points, point);
    return intersect_default.polygon(node, points, point);
  };
  return shapeSvg;
}
__name(flippedTriangle, "flippedTriangle");
function forkJoin(parent, node, { dir, config: { state: state2, themeVariables } }) {
  const { nodeStyles } = styles2String(node);
  node.label = "";
  const shapeSvg = parent.insert("g").attr("class", getNodeClasses(node)).attr("id", node.domId ?? node.id);
  const { cssStyles } = node;
  let width = Math.max(70, node?.width ?? 0);
  let height = Math.max(10, node?.height ?? 0);
  if (dir === "LR") {
    width = Math.max(10, node?.width ?? 0);
    height = Math.max(70, node?.height ?? 0);
  }
  const x = -1 * width / 2;
  const y = -1 * height / 2;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {
    stroke: themeVariables.lineColor,
    fill: themeVariables.lineColor
  });
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const roughNode = rc.rectangle(x, y, width, height, options);
  const shape = shapeSvg.insert(() => roughNode, ":first-child");
  if (cssStyles && node.look !== "handDrawn") {
    shape.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    shape.selectAll("path").attr("style", nodeStyles);
  }
  updateNodeBounds(node, shape);
  const padding = state2?.padding ?? 0;
  if (node.width && node.height) {
    node.width += padding / 2 || 0;
    node.height += padding / 2 || 0;
  }
  node.intersect = function(point) {
    return intersect_default.rect(node, point);
  };
  return shapeSvg;
}
__name(forkJoin, "forkJoin");
async function halfRoundedRectangle(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const minWidth = 15, minHeight = 10;
  const paddingX = node.look === "neo" ? 16 : node.padding ?? 0;
  const paddingY = node.look === "neo" ? 12 : node.padding ?? 0;
  if (node.width || node.height) {
    node.height = (node?.height ?? 0) - paddingY * 2;
    if (node.height < minHeight) {
      node.height = minHeight;
    }
    node.width = (node?.width ?? 0) - paddingX * 2;
    if (node.width < minWidth) {
      node.width = minWidth;
    }
  }
  const { shapeSvg, bbox } = await labelHelper(parent, node, getNodeClasses(node));
  const w = (node?.width ? node?.width : Math.max(minWidth, bbox.width)) + paddingX * 2;
  const h = (node?.height ? node?.height : Math.max(minHeight, bbox.height)) + paddingY * 2;
  const radius = h / 2;
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const points = [
    { x: -w / 2, y: -h / 2 },
    { x: w / 2 - radius, y: -h / 2 },
    ...generateCirclePoints(-w / 2 + radius, 0, radius, 50, 90, 270),
    { x: w / 2 - radius, y: h / 2 },
    { x: -w / 2, y: h / 2 }
  ];
  const pathData = createPathFromPoints(points);
  const shapeNode = rc.path(pathData, options);
  const polygon = shapeSvg.insert(() => shapeNode, ":first-child");
  polygon.attr("class", "basic label-container outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    polygon.selectChildren("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    polygon.selectChildren("path").attr("style", nodeStyles);
  }
  updateNodeBounds(node, polygon);
  node.intersect = function(point) {
    log.info("Pill intersect", node, { radius, point });
    const pos = intersect_default.polygon(node, points, point);
    return pos;
  };
  return shapeSvg;
}
__name(halfRoundedRectangle, "halfRoundedRectangle");
var createHexagonPathD = /* @__PURE__ */ __name((x, y, width, height, m) => {
  return [
    `M${x + m},${y}`,
    `L${x + width - m},${y}`,
    `L${x + width},${y - height / 2}`,
    `L${x + width - m},${y - height}`,
    `L${x + m},${y - height}`,
    `L${x},${y - height / 2}`,
    "Z"
  ].join(" ");
}, "createHexagonPathD");
async function hexagon(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  const f = node.look === "neo" ? 3.5 : 4;
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const wa = 70;
  const ha = 32;
  const labelPaddingX = node.look === "neo" ? wa : nodePadding;
  const labelPaddingY = node.look === "neo" ? ha : nodePadding;
  if (node.width || node.height) {
    const originalHeight = node.height ?? 0;
    const m2 = originalHeight / f;
    node.width = (node?.width ?? 0) - 2 * m2 - labelPaddingY;
    node.height = (node.height ?? 0) - labelPaddingX;
  }
  const { shapeSvg, bbox } = await labelHelper(parent, node, getNodeClasses(node));
  const h = (node?.height ? node?.height : bbox.height) + labelPaddingX;
  const m = h / f;
  const w = (node?.width ? node?.width : bbox.width) + 2 * m + labelPaddingY;
  const points = [
    { x: m, y: 0 },
    { x: w - m, y: 0 },
    { x: w, y: -h / 2 },
    { x: w - m, y: -h },
    { x: m, y: -h },
    { x: 0, y: -h / 2 }
  ];
  let polygon;
  const { cssStyles } = node;
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const options = userNodeOverrides(node, {});
    const pathData = createHexagonPathD(0, 0, w, h, m);
    const roughNode = rc.path(pathData, options);
    polygon = shapeSvg.insert(() => roughNode, ":first-child").attr("transform", `translate(${-w / 2}, ${h / 2})`);
    if (cssStyles) {
      polygon.attr("style", cssStyles);
    }
  } else {
    polygon = insertPolygonShape(shapeSvg, w, h, points);
  }
  if (nodeStyles) {
    polygon.attr("style", nodeStyles);
  }
  node.width = w;
  node.height = h;
  updateNodeBounds(node, polygon);
  node.intersect = function(point) {
    return intersect_default.polygon(node, points, point);
  };
  return shapeSvg;
}
__name(hexagon, "hexagon");
async function hourglass(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.label = "";
  node.labelStyle = labelStyles;
  const { shapeSvg } = await labelHelper(parent, node, getNodeClasses(node));
  const w = Math.max(30, node?.width ?? 0);
  const h = Math.max(30, node?.height ?? 0);
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const points = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: 0, y: h },
    { x: w, y: h }
  ];
  const pathData = createPathFromPoints(points);
  const shapeNode = rc.path(pathData, options);
  const polygon = shapeSvg.insert(() => shapeNode, ":first-child");
  polygon.attr("class", "basic label-container outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    polygon.selectChildren("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    polygon.selectChildren("path").attr("style", nodeStyles);
  }
  polygon.attr("transform", `translate(${-w / 2}, ${-h / 2})`);
  updateNodeBounds(node, polygon);
  node.intersect = function(point) {
    log.info("Pill intersect", node, { points });
    const pos = intersect_default.polygon(node, points, point);
    return pos;
  };
  return shapeSvg;
}
__name(hourglass, "hourglass");
async function icon(parent, node, { config: { themeVariables, flowchart } }) {
  const { labelStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const assetHeight = node.assetHeight ?? 48;
  const assetWidth = node.assetWidth ?? 48;
  const iconSize = Math.max(assetHeight, assetWidth);
  const defaultWidth = flowchart?.wrappingWidth;
  node.width = Math.max(iconSize, defaultWidth ?? 0);
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, "icon-shape default");
  const topLabel = node.pos === "t";
  const height = iconSize;
  const width = iconSize;
  const { nodeBorder } = themeVariables;
  const { stylesMap } = compileStyles(node);
  const x = -width / 2;
  const y = -height / 2;
  const labelPadding = node.label ? 8 : 0;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, { stroke: "none", fill: "none" });
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const iconNode = rc.rectangle(x, y, width, height, options);
  const outerWidth = Math.max(width, bbox.width);
  const outerHeight = height + bbox.height + labelPadding;
  const outerNode = rc.rectangle(-outerWidth / 2, -outerHeight / 2, outerWidth, outerHeight, {
    ...options,
    fill: "transparent",
    stroke: "none"
  });
  const iconShape = shapeSvg.insert(() => iconNode, ":first-child");
  const outerShape = shapeSvg.insert(() => outerNode);
  if (node.icon) {
    const iconElem = shapeSvg.append("g");
    iconElem.html(`<g>${await getIconSVG(node.icon, {
      height: iconSize,
      width: iconSize,
      fallbackPrefix: ""
    })}</g>`);
    const iconBBox = iconElem.node().getBBox();
    const iconWidth = iconBBox.width;
    const iconHeight = iconBBox.height;
    const iconX = iconBBox.x;
    const iconY = iconBBox.y;
    iconElem.attr("transform", `translate(${-iconWidth / 2 - iconX},${topLabel ? bbox.height / 2 + labelPadding / 2 - iconHeight / 2 - iconY : -bbox.height / 2 - labelPadding / 2 - iconHeight / 2 - iconY})`);
    iconElem.attr("style", `color: ${stylesMap.get("stroke") ?? nodeBorder};`);
  }
  label.attr("transform", `translate(${-bbox.width / 2 - (bbox.x - (bbox.left ?? 0))},${topLabel ? -outerHeight / 2 : outerHeight / 2 - bbox.height})`);
  iconShape.attr("transform", `translate(${0},${topLabel ? bbox.height / 2 + labelPadding / 2 : -bbox.height / 2 - labelPadding / 2})`);
  updateNodeBounds(node, outerShape);
  node.intersect = function(point) {
    log.info("iconSquare intersect", node, point);
    if (!node.label) {
      return intersect_default.rect(node, point);
    }
    const dx = node.x ?? 0;
    const dy = node.y ?? 0;
    const nodeHeight = node.height ?? 0;
    let points = [];
    if (topLabel) {
      points = [
        { x: dx - bbox.width / 2, y: dy - nodeHeight / 2 },
        { x: dx + bbox.width / 2, y: dy - nodeHeight / 2 },
        { x: dx + bbox.width / 2, y: dy - nodeHeight / 2 + bbox.height + labelPadding },
        { x: dx + width / 2, y: dy - nodeHeight / 2 + bbox.height + labelPadding },
        { x: dx + width / 2, y: dy + nodeHeight / 2 },
        { x: dx - width / 2, y: dy + nodeHeight / 2 },
        { x: dx - width / 2, y: dy - nodeHeight / 2 + bbox.height + labelPadding },
        { x: dx - bbox.width / 2, y: dy - nodeHeight / 2 + bbox.height + labelPadding }
      ];
    } else {
      points = [
        { x: dx - width / 2, y: dy - nodeHeight / 2 },
        { x: dx + width / 2, y: dy - nodeHeight / 2 },
        { x: dx + width / 2, y: dy - nodeHeight / 2 + height },
        { x: dx + bbox.width / 2, y: dy - nodeHeight / 2 + height },
        { x: dx + bbox.width / 2 / 2, y: dy + nodeHeight / 2 },
        { x: dx - bbox.width / 2, y: dy + nodeHeight / 2 },
        { x: dx - bbox.width / 2, y: dy - nodeHeight / 2 + height },
        { x: dx - width / 2, y: dy - nodeHeight / 2 + height }
      ];
    }
    const pos = intersect_default.polygon(node, points, point);
    return pos;
  };
  return shapeSvg;
}
__name(icon, "icon");
async function iconCircle(parent, node, { config: { themeVariables, flowchart } }) {
  const { labelStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const assetHeight = node.assetHeight ?? 48;
  const assetWidth = node.assetWidth ?? 48;
  const iconSize = Math.max(assetHeight, assetWidth);
  const defaultWidth = flowchart?.wrappingWidth;
  node.width = Math.max(iconSize, defaultWidth ?? 0);
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, "icon-shape default");
  const padding = 20;
  const labelPadding = node.label ? 8 : 0;
  const topLabel = node.pos === "t";
  const { nodeBorder, mainBkg } = themeVariables;
  const { stylesMap } = compileStyles(node);
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const fill = stylesMap.get("fill");
  options.stroke = fill ?? mainBkg;
  const iconElem = shapeSvg.append("g");
  if (node.icon) {
    iconElem.html(`<g>${await getIconSVG(node.icon, {
      height: iconSize,
      width: iconSize,
      fallbackPrefix: ""
    })}</g>`);
  }
  const iconBBox = iconElem.node().getBBox();
  const iconWidth = iconBBox.width;
  const iconHeight = iconBBox.height;
  const iconX = iconBBox.x;
  const iconY = iconBBox.y;
  const diameter = Math.max(iconWidth, iconHeight) * Math.SQRT2 + padding * 2;
  const iconNode = rc.circle(0, 0, diameter, options);
  const outerWidth = Math.max(diameter, bbox.width);
  const outerHeight = diameter + bbox.height + labelPadding;
  const outerNode = rc.rectangle(-outerWidth / 2, -outerHeight / 2, outerWidth, outerHeight, {
    ...options,
    fill: "transparent",
    stroke: "none"
  });
  const iconShape = shapeSvg.insert(() => iconNode, ":first-child");
  const outerShape = shapeSvg.insert(() => outerNode);
  iconElem.attr("transform", `translate(${-iconWidth / 2 - iconX},${topLabel ? bbox.height / 2 + labelPadding / 2 - iconHeight / 2 - iconY : -bbox.height / 2 - labelPadding / 2 - iconHeight / 2 - iconY})`);
  iconElem.attr("style", `color: ${stylesMap.get("stroke") ?? nodeBorder};`);
  label.attr("transform", `translate(${-bbox.width / 2 - (bbox.x - (bbox.left ?? 0))},${topLabel ? -outerHeight / 2 : outerHeight / 2 - bbox.height})`);
  iconShape.attr("transform", `translate(${0},${topLabel ? bbox.height / 2 + labelPadding / 2 : -bbox.height / 2 - labelPadding / 2})`);
  updateNodeBounds(node, outerShape);
  node.intersect = function(point) {
    log.info("iconSquare intersect", node, point);
    const pos = intersect_default.rect(node, point);
    return pos;
  };
  return shapeSvg;
}
__name(iconCircle, "iconCircle");
async function iconRounded(parent, node, { config: { themeVariables, flowchart } }) {
  const { labelStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const assetHeight = node.assetHeight ?? 48;
  const assetWidth = node.assetWidth ?? 48;
  const iconSize = Math.max(assetHeight, assetWidth);
  const defaultWidth = flowchart?.wrappingWidth;
  node.width = Math.max(iconSize, defaultWidth ?? 0);
  const { shapeSvg, bbox, halfPadding, label } = await labelHelper(parent, node, "icon-shape default");
  const topLabel = node.pos === "t";
  const height = iconSize + halfPadding * 2;
  const width = iconSize + halfPadding * 2;
  const { nodeBorder, mainBkg } = themeVariables;
  const { stylesMap } = compileStyles(node);
  const x = -width / 2;
  const y = -height / 2;
  const labelPadding = node.label ? 8 : 0;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const fill = stylesMap.get("fill");
  options.stroke = fill ?? mainBkg;
  const iconNode = rc.path(createRoundedRectPathD(x, y, width, height, 5), options);
  const outerWidth = Math.max(width, bbox.width);
  const outerHeight = height + bbox.height + labelPadding;
  const outerNode = rc.rectangle(-outerWidth / 2, -outerHeight / 2, outerWidth, outerHeight, {
    ...options,
    fill: "transparent",
    stroke: "none"
  });
  const iconShape = shapeSvg.insert(() => iconNode, ":first-child").attr("class", "icon-shape2");
  const outerShape = shapeSvg.insert(() => outerNode);
  if (node.icon) {
    const iconElem = shapeSvg.append("g");
    iconElem.html(`<g>${await getIconSVG(node.icon, {
      height: iconSize,
      width: iconSize,
      fallbackPrefix: ""
    })}</g>`);
    const iconBBox = iconElem.node().getBBox();
    const iconWidth = iconBBox.width;
    const iconHeight = iconBBox.height;
    const iconX = iconBBox.x;
    const iconY = iconBBox.y;
    iconElem.attr("transform", `translate(${-iconWidth / 2 - iconX},${topLabel ? bbox.height / 2 + labelPadding / 2 - iconHeight / 2 - iconY : -bbox.height / 2 - labelPadding / 2 - iconHeight / 2 - iconY})`);
    iconElem.attr("style", `color: ${stylesMap.get("stroke") ?? nodeBorder};`);
  }
  label.attr("transform", `translate(${-bbox.width / 2 - (bbox.x - (bbox.left ?? 0))},${topLabel ? -outerHeight / 2 : outerHeight / 2 - bbox.height})`);
  iconShape.attr("transform", `translate(${0},${topLabel ? bbox.height / 2 + labelPadding / 2 : -bbox.height / 2 - labelPadding / 2})`);
  updateNodeBounds(node, outerShape);
  node.intersect = function(point) {
    log.info("iconSquare intersect", node, point);
    if (!node.label) {
      return intersect_default.rect(node, point);
    }
    const dx = node.x ?? 0;
    const dy = node.y ?? 0;
    const nodeHeight = node.height ?? 0;
    let points = [];
    if (topLabel) {
      points = [
        { x: dx - bbox.width / 2, y: dy - nodeHeight / 2 },
        { x: dx + bbox.width / 2, y: dy - nodeHeight / 2 },
        { x: dx + bbox.width / 2, y: dy - nodeHeight / 2 + bbox.height + labelPadding },
        { x: dx + width / 2, y: dy - nodeHeight / 2 + bbox.height + labelPadding },
        { x: dx + width / 2, y: dy + nodeHeight / 2 },
        { x: dx - width / 2, y: dy + nodeHeight / 2 },
        { x: dx - width / 2, y: dy - nodeHeight / 2 + bbox.height + labelPadding },
        { x: dx - bbox.width / 2, y: dy - nodeHeight / 2 + bbox.height + labelPadding }
      ];
    } else {
      points = [
        { x: dx - width / 2, y: dy - nodeHeight / 2 },
        { x: dx + width / 2, y: dy - nodeHeight / 2 },
        { x: dx + width / 2, y: dy - nodeHeight / 2 + height },
        { x: dx + bbox.width / 2, y: dy - nodeHeight / 2 + height },
        { x: dx + bbox.width / 2 / 2, y: dy + nodeHeight / 2 },
        { x: dx - bbox.width / 2, y: dy + nodeHeight / 2 },
        { x: dx - bbox.width / 2, y: dy - nodeHeight / 2 + height },
        { x: dx - width / 2, y: dy - nodeHeight / 2 + height }
      ];
    }
    const pos = intersect_default.polygon(node, points, point);
    return pos;
  };
  return shapeSvg;
}
__name(iconRounded, "iconRounded");
async function iconSquare(parent, node, { config: { themeVariables, flowchart } }) {
  const { labelStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const assetHeight = node.assetHeight ?? 48;
  const assetWidth = node.assetWidth ?? 48;
  const iconSize = Math.max(assetHeight, assetWidth);
  const defaultWidth = flowchart?.wrappingWidth;
  node.width = Math.max(iconSize, defaultWidth ?? 0);
  const { shapeSvg, bbox, halfPadding, label } = await labelHelper(parent, node, "icon-shape default");
  const topLabel = node.pos === "t";
  const height = iconSize + halfPadding * 2;
  const width = iconSize + halfPadding * 2;
  const { nodeBorder, mainBkg } = themeVariables;
  const { stylesMap } = compileStyles(node);
  const x = -width / 2;
  const y = -height / 2;
  const labelPadding = node.label ? 8 : 0;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const fill = stylesMap.get("fill");
  options.stroke = fill ?? mainBkg;
  const iconNode = rc.path(createRoundedRectPathD(x, y, width, height, 0.1), options);
  const outerWidth = Math.max(width, bbox.width);
  const outerHeight = height + bbox.height + labelPadding;
  const outerNode = rc.rectangle(-outerWidth / 2, -outerHeight / 2, outerWidth, outerHeight, {
    ...options,
    fill: "transparent",
    stroke: "none"
  });
  const iconShape = shapeSvg.insert(() => iconNode, ":first-child");
  const outerShape = shapeSvg.insert(() => outerNode);
  if (node.icon) {
    const iconElem = shapeSvg.append("g");
    iconElem.html(`<g>${await getIconSVG(node.icon, {
      height: iconSize,
      width: iconSize,
      fallbackPrefix: ""
    })}</g>`);
    const iconBBox = iconElem.node().getBBox();
    const iconWidth = iconBBox.width;
    const iconHeight = iconBBox.height;
    const iconX = iconBBox.x;
    const iconY = iconBBox.y;
    iconElem.attr("transform", `translate(${-iconWidth / 2 - iconX},${topLabel ? bbox.height / 2 + labelPadding / 2 - iconHeight / 2 - iconY : -bbox.height / 2 - labelPadding / 2 - iconHeight / 2 - iconY})`);
    iconElem.attr("style", `color: ${stylesMap.get("stroke") ?? nodeBorder};`);
  }
  label.attr("transform", `translate(${-bbox.width / 2 - (bbox.x - (bbox.left ?? 0))},${topLabel ? -outerHeight / 2 : outerHeight / 2 - bbox.height})`);
  iconShape.attr("transform", `translate(${0},${topLabel ? bbox.height / 2 + labelPadding / 2 : -bbox.height / 2 - labelPadding / 2})`);
  updateNodeBounds(node, outerShape);
  node.intersect = function(point) {
    log.info("iconSquare intersect", node, point);
    if (!node.label) {
      return intersect_default.rect(node, point);
    }
    const dx = node.x ?? 0;
    const dy = node.y ?? 0;
    const nodeHeight = node.height ?? 0;
    let points = [];
    if (topLabel) {
      points = [
        { x: dx - bbox.width / 2, y: dy - nodeHeight / 2 },
        { x: dx + bbox.width / 2, y: dy - nodeHeight / 2 },
        { x: dx + bbox.width / 2, y: dy - nodeHeight / 2 + bbox.height + labelPadding },
        { x: dx + width / 2, y: dy - nodeHeight / 2 + bbox.height + labelPadding },
        { x: dx + width / 2, y: dy + nodeHeight / 2 },
        { x: dx - width / 2, y: dy + nodeHeight / 2 },
        { x: dx - width / 2, y: dy - nodeHeight / 2 + bbox.height + labelPadding },
        { x: dx - bbox.width / 2, y: dy - nodeHeight / 2 + bbox.height + labelPadding }
      ];
    } else {
      points = [
        { x: dx - width / 2, y: dy - nodeHeight / 2 },
        { x: dx + width / 2, y: dy - nodeHeight / 2 },
        { x: dx + width / 2, y: dy - nodeHeight / 2 + height },
        { x: dx + bbox.width / 2, y: dy - nodeHeight / 2 + height },
        { x: dx + bbox.width / 2 / 2, y: dy + nodeHeight / 2 },
        { x: dx - bbox.width / 2, y: dy + nodeHeight / 2 },
        { x: dx - bbox.width / 2, y: dy - nodeHeight / 2 + height },
        { x: dx - width / 2, y: dy - nodeHeight / 2 + height }
      ];
    }
    const pos = intersect_default.polygon(node, points, point);
    return pos;
  };
  return shapeSvg;
}
__name(iconSquare, "iconSquare");
async function imageSquare(parent, node, { config: { flowchart } }) {
  const img = new Image;
  img.src = node?.img ?? "";
  await img.decode();
  const imageNaturalWidth = Number(img.naturalWidth.toString().replace("px", ""));
  const imageNaturalHeight = Number(img.naturalHeight.toString().replace("px", ""));
  node.imageAspectRatio = imageNaturalWidth / imageNaturalHeight;
  const { labelStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const defaultWidth = flowchart?.wrappingWidth;
  node.defaultWidth = flowchart?.wrappingWidth;
  const imageRawWidth = Math.max(node.label ? defaultWidth ?? 0 : 0, node?.assetWidth ?? imageNaturalWidth);
  const imageWidth = node.constraint === "on" ? node?.assetHeight ? node.assetHeight * node.imageAspectRatio : imageRawWidth : imageRawWidth;
  const imageHeight = node.constraint === "on" ? imageWidth / node.imageAspectRatio : node?.assetHeight ?? imageNaturalHeight;
  node.width = Math.max(imageWidth, defaultWidth ?? 0);
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, "image-shape default");
  const topLabel = node.pos === "t";
  const x = -imageWidth / 2;
  const y = -imageHeight / 2;
  const labelPadding = node.label ? 8 : 0;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const imageNode = rc.rectangle(x, y, imageWidth, imageHeight, options);
  const outerWidth = Math.max(imageWidth, bbox.width);
  const outerHeight = imageHeight + bbox.height + labelPadding;
  const outerNode = rc.rectangle(-outerWidth / 2, -outerHeight / 2, outerWidth, outerHeight, {
    ...options,
    fill: "none",
    stroke: "none"
  });
  const iconShape = shapeSvg.insert(() => imageNode, ":first-child");
  const outerShape = shapeSvg.insert(() => outerNode);
  if (node.img) {
    const image = shapeSvg.append("image");
    image.attr("href", node.img);
    image.attr("width", imageWidth);
    image.attr("height", imageHeight);
    image.attr("preserveAspectRatio", "none");
    image.attr("transform", `translate(${-imageWidth / 2},${topLabel ? outerHeight / 2 - imageHeight : -outerHeight / 2})`);
  }
  label.attr("transform", `translate(${-bbox.width / 2 - (bbox.x - (bbox.left ?? 0))},${topLabel ? -imageHeight / 2 - bbox.height / 2 - labelPadding / 2 : imageHeight / 2 - bbox.height / 2 + labelPadding / 2})`);
  iconShape.attr("transform", `translate(${0},${topLabel ? bbox.height / 2 + labelPadding / 2 : -bbox.height / 2 - labelPadding / 2})`);
  updateNodeBounds(node, outerShape);
  node.intersect = function(point) {
    log.info("iconSquare intersect", node, point);
    if (!node.label) {
      return intersect_default.rect(node, point);
    }
    const dx = node.x ?? 0;
    const dy = node.y ?? 0;
    const nodeHeight = node.height ?? 0;
    let points = [];
    if (topLabel) {
      points = [
        { x: dx - bbox.width / 2, y: dy - nodeHeight / 2 },
        { x: dx + bbox.width / 2, y: dy - nodeHeight / 2 },
        { x: dx + bbox.width / 2, y: dy - nodeHeight / 2 + bbox.height + labelPadding },
        { x: dx + imageWidth / 2, y: dy - nodeHeight / 2 + bbox.height + labelPadding },
        { x: dx + imageWidth / 2, y: dy + nodeHeight / 2 },
        { x: dx - imageWidth / 2, y: dy + nodeHeight / 2 },
        { x: dx - imageWidth / 2, y: dy - nodeHeight / 2 + bbox.height + labelPadding },
        { x: dx - bbox.width / 2, y: dy - nodeHeight / 2 + bbox.height + labelPadding }
      ];
    } else {
      points = [
        { x: dx - imageWidth / 2, y: dy - nodeHeight / 2 },
        { x: dx + imageWidth / 2, y: dy - nodeHeight / 2 },
        { x: dx + imageWidth / 2, y: dy - nodeHeight / 2 + imageHeight },
        { x: dx + bbox.width / 2, y: dy - nodeHeight / 2 + imageHeight },
        { x: dx + bbox.width / 2 / 2, y: dy + nodeHeight / 2 },
        { x: dx - bbox.width / 2, y: dy + nodeHeight / 2 },
        { x: dx - bbox.width / 2, y: dy - nodeHeight / 2 + imageHeight },
        { x: dx - imageWidth / 2, y: dy - nodeHeight / 2 + imageHeight }
      ];
    }
    const pos = intersect_default.polygon(node, points, point);
    return pos;
  };
  return shapeSvg;
}
__name(imageSquare, "imageSquare");
async function inv_trapezoid(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingY = nodePadding;
  const labelPaddingX = node.look === "neo" ? nodePadding * 2 : nodePadding;
  const { shapeSvg, bbox } = await labelHelper(parent, node, getNodeClasses(node));
  const w = Math.max(bbox.width + (labelPaddingX ?? 0) * 2, node?.width ?? 0);
  const h = Math.max(bbox.height + (labelPaddingY ?? 0) * 2, node?.height ?? 0);
  const points = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w + 3 * h / 6, y: -h },
    { x: -3 * h / 6, y: -h }
  ];
  let polygon;
  const { cssStyles } = node;
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const options = userNodeOverrides(node, {});
    const pathData = createPathFromPoints(points);
    const roughNode = rc.path(pathData, options);
    polygon = shapeSvg.insert(() => roughNode, ":first-child").attr("transform", `translate(${-w / 2}, ${h / 2})`);
    if (cssStyles) {
      polygon.attr("style", cssStyles);
    }
  } else {
    polygon = insertPolygonShape(shapeSvg, w, h, points);
  }
  if (nodeStyles) {
    polygon.attr("style", nodeStyles);
  }
  node.width = w;
  node.height = h;
  updateNodeBounds(node, polygon);
  node.intersect = function(point) {
    return intersect_default.polygon(node, points, point);
  };
  return shapeSvg;
}
__name(inv_trapezoid, "inv_trapezoid");
async function labelRect(parent, node) {
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, "label");
  const rect2 = shapeSvg.insert("rect", ":first-child");
  const totalWidth = 0.1;
  const totalHeight = 0.1;
  rect2.attr("width", totalWidth).attr("height", totalHeight);
  shapeSvg.attr("class", "label edgeLabel");
  label.attr("transform", `translate(${-(bbox.width / 2) - (bbox.x - (bbox.left ?? 0))}, ${-(bbox.height / 2) - (bbox.y - (bbox.top ?? 0))})`);
  updateNodeBounds(node, rect2);
  node.intersect = function(point) {
    return intersect_default.rect(node, point);
  };
  return shapeSvg;
}
__name(labelRect, "labelRect");
async function lean_left(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingY = nodePadding;
  const labelPaddingX = node.look === "neo" ? nodePadding * 2 : nodePadding;
  const { shapeSvg, bbox } = await labelHelper(parent, node, getNodeClasses(node));
  const h = (node?.height ?? bbox.height) + labelPaddingY;
  const w = (node?.width ?? bbox.width) + labelPaddingX;
  const points = [
    { x: 0, y: 0 },
    { x: w + 3 * h / 6, y: 0 },
    { x: w, y: -h },
    { x: -(3 * h) / 6, y: -h }
  ];
  let polygon;
  const { cssStyles } = node;
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const options = userNodeOverrides(node, {});
    const pathData = createPathFromPoints(points);
    const roughNode = rc.path(pathData, options);
    polygon = shapeSvg.insert(() => roughNode, ":first-child").attr("transform", `translate(${-w / 2}, ${h / 2})`);
    if (cssStyles) {
      polygon.attr("style", cssStyles);
    }
  } else {
    polygon = insertPolygonShape(shapeSvg, w, h, points);
  }
  if (nodeStyles) {
    polygon.attr("style", nodeStyles);
  }
  node.width = w;
  node.height = h;
  updateNodeBounds(node, polygon);
  node.intersect = function(point) {
    return intersect_default.polygon(node, points, point);
  };
  return shapeSvg;
}
__name(lean_left, "lean_left");
async function lean_right(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingY = nodePadding;
  const labelPaddingX = node.look === "neo" ? nodePadding * 2 : nodePadding;
  const { shapeSvg, bbox } = await labelHelper(parent, node, getNodeClasses(node));
  const h = (node?.height ?? bbox.height) + labelPaddingY;
  const w = (node?.width ?? bbox.width) + labelPaddingX;
  const points = [
    { x: -3 * h / 6, y: 0 },
    { x: w, y: 0 },
    { x: w + 3 * h / 6, y: -h },
    { x: 0, y: -h }
  ];
  let polygon;
  const { cssStyles } = node;
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const options = userNodeOverrides(node, {});
    const pathData = createPathFromPoints(points);
    const roughNode = rc.path(pathData, options);
    polygon = shapeSvg.insert(() => roughNode, ":first-child").attr("transform", `translate(${-w / 2}, ${h / 2})`);
    if (cssStyles) {
      polygon.attr("style", cssStyles);
    }
  } else {
    polygon = insertPolygonShape(shapeSvg, w, h, points);
  }
  if (nodeStyles) {
    polygon.attr("style", nodeStyles);
  }
  node.width = w;
  node.height = h;
  updateNodeBounds(node, polygon);
  node.intersect = function(point) {
    return intersect_default.polygon(node, points, point);
  };
  return shapeSvg;
}
__name(lean_right, "lean_right");
function lightningBolt(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.label = "";
  node.labelStyle = labelStyles;
  const shapeSvg = parent.insert("g").attr("class", getNodeClasses(node)).attr("id", node.domId ?? node.id);
  const { cssStyles } = node;
  const width = Math.max(35, node?.width ?? 0);
  const height = Math.max(35, node?.height ?? 0);
  const gap = 7;
  const points = [
    { x: width, y: 0 },
    { x: 0, y: height + gap / 2 },
    { x: width - 2 * gap, y: height + gap / 2 },
    { x: 0, y: 2 * height },
    { x: width, y: height - gap / 2 },
    { x: 2 * gap, y: height - gap / 2 }
  ];
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const linePath = createPathFromPoints(points);
  const lineNode = rc.path(linePath, options);
  const lightningBolt2 = shapeSvg.insert(() => lineNode, ":first-child");
  lightningBolt2.attr("class", "outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    lightningBolt2.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    lightningBolt2.selectAll("path").attr("style", nodeStyles);
  }
  lightningBolt2.attr("transform", `translate(-${width / 2},${-height})`);
  updateNodeBounds(node, lightningBolt2);
  node.intersect = function(point) {
    log.info("lightningBolt intersect", node, point);
    const pos = intersect_default.polygon(node, points, point);
    return pos;
  };
  return shapeSvg;
}
__name(lightningBolt, "lightningBolt");
var createCylinderPathD2 = /* @__PURE__ */ __name((x, y, width, height, rx, ry, outerOffset) => {
  return [
    `M${x},${y + ry}`,
    `a${rx},${ry} 0,0,0 ${width},0`,
    `a${rx},${ry} 0,0,0 ${-width},0`,
    `l0,${height}`,
    `a${rx},${ry} 0,0,0 ${width},0`,
    `l0,${-height}`,
    `M${x},${y + ry + outerOffset}`,
    `a${rx},${ry} 0,0,0 ${width},0`
  ].join(" ");
}, "createCylinderPathD");
var createOuterCylinderPathD2 = /* @__PURE__ */ __name((x, y, width, height, rx, ry, outerOffset) => {
  return [
    `M${x},${y + ry}`,
    `M${x + width},${y + ry}`,
    `a${rx},${ry} 0,0,0 ${-width},0`,
    `l0,${height}`,
    `a${rx},${ry} 0,0,0 ${width},0`,
    `l0,${-height}`,
    `M${x},${y + ry + outerOffset}`,
    `a${rx},${ry} 0,0,0 ${width},0`
  ].join(" ");
}, "createOuterCylinderPathD");
var createInnerCylinderPathD2 = /* @__PURE__ */ __name((x, y, width, height, rx, ry) => {
  return [`M${x - width / 2},${-height / 2}`, `a${rx},${ry} 0,0,0 ${width},0`].join(" ");
}, "createInnerCylinderPathD");
var MIN_HEIGHT3 = 10;
var MIN_WIDTH3 = 10;
async function linedCylinder(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingX = node.look === "neo" ? 16 : nodePadding;
  const labelPaddingY = node.look === "neo" ? 24 : nodePadding;
  if (node.width || node.height) {
    const originalWidth = node.width ?? 0;
    node.width = (node.width ?? 0) - labelPaddingX;
    if (node.width < MIN_WIDTH3) {
      node.width = MIN_WIDTH3;
    }
    const rx2 = originalWidth / 2;
    const ry2 = rx2 / (2.5 + originalWidth / 50);
    node.height = (node.height ?? 0) - labelPaddingY - ry2 * 3;
    if (node.height < MIN_HEIGHT3) {
      node.height = MIN_HEIGHT3;
    }
  }
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));
  const w = (node?.width ? node?.width : bbox.width) + labelPaddingX * 2;
  const rx = w / 2;
  const ry = rx / (2.5 + w / 50);
  const h = (node?.height ? node?.height : bbox.height) + ry + labelPaddingY * 2;
  const outerOffset = h * 0.1;
  let cylinder2;
  const { cssStyles } = node;
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const outerPathData = createOuterCylinderPathD2(0, 0, w, h, rx, ry, outerOffset);
    const innerPathData = createInnerCylinderPathD2(0, ry, w, h, rx, ry);
    const options = userNodeOverrides(node, {});
    const outerNode = rc.path(outerPathData, options);
    const innerLine = rc.path(innerPathData, options);
    const innerLineEl = shapeSvg.insert(() => innerLine, ":first-child");
    innerLineEl.attr("class", "line");
    cylinder2 = shapeSvg.insert(() => outerNode, ":first-child");
    cylinder2.attr("class", "basic label-container");
    if (cssStyles) {
      cylinder2.attr("style", cssStyles);
    }
  } else {
    const pathData = createCylinderPathD2(0, 0, w, h, rx, ry, outerOffset);
    cylinder2 = shapeSvg.insert("path", ":first-child").attr("d", pathData).attr("class", "basic label-container outer-path").attr("style", handleUndefinedAttr(cssStyles)).attr("style", nodeStyles);
  }
  cylinder2.attr("label-offset-y", ry);
  cylinder2.attr("transform", `translate(${-w / 2}, ${-(h / 2 + ry)})`);
  updateNodeBounds(node, cylinder2);
  label.attr("transform", `translate(${-(bbox.width / 2) - (bbox.x - (bbox.left ?? 0))}, ${-(bbox.height / 2) + ry - (bbox.y - (bbox.top ?? 0))})`);
  node.intersect = function(point) {
    const pos = intersect_default.rect(node, point);
    const x = pos.x - (node.x ?? 0);
    if (rx != 0 && (Math.abs(x) < (node.width ?? 0) / 2 || Math.abs(x) == (node.width ?? 0) / 2 && Math.abs(pos.y - (node.y ?? 0)) > (node.height ?? 0) / 2 - ry)) {
      let y = ry * ry * (1 - x * x / (rx * rx));
      if (y > 0) {
        y = Math.sqrt(y);
      }
      y = ry - y;
      if (point.y - (node.y ?? 0) > 0) {
        y = -y;
      }
      pos.y += y;
    }
    return pos;
  };
  return shapeSvg;
}
__name(linedCylinder, "linedCylinder");
async function linedWaveEdgedRect(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingX = node.look === "neo" ? 16 : nodePadding;
  const labelPaddingY = node.look === "neo" ? 12 : nodePadding;
  if (node.width || node.height) {
    const originalWidth = node.width;
    node.width = (originalWidth ?? 0) * 10 / 11 - labelPaddingX * 2;
    if (node.width < 10) {
      node.width = 10;
    }
    node.height = (node?.height ?? 0) - labelPaddingY * 2;
    if (node.height < 10) {
      node.height = 10;
    }
  }
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));
  const w = (node?.width ? node?.width : bbox.width) + (labelPaddingX ?? 0) * 2;
  const h = (node?.height ? node?.height : bbox.height) + (labelPaddingY ?? 0) * 2;
  const waveAmplitude = node.look === "neo" ? h / 4 : h / 8;
  const finalH = h + waveAmplitude;
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const points = [
    { x: -w / 2 - w / 2 * 0.1, y: -finalH / 2 },
    { x: -w / 2 - w / 2 * 0.1, y: finalH / 2 },
    ...generateFullSineWavePoints(-w / 2 - w / 2 * 0.1, finalH / 2, w / 2 + w / 2 * 0.1, finalH / 2, waveAmplitude, 0.8),
    { x: w / 2 + w / 2 * 0.1, y: -finalH / 2 },
    { x: -w / 2 - w / 2 * 0.1, y: -finalH / 2 },
    { x: -w / 2, y: -finalH / 2 },
    { x: -w / 2, y: finalH / 2 * 1.1 },
    { x: -w / 2, y: -finalH / 2 }
  ];
  const poly = rc.polygon(points.map((p) => [p.x, p.y]), options);
  const waveEdgeRect = shapeSvg.insert(() => poly, ":first-child");
  waveEdgeRect.attr("class", "basic label-container outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    waveEdgeRect.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    waveEdgeRect.selectAll("path").attr("style", nodeStyles);
  }
  waveEdgeRect.attr("transform", `translate(0,${-waveAmplitude / 2})`);
  label.attr("transform", `translate(${-w / 2 + (node.padding ?? 0) + w / 2 * 0.1 / 2 - (bbox.x - (bbox.left ?? 0))},${-h / 2 + (node.padding ?? 0) - waveAmplitude / 2 - (bbox.y - (bbox.top ?? 0))})`);
  updateNodeBounds(node, waveEdgeRect);
  node.intersect = function(point) {
    const pos = intersect_default.polygon(node, points, point);
    return pos;
  };
  return shapeSvg;
}
__name(linedWaveEdgedRect, "linedWaveEdgedRect");
async function multiRect(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingX = node.look === "neo" ? 16 : nodePadding;
  const labelPaddingY = node.look === "neo" ? 12 : nodePadding;
  const rectOffset2 = node.look === "neo" ? 10 : 5;
  if (node.width || node.height) {
    node.width = Math.max((node?.width ?? 0) - labelPaddingX * 2 - 2 * rectOffset2, 10);
    node.height = Math.max((node?.height ?? 0) - labelPaddingY * 2 - 2 * rectOffset2, 10);
  }
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));
  const totalWidth = (node?.width ? node?.width : bbox.width) + labelPaddingX * 2 + 2 * rectOffset2;
  const totalHeight = (node?.height ? node?.height : bbox.height) + labelPaddingY * 2 + 2 * rectOffset2;
  const w = totalWidth - 2 * rectOffset2;
  const h = totalHeight - 2 * rectOffset2;
  const x = -w / 2;
  const y = -h / 2;
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  const outerPathPoints = [
    { x: x - rectOffset2, y: y + rectOffset2 },
    { x: x - rectOffset2, y: y + h + rectOffset2 },
    { x: x + w - rectOffset2, y: y + h + rectOffset2 },
    { x: x + w - rectOffset2, y: y + h },
    { x: x + w, y: y + h },
    { x: x + w, y: y + h - rectOffset2 },
    { x: x + w + rectOffset2, y: y + h - rectOffset2 },
    { x: x + w + rectOffset2, y: y - rectOffset2 },
    { x: x + rectOffset2, y: y - rectOffset2 },
    { x: x + rectOffset2, y },
    { x, y },
    { x, y: y + rectOffset2 }
  ];
  const innerPathPoints = [
    { x, y: y + rectOffset2 },
    { x: x + w - rectOffset2, y: y + rectOffset2 },
    { x: x + w - rectOffset2, y: y + h },
    { x: x + w, y: y + h },
    { x: x + w, y },
    { x, y }
  ];
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const outerPath = createPathFromPoints(outerPathPoints);
  let outerNode = rc.path(outerPath, options);
  const innerPath = createPathFromPoints(innerPathPoints);
  let innerNode = rc.path(innerPath, options);
  if (node.look !== "handDrawn") {
    outerNode = mergePaths(outerNode);
    innerNode = mergePaths(innerNode);
  }
  const multiRect2 = shapeSvg.insert("g", ":first-child");
  multiRect2.insert(() => outerNode);
  multiRect2.insert(() => innerNode);
  multiRect2.attr("class", "basic label-container outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    multiRect2.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    multiRect2.selectAll("path").attr("style", nodeStyles);
  }
  label.attr("transform", `translate(${-(bbox.width / 2) - rectOffset2 - (bbox.x - (bbox.left ?? 0))}, ${-(bbox.height / 2) + rectOffset2 - (bbox.y - (bbox.top ?? 0))})`);
  updateNodeBounds(node, multiRect2);
  node.intersect = function(point) {
    const pos = intersect_default.polygon(node, outerPathPoints, point);
    return pos;
  };
  return shapeSvg;
}
__name(multiRect, "multiRect");
async function multiWaveEdgedRectangle(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));
  const nodePadding = node.padding ?? 0;
  const labelPaddingX = node.look === "neo" ? 16 : nodePadding;
  const labelPaddingY = node.look === "neo" ? 12 : nodePadding;
  let adjustFinalHeight = true;
  if (node.width || node.height) {
    adjustFinalHeight = false;
    node.width = (node?.width ?? 0) - labelPaddingX * 2;
    node.height = (node?.height ?? 0) - labelPaddingY * 3;
  }
  const w = Math.max(bbox.width, node?.width ?? 0) + labelPaddingX * 2;
  const h = Math.max(bbox.height, node?.height ?? 0) + labelPaddingY * 3;
  const waveAmplitude = node.look === "neo" ? h / 4 : h / 8;
  const finalH = h + (adjustFinalHeight ? waveAmplitude / 2 : -waveAmplitude / 2);
  const x = -w / 2;
  const y = -finalH / 2;
  const rectOffset2 = 10;
  const { cssStyles } = node;
  const wavePoints = generateFullSineWavePoints(x - rectOffset2, y + finalH + rectOffset2, x + w - rectOffset2, y + finalH + rectOffset2, waveAmplitude, 0.8);
  const lastWavePoint = wavePoints?.[wavePoints.length - 1];
  const outerPathPoints = [
    { x: x - rectOffset2, y: y + rectOffset2 },
    { x: x - rectOffset2, y: y + finalH + rectOffset2 },
    ...wavePoints,
    { x: x + w - rectOffset2, y: lastWavePoint.y - rectOffset2 },
    { x: x + w, y: lastWavePoint.y - rectOffset2 },
    { x: x + w, y: lastWavePoint.y - 2 * rectOffset2 },
    { x: x + w + rectOffset2, y: lastWavePoint.y - 2 * rectOffset2 },
    { x: x + w + rectOffset2, y: y - rectOffset2 },
    { x: x + rectOffset2, y: y - rectOffset2 },
    { x: x + rectOffset2, y },
    { x, y },
    { x, y: y + rectOffset2 }
  ];
  const innerPathPoints = [
    { x, y: y + rectOffset2 },
    { x: x + w - rectOffset2, y: y + rectOffset2 },
    { x: x + w - rectOffset2, y: lastWavePoint.y - rectOffset2 },
    { x: x + w, y: lastWavePoint.y - rectOffset2 },
    { x: x + w, y },
    { x, y }
  ];
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const outerPath = createPathFromPoints(outerPathPoints);
  const outerNode = rc.path(outerPath, options);
  const innerPath = createPathFromPoints(innerPathPoints);
  const innerNode = rc.path(innerPath, options);
  const shape = shapeSvg.insert(() => outerNode, ":first-child");
  shape.insert(() => innerNode);
  shape.attr("class", "basic label-container outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    shape.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    shape.selectAll("path").attr("style", nodeStyles);
  }
  shape.attr("transform", `translate(0,${-waveAmplitude / 2})`);
  label.attr("transform", `translate(${-(bbox.width / 2) - rectOffset2 - (bbox.x - (bbox.left ?? 0))}, ${-(bbox.height / 2) + rectOffset2 - waveAmplitude / 2 - (bbox.y - (bbox.top ?? 0))})`);
  updateNodeBounds(node, shape);
  node.intersect = function(point) {
    const pos = intersect_default.polygon(node, outerPathPoints, point);
    return pos;
  };
  return shapeSvg;
}
__name(multiWaveEdgedRectangle, "multiWaveEdgedRectangle");
async function note(parent, node, { config: { themeVariables } }) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const useHtmlLabels = node.useHtmlLabels || getEffectiveHtmlLabels(getConfig());
  if (!useHtmlLabels) {
    node.centerLabel = true;
  }
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));
  const totalWidth = Math.max(bbox.width + (node.padding ?? 0) * 2, node?.width ?? 0);
  const totalHeight = Math.max(bbox.height + (node.padding ?? 0) * 2, node?.height ?? 0);
  const x = -totalWidth / 2;
  const y = -totalHeight / 2;
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {
    fill: themeVariables.noteBkgColor,
    stroke: themeVariables.noteBorderColor
  });
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const noteShapeNode = rc.rectangle(x, y, totalWidth, totalHeight, options);
  const rect2 = shapeSvg.insert(() => noteShapeNode, ":first-child");
  rect2.attr("class", "basic label-container outer-path");
  label.attr("class", "label noteLabel");
  if (cssStyles && node.look !== "handDrawn") {
    rect2.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    rect2.selectAll("path").attr("style", nodeStyles);
  }
  label.attr("transform", `translate(${-bbox.width / 2 - (bbox.x - (bbox.left ?? 0))}, ${-(bbox.height / 2) - (bbox.y - (bbox.top ?? 0))})`);
  updateNodeBounds(node, rect2);
  node.intersect = function(point) {
    return intersect_default.rect(node, point);
  };
  return shapeSvg;
}
__name(note, "note");
var createDecisionBoxPathD = /* @__PURE__ */ __name((x, y, size) => {
  return [
    `M${x + size / 2},${y}`,
    `L${x + size},${y - size / 2}`,
    `L${x + size / 2},${y - size}`,
    `L${x},${y - size / 2}`,
    "Z"
  ].join(" ");
}, "createDecisionBoxPathD");
async function question(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const { shapeSvg, bbox } = await labelHelper(parent, node, getNodeClasses(node));
  const w = bbox.width + (node.padding ?? 0);
  const h = bbox.height + (node.padding ?? 0);
  const s = w + h;
  const adjustment = 0.5;
  const points = [
    { x: s / 2, y: 0 },
    { x: s, y: -s / 2 },
    { x: s / 2, y: -s },
    { x: 0, y: -s / 2 }
  ];
  let polygon;
  const { cssStyles } = node;
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const options = userNodeOverrides(node, {});
    const pathData = createDecisionBoxPathD(0, 0, s);
    const roughNode = rc.path(pathData, options);
    polygon = shapeSvg.insert(() => roughNode, ":first-child").attr("transform", `translate(${-s / 2 + adjustment}, ${s / 2})`);
    if (cssStyles) {
      polygon.attr("style", cssStyles);
    }
  } else {
    polygon = insertPolygonShape(shapeSvg, s, s, points);
    polygon.attr("transform", `translate(${-s / 2 + adjustment}, ${s / 2})`);
  }
  if (nodeStyles) {
    polygon.attr("style", nodeStyles);
  }
  updateNodeBounds(node, polygon);
  node.calcIntersect = function(bounds, point) {
    const s2 = bounds.width;
    const points2 = [
      { x: s2 / 2, y: 0 },
      { x: s2, y: -s2 / 2 },
      { x: s2 / 2, y: -s2 },
      { x: 0, y: -s2 / 2 }
    ];
    const res = intersect_default.polygon(bounds, points2, point);
    return { x: res.x - 0.5, y: res.y - 0.5 };
  };
  node.intersect = function(point) {
    return this.calcIntersect(node, point);
  };
  return shapeSvg;
}
__name(question, "question");
async function rect_left_inv_arrow(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingX = node.look === "neo" ? 21 : nodePadding ?? 0;
  const labelPaddingY = node.look === "neo" ? 12 : nodePadding ?? 0;
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));
  const w = (node?.width ?? bbox.width) + (node.look === "neo" ? labelPaddingX * 2 : labelPaddingX);
  const h = (node?.height ?? bbox.height) + (node.look === "neo" ? labelPaddingY * 2 : labelPaddingY);
  const x = -w / 2;
  const y = -h / 2;
  const notch = y / 2;
  const points = [
    { x: x + notch, y },
    { x, y: 0 },
    { x: x + notch, y: -y },
    { x: -x, y: -y },
    { x: -x, y }
  ];
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const pathData = createPathFromPoints(points);
  const roughNode = rc.path(pathData, options);
  const polygon = shapeSvg.insert(() => roughNode, ":first-child");
  polygon.attr("class", "basic label-container outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    polygon.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    polygon.selectAll("path").attr("style", nodeStyles);
  }
  polygon.attr("transform", `translate(${-notch / 2},0)`);
  label.attr("transform", `translate(${-notch / 2 - bbox.width / 2 - (bbox.x - (bbox.left ?? 0))}, ${-(bbox.height / 2) - (bbox.y - (bbox.top ?? 0))})`);
  updateNodeBounds(node, polygon);
  node.intersect = function(point) {
    return intersect_default.polygon(node, points, point);
  };
  return shapeSvg;
}
__name(rect_left_inv_arrow, "rect_left_inv_arrow");
async function rectWithTitle(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  let classes;
  if (!node.cssClasses) {
    classes = "node default";
  } else {
    classes = "node " + node.cssClasses;
  }
  const shapeSvg = parent.insert("g").attr("class", classes).attr("id", node.domId || node.id);
  const g = shapeSvg.insert("g");
  const label = shapeSvg.insert("g").attr("class", "label").attr("style", nodeStyles);
  const description = node.description;
  const title = node.label;
  const text2 = await createLabel_default(label, title, node.labelStyle, true, true);
  let bbox = { width: 0, height: 0 };
  if (getEffectiveHtmlLabels(getConfig2())) {
    const div2 = text2.children[0];
    const dv2 = select_default(text2);
    bbox = div2.getBoundingClientRect();
    dv2.attr("width", bbox.width);
    dv2.attr("height", bbox.height);
  }
  log.info("Text 2", description);
  const textRows = description || [];
  const titleBox = text2.getBBox();
  const descr = await createLabel_default(label, Array.isArray(textRows) ? textRows.join("<br/>") : textRows, node.labelStyle, true, true);
  const div = descr.children[0];
  const dv = select_default(descr);
  bbox = div.getBoundingClientRect();
  dv.attr("width", bbox.width);
  dv.attr("height", bbox.height);
  const halfPadding = (node.padding || 0) / 2;
  select_default(descr).attr("transform", "translate( " + (bbox.width > titleBox.width ? 0 : (titleBox.width - bbox.width) / 2) + ", " + (titleBox.height + halfPadding + 5) + ")");
  select_default(text2).attr("transform", "translate( " + (bbox.width < titleBox.width ? 0 : -(titleBox.width - bbox.width) / 2) + ", 0)");
  bbox = label.node().getBBox();
  label.attr("transform", "translate(" + -bbox.width / 2 + ", " + (-bbox.height / 2 - halfPadding + 3) + ")");
  const totalWidth = bbox.width + (node.padding || 0);
  const totalHeight = bbox.height + (node.padding || 0);
  const x = -bbox.width / 2 - halfPadding;
  const y = -bbox.height / 2 - halfPadding;
  let rect2;
  let innerLine;
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const options = userNodeOverrides(node, {});
    const roughNode = rc.path(createRoundedRectPathD(x, y, totalWidth, totalHeight, node.rx || 0), options);
    const roughLine = rc.line(-bbox.width / 2 - halfPadding, -bbox.height / 2 - halfPadding + titleBox.height + halfPadding, bbox.width / 2 + halfPadding, -bbox.height / 2 - halfPadding + titleBox.height + halfPadding, options);
    innerLine = shapeSvg.insert(() => {
      log.debug("Rough node insert CXC", roughNode);
      return roughLine;
    }, ":first-child");
    rect2 = shapeSvg.insert(() => {
      log.debug("Rough node insert CXC", roughNode);
      return roughNode;
    }, ":first-child");
  } else {
    rect2 = g.insert("rect", ":first-child");
    innerLine = g.insert("line");
    rect2.attr("class", "outer title-state").attr("style", nodeStyles).attr("x", -bbox.width / 2 - halfPadding).attr("y", -bbox.height / 2 - halfPadding).attr("width", bbox.width + (node.padding || 0)).attr("height", bbox.height + (node.padding || 0));
    innerLine.attr("class", "divider").attr("x1", -bbox.width / 2 - halfPadding).attr("x2", bbox.width / 2 + halfPadding).attr("y1", -bbox.height / 2 - halfPadding + titleBox.height + halfPadding).attr("y2", -bbox.height / 2 - halfPadding + titleBox.height + halfPadding);
  }
  updateNodeBounds(node, rect2);
  node.intersect = function(point) {
    return intersect_default.rect(node, point);
  };
  return shapeSvg;
}
__name(rectWithTitle, "rectWithTitle");
async function roundedRect(parent, node, { config: { themeVariables } }) {
  const radius = themeVariables?.radius ?? 5;
  const options = {
    rx: radius,
    ry: radius,
    classes: "",
    labelPaddingX: (node?.padding ?? 0) * 1,
    labelPaddingY: (node?.padding ?? 0) * 1
  };
  return drawRect(parent, node, options);
}
__name(roundedRect, "roundedRect");
var FRAME_WIDTH = 8;
async function shadedProcess(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const paddingX = node.look === "neo" ? 16 : node.padding ?? 0;
  const paddingY = node.look === "neo" ? 12 : node.padding ?? 0;
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));
  const totalWidth = (node?.width ?? bbox.width) + paddingX * 2 + (node.look === "neo" ? FRAME_WIDTH : FRAME_WIDTH * 2);
  const totalHeight = (node?.height ?? bbox.height) + paddingY * 2;
  const w = totalWidth - FRAME_WIDTH;
  const h = totalHeight;
  const x = FRAME_WIDTH - totalWidth / 2;
  const y = -totalHeight / 2;
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const points = [
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x: x - FRAME_WIDTH, y: y + h },
    { x: x - FRAME_WIDTH, y },
    { x, y },
    { x, y: y + h }
  ];
  const roughNode = rc.polygon(points.map((p) => [p.x, p.y]), options);
  const rect2 = shapeSvg.insert(() => roughNode, ":first-child");
  rect2.attr("class", "basic label-container outer-path").attr("style", handleUndefinedAttr(cssStyles));
  if (nodeStyles && node.look !== "handDrawn") {
    rect2.selectAll("path").attr("style", nodeStyles);
  }
  if (cssStyles && node.look !== "handDrawn") {
    rect2.selectAll("path").attr("style", nodeStyles);
  }
  label.attr("transform", `translate(${FRAME_WIDTH / 2 - bbox.width / 2 - (bbox.x - (bbox.left ?? 0))}, ${-(bbox.height / 2) - (bbox.y - (bbox.top ?? 0))})`);
  updateNodeBounds(node, rect2);
  node.intersect = function(point) {
    return intersect_default.rect(node, point);
  };
  return shapeSvg;
}
__name(shadedProcess, "shadedProcess");
async function slopedRect(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingX = node.look === "neo" ? 16 : nodePadding;
  const labelPaddingY = node.look === "neo" ? 12 : nodePadding;
  if (node.width || node.height) {
    node.width = Math.max((node?.width ?? 0) - labelPaddingX * 2, 10);
    node.height = Math.max((node?.height ?? 0) / 1.5 - labelPaddingY * 2, 10);
  }
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));
  const totalWidth = (node?.width ? node?.width : bbox.width) + labelPaddingX * 2;
  const totalHeight = ((node?.height ? node?.height : bbox.height) + labelPaddingY * 2) * 1.5;
  const w = totalWidth;
  const h = totalHeight / 1.5;
  const x = -w / 2;
  const y = -h / 2;
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const points = [
    { x, y },
    { x, y: y + h },
    { x: x + w, y: y + h },
    { x: x + w, y: y - h / 2 }
  ];
  const pathData = createPathFromPoints(points);
  const shapeNode = rc.path(pathData, options);
  const polygon = shapeSvg.insert(() => shapeNode, ":first-child");
  polygon.attr("class", "basic label-container  outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    polygon.selectChildren("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    polygon.selectChildren("path").attr("style", nodeStyles);
  }
  polygon.attr("transform", `translate(0, ${h / 4})`);
  label.attr("transform", `translate(${-w / 2 + (node.padding ?? 0) - (bbox.x - (bbox.left ?? 0))}, ${-h / 4 + (node.padding ?? 0) - (bbox.y - (bbox.top ?? 0))})`);
  updateNodeBounds(node, polygon);
  node.intersect = function(point) {
    const pos = intersect_default.polygon(node, points, point);
    return pos;
  };
  return shapeSvg;
}
__name(slopedRect, "slopedRect");
async function squareRect2(parent, node) {
  const nodePadding = node.padding ?? 0;
  const labelPaddingX = node.look === "neo" ? 16 : nodePadding * 2;
  const labelPaddingY = node.look === "neo" ? 12 : nodePadding;
  const options = {
    rx: 0,
    ry: 0,
    classes: "",
    labelPaddingX: node.labelPaddingX ?? labelPaddingX,
    labelPaddingY
  };
  return drawRect(parent, node, options);
}
__name(squareRect2, "squareRect");
async function stadium(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingX = node.look === "neo" ? 20 : nodePadding;
  const labelPaddingY = node.look === "neo" ? 12 : nodePadding;
  const { shapeSvg, bbox } = await labelHelper(parent, node, getNodeClasses(node));
  const h = bbox.height + (node.look === "neo" ? labelPaddingY * 2 : labelPaddingY);
  const w = bbox.width + h / 4 + (node.look === "neo" ? labelPaddingX * 2 : labelPaddingX);
  const radius = h / 2;
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const points = [
    { x: -w / 2 + radius, y: -h / 2 },
    { x: w / 2 - radius, y: -h / 2 },
    ...generateCirclePoints(-w / 2 + radius, 0, radius, 50, 90, 270),
    { x: w / 2 - radius, y: h / 2 },
    ...generateCirclePoints(w / 2 - radius, 0, radius, 50, 270, 450)
  ];
  const pathData = createPathFromPoints(points);
  const shapeNode = rc.path(pathData, options);
  const polygon = shapeSvg.insert(() => shapeNode, ":first-child");
  polygon.attr("class", "basic label-container outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    polygon.selectChildren("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    polygon.selectChildren("path").attr("style", nodeStyles);
  }
  updateNodeBounds(node, polygon);
  node.intersect = function(point) {
    const pos = intersect_default.polygon(node, points, point);
    return pos;
  };
  return shapeSvg;
}
__name(stadium, "stadium");
async function state(parent, node) {
  const options = {
    rx: node.look === "neo" ? 3 : 5,
    ry: node.look === "neo" ? 3 : 5,
    classes: "flowchart-node"
  };
  return drawRect(parent, node, options);
}
__name(state, "state");
function stateEnd(parent, node, { config: { themeVariables } }) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const { cssStyles } = node;
  const { lineColor, stateBorder, nodeBorder, nodeShadow } = themeVariables;
  if (node.width || node.height) {
    if ((node.width ?? 0) < 14) {
      node.width = 14;
    }
    if ((node.height ?? 0) < 14) {
      node.height = 14;
    }
  }
  if (!node.width) {
    node.width = 14;
  }
  if (!node.height) {
    node.height = 14;
  }
  const shapeSvg = parent.insert("g").attr("class", "node default").attr("id", node.domId ?? node.id);
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const roughNode = rc.circle(0, 0, node.width, {
    ...options,
    stroke: lineColor,
    strokeWidth: 2
  });
  const innerFill = stateBorder ?? nodeBorder;
  const innerNodeRadius = (node.width ?? 0) * 5 / 14;
  const roughInnerNode = rc.circle(0, 0, innerNodeRadius, {
    ...options,
    fill: innerFill,
    stroke: innerFill,
    strokeWidth: 2,
    fillStyle: "solid"
  });
  const circle2 = shapeSvg.insert(() => roughNode, ":first-child");
  circle2.insert(() => roughInnerNode);
  if (node.look !== "handDrawn") {
    circle2.attr("class", "outer-path");
  }
  if (cssStyles) {
    circle2.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles) {
    circle2.selectAll("path").attr("style", nodeStyles);
  }
  if (node.width < 25 && nodeShadow && node.look !== "handDrawn") {
    const svgId = parent.node()?.ownerSVGElement?.id ?? "";
    const filterId = svgId ? `${svgId}-drop-shadow-small` : "drop-shadow-small";
    circle2.attr("style", `filter:url(#${filterId})`);
  }
  updateNodeBounds(node, circle2);
  node.intersect = function(point) {
    return intersect_default.circle(node, (node.width ?? 0) / 2, point);
  };
  return shapeSvg;
}
__name(stateEnd, "stateEnd");
function stateStart(parent, node, { config: { themeVariables } }) {
  const { lineColor, nodeShadow } = themeVariables;
  if (node.width || node.height) {
    if ((node.width ?? 0) < 14) {
      node.width = 14;
    }
    if ((node.height ?? 0) < 14) {
      node.height = 14;
    }
  }
  if (!node.width) {
    node.width = 14;
  }
  if (!node.height) {
    node.height = 14;
  }
  const shapeSvg = parent.insert("g").attr("class", "node default").attr("id", node.domId || node.id);
  let circle2;
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const roughNode = rc.circle(0, 0, node.width, solidStateFill(lineColor));
    circle2 = shapeSvg.insert(() => roughNode);
    circle2.attr("class", "state-start").attr("r", (node.width ?? 7) / 2).attr("width", node.width ?? 14).attr("height", node.height ?? 14);
  } else {
    circle2 = shapeSvg.insert("circle", ":first-child");
    circle2.attr("class", "state-start").attr("r", (node.width ?? 7) / 2).attr("width", node.width ?? 14).attr("height", node.height ?? 14);
  }
  if (node.width < 25 && nodeShadow && node.look !== "handDrawn") {
    const svgId = parent.node()?.ownerSVGElement?.id ?? "";
    const filterId = svgId ? `${svgId}-drop-shadow-small` : "drop-shadow-small";
    circle2.attr("style", `filter:url(#${filterId})`);
  }
  updateNodeBounds(node, circle2);
  node.intersect = function(point) {
    return intersect_default.circle(node, (node.width ?? 7) / 2, point);
  };
  return shapeSvg;
}
__name(stateStart, "stateStart");
var FRAME_WIDTH2 = 8;
async function subroutine(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node?.padding ?? 8;
  const labelPaddingX = node.look === "neo" ? 28 : nodePadding;
  const labelPaddingY = node.look === "neo" ? 12 : nodePadding;
  const { shapeSvg, bbox } = await labelHelper(parent, node, getNodeClasses(node));
  const totalWidth = (node?.width ?? bbox.width) + 2 * FRAME_WIDTH2 + labelPaddingX;
  const totalHeight = (node?.height ?? bbox.height) + labelPaddingY;
  const w = totalWidth - 2 * FRAME_WIDTH2;
  const h = totalHeight;
  const x = -totalWidth / 2;
  const y = -totalHeight / 2;
  const points = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: -h },
    { x: 0, y: -h },
    { x: 0, y: 0 },
    { x: -8, y: 0 },
    { x: w + 8, y: 0 },
    { x: w + 8, y: -h },
    { x: -8, y: -h },
    { x: -8, y: 0 }
  ];
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const options = userNodeOverrides(node, {});
    const roughNode = rc.rectangle(x, y, w + 16, h, options);
    const l1 = rc.line(x + FRAME_WIDTH2, y, x + FRAME_WIDTH2, y + h, options);
    const l2 = rc.line(x + FRAME_WIDTH2 + w, y, x + FRAME_WIDTH2 + w, y + h, options);
    shapeSvg.insert(() => l1, ":first-child");
    shapeSvg.insert(() => l2, ":first-child");
    const rect2 = shapeSvg.insert(() => roughNode, ":first-child");
    const { cssStyles } = node;
    rect2.attr("class", "basic label-container").attr("style", handleUndefinedAttr(cssStyles));
    updateNodeBounds(node, rect2);
  } else {
    const el = insertPolygonShape(shapeSvg, w, h, points);
    if (nodeStyles) {
      el.attr("style", nodeStyles);
    }
    updateNodeBounds(node, el);
  }
  node.intersect = function(point) {
    return intersect_default.polygon(node, points, point);
  };
  return shapeSvg;
}
__name(subroutine, "subroutine");
var TAG_RATIO = 0.2;
async function taggedRect(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingX = node.look === "neo" ? 16 : nodePadding;
  const labelPaddingY = node.look === "neo" ? 12 : nodePadding;
  if (node.width || node.height) {
    node.height = Math.max((node?.height ?? 0) - labelPaddingY * 2, 10);
    node.width = Math.max((node?.width ?? 0) - labelPaddingX * 2 - TAG_RATIO * (node.height + labelPaddingY * 2), 10);
  }
  const { shapeSvg, bbox } = await labelHelper(parent, node, getNodeClasses(node));
  const totalHeight = (node?.height ? node?.height : bbox.height) + labelPaddingY * 2;
  const tagWidth = TAG_RATIO * totalHeight;
  const tagHeight = TAG_RATIO * totalHeight;
  const totalWidth = (node?.width ? node?.width : bbox.width) + labelPaddingX * 2 + tagWidth;
  const w = totalWidth - tagWidth;
  const h = totalHeight;
  const x = -w / 2;
  const y = -h / 2;
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  const rectPoints = [
    { x: x - tagWidth / 2, y },
    { x: x + w + tagWidth / 2, y },
    { x: x + w + tagWidth / 2, y: y + h },
    { x: x - tagWidth / 2, y: y + h }
  ];
  const tagPoints = [
    { x: x + w - tagWidth / 2, y: y + h },
    { x: x + w + tagWidth / 2, y: y + h },
    { x: x + w + tagWidth / 2, y: y + h - tagHeight }
  ];
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const rectPath = createPathFromPoints(rectPoints);
  const rectNode = rc.path(rectPath, options);
  const tagPath = createPathFromPoints(tagPoints);
  const tagNode = rc.path(tagPath, { ...options, fillStyle: "solid" });
  const taggedRect2 = shapeSvg.insert(() => tagNode, ":first-child");
  taggedRect2.insert(() => rectNode, ":first-child");
  taggedRect2.attr("class", "basic label-container outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    taggedRect2.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    taggedRect2.selectAll("path").attr("style", nodeStyles);
  }
  updateNodeBounds(node, taggedRect2);
  node.intersect = function(point) {
    const pos = intersect_default.polygon(node, rectPoints, point);
    return pos;
  };
  return shapeSvg;
}
__name(taggedRect, "taggedRect");
async function taggedWaveEdgedRectangle(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));
  const w = Math.max(bbox.width + (node.padding ?? 0) * 2, node?.width ?? 0);
  const h = Math.max(bbox.height + (node.padding ?? 0) * 2, node?.height ?? 0);
  const waveAmplitude = h / 8;
  const tagWidth = 0.2 * w;
  const tagHeight = 0.2 * h;
  const finalH = h + waveAmplitude;
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const points = [
    { x: -w / 2 - w / 2 * 0.1, y: finalH / 2 },
    ...generateFullSineWavePoints(-w / 2 - w / 2 * 0.1, finalH / 2, w / 2 + w / 2 * 0.1, finalH / 2, waveAmplitude, 0.8),
    { x: w / 2 + w / 2 * 0.1, y: -finalH / 2 },
    { x: -w / 2 - w / 2 * 0.1, y: -finalH / 2 }
  ];
  const x = -w / 2 + w / 2 * 0.1;
  const y = -finalH / 2 - tagHeight * 0.4;
  const tagPoints = [
    { x: x + w - tagWidth, y: (y + h) * 1.3 },
    { x: x + w, y: y + h - tagHeight },
    { x: x + w, y: (y + h) * 0.9 },
    ...generateFullSineWavePoints(x + w, (y + h) * 1.25, x + w - tagWidth, (y + h) * 1.3, -h * 0.02, 0.5)
  ];
  const waveEdgeRectPath = createPathFromPoints(points);
  const waveEdgeRectNode = rc.path(waveEdgeRectPath, options);
  const taggedWaveEdgeRectPath = createPathFromPoints(tagPoints);
  const taggedWaveEdgeRectNode = rc.path(taggedWaveEdgeRectPath, {
    ...options,
    fillStyle: "solid"
  });
  const waveEdgeRect = shapeSvg.insert(() => taggedWaveEdgeRectNode, ":first-child");
  waveEdgeRect.insert(() => waveEdgeRectNode, ":first-child");
  waveEdgeRect.attr("class", "basic label-container outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    waveEdgeRect.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    waveEdgeRect.selectAll("path").attr("style", nodeStyles);
  }
  waveEdgeRect.attr("transform", `translate(0,${-waveAmplitude / 2})`);
  label.attr("transform", `translate(${-w / 2 + (node.padding ?? 0) - (bbox.x - (bbox.left ?? 0))},${-h / 2 + (node.padding ?? 0) - waveAmplitude / 2 - (bbox.y - (bbox.top ?? 0))})`);
  updateNodeBounds(node, waveEdgeRect);
  node.intersect = function(point) {
    const pos = intersect_default.polygon(node, points, point);
    return pos;
  };
  return shapeSvg;
}
__name(taggedWaveEdgedRectangle, "taggedWaveEdgedRectangle");
async function text(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const { shapeSvg, bbox } = await labelHelper(parent, node, getNodeClasses(node));
  const totalWidth = Math.max(bbox.width + (node.padding ?? 0), node?.width || 0);
  const totalHeight = Math.max(bbox.height + (node.padding ?? 0), node?.height || 0);
  const x = -totalWidth / 2;
  const y = -totalHeight / 2;
  const rect2 = shapeSvg.insert("rect", ":first-child");
  rect2.attr("class", "text").attr("style", nodeStyles).attr("rx", 0).attr("ry", 0).attr("x", x).attr("y", y).attr("width", totalWidth).attr("height", totalHeight);
  updateNodeBounds(node, rect2);
  node.intersect = function(point) {
    return intersect_default.rect(node, point);
  };
  return shapeSvg;
}
__name(text, "text");
var createCylinderPathD3 = /* @__PURE__ */ __name((x, y, width, height, rx, ry) => {
  return `M${x},${y}
    a${rx},${ry} 0,0,1 ${0},${-height}
    l${width},${0}
    a${rx},${ry} 0,0,1 ${0},${height}
    M${width},${-height}
    a${rx},${ry} 0,0,0 ${0},${height}
    l${-width},${0}`;
}, "createCylinderPathD");
var createOuterCylinderPathD3 = /* @__PURE__ */ __name((x, y, width, height, rx, ry) => {
  return [
    `M${x},${y}`,
    `M${x + width},${y}`,
    `a${rx},${ry} 0,0,0 ${0},${-height}`,
    `l${-width},0`,
    `a${rx},${ry} 0,0,0 ${0},${height}`,
    `l${width},0`
  ].join(" ");
}, "createOuterCylinderPathD");
var createInnerCylinderPathD3 = /* @__PURE__ */ __name((x, y, width, height, rx, ry) => {
  return [`M${x + width / 2},${-height / 2}`, `a${rx},${ry} 0,0,0 0,${height}`].join(" ");
}, "createInnerCylinderPathD");
var MIN_HEIGHT4 = 5;
var MIN_WIDTH4 = 10;
async function tiltedCylinder(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPadding = node.look === "neo" ? 12 : nodePadding / 2;
  if (node.width || node.height) {
    const originalHeight = node.height ?? 0;
    node.height = (node.height ?? 0) - labelPadding;
    if (node.height < MIN_HEIGHT4) {
      node.height = MIN_HEIGHT4;
    }
    const ry2 = originalHeight / 2;
    const rx2 = ry2 / (2.5 + originalHeight / 50);
    node.width = (node.width ?? 0) - labelPadding - rx2 * 3;
    if (node.width < MIN_WIDTH4) {
      node.width = MIN_WIDTH4;
    }
  }
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));
  const h = (node.height ? node.height : bbox.height) + labelPadding;
  const ry = h / 2;
  const rx = ry / (2.5 + h / 50);
  const w = (node.width ? node.width : bbox.width) + rx + labelPadding;
  const { cssStyles } = node;
  let cylinder2;
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const outerPathData = createOuterCylinderPathD3(0, 0, w, h, rx, ry);
    const innerPathData = createInnerCylinderPathD3(0, 0, w, h, rx, ry);
    const outerNode = rc.path(outerPathData, userNodeOverrides(node, {}));
    const innerLine = rc.path(innerPathData, userNodeOverrides(node, { fill: "none" }));
    cylinder2 = shapeSvg.insert(() => innerLine, ":first-child");
    cylinder2 = shapeSvg.insert(() => outerNode, ":first-child");
    cylinder2.attr("class", "basic label-container");
    if (cssStyles) {
      cylinder2.attr("style", cssStyles);
    }
  } else {
    const pathData = createCylinderPathD3(0, 0, w, h, rx, ry);
    cylinder2 = shapeSvg.insert("path", ":first-child").attr("d", pathData).attr("class", "basic label-container").attr("style", handleUndefinedAttr(cssStyles)).attr("style", nodeStyles);
    cylinder2.attr("class", "basic label-container outer-path");
    if (cssStyles) {
      cylinder2.selectAll("path").attr("style", cssStyles);
    }
    if (nodeStyles) {
      cylinder2.selectAll("path").attr("style", nodeStyles);
    }
  }
  cylinder2.attr("label-offset-x", rx);
  cylinder2.attr("transform", `translate(${-w / 2}, ${h / 2} )`);
  label.attr("transform", `translate(${-(bbox.width / 2) - rx - (bbox.x - (bbox.left ?? 0))}, ${-(bbox.height / 2) - (bbox.y - (bbox.top ?? 0))})`);
  updateNodeBounds(node, cylinder2);
  node.intersect = function(point) {
    const pos = intersect_default.rect(node, point);
    const y = pos.y - (node.y ?? 0);
    if (ry != 0 && (Math.abs(y) < (node.height ?? 0) / 2 || Math.abs(y) == (node.height ?? 0) / 2 && Math.abs(pos.x - (node.x ?? 0)) > (node.width ?? 0) / 2 - rx)) {
      let x = rx * rx * (1 - y * y / (ry * ry));
      if (x != 0) {
        x = Math.sqrt(Math.abs(x));
      }
      x = rx - x;
      if (point.x - (node.x ?? 0) > 0) {
        x = -x;
      }
      pos.x += x;
    }
    return pos;
  };
  return shapeSvg;
}
__name(tiltedCylinder, "tiltedCylinder");
async function trapezoid(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingY = node.look === "neo" ? nodePadding : nodePadding;
  const labelPaddingX = node.look === "neo" ? nodePadding * 2 : nodePadding;
  const { shapeSvg, bbox } = await labelHelper(parent, node, getNodeClasses(node));
  const h = (node?.height ?? bbox.height) + labelPaddingY;
  const w = (node?.width ?? bbox.width) + labelPaddingX;
  const points = [
    { x: -3 * h / 6, y: 0 },
    { x: w + 3 * h / 6, y: 0 },
    { x: w, y: -h },
    { x: 0, y: -h }
  ];
  let polygon;
  const { cssStyles } = node;
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const options = userNodeOverrides(node, {});
    const pathData = createPathFromPoints(points);
    const roughNode = rc.path(pathData, options);
    polygon = shapeSvg.insert(() => roughNode, ":first-child").attr("transform", `translate(${-w / 2}, ${h / 2})`);
    if (cssStyles) {
      polygon.attr("style", cssStyles);
    }
  } else {
    polygon = insertPolygonShape(shapeSvg, w, h, points);
  }
  if (nodeStyles) {
    polygon.attr("style", nodeStyles);
  }
  node.width = w;
  node.height = h;
  updateNodeBounds(node, polygon);
  node.intersect = function(point) {
    return intersect_default.polygon(node, points, point);
  };
  return shapeSvg;
}
__name(trapezoid, "trapezoid");
async function trapezoidalPentagon(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingX = node.look === "neo" ? 16 : nodePadding;
  const labelPaddingY = node.look === "neo" ? 12 : nodePadding;
  const minWidth = 15, minHeight = 5;
  if (node.width || node.height) {
    node.height = (node.height ?? 0) - labelPaddingY * 2;
    if (node.height < minHeight) {
      node.height = minHeight;
    }
    node.width = (node.width ?? 0) - labelPaddingX * 2;
    if (node.width < minWidth) {
      node.width = minWidth;
    }
  }
  const { shapeSvg, bbox } = await labelHelper(parent, node, getNodeClasses(node));
  const w = (node?.width ? node?.width : bbox.width) + labelPaddingX * 2;
  const h = (node?.height ? node?.height : bbox.height) + labelPaddingY * 2;
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const points = [
    { x: -w / 2 * 0.8, y: -h / 2 },
    { x: w / 2 * 0.8, y: -h / 2 },
    { x: w / 2, y: -h / 2 * 0.6 },
    { x: w / 2, y: h / 2 },
    { x: -w / 2, y: h / 2 },
    { x: -w / 2, y: -h / 2 * 0.6 }
  ];
  const pathData = createPathFromPoints(points);
  const shapeNode = rc.path(pathData, options);
  const polygon = shapeSvg.insert(() => shapeNode, ":first-child");
  polygon.attr("class", "basic label-container outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    polygon.selectChildren("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    polygon.selectChildren("path").attr("style", nodeStyles);
  }
  updateNodeBounds(node, polygon);
  node.intersect = function(point) {
    const pos = intersect_default.polygon(node, points, point);
    return pos;
  };
  return shapeSvg;
}
__name(trapezoidalPentagon, "trapezoidalPentagon");
var MIN_HEIGHT5 = 10;
var MIN_WIDTH5 = 10;
async function triangle(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingX = node.look === "neo" ? nodePadding * 2 : nodePadding;
  if (node.width || node.height) {
    node.width = ((node?.width ?? 0) - labelPaddingX) / 2;
    if (node.width < MIN_WIDTH5) {
      node.width = MIN_WIDTH5;
    }
    node.height = node?.height ?? 0;
    if (node.height < MIN_HEIGHT5) {
      node.height = MIN_HEIGHT5;
    }
  }
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));
  const useHtmlLabels = evaluate(getConfig2().flowchart?.htmlLabels);
  const w = (node?.width ? node?.width : bbox.width) + labelPaddingX;
  const h = node?.height ? node?.height : w + bbox.height;
  const tw = h;
  const points = [
    { x: 0, y: 0 },
    { x: tw, y: 0 },
    { x: tw / 2, y: -h }
  ];
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const pathData = createPathFromPoints(points);
  const roughNode = rc.path(pathData, options);
  const polygon = shapeSvg.insert(() => roughNode, ":first-child").attr("transform", `translate(${-h / 2}, ${h / 2})`).attr("class", "outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    polygon.selectChildren("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    polygon.selectChildren("path").attr("style", nodeStyles);
  }
  node.width = w;
  node.height = h;
  updateNodeBounds(node, polygon);
  label.attr("transform", `translate(${-bbox.width / 2 - (bbox.x - (bbox.left ?? 0))}, ${h / 2 - (bbox.height + (node.padding ?? 0) / (useHtmlLabels ? 2 : 1) - (bbox.y - (bbox.top ?? 0)))})`);
  node.intersect = function(point) {
    log.info("Triangle intersect", node, points, point);
    return intersect_default.polygon(node, points, point);
  };
  return shapeSvg;
}
__name(triangle, "triangle");
async function waveEdgedRectangle(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingX = node.look === "neo" ? 16 : nodePadding;
  const labelPaddingY = node.look === "neo" ? 12 : nodePadding;
  let adjustFinalHeight = true;
  if (node.width || node.height) {
    adjustFinalHeight = false;
    node.width = (node?.width ?? 0) - labelPaddingX * 2;
    if (node.width < 10) {
      node.width = 10;
    }
    node.height = (node?.height ?? 0) - labelPaddingY * 2;
    if (node.height < 10) {
      node.height = 10;
    }
  }
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));
  const w = (node?.width ? node?.width : bbox.width) + (labelPaddingX ?? 0) * 2;
  const h = (node?.height ? node?.height : bbox.height) + (labelPaddingY ?? 0) * 2;
  const waveAmplitude = node.look === "neo" ? h / 4 : h / 8;
  const finalH = h + (adjustFinalHeight ? waveAmplitude : -waveAmplitude);
  const { cssStyles } = node;
  const minWidth = 14;
  const widthDif = minWidth - w;
  const extraW = widthDif > 0 ? widthDif / 2 : 0;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const points = [
    { x: -w / 2 - extraW, y: finalH / 2 },
    ...generateFullSineWavePoints(-w / 2 - extraW, finalH / 2, w / 2 + extraW, finalH / 2, waveAmplitude, 0.8),
    { x: w / 2 + extraW, y: -finalH / 2 },
    { x: -w / 2 - extraW, y: -finalH / 2 }
  ];
  const waveEdgeRectPath = createPathFromPoints(points);
  const waveEdgeRectNode = rc.path(waveEdgeRectPath, options);
  const waveEdgeRect = shapeSvg.insert(() => waveEdgeRectNode, ":first-child");
  waveEdgeRect.attr("class", "basic label-container outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    waveEdgeRect.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    waveEdgeRect.selectAll("path").attr("style", nodeStyles);
  }
  waveEdgeRect.attr("transform", `translate(0,${-waveAmplitude / 2})`);
  label.attr("transform", `translate(${-w / 2 + (node.padding ?? 0) - (bbox.x - (bbox.left ?? 0))},${-h / 2 + (node.padding ?? 0) - waveAmplitude - (bbox.y - (bbox.top ?? 0))})`);
  updateNodeBounds(node, waveEdgeRect);
  node.intersect = function(point) {
    const pos = intersect_default.polygon(node, points, point);
    return pos;
  };
  return shapeSvg;
}
__name(waveEdgedRectangle, "waveEdgedRectangle");
async function waveRectangle(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const nodePadding = node.padding ?? 0;
  const labelPaddingX = node.look === "neo" ? 16 : nodePadding;
  const labelPaddingY = node.look === "neo" ? 20 : nodePadding;
  if (node.width || node.height) {
    node.width = node?.width ?? 0;
    if (node.width < 20) {
      node.width = 20;
    }
    node.height = node?.height ?? 0;
    if (node.height < 10) {
      node.height = 10;
    }
    const waveAmplitude2 = Math.min(node.height * 0.2, node.height / 4);
    node.height = Math.ceil(node.height - labelPaddingY - waveAmplitude2 * (20 / 9));
    node.width = node.width - labelPaddingX * 2;
  }
  const { shapeSvg, bbox } = await labelHelper(parent, node, getNodeClasses(node));
  const w = (node?.width ? node?.width : bbox.width) + labelPaddingX * 2;
  const h = (node?.height ? node?.height : bbox.height) + labelPaddingY;
  const waveAmplitude = h / 8;
  const finalH = h + waveAmplitude * 2;
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const points = [
    { x: -w / 2, y: finalH / 2 },
    ...generateFullSineWavePoints(-w / 2, finalH / 2, w / 2, finalH / 2, waveAmplitude, 1),
    { x: w / 2, y: -finalH / 2 },
    ...generateFullSineWavePoints(w / 2, -finalH / 2, -w / 2, -finalH / 2, waveAmplitude, -1)
  ];
  const waveRectPath = createPathFromPoints(points);
  const waveRectNode = rc.path(waveRectPath, options);
  const waveRect = shapeSvg.insert(() => waveRectNode, ":first-child");
  waveRect.attr("class", "basic label-container");
  if (cssStyles && node.look !== "handDrawn") {
    waveRect.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    waveRect.selectAll("path").attr("style", nodeStyles);
  }
  updateNodeBounds(node, waveRect);
  node.intersect = function(point) {
    const pos = intersect_default.polygon(node, points, point);
    return pos;
  };
  return shapeSvg;
}
__name(waveRectangle, "waveRectangle");
var rectOffset = 10;
async function windowPane(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const paddingX = node.look === "neo" ? 16 : node.padding ?? 0;
  const paddingY = node.look === "neo" ? 12 : node.padding ?? 0;
  if (node.width || node.height) {
    node.width = Math.max((node?.width ?? 0) - paddingX * 2 - rectOffset, 10);
    node.height = Math.max((node?.height ?? 0) - paddingY * 2 - rectOffset, 10);
  }
  const { shapeSvg, bbox, label } = await labelHelper(parent, node, getNodeClasses(node));
  const totalWidth = (node?.width ? node?.width : bbox.width) + paddingX * 2 + rectOffset;
  const totalHeight = (node?.height ? node?.height : bbox.height) + paddingY * 2 + rectOffset;
  const w = totalWidth - rectOffset;
  const h = totalHeight - rectOffset;
  const x = -w / 2;
  const y = -h / 2;
  const { cssStyles } = node;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  const outerPathPoints = [
    { x: x - rectOffset, y: y - rectOffset },
    { x: x - rectOffset, y: y + h },
    { x: x + w, y: y + h },
    { x: x + w, y: y - rectOffset }
  ];
  const path = `M${x - rectOffset},${y - rectOffset} L${x + w},${y - rectOffset} L${x + w},${y + h} L${x - rectOffset},${y + h} L${x - rectOffset},${y - rectOffset}
                M${x - rectOffset},${y} L${x + w},${y}
                M${x},${y - rectOffset} L${x},${y + h}`;
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const no = rc.path(path, options);
  const windowPane2 = shapeSvg.insert(() => no, ":first-child");
  windowPane2.attr("transform", `translate(${rectOffset / 2}, ${rectOffset / 2})`);
  windowPane2.attr("class", "basic label-container outer-path");
  if (cssStyles && node.look !== "handDrawn") {
    windowPane2.selectAll("path").attr("style", cssStyles);
  }
  if (nodeStyles && node.look !== "handDrawn") {
    windowPane2.selectAll("path").attr("style", nodeStyles);
  }
  label.attr("transform", `translate(${-(bbox.width / 2) + rectOffset / 2 - (bbox.x - (bbox.left ?? 0))}, ${-(bbox.height / 2) + rectOffset / 2 - (bbox.y - (bbox.top ?? 0))})`);
  updateNodeBounds(node, windowPane2);
  node.intersect = function(point) {
    const pos = intersect_default.polygon(node, outerPathPoints, point);
    return pos;
  };
  return shapeSvg;
}
__name(windowPane, "windowPane");
var COLOR_THEMES = /* @__PURE__ */ new Set(["redux-color", "redux-dark-color"]);
var REDUX_THEMES = /* @__PURE__ */ new Set(["redux", "redux-dark", "redux-color", "redux-dark-color"]);
async function erBox(parent, node) {
  const entityNode = node;
  if (entityNode.alias) {
    node.label = entityNode.alias;
  }
  const { theme, themeVariables } = getConfig();
  const { rowEven, rowOdd, nodeBorder, borderColorArray } = themeVariables;
  if (node.look === "handDrawn") {
    const { themeVariables: themeVariables2 } = getConfig();
    const { background } = themeVariables2;
    const backgroundNode = {
      ...node,
      id: node.id + "-background",
      domId: (node.domId || node.id) + "-background",
      look: "default",
      cssStyles: ["stroke: none", `fill: ${background}`]
    };
    await erBox(parent, backgroundNode);
  }
  const config = getConfig();
  node.useHtmlLabels = config.htmlLabels;
  let PADDING = config.er?.diagramPadding ?? 10;
  let TEXT_PADDING = config.er?.entityPadding ?? 6;
  const { cssStyles } = node;
  const { labelStyles, nodeStyles } = styles2String(node);
  if (entityNode.attributes.length === 0 && node.label) {
    const options2 = {
      rx: 0,
      ry: 0,
      labelPaddingX: PADDING,
      labelPaddingY: PADDING * 1.5,
      classes: ""
    };
    if (calculateTextWidth(node.label, config) + options2.labelPaddingX * 2 < config.er.minEntityWidth) {
      node.width = config.er.minEntityWidth;
    }
    const shapeSvg2 = await drawRect(parent, node, options2);
    if (theme != null && COLOR_THEMES.has(theme)) {
      const colorIndex = entityNode.colorIndex ?? 0;
      shapeSvg2.attr("data-color-id", `color-${colorIndex % borderColorArray.length}`);
    }
    if (!evaluate(config.htmlLabels)) {
      const textElement = shapeSvg2.select("text");
      const bbox = textElement.node()?.getBBox();
      textElement.attr("transform", `translate(${-bbox.width / 2}, 0)`);
    }
    return shapeSvg2;
  }
  if (!config.htmlLabels) {
    PADDING *= 1.25;
    TEXT_PADDING *= 1.25;
  }
  let cssClasses = getNodeClasses(node);
  if (!cssClasses) {
    cssClasses = "node default";
  }
  const shapeSvg = parent.insert("g").attr("class", cssClasses).attr("id", node.domId || node.id);
  const nameBBox = await addText(shapeSvg, node.label ?? "", config, 0, 0, ["name"], labelStyles);
  nameBBox.height += TEXT_PADDING;
  let yOffset = 0;
  const yOffsets = [];
  const rows = [];
  let maxTypeWidth = 0;
  let maxNameWidth = 0;
  let maxKeysWidth = 0;
  let maxCommentWidth = 0;
  let keysPresent = true;
  let commentPresent = true;
  for (const attribute of entityNode.attributes) {
    const typeBBox = await addText(shapeSvg, attribute.type, config, 0, yOffset, ["attribute-type"], labelStyles);
    maxTypeWidth = Math.max(maxTypeWidth, typeBBox.width + PADDING);
    const nameBBox2 = await addText(shapeSvg, attribute.name, config, 0, yOffset, ["attribute-name"], labelStyles);
    maxNameWidth = Math.max(maxNameWidth, nameBBox2.width + PADDING);
    const keysBBox = await addText(shapeSvg, attribute.keys.join(), config, 0, yOffset, ["attribute-keys"], labelStyles);
    maxKeysWidth = Math.max(maxKeysWidth, keysBBox.width + PADDING);
    const commentBBox = await addText(shapeSvg, attribute.comment, config, 0, yOffset, ["attribute-comment"], labelStyles);
    maxCommentWidth = Math.max(maxCommentWidth, commentBBox.width + PADDING);
    const rowHeight = Math.max(typeBBox.height, nameBBox2.height, keysBBox.height, commentBBox.height) + TEXT_PADDING;
    rows.push({ yOffset, rowHeight });
    yOffset += rowHeight;
  }
  let totalWidthSections = 4;
  if (maxKeysWidth <= PADDING) {
    keysPresent = false;
    maxKeysWidth = 0;
    totalWidthSections--;
  }
  if (maxCommentWidth <= PADDING) {
    commentPresent = false;
    maxCommentWidth = 0;
    totalWidthSections--;
  }
  const shapeBBox = shapeSvg.node().getBBox();
  if (nameBBox.width + PADDING * 2 - (maxTypeWidth + maxNameWidth + maxKeysWidth + maxCommentWidth) > 0) {
    const difference = nameBBox.width + PADDING * 2 - (maxTypeWidth + maxNameWidth + maxKeysWidth + maxCommentWidth);
    maxTypeWidth += difference / totalWidthSections;
    maxNameWidth += difference / totalWidthSections;
    if (maxKeysWidth > 0) {
      maxKeysWidth += difference / totalWidthSections;
    }
    if (maxCommentWidth > 0) {
      maxCommentWidth += difference / totalWidthSections;
    }
  }
  const maxWidth = maxTypeWidth + maxNameWidth + maxKeysWidth + maxCommentWidth;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  let totalShapeBBoxHeight = 0;
  if (rows.length > 0) {
    totalShapeBBoxHeight = rows.reduce((sum, row) => sum + (row?.rowHeight ?? 0), 0);
  }
  const w = Math.max(shapeBBox.width + PADDING * 2, node?.width || 0, maxWidth);
  const h = Math.max((totalShapeBBoxHeight ?? 0) + nameBBox.height, node?.height || 0);
  const x = -w / 2;
  const y = -h / 2;
  shapeSvg.selectAll("g:not(:first-child)").each((_, i, nodes) => {
    const text2 = select_default(nodes[i]);
    const transform = text2.attr("transform");
    let translateX = 0;
    let translateY = 0;
    if (transform) {
      const regex = RegExp(/translate\(([^,]+),([^)]+)\)/);
      const translate = regex.exec(transform);
      if (translate) {
        translateX = parseFloat(translate[1]);
        translateY = parseFloat(translate[2]);
        if (text2.attr("class").includes("attribute-name")) {
          translateX += maxTypeWidth;
        } else if (text2.attr("class").includes("attribute-keys")) {
          translateX += maxTypeWidth + maxNameWidth;
        } else if (text2.attr("class").includes("attribute-comment")) {
          translateX += maxTypeWidth + maxNameWidth + maxKeysWidth;
        }
      }
    }
    text2.attr("transform", `translate(${x + PADDING / 2 + translateX}, ${translateY + y + nameBBox.height + TEXT_PADDING / 2})`);
  });
  shapeSvg.select(".name").attr("transform", "translate(" + -nameBBox.width / 2 + ", " + (y + TEXT_PADDING / 2) + ")");
  if (theme != null && COLOR_THEMES.has(theme)) {
    const colorIndex = entityNode.colorIndex ?? 0;
    shapeSvg.attr("data-color-id", `color-${colorIndex % borderColorArray.length}`);
  }
  const roughRect = rc.rectangle(x, y, w, h, options);
  const rect2 = shapeSvg.insert(() => roughRect, ":first-child").attr("class", "outer-path").attr("style", cssStyles.join(""));
  yOffsets.push(0);
  for (const [i, row] of rows.entries()) {
    const contentRowIndex = i + 1;
    const isEven = contentRowIndex % 2 === 0 && row.yOffset !== 0;
    const roughRect2 = rc.rectangle(x, nameBBox.height + y + row?.yOffset, w, row?.rowHeight, {
      ...options,
      fill: isEven ? rowEven : rowOdd,
      stroke: nodeBorder
    });
    shapeSvg.insert(() => roughRect2, "g.label").attr("style", cssStyles.join("")).attr("class", `row-rect-${isEven ? "even" : "odd"}`);
  }
  const thickness = 0.0001;
  let points = lineToPolygon(x, nameBBox.height + y, w + x, nameBBox.height + y, thickness);
  let roughLine = rc.polygon(points.map((p) => [p.x, p.y]), options);
  shapeSvg.insert(() => roughLine).attr("class", "divider");
  points = lineToPolygon(maxTypeWidth + x, nameBBox.height + y, maxTypeWidth + x, h + y, thickness);
  roughLine = rc.polygon(points.map((p) => [p.x, p.y]), options);
  shapeSvg.insert(() => roughLine).attr("class", "divider");
  if (keysPresent) {
    const xCoord = maxTypeWidth + maxNameWidth + x;
    points = lineToPolygon(xCoord, nameBBox.height + y, xCoord, h + y, thickness);
    roughLine = rc.polygon(points.map((p) => [p.x, p.y]), options);
    shapeSvg.insert(() => roughLine).attr("class", "divider");
  }
  if (commentPresent) {
    const xCoord = maxTypeWidth + maxNameWidth + maxKeysWidth + x;
    points = lineToPolygon(xCoord, nameBBox.height + y, xCoord, h + y, thickness);
    roughLine = rc.polygon(points.map((p) => [p.x, p.y]), options);
    shapeSvg.insert(() => roughLine).attr("class", "divider");
  }
  for (const yOffset2 of yOffsets) {
    const yCoord = nameBBox.height + y + yOffset2;
    points = lineToPolygon(x, yCoord, w + x, yCoord, thickness);
    roughLine = rc.polygon(points.map((p) => [p.x, p.y]), options);
    shapeSvg.insert(() => roughLine).attr("class", "divider");
  }
  updateNodeBounds(node, rect2);
  if (nodeStyles && node.look !== "handDrawn") {
    if (theme != null && REDUX_THEMES.has(theme)) {
      shapeSvg.selectAll("path").attr("style", nodeStyles);
    } else {
      const allStyle = nodeStyles.split(";");
      const strokeStyles = allStyle?.filter((e) => {
        return e.includes("stroke");
      })?.map((s) => `${s}`).join("; ");
      shapeSvg.selectAll("path").attr("style", strokeStyles ?? "");
      shapeSvg.selectAll(".row-rect-even path").attr("style", nodeStyles);
    }
  }
  node.intersect = function(point) {
    return intersect_default.rect(node, point);
  };
  return shapeSvg;
}
__name(erBox, "erBox");
async function addText(shapeSvg, labelText, config, translateX = 0, translateY = 0, classes = [], style = "") {
  const label = shapeSvg.insert("g").attr("class", `label ${classes.join(" ")}`).attr("transform", `translate(${translateX}, ${translateY})`).attr("style", style);
  if (labelText !== parseGenericTypes(labelText)) {
    labelText = parseGenericTypes(labelText);
    labelText = labelText.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }
  const text2 = label.node().appendChild(await createText(label, labelText, {
    width: calculateTextWidth(labelText, config) + 100,
    style,
    useHtmlLabels: config.htmlLabels
  }, config));
  if (labelText.includes("&lt;") || labelText.includes("&gt;")) {
    let child = text2.children[0];
    child.textContent = child.textContent.replaceAll("&lt;", "<").replaceAll("&gt;", ">");
    while (child.childNodes[0]) {
      child = child.childNodes[0];
      child.textContent = child.textContent.replaceAll("&lt;", "<").replaceAll("&gt;", ">");
    }
  }
  let bbox = text2.getBBox();
  if (evaluate(config.htmlLabels)) {
    const div = text2.children[0];
    div.style.textAlign = "start";
    const dv = select_default(text2);
    bbox = div.getBoundingClientRect();
    dv.attr("width", bbox.width);
    dv.attr("height", bbox.height);
  }
  return bbox;
}
__name(addText, "addText");
function lineToPolygon(x1, y1, x2, y2, thickness) {
  if (x1 === x2) {
    return [
      { x: x1 - thickness / 2, y: y1 },
      { x: x1 + thickness / 2, y: y1 },
      { x: x2 + thickness / 2, y: y2 },
      { x: x2 - thickness / 2, y: y2 }
    ];
  }
  return [
    { x: x1, y: y1 - thickness / 2 },
    { x: x1, y: y1 + thickness / 2 },
    { x: x2, y: y2 + thickness / 2 },
    { x: x2, y: y2 - thickness / 2 }
  ];
}
__name(lineToPolygon, "lineToPolygon");
async function textHelper(parent, node, config, useHtmlLabels, GAP = config.class.padding ?? 12) {
  const TEXT_PADDING = !useHtmlLabels ? 3 : 0;
  const shapeSvg = parent.insert("g").attr("class", getNodeClasses(node)).attr("id", node.domId || node.id);
  let annotationGroup = null;
  let labelGroup = null;
  let membersGroup = null;
  let methodsGroup = null;
  let annotationGroupHeight = 0;
  let labelGroupHeight = 0;
  let membersGroupHeight = 0;
  annotationGroup = shapeSvg.insert("g").attr("class", "annotation-group text");
  if (node.annotations.length > 0) {
    const annotation = node.annotations[0];
    await addText2(annotationGroup, { text: `«${annotation}»` }, 0);
    const annotationGroupBBox = annotationGroup.node().getBBox();
    annotationGroupHeight = annotationGroupBBox.height;
  }
  labelGroup = shapeSvg.insert("g").attr("class", "label-group text");
  await addText2(labelGroup, node, 0, ["font-weight: bolder"]);
  const labelGroupBBox = labelGroup.node().getBBox();
  labelGroupHeight = labelGroupBBox.height;
  membersGroup = shapeSvg.insert("g").attr("class", "members-group text");
  let yOffset = 0;
  for (const member of node.members) {
    const height = await addText2(membersGroup, member, yOffset, [member.parseClassifier()]);
    yOffset += height + TEXT_PADDING;
  }
  membersGroupHeight = membersGroup.node().getBBox().height;
  if (membersGroupHeight <= 0) {
    membersGroupHeight = GAP / 2;
  }
  methodsGroup = shapeSvg.insert("g").attr("class", "methods-group text");
  let methodsYOffset = 0;
  for (const method of node.methods) {
    const height = await addText2(methodsGroup, method, methodsYOffset, [method.parseClassifier()]);
    methodsYOffset += height + TEXT_PADDING;
  }
  let bbox = shapeSvg.node().getBBox();
  if (annotationGroup !== null) {
    const annotationGroupBBox = annotationGroup.node().getBBox();
    annotationGroup.attr("transform", `translate(${-annotationGroupBBox.width / 2})`);
  }
  labelGroup.attr("transform", `translate(${-labelGroupBBox.width / 2}, ${annotationGroupHeight})`);
  bbox = shapeSvg.node().getBBox();
  membersGroup.attr("transform", `translate(${0}, ${annotationGroupHeight + labelGroupHeight + GAP * 2})`);
  bbox = shapeSvg.node().getBBox();
  methodsGroup.attr("transform", `translate(${0}, ${annotationGroupHeight + labelGroupHeight + (membersGroupHeight ? membersGroupHeight + GAP * 4 : GAP * 2)})`);
  bbox = shapeSvg.node().getBBox();
  return { shapeSvg, bbox };
}
__name(textHelper, "textHelper");
async function addText2(parentGroup, node, yOffset, styles = []) {
  const textEl = parentGroup.insert("g").attr("class", "label").attr("style", styles.join("; "));
  const config = getConfig();
  let useHtmlLabels = "useHtmlLabels" in node ? node.useHtmlLabels : evaluate(config.htmlLabels) ?? true;
  let textContent = "";
  if ("text" in node) {
    textContent = node.text;
  } else {
    textContent = node.label;
  }
  if (!useHtmlLabels && textContent.startsWith("\\")) {
    textContent = textContent.substring(1);
  }
  if (hasKatex(textContent)) {
    useHtmlLabels = true;
  }
  const text2 = await createText(textEl, sanitizeText3(decodeEntities(textContent)), {
    width: calculateTextWidth(textContent, config) + 50,
    classes: "markdown-node-label",
    useHtmlLabels
  }, config);
  let bbox;
  let numberOfLines = 1;
  if (!useHtmlLabels) {
    if (styles.includes("font-weight: bolder")) {
      select_default(text2).selectAll("tspan").attr("font-weight", "");
    }
    numberOfLines = text2.children.length;
    const textChild = text2.children[0];
    if (text2.textContent === "" || text2.textContent.includes("&gt")) {
      textChild.textContent = textContent[0] + textContent.substring(1).replaceAll("&gt;", ">").replaceAll("&lt;", "<").trim();
      const preserveSpace = textContent[1] === " ";
      if (preserveSpace) {
        textChild.textContent = textChild.textContent[0] + " " + textChild.textContent.substring(1);
      }
    }
    if (textChild.textContent === "undefined") {
      textChild.textContent = "";
    }
    bbox = text2.getBBox();
  } else {
    const div = text2.children[0];
    const dv = select_default(text2);
    numberOfLines = div.innerHTML.split("<br>").length;
    if (div.innerHTML.includes("</math>")) {
      numberOfLines += div.innerHTML.split("<mrow>").length - 1;
    }
    const images = div.getElementsByTagName("img");
    if (images) {
      const noImgText = textContent.replace(/<img[^>]*>/g, "").trim() === "";
      await Promise.all([...images].map((img) => new Promise((res) => {
        function setupImage() {
          img.style.display = "flex";
          img.style.flexDirection = "column";
          if (noImgText) {
            const bodyFontSize = config.fontSize?.toString() ?? window.getComputedStyle(document.body).fontSize;
            const enlargingFactor = 5;
            const width = parseInt(bodyFontSize, 10) * enlargingFactor + "px";
            img.style.minWidth = width;
            img.style.maxWidth = width;
          } else {
            img.style.width = "100%";
          }
          res(img);
        }
        __name(setupImage, "setupImage");
        setTimeout(() => {
          if (img.complete) {
            setupImage();
          }
        });
        img.addEventListener("error", setupImage);
        img.addEventListener("load", setupImage);
      })));
    }
    bbox = div.getBoundingClientRect();
    dv.attr("width", bbox.width);
    dv.attr("height", bbox.height);
  }
  textEl.attr("transform", "translate(0," + (-bbox.height / (2 * numberOfLines) + yOffset) + ")");
  return bbox.height;
}
__name(addText2, "addText");
async function classBox(parent, node) {
  const config = getConfig2();
  const { themeVariables } = config;
  const { useGradient } = themeVariables;
  const PADDING = config.class.padding ?? 12;
  const GAP = PADDING;
  const useHtmlLabels = node.useHtmlLabels ?? evaluate(config.htmlLabels) ?? true;
  const classNode = node;
  classNode.annotations = classNode.annotations ?? [];
  classNode.members = classNode.members ?? [];
  classNode.methods = classNode.methods ?? [];
  const { shapeSvg, bbox } = await textHelper(parent, node, config, useHtmlLabels, GAP);
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  node.cssStyles = classNode.styles || "";
  const styles = classNode.styles?.join(";") || nodeStyles || "";
  if (!node.cssStyles) {
    node.cssStyles = styles.replaceAll("!important", "").split(";");
  }
  const renderExtraBox = classNode.members.length === 0 && classNode.methods.length === 0 && !config.class?.hideEmptyMembersBox;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const w = Math.max(node.width ?? 0, bbox.width);
  let h = Math.max(node.height ?? 0, bbox.height);
  const nodeHeightGreater = (node.height ?? 0) > bbox.height;
  if (classNode.members.length === 0 && classNode.methods.length === 0) {
    h += GAP;
  } else if (classNode.members.length > 0 && classNode.methods.length === 0) {
    h += GAP * 2;
  }
  const x = -w / 2;
  const y = -h / 2;
  let extraHeight = renderExtraBox ? PADDING * 2 : classNode.members.length === 0 && classNode.methods.length === 0 ? -PADDING : 0;
  if (nodeHeightGreater) {
    extraHeight = PADDING * 2;
  }
  const roughRect = rc.rectangle(x - PADDING, y - PADDING - (renderExtraBox ? PADDING : classNode.members.length === 0 && classNode.methods.length === 0 ? -PADDING / 2 : 0), w + 2 * PADDING, h + 2 * PADDING + extraHeight, options);
  const rect2 = shapeSvg.insert(() => roughRect, ":first-child");
  rect2.attr("class", "basic label-container outer-path");
  const rectBBox = rect2.node().getBBox();
  const annotationGroupHeight = shapeSvg.select(".annotation-group").node().getBBox().height - (renderExtraBox ? PADDING / 2 : 0) || 0;
  const labelGroupHeight = shapeSvg.select(".label-group").node().getBBox().height - (renderExtraBox ? PADDING / 2 : 0) || 0;
  const membersGroupHeight = shapeSvg.select(".members-group").node().getBBox().height - (renderExtraBox ? PADDING / 2 : 0) || 0;
  const methodsAreaPlacement = (annotationGroupHeight + labelGroupHeight + y + PADDING - (y - PADDING - (renderExtraBox ? PADDING : classNode.members.length === 0 && classNode.methods.length === 0 ? -PADDING / 2 : 0))) / 2;
  shapeSvg.selectAll(".text").each((_, i, nodes) => {
    const text2 = select_default(nodes[i]);
    const transform = text2.attr("transform");
    let translateY = 0;
    if (transform) {
      const regex = RegExp(/translate\(([^,]+),([^)]+)\)/);
      const translate = regex.exec(transform);
      if (translate) {
        translateY = parseFloat(translate[2]);
      }
    }
    let newTranslateY = translateY + y + PADDING - (renderExtraBox ? PADDING : classNode.members.length === 0 && classNode.methods.length === 0 ? -PADDING / 2 : 0);
    if (text2.attr("class").includes("methods-group")) {
      const membersGroupHeightForMethods = Math.max(membersGroupHeight, GAP / 2);
      if (nodeHeightGreater) {
        newTranslateY = Math.max(methodsAreaPlacement, annotationGroupHeight + labelGroupHeight + membersGroupHeightForMethods + y + GAP * 2 + PADDING) + GAP * 2;
      } else {
        newTranslateY = annotationGroupHeight + labelGroupHeight + membersGroupHeightForMethods + y + GAP * 4 + PADDING;
      }
    }
    if (classNode.members.length === 0 && classNode.methods.length === 0 && config.class?.hideEmptyMembersBox) {
      if (classNode.annotations.length > 0) {
        newTranslateY = translateY - GAP;
      } else {
        newTranslateY = translateY;
      }
    }
    if (!useHtmlLabels) {
      newTranslateY -= 4;
    }
    let newTranslateX = x;
    if (text2.attr("class").includes("label-group") || text2.attr("class").includes("annotation-group")) {
      newTranslateX = -text2.node()?.getBBox().width / 2 || 0;
      shapeSvg.selectAll("text").each(function(_2, i2, nodes2) {
        if (window.getComputedStyle(nodes2[i2]).textAnchor === "middle") {
          newTranslateX = 0;
        }
      });
    }
    text2.attr("transform", `translate(${newTranslateX}, ${newTranslateY})`);
  });
  if (classNode.members.length > 0 || classNode.methods.length > 0 || renderExtraBox) {
    const firstLineY = annotationGroupHeight + labelGroupHeight + y + PADDING;
    const roughLine = rc.line(rectBBox.x, firstLineY, rectBBox.x + rectBBox.width, firstLineY + 0.001, options);
    const line = shapeSvg.insert(() => roughLine);
    line.attr("class", `divider${node.look === "neo" && !useGradient ? " neo-line" : ""}`).attr("style", styles);
  }
  if (renderExtraBox || classNode.members.length > 0 || classNode.methods.length > 0) {
    const secondLineY = annotationGroupHeight + labelGroupHeight + membersGroupHeight + y + GAP * 2 + PADDING;
    const roughLine = rc.line(rectBBox.x, nodeHeightGreater ? Math.max(methodsAreaPlacement, secondLineY) : secondLineY, rectBBox.x + rectBBox.width, (nodeHeightGreater ? Math.max(methodsAreaPlacement, secondLineY) : secondLineY) + 0.001, options);
    const line = shapeSvg.insert(() => roughLine);
    line.attr("class", `divider${node.look === "neo" && !useGradient ? " neo-line" : ""}`).attr("style", styles);
  }
  if (classNode.look !== "handDrawn") {
    shapeSvg.selectAll("path").attr("style", styles);
  }
  rect2.select(":nth-child(2)").attr("style", styles);
  shapeSvg.selectAll(".divider").select("path").attr("style", styles);
  if (node.labelStyle) {
    shapeSvg.selectAll("span").attr("style", node.labelStyle);
  } else {
    shapeSvg.selectAll("span").attr("style", styles);
  }
  if (!useHtmlLabels) {
    const colorRegex = RegExp(/color\s*:\s*([^;]*)/);
    const match = colorRegex.exec(styles);
    if (match) {
      const colorStyle = match[0].replace("color", "fill");
      shapeSvg.selectAll("tspan").attr("style", colorStyle);
    } else if (labelStyles) {
      const match2 = colorRegex.exec(labelStyles);
      if (match2) {
        const colorStyle = match2[0].replace("color", "fill");
        shapeSvg.selectAll("tspan").attr("style", colorStyle);
      }
    }
  }
  updateNodeBounds(node, rect2);
  node.intersect = function(point) {
    return intersect_default.rect(node, point);
  };
  return shapeSvg;
}
__name(classBox, "classBox");
async function requirementBox(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const requirementNode = node;
  const elementNode = node;
  const padding = 20;
  const gap = 20;
  const isRequirementNode = "verifyMethod" in node;
  const classes = getNodeClasses(node);
  const { themeVariables } = getConfig2();
  const { borderColorArray, requirementEdgeLabelBackground } = themeVariables;
  const shapeSvg = parent.insert("g").attr("class", classes).attr("id", node.domId ?? node.id);
  let typeHeight;
  if (isRequirementNode) {
    typeHeight = await addText3(shapeSvg, `&lt;&lt;${requirementNode.type}&gt;&gt;`, 0, node.labelStyle);
  } else {
    typeHeight = await addText3(shapeSvg, "&lt;&lt;Element&gt;&gt;", 0, node.labelStyle);
  }
  let accumulativeHeight = typeHeight;
  const nameHeight = await addText3(shapeSvg, requirementNode.name, accumulativeHeight, node.labelStyle + "; font-weight: bold;");
  accumulativeHeight += nameHeight + gap;
  if (isRequirementNode) {
    const idHeight = await addText3(shapeSvg, `${requirementNode.requirementId ? `ID: ${requirementNode.requirementId}` : ""}`, accumulativeHeight, node.labelStyle);
    accumulativeHeight += idHeight;
    const textHeight = await addText3(shapeSvg, `${requirementNode.text ? `Text: ${requirementNode.text}` : ""}`, accumulativeHeight, node.labelStyle);
    accumulativeHeight += textHeight;
    const riskHeight = await addText3(shapeSvg, `${requirementNode.risk ? `Risk: ${requirementNode.risk}` : ""}`, accumulativeHeight, node.labelStyle);
    accumulativeHeight += riskHeight;
    await addText3(shapeSvg, `${requirementNode.verifyMethod ? `Verification: ${requirementNode.verifyMethod}` : ""}`, accumulativeHeight, node.labelStyle);
  } else {
    const typeHeight2 = await addText3(shapeSvg, `${elementNode.type ? `Type: ${elementNode.type}` : ""}`, accumulativeHeight, node.labelStyle);
    accumulativeHeight += typeHeight2;
    await addText3(shapeSvg, `${elementNode.docRef ? `Doc Ref: ${elementNode.docRef}` : ""}`, accumulativeHeight, node.labelStyle);
  }
  const totalWidth = (shapeSvg.node()?.getBBox().width ?? 200) + padding;
  const totalHeight = (shapeSvg.node()?.getBBox().height ?? 200) + padding;
  const x = -totalWidth / 2;
  const y = -totalHeight / 2;
  const rc = at.svg(shapeSvg);
  const options = userNodeOverrides(node, {});
  if (node.look !== "handDrawn") {
    options.roughness = 0;
    options.fillStyle = "solid";
  }
  const roughRect = rc.rectangle(x, y, totalWidth, totalHeight, options);
  const rect2 = shapeSvg.insert(() => roughRect, ":first-child");
  rect2.attr("class", "basic label-container outer-path").attr("style", nodeStyles);
  if (borderColorArray?.length) {
    const colorIndex = node.colorIndex ?? 0;
    shapeSvg.attr("data-color-id", `color-${colorIndex % borderColorArray.length}`);
  }
  shapeSvg.selectAll(".label").each((_, i, nodes) => {
    const text2 = select_default(nodes[i]);
    const transform = text2.attr("transform");
    let translateX = 0;
    let translateY = 0;
    if (transform) {
      const regex = RegExp(/translate\(([^,]+),([^)]+)\)/);
      const translate = regex.exec(transform);
      if (translate) {
        translateX = parseFloat(translate[1]);
        translateY = parseFloat(translate[2]);
      }
    }
    const newTranslateY = translateY - totalHeight / 2;
    let newTranslateX = x + padding / 2;
    if (i === 0 || i === 1) {
      newTranslateX = translateX;
    }
    text2.attr("transform", `translate(${newTranslateX}, ${newTranslateY + padding})`);
  });
  if (accumulativeHeight > typeHeight + nameHeight + gap) {
    const lineY = y + typeHeight + nameHeight + gap;
    let roughLine;
    if (node.look === "neo") {
      const thickness = 0.001;
      const polygonPoints = [
        [x, lineY],
        [x + totalWidth, lineY],
        [x + totalWidth, lineY + thickness],
        [x, lineY + thickness]
      ];
      roughLine = rc.polygon(polygonPoints, options);
    } else {
      roughLine = rc.line(x, lineY, x + totalWidth, lineY, options);
    }
    const dividerLine = shapeSvg.insert(() => roughLine);
    dividerLine.attr("class", "divider");
  }
  updateNodeBounds(node, rect2);
  node.intersect = function(point) {
    return intersect_default.rect(node, point);
  };
  if (nodeStyles && node.look !== "handDrawn" && (requirementEdgeLabelBackground || borderColorArray?.length)) {
    shapeSvg.selectAll("path").attr("style", nodeStyles);
  }
  return shapeSvg;
}
__name(requirementBox, "requirementBox");
async function addText3(parentGroup, inputText, yOffset, style = "") {
  if (inputText === "") {
    return 0;
  }
  const textEl = parentGroup.insert("g").attr("class", "label").attr("style", style);
  const config = getConfig2();
  const useHtmlLabels = config.htmlLabels ?? true;
  const text2 = await createText(textEl, sanitizeText3(decodeEntities(inputText)), {
    width: calculateTextWidth(inputText, config) + 50,
    classes: "markdown-node-label",
    useHtmlLabels,
    style
  }, config);
  let bbox;
  if (!useHtmlLabels) {
    const textChild = text2.children[0];
    for (const child of textChild.children) {
      if (style) {
        child.setAttribute("style", style);
      }
    }
    bbox = text2.getBBox();
    bbox.height += 6;
  } else {
    const div = text2.children[0];
    const dv = select_default(text2);
    bbox = div.getBoundingClientRect();
    dv.attr("width", bbox.width);
    dv.attr("height", bbox.height);
  }
  textEl.attr("transform", `translate(${-bbox.width / 2},${-bbox.height / 2 + yOffset})`);
  return bbox.height;
}
__name(addText3, "addText");
var colorFromPriority = /* @__PURE__ */ __name((priority) => {
  switch (priority) {
    case "Very High":
      return "red";
    case "High":
      return "orange";
    case "Medium":
      return null;
    case "Low":
      return "blue";
    case "Very Low":
      return "lightblue";
  }
}, "colorFromPriority");
async function kanbanItem(parent, kanbanNode, { config }) {
  const { labelStyles, nodeStyles } = styles2String(kanbanNode);
  kanbanNode.labelStyle = labelStyles || "";
  const labelPaddingX = 10;
  const orgWidth = kanbanNode.width;
  kanbanNode.width = (kanbanNode.width ?? 200) - 10;
  const {
    shapeSvg,
    bbox,
    label: labelElTitle
  } = await labelHelper(parent, kanbanNode, getNodeClasses(kanbanNode));
  const padding = kanbanNode.padding || 10;
  let ticketUrl = "";
  let link;
  if ("ticket" in kanbanNode && kanbanNode.ticket && config?.kanban?.ticketBaseUrl) {
    ticketUrl = config?.kanban?.ticketBaseUrl.replace("#TICKET#", kanbanNode.ticket);
    link = shapeSvg.insert("svg:a", ":first-child").attr("class", "kanban-ticket-link").attr("xlink:href", ticketUrl).attr("target", "_blank");
  }
  const options = {
    useHtmlLabels: kanbanNode.useHtmlLabels,
    labelStyle: kanbanNode.labelStyle || "",
    width: kanbanNode.width,
    img: kanbanNode.img,
    padding: kanbanNode.padding || 8,
    centerLabel: false
  };
  let labelEl, bbox2;
  if (link) {
    ({ label: labelEl, bbox: bbox2 } = await insertLabel(link, "ticket" in kanbanNode && kanbanNode.ticket || "", options));
  } else {
    ({ label: labelEl, bbox: bbox2 } = await insertLabel(shapeSvg, "ticket" in kanbanNode && kanbanNode.ticket || "", options));
  }
  const { label: labelElAssigned, bbox: bboxAssigned } = await insertLabel(shapeSvg, "assigned" in kanbanNode && kanbanNode.assigned || "", options);
  kanbanNode.width = orgWidth;
  const labelPaddingY = 10;
  const totalWidth = kanbanNode?.width || 0;
  const heightAdj = Math.max(bbox2.height, bboxAssigned.height) / 2;
  const totalHeight = Math.max(bbox.height + labelPaddingY * 2, kanbanNode?.height || 0) + heightAdj;
  const x = -totalWidth / 2;
  const y = -totalHeight / 2;
  labelElTitle.attr("transform", "translate(" + (padding - totalWidth / 2) + ", " + (-heightAdj - bbox.height / 2) + ")");
  labelEl.attr("transform", "translate(" + (padding - totalWidth / 2) + ", " + (-heightAdj + bbox.height / 2) + ")");
  labelElAssigned.attr("transform", "translate(" + (padding + totalWidth / 2 - bboxAssigned.width - 2 * labelPaddingX) + ", " + (-heightAdj + bbox.height / 2) + ")");
  let rect2;
  const { rx, ry } = kanbanNode;
  const { cssStyles } = kanbanNode;
  if (kanbanNode.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const options2 = userNodeOverrides(kanbanNode, {});
    const roughNode = rx || ry ? rc.path(createRoundedRectPathD(x, y, totalWidth, totalHeight, rx || 0), options2) : rc.rectangle(x, y, totalWidth, totalHeight, options2);
    rect2 = shapeSvg.insert(() => roughNode, ":first-child");
    rect2.attr("class", "basic label-container").attr("style", cssStyles ? cssStyles : null);
  } else {
    rect2 = shapeSvg.insert("rect", ":first-child");
    rect2.attr("class", "basic label-container __APA__").attr("style", nodeStyles).attr("rx", rx ?? 5).attr("ry", ry ?? 5).attr("x", x).attr("y", y).attr("width", totalWidth).attr("height", totalHeight);
    const priority = "priority" in kanbanNode && kanbanNode.priority;
    if (priority) {
      const line = shapeSvg.append("line");
      const lineX = x + 2;
      const y1 = y + Math.floor((rx ?? 0) / 2);
      const y2 = y + totalHeight - Math.floor((rx ?? 0) / 2);
      line.attr("x1", lineX).attr("y1", y1).attr("x2", lineX).attr("y2", y2).attr("stroke-width", "4").attr("stroke", colorFromPriority(priority));
    }
  }
  updateNodeBounds(kanbanNode, rect2);
  kanbanNode.height = totalHeight;
  kanbanNode.intersect = function(point) {
    return intersect_default.rect(kanbanNode, point);
  };
  return shapeSvg;
}
__name(kanbanItem, "kanbanItem");
async function bang(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const { shapeSvg, bbox, halfPadding, label } = await labelHelper(parent, node, getNodeClasses(node));
  const w = bbox.width + 10 * halfPadding;
  const h = bbox.height + 8 * halfPadding;
  const r = 0.15 * w;
  const { cssStyles } = node;
  const minWidth = bbox.width + 20;
  const minHeight = bbox.height + 20;
  const effectiveWidth = Math.max(w, minWidth);
  const effectiveHeight = Math.max(h, minHeight);
  label.attr("transform", `translate(${-bbox.width / 2}, ${-bbox.height / 2})`);
  let bangElem;
  const path = `M0 0 
    a${r},${r} 1 0,0 ${effectiveWidth * 0.25},${-1 * effectiveHeight * 0.1}
    a${r},${r} 1 0,0 ${effectiveWidth * 0.25},${0}
    a${r},${r} 1 0,0 ${effectiveWidth * 0.25},${0}
    a${r},${r} 1 0,0 ${effectiveWidth * 0.25},${effectiveHeight * 0.1}

    a${r},${r} 1 0,0 ${effectiveWidth * 0.15},${effectiveHeight * 0.33}
    a${r * 0.8},${r * 0.8} 1 0,0 0,${effectiveHeight * 0.34}
    a${r},${r} 1 0,0 ${-1 * effectiveWidth * 0.15},${effectiveHeight * 0.33}

    a${r},${r} 1 0,0 ${-1 * effectiveWidth * 0.25},${effectiveHeight * 0.15}
    a${r},${r} 1 0,0 ${-1 * effectiveWidth * 0.25},0
    a${r},${r} 1 0,0 ${-1 * effectiveWidth * 0.25},0
    a${r},${r} 1 0,0 ${-1 * effectiveWidth * 0.25},${-1 * effectiveHeight * 0.15}

    a${r},${r} 1 0,0 ${-1 * effectiveWidth * 0.1},${-1 * effectiveHeight * 0.33}
    a${r * 0.8},${r * 0.8} 1 0,0 0,${-1 * effectiveHeight * 0.34}
    a${r},${r} 1 0,0 ${effectiveWidth * 0.1},${-1 * effectiveHeight * 0.33}
  H0 V0 Z`;
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const options = userNodeOverrides(node, {});
    const roughNode = rc.path(path, options);
    bangElem = shapeSvg.insert(() => roughNode, ":first-child");
    bangElem.attr("class", "basic label-container").attr("style", handleUndefinedAttr(cssStyles));
  } else {
    bangElem = shapeSvg.insert("path", ":first-child").attr("class", "basic label-container").attr("style", nodeStyles).attr("d", path);
  }
  bangElem.attr("transform", `translate(${-effectiveWidth / 2}, ${-effectiveHeight / 2})`);
  updateNodeBounds(node, bangElem);
  node.calcIntersect = function(bounds, point) {
    return intersect_default.rect(bounds, point);
  };
  node.intersect = function(point) {
    log.info("Bang intersect", node, point);
    return intersect_default.rect(node, point);
  };
  return shapeSvg;
}
__name(bang, "bang");
async function cloud(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const { shapeSvg, bbox, halfPadding, label } = await labelHelper(parent, node, getNodeClasses(node));
  const w = bbox.width + 2 * halfPadding;
  const h = bbox.height + 2 * halfPadding;
  const r1 = 0.15 * w;
  const r2 = 0.25 * w;
  const r3 = 0.35 * w;
  const r4 = 0.2 * w;
  const { cssStyles } = node;
  let cloudElem;
  const path = `M0 0 
    a${r1},${r1} 0 0,1 ${w * 0.25},${-1 * w * 0.1}
    a${r3},${r3} 1 0,1 ${w * 0.4},${-1 * w * 0.1}
    a${r2},${r2} 1 0,1 ${w * 0.35},${w * 0.2}

    a${r1},${r1} 1 0,1 ${w * 0.15},${h * 0.35}
    a${r4},${r4} 1 0,1 ${-1 * w * 0.15},${h * 0.65}

    a${r2},${r1} 1 0,1 ${-1 * w * 0.25},${w * 0.15}
    a${r3},${r3} 1 0,1 ${-1 * w * 0.5},0
    a${r1},${r1} 1 0,1 ${-1 * w * 0.25},${-1 * w * 0.15}

    a${r1},${r1} 1 0,1 ${-1 * w * 0.1},${-1 * h * 0.35}
    a${r4},${r4} 1 0,1 ${w * 0.1},${-1 * h * 0.65}
  H0 V0 Z`;
  if (node.look === "handDrawn") {
    const rc = at.svg(shapeSvg);
    const options = userNodeOverrides(node, {});
    const roughNode = rc.path(path, options);
    cloudElem = shapeSvg.insert(() => roughNode, ":first-child");
    cloudElem.attr("class", "basic label-container").attr("style", handleUndefinedAttr(cssStyles));
  } else {
    cloudElem = shapeSvg.insert("path", ":first-child").attr("class", "basic label-container").attr("style", nodeStyles).attr("d", path);
  }
  label.attr("transform", `translate(${-bbox.width / 2}, ${-bbox.height / 2})`);
  cloudElem.attr("transform", `translate(${-w / 2}, ${-h / 2})`);
  updateNodeBounds(node, cloudElem);
  node.calcIntersect = function(bounds, point) {
    return intersect_default.rect(bounds, point);
  };
  node.intersect = function(point) {
    log.info("Cloud intersect", node, point);
    return intersect_default.rect(node, point);
  };
  return shapeSvg;
}
__name(cloud, "cloud");
async function defaultMindmapNode(parent, node) {
  const { labelStyles, nodeStyles } = styles2String(node);
  node.labelStyle = labelStyles;
  const { shapeSvg, bbox, halfPadding, label } = await labelHelper(parent, node, getNodeClasses(node));
  const w = bbox.width + 8 * halfPadding;
  const h = bbox.height + 2 * halfPadding;
  const rd = 5;
  const rectPath = node.look === "neo" ? `
    M${-w / 2} ${h / 2 - rd}
    v${-h + 2 * rd}
    q0,-${rd} ${rd},-${rd}
    h${w - 2 * rd}
    q${rd},0 ${rd},${rd}
    v${h - rd}
    H${-w / 2}
    Z
  ` : `
    M${-w / 2} ${h / 2 - rd}
    v${-h + 2 * rd}
    q0,-${rd} ${rd},-${rd}
    h${w - 2 * rd}
    q${rd},0 ${rd},${rd}
    v${h - 2 * rd}
    q0,${rd} ${-rd},${rd}
    h${-(w - 2 * rd)}
    q${-rd},0 ${-rd},${-rd}
    Z
  `;
  if (!node.domId) {
    throw new Error(`defaultMindmapNode: node "${node.id}" is missing a domId — was render.ts domId prefixing skipped?`);
  }
  const bg = shapeSvg.append("path").attr("id", node.domId).attr("class", "node-bkg node-" + node.type).attr("style", nodeStyles).attr("d", rectPath);
  shapeSvg.append("line").attr("class", "node-line-").attr("x1", -w / 2).attr("y1", h / 2).attr("x2", w / 2).attr("y2", h / 2);
  label.attr("transform", `translate(${-bbox.width / 2}, ${-bbox.height / 2})`);
  shapeSvg.append(() => label.node());
  updateNodeBounds(node, bg);
  node.calcIntersect = function(bounds, point) {
    return intersect_default.rect(bounds, point);
  };
  node.intersect = function(point) {
    return intersect_default.rect(node, point);
  };
  return shapeSvg;
}
__name(defaultMindmapNode, "defaultMindmapNode");
async function mindmapCircle(parent, node) {
  const options = {
    padding: node.padding ?? 0
  };
  return circle(parent, node, options);
}
__name(mindmapCircle, "mindmapCircle");
var shapesDefs = [
  {
    semanticName: "Process",
    name: "Rectangle",
    shortName: "rect",
    description: "Standard process shape",
    aliases: ["proc", "process", "rectangle"],
    internalAliases: ["squareRect"],
    handler: squareRect2
  },
  {
    semanticName: "Event",
    name: "Rounded Rectangle",
    shortName: "rounded",
    description: "Represents an event",
    aliases: ["event"],
    internalAliases: ["roundedRect"],
    handler: roundedRect
  },
  {
    semanticName: "Terminal Point",
    name: "Stadium",
    shortName: "stadium",
    description: "Terminal point",
    aliases: ["terminal", "pill"],
    handler: stadium
  },
  {
    semanticName: "Subprocess",
    name: "Framed Rectangle",
    shortName: "fr-rect",
    description: "Subprocess",
    aliases: ["subprocess", "subproc", "framed-rectangle", "subroutine"],
    handler: subroutine
  },
  {
    semanticName: "Database",
    name: "Cylinder",
    shortName: "cyl",
    description: "Database storage",
    aliases: ["db", "database", "cylinder"],
    handler: cylinder
  },
  {
    semanticName: "Data Store",
    name: "Data Store",
    shortName: "datastore",
    description: "Data flow diagram data store",
    aliases: ["data-store"],
    handler: datastore
  },
  {
    semanticName: "Start",
    name: "Circle",
    shortName: "circle",
    description: "Starting point",
    aliases: ["circ"],
    handler: circle
  },
  {
    semanticName: "Bang",
    name: "Bang",
    shortName: "bang",
    description: "Bang",
    aliases: ["bang"],
    handler: bang
  },
  {
    semanticName: "Cloud",
    name: "Cloud",
    shortName: "cloud",
    description: "cloud",
    aliases: ["cloud"],
    handler: cloud
  },
  {
    semanticName: "Decision",
    name: "Diamond",
    shortName: "diam",
    description: "Decision-making step",
    aliases: ["decision", "diamond", "question"],
    handler: question
  },
  {
    semanticName: "Prepare Conditional",
    name: "Hexagon",
    shortName: "hex",
    description: "Preparation or condition step",
    aliases: ["hexagon", "prepare"],
    handler: hexagon
  },
  {
    semanticName: "Data Input/Output",
    name: "Lean Right",
    shortName: "lean-r",
    description: "Represents input or output",
    aliases: ["lean-right", "in-out"],
    internalAliases: ["lean_right"],
    handler: lean_right
  },
  {
    semanticName: "Data Input/Output",
    name: "Lean Left",
    shortName: "lean-l",
    description: "Represents output or input",
    aliases: ["lean-left", "out-in"],
    internalAliases: ["lean_left"],
    handler: lean_left
  },
  {
    semanticName: "Priority Action",
    name: "Trapezoid Base Bottom",
    shortName: "trap-b",
    description: "Priority action",
    aliases: ["priority", "trapezoid-bottom", "trapezoid"],
    handler: trapezoid
  },
  {
    semanticName: "Manual Operation",
    name: "Trapezoid Base Top",
    shortName: "trap-t",
    description: "Represents a manual task",
    aliases: ["manual", "trapezoid-top", "inv-trapezoid"],
    internalAliases: ["inv_trapezoid"],
    handler: inv_trapezoid
  },
  {
    semanticName: "Stop",
    name: "Double Circle",
    shortName: "dbl-circ",
    description: "Represents a stop point",
    aliases: ["double-circle"],
    internalAliases: ["doublecircle"],
    handler: doublecircle
  },
  {
    semanticName: "Text Block",
    name: "Text Block",
    shortName: "text",
    description: "Text block",
    handler: text
  },
  {
    semanticName: "Card",
    name: "Notched Rectangle",
    shortName: "notch-rect",
    description: "Represents a card",
    aliases: ["card", "notched-rectangle"],
    handler: card
  },
  {
    semanticName: "Lined/Shaded Process",
    name: "Lined Rectangle",
    shortName: "lin-rect",
    description: "Lined process shape",
    aliases: ["lined-rectangle", "lined-process", "lin-proc", "shaded-process"],
    handler: shadedProcess
  },
  {
    semanticName: "Start",
    name: "Small Circle",
    shortName: "sm-circ",
    description: "Small starting point",
    aliases: ["start", "small-circle"],
    internalAliases: ["stateStart"],
    handler: stateStart
  },
  {
    semanticName: "Stop",
    name: "Framed Circle",
    shortName: "fr-circ",
    description: "Stop point",
    aliases: ["stop", "framed-circle"],
    internalAliases: ["stateEnd"],
    handler: stateEnd
  },
  {
    semanticName: "Fork/Join",
    name: "Filled Rectangle",
    shortName: "fork",
    description: "Fork or join in process flow",
    aliases: ["join"],
    internalAliases: ["forkJoin"],
    handler: forkJoin
  },
  {
    semanticName: "Collate",
    name: "Hourglass",
    shortName: "hourglass",
    description: "Represents a collate operation",
    aliases: ["hourglass", "collate"],
    handler: hourglass
  },
  {
    semanticName: "Comment",
    name: "Curly Brace",
    shortName: "brace",
    description: "Adds a comment",
    aliases: ["comment", "brace-l"],
    handler: curlyBraceLeft
  },
  {
    semanticName: "Comment Right",
    name: "Curly Brace",
    shortName: "brace-r",
    description: "Adds a comment",
    handler: curlyBraceRight
  },
  {
    semanticName: "Comment with braces on both sides",
    name: "Curly Braces",
    shortName: "braces",
    description: "Adds a comment",
    handler: curlyBraces
  },
  {
    semanticName: "Com Link",
    name: "Lightning Bolt",
    shortName: "bolt",
    description: "Communication link",
    aliases: ["com-link", "lightning-bolt"],
    handler: lightningBolt
  },
  {
    semanticName: "Document",
    name: "Document",
    shortName: "doc",
    description: "Represents a document",
    aliases: ["doc", "document"],
    handler: waveEdgedRectangle
  },
  {
    semanticName: "Delay",
    name: "Half-Rounded Rectangle",
    shortName: "delay",
    description: "Represents a delay",
    aliases: ["half-rounded-rectangle"],
    handler: halfRoundedRectangle
  },
  {
    semanticName: "Direct Access Storage",
    name: "Horizontal Cylinder",
    shortName: "h-cyl",
    description: "Direct access storage",
    aliases: ["das", "horizontal-cylinder"],
    handler: tiltedCylinder
  },
  {
    semanticName: "Disk Storage",
    name: "Lined Cylinder",
    shortName: "lin-cyl",
    description: "Disk storage",
    aliases: ["disk", "lined-cylinder"],
    handler: linedCylinder
  },
  {
    semanticName: "Display",
    name: "Curved Trapezoid",
    shortName: "curv-trap",
    description: "Represents a display",
    aliases: ["curved-trapezoid", "display"],
    handler: curvedTrapezoid
  },
  {
    semanticName: "Divided Process",
    name: "Divided Rectangle",
    shortName: "div-rect",
    description: "Divided process shape",
    aliases: ["div-proc", "divided-rectangle", "divided-process"],
    handler: dividedRectangle
  },
  {
    semanticName: "Extract",
    name: "Triangle",
    shortName: "tri",
    description: "Extraction process",
    aliases: ["extract", "triangle"],
    handler: triangle
  },
  {
    semanticName: "Internal Storage",
    name: "Window Pane",
    shortName: "win-pane",
    description: "Internal storage",
    aliases: ["internal-storage", "window-pane"],
    handler: windowPane
  },
  {
    semanticName: "Junction",
    name: "Filled Circle",
    shortName: "f-circ",
    description: "Junction point",
    aliases: ["junction", "filled-circle"],
    handler: filledCircle
  },
  {
    semanticName: "Loop Limit",
    name: "Trapezoidal Pentagon",
    shortName: "notch-pent",
    description: "Loop limit step",
    aliases: ["loop-limit", "notched-pentagon"],
    handler: trapezoidalPentagon
  },
  {
    semanticName: "Manual File",
    name: "Flipped Triangle",
    shortName: "flip-tri",
    description: "Manual file operation",
    aliases: ["manual-file", "flipped-triangle"],
    handler: flippedTriangle
  },
  {
    semanticName: "Manual Input",
    name: "Sloped Rectangle",
    shortName: "sl-rect",
    description: "Manual input step",
    aliases: ["manual-input", "sloped-rectangle"],
    handler: slopedRect
  },
  {
    semanticName: "Multi-Document",
    name: "Stacked Document",
    shortName: "docs",
    description: "Multiple documents",
    aliases: ["documents", "st-doc", "stacked-document"],
    handler: multiWaveEdgedRectangle
  },
  {
    semanticName: "Multi-Process",
    name: "Stacked Rectangle",
    shortName: "st-rect",
    description: "Multiple processes",
    aliases: ["procs", "processes", "stacked-rectangle"],
    handler: multiRect
  },
  {
    semanticName: "Stored Data",
    name: "Bow Tie Rectangle",
    shortName: "bow-rect",
    description: "Stored data",
    aliases: ["stored-data", "bow-tie-rectangle"],
    handler: bowTieRect
  },
  {
    semanticName: "Summary",
    name: "Crossed Circle",
    shortName: "cross-circ",
    description: "Summary",
    aliases: ["summary", "crossed-circle"],
    handler: crossedCircle
  },
  {
    semanticName: "Tagged Document",
    name: "Tagged Document",
    shortName: "tag-doc",
    description: "Tagged document",
    aliases: ["tag-doc", "tagged-document"],
    handler: taggedWaveEdgedRectangle
  },
  {
    semanticName: "Tagged Process",
    name: "Tagged Rectangle",
    shortName: "tag-rect",
    description: "Tagged process",
    aliases: ["tagged-rectangle", "tag-proc", "tagged-process"],
    handler: taggedRect
  },
  {
    semanticName: "Paper Tape",
    name: "Flag",
    shortName: "flag",
    description: "Paper tape",
    aliases: ["paper-tape"],
    handler: waveRectangle
  },
  {
    semanticName: "Odd",
    name: "Odd",
    shortName: "odd",
    description: "Odd shape",
    internalAliases: ["rect_left_inv_arrow"],
    handler: rect_left_inv_arrow
  },
  {
    semanticName: "Lined Document",
    name: "Lined Document",
    shortName: "lin-doc",
    description: "Lined document",
    aliases: ["lined-document"],
    handler: linedWaveEdgedRect
  }
];
var generateShapeMap = /* @__PURE__ */ __name(() => {
  const undocumentedShapes = {
    state,
    choice,
    note,
    rectWithTitle,
    labelRect,
    iconSquare,
    iconCircle,
    icon,
    iconRounded,
    imageSquare,
    anchor,
    kanbanItem,
    mindmapCircle,
    defaultMindmapNode,
    classBox,
    erBox,
    requirementBox
  };
  const entries = [
    ...Object.entries(undocumentedShapes),
    ...shapesDefs.flatMap((shape) => {
      const aliases = [
        shape.shortName,
        ..."aliases" in shape ? shape.aliases : [],
        ..."internalAliases" in shape ? shape.internalAliases : []
      ];
      return aliases.map((alias) => [alias, shape.handler]);
    })
  ];
  return Object.fromEntries(entries);
}, "generateShapeMap");
var shapes2 = generateShapeMap();
function isValidShape(shape) {
  return shape in shapes2;
}
__name(isValidShape, "isValidShape");
var nodeElems = /* @__PURE__ */ new Map;
async function insertNode(elem, node, renderOptions) {
  let newEl;
  let el;
  if (node.shape === "rect") {
    if (node.rx && node.ry) {
      node.shape = "roundedRect";
    } else {
      node.shape = "squareRect";
    }
  }
  const shapeHandler = node.shape ? shapes2[node.shape] : undefined;
  if (!shapeHandler) {
    throw new Error(`No such shape: ${node.shape}. Please check your syntax.`);
  }
  if (node.link) {
    let target;
    if (renderOptions.config.securityLevel === "sandbox") {
      target = "_top";
    } else if (node.linkTarget) {
      target = node.linkTarget || "_blank";
    }
    newEl = elem.insert("svg:a").attr("xlink:href", node.link).attr("target", target ?? null);
    el = await shapeHandler(newEl, node, renderOptions);
  } else {
    el = await shapeHandler(elem, node, renderOptions);
    newEl = el;
  }
  newEl.attr("data-look", handleUndefinedAttr(node.look));
  if (node.tooltip) {
    el.attr("title", node.tooltip);
  }
  nodeElems.set(node.id, newEl);
  if (node.haveCallback) {
    newEl.attr("class", newEl.attr("class") + " clickable");
  }
  return newEl;
}
__name(insertNode, "insertNode");
var setNodeElem = /* @__PURE__ */ __name((elem, node) => {
  nodeElems.set(node.id, elem);
}, "setNodeElem");
var clear2 = /* @__PURE__ */ __name(() => {
  nodeElems.clear();
}, "clear");
var positionNode = /* @__PURE__ */ __name((node) => {
  const el = nodeElems.get(node.id);
  log.trace("Transforming node", node.diff, node, "translate(" + (node.x - node.width / 2 - 5) + ", " + node.width / 2 + ")");
  const padding = 8;
  const diff = node.diff || 0;
  if (node.clusterNode) {
    el.attr("transform", "translate(" + (node.x + diff - node.width / 2) + ", " + (node.y - node.height / 2 - padding) + ")");
  } else {
    el.attr("transform", "translate(" + node.x + ", " + node.y + ")");
  }
  return diff;
}, "positionNode");

export { labelHelper, updateNodeBounds, createLabel_default, insertCluster, clear, isValidShape, insertNode, setNodeElem, clear2, positionNode };

//# debugId=CDF37F699280F84264756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2NodW5rLTNPUElGR0RFLm1qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJpbXBvcnQge1xuICBjb25maWd1cmVMYWJlbEltYWdlcyxcbiAgZ2V0U3ViR3JhcGhUaXRsZU1hcmdpbnNcbn0gZnJvbSBcIi4vY2h1bmstTDVaVExEV1YubWpzXCI7XG5pbXBvcnQge1xuICBjb21waWxlU3R5bGVzLFxuICBzb2xpZFN0YXRlRmlsbCxcbiAgc3R5bGVzMlN0cmluZyxcbiAgdXNlck5vZGVPdmVycmlkZXNcbn0gZnJvbSBcIi4vY2h1bmstTlpLMkQ3R1UubWpzXCI7XG5pbXBvcnQge1xuICBjcmVhdGVUZXh0LFxuICBnZXRJY29uU1ZHXG59IGZyb20gXCIuL2NodW5rLU81Q0JFTDZPLm1qc1wiO1xuaW1wb3J0IHtcbiAgY2FsY3VsYXRlVGV4dFdpZHRoLFxuICBkZWNvZGVFbnRpdGllcyxcbiAgaGFuZGxlVW5kZWZpbmVkQXR0clxufSBmcm9tIFwiLi9jaHVuay01WlFZSFhLVS5tanNcIjtcbmltcG9ydCB7XG4gIGV2YWx1YXRlLFxuICBnZXRDb25maWcsXG4gIGdldENvbmZpZzIsXG4gIGdldEVmZmVjdGl2ZUh0bWxMYWJlbHMsXG4gIGhhc0thdGV4LFxuICBwYXJzZUdlbmVyaWNUeXBlcyxcbiAgc2FuaXRpemVUZXh0LFxuICBzYW5pdGl6ZVRleHQyXG59IGZyb20gXCIuL2NodW5rLUNTQ0lISzdRLm1qc1wiO1xuaW1wb3J0IHtcbiAgX19uYW1lLFxuICBsb2dcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL3V0aWwudHNcbmltcG9ydCB7IHNlbGVjdCB9IGZyb20gXCJkM1wiO1xudmFyIGxhYmVsSGVscGVyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAocGFyZW50LCBub2RlLCBfY2xhc3NlcykgPT4ge1xuICBsZXQgY3NzQ2xhc3NlcztcbiAgY29uc3QgdXNlSHRtbExhYmVscyA9IG5vZGUudXNlSHRtbExhYmVscyB8fCBldmFsdWF0ZShnZXRDb25maWcyKCk/Lmh0bWxMYWJlbHMpO1xuICBpZiAoIV9jbGFzc2VzKSB7XG4gICAgY3NzQ2xhc3NlcyA9IFwibm9kZSBkZWZhdWx0XCI7XG4gIH0gZWxzZSB7XG4gICAgY3NzQ2xhc3NlcyA9IF9jbGFzc2VzO1xuICB9XG4gIGNvbnN0IHNoYXBlU3ZnID0gcGFyZW50Lmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIGNzc0NsYXNzZXMpLmF0dHIoXCJpZFwiLCBub2RlLmRvbUlkIHx8IG5vZGUuaWQpO1xuICBjb25zdCBsYWJlbEVsID0gc2hhcGVTdmcuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJsYWJlbFwiKS5hdHRyKFwic3R5bGVcIiwgaGFuZGxlVW5kZWZpbmVkQXR0cihub2RlLmxhYmVsU3R5bGUpKTtcbiAgbGV0IGxhYmVsO1xuICBpZiAobm9kZS5sYWJlbCA9PT0gdm9pZCAwKSB7XG4gICAgbGFiZWwgPSBcIlwiO1xuICB9IGVsc2Uge1xuICAgIGxhYmVsID0gdHlwZW9mIG5vZGUubGFiZWwgPT09IFwic3RyaW5nXCIgPyBub2RlLmxhYmVsIDogbm9kZS5sYWJlbFswXTtcbiAgfVxuICBjb25zdCBhZGRCYWNrZ3JvdW5kID0gISFub2RlLmljb24gfHwgISFub2RlLmltZztcbiAgY29uc3QgaXNNYXJrZG93biA9IG5vZGUubGFiZWxUeXBlID09PSBcIm1hcmtkb3duXCI7XG4gIGNvbnN0IHRleHQyID0gYXdhaXQgY3JlYXRlVGV4dChcbiAgICBsYWJlbEVsLFxuICAgIHNhbml0aXplVGV4dChkZWNvZGVFbnRpdGllcyhsYWJlbCksIGdldENvbmZpZzIoKSksXG4gICAge1xuICAgICAgdXNlSHRtbExhYmVscyxcbiAgICAgIHdpZHRoOiBub2RlLndpZHRoIHx8IGdldENvbmZpZzIoKS5mbG93Y2hhcnQ/LndyYXBwaW5nV2lkdGgsXG4gICAgICBjbGFzc2VzOiBpc01hcmtkb3duID8gXCJtYXJrZG93bi1ub2RlLWxhYmVsXCIgOiBcIlwiLFxuICAgICAgc3R5bGU6IG5vZGUubGFiZWxTdHlsZSxcbiAgICAgIGFkZFN2Z0JhY2tncm91bmQ6IGFkZEJhY2tncm91bmQsXG4gICAgICBtYXJrZG93bjogaXNNYXJrZG93blxuICAgIH0sXG4gICAgZ2V0Q29uZmlnMigpXG4gICk7XG4gIGxldCBiYm94ID0gdGV4dDIuZ2V0QkJveCgpO1xuICBjb25zdCBoYWxmUGFkZGluZyA9IChub2RlPy5wYWRkaW5nID8/IDApIC8gMjtcbiAgaWYgKHVzZUh0bWxMYWJlbHMpIHtcbiAgICBjb25zdCBkaXYgPSB0ZXh0Mi5jaGlsZHJlblswXTtcbiAgICBjb25zdCBkdiA9IHNlbGVjdCh0ZXh0Mik7XG4gICAgYXdhaXQgY29uZmlndXJlTGFiZWxJbWFnZXMoZGl2LCBsYWJlbCk7XG4gICAgYmJveCA9IGRpdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBkdi5hdHRyKFwid2lkdGhcIiwgYmJveC53aWR0aCk7XG4gICAgZHYuYXR0cihcImhlaWdodFwiLCBiYm94LmhlaWdodCk7XG4gIH1cbiAgaWYgKHVzZUh0bWxMYWJlbHMpIHtcbiAgICBsYWJlbEVsLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyAtYmJveC53aWR0aCAvIDIgKyBcIiwgXCIgKyAtYmJveC5oZWlnaHQgLyAyICsgXCIpXCIpO1xuICB9IGVsc2Uge1xuICAgIGxhYmVsRWwuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLCBcIiArIC1iYm94LmhlaWdodCAvIDIgKyBcIilcIik7XG4gIH1cbiAgaWYgKG5vZGUuY2VudGVyTGFiZWwpIHtcbiAgICBsYWJlbEVsLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyAtYmJveC53aWR0aCAvIDIgKyBcIiwgXCIgKyAtYmJveC5oZWlnaHQgLyAyICsgXCIpXCIpO1xuICB9XG4gIGxhYmVsRWwuaW5zZXJ0KFwicmVjdFwiLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgcmV0dXJuIHsgc2hhcGVTdmcsIGJib3gsIGhhbGZQYWRkaW5nLCBsYWJlbDogbGFiZWxFbCB9O1xufSwgXCJsYWJlbEhlbHBlclwiKTtcbnZhciBpbnNlcnRMYWJlbCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgKHBhcmVudCwgbGFiZWwsIG9wdGlvbnMpID0+IHtcbiAgY29uc3QgdXNlSHRtbExhYmVscyA9IG9wdGlvbnMudXNlSHRtbExhYmVscyA/PyBnZXRFZmZlY3RpdmVIdG1sTGFiZWxzKGdldENvbmZpZzIoKSk7XG4gIGNvbnN0IGxhYmVsRWwgPSBwYXJlbnQuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJsYWJlbFwiKS5hdHRyKFwic3R5bGVcIiwgb3B0aW9ucy5sYWJlbFN0eWxlIHx8IFwiXCIpO1xuICBjb25zdCB0ZXh0MiA9IGF3YWl0IGNyZWF0ZVRleHQobGFiZWxFbCwgc2FuaXRpemVUZXh0KGRlY29kZUVudGl0aWVzKGxhYmVsKSwgZ2V0Q29uZmlnMigpKSwge1xuICAgIHVzZUh0bWxMYWJlbHMsXG4gICAgd2lkdGg6IG9wdGlvbnMud2lkdGggfHwgZ2V0Q29uZmlnMigpPy5mbG93Y2hhcnQ/LndyYXBwaW5nV2lkdGgsXG4gICAgc3R5bGU6IG9wdGlvbnMubGFiZWxTdHlsZSxcbiAgICBhZGRTdmdCYWNrZ3JvdW5kOiAhIW9wdGlvbnMuaWNvbiB8fCAhIW9wdGlvbnMuaW1nXG4gIH0pO1xuICBsZXQgYmJveCA9IHRleHQyLmdldEJCb3goKTtcbiAgY29uc3QgaGFsZlBhZGRpbmcgPSBvcHRpb25zLnBhZGRpbmcgLyAyO1xuICBpZiAoZ2V0RWZmZWN0aXZlSHRtbExhYmVscyhnZXRDb25maWcyKCkpKSB7XG4gICAgY29uc3QgZGl2ID0gdGV4dDIuY2hpbGRyZW5bMF07XG4gICAgY29uc3QgZHYgPSBzZWxlY3QodGV4dDIpO1xuICAgIGJib3ggPSBkaXYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgZHYuYXR0cihcIndpZHRoXCIsIGJib3gud2lkdGgpO1xuICAgIGR2LmF0dHIoXCJoZWlnaHRcIiwgYmJveC5oZWlnaHQpO1xuICB9XG4gIGlmICh1c2VIdG1sTGFiZWxzKSB7XG4gICAgbGFiZWxFbC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgLWJib3gud2lkdGggLyAyICsgXCIsIFwiICsgLWJib3guaGVpZ2h0IC8gMiArIFwiKVwiKTtcbiAgfSBlbHNlIHtcbiAgICBsYWJlbEVsLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCwgXCIgKyAtYmJveC5oZWlnaHQgLyAyICsgXCIpXCIpO1xuICB9XG4gIGlmIChvcHRpb25zLmNlbnRlckxhYmVsKSB7XG4gICAgbGFiZWxFbC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgLWJib3gud2lkdGggLyAyICsgXCIsIFwiICsgLWJib3guaGVpZ2h0IC8gMiArIFwiKVwiKTtcbiAgfVxuICBsYWJlbEVsLmluc2VydChcInJlY3RcIiwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gIHJldHVybiB7IHNoYXBlU3ZnOiBwYXJlbnQsIGJib3gsIGhhbGZQYWRkaW5nLCBsYWJlbDogbGFiZWxFbCB9O1xufSwgXCJpbnNlcnRMYWJlbFwiKTtcbnZhciB1cGRhdGVOb2RlQm91bmRzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgobm9kZSwgZWxlbWVudCkgPT4ge1xuICBjb25zdCBiYm94ID0gZWxlbWVudC5ub2RlKCkuZ2V0QkJveCgpO1xuICBub2RlLndpZHRoID0gYmJveC53aWR0aDtcbiAgbm9kZS5oZWlnaHQgPSBiYm94LmhlaWdodDtcbn0sIFwidXBkYXRlTm9kZUJvdW5kc1wiKTtcbnZhciBnZXROb2RlQ2xhc3NlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKG5vZGUsIGV4dHJhKSA9PiAobm9kZS5sb29rID09PSBcImhhbmREcmF3blwiID8gXCJyb3VnaC1ub2RlXCIgOiBcIm5vZGVcIikgKyBcIiBcIiArIG5vZGUuY3NzQ2xhc3NlcyArIFwiIFwiICsgKGV4dHJhIHx8IFwiXCIpLCBcImdldE5vZGVDbGFzc2VzXCIpO1xuZnVuY3Rpb24gY3JlYXRlUGF0aEZyb21Qb2ludHMocG9pbnRzKSB7XG4gIGNvbnN0IHBvaW50U3RyaW5ncyA9IHBvaW50cy5tYXAoKHAsIGkpID0+IGAke2kgPT09IDAgPyBcIk1cIiA6IFwiTFwifSR7cC54fSwke3AueX1gKTtcbiAgcG9pbnRTdHJpbmdzLnB1c2goXCJaXCIpO1xuICByZXR1cm4gcG9pbnRTdHJpbmdzLmpvaW4oXCIgXCIpO1xufVxuX19uYW1lKGNyZWF0ZVBhdGhGcm9tUG9pbnRzLCBcImNyZWF0ZVBhdGhGcm9tUG9pbnRzXCIpO1xuZnVuY3Rpb24gZ2VuZXJhdGVGdWxsU2luZVdhdmVQb2ludHMoeDEsIHkxLCB4MiwgeTIsIGFtcGxpdHVkZSwgbnVtQ3ljbGVzKSB7XG4gIGNvbnN0IHBvaW50cyA9IFtdO1xuICBjb25zdCBzdGVwcyA9IDUwO1xuICBjb25zdCBkZWx0YVggPSB4MiAtIHgxO1xuICBjb25zdCBkZWx0YVkgPSB5MiAtIHkxO1xuICBjb25zdCBjeWNsZUxlbmd0aCA9IGRlbHRhWCAvIG51bUN5Y2xlcztcbiAgY29uc3QgZnJlcXVlbmN5ID0gMiAqIE1hdGguUEkgLyBjeWNsZUxlbmd0aDtcbiAgY29uc3QgbWlkWSA9IHkxICsgZGVsdGFZIC8gMjtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPD0gc3RlcHM7IGkrKykge1xuICAgIGNvbnN0IHQgPSBpIC8gc3RlcHM7XG4gICAgY29uc3QgeCA9IHgxICsgdCAqIGRlbHRhWDtcbiAgICBjb25zdCB5ID0gbWlkWSArIGFtcGxpdHVkZSAqIE1hdGguc2luKGZyZXF1ZW5jeSAqICh4IC0geDEpKTtcbiAgICBwb2ludHMucHVzaCh7IHgsIHkgfSk7XG4gIH1cbiAgcmV0dXJuIHBvaW50cztcbn1cbl9fbmFtZShnZW5lcmF0ZUZ1bGxTaW5lV2F2ZVBvaW50cywgXCJnZW5lcmF0ZUZ1bGxTaW5lV2F2ZVBvaW50c1wiKTtcbmZ1bmN0aW9uIGdlbmVyYXRlQ2lyY2xlUG9pbnRzKGNlbnRlclgsIGNlbnRlclksIHJhZGl1cywgbnVtUG9pbnRzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSkge1xuICBjb25zdCBwb2ludHMgPSBbXTtcbiAgY29uc3Qgc3RhcnRBbmdsZVJhZCA9IHN0YXJ0QW5nbGUgKiBNYXRoLlBJIC8gMTgwO1xuICBjb25zdCBlbmRBbmdsZVJhZCA9IGVuZEFuZ2xlICogTWF0aC5QSSAvIDE4MDtcbiAgY29uc3QgYW5nbGVSYW5nZSA9IGVuZEFuZ2xlUmFkIC0gc3RhcnRBbmdsZVJhZDtcbiAgY29uc3QgYW5nbGVTdGVwID0gYW5nbGVSYW5nZSAvIChudW1Qb2ludHMgLSAxKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1Qb2ludHM7IGkrKykge1xuICAgIGNvbnN0IGFuZ2xlID0gc3RhcnRBbmdsZVJhZCArIGkgKiBhbmdsZVN0ZXA7XG4gICAgY29uc3QgeCA9IGNlbnRlclggKyByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSk7XG4gICAgY29uc3QgeSA9IGNlbnRlclkgKyByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSk7XG4gICAgcG9pbnRzLnB1c2goeyB4OiAteCwgeTogLXkgfSk7XG4gIH1cbiAgcmV0dXJuIHBvaW50cztcbn1cbl9fbmFtZShnZW5lcmF0ZUNpcmNsZVBvaW50cywgXCJnZW5lcmF0ZUNpcmNsZVBvaW50c1wiKTtcbmZ1bmN0aW9uIG1lcmdlUGF0aHMocm91Z2hFbGVtZW50KSB7XG4gIGNvbnN0IHBhdGhzID0gQXJyYXkuZnJvbShyb3VnaEVsZW1lbnQuY2hpbGROb2RlcykuZmlsdGVyKFxuICAgIChub2RlKSA9PiBub2RlLnRhZ05hbWUgPT09IFwicGF0aFwiXG4gICk7XG4gIGNvbnN0IG1lcmdlZFBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInBhdGhcIik7XG4gIGNvbnN0IGNvbWJpbmVkUGF0aERhdGEgPSBwYXRocy5tYXAoKHBhdGgpID0+IHBhdGguZ2V0QXR0cmlidXRlKFwiZFwiKSkuZmlsdGVyKChkKSA9PiBkICE9PSBudWxsKS5qb2luKFwiIFwiKTtcbiAgbWVyZ2VkUGF0aC5zZXRBdHRyaWJ1dGUoXCJkXCIsIGNvbWJpbmVkUGF0aERhdGEpO1xuICBjb25zdCBmaWxsUGF0aCA9IHBhdGhzLmZpbmQoKHBhdGgpID0+IHBhdGguZ2V0QXR0cmlidXRlKFwiZmlsbFwiKSAhPT0gXCJub25lXCIpO1xuICBjb25zdCBzdHJva2VQYXRoID0gcGF0aHMuZmluZCgocGF0aCkgPT4gcGF0aC5nZXRBdHRyaWJ1dGUoXCJzdHJva2VcIikgIT09IFwibm9uZVwiKTtcbiAgY29uc3QgZ2V0QXR0ciA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGVsZW1lbnQsIGF0dHIpID0+IHtcbiAgICByZXR1cm4gZWxlbWVudD8uZ2V0QXR0cmlidXRlKGF0dHIpID8/IHZvaWQgMDtcbiAgfSwgXCJnZXRBdHRyXCIpO1xuICBpZiAoZmlsbFBhdGgpIHtcbiAgICBjb25zdCBmaWxsQXR0cnMgPSB7XG4gICAgICBmaWxsOiBnZXRBdHRyKGZpbGxQYXRoLCBcImZpbGxcIiksXG4gICAgICBcImZpbGwtb3BhY2l0eVwiOiBnZXRBdHRyKGZpbGxQYXRoLCBcImZpbGwtb3BhY2l0eVwiKSA/PyBcIjFcIlxuICAgIH07XG4gICAgT2JqZWN0LmVudHJpZXMoZmlsbEF0dHJzKS5mb3JFYWNoKChbYXR0ciwgdmFsdWVdKSA9PiB7XG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgbWVyZ2VkUGF0aC5zZXRBdHRyaWJ1dGUoYXR0ciwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGlmIChzdHJva2VQYXRoKSB7XG4gICAgY29uc3Qgc3Ryb2tlQXR0cnMgPSB7XG4gICAgICBzdHJva2U6IGdldEF0dHIoc3Ryb2tlUGF0aCwgXCJzdHJva2VcIiksXG4gICAgICBcInN0cm9rZS13aWR0aFwiOiBnZXRBdHRyKHN0cm9rZVBhdGgsIFwic3Ryb2tlLXdpZHRoXCIpID8/IFwiMVwiLFxuICAgICAgXCJzdHJva2Utb3BhY2l0eVwiOiBnZXRBdHRyKHN0cm9rZVBhdGgsIFwic3Ryb2tlLW9wYWNpdHlcIikgPz8gXCIxXCJcbiAgICB9O1xuICAgIE9iamVjdC5lbnRyaWVzKHN0cm9rZUF0dHJzKS5mb3JFYWNoKChbYXR0ciwgdmFsdWVdKSA9PiB7XG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgbWVyZ2VkUGF0aC5zZXRBdHRyaWJ1dGUoYXR0ciwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGNvbnN0IGdyb3VwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJnXCIpO1xuICBncm91cC5hcHBlbmRDaGlsZChtZXJnZWRQYXRoKTtcbiAgcmV0dXJuIGdyb3VwO1xufVxuX19uYW1lKG1lcmdlUGF0aHMsIFwibWVyZ2VQYXRoc1wiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9jbHVzdGVycy5qc1xuaW1wb3J0IHsgc2VsZWN0IGFzIHNlbGVjdDIgfSBmcm9tIFwiZDNcIjtcbmltcG9ydCByb3VnaCBmcm9tIFwicm91Z2hqc1wiO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL2ludGVyc2VjdC9pbnRlcnNlY3QtcmVjdC5qc1xudmFyIGludGVyc2VjdFJlY3QgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChub2RlLCBwb2ludCkgPT4ge1xuICB2YXIgeCA9IG5vZGUueDtcbiAgdmFyIHkgPSBub2RlLnk7XG4gIHZhciBkeCA9IHBvaW50LnggLSB4O1xuICB2YXIgZHkgPSBwb2ludC55IC0geTtcbiAgdmFyIHcgPSBub2RlLndpZHRoIC8gMjtcbiAgdmFyIGggPSBub2RlLmhlaWdodCAvIDI7XG4gIHZhciBzeCwgc3k7XG4gIGlmIChNYXRoLmFicyhkeSkgKiB3ID4gTWF0aC5hYnMoZHgpICogaCkge1xuICAgIGlmIChkeSA8IDApIHtcbiAgICAgIGggPSAtaDtcbiAgICB9XG4gICAgc3ggPSBkeSA9PT0gMCA/IDAgOiBoICogZHggLyBkeTtcbiAgICBzeSA9IGg7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGR4IDwgMCkge1xuICAgICAgdyA9IC13O1xuICAgIH1cbiAgICBzeCA9IHc7XG4gICAgc3kgPSBkeCA9PT0gMCA/IDAgOiB3ICogZHkgLyBkeDtcbiAgfVxuICByZXR1cm4geyB4OiB4ICsgc3gsIHk6IHkgKyBzeSB9O1xufSwgXCJpbnRlcnNlY3RSZWN0XCIpO1xudmFyIGludGVyc2VjdF9yZWN0X2RlZmF1bHQgPSBpbnRlcnNlY3RSZWN0O1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL2NyZWF0ZUxhYmVsLmpzXG52YXIgY3JlYXRlTGFiZWwgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGFzeW5jIChlbGVtZW50LCBfdmVydGV4VGV4dCwgc3R5bGUsIGlzVGl0bGUgPSBmYWxzZSwgaXNOb2RlID0gZmFsc2UpID0+IHtcbiAgbGV0IHZlcnRleFRleHQgPSBfdmVydGV4VGV4dCB8fCBcIlwiO1xuICBpZiAodHlwZW9mIHZlcnRleFRleHQgPT09IFwib2JqZWN0XCIpIHtcbiAgICB2ZXJ0ZXhUZXh0ID0gdmVydGV4VGV4dFswXTtcbiAgfVxuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcyKCk7XG4gIGNvbnN0IHVzZUh0bWxMYWJlbHMgPSBnZXRFZmZlY3RpdmVIdG1sTGFiZWxzKGNvbmZpZyk7XG4gIHJldHVybiBhd2FpdCBjcmVhdGVUZXh0KFxuICAgIGVsZW1lbnQsXG4gICAgdmVydGV4VGV4dCxcbiAgICB7XG4gICAgICBzdHlsZSxcbiAgICAgIGlzVGl0bGUsXG4gICAgICB1c2VIdG1sTGFiZWxzLFxuICAgICAgbWFya2Rvd246IGZhbHNlLFxuICAgICAgaXNOb2RlLFxuICAgICAgd2lkdGg6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWVxuICAgIH0sXG4gICAgY29uZmlnXG4gICk7XG59LCBcImNyZWF0ZUxhYmVsXCIpO1xudmFyIGNyZWF0ZUxhYmVsX2RlZmF1bHQgPSBjcmVhdGVMYWJlbDtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvcm91bmRlZFJlY3RQYXRoLnRzXG52YXIgY3JlYXRlUm91bmRlZFJlY3RQYXRoRCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHgsIHksIHRvdGFsV2lkdGgsIHRvdGFsSGVpZ2h0LCByYWRpdXMpID0+IFtcbiAgXCJNXCIsXG4gIHggKyByYWRpdXMsXG4gIHksXG4gIC8vIE1vdmUgdG8gdGhlIGZpcnN0IHBvaW50XG4gIFwiSFwiLFxuICB4ICsgdG90YWxXaWR0aCAtIHJhZGl1cyxcbiAgLy8gRHJhdyBob3Jpem9udGFsIGxpbmUgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgcmlnaHQgY29ybmVyXG4gIFwiQVwiLFxuICByYWRpdXMsXG4gIHJhZGl1cyxcbiAgMCxcbiAgMCxcbiAgMSxcbiAgeCArIHRvdGFsV2lkdGgsXG4gIHkgKyByYWRpdXMsXG4gIC8vIERyYXcgYXJjIHRvIHRoZSByaWdodCB0b3AgY29ybmVyXG4gIFwiVlwiLFxuICB5ICsgdG90YWxIZWlnaHQgLSByYWRpdXMsXG4gIC8vIERyYXcgdmVydGljYWwgbGluZSBkb3duIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHJpZ2h0IGJvdHRvbSBjb3JuZXJcbiAgXCJBXCIsXG4gIHJhZGl1cyxcbiAgcmFkaXVzLFxuICAwLFxuICAwLFxuICAxLFxuICB4ICsgdG90YWxXaWR0aCAtIHJhZGl1cyxcbiAgeSArIHRvdGFsSGVpZ2h0LFxuICAvLyBEcmF3IGFyYyB0byB0aGUgcmlnaHQgYm90dG9tIGNvcm5lclxuICBcIkhcIixcbiAgeCArIHJhZGl1cyxcbiAgLy8gRHJhdyBob3Jpem9udGFsIGxpbmUgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbGVmdCBib3R0b20gY29ybmVyXG4gIFwiQVwiLFxuICByYWRpdXMsXG4gIHJhZGl1cyxcbiAgMCxcbiAgMCxcbiAgMSxcbiAgeCxcbiAgeSArIHRvdGFsSGVpZ2h0IC0gcmFkaXVzLFxuICAvLyBEcmF3IGFyYyB0byB0aGUgbGVmdCBib3R0b20gY29ybmVyXG4gIFwiVlwiLFxuICB5ICsgcmFkaXVzLFxuICAvLyBEcmF3IHZlcnRpY2FsIGxpbmUgdXAgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbGVmdCB0b3AgY29ybmVyXG4gIFwiQVwiLFxuICByYWRpdXMsXG4gIHJhZGl1cyxcbiAgMCxcbiAgMCxcbiAgMSxcbiAgeCArIHJhZGl1cyxcbiAgeSxcbiAgLy8gRHJhdyBhcmMgdG8gdGhlIGxlZnQgdG9wIGNvcm5lclxuICBcIlpcIlxuICAvLyBDbG9zZSB0aGUgcGF0aFxuXS5qb2luKFwiIFwiKSwgXCJjcmVhdGVSb3VuZGVkUmVjdFBhdGhEXCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL2NsdXN0ZXJzLmpzXG52YXIgcmVjdCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgKHBhcmVudCwgbm9kZSkgPT4ge1xuICBsb2cuaW5mbyhcIkNyZWF0aW5nIHN1YmdyYXBoIHJlY3QgZm9yIFwiLCBub2RlLmlkLCBub2RlKTtcbiAgY29uc3Qgc2l0ZUNvbmZpZyA9IGdldENvbmZpZzIoKTtcbiAgY29uc3QgeyB0aGVtZVZhcmlhYmxlcywgaGFuZERyYXduU2VlZCB9ID0gc2l0ZUNvbmZpZztcbiAgY29uc3QgeyBjbHVzdGVyQmtnLCBjbHVzdGVyQm9yZGVyIH0gPSB0aGVtZVZhcmlhYmxlcztcbiAgY29uc3QgeyBsYWJlbFN0eWxlcywgbm9kZVN0eWxlcywgYm9yZGVyU3R5bGVzLCBiYWNrZ3JvdW5kU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBjb25zdCBzaGFwZVN2ZyA9IHBhcmVudC5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImNsdXN0ZXIgXCIgKyBub2RlLmNzc0NsYXNzZXMpLmF0dHIoXCJpZFwiLCBub2RlLmRvbUlkKS5hdHRyKFwiZGF0YS1sb29rXCIsIG5vZGUubG9vayk7XG4gIGNvbnN0IHVzZUh0bWxMYWJlbHMgPSBnZXRFZmZlY3RpdmVIdG1sTGFiZWxzKHNpdGVDb25maWcpO1xuICBjb25zdCBsYWJlbEVsID0gc2hhcGVTdmcuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJjbHVzdGVyLWxhYmVsIFwiKTtcbiAgbGV0IHRleHQyO1xuICBpZiAobm9kZS5sYWJlbFR5cGUgPT09IFwibWFya2Rvd25cIikge1xuICAgIHRleHQyID0gYXdhaXQgY3JlYXRlVGV4dChsYWJlbEVsLCBub2RlLmxhYmVsLCB7XG4gICAgICBzdHlsZTogbm9kZS5sYWJlbFN0eWxlLFxuICAgICAgdXNlSHRtbExhYmVscyxcbiAgICAgIGlzTm9kZTogdHJ1ZSxcbiAgICAgIHdpZHRoOiBub2RlLndpZHRoXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgdGV4dDIgPSBhd2FpdCBjcmVhdGVMYWJlbF9kZWZhdWx0KGxhYmVsRWwsIG5vZGUubGFiZWwsIG5vZGUubGFiZWxTdHlsZSB8fCBcIlwiLCBmYWxzZSwgdHJ1ZSk7XG4gIH1cbiAgbGV0IGJib3ggPSB0ZXh0Mi5nZXRCQm94KCk7XG4gIGlmIChnZXRFZmZlY3RpdmVIdG1sTGFiZWxzKHNpdGVDb25maWcpKSB7XG4gICAgY29uc3QgZGl2ID0gdGV4dDIuY2hpbGRyZW5bMF07XG4gICAgY29uc3QgZHYgPSBzZWxlY3QyKHRleHQyKTtcbiAgICBiYm94ID0gZGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGR2LmF0dHIoXCJ3aWR0aFwiLCBiYm94LndpZHRoKTtcbiAgICBkdi5hdHRyKFwiaGVpZ2h0XCIsIGJib3guaGVpZ2h0KTtcbiAgfVxuICBjb25zdCB3aWR0aCA9IG5vZGUud2lkdGggPD0gYmJveC53aWR0aCArIG5vZGUucGFkZGluZyA/IGJib3gud2lkdGggKyBub2RlLnBhZGRpbmcgOiBub2RlLndpZHRoO1xuICBpZiAobm9kZS53aWR0aCA8PSBiYm94LndpZHRoICsgbm9kZS5wYWRkaW5nKSB7XG4gICAgbm9kZS5kaWZmID0gKHdpZHRoIC0gbm9kZS53aWR0aCkgLyAyIC0gbm9kZS5wYWRkaW5nO1xuICB9IGVsc2Uge1xuICAgIG5vZGUuZGlmZiA9IC1ub2RlLnBhZGRpbmc7XG4gIH1cbiAgY29uc3QgaGVpZ2h0ID0gbm9kZS5oZWlnaHQ7XG4gIGNvbnN0IHggPSBub2RlLnggLSB3aWR0aCAvIDI7XG4gIGNvbnN0IHkgPSBub2RlLnkgLSBoZWlnaHQgLyAyO1xuICBsb2cudHJhY2UoXCJEYXRhIFwiLCBub2RlLCBKU09OLnN0cmluZ2lmeShub2RlKSk7XG4gIGxldCByZWN0MjtcbiAgaWYgKG5vZGUubG9vayA9PT0gXCJoYW5kRHJhd25cIikge1xuICAgIGNvbnN0IHJjID0gcm91Z2guc3ZnKHNoYXBlU3ZnKTtcbiAgICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwge1xuICAgICAgcm91Z2huZXNzOiAwLjcsXG4gICAgICBmaWxsOiBjbHVzdGVyQmtnLFxuICAgICAgLy8gZmlsbDogJ3JlZCcsXG4gICAgICBzdHJva2U6IGNsdXN0ZXJCb3JkZXIsXG4gICAgICBmaWxsV2VpZ2h0OiAzLFxuICAgICAgc2VlZDogaGFuZERyYXduU2VlZFxuICAgIH0pO1xuICAgIGNvbnN0IHJvdWdoTm9kZSA9IHJjLnBhdGgoY3JlYXRlUm91bmRlZFJlY3RQYXRoRCh4LCB5LCB3aWR0aCwgaGVpZ2h0LCAwKSwgb3B0aW9ucyk7XG4gICAgcmVjdDIgPSBzaGFwZVN2Zy5pbnNlcnQoKCkgPT4ge1xuICAgICAgbG9nLmRlYnVnKFwiUm91Z2ggbm9kZSBpbnNlcnQgQ1hDXCIsIHJvdWdoTm9kZSk7XG4gICAgICByZXR1cm4gcm91Z2hOb2RlO1xuICAgIH0sIFwiOmZpcnN0LWNoaWxkXCIpO1xuICAgIHJlY3QyLnNlbGVjdChcInBhdGg6bnRoLWNoaWxkKDIpXCIpLmF0dHIoXCJzdHlsZVwiLCBib3JkZXJTdHlsZXMuam9pbihcIjtcIikpO1xuICAgIHJlY3QyLnNlbGVjdChcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIGJhY2tncm91bmRTdHlsZXMuam9pbihcIjtcIikucmVwbGFjZShcImZpbGxcIiwgXCJzdHJva2VcIikpO1xuICB9IGVsc2Uge1xuICAgIHJlY3QyID0gc2hhcGVTdmcuaW5zZXJ0KFwicmVjdFwiLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgICByZWN0Mi5hdHRyKFwic3R5bGVcIiwgbm9kZVN0eWxlcykuYXR0cihcInJ4XCIsIG5vZGUucngpLmF0dHIoXCJyeVwiLCBub2RlLnJ5KS5hdHRyKFwieFwiLCB4KS5hdHRyKFwieVwiLCB5KS5hdHRyKFwid2lkdGhcIiwgd2lkdGgpLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcbiAgfVxuICBjb25zdCB7IHN1YkdyYXBoVGl0bGVUb3BNYXJnaW4gfSA9IGdldFN1YkdyYXBoVGl0bGVNYXJnaW5zKHNpdGVDb25maWcpO1xuICBsYWJlbEVsLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICAvLyBUaGlzIHB1dHMgdGhlIGxhYmVsIG9uIHRvcCBvZiB0aGUgYm94IGluc3RlYWQgb2YgaW5zaWRlIGl0XG4gICAgYHRyYW5zbGF0ZSgke25vZGUueCAtIGJib3gud2lkdGggLyAyfSwgJHtub2RlLnkgLSBub2RlLmhlaWdodCAvIDIgKyBzdWJHcmFwaFRpdGxlVG9wTWFyZ2lufSlgXG4gICk7XG4gIGlmIChsYWJlbFN0eWxlcykge1xuICAgIGNvbnN0IHNwYW4gPSBsYWJlbEVsLnNlbGVjdChcInNwYW5cIik7XG4gICAgaWYgKHNwYW4pIHtcbiAgICAgIHNwYW4uYXR0cihcInN0eWxlXCIsIGxhYmVsU3R5bGVzKTtcbiAgICB9XG4gIH1cbiAgY29uc3QgcmVjdEJveCA9IHJlY3QyLm5vZGUoKS5nZXRCQm94KCk7XG4gIG5vZGUub2Zmc2V0WCA9IDA7XG4gIG5vZGUud2lkdGggPSByZWN0Qm94LndpZHRoO1xuICBub2RlLmhlaWdodCA9IHJlY3RCb3guaGVpZ2h0O1xuICBub2RlLm9mZnNldFkgPSBiYm94LmhlaWdodCAtIG5vZGUucGFkZGluZyAvIDI7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0X3JlY3RfZGVmYXVsdChub2RlLCBwb2ludCk7XG4gIH07XG4gIHJldHVybiB7IGNsdXN0ZXI6IHNoYXBlU3ZnLCBsYWJlbEJCb3g6IGJib3ggfTtcbn0sIFwicmVjdFwiKTtcbnZhciBub3RlR3JvdXAgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChwYXJlbnQsIG5vZGUpID0+IHtcbiAgY29uc3Qgc2hhcGVTdmcgPSBwYXJlbnQuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJub3RlLWNsdXN0ZXJcIikuYXR0cihcImlkXCIsIG5vZGUuZG9tSWQpO1xuICBjb25zdCByZWN0MiA9IHNoYXBlU3ZnLmluc2VydChcInJlY3RcIiwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gIGNvbnN0IHBhZGRpbmcgPSAwICogbm9kZS5wYWRkaW5nO1xuICBjb25zdCBoYWxmUGFkZGluZyA9IHBhZGRpbmcgLyAyO1xuICByZWN0Mi5hdHRyKFwicnhcIiwgbm9kZS5yeCkuYXR0cihcInJ5XCIsIG5vZGUucnkpLmF0dHIoXCJ4XCIsIG5vZGUueCAtIG5vZGUud2lkdGggLyAyIC0gaGFsZlBhZGRpbmcpLmF0dHIoXCJ5XCIsIG5vZGUueSAtIG5vZGUuaGVpZ2h0IC8gMiAtIGhhbGZQYWRkaW5nKS5hdHRyKFwid2lkdGhcIiwgbm9kZS53aWR0aCArIHBhZGRpbmcpLmF0dHIoXCJoZWlnaHRcIiwgbm9kZS5oZWlnaHQgKyBwYWRkaW5nKS5hdHRyKFwiZmlsbFwiLCBcIm5vbmVcIik7XG4gIGNvbnN0IHJlY3RCb3ggPSByZWN0Mi5ub2RlKCkuZ2V0QkJveCgpO1xuICBub2RlLndpZHRoID0gcmVjdEJveC53aWR0aDtcbiAgbm9kZS5oZWlnaHQgPSByZWN0Qm94LmhlaWdodDtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiBpbnRlcnNlY3RfcmVjdF9kZWZhdWx0KG5vZGUsIHBvaW50KTtcbiAgfTtcbiAgcmV0dXJuIHsgY2x1c3Rlcjogc2hhcGVTdmcsIGxhYmVsQkJveDogeyB3aWR0aDogMCwgaGVpZ2h0OiAwIH0gfTtcbn0sIFwibm90ZUdyb3VwXCIpO1xudmFyIHJvdW5kZWRXaXRoVGl0bGUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGFzeW5jIChwYXJlbnQsIG5vZGUpID0+IHtcbiAgY29uc3Qgc2l0ZUNvbmZpZyA9IGdldENvbmZpZzIoKTtcbiAgY29uc3QgeyB0aGVtZVZhcmlhYmxlcywgaGFuZERyYXduU2VlZCB9ID0gc2l0ZUNvbmZpZztcbiAgY29uc3QgeyBhbHRCYWNrZ3JvdW5kLCBjb21wb3NpdGVCYWNrZ3JvdW5kLCBjb21wb3NpdGVUaXRsZUJhY2tncm91bmQsIG5vZGVCb3JkZXIgfSA9IHRoZW1lVmFyaWFibGVzO1xuICBjb25zdCBzaGFwZVN2ZyA9IHBhcmVudC5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBub2RlLmNzc0NsYXNzZXMpLmF0dHIoXCJpZFwiLCBub2RlLmRvbUlkKS5hdHRyKFwiZGF0YS1pZFwiLCBub2RlLmlkKS5hdHRyKFwiZGF0YS1sb29rXCIsIG5vZGUubG9vayk7XG4gIGNvbnN0IG91dGVyUmVjdEcgPSBzaGFwZVN2Zy5pbnNlcnQoXCJnXCIsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICBjb25zdCBsYWJlbCA9IHNoYXBlU3ZnLmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIFwiY2x1c3Rlci1sYWJlbFwiKTtcbiAgbGV0IGlubmVyUmVjdCA9IHNoYXBlU3ZnLmFwcGVuZChcInJlY3RcIik7XG4gIGNvbnN0IHRleHQyID0gYXdhaXQgY3JlYXRlTGFiZWxfZGVmYXVsdChsYWJlbCwgbm9kZS5sYWJlbCwgbm9kZS5sYWJlbFN0eWxlLCB2b2lkIDAsIHRydWUpO1xuICBsZXQgYmJveCA9IHRleHQyLmdldEJCb3goKTtcbiAgaWYgKGdldEVmZmVjdGl2ZUh0bWxMYWJlbHMoc2l0ZUNvbmZpZykpIHtcbiAgICBjb25zdCBkaXYgPSB0ZXh0Mi5jaGlsZHJlblswXTtcbiAgICBjb25zdCBkdiA9IHNlbGVjdDIodGV4dDIpO1xuICAgIGJib3ggPSBkaXYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgZHYuYXR0cihcIndpZHRoXCIsIGJib3gud2lkdGgpO1xuICAgIGR2LmF0dHIoXCJoZWlnaHRcIiwgYmJveC5oZWlnaHQpO1xuICB9XG4gIGNvbnN0IHBhZGRpbmcgPSAwICogbm9kZS5wYWRkaW5nO1xuICBjb25zdCBoYWxmUGFkZGluZyA9IHBhZGRpbmcgLyAyO1xuICBjb25zdCB3aWR0aCA9IChub2RlLndpZHRoIDw9IGJib3gud2lkdGggKyBub2RlLnBhZGRpbmcgPyBiYm94LndpZHRoICsgbm9kZS5wYWRkaW5nIDogbm9kZS53aWR0aCkgKyBwYWRkaW5nO1xuICBpZiAobm9kZS53aWR0aCA8PSBiYm94LndpZHRoICsgbm9kZS5wYWRkaW5nKSB7XG4gICAgbm9kZS5kaWZmID0gKHdpZHRoIC0gbm9kZS53aWR0aCkgLyAyIC0gbm9kZS5wYWRkaW5nO1xuICB9IGVsc2Uge1xuICAgIG5vZGUuZGlmZiA9IC1ub2RlLnBhZGRpbmc7XG4gIH1cbiAgY29uc3QgaGVpZ2h0ID0gbm9kZS5oZWlnaHQgKyBwYWRkaW5nO1xuICBjb25zdCBpbm5lckhlaWdodCA9IG5vZGUuaGVpZ2h0ICsgcGFkZGluZyAtIGJib3guaGVpZ2h0IC0gNjtcbiAgY29uc3QgeCA9IG5vZGUueCAtIHdpZHRoIC8gMjtcbiAgY29uc3QgeSA9IG5vZGUueSAtIGhlaWdodCAvIDI7XG4gIG5vZGUud2lkdGggPSB3aWR0aDtcbiAgY29uc3QgaW5uZXJZID0gbm9kZS55IC0gbm9kZS5oZWlnaHQgLyAyIC0gaGFsZlBhZGRpbmcgKyBiYm94LmhlaWdodCArIDI7XG4gIGxldCByZWN0MjtcbiAgaWYgKG5vZGUubG9vayA9PT0gXCJoYW5kRHJhd25cIikge1xuICAgIGNvbnN0IGlzQWx0ID0gbm9kZS5jc3NDbGFzc2VzLmluY2x1ZGVzKFwic3RhdGVkaWFncmFtLWNsdXN0ZXItYWx0XCIpO1xuICAgIGNvbnN0IHJjID0gcm91Z2guc3ZnKHNoYXBlU3ZnKTtcbiAgICBjb25zdCByb3VnaE91dGVyTm9kZSA9IG5vZGUucnggfHwgbm9kZS5yeSA/IHJjLnBhdGgoY3JlYXRlUm91bmRlZFJlY3RQYXRoRCh4LCB5LCB3aWR0aCwgaGVpZ2h0LCAxMCksIHtcbiAgICAgIHJvdWdobmVzczogMC43LFxuICAgICAgZmlsbDogY29tcG9zaXRlVGl0bGVCYWNrZ3JvdW5kLFxuICAgICAgZmlsbFN0eWxlOiBcInNvbGlkXCIsXG4gICAgICBzdHJva2U6IG5vZGVCb3JkZXIsXG4gICAgICBzZWVkOiBoYW5kRHJhd25TZWVkXG4gICAgfSkgOiByYy5yZWN0YW5nbGUoeCwgeSwgd2lkdGgsIGhlaWdodCwgeyBzZWVkOiBoYW5kRHJhd25TZWVkIH0pO1xuICAgIHJlY3QyID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHJvdWdoT3V0ZXJOb2RlLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgICBjb25zdCByb3VnaElubmVyTm9kZSA9IHJjLnJlY3RhbmdsZSh4LCBpbm5lclksIHdpZHRoLCBpbm5lckhlaWdodCwge1xuICAgICAgZmlsbDogaXNBbHQgPyBhbHRCYWNrZ3JvdW5kIDogY29tcG9zaXRlQmFja2dyb3VuZCxcbiAgICAgIGZpbGxTdHlsZTogaXNBbHQgPyBcImhhY2h1cmVcIiA6IFwic29saWRcIixcbiAgICAgIHN0cm9rZTogbm9kZUJvcmRlcixcbiAgICAgIHNlZWQ6IGhhbmREcmF3blNlZWRcbiAgICB9KTtcbiAgICByZWN0MiA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiByb3VnaE91dGVyTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gICAgaW5uZXJSZWN0ID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHJvdWdoSW5uZXJOb2RlKTtcbiAgfSBlbHNlIHtcbiAgICByZWN0MiA9IG91dGVyUmVjdEcuaW5zZXJ0KFwicmVjdFwiLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgICBjb25zdCBvdXRlclJlY3RDbGFzcyA9IFwib3V0ZXJcIjtcbiAgICByZWN0Mi5hdHRyKFwiY2xhc3NcIiwgb3V0ZXJSZWN0Q2xhc3MpLmF0dHIoXCJ4XCIsIHgpLmF0dHIoXCJ5XCIsIHkpLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCkuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpLmF0dHIoXCJkYXRhLWxvb2tcIiwgbm9kZS5sb29rKTtcbiAgICBpbm5lclJlY3QuYXR0cihcImNsYXNzXCIsIFwiaW5uZXJcIikuYXR0cihcInhcIiwgeCkuYXR0cihcInlcIiwgaW5uZXJZKS5hdHRyKFwid2lkdGhcIiwgd2lkdGgpLmF0dHIoXCJoZWlnaHRcIiwgaW5uZXJIZWlnaHQpO1xuICB9XG4gIGxhYmVsLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICBgdHJhbnNsYXRlKCR7bm9kZS54IC0gYmJveC53aWR0aCAvIDJ9LCAke3kgKyAxIC0gKGdldEVmZmVjdGl2ZUh0bWxMYWJlbHMoc2l0ZUNvbmZpZykgPyAwIDogMyl9KWBcbiAgKTtcbiAgY29uc3QgcmVjdEJveCA9IHJlY3QyLm5vZGUoKS5nZXRCQm94KCk7XG4gIG5vZGUuaGVpZ2h0ID0gcmVjdEJveC5oZWlnaHQ7XG4gIG5vZGUub2Zmc2V0WCA9IDA7XG4gIG5vZGUub2Zmc2V0WSA9IGJib3guaGVpZ2h0IC0gbm9kZS5wYWRkaW5nIC8gMjtcbiAgbm9kZS5sYWJlbEJCb3ggPSBiYm94O1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgcmV0dXJuIGludGVyc2VjdF9yZWN0X2RlZmF1bHQobm9kZSwgcG9pbnQpO1xuICB9O1xuICByZXR1cm4geyBjbHVzdGVyOiBzaGFwZVN2ZywgbGFiZWxCQm94OiBiYm94IH07XG59LCBcInJvdW5kZWRXaXRoVGl0bGVcIik7XG52YXIga2FuYmFuU2VjdGlvbiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgKHBhcmVudCwgbm9kZSkgPT4ge1xuICBsb2cuaW5mbyhcIkNyZWF0aW5nIHN1YmdyYXBoIHJlY3QgZm9yIFwiLCBub2RlLmlkLCBub2RlKTtcbiAgY29uc3Qgc2l0ZUNvbmZpZyA9IGdldENvbmZpZzIoKTtcbiAgY29uc3QgeyB0aGVtZVZhcmlhYmxlcywgaGFuZERyYXduU2VlZCB9ID0gc2l0ZUNvbmZpZztcbiAgY29uc3QgeyBjbHVzdGVyQmtnLCBjbHVzdGVyQm9yZGVyIH0gPSB0aGVtZVZhcmlhYmxlcztcbiAgY29uc3QgeyBsYWJlbFN0eWxlcywgbm9kZVN0eWxlcywgYm9yZGVyU3R5bGVzLCBiYWNrZ3JvdW5kU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBjb25zdCBzaGFwZVN2ZyA9IHBhcmVudC5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImNsdXN0ZXIgXCIgKyBub2RlLmNzc0NsYXNzZXMpLmF0dHIoXCJpZFwiLCBub2RlLmRvbUlkKS5hdHRyKFwiZGF0YS1sb29rXCIsIG5vZGUubG9vayk7XG4gIGNvbnN0IHVzZUh0bWxMYWJlbHMgPSBnZXRFZmZlY3RpdmVIdG1sTGFiZWxzKHNpdGVDb25maWcpO1xuICBjb25zdCBsYWJlbEVsID0gc2hhcGVTdmcuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJjbHVzdGVyLWxhYmVsIFwiKTtcbiAgY29uc3QgdGV4dDIgPSBhd2FpdCBjcmVhdGVUZXh0KGxhYmVsRWwsIG5vZGUubGFiZWwsIHtcbiAgICBzdHlsZTogbm9kZS5sYWJlbFN0eWxlLFxuICAgIHVzZUh0bWxMYWJlbHMsXG4gICAgaXNOb2RlOiB0cnVlLFxuICAgIHdpZHRoOiBub2RlLndpZHRoXG4gIH0pO1xuICBsZXQgYmJveCA9IHRleHQyLmdldEJCb3goKTtcbiAgaWYgKGdldEVmZmVjdGl2ZUh0bWxMYWJlbHMoc2l0ZUNvbmZpZykpIHtcbiAgICBjb25zdCBkaXYgPSB0ZXh0Mi5jaGlsZHJlblswXTtcbiAgICBjb25zdCBkdiA9IHNlbGVjdDIodGV4dDIpO1xuICAgIGJib3ggPSBkaXYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgZHYuYXR0cihcIndpZHRoXCIsIGJib3gud2lkdGgpO1xuICAgIGR2LmF0dHIoXCJoZWlnaHRcIiwgYmJveC5oZWlnaHQpO1xuICB9XG4gIGNvbnN0IHdpZHRoID0gbm9kZS53aWR0aCA8PSBiYm94LndpZHRoICsgbm9kZS5wYWRkaW5nID8gYmJveC53aWR0aCArIG5vZGUucGFkZGluZyA6IG5vZGUud2lkdGg7XG4gIGlmIChub2RlLndpZHRoIDw9IGJib3gud2lkdGggKyBub2RlLnBhZGRpbmcpIHtcbiAgICBub2RlLmRpZmYgPSAod2lkdGggLSBub2RlLndpZHRoKSAvIDIgLSBub2RlLnBhZGRpbmc7XG4gIH0gZWxzZSB7XG4gICAgbm9kZS5kaWZmID0gLW5vZGUucGFkZGluZztcbiAgfVxuICBjb25zdCBoZWlnaHQgPSBub2RlLmhlaWdodDtcbiAgY29uc3QgeCA9IG5vZGUueCAtIHdpZHRoIC8gMjtcbiAgY29uc3QgeSA9IG5vZGUueSAtIGhlaWdodCAvIDI7XG4gIGxvZy50cmFjZShcIkRhdGEgXCIsIG5vZGUsIEpTT04uc3RyaW5naWZ5KG5vZGUpKTtcbiAgbGV0IHJlY3QyO1xuICBpZiAobm9kZS5sb29rID09PSBcImhhbmREcmF3blwiKSB7XG4gICAgY29uc3QgcmMgPSByb3VnaC5zdmcoc2hhcGVTdmcpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7XG4gICAgICByb3VnaG5lc3M6IDAuNyxcbiAgICAgIGZpbGw6IGNsdXN0ZXJCa2csXG4gICAgICAvLyBmaWxsOiAncmVkJyxcbiAgICAgIHN0cm9rZTogY2x1c3RlckJvcmRlcixcbiAgICAgIGZpbGxXZWlnaHQ6IDQsXG4gICAgICBzZWVkOiBoYW5kRHJhd25TZWVkXG4gICAgfSk7XG4gICAgY29uc3Qgcm91Z2hOb2RlID0gcmMucGF0aChjcmVhdGVSb3VuZGVkUmVjdFBhdGhEKHgsIHksIHdpZHRoLCBoZWlnaHQsIG5vZGUucngpLCBvcHRpb25zKTtcbiAgICByZWN0MiA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiB7XG4gICAgICBsb2cuZGVidWcoXCJSb3VnaCBub2RlIGluc2VydCBDWENcIiwgcm91Z2hOb2RlKTtcbiAgICAgIHJldHVybiByb3VnaE5vZGU7XG4gICAgfSwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gICAgcmVjdDIuc2VsZWN0KFwicGF0aDpudGgtY2hpbGQoMilcIikuYXR0cihcInN0eWxlXCIsIGJvcmRlclN0eWxlcy5qb2luKFwiO1wiKSk7XG4gICAgcmVjdDIuc2VsZWN0KFwicGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgYmFja2dyb3VuZFN0eWxlcy5qb2luKFwiO1wiKS5yZXBsYWNlKFwiZmlsbFwiLCBcInN0cm9rZVwiKSk7XG4gIH0gZWxzZSB7XG4gICAgcmVjdDIgPSBzaGFwZVN2Zy5pbnNlcnQoXCJyZWN0XCIsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICAgIHJlY3QyLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKS5hdHRyKFwicnhcIiwgbm9kZS5yeCkuYXR0cihcInJ5XCIsIG5vZGUucnkpLmF0dHIoXCJ4XCIsIHgpLmF0dHIoXCJ5XCIsIHkpLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCkuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpO1xuICB9XG4gIGNvbnN0IHsgc3ViR3JhcGhUaXRsZVRvcE1hcmdpbiB9ID0gZ2V0U3ViR3JhcGhUaXRsZU1hcmdpbnMoc2l0ZUNvbmZpZyk7XG4gIGxhYmVsRWwuYXR0cihcbiAgICBcInRyYW5zZm9ybVwiLFxuICAgIC8vIFRoaXMgcHV0cyB0aGUgbGFiZWwgb24gdG9wIG9mIHRoZSBib3ggaW5zdGVhZCBvZiBpbnNpZGUgaXRcbiAgICBgdHJhbnNsYXRlKCR7bm9kZS54IC0gYmJveC53aWR0aCAvIDJ9LCAke25vZGUueSAtIG5vZGUuaGVpZ2h0IC8gMiArIHN1YkdyYXBoVGl0bGVUb3BNYXJnaW59KWBcbiAgKTtcbiAgaWYgKGxhYmVsU3R5bGVzKSB7XG4gICAgY29uc3Qgc3BhbiA9IGxhYmVsRWwuc2VsZWN0KFwic3BhblwiKTtcbiAgICBpZiAoc3Bhbikge1xuICAgICAgc3Bhbi5hdHRyKFwic3R5bGVcIiwgbGFiZWxTdHlsZXMpO1xuICAgIH1cbiAgfVxuICBjb25zdCByZWN0Qm94ID0gcmVjdDIubm9kZSgpLmdldEJCb3goKTtcbiAgbm9kZS5vZmZzZXRYID0gMDtcbiAgbm9kZS53aWR0aCA9IHJlY3RCb3gud2lkdGg7XG4gIG5vZGUuaGVpZ2h0ID0gcmVjdEJveC5oZWlnaHQ7XG4gIG5vZGUub2Zmc2V0WSA9IGJib3guaGVpZ2h0IC0gbm9kZS5wYWRkaW5nIC8gMjtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiBpbnRlcnNlY3RfcmVjdF9kZWZhdWx0KG5vZGUsIHBvaW50KTtcbiAgfTtcbiAgcmV0dXJuIHsgY2x1c3Rlcjogc2hhcGVTdmcsIGxhYmVsQkJveDogYmJveCB9O1xufSwgXCJrYW5iYW5TZWN0aW9uXCIpO1xudmFyIGRpdmlkZXIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChwYXJlbnQsIG5vZGUpID0+IHtcbiAgY29uc3Qgc2l0ZUNvbmZpZyA9IGdldENvbmZpZzIoKTtcbiAgY29uc3QgeyB0aGVtZVZhcmlhYmxlcywgaGFuZERyYXduU2VlZCB9ID0gc2l0ZUNvbmZpZztcbiAgY29uc3QgeyBub2RlQm9yZGVyIH0gPSB0aGVtZVZhcmlhYmxlcztcbiAgY29uc3Qgc2hhcGVTdmcgPSBwYXJlbnQuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgbm9kZS5jc3NDbGFzc2VzKS5hdHRyKFwiaWRcIiwgbm9kZS5kb21JZCkuYXR0cihcImRhdGEtbG9va1wiLCBub2RlLmxvb2spO1xuICBjb25zdCBvdXRlclJlY3RHID0gc2hhcGVTdmcuaW5zZXJ0KFwiZ1wiLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgY29uc3QgcGFkZGluZyA9IDAgKiBub2RlLnBhZGRpbmc7XG4gIGNvbnN0IHdpZHRoID0gbm9kZS53aWR0aCArIHBhZGRpbmc7XG4gIG5vZGUuZGlmZiA9IC1ub2RlLnBhZGRpbmc7XG4gIGNvbnN0IGhlaWdodCA9IG5vZGUuaGVpZ2h0ICsgcGFkZGluZztcbiAgY29uc3QgeCA9IG5vZGUueCAtIHdpZHRoIC8gMjtcbiAgY29uc3QgeSA9IG5vZGUueSAtIGhlaWdodCAvIDI7XG4gIG5vZGUud2lkdGggPSB3aWR0aDtcbiAgbGV0IHJlY3QyO1xuICBpZiAobm9kZS5sb29rID09PSBcImhhbmREcmF3blwiKSB7XG4gICAgY29uc3QgcmMgPSByb3VnaC5zdmcoc2hhcGVTdmcpO1xuICAgIGNvbnN0IHJvdWdoT3V0ZXJOb2RlID0gcmMucmVjdGFuZ2xlKHgsIHksIHdpZHRoLCBoZWlnaHQsIHtcbiAgICAgIGZpbGw6IFwibGlnaHRncmV5XCIsXG4gICAgICByb3VnaG5lc3M6IDAuNSxcbiAgICAgIHN0cm9rZUxpbmVEYXNoOiBbNV0sXG4gICAgICBzdHJva2U6IG5vZGVCb3JkZXIsXG4gICAgICBzZWVkOiBoYW5kRHJhd25TZWVkXG4gICAgfSk7XG4gICAgcmVjdDIgPSBzaGFwZVN2Zy5pbnNlcnQoKCkgPT4gcm91Z2hPdXRlck5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICB9IGVsc2Uge1xuICAgIHJlY3QyID0gb3V0ZXJSZWN0Ry5pbnNlcnQoXCJyZWN0XCIsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICAgIGxldCBvdXRlclJlY3RDbGFzcyA9IFwib3V0ZXJcIjtcbiAgICBpZiAobm9kZS5sb29rID09PSBcIm5lb1wiKSB7XG4gICAgICBvdXRlclJlY3RDbGFzcyA9IFwiZGl2aWRlclwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXRlclJlY3RDbGFzcyA9IFwiZGl2aWRlclwiO1xuICAgIH1cbiAgICByZWN0Mi5hdHRyKFwiY2xhc3NcIiwgb3V0ZXJSZWN0Q2xhc3MpLmF0dHIoXCJ4XCIsIHgpLmF0dHIoXCJ5XCIsIHkpLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCkuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpLmF0dHIoXCJkYXRhLWxvb2tcIiwgbm9kZS5sb29rKTtcbiAgfVxuICBjb25zdCByZWN0Qm94ID0gcmVjdDIubm9kZSgpLmdldEJCb3goKTtcbiAgbm9kZS5oZWlnaHQgPSByZWN0Qm94LmhlaWdodDtcbiAgbm9kZS5vZmZzZXRYID0gMDtcbiAgbm9kZS5vZmZzZXRZID0gMDtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiBpbnRlcnNlY3RfcmVjdF9kZWZhdWx0KG5vZGUsIHBvaW50KTtcbiAgfTtcbiAgcmV0dXJuIHsgY2x1c3Rlcjogc2hhcGVTdmcsIGxhYmVsQkJveDoge30gfTtcbn0sIFwiZGl2aWRlclwiKTtcbnZhciBzcXVhcmVSZWN0ID0gcmVjdDtcbnZhciBzaGFwZXMgPSB7XG4gIHJlY3QsXG4gIHNxdWFyZVJlY3QsXG4gIHJvdW5kZWRXaXRoVGl0bGUsXG4gIG5vdGVHcm91cCxcbiAgZGl2aWRlcixcbiAga2FuYmFuU2VjdGlvblxufTtcbnZhciBjbHVzdGVyRWxlbXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xudmFyIGluc2VydENsdXN0ZXIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGFzeW5jIChlbGVtLCBub2RlKSA9PiB7XG4gIGNvbnN0IHNoYXBlID0gbm9kZS5zaGFwZSB8fCBcInJlY3RcIjtcbiAgY29uc3QgY2x1c3RlciA9IGF3YWl0IHNoYXBlc1tzaGFwZV0oZWxlbSwgbm9kZSk7XG4gIGNsdXN0ZXJFbGVtcy5zZXQobm9kZS5pZCwgY2x1c3Rlcik7XG4gIHJldHVybiBjbHVzdGVyO1xufSwgXCJpbnNlcnRDbHVzdGVyXCIpO1xudmFyIGNsZWFyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiB7XG4gIGNsdXN0ZXJFbGVtcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG59LCBcImNsZWFyXCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL2ludGVyc2VjdC9pbnRlcnNlY3Qtbm9kZS5qc1xuZnVuY3Rpb24gaW50ZXJzZWN0Tm9kZShub2RlLCBwb2ludCkge1xuICByZXR1cm4gbm9kZS5pbnRlcnNlY3QocG9pbnQpO1xufVxuX19uYW1lKGludGVyc2VjdE5vZGUsIFwiaW50ZXJzZWN0Tm9kZVwiKTtcbnZhciBpbnRlcnNlY3Rfbm9kZV9kZWZhdWx0ID0gaW50ZXJzZWN0Tm9kZTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9pbnRlcnNlY3QvaW50ZXJzZWN0LWVsbGlwc2UuanNcbmZ1bmN0aW9uIGludGVyc2VjdEVsbGlwc2Uobm9kZSwgcngsIHJ5LCBwb2ludCkge1xuICB2YXIgY3ggPSBub2RlLng7XG4gIHZhciBjeSA9IG5vZGUueTtcbiAgdmFyIHB4ID0gY3ggLSBwb2ludC54O1xuICB2YXIgcHkgPSBjeSAtIHBvaW50Lnk7XG4gIHZhciBkZXQgPSBNYXRoLnNxcnQocnggKiByeCAqIHB5ICogcHkgKyByeSAqIHJ5ICogcHggKiBweCk7XG4gIHZhciBkeCA9IE1hdGguYWJzKHJ4ICogcnkgKiBweCAvIGRldCk7XG4gIGlmIChwb2ludC54IDwgY3gpIHtcbiAgICBkeCA9IC1keDtcbiAgfVxuICB2YXIgZHkgPSBNYXRoLmFicyhyeCAqIHJ5ICogcHkgLyBkZXQpO1xuICBpZiAocG9pbnQueSA8IGN5KSB7XG4gICAgZHkgPSAtZHk7XG4gIH1cbiAgcmV0dXJuIHsgeDogY3ggKyBkeCwgeTogY3kgKyBkeSB9O1xufVxuX19uYW1lKGludGVyc2VjdEVsbGlwc2UsIFwiaW50ZXJzZWN0RWxsaXBzZVwiKTtcbnZhciBpbnRlcnNlY3RfZWxsaXBzZV9kZWZhdWx0ID0gaW50ZXJzZWN0RWxsaXBzZTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9pbnRlcnNlY3QvaW50ZXJzZWN0LWNpcmNsZS5qc1xuZnVuY3Rpb24gaW50ZXJzZWN0Q2lyY2xlKG5vZGUsIHJ4LCBwb2ludCkge1xuICByZXR1cm4gaW50ZXJzZWN0X2VsbGlwc2VfZGVmYXVsdChub2RlLCByeCwgcngsIHBvaW50KTtcbn1cbl9fbmFtZShpbnRlcnNlY3RDaXJjbGUsIFwiaW50ZXJzZWN0Q2lyY2xlXCIpO1xudmFyIGludGVyc2VjdF9jaXJjbGVfZGVmYXVsdCA9IGludGVyc2VjdENpcmNsZTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9pbnRlcnNlY3QvaW50ZXJzZWN0LWxpbmUuanNcbmZ1bmN0aW9uIGludGVyc2VjdExpbmUocDEsIHAyLCBxMSwgcTIpIHtcbiAge1xuICAgIGNvbnN0IGExID0gcDIueSAtIHAxLnk7XG4gICAgY29uc3QgYjEgPSBwMS54IC0gcDIueDtcbiAgICBjb25zdCBjMSA9IHAyLnggKiBwMS55IC0gcDEueCAqIHAyLnk7XG4gICAgY29uc3QgcjMgPSBhMSAqIHExLnggKyBiMSAqIHExLnkgKyBjMTtcbiAgICBjb25zdCByNCA9IGExICogcTIueCArIGIxICogcTIueSArIGMxO1xuICAgIGNvbnN0IGVwc2lsb24gPSAxZS02O1xuICAgIGlmIChyMyAhPT0gMCAmJiByNCAhPT0gMCAmJiBzYW1lU2lnbihyMywgcjQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGEyID0gcTIueSAtIHExLnk7XG4gICAgY29uc3QgYjIgPSBxMS54IC0gcTIueDtcbiAgICBjb25zdCBjMiA9IHEyLnggKiBxMS55IC0gcTEueCAqIHEyLnk7XG4gICAgY29uc3QgcjEgPSBhMiAqIHAxLnggKyBiMiAqIHAxLnkgKyBjMjtcbiAgICBjb25zdCByMiA9IGEyICogcDIueCArIGIyICogcDIueSArIGMyO1xuICAgIGlmIChNYXRoLmFicyhyMSkgPCBlcHNpbG9uICYmIE1hdGguYWJzKHIyKSA8IGVwc2lsb24gJiYgc2FtZVNpZ24ocjEsIHIyKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBkZW5vbSA9IGExICogYjIgLSBhMiAqIGIxO1xuICAgIGlmIChkZW5vbSA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBvZmZzZXQgPSBNYXRoLmFicyhkZW5vbSAvIDIpO1xuICAgIGxldCBudW0gPSBiMSAqIGMyIC0gYjIgKiBjMTtcbiAgICBjb25zdCB4ID0gbnVtIDwgMCA/IChudW0gLSBvZmZzZXQpIC8gZGVub20gOiAobnVtICsgb2Zmc2V0KSAvIGRlbm9tO1xuICAgIG51bSA9IGEyICogYzEgLSBhMSAqIGMyO1xuICAgIGNvbnN0IHkgPSBudW0gPCAwID8gKG51bSAtIG9mZnNldCkgLyBkZW5vbSA6IChudW0gKyBvZmZzZXQpIC8gZGVub207XG4gICAgcmV0dXJuIHsgeCwgeSB9O1xuICB9XG59XG5fX25hbWUoaW50ZXJzZWN0TGluZSwgXCJpbnRlcnNlY3RMaW5lXCIpO1xuZnVuY3Rpb24gc2FtZVNpZ24ocjEsIHIyKSB7XG4gIHJldHVybiByMSAqIHIyID4gMDtcbn1cbl9fbmFtZShzYW1lU2lnbiwgXCJzYW1lU2lnblwiKTtcbnZhciBpbnRlcnNlY3RfbGluZV9kZWZhdWx0ID0gaW50ZXJzZWN0TGluZTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9pbnRlcnNlY3QvaW50ZXJzZWN0LXBvbHlnb24uanNcbmZ1bmN0aW9uIGludGVyc2VjdFBvbHlnb24obm9kZSwgcG9seVBvaW50cywgcG9pbnQpIHtcbiAgbGV0IHgxID0gbm9kZS54O1xuICBsZXQgeTEgPSBub2RlLnk7XG4gIGxldCBpbnRlcnNlY3Rpb25zID0gW107XG4gIGxldCBtaW5YID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICBsZXQgbWluWSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgaWYgKHR5cGVvZiBwb2x5UG9pbnRzLmZvckVhY2ggPT09IFwiZnVuY3Rpb25cIikge1xuICAgIHBvbHlQb2ludHMuZm9yRWFjaChmdW5jdGlvbihlbnRyeSkge1xuICAgICAgbWluWCA9IE1hdGgubWluKG1pblgsIGVudHJ5LngpO1xuICAgICAgbWluWSA9IE1hdGgubWluKG1pblksIGVudHJ5LnkpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG1pblggPSBNYXRoLm1pbihtaW5YLCBwb2x5UG9pbnRzLngpO1xuICAgIG1pblkgPSBNYXRoLm1pbihtaW5ZLCBwb2x5UG9pbnRzLnkpO1xuICB9XG4gIGxldCBsZWZ0ID0geDEgLSBub2RlLndpZHRoIC8gMiAtIG1pblg7XG4gIGxldCB0b3AgPSB5MSAtIG5vZGUuaGVpZ2h0IC8gMiAtIG1pblk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcG9seVBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgIGxldCBwMSA9IHBvbHlQb2ludHNbaV07XG4gICAgbGV0IHAyID0gcG9seVBvaW50c1tpIDwgcG9seVBvaW50cy5sZW5ndGggLSAxID8gaSArIDEgOiAwXTtcbiAgICBsZXQgaW50ZXJzZWN0ID0gaW50ZXJzZWN0X2xpbmVfZGVmYXVsdChcbiAgICAgIG5vZGUsXG4gICAgICBwb2ludCxcbiAgICAgIHsgeDogbGVmdCArIHAxLngsIHk6IHRvcCArIHAxLnkgfSxcbiAgICAgIHsgeDogbGVmdCArIHAyLngsIHk6IHRvcCArIHAyLnkgfVxuICAgICk7XG4gICAgaWYgKGludGVyc2VjdCkge1xuICAgICAgaW50ZXJzZWN0aW9ucy5wdXNoKGludGVyc2VjdCk7XG4gICAgfVxuICB9XG4gIGlmICghaW50ZXJzZWN0aW9ucy5sZW5ndGgpIHtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAxKSB7XG4gICAgaW50ZXJzZWN0aW9ucy5zb3J0KGZ1bmN0aW9uKHAsIHEpIHtcbiAgICAgIGxldCBwZHggPSBwLnggLSBwb2ludC54O1xuICAgICAgbGV0IHBkeSA9IHAueSAtIHBvaW50Lnk7XG4gICAgICBsZXQgZGlzdHAgPSBNYXRoLnNxcnQocGR4ICogcGR4ICsgcGR5ICogcGR5KTtcbiAgICAgIGxldCBxZHggPSBxLnggLSBwb2ludC54O1xuICAgICAgbGV0IHFkeSA9IHEueSAtIHBvaW50Lnk7XG4gICAgICBsZXQgZGlzdHEgPSBNYXRoLnNxcnQocWR4ICogcWR4ICsgcWR5ICogcWR5KTtcbiAgICAgIHJldHVybiBkaXN0cCA8IGRpc3RxID8gLTEgOiBkaXN0cCA9PT0gZGlzdHEgPyAwIDogMTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gaW50ZXJzZWN0aW9uc1swXTtcbn1cbl9fbmFtZShpbnRlcnNlY3RQb2x5Z29uLCBcImludGVyc2VjdFBvbHlnb25cIik7XG52YXIgaW50ZXJzZWN0X3BvbHlnb25fZGVmYXVsdCA9IGludGVyc2VjdFBvbHlnb247XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvaW50ZXJzZWN0L2luZGV4LmpzXG52YXIgaW50ZXJzZWN0X2RlZmF1bHQgPSB7XG4gIG5vZGU6IGludGVyc2VjdF9ub2RlX2RlZmF1bHQsXG4gIGNpcmNsZTogaW50ZXJzZWN0X2NpcmNsZV9kZWZhdWx0LFxuICBlbGxpcHNlOiBpbnRlcnNlY3RfZWxsaXBzZV9kZWZhdWx0LFxuICBwb2x5Z29uOiBpbnRlcnNlY3RfcG9seWdvbl9kZWZhdWx0LFxuICByZWN0OiBpbnRlcnNlY3RfcmVjdF9kZWZhdWx0XG59O1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy9hbmNob3IudHNcbmltcG9ydCByb3VnaDIgZnJvbSBcInJvdWdoanNcIjtcbmZ1bmN0aW9uIGFuY2hvcihwYXJlbnQsIG5vZGUpIHtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IGNsYXNzZXMgPSBnZXROb2RlQ2xhc3Nlcyhub2RlKTtcbiAgbGV0IGNzc0NsYXNzZXMgPSBjbGFzc2VzO1xuICBpZiAoIWNsYXNzZXMpIHtcbiAgICBjc3NDbGFzc2VzID0gXCJhbmNob3JcIjtcbiAgfVxuICBjb25zdCBzaGFwZVN2ZyA9IHBhcmVudC5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBjc3NDbGFzc2VzKS5hdHRyKFwiaWRcIiwgbm9kZS5kb21JZCB8fCBub2RlLmlkKTtcbiAgY29uc3QgcmFkaXVzID0gMTtcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGNvbnN0IHJjID0gcm91Z2gyLnN2ZyhzaGFwZVN2Zyk7XG4gIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7IGZpbGw6IFwiYmxhY2tcIiwgc3Ryb2tlOiBcIm5vbmVcIiwgZmlsbFN0eWxlOiBcInNvbGlkXCIgfSk7XG4gIGlmIChub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBvcHRpb25zLnJvdWdobmVzcyA9IDA7XG4gIH1cbiAgY29uc3Qgcm91Z2hOb2RlID0gcmMuY2lyY2xlKDAsIDAsIHJhZGl1cyAqIDIsIG9wdGlvbnMpO1xuICBjb25zdCBjaXJjbGVFbGVtID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHJvdWdoTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gIGNpcmNsZUVsZW0uYXR0cihcImNsYXNzXCIsIFwiYW5jaG9yXCIpLmF0dHIoXCJzdHlsZVwiLCBoYW5kbGVVbmRlZmluZWRBdHRyKGNzc1N0eWxlcykpO1xuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIGNpcmNsZUVsZW0pO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgbG9nLmluZm8oXCJDaXJjbGUgaW50ZXJzZWN0XCIsIG5vZGUsIHJhZGl1cywgcG9pbnQpO1xuICAgIHJldHVybiBpbnRlcnNlY3RfZGVmYXVsdC5jaXJjbGUobm9kZSwgcmFkaXVzLCBwb2ludCk7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZShhbmNob3IsIFwiYW5jaG9yXCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy9ib3dUaWVSZWN0LnRzXG5pbXBvcnQgcm91Z2gzIGZyb20gXCJyb3VnaGpzXCI7XG5mdW5jdGlvbiBnZW5lcmF0ZUFyY1BvaW50cyh4MSwgeTEsIHgyLCB5MiwgcngsIHJ5LCBjbG9ja3dpc2UpIHtcbiAgY29uc3QgbnVtUG9pbnRzID0gMjA7XG4gIGNvbnN0IG1pZFggPSAoeDEgKyB4MikgLyAyO1xuICBjb25zdCBtaWRZID0gKHkxICsgeTIpIC8gMjtcbiAgY29uc3QgYW5nbGUgPSBNYXRoLmF0YW4yKHkyIC0geTEsIHgyIC0geDEpO1xuICBjb25zdCBkeCA9ICh4MiAtIHgxKSAvIDI7XG4gIGNvbnN0IGR5ID0gKHkyIC0geTEpIC8gMjtcbiAgY29uc3QgdHJhbnNmb3JtZWRYID0gZHggLyByeDtcbiAgY29uc3QgdHJhbnNmb3JtZWRZID0gZHkgLyByeTtcbiAgY29uc3QgZGlzdGFuY2UgPSBNYXRoLnNxcnQodHJhbnNmb3JtZWRYICoqIDIgKyB0cmFuc2Zvcm1lZFkgKiogMik7XG4gIGlmIChkaXN0YW5jZSA+IDEpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgZ2l2ZW4gcmFkaWkgYXJlIHRvbyBzbWFsbCB0byBjcmVhdGUgYW4gYXJjIGJldHdlZW4gdGhlIHBvaW50cy5cIik7XG4gIH1cbiAgY29uc3Qgc2NhbGVkQ2VudGVyRGlzdGFuY2UgPSBNYXRoLnNxcnQoMSAtIGRpc3RhbmNlICoqIDIpO1xuICBjb25zdCBjZW50ZXJYID0gbWlkWCArIHNjYWxlZENlbnRlckRpc3RhbmNlICogcnkgKiBNYXRoLnNpbihhbmdsZSkgKiAoY2xvY2t3aXNlID8gLTEgOiAxKTtcbiAgY29uc3QgY2VudGVyWSA9IG1pZFkgLSBzY2FsZWRDZW50ZXJEaXN0YW5jZSAqIHJ4ICogTWF0aC5jb3MoYW5nbGUpICogKGNsb2Nrd2lzZSA/IC0xIDogMSk7XG4gIGNvbnN0IHN0YXJ0QW5nbGUgPSBNYXRoLmF0YW4yKCh5MSAtIGNlbnRlclkpIC8gcnksICh4MSAtIGNlbnRlclgpIC8gcngpO1xuICBjb25zdCBlbmRBbmdsZSA9IE1hdGguYXRhbjIoKHkyIC0gY2VudGVyWSkgLyByeSwgKHgyIC0gY2VudGVyWCkgLyByeCk7XG4gIGxldCBhbmdsZVJhbmdlID0gZW5kQW5nbGUgLSBzdGFydEFuZ2xlO1xuICBpZiAoY2xvY2t3aXNlICYmIGFuZ2xlUmFuZ2UgPCAwKSB7XG4gICAgYW5nbGVSYW5nZSArPSAyICogTWF0aC5QSTtcbiAgfVxuICBpZiAoIWNsb2Nrd2lzZSAmJiBhbmdsZVJhbmdlID4gMCkge1xuICAgIGFuZ2xlUmFuZ2UgLT0gMiAqIE1hdGguUEk7XG4gIH1cbiAgY29uc3QgcG9pbnRzID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtUG9pbnRzOyBpKyspIHtcbiAgICBjb25zdCB0ID0gaSAvIChudW1Qb2ludHMgLSAxKTtcbiAgICBjb25zdCBhbmdsZTIgPSBzdGFydEFuZ2xlICsgdCAqIGFuZ2xlUmFuZ2U7XG4gICAgY29uc3QgeCA9IGNlbnRlclggKyByeCAqIE1hdGguY29zKGFuZ2xlMik7XG4gICAgY29uc3QgeSA9IGNlbnRlclkgKyByeSAqIE1hdGguc2luKGFuZ2xlMik7XG4gICAgcG9pbnRzLnB1c2goeyB4LCB5IH0pO1xuICB9XG4gIHJldHVybiBwb2ludHM7XG59XG5fX25hbWUoZ2VuZXJhdGVBcmNQb2ludHMsIFwiZ2VuZXJhdGVBcmNQb2ludHNcIik7XG5mdW5jdGlvbiBjYWxjdWxhdGVBcmNTYWdpdHRhKGNob3JkLCByYWRpdXNYLCByYWRpdXNZKSB7XG4gIGNvbnN0IFtzZW1pTWFqb3JBeGlzLCBzZW1pTWlub3JBeGlzXSA9IFtyYWRpdXNYLCByYWRpdXNZXS5zb3J0KChhLCBiKSA9PiBiIC0gYSk7XG4gIHJldHVybiBzZW1pTWlub3JBeGlzICogKDEgLSBNYXRoLnNxcnQoMSAtIChjaG9yZCAvIHNlbWlNYWpvckF4aXMgLyAyKSAqKiAyKSk7XG59XG5fX25hbWUoY2FsY3VsYXRlQXJjU2FnaXR0YSwgXCJjYWxjdWxhdGVBcmNTYWdpdHRhXCIpO1xuYXN5bmMgZnVuY3Rpb24gYm93VGllUmVjdChwYXJlbnQsIG5vZGUpIHtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcywgbm9kZVN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IG5vZGVQYWRkaW5nID0gbm9kZS5wYWRkaW5nID8/IDA7XG4gIGNvbnN0IGxhYmVsUGFkZGluZ1ggPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyAxNiA6IG5vZGVQYWRkaW5nO1xuICBjb25zdCBsYWJlbFBhZGRpbmdZID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gMTIgOiBub2RlUGFkZGluZztcbiAgY29uc3QgY2FsY1RvdGFsSGVpZ2h0ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgobGFiZWxIZWlnaHQpID0+IGxhYmVsSGVpZ2h0ICsgbGFiZWxQYWRkaW5nWSwgXCJjYWxjVG90YWxIZWlnaHRcIik7XG4gIGNvbnN0IGNhbGNFbGxpcHNlUmFkaXVzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgodG90YWxIZWlnaHQyKSA9PiB7XG4gICAgY29uc3QgcnkyID0gdG90YWxIZWlnaHQyIC8gMjtcbiAgICBjb25zdCByeDIgPSByeTIgLyAoMi41ICsgdG90YWxIZWlnaHQyIC8gNTApO1xuICAgIHJldHVybiBbcngyLCByeTJdO1xuICB9LCBcImNhbGNFbGxpcHNlUmFkaXVzXCIpO1xuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94IH0gPSBhd2FpdCBsYWJlbEhlbHBlcihwYXJlbnQsIG5vZGUsIGdldE5vZGVDbGFzc2VzKG5vZGUpKTtcbiAgY29uc3QgdG90YWxIZWlnaHQgPSBjYWxjVG90YWxIZWlnaHQobm9kZT8uaGVpZ2h0ID8gbm9kZT8uaGVpZ2h0IDogYmJveC5oZWlnaHQpO1xuICBjb25zdCBbcngsIHJ5XSA9IGNhbGNFbGxpcHNlUmFkaXVzKHRvdGFsSGVpZ2h0KTtcbiAgY29uc3Qgc2FnaXR0YSA9IGNhbGN1bGF0ZUFyY1NhZ2l0dGEodG90YWxIZWlnaHQsIHJ4LCByeSk7XG4gIGNvbnN0IHRvdGFsV2lkdGggPSAobm9kZT8ud2lkdGggPyBub2RlPy53aWR0aCA6IGJib3gud2lkdGgpICsgbGFiZWxQYWRkaW5nWCAqIDIgKyBzYWdpdHRhO1xuICBjb25zdCB3ID0gdG90YWxXaWR0aCAtIHNhZ2l0dGE7XG4gIGNvbnN0IGggPSB0b3RhbEhlaWdodDtcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGNvbnN0IHBvaW50cyA9IFtcbiAgICB7IHg6IHcgLyAyLCB5OiAtaCAvIDIgfSxcbiAgICB7IHg6IC13IC8gMiwgeTogLWggLyAyIH0sXG4gICAgLi4uZ2VuZXJhdGVBcmNQb2ludHMoLXcgLyAyLCAtaCAvIDIsIC13IC8gMiwgaCAvIDIsIHJ4LCByeSwgZmFsc2UpLFxuICAgIHsgeDogdyAvIDIsIHk6IGggLyAyIH0sXG4gICAgLi4uZ2VuZXJhdGVBcmNQb2ludHModyAvIDIsIGggLyAyLCB3IC8gMiwgLWggLyAyLCByeCwgcnksIHRydWUpXG4gIF07XG4gIGNvbnN0IHJjID0gcm91Z2gzLnN2ZyhzaGFwZVN2Zyk7XG4gIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gIGlmIChub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBvcHRpb25zLnJvdWdobmVzcyA9IDA7XG4gICAgb3B0aW9ucy5maWxsU3R5bGUgPSBcInNvbGlkXCI7XG4gIH1cbiAgY29uc3QgYm93VGllUmVjdFBhdGggPSBjcmVhdGVQYXRoRnJvbVBvaW50cyhwb2ludHMpO1xuICBjb25zdCBib3dUaWVSZWN0U2hhcGVQYXRoID0gcmMucGF0aChib3dUaWVSZWN0UGF0aCwgb3B0aW9ucyk7XG4gIGNvbnN0IGJvd1RpZVJlY3RTaGFwZSA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiBib3dUaWVSZWN0U2hhcGVQYXRoLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgYm93VGllUmVjdFNoYXBlLmF0dHIoXCJjbGFzc1wiLCBcImJhc2ljIGxhYmVsLWNvbnRhaW5lciBvdXRlci1wYXRoXCIpO1xuICBpZiAoY3NzU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIGJvd1RpZVJlY3RTaGFwZS5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBjc3NTdHlsZXMpO1xuICB9XG4gIGlmIChub2RlU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIGJvd1RpZVJlY3RTaGFwZS5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgfVxuICBib3dUaWVSZWN0U2hhcGUuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7cnggLyAyfSwgMClgKTtcbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCBib3dUaWVSZWN0U2hhcGUpO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgY29uc3QgcG9zID0gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihub2RlLCBwb2ludHMsIHBvaW50KTtcbiAgICByZXR1cm4gcG9zO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59XG5fX25hbWUoYm93VGllUmVjdCwgXCJib3dUaWVSZWN0XCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy9jYXJkLnRzXG5pbXBvcnQgcm91Z2g0IGZyb20gXCJyb3VnaGpzXCI7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL2luc2VydFBvbHlnb25TaGFwZS50c1xuZnVuY3Rpb24gaW5zZXJ0UG9seWdvblNoYXBlKHBhcmVudCwgdywgaCwgcG9pbnRzKSB7XG4gIHJldHVybiBwYXJlbnQuaW5zZXJ0KFwicG9seWdvblwiLCBcIjpmaXJzdC1jaGlsZFwiKS5hdHRyKFxuICAgIFwicG9pbnRzXCIsXG4gICAgcG9pbnRzLm1hcChmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gZC54ICsgXCIsXCIgKyBkLnk7XG4gICAgfSkuam9pbihcIiBcIilcbiAgKS5hdHRyKFwiY2xhc3NcIiwgXCJsYWJlbC1jb250YWluZXJcIikuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIC13IC8gMiArIFwiLFwiICsgaCAvIDIgKyBcIilcIik7XG59XG5fX25hbWUoaW5zZXJ0UG9seWdvblNoYXBlLCBcImluc2VydFBvbHlnb25TaGFwZVwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvY2FyZC50c1xudmFyIE5PVENIX1NJWkUgPSAxMjtcbmFzeW5jIGZ1bmN0aW9uIGNhcmQocGFyZW50LCBub2RlKSB7XG4gIGNvbnN0IHsgbGFiZWxTdHlsZXMsIG5vZGVTdHlsZXMgfSA9IHN0eWxlczJTdHJpbmcobm9kZSk7XG4gIG5vZGUubGFiZWxTdHlsZSA9IGxhYmVsU3R5bGVzO1xuICBjb25zdCBub2RlUGFkZGluZyA9IG5vZGUucGFkZGluZyA/PyAwO1xuICBjb25zdCBsYWJlbFBhZGRpbmdYID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gMjggOiBub2RlUGFkZGluZztcbiAgY29uc3QgbGFiZWxQYWRkaW5nWSA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IDI0IDogbm9kZVBhZGRpbmc7XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3ggfSA9IGF3YWl0IGxhYmVsSGVscGVyKHBhcmVudCwgbm9kZSwgZ2V0Tm9kZUNsYXNzZXMobm9kZSkpO1xuICBjb25zdCB3ID0gKG5vZGU/LndpZHRoID8/IGJib3gud2lkdGgpICsgKG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IGxhYmVsUGFkZGluZ1ggKiAyIDogbGFiZWxQYWRkaW5nWCArIE5PVENIX1NJWkUpO1xuICBjb25zdCBoID0gKG5vZGU/LmhlaWdodCA/PyBiYm94LmhlaWdodCkgKyAobm9kZS5sb29rID09PSBcIm5lb1wiID8gbGFiZWxQYWRkaW5nWSAqIDIgOiBsYWJlbFBhZGRpbmdZKTtcbiAgY29uc3QgbGVmdCA9IDA7XG4gIGNvbnN0IHJpZ2h0ID0gdztcbiAgY29uc3QgdG9wID0gLWg7XG4gIGNvbnN0IGJvdHRvbSA9IDA7XG4gIGNvbnN0IHBvaW50cyA9IFtcbiAgICB7IHg6IGxlZnQgKyBOT1RDSF9TSVpFLCB5OiB0b3AgfSxcbiAgICB7IHg6IHJpZ2h0LCB5OiB0b3AgfSxcbiAgICB7IHg6IHJpZ2h0LCB5OiBib3R0b20gfSxcbiAgICB7IHg6IGxlZnQsIHk6IGJvdHRvbSB9LFxuICAgIHsgeDogbGVmdCwgeTogdG9wICsgTk9UQ0hfU0laRSB9LFxuICAgIHsgeDogbGVmdCArIE5PVENIX1NJWkUsIHk6IHRvcCB9XG4gIF07XG4gIGxldCBwb2x5Z29uO1xuICBjb25zdCB7IGNzc1N0eWxlcyB9ID0gbm9kZTtcbiAgaWYgKG5vZGUubG9vayA9PT0gXCJoYW5kRHJhd25cIikge1xuICAgIGNvbnN0IHJjID0gcm91Z2g0LnN2ZyhzaGFwZVN2Zyk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHVzZXJOb2RlT3ZlcnJpZGVzKG5vZGUsIHt9KTtcbiAgICBjb25zdCBwYXRoRGF0YSA9IGNyZWF0ZVBhdGhGcm9tUG9pbnRzKHBvaW50cyk7XG4gICAgY29uc3Qgcm91Z2hOb2RlID0gcmMucGF0aChwYXRoRGF0YSwgb3B0aW9ucyk7XG4gICAgcG9seWdvbiA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiByb3VnaE5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgkey13IC8gMn0sICR7aCAvIDJ9KWApO1xuICAgIGlmIChjc3NTdHlsZXMpIHtcbiAgICAgIHBvbHlnb24uYXR0cihcInN0eWxlXCIsIGNzc1N0eWxlcyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHBvbHlnb24gPSBpbnNlcnRQb2x5Z29uU2hhcGUoc2hhcGVTdmcsIHcsIGgsIHBvaW50cyk7XG4gIH1cbiAgaWYgKG5vZGVTdHlsZXMpIHtcbiAgICBwb2x5Z29uLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgfVxuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIHBvbHlnb24pO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnBvbHlnb24obm9kZSwgcG9pbnRzLCBwb2ludCk7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZShjYXJkLCBcImNhcmRcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL2Nob2ljZS50c1xuaW1wb3J0IHJvdWdoNSBmcm9tIFwicm91Z2hqc1wiO1xuZnVuY3Rpb24gY2hvaWNlKHBhcmVudCwgbm9kZSkge1xuICBjb25zdCB7IG5vZGVTdHlsZXMgfSA9IHN0eWxlczJTdHJpbmcobm9kZSk7XG4gIG5vZGUubGFiZWwgPSBcIlwiO1xuICBjb25zdCBzaGFwZVN2ZyA9IHBhcmVudC5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBnZXROb2RlQ2xhc3Nlcyhub2RlKSkuYXR0cihcImlkXCIsIG5vZGUuZG9tSWQgPz8gbm9kZS5pZCk7XG4gIGNvbnN0IHsgY3NzU3R5bGVzIH0gPSBub2RlO1xuICBjb25zdCBzID0gTWF0aC5tYXgoMjgsIG5vZGUud2lkdGggPz8gMCk7XG4gIGNvbnN0IHBvaW50cyA9IFtcbiAgICB7IHg6IDAsIHk6IHMgLyAyIH0sXG4gICAgeyB4OiBzIC8gMiwgeTogMCB9LFxuICAgIHsgeDogMCwgeTogLXMgLyAyIH0sXG4gICAgeyB4OiAtcyAvIDIsIHk6IDAgfVxuICBdO1xuICBjb25zdCByYyA9IHJvdWdoNS5zdmcoc2hhcGVTdmcpO1xuICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwge30pO1xuICBpZiAobm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgb3B0aW9ucy5yb3VnaG5lc3MgPSAwO1xuICAgIG9wdGlvbnMuZmlsbFN0eWxlID0gXCJzb2xpZFwiO1xuICB9XG4gIGNvbnN0IGNob2ljZVBhdGggPSBjcmVhdGVQYXRoRnJvbVBvaW50cyhwb2ludHMpO1xuICBjb25zdCByb3VnaE5vZGUgPSByYy5wYXRoKGNob2ljZVBhdGgsIG9wdGlvbnMpO1xuICBjb25zdCBjaG9pY2VTaGFwZSA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiByb3VnaE5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICBpZiAoY3NzU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIGNob2ljZVNoYXBlLnNlbGVjdEFsbChcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIGNzc1N0eWxlcyk7XG4gIH1cbiAgaWYgKG5vZGVTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgY2hvaWNlU2hhcGUuc2VsZWN0QWxsKFwicGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgbm9kZVN0eWxlcyk7XG4gIH1cbiAgbm9kZS53aWR0aCA9IDI4O1xuICBub2RlLmhlaWdodCA9IDI4O1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnBvbHlnb24obm9kZSwgcG9pbnRzLCBwb2ludCk7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZShjaG9pY2UsIFwiY2hvaWNlXCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy9jaXJjbGUudHNcbmltcG9ydCByb3VnaDYgZnJvbSBcInJvdWdoanNcIjtcbmFzeW5jIGZ1bmN0aW9uIGNpcmNsZShwYXJlbnQsIG5vZGUsIG9wdGlvbnMpIHtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcywgbm9kZVN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3gsIGhhbGZQYWRkaW5nIH0gPSBhd2FpdCBsYWJlbEhlbHBlcihwYXJlbnQsIG5vZGUsIGdldE5vZGVDbGFzc2VzKG5vZGUpKTtcbiAgY29uc3QgbGFiZWxQYWRkaW5nID0gMTY7XG4gIGNvbnN0IHBhZGRpbmcgPSBvcHRpb25zPy5wYWRkaW5nID8/IGhhbGZQYWRkaW5nO1xuICBjb25zdCByYWRpdXMgPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyBiYm94LndpZHRoIC8gMiArIGxhYmVsUGFkZGluZyAqIDIgOiBiYm94LndpZHRoIC8gMiArIHBhZGRpbmc7XG4gIGxldCBjaXJjbGVFbGVtO1xuICBjb25zdCB7IGNzc1N0eWxlcyB9ID0gbm9kZTtcbiAgaWYgKG5vZGUubG9vayA9PT0gXCJoYW5kRHJhd25cIikge1xuICAgIGNvbnN0IHJjID0gcm91Z2g2LnN2ZyhzaGFwZVN2Zyk7XG4gICAgY29uc3Qgb3B0aW9uczIgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gICAgY29uc3Qgcm91Z2hOb2RlID0gcmMuY2lyY2xlKDAsIDAsIHJhZGl1cyAqIDIsIG9wdGlvbnMyKTtcbiAgICBjaXJjbGVFbGVtID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHJvdWdoTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gICAgY2lyY2xlRWxlbS5hdHRyKFwiY2xhc3NcIiwgXCJiYXNpYyBsYWJlbC1jb250YWluZXJcIikuYXR0cihcInN0eWxlXCIsIGhhbmRsZVVuZGVmaW5lZEF0dHIoY3NzU3R5bGVzKSk7XG4gIH0gZWxzZSB7XG4gICAgY2lyY2xlRWxlbSA9IHNoYXBlU3ZnLmluc2VydChcImNpcmNsZVwiLCBcIjpmaXJzdC1jaGlsZFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJiYXNpYyBsYWJlbC1jb250YWluZXJcIikuYXR0cihcInN0eWxlXCIsIG5vZGVTdHlsZXMpLmF0dHIoXCJyXCIsIHJhZGl1cykuYXR0cihcImN4XCIsIDApLmF0dHIoXCJjeVwiLCAwKTtcbiAgfVxuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIGNpcmNsZUVsZW0pO1xuICBub2RlLmNhbGNJbnRlcnNlY3QgPSBmdW5jdGlvbihib3VuZHMsIHBvaW50KSB7XG4gICAgY29uc3QgcmFkaXVzMiA9IGJvdW5kcy53aWR0aCAvIDI7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LmNpcmNsZShib3VuZHMsIHJhZGl1czIsIHBvaW50KTtcbiAgfTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIGxvZy5pbmZvKFwiQ2lyY2xlIGludGVyc2VjdFwiLCBub2RlLCByYWRpdXMsIHBvaW50KTtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQuY2lyY2xlKG5vZGUsIHJhZGl1cywgcG9pbnQpO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59XG5fX25hbWUoY2lyY2xlLCBcImNpcmNsZVwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvY3Jvc3NlZENpcmNsZS50c1xuaW1wb3J0IHJvdWdoNyBmcm9tIFwicm91Z2hqc1wiO1xuZnVuY3Rpb24gY3JlYXRlTGluZShyKSB7XG4gIGNvbnN0IHhBeGlzNDUgPSBNYXRoLmNvcyhNYXRoLlBJIC8gNCk7XG4gIGNvbnN0IHlBeGlzNDUgPSBNYXRoLnNpbihNYXRoLlBJIC8gNCk7XG4gIGNvbnN0IGxpbmVMZW5ndGggPSByICogMjtcbiAgY29uc3QgcG9pbnRRMSA9IHsgeDogbGluZUxlbmd0aCAvIDIgKiB4QXhpczQ1LCB5OiBsaW5lTGVuZ3RoIC8gMiAqIHlBeGlzNDUgfTtcbiAgY29uc3QgcG9pbnRRMiA9IHsgeDogLShsaW5lTGVuZ3RoIC8gMikgKiB4QXhpczQ1LCB5OiBsaW5lTGVuZ3RoIC8gMiAqIHlBeGlzNDUgfTtcbiAgY29uc3QgcG9pbnRRMyA9IHsgeDogLShsaW5lTGVuZ3RoIC8gMikgKiB4QXhpczQ1LCB5OiAtKGxpbmVMZW5ndGggLyAyKSAqIHlBeGlzNDUgfTtcbiAgY29uc3QgcG9pbnRRNCA9IHsgeDogbGluZUxlbmd0aCAvIDIgKiB4QXhpczQ1LCB5OiAtKGxpbmVMZW5ndGggLyAyKSAqIHlBeGlzNDUgfTtcbiAgcmV0dXJuIGBNICR7cG9pbnRRMi54fSwke3BvaW50UTIueX0gTCAke3BvaW50UTQueH0sJHtwb2ludFE0Lnl9XG4gICAgICAgICAgICAgICAgICAgTSAke3BvaW50UTEueH0sJHtwb2ludFExLnl9IEwgJHtwb2ludFEzLnh9LCR7cG9pbnRRMy55fWA7XG59XG5fX25hbWUoY3JlYXRlTGluZSwgXCJjcmVhdGVMaW5lXCIpO1xuZnVuY3Rpb24gY3Jvc3NlZENpcmNsZShwYXJlbnQsIG5vZGUpIHtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcywgbm9kZVN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIG5vZGUubGFiZWwgPSBcIlwiO1xuICBjb25zdCBzaGFwZVN2ZyA9IHBhcmVudC5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBnZXROb2RlQ2xhc3Nlcyhub2RlKSkuYXR0cihcImlkXCIsIG5vZGUuZG9tSWQgPz8gbm9kZS5pZCk7XG4gIGNvbnN0IHJhZGl1cyA9IE1hdGgubWF4KDMwLCBub2RlPy53aWR0aCA/PyAwKTtcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGNvbnN0IHJjID0gcm91Z2g3LnN2ZyhzaGFwZVN2Zyk7XG4gIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gIGlmIChub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBvcHRpb25zLnJvdWdobmVzcyA9IDA7XG4gICAgb3B0aW9ucy5maWxsU3R5bGUgPSBcInNvbGlkXCI7XG4gIH1cbiAgY29uc3QgY2lyY2xlTm9kZSA9IHJjLmNpcmNsZSgwLCAwLCByYWRpdXMgKiAyLCBvcHRpb25zKTtcbiAgY29uc3QgbGluZVBhdGggPSBjcmVhdGVMaW5lKHJhZGl1cyk7XG4gIGNvbnN0IGxpbmVOb2RlID0gcmMucGF0aChsaW5lUGF0aCwgb3B0aW9ucyk7XG4gIGNvbnN0IGNyb3NzZWRDaXJjbGUyID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IGNpcmNsZU5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICBjcm9zc2VkQ2lyY2xlMi5pbnNlcnQoKCkgPT4gbGluZU5vZGUpO1xuICBjcm9zc2VkQ2lyY2xlMi5hdHRyKFwiY2xhc3NcIiwgXCJvdXRlci1wYXRoXCIpO1xuICBpZiAoY3NzU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIGNyb3NzZWRDaXJjbGUyLnNlbGVjdEFsbChcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIGNzc1N0eWxlcyk7XG4gIH1cbiAgaWYgKG5vZGVTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgY3Jvc3NlZENpcmNsZTIuc2VsZWN0QWxsKFwicGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgbm9kZVN0eWxlcyk7XG4gIH1cbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCBjcm9zc2VkQ2lyY2xlMik7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICBsb2cuaW5mbyhcImNyb3NzZWRDaXJjbGUgaW50ZXJzZWN0XCIsIG5vZGUsIHsgcmFkaXVzLCBwb2ludCB9KTtcbiAgICBjb25zdCBwb3MgPSBpbnRlcnNlY3RfZGVmYXVsdC5jaXJjbGUobm9kZSwgcmFkaXVzLCBwb2ludCk7XG4gICAgcmV0dXJuIHBvcztcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKGNyb3NzZWRDaXJjbGUsIFwiY3Jvc3NlZENpcmNsZVwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvY3VybHlCcmFjZUxlZnQudHNcbmltcG9ydCByb3VnaDggZnJvbSBcInJvdWdoanNcIjtcbmZ1bmN0aW9uIGdlbmVyYXRlQ2lyY2xlUG9pbnRzMihjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXMsIG51bVBvaW50cyA9IDEwMCwgc3RhcnRBbmdsZSA9IDAsIGVuZEFuZ2xlID0gMTgwKSB7XG4gIGNvbnN0IHBvaW50cyA9IFtdO1xuICBjb25zdCBzdGFydEFuZ2xlUmFkID0gc3RhcnRBbmdsZSAqIE1hdGguUEkgLyAxODA7XG4gIGNvbnN0IGVuZEFuZ2xlUmFkID0gZW5kQW5nbGUgKiBNYXRoLlBJIC8gMTgwO1xuICBjb25zdCBhbmdsZVJhbmdlID0gZW5kQW5nbGVSYWQgLSBzdGFydEFuZ2xlUmFkO1xuICBjb25zdCBhbmdsZVN0ZXAgPSBhbmdsZVJhbmdlIC8gKG51bVBvaW50cyAtIDEpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG51bVBvaW50czsgaSsrKSB7XG4gICAgY29uc3QgYW5nbGUgPSBzdGFydEFuZ2xlUmFkICsgaSAqIGFuZ2xlU3RlcDtcbiAgICBjb25zdCB4ID0gY2VudGVyWCArIHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKTtcbiAgICBjb25zdCB5ID0gY2VudGVyWSArIHJhZGl1cyAqIE1hdGguc2luKGFuZ2xlKTtcbiAgICBwb2ludHMucHVzaCh7IHg6IC14LCB5OiAteSB9KTtcbiAgfVxuICByZXR1cm4gcG9pbnRzO1xufVxuX19uYW1lKGdlbmVyYXRlQ2lyY2xlUG9pbnRzMiwgXCJnZW5lcmF0ZUNpcmNsZVBvaW50c1wiKTtcbmFzeW5jIGZ1bmN0aW9uIGN1cmx5QnJhY2VMZWZ0KHBhcmVudCwgbm9kZSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCwgbGFiZWwgfSA9IGF3YWl0IGxhYmVsSGVscGVyKHBhcmVudCwgbm9kZSwgZ2V0Tm9kZUNsYXNzZXMobm9kZSkpO1xuICBjb25zdCBwYWRkaW5nWCA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IDE4IDogbm9kZS5wYWRkaW5nID8/IDA7XG4gIGNvbnN0IHBhZGRpbmdZID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gMTIgOiBub2RlLnBhZGRpbmcgPz8gMDtcbiAgY29uc3QgdyA9IGJib3gud2lkdGggKyBwYWRkaW5nWDtcbiAgY29uc3QgaCA9IGJib3guaGVpZ2h0ICsgcGFkZGluZ1k7XG4gIGNvbnN0IHJhZGl1cyA9IE1hdGgubWF4KDUsIGggKiAwLjEpO1xuICBjb25zdCB7IGNzc1N0eWxlcyB9ID0gbm9kZTtcbiAgY29uc3QgcG9pbnRzID0gW1xuICAgIC4uLmdlbmVyYXRlQ2lyY2xlUG9pbnRzMih3IC8gMiwgLWggLyAyLCByYWRpdXMsIDMwLCAtOTAsIDApLFxuICAgIHsgeDogLXcgLyAyIC0gcmFkaXVzLCB5OiByYWRpdXMgfSxcbiAgICAuLi5nZW5lcmF0ZUNpcmNsZVBvaW50czIodyAvIDIgKyByYWRpdXMgKiAyLCAtcmFkaXVzLCByYWRpdXMsIDIwLCAtMTgwLCAtMjcwKSxcbiAgICAuLi5nZW5lcmF0ZUNpcmNsZVBvaW50czIodyAvIDIgKyByYWRpdXMgKiAyLCByYWRpdXMsIHJhZGl1cywgMjAsIC05MCwgLTE4MCksXG4gICAgeyB4OiAtdyAvIDIgLSByYWRpdXMsIHk6IC1oIC8gMiB9LFxuICAgIC4uLmdlbmVyYXRlQ2lyY2xlUG9pbnRzMih3IC8gMiwgaCAvIDIsIHJhZGl1cywgMjAsIDAsIDkwKVxuICBdO1xuICBjb25zdCByZWN0UG9pbnRzID0gW1xuICAgIHsgeDogdyAvIDIsIHk6IC1oIC8gMiAtIHJhZGl1cyB9LFxuICAgIHsgeDogLXcgLyAyLCB5OiAtaCAvIDIgLSByYWRpdXMgfSxcbiAgICAuLi5nZW5lcmF0ZUNpcmNsZVBvaW50czIodyAvIDIsIC1oIC8gMiwgcmFkaXVzLCAyMCwgLTkwLCAwKSxcbiAgICB7IHg6IC13IC8gMiAtIHJhZGl1cywgeTogLXJhZGl1cyB9LFxuICAgIC4uLmdlbmVyYXRlQ2lyY2xlUG9pbnRzMih3IC8gMiArIHcgKiAwLjEsIC1yYWRpdXMsIHJhZGl1cywgMjAsIC0xODAsIC0yNzApLFxuICAgIC4uLmdlbmVyYXRlQ2lyY2xlUG9pbnRzMih3IC8gMiArIHcgKiAwLjEsIHJhZGl1cywgcmFkaXVzLCAyMCwgLTkwLCAtMTgwKSxcbiAgICB7IHg6IC13IC8gMiAtIHJhZGl1cywgeTogaCAvIDIgfSxcbiAgICAuLi5nZW5lcmF0ZUNpcmNsZVBvaW50czIodyAvIDIsIGggLyAyLCByYWRpdXMsIDIwLCAwLCA5MCksXG4gICAgeyB4OiAtdyAvIDIsIHk6IGggLyAyICsgcmFkaXVzIH0sXG4gICAgeyB4OiB3IC8gMiwgeTogaCAvIDIgKyByYWRpdXMgfVxuICBdO1xuICBjb25zdCByYyA9IHJvdWdoOC5zdmcoc2hhcGVTdmcpO1xuICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwgeyBmaWxsOiBcIm5vbmVcIiB9KTtcbiAgaWYgKG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIG9wdGlvbnMucm91Z2huZXNzID0gMDtcbiAgICBvcHRpb25zLmZpbGxTdHlsZSA9IFwic29saWRcIjtcbiAgfVxuICBjb25zdCBjdXJseUJyYWNlTGVmdFBhdGggPSBjcmVhdGVQYXRoRnJvbVBvaW50cyhwb2ludHMpO1xuICBjb25zdCBuZXdDdXJseUJyYWNlUGF0aCA9IGN1cmx5QnJhY2VMZWZ0UGF0aC5yZXBsYWNlKFwiWlwiLCBcIlwiKTtcbiAgY29uc3QgY3VybHlCcmFjZUxlZnROb2RlID0gcmMucGF0aChuZXdDdXJseUJyYWNlUGF0aCwgb3B0aW9ucyk7XG4gIGNvbnN0IHJlY3RQYXRoID0gY3JlYXRlUGF0aEZyb21Qb2ludHMocmVjdFBvaW50cyk7XG4gIGNvbnN0IHJlY3RTaGFwZSA9IHJjLnBhdGgocmVjdFBhdGgsIHsgLi4ub3B0aW9ucyB9KTtcbiAgY29uc3QgY3VybHlCcmFjZUxlZnRTaGFwZSA9IHNoYXBlU3ZnLmluc2VydChcImdcIiwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gIGN1cmx5QnJhY2VMZWZ0U2hhcGUuaW5zZXJ0KCgpID0+IHJlY3RTaGFwZSwgXCI6Zmlyc3QtY2hpbGRcIikuYXR0cihcInN0cm9rZS1vcGFjaXR5XCIsIDApO1xuICBjdXJseUJyYWNlTGVmdFNoYXBlLmluc2VydCgoKSA9PiBjdXJseUJyYWNlTGVmdE5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICBjdXJseUJyYWNlTGVmdFNoYXBlLmF0dHIoXCJjbGFzc1wiLCBcInRleHRcIik7XG4gIGlmIChjc3NTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgY3VybHlCcmFjZUxlZnRTaGFwZS5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBjc3NTdHlsZXMpO1xuICB9XG4gIGlmIChub2RlU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIGN1cmx5QnJhY2VMZWZ0U2hhcGUuc2VsZWN0QWxsKFwicGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgbm9kZVN0eWxlcyk7XG4gIH1cbiAgY3VybHlCcmFjZUxlZnRTaGFwZS5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHtyYWRpdXN9LCAwKWApO1xuICBsYWJlbC5hdHRyKFxuICAgIFwidHJhbnNmb3JtXCIsXG4gICAgYHRyYW5zbGF0ZSgkey13IC8gMiArIHJhZGl1cyAtIChiYm94LnggLSAoYmJveC5sZWZ0ID8/IDApKX0sJHstaCAvIDIgKyAobm9kZS5wYWRkaW5nID8/IDApIC8gMiAtIChiYm94LnkgLSAoYmJveC50b3AgPz8gMCkpfSlgXG4gICk7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgY3VybHlCcmFjZUxlZnRTaGFwZSk7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICBjb25zdCBwb3MgPSBpbnRlcnNlY3RfZGVmYXVsdC5wb2x5Z29uKG5vZGUsIHJlY3RQb2ludHMsIHBvaW50KTtcbiAgICByZXR1cm4gcG9zO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59XG5fX25hbWUoY3VybHlCcmFjZUxlZnQsIFwiY3VybHlCcmFjZUxlZnRcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL2N1cmx5QnJhY2VSaWdodC50c1xuaW1wb3J0IHJvdWdoOSBmcm9tIFwicm91Z2hqc1wiO1xuZnVuY3Rpb24gZ2VuZXJhdGVDaXJjbGVQb2ludHMzKGNlbnRlclgsIGNlbnRlclksIHJhZGl1cywgbnVtUG9pbnRzID0gMTAwLCBzdGFydEFuZ2xlID0gMCwgZW5kQW5nbGUgPSAxODApIHtcbiAgY29uc3QgcG9pbnRzID0gW107XG4gIGNvbnN0IHN0YXJ0QW5nbGVSYWQgPSBzdGFydEFuZ2xlICogTWF0aC5QSSAvIDE4MDtcbiAgY29uc3QgZW5kQW5nbGVSYWQgPSBlbmRBbmdsZSAqIE1hdGguUEkgLyAxODA7XG4gIGNvbnN0IGFuZ2xlUmFuZ2UgPSBlbmRBbmdsZVJhZCAtIHN0YXJ0QW5nbGVSYWQ7XG4gIGNvbnN0IGFuZ2xlU3RlcCA9IGFuZ2xlUmFuZ2UgLyAobnVtUG9pbnRzIC0gMSk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtUG9pbnRzOyBpKyspIHtcbiAgICBjb25zdCBhbmdsZSA9IHN0YXJ0QW5nbGVSYWQgKyBpICogYW5nbGVTdGVwO1xuICAgIGNvbnN0IHggPSBjZW50ZXJYICsgcmFkaXVzICogTWF0aC5jb3MoYW5nbGUpO1xuICAgIGNvbnN0IHkgPSBjZW50ZXJZICsgcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpO1xuICAgIHBvaW50cy5wdXNoKHsgeCwgeSB9KTtcbiAgfVxuICByZXR1cm4gcG9pbnRzO1xufVxuX19uYW1lKGdlbmVyYXRlQ2lyY2xlUG9pbnRzMywgXCJnZW5lcmF0ZUNpcmNsZVBvaW50c1wiKTtcbmFzeW5jIGZ1bmN0aW9uIGN1cmx5QnJhY2VSaWdodChwYXJlbnQsIG5vZGUpIHtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcywgbm9kZVN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3gsIGxhYmVsIH0gPSBhd2FpdCBsYWJlbEhlbHBlcihwYXJlbnQsIG5vZGUsIGdldE5vZGVDbGFzc2VzKG5vZGUpKTtcbiAgY29uc3QgbGFiZWxQYWRkaW5nWCA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IDE4IDogbm9kZS5wYWRkaW5nID8/IDA7XG4gIGNvbnN0IGxhYmVsUGFkZGluZ1kgPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyAxMiA6IG5vZGUucGFkZGluZyA/PyAwO1xuICBjb25zdCB3ID0gYmJveC53aWR0aCArIChub2RlLmxvb2sgPT09IFwibmVvXCIgPyBsYWJlbFBhZGRpbmdYICogMiA6IGxhYmVsUGFkZGluZ1gpO1xuICBjb25zdCBoID0gYmJveC5oZWlnaHQgKyAobm9kZS5sb29rID09PSBcIm5lb1wiID8gbGFiZWxQYWRkaW5nWSAqIDIgOiBsYWJlbFBhZGRpbmdZKTtcbiAgY29uc3QgcmFkaXVzID0gTWF0aC5tYXgoNSwgaCAqIDAuMSk7XG4gIGNvbnN0IHsgY3NzU3R5bGVzIH0gPSBub2RlO1xuICBjb25zdCBwb2ludHMgPSBbXG4gICAgLi4uZ2VuZXJhdGVDaXJjbGVQb2ludHMzKHcgLyAyLCAtaCAvIDIsIHJhZGl1cywgMjAsIC05MCwgMCksXG4gICAgeyB4OiB3IC8gMiArIHJhZGl1cywgeTogLXJhZGl1cyB9LFxuICAgIC4uLmdlbmVyYXRlQ2lyY2xlUG9pbnRzMyh3IC8gMiArIHJhZGl1cyAqIDIsIC1yYWRpdXMsIHJhZGl1cywgMjAsIC0xODAsIC0yNzApLFxuICAgIC4uLmdlbmVyYXRlQ2lyY2xlUG9pbnRzMyh3IC8gMiArIHJhZGl1cyAqIDIsIHJhZGl1cywgcmFkaXVzLCAyMCwgLTkwLCAtMTgwKSxcbiAgICB7IHg6IHcgLyAyICsgcmFkaXVzLCB5OiBoIC8gMiB9LFxuICAgIC4uLmdlbmVyYXRlQ2lyY2xlUG9pbnRzMyh3IC8gMiwgaCAvIDIsIHJhZGl1cywgMjAsIDAsIDkwKVxuICBdO1xuICBjb25zdCByZWN0UG9pbnRzID0gW1xuICAgIHsgeDogLXcgLyAyLCB5OiAtaCAvIDIgLSByYWRpdXMgfSxcbiAgICB7IHg6IHcgLyAyLCB5OiAtaCAvIDIgLSByYWRpdXMgfSxcbiAgICAuLi5nZW5lcmF0ZUNpcmNsZVBvaW50czModyAvIDIsIC1oIC8gMiwgcmFkaXVzLCAyMCwgLTkwLCAwKSxcbiAgICB7IHg6IHcgLyAyICsgcmFkaXVzLCB5OiAtcmFkaXVzIH0sXG4gICAgLi4uZ2VuZXJhdGVDaXJjbGVQb2ludHMzKHcgLyAyICsgcmFkaXVzICogMiwgLXJhZGl1cywgcmFkaXVzLCAyMCwgLTE4MCwgLTI3MCksXG4gICAgLi4uZ2VuZXJhdGVDaXJjbGVQb2ludHMzKHcgLyAyICsgcmFkaXVzICogMiwgcmFkaXVzLCByYWRpdXMsIDIwLCAtOTAsIC0xODApLFxuICAgIHsgeDogdyAvIDIgKyByYWRpdXMsIHk6IGggLyAyIH0sXG4gICAgLi4uZ2VuZXJhdGVDaXJjbGVQb2ludHMzKHcgLyAyLCBoIC8gMiwgcmFkaXVzLCAyMCwgMCwgOTApLFxuICAgIHsgeDogdyAvIDIsIHk6IGggLyAyICsgcmFkaXVzIH0sXG4gICAgeyB4OiAtdyAvIDIsIHk6IGggLyAyICsgcmFkaXVzIH1cbiAgXTtcbiAgY29uc3QgcmMgPSByb3VnaDkuc3ZnKHNoYXBlU3ZnKTtcbiAgY29uc3Qgb3B0aW9ucyA9IHVzZXJOb2RlT3ZlcnJpZGVzKG5vZGUsIHsgZmlsbDogXCJub25lXCIgfSk7XG4gIGlmIChub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBvcHRpb25zLnJvdWdobmVzcyA9IDA7XG4gICAgb3B0aW9ucy5maWxsU3R5bGUgPSBcInNvbGlkXCI7XG4gIH1cbiAgY29uc3QgY3VybHlCcmFjZVJpZ2h0UGF0aCA9IGNyZWF0ZVBhdGhGcm9tUG9pbnRzKHBvaW50cyk7XG4gIGNvbnN0IG5ld0N1cmx5QnJhY2VQYXRoID0gY3VybHlCcmFjZVJpZ2h0UGF0aC5yZXBsYWNlKFwiWlwiLCBcIlwiKTtcbiAgY29uc3QgY3VybHlCcmFjZVJpZ2h0Tm9kZSA9IHJjLnBhdGgobmV3Q3VybHlCcmFjZVBhdGgsIG9wdGlvbnMpO1xuICBjb25zdCByZWN0UGF0aCA9IGNyZWF0ZVBhdGhGcm9tUG9pbnRzKHJlY3RQb2ludHMpO1xuICBjb25zdCByZWN0U2hhcGUgPSByYy5wYXRoKHJlY3RQYXRoLCB7IC4uLm9wdGlvbnMgfSk7XG4gIGNvbnN0IGN1cmx5QnJhY2VSaWdodFNoYXBlID0gc2hhcGVTdmcuaW5zZXJ0KFwiZ1wiLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgY3VybHlCcmFjZVJpZ2h0U2hhcGUuaW5zZXJ0KCgpID0+IHJlY3RTaGFwZSwgXCI6Zmlyc3QtY2hpbGRcIikuYXR0cihcInN0cm9rZS1vcGFjaXR5XCIsIDApO1xuICBjdXJseUJyYWNlUmlnaHRTaGFwZS5pbnNlcnQoKCkgPT4gY3VybHlCcmFjZVJpZ2h0Tm9kZSwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gIGN1cmx5QnJhY2VSaWdodFNoYXBlLmF0dHIoXCJjbGFzc1wiLCBcInRleHRcIik7XG4gIGlmIChjc3NTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgY3VybHlCcmFjZVJpZ2h0U2hhcGUuc2VsZWN0QWxsKFwicGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgY3NzU3R5bGVzKTtcbiAgfVxuICBpZiAobm9kZVN0eWxlcyAmJiBub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBjdXJseUJyYWNlUmlnaHRTaGFwZS5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgfVxuICBjdXJseUJyYWNlUmlnaHRTaGFwZS5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHstcmFkaXVzfSwgMClgKTtcbiAgbGFiZWwuYXR0cihcbiAgICBcInRyYW5zZm9ybVwiLFxuICAgIGB0cmFuc2xhdGUoJHstdyAvIDIgKyAobm9kZS5wYWRkaW5nID8/IDApIC8gMiAtIChiYm94LnggLSAoYmJveC5sZWZ0ID8/IDApKX0sJHstaCAvIDIgKyAobm9kZS5wYWRkaW5nID8/IDApIC8gMiAtIChiYm94LnkgLSAoYmJveC50b3AgPz8gMCkpfSlgXG4gICk7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgY3VybHlCcmFjZVJpZ2h0U2hhcGUpO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgY29uc3QgcG9zID0gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihub2RlLCByZWN0UG9pbnRzLCBwb2ludCk7XG4gICAgcmV0dXJuIHBvcztcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKGN1cmx5QnJhY2VSaWdodCwgXCJjdXJseUJyYWNlUmlnaHRcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL2N1cmx5QnJhY2VzLnRzXG5pbXBvcnQgcm91Z2gxMCBmcm9tIFwicm91Z2hqc1wiO1xuZnVuY3Rpb24gZ2VuZXJhdGVDaXJjbGVQb2ludHM0KGNlbnRlclgsIGNlbnRlclksIHJhZGl1cywgbnVtUG9pbnRzID0gMTAwLCBzdGFydEFuZ2xlID0gMCwgZW5kQW5nbGUgPSAxODApIHtcbiAgY29uc3QgcG9pbnRzID0gW107XG4gIGNvbnN0IHN0YXJ0QW5nbGVSYWQgPSBzdGFydEFuZ2xlICogTWF0aC5QSSAvIDE4MDtcbiAgY29uc3QgZW5kQW5nbGVSYWQgPSBlbmRBbmdsZSAqIE1hdGguUEkgLyAxODA7XG4gIGNvbnN0IGFuZ2xlUmFuZ2UgPSBlbmRBbmdsZVJhZCAtIHN0YXJ0QW5nbGVSYWQ7XG4gIGNvbnN0IGFuZ2xlU3RlcCA9IGFuZ2xlUmFuZ2UgLyAobnVtUG9pbnRzIC0gMSk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtUG9pbnRzOyBpKyspIHtcbiAgICBjb25zdCBhbmdsZSA9IHN0YXJ0QW5nbGVSYWQgKyBpICogYW5nbGVTdGVwO1xuICAgIGNvbnN0IHggPSBjZW50ZXJYICsgcmFkaXVzICogTWF0aC5jb3MoYW5nbGUpO1xuICAgIGNvbnN0IHkgPSBjZW50ZXJZICsgcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpO1xuICAgIHBvaW50cy5wdXNoKHsgeDogLXgsIHk6IC15IH0pO1xuICB9XG4gIHJldHVybiBwb2ludHM7XG59XG5fX25hbWUoZ2VuZXJhdGVDaXJjbGVQb2ludHM0LCBcImdlbmVyYXRlQ2lyY2xlUG9pbnRzXCIpO1xuYXN5bmMgZnVuY3Rpb24gY3VybHlCcmFjZXMocGFyZW50LCBub2RlKSB7XG4gIGNvbnN0IHsgbGFiZWxTdHlsZXMsIG5vZGVTdHlsZXMgfSA9IHN0eWxlczJTdHJpbmcobm9kZSk7XG4gIG5vZGUubGFiZWxTdHlsZSA9IGxhYmVsU3R5bGVzO1xuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94LCBsYWJlbCB9ID0gYXdhaXQgbGFiZWxIZWxwZXIocGFyZW50LCBub2RlLCBnZXROb2RlQ2xhc3Nlcyhub2RlKSk7XG4gIGNvbnN0IGxhYmVsUGFkZGluZ1ggPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyAxOCA6IG5vZGUucGFkZGluZyA/PyAwO1xuICBjb25zdCBsYWJlbFBhZGRpbmdZID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gMTIgOiBub2RlLnBhZGRpbmcgPz8gMDtcbiAgY29uc3QgdyA9IGJib3gud2lkdGggKyAobm9kZS5sb29rID09PSBcIm5lb1wiID8gbGFiZWxQYWRkaW5nWCAqIDIgOiBsYWJlbFBhZGRpbmdYKTtcbiAgY29uc3QgaCA9IGJib3guaGVpZ2h0ICsgKG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IGxhYmVsUGFkZGluZ1kgKiAyIDogbGFiZWxQYWRkaW5nWSk7XG4gIGNvbnN0IHJhZGl1cyA9IE1hdGgubWF4KDUsIGggKiAwLjEpO1xuICBjb25zdCB7IGNzc1N0eWxlcyB9ID0gbm9kZTtcbiAgY29uc3QgbGVmdEN1cmx5QnJhY2VQb2ludHMgPSBbXG4gICAgLi4uZ2VuZXJhdGVDaXJjbGVQb2ludHM0KHcgLyAyLCAtaCAvIDIsIHJhZGl1cywgMzAsIC05MCwgMCksXG4gICAgeyB4OiAtdyAvIDIgLSByYWRpdXMsIHk6IHJhZGl1cyB9LFxuICAgIC4uLmdlbmVyYXRlQ2lyY2xlUG9pbnRzNCh3IC8gMiArIHJhZGl1cyAqIDIsIC1yYWRpdXMsIHJhZGl1cywgMjAsIC0xODAsIC0yNzApLFxuICAgIC4uLmdlbmVyYXRlQ2lyY2xlUG9pbnRzNCh3IC8gMiArIHJhZGl1cyAqIDIsIHJhZGl1cywgcmFkaXVzLCAyMCwgLTkwLCAtMTgwKSxcbiAgICB7IHg6IC13IC8gMiAtIHJhZGl1cywgeTogLWggLyAyIH0sXG4gICAgLi4uZ2VuZXJhdGVDaXJjbGVQb2ludHM0KHcgLyAyLCBoIC8gMiwgcmFkaXVzLCAyMCwgMCwgOTApXG4gIF07XG4gIGNvbnN0IHJpZ2h0Q3VybHlCcmFjZVBvaW50cyA9IFtcbiAgICAuLi5nZW5lcmF0ZUNpcmNsZVBvaW50czQoLXcgLyAyICsgcmFkaXVzICsgcmFkaXVzIC8gMiwgLWggLyAyLCByYWRpdXMsIDIwLCAtOTAsIC0xODApLFxuICAgIHsgeDogdyAvIDIgLSByYWRpdXMgLyAyLCB5OiByYWRpdXMgfSxcbiAgICAuLi5nZW5lcmF0ZUNpcmNsZVBvaW50czQoLXcgLyAyIC0gcmFkaXVzIC8gMiwgLXJhZGl1cywgcmFkaXVzLCAyMCwgMCwgOTApLFxuICAgIC4uLmdlbmVyYXRlQ2lyY2xlUG9pbnRzNCgtdyAvIDIgLSByYWRpdXMgLyAyLCByYWRpdXMsIHJhZGl1cywgMjAsIC05MCwgMCksXG4gICAgeyB4OiB3IC8gMiAtIHJhZGl1cyAvIDIsIHk6IC1yYWRpdXMgfSxcbiAgICAuLi5nZW5lcmF0ZUNpcmNsZVBvaW50czQoLXcgLyAyICsgcmFkaXVzICsgcmFkaXVzIC8gMiwgaCAvIDIsIHJhZGl1cywgMzAsIC0xODAsIC0yNzApXG4gIF07XG4gIGNvbnN0IHJlY3RQb2ludHMgPSBbXG4gICAgeyB4OiB3IC8gMiwgeTogLWggLyAyIC0gcmFkaXVzIH0sXG4gICAgeyB4OiAtdyAvIDIsIHk6IC1oIC8gMiAtIHJhZGl1cyB9LFxuICAgIC4uLmdlbmVyYXRlQ2lyY2xlUG9pbnRzNCh3IC8gMiwgLWggLyAyLCByYWRpdXMsIDIwLCAtOTAsIDApLFxuICAgIHsgeDogLXcgLyAyIC0gcmFkaXVzLCB5OiAtcmFkaXVzIH0sXG4gICAgLi4uZ2VuZXJhdGVDaXJjbGVQb2ludHM0KHcgLyAyICsgcmFkaXVzICogMiwgLXJhZGl1cywgcmFkaXVzLCAyMCwgLTE4MCwgLTI3MCksXG4gICAgLi4uZ2VuZXJhdGVDaXJjbGVQb2ludHM0KHcgLyAyICsgcmFkaXVzICogMiwgcmFkaXVzLCByYWRpdXMsIDIwLCAtOTAsIC0xODApLFxuICAgIHsgeDogLXcgLyAyIC0gcmFkaXVzLCB5OiBoIC8gMiB9LFxuICAgIC4uLmdlbmVyYXRlQ2lyY2xlUG9pbnRzNCh3IC8gMiwgaCAvIDIsIHJhZGl1cywgMjAsIDAsIDkwKSxcbiAgICB7IHg6IC13IC8gMiwgeTogaCAvIDIgKyByYWRpdXMgfSxcbiAgICB7IHg6IHcgLyAyIC0gcmFkaXVzIC0gcmFkaXVzIC8gMiwgeTogaCAvIDIgKyByYWRpdXMgfSxcbiAgICAuLi5nZW5lcmF0ZUNpcmNsZVBvaW50czQoLXcgLyAyICsgcmFkaXVzICsgcmFkaXVzIC8gMiwgLWggLyAyLCByYWRpdXMsIDIwLCAtOTAsIC0xODApLFxuICAgIHsgeDogdyAvIDIgLSByYWRpdXMgLyAyLCB5OiByYWRpdXMgfSxcbiAgICAuLi5nZW5lcmF0ZUNpcmNsZVBvaW50czQoLXcgLyAyIC0gcmFkaXVzIC8gMiwgLXJhZGl1cywgcmFkaXVzLCAyMCwgMCwgOTApLFxuICAgIC4uLmdlbmVyYXRlQ2lyY2xlUG9pbnRzNCgtdyAvIDIgLSByYWRpdXMgLyAyLCByYWRpdXMsIHJhZGl1cywgMjAsIC05MCwgMCksXG4gICAgeyB4OiB3IC8gMiAtIHJhZGl1cyAvIDIsIHk6IC1yYWRpdXMgfSxcbiAgICAuLi5nZW5lcmF0ZUNpcmNsZVBvaW50czQoLXcgLyAyICsgcmFkaXVzICsgcmFkaXVzIC8gMiwgaCAvIDIsIHJhZGl1cywgMzAsIC0xODAsIC0yNzApXG4gIF07XG4gIGNvbnN0IHJjID0gcm91Z2gxMC5zdmcoc2hhcGVTdmcpO1xuICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwgeyBmaWxsOiBcIm5vbmVcIiB9KTtcbiAgaWYgKG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIG9wdGlvbnMucm91Z2huZXNzID0gMDtcbiAgICBvcHRpb25zLmZpbGxTdHlsZSA9IFwic29saWRcIjtcbiAgfVxuICBjb25zdCBsZWZ0Q3VybHlCcmFjZVBhdGggPSBjcmVhdGVQYXRoRnJvbVBvaW50cyhsZWZ0Q3VybHlCcmFjZVBvaW50cyk7XG4gIGNvbnN0IG5ld0xlZnRDdXJseUJyYWNlUGF0aCA9IGxlZnRDdXJseUJyYWNlUGF0aC5yZXBsYWNlKFwiWlwiLCBcIlwiKTtcbiAgY29uc3QgbGVmdEN1cmx5QnJhY2VOb2RlID0gcmMucGF0aChuZXdMZWZ0Q3VybHlCcmFjZVBhdGgsIG9wdGlvbnMpO1xuICBjb25zdCByaWdodEN1cmx5QnJhY2VQYXRoID0gY3JlYXRlUGF0aEZyb21Qb2ludHMocmlnaHRDdXJseUJyYWNlUG9pbnRzKTtcbiAgY29uc3QgbmV3UmlnaHRDdXJseUJyYWNlUGF0aCA9IHJpZ2h0Q3VybHlCcmFjZVBhdGgucmVwbGFjZShcIlpcIiwgXCJcIik7XG4gIGNvbnN0IHJpZ2h0Q3VybHlCcmFjZU5vZGUgPSByYy5wYXRoKG5ld1JpZ2h0Q3VybHlCcmFjZVBhdGgsIG9wdGlvbnMpO1xuICBjb25zdCByZWN0UGF0aCA9IGNyZWF0ZVBhdGhGcm9tUG9pbnRzKHJlY3RQb2ludHMpO1xuICBjb25zdCByZWN0U2hhcGUgPSByYy5wYXRoKHJlY3RQYXRoLCB7IC4uLm9wdGlvbnMgfSk7XG4gIGNvbnN0IGN1cmx5QnJhY2VzU2hhcGUgPSBzaGFwZVN2Zy5pbnNlcnQoXCJnXCIsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICBjdXJseUJyYWNlc1NoYXBlLmluc2VydCgoKSA9PiByZWN0U2hhcGUsIFwiOmZpcnN0LWNoaWxkXCIpLmF0dHIoXCJzdHJva2Utb3BhY2l0eVwiLCAwKTtcbiAgY3VybHlCcmFjZXNTaGFwZS5pbnNlcnQoKCkgPT4gbGVmdEN1cmx5QnJhY2VOb2RlLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgY3VybHlCcmFjZXNTaGFwZS5pbnNlcnQoKCkgPT4gcmlnaHRDdXJseUJyYWNlTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gIGN1cmx5QnJhY2VzU2hhcGUuYXR0cihcImNsYXNzXCIsIFwidGV4dFwiKTtcbiAgaWYgKGNzc1N0eWxlcyAmJiBub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBjdXJseUJyYWNlc1NoYXBlLnNlbGVjdEFsbChcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIGNzc1N0eWxlcyk7XG4gIH1cbiAgaWYgKG5vZGVTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgY3VybHlCcmFjZXNTaGFwZS5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgfVxuICBjdXJseUJyYWNlc1NoYXBlLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgke3JhZGl1cyAtIHJhZGl1cyAvIDR9LCAwKWApO1xuICBsYWJlbC5hdHRyKFxuICAgIFwidHJhbnNmb3JtXCIsXG4gICAgYHRyYW5zbGF0ZSgkey13IC8gMiArIChub2RlLnBhZGRpbmcgPz8gMCkgLyAyIC0gKGJib3gueCAtIChiYm94LmxlZnQgPz8gMCkpfSwkey1oIC8gMiArIChub2RlLnBhZGRpbmcgPz8gMCkgLyAyIC0gKGJib3gueSAtIChiYm94LnRvcCA/PyAwKSl9KWBcbiAgKTtcbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCBjdXJseUJyYWNlc1NoYXBlKTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIGNvbnN0IHBvcyA9IGludGVyc2VjdF9kZWZhdWx0LnBvbHlnb24obm9kZSwgcmVjdFBvaW50cywgcG9pbnQpO1xuICAgIHJldHVybiBwb3M7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZShjdXJseUJyYWNlcywgXCJjdXJseUJyYWNlc1wiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvY3VydmVkVHJhcGV6b2lkLnRzXG5pbXBvcnQgcm91Z2gxMSBmcm9tIFwicm91Z2hqc1wiO1xuYXN5bmMgZnVuY3Rpb24gY3VydmVkVHJhcGV6b2lkKHBhcmVudCwgbm9kZSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3Qgbm9kZVBhZGRpbmcgPSBub2RlLnBhZGRpbmcgPz8gMDtcbiAgY29uc3QgbGFiZWxQYWRkaW5nWCA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IDE2IDogbm9kZVBhZGRpbmc7XG4gIGNvbnN0IGxhYmVsUGFkZGluZ1kgPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyAxMiA6IG5vZGVQYWRkaW5nO1xuICBjb25zdCBtaW5XaWR0aCA9IDIwLCBtaW5IZWlnaHQgPSA1O1xuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94IH0gPSBhd2FpdCBsYWJlbEhlbHBlcihwYXJlbnQsIG5vZGUsIGdldE5vZGVDbGFzc2VzKG5vZGUpKTtcbiAgY29uc3QgdyA9IE1hdGgubWF4KG1pbldpZHRoLCAoYmJveC53aWR0aCArIGxhYmVsUGFkZGluZ1ggKiAyKSAqIDEuMjUsIG5vZGU/LndpZHRoID8/IDApO1xuICBjb25zdCBoID0gTWF0aC5tYXgobWluSGVpZ2h0LCBiYm94LmhlaWdodCArIGxhYmVsUGFkZGluZ1kgKiAyLCBub2RlPy5oZWlnaHQgPz8gMCk7XG4gIGNvbnN0IHJhZGl1cyA9IGggLyAyO1xuICBjb25zdCB7IGNzc1N0eWxlcyB9ID0gbm9kZTtcbiAgY29uc3QgcmMgPSByb3VnaDExLnN2ZyhzaGFwZVN2Zyk7XG4gIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gIGlmIChub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBvcHRpb25zLnJvdWdobmVzcyA9IDA7XG4gICAgb3B0aW9ucy5maWxsU3R5bGUgPSBcInNvbGlkXCI7XG4gIH1cbiAgY29uc3QgdG90YWxXaWR0aCA9IHcsIHRvdGFsSGVpZ2h0ID0gaDtcbiAgY29uc3QgcncgPSB0b3RhbFdpZHRoIC0gcmFkaXVzO1xuICBjb25zdCB0dyA9IHRvdGFsSGVpZ2h0IC8gNDtcbiAgY29uc3QgcG9pbnRzID0gW1xuICAgIHsgeDogcncsIHk6IDAgfSxcbiAgICB7IHg6IHR3LCB5OiAwIH0sXG4gICAgeyB4OiAwLCB5OiB0b3RhbEhlaWdodCAvIDIgfSxcbiAgICB7IHg6IHR3LCB5OiB0b3RhbEhlaWdodCB9LFxuICAgIHsgeDogcncsIHk6IHRvdGFsSGVpZ2h0IH0sXG4gICAgLi4uZ2VuZXJhdGVDaXJjbGVQb2ludHMoLXJ3LCAtdG90YWxIZWlnaHQgLyAyLCByYWRpdXMsIDUwLCAyNzAsIDkwKVxuICBdO1xuICBjb25zdCBwYXRoRGF0YSA9IGNyZWF0ZVBhdGhGcm9tUG9pbnRzKHBvaW50cyk7XG4gIGNvbnN0IHNoYXBlTm9kZSA9IHJjLnBhdGgocGF0aERhdGEsIG9wdGlvbnMpO1xuICBjb25zdCBwb2x5Z29uID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHNoYXBlTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gIHBvbHlnb24uYXR0cihcImNsYXNzXCIsIFwiYmFzaWMgbGFiZWwtY29udGFpbmVyIG91dGVyLXBhdGhcIik7XG4gIGlmIChjc3NTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgcG9seWdvbi5zZWxlY3RDaGlsZHJlbihcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIGNzc1N0eWxlcyk7XG4gIH1cbiAgaWYgKG5vZGVTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgcG9seWdvbi5zZWxlY3RDaGlsZHJlbihcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIG5vZGVTdHlsZXMpO1xuICB9XG4gIHBvbHlnb24uYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7LXcgLyAyfSwgJHstaCAvIDJ9KWApO1xuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIHBvbHlnb24pO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgY29uc3QgcG9zID0gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihub2RlLCBwb2ludHMsIHBvaW50KTtcbiAgICByZXR1cm4gcG9zO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59XG5fX25hbWUoY3VydmVkVHJhcGV6b2lkLCBcImN1cnZlZFRyYXBlem9pZFwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvY3lsaW5kZXIudHNcbmltcG9ydCByb3VnaDEyIGZyb20gXCJyb3VnaGpzXCI7XG52YXIgY3JlYXRlQ3lsaW5kZXJQYXRoRCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHgsIHksIHdpZHRoLCBoZWlnaHQsIHJ4LCByeSkgPT4ge1xuICByZXR1cm4gW1xuICAgIGBNJHt4fSwke3kgKyByeX1gLFxuICAgIGBhJHtyeH0sJHtyeX0gMCwwLDAgJHt3aWR0aH0sMGAsXG4gICAgYGEke3J4fSwke3J5fSAwLDAsMCAkey13aWR0aH0sMGAsXG4gICAgYGwwLCR7aGVpZ2h0fWAsXG4gICAgYGEke3J4fSwke3J5fSAwLDAsMCAke3dpZHRofSwwYCxcbiAgICBgbDAsJHstaGVpZ2h0fWBcbiAgXS5qb2luKFwiIFwiKTtcbn0sIFwiY3JlYXRlQ3lsaW5kZXJQYXRoRFwiKTtcbnZhciBjcmVhdGVPdXRlckN5bGluZGVyUGF0aEQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCh4LCB5LCB3aWR0aCwgaGVpZ2h0LCByeCwgcnkpID0+IHtcbiAgcmV0dXJuIFtcbiAgICBgTSR7eH0sJHt5ICsgcnl9YCxcbiAgICBgTSR7eCArIHdpZHRofSwke3kgKyByeX1gLFxuICAgIGBhJHtyeH0sJHtyeX0gMCwwLDAgJHstd2lkdGh9LDBgLFxuICAgIGBsMCwke2hlaWdodH1gLFxuICAgIGBhJHtyeH0sJHtyeX0gMCwwLDAgJHt3aWR0aH0sMGAsXG4gICAgYGwwLCR7LWhlaWdodH1gXG4gIF0uam9pbihcIiBcIik7XG59LCBcImNyZWF0ZU91dGVyQ3lsaW5kZXJQYXRoRFwiKTtcbnZhciBjcmVhdGVJbm5lckN5bGluZGVyUGF0aEQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCh4LCB5LCB3aWR0aCwgaGVpZ2h0LCByeCwgcnkpID0+IHtcbiAgcmV0dXJuIFtgTSR7eCAtIHdpZHRoIC8gMn0sJHstaGVpZ2h0IC8gMn1gLCBgYSR7cnh9LCR7cnl9IDAsMCwwICR7d2lkdGh9LDBgXS5qb2luKFwiIFwiKTtcbn0sIFwiY3JlYXRlSW5uZXJDeWxpbmRlclBhdGhEXCIpO1xudmFyIE1JTl9IRUlHSFQgPSA4O1xudmFyIE1JTl9XSURUSCA9IDg7XG5hc3luYyBmdW5jdGlvbiBjeWxpbmRlcihwYXJlbnQsIG5vZGUpIHtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcywgbm9kZVN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IG5vZGVQYWRkaW5nID0gbm9kZS5wYWRkaW5nID8/IDA7XG4gIGNvbnN0IGxhYmVsUGFkZGluZ1ggPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyAyNCA6IG5vZGVQYWRkaW5nO1xuICBjb25zdCBsYWJlbFBhZGRpbmdZID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gMjQgOiBub2RlUGFkZGluZztcbiAgaWYgKG5vZGUud2lkdGggfHwgbm9kZS5oZWlnaHQpIHtcbiAgICBjb25zdCBvcmlnaW5hbFdpZHRoID0gbm9kZS53aWR0aCA/PyAwO1xuICAgIG5vZGUud2lkdGggPSAobm9kZS53aWR0aCA/PyAwKSAtIGxhYmVsUGFkZGluZ1k7XG4gICAgaWYgKG5vZGUud2lkdGggPCBNSU5fV0lEVEgpIHtcbiAgICAgIG5vZGUud2lkdGggPSBNSU5fV0lEVEg7XG4gICAgfVxuICAgIGNvbnN0IHJ4MiA9IG9yaWdpbmFsV2lkdGggLyAyO1xuICAgIGNvbnN0IHJ5MiA9IHJ4MiAvICgyLjUgKyBvcmlnaW5hbFdpZHRoIC8gNTApO1xuICAgIG5vZGUuaGVpZ2h0ID0gKG5vZGUuaGVpZ2h0ID8/IDApIC0gbGFiZWxQYWRkaW5nWCAtIHJ5MiAqIDM7XG4gICAgaWYgKG5vZGUuaGVpZ2h0IDwgTUlOX0hFSUdIVCkge1xuICAgICAgbm9kZS5oZWlnaHQgPSBNSU5fSEVJR0hUO1xuICAgIH1cbiAgfVxuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94LCBsYWJlbCB9ID0gYXdhaXQgbGFiZWxIZWxwZXIocGFyZW50LCBub2RlLCBnZXROb2RlQ2xhc3Nlcyhub2RlKSk7XG4gIGNvbnN0IHcgPSAobm9kZS53aWR0aCA/IG5vZGUud2lkdGggOiBiYm94LndpZHRoKSArIGxhYmVsUGFkZGluZ1k7XG4gIGNvbnN0IHJ4ID0gdyAvIDI7XG4gIGNvbnN0IHJ5ID0gcnggLyAoMi41ICsgdyAvIDUwKTtcbiAgY29uc3QgaCA9IChub2RlLmhlaWdodCA/IG5vZGUuaGVpZ2h0IDogYmJveC5oZWlnaHQpICsgbGFiZWxQYWRkaW5nWCArIHJ5O1xuICBsZXQgY3lsaW5kZXIyO1xuICBjb25zdCB7IGNzc1N0eWxlcyB9ID0gbm9kZTtcbiAgaWYgKG5vZGUubG9vayA9PT0gXCJoYW5kRHJhd25cIikge1xuICAgIGNvbnN0IHJjID0gcm91Z2gxMi5zdmcoc2hhcGVTdmcpO1xuICAgIGNvbnN0IG91dGVyUGF0aERhdGEgPSBjcmVhdGVPdXRlckN5bGluZGVyUGF0aEQoMCwgMCwgdywgaCwgcngsIHJ5KTtcbiAgICBjb25zdCBpbm5lclBhdGhEYXRhID0gY3JlYXRlSW5uZXJDeWxpbmRlclBhdGhEKDAsIHJ5LCB3LCBoLCByeCwgcnkpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gICAgY29uc3Qgb3V0ZXJOb2RlID0gcmMucGF0aChvdXRlclBhdGhEYXRhLCBvcHRpb25zKTtcbiAgICBjb25zdCBpbm5lckxpbmUgPSByYy5wYXRoKGlubmVyUGF0aERhdGEsIHVzZXJOb2RlT3ZlcnJpZGVzKG5vZGUsIHsgZmlsbDogXCJub25lXCIgfSkpO1xuICAgIGN5bGluZGVyMiA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiBpbm5lckxpbmUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICAgIGN5bGluZGVyMiA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiBvdXRlck5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICAgIGN5bGluZGVyMi5hdHRyKFwiY2xhc3NcIiwgXCJiYXNpYyBsYWJlbC1jb250YWluZXJcIik7XG4gICAgaWYgKGNzc1N0eWxlcykge1xuICAgICAgY3lsaW5kZXIyLmF0dHIoXCJzdHlsZVwiLCBjc3NTdHlsZXMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb25zdCBwYXRoRGF0YSA9IGNyZWF0ZUN5bGluZGVyUGF0aEQoMCwgMCwgdywgaCwgcngsIHJ5KTtcbiAgICBjeWxpbmRlcjIgPSBzaGFwZVN2Zy5pbnNlcnQoXCJwYXRoXCIsIFwiOmZpcnN0LWNoaWxkXCIpLmF0dHIoXCJkXCIsIHBhdGhEYXRhKS5hdHRyKFwiY2xhc3NcIiwgXCJiYXNpYyBsYWJlbC1jb250YWluZXIgb3V0ZXItcGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgaGFuZGxlVW5kZWZpbmVkQXR0cihjc3NTdHlsZXMpKS5hdHRyKFwic3R5bGVcIiwgbm9kZVN0eWxlcyk7XG4gIH1cbiAgY3lsaW5kZXIyLmF0dHIoXCJsYWJlbC1vZmZzZXQteVwiLCByeSk7XG4gIGN5bGluZGVyMi5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHstdyAvIDJ9LCAkey0oaCAvIDIgKyByeSl9KWApO1xuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIGN5bGluZGVyMik7XG4gIGxhYmVsLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICBgdHJhbnNsYXRlKCR7LShiYm94LndpZHRoIC8gMikgLSAoYmJveC54IC0gKGJib3gubGVmdCA/PyAwKSl9LCAkey0oYmJveC5oZWlnaHQgLyAyKSArIChub2RlLnBhZGRpbmcgPz8gMCkgLyAxLjUgLSAoYmJveC55IC0gKGJib3gudG9wID8/IDApKX0pYFxuICApO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgY29uc3QgcG9zID0gaW50ZXJzZWN0X2RlZmF1bHQucmVjdChub2RlLCBwb2ludCk7XG4gICAgY29uc3QgeCA9IHBvcy54IC0gKG5vZGUueCA/PyAwKTtcbiAgICBpZiAocnggIT0gMCAmJiAoTWF0aC5hYnMoeCkgPCAobm9kZS53aWR0aCA/PyAwKSAvIDIgfHwgTWF0aC5hYnMoeCkgPT0gKG5vZGUud2lkdGggPz8gMCkgLyAyICYmIE1hdGguYWJzKHBvcy55IC0gKG5vZGUueSA/PyAwKSkgPiAobm9kZS5oZWlnaHQgPz8gMCkgLyAyIC0gcnkpKSB7XG4gICAgICBsZXQgeSA9IHJ5ICogcnkgKiAoMSAtIHggKiB4IC8gKHJ4ICogcngpKTtcbiAgICAgIGlmICh5ID4gMCkge1xuICAgICAgICB5ID0gTWF0aC5zcXJ0KHkpO1xuICAgICAgfVxuICAgICAgeSA9IHJ5IC0geTtcbiAgICAgIGlmIChwb2ludC55IC0gKG5vZGUueSA/PyAwKSA+IDApIHtcbiAgICAgICAgeSA9IC15O1xuICAgICAgfVxuICAgICAgcG9zLnkgKz0geTtcbiAgICB9XG4gICAgcmV0dXJuIHBvcztcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKGN5bGluZGVyLCBcImN5bGluZGVyXCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy9kcmF3UmVjdC50c1xuaW1wb3J0IHJvdWdoMTMgZnJvbSBcInJvdWdoanNcIjtcbmFzeW5jIGZ1bmN0aW9uIGRyYXdSZWN0KHBhcmVudCwgbm9kZSwgb3B0aW9ucykge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCB9ID0gYXdhaXQgbGFiZWxIZWxwZXIocGFyZW50LCBub2RlLCBnZXROb2RlQ2xhc3Nlcyhub2RlKSk7XG4gIGNvbnN0IHRvdGFsV2lkdGggPSBNYXRoLm1heChiYm94LndpZHRoICsgb3B0aW9ucy5sYWJlbFBhZGRpbmdYICogMiwgbm9kZT8ud2lkdGggfHwgMCk7XG4gIGNvbnN0IHRvdGFsSGVpZ2h0ID0gTWF0aC5tYXgoYmJveC5oZWlnaHQgKyBvcHRpb25zLmxhYmVsUGFkZGluZ1kgKiAyLCBub2RlPy5oZWlnaHQgfHwgMCk7XG4gIGNvbnN0IHggPSAtdG90YWxXaWR0aCAvIDI7XG4gIGNvbnN0IHkgPSAtdG90YWxIZWlnaHQgLyAyO1xuICBsZXQgcmVjdDI7XG4gIGxldCB7IHJ4LCByeSB9ID0gbm9kZTtcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGlmIChvcHRpb25zPy5yeCAmJiBvcHRpb25zLnJ5KSB7XG4gICAgcnggPSBvcHRpb25zLnJ4O1xuICAgIHJ5ID0gb3B0aW9ucy5yeTtcbiAgfVxuICBpZiAobm9kZS5sb29rID09PSBcImhhbmREcmF3blwiKSB7XG4gICAgY29uc3QgcmMgPSByb3VnaDEzLnN2ZyhzaGFwZVN2Zyk7XG4gICAgY29uc3Qgb3B0aW9uczIgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gICAgY29uc3Qgcm91Z2hOb2RlID0gcnggfHwgcnkgPyByYy5wYXRoKGNyZWF0ZVJvdW5kZWRSZWN0UGF0aEQoeCwgeSwgdG90YWxXaWR0aCwgdG90YWxIZWlnaHQsIHJ4IHx8IDApLCBvcHRpb25zMikgOiByYy5yZWN0YW5nbGUoeCwgeSwgdG90YWxXaWR0aCwgdG90YWxIZWlnaHQsIG9wdGlvbnMyKTtcbiAgICByZWN0MiA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiByb3VnaE5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICAgIHJlY3QyLmF0dHIoXCJjbGFzc1wiLCBcImJhc2ljIGxhYmVsLWNvbnRhaW5lclwiKS5hdHRyKFwic3R5bGVcIiwgaGFuZGxlVW5kZWZpbmVkQXR0cihjc3NTdHlsZXMpKTtcbiAgfSBlbHNlIHtcbiAgICByZWN0MiA9IHNoYXBlU3ZnLmluc2VydChcInJlY3RcIiwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gICAgcmVjdDIuYXR0cihcImNsYXNzXCIsIFwiYmFzaWMgbGFiZWwtY29udGFpbmVyXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKS5hdHRyKFwicnhcIiwgaGFuZGxlVW5kZWZpbmVkQXR0cihyeCkpLmF0dHIoXCJyeVwiLCBoYW5kbGVVbmRlZmluZWRBdHRyKHJ5KSkuYXR0cihcInhcIiwgeCkuYXR0cihcInlcIiwgeSkuYXR0cihcIndpZHRoXCIsIHRvdGFsV2lkdGgpLmF0dHIoXCJoZWlnaHRcIiwgdG90YWxIZWlnaHQpO1xuICB9XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgcmVjdDIpO1xuICBub2RlLmNhbGNJbnRlcnNlY3QgPSBmdW5jdGlvbihib3VuZHMsIHBvaW50KSB7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnJlY3QoYm91bmRzLCBwb2ludCk7XG4gIH07XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucmVjdChub2RlLCBwb2ludCk7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZShkcmF3UmVjdCwgXCJkcmF3UmVjdFwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvZGF0YXN0b3JlLnRzXG5pbXBvcnQgcm91Z2gxNCBmcm9tIFwicm91Z2hqc1wiO1xuYXN5bmMgZnVuY3Rpb24gZGF0YXN0b3JlKHBhcmVudCwgbm9kZSkge1xuICBjb25zdCB7IGNzc0NsYXNzZXMsIGxhYmVsUGFkZGluZ1gsIGxhYmVsUGFkZGluZ1ksIHBhZGRpbmcsIHdpZHRoLCBoZWlnaHQgfSA9IG5vZGU7XG4gIGNvbnN0IHJlY3RPcHRpb25zID0ge1xuICAgIHJ4OiAwLFxuICAgIHJ5OiAwLFxuICAgIGNsYXNzZXM6IGNzc0NsYXNzZXMgPz8gXCJcIixcbiAgICBsYWJlbFBhZGRpbmdYOiBsYWJlbFBhZGRpbmdYID8/IChwYWRkaW5nID8/IDApICogMixcbiAgICBsYWJlbFBhZGRpbmdZOiBsYWJlbFBhZGRpbmdZID8/IHBhZGRpbmcgPz8gMFxuICB9O1xuICBjb25zdCByZWN0MiA9IGF3YWl0IGRyYXdSZWN0KHBhcmVudCwgbm9kZSwgcmVjdE9wdGlvbnMpO1xuICBpZiAobm9kZS5sb29rID09PSBcImhhbmREcmF3blwiKSB7XG4gICAgY29uc3QgcmMgPSByb3VnaDE0LnN2ZyhyZWN0Mik7XG4gICAgY29uc3Qgbm9kZU92ZXJyaWRlT3B0aW9ucyA9IHVzZXJOb2RlT3ZlcnJpZGVzKG5vZGUsIHt9KTtcbiAgICBjb25zdCBib3JkZXJTZWxlY3Rpb24gPSByZWN0Mi5zZWxlY3QoXCIuYmFzaWMubGFiZWwtY29udGFpbmVyID4gcGF0aDpudGgtY2hpbGQoMilcIik7XG4gICAgY29uc3QgYm9yZGVyUGF0aCA9IGJvcmRlclNlbGVjdGlvbi5ub2RlKCk7XG4gICAgaWYgKCFib3JkZXJQYXRoKSB7XG4gICAgICByZXR1cm4gcmVjdDI7XG4gICAgfVxuICAgIGxldCBiYm94ID0gbnVsbDtcbiAgICBpZiAoYm9yZGVyUGF0aCBpbnN0YW5jZW9mIFNWR0dyYXBoaWNzRWxlbWVudCkge1xuICAgICAgYmJveCA9IGJvcmRlclBhdGguZ2V0QkJveCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcmVjdDI7XG4gICAgfVxuICAgIHJlY3QyLmluc2VydChcbiAgICAgICgpID0+IHJjLmxpbmUoYmJveC54LCBiYm94LnksIGJib3gueCArIGJib3gud2lkdGgsIGJib3gueSwgbm9kZU92ZXJyaWRlT3B0aW9ucyksXG4gICAgICBcIi5iYXNpYy5sYWJlbC1jb250YWluZXIgZy5sYWJlbFwiXG4gICAgKTtcbiAgICByZWN0Mi5pbnNlcnQoXG4gICAgICAoKSA9PiByYy5saW5lKFxuICAgICAgICBiYm94LngsXG4gICAgICAgIGJib3gueSArIGJib3guaGVpZ2h0LFxuICAgICAgICBiYm94LnggKyBiYm94LndpZHRoLFxuICAgICAgICBiYm94LnkgKyBiYm94LmhlaWdodCxcbiAgICAgICAgbm9kZU92ZXJyaWRlT3B0aW9uc1xuICAgICAgKSxcbiAgICAgIFwiLmJhc2ljLmxhYmVsLWNvbnRhaW5lciBnLmxhYmVsXCJcbiAgICApO1xuICAgIGJvcmRlclNlbGVjdGlvbi5yZW1vdmUoKTtcbiAgICByZXR1cm4gcmVjdDI7XG4gIH1cbiAgY29uc3Qgc2VsZWN0aW9uID0gcmVjdDIuc2VsZWN0KFwiLmJhc2ljLmxhYmVsLWNvbnRhaW5lclwiKTtcbiAgY29uc3QgZGF0YXN0b3JlV2lkdGggPSAoTnVtYmVyKHNlbGVjdGlvbi5hdHRyKFwid2lkdGhcIikpIHx8IHdpZHRoKSA/PyAwO1xuICBjb25zdCBkYXRhc3RvcmVIZWlnaHQgPSAoTnVtYmVyKHNlbGVjdGlvbi5hdHRyKFwiaGVpZ2h0XCIpKSB8fCBoZWlnaHQpID8/IDA7XG4gIGlmIChkYXRhc3RvcmVXaWR0aCA+IDAgJiYgZGF0YXN0b3JlSGVpZ2h0ID4gMCkge1xuICAgIHNlbGVjdGlvbi5hdHRyKFwic3Ryb2tlLWRhc2hhcnJheVwiLCBgJHtkYXRhc3RvcmVXaWR0aH0gJHtkYXRhc3RvcmVIZWlnaHR9YCk7XG4gIH1cbiAgcmV0dXJuIHJlY3QyO1xufVxuX19uYW1lKGRhdGFzdG9yZSwgXCJkYXRhc3RvcmVcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL2RpdmlkZWRSZWN0LnRzXG5pbXBvcnQgcm91Z2gxNSBmcm9tIFwicm91Z2hqc1wiO1xuYXN5bmMgZnVuY3Rpb24gZGl2aWRlZFJlY3RhbmdsZShwYXJlbnQsIG5vZGUpIHtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcywgbm9kZVN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IHBhZGRpbmdYID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gMTYgOiBub2RlLnBhZGRpbmcgPz8gMDtcbiAgY29uc3QgcGFkZGluZ1kgPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyAxNiA6IG5vZGUucGFkZGluZyA/PyAwO1xuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94LCBsYWJlbCB9ID0gYXdhaXQgbGFiZWxIZWxwZXIocGFyZW50LCBub2RlLCBnZXROb2RlQ2xhc3Nlcyhub2RlKSk7XG4gIGNvbnN0IHcgPSBiYm94LndpZHRoICsgcGFkZGluZ1g7XG4gIGNvbnN0IGggPSBiYm94LmhlaWdodCArIHBhZGRpbmdZO1xuICBjb25zdCByZWN0T2Zmc2V0MiA9IGggKiAwLjI7XG4gIGNvbnN0IHggPSAtdyAvIDI7XG4gIGNvbnN0IHkgPSAtaCAvIDIgLSByZWN0T2Zmc2V0MiAvIDI7XG4gIGNvbnN0IHsgY3NzU3R5bGVzIH0gPSBub2RlO1xuICBjb25zdCByYyA9IHJvdWdoMTUuc3ZnKHNoYXBlU3ZnKTtcbiAgY29uc3Qgb3B0aW9ucyA9IHVzZXJOb2RlT3ZlcnJpZGVzKG5vZGUsIHt9KTtcbiAgaWYgKG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIG9wdGlvbnMucm91Z2huZXNzID0gMDtcbiAgICBvcHRpb25zLmZpbGxTdHlsZSA9IFwic29saWRcIjtcbiAgfVxuICBjb25zdCBwdHMgPSBbXG4gICAgeyB4LCB5OiB5ICsgcmVjdE9mZnNldDIgfSxcbiAgICB7IHg6IC14LCB5OiB5ICsgcmVjdE9mZnNldDIgfSxcbiAgICB7IHg6IC14LCB5OiAteSB9LFxuICAgIHsgeCwgeTogLXkgfSxcbiAgICB7IHgsIHkgfSxcbiAgICB7IHg6IC14LCB5IH0sXG4gICAgeyB4OiAteCwgeTogeSArIHJlY3RPZmZzZXQyIH1cbiAgXTtcbiAgY29uc3QgcG9seSA9IHJjLnBvbHlnb24oXG4gICAgcHRzLm1hcCgocCkgPT4gW3AueCwgcC55XSksXG4gICAgb3B0aW9uc1xuICApO1xuICBjb25zdCBwb2x5Z29uID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHBvbHksIFwiOmZpcnN0LWNoaWxkXCIpO1xuICBwb2x5Z29uLmF0dHIoXCJjbGFzc1wiLCBcImJhc2ljIGxhYmVsLWNvbnRhaW5lciBvdXRlci1wYXRoXCIpO1xuICBpZiAoY3NzU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIHBvbHlnb24uc2VsZWN0QWxsKFwicGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgY3NzU3R5bGVzKTtcbiAgfVxuICBpZiAobm9kZVN0eWxlcyAmJiBub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBwb2x5Z29uLnNlbGVjdEFsbChcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIG5vZGVTdHlsZXMpO1xuICB9XG4gIGxhYmVsLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICBgdHJhbnNsYXRlKCR7eCArIChub2RlLnBhZGRpbmcgPz8gMCkgLyAyIC0gKGJib3gueCAtIChiYm94LmxlZnQgPz8gMCkpfSwgJHt5ICsgcmVjdE9mZnNldDIgKyAobm9kZS5wYWRkaW5nID8/IDApIC8gMiAtIChiYm94LnkgLSAoYmJveC50b3AgPz8gMCkpfSlgXG4gICk7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgcG9seWdvbik7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICBjb25zdCBwb3MgPSBpbnRlcnNlY3RfZGVmYXVsdC5yZWN0KG5vZGUsIHBvaW50KTtcbiAgICByZXR1cm4gcG9zO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59XG5fX25hbWUoZGl2aWRlZFJlY3RhbmdsZSwgXCJkaXZpZGVkUmVjdGFuZ2xlXCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy9kb3VibGVDaXJjbGUudHNcbmltcG9ydCByb3VnaDE2IGZyb20gXCJyb3VnaGpzXCI7XG5hc3luYyBmdW5jdGlvbiBkb3VibGVjaXJjbGUocGFyZW50LCBub2RlKSB7XG4gIGNvbnN0IHsgbGFiZWxTdHlsZXMsIG5vZGVTdHlsZXMgfSA9IHN0eWxlczJTdHJpbmcobm9kZSk7XG4gIGNvbnN0IGdhcCA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IDEyIDogNTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IHBhZGRpbmcgPSBub2RlLnBhZGRpbmcgPz8gMDtcbiAgY29uc3QgbGFiZWxQYWRkaW5nID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gMTYgOiBwYWRkaW5nO1xuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94IH0gPSBhd2FpdCBsYWJlbEhlbHBlcihwYXJlbnQsIG5vZGUsIGdldE5vZGVDbGFzc2VzKG5vZGUpKTtcbiAgY29uc3Qgb3V0ZXJSYWRpdXMgPSAobm9kZT8ud2lkdGggPyBub2RlPy53aWR0aCAvIDIgOiBiYm94LndpZHRoIC8gMikgKyAobGFiZWxQYWRkaW5nID8/IDApO1xuICBjb25zdCBpbm5lclJhZGl1cyA9IG91dGVyUmFkaXVzIC0gZ2FwO1xuICBsZXQgY2lyY2xlR3JvdXA7XG4gIGNvbnN0IHsgY3NzU3R5bGVzIH0gPSBub2RlO1xuICBpZiAobm9kZS5sb29rID09PSBcImhhbmREcmF3blwiKSB7XG4gICAgY29uc3QgcmMgPSByb3VnaDE2LnN2ZyhzaGFwZVN2Zyk7XG4gICAgY29uc3Qgb3V0ZXJPcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwgeyByb3VnaG5lc3M6IDAuMiwgc3Ryb2tlV2lkdGg6IDIuNSB9KTtcbiAgICBjb25zdCBpbm5lck9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7IHJvdWdobmVzczogMC4yLCBzdHJva2VXaWR0aDogMS41IH0pO1xuICAgIGNvbnN0IG91dGVyUm91Z2hOb2RlID0gcmMuY2lyY2xlKDAsIDAsIG91dGVyUmFkaXVzICogMiwgb3V0ZXJPcHRpb25zKTtcbiAgICBjb25zdCBpbm5lclJvdWdoTm9kZSA9IHJjLmNpcmNsZSgwLCAwLCBpbm5lclJhZGl1cyAqIDIsIGlubmVyT3B0aW9ucyk7XG4gICAgY2lyY2xlR3JvdXAgPSBzaGFwZVN2Zy5pbnNlcnQoXCJnXCIsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICAgIGNpcmNsZUdyb3VwLmF0dHIoXCJjbGFzc1wiLCBoYW5kbGVVbmRlZmluZWRBdHRyKG5vZGUuY3NzQ2xhc3NlcykpLmF0dHIoXCJzdHlsZVwiLCBoYW5kbGVVbmRlZmluZWRBdHRyKGNzc1N0eWxlcykpO1xuICAgIGNpcmNsZUdyb3VwLm5vZGUoKT8uYXBwZW5kQ2hpbGQob3V0ZXJSb3VnaE5vZGUpO1xuICAgIGNpcmNsZUdyb3VwLm5vZGUoKT8uYXBwZW5kQ2hpbGQoaW5uZXJSb3VnaE5vZGUpO1xuICB9IGVsc2Uge1xuICAgIGNpcmNsZUdyb3VwID0gc2hhcGVTdmcuaW5zZXJ0KFwiZ1wiLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgICBjb25zdCBvdXRlckNpcmNsZSA9IGNpcmNsZUdyb3VwLmluc2VydChcImNpcmNsZVwiLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgICBjb25zdCBpbm5lckNpcmNsZSA9IGNpcmNsZUdyb3VwLmluc2VydChcImNpcmNsZVwiKTtcbiAgICBjaXJjbGVHcm91cC5hdHRyKFwiY2xhc3NcIiwgXCJiYXNpYyBsYWJlbC1jb250YWluZXJcIikuYXR0cihcInN0eWxlXCIsIG5vZGVTdHlsZXMpO1xuICAgIG91dGVyQ2lyY2xlLmF0dHIoXCJjbGFzc1wiLCBcIm91dGVyLWNpcmNsZVwiKS5hdHRyKFwic3R5bGVcIiwgbm9kZVN0eWxlcykuYXR0cihcInJcIiwgb3V0ZXJSYWRpdXMpLmF0dHIoXCJjeFwiLCAwKS5hdHRyKFwiY3lcIiwgMCk7XG4gICAgaW5uZXJDaXJjbGUuYXR0cihcImNsYXNzXCIsIFwiaW5uZXItY2lyY2xlXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKS5hdHRyKFwiclwiLCBpbm5lclJhZGl1cykuYXR0cihcImN4XCIsIDApLmF0dHIoXCJjeVwiLCAwKTtcbiAgfVxuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIGNpcmNsZUdyb3VwKTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIGxvZy5pbmZvKFwiRG91YmxlQ2lyY2xlIGludGVyc2VjdFwiLCBub2RlLCBvdXRlclJhZGl1cywgcG9pbnQpO1xuICAgIHJldHVybiBpbnRlcnNlY3RfZGVmYXVsdC5jaXJjbGUobm9kZSwgb3V0ZXJSYWRpdXMsIHBvaW50KTtcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKGRvdWJsZWNpcmNsZSwgXCJkb3VibGVjaXJjbGVcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL2ZpbGxlZENpcmNsZS50c1xuaW1wb3J0IHJvdWdoMTcgZnJvbSBcInJvdWdoanNcIjtcbmZ1bmN0aW9uIGZpbGxlZENpcmNsZShwYXJlbnQsIG5vZGUsIHsgY29uZmlnOiB7IHRoZW1lVmFyaWFibGVzIH0gfSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsID0gXCJcIjtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IHNoYXBlU3ZnID0gcGFyZW50Lmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIGdldE5vZGVDbGFzc2VzKG5vZGUpKS5hdHRyKFwiaWRcIiwgbm9kZS5kb21JZCA/PyBub2RlLmlkKTtcbiAgY29uc3QgcmFkaXVzID0gNztcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGNvbnN0IHJjID0gcm91Z2gxNy5zdmcoc2hhcGVTdmcpO1xuICBjb25zdCB7IG5vZGVCb3JkZXIgfSA9IHRoZW1lVmFyaWFibGVzO1xuICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwgeyBmaWxsU3R5bGU6IFwic29saWRcIiB9KTtcbiAgaWYgKG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIG9wdGlvbnMucm91Z2huZXNzID0gMDtcbiAgfVxuICBjb25zdCBjaXJjbGVOb2RlID0gcmMuY2lyY2xlKDAsIDAsIHJhZGl1cyAqIDIsIG9wdGlvbnMpO1xuICBjb25zdCBmaWxsZWRDaXJjbGUyID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IGNpcmNsZU5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICBmaWxsZWRDaXJjbGUyLnNlbGVjdEFsbChcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIGBmaWxsOiAke25vZGVCb3JkZXJ9ICFpbXBvcnRhbnQ7YCk7XG4gIGlmIChjc3NTdHlsZXMgJiYgY3NzU3R5bGVzLmxlbmd0aCA+IDAgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgZmlsbGVkQ2lyY2xlMi5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBjc3NTdHlsZXMpO1xuICB9XG4gIGlmIChub2RlU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIGZpbGxlZENpcmNsZTIuc2VsZWN0QWxsKFwicGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgbm9kZVN0eWxlcyk7XG4gIH1cbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCBmaWxsZWRDaXJjbGUyKTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIGxvZy5pbmZvKFwiZmlsbGVkQ2lyY2xlIGludGVyc2VjdFwiLCBub2RlLCB7IHJhZGl1cywgcG9pbnQgfSk7XG4gICAgY29uc3QgcG9zID0gaW50ZXJzZWN0X2RlZmF1bHQuY2lyY2xlKG5vZGUsIHJhZGl1cywgcG9pbnQpO1xuICAgIHJldHVybiBwb3M7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZShmaWxsZWRDaXJjbGUsIFwiZmlsbGVkQ2lyY2xlXCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy9mbGlwcGVkVHJpYW5nbGUudHNcbmltcG9ydCByb3VnaDE4IGZyb20gXCJyb3VnaGpzXCI7XG52YXIgTUlOX0hFSUdIVDIgPSAxMDtcbnZhciBNSU5fV0lEVEgyID0gMTA7XG5hc3luYyBmdW5jdGlvbiBmbGlwcGVkVHJpYW5nbGUocGFyZW50LCBub2RlKSB7XG4gIGNvbnN0IHsgbGFiZWxTdHlsZXMsIG5vZGVTdHlsZXMgfSA9IHN0eWxlczJTdHJpbmcobm9kZSk7XG4gIG5vZGUubGFiZWxTdHlsZSA9IGxhYmVsU3R5bGVzO1xuICBjb25zdCBub2RlUGFkZGluZyA9IG5vZGUucGFkZGluZyA/PyAwO1xuICBjb25zdCBsYWJlbFBhZGRpbmdYID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gbm9kZVBhZGRpbmcgKiAyIDogbm9kZVBhZGRpbmc7XG4gIGlmIChub2RlLndpZHRoIHx8IG5vZGUuaGVpZ2h0KSB7XG4gICAgbm9kZS5oZWlnaHQgPSBub2RlPy5oZWlnaHQgPz8gMDtcbiAgICBpZiAobm9kZS5oZWlnaHQgPCBNSU5fSEVJR0hUMikge1xuICAgICAgbm9kZS5oZWlnaHQgPSBNSU5fSEVJR0hUMjtcbiAgICB9XG4gICAgbm9kZS53aWR0aCA9IChub2RlPy53aWR0aCA/PyAwKSAtIGxhYmVsUGFkZGluZ1ggLSBsYWJlbFBhZGRpbmdYIC8gMjtcbiAgICBpZiAobm9kZS53aWR0aCA8IE1JTl9XSURUSDIpIHtcbiAgICAgIG5vZGUud2lkdGggPSBNSU5fV0lEVEgyO1xuICAgIH1cbiAgfVxuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94LCBsYWJlbCB9ID0gYXdhaXQgbGFiZWxIZWxwZXIocGFyZW50LCBub2RlLCBnZXROb2RlQ2xhc3Nlcyhub2RlKSk7XG4gIGNvbnN0IHcgPSAobm9kZT8ud2lkdGggPyBub2RlPy53aWR0aCA6IGJib3gud2lkdGgpICsgKGxhYmVsUGFkZGluZ1ggPz8gMCk7XG4gIGNvbnN0IGggPSBub2RlPy5oZWlnaHQgPyBub2RlPy5oZWlnaHQgOiB3ICsgYmJveC5oZWlnaHQ7XG4gIGNvbnN0IHR3ID0gaDtcbiAgY29uc3QgcG9pbnRzID0gW1xuICAgIHsgeDogMCwgeTogLWggfSxcbiAgICB7IHg6IHR3LCB5OiAtaCB9LFxuICAgIHsgeDogdHcgLyAyLCB5OiAwIH1cbiAgXTtcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGNvbnN0IHJjID0gcm91Z2gxOC5zdmcoc2hhcGVTdmcpO1xuICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwge30pO1xuICBpZiAobm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgb3B0aW9ucy5yb3VnaG5lc3MgPSAwO1xuICAgIG9wdGlvbnMuZmlsbFN0eWxlID0gXCJzb2xpZFwiO1xuICB9XG4gIGNvbnN0IHBhdGhEYXRhID0gY3JlYXRlUGF0aEZyb21Qb2ludHMocG9pbnRzKTtcbiAgY29uc3Qgcm91Z2hOb2RlID0gcmMucGF0aChwYXRoRGF0YSwgb3B0aW9ucyk7XG4gIGNvbnN0IGZsaXBwZWRUcmlhbmdsZTIgPSBzaGFwZVN2Zy5pbnNlcnQoKCkgPT4gcm91Z2hOb2RlLCBcIjpmaXJzdC1jaGlsZFwiKS5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHstaCAvIDJ9LCAke2ggLyAyfSlgKS5hdHRyKFwiY2xhc3NcIiwgXCJvdXRlci1wYXRoXCIpO1xuICBpZiAoY3NzU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIGZsaXBwZWRUcmlhbmdsZTIuc2VsZWN0Q2hpbGRyZW4oXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBjc3NTdHlsZXMpO1xuICB9XG4gIGlmIChub2RlU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIGZsaXBwZWRUcmlhbmdsZTIuc2VsZWN0Q2hpbGRyZW4oXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgfVxuICBub2RlLndpZHRoID0gdztcbiAgbm9kZS5oZWlnaHQgPSBoO1xuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIGZsaXBwZWRUcmlhbmdsZTIpO1xuICBsYWJlbC5hdHRyKFxuICAgIFwidHJhbnNmb3JtXCIsXG4gICAgYHRyYW5zbGF0ZSgkey1iYm94LndpZHRoIC8gMiAtIChiYm94LnggLSAoYmJveC5sZWZ0ID8/IDApKX0sICR7LWggLyAyICsgKG5vZGUucGFkZGluZyA/PyAwKSAvIDIgKyAoYmJveC55IC0gKGJib3gudG9wID8/IDApKX0pYFxuICApO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgbG9nLmluZm8oXCJUcmlhbmdsZSBpbnRlcnNlY3RcIiwgbm9kZSwgcG9pbnRzLCBwb2ludCk7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnBvbHlnb24obm9kZSwgcG9pbnRzLCBwb2ludCk7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZShmbGlwcGVkVHJpYW5nbGUsIFwiZmxpcHBlZFRyaWFuZ2xlXCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy9mb3JrSm9pbi50c1xuaW1wb3J0IHJvdWdoMTkgZnJvbSBcInJvdWdoanNcIjtcbmZ1bmN0aW9uIGZvcmtKb2luKHBhcmVudCwgbm9kZSwgeyBkaXIsIGNvbmZpZzogeyBzdGF0ZTogc3RhdGUyLCB0aGVtZVZhcmlhYmxlcyB9IH0pIHtcbiAgY29uc3QgeyBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsID0gXCJcIjtcbiAgY29uc3Qgc2hhcGVTdmcgPSBwYXJlbnQuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgZ2V0Tm9kZUNsYXNzZXMobm9kZSkpLmF0dHIoXCJpZFwiLCBub2RlLmRvbUlkID8/IG5vZGUuaWQpO1xuICBjb25zdCB7IGNzc1N0eWxlcyB9ID0gbm9kZTtcbiAgbGV0IHdpZHRoID0gTWF0aC5tYXgoNzAsIG5vZGU/LndpZHRoID8/IDApO1xuICBsZXQgaGVpZ2h0ID0gTWF0aC5tYXgoMTAsIG5vZGU/LmhlaWdodCA/PyAwKTtcbiAgaWYgKGRpciA9PT0gXCJMUlwiKSB7XG4gICAgd2lkdGggPSBNYXRoLm1heCgxMCwgbm9kZT8ud2lkdGggPz8gMCk7XG4gICAgaGVpZ2h0ID0gTWF0aC5tYXgoNzAsIG5vZGU/LmhlaWdodCA/PyAwKTtcbiAgfVxuICBjb25zdCB4ID0gLTEgKiB3aWR0aCAvIDI7XG4gIGNvbnN0IHkgPSAtMSAqIGhlaWdodCAvIDI7XG4gIGNvbnN0IHJjID0gcm91Z2gxOS5zdmcoc2hhcGVTdmcpO1xuICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwge1xuICAgIHN0cm9rZTogdGhlbWVWYXJpYWJsZXMubGluZUNvbG9yLFxuICAgIGZpbGw6IHRoZW1lVmFyaWFibGVzLmxpbmVDb2xvclxuICB9KTtcbiAgaWYgKG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIG9wdGlvbnMucm91Z2huZXNzID0gMDtcbiAgICBvcHRpb25zLmZpbGxTdHlsZSA9IFwic29saWRcIjtcbiAgfVxuICBjb25zdCByb3VnaE5vZGUgPSByYy5yZWN0YW5nbGUoeCwgeSwgd2lkdGgsIGhlaWdodCwgb3B0aW9ucyk7XG4gIGNvbnN0IHNoYXBlID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHJvdWdoTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gIGlmIChjc3NTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgc2hhcGUuc2VsZWN0QWxsKFwicGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgY3NzU3R5bGVzKTtcbiAgfVxuICBpZiAobm9kZVN0eWxlcyAmJiBub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBzaGFwZS5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgfVxuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIHNoYXBlKTtcbiAgY29uc3QgcGFkZGluZyA9IHN0YXRlMj8ucGFkZGluZyA/PyAwO1xuICBpZiAobm9kZS53aWR0aCAmJiBub2RlLmhlaWdodCkge1xuICAgIG5vZGUud2lkdGggKz0gcGFkZGluZyAvIDIgfHwgMDtcbiAgICBub2RlLmhlaWdodCArPSBwYWRkaW5nIC8gMiB8fCAwO1xuICB9XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucmVjdChub2RlLCBwb2ludCk7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZShmb3JrSm9pbiwgXCJmb3JrSm9pblwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvaGFsZlJvdW5kZWRSZWN0YW5nbGUudHNcbmltcG9ydCByb3VnaDIwIGZyb20gXCJyb3VnaGpzXCI7XG5hc3luYyBmdW5jdGlvbiBoYWxmUm91bmRlZFJlY3RhbmdsZShwYXJlbnQsIG5vZGUpIHtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcywgbm9kZVN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IG1pbldpZHRoID0gMTUsIG1pbkhlaWdodCA9IDEwO1xuICBjb25zdCBwYWRkaW5nWCA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IDE2IDogbm9kZS5wYWRkaW5nID8/IDA7XG4gIGNvbnN0IHBhZGRpbmdZID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gMTIgOiBub2RlLnBhZGRpbmcgPz8gMDtcbiAgaWYgKG5vZGUud2lkdGggfHwgbm9kZS5oZWlnaHQpIHtcbiAgICBub2RlLmhlaWdodCA9IChub2RlPy5oZWlnaHQgPz8gMCkgLSBwYWRkaW5nWSAqIDI7XG4gICAgaWYgKG5vZGUuaGVpZ2h0IDwgbWluSGVpZ2h0KSB7XG4gICAgICBub2RlLmhlaWdodCA9IG1pbkhlaWdodDtcbiAgICB9XG4gICAgbm9kZS53aWR0aCA9IChub2RlPy53aWR0aCA/PyAwKSAtIHBhZGRpbmdYICogMjtcbiAgICBpZiAobm9kZS53aWR0aCA8IG1pbldpZHRoKSB7XG4gICAgICBub2RlLndpZHRoID0gbWluV2lkdGg7XG4gICAgfVxuICB9XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3ggfSA9IGF3YWl0IGxhYmVsSGVscGVyKHBhcmVudCwgbm9kZSwgZ2V0Tm9kZUNsYXNzZXMobm9kZSkpO1xuICBjb25zdCB3ID0gKG5vZGU/LndpZHRoID8gbm9kZT8ud2lkdGggOiBNYXRoLm1heChtaW5XaWR0aCwgYmJveC53aWR0aCkpICsgcGFkZGluZ1ggKiAyO1xuICBjb25zdCBoID0gKG5vZGU/LmhlaWdodCA/IG5vZGU/LmhlaWdodCA6IE1hdGgubWF4KG1pbkhlaWdodCwgYmJveC5oZWlnaHQpKSArIHBhZGRpbmdZICogMjtcbiAgY29uc3QgcmFkaXVzID0gaCAvIDI7XG4gIGNvbnN0IHsgY3NzU3R5bGVzIH0gPSBub2RlO1xuICBjb25zdCByYyA9IHJvdWdoMjAuc3ZnKHNoYXBlU3ZnKTtcbiAgY29uc3Qgb3B0aW9ucyA9IHVzZXJOb2RlT3ZlcnJpZGVzKG5vZGUsIHt9KTtcbiAgaWYgKG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIG9wdGlvbnMucm91Z2huZXNzID0gMDtcbiAgICBvcHRpb25zLmZpbGxTdHlsZSA9IFwic29saWRcIjtcbiAgfVxuICBjb25zdCBwb2ludHMgPSBbXG4gICAgeyB4OiAtdyAvIDIsIHk6IC1oIC8gMiB9LFxuICAgIHsgeDogdyAvIDIgLSByYWRpdXMsIHk6IC1oIC8gMiB9LFxuICAgIC4uLmdlbmVyYXRlQ2lyY2xlUG9pbnRzKC13IC8gMiArIHJhZGl1cywgMCwgcmFkaXVzLCA1MCwgOTAsIDI3MCksXG4gICAgeyB4OiB3IC8gMiAtIHJhZGl1cywgeTogaCAvIDIgfSxcbiAgICB7IHg6IC13IC8gMiwgeTogaCAvIDIgfVxuICBdO1xuICBjb25zdCBwYXRoRGF0YSA9IGNyZWF0ZVBhdGhGcm9tUG9pbnRzKHBvaW50cyk7XG4gIGNvbnN0IHNoYXBlTm9kZSA9IHJjLnBhdGgocGF0aERhdGEsIG9wdGlvbnMpO1xuICBjb25zdCBwb2x5Z29uID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHNoYXBlTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gIHBvbHlnb24uYXR0cihcImNsYXNzXCIsIFwiYmFzaWMgbGFiZWwtY29udGFpbmVyIG91dGVyLXBhdGhcIik7XG4gIGlmIChjc3NTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgcG9seWdvbi5zZWxlY3RDaGlsZHJlbihcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIGNzc1N0eWxlcyk7XG4gIH1cbiAgaWYgKG5vZGVTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgcG9seWdvbi5zZWxlY3RDaGlsZHJlbihcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIG5vZGVTdHlsZXMpO1xuICB9XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgcG9seWdvbik7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICBsb2cuaW5mbyhcIlBpbGwgaW50ZXJzZWN0XCIsIG5vZGUsIHsgcmFkaXVzLCBwb2ludCB9KTtcbiAgICBjb25zdCBwb3MgPSBpbnRlcnNlY3RfZGVmYXVsdC5wb2x5Z29uKG5vZGUsIHBvaW50cywgcG9pbnQpO1xuICAgIHJldHVybiBwb3M7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZShoYWxmUm91bmRlZFJlY3RhbmdsZSwgXCJoYWxmUm91bmRlZFJlY3RhbmdsZVwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvaGV4YWdvbi50c1xuaW1wb3J0IHJvdWdoMjEgZnJvbSBcInJvdWdoanNcIjtcbnZhciBjcmVhdGVIZXhhZ29uUGF0aEQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCh4LCB5LCB3aWR0aCwgaGVpZ2h0LCBtKSA9PiB7XG4gIHJldHVybiBbXG4gICAgYE0ke3ggKyBtfSwke3l9YCxcbiAgICBgTCR7eCArIHdpZHRoIC0gbX0sJHt5fWAsXG4gICAgYEwke3ggKyB3aWR0aH0sJHt5IC0gaGVpZ2h0IC8gMn1gLFxuICAgIGBMJHt4ICsgd2lkdGggLSBtfSwke3kgLSBoZWlnaHR9YCxcbiAgICBgTCR7eCArIG19LCR7eSAtIGhlaWdodH1gLFxuICAgIGBMJHt4fSwke3kgLSBoZWlnaHQgLyAyfWAsXG4gICAgXCJaXCJcbiAgXS5qb2luKFwiIFwiKTtcbn0sIFwiY3JlYXRlSGV4YWdvblBhdGhEXCIpO1xuYXN5bmMgZnVuY3Rpb24gaGV4YWdvbihwYXJlbnQsIG5vZGUpIHtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcywgbm9kZVN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgY29uc3QgZiA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IDMuNSA6IDQ7XG4gIG5vZGUubGFiZWxTdHlsZSA9IGxhYmVsU3R5bGVzO1xuICBjb25zdCBub2RlUGFkZGluZyA9IG5vZGUucGFkZGluZyA/PyAwO1xuICBjb25zdCB3YSA9IDcwO1xuICBjb25zdCBoYSA9IDMyO1xuICBjb25zdCBsYWJlbFBhZGRpbmdYID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gd2EgOiBub2RlUGFkZGluZztcbiAgY29uc3QgbGFiZWxQYWRkaW5nWSA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IGhhIDogbm9kZVBhZGRpbmc7XG4gIGlmIChub2RlLndpZHRoIHx8IG5vZGUuaGVpZ2h0KSB7XG4gICAgY29uc3Qgb3JpZ2luYWxIZWlnaHQgPSBub2RlLmhlaWdodCA/PyAwO1xuICAgIGNvbnN0IG0yID0gb3JpZ2luYWxIZWlnaHQgLyBmO1xuICAgIG5vZGUud2lkdGggPSAobm9kZT8ud2lkdGggPz8gMCkgLSAyICogbTIgLSBsYWJlbFBhZGRpbmdZO1xuICAgIG5vZGUuaGVpZ2h0ID0gKG5vZGUuaGVpZ2h0ID8/IDApIC0gbGFiZWxQYWRkaW5nWDtcbiAgfVxuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94IH0gPSBhd2FpdCBsYWJlbEhlbHBlcihwYXJlbnQsIG5vZGUsIGdldE5vZGVDbGFzc2VzKG5vZGUpKTtcbiAgY29uc3QgaCA9IChub2RlPy5oZWlnaHQgPyBub2RlPy5oZWlnaHQgOiBiYm94LmhlaWdodCkgKyBsYWJlbFBhZGRpbmdYO1xuICBjb25zdCBtID0gaCAvIGY7XG4gIGNvbnN0IHcgPSAobm9kZT8ud2lkdGggPyBub2RlPy53aWR0aCA6IGJib3gud2lkdGgpICsgMiAqIG0gKyBsYWJlbFBhZGRpbmdZO1xuICBjb25zdCBwb2ludHMgPSBbXG4gICAgeyB4OiBtLCB5OiAwIH0sXG4gICAgeyB4OiB3IC0gbSwgeTogMCB9LFxuICAgIHsgeDogdywgeTogLWggLyAyIH0sXG4gICAgeyB4OiB3IC0gbSwgeTogLWggfSxcbiAgICB7IHg6IG0sIHk6IC1oIH0sXG4gICAgeyB4OiAwLCB5OiAtaCAvIDIgfVxuICBdO1xuICBsZXQgcG9seWdvbjtcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGlmIChub2RlLmxvb2sgPT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBjb25zdCByYyA9IHJvdWdoMjEuc3ZnKHNoYXBlU3ZnKTtcbiAgICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwge30pO1xuICAgIGNvbnN0IHBhdGhEYXRhID0gY3JlYXRlSGV4YWdvblBhdGhEKDAsIDAsIHcsIGgsIG0pO1xuICAgIGNvbnN0IHJvdWdoTm9kZSA9IHJjLnBhdGgocGF0aERhdGEsIG9wdGlvbnMpO1xuICAgIHBvbHlnb24gPSBzaGFwZVN2Zy5pbnNlcnQoKCkgPT4gcm91Z2hOb2RlLCBcIjpmaXJzdC1jaGlsZFwiKS5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHstdyAvIDJ9LCAke2ggLyAyfSlgKTtcbiAgICBpZiAoY3NzU3R5bGVzKSB7XG4gICAgICBwb2x5Z29uLmF0dHIoXCJzdHlsZVwiLCBjc3NTdHlsZXMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBwb2x5Z29uID0gaW5zZXJ0UG9seWdvblNoYXBlKHNoYXBlU3ZnLCB3LCBoLCBwb2ludHMpO1xuICB9XG4gIGlmIChub2RlU3R5bGVzKSB7XG4gICAgcG9seWdvbi5hdHRyKFwic3R5bGVcIiwgbm9kZVN0eWxlcyk7XG4gIH1cbiAgbm9kZS53aWR0aCA9IHc7XG4gIG5vZGUuaGVpZ2h0ID0gaDtcbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCBwb2x5Z29uKTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiBpbnRlcnNlY3RfZGVmYXVsdC5wb2x5Z29uKG5vZGUsIHBvaW50cywgcG9pbnQpO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59XG5fX25hbWUoaGV4YWdvbiwgXCJoZXhhZ29uXCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy9ob3VyZ2xhc3MudHNcbmltcG9ydCByb3VnaDIyIGZyb20gXCJyb3VnaGpzXCI7XG5hc3luYyBmdW5jdGlvbiBob3VyZ2xhc3MocGFyZW50LCBub2RlKSB7XG4gIGNvbnN0IHsgbGFiZWxTdHlsZXMsIG5vZGVTdHlsZXMgfSA9IHN0eWxlczJTdHJpbmcobm9kZSk7XG4gIG5vZGUubGFiZWwgPSBcIlwiO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3QgeyBzaGFwZVN2ZyB9ID0gYXdhaXQgbGFiZWxIZWxwZXIocGFyZW50LCBub2RlLCBnZXROb2RlQ2xhc3Nlcyhub2RlKSk7XG4gIGNvbnN0IHcgPSBNYXRoLm1heCgzMCwgbm9kZT8ud2lkdGggPz8gMCk7XG4gIGNvbnN0IGggPSBNYXRoLm1heCgzMCwgbm9kZT8uaGVpZ2h0ID8/IDApO1xuICBjb25zdCB7IGNzc1N0eWxlcyB9ID0gbm9kZTtcbiAgY29uc3QgcmMgPSByb3VnaDIyLnN2ZyhzaGFwZVN2Zyk7XG4gIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gIGlmIChub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBvcHRpb25zLnJvdWdobmVzcyA9IDA7XG4gICAgb3B0aW9ucy5maWxsU3R5bGUgPSBcInNvbGlkXCI7XG4gIH1cbiAgY29uc3QgcG9pbnRzID0gW1xuICAgIHsgeDogMCwgeTogMCB9LFxuICAgIHsgeDogdywgeTogMCB9LFxuICAgIHsgeDogMCwgeTogaCB9LFxuICAgIHsgeDogdywgeTogaCB9XG4gIF07XG4gIGNvbnN0IHBhdGhEYXRhID0gY3JlYXRlUGF0aEZyb21Qb2ludHMocG9pbnRzKTtcbiAgY29uc3Qgc2hhcGVOb2RlID0gcmMucGF0aChwYXRoRGF0YSwgb3B0aW9ucyk7XG4gIGNvbnN0IHBvbHlnb24gPSBzaGFwZVN2Zy5pbnNlcnQoKCkgPT4gc2hhcGVOb2RlLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgcG9seWdvbi5hdHRyKFwiY2xhc3NcIiwgXCJiYXNpYyBsYWJlbC1jb250YWluZXIgb3V0ZXItcGF0aFwiKTtcbiAgaWYgKGNzc1N0eWxlcyAmJiBub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBwb2x5Z29uLnNlbGVjdENoaWxkcmVuKFwicGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgY3NzU3R5bGVzKTtcbiAgfVxuICBpZiAobm9kZVN0eWxlcyAmJiBub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBwb2x5Z29uLnNlbGVjdENoaWxkcmVuKFwicGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgbm9kZVN0eWxlcyk7XG4gIH1cbiAgcG9seWdvbi5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHstdyAvIDJ9LCAkey1oIC8gMn0pYCk7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgcG9seWdvbik7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICBsb2cuaW5mbyhcIlBpbGwgaW50ZXJzZWN0XCIsIG5vZGUsIHsgcG9pbnRzIH0pO1xuICAgIGNvbnN0IHBvcyA9IGludGVyc2VjdF9kZWZhdWx0LnBvbHlnb24obm9kZSwgcG9pbnRzLCBwb2ludCk7XG4gICAgcmV0dXJuIHBvcztcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKGhvdXJnbGFzcywgXCJob3VyZ2xhc3NcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL2ljb24udHNcbmltcG9ydCByb3VnaDIzIGZyb20gXCJyb3VnaGpzXCI7XG5hc3luYyBmdW5jdGlvbiBpY29uKHBhcmVudCwgbm9kZSwgeyBjb25maWc6IHsgdGhlbWVWYXJpYWJsZXMsIGZsb3djaGFydCB9IH0pIHtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IGFzc2V0SGVpZ2h0ID0gbm9kZS5hc3NldEhlaWdodCA/PyA0ODtcbiAgY29uc3QgYXNzZXRXaWR0aCA9IG5vZGUuYXNzZXRXaWR0aCA/PyA0ODtcbiAgY29uc3QgaWNvblNpemUgPSBNYXRoLm1heChhc3NldEhlaWdodCwgYXNzZXRXaWR0aCk7XG4gIGNvbnN0IGRlZmF1bHRXaWR0aCA9IGZsb3djaGFydD8ud3JhcHBpbmdXaWR0aDtcbiAgbm9kZS53aWR0aCA9IE1hdGgubWF4KGljb25TaXplLCBkZWZhdWx0V2lkdGggPz8gMCk7XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3gsIGxhYmVsIH0gPSBhd2FpdCBsYWJlbEhlbHBlcihwYXJlbnQsIG5vZGUsIFwiaWNvbi1zaGFwZSBkZWZhdWx0XCIpO1xuICBjb25zdCB0b3BMYWJlbCA9IG5vZGUucG9zID09PSBcInRcIjtcbiAgY29uc3QgaGVpZ2h0ID0gaWNvblNpemU7XG4gIGNvbnN0IHdpZHRoID0gaWNvblNpemU7XG4gIGNvbnN0IHsgbm9kZUJvcmRlciB9ID0gdGhlbWVWYXJpYWJsZXM7XG4gIGNvbnN0IHsgc3R5bGVzTWFwIH0gPSBjb21waWxlU3R5bGVzKG5vZGUpO1xuICBjb25zdCB4ID0gLXdpZHRoIC8gMjtcbiAgY29uc3QgeSA9IC1oZWlnaHQgLyAyO1xuICBjb25zdCBsYWJlbFBhZGRpbmcgPSBub2RlLmxhYmVsID8gOCA6IDA7XG4gIGNvbnN0IHJjID0gcm91Z2gyMy5zdmcoc2hhcGVTdmcpO1xuICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwgeyBzdHJva2U6IFwibm9uZVwiLCBmaWxsOiBcIm5vbmVcIiB9KTtcbiAgaWYgKG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIG9wdGlvbnMucm91Z2huZXNzID0gMDtcbiAgICBvcHRpb25zLmZpbGxTdHlsZSA9IFwic29saWRcIjtcbiAgfVxuICBjb25zdCBpY29uTm9kZSA9IHJjLnJlY3RhbmdsZSh4LCB5LCB3aWR0aCwgaGVpZ2h0LCBvcHRpb25zKTtcbiAgY29uc3Qgb3V0ZXJXaWR0aCA9IE1hdGgubWF4KHdpZHRoLCBiYm94LndpZHRoKTtcbiAgY29uc3Qgb3V0ZXJIZWlnaHQgPSBoZWlnaHQgKyBiYm94LmhlaWdodCArIGxhYmVsUGFkZGluZztcbiAgY29uc3Qgb3V0ZXJOb2RlID0gcmMucmVjdGFuZ2xlKC1vdXRlcldpZHRoIC8gMiwgLW91dGVySGVpZ2h0IC8gMiwgb3V0ZXJXaWR0aCwgb3V0ZXJIZWlnaHQsIHtcbiAgICAuLi5vcHRpb25zLFxuICAgIGZpbGw6IFwidHJhbnNwYXJlbnRcIixcbiAgICBzdHJva2U6IFwibm9uZVwiXG4gIH0pO1xuICBjb25zdCBpY29uU2hhcGUgPSBzaGFwZVN2Zy5pbnNlcnQoKCkgPT4gaWNvbk5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICBjb25zdCBvdXRlclNoYXBlID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IG91dGVyTm9kZSk7XG4gIGlmIChub2RlLmljb24pIHtcbiAgICBjb25zdCBpY29uRWxlbSA9IHNoYXBlU3ZnLmFwcGVuZChcImdcIik7XG4gICAgaWNvbkVsZW0uaHRtbChcbiAgICAgIGA8Zz4ke2F3YWl0IGdldEljb25TVkcobm9kZS5pY29uLCB7XG4gICAgICAgIGhlaWdodDogaWNvblNpemUsXG4gICAgICAgIHdpZHRoOiBpY29uU2l6ZSxcbiAgICAgICAgZmFsbGJhY2tQcmVmaXg6IFwiXCJcbiAgICAgIH0pfTwvZz5gXG4gICAgKTtcbiAgICBjb25zdCBpY29uQkJveCA9IGljb25FbGVtLm5vZGUoKS5nZXRCQm94KCk7XG4gICAgY29uc3QgaWNvbldpZHRoID0gaWNvbkJCb3gud2lkdGg7XG4gICAgY29uc3QgaWNvbkhlaWdodCA9IGljb25CQm94LmhlaWdodDtcbiAgICBjb25zdCBpY29uWCA9IGljb25CQm94Lng7XG4gICAgY29uc3QgaWNvblkgPSBpY29uQkJveC55O1xuICAgIGljb25FbGVtLmF0dHIoXG4gICAgICBcInRyYW5zZm9ybVwiLFxuICAgICAgYHRyYW5zbGF0ZSgkey1pY29uV2lkdGggLyAyIC0gaWNvblh9LCR7dG9wTGFiZWwgPyBiYm94LmhlaWdodCAvIDIgKyBsYWJlbFBhZGRpbmcgLyAyIC0gaWNvbkhlaWdodCAvIDIgLSBpY29uWSA6IC1iYm94LmhlaWdodCAvIDIgLSBsYWJlbFBhZGRpbmcgLyAyIC0gaWNvbkhlaWdodCAvIDIgLSBpY29uWX0pYFxuICAgICk7XG4gICAgaWNvbkVsZW0uYXR0cihcInN0eWxlXCIsIGBjb2xvcjogJHtzdHlsZXNNYXAuZ2V0KFwic3Ryb2tlXCIpID8/IG5vZGVCb3JkZXJ9O2ApO1xuICB9XG4gIGxhYmVsLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICBgdHJhbnNsYXRlKCR7LWJib3gud2lkdGggLyAyIC0gKGJib3gueCAtIChiYm94LmxlZnQgPz8gMCkpfSwke3RvcExhYmVsID8gLW91dGVySGVpZ2h0IC8gMiA6IG91dGVySGVpZ2h0IC8gMiAtIGJib3guaGVpZ2h0fSlgXG4gICk7XG4gIGljb25TaGFwZS5hdHRyKFxuICAgIFwidHJhbnNmb3JtXCIsXG4gICAgYHRyYW5zbGF0ZSgkezB9LCR7dG9wTGFiZWwgPyBiYm94LmhlaWdodCAvIDIgKyBsYWJlbFBhZGRpbmcgLyAyIDogLWJib3guaGVpZ2h0IC8gMiAtIGxhYmVsUGFkZGluZyAvIDJ9KWBcbiAgKTtcbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCBvdXRlclNoYXBlKTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIGxvZy5pbmZvKFwiaWNvblNxdWFyZSBpbnRlcnNlY3RcIiwgbm9kZSwgcG9pbnQpO1xuICAgIGlmICghbm9kZS5sYWJlbCkge1xuICAgICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnJlY3Qobm9kZSwgcG9pbnQpO1xuICAgIH1cbiAgICBjb25zdCBkeCA9IG5vZGUueCA/PyAwO1xuICAgIGNvbnN0IGR5ID0gbm9kZS55ID8/IDA7XG4gICAgY29uc3Qgbm9kZUhlaWdodCA9IG5vZGUuaGVpZ2h0ID8/IDA7XG4gICAgbGV0IHBvaW50cyA9IFtdO1xuICAgIGlmICh0b3BMYWJlbCkge1xuICAgICAgcG9pbnRzID0gW1xuICAgICAgICB7IHg6IGR4IC0gYmJveC53aWR0aCAvIDIsIHk6IGR5IC0gbm9kZUhlaWdodCAvIDIgfSxcbiAgICAgICAgeyB4OiBkeCArIGJib3gud2lkdGggLyAyLCB5OiBkeSAtIG5vZGVIZWlnaHQgLyAyIH0sXG4gICAgICAgIHsgeDogZHggKyBiYm94LndpZHRoIC8gMiwgeTogZHkgLSBub2RlSGVpZ2h0IC8gMiArIGJib3guaGVpZ2h0ICsgbGFiZWxQYWRkaW5nIH0sXG4gICAgICAgIHsgeDogZHggKyB3aWR0aCAvIDIsIHk6IGR5IC0gbm9kZUhlaWdodCAvIDIgKyBiYm94LmhlaWdodCArIGxhYmVsUGFkZGluZyB9LFxuICAgICAgICB7IHg6IGR4ICsgd2lkdGggLyAyLCB5OiBkeSArIG5vZGVIZWlnaHQgLyAyIH0sXG4gICAgICAgIHsgeDogZHggLSB3aWR0aCAvIDIsIHk6IGR5ICsgbm9kZUhlaWdodCAvIDIgfSxcbiAgICAgICAgeyB4OiBkeCAtIHdpZHRoIC8gMiwgeTogZHkgLSBub2RlSGVpZ2h0IC8gMiArIGJib3guaGVpZ2h0ICsgbGFiZWxQYWRkaW5nIH0sXG4gICAgICAgIHsgeDogZHggLSBiYm94LndpZHRoIC8gMiwgeTogZHkgLSBub2RlSGVpZ2h0IC8gMiArIGJib3guaGVpZ2h0ICsgbGFiZWxQYWRkaW5nIH1cbiAgICAgIF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvaW50cyA9IFtcbiAgICAgICAgeyB4OiBkeCAtIHdpZHRoIC8gMiwgeTogZHkgLSBub2RlSGVpZ2h0IC8gMiB9LFxuICAgICAgICB7IHg6IGR4ICsgd2lkdGggLyAyLCB5OiBkeSAtIG5vZGVIZWlnaHQgLyAyIH0sXG4gICAgICAgIHsgeDogZHggKyB3aWR0aCAvIDIsIHk6IGR5IC0gbm9kZUhlaWdodCAvIDIgKyBoZWlnaHQgfSxcbiAgICAgICAgeyB4OiBkeCArIGJib3gud2lkdGggLyAyLCB5OiBkeSAtIG5vZGVIZWlnaHQgLyAyICsgaGVpZ2h0IH0sXG4gICAgICAgIHsgeDogZHggKyBiYm94LndpZHRoIC8gMiAvIDIsIHk6IGR5ICsgbm9kZUhlaWdodCAvIDIgfSxcbiAgICAgICAgeyB4OiBkeCAtIGJib3gud2lkdGggLyAyLCB5OiBkeSArIG5vZGVIZWlnaHQgLyAyIH0sXG4gICAgICAgIHsgeDogZHggLSBiYm94LndpZHRoIC8gMiwgeTogZHkgLSBub2RlSGVpZ2h0IC8gMiArIGhlaWdodCB9LFxuICAgICAgICB7IHg6IGR4IC0gd2lkdGggLyAyLCB5OiBkeSAtIG5vZGVIZWlnaHQgLyAyICsgaGVpZ2h0IH1cbiAgICAgIF07XG4gICAgfVxuICAgIGNvbnN0IHBvcyA9IGludGVyc2VjdF9kZWZhdWx0LnBvbHlnb24obm9kZSwgcG9pbnRzLCBwb2ludCk7XG4gICAgcmV0dXJuIHBvcztcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKGljb24sIFwiaWNvblwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvaWNvbkNpcmNsZS50c1xuaW1wb3J0IHJvdWdoMjQgZnJvbSBcInJvdWdoanNcIjtcbmFzeW5jIGZ1bmN0aW9uIGljb25DaXJjbGUocGFyZW50LCBub2RlLCB7IGNvbmZpZzogeyB0aGVtZVZhcmlhYmxlcywgZmxvd2NoYXJ0IH0gfSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3QgYXNzZXRIZWlnaHQgPSBub2RlLmFzc2V0SGVpZ2h0ID8/IDQ4O1xuICBjb25zdCBhc3NldFdpZHRoID0gbm9kZS5hc3NldFdpZHRoID8/IDQ4O1xuICBjb25zdCBpY29uU2l6ZSA9IE1hdGgubWF4KGFzc2V0SGVpZ2h0LCBhc3NldFdpZHRoKTtcbiAgY29uc3QgZGVmYXVsdFdpZHRoID0gZmxvd2NoYXJ0Py53cmFwcGluZ1dpZHRoO1xuICBub2RlLndpZHRoID0gTWF0aC5tYXgoaWNvblNpemUsIGRlZmF1bHRXaWR0aCA/PyAwKTtcbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCwgbGFiZWwgfSA9IGF3YWl0IGxhYmVsSGVscGVyKHBhcmVudCwgbm9kZSwgXCJpY29uLXNoYXBlIGRlZmF1bHRcIik7XG4gIGNvbnN0IHBhZGRpbmcgPSAyMDtcbiAgY29uc3QgbGFiZWxQYWRkaW5nID0gbm9kZS5sYWJlbCA/IDggOiAwO1xuICBjb25zdCB0b3BMYWJlbCA9IG5vZGUucG9zID09PSBcInRcIjtcbiAgY29uc3QgeyBub2RlQm9yZGVyLCBtYWluQmtnIH0gPSB0aGVtZVZhcmlhYmxlcztcbiAgY29uc3QgeyBzdHlsZXNNYXAgfSA9IGNvbXBpbGVTdHlsZXMobm9kZSk7XG4gIGNvbnN0IHJjID0gcm91Z2gyNC5zdmcoc2hhcGVTdmcpO1xuICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwge30pO1xuICBpZiAobm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgb3B0aW9ucy5yb3VnaG5lc3MgPSAwO1xuICAgIG9wdGlvbnMuZmlsbFN0eWxlID0gXCJzb2xpZFwiO1xuICB9XG4gIGNvbnN0IGZpbGwgPSBzdHlsZXNNYXAuZ2V0KFwiZmlsbFwiKTtcbiAgb3B0aW9ucy5zdHJva2UgPSBmaWxsID8/IG1haW5Ca2c7XG4gIGNvbnN0IGljb25FbGVtID0gc2hhcGVTdmcuYXBwZW5kKFwiZ1wiKTtcbiAgaWYgKG5vZGUuaWNvbikge1xuICAgIGljb25FbGVtLmh0bWwoXG4gICAgICBgPGc+JHthd2FpdCBnZXRJY29uU1ZHKG5vZGUuaWNvbiwge1xuICAgICAgICBoZWlnaHQ6IGljb25TaXplLFxuICAgICAgICB3aWR0aDogaWNvblNpemUsXG4gICAgICAgIGZhbGxiYWNrUHJlZml4OiBcIlwiXG4gICAgICB9KX08L2c+YFxuICAgICk7XG4gIH1cbiAgY29uc3QgaWNvbkJCb3ggPSBpY29uRWxlbS5ub2RlKCkuZ2V0QkJveCgpO1xuICBjb25zdCBpY29uV2lkdGggPSBpY29uQkJveC53aWR0aDtcbiAgY29uc3QgaWNvbkhlaWdodCA9IGljb25CQm94LmhlaWdodDtcbiAgY29uc3QgaWNvblggPSBpY29uQkJveC54O1xuICBjb25zdCBpY29uWSA9IGljb25CQm94Lnk7XG4gIGNvbnN0IGRpYW1ldGVyID0gTWF0aC5tYXgoaWNvbldpZHRoLCBpY29uSGVpZ2h0KSAqIE1hdGguU1FSVDIgKyBwYWRkaW5nICogMjtcbiAgY29uc3QgaWNvbk5vZGUgPSByYy5jaXJjbGUoMCwgMCwgZGlhbWV0ZXIsIG9wdGlvbnMpO1xuICBjb25zdCBvdXRlcldpZHRoID0gTWF0aC5tYXgoZGlhbWV0ZXIsIGJib3gud2lkdGgpO1xuICBjb25zdCBvdXRlckhlaWdodCA9IGRpYW1ldGVyICsgYmJveC5oZWlnaHQgKyBsYWJlbFBhZGRpbmc7XG4gIGNvbnN0IG91dGVyTm9kZSA9IHJjLnJlY3RhbmdsZSgtb3V0ZXJXaWR0aCAvIDIsIC1vdXRlckhlaWdodCAvIDIsIG91dGVyV2lkdGgsIG91dGVySGVpZ2h0LCB7XG4gICAgLi4ub3B0aW9ucyxcbiAgICBmaWxsOiBcInRyYW5zcGFyZW50XCIsXG4gICAgc3Ryb2tlOiBcIm5vbmVcIlxuICB9KTtcbiAgY29uc3QgaWNvblNoYXBlID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IGljb25Ob2RlLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgY29uc3Qgb3V0ZXJTaGFwZSA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiBvdXRlck5vZGUpO1xuICBpY29uRWxlbS5hdHRyKFxuICAgIFwidHJhbnNmb3JtXCIsXG4gICAgYHRyYW5zbGF0ZSgkey1pY29uV2lkdGggLyAyIC0gaWNvblh9LCR7dG9wTGFiZWwgPyBiYm94LmhlaWdodCAvIDIgKyBsYWJlbFBhZGRpbmcgLyAyIC0gaWNvbkhlaWdodCAvIDIgLSBpY29uWSA6IC1iYm94LmhlaWdodCAvIDIgLSBsYWJlbFBhZGRpbmcgLyAyIC0gaWNvbkhlaWdodCAvIDIgLSBpY29uWX0pYFxuICApO1xuICBpY29uRWxlbS5hdHRyKFwic3R5bGVcIiwgYGNvbG9yOiAke3N0eWxlc01hcC5nZXQoXCJzdHJva2VcIikgPz8gbm9kZUJvcmRlcn07YCk7XG4gIGxhYmVsLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICBgdHJhbnNsYXRlKCR7LWJib3gud2lkdGggLyAyIC0gKGJib3gueCAtIChiYm94LmxlZnQgPz8gMCkpfSwke3RvcExhYmVsID8gLW91dGVySGVpZ2h0IC8gMiA6IG91dGVySGVpZ2h0IC8gMiAtIGJib3guaGVpZ2h0fSlgXG4gICk7XG4gIGljb25TaGFwZS5hdHRyKFxuICAgIFwidHJhbnNmb3JtXCIsXG4gICAgYHRyYW5zbGF0ZSgkezB9LCR7dG9wTGFiZWwgPyBiYm94LmhlaWdodCAvIDIgKyBsYWJlbFBhZGRpbmcgLyAyIDogLWJib3guaGVpZ2h0IC8gMiAtIGxhYmVsUGFkZGluZyAvIDJ9KWBcbiAgKTtcbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCBvdXRlclNoYXBlKTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIGxvZy5pbmZvKFwiaWNvblNxdWFyZSBpbnRlcnNlY3RcIiwgbm9kZSwgcG9pbnQpO1xuICAgIGNvbnN0IHBvcyA9IGludGVyc2VjdF9kZWZhdWx0LnJlY3Qobm9kZSwgcG9pbnQpO1xuICAgIHJldHVybiBwb3M7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZShpY29uQ2lyY2xlLCBcImljb25DaXJjbGVcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL2ljb25Sb3VuZGVkLnRzXG5pbXBvcnQgcm91Z2gyNSBmcm9tIFwicm91Z2hqc1wiO1xuYXN5bmMgZnVuY3Rpb24gaWNvblJvdW5kZWQocGFyZW50LCBub2RlLCB7IGNvbmZpZzogeyB0aGVtZVZhcmlhYmxlcywgZmxvd2NoYXJ0IH0gfSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3QgYXNzZXRIZWlnaHQgPSBub2RlLmFzc2V0SGVpZ2h0ID8/IDQ4O1xuICBjb25zdCBhc3NldFdpZHRoID0gbm9kZS5hc3NldFdpZHRoID8/IDQ4O1xuICBjb25zdCBpY29uU2l6ZSA9IE1hdGgubWF4KGFzc2V0SGVpZ2h0LCBhc3NldFdpZHRoKTtcbiAgY29uc3QgZGVmYXVsdFdpZHRoID0gZmxvd2NoYXJ0Py53cmFwcGluZ1dpZHRoO1xuICBub2RlLndpZHRoID0gTWF0aC5tYXgoaWNvblNpemUsIGRlZmF1bHRXaWR0aCA/PyAwKTtcbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCwgaGFsZlBhZGRpbmcsIGxhYmVsIH0gPSBhd2FpdCBsYWJlbEhlbHBlcihcbiAgICBwYXJlbnQsXG4gICAgbm9kZSxcbiAgICBcImljb24tc2hhcGUgZGVmYXVsdFwiXG4gICk7XG4gIGNvbnN0IHRvcExhYmVsID0gbm9kZS5wb3MgPT09IFwidFwiO1xuICBjb25zdCBoZWlnaHQgPSBpY29uU2l6ZSArIGhhbGZQYWRkaW5nICogMjtcbiAgY29uc3Qgd2lkdGggPSBpY29uU2l6ZSArIGhhbGZQYWRkaW5nICogMjtcbiAgY29uc3QgeyBub2RlQm9yZGVyLCBtYWluQmtnIH0gPSB0aGVtZVZhcmlhYmxlcztcbiAgY29uc3QgeyBzdHlsZXNNYXAgfSA9IGNvbXBpbGVTdHlsZXMobm9kZSk7XG4gIGNvbnN0IHggPSAtd2lkdGggLyAyO1xuICBjb25zdCB5ID0gLWhlaWdodCAvIDI7XG4gIGNvbnN0IGxhYmVsUGFkZGluZyA9IG5vZGUubGFiZWwgPyA4IDogMDtcbiAgY29uc3QgcmMgPSByb3VnaDI1LnN2ZyhzaGFwZVN2Zyk7XG4gIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gIGlmIChub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBvcHRpb25zLnJvdWdobmVzcyA9IDA7XG4gICAgb3B0aW9ucy5maWxsU3R5bGUgPSBcInNvbGlkXCI7XG4gIH1cbiAgY29uc3QgZmlsbCA9IHN0eWxlc01hcC5nZXQoXCJmaWxsXCIpO1xuICBvcHRpb25zLnN0cm9rZSA9IGZpbGwgPz8gbWFpbkJrZztcbiAgY29uc3QgaWNvbk5vZGUgPSByYy5wYXRoKGNyZWF0ZVJvdW5kZWRSZWN0UGF0aEQoeCwgeSwgd2lkdGgsIGhlaWdodCwgNSksIG9wdGlvbnMpO1xuICBjb25zdCBvdXRlcldpZHRoID0gTWF0aC5tYXgod2lkdGgsIGJib3gud2lkdGgpO1xuICBjb25zdCBvdXRlckhlaWdodCA9IGhlaWdodCArIGJib3guaGVpZ2h0ICsgbGFiZWxQYWRkaW5nO1xuICBjb25zdCBvdXRlck5vZGUgPSByYy5yZWN0YW5nbGUoLW91dGVyV2lkdGggLyAyLCAtb3V0ZXJIZWlnaHQgLyAyLCBvdXRlcldpZHRoLCBvdXRlckhlaWdodCwge1xuICAgIC4uLm9wdGlvbnMsXG4gICAgZmlsbDogXCJ0cmFuc3BhcmVudFwiLFxuICAgIHN0cm9rZTogXCJub25lXCJcbiAgfSk7XG4gIGNvbnN0IGljb25TaGFwZSA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiBpY29uTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIikuYXR0cihcImNsYXNzXCIsIFwiaWNvbi1zaGFwZTJcIik7XG4gIGNvbnN0IG91dGVyU2hhcGUgPSBzaGFwZVN2Zy5pbnNlcnQoKCkgPT4gb3V0ZXJOb2RlKTtcbiAgaWYgKG5vZGUuaWNvbikge1xuICAgIGNvbnN0IGljb25FbGVtID0gc2hhcGVTdmcuYXBwZW5kKFwiZ1wiKTtcbiAgICBpY29uRWxlbS5odG1sKFxuICAgICAgYDxnPiR7YXdhaXQgZ2V0SWNvblNWRyhub2RlLmljb24sIHtcbiAgICAgICAgaGVpZ2h0OiBpY29uU2l6ZSxcbiAgICAgICAgd2lkdGg6IGljb25TaXplLFxuICAgICAgICBmYWxsYmFja1ByZWZpeDogXCJcIlxuICAgICAgfSl9PC9nPmBcbiAgICApO1xuICAgIGNvbnN0IGljb25CQm94ID0gaWNvbkVsZW0ubm9kZSgpLmdldEJCb3goKTtcbiAgICBjb25zdCBpY29uV2lkdGggPSBpY29uQkJveC53aWR0aDtcbiAgICBjb25zdCBpY29uSGVpZ2h0ID0gaWNvbkJCb3guaGVpZ2h0O1xuICAgIGNvbnN0IGljb25YID0gaWNvbkJCb3gueDtcbiAgICBjb25zdCBpY29uWSA9IGljb25CQm94Lnk7XG4gICAgaWNvbkVsZW0uYXR0cihcbiAgICAgIFwidHJhbnNmb3JtXCIsXG4gICAgICBgdHJhbnNsYXRlKCR7LWljb25XaWR0aCAvIDIgLSBpY29uWH0sJHt0b3BMYWJlbCA/IGJib3guaGVpZ2h0IC8gMiArIGxhYmVsUGFkZGluZyAvIDIgLSBpY29uSGVpZ2h0IC8gMiAtIGljb25ZIDogLWJib3guaGVpZ2h0IC8gMiAtIGxhYmVsUGFkZGluZyAvIDIgLSBpY29uSGVpZ2h0IC8gMiAtIGljb25ZfSlgXG4gICAgKTtcbiAgICBpY29uRWxlbS5hdHRyKFwic3R5bGVcIiwgYGNvbG9yOiAke3N0eWxlc01hcC5nZXQoXCJzdHJva2VcIikgPz8gbm9kZUJvcmRlcn07YCk7XG4gIH1cbiAgbGFiZWwuYXR0cihcbiAgICBcInRyYW5zZm9ybVwiLFxuICAgIGB0cmFuc2xhdGUoJHstYmJveC53aWR0aCAvIDIgLSAoYmJveC54IC0gKGJib3gubGVmdCA/PyAwKSl9LCR7dG9wTGFiZWwgPyAtb3V0ZXJIZWlnaHQgLyAyIDogb3V0ZXJIZWlnaHQgLyAyIC0gYmJveC5oZWlnaHR9KWBcbiAgKTtcbiAgaWNvblNoYXBlLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICBgdHJhbnNsYXRlKCR7MH0sJHt0b3BMYWJlbCA/IGJib3guaGVpZ2h0IC8gMiArIGxhYmVsUGFkZGluZyAvIDIgOiAtYmJveC5oZWlnaHQgLyAyIC0gbGFiZWxQYWRkaW5nIC8gMn0pYFxuICApO1xuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIG91dGVyU2hhcGUpO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgbG9nLmluZm8oXCJpY29uU3F1YXJlIGludGVyc2VjdFwiLCBub2RlLCBwb2ludCk7XG4gICAgaWYgKCFub2RlLmxhYmVsKSB7XG4gICAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucmVjdChub2RlLCBwb2ludCk7XG4gICAgfVxuICAgIGNvbnN0IGR4ID0gbm9kZS54ID8/IDA7XG4gICAgY29uc3QgZHkgPSBub2RlLnkgPz8gMDtcbiAgICBjb25zdCBub2RlSGVpZ2h0ID0gbm9kZS5oZWlnaHQgPz8gMDtcbiAgICBsZXQgcG9pbnRzID0gW107XG4gICAgaWYgKHRvcExhYmVsKSB7XG4gICAgICBwb2ludHMgPSBbXG4gICAgICAgIHsgeDogZHggLSBiYm94LndpZHRoIC8gMiwgeTogZHkgLSBub2RlSGVpZ2h0IC8gMiB9LFxuICAgICAgICB7IHg6IGR4ICsgYmJveC53aWR0aCAvIDIsIHk6IGR5IC0gbm9kZUhlaWdodCAvIDIgfSxcbiAgICAgICAgeyB4OiBkeCArIGJib3gud2lkdGggLyAyLCB5OiBkeSAtIG5vZGVIZWlnaHQgLyAyICsgYmJveC5oZWlnaHQgKyBsYWJlbFBhZGRpbmcgfSxcbiAgICAgICAgeyB4OiBkeCArIHdpZHRoIC8gMiwgeTogZHkgLSBub2RlSGVpZ2h0IC8gMiArIGJib3guaGVpZ2h0ICsgbGFiZWxQYWRkaW5nIH0sXG4gICAgICAgIHsgeDogZHggKyB3aWR0aCAvIDIsIHk6IGR5ICsgbm9kZUhlaWdodCAvIDIgfSxcbiAgICAgICAgeyB4OiBkeCAtIHdpZHRoIC8gMiwgeTogZHkgKyBub2RlSGVpZ2h0IC8gMiB9LFxuICAgICAgICB7IHg6IGR4IC0gd2lkdGggLyAyLCB5OiBkeSAtIG5vZGVIZWlnaHQgLyAyICsgYmJveC5oZWlnaHQgKyBsYWJlbFBhZGRpbmcgfSxcbiAgICAgICAgeyB4OiBkeCAtIGJib3gud2lkdGggLyAyLCB5OiBkeSAtIG5vZGVIZWlnaHQgLyAyICsgYmJveC5oZWlnaHQgKyBsYWJlbFBhZGRpbmcgfVxuICAgICAgXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcG9pbnRzID0gW1xuICAgICAgICB7IHg6IGR4IC0gd2lkdGggLyAyLCB5OiBkeSAtIG5vZGVIZWlnaHQgLyAyIH0sXG4gICAgICAgIHsgeDogZHggKyB3aWR0aCAvIDIsIHk6IGR5IC0gbm9kZUhlaWdodCAvIDIgfSxcbiAgICAgICAgeyB4OiBkeCArIHdpZHRoIC8gMiwgeTogZHkgLSBub2RlSGVpZ2h0IC8gMiArIGhlaWdodCB9LFxuICAgICAgICB7IHg6IGR4ICsgYmJveC53aWR0aCAvIDIsIHk6IGR5IC0gbm9kZUhlaWdodCAvIDIgKyBoZWlnaHQgfSxcbiAgICAgICAgeyB4OiBkeCArIGJib3gud2lkdGggLyAyIC8gMiwgeTogZHkgKyBub2RlSGVpZ2h0IC8gMiB9LFxuICAgICAgICB7IHg6IGR4IC0gYmJveC53aWR0aCAvIDIsIHk6IGR5ICsgbm9kZUhlaWdodCAvIDIgfSxcbiAgICAgICAgeyB4OiBkeCAtIGJib3gud2lkdGggLyAyLCB5OiBkeSAtIG5vZGVIZWlnaHQgLyAyICsgaGVpZ2h0IH0sXG4gICAgICAgIHsgeDogZHggLSB3aWR0aCAvIDIsIHk6IGR5IC0gbm9kZUhlaWdodCAvIDIgKyBoZWlnaHQgfVxuICAgICAgXTtcbiAgICB9XG4gICAgY29uc3QgcG9zID0gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihub2RlLCBwb2ludHMsIHBvaW50KTtcbiAgICByZXR1cm4gcG9zO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59XG5fX25hbWUoaWNvblJvdW5kZWQsIFwiaWNvblJvdW5kZWRcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL2ljb25TcXVhcmUudHNcbmltcG9ydCByb3VnaDI2IGZyb20gXCJyb3VnaGpzXCI7XG5hc3luYyBmdW5jdGlvbiBpY29uU3F1YXJlKHBhcmVudCwgbm9kZSwgeyBjb25maWc6IHsgdGhlbWVWYXJpYWJsZXMsIGZsb3djaGFydCB9IH0pIHtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IGFzc2V0SGVpZ2h0ID0gbm9kZS5hc3NldEhlaWdodCA/PyA0ODtcbiAgY29uc3QgYXNzZXRXaWR0aCA9IG5vZGUuYXNzZXRXaWR0aCA/PyA0ODtcbiAgY29uc3QgaWNvblNpemUgPSBNYXRoLm1heChhc3NldEhlaWdodCwgYXNzZXRXaWR0aCk7XG4gIGNvbnN0IGRlZmF1bHRXaWR0aCA9IGZsb3djaGFydD8ud3JhcHBpbmdXaWR0aDtcbiAgbm9kZS53aWR0aCA9IE1hdGgubWF4KGljb25TaXplLCBkZWZhdWx0V2lkdGggPz8gMCk7XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3gsIGhhbGZQYWRkaW5nLCBsYWJlbCB9ID0gYXdhaXQgbGFiZWxIZWxwZXIoXG4gICAgcGFyZW50LFxuICAgIG5vZGUsXG4gICAgXCJpY29uLXNoYXBlIGRlZmF1bHRcIlxuICApO1xuICBjb25zdCB0b3BMYWJlbCA9IG5vZGUucG9zID09PSBcInRcIjtcbiAgY29uc3QgaGVpZ2h0ID0gaWNvblNpemUgKyBoYWxmUGFkZGluZyAqIDI7XG4gIGNvbnN0IHdpZHRoID0gaWNvblNpemUgKyBoYWxmUGFkZGluZyAqIDI7XG4gIGNvbnN0IHsgbm9kZUJvcmRlciwgbWFpbkJrZyB9ID0gdGhlbWVWYXJpYWJsZXM7XG4gIGNvbnN0IHsgc3R5bGVzTWFwIH0gPSBjb21waWxlU3R5bGVzKG5vZGUpO1xuICBjb25zdCB4ID0gLXdpZHRoIC8gMjtcbiAgY29uc3QgeSA9IC1oZWlnaHQgLyAyO1xuICBjb25zdCBsYWJlbFBhZGRpbmcgPSBub2RlLmxhYmVsID8gOCA6IDA7XG4gIGNvbnN0IHJjID0gcm91Z2gyNi5zdmcoc2hhcGVTdmcpO1xuICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwge30pO1xuICBpZiAobm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgb3B0aW9ucy5yb3VnaG5lc3MgPSAwO1xuICAgIG9wdGlvbnMuZmlsbFN0eWxlID0gXCJzb2xpZFwiO1xuICB9XG4gIGNvbnN0IGZpbGwgPSBzdHlsZXNNYXAuZ2V0KFwiZmlsbFwiKTtcbiAgb3B0aW9ucy5zdHJva2UgPSBmaWxsID8/IG1haW5Ca2c7XG4gIGNvbnN0IGljb25Ob2RlID0gcmMucGF0aChjcmVhdGVSb3VuZGVkUmVjdFBhdGhEKHgsIHksIHdpZHRoLCBoZWlnaHQsIDAuMSksIG9wdGlvbnMpO1xuICBjb25zdCBvdXRlcldpZHRoID0gTWF0aC5tYXgod2lkdGgsIGJib3gud2lkdGgpO1xuICBjb25zdCBvdXRlckhlaWdodCA9IGhlaWdodCArIGJib3guaGVpZ2h0ICsgbGFiZWxQYWRkaW5nO1xuICBjb25zdCBvdXRlck5vZGUgPSByYy5yZWN0YW5nbGUoLW91dGVyV2lkdGggLyAyLCAtb3V0ZXJIZWlnaHQgLyAyLCBvdXRlcldpZHRoLCBvdXRlckhlaWdodCwge1xuICAgIC4uLm9wdGlvbnMsXG4gICAgZmlsbDogXCJ0cmFuc3BhcmVudFwiLFxuICAgIHN0cm9rZTogXCJub25lXCJcbiAgfSk7XG4gIGNvbnN0IGljb25TaGFwZSA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiBpY29uTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gIGNvbnN0IG91dGVyU2hhcGUgPSBzaGFwZVN2Zy5pbnNlcnQoKCkgPT4gb3V0ZXJOb2RlKTtcbiAgaWYgKG5vZGUuaWNvbikge1xuICAgIGNvbnN0IGljb25FbGVtID0gc2hhcGVTdmcuYXBwZW5kKFwiZ1wiKTtcbiAgICBpY29uRWxlbS5odG1sKFxuICAgICAgYDxnPiR7YXdhaXQgZ2V0SWNvblNWRyhub2RlLmljb24sIHtcbiAgICAgICAgaGVpZ2h0OiBpY29uU2l6ZSxcbiAgICAgICAgd2lkdGg6IGljb25TaXplLFxuICAgICAgICBmYWxsYmFja1ByZWZpeDogXCJcIlxuICAgICAgfSl9PC9nPmBcbiAgICApO1xuICAgIGNvbnN0IGljb25CQm94ID0gaWNvbkVsZW0ubm9kZSgpLmdldEJCb3goKTtcbiAgICBjb25zdCBpY29uV2lkdGggPSBpY29uQkJveC53aWR0aDtcbiAgICBjb25zdCBpY29uSGVpZ2h0ID0gaWNvbkJCb3guaGVpZ2h0O1xuICAgIGNvbnN0IGljb25YID0gaWNvbkJCb3gueDtcbiAgICBjb25zdCBpY29uWSA9IGljb25CQm94Lnk7XG4gICAgaWNvbkVsZW0uYXR0cihcbiAgICAgIFwidHJhbnNmb3JtXCIsXG4gICAgICBgdHJhbnNsYXRlKCR7LWljb25XaWR0aCAvIDIgLSBpY29uWH0sJHt0b3BMYWJlbCA/IGJib3guaGVpZ2h0IC8gMiArIGxhYmVsUGFkZGluZyAvIDIgLSBpY29uSGVpZ2h0IC8gMiAtIGljb25ZIDogLWJib3guaGVpZ2h0IC8gMiAtIGxhYmVsUGFkZGluZyAvIDIgLSBpY29uSGVpZ2h0IC8gMiAtIGljb25ZfSlgXG4gICAgKTtcbiAgICBpY29uRWxlbS5hdHRyKFwic3R5bGVcIiwgYGNvbG9yOiAke3N0eWxlc01hcC5nZXQoXCJzdHJva2VcIikgPz8gbm9kZUJvcmRlcn07YCk7XG4gIH1cbiAgbGFiZWwuYXR0cihcbiAgICBcInRyYW5zZm9ybVwiLFxuICAgIGB0cmFuc2xhdGUoJHstYmJveC53aWR0aCAvIDIgLSAoYmJveC54IC0gKGJib3gubGVmdCA/PyAwKSl9LCR7dG9wTGFiZWwgPyAtb3V0ZXJIZWlnaHQgLyAyIDogb3V0ZXJIZWlnaHQgLyAyIC0gYmJveC5oZWlnaHR9KWBcbiAgKTtcbiAgaWNvblNoYXBlLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICBgdHJhbnNsYXRlKCR7MH0sJHt0b3BMYWJlbCA/IGJib3guaGVpZ2h0IC8gMiArIGxhYmVsUGFkZGluZyAvIDIgOiAtYmJveC5oZWlnaHQgLyAyIC0gbGFiZWxQYWRkaW5nIC8gMn0pYFxuICApO1xuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIG91dGVyU2hhcGUpO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgbG9nLmluZm8oXCJpY29uU3F1YXJlIGludGVyc2VjdFwiLCBub2RlLCBwb2ludCk7XG4gICAgaWYgKCFub2RlLmxhYmVsKSB7XG4gICAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucmVjdChub2RlLCBwb2ludCk7XG4gICAgfVxuICAgIGNvbnN0IGR4ID0gbm9kZS54ID8/IDA7XG4gICAgY29uc3QgZHkgPSBub2RlLnkgPz8gMDtcbiAgICBjb25zdCBub2RlSGVpZ2h0ID0gbm9kZS5oZWlnaHQgPz8gMDtcbiAgICBsZXQgcG9pbnRzID0gW107XG4gICAgaWYgKHRvcExhYmVsKSB7XG4gICAgICBwb2ludHMgPSBbXG4gICAgICAgIHsgeDogZHggLSBiYm94LndpZHRoIC8gMiwgeTogZHkgLSBub2RlSGVpZ2h0IC8gMiB9LFxuICAgICAgICB7IHg6IGR4ICsgYmJveC53aWR0aCAvIDIsIHk6IGR5IC0gbm9kZUhlaWdodCAvIDIgfSxcbiAgICAgICAgeyB4OiBkeCArIGJib3gud2lkdGggLyAyLCB5OiBkeSAtIG5vZGVIZWlnaHQgLyAyICsgYmJveC5oZWlnaHQgKyBsYWJlbFBhZGRpbmcgfSxcbiAgICAgICAgeyB4OiBkeCArIHdpZHRoIC8gMiwgeTogZHkgLSBub2RlSGVpZ2h0IC8gMiArIGJib3guaGVpZ2h0ICsgbGFiZWxQYWRkaW5nIH0sXG4gICAgICAgIHsgeDogZHggKyB3aWR0aCAvIDIsIHk6IGR5ICsgbm9kZUhlaWdodCAvIDIgfSxcbiAgICAgICAgeyB4OiBkeCAtIHdpZHRoIC8gMiwgeTogZHkgKyBub2RlSGVpZ2h0IC8gMiB9LFxuICAgICAgICB7IHg6IGR4IC0gd2lkdGggLyAyLCB5OiBkeSAtIG5vZGVIZWlnaHQgLyAyICsgYmJveC5oZWlnaHQgKyBsYWJlbFBhZGRpbmcgfSxcbiAgICAgICAgeyB4OiBkeCAtIGJib3gud2lkdGggLyAyLCB5OiBkeSAtIG5vZGVIZWlnaHQgLyAyICsgYmJveC5oZWlnaHQgKyBsYWJlbFBhZGRpbmcgfVxuICAgICAgXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcG9pbnRzID0gW1xuICAgICAgICB7IHg6IGR4IC0gd2lkdGggLyAyLCB5OiBkeSAtIG5vZGVIZWlnaHQgLyAyIH0sXG4gICAgICAgIHsgeDogZHggKyB3aWR0aCAvIDIsIHk6IGR5IC0gbm9kZUhlaWdodCAvIDIgfSxcbiAgICAgICAgeyB4OiBkeCArIHdpZHRoIC8gMiwgeTogZHkgLSBub2RlSGVpZ2h0IC8gMiArIGhlaWdodCB9LFxuICAgICAgICB7IHg6IGR4ICsgYmJveC53aWR0aCAvIDIsIHk6IGR5IC0gbm9kZUhlaWdodCAvIDIgKyBoZWlnaHQgfSxcbiAgICAgICAgeyB4OiBkeCArIGJib3gud2lkdGggLyAyIC8gMiwgeTogZHkgKyBub2RlSGVpZ2h0IC8gMiB9LFxuICAgICAgICB7IHg6IGR4IC0gYmJveC53aWR0aCAvIDIsIHk6IGR5ICsgbm9kZUhlaWdodCAvIDIgfSxcbiAgICAgICAgeyB4OiBkeCAtIGJib3gud2lkdGggLyAyLCB5OiBkeSAtIG5vZGVIZWlnaHQgLyAyICsgaGVpZ2h0IH0sXG4gICAgICAgIHsgeDogZHggLSB3aWR0aCAvIDIsIHk6IGR5IC0gbm9kZUhlaWdodCAvIDIgKyBoZWlnaHQgfVxuICAgICAgXTtcbiAgICB9XG4gICAgY29uc3QgcG9zID0gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihub2RlLCBwb2ludHMsIHBvaW50KTtcbiAgICByZXR1cm4gcG9zO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59XG5fX25hbWUoaWNvblNxdWFyZSwgXCJpY29uU3F1YXJlXCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy9pbWFnZVNxdWFyZS50c1xuaW1wb3J0IHJvdWdoMjcgZnJvbSBcInJvdWdoanNcIjtcbmFzeW5jIGZ1bmN0aW9uIGltYWdlU3F1YXJlKHBhcmVudCwgbm9kZSwgeyBjb25maWc6IHsgZmxvd2NoYXJ0IH0gfSkge1xuICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgaW1nLnNyYyA9IG5vZGU/LmltZyA/PyBcIlwiO1xuICBhd2FpdCBpbWcuZGVjb2RlKCk7XG4gIGNvbnN0IGltYWdlTmF0dXJhbFdpZHRoID0gTnVtYmVyKGltZy5uYXR1cmFsV2lkdGgudG9TdHJpbmcoKS5yZXBsYWNlKFwicHhcIiwgXCJcIikpO1xuICBjb25zdCBpbWFnZU5hdHVyYWxIZWlnaHQgPSBOdW1iZXIoaW1nLm5hdHVyYWxIZWlnaHQudG9TdHJpbmcoKS5yZXBsYWNlKFwicHhcIiwgXCJcIikpO1xuICBub2RlLmltYWdlQXNwZWN0UmF0aW8gPSBpbWFnZU5hdHVyYWxXaWR0aCAvIGltYWdlTmF0dXJhbEhlaWdodDtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IGRlZmF1bHRXaWR0aCA9IGZsb3djaGFydD8ud3JhcHBpbmdXaWR0aDtcbiAgbm9kZS5kZWZhdWx0V2lkdGggPSBmbG93Y2hhcnQ/LndyYXBwaW5nV2lkdGg7XG4gIGNvbnN0IGltYWdlUmF3V2lkdGggPSBNYXRoLm1heChcbiAgICBub2RlLmxhYmVsID8gZGVmYXVsdFdpZHRoID8/IDAgOiAwLFxuICAgIG5vZGU/LmFzc2V0V2lkdGggPz8gaW1hZ2VOYXR1cmFsV2lkdGhcbiAgKTtcbiAgY29uc3QgaW1hZ2VXaWR0aCA9IG5vZGUuY29uc3RyYWludCA9PT0gXCJvblwiID8gbm9kZT8uYXNzZXRIZWlnaHQgPyBub2RlLmFzc2V0SGVpZ2h0ICogbm9kZS5pbWFnZUFzcGVjdFJhdGlvIDogaW1hZ2VSYXdXaWR0aCA6IGltYWdlUmF3V2lkdGg7XG4gIGNvbnN0IGltYWdlSGVpZ2h0ID0gbm9kZS5jb25zdHJhaW50ID09PSBcIm9uXCIgPyBpbWFnZVdpZHRoIC8gbm9kZS5pbWFnZUFzcGVjdFJhdGlvIDogbm9kZT8uYXNzZXRIZWlnaHQgPz8gaW1hZ2VOYXR1cmFsSGVpZ2h0O1xuICBub2RlLndpZHRoID0gTWF0aC5tYXgoaW1hZ2VXaWR0aCwgZGVmYXVsdFdpZHRoID8/IDApO1xuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94LCBsYWJlbCB9ID0gYXdhaXQgbGFiZWxIZWxwZXIocGFyZW50LCBub2RlLCBcImltYWdlLXNoYXBlIGRlZmF1bHRcIik7XG4gIGNvbnN0IHRvcExhYmVsID0gbm9kZS5wb3MgPT09IFwidFwiO1xuICBjb25zdCB4ID0gLWltYWdlV2lkdGggLyAyO1xuICBjb25zdCB5ID0gLWltYWdlSGVpZ2h0IC8gMjtcbiAgY29uc3QgbGFiZWxQYWRkaW5nID0gbm9kZS5sYWJlbCA/IDggOiAwO1xuICBjb25zdCByYyA9IHJvdWdoMjcuc3ZnKHNoYXBlU3ZnKTtcbiAgY29uc3Qgb3B0aW9ucyA9IHVzZXJOb2RlT3ZlcnJpZGVzKG5vZGUsIHt9KTtcbiAgaWYgKG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIG9wdGlvbnMucm91Z2huZXNzID0gMDtcbiAgICBvcHRpb25zLmZpbGxTdHlsZSA9IFwic29saWRcIjtcbiAgfVxuICBjb25zdCBpbWFnZU5vZGUgPSByYy5yZWN0YW5nbGUoeCwgeSwgaW1hZ2VXaWR0aCwgaW1hZ2VIZWlnaHQsIG9wdGlvbnMpO1xuICBjb25zdCBvdXRlcldpZHRoID0gTWF0aC5tYXgoaW1hZ2VXaWR0aCwgYmJveC53aWR0aCk7XG4gIGNvbnN0IG91dGVySGVpZ2h0ID0gaW1hZ2VIZWlnaHQgKyBiYm94LmhlaWdodCArIGxhYmVsUGFkZGluZztcbiAgY29uc3Qgb3V0ZXJOb2RlID0gcmMucmVjdGFuZ2xlKC1vdXRlcldpZHRoIC8gMiwgLW91dGVySGVpZ2h0IC8gMiwgb3V0ZXJXaWR0aCwgb3V0ZXJIZWlnaHQsIHtcbiAgICAuLi5vcHRpb25zLFxuICAgIGZpbGw6IFwibm9uZVwiLFxuICAgIHN0cm9rZTogXCJub25lXCJcbiAgfSk7XG4gIGNvbnN0IGljb25TaGFwZSA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiBpbWFnZU5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICBjb25zdCBvdXRlclNoYXBlID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IG91dGVyTm9kZSk7XG4gIGlmIChub2RlLmltZykge1xuICAgIGNvbnN0IGltYWdlID0gc2hhcGVTdmcuYXBwZW5kKFwiaW1hZ2VcIik7XG4gICAgaW1hZ2UuYXR0cihcImhyZWZcIiwgbm9kZS5pbWcpO1xuICAgIGltYWdlLmF0dHIoXCJ3aWR0aFwiLCBpbWFnZVdpZHRoKTtcbiAgICBpbWFnZS5hdHRyKFwiaGVpZ2h0XCIsIGltYWdlSGVpZ2h0KTtcbiAgICBpbWFnZS5hdHRyKFwicHJlc2VydmVBc3BlY3RSYXRpb1wiLCBcIm5vbmVcIik7XG4gICAgaW1hZ2UuYXR0cihcbiAgICAgIFwidHJhbnNmb3JtXCIsXG4gICAgICBgdHJhbnNsYXRlKCR7LWltYWdlV2lkdGggLyAyfSwke3RvcExhYmVsID8gb3V0ZXJIZWlnaHQgLyAyIC0gaW1hZ2VIZWlnaHQgOiAtb3V0ZXJIZWlnaHQgLyAyfSlgXG4gICAgKTtcbiAgfVxuICBsYWJlbC5hdHRyKFxuICAgIFwidHJhbnNmb3JtXCIsXG4gICAgYHRyYW5zbGF0ZSgkey1iYm94LndpZHRoIC8gMiAtIChiYm94LnggLSAoYmJveC5sZWZ0ID8/IDApKX0sJHt0b3BMYWJlbCA/IC1pbWFnZUhlaWdodCAvIDIgLSBiYm94LmhlaWdodCAvIDIgLSBsYWJlbFBhZGRpbmcgLyAyIDogaW1hZ2VIZWlnaHQgLyAyIC0gYmJveC5oZWlnaHQgLyAyICsgbGFiZWxQYWRkaW5nIC8gMn0pYFxuICApO1xuICBpY29uU2hhcGUuYXR0cihcbiAgICBcInRyYW5zZm9ybVwiLFxuICAgIGB0cmFuc2xhdGUoJHswfSwke3RvcExhYmVsID8gYmJveC5oZWlnaHQgLyAyICsgbGFiZWxQYWRkaW5nIC8gMiA6IC1iYm94LmhlaWdodCAvIDIgLSBsYWJlbFBhZGRpbmcgLyAyfSlgXG4gICk7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgb3V0ZXJTaGFwZSk7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICBsb2cuaW5mbyhcImljb25TcXVhcmUgaW50ZXJzZWN0XCIsIG5vZGUsIHBvaW50KTtcbiAgICBpZiAoIW5vZGUubGFiZWwpIHtcbiAgICAgIHJldHVybiBpbnRlcnNlY3RfZGVmYXVsdC5yZWN0KG5vZGUsIHBvaW50KTtcbiAgICB9XG4gICAgY29uc3QgZHggPSBub2RlLnggPz8gMDtcbiAgICBjb25zdCBkeSA9IG5vZGUueSA/PyAwO1xuICAgIGNvbnN0IG5vZGVIZWlnaHQgPSBub2RlLmhlaWdodCA/PyAwO1xuICAgIGxldCBwb2ludHMgPSBbXTtcbiAgICBpZiAodG9wTGFiZWwpIHtcbiAgICAgIHBvaW50cyA9IFtcbiAgICAgICAgeyB4OiBkeCAtIGJib3gud2lkdGggLyAyLCB5OiBkeSAtIG5vZGVIZWlnaHQgLyAyIH0sXG4gICAgICAgIHsgeDogZHggKyBiYm94LndpZHRoIC8gMiwgeTogZHkgLSBub2RlSGVpZ2h0IC8gMiB9LFxuICAgICAgICB7IHg6IGR4ICsgYmJveC53aWR0aCAvIDIsIHk6IGR5IC0gbm9kZUhlaWdodCAvIDIgKyBiYm94LmhlaWdodCArIGxhYmVsUGFkZGluZyB9LFxuICAgICAgICB7IHg6IGR4ICsgaW1hZ2VXaWR0aCAvIDIsIHk6IGR5IC0gbm9kZUhlaWdodCAvIDIgKyBiYm94LmhlaWdodCArIGxhYmVsUGFkZGluZyB9LFxuICAgICAgICB7IHg6IGR4ICsgaW1hZ2VXaWR0aCAvIDIsIHk6IGR5ICsgbm9kZUhlaWdodCAvIDIgfSxcbiAgICAgICAgeyB4OiBkeCAtIGltYWdlV2lkdGggLyAyLCB5OiBkeSArIG5vZGVIZWlnaHQgLyAyIH0sXG4gICAgICAgIHsgeDogZHggLSBpbWFnZVdpZHRoIC8gMiwgeTogZHkgLSBub2RlSGVpZ2h0IC8gMiArIGJib3guaGVpZ2h0ICsgbGFiZWxQYWRkaW5nIH0sXG4gICAgICAgIHsgeDogZHggLSBiYm94LndpZHRoIC8gMiwgeTogZHkgLSBub2RlSGVpZ2h0IC8gMiArIGJib3guaGVpZ2h0ICsgbGFiZWxQYWRkaW5nIH1cbiAgICAgIF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHBvaW50cyA9IFtcbiAgICAgICAgeyB4OiBkeCAtIGltYWdlV2lkdGggLyAyLCB5OiBkeSAtIG5vZGVIZWlnaHQgLyAyIH0sXG4gICAgICAgIHsgeDogZHggKyBpbWFnZVdpZHRoIC8gMiwgeTogZHkgLSBub2RlSGVpZ2h0IC8gMiB9LFxuICAgICAgICB7IHg6IGR4ICsgaW1hZ2VXaWR0aCAvIDIsIHk6IGR5IC0gbm9kZUhlaWdodCAvIDIgKyBpbWFnZUhlaWdodCB9LFxuICAgICAgICB7IHg6IGR4ICsgYmJveC53aWR0aCAvIDIsIHk6IGR5IC0gbm9kZUhlaWdodCAvIDIgKyBpbWFnZUhlaWdodCB9LFxuICAgICAgICB7IHg6IGR4ICsgYmJveC53aWR0aCAvIDIgLyAyLCB5OiBkeSArIG5vZGVIZWlnaHQgLyAyIH0sXG4gICAgICAgIHsgeDogZHggLSBiYm94LndpZHRoIC8gMiwgeTogZHkgKyBub2RlSGVpZ2h0IC8gMiB9LFxuICAgICAgICB7IHg6IGR4IC0gYmJveC53aWR0aCAvIDIsIHk6IGR5IC0gbm9kZUhlaWdodCAvIDIgKyBpbWFnZUhlaWdodCB9LFxuICAgICAgICB7IHg6IGR4IC0gaW1hZ2VXaWR0aCAvIDIsIHk6IGR5IC0gbm9kZUhlaWdodCAvIDIgKyBpbWFnZUhlaWdodCB9XG4gICAgICBdO1xuICAgIH1cbiAgICBjb25zdCBwb3MgPSBpbnRlcnNlY3RfZGVmYXVsdC5wb2x5Z29uKG5vZGUsIHBvaW50cywgcG9pbnQpO1xuICAgIHJldHVybiBwb3M7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZShpbWFnZVNxdWFyZSwgXCJpbWFnZVNxdWFyZVwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvaW52ZXJ0ZWRUcmFwZXpvaWQudHNcbmltcG9ydCByb3VnaDI4IGZyb20gXCJyb3VnaGpzXCI7XG5hc3luYyBmdW5jdGlvbiBpbnZfdHJhcGV6b2lkKHBhcmVudCwgbm9kZSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3Qgbm9kZVBhZGRpbmcgPSBub2RlLnBhZGRpbmcgPz8gMDtcbiAgY29uc3QgbGFiZWxQYWRkaW5nWSA9IG5vZGVQYWRkaW5nO1xuICBjb25zdCBsYWJlbFBhZGRpbmdYID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gbm9kZVBhZGRpbmcgKiAyIDogbm9kZVBhZGRpbmc7XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3ggfSA9IGF3YWl0IGxhYmVsSGVscGVyKHBhcmVudCwgbm9kZSwgZ2V0Tm9kZUNsYXNzZXMobm9kZSkpO1xuICBjb25zdCB3ID0gTWF0aC5tYXgoYmJveC53aWR0aCArIChsYWJlbFBhZGRpbmdYID8/IDApICogMiwgbm9kZT8ud2lkdGggPz8gMCk7XG4gIGNvbnN0IGggPSBNYXRoLm1heChiYm94LmhlaWdodCArIChsYWJlbFBhZGRpbmdZID8/IDApICogMiwgbm9kZT8uaGVpZ2h0ID8/IDApO1xuICBjb25zdCBwb2ludHMgPSBbXG4gICAgeyB4OiAwLCB5OiAwIH0sXG4gICAgeyB4OiB3LCB5OiAwIH0sXG4gICAgeyB4OiB3ICsgMyAqIGggLyA2LCB5OiAtaCB9LFxuICAgIHsgeDogLTMgKiBoIC8gNiwgeTogLWggfVxuICBdO1xuICBsZXQgcG9seWdvbjtcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGlmIChub2RlLmxvb2sgPT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBjb25zdCByYyA9IHJvdWdoMjguc3ZnKHNoYXBlU3ZnKTtcbiAgICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwge30pO1xuICAgIGNvbnN0IHBhdGhEYXRhID0gY3JlYXRlUGF0aEZyb21Qb2ludHMocG9pbnRzKTtcbiAgICBjb25zdCByb3VnaE5vZGUgPSByYy5wYXRoKHBhdGhEYXRhLCBvcHRpb25zKTtcbiAgICBwb2x5Z29uID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHJvdWdoTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIikuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7LXcgLyAyfSwgJHtoIC8gMn0pYCk7XG4gICAgaWYgKGNzc1N0eWxlcykge1xuICAgICAgcG9seWdvbi5hdHRyKFwic3R5bGVcIiwgY3NzU3R5bGVzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcG9seWdvbiA9IGluc2VydFBvbHlnb25TaGFwZShzaGFwZVN2ZywgdywgaCwgcG9pbnRzKTtcbiAgfVxuICBpZiAobm9kZVN0eWxlcykge1xuICAgIHBvbHlnb24uYXR0cihcInN0eWxlXCIsIG5vZGVTdHlsZXMpO1xuICB9XG4gIG5vZGUud2lkdGggPSB3O1xuICBub2RlLmhlaWdodCA9IGg7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgcG9seWdvbik7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihub2RlLCBwb2ludHMsIHBvaW50KTtcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKGludl90cmFwZXpvaWQsIFwiaW52X3RyYXBlem9pZFwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvbGFiZWxSZWN0LnRzXG5hc3luYyBmdW5jdGlvbiBsYWJlbFJlY3QocGFyZW50LCBub2RlKSB7XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3gsIGxhYmVsIH0gPSBhd2FpdCBsYWJlbEhlbHBlcihwYXJlbnQsIG5vZGUsIFwibGFiZWxcIik7XG4gIGNvbnN0IHJlY3QyID0gc2hhcGVTdmcuaW5zZXJ0KFwicmVjdFwiLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgY29uc3QgdG90YWxXaWR0aCA9IDAuMTtcbiAgY29uc3QgdG90YWxIZWlnaHQgPSAwLjE7XG4gIHJlY3QyLmF0dHIoXCJ3aWR0aFwiLCB0b3RhbFdpZHRoKS5hdHRyKFwiaGVpZ2h0XCIsIHRvdGFsSGVpZ2h0KTtcbiAgc2hhcGVTdmcuYXR0cihcImNsYXNzXCIsIFwibGFiZWwgZWRnZUxhYmVsXCIpO1xuICBsYWJlbC5hdHRyKFxuICAgIFwidHJhbnNmb3JtXCIsXG4gICAgYHRyYW5zbGF0ZSgkey0oYmJveC53aWR0aCAvIDIpIC0gKGJib3gueCAtIChiYm94LmxlZnQgPz8gMCkpfSwgJHstKGJib3guaGVpZ2h0IC8gMikgLSAoYmJveC55IC0gKGJib3gudG9wID8/IDApKX0pYFxuICApO1xuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIHJlY3QyKTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiBpbnRlcnNlY3RfZGVmYXVsdC5yZWN0KG5vZGUsIHBvaW50KTtcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKGxhYmVsUmVjdCwgXCJsYWJlbFJlY3RcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL2xlYW5MZWZ0LnRzXG5pbXBvcnQgcm91Z2gyOSBmcm9tIFwicm91Z2hqc1wiO1xuYXN5bmMgZnVuY3Rpb24gbGVhbl9sZWZ0KHBhcmVudCwgbm9kZSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3Qgbm9kZVBhZGRpbmcgPSBub2RlLnBhZGRpbmcgPz8gMDtcbiAgY29uc3QgbGFiZWxQYWRkaW5nWSA9IG5vZGVQYWRkaW5nO1xuICBjb25zdCBsYWJlbFBhZGRpbmdYID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gbm9kZVBhZGRpbmcgKiAyIDogbm9kZVBhZGRpbmc7XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3ggfSA9IGF3YWl0IGxhYmVsSGVscGVyKHBhcmVudCwgbm9kZSwgZ2V0Tm9kZUNsYXNzZXMobm9kZSkpO1xuICBjb25zdCBoID0gKG5vZGU/LmhlaWdodCA/PyBiYm94LmhlaWdodCkgKyBsYWJlbFBhZGRpbmdZO1xuICBjb25zdCB3ID0gKG5vZGU/LndpZHRoID8/IGJib3gud2lkdGgpICsgbGFiZWxQYWRkaW5nWDtcbiAgY29uc3QgcG9pbnRzID0gW1xuICAgIHsgeDogMCwgeTogMCB9LFxuICAgIHsgeDogdyArIDMgKiBoIC8gNiwgeTogMCB9LFxuICAgIHsgeDogdywgeTogLWggfSxcbiAgICB7IHg6IC0oMyAqIGgpIC8gNiwgeTogLWggfVxuICBdO1xuICBsZXQgcG9seWdvbjtcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGlmIChub2RlLmxvb2sgPT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBjb25zdCByYyA9IHJvdWdoMjkuc3ZnKHNoYXBlU3ZnKTtcbiAgICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwge30pO1xuICAgIGNvbnN0IHBhdGhEYXRhID0gY3JlYXRlUGF0aEZyb21Qb2ludHMocG9pbnRzKTtcbiAgICBjb25zdCByb3VnaE5vZGUgPSByYy5wYXRoKHBhdGhEYXRhLCBvcHRpb25zKTtcbiAgICBwb2x5Z29uID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHJvdWdoTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIikuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7LXcgLyAyfSwgJHtoIC8gMn0pYCk7XG4gICAgaWYgKGNzc1N0eWxlcykge1xuICAgICAgcG9seWdvbi5hdHRyKFwic3R5bGVcIiwgY3NzU3R5bGVzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcG9seWdvbiA9IGluc2VydFBvbHlnb25TaGFwZShzaGFwZVN2ZywgdywgaCwgcG9pbnRzKTtcbiAgfVxuICBpZiAobm9kZVN0eWxlcykge1xuICAgIHBvbHlnb24uYXR0cihcInN0eWxlXCIsIG5vZGVTdHlsZXMpO1xuICB9XG4gIG5vZGUud2lkdGggPSB3O1xuICBub2RlLmhlaWdodCA9IGg7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgcG9seWdvbik7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihub2RlLCBwb2ludHMsIHBvaW50KTtcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKGxlYW5fbGVmdCwgXCJsZWFuX2xlZnRcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL2xlYW5SaWdodC50c1xuaW1wb3J0IHJvdWdoMzAgZnJvbSBcInJvdWdoanNcIjtcbmFzeW5jIGZ1bmN0aW9uIGxlYW5fcmlnaHQocGFyZW50LCBub2RlKSB7XG4gIGNvbnN0IHsgbGFiZWxTdHlsZXMsIG5vZGVTdHlsZXMgfSA9IHN0eWxlczJTdHJpbmcobm9kZSk7XG4gIG5vZGUubGFiZWxTdHlsZSA9IGxhYmVsU3R5bGVzO1xuICBjb25zdCBub2RlUGFkZGluZyA9IG5vZGUucGFkZGluZyA/PyAwO1xuICBjb25zdCBsYWJlbFBhZGRpbmdZID0gbm9kZVBhZGRpbmc7XG4gIGNvbnN0IGxhYmVsUGFkZGluZ1ggPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyBub2RlUGFkZGluZyAqIDIgOiBub2RlUGFkZGluZztcbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCB9ID0gYXdhaXQgbGFiZWxIZWxwZXIocGFyZW50LCBub2RlLCBnZXROb2RlQ2xhc3Nlcyhub2RlKSk7XG4gIGNvbnN0IGggPSAobm9kZT8uaGVpZ2h0ID8/IGJib3guaGVpZ2h0KSArIGxhYmVsUGFkZGluZ1k7XG4gIGNvbnN0IHcgPSAobm9kZT8ud2lkdGggPz8gYmJveC53aWR0aCkgKyBsYWJlbFBhZGRpbmdYO1xuICBjb25zdCBwb2ludHMgPSBbXG4gICAgeyB4OiAtMyAqIGggLyA2LCB5OiAwIH0sXG4gICAgeyB4OiB3LCB5OiAwIH0sXG4gICAgeyB4OiB3ICsgMyAqIGggLyA2LCB5OiAtaCB9LFxuICAgIHsgeDogMCwgeTogLWggfVxuICBdO1xuICBsZXQgcG9seWdvbjtcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGlmIChub2RlLmxvb2sgPT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBjb25zdCByYyA9IHJvdWdoMzAuc3ZnKHNoYXBlU3ZnKTtcbiAgICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwge30pO1xuICAgIGNvbnN0IHBhdGhEYXRhID0gY3JlYXRlUGF0aEZyb21Qb2ludHMocG9pbnRzKTtcbiAgICBjb25zdCByb3VnaE5vZGUgPSByYy5wYXRoKHBhdGhEYXRhLCBvcHRpb25zKTtcbiAgICBwb2x5Z29uID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHJvdWdoTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIikuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7LXcgLyAyfSwgJHtoIC8gMn0pYCk7XG4gICAgaWYgKGNzc1N0eWxlcykge1xuICAgICAgcG9seWdvbi5hdHRyKFwic3R5bGVcIiwgY3NzU3R5bGVzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcG9seWdvbiA9IGluc2VydFBvbHlnb25TaGFwZShzaGFwZVN2ZywgdywgaCwgcG9pbnRzKTtcbiAgfVxuICBpZiAobm9kZVN0eWxlcykge1xuICAgIHBvbHlnb24uYXR0cihcInN0eWxlXCIsIG5vZGVTdHlsZXMpO1xuICB9XG4gIG5vZGUud2lkdGggPSB3O1xuICBub2RlLmhlaWdodCA9IGg7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgcG9seWdvbik7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihub2RlLCBwb2ludHMsIHBvaW50KTtcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKGxlYW5fcmlnaHQsIFwibGVhbl9yaWdodFwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvbGlnaHRuaW5nQm9sdC50c1xuaW1wb3J0IHJvdWdoMzEgZnJvbSBcInJvdWdoanNcIjtcbmZ1bmN0aW9uIGxpZ2h0bmluZ0JvbHQocGFyZW50LCBub2RlKSB7XG4gIGNvbnN0IHsgbGFiZWxTdHlsZXMsIG5vZGVTdHlsZXMgfSA9IHN0eWxlczJTdHJpbmcobm9kZSk7XG4gIG5vZGUubGFiZWwgPSBcIlwiO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3Qgc2hhcGVTdmcgPSBwYXJlbnQuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgZ2V0Tm9kZUNsYXNzZXMobm9kZSkpLmF0dHIoXCJpZFwiLCBub2RlLmRvbUlkID8/IG5vZGUuaWQpO1xuICBjb25zdCB7IGNzc1N0eWxlcyB9ID0gbm9kZTtcbiAgY29uc3Qgd2lkdGggPSBNYXRoLm1heCgzNSwgbm9kZT8ud2lkdGggPz8gMCk7XG4gIGNvbnN0IGhlaWdodCA9IE1hdGgubWF4KDM1LCBub2RlPy5oZWlnaHQgPz8gMCk7XG4gIGNvbnN0IGdhcCA9IDc7XG4gIGNvbnN0IHBvaW50cyA9IFtcbiAgICB7IHg6IHdpZHRoLCB5OiAwIH0sXG4gICAgeyB4OiAwLCB5OiBoZWlnaHQgKyBnYXAgLyAyIH0sXG4gICAgeyB4OiB3aWR0aCAtIDIgKiBnYXAsIHk6IGhlaWdodCArIGdhcCAvIDIgfSxcbiAgICB7IHg6IDAsIHk6IDIgKiBoZWlnaHQgfSxcbiAgICB7IHg6IHdpZHRoLCB5OiBoZWlnaHQgLSBnYXAgLyAyIH0sXG4gICAgeyB4OiAyICogZ2FwLCB5OiBoZWlnaHQgLSBnYXAgLyAyIH1cbiAgXTtcbiAgY29uc3QgcmMgPSByb3VnaDMxLnN2ZyhzaGFwZVN2Zyk7XG4gIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gIGlmIChub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBvcHRpb25zLnJvdWdobmVzcyA9IDA7XG4gICAgb3B0aW9ucy5maWxsU3R5bGUgPSBcInNvbGlkXCI7XG4gIH1cbiAgY29uc3QgbGluZVBhdGggPSBjcmVhdGVQYXRoRnJvbVBvaW50cyhwb2ludHMpO1xuICBjb25zdCBsaW5lTm9kZSA9IHJjLnBhdGgobGluZVBhdGgsIG9wdGlvbnMpO1xuICBjb25zdCBsaWdodG5pbmdCb2x0MiA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiBsaW5lTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gIGxpZ2h0bmluZ0JvbHQyLmF0dHIoXCJjbGFzc1wiLCBcIm91dGVyLXBhdGhcIik7XG4gIGlmIChjc3NTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgbGlnaHRuaW5nQm9sdDIuc2VsZWN0QWxsKFwicGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgY3NzU3R5bGVzKTtcbiAgfVxuICBpZiAobm9kZVN0eWxlcyAmJiBub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBsaWdodG5pbmdCb2x0Mi5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgfVxuICBsaWdodG5pbmdCb2x0Mi5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoLSR7d2lkdGggLyAyfSwkey1oZWlnaHR9KWApO1xuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIGxpZ2h0bmluZ0JvbHQyKTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIGxvZy5pbmZvKFwibGlnaHRuaW5nQm9sdCBpbnRlcnNlY3RcIiwgbm9kZSwgcG9pbnQpO1xuICAgIGNvbnN0IHBvcyA9IGludGVyc2VjdF9kZWZhdWx0LnBvbHlnb24obm9kZSwgcG9pbnRzLCBwb2ludCk7XG4gICAgcmV0dXJuIHBvcztcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKGxpZ2h0bmluZ0JvbHQsIFwibGlnaHRuaW5nQm9sdFwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvbGluZWRDeWxpbmRlci50c1xuaW1wb3J0IHJvdWdoMzIgZnJvbSBcInJvdWdoanNcIjtcbnZhciBjcmVhdGVDeWxpbmRlclBhdGhEMiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHgsIHksIHdpZHRoLCBoZWlnaHQsIHJ4LCByeSwgb3V0ZXJPZmZzZXQpID0+IHtcbiAgcmV0dXJuIFtcbiAgICBgTSR7eH0sJHt5ICsgcnl9YCxcbiAgICBgYSR7cnh9LCR7cnl9IDAsMCwwICR7d2lkdGh9LDBgLFxuICAgIGBhJHtyeH0sJHtyeX0gMCwwLDAgJHstd2lkdGh9LDBgLFxuICAgIGBsMCwke2hlaWdodH1gLFxuICAgIGBhJHtyeH0sJHtyeX0gMCwwLDAgJHt3aWR0aH0sMGAsXG4gICAgYGwwLCR7LWhlaWdodH1gLFxuICAgIGBNJHt4fSwke3kgKyByeSArIG91dGVyT2Zmc2V0fWAsXG4gICAgYGEke3J4fSwke3J5fSAwLDAsMCAke3dpZHRofSwwYFxuICBdLmpvaW4oXCIgXCIpO1xufSwgXCJjcmVhdGVDeWxpbmRlclBhdGhEXCIpO1xudmFyIGNyZWF0ZU91dGVyQ3lsaW5kZXJQYXRoRDIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCh4LCB5LCB3aWR0aCwgaGVpZ2h0LCByeCwgcnksIG91dGVyT2Zmc2V0KSA9PiB7XG4gIHJldHVybiBbXG4gICAgYE0ke3h9LCR7eSArIHJ5fWAsXG4gICAgYE0ke3ggKyB3aWR0aH0sJHt5ICsgcnl9YCxcbiAgICBgYSR7cnh9LCR7cnl9IDAsMCwwICR7LXdpZHRofSwwYCxcbiAgICBgbDAsJHtoZWlnaHR9YCxcbiAgICBgYSR7cnh9LCR7cnl9IDAsMCwwICR7d2lkdGh9LDBgLFxuICAgIGBsMCwkey1oZWlnaHR9YCxcbiAgICBgTSR7eH0sJHt5ICsgcnkgKyBvdXRlck9mZnNldH1gLFxuICAgIGBhJHtyeH0sJHtyeX0gMCwwLDAgJHt3aWR0aH0sMGBcbiAgXS5qb2luKFwiIFwiKTtcbn0sIFwiY3JlYXRlT3V0ZXJDeWxpbmRlclBhdGhEXCIpO1xudmFyIGNyZWF0ZUlubmVyQ3lsaW5kZXJQYXRoRDIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCh4LCB5LCB3aWR0aCwgaGVpZ2h0LCByeCwgcnkpID0+IHtcbiAgcmV0dXJuIFtgTSR7eCAtIHdpZHRoIC8gMn0sJHstaGVpZ2h0IC8gMn1gLCBgYSR7cnh9LCR7cnl9IDAsMCwwICR7d2lkdGh9LDBgXS5qb2luKFwiIFwiKTtcbn0sIFwiY3JlYXRlSW5uZXJDeWxpbmRlclBhdGhEXCIpO1xudmFyIE1JTl9IRUlHSFQzID0gMTA7XG52YXIgTUlOX1dJRFRIMyA9IDEwO1xuYXN5bmMgZnVuY3Rpb24gbGluZWRDeWxpbmRlcihwYXJlbnQsIG5vZGUpIHtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcywgbm9kZVN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IG5vZGVQYWRkaW5nID0gbm9kZS5wYWRkaW5nID8/IDA7XG4gIGNvbnN0IGxhYmVsUGFkZGluZ1ggPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyAxNiA6IG5vZGVQYWRkaW5nO1xuICBjb25zdCBsYWJlbFBhZGRpbmdZID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gMjQgOiBub2RlUGFkZGluZztcbiAgaWYgKG5vZGUud2lkdGggfHwgbm9kZS5oZWlnaHQpIHtcbiAgICBjb25zdCBvcmlnaW5hbFdpZHRoID0gbm9kZS53aWR0aCA/PyAwO1xuICAgIG5vZGUud2lkdGggPSAobm9kZS53aWR0aCA/PyAwKSAtIGxhYmVsUGFkZGluZ1g7XG4gICAgaWYgKG5vZGUud2lkdGggPCBNSU5fV0lEVEgzKSB7XG4gICAgICBub2RlLndpZHRoID0gTUlOX1dJRFRIMztcbiAgICB9XG4gICAgY29uc3QgcngyID0gb3JpZ2luYWxXaWR0aCAvIDI7XG4gICAgY29uc3QgcnkyID0gcngyIC8gKDIuNSArIG9yaWdpbmFsV2lkdGggLyA1MCk7XG4gICAgbm9kZS5oZWlnaHQgPSAobm9kZS5oZWlnaHQgPz8gMCkgLSBsYWJlbFBhZGRpbmdZIC0gcnkyICogMztcbiAgICBpZiAobm9kZS5oZWlnaHQgPCBNSU5fSEVJR0hUMykge1xuICAgICAgbm9kZS5oZWlnaHQgPSBNSU5fSEVJR0hUMztcbiAgICB9XG4gIH1cbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCwgbGFiZWwgfSA9IGF3YWl0IGxhYmVsSGVscGVyKHBhcmVudCwgbm9kZSwgZ2V0Tm9kZUNsYXNzZXMobm9kZSkpO1xuICBjb25zdCB3ID0gKG5vZGU/LndpZHRoID8gbm9kZT8ud2lkdGggOiBiYm94LndpZHRoKSArIGxhYmVsUGFkZGluZ1ggKiAyO1xuICBjb25zdCByeCA9IHcgLyAyO1xuICBjb25zdCByeSA9IHJ4IC8gKDIuNSArIHcgLyA1MCk7XG4gIGNvbnN0IGggPSAobm9kZT8uaGVpZ2h0ID8gbm9kZT8uaGVpZ2h0IDogYmJveC5oZWlnaHQpICsgcnkgKyBsYWJlbFBhZGRpbmdZICogMjtcbiAgY29uc3Qgb3V0ZXJPZmZzZXQgPSBoICogMC4xO1xuICBsZXQgY3lsaW5kZXIyO1xuICBjb25zdCB7IGNzc1N0eWxlcyB9ID0gbm9kZTtcbiAgaWYgKG5vZGUubG9vayA9PT0gXCJoYW5kRHJhd25cIikge1xuICAgIGNvbnN0IHJjID0gcm91Z2gzMi5zdmcoc2hhcGVTdmcpO1xuICAgIGNvbnN0IG91dGVyUGF0aERhdGEgPSBjcmVhdGVPdXRlckN5bGluZGVyUGF0aEQyKDAsIDAsIHcsIGgsIHJ4LCByeSwgb3V0ZXJPZmZzZXQpO1xuICAgIGNvbnN0IGlubmVyUGF0aERhdGEgPSBjcmVhdGVJbm5lckN5bGluZGVyUGF0aEQyKDAsIHJ5LCB3LCBoLCByeCwgcnkpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gICAgY29uc3Qgb3V0ZXJOb2RlID0gcmMucGF0aChvdXRlclBhdGhEYXRhLCBvcHRpb25zKTtcbiAgICBjb25zdCBpbm5lckxpbmUgPSByYy5wYXRoKGlubmVyUGF0aERhdGEsIG9wdGlvbnMpO1xuICAgIGNvbnN0IGlubmVyTGluZUVsID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IGlubmVyTGluZSwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gICAgaW5uZXJMaW5lRWwuYXR0cihcImNsYXNzXCIsIFwibGluZVwiKTtcbiAgICBjeWxpbmRlcjIgPSBzaGFwZVN2Zy5pbnNlcnQoKCkgPT4gb3V0ZXJOb2RlLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgICBjeWxpbmRlcjIuYXR0cihcImNsYXNzXCIsIFwiYmFzaWMgbGFiZWwtY29udGFpbmVyXCIpO1xuICAgIGlmIChjc3NTdHlsZXMpIHtcbiAgICAgIGN5bGluZGVyMi5hdHRyKFwic3R5bGVcIiwgY3NzU3R5bGVzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgcGF0aERhdGEgPSBjcmVhdGVDeWxpbmRlclBhdGhEMigwLCAwLCB3LCBoLCByeCwgcnksIG91dGVyT2Zmc2V0KTtcbiAgICBjeWxpbmRlcjIgPSBzaGFwZVN2Zy5pbnNlcnQoXCJwYXRoXCIsIFwiOmZpcnN0LWNoaWxkXCIpLmF0dHIoXCJkXCIsIHBhdGhEYXRhKS5hdHRyKFwiY2xhc3NcIiwgXCJiYXNpYyBsYWJlbC1jb250YWluZXIgb3V0ZXItcGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgaGFuZGxlVW5kZWZpbmVkQXR0cihjc3NTdHlsZXMpKS5hdHRyKFwic3R5bGVcIiwgbm9kZVN0eWxlcyk7XG4gIH1cbiAgY3lsaW5kZXIyLmF0dHIoXCJsYWJlbC1vZmZzZXQteVwiLCByeSk7XG4gIGN5bGluZGVyMi5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHstdyAvIDJ9LCAkey0oaCAvIDIgKyByeSl9KWApO1xuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIGN5bGluZGVyMik7XG4gIGxhYmVsLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICBgdHJhbnNsYXRlKCR7LShiYm94LndpZHRoIC8gMikgLSAoYmJveC54IC0gKGJib3gubGVmdCA/PyAwKSl9LCAkey0oYmJveC5oZWlnaHQgLyAyKSArIHJ5IC0gKGJib3gueSAtIChiYm94LnRvcCA/PyAwKSl9KWBcbiAgKTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIGNvbnN0IHBvcyA9IGludGVyc2VjdF9kZWZhdWx0LnJlY3Qobm9kZSwgcG9pbnQpO1xuICAgIGNvbnN0IHggPSBwb3MueCAtIChub2RlLnggPz8gMCk7XG4gICAgaWYgKHJ4ICE9IDAgJiYgKE1hdGguYWJzKHgpIDwgKG5vZGUud2lkdGggPz8gMCkgLyAyIHx8IE1hdGguYWJzKHgpID09IChub2RlLndpZHRoID8/IDApIC8gMiAmJiBNYXRoLmFicyhwb3MueSAtIChub2RlLnkgPz8gMCkpID4gKG5vZGUuaGVpZ2h0ID8/IDApIC8gMiAtIHJ5KSkge1xuICAgICAgbGV0IHkgPSByeSAqIHJ5ICogKDEgLSB4ICogeCAvIChyeCAqIHJ4KSk7XG4gICAgICBpZiAoeSA+IDApIHtcbiAgICAgICAgeSA9IE1hdGguc3FydCh5KTtcbiAgICAgIH1cbiAgICAgIHkgPSByeSAtIHk7XG4gICAgICBpZiAocG9pbnQueSAtIChub2RlLnkgPz8gMCkgPiAwKSB7XG4gICAgICAgIHkgPSAteTtcbiAgICAgIH1cbiAgICAgIHBvcy55ICs9IHk7XG4gICAgfVxuICAgIHJldHVybiBwb3M7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZShsaW5lZEN5bGluZGVyLCBcImxpbmVkQ3lsaW5kZXJcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL2xpbmVkV2F2ZUVkZ2VkUmVjdC50c1xuaW1wb3J0IHJvdWdoMzMgZnJvbSBcInJvdWdoanNcIjtcbmFzeW5jIGZ1bmN0aW9uIGxpbmVkV2F2ZUVkZ2VkUmVjdChwYXJlbnQsIG5vZGUpIHtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcywgbm9kZVN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IG5vZGVQYWRkaW5nID0gbm9kZS5wYWRkaW5nID8/IDA7XG4gIGNvbnN0IGxhYmVsUGFkZGluZ1ggPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyAxNiA6IG5vZGVQYWRkaW5nO1xuICBjb25zdCBsYWJlbFBhZGRpbmdZID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gMTIgOiBub2RlUGFkZGluZztcbiAgaWYgKG5vZGUud2lkdGggfHwgbm9kZS5oZWlnaHQpIHtcbiAgICBjb25zdCBvcmlnaW5hbFdpZHRoID0gbm9kZS53aWR0aDtcbiAgICBub2RlLndpZHRoID0gKG9yaWdpbmFsV2lkdGggPz8gMCkgKiAxMCAvIDExIC0gbGFiZWxQYWRkaW5nWCAqIDI7XG4gICAgaWYgKG5vZGUud2lkdGggPCAxMCkge1xuICAgICAgbm9kZS53aWR0aCA9IDEwO1xuICAgIH1cbiAgICBub2RlLmhlaWdodCA9IChub2RlPy5oZWlnaHQgPz8gMCkgLSBsYWJlbFBhZGRpbmdZICogMjtcbiAgICBpZiAobm9kZS5oZWlnaHQgPCAxMCkge1xuICAgICAgbm9kZS5oZWlnaHQgPSAxMDtcbiAgICB9XG4gIH1cbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCwgbGFiZWwgfSA9IGF3YWl0IGxhYmVsSGVscGVyKHBhcmVudCwgbm9kZSwgZ2V0Tm9kZUNsYXNzZXMobm9kZSkpO1xuICBjb25zdCB3ID0gKG5vZGU/LndpZHRoID8gbm9kZT8ud2lkdGggOiBiYm94LndpZHRoKSArIChsYWJlbFBhZGRpbmdYID8/IDApICogMjtcbiAgY29uc3QgaCA9IChub2RlPy5oZWlnaHQgPyBub2RlPy5oZWlnaHQgOiBiYm94LmhlaWdodCkgKyAobGFiZWxQYWRkaW5nWSA/PyAwKSAqIDI7XG4gIGNvbnN0IHdhdmVBbXBsaXR1ZGUgPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyBoIC8gNCA6IGggLyA4O1xuICBjb25zdCBmaW5hbEggPSBoICsgd2F2ZUFtcGxpdHVkZTtcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGNvbnN0IHJjID0gcm91Z2gzMy5zdmcoc2hhcGVTdmcpO1xuICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwge30pO1xuICBpZiAobm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgb3B0aW9ucy5yb3VnaG5lc3MgPSAwO1xuICAgIG9wdGlvbnMuZmlsbFN0eWxlID0gXCJzb2xpZFwiO1xuICB9XG4gIGNvbnN0IHBvaW50cyA9IFtcbiAgICB7IHg6IC13IC8gMiAtIHcgLyAyICogMC4xLCB5OiAtZmluYWxIIC8gMiB9LFxuICAgIHsgeDogLXcgLyAyIC0gdyAvIDIgKiAwLjEsIHk6IGZpbmFsSCAvIDIgfSxcbiAgICAuLi5nZW5lcmF0ZUZ1bGxTaW5lV2F2ZVBvaW50cyhcbiAgICAgIC13IC8gMiAtIHcgLyAyICogMC4xLFxuICAgICAgZmluYWxIIC8gMixcbiAgICAgIHcgLyAyICsgdyAvIDIgKiAwLjEsXG4gICAgICBmaW5hbEggLyAyLFxuICAgICAgd2F2ZUFtcGxpdHVkZSxcbiAgICAgIDAuOFxuICAgICksXG4gICAgeyB4OiB3IC8gMiArIHcgLyAyICogMC4xLCB5OiAtZmluYWxIIC8gMiB9LFxuICAgIHsgeDogLXcgLyAyIC0gdyAvIDIgKiAwLjEsIHk6IC1maW5hbEggLyAyIH0sXG4gICAgeyB4OiAtdyAvIDIsIHk6IC1maW5hbEggLyAyIH0sXG4gICAgeyB4OiAtdyAvIDIsIHk6IGZpbmFsSCAvIDIgKiAxLjEgfSxcbiAgICB7IHg6IC13IC8gMiwgeTogLWZpbmFsSCAvIDIgfVxuICBdO1xuICBjb25zdCBwb2x5ID0gcmMucG9seWdvbihcbiAgICBwb2ludHMubWFwKChwKSA9PiBbcC54LCBwLnldKSxcbiAgICBvcHRpb25zXG4gICk7XG4gIGNvbnN0IHdhdmVFZGdlUmVjdCA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiBwb2x5LCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgd2F2ZUVkZ2VSZWN0LmF0dHIoXCJjbGFzc1wiLCBcImJhc2ljIGxhYmVsLWNvbnRhaW5lciBvdXRlci1wYXRoXCIpO1xuICBpZiAoY3NzU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIHdhdmVFZGdlUmVjdC5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBjc3NTdHlsZXMpO1xuICB9XG4gIGlmIChub2RlU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIHdhdmVFZGdlUmVjdC5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgfVxuICB3YXZlRWRnZVJlY3QuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKDAsJHstd2F2ZUFtcGxpdHVkZSAvIDJ9KWApO1xuICBsYWJlbC5hdHRyKFxuICAgIFwidHJhbnNmb3JtXCIsXG4gICAgYHRyYW5zbGF0ZSgkey13IC8gMiArIChub2RlLnBhZGRpbmcgPz8gMCkgKyB3IC8gMiAqIDAuMSAvIDIgLSAoYmJveC54IC0gKGJib3gubGVmdCA/PyAwKSl9LCR7LWggLyAyICsgKG5vZGUucGFkZGluZyA/PyAwKSAtIHdhdmVBbXBsaXR1ZGUgLyAyIC0gKGJib3gueSAtIChiYm94LnRvcCA/PyAwKSl9KWBcbiAgKTtcbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCB3YXZlRWRnZVJlY3QpO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgY29uc3QgcG9zID0gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihub2RlLCBwb2ludHMsIHBvaW50KTtcbiAgICByZXR1cm4gcG9zO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59XG5fX25hbWUobGluZWRXYXZlRWRnZWRSZWN0LCBcImxpbmVkV2F2ZUVkZ2VkUmVjdFwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvbXVsdGlSZWN0LnRzXG5pbXBvcnQgcm91Z2gzNCBmcm9tIFwicm91Z2hqc1wiO1xuYXN5bmMgZnVuY3Rpb24gbXVsdGlSZWN0KHBhcmVudCwgbm9kZSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3Qgbm9kZVBhZGRpbmcgPSBub2RlLnBhZGRpbmcgPz8gMDtcbiAgY29uc3QgbGFiZWxQYWRkaW5nWCA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IDE2IDogbm9kZVBhZGRpbmc7XG4gIGNvbnN0IGxhYmVsUGFkZGluZ1kgPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyAxMiA6IG5vZGVQYWRkaW5nO1xuICBjb25zdCByZWN0T2Zmc2V0MiA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IDEwIDogNTtcbiAgaWYgKG5vZGUud2lkdGggfHwgbm9kZS5oZWlnaHQpIHtcbiAgICBub2RlLndpZHRoID0gTWF0aC5tYXgoKG5vZGU/LndpZHRoID8/IDApIC0gbGFiZWxQYWRkaW5nWCAqIDIgLSAyICogcmVjdE9mZnNldDIsIDEwKTtcbiAgICBub2RlLmhlaWdodCA9IE1hdGgubWF4KChub2RlPy5oZWlnaHQgPz8gMCkgLSBsYWJlbFBhZGRpbmdZICogMiAtIDIgKiByZWN0T2Zmc2V0MiwgMTApO1xuICB9XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3gsIGxhYmVsIH0gPSBhd2FpdCBsYWJlbEhlbHBlcihwYXJlbnQsIG5vZGUsIGdldE5vZGVDbGFzc2VzKG5vZGUpKTtcbiAgY29uc3QgdG90YWxXaWR0aCA9IChub2RlPy53aWR0aCA/IG5vZGU/LndpZHRoIDogYmJveC53aWR0aCkgKyBsYWJlbFBhZGRpbmdYICogMiArIDIgKiByZWN0T2Zmc2V0MjtcbiAgY29uc3QgdG90YWxIZWlnaHQgPSAobm9kZT8uaGVpZ2h0ID8gbm9kZT8uaGVpZ2h0IDogYmJveC5oZWlnaHQpICsgbGFiZWxQYWRkaW5nWSAqIDIgKyAyICogcmVjdE9mZnNldDI7XG4gIGNvbnN0IHcgPSB0b3RhbFdpZHRoIC0gMiAqIHJlY3RPZmZzZXQyO1xuICBjb25zdCBoID0gdG90YWxIZWlnaHQgLSAyICogcmVjdE9mZnNldDI7XG4gIGNvbnN0IHggPSAtdyAvIDI7XG4gIGNvbnN0IHkgPSAtaCAvIDI7XG4gIGNvbnN0IHsgY3NzU3R5bGVzIH0gPSBub2RlO1xuICBjb25zdCByYyA9IHJvdWdoMzQuc3ZnKHNoYXBlU3ZnKTtcbiAgY29uc3Qgb3B0aW9ucyA9IHVzZXJOb2RlT3ZlcnJpZGVzKG5vZGUsIHt9KTtcbiAgY29uc3Qgb3V0ZXJQYXRoUG9pbnRzID0gW1xuICAgIHsgeDogeCAtIHJlY3RPZmZzZXQyLCB5OiB5ICsgcmVjdE9mZnNldDIgfSxcbiAgICB7IHg6IHggLSByZWN0T2Zmc2V0MiwgeTogeSArIGggKyByZWN0T2Zmc2V0MiB9LFxuICAgIHsgeDogeCArIHcgLSByZWN0T2Zmc2V0MiwgeTogeSArIGggKyByZWN0T2Zmc2V0MiB9LFxuICAgIHsgeDogeCArIHcgLSByZWN0T2Zmc2V0MiwgeTogeSArIGggfSxcbiAgICB7IHg6IHggKyB3LCB5OiB5ICsgaCB9LFxuICAgIHsgeDogeCArIHcsIHk6IHkgKyBoIC0gcmVjdE9mZnNldDIgfSxcbiAgICB7IHg6IHggKyB3ICsgcmVjdE9mZnNldDIsIHk6IHkgKyBoIC0gcmVjdE9mZnNldDIgfSxcbiAgICB7IHg6IHggKyB3ICsgcmVjdE9mZnNldDIsIHk6IHkgLSByZWN0T2Zmc2V0MiB9LFxuICAgIHsgeDogeCArIHJlY3RPZmZzZXQyLCB5OiB5IC0gcmVjdE9mZnNldDIgfSxcbiAgICB7IHg6IHggKyByZWN0T2Zmc2V0MiwgeSB9LFxuICAgIHsgeCwgeSB9LFxuICAgIHsgeCwgeTogeSArIHJlY3RPZmZzZXQyIH1cbiAgXTtcbiAgY29uc3QgaW5uZXJQYXRoUG9pbnRzID0gW1xuICAgIHsgeCwgeTogeSArIHJlY3RPZmZzZXQyIH0sXG4gICAgeyB4OiB4ICsgdyAtIHJlY3RPZmZzZXQyLCB5OiB5ICsgcmVjdE9mZnNldDIgfSxcbiAgICB7IHg6IHggKyB3IC0gcmVjdE9mZnNldDIsIHk6IHkgKyBoIH0sXG4gICAgeyB4OiB4ICsgdywgeTogeSArIGggfSxcbiAgICB7IHg6IHggKyB3LCB5IH0sXG4gICAgeyB4LCB5IH1cbiAgXTtcbiAgaWYgKG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIG9wdGlvbnMucm91Z2huZXNzID0gMDtcbiAgICBvcHRpb25zLmZpbGxTdHlsZSA9IFwic29saWRcIjtcbiAgfVxuICBjb25zdCBvdXRlclBhdGggPSBjcmVhdGVQYXRoRnJvbVBvaW50cyhvdXRlclBhdGhQb2ludHMpO1xuICBsZXQgb3V0ZXJOb2RlID0gcmMucGF0aChvdXRlclBhdGgsIG9wdGlvbnMpO1xuICBjb25zdCBpbm5lclBhdGggPSBjcmVhdGVQYXRoRnJvbVBvaW50cyhpbm5lclBhdGhQb2ludHMpO1xuICBsZXQgaW5uZXJOb2RlID0gcmMucGF0aChpbm5lclBhdGgsIG9wdGlvbnMpO1xuICBpZiAobm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgb3V0ZXJOb2RlID0gbWVyZ2VQYXRocyhvdXRlck5vZGUpO1xuICAgIGlubmVyTm9kZSA9IG1lcmdlUGF0aHMoaW5uZXJOb2RlKTtcbiAgfVxuICBjb25zdCBtdWx0aVJlY3QyID0gc2hhcGVTdmcuaW5zZXJ0KFwiZ1wiLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgbXVsdGlSZWN0Mi5pbnNlcnQoKCkgPT4gb3V0ZXJOb2RlKTtcbiAgbXVsdGlSZWN0Mi5pbnNlcnQoKCkgPT4gaW5uZXJOb2RlKTtcbiAgbXVsdGlSZWN0Mi5hdHRyKFwiY2xhc3NcIiwgXCJiYXNpYyBsYWJlbC1jb250YWluZXIgb3V0ZXItcGF0aFwiKTtcbiAgaWYgKGNzc1N0eWxlcyAmJiBub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBtdWx0aVJlY3QyLnNlbGVjdEFsbChcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIGNzc1N0eWxlcyk7XG4gIH1cbiAgaWYgKG5vZGVTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgbXVsdGlSZWN0Mi5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgfVxuICBsYWJlbC5hdHRyKFxuICAgIFwidHJhbnNmb3JtXCIsXG4gICAgYHRyYW5zbGF0ZSgkey0oYmJveC53aWR0aCAvIDIpIC0gcmVjdE9mZnNldDIgLSAoYmJveC54IC0gKGJib3gubGVmdCA/PyAwKSl9LCAkey0oYmJveC5oZWlnaHQgLyAyKSArIHJlY3RPZmZzZXQyIC0gKGJib3gueSAtIChiYm94LnRvcCA/PyAwKSl9KWBcbiAgKTtcbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCBtdWx0aVJlY3QyKTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIGNvbnN0IHBvcyA9IGludGVyc2VjdF9kZWZhdWx0LnBvbHlnb24obm9kZSwgb3V0ZXJQYXRoUG9pbnRzLCBwb2ludCk7XG4gICAgcmV0dXJuIHBvcztcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKG11bHRpUmVjdCwgXCJtdWx0aVJlY3RcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL211bHRpV2F2ZUVkZ2VkUmVjdGFuZ2xlLnRzXG5pbXBvcnQgcm91Z2gzNSBmcm9tIFwicm91Z2hqc1wiO1xuYXN5bmMgZnVuY3Rpb24gbXVsdGlXYXZlRWRnZWRSZWN0YW5nbGUocGFyZW50LCBub2RlKSB7XG4gIGNvbnN0IHsgbGFiZWxTdHlsZXMsIG5vZGVTdHlsZXMgfSA9IHN0eWxlczJTdHJpbmcobm9kZSk7XG4gIG5vZGUubGFiZWxTdHlsZSA9IGxhYmVsU3R5bGVzO1xuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94LCBsYWJlbCB9ID0gYXdhaXQgbGFiZWxIZWxwZXIocGFyZW50LCBub2RlLCBnZXROb2RlQ2xhc3Nlcyhub2RlKSk7XG4gIGNvbnN0IG5vZGVQYWRkaW5nID0gbm9kZS5wYWRkaW5nID8/IDA7XG4gIGNvbnN0IGxhYmVsUGFkZGluZ1ggPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyAxNiA6IG5vZGVQYWRkaW5nO1xuICBjb25zdCBsYWJlbFBhZGRpbmdZID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gMTIgOiBub2RlUGFkZGluZztcbiAgbGV0IGFkanVzdEZpbmFsSGVpZ2h0ID0gdHJ1ZTtcbiAgaWYgKG5vZGUud2lkdGggfHwgbm9kZS5oZWlnaHQpIHtcbiAgICBhZGp1c3RGaW5hbEhlaWdodCA9IGZhbHNlO1xuICAgIG5vZGUud2lkdGggPSAobm9kZT8ud2lkdGggPz8gMCkgLSBsYWJlbFBhZGRpbmdYICogMjtcbiAgICBub2RlLmhlaWdodCA9IChub2RlPy5oZWlnaHQgPz8gMCkgLSBsYWJlbFBhZGRpbmdZICogMztcbiAgfVxuICBjb25zdCB3ID0gTWF0aC5tYXgoYmJveC53aWR0aCwgbm9kZT8ud2lkdGggPz8gMCkgKyBsYWJlbFBhZGRpbmdYICogMjtcbiAgY29uc3QgaCA9IE1hdGgubWF4KGJib3guaGVpZ2h0LCBub2RlPy5oZWlnaHQgPz8gMCkgKyBsYWJlbFBhZGRpbmdZICogMztcbiAgY29uc3Qgd2F2ZUFtcGxpdHVkZSA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IGggLyA0IDogaCAvIDg7XG4gIGNvbnN0IGZpbmFsSCA9IGggKyAoYWRqdXN0RmluYWxIZWlnaHQgPyB3YXZlQW1wbGl0dWRlIC8gMiA6IC13YXZlQW1wbGl0dWRlIC8gMik7XG4gIGNvbnN0IHggPSAtdyAvIDI7XG4gIGNvbnN0IHkgPSAtZmluYWxIIC8gMjtcbiAgY29uc3QgcmVjdE9mZnNldDIgPSAxMDtcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGNvbnN0IHdhdmVQb2ludHMgPSBnZW5lcmF0ZUZ1bGxTaW5lV2F2ZVBvaW50cyhcbiAgICB4IC0gcmVjdE9mZnNldDIsXG4gICAgeSArIGZpbmFsSCArIHJlY3RPZmZzZXQyLFxuICAgIHggKyB3IC0gcmVjdE9mZnNldDIsXG4gICAgeSArIGZpbmFsSCArIHJlY3RPZmZzZXQyLFxuICAgIHdhdmVBbXBsaXR1ZGUsXG4gICAgMC44XG4gICk7XG4gIGNvbnN0IGxhc3RXYXZlUG9pbnQgPSB3YXZlUG9pbnRzPy5bd2F2ZVBvaW50cy5sZW5ndGggLSAxXTtcbiAgY29uc3Qgb3V0ZXJQYXRoUG9pbnRzID0gW1xuICAgIHsgeDogeCAtIHJlY3RPZmZzZXQyLCB5OiB5ICsgcmVjdE9mZnNldDIgfSxcbiAgICB7IHg6IHggLSByZWN0T2Zmc2V0MiwgeTogeSArIGZpbmFsSCArIHJlY3RPZmZzZXQyIH0sXG4gICAgLi4ud2F2ZVBvaW50cyxcbiAgICB7IHg6IHggKyB3IC0gcmVjdE9mZnNldDIsIHk6IGxhc3RXYXZlUG9pbnQueSAtIHJlY3RPZmZzZXQyIH0sXG4gICAgeyB4OiB4ICsgdywgeTogbGFzdFdhdmVQb2ludC55IC0gcmVjdE9mZnNldDIgfSxcbiAgICB7IHg6IHggKyB3LCB5OiBsYXN0V2F2ZVBvaW50LnkgLSAyICogcmVjdE9mZnNldDIgfSxcbiAgICB7IHg6IHggKyB3ICsgcmVjdE9mZnNldDIsIHk6IGxhc3RXYXZlUG9pbnQueSAtIDIgKiByZWN0T2Zmc2V0MiB9LFxuICAgIHsgeDogeCArIHcgKyByZWN0T2Zmc2V0MiwgeTogeSAtIHJlY3RPZmZzZXQyIH0sXG4gICAgeyB4OiB4ICsgcmVjdE9mZnNldDIsIHk6IHkgLSByZWN0T2Zmc2V0MiB9LFxuICAgIHsgeDogeCArIHJlY3RPZmZzZXQyLCB5IH0sXG4gICAgeyB4LCB5IH0sXG4gICAgeyB4LCB5OiB5ICsgcmVjdE9mZnNldDIgfVxuICBdO1xuICBjb25zdCBpbm5lclBhdGhQb2ludHMgPSBbXG4gICAgeyB4LCB5OiB5ICsgcmVjdE9mZnNldDIgfSxcbiAgICB7IHg6IHggKyB3IC0gcmVjdE9mZnNldDIsIHk6IHkgKyByZWN0T2Zmc2V0MiB9LFxuICAgIHsgeDogeCArIHcgLSByZWN0T2Zmc2V0MiwgeTogbGFzdFdhdmVQb2ludC55IC0gcmVjdE9mZnNldDIgfSxcbiAgICB7IHg6IHggKyB3LCB5OiBsYXN0V2F2ZVBvaW50LnkgLSByZWN0T2Zmc2V0MiB9LFxuICAgIHsgeDogeCArIHcsIHkgfSxcbiAgICB7IHgsIHkgfVxuICBdO1xuICBjb25zdCByYyA9IHJvdWdoMzUuc3ZnKHNoYXBlU3ZnKTtcbiAgY29uc3Qgb3B0aW9ucyA9IHVzZXJOb2RlT3ZlcnJpZGVzKG5vZGUsIHt9KTtcbiAgaWYgKG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIG9wdGlvbnMucm91Z2huZXNzID0gMDtcbiAgICBvcHRpb25zLmZpbGxTdHlsZSA9IFwic29saWRcIjtcbiAgfVxuICBjb25zdCBvdXRlclBhdGggPSBjcmVhdGVQYXRoRnJvbVBvaW50cyhvdXRlclBhdGhQb2ludHMpO1xuICBjb25zdCBvdXRlck5vZGUgPSByYy5wYXRoKG91dGVyUGF0aCwgb3B0aW9ucyk7XG4gIGNvbnN0IGlubmVyUGF0aCA9IGNyZWF0ZVBhdGhGcm9tUG9pbnRzKGlubmVyUGF0aFBvaW50cyk7XG4gIGNvbnN0IGlubmVyTm9kZSA9IHJjLnBhdGgoaW5uZXJQYXRoLCBvcHRpb25zKTtcbiAgY29uc3Qgc2hhcGUgPSBzaGFwZVN2Zy5pbnNlcnQoKCkgPT4gb3V0ZXJOb2RlLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgc2hhcGUuaW5zZXJ0KCgpID0+IGlubmVyTm9kZSk7XG4gIHNoYXBlLmF0dHIoXCJjbGFzc1wiLCBcImJhc2ljIGxhYmVsLWNvbnRhaW5lciBvdXRlci1wYXRoXCIpO1xuICBpZiAoY3NzU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIHNoYXBlLnNlbGVjdEFsbChcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIGNzc1N0eWxlcyk7XG4gIH1cbiAgaWYgKG5vZGVTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgc2hhcGUuc2VsZWN0QWxsKFwicGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgbm9kZVN0eWxlcyk7XG4gIH1cbiAgc2hhcGUuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKDAsJHstd2F2ZUFtcGxpdHVkZSAvIDJ9KWApO1xuICBsYWJlbC5hdHRyKFxuICAgIFwidHJhbnNmb3JtXCIsXG4gICAgYHRyYW5zbGF0ZSgkey0oYmJveC53aWR0aCAvIDIpIC0gcmVjdE9mZnNldDIgLSAoYmJveC54IC0gKGJib3gubGVmdCA/PyAwKSl9LCAkey0oYmJveC5oZWlnaHQgLyAyKSArIHJlY3RPZmZzZXQyIC0gd2F2ZUFtcGxpdHVkZSAvIDIgLSAoYmJveC55IC0gKGJib3gudG9wID8/IDApKX0pYFxuICApO1xuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIHNoYXBlKTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIGNvbnN0IHBvcyA9IGludGVyc2VjdF9kZWZhdWx0LnBvbHlnb24obm9kZSwgb3V0ZXJQYXRoUG9pbnRzLCBwb2ludCk7XG4gICAgcmV0dXJuIHBvcztcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKG11bHRpV2F2ZUVkZ2VkUmVjdGFuZ2xlLCBcIm11bHRpV2F2ZUVkZ2VkUmVjdGFuZ2xlXCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy9ub3RlLnRzXG5pbXBvcnQgcm91Z2gzNiBmcm9tIFwicm91Z2hqc1wiO1xuYXN5bmMgZnVuY3Rpb24gbm90ZShwYXJlbnQsIG5vZGUsIHsgY29uZmlnOiB7IHRoZW1lVmFyaWFibGVzIH0gfSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3QgdXNlSHRtbExhYmVscyA9IG5vZGUudXNlSHRtbExhYmVscyB8fCBnZXRFZmZlY3RpdmVIdG1sTGFiZWxzKGdldENvbmZpZygpKTtcbiAgaWYgKCF1c2VIdG1sTGFiZWxzKSB7XG4gICAgbm9kZS5jZW50ZXJMYWJlbCA9IHRydWU7XG4gIH1cbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCwgbGFiZWwgfSA9IGF3YWl0IGxhYmVsSGVscGVyKHBhcmVudCwgbm9kZSwgZ2V0Tm9kZUNsYXNzZXMobm9kZSkpO1xuICBjb25zdCB0b3RhbFdpZHRoID0gTWF0aC5tYXgoYmJveC53aWR0aCArIChub2RlLnBhZGRpbmcgPz8gMCkgKiAyLCBub2RlPy53aWR0aCA/PyAwKTtcbiAgY29uc3QgdG90YWxIZWlnaHQgPSBNYXRoLm1heChiYm94LmhlaWdodCArIChub2RlLnBhZGRpbmcgPz8gMCkgKiAyLCBub2RlPy5oZWlnaHQgPz8gMCk7XG4gIGNvbnN0IHggPSAtdG90YWxXaWR0aCAvIDI7XG4gIGNvbnN0IHkgPSAtdG90YWxIZWlnaHQgLyAyO1xuICBjb25zdCB7IGNzc1N0eWxlcyB9ID0gbm9kZTtcbiAgY29uc3QgcmMgPSByb3VnaDM2LnN2ZyhzaGFwZVN2Zyk7XG4gIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7XG4gICAgZmlsbDogdGhlbWVWYXJpYWJsZXMubm90ZUJrZ0NvbG9yLFxuICAgIHN0cm9rZTogdGhlbWVWYXJpYWJsZXMubm90ZUJvcmRlckNvbG9yXG4gIH0pO1xuICBpZiAobm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgb3B0aW9ucy5yb3VnaG5lc3MgPSAwO1xuICAgIG9wdGlvbnMuZmlsbFN0eWxlID0gXCJzb2xpZFwiO1xuICB9XG4gIGNvbnN0IG5vdGVTaGFwZU5vZGUgPSByYy5yZWN0YW5nbGUoeCwgeSwgdG90YWxXaWR0aCwgdG90YWxIZWlnaHQsIG9wdGlvbnMpO1xuICBjb25zdCByZWN0MiA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiBub3RlU2hhcGVOb2RlLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgcmVjdDIuYXR0cihcImNsYXNzXCIsIFwiYmFzaWMgbGFiZWwtY29udGFpbmVyIG91dGVyLXBhdGhcIik7XG4gIGxhYmVsLmF0dHIoXCJjbGFzc1wiLCBcImxhYmVsIG5vdGVMYWJlbFwiKTtcbiAgaWYgKGNzc1N0eWxlcyAmJiBub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICByZWN0Mi5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBjc3NTdHlsZXMpO1xuICB9XG4gIGlmIChub2RlU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIHJlY3QyLnNlbGVjdEFsbChcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIG5vZGVTdHlsZXMpO1xuICB9XG4gIGxhYmVsLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICBgdHJhbnNsYXRlKCR7LWJib3gud2lkdGggLyAyIC0gKGJib3gueCAtIChiYm94LmxlZnQgPz8gMCkpfSwgJHstKGJib3guaGVpZ2h0IC8gMikgLSAoYmJveC55IC0gKGJib3gudG9wID8/IDApKX0pYFxuICApO1xuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIHJlY3QyKTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiBpbnRlcnNlY3RfZGVmYXVsdC5yZWN0KG5vZGUsIHBvaW50KTtcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKG5vdGUsIFwibm90ZVwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvcXVlc3Rpb24udHNcbmltcG9ydCByb3VnaDM3IGZyb20gXCJyb3VnaGpzXCI7XG52YXIgY3JlYXRlRGVjaXNpb25Cb3hQYXRoRCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHgsIHksIHNpemUpID0+IHtcbiAgcmV0dXJuIFtcbiAgICBgTSR7eCArIHNpemUgLyAyfSwke3l9YCxcbiAgICBgTCR7eCArIHNpemV9LCR7eSAtIHNpemUgLyAyfWAsXG4gICAgYEwke3ggKyBzaXplIC8gMn0sJHt5IC0gc2l6ZX1gLFxuICAgIGBMJHt4fSwke3kgLSBzaXplIC8gMn1gLFxuICAgIFwiWlwiXG4gIF0uam9pbihcIiBcIik7XG59LCBcImNyZWF0ZURlY2lzaW9uQm94UGF0aERcIik7XG5hc3luYyBmdW5jdGlvbiBxdWVzdGlvbihwYXJlbnQsIG5vZGUpIHtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcywgbm9kZVN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3ggfSA9IGF3YWl0IGxhYmVsSGVscGVyKHBhcmVudCwgbm9kZSwgZ2V0Tm9kZUNsYXNzZXMobm9kZSkpO1xuICBjb25zdCB3ID0gYmJveC53aWR0aCArIChub2RlLnBhZGRpbmcgPz8gMCk7XG4gIGNvbnN0IGggPSBiYm94LmhlaWdodCArIChub2RlLnBhZGRpbmcgPz8gMCk7XG4gIGNvbnN0IHMgPSB3ICsgaDtcbiAgY29uc3QgYWRqdXN0bWVudCA9IDAuNTtcbiAgY29uc3QgcG9pbnRzID0gW1xuICAgIHsgeDogcyAvIDIsIHk6IDAgfSxcbiAgICB7IHg6IHMsIHk6IC1zIC8gMiB9LFxuICAgIHsgeDogcyAvIDIsIHk6IC1zIH0sXG4gICAgeyB4OiAwLCB5OiAtcyAvIDIgfVxuICBdO1xuICBsZXQgcG9seWdvbjtcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGlmIChub2RlLmxvb2sgPT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBjb25zdCByYyA9IHJvdWdoMzcuc3ZnKHNoYXBlU3ZnKTtcbiAgICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwge30pO1xuICAgIGNvbnN0IHBhdGhEYXRhID0gY3JlYXRlRGVjaXNpb25Cb3hQYXRoRCgwLCAwLCBzKTtcbiAgICBjb25zdCByb3VnaE5vZGUgPSByYy5wYXRoKHBhdGhEYXRhLCBvcHRpb25zKTtcbiAgICBwb2x5Z29uID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHJvdWdoTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIikuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7LXMgLyAyICsgYWRqdXN0bWVudH0sICR7cyAvIDJ9KWApO1xuICAgIGlmIChjc3NTdHlsZXMpIHtcbiAgICAgIHBvbHlnb24uYXR0cihcInN0eWxlXCIsIGNzc1N0eWxlcyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHBvbHlnb24gPSBpbnNlcnRQb2x5Z29uU2hhcGUoc2hhcGVTdmcsIHMsIHMsIHBvaW50cyk7XG4gICAgcG9seWdvbi5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHstcyAvIDIgKyBhZGp1c3RtZW50fSwgJHtzIC8gMn0pYCk7XG4gIH1cbiAgaWYgKG5vZGVTdHlsZXMpIHtcbiAgICBwb2x5Z29uLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgfVxuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIHBvbHlnb24pO1xuICBub2RlLmNhbGNJbnRlcnNlY3QgPSBmdW5jdGlvbihib3VuZHMsIHBvaW50KSB7XG4gICAgY29uc3QgczIgPSBib3VuZHMud2lkdGg7XG4gICAgY29uc3QgcG9pbnRzMiA9IFtcbiAgICAgIHsgeDogczIgLyAyLCB5OiAwIH0sXG4gICAgICB7IHg6IHMyLCB5OiAtczIgLyAyIH0sXG4gICAgICB7IHg6IHMyIC8gMiwgeTogLXMyIH0sXG4gICAgICB7IHg6IDAsIHk6IC1zMiAvIDIgfVxuICAgIF07XG4gICAgY29uc3QgcmVzID0gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihib3VuZHMsIHBvaW50czIsIHBvaW50KTtcbiAgICByZXR1cm4geyB4OiByZXMueCAtIDAuNSwgeTogcmVzLnkgLSAwLjUgfTtcbiAgfTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiB0aGlzLmNhbGNJbnRlcnNlY3Qobm9kZSwgcG9pbnQpO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59XG5fX25hbWUocXVlc3Rpb24sIFwicXVlc3Rpb25cIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL3JlY3RMZWZ0SW52QXJyb3cudHNcbmltcG9ydCByb3VnaDM4IGZyb20gXCJyb3VnaGpzXCI7XG5hc3luYyBmdW5jdGlvbiByZWN0X2xlZnRfaW52X2Fycm93KHBhcmVudCwgbm9kZSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3Qgbm9kZVBhZGRpbmcgPSBub2RlLnBhZGRpbmcgPz8gMDtcbiAgY29uc3QgbGFiZWxQYWRkaW5nWCA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IDIxIDogbm9kZVBhZGRpbmcgPz8gMDtcbiAgY29uc3QgbGFiZWxQYWRkaW5nWSA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IDEyIDogbm9kZVBhZGRpbmcgPz8gMDtcbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCwgbGFiZWwgfSA9IGF3YWl0IGxhYmVsSGVscGVyKHBhcmVudCwgbm9kZSwgZ2V0Tm9kZUNsYXNzZXMobm9kZSkpO1xuICBjb25zdCB3ID0gKG5vZGU/LndpZHRoID8/IGJib3gud2lkdGgpICsgKG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IGxhYmVsUGFkZGluZ1ggKiAyIDogbGFiZWxQYWRkaW5nWCk7XG4gIGNvbnN0IGggPSAobm9kZT8uaGVpZ2h0ID8/IGJib3guaGVpZ2h0KSArIChub2RlLmxvb2sgPT09IFwibmVvXCIgPyBsYWJlbFBhZGRpbmdZICogMiA6IGxhYmVsUGFkZGluZ1kpO1xuICBjb25zdCB4ID0gLXcgLyAyO1xuICBjb25zdCB5ID0gLWggLyAyO1xuICBjb25zdCBub3RjaCA9IHkgLyAyO1xuICBjb25zdCBwb2ludHMgPSBbXG4gICAgeyB4OiB4ICsgbm90Y2gsIHkgfSxcbiAgICB7IHgsIHk6IDAgfSxcbiAgICB7IHg6IHggKyBub3RjaCwgeTogLXkgfSxcbiAgICB7IHg6IC14LCB5OiAteSB9LFxuICAgIHsgeDogLXgsIHkgfVxuICBdO1xuICBjb25zdCB7IGNzc1N0eWxlcyB9ID0gbm9kZTtcbiAgY29uc3QgcmMgPSByb3VnaDM4LnN2ZyhzaGFwZVN2Zyk7XG4gIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gIGlmIChub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBvcHRpb25zLnJvdWdobmVzcyA9IDA7XG4gICAgb3B0aW9ucy5maWxsU3R5bGUgPSBcInNvbGlkXCI7XG4gIH1cbiAgY29uc3QgcGF0aERhdGEgPSBjcmVhdGVQYXRoRnJvbVBvaW50cyhwb2ludHMpO1xuICBjb25zdCByb3VnaE5vZGUgPSByYy5wYXRoKHBhdGhEYXRhLCBvcHRpb25zKTtcbiAgY29uc3QgcG9seWdvbiA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiByb3VnaE5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICBwb2x5Z29uLmF0dHIoXCJjbGFzc1wiLCBcImJhc2ljIGxhYmVsLWNvbnRhaW5lciBvdXRlci1wYXRoXCIpO1xuICBpZiAoY3NzU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIHBvbHlnb24uc2VsZWN0QWxsKFwicGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgY3NzU3R5bGVzKTtcbiAgfVxuICBpZiAobm9kZVN0eWxlcyAmJiBub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBwb2x5Z29uLnNlbGVjdEFsbChcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIG5vZGVTdHlsZXMpO1xuICB9XG4gIHBvbHlnb24uYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7LW5vdGNoIC8gMn0sMClgKTtcbiAgbGFiZWwuYXR0cihcbiAgICBcInRyYW5zZm9ybVwiLFxuICAgIGB0cmFuc2xhdGUoJHstbm90Y2ggLyAyIC0gYmJveC53aWR0aCAvIDIgLSAoYmJveC54IC0gKGJib3gubGVmdCA/PyAwKSl9LCAkey0oYmJveC5oZWlnaHQgLyAyKSAtIChiYm94LnkgLSAoYmJveC50b3AgPz8gMCkpfSlgXG4gICk7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgcG9seWdvbik7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihub2RlLCBwb2ludHMsIHBvaW50KTtcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKHJlY3RfbGVmdF9pbnZfYXJyb3csIFwicmVjdF9sZWZ0X2ludl9hcnJvd1wiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvcmVjdFdpdGhUaXRsZS50c1xuaW1wb3J0IHsgc2VsZWN0IGFzIHNlbGVjdDMgfSBmcm9tIFwiZDNcIjtcbmltcG9ydCByb3VnaDM5IGZyb20gXCJyb3VnaGpzXCI7XG5hc3luYyBmdW5jdGlvbiByZWN0V2l0aFRpdGxlKHBhcmVudCwgbm9kZSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgbGV0IGNsYXNzZXM7XG4gIGlmICghbm9kZS5jc3NDbGFzc2VzKSB7XG4gICAgY2xhc3NlcyA9IFwibm9kZSBkZWZhdWx0XCI7XG4gIH0gZWxzZSB7XG4gICAgY2xhc3NlcyA9IFwibm9kZSBcIiArIG5vZGUuY3NzQ2xhc3NlcztcbiAgfVxuICBjb25zdCBzaGFwZVN2ZyA9IHBhcmVudC5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBjbGFzc2VzKS5hdHRyKFwiaWRcIiwgbm9kZS5kb21JZCB8fCBub2RlLmlkKTtcbiAgY29uc3QgZyA9IHNoYXBlU3ZnLmluc2VydChcImdcIik7XG4gIGNvbnN0IGxhYmVsID0gc2hhcGVTdmcuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJsYWJlbFwiKS5hdHRyKFwic3R5bGVcIiwgbm9kZVN0eWxlcyk7XG4gIGNvbnN0IGRlc2NyaXB0aW9uID0gbm9kZS5kZXNjcmlwdGlvbjtcbiAgY29uc3QgdGl0bGUgPSBub2RlLmxhYmVsO1xuICBjb25zdCB0ZXh0MiA9IGF3YWl0IGNyZWF0ZUxhYmVsX2RlZmF1bHQobGFiZWwsIHRpdGxlLCBub2RlLmxhYmVsU3R5bGUsIHRydWUsIHRydWUpO1xuICBsZXQgYmJveCA9IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9O1xuICBpZiAoZ2V0RWZmZWN0aXZlSHRtbExhYmVscyhnZXRDb25maWcyKCkpKSB7XG4gICAgY29uc3QgZGl2MiA9IHRleHQyLmNoaWxkcmVuWzBdO1xuICAgIGNvbnN0IGR2MiA9IHNlbGVjdDModGV4dDIpO1xuICAgIGJib3ggPSBkaXYyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGR2Mi5hdHRyKFwid2lkdGhcIiwgYmJveC53aWR0aCk7XG4gICAgZHYyLmF0dHIoXCJoZWlnaHRcIiwgYmJveC5oZWlnaHQpO1xuICB9XG4gIGxvZy5pbmZvKFwiVGV4dCAyXCIsIGRlc2NyaXB0aW9uKTtcbiAgY29uc3QgdGV4dFJvd3MgPSBkZXNjcmlwdGlvbiB8fCBbXTtcbiAgY29uc3QgdGl0bGVCb3ggPSB0ZXh0Mi5nZXRCQm94KCk7XG4gIGNvbnN0IGRlc2NyID0gYXdhaXQgY3JlYXRlTGFiZWxfZGVmYXVsdChcbiAgICBsYWJlbCxcbiAgICBBcnJheS5pc0FycmF5KHRleHRSb3dzKSA/IHRleHRSb3dzLmpvaW4oXCI8YnIvPlwiKSA6IHRleHRSb3dzLFxuICAgIG5vZGUubGFiZWxTdHlsZSxcbiAgICB0cnVlLFxuICAgIHRydWVcbiAgKTtcbiAgY29uc3QgZGl2ID0gZGVzY3IuY2hpbGRyZW5bMF07XG4gIGNvbnN0IGR2ID0gc2VsZWN0MyhkZXNjcik7XG4gIGJib3ggPSBkaXYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIGR2LmF0dHIoXCJ3aWR0aFwiLCBiYm94LndpZHRoKTtcbiAgZHYuYXR0cihcImhlaWdodFwiLCBiYm94LmhlaWdodCk7XG4gIGNvbnN0IGhhbGZQYWRkaW5nID0gKG5vZGUucGFkZGluZyB8fCAwKSAvIDI7XG4gIHNlbGVjdDMoZGVzY3IpLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICBcInRyYW5zbGF0ZSggXCIgKyAoYmJveC53aWR0aCA+IHRpdGxlQm94LndpZHRoID8gMCA6ICh0aXRsZUJveC53aWR0aCAtIGJib3gud2lkdGgpIC8gMikgKyBcIiwgXCIgKyAodGl0bGVCb3guaGVpZ2h0ICsgaGFsZlBhZGRpbmcgKyA1KSArIFwiKVwiXG4gICk7XG4gIHNlbGVjdDModGV4dDIpLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICBcInRyYW5zbGF0ZSggXCIgKyAoYmJveC53aWR0aCA8IHRpdGxlQm94LndpZHRoID8gMCA6IC0odGl0bGVCb3gud2lkdGggLSBiYm94LndpZHRoKSAvIDIpICsgXCIsIDApXCJcbiAgKTtcbiAgYmJveCA9IGxhYmVsLm5vZGUoKS5nZXRCQm94KCk7XG4gIGxhYmVsLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICBcInRyYW5zbGF0ZShcIiArIC1iYm94LndpZHRoIC8gMiArIFwiLCBcIiArICgtYmJveC5oZWlnaHQgLyAyIC0gaGFsZlBhZGRpbmcgKyAzKSArIFwiKVwiXG4gICk7XG4gIGNvbnN0IHRvdGFsV2lkdGggPSBiYm94LndpZHRoICsgKG5vZGUucGFkZGluZyB8fCAwKTtcbiAgY29uc3QgdG90YWxIZWlnaHQgPSBiYm94LmhlaWdodCArIChub2RlLnBhZGRpbmcgfHwgMCk7XG4gIGNvbnN0IHggPSAtYmJveC53aWR0aCAvIDIgLSBoYWxmUGFkZGluZztcbiAgY29uc3QgeSA9IC1iYm94LmhlaWdodCAvIDIgLSBoYWxmUGFkZGluZztcbiAgbGV0IHJlY3QyO1xuICBsZXQgaW5uZXJMaW5lO1xuICBpZiAobm9kZS5sb29rID09PSBcImhhbmREcmF3blwiKSB7XG4gICAgY29uc3QgcmMgPSByb3VnaDM5LnN2ZyhzaGFwZVN2Zyk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHVzZXJOb2RlT3ZlcnJpZGVzKG5vZGUsIHt9KTtcbiAgICBjb25zdCByb3VnaE5vZGUgPSByYy5wYXRoKFxuICAgICAgY3JlYXRlUm91bmRlZFJlY3RQYXRoRCh4LCB5LCB0b3RhbFdpZHRoLCB0b3RhbEhlaWdodCwgbm9kZS5yeCB8fCAwKSxcbiAgICAgIG9wdGlvbnNcbiAgICApO1xuICAgIGNvbnN0IHJvdWdoTGluZSA9IHJjLmxpbmUoXG4gICAgICAtYmJveC53aWR0aCAvIDIgLSBoYWxmUGFkZGluZyxcbiAgICAgIC1iYm94LmhlaWdodCAvIDIgLSBoYWxmUGFkZGluZyArIHRpdGxlQm94LmhlaWdodCArIGhhbGZQYWRkaW5nLFxuICAgICAgYmJveC53aWR0aCAvIDIgKyBoYWxmUGFkZGluZyxcbiAgICAgIC1iYm94LmhlaWdodCAvIDIgLSBoYWxmUGFkZGluZyArIHRpdGxlQm94LmhlaWdodCArIGhhbGZQYWRkaW5nLFxuICAgICAgb3B0aW9uc1xuICAgICk7XG4gICAgaW5uZXJMaW5lID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHtcbiAgICAgIGxvZy5kZWJ1ZyhcIlJvdWdoIG5vZGUgaW5zZXJ0IENYQ1wiLCByb3VnaE5vZGUpO1xuICAgICAgcmV0dXJuIHJvdWdoTGluZTtcbiAgICB9LCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgICByZWN0MiA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiB7XG4gICAgICBsb2cuZGVidWcoXCJSb3VnaCBub2RlIGluc2VydCBDWENcIiwgcm91Z2hOb2RlKTtcbiAgICAgIHJldHVybiByb3VnaE5vZGU7XG4gICAgfSwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gIH0gZWxzZSB7XG4gICAgcmVjdDIgPSBnLmluc2VydChcInJlY3RcIiwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gICAgaW5uZXJMaW5lID0gZy5pbnNlcnQoXCJsaW5lXCIpO1xuICAgIHJlY3QyLmF0dHIoXCJjbGFzc1wiLCBcIm91dGVyIHRpdGxlLXN0YXRlXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKS5hdHRyKFwieFwiLCAtYmJveC53aWR0aCAvIDIgLSBoYWxmUGFkZGluZykuYXR0cihcInlcIiwgLWJib3guaGVpZ2h0IC8gMiAtIGhhbGZQYWRkaW5nKS5hdHRyKFwid2lkdGhcIiwgYmJveC53aWR0aCArIChub2RlLnBhZGRpbmcgfHwgMCkpLmF0dHIoXCJoZWlnaHRcIiwgYmJveC5oZWlnaHQgKyAobm9kZS5wYWRkaW5nIHx8IDApKTtcbiAgICBpbm5lckxpbmUuYXR0cihcImNsYXNzXCIsIFwiZGl2aWRlclwiKS5hdHRyKFwieDFcIiwgLWJib3gud2lkdGggLyAyIC0gaGFsZlBhZGRpbmcpLmF0dHIoXCJ4MlwiLCBiYm94LndpZHRoIC8gMiArIGhhbGZQYWRkaW5nKS5hdHRyKFwieTFcIiwgLWJib3guaGVpZ2h0IC8gMiAtIGhhbGZQYWRkaW5nICsgdGl0bGVCb3guaGVpZ2h0ICsgaGFsZlBhZGRpbmcpLmF0dHIoXCJ5MlwiLCAtYmJveC5oZWlnaHQgLyAyIC0gaGFsZlBhZGRpbmcgKyB0aXRsZUJveC5oZWlnaHQgKyBoYWxmUGFkZGluZyk7XG4gIH1cbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCByZWN0Mik7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucmVjdChub2RlLCBwb2ludCk7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZShyZWN0V2l0aFRpdGxlLCBcInJlY3RXaXRoVGl0bGVcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL3JvdW5kZWRSZWN0LnRzXG5hc3luYyBmdW5jdGlvbiByb3VuZGVkUmVjdChwYXJlbnQsIG5vZGUsIHsgY29uZmlnOiB7IHRoZW1lVmFyaWFibGVzIH0gfSkge1xuICBjb25zdCByYWRpdXMgPSB0aGVtZVZhcmlhYmxlcz8ucmFkaXVzID8/IDU7XG4gIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgcng6IHJhZGl1cyxcbiAgICByeTogcmFkaXVzLFxuICAgIGNsYXNzZXM6IFwiXCIsXG4gICAgbGFiZWxQYWRkaW5nWDogKG5vZGU/LnBhZGRpbmcgPz8gMCkgKiAxLFxuICAgIGxhYmVsUGFkZGluZ1k6IChub2RlPy5wYWRkaW5nID8/IDApICogMVxuICB9O1xuICByZXR1cm4gZHJhd1JlY3QocGFyZW50LCBub2RlLCBvcHRpb25zKTtcbn1cbl9fbmFtZShyb3VuZGVkUmVjdCwgXCJyb3VuZGVkUmVjdFwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvc2hhZGVkUHJvY2Vzcy50c1xuaW1wb3J0IHJvdWdoNDAgZnJvbSBcInJvdWdoanNcIjtcbnZhciBGUkFNRV9XSURUSCA9IDg7XG5hc3luYyBmdW5jdGlvbiBzaGFkZWRQcm9jZXNzKHBhcmVudCwgbm9kZSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3QgcGFkZGluZ1ggPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyAxNiA6IG5vZGUucGFkZGluZyA/PyAwO1xuICBjb25zdCBwYWRkaW5nWSA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IDEyIDogbm9kZS5wYWRkaW5nID8/IDA7XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3gsIGxhYmVsIH0gPSBhd2FpdCBsYWJlbEhlbHBlcihwYXJlbnQsIG5vZGUsIGdldE5vZGVDbGFzc2VzKG5vZGUpKTtcbiAgY29uc3QgdG90YWxXaWR0aCA9IChub2RlPy53aWR0aCA/PyBiYm94LndpZHRoKSArIHBhZGRpbmdYICogMiArIChub2RlLmxvb2sgPT09IFwibmVvXCIgPyBGUkFNRV9XSURUSCA6IEZSQU1FX1dJRFRIICogMik7XG4gIGNvbnN0IHRvdGFsSGVpZ2h0ID0gKG5vZGU/LmhlaWdodCA/PyBiYm94LmhlaWdodCkgKyBwYWRkaW5nWSAqIDI7XG4gIGNvbnN0IHcgPSB0b3RhbFdpZHRoIC0gRlJBTUVfV0lEVEg7XG4gIGNvbnN0IGggPSB0b3RhbEhlaWdodDtcbiAgY29uc3QgeCA9IEZSQU1FX1dJRFRIIC0gdG90YWxXaWR0aCAvIDI7XG4gIGNvbnN0IHkgPSAtdG90YWxIZWlnaHQgLyAyO1xuICBjb25zdCB7IGNzc1N0eWxlcyB9ID0gbm9kZTtcbiAgY29uc3QgcmMgPSByb3VnaDQwLnN2ZyhzaGFwZVN2Zyk7XG4gIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gIGlmIChub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBvcHRpb25zLnJvdWdobmVzcyA9IDA7XG4gICAgb3B0aW9ucy5maWxsU3R5bGUgPSBcInNvbGlkXCI7XG4gIH1cbiAgY29uc3QgcG9pbnRzID0gW1xuICAgIHsgeCwgeSB9LFxuICAgIHsgeDogeCArIHcsIHkgfSxcbiAgICB7IHg6IHggKyB3LCB5OiB5ICsgaCB9LFxuICAgIHsgeDogeCAtIEZSQU1FX1dJRFRILCB5OiB5ICsgaCB9LFxuICAgIHsgeDogeCAtIEZSQU1FX1dJRFRILCB5IH0sXG4gICAgeyB4LCB5IH0sXG4gICAgeyB4LCB5OiB5ICsgaCB9XG4gIF07XG4gIGNvbnN0IHJvdWdoTm9kZSA9IHJjLnBvbHlnb24oXG4gICAgcG9pbnRzLm1hcCgocCkgPT4gW3AueCwgcC55XSksXG4gICAgb3B0aW9uc1xuICApO1xuICBjb25zdCByZWN0MiA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiByb3VnaE5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICByZWN0Mi5hdHRyKFwiY2xhc3NcIiwgXCJiYXNpYyBsYWJlbC1jb250YWluZXIgb3V0ZXItcGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgaGFuZGxlVW5kZWZpbmVkQXR0cihjc3NTdHlsZXMpKTtcbiAgaWYgKG5vZGVTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgcmVjdDIuc2VsZWN0QWxsKFwicGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgbm9kZVN0eWxlcyk7XG4gIH1cbiAgaWYgKGNzc1N0eWxlcyAmJiBub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICByZWN0Mi5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgfVxuICBsYWJlbC5hdHRyKFxuICAgIFwidHJhbnNmb3JtXCIsXG4gICAgYHRyYW5zbGF0ZSgke0ZSQU1FX1dJRFRIIC8gMiAtIGJib3gud2lkdGggLyAyIC0gKGJib3gueCAtIChiYm94LmxlZnQgPz8gMCkpfSwgJHstKGJib3guaGVpZ2h0IC8gMikgLSAoYmJveC55IC0gKGJib3gudG9wID8/IDApKX0pYFxuICApO1xuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIHJlY3QyKTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiBpbnRlcnNlY3RfZGVmYXVsdC5yZWN0KG5vZGUsIHBvaW50KTtcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKHNoYWRlZFByb2Nlc3MsIFwic2hhZGVkUHJvY2Vzc1wiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvc2xvcGVkUmVjdC50c1xuaW1wb3J0IHJvdWdoNDEgZnJvbSBcInJvdWdoanNcIjtcbmFzeW5jIGZ1bmN0aW9uIHNsb3BlZFJlY3QocGFyZW50LCBub2RlKSB7XG4gIGNvbnN0IHsgbGFiZWxTdHlsZXMsIG5vZGVTdHlsZXMgfSA9IHN0eWxlczJTdHJpbmcobm9kZSk7XG4gIG5vZGUubGFiZWxTdHlsZSA9IGxhYmVsU3R5bGVzO1xuICBjb25zdCBub2RlUGFkZGluZyA9IG5vZGUucGFkZGluZyA/PyAwO1xuICBjb25zdCBsYWJlbFBhZGRpbmdYID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gMTYgOiBub2RlUGFkZGluZztcbiAgY29uc3QgbGFiZWxQYWRkaW5nWSA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IDEyIDogbm9kZVBhZGRpbmc7XG4gIGlmIChub2RlLndpZHRoIHx8IG5vZGUuaGVpZ2h0KSB7XG4gICAgbm9kZS53aWR0aCA9IE1hdGgubWF4KChub2RlPy53aWR0aCA/PyAwKSAtIGxhYmVsUGFkZGluZ1ggKiAyLCAxMCk7XG4gICAgbm9kZS5oZWlnaHQgPSBNYXRoLm1heCgobm9kZT8uaGVpZ2h0ID8/IDApIC8gMS41IC0gbGFiZWxQYWRkaW5nWSAqIDIsIDEwKTtcbiAgfVxuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94LCBsYWJlbCB9ID0gYXdhaXQgbGFiZWxIZWxwZXIocGFyZW50LCBub2RlLCBnZXROb2RlQ2xhc3Nlcyhub2RlKSk7XG4gIGNvbnN0IHRvdGFsV2lkdGggPSAobm9kZT8ud2lkdGggPyBub2RlPy53aWR0aCA6IGJib3gud2lkdGgpICsgbGFiZWxQYWRkaW5nWCAqIDI7XG4gIGNvbnN0IHRvdGFsSGVpZ2h0ID0gKChub2RlPy5oZWlnaHQgPyBub2RlPy5oZWlnaHQgOiBiYm94LmhlaWdodCkgKyBsYWJlbFBhZGRpbmdZICogMikgKiAxLjU7XG4gIGNvbnN0IHcgPSB0b3RhbFdpZHRoO1xuICBjb25zdCBoID0gdG90YWxIZWlnaHQgLyAxLjU7XG4gIGNvbnN0IHggPSAtdyAvIDI7XG4gIGNvbnN0IHkgPSAtaCAvIDI7XG4gIGNvbnN0IHsgY3NzU3R5bGVzIH0gPSBub2RlO1xuICBjb25zdCByYyA9IHJvdWdoNDEuc3ZnKHNoYXBlU3ZnKTtcbiAgY29uc3Qgb3B0aW9ucyA9IHVzZXJOb2RlT3ZlcnJpZGVzKG5vZGUsIHt9KTtcbiAgaWYgKG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIG9wdGlvbnMucm91Z2huZXNzID0gMDtcbiAgICBvcHRpb25zLmZpbGxTdHlsZSA9IFwic29saWRcIjtcbiAgfVxuICBjb25zdCBwb2ludHMgPSBbXG4gICAgeyB4LCB5IH0sXG4gICAgeyB4LCB5OiB5ICsgaCB9LFxuICAgIHsgeDogeCArIHcsIHk6IHkgKyBoIH0sXG4gICAgeyB4OiB4ICsgdywgeTogeSAtIGggLyAyIH1cbiAgXTtcbiAgY29uc3QgcGF0aERhdGEgPSBjcmVhdGVQYXRoRnJvbVBvaW50cyhwb2ludHMpO1xuICBjb25zdCBzaGFwZU5vZGUgPSByYy5wYXRoKHBhdGhEYXRhLCBvcHRpb25zKTtcbiAgY29uc3QgcG9seWdvbiA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiBzaGFwZU5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICBwb2x5Z29uLmF0dHIoXCJjbGFzc1wiLCBcImJhc2ljIGxhYmVsLWNvbnRhaW5lciAgb3V0ZXItcGF0aFwiKTtcbiAgaWYgKGNzc1N0eWxlcyAmJiBub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBwb2x5Z29uLnNlbGVjdENoaWxkcmVuKFwicGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgY3NzU3R5bGVzKTtcbiAgfVxuICBpZiAobm9kZVN0eWxlcyAmJiBub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBwb2x5Z29uLnNlbGVjdENoaWxkcmVuKFwicGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgbm9kZVN0eWxlcyk7XG4gIH1cbiAgcG9seWdvbi5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoMCwgJHtoIC8gNH0pYCk7XG4gIGxhYmVsLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICBgdHJhbnNsYXRlKCR7LXcgLyAyICsgKG5vZGUucGFkZGluZyA/PyAwKSAtIChiYm94LnggLSAoYmJveC5sZWZ0ID8/IDApKX0sICR7LWggLyA0ICsgKG5vZGUucGFkZGluZyA/PyAwKSAtIChiYm94LnkgLSAoYmJveC50b3AgPz8gMCkpfSlgXG4gICk7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgcG9seWdvbik7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICBjb25zdCBwb3MgPSBpbnRlcnNlY3RfZGVmYXVsdC5wb2x5Z29uKG5vZGUsIHBvaW50cywgcG9pbnQpO1xuICAgIHJldHVybiBwb3M7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZShzbG9wZWRSZWN0LCBcInNsb3BlZFJlY3RcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL3NxdWFyZVJlY3QudHNcbmFzeW5jIGZ1bmN0aW9uIHNxdWFyZVJlY3QyKHBhcmVudCwgbm9kZSkge1xuICBjb25zdCBub2RlUGFkZGluZyA9IG5vZGUucGFkZGluZyA/PyAwO1xuICBjb25zdCBsYWJlbFBhZGRpbmdYID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gMTYgOiBub2RlUGFkZGluZyAqIDI7XG4gIGNvbnN0IGxhYmVsUGFkZGluZ1kgPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyAxMiA6IG5vZGVQYWRkaW5nO1xuICBjb25zdCBvcHRpb25zID0ge1xuICAgIHJ4OiAwLFxuICAgIHJ5OiAwLFxuICAgIGNsYXNzZXM6IFwiXCIsXG4gICAgbGFiZWxQYWRkaW5nWDogbm9kZS5sYWJlbFBhZGRpbmdYID8/IGxhYmVsUGFkZGluZ1gsXG4gICAgbGFiZWxQYWRkaW5nWVxuICB9O1xuICByZXR1cm4gZHJhd1JlY3QocGFyZW50LCBub2RlLCBvcHRpb25zKTtcbn1cbl9fbmFtZShzcXVhcmVSZWN0MiwgXCJzcXVhcmVSZWN0XCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy9zdGFkaXVtLnRzXG5pbXBvcnQgcm91Z2g0MiBmcm9tIFwicm91Z2hqc1wiO1xuYXN5bmMgZnVuY3Rpb24gc3RhZGl1bShwYXJlbnQsIG5vZGUpIHtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcywgbm9kZVN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IG5vZGVQYWRkaW5nID0gbm9kZS5wYWRkaW5nID8/IDA7XG4gIGNvbnN0IGxhYmVsUGFkZGluZ1ggPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyAyMCA6IG5vZGVQYWRkaW5nO1xuICBjb25zdCBsYWJlbFBhZGRpbmdZID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gMTIgOiBub2RlUGFkZGluZztcbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCB9ID0gYXdhaXQgbGFiZWxIZWxwZXIocGFyZW50LCBub2RlLCBnZXROb2RlQ2xhc3Nlcyhub2RlKSk7XG4gIGNvbnN0IGggPSBiYm94LmhlaWdodCArIChub2RlLmxvb2sgPT09IFwibmVvXCIgPyBsYWJlbFBhZGRpbmdZICogMiA6IGxhYmVsUGFkZGluZ1kpO1xuICBjb25zdCB3ID0gYmJveC53aWR0aCArIGggLyA0ICsgKG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IGxhYmVsUGFkZGluZ1ggKiAyIDogbGFiZWxQYWRkaW5nWCk7XG4gIGNvbnN0IHJhZGl1cyA9IGggLyAyO1xuICBjb25zdCB7IGNzc1N0eWxlcyB9ID0gbm9kZTtcbiAgY29uc3QgcmMgPSByb3VnaDQyLnN2ZyhzaGFwZVN2Zyk7XG4gIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gIGlmIChub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBvcHRpb25zLnJvdWdobmVzcyA9IDA7XG4gICAgb3B0aW9ucy5maWxsU3R5bGUgPSBcInNvbGlkXCI7XG4gIH1cbiAgY29uc3QgcG9pbnRzID0gW1xuICAgIHsgeDogLXcgLyAyICsgcmFkaXVzLCB5OiAtaCAvIDIgfSxcbiAgICB7IHg6IHcgLyAyIC0gcmFkaXVzLCB5OiAtaCAvIDIgfSxcbiAgICAuLi5nZW5lcmF0ZUNpcmNsZVBvaW50cygtdyAvIDIgKyByYWRpdXMsIDAsIHJhZGl1cywgNTAsIDkwLCAyNzApLFxuICAgIHsgeDogdyAvIDIgLSByYWRpdXMsIHk6IGggLyAyIH0sXG4gICAgLi4uZ2VuZXJhdGVDaXJjbGVQb2ludHModyAvIDIgLSByYWRpdXMsIDAsIHJhZGl1cywgNTAsIDI3MCwgNDUwKVxuICBdO1xuICBjb25zdCBwYXRoRGF0YSA9IGNyZWF0ZVBhdGhGcm9tUG9pbnRzKHBvaW50cyk7XG4gIGNvbnN0IHNoYXBlTm9kZSA9IHJjLnBhdGgocGF0aERhdGEsIG9wdGlvbnMpO1xuICBjb25zdCBwb2x5Z29uID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHNoYXBlTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gIHBvbHlnb24uYXR0cihcImNsYXNzXCIsIFwiYmFzaWMgbGFiZWwtY29udGFpbmVyIG91dGVyLXBhdGhcIik7XG4gIGlmIChjc3NTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgcG9seWdvbi5zZWxlY3RDaGlsZHJlbihcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIGNzc1N0eWxlcyk7XG4gIH1cbiAgaWYgKG5vZGVTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgcG9seWdvbi5zZWxlY3RDaGlsZHJlbihcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIG5vZGVTdHlsZXMpO1xuICB9XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgcG9seWdvbik7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICBjb25zdCBwb3MgPSBpbnRlcnNlY3RfZGVmYXVsdC5wb2x5Z29uKG5vZGUsIHBvaW50cywgcG9pbnQpO1xuICAgIHJldHVybiBwb3M7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZShzdGFkaXVtLCBcInN0YWRpdW1cIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL3N0YXRlLnRzXG5hc3luYyBmdW5jdGlvbiBzdGF0ZShwYXJlbnQsIG5vZGUpIHtcbiAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICByeDogbm9kZS5sb29rID09PSBcIm5lb1wiID8gMyA6IDUsXG4gICAgcnk6IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IDMgOiA1LFxuICAgIGNsYXNzZXM6IFwiZmxvd2NoYXJ0LW5vZGVcIlxuICB9O1xuICByZXR1cm4gZHJhd1JlY3QocGFyZW50LCBub2RlLCBvcHRpb25zKTtcbn1cbl9fbmFtZShzdGF0ZSwgXCJzdGF0ZVwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvc3RhdGVFbmQudHNcbmltcG9ydCByb3VnaDQzIGZyb20gXCJyb3VnaGpzXCI7XG5mdW5jdGlvbiBzdGF0ZUVuZChwYXJlbnQsIG5vZGUsIHsgY29uZmlnOiB7IHRoZW1lVmFyaWFibGVzIH0gfSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGNvbnN0IHsgbGluZUNvbG9yLCBzdGF0ZUJvcmRlciwgbm9kZUJvcmRlciwgbm9kZVNoYWRvdyB9ID0gdGhlbWVWYXJpYWJsZXM7XG4gIGlmIChub2RlLndpZHRoIHx8IG5vZGUuaGVpZ2h0KSB7XG4gICAgaWYgKChub2RlLndpZHRoID8/IDApIDwgMTQpIHtcbiAgICAgIG5vZGUud2lkdGggPSAxNDtcbiAgICB9XG4gICAgaWYgKChub2RlLmhlaWdodCA/PyAwKSA8IDE0KSB7XG4gICAgICBub2RlLmhlaWdodCA9IDE0O1xuICAgIH1cbiAgfVxuICBpZiAoIW5vZGUud2lkdGgpIHtcbiAgICBub2RlLndpZHRoID0gMTQ7XG4gIH1cbiAgaWYgKCFub2RlLmhlaWdodCkge1xuICAgIG5vZGUuaGVpZ2h0ID0gMTQ7XG4gIH1cbiAgY29uc3Qgc2hhcGVTdmcgPSBwYXJlbnQuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJub2RlIGRlZmF1bHRcIikuYXR0cihcImlkXCIsIG5vZGUuZG9tSWQgPz8gbm9kZS5pZCk7XG4gIGNvbnN0IHJjID0gcm91Z2g0My5zdmcoc2hhcGVTdmcpO1xuICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwge30pO1xuICBpZiAobm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgb3B0aW9ucy5yb3VnaG5lc3MgPSAwO1xuICAgIG9wdGlvbnMuZmlsbFN0eWxlID0gXCJzb2xpZFwiO1xuICB9XG4gIGNvbnN0IHJvdWdoTm9kZSA9IHJjLmNpcmNsZSgwLCAwLCBub2RlLndpZHRoLCB7XG4gICAgLi4ub3B0aW9ucyxcbiAgICBzdHJva2U6IGxpbmVDb2xvcixcbiAgICBzdHJva2VXaWR0aDogMlxuICB9KTtcbiAgY29uc3QgaW5uZXJGaWxsID0gc3RhdGVCb3JkZXIgPz8gbm9kZUJvcmRlcjtcbiAgY29uc3QgaW5uZXJOb2RlUmFkaXVzID0gKG5vZGUud2lkdGggPz8gMCkgKiA1IC8gMTQ7XG4gIGNvbnN0IHJvdWdoSW5uZXJOb2RlID0gcmMuY2lyY2xlKDAsIDAsIGlubmVyTm9kZVJhZGl1cywge1xuICAgIC4uLm9wdGlvbnMsXG4gICAgZmlsbDogaW5uZXJGaWxsLFxuICAgIHN0cm9rZTogaW5uZXJGaWxsLFxuICAgIHN0cm9rZVdpZHRoOiAyLFxuICAgIGZpbGxTdHlsZTogXCJzb2xpZFwiXG4gIH0pO1xuICBjb25zdCBjaXJjbGUyID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHJvdWdoTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gIGNpcmNsZTIuaW5zZXJ0KCgpID0+IHJvdWdoSW5uZXJOb2RlKTtcbiAgaWYgKG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIGNpcmNsZTIuYXR0cihcImNsYXNzXCIsIFwib3V0ZXItcGF0aFwiKTtcbiAgfVxuICBpZiAoY3NzU3R5bGVzKSB7XG4gICAgY2lyY2xlMi5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBjc3NTdHlsZXMpO1xuICB9XG4gIGlmIChub2RlU3R5bGVzKSB7XG4gICAgY2lyY2xlMi5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgfVxuICBpZiAobm9kZS53aWR0aCA8IDI1ICYmIG5vZGVTaGFkb3cgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgY29uc3Qgc3ZnSWQgPSBwYXJlbnQubm9kZSgpPy5vd25lclNWR0VsZW1lbnQ/LmlkID8/IFwiXCI7XG4gICAgY29uc3QgZmlsdGVySWQgPSBzdmdJZCA/IGAke3N2Z0lkfS1kcm9wLXNoYWRvdy1zbWFsbGAgOiBcImRyb3Atc2hhZG93LXNtYWxsXCI7XG4gICAgY2lyY2xlMi5hdHRyKFwic3R5bGVcIiwgYGZpbHRlcjp1cmwoIyR7ZmlsdGVySWR9KWApO1xuICB9XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgY2lyY2xlMik7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQuY2lyY2xlKG5vZGUsIChub2RlLndpZHRoID8/IDApIC8gMiwgcG9pbnQpO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59XG5fX25hbWUoc3RhdGVFbmQsIFwic3RhdGVFbmRcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL3N0YXRlU3RhcnQudHNcbmltcG9ydCByb3VnaDQ0IGZyb20gXCJyb3VnaGpzXCI7XG5mdW5jdGlvbiBzdGF0ZVN0YXJ0KHBhcmVudCwgbm9kZSwgeyBjb25maWc6IHsgdGhlbWVWYXJpYWJsZXMgfSB9KSB7XG4gIGNvbnN0IHsgbGluZUNvbG9yLCBub2RlU2hhZG93IH0gPSB0aGVtZVZhcmlhYmxlcztcbiAgaWYgKG5vZGUud2lkdGggfHwgbm9kZS5oZWlnaHQpIHtcbiAgICBpZiAoKG5vZGUud2lkdGggPz8gMCkgPCAxNCkge1xuICAgICAgbm9kZS53aWR0aCA9IDE0O1xuICAgIH1cbiAgICBpZiAoKG5vZGUuaGVpZ2h0ID8/IDApIDwgMTQpIHtcbiAgICAgIG5vZGUuaGVpZ2h0ID0gMTQ7XG4gICAgfVxuICB9XG4gIGlmICghbm9kZS53aWR0aCkge1xuICAgIG5vZGUud2lkdGggPSAxNDtcbiAgfVxuICBpZiAoIW5vZGUuaGVpZ2h0KSB7XG4gICAgbm9kZS5oZWlnaHQgPSAxNDtcbiAgfVxuICBjb25zdCBzaGFwZVN2ZyA9IHBhcmVudC5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm5vZGUgZGVmYXVsdFwiKS5hdHRyKFwiaWRcIiwgbm9kZS5kb21JZCB8fCBub2RlLmlkKTtcbiAgbGV0IGNpcmNsZTI7XG4gIGlmIChub2RlLmxvb2sgPT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBjb25zdCByYyA9IHJvdWdoNDQuc3ZnKHNoYXBlU3ZnKTtcbiAgICBjb25zdCByb3VnaE5vZGUgPSByYy5jaXJjbGUoMCwgMCwgbm9kZS53aWR0aCwgc29saWRTdGF0ZUZpbGwobGluZUNvbG9yKSk7XG4gICAgY2lyY2xlMiA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiByb3VnaE5vZGUpO1xuICAgIGNpcmNsZTIuYXR0cihcImNsYXNzXCIsIFwic3RhdGUtc3RhcnRcIikuYXR0cihcInJcIiwgKG5vZGUud2lkdGggPz8gNykgLyAyKS5hdHRyKFwid2lkdGhcIiwgbm9kZS53aWR0aCA/PyAxNCkuYXR0cihcImhlaWdodFwiLCBub2RlLmhlaWdodCA/PyAxNCk7XG4gIH0gZWxzZSB7XG4gICAgY2lyY2xlMiA9IHNoYXBlU3ZnLmluc2VydChcImNpcmNsZVwiLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgICBjaXJjbGUyLmF0dHIoXCJjbGFzc1wiLCBcInN0YXRlLXN0YXJ0XCIpLmF0dHIoXCJyXCIsIChub2RlLndpZHRoID8/IDcpIC8gMikuYXR0cihcIndpZHRoXCIsIG5vZGUud2lkdGggPz8gMTQpLmF0dHIoXCJoZWlnaHRcIiwgbm9kZS5oZWlnaHQgPz8gMTQpO1xuICB9XG4gIGlmIChub2RlLndpZHRoIDwgMjUgJiYgbm9kZVNoYWRvdyAmJiBub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBjb25zdCBzdmdJZCA9IHBhcmVudC5ub2RlKCk/Lm93bmVyU1ZHRWxlbWVudD8uaWQgPz8gXCJcIjtcbiAgICBjb25zdCBmaWx0ZXJJZCA9IHN2Z0lkID8gYCR7c3ZnSWR9LWRyb3Atc2hhZG93LXNtYWxsYCA6IFwiZHJvcC1zaGFkb3ctc21hbGxcIjtcbiAgICBjaXJjbGUyLmF0dHIoXCJzdHlsZVwiLCBgZmlsdGVyOnVybCgjJHtmaWx0ZXJJZH0pYCk7XG4gIH1cbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCBjaXJjbGUyKTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiBpbnRlcnNlY3RfZGVmYXVsdC5jaXJjbGUobm9kZSwgKG5vZGUud2lkdGggPz8gNykgLyAyLCBwb2ludCk7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZShzdGF0ZVN0YXJ0LCBcInN0YXRlU3RhcnRcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL3N1YnJvdXRpbmUudHNcbmltcG9ydCByb3VnaDQ1IGZyb20gXCJyb3VnaGpzXCI7XG52YXIgRlJBTUVfV0lEVEgyID0gODtcbmFzeW5jIGZ1bmN0aW9uIHN1YnJvdXRpbmUocGFyZW50LCBub2RlKSB7XG4gIGNvbnN0IHsgbGFiZWxTdHlsZXMsIG5vZGVTdHlsZXMgfSA9IHN0eWxlczJTdHJpbmcobm9kZSk7XG4gIG5vZGUubGFiZWxTdHlsZSA9IGxhYmVsU3R5bGVzO1xuICBjb25zdCBub2RlUGFkZGluZyA9IG5vZGU/LnBhZGRpbmcgPz8gODtcbiAgY29uc3QgbGFiZWxQYWRkaW5nWCA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IDI4IDogbm9kZVBhZGRpbmc7XG4gIGNvbnN0IGxhYmVsUGFkZGluZ1kgPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyAxMiA6IG5vZGVQYWRkaW5nO1xuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94IH0gPSBhd2FpdCBsYWJlbEhlbHBlcihwYXJlbnQsIG5vZGUsIGdldE5vZGVDbGFzc2VzKG5vZGUpKTtcbiAgY29uc3QgdG90YWxXaWR0aCA9IChub2RlPy53aWR0aCA/PyBiYm94LndpZHRoKSArIDIgKiBGUkFNRV9XSURUSDIgKyBsYWJlbFBhZGRpbmdYO1xuICBjb25zdCB0b3RhbEhlaWdodCA9IChub2RlPy5oZWlnaHQgPz8gYmJveC5oZWlnaHQpICsgbGFiZWxQYWRkaW5nWTtcbiAgY29uc3QgdyA9IHRvdGFsV2lkdGggLSAyICogRlJBTUVfV0lEVEgyO1xuICBjb25zdCBoID0gdG90YWxIZWlnaHQ7XG4gIGNvbnN0IHggPSAtdG90YWxXaWR0aCAvIDI7XG4gIGNvbnN0IHkgPSAtdG90YWxIZWlnaHQgLyAyO1xuICBjb25zdCBwb2ludHMgPSBbXG4gICAgeyB4OiAwLCB5OiAwIH0sXG4gICAgeyB4OiB3LCB5OiAwIH0sXG4gICAgeyB4OiB3LCB5OiAtaCB9LFxuICAgIHsgeDogMCwgeTogLWggfSxcbiAgICB7IHg6IDAsIHk6IDAgfSxcbiAgICB7IHg6IC04LCB5OiAwIH0sXG4gICAgeyB4OiB3ICsgOCwgeTogMCB9LFxuICAgIHsgeDogdyArIDgsIHk6IC1oIH0sXG4gICAgeyB4OiAtOCwgeTogLWggfSxcbiAgICB7IHg6IC04LCB5OiAwIH1cbiAgXTtcbiAgaWYgKG5vZGUubG9vayA9PT0gXCJoYW5kRHJhd25cIikge1xuICAgIGNvbnN0IHJjID0gcm91Z2g0NS5zdmcoc2hhcGVTdmcpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gICAgY29uc3Qgcm91Z2hOb2RlID0gcmMucmVjdGFuZ2xlKHgsIHksIHcgKyAxNiwgaCwgb3B0aW9ucyk7XG4gICAgY29uc3QgbDEgPSByYy5saW5lKHggKyBGUkFNRV9XSURUSDIsIHksIHggKyBGUkFNRV9XSURUSDIsIHkgKyBoLCBvcHRpb25zKTtcbiAgICBjb25zdCBsMiA9IHJjLmxpbmUoeCArIEZSQU1FX1dJRFRIMiArIHcsIHksIHggKyBGUkFNRV9XSURUSDIgKyB3LCB5ICsgaCwgb3B0aW9ucyk7XG4gICAgc2hhcGVTdmcuaW5zZXJ0KCgpID0+IGwxLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgICBzaGFwZVN2Zy5pbnNlcnQoKCkgPT4gbDIsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICAgIGNvbnN0IHJlY3QyID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHJvdWdoTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gICAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gICAgcmVjdDIuYXR0cihcImNsYXNzXCIsIFwiYmFzaWMgbGFiZWwtY29udGFpbmVyXCIpLmF0dHIoXCJzdHlsZVwiLCBoYW5kbGVVbmRlZmluZWRBdHRyKGNzc1N0eWxlcykpO1xuICAgIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgcmVjdDIpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGVsID0gaW5zZXJ0UG9seWdvblNoYXBlKHNoYXBlU3ZnLCB3LCBoLCBwb2ludHMpO1xuICAgIGlmIChub2RlU3R5bGVzKSB7XG4gICAgICBlbC5hdHRyKFwic3R5bGVcIiwgbm9kZVN0eWxlcyk7XG4gICAgfVxuICAgIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgZWwpO1xuICB9XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihub2RlLCBwb2ludHMsIHBvaW50KTtcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKHN1YnJvdXRpbmUsIFwic3Vicm91dGluZVwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvdGFnZ2VkUmVjdC50c1xuaW1wb3J0IHJvdWdoNDYgZnJvbSBcInJvdWdoanNcIjtcbnZhciBUQUdfUkFUSU8gPSAwLjI7XG5hc3luYyBmdW5jdGlvbiB0YWdnZWRSZWN0KHBhcmVudCwgbm9kZSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3Qgbm9kZVBhZGRpbmcgPSBub2RlLnBhZGRpbmcgPz8gMDtcbiAgY29uc3QgbGFiZWxQYWRkaW5nWCA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IDE2IDogbm9kZVBhZGRpbmc7XG4gIGNvbnN0IGxhYmVsUGFkZGluZ1kgPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyAxMiA6IG5vZGVQYWRkaW5nO1xuICBpZiAobm9kZS53aWR0aCB8fCBub2RlLmhlaWdodCkge1xuICAgIG5vZGUuaGVpZ2h0ID0gTWF0aC5tYXgoKG5vZGU/LmhlaWdodCA/PyAwKSAtIGxhYmVsUGFkZGluZ1kgKiAyLCAxMCk7XG4gICAgbm9kZS53aWR0aCA9IE1hdGgubWF4KFxuICAgICAgKG5vZGU/LndpZHRoID8/IDApIC0gbGFiZWxQYWRkaW5nWCAqIDIgLSBUQUdfUkFUSU8gKiAobm9kZS5oZWlnaHQgKyBsYWJlbFBhZGRpbmdZICogMiksXG4gICAgICAxMFxuICAgICk7XG4gIH1cbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCB9ID0gYXdhaXQgbGFiZWxIZWxwZXIocGFyZW50LCBub2RlLCBnZXROb2RlQ2xhc3Nlcyhub2RlKSk7XG4gIGNvbnN0IHRvdGFsSGVpZ2h0ID0gKG5vZGU/LmhlaWdodCA/IG5vZGU/LmhlaWdodCA6IGJib3guaGVpZ2h0KSArIGxhYmVsUGFkZGluZ1kgKiAyO1xuICBjb25zdCB0YWdXaWR0aCA9IFRBR19SQVRJTyAqIHRvdGFsSGVpZ2h0O1xuICBjb25zdCB0YWdIZWlnaHQgPSBUQUdfUkFUSU8gKiB0b3RhbEhlaWdodDtcbiAgY29uc3QgdG90YWxXaWR0aCA9IChub2RlPy53aWR0aCA/IG5vZGU/LndpZHRoIDogYmJveC53aWR0aCkgKyBsYWJlbFBhZGRpbmdYICogMiArIHRhZ1dpZHRoO1xuICBjb25zdCB3ID0gdG90YWxXaWR0aCAtIHRhZ1dpZHRoO1xuICBjb25zdCBoID0gdG90YWxIZWlnaHQ7XG4gIGNvbnN0IHggPSAtdyAvIDI7XG4gIGNvbnN0IHkgPSAtaCAvIDI7XG4gIGNvbnN0IHsgY3NzU3R5bGVzIH0gPSBub2RlO1xuICBjb25zdCByYyA9IHJvdWdoNDYuc3ZnKHNoYXBlU3ZnKTtcbiAgY29uc3Qgb3B0aW9ucyA9IHVzZXJOb2RlT3ZlcnJpZGVzKG5vZGUsIHt9KTtcbiAgY29uc3QgcmVjdFBvaW50cyA9IFtcbiAgICB7IHg6IHggLSB0YWdXaWR0aCAvIDIsIHkgfSxcbiAgICB7IHg6IHggKyB3ICsgdGFnV2lkdGggLyAyLCB5IH0sXG4gICAgeyB4OiB4ICsgdyArIHRhZ1dpZHRoIC8gMiwgeTogeSArIGggfSxcbiAgICB7IHg6IHggLSB0YWdXaWR0aCAvIDIsIHk6IHkgKyBoIH1cbiAgXTtcbiAgY29uc3QgdGFnUG9pbnRzID0gW1xuICAgIHsgeDogeCArIHcgLSB0YWdXaWR0aCAvIDIsIHk6IHkgKyBoIH0sXG4gICAgeyB4OiB4ICsgdyArIHRhZ1dpZHRoIC8gMiwgeTogeSArIGggfSxcbiAgICB7IHg6IHggKyB3ICsgdGFnV2lkdGggLyAyLCB5OiB5ICsgaCAtIHRhZ0hlaWdodCB9XG4gIF07XG4gIGlmIChub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBvcHRpb25zLnJvdWdobmVzcyA9IDA7XG4gICAgb3B0aW9ucy5maWxsU3R5bGUgPSBcInNvbGlkXCI7XG4gIH1cbiAgY29uc3QgcmVjdFBhdGggPSBjcmVhdGVQYXRoRnJvbVBvaW50cyhyZWN0UG9pbnRzKTtcbiAgY29uc3QgcmVjdE5vZGUgPSByYy5wYXRoKHJlY3RQYXRoLCBvcHRpb25zKTtcbiAgY29uc3QgdGFnUGF0aCA9IGNyZWF0ZVBhdGhGcm9tUG9pbnRzKHRhZ1BvaW50cyk7XG4gIGNvbnN0IHRhZ05vZGUgPSByYy5wYXRoKHRhZ1BhdGgsIHsgLi4ub3B0aW9ucywgZmlsbFN0eWxlOiBcInNvbGlkXCIgfSk7XG4gIGNvbnN0IHRhZ2dlZFJlY3QyID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHRhZ05vZGUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICB0YWdnZWRSZWN0Mi5pbnNlcnQoKCkgPT4gcmVjdE5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICB0YWdnZWRSZWN0Mi5hdHRyKFwiY2xhc3NcIiwgXCJiYXNpYyBsYWJlbC1jb250YWluZXIgb3V0ZXItcGF0aFwiKTtcbiAgaWYgKGNzc1N0eWxlcyAmJiBub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICB0YWdnZWRSZWN0Mi5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBjc3NTdHlsZXMpO1xuICB9XG4gIGlmIChub2RlU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIHRhZ2dlZFJlY3QyLnNlbGVjdEFsbChcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIG5vZGVTdHlsZXMpO1xuICB9XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgdGFnZ2VkUmVjdDIpO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgY29uc3QgcG9zID0gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihub2RlLCByZWN0UG9pbnRzLCBwb2ludCk7XG4gICAgcmV0dXJuIHBvcztcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKHRhZ2dlZFJlY3QsIFwidGFnZ2VkUmVjdFwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvdGFnZ2VkV2F2ZUVkZ2VkUmVjdGFuZ2xlLnRzXG5pbXBvcnQgcm91Z2g0NyBmcm9tIFwicm91Z2hqc1wiO1xuYXN5bmMgZnVuY3Rpb24gdGFnZ2VkV2F2ZUVkZ2VkUmVjdGFuZ2xlKHBhcmVudCwgbm9kZSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCwgbGFiZWwgfSA9IGF3YWl0IGxhYmVsSGVscGVyKHBhcmVudCwgbm9kZSwgZ2V0Tm9kZUNsYXNzZXMobm9kZSkpO1xuICBjb25zdCB3ID0gTWF0aC5tYXgoYmJveC53aWR0aCArIChub2RlLnBhZGRpbmcgPz8gMCkgKiAyLCBub2RlPy53aWR0aCA/PyAwKTtcbiAgY29uc3QgaCA9IE1hdGgubWF4KGJib3guaGVpZ2h0ICsgKG5vZGUucGFkZGluZyA/PyAwKSAqIDIsIG5vZGU/LmhlaWdodCA/PyAwKTtcbiAgY29uc3Qgd2F2ZUFtcGxpdHVkZSA9IGggLyA4O1xuICBjb25zdCB0YWdXaWR0aCA9IDAuMiAqIHc7XG4gIGNvbnN0IHRhZ0hlaWdodCA9IDAuMiAqIGg7XG4gIGNvbnN0IGZpbmFsSCA9IGggKyB3YXZlQW1wbGl0dWRlO1xuICBjb25zdCB7IGNzc1N0eWxlcyB9ID0gbm9kZTtcbiAgY29uc3QgcmMgPSByb3VnaDQ3LnN2ZyhzaGFwZVN2Zyk7XG4gIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gIGlmIChub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBvcHRpb25zLnJvdWdobmVzcyA9IDA7XG4gICAgb3B0aW9ucy5maWxsU3R5bGUgPSBcInNvbGlkXCI7XG4gIH1cbiAgY29uc3QgcG9pbnRzID0gW1xuICAgIHsgeDogLXcgLyAyIC0gdyAvIDIgKiAwLjEsIHk6IGZpbmFsSCAvIDIgfSxcbiAgICAuLi5nZW5lcmF0ZUZ1bGxTaW5lV2F2ZVBvaW50cyhcbiAgICAgIC13IC8gMiAtIHcgLyAyICogMC4xLFxuICAgICAgZmluYWxIIC8gMixcbiAgICAgIHcgLyAyICsgdyAvIDIgKiAwLjEsXG4gICAgICBmaW5hbEggLyAyLFxuICAgICAgd2F2ZUFtcGxpdHVkZSxcbiAgICAgIDAuOFxuICAgICksXG4gICAgeyB4OiB3IC8gMiArIHcgLyAyICogMC4xLCB5OiAtZmluYWxIIC8gMiB9LFxuICAgIHsgeDogLXcgLyAyIC0gdyAvIDIgKiAwLjEsIHk6IC1maW5hbEggLyAyIH1cbiAgXTtcbiAgY29uc3QgeCA9IC13IC8gMiArIHcgLyAyICogMC4xO1xuICBjb25zdCB5ID0gLWZpbmFsSCAvIDIgLSB0YWdIZWlnaHQgKiAwLjQ7XG4gIGNvbnN0IHRhZ1BvaW50cyA9IFtcbiAgICB7IHg6IHggKyB3IC0gdGFnV2lkdGgsIHk6ICh5ICsgaCkgKiAxLjMgfSxcbiAgICB7IHg6IHggKyB3LCB5OiB5ICsgaCAtIHRhZ0hlaWdodCB9LFxuICAgIHsgeDogeCArIHcsIHk6ICh5ICsgaCkgKiAwLjkgfSxcbiAgICAuLi5nZW5lcmF0ZUZ1bGxTaW5lV2F2ZVBvaW50cyhcbiAgICAgIHggKyB3LFxuICAgICAgKHkgKyBoKSAqIDEuMjUsXG4gICAgICB4ICsgdyAtIHRhZ1dpZHRoLFxuICAgICAgKHkgKyBoKSAqIDEuMyxcbiAgICAgIC1oICogMC4wMixcbiAgICAgIDAuNVxuICAgIClcbiAgXTtcbiAgY29uc3Qgd2F2ZUVkZ2VSZWN0UGF0aCA9IGNyZWF0ZVBhdGhGcm9tUG9pbnRzKHBvaW50cyk7XG4gIGNvbnN0IHdhdmVFZGdlUmVjdE5vZGUgPSByYy5wYXRoKHdhdmVFZGdlUmVjdFBhdGgsIG9wdGlvbnMpO1xuICBjb25zdCB0YWdnZWRXYXZlRWRnZVJlY3RQYXRoID0gY3JlYXRlUGF0aEZyb21Qb2ludHModGFnUG9pbnRzKTtcbiAgY29uc3QgdGFnZ2VkV2F2ZUVkZ2VSZWN0Tm9kZSA9IHJjLnBhdGgodGFnZ2VkV2F2ZUVkZ2VSZWN0UGF0aCwge1xuICAgIC4uLm9wdGlvbnMsXG4gICAgZmlsbFN0eWxlOiBcInNvbGlkXCJcbiAgfSk7XG4gIGNvbnN0IHdhdmVFZGdlUmVjdCA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiB0YWdnZWRXYXZlRWRnZVJlY3ROb2RlLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgd2F2ZUVkZ2VSZWN0Lmluc2VydCgoKSA9PiB3YXZlRWRnZVJlY3ROb2RlLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgd2F2ZUVkZ2VSZWN0LmF0dHIoXCJjbGFzc1wiLCBcImJhc2ljIGxhYmVsLWNvbnRhaW5lciBvdXRlci1wYXRoXCIpO1xuICBpZiAoY3NzU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIHdhdmVFZGdlUmVjdC5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBjc3NTdHlsZXMpO1xuICB9XG4gIGlmIChub2RlU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIHdhdmVFZGdlUmVjdC5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgfVxuICB3YXZlRWRnZVJlY3QuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKDAsJHstd2F2ZUFtcGxpdHVkZSAvIDJ9KWApO1xuICBsYWJlbC5hdHRyKFxuICAgIFwidHJhbnNmb3JtXCIsXG4gICAgYHRyYW5zbGF0ZSgkey13IC8gMiArIChub2RlLnBhZGRpbmcgPz8gMCkgLSAoYmJveC54IC0gKGJib3gubGVmdCA/PyAwKSl9LCR7LWggLyAyICsgKG5vZGUucGFkZGluZyA/PyAwKSAtIHdhdmVBbXBsaXR1ZGUgLyAyIC0gKGJib3gueSAtIChiYm94LnRvcCA/PyAwKSl9KWBcbiAgKTtcbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCB3YXZlRWRnZVJlY3QpO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgY29uc3QgcG9zID0gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihub2RlLCBwb2ludHMsIHBvaW50KTtcbiAgICByZXR1cm4gcG9zO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59XG5fX25hbWUodGFnZ2VkV2F2ZUVkZ2VkUmVjdGFuZ2xlLCBcInRhZ2dlZFdhdmVFZGdlZFJlY3RhbmdsZVwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvdGV4dC50c1xuYXN5bmMgZnVuY3Rpb24gdGV4dChwYXJlbnQsIG5vZGUpIHtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcywgbm9kZVN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3ggfSA9IGF3YWl0IGxhYmVsSGVscGVyKHBhcmVudCwgbm9kZSwgZ2V0Tm9kZUNsYXNzZXMobm9kZSkpO1xuICBjb25zdCB0b3RhbFdpZHRoID0gTWF0aC5tYXgoYmJveC53aWR0aCArIChub2RlLnBhZGRpbmcgPz8gMCksIG5vZGU/LndpZHRoIHx8IDApO1xuICBjb25zdCB0b3RhbEhlaWdodCA9IE1hdGgubWF4KGJib3guaGVpZ2h0ICsgKG5vZGUucGFkZGluZyA/PyAwKSwgbm9kZT8uaGVpZ2h0IHx8IDApO1xuICBjb25zdCB4ID0gLXRvdGFsV2lkdGggLyAyO1xuICBjb25zdCB5ID0gLXRvdGFsSGVpZ2h0IC8gMjtcbiAgY29uc3QgcmVjdDIgPSBzaGFwZVN2Zy5pbnNlcnQoXCJyZWN0XCIsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICByZWN0Mi5hdHRyKFwiY2xhc3NcIiwgXCJ0ZXh0XCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKS5hdHRyKFwicnhcIiwgMCkuYXR0cihcInJ5XCIsIDApLmF0dHIoXCJ4XCIsIHgpLmF0dHIoXCJ5XCIsIHkpLmF0dHIoXCJ3aWR0aFwiLCB0b3RhbFdpZHRoKS5hdHRyKFwiaGVpZ2h0XCIsIHRvdGFsSGVpZ2h0KTtcbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCByZWN0Mik7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucmVjdChub2RlLCBwb2ludCk7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZSh0ZXh0LCBcInRleHRcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL3RpbHRlZEN5bGluZGVyLnRzXG5pbXBvcnQgcm91Z2g0OCBmcm9tIFwicm91Z2hqc1wiO1xudmFyIGNyZWF0ZUN5bGluZGVyUGF0aEQzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoeCwgeSwgd2lkdGgsIGhlaWdodCwgcngsIHJ5KSA9PiB7XG4gIHJldHVybiBgTSR7eH0sJHt5fVxuICAgIGEke3J4fSwke3J5fSAwLDAsMSAkezB9LCR7LWhlaWdodH1cbiAgICBsJHt3aWR0aH0sJHswfVxuICAgIGEke3J4fSwke3J5fSAwLDAsMSAkezB9LCR7aGVpZ2h0fVxuICAgIE0ke3dpZHRofSwkey1oZWlnaHR9XG4gICAgYSR7cnh9LCR7cnl9IDAsMCwwICR7MH0sJHtoZWlnaHR9XG4gICAgbCR7LXdpZHRofSwkezB9YDtcbn0sIFwiY3JlYXRlQ3lsaW5kZXJQYXRoRFwiKTtcbnZhciBjcmVhdGVPdXRlckN5bGluZGVyUGF0aEQzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoeCwgeSwgd2lkdGgsIGhlaWdodCwgcngsIHJ5KSA9PiB7XG4gIHJldHVybiBbXG4gICAgYE0ke3h9LCR7eX1gLFxuICAgIGBNJHt4ICsgd2lkdGh9LCR7eX1gLFxuICAgIGBhJHtyeH0sJHtyeX0gMCwwLDAgJHswfSwkey1oZWlnaHR9YCxcbiAgICBgbCR7LXdpZHRofSwwYCxcbiAgICBgYSR7cnh9LCR7cnl9IDAsMCwwICR7MH0sJHtoZWlnaHR9YCxcbiAgICBgbCR7d2lkdGh9LDBgXG4gIF0uam9pbihcIiBcIik7XG59LCBcImNyZWF0ZU91dGVyQ3lsaW5kZXJQYXRoRFwiKTtcbnZhciBjcmVhdGVJbm5lckN5bGluZGVyUGF0aEQzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoeCwgeSwgd2lkdGgsIGhlaWdodCwgcngsIHJ5KSA9PiB7XG4gIHJldHVybiBbYE0ke3ggKyB3aWR0aCAvIDJ9LCR7LWhlaWdodCAvIDJ9YCwgYGEke3J4fSwke3J5fSAwLDAsMCAwLCR7aGVpZ2h0fWBdLmpvaW4oXCIgXCIpO1xufSwgXCJjcmVhdGVJbm5lckN5bGluZGVyUGF0aERcIik7XG52YXIgTUlOX0hFSUdIVDQgPSA1O1xudmFyIE1JTl9XSURUSDQgPSAxMDtcbmFzeW5jIGZ1bmN0aW9uIHRpbHRlZEN5bGluZGVyKHBhcmVudCwgbm9kZSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3Qgbm9kZVBhZGRpbmcgPSBub2RlLnBhZGRpbmcgPz8gMDtcbiAgY29uc3QgbGFiZWxQYWRkaW5nID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gMTIgOiBub2RlUGFkZGluZyAvIDI7XG4gIGlmIChub2RlLndpZHRoIHx8IG5vZGUuaGVpZ2h0KSB7XG4gICAgY29uc3Qgb3JpZ2luYWxIZWlnaHQgPSBub2RlLmhlaWdodCA/PyAwO1xuICAgIG5vZGUuaGVpZ2h0ID0gKG5vZGUuaGVpZ2h0ID8/IDApIC0gbGFiZWxQYWRkaW5nO1xuICAgIGlmIChub2RlLmhlaWdodCA8IE1JTl9IRUlHSFQ0KSB7XG4gICAgICBub2RlLmhlaWdodCA9IE1JTl9IRUlHSFQ0O1xuICAgIH1cbiAgICBjb25zdCByeTIgPSBvcmlnaW5hbEhlaWdodCAvIDI7XG4gICAgY29uc3QgcngyID0gcnkyIC8gKDIuNSArIG9yaWdpbmFsSGVpZ2h0IC8gNTApO1xuICAgIG5vZGUud2lkdGggPSAobm9kZS53aWR0aCA/PyAwKSAtIGxhYmVsUGFkZGluZyAtIHJ4MiAqIDM7XG4gICAgaWYgKG5vZGUud2lkdGggPCBNSU5fV0lEVEg0KSB7XG4gICAgICBub2RlLndpZHRoID0gTUlOX1dJRFRINDtcbiAgICB9XG4gIH1cbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCwgbGFiZWwgfSA9IGF3YWl0IGxhYmVsSGVscGVyKHBhcmVudCwgbm9kZSwgZ2V0Tm9kZUNsYXNzZXMobm9kZSkpO1xuICBjb25zdCBoID0gKG5vZGUuaGVpZ2h0ID8gbm9kZS5oZWlnaHQgOiBiYm94LmhlaWdodCkgKyBsYWJlbFBhZGRpbmc7XG4gIGNvbnN0IHJ5ID0gaCAvIDI7XG4gIGNvbnN0IHJ4ID0gcnkgLyAoMi41ICsgaCAvIDUwKTtcbiAgY29uc3QgdyA9IChub2RlLndpZHRoID8gbm9kZS53aWR0aCA6IGJib3gud2lkdGgpICsgcnggKyBsYWJlbFBhZGRpbmc7XG4gIGNvbnN0IHsgY3NzU3R5bGVzIH0gPSBub2RlO1xuICBsZXQgY3lsaW5kZXIyO1xuICBpZiAobm9kZS5sb29rID09PSBcImhhbmREcmF3blwiKSB7XG4gICAgY29uc3QgcmMgPSByb3VnaDQ4LnN2ZyhzaGFwZVN2Zyk7XG4gICAgY29uc3Qgb3V0ZXJQYXRoRGF0YSA9IGNyZWF0ZU91dGVyQ3lsaW5kZXJQYXRoRDMoMCwgMCwgdywgaCwgcngsIHJ5KTtcbiAgICBjb25zdCBpbm5lclBhdGhEYXRhID0gY3JlYXRlSW5uZXJDeWxpbmRlclBhdGhEMygwLCAwLCB3LCBoLCByeCwgcnkpO1xuICAgIGNvbnN0IG91dGVyTm9kZSA9IHJjLnBhdGgob3V0ZXJQYXRoRGF0YSwgdXNlck5vZGVPdmVycmlkZXMobm9kZSwge30pKTtcbiAgICBjb25zdCBpbm5lckxpbmUgPSByYy5wYXRoKGlubmVyUGF0aERhdGEsIHVzZXJOb2RlT3ZlcnJpZGVzKG5vZGUsIHsgZmlsbDogXCJub25lXCIgfSkpO1xuICAgIGN5bGluZGVyMiA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiBpbm5lckxpbmUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICAgIGN5bGluZGVyMiA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiBvdXRlck5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICAgIGN5bGluZGVyMi5hdHRyKFwiY2xhc3NcIiwgXCJiYXNpYyBsYWJlbC1jb250YWluZXJcIik7XG4gICAgaWYgKGNzc1N0eWxlcykge1xuICAgICAgY3lsaW5kZXIyLmF0dHIoXCJzdHlsZVwiLCBjc3NTdHlsZXMpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb25zdCBwYXRoRGF0YSA9IGNyZWF0ZUN5bGluZGVyUGF0aEQzKDAsIDAsIHcsIGgsIHJ4LCByeSk7XG4gICAgY3lsaW5kZXIyID0gc2hhcGVTdmcuaW5zZXJ0KFwicGF0aFwiLCBcIjpmaXJzdC1jaGlsZFwiKS5hdHRyKFwiZFwiLCBwYXRoRGF0YSkuYXR0cihcImNsYXNzXCIsIFwiYmFzaWMgbGFiZWwtY29udGFpbmVyXCIpLmF0dHIoXCJzdHlsZVwiLCBoYW5kbGVVbmRlZmluZWRBdHRyKGNzc1N0eWxlcykpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgICBjeWxpbmRlcjIuYXR0cihcImNsYXNzXCIsIFwiYmFzaWMgbGFiZWwtY29udGFpbmVyIG91dGVyLXBhdGhcIik7XG4gICAgaWYgKGNzc1N0eWxlcykge1xuICAgICAgY3lsaW5kZXIyLnNlbGVjdEFsbChcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIGNzc1N0eWxlcyk7XG4gICAgfVxuICAgIGlmIChub2RlU3R5bGVzKSB7XG4gICAgICBjeWxpbmRlcjIuc2VsZWN0QWxsKFwicGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgbm9kZVN0eWxlcyk7XG4gICAgfVxuICB9XG4gIGN5bGluZGVyMi5hdHRyKFwibGFiZWwtb2Zmc2V0LXhcIiwgcngpO1xuICBjeWxpbmRlcjIuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7LXcgLyAyfSwgJHtoIC8gMn0gKWApO1xuICBsYWJlbC5hdHRyKFxuICAgIFwidHJhbnNmb3JtXCIsXG4gICAgYHRyYW5zbGF0ZSgkey0oYmJveC53aWR0aCAvIDIpIC0gcnggLSAoYmJveC54IC0gKGJib3gubGVmdCA/PyAwKSl9LCAkey0oYmJveC5oZWlnaHQgLyAyKSAtIChiYm94LnkgLSAoYmJveC50b3AgPz8gMCkpfSlgXG4gICk7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgY3lsaW5kZXIyKTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIGNvbnN0IHBvcyA9IGludGVyc2VjdF9kZWZhdWx0LnJlY3Qobm9kZSwgcG9pbnQpO1xuICAgIGNvbnN0IHkgPSBwb3MueSAtIChub2RlLnkgPz8gMCk7XG4gICAgaWYgKHJ5ICE9IDAgJiYgKE1hdGguYWJzKHkpIDwgKG5vZGUuaGVpZ2h0ID8/IDApIC8gMiB8fCBNYXRoLmFicyh5KSA9PSAobm9kZS5oZWlnaHQgPz8gMCkgLyAyICYmIE1hdGguYWJzKHBvcy54IC0gKG5vZGUueCA/PyAwKSkgPiAobm9kZS53aWR0aCA/PyAwKSAvIDIgLSByeCkpIHtcbiAgICAgIGxldCB4ID0gcnggKiByeCAqICgxIC0geSAqIHkgLyAocnkgKiByeSkpO1xuICAgICAgaWYgKHggIT0gMCkge1xuICAgICAgICB4ID0gTWF0aC5zcXJ0KE1hdGguYWJzKHgpKTtcbiAgICAgIH1cbiAgICAgIHggPSByeCAtIHg7XG4gICAgICBpZiAocG9pbnQueCAtIChub2RlLnggPz8gMCkgPiAwKSB7XG4gICAgICAgIHggPSAteDtcbiAgICAgIH1cbiAgICAgIHBvcy54ICs9IHg7XG4gICAgfVxuICAgIHJldHVybiBwb3M7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZSh0aWx0ZWRDeWxpbmRlciwgXCJ0aWx0ZWRDeWxpbmRlclwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvdHJhcGV6b2lkLnRzXG5pbXBvcnQgcm91Z2g0OSBmcm9tIFwicm91Z2hqc1wiO1xuYXN5bmMgZnVuY3Rpb24gdHJhcGV6b2lkKHBhcmVudCwgbm9kZSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3Qgbm9kZVBhZGRpbmcgPSBub2RlLnBhZGRpbmcgPz8gMDtcbiAgY29uc3QgbGFiZWxQYWRkaW5nWSA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IG5vZGVQYWRkaW5nIDogbm9kZVBhZGRpbmc7XG4gIGNvbnN0IGxhYmVsUGFkZGluZ1ggPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyBub2RlUGFkZGluZyAqIDIgOiBub2RlUGFkZGluZztcbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCB9ID0gYXdhaXQgbGFiZWxIZWxwZXIocGFyZW50LCBub2RlLCBnZXROb2RlQ2xhc3Nlcyhub2RlKSk7XG4gIGNvbnN0IGggPSAobm9kZT8uaGVpZ2h0ID8/IGJib3guaGVpZ2h0KSArIGxhYmVsUGFkZGluZ1k7XG4gIGNvbnN0IHcgPSAobm9kZT8ud2lkdGggPz8gYmJveC53aWR0aCkgKyBsYWJlbFBhZGRpbmdYO1xuICBjb25zdCBwb2ludHMgPSBbXG4gICAgeyB4OiAtMyAqIGggLyA2LCB5OiAwIH0sXG4gICAgeyB4OiB3ICsgMyAqIGggLyA2LCB5OiAwIH0sXG4gICAgeyB4OiB3LCB5OiAtaCB9LFxuICAgIHsgeDogMCwgeTogLWggfVxuICBdO1xuICBsZXQgcG9seWdvbjtcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGlmIChub2RlLmxvb2sgPT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBjb25zdCByYyA9IHJvdWdoNDkuc3ZnKHNoYXBlU3ZnKTtcbiAgICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwge30pO1xuICAgIGNvbnN0IHBhdGhEYXRhID0gY3JlYXRlUGF0aEZyb21Qb2ludHMocG9pbnRzKTtcbiAgICBjb25zdCByb3VnaE5vZGUgPSByYy5wYXRoKHBhdGhEYXRhLCBvcHRpb25zKTtcbiAgICBwb2x5Z29uID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHJvdWdoTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIikuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7LXcgLyAyfSwgJHtoIC8gMn0pYCk7XG4gICAgaWYgKGNzc1N0eWxlcykge1xuICAgICAgcG9seWdvbi5hdHRyKFwic3R5bGVcIiwgY3NzU3R5bGVzKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcG9seWdvbiA9IGluc2VydFBvbHlnb25TaGFwZShzaGFwZVN2ZywgdywgaCwgcG9pbnRzKTtcbiAgfVxuICBpZiAobm9kZVN0eWxlcykge1xuICAgIHBvbHlnb24uYXR0cihcInN0eWxlXCIsIG5vZGVTdHlsZXMpO1xuICB9XG4gIG5vZGUud2lkdGggPSB3O1xuICBub2RlLmhlaWdodCA9IGg7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgcG9seWdvbik7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihub2RlLCBwb2ludHMsIHBvaW50KTtcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKHRyYXBlem9pZCwgXCJ0cmFwZXpvaWRcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL3RyYXBlem9pZGFsUGVudGFnb24udHNcbmltcG9ydCByb3VnaDUwIGZyb20gXCJyb3VnaGpzXCI7XG5hc3luYyBmdW5jdGlvbiB0cmFwZXpvaWRhbFBlbnRhZ29uKHBhcmVudCwgbm9kZSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3Qgbm9kZVBhZGRpbmcgPSBub2RlLnBhZGRpbmcgPz8gMDtcbiAgY29uc3QgbGFiZWxQYWRkaW5nWCA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IDE2IDogbm9kZVBhZGRpbmc7XG4gIGNvbnN0IGxhYmVsUGFkZGluZ1kgPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyAxMiA6IG5vZGVQYWRkaW5nO1xuICBjb25zdCBtaW5XaWR0aCA9IDE1LCBtaW5IZWlnaHQgPSA1O1xuICBpZiAobm9kZS53aWR0aCB8fCBub2RlLmhlaWdodCkge1xuICAgIG5vZGUuaGVpZ2h0ID0gKG5vZGUuaGVpZ2h0ID8/IDApIC0gbGFiZWxQYWRkaW5nWSAqIDI7XG4gICAgaWYgKG5vZGUuaGVpZ2h0IDwgbWluSGVpZ2h0KSB7XG4gICAgICBub2RlLmhlaWdodCA9IG1pbkhlaWdodDtcbiAgICB9XG4gICAgbm9kZS53aWR0aCA9IChub2RlLndpZHRoID8/IDApIC0gbGFiZWxQYWRkaW5nWCAqIDI7XG4gICAgaWYgKG5vZGUud2lkdGggPCBtaW5XaWR0aCkge1xuICAgICAgbm9kZS53aWR0aCA9IG1pbldpZHRoO1xuICAgIH1cbiAgfVxuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94IH0gPSBhd2FpdCBsYWJlbEhlbHBlcihwYXJlbnQsIG5vZGUsIGdldE5vZGVDbGFzc2VzKG5vZGUpKTtcbiAgY29uc3QgdyA9IChub2RlPy53aWR0aCA/IG5vZGU/LndpZHRoIDogYmJveC53aWR0aCkgKyBsYWJlbFBhZGRpbmdYICogMjtcbiAgY29uc3QgaCA9IChub2RlPy5oZWlnaHQgPyBub2RlPy5oZWlnaHQgOiBiYm94LmhlaWdodCkgKyBsYWJlbFBhZGRpbmdZICogMjtcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGNvbnN0IHJjID0gcm91Z2g1MC5zdmcoc2hhcGVTdmcpO1xuICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwge30pO1xuICBpZiAobm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgb3B0aW9ucy5yb3VnaG5lc3MgPSAwO1xuICAgIG9wdGlvbnMuZmlsbFN0eWxlID0gXCJzb2xpZFwiO1xuICB9XG4gIGNvbnN0IHBvaW50cyA9IFtcbiAgICB7IHg6IC13IC8gMiAqIDAuOCwgeTogLWggLyAyIH0sXG4gICAgeyB4OiB3IC8gMiAqIDAuOCwgeTogLWggLyAyIH0sXG4gICAgeyB4OiB3IC8gMiwgeTogLWggLyAyICogMC42IH0sXG4gICAgeyB4OiB3IC8gMiwgeTogaCAvIDIgfSxcbiAgICB7IHg6IC13IC8gMiwgeTogaCAvIDIgfSxcbiAgICB7IHg6IC13IC8gMiwgeTogLWggLyAyICogMC42IH1cbiAgXTtcbiAgY29uc3QgcGF0aERhdGEgPSBjcmVhdGVQYXRoRnJvbVBvaW50cyhwb2ludHMpO1xuICBjb25zdCBzaGFwZU5vZGUgPSByYy5wYXRoKHBhdGhEYXRhLCBvcHRpb25zKTtcbiAgY29uc3QgcG9seWdvbiA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiBzaGFwZU5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICBwb2x5Z29uLmF0dHIoXCJjbGFzc1wiLCBcImJhc2ljIGxhYmVsLWNvbnRhaW5lciBvdXRlci1wYXRoXCIpO1xuICBpZiAoY3NzU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIHBvbHlnb24uc2VsZWN0Q2hpbGRyZW4oXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBjc3NTdHlsZXMpO1xuICB9XG4gIGlmIChub2RlU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIHBvbHlnb24uc2VsZWN0Q2hpbGRyZW4oXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgfVxuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIHBvbHlnb24pO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgY29uc3QgcG9zID0gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihub2RlLCBwb2ludHMsIHBvaW50KTtcbiAgICByZXR1cm4gcG9zO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59XG5fX25hbWUodHJhcGV6b2lkYWxQZW50YWdvbiwgXCJ0cmFwZXpvaWRhbFBlbnRhZ29uXCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy90cmlhbmdsZS50c1xuaW1wb3J0IHJvdWdoNTEgZnJvbSBcInJvdWdoanNcIjtcbnZhciBNSU5fSEVJR0hUNSA9IDEwO1xudmFyIE1JTl9XSURUSDUgPSAxMDtcbmFzeW5jIGZ1bmN0aW9uIHRyaWFuZ2xlKHBhcmVudCwgbm9kZSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3Qgbm9kZVBhZGRpbmcgPSBub2RlLnBhZGRpbmcgPz8gMDtcbiAgY29uc3QgbGFiZWxQYWRkaW5nWCA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IG5vZGVQYWRkaW5nICogMiA6IG5vZGVQYWRkaW5nO1xuICBpZiAobm9kZS53aWR0aCB8fCBub2RlLmhlaWdodCkge1xuICAgIG5vZGUud2lkdGggPSAoKG5vZGU/LndpZHRoID8/IDApIC0gbGFiZWxQYWRkaW5nWCkgLyAyO1xuICAgIGlmIChub2RlLndpZHRoIDwgTUlOX1dJRFRINSkge1xuICAgICAgbm9kZS53aWR0aCA9IE1JTl9XSURUSDU7XG4gICAgfVxuICAgIG5vZGUuaGVpZ2h0ID0gbm9kZT8uaGVpZ2h0ID8/IDA7XG4gICAgaWYgKG5vZGUuaGVpZ2h0IDwgTUlOX0hFSUdIVDUpIHtcbiAgICAgIG5vZGUuaGVpZ2h0ID0gTUlOX0hFSUdIVDU7XG4gICAgfVxuICB9XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3gsIGxhYmVsIH0gPSBhd2FpdCBsYWJlbEhlbHBlcihwYXJlbnQsIG5vZGUsIGdldE5vZGVDbGFzc2VzKG5vZGUpKTtcbiAgY29uc3QgdXNlSHRtbExhYmVscyA9IGV2YWx1YXRlKGdldENvbmZpZzIoKS5mbG93Y2hhcnQ/Lmh0bWxMYWJlbHMpO1xuICBjb25zdCB3ID0gKG5vZGU/LndpZHRoID8gbm9kZT8ud2lkdGggOiBiYm94LndpZHRoKSArIGxhYmVsUGFkZGluZ1g7XG4gIGNvbnN0IGggPSBub2RlPy5oZWlnaHQgPyBub2RlPy5oZWlnaHQgOiB3ICsgYmJveC5oZWlnaHQ7XG4gIGNvbnN0IHR3ID0gaDtcbiAgY29uc3QgcG9pbnRzID0gW1xuICAgIHsgeDogMCwgeTogMCB9LFxuICAgIHsgeDogdHcsIHk6IDAgfSxcbiAgICB7IHg6IHR3IC8gMiwgeTogLWggfVxuICBdO1xuICBjb25zdCB7IGNzc1N0eWxlcyB9ID0gbm9kZTtcbiAgY29uc3QgcmMgPSByb3VnaDUxLnN2ZyhzaGFwZVN2Zyk7XG4gIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gIGlmIChub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBvcHRpb25zLnJvdWdobmVzcyA9IDA7XG4gICAgb3B0aW9ucy5maWxsU3R5bGUgPSBcInNvbGlkXCI7XG4gIH1cbiAgY29uc3QgcGF0aERhdGEgPSBjcmVhdGVQYXRoRnJvbVBvaW50cyhwb2ludHMpO1xuICBjb25zdCByb3VnaE5vZGUgPSByYy5wYXRoKHBhdGhEYXRhLCBvcHRpb25zKTtcbiAgY29uc3QgcG9seWdvbiA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiByb3VnaE5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgkey1oIC8gMn0sICR7aCAvIDJ9KWApLmF0dHIoXCJjbGFzc1wiLCBcIm91dGVyLXBhdGhcIik7XG4gIGlmIChjc3NTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgcG9seWdvbi5zZWxlY3RDaGlsZHJlbihcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIGNzc1N0eWxlcyk7XG4gIH1cbiAgaWYgKG5vZGVTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgcG9seWdvbi5zZWxlY3RDaGlsZHJlbihcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIG5vZGVTdHlsZXMpO1xuICB9XG4gIG5vZGUud2lkdGggPSB3O1xuICBub2RlLmhlaWdodCA9IGg7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgcG9seWdvbik7XG4gIGxhYmVsLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICBgdHJhbnNsYXRlKCR7LWJib3gud2lkdGggLyAyIC0gKGJib3gueCAtIChiYm94LmxlZnQgPz8gMCkpfSwgJHtoIC8gMiAtIChiYm94LmhlaWdodCArIChub2RlLnBhZGRpbmcgPz8gMCkgLyAodXNlSHRtbExhYmVscyA/IDIgOiAxKSAtIChiYm94LnkgLSAoYmJveC50b3AgPz8gMCkpKX0pYFxuICApO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgbG9nLmluZm8oXCJUcmlhbmdsZSBpbnRlcnNlY3RcIiwgbm9kZSwgcG9pbnRzLCBwb2ludCk7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnBvbHlnb24obm9kZSwgcG9pbnRzLCBwb2ludCk7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZSh0cmlhbmdsZSwgXCJ0cmlhbmdsZVwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvd2F2ZUVkZ2VkUmVjdGFuZ2xlLnRzXG5pbXBvcnQgcm91Z2g1MiBmcm9tIFwicm91Z2hqc1wiO1xuYXN5bmMgZnVuY3Rpb24gd2F2ZUVkZ2VkUmVjdGFuZ2xlKHBhcmVudCwgbm9kZSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3Qgbm9kZVBhZGRpbmcgPSBub2RlLnBhZGRpbmcgPz8gMDtcbiAgY29uc3QgbGFiZWxQYWRkaW5nWCA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IDE2IDogbm9kZVBhZGRpbmc7XG4gIGNvbnN0IGxhYmVsUGFkZGluZ1kgPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyAxMiA6IG5vZGVQYWRkaW5nO1xuICBsZXQgYWRqdXN0RmluYWxIZWlnaHQgPSB0cnVlO1xuICBpZiAobm9kZS53aWR0aCB8fCBub2RlLmhlaWdodCkge1xuICAgIGFkanVzdEZpbmFsSGVpZ2h0ID0gZmFsc2U7XG4gICAgbm9kZS53aWR0aCA9IChub2RlPy53aWR0aCA/PyAwKSAtIGxhYmVsUGFkZGluZ1ggKiAyO1xuICAgIGlmIChub2RlLndpZHRoIDwgMTApIHtcbiAgICAgIG5vZGUud2lkdGggPSAxMDtcbiAgICB9XG4gICAgbm9kZS5oZWlnaHQgPSAobm9kZT8uaGVpZ2h0ID8/IDApIC0gbGFiZWxQYWRkaW5nWSAqIDI7XG4gICAgaWYgKG5vZGUuaGVpZ2h0IDwgMTApIHtcbiAgICAgIG5vZGUuaGVpZ2h0ID0gMTA7XG4gICAgfVxuICB9XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3gsIGxhYmVsIH0gPSBhd2FpdCBsYWJlbEhlbHBlcihwYXJlbnQsIG5vZGUsIGdldE5vZGVDbGFzc2VzKG5vZGUpKTtcbiAgY29uc3QgdyA9IChub2RlPy53aWR0aCA/IG5vZGU/LndpZHRoIDogYmJveC53aWR0aCkgKyAobGFiZWxQYWRkaW5nWCA/PyAwKSAqIDI7XG4gIGNvbnN0IGggPSAobm9kZT8uaGVpZ2h0ID8gbm9kZT8uaGVpZ2h0IDogYmJveC5oZWlnaHQpICsgKGxhYmVsUGFkZGluZ1kgPz8gMCkgKiAyO1xuICBjb25zdCB3YXZlQW1wbGl0dWRlID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gaCAvIDQgOiBoIC8gODtcbiAgY29uc3QgZmluYWxIID0gaCArIChhZGp1c3RGaW5hbEhlaWdodCA/IHdhdmVBbXBsaXR1ZGUgOiAtd2F2ZUFtcGxpdHVkZSk7XG4gIGNvbnN0IHsgY3NzU3R5bGVzIH0gPSBub2RlO1xuICBjb25zdCBtaW5XaWR0aCA9IDE0O1xuICBjb25zdCB3aWR0aERpZiA9IG1pbldpZHRoIC0gdztcbiAgY29uc3QgZXh0cmFXID0gd2lkdGhEaWYgPiAwID8gd2lkdGhEaWYgLyAyIDogMDtcbiAgY29uc3QgcmMgPSByb3VnaDUyLnN2ZyhzaGFwZVN2Zyk7XG4gIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gIGlmIChub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBvcHRpb25zLnJvdWdobmVzcyA9IDA7XG4gICAgb3B0aW9ucy5maWxsU3R5bGUgPSBcInNvbGlkXCI7XG4gIH1cbiAgY29uc3QgcG9pbnRzID0gW1xuICAgIHsgeDogLXcgLyAyIC0gZXh0cmFXLCB5OiBmaW5hbEggLyAyIH0sXG4gICAgLi4uZ2VuZXJhdGVGdWxsU2luZVdhdmVQb2ludHMoXG4gICAgICAtdyAvIDIgLSBleHRyYVcsXG4gICAgICBmaW5hbEggLyAyLFxuICAgICAgdyAvIDIgKyBleHRyYVcsXG4gICAgICBmaW5hbEggLyAyLFxuICAgICAgd2F2ZUFtcGxpdHVkZSxcbiAgICAgIDAuOFxuICAgICksXG4gICAgeyB4OiB3IC8gMiArIGV4dHJhVywgeTogLWZpbmFsSCAvIDIgfSxcbiAgICB7IHg6IC13IC8gMiAtIGV4dHJhVywgeTogLWZpbmFsSCAvIDIgfVxuICBdO1xuICBjb25zdCB3YXZlRWRnZVJlY3RQYXRoID0gY3JlYXRlUGF0aEZyb21Qb2ludHMocG9pbnRzKTtcbiAgY29uc3Qgd2F2ZUVkZ2VSZWN0Tm9kZSA9IHJjLnBhdGgod2F2ZUVkZ2VSZWN0UGF0aCwgb3B0aW9ucyk7XG4gIGNvbnN0IHdhdmVFZGdlUmVjdCA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiB3YXZlRWRnZVJlY3ROb2RlLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgd2F2ZUVkZ2VSZWN0LmF0dHIoXCJjbGFzc1wiLCBcImJhc2ljIGxhYmVsLWNvbnRhaW5lciBvdXRlci1wYXRoXCIpO1xuICBpZiAoY3NzU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIHdhdmVFZGdlUmVjdC5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBjc3NTdHlsZXMpO1xuICB9XG4gIGlmIChub2RlU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIHdhdmVFZGdlUmVjdC5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgfVxuICB3YXZlRWRnZVJlY3QuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKDAsJHstd2F2ZUFtcGxpdHVkZSAvIDJ9KWApO1xuICBsYWJlbC5hdHRyKFxuICAgIFwidHJhbnNmb3JtXCIsXG4gICAgYHRyYW5zbGF0ZSgkey13IC8gMiArIChub2RlLnBhZGRpbmcgPz8gMCkgLSAoYmJveC54IC0gKGJib3gubGVmdCA/PyAwKSl9LCR7LWggLyAyICsgKG5vZGUucGFkZGluZyA/PyAwKSAtIHdhdmVBbXBsaXR1ZGUgLSAoYmJveC55IC0gKGJib3gudG9wID8/IDApKX0pYFxuICApO1xuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIHdhdmVFZGdlUmVjdCk7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICBjb25zdCBwb3MgPSBpbnRlcnNlY3RfZGVmYXVsdC5wb2x5Z29uKG5vZGUsIHBvaW50cywgcG9pbnQpO1xuICAgIHJldHVybiBwb3M7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZSh3YXZlRWRnZWRSZWN0YW5nbGUsIFwid2F2ZUVkZ2VkUmVjdGFuZ2xlXCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy93YXZlUmVjdGFuZ2xlLnRzXG5pbXBvcnQgcm91Z2g1MyBmcm9tIFwicm91Z2hqc1wiO1xuYXN5bmMgZnVuY3Rpb24gd2F2ZVJlY3RhbmdsZShwYXJlbnQsIG5vZGUpIHtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcywgbm9kZVN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IG5vZGVQYWRkaW5nID0gbm9kZS5wYWRkaW5nID8/IDA7XG4gIGNvbnN0IGxhYmVsUGFkZGluZ1ggPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyAxNiA6IG5vZGVQYWRkaW5nO1xuICBjb25zdCBsYWJlbFBhZGRpbmdZID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gMjAgOiBub2RlUGFkZGluZztcbiAgaWYgKG5vZGUud2lkdGggfHwgbm9kZS5oZWlnaHQpIHtcbiAgICBub2RlLndpZHRoID0gbm9kZT8ud2lkdGggPz8gMDtcbiAgICBpZiAobm9kZS53aWR0aCA8IDIwKSB7XG4gICAgICBub2RlLndpZHRoID0gMjA7XG4gICAgfVxuICAgIG5vZGUuaGVpZ2h0ID0gbm9kZT8uaGVpZ2h0ID8/IDA7XG4gICAgaWYgKG5vZGUuaGVpZ2h0IDwgMTApIHtcbiAgICAgIG5vZGUuaGVpZ2h0ID0gMTA7XG4gICAgfVxuICAgIGNvbnN0IHdhdmVBbXBsaXR1ZGUyID0gTWF0aC5taW4obm9kZS5oZWlnaHQgKiAwLjIsIG5vZGUuaGVpZ2h0IC8gNCk7XG4gICAgbm9kZS5oZWlnaHQgPSBNYXRoLmNlaWwobm9kZS5oZWlnaHQgLSBsYWJlbFBhZGRpbmdZIC0gd2F2ZUFtcGxpdHVkZTIgKiAoMjAgLyA5KSk7XG4gICAgbm9kZS53aWR0aCA9IG5vZGUud2lkdGggLSBsYWJlbFBhZGRpbmdYICogMjtcbiAgfVxuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94IH0gPSBhd2FpdCBsYWJlbEhlbHBlcihwYXJlbnQsIG5vZGUsIGdldE5vZGVDbGFzc2VzKG5vZGUpKTtcbiAgY29uc3QgdyA9IChub2RlPy53aWR0aCA/IG5vZGU/LndpZHRoIDogYmJveC53aWR0aCkgKyBsYWJlbFBhZGRpbmdYICogMjtcbiAgY29uc3QgaCA9IChub2RlPy5oZWlnaHQgPyBub2RlPy5oZWlnaHQgOiBiYm94LmhlaWdodCkgKyBsYWJlbFBhZGRpbmdZO1xuICBjb25zdCB3YXZlQW1wbGl0dWRlID0gaCAvIDg7XG4gIGNvbnN0IGZpbmFsSCA9IGggKyB3YXZlQW1wbGl0dWRlICogMjtcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGNvbnN0IHJjID0gcm91Z2g1My5zdmcoc2hhcGVTdmcpO1xuICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwge30pO1xuICBpZiAobm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgb3B0aW9ucy5yb3VnaG5lc3MgPSAwO1xuICAgIG9wdGlvbnMuZmlsbFN0eWxlID0gXCJzb2xpZFwiO1xuICB9XG4gIGNvbnN0IHBvaW50cyA9IFtcbiAgICB7IHg6IC13IC8gMiwgeTogZmluYWxIIC8gMiB9LFxuICAgIC4uLmdlbmVyYXRlRnVsbFNpbmVXYXZlUG9pbnRzKC13IC8gMiwgZmluYWxIIC8gMiwgdyAvIDIsIGZpbmFsSCAvIDIsIHdhdmVBbXBsaXR1ZGUsIDEpLFxuICAgIHsgeDogdyAvIDIsIHk6IC1maW5hbEggLyAyIH0sXG4gICAgLi4uZ2VuZXJhdGVGdWxsU2luZVdhdmVQb2ludHModyAvIDIsIC1maW5hbEggLyAyLCAtdyAvIDIsIC1maW5hbEggLyAyLCB3YXZlQW1wbGl0dWRlLCAtMSlcbiAgXTtcbiAgY29uc3Qgd2F2ZVJlY3RQYXRoID0gY3JlYXRlUGF0aEZyb21Qb2ludHMocG9pbnRzKTtcbiAgY29uc3Qgd2F2ZVJlY3ROb2RlID0gcmMucGF0aCh3YXZlUmVjdFBhdGgsIG9wdGlvbnMpO1xuICBjb25zdCB3YXZlUmVjdCA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiB3YXZlUmVjdE5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICB3YXZlUmVjdC5hdHRyKFwiY2xhc3NcIiwgXCJiYXNpYyBsYWJlbC1jb250YWluZXJcIik7XG4gIGlmIChjc3NTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgd2F2ZVJlY3Quc2VsZWN0QWxsKFwicGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgY3NzU3R5bGVzKTtcbiAgfVxuICBpZiAobm9kZVN0eWxlcyAmJiBub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICB3YXZlUmVjdC5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgfVxuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIHdhdmVSZWN0KTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIGNvbnN0IHBvcyA9IGludGVyc2VjdF9kZWZhdWx0LnBvbHlnb24obm9kZSwgcG9pbnRzLCBwb2ludCk7XG4gICAgcmV0dXJuIHBvcztcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKHdhdmVSZWN0YW5nbGUsIFwid2F2ZVJlY3RhbmdsZVwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvd2luZG93UGFuZS50c1xuaW1wb3J0IHJvdWdoNTQgZnJvbSBcInJvdWdoanNcIjtcbnZhciByZWN0T2Zmc2V0ID0gMTA7XG5hc3luYyBmdW5jdGlvbiB3aW5kb3dQYW5lKHBhcmVudCwgbm9kZSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3QgcGFkZGluZ1ggPSBub2RlLmxvb2sgPT09IFwibmVvXCIgPyAxNiA6IG5vZGUucGFkZGluZyA/PyAwO1xuICBjb25zdCBwYWRkaW5nWSA9IG5vZGUubG9vayA9PT0gXCJuZW9cIiA/IDEyIDogbm9kZS5wYWRkaW5nID8/IDA7XG4gIGlmIChub2RlLndpZHRoIHx8IG5vZGUuaGVpZ2h0KSB7XG4gICAgbm9kZS53aWR0aCA9IE1hdGgubWF4KChub2RlPy53aWR0aCA/PyAwKSAtIHBhZGRpbmdYICogMiAtIHJlY3RPZmZzZXQsIDEwKTtcbiAgICBub2RlLmhlaWdodCA9IE1hdGgubWF4KChub2RlPy5oZWlnaHQgPz8gMCkgLSBwYWRkaW5nWSAqIDIgLSByZWN0T2Zmc2V0LCAxMCk7XG4gIH1cbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCwgbGFiZWwgfSA9IGF3YWl0IGxhYmVsSGVscGVyKHBhcmVudCwgbm9kZSwgZ2V0Tm9kZUNsYXNzZXMobm9kZSkpO1xuICBjb25zdCB0b3RhbFdpZHRoID0gKG5vZGU/LndpZHRoID8gbm9kZT8ud2lkdGggOiBiYm94LndpZHRoKSArIHBhZGRpbmdYICogMiArIHJlY3RPZmZzZXQ7XG4gIGNvbnN0IHRvdGFsSGVpZ2h0ID0gKG5vZGU/LmhlaWdodCA/IG5vZGU/LmhlaWdodCA6IGJib3guaGVpZ2h0KSArIHBhZGRpbmdZICogMiArIHJlY3RPZmZzZXQ7XG4gIGNvbnN0IHcgPSB0b3RhbFdpZHRoIC0gcmVjdE9mZnNldDtcbiAgY29uc3QgaCA9IHRvdGFsSGVpZ2h0IC0gcmVjdE9mZnNldDtcbiAgY29uc3QgeCA9IC13IC8gMjtcbiAgY29uc3QgeSA9IC1oIC8gMjtcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGNvbnN0IHJjID0gcm91Z2g1NC5zdmcoc2hhcGVTdmcpO1xuICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwge30pO1xuICBjb25zdCBvdXRlclBhdGhQb2ludHMgPSBbXG4gICAgeyB4OiB4IC0gcmVjdE9mZnNldCwgeTogeSAtIHJlY3RPZmZzZXQgfSxcbiAgICB7IHg6IHggLSByZWN0T2Zmc2V0LCB5OiB5ICsgaCB9LFxuICAgIHsgeDogeCArIHcsIHk6IHkgKyBoIH0sXG4gICAgeyB4OiB4ICsgdywgeTogeSAtIHJlY3RPZmZzZXQgfVxuICBdO1xuICBjb25zdCBwYXRoID0gYE0ke3ggLSByZWN0T2Zmc2V0fSwke3kgLSByZWN0T2Zmc2V0fSBMJHt4ICsgd30sJHt5IC0gcmVjdE9mZnNldH0gTCR7eCArIHd9LCR7eSArIGh9IEwke3ggLSByZWN0T2Zmc2V0fSwke3kgKyBofSBMJHt4IC0gcmVjdE9mZnNldH0sJHt5IC0gcmVjdE9mZnNldH1cbiAgICAgICAgICAgICAgICBNJHt4IC0gcmVjdE9mZnNldH0sJHt5fSBMJHt4ICsgd30sJHt5fVxuICAgICAgICAgICAgICAgIE0ke3h9LCR7eSAtIHJlY3RPZmZzZXR9IEwke3h9LCR7eSArIGh9YDtcbiAgaWYgKG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIG9wdGlvbnMucm91Z2huZXNzID0gMDtcbiAgICBvcHRpb25zLmZpbGxTdHlsZSA9IFwic29saWRcIjtcbiAgfVxuICBjb25zdCBubyA9IHJjLnBhdGgocGF0aCwgb3B0aW9ucyk7XG4gIGNvbnN0IHdpbmRvd1BhbmUyID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IG5vLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgd2luZG93UGFuZTIuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7cmVjdE9mZnNldCAvIDJ9LCAke3JlY3RPZmZzZXQgLyAyfSlgKTtcbiAgd2luZG93UGFuZTIuYXR0cihcImNsYXNzXCIsIFwiYmFzaWMgbGFiZWwtY29udGFpbmVyIG91dGVyLXBhdGhcIik7XG4gIGlmIChjc3NTdHlsZXMgJiYgbm9kZS5sb29rICE9PSBcImhhbmREcmF3blwiKSB7XG4gICAgd2luZG93UGFuZTIuc2VsZWN0QWxsKFwicGF0aFwiKS5hdHRyKFwic3R5bGVcIiwgY3NzU3R5bGVzKTtcbiAgfVxuICBpZiAobm9kZVN0eWxlcyAmJiBub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICB3aW5kb3dQYW5lMi5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgfVxuICBsYWJlbC5hdHRyKFxuICAgIFwidHJhbnNmb3JtXCIsXG4gICAgYHRyYW5zbGF0ZSgkey0oYmJveC53aWR0aCAvIDIpICsgcmVjdE9mZnNldCAvIDIgLSAoYmJveC54IC0gKGJib3gubGVmdCA/PyAwKSl9LCAkey0oYmJveC5oZWlnaHQgLyAyKSArIHJlY3RPZmZzZXQgLyAyIC0gKGJib3gueSAtIChiYm94LnRvcCA/PyAwKSl9KWBcbiAgKTtcbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCB3aW5kb3dQYW5lMik7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICBjb25zdCBwb3MgPSBpbnRlcnNlY3RfZGVmYXVsdC5wb2x5Z29uKG5vZGUsIG91dGVyUGF0aFBvaW50cywgcG9pbnQpO1xuICAgIHJldHVybiBwb3M7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZSh3aW5kb3dQYW5lLCBcIndpbmRvd1BhbmVcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL2VyQm94LnRzXG5pbXBvcnQgcm91Z2g1NSBmcm9tIFwicm91Z2hqc1wiO1xuaW1wb3J0IHsgc2VsZWN0IGFzIHNlbGVjdDQgfSBmcm9tIFwiZDNcIjtcbnZhciBDT0xPUl9USEVNRVMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldChbXCJyZWR1eC1jb2xvclwiLCBcInJlZHV4LWRhcmstY29sb3JcIl0pO1xudmFyIFJFRFVYX1RIRU1FUyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KFtcInJlZHV4XCIsIFwicmVkdXgtZGFya1wiLCBcInJlZHV4LWNvbG9yXCIsIFwicmVkdXgtZGFyay1jb2xvclwiXSk7XG5hc3luYyBmdW5jdGlvbiBlckJveChwYXJlbnQsIG5vZGUpIHtcbiAgY29uc3QgZW50aXR5Tm9kZSA9IG5vZGU7XG4gIGlmIChlbnRpdHlOb2RlLmFsaWFzKSB7XG4gICAgbm9kZS5sYWJlbCA9IGVudGl0eU5vZGUuYWxpYXM7XG4gIH1cbiAgY29uc3QgeyB0aGVtZSwgdGhlbWVWYXJpYWJsZXMgfSA9IGdldENvbmZpZygpO1xuICBjb25zdCB7IHJvd0V2ZW4sIHJvd09kZCwgbm9kZUJvcmRlciwgYm9yZGVyQ29sb3JBcnJheSB9ID0gdGhlbWVWYXJpYWJsZXM7XG4gIGlmIChub2RlLmxvb2sgPT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBjb25zdCB7IHRoZW1lVmFyaWFibGVzOiB0aGVtZVZhcmlhYmxlczIgfSA9IGdldENvbmZpZygpO1xuICAgIGNvbnN0IHsgYmFja2dyb3VuZCB9ID0gdGhlbWVWYXJpYWJsZXMyO1xuICAgIGNvbnN0IGJhY2tncm91bmROb2RlID0ge1xuICAgICAgLi4ubm9kZSxcbiAgICAgIGlkOiBub2RlLmlkICsgXCItYmFja2dyb3VuZFwiLFxuICAgICAgZG9tSWQ6IChub2RlLmRvbUlkIHx8IG5vZGUuaWQpICsgXCItYmFja2dyb3VuZFwiLFxuICAgICAgbG9vazogXCJkZWZhdWx0XCIsXG4gICAgICBjc3NTdHlsZXM6IFtcInN0cm9rZTogbm9uZVwiLCBgZmlsbDogJHtiYWNrZ3JvdW5kfWBdXG4gICAgfTtcbiAgICBhd2FpdCBlckJveChwYXJlbnQsIGJhY2tncm91bmROb2RlKTtcbiAgfVxuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgbm9kZS51c2VIdG1sTGFiZWxzID0gY29uZmlnLmh0bWxMYWJlbHM7XG4gIGxldCBQQURESU5HID0gY29uZmlnLmVyPy5kaWFncmFtUGFkZGluZyA/PyAxMDtcbiAgbGV0IFRFWFRfUEFERElORyA9IGNvbmZpZy5lcj8uZW50aXR5UGFkZGluZyA/PyA2O1xuICBjb25zdCB7IGNzc1N0eWxlcyB9ID0gbm9kZTtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcywgbm9kZVN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgaWYgKGVudGl0eU5vZGUuYXR0cmlidXRlcy5sZW5ndGggPT09IDAgJiYgbm9kZS5sYWJlbCkge1xuICAgIGNvbnN0IG9wdGlvbnMyID0ge1xuICAgICAgcng6IDAsXG4gICAgICByeTogMCxcbiAgICAgIGxhYmVsUGFkZGluZ1g6IFBBRERJTkcsXG4gICAgICBsYWJlbFBhZGRpbmdZOiBQQURESU5HICogMS41LFxuICAgICAgY2xhc3NlczogXCJcIlxuICAgIH07XG4gICAgaWYgKGNhbGN1bGF0ZVRleHRXaWR0aChub2RlLmxhYmVsLCBjb25maWcpICsgb3B0aW9uczIubGFiZWxQYWRkaW5nWCAqIDIgPCBjb25maWcuZXIubWluRW50aXR5V2lkdGgpIHtcbiAgICAgIG5vZGUud2lkdGggPSBjb25maWcuZXIubWluRW50aXR5V2lkdGg7XG4gICAgfVxuICAgIGNvbnN0IHNoYXBlU3ZnMiA9IGF3YWl0IGRyYXdSZWN0KHBhcmVudCwgbm9kZSwgb3B0aW9uczIpO1xuICAgIGlmICh0aGVtZSAhPSBudWxsICYmIENPTE9SX1RIRU1FUy5oYXModGhlbWUpKSB7XG4gICAgICBjb25zdCBjb2xvckluZGV4ID0gZW50aXR5Tm9kZS5jb2xvckluZGV4ID8/IDA7XG4gICAgICBzaGFwZVN2ZzIuYXR0cihcImRhdGEtY29sb3ItaWRcIiwgYGNvbG9yLSR7Y29sb3JJbmRleCAlIGJvcmRlckNvbG9yQXJyYXkubGVuZ3RofWApO1xuICAgIH1cbiAgICBpZiAoIWV2YWx1YXRlKGNvbmZpZy5odG1sTGFiZWxzKSkge1xuICAgICAgY29uc3QgdGV4dEVsZW1lbnQgPSBzaGFwZVN2ZzIuc2VsZWN0KFwidGV4dFwiKTtcbiAgICAgIGNvbnN0IGJib3ggPSB0ZXh0RWxlbWVudC5ub2RlKCk/LmdldEJCb3goKTtcbiAgICAgIHRleHRFbGVtZW50LmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgkey1iYm94LndpZHRoIC8gMn0sIDApYCk7XG4gICAgfVxuICAgIHJldHVybiBzaGFwZVN2ZzI7XG4gIH1cbiAgaWYgKCFjb25maWcuaHRtbExhYmVscykge1xuICAgIFBBRERJTkcgKj0gMS4yNTtcbiAgICBURVhUX1BBRERJTkcgKj0gMS4yNTtcbiAgfVxuICBsZXQgY3NzQ2xhc3NlcyA9IGdldE5vZGVDbGFzc2VzKG5vZGUpO1xuICBpZiAoIWNzc0NsYXNzZXMpIHtcbiAgICBjc3NDbGFzc2VzID0gXCJub2RlIGRlZmF1bHRcIjtcbiAgfVxuICBjb25zdCBzaGFwZVN2ZyA9IHBhcmVudC5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBjc3NDbGFzc2VzKS5hdHRyKFwiaWRcIiwgbm9kZS5kb21JZCB8fCBub2RlLmlkKTtcbiAgY29uc3QgbmFtZUJCb3ggPSBhd2FpdCBhZGRUZXh0KHNoYXBlU3ZnLCBub2RlLmxhYmVsID8/IFwiXCIsIGNvbmZpZywgMCwgMCwgW1wibmFtZVwiXSwgbGFiZWxTdHlsZXMpO1xuICBuYW1lQkJveC5oZWlnaHQgKz0gVEVYVF9QQURESU5HO1xuICBsZXQgeU9mZnNldCA9IDA7XG4gIGNvbnN0IHlPZmZzZXRzID0gW107XG4gIGNvbnN0IHJvd3MgPSBbXTtcbiAgbGV0IG1heFR5cGVXaWR0aCA9IDA7XG4gIGxldCBtYXhOYW1lV2lkdGggPSAwO1xuICBsZXQgbWF4S2V5c1dpZHRoID0gMDtcbiAgbGV0IG1heENvbW1lbnRXaWR0aCA9IDA7XG4gIGxldCBrZXlzUHJlc2VudCA9IHRydWU7XG4gIGxldCBjb21tZW50UHJlc2VudCA9IHRydWU7XG4gIGZvciAoY29uc3QgYXR0cmlidXRlIG9mIGVudGl0eU5vZGUuYXR0cmlidXRlcykge1xuICAgIGNvbnN0IHR5cGVCQm94ID0gYXdhaXQgYWRkVGV4dChcbiAgICAgIHNoYXBlU3ZnLFxuICAgICAgYXR0cmlidXRlLnR5cGUsXG4gICAgICBjb25maWcsXG4gICAgICAwLFxuICAgICAgeU9mZnNldCxcbiAgICAgIFtcImF0dHJpYnV0ZS10eXBlXCJdLFxuICAgICAgbGFiZWxTdHlsZXNcbiAgICApO1xuICAgIG1heFR5cGVXaWR0aCA9IE1hdGgubWF4KG1heFR5cGVXaWR0aCwgdHlwZUJCb3gud2lkdGggKyBQQURESU5HKTtcbiAgICBjb25zdCBuYW1lQkJveDIgPSBhd2FpdCBhZGRUZXh0KFxuICAgICAgc2hhcGVTdmcsXG4gICAgICBhdHRyaWJ1dGUubmFtZSxcbiAgICAgIGNvbmZpZyxcbiAgICAgIDAsXG4gICAgICB5T2Zmc2V0LFxuICAgICAgW1wiYXR0cmlidXRlLW5hbWVcIl0sXG4gICAgICBsYWJlbFN0eWxlc1xuICAgICk7XG4gICAgbWF4TmFtZVdpZHRoID0gTWF0aC5tYXgobWF4TmFtZVdpZHRoLCBuYW1lQkJveDIud2lkdGggKyBQQURESU5HKTtcbiAgICBjb25zdCBrZXlzQkJveCA9IGF3YWl0IGFkZFRleHQoXG4gICAgICBzaGFwZVN2ZyxcbiAgICAgIGF0dHJpYnV0ZS5rZXlzLmpvaW4oKSxcbiAgICAgIGNvbmZpZyxcbiAgICAgIDAsXG4gICAgICB5T2Zmc2V0LFxuICAgICAgW1wiYXR0cmlidXRlLWtleXNcIl0sXG4gICAgICBsYWJlbFN0eWxlc1xuICAgICk7XG4gICAgbWF4S2V5c1dpZHRoID0gTWF0aC5tYXgobWF4S2V5c1dpZHRoLCBrZXlzQkJveC53aWR0aCArIFBBRERJTkcpO1xuICAgIGNvbnN0IGNvbW1lbnRCQm94ID0gYXdhaXQgYWRkVGV4dChcbiAgICAgIHNoYXBlU3ZnLFxuICAgICAgYXR0cmlidXRlLmNvbW1lbnQsXG4gICAgICBjb25maWcsXG4gICAgICAwLFxuICAgICAgeU9mZnNldCxcbiAgICAgIFtcImF0dHJpYnV0ZS1jb21tZW50XCJdLFxuICAgICAgbGFiZWxTdHlsZXNcbiAgICApO1xuICAgIG1heENvbW1lbnRXaWR0aCA9IE1hdGgubWF4KG1heENvbW1lbnRXaWR0aCwgY29tbWVudEJCb3gud2lkdGggKyBQQURESU5HKTtcbiAgICBjb25zdCByb3dIZWlnaHQgPSBNYXRoLm1heCh0eXBlQkJveC5oZWlnaHQsIG5hbWVCQm94Mi5oZWlnaHQsIGtleXNCQm94LmhlaWdodCwgY29tbWVudEJCb3guaGVpZ2h0KSArIFRFWFRfUEFERElORztcbiAgICByb3dzLnB1c2goeyB5T2Zmc2V0LCByb3dIZWlnaHQgfSk7XG4gICAgeU9mZnNldCArPSByb3dIZWlnaHQ7XG4gIH1cbiAgbGV0IHRvdGFsV2lkdGhTZWN0aW9ucyA9IDQ7XG4gIGlmIChtYXhLZXlzV2lkdGggPD0gUEFERElORykge1xuICAgIGtleXNQcmVzZW50ID0gZmFsc2U7XG4gICAgbWF4S2V5c1dpZHRoID0gMDtcbiAgICB0b3RhbFdpZHRoU2VjdGlvbnMtLTtcbiAgfVxuICBpZiAobWF4Q29tbWVudFdpZHRoIDw9IFBBRERJTkcpIHtcbiAgICBjb21tZW50UHJlc2VudCA9IGZhbHNlO1xuICAgIG1heENvbW1lbnRXaWR0aCA9IDA7XG4gICAgdG90YWxXaWR0aFNlY3Rpb25zLS07XG4gIH1cbiAgY29uc3Qgc2hhcGVCQm94ID0gc2hhcGVTdmcubm9kZSgpLmdldEJCb3goKTtcbiAgaWYgKG5hbWVCQm94LndpZHRoICsgUEFERElORyAqIDIgLSAobWF4VHlwZVdpZHRoICsgbWF4TmFtZVdpZHRoICsgbWF4S2V5c1dpZHRoICsgbWF4Q29tbWVudFdpZHRoKSA+IDApIHtcbiAgICBjb25zdCBkaWZmZXJlbmNlID0gbmFtZUJCb3gud2lkdGggKyBQQURESU5HICogMiAtIChtYXhUeXBlV2lkdGggKyBtYXhOYW1lV2lkdGggKyBtYXhLZXlzV2lkdGggKyBtYXhDb21tZW50V2lkdGgpO1xuICAgIG1heFR5cGVXaWR0aCArPSBkaWZmZXJlbmNlIC8gdG90YWxXaWR0aFNlY3Rpb25zO1xuICAgIG1heE5hbWVXaWR0aCArPSBkaWZmZXJlbmNlIC8gdG90YWxXaWR0aFNlY3Rpb25zO1xuICAgIGlmIChtYXhLZXlzV2lkdGggPiAwKSB7XG4gICAgICBtYXhLZXlzV2lkdGggKz0gZGlmZmVyZW5jZSAvIHRvdGFsV2lkdGhTZWN0aW9ucztcbiAgICB9XG4gICAgaWYgKG1heENvbW1lbnRXaWR0aCA+IDApIHtcbiAgICAgIG1heENvbW1lbnRXaWR0aCArPSBkaWZmZXJlbmNlIC8gdG90YWxXaWR0aFNlY3Rpb25zO1xuICAgIH1cbiAgfVxuICBjb25zdCBtYXhXaWR0aCA9IG1heFR5cGVXaWR0aCArIG1heE5hbWVXaWR0aCArIG1heEtleXNXaWR0aCArIG1heENvbW1lbnRXaWR0aDtcbiAgY29uc3QgcmMgPSByb3VnaDU1LnN2ZyhzaGFwZVN2Zyk7XG4gIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gIGlmIChub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBvcHRpb25zLnJvdWdobmVzcyA9IDA7XG4gICAgb3B0aW9ucy5maWxsU3R5bGUgPSBcInNvbGlkXCI7XG4gIH1cbiAgbGV0IHRvdGFsU2hhcGVCQm94SGVpZ2h0ID0gMDtcbiAgaWYgKHJvd3MubGVuZ3RoID4gMCkge1xuICAgIHRvdGFsU2hhcGVCQm94SGVpZ2h0ID0gcm93cy5yZWR1Y2UoKHN1bSwgcm93KSA9PiBzdW0gKyAocm93Py5yb3dIZWlnaHQgPz8gMCksIDApO1xuICB9XG4gIGNvbnN0IHcgPSBNYXRoLm1heChzaGFwZUJCb3gud2lkdGggKyBQQURESU5HICogMiwgbm9kZT8ud2lkdGggfHwgMCwgbWF4V2lkdGgpO1xuICBjb25zdCBoID0gTWF0aC5tYXgoKHRvdGFsU2hhcGVCQm94SGVpZ2h0ID8/IDApICsgbmFtZUJCb3guaGVpZ2h0LCBub2RlPy5oZWlnaHQgfHwgMCk7XG4gIGNvbnN0IHggPSAtdyAvIDI7XG4gIGNvbnN0IHkgPSAtaCAvIDI7XG4gIHNoYXBlU3ZnLnNlbGVjdEFsbChcImc6bm90KDpmaXJzdC1jaGlsZClcIikuZWFjaCgoXywgaSwgbm9kZXMpID0+IHtcbiAgICBjb25zdCB0ZXh0MiA9IHNlbGVjdDQobm9kZXNbaV0pO1xuICAgIGNvbnN0IHRyYW5zZm9ybSA9IHRleHQyLmF0dHIoXCJ0cmFuc2Zvcm1cIik7XG4gICAgbGV0IHRyYW5zbGF0ZVggPSAwO1xuICAgIGxldCB0cmFuc2xhdGVZID0gMDtcbiAgICBpZiAodHJhbnNmb3JtKSB7XG4gICAgICBjb25zdCByZWdleCA9IFJlZ0V4cCgvdHJhbnNsYXRlXFwoKFteLF0rKSwoW14pXSspXFwpLyk7XG4gICAgICBjb25zdCB0cmFuc2xhdGUgPSByZWdleC5leGVjKHRyYW5zZm9ybSk7XG4gICAgICBpZiAodHJhbnNsYXRlKSB7XG4gICAgICAgIHRyYW5zbGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zbGF0ZVsxXSk7XG4gICAgICAgIHRyYW5zbGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zbGF0ZVsyXSk7XG4gICAgICAgIGlmICh0ZXh0Mi5hdHRyKFwiY2xhc3NcIikuaW5jbHVkZXMoXCJhdHRyaWJ1dGUtbmFtZVwiKSkge1xuICAgICAgICAgIHRyYW5zbGF0ZVggKz0gbWF4VHlwZVdpZHRoO1xuICAgICAgICB9IGVsc2UgaWYgKHRleHQyLmF0dHIoXCJjbGFzc1wiKS5pbmNsdWRlcyhcImF0dHJpYnV0ZS1rZXlzXCIpKSB7XG4gICAgICAgICAgdHJhbnNsYXRlWCArPSBtYXhUeXBlV2lkdGggKyBtYXhOYW1lV2lkdGg7XG4gICAgICAgIH0gZWxzZSBpZiAodGV4dDIuYXR0cihcImNsYXNzXCIpLmluY2x1ZGVzKFwiYXR0cmlidXRlLWNvbW1lbnRcIikpIHtcbiAgICAgICAgICB0cmFuc2xhdGVYICs9IG1heFR5cGVXaWR0aCArIG1heE5hbWVXaWR0aCArIG1heEtleXNXaWR0aDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0ZXh0Mi5hdHRyKFxuICAgICAgXCJ0cmFuc2Zvcm1cIixcbiAgICAgIGB0cmFuc2xhdGUoJHt4ICsgUEFERElORyAvIDIgKyB0cmFuc2xhdGVYfSwgJHt0cmFuc2xhdGVZICsgeSArIG5hbWVCQm94LmhlaWdodCArIFRFWFRfUEFERElORyAvIDJ9KWBcbiAgICApO1xuICB9KTtcbiAgc2hhcGVTdmcuc2VsZWN0KFwiLm5hbWVcIikuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIC1uYW1lQkJveC53aWR0aCAvIDIgKyBcIiwgXCIgKyAoeSArIFRFWFRfUEFERElORyAvIDIpICsgXCIpXCIpO1xuICBpZiAodGhlbWUgIT0gbnVsbCAmJiBDT0xPUl9USEVNRVMuaGFzKHRoZW1lKSkge1xuICAgIGNvbnN0IGNvbG9ySW5kZXggPSBlbnRpdHlOb2RlLmNvbG9ySW5kZXggPz8gMDtcbiAgICBzaGFwZVN2Zy5hdHRyKFwiZGF0YS1jb2xvci1pZFwiLCBgY29sb3ItJHtjb2xvckluZGV4ICUgYm9yZGVyQ29sb3JBcnJheS5sZW5ndGh9YCk7XG4gIH1cbiAgY29uc3Qgcm91Z2hSZWN0ID0gcmMucmVjdGFuZ2xlKHgsIHksIHcsIGgsIG9wdGlvbnMpO1xuICBjb25zdCByZWN0MiA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiByb3VnaFJlY3QsIFwiOmZpcnN0LWNoaWxkXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm91dGVyLXBhdGhcIikuYXR0cihcInN0eWxlXCIsIGNzc1N0eWxlcy5qb2luKFwiXCIpKTtcbiAgeU9mZnNldHMucHVzaCgwKTtcbiAgZm9yIChjb25zdCBbaSwgcm93XSBvZiByb3dzLmVudHJpZXMoKSkge1xuICAgIGNvbnN0IGNvbnRlbnRSb3dJbmRleCA9IGkgKyAxO1xuICAgIGNvbnN0IGlzRXZlbiA9IGNvbnRlbnRSb3dJbmRleCAlIDIgPT09IDAgJiYgcm93LnlPZmZzZXQgIT09IDA7XG4gICAgY29uc3Qgcm91Z2hSZWN0MiA9IHJjLnJlY3RhbmdsZSh4LCBuYW1lQkJveC5oZWlnaHQgKyB5ICsgcm93Py55T2Zmc2V0LCB3LCByb3c/LnJvd0hlaWdodCwge1xuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIGZpbGw6IGlzRXZlbiA/IHJvd0V2ZW4gOiByb3dPZGQsXG4gICAgICBzdHJva2U6IG5vZGVCb3JkZXJcbiAgICB9KTtcbiAgICBzaGFwZVN2Zy5pbnNlcnQoKCkgPT4gcm91Z2hSZWN0MiwgXCJnLmxhYmVsXCIpLmF0dHIoXCJzdHlsZVwiLCBjc3NTdHlsZXMuam9pbihcIlwiKSkuYXR0cihcImNsYXNzXCIsIGByb3ctcmVjdC0ke2lzRXZlbiA/IFwiZXZlblwiIDogXCJvZGRcIn1gKTtcbiAgfVxuICBjb25zdCB0aGlja25lc3MgPSAxZS00O1xuICBsZXQgcG9pbnRzID0gbGluZVRvUG9seWdvbih4LCBuYW1lQkJveC5oZWlnaHQgKyB5LCB3ICsgeCwgbmFtZUJCb3guaGVpZ2h0ICsgeSwgdGhpY2tuZXNzKTtcbiAgbGV0IHJvdWdoTGluZSA9IHJjLnBvbHlnb24oXG4gICAgcG9pbnRzLm1hcCgocCkgPT4gW3AueCwgcC55XSksXG4gICAgb3B0aW9uc1xuICApO1xuICBzaGFwZVN2Zy5pbnNlcnQoKCkgPT4gcm91Z2hMaW5lKS5hdHRyKFwiY2xhc3NcIiwgXCJkaXZpZGVyXCIpO1xuICBwb2ludHMgPSBsaW5lVG9Qb2x5Z29uKG1heFR5cGVXaWR0aCArIHgsIG5hbWVCQm94LmhlaWdodCArIHksIG1heFR5cGVXaWR0aCArIHgsIGggKyB5LCB0aGlja25lc3MpO1xuICByb3VnaExpbmUgPSByYy5wb2x5Z29uKFxuICAgIHBvaW50cy5tYXAoKHApID0+IFtwLngsIHAueV0pLFxuICAgIG9wdGlvbnNcbiAgKTtcbiAgc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHJvdWdoTGluZSkuYXR0cihcImNsYXNzXCIsIFwiZGl2aWRlclwiKTtcbiAgaWYgKGtleXNQcmVzZW50KSB7XG4gICAgY29uc3QgeENvb3JkID0gbWF4VHlwZVdpZHRoICsgbWF4TmFtZVdpZHRoICsgeDtcbiAgICBwb2ludHMgPSBsaW5lVG9Qb2x5Z29uKHhDb29yZCwgbmFtZUJCb3guaGVpZ2h0ICsgeSwgeENvb3JkLCBoICsgeSwgdGhpY2tuZXNzKTtcbiAgICByb3VnaExpbmUgPSByYy5wb2x5Z29uKFxuICAgICAgcG9pbnRzLm1hcCgocCkgPT4gW3AueCwgcC55XSksXG4gICAgICBvcHRpb25zXG4gICAgKTtcbiAgICBzaGFwZVN2Zy5pbnNlcnQoKCkgPT4gcm91Z2hMaW5lKS5hdHRyKFwiY2xhc3NcIiwgXCJkaXZpZGVyXCIpO1xuICB9XG4gIGlmIChjb21tZW50UHJlc2VudCkge1xuICAgIGNvbnN0IHhDb29yZCA9IG1heFR5cGVXaWR0aCArIG1heE5hbWVXaWR0aCArIG1heEtleXNXaWR0aCArIHg7XG4gICAgcG9pbnRzID0gbGluZVRvUG9seWdvbih4Q29vcmQsIG5hbWVCQm94LmhlaWdodCArIHksIHhDb29yZCwgaCArIHksIHRoaWNrbmVzcyk7XG4gICAgcm91Z2hMaW5lID0gcmMucG9seWdvbihcbiAgICAgIHBvaW50cy5tYXAoKHApID0+IFtwLngsIHAueV0pLFxuICAgICAgb3B0aW9uc1xuICAgICk7XG4gICAgc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHJvdWdoTGluZSkuYXR0cihcImNsYXNzXCIsIFwiZGl2aWRlclwiKTtcbiAgfVxuICBmb3IgKGNvbnN0IHlPZmZzZXQyIG9mIHlPZmZzZXRzKSB7XG4gICAgY29uc3QgeUNvb3JkID0gbmFtZUJCb3guaGVpZ2h0ICsgeSArIHlPZmZzZXQyO1xuICAgIHBvaW50cyA9IGxpbmVUb1BvbHlnb24oeCwgeUNvb3JkLCB3ICsgeCwgeUNvb3JkLCB0aGlja25lc3MpO1xuICAgIHJvdWdoTGluZSA9IHJjLnBvbHlnb24oXG4gICAgICBwb2ludHMubWFwKChwKSA9PiBbcC54LCBwLnldKSxcbiAgICAgIG9wdGlvbnNcbiAgICApO1xuICAgIHNoYXBlU3ZnLmluc2VydCgoKSA9PiByb3VnaExpbmUpLmF0dHIoXCJjbGFzc1wiLCBcImRpdmlkZXJcIik7XG4gIH1cbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCByZWN0Mik7XG4gIGlmIChub2RlU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIGlmICh0aGVtZSAhPSBudWxsICYmIFJFRFVYX1RIRU1FUy5oYXModGhlbWUpKSB7XG4gICAgICBzaGFwZVN2Zy5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgYWxsU3R5bGUgPSBub2RlU3R5bGVzLnNwbGl0KFwiO1wiKTtcbiAgICAgIGNvbnN0IHN0cm9rZVN0eWxlcyA9IGFsbFN0eWxlPy5maWx0ZXIoKGUpID0+IHtcbiAgICAgICAgcmV0dXJuIGUuaW5jbHVkZXMoXCJzdHJva2VcIik7XG4gICAgICB9KT8ubWFwKChzKSA9PiBgJHtzfWApLmpvaW4oXCI7IFwiKTtcbiAgICAgIHNoYXBlU3ZnLnNlbGVjdEFsbChcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIHN0cm9rZVN0eWxlcyA/PyBcIlwiKTtcbiAgICAgIHNoYXBlU3ZnLnNlbGVjdEFsbChcIi5yb3ctcmVjdC1ldmVuIHBhdGhcIikuYXR0cihcInN0eWxlXCIsIG5vZGVTdHlsZXMpO1xuICAgIH1cbiAgfVxuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnJlY3Qobm9kZSwgcG9pbnQpO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59XG5fX25hbWUoZXJCb3gsIFwiZXJCb3hcIik7XG5hc3luYyBmdW5jdGlvbiBhZGRUZXh0KHNoYXBlU3ZnLCBsYWJlbFRleHQsIGNvbmZpZywgdHJhbnNsYXRlWCA9IDAsIHRyYW5zbGF0ZVkgPSAwLCBjbGFzc2VzID0gW10sIHN0eWxlID0gXCJcIikge1xuICBjb25zdCBsYWJlbCA9IHNoYXBlU3ZnLmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIGBsYWJlbCAke2NsYXNzZXMuam9pbihcIiBcIil9YCkuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7dHJhbnNsYXRlWH0sICR7dHJhbnNsYXRlWX0pYCkuYXR0cihcInN0eWxlXCIsIHN0eWxlKTtcbiAgaWYgKGxhYmVsVGV4dCAhPT0gcGFyc2VHZW5lcmljVHlwZXMobGFiZWxUZXh0KSkge1xuICAgIGxhYmVsVGV4dCA9IHBhcnNlR2VuZXJpY1R5cGVzKGxhYmVsVGV4dCk7XG4gICAgbGFiZWxUZXh0ID0gbGFiZWxUZXh0LnJlcGxhY2VBbGwoXCI8XCIsIFwiJmx0O1wiKS5yZXBsYWNlQWxsKFwiPlwiLCBcIiZndDtcIik7XG4gIH1cbiAgY29uc3QgdGV4dDIgPSBsYWJlbC5ub2RlKCkuYXBwZW5kQ2hpbGQoXG4gICAgYXdhaXQgY3JlYXRlVGV4dChcbiAgICAgIGxhYmVsLFxuICAgICAgbGFiZWxUZXh0LFxuICAgICAge1xuICAgICAgICB3aWR0aDogY2FsY3VsYXRlVGV4dFdpZHRoKGxhYmVsVGV4dCwgY29uZmlnKSArIDEwMCxcbiAgICAgICAgc3R5bGUsXG4gICAgICAgIHVzZUh0bWxMYWJlbHM6IGNvbmZpZy5odG1sTGFiZWxzXG4gICAgICB9LFxuICAgICAgY29uZmlnXG4gICAgKVxuICApO1xuICBpZiAobGFiZWxUZXh0LmluY2x1ZGVzKFwiJmx0O1wiKSB8fCBsYWJlbFRleHQuaW5jbHVkZXMoXCImZ3Q7XCIpKSB7XG4gICAgbGV0IGNoaWxkID0gdGV4dDIuY2hpbGRyZW5bMF07XG4gICAgY2hpbGQudGV4dENvbnRlbnQgPSBjaGlsZC50ZXh0Q29udGVudC5yZXBsYWNlQWxsKFwiJmx0O1wiLCBcIjxcIikucmVwbGFjZUFsbChcIiZndDtcIiwgXCI+XCIpO1xuICAgIHdoaWxlIChjaGlsZC5jaGlsZE5vZGVzWzBdKSB7XG4gICAgICBjaGlsZCA9IGNoaWxkLmNoaWxkTm9kZXNbMF07XG4gICAgICBjaGlsZC50ZXh0Q29udGVudCA9IGNoaWxkLnRleHRDb250ZW50LnJlcGxhY2VBbGwoXCImbHQ7XCIsIFwiPFwiKS5yZXBsYWNlQWxsKFwiJmd0O1wiLCBcIj5cIik7XG4gICAgfVxuICB9XG4gIGxldCBiYm94ID0gdGV4dDIuZ2V0QkJveCgpO1xuICBpZiAoZXZhbHVhdGUoY29uZmlnLmh0bWxMYWJlbHMpKSB7XG4gICAgY29uc3QgZGl2ID0gdGV4dDIuY2hpbGRyZW5bMF07XG4gICAgZGl2LnN0eWxlLnRleHRBbGlnbiA9IFwic3RhcnRcIjtcbiAgICBjb25zdCBkdiA9IHNlbGVjdDQodGV4dDIpO1xuICAgIGJib3ggPSBkaXYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgZHYuYXR0cihcIndpZHRoXCIsIGJib3gud2lkdGgpO1xuICAgIGR2LmF0dHIoXCJoZWlnaHRcIiwgYmJveC5oZWlnaHQpO1xuICB9XG4gIHJldHVybiBiYm94O1xufVxuX19uYW1lKGFkZFRleHQsIFwiYWRkVGV4dFwiKTtcbmZ1bmN0aW9uIGxpbmVUb1BvbHlnb24oeDEsIHkxLCB4MiwgeTIsIHRoaWNrbmVzcykge1xuICBpZiAoeDEgPT09IHgyKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHsgeDogeDEgLSB0aGlja25lc3MgLyAyLCB5OiB5MSB9LFxuICAgICAgeyB4OiB4MSArIHRoaWNrbmVzcyAvIDIsIHk6IHkxIH0sXG4gICAgICB7IHg6IHgyICsgdGhpY2tuZXNzIC8gMiwgeTogeTIgfSxcbiAgICAgIHsgeDogeDIgLSB0aGlja25lc3MgLyAyLCB5OiB5MiB9XG4gICAgXTtcbiAgfVxuICByZXR1cm4gW1xuICAgIHsgeDogeDEsIHk6IHkxIC0gdGhpY2tuZXNzIC8gMiB9LFxuICAgIHsgeDogeDEsIHk6IHkxICsgdGhpY2tuZXNzIC8gMiB9LFxuICAgIHsgeDogeDIsIHk6IHkyICsgdGhpY2tuZXNzIC8gMiB9LFxuICAgIHsgeDogeDIsIHk6IHkyIC0gdGhpY2tuZXNzIC8gMiB9XG4gIF07XG59XG5fX25hbWUobGluZVRvUG9seWdvbiwgXCJsaW5lVG9Qb2x5Z29uXCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy9jbGFzc0JveC50c1xuaW1wb3J0IHsgc2VsZWN0IGFzIHNlbGVjdDYgfSBmcm9tIFwiZDNcIjtcbmltcG9ydCByb3VnaDU2IGZyb20gXCJyb3VnaGpzXCI7XG5cbi8vIHNyYy9kaWFncmFtcy9jbGFzcy9zaGFwZVV0aWwudHNcbmltcG9ydCB7IHNlbGVjdCBhcyBzZWxlY3Q1IH0gZnJvbSBcImQzXCI7XG5hc3luYyBmdW5jdGlvbiB0ZXh0SGVscGVyKHBhcmVudCwgbm9kZSwgY29uZmlnLCB1c2VIdG1sTGFiZWxzLCBHQVAgPSBjb25maWcuY2xhc3MucGFkZGluZyA/PyAxMikge1xuICBjb25zdCBURVhUX1BBRERJTkcgPSAhdXNlSHRtbExhYmVscyA/IDMgOiAwO1xuICBjb25zdCBzaGFwZVN2ZyA9IHBhcmVudC5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBnZXROb2RlQ2xhc3Nlcyhub2RlKSkuYXR0cihcImlkXCIsIG5vZGUuZG9tSWQgfHwgbm9kZS5pZCk7XG4gIGxldCBhbm5vdGF0aW9uR3JvdXAgPSBudWxsO1xuICBsZXQgbGFiZWxHcm91cCA9IG51bGw7XG4gIGxldCBtZW1iZXJzR3JvdXAgPSBudWxsO1xuICBsZXQgbWV0aG9kc0dyb3VwID0gbnVsbDtcbiAgbGV0IGFubm90YXRpb25Hcm91cEhlaWdodCA9IDA7XG4gIGxldCBsYWJlbEdyb3VwSGVpZ2h0ID0gMDtcbiAgbGV0IG1lbWJlcnNHcm91cEhlaWdodCA9IDA7XG4gIGFubm90YXRpb25Hcm91cCA9IHNoYXBlU3ZnLmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIFwiYW5ub3RhdGlvbi1ncm91cCB0ZXh0XCIpO1xuICBpZiAobm9kZS5hbm5vdGF0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgYW5ub3RhdGlvbiA9IG5vZGUuYW5ub3RhdGlvbnNbMF07XG4gICAgYXdhaXQgYWRkVGV4dDIoYW5ub3RhdGlvbkdyb3VwLCB7IHRleHQ6IGBcXHhBQiR7YW5ub3RhdGlvbn1cXHhCQmAgfSwgMCk7XG4gICAgY29uc3QgYW5ub3RhdGlvbkdyb3VwQkJveCA9IGFubm90YXRpb25Hcm91cC5ub2RlKCkuZ2V0QkJveCgpO1xuICAgIGFubm90YXRpb25Hcm91cEhlaWdodCA9IGFubm90YXRpb25Hcm91cEJCb3guaGVpZ2h0O1xuICB9XG4gIGxhYmVsR3JvdXAgPSBzaGFwZVN2Zy5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImxhYmVsLWdyb3VwIHRleHRcIik7XG4gIGF3YWl0IGFkZFRleHQyKGxhYmVsR3JvdXAsIG5vZGUsIDAsIFtcImZvbnQtd2VpZ2h0OiBib2xkZXJcIl0pO1xuICBjb25zdCBsYWJlbEdyb3VwQkJveCA9IGxhYmVsR3JvdXAubm9kZSgpLmdldEJCb3goKTtcbiAgbGFiZWxHcm91cEhlaWdodCA9IGxhYmVsR3JvdXBCQm94LmhlaWdodDtcbiAgbWVtYmVyc0dyb3VwID0gc2hhcGVTdmcuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJtZW1iZXJzLWdyb3VwIHRleHRcIik7XG4gIGxldCB5T2Zmc2V0ID0gMDtcbiAgZm9yIChjb25zdCBtZW1iZXIgb2Ygbm9kZS5tZW1iZXJzKSB7XG4gICAgY29uc3QgaGVpZ2h0ID0gYXdhaXQgYWRkVGV4dDIobWVtYmVyc0dyb3VwLCBtZW1iZXIsIHlPZmZzZXQsIFttZW1iZXIucGFyc2VDbGFzc2lmaWVyKCldKTtcbiAgICB5T2Zmc2V0ICs9IGhlaWdodCArIFRFWFRfUEFERElORztcbiAgfVxuICBtZW1iZXJzR3JvdXBIZWlnaHQgPSBtZW1iZXJzR3JvdXAubm9kZSgpLmdldEJCb3goKS5oZWlnaHQ7XG4gIGlmIChtZW1iZXJzR3JvdXBIZWlnaHQgPD0gMCkge1xuICAgIG1lbWJlcnNHcm91cEhlaWdodCA9IEdBUCAvIDI7XG4gIH1cbiAgbWV0aG9kc0dyb3VwID0gc2hhcGVTdmcuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJtZXRob2RzLWdyb3VwIHRleHRcIik7XG4gIGxldCBtZXRob2RzWU9mZnNldCA9IDA7XG4gIGZvciAoY29uc3QgbWV0aG9kIG9mIG5vZGUubWV0aG9kcykge1xuICAgIGNvbnN0IGhlaWdodCA9IGF3YWl0IGFkZFRleHQyKG1ldGhvZHNHcm91cCwgbWV0aG9kLCBtZXRob2RzWU9mZnNldCwgW21ldGhvZC5wYXJzZUNsYXNzaWZpZXIoKV0pO1xuICAgIG1ldGhvZHNZT2Zmc2V0ICs9IGhlaWdodCArIFRFWFRfUEFERElORztcbiAgfVxuICBsZXQgYmJveCA9IHNoYXBlU3ZnLm5vZGUoKS5nZXRCQm94KCk7XG4gIGlmIChhbm5vdGF0aW9uR3JvdXAgIT09IG51bGwpIHtcbiAgICBjb25zdCBhbm5vdGF0aW9uR3JvdXBCQm94ID0gYW5ub3RhdGlvbkdyb3VwLm5vZGUoKS5nZXRCQm94KCk7XG4gICAgYW5ub3RhdGlvbkdyb3VwLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgkey1hbm5vdGF0aW9uR3JvdXBCQm94LndpZHRoIC8gMn0pYCk7XG4gIH1cbiAgbGFiZWxHcm91cC5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHstbGFiZWxHcm91cEJCb3gud2lkdGggLyAyfSwgJHthbm5vdGF0aW9uR3JvdXBIZWlnaHR9KWApO1xuICBiYm94ID0gc2hhcGVTdmcubm9kZSgpLmdldEJCb3goKTtcbiAgbWVtYmVyc0dyb3VwLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICBgdHJhbnNsYXRlKCR7MH0sICR7YW5ub3RhdGlvbkdyb3VwSGVpZ2h0ICsgbGFiZWxHcm91cEhlaWdodCArIEdBUCAqIDJ9KWBcbiAgKTtcbiAgYmJveCA9IHNoYXBlU3ZnLm5vZGUoKS5nZXRCQm94KCk7XG4gIG1ldGhvZHNHcm91cC5hdHRyKFxuICAgIFwidHJhbnNmb3JtXCIsXG4gICAgYHRyYW5zbGF0ZSgkezB9LCAke2Fubm90YXRpb25Hcm91cEhlaWdodCArIGxhYmVsR3JvdXBIZWlnaHQgKyAobWVtYmVyc0dyb3VwSGVpZ2h0ID8gbWVtYmVyc0dyb3VwSGVpZ2h0ICsgR0FQICogNCA6IEdBUCAqIDIpfSlgXG4gICk7XG4gIGJib3ggPSBzaGFwZVN2Zy5ub2RlKCkuZ2V0QkJveCgpO1xuICByZXR1cm4geyBzaGFwZVN2ZywgYmJveCB9O1xufVxuX19uYW1lKHRleHRIZWxwZXIsIFwidGV4dEhlbHBlclwiKTtcbmFzeW5jIGZ1bmN0aW9uIGFkZFRleHQyKHBhcmVudEdyb3VwLCBub2RlLCB5T2Zmc2V0LCBzdHlsZXMgPSBbXSkge1xuICBjb25zdCB0ZXh0RWwgPSBwYXJlbnRHcm91cC5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImxhYmVsXCIpLmF0dHIoXCJzdHlsZVwiLCBzdHlsZXMuam9pbihcIjsgXCIpKTtcbiAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIGxldCB1c2VIdG1sTGFiZWxzID0gXCJ1c2VIdG1sTGFiZWxzXCIgaW4gbm9kZSA/IG5vZGUudXNlSHRtbExhYmVscyA6IGV2YWx1YXRlKGNvbmZpZy5odG1sTGFiZWxzKSA/PyB0cnVlO1xuICBsZXQgdGV4dENvbnRlbnQgPSBcIlwiO1xuICBpZiAoXCJ0ZXh0XCIgaW4gbm9kZSkge1xuICAgIHRleHRDb250ZW50ID0gbm9kZS50ZXh0O1xuICB9IGVsc2Uge1xuICAgIHRleHRDb250ZW50ID0gbm9kZS5sYWJlbDtcbiAgfVxuICBpZiAoIXVzZUh0bWxMYWJlbHMgJiYgdGV4dENvbnRlbnQuc3RhcnRzV2l0aChcIlxcXFxcIikpIHtcbiAgICB0ZXh0Q29udGVudCA9IHRleHRDb250ZW50LnN1YnN0cmluZygxKTtcbiAgfVxuICBpZiAoaGFzS2F0ZXgodGV4dENvbnRlbnQpKSB7XG4gICAgdXNlSHRtbExhYmVscyA9IHRydWU7XG4gIH1cbiAgY29uc3QgdGV4dDIgPSBhd2FpdCBjcmVhdGVUZXh0KFxuICAgIHRleHRFbCxcbiAgICBzYW5pdGl6ZVRleHQyKGRlY29kZUVudGl0aWVzKHRleHRDb250ZW50KSksXG4gICAge1xuICAgICAgd2lkdGg6IGNhbGN1bGF0ZVRleHRXaWR0aCh0ZXh0Q29udGVudCwgY29uZmlnKSArIDUwLFxuICAgICAgLy8gQWRkIHJvb20gZm9yIGVycm9yIHdoZW4gc3BsaXR0aW5nIHRleHQgaW50byBtdWx0aXBsZSBsaW5lc1xuICAgICAgY2xhc3NlczogXCJtYXJrZG93bi1ub2RlLWxhYmVsXCIsXG4gICAgICB1c2VIdG1sTGFiZWxzXG4gICAgfSxcbiAgICBjb25maWdcbiAgKTtcbiAgbGV0IGJib3g7XG4gIGxldCBudW1iZXJPZkxpbmVzID0gMTtcbiAgaWYgKCF1c2VIdG1sTGFiZWxzKSB7XG4gICAgaWYgKHN0eWxlcy5pbmNsdWRlcyhcImZvbnQtd2VpZ2h0OiBib2xkZXJcIikpIHtcbiAgICAgIHNlbGVjdDUodGV4dDIpLnNlbGVjdEFsbChcInRzcGFuXCIpLmF0dHIoXCJmb250LXdlaWdodFwiLCBcIlwiKTtcbiAgICB9XG4gICAgbnVtYmVyT2ZMaW5lcyA9IHRleHQyLmNoaWxkcmVuLmxlbmd0aDtcbiAgICBjb25zdCB0ZXh0Q2hpbGQgPSB0ZXh0Mi5jaGlsZHJlblswXTtcbiAgICBpZiAodGV4dDIudGV4dENvbnRlbnQgPT09IFwiXCIgfHwgdGV4dDIudGV4dENvbnRlbnQuaW5jbHVkZXMoXCImZ3RcIikpIHtcbiAgICAgIHRleHRDaGlsZC50ZXh0Q29udGVudCA9IHRleHRDb250ZW50WzBdICsgdGV4dENvbnRlbnQuc3Vic3RyaW5nKDEpLnJlcGxhY2VBbGwoXCImZ3Q7XCIsIFwiPlwiKS5yZXBsYWNlQWxsKFwiJmx0O1wiLCBcIjxcIikudHJpbSgpO1xuICAgICAgY29uc3QgcHJlc2VydmVTcGFjZSA9IHRleHRDb250ZW50WzFdID09PSBcIiBcIjtcbiAgICAgIGlmIChwcmVzZXJ2ZVNwYWNlKSB7XG4gICAgICAgIHRleHRDaGlsZC50ZXh0Q29udGVudCA9IHRleHRDaGlsZC50ZXh0Q29udGVudFswXSArIFwiIFwiICsgdGV4dENoaWxkLnRleHRDb250ZW50LnN1YnN0cmluZygxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRleHRDaGlsZC50ZXh0Q29udGVudCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGV4dENoaWxkLnRleHRDb250ZW50ID0gXCJcIjtcbiAgICB9XG4gICAgYmJveCA9IHRleHQyLmdldEJCb3goKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBkaXYgPSB0ZXh0Mi5jaGlsZHJlblswXTtcbiAgICBjb25zdCBkdiA9IHNlbGVjdDUodGV4dDIpO1xuICAgIG51bWJlck9mTGluZXMgPSBkaXYuaW5uZXJIVE1MLnNwbGl0KFwiPGJyPlwiKS5sZW5ndGg7XG4gICAgaWYgKGRpdi5pbm5lckhUTUwuaW5jbHVkZXMoXCI8L21hdGg+XCIpKSB7XG4gICAgICBudW1iZXJPZkxpbmVzICs9IGRpdi5pbm5lckhUTUwuc3BsaXQoXCI8bXJvdz5cIikubGVuZ3RoIC0gMTtcbiAgICB9XG4gICAgY29uc3QgaW1hZ2VzID0gZGl2LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaW1nXCIpO1xuICAgIGlmIChpbWFnZXMpIHtcbiAgICAgIGNvbnN0IG5vSW1nVGV4dCA9IHRleHRDb250ZW50LnJlcGxhY2UoLzxpbWdbXj5dKj4vZywgXCJcIikudHJpbSgpID09PSBcIlwiO1xuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgIFsuLi5pbWFnZXNdLm1hcChcbiAgICAgICAgICAoaW1nKSA9PiBuZXcgUHJvbWlzZSgocmVzKSA9PiB7XG4gICAgICAgICAgICBmdW5jdGlvbiBzZXR1cEltYWdlKCkge1xuICAgICAgICAgICAgICBpbWcuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgICAgICAgICBpbWcuc3R5bGUuZmxleERpcmVjdGlvbiA9IFwiY29sdW1uXCI7XG4gICAgICAgICAgICAgIGlmIChub0ltZ1RleHQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBib2R5Rm9udFNpemUgPSBjb25maWcuZm9udFNpemU/LnRvU3RyaW5nKCkgPz8gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZG9jdW1lbnQuYm9keSkuZm9udFNpemU7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5sYXJnaW5nRmFjdG9yID0gNTtcbiAgICAgICAgICAgICAgICBjb25zdCB3aWR0aCA9IHBhcnNlSW50KGJvZHlGb250U2l6ZSwgMTApICogZW5sYXJnaW5nRmFjdG9yICsgXCJweFwiO1xuICAgICAgICAgICAgICAgIGltZy5zdHlsZS5taW5XaWR0aCA9IHdpZHRoO1xuICAgICAgICAgICAgICAgIGltZy5zdHlsZS5tYXhXaWR0aCA9IHdpZHRoO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGltZy5zdHlsZS53aWR0aCA9IFwiMTAwJVwiO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJlcyhpbWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX19uYW1lKHNldHVwSW1hZ2UsIFwic2V0dXBJbWFnZVwiKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICBpZiAoaW1nLmNvbXBsZXRlKSB7XG4gICAgICAgICAgICAgICAgc2V0dXBJbWFnZSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGltZy5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgc2V0dXBJbWFnZSk7XG4gICAgICAgICAgICBpbWcuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgc2V0dXBJbWFnZSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gICAgYmJveCA9IGRpdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBkdi5hdHRyKFwid2lkdGhcIiwgYmJveC53aWR0aCk7XG4gICAgZHYuYXR0cihcImhlaWdodFwiLCBiYm94LmhlaWdodCk7XG4gIH1cbiAgdGV4dEVsLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCxcIiArICgtYmJveC5oZWlnaHQgLyAoMiAqIG51bWJlck9mTGluZXMpICsgeU9mZnNldCkgKyBcIilcIik7XG4gIHJldHVybiBiYm94LmhlaWdodDtcbn1cbl9fbmFtZShhZGRUZXh0MiwgXCJhZGRUZXh0XCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy9jbGFzc0JveC50c1xuYXN5bmMgZnVuY3Rpb24gY2xhc3NCb3gocGFyZW50LCBub2RlKSB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZzIoKTtcbiAgY29uc3QgeyB0aGVtZVZhcmlhYmxlcyB9ID0gY29uZmlnO1xuICBjb25zdCB7IHVzZUdyYWRpZW50IH0gPSB0aGVtZVZhcmlhYmxlcztcbiAgY29uc3QgUEFERElORyA9IGNvbmZpZy5jbGFzcy5wYWRkaW5nID8/IDEyO1xuICBjb25zdCBHQVAgPSBQQURESU5HO1xuICBjb25zdCB1c2VIdG1sTGFiZWxzID0gbm9kZS51c2VIdG1sTGFiZWxzID8/IGV2YWx1YXRlKGNvbmZpZy5odG1sTGFiZWxzKSA/PyB0cnVlO1xuICBjb25zdCBjbGFzc05vZGUgPSBub2RlO1xuICBjbGFzc05vZGUuYW5ub3RhdGlvbnMgPSBjbGFzc05vZGUuYW5ub3RhdGlvbnMgPz8gW107XG4gIGNsYXNzTm9kZS5tZW1iZXJzID0gY2xhc3NOb2RlLm1lbWJlcnMgPz8gW107XG4gIGNsYXNzTm9kZS5tZXRob2RzID0gY2xhc3NOb2RlLm1ldGhvZHMgPz8gW107XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3ggfSA9IGF3YWl0IHRleHRIZWxwZXIocGFyZW50LCBub2RlLCBjb25maWcsIHVzZUh0bWxMYWJlbHMsIEdBUCk7XG4gIGNvbnN0IHsgbGFiZWxTdHlsZXMsIG5vZGVTdHlsZXMgfSA9IHN0eWxlczJTdHJpbmcobm9kZSk7XG4gIG5vZGUubGFiZWxTdHlsZSA9IGxhYmVsU3R5bGVzO1xuICBub2RlLmNzc1N0eWxlcyA9IGNsYXNzTm9kZS5zdHlsZXMgfHwgXCJcIjtcbiAgY29uc3Qgc3R5bGVzID0gY2xhc3NOb2RlLnN0eWxlcz8uam9pbihcIjtcIikgfHwgbm9kZVN0eWxlcyB8fCBcIlwiO1xuICBpZiAoIW5vZGUuY3NzU3R5bGVzKSB7XG4gICAgbm9kZS5jc3NTdHlsZXMgPSBzdHlsZXMucmVwbGFjZUFsbChcIiFpbXBvcnRhbnRcIiwgXCJcIikuc3BsaXQoXCI7XCIpO1xuICB9XG4gIGNvbnN0IHJlbmRlckV4dHJhQm94ID0gY2xhc3NOb2RlLm1lbWJlcnMubGVuZ3RoID09PSAwICYmIGNsYXNzTm9kZS5tZXRob2RzLmxlbmd0aCA9PT0gMCAmJiAhY29uZmlnLmNsYXNzPy5oaWRlRW1wdHlNZW1iZXJzQm94O1xuICBjb25zdCByYyA9IHJvdWdoNTYuc3ZnKHNoYXBlU3ZnKTtcbiAgY29uc3Qgb3B0aW9ucyA9IHVzZXJOb2RlT3ZlcnJpZGVzKG5vZGUsIHt9KTtcbiAgaWYgKG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIikge1xuICAgIG9wdGlvbnMucm91Z2huZXNzID0gMDtcbiAgICBvcHRpb25zLmZpbGxTdHlsZSA9IFwic29saWRcIjtcbiAgfVxuICBjb25zdCB3ID0gTWF0aC5tYXgobm9kZS53aWR0aCA/PyAwLCBiYm94LndpZHRoKTtcbiAgbGV0IGggPSBNYXRoLm1heChub2RlLmhlaWdodCA/PyAwLCBiYm94LmhlaWdodCk7XG4gIGNvbnN0IG5vZGVIZWlnaHRHcmVhdGVyID0gKG5vZGUuaGVpZ2h0ID8/IDApID4gYmJveC5oZWlnaHQ7XG4gIGlmIChjbGFzc05vZGUubWVtYmVycy5sZW5ndGggPT09IDAgJiYgY2xhc3NOb2RlLm1ldGhvZHMubGVuZ3RoID09PSAwKSB7XG4gICAgaCArPSBHQVA7XG4gIH0gZWxzZSBpZiAoY2xhc3NOb2RlLm1lbWJlcnMubGVuZ3RoID4gMCAmJiBjbGFzc05vZGUubWV0aG9kcy5sZW5ndGggPT09IDApIHtcbiAgICBoICs9IEdBUCAqIDI7XG4gIH1cbiAgY29uc3QgeCA9IC13IC8gMjtcbiAgY29uc3QgeSA9IC1oIC8gMjtcbiAgbGV0IGV4dHJhSGVpZ2h0ID0gcmVuZGVyRXh0cmFCb3ggPyBQQURESU5HICogMiA6IGNsYXNzTm9kZS5tZW1iZXJzLmxlbmd0aCA9PT0gMCAmJiBjbGFzc05vZGUubWV0aG9kcy5sZW5ndGggPT09IDAgPyAtUEFERElORyA6IDA7XG4gIGlmIChub2RlSGVpZ2h0R3JlYXRlcikge1xuICAgIGV4dHJhSGVpZ2h0ID0gUEFERElORyAqIDI7XG4gIH1cbiAgY29uc3Qgcm91Z2hSZWN0ID0gcmMucmVjdGFuZ2xlKFxuICAgIHggLSBQQURESU5HLFxuICAgIHkgLSBQQURESU5HIC0gKHJlbmRlckV4dHJhQm94ID8gUEFERElORyA6IGNsYXNzTm9kZS5tZW1iZXJzLmxlbmd0aCA9PT0gMCAmJiBjbGFzc05vZGUubWV0aG9kcy5sZW5ndGggPT09IDAgPyAtUEFERElORyAvIDIgOiAwKSxcbiAgICB3ICsgMiAqIFBBRERJTkcsXG4gICAgaCArIDIgKiBQQURESU5HICsgZXh0cmFIZWlnaHQsXG4gICAgb3B0aW9uc1xuICApO1xuICBjb25zdCByZWN0MiA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiByb3VnaFJlY3QsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICByZWN0Mi5hdHRyKFwiY2xhc3NcIiwgXCJiYXNpYyBsYWJlbC1jb250YWluZXIgb3V0ZXItcGF0aFwiKTtcbiAgY29uc3QgcmVjdEJCb3ggPSByZWN0Mi5ub2RlKCkuZ2V0QkJveCgpO1xuICBjb25zdCBhbm5vdGF0aW9uR3JvdXBIZWlnaHQgPSBzaGFwZVN2Zy5zZWxlY3QoXCIuYW5ub3RhdGlvbi1ncm91cFwiKS5ub2RlKCkuZ2V0QkJveCgpLmhlaWdodCAtIChyZW5kZXJFeHRyYUJveCA/IFBBRERJTkcgLyAyIDogMCkgfHwgMDtcbiAgY29uc3QgbGFiZWxHcm91cEhlaWdodCA9IHNoYXBlU3ZnLnNlbGVjdChcIi5sYWJlbC1ncm91cFwiKS5ub2RlKCkuZ2V0QkJveCgpLmhlaWdodCAtIChyZW5kZXJFeHRyYUJveCA/IFBBRERJTkcgLyAyIDogMCkgfHwgMDtcbiAgY29uc3QgbWVtYmVyc0dyb3VwSGVpZ2h0ID0gc2hhcGVTdmcuc2VsZWN0KFwiLm1lbWJlcnMtZ3JvdXBcIikubm9kZSgpLmdldEJCb3goKS5oZWlnaHQgLSAocmVuZGVyRXh0cmFCb3ggPyBQQURESU5HIC8gMiA6IDApIHx8IDA7XG4gIGNvbnN0IG1ldGhvZHNBcmVhUGxhY2VtZW50ID0gKGFubm90YXRpb25Hcm91cEhlaWdodCArIGxhYmVsR3JvdXBIZWlnaHQgKyB5ICsgUEFERElORyAtICh5IC0gUEFERElORyAtIChyZW5kZXJFeHRyYUJveCA/IFBBRERJTkcgOiBjbGFzc05vZGUubWVtYmVycy5sZW5ndGggPT09IDAgJiYgY2xhc3NOb2RlLm1ldGhvZHMubGVuZ3RoID09PSAwID8gLVBBRERJTkcgLyAyIDogMCkpKSAvIDI7XG4gIHNoYXBlU3ZnLnNlbGVjdEFsbChcIi50ZXh0XCIpLmVhY2goKF8sIGksIG5vZGVzKSA9PiB7XG4gICAgY29uc3QgdGV4dDIgPSBzZWxlY3Q2KG5vZGVzW2ldKTtcbiAgICBjb25zdCB0cmFuc2Zvcm0gPSB0ZXh0Mi5hdHRyKFwidHJhbnNmb3JtXCIpO1xuICAgIGxldCB0cmFuc2xhdGVZID0gMDtcbiAgICBpZiAodHJhbnNmb3JtKSB7XG4gICAgICBjb25zdCByZWdleCA9IFJlZ0V4cCgvdHJhbnNsYXRlXFwoKFteLF0rKSwoW14pXSspXFwpLyk7XG4gICAgICBjb25zdCB0cmFuc2xhdGUgPSByZWdleC5leGVjKHRyYW5zZm9ybSk7XG4gICAgICBpZiAodHJhbnNsYXRlKSB7XG4gICAgICAgIHRyYW5zbGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zbGF0ZVsyXSk7XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBuZXdUcmFuc2xhdGVZID0gdHJhbnNsYXRlWSArIHkgKyBQQURESU5HIC0gKHJlbmRlckV4dHJhQm94ID8gUEFERElORyA6IGNsYXNzTm9kZS5tZW1iZXJzLmxlbmd0aCA9PT0gMCAmJiBjbGFzc05vZGUubWV0aG9kcy5sZW5ndGggPT09IDAgPyAtUEFERElORyAvIDIgOiAwKTtcbiAgICBpZiAodGV4dDIuYXR0cihcImNsYXNzXCIpLmluY2x1ZGVzKFwibWV0aG9kcy1ncm91cFwiKSkge1xuICAgICAgY29uc3QgbWVtYmVyc0dyb3VwSGVpZ2h0Rm9yTWV0aG9kcyA9IE1hdGgubWF4KG1lbWJlcnNHcm91cEhlaWdodCwgR0FQIC8gMik7XG4gICAgICBpZiAobm9kZUhlaWdodEdyZWF0ZXIpIHtcbiAgICAgICAgbmV3VHJhbnNsYXRlWSA9IE1hdGgubWF4KFxuICAgICAgICAgIG1ldGhvZHNBcmVhUGxhY2VtZW50LFxuICAgICAgICAgIGFubm90YXRpb25Hcm91cEhlaWdodCArIGxhYmVsR3JvdXBIZWlnaHQgKyBtZW1iZXJzR3JvdXBIZWlnaHRGb3JNZXRob2RzICsgeSArIEdBUCAqIDIgKyBQQURESU5HXG4gICAgICAgICkgKyBHQVAgKiAyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3VHJhbnNsYXRlWSA9IGFubm90YXRpb25Hcm91cEhlaWdodCArIGxhYmVsR3JvdXBIZWlnaHQgKyBtZW1iZXJzR3JvdXBIZWlnaHRGb3JNZXRob2RzICsgeSArIEdBUCAqIDQgKyBQQURESU5HO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY2xhc3NOb2RlLm1lbWJlcnMubGVuZ3RoID09PSAwICYmIGNsYXNzTm9kZS5tZXRob2RzLmxlbmd0aCA9PT0gMCAmJiBjb25maWcuY2xhc3M/LmhpZGVFbXB0eU1lbWJlcnNCb3gpIHtcbiAgICAgIGlmIChjbGFzc05vZGUuYW5ub3RhdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICBuZXdUcmFuc2xhdGVZID0gdHJhbnNsYXRlWSAtIEdBUDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld1RyYW5zbGF0ZVkgPSB0cmFuc2xhdGVZO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXVzZUh0bWxMYWJlbHMpIHtcbiAgICAgIG5ld1RyYW5zbGF0ZVkgLT0gNDtcbiAgICB9XG4gICAgbGV0IG5ld1RyYW5zbGF0ZVggPSB4O1xuICAgIGlmICh0ZXh0Mi5hdHRyKFwiY2xhc3NcIikuaW5jbHVkZXMoXCJsYWJlbC1ncm91cFwiKSB8fCB0ZXh0Mi5hdHRyKFwiY2xhc3NcIikuaW5jbHVkZXMoXCJhbm5vdGF0aW9uLWdyb3VwXCIpKSB7XG4gICAgICBuZXdUcmFuc2xhdGVYID0gLXRleHQyLm5vZGUoKT8uZ2V0QkJveCgpLndpZHRoIC8gMiB8fCAwO1xuICAgICAgc2hhcGVTdmcuc2VsZWN0QWxsKFwidGV4dFwiKS5lYWNoKGZ1bmN0aW9uKF8yLCBpMiwgbm9kZXMyKSB7XG4gICAgICAgIGlmICh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShub2RlczJbaTJdKS50ZXh0QW5jaG9yID09PSBcIm1pZGRsZVwiKSB7XG4gICAgICAgICAgbmV3VHJhbnNsYXRlWCA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICB0ZXh0Mi5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHtuZXdUcmFuc2xhdGVYfSwgJHtuZXdUcmFuc2xhdGVZfSlgKTtcbiAgfSk7XG4gIGlmIChjbGFzc05vZGUubWVtYmVycy5sZW5ndGggPiAwIHx8IGNsYXNzTm9kZS5tZXRob2RzLmxlbmd0aCA+IDAgfHwgcmVuZGVyRXh0cmFCb3gpIHtcbiAgICBjb25zdCBmaXJzdExpbmVZID0gYW5ub3RhdGlvbkdyb3VwSGVpZ2h0ICsgbGFiZWxHcm91cEhlaWdodCArIHkgKyBQQURESU5HO1xuICAgIGNvbnN0IHJvdWdoTGluZSA9IHJjLmxpbmUoXG4gICAgICByZWN0QkJveC54LFxuICAgICAgZmlyc3RMaW5lWSxcbiAgICAgIHJlY3RCQm94LnggKyByZWN0QkJveC53aWR0aCxcbiAgICAgIGZpcnN0TGluZVkgKyAxZS0zLFxuICAgICAgb3B0aW9uc1xuICAgICk7XG4gICAgY29uc3QgbGluZSA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiByb3VnaExpbmUpO1xuICAgIGxpbmUuYXR0cihcImNsYXNzXCIsIGBkaXZpZGVyJHtub2RlLmxvb2sgPT09IFwibmVvXCIgJiYgIXVzZUdyYWRpZW50ID8gXCIgbmVvLWxpbmVcIiA6IFwiXCJ9YCkuYXR0cihcInN0eWxlXCIsIHN0eWxlcyk7XG4gIH1cbiAgaWYgKHJlbmRlckV4dHJhQm94IHx8IGNsYXNzTm9kZS5tZW1iZXJzLmxlbmd0aCA+IDAgfHwgY2xhc3NOb2RlLm1ldGhvZHMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IHNlY29uZExpbmVZID0gYW5ub3RhdGlvbkdyb3VwSGVpZ2h0ICsgbGFiZWxHcm91cEhlaWdodCArIG1lbWJlcnNHcm91cEhlaWdodCArIHkgKyBHQVAgKiAyICsgUEFERElORztcbiAgICBjb25zdCByb3VnaExpbmUgPSByYy5saW5lKFxuICAgICAgcmVjdEJCb3gueCxcbiAgICAgIG5vZGVIZWlnaHRHcmVhdGVyID8gTWF0aC5tYXgobWV0aG9kc0FyZWFQbGFjZW1lbnQsIHNlY29uZExpbmVZKSA6IHNlY29uZExpbmVZLFxuICAgICAgcmVjdEJCb3gueCArIHJlY3RCQm94LndpZHRoLFxuICAgICAgKG5vZGVIZWlnaHRHcmVhdGVyID8gTWF0aC5tYXgobWV0aG9kc0FyZWFQbGFjZW1lbnQsIHNlY29uZExpbmVZKSA6IHNlY29uZExpbmVZKSArIDFlLTMsXG4gICAgICBvcHRpb25zXG4gICAgKTtcbiAgICBjb25zdCBsaW5lID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHJvdWdoTGluZSk7XG4gICAgbGluZS5hdHRyKFwiY2xhc3NcIiwgYGRpdmlkZXIke25vZGUubG9vayA9PT0gXCJuZW9cIiAmJiAhdXNlR3JhZGllbnQgPyBcIiBuZW8tbGluZVwiIDogXCJcIn1gKS5hdHRyKFwic3R5bGVcIiwgc3R5bGVzKTtcbiAgfVxuICBpZiAoY2xhc3NOb2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBzaGFwZVN2Zy5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBzdHlsZXMpO1xuICB9XG4gIHJlY3QyLnNlbGVjdChcIjpudGgtY2hpbGQoMilcIikuYXR0cihcInN0eWxlXCIsIHN0eWxlcyk7XG4gIHNoYXBlU3ZnLnNlbGVjdEFsbChcIi5kaXZpZGVyXCIpLnNlbGVjdChcInBhdGhcIikuYXR0cihcInN0eWxlXCIsIHN0eWxlcyk7XG4gIGlmIChub2RlLmxhYmVsU3R5bGUpIHtcbiAgICBzaGFwZVN2Zy5zZWxlY3RBbGwoXCJzcGFuXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlLmxhYmVsU3R5bGUpO1xuICB9IGVsc2Uge1xuICAgIHNoYXBlU3ZnLnNlbGVjdEFsbChcInNwYW5cIikuYXR0cihcInN0eWxlXCIsIHN0eWxlcyk7XG4gIH1cbiAgaWYgKCF1c2VIdG1sTGFiZWxzKSB7XG4gICAgY29uc3QgY29sb3JSZWdleCA9IFJlZ0V4cCgvY29sb3JcXHMqOlxccyooW147XSopLyk7XG4gICAgY29uc3QgbWF0Y2ggPSBjb2xvclJlZ2V4LmV4ZWMoc3R5bGVzKTtcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIGNvbnN0IGNvbG9yU3R5bGUgPSBtYXRjaFswXS5yZXBsYWNlKFwiY29sb3JcIiwgXCJmaWxsXCIpO1xuICAgICAgc2hhcGVTdmcuc2VsZWN0QWxsKFwidHNwYW5cIikuYXR0cihcInN0eWxlXCIsIGNvbG9yU3R5bGUpO1xuICAgIH0gZWxzZSBpZiAobGFiZWxTdHlsZXMpIHtcbiAgICAgIGNvbnN0IG1hdGNoMiA9IGNvbG9yUmVnZXguZXhlYyhsYWJlbFN0eWxlcyk7XG4gICAgICBpZiAobWF0Y2gyKSB7XG4gICAgICAgIGNvbnN0IGNvbG9yU3R5bGUgPSBtYXRjaDJbMF0ucmVwbGFjZShcImNvbG9yXCIsIFwiZmlsbFwiKTtcbiAgICAgICAgc2hhcGVTdmcuc2VsZWN0QWxsKFwidHNwYW5cIikuYXR0cihcInN0eWxlXCIsIGNvbG9yU3R5bGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIHJlY3QyKTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiBpbnRlcnNlY3RfZGVmYXVsdC5yZWN0KG5vZGUsIHBvaW50KTtcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuX19uYW1lKGNsYXNzQm94LCBcImNsYXNzQm94XCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy9yZXF1aXJlbWVudEJveC50c1xuaW1wb3J0IHJvdWdoNTcgZnJvbSBcInJvdWdoanNcIjtcbmltcG9ydCB7IHNlbGVjdCBhcyBzZWxlY3Q3IH0gZnJvbSBcImQzXCI7XG5hc3luYyBmdW5jdGlvbiByZXF1aXJlbWVudEJveChwYXJlbnQsIG5vZGUpIHtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcywgbm9kZVN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IHJlcXVpcmVtZW50Tm9kZSA9IG5vZGU7XG4gIGNvbnN0IGVsZW1lbnROb2RlID0gbm9kZTtcbiAgY29uc3QgcGFkZGluZyA9IDIwO1xuICBjb25zdCBnYXAgPSAyMDtcbiAgY29uc3QgaXNSZXF1aXJlbWVudE5vZGUgPSBcInZlcmlmeU1ldGhvZFwiIGluIG5vZGU7XG4gIGNvbnN0IGNsYXNzZXMgPSBnZXROb2RlQ2xhc3Nlcyhub2RlKTtcbiAgY29uc3QgeyB0aGVtZVZhcmlhYmxlcyB9ID0gZ2V0Q29uZmlnMigpO1xuICBjb25zdCB7IGJvcmRlckNvbG9yQXJyYXksIHJlcXVpcmVtZW50RWRnZUxhYmVsQmFja2dyb3VuZCB9ID0gdGhlbWVWYXJpYWJsZXM7XG4gIGNvbnN0IHNoYXBlU3ZnID0gcGFyZW50Lmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIGNsYXNzZXMpLmF0dHIoXCJpZFwiLCBub2RlLmRvbUlkID8/IG5vZGUuaWQpO1xuICBsZXQgdHlwZUhlaWdodDtcbiAgaWYgKGlzUmVxdWlyZW1lbnROb2RlKSB7XG4gICAgdHlwZUhlaWdodCA9IGF3YWl0IGFkZFRleHQzKFxuICAgICAgc2hhcGVTdmcsXG4gICAgICBgJmx0OyZsdDske3JlcXVpcmVtZW50Tm9kZS50eXBlfSZndDsmZ3Q7YCxcbiAgICAgIDAsXG4gICAgICBub2RlLmxhYmVsU3R5bGVcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIHR5cGVIZWlnaHQgPSBhd2FpdCBhZGRUZXh0MyhzaGFwZVN2ZywgXCImbHQ7Jmx0O0VsZW1lbnQmZ3Q7Jmd0O1wiLCAwLCBub2RlLmxhYmVsU3R5bGUpO1xuICB9XG4gIGxldCBhY2N1bXVsYXRpdmVIZWlnaHQgPSB0eXBlSGVpZ2h0O1xuICBjb25zdCBuYW1lSGVpZ2h0ID0gYXdhaXQgYWRkVGV4dDMoXG4gICAgc2hhcGVTdmcsXG4gICAgcmVxdWlyZW1lbnROb2RlLm5hbWUsXG4gICAgYWNjdW11bGF0aXZlSGVpZ2h0LFxuICAgIG5vZGUubGFiZWxTdHlsZSArIFwiOyBmb250LXdlaWdodDogYm9sZDtcIlxuICApO1xuICBhY2N1bXVsYXRpdmVIZWlnaHQgKz0gbmFtZUhlaWdodCArIGdhcDtcbiAgaWYgKGlzUmVxdWlyZW1lbnROb2RlKSB7XG4gICAgY29uc3QgaWRIZWlnaHQgPSBhd2FpdCBhZGRUZXh0MyhcbiAgICAgIHNoYXBlU3ZnLFxuICAgICAgYCR7cmVxdWlyZW1lbnROb2RlLnJlcXVpcmVtZW50SWQgPyBgSUQ6ICR7cmVxdWlyZW1lbnROb2RlLnJlcXVpcmVtZW50SWR9YCA6IFwiXCJ9YCxcbiAgICAgIGFjY3VtdWxhdGl2ZUhlaWdodCxcbiAgICAgIG5vZGUubGFiZWxTdHlsZVxuICAgICk7XG4gICAgYWNjdW11bGF0aXZlSGVpZ2h0ICs9IGlkSGVpZ2h0O1xuICAgIGNvbnN0IHRleHRIZWlnaHQgPSBhd2FpdCBhZGRUZXh0MyhcbiAgICAgIHNoYXBlU3ZnLFxuICAgICAgYCR7cmVxdWlyZW1lbnROb2RlLnRleHQgPyBgVGV4dDogJHtyZXF1aXJlbWVudE5vZGUudGV4dH1gIDogXCJcIn1gLFxuICAgICAgYWNjdW11bGF0aXZlSGVpZ2h0LFxuICAgICAgbm9kZS5sYWJlbFN0eWxlXG4gICAgKTtcbiAgICBhY2N1bXVsYXRpdmVIZWlnaHQgKz0gdGV4dEhlaWdodDtcbiAgICBjb25zdCByaXNrSGVpZ2h0ID0gYXdhaXQgYWRkVGV4dDMoXG4gICAgICBzaGFwZVN2ZyxcbiAgICAgIGAke3JlcXVpcmVtZW50Tm9kZS5yaXNrID8gYFJpc2s6ICR7cmVxdWlyZW1lbnROb2RlLnJpc2t9YCA6IFwiXCJ9YCxcbiAgICAgIGFjY3VtdWxhdGl2ZUhlaWdodCxcbiAgICAgIG5vZGUubGFiZWxTdHlsZVxuICAgICk7XG4gICAgYWNjdW11bGF0aXZlSGVpZ2h0ICs9IHJpc2tIZWlnaHQ7XG4gICAgYXdhaXQgYWRkVGV4dDMoXG4gICAgICBzaGFwZVN2ZyxcbiAgICAgIGAke3JlcXVpcmVtZW50Tm9kZS52ZXJpZnlNZXRob2QgPyBgVmVyaWZpY2F0aW9uOiAke3JlcXVpcmVtZW50Tm9kZS52ZXJpZnlNZXRob2R9YCA6IFwiXCJ9YCxcbiAgICAgIGFjY3VtdWxhdGl2ZUhlaWdodCxcbiAgICAgIG5vZGUubGFiZWxTdHlsZVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgdHlwZUhlaWdodDIgPSBhd2FpdCBhZGRUZXh0MyhcbiAgICAgIHNoYXBlU3ZnLFxuICAgICAgYCR7ZWxlbWVudE5vZGUudHlwZSA/IGBUeXBlOiAke2VsZW1lbnROb2RlLnR5cGV9YCA6IFwiXCJ9YCxcbiAgICAgIGFjY3VtdWxhdGl2ZUhlaWdodCxcbiAgICAgIG5vZGUubGFiZWxTdHlsZVxuICAgICk7XG4gICAgYWNjdW11bGF0aXZlSGVpZ2h0ICs9IHR5cGVIZWlnaHQyO1xuICAgIGF3YWl0IGFkZFRleHQzKFxuICAgICAgc2hhcGVTdmcsXG4gICAgICBgJHtlbGVtZW50Tm9kZS5kb2NSZWYgPyBgRG9jIFJlZjogJHtlbGVtZW50Tm9kZS5kb2NSZWZ9YCA6IFwiXCJ9YCxcbiAgICAgIGFjY3VtdWxhdGl2ZUhlaWdodCxcbiAgICAgIG5vZGUubGFiZWxTdHlsZVxuICAgICk7XG4gIH1cbiAgY29uc3QgdG90YWxXaWR0aCA9IChzaGFwZVN2Zy5ub2RlKCk/LmdldEJCb3goKS53aWR0aCA/PyAyMDApICsgcGFkZGluZztcbiAgY29uc3QgdG90YWxIZWlnaHQgPSAoc2hhcGVTdmcubm9kZSgpPy5nZXRCQm94KCkuaGVpZ2h0ID8/IDIwMCkgKyBwYWRkaW5nO1xuICBjb25zdCB4ID0gLXRvdGFsV2lkdGggLyAyO1xuICBjb25zdCB5ID0gLXRvdGFsSGVpZ2h0IC8gMjtcbiAgY29uc3QgcmMgPSByb3VnaDU3LnN2ZyhzaGFwZVN2Zyk7XG4gIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gIGlmIChub2RlLmxvb2sgIT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBvcHRpb25zLnJvdWdobmVzcyA9IDA7XG4gICAgb3B0aW9ucy5maWxsU3R5bGUgPSBcInNvbGlkXCI7XG4gIH1cbiAgY29uc3Qgcm91Z2hSZWN0ID0gcmMucmVjdGFuZ2xlKHgsIHksIHRvdGFsV2lkdGgsIHRvdGFsSGVpZ2h0LCBvcHRpb25zKTtcbiAgY29uc3QgcmVjdDIgPSBzaGFwZVN2Zy5pbnNlcnQoKCkgPT4gcm91Z2hSZWN0LCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgcmVjdDIuYXR0cihcImNsYXNzXCIsIFwiYmFzaWMgbGFiZWwtY29udGFpbmVyIG91dGVyLXBhdGhcIikuYXR0cihcInN0eWxlXCIsIG5vZGVTdHlsZXMpO1xuICBpZiAoYm9yZGVyQ29sb3JBcnJheT8ubGVuZ3RoKSB7XG4gICAgY29uc3QgY29sb3JJbmRleCA9IG5vZGUuY29sb3JJbmRleCA/PyAwO1xuICAgIHNoYXBlU3ZnLmF0dHIoXCJkYXRhLWNvbG9yLWlkXCIsIGBjb2xvci0ke2NvbG9ySW5kZXggJSBib3JkZXJDb2xvckFycmF5Lmxlbmd0aH1gKTtcbiAgfVxuICBzaGFwZVN2Zy5zZWxlY3RBbGwoXCIubGFiZWxcIikuZWFjaCgoXywgaSwgbm9kZXMpID0+IHtcbiAgICBjb25zdCB0ZXh0MiA9IHNlbGVjdDcobm9kZXNbaV0pO1xuICAgIGNvbnN0IHRyYW5zZm9ybSA9IHRleHQyLmF0dHIoXCJ0cmFuc2Zvcm1cIik7XG4gICAgbGV0IHRyYW5zbGF0ZVggPSAwO1xuICAgIGxldCB0cmFuc2xhdGVZID0gMDtcbiAgICBpZiAodHJhbnNmb3JtKSB7XG4gICAgICBjb25zdCByZWdleCA9IFJlZ0V4cCgvdHJhbnNsYXRlXFwoKFteLF0rKSwoW14pXSspXFwpLyk7XG4gICAgICBjb25zdCB0cmFuc2xhdGUgPSByZWdleC5leGVjKHRyYW5zZm9ybSk7XG4gICAgICBpZiAodHJhbnNsYXRlKSB7XG4gICAgICAgIHRyYW5zbGF0ZVggPSBwYXJzZUZsb2F0KHRyYW5zbGF0ZVsxXSk7XG4gICAgICAgIHRyYW5zbGF0ZVkgPSBwYXJzZUZsb2F0KHRyYW5zbGF0ZVsyXSk7XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IG5ld1RyYW5zbGF0ZVkgPSB0cmFuc2xhdGVZIC0gdG90YWxIZWlnaHQgLyAyO1xuICAgIGxldCBuZXdUcmFuc2xhdGVYID0geCArIHBhZGRpbmcgLyAyO1xuICAgIGlmIChpID09PSAwIHx8IGkgPT09IDEpIHtcbiAgICAgIG5ld1RyYW5zbGF0ZVggPSB0cmFuc2xhdGVYO1xuICAgIH1cbiAgICB0ZXh0Mi5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHtuZXdUcmFuc2xhdGVYfSwgJHtuZXdUcmFuc2xhdGVZICsgcGFkZGluZ30pYCk7XG4gIH0pO1xuICBpZiAoYWNjdW11bGF0aXZlSGVpZ2h0ID4gdHlwZUhlaWdodCArIG5hbWVIZWlnaHQgKyBnYXApIHtcbiAgICBjb25zdCBsaW5lWSA9IHkgKyB0eXBlSGVpZ2h0ICsgbmFtZUhlaWdodCArIGdhcDtcbiAgICBsZXQgcm91Z2hMaW5lO1xuICAgIGlmIChub2RlLmxvb2sgPT09IFwibmVvXCIpIHtcbiAgICAgIGNvbnN0IHRoaWNrbmVzcyA9IDFlLTM7XG4gICAgICBjb25zdCBwb2x5Z29uUG9pbnRzID0gW1xuICAgICAgICBbeCwgbGluZVldLFxuICAgICAgICBbeCArIHRvdGFsV2lkdGgsIGxpbmVZXSxcbiAgICAgICAgW3ggKyB0b3RhbFdpZHRoLCBsaW5lWSArIHRoaWNrbmVzc10sXG4gICAgICAgIFt4LCBsaW5lWSArIHRoaWNrbmVzc11cbiAgICAgIF07XG4gICAgICByb3VnaExpbmUgPSByYy5wb2x5Z29uKHBvbHlnb25Qb2ludHMsIG9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByb3VnaExpbmUgPSByYy5saW5lKHgsIGxpbmVZLCB4ICsgdG90YWxXaWR0aCwgbGluZVksIG9wdGlvbnMpO1xuICAgIH1cbiAgICBjb25zdCBkaXZpZGVyTGluZSA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiByb3VnaExpbmUpO1xuICAgIGRpdmlkZXJMaW5lLmF0dHIoXCJjbGFzc1wiLCBcImRpdmlkZXJcIik7XG4gIH1cbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCByZWN0Mik7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucmVjdChub2RlLCBwb2ludCk7XG4gIH07XG4gIGlmIChub2RlU3R5bGVzICYmIG5vZGUubG9vayAhPT0gXCJoYW5kRHJhd25cIiAmJiAocmVxdWlyZW1lbnRFZGdlTGFiZWxCYWNrZ3JvdW5kIHx8IGJvcmRlckNvbG9yQXJyYXk/Lmxlbmd0aCkpIHtcbiAgICBzaGFwZVN2Zy5zZWxlY3RBbGwoXCJwYXRoXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKTtcbiAgfVxuICByZXR1cm4gc2hhcGVTdmc7XG59XG5fX25hbWUocmVxdWlyZW1lbnRCb3gsIFwicmVxdWlyZW1lbnRCb3hcIik7XG5hc3luYyBmdW5jdGlvbiBhZGRUZXh0MyhwYXJlbnRHcm91cCwgaW5wdXRUZXh0LCB5T2Zmc2V0LCBzdHlsZSA9IFwiXCIpIHtcbiAgaWYgKGlucHV0VGV4dCA9PT0gXCJcIikge1xuICAgIHJldHVybiAwO1xuICB9XG4gIGNvbnN0IHRleHRFbCA9IHBhcmVudEdyb3VwLmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIFwibGFiZWxcIikuYXR0cihcInN0eWxlXCIsIHN0eWxlKTtcbiAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnMigpO1xuICBjb25zdCB1c2VIdG1sTGFiZWxzID0gY29uZmlnLmh0bWxMYWJlbHMgPz8gdHJ1ZTtcbiAgY29uc3QgdGV4dDIgPSBhd2FpdCBjcmVhdGVUZXh0KFxuICAgIHRleHRFbCxcbiAgICBzYW5pdGl6ZVRleHQyKGRlY29kZUVudGl0aWVzKGlucHV0VGV4dCkpLFxuICAgIHtcbiAgICAgIHdpZHRoOiBjYWxjdWxhdGVUZXh0V2lkdGgoaW5wdXRUZXh0LCBjb25maWcpICsgNTAsXG4gICAgICAvLyBBZGQgcm9vbSBmb3IgZXJyb3Igd2hlbiBzcGxpdHRpbmcgdGV4dCBpbnRvIG11bHRpcGxlIGxpbmVzXG4gICAgICBjbGFzc2VzOiBcIm1hcmtkb3duLW5vZGUtbGFiZWxcIixcbiAgICAgIHVzZUh0bWxMYWJlbHMsXG4gICAgICBzdHlsZVxuICAgIH0sXG4gICAgY29uZmlnXG4gICk7XG4gIGxldCBiYm94O1xuICBpZiAoIXVzZUh0bWxMYWJlbHMpIHtcbiAgICBjb25zdCB0ZXh0Q2hpbGQgPSB0ZXh0Mi5jaGlsZHJlblswXTtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIHRleHRDaGlsZC5jaGlsZHJlbikge1xuICAgICAgaWYgKHN0eWxlKSB7XG4gICAgICAgIGNoaWxkLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIHN0eWxlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgYmJveCA9IHRleHQyLmdldEJCb3goKTtcbiAgICBiYm94LmhlaWdodCArPSA2O1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGRpdiA9IHRleHQyLmNoaWxkcmVuWzBdO1xuICAgIGNvbnN0IGR2ID0gc2VsZWN0Nyh0ZXh0Mik7XG4gICAgYmJveCA9IGRpdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBkdi5hdHRyKFwid2lkdGhcIiwgYmJveC53aWR0aCk7XG4gICAgZHYuYXR0cihcImhlaWdodFwiLCBiYm94LmhlaWdodCk7XG4gIH1cbiAgdGV4dEVsLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgkey1iYm94LndpZHRoIC8gMn0sJHstYmJveC5oZWlnaHQgLyAyICsgeU9mZnNldH0pYCk7XG4gIHJldHVybiBiYm94LmhlaWdodDtcbn1cbl9fbmFtZShhZGRUZXh0MywgXCJhZGRUZXh0XCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy9rYW5iYW5JdGVtLnRzXG5pbXBvcnQgcm91Z2g1OCBmcm9tIFwicm91Z2hqc1wiO1xudmFyIGNvbG9yRnJvbVByaW9yaXR5ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgocHJpb3JpdHkpID0+IHtcbiAgc3dpdGNoIChwcmlvcml0eSkge1xuICAgIGNhc2UgXCJWZXJ5IEhpZ2hcIjpcbiAgICAgIHJldHVybiBcInJlZFwiO1xuICAgIGNhc2UgXCJIaWdoXCI6XG4gICAgICByZXR1cm4gXCJvcmFuZ2VcIjtcbiAgICBjYXNlIFwiTWVkaXVtXCI6XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICAvLyBubyBzdHJva2VcbiAgICBjYXNlIFwiTG93XCI6XG4gICAgICByZXR1cm4gXCJibHVlXCI7XG4gICAgY2FzZSBcIlZlcnkgTG93XCI6XG4gICAgICByZXR1cm4gXCJsaWdodGJsdWVcIjtcbiAgfVxufSwgXCJjb2xvckZyb21Qcmlvcml0eVwiKTtcbmFzeW5jIGZ1bmN0aW9uIGthbmJhbkl0ZW0ocGFyZW50LCBrYW5iYW5Ob2RlLCB7IGNvbmZpZyB9KSB7XG4gIGNvbnN0IHsgbGFiZWxTdHlsZXMsIG5vZGVTdHlsZXMgfSA9IHN0eWxlczJTdHJpbmcoa2FuYmFuTm9kZSk7XG4gIGthbmJhbk5vZGUubGFiZWxTdHlsZSA9IGxhYmVsU3R5bGVzIHx8IFwiXCI7XG4gIGNvbnN0IGxhYmVsUGFkZGluZ1ggPSAxMDtcbiAgY29uc3Qgb3JnV2lkdGggPSBrYW5iYW5Ob2RlLndpZHRoO1xuICBrYW5iYW5Ob2RlLndpZHRoID0gKGthbmJhbk5vZGUud2lkdGggPz8gMjAwKSAtIDEwO1xuICBjb25zdCB7XG4gICAgc2hhcGVTdmcsXG4gICAgYmJveCxcbiAgICBsYWJlbDogbGFiZWxFbFRpdGxlXG4gIH0gPSBhd2FpdCBsYWJlbEhlbHBlcihwYXJlbnQsIGthbmJhbk5vZGUsIGdldE5vZGVDbGFzc2VzKGthbmJhbk5vZGUpKTtcbiAgY29uc3QgcGFkZGluZyA9IGthbmJhbk5vZGUucGFkZGluZyB8fCAxMDtcbiAgbGV0IHRpY2tldFVybCA9IFwiXCI7XG4gIGxldCBsaW5rO1xuICBpZiAoXCJ0aWNrZXRcIiBpbiBrYW5iYW5Ob2RlICYmIGthbmJhbk5vZGUudGlja2V0ICYmIGNvbmZpZz8ua2FuYmFuPy50aWNrZXRCYXNlVXJsKSB7XG4gICAgdGlja2V0VXJsID0gY29uZmlnPy5rYW5iYW4/LnRpY2tldEJhc2VVcmwucmVwbGFjZShcIiNUSUNLRVQjXCIsIGthbmJhbk5vZGUudGlja2V0KTtcbiAgICBsaW5rID0gc2hhcGVTdmcuaW5zZXJ0KFwic3ZnOmFcIiwgXCI6Zmlyc3QtY2hpbGRcIikuYXR0cihcImNsYXNzXCIsIFwia2FuYmFuLXRpY2tldC1saW5rXCIpLmF0dHIoXCJ4bGluazpocmVmXCIsIHRpY2tldFVybCkuYXR0cihcInRhcmdldFwiLCBcIl9ibGFua1wiKTtcbiAgfVxuICBjb25zdCBvcHRpb25zID0ge1xuICAgIHVzZUh0bWxMYWJlbHM6IGthbmJhbk5vZGUudXNlSHRtbExhYmVscyxcbiAgICBsYWJlbFN0eWxlOiBrYW5iYW5Ob2RlLmxhYmVsU3R5bGUgfHwgXCJcIixcbiAgICB3aWR0aDoga2FuYmFuTm9kZS53aWR0aCxcbiAgICBpbWc6IGthbmJhbk5vZGUuaW1nLFxuICAgIHBhZGRpbmc6IGthbmJhbk5vZGUucGFkZGluZyB8fCA4LFxuICAgIGNlbnRlckxhYmVsOiBmYWxzZVxuICB9O1xuICBsZXQgbGFiZWxFbCwgYmJveDI7XG4gIGlmIChsaW5rKSB7XG4gICAgKHsgbGFiZWw6IGxhYmVsRWwsIGJib3g6IGJib3gyIH0gPSBhd2FpdCBpbnNlcnRMYWJlbChcbiAgICAgIGxpbmssXG4gICAgICBcInRpY2tldFwiIGluIGthbmJhbk5vZGUgJiYga2FuYmFuTm9kZS50aWNrZXQgfHwgXCJcIixcbiAgICAgIG9wdGlvbnNcbiAgICApKTtcbiAgfSBlbHNlIHtcbiAgICAoeyBsYWJlbDogbGFiZWxFbCwgYmJveDogYmJveDIgfSA9IGF3YWl0IGluc2VydExhYmVsKFxuICAgICAgc2hhcGVTdmcsXG4gICAgICBcInRpY2tldFwiIGluIGthbmJhbk5vZGUgJiYga2FuYmFuTm9kZS50aWNrZXQgfHwgXCJcIixcbiAgICAgIG9wdGlvbnNcbiAgICApKTtcbiAgfVxuICBjb25zdCB7IGxhYmVsOiBsYWJlbEVsQXNzaWduZWQsIGJib3g6IGJib3hBc3NpZ25lZCB9ID0gYXdhaXQgaW5zZXJ0TGFiZWwoXG4gICAgc2hhcGVTdmcsXG4gICAgXCJhc3NpZ25lZFwiIGluIGthbmJhbk5vZGUgJiYga2FuYmFuTm9kZS5hc3NpZ25lZCB8fCBcIlwiLFxuICAgIG9wdGlvbnNcbiAgKTtcbiAga2FuYmFuTm9kZS53aWR0aCA9IG9yZ1dpZHRoO1xuICBjb25zdCBsYWJlbFBhZGRpbmdZID0gMTA7XG4gIGNvbnN0IHRvdGFsV2lkdGggPSBrYW5iYW5Ob2RlPy53aWR0aCB8fCAwO1xuICBjb25zdCBoZWlnaHRBZGogPSBNYXRoLm1heChiYm94Mi5oZWlnaHQsIGJib3hBc3NpZ25lZC5oZWlnaHQpIC8gMjtcbiAgY29uc3QgdG90YWxIZWlnaHQgPSBNYXRoLm1heChiYm94LmhlaWdodCArIGxhYmVsUGFkZGluZ1kgKiAyLCBrYW5iYW5Ob2RlPy5oZWlnaHQgfHwgMCkgKyBoZWlnaHRBZGo7XG4gIGNvbnN0IHggPSAtdG90YWxXaWR0aCAvIDI7XG4gIGNvbnN0IHkgPSAtdG90YWxIZWlnaHQgLyAyO1xuICBsYWJlbEVsVGl0bGUuYXR0cihcbiAgICBcInRyYW5zZm9ybVwiLFxuICAgIFwidHJhbnNsYXRlKFwiICsgKHBhZGRpbmcgLSB0b3RhbFdpZHRoIC8gMikgKyBcIiwgXCIgKyAoLWhlaWdodEFkaiAtIGJib3guaGVpZ2h0IC8gMikgKyBcIilcIlxuICApO1xuICBsYWJlbEVsLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICBcInRyYW5zbGF0ZShcIiArIChwYWRkaW5nIC0gdG90YWxXaWR0aCAvIDIpICsgXCIsIFwiICsgKC1oZWlnaHRBZGogKyBiYm94LmhlaWdodCAvIDIpICsgXCIpXCJcbiAgKTtcbiAgbGFiZWxFbEFzc2lnbmVkLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICBcInRyYW5zbGF0ZShcIiArIChwYWRkaW5nICsgdG90YWxXaWR0aCAvIDIgLSBiYm94QXNzaWduZWQud2lkdGggLSAyICogbGFiZWxQYWRkaW5nWCkgKyBcIiwgXCIgKyAoLWhlaWdodEFkaiArIGJib3guaGVpZ2h0IC8gMikgKyBcIilcIlxuICApO1xuICBsZXQgcmVjdDI7XG4gIGNvbnN0IHsgcngsIHJ5IH0gPSBrYW5iYW5Ob2RlO1xuICBjb25zdCB7IGNzc1N0eWxlcyB9ID0ga2FuYmFuTm9kZTtcbiAgaWYgKGthbmJhbk5vZGUubG9vayA9PT0gXCJoYW5kRHJhd25cIikge1xuICAgIGNvbnN0IHJjID0gcm91Z2g1OC5zdmcoc2hhcGVTdmcpO1xuICAgIGNvbnN0IG9wdGlvbnMyID0gdXNlck5vZGVPdmVycmlkZXMoa2FuYmFuTm9kZSwge30pO1xuICAgIGNvbnN0IHJvdWdoTm9kZSA9IHJ4IHx8IHJ5ID8gcmMucGF0aChjcmVhdGVSb3VuZGVkUmVjdFBhdGhEKHgsIHksIHRvdGFsV2lkdGgsIHRvdGFsSGVpZ2h0LCByeCB8fCAwKSwgb3B0aW9uczIpIDogcmMucmVjdGFuZ2xlKHgsIHksIHRvdGFsV2lkdGgsIHRvdGFsSGVpZ2h0LCBvcHRpb25zMik7XG4gICAgcmVjdDIgPSBzaGFwZVN2Zy5pbnNlcnQoKCkgPT4gcm91Z2hOb2RlLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgICByZWN0Mi5hdHRyKFwiY2xhc3NcIiwgXCJiYXNpYyBsYWJlbC1jb250YWluZXJcIikuYXR0cihcInN0eWxlXCIsIGNzc1N0eWxlcyA/IGNzc1N0eWxlcyA6IG51bGwpO1xuICB9IGVsc2Uge1xuICAgIHJlY3QyID0gc2hhcGVTdmcuaW5zZXJ0KFwicmVjdFwiLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgICByZWN0Mi5hdHRyKFwiY2xhc3NcIiwgXCJiYXNpYyBsYWJlbC1jb250YWluZXIgX19BUEFfX1wiKS5hdHRyKFwic3R5bGVcIiwgbm9kZVN0eWxlcykuYXR0cihcInJ4XCIsIHJ4ID8/IDUpLmF0dHIoXCJyeVwiLCByeSA/PyA1KS5hdHRyKFwieFwiLCB4KS5hdHRyKFwieVwiLCB5KS5hdHRyKFwid2lkdGhcIiwgdG90YWxXaWR0aCkuYXR0cihcImhlaWdodFwiLCB0b3RhbEhlaWdodCk7XG4gICAgY29uc3QgcHJpb3JpdHkgPSBcInByaW9yaXR5XCIgaW4ga2FuYmFuTm9kZSAmJiBrYW5iYW5Ob2RlLnByaW9yaXR5O1xuICAgIGlmIChwcmlvcml0eSkge1xuICAgICAgY29uc3QgbGluZSA9IHNoYXBlU3ZnLmFwcGVuZChcImxpbmVcIik7XG4gICAgICBjb25zdCBsaW5lWCA9IHggKyAyO1xuICAgICAgY29uc3QgeTEgPSB5ICsgTWF0aC5mbG9vcigocnggPz8gMCkgLyAyKTtcbiAgICAgIGNvbnN0IHkyID0geSArIHRvdGFsSGVpZ2h0IC0gTWF0aC5mbG9vcigocnggPz8gMCkgLyAyKTtcbiAgICAgIGxpbmUuYXR0cihcIngxXCIsIGxpbmVYKS5hdHRyKFwieTFcIiwgeTEpLmF0dHIoXCJ4MlwiLCBsaW5lWCkuYXR0cihcInkyXCIsIHkyKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIFwiNFwiKS5hdHRyKFwic3Ryb2tlXCIsIGNvbG9yRnJvbVByaW9yaXR5KHByaW9yaXR5KSk7XG4gICAgfVxuICB9XG4gIHVwZGF0ZU5vZGVCb3VuZHMoa2FuYmFuTm9kZSwgcmVjdDIpO1xuICBrYW5iYW5Ob2RlLmhlaWdodCA9IHRvdGFsSGVpZ2h0O1xuICBrYW5iYW5Ob2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnJlY3Qoa2FuYmFuTm9kZSwgcG9pbnQpO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59XG5fX25hbWUoa2FuYmFuSXRlbSwgXCJrYW5iYW5JdGVtXCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy9iYW5nLnRzXG5pbXBvcnQgcm91Z2g1OSBmcm9tIFwicm91Z2hqc1wiO1xuYXN5bmMgZnVuY3Rpb24gYmFuZyhwYXJlbnQsIG5vZGUpIHtcbiAgY29uc3QgeyBsYWJlbFN0eWxlcywgbm9kZVN0eWxlcyB9ID0gc3R5bGVzMlN0cmluZyhub2RlKTtcbiAgbm9kZS5sYWJlbFN0eWxlID0gbGFiZWxTdHlsZXM7XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3gsIGhhbGZQYWRkaW5nLCBsYWJlbCB9ID0gYXdhaXQgbGFiZWxIZWxwZXIoXG4gICAgcGFyZW50LFxuICAgIG5vZGUsXG4gICAgZ2V0Tm9kZUNsYXNzZXMobm9kZSlcbiAgKTtcbiAgY29uc3QgdyA9IGJib3gud2lkdGggKyAxMCAqIGhhbGZQYWRkaW5nO1xuICBjb25zdCBoID0gYmJveC5oZWlnaHQgKyA4ICogaGFsZlBhZGRpbmc7XG4gIGNvbnN0IHIgPSAwLjE1ICogdztcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGNvbnN0IG1pbldpZHRoID0gYmJveC53aWR0aCArIDIwO1xuICBjb25zdCBtaW5IZWlnaHQgPSBiYm94LmhlaWdodCArIDIwO1xuICBjb25zdCBlZmZlY3RpdmVXaWR0aCA9IE1hdGgubWF4KHcsIG1pbldpZHRoKTtcbiAgY29uc3QgZWZmZWN0aXZlSGVpZ2h0ID0gTWF0aC5tYXgoaCwgbWluSGVpZ2h0KTtcbiAgbGFiZWwuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7LWJib3gud2lkdGggLyAyfSwgJHstYmJveC5oZWlnaHQgLyAyfSlgKTtcbiAgbGV0IGJhbmdFbGVtO1xuICBjb25zdCBwYXRoID0gYE0wIDAgXG4gICAgYSR7cn0sJHtyfSAxIDAsMCAke2VmZmVjdGl2ZVdpZHRoICogMC4yNX0sJHstMSAqIGVmZmVjdGl2ZUhlaWdodCAqIDAuMX1cbiAgICBhJHtyfSwke3J9IDEgMCwwICR7ZWZmZWN0aXZlV2lkdGggKiAwLjI1fSwkezB9XG4gICAgYSR7cn0sJHtyfSAxIDAsMCAke2VmZmVjdGl2ZVdpZHRoICogMC4yNX0sJHswfVxuICAgIGEke3J9LCR7cn0gMSAwLDAgJHtlZmZlY3RpdmVXaWR0aCAqIDAuMjV9LCR7ZWZmZWN0aXZlSGVpZ2h0ICogMC4xfVxuXG4gICAgYSR7cn0sJHtyfSAxIDAsMCAke2VmZmVjdGl2ZVdpZHRoICogMC4xNX0sJHtlZmZlY3RpdmVIZWlnaHQgKiAwLjMzfVxuICAgIGEke3IgKiAwLjh9LCR7ciAqIDAuOH0gMSAwLDAgMCwke2VmZmVjdGl2ZUhlaWdodCAqIDAuMzR9XG4gICAgYSR7cn0sJHtyfSAxIDAsMCAkey0xICogZWZmZWN0aXZlV2lkdGggKiAwLjE1fSwke2VmZmVjdGl2ZUhlaWdodCAqIDAuMzN9XG5cbiAgICBhJHtyfSwke3J9IDEgMCwwICR7LTEgKiBlZmZlY3RpdmVXaWR0aCAqIDAuMjV9LCR7ZWZmZWN0aXZlSGVpZ2h0ICogMC4xNX1cbiAgICBhJHtyfSwke3J9IDEgMCwwICR7LTEgKiBlZmZlY3RpdmVXaWR0aCAqIDAuMjV9LDBcbiAgICBhJHtyfSwke3J9IDEgMCwwICR7LTEgKiBlZmZlY3RpdmVXaWR0aCAqIDAuMjV9LDBcbiAgICBhJHtyfSwke3J9IDEgMCwwICR7LTEgKiBlZmZlY3RpdmVXaWR0aCAqIDAuMjV9LCR7LTEgKiBlZmZlY3RpdmVIZWlnaHQgKiAwLjE1fVxuXG4gICAgYSR7cn0sJHtyfSAxIDAsMCAkey0xICogZWZmZWN0aXZlV2lkdGggKiAwLjF9LCR7LTEgKiBlZmZlY3RpdmVIZWlnaHQgKiAwLjMzfVxuICAgIGEke3IgKiAwLjh9LCR7ciAqIDAuOH0gMSAwLDAgMCwkey0xICogZWZmZWN0aXZlSGVpZ2h0ICogMC4zNH1cbiAgICBhJHtyfSwke3J9IDEgMCwwICR7ZWZmZWN0aXZlV2lkdGggKiAwLjF9LCR7LTEgKiBlZmZlY3RpdmVIZWlnaHQgKiAwLjMzfVxuICBIMCBWMCBaYDtcbiAgaWYgKG5vZGUubG9vayA9PT0gXCJoYW5kRHJhd25cIikge1xuICAgIGNvbnN0IHJjID0gcm91Z2g1OS5zdmcoc2hhcGVTdmcpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB1c2VyTm9kZU92ZXJyaWRlcyhub2RlLCB7fSk7XG4gICAgY29uc3Qgcm91Z2hOb2RlID0gcmMucGF0aChwYXRoLCBvcHRpb25zKTtcbiAgICBiYW5nRWxlbSA9IHNoYXBlU3ZnLmluc2VydCgoKSA9PiByb3VnaE5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICAgIGJhbmdFbGVtLmF0dHIoXCJjbGFzc1wiLCBcImJhc2ljIGxhYmVsLWNvbnRhaW5lclwiKS5hdHRyKFwic3R5bGVcIiwgaGFuZGxlVW5kZWZpbmVkQXR0cihjc3NTdHlsZXMpKTtcbiAgfSBlbHNlIHtcbiAgICBiYW5nRWxlbSA9IHNoYXBlU3ZnLmluc2VydChcInBhdGhcIiwgXCI6Zmlyc3QtY2hpbGRcIikuYXR0cihcImNsYXNzXCIsIFwiYmFzaWMgbGFiZWwtY29udGFpbmVyXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKS5hdHRyKFwiZFwiLCBwYXRoKTtcbiAgfVxuICBiYW5nRWxlbS5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHstZWZmZWN0aXZlV2lkdGggLyAyfSwgJHstZWZmZWN0aXZlSGVpZ2h0IC8gMn0pYCk7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgYmFuZ0VsZW0pO1xuICBub2RlLmNhbGNJbnRlcnNlY3QgPSBmdW5jdGlvbihib3VuZHMsIHBvaW50KSB7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnJlY3QoYm91bmRzLCBwb2ludCk7XG4gIH07XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICBsb2cuaW5mbyhcIkJhbmcgaW50ZXJzZWN0XCIsIG5vZGUsIHBvaW50KTtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucmVjdChub2RlLCBwb2ludCk7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZShiYW5nLCBcImJhbmdcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL2Nsb3VkLnRzXG5pbXBvcnQgcm91Z2g2MCBmcm9tIFwicm91Z2hqc1wiO1xuYXN5bmMgZnVuY3Rpb24gY2xvdWQocGFyZW50LCBub2RlKSB7XG4gIGNvbnN0IHsgbGFiZWxTdHlsZXMsIG5vZGVTdHlsZXMgfSA9IHN0eWxlczJTdHJpbmcobm9kZSk7XG4gIG5vZGUubGFiZWxTdHlsZSA9IGxhYmVsU3R5bGVzO1xuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94LCBoYWxmUGFkZGluZywgbGFiZWwgfSA9IGF3YWl0IGxhYmVsSGVscGVyKFxuICAgIHBhcmVudCxcbiAgICBub2RlLFxuICAgIGdldE5vZGVDbGFzc2VzKG5vZGUpXG4gICk7XG4gIGNvbnN0IHcgPSBiYm94LndpZHRoICsgMiAqIGhhbGZQYWRkaW5nO1xuICBjb25zdCBoID0gYmJveC5oZWlnaHQgKyAyICogaGFsZlBhZGRpbmc7XG4gIGNvbnN0IHIxID0gMC4xNSAqIHc7XG4gIGNvbnN0IHIyID0gMC4yNSAqIHc7XG4gIGNvbnN0IHIzID0gMC4zNSAqIHc7XG4gIGNvbnN0IHI0ID0gMC4yICogdztcbiAgY29uc3QgeyBjc3NTdHlsZXMgfSA9IG5vZGU7XG4gIGxldCBjbG91ZEVsZW07XG4gIGNvbnN0IHBhdGggPSBgTTAgMCBcbiAgICBhJHtyMX0sJHtyMX0gMCAwLDEgJHt3ICogMC4yNX0sJHstMSAqIHcgKiAwLjF9XG4gICAgYSR7cjN9LCR7cjN9IDEgMCwxICR7dyAqIDAuNH0sJHstMSAqIHcgKiAwLjF9XG4gICAgYSR7cjJ9LCR7cjJ9IDEgMCwxICR7dyAqIDAuMzV9LCR7dyAqIDAuMn1cblxuICAgIGEke3IxfSwke3IxfSAxIDAsMSAke3cgKiAwLjE1fSwke2ggKiAwLjM1fVxuICAgIGEke3I0fSwke3I0fSAxIDAsMSAkey0xICogdyAqIDAuMTV9LCR7aCAqIDAuNjV9XG5cbiAgICBhJHtyMn0sJHtyMX0gMSAwLDEgJHstMSAqIHcgKiAwLjI1fSwke3cgKiAwLjE1fVxuICAgIGEke3IzfSwke3IzfSAxIDAsMSAkey0xICogdyAqIDAuNX0sMFxuICAgIGEke3IxfSwke3IxfSAxIDAsMSAkey0xICogdyAqIDAuMjV9LCR7LTEgKiB3ICogMC4xNX1cblxuICAgIGEke3IxfSwke3IxfSAxIDAsMSAkey0xICogdyAqIDAuMX0sJHstMSAqIGggKiAwLjM1fVxuICAgIGEke3I0fSwke3I0fSAxIDAsMSAke3cgKiAwLjF9LCR7LTEgKiBoICogMC42NX1cbiAgSDAgVjAgWmA7XG4gIGlmIChub2RlLmxvb2sgPT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBjb25zdCByYyA9IHJvdWdoNjAuc3ZnKHNoYXBlU3ZnKTtcbiAgICBjb25zdCBvcHRpb25zID0gdXNlck5vZGVPdmVycmlkZXMobm9kZSwge30pO1xuICAgIGNvbnN0IHJvdWdoTm9kZSA9IHJjLnBhdGgocGF0aCwgb3B0aW9ucyk7XG4gICAgY2xvdWRFbGVtID0gc2hhcGVTdmcuaW5zZXJ0KCgpID0+IHJvdWdoTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gICAgY2xvdWRFbGVtLmF0dHIoXCJjbGFzc1wiLCBcImJhc2ljIGxhYmVsLWNvbnRhaW5lclwiKS5hdHRyKFwic3R5bGVcIiwgaGFuZGxlVW5kZWZpbmVkQXR0cihjc3NTdHlsZXMpKTtcbiAgfSBlbHNlIHtcbiAgICBjbG91ZEVsZW0gPSBzaGFwZVN2Zy5pbnNlcnQoXCJwYXRoXCIsIFwiOmZpcnN0LWNoaWxkXCIpLmF0dHIoXCJjbGFzc1wiLCBcImJhc2ljIGxhYmVsLWNvbnRhaW5lclwiKS5hdHRyKFwic3R5bGVcIiwgbm9kZVN0eWxlcykuYXR0cihcImRcIiwgcGF0aCk7XG4gIH1cbiAgbGFiZWwuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7LWJib3gud2lkdGggLyAyfSwgJHstYmJveC5oZWlnaHQgLyAyfSlgKTtcbiAgY2xvdWRFbGVtLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgkey13IC8gMn0sICR7LWggLyAyfSlgKTtcbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCBjbG91ZEVsZW0pO1xuICBub2RlLmNhbGNJbnRlcnNlY3QgPSBmdW5jdGlvbihib3VuZHMsIHBvaW50KSB7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnJlY3QoYm91bmRzLCBwb2ludCk7XG4gIH07XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICBsb2cuaW5mbyhcIkNsb3VkIGludGVyc2VjdFwiLCBub2RlLCBwb2ludCk7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnJlY3Qobm9kZSwgcG9pbnQpO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59XG5fX25hbWUoY2xvdWQsIFwiY2xvdWRcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzL2RlZmF1bHRNaW5kbWFwTm9kZS50c1xuYXN5bmMgZnVuY3Rpb24gZGVmYXVsdE1pbmRtYXBOb2RlKHBhcmVudCwgbm9kZSkge1xuICBjb25zdCB7IGxhYmVsU3R5bGVzLCBub2RlU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKG5vZGUpO1xuICBub2RlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCwgaGFsZlBhZGRpbmcsIGxhYmVsIH0gPSBhd2FpdCBsYWJlbEhlbHBlcihcbiAgICBwYXJlbnQsXG4gICAgbm9kZSxcbiAgICBnZXROb2RlQ2xhc3Nlcyhub2RlKVxuICApO1xuICBjb25zdCB3ID0gYmJveC53aWR0aCArIDggKiBoYWxmUGFkZGluZztcbiAgY29uc3QgaCA9IGJib3guaGVpZ2h0ICsgMiAqIGhhbGZQYWRkaW5nO1xuICBjb25zdCByZCA9IDU7XG4gIGNvbnN0IHJlY3RQYXRoID0gbm9kZS5sb29rID09PSBcIm5lb1wiID8gYFxuICAgIE0key13IC8gMn0gJHtoIC8gMiAtIHJkfVxuICAgIHYkey1oICsgMiAqIHJkfVxuICAgIHEwLC0ke3JkfSAke3JkfSwtJHtyZH1cbiAgICBoJHt3IC0gMiAqIHJkfVxuICAgIHEke3JkfSwwICR7cmR9LCR7cmR9XG4gICAgdiR7aCAtIHJkfVxuICAgIEgkey13IC8gMn1cbiAgICBaXG4gIGAgOiBgXG4gICAgTSR7LXcgLyAyfSAke2ggLyAyIC0gcmR9XG4gICAgdiR7LWggKyAyICogcmR9XG4gICAgcTAsLSR7cmR9ICR7cmR9LC0ke3JkfVxuICAgIGgke3cgLSAyICogcmR9XG4gICAgcSR7cmR9LDAgJHtyZH0sJHtyZH1cbiAgICB2JHtoIC0gMiAqIHJkfVxuICAgIHEwLCR7cmR9ICR7LXJkfSwke3JkfVxuICAgIGgkey0odyAtIDIgKiByZCl9XG4gICAgcSR7LXJkfSwwICR7LXJkfSwkey1yZH1cbiAgICBaXG4gIGA7XG4gIGlmICghbm9kZS5kb21JZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBkZWZhdWx0TWluZG1hcE5vZGU6IG5vZGUgXCIke25vZGUuaWR9XCIgaXMgbWlzc2luZyBhIGRvbUlkIFxcdTIwMTQgd2FzIHJlbmRlci50cyBkb21JZCBwcmVmaXhpbmcgc2tpcHBlZD9gXG4gICAgKTtcbiAgfVxuICBjb25zdCBiZyA9IHNoYXBlU3ZnLmFwcGVuZChcInBhdGhcIikuYXR0cihcImlkXCIsIG5vZGUuZG9tSWQpLmF0dHIoXCJjbGFzc1wiLCBcIm5vZGUtYmtnIG5vZGUtXCIgKyBub2RlLnR5cGUpLmF0dHIoXCJzdHlsZVwiLCBub2RlU3R5bGVzKS5hdHRyKFwiZFwiLCByZWN0UGF0aCk7XG4gIHNoYXBlU3ZnLmFwcGVuZChcImxpbmVcIikuYXR0cihcImNsYXNzXCIsIFwibm9kZS1saW5lLVwiKS5hdHRyKFwieDFcIiwgLXcgLyAyKS5hdHRyKFwieTFcIiwgaCAvIDIpLmF0dHIoXCJ4MlwiLCB3IC8gMikuYXR0cihcInkyXCIsIGggLyAyKTtcbiAgbGFiZWwuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7LWJib3gud2lkdGggLyAyfSwgJHstYmJveC5oZWlnaHQgLyAyfSlgKTtcbiAgc2hhcGVTdmcuYXBwZW5kKCgpID0+IGxhYmVsLm5vZGUoKSk7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgYmcpO1xuICBub2RlLmNhbGNJbnRlcnNlY3QgPSBmdW5jdGlvbihib3VuZHMsIHBvaW50KSB7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnJlY3QoYm91bmRzLCBwb2ludCk7XG4gIH07XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucmVjdChub2RlLCBwb2ludCk7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbl9fbmFtZShkZWZhdWx0TWluZG1hcE5vZGUsIFwiZGVmYXVsdE1pbmRtYXBOb2RlXCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL3NoYXBlcy9taW5kbWFwQ2lyY2xlLnRzXG5hc3luYyBmdW5jdGlvbiBtaW5kbWFwQ2lyY2xlKHBhcmVudCwgbm9kZSkge1xuICBjb25zdCBvcHRpb25zID0ge1xuICAgIHBhZGRpbmc6IG5vZGUucGFkZGluZyA/PyAwXG4gIH07XG4gIHJldHVybiBjaXJjbGUocGFyZW50LCBub2RlLCBvcHRpb25zKTtcbn1cbl9fbmFtZShtaW5kbWFwQ2lyY2xlLCBcIm1pbmRtYXBDaXJjbGVcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvc2hhcGVzLnRzXG52YXIgc2hhcGVzRGVmcyA9IFtcbiAge1xuICAgIHNlbWFudGljTmFtZTogXCJQcm9jZXNzXCIsXG4gICAgbmFtZTogXCJSZWN0YW5nbGVcIixcbiAgICBzaG9ydE5hbWU6IFwicmVjdFwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlN0YW5kYXJkIHByb2Nlc3Mgc2hhcGVcIixcbiAgICBhbGlhc2VzOiBbXCJwcm9jXCIsIFwicHJvY2Vzc1wiLCBcInJlY3RhbmdsZVwiXSxcbiAgICBpbnRlcm5hbEFsaWFzZXM6IFtcInNxdWFyZVJlY3RcIl0sXG4gICAgaGFuZGxlcjogc3F1YXJlUmVjdDJcbiAgfSxcbiAge1xuICAgIHNlbWFudGljTmFtZTogXCJFdmVudFwiLFxuICAgIG5hbWU6IFwiUm91bmRlZCBSZWN0YW5nbGVcIixcbiAgICBzaG9ydE5hbWU6IFwicm91bmRlZFwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlJlcHJlc2VudHMgYW4gZXZlbnRcIixcbiAgICBhbGlhc2VzOiBbXCJldmVudFwiXSxcbiAgICBpbnRlcm5hbEFsaWFzZXM6IFtcInJvdW5kZWRSZWN0XCJdLFxuICAgIGhhbmRsZXI6IHJvdW5kZWRSZWN0XG4gIH0sXG4gIHtcbiAgICBzZW1hbnRpY05hbWU6IFwiVGVybWluYWwgUG9pbnRcIixcbiAgICBuYW1lOiBcIlN0YWRpdW1cIixcbiAgICBzaG9ydE5hbWU6IFwic3RhZGl1bVwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlRlcm1pbmFsIHBvaW50XCIsXG4gICAgYWxpYXNlczogW1widGVybWluYWxcIiwgXCJwaWxsXCJdLFxuICAgIGhhbmRsZXI6IHN0YWRpdW1cbiAgfSxcbiAge1xuICAgIHNlbWFudGljTmFtZTogXCJTdWJwcm9jZXNzXCIsXG4gICAgbmFtZTogXCJGcmFtZWQgUmVjdGFuZ2xlXCIsXG4gICAgc2hvcnROYW1lOiBcImZyLXJlY3RcIixcbiAgICBkZXNjcmlwdGlvbjogXCJTdWJwcm9jZXNzXCIsXG4gICAgYWxpYXNlczogW1wic3VicHJvY2Vzc1wiLCBcInN1YnByb2NcIiwgXCJmcmFtZWQtcmVjdGFuZ2xlXCIsIFwic3Vicm91dGluZVwiXSxcbiAgICBoYW5kbGVyOiBzdWJyb3V0aW5lXG4gIH0sXG4gIHtcbiAgICBzZW1hbnRpY05hbWU6IFwiRGF0YWJhc2VcIixcbiAgICBuYW1lOiBcIkN5bGluZGVyXCIsXG4gICAgc2hvcnROYW1lOiBcImN5bFwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkRhdGFiYXNlIHN0b3JhZ2VcIixcbiAgICBhbGlhc2VzOiBbXCJkYlwiLCBcImRhdGFiYXNlXCIsIFwiY3lsaW5kZXJcIl0sXG4gICAgaGFuZGxlcjogY3lsaW5kZXJcbiAgfSxcbiAge1xuICAgIHNlbWFudGljTmFtZTogXCJEYXRhIFN0b3JlXCIsXG4gICAgbmFtZTogXCJEYXRhIFN0b3JlXCIsXG4gICAgc2hvcnROYW1lOiBcImRhdGFzdG9yZVwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkRhdGEgZmxvdyBkaWFncmFtIGRhdGEgc3RvcmVcIixcbiAgICBhbGlhc2VzOiBbXCJkYXRhLXN0b3JlXCJdLFxuICAgIGhhbmRsZXI6IGRhdGFzdG9yZVxuICB9LFxuICB7XG4gICAgc2VtYW50aWNOYW1lOiBcIlN0YXJ0XCIsXG4gICAgbmFtZTogXCJDaXJjbGVcIixcbiAgICBzaG9ydE5hbWU6IFwiY2lyY2xlXCIsXG4gICAgZGVzY3JpcHRpb246IFwiU3RhcnRpbmcgcG9pbnRcIixcbiAgICBhbGlhc2VzOiBbXCJjaXJjXCJdLFxuICAgIGhhbmRsZXI6IGNpcmNsZVxuICB9LFxuICB7XG4gICAgc2VtYW50aWNOYW1lOiBcIkJhbmdcIixcbiAgICBuYW1lOiBcIkJhbmdcIixcbiAgICBzaG9ydE5hbWU6IFwiYmFuZ1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkJhbmdcIixcbiAgICBhbGlhc2VzOiBbXCJiYW5nXCJdLFxuICAgIGhhbmRsZXI6IGJhbmdcbiAgfSxcbiAge1xuICAgIHNlbWFudGljTmFtZTogXCJDbG91ZFwiLFxuICAgIG5hbWU6IFwiQ2xvdWRcIixcbiAgICBzaG9ydE5hbWU6IFwiY2xvdWRcIixcbiAgICBkZXNjcmlwdGlvbjogXCJjbG91ZFwiLFxuICAgIGFsaWFzZXM6IFtcImNsb3VkXCJdLFxuICAgIGhhbmRsZXI6IGNsb3VkXG4gIH0sXG4gIHtcbiAgICBzZW1hbnRpY05hbWU6IFwiRGVjaXNpb25cIixcbiAgICBuYW1lOiBcIkRpYW1vbmRcIixcbiAgICBzaG9ydE5hbWU6IFwiZGlhbVwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkRlY2lzaW9uLW1ha2luZyBzdGVwXCIsXG4gICAgYWxpYXNlczogW1wiZGVjaXNpb25cIiwgXCJkaWFtb25kXCIsIFwicXVlc3Rpb25cIl0sXG4gICAgaGFuZGxlcjogcXVlc3Rpb25cbiAgfSxcbiAge1xuICAgIHNlbWFudGljTmFtZTogXCJQcmVwYXJlIENvbmRpdGlvbmFsXCIsXG4gICAgbmFtZTogXCJIZXhhZ29uXCIsXG4gICAgc2hvcnROYW1lOiBcImhleFwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlByZXBhcmF0aW9uIG9yIGNvbmRpdGlvbiBzdGVwXCIsXG4gICAgYWxpYXNlczogW1wiaGV4YWdvblwiLCBcInByZXBhcmVcIl0sXG4gICAgaGFuZGxlcjogaGV4YWdvblxuICB9LFxuICB7XG4gICAgc2VtYW50aWNOYW1lOiBcIkRhdGEgSW5wdXQvT3V0cHV0XCIsXG4gICAgbmFtZTogXCJMZWFuIFJpZ2h0XCIsXG4gICAgc2hvcnROYW1lOiBcImxlYW4tclwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlJlcHJlc2VudHMgaW5wdXQgb3Igb3V0cHV0XCIsXG4gICAgYWxpYXNlczogW1wibGVhbi1yaWdodFwiLCBcImluLW91dFwiXSxcbiAgICBpbnRlcm5hbEFsaWFzZXM6IFtcImxlYW5fcmlnaHRcIl0sXG4gICAgaGFuZGxlcjogbGVhbl9yaWdodFxuICB9LFxuICB7XG4gICAgc2VtYW50aWNOYW1lOiBcIkRhdGEgSW5wdXQvT3V0cHV0XCIsXG4gICAgbmFtZTogXCJMZWFuIExlZnRcIixcbiAgICBzaG9ydE5hbWU6IFwibGVhbi1sXCIsXG4gICAgZGVzY3JpcHRpb246IFwiUmVwcmVzZW50cyBvdXRwdXQgb3IgaW5wdXRcIixcbiAgICBhbGlhc2VzOiBbXCJsZWFuLWxlZnRcIiwgXCJvdXQtaW5cIl0sXG4gICAgaW50ZXJuYWxBbGlhc2VzOiBbXCJsZWFuX2xlZnRcIl0sXG4gICAgaGFuZGxlcjogbGVhbl9sZWZ0XG4gIH0sXG4gIHtcbiAgICBzZW1hbnRpY05hbWU6IFwiUHJpb3JpdHkgQWN0aW9uXCIsXG4gICAgbmFtZTogXCJUcmFwZXpvaWQgQmFzZSBCb3R0b21cIixcbiAgICBzaG9ydE5hbWU6IFwidHJhcC1iXCIsXG4gICAgZGVzY3JpcHRpb246IFwiUHJpb3JpdHkgYWN0aW9uXCIsXG4gICAgYWxpYXNlczogW1wicHJpb3JpdHlcIiwgXCJ0cmFwZXpvaWQtYm90dG9tXCIsIFwidHJhcGV6b2lkXCJdLFxuICAgIGhhbmRsZXI6IHRyYXBlem9pZFxuICB9LFxuICB7XG4gICAgc2VtYW50aWNOYW1lOiBcIk1hbnVhbCBPcGVyYXRpb25cIixcbiAgICBuYW1lOiBcIlRyYXBlem9pZCBCYXNlIFRvcFwiLFxuICAgIHNob3J0TmFtZTogXCJ0cmFwLXRcIixcbiAgICBkZXNjcmlwdGlvbjogXCJSZXByZXNlbnRzIGEgbWFudWFsIHRhc2tcIixcbiAgICBhbGlhc2VzOiBbXCJtYW51YWxcIiwgXCJ0cmFwZXpvaWQtdG9wXCIsIFwiaW52LXRyYXBlem9pZFwiXSxcbiAgICBpbnRlcm5hbEFsaWFzZXM6IFtcImludl90cmFwZXpvaWRcIl0sXG4gICAgaGFuZGxlcjogaW52X3RyYXBlem9pZFxuICB9LFxuICB7XG4gICAgc2VtYW50aWNOYW1lOiBcIlN0b3BcIixcbiAgICBuYW1lOiBcIkRvdWJsZSBDaXJjbGVcIixcbiAgICBzaG9ydE5hbWU6IFwiZGJsLWNpcmNcIixcbiAgICBkZXNjcmlwdGlvbjogXCJSZXByZXNlbnRzIGEgc3RvcCBwb2ludFwiLFxuICAgIGFsaWFzZXM6IFtcImRvdWJsZS1jaXJjbGVcIl0sXG4gICAgaW50ZXJuYWxBbGlhc2VzOiBbXCJkb3VibGVjaXJjbGVcIl0sXG4gICAgaGFuZGxlcjogZG91YmxlY2lyY2xlXG4gIH0sXG4gIHtcbiAgICBzZW1hbnRpY05hbWU6IFwiVGV4dCBCbG9ja1wiLFxuICAgIG5hbWU6IFwiVGV4dCBCbG9ja1wiLFxuICAgIHNob3J0TmFtZTogXCJ0ZXh0XCIsXG4gICAgZGVzY3JpcHRpb246IFwiVGV4dCBibG9ja1wiLFxuICAgIGhhbmRsZXI6IHRleHRcbiAgfSxcbiAge1xuICAgIHNlbWFudGljTmFtZTogXCJDYXJkXCIsXG4gICAgbmFtZTogXCJOb3RjaGVkIFJlY3RhbmdsZVwiLFxuICAgIHNob3J0TmFtZTogXCJub3RjaC1yZWN0XCIsXG4gICAgZGVzY3JpcHRpb246IFwiUmVwcmVzZW50cyBhIGNhcmRcIixcbiAgICBhbGlhc2VzOiBbXCJjYXJkXCIsIFwibm90Y2hlZC1yZWN0YW5nbGVcIl0sXG4gICAgaGFuZGxlcjogY2FyZFxuICB9LFxuICB7XG4gICAgc2VtYW50aWNOYW1lOiBcIkxpbmVkL1NoYWRlZCBQcm9jZXNzXCIsXG4gICAgbmFtZTogXCJMaW5lZCBSZWN0YW5nbGVcIixcbiAgICBzaG9ydE5hbWU6IFwibGluLXJlY3RcIixcbiAgICBkZXNjcmlwdGlvbjogXCJMaW5lZCBwcm9jZXNzIHNoYXBlXCIsXG4gICAgYWxpYXNlczogW1wibGluZWQtcmVjdGFuZ2xlXCIsIFwibGluZWQtcHJvY2Vzc1wiLCBcImxpbi1wcm9jXCIsIFwic2hhZGVkLXByb2Nlc3NcIl0sXG4gICAgaGFuZGxlcjogc2hhZGVkUHJvY2Vzc1xuICB9LFxuICB7XG4gICAgc2VtYW50aWNOYW1lOiBcIlN0YXJ0XCIsXG4gICAgbmFtZTogXCJTbWFsbCBDaXJjbGVcIixcbiAgICBzaG9ydE5hbWU6IFwic20tY2lyY1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlNtYWxsIHN0YXJ0aW5nIHBvaW50XCIsXG4gICAgYWxpYXNlczogW1wic3RhcnRcIiwgXCJzbWFsbC1jaXJjbGVcIl0sXG4gICAgaW50ZXJuYWxBbGlhc2VzOiBbXCJzdGF0ZVN0YXJ0XCJdLFxuICAgIGhhbmRsZXI6IHN0YXRlU3RhcnRcbiAgfSxcbiAge1xuICAgIHNlbWFudGljTmFtZTogXCJTdG9wXCIsXG4gICAgbmFtZTogXCJGcmFtZWQgQ2lyY2xlXCIsXG4gICAgc2hvcnROYW1lOiBcImZyLWNpcmNcIixcbiAgICBkZXNjcmlwdGlvbjogXCJTdG9wIHBvaW50XCIsXG4gICAgYWxpYXNlczogW1wic3RvcFwiLCBcImZyYW1lZC1jaXJjbGVcIl0sXG4gICAgaW50ZXJuYWxBbGlhc2VzOiBbXCJzdGF0ZUVuZFwiXSxcbiAgICBoYW5kbGVyOiBzdGF0ZUVuZFxuICB9LFxuICB7XG4gICAgc2VtYW50aWNOYW1lOiBcIkZvcmsvSm9pblwiLFxuICAgIG5hbWU6IFwiRmlsbGVkIFJlY3RhbmdsZVwiLFxuICAgIHNob3J0TmFtZTogXCJmb3JrXCIsXG4gICAgZGVzY3JpcHRpb246IFwiRm9yayBvciBqb2luIGluIHByb2Nlc3MgZmxvd1wiLFxuICAgIGFsaWFzZXM6IFtcImpvaW5cIl0sXG4gICAgaW50ZXJuYWxBbGlhc2VzOiBbXCJmb3JrSm9pblwiXSxcbiAgICBoYW5kbGVyOiBmb3JrSm9pblxuICB9LFxuICB7XG4gICAgc2VtYW50aWNOYW1lOiBcIkNvbGxhdGVcIixcbiAgICBuYW1lOiBcIkhvdXJnbGFzc1wiLFxuICAgIHNob3J0TmFtZTogXCJob3VyZ2xhc3NcIixcbiAgICBkZXNjcmlwdGlvbjogXCJSZXByZXNlbnRzIGEgY29sbGF0ZSBvcGVyYXRpb25cIixcbiAgICBhbGlhc2VzOiBbXCJob3VyZ2xhc3NcIiwgXCJjb2xsYXRlXCJdLFxuICAgIGhhbmRsZXI6IGhvdXJnbGFzc1xuICB9LFxuICB7XG4gICAgc2VtYW50aWNOYW1lOiBcIkNvbW1lbnRcIixcbiAgICBuYW1lOiBcIkN1cmx5IEJyYWNlXCIsXG4gICAgc2hvcnROYW1lOiBcImJyYWNlXCIsXG4gICAgZGVzY3JpcHRpb246IFwiQWRkcyBhIGNvbW1lbnRcIixcbiAgICBhbGlhc2VzOiBbXCJjb21tZW50XCIsIFwiYnJhY2UtbFwiXSxcbiAgICBoYW5kbGVyOiBjdXJseUJyYWNlTGVmdFxuICB9LFxuICB7XG4gICAgc2VtYW50aWNOYW1lOiBcIkNvbW1lbnQgUmlnaHRcIixcbiAgICBuYW1lOiBcIkN1cmx5IEJyYWNlXCIsXG4gICAgc2hvcnROYW1lOiBcImJyYWNlLXJcIixcbiAgICBkZXNjcmlwdGlvbjogXCJBZGRzIGEgY29tbWVudFwiLFxuICAgIGhhbmRsZXI6IGN1cmx5QnJhY2VSaWdodFxuICB9LFxuICB7XG4gICAgc2VtYW50aWNOYW1lOiBcIkNvbW1lbnQgd2l0aCBicmFjZXMgb24gYm90aCBzaWRlc1wiLFxuICAgIG5hbWU6IFwiQ3VybHkgQnJhY2VzXCIsXG4gICAgc2hvcnROYW1lOiBcImJyYWNlc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkFkZHMgYSBjb21tZW50XCIsXG4gICAgaGFuZGxlcjogY3VybHlCcmFjZXNcbiAgfSxcbiAge1xuICAgIHNlbWFudGljTmFtZTogXCJDb20gTGlua1wiLFxuICAgIG5hbWU6IFwiTGlnaHRuaW5nIEJvbHRcIixcbiAgICBzaG9ydE5hbWU6IFwiYm9sdFwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkNvbW11bmljYXRpb24gbGlua1wiLFxuICAgIGFsaWFzZXM6IFtcImNvbS1saW5rXCIsIFwibGlnaHRuaW5nLWJvbHRcIl0sXG4gICAgaGFuZGxlcjogbGlnaHRuaW5nQm9sdFxuICB9LFxuICB7XG4gICAgc2VtYW50aWNOYW1lOiBcIkRvY3VtZW50XCIsXG4gICAgbmFtZTogXCJEb2N1bWVudFwiLFxuICAgIHNob3J0TmFtZTogXCJkb2NcIixcbiAgICBkZXNjcmlwdGlvbjogXCJSZXByZXNlbnRzIGEgZG9jdW1lbnRcIixcbiAgICBhbGlhc2VzOiBbXCJkb2NcIiwgXCJkb2N1bWVudFwiXSxcbiAgICBoYW5kbGVyOiB3YXZlRWRnZWRSZWN0YW5nbGVcbiAgfSxcbiAge1xuICAgIHNlbWFudGljTmFtZTogXCJEZWxheVwiLFxuICAgIG5hbWU6IFwiSGFsZi1Sb3VuZGVkIFJlY3RhbmdsZVwiLFxuICAgIHNob3J0TmFtZTogXCJkZWxheVwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlJlcHJlc2VudHMgYSBkZWxheVwiLFxuICAgIGFsaWFzZXM6IFtcImhhbGYtcm91bmRlZC1yZWN0YW5nbGVcIl0sXG4gICAgaGFuZGxlcjogaGFsZlJvdW5kZWRSZWN0YW5nbGVcbiAgfSxcbiAge1xuICAgIHNlbWFudGljTmFtZTogXCJEaXJlY3QgQWNjZXNzIFN0b3JhZ2VcIixcbiAgICBuYW1lOiBcIkhvcml6b250YWwgQ3lsaW5kZXJcIixcbiAgICBzaG9ydE5hbWU6IFwiaC1jeWxcIixcbiAgICBkZXNjcmlwdGlvbjogXCJEaXJlY3QgYWNjZXNzIHN0b3JhZ2VcIixcbiAgICBhbGlhc2VzOiBbXCJkYXNcIiwgXCJob3Jpem9udGFsLWN5bGluZGVyXCJdLFxuICAgIGhhbmRsZXI6IHRpbHRlZEN5bGluZGVyXG4gIH0sXG4gIHtcbiAgICBzZW1hbnRpY05hbWU6IFwiRGlzayBTdG9yYWdlXCIsXG4gICAgbmFtZTogXCJMaW5lZCBDeWxpbmRlclwiLFxuICAgIHNob3J0TmFtZTogXCJsaW4tY3lsXCIsXG4gICAgZGVzY3JpcHRpb246IFwiRGlzayBzdG9yYWdlXCIsXG4gICAgYWxpYXNlczogW1wiZGlza1wiLCBcImxpbmVkLWN5bGluZGVyXCJdLFxuICAgIGhhbmRsZXI6IGxpbmVkQ3lsaW5kZXJcbiAgfSxcbiAge1xuICAgIHNlbWFudGljTmFtZTogXCJEaXNwbGF5XCIsXG4gICAgbmFtZTogXCJDdXJ2ZWQgVHJhcGV6b2lkXCIsXG4gICAgc2hvcnROYW1lOiBcImN1cnYtdHJhcFwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlJlcHJlc2VudHMgYSBkaXNwbGF5XCIsXG4gICAgYWxpYXNlczogW1wiY3VydmVkLXRyYXBlem9pZFwiLCBcImRpc3BsYXlcIl0sXG4gICAgaGFuZGxlcjogY3VydmVkVHJhcGV6b2lkXG4gIH0sXG4gIHtcbiAgICBzZW1hbnRpY05hbWU6IFwiRGl2aWRlZCBQcm9jZXNzXCIsXG4gICAgbmFtZTogXCJEaXZpZGVkIFJlY3RhbmdsZVwiLFxuICAgIHNob3J0TmFtZTogXCJkaXYtcmVjdFwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkRpdmlkZWQgcHJvY2VzcyBzaGFwZVwiLFxuICAgIGFsaWFzZXM6IFtcImRpdi1wcm9jXCIsIFwiZGl2aWRlZC1yZWN0YW5nbGVcIiwgXCJkaXZpZGVkLXByb2Nlc3NcIl0sXG4gICAgaGFuZGxlcjogZGl2aWRlZFJlY3RhbmdsZVxuICB9LFxuICB7XG4gICAgc2VtYW50aWNOYW1lOiBcIkV4dHJhY3RcIixcbiAgICBuYW1lOiBcIlRyaWFuZ2xlXCIsXG4gICAgc2hvcnROYW1lOiBcInRyaVwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkV4dHJhY3Rpb24gcHJvY2Vzc1wiLFxuICAgIGFsaWFzZXM6IFtcImV4dHJhY3RcIiwgXCJ0cmlhbmdsZVwiXSxcbiAgICBoYW5kbGVyOiB0cmlhbmdsZVxuICB9LFxuICB7XG4gICAgc2VtYW50aWNOYW1lOiBcIkludGVybmFsIFN0b3JhZ2VcIixcbiAgICBuYW1lOiBcIldpbmRvdyBQYW5lXCIsXG4gICAgc2hvcnROYW1lOiBcIndpbi1wYW5lXCIsXG4gICAgZGVzY3JpcHRpb246IFwiSW50ZXJuYWwgc3RvcmFnZVwiLFxuICAgIGFsaWFzZXM6IFtcImludGVybmFsLXN0b3JhZ2VcIiwgXCJ3aW5kb3ctcGFuZVwiXSxcbiAgICBoYW5kbGVyOiB3aW5kb3dQYW5lXG4gIH0sXG4gIHtcbiAgICBzZW1hbnRpY05hbWU6IFwiSnVuY3Rpb25cIixcbiAgICBuYW1lOiBcIkZpbGxlZCBDaXJjbGVcIixcbiAgICBzaG9ydE5hbWU6IFwiZi1jaXJjXCIsXG4gICAgZGVzY3JpcHRpb246IFwiSnVuY3Rpb24gcG9pbnRcIixcbiAgICBhbGlhc2VzOiBbXCJqdW5jdGlvblwiLCBcImZpbGxlZC1jaXJjbGVcIl0sXG4gICAgaGFuZGxlcjogZmlsbGVkQ2lyY2xlXG4gIH0sXG4gIHtcbiAgICBzZW1hbnRpY05hbWU6IFwiTG9vcCBMaW1pdFwiLFxuICAgIG5hbWU6IFwiVHJhcGV6b2lkYWwgUGVudGFnb25cIixcbiAgICBzaG9ydE5hbWU6IFwibm90Y2gtcGVudFwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIkxvb3AgbGltaXQgc3RlcFwiLFxuICAgIGFsaWFzZXM6IFtcImxvb3AtbGltaXRcIiwgXCJub3RjaGVkLXBlbnRhZ29uXCJdLFxuICAgIGhhbmRsZXI6IHRyYXBlem9pZGFsUGVudGFnb25cbiAgfSxcbiAge1xuICAgIHNlbWFudGljTmFtZTogXCJNYW51YWwgRmlsZVwiLFxuICAgIG5hbWU6IFwiRmxpcHBlZCBUcmlhbmdsZVwiLFxuICAgIHNob3J0TmFtZTogXCJmbGlwLXRyaVwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIk1hbnVhbCBmaWxlIG9wZXJhdGlvblwiLFxuICAgIGFsaWFzZXM6IFtcIm1hbnVhbC1maWxlXCIsIFwiZmxpcHBlZC10cmlhbmdsZVwiXSxcbiAgICBoYW5kbGVyOiBmbGlwcGVkVHJpYW5nbGVcbiAgfSxcbiAge1xuICAgIHNlbWFudGljTmFtZTogXCJNYW51YWwgSW5wdXRcIixcbiAgICBuYW1lOiBcIlNsb3BlZCBSZWN0YW5nbGVcIixcbiAgICBzaG9ydE5hbWU6IFwic2wtcmVjdFwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIk1hbnVhbCBpbnB1dCBzdGVwXCIsXG4gICAgYWxpYXNlczogW1wibWFudWFsLWlucHV0XCIsIFwic2xvcGVkLXJlY3RhbmdsZVwiXSxcbiAgICBoYW5kbGVyOiBzbG9wZWRSZWN0XG4gIH0sXG4gIHtcbiAgICBzZW1hbnRpY05hbWU6IFwiTXVsdGktRG9jdW1lbnRcIixcbiAgICBuYW1lOiBcIlN0YWNrZWQgRG9jdW1lbnRcIixcbiAgICBzaG9ydE5hbWU6IFwiZG9jc1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIk11bHRpcGxlIGRvY3VtZW50c1wiLFxuICAgIGFsaWFzZXM6IFtcImRvY3VtZW50c1wiLCBcInN0LWRvY1wiLCBcInN0YWNrZWQtZG9jdW1lbnRcIl0sXG4gICAgaGFuZGxlcjogbXVsdGlXYXZlRWRnZWRSZWN0YW5nbGVcbiAgfSxcbiAge1xuICAgIHNlbWFudGljTmFtZTogXCJNdWx0aS1Qcm9jZXNzXCIsXG4gICAgbmFtZTogXCJTdGFja2VkIFJlY3RhbmdsZVwiLFxuICAgIHNob3J0TmFtZTogXCJzdC1yZWN0XCIsXG4gICAgZGVzY3JpcHRpb246IFwiTXVsdGlwbGUgcHJvY2Vzc2VzXCIsXG4gICAgYWxpYXNlczogW1wicHJvY3NcIiwgXCJwcm9jZXNzZXNcIiwgXCJzdGFja2VkLXJlY3RhbmdsZVwiXSxcbiAgICBoYW5kbGVyOiBtdWx0aVJlY3RcbiAgfSxcbiAge1xuICAgIHNlbWFudGljTmFtZTogXCJTdG9yZWQgRGF0YVwiLFxuICAgIG5hbWU6IFwiQm93IFRpZSBSZWN0YW5nbGVcIixcbiAgICBzaG9ydE5hbWU6IFwiYm93LXJlY3RcIixcbiAgICBkZXNjcmlwdGlvbjogXCJTdG9yZWQgZGF0YVwiLFxuICAgIGFsaWFzZXM6IFtcInN0b3JlZC1kYXRhXCIsIFwiYm93LXRpZS1yZWN0YW5nbGVcIl0sXG4gICAgaGFuZGxlcjogYm93VGllUmVjdFxuICB9LFxuICB7XG4gICAgc2VtYW50aWNOYW1lOiBcIlN1bW1hcnlcIixcbiAgICBuYW1lOiBcIkNyb3NzZWQgQ2lyY2xlXCIsXG4gICAgc2hvcnROYW1lOiBcImNyb3NzLWNpcmNcIixcbiAgICBkZXNjcmlwdGlvbjogXCJTdW1tYXJ5XCIsXG4gICAgYWxpYXNlczogW1wic3VtbWFyeVwiLCBcImNyb3NzZWQtY2lyY2xlXCJdLFxuICAgIGhhbmRsZXI6IGNyb3NzZWRDaXJjbGVcbiAgfSxcbiAge1xuICAgIHNlbWFudGljTmFtZTogXCJUYWdnZWQgRG9jdW1lbnRcIixcbiAgICBuYW1lOiBcIlRhZ2dlZCBEb2N1bWVudFwiLFxuICAgIHNob3J0TmFtZTogXCJ0YWctZG9jXCIsXG4gICAgZGVzY3JpcHRpb246IFwiVGFnZ2VkIGRvY3VtZW50XCIsXG4gICAgYWxpYXNlczogW1widGFnLWRvY1wiLCBcInRhZ2dlZC1kb2N1bWVudFwiXSxcbiAgICBoYW5kbGVyOiB0YWdnZWRXYXZlRWRnZWRSZWN0YW5nbGVcbiAgfSxcbiAge1xuICAgIHNlbWFudGljTmFtZTogXCJUYWdnZWQgUHJvY2Vzc1wiLFxuICAgIG5hbWU6IFwiVGFnZ2VkIFJlY3RhbmdsZVwiLFxuICAgIHNob3J0TmFtZTogXCJ0YWctcmVjdFwiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlRhZ2dlZCBwcm9jZXNzXCIsXG4gICAgYWxpYXNlczogW1widGFnZ2VkLXJlY3RhbmdsZVwiLCBcInRhZy1wcm9jXCIsIFwidGFnZ2VkLXByb2Nlc3NcIl0sXG4gICAgaGFuZGxlcjogdGFnZ2VkUmVjdFxuICB9LFxuICB7XG4gICAgc2VtYW50aWNOYW1lOiBcIlBhcGVyIFRhcGVcIixcbiAgICBuYW1lOiBcIkZsYWdcIixcbiAgICBzaG9ydE5hbWU6IFwiZmxhZ1wiLFxuICAgIGRlc2NyaXB0aW9uOiBcIlBhcGVyIHRhcGVcIixcbiAgICBhbGlhc2VzOiBbXCJwYXBlci10YXBlXCJdLFxuICAgIGhhbmRsZXI6IHdhdmVSZWN0YW5nbGVcbiAgfSxcbiAge1xuICAgIHNlbWFudGljTmFtZTogXCJPZGRcIixcbiAgICBuYW1lOiBcIk9kZFwiLFxuICAgIHNob3J0TmFtZTogXCJvZGRcIixcbiAgICBkZXNjcmlwdGlvbjogXCJPZGQgc2hhcGVcIixcbiAgICBpbnRlcm5hbEFsaWFzZXM6IFtcInJlY3RfbGVmdF9pbnZfYXJyb3dcIl0sXG4gICAgaGFuZGxlcjogcmVjdF9sZWZ0X2ludl9hcnJvd1xuICB9LFxuICB7XG4gICAgc2VtYW50aWNOYW1lOiBcIkxpbmVkIERvY3VtZW50XCIsXG4gICAgbmFtZTogXCJMaW5lZCBEb2N1bWVudFwiLFxuICAgIHNob3J0TmFtZTogXCJsaW4tZG9jXCIsXG4gICAgZGVzY3JpcHRpb246IFwiTGluZWQgZG9jdW1lbnRcIixcbiAgICBhbGlhc2VzOiBbXCJsaW5lZC1kb2N1bWVudFwiXSxcbiAgICBoYW5kbGVyOiBsaW5lZFdhdmVFZGdlZFJlY3RcbiAgfVxuXTtcbnZhciBnZW5lcmF0ZVNoYXBlTWFwID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiB7XG4gIGNvbnN0IHVuZG9jdW1lbnRlZFNoYXBlcyA9IHtcbiAgICAvLyBTdGF0ZXNcbiAgICBzdGF0ZSxcbiAgICBjaG9pY2UsXG4gICAgbm90ZSxcbiAgICAvLyBSZWN0YW5nbGVzXG4gICAgcmVjdFdpdGhUaXRsZSxcbiAgICBsYWJlbFJlY3QsXG4gICAgLy8gSWNvbnNcbiAgICBpY29uU3F1YXJlLFxuICAgIGljb25DaXJjbGUsXG4gICAgaWNvbixcbiAgICBpY29uUm91bmRlZCxcbiAgICBpbWFnZVNxdWFyZSxcbiAgICBhbmNob3IsXG4gICAgLy8gS2FuYmFuIGRpYWdyYW1cbiAgICBrYW5iYW5JdGVtLFxuICAgIC8vTWluZG1hcCBkaWFncmFtXG4gICAgbWluZG1hcENpcmNsZSxcbiAgICBkZWZhdWx0TWluZG1hcE5vZGUsXG4gICAgLy8gY2xhc3MgZGlhZ3JhbVxuICAgIGNsYXNzQm94LFxuICAgIC8vIGVyIGRpYWdyYW1cbiAgICBlckJveCxcbiAgICAvLyBSZXF1aXJlbWVudCBkaWFncmFtXG4gICAgcmVxdWlyZW1lbnRCb3hcbiAgfTtcbiAgY29uc3QgZW50cmllcyA9IFtcbiAgICAuLi5PYmplY3QuZW50cmllcyh1bmRvY3VtZW50ZWRTaGFwZXMpLFxuICAgIC4uLnNoYXBlc0RlZnMuZmxhdE1hcCgoc2hhcGUpID0+IHtcbiAgICAgIGNvbnN0IGFsaWFzZXMgPSBbXG4gICAgICAgIHNoYXBlLnNob3J0TmFtZSxcbiAgICAgICAgLi4uXCJhbGlhc2VzXCIgaW4gc2hhcGUgPyBzaGFwZS5hbGlhc2VzIDogW10sXG4gICAgICAgIC4uLlwiaW50ZXJuYWxBbGlhc2VzXCIgaW4gc2hhcGUgPyBzaGFwZS5pbnRlcm5hbEFsaWFzZXMgOiBbXVxuICAgICAgXTtcbiAgICAgIHJldHVybiBhbGlhc2VzLm1hcCgoYWxpYXMpID0+IFthbGlhcywgc2hhcGUuaGFuZGxlcl0pO1xuICAgIH0pXG4gIF07XG4gIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoZW50cmllcyk7XG59LCBcImdlbmVyYXRlU2hhcGVNYXBcIik7XG52YXIgc2hhcGVzMiA9IGdlbmVyYXRlU2hhcGVNYXAoKTtcbmZ1bmN0aW9uIGlzVmFsaWRTaGFwZShzaGFwZSkge1xuICByZXR1cm4gc2hhcGUgaW4gc2hhcGVzMjtcbn1cbl9fbmFtZShpc1ZhbGlkU2hhcGUsIFwiaXNWYWxpZFNoYXBlXCIpO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL25vZGVzLnRzXG52YXIgbm9kZUVsZW1zID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbmFzeW5jIGZ1bmN0aW9uIGluc2VydE5vZGUoZWxlbSwgbm9kZSwgcmVuZGVyT3B0aW9ucykge1xuICBsZXQgbmV3RWw7XG4gIGxldCBlbDtcbiAgaWYgKG5vZGUuc2hhcGUgPT09IFwicmVjdFwiKSB7XG4gICAgaWYgKG5vZGUucnggJiYgbm9kZS5yeSkge1xuICAgICAgbm9kZS5zaGFwZSA9IFwicm91bmRlZFJlY3RcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZS5zaGFwZSA9IFwic3F1YXJlUmVjdFwiO1xuICAgIH1cbiAgfVxuICBjb25zdCBzaGFwZUhhbmRsZXIgPSBub2RlLnNoYXBlID8gc2hhcGVzMltub2RlLnNoYXBlXSA6IHZvaWQgMDtcbiAgaWYgKCFzaGFwZUhhbmRsZXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHN1Y2ggc2hhcGU6ICR7bm9kZS5zaGFwZX0uIFBsZWFzZSBjaGVjayB5b3VyIHN5bnRheC5gKTtcbiAgfVxuICBpZiAobm9kZS5saW5rKSB7XG4gICAgbGV0IHRhcmdldDtcbiAgICBpZiAocmVuZGVyT3B0aW9ucy5jb25maWcuc2VjdXJpdHlMZXZlbCA9PT0gXCJzYW5kYm94XCIpIHtcbiAgICAgIHRhcmdldCA9IFwiX3RvcFwiO1xuICAgIH0gZWxzZSBpZiAobm9kZS5saW5rVGFyZ2V0KSB7XG4gICAgICB0YXJnZXQgPSBub2RlLmxpbmtUYXJnZXQgfHwgXCJfYmxhbmtcIjtcbiAgICB9XG4gICAgbmV3RWwgPSBlbGVtLmluc2VydChcInN2ZzphXCIpLmF0dHIoXCJ4bGluazpocmVmXCIsIG5vZGUubGluaykuYXR0cihcInRhcmdldFwiLCB0YXJnZXQgPz8gbnVsbCk7XG4gICAgZWwgPSBhd2FpdCBzaGFwZUhhbmRsZXIobmV3RWwsIG5vZGUsIHJlbmRlck9wdGlvbnMpO1xuICB9IGVsc2Uge1xuICAgIGVsID0gYXdhaXQgc2hhcGVIYW5kbGVyKGVsZW0sIG5vZGUsIHJlbmRlck9wdGlvbnMpO1xuICAgIG5ld0VsID0gZWw7XG4gIH1cbiAgbmV3RWwuYXR0cihcImRhdGEtbG9va1wiLCBoYW5kbGVVbmRlZmluZWRBdHRyKG5vZGUubG9vaykpO1xuICBpZiAobm9kZS50b29sdGlwKSB7XG4gICAgZWwuYXR0cihcInRpdGxlXCIsIG5vZGUudG9vbHRpcCk7XG4gIH1cbiAgbm9kZUVsZW1zLnNldChub2RlLmlkLCBuZXdFbCk7XG4gIGlmIChub2RlLmhhdmVDYWxsYmFjaykge1xuICAgIG5ld0VsLmF0dHIoXCJjbGFzc1wiLCBuZXdFbC5hdHRyKFwiY2xhc3NcIikgKyBcIiBjbGlja2FibGVcIik7XG4gIH1cbiAgcmV0dXJuIG5ld0VsO1xufVxuX19uYW1lKGluc2VydE5vZGUsIFwiaW5zZXJ0Tm9kZVwiKTtcbnZhciBzZXROb2RlRWxlbSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGVsZW0sIG5vZGUpID0+IHtcbiAgbm9kZUVsZW1zLnNldChub2RlLmlkLCBlbGVtKTtcbn0sIFwic2V0Tm9kZUVsZW1cIik7XG52YXIgY2xlYXIyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiB7XG4gIG5vZGVFbGVtcy5jbGVhcigpO1xufSwgXCJjbGVhclwiKTtcbnZhciBwb3NpdGlvbk5vZGUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChub2RlKSA9PiB7XG4gIGNvbnN0IGVsID0gbm9kZUVsZW1zLmdldChub2RlLmlkKTtcbiAgbG9nLnRyYWNlKFxuICAgIFwiVHJhbnNmb3JtaW5nIG5vZGVcIixcbiAgICBub2RlLmRpZmYsXG4gICAgbm9kZSxcbiAgICBcInRyYW5zbGF0ZShcIiArIChub2RlLnggLSBub2RlLndpZHRoIC8gMiAtIDUpICsgXCIsIFwiICsgbm9kZS53aWR0aCAvIDIgKyBcIilcIlxuICApO1xuICBjb25zdCBwYWRkaW5nID0gODtcbiAgY29uc3QgZGlmZiA9IG5vZGUuZGlmZiB8fCAwO1xuICBpZiAobm9kZS5jbHVzdGVyTm9kZSkge1xuICAgIGVsLmF0dHIoXG4gICAgICBcInRyYW5zZm9ybVwiLFxuICAgICAgXCJ0cmFuc2xhdGUoXCIgKyAobm9kZS54ICsgZGlmZiAtIG5vZGUud2lkdGggLyAyKSArIFwiLCBcIiArIChub2RlLnkgLSBub2RlLmhlaWdodCAvIDIgLSBwYWRkaW5nKSArIFwiKVwiXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBlbC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbm9kZS54ICsgXCIsIFwiICsgbm9kZS55ICsgXCIpXCIpO1xuICB9XG4gIHJldHVybiBkaWZmO1xufSwgXCJwb3NpdGlvbk5vZGVcIik7XG5cbmV4cG9ydCB7XG4gIGxhYmVsSGVscGVyLFxuICB1cGRhdGVOb2RlQm91bmRzLFxuICBjcmVhdGVMYWJlbF9kZWZhdWx0LFxuICBpc1ZhbGlkU2hhcGUsXG4gIGluc2VydENsdXN0ZXIsXG4gIGNsZWFyLFxuICBpbnNlcnROb2RlLFxuICBzZXROb2RlRWxlbSxcbiAgY2xlYXIyLFxuICBwb3NpdGlvbk5vZGVcbn07XG4iCiAgXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQ0EsSUFBSSw4QkFBOEIsT0FBTyxPQUFPLFFBQVEsTUFBTSxhQUFhO0FBQUEsRUFDekUsSUFBSTtBQUFBLEVBQ0osTUFBTSxnQkFBZ0IsS0FBSyxpQkFBaUIsU0FBUyxXQUFXLEdBQUcsVUFBVTtBQUFBLEVBQzdFLElBQUksQ0FBQyxVQUFVO0FBQUEsSUFDYixhQUFhO0FBQUEsRUFDZixFQUFPO0FBQUEsSUFDTCxhQUFhO0FBQUE7QUFBQSxFQUVmLE1BQU0sV0FBVyxPQUFPLE9BQU8sR0FBRyxFQUFFLEtBQUssU0FBUyxVQUFVLEVBQUUsS0FBSyxNQUFNLEtBQUssU0FBUyxLQUFLLEVBQUU7QUFBQSxFQUM5RixNQUFNLFVBQVUsU0FBUyxPQUFPLEdBQUcsRUFBRSxLQUFLLFNBQVMsT0FBTyxFQUFFLEtBQUssU0FBUyxvQkFBb0IsS0FBSyxVQUFVLENBQUM7QUFBQSxFQUM5RyxJQUFJO0FBQUEsRUFDSixJQUFJLEtBQUssVUFBZSxXQUFHO0FBQUEsSUFDekIsUUFBUTtBQUFBLEVBQ1YsRUFBTztBQUFBLElBQ0wsUUFBUSxPQUFPLEtBQUssVUFBVSxXQUFXLEtBQUssUUFBUSxLQUFLLE1BQU07QUFBQTtBQUFBLEVBRW5FLE1BQU0sZ0JBQWdCLENBQUMsQ0FBQyxLQUFLLFFB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QWM7QUFBQSxJQUM5QjtBQUFBLElBQ0EsUUFBUSxLQUFLLE9BQU8sT0FBTyxFQUFFLEtBQUssY0FBYyxLQUFLLElBQUksRUFBRSxLQUFLLFVBQVUsVUFBVSxJQUFJO0FBQUEsSUFDeEYsS0FBSyxNQUFNLGFBQWEsT0FBTyxNQUFNLGFBQWE7QUFBQSxFQUNwRCxFQUFPO0FBQUEsSUFDTCxLQUFLLE1BQU0sYUFBYSxNQUFNLE1BQU0sYUFBYTtBQUFBLElBQ2pELFFBQVE7QUFBQTtBQUFBLEVBRVYsTUFBTSxLQUFLLGFBQWEsb0JBQW9CLEtBQUssSUFBSSxDQUFDO0FBQUEsRUFDdEQsSUFBSSxLQUFLLFNBQVM7QUFBQSxJQUNoQixHQUFHLEtBQUssU0FBUyxLQUFLLE9BQU87QUFBQSxFQUMvQjtBQUFBLEVBQ0EsVUFBVSxJQUFJLEtBQUssSUFBSSxLQUFLO0FBQUEsRUFDNUIsSUFBSSxLQUFLLGNBQWM7QUFBQSxJQUNyQixNQUFNLEtBQUssU0FBUyxNQUFNLEtBQUssT0FBTyxJQUFJLFlBQVk7QUFBQSxFQUN4RDtBQUFBLEVBQ0EsT0FBTztBQUFBO0FBRVQsT0FBTyxZQUFZLFlBQVk7QUFDL0IsSUFBSSw4QkFBOEIsT0FBTyxDQUFDLE1BQU0sU0FBUztBQUFBLEVBQ3ZELFVBQVUsSUFBSSxLQUFLLElBQUksSUFBSTtBQUFBLEdBQzFCLGFBQWE7QUFDaEIsSUFBSSx5QkFBeUIsT0FBTyxNQUFNO0FBQUEsRUFDeEMsVUFBVSxNQUFNO0FBQUEsR0FDZixPQUFPO0FBQ1YsSUFBSSwrQkFBK0IsT0FBTyxDQUFDLFNBQVM7QUFBQSxFQUNsRCxNQUFNLEtBQUssVUFBVSxJQUFJLEtBQUssRUFBRTtBQUFBLEVBQ2hDLElBQUksTUFDRixxQkFDQSxLQUFLLE1BQ0wsTUFDQSxnQkFBZ0IsS0FBSyxJQUFJLEtBQUssUUFBUSxJQUFJLEtBQUssT0FBTyxLQUFLLFFBQVEsSUFBSSxHQUN6RTtBQUFBLEVBQ0EsTUFBTSxVQUFVO0FBQUEsRUFDaEIsTUFBTSxPQUFPLEtBQUssUUFBUTtBQUFBLEVBQzFCLElBQUksS0FBSyxhQUFhO0FBQUEsSUFDcEIsR0FBRyxLQUNELGFBQ0EsZ0JBQWdCLEtBQUssSUFBSSxPQUFPLEtBQUssUUFBUSxLQUFLLFFBQVEsS0FBSyxJQUFJLEtBQUssU0FBUyxJQUFJLFdBQVcsR0FDbEc7QUFBQSxFQUNGLEVBQU87QUFBQSxJQUNMLEdBQUcsS0FBSyxhQUFhLGVBQWUsS0FBSyxJQUFJLE9BQU8sS0FBSyxJQUFJLEdBQUc7QUFBQTtBQUFBLEVBRWxFLE9BQU87QUFBQSxHQUNOLGNBQWM7IiwKICAiZGVidWdJZCI6ICJDREYzN0Y2OTkyODBGODQyNjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
