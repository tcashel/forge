import {
  createLabel_default
} from "./chunk-main-xxv6x4s9.js";
import {
  at
} from "./chunk-main-2se6cwec.js";
import {
  isLabelStyle,
  styles2String
} from "./chunk-main-4ceh9h9g.js";
import {
  computeLabelTransform,
  getLineFunctionsWithOffset,
  markerOffsets,
  markerOffsets2
} from "./chunk-main-h1tqf3mz.js";
import {
  getSubGraphTitleMargins
} from "./chunk-main-s8463nwg.js";
import {
  createText
} from "./chunk-main-wsp4jakw.js";
import {
  handleUndefinedAttr,
  utils_default
} from "./chunk-main-vvfzntzy.js";
import {
  getConfig,
  getConfig2,
  getEffectiveHtmlLabels
} from "./chunk-main-aws590jt.js";
import {
  __name,
  basis_default,
  bumpX,
  bumpY,
  cardinal_default,
  catmullRom_default,
  line_default,
  linear_default,
  log,
  monotoneX,
  monotoneY,
  natural_default,
  select_default,
  stepAfter,
  stepBefore,
  step_default
} from "./chunk-main-vcnyggwp.js";

// node_modules/mermaid/dist/chunks/mermaid.core/chunk-KSCS5N6A.mjs
var addEdgeMarkers = /* @__PURE__ */ __name((svgPath, edge, url, id, diagramType, useMargin = false, strokeColor) => {
  if (edge.arrowTypeStart) {
    addEdgeMarker(svgPath, "start", edge.arrowTypeStart, url, id, diagramType, useMargin, strokeColor);
  }
  if (edge.arrowTypeEnd) {
    addEdgeMarker(svgPath, "end", edge.arrowTypeEnd, url, id, diagramType, useMargin, strokeColor);
  }
}, "addEdgeMarkers");
var arrowTypesMap = {
  arrow_cross: { type: "cross", fill: false },
  arrow_point: { type: "point", fill: true },
  arrow_barb: { type: "barb", fill: true },
  arrow_barb_neo: { type: "barb", fill: true },
  arrow_circle: { type: "circle", fill: false },
  aggregation: { type: "aggregation", fill: false },
  extension: { type: "extension", fill: false },
  composition: { type: "composition", fill: true },
  dependency: { type: "dependency", fill: true },
  lollipop: { type: "lollipop", fill: false },
  only_one: { type: "onlyOne", fill: false },
  zero_or_one: { type: "zeroOrOne", fill: false },
  one_or_more: { type: "oneOrMore", fill: false },
  zero_or_more: { type: "zeroOrMore", fill: false },
  requirement_arrow: { type: "requirement_arrow", fill: false },
  requirement_contains: { type: "requirement_contains", fill: false }
};
var arrowTypesWithMarginSupport = [
  "cross",
  "point",
  "circle",
  "lollipop",
  "aggregation",
  "extension",
  "composition",
  "dependency",
  "barb"
];
var addEdgeMarker = /* @__PURE__ */ __name((svgPath, position, arrowType, url, id, diagramType, useMargin = false, strokeColor) => {
  const arrowTypeInfo = arrowTypesMap[arrowType];
  const marginSupport = arrowTypeInfo && arrowTypesWithMarginSupport.includes(arrowTypeInfo.type);
  if (!arrowTypeInfo) {
    log.warn(`Unknown arrow type: ${arrowType}`);
    return;
  }
  const endMarkerType = arrowTypeInfo.type;
  const suffix = position === "start" ? "Start" : "End";
  const offset = useMargin && marginSupport ? "-margin" : "";
  const originalMarkerId = `${id}_${diagramType}-${endMarkerType}${suffix}${offset}`;
  if (strokeColor && strokeColor.trim() !== "") {
    const colorId = strokeColor.replace(/[^\dA-Za-z]/g, "_");
    const coloredMarkerId = `${originalMarkerId}_${colorId}`;
    if (!document.getElementById(coloredMarkerId)) {
      const originalMarker = document.getElementById(originalMarkerId);
      if (originalMarker) {
        const coloredMarker = originalMarker.cloneNode(true);
        coloredMarker.id = coloredMarkerId;
        const paths = coloredMarker.querySelectorAll("path, circle, line");
        paths.forEach((path) => {
          path.setAttribute("stroke", strokeColor);
          if (arrowTypeInfo.fill) {
            path.setAttribute("fill", strokeColor);
          }
        });
        originalMarker.parentNode?.appendChild(coloredMarker);
      }
    }
    svgPath.attr(`marker-${position}`, `url(${url}#${coloredMarkerId})`);
  } else {
    svgPath.attr(`marker-${position}`, `url(${url}#${originalMarkerId})`);
  }
}, "addEdgeMarker");
var resolveEdgeCurveType = /* @__PURE__ */ __name((edgeCurve) => {
  return typeof edgeCurve === "string" ? edgeCurve : getConfig2()?.flowchart?.curve;
}, "resolveEdgeCurveType");
var edgeLabels = /* @__PURE__ */ new Map;
var terminalLabels = /* @__PURE__ */ new Map;
var clear = /* @__PURE__ */ __name(() => {
  edgeLabels.clear();
  terminalLabels.clear();
}, "clear");
var getLabelStyles = /* @__PURE__ */ __name((styleArray) => {
  if (!styleArray) {
    return "";
  }
  if (typeof styleArray === "string") {
    return styleArray;
  }
  return styleArray.reduce((acc, style) => acc + ";" + style, "");
}, "getLabelStyles");
var insertEdgeLabel = /* @__PURE__ */ __name(async (elem, edge) => {
  const config = getConfig2();
  let useHtmlLabels = getEffectiveHtmlLabels(config);
  const { labelStyles } = styles2String(edge);
  edge.labelStyle = labelStyles;
  const edgeLabel = elem.insert("g").attr("class", "edgeLabel");
  const label = edgeLabel.insert("g").attr("class", "label").attr("data-id", edge.id);
  const isMarkdown = edge.labelType === "markdown";
  const markdownWidth = undefined;
  const labelElement = await createText(elem, edge.label, {
    style: getLabelStyles(edge.labelStyle),
    useHtmlLabels,
    addSvgBackground: true,
    isNode: false,
    markdown: isMarkdown,
    width: isMarkdown ? markdownWidth : undefined
  }, config);
  label.node().appendChild(labelElement);
  log.info("abc82", edge, edge.labelType);
  let bbox = labelElement.getBBox();
  let transformBbox = bbox;
  if (useHtmlLabels) {
    const div = labelElement.children[0];
    const dv = select_default(labelElement);
    bbox = div.getBoundingClientRect();
    transformBbox = bbox;
    dv.attr("width", bbox.width);
    dv.attr("height", bbox.height);
  } else {
    const textEl = select_default(labelElement).select("text").node();
    if (textEl && typeof textEl.getBBox === "function") {
      transformBbox = textEl.getBBox();
    }
  }
  label.attr("transform", computeLabelTransform(transformBbox, useHtmlLabels));
  edgeLabels.set(edge.id, edgeLabel);
  edge.width = bbox.width;
  edge.height = bbox.height;
  let fo;
  if (edge.startLabelLeft) {
    const startEdgeLabelLeft = elem.insert("g").attr("class", "edgeTerminals");
    const inner = startEdgeLabelLeft.insert("g").attr("class", "inner");
    const startLabelElement = await createLabel_default(inner, edge.startLabelLeft, getLabelStyles(edge.labelStyle) || "", false, false);
    fo = startLabelElement;
    let slBox = startLabelElement.getBBox();
    if (useHtmlLabels) {
      const div = startLabelElement.children[0];
      const dv = select_default(startLabelElement);
      slBox = div.getBoundingClientRect();
      dv.attr("width", slBox.width);
      dv.attr("height", slBox.height);
    }
    inner.attr("transform", computeLabelTransform(slBox, useHtmlLabels));
    if (!terminalLabels.get(edge.id)) {
      terminalLabels.set(edge.id, {});
    }
    terminalLabels.get(edge.id).startLeft = startEdgeLabelLeft;
    setTerminalWidth(fo, edge.startLabelLeft);
  }
  if (edge.startLabelRight) {
    const startEdgeLabelRight = elem.insert("g").attr("class", "edgeTerminals");
    const inner = startEdgeLabelRight.insert("g").attr("class", "inner");
    const startLabelElement = await createLabel_default(inner, edge.startLabelRight, getLabelStyles(edge.labelStyle) || "", false, false);
    fo = startLabelElement;
    let slBox = startLabelElement.getBBox();
    if (useHtmlLabels) {
      const div = startLabelElement.children[0];
      const dv = select_default(startLabelElement);
      slBox = div.getBoundingClientRect();
      dv.attr("width", slBox.width);
      dv.attr("height", slBox.height);
    }
    inner.attr("transform", computeLabelTransform(slBox, useHtmlLabels));
    if (!terminalLabels.get(edge.id)) {
      terminalLabels.set(edge.id, {});
    }
    terminalLabels.get(edge.id).startRight = startEdgeLabelRight;
    setTerminalWidth(fo, edge.startLabelRight);
  }
  if (edge.endLabelLeft) {
    const endEdgeLabelLeft = elem.insert("g").attr("class", "edgeTerminals");
    const inner = endEdgeLabelLeft.insert("g").attr("class", "inner");
    const endLabelElement = await createLabel_default(endEdgeLabelLeft, edge.endLabelLeft, getLabelStyles(edge.labelStyle) || "", false, false);
    fo = endLabelElement;
    let slBox = endLabelElement.getBBox();
    if (useHtmlLabels) {
      const div = endLabelElement.children[0];
      const dv = select_default(endLabelElement);
      slBox = div.getBoundingClientRect();
      dv.attr("width", slBox.width);
      dv.attr("height", slBox.height);
    }
    inner.attr("transform", computeLabelTransform(slBox, useHtmlLabels));
    if (!terminalLabels.get(edge.id)) {
      terminalLabels.set(edge.id, {});
    }
    terminalLabels.get(edge.id).endLeft = endEdgeLabelLeft;
    setTerminalWidth(fo, edge.endLabelLeft);
  }
  if (edge.endLabelRight) {
    const endEdgeLabelRight = elem.insert("g").attr("class", "edgeTerminals");
    const inner = endEdgeLabelRight.insert("g").attr("class", "inner");
    const endLabelElement = await createLabel_default(endEdgeLabelRight, edge.endLabelRight, getLabelStyles(edge.labelStyle) || "", false, false);
    fo = endLabelElement;
    let slBox = endLabelElement.getBBox();
    if (useHtmlLabels) {
      const div = endLabelElement.children[0];
      const dv = select_default(endLabelElement);
      slBox = div.getBoundingClientRect();
      dv.attr("width", slBox.width);
      dv.attr("height", slBox.height);
    }
    inner.attr("transform", computeLabelTransform(slBox, useHtmlLabels));
    if (!terminalLabels.get(edge.id)) {
      terminalLabels.set(edge.id, {});
    }
    terminalLabels.get(edge.id).endRight = endEdgeLabelRight;
    setTerminalWidth(fo, edge.endLabelRight);
  }
  return labelElement;
}, "insertEdgeLabel");
function setTerminalWidth(fo, value) {
  if (getEffectiveHtmlLabels(getConfig2()) && fo) {
    fo.style.width = value.length * 9 + "px";
    fo.style.height = "12px";
  }
}
__name(setTerminalWidth, "setTerminalWidth");
var positionEdgeLabel = /* @__PURE__ */ __name((edge, paths) => {
  log.debug("Moving label abc88 ", edge.id, edge.label, edgeLabels.get(edge.id), paths);
  let path = paths.updatedPath ? paths.updatedPath : paths.originalPath;
  const siteConfig = getConfig2();
  const { subGraphTitleTotalMargin } = getSubGraphTitleMargins(siteConfig);
  if (edge.label) {
    const el = edgeLabels.get(edge.id);
    let x = edge.x;
    let y = edge.y;
    if (path) {
      const pos = utils_default.calcLabelPosition(path);
      log.debug("Moving label " + edge.label + " from (", x, ",", y, ") to (", pos.x, ",", pos.y, ") abc88");
      if (paths.updatedPath) {
        x = pos.x;
        y = pos.y;
      }
    }
    el.attr("transform", `translate(${x}, ${y + subGraphTitleTotalMargin / 2})`);
  }
  if (edge.startLabelLeft) {
    const el = terminalLabels.get(edge.id).startLeft;
    let x = edge.x;
    let y = edge.y;
    if (path) {
      const pos = utils_default.calcTerminalLabelPosition(edge.arrowTypeStart ? 10 : 0, "start_left", path);
      x = pos.x;
      y = pos.y;
    }
    el.attr("transform", `translate(${x}, ${y})`);
  }
  if (edge.startLabelRight) {
    const el = terminalLabels.get(edge.id).startRight;
    let x = edge.x;
    let y = edge.y;
    if (path) {
      const pos = utils_default.calcTerminalLabelPosition(edge.arrowTypeStart ? 10 : 0, "start_right", path);
      x = pos.x;
      y = pos.y;
    }
    el.attr("transform", `translate(${x}, ${y})`);
  }
  if (edge.endLabelLeft) {
    const el = terminalLabels.get(edge.id).endLeft;
    let x = edge.x;
    let y = edge.y;
    if (path) {
      const pos = utils_default.calcTerminalLabelPosition(edge.arrowTypeEnd ? 10 : 0, "end_left", path);
      x = pos.x;
      y = pos.y;
    }
    el.attr("transform", `translate(${x}, ${y})`);
  }
  if (edge.endLabelRight) {
    const el = terminalLabels.get(edge.id).endRight;
    let x = edge.x;
    let y = edge.y;
    if (path) {
      const pos = utils_default.calcTerminalLabelPosition(edge.arrowTypeEnd ? 10 : 0, "end_right", path);
      x = pos.x;
      y = pos.y;
    }
    el.attr("transform", `translate(${x}, ${y})`);
  }
}, "positionEdgeLabel");
var outsideNode = /* @__PURE__ */ __name((node, point2) => {
  const x = node.x;
  const y = node.y;
  const dx = Math.abs(point2.x - x);
  const dy = Math.abs(point2.y - y);
  const w = node.width / 2;
  const h = node.height / 2;
  return dx >= w || dy >= h;
}, "outsideNode");
var intersection = /* @__PURE__ */ __name((node, outsidePoint, insidePoint) => {
  log.debug(`intersection calc abc89:
  outsidePoint: ${JSON.stringify(outsidePoint)}
  insidePoint : ${JSON.stringify(insidePoint)}
  node        : x:${node.x} y:${node.y} w:${node.width} h:${node.height}`);
  const x = node.x;
  const y = node.y;
  const dx = Math.abs(x - insidePoint.x);
  const w = node.width / 2;
  let r = insidePoint.x < outsidePoint.x ? w - dx : w + dx;
  const h = node.height / 2;
  const Q = Math.abs(outsidePoint.y - insidePoint.y);
  const R = Math.abs(outsidePoint.x - insidePoint.x);
  if (Math.abs(y - outsidePoint.y) * w > Math.abs(x - outsidePoint.x) * h) {
    let q = insidePoint.y < outsidePoint.y ? outsidePoint.y - h - y : y - h - outsidePoint.y;
    r = R * q / Q;
    const res = {
      x: insidePoint.x < outsidePoint.x ? insidePoint.x + r : insidePoint.x - R + r,
      y: insidePoint.y < outsidePoint.y ? insidePoint.y + Q - q : insidePoint.y - Q + q
    };
    if (r === 0) {
      res.x = outsidePoint.x;
      res.y = outsidePoint.y;
    }
    if (R === 0) {
      res.x = outsidePoint.x;
    }
    if (Q === 0) {
      res.y = outsidePoint.y;
    }
    log.debug(`abc89 top/bottom calc, Q ${Q}, q ${q}, R ${R}, r ${r}`, res);
    return res;
  } else {
    if (insidePoint.x < outsidePoint.x) {
      r = outsidePoint.x - w - x;
    } else {
      r = x - w - outsidePoint.x;
    }
    let q = Q * r / R;
    let _x = insidePoint.x < outsidePoint.x ? insidePoint.x + R - r : insidePoint.x - R + r;
    let _y = insidePoint.y < outsidePoint.y ? insidePoint.y + q : insidePoint.y - q;
    log.debug(`sides calc abc89, Q ${Q}, q ${q}, R ${R}, r ${r}`, { _x, _y });
    if (r === 0) {
      _x = outsidePoint.x;
      _y = outsidePoint.y;
    }
    if (R === 0) {
      _x = outsidePoint.x;
    }
    if (Q === 0) {
      _y = outsidePoint.y;
    }
    return { x: _x, y: _y };
  }
}, "intersection");
var cutPathAtIntersect = /* @__PURE__ */ __name((_points, boundaryNode) => {
  log.warn("abc88 cutPathAtIntersect", _points, boundaryNode);
  let points = [];
  let lastPointOutside = _points[0];
  let isInside = false;
  _points.forEach((point2) => {
    log.info("abc88 checking point", point2, boundaryNode);
    if (!outsideNode(boundaryNode, point2) && !isInside) {
      const inter = intersection(boundaryNode, lastPointOutside, point2);
      log.debug("abc88 inside", point2, lastPointOutside, inter);
      log.debug("abc88 intersection", inter, boundaryNode);
      let pointPresent = false;
      points.forEach((p) => {
        pointPresent = pointPresent || p.x === inter.x && p.y === inter.y;
      });
      if (!points.some((e) => e.x === inter.x && e.y === inter.y)) {
        points.push(inter);
      } else {
        log.warn("abc88 no intersect", inter, points);
      }
      isInside = true;
    } else {
      log.warn("abc88 outside", point2, lastPointOutside);
      lastPointOutside = point2;
      if (!isInside) {
        points.push(point2);
      }
    }
  });
  log.debug("returning points", points);
  return points;
}, "cutPathAtIntersect");
function extractCornerPoints(points) {
  const cornerPoints = [];
  const cornerPointPositions = [];
  for (let i = 1;i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    if (prev.x === curr.x && curr.y === next.y && Math.abs(curr.x - next.x) > 5 && Math.abs(curr.y - prev.y) > 5) {
      cornerPoints.push(curr);
      cornerPointPositions.push(i);
    } else if (prev.y === curr.y && curr.x === next.x && Math.abs(curr.x - prev.x) > 5 && Math.abs(curr.y - next.y) > 5) {
      cornerPoints.push(curr);
      cornerPointPositions.push(i);
    }
  }
  return { cornerPoints, cornerPointPositions };
}
__name(extractCornerPoints, "extractCornerPoints");
var findAdjacentPoint = /* @__PURE__ */ __name(function(pointA, pointB, distance) {
  const xDiff = pointB.x - pointA.x;
  const yDiff = pointB.y - pointA.y;
  const length = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  const ratio = distance / length;
  return { x: pointB.x - ratio * xDiff, y: pointB.y - ratio * yDiff };
}, "findAdjacentPoint");
var fixCorners = /* @__PURE__ */ __name(function(lineData) {
  const { cornerPointPositions } = extractCornerPoints(lineData);
  const newLineData = [];
  for (let i = 0;i < lineData.length; i++) {
    if (cornerPointPositions.includes(i)) {
      const prevPoint = lineData[i - 1];
      const nextPoint = lineData[i + 1];
      const cornerPoint = lineData[i];
      const newPrevPoint = findAdjacentPoint(prevPoint, cornerPoint, 5);
      const newNextPoint = findAdjacentPoint(nextPoint, cornerPoint, 5);
      const xDiff = newNextPoint.x - newPrevPoint.x;
      const yDiff = newNextPoint.y - newPrevPoint.y;
      newLineData.push(newPrevPoint);
      const a = Math.sqrt(2) * 2;
      let newCornerPoint = { x: cornerPoint.x, y: cornerPoint.y };
      if (Math.abs(nextPoint.x - prevPoint.x) > 10 && Math.abs(nextPoint.y - prevPoint.y) >= 10) {
        log.debug("Corner point fixing", Math.abs(nextPoint.x - prevPoint.x), Math.abs(nextPoint.y - prevPoint.y));
        const r = 5;
        if (cornerPoint.x === newPrevPoint.x) {
          newCornerPoint = {
            x: xDiff < 0 ? newPrevPoint.x - r + a : newPrevPoint.x + r - a,
            y: yDiff < 0 ? newPrevPoint.y - a : newPrevPoint.y + a
          };
        } else {
          newCornerPoint = {
            x: xDiff < 0 ? newPrevPoint.x - a : newPrevPoint.x + a,
            y: yDiff < 0 ? newPrevPoint.y - r + a : newPrevPoint.y + r - a
          };
        }
      } else {
        log.debug("Corner point skipping fixing", Math.abs(nextPoint.x - prevPoint.x), Math.abs(nextPoint.y - prevPoint.y));
      }
      newLineData.push(newCornerPoint, newNextPoint);
    } else {
      newLineData.push(lineData[i]);
    }
  }
  return newLineData;
}, "fixCorners");
var generateDashArray = /* @__PURE__ */ __name((len, oValueS, oValueE) => {
  const middleLength = len - oValueS - oValueE;
  const dashLength = 2;
  const gapLength = 2;
  const dashGapPairLength = dashLength + gapLength;
  const numberOfPairs = Math.floor(middleLength / dashGapPairLength);
  const middlePattern = Array(numberOfPairs).fill(`${dashLength} ${gapLength}`).join(" ");
  const dashArray = `0 ${oValueS} ${middlePattern} ${oValueE}`;
  return dashArray;
}, "generateDashArray");
var insertEdge = /* @__PURE__ */ __name(function(elem, edge, clusterDb, diagramType, startNode, endNode, diagramId, skipIntersect = false) {
  if (!diagramId) {
    throw new Error(`insertEdge: missing diagramId for edge "${edge.id}" — edge IDs require a diagram prefix for uniqueness`);
  }
  const { handDrawnSeed } = getConfig2();
  let points = edge.points;
  let pointsHasChanged = false;
  const tail = startNode;
  var head = endNode;
  const edgeClassStyles = [];
  for (const key in edge.cssCompiledStyles) {
    if (isLabelStyle(key)) {
      continue;
    }
    edgeClassStyles.push(edge.cssCompiledStyles[key]);
  }
  log.debug("UIO intersect check", edge.points, head.x, tail.x);
  if (head.intersect && tail.intersect && !skipIntersect) {
    points = points.slice(1, edge.points.length - 1);
    points.unshift(tail.intersect(points[0]));
    log.debug("Last point UIO", edge.start, "-->", edge.end, points[points.length - 1], head, head.intersect(points[points.length - 1]));
    points.push(head.intersect(points[points.length - 1]));
  }
  const pointsStr = btoa(JSON.stringify(points));
  if (edge.toCluster) {
    log.info("to cluster abc88", clusterDb.get(edge.toCluster));
    points = cutPathAtIntersect(edge.points, clusterDb.get(edge.toCluster).node);
    pointsHasChanged = true;
  }
  if (edge.fromCluster) {
    log.debug("from cluster abc88", clusterDb.get(edge.fromCluster), JSON.stringify(points, null, 2));
    points = cutPathAtIntersect(points.reverse(), clusterDb.get(edge.fromCluster).node).reverse();
    pointsHasChanged = true;
  }
  let lineData = points.filter((p) => !Number.isNaN(p.y));
  const edgeCurveType = resolveEdgeCurveType(edge.curve);
  if (edgeCurveType !== "rounded") {
    lineData = fixCorners(lineData);
  }
  let curve = linear_default;
  switch (edgeCurveType) {
    case "linear":
      curve = linear_default;
      break;
    case "basis":
      curve = basis_default;
      break;
    case "cardinal":
      curve = cardinal_default;
      break;
    case "bumpX":
      curve = bumpX;
      break;
    case "bumpY":
      curve = bumpY;
      break;
    case "catmullRom":
      curve = catmullRom_default;
      break;
    case "monotoneX":
      curve = monotoneX;
      break;
    case "monotoneY":
      curve = monotoneY;
      break;
    case "natural":
      curve = natural_default;
      break;
    case "step":
      curve = step_default;
      break;
    case "stepAfter":
      curve = stepAfter;
      break;
    case "stepBefore":
      curve = stepBefore;
      break;
    case "rounded":
      curve = linear_default;
      break;
    default:
      curve = basis_default;
  }
  const { x, y } = getLineFunctionsWithOffset(edge);
  const lineFunction = line_default().x(x).y(y).curve(curve);
  let strokeClasses;
  switch (edge.thickness) {
    case "normal":
      strokeClasses = "edge-thickness-normal";
      break;
    case "thick":
      strokeClasses = "edge-thickness-thick";
      break;
    case "invisible":
      strokeClasses = "edge-thickness-invisible";
      break;
    default:
      strokeClasses = "edge-thickness-normal";
  }
  switch (edge.pattern) {
    case "solid":
      strokeClasses += " edge-pattern-solid";
      break;
    case "dotted":
      strokeClasses += " edge-pattern-dotted";
      break;
    case "dashed":
      strokeClasses += " edge-pattern-dashed";
      break;
    default:
      strokeClasses += " edge-pattern-solid";
  }
  let svgPath;
  let linePath = edgeCurveType === "rounded" ? generateRoundedPath(applyMarkerOffsetsToPoints(lineData, edge), 5) : lineFunction(lineData);
  const edgeStyles = Array.isArray(edge.style) ? edge.style : [edge.style];
  let strokeColor = edgeStyles.find((style) => style?.startsWith("stroke:"));
  let animationClass = "";
  if (edge.animate) {
    animationClass = "edge-animation-fast";
  }
  if (edge.animation) {
    animationClass = "edge-animation-" + edge.animation;
  }
  let animatedEdge = false;
  if (edge.look === "handDrawn") {
    const rc = at.svg(elem);
    Object.assign([], lineData);
    const svgPathNode = rc.path(linePath, {
      roughness: 0.3,
      seed: handDrawnSeed
    });
    strokeClasses += " transition";
    svgPath = select_default(svgPathNode).select("path").attr("id", `${diagramId}-${edge.id}`).attr("class", " " + strokeClasses + (edge.classes ? " " + edge.classes : "") + (animationClass ? " " + animationClass : "")).attr("style", edgeStyles ? edgeStyles.reduce((acc, style) => acc + ";" + style, "") : "");
    let d = svgPath.attr("d");
    svgPath.attr("d", d);
    elem.node().appendChild(svgPath.node());
  } else {
    const stylesFromClasses = edgeClassStyles.join(";");
    const styles = edgeStyles ? edgeStyles.reduce((acc, style) => acc + style + ";", "") : "";
    const pathStyle = (stylesFromClasses ? stylesFromClasses + ";" + styles + ";" : styles) + ";" + (edgeStyles ? edgeStyles.reduce((acc, style) => acc + ";" + style, "") : "");
    svgPath = elem.append("path").attr("d", linePath).attr("id", `${diagramId}-${edge.id}`).attr("class", " " + strokeClasses + (edge.classes ? " " + edge.classes : "") + (animationClass ? " " + animationClass : "")).attr("style", pathStyle);
    strokeColor = pathStyle.match(/stroke:([^;]+)/)?.[1];
    animatedEdge = edge.animate === true || !!edge.animation || stylesFromClasses.includes("animation");
    const pathNode = svgPath.node();
    const len = typeof pathNode.getTotalLength === "function" ? pathNode.getTotalLength() : 0;
    const oValueS = markerOffsets2[edge.arrowTypeStart] || 0;
    const oValueE = markerOffsets2[edge.arrowTypeEnd] || 0;
    if (edge.look === "neo" && !animatedEdge) {
      const dashArray = edge.pattern === "dotted" || edge.pattern === "dashed" ? generateDashArray(len, oValueS, oValueE) : `0 ${oValueS} ${len - oValueS - oValueE} ${oValueE}`;
      const mOffset = `stroke-dasharray: ${dashArray}; stroke-dashoffset: 0;`;
      svgPath.attr("style", mOffset + svgPath.attr("style"));
    }
  }
  svgPath.attr("data-edge", true);
  svgPath.attr("data-et", "edge");
  svgPath.attr("data-id", edge.id);
  svgPath.attr("data-points", pointsStr);
  svgPath.attr("data-look", handleUndefinedAttr(edge.look));
  if (edge.showPoints) {
    lineData.forEach((point3) => {
      elem.append("circle").style("stroke", "red").style("fill", "red").attr("r", 1).attr("cx", point3.x).attr("cy", point3.y);
    });
  }
  let url = "";
  if (getConfig2().flowchart.arrowMarkerAbsolute || getConfig2().state.arrowMarkerAbsolute) {
    url = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search;
    url = url.replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  }
  log.info("arrowTypeStart", edge.arrowTypeStart);
  log.info("arrowTypeEnd", edge.arrowTypeEnd);
  const useMargin = !animatedEdge && edge?.look === "neo";
  addEdgeMarkers(svgPath, edge, url, diagramId, diagramType, useMargin, strokeColor);
  const midIndex = Math.floor(points.length / 2);
  const point2 = points[midIndex];
  if (!utils_default.isLabelCoordinateInPath(point2, svgPath.attr("d"))) {
    pointsHasChanged = true;
  }
  let paths = {};
  if (pointsHasChanged) {
    paths.updatedPath = points;
  }
  paths.originalPath = edge.points;
  return paths;
}, "insertEdge");
function generateRoundedPath(points, radius) {
  if (points.length < 2) {
    return "";
  }
  let path = "";
  const size = points.length;
  const epsilon = 0.00001;
  for (let i = 0;i < size; i++) {
    const currPoint = points[i];
    const prevPoint = points[i - 1];
    const nextPoint = points[i + 1];
    if (i === 0) {
      path += `M${currPoint.x},${currPoint.y}`;
    } else if (i === size - 1) {
      path += `L${currPoint.x},${currPoint.y}`;
    } else {
      const dx1 = currPoint.x - prevPoint.x;
      const dy1 = currPoint.y - prevPoint.y;
      const dx2 = nextPoint.x - currPoint.x;
      const dy2 = nextPoint.y - currPoint.y;
      const len1 = Math.hypot(dx1, dy1);
      const len2 = Math.hypot(dx2, dy2);
      if (len1 < epsilon || len2 < epsilon) {
        path += `L${currPoint.x},${currPoint.y}`;
        continue;
      }
      const nx1 = dx1 / len1;
      const ny1 = dy1 / len1;
      const nx2 = dx2 / len2;
      const ny2 = dy2 / len2;
      const dot = nx1 * nx2 + ny1 * ny2;
      const clampedDot = Math.max(-1, Math.min(1, dot));
      const angle = Math.acos(clampedDot);
      if (angle < epsilon || Math.abs(Math.PI - angle) < epsilon) {
        path += `L${currPoint.x},${currPoint.y}`;
        continue;
      }
      const cutLen = Math.min(radius / Math.sin(angle / 2), len1 / 2, len2 / 2);
      const startX = currPoint.x - nx1 * cutLen;
      const startY = currPoint.y - ny1 * cutLen;
      const endX = currPoint.x + nx2 * cutLen;
      const endY = currPoint.y + ny2 * cutLen;
      path += `L${startX},${startY}`;
      path += `Q${currPoint.x},${currPoint.y} ${endX},${endY}`;
    }
  }
  return path;
}
__name(generateRoundedPath, "generateRoundedPath");
function calculateDeltaAndAngle(point1, point2) {
  if (!point1 || !point2) {
    return { angle: 0, deltaX: 0, deltaY: 0 };
  }
  const deltaX = point2.x - point1.x;
  const deltaY = point2.y - point1.y;
  const angle = Math.atan2(deltaY, deltaX);
  return { angle, deltaX, deltaY };
}
__name(calculateDeltaAndAngle, "calculateDeltaAndAngle");
function applyMarkerOffsetsToPoints(points, edge) {
  const newPoints = points.map((point2) => ({ ...point2 }));
  if (points.length >= 2 && markerOffsets[edge.arrowTypeStart]) {
    const offsetValue = markerOffsets[edge.arrowTypeStart];
    const point1 = points[0];
    const point2 = points[1];
    const { angle } = calculateDeltaAndAngle(point1, point2);
    const offsetX = offsetValue * Math.cos(angle);
    const offsetY = offsetValue * Math.sin(angle);
    newPoints[0].x = point1.x + offsetX;
    newPoints[0].y = point1.y + offsetY;
  }
  const n = points.length;
  if (n >= 2 && markerOffsets[edge.arrowTypeEnd]) {
    const offsetValue = markerOffsets[edge.arrowTypeEnd];
    const point1 = points[n - 1];
    const point2 = points[n - 2];
    const { angle } = calculateDeltaAndAngle(point2, point1);
    const offsetX = offsetValue * Math.cos(angle);
    const offsetY = offsetValue * Math.sin(angle);
    newPoints[n - 1].x = point1.x - offsetX;
    newPoints[n - 1].y = point1.y - offsetY;
  }
  return newPoints;
}
__name(applyMarkerOffsetsToPoints, "applyMarkerOffsetsToPoints");
var insertMarkers = /* @__PURE__ */ __name((elem, markerArray, type, id) => {
  markerArray.forEach((markerName) => {
    markers[markerName](elem, type, id);
  });
}, "insertMarkers");
var extension = /* @__PURE__ */ __name((elem, type, id) => {
  log.trace("Making markers for ", id);
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-extensionStart").attr("class", "marker extension " + type).attr("refX", 18).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").attr("d", "M 1,7 L18,13 V 1 Z");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-extensionEnd").attr("class", "marker extension " + type).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 1,1 V 13 L18,7 Z");
  elem.append("marker").attr("id", id + "_" + type + "-extensionStart-margin").attr("class", "marker extension " + type).attr("refX", 18).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").attr("viewBox", "0 0 20 14").append("polygon").attr("points", "10,7 18,13 18,1").style("stroke-width", 2).style("stroke-dasharray", "0");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-extensionEnd-margin").attr("class", "marker extension " + type).attr("refX", 9).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").attr("viewBox", "0 0 20 14").append("polygon").attr("points", "10,1 10,13 18,7").style("stroke-width", 2).style("stroke-dasharray", "0");
}, "extension");
var composition = /* @__PURE__ */ __name((elem, type, id) => {
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-compositionStart").attr("class", "marker composition " + type).attr("refX", 18).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-compositionEnd").attr("class", "marker composition " + type).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-compositionStart-margin").attr("class", "marker composition " + type).attr("refX", 15).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").style("stroke-width", 0).attr("viewBox", "0 0 15 15").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-compositionEnd-margin").attr("class", "marker composition " + type).attr("refX", 3.5).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").style("stroke-width", 0).attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
}, "composition");
var aggregation = /* @__PURE__ */ __name((elem, type, id) => {
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-aggregationStart").attr("class", "marker aggregation " + type).attr("refX", 18).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-aggregationEnd").attr("class", "marker aggregation " + type).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-aggregationStart-margin").attr("class", "marker aggregation " + type).attr("refX", 15).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").style("stroke-width", 2).attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-aggregationEnd-margin").attr("class", "marker aggregation " + type).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").style("stroke-width", 2).attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
}, "aggregation");
var dependency = /* @__PURE__ */ __name((elem, type, id) => {
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-dependencyStart").attr("class", "marker dependency " + type).attr("refX", 6).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 5,7 L9,13 L1,7 L9,1 Z");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-dependencyEnd").attr("class", "marker dependency " + type).attr("refX", 13).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L14,7 L9,1 Z");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-dependencyStart-margin").attr("class", "marker dependency " + type).attr("refX", 4).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").style("stroke-width", 0).attr("d", "M 5,7 L9,13 L1,7 L9,1 Z");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-dependencyEnd-margin").attr("class", "marker dependency " + type).attr("refX", 16).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").style("stroke-width", 0).attr("d", "M 18,7 L9,13 L14,7 L9,1 Z");
}, "dependency");
var lollipop = /* @__PURE__ */ __name((elem, type, id) => {
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-lollipopStart").attr("class", "marker lollipop " + type).attr("refX", 13).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("circle").attr("fill", "transparent").attr("cx", 7).attr("cy", 7).attr("r", 6);
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-lollipopEnd").attr("class", "marker lollipop " + type).attr("refX", 1).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("circle").attr("fill", "transparent").attr("cx", 7).attr("cy", 7).attr("r", 6);
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-lollipopStart-margin").attr("class", "marker lollipop " + type).attr("refX", 13).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("circle").attr("fill", "transparent").attr("cx", 7).attr("cy", 7).attr("r", 6).attr("stroke-width", 2);
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-lollipopEnd-margin").attr("class", "marker lollipop " + type).attr("refX", 1).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("circle").attr("fill", "transparent").attr("cx", 7).attr("cy", 7).attr("r", 6).attr("stroke-width", 2);
}, "lollipop");
var point = /* @__PURE__ */ __name((elem, type, id) => {
  elem.append("marker").attr("id", id + "_" + type + "-pointEnd").attr("class", "marker " + type).attr("viewBox", "0 0 10 10").attr("refX", 5).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 8).attr("markerHeight", 8).attr("orient", "auto").append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
  elem.append("marker").attr("id", id + "_" + type + "-pointStart").attr("class", "marker " + type).attr("viewBox", "0 0 10 10").attr("refX", 4.5).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 8).attr("markerHeight", 8).attr("orient", "auto").append("path").attr("d", "M 0 5 L 10 10 L 10 0 z").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
  elem.append("marker").attr("id", id + "_" + type + "-pointEnd-margin").attr("class", "marker " + type).attr("viewBox", "0 0 11.5 14").attr("refX", 11.5).attr("refY", 7).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 10.5).attr("markerHeight", 14).attr("orient", "auto").append("path").attr("d", "M 0 0 L 11.5 7 L 0 14 z").attr("class", "arrowMarkerPath").style("stroke-width", 0).style("stroke-dasharray", "1,0");
  elem.append("marker").attr("id", id + "_" + type + "-pointStart-margin").attr("class", "marker " + type).attr("viewBox", "0 0 11.5 14").attr("refX", 1).attr("refY", 7).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11.5).attr("markerHeight", 14).attr("orient", "auto").append("polygon").attr("points", "0,7 11.5,14 11.5,0").attr("class", "arrowMarkerPath").style("stroke-width", 0).style("stroke-dasharray", "1,0");
}, "point");
var circle = /* @__PURE__ */ __name((elem, type, id) => {
  elem.append("marker").attr("id", id + "_" + type + "-circleEnd").attr("class", "marker " + type).attr("viewBox", "0 0 10 10").attr("refX", 11).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("circle").attr("cx", "5").attr("cy", "5").attr("r", "5").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
  elem.append("marker").attr("id", id + "_" + type + "-circleStart").attr("class", "marker " + type).attr("viewBox", "0 0 10 10").attr("refX", -1).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("circle").attr("cx", "5").attr("cy", "5").attr("r", "5").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
  elem.append("marker").attr("id", id + "_" + type + "-circleEnd-margin").attr("class", "marker " + type).attr("viewBox", "0 0 10 10").attr("refY", 5).attr("refX", 12.25).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 14).attr("markerHeight", 14).attr("orient", "auto").append("circle").attr("cx", "5").attr("cy", "5").attr("r", "5").attr("class", "arrowMarkerPath").style("stroke-width", 0).style("stroke-dasharray", "1,0");
  elem.append("marker").attr("id", id + "_" + type + "-circleStart-margin").attr("class", "marker " + type).attr("viewBox", "0 0 10 10").attr("refX", -2).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 14).attr("markerHeight", 14).attr("orient", "auto").append("circle").attr("cx", "5").attr("cy", "5").attr("r", "5").attr("class", "arrowMarkerPath").style("stroke-width", 0).style("stroke-dasharray", "1,0");
}, "circle");
var cross = /* @__PURE__ */ __name((elem, type, id) => {
  elem.append("marker").attr("id", id + "_" + type + "-crossEnd").attr("class", "marker cross " + type).attr("viewBox", "0 0 11 11").attr("refX", 12).attr("refY", 5.2).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("path").attr("d", "M 1,1 l 9,9 M 10,1 l -9,9").attr("class", "arrowMarkerPath").style("stroke-width", 2).style("stroke-dasharray", "1,0");
  elem.append("marker").attr("id", id + "_" + type + "-crossStart").attr("class", "marker cross " + type).attr("viewBox", "0 0 11 11").attr("refX", -1).attr("refY", 5.2).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("path").attr("d", "M 1,1 l 9,9 M 10,1 l -9,9").attr("class", "arrowMarkerPath").style("stroke-width", 2).style("stroke-dasharray", "1,0");
  elem.append("marker").attr("id", id + "_" + type + "-crossEnd-margin").attr("class", "marker cross " + type).attr("viewBox", "0 0 15 15").attr("refX", 17.7).attr("refY", 7.5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto").append("path").attr("d", "M 1,1 L 14,14 M 1,14 L 14,1").attr("class", "arrowMarkerPath").style("stroke-width", 2.5);
  elem.append("marker").attr("id", id + "_" + type + "-crossStart-margin").attr("class", "marker cross " + type).attr("viewBox", "0 0 15 15").attr("refX", -3.5).attr("refY", 7.5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto").append("path").attr("d", "M 1,1 L 14,14 M 1,14 L 14,1").attr("class", "arrowMarkerPath").style("stroke-width", 2.5).style("stroke-dasharray", "1,0");
}, "cross");
var barb = /* @__PURE__ */ __name((elem, type, id) => {
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-barbEnd").attr("refX", 19).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 14).attr("markerUnits", "userSpaceOnUse").attr("orient", "auto").append("path").attr("d", "M 19,7 L9,13 L14,7 L9,1 Z");
}, "barb");
var barbNeo = /* @__PURE__ */ __name((elem, type, id) => {
  const config = getConfig();
  const { themeVariables } = config;
  const { transitionColor } = themeVariables;
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-barbEnd").attr("refX", 19).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 14).attr("markerUnits", "strokeWidth").attr("orient", "auto").append("path").attr("d", "M 19,7 L11,14 L13,7 L11,0 Z");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-barbEnd-margin").attr("refX", 17).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 14).attr("markerUnits", "userSpaceOnUse").attr("orient", "auto").append("path").attr("d", "M 19,7 L11,14 L13,7 L11,0 Z").attr("fill", `${transitionColor}`);
}, "barbNeo");
var only_one = /* @__PURE__ */ __name((elem, type, id) => {
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-onlyOneStart").attr("class", "marker onlyOne " + type).attr("refX", 0).attr("refY", 9).attr("markerWidth", 18).attr("markerHeight", 18).attr("orient", "auto").append("path").attr("d", "M9,0 L9,18 M15,0 L15,18");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-onlyOneEnd").attr("class", "marker onlyOne " + type).attr("refX", 18).attr("refY", 9).attr("markerWidth", 18).attr("markerHeight", 18).attr("orient", "auto").append("path").attr("d", "M3,0 L3,18 M9,0 L9,18");
}, "only_one");
var zero_or_one = /* @__PURE__ */ __name((elem, type, id) => {
  const startMarker = elem.append("defs").append("marker").attr("id", id + "_" + type + "-zeroOrOneStart").attr("class", "marker zeroOrOne " + type).attr("refX", 0).attr("refY", 9).attr("markerWidth", 30).attr("markerHeight", 18).attr("orient", "auto");
  startMarker.append("circle").attr("fill", "white").attr("cx", 21).attr("cy", 9).attr("r", 6);
  startMarker.append("path").attr("d", "M9,0 L9,18");
  const endMarker = elem.append("defs").append("marker").attr("id", id + "_" + type + "-zeroOrOneEnd").attr("class", "marker zeroOrOne " + type).attr("refX", 30).attr("refY", 9).attr("markerWidth", 30).attr("markerHeight", 18).attr("orient", "auto");
  endMarker.append("circle").attr("fill", "white").attr("cx", 9).attr("cy", 9).attr("r", 6);
  endMarker.append("path").attr("d", "M21,0 L21,18");
}, "zero_or_one");
var one_or_more = /* @__PURE__ */ __name((elem, type, id) => {
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-oneOrMoreStart").attr("class", "marker oneOrMore " + type).attr("refX", 18).attr("refY", 18).attr("markerWidth", 45).attr("markerHeight", 36).attr("orient", "auto").append("path").attr("d", "M0,18 Q 18,0 36,18 Q 18,36 0,18 M42,9 L42,27");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-oneOrMoreEnd").attr("class", "marker oneOrMore " + type).attr("refX", 27).attr("refY", 18).attr("markerWidth", 45).attr("markerHeight", 36).attr("orient", "auto").append("path").attr("d", "M3,9 L3,27 M9,18 Q27,0 45,18 Q27,36 9,18");
}, "one_or_more");
var zero_or_more = /* @__PURE__ */ __name((elem, type, id) => {
  const startMarker = elem.append("defs").append("marker").attr("id", id + "_" + type + "-zeroOrMoreStart").attr("class", "marker zeroOrMore " + type).attr("refX", 18).attr("refY", 18).attr("markerWidth", 57).attr("markerHeight", 36).attr("orient", "auto");
  startMarker.append("circle").attr("fill", "white").attr("cx", 48).attr("cy", 18).attr("r", 6);
  startMarker.append("path").attr("d", "M0,18 Q18,0 36,18 Q18,36 0,18");
  const endMarker = elem.append("defs").append("marker").attr("id", id + "_" + type + "-zeroOrMoreEnd").attr("class", "marker zeroOrMore " + type).attr("refX", 39).attr("refY", 18).attr("markerWidth", 57).attr("markerHeight", 36).attr("orient", "auto");
  endMarker.append("circle").attr("fill", "white").attr("cx", 9).attr("cy", 18).attr("r", 6);
  endMarker.append("path").attr("d", "M21,18 Q39,0 57,18 Q39,36 21,18");
}, "zero_or_more");
var only_one_neo = /* @__PURE__ */ __name((elem, type, id) => {
  const config = getConfig();
  const { themeVariables } = config;
  const { strokeWidth } = themeVariables;
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-onlyOneStart").attr("class", "marker onlyOne " + type).attr("refX", 0).attr("refY", 9).attr("markerWidth", 18).attr("markerHeight", 18).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").attr("d", "M9,0 L9,18 M15,0 L15,18").attr("stroke-width", `${strokeWidth}`);
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-onlyOneEnd").attr("class", "marker onlyOne " + type).attr("refX", 18).attr("refY", 9).attr("markerWidth", 18).attr("markerHeight", 18).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").attr("d", "M3,0 L3,18 M9,0 L9,18").attr("stroke-width", `${strokeWidth}`);
}, "only_one_neo");
var zero_or_one_neo = /* @__PURE__ */ __name((elem, type, id) => {
  const config = getConfig();
  const { themeVariables } = config;
  const { strokeWidth, mainBkg } = themeVariables;
  const startMarker = elem.append("defs").append("marker").attr("id", id + "_" + type + "-zeroOrOneStart").attr("class", "marker zeroOrOne " + type).attr("refX", 0).attr("refY", 9).attr("markerWidth", 30).attr("markerHeight", 18).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse");
  startMarker.append("circle").attr("fill", mainBkg ?? "white").attr("cx", 21).attr("cy", 9).attr("stroke-width", `${strokeWidth}`).attr("r", 6);
  startMarker.append("path").attr("d", "M9,0 L9,18").attr("stroke-width", `${strokeWidth}`);
  const endMarker = elem.append("defs").append("marker").attr("id", id + "_" + type + "-zeroOrOneEnd").attr("class", "marker zeroOrOne " + type).attr("refX", 30).attr("refY", 9).attr("markerWidth", 30).attr("markerHeight", 18).attr("markerUnits", "userSpaceOnUse").attr("orient", "auto");
  endMarker.append("circle").attr("fill", mainBkg ?? "white").attr("cx", 9).attr("cy", 9).attr("stroke-width", `${strokeWidth}`).attr("r", 6);
  endMarker.append("path").attr("d", "M21,0 L21,18").attr("stroke-width", `${strokeWidth}`);
}, "zero_or_one_neo");
var one_or_more_neo = /* @__PURE__ */ __name((elem, type, id) => {
  const config = getConfig();
  const { themeVariables } = config;
  const { strokeWidth } = themeVariables;
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-oneOrMoreStart").attr("class", "marker oneOrMore " + type).attr("refX", 18).attr("refY", 18).attr("markerWidth", 45).attr("markerHeight", 36).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("path").attr("d", "M0,18 Q 18,0 36,18 Q 18,36 0,18 M42,9 L42,27").attr("stroke-width", `${strokeWidth}`);
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-oneOrMoreEnd").attr("class", "marker oneOrMore " + type).attr("refX", 27).attr("refY", 18).attr("markerWidth", 45).attr("markerHeight", 36).attr("markerUnits", "userSpaceOnUse").attr("orient", "auto").append("path").attr("d", "M3,9 L3,27 M9,18 Q27,0 45,18 Q27,36 9,18").attr("stroke-width", `${strokeWidth}`);
}, "one_or_more_neo");
var zero_or_more_neo = /* @__PURE__ */ __name((elem, type, id) => {
  const config = getConfig();
  const { themeVariables } = config;
  const { strokeWidth, mainBkg } = themeVariables;
  const startMarker = elem.append("defs").append("marker").attr("id", id + "_" + type + "-zeroOrMoreStart").attr("class", "marker zeroOrMore " + type).attr("refX", 18).attr("refY", 18).attr("markerWidth", 57).attr("markerHeight", 36).attr("markerUnits", "userSpaceOnUse").attr("orient", "auto");
  startMarker.append("circle").attr("fill", mainBkg ?? "white").attr("cx", 45.5).attr("cy", 18).attr("r", 6).attr("stroke-width", `${strokeWidth}`);
  startMarker.append("path").attr("d", "M0,18 Q18,0 36,18 Q18,36 0,18").attr("stroke-width", `${strokeWidth}`);
  const endMarker = elem.append("defs").append("marker").attr("id", id + "_" + type + "-zeroOrMoreEnd").attr("class", "marker zeroOrMore " + type).attr("refX", 39).attr("refY", 18).attr("markerWidth", 57).attr("markerHeight", 36).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse");
  endMarker.append("circle").attr("fill", mainBkg ?? "white").attr("cx", 11).attr("cy", 18).attr("r", 6).attr("stroke-width", `${strokeWidth}`);
  endMarker.append("path").attr("d", "M21,18 Q39,0 57,18 Q39,36 21,18").attr("stroke-width", `${strokeWidth}`);
}, "zero_or_more_neo");
var requirement_arrow = /* @__PURE__ */ __name((elem, type, id) => {
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-requirement_arrowEnd").attr("refX", 20).attr("refY", 10).attr("markerWidth", 20).attr("markerHeight", 20).attr("orient", "auto").append("path").attr("d", `M0,0
      L20,10
      M20,10
      L0,20`);
}, "requirement_arrow");
var requirement_arrow_neo = /* @__PURE__ */ __name((elem, type, id) => {
  const config = getConfig();
  const { themeVariables } = config;
  const { strokeWidth } = themeVariables;
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-requirement_arrowEnd").attr("refX", 20).attr("refY", 10).attr("markerWidth", 20).attr("markerHeight", 20).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").attr("stroke-width", `${strokeWidth}`).attr("viewBox", "0 0 25 20").append("path").attr("d", `M0,0
      L20,10
      M20,10
      L0,20`).attr("stroke-linejoin", "miter");
}, "requirement_arrow_neo");
var requirement_contains = /* @__PURE__ */ __name((elem, type, id) => {
  const containsNode = elem.append("defs").append("marker").attr("id", id + "_" + type + "-requirement_containsStart").attr("refX", 0).attr("refY", 10).attr("markerWidth", 20).attr("markerHeight", 20).attr("orient", "auto").append("g");
  containsNode.append("circle").attr("cx", 10).attr("cy", 10).attr("r", 9).attr("fill", "none");
  containsNode.append("line").attr("x1", 1).attr("x2", 19).attr("y1", 10).attr("y2", 10);
  containsNode.append("line").attr("y1", 1).attr("y2", 19).attr("x1", 10).attr("x2", 10);
}, "requirement_contains");
var requirement_contains_neo = /* @__PURE__ */ __name((elem, type, id) => {
  const config = getConfig();
  const { themeVariables } = config;
  const { strokeWidth } = themeVariables;
  const containsNode = elem.append("defs").append("marker").attr("id", id + "_" + type + "-requirement_containsStart").attr("refX", 0).attr("refY", 10).attr("markerWidth", 20).attr("markerHeight", 20).attr("orient", "auto").attr("markerUnits", "userSpaceOnUse").append("g");
  containsNode.append("circle").attr("cx", 10).attr("cy", 10).attr("r", 9).attr("fill", "none");
  containsNode.append("line").attr("x1", 1).attr("x2", 19).attr("y1", 10).attr("y2", 10);
  containsNode.append("line").attr("y1", 1).attr("y2", 19).attr("x1", 10).attr("x2", 10);
  containsNode.selectAll("*").attr("stroke-width", `${strokeWidth}`);
}, "requirement_contains_neo");
var markers = {
  extension,
  composition,
  aggregation,
  dependency,
  lollipop,
  point,
  circle,
  cross,
  barb,
  barbNeo,
  only_one,
  zero_or_one,
  one_or_more,
  zero_or_more,
  only_one_neo,
  zero_or_one_neo,
  one_or_more_neo,
  zero_or_more_neo,
  requirement_arrow,
  requirement_contains,
  requirement_arrow_neo,
  requirement_contains_neo
};
var markers_default = insertMarkers;

export { clear, insertEdgeLabel, positionEdgeLabel, insertEdge, markers_default };

//# debugId=0D76ED6D7BE8172B64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2NodW5rLUtTQ1M1TjZBLm1qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJpbXBvcnQge1xuICBjb21wdXRlTGFiZWxUcmFuc2Zvcm0sXG4gIGdldExpbmVGdW5jdGlvbnNXaXRoT2Zmc2V0LFxuICBtYXJrZXJPZmZzZXRzLFxuICBtYXJrZXJPZmZzZXRzMlxufSBmcm9tIFwiLi9jaHVuay1CU0pQN0NCUC5tanNcIjtcbmltcG9ydCB7XG4gIGNyZWF0ZUxhYmVsX2RlZmF1bHRcbn0gZnJvbSBcIi4vY2h1bmstM09QSUZHREUubWpzXCI7XG5pbXBvcnQge1xuICBnZXRTdWJHcmFwaFRpdGxlTWFyZ2luc1xufSBmcm9tIFwiLi9jaHVuay1MNVpUTERXVi5tanNcIjtcbmltcG9ydCB7XG4gIGlzTGFiZWxTdHlsZSxcbiAgc3R5bGVzMlN0cmluZ1xufSBmcm9tIFwiLi9jaHVuay1OWksyRDdHVS5tanNcIjtcbmltcG9ydCB7XG4gIGNyZWF0ZVRleHRcbn0gZnJvbSBcIi4vY2h1bmstTzVDQkVMNk8ubWpzXCI7XG5pbXBvcnQge1xuICBoYW5kbGVVbmRlZmluZWRBdHRyLFxuICB1dGlsc19kZWZhdWx0XG59IGZyb20gXCIuL2NodW5rLTVaUVlIWEtVLm1qc1wiO1xuaW1wb3J0IHtcbiAgZ2V0Q29uZmlnLFxuICBnZXRDb25maWcyLFxuICBnZXRFZmZlY3RpdmVIdG1sTGFiZWxzXG59IGZyb20gXCIuL2NodW5rLUNTQ0lISzdRLm1qc1wiO1xuaW1wb3J0IHtcbiAgX19uYW1lLFxuICBsb2dcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvZWRnZXMuanNcbmltcG9ydCB7XG4gIGN1cnZlQmFzaXMsXG4gIGN1cnZlTGluZWFyLFxuICBjdXJ2ZUNhcmRpbmFsLFxuICBjdXJ2ZUJ1bXBYLFxuICBjdXJ2ZUJ1bXBZLFxuICBjdXJ2ZUNhdG11bGxSb20sXG4gIGN1cnZlTW9ub3RvbmVYLFxuICBjdXJ2ZU1vbm90b25lWSxcbiAgY3VydmVOYXR1cmFsLFxuICBjdXJ2ZVN0ZXAsXG4gIGN1cnZlU3RlcEFmdGVyLFxuICBjdXJ2ZVN0ZXBCZWZvcmUsXG4gIGxpbmUsXG4gIHNlbGVjdFxufSBmcm9tIFwiZDNcIjtcbmltcG9ydCByb3VnaCBmcm9tIFwicm91Z2hqc1wiO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvcmVuZGVyaW5nLWVsZW1lbnRzL2VkZ2VNYXJrZXIudHNcbnZhciBhZGRFZGdlTWFya2VycyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHN2Z1BhdGgsIGVkZ2UsIHVybCwgaWQsIGRpYWdyYW1UeXBlLCB1c2VNYXJnaW4gPSBmYWxzZSwgc3Ryb2tlQ29sb3IpID0+IHtcbiAgaWYgKGVkZ2UuYXJyb3dUeXBlU3RhcnQpIHtcbiAgICBhZGRFZGdlTWFya2VyKFxuICAgICAgc3ZnUGF0aCxcbiAgICAgIFwic3RhcnRcIixcbiAgICAgIGVkZ2UuYXJyb3dUeXBlU3RhcnQsXG4gICAgICB1cmwsXG4gICAgICBpZCxcbiAgICAgIGRpYWdyYW1UeXBlLFxuICAgICAgdXNlTWFyZ2luLFxuICAgICAgc3Ryb2tlQ29sb3JcbiAgICApO1xuICB9XG4gIGlmIChlZGdlLmFycm93VHlwZUVuZCkge1xuICAgIGFkZEVkZ2VNYXJrZXIoc3ZnUGF0aCwgXCJlbmRcIiwgZWRnZS5hcnJvd1R5cGVFbmQsIHVybCwgaWQsIGRpYWdyYW1UeXBlLCB1c2VNYXJnaW4sIHN0cm9rZUNvbG9yKTtcbiAgfVxufSwgXCJhZGRFZGdlTWFya2Vyc1wiKTtcbnZhciBhcnJvd1R5cGVzTWFwID0ge1xuICBhcnJvd19jcm9zczogeyB0eXBlOiBcImNyb3NzXCIsIGZpbGw6IGZhbHNlIH0sXG4gIGFycm93X3BvaW50OiB7IHR5cGU6IFwicG9pbnRcIiwgZmlsbDogdHJ1ZSB9LFxuICBhcnJvd19iYXJiOiB7IHR5cGU6IFwiYmFyYlwiLCBmaWxsOiB0cnVlIH0sXG4gIGFycm93X2JhcmJfbmVvOiB7IHR5cGU6IFwiYmFyYlwiLCBmaWxsOiB0cnVlIH0sXG4gIGFycm93X2NpcmNsZTogeyB0eXBlOiBcImNpcmNsZVwiLCBmaWxsOiBmYWxzZSB9LFxuICBhZ2dyZWdhdGlvbjogeyB0eXBlOiBcImFnZ3JlZ2F0aW9uXCIsIGZpbGw6IGZhbHNlIH0sXG4gIGV4dGVuc2lvbjogeyB0eXBlOiBcImV4dGVuc2lvblwiLCBmaWxsOiBmYWxzZSB9LFxuICBjb21wb3NpdGlvbjogeyB0eXBlOiBcImNvbXBvc2l0aW9uXCIsIGZpbGw6IHRydWUgfSxcbiAgZGVwZW5kZW5jeTogeyB0eXBlOiBcImRlcGVuZGVuY3lcIiwgZmlsbDogdHJ1ZSB9LFxuICBsb2xsaXBvcDogeyB0eXBlOiBcImxvbGxpcG9wXCIsIGZpbGw6IGZhbHNlIH0sXG4gIG9ubHlfb25lOiB7IHR5cGU6IFwib25seU9uZVwiLCBmaWxsOiBmYWxzZSB9LFxuICB6ZXJvX29yX29uZTogeyB0eXBlOiBcInplcm9Pck9uZVwiLCBmaWxsOiBmYWxzZSB9LFxuICBvbmVfb3JfbW9yZTogeyB0eXBlOiBcIm9uZU9yTW9yZVwiLCBmaWxsOiBmYWxzZSB9LFxuICB6ZXJvX29yX21vcmU6IHsgdHlwZTogXCJ6ZXJvT3JNb3JlXCIsIGZpbGw6IGZhbHNlIH0sXG4gIHJlcXVpcmVtZW50X2Fycm93OiB7IHR5cGU6IFwicmVxdWlyZW1lbnRfYXJyb3dcIiwgZmlsbDogZmFsc2UgfSxcbiAgcmVxdWlyZW1lbnRfY29udGFpbnM6IHsgdHlwZTogXCJyZXF1aXJlbWVudF9jb250YWluc1wiLCBmaWxsOiBmYWxzZSB9XG59O1xudmFyIGFycm93VHlwZXNXaXRoTWFyZ2luU3VwcG9ydCA9IFtcbiAgXCJjcm9zc1wiLFxuICBcInBvaW50XCIsXG4gIFwiY2lyY2xlXCIsXG4gIFwibG9sbGlwb3BcIixcbiAgXCJhZ2dyZWdhdGlvblwiLFxuICBcImV4dGVuc2lvblwiLFxuICBcImNvbXBvc2l0aW9uXCIsXG4gIFwiZGVwZW5kZW5jeVwiLFxuICBcImJhcmJcIlxuXTtcbnZhciBhZGRFZGdlTWFya2VyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoc3ZnUGF0aCwgcG9zaXRpb24sIGFycm93VHlwZSwgdXJsLCBpZCwgZGlhZ3JhbVR5cGUsIHVzZU1hcmdpbiA9IGZhbHNlLCBzdHJva2VDb2xvcikgPT4ge1xuICBjb25zdCBhcnJvd1R5cGVJbmZvID0gYXJyb3dUeXBlc01hcFthcnJvd1R5cGVdO1xuICBjb25zdCBtYXJnaW5TdXBwb3J0ID0gYXJyb3dUeXBlSW5mbyAmJiBhcnJvd1R5cGVzV2l0aE1hcmdpblN1cHBvcnQuaW5jbHVkZXMoYXJyb3dUeXBlSW5mby50eXBlKTtcbiAgaWYgKCFhcnJvd1R5cGVJbmZvKSB7XG4gICAgbG9nLndhcm4oYFVua25vd24gYXJyb3cgdHlwZTogJHthcnJvd1R5cGV9YCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGVuZE1hcmtlclR5cGUgPSBhcnJvd1R5cGVJbmZvLnR5cGU7XG4gIGNvbnN0IHN1ZmZpeCA9IHBvc2l0aW9uID09PSBcInN0YXJ0XCIgPyBcIlN0YXJ0XCIgOiBcIkVuZFwiO1xuICBjb25zdCBvZmZzZXQgPSB1c2VNYXJnaW4gJiYgbWFyZ2luU3VwcG9ydCA/IFwiLW1hcmdpblwiIDogXCJcIjtcbiAgY29uc3Qgb3JpZ2luYWxNYXJrZXJJZCA9IGAke2lkfV8ke2RpYWdyYW1UeXBlfS0ke2VuZE1hcmtlclR5cGV9JHtzdWZmaXh9JHtvZmZzZXR9YDtcbiAgaWYgKHN0cm9rZUNvbG9yICYmIHN0cm9rZUNvbG9yLnRyaW0oKSAhPT0gXCJcIikge1xuICAgIGNvbnN0IGNvbG9ySWQgPSBzdHJva2VDb2xvci5yZXBsYWNlKC9bXlxcZEEtWmEtel0vZywgXCJfXCIpO1xuICAgIGNvbnN0IGNvbG9yZWRNYXJrZXJJZCA9IGAke29yaWdpbmFsTWFya2VySWR9XyR7Y29sb3JJZH1gO1xuICAgIGlmICghZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29sb3JlZE1hcmtlcklkKSkge1xuICAgICAgY29uc3Qgb3JpZ2luYWxNYXJrZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChvcmlnaW5hbE1hcmtlcklkKTtcbiAgICAgIGlmIChvcmlnaW5hbE1hcmtlcikge1xuICAgICAgICBjb25zdCBjb2xvcmVkTWFya2VyID0gb3JpZ2luYWxNYXJrZXIuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICBjb2xvcmVkTWFya2VyLmlkID0gY29sb3JlZE1hcmtlcklkO1xuICAgICAgICBjb25zdCBwYXRocyA9IGNvbG9yZWRNYXJrZXIucXVlcnlTZWxlY3RvckFsbChcInBhdGgsIGNpcmNsZSwgbGluZVwiKTtcbiAgICAgICAgcGF0aHMuZm9yRWFjaCgocGF0aCkgPT4ge1xuICAgICAgICAgIHBhdGguc2V0QXR0cmlidXRlKFwic3Ryb2tlXCIsIHN0cm9rZUNvbG9yKTtcbiAgICAgICAgICBpZiAoYXJyb3dUeXBlSW5mby5maWxsKSB7XG4gICAgICAgICAgICBwYXRoLnNldEF0dHJpYnV0ZShcImZpbGxcIiwgc3Ryb2tlQ29sb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG9yaWdpbmFsTWFya2VyLnBhcmVudE5vZGU/LmFwcGVuZENoaWxkKGNvbG9yZWRNYXJrZXIpO1xuICAgICAgfVxuICAgIH1cbiAgICBzdmdQYXRoLmF0dHIoYG1hcmtlci0ke3Bvc2l0aW9ufWAsIGB1cmwoJHt1cmx9IyR7Y29sb3JlZE1hcmtlcklkfSlgKTtcbiAgfSBlbHNlIHtcbiAgICBzdmdQYXRoLmF0dHIoYG1hcmtlci0ke3Bvc2l0aW9ufWAsIGB1cmwoJHt1cmx9IyR7b3JpZ2luYWxNYXJrZXJJZH0pYCk7XG4gIH1cbn0sIFwiYWRkRWRnZU1hcmtlclwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9lZGdlcy5qc1xudmFyIHJlc29sdmVFZGdlQ3VydmVUeXBlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZWRnZUN1cnZlKSA9PiB7XG4gIHJldHVybiB0eXBlb2YgZWRnZUN1cnZlID09PSBcInN0cmluZ1wiID8gZWRnZUN1cnZlIDogZ2V0Q29uZmlnMigpPy5mbG93Y2hhcnQ/LmN1cnZlO1xufSwgXCJyZXNvbHZlRWRnZUN1cnZlVHlwZVwiKTtcbnZhciBlZGdlTGFiZWxzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbnZhciB0ZXJtaW5hbExhYmVscyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG52YXIgY2xlYXIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCgpID0+IHtcbiAgZWRnZUxhYmVscy5jbGVhcigpO1xuICB0ZXJtaW5hbExhYmVscy5jbGVhcigpO1xufSwgXCJjbGVhclwiKTtcbnZhciBnZXRMYWJlbFN0eWxlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHN0eWxlQXJyYXkpID0+IHtcbiAgaWYgKCFzdHlsZUFycmF5KSB7XG4gICAgcmV0dXJuIFwiXCI7XG4gIH1cbiAgaWYgKHR5cGVvZiBzdHlsZUFycmF5ID09PSBcInN0cmluZ1wiKSB7XG4gICAgcmV0dXJuIHN0eWxlQXJyYXk7XG4gIH1cbiAgcmV0dXJuIHN0eWxlQXJyYXkucmVkdWNlKChhY2MsIHN0eWxlKSA9PiBhY2MgKyBcIjtcIiArIHN0eWxlLCBcIlwiKTtcbn0sIFwiZ2V0TGFiZWxTdHlsZXNcIik7XG52YXIgaW5zZXJ0RWRnZUxhYmVsID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAoZWxlbSwgZWRnZSkgPT4ge1xuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcyKCk7XG4gIGxldCB1c2VIdG1sTGFiZWxzID0gZ2V0RWZmZWN0aXZlSHRtbExhYmVscyhjb25maWcpO1xuICBjb25zdCB7IGxhYmVsU3R5bGVzIH0gPSBzdHlsZXMyU3RyaW5nKGVkZ2UpO1xuICBlZGdlLmxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlcztcbiAgY29uc3QgZWRnZUxhYmVsID0gZWxlbS5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImVkZ2VMYWJlbFwiKTtcbiAgY29uc3QgbGFiZWwgPSBlZGdlTGFiZWwuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJsYWJlbFwiKS5hdHRyKFwiZGF0YS1pZFwiLCBlZGdlLmlkKTtcbiAgY29uc3QgaXNNYXJrZG93biA9IGVkZ2UubGFiZWxUeXBlID09PSBcIm1hcmtkb3duXCI7XG4gIGNvbnN0IG1hcmtkb3duV2lkdGggPSB2b2lkIDA7XG4gIGNvbnN0IGxhYmVsRWxlbWVudCA9IGF3YWl0IGNyZWF0ZVRleHQoXG4gICAgZWxlbSxcbiAgICBlZGdlLmxhYmVsLFxuICAgIHtcbiAgICAgIHN0eWxlOiBnZXRMYWJlbFN0eWxlcyhlZGdlLmxhYmVsU3R5bGUpLFxuICAgICAgdXNlSHRtbExhYmVscyxcbiAgICAgIGFkZFN2Z0JhY2tncm91bmQ6IHRydWUsXG4gICAgICBpc05vZGU6IGZhbHNlLFxuICAgICAgbWFya2Rvd246IGlzTWFya2Rvd24sXG4gICAgICAvLyBQbGFpbiB0ZXh0IGVkZ2UgbGFiZWxzIHNob3VsZCBhdXRvLXdyYXAsIG1hcmtkb3duIGVkZ2UgbGFiZWxzIHJlc3BlY3QgbWFya2Rvd25BdXRvV3JhcCBjb25maWdcbiAgICAgIHdpZHRoOiBpc01hcmtkb3duID8gbWFya2Rvd25XaWR0aCA6IHZvaWQgMFxuICAgIH0sXG4gICAgY29uZmlnXG4gICk7XG4gIGxhYmVsLm5vZGUoKS5hcHBlbmRDaGlsZChsYWJlbEVsZW1lbnQpO1xuICBsb2cuaW5mbyhcImFiYzgyXCIsIGVkZ2UsIGVkZ2UubGFiZWxUeXBlKTtcbiAgbGV0IGJib3ggPSBsYWJlbEVsZW1lbnQuZ2V0QkJveCgpO1xuICBsZXQgdHJhbnNmb3JtQmJveCA9IGJib3g7XG4gIGlmICh1c2VIdG1sTGFiZWxzKSB7XG4gICAgY29uc3QgZGl2ID0gbGFiZWxFbGVtZW50LmNoaWxkcmVuWzBdO1xuICAgIGNvbnN0IGR2ID0gc2VsZWN0KGxhYmVsRWxlbWVudCk7XG4gICAgYmJveCA9IGRpdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB0cmFuc2Zvcm1CYm94ID0gYmJveDtcbiAgICBkdi5hdHRyKFwid2lkdGhcIiwgYmJveC53aWR0aCk7XG4gICAgZHYuYXR0cihcImhlaWdodFwiLCBiYm94LmhlaWdodCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgdGV4dEVsID0gc2VsZWN0KGxhYmVsRWxlbWVudCkuc2VsZWN0KFwidGV4dFwiKS5ub2RlKCk7XG4gICAgaWYgKHRleHRFbCAmJiB0eXBlb2YgdGV4dEVsLmdldEJCb3ggPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdHJhbnNmb3JtQmJveCA9IHRleHRFbC5nZXRCQm94KCk7XG4gICAgfVxuICB9XG4gIGxhYmVsLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgY29tcHV0ZUxhYmVsVHJhbnNmb3JtKHRyYW5zZm9ybUJib3gsIHVzZUh0bWxMYWJlbHMpKTtcbiAgZWRnZUxhYmVscy5zZXQoZWRnZS5pZCwgZWRnZUxhYmVsKTtcbiAgZWRnZS53aWR0aCA9IGJib3gud2lkdGg7XG4gIGVkZ2UuaGVpZ2h0ID0gYmJveC5oZWlnaHQ7XG4gIGxldCBmbztcbiAgaWYgKGVkZ2Uuc3RhcnRMYWJlbExlZnQpIHtcbiAgICBjb25zdCBzdGFydEVkZ2VMYWJlbExlZnQgPSBlbGVtLmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIFwiZWRnZVRlcm1pbmFsc1wiKTtcbiAgICBjb25zdCBpbm5lciA9IHN0YXJ0RWRnZUxhYmVsTGVmdC5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImlubmVyXCIpO1xuICAgIGNvbnN0IHN0YXJ0TGFiZWxFbGVtZW50ID0gYXdhaXQgY3JlYXRlTGFiZWxfZGVmYXVsdChcbiAgICAgIGlubmVyLFxuICAgICAgZWRnZS5zdGFydExhYmVsTGVmdCxcbiAgICAgIGdldExhYmVsU3R5bGVzKGVkZ2UubGFiZWxTdHlsZSkgfHwgXCJcIixcbiAgICAgIGZhbHNlLFxuICAgICAgZmFsc2VcbiAgICApO1xuICAgIGZvID0gc3RhcnRMYWJlbEVsZW1lbnQ7XG4gICAgbGV0IHNsQm94ID0gc3RhcnRMYWJlbEVsZW1lbnQuZ2V0QkJveCgpO1xuICAgIGlmICh1c2VIdG1sTGFiZWxzKSB7XG4gICAgICBjb25zdCBkaXYgPSBzdGFydExhYmVsRWxlbWVudC5jaGlsZHJlblswXTtcbiAgICAgIGNvbnN0IGR2ID0gc2VsZWN0KHN0YXJ0TGFiZWxFbGVtZW50KTtcbiAgICAgIHNsQm94ID0gZGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgZHYuYXR0cihcIndpZHRoXCIsIHNsQm94LndpZHRoKTtcbiAgICAgIGR2LmF0dHIoXCJoZWlnaHRcIiwgc2xCb3guaGVpZ2h0KTtcbiAgICB9XG4gICAgaW5uZXIuYXR0cihcInRyYW5zZm9ybVwiLCBjb21wdXRlTGFiZWxUcmFuc2Zvcm0oc2xCb3gsIHVzZUh0bWxMYWJlbHMpKTtcbiAgICBpZiAoIXRlcm1pbmFsTGFiZWxzLmdldChlZGdlLmlkKSkge1xuICAgICAgdGVybWluYWxMYWJlbHMuc2V0KGVkZ2UuaWQsIHt9KTtcbiAgICB9XG4gICAgdGVybWluYWxMYWJlbHMuZ2V0KGVkZ2UuaWQpLnN0YXJ0TGVmdCA9IHN0YXJ0RWRnZUxhYmVsTGVmdDtcbiAgICBzZXRUZXJtaW5hbFdpZHRoKGZvLCBlZGdlLnN0YXJ0TGFiZWxMZWZ0KTtcbiAgfVxuICBpZiAoZWRnZS5zdGFydExhYmVsUmlnaHQpIHtcbiAgICBjb25zdCBzdGFydEVkZ2VMYWJlbFJpZ2h0ID0gZWxlbS5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImVkZ2VUZXJtaW5hbHNcIik7XG4gICAgY29uc3QgaW5uZXIgPSBzdGFydEVkZ2VMYWJlbFJpZ2h0Lmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIFwiaW5uZXJcIik7XG4gICAgY29uc3Qgc3RhcnRMYWJlbEVsZW1lbnQgPSBhd2FpdCBjcmVhdGVMYWJlbF9kZWZhdWx0KFxuICAgICAgaW5uZXIsXG4gICAgICBlZGdlLnN0YXJ0TGFiZWxSaWdodCxcbiAgICAgIGdldExhYmVsU3R5bGVzKGVkZ2UubGFiZWxTdHlsZSkgfHwgXCJcIixcbiAgICAgIGZhbHNlLFxuICAgICAgZmFsc2VcbiAgICApO1xuICAgIGZvID0gc3RhcnRMYWJlbEVsZW1lbnQ7XG4gICAgbGV0IHNsQm94ID0gc3RhcnRMYWJlbEVsZW1lbnQuZ2V0QkJveCgpO1xuICAgIGlmICh1c2VIdG1sTGFiZWxzKSB7XG4gICAgICBjb25zdCBkaXYgPSBzdGFydExhYmVsRWxlbWVudC5jaGlsZHJlblswXTtcbiAgICAgIGNvbnN0IGR2ID0gc2VsZWN0KHN0YXJ0TGFiZWxFbGVtZW50KTtcbiAgICAgIHNsQm94ID0gZGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgZHYuYXR0cihcIndpZHRoXCIsIHNsQm94LndpZHRoKTtcbiAgICAgIGR2LmF0dHIoXCJoZWlnaHRcIiwgc2xCb3guaGVpZ2h0KTtcbiAgICB9XG4gICAgaW5uZXIuYXR0cihcInRyYW5zZm9ybVwiLCBjb21wdXRlTGFiZWxUcmFuc2Zvcm0oc2xCb3gsIHVzZUh0bWxMYWJlbHMpKTtcbiAgICBpZiAoIXRlcm1pbmFsTGFiZWxzLmdldChlZGdlLmlkKSkge1xuICAgICAgdGVybWluYWxMYWJlbHMuc2V0KGVkZ2UuaWQsIHt9KTtcbiAgICB9XG4gICAgdGVybWluYWxMYWJlbHMuZ2V0KGVkZ2UuaWQpLnN0YXJ0UmlnaHQgPSBzdGFydEVkZ2VMYWJlbFJpZ2h0O1xuICAgIHNldFRlcm1pbmFsV2lkdGgoZm8sIGVkZ2Uuc3RhcnRMYWJlbFJpZ2h0KTtcbiAgfVxuICBpZiAoZWRnZS5lbmRMYWJlbExlZnQpIHtcbiAgICBjb25zdCBlbmRFZGdlTGFiZWxMZWZ0ID0gZWxlbS5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImVkZ2VUZXJtaW5hbHNcIik7XG4gICAgY29uc3QgaW5uZXIgPSBlbmRFZGdlTGFiZWxMZWZ0Lmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIFwiaW5uZXJcIik7XG4gICAgY29uc3QgZW5kTGFiZWxFbGVtZW50ID0gYXdhaXQgY3JlYXRlTGFiZWxfZGVmYXVsdChcbiAgICAgIGVuZEVkZ2VMYWJlbExlZnQsXG4gICAgICBlZGdlLmVuZExhYmVsTGVmdCxcbiAgICAgIGdldExhYmVsU3R5bGVzKGVkZ2UubGFiZWxTdHlsZSkgfHwgXCJcIixcbiAgICAgIGZhbHNlLFxuICAgICAgZmFsc2VcbiAgICApO1xuICAgIGZvID0gZW5kTGFiZWxFbGVtZW50O1xuICAgIGxldCBzbEJveCA9IGVuZExhYmVsRWxlbWVudC5nZXRCQm94KCk7XG4gICAgaWYgKHVzZUh0bWxMYWJlbHMpIHtcbiAgICAgIGNvbnN0IGRpdiA9IGVuZExhYmVsRWxlbWVudC5jaGlsZHJlblswXTtcbiAgICAgIGNvbnN0IGR2ID0gc2VsZWN0KGVuZExhYmVsRWxlbWVudCk7XG4gICAgICBzbEJveCA9IGRpdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGR2LmF0dHIoXCJ3aWR0aFwiLCBzbEJveC53aWR0aCk7XG4gICAgICBkdi5hdHRyKFwiaGVpZ2h0XCIsIHNsQm94LmhlaWdodCk7XG4gICAgfVxuICAgIGlubmVyLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgY29tcHV0ZUxhYmVsVHJhbnNmb3JtKHNsQm94LCB1c2VIdG1sTGFiZWxzKSk7XG4gICAgaWYgKCF0ZXJtaW5hbExhYmVscy5nZXQoZWRnZS5pZCkpIHtcbiAgICAgIHRlcm1pbmFsTGFiZWxzLnNldChlZGdlLmlkLCB7fSk7XG4gICAgfVxuICAgIHRlcm1pbmFsTGFiZWxzLmdldChlZGdlLmlkKS5lbmRMZWZ0ID0gZW5kRWRnZUxhYmVsTGVmdDtcbiAgICBzZXRUZXJtaW5hbFdpZHRoKGZvLCBlZGdlLmVuZExhYmVsTGVmdCk7XG4gIH1cbiAgaWYgKGVkZ2UuZW5kTGFiZWxSaWdodCkge1xuICAgIGNvbnN0IGVuZEVkZ2VMYWJlbFJpZ2h0ID0gZWxlbS5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImVkZ2VUZXJtaW5hbHNcIik7XG4gICAgY29uc3QgaW5uZXIgPSBlbmRFZGdlTGFiZWxSaWdodC5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImlubmVyXCIpO1xuICAgIGNvbnN0IGVuZExhYmVsRWxlbWVudCA9IGF3YWl0IGNyZWF0ZUxhYmVsX2RlZmF1bHQoXG4gICAgICBlbmRFZGdlTGFiZWxSaWdodCxcbiAgICAgIGVkZ2UuZW5kTGFiZWxSaWdodCxcbiAgICAgIGdldExhYmVsU3R5bGVzKGVkZ2UubGFiZWxTdHlsZSkgfHwgXCJcIixcbiAgICAgIGZhbHNlLFxuICAgICAgZmFsc2VcbiAgICApO1xuICAgIGZvID0gZW5kTGFiZWxFbGVtZW50O1xuICAgIGxldCBzbEJveCA9IGVuZExhYmVsRWxlbWVudC5nZXRCQm94KCk7XG4gICAgaWYgKHVzZUh0bWxMYWJlbHMpIHtcbiAgICAgIGNvbnN0IGRpdiA9IGVuZExhYmVsRWxlbWVudC5jaGlsZHJlblswXTtcbiAgICAgIGNvbnN0IGR2ID0gc2VsZWN0KGVuZExhYmVsRWxlbWVudCk7XG4gICAgICBzbEJveCA9IGRpdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGR2LmF0dHIoXCJ3aWR0aFwiLCBzbEJveC53aWR0aCk7XG4gICAgICBkdi5hdHRyKFwiaGVpZ2h0XCIsIHNsQm94LmhlaWdodCk7XG4gICAgfVxuICAgIGlubmVyLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgY29tcHV0ZUxhYmVsVHJhbnNmb3JtKHNsQm94LCB1c2VIdG1sTGFiZWxzKSk7XG4gICAgaWYgKCF0ZXJtaW5hbExhYmVscy5nZXQoZWRnZS5pZCkpIHtcbiAgICAgIHRlcm1pbmFsTGFiZWxzLnNldChlZGdlLmlkLCB7fSk7XG4gICAgfVxuICAgIHRlcm1pbmFsTGFiZWxzLmdldChlZGdlLmlkKS5lbmRSaWdodCA9IGVuZEVkZ2VMYWJlbFJpZ2h0O1xuICAgIHNldFRlcm1pbmFsV2lkdGgoZm8sIGVkZ2UuZW5kTGFiZWxSaWdodCk7XG4gIH1cbiAgcmV0dXJuIGxhYmVsRWxlbWVudDtcbn0sIFwiaW5zZXJ0RWRnZUxhYmVsXCIpO1xuZnVuY3Rpb24gc2V0VGVybWluYWxXaWR0aChmbywgdmFsdWUpIHtcbiAgaWYgKGdldEVmZmVjdGl2ZUh0bWxMYWJlbHMoZ2V0Q29uZmlnMigpKSAmJiBmbykge1xuICAgIGZvLnN0eWxlLndpZHRoID0gdmFsdWUubGVuZ3RoICogOSArIFwicHhcIjtcbiAgICBmby5zdHlsZS5oZWlnaHQgPSBcIjEycHhcIjtcbiAgfVxufVxuX19uYW1lKHNldFRlcm1pbmFsV2lkdGgsIFwic2V0VGVybWluYWxXaWR0aFwiKTtcbnZhciBwb3NpdGlvbkVkZ2VMYWJlbCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGVkZ2UsIHBhdGhzKSA9PiB7XG4gIGxvZy5kZWJ1ZyhcIk1vdmluZyBsYWJlbCBhYmM4OCBcIiwgZWRnZS5pZCwgZWRnZS5sYWJlbCwgZWRnZUxhYmVscy5nZXQoZWRnZS5pZCksIHBhdGhzKTtcbiAgbGV0IHBhdGggPSBwYXRocy51cGRhdGVkUGF0aCA/IHBhdGhzLnVwZGF0ZWRQYXRoIDogcGF0aHMub3JpZ2luYWxQYXRoO1xuICBjb25zdCBzaXRlQ29uZmlnID0gZ2V0Q29uZmlnMigpO1xuICBjb25zdCB7IHN1YkdyYXBoVGl0bGVUb3RhbE1hcmdpbiB9ID0gZ2V0U3ViR3JhcGhUaXRsZU1hcmdpbnMoc2l0ZUNvbmZpZyk7XG4gIGlmIChlZGdlLmxhYmVsKSB7XG4gICAgY29uc3QgZWwgPSBlZGdlTGFiZWxzLmdldChlZGdlLmlkKTtcbiAgICBsZXQgeCA9IGVkZ2UueDtcbiAgICBsZXQgeSA9IGVkZ2UueTtcbiAgICBpZiAocGF0aCkge1xuICAgICAgY29uc3QgcG9zID0gdXRpbHNfZGVmYXVsdC5jYWxjTGFiZWxQb3NpdGlvbihwYXRoKTtcbiAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgXCJNb3ZpbmcgbGFiZWwgXCIgKyBlZGdlLmxhYmVsICsgXCIgZnJvbSAoXCIsXG4gICAgICAgIHgsXG4gICAgICAgIFwiLFwiLFxuICAgICAgICB5LFxuICAgICAgICBcIikgdG8gKFwiLFxuICAgICAgICBwb3MueCxcbiAgICAgICAgXCIsXCIsXG4gICAgICAgIHBvcy55LFxuICAgICAgICBcIikgYWJjODhcIlxuICAgICAgKTtcbiAgICAgIGlmIChwYXRocy51cGRhdGVkUGF0aCkge1xuICAgICAgICB4ID0gcG9zLng7XG4gICAgICAgIHkgPSBwb3MueTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWwuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7eH0sICR7eSArIHN1YkdyYXBoVGl0bGVUb3RhbE1hcmdpbiAvIDJ9KWApO1xuICB9XG4gIGlmIChlZGdlLnN0YXJ0TGFiZWxMZWZ0KSB7XG4gICAgY29uc3QgZWwgPSB0ZXJtaW5hbExhYmVscy5nZXQoZWRnZS5pZCkuc3RhcnRMZWZ0O1xuICAgIGxldCB4ID0gZWRnZS54O1xuICAgIGxldCB5ID0gZWRnZS55O1xuICAgIGlmIChwYXRoKSB7XG4gICAgICBjb25zdCBwb3MgPSB1dGlsc19kZWZhdWx0LmNhbGNUZXJtaW5hbExhYmVsUG9zaXRpb24oZWRnZS5hcnJvd1R5cGVTdGFydCA/IDEwIDogMCwgXCJzdGFydF9sZWZ0XCIsIHBhdGgpO1xuICAgICAgeCA9IHBvcy54O1xuICAgICAgeSA9IHBvcy55O1xuICAgIH1cbiAgICBlbC5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHt4fSwgJHt5fSlgKTtcbiAgfVxuICBpZiAoZWRnZS5zdGFydExhYmVsUmlnaHQpIHtcbiAgICBjb25zdCBlbCA9IHRlcm1pbmFsTGFiZWxzLmdldChlZGdlLmlkKS5zdGFydFJpZ2h0O1xuICAgIGxldCB4ID0gZWRnZS54O1xuICAgIGxldCB5ID0gZWRnZS55O1xuICAgIGlmIChwYXRoKSB7XG4gICAgICBjb25zdCBwb3MgPSB1dGlsc19kZWZhdWx0LmNhbGNUZXJtaW5hbExhYmVsUG9zaXRpb24oXG4gICAgICAgIGVkZ2UuYXJyb3dUeXBlU3RhcnQgPyAxMCA6IDAsXG4gICAgICAgIFwic3RhcnRfcmlnaHRcIixcbiAgICAgICAgcGF0aFxuICAgICAgKTtcbiAgICAgIHggPSBwb3MueDtcbiAgICAgIHkgPSBwb3MueTtcbiAgICB9XG4gICAgZWwuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7eH0sICR7eX0pYCk7XG4gIH1cbiAgaWYgKGVkZ2UuZW5kTGFiZWxMZWZ0KSB7XG4gICAgY29uc3QgZWwgPSB0ZXJtaW5hbExhYmVscy5nZXQoZWRnZS5pZCkuZW5kTGVmdDtcbiAgICBsZXQgeCA9IGVkZ2UueDtcbiAgICBsZXQgeSA9IGVkZ2UueTtcbiAgICBpZiAocGF0aCkge1xuICAgICAgY29uc3QgcG9zID0gdXRpbHNfZGVmYXVsdC5jYWxjVGVybWluYWxMYWJlbFBvc2l0aW9uKGVkZ2UuYXJyb3dUeXBlRW5kID8gMTAgOiAwLCBcImVuZF9sZWZ0XCIsIHBhdGgpO1xuICAgICAgeCA9IHBvcy54O1xuICAgICAgeSA9IHBvcy55O1xuICAgIH1cbiAgICBlbC5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHt4fSwgJHt5fSlgKTtcbiAgfVxuICBpZiAoZWRnZS5lbmRMYWJlbFJpZ2h0KSB7XG4gICAgY29uc3QgZWwgPSB0ZXJtaW5hbExhYmVscy5nZXQoZWRnZS5pZCkuZW5kUmlnaHQ7XG4gICAgbGV0IHggPSBlZGdlLng7XG4gICAgbGV0IHkgPSBlZGdlLnk7XG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIGNvbnN0IHBvcyA9IHV0aWxzX2RlZmF1bHQuY2FsY1Rlcm1pbmFsTGFiZWxQb3NpdGlvbihlZGdlLmFycm93VHlwZUVuZCA/IDEwIDogMCwgXCJlbmRfcmlnaHRcIiwgcGF0aCk7XG4gICAgICB4ID0gcG9zLng7XG4gICAgICB5ID0gcG9zLnk7XG4gICAgfVxuICAgIGVsLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgke3h9LCAke3l9KWApO1xuICB9XG59LCBcInBvc2l0aW9uRWRnZUxhYmVsXCIpO1xudmFyIG91dHNpZGVOb2RlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgobm9kZSwgcG9pbnQyKSA9PiB7XG4gIGNvbnN0IHggPSBub2RlLng7XG4gIGNvbnN0IHkgPSBub2RlLnk7XG4gIGNvbnN0IGR4ID0gTWF0aC5hYnMocG9pbnQyLnggLSB4KTtcbiAgY29uc3QgZHkgPSBNYXRoLmFicyhwb2ludDIueSAtIHkpO1xuICBjb25zdCB3ID0gbm9kZS53aWR0aCAvIDI7XG4gIGNvbnN0IGggPSBub2RlLmhlaWdodCAvIDI7XG4gIHJldHVybiBkeCA+PSB3IHx8IGR5ID49IGg7XG59LCBcIm91dHNpZGVOb2RlXCIpO1xudmFyIGludGVyc2VjdGlvbiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKG5vZGUsIG91dHNpZGVQb2ludCwgaW5zaWRlUG9pbnQpID0+IHtcbiAgbG9nLmRlYnVnKGBpbnRlcnNlY3Rpb24gY2FsYyBhYmM4OTpcbiAgb3V0c2lkZVBvaW50OiAke0pTT04uc3RyaW5naWZ5KG91dHNpZGVQb2ludCl9XG4gIGluc2lkZVBvaW50IDogJHtKU09OLnN0cmluZ2lmeShpbnNpZGVQb2ludCl9XG4gIG5vZGUgICAgICAgIDogeDoke25vZGUueH0geToke25vZGUueX0gdzoke25vZGUud2lkdGh9IGg6JHtub2RlLmhlaWdodH1gKTtcbiAgY29uc3QgeCA9IG5vZGUueDtcbiAgY29uc3QgeSA9IG5vZGUueTtcbiAgY29uc3QgZHggPSBNYXRoLmFicyh4IC0gaW5zaWRlUG9pbnQueCk7XG4gIGNvbnN0IHcgPSBub2RlLndpZHRoIC8gMjtcbiAgbGV0IHIgPSBpbnNpZGVQb2ludC54IDwgb3V0c2lkZVBvaW50LnggPyB3IC0gZHggOiB3ICsgZHg7XG4gIGNvbnN0IGggPSBub2RlLmhlaWdodCAvIDI7XG4gIGNvbnN0IFEgPSBNYXRoLmFicyhvdXRzaWRlUG9pbnQueSAtIGluc2lkZVBvaW50LnkpO1xuICBjb25zdCBSID0gTWF0aC5hYnMob3V0c2lkZVBvaW50LnggLSBpbnNpZGVQb2ludC54KTtcbiAgaWYgKE1hdGguYWJzKHkgLSBvdXRzaWRlUG9pbnQueSkgKiB3ID4gTWF0aC5hYnMoeCAtIG91dHNpZGVQb2ludC54KSAqIGgpIHtcbiAgICBsZXQgcSA9IGluc2lkZVBvaW50LnkgPCBvdXRzaWRlUG9pbnQueSA/IG91dHNpZGVQb2ludC55IC0gaCAtIHkgOiB5IC0gaCAtIG91dHNpZGVQb2ludC55O1xuICAgIHIgPSBSICogcSAvIFE7XG4gICAgY29uc3QgcmVzID0ge1xuICAgICAgeDogaW5zaWRlUG9pbnQueCA8IG91dHNpZGVQb2ludC54ID8gaW5zaWRlUG9pbnQueCArIHIgOiBpbnNpZGVQb2ludC54IC0gUiArIHIsXG4gICAgICB5OiBpbnNpZGVQb2ludC55IDwgb3V0c2lkZVBvaW50LnkgPyBpbnNpZGVQb2ludC55ICsgUSAtIHEgOiBpbnNpZGVQb2ludC55IC0gUSArIHFcbiAgICB9O1xuICAgIGlmIChyID09PSAwKSB7XG4gICAgICByZXMueCA9IG91dHNpZGVQb2ludC54O1xuICAgICAgcmVzLnkgPSBvdXRzaWRlUG9pbnQueTtcbiAgICB9XG4gICAgaWYgKFIgPT09IDApIHtcbiAgICAgIHJlcy54ID0gb3V0c2lkZVBvaW50Lng7XG4gICAgfVxuICAgIGlmIChRID09PSAwKSB7XG4gICAgICByZXMueSA9IG91dHNpZGVQb2ludC55O1xuICAgIH1cbiAgICBsb2cuZGVidWcoYGFiYzg5IHRvcC9ib3R0b20gY2FsYywgUSAke1F9LCBxICR7cX0sIFIgJHtSfSwgciAke3J9YCwgcmVzKTtcbiAgICByZXR1cm4gcmVzO1xuICB9IGVsc2Uge1xuICAgIGlmIChpbnNpZGVQb2ludC54IDwgb3V0c2lkZVBvaW50LngpIHtcbiAgICAgIHIgPSBvdXRzaWRlUG9pbnQueCAtIHcgLSB4O1xuICAgIH0gZWxzZSB7XG4gICAgICByID0geCAtIHcgLSBvdXRzaWRlUG9pbnQueDtcbiAgICB9XG4gICAgbGV0IHEgPSBRICogciAvIFI7XG4gICAgbGV0IF94ID0gaW5zaWRlUG9pbnQueCA8IG91dHNpZGVQb2ludC54ID8gaW5zaWRlUG9pbnQueCArIFIgLSByIDogaW5zaWRlUG9pbnQueCAtIFIgKyByO1xuICAgIGxldCBfeSA9IGluc2lkZVBvaW50LnkgPCBvdXRzaWRlUG9pbnQueSA/IGluc2lkZVBvaW50LnkgKyBxIDogaW5zaWRlUG9pbnQueSAtIHE7XG4gICAgbG9nLmRlYnVnKGBzaWRlcyBjYWxjIGFiYzg5LCBRICR7UX0sIHEgJHtxfSwgUiAke1J9LCByICR7cn1gLCB7IF94LCBfeSB9KTtcbiAgICBpZiAociA9PT0gMCkge1xuICAgICAgX3ggPSBvdXRzaWRlUG9pbnQueDtcbiAgICAgIF95ID0gb3V0c2lkZVBvaW50Lnk7XG4gICAgfVxuICAgIGlmIChSID09PSAwKSB7XG4gICAgICBfeCA9IG91dHNpZGVQb2ludC54O1xuICAgIH1cbiAgICBpZiAoUSA9PT0gMCkge1xuICAgICAgX3kgPSBvdXRzaWRlUG9pbnQueTtcbiAgICB9XG4gICAgcmV0dXJuIHsgeDogX3gsIHk6IF95IH07XG4gIH1cbn0sIFwiaW50ZXJzZWN0aW9uXCIpO1xudmFyIGN1dFBhdGhBdEludGVyc2VjdCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKF9wb2ludHMsIGJvdW5kYXJ5Tm9kZSkgPT4ge1xuICBsb2cud2FybihcImFiYzg4IGN1dFBhdGhBdEludGVyc2VjdFwiLCBfcG9pbnRzLCBib3VuZGFyeU5vZGUpO1xuICBsZXQgcG9pbnRzID0gW107XG4gIGxldCBsYXN0UG9pbnRPdXRzaWRlID0gX3BvaW50c1swXTtcbiAgbGV0IGlzSW5zaWRlID0gZmFsc2U7XG4gIF9wb2ludHMuZm9yRWFjaCgocG9pbnQyKSA9PiB7XG4gICAgbG9nLmluZm8oXCJhYmM4OCBjaGVja2luZyBwb2ludFwiLCBwb2ludDIsIGJvdW5kYXJ5Tm9kZSk7XG4gICAgaWYgKCFvdXRzaWRlTm9kZShib3VuZGFyeU5vZGUsIHBvaW50MikgJiYgIWlzSW5zaWRlKSB7XG4gICAgICBjb25zdCBpbnRlciA9IGludGVyc2VjdGlvbihib3VuZGFyeU5vZGUsIGxhc3RQb2ludE91dHNpZGUsIHBvaW50Mik7XG4gICAgICBsb2cuZGVidWcoXCJhYmM4OCBpbnNpZGVcIiwgcG9pbnQyLCBsYXN0UG9pbnRPdXRzaWRlLCBpbnRlcik7XG4gICAgICBsb2cuZGVidWcoXCJhYmM4OCBpbnRlcnNlY3Rpb25cIiwgaW50ZXIsIGJvdW5kYXJ5Tm9kZSk7XG4gICAgICBsZXQgcG9pbnRQcmVzZW50ID0gZmFsc2U7XG4gICAgICBwb2ludHMuZm9yRWFjaCgocCkgPT4ge1xuICAgICAgICBwb2ludFByZXNlbnQgPSBwb2ludFByZXNlbnQgfHwgcC54ID09PSBpbnRlci54ICYmIHAueSA9PT0gaW50ZXIueTtcbiAgICAgIH0pO1xuICAgICAgaWYgKCFwb2ludHMuc29tZSgoZSkgPT4gZS54ID09PSBpbnRlci54ICYmIGUueSA9PT0gaW50ZXIueSkpIHtcbiAgICAgICAgcG9pbnRzLnB1c2goaW50ZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9nLndhcm4oXCJhYmM4OCBubyBpbnRlcnNlY3RcIiwgaW50ZXIsIHBvaW50cyk7XG4gICAgICB9XG4gICAgICBpc0luc2lkZSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZy53YXJuKFwiYWJjODggb3V0c2lkZVwiLCBwb2ludDIsIGxhc3RQb2ludE91dHNpZGUpO1xuICAgICAgbGFzdFBvaW50T3V0c2lkZSA9IHBvaW50MjtcbiAgICAgIGlmICghaXNJbnNpZGUpIHtcbiAgICAgICAgcG9pbnRzLnB1c2gocG9pbnQyKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBsb2cuZGVidWcoXCJyZXR1cm5pbmcgcG9pbnRzXCIsIHBvaW50cyk7XG4gIHJldHVybiBwb2ludHM7XG59LCBcImN1dFBhdGhBdEludGVyc2VjdFwiKTtcbmZ1bmN0aW9uIGV4dHJhY3RDb3JuZXJQb2ludHMocG9pbnRzKSB7XG4gIGNvbnN0IGNvcm5lclBvaW50cyA9IFtdO1xuICBjb25zdCBjb3JuZXJQb2ludFBvc2l0aW9ucyA9IFtdO1xuICBmb3IgKGxldCBpID0gMTsgaSA8IHBvaW50cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICBjb25zdCBwcmV2ID0gcG9pbnRzW2kgLSAxXTtcbiAgICBjb25zdCBjdXJyID0gcG9pbnRzW2ldO1xuICAgIGNvbnN0IG5leHQgPSBwb2ludHNbaSArIDFdO1xuICAgIGlmIChwcmV2LnggPT09IGN1cnIueCAmJiBjdXJyLnkgPT09IG5leHQueSAmJiBNYXRoLmFicyhjdXJyLnggLSBuZXh0LngpID4gNSAmJiBNYXRoLmFicyhjdXJyLnkgLSBwcmV2LnkpID4gNSkge1xuICAgICAgY29ybmVyUG9pbnRzLnB1c2goY3Vycik7XG4gICAgICBjb3JuZXJQb2ludFBvc2l0aW9ucy5wdXNoKGkpO1xuICAgIH0gZWxzZSBpZiAocHJldi55ID09PSBjdXJyLnkgJiYgY3Vyci54ID09PSBuZXh0LnggJiYgTWF0aC5hYnMoY3Vyci54IC0gcHJldi54KSA+IDUgJiYgTWF0aC5hYnMoY3Vyci55IC0gbmV4dC55KSA+IDUpIHtcbiAgICAgIGNvcm5lclBvaW50cy5wdXNoKGN1cnIpO1xuICAgICAgY29ybmVyUG9pbnRQb3NpdGlvbnMucHVzaChpKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHsgY29ybmVyUG9pbnRzLCBjb3JuZXJQb2ludFBvc2l0aW9ucyB9O1xufVxuX19uYW1lKGV4dHJhY3RDb3JuZXJQb2ludHMsIFwiZXh0cmFjdENvcm5lclBvaW50c1wiKTtcbnZhciBmaW5kQWRqYWNlbnRQb2ludCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24ocG9pbnRBLCBwb2ludEIsIGRpc3RhbmNlKSB7XG4gIGNvbnN0IHhEaWZmID0gcG9pbnRCLnggLSBwb2ludEEueDtcbiAgY29uc3QgeURpZmYgPSBwb2ludEIueSAtIHBvaW50QS55O1xuICBjb25zdCBsZW5ndGggPSBNYXRoLnNxcnQoeERpZmYgKiB4RGlmZiArIHlEaWZmICogeURpZmYpO1xuICBjb25zdCByYXRpbyA9IGRpc3RhbmNlIC8gbGVuZ3RoO1xuICByZXR1cm4geyB4OiBwb2ludEIueCAtIHJhdGlvICogeERpZmYsIHk6IHBvaW50Qi55IC0gcmF0aW8gKiB5RGlmZiB9O1xufSwgXCJmaW5kQWRqYWNlbnRQb2ludFwiKTtcbnZhciBmaXhDb3JuZXJzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihsaW5lRGF0YSkge1xuICBjb25zdCB7IGNvcm5lclBvaW50UG9zaXRpb25zIH0gPSBleHRyYWN0Q29ybmVyUG9pbnRzKGxpbmVEYXRhKTtcbiAgY29uc3QgbmV3TGluZURhdGEgPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lRGF0YS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChjb3JuZXJQb2ludFBvc2l0aW9ucy5pbmNsdWRlcyhpKSkge1xuICAgICAgY29uc3QgcHJldlBvaW50ID0gbGluZURhdGFbaSAtIDFdO1xuICAgICAgY29uc3QgbmV4dFBvaW50ID0gbGluZURhdGFbaSArIDFdO1xuICAgICAgY29uc3QgY29ybmVyUG9pbnQgPSBsaW5lRGF0YVtpXTtcbiAgICAgIGNvbnN0IG5ld1ByZXZQb2ludCA9IGZpbmRBZGphY2VudFBvaW50KHByZXZQb2ludCwgY29ybmVyUG9pbnQsIDUpO1xuICAgICAgY29uc3QgbmV3TmV4dFBvaW50ID0gZmluZEFkamFjZW50UG9pbnQobmV4dFBvaW50LCBjb3JuZXJQb2ludCwgNSk7XG4gICAgICBjb25zdCB4RGlmZiA9IG5ld05leHRQb2ludC54IC0gbmV3UHJldlBvaW50Lng7XG4gICAgICBjb25zdCB5RGlmZiA9IG5ld05leHRQb2ludC55IC0gbmV3UHJldlBvaW50Lnk7XG4gICAgICBuZXdMaW5lRGF0YS5wdXNoKG5ld1ByZXZQb2ludCk7XG4gICAgICBjb25zdCBhID0gTWF0aC5zcXJ0KDIpICogMjtcbiAgICAgIGxldCBuZXdDb3JuZXJQb2ludCA9IHsgeDogY29ybmVyUG9pbnQueCwgeTogY29ybmVyUG9pbnQueSB9O1xuICAgICAgaWYgKE1hdGguYWJzKG5leHRQb2ludC54IC0gcHJldlBvaW50LngpID4gMTAgJiYgTWF0aC5hYnMobmV4dFBvaW50LnkgLSBwcmV2UG9pbnQueSkgPj0gMTApIHtcbiAgICAgICAgbG9nLmRlYnVnKFxuICAgICAgICAgIFwiQ29ybmVyIHBvaW50IGZpeGluZ1wiLFxuICAgICAgICAgIE1hdGguYWJzKG5leHRQb2ludC54IC0gcHJldlBvaW50LngpLFxuICAgICAgICAgIE1hdGguYWJzKG5leHRQb2ludC55IC0gcHJldlBvaW50LnkpXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHIgPSA1O1xuICAgICAgICBpZiAoY29ybmVyUG9pbnQueCA9PT0gbmV3UHJldlBvaW50LngpIHtcbiAgICAgICAgICBuZXdDb3JuZXJQb2ludCA9IHtcbiAgICAgICAgICAgIHg6IHhEaWZmIDwgMCA/IG5ld1ByZXZQb2ludC54IC0gciArIGEgOiBuZXdQcmV2UG9pbnQueCArIHIgLSBhLFxuICAgICAgICAgICAgeTogeURpZmYgPCAwID8gbmV3UHJldlBvaW50LnkgLSBhIDogbmV3UHJldlBvaW50LnkgKyBhXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXdDb3JuZXJQb2ludCA9IHtcbiAgICAgICAgICAgIHg6IHhEaWZmIDwgMCA/IG5ld1ByZXZQb2ludC54IC0gYSA6IG5ld1ByZXZQb2ludC54ICsgYSxcbiAgICAgICAgICAgIHk6IHlEaWZmIDwgMCA/IG5ld1ByZXZQb2ludC55IC0gciArIGEgOiBuZXdQcmV2UG9pbnQueSArIHIgLSBhXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9nLmRlYnVnKFxuICAgICAgICAgIFwiQ29ybmVyIHBvaW50IHNraXBwaW5nIGZpeGluZ1wiLFxuICAgICAgICAgIE1hdGguYWJzKG5leHRQb2ludC54IC0gcHJldlBvaW50LngpLFxuICAgICAgICAgIE1hdGguYWJzKG5leHRQb2ludC55IC0gcHJldlBvaW50LnkpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBuZXdMaW5lRGF0YS5wdXNoKG5ld0Nvcm5lclBvaW50LCBuZXdOZXh0UG9pbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXdMaW5lRGF0YS5wdXNoKGxpbmVEYXRhW2ldKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5ld0xpbmVEYXRhO1xufSwgXCJmaXhDb3JuZXJzXCIpO1xudmFyIGdlbmVyYXRlRGFzaEFycmF5ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgobGVuLCBvVmFsdWVTLCBvVmFsdWVFKSA9PiB7XG4gIGNvbnN0IG1pZGRsZUxlbmd0aCA9IGxlbiAtIG9WYWx1ZVMgLSBvVmFsdWVFO1xuICBjb25zdCBkYXNoTGVuZ3RoID0gMjtcbiAgY29uc3QgZ2FwTGVuZ3RoID0gMjtcbiAgY29uc3QgZGFzaEdhcFBhaXJMZW5ndGggPSBkYXNoTGVuZ3RoICsgZ2FwTGVuZ3RoO1xuICBjb25zdCBudW1iZXJPZlBhaXJzID0gTWF0aC5mbG9vcihtaWRkbGVMZW5ndGggLyBkYXNoR2FwUGFpckxlbmd0aCk7XG4gIGNvbnN0IG1pZGRsZVBhdHRlcm4gPSBBcnJheShudW1iZXJPZlBhaXJzKS5maWxsKGAke2Rhc2hMZW5ndGh9ICR7Z2FwTGVuZ3RofWApLmpvaW4oXCIgXCIpO1xuICBjb25zdCBkYXNoQXJyYXkgPSBgMCAke29WYWx1ZVN9ICR7bWlkZGxlUGF0dGVybn0gJHtvVmFsdWVFfWA7XG4gIHJldHVybiBkYXNoQXJyYXk7XG59LCBcImdlbmVyYXRlRGFzaEFycmF5XCIpO1xudmFyIGluc2VydEVkZ2UgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIGVkZ2UsIGNsdXN0ZXJEYiwgZGlhZ3JhbVR5cGUsIHN0YXJ0Tm9kZSwgZW5kTm9kZSwgZGlhZ3JhbUlkLCBza2lwSW50ZXJzZWN0ID0gZmFsc2UpIHtcbiAgaWYgKCFkaWFncmFtSWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgaW5zZXJ0RWRnZTogbWlzc2luZyBkaWFncmFtSWQgZm9yIGVkZ2UgXCIke2VkZ2UuaWR9XCIgXFx1MjAxNCBlZGdlIElEcyByZXF1aXJlIGEgZGlhZ3JhbSBwcmVmaXggZm9yIHVuaXF1ZW5lc3NgXG4gICAgKTtcbiAgfVxuICBjb25zdCB7IGhhbmREcmF3blNlZWQgfSA9IGdldENvbmZpZzIoKTtcbiAgbGV0IHBvaW50cyA9IGVkZ2UucG9pbnRzO1xuICBsZXQgcG9pbnRzSGFzQ2hhbmdlZCA9IGZhbHNlO1xuICBjb25zdCB0YWlsID0gc3RhcnROb2RlO1xuICB2YXIgaGVhZCA9IGVuZE5vZGU7XG4gIGNvbnN0IGVkZ2VDbGFzc1N0eWxlcyA9IFtdO1xuICBmb3IgKGNvbnN0IGtleSBpbiBlZGdlLmNzc0NvbXBpbGVkU3R5bGVzKSB7XG4gICAgaWYgKGlzTGFiZWxTdHlsZShrZXkpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgZWRnZUNsYXNzU3R5bGVzLnB1c2goZWRnZS5jc3NDb21waWxlZFN0eWxlc1trZXldKTtcbiAgfVxuICBsb2cuZGVidWcoXCJVSU8gaW50ZXJzZWN0IGNoZWNrXCIsIGVkZ2UucG9pbnRzLCBoZWFkLngsIHRhaWwueCk7XG4gIGlmIChoZWFkLmludGVyc2VjdCAmJiB0YWlsLmludGVyc2VjdCAmJiAhc2tpcEludGVyc2VjdCkge1xuICAgIHBvaW50cyA9IHBvaW50cy5zbGljZSgxLCBlZGdlLnBvaW50cy5sZW5ndGggLSAxKTtcbiAgICBwb2ludHMudW5zaGlmdCh0YWlsLmludGVyc2VjdChwb2ludHNbMF0pKTtcbiAgICBsb2cuZGVidWcoXG4gICAgICBcIkxhc3QgcG9pbnQgVUlPXCIsXG4gICAgICBlZGdlLnN0YXJ0LFxuICAgICAgXCItLT5cIixcbiAgICAgIGVkZ2UuZW5kLFxuICAgICAgcG9pbnRzW3BvaW50cy5sZW5ndGggLSAxXSxcbiAgICAgIGhlYWQsXG4gICAgICBoZWFkLmludGVyc2VjdChwb2ludHNbcG9pbnRzLmxlbmd0aCAtIDFdKVxuICAgICk7XG4gICAgcG9pbnRzLnB1c2goaGVhZC5pbnRlcnNlY3QocG9pbnRzW3BvaW50cy5sZW5ndGggLSAxXSkpO1xuICB9XG4gIGNvbnN0IHBvaW50c1N0ciA9IGJ0b2EoSlNPTi5zdHJpbmdpZnkocG9pbnRzKSk7XG4gIGlmIChlZGdlLnRvQ2x1c3Rlcikge1xuICAgIGxvZy5pbmZvKFwidG8gY2x1c3RlciBhYmM4OFwiLCBjbHVzdGVyRGIuZ2V0KGVkZ2UudG9DbHVzdGVyKSk7XG4gICAgcG9pbnRzID0gY3V0UGF0aEF0SW50ZXJzZWN0KGVkZ2UucG9pbnRzLCBjbHVzdGVyRGIuZ2V0KGVkZ2UudG9DbHVzdGVyKS5ub2RlKTtcbiAgICBwb2ludHNIYXNDaGFuZ2VkID0gdHJ1ZTtcbiAgfVxuICBpZiAoZWRnZS5mcm9tQ2x1c3Rlcikge1xuICAgIGxvZy5kZWJ1ZyhcbiAgICAgIFwiZnJvbSBjbHVzdGVyIGFiYzg4XCIsXG4gICAgICBjbHVzdGVyRGIuZ2V0KGVkZ2UuZnJvbUNsdXN0ZXIpLFxuICAgICAgSlNPTi5zdHJpbmdpZnkocG9pbnRzLCBudWxsLCAyKVxuICAgICk7XG4gICAgcG9pbnRzID0gY3V0UGF0aEF0SW50ZXJzZWN0KHBvaW50cy5yZXZlcnNlKCksIGNsdXN0ZXJEYi5nZXQoZWRnZS5mcm9tQ2x1c3Rlcikubm9kZSkucmV2ZXJzZSgpO1xuICAgIHBvaW50c0hhc0NoYW5nZWQgPSB0cnVlO1xuICB9XG4gIGxldCBsaW5lRGF0YSA9IHBvaW50cy5maWx0ZXIoKHApID0+ICFOdW1iZXIuaXNOYU4ocC55KSk7XG4gIGNvbnN0IGVkZ2VDdXJ2ZVR5cGUgPSByZXNvbHZlRWRnZUN1cnZlVHlwZShlZGdlLmN1cnZlKTtcbiAgaWYgKGVkZ2VDdXJ2ZVR5cGUgIT09IFwicm91bmRlZFwiKSB7XG4gICAgbGluZURhdGEgPSBmaXhDb3JuZXJzKGxpbmVEYXRhKTtcbiAgfVxuICBsZXQgY3VydmUgPSBjdXJ2ZUxpbmVhcjtcbiAgc3dpdGNoIChlZGdlQ3VydmVUeXBlKSB7XG4gICAgY2FzZSBcImxpbmVhclwiOlxuICAgICAgY3VydmUgPSBjdXJ2ZUxpbmVhcjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJiYXNpc1wiOlxuICAgICAgY3VydmUgPSBjdXJ2ZUJhc2lzO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImNhcmRpbmFsXCI6XG4gICAgICBjdXJ2ZSA9IGN1cnZlQ2FyZGluYWw7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiYnVtcFhcIjpcbiAgICAgIGN1cnZlID0gY3VydmVCdW1wWDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJidW1wWVwiOlxuICAgICAgY3VydmUgPSBjdXJ2ZUJ1bXBZO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImNhdG11bGxSb21cIjpcbiAgICAgIGN1cnZlID0gY3VydmVDYXRtdWxsUm9tO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIm1vbm90b25lWFwiOlxuICAgICAgY3VydmUgPSBjdXJ2ZU1vbm90b25lWDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJtb25vdG9uZVlcIjpcbiAgICAgIGN1cnZlID0gY3VydmVNb25vdG9uZVk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwibmF0dXJhbFwiOlxuICAgICAgY3VydmUgPSBjdXJ2ZU5hdHVyYWw7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwic3RlcFwiOlxuICAgICAgY3VydmUgPSBjdXJ2ZVN0ZXA7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwic3RlcEFmdGVyXCI6XG4gICAgICBjdXJ2ZSA9IGN1cnZlU3RlcEFmdGVyO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcInN0ZXBCZWZvcmVcIjpcbiAgICAgIGN1cnZlID0gY3VydmVTdGVwQmVmb3JlO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcInJvdW5kZWRcIjpcbiAgICAgIGN1cnZlID0gY3VydmVMaW5lYXI7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgY3VydmUgPSBjdXJ2ZUJhc2lzO1xuICB9XG4gIGNvbnN0IHsgeCwgeSB9ID0gZ2V0TGluZUZ1bmN0aW9uc1dpdGhPZmZzZXQoZWRnZSk7XG4gIGNvbnN0IGxpbmVGdW5jdGlvbiA9IGxpbmUoKS54KHgpLnkoeSkuY3VydmUoY3VydmUpO1xuICBsZXQgc3Ryb2tlQ2xhc3NlcztcbiAgc3dpdGNoIChlZGdlLnRoaWNrbmVzcykge1xuICAgIGNhc2UgXCJub3JtYWxcIjpcbiAgICAgIHN0cm9rZUNsYXNzZXMgPSBcImVkZ2UtdGhpY2tuZXNzLW5vcm1hbFwiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcInRoaWNrXCI6XG4gICAgICBzdHJva2VDbGFzc2VzID0gXCJlZGdlLXRoaWNrbmVzcy10aGlja1wiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImludmlzaWJsZVwiOlxuICAgICAgc3Ryb2tlQ2xhc3NlcyA9IFwiZWRnZS10aGlja25lc3MtaW52aXNpYmxlXCI7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgc3Ryb2tlQ2xhc3NlcyA9IFwiZWRnZS10aGlja25lc3Mtbm9ybWFsXCI7XG4gIH1cbiAgc3dpdGNoIChlZGdlLnBhdHRlcm4pIHtcbiAgICBjYXNlIFwic29saWRcIjpcbiAgICAgIHN0cm9rZUNsYXNzZXMgKz0gXCIgZWRnZS1wYXR0ZXJuLXNvbGlkXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiZG90dGVkXCI6XG4gICAgICBzdHJva2VDbGFzc2VzICs9IFwiIGVkZ2UtcGF0dGVybi1kb3R0ZWRcIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJkYXNoZWRcIjpcbiAgICAgIHN0cm9rZUNsYXNzZXMgKz0gXCIgZWRnZS1wYXR0ZXJuLWRhc2hlZFwiO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHN0cm9rZUNsYXNzZXMgKz0gXCIgZWRnZS1wYXR0ZXJuLXNvbGlkXCI7XG4gIH1cbiAgbGV0IHN2Z1BhdGg7XG4gIGxldCBsaW5lUGF0aCA9IGVkZ2VDdXJ2ZVR5cGUgPT09IFwicm91bmRlZFwiID8gZ2VuZXJhdGVSb3VuZGVkUGF0aChhcHBseU1hcmtlck9mZnNldHNUb1BvaW50cyhsaW5lRGF0YSwgZWRnZSksIDUpIDogbGluZUZ1bmN0aW9uKGxpbmVEYXRhKTtcbiAgY29uc3QgZWRnZVN0eWxlcyA9IEFycmF5LmlzQXJyYXkoZWRnZS5zdHlsZSkgPyBlZGdlLnN0eWxlIDogW2VkZ2Uuc3R5bGVdO1xuICBsZXQgc3Ryb2tlQ29sb3IgPSBlZGdlU3R5bGVzLmZpbmQoKHN0eWxlKSA9PiBzdHlsZT8uc3RhcnRzV2l0aChcInN0cm9rZTpcIikpO1xuICBsZXQgYW5pbWF0aW9uQ2xhc3MgPSBcIlwiO1xuICBpZiAoZWRnZS5hbmltYXRlKSB7XG4gICAgYW5pbWF0aW9uQ2xhc3MgPSBcImVkZ2UtYW5pbWF0aW9uLWZhc3RcIjtcbiAgfVxuICBpZiAoZWRnZS5hbmltYXRpb24pIHtcbiAgICBhbmltYXRpb25DbGFzcyA9IFwiZWRnZS1hbmltYXRpb24tXCIgKyBlZGdlLmFuaW1hdGlvbjtcbiAgfVxuICBsZXQgYW5pbWF0ZWRFZGdlID0gZmFsc2U7XG4gIGlmIChlZGdlLmxvb2sgPT09IFwiaGFuZERyYXduXCIpIHtcbiAgICBjb25zdCByYyA9IHJvdWdoLnN2ZyhlbGVtKTtcbiAgICBPYmplY3QuYXNzaWduKFtdLCBsaW5lRGF0YSk7XG4gICAgY29uc3Qgc3ZnUGF0aE5vZGUgPSByYy5wYXRoKGxpbmVQYXRoLCB7XG4gICAgICByb3VnaG5lc3M6IDAuMyxcbiAgICAgIHNlZWQ6IGhhbmREcmF3blNlZWRcbiAgICB9KTtcbiAgICBzdHJva2VDbGFzc2VzICs9IFwiIHRyYW5zaXRpb25cIjtcbiAgICBzdmdQYXRoID0gc2VsZWN0KHN2Z1BhdGhOb2RlKS5zZWxlY3QoXCJwYXRoXCIpLmF0dHIoXCJpZFwiLCBgJHtkaWFncmFtSWR9LSR7ZWRnZS5pZH1gKS5hdHRyKFxuICAgICAgXCJjbGFzc1wiLFxuICAgICAgXCIgXCIgKyBzdHJva2VDbGFzc2VzICsgKGVkZ2UuY2xhc3NlcyA/IFwiIFwiICsgZWRnZS5jbGFzc2VzIDogXCJcIikgKyAoYW5pbWF0aW9uQ2xhc3MgPyBcIiBcIiArIGFuaW1hdGlvbkNsYXNzIDogXCJcIilcbiAgICApLmF0dHIoXCJzdHlsZVwiLCBlZGdlU3R5bGVzID8gZWRnZVN0eWxlcy5yZWR1Y2UoKGFjYywgc3R5bGUpID0+IGFjYyArIFwiO1wiICsgc3R5bGUsIFwiXCIpIDogXCJcIik7XG4gICAgbGV0IGQgPSBzdmdQYXRoLmF0dHIoXCJkXCIpO1xuICAgIHN2Z1BhdGguYXR0cihcImRcIiwgZCk7XG4gICAgZWxlbS5ub2RlKCkuYXBwZW5kQ2hpbGQoc3ZnUGF0aC5ub2RlKCkpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IHN0eWxlc0Zyb21DbGFzc2VzID0gZWRnZUNsYXNzU3R5bGVzLmpvaW4oXCI7XCIpO1xuICAgIGNvbnN0IHN0eWxlcyA9IGVkZ2VTdHlsZXMgPyBlZGdlU3R5bGVzLnJlZHVjZSgoYWNjLCBzdHlsZSkgPT4gYWNjICsgc3R5bGUgKyBcIjtcIiwgXCJcIikgOiBcIlwiO1xuICAgIGNvbnN0IHBhdGhTdHlsZSA9IChzdHlsZXNGcm9tQ2xhc3NlcyA/IHN0eWxlc0Zyb21DbGFzc2VzICsgXCI7XCIgKyBzdHlsZXMgKyBcIjtcIiA6IHN0eWxlcykgKyBcIjtcIiArIChlZGdlU3R5bGVzID8gZWRnZVN0eWxlcy5yZWR1Y2UoKGFjYywgc3R5bGUpID0+IGFjYyArIFwiO1wiICsgc3R5bGUsIFwiXCIpIDogXCJcIik7XG4gICAgc3ZnUGF0aCA9IGVsZW0uYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBsaW5lUGF0aCkuYXR0cihcImlkXCIsIGAke2RpYWdyYW1JZH0tJHtlZGdlLmlkfWApLmF0dHIoXG4gICAgICBcImNsYXNzXCIsXG4gICAgICBcIiBcIiArIHN0cm9rZUNsYXNzZXMgKyAoZWRnZS5jbGFzc2VzID8gXCIgXCIgKyBlZGdlLmNsYXNzZXMgOiBcIlwiKSArIChhbmltYXRpb25DbGFzcyA/IFwiIFwiICsgYW5pbWF0aW9uQ2xhc3MgOiBcIlwiKVxuICAgICkuYXR0cihcInN0eWxlXCIsIHBhdGhTdHlsZSk7XG4gICAgc3Ryb2tlQ29sb3IgPSBwYXRoU3R5bGUubWF0Y2goL3N0cm9rZTooW147XSspLyk/LlsxXTtcbiAgICBhbmltYXRlZEVkZ2UgPSBlZGdlLmFuaW1hdGUgPT09IHRydWUgfHwgISFlZGdlLmFuaW1hdGlvbiB8fCBzdHlsZXNGcm9tQ2xhc3Nlcy5pbmNsdWRlcyhcImFuaW1hdGlvblwiKTtcbiAgICBjb25zdCBwYXRoTm9kZSA9IHN2Z1BhdGgubm9kZSgpO1xuICAgIGNvbnN0IGxlbiA9IHR5cGVvZiBwYXRoTm9kZS5nZXRUb3RhbExlbmd0aCA9PT0gXCJmdW5jdGlvblwiID8gcGF0aE5vZGUuZ2V0VG90YWxMZW5ndGgoKSA6IDA7XG4gICAgY29uc3Qgb1ZhbHVlUyA9IG1hcmtlck9mZnNldHMyW2VkZ2UuYXJyb3dUeXBlU3RhcnRdIHx8IDA7XG4gICAgY29uc3Qgb1ZhbHVlRSA9IG1hcmtlck9mZnNldHMyW2VkZ2UuYXJyb3dUeXBlRW5kXSB8fCAwO1xuICAgIGlmIChlZGdlLmxvb2sgPT09IFwibmVvXCIgJiYgIWFuaW1hdGVkRWRnZSkge1xuICAgICAgY29uc3QgZGFzaEFycmF5ID0gZWRnZS5wYXR0ZXJuID09PSBcImRvdHRlZFwiIHx8IGVkZ2UucGF0dGVybiA9PT0gXCJkYXNoZWRcIiA/IGdlbmVyYXRlRGFzaEFycmF5KGxlbiwgb1ZhbHVlUywgb1ZhbHVlRSkgOiBgMCAke29WYWx1ZVN9ICR7bGVuIC0gb1ZhbHVlUyAtIG9WYWx1ZUV9ICR7b1ZhbHVlRX1gO1xuICAgICAgY29uc3QgbU9mZnNldCA9IGBzdHJva2UtZGFzaGFycmF5OiAke2Rhc2hBcnJheX07IHN0cm9rZS1kYXNob2Zmc2V0OiAwO2A7XG4gICAgICBzdmdQYXRoLmF0dHIoXCJzdHlsZVwiLCBtT2Zmc2V0ICsgc3ZnUGF0aC5hdHRyKFwic3R5bGVcIikpO1xuICAgIH1cbiAgfVxuICBzdmdQYXRoLmF0dHIoXCJkYXRhLWVkZ2VcIiwgdHJ1ZSk7XG4gIHN2Z1BhdGguYXR0cihcImRhdGEtZXRcIiwgXCJlZGdlXCIpO1xuICBzdmdQYXRoLmF0dHIoXCJkYXRhLWlkXCIsIGVkZ2UuaWQpO1xuICBzdmdQYXRoLmF0dHIoXCJkYXRhLXBvaW50c1wiLCBwb2ludHNTdHIpO1xuICBzdmdQYXRoLmF0dHIoXCJkYXRhLWxvb2tcIiwgaGFuZGxlVW5kZWZpbmVkQXR0cihlZGdlLmxvb2spKTtcbiAgaWYgKGVkZ2Uuc2hvd1BvaW50cykge1xuICAgIGxpbmVEYXRhLmZvckVhY2goKHBvaW50MykgPT4ge1xuICAgICAgZWxlbS5hcHBlbmQoXCJjaXJjbGVcIikuc3R5bGUoXCJzdHJva2VcIiwgXCJyZWRcIikuc3R5bGUoXCJmaWxsXCIsIFwicmVkXCIpLmF0dHIoXCJyXCIsIDEpLmF0dHIoXCJjeFwiLCBwb2ludDMueCkuYXR0cihcImN5XCIsIHBvaW50My55KTtcbiAgICB9KTtcbiAgfVxuICBsZXQgdXJsID0gXCJcIjtcbiAgaWYgKGdldENvbmZpZzIoKS5mbG93Y2hhcnQuYXJyb3dNYXJrZXJBYnNvbHV0ZSB8fCBnZXRDb25maWcyKCkuc3RhdGUuYXJyb3dNYXJrZXJBYnNvbHV0ZSkge1xuICAgIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgd2luZG93LmxvY2F0aW9uLnNlYXJjaDtcbiAgICB1cmwgPSB1cmwucmVwbGFjZSgvXFwoL2csIFwiXFxcXChcIikucmVwbGFjZSgvXFwpL2csIFwiXFxcXClcIik7XG4gIH1cbiAgbG9nLmluZm8oXCJhcnJvd1R5cGVTdGFydFwiLCBlZGdlLmFycm93VHlwZVN0YXJ0KTtcbiAgbG9nLmluZm8oXCJhcnJvd1R5cGVFbmRcIiwgZWRnZS5hcnJvd1R5cGVFbmQpO1xuICBjb25zdCB1c2VNYXJnaW4gPSAhYW5pbWF0ZWRFZGdlICYmIGVkZ2U/Lmxvb2sgPT09IFwibmVvXCI7XG4gIGFkZEVkZ2VNYXJrZXJzKHN2Z1BhdGgsIGVkZ2UsIHVybCwgZGlhZ3JhbUlkLCBkaWFncmFtVHlwZSwgdXNlTWFyZ2luLCBzdHJva2VDb2xvcik7XG4gIGNvbnN0IG1pZEluZGV4ID0gTWF0aC5mbG9vcihwb2ludHMubGVuZ3RoIC8gMik7XG4gIGNvbnN0IHBvaW50MiA9IHBvaW50c1ttaWRJbmRleF07XG4gIGlmICghdXRpbHNfZGVmYXVsdC5pc0xhYmVsQ29vcmRpbmF0ZUluUGF0aChwb2ludDIsIHN2Z1BhdGguYXR0cihcImRcIikpKSB7XG4gICAgcG9pbnRzSGFzQ2hhbmdlZCA9IHRydWU7XG4gIH1cbiAgbGV0IHBhdGhzID0ge307XG4gIGlmIChwb2ludHNIYXNDaGFuZ2VkKSB7XG4gICAgcGF0aHMudXBkYXRlZFBhdGggPSBwb2ludHM7XG4gIH1cbiAgcGF0aHMub3JpZ2luYWxQYXRoID0gZWRnZS5wb2ludHM7XG4gIHJldHVybiBwYXRocztcbn0sIFwiaW5zZXJ0RWRnZVwiKTtcbmZ1bmN0aW9uIGdlbmVyYXRlUm91bmRlZFBhdGgocG9pbnRzLCByYWRpdXMpIHtcbiAgaWYgKHBvaW50cy5sZW5ndGggPCAyKSB7XG4gICAgcmV0dXJuIFwiXCI7XG4gIH1cbiAgbGV0IHBhdGggPSBcIlwiO1xuICBjb25zdCBzaXplID0gcG9pbnRzLmxlbmd0aDtcbiAgY29uc3QgZXBzaWxvbiA9IDFlLTU7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgY29uc3QgY3VyclBvaW50ID0gcG9pbnRzW2ldO1xuICAgIGNvbnN0IHByZXZQb2ludCA9IHBvaW50c1tpIC0gMV07XG4gICAgY29uc3QgbmV4dFBvaW50ID0gcG9pbnRzW2kgKyAxXTtcbiAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgcGF0aCArPSBgTSR7Y3VyclBvaW50Lnh9LCR7Y3VyclBvaW50Lnl9YDtcbiAgICB9IGVsc2UgaWYgKGkgPT09IHNpemUgLSAxKSB7XG4gICAgICBwYXRoICs9IGBMJHtjdXJyUG9pbnQueH0sJHtjdXJyUG9pbnQueX1gO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBkeDEgPSBjdXJyUG9pbnQueCAtIHByZXZQb2ludC54O1xuICAgICAgY29uc3QgZHkxID0gY3VyclBvaW50LnkgLSBwcmV2UG9pbnQueTtcbiAgICAgIGNvbnN0IGR4MiA9IG5leHRQb2ludC54IC0gY3VyclBvaW50Lng7XG4gICAgICBjb25zdCBkeTIgPSBuZXh0UG9pbnQueSAtIGN1cnJQb2ludC55O1xuICAgICAgY29uc3QgbGVuMSA9IE1hdGguaHlwb3QoZHgxLCBkeTEpO1xuICAgICAgY29uc3QgbGVuMiA9IE1hdGguaHlwb3QoZHgyLCBkeTIpO1xuICAgICAgaWYgKGxlbjEgPCBlcHNpbG9uIHx8IGxlbjIgPCBlcHNpbG9uKSB7XG4gICAgICAgIHBhdGggKz0gYEwke2N1cnJQb2ludC54fSwke2N1cnJQb2ludC55fWA7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgbngxID0gZHgxIC8gbGVuMTtcbiAgICAgIGNvbnN0IG55MSA9IGR5MSAvIGxlbjE7XG4gICAgICBjb25zdCBueDIgPSBkeDIgLyBsZW4yO1xuICAgICAgY29uc3QgbnkyID0gZHkyIC8gbGVuMjtcbiAgICAgIGNvbnN0IGRvdCA9IG54MSAqIG54MiArIG55MSAqIG55MjtcbiAgICAgIGNvbnN0IGNsYW1wZWREb3QgPSBNYXRoLm1heCgtMSwgTWF0aC5taW4oMSwgZG90KSk7XG4gICAgICBjb25zdCBhbmdsZSA9IE1hdGguYWNvcyhjbGFtcGVkRG90KTtcbiAgICAgIGlmIChhbmdsZSA8IGVwc2lsb24gfHwgTWF0aC5hYnMoTWF0aC5QSSAtIGFuZ2xlKSA8IGVwc2lsb24pIHtcbiAgICAgICAgcGF0aCArPSBgTCR7Y3VyclBvaW50Lnh9LCR7Y3VyclBvaW50Lnl9YDtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCBjdXRMZW4gPSBNYXRoLm1pbihyYWRpdXMgLyBNYXRoLnNpbihhbmdsZSAvIDIpLCBsZW4xIC8gMiwgbGVuMiAvIDIpO1xuICAgICAgY29uc3Qgc3RhcnRYID0gY3VyclBvaW50LnggLSBueDEgKiBjdXRMZW47XG4gICAgICBjb25zdCBzdGFydFkgPSBjdXJyUG9pbnQueSAtIG55MSAqIGN1dExlbjtcbiAgICAgIGNvbnN0IGVuZFggPSBjdXJyUG9pbnQueCArIG54MiAqIGN1dExlbjtcbiAgICAgIGNvbnN0IGVuZFkgPSBjdXJyUG9pbnQueSArIG55MiAqIGN1dExlbjtcbiAgICAgIHBhdGggKz0gYEwke3N0YXJ0WH0sJHtzdGFydFl9YDtcbiAgICAgIHBhdGggKz0gYFEke2N1cnJQb2ludC54fSwke2N1cnJQb2ludC55fSAke2VuZFh9LCR7ZW5kWX1gO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcGF0aDtcbn1cbl9fbmFtZShnZW5lcmF0ZVJvdW5kZWRQYXRoLCBcImdlbmVyYXRlUm91bmRlZFBhdGhcIik7XG5mdW5jdGlvbiBjYWxjdWxhdGVEZWx0YUFuZEFuZ2xlKHBvaW50MSwgcG9pbnQyKSB7XG4gIGlmICghcG9pbnQxIHx8ICFwb2ludDIpIHtcbiAgICByZXR1cm4geyBhbmdsZTogMCwgZGVsdGFYOiAwLCBkZWx0YVk6IDAgfTtcbiAgfVxuICBjb25zdCBkZWx0YVggPSBwb2ludDIueCAtIHBvaW50MS54O1xuICBjb25zdCBkZWx0YVkgPSBwb2ludDIueSAtIHBvaW50MS55O1xuICBjb25zdCBhbmdsZSA9IE1hdGguYXRhbjIoZGVsdGFZLCBkZWx0YVgpO1xuICByZXR1cm4geyBhbmdsZSwgZGVsdGFYLCBkZWx0YVkgfTtcbn1cbl9fbmFtZShjYWxjdWxhdGVEZWx0YUFuZEFuZ2xlLCBcImNhbGN1bGF0ZURlbHRhQW5kQW5nbGVcIik7XG5mdW5jdGlvbiBhcHBseU1hcmtlck9mZnNldHNUb1BvaW50cyhwb2ludHMsIGVkZ2UpIHtcbiAgY29uc3QgbmV3UG9pbnRzID0gcG9pbnRzLm1hcCgocG9pbnQyKSA9PiAoeyAuLi5wb2ludDIgfSkpO1xuICBpZiAocG9pbnRzLmxlbmd0aCA+PSAyICYmIG1hcmtlck9mZnNldHNbZWRnZS5hcnJvd1R5cGVTdGFydF0pIHtcbiAgICBjb25zdCBvZmZzZXRWYWx1ZSA9IG1hcmtlck9mZnNldHNbZWRnZS5hcnJvd1R5cGVTdGFydF07XG4gICAgY29uc3QgcG9pbnQxID0gcG9pbnRzWzBdO1xuICAgIGNvbnN0IHBvaW50MiA9IHBvaW50c1sxXTtcbiAgICBjb25zdCB7IGFuZ2xlIH0gPSBjYWxjdWxhdGVEZWx0YUFuZEFuZ2xlKHBvaW50MSwgcG9pbnQyKTtcbiAgICBjb25zdCBvZmZzZXRYID0gb2Zmc2V0VmFsdWUgKiBNYXRoLmNvcyhhbmdsZSk7XG4gICAgY29uc3Qgb2Zmc2V0WSA9IG9mZnNldFZhbHVlICogTWF0aC5zaW4oYW5nbGUpO1xuICAgIG5ld1BvaW50c1swXS54ID0gcG9pbnQxLnggKyBvZmZzZXRYO1xuICAgIG5ld1BvaW50c1swXS55ID0gcG9pbnQxLnkgKyBvZmZzZXRZO1xuICB9XG4gIGNvbnN0IG4gPSBwb2ludHMubGVuZ3RoO1xuICBpZiAobiA+PSAyICYmIG1hcmtlck9mZnNldHNbZWRnZS5hcnJvd1R5cGVFbmRdKSB7XG4gICAgY29uc3Qgb2Zmc2V0VmFsdWUgPSBtYXJrZXJPZmZzZXRzW2VkZ2UuYXJyb3dUeXBlRW5kXTtcbiAgICBjb25zdCBwb2ludDEgPSBwb2ludHNbbiAtIDFdO1xuICAgIGNvbnN0IHBvaW50MiA9IHBvaW50c1tuIC0gMl07XG4gICAgY29uc3QgeyBhbmdsZSB9ID0gY2FsY3VsYXRlRGVsdGFBbmRBbmdsZShwb2ludDIsIHBvaW50MSk7XG4gICAgY29uc3Qgb2Zmc2V0WCA9IG9mZnNldFZhbHVlICogTWF0aC5jb3MoYW5nbGUpO1xuICAgIGNvbnN0IG9mZnNldFkgPSBvZmZzZXRWYWx1ZSAqIE1hdGguc2luKGFuZ2xlKTtcbiAgICBuZXdQb2ludHNbbiAtIDFdLnggPSBwb2ludDEueCAtIG9mZnNldFg7XG4gICAgbmV3UG9pbnRzW24gLSAxXS55ID0gcG9pbnQxLnkgLSBvZmZzZXRZO1xuICB9XG4gIHJldHVybiBuZXdQb2ludHM7XG59XG5fX25hbWUoYXBwbHlNYXJrZXJPZmZzZXRzVG9Qb2ludHMsIFwiYXBwbHlNYXJrZXJPZmZzZXRzVG9Qb2ludHNcIik7XG5cbi8vIHNyYy9yZW5kZXJpbmctdXRpbC9yZW5kZXJpbmctZWxlbWVudHMvbWFya2Vycy5qc1xudmFyIGluc2VydE1hcmtlcnMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChlbGVtLCBtYXJrZXJBcnJheSwgdHlwZSwgaWQpID0+IHtcbiAgbWFya2VyQXJyYXkuZm9yRWFjaCgobWFya2VyTmFtZSkgPT4ge1xuICAgIG1hcmtlcnNbbWFya2VyTmFtZV0oZWxlbSwgdHlwZSwgaWQpO1xuICB9KTtcbn0sIFwiaW5zZXJ0TWFya2Vyc1wiKTtcbnZhciBleHRlbnNpb24gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChlbGVtLCB0eXBlLCBpZCkgPT4ge1xuICBsb2cudHJhY2UoXCJNYWtpbmcgbWFya2VycyBmb3IgXCIsIGlkKTtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1leHRlbnNpb25TdGFydFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgZXh0ZW5zaW9uIFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgMTgpLmF0dHIoXCJyZWZZXCIsIDcpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAyMCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAyOCkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0gMSw3IEwxOCwxMyBWIDEgWlwiKTtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1leHRlbnNpb25FbmRcIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIGV4dGVuc2lvbiBcIiArIHR5cGUpLmF0dHIoXCJyZWZYXCIsIDEpLmF0dHIoXCJyZWZZXCIsIDcpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAyMCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAyOCkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0gMSwxIFYgMTMgTDE4LDcgWlwiKTtcbiAgZWxlbS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCJfXCIgKyB0eXBlICsgXCItZXh0ZW5zaW9uU3RhcnQtbWFyZ2luXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hcmtlciBleHRlbnNpb24gXCIgKyB0eXBlKS5hdHRyKFwicmVmWFwiLCAxOCkuYXR0cihcInJlZllcIiwgNykuYXR0cihcIm1hcmtlcldpZHRoXCIsIDIwKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDI4KS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hdHRyKFwibWFya2VyVW5pdHNcIiwgXCJ1c2VyU3BhY2VPblVzZVwiKS5hdHRyKFwidmlld0JveFwiLCBcIjAgMCAyMCAxNFwiKS5hcHBlbmQoXCJwb2x5Z29uXCIpLmF0dHIoXCJwb2ludHNcIiwgXCIxMCw3IDE4LDEzIDE4LDFcIikuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgMikuc3R5bGUoXCJzdHJva2UtZGFzaGFycmF5XCIsIFwiMFwiKTtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1leHRlbnNpb25FbmQtbWFyZ2luXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hcmtlciBleHRlbnNpb24gXCIgKyB0eXBlKS5hdHRyKFwicmVmWFwiLCA5KS5hdHRyKFwicmVmWVwiLCA3KS5hdHRyKFwibWFya2VyV2lkdGhcIiwgMjApLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMjgpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpLmF0dHIoXCJ2aWV3Qm94XCIsIFwiMCAwIDIwIDE0XCIpLmFwcGVuZChcInBvbHlnb25cIikuYXR0cihcInBvaW50c1wiLCBcIjEwLDEgMTAsMTMgMTgsN1wiKS5zdHlsZShcInN0cm9rZS13aWR0aFwiLCAyKS5zdHlsZShcInN0cm9rZS1kYXNoYXJyYXlcIiwgXCIwXCIpO1xufSwgXCJleHRlbnNpb25cIik7XG52YXIgY29tcG9zaXRpb24gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChlbGVtLCB0eXBlLCBpZCkgPT4ge1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLWNvbXBvc2l0aW9uU3RhcnRcIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIGNvbXBvc2l0aW9uIFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgMTgpLmF0dHIoXCJyZWZZXCIsIDcpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAxOTApLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMjQwKS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSAxOCw3IEw5LDEzIEwxLDcgTDksMSBaXCIpO1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLWNvbXBvc2l0aW9uRW5kXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hcmtlciBjb21wb3NpdGlvbiBcIiArIHR5cGUpLmF0dHIoXCJyZWZYXCIsIDEpLmF0dHIoXCJyZWZZXCIsIDcpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAyMCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAyOCkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0gMTgsNyBMOSwxMyBMMSw3IEw5LDEgWlwiKTtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1jb21wb3NpdGlvblN0YXJ0LW1hcmdpblwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgY29tcG9zaXRpb24gXCIgKyB0eXBlKS5hdHRyKFwicmVmWFwiLCAxNSkuYXR0cihcInJlZllcIiwgNykuYXR0cihcIm1hcmtlcldpZHRoXCIsIDE5MCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAyNDApLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpLmFwcGVuZChcInBhdGhcIikuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgMCkuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMTUgMTVcIikuYXR0cihcImRcIiwgXCJNIDE4LDcgTDksMTMgTDEsNyBMOSwxIFpcIik7XG4gIGVsZW0uYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCJfXCIgKyB0eXBlICsgXCItY29tcG9zaXRpb25FbmQtbWFyZ2luXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hcmtlciBjb21wb3NpdGlvbiBcIiArIHR5cGUpLmF0dHIoXCJyZWZYXCIsIDMuNSkuYXR0cihcInJlZllcIiwgNykuYXR0cihcIm1hcmtlcldpZHRoXCIsIDIwKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDI4KS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hdHRyKFwibWFya2VyVW5pdHNcIiwgXCJ1c2VyU3BhY2VPblVzZVwiKS5hcHBlbmQoXCJwYXRoXCIpLnN0eWxlKFwic3Ryb2tlLXdpZHRoXCIsIDApLmF0dHIoXCJkXCIsIFwiTSAxOCw3IEw5LDEzIEwxLDcgTDksMSBaXCIpO1xufSwgXCJjb21wb3NpdGlvblwiKTtcbnZhciBhZ2dyZWdhdGlvbiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGVsZW0sIHR5cGUsIGlkKSA9PiB7XG4gIGVsZW0uYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCJfXCIgKyB0eXBlICsgXCItYWdncmVnYXRpb25TdGFydFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgYWdncmVnYXRpb24gXCIgKyB0eXBlKS5hdHRyKFwicmVmWFwiLCAxOCkuYXR0cihcInJlZllcIiwgNykuYXR0cihcIm1hcmtlcldpZHRoXCIsIDE5MCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAyNDApLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNIDE4LDcgTDksMTMgTDEsNyBMOSwxIFpcIik7XG4gIGVsZW0uYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCJfXCIgKyB0eXBlICsgXCItYWdncmVnYXRpb25FbmRcIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIGFnZ3JlZ2F0aW9uIFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgMSkuYXR0cihcInJlZllcIiwgNykuYXR0cihcIm1hcmtlcldpZHRoXCIsIDIwKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDI4KS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSAxOCw3IEw5LDEzIEwxLDcgTDksMSBaXCIpO1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLWFnZ3JlZ2F0aW9uU3RhcnQtbWFyZ2luXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hcmtlciBhZ2dyZWdhdGlvbiBcIiArIHR5cGUpLmF0dHIoXCJyZWZYXCIsIDE1KS5hdHRyKFwicmVmWVwiLCA3KS5hdHRyKFwibWFya2VyV2lkdGhcIiwgMTkwKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDI0MCkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIikuYXBwZW5kKFwicGF0aFwiKS5zdHlsZShcInN0cm9rZS13aWR0aFwiLCAyKS5hdHRyKFwiZFwiLCBcIk0gMTgsNyBMOSwxMyBMMSw3IEw5LDEgWlwiKTtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1hZ2dyZWdhdGlvbkVuZC1tYXJnaW5cIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIGFnZ3JlZ2F0aW9uIFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgMSkuYXR0cihcInJlZllcIiwgNykuYXR0cihcIm1hcmtlcldpZHRoXCIsIDIwKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDI4KS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hdHRyKFwibWFya2VyVW5pdHNcIiwgXCJ1c2VyU3BhY2VPblVzZVwiKS5hcHBlbmQoXCJwYXRoXCIpLnN0eWxlKFwic3Ryb2tlLXdpZHRoXCIsIDIpLmF0dHIoXCJkXCIsIFwiTSAxOCw3IEw5LDEzIEwxLDcgTDksMSBaXCIpO1xufSwgXCJhZ2dyZWdhdGlvblwiKTtcbnZhciBkZXBlbmRlbmN5ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZWxlbSwgdHlwZSwgaWQpID0+IHtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1kZXBlbmRlbmN5U3RhcnRcIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIGRlcGVuZGVuY3kgXCIgKyB0eXBlKS5hdHRyKFwicmVmWFwiLCA2KS5hdHRyKFwicmVmWVwiLCA3KS5hdHRyKFwibWFya2VyV2lkdGhcIiwgMTkwKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDI0MCkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0gNSw3IEw5LDEzIEwxLDcgTDksMSBaXCIpO1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLWRlcGVuZGVuY3lFbmRcIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIGRlcGVuZGVuY3kgXCIgKyB0eXBlKS5hdHRyKFwicmVmWFwiLCAxMykuYXR0cihcInJlZllcIiwgNykuYXR0cihcIm1hcmtlcldpZHRoXCIsIDIwKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDI4KS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSAxOCw3IEw5LDEzIEwxNCw3IEw5LDEgWlwiKTtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1kZXBlbmRlbmN5U3RhcnQtbWFyZ2luXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hcmtlciBkZXBlbmRlbmN5IFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgNCkuYXR0cihcInJlZllcIiwgNykuYXR0cihcIm1hcmtlcldpZHRoXCIsIDE5MCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAyNDApLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpLmFwcGVuZChcInBhdGhcIikuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgMCkuYXR0cihcImRcIiwgXCJNIDUsNyBMOSwxMyBMMSw3IEw5LDEgWlwiKTtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1kZXBlbmRlbmN5RW5kLW1hcmdpblwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgZGVwZW5kZW5jeSBcIiArIHR5cGUpLmF0dHIoXCJyZWZYXCIsIDE2KS5hdHRyKFwicmVmWVwiLCA3KS5hdHRyKFwibWFya2VyV2lkdGhcIiwgMjApLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMjgpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpLmFwcGVuZChcInBhdGhcIikuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgMCkuYXR0cihcImRcIiwgXCJNIDE4LDcgTDksMTMgTDE0LDcgTDksMSBaXCIpO1xufSwgXCJkZXBlbmRlbmN5XCIpO1xudmFyIGxvbGxpcG9wID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZWxlbSwgdHlwZSwgaWQpID0+IHtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1sb2xsaXBvcFN0YXJ0XCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hcmtlciBsb2xsaXBvcCBcIiArIHR5cGUpLmF0dHIoXCJyZWZYXCIsIDEzKS5hdHRyKFwicmVmWVwiLCA3KS5hdHRyKFwibWFya2VyV2lkdGhcIiwgMTkwKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDI0MCkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJmaWxsXCIsIFwidHJhbnNwYXJlbnRcIikuYXR0cihcImN4XCIsIDcpLmF0dHIoXCJjeVwiLCA3KS5hdHRyKFwiclwiLCA2KTtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1sb2xsaXBvcEVuZFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgbG9sbGlwb3AgXCIgKyB0eXBlKS5hdHRyKFwicmVmWFwiLCAxKS5hdHRyKFwicmVmWVwiLCA3KS5hdHRyKFwibWFya2VyV2lkdGhcIiwgMTkwKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDI0MCkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJmaWxsXCIsIFwidHJhbnNwYXJlbnRcIikuYXR0cihcImN4XCIsIDcpLmF0dHIoXCJjeVwiLCA3KS5hdHRyKFwiclwiLCA2KTtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1sb2xsaXBvcFN0YXJ0LW1hcmdpblwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgbG9sbGlwb3AgXCIgKyB0eXBlKS5hdHRyKFwicmVmWFwiLCAxMykuYXR0cihcInJlZllcIiwgNykuYXR0cihcIm1hcmtlcldpZHRoXCIsIDE5MCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAyNDApLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpLmFwcGVuZChcImNpcmNsZVwiKS5hdHRyKFwiZmlsbFwiLCBcInRyYW5zcGFyZW50XCIpLmF0dHIoXCJjeFwiLCA3KS5hdHRyKFwiY3lcIiwgNykuYXR0cihcInJcIiwgNikuYXR0cihcInN0cm9rZS13aWR0aFwiLCAyKTtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1sb2xsaXBvcEVuZC1tYXJnaW5cIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIGxvbGxpcG9wIFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgMSkuYXR0cihcInJlZllcIiwgNykuYXR0cihcIm1hcmtlcldpZHRoXCIsIDE5MCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAyNDApLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpLmFwcGVuZChcImNpcmNsZVwiKS5hdHRyKFwiZmlsbFwiLCBcInRyYW5zcGFyZW50XCIpLmF0dHIoXCJjeFwiLCA3KS5hdHRyKFwiY3lcIiwgNykuYXR0cihcInJcIiwgNikuYXR0cihcInN0cm9rZS13aWR0aFwiLCAyKTtcbn0sIFwibG9sbGlwb3BcIik7XG52YXIgcG9pbnQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChlbGVtLCB0eXBlLCBpZCkgPT4ge1xuICBlbGVtLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1wb2ludEVuZFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgXCIgKyB0eXBlKS5hdHRyKFwidmlld0JveFwiLCBcIjAgMCAxMCAxMFwiKS5hdHRyKFwicmVmWFwiLCA1KS5hdHRyKFwicmVmWVwiLCA1KS5hdHRyKFwibWFya2VyVW5pdHNcIiwgXCJ1c2VyU3BhY2VPblVzZVwiKS5hdHRyKFwibWFya2VyV2lkdGhcIiwgOCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCA4KS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSAwIDAgTCAxMCA1IEwgMCAxMCB6XCIpLmF0dHIoXCJjbGFzc1wiLCBcImFycm93TWFya2VyUGF0aFwiKS5zdHlsZShcInN0cm9rZS13aWR0aFwiLCAxKS5zdHlsZShcInN0cm9rZS1kYXNoYXJyYXlcIiwgXCIxLDBcIik7XG4gIGVsZW0uYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLXBvaW50U3RhcnRcIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIFwiICsgdHlwZSkuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMTAgMTBcIikuYXR0cihcInJlZlhcIiwgNC41KS5hdHRyKFwicmVmWVwiLCA1KS5hdHRyKFwibWFya2VyVW5pdHNcIiwgXCJ1c2VyU3BhY2VPblVzZVwiKS5hdHRyKFwibWFya2VyV2lkdGhcIiwgOCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCA4KS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSAwIDUgTCAxMCAxMCBMIDEwIDAgelwiKS5hdHRyKFwiY2xhc3NcIiwgXCJhcnJvd01hcmtlclBhdGhcIikuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgMSkuc3R5bGUoXCJzdHJva2UtZGFzaGFycmF5XCIsIFwiMSwwXCIpO1xuICBlbGVtLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1wb2ludEVuZC1tYXJnaW5cIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIFwiICsgdHlwZSkuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMTEuNSAxNFwiKS5hdHRyKFwicmVmWFwiLCAxMS41KS5hdHRyKFwicmVmWVwiLCA3KS5hdHRyKFwibWFya2VyVW5pdHNcIiwgXCJ1c2VyU3BhY2VPblVzZVwiKS5hdHRyKFwibWFya2VyV2lkdGhcIiwgMTAuNSkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAxNCkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0gMCAwIEwgMTEuNSA3IEwgMCAxNCB6XCIpLmF0dHIoXCJjbGFzc1wiLCBcImFycm93TWFya2VyUGF0aFwiKS5zdHlsZShcInN0cm9rZS13aWR0aFwiLCAwKS5zdHlsZShcInN0cm9rZS1kYXNoYXJyYXlcIiwgXCIxLDBcIik7XG4gIGVsZW0uYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLXBvaW50U3RhcnQtbWFyZ2luXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hcmtlciBcIiArIHR5cGUpLmF0dHIoXCJ2aWV3Qm94XCIsIFwiMCAwIDExLjUgMTRcIikuYXR0cihcInJlZlhcIiwgMSkuYXR0cihcInJlZllcIiwgNykuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIikuYXR0cihcIm1hcmtlcldpZHRoXCIsIDExLjUpLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMTQpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmFwcGVuZChcInBvbHlnb25cIikuYXR0cihcInBvaW50c1wiLCBcIjAsNyAxMS41LDE0IDExLjUsMFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJhcnJvd01hcmtlclBhdGhcIikuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgMCkuc3R5bGUoXCJzdHJva2UtZGFzaGFycmF5XCIsIFwiMSwwXCIpO1xufSwgXCJwb2ludFwiKTtcbnZhciBjaXJjbGUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChlbGVtLCB0eXBlLCBpZCkgPT4ge1xuICBlbGVtLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1jaXJjbGVFbmRcIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIFwiICsgdHlwZSkuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMTAgMTBcIikuYXR0cihcInJlZlhcIiwgMTEpLmF0dHIoXCJyZWZZXCIsIDUpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAxMSkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAxMSkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJjeFwiLCBcIjVcIikuYXR0cihcImN5XCIsIFwiNVwiKS5hdHRyKFwiclwiLCBcIjVcIikuYXR0cihcImNsYXNzXCIsIFwiYXJyb3dNYXJrZXJQYXRoXCIpLnN0eWxlKFwic3Ryb2tlLXdpZHRoXCIsIDEpLnN0eWxlKFwic3Ryb2tlLWRhc2hhcnJheVwiLCBcIjEsMFwiKTtcbiAgZWxlbS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCJfXCIgKyB0eXBlICsgXCItY2lyY2xlU3RhcnRcIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIFwiICsgdHlwZSkuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMTAgMTBcIikuYXR0cihcInJlZlhcIiwgLTEpLmF0dHIoXCJyZWZZXCIsIDUpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAxMSkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAxMSkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJjeFwiLCBcIjVcIikuYXR0cihcImN5XCIsIFwiNVwiKS5hdHRyKFwiclwiLCBcIjVcIikuYXR0cihcImNsYXNzXCIsIFwiYXJyb3dNYXJrZXJQYXRoXCIpLnN0eWxlKFwic3Ryb2tlLXdpZHRoXCIsIDEpLnN0eWxlKFwic3Ryb2tlLWRhc2hhcnJheVwiLCBcIjEsMFwiKTtcbiAgZWxlbS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCJfXCIgKyB0eXBlICsgXCItY2lyY2xlRW5kLW1hcmdpblwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgXCIgKyB0eXBlKS5hdHRyKFwidmlld0JveFwiLCBcIjAgMCAxMCAxMFwiKS5hdHRyKFwicmVmWVwiLCA1KS5hdHRyKFwicmVmWFwiLCAxMi4yNSkuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIikuYXR0cihcIm1hcmtlcldpZHRoXCIsIDE0KS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDE0KS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImN4XCIsIFwiNVwiKS5hdHRyKFwiY3lcIiwgXCI1XCIpLmF0dHIoXCJyXCIsIFwiNVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJhcnJvd01hcmtlclBhdGhcIikuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgMCkuc3R5bGUoXCJzdHJva2UtZGFzaGFycmF5XCIsIFwiMSwwXCIpO1xuICBlbGVtLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1jaXJjbGVTdGFydC1tYXJnaW5cIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIFwiICsgdHlwZSkuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMTAgMTBcIikuYXR0cihcInJlZlhcIiwgLTIpLmF0dHIoXCJyZWZZXCIsIDUpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAxNCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAxNCkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJjeFwiLCBcIjVcIikuYXR0cihcImN5XCIsIFwiNVwiKS5hdHRyKFwiclwiLCBcIjVcIikuYXR0cihcImNsYXNzXCIsIFwiYXJyb3dNYXJrZXJQYXRoXCIpLnN0eWxlKFwic3Ryb2tlLXdpZHRoXCIsIDApLnN0eWxlKFwic3Ryb2tlLWRhc2hhcnJheVwiLCBcIjEsMFwiKTtcbn0sIFwiY2lyY2xlXCIpO1xudmFyIGNyb3NzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZWxlbSwgdHlwZSwgaWQpID0+IHtcbiAgZWxlbS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCJfXCIgKyB0eXBlICsgXCItY3Jvc3NFbmRcIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIGNyb3NzIFwiICsgdHlwZSkuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMTEgMTFcIikuYXR0cihcInJlZlhcIiwgMTIpLmF0dHIoXCJyZWZZXCIsIDUuMikuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIikuYXR0cihcIm1hcmtlcldpZHRoXCIsIDExKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDExKS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSAxLDEgbCA5LDkgTSAxMCwxIGwgLTksOVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJhcnJvd01hcmtlclBhdGhcIikuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgMikuc3R5bGUoXCJzdHJva2UtZGFzaGFycmF5XCIsIFwiMSwwXCIpO1xuICBlbGVtLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1jcm9zc1N0YXJ0XCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hcmtlciBjcm9zcyBcIiArIHR5cGUpLmF0dHIoXCJ2aWV3Qm94XCIsIFwiMCAwIDExIDExXCIpLmF0dHIoXCJyZWZYXCIsIC0xKS5hdHRyKFwicmVmWVwiLCA1LjIpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAxMSkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAxMSkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0gMSwxIGwgOSw5IE0gMTAsMSBsIC05LDlcIikuYXR0cihcImNsYXNzXCIsIFwiYXJyb3dNYXJrZXJQYXRoXCIpLnN0eWxlKFwic3Ryb2tlLXdpZHRoXCIsIDIpLnN0eWxlKFwic3Ryb2tlLWRhc2hhcnJheVwiLCBcIjEsMFwiKTtcbiAgZWxlbS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCJfXCIgKyB0eXBlICsgXCItY3Jvc3NFbmQtbWFyZ2luXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hcmtlciBjcm9zcyBcIiArIHR5cGUpLmF0dHIoXCJ2aWV3Qm94XCIsIFwiMCAwIDE1IDE1XCIpLmF0dHIoXCJyZWZYXCIsIDE3LjcpLmF0dHIoXCJyZWZZXCIsIDcuNSkuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIikuYXR0cihcIm1hcmtlcldpZHRoXCIsIDEyKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDEyKS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSAxLDEgTCAxNCwxNCBNIDEsMTQgTCAxNCwxXCIpLmF0dHIoXCJjbGFzc1wiLCBcImFycm93TWFya2VyUGF0aFwiKS5zdHlsZShcInN0cm9rZS13aWR0aFwiLCAyLjUpO1xuICBlbGVtLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1jcm9zc1N0YXJ0LW1hcmdpblwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgY3Jvc3MgXCIgKyB0eXBlKS5hdHRyKFwidmlld0JveFwiLCBcIjAgMCAxNSAxNVwiKS5hdHRyKFwicmVmWFwiLCAtMy41KS5hdHRyKFwicmVmWVwiLCA3LjUpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAxMikuYXR0cihcIm1hcmtlckhlaWdodFwiLCAxMikuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0gMSwxIEwgMTQsMTQgTSAxLDE0IEwgMTQsMVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJhcnJvd01hcmtlclBhdGhcIikuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgMi41KS5zdHlsZShcInN0cm9rZS1kYXNoYXJyYXlcIiwgXCIxLDBcIik7XG59LCBcImNyb3NzXCIpO1xudmFyIGJhcmIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChlbGVtLCB0eXBlLCBpZCkgPT4ge1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLWJhcmJFbmRcIikuYXR0cihcInJlZlhcIiwgMTkpLmF0dHIoXCJyZWZZXCIsIDcpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAyMCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAxNCkuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIikuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0gMTksNyBMOSwxMyBMMTQsNyBMOSwxIFpcIik7XG59LCBcImJhcmJcIik7XG52YXIgYmFyYk5lbyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGVsZW0sIHR5cGUsIGlkKSA9PiB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICBjb25zdCB7IHRoZW1lVmFyaWFibGVzIH0gPSBjb25maWc7XG4gIGNvbnN0IHsgdHJhbnNpdGlvbkNvbG9yIH0gPSB0aGVtZVZhcmlhYmxlcztcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1iYXJiRW5kXCIpLmF0dHIoXCJyZWZYXCIsIDE5KS5hdHRyKFwicmVmWVwiLCA3KS5hdHRyKFwibWFya2VyV2lkdGhcIiwgMjApLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMTQpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInN0cm9rZVdpZHRoXCIpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNIDE5LDcgTDExLDE0IEwxMyw3IEwxMSwwIFpcIik7XG4gIGVsZW0uYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCJfXCIgKyB0eXBlICsgXCItYmFyYkVuZC1tYXJnaW5cIikuYXR0cihcInJlZlhcIiwgMTcpLmF0dHIoXCJyZWZZXCIsIDcpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAyMCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAxNCkuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIikuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0gMTksNyBMMTEsMTQgTDEzLDcgTDExLDAgWlwiKS5hdHRyKFwiZmlsbFwiLCBgJHt0cmFuc2l0aW9uQ29sb3J9YCk7XG59LCBcImJhcmJOZW9cIik7XG52YXIgb25seV9vbmUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChlbGVtLCB0eXBlLCBpZCkgPT4ge1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLW9ubHlPbmVTdGFydFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgb25seU9uZSBcIiArIHR5cGUpLmF0dHIoXCJyZWZYXCIsIDApLmF0dHIoXCJyZWZZXCIsIDkpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAxOCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAxOCkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk05LDAgTDksMTggTTE1LDAgTDE1LDE4XCIpO1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLW9ubHlPbmVFbmRcIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIG9ubHlPbmUgXCIgKyB0eXBlKS5hdHRyKFwicmVmWFwiLCAxOCkuYXR0cihcInJlZllcIiwgOSkuYXR0cihcIm1hcmtlcldpZHRoXCIsIDE4KS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDE4KS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTTMsMCBMMywxOCBNOSwwIEw5LDE4XCIpO1xufSwgXCJvbmx5X29uZVwiKTtcbnZhciB6ZXJvX29yX29uZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGVsZW0sIHR5cGUsIGlkKSA9PiB7XG4gIGNvbnN0IHN0YXJ0TWFya2VyID0gZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi16ZXJvT3JPbmVTdGFydFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgemVyb09yT25lIFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgMCkuYXR0cihcInJlZllcIiwgOSkuYXR0cihcIm1hcmtlcldpZHRoXCIsIDMwKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDE4KS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKTtcbiAgc3RhcnRNYXJrZXIuYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJmaWxsXCIsIFwid2hpdGVcIikuYXR0cihcImN4XCIsIDIxKS5hdHRyKFwiY3lcIiwgOSkuYXR0cihcInJcIiwgNik7XG4gIHN0YXJ0TWFya2VyLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNOSwwIEw5LDE4XCIpO1xuICBjb25zdCBlbmRNYXJrZXIgPSBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLXplcm9Pck9uZUVuZFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgemVyb09yT25lIFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgMzApLmF0dHIoXCJyZWZZXCIsIDkpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAzMCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAxOCkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIik7XG4gIGVuZE1hcmtlci5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImZpbGxcIiwgXCJ3aGl0ZVwiKS5hdHRyKFwiY3hcIiwgOSkuYXR0cihcImN5XCIsIDkpLmF0dHIoXCJyXCIsIDYpO1xuICBlbmRNYXJrZXIuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0yMSwwIEwyMSwxOFwiKTtcbn0sIFwiemVyb19vcl9vbmVcIik7XG52YXIgb25lX29yX21vcmUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChlbGVtLCB0eXBlLCBpZCkgPT4ge1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLW9uZU9yTW9yZVN0YXJ0XCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hcmtlciBvbmVPck1vcmUgXCIgKyB0eXBlKS5hdHRyKFwicmVmWFwiLCAxOCkuYXR0cihcInJlZllcIiwgMTgpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCA0NSkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAzNikuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0wLDE4IFEgMTgsMCAzNiwxOCBRIDE4LDM2IDAsMTggTTQyLDkgTDQyLDI3XCIpO1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLW9uZU9yTW9yZUVuZFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgb25lT3JNb3JlIFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgMjcpLmF0dHIoXCJyZWZZXCIsIDE4KS5hdHRyKFwibWFya2VyV2lkdGhcIiwgNDUpLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMzYpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNMyw5IEwzLDI3IE05LDE4IFEyNywwIDQ1LDE4IFEyNywzNiA5LDE4XCIpO1xufSwgXCJvbmVfb3JfbW9yZVwiKTtcbnZhciB6ZXJvX29yX21vcmUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChlbGVtLCB0eXBlLCBpZCkgPT4ge1xuICBjb25zdCBzdGFydE1hcmtlciA9IGVsZW0uYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCJfXCIgKyB0eXBlICsgXCItemVyb09yTW9yZVN0YXJ0XCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hcmtlciB6ZXJvT3JNb3JlIFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgMTgpLmF0dHIoXCJyZWZZXCIsIDE4KS5hdHRyKFwibWFya2VyV2lkdGhcIiwgNTcpLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMzYpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpO1xuICBzdGFydE1hcmtlci5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImZpbGxcIiwgXCJ3aGl0ZVwiKS5hdHRyKFwiY3hcIiwgNDgpLmF0dHIoXCJjeVwiLCAxOCkuYXR0cihcInJcIiwgNik7XG4gIHN0YXJ0TWFya2VyLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNMCwxOCBRMTgsMCAzNiwxOCBRMTgsMzYgMCwxOFwiKTtcbiAgY29uc3QgZW5kTWFya2VyID0gZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi16ZXJvT3JNb3JlRW5kXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hcmtlciB6ZXJvT3JNb3JlIFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgMzkpLmF0dHIoXCJyZWZZXCIsIDE4KS5hdHRyKFwibWFya2VyV2lkdGhcIiwgNTcpLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMzYpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpO1xuICBlbmRNYXJrZXIuYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJmaWxsXCIsIFwid2hpdGVcIikuYXR0cihcImN4XCIsIDkpLmF0dHIoXCJjeVwiLCAxOCkuYXR0cihcInJcIiwgNik7XG4gIGVuZE1hcmtlci5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTTIxLDE4IFEzOSwwIDU3LDE4IFEzOSwzNiAyMSwxOFwiKTtcbn0sIFwiemVyb19vcl9tb3JlXCIpO1xudmFyIG9ubHlfb25lX25lbyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGVsZW0sIHR5cGUsIGlkKSA9PiB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICBjb25zdCB7IHRoZW1lVmFyaWFibGVzIH0gPSBjb25maWc7XG4gIGNvbnN0IHsgc3Ryb2tlV2lkdGggfSA9IHRoZW1lVmFyaWFibGVzO1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLW9ubHlPbmVTdGFydFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgb25seU9uZSBcIiArIHR5cGUpLmF0dHIoXCJyZWZYXCIsIDApLmF0dHIoXCJyZWZZXCIsIDkpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAxOCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAxOCkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk05LDAgTDksMTggTTE1LDAgTDE1LDE4XCIpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgYCR7c3Ryb2tlV2lkdGh9YCk7XG4gIGVsZW0uYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCJfXCIgKyB0eXBlICsgXCItb25seU9uZUVuZFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgb25seU9uZSBcIiArIHR5cGUpLmF0dHIoXCJyZWZYXCIsIDE4KS5hdHRyKFwicmVmWVwiLCA5KS5hdHRyKFwibWFya2VyV2lkdGhcIiwgMTgpLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMTgpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNMywwIEwzLDE4IE05LDAgTDksMThcIikuYXR0cihcInN0cm9rZS13aWR0aFwiLCBgJHtzdHJva2VXaWR0aH1gKTtcbn0sIFwib25seV9vbmVfbmVvXCIpO1xudmFyIHplcm9fb3Jfb25lX25lbyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGVsZW0sIHR5cGUsIGlkKSA9PiB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICBjb25zdCB7IHRoZW1lVmFyaWFibGVzIH0gPSBjb25maWc7XG4gIGNvbnN0IHsgc3Ryb2tlV2lkdGgsIG1haW5Ca2cgfSA9IHRoZW1lVmFyaWFibGVzO1xuICBjb25zdCBzdGFydE1hcmtlciA9IGVsZW0uYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCJfXCIgKyB0eXBlICsgXCItemVyb09yT25lU3RhcnRcIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIHplcm9Pck9uZSBcIiArIHR5cGUpLmF0dHIoXCJyZWZYXCIsIDApLmF0dHIoXCJyZWZZXCIsIDkpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAzMCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAxOCkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIik7XG4gIHN0YXJ0TWFya2VyLmFwcGVuZChcImNpcmNsZVwiKS5hdHRyKFwiZmlsbFwiLCBtYWluQmtnID8/IFwid2hpdGVcIikuYXR0cihcImN4XCIsIDIxKS5hdHRyKFwiY3lcIiwgOSkuYXR0cihcInN0cm9rZS13aWR0aFwiLCBgJHtzdHJva2VXaWR0aH1gKS5hdHRyKFwiclwiLCA2KTtcbiAgc3RhcnRNYXJrZXIuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk05LDAgTDksMThcIikuYXR0cihcInN0cm9rZS13aWR0aFwiLCBgJHtzdHJva2VXaWR0aH1gKTtcbiAgY29uc3QgZW5kTWFya2VyID0gZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi16ZXJvT3JPbmVFbmRcIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIHplcm9Pck9uZSBcIiArIHR5cGUpLmF0dHIoXCJyZWZYXCIsIDMwKS5hdHRyKFwicmVmWVwiLCA5KS5hdHRyKFwibWFya2VyV2lkdGhcIiwgMzApLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMTgpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpO1xuICBlbmRNYXJrZXIuYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJmaWxsXCIsIG1haW5Ca2cgPz8gXCJ3aGl0ZVwiKS5hdHRyKFwiY3hcIiwgOSkuYXR0cihcImN5XCIsIDkpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgYCR7c3Ryb2tlV2lkdGh9YCkuYXR0cihcInJcIiwgNik7XG4gIGVuZE1hcmtlci5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTTIxLDAgTDIxLDE4XCIpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgYCR7c3Ryb2tlV2lkdGh9YCk7XG59LCBcInplcm9fb3Jfb25lX25lb1wiKTtcbnZhciBvbmVfb3JfbW9yZV9uZW8gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChlbGVtLCB0eXBlLCBpZCkgPT4ge1xuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgY29uc3QgeyB0aGVtZVZhcmlhYmxlcyB9ID0gY29uZmlnO1xuICBjb25zdCB7IHN0cm9rZVdpZHRoIH0gPSB0aGVtZVZhcmlhYmxlcztcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1vbmVPck1vcmVTdGFydFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgb25lT3JNb3JlIFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgMTgpLmF0dHIoXCJyZWZZXCIsIDE4KS5hdHRyKFwibWFya2VyV2lkdGhcIiwgNDUpLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMzYpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNMCwxOCBRIDE4LDAgMzYsMTggUSAxOCwzNiAwLDE4IE00Miw5IEw0MiwyN1wiKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIGAke3N0cm9rZVdpZHRofWApO1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLW9uZU9yTW9yZUVuZFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgb25lT3JNb3JlIFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgMjcpLmF0dHIoXCJyZWZZXCIsIDE4KS5hdHRyKFwibWFya2VyV2lkdGhcIiwgNDUpLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMzYpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNMyw5IEwzLDI3IE05LDE4IFEyNywwIDQ1LDE4IFEyNywzNiA5LDE4XCIpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgYCR7c3Ryb2tlV2lkdGh9YCk7XG59LCBcIm9uZV9vcl9tb3JlX25lb1wiKTtcbnZhciB6ZXJvX29yX21vcmVfbmVvID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZWxlbSwgdHlwZSwgaWQpID0+IHtcbiAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIGNvbnN0IHsgdGhlbWVWYXJpYWJsZXMgfSA9IGNvbmZpZztcbiAgY29uc3QgeyBzdHJva2VXaWR0aCwgbWFpbkJrZyB9ID0gdGhlbWVWYXJpYWJsZXM7XG4gIGNvbnN0IHN0YXJ0TWFya2VyID0gZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi16ZXJvT3JNb3JlU3RhcnRcIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIHplcm9Pck1vcmUgXCIgKyB0eXBlKS5hdHRyKFwicmVmWFwiLCAxOCkuYXR0cihcInJlZllcIiwgMTgpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCA1NykuYXR0cihcIm1hcmtlckhlaWdodFwiLCAzNikuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIikuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIik7XG4gIHN0YXJ0TWFya2VyLmFwcGVuZChcImNpcmNsZVwiKS5hdHRyKFwiZmlsbFwiLCBtYWluQmtnID8/IFwid2hpdGVcIikuYXR0cihcImN4XCIsIDQ1LjUpLmF0dHIoXCJjeVwiLCAxOCkuYXR0cihcInJcIiwgNikuYXR0cihcInN0cm9rZS13aWR0aFwiLCBgJHtzdHJva2VXaWR0aH1gKTtcbiAgc3RhcnRNYXJrZXIuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0wLDE4IFExOCwwIDM2LDE4IFExOCwzNiAwLDE4XCIpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgYCR7c3Ryb2tlV2lkdGh9YCk7XG4gIGNvbnN0IGVuZE1hcmtlciA9IGVsZW0uYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCJfXCIgKyB0eXBlICsgXCItemVyb09yTW9yZUVuZFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgemVyb09yTW9yZSBcIiArIHR5cGUpLmF0dHIoXCJyZWZYXCIsIDM5KS5hdHRyKFwicmVmWVwiLCAxOCkuYXR0cihcIm1hcmtlcldpZHRoXCIsIDU3KS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDM2KS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hdHRyKFwibWFya2VyVW5pdHNcIiwgXCJ1c2VyU3BhY2VPblVzZVwiKTtcbiAgZW5kTWFya2VyLmFwcGVuZChcImNpcmNsZVwiKS5hdHRyKFwiZmlsbFwiLCBtYWluQmtnID8/IFwid2hpdGVcIikuYXR0cihcImN4XCIsIDExKS5hdHRyKFwiY3lcIiwgMTgpLmF0dHIoXCJyXCIsIDYpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgYCR7c3Ryb2tlV2lkdGh9YCk7XG4gIGVuZE1hcmtlci5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTTIxLDE4IFEzOSwwIDU3LDE4IFEzOSwzNiAyMSwxOFwiKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIGAke3N0cm9rZVdpZHRofWApO1xufSwgXCJ6ZXJvX29yX21vcmVfbmVvXCIpO1xudmFyIHJlcXVpcmVtZW50X2Fycm93ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZWxlbSwgdHlwZSwgaWQpID0+IHtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1yZXF1aXJlbWVudF9hcnJvd0VuZFwiKS5hdHRyKFwicmVmWFwiLCAyMCkuYXR0cihcInJlZllcIiwgMTApLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAyMCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAyMCkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFxuICAgIFwiZFwiLFxuICAgIGBNMCwwXG4gICAgICBMMjAsMTBcbiAgICAgIE0yMCwxMFxuICAgICAgTDAsMjBgXG4gICk7XG59LCBcInJlcXVpcmVtZW50X2Fycm93XCIpO1xudmFyIHJlcXVpcmVtZW50X2Fycm93X25lbyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGVsZW0sIHR5cGUsIGlkKSA9PiB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICBjb25zdCB7IHRoZW1lVmFyaWFibGVzIH0gPSBjb25maWc7XG4gIGNvbnN0IHsgc3Ryb2tlV2lkdGggfSA9IHRoZW1lVmFyaWFibGVzO1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLXJlcXVpcmVtZW50X2Fycm93RW5kXCIpLmF0dHIoXCJyZWZYXCIsIDIwKS5hdHRyKFwicmVmWVwiLCAxMCkuYXR0cihcIm1hcmtlcldpZHRoXCIsIDIwKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDIwKS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hdHRyKFwibWFya2VyVW5pdHNcIiwgXCJ1c2VyU3BhY2VPblVzZVwiKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIGAke3N0cm9rZVdpZHRofWApLmF0dHIoXCJ2aWV3Qm94XCIsIFwiMCAwIDI1IDIwXCIpLmFwcGVuZChcInBhdGhcIikuYXR0cihcbiAgICBcImRcIixcbiAgICBgTTAsMFxuICAgICAgTDIwLDEwXG4gICAgICBNMjAsMTBcbiAgICAgIEwwLDIwYFxuICApLmF0dHIoXCJzdHJva2UtbGluZWpvaW5cIiwgXCJtaXRlclwiKTtcbn0sIFwicmVxdWlyZW1lbnRfYXJyb3dfbmVvXCIpO1xudmFyIHJlcXVpcmVtZW50X2NvbnRhaW5zID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZWxlbSwgdHlwZSwgaWQpID0+IHtcbiAgY29uc3QgY29udGFpbnNOb2RlID0gZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1yZXF1aXJlbWVudF9jb250YWluc1N0YXJ0XCIpLmF0dHIoXCJyZWZYXCIsIDApLmF0dHIoXCJyZWZZXCIsIDEwKS5hdHRyKFwibWFya2VyV2lkdGhcIiwgMjApLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMjApLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmFwcGVuZChcImdcIik7XG4gIGNvbnRhaW5zTm9kZS5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImN4XCIsIDEwKS5hdHRyKFwiY3lcIiwgMTApLmF0dHIoXCJyXCIsIDkpLmF0dHIoXCJmaWxsXCIsIFwibm9uZVwiKTtcbiAgY29udGFpbnNOb2RlLmFwcGVuZChcImxpbmVcIikuYXR0cihcIngxXCIsIDEpLmF0dHIoXCJ4MlwiLCAxOSkuYXR0cihcInkxXCIsIDEwKS5hdHRyKFwieTJcIiwgMTApO1xuICBjb250YWluc05vZGUuYXBwZW5kKFwibGluZVwiKS5hdHRyKFwieTFcIiwgMSkuYXR0cihcInkyXCIsIDE5KS5hdHRyKFwieDFcIiwgMTApLmF0dHIoXCJ4MlwiLCAxMCk7XG59LCBcInJlcXVpcmVtZW50X2NvbnRhaW5zXCIpO1xudmFyIHJlcXVpcmVtZW50X2NvbnRhaW5zX25lbyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGVsZW0sIHR5cGUsIGlkKSA9PiB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICBjb25zdCB7IHRoZW1lVmFyaWFibGVzIH0gPSBjb25maWc7XG4gIGNvbnN0IHsgc3Ryb2tlV2lkdGggfSA9IHRoZW1lVmFyaWFibGVzO1xuICBjb25zdCBjb250YWluc05vZGUgPSBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLXJlcXVpcmVtZW50X2NvbnRhaW5zU3RhcnRcIikuYXR0cihcInJlZlhcIiwgMCkuYXR0cihcInJlZllcIiwgMTApLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAyMCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAyMCkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIikuYXBwZW5kKFwiZ1wiKTtcbiAgY29udGFpbnNOb2RlLmFwcGVuZChcImNpcmNsZVwiKS5hdHRyKFwiY3hcIiwgMTApLmF0dHIoXCJjeVwiLCAxMCkuYXR0cihcInJcIiwgOSkuYXR0cihcImZpbGxcIiwgXCJub25lXCIpO1xuICBjb250YWluc05vZGUuYXBwZW5kKFwibGluZVwiKS5hdHRyKFwieDFcIiwgMSkuYXR0cihcIngyXCIsIDE5KS5hdHRyKFwieTFcIiwgMTApLmF0dHIoXCJ5MlwiLCAxMCk7XG4gIGNvbnRhaW5zTm9kZS5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJ5MVwiLCAxKS5hdHRyKFwieTJcIiwgMTkpLmF0dHIoXCJ4MVwiLCAxMCkuYXR0cihcIngyXCIsIDEwKTtcbiAgY29udGFpbnNOb2RlLnNlbGVjdEFsbChcIipcIikuYXR0cihcInN0cm9rZS13aWR0aFwiLCBgJHtzdHJva2VXaWR0aH1gKTtcbn0sIFwicmVxdWlyZW1lbnRfY29udGFpbnNfbmVvXCIpO1xudmFyIG1hcmtlcnMgPSB7XG4gIGV4dGVuc2lvbixcbiAgY29tcG9zaXRpb24sXG4gIGFnZ3JlZ2F0aW9uLFxuICBkZXBlbmRlbmN5LFxuICBsb2xsaXBvcCxcbiAgcG9pbnQsXG4gIGNpcmNsZSxcbiAgY3Jvc3MsXG4gIGJhcmIsXG4gIGJhcmJOZW8sXG4gIG9ubHlfb25lLFxuICB6ZXJvX29yX29uZSxcbiAgb25lX29yX21vcmUsXG4gIHplcm9fb3JfbW9yZSxcbiAgb25seV9vbmVfbmVvLFxuICB6ZXJvX29yX29uZV9uZW8sXG4gIG9uZV9vcl9tb3JlX25lbyxcbiAgemVyb19vcl9tb3JlX25lbyxcbiAgcmVxdWlyZW1lbnRfYXJyb3csXG4gIHJlcXVpcmVtZW50X2NvbnRhaW5zLFxuICByZXF1aXJlbWVudF9hcnJvd19uZW8sXG4gIHJlcXVpcmVtZW50X2NvbnRhaW5zX25lb1xufTtcbnZhciBtYXJrZXJzX2RlZmF1bHQgPSBpbnNlcnRNYXJrZXJzO1xuXG5leHBvcnQge1xuICBjbGVhcixcbiAgaW5zZXJ0RWRnZUxhYmVsLFxuICBwb3NpdGlvbkVkZ2VMYWJlbCxcbiAgaW5zZXJ0RWRnZSxcbiAgbWFya2Vyc19kZWZhdWx0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
