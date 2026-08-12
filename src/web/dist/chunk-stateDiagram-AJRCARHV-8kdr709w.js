import {
  StateDB,
  stateDiagram_default,
  styles_default
} from "./chunk-main-1qg1rvqr.js";
import {
  layout
} from "./chunk-main-ewtywf1m.js";
import {
  Graph
} from "./chunk-main-g8v87zdn.js";
import"./chunk-main-h8a1r6rk.js";
import"./chunk-main-snyzap23.js";
import"./chunk-main-3qqx6zcj.js";
import"./chunk-main-wx3x4ygf.js";
import"./chunk-main-xxv6x4s9.js";
import"./chunk-main-2se6cwec.js";
import"./chunk-main-4ceh9h9g.js";
import"./chunk-main-h1tqf3mz.js";
import"./chunk-main-s8463nwg.js";
import"./chunk-main-wsp4jakw.js";
import {
  utils_default
} from "./chunk-main-vvfzntzy.js";
import"./chunk-main-ck580f0k.js";
import {
  common_default,
  configureSvgSize,
  getConfig2,
  getUrl
} from "./chunk-main-aws590jt.js";
import {
  __name,
  basis_default,
  line_default,
  log,
  select_default
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/stateDiagram-AJRCARHV.mjs
var drawStartState = /* @__PURE__ */ __name((g) => g.append("circle").attr("class", "start-state").attr("r", getConfig2().state.sizeUnit).attr("cx", getConfig2().state.padding + getConfig2().state.sizeUnit).attr("cy", getConfig2().state.padding + getConfig2().state.sizeUnit), "drawStartState");
var drawDivider = /* @__PURE__ */ __name((g) => g.append("line").style("stroke", "grey").style("stroke-dasharray", "3").attr("x1", getConfig2().state.textHeight).attr("class", "divider").attr("x2", getConfig2().state.textHeight * 2).attr("y1", 0).attr("y2", 0), "drawDivider");
var drawSimpleState = /* @__PURE__ */ __name((g, stateDef) => {
  const state = g.append("text").attr("x", 2 * getConfig2().state.padding).attr("y", getConfig2().state.textHeight + 2 * getConfig2().state.padding).attr("font-size", getConfig2().state.fontSize).attr("class", "state-title").text(stateDef.id);
  const classBox = state.node().getBBox();
  g.insert("rect", ":first-child").attr("x", getConfig2().state.padding).attr("y", getConfig2().state.padding).attr("width", classBox.width + 2 * getConfig2().state.padding).attr("height", classBox.height + 2 * getConfig2().state.padding).attr("rx", getConfig2().state.radius);
  return state;
}, "drawSimpleState");
var drawDescrState = /* @__PURE__ */ __name((g, stateDef) => {
  const addTspan = /* @__PURE__ */ __name(function(textEl, txt, isFirst2) {
    const tSpan = textEl.append("tspan").attr("x", 2 * getConfig2().state.padding).text(txt);
    if (!isFirst2) {
      tSpan.attr("dy", getConfig2().state.textHeight);
    }
  }, "addTspan");
  const title = g.append("text").attr("x", 2 * getConfig2().state.padding).attr("y", getConfig2().state.textHeight + 1.3 * getConfig2().state.padding).attr("font-size", getConfig2().state.fontSize).attr("class", "state-title").text(stateDef.descriptions[0]);
  const titleBox = title.node().getBBox();
  const titleHeight = titleBox.height;
  const description = g.append("text").attr("x", getConfig2().state.padding).attr("y", titleHeight + getConfig2().state.padding * 0.4 + getConfig2().state.dividerMargin + getConfig2().state.textHeight).attr("class", "state-description");
  let isFirst = true;
  let isSecond = true;
  stateDef.descriptions.forEach(function(descr) {
    if (!isFirst) {
      addTspan(description, descr, isSecond);
      isSecond = false;
    }
    isFirst = false;
  });
  const descrLine = g.append("line").attr("x1", getConfig2().state.padding).attr("y1", getConfig2().state.padding + titleHeight + getConfig2().state.dividerMargin / 2).attr("y2", getConfig2().state.padding + titleHeight + getConfig2().state.dividerMargin / 2).attr("class", "descr-divider");
  const descrBox = description.node().getBBox();
  const width = Math.max(descrBox.width, titleBox.width);
  descrLine.attr("x2", width + 3 * getConfig2().state.padding);
  g.insert("rect", ":first-child").attr("x", getConfig2().state.padding).attr("y", getConfig2().state.padding).attr("width", width + 2 * getConfig2().state.padding).attr("height", descrBox.height + titleHeight + 2 * getConfig2().state.padding).attr("rx", getConfig2().state.radius);
  return g;
}, "drawDescrState");
var addTitleAndBox = /* @__PURE__ */ __name((g, stateDef, altBkg) => {
  const pad = getConfig2().state.padding;
  const dblPad = 2 * getConfig2().state.padding;
  const orgBox = g.node().getBBox();
  const orgWidth = orgBox.width;
  const orgX = orgBox.x;
  const title = g.append("text").attr("x", 0).attr("y", getConfig2().state.titleShift).attr("font-size", getConfig2().state.fontSize).attr("class", "state-title").text(stateDef.id);
  const titleBox = title.node().getBBox();
  const titleWidth = titleBox.width + dblPad;
  let width = Math.max(titleWidth, orgWidth);
  if (width === orgWidth) {
    width = width + dblPad;
  }
  let startX;
  const graphBox = g.node().getBBox();
  if (stateDef.doc) {}
  startX = orgX - pad;
  if (titleWidth > orgWidth) {
    startX = (orgWidth - width) / 2 + pad;
  }
  if (Math.abs(orgX - graphBox.x) < pad && titleWidth > orgWidth) {
    startX = orgX - (titleWidth - orgWidth) / 2;
  }
  const lineY = 1 - getConfig2().state.textHeight;
  g.insert("rect", ":first-child").attr("x", startX).attr("y", lineY).attr("class", altBkg ? "alt-composit" : "composit").attr("width", width).attr("height", graphBox.height + getConfig2().state.textHeight + getConfig2().state.titleShift + 1).attr("rx", "0");
  title.attr("x", startX + pad);
  if (titleWidth <= orgWidth) {
    title.attr("x", orgX + (width - dblPad) / 2 - titleWidth / 2 + pad);
  }
  g.insert("rect", ":first-child").attr("x", startX).attr("y", getConfig2().state.titleShift - getConfig2().state.textHeight - getConfig2().state.padding).attr("width", width).attr("height", getConfig2().state.textHeight * 3).attr("rx", getConfig2().state.radius);
  g.insert("rect", ":first-child").attr("x", startX).attr("y", getConfig2().state.titleShift - getConfig2().state.textHeight - getConfig2().state.padding).attr("width", width).attr("height", graphBox.height + 3 + 2 * getConfig2().state.textHeight).attr("rx", getConfig2().state.radius);
  return g;
}, "addTitleAndBox");
var drawEndState = /* @__PURE__ */ __name((g) => {
  g.append("circle").attr("class", "end-state-outer").attr("r", getConfig2().state.sizeUnit + getConfig2().state.miniPadding).attr("cx", getConfig2().state.padding + getConfig2().state.sizeUnit + getConfig2().state.miniPadding).attr("cy", getConfig2().state.padding + getConfig2().state.sizeUnit + getConfig2().state.miniPadding);
  return g.append("circle").attr("class", "end-state-inner").attr("r", getConfig2().state.sizeUnit).attr("cx", getConfig2().state.padding + getConfig2().state.sizeUnit + 2).attr("cy", getConfig2().state.padding + getConfig2().state.sizeUnit + 2);
}, "drawEndState");
var drawForkJoinState = /* @__PURE__ */ __name((g, stateDef) => {
  let width = getConfig2().state.forkWidth;
  let height = getConfig2().state.forkHeight;
  if (stateDef.parentId) {
    let tmp = width;
    width = height;
    height = tmp;
  }
  return g.append("rect").style("stroke", "black").style("fill", "black").attr("width", width).attr("height", height).attr("x", getConfig2().state.padding).attr("y", getConfig2().state.padding);
}, "drawForkJoinState");
var _drawLongText = /* @__PURE__ */ __name((_text, x, y, g) => {
  let textHeight = 0;
  const textElem = g.append("text");
  textElem.style("text-anchor", "start");
  textElem.attr("class", "noteText");
  let text = _text.replace(/\r\n/g, "<br/>");
  text = text.replace(/\n/g, "<br/>");
  const lines = text.split(common_default.lineBreakRegex);
  let tHeight = 1.25 * getConfig2().state.noteMargin;
  for (const line2 of lines) {
    const txt = line2.trim();
    if (txt.length > 0) {
      const span = textElem.append("tspan");
      span.text(txt);
      if (tHeight === 0) {
        const textBounds = span.node().getBBox();
        tHeight += textBounds.height;
      }
      textHeight += tHeight;
      span.attr("x", x + getConfig2().state.noteMargin);
      span.attr("y", y + textHeight + 1.25 * getConfig2().state.noteMargin);
    }
  }
  return { textWidth: textElem.node().getBBox().width, textHeight };
}, "_drawLongText");
var drawNote = /* @__PURE__ */ __name((text, g) => {
  g.attr("class", "state-note");
  const note = g.append("rect").attr("x", 0).attr("y", getConfig2().state.padding);
  const rectElem = g.append("g");
  const { textWidth, textHeight } = _drawLongText(text, 0, 0, rectElem);
  note.attr("height", textHeight + 2 * getConfig2().state.noteMargin);
  note.attr("width", textWidth + getConfig2().state.noteMargin * 2);
  return note;
}, "drawNote");
var drawState = /* @__PURE__ */ __name(function(elem, stateDef) {
  const id = stateDef.id;
  const stateInfo = {
    id,
    label: stateDef.id,
    width: 0,
    height: 0
  };
  const g = elem.append("g").attr("id", id).attr("class", "stateGroup");
  if (stateDef.type === "start") {
    drawStartState(g);
  }
  if (stateDef.type === "end") {
    drawEndState(g);
  }
  if (stateDef.type === "fork" || stateDef.type === "join") {
    drawForkJoinState(g, stateDef);
  }
  if (stateDef.type === "note") {
    drawNote(stateDef.note.text, g);
  }
  if (stateDef.type === "divider") {
    drawDivider(g);
  }
  if (stateDef.type === "default" && stateDef.descriptions.length === 0) {
    drawSimpleState(g, stateDef);
  }
  if (stateDef.type === "default" && stateDef.descriptions.length > 0) {
    drawDescrState(g, stateDef);
  }
  const stateBox = g.node().getBBox();
  stateInfo.width = stateBox.width + 2 * getConfig2().state.padding;
  stateInfo.height = stateBox.height + 2 * getConfig2().state.padding;
  return stateInfo;
}, "drawState");
var edgeCount = 0;
var drawEdge = /* @__PURE__ */ __name(function(elem, path, relation) {
  const getRelationType = /* @__PURE__ */ __name(function(type) {
    switch (type) {
      case StateDB.relationType.AGGREGATION:
        return "aggregation";
      case StateDB.relationType.EXTENSION:
        return "extension";
      case StateDB.relationType.COMPOSITION:
        return "composition";
      case StateDB.relationType.DEPENDENCY:
        return "dependency";
    }
  }, "getRelationType");
  path.points = path.points.filter((p) => !Number.isNaN(p.y));
  const lineData = path.points;
  const lineFunction = line_default().x(function(d) {
    return d.x;
  }).y(function(d) {
    return d.y;
  }).curve(basis_default);
  const svgPath = elem.append("path").attr("d", lineFunction(lineData)).attr("id", "edge" + edgeCount).attr("class", "transition");
  let url = "";
  if (getConfig2().state.arrowMarkerAbsolute) {
    url = getUrl(true);
  }
  svgPath.attr("marker-end", "url(" + url + "#" + getRelationType(StateDB.relationType.DEPENDENCY) + "End)");
  if (relation.title !== undefined) {
    const label = elem.append("g").attr("class", "stateLabel");
    const { x, y } = utils_default.calcLabelPosition(path.points);
    const rows = common_default.getRows(relation.title);
    let titleHeight = 0;
    const titleRows = [];
    let maxWidth = 0;
    let minX = 0;
    for (let i = 0;i <= rows.length; i++) {
      const title = label.append("text").attr("text-anchor", "middle").text(rows[i]).attr("x", x).attr("y", y + titleHeight);
      const boundsTmp = title.node().getBBox();
      maxWidth = Math.max(maxWidth, boundsTmp.width);
      minX = Math.min(minX, boundsTmp.x);
      log.info(boundsTmp.x, x, y + titleHeight);
      if (titleHeight === 0) {
        const titleBox = title.node().getBBox();
        titleHeight = titleBox.height;
        log.info("Title height", titleHeight, y);
      }
      titleRows.push(title);
    }
    let boxHeight = titleHeight * rows.length;
    if (rows.length > 1) {
      const heightAdj = (rows.length - 1) * titleHeight * 0.5;
      titleRows.forEach((title, i) => title.attr("y", y + i * titleHeight - heightAdj));
      boxHeight = titleHeight * rows.length;
    }
    const bounds = label.node().getBBox();
    label.insert("rect", ":first-child").attr("class", "box").attr("x", x - maxWidth / 2 - getConfig2().state.padding / 2).attr("y", y - boxHeight / 2 - getConfig2().state.padding / 2 - 3.5).attr("width", maxWidth + getConfig2().state.padding).attr("height", boxHeight + getConfig2().state.padding);
    log.info(bounds);
  }
  edgeCount++;
}, "drawEdge");
var conf;
var transformationLog = {};
var setConf = /* @__PURE__ */ __name(function() {}, "setConf");
var insertMarkers = /* @__PURE__ */ __name(function(elem) {
  elem.append("defs").append("marker").attr("id", "dependencyEnd").attr("refX", 19).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 19,7 L9,13 L14,7 L9,1 Z");
}, "insertMarkers");
var draw = /* @__PURE__ */ __name(function(text, id, _version, diagObj) {
  conf = getConfig2().state;
  const securityLevel = getConfig2().securityLevel;
  let sandboxElement;
  if (securityLevel === "sandbox") {
    sandboxElement = select_default("#i" + id);
  }
  const root = securityLevel === "sandbox" ? select_default(sandboxElement.nodes()[0].contentDocument.body) : select_default("body");
  const doc = securityLevel === "sandbox" ? sandboxElement.nodes()[0].contentDocument : document;
  log.debug("Rendering diagram " + text);
  const diagram2 = root.select(`[id='${id}']`);
  insertMarkers(diagram2);
  const rootDoc = diagObj.db.getRootDoc();
  const rootG = diagram2.append("g").attr("id", id + "-root");
  renderDoc(rootDoc, rootG, undefined, false, root, doc, diagObj);
  const padding = conf.padding;
  const bounds = diagram2.node().getBBox();
  const width = bounds.width + padding * 2;
  const height = bounds.height + padding * 2;
  const svgWidth = width * 1.75;
  configureSvgSize(diagram2, height, svgWidth, conf.useMaxWidth);
  diagram2.attr("viewBox", `${bounds.x - conf.padding}  ${bounds.y - conf.padding} ` + width + " " + height);
}, "draw");
var getLabelWidth = /* @__PURE__ */ __name((text) => {
  return text ? text.length * conf.fontSizeFactor : 1;
}, "getLabelWidth");
var renderDoc = /* @__PURE__ */ __name((doc, diagram2, parentId, altBkg, root, domDocument, diagObj) => {
  const graph = new Graph({
    compound: true,
    multigraph: true
  });
  let i;
  let edgeFreeDoc = true;
  for (i = 0;i < doc.length; i++) {
    if (doc[i].stmt === "relation") {
      edgeFreeDoc = false;
      break;
    }
  }
  if (parentId) {
    graph.setGraph({
      rankdir: "LR",
      multigraph: true,
      compound: true,
      ranker: "tight-tree",
      ranksep: edgeFreeDoc ? 1 : conf.edgeLengthFactor,
      nodeSep: edgeFreeDoc ? 1 : 50,
      isMultiGraph: true
    });
  } else {
    graph.setGraph({
      rankdir: "TB",
      multigraph: true,
      compound: true,
      ranksep: edgeFreeDoc ? 1 : conf.edgeLengthFactor,
      nodeSep: edgeFreeDoc ? 1 : 50,
      ranker: "tight-tree",
      isMultiGraph: true
    });
  }
  graph.setDefaultEdgeLabel(function() {
    return {};
  });
  const states = diagObj.db.getStates();
  const relations = diagObj.db.getRelations();
  const keys = Object.keys(states);
  let first = true;
  for (const key of keys) {
    const stateDef = states[key];
    if (parentId) {
      stateDef.parentId = parentId;
    }
    let node;
    if (stateDef.doc) {
      let sub = diagram2.append("g").attr("id", stateDef.id).attr("class", "stateGroup");
      node = renderDoc(stateDef.doc, sub, stateDef.id, !altBkg, root, domDocument, diagObj);
      if (first) {
        sub = addTitleAndBox(sub, stateDef, altBkg);
        let boxBounds = sub.node().getBBox();
        node.width = boxBounds.width;
        node.height = boxBounds.height + conf.padding / 2;
        transformationLog[stateDef.id] = { y: conf.compositTitleSize };
      } else {
        let boxBounds = sub.node().getBBox();
        node.width = boxBounds.width;
        node.height = boxBounds.height;
      }
    } else {
      node = drawState(diagram2, stateDef, graph);
    }
    if (stateDef.note) {
      const noteDef = {
        descriptions: [],
        id: stateDef.id + "-note",
        note: stateDef.note,
        type: "note"
      };
      const note = drawState(diagram2, noteDef, graph);
      if (stateDef.note.position === "left of") {
        graph.setNode(node.id + "-note", note);
        graph.setNode(node.id, node);
      } else {
        graph.setNode(node.id, node);
        graph.setNode(node.id + "-note", note);
      }
      graph.setParent(node.id, node.id + "-group");
      graph.setParent(node.id + "-note", node.id + "-group");
    } else {
      graph.setNode(node.id, node);
    }
  }
  log.debug("Count=", graph.nodeCount(), graph);
  let cnt = 0;
  relations.forEach(function(relation) {
    cnt++;
    log.debug("Setting edge", relation);
    graph.setEdge(relation.id1, relation.id2, {
      relation,
      width: getLabelWidth(relation.title),
      height: conf.labelHeight * common_default.getRows(relation.title).length,
      labelpos: "c"
    }, "id" + cnt);
  });
  layout(graph);
  log.debug("Graph after layout", graph.nodes());
  const svgElem = diagram2.node();
  graph.nodes().forEach(function(v) {
    if (v !== undefined && graph.node(v) !== undefined) {
      log.warn("Node " + v + ": " + JSON.stringify(graph.node(v)));
      root.select("#" + svgElem.id + " #" + v).attr("transform", "translate(" + (graph.node(v).x - graph.node(v).width / 2) + "," + (graph.node(v).y + (transformationLog[v] ? transformationLog[v].y : 0) - graph.node(v).height / 2) + " )");
      root.select("#" + svgElem.id + " #" + v).attr("data-x-shift", graph.node(v).x - graph.node(v).width / 2);
      const dividers = domDocument.querySelectorAll("#" + svgElem.id + " #" + v + " .divider");
      dividers.forEach((divider) => {
        const parent = divider.parentElement;
        let pWidth = 0;
        let pShift = 0;
        if (parent) {
          if (parent.parentElement) {
            pWidth = parent.parentElement.getBBox().width;
          }
          pShift = parseInt(parent.getAttribute("data-x-shift"), 10);
          if (Number.isNaN(pShift)) {
            pShift = 0;
          }
        }
        divider.setAttribute("x1", 0 - pShift + 8);
        divider.setAttribute("x2", pWidth - pShift - 8);
      });
    } else {
      log.debug("No Node " + v + ": " + JSON.stringify(graph.node(v)));
    }
  });
  let stateBox = svgElem.getBBox();
  graph.edges().forEach(function(e) {
    if (e !== undefined && graph.edge(e) !== undefined) {
      log.debug("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(graph.edge(e)));
      drawEdge(diagram2, graph.edge(e), graph.edge(e).relation);
    }
  });
  stateBox = svgElem.getBBox();
  const stateInfo = {
    id: parentId ? parentId : "root",
    label: parentId ? parentId : "root",
    width: 0,
    height: 0
  };
  stateInfo.width = stateBox.width + 2 * conf.padding;
  stateInfo.height = stateBox.height + 2 * conf.padding;
  log.debug("Doc rendered", stateInfo, graph);
  return stateInfo;
}, "renderDoc");
var stateRenderer_default = {
  setConf,
  draw
};
var diagram = {
  parser: stateDiagram_default,
  get db() {
    return new StateDB(1);
  },
  renderer: stateRenderer_default,
  styles: styles_default,
  init: /* @__PURE__ */ __name((cnf) => {
    if (!cnf.state) {
      cnf.state = {};
    }
    cnf.state.arrowMarkerAbsolute = cnf.arrowMarkerAbsolute;
  }, "init")
};
export {
  diagram
};

//# debugId=8146ACE78715618464756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL3N0YXRlRGlhZ3JhbS1BSlJDQVJIVi5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiaW1wb3J0IHtcbiAgU3RhdGVEQixcbiAgc3RhdGVEaWFncmFtX2RlZmF1bHQsXG4gIHN0eWxlc19kZWZhdWx0XG59IGZyb20gXCIuL2NodW5rLUFRUDJENUVKLm1qc1wiO1xuaW1wb3J0IFwiLi9jaHVuay01NUlBQ0VCNi5tanNcIjtcbmltcG9ydCBcIi4vY2h1bmstMkozM1dUTUgubWpzXCI7XG5pbXBvcnQgXCIuL2NodW5rLUxaWEVEWkNBLm1qc1wiO1xuaW1wb3J0IFwiLi9jaHVuay1LU0NTNU42QS5tanNcIjtcbmltcG9ydCBcIi4vY2h1bmstQlNKUDdDQlAubWpzXCI7XG5pbXBvcnQgXCIuL2NodW5rLTNPUElGR0RFLm1qc1wiO1xuaW1wb3J0IFwiLi9jaHVuay1MNVpUTERXVi5tanNcIjtcbmltcG9ydCBcIi4vY2h1bmstTlpLMkQ3R1UubWpzXCI7XG5pbXBvcnQgXCIuL2NodW5rLU81Q0JFTDZPLm1qc1wiO1xuaW1wb3J0IHtcbiAgdXRpbHNfZGVmYXVsdFxufSBmcm9tIFwiLi9jaHVuay01WlFZSFhLVS5tanNcIjtcbmltcG9ydCB7XG4gIGNvbW1vbl9kZWZhdWx0LFxuICBjb25maWd1cmVTdmdTaXplLFxuICBnZXRDb25maWcyIGFzIGdldENvbmZpZyxcbiAgZ2V0VXJsXG59IGZyb20gXCIuL2NodW5rLUNTQ0lISzdRLm1qc1wiO1xuaW1wb3J0IHtcbiAgX19uYW1lLFxuICBsb2dcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIHNyYy9kaWFncmFtcy9zdGF0ZS9zdGF0ZVJlbmRlcmVyLmpzXG5pbXBvcnQgeyBzZWxlY3QgfSBmcm9tIFwiZDNcIjtcbmltcG9ydCB7IGxheW91dCBhcyBkYWdyZUxheW91dCB9IGZyb20gXCJkYWdyZS1kMy1lcy9zcmMvZGFncmUvaW5kZXguanNcIjtcbmltcG9ydCAqIGFzIGdyYXBobGliIGZyb20gXCJkYWdyZS1kMy1lcy9zcmMvZ3JhcGhsaWIvaW5kZXguanNcIjtcblxuLy8gc3JjL2RpYWdyYW1zL3N0YXRlL3NoYXBlcy5qc1xuaW1wb3J0IHsgbGluZSwgY3VydmVCYXNpcyB9IGZyb20gXCJkM1wiO1xudmFyIGRyYXdTdGFydFN0YXRlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZykgPT4gZy5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImNsYXNzXCIsIFwic3RhcnQtc3RhdGVcIikuYXR0cihcInJcIiwgZ2V0Q29uZmlnKCkuc3RhdGUuc2l6ZVVuaXQpLmF0dHIoXCJjeFwiLCBnZXRDb25maWcoKS5zdGF0ZS5wYWRkaW5nICsgZ2V0Q29uZmlnKCkuc3RhdGUuc2l6ZVVuaXQpLmF0dHIoXCJjeVwiLCBnZXRDb25maWcoKS5zdGF0ZS5wYWRkaW5nICsgZ2V0Q29uZmlnKCkuc3RhdGUuc2l6ZVVuaXQpLCBcImRyYXdTdGFydFN0YXRlXCIpO1xudmFyIGRyYXdEaXZpZGVyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZykgPT4gZy5hcHBlbmQoXCJsaW5lXCIpLnN0eWxlKFwic3Ryb2tlXCIsIFwiZ3JleVwiKS5zdHlsZShcInN0cm9rZS1kYXNoYXJyYXlcIiwgXCIzXCIpLmF0dHIoXCJ4MVwiLCBnZXRDb25maWcoKS5zdGF0ZS50ZXh0SGVpZ2h0KS5hdHRyKFwiY2xhc3NcIiwgXCJkaXZpZGVyXCIpLmF0dHIoXCJ4MlwiLCBnZXRDb25maWcoKS5zdGF0ZS50ZXh0SGVpZ2h0ICogMikuYXR0cihcInkxXCIsIDApLmF0dHIoXCJ5MlwiLCAwKSwgXCJkcmF3RGl2aWRlclwiKTtcbnZhciBkcmF3U2ltcGxlU3RhdGUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChnLCBzdGF0ZURlZikgPT4ge1xuICBjb25zdCBzdGF0ZSA9IGcuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwieFwiLCAyICogZ2V0Q29uZmlnKCkuc3RhdGUucGFkZGluZykuYXR0cihcInlcIiwgZ2V0Q29uZmlnKCkuc3RhdGUudGV4dEhlaWdodCArIDIgKiBnZXRDb25maWcoKS5zdGF0ZS5wYWRkaW5nKS5hdHRyKFwiZm9udC1zaXplXCIsIGdldENvbmZpZygpLnN0YXRlLmZvbnRTaXplKS5hdHRyKFwiY2xhc3NcIiwgXCJzdGF0ZS10aXRsZVwiKS50ZXh0KHN0YXRlRGVmLmlkKTtcbiAgY29uc3QgY2xhc3NCb3ggPSBzdGF0ZS5ub2RlKCkuZ2V0QkJveCgpO1xuICBnLmluc2VydChcInJlY3RcIiwgXCI6Zmlyc3QtY2hpbGRcIikuYXR0cihcInhcIiwgZ2V0Q29uZmlnKCkuc3RhdGUucGFkZGluZykuYXR0cihcInlcIiwgZ2V0Q29uZmlnKCkuc3RhdGUucGFkZGluZykuYXR0cihcIndpZHRoXCIsIGNsYXNzQm94LndpZHRoICsgMiAqIGdldENvbmZpZygpLnN0YXRlLnBhZGRpbmcpLmF0dHIoXCJoZWlnaHRcIiwgY2xhc3NCb3guaGVpZ2h0ICsgMiAqIGdldENvbmZpZygpLnN0YXRlLnBhZGRpbmcpLmF0dHIoXCJyeFwiLCBnZXRDb25maWcoKS5zdGF0ZS5yYWRpdXMpO1xuICByZXR1cm4gc3RhdGU7XG59LCBcImRyYXdTaW1wbGVTdGF0ZVwiKTtcbnZhciBkcmF3RGVzY3JTdGF0ZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGcsIHN0YXRlRGVmKSA9PiB7XG4gIGNvbnN0IGFkZFRzcGFuID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbih0ZXh0RWwsIHR4dCwgaXNGaXJzdDIpIHtcbiAgICBjb25zdCB0U3BhbiA9IHRleHRFbC5hcHBlbmQoXCJ0c3BhblwiKS5hdHRyKFwieFwiLCAyICogZ2V0Q29uZmlnKCkuc3RhdGUucGFkZGluZykudGV4dCh0eHQpO1xuICAgIGlmICghaXNGaXJzdDIpIHtcbiAgICAgIHRTcGFuLmF0dHIoXCJkeVwiLCBnZXRDb25maWcoKS5zdGF0ZS50ZXh0SGVpZ2h0KTtcbiAgICB9XG4gIH0sIFwiYWRkVHNwYW5cIik7XG4gIGNvbnN0IHRpdGxlID0gZy5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJ4XCIsIDIgKiBnZXRDb25maWcoKS5zdGF0ZS5wYWRkaW5nKS5hdHRyKFwieVwiLCBnZXRDb25maWcoKS5zdGF0ZS50ZXh0SGVpZ2h0ICsgMS4zICogZ2V0Q29uZmlnKCkuc3RhdGUucGFkZGluZykuYXR0cihcImZvbnQtc2l6ZVwiLCBnZXRDb25maWcoKS5zdGF0ZS5mb250U2l6ZSkuYXR0cihcImNsYXNzXCIsIFwic3RhdGUtdGl0bGVcIikudGV4dChzdGF0ZURlZi5kZXNjcmlwdGlvbnNbMF0pO1xuICBjb25zdCB0aXRsZUJveCA9IHRpdGxlLm5vZGUoKS5nZXRCQm94KCk7XG4gIGNvbnN0IHRpdGxlSGVpZ2h0ID0gdGl0bGVCb3guaGVpZ2h0O1xuICBjb25zdCBkZXNjcmlwdGlvbiA9IGcuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwieFwiLCBnZXRDb25maWcoKS5zdGF0ZS5wYWRkaW5nKS5hdHRyKFxuICAgIFwieVwiLFxuICAgIHRpdGxlSGVpZ2h0ICsgZ2V0Q29uZmlnKCkuc3RhdGUucGFkZGluZyAqIDAuNCArIGdldENvbmZpZygpLnN0YXRlLmRpdmlkZXJNYXJnaW4gKyBnZXRDb25maWcoKS5zdGF0ZS50ZXh0SGVpZ2h0XG4gICkuYXR0cihcImNsYXNzXCIsIFwic3RhdGUtZGVzY3JpcHRpb25cIik7XG4gIGxldCBpc0ZpcnN0ID0gdHJ1ZTtcbiAgbGV0IGlzU2Vjb25kID0gdHJ1ZTtcbiAgc3RhdGVEZWYuZGVzY3JpcHRpb25zLmZvckVhY2goZnVuY3Rpb24oZGVzY3IpIHtcbiAgICBpZiAoIWlzRmlyc3QpIHtcbiAgICAgIGFkZFRzcGFuKGRlc2NyaXB0aW9uLCBkZXNjciwgaXNTZWNvbmQpO1xuICAgICAgaXNTZWNvbmQgPSBmYWxzZTtcbiAgICB9XG4gICAgaXNGaXJzdCA9IGZhbHNlO1xuICB9KTtcbiAgY29uc3QgZGVzY3JMaW5lID0gZy5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJ4MVwiLCBnZXRDb25maWcoKS5zdGF0ZS5wYWRkaW5nKS5hdHRyKFwieTFcIiwgZ2V0Q29uZmlnKCkuc3RhdGUucGFkZGluZyArIHRpdGxlSGVpZ2h0ICsgZ2V0Q29uZmlnKCkuc3RhdGUuZGl2aWRlck1hcmdpbiAvIDIpLmF0dHIoXCJ5MlwiLCBnZXRDb25maWcoKS5zdGF0ZS5wYWRkaW5nICsgdGl0bGVIZWlnaHQgKyBnZXRDb25maWcoKS5zdGF0ZS5kaXZpZGVyTWFyZ2luIC8gMikuYXR0cihcImNsYXNzXCIsIFwiZGVzY3ItZGl2aWRlclwiKTtcbiAgY29uc3QgZGVzY3JCb3ggPSBkZXNjcmlwdGlvbi5ub2RlKCkuZ2V0QkJveCgpO1xuICBjb25zdCB3aWR0aCA9IE1hdGgubWF4KGRlc2NyQm94LndpZHRoLCB0aXRsZUJveC53aWR0aCk7XG4gIGRlc2NyTGluZS5hdHRyKFwieDJcIiwgd2lkdGggKyAzICogZ2V0Q29uZmlnKCkuc3RhdGUucGFkZGluZyk7XG4gIGcuaW5zZXJ0KFwicmVjdFwiLCBcIjpmaXJzdC1jaGlsZFwiKS5hdHRyKFwieFwiLCBnZXRDb25maWcoKS5zdGF0ZS5wYWRkaW5nKS5hdHRyKFwieVwiLCBnZXRDb25maWcoKS5zdGF0ZS5wYWRkaW5nKS5hdHRyKFwid2lkdGhcIiwgd2lkdGggKyAyICogZ2V0Q29uZmlnKCkuc3RhdGUucGFkZGluZykuYXR0cihcImhlaWdodFwiLCBkZXNjckJveC5oZWlnaHQgKyB0aXRsZUhlaWdodCArIDIgKiBnZXRDb25maWcoKS5zdGF0ZS5wYWRkaW5nKS5hdHRyKFwicnhcIiwgZ2V0Q29uZmlnKCkuc3RhdGUucmFkaXVzKTtcbiAgcmV0dXJuIGc7XG59LCBcImRyYXdEZXNjclN0YXRlXCIpO1xudmFyIGFkZFRpdGxlQW5kQm94ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZywgc3RhdGVEZWYsIGFsdEJrZykgPT4ge1xuICBjb25zdCBwYWQgPSBnZXRDb25maWcoKS5zdGF0ZS5wYWRkaW5nO1xuICBjb25zdCBkYmxQYWQgPSAyICogZ2V0Q29uZmlnKCkuc3RhdGUucGFkZGluZztcbiAgY29uc3Qgb3JnQm94ID0gZy5ub2RlKCkuZ2V0QkJveCgpO1xuICBjb25zdCBvcmdXaWR0aCA9IG9yZ0JveC53aWR0aDtcbiAgY29uc3Qgb3JnWCA9IG9yZ0JveC54O1xuICBjb25zdCB0aXRsZSA9IGcuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwieFwiLCAwKS5hdHRyKFwieVwiLCBnZXRDb25maWcoKS5zdGF0ZS50aXRsZVNoaWZ0KS5hdHRyKFwiZm9udC1zaXplXCIsIGdldENvbmZpZygpLnN0YXRlLmZvbnRTaXplKS5hdHRyKFwiY2xhc3NcIiwgXCJzdGF0ZS10aXRsZVwiKS50ZXh0KHN0YXRlRGVmLmlkKTtcbiAgY29uc3QgdGl0bGVCb3ggPSB0aXRsZS5ub2RlKCkuZ2V0QkJveCgpO1xuICBjb25zdCB0aXRsZVdpZHRoID0gdGl0bGVCb3gud2lkdGggKyBkYmxQYWQ7XG4gIGxldCB3aWR0aCA9IE1hdGgubWF4KHRpdGxlV2lkdGgsIG9yZ1dpZHRoKTtcbiAgaWYgKHdpZHRoID09PSBvcmdXaWR0aCkge1xuICAgIHdpZHRoID0gd2lkdGggKyBkYmxQYWQ7XG4gIH1cbiAgbGV0IHN0YXJ0WDtcbiAgY29uc3QgZ3JhcGhCb3ggPSBnLm5vZGUoKS5nZXRCQm94KCk7XG4gIGlmIChzdGF0ZURlZi5kb2MpIHtcbiAgfVxuICBzdGFydFggPSBvcmdYIC0gcGFkO1xuICBpZiAodGl0bGVXaWR0aCA+IG9yZ1dpZHRoKSB7XG4gICAgc3RhcnRYID0gKG9yZ1dpZHRoIC0gd2lkdGgpIC8gMiArIHBhZDtcbiAgfVxuICBpZiAoTWF0aC5hYnMob3JnWCAtIGdyYXBoQm94LngpIDwgcGFkICYmIHRpdGxlV2lkdGggPiBvcmdXaWR0aCkge1xuICAgIHN0YXJ0WCA9IG9yZ1ggLSAodGl0bGVXaWR0aCAtIG9yZ1dpZHRoKSAvIDI7XG4gIH1cbiAgY29uc3QgbGluZVkgPSAxIC0gZ2V0Q29uZmlnKCkuc3RhdGUudGV4dEhlaWdodDtcbiAgZy5pbnNlcnQoXCJyZWN0XCIsIFwiOmZpcnN0LWNoaWxkXCIpLmF0dHIoXCJ4XCIsIHN0YXJ0WCkuYXR0cihcInlcIiwgbGluZVkpLmF0dHIoXCJjbGFzc1wiLCBhbHRCa2cgPyBcImFsdC1jb21wb3NpdFwiIDogXCJjb21wb3NpdFwiKS5hdHRyKFwid2lkdGhcIiwgd2lkdGgpLmF0dHIoXG4gICAgXCJoZWlnaHRcIixcbiAgICBncmFwaEJveC5oZWlnaHQgKyBnZXRDb25maWcoKS5zdGF0ZS50ZXh0SGVpZ2h0ICsgZ2V0Q29uZmlnKCkuc3RhdGUudGl0bGVTaGlmdCArIDFcbiAgKS5hdHRyKFwicnhcIiwgXCIwXCIpO1xuICB0aXRsZS5hdHRyKFwieFwiLCBzdGFydFggKyBwYWQpO1xuICBpZiAodGl0bGVXaWR0aCA8PSBvcmdXaWR0aCkge1xuICAgIHRpdGxlLmF0dHIoXCJ4XCIsIG9yZ1ggKyAod2lkdGggLSBkYmxQYWQpIC8gMiAtIHRpdGxlV2lkdGggLyAyICsgcGFkKTtcbiAgfVxuICBnLmluc2VydChcInJlY3RcIiwgXCI6Zmlyc3QtY2hpbGRcIikuYXR0cihcInhcIiwgc3RhcnRYKS5hdHRyKFxuICAgIFwieVwiLFxuICAgIGdldENvbmZpZygpLnN0YXRlLnRpdGxlU2hpZnQgLSBnZXRDb25maWcoKS5zdGF0ZS50ZXh0SGVpZ2h0IC0gZ2V0Q29uZmlnKCkuc3RhdGUucGFkZGluZ1xuICApLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCkuYXR0cihcImhlaWdodFwiLCBnZXRDb25maWcoKS5zdGF0ZS50ZXh0SGVpZ2h0ICogMykuYXR0cihcInJ4XCIsIGdldENvbmZpZygpLnN0YXRlLnJhZGl1cyk7XG4gIGcuaW5zZXJ0KFwicmVjdFwiLCBcIjpmaXJzdC1jaGlsZFwiKS5hdHRyKFwieFwiLCBzdGFydFgpLmF0dHIoXG4gICAgXCJ5XCIsXG4gICAgZ2V0Q29uZmlnKCkuc3RhdGUudGl0bGVTaGlmdCAtIGdldENvbmZpZygpLnN0YXRlLnRleHRIZWlnaHQgLSBnZXRDb25maWcoKS5zdGF0ZS5wYWRkaW5nXG4gICkuYXR0cihcIndpZHRoXCIsIHdpZHRoKS5hdHRyKFwiaGVpZ2h0XCIsIGdyYXBoQm94LmhlaWdodCArIDMgKyAyICogZ2V0Q29uZmlnKCkuc3RhdGUudGV4dEhlaWdodCkuYXR0cihcInJ4XCIsIGdldENvbmZpZygpLnN0YXRlLnJhZGl1cyk7XG4gIHJldHVybiBnO1xufSwgXCJhZGRUaXRsZUFuZEJveFwiKTtcbnZhciBkcmF3RW5kU3RhdGUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChnKSA9PiB7XG4gIGcuYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJjbGFzc1wiLCBcImVuZC1zdGF0ZS1vdXRlclwiKS5hdHRyKFwiclwiLCBnZXRDb25maWcoKS5zdGF0ZS5zaXplVW5pdCArIGdldENvbmZpZygpLnN0YXRlLm1pbmlQYWRkaW5nKS5hdHRyKFxuICAgIFwiY3hcIixcbiAgICBnZXRDb25maWcoKS5zdGF0ZS5wYWRkaW5nICsgZ2V0Q29uZmlnKCkuc3RhdGUuc2l6ZVVuaXQgKyBnZXRDb25maWcoKS5zdGF0ZS5taW5pUGFkZGluZ1xuICApLmF0dHIoXG4gICAgXCJjeVwiLFxuICAgIGdldENvbmZpZygpLnN0YXRlLnBhZGRpbmcgKyBnZXRDb25maWcoKS5zdGF0ZS5zaXplVW5pdCArIGdldENvbmZpZygpLnN0YXRlLm1pbmlQYWRkaW5nXG4gICk7XG4gIHJldHVybiBnLmFwcGVuZChcImNpcmNsZVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJlbmQtc3RhdGUtaW5uZXJcIikuYXR0cihcInJcIiwgZ2V0Q29uZmlnKCkuc3RhdGUuc2l6ZVVuaXQpLmF0dHIoXCJjeFwiLCBnZXRDb25maWcoKS5zdGF0ZS5wYWRkaW5nICsgZ2V0Q29uZmlnKCkuc3RhdGUuc2l6ZVVuaXQgKyAyKS5hdHRyKFwiY3lcIiwgZ2V0Q29uZmlnKCkuc3RhdGUucGFkZGluZyArIGdldENvbmZpZygpLnN0YXRlLnNpemVVbml0ICsgMik7XG59LCBcImRyYXdFbmRTdGF0ZVwiKTtcbnZhciBkcmF3Rm9ya0pvaW5TdGF0ZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGcsIHN0YXRlRGVmKSA9PiB7XG4gIGxldCB3aWR0aCA9IGdldENvbmZpZygpLnN0YXRlLmZvcmtXaWR0aDtcbiAgbGV0IGhlaWdodCA9IGdldENvbmZpZygpLnN0YXRlLmZvcmtIZWlnaHQ7XG4gIGlmIChzdGF0ZURlZi5wYXJlbnRJZCkge1xuICAgIGxldCB0bXAgPSB3aWR0aDtcbiAgICB3aWR0aCA9IGhlaWdodDtcbiAgICBoZWlnaHQgPSB0bXA7XG4gIH1cbiAgcmV0dXJuIGcuYXBwZW5kKFwicmVjdFwiKS5zdHlsZShcInN0cm9rZVwiLCBcImJsYWNrXCIpLnN0eWxlKFwiZmlsbFwiLCBcImJsYWNrXCIpLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCkuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpLmF0dHIoXCJ4XCIsIGdldENvbmZpZygpLnN0YXRlLnBhZGRpbmcpLmF0dHIoXCJ5XCIsIGdldENvbmZpZygpLnN0YXRlLnBhZGRpbmcpO1xufSwgXCJkcmF3Rm9ya0pvaW5TdGF0ZVwiKTtcbnZhciBfZHJhd0xvbmdUZXh0ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoX3RleHQsIHgsIHksIGcpID0+IHtcbiAgbGV0IHRleHRIZWlnaHQgPSAwO1xuICBjb25zdCB0ZXh0RWxlbSA9IGcuYXBwZW5kKFwidGV4dFwiKTtcbiAgdGV4dEVsZW0uc3R5bGUoXCJ0ZXh0LWFuY2hvclwiLCBcInN0YXJ0XCIpO1xuICB0ZXh0RWxlbS5hdHRyKFwiY2xhc3NcIiwgXCJub3RlVGV4dFwiKTtcbiAgbGV0IHRleHQgPSBfdGV4dC5yZXBsYWNlKC9cXHJcXG4vZywgXCI8YnIvPlwiKTtcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXFxuL2csIFwiPGJyLz5cIik7XG4gIGNvbnN0IGxpbmVzID0gdGV4dC5zcGxpdChjb21tb25fZGVmYXVsdC5saW5lQnJlYWtSZWdleCk7XG4gIGxldCB0SGVpZ2h0ID0gMS4yNSAqIGdldENvbmZpZygpLnN0YXRlLm5vdGVNYXJnaW47XG4gIGZvciAoY29uc3QgbGluZTIgb2YgbGluZXMpIHtcbiAgICBjb25zdCB0eHQgPSBsaW5lMi50cmltKCk7XG4gICAgaWYgKHR4dC5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBzcGFuID0gdGV4dEVsZW0uYXBwZW5kKFwidHNwYW5cIik7XG4gICAgICBzcGFuLnRleHQodHh0KTtcbiAgICAgIGlmICh0SGVpZ2h0ID09PSAwKSB7XG4gICAgICAgIGNvbnN0IHRleHRCb3VuZHMgPSBzcGFuLm5vZGUoKS5nZXRCQm94KCk7XG4gICAgICAgIHRIZWlnaHQgKz0gdGV4dEJvdW5kcy5oZWlnaHQ7XG4gICAgICB9XG4gICAgICB0ZXh0SGVpZ2h0ICs9IHRIZWlnaHQ7XG4gICAgICBzcGFuLmF0dHIoXCJ4XCIsIHggKyBnZXRDb25maWcoKS5zdGF0ZS5ub3RlTWFyZ2luKTtcbiAgICAgIHNwYW4uYXR0cihcInlcIiwgeSArIHRleHRIZWlnaHQgKyAxLjI1ICogZ2V0Q29uZmlnKCkuc3RhdGUubm90ZU1hcmdpbik7XG4gICAgfVxuICB9XG4gIHJldHVybiB7IHRleHRXaWR0aDogdGV4dEVsZW0ubm9kZSgpLmdldEJCb3goKS53aWR0aCwgdGV4dEhlaWdodCB9O1xufSwgXCJfZHJhd0xvbmdUZXh0XCIpO1xudmFyIGRyYXdOb3RlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgodGV4dCwgZykgPT4ge1xuICBnLmF0dHIoXCJjbGFzc1wiLCBcInN0YXRlLW5vdGVcIik7XG4gIGNvbnN0IG5vdGUgPSBnLmFwcGVuZChcInJlY3RcIikuYXR0cihcInhcIiwgMCkuYXR0cihcInlcIiwgZ2V0Q29uZmlnKCkuc3RhdGUucGFkZGluZyk7XG4gIGNvbnN0IHJlY3RFbGVtID0gZy5hcHBlbmQoXCJnXCIpO1xuICBjb25zdCB7IHRleHRXaWR0aCwgdGV4dEhlaWdodCB9ID0gX2RyYXdMb25nVGV4dCh0ZXh0LCAwLCAwLCByZWN0RWxlbSk7XG4gIG5vdGUuYXR0cihcImhlaWdodFwiLCB0ZXh0SGVpZ2h0ICsgMiAqIGdldENvbmZpZygpLnN0YXRlLm5vdGVNYXJnaW4pO1xuICBub3RlLmF0dHIoXCJ3aWR0aFwiLCB0ZXh0V2lkdGggKyBnZXRDb25maWcoKS5zdGF0ZS5ub3RlTWFyZ2luICogMik7XG4gIHJldHVybiBub3RlO1xufSwgXCJkcmF3Tm90ZVwiKTtcbnZhciBkcmF3U3RhdGUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIHN0YXRlRGVmKSB7XG4gIGNvbnN0IGlkID0gc3RhdGVEZWYuaWQ7XG4gIGNvbnN0IHN0YXRlSW5mbyA9IHtcbiAgICBpZCxcbiAgICBsYWJlbDogc3RhdGVEZWYuaWQsXG4gICAgd2lkdGg6IDAsXG4gICAgaGVpZ2h0OiAwXG4gIH07XG4gIGNvbnN0IGcgPSBlbGVtLmFwcGVuZChcImdcIikuYXR0cihcImlkXCIsIGlkKS5hdHRyKFwiY2xhc3NcIiwgXCJzdGF0ZUdyb3VwXCIpO1xuICBpZiAoc3RhdGVEZWYudHlwZSA9PT0gXCJzdGFydFwiKSB7XG4gICAgZHJhd1N0YXJ0U3RhdGUoZyk7XG4gIH1cbiAgaWYgKHN0YXRlRGVmLnR5cGUgPT09IFwiZW5kXCIpIHtcbiAgICBkcmF3RW5kU3RhdGUoZyk7XG4gIH1cbiAgaWYgKHN0YXRlRGVmLnR5cGUgPT09IFwiZm9ya1wiIHx8IHN0YXRlRGVmLnR5cGUgPT09IFwiam9pblwiKSB7XG4gICAgZHJhd0ZvcmtKb2luU3RhdGUoZywgc3RhdGVEZWYpO1xuICB9XG4gIGlmIChzdGF0ZURlZi50eXBlID09PSBcIm5vdGVcIikge1xuICAgIGRyYXdOb3RlKHN0YXRlRGVmLm5vdGUudGV4dCwgZyk7XG4gIH1cbiAgaWYgKHN0YXRlRGVmLnR5cGUgPT09IFwiZGl2aWRlclwiKSB7XG4gICAgZHJhd0RpdmlkZXIoZyk7XG4gIH1cbiAgaWYgKHN0YXRlRGVmLnR5cGUgPT09IFwiZGVmYXVsdFwiICYmIHN0YXRlRGVmLmRlc2NyaXB0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICBkcmF3U2ltcGxlU3RhdGUoZywgc3RhdGVEZWYpO1xuICB9XG4gIGlmIChzdGF0ZURlZi50eXBlID09PSBcImRlZmF1bHRcIiAmJiBzdGF0ZURlZi5kZXNjcmlwdGlvbnMubGVuZ3RoID4gMCkge1xuICAgIGRyYXdEZXNjclN0YXRlKGcsIHN0YXRlRGVmKTtcbiAgfVxuICBjb25zdCBzdGF0ZUJveCA9IGcubm9kZSgpLmdldEJCb3goKTtcbiAgc3RhdGVJbmZvLndpZHRoID0gc3RhdGVCb3gud2lkdGggKyAyICogZ2V0Q29uZmlnKCkuc3RhdGUucGFkZGluZztcbiAgc3RhdGVJbmZvLmhlaWdodCA9IHN0YXRlQm94LmhlaWdodCArIDIgKiBnZXRDb25maWcoKS5zdGF0ZS5wYWRkaW5nO1xuICByZXR1cm4gc3RhdGVJbmZvO1xufSwgXCJkcmF3U3RhdGVcIik7XG52YXIgZWRnZUNvdW50ID0gMDtcbnZhciBkcmF3RWRnZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbSwgcGF0aCwgcmVsYXRpb24pIHtcbiAgY29uc3QgZ2V0UmVsYXRpb25UeXBlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbih0eXBlKSB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlIFN0YXRlREIucmVsYXRpb25UeXBlLkFHR1JFR0FUSU9OOlxuICAgICAgICByZXR1cm4gXCJhZ2dyZWdhdGlvblwiO1xuICAgICAgY2FzZSBTdGF0ZURCLnJlbGF0aW9uVHlwZS5FWFRFTlNJT046XG4gICAgICAgIHJldHVybiBcImV4dGVuc2lvblwiO1xuICAgICAgY2FzZSBTdGF0ZURCLnJlbGF0aW9uVHlwZS5DT01QT1NJVElPTjpcbiAgICAgICAgcmV0dXJuIFwiY29tcG9zaXRpb25cIjtcbiAgICAgIGNhc2UgU3RhdGVEQi5yZWxhdGlvblR5cGUuREVQRU5ERU5DWTpcbiAgICAgICAgcmV0dXJuIFwiZGVwZW5kZW5jeVwiO1xuICAgIH1cbiAgfSwgXCJnZXRSZWxhdGlvblR5cGVcIik7XG4gIHBhdGgucG9pbnRzID0gcGF0aC5wb2ludHMuZmlsdGVyKChwKSA9PiAhTnVtYmVyLmlzTmFOKHAueSkpO1xuICBjb25zdCBsaW5lRGF0YSA9IHBhdGgucG9pbnRzO1xuICBjb25zdCBsaW5lRnVuY3Rpb24gPSBsaW5lKCkueChmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQueDtcbiAgfSkueShmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQueTtcbiAgfSkuY3VydmUoY3VydmVCYXNpcyk7XG4gIGNvbnN0IHN2Z1BhdGggPSBlbGVtLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgbGluZUZ1bmN0aW9uKGxpbmVEYXRhKSkuYXR0cihcImlkXCIsIFwiZWRnZVwiICsgZWRnZUNvdW50KS5hdHRyKFwiY2xhc3NcIiwgXCJ0cmFuc2l0aW9uXCIpO1xuICBsZXQgdXJsID0gXCJcIjtcbiAgaWYgKGdldENvbmZpZygpLnN0YXRlLmFycm93TWFya2VyQWJzb2x1dGUpIHtcbiAgICB1cmwgPSBnZXRVcmwodHJ1ZSk7XG4gIH1cbiAgc3ZnUGF0aC5hdHRyKFxuICAgIFwibWFya2VyLWVuZFwiLFxuICAgIFwidXJsKFwiICsgdXJsICsgXCIjXCIgKyBnZXRSZWxhdGlvblR5cGUoU3RhdGVEQi5yZWxhdGlvblR5cGUuREVQRU5ERU5DWSkgKyBcIkVuZClcIlxuICApO1xuICBpZiAocmVsYXRpb24udGl0bGUgIT09IHZvaWQgMCkge1xuICAgIGNvbnN0IGxhYmVsID0gZWxlbS5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcInN0YXRlTGFiZWxcIik7XG4gICAgY29uc3QgeyB4LCB5IH0gPSB1dGlsc19kZWZhdWx0LmNhbGNMYWJlbFBvc2l0aW9uKHBhdGgucG9pbnRzKTtcbiAgICBjb25zdCByb3dzID0gY29tbW9uX2RlZmF1bHQuZ2V0Um93cyhyZWxhdGlvbi50aXRsZSk7XG4gICAgbGV0IHRpdGxlSGVpZ2h0ID0gMDtcbiAgICBjb25zdCB0aXRsZVJvd3MgPSBbXTtcbiAgICBsZXQgbWF4V2lkdGggPSAwO1xuICAgIGxldCBtaW5YID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8PSByb3dzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCB0aXRsZSA9IGxhYmVsLmFwcGVuZChcInRleHRcIikuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpLnRleHQocm93c1tpXSkuYXR0cihcInhcIiwgeCkuYXR0cihcInlcIiwgeSArIHRpdGxlSGVpZ2h0KTtcbiAgICAgIGNvbnN0IGJvdW5kc1RtcCA9IHRpdGxlLm5vZGUoKS5nZXRCQm94KCk7XG4gICAgICBtYXhXaWR0aCA9IE1hdGgubWF4KG1heFdpZHRoLCBib3VuZHNUbXAud2lkdGgpO1xuICAgICAgbWluWCA9IE1hdGgubWluKG1pblgsIGJvdW5kc1RtcC54KTtcbiAgICAgIGxvZy5pbmZvKGJvdW5kc1RtcC54LCB4LCB5ICsgdGl0bGVIZWlnaHQpO1xuICAgICAgaWYgKHRpdGxlSGVpZ2h0ID09PSAwKSB7XG4gICAgICAgIGNvbnN0IHRpdGxlQm94ID0gdGl0bGUubm9kZSgpLmdldEJCb3goKTtcbiAgICAgICAgdGl0bGVIZWlnaHQgPSB0aXRsZUJveC5oZWlnaHQ7XG4gICAgICAgIGxvZy5pbmZvKFwiVGl0bGUgaGVpZ2h0XCIsIHRpdGxlSGVpZ2h0LCB5KTtcbiAgICAgIH1cbiAgICAgIHRpdGxlUm93cy5wdXNoKHRpdGxlKTtcbiAgICB9XG4gICAgbGV0IGJveEhlaWdodCA9IHRpdGxlSGVpZ2h0ICogcm93cy5sZW5ndGg7XG4gICAgaWYgKHJvd3MubGVuZ3RoID4gMSkge1xuICAgICAgY29uc3QgaGVpZ2h0QWRqID0gKHJvd3MubGVuZ3RoIC0gMSkgKiB0aXRsZUhlaWdodCAqIDAuNTtcbiAgICAgIHRpdGxlUm93cy5mb3JFYWNoKCh0aXRsZSwgaSkgPT4gdGl0bGUuYXR0cihcInlcIiwgeSArIGkgKiB0aXRsZUhlaWdodCAtIGhlaWdodEFkaikpO1xuICAgICAgYm94SGVpZ2h0ID0gdGl0bGVIZWlnaHQgKiByb3dzLmxlbmd0aDtcbiAgICB9XG4gICAgY29uc3QgYm91bmRzID0gbGFiZWwubm9kZSgpLmdldEJCb3goKTtcbiAgICBsYWJlbC5pbnNlcnQoXCJyZWN0XCIsIFwiOmZpcnN0LWNoaWxkXCIpLmF0dHIoXCJjbGFzc1wiLCBcImJveFwiKS5hdHRyKFwieFwiLCB4IC0gbWF4V2lkdGggLyAyIC0gZ2V0Q29uZmlnKCkuc3RhdGUucGFkZGluZyAvIDIpLmF0dHIoXCJ5XCIsIHkgLSBib3hIZWlnaHQgLyAyIC0gZ2V0Q29uZmlnKCkuc3RhdGUucGFkZGluZyAvIDIgLSAzLjUpLmF0dHIoXCJ3aWR0aFwiLCBtYXhXaWR0aCArIGdldENvbmZpZygpLnN0YXRlLnBhZGRpbmcpLmF0dHIoXCJoZWlnaHRcIiwgYm94SGVpZ2h0ICsgZ2V0Q29uZmlnKCkuc3RhdGUucGFkZGluZyk7XG4gICAgbG9nLmluZm8oYm91bmRzKTtcbiAgfVxuICBlZGdlQ291bnQrKztcbn0sIFwiZHJhd0VkZ2VcIik7XG5cbi8vIHNyYy9kaWFncmFtcy9zdGF0ZS9zdGF0ZVJlbmRlcmVyLmpzXG52YXIgY29uZjtcbnZhciB0cmFuc2Zvcm1hdGlvbkxvZyA9IHt9O1xudmFyIHNldENvbmYgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xufSwgXCJzZXRDb25mXCIpO1xudmFyIGluc2VydE1hcmtlcnMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0pIHtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgXCJkZXBlbmRlbmN5RW5kXCIpLmF0dHIoXCJyZWZYXCIsIDE5KS5hdHRyKFwicmVmWVwiLCA3KS5hdHRyKFwibWFya2VyV2lkdGhcIiwgMjApLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMjgpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNIDE5LDcgTDksMTMgTDE0LDcgTDksMSBaXCIpO1xufSwgXCJpbnNlcnRNYXJrZXJzXCIpO1xudmFyIGRyYXcgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHRleHQsIGlkLCBfdmVyc2lvbiwgZGlhZ09iaikge1xuICBjb25mID0gZ2V0Q29uZmlnKCkuc3RhdGU7XG4gIGNvbnN0IHNlY3VyaXR5TGV2ZWwgPSBnZXRDb25maWcoKS5zZWN1cml0eUxldmVsO1xuICBsZXQgc2FuZGJveEVsZW1lbnQ7XG4gIGlmIChzZWN1cml0eUxldmVsID09PSBcInNhbmRib3hcIikge1xuICAgIHNhbmRib3hFbGVtZW50ID0gc2VsZWN0KFwiI2lcIiArIGlkKTtcbiAgfVxuICBjb25zdCByb290ID0gc2VjdXJpdHlMZXZlbCA9PT0gXCJzYW5kYm94XCIgPyBzZWxlY3Qoc2FuZGJveEVsZW1lbnQubm9kZXMoKVswXS5jb250ZW50RG9jdW1lbnQuYm9keSkgOiBzZWxlY3QoXCJib2R5XCIpO1xuICBjb25zdCBkb2MgPSBzZWN1cml0eUxldmVsID09PSBcInNhbmRib3hcIiA/IHNhbmRib3hFbGVtZW50Lm5vZGVzKClbMF0uY29udGVudERvY3VtZW50IDogZG9jdW1lbnQ7XG4gIGxvZy5kZWJ1ZyhcIlJlbmRlcmluZyBkaWFncmFtIFwiICsgdGV4dCk7XG4gIGNvbnN0IGRpYWdyYW0yID0gcm9vdC5zZWxlY3QoYFtpZD0nJHtpZH0nXWApO1xuICBpbnNlcnRNYXJrZXJzKGRpYWdyYW0yKTtcbiAgY29uc3Qgcm9vdERvYyA9IGRpYWdPYmouZGIuZ2V0Um9vdERvYygpO1xuICBjb25zdCByb290RyA9IGRpYWdyYW0yLmFwcGVuZChcImdcIikuYXR0cihcImlkXCIsIGlkICsgXCItcm9vdFwiKTtcbiAgcmVuZGVyRG9jKHJvb3REb2MsIHJvb3RHLCB2b2lkIDAsIGZhbHNlLCByb290LCBkb2MsIGRpYWdPYmopO1xuICBjb25zdCBwYWRkaW5nID0gY29uZi5wYWRkaW5nO1xuICBjb25zdCBib3VuZHMgPSBkaWFncmFtMi5ub2RlKCkuZ2V0QkJveCgpO1xuICBjb25zdCB3aWR0aCA9IGJvdW5kcy53aWR0aCArIHBhZGRpbmcgKiAyO1xuICBjb25zdCBoZWlnaHQgPSBib3VuZHMuaGVpZ2h0ICsgcGFkZGluZyAqIDI7XG4gIGNvbnN0IHN2Z1dpZHRoID0gd2lkdGggKiAxLjc1O1xuICBjb25maWd1cmVTdmdTaXplKGRpYWdyYW0yLCBoZWlnaHQsIHN2Z1dpZHRoLCBjb25mLnVzZU1heFdpZHRoKTtcbiAgZGlhZ3JhbTIuYXR0cihcbiAgICBcInZpZXdCb3hcIixcbiAgICBgJHtib3VuZHMueCAtIGNvbmYucGFkZGluZ30gICR7Ym91bmRzLnkgLSBjb25mLnBhZGRpbmd9IGAgKyB3aWR0aCArIFwiIFwiICsgaGVpZ2h0XG4gICk7XG59LCBcImRyYXdcIik7XG52YXIgZ2V0TGFiZWxXaWR0aCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHRleHQpID0+IHtcbiAgcmV0dXJuIHRleHQgPyB0ZXh0Lmxlbmd0aCAqIGNvbmYuZm9udFNpemVGYWN0b3IgOiAxO1xufSwgXCJnZXRMYWJlbFdpZHRoXCIpO1xudmFyIHJlbmRlckRvYyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGRvYywgZGlhZ3JhbTIsIHBhcmVudElkLCBhbHRCa2csIHJvb3QsIGRvbURvY3VtZW50LCBkaWFnT2JqKSA9PiB7XG4gIGNvbnN0IGdyYXBoID0gbmV3IGdyYXBobGliLkdyYXBoKHtcbiAgICBjb21wb3VuZDogdHJ1ZSxcbiAgICBtdWx0aWdyYXBoOiB0cnVlXG4gIH0pO1xuICBsZXQgaTtcbiAgbGV0IGVkZ2VGcmVlRG9jID0gdHJ1ZTtcbiAgZm9yIChpID0gMDsgaSA8IGRvYy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChkb2NbaV0uc3RtdCA9PT0gXCJyZWxhdGlvblwiKSB7XG4gICAgICBlZGdlRnJlZURvYyA9IGZhbHNlO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGlmIChwYXJlbnRJZCkge1xuICAgIGdyYXBoLnNldEdyYXBoKHtcbiAgICAgIHJhbmtkaXI6IFwiTFJcIixcbiAgICAgIG11bHRpZ3JhcGg6IHRydWUsXG4gICAgICBjb21wb3VuZDogdHJ1ZSxcbiAgICAgIC8vIGFjeWNsaWNlcjogJ2dyZWVkeScsXG4gICAgICByYW5rZXI6IFwidGlnaHQtdHJlZVwiLFxuICAgICAgcmFua3NlcDogZWRnZUZyZWVEb2MgPyAxIDogY29uZi5lZGdlTGVuZ3RoRmFjdG9yLFxuICAgICAgbm9kZVNlcDogZWRnZUZyZWVEb2MgPyAxIDogNTAsXG4gICAgICBpc011bHRpR3JhcGg6IHRydWVcbiAgICAgIC8vIHJhbmtzZXA6IDUsXG4gICAgICAvLyBub2Rlc2VwOiAxXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgZ3JhcGguc2V0R3JhcGgoe1xuICAgICAgcmFua2RpcjogXCJUQlwiLFxuICAgICAgbXVsdGlncmFwaDogdHJ1ZSxcbiAgICAgIGNvbXBvdW5kOiB0cnVlLFxuICAgICAgLy8gaXNDb21wb3VuZDogdHJ1ZSxcbiAgICAgIC8vIGFjeWNsaWNlcjogJ2dyZWVkeScsXG4gICAgICAvLyByYW5rZXI6ICdsb25nZXN0LXBhdGgnXG4gICAgICByYW5rc2VwOiBlZGdlRnJlZURvYyA/IDEgOiBjb25mLmVkZ2VMZW5ndGhGYWN0b3IsXG4gICAgICBub2RlU2VwOiBlZGdlRnJlZURvYyA/IDEgOiA1MCxcbiAgICAgIHJhbmtlcjogXCJ0aWdodC10cmVlXCIsXG4gICAgICAvLyByYW5rZXI6ICduZXR3b3JrLXNpbXBsZXgnXG4gICAgICBpc011bHRpR3JhcGg6IHRydWVcbiAgICB9KTtcbiAgfVxuICBncmFwaC5zZXREZWZhdWx0RWRnZUxhYmVsKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7fTtcbiAgfSk7XG4gIGNvbnN0IHN0YXRlcyA9IGRpYWdPYmouZGIuZ2V0U3RhdGVzKCk7XG4gIGNvbnN0IHJlbGF0aW9ucyA9IGRpYWdPYmouZGIuZ2V0UmVsYXRpb25zKCk7XG4gIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhzdGF0ZXMpO1xuICBsZXQgZmlyc3QgPSB0cnVlO1xuICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgY29uc3Qgc3RhdGVEZWYgPSBzdGF0ZXNba2V5XTtcbiAgICBpZiAocGFyZW50SWQpIHtcbiAgICAgIHN0YXRlRGVmLnBhcmVudElkID0gcGFyZW50SWQ7XG4gICAgfVxuICAgIGxldCBub2RlO1xuICAgIGlmIChzdGF0ZURlZi5kb2MpIHtcbiAgICAgIGxldCBzdWIgPSBkaWFncmFtMi5hcHBlbmQoXCJnXCIpLmF0dHIoXCJpZFwiLCBzdGF0ZURlZi5pZCkuYXR0cihcImNsYXNzXCIsIFwic3RhdGVHcm91cFwiKTtcbiAgICAgIG5vZGUgPSByZW5kZXJEb2Moc3RhdGVEZWYuZG9jLCBzdWIsIHN0YXRlRGVmLmlkLCAhYWx0QmtnLCByb290LCBkb21Eb2N1bWVudCwgZGlhZ09iaik7XG4gICAgICBpZiAoZmlyc3QpIHtcbiAgICAgICAgc3ViID0gYWRkVGl0bGVBbmRCb3goc3ViLCBzdGF0ZURlZiwgYWx0QmtnKTtcbiAgICAgICAgbGV0IGJveEJvdW5kcyA9IHN1Yi5ub2RlKCkuZ2V0QkJveCgpO1xuICAgICAgICBub2RlLndpZHRoID0gYm94Qm91bmRzLndpZHRoO1xuICAgICAgICBub2RlLmhlaWdodCA9IGJveEJvdW5kcy5oZWlnaHQgKyBjb25mLnBhZGRpbmcgLyAyO1xuICAgICAgICB0cmFuc2Zvcm1hdGlvbkxvZ1tzdGF0ZURlZi5pZF0gPSB7IHk6IGNvbmYuY29tcG9zaXRUaXRsZVNpemUgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBib3hCb3VuZHMgPSBzdWIubm9kZSgpLmdldEJCb3goKTtcbiAgICAgICAgbm9kZS53aWR0aCA9IGJveEJvdW5kcy53aWR0aDtcbiAgICAgICAgbm9kZS5oZWlnaHQgPSBib3hCb3VuZHMuaGVpZ2h0O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBub2RlID0gZHJhd1N0YXRlKGRpYWdyYW0yLCBzdGF0ZURlZiwgZ3JhcGgpO1xuICAgIH1cbiAgICBpZiAoc3RhdGVEZWYubm90ZSkge1xuICAgICAgY29uc3Qgbm90ZURlZiA9IHtcbiAgICAgICAgZGVzY3JpcHRpb25zOiBbXSxcbiAgICAgICAgaWQ6IHN0YXRlRGVmLmlkICsgXCItbm90ZVwiLFxuICAgICAgICBub3RlOiBzdGF0ZURlZi5ub3RlLFxuICAgICAgICB0eXBlOiBcIm5vdGVcIlxuICAgICAgfTtcbiAgICAgIGNvbnN0IG5vdGUgPSBkcmF3U3RhdGUoZGlhZ3JhbTIsIG5vdGVEZWYsIGdyYXBoKTtcbiAgICAgIGlmIChzdGF0ZURlZi5ub3RlLnBvc2l0aW9uID09PSBcImxlZnQgb2ZcIikge1xuICAgICAgICBncmFwaC5zZXROb2RlKG5vZGUuaWQgKyBcIi1ub3RlXCIsIG5vdGUpO1xuICAgICAgICBncmFwaC5zZXROb2RlKG5vZGUuaWQsIG5vZGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZ3JhcGguc2V0Tm9kZShub2RlLmlkLCBub2RlKTtcbiAgICAgICAgZ3JhcGguc2V0Tm9kZShub2RlLmlkICsgXCItbm90ZVwiLCBub3RlKTtcbiAgICAgIH1cbiAgICAgIGdyYXBoLnNldFBhcmVudChub2RlLmlkLCBub2RlLmlkICsgXCItZ3JvdXBcIik7XG4gICAgICBncmFwaC5zZXRQYXJlbnQobm9kZS5pZCArIFwiLW5vdGVcIiwgbm9kZS5pZCArIFwiLWdyb3VwXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBncmFwaC5zZXROb2RlKG5vZGUuaWQsIG5vZGUpO1xuICAgIH1cbiAgfVxuICBsb2cuZGVidWcoXCJDb3VudD1cIiwgZ3JhcGgubm9kZUNvdW50KCksIGdyYXBoKTtcbiAgbGV0IGNudCA9IDA7XG4gIHJlbGF0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHJlbGF0aW9uKSB7XG4gICAgY250Kys7XG4gICAgbG9nLmRlYnVnKFwiU2V0dGluZyBlZGdlXCIsIHJlbGF0aW9uKTtcbiAgICBncmFwaC5zZXRFZGdlKFxuICAgICAgcmVsYXRpb24uaWQxLFxuICAgICAgcmVsYXRpb24uaWQyLFxuICAgICAge1xuICAgICAgICByZWxhdGlvbixcbiAgICAgICAgd2lkdGg6IGdldExhYmVsV2lkdGgocmVsYXRpb24udGl0bGUpLFxuICAgICAgICBoZWlnaHQ6IGNvbmYubGFiZWxIZWlnaHQgKiBjb21tb25fZGVmYXVsdC5nZXRSb3dzKHJlbGF0aW9uLnRpdGxlKS5sZW5ndGgsXG4gICAgICAgIGxhYmVscG9zOiBcImNcIlxuICAgICAgfSxcbiAgICAgIFwiaWRcIiArIGNudFxuICAgICk7XG4gIH0pO1xuICBkYWdyZUxheW91dChncmFwaCk7XG4gIGxvZy5kZWJ1ZyhcIkdyYXBoIGFmdGVyIGxheW91dFwiLCBncmFwaC5ub2RlcygpKTtcbiAgY29uc3Qgc3ZnRWxlbSA9IGRpYWdyYW0yLm5vZGUoKTtcbiAgZ3JhcGgubm9kZXMoKS5mb3JFYWNoKGZ1bmN0aW9uKHYpIHtcbiAgICBpZiAodiAhPT0gdm9pZCAwICYmIGdyYXBoLm5vZGUodikgIT09IHZvaWQgMCkge1xuICAgICAgbG9nLndhcm4oXCJOb2RlIFwiICsgdiArIFwiOiBcIiArIEpTT04uc3RyaW5naWZ5KGdyYXBoLm5vZGUodikpKTtcbiAgICAgIHJvb3Quc2VsZWN0KFwiI1wiICsgc3ZnRWxlbS5pZCArIFwiICNcIiArIHYpLmF0dHIoXG4gICAgICAgIFwidHJhbnNmb3JtXCIsXG4gICAgICAgIFwidHJhbnNsYXRlKFwiICsgKGdyYXBoLm5vZGUodikueCAtIGdyYXBoLm5vZGUodikud2lkdGggLyAyKSArIFwiLFwiICsgKGdyYXBoLm5vZGUodikueSArICh0cmFuc2Zvcm1hdGlvbkxvZ1t2XSA/IHRyYW5zZm9ybWF0aW9uTG9nW3ZdLnkgOiAwKSAtIGdyYXBoLm5vZGUodikuaGVpZ2h0IC8gMikgKyBcIiApXCJcbiAgICAgICk7XG4gICAgICByb290LnNlbGVjdChcIiNcIiArIHN2Z0VsZW0uaWQgKyBcIiAjXCIgKyB2KS5hdHRyKFwiZGF0YS14LXNoaWZ0XCIsIGdyYXBoLm5vZGUodikueCAtIGdyYXBoLm5vZGUodikud2lkdGggLyAyKTtcbiAgICAgIGNvbnN0IGRpdmlkZXJzID0gZG9tRG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIiNcIiArIHN2Z0VsZW0uaWQgKyBcIiAjXCIgKyB2ICsgXCIgLmRpdmlkZXJcIik7XG4gICAgICBkaXZpZGVycy5mb3JFYWNoKChkaXZpZGVyKSA9PiB7XG4gICAgICAgIGNvbnN0IHBhcmVudCA9IGRpdmlkZXIucGFyZW50RWxlbWVudDtcbiAgICAgICAgbGV0IHBXaWR0aCA9IDA7XG4gICAgICAgIGxldCBwU2hpZnQgPSAwO1xuICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgaWYgKHBhcmVudC5wYXJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICBwV2lkdGggPSBwYXJlbnQucGFyZW50RWxlbWVudC5nZXRCQm94KCkud2lkdGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBTaGlmdCA9IHBhcnNlSW50KHBhcmVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXgtc2hpZnRcIiksIDEwKTtcbiAgICAgICAgICBpZiAoTnVtYmVyLmlzTmFOKHBTaGlmdCkpIHtcbiAgICAgICAgICAgIHBTaGlmdCA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGRpdmlkZXIuc2V0QXR0cmlidXRlKFwieDFcIiwgMCAtIHBTaGlmdCArIDgpO1xuICAgICAgICBkaXZpZGVyLnNldEF0dHJpYnV0ZShcIngyXCIsIHBXaWR0aCAtIHBTaGlmdCAtIDgpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZy5kZWJ1ZyhcIk5vIE5vZGUgXCIgKyB2ICsgXCI6IFwiICsgSlNPTi5zdHJpbmdpZnkoZ3JhcGgubm9kZSh2KSkpO1xuICAgIH1cbiAgfSk7XG4gIGxldCBzdGF0ZUJveCA9IHN2Z0VsZW0uZ2V0QkJveCgpO1xuICBncmFwaC5lZGdlcygpLmZvckVhY2goZnVuY3Rpb24oZSkge1xuICAgIGlmIChlICE9PSB2b2lkIDAgJiYgZ3JhcGguZWRnZShlKSAhPT0gdm9pZCAwKSB7XG4gICAgICBsb2cuZGVidWcoXCJFZGdlIFwiICsgZS52ICsgXCIgLT4gXCIgKyBlLncgKyBcIjogXCIgKyBKU09OLnN0cmluZ2lmeShncmFwaC5lZGdlKGUpKSk7XG4gICAgICBkcmF3RWRnZShkaWFncmFtMiwgZ3JhcGguZWRnZShlKSwgZ3JhcGguZWRnZShlKS5yZWxhdGlvbik7XG4gICAgfVxuICB9KTtcbiAgc3RhdGVCb3ggPSBzdmdFbGVtLmdldEJCb3goKTtcbiAgY29uc3Qgc3RhdGVJbmZvID0ge1xuICAgIGlkOiBwYXJlbnRJZCA/IHBhcmVudElkIDogXCJyb290XCIsXG4gICAgbGFiZWw6IHBhcmVudElkID8gcGFyZW50SWQgOiBcInJvb3RcIixcbiAgICB3aWR0aDogMCxcbiAgICBoZWlnaHQ6IDBcbiAgfTtcbiAgc3RhdGVJbmZvLndpZHRoID0gc3RhdGVCb3gud2lkdGggKyAyICogY29uZi5wYWRkaW5nO1xuICBzdGF0ZUluZm8uaGVpZ2h0ID0gc3RhdGVCb3guaGVpZ2h0ICsgMiAqIGNvbmYucGFkZGluZztcbiAgbG9nLmRlYnVnKFwiRG9jIHJlbmRlcmVkXCIsIHN0YXRlSW5mbywgZ3JhcGgpO1xuICByZXR1cm4gc3RhdGVJbmZvO1xufSwgXCJyZW5kZXJEb2NcIik7XG52YXIgc3RhdGVSZW5kZXJlcl9kZWZhdWx0ID0ge1xuICBzZXRDb25mLFxuICBkcmF3XG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMvc3RhdGUvc3RhdGVEaWFncmFtLnRzXG52YXIgZGlhZ3JhbSA9IHtcbiAgcGFyc2VyOiBzdGF0ZURpYWdyYW1fZGVmYXVsdCxcbiAgZ2V0IGRiKCkge1xuICAgIHJldHVybiBuZXcgU3RhdGVEQigxKTtcbiAgfSxcbiAgcmVuZGVyZXI6IHN0YXRlUmVuZGVyZXJfZGVmYXVsdCxcbiAgc3R5bGVzOiBzdHlsZXNfZGVmYXVsdCxcbiAgaW5pdDogLyogQF9fUFVSRV9fICovIF9fbmFtZSgoY25mKSA9PiB7XG4gICAgaWYgKCFjbmYuc3RhdGUpIHtcbiAgICAgIGNuZi5zdGF0ZSA9IHt9O1xuICAgIH1cbiAgICBjbmYuc3RhdGUuYXJyb3dNYXJrZXJBYnNvbHV0ZSA9IGNuZi5hcnJvd01h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QUM7QUFBQSxPQUMvQztBQUFBLElBQ0gsRUFBTztBQUFBLE1BQ0wsSUFBSSxNQUFNLGFBQWEsSUFBSSxPQUFPLEtBQUssVUFBVSxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFBQTtBQUFBLEdBRWxFO0FBQUEsRUFDRCxJQUFJLFdBQVcsUUFBUSxRQUFRO0FBQUEsRUFDL0IsTUFBTSxNQUFNLEVBQUUsUUFBUSxRQUFRLENBQUMsR0FBRztBQUFBLElBQ2hDLElBQUksTUFBVyxhQUFLLE1BQU0sS0FBSyxDQUFDLE1BQVcsV0FBRztBQUFBLE1BQzVDLElBQUksTUFBTSxVQUFVLEVBQUUsSUFBSSxTQUFTLEVBQUUsSUFBSSxPQUFPLEtBQUssVUFBVSxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFBQSxNQUM3RSxTQUFTLFVBQVUsTUFBTSxLQUFLLENBQUMsR0FBRyxNQUFNLEtBQUssQ0FBQyxFQUFFLFFBQVE7QUFBQSxJQUMxRDtBQUFBLEdBQ0Q7QUFBQSxFQUNELFdBQVcsUUFBUSxRQUFRO0FBQUEsRUFDM0IsTUFBTSxZQUFZO0FBQUEsSUFDaEIsSUFBSSxXQUFXLFdBQVc7QUFBQSxJQUMxQixPQUFPLFdBQVcsV0FBVztBQUFBLElBQzdCLE9BQU87QUFBQSxJQUNQLFFBQVE7QUFBQSxFQUNWO0FBQUEsRUFDQSxVQUFVLFFBQVEsU0FBUyxRQUFRLElBQUksS0FBSztBQUFBLEVBQzVDLFVBQVUsU0FBUyxTQUFTLFNBQVMsSUFBSSxLQUFLO0FBQUEsRUFDOUMsSUFBSSxNQUFNLGdCQUFnQixXQUFXLEtBQUs7QUFBQSxFQUMxQyxPQUFPO0FBQUEsR0FDTixXQUFXO0FBQ2QsSUFBSSx3QkFBd0I7QUFBQSxFQUMxQjtBQUFBLEVBQ0E7QUFDRjtBQUdBLElBQUksVUFBVTtBQUFBLEVBQ1osUUFBUTtBQUFBLE1BQ0osRUFBRSxHQUFHO0FBQUEsSUFDUCxPQUFPLElBQUksUUFBUSxDQUFDO0FBQUE7QUFBQSxFQUV0QixVQUFVO0FBQUEsRUFDVixRQUFRO0FBQUEsRUFDUixzQkFBc0IsT0FBTyxDQUFDLFFBQVE7QUFBQSxJQUNwQyxJQUFJLENBQUMsSUFBSSxPQUFPO0FBQUEsTUFDZCxJQUFJLFFBQVEsQ0FBQztBQUFBLElBQ2Y7QUFBQSxJQUNBLElBQUksTUFBTSxzQkFBc0IsSUFBSTtBQUFBLEtBQ25DLE1BQU07QUFDWDsiLAogICJkZWJ1Z0lkIjogIjgxNDZBQ0U3ODcxNTYxODQ2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
