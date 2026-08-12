import {
  getIconStyles
} from "./chunk-main-0ekgv9a6.js";
import {
  JSON_SCHEMA,
  load
} from "./chunk-main-vzv70y3p.js";
import {
  createTooltip
} from "./chunk-main-sxwy6e53.js";
import {
  getDiagramElement
} from "./chunk-main-h8a1r6rk.js";
import {
  setupViewPortForSVG
} from "./chunk-main-snyzap23.js";
import {
  getRegisteredLayoutAlgorithm,
  render
} from "./chunk-main-3qqx6zcj.js";
import"./chunk-main-wx3x4ygf.js";
import {
  isValidShape
} from "./chunk-main-xxv6x4s9.js";
import"./chunk-main-2se6cwec.js";
import"./chunk-main-4ceh9h9g.js";
import"./chunk-main-h1tqf3mz.js";
import"./chunk-main-s8463nwg.js";
import"./chunk-main-wsp4jakw.js";
import {
  getEdgeId,
  utils_default
} from "./chunk-main-vvfzntzy.js";
import"./chunk-main-ck580f0k.js";
import {
  channel_default,
  clear,
  common_default,
  defaultConfig2,
  getAccDescription,
  getAccTitle,
  getConfig2,
  getDiagramTitle,
  purify,
  rgba_default,
  setAccDescription,
  setAccTitle,
  setConfig2,
  setDiagramTitle
} from "./chunk-main-aws590jt.js";
import {
  __name,
  log,
  select_default
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/flowDiagram-I6XJVG4X.mjs
var MERMAID_DOM_ID_PREFIX = "flowchart-";
var FlowDB = class {
  constructor() {
    this.vertexCounter = 0;
    this.config = getConfig2();
    this.diagramId = "";
    this.vertices = /* @__PURE__ */ new Map;
    this.edges = [];
    this.classes = /* @__PURE__ */ new Map;
    this.subGraphs = [];
    this.subGraphLookup = /* @__PURE__ */ new Map;
    this.tooltips = /* @__PURE__ */ new Map;
    this.subCount = 0;
    this.firstGraphFlag = true;
    this.secCount = -1;
    this.posCrossRef = [];
    this.funs = [];
    this.setAccTitle = setAccTitle;
    this.setAccDescription = setAccDescription;
    this.setDiagramTitle = setDiagramTitle;
    this.getAccTitle = getAccTitle;
    this.getAccDescription = getAccDescription;
    this.getDiagramTitle = getDiagramTitle;
    this.funs.push(this.setupToolTips.bind(this));
    this.addVertex = this.addVertex.bind(this);
    this.firstGraph = this.firstGraph.bind(this);
    this.setDirection = this.setDirection.bind(this);
    this.addSubGraph = this.addSubGraph.bind(this);
    this.addLink = this.addLink.bind(this);
    this.setLink = this.setLink.bind(this);
    this.updateLink = this.updateLink.bind(this);
    this.addClass = this.addClass.bind(this);
    this.setClass = this.setClass.bind(this);
    this.destructLink = this.destructLink.bind(this);
    this.setClickEvent = this.setClickEvent.bind(this);
    this.setTooltip = this.setTooltip.bind(this);
    this.updateLinkInterpolate = this.updateLinkInterpolate.bind(this);
    this.setClickFun = this.setClickFun.bind(this);
    this.bindFunctions = this.bindFunctions.bind(this);
    this.lex = {
      firstGraph: this.firstGraph.bind(this)
    };
    this.clear();
    this.setGen("gen-2");
  }
  static {
    __name(this, "FlowDB");
  }
  sanitizeText(txt) {
    return common_default.sanitizeText(txt, this.config);
  }
  sanitizeNodeLabelType(labelType) {
    switch (labelType) {
      case "markdown":
      case "string":
      case "text":
        return labelType;
      default:
        return "markdown";
    }
  }
  setDiagramId(svgElementId) {
    this.diagramId = svgElementId;
  }
  lookUpDomId(id) {
    for (const vertex of this.vertices.values()) {
      if (vertex.id === id) {
        return this.diagramId ? `${this.diagramId}-${vertex.domId}` : vertex.domId;
      }
    }
    return this.diagramId ? `${this.diagramId}-${id}` : id;
  }
  addVertex(id, textObj, type, style, classes, dir, props = {}, metadata) {
    if (!id || id.trim().length === 0) {
      return;
    }
    let doc;
    if (metadata !== undefined) {
      let yamlData;
      if (!metadata.includes(`
`)) {
        yamlData = `{
` + metadata + `
}`;
      } else {
        yamlData = metadata + `
`;
      }
      doc = load(yamlData, { schema: JSON_SCHEMA });
    }
    const edge = this.edges.find((e) => e.id === id);
    if (edge) {
      const edgeDoc = doc;
      if (edgeDoc?.animate !== undefined) {
        edge.animate = edgeDoc.animate;
      }
      if (edgeDoc?.animation !== undefined) {
        edge.animation = edgeDoc.animation;
      }
      if (edgeDoc?.curve !== undefined) {
        edge.interpolate = edgeDoc.curve;
      }
      return;
    }
    let txt;
    let vertex = this.vertices.get(id);
    if (vertex === undefined) {
      if (textObj === undefined && type === undefined && style !== undefined && style !== null) {
        log.warn(`Style applied to unknown node "${id}". This may indicate a typo. The node will be created automatically.`);
      }
      vertex = {
        id,
        labelType: "text",
        domId: MERMAID_DOM_ID_PREFIX + id + "-" + this.vertexCounter,
        styles: [],
        classes: []
      };
      this.vertices.set(id, vertex);
    }
    this.vertexCounter++;
    if (textObj !== undefined) {
      this.config = getConfig2();
      txt = this.sanitizeText(textObj.text.trim());
      vertex.labelType = textObj.type;
      if (txt.startsWith('"') && txt.endsWith('"')) {
        txt = txt.substring(1, txt.length - 1);
      }
      vertex.text = txt;
    } else {
      if (vertex.text === undefined) {
        vertex.text = id;
      }
    }
    if (type !== undefined) {
      vertex.type = type;
    }
    if (style !== undefined && style !== null) {
      style.forEach((s) => {
        vertex.styles.push(s);
      });
    }
    if (classes !== undefined && classes !== null) {
      classes.forEach((s) => {
        vertex.classes.push(s);
      });
    }
    if (dir !== undefined) {
      vertex.dir = dir;
    }
    if (vertex.props === undefined) {
      vertex.props = props;
    } else if (props !== undefined) {
      Object.assign(vertex.props, props);
    }
    if (doc !== undefined) {
      if (doc.shape) {
        if (doc.shape !== doc.shape.toLowerCase() || doc.shape.includes("_")) {
          throw new Error(`No such shape: ${doc.shape}. Shape names should be lowercase.`);
        } else if (!isValidShape(doc.shape)) {
          throw new Error(`No such shape: ${doc.shape}.`);
        }
        vertex.type = doc?.shape;
      }
      if (doc?.label) {
        vertex.text = doc?.label;
        vertex.labelType = this.sanitizeNodeLabelType(doc?.labelType);
      }
      if (doc?.icon) {
        vertex.icon = doc?.icon;
        if (!doc.label?.trim() && vertex.text === id) {
          vertex.text = "";
        }
      }
      if (doc?.form) {
        vertex.form = doc?.form;
      }
      if (doc?.pos) {
        vertex.pos = doc?.pos;
      }
      if (doc?.img) {
        vertex.img = doc?.img;
        if (!doc.label?.trim() && vertex.text === id) {
          vertex.text = "";
        }
      }
      if (doc?.constraint) {
        vertex.constraint = doc.constraint;
      }
      if (doc.w) {
        vertex.assetWidth = Number(doc.w);
      }
      if (doc.h) {
        vertex.assetHeight = Number(doc.h);
      }
    }
  }
  addSingleLink(_start, _end, type, id) {
    const start = _start;
    const end = _end;
    const edge = {
      start,
      end,
      type: undefined,
      text: "",
      labelType: "text",
      classes: [],
      isUserDefinedId: false,
      interpolate: this.edges.defaultInterpolate
    };
    log.info("abc78 Got edge...", edge);
    const linkTextObj = type.text;
    if (linkTextObj !== undefined) {
      edge.text = this.sanitizeText(linkTextObj.text.trim());
      if (edge.text.startsWith('"') && edge.text.endsWith('"')) {
        edge.text = edge.text.substring(1, edge.text.length - 1);
      }
      edge.labelType = this.sanitizeNodeLabelType(linkTextObj.type);
    }
    if (type !== undefined) {
      edge.type = type.type;
      edge.stroke = type.stroke;
      edge.length = type.length > 10 ? 10 : type.length;
    }
    if (id && !this.edges.some((e) => e.id === id)) {
      edge.id = id;
      edge.isUserDefinedId = true;
    } else {
      const existingLinks = this.edges.filter((e) => e.start === edge.start && e.end === edge.end);
      if (existingLinks.length === 0) {
        edge.id = getEdgeId(edge.start, edge.end, { counter: 0, prefix: "L" });
      } else {
        edge.id = getEdgeId(edge.start, edge.end, {
          counter: existingLinks.length + 1,
          prefix: "L"
        });
      }
    }
    if (this.edges.length < (this.config.maxEdges ?? 500)) {
      log.info("Pushing edge...");
      this.edges.push(edge);
    } else {
      throw new Error(`Edge limit exceeded. ${this.edges.length} edges found, but the limit is ${this.config.maxEdges}.

Initialize mermaid with maxEdges set to a higher number to allow more edges.
You cannot set this config via configuration inside the diagram as it is a secure config.
You have to call mermaid.initialize.`);
    }
  }
  isLinkData(value) {
    return value !== null && typeof value === "object" && "id" in value && typeof value.id === "string";
  }
  addLink(_start, _end, linkData) {
    const id = this.isLinkData(linkData) ? linkData.id.replace("@", "") : undefined;
    log.info("addLink", _start, _end, id);
    for (const start of _start) {
      for (const end of _end) {
        const isLastStart = start === _start[_start.length - 1];
        const isFirstEnd = end === _end[0];
        if (isLastStart && isFirstEnd) {
          this.addSingleLink(start, end, linkData, id);
        } else {
          this.addSingleLink(start, end, linkData, undefined);
        }
      }
    }
  }
  updateLinkInterpolate(positions, interpolate) {
    positions.forEach((pos) => {
      if (pos === "default") {
        this.edges.defaultInterpolate = interpolate;
      } else {
        this.edges[pos].interpolate = interpolate;
      }
    });
  }
  updateLink(positions, style) {
    positions.forEach((pos) => {
      if (typeof pos === "number" && pos >= this.edges.length) {
        throw new Error(`The index ${pos} for linkStyle is out of bounds. Valid indices for linkStyle are between 0 and ${this.edges.length - 1}. (Help: Ensure that the index is within the range of existing edges.)`);
      }
      if (pos === "default") {
        this.edges.defaultStyle = style;
      } else {
        this.edges[pos].style = style;
        if ((this.edges[pos]?.style?.length ?? 0) > 0 && !this.edges[pos]?.style?.some((s) => s?.startsWith("fill"))) {
          this.edges[pos]?.style?.push("fill:none");
        }
      }
    });
  }
  addClass(ids, _style) {
    const style = _style.join().replace(/\\,/g, "§§§").replace(/,/g, ";").replace(/§§§/g, ",").split(";");
    ids.split(",").forEach((id) => {
      let classNode = this.classes.get(id);
      if (classNode === undefined) {
        classNode = { id, styles: [], textStyles: [] };
        this.classes.set(id, classNode);
      }
      if (style !== undefined && style !== null) {
        style.forEach((s) => {
          if (/color/.exec(s)) {
            const newStyle = s.replace("fill", "bgFill");
            classNode.textStyles.push(newStyle);
          }
          classNode.styles.push(s);
        });
      }
    });
  }
  setDirection(dir) {
    this.direction = dir.trim();
    if (/.*</.exec(this.direction)) {
      this.direction = "RL";
    }
    if (/.*\^/.exec(this.direction)) {
      this.direction = "BT";
    }
    if (/.*>/.exec(this.direction)) {
      this.direction = "LR";
    }
    if (/.*v/.exec(this.direction)) {
      this.direction = "TB";
    }
    if (this.direction === "TD") {
      this.direction = "TB";
    }
  }
  setClass(ids, className) {
    for (const id of ids.split(",")) {
      const vertex = this.vertices.get(id);
      if (vertex) {
        vertex.classes.push(className);
      }
      const edge = this.edges.find((e) => e.id === id);
      if (edge) {
        edge.classes.push(className);
      }
      const subGraph = this.subGraphLookup.get(id);
      if (subGraph) {
        subGraph.classes.push(className);
      }
    }
  }
  setTooltip(ids, tooltip) {
    if (tooltip === undefined) {
      return;
    }
    tooltip = this.sanitizeText(tooltip);
    for (const id of ids.split(",")) {
      this.tooltips.set(this.version === "gen-1" ? this.lookUpDomId(id) : id, tooltip);
    }
  }
  setClickFun(id, functionName, functionArgs) {
    if (getConfig2().securityLevel !== "loose") {
      return;
    }
    if (functionName === undefined) {
      return;
    }
    let argList = [];
    if (typeof functionArgs === "string") {
      argList = functionArgs.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      for (let i = 0;i < argList.length; i++) {
        let item = argList[i].trim();
        if (item.startsWith('"') && item.endsWith('"')) {
          item = item.substr(1, item.length - 2);
        }
        argList[i] = item;
      }
    }
    if (argList.length === 0) {
      argList.push(id);
    }
    const vertex = this.vertices.get(id);
    if (vertex) {
      vertex.haveCallback = true;
      this.funs.push(() => {
        const domId = this.lookUpDomId(id);
        const elem = document.querySelector(`[id="${domId}"]`);
        if (elem !== null) {
          elem.addEventListener("click", () => {
            utils_default.runFunc(functionName, ...argList);
          }, false);
        }
      });
    }
  }
  setLink(ids, linkStr, target) {
    ids.split(",").forEach((id) => {
      const vertex = this.vertices.get(id);
      if (vertex !== undefined) {
        vertex.link = utils_default.formatUrl(linkStr, this.config);
        vertex.linkTarget = target;
      }
    });
    this.setClass(ids, "clickable");
  }
  getTooltip(id) {
    return this.tooltips.get(id);
  }
  setClickEvent(ids, functionName, functionArgs) {
    ids.split(",").forEach((id) => {
      this.setClickFun(id, functionName, functionArgs);
    });
    this.setClass(ids, "clickable");
  }
  bindFunctions(element) {
    this.funs.forEach((fun) => {
      fun(element);
    });
  }
  getDirection() {
    return this.direction?.trim();
  }
  getVertices() {
    return this.vertices;
  }
  getEdges() {
    return this.edges;
  }
  getClasses() {
    return this.classes;
  }
  setupToolTips(element) {
    const tooltipElem = createTooltip();
    const svg = select_default(element).select("svg");
    const nodes = svg.selectAll("g.node");
    nodes.on("mouseover", (e) => {
      const el = select_default(e.currentTarget);
      const title = el.attr("title");
      if (title === null) {
        return;
      }
      const rect = e.currentTarget?.getBoundingClientRect();
      tooltipElem.transition().duration(200).style("opacity", ".9");
      tooltipElem.text(el.attr("title")).style("left", window.scrollX + rect.left + (rect.right - rect.left) / 2 + "px").style("top", window.scrollY + rect.bottom + "px");
      tooltipElem.html(purify.sanitize(title));
      el.classed("hover", true);
    }).on("mouseout", (e) => {
      tooltipElem.transition().duration(500).style("opacity", 0);
      const el = select_default(e.currentTarget);
      el.classed("hover", false);
    });
  }
  clear(ver = "gen-2") {
    this.vertices = /* @__PURE__ */ new Map;
    this.classes = /* @__PURE__ */ new Map;
    this.edges = [];
    this.funs = [this.setupToolTips.bind(this)];
    this.diagramId = "";
    this.subGraphs = [];
    this.subGraphLookup = /* @__PURE__ */ new Map;
    this.subCount = 0;
    this.tooltips = /* @__PURE__ */ new Map;
    this.firstGraphFlag = true;
    this.version = ver;
    this.config = getConfig2();
    clear();
  }
  setGen(ver) {
    this.version = ver || "gen-2";
  }
  defaultStyle() {
    return "fill:#ffa;stroke: #f66; stroke-width: 3px; stroke-dasharray: 5, 5;fill:#ffa;stroke: #666;";
  }
  addSubGraph(_id, list, _title) {
    let id = _id.text.trim();
    let title = _title.text;
    if (_id === _title && /\s/.exec(_title.text)) {
      id = undefined;
    }
    const uniq = /* @__PURE__ */ __name((a) => {
      const prims = { boolean: {}, number: {}, string: {} };
      const objs = [];
      let dir2;
      const nodeList2 = a.filter(function(item) {
        const type = typeof item;
        if (item.stmt && item.stmt === "dir") {
          dir2 = item.value;
          return false;
        }
        if (item.trim() === "") {
          return false;
        }
        if (type in prims) {
          return prims[type].hasOwnProperty(item) ? false : prims[type][item] = true;
        } else {
          return objs.includes(item) ? false : objs.push(item);
        }
      });
      return { nodeList: nodeList2, dir: dir2 };
    }, "uniq");
    const result = uniq(list.flat());
    const nodeList = result.nodeList;
    let dir = result.dir;
    const flowchartConfig = getConfig2().flowchart ?? {};
    dir = dir ?? (flowchartConfig.inheritDir ? this.getDirection() ?? getConfig2().direction ?? undefined : undefined);
    if (this.version === "gen-1") {
      for (let i = 0;i < nodeList.length; i++) {
        nodeList[i] = this.lookUpDomId(nodeList[i]);
      }
    }
    id = id ?? "subGraph" + this.subCount;
    title = title || "";
    title = this.sanitizeText(title);
    this.subCount = this.subCount + 1;
    const subGraph = {
      id,
      nodes: nodeList,
      title: title.trim(),
      classes: [],
      dir,
      labelType: this.sanitizeNodeLabelType(_title?.type)
    };
    log.info("Adding", subGraph.id, subGraph.nodes, subGraph.dir);
    subGraph.nodes = this.makeUniq(subGraph, this.subGraphs).nodes;
    this.subGraphs.push(subGraph);
    this.subGraphLookup.set(id, subGraph);
    return id;
  }
  getPosForId(id) {
    for (const [i, subGraph] of this.subGraphs.entries()) {
      if (subGraph.id === id) {
        return i;
      }
    }
    return -1;
  }
  indexNodes2(id, pos) {
    const nodes = this.subGraphs[pos].nodes;
    this.secCount = this.secCount + 1;
    if (this.secCount > 2000) {
      return {
        result: false,
        count: 0
      };
    }
    this.posCrossRef[this.secCount] = pos;
    if (this.subGraphs[pos].id === id) {
      return {
        result: true,
        count: 0
      };
    }
    let count = 0;
    let posCount = 1;
    while (count < nodes.length) {
      const childPos = this.getPosForId(nodes[count]);
      if (childPos >= 0) {
        const res = this.indexNodes2(id, childPos);
        if (res.result) {
          return {
            result: true,
            count: posCount + res.count
          };
        } else {
          posCount = posCount + res.count;
        }
      }
      count = count + 1;
    }
    return {
      result: false,
      count: posCount
    };
  }
  getDepthFirstPos(pos) {
    return this.posCrossRef[pos];
  }
  indexNodes() {
    this.secCount = -1;
    if (this.subGraphs.length > 0) {
      this.indexNodes2("none", this.subGraphs.length - 1);
    }
  }
  getSubGraphs() {
    return this.subGraphs;
  }
  firstGraph() {
    if (this.firstGraphFlag) {
      this.firstGraphFlag = false;
      return true;
    }
    return false;
  }
  destructStartLink(_str) {
    let str = _str.trim();
    let type = "arrow_open";
    switch (str[0]) {
      case "<":
        type = "arrow_point";
        str = str.slice(1);
        break;
      case "x":
        type = "arrow_cross";
        str = str.slice(1);
        break;
      case "o":
        type = "arrow_circle";
        str = str.slice(1);
        break;
    }
    let stroke = "normal";
    if (str.includes("=")) {
      stroke = "thick";
    }
    if (str.includes(".")) {
      stroke = "dotted";
    }
    return { type, stroke };
  }
  countChar(char, str) {
    const length = str.length;
    let count = 0;
    for (let i = 0;i < length; ++i) {
      if (str[i] === char) {
        ++count;
      }
    }
    return count;
  }
  destructEndLink(_str) {
    const str = _str.trim();
    let line = str.slice(0, -1);
    let type = "arrow_open";
    switch (str.slice(-1)) {
      case "x":
        type = "arrow_cross";
        if (str.startsWith("x")) {
          type = "double_" + type;
          line = line.slice(1);
        }
        break;
      case ">":
        type = "arrow_point";
        if (str.startsWith("<")) {
          type = "double_" + type;
          line = line.slice(1);
        }
        break;
      case "o":
        type = "arrow_circle";
        if (str.startsWith("o")) {
          type = "double_" + type;
          line = line.slice(1);
        }
        break;
    }
    let stroke = "normal";
    let length = line.length - 1;
    if (line.startsWith("=")) {
      stroke = "thick";
    }
    if (line.startsWith("~")) {
      stroke = "invisible";
    }
    const dots = this.countChar(".", line);
    if (dots) {
      stroke = "dotted";
      length = dots;
    }
    return { type, stroke, length };
  }
  destructLink(_str, _startStr) {
    const info = this.destructEndLink(_str);
    let startInfo;
    if (_startStr) {
      startInfo = this.destructStartLink(_startStr);
      if (startInfo.stroke !== info.stroke) {
        return { type: "INVALID", stroke: "INVALID" };
      }
      if (startInfo.type === "arrow_open") {
        startInfo.type = info.type;
      } else {
        if (startInfo.type !== info.type) {
          return { type: "INVALID", stroke: "INVALID" };
        }
        startInfo.type = "double_" + startInfo.type;
      }
      if (startInfo.type === "double_arrow") {
        startInfo.type = "double_arrow_point";
      }
      startInfo.length = info.length;
      return startInfo;
    }
    return info;
  }
  exists(allSgs, _id) {
    for (const sg of allSgs) {
      if (sg.nodes.includes(_id)) {
        return true;
      }
    }
    return false;
  }
  makeUniq(sg, allSubgraphs) {
    const res = [];
    sg.nodes.forEach((_id, pos) => {
      if (!this.exists(allSubgraphs, _id)) {
        res.push(sg.nodes[pos]);
      }
    });
    return { nodes: res };
  }
  getTypeFromVertex(vertex) {
    if (vertex.img) {
      return "imageSquare";
    }
    if (vertex.icon) {
      if (vertex.form === "circle") {
        return "iconCircle";
      }
      if (vertex.form === "square") {
        return "iconSquare";
      }
      if (vertex.form === "rounded") {
        return "iconRounded";
      }
      return "icon";
    }
    switch (vertex.type) {
      case "square":
      case undefined:
        return "squareRect";
      case "round":
        return "roundedRect";
      case "ellipse":
        return "ellipse";
      default:
        return vertex.type;
    }
  }
  findNode(nodes, id) {
    return nodes.find((node) => node.id === id);
  }
  destructEdgeType(type) {
    let arrowTypeStart = "none";
    let arrowTypeEnd = "arrow_point";
    switch (type) {
      case "arrow_point":
      case "arrow_circle":
      case "arrow_cross":
        arrowTypeEnd = type;
        break;
      case "double_arrow_point":
      case "double_arrow_circle":
      case "double_arrow_cross":
        arrowTypeStart = type.replace("double_", "");
        arrowTypeEnd = arrowTypeStart;
        break;
    }
    return { arrowTypeStart, arrowTypeEnd };
  }
  addNodeFromVertex(vertex, nodes, parentDB, subGraphDB, config, look) {
    const parentId = parentDB.get(vertex.id);
    const isGroup = subGraphDB.get(vertex.id) ?? false;
    const node = this.findNode(nodes, vertex.id);
    if (node) {
      node.cssStyles = vertex.styles;
      node.cssCompiledStyles = this.getCompiledStyles(vertex.classes);
      node.cssClasses = vertex.classes.join(" ");
    } else {
      const baseNode = {
        id: vertex.id,
        label: vertex.text,
        labelType: vertex.labelType,
        labelStyle: "",
        parentId,
        padding: config.flowchart?.padding || 8,
        cssStyles: vertex.styles,
        cssCompiledStyles: this.getCompiledStyles(["default", "node", ...vertex.classes]),
        cssClasses: "default " + vertex.classes.join(" "),
        dir: vertex.dir,
        domId: vertex.domId,
        look,
        link: vertex.link,
        linkTarget: vertex.linkTarget,
        tooltip: this.getTooltip(vertex.id),
        icon: vertex.icon,
        pos: vertex.pos,
        img: vertex.img,
        assetWidth: vertex.assetWidth,
        assetHeight: vertex.assetHeight,
        constraint: vertex.constraint
      };
      if (isGroup) {
        nodes.push({
          ...baseNode,
          isGroup: true,
          shape: "rect"
        });
      } else {
        nodes.push({
          ...baseNode,
          isGroup: false,
          shape: this.getTypeFromVertex(vertex)
        });
      }
    }
  }
  getCompiledStyles(classDefs) {
    let compiledStyles = [];
    for (const customClass of classDefs) {
      const cssClass = this.classes.get(customClass);
      if (cssClass?.styles) {
        compiledStyles = [...compiledStyles, ...cssClass.styles ?? []].map((s) => s.trim());
      }
      if (cssClass?.textStyles) {
        compiledStyles = [...compiledStyles, ...cssClass.textStyles ?? []].map((s) => s.trim());
      }
    }
    return compiledStyles;
  }
  getData() {
    const config = getConfig2();
    const nodes = [];
    const edges = [];
    const subGraphs = this.getSubGraphs();
    const parentDB = /* @__PURE__ */ new Map;
    const subGraphDB = /* @__PURE__ */ new Map;
    for (let i = subGraphs.length - 1;i >= 0; i--) {
      const subGraph = subGraphs[i];
      if (subGraph.nodes.length > 0) {
        subGraphDB.set(subGraph.id, true);
      }
      for (const id of subGraph.nodes) {
        parentDB.set(id, subGraph.id);
      }
    }
    for (let i = subGraphs.length - 1;i >= 0; i--) {
      const subGraph = subGraphs[i];
      nodes.push({
        id: subGraph.id,
        label: subGraph.title,
        labelStyle: "",
        labelType: subGraph.labelType,
        parentId: parentDB.get(subGraph.id),
        padding: 8,
        cssCompiledStyles: this.getCompiledStyles(subGraph.classes),
        cssClasses: subGraph.classes.join(" "),
        shape: "rect",
        dir: subGraph.dir,
        isGroup: true,
        look: config.look
      });
    }
    const n = this.getVertices();
    n.forEach((vertex) => {
      this.addNodeFromVertex(vertex, nodes, parentDB, subGraphDB, config, config.look || "classic");
    });
    const e = this.getEdges();
    e.forEach((rawEdge, index) => {
      const { arrowTypeStart, arrowTypeEnd } = this.destructEdgeType(rawEdge.type);
      const styles = [...e.defaultStyle ?? []];
      if (rawEdge.style) {
        styles.push(...rawEdge.style);
      }
      const edge = {
        id: getEdgeId(rawEdge.start, rawEdge.end, { counter: index, prefix: "L" }, rawEdge.id),
        isUserDefinedId: rawEdge.isUserDefinedId,
        start: rawEdge.start,
        end: rawEdge.end,
        type: rawEdge.type ?? "normal",
        label: rawEdge.text,
        labelType: rawEdge.labelType,
        labelpos: "c",
        thickness: rawEdge.stroke,
        minlen: rawEdge.length,
        classes: rawEdge?.stroke === "invisible" ? "" : "edge-thickness-normal edge-pattern-solid flowchart-link",
        arrowTypeStart: rawEdge?.stroke === "invisible" || rawEdge?.type === "arrow_open" ? "none" : arrowTypeStart,
        arrowTypeEnd: rawEdge?.stroke === "invisible" || rawEdge?.type === "arrow_open" ? "none" : arrowTypeEnd,
        arrowheadStyle: "fill: #333",
        cssCompiledStyles: this.getCompiledStyles(rawEdge.classes),
        labelStyle: styles,
        style: styles,
        pattern: rawEdge.stroke,
        look: config.look,
        animate: rawEdge.animate,
        animation: rawEdge.animation,
        curve: rawEdge.interpolate || this.edges.defaultInterpolate || config.flowchart?.curve
      };
      edges.push(edge);
    });
    return { nodes, edges, other: {}, config };
  }
  defaultConfig() {
    return defaultConfig2.flowchart;
  }
};
var getClasses = /* @__PURE__ */ __name(function(text, diagramObj) {
  return diagramObj.db.getClasses();
}, "getClasses");
var draw = /* @__PURE__ */ __name(async function(text, id, _version, diag) {
  log.info("REF0:");
  log.info("Drawing state diagram (v2)", id);
  const { securityLevel, flowchart: conf, layout } = getConfig2();
  diag.db.setDiagramId(id);
  log.debug("Before getData: ");
  const data4Layout = diag.db.getData();
  log.debug("Data: ", data4Layout);
  const svg = getDiagramElement(id, securityLevel);
  const direction = diag.db.getDirection();
  data4Layout.type = diag.type;
  data4Layout.layoutAlgorithm = getRegisteredLayoutAlgorithm(layout);
  if (data4Layout.layoutAlgorithm === "dagre" && layout === "elk") {
    log.warn("flowchart-elk was moved to an external package in Mermaid v11. Please refer [release notes](https://github.com/mermaid-js/mermaid/releases/tag/v11.0.0) for more details. This diagram will be rendered using `dagre` layout as a fallback.");
  }
  data4Layout.direction = direction;
  data4Layout.nodeSpacing = conf?.nodeSpacing || 50;
  data4Layout.rankSpacing = conf?.rankSpacing || 50;
  data4Layout.markers = ["point", "circle", "cross"];
  data4Layout.diagramId = id;
  log.debug("REF1:", data4Layout);
  await render(data4Layout, svg);
  const padding = data4Layout.config.flowchart?.diagramPadding ?? 8;
  utils_default.insertTitle(svg, "flowchartTitleText", conf?.titleTopMargin || 0, diag.db.getDiagramTitle());
  setupViewPortForSVG(svg, padding, "flowchart", conf?.useMaxWidth || false);
}, "draw");
var flowRenderer_v3_unified_default = {
  getClasses,
  draw
};
var parser = function() {
  var o = /* @__PURE__ */ __name(function(k, v, o2, l) {
    for (o2 = o2 || {}, l = k.length;l--; o2[k[l]] = v)
      ;
    return o2;
  }, "o"), $V0 = [1, 4], $V1 = [1, 3], $V2 = [1, 5], $V3 = [1, 8, 9, 10, 11, 27, 34, 36, 38, 44, 60, 84, 85, 86, 87, 88, 89, 102, 105, 106, 109, 111, 114, 115, 116, 121, 122, 123, 124, 125], $V4 = [2, 2], $V5 = [1, 13], $V6 = [1, 14], $V7 = [1, 15], $V8 = [1, 16], $V9 = [1, 23], $Va = [1, 25], $Vb = [1, 26], $Vc = [1, 27], $Vd = [1, 50], $Ve = [1, 49], $Vf = [1, 29], $Vg = [1, 30], $Vh = [1, 31], $Vi = [1, 32], $Vj = [1, 33], $Vk = [1, 45], $Vl = [1, 47], $Vm = [1, 43], $Vn = [1, 48], $Vo = [1, 44], $Vp = [1, 51], $Vq = [1, 46], $Vr = [1, 52], $Vs = [1, 53], $Vt = [1, 34], $Vu = [1, 35], $Vv = [1, 36], $Vw = [1, 37], $Vx = [1, 38], $Vy = [1, 58], $Vz = [1, 8, 9, 10, 11, 27, 32, 34, 36, 38, 44, 60, 84, 85, 86, 87, 88, 89, 102, 105, 106, 109, 111, 114, 115, 116, 121, 122, 123, 124, 125], $VA = [1, 62], $VB = [1, 61], $VC = [1, 63], $VD = [8, 9, 11, 75, 77, 78], $VE = [1, 79], $VF = [1, 92], $VG = [1, 97], $VH = [1, 96], $VI = [1, 93], $VJ = [1, 89], $VK = [1, 95], $VL = [1, 91], $VM = [1, 98], $VN = [1, 94], $VO = [1, 99], $VP = [1, 90], $VQ = [8, 9, 10, 11, 40, 75, 77, 78], $VR = [8, 9, 10, 11, 40, 46, 75, 77, 78], $VS = [8, 9, 10, 11, 29, 40, 44, 46, 48, 50, 52, 54, 56, 58, 60, 63, 65, 67, 68, 70, 75, 77, 78, 89, 102, 105, 106, 109, 111, 114, 115, 116], $VT = [8, 9, 11, 44, 60, 75, 77, 78, 89, 102, 105, 106, 109, 111, 114, 115, 116], $VU = [44, 60, 89, 102, 105, 106, 109, 111, 114, 115, 116], $VV = [1, 122], $VW = [1, 123], $VX = [1, 125], $VY = [1, 124], $VZ = [44, 60, 62, 74, 89, 102, 105, 106, 109, 111, 114, 115, 116], $V_ = [1, 134], $V$ = [1, 148], $V01 = [1, 149], $V11 = [1, 150], $V21 = [1, 151], $V31 = [1, 136], $V41 = [1, 138], $V51 = [1, 142], $V61 = [1, 143], $V71 = [1, 144], $V81 = [1, 145], $V91 = [1, 146], $Va1 = [1, 147], $Vb1 = [1, 152], $Vc1 = [1, 153], $Vd1 = [1, 132], $Ve1 = [1, 133], $Vf1 = [1, 140], $Vg1 = [1, 135], $Vh1 = [1, 139], $Vi1 = [1, 137], $Vj1 = [8, 9, 10, 11, 27, 32, 34, 36, 38, 44, 60, 84, 85, 86, 87, 88, 89, 102, 105, 106, 109, 111, 114, 115, 116, 121, 122, 123, 124, 125], $Vk1 = [1, 155], $Vl1 = [1, 157], $Vm1 = [8, 9, 11], $Vn1 = [8, 9, 10, 11, 14, 44, 60, 89, 105, 106, 109, 111, 114, 115, 116], $Vo1 = [1, 177], $Vp1 = [1, 173], $Vq1 = [1, 174], $Vr1 = [1, 178], $Vs1 = [1, 175], $Vt1 = [1, 176], $Vu1 = [77, 116, 119], $Vv1 = [8, 9, 10, 11, 12, 14, 27, 29, 32, 44, 60, 75, 84, 85, 86, 87, 88, 89, 90, 105, 109, 111, 114, 115, 116], $Vw1 = [10, 106], $Vx1 = [31, 49, 51, 53, 55, 57, 62, 64, 66, 67, 69, 71, 116, 117, 118], $Vy1 = [1, 248], $Vz1 = [1, 246], $VA1 = [1, 250], $VB1 = [1, 244], $VC1 = [1, 245], $VD1 = [1, 247], $VE1 = [1, 249], $VF1 = [1, 251], $VG1 = [1, 269], $VH1 = [8, 9, 11, 106], $VI1 = [8, 9, 10, 11, 60, 84, 105, 106, 109, 110, 111, 112];
  var parser2 = {
    trace: /* @__PURE__ */ __name(function trace() {}, "trace"),
    yy: {},
    symbols_: { error: 2, start: 3, graphConfig: 4, document: 5, line: 6, statement: 7, SEMI: 8, NEWLINE: 9, SPACE: 10, EOF: 11, GRAPH: 12, NODIR: 13, DIR: 14, FirstStmtSeparator: 15, ending: 16, endToken: 17, spaceList: 18, spaceListNewline: 19, vertexStatement: 20, separator: 21, styleStatement: 22, linkStyleStatement: 23, classDefStatement: 24, classStatement: 25, clickStatement: 26, subgraph: 27, textNoTags: 28, SQS: 29, text: 30, SQE: 31, end: 32, direction: 33, acc_title: 34, acc_title_value: 35, acc_descr: 36, acc_descr_value: 37, acc_descr_multiline_value: 38, shapeData: 39, SHAPE_DATA: 40, link: 41, node: 42, styledVertex: 43, AMP: 44, vertex: 45, STYLE_SEPARATOR: 46, idString: 47, DOUBLECIRCLESTART: 48, DOUBLECIRCLEEND: 49, PS: 50, PE: 51, "(-": 52, "-)": 53, STADIUMSTART: 54, STADIUMEND: 55, SUBROUTINESTART: 56, SUBROUTINEEND: 57, VERTEX_WITH_PROPS_START: 58, "NODE_STRING[field]": 59, COLON: 60, "NODE_STRING[value]": 61, PIPE: 62, CYLINDERSTART: 63, CYLINDEREND: 64, DIAMOND_START: 65, DIAMOND_STOP: 66, TAGEND: 67, TRAPSTART: 68, TRAPEND: 69, INVTRAPSTART: 70, INVTRAPEND: 71, linkStatement: 72, arrowText: 73, TESTSTR: 74, START_LINK: 75, edgeText: 76, LINK: 77, LINK_ID: 78, edgeTextToken: 79, STR: 80, MD_STR: 81, textToken: 82, keywords: 83, STYLE: 84, LINKSTYLE: 85, CLASSDEF: 86, CLASS: 87, CLICK: 88, DOWN: 89, UP: 90, textNoTagsToken: 91, stylesOpt: 92, "idString[vertex]": 93, "idString[class]": 94, CALLBACKNAME: 95, CALLBACKARGS: 96, HREF: 97, LINK_TARGET: 98, "STR[link]": 99, "STR[tooltip]": 100, alphaNum: 101, DEFAULT: 102, numList: 103, INTERPOLATE: 104, NUM: 105, COMMA: 106, style: 107, styleComponent: 108, NODE_STRING: 109, UNIT: 110, BRKT: 111, PCT: 112, idStringToken: 113, MINUS: 114, MULT: 115, UNICODE_TEXT: 116, TEXT: 117, TAGSTART: 118, EDGE_TEXT: 119, alphaNumToken: 120, direction_tb: 121, direction_bt: 122, direction_rl: 123, direction_lr: 124, direction_td: 125, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 8: "SEMI", 9: "NEWLINE", 10: "SPACE", 11: "EOF", 12: "GRAPH", 13: "NODIR", 14: "DIR", 27: "subgraph", 29: "SQS", 31: "SQE", 32: "end", 34: "acc_title", 35: "acc_title_value", 36: "acc_descr", 37: "acc_descr_value", 38: "acc_descr_multiline_value", 40: "SHAPE_DATA", 44: "AMP", 46: "STYLE_SEPARATOR", 48: "DOUBLECIRCLESTART", 49: "DOUBLECIRCLEEND", 50: "PS", 51: "PE", 52: "(-", 53: "-)", 54: "STADIUMSTART", 55: "STADIUMEND", 56: "SUBROUTINESTART", 57: "SUBROUTINEEND", 58: "VERTEX_WITH_PROPS_START", 59: "NODE_STRING[field]", 60: "COLON", 61: "NODE_STRING[value]", 62: "PIPE", 63: "CYLINDERSTART", 64: "CYLINDEREND", 65: "DIAMOND_START", 66: "DIAMOND_STOP", 67: "TAGEND", 68: "TRAPSTART", 69: "TRAPEND", 70: "INVTRAPSTART", 71: "INVTRAPEND", 74: "TESTSTR", 75: "START_LINK", 77: "LINK", 78: "LINK_ID", 80: "STR", 81: "MD_STR", 84: "STYLE", 85: "LINKSTYLE", 86: "CLASSDEF", 87: "CLASS", 88: "CLICK", 89: "DOWN", 90: "UP", 93: "idString[vertex]", 94: "idString[class]", 95: "CALLBACKNAME", 96: "CALLBACKARGS", 97: "HREF", 98: "LINK_TARGET", 99: "STR[link]", 100: "STR[tooltip]", 102: "DEFAULT", 104: "INTERPOLATE", 105: "NUM", 106: "COMMA", 109: "NODE_STRING", 110: "UNIT", 111: "BRKT", 112: "PCT", 114: "MINUS", 115: "MULT", 116: "UNICODE_TEXT", 117: "TEXT", 118: "TAGSTART", 119: "EDGE_TEXT", 121: "direction_tb", 122: "direction_bt", 123: "direction_rl", 124: "direction_lr", 125: "direction_td" },
    productions_: [0, [3, 2], [5, 0], [5, 2], [6, 1], [6, 1], [6, 1], [6, 1], [6, 1], [4, 2], [4, 2], [4, 2], [4, 3], [16, 2], [16, 1], [17, 1], [17, 1], [17, 1], [15, 1], [15, 1], [15, 2], [19, 2], [19, 2], [19, 1], [19, 1], [18, 2], [18, 1], [7, 2], [7, 2], [7, 2], [7, 2], [7, 2], [7, 2], [7, 9], [7, 6], [7, 4], [7, 1], [7, 2], [7, 2], [7, 1], [21, 1], [21, 1], [21, 1], [39, 2], [39, 1], [20, 4], [20, 3], [20, 4], [20, 2], [20, 2], [20, 1], [42, 1], [42, 6], [42, 5], [43, 1], [43, 3], [45, 4], [45, 4], [45, 6], [45, 4], [45, 4], [45, 4], [45, 8], [45, 4], [45, 4], [45, 4], [45, 6], [45, 4], [45, 4], [45, 4], [45, 4], [45, 4], [45, 1], [41, 2], [41, 3], [41, 3], [41, 1], [41, 3], [41, 4], [76, 1], [76, 2], [76, 1], [76, 1], [72, 1], [72, 2], [73, 3], [30, 1], [30, 2], [30, 1], [30, 1], [83, 1], [83, 1], [83, 1], [83, 1], [83, 1], [83, 1], [83, 1], [83, 1], [83, 1], [83, 1], [83, 1], [28, 1], [28, 2], [28, 1], [28, 1], [24, 5], [25, 5], [26, 2], [26, 4], [26, 3], [26, 5], [26, 3], [26, 5], [26, 5], [26, 7], [26, 2], [26, 4], [26, 2], [26, 4], [26, 4], [26, 6], [22, 5], [23, 5], [23, 5], [23, 9], [23, 9], [23, 7], [23, 7], [103, 1], [103, 3], [92, 1], [92, 3], [107, 1], [107, 2], [108, 1], [108, 1], [108, 1], [108, 1], [108, 1], [108, 1], [108, 1], [108, 1], [113, 1], [113, 1], [113, 1], [113, 1], [113, 1], [113, 1], [113, 1], [113, 1], [113, 1], [113, 1], [113, 1], [82, 1], [82, 1], [82, 1], [82, 1], [91, 1], [91, 1], [91, 1], [91, 1], [91, 1], [91, 1], [91, 1], [91, 1], [91, 1], [91, 1], [91, 1], [79, 1], [79, 1], [120, 1], [120, 1], [120, 1], [120, 1], [120, 1], [120, 1], [120, 1], [120, 1], [120, 1], [120, 1], [120, 1], [47, 1], [47, 2], [101, 1], [101, 2], [33, 1], [33, 1], [33, 1], [33, 1], [33, 1]],
    performAction: /* @__PURE__ */ __name(function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
      var $0 = $$.length - 1;
      switch (yystate) {
        case 2:
          this.$ = [];
          break;
        case 3:
          if (!Array.isArray($$[$0]) || $$[$0].length > 0) {
            $$[$0 - 1].push($$[$0]);
          }
          this.$ = $$[$0 - 1];
          break;
        case 4:
        case 183:
          this.$ = $$[$0];
          break;
        case 11:
          yy.setDirection("TB");
          this.$ = "TB";
          break;
        case 12:
          yy.setDirection($$[$0 - 1]);
          this.$ = $$[$0 - 1];
          break;
        case 27:
          this.$ = $$[$0 - 1].nodes;
          break;
        case 28:
        case 29:
        case 30:
        case 31:
        case 32:
          this.$ = [];
          break;
        case 33:
          this.$ = yy.addSubGraph($$[$0 - 6], $$[$0 - 1], $$[$0 - 4]);
          break;
        case 34:
          this.$ = yy.addSubGraph($$[$0 - 3], $$[$0 - 1], $$[$0 - 3]);
          break;
        case 35:
          this.$ = yy.addSubGraph(undefined, $$[$0 - 1], undefined);
          break;
        case 37:
          this.$ = $$[$0].trim();
          yy.setAccTitle(this.$);
          break;
        case 38:
        case 39:
          this.$ = $$[$0].trim();
          yy.setAccDescription(this.$);
          break;
        case 43:
          this.$ = $$[$0 - 1] + $$[$0];
          break;
        case 44:
          this.$ = $$[$0];
          break;
        case 45:
          yy.addVertex($$[$0 - 1][$$[$0 - 1].length - 1], undefined, undefined, undefined, undefined, undefined, undefined, $$[$0]);
          yy.addLink($$[$0 - 3].stmt, $$[$0 - 1], $$[$0 - 2]);
          this.$ = { stmt: $$[$0 - 1], nodes: $$[$0 - 1].concat($$[$0 - 3].nodes) };
          break;
        case 46:
          yy.addLink($$[$0 - 2].stmt, $$[$0], $$[$0 - 1]);
          this.$ = { stmt: $$[$0], nodes: $$[$0].concat($$[$0 - 2].nodes) };
          break;
        case 47:
          yy.addLink($$[$0 - 3].stmt, $$[$0 - 1], $$[$0 - 2]);
          this.$ = { stmt: $$[$0 - 1], nodes: $$[$0 - 1].concat($$[$0 - 3].nodes) };
          break;
        case 48:
          this.$ = { stmt: $$[$0 - 1], nodes: $$[$0 - 1] };
          break;
        case 49:
          yy.addVertex($$[$0 - 1][$$[$0 - 1].length - 1], undefined, undefined, undefined, undefined, undefined, undefined, $$[$0]);
          this.$ = { stmt: $$[$0 - 1], nodes: $$[$0 - 1], shapeData: $$[$0] };
          break;
        case 50:
          this.$ = { stmt: $$[$0], nodes: $$[$0] };
          break;
        case 51:
          this.$ = [$$[$0]];
          break;
        case 52:
          yy.addVertex($$[$0 - 5][$$[$0 - 5].length - 1], undefined, undefined, undefined, undefined, undefined, undefined, $$[$0 - 4]);
          this.$ = $$[$0 - 5].concat($$[$0]);
          break;
        case 53:
          this.$ = $$[$0 - 4].concat($$[$0]);
          break;
        case 54:
          this.$ = $$[$0];
          break;
        case 55:
          this.$ = $$[$0 - 2];
          yy.setClass($$[$0 - 2], $$[$0]);
          break;
        case 56:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "square");
          break;
        case 57:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "doublecircle");
          break;
        case 58:
          this.$ = $$[$0 - 5];
          yy.addVertex($$[$0 - 5], $$[$0 - 2], "circle");
          break;
        case 59:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "ellipse");
          break;
        case 60:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "stadium");
          break;
        case 61:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "subroutine");
          break;
        case 62:
          this.$ = $$[$0 - 7];
          yy.addVertex($$[$0 - 7], $$[$0 - 1], "rect", undefined, undefined, undefined, Object.fromEntries([[$$[$0 - 5], $$[$0 - 3]]]));
          break;
        case 63:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "cylinder");
          break;
        case 64:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "round");
          break;
        case 65:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "diamond");
          break;
        case 66:
          this.$ = $$[$0 - 5];
          yy.addVertex($$[$0 - 5], $$[$0 - 2], "hexagon");
          break;
        case 67:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "odd");
          break;
        case 68:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "trapezoid");
          break;
        case 69:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "inv_trapezoid");
          break;
        case 70:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "lean_right");
          break;
        case 71:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "lean_left");
          break;
        case 72:
          this.$ = $$[$0];
          yy.addVertex($$[$0]);
          break;
        case 73:
          $$[$0 - 1].text = $$[$0];
          this.$ = $$[$0 - 1];
          break;
        case 74:
        case 75:
          $$[$0 - 2].text = $$[$0 - 1];
          this.$ = $$[$0 - 2];
          break;
        case 76:
          this.$ = $$[$0];
          break;
        case 77:
          var inf = yy.destructLink($$[$0], $$[$0 - 2]);
          this.$ = { type: inf.type, stroke: inf.stroke, length: inf.length, text: $$[$0 - 1] };
          break;
        case 78:
          var inf = yy.destructLink($$[$0], $$[$0 - 2]);
          this.$ = { type: inf.type, stroke: inf.stroke, length: inf.length, text: $$[$0 - 1], id: $$[$0 - 3] };
          break;
        case 79:
          this.$ = { text: $$[$0], type: "text" };
          break;
        case 80:
          this.$ = { text: $$[$0 - 1].text + "" + $$[$0], type: $$[$0 - 1].type };
          break;
        case 81:
          this.$ = { text: $$[$0], type: "string" };
          break;
        case 82:
          this.$ = { text: $$[$0], type: "markdown" };
          break;
        case 83:
          var inf = yy.destructLink($$[$0]);
          this.$ = { type: inf.type, stroke: inf.stroke, length: inf.length };
          break;
        case 84:
          var inf = yy.destructLink($$[$0]);
          this.$ = { type: inf.type, stroke: inf.stroke, length: inf.length, id: $$[$0 - 1] };
          break;
        case 85:
          this.$ = $$[$0 - 1];
          break;
        case 86:
          this.$ = { text: $$[$0], type: "text" };
          break;
        case 87:
          this.$ = { text: $$[$0 - 1].text + "" + $$[$0], type: $$[$0 - 1].type };
          break;
        case 88:
          this.$ = { text: $$[$0], type: "string" };
          break;
        case 89:
        case 104:
          this.$ = { text: $$[$0], type: "markdown" };
          break;
        case 101:
          this.$ = { text: $$[$0], type: "text" };
          break;
        case 102:
          this.$ = { text: $$[$0 - 1].text + "" + $$[$0], type: $$[$0 - 1].type };
          break;
        case 103:
          this.$ = { text: $$[$0], type: "text" };
          break;
        case 105:
          this.$ = $$[$0 - 4];
          yy.addClass($$[$0 - 2], $$[$0]);
          break;
        case 106:
          this.$ = $$[$0 - 4];
          yy.setClass($$[$0 - 2], $$[$0]);
          break;
        case 107:
        case 115:
          this.$ = $$[$0 - 1];
          yy.setClickEvent($$[$0 - 1], $$[$0]);
          break;
        case 108:
        case 116:
          this.$ = $$[$0 - 3];
          yy.setClickEvent($$[$0 - 3], $$[$0 - 2]);
          yy.setTooltip($$[$0 - 3], $$[$0]);
          break;
        case 109:
          this.$ = $$[$0 - 2];
          yy.setClickEvent($$[$0 - 2], $$[$0 - 1], $$[$0]);
          break;
        case 110:
          this.$ = $$[$0 - 4];
          yy.setClickEvent($$[$0 - 4], $$[$0 - 3], $$[$0 - 2]);
          yy.setTooltip($$[$0 - 4], $$[$0]);
          break;
        case 111:
          this.$ = $$[$0 - 2];
          yy.setLink($$[$0 - 2], $$[$0]);
          break;
        case 112:
          this.$ = $$[$0 - 4];
          yy.setLink($$[$0 - 4], $$[$0 - 2]);
          yy.setTooltip($$[$0 - 4], $$[$0]);
          break;
        case 113:
          this.$ = $$[$0 - 4];
          yy.setLink($$[$0 - 4], $$[$0 - 2], $$[$0]);
          break;
        case 114:
          this.$ = $$[$0 - 6];
          yy.setLink($$[$0 - 6], $$[$0 - 4], $$[$0]);
          yy.setTooltip($$[$0 - 6], $$[$0 - 2]);
          break;
        case 117:
          this.$ = $$[$0 - 1];
          yy.setLink($$[$0 - 1], $$[$0]);
          break;
        case 118:
          this.$ = $$[$0 - 3];
          yy.setLink($$[$0 - 3], $$[$0 - 2]);
          yy.setTooltip($$[$0 - 3], $$[$0]);
          break;
        case 119:
          this.$ = $$[$0 - 3];
          yy.setLink($$[$0 - 3], $$[$0 - 2], $$[$0]);
          break;
        case 120:
          this.$ = $$[$0 - 5];
          yy.setLink($$[$0 - 5], $$[$0 - 4], $$[$0]);
          yy.setTooltip($$[$0 - 5], $$[$0 - 2]);
          break;
        case 121:
          this.$ = $$[$0 - 4];
          yy.addVertex($$[$0 - 2], undefined, undefined, $$[$0]);
          break;
        case 122:
          this.$ = $$[$0 - 4];
          yy.updateLink([$$[$0 - 2]], $$[$0]);
          break;
        case 123:
          this.$ = $$[$0 - 4];
          yy.updateLink($$[$0 - 2], $$[$0]);
          break;
        case 124:
          this.$ = $$[$0 - 8];
          yy.updateLinkInterpolate([$$[$0 - 6]], $$[$0 - 2]);
          yy.updateLink([$$[$0 - 6]], $$[$0]);
          break;
        case 125:
          this.$ = $$[$0 - 8];
          yy.updateLinkInterpolate($$[$0 - 6], $$[$0 - 2]);
          yy.updateLink($$[$0 - 6], $$[$0]);
          break;
        case 126:
          this.$ = $$[$0 - 6];
          yy.updateLinkInterpolate([$$[$0 - 4]], $$[$0]);
          break;
        case 127:
          this.$ = $$[$0 - 6];
          yy.updateLinkInterpolate($$[$0 - 4], $$[$0]);
          break;
        case 128:
        case 130:
          this.$ = [$$[$0]];
          break;
        case 129:
        case 131:
          $$[$0 - 2].push($$[$0]);
          this.$ = $$[$0 - 2];
          break;
        case 133:
          this.$ = $$[$0 - 1] + $$[$0];
          break;
        case 181:
          this.$ = $$[$0];
          break;
        case 182:
          this.$ = $$[$0 - 1] + "" + $$[$0];
          break;
        case 184:
          this.$ = $$[$0 - 1] + "" + $$[$0];
          break;
        case 185:
          this.$ = { stmt: "dir", value: "TB" };
          break;
        case 186:
          this.$ = { stmt: "dir", value: "BT" };
          break;
        case 187:
          this.$ = { stmt: "dir", value: "RL" };
          break;
        case 188:
          this.$ = { stmt: "dir", value: "LR" };
          break;
        case 189:
          this.$ = { stmt: "dir", value: "TD" };
          break;
      }
    }, "anonymous"),
    table: [{ 3: 1, 4: 2, 9: $V0, 10: $V1, 12: $V2 }, { 1: [3] }, o($V3, $V4, { 5: 6 }), { 4: 7, 9: $V0, 10: $V1, 12: $V2 }, { 4: 8, 9: $V0, 10: $V1, 12: $V2 }, { 13: [1, 9], 14: [1, 10] }, { 1: [2, 1], 6: 11, 7: 12, 8: $V5, 9: $V6, 10: $V7, 11: $V8, 20: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V9, 33: 24, 34: $Va, 36: $Vb, 38: $Vc, 42: 28, 43: 39, 44: $Vd, 45: 40, 47: 41, 60: $Ve, 84: $Vf, 85: $Vg, 86: $Vh, 87: $Vi, 88: $Vj, 89: $Vk, 102: $Vl, 105: $Vm, 106: $Vn, 109: $Vo, 111: $Vp, 113: 42, 114: $Vq, 115: $Vr, 116: $Vs, 121: $Vt, 122: $Vu, 123: $Vv, 124: $Vw, 125: $Vx }, o($V3, [2, 9]), o($V3, [2, 10]), o($V3, [2, 11]), { 8: [1, 55], 9: [1, 56], 10: $Vy, 15: 54, 18: 57 }, o($Vz, [2, 3]), o($Vz, [2, 4]), o($Vz, [2, 5]), o($Vz, [2, 6]), o($Vz, [2, 7]), o($Vz, [2, 8]), { 8: $VA, 9: $VB, 11: $VC, 21: 59, 41: 60, 72: 64, 75: [1, 65], 77: [1, 67], 78: [1, 66] }, { 8: $VA, 9: $VB, 11: $VC, 21: 68 }, { 8: $VA, 9: $VB, 11: $VC, 21: 69 }, { 8: $VA, 9: $VB, 11: $VC, 21: 70 }, { 8: $VA, 9: $VB, 11: $VC, 21: 71 }, { 8: $VA, 9: $VB, 11: $VC, 21: 72 }, { 8: $VA, 9: $VB, 10: [1, 73], 11: $VC, 21: 74 }, o($Vz, [2, 36]), { 35: [1, 75] }, { 37: [1, 76] }, o($Vz, [2, 39]), o($VD, [2, 50], { 18: 77, 39: 78, 10: $Vy, 40: $VE }), { 10: [1, 80] }, { 10: [1, 81] }, { 10: [1, 82] }, { 10: [1, 83] }, { 14: $VF, 44: $VG, 60: $VH, 80: [1, 87], 89: $VI, 95: [1, 84], 97: [1, 85], 101: 86, 105: $VJ, 106: $VK, 109: $VL, 111: $VM, 114: $VN, 115: $VO, 116: $VP, 120: 88 }, o($Vz, [2, 185]), o($Vz, [2, 186]), o($Vz, [2, 187]), o($Vz, [2, 188]), o($Vz, [2, 189]), o($VQ, [2, 51]), o($VQ, [2, 54], { 46: [1, 100] }), o($VR, [2, 72], { 113: 113, 29: [1, 101], 44: $Vd, 48: [1, 102], 50: [1, 103], 52: [1, 104], 54: [1, 105], 56: [1, 106], 58: [1, 107], 60: $Ve, 63: [1, 108], 65: [1, 109], 67: [1, 110], 68: [1, 111], 70: [1, 112], 89: $Vk, 102: $Vl, 105: $Vm, 106: $Vn, 109: $Vo, 111: $Vp, 114: $Vq, 115: $Vr, 116: $Vs }), o($VS, [2, 181]), o($VS, [2, 142]), o($VS, [2, 143]), o($VS, [2, 144]), o($VS, [2, 145]), o($VS, [2, 146]), o($VS, [2, 147]), o($VS, [2, 148]), o($VS, [2, 149]), o($VS, [2, 150]), o($VS, [2, 151]), o($VS, [2, 152]), o($V3, [2, 12]), o($V3, [2, 18]), o($V3, [2, 19]), { 9: [1, 114] }, o($VT, [2, 26], { 18: 115, 10: $Vy }), o($Vz, [2, 27]), { 42: 116, 43: 39, 44: $Vd, 45: 40, 47: 41, 60: $Ve, 89: $Vk, 102: $Vl, 105: $Vm, 106: $Vn, 109: $Vo, 111: $Vp, 113: 42, 114: $Vq, 115: $Vr, 116: $Vs }, o($Vz, [2, 40]), o($Vz, [2, 41]), o($Vz, [2, 42]), o($VU, [2, 76], { 73: 117, 62: [1, 119], 74: [1, 118] }), { 76: 120, 79: 121, 80: $VV, 81: $VW, 116: $VX, 119: $VY }, { 75: [1, 126], 77: [1, 127] }, o($VZ, [2, 83]), o($Vz, [2, 28]), o($Vz, [2, 29]), o($Vz, [2, 30]), o($Vz, [2, 31]), o($Vz, [2, 32]), { 10: $V_, 12: $V$, 14: $V01, 27: $V11, 28: 128, 32: $V21, 44: $V31, 60: $V41, 75: $V51, 80: [1, 130], 81: [1, 131], 83: 141, 84: $V61, 85: $V71, 86: $V81, 87: $V91, 88: $Va1, 89: $Vb1, 90: $Vc1, 91: 129, 105: $Vd1, 109: $Ve1, 111: $Vf1, 114: $Vg1, 115: $Vh1, 116: $Vi1 }, o($Vj1, $V4, { 5: 154 }), o($Vz, [2, 37]), o($Vz, [2, 38]), o($VD, [2, 48], { 44: $Vk1 }), o($VD, [2, 49], { 18: 156, 10: $Vy, 40: $Vl1 }), o($VQ, [2, 44]), { 44: $Vd, 47: 158, 60: $Ve, 89: $Vk, 102: $Vl, 105: $Vm, 106: $Vn, 109: $Vo, 111: $Vp, 113: 42, 114: $Vq, 115: $Vr, 116: $Vs }, { 102: [1, 159], 103: 160, 105: [1, 161] }, { 44: $Vd, 47: 162, 60: $Ve, 89: $Vk, 102: $Vl, 105: $Vm, 106: $Vn, 109: $Vo, 111: $Vp, 113: 42, 114: $Vq, 115: $Vr, 116: $Vs }, { 44: $Vd, 47: 163, 60: $Ve, 89: $Vk, 102: $Vl, 105: $Vm, 106: $Vn, 109: $Vo, 111: $Vp, 113: 42, 114: $Vq, 115: $Vr, 116: $Vs }, o($Vm1, [2, 107], { 10: [1, 164], 96: [1, 165] }), { 80: [1, 166] }, o($Vm1, [2, 115], { 120: 168, 10: [1, 167], 14: $VF, 44: $VG, 60: $VH, 89: $VI, 105: $VJ, 106: $VK, 109: $VL, 111: $VM, 114: $VN, 115: $VO, 116: $VP }), o($Vm1, [2, 117], { 10: [1, 169] }), o($Vn1, [2, 183]), o($Vn1, [2, 170]), o($Vn1, [2, 171]), o($Vn1, [2, 172]), o($Vn1, [2, 173]), o($Vn1, [2, 174]), o($Vn1, [2, 175]), o($Vn1, [2, 176]), o($Vn1, [2, 177]), o($Vn1, [2, 178]), o($Vn1, [2, 179]), o($Vn1, [2, 180]), { 44: $Vd, 47: 170, 60: $Ve, 89: $Vk, 102: $Vl, 105: $Vm, 106: $Vn, 109: $Vo, 111: $Vp, 113: 42, 114: $Vq, 115: $Vr, 116: $Vs }, { 30: 171, 67: $Vo1, 80: $Vp1, 81: $Vq1, 82: 172, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 30: 179, 67: $Vo1, 80: $Vp1, 81: $Vq1, 82: 172, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 30: 181, 50: [1, 180], 67: $Vo1, 80: $Vp1, 81: $Vq1, 82: 172, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 30: 182, 67: $Vo1, 80: $Vp1, 81: $Vq1, 82: 172, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 30: 183, 67: $Vo1, 80: $Vp1, 81: $Vq1, 82: 172, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 30: 184, 67: $Vo1, 80: $Vp1, 81: $Vq1, 82: 172, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 109: [1, 185] }, { 30: 186, 67: $Vo1, 80: $Vp1, 81: $Vq1, 82: 172, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 30: 187, 65: [1, 188], 67: $Vo1, 80: $Vp1, 81: $Vq1, 82: 172, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 30: 189, 67: $Vo1, 80: $Vp1, 81: $Vq1, 82: 172, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 30: 190, 67: $Vo1, 80: $Vp1, 81: $Vq1, 82: 172, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 30: 191, 67: $Vo1, 80: $Vp1, 81: $Vq1, 82: 172, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, o($VS, [2, 182]), o($V3, [2, 20]), o($VT, [2, 25]), o($VD, [2, 46], { 39: 192, 18: 193, 10: $Vy, 40: $VE }), o($VU, [2, 73], { 10: [1, 194] }), { 10: [1, 195] }, { 30: 196, 67: $Vo1, 80: $Vp1, 81: $Vq1, 82: 172, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 77: [1, 197], 79: 198, 116: $VX, 119: $VY }, o($Vu1, [2, 79]), o($Vu1, [2, 81]), o($Vu1, [2, 82]), o($Vu1, [2, 168]), o($Vu1, [2, 169]), { 76: 199, 79: 121, 80: $VV, 81: $VW, 116: $VX, 119: $VY }, o($VZ, [2, 84]), { 8: $VA, 9: $VB, 10: $V_, 11: $VC, 12: $V$, 14: $V01, 21: 201, 27: $V11, 29: [1, 200], 32: $V21, 44: $V31, 60: $V41, 75: $V51, 83: 141, 84: $V61, 85: $V71, 86: $V81, 87: $V91, 88: $Va1, 89: $Vb1, 90: $Vc1, 91: 202, 105: $Vd1, 109: $Ve1, 111: $Vf1, 114: $Vg1, 115: $Vh1, 116: $Vi1 }, o($Vv1, [2, 101]), o($Vv1, [2, 103]), o($Vv1, [2, 104]), o($Vv1, [2, 157]), o($Vv1, [2, 158]), o($Vv1, [2, 159]), o($Vv1, [2, 160]), o($Vv1, [2, 161]), o($Vv1, [2, 162]), o($Vv1, [2, 163]), o($Vv1, [2, 164]), o($Vv1, [2, 165]), o($Vv1, [2, 166]), o($Vv1, [2, 167]), o($Vv1, [2, 90]), o($Vv1, [2, 91]), o($Vv1, [2, 92]), o($Vv1, [2, 93]), o($Vv1, [2, 94]), o($Vv1, [2, 95]), o($Vv1, [2, 96]), o($Vv1, [2, 97]), o($Vv1, [2, 98]), o($Vv1, [2, 99]), o($Vv1, [2, 100]), { 6: 11, 7: 12, 8: $V5, 9: $V6, 10: $V7, 11: $V8, 20: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V9, 32: [1, 203], 33: 24, 34: $Va, 36: $Vb, 38: $Vc, 42: 28, 43: 39, 44: $Vd, 45: 40, 47: 41, 60: $Ve, 84: $Vf, 85: $Vg, 86: $Vh, 87: $Vi, 88: $Vj, 89: $Vk, 102: $Vl, 105: $Vm, 106: $Vn, 109: $Vo, 111: $Vp, 113: 42, 114: $Vq, 115: $Vr, 116: $Vs, 121: $Vt, 122: $Vu, 123: $Vv, 124: $Vw, 125: $Vx }, { 10: $Vy, 18: 204 }, { 44: [1, 205] }, o($VQ, [2, 43]), { 10: [1, 206], 44: $Vd, 60: $Ve, 89: $Vk, 102: $Vl, 105: $Vm, 106: $Vn, 109: $Vo, 111: $Vp, 113: 113, 114: $Vq, 115: $Vr, 116: $Vs }, { 10: [1, 207] }, { 10: [1, 208], 106: [1, 209] }, o($Vw1, [2, 128]), { 10: [1, 210], 44: $Vd, 60: $Ve, 89: $Vk, 102: $Vl, 105: $Vm, 106: $Vn, 109: $Vo, 111: $Vp, 113: 113, 114: $Vq, 115: $Vr, 116: $Vs }, { 10: [1, 211], 44: $Vd, 60: $Ve, 89: $Vk, 102: $Vl, 105: $Vm, 106: $Vn, 109: $Vo, 111: $Vp, 113: 113, 114: $Vq, 115: $Vr, 116: $Vs }, { 80: [1, 212] }, o($Vm1, [2, 109], { 10: [1, 213] }), o($Vm1, [2, 111], { 10: [1, 214] }), { 80: [1, 215] }, o($Vn1, [2, 184]), { 80: [1, 216], 98: [1, 217] }, o($VQ, [2, 55], { 113: 113, 44: $Vd, 60: $Ve, 89: $Vk, 102: $Vl, 105: $Vm, 106: $Vn, 109: $Vo, 111: $Vp, 114: $Vq, 115: $Vr, 116: $Vs }), { 31: [1, 218], 67: $Vo1, 82: 219, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, o($Vx1, [2, 86]), o($Vx1, [2, 88]), o($Vx1, [2, 89]), o($Vx1, [2, 153]), o($Vx1, [2, 154]), o($Vx1, [2, 155]), o($Vx1, [2, 156]), { 49: [1, 220], 67: $Vo1, 82: 219, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 30: 221, 67: $Vo1, 80: $Vp1, 81: $Vq1, 82: 172, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 51: [1, 222], 67: $Vo1, 82: 219, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 53: [1, 223], 67: $Vo1, 82: 219, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 55: [1, 224], 67: $Vo1, 82: 219, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 57: [1, 225], 67: $Vo1, 82: 219, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 60: [1, 226] }, { 64: [1, 227], 67: $Vo1, 82: 219, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 66: [1, 228], 67: $Vo1, 82: 219, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 30: 229, 67: $Vo1, 80: $Vp1, 81: $Vq1, 82: 172, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 31: [1, 230], 67: $Vo1, 82: 219, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 67: $Vo1, 69: [1, 231], 71: [1, 232], 82: 219, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 67: $Vo1, 69: [1, 234], 71: [1, 233], 82: 219, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, o($VD, [2, 45], { 18: 156, 10: $Vy, 40: $Vl1 }), o($VD, [2, 47], { 44: $Vk1 }), o($VU, [2, 75]), o($VU, [2, 74]), { 62: [1, 235], 67: $Vo1, 82: 219, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, o($VU, [2, 77]), o($Vu1, [2, 80]), { 77: [1, 236], 79: 198, 116: $VX, 119: $VY }, { 30: 237, 67: $Vo1, 80: $Vp1, 81: $Vq1, 82: 172, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, o($Vj1, $V4, { 5: 238 }), o($Vv1, [2, 102]), o($Vz, [2, 35]), { 43: 239, 44: $Vd, 45: 40, 47: 41, 60: $Ve, 89: $Vk, 102: $Vl, 105: $Vm, 106: $Vn, 109: $Vo, 111: $Vp, 113: 42, 114: $Vq, 115: $Vr, 116: $Vs }, { 10: $Vy, 18: 240 }, { 10: $Vy1, 60: $Vz1, 84: $VA1, 92: 241, 105: $VB1, 107: 242, 108: 243, 109: $VC1, 110: $VD1, 111: $VE1, 112: $VF1 }, { 10: $Vy1, 60: $Vz1, 84: $VA1, 92: 252, 104: [1, 253], 105: $VB1, 107: 242, 108: 243, 109: $VC1, 110: $VD1, 111: $VE1, 112: $VF1 }, { 10: $Vy1, 60: $Vz1, 84: $VA1, 92: 254, 104: [1, 255], 105: $VB1, 107: 242, 108: 243, 109: $VC1, 110: $VD1, 111: $VE1, 112: $VF1 }, { 105: [1, 256] }, { 10: $Vy1, 60: $Vz1, 84: $VA1, 92: 257, 105: $VB1, 107: 242, 108: 243, 109: $VC1, 110: $VD1, 111: $VE1, 112: $VF1 }, { 44: $Vd, 47: 258, 60: $Ve, 89: $Vk, 102: $Vl, 105: $Vm, 106: $Vn, 109: $Vo, 111: $Vp, 113: 42, 114: $Vq, 115: $Vr, 116: $Vs }, o($Vm1, [2, 108]), { 80: [1, 259] }, { 80: [1, 260], 98: [1, 261] }, o($Vm1, [2, 116]), o($Vm1, [2, 118], { 10: [1, 262] }), o($Vm1, [2, 119]), o($VR, [2, 56]), o($Vx1, [2, 87]), o($VR, [2, 57]), { 51: [1, 263], 67: $Vo1, 82: 219, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, o($VR, [2, 64]), o($VR, [2, 59]), o($VR, [2, 60]), o($VR, [2, 61]), { 109: [1, 264] }, o($VR, [2, 63]), o($VR, [2, 65]), { 66: [1, 265], 67: $Vo1, 82: 219, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, o($VR, [2, 67]), o($VR, [2, 68]), o($VR, [2, 70]), o($VR, [2, 69]), o($VR, [2, 71]), o([10, 44, 60, 89, 102, 105, 106, 109, 111, 114, 115, 116], [2, 85]), o($VU, [2, 78]), { 31: [1, 266], 67: $Vo1, 82: 219, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 6: 11, 7: 12, 8: $V5, 9: $V6, 10: $V7, 11: $V8, 20: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V9, 32: [1, 267], 33: 24, 34: $Va, 36: $Vb, 38: $Vc, 42: 28, 43: 39, 44: $Vd, 45: 40, 47: 41, 60: $Ve, 84: $Vf, 85: $Vg, 86: $Vh, 87: $Vi, 88: $Vj, 89: $Vk, 102: $Vl, 105: $Vm, 106: $Vn, 109: $Vo, 111: $Vp, 113: 42, 114: $Vq, 115: $Vr, 116: $Vs, 121: $Vt, 122: $Vu, 123: $Vv, 124: $Vw, 125: $Vx }, o($VQ, [2, 53]), { 43: 268, 44: $Vd, 45: 40, 47: 41, 60: $Ve, 89: $Vk, 102: $Vl, 105: $Vm, 106: $Vn, 109: $Vo, 111: $Vp, 113: 42, 114: $Vq, 115: $Vr, 116: $Vs }, o($Vm1, [2, 121], { 106: $VG1 }), o($VH1, [2, 130], { 108: 270, 10: $Vy1, 60: $Vz1, 84: $VA1, 105: $VB1, 109: $VC1, 110: $VD1, 111: $VE1, 112: $VF1 }), o($VI1, [2, 132]), o($VI1, [2, 134]), o($VI1, [2, 135]), o($VI1, [2, 136]), o($VI1, [2, 137]), o($VI1, [2, 138]), o($VI1, [2, 139]), o($VI1, [2, 140]), o($VI1, [2, 141]), o($Vm1, [2, 122], { 106: $VG1 }), { 10: [1, 271] }, o($Vm1, [2, 123], { 106: $VG1 }), { 10: [1, 272] }, o($Vw1, [2, 129]), o($Vm1, [2, 105], { 106: $VG1 }), o($Vm1, [2, 106], { 113: 113, 44: $Vd, 60: $Ve, 89: $Vk, 102: $Vl, 105: $Vm, 106: $Vn, 109: $Vo, 111: $Vp, 114: $Vq, 115: $Vr, 116: $Vs }), o($Vm1, [2, 110]), o($Vm1, [2, 112], { 10: [1, 273] }), o($Vm1, [2, 113]), { 98: [1, 274] }, { 51: [1, 275] }, { 62: [1, 276] }, { 66: [1, 277] }, { 8: $VA, 9: $VB, 11: $VC, 21: 278 }, o($Vz, [2, 34]), o($VQ, [2, 52]), { 10: $Vy1, 60: $Vz1, 84: $VA1, 105: $VB1, 107: 279, 108: 243, 109: $VC1, 110: $VD1, 111: $VE1, 112: $VF1 }, o($VI1, [2, 133]), { 14: $VF, 44: $VG, 60: $VH, 89: $VI, 101: 280, 105: $VJ, 106: $VK, 109: $VL, 111: $VM, 114: $VN, 115: $VO, 116: $VP, 120: 88 }, { 14: $VF, 44: $VG, 60: $VH, 89: $VI, 101: 281, 105: $VJ, 106: $VK, 109: $VL, 111: $VM, 114: $VN, 115: $VO, 116: $VP, 120: 88 }, { 98: [1, 282] }, o($Vm1, [2, 120]), o($VR, [2, 58]), { 30: 283, 67: $Vo1, 80: $Vp1, 81: $Vq1, 82: 172, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, o($VR, [2, 66]), o($Vj1, $V4, { 5: 284 }), o($VH1, [2, 131], { 108: 270, 10: $Vy1, 60: $Vz1, 84: $VA1, 105: $VB1, 109: $VC1, 110: $VD1, 111: $VE1, 112: $VF1 }), o($Vm1, [2, 126], { 120: 168, 10: [1, 285], 14: $VF, 44: $VG, 60: $VH, 89: $VI, 105: $VJ, 106: $VK, 109: $VL, 111: $VM, 114: $VN, 115: $VO, 116: $VP }), o($Vm1, [2, 127], { 120: 168, 10: [1, 286], 14: $VF, 44: $VG, 60: $VH, 89: $VI, 105: $VJ, 106: $VK, 109: $VL, 111: $VM, 114: $VN, 115: $VO, 116: $VP }), o($Vm1, [2, 114]), { 31: [1, 287], 67: $Vo1, 82: 219, 116: $Vr1, 117: $Vs1, 118: $Vt1 }, { 6: 11, 7: 12, 8: $V5, 9: $V6, 10: $V7, 11: $V8, 20: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V9, 32: [1, 288], 33: 24, 34: $Va, 36: $Vb, 38: $Vc, 42: 28, 43: 39, 44: $Vd, 45: 40, 47: 41, 60: $Ve, 84: $Vf, 85: $Vg, 86: $Vh, 87: $Vi, 88: $Vj, 89: $Vk, 102: $Vl, 105: $Vm, 106: $Vn, 109: $Vo, 111: $Vp, 113: 42, 114: $Vq, 115: $Vr, 116: $Vs, 121: $Vt, 122: $Vu, 123: $Vv, 124: $Vw, 125: $Vx }, { 10: $Vy1, 60: $Vz1, 84: $VA1, 92: 289, 105: $VB1, 107: 242, 108: 243, 109: $VC1, 110: $VD1, 111: $VE1, 112: $VF1 }, { 10: $Vy1, 60: $Vz1, 84: $VA1, 92: 290, 105: $VB1, 107: 242, 108: 243, 109: $VC1, 110: $VD1, 111: $VE1, 112: $VF1 }, o($VR, [2, 62]), o($Vz, [2, 33]), o($Vm1, [2, 124], { 106: $VG1 }), o($Vm1, [2, 125], { 106: $VG1 })],
    defaultActions: {},
    parseError: /* @__PURE__ */ __name(function parseError(str, hash) {
      if (hash.recoverable) {
        this.trace(str);
      } else {
        var error = new Error(str);
        error.hash = hash;
        throw error;
      }
    }, "parseError"),
    parse: /* @__PURE__ */ __name(function parse(input) {
      var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
      var args = lstack.slice.call(arguments, 1);
      var lexer2 = Object.create(this.lexer);
      var sharedState = { yy: {} };
      for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
          sharedState.yy[k] = this.yy[k];
        }
      }
      lexer2.setInput(input, sharedState.yy);
      sharedState.yy.lexer = lexer2;
      sharedState.yy.parser = this;
      if (typeof lexer2.yylloc == "undefined") {
        lexer2.yylloc = {};
      }
      var yyloc = lexer2.yylloc;
      lstack.push(yyloc);
      var ranges = lexer2.options && lexer2.options.ranges;
      if (typeof sharedState.yy.parseError === "function") {
        this.parseError = sharedState.yy.parseError;
      } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
      }
      function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
      }
      __name(popStack, "popStack");
      function lex() {
        var token;
        token = tstack.pop() || lexer2.lex() || EOF;
        if (typeof token !== "number") {
          if (token instanceof Array) {
            tstack = token;
            token = tstack.pop();
          }
          token = self.symbols_[token] || token;
        }
        return token;
      }
      __name(lex, "lex");
      var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
      while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
          action = this.defaultActions[state];
        } else {
          if (symbol === null || typeof symbol == "undefined") {
            symbol = lex();
          }
          action = table[state] && table[state][symbol];
        }
        if (typeof action === "undefined" || !action.length || !action[0]) {
          var errStr = "";
          expected = [];
          for (p in table[state]) {
            if (this.terminals_[p] && p > TERROR) {
              expected.push("'" + this.terminals_[p] + "'");
            }
          }
          if (lexer2.showPosition) {
            errStr = "Parse error on line " + (yylineno + 1) + `:
` + lexer2.showPosition() + `
Expecting ` + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
          } else {
            errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == EOF ? "end of input" : "'" + (this.terminals_[symbol] || symbol) + "'");
          }
          this.parseError(errStr, {
            text: lexer2.match,
            token: this.terminals_[symbol] || symbol,
            line: lexer2.yylineno,
            loc: yyloc,
            expected
          });
        }
        if (action[0] instanceof Array && action.length > 1) {
          throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
        }
        switch (action[0]) {
          case 1:
            stack.push(symbol);
            vstack.push(lexer2.yytext);
            lstack.push(lexer2.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
              yyleng = lexer2.yyleng;
              yytext = lexer2.yytext;
              yylineno = lexer2.yylineno;
              yyloc = lexer2.yylloc;
              if (recovering > 0) {
                recovering--;
              }
            } else {
              symbol = preErrorSymbol;
              preErrorSymbol = null;
            }
            break;
          case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
              first_line: lstack[lstack.length - (len || 1)].first_line,
              last_line: lstack[lstack.length - 1].last_line,
              first_column: lstack[lstack.length - (len || 1)].first_column,
              last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
              yyval._$.range = [
                lstack[lstack.length - (len || 1)].range[0],
                lstack[lstack.length - 1].range[1]
              ];
            }
            r = this.performAction.apply(yyval, [
              yytext,
              yyleng,
              yylineno,
              sharedState.yy,
              action[1],
              vstack,
              lstack
            ].concat(args));
            if (typeof r !== "undefined") {
              return r;
            }
            if (len) {
              stack = stack.slice(0, -1 * len * 2);
              vstack = vstack.slice(0, -1 * len);
              lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
          case 3:
            return true;
        }
      }
      return true;
    }, "parse")
  };
  var lexer = /* @__PURE__ */ function() {
    var lexer2 = {
      EOF: 1,
      parseError: /* @__PURE__ */ __name(function parseError(str, hash) {
        if (this.yy.parser) {
          this.yy.parser.parseError(str, hash);
        } else {
          throw new Error(str);
        }
      }, "parseError"),
      setInput: /* @__PURE__ */ __name(function(input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = "";
        this.conditionStack = ["INITIAL"];
        this.yylloc = {
          first_line: 1,
          first_column: 0,
          last_line: 1,
          last_column: 0
        };
        if (this.options.ranges) {
          this.yylloc.range = [0, 0];
        }
        this.offset = 0;
        return this;
      }, "setInput"),
      input: /* @__PURE__ */ __name(function() {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
          this.yylineno++;
          this.yylloc.last_line++;
        } else {
          this.yylloc.last_column++;
        }
        if (this.options.ranges) {
          this.yylloc.range[1]++;
        }
        this._input = this._input.slice(1);
        return ch;
      }, "input"),
      unput: /* @__PURE__ */ __name(function(ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);
        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);
        if (lines.length - 1) {
          this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;
        this.yylloc = {
          first_line: this.yylloc.first_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.first_column,
          last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len
        };
        if (this.options.ranges) {
          this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
      }, "unput"),
      more: /* @__PURE__ */ __name(function() {
        this._more = true;
        return this;
      }, "more"),
      reject: /* @__PURE__ */ __name(function() {
        if (this.options.backtrack_lexer) {
          this._backtrack = true;
        } else {
          return this.parseError("Lexical error on line " + (this.yylineno + 1) + `. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
` + this.showPosition(), {
            text: "",
            token: null,
            line: this.yylineno
          });
        }
        return this;
      }, "reject"),
      less: /* @__PURE__ */ __name(function(n) {
        this.unput(this.match.slice(n));
      }, "less"),
      pastInput: /* @__PURE__ */ __name(function() {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? "..." : "") + past.substr(-20).replace(/\n/g, "");
      }, "pastInput"),
      upcomingInput: /* @__PURE__ */ __name(function() {
        var next = this.match;
        if (next.length < 20) {
          next += this._input.substr(0, 20 - next.length);
        }
        return (next.substr(0, 20) + (next.length > 20 ? "..." : "")).replace(/\n/g, "");
      }, "upcomingInput"),
      showPosition: /* @__PURE__ */ __name(function() {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + `
` + c + "^";
      }, "showPosition"),
      test_match: /* @__PURE__ */ __name(function(match, indexed_rule) {
        var token, lines, backup;
        if (this.options.backtrack_lexer) {
          backup = {
            yylineno: this.yylineno,
            yylloc: {
              first_line: this.yylloc.first_line,
              last_line: this.last_line,
              first_column: this.yylloc.first_column,
              last_column: this.yylloc.last_column
            },
            yytext: this.yytext,
            match: this.match,
            matches: this.matches,
            matched: this.matched,
            yyleng: this.yyleng,
            offset: this.offset,
            _more: this._more,
            _input: this._input,
            yy: this.yy,
            conditionStack: this.conditionStack.slice(0),
            done: this.done
          };
          if (this.options.ranges) {
            backup.yylloc.range = this.yylloc.range.slice(0);
          }
        }
        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
          this.yylineno += lines.length;
        }
        this.yylloc = {
          first_line: this.yylloc.last_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.last_column,
          last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
          this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
          this.done = false;
        }
        if (token) {
          return token;
        } else if (this._backtrack) {
          for (var k in backup) {
            this[k] = backup[k];
          }
          return false;
        }
        return false;
      }, "test_match"),
      next: /* @__PURE__ */ __name(function() {
        if (this.done) {
          return this.EOF;
        }
        if (!this._input) {
          this.done = true;
        }
        var token, match, tempMatch, index;
        if (!this._more) {
          this.yytext = "";
          this.match = "";
        }
        var rules = this._currentRules();
        for (var i = 0;i < rules.length; i++) {
          tempMatch = this._input.match(this.rules[rules[i]]);
          if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
            match = tempMatch;
            index = i;
            if (this.options.backtrack_lexer) {
              token = this.test_match(tempMatch, rules[i]);
              if (token !== false) {
                return token;
              } else if (this._backtrack) {
                match = false;
                continue;
              } else {
                return false;
              }
            } else if (!this.options.flex) {
              break;
            }
          }
        }
        if (match) {
          token = this.test_match(match, rules[index]);
          if (token !== false) {
            return token;
          }
          return false;
        }
        if (this._input === "") {
          return this.EOF;
        } else {
          return this.parseError("Lexical error on line " + (this.yylineno + 1) + `. Unrecognized text.
` + this.showPosition(), {
            text: "",
            token: null,
            line: this.yylineno
          });
        }
      }, "next"),
      lex: /* @__PURE__ */ __name(function lex() {
        var r = this.next();
        if (r) {
          return r;
        } else {
          return this.lex();
        }
      }, "lex"),
      begin: /* @__PURE__ */ __name(function begin(condition) {
        this.conditionStack.push(condition);
      }, "begin"),
      popState: /* @__PURE__ */ __name(function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
          return this.conditionStack.pop();
        } else {
          return this.conditionStack[0];
        }
      }, "popState"),
      _currentRules: /* @__PURE__ */ __name(function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
          return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
          return this.conditions["INITIAL"].rules;
        }
      }, "_currentRules"),
      topState: /* @__PURE__ */ __name(function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
          return this.conditionStack[n];
        } else {
          return "INITIAL";
        }
      }, "topState"),
      pushState: /* @__PURE__ */ __name(function pushState(condition) {
        this.begin(condition);
      }, "pushState"),
      stateStackSize: /* @__PURE__ */ __name(function stateStackSize() {
        return this.conditionStack.length;
      }, "stateStackSize"),
      options: {},
      performAction: /* @__PURE__ */ __name(function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {
        var YYSTATE = YY_START;
        switch ($avoiding_name_collisions) {
          case 0:
            this.begin("acc_title");
            return 34;
            break;
          case 1:
            this.popState();
            return "acc_title_value";
            break;
          case 2:
            this.begin("acc_descr");
            return 36;
            break;
          case 3:
            this.popState();
            return "acc_descr_value";
            break;
          case 4:
            this.begin("acc_descr_multiline");
            break;
          case 5:
            this.popState();
            break;
          case 6:
            return "acc_descr_multiline_value";
            break;
          case 7:
            this.pushState("shapeData");
            yy_.yytext = "";
            return 40;
            break;
          case 8:
            this.pushState("shapeDataStr");
            return 40;
            break;
          case 9:
            this.popState();
            return 40;
            break;
          case 10:
            const re = /\n\s*/g;
            yy_.yytext = yy_.yytext.replace(re, "<br/>");
            return 40;
            break;
          case 11:
            return 40;
            break;
          case 12:
            this.popState();
            break;
          case 13:
            this.begin("callbackname");
            break;
          case 14:
            this.popState();
            break;
          case 15:
            this.popState();
            this.begin("callbackargs");
            break;
          case 16:
            return 95;
            break;
          case 17:
            this.popState();
            break;
          case 18:
            return 96;
            break;
          case 19:
            return "MD_STR";
            break;
          case 20:
            this.popState();
            break;
          case 21:
            this.begin("md_string");
            break;
          case 22:
            return "STR";
            break;
          case 23:
            this.popState();
            break;
          case 24:
            this.pushState("string");
            break;
          case 25:
            return 84;
            break;
          case 26:
            return 102;
            break;
          case 27:
            return 85;
            break;
          case 28:
            return 104;
            break;
          case 29:
            return 86;
            break;
          case 30:
            return 87;
            break;
          case 31:
            return 97;
            break;
          case 32:
            this.begin("click");
            break;
          case 33:
            this.popState();
            break;
          case 34:
            return 88;
            break;
          case 35:
            if (yy.lex.firstGraph()) {
              this.begin("dir");
            }
            return 12;
            break;
          case 36:
            if (yy.lex.firstGraph()) {
              this.begin("dir");
            }
            return 12;
            break;
          case 37:
            if (yy.lex.firstGraph()) {
              this.begin("dir");
            }
            return 12;
            break;
          case 38:
            return 27;
            break;
          case 39:
            return 32;
            break;
          case 40:
            return 98;
            break;
          case 41:
            return 98;
            break;
          case 42:
            return 98;
            break;
          case 43:
            return 98;
            break;
          case 44:
            this.popState();
            return 13;
            break;
          case 45:
            this.popState();
            return 14;
            break;
          case 46:
            this.popState();
            return 14;
            break;
          case 47:
            this.popState();
            return 14;
            break;
          case 48:
            this.popState();
            return 14;
            break;
          case 49:
            this.popState();
            return 14;
            break;
          case 50:
            this.popState();
            return 14;
            break;
          case 51:
            this.popState();
            return 14;
            break;
          case 52:
            this.popState();
            return 14;
            break;
          case 53:
            this.popState();
            return 14;
            break;
          case 54:
            this.popState();
            return 14;
            break;
          case 55:
            return 121;
            break;
          case 56:
            return 122;
            break;
          case 57:
            return 123;
            break;
          case 58:
            return 124;
            break;
          case 59:
            return 125;
            break;
          case 60:
            return 78;
            break;
          case 61:
            return 105;
            break;
          case 62:
            return 111;
            break;
          case 63:
            return 46;
            break;
          case 64:
            return 60;
            break;
          case 65:
            return 44;
            break;
          case 66:
            return 8;
            break;
          case 67:
            return 106;
            break;
          case 68:
            return 115;
            break;
          case 69:
            this.popState();
            return 77;
            break;
          case 70:
            this.pushState("edgeText");
            return 75;
            break;
          case 71:
            return 119;
            break;
          case 72:
            this.popState();
            return 77;
            break;
          case 73:
            this.pushState("thickEdgeText");
            return 75;
            break;
          case 74:
            return 119;
            break;
          case 75:
            this.popState();
            return 77;
            break;
          case 76:
            this.pushState("dottedEdgeText");
            return 75;
            break;
          case 77:
            return 119;
            break;
          case 78:
            return 77;
            break;
          case 79:
            this.popState();
            return 53;
            break;
          case 80:
            return "TEXT";
            break;
          case 81:
            this.pushState("ellipseText");
            return 52;
            break;
          case 82:
            this.popState();
            return 55;
            break;
          case 83:
            this.pushState("text");
            return 54;
            break;
          case 84:
            this.popState();
            return 57;
            break;
          case 85:
            this.pushState("text");
            return 56;
            break;
          case 86:
            return 58;
            break;
          case 87:
            this.pushState("text");
            return 67;
            break;
          case 88:
            this.popState();
            return 64;
            break;
          case 89:
            this.pushState("text");
            return 63;
            break;
          case 90:
            this.popState();
            return 49;
            break;
          case 91:
            this.pushState("text");
            return 48;
            break;
          case 92:
            this.popState();
            return 69;
            break;
          case 93:
            this.popState();
            return 71;
            break;
          case 94:
            return 117;
            break;
          case 95:
            this.pushState("trapText");
            return 68;
            break;
          case 96:
            this.pushState("trapText");
            return 70;
            break;
          case 97:
            return 118;
            break;
          case 98:
            return 67;
            break;
          case 99:
            return 90;
            break;
          case 100:
            return "SEP";
            break;
          case 101:
            return 89;
            break;
          case 102:
            return 115;
            break;
          case 103:
            return 111;
            break;
          case 104:
            return 44;
            break;
          case 105:
            return 109;
            break;
          case 106:
            return 114;
            break;
          case 107:
            return 116;
            break;
          case 108:
            this.popState();
            return 62;
            break;
          case 109:
            this.pushState("text");
            return 62;
            break;
          case 110:
            this.popState();
            return 51;
            break;
          case 111:
            this.pushState("text");
            return 50;
            break;
          case 112:
            this.popState();
            return 31;
            break;
          case 113:
            this.pushState("text");
            return 29;
            break;
          case 114:
            this.popState();
            return 66;
            break;
          case 115:
            this.pushState("text");
            return 65;
            break;
          case 116:
            return "TEXT";
            break;
          case 117:
            return "QUOTE";
            break;
          case 118:
            return 9;
            break;
          case 119:
            return 10;
            break;
          case 120:
            return 11;
            break;
        }
      }, "anonymous"),
      rules: [/^(?:accTitle\s*:\s*)/, /^(?:(?!\n||)*[^\n]*)/, /^(?:accDescr\s*:\s*)/, /^(?:(?!\n||)*[^\n]*)/, /^(?:accDescr\s*\{\s*)/, /^(?:[\}])/, /^(?:[^\}]*)/, /^(?:@\{)/, /^(?:["])/, /^(?:["])/, /^(?:[^\"]+)/, /^(?:[^}^"]+)/, /^(?:\})/, /^(?:call[\s]+)/, /^(?:\([\s]*\))/, /^(?:\()/, /^(?:[^(]*)/, /^(?:\))/, /^(?:[^)]*)/, /^(?:[^`"]+)/, /^(?:[`]["])/, /^(?:["][`])/, /^(?:[^"]+)/, /^(?:["])/, /^(?:["])/, /^(?:style\b)/, /^(?:default\b)/, /^(?:linkStyle\b)/, /^(?:interpolate\b)/, /^(?:classDef\b)/, /^(?:class\b)/, /^(?:href[\s])/, /^(?:click[\s]+)/, /^(?:[\s\n])/, /^(?:[^\s\n]*)/, /^(?:flowchart-elk\b)/, /^(?:graph\b)/, /^(?:flowchart\b)/, /^(?:subgraph\b)/, /^(?:end\b\s*)/, /^(?:_self\b)/, /^(?:_blank\b)/, /^(?:_parent\b)/, /^(?:_top\b)/, /^(?:(\r?\n)*\s*\n)/, /^(?:\s*LR\b)/, /^(?:\s*RL\b)/, /^(?:\s*TB\b)/, /^(?:\s*BT\b)/, /^(?:\s*TD\b)/, /^(?:\s*BR\b)/, /^(?:\s*<)/, /^(?:\s*>)/, /^(?:\s*\^)/, /^(?:\s*v\b)/, /^(?:.*direction\s+TB[^\n]*)/, /^(?:.*direction\s+BT[^\n]*)/, /^(?:.*direction\s+RL[^\n]*)/, /^(?:.*direction\s+LR[^\n]*)/, /^(?:.*direction\s+TD[^\n]*)/, /^(?:[^\s\"]+@(?=[^\{\"]))/, /^(?:[0-9]+)/, /^(?:#)/, /^(?::::)/, /^(?::)/, /^(?:&)/, /^(?:;)/, /^(?:,)/, /^(?:\*)/, /^(?:\s*[xo<]?--+[-xo>]\s*)/, /^(?:\s*[xo<]?--\s*)/, /^(?:[^-]|-(?!-)+)/, /^(?:\s*[xo<]?==+[=xo>]\s*)/, /^(?:\s*[xo<]?==\s*)/, /^(?:[^=]|=(?!))/, /^(?:\s*[xo<]?-?\.+-[xo>]?\s*)/, /^(?:\s*[xo<]?-\.\s*)/, /^(?:[^\.]|\.(?!))/, /^(?:\s*~~[\~]+\s*)/, /^(?:[-/\)][\)])/, /^(?:[^\(\)\[\]\{\}]|!\)+)/, /^(?:\(-)/, /^(?:\]\))/, /^(?:\(\[)/, /^(?:\]\])/, /^(?:\[\[)/, /^(?:\[\|)/, /^(?:>)/, /^(?:\)\])/, /^(?:\[\()/, /^(?:\)\)\))/, /^(?:\(\(\()/, /^(?:[\\(?=\])][\]])/, /^(?:\/(?=\])\])/, /^(?:\/(?!\])|\\(?!\])|[^\\\[\]\(\)\{\}\/]+)/, /^(?:\[\/)/, /^(?:\[\\)/, /^(?:<)/, /^(?:>)/, /^(?:\^)/, /^(?:\\\|)/, /^(?:v\b)/, /^(?:\*)/, /^(?:#)/, /^(?:&)/, /^(?:([A-Za-z0-9!"\#$%&'*+\.`?\\_\/]|-(?=[^\>\-\.])|(?!))+)/, /^(?:-)/, /^(?:[\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6]|[\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377]|[\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5]|[\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA]|[\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE]|[\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA]|[\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0]|[\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977]|[\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2]|[\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A]|[\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39]|[\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8]|[\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C]|[\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C]|[\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99]|[\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0]|[\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D]|[\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3]|[\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10]|[\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1]|[\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81]|[\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3]|[\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6]|[\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A]|[\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081]|[\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D]|[\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0]|[\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310]|[\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C]|[\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711]|[\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7]|[\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C]|[\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16]|[\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF]|[\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC]|[\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D]|[\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D]|[\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3]|[\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F]|[\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128]|[\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184]|[\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3]|[\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6]|[\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE]|[\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C]|[\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D]|[\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC]|[\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B]|[\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788]|[\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805]|[\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB]|[\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28]|[\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5]|[\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4]|[\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E]|[\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D]|[\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36]|[\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D]|[\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC]|[\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF]|[\uFFD2-\uFFD7\uFFDA-\uFFDC])/, /^(?:\|)/, /^(?:\|)/, /^(?:\))/, /^(?:\()/, /^(?:\])/, /^(?:\[)/, /^(?:(\}))/, /^(?:\{)/, /^(?:[^\[\]\(\)\{\}\|\"]+)/, /^(?:")/, /^(?:(\r?\n)+)/, /^(?:\s)/, /^(?:$)/],
      conditions: { shapeDataEndBracket: { rules: [21, 24, 78, 81, 83, 85, 89, 91, 95, 96, 109, 111, 113, 115], inclusive: false }, shapeDataStr: { rules: [9, 10, 21, 24, 78, 81, 83, 85, 89, 91, 95, 96, 109, 111, 113, 115], inclusive: false }, shapeData: { rules: [8, 11, 12, 21, 24, 78, 81, 83, 85, 89, 91, 95, 96, 109, 111, 113, 115], inclusive: false }, callbackargs: { rules: [17, 18, 21, 24, 78, 81, 83, 85, 89, 91, 95, 96, 109, 111, 113, 115], inclusive: false }, callbackname: { rules: [14, 15, 16, 21, 24, 78, 81, 83, 85, 89, 91, 95, 96, 109, 111, 113, 115], inclusive: false }, href: { rules: [21, 24, 78, 81, 83, 85, 89, 91, 95, 96, 109, 111, 113, 115], inclusive: false }, click: { rules: [21, 24, 33, 34, 78, 81, 83, 85, 89, 91, 95, 96, 109, 111, 113, 115], inclusive: false }, dottedEdgeText: { rules: [21, 24, 75, 77, 78, 81, 83, 85, 89, 91, 95, 96, 109, 111, 113, 115], inclusive: false }, thickEdgeText: { rules: [21, 24, 72, 74, 78, 81, 83, 85, 89, 91, 95, 96, 109, 111, 113, 115], inclusive: false }, edgeText: { rules: [21, 24, 69, 71, 78, 81, 83, 85, 89, 91, 95, 96, 109, 111, 113, 115], inclusive: false }, trapText: { rules: [21, 24, 78, 81, 83, 85, 89, 91, 92, 93, 94, 95, 96, 109, 111, 113, 115], inclusive: false }, ellipseText: { rules: [21, 24, 78, 79, 80, 81, 83, 85, 89, 91, 95, 96, 109, 111, 113, 115], inclusive: false }, text: { rules: [21, 24, 78, 81, 82, 83, 84, 85, 88, 89, 90, 91, 95, 96, 108, 109, 110, 111, 112, 113, 114, 115, 116], inclusive: false }, vertex: { rules: [21, 24, 78, 81, 83, 85, 89, 91, 95, 96, 109, 111, 113, 115], inclusive: false }, dir: { rules: [21, 24, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 78, 81, 83, 85, 89, 91, 95, 96, 109, 111, 113, 115], inclusive: false }, acc_descr_multiline: { rules: [5, 6, 21, 24, 78, 81, 83, 85, 89, 91, 95, 96, 109, 111, 113, 115], inclusive: false }, acc_descr: { rules: [3, 21, 24, 78, 81, 83, 85, 89, 91, 95, 96, 109, 111, 113, 115], inclusive: false }, acc_title: { rules: [1, 21, 24, 78, 81, 83, 85, 89, 91, 95, 96, 109, 111, 113, 115], inclusive: false }, md_string: { rules: [19, 20, 21, 24, 78, 81, 83, 85, 89, 91, 95, 96, 109, 111, 113, 115], inclusive: false }, string: { rules: [21, 22, 23, 24, 78, 81, 83, 85, 89, 91, 95, 96, 109, 111, 113, 115], inclusive: false }, INITIAL: { rules: [0, 2, 4, 7, 13, 21, 24, 25, 26, 27, 28, 29, 30, 31, 32, 35, 36, 37, 38, 39, 40, 41, 42, 43, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 72, 73, 75, 76, 78, 81, 83, 85, 86, 87, 89, 91, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 109, 111, 113, 115, 117, 118, 119, 120], inclusive: true } }
    };
    return lexer2;
  }();
  parser2.lexer = lexer;
  function Parser() {
    this.yy = {};
  }
  __name(Parser, "Parser");
  Parser.prototype = parser2;
  parser2.Parser = Parser;
  return new Parser;
}();
parser.parser = parser;
var flow_default = parser;
var newParser = Object.assign({}, flow_default);
newParser.parse = (src) => {
  const newSrc = src.replace(/}\s*\n/g, `}
`);
  return flow_default.parse(newSrc);
};
var flowParser_default = newParser;
var fade = /* @__PURE__ */ __name((color, opacity) => {
  const channel2 = channel_default;
  const r = channel2(color, "r");
  const g = channel2(color, "g");
  const b = channel2(color, "b");
  return rgba_default(r, g, b, opacity);
}, "fade");
var getStyles = /* @__PURE__ */ __name((options) => `.label {
    font-family: ${options.fontFamily};
    color: ${options.nodeTextColor || options.textColor};
  }
  .cluster-label text {
    fill: ${options.titleColor};
  }
  .cluster-label span {
    color: ${options.titleColor};
  }
  .cluster-label span p {
    background-color: transparent;
  }

  .label text,span {
    fill: ${options.nodeTextColor || options.textColor};
    color: ${options.nodeTextColor || options.textColor};
  }

  .node rect,
  .node circle,
  .node ellipse,
  .node polygon,
  .node path {
    fill: ${options.mainBkg};
    stroke: ${options.nodeBorder};
    stroke-width: ${options.strokeWidth ?? 1}px;
  }
  .rough-node .label text , .node .label text, .image-shape .label, .icon-shape .label {
    text-anchor: middle;
  }
  // .flowchart-label .text-outer-tspan {
  //   text-anchor: middle;
  // }
  // .flowchart-label .text-inner-tspan {
  //   text-anchor: start;
  // }

  .node .katex path {
    fill: #000;
    stroke: #000;
    stroke-width: 1px;
  }

  .rough-node .label,.node .label, .image-shape .label, .icon-shape .label {
    text-align: center;
  }
  .node.clickable {
    cursor: pointer;
  }


  .root .anchor path {
    fill: ${options.lineColor} !important;
    stroke-width: 0;
    stroke: ${options.lineColor};
  }

  .arrowheadPath {
    fill: ${options.arrowheadColor};
  }

  .edgePath .path {
    stroke: ${options.lineColor};
    stroke-width: ${options.strokeWidth ?? 2}px;
  }

  .flowchart-link {
    stroke: ${options.lineColor};
    fill: none;
  }

  .edgeLabel {
    background-color: ${options.edgeLabelBackground};
    p {
      background-color: ${options.edgeLabelBackground};
    }
    rect {
      opacity: 0.5;
      background-color: ${options.edgeLabelBackground};
      fill: ${options.edgeLabelBackground};
    }
    text-align: center;
  }

  /* For html labels only */
  .labelBkg {
    background-color: ${fade(options.edgeLabelBackground, 0.5)};
    // background-color:
  }

  .cluster rect {
    fill: ${options.clusterBkg};
    stroke: ${options.clusterBorder};
    stroke-width: 1px;
  }

  .cluster text {
    fill: ${options.titleColor};
  }

  .cluster span {
    color: ${options.titleColor};
  }
  /* .cluster div {
    color: ${options.titleColor};
  } */

  div.mermaidTooltip {
    position: absolute;
    text-align: center;
    max-width: 200px;
    padding: 2px;
    font-family: ${options.fontFamily};
    font-size: 12px;
    background: ${options.tertiaryColor};
    border: 1px solid ${options.border2};
    border-radius: 2px;
    pointer-events: none;
    z-index: 100;
  }

  .flowchartTitleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${options.textColor};
  }

  rect.text {
    fill: none;
    stroke-width: 0;
  }

  .icon-shape, .image-shape {
    background-color: ${options.edgeLabelBackground};
    p {
      background-color: ${options.edgeLabelBackground};
      padding: 2px;
    }
    .label rect {
      opacity: 0.5;
      background-color: ${options.edgeLabelBackground};
      fill: ${options.edgeLabelBackground};
    }
    text-align: center;
  }
  ${getIconStyles()}
`, "getStyles");
var styles_default = getStyles;
var diagram = {
  parser: flowParser_default,
  get db() {
    return new FlowDB;
  },
  renderer: flowRenderer_v3_unified_default,
  styles: styles_default,
  init: /* @__PURE__ */ __name((cnf) => {
    if (!cnf.flowchart) {
      cnf.flowchart = {};
    }
    if (cnf.layout) {
      setConfig2({ layout: cnf.layout });
    }
    cnf.flowchart.arrowMarkerAbsolute = cnf.arrowMarkerAbsolute;
    setConfig2({ flowchart: { arrowMarkerAbsolute: cnf.arrowMarkerAbsolute } });
  }, "init")
};
export {
  diagram
};

//# debugId=B5266255970E6D4864756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2Zsb3dEaWFncmFtLUk2WEpWRzRYLm1qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJpbXBvcnQge1xuICBnZXRJY29uU3R5bGVzXG59IGZyb20gXCIuL2NodW5rLUZNQkQ3VUM0Lm1qc1wiO1xuaW1wb3J0IHtcbiAgSlNPTl9TQ0hFTUEsXG4gIGxvYWRcbn0gZnJvbSBcIi4vY2h1bmstWFBXNDU3NkkubWpzXCI7XG5pbXBvcnQge1xuICBjcmVhdGVUb29sdGlwXG59IGZyb20gXCIuL2NodW5rLU5EMkdVSEFNLm1qc1wiO1xuaW1wb3J0IHtcbiAgZ2V0RGlhZ3JhbUVsZW1lbnRcbn0gZnJvbSBcIi4vY2h1bmstNTVJQUNFQjYubWpzXCI7XG5pbXBvcnQge1xuICBzZXR1cFZpZXdQb3J0Rm9yU1ZHXG59IGZyb20gXCIuL2NodW5rLTJKMzNXVE1ILm1qc1wiO1xuaW1wb3J0IHtcbiAgZ2V0UmVnaXN0ZXJlZExheW91dEFsZ29yaXRobSxcbiAgcmVuZGVyXG59IGZyb20gXCIuL2NodW5rLUxaWEVEWkNBLm1qc1wiO1xuaW1wb3J0IFwiLi9jaHVuay1LU0NTNU42QS5tanNcIjtcbmltcG9ydCBcIi4vY2h1bmstQlNKUDdDQlAubWpzXCI7XG5pbXBvcnQge1xuICBpc1ZhbGlkU2hhcGVcbn0gZnJvbSBcIi4vY2h1bmstM09QSUZHREUubWpzXCI7XG5pbXBvcnQgXCIuL2NodW5rLUw1WlRMRFdWLm1qc1wiO1xuaW1wb3J0IFwiLi9jaHVuay1OWksyRDdHVS5tanNcIjtcbmltcG9ydCBcIi4vY2h1bmstTzVDQkVMNk8ubWpzXCI7XG5pbXBvcnQge1xuICBnZXRFZGdlSWQsXG4gIHV0aWxzX2RlZmF1bHRcbn0gZnJvbSBcIi4vY2h1bmstNVpRWUhYS1UubWpzXCI7XG5pbXBvcnQge1xuICBjbGVhcixcbiAgY29tbW9uX2RlZmF1bHQsXG4gIGRlZmF1bHRDb25maWcyIGFzIGRlZmF1bHRDb25maWcsXG4gIGdldEFjY0Rlc2NyaXB0aW9uLFxuICBnZXRBY2NUaXRsZSxcbiAgZ2V0Q29uZmlnMiBhcyBnZXRDb25maWcsXG4gIGdldERpYWdyYW1UaXRsZSxcbiAgc2V0QWNjRGVzY3JpcHRpb24sXG4gIHNldEFjY1RpdGxlLFxuICBzZXRDb25maWcyIGFzIHNldENvbmZpZyxcbiAgc2V0RGlhZ3JhbVRpdGxlXG59IGZyb20gXCIuL2NodW5rLUNTQ0lISzdRLm1qc1wiO1xuaW1wb3J0IHtcbiAgX19uYW1lLFxuICBsb2dcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIHNyYy9kaWFncmFtcy9mbG93Y2hhcnQvZmxvd0RiLnRzXG5pbXBvcnQgeyBzZWxlY3QgfSBmcm9tIFwiZDNcIjtcbmltcG9ydCBET01QdXJpZnkgZnJvbSBcImRvbXB1cmlmeVwiO1xudmFyIE1FUk1BSURfRE9NX0lEX1BSRUZJWCA9IFwiZmxvd2NoYXJ0LVwiO1xudmFyIEZsb3dEQiA9IGNsYXNzIHtcbiAgLy8gY3NwZWxsOmlnbm9yZSBmdW5zXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMudmVydGV4Q291bnRlciA9IDA7XG4gICAgdGhpcy5jb25maWcgPSBnZXRDb25maWcoKTtcbiAgICB0aGlzLmRpYWdyYW1JZCA9IFwiXCI7XG4gICAgdGhpcy52ZXJ0aWNlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgdGhpcy5lZGdlcyA9IFtdO1xuICAgIHRoaXMuY2xhc3NlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgdGhpcy5zdWJHcmFwaHMgPSBbXTtcbiAgICB0aGlzLnN1YkdyYXBoTG9va3VwID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICB0aGlzLnRvb2x0aXBzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICB0aGlzLnN1YkNvdW50ID0gMDtcbiAgICB0aGlzLmZpcnN0R3JhcGhGbGFnID0gdHJ1ZTtcbiAgICAvLyBBcyBpbiBncmFwaFxuICAgIHRoaXMuc2VjQ291bnQgPSAtMTtcbiAgICB0aGlzLnBvc0Nyb3NzUmVmID0gW107XG4gICAgLy8gRnVuY3Rpb25zIHRvIGJlIHJ1biBhZnRlciBncmFwaCByZW5kZXJpbmdcbiAgICB0aGlzLmZ1bnMgPSBbXTtcbiAgICB0aGlzLnNldEFjY1RpdGxlID0gc2V0QWNjVGl0bGU7XG4gICAgdGhpcy5zZXRBY2NEZXNjcmlwdGlvbiA9IHNldEFjY0Rlc2NyaXB0aW9uO1xuICAgIHRoaXMuc2V0RGlhZ3JhbVRpdGxlID0gc2V0RGlhZ3JhbVRpdGxlO1xuICAgIHRoaXMuZ2V0QWNjVGl0bGUgPSBnZXRBY2NUaXRsZTtcbiAgICB0aGlzLmdldEFjY0Rlc2NyaXB0aW9uID0gZ2V0QWNjRGVzY3JpcHRpb247XG4gICAgdGhpcy5nZXREaWFncmFtVGl0bGUgPSBnZXREaWFncmFtVGl0bGU7XG4gICAgdGhpcy5mdW5zLnB1c2godGhpcy5zZXR1cFRvb2xUaXBzLmJpbmQodGhpcykpO1xuICAgIHRoaXMuYWRkVmVydGV4ID0gdGhpcy5hZGRWZXJ0ZXguYmluZCh0aGlzKTtcbiAgICB0aGlzLmZpcnN0R3JhcGggPSB0aGlzLmZpcnN0R3JhcGguYmluZCh0aGlzKTtcbiAgICB0aGlzLnNldERpcmVjdGlvbiA9IHRoaXMuc2V0RGlyZWN0aW9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5hZGRTdWJHcmFwaCA9IHRoaXMuYWRkU3ViR3JhcGguYmluZCh0aGlzKTtcbiAgICB0aGlzLmFkZExpbmsgPSB0aGlzLmFkZExpbmsuYmluZCh0aGlzKTtcbiAgICB0aGlzLnNldExpbmsgPSB0aGlzLnNldExpbmsuYmluZCh0aGlzKTtcbiAgICB0aGlzLnVwZGF0ZUxpbmsgPSB0aGlzLnVwZGF0ZUxpbmsuYmluZCh0aGlzKTtcbiAgICB0aGlzLmFkZENsYXNzID0gdGhpcy5hZGRDbGFzcy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc2V0Q2xhc3MgPSB0aGlzLnNldENsYXNzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5kZXN0cnVjdExpbmsgPSB0aGlzLmRlc3RydWN0TGluay5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc2V0Q2xpY2tFdmVudCA9IHRoaXMuc2V0Q2xpY2tFdmVudC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc2V0VG9vbHRpcCA9IHRoaXMuc2V0VG9vbHRpcC5iaW5kKHRoaXMpO1xuICAgIHRoaXMudXBkYXRlTGlua0ludGVycG9sYXRlID0gdGhpcy51cGRhdGVMaW5rSW50ZXJwb2xhdGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLnNldENsaWNrRnVuID0gdGhpcy5zZXRDbGlja0Z1bi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuYmluZEZ1bmN0aW9ucyA9IHRoaXMuYmluZEZ1bmN0aW9ucy5iaW5kKHRoaXMpO1xuICAgIHRoaXMubGV4ID0ge1xuICAgICAgZmlyc3RHcmFwaDogdGhpcy5maXJzdEdyYXBoLmJpbmQodGhpcylcbiAgICB9O1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICB0aGlzLnNldEdlbihcImdlbi0yXCIpO1xuICB9XG4gIHN0YXRpYyB7XG4gICAgX19uYW1lKHRoaXMsIFwiRmxvd0RCXCIpO1xuICB9XG4gIHNhbml0aXplVGV4dCh0eHQpIHtcbiAgICByZXR1cm4gY29tbW9uX2RlZmF1bHQuc2FuaXRpemVUZXh0KHR4dCwgdGhpcy5jb25maWcpO1xuICB9XG4gIHNhbml0aXplTm9kZUxhYmVsVHlwZShsYWJlbFR5cGUpIHtcbiAgICBzd2l0Y2ggKGxhYmVsVHlwZSkge1xuICAgICAgY2FzZSBcIm1hcmtkb3duXCI6XG4gICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICBjYXNlIFwidGV4dFwiOlxuICAgICAgICByZXR1cm4gbGFiZWxUeXBlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIFwibWFya2Rvd25cIjtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIFNldHMgdGhlIGRpYWdyYW0ncyBTVkcgZWxlbWVudCBJRCwgdXNlZCB0byBwcmVmaXggZG9tSWRzIGZvciB1bmlxdWVuZXNzXG4gICAqIGFjcm9zcyBtdWx0aXBsZSBkaWFncmFtcyBvbiB0aGUgc2FtZSBwYWdlLlxuICAgKi9cbiAgc2V0RGlhZ3JhbUlkKHN2Z0VsZW1lbnRJZCkge1xuICAgIHRoaXMuZGlhZ3JhbUlkID0gc3ZnRWxlbWVudElkO1xuICB9XG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0byBsb29rdXAgZG9tSWQgZnJvbSBpZCBpbiB0aGUgZ3JhcGggZGVmaW5pdGlvbi5cbiAgICogV2hlbiBkaWFncmFtSWQgaXMgc2V0LCByZXR1cm5zIHRoZSBwcmVmaXhlZCB2ZXJzaW9uIGZvciBET00gdW5pcXVlbmVzcy5cbiAgICpcbiAgICogQHBhcmFtIGlkIC0gaWQgb2YgdGhlIG5vZGVcbiAgICovXG4gIGxvb2tVcERvbUlkKGlkKSB7XG4gICAgZm9yIChjb25zdCB2ZXJ0ZXggb2YgdGhpcy52ZXJ0aWNlcy52YWx1ZXMoKSkge1xuICAgICAgaWYgKHZlcnRleC5pZCA9PT0gaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlhZ3JhbUlkID8gYCR7dGhpcy5kaWFncmFtSWR9LSR7dmVydGV4LmRvbUlkfWAgOiB2ZXJ0ZXguZG9tSWQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmRpYWdyYW1JZCA/IGAke3RoaXMuZGlhZ3JhbUlkfS0ke2lkfWAgOiBpZDtcbiAgfVxuICAvKipcbiAgICogRnVuY3Rpb24gY2FsbGVkIGJ5IHBhcnNlciB3aGVuIGEgbm9kZSBkZWZpbml0aW9uIGhhcyBiZWVuIGZvdW5kXG4gICAqL1xuICBhZGRWZXJ0ZXgoaWQsIHRleHRPYmosIHR5cGUsIHN0eWxlLCBjbGFzc2VzLCBkaXIsIHByb3BzID0ge30sIG1ldGFkYXRhKSB7XG4gICAgaWYgKCFpZCB8fCBpZC50cmltKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBkb2M7XG4gICAgaWYgKG1ldGFkYXRhICE9PSB2b2lkIDApIHtcbiAgICAgIGxldCB5YW1sRGF0YTtcbiAgICAgIGlmICghbWV0YWRhdGEuaW5jbHVkZXMoXCJcXG5cIikpIHtcbiAgICAgICAgeWFtbERhdGEgPSBcIntcXG5cIiArIG1ldGFkYXRhICsgXCJcXG59XCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB5YW1sRGF0YSA9IG1ldGFkYXRhICsgXCJcXG5cIjtcbiAgICAgIH1cbiAgICAgIGRvYyA9IGxvYWQoeWFtbERhdGEsIHsgc2NoZW1hOiBKU09OX1NDSEVNQSB9KTtcbiAgICB9XG4gICAgY29uc3QgZWRnZSA9IHRoaXMuZWRnZXMuZmluZCgoZSkgPT4gZS5pZCA9PT0gaWQpO1xuICAgIGlmIChlZGdlKSB7XG4gICAgICBjb25zdCBlZGdlRG9jID0gZG9jO1xuICAgICAgaWYgKGVkZ2VEb2M/LmFuaW1hdGUgIT09IHZvaWQgMCkge1xuICAgICAgICBlZGdlLmFuaW1hdGUgPSBlZGdlRG9jLmFuaW1hdGU7XG4gICAgICB9XG4gICAgICBpZiAoZWRnZURvYz8uYW5pbWF0aW9uICE9PSB2b2lkIDApIHtcbiAgICAgICAgZWRnZS5hbmltYXRpb24gPSBlZGdlRG9jLmFuaW1hdGlvbjtcbiAgICAgIH1cbiAgICAgIGlmIChlZGdlRG9jPy5jdXJ2ZSAhPT0gdm9pZCAwKSB7XG4gICAgICAgIGVkZ2UuaW50ZXJwb2xhdGUgPSBlZGdlRG9jLmN1cnZlO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgdHh0O1xuICAgIGxldCB2ZXJ0ZXggPSB0aGlzLnZlcnRpY2VzLmdldChpZCk7XG4gICAgaWYgKHZlcnRleCA9PT0gdm9pZCAwKSB7XG4gICAgICBpZiAodGV4dE9iaiA9PT0gdm9pZCAwICYmIHR5cGUgPT09IHZvaWQgMCAmJiBzdHlsZSAhPT0gdm9pZCAwICYmIHN0eWxlICE9PSBudWxsKSB7XG4gICAgICAgIGxvZy53YXJuKFxuICAgICAgICAgIGBTdHlsZSBhcHBsaWVkIHRvIHVua25vd24gbm9kZSBcIiR7aWR9XCIuIFRoaXMgbWF5IGluZGljYXRlIGEgdHlwby4gVGhlIG5vZGUgd2lsbCBiZSBjcmVhdGVkIGF1dG9tYXRpY2FsbHkuYFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgdmVydGV4ID0ge1xuICAgICAgICBpZCxcbiAgICAgICAgbGFiZWxUeXBlOiBcInRleHRcIixcbiAgICAgICAgZG9tSWQ6IE1FUk1BSURfRE9NX0lEX1BSRUZJWCArIGlkICsgXCItXCIgKyB0aGlzLnZlcnRleENvdW50ZXIsXG4gICAgICAgIHN0eWxlczogW10sXG4gICAgICAgIGNsYXNzZXM6IFtdXG4gICAgICB9O1xuICAgICAgdGhpcy52ZXJ0aWNlcy5zZXQoaWQsIHZlcnRleCk7XG4gICAgfVxuICAgIHRoaXMudmVydGV4Q291bnRlcisrO1xuICAgIGlmICh0ZXh0T2JqICE9PSB2b2lkIDApIHtcbiAgICAgIHRoaXMuY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gICAgICB0eHQgPSB0aGlzLnNhbml0aXplVGV4dCh0ZXh0T2JqLnRleHQudHJpbSgpKTtcbiAgICAgIHZlcnRleC5sYWJlbFR5cGUgPSB0ZXh0T2JqLnR5cGU7XG4gICAgICBpZiAodHh0LnN0YXJ0c1dpdGgoJ1wiJykgJiYgdHh0LmVuZHNXaXRoKCdcIicpKSB7XG4gICAgICAgIHR4dCA9IHR4dC5zdWJzdHJpbmcoMSwgdHh0Lmxlbmd0aCAtIDEpO1xuICAgICAgfVxuICAgICAgdmVydGV4LnRleHQgPSB0eHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh2ZXJ0ZXgudGV4dCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHZlcnRleC50ZXh0ID0gaWQ7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlICE9PSB2b2lkIDApIHtcbiAgICAgIHZlcnRleC50eXBlID0gdHlwZTtcbiAgICB9XG4gICAgaWYgKHN0eWxlICE9PSB2b2lkIDAgJiYgc3R5bGUgIT09IG51bGwpIHtcbiAgICAgIHN0eWxlLmZvckVhY2goKHMpID0+IHtcbiAgICAgICAgdmVydGV4LnN0eWxlcy5wdXNoKHMpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChjbGFzc2VzICE9PSB2b2lkIDAgJiYgY2xhc3NlcyAhPT0gbnVsbCkge1xuICAgICAgY2xhc3Nlcy5mb3JFYWNoKChzKSA9PiB7XG4gICAgICAgIHZlcnRleC5jbGFzc2VzLnB1c2gocyk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGRpciAhPT0gdm9pZCAwKSB7XG4gICAgICB2ZXJ0ZXguZGlyID0gZGlyO1xuICAgIH1cbiAgICBpZiAodmVydGV4LnByb3BzID09PSB2b2lkIDApIHtcbiAgICAgIHZlcnRleC5wcm9wcyA9IHByb3BzO1xuICAgIH0gZWxzZSBpZiAocHJvcHMgIT09IHZvaWQgMCkge1xuICAgICAgT2JqZWN0LmFzc2lnbih2ZXJ0ZXgucHJvcHMsIHByb3BzKTtcbiAgICB9XG4gICAgaWYgKGRvYyAhPT0gdm9pZCAwKSB7XG4gICAgICBpZiAoZG9jLnNoYXBlKSB7XG4gICAgICAgIGlmIChkb2Muc2hhcGUgIT09IGRvYy5zaGFwZS50b0xvd2VyQ2FzZSgpIHx8IGRvYy5zaGFwZS5pbmNsdWRlcyhcIl9cIikpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHN1Y2ggc2hhcGU6ICR7ZG9jLnNoYXBlfS4gU2hhcGUgbmFtZXMgc2hvdWxkIGJlIGxvd2VyY2FzZS5gKTtcbiAgICAgICAgfSBlbHNlIGlmICghaXNWYWxpZFNoYXBlKGRvYy5zaGFwZSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHN1Y2ggc2hhcGU6ICR7ZG9jLnNoYXBlfS5gKTtcbiAgICAgICAgfVxuICAgICAgICB2ZXJ0ZXgudHlwZSA9IGRvYz8uc2hhcGU7XG4gICAgICB9XG4gICAgICBpZiAoZG9jPy5sYWJlbCkge1xuICAgICAgICB2ZXJ0ZXgudGV4dCA9IGRvYz8ubGFiZWw7XG4gICAgICAgIHZlcnRleC5sYWJlbFR5cGUgPSB0aGlzLnNhbml0aXplTm9kZUxhYmVsVHlwZShkb2M/LmxhYmVsVHlwZSk7XG4gICAgICB9XG4gICAgICBpZiAoZG9jPy5pY29uKSB7XG4gICAgICAgIHZlcnRleC5pY29uID0gZG9jPy5pY29uO1xuICAgICAgICBpZiAoIWRvYy5sYWJlbD8udHJpbSgpICYmIHZlcnRleC50ZXh0ID09PSBpZCkge1xuICAgICAgICAgIHZlcnRleC50ZXh0ID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGRvYz8uZm9ybSkge1xuICAgICAgICB2ZXJ0ZXguZm9ybSA9IGRvYz8uZm9ybTtcbiAgICAgIH1cbiAgICAgIGlmIChkb2M/LnBvcykge1xuICAgICAgICB2ZXJ0ZXgucG9zID0gZG9jPy5wb3M7XG4gICAgICB9XG4gICAgICBpZiAoZG9jPy5pbWcpIHtcbiAgICAgICAgdmVydGV4LmltZyA9IGRvYz8uaW1nO1xuICAgICAgICBpZiAoIWRvYy5sYWJlbD8udHJpbSgpICYmIHZlcnRleC50ZXh0ID09PSBpZCkge1xuICAgICAgICAgIHZlcnRleC50ZXh0ID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGRvYz8uY29uc3RyYWludCkge1xuICAgICAgICB2ZXJ0ZXguY29uc3RyYWludCA9IGRvYy5jb25zdHJhaW50O1xuICAgICAgfVxuICAgICAgaWYgKGRvYy53KSB7XG4gICAgICAgIHZlcnRleC5hc3NldFdpZHRoID0gTnVtYmVyKGRvYy53KTtcbiAgICAgIH1cbiAgICAgIGlmIChkb2MuaCkge1xuICAgICAgICB2ZXJ0ZXguYXNzZXRIZWlnaHQgPSBOdW1iZXIoZG9jLmgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvKipcbiAgICogRnVuY3Rpb24gY2FsbGVkIGJ5IHBhcnNlciB3aGVuIGEgbGluay9lZGdlIGRlZmluaXRpb24gaGFzIGJlZW4gZm91bmRcbiAgICpcbiAgICovXG4gIGFkZFNpbmdsZUxpbmsoX3N0YXJ0LCBfZW5kLCB0eXBlLCBpZCkge1xuICAgIGNvbnN0IHN0YXJ0ID0gX3N0YXJ0O1xuICAgIGNvbnN0IGVuZCA9IF9lbmQ7XG4gICAgY29uc3QgZWRnZSA9IHtcbiAgICAgIHN0YXJ0LFxuICAgICAgZW5kLFxuICAgICAgdHlwZTogdm9pZCAwLFxuICAgICAgdGV4dDogXCJcIixcbiAgICAgIGxhYmVsVHlwZTogXCJ0ZXh0XCIsXG4gICAgICBjbGFzc2VzOiBbXSxcbiAgICAgIGlzVXNlckRlZmluZWRJZDogZmFsc2UsXG4gICAgICBpbnRlcnBvbGF0ZTogdGhpcy5lZGdlcy5kZWZhdWx0SW50ZXJwb2xhdGVcbiAgICB9O1xuICAgIGxvZy5pbmZvKFwiYWJjNzggR290IGVkZ2UuLi5cIiwgZWRnZSk7XG4gICAgY29uc3QgbGlua1RleHRPYmogPSB0eXBlLnRleHQ7XG4gICAgaWYgKGxpbmtUZXh0T2JqICE9PSB2b2lkIDApIHtcbiAgICAgIGVkZ2UudGV4dCA9IHRoaXMuc2FuaXRpemVUZXh0KGxpbmtUZXh0T2JqLnRleHQudHJpbSgpKTtcbiAgICAgIGlmIChlZGdlLnRleHQuc3RhcnRzV2l0aCgnXCInKSAmJiBlZGdlLnRleHQuZW5kc1dpdGgoJ1wiJykpIHtcbiAgICAgICAgZWRnZS50ZXh0ID0gZWRnZS50ZXh0LnN1YnN0cmluZygxLCBlZGdlLnRleHQubGVuZ3RoIC0gMSk7XG4gICAgICB9XG4gICAgICBlZGdlLmxhYmVsVHlwZSA9IHRoaXMuc2FuaXRpemVOb2RlTGFiZWxUeXBlKGxpbmtUZXh0T2JqLnR5cGUpO1xuICAgIH1cbiAgICBpZiAodHlwZSAhPT0gdm9pZCAwKSB7XG4gICAgICBlZGdlLnR5cGUgPSB0eXBlLnR5cGU7XG4gICAgICBlZGdlLnN0cm9rZSA9IHR5cGUuc3Ryb2tlO1xuICAgICAgZWRnZS5sZW5ndGggPSB0eXBlLmxlbmd0aCA+IDEwID8gMTAgOiB0eXBlLmxlbmd0aDtcbiAgICB9XG4gICAgaWYgKGlkICYmICF0aGlzLmVkZ2VzLnNvbWUoKGUpID0+IGUuaWQgPT09IGlkKSkge1xuICAgICAgZWRnZS5pZCA9IGlkO1xuICAgICAgZWRnZS5pc1VzZXJEZWZpbmVkSWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBleGlzdGluZ0xpbmtzID0gdGhpcy5lZGdlcy5maWx0ZXIoKGUpID0+IGUuc3RhcnQgPT09IGVkZ2Uuc3RhcnQgJiYgZS5lbmQgPT09IGVkZ2UuZW5kKTtcbiAgICAgIGlmIChleGlzdGluZ0xpbmtzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBlZGdlLmlkID0gZ2V0RWRnZUlkKGVkZ2Uuc3RhcnQsIGVkZ2UuZW5kLCB7IGNvdW50ZXI6IDAsIHByZWZpeDogXCJMXCIgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlZGdlLmlkID0gZ2V0RWRnZUlkKGVkZ2Uuc3RhcnQsIGVkZ2UuZW5kLCB7XG4gICAgICAgICAgY291bnRlcjogZXhpc3RpbmdMaW5rcy5sZW5ndGggKyAxLFxuICAgICAgICAgIHByZWZpeDogXCJMXCJcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLmVkZ2VzLmxlbmd0aCA8ICh0aGlzLmNvbmZpZy5tYXhFZGdlcyA/PyA1MDApKSB7XG4gICAgICBsb2cuaW5mbyhcIlB1c2hpbmcgZWRnZS4uLlwiKTtcbiAgICAgIHRoaXMuZWRnZXMucHVzaChlZGdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgRWRnZSBsaW1pdCBleGNlZWRlZC4gJHt0aGlzLmVkZ2VzLmxlbmd0aH0gZWRnZXMgZm91bmQsIGJ1dCB0aGUgbGltaXQgaXMgJHt0aGlzLmNvbmZpZy5tYXhFZGdlc30uXG5cbkluaXRpYWxpemUgbWVybWFpZCB3aXRoIG1heEVkZ2VzIHNldCB0byBhIGhpZ2hlciBudW1iZXIgdG8gYWxsb3cgbW9yZSBlZGdlcy5cbllvdSBjYW5ub3Qgc2V0IHRoaXMgY29uZmlnIHZpYSBjb25maWd1cmF0aW9uIGluc2lkZSB0aGUgZGlhZ3JhbSBhcyBpdCBpcyBhIHNlY3VyZSBjb25maWcuXG5Zb3UgaGF2ZSB0byBjYWxsIG1lcm1haWQuaW5pdGlhbGl6ZS5gXG4gICAgICApO1xuICAgIH1cbiAgfVxuICBpc0xpbmtEYXRhKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiBcImlkXCIgaW4gdmFsdWUgJiYgdHlwZW9mIHZhbHVlLmlkID09PSBcInN0cmluZ1wiO1xuICB9XG4gIGFkZExpbmsoX3N0YXJ0LCBfZW5kLCBsaW5rRGF0YSkge1xuICAgIGNvbnN0IGlkID0gdGhpcy5pc0xpbmtEYXRhKGxpbmtEYXRhKSA/IGxpbmtEYXRhLmlkLnJlcGxhY2UoXCJAXCIsIFwiXCIpIDogdm9pZCAwO1xuICAgIGxvZy5pbmZvKFwiYWRkTGlua1wiLCBfc3RhcnQsIF9lbmQsIGlkKTtcbiAgICBmb3IgKGNvbnN0IHN0YXJ0IG9mIF9zdGFydCkge1xuICAgICAgZm9yIChjb25zdCBlbmQgb2YgX2VuZCkge1xuICAgICAgICBjb25zdCBpc0xhc3RTdGFydCA9IHN0YXJ0ID09PSBfc3RhcnRbX3N0YXJ0Lmxlbmd0aCAtIDFdO1xuICAgICAgICBjb25zdCBpc0ZpcnN0RW5kID0gZW5kID09PSBfZW5kWzBdO1xuICAgICAgICBpZiAoaXNMYXN0U3RhcnQgJiYgaXNGaXJzdEVuZCkge1xuICAgICAgICAgIHRoaXMuYWRkU2luZ2xlTGluayhzdGFydCwgZW5kLCBsaW5rRGF0YSwgaWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuYWRkU2luZ2xlTGluayhzdGFydCwgZW5kLCBsaW5rRGF0YSwgdm9pZCAwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICAvKipcbiAgICogVXBkYXRlcyBhIGxpbmsncyBsaW5lIGludGVycG9sYXRpb24gYWxnb3JpdGhtXG4gICAqL1xuICB1cGRhdGVMaW5rSW50ZXJwb2xhdGUocG9zaXRpb25zLCBpbnRlcnBvbGF0ZSkge1xuICAgIHBvc2l0aW9ucy5mb3JFYWNoKChwb3MpID0+IHtcbiAgICAgIGlmIChwb3MgPT09IFwiZGVmYXVsdFwiKSB7XG4gICAgICAgIHRoaXMuZWRnZXMuZGVmYXVsdEludGVycG9sYXRlID0gaW50ZXJwb2xhdGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmVkZ2VzW3Bvc10uaW50ZXJwb2xhdGUgPSBpbnRlcnBvbGF0ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICogVXBkYXRlcyBhIGxpbmsgd2l0aCBhIHN0eWxlXG4gICAqXG4gICAqL1xuICB1cGRhdGVMaW5rKHBvc2l0aW9ucywgc3R5bGUpIHtcbiAgICBwb3NpdGlvbnMuZm9yRWFjaCgocG9zKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHBvcyA9PT0gXCJudW1iZXJcIiAmJiBwb3MgPj0gdGhpcy5lZGdlcy5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBUaGUgaW5kZXggJHtwb3N9IGZvciBsaW5rU3R5bGUgaXMgb3V0IG9mIGJvdW5kcy4gVmFsaWQgaW5kaWNlcyBmb3IgbGlua1N0eWxlIGFyZSBiZXR3ZWVuIDAgYW5kICR7dGhpcy5lZGdlcy5sZW5ndGggLSAxfS4gKEhlbHA6IEVuc3VyZSB0aGF0IHRoZSBpbmRleCBpcyB3aXRoaW4gdGhlIHJhbmdlIG9mIGV4aXN0aW5nIGVkZ2VzLilgXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBpZiAocG9zID09PSBcImRlZmF1bHRcIikge1xuICAgICAgICB0aGlzLmVkZ2VzLmRlZmF1bHRTdHlsZSA9IHN0eWxlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lZGdlc1twb3NdLnN0eWxlID0gc3R5bGU7XG4gICAgICAgIGlmICgodGhpcy5lZGdlc1twb3NdPy5zdHlsZT8ubGVuZ3RoID8/IDApID4gMCAmJiAhdGhpcy5lZGdlc1twb3NdPy5zdHlsZT8uc29tZSgocykgPT4gcz8uc3RhcnRzV2l0aChcImZpbGxcIikpKSB7XG4gICAgICAgICAgdGhpcy5lZGdlc1twb3NdPy5zdHlsZT8ucHVzaChcImZpbGw6bm9uZVwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGFkZENsYXNzKGlkcywgX3N0eWxlKSB7XG4gICAgY29uc3Qgc3R5bGUgPSBfc3R5bGUuam9pbigpLnJlcGxhY2UoL1xcXFwsL2csIFwiXFx4QTdcXHhBN1xceEE3XCIpLnJlcGxhY2UoLywvZywgXCI7XCIpLnJlcGxhY2UoL8KnwqfCpy9nLCBcIixcIikuc3BsaXQoXCI7XCIpO1xuICAgIGlkcy5zcGxpdChcIixcIikuZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgIGxldCBjbGFzc05vZGUgPSB0aGlzLmNsYXNzZXMuZ2V0KGlkKTtcbiAgICAgIGlmIChjbGFzc05vZGUgPT09IHZvaWQgMCkge1xuICAgICAgICBjbGFzc05vZGUgPSB7IGlkLCBzdHlsZXM6IFtdLCB0ZXh0U3R5bGVzOiBbXSB9O1xuICAgICAgICB0aGlzLmNsYXNzZXMuc2V0KGlkLCBjbGFzc05vZGUpO1xuICAgICAgfVxuICAgICAgaWYgKHN0eWxlICE9PSB2b2lkIDAgJiYgc3R5bGUgIT09IG51bGwpIHtcbiAgICAgICAgc3R5bGUuZm9yRWFjaCgocykgPT4ge1xuICAgICAgICAgIGlmICgvY29sb3IvLmV4ZWMocykpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1N0eWxlID0gcy5yZXBsYWNlKFwiZmlsbFwiLCBcImJnRmlsbFwiKTtcbiAgICAgICAgICAgIGNsYXNzTm9kZS50ZXh0U3R5bGVzLnB1c2gobmV3U3R5bGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjbGFzc05vZGUuc3R5bGVzLnB1c2gocyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgcGFyc2VyIHdoZW4gYSBncmFwaCBkZWZpbml0aW9uIGlzIGZvdW5kLCBzdG9yZXMgdGhlIGRpcmVjdGlvbiBvZiB0aGUgY2hhcnQuXG4gICAqXG4gICAqL1xuICBzZXREaXJlY3Rpb24oZGlyKSB7XG4gICAgdGhpcy5kaXJlY3Rpb24gPSBkaXIudHJpbSgpO1xuICAgIGlmICgvLio8Ly5leGVjKHRoaXMuZGlyZWN0aW9uKSkge1xuICAgICAgdGhpcy5kaXJlY3Rpb24gPSBcIlJMXCI7XG4gICAgfVxuICAgIGlmICgvLipcXF4vLmV4ZWModGhpcy5kaXJlY3Rpb24pKSB7XG4gICAgICB0aGlzLmRpcmVjdGlvbiA9IFwiQlRcIjtcbiAgICB9XG4gICAgaWYgKC8uKj4vLmV4ZWModGhpcy5kaXJlY3Rpb24pKSB7XG4gICAgICB0aGlzLmRpcmVjdGlvbiA9IFwiTFJcIjtcbiAgICB9XG4gICAgaWYgKC8uKnYvLmV4ZWModGhpcy5kaXJlY3Rpb24pKSB7XG4gICAgICB0aGlzLmRpcmVjdGlvbiA9IFwiVEJcIjtcbiAgICB9XG4gICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSBcIlREXCIpIHtcbiAgICAgIHRoaXMuZGlyZWN0aW9uID0gXCJUQlwiO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHBhcnNlciB3aGVuIGEgc3BlY2lhbCBub2RlIGlzIGZvdW5kLCBlLmcuIGEgY2xpY2thYmxlIGVsZW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSBpZHMgLSBDb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiBpZHNcbiAgICogQHBhcmFtIGNsYXNzTmFtZSAtIENsYXNzIHRvIGFkZFxuICAgKi9cbiAgc2V0Q2xhc3MoaWRzLCBjbGFzc05hbWUpIHtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIGlkcy5zcGxpdChcIixcIikpIHtcbiAgICAgIGNvbnN0IHZlcnRleCA9IHRoaXMudmVydGljZXMuZ2V0KGlkKTtcbiAgICAgIGlmICh2ZXJ0ZXgpIHtcbiAgICAgICAgdmVydGV4LmNsYXNzZXMucHVzaChjbGFzc05hbWUpO1xuICAgICAgfVxuICAgICAgY29uc3QgZWRnZSA9IHRoaXMuZWRnZXMuZmluZCgoZSkgPT4gZS5pZCA9PT0gaWQpO1xuICAgICAgaWYgKGVkZ2UpIHtcbiAgICAgICAgZWRnZS5jbGFzc2VzLnB1c2goY2xhc3NOYW1lKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHN1YkdyYXBoID0gdGhpcy5zdWJHcmFwaExvb2t1cC5nZXQoaWQpO1xuICAgICAgaWYgKHN1YkdyYXBoKSB7XG4gICAgICAgIHN1YkdyYXBoLmNsYXNzZXMucHVzaChjbGFzc05hbWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBzZXRUb29sdGlwKGlkcywgdG9vbHRpcCkge1xuICAgIGlmICh0b29sdGlwID09PSB2b2lkIDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdG9vbHRpcCA9IHRoaXMuc2FuaXRpemVUZXh0KHRvb2x0aXApO1xuICAgIGZvciAoY29uc3QgaWQgb2YgaWRzLnNwbGl0KFwiLFwiKSkge1xuICAgICAgdGhpcy50b29sdGlwcy5zZXQodGhpcy52ZXJzaW9uID09PSBcImdlbi0xXCIgPyB0aGlzLmxvb2tVcERvbUlkKGlkKSA6IGlkLCB0b29sdGlwKTtcbiAgICB9XG4gIH1cbiAgc2V0Q2xpY2tGdW4oaWQsIGZ1bmN0aW9uTmFtZSwgZnVuY3Rpb25BcmdzKSB7XG4gICAgaWYgKGdldENvbmZpZygpLnNlY3VyaXR5TGV2ZWwgIT09IFwibG9vc2VcIikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZnVuY3Rpb25OYW1lID09PSB2b2lkIDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IGFyZ0xpc3QgPSBbXTtcbiAgICBpZiAodHlwZW9mIGZ1bmN0aW9uQXJncyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgYXJnTGlzdCA9IGZ1bmN0aW9uQXJncy5zcGxpdCgvLCg/PSg/Oig/OlteXCJdKlwiKXsyfSkqW15cIl0qJCkvKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJnTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgaXRlbSA9IGFyZ0xpc3RbaV0udHJpbSgpO1xuICAgICAgICBpZiAoaXRlbS5zdGFydHNXaXRoKCdcIicpICYmIGl0ZW0uZW5kc1dpdGgoJ1wiJykpIHtcbiAgICAgICAgICBpdGVtID0gaXRlbS5zdWJzdHIoMSwgaXRlbS5sZW5ndGggLSAyKTtcbiAgICAgICAgfVxuICAgICAgICBhcmdMaXN0W2ldID0gaXRlbTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGFyZ0xpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICBhcmdMaXN0LnB1c2goaWQpO1xuICAgIH1cbiAgICBjb25zdCB2ZXJ0ZXggPSB0aGlzLnZlcnRpY2VzLmdldChpZCk7XG4gICAgaWYgKHZlcnRleCkge1xuICAgICAgdmVydGV4LmhhdmVDYWxsYmFjayA9IHRydWU7XG4gICAgICB0aGlzLmZ1bnMucHVzaCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRvbUlkID0gdGhpcy5sb29rVXBEb21JZChpZCk7XG4gICAgICAgIGNvbnN0IGVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbaWQ9XCIke2RvbUlkfVwiXWApO1xuICAgICAgICBpZiAoZWxlbSAhPT0gbnVsbCkge1xuICAgICAgICAgIGVsZW0uYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgICAgIFwiY2xpY2tcIixcbiAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgdXRpbHNfZGVmYXVsdC5ydW5GdW5jKGZ1bmN0aW9uTmFtZSwgLi4uYXJnTGlzdCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIENhbGxlZCBieSBwYXJzZXIgd2hlbiBhIGxpbmsgaXMgZm91bmQuIEFkZHMgdGhlIFVSTCB0byB0aGUgdmVydGV4IGRhdGEuXG4gICAqXG4gICAqIEBwYXJhbSBpZHMgLSBDb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiBpZHNcbiAgICogQHBhcmFtIGxpbmtTdHIgLSBVUkwgdG8gY3JlYXRlIGEgbGluayBmb3JcbiAgICogQHBhcmFtIHRhcmdldCAtIFRhcmdldCBhdHRyaWJ1dGUgZm9yIHRoZSBsaW5rXG4gICAqL1xuICBzZXRMaW5rKGlkcywgbGlua1N0ciwgdGFyZ2V0KSB7XG4gICAgaWRzLnNwbGl0KFwiLFwiKS5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgY29uc3QgdmVydGV4ID0gdGhpcy52ZXJ0aWNlcy5nZXQoaWQpO1xuICAgICAgaWYgKHZlcnRleCAhPT0gdm9pZCAwKSB7XG4gICAgICAgIHZlcnRleC5saW5rID0gdXRpbHNfZGVmYXVsdC5mb3JtYXRVcmwobGlua1N0ciwgdGhpcy5jb25maWcpO1xuICAgICAgICB2ZXJ0ZXgubGlua1RhcmdldCA9IHRhcmdldDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLnNldENsYXNzKGlkcywgXCJjbGlja2FibGVcIik7XG4gIH1cbiAgZ2V0VG9vbHRpcChpZCkge1xuICAgIHJldHVybiB0aGlzLnRvb2x0aXBzLmdldChpZCk7XG4gIH1cbiAgLyoqXG4gICAqIENhbGxlZCBieSBwYXJzZXIgd2hlbiBhIGNsaWNrIGRlZmluaXRpb24gaXMgZm91bmQuIFJlZ2lzdGVycyBhbiBldmVudCBoYW5kbGVyLlxuICAgKlxuICAgKiBAcGFyYW0gaWRzIC0gQ29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgaWRzXG4gICAqIEBwYXJhbSBmdW5jdGlvbk5hbWUgLSBGdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gY2xpY2tcbiAgICogQHBhcmFtIGZ1bmN0aW9uQXJncyAtIEFyZ3VtZW50cyB0byBiZSBwYXNzZWQgdG8gdGhlIGZ1bmN0aW9uXG4gICAqL1xuICBzZXRDbGlja0V2ZW50KGlkcywgZnVuY3Rpb25OYW1lLCBmdW5jdGlvbkFyZ3MpIHtcbiAgICBpZHMuc3BsaXQoXCIsXCIpLmZvckVhY2goKGlkKSA9PiB7XG4gICAgICB0aGlzLnNldENsaWNrRnVuKGlkLCBmdW5jdGlvbk5hbWUsIGZ1bmN0aW9uQXJncyk7XG4gICAgfSk7XG4gICAgdGhpcy5zZXRDbGFzcyhpZHMsIFwiY2xpY2thYmxlXCIpO1xuICB9XG4gIGJpbmRGdW5jdGlvbnMoZWxlbWVudCkge1xuICAgIHRoaXMuZnVucy5mb3JFYWNoKChmdW4pID0+IHtcbiAgICAgIGZ1bihlbGVtZW50KTtcbiAgICB9KTtcbiAgfVxuICBnZXREaXJlY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlyZWN0aW9uPy50cmltKCk7XG4gIH1cbiAgLyoqXG4gICAqIFJldHJpZXZhbCBmdW5jdGlvbiBmb3IgZmV0Y2hpbmcgdGhlIGZvdW5kIG5vZGVzIGFmdGVyIHBhcnNpbmcgaGFzIGNvbXBsZXRlZC5cbiAgICpcbiAgICovXG4gIGdldFZlcnRpY2VzKCkge1xuICAgIHJldHVybiB0aGlzLnZlcnRpY2VzO1xuICB9XG4gIC8qKlxuICAgKiBSZXRyaWV2YWwgZnVuY3Rpb24gZm9yIGZldGNoaW5nIHRoZSBmb3VuZCBsaW5rcyBhZnRlciBwYXJzaW5nIGhhcyBjb21wbGV0ZWQuXG4gICAqXG4gICAqL1xuICBnZXRFZGdlcygpIHtcbiAgICByZXR1cm4gdGhpcy5lZGdlcztcbiAgfVxuICAvKipcbiAgICogUmV0cmlldmFsIGZ1bmN0aW9uIGZvciBmZXRjaGluZyB0aGUgZm91bmQgY2xhc3MgZGVmaW5pdGlvbnMgYWZ0ZXIgcGFyc2luZyBoYXMgY29tcGxldGVkLlxuICAgKlxuICAgKi9cbiAgZ2V0Q2xhc3NlcygpIHtcbiAgICByZXR1cm4gdGhpcy5jbGFzc2VzO1xuICB9XG4gIHNldHVwVG9vbFRpcHMoZWxlbWVudCkge1xuICAgIGNvbnN0IHRvb2x0aXBFbGVtID0gY3JlYXRlVG9vbHRpcCgpO1xuICAgIGNvbnN0IHN2ZyA9IHNlbGVjdChlbGVtZW50KS5zZWxlY3QoXCJzdmdcIik7XG4gICAgY29uc3Qgbm9kZXMgPSBzdmcuc2VsZWN0QWxsKFwiZy5ub2RlXCIpO1xuICAgIG5vZGVzLm9uKFwibW91c2VvdmVyXCIsIChlKSA9PiB7XG4gICAgICBjb25zdCBlbCA9IHNlbGVjdChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgY29uc3QgdGl0bGUgPSBlbC5hdHRyKFwidGl0bGVcIik7XG4gICAgICBpZiAodGl0bGUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgcmVjdCA9IGUuY3VycmVudFRhcmdldD8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB0b29sdGlwRWxlbS50cmFuc2l0aW9uKCkuZHVyYXRpb24oMjAwKS5zdHlsZShcIm9wYWNpdHlcIiwgXCIuOVwiKTtcbiAgICAgIHRvb2x0aXBFbGVtLnRleHQoZWwuYXR0cihcInRpdGxlXCIpKS5zdHlsZShcImxlZnRcIiwgd2luZG93LnNjcm9sbFggKyByZWN0LmxlZnQgKyAocmVjdC5yaWdodCAtIHJlY3QubGVmdCkgLyAyICsgXCJweFwiKS5zdHlsZShcInRvcFwiLCB3aW5kb3cuc2Nyb2xsWSArIHJlY3QuYm90dG9tICsgXCJweFwiKTtcbiAgICAgIHRvb2x0aXBFbGVtLmh0bWwoRE9NUHVyaWZ5LnNhbml0aXplKHRpdGxlKSk7XG4gICAgICBlbC5jbGFzc2VkKFwiaG92ZXJcIiwgdHJ1ZSk7XG4gICAgfSkub24oXCJtb3VzZW91dFwiLCAoZSkgPT4ge1xuICAgICAgdG9vbHRpcEVsZW0udHJhbnNpdGlvbigpLmR1cmF0aW9uKDUwMCkuc3R5bGUoXCJvcGFjaXR5XCIsIDApO1xuICAgICAgY29uc3QgZWwgPSBzZWxlY3QoZS5jdXJyZW50VGFyZ2V0KTtcbiAgICAgIGVsLmNsYXNzZWQoXCJob3ZlclwiLCBmYWxzZSk7XG4gICAgfSk7XG4gIH1cbiAgLyoqXG4gICAqIENsZWFycyB0aGUgaW50ZXJuYWwgZ3JhcGggZGIgc28gdGhhdCBhIG5ldyBncmFwaCBjYW4gYmUgcGFyc2VkLlxuICAgKlxuICAgKi9cbiAgY2xlYXIodmVyID0gXCJnZW4tMlwiKSB7XG4gICAgdGhpcy52ZXJ0aWNlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgdGhpcy5jbGFzc2VzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICB0aGlzLmVkZ2VzID0gW107XG4gICAgdGhpcy5mdW5zID0gW3RoaXMuc2V0dXBUb29sVGlwcy5iaW5kKHRoaXMpXTtcbiAgICB0aGlzLmRpYWdyYW1JZCA9IFwiXCI7XG4gICAgdGhpcy5zdWJHcmFwaHMgPSBbXTtcbiAgICB0aGlzLnN1YkdyYXBoTG9va3VwID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICB0aGlzLnN1YkNvdW50ID0gMDtcbiAgICB0aGlzLnRvb2x0aXBzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICB0aGlzLmZpcnN0R3JhcGhGbGFnID0gdHJ1ZTtcbiAgICB0aGlzLnZlcnNpb24gPSB2ZXI7XG4gICAgdGhpcy5jb25maWcgPSBnZXRDb25maWcoKTtcbiAgICBjbGVhcigpO1xuICB9XG4gIHNldEdlbih2ZXIpIHtcbiAgICB0aGlzLnZlcnNpb24gPSB2ZXIgfHwgXCJnZW4tMlwiO1xuICB9XG4gIGRlZmF1bHRTdHlsZSgpIHtcbiAgICByZXR1cm4gXCJmaWxsOiNmZmE7c3Ryb2tlOiAjZjY2OyBzdHJva2Utd2lkdGg6IDNweDsgc3Ryb2tlLWRhc2hhcnJheTogNSwgNTtmaWxsOiNmZmE7c3Ryb2tlOiAjNjY2O1wiO1xuICB9XG4gIGFkZFN1YkdyYXBoKF9pZCwgbGlzdCwgX3RpdGxlKSB7XG4gICAgbGV0IGlkID0gX2lkLnRleHQudHJpbSgpO1xuICAgIGxldCB0aXRsZSA9IF90aXRsZS50ZXh0O1xuICAgIGlmIChfaWQgPT09IF90aXRsZSAmJiAvXFxzLy5leGVjKF90aXRsZS50ZXh0KSkge1xuICAgICAgaWQgPSB2b2lkIDA7XG4gICAgfVxuICAgIGNvbnN0IHVuaXEgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChhKSA9PiB7XG4gICAgICBjb25zdCBwcmltcyA9IHsgYm9vbGVhbjoge30sIG51bWJlcjoge30sIHN0cmluZzoge30gfTtcbiAgICAgIGNvbnN0IG9ianMgPSBbXTtcbiAgICAgIGxldCBkaXIyO1xuICAgICAgY29uc3Qgbm9kZUxpc3QyID0gYS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBjb25zdCB0eXBlID0gdHlwZW9mIGl0ZW07XG4gICAgICAgIGlmIChpdGVtLnN0bXQgJiYgaXRlbS5zdG10ID09PSBcImRpclwiKSB7XG4gICAgICAgICAgZGlyMiA9IGl0ZW0udmFsdWU7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpdGVtLnRyaW0oKSA9PT0gXCJcIikge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZSBpbiBwcmltcykge1xuICAgICAgICAgIHJldHVybiBwcmltc1t0eXBlXS5oYXNPd25Qcm9wZXJ0eShpdGVtKSA/IGZhbHNlIDogcHJpbXNbdHlwZV1baXRlbV0gPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBvYmpzLmluY2x1ZGVzKGl0ZW0pID8gZmFsc2UgOiBvYmpzLnB1c2goaXRlbSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHsgbm9kZUxpc3Q6IG5vZGVMaXN0MiwgZGlyOiBkaXIyIH07XG4gICAgfSwgXCJ1bmlxXCIpO1xuICAgIGNvbnN0IHJlc3VsdCA9IHVuaXEobGlzdC5mbGF0KCkpO1xuICAgIGNvbnN0IG5vZGVMaXN0ID0gcmVzdWx0Lm5vZGVMaXN0O1xuICAgIGxldCBkaXIgPSByZXN1bHQuZGlyO1xuICAgIGNvbnN0IGZsb3djaGFydENvbmZpZyA9IGdldENvbmZpZygpLmZsb3djaGFydCA/PyB7fTtcbiAgICBkaXIgPSBkaXIgPz8gKGZsb3djaGFydENvbmZpZy5pbmhlcml0RGlyID8gdGhpcy5nZXREaXJlY3Rpb24oKSA/PyBnZXRDb25maWcoKS5kaXJlY3Rpb24gPz8gdm9pZCAwIDogdm9pZCAwKTtcbiAgICBpZiAodGhpcy52ZXJzaW9uID09PSBcImdlbi0xXCIpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbm9kZUxpc3RbaV0gPSB0aGlzLmxvb2tVcERvbUlkKG5vZGVMaXN0W2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWQgPSBpZCA/PyBcInN1YkdyYXBoXCIgKyB0aGlzLnN1YkNvdW50O1xuICAgIHRpdGxlID0gdGl0bGUgfHwgXCJcIjtcbiAgICB0aXRsZSA9IHRoaXMuc2FuaXRpemVUZXh0KHRpdGxlKTtcbiAgICB0aGlzLnN1YkNvdW50ID0gdGhpcy5zdWJDb3VudCArIDE7XG4gICAgY29uc3Qgc3ViR3JhcGggPSB7XG4gICAgICBpZCxcbiAgICAgIG5vZGVzOiBub2RlTGlzdCxcbiAgICAgIHRpdGxlOiB0aXRsZS50cmltKCksXG4gICAgICBjbGFzc2VzOiBbXSxcbiAgICAgIGRpcixcbiAgICAgIGxhYmVsVHlwZTogdGhpcy5zYW5pdGl6ZU5vZGVMYWJlbFR5cGUoX3RpdGxlPy50eXBlKVxuICAgIH07XG4gICAgbG9nLmluZm8oXCJBZGRpbmdcIiwgc3ViR3JhcGguaWQsIHN1YkdyYXBoLm5vZGVzLCBzdWJHcmFwaC5kaXIpO1xuICAgIHN1YkdyYXBoLm5vZGVzID0gdGhpcy5tYWtlVW5pcShzdWJHcmFwaCwgdGhpcy5zdWJHcmFwaHMpLm5vZGVzO1xuICAgIHRoaXMuc3ViR3JhcGhzLnB1c2goc3ViR3JhcGgpO1xuICAgIHRoaXMuc3ViR3JhcGhMb29rdXAuc2V0KGlkLCBzdWJHcmFwaCk7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIGdldFBvc0ZvcklkKGlkKSB7XG4gICAgZm9yIChjb25zdCBbaSwgc3ViR3JhcGhdIG9mIHRoaXMuc3ViR3JhcGhzLmVudHJpZXMoKSkge1xuICAgICAgaWYgKHN1YkdyYXBoLmlkID09PSBpZCkge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9XG4gIGluZGV4Tm9kZXMyKGlkLCBwb3MpIHtcbiAgICBjb25zdCBub2RlcyA9IHRoaXMuc3ViR3JhcGhzW3Bvc10ubm9kZXM7XG4gICAgdGhpcy5zZWNDb3VudCA9IHRoaXMuc2VjQ291bnQgKyAxO1xuICAgIGlmICh0aGlzLnNlY0NvdW50ID4gMmUzKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByZXN1bHQ6IGZhbHNlLFxuICAgICAgICBjb3VudDogMFxuICAgICAgfTtcbiAgICB9XG4gICAgdGhpcy5wb3NDcm9zc1JlZlt0aGlzLnNlY0NvdW50XSA9IHBvcztcbiAgICBpZiAodGhpcy5zdWJHcmFwaHNbcG9zXS5pZCA9PT0gaWQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlc3VsdDogdHJ1ZSxcbiAgICAgICAgY291bnQ6IDBcbiAgICAgIH07XG4gICAgfVxuICAgIGxldCBjb3VudCA9IDA7XG4gICAgbGV0IHBvc0NvdW50ID0gMTtcbiAgICB3aGlsZSAoY291bnQgPCBub2Rlcy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGNoaWxkUG9zID0gdGhpcy5nZXRQb3NGb3JJZChub2Rlc1tjb3VudF0pO1xuICAgICAgaWYgKGNoaWxkUG9zID49IDApIHtcbiAgICAgICAgY29uc3QgcmVzID0gdGhpcy5pbmRleE5vZGVzMihpZCwgY2hpbGRQb3MpO1xuICAgICAgICBpZiAocmVzLnJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN1bHQ6IHRydWUsXG4gICAgICAgICAgICBjb3VudDogcG9zQ291bnQgKyByZXMuY291bnRcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBvc0NvdW50ID0gcG9zQ291bnQgKyByZXMuY291bnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvdW50ID0gY291bnQgKyAxO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdWx0OiBmYWxzZSxcbiAgICAgIGNvdW50OiBwb3NDb3VudFxuICAgIH07XG4gIH1cbiAgZ2V0RGVwdGhGaXJzdFBvcyhwb3MpIHtcbiAgICByZXR1cm4gdGhpcy5wb3NDcm9zc1JlZltwb3NdO1xuICB9XG4gIGluZGV4Tm9kZXMoKSB7XG4gICAgdGhpcy5zZWNDb3VudCA9IC0xO1xuICAgIGlmICh0aGlzLnN1YkdyYXBocy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLmluZGV4Tm9kZXMyKFwibm9uZVwiLCB0aGlzLnN1YkdyYXBocy5sZW5ndGggLSAxKTtcbiAgICB9XG4gIH1cbiAgZ2V0U3ViR3JhcGhzKCkge1xuICAgIHJldHVybiB0aGlzLnN1YkdyYXBocztcbiAgfVxuICBmaXJzdEdyYXBoKCkge1xuICAgIGlmICh0aGlzLmZpcnN0R3JhcGhGbGFnKSB7XG4gICAgICB0aGlzLmZpcnN0R3JhcGhGbGFnID0gZmFsc2U7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGRlc3RydWN0U3RhcnRMaW5rKF9zdHIpIHtcbiAgICBsZXQgc3RyID0gX3N0ci50cmltKCk7XG4gICAgbGV0IHR5cGUgPSBcImFycm93X29wZW5cIjtcbiAgICBzd2l0Y2ggKHN0clswXSkge1xuICAgICAgY2FzZSBcIjxcIjpcbiAgICAgICAgdHlwZSA9IFwiYXJyb3dfcG9pbnRcIjtcbiAgICAgICAgc3RyID0gc3RyLnNsaWNlKDEpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJ4XCI6XG4gICAgICAgIHR5cGUgPSBcImFycm93X2Nyb3NzXCI7XG4gICAgICAgIHN0ciA9IHN0ci5zbGljZSgxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwib1wiOlxuICAgICAgICB0eXBlID0gXCJhcnJvd19jaXJjbGVcIjtcbiAgICAgICAgc3RyID0gc3RyLnNsaWNlKDEpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgbGV0IHN0cm9rZSA9IFwibm9ybWFsXCI7XG4gICAgaWYgKHN0ci5pbmNsdWRlcyhcIj1cIikpIHtcbiAgICAgIHN0cm9rZSA9IFwidGhpY2tcIjtcbiAgICB9XG4gICAgaWYgKHN0ci5pbmNsdWRlcyhcIi5cIikpIHtcbiAgICAgIHN0cm9rZSA9IFwiZG90dGVkXCI7XG4gICAgfVxuICAgIHJldHVybiB7IHR5cGUsIHN0cm9rZSB9O1xuICB9XG4gIGNvdW50Q2hhcihjaGFyLCBzdHIpIHtcbiAgICBjb25zdCBsZW5ndGggPSBzdHIubGVuZ3RoO1xuICAgIGxldCBjb3VudCA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgICAgaWYgKHN0cltpXSA9PT0gY2hhcikge1xuICAgICAgICArK2NvdW50O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY291bnQ7XG4gIH1cbiAgZGVzdHJ1Y3RFbmRMaW5rKF9zdHIpIHtcbiAgICBjb25zdCBzdHIgPSBfc3RyLnRyaW0oKTtcbiAgICBsZXQgbGluZSA9IHN0ci5zbGljZSgwLCAtMSk7XG4gICAgbGV0IHR5cGUgPSBcImFycm93X29wZW5cIjtcbiAgICBzd2l0Y2ggKHN0ci5zbGljZSgtMSkpIHtcbiAgICAgIGNhc2UgXCJ4XCI6XG4gICAgICAgIHR5cGUgPSBcImFycm93X2Nyb3NzXCI7XG4gICAgICAgIGlmIChzdHIuc3RhcnRzV2l0aChcInhcIikpIHtcbiAgICAgICAgICB0eXBlID0gXCJkb3VibGVfXCIgKyB0eXBlO1xuICAgICAgICAgIGxpbmUgPSBsaW5lLnNsaWNlKDEpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIj5cIjpcbiAgICAgICAgdHlwZSA9IFwiYXJyb3dfcG9pbnRcIjtcbiAgICAgICAgaWYgKHN0ci5zdGFydHNXaXRoKFwiPFwiKSkge1xuICAgICAgICAgIHR5cGUgPSBcImRvdWJsZV9cIiArIHR5cGU7XG4gICAgICAgICAgbGluZSA9IGxpbmUuc2xpY2UoMSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwib1wiOlxuICAgICAgICB0eXBlID0gXCJhcnJvd19jaXJjbGVcIjtcbiAgICAgICAgaWYgKHN0ci5zdGFydHNXaXRoKFwib1wiKSkge1xuICAgICAgICAgIHR5cGUgPSBcImRvdWJsZV9cIiArIHR5cGU7XG4gICAgICAgICAgbGluZSA9IGxpbmUuc2xpY2UoMSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGxldCBzdHJva2UgPSBcIm5vcm1hbFwiO1xuICAgIGxldCBsZW5ndGggPSBsaW5lLmxlbmd0aCAtIDE7XG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aChcIj1cIikpIHtcbiAgICAgIHN0cm9rZSA9IFwidGhpY2tcIjtcbiAgICB9XG4gICAgaWYgKGxpbmUuc3RhcnRzV2l0aChcIn5cIikpIHtcbiAgICAgIHN0cm9rZSA9IFwiaW52aXNpYmxlXCI7XG4gICAgfVxuICAgIGNvbnN0IGRvdHMgPSB0aGlzLmNvdW50Q2hhcihcIi5cIiwgbGluZSk7XG4gICAgaWYgKGRvdHMpIHtcbiAgICAgIHN0cm9rZSA9IFwiZG90dGVkXCI7XG4gICAgICBsZW5ndGggPSBkb3RzO1xuICAgIH1cbiAgICByZXR1cm4geyB0eXBlLCBzdHJva2UsIGxlbmd0aCB9O1xuICB9XG4gIGRlc3RydWN0TGluayhfc3RyLCBfc3RhcnRTdHIpIHtcbiAgICBjb25zdCBpbmZvID0gdGhpcy5kZXN0cnVjdEVuZExpbmsoX3N0cik7XG4gICAgbGV0IHN0YXJ0SW5mbztcbiAgICBpZiAoX3N0YXJ0U3RyKSB7XG4gICAgICBzdGFydEluZm8gPSB0aGlzLmRlc3RydWN0U3RhcnRMaW5rKF9zdGFydFN0cik7XG4gICAgICBpZiAoc3RhcnRJbmZvLnN0cm9rZSAhPT0gaW5mby5zdHJva2UpIHtcbiAgICAgICAgcmV0dXJuIHsgdHlwZTogXCJJTlZBTElEXCIsIHN0cm9rZTogXCJJTlZBTElEXCIgfTtcbiAgICAgIH1cbiAgICAgIGlmIChzdGFydEluZm8udHlwZSA9PT0gXCJhcnJvd19vcGVuXCIpIHtcbiAgICAgICAgc3RhcnRJbmZvLnR5cGUgPSBpbmZvLnR5cGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc3RhcnRJbmZvLnR5cGUgIT09IGluZm8udHlwZSkge1xuICAgICAgICAgIHJldHVybiB7IHR5cGU6IFwiSU5WQUxJRFwiLCBzdHJva2U6IFwiSU5WQUxJRFwiIH07XG4gICAgICAgIH1cbiAgICAgICAgc3RhcnRJbmZvLnR5cGUgPSBcImRvdWJsZV9cIiArIHN0YXJ0SW5mby50eXBlO1xuICAgICAgfVxuICAgICAgaWYgKHN0YXJ0SW5mby50eXBlID09PSBcImRvdWJsZV9hcnJvd1wiKSB7XG4gICAgICAgIHN0YXJ0SW5mby50eXBlID0gXCJkb3VibGVfYXJyb3dfcG9pbnRcIjtcbiAgICAgIH1cbiAgICAgIHN0YXJ0SW5mby5sZW5ndGggPSBpbmZvLmxlbmd0aDtcbiAgICAgIHJldHVybiBzdGFydEluZm87XG4gICAgfVxuICAgIHJldHVybiBpbmZvO1xuICB9XG4gIC8vIFRvZG8gb3B0aW1pemVyIHRoaXMgYnkgY2FjaGluZyBleGlzdGluZyBub2Rlc1xuICBleGlzdHMoYWxsU2dzLCBfaWQpIHtcbiAgICBmb3IgKGNvbnN0IHNnIG9mIGFsbFNncykge1xuICAgICAgaWYgKHNnLm5vZGVzLmluY2x1ZGVzKF9pZCkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvKipcbiAgICogRGVsZXRlcyBhbiBpZCBmcm9tIGFsbCBzdWJncmFwaHNcbiAgICpcbiAgICovXG4gIG1ha2VVbmlxKHNnLCBhbGxTdWJncmFwaHMpIHtcbiAgICBjb25zdCByZXMgPSBbXTtcbiAgICBzZy5ub2Rlcy5mb3JFYWNoKChfaWQsIHBvcykgPT4ge1xuICAgICAgaWYgKCF0aGlzLmV4aXN0cyhhbGxTdWJncmFwaHMsIF9pZCkpIHtcbiAgICAgICAgcmVzLnB1c2goc2cubm9kZXNbcG9zXSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHsgbm9kZXM6IHJlcyB9O1xuICB9XG4gIGdldFR5cGVGcm9tVmVydGV4KHZlcnRleCkge1xuICAgIGlmICh2ZXJ0ZXguaW1nKSB7XG4gICAgICByZXR1cm4gXCJpbWFnZVNxdWFyZVwiO1xuICAgIH1cbiAgICBpZiAodmVydGV4Lmljb24pIHtcbiAgICAgIGlmICh2ZXJ0ZXguZm9ybSA9PT0gXCJjaXJjbGVcIikge1xuICAgICAgICByZXR1cm4gXCJpY29uQ2lyY2xlXCI7XG4gICAgICB9XG4gICAgICBpZiAodmVydGV4LmZvcm0gPT09IFwic3F1YXJlXCIpIHtcbiAgICAgICAgcmV0dXJuIFwiaWNvblNxdWFyZVwiO1xuICAgICAgfVxuICAgICAgaWYgKHZlcnRleC5mb3JtID09PSBcInJvdW5kZWRcIikge1xuICAgICAgICByZXR1cm4gXCJpY29uUm91bmRlZFwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFwiaWNvblwiO1xuICAgIH1cbiAgICBzd2l0Y2ggKHZlcnRleC50eXBlKSB7XG4gICAgICBjYXNlIFwic3F1YXJlXCI6XG4gICAgICBjYXNlIHZvaWQgMDpcbiAgICAgICAgcmV0dXJuIFwic3F1YXJlUmVjdFwiO1xuICAgICAgY2FzZSBcInJvdW5kXCI6XG4gICAgICAgIHJldHVybiBcInJvdW5kZWRSZWN0XCI7XG4gICAgICBjYXNlIFwiZWxsaXBzZVwiOlxuICAgICAgICByZXR1cm4gXCJlbGxpcHNlXCI7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gdmVydGV4LnR5cGU7XG4gICAgfVxuICB9XG4gIGZpbmROb2RlKG5vZGVzLCBpZCkge1xuICAgIHJldHVybiBub2Rlcy5maW5kKChub2RlKSA9PiBub2RlLmlkID09PSBpZCk7XG4gIH1cbiAgZGVzdHJ1Y3RFZGdlVHlwZSh0eXBlKSB7XG4gICAgbGV0IGFycm93VHlwZVN0YXJ0ID0gXCJub25lXCI7XG4gICAgbGV0IGFycm93VHlwZUVuZCA9IFwiYXJyb3dfcG9pbnRcIjtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgXCJhcnJvd19wb2ludFwiOlxuICAgICAgY2FzZSBcImFycm93X2NpcmNsZVwiOlxuICAgICAgY2FzZSBcImFycm93X2Nyb3NzXCI6XG4gICAgICAgIGFycm93VHlwZUVuZCA9IHR5cGU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImRvdWJsZV9hcnJvd19wb2ludFwiOlxuICAgICAgY2FzZSBcImRvdWJsZV9hcnJvd19jaXJjbGVcIjpcbiAgICAgIGNhc2UgXCJkb3VibGVfYXJyb3dfY3Jvc3NcIjpcbiAgICAgICAgYXJyb3dUeXBlU3RhcnQgPSB0eXBlLnJlcGxhY2UoXCJkb3VibGVfXCIsIFwiXCIpO1xuICAgICAgICBhcnJvd1R5cGVFbmQgPSBhcnJvd1R5cGVTdGFydDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiB7IGFycm93VHlwZVN0YXJ0LCBhcnJvd1R5cGVFbmQgfTtcbiAgfVxuICBhZGROb2RlRnJvbVZlcnRleCh2ZXJ0ZXgsIG5vZGVzLCBwYXJlbnREQiwgc3ViR3JhcGhEQiwgY29uZmlnLCBsb29rKSB7XG4gICAgY29uc3QgcGFyZW50SWQgPSBwYXJlbnREQi5nZXQodmVydGV4LmlkKTtcbiAgICBjb25zdCBpc0dyb3VwID0gc3ViR3JhcGhEQi5nZXQodmVydGV4LmlkKSA/PyBmYWxzZTtcbiAgICBjb25zdCBub2RlID0gdGhpcy5maW5kTm9kZShub2RlcywgdmVydGV4LmlkKTtcbiAgICBpZiAobm9kZSkge1xuICAgICAgbm9kZS5jc3NTdHlsZXMgPSB2ZXJ0ZXguc3R5bGVzO1xuICAgICAgbm9kZS5jc3NDb21waWxlZFN0eWxlcyA9IHRoaXMuZ2V0Q29tcGlsZWRTdHlsZXModmVydGV4LmNsYXNzZXMpO1xuICAgICAgbm9kZS5jc3NDbGFzc2VzID0gdmVydGV4LmNsYXNzZXMuam9pbihcIiBcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGJhc2VOb2RlID0ge1xuICAgICAgICBpZDogdmVydGV4LmlkLFxuICAgICAgICBsYWJlbDogdmVydGV4LnRleHQsXG4gICAgICAgIGxhYmVsVHlwZTogdmVydGV4LmxhYmVsVHlwZSxcbiAgICAgICAgbGFiZWxTdHlsZTogXCJcIixcbiAgICAgICAgcGFyZW50SWQsXG4gICAgICAgIHBhZGRpbmc6IGNvbmZpZy5mbG93Y2hhcnQ/LnBhZGRpbmcgfHwgOCxcbiAgICAgICAgY3NzU3R5bGVzOiB2ZXJ0ZXguc3R5bGVzLFxuICAgICAgICBjc3NDb21waWxlZFN0eWxlczogdGhpcy5nZXRDb21waWxlZFN0eWxlcyhbXCJkZWZhdWx0XCIsIFwibm9kZVwiLCAuLi52ZXJ0ZXguY2xhc3Nlc10pLFxuICAgICAgICBjc3NDbGFzc2VzOiBcImRlZmF1bHQgXCIgKyB2ZXJ0ZXguY2xhc3Nlcy5qb2luKFwiIFwiKSxcbiAgICAgICAgZGlyOiB2ZXJ0ZXguZGlyLFxuICAgICAgICBkb21JZDogdmVydGV4LmRvbUlkLFxuICAgICAgICBsb29rLFxuICAgICAgICBsaW5rOiB2ZXJ0ZXgubGluayxcbiAgICAgICAgbGlua1RhcmdldDogdmVydGV4LmxpbmtUYXJnZXQsXG4gICAgICAgIHRvb2x0aXA6IHRoaXMuZ2V0VG9vbHRpcCh2ZXJ0ZXguaWQpLFxuICAgICAgICBpY29uOiB2ZXJ0ZXguaWNvbixcbiAgICAgICAgcG9zOiB2ZXJ0ZXgucG9zLFxuICAgICAgICBpbWc6IHZlcnRleC5pbWcsXG4gICAgICAgIGFzc2V0V2lkdGg6IHZlcnRleC5hc3NldFdpZHRoLFxuICAgICAgICBhc3NldEhlaWdodDogdmVydGV4LmFzc2V0SGVpZ2h0LFxuICAgICAgICBjb25zdHJhaW50OiB2ZXJ0ZXguY29uc3RyYWludFxuICAgICAgfTtcbiAgICAgIGlmIChpc0dyb3VwKSB7XG4gICAgICAgIG5vZGVzLnB1c2goe1xuICAgICAgICAgIC4uLmJhc2VOb2RlLFxuICAgICAgICAgIGlzR3JvdXA6IHRydWUsXG4gICAgICAgICAgc2hhcGU6IFwicmVjdFwiXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZXMucHVzaCh7XG4gICAgICAgICAgLi4uYmFzZU5vZGUsXG4gICAgICAgICAgaXNHcm91cDogZmFsc2UsXG4gICAgICAgICAgc2hhcGU6IHRoaXMuZ2V0VHlwZUZyb21WZXJ0ZXgodmVydGV4KVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZ2V0Q29tcGlsZWRTdHlsZXMoY2xhc3NEZWZzKSB7XG4gICAgbGV0IGNvbXBpbGVkU3R5bGVzID0gW107XG4gICAgZm9yIChjb25zdCBjdXN0b21DbGFzcyBvZiBjbGFzc0RlZnMpIHtcbiAgICAgIGNvbnN0IGNzc0NsYXNzID0gdGhpcy5jbGFzc2VzLmdldChjdXN0b21DbGFzcyk7XG4gICAgICBpZiAoY3NzQ2xhc3M/LnN0eWxlcykge1xuICAgICAgICBjb21waWxlZFN0eWxlcyA9IFsuLi5jb21waWxlZFN0eWxlcywgLi4uY3NzQ2xhc3Muc3R5bGVzID8/IFtdXS5tYXAoKHMpID0+IHMudHJpbSgpKTtcbiAgICAgIH1cbiAgICAgIGlmIChjc3NDbGFzcz8udGV4dFN0eWxlcykge1xuICAgICAgICBjb21waWxlZFN0eWxlcyA9IFsuLi5jb21waWxlZFN0eWxlcywgLi4uY3NzQ2xhc3MudGV4dFN0eWxlcyA/PyBbXV0ubWFwKChzKSA9PiBzLnRyaW0oKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb21waWxlZFN0eWxlcztcbiAgfVxuICBnZXREYXRhKCkge1xuICAgIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICAgIGNvbnN0IG5vZGVzID0gW107XG4gICAgY29uc3QgZWRnZXMgPSBbXTtcbiAgICBjb25zdCBzdWJHcmFwaHMgPSB0aGlzLmdldFN1YkdyYXBocygpO1xuICAgIGNvbnN0IHBhcmVudERCID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICBjb25zdCBzdWJHcmFwaERCID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICBmb3IgKGxldCBpID0gc3ViR3JhcGhzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBjb25zdCBzdWJHcmFwaCA9IHN1YkdyYXBoc1tpXTtcbiAgICAgIGlmIChzdWJHcmFwaC5ub2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHN1YkdyYXBoREIuc2V0KHN1YkdyYXBoLmlkLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgaWQgb2Ygc3ViR3JhcGgubm9kZXMpIHtcbiAgICAgICAgcGFyZW50REIuc2V0KGlkLCBzdWJHcmFwaC5pZCk7XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSBzdWJHcmFwaHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGNvbnN0IHN1YkdyYXBoID0gc3ViR3JhcGhzW2ldO1xuICAgICAgbm9kZXMucHVzaCh7XG4gICAgICAgIGlkOiBzdWJHcmFwaC5pZCxcbiAgICAgICAgbGFiZWw6IHN1YkdyYXBoLnRpdGxlLFxuICAgICAgICBsYWJlbFN0eWxlOiBcIlwiLFxuICAgICAgICBsYWJlbFR5cGU6IHN1YkdyYXBoLmxhYmVsVHlwZSxcbiAgICAgICAgcGFyZW50SWQ6IHBhcmVudERCLmdldChzdWJHcmFwaC5pZCksXG4gICAgICAgIHBhZGRpbmc6IDgsXG4gICAgICAgIGNzc0NvbXBpbGVkU3R5bGVzOiB0aGlzLmdldENvbXBpbGVkU3R5bGVzKHN1YkdyYXBoLmNsYXNzZXMpLFxuICAgICAgICBjc3NDbGFzc2VzOiBzdWJHcmFwaC5jbGFzc2VzLmpvaW4oXCIgXCIpLFxuICAgICAgICBzaGFwZTogXCJyZWN0XCIsXG4gICAgICAgIGRpcjogc3ViR3JhcGguZGlyLFxuICAgICAgICBpc0dyb3VwOiB0cnVlLFxuICAgICAgICBsb29rOiBjb25maWcubG9va1xuICAgICAgfSk7XG4gICAgfVxuICAgIGNvbnN0IG4gPSB0aGlzLmdldFZlcnRpY2VzKCk7XG4gICAgbi5mb3JFYWNoKCh2ZXJ0ZXgpID0+IHtcbiAgICAgIHRoaXMuYWRkTm9kZUZyb21WZXJ0ZXgodmVydGV4LCBub2RlcywgcGFyZW50REIsIHN1YkdyYXBoREIsIGNvbmZpZywgY29uZmlnLmxvb2sgfHwgXCJjbGFzc2ljXCIpO1xuICAgIH0pO1xuICAgIGNvbnN0IGUgPSB0aGlzLmdldEVkZ2VzKCk7XG4gICAgZS5mb3JFYWNoKChyYXdFZGdlLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgeyBhcnJvd1R5cGVTdGFydCwgYXJyb3dUeXBlRW5kIH0gPSB0aGlzLmRlc3RydWN0RWRnZVR5cGUocmF3RWRnZS50eXBlKTtcbiAgICAgIGNvbnN0IHN0eWxlcyA9IFsuLi5lLmRlZmF1bHRTdHlsZSA/PyBbXV07XG4gICAgICBpZiAocmF3RWRnZS5zdHlsZSkge1xuICAgICAgICBzdHlsZXMucHVzaCguLi5yYXdFZGdlLnN0eWxlKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVkZ2UgPSB7XG4gICAgICAgIGlkOiBnZXRFZGdlSWQocmF3RWRnZS5zdGFydCwgcmF3RWRnZS5lbmQsIHsgY291bnRlcjogaW5kZXgsIHByZWZpeDogXCJMXCIgfSwgcmF3RWRnZS5pZCksXG4gICAgICAgIGlzVXNlckRlZmluZWRJZDogcmF3RWRnZS5pc1VzZXJEZWZpbmVkSWQsXG4gICAgICAgIHN0YXJ0OiByYXdFZGdlLnN0YXJ0LFxuICAgICAgICBlbmQ6IHJhd0VkZ2UuZW5kLFxuICAgICAgICB0eXBlOiByYXdFZGdlLnR5cGUgPz8gXCJub3JtYWxcIixcbiAgICAgICAgbGFiZWw6IHJhd0VkZ2UudGV4dCxcbiAgICAgICAgbGFiZWxUeXBlOiByYXdFZGdlLmxhYmVsVHlwZSxcbiAgICAgICAgbGFiZWxwb3M6IFwiY1wiLFxuICAgICAgICB0aGlja25lc3M6IHJhd0VkZ2Uuc3Ryb2tlLFxuICAgICAgICBtaW5sZW46IHJhd0VkZ2UubGVuZ3RoLFxuICAgICAgICBjbGFzc2VzOiByYXdFZGdlPy5zdHJva2UgPT09IFwiaW52aXNpYmxlXCIgPyBcIlwiIDogXCJlZGdlLXRoaWNrbmVzcy1ub3JtYWwgZWRnZS1wYXR0ZXJuLXNvbGlkIGZsb3djaGFydC1saW5rXCIsXG4gICAgICAgIGFycm93VHlwZVN0YXJ0OiByYXdFZGdlPy5zdHJva2UgPT09IFwiaW52aXNpYmxlXCIgfHwgcmF3RWRnZT8udHlwZSA9PT0gXCJhcnJvd19vcGVuXCIgPyBcIm5vbmVcIiA6IGFycm93VHlwZVN0YXJ0LFxuICAgICAgICBhcnJvd1R5cGVFbmQ6IHJhd0VkZ2U/LnN0cm9rZSA9PT0gXCJpbnZpc2libGVcIiB8fCByYXdFZGdlPy50eXBlID09PSBcImFycm93X29wZW5cIiA/IFwibm9uZVwiIDogYXJyb3dUeXBlRW5kLFxuICAgICAgICBhcnJvd2hlYWRTdHlsZTogXCJmaWxsOiAjMzMzXCIsXG4gICAgICAgIGNzc0NvbXBpbGVkU3R5bGVzOiB0aGlzLmdldENvbXBpbGVkU3R5bGVzKHJhd0VkZ2UuY2xhc3NlcyksXG4gICAgICAgIGxhYmVsU3R5bGU6IHN0eWxlcyxcbiAgICAgICAgc3R5bGU6IHN0eWxlcyxcbiAgICAgICAgcGF0dGVybjogcmF3RWRnZS5zdHJva2UsXG4gICAgICAgIGxvb2s6IGNvbmZpZy5sb29rLFxuICAgICAgICBhbmltYXRlOiByYXdFZGdlLmFuaW1hdGUsXG4gICAgICAgIGFuaW1hdGlvbjogcmF3RWRnZS5hbmltYXRpb24sXG4gICAgICAgIGN1cnZlOiByYXdFZGdlLmludGVycG9sYXRlIHx8IHRoaXMuZWRnZXMuZGVmYXVsdEludGVycG9sYXRlIHx8IGNvbmZpZy5mbG93Y2hhcnQ/LmN1cnZlXG4gICAgICB9O1xuICAgICAgZWRnZXMucHVzaChlZGdlKTtcbiAgICB9KTtcbiAgICByZXR1cm4geyBub2RlcywgZWRnZXMsIG90aGVyOiB7fSwgY29uZmlnIH07XG4gIH1cbiAgZGVmYXVsdENvbmZpZygpIHtcbiAgICByZXR1cm4gZGVmYXVsdENvbmZpZy5mbG93Y2hhcnQ7XG4gIH1cbn07XG5cbi8vIHNyYy9kaWFncmFtcy9mbG93Y2hhcnQvZmxvd1JlbmRlcmVyLXYzLXVuaWZpZWQudHNcbnZhciBnZXRDbGFzc2VzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbih0ZXh0LCBkaWFncmFtT2JqKSB7XG4gIHJldHVybiBkaWFncmFtT2JqLmRiLmdldENsYXNzZXMoKTtcbn0sIFwiZ2V0Q2xhc3Nlc1wiKTtcbnZhciBkcmF3ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyBmdW5jdGlvbih0ZXh0LCBpZCwgX3ZlcnNpb24sIGRpYWcpIHtcbiAgbG9nLmluZm8oXCJSRUYwOlwiKTtcbiAgbG9nLmluZm8oXCJEcmF3aW5nIHN0YXRlIGRpYWdyYW0gKHYyKVwiLCBpZCk7XG4gIGNvbnN0IHsgc2VjdXJpdHlMZXZlbCwgZmxvd2NoYXJ0OiBjb25mLCBsYXlvdXQgfSA9IGdldENvbmZpZygpO1xuICBkaWFnLmRiLnNldERpYWdyYW1JZChpZCk7XG4gIGxvZy5kZWJ1ZyhcIkJlZm9yZSBnZXREYXRhOiBcIik7XG4gIGNvbnN0IGRhdGE0TGF5b3V0ID0gZGlhZy5kYi5nZXREYXRhKCk7XG4gIGxvZy5kZWJ1ZyhcIkRhdGE6IFwiLCBkYXRhNExheW91dCk7XG4gIGNvbnN0IHN2ZyA9IGdldERpYWdyYW1FbGVtZW50KGlkLCBzZWN1cml0eUxldmVsKTtcbiAgY29uc3QgZGlyZWN0aW9uID0gZGlhZy5kYi5nZXREaXJlY3Rpb24oKTtcbiAgZGF0YTRMYXlvdXQudHlwZSA9IGRpYWcudHlwZTtcbiAgZGF0YTRMYXlvdXQubGF5b3V0QWxnb3JpdGhtID0gZ2V0UmVnaXN0ZXJlZExheW91dEFsZ29yaXRobShsYXlvdXQpO1xuICBpZiAoZGF0YTRMYXlvdXQubGF5b3V0QWxnb3JpdGhtID09PSBcImRhZ3JlXCIgJiYgbGF5b3V0ID09PSBcImVsa1wiKSB7XG4gICAgbG9nLndhcm4oXG4gICAgICBcImZsb3djaGFydC1lbGsgd2FzIG1vdmVkIHRvIGFuIGV4dGVybmFsIHBhY2thZ2UgaW4gTWVybWFpZCB2MTEuIFBsZWFzZSByZWZlciBbcmVsZWFzZSBub3Rlc10oaHR0cHM6Ly9naXRodWIuY29tL21lcm1haWQtanMvbWVybWFpZC9yZWxlYXNlcy90YWcvdjExLjAuMCkgZm9yIG1vcmUgZGV0YWlscy4gVGhpcyBkaWFncmFtIHdpbGwgYmUgcmVuZGVyZWQgdXNpbmcgYGRhZ3JlYCBsYXlvdXQgYXMgYSBmYWxsYmFjay5cIlxuICAgICk7XG4gIH1cbiAgZGF0YTRMYXlvdXQuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICBkYXRhNExheW91dC5ub2RlU3BhY2luZyA9IGNvbmY/Lm5vZGVTcGFjaW5nIHx8IDUwO1xuICBkYXRhNExheW91dC5yYW5rU3BhY2luZyA9IGNvbmY/LnJhbmtTcGFjaW5nIHx8IDUwO1xuICBkYXRhNExheW91dC5tYXJrZXJzID0gW1wicG9pbnRcIiwgXCJjaXJjbGVcIiwgXCJjcm9zc1wiXTtcbiAgZGF0YTRMYXlvdXQuZGlhZ3JhbUlkID0gaWQ7XG4gIGxvZy5kZWJ1ZyhcIlJFRjE6XCIsIGRhdGE0TGF5b3V0KTtcbiAgYXdhaXQgcmVuZGVyKGRhdGE0TGF5b3V0LCBzdmcpO1xuICBjb25zdCBwYWRkaW5nID0gZGF0YTRMYXlvdXQuY29uZmlnLmZsb3djaGFydD8uZGlhZ3JhbVBhZGRpbmcgPz8gODtcbiAgdXRpbHNfZGVmYXVsdC5pbnNlcnRUaXRsZShcbiAgICBzdmcsXG4gICAgXCJmbG93Y2hhcnRUaXRsZVRleHRcIixcbiAgICBjb25mPy50aXRsZVRvcE1hcmdpbiB8fCAwLFxuICAgIGRpYWcuZGIuZ2V0RGlhZ3JhbVRpdGxlKClcbiAgKTtcbiAgc2V0dXBWaWV3UG9ydEZvclNWRyhzdmcsIHBhZGRpbmcsIFwiZmxvd2NoYXJ0XCIsIGNvbmY/LnVzZU1heFdpZHRoIHx8IGZhbHNlKTtcbn0sIFwiZHJhd1wiKTtcbnZhciBmbG93UmVuZGVyZXJfdjNfdW5pZmllZF9kZWZhdWx0ID0ge1xuICBnZXRDbGFzc2VzLFxuICBkcmF3XG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMvZmxvd2NoYXJ0L3BhcnNlci9mbG93Lmppc29uXG52YXIgcGFyc2VyID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgbyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oaywgdiwgbzIsIGwpIHtcbiAgICBmb3IgKG8yID0gbzIgfHwge30sIGwgPSBrLmxlbmd0aDsgbC0tOyBvMltrW2xdXSA9IHYpIDtcbiAgICByZXR1cm4gbzI7XG4gIH0sIFwib1wiKSwgJFYwID0gWzEsIDRdLCAkVjEgPSBbMSwgM10sICRWMiA9IFsxLCA1XSwgJFYzID0gWzEsIDgsIDksIDEwLCAxMSwgMjcsIDM0LCAzNiwgMzgsIDQ0LCA2MCwgODQsIDg1LCA4NiwgODcsIDg4LCA4OSwgMTAyLCAxMDUsIDEwNiwgMTA5LCAxMTEsIDExNCwgMTE1LCAxMTYsIDEyMSwgMTIyLCAxMjMsIDEyNCwgMTI1XSwgJFY0ID0gWzIsIDJdLCAkVjUgPSBbMSwgMTNdLCAkVjYgPSBbMSwgMTRdLCAkVjcgPSBbMSwgMTVdLCAkVjggPSBbMSwgMTZdLCAkVjkgPSBbMSwgMjNdLCAkVmEgPSBbMSwgMjVdLCAkVmIgPSBbMSwgMjZdLCAkVmMgPSBbMSwgMjddLCAkVmQgPSBbMSwgNTBdLCAkVmUgPSBbMSwgNDldLCAkVmYgPSBbMSwgMjldLCAkVmcgPSBbMSwgMzBdLCAkVmggPSBbMSwgMzFdLCAkVmkgPSBbMSwgMzJdLCAkVmogPSBbMSwgMzNdLCAkVmsgPSBbMSwgNDVdLCAkVmwgPSBbMSwgNDddLCAkVm0gPSBbMSwgNDNdLCAkVm4gPSBbMSwgNDhdLCAkVm8gPSBbMSwgNDRdLCAkVnAgPSBbMSwgNTFdLCAkVnEgPSBbMSwgNDZdLCAkVnIgPSBbMSwgNTJdLCAkVnMgPSBbMSwgNTNdLCAkVnQgPSBbMSwgMzRdLCAkVnUgPSBbMSwgMzVdLCAkVnYgPSBbMSwgMzZdLCAkVncgPSBbMSwgMzddLCAkVnggPSBbMSwgMzhdLCAkVnkgPSBbMSwgNThdLCAkVnogPSBbMSwgOCwgOSwgMTAsIDExLCAyNywgMzIsIDM0LCAzNiwgMzgsIDQ0LCA2MCwgODQsIDg1LCA4NiwgODcsIDg4LCA4OSwgMTAyLCAxMDUsIDEwNiwgMTA5LCAxMTEsIDExNCwgMTE1LCAxMTYsIDEyMSwgMTIyLCAxMjMsIDEyNCwgMTI1XSwgJFZBID0gWzEsIDYyXSwgJFZCID0gWzEsIDYxXSwgJFZDID0gWzEsIDYzXSwgJFZEID0gWzgsIDksIDExLCA3NSwgNzcsIDc4XSwgJFZFID0gWzEsIDc5XSwgJFZGID0gWzEsIDkyXSwgJFZHID0gWzEsIDk3XSwgJFZIID0gWzEsIDk2XSwgJFZJID0gWzEsIDkzXSwgJFZKID0gWzEsIDg5XSwgJFZLID0gWzEsIDk1XSwgJFZMID0gWzEsIDkxXSwgJFZNID0gWzEsIDk4XSwgJFZOID0gWzEsIDk0XSwgJFZPID0gWzEsIDk5XSwgJFZQID0gWzEsIDkwXSwgJFZRID0gWzgsIDksIDEwLCAxMSwgNDAsIDc1LCA3NywgNzhdLCAkVlIgPSBbOCwgOSwgMTAsIDExLCA0MCwgNDYsIDc1LCA3NywgNzhdLCAkVlMgPSBbOCwgOSwgMTAsIDExLCAyOSwgNDAsIDQ0LCA0NiwgNDgsIDUwLCA1MiwgNTQsIDU2LCA1OCwgNjAsIDYzLCA2NSwgNjcsIDY4LCA3MCwgNzUsIDc3LCA3OCwgODksIDEwMiwgMTA1LCAxMDYsIDEwOSwgMTExLCAxMTQsIDExNSwgMTE2XSwgJFZUID0gWzgsIDksIDExLCA0NCwgNjAsIDc1LCA3NywgNzgsIDg5LCAxMDIsIDEwNSwgMTA2LCAxMDksIDExMSwgMTE0LCAxMTUsIDExNl0sICRWVSA9IFs0NCwgNjAsIDg5LCAxMDIsIDEwNSwgMTA2LCAxMDksIDExMSwgMTE0LCAxMTUsIDExNl0sICRWViA9IFsxLCAxMjJdLCAkVlcgPSBbMSwgMTIzXSwgJFZYID0gWzEsIDEyNV0sICRWWSA9IFsxLCAxMjRdLCAkVlogPSBbNDQsIDYwLCA2MiwgNzQsIDg5LCAxMDIsIDEwNSwgMTA2LCAxMDksIDExMSwgMTE0LCAxMTUsIDExNl0sICRWXyA9IFsxLCAxMzRdLCAkViQgPSBbMSwgMTQ4XSwgJFYwMSA9IFsxLCAxNDldLCAkVjExID0gWzEsIDE1MF0sICRWMjEgPSBbMSwgMTUxXSwgJFYzMSA9IFsxLCAxMzZdLCAkVjQxID0gWzEsIDEzOF0sICRWNTEgPSBbMSwgMTQyXSwgJFY2MSA9IFsxLCAxNDNdLCAkVjcxID0gWzEsIDE0NF0sICRWODEgPSBbMSwgMTQ1XSwgJFY5MSA9IFsxLCAxNDZdLCAkVmExID0gWzEsIDE0N10sICRWYjEgPSBbMSwgMTUyXSwgJFZjMSA9IFsxLCAxNTNdLCAkVmQxID0gWzEsIDEzMl0sICRWZTEgPSBbMSwgMTMzXSwgJFZmMSA9IFsxLCAxNDBdLCAkVmcxID0gWzEsIDEzNV0sICRWaDEgPSBbMSwgMTM5XSwgJFZpMSA9IFsxLCAxMzddLCAkVmoxID0gWzgsIDksIDEwLCAxMSwgMjcsIDMyLCAzNCwgMzYsIDM4LCA0NCwgNjAsIDg0LCA4NSwgODYsIDg3LCA4OCwgODksIDEwMiwgMTA1LCAxMDYsIDEwOSwgMTExLCAxMTQsIDExNSwgMTE2LCAxMjEsIDEyMiwgMTIzLCAxMjQsIDEyNV0sICRWazEgPSBbMSwgMTU1XSwgJFZsMSA9IFsxLCAxNTddLCAkVm0xID0gWzgsIDksIDExXSwgJFZuMSA9IFs4LCA5LCAxMCwgMTEsIDE0LCA0NCwgNjAsIDg5LCAxMDUsIDEwNiwgMTA5LCAxMTEsIDExNCwgMTE1LCAxMTZdLCAkVm8xID0gWzEsIDE3N10sICRWcDEgPSBbMSwgMTczXSwgJFZxMSA9IFsxLCAxNzRdLCAkVnIxID0gWzEsIDE3OF0sICRWczEgPSBbMSwgMTc1XSwgJFZ0MSA9IFsxLCAxNzZdLCAkVnUxID0gWzc3LCAxMTYsIDExOV0sICRWdjEgPSBbOCwgOSwgMTAsIDExLCAxMiwgMTQsIDI3LCAyOSwgMzIsIDQ0LCA2MCwgNzUsIDg0LCA4NSwgODYsIDg3LCA4OCwgODksIDkwLCAxMDUsIDEwOSwgMTExLCAxMTQsIDExNSwgMTE2XSwgJFZ3MSA9IFsxMCwgMTA2XSwgJFZ4MSA9IFszMSwgNDksIDUxLCA1MywgNTUsIDU3LCA2MiwgNjQsIDY2LCA2NywgNjksIDcxLCAxMTYsIDExNywgMTE4XSwgJFZ5MSA9IFsxLCAyNDhdLCAkVnoxID0gWzEsIDI0Nl0sICRWQTEgPSBbMSwgMjUwXSwgJFZCMSA9IFsxLCAyNDRdLCAkVkMxID0gWzEsIDI0NV0sICRWRDEgPSBbMSwgMjQ3XSwgJFZFMSA9IFsxLCAyNDldLCAkVkYxID0gWzEsIDI1MV0sICRWRzEgPSBbMSwgMjY5XSwgJFZIMSA9IFs4LCA5LCAxMSwgMTA2XSwgJFZJMSA9IFs4LCA5LCAxMCwgMTEsIDYwLCA4NCwgMTA1LCAxMDYsIDEwOSwgMTEwLCAxMTEsIDExMl07XG4gIHZhciBwYXJzZXIyID0ge1xuICAgIHRyYWNlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHRyYWNlKCkge1xuICAgIH0sIFwidHJhY2VcIiksXG4gICAgeXk6IHt9LFxuICAgIHN5bWJvbHNfOiB7IFwiZXJyb3JcIjogMiwgXCJzdGFydFwiOiAzLCBcImdyYXBoQ29uZmlnXCI6IDQsIFwiZG9jdW1lbnRcIjogNSwgXCJsaW5lXCI6IDYsIFwic3RhdGVtZW50XCI6IDcsIFwiU0VNSVwiOiA4LCBcIk5FV0xJTkVcIjogOSwgXCJTUEFDRVwiOiAxMCwgXCJFT0ZcIjogMTEsIFwiR1JBUEhcIjogMTIsIFwiTk9ESVJcIjogMTMsIFwiRElSXCI6IDE0LCBcIkZpcnN0U3RtdFNlcGFyYXRvclwiOiAxNSwgXCJlbmRpbmdcIjogMTYsIFwiZW5kVG9rZW5cIjogMTcsIFwic3BhY2VMaXN0XCI6IDE4LCBcInNwYWNlTGlzdE5ld2xpbmVcIjogMTksIFwidmVydGV4U3RhdGVtZW50XCI6IDIwLCBcInNlcGFyYXRvclwiOiAyMSwgXCJzdHlsZVN0YXRlbWVudFwiOiAyMiwgXCJsaW5rU3R5bGVTdGF0ZW1lbnRcIjogMjMsIFwiY2xhc3NEZWZTdGF0ZW1lbnRcIjogMjQsIFwiY2xhc3NTdGF0ZW1lbnRcIjogMjUsIFwiY2xpY2tTdGF0ZW1lbnRcIjogMjYsIFwic3ViZ3JhcGhcIjogMjcsIFwidGV4dE5vVGFnc1wiOiAyOCwgXCJTUVNcIjogMjksIFwidGV4dFwiOiAzMCwgXCJTUUVcIjogMzEsIFwiZW5kXCI6IDMyLCBcImRpcmVjdGlvblwiOiAzMywgXCJhY2NfdGl0bGVcIjogMzQsIFwiYWNjX3RpdGxlX3ZhbHVlXCI6IDM1LCBcImFjY19kZXNjclwiOiAzNiwgXCJhY2NfZGVzY3JfdmFsdWVcIjogMzcsIFwiYWNjX2Rlc2NyX211bHRpbGluZV92YWx1ZVwiOiAzOCwgXCJzaGFwZURhdGFcIjogMzksIFwiU0hBUEVfREFUQVwiOiA0MCwgXCJsaW5rXCI6IDQxLCBcIm5vZGVcIjogNDIsIFwic3R5bGVkVmVydGV4XCI6IDQzLCBcIkFNUFwiOiA0NCwgXCJ2ZXJ0ZXhcIjogNDUsIFwiU1RZTEVfU0VQQVJBVE9SXCI6IDQ2LCBcImlkU3RyaW5nXCI6IDQ3LCBcIkRPVUJMRUNJUkNMRVNUQVJUXCI6IDQ4LCBcIkRPVUJMRUNJUkNMRUVORFwiOiA0OSwgXCJQU1wiOiA1MCwgXCJQRVwiOiA1MSwgXCIoLVwiOiA1MiwgXCItKVwiOiA1MywgXCJTVEFESVVNU1RBUlRcIjogNTQsIFwiU1RBRElVTUVORFwiOiA1NSwgXCJTVUJST1VUSU5FU1RBUlRcIjogNTYsIFwiU1VCUk9VVElORUVORFwiOiA1NywgXCJWRVJURVhfV0lUSF9QUk9QU19TVEFSVFwiOiA1OCwgXCJOT0RFX1NUUklOR1tmaWVsZF1cIjogNTksIFwiQ09MT05cIjogNjAsIFwiTk9ERV9TVFJJTkdbdmFsdWVdXCI6IDYxLCBcIlBJUEVcIjogNjIsIFwiQ1lMSU5ERVJTVEFSVFwiOiA2MywgXCJDWUxJTkRFUkVORFwiOiA2NCwgXCJESUFNT05EX1NUQVJUXCI6IDY1LCBcIkRJQU1PTkRfU1RPUFwiOiA2NiwgXCJUQUdFTkRcIjogNjcsIFwiVFJBUFNUQVJUXCI6IDY4LCBcIlRSQVBFTkRcIjogNjksIFwiSU5WVFJBUFNUQVJUXCI6IDcwLCBcIklOVlRSQVBFTkRcIjogNzEsIFwibGlua1N0YXRlbWVudFwiOiA3MiwgXCJhcnJvd1RleHRcIjogNzMsIFwiVEVTVFNUUlwiOiA3NCwgXCJTVEFSVF9MSU5LXCI6IDc1LCBcImVkZ2VUZXh0XCI6IDc2LCBcIkxJTktcIjogNzcsIFwiTElOS19JRFwiOiA3OCwgXCJlZGdlVGV4dFRva2VuXCI6IDc5LCBcIlNUUlwiOiA4MCwgXCJNRF9TVFJcIjogODEsIFwidGV4dFRva2VuXCI6IDgyLCBcImtleXdvcmRzXCI6IDgzLCBcIlNUWUxFXCI6IDg0LCBcIkxJTktTVFlMRVwiOiA4NSwgXCJDTEFTU0RFRlwiOiA4NiwgXCJDTEFTU1wiOiA4NywgXCJDTElDS1wiOiA4OCwgXCJET1dOXCI6IDg5LCBcIlVQXCI6IDkwLCBcInRleHROb1RhZ3NUb2tlblwiOiA5MSwgXCJzdHlsZXNPcHRcIjogOTIsIFwiaWRTdHJpbmdbdmVydGV4XVwiOiA5MywgXCJpZFN0cmluZ1tjbGFzc11cIjogOTQsIFwiQ0FMTEJBQ0tOQU1FXCI6IDk1LCBcIkNBTExCQUNLQVJHU1wiOiA5NiwgXCJIUkVGXCI6IDk3LCBcIkxJTktfVEFSR0VUXCI6IDk4LCBcIlNUUltsaW5rXVwiOiA5OSwgXCJTVFJbdG9vbHRpcF1cIjogMTAwLCBcImFscGhhTnVtXCI6IDEwMSwgXCJERUZBVUxUXCI6IDEwMiwgXCJudW1MaXN0XCI6IDEwMywgXCJJTlRFUlBPTEFURVwiOiAxMDQsIFwiTlVNXCI6IDEwNSwgXCJDT01NQVwiOiAxMDYsIFwic3R5bGVcIjogMTA3LCBcInN0eWxlQ29tcG9uZW50XCI6IDEwOCwgXCJOT0RFX1NUUklOR1wiOiAxMDksIFwiVU5JVFwiOiAxMTAsIFwiQlJLVFwiOiAxMTEsIFwiUENUXCI6IDExMiwgXCJpZFN0cmluZ1Rva2VuXCI6IDExMywgXCJNSU5VU1wiOiAxMTQsIFwiTVVMVFwiOiAxMTUsIFwiVU5JQ09ERV9URVhUXCI6IDExNiwgXCJURVhUXCI6IDExNywgXCJUQUdTVEFSVFwiOiAxMTgsIFwiRURHRV9URVhUXCI6IDExOSwgXCJhbHBoYU51bVRva2VuXCI6IDEyMCwgXCJkaXJlY3Rpb25fdGJcIjogMTIxLCBcImRpcmVjdGlvbl9idFwiOiAxMjIsIFwiZGlyZWN0aW9uX3JsXCI6IDEyMywgXCJkaXJlY3Rpb25fbHJcIjogMTI0LCBcImRpcmVjdGlvbl90ZFwiOiAxMjUsIFwiJGFjY2VwdFwiOiAwLCBcIiRlbmRcIjogMSB9LFxuICAgIHRlcm1pbmFsc186IHsgMjogXCJlcnJvclwiLCA4OiBcIlNFTUlcIiwgOTogXCJORVdMSU5FXCIsIDEwOiBcIlNQQUNFXCIsIDExOiBcIkVPRlwiLCAxMjogXCJHUkFQSFwiLCAxMzogXCJOT0RJUlwiLCAxNDogXCJESVJcIiwgMjc6IFwic3ViZ3JhcGhcIiwgMjk6IFwiU1FTXCIsIDMxOiBcIlNRRVwiLCAzMjogXCJlbmRcIiwgMzQ6IFwiYWNjX3RpdGxlXCIsIDM1OiBcImFjY190aXRsZV92YWx1ZVwiLCAzNjogXCJhY2NfZGVzY3JcIiwgMzc6IFwiYWNjX2Rlc2NyX3ZhbHVlXCIsIDM4OiBcImFjY19kZXNjcl9tdWx0aWxpbmVfdmFsdWVcIiwgNDA6IFwiU0hBUEVfREFUQVwiLCA0NDogXCJBTVBcIiwgNDY6IFwiU1RZTEVfU0VQQVJBVE9SXCIsIDQ4OiBcIkRPVUJMRUNJUkNMRVNUQVJUXCIsIDQ5OiBcIkRPVUJMRUNJUkNMRUVORFwiLCA1MDogXCJQU1wiLCA1MTogXCJQRVwiLCA1MjogXCIoLVwiLCA1MzogXCItKVwiLCA1NDogXCJTVEFESVVNU1RBUlRcIiwgNTU6IFwiU1RBRElVTUVORFwiLCA1NjogXCJTVUJST1VUSU5FU1RBUlRcIiwgNTc6IFwiU1VCUk9VVElORUVORFwiLCA1ODogXCJWRVJURVhfV0lUSF9QUk9QU19TVEFSVFwiLCA1OTogXCJOT0RFX1NUUklOR1tmaWVsZF1cIiwgNjA6IFwiQ09MT05cIiwgNjE6IFwiTk9ERV9TVFJJTkdbdmFsdWVdXCIsIDYyOiBcIlBJUEVcIiwgNjM6IFwiQ1lMSU5ERVJTVEFSVFwiLCA2NDogXCJDWUxJTkRFUkVORFwiLCA2NTogXCJESUFNT05EX1NUQVJUXCIsIDY2OiBcIkRJQU1PTkRfU1RPUFwiLCA2NzogXCJUQUdFTkRcIiwgNjg6IFwiVFJBUFNUQVJUXCIsIDY5OiBcIlRSQVBFTkRcIiwgNzA6IFwiSU5WVFJBUFNUQVJUXCIsIDcxOiBcIklOVlRSQVBFTkRcIiwgNzQ6IFwiVEVTVFNUUlwiLCA3NTogXCJTVEFSVF9MSU5LXCIsIDc3OiBcIkxJTktcIiwgNzg6IFwiTElOS19JRFwiLCA4MDogXCJTVFJcIiwgODE6IFwiTURfU1RSXCIsIDg0OiBcIlNUWUxFXCIsIDg1OiBcIkxJTktTVFlMRVwiLCA4NjogXCJDTEFTU0RFRlwiLCA4NzogXCJDTEFTU1wiLCA4ODogXCJDTElDS1wiLCA4OTogXCJET1dOXCIsIDkwOiBcIlVQXCIsIDkzOiBcImlkU3RyaW5nW3ZlcnRleF1cIiwgOTQ6IFwiaWRTdHJpbmdbY2xhc3NdXCIsIDk1OiBcIkNBTExCQUNLTkFNRVwiLCA5NjogXCJDQUxMQkFDS0FSR1NcIiwgOTc6IFwiSFJFRlwiLCA5ODogXCJMSU5LX1RBUkdFVFwiLCA5OTogXCJTVFJbbGlua11cIiwgMTAwOiBcIlNUUlt0b29sdGlwXVwiLCAxMDI6IFwiREVGQVVMVFwiLCAxMDQ6IFwiSU5URVJQT0xBVEVcIiwgMTA1OiBcIk5VTVwiLCAxMDY6IFwiQ09NTUFcIiwgMTA5OiBcIk5PREVfU1RSSU5HXCIsIDExMDogXCJVTklUXCIsIDExMTogXCJCUktUXCIsIDExMjogXCJQQ1RcIiwgMTE0OiBcIk1JTlVTXCIsIDExNTogXCJNVUxUXCIsIDExNjogXCJVTklDT0RFX1RFWFRcIiwgMTE3OiBcIlRFWFRcIiwgMTE4OiBcIlRBR1NUQVJUXCIsIDExOTogXCJFREdFX1RFWFRcIiwgMTIxOiBcImRpcmVjdGlvbl90YlwiLCAxMjI6IFwiZGlyZWN0aW9uX2J0XCIsIDEyMzogXCJkaXJlY3Rpb25fcmxcIiwgMTI0OiBcImRpcmVjdGlvbl9sclwiLCAxMjU6IFwiZGlyZWN0aW9uX3RkXCIgfSxcbiAgICBwcm9kdWN0aW9uc186IFswLCBbMywgMl0sIFs1LCAwXSwgWzUsIDJdLCBbNiwgMV0sIFs2LCAxXSwgWzYsIDFdLCBbNiwgMV0sIFs2LCAxXSwgWzQsIDJdLCBbNCwgMl0sIFs0LCAyXSwgWzQsIDNdLCBbMTYsIDJdLCBbMTYsIDFdLCBbMTcsIDFdLCBbMTcsIDFdLCBbMTcsIDFdLCBbMTUsIDFdLCBbMTUsIDFdLCBbMTUsIDJdLCBbMTksIDJdLCBbMTksIDJdLCBbMTksIDFdLCBbMTksIDFdLCBbMTgsIDJdLCBbMTgsIDFdLCBbNywgMl0sIFs3LCAyXSwgWzcsIDJdLCBbNywgMl0sIFs3LCAyXSwgWzcsIDJdLCBbNywgOV0sIFs3LCA2XSwgWzcsIDRdLCBbNywgMV0sIFs3LCAyXSwgWzcsIDJdLCBbNywgMV0sIFsyMSwgMV0sIFsyMSwgMV0sIFsyMSwgMV0sIFszOSwgMl0sIFszOSwgMV0sIFsyMCwgNF0sIFsyMCwgM10sIFsyMCwgNF0sIFsyMCwgMl0sIFsyMCwgMl0sIFsyMCwgMV0sIFs0MiwgMV0sIFs0MiwgNl0sIFs0MiwgNV0sIFs0MywgMV0sIFs0MywgM10sIFs0NSwgNF0sIFs0NSwgNF0sIFs0NSwgNl0sIFs0NSwgNF0sIFs0NSwgNF0sIFs0NSwgNF0sIFs0NSwgOF0sIFs0NSwgNF0sIFs0NSwgNF0sIFs0NSwgNF0sIFs0NSwgNl0sIFs0NSwgNF0sIFs0NSwgNF0sIFs0NSwgNF0sIFs0NSwgNF0sIFs0NSwgNF0sIFs0NSwgMV0sIFs0MSwgMl0sIFs0MSwgM10sIFs0MSwgM10sIFs0MSwgMV0sIFs0MSwgM10sIFs0MSwgNF0sIFs3NiwgMV0sIFs3NiwgMl0sIFs3NiwgMV0sIFs3NiwgMV0sIFs3MiwgMV0sIFs3MiwgMl0sIFs3MywgM10sIFszMCwgMV0sIFszMCwgMl0sIFszMCwgMV0sIFszMCwgMV0sIFs4MywgMV0sIFs4MywgMV0sIFs4MywgMV0sIFs4MywgMV0sIFs4MywgMV0sIFs4MywgMV0sIFs4MywgMV0sIFs4MywgMV0sIFs4MywgMV0sIFs4MywgMV0sIFs4MywgMV0sIFsyOCwgMV0sIFsyOCwgMl0sIFsyOCwgMV0sIFsyOCwgMV0sIFsyNCwgNV0sIFsyNSwgNV0sIFsyNiwgMl0sIFsyNiwgNF0sIFsyNiwgM10sIFsyNiwgNV0sIFsyNiwgM10sIFsyNiwgNV0sIFsyNiwgNV0sIFsyNiwgN10sIFsyNiwgMl0sIFsyNiwgNF0sIFsyNiwgMl0sIFsyNiwgNF0sIFsyNiwgNF0sIFsyNiwgNl0sIFsyMiwgNV0sIFsyMywgNV0sIFsyMywgNV0sIFsyMywgOV0sIFsyMywgOV0sIFsyMywgN10sIFsyMywgN10sIFsxMDMsIDFdLCBbMTAzLCAzXSwgWzkyLCAxXSwgWzkyLCAzXSwgWzEwNywgMV0sIFsxMDcsIDJdLCBbMTA4LCAxXSwgWzEwOCwgMV0sIFsxMDgsIDFdLCBbMTA4LCAxXSwgWzEwOCwgMV0sIFsxMDgsIDFdLCBbMTA4LCAxXSwgWzEwOCwgMV0sIFsxMTMsIDFdLCBbMTEzLCAxXSwgWzExMywgMV0sIFsxMTMsIDFdLCBbMTEzLCAxXSwgWzExMywgMV0sIFsxMTMsIDFdLCBbMTEzLCAxXSwgWzExMywgMV0sIFsxMTMsIDFdLCBbMTEzLCAxXSwgWzgyLCAxXSwgWzgyLCAxXSwgWzgyLCAxXSwgWzgyLCAxXSwgWzkxLCAxXSwgWzkxLCAxXSwgWzkxLCAxXSwgWzkxLCAxXSwgWzkxLCAxXSwgWzkxLCAxXSwgWzkxLCAxXSwgWzkxLCAxXSwgWzkxLCAxXSwgWzkxLCAxXSwgWzkxLCAxXSwgWzc5LCAxXSwgWzc5LCAxXSwgWzEyMCwgMV0sIFsxMjAsIDFdLCBbMTIwLCAxXSwgWzEyMCwgMV0sIFsxMjAsIDFdLCBbMTIwLCAxXSwgWzEyMCwgMV0sIFsxMjAsIDFdLCBbMTIwLCAxXSwgWzEyMCwgMV0sIFsxMjAsIDFdLCBbNDcsIDFdLCBbNDcsIDJdLCBbMTAxLCAxXSwgWzEwMSwgMl0sIFszMywgMV0sIFszMywgMV0sIFszMywgMV0sIFszMywgMV0sIFszMywgMV1dLFxuICAgIHBlcmZvcm1BY3Rpb246IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gYW5vbnltb3VzKHl5dGV4dCwgeXlsZW5nLCB5eWxpbmVubywgeXksIHl5c3RhdGUsICQkLCBfJCkge1xuICAgICAgdmFyICQwID0gJCQubGVuZ3RoIC0gMTtcbiAgICAgIHN3aXRjaCAoeXlzdGF0ZSkge1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgdGhpcy4kID0gW107XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoJCRbJDBdKSB8fCAkJFskMF0ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgJCRbJDAgLSAxXS5wdXNoKCQkWyQwXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgY2FzZSAxODM6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDExOlxuICAgICAgICAgIHl5LnNldERpcmVjdGlvbihcIlRCXCIpO1xuICAgICAgICAgIHRoaXMuJCA9IFwiVEJcIjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICB5eS5zZXREaXJlY3Rpb24oJCRbJDAgLSAxXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAxXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyNzpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDFdLm5vZGVzO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI4OlxuICAgICAgICBjYXNlIDI5OlxuICAgICAgICBjYXNlIDMwOlxuICAgICAgICBjYXNlIDMxOlxuICAgICAgICBjYXNlIDMyOlxuICAgICAgICAgIHRoaXMuJCA9IFtdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMzOlxuICAgICAgICAgIHRoaXMuJCA9IHl5LmFkZFN1YkdyYXBoKCQkWyQwIC0gNl0sICQkWyQwIC0gMV0sICQkWyQwIC0gNF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM0OlxuICAgICAgICAgIHRoaXMuJCA9IHl5LmFkZFN1YkdyYXBoKCQkWyQwIC0gM10sICQkWyQwIC0gMV0sICQkWyQwIC0gM10pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM1OlxuICAgICAgICAgIHRoaXMuJCA9IHl5LmFkZFN1YkdyYXBoKHZvaWQgMCwgJCRbJDAgLSAxXSwgdm9pZCAwKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF0udHJpbSgpO1xuICAgICAgICAgIHl5LnNldEFjY1RpdGxlKHRoaXMuJCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzg6XG4gICAgICAgIGNhc2UgMzk6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdLnRyaW0oKTtcbiAgICAgICAgICB5eS5zZXRBY2NEZXNjcmlwdGlvbih0aGlzLiQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQzOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMV0gKyAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDQ6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ1OlxuICAgICAgICAgIHl5LmFkZFZlcnRleCgkJFskMCAtIDFdWyQkWyQwIC0gMV0ubGVuZ3RoIC0gMV0sIHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsICQkWyQwXSk7XG4gICAgICAgICAgeXkuYWRkTGluaygkJFskMCAtIDNdLnN0bXQsICQkWyQwIC0gMV0sICQkWyQwIC0gMl0pO1xuICAgICAgICAgIHRoaXMuJCA9IHsgc3RtdDogJCRbJDAgLSAxXSwgbm9kZXM6ICQkWyQwIC0gMV0uY29uY2F0KCQkWyQwIC0gM10ubm9kZXMpIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDY6XG4gICAgICAgICAgeXkuYWRkTGluaygkJFskMCAtIDJdLnN0bXQsICQkWyQwXSwgJCRbJDAgLSAxXSk7XG4gICAgICAgICAgdGhpcy4kID0geyBzdG10OiAkJFskMF0sIG5vZGVzOiAkJFskMF0uY29uY2F0KCQkWyQwIC0gMl0ubm9kZXMpIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDc6XG4gICAgICAgICAgeXkuYWRkTGluaygkJFskMCAtIDNdLnN0bXQsICQkWyQwIC0gMV0sICQkWyQwIC0gMl0pO1xuICAgICAgICAgIHRoaXMuJCA9IHsgc3RtdDogJCRbJDAgLSAxXSwgbm9kZXM6ICQkWyQwIC0gMV0uY29uY2F0KCQkWyQwIC0gM10ubm9kZXMpIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDg6XG4gICAgICAgICAgdGhpcy4kID0geyBzdG10OiAkJFskMCAtIDFdLCBub2RlczogJCRbJDAgLSAxXSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ5OlxuICAgICAgICAgIHl5LmFkZFZlcnRleCgkJFskMCAtIDFdWyQkWyQwIC0gMV0ubGVuZ3RoIC0gMV0sIHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsICQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0geyBzdG10OiAkJFskMCAtIDFdLCBub2RlczogJCRbJDAgLSAxXSwgc2hhcGVEYXRhOiAkJFskMF0gfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1MDpcbiAgICAgICAgICB0aGlzLiQgPSB7IHN0bXQ6ICQkWyQwXSwgbm9kZXM6ICQkWyQwXSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDUxOlxuICAgICAgICAgIHRoaXMuJCA9IFskJFskMF1dO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDUyOlxuICAgICAgICAgIHl5LmFkZFZlcnRleCgkJFskMCAtIDVdWyQkWyQwIC0gNV0ubGVuZ3RoIC0gMV0sIHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsICQkWyQwIC0gNF0pO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gNV0uY29uY2F0KCQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTM6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSA0XS5jb25jYXQoJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1NDpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTU6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAyXTtcbiAgICAgICAgICB5eS5zZXRDbGFzcygkJFskMCAtIDJdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU2OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gM107XG4gICAgICAgICAgeXkuYWRkVmVydGV4KCQkWyQwIC0gM10sICQkWyQwIC0gMV0sIFwic3F1YXJlXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU3OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gM107XG4gICAgICAgICAgeXkuYWRkVmVydGV4KCQkWyQwIC0gM10sICQkWyQwIC0gMV0sIFwiZG91YmxlY2lyY2xlXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU4OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gNV07XG4gICAgICAgICAgeXkuYWRkVmVydGV4KCQkWyQwIC0gNV0sICQkWyQwIC0gMl0sIFwiY2lyY2xlXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU5OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gM107XG4gICAgICAgICAgeXkuYWRkVmVydGV4KCQkWyQwIC0gM10sICQkWyQwIC0gMV0sIFwiZWxsaXBzZVwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2MDpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDNdO1xuICAgICAgICAgIHl5LmFkZFZlcnRleCgkJFskMCAtIDNdLCAkJFskMCAtIDFdLCBcInN0YWRpdW1cIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjE6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAzXTtcbiAgICAgICAgICB5eS5hZGRWZXJ0ZXgoJCRbJDAgLSAzXSwgJCRbJDAgLSAxXSwgXCJzdWJyb3V0aW5lXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDYyOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gN107XG4gICAgICAgICAgeXkuYWRkVmVydGV4KCQkWyQwIC0gN10sICQkWyQwIC0gMV0sIFwicmVjdFwiLCB2b2lkIDAsIHZvaWQgMCwgdm9pZCAwLCBPYmplY3QuZnJvbUVudHJpZXMoW1skJFskMCAtIDVdLCAkJFskMCAtIDNdXV0pKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2MzpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDNdO1xuICAgICAgICAgIHl5LmFkZFZlcnRleCgkJFskMCAtIDNdLCAkJFskMCAtIDFdLCBcImN5bGluZGVyXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY0OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gM107XG4gICAgICAgICAgeXkuYWRkVmVydGV4KCQkWyQwIC0gM10sICQkWyQwIC0gMV0sIFwicm91bmRcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjU6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAzXTtcbiAgICAgICAgICB5eS5hZGRWZXJ0ZXgoJCRbJDAgLSAzXSwgJCRbJDAgLSAxXSwgXCJkaWFtb25kXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY2OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gNV07XG4gICAgICAgICAgeXkuYWRkVmVydGV4KCQkWyQwIC0gNV0sICQkWyQwIC0gMl0sIFwiaGV4YWdvblwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2NzpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDNdO1xuICAgICAgICAgIHl5LmFkZFZlcnRleCgkJFskMCAtIDNdLCAkJFskMCAtIDFdLCBcIm9kZFwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2ODpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDNdO1xuICAgICAgICAgIHl5LmFkZFZlcnRleCgkJFskMCAtIDNdLCAkJFskMCAtIDFdLCBcInRyYXBlem9pZFwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2OTpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDNdO1xuICAgICAgICAgIHl5LmFkZFZlcnRleCgkJFskMCAtIDNdLCAkJFskMCAtIDFdLCBcImludl90cmFwZXpvaWRcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzA6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAzXTtcbiAgICAgICAgICB5eS5hZGRWZXJ0ZXgoJCRbJDAgLSAzXSwgJCRbJDAgLSAxXSwgXCJsZWFuX3JpZ2h0XCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDcxOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gM107XG4gICAgICAgICAgeXkuYWRkVmVydGV4KCQkWyQwIC0gM10sICQkWyQwIC0gMV0sIFwibGVhbl9sZWZ0XCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDcyOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXTtcbiAgICAgICAgICB5eS5hZGRWZXJ0ZXgoJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA3MzpcbiAgICAgICAgICAkJFskMCAtIDFdLnRleHQgPSAkJFskMF07XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAxXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA3NDpcbiAgICAgICAgY2FzZSA3NTpcbiAgICAgICAgICAkJFskMCAtIDJdLnRleHQgPSAkJFskMCAtIDFdO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMl07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzY6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc3OlxuICAgICAgICAgIHZhciBpbmYgPSB5eS5kZXN0cnVjdExpbmsoJCRbJDBdLCAkJFskMCAtIDJdKTtcbiAgICAgICAgICB0aGlzLiQgPSB7IFwidHlwZVwiOiBpbmYudHlwZSwgXCJzdHJva2VcIjogaW5mLnN0cm9rZSwgXCJsZW5ndGhcIjogaW5mLmxlbmd0aCwgXCJ0ZXh0XCI6ICQkWyQwIC0gMV0gfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA3ODpcbiAgICAgICAgICB2YXIgaW5mID0geXkuZGVzdHJ1Y3RMaW5rKCQkWyQwXSwgJCRbJDAgLSAyXSk7XG4gICAgICAgICAgdGhpcy4kID0geyBcInR5cGVcIjogaW5mLnR5cGUsIFwic3Ryb2tlXCI6IGluZi5zdHJva2UsIFwibGVuZ3RoXCI6IGluZi5sZW5ndGgsIFwidGV4dFwiOiAkJFskMCAtIDFdLCBcImlkXCI6ICQkWyQwIC0gM10gfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA3OTpcbiAgICAgICAgICB0aGlzLiQgPSB7IHRleHQ6ICQkWyQwXSwgdHlwZTogXCJ0ZXh0XCIgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA4MDpcbiAgICAgICAgICB0aGlzLiQgPSB7IHRleHQ6ICQkWyQwIC0gMV0udGV4dCArIFwiXCIgKyAkJFskMF0sIHR5cGU6ICQkWyQwIC0gMV0udHlwZSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDgxOlxuICAgICAgICAgIHRoaXMuJCA9IHsgdGV4dDogJCRbJDBdLCB0eXBlOiBcInN0cmluZ1wiIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgODI6XG4gICAgICAgICAgdGhpcy4kID0geyB0ZXh0OiAkJFskMF0sIHR5cGU6IFwibWFya2Rvd25cIiB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDgzOlxuICAgICAgICAgIHZhciBpbmYgPSB5eS5kZXN0cnVjdExpbmsoJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSB7IFwidHlwZVwiOiBpbmYudHlwZSwgXCJzdHJva2VcIjogaW5mLnN0cm9rZSwgXCJsZW5ndGhcIjogaW5mLmxlbmd0aCB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDg0OlxuICAgICAgICAgIHZhciBpbmYgPSB5eS5kZXN0cnVjdExpbmsoJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSB7IFwidHlwZVwiOiBpbmYudHlwZSwgXCJzdHJva2VcIjogaW5mLnN0cm9rZSwgXCJsZW5ndGhcIjogaW5mLmxlbmd0aCwgXCJpZFwiOiAkJFskMCAtIDFdIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgODU6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAxXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA4NjpcbiAgICAgICAgICB0aGlzLiQgPSB7IHRleHQ6ICQkWyQwXSwgdHlwZTogXCJ0ZXh0XCIgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA4NzpcbiAgICAgICAgICB0aGlzLiQgPSB7IHRleHQ6ICQkWyQwIC0gMV0udGV4dCArIFwiXCIgKyAkJFskMF0sIHR5cGU6ICQkWyQwIC0gMV0udHlwZSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDg4OlxuICAgICAgICAgIHRoaXMuJCA9IHsgdGV4dDogJCRbJDBdLCB0eXBlOiBcInN0cmluZ1wiIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgODk6XG4gICAgICAgIGNhc2UgMTA0OlxuICAgICAgICAgIHRoaXMuJCA9IHsgdGV4dDogJCRbJDBdLCB0eXBlOiBcIm1hcmtkb3duXCIgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMDE6XG4gICAgICAgICAgdGhpcy4kID0geyB0ZXh0OiAkJFskMF0sIHR5cGU6IFwidGV4dFwiIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTAyOlxuICAgICAgICAgIHRoaXMuJCA9IHsgdGV4dDogJCRbJDAgLSAxXS50ZXh0ICsgXCJcIiArICQkWyQwXSwgdHlwZTogJCRbJDAgLSAxXS50eXBlIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTAzOlxuICAgICAgICAgIHRoaXMuJCA9IHsgdGV4dDogJCRbJDBdLCB0eXBlOiBcInRleHRcIiB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEwNTpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDRdO1xuICAgICAgICAgIHl5LmFkZENsYXNzKCQkWyQwIC0gMl0sICQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTA2OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gNF07XG4gICAgICAgICAgeXkuc2V0Q2xhc3MoJCRbJDAgLSAyXSwgJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMDc6XG4gICAgICAgIGNhc2UgMTE1OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMV07XG4gICAgICAgICAgeXkuc2V0Q2xpY2tFdmVudCgkJFskMCAtIDFdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEwODpcbiAgICAgICAgY2FzZSAxMTY6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAzXTtcbiAgICAgICAgICB5eS5zZXRDbGlja0V2ZW50KCQkWyQwIC0gM10sICQkWyQwIC0gMl0pO1xuICAgICAgICAgIHl5LnNldFRvb2x0aXAoJCRbJDAgLSAzXSwgJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMDk6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAyXTtcbiAgICAgICAgICB5eS5zZXRDbGlja0V2ZW50KCQkWyQwIC0gMl0sICQkWyQwIC0gMV0sICQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTEwOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gNF07XG4gICAgICAgICAgeXkuc2V0Q2xpY2tFdmVudCgkJFskMCAtIDRdLCAkJFskMCAtIDNdLCAkJFskMCAtIDJdKTtcbiAgICAgICAgICB5eS5zZXRUb29sdGlwKCQkWyQwIC0gNF0sICQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTExOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMl07XG4gICAgICAgICAgeXkuc2V0TGluaygkJFskMCAtIDJdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDExMjpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDRdO1xuICAgICAgICAgIHl5LnNldExpbmsoJCRbJDAgLSA0XSwgJCRbJDAgLSAyXSk7XG4gICAgICAgICAgeXkuc2V0VG9vbHRpcCgkJFskMCAtIDRdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDExMzpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDRdO1xuICAgICAgICAgIHl5LnNldExpbmsoJCRbJDAgLSA0XSwgJCRbJDAgLSAyXSwgJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMTQ6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSA2XTtcbiAgICAgICAgICB5eS5zZXRMaW5rKCQkWyQwIC0gNl0sICQkWyQwIC0gNF0sICQkWyQwXSk7XG4gICAgICAgICAgeXkuc2V0VG9vbHRpcCgkJFskMCAtIDZdLCAkJFskMCAtIDJdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMTc6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAxXTtcbiAgICAgICAgICB5eS5zZXRMaW5rKCQkWyQwIC0gMV0sICQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTE4OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gM107XG4gICAgICAgICAgeXkuc2V0TGluaygkJFskMCAtIDNdLCAkJFskMCAtIDJdKTtcbiAgICAgICAgICB5eS5zZXRUb29sdGlwKCQkWyQwIC0gM10sICQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTE5OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gM107XG4gICAgICAgICAgeXkuc2V0TGluaygkJFskMCAtIDNdLCAkJFskMCAtIDJdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEyMDpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDVdO1xuICAgICAgICAgIHl5LnNldExpbmsoJCRbJDAgLSA1XSwgJCRbJDAgLSA0XSwgJCRbJDBdKTtcbiAgICAgICAgICB5eS5zZXRUb29sdGlwKCQkWyQwIC0gNV0sICQkWyQwIC0gMl0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEyMTpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDRdO1xuICAgICAgICAgIHl5LmFkZFZlcnRleCgkJFskMCAtIDJdLCB2b2lkIDAsIHZvaWQgMCwgJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMjI6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSA0XTtcbiAgICAgICAgICB5eS51cGRhdGVMaW5rKFskJFskMCAtIDJdXSwgJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMjM6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSA0XTtcbiAgICAgICAgICB5eS51cGRhdGVMaW5rKCQkWyQwIC0gMl0sICQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTI0OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gOF07XG4gICAgICAgICAgeXkudXBkYXRlTGlua0ludGVycG9sYXRlKFskJFskMCAtIDZdXSwgJCRbJDAgLSAyXSk7XG4gICAgICAgICAgeXkudXBkYXRlTGluayhbJCRbJDAgLSA2XV0sICQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTI1OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gOF07XG4gICAgICAgICAgeXkudXBkYXRlTGlua0ludGVycG9sYXRlKCQkWyQwIC0gNl0sICQkWyQwIC0gMl0pO1xuICAgICAgICAgIHl5LnVwZGF0ZUxpbmsoJCRbJDAgLSA2XSwgJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMjY6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSA2XTtcbiAgICAgICAgICB5eS51cGRhdGVMaW5rSW50ZXJwb2xhdGUoWyQkWyQwIC0gNF1dLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEyNzpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDZdO1xuICAgICAgICAgIHl5LnVwZGF0ZUxpbmtJbnRlcnBvbGF0ZSgkJFskMCAtIDRdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEyODpcbiAgICAgICAgY2FzZSAxMzA6XG4gICAgICAgICAgdGhpcy4kID0gWyQkWyQwXV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTI5OlxuICAgICAgICBjYXNlIDEzMTpcbiAgICAgICAgICAkJFskMCAtIDJdLnB1c2goJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDJdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEzMzpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDFdICsgJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE4MTpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTgyOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMV0gKyBcIlwiICsgJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE4NDpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDFdICsgXCJcIiArICQkWyQwXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxODU6XG4gICAgICAgICAgdGhpcy4kID0geyBzdG10OiBcImRpclwiLCB2YWx1ZTogXCJUQlwiIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTg2OlxuICAgICAgICAgIHRoaXMuJCA9IHsgc3RtdDogXCJkaXJcIiwgdmFsdWU6IFwiQlRcIiB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE4NzpcbiAgICAgICAgICB0aGlzLiQgPSB7IHN0bXQ6IFwiZGlyXCIsIHZhbHVlOiBcIlJMXCIgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxODg6XG4gICAgICAgICAgdGhpcy4kID0geyBzdG10OiBcImRpclwiLCB2YWx1ZTogXCJMUlwiIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTg5OlxuICAgICAgICAgIHRoaXMuJCA9IHsgc3RtdDogXCJkaXJcIiwgdmFsdWU6IFwiVERcIiB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0sIFwiYW5vbnltb3VzXCIpLFxuICAgIHRhYmxlOiBbeyAzOiAxLCA0OiAyLCA5OiAkVjAsIDEwOiAkVjEsIDEyOiAkVjIgfSwgeyAxOiBbM10gfSwgbygkVjMsICRWNCwgeyA1OiA2IH0pLCB7IDQ6IDcsIDk6ICRWMCwgMTA6ICRWMSwgMTI6ICRWMiB9LCB7IDQ6IDgsIDk6ICRWMCwgMTA6ICRWMSwgMTI6ICRWMiB9LCB7IDEzOiBbMSwgOV0sIDE0OiBbMSwgMTBdIH0sIHsgMTogWzIsIDFdLCA2OiAxMSwgNzogMTIsIDg6ICRWNSwgOTogJFY2LCAxMDogJFY3LCAxMTogJFY4LCAyMDogMTcsIDIyOiAxOCwgMjM6IDE5LCAyNDogMjAsIDI1OiAyMSwgMjY6IDIyLCAyNzogJFY5LCAzMzogMjQsIDM0OiAkVmEsIDM2OiAkVmIsIDM4OiAkVmMsIDQyOiAyOCwgNDM6IDM5LCA0NDogJFZkLCA0NTogNDAsIDQ3OiA0MSwgNjA6ICRWZSwgODQ6ICRWZiwgODU6ICRWZywgODY6ICRWaCwgODc6ICRWaSwgODg6ICRWaiwgODk6ICRWaywgMTAyOiAkVmwsIDEwNTogJFZtLCAxMDY6ICRWbiwgMTA5OiAkVm8sIDExMTogJFZwLCAxMTM6IDQyLCAxMTQ6ICRWcSwgMTE1OiAkVnIsIDExNjogJFZzLCAxMjE6ICRWdCwgMTIyOiAkVnUsIDEyMzogJFZ2LCAxMjQ6ICRWdywgMTI1OiAkVnggfSwgbygkVjMsIFsyLCA5XSksIG8oJFYzLCBbMiwgMTBdKSwgbygkVjMsIFsyLCAxMV0pLCB7IDg6IFsxLCA1NV0sIDk6IFsxLCA1Nl0sIDEwOiAkVnksIDE1OiA1NCwgMTg6IDU3IH0sIG8oJFZ6LCBbMiwgM10pLCBvKCRWeiwgWzIsIDRdKSwgbygkVnosIFsyLCA1XSksIG8oJFZ6LCBbMiwgNl0pLCBvKCRWeiwgWzIsIDddKSwgbygkVnosIFsyLCA4XSksIHsgODogJFZBLCA5OiAkVkIsIDExOiAkVkMsIDIxOiA1OSwgNDE6IDYwLCA3MjogNjQsIDc1OiBbMSwgNjVdLCA3NzogWzEsIDY3XSwgNzg6IFsxLCA2Nl0gfSwgeyA4OiAkVkEsIDk6ICRWQiwgMTE6ICRWQywgMjE6IDY4IH0sIHsgODogJFZBLCA5OiAkVkIsIDExOiAkVkMsIDIxOiA2OSB9LCB7IDg6ICRWQSwgOTogJFZCLCAxMTogJFZDLCAyMTogNzAgfSwgeyA4OiAkVkEsIDk6ICRWQiwgMTE6ICRWQywgMjE6IDcxIH0sIHsgODogJFZBLCA5OiAkVkIsIDExOiAkVkMsIDIxOiA3MiB9LCB7IDg6ICRWQSwgOTogJFZCLCAxMDogWzEsIDczXSwgMTE6ICRWQywgMjE6IDc0IH0sIG8oJFZ6LCBbMiwgMzZdKSwgeyAzNTogWzEsIDc1XSB9LCB7IDM3OiBbMSwgNzZdIH0sIG8oJFZ6LCBbMiwgMzldKSwgbygkVkQsIFsyLCA1MF0sIHsgMTg6IDc3LCAzOTogNzgsIDEwOiAkVnksIDQwOiAkVkUgfSksIHsgMTA6IFsxLCA4MF0gfSwgeyAxMDogWzEsIDgxXSB9LCB7IDEwOiBbMSwgODJdIH0sIHsgMTA6IFsxLCA4M10gfSwgeyAxNDogJFZGLCA0NDogJFZHLCA2MDogJFZILCA4MDogWzEsIDg3XSwgODk6ICRWSSwgOTU6IFsxLCA4NF0sIDk3OiBbMSwgODVdLCAxMDE6IDg2LCAxMDU6ICRWSiwgMTA2OiAkVkssIDEwOTogJFZMLCAxMTE6ICRWTSwgMTE0OiAkVk4sIDExNTogJFZPLCAxMTY6ICRWUCwgMTIwOiA4OCB9LCBvKCRWeiwgWzIsIDE4NV0pLCBvKCRWeiwgWzIsIDE4Nl0pLCBvKCRWeiwgWzIsIDE4N10pLCBvKCRWeiwgWzIsIDE4OF0pLCBvKCRWeiwgWzIsIDE4OV0pLCBvKCRWUSwgWzIsIDUxXSksIG8oJFZRLCBbMiwgNTRdLCB7IDQ2OiBbMSwgMTAwXSB9KSwgbygkVlIsIFsyLCA3Ml0sIHsgMTEzOiAxMTMsIDI5OiBbMSwgMTAxXSwgNDQ6ICRWZCwgNDg6IFsxLCAxMDJdLCA1MDogWzEsIDEwM10sIDUyOiBbMSwgMTA0XSwgNTQ6IFsxLCAxMDVdLCA1NjogWzEsIDEwNl0sIDU4OiBbMSwgMTA3XSwgNjA6ICRWZSwgNjM6IFsxLCAxMDhdLCA2NTogWzEsIDEwOV0sIDY3OiBbMSwgMTEwXSwgNjg6IFsxLCAxMTFdLCA3MDogWzEsIDExMl0sIDg5OiAkVmssIDEwMjogJFZsLCAxMDU6ICRWbSwgMTA2OiAkVm4sIDEwOTogJFZvLCAxMTE6ICRWcCwgMTE0OiAkVnEsIDExNTogJFZyLCAxMTY6ICRWcyB9KSwgbygkVlMsIFsyLCAxODFdKSwgbygkVlMsIFsyLCAxNDJdKSwgbygkVlMsIFsyLCAxNDNdKSwgbygkVlMsIFsyLCAxNDRdKSwgbygkVlMsIFsyLCAxNDVdKSwgbygkVlMsIFsyLCAxNDZdKSwgbygkVlMsIFsyLCAxNDddKSwgbygkVlMsIFsyLCAxNDhdKSwgbygkVlMsIFsyLCAxNDldKSwgbygkVlMsIFsyLCAxNTBdKSwgbygkVlMsIFsyLCAxNTFdKSwgbygkVlMsIFsyLCAxNTJdKSwgbygkVjMsIFsyLCAxMl0pLCBvKCRWMywgWzIsIDE4XSksIG8oJFYzLCBbMiwgMTldKSwgeyA5OiBbMSwgMTE0XSB9LCBvKCRWVCwgWzIsIDI2XSwgeyAxODogMTE1LCAxMDogJFZ5IH0pLCBvKCRWeiwgWzIsIDI3XSksIHsgNDI6IDExNiwgNDM6IDM5LCA0NDogJFZkLCA0NTogNDAsIDQ3OiA0MSwgNjA6ICRWZSwgODk6ICRWaywgMTAyOiAkVmwsIDEwNTogJFZtLCAxMDY6ICRWbiwgMTA5OiAkVm8sIDExMTogJFZwLCAxMTM6IDQyLCAxMTQ6ICRWcSwgMTE1OiAkVnIsIDExNjogJFZzIH0sIG8oJFZ6LCBbMiwgNDBdKSwgbygkVnosIFsyLCA0MV0pLCBvKCRWeiwgWzIsIDQyXSksIG8oJFZVLCBbMiwgNzZdLCB7IDczOiAxMTcsIDYyOiBbMSwgMTE5XSwgNzQ6IFsxLCAxMThdIH0pLCB7IDc2OiAxMjAsIDc5OiAxMjEsIDgwOiAkVlYsIDgxOiAkVlcsIDExNjogJFZYLCAxMTk6ICRWWSB9LCB7IDc1OiBbMSwgMTI2XSwgNzc6IFsxLCAxMjddIH0sIG8oJFZaLCBbMiwgODNdKSwgbygkVnosIFsyLCAyOF0pLCBvKCRWeiwgWzIsIDI5XSksIG8oJFZ6LCBbMiwgMzBdKSwgbygkVnosIFsyLCAzMV0pLCBvKCRWeiwgWzIsIDMyXSksIHsgMTA6ICRWXywgMTI6ICRWJCwgMTQ6ICRWMDEsIDI3OiAkVjExLCAyODogMTI4LCAzMjogJFYyMSwgNDQ6ICRWMzEsIDYwOiAkVjQxLCA3NTogJFY1MSwgODA6IFsxLCAxMzBdLCA4MTogWzEsIDEzMV0sIDgzOiAxNDEsIDg0OiAkVjYxLCA4NTogJFY3MSwgODY6ICRWODEsIDg3OiAkVjkxLCA4ODogJFZhMSwgODk6ICRWYjEsIDkwOiAkVmMxLCA5MTogMTI5LCAxMDU6ICRWZDEsIDEwOTogJFZlMSwgMTExOiAkVmYxLCAxMTQ6ICRWZzEsIDExNTogJFZoMSwgMTE2OiAkVmkxIH0sIG8oJFZqMSwgJFY0LCB7IDU6IDE1NCB9KSwgbygkVnosIFsyLCAzN10pLCBvKCRWeiwgWzIsIDM4XSksIG8oJFZELCBbMiwgNDhdLCB7IDQ0OiAkVmsxIH0pLCBvKCRWRCwgWzIsIDQ5XSwgeyAxODogMTU2LCAxMDogJFZ5LCA0MDogJFZsMSB9KSwgbygkVlEsIFsyLCA0NF0pLCB7IDQ0OiAkVmQsIDQ3OiAxNTgsIDYwOiAkVmUsIDg5OiAkVmssIDEwMjogJFZsLCAxMDU6ICRWbSwgMTA2OiAkVm4sIDEwOTogJFZvLCAxMTE6ICRWcCwgMTEzOiA0MiwgMTE0OiAkVnEsIDExNTogJFZyLCAxMTY6ICRWcyB9LCB7IDEwMjogWzEsIDE1OV0sIDEwMzogMTYwLCAxMDU6IFsxLCAxNjFdIH0sIHsgNDQ6ICRWZCwgNDc6IDE2MiwgNjA6ICRWZSwgODk6ICRWaywgMTAyOiAkVmwsIDEwNTogJFZtLCAxMDY6ICRWbiwgMTA5OiAkVm8sIDExMTogJFZwLCAxMTM6IDQyLCAxMTQ6ICRWcSwgMTE1OiAkVnIsIDExNjogJFZzIH0sIHsgNDQ6ICRWZCwgNDc6IDE2MywgNjA6ICRWZSwgODk6ICRWaywgMTAyOiAkVmwsIDEwNTogJFZtLCAxMDY6ICRWbiwgMTA5OiAkVm8sIDExMTogJFZwLCAxMTM6IDQyLCAxMTQ6ICRWcSwgMTE1OiAkVnIsIDExNjogJFZzIH0sIG8oJFZtMSwgWzIsIDEwN10sIHsgMTA6IFsxLCAxNjRdLCA5NjogWzEsIDE2NV0gfSksIHsgODA6IFsxLCAxNjZdIH0sIG8oJFZtMSwgWzIsIDExNV0sIHsgMTIwOiAxNjgsIDEwOiBbMSwgMTY3XSwgMTQ6ICRWRiwgNDQ6ICRWRywgNjA6ICRWSCwgODk6ICRWSSwgMTA1OiAkVkosIDEwNjogJFZLLCAxMDk6ICRWTCwgMTExOiAkVk0sIDExNDogJFZOLCAxMTU6ICRWTywgMTE2OiAkVlAgfSksIG8oJFZtMSwgWzIsIDExN10sIHsgMTA6IFsxLCAxNjldIH0pLCBvKCRWbjEsIFsyLCAxODNdKSwgbygkVm4xLCBbMiwgMTcwXSksIG8oJFZuMSwgWzIsIDE3MV0pLCBvKCRWbjEsIFsyLCAxNzJdKSwgbygkVm4xLCBbMiwgMTczXSksIG8oJFZuMSwgWzIsIDE3NF0pLCBvKCRWbjEsIFsyLCAxNzVdKSwgbygkVm4xLCBbMiwgMTc2XSksIG8oJFZuMSwgWzIsIDE3N10pLCBvKCRWbjEsIFsyLCAxNzhdKSwgbygkVm4xLCBbMiwgMTc5XSksIG8oJFZuMSwgWzIsIDE4MF0pLCB7IDQ0OiAkVmQsIDQ3OiAxNzAsIDYwOiAkVmUsIDg5OiAkVmssIDEwMjogJFZsLCAxMDU6ICRWbSwgMTA2OiAkVm4sIDEwOTogJFZvLCAxMTE6ICRWcCwgMTEzOiA0MiwgMTE0OiAkVnEsIDExNTogJFZyLCAxMTY6ICRWcyB9LCB7IDMwOiAxNzEsIDY3OiAkVm8xLCA4MDogJFZwMSwgODE6ICRWcTEsIDgyOiAxNzIsIDExNjogJFZyMSwgMTE3OiAkVnMxLCAxMTg6ICRWdDEgfSwgeyAzMDogMTc5LCA2NzogJFZvMSwgODA6ICRWcDEsIDgxOiAkVnExLCA4MjogMTcyLCAxMTY6ICRWcjEsIDExNzogJFZzMSwgMTE4OiAkVnQxIH0sIHsgMzA6IDE4MSwgNTA6IFsxLCAxODBdLCA2NzogJFZvMSwgODA6ICRWcDEsIDgxOiAkVnExLCA4MjogMTcyLCAxMTY6ICRWcjEsIDExNzogJFZzMSwgMTE4OiAkVnQxIH0sIHsgMzA6IDE4MiwgNjc6ICRWbzEsIDgwOiAkVnAxLCA4MTogJFZxMSwgODI6IDE3MiwgMTE2OiAkVnIxLCAxMTc6ICRWczEsIDExODogJFZ0MSB9LCB7IDMwOiAxODMsIDY3OiAkVm8xLCA4MDogJFZwMSwgODE6ICRWcTEsIDgyOiAxNzIsIDExNjogJFZyMSwgMTE3OiAkVnMxLCAxMTg6ICRWdDEgfSwgeyAzMDogMTg0LCA2NzogJFZvMSwgODA6ICRWcDEsIDgxOiAkVnExLCA4MjogMTcyLCAxMTY6ICRWcjEsIDExNzogJFZzMSwgMTE4OiAkVnQxIH0sIHsgMTA5OiBbMSwgMTg1XSB9LCB7IDMwOiAxODYsIDY3OiAkVm8xLCA4MDogJFZwMSwgODE6ICRWcTEsIDgyOiAxNzIsIDExNjogJFZyMSwgMTE3OiAkVnMxLCAxMTg6ICRWdDEgfSwgeyAzMDogMTg3LCA2NTogWzEsIDE4OF0sIDY3OiAkVm8xLCA4MDogJFZwMSwgODE6ICRWcTEsIDgyOiAxNzIsIDExNjogJFZyMSwgMTE3OiAkVnMxLCAxMTg6ICRWdDEgfSwgeyAzMDogMTg5LCA2NzogJFZvMSwgODA6ICRWcDEsIDgxOiAkVnExLCA4MjogMTcyLCAxMTY6ICRWcjEsIDExNzogJFZzMSwgMTE4OiAkVnQxIH0sIHsgMzA6IDE5MCwgNjc6ICRWbzEsIDgwOiAkVnAxLCA4MTogJFZxMSwgODI6IDE3MiwgMTE2OiAkVnIxLCAxMTc6ICRWczEsIDExODogJFZ0MSB9LCB7IDMwOiAxOTEsIDY3OiAkVm8xLCA4MDogJFZwMSwgODE6ICRWcTEsIDgyOiAxNzIsIDExNjogJFZyMSwgMTE3OiAkVnMxLCAxMTg6ICRWdDEgfSwgbygkVlMsIFsyLCAxODJdKSwgbygkVjMsIFsyLCAyMF0pLCBvKCRWVCwgWzIsIDI1XSksIG8oJFZELCBbMiwgNDZdLCB7IDM5OiAxOTIsIDE4OiAxOTMsIDEwOiAkVnksIDQwOiAkVkUgfSksIG8oJFZVLCBbMiwgNzNdLCB7IDEwOiBbMSwgMTk0XSB9KSwgeyAxMDogWzEsIDE5NV0gfSwgeyAzMDogMTk2LCA2NzogJFZvMSwgODA6ICRWcDEsIDgxOiAkVnExLCA4MjogMTcyLCAxMTY6ICRWcjEsIDExNzogJFZzMSwgMTE4OiAkVnQxIH0sIHsgNzc6IFsxLCAxOTddLCA3OTogMTk4LCAxMTY6ICRWWCwgMTE5OiAkVlkgfSwgbygkVnUxLCBbMiwgNzldKSwgbygkVnUxLCBbMiwgODFdKSwgbygkVnUxLCBbMiwgODJdKSwgbygkVnUxLCBbMiwgMTY4XSksIG8oJFZ1MSwgWzIsIDE2OV0pLCB7IDc2OiAxOTksIDc5OiAxMjEsIDgwOiAkVlYsIDgxOiAkVlcsIDExNjogJFZYLCAxMTk6ICRWWSB9LCBvKCRWWiwgWzIsIDg0XSksIHsgODogJFZBLCA5OiAkVkIsIDEwOiAkVl8sIDExOiAkVkMsIDEyOiAkViQsIDE0OiAkVjAxLCAyMTogMjAxLCAyNzogJFYxMSwgMjk6IFsxLCAyMDBdLCAzMjogJFYyMSwgNDQ6ICRWMzEsIDYwOiAkVjQxLCA3NTogJFY1MSwgODM6IDE0MSwgODQ6ICRWNjEsIDg1OiAkVjcxLCA4NjogJFY4MSwgODc6ICRWOTEsIDg4OiAkVmExLCA4OTogJFZiMSwgOTA6ICRWYzEsIDkxOiAyMDIsIDEwNTogJFZkMSwgMTA5OiAkVmUxLCAxMTE6ICRWZjEsIDExNDogJFZnMSwgMTE1OiAkVmgxLCAxMTY6ICRWaTEgfSwgbygkVnYxLCBbMiwgMTAxXSksIG8oJFZ2MSwgWzIsIDEwM10pLCBvKCRWdjEsIFsyLCAxMDRdKSwgbygkVnYxLCBbMiwgMTU3XSksIG8oJFZ2MSwgWzIsIDE1OF0pLCBvKCRWdjEsIFsyLCAxNTldKSwgbygkVnYxLCBbMiwgMTYwXSksIG8oJFZ2MSwgWzIsIDE2MV0pLCBvKCRWdjEsIFsyLCAxNjJdKSwgbygkVnYxLCBbMiwgMTYzXSksIG8oJFZ2MSwgWzIsIDE2NF0pLCBvKCRWdjEsIFsyLCAxNjVdKSwgbygkVnYxLCBbMiwgMTY2XSksIG8oJFZ2MSwgWzIsIDE2N10pLCBvKCRWdjEsIFsyLCA5MF0pLCBvKCRWdjEsIFsyLCA5MV0pLCBvKCRWdjEsIFsyLCA5Ml0pLCBvKCRWdjEsIFsyLCA5M10pLCBvKCRWdjEsIFsyLCA5NF0pLCBvKCRWdjEsIFsyLCA5NV0pLCBvKCRWdjEsIFsyLCA5Nl0pLCBvKCRWdjEsIFsyLCA5N10pLCBvKCRWdjEsIFsyLCA5OF0pLCBvKCRWdjEsIFsyLCA5OV0pLCBvKCRWdjEsIFsyLCAxMDBdKSwgeyA2OiAxMSwgNzogMTIsIDg6ICRWNSwgOTogJFY2LCAxMDogJFY3LCAxMTogJFY4LCAyMDogMTcsIDIyOiAxOCwgMjM6IDE5LCAyNDogMjAsIDI1OiAyMSwgMjY6IDIyLCAyNzogJFY5LCAzMjogWzEsIDIwM10sIDMzOiAyNCwgMzQ6ICRWYSwgMzY6ICRWYiwgMzg6ICRWYywgNDI6IDI4LCA0MzogMzksIDQ0OiAkVmQsIDQ1OiA0MCwgNDc6IDQxLCA2MDogJFZlLCA4NDogJFZmLCA4NTogJFZnLCA4NjogJFZoLCA4NzogJFZpLCA4ODogJFZqLCA4OTogJFZrLCAxMDI6ICRWbCwgMTA1OiAkVm0sIDEwNjogJFZuLCAxMDk6ICRWbywgMTExOiAkVnAsIDExMzogNDIsIDExNDogJFZxLCAxMTU6ICRWciwgMTE2OiAkVnMsIDEyMTogJFZ0LCAxMjI6ICRWdSwgMTIzOiAkVnYsIDEyNDogJFZ3LCAxMjU6ICRWeCB9LCB7IDEwOiAkVnksIDE4OiAyMDQgfSwgeyA0NDogWzEsIDIwNV0gfSwgbygkVlEsIFsyLCA0M10pLCB7IDEwOiBbMSwgMjA2XSwgNDQ6ICRWZCwgNjA6ICRWZSwgODk6ICRWaywgMTAyOiAkVmwsIDEwNTogJFZtLCAxMDY6ICRWbiwgMTA5OiAkVm8sIDExMTogJFZwLCAxMTM6IDExMywgMTE0OiAkVnEsIDExNTogJFZyLCAxMTY6ICRWcyB9LCB7IDEwOiBbMSwgMjA3XSB9LCB7IDEwOiBbMSwgMjA4XSwgMTA2OiBbMSwgMjA5XSB9LCBvKCRWdzEsIFsyLCAxMjhdKSwgeyAxMDogWzEsIDIxMF0sIDQ0OiAkVmQsIDYwOiAkVmUsIDg5OiAkVmssIDEwMjogJFZsLCAxMDU6ICRWbSwgMTA2OiAkVm4sIDEwOTogJFZvLCAxMTE6ICRWcCwgMTEzOiAxMTMsIDExNDogJFZxLCAxMTU6ICRWciwgMTE2OiAkVnMgfSwgeyAxMDogWzEsIDIxMV0sIDQ0OiAkVmQsIDYwOiAkVmUsIDg5OiAkVmssIDEwMjogJFZsLCAxMDU6ICRWbSwgMTA2OiAkVm4sIDEwOTogJFZvLCAxMTE6ICRWcCwgMTEzOiAxMTMsIDExNDogJFZxLCAxMTU6ICRWciwgMTE2OiAkVnMgfSwgeyA4MDogWzEsIDIxMl0gfSwgbygkVm0xLCBbMiwgMTA5XSwgeyAxMDogWzEsIDIxM10gfSksIG8oJFZtMSwgWzIsIDExMV0sIHsgMTA6IFsxLCAyMTRdIH0pLCB7IDgwOiBbMSwgMjE1XSB9LCBvKCRWbjEsIFsyLCAxODRdKSwgeyA4MDogWzEsIDIxNl0sIDk4OiBbMSwgMjE3XSB9LCBvKCRWUSwgWzIsIDU1XSwgeyAxMTM6IDExMywgNDQ6ICRWZCwgNjA6ICRWZSwgODk6ICRWaywgMTAyOiAkVmwsIDEwNTogJFZtLCAxMDY6ICRWbiwgMTA5OiAkVm8sIDExMTogJFZwLCAxMTQ6ICRWcSwgMTE1OiAkVnIsIDExNjogJFZzIH0pLCB7IDMxOiBbMSwgMjE4XSwgNjc6ICRWbzEsIDgyOiAyMTksIDExNjogJFZyMSwgMTE3OiAkVnMxLCAxMTg6ICRWdDEgfSwgbygkVngxLCBbMiwgODZdKSwgbygkVngxLCBbMiwgODhdKSwgbygkVngxLCBbMiwgODldKSwgbygkVngxLCBbMiwgMTUzXSksIG8oJFZ4MSwgWzIsIDE1NF0pLCBvKCRWeDEsIFsyLCAxNTVdKSwgbygkVngxLCBbMiwgMTU2XSksIHsgNDk6IFsxLCAyMjBdLCA2NzogJFZvMSwgODI6IDIxOSwgMTE2OiAkVnIxLCAxMTc6ICRWczEsIDExODogJFZ0MSB9LCB7IDMwOiAyMjEsIDY3OiAkVm8xLCA4MDogJFZwMSwgODE6ICRWcTEsIDgyOiAxNzIsIDExNjogJFZyMSwgMTE3OiAkVnMxLCAxMTg6ICRWdDEgfSwgeyA1MTogWzEsIDIyMl0sIDY3OiAkVm8xLCA4MjogMjE5LCAxMTY6ICRWcjEsIDExNzogJFZzMSwgMTE4OiAkVnQxIH0sIHsgNTM6IFsxLCAyMjNdLCA2NzogJFZvMSwgODI6IDIxOSwgMTE2OiAkVnIxLCAxMTc6ICRWczEsIDExODogJFZ0MSB9LCB7IDU1OiBbMSwgMjI0XSwgNjc6ICRWbzEsIDgyOiAyMTksIDExNjogJFZyMSwgMTE3OiAkVnMxLCAxMTg6ICRWdDEgfSwgeyA1NzogWzEsIDIyNV0sIDY3OiAkVm8xLCA4MjogMjE5LCAxMTY6ICRWcjEsIDExNzogJFZzMSwgMTE4OiAkVnQxIH0sIHsgNjA6IFsxLCAyMjZdIH0sIHsgNjQ6IFsxLCAyMjddLCA2NzogJFZvMSwgODI6IDIxOSwgMTE2OiAkVnIxLCAxMTc6ICRWczEsIDExODogJFZ0MSB9LCB7IDY2OiBbMSwgMjI4XSwgNjc6ICRWbzEsIDgyOiAyMTksIDExNjogJFZyMSwgMTE3OiAkVnMxLCAxMTg6ICRWdDEgfSwgeyAzMDogMjI5LCA2NzogJFZvMSwgODA6ICRWcDEsIDgxOiAkVnExLCA4MjogMTcyLCAxMTY6ICRWcjEsIDExNzogJFZzMSwgMTE4OiAkVnQxIH0sIHsgMzE6IFsxLCAyMzBdLCA2NzogJFZvMSwgODI6IDIxOSwgMTE2OiAkVnIxLCAxMTc6ICRWczEsIDExODogJFZ0MSB9LCB7IDY3OiAkVm8xLCA2OTogWzEsIDIzMV0sIDcxOiBbMSwgMjMyXSwgODI6IDIxOSwgMTE2OiAkVnIxLCAxMTc6ICRWczEsIDExODogJFZ0MSB9LCB7IDY3OiAkVm8xLCA2OTogWzEsIDIzNF0sIDcxOiBbMSwgMjMzXSwgODI6IDIxOSwgMTE2OiAkVnIxLCAxMTc6ICRWczEsIDExODogJFZ0MSB9LCBvKCRWRCwgWzIsIDQ1XSwgeyAxODogMTU2LCAxMDogJFZ5LCA0MDogJFZsMSB9KSwgbygkVkQsIFsyLCA0N10sIHsgNDQ6ICRWazEgfSksIG8oJFZVLCBbMiwgNzVdKSwgbygkVlUsIFsyLCA3NF0pLCB7IDYyOiBbMSwgMjM1XSwgNjc6ICRWbzEsIDgyOiAyMTksIDExNjogJFZyMSwgMTE3OiAkVnMxLCAxMTg6ICRWdDEgfSwgbygkVlUsIFsyLCA3N10pLCBvKCRWdTEsIFsyLCA4MF0pLCB7IDc3OiBbMSwgMjM2XSwgNzk6IDE5OCwgMTE2OiAkVlgsIDExOTogJFZZIH0sIHsgMzA6IDIzNywgNjc6ICRWbzEsIDgwOiAkVnAxLCA4MTogJFZxMSwgODI6IDE3MiwgMTE2OiAkVnIxLCAxMTc6ICRWczEsIDExODogJFZ0MSB9LCBvKCRWajEsICRWNCwgeyA1OiAyMzggfSksIG8oJFZ2MSwgWzIsIDEwMl0pLCBvKCRWeiwgWzIsIDM1XSksIHsgNDM6IDIzOSwgNDQ6ICRWZCwgNDU6IDQwLCA0NzogNDEsIDYwOiAkVmUsIDg5OiAkVmssIDEwMjogJFZsLCAxMDU6ICRWbSwgMTA2OiAkVm4sIDEwOTogJFZvLCAxMTE6ICRWcCwgMTEzOiA0MiwgMTE0OiAkVnEsIDExNTogJFZyLCAxMTY6ICRWcyB9LCB7IDEwOiAkVnksIDE4OiAyNDAgfSwgeyAxMDogJFZ5MSwgNjA6ICRWejEsIDg0OiAkVkExLCA5MjogMjQxLCAxMDU6ICRWQjEsIDEwNzogMjQyLCAxMDg6IDI0MywgMTA5OiAkVkMxLCAxMTA6ICRWRDEsIDExMTogJFZFMSwgMTEyOiAkVkYxIH0sIHsgMTA6ICRWeTEsIDYwOiAkVnoxLCA4NDogJFZBMSwgOTI6IDI1MiwgMTA0OiBbMSwgMjUzXSwgMTA1OiAkVkIxLCAxMDc6IDI0MiwgMTA4OiAyNDMsIDEwOTogJFZDMSwgMTEwOiAkVkQxLCAxMTE6ICRWRTEsIDExMjogJFZGMSB9LCB7IDEwOiAkVnkxLCA2MDogJFZ6MSwgODQ6ICRWQTEsIDkyOiAyNTQsIDEwNDogWzEsIDI1NV0sIDEwNTogJFZCMSwgMTA3OiAyNDIsIDEwODogMjQzLCAxMDk6ICRWQzEsIDExMDogJFZEMSwgMTExOiAkVkUxLCAxMTI6ICRWRjEgfSwgeyAxMDU6IFsxLCAyNTZdIH0sIHsgMTA6ICRWeTEsIDYwOiAkVnoxLCA4NDogJFZBMSwgOTI6IDI1NywgMTA1OiAkVkIxLCAxMDc6IDI0MiwgMTA4OiAyNDMsIDEwOTogJFZDMSwgMTEwOiAkVkQxLCAxMTE6ICRWRTEsIDExMjogJFZGMSB9LCB7IDQ0OiAkVmQsIDQ3OiAyNTgsIDYwOiAkVmUsIDg5OiAkVmssIDEwMjogJFZsLCAxMDU6ICRWbSwgMTA2OiAkVm4sIDEwOTogJFZvLCAxMTE6ICRWcCwgMTEzOiA0MiwgMTE0OiAkVnEsIDExNTogJFZyLCAxMTY6ICRWcyB9LCBvKCRWbTEsIFsyLCAxMDhdKSwgeyA4MDogWzEsIDI1OV0gfSwgeyA4MDogWzEsIDI2MF0sIDk4OiBbMSwgMjYxXSB9LCBvKCRWbTEsIFsyLCAxMTZdKSwgbygkVm0xLCBbMiwgMTE4XSwgeyAxMDogWzEsIDI2Ml0gfSksIG8oJFZtMSwgWzIsIDExOV0pLCBvKCRWUiwgWzIsIDU2XSksIG8oJFZ4MSwgWzIsIDg3XSksIG8oJFZSLCBbMiwgNTddKSwgeyA1MTogWzEsIDI2M10sIDY3OiAkVm8xLCA4MjogMjE5LCAxMTY6ICRWcjEsIDExNzogJFZzMSwgMTE4OiAkVnQxIH0sIG8oJFZSLCBbMiwgNjRdKSwgbygkVlIsIFsyLCA1OV0pLCBvKCRWUiwgWzIsIDYwXSksIG8oJFZSLCBbMiwgNjFdKSwgeyAxMDk6IFsxLCAyNjRdIH0sIG8oJFZSLCBbMiwgNjNdKSwgbygkVlIsIFsyLCA2NV0pLCB7IDY2OiBbMSwgMjY1XSwgNjc6ICRWbzEsIDgyOiAyMTksIDExNjogJFZyMSwgMTE3OiAkVnMxLCAxMTg6ICRWdDEgfSwgbygkVlIsIFsyLCA2N10pLCBvKCRWUiwgWzIsIDY4XSksIG8oJFZSLCBbMiwgNzBdKSwgbygkVlIsIFsyLCA2OV0pLCBvKCRWUiwgWzIsIDcxXSksIG8oWzEwLCA0NCwgNjAsIDg5LCAxMDIsIDEwNSwgMTA2LCAxMDksIDExMSwgMTE0LCAxMTUsIDExNl0sIFsyLCA4NV0pLCBvKCRWVSwgWzIsIDc4XSksIHsgMzE6IFsxLCAyNjZdLCA2NzogJFZvMSwgODI6IDIxOSwgMTE2OiAkVnIxLCAxMTc6ICRWczEsIDExODogJFZ0MSB9LCB7IDY6IDExLCA3OiAxMiwgODogJFY1LCA5OiAkVjYsIDEwOiAkVjcsIDExOiAkVjgsIDIwOiAxNywgMjI6IDE4LCAyMzogMTksIDI0OiAyMCwgMjU6IDIxLCAyNjogMjIsIDI3OiAkVjksIDMyOiBbMSwgMjY3XSwgMzM6IDI0LCAzNDogJFZhLCAzNjogJFZiLCAzODogJFZjLCA0MjogMjgsIDQzOiAzOSwgNDQ6ICRWZCwgNDU6IDQwLCA0NzogNDEsIDYwOiAkVmUsIDg0OiAkVmYsIDg1OiAkVmcsIDg2OiAkVmgsIDg3OiAkVmksIDg4OiAkVmosIDg5OiAkVmssIDEwMjogJFZsLCAxMDU6ICRWbSwgMTA2OiAkVm4sIDEwOTogJFZvLCAxMTE6ICRWcCwgMTEzOiA0MiwgMTE0OiAkVnEsIDExNTogJFZyLCAxMTY6ICRWcywgMTIxOiAkVnQsIDEyMjogJFZ1LCAxMjM6ICRWdiwgMTI0OiAkVncsIDEyNTogJFZ4IH0sIG8oJFZRLCBbMiwgNTNdKSwgeyA0MzogMjY4LCA0NDogJFZkLCA0NTogNDAsIDQ3OiA0MSwgNjA6ICRWZSwgODk6ICRWaywgMTAyOiAkVmwsIDEwNTogJFZtLCAxMDY6ICRWbiwgMTA5OiAkVm8sIDExMTogJFZwLCAxMTM6IDQyLCAxMTQ6ICRWcSwgMTE1OiAkVnIsIDExNjogJFZzIH0sIG8oJFZtMSwgWzIsIDEyMV0sIHsgMTA2OiAkVkcxIH0pLCBvKCRWSDEsIFsyLCAxMzBdLCB7IDEwODogMjcwLCAxMDogJFZ5MSwgNjA6ICRWejEsIDg0OiAkVkExLCAxMDU6ICRWQjEsIDEwOTogJFZDMSwgMTEwOiAkVkQxLCAxMTE6ICRWRTEsIDExMjogJFZGMSB9KSwgbygkVkkxLCBbMiwgMTMyXSksIG8oJFZJMSwgWzIsIDEzNF0pLCBvKCRWSTEsIFsyLCAxMzVdKSwgbygkVkkxLCBbMiwgMTM2XSksIG8oJFZJMSwgWzIsIDEzN10pLCBvKCRWSTEsIFsyLCAxMzhdKSwgbygkVkkxLCBbMiwgMTM5XSksIG8oJFZJMSwgWzIsIDE0MF0pLCBvKCRWSTEsIFsyLCAxNDFdKSwgbygkVm0xLCBbMiwgMTIyXSwgeyAxMDY6ICRWRzEgfSksIHsgMTA6IFsxLCAyNzFdIH0sIG8oJFZtMSwgWzIsIDEyM10sIHsgMTA2OiAkVkcxIH0pLCB7IDEwOiBbMSwgMjcyXSB9LCBvKCRWdzEsIFsyLCAxMjldKSwgbygkVm0xLCBbMiwgMTA1XSwgeyAxMDY6ICRWRzEgfSksIG8oJFZtMSwgWzIsIDEwNl0sIHsgMTEzOiAxMTMsIDQ0OiAkVmQsIDYwOiAkVmUsIDg5OiAkVmssIDEwMjogJFZsLCAxMDU6ICRWbSwgMTA2OiAkVm4sIDEwOTogJFZvLCAxMTE6ICRWcCwgMTE0OiAkVnEsIDExNTogJFZyLCAxMTY6ICRWcyB9KSwgbygkVm0xLCBbMiwgMTEwXSksIG8oJFZtMSwgWzIsIDExMl0sIHsgMTA6IFsxLCAyNzNdIH0pLCBvKCRWbTEsIFsyLCAxMTNdKSwgeyA5ODogWzEsIDI3NF0gfSwgeyA1MTogWzEsIDI3NV0gfSwgeyA2MjogWzEsIDI3Nl0gfSwgeyA2NjogWzEsIDI3N10gfSwgeyA4OiAkVkEsIDk6ICRWQiwgMTE6ICRWQywgMjE6IDI3OCB9LCBvKCRWeiwgWzIsIDM0XSksIG8oJFZRLCBbMiwgNTJdKSwgeyAxMDogJFZ5MSwgNjA6ICRWejEsIDg0OiAkVkExLCAxMDU6ICRWQjEsIDEwNzogMjc5LCAxMDg6IDI0MywgMTA5OiAkVkMxLCAxMTA6ICRWRDEsIDExMTogJFZFMSwgMTEyOiAkVkYxIH0sIG8oJFZJMSwgWzIsIDEzM10pLCB7IDE0OiAkVkYsIDQ0OiAkVkcsIDYwOiAkVkgsIDg5OiAkVkksIDEwMTogMjgwLCAxMDU6ICRWSiwgMTA2OiAkVkssIDEwOTogJFZMLCAxMTE6ICRWTSwgMTE0OiAkVk4sIDExNTogJFZPLCAxMTY6ICRWUCwgMTIwOiA4OCB9LCB7IDE0OiAkVkYsIDQ0OiAkVkcsIDYwOiAkVkgsIDg5OiAkVkksIDEwMTogMjgxLCAxMDU6ICRWSiwgMTA2OiAkVkssIDEwOTogJFZMLCAxMTE6ICRWTSwgMTE0OiAkVk4sIDExNTogJFZPLCAxMTY6ICRWUCwgMTIwOiA4OCB9LCB7IDk4OiBbMSwgMjgyXSB9LCBvKCRWbTEsIFsyLCAxMjBdKSwgbygkVlIsIFsyLCA1OF0pLCB7IDMwOiAyODMsIDY3OiAkVm8xLCA4MDogJFZwMSwgODE6ICRWcTEsIDgyOiAxNzIsIDExNjogJFZyMSwgMTE3OiAkVnMxLCAxMTg6ICRWdDEgfSwgbygkVlIsIFsyLCA2Nl0pLCBvKCRWajEsICRWNCwgeyA1OiAyODQgfSksIG8oJFZIMSwgWzIsIDEzMV0sIHsgMTA4OiAyNzAsIDEwOiAkVnkxLCA2MDogJFZ6MSwgODQ6ICRWQTEsIDEwNTogJFZCMSwgMTA5OiAkVkMxLCAxMTA6ICRWRDEsIDExMTogJFZFMSwgMTEyOiAkVkYxIH0pLCBvKCRWbTEsIFsyLCAxMjZdLCB7IDEyMDogMTY4LCAxMDogWzEsIDI4NV0sIDE0OiAkVkYsIDQ0OiAkVkcsIDYwOiAkVkgsIDg5OiAkVkksIDEwNTogJFZKLCAxMDY6ICRWSywgMTA5OiAkVkwsIDExMTogJFZNLCAxMTQ6ICRWTiwgMTE1OiAkVk8sIDExNjogJFZQIH0pLCBvKCRWbTEsIFsyLCAxMjddLCB7IDEyMDogMTY4LCAxMDogWzEsIDI4Nl0sIDE0OiAkVkYsIDQ0OiAkVkcsIDYwOiAkVkgsIDg5OiAkVkksIDEwNTogJFZKLCAxMDY6ICRWSywgMTA5OiAkVkwsIDExMTogJFZNLCAxMTQ6ICRWTiwgMTE1OiAkVk8sIDExNjogJFZQIH0pLCBvKCRWbTEsIFsyLCAxMTRdKSwgeyAzMTogWzEsIDI4N10sIDY3OiAkVm8xLCA4MjogMjE5LCAxMTY6ICRWcjEsIDExNzogJFZzMSwgMTE4OiAkVnQxIH0sIHsgNjogMTEsIDc6IDEyLCA4OiAkVjUsIDk6ICRWNiwgMTA6ICRWNywgMTE6ICRWOCwgMjA6IDE3LCAyMjogMTgsIDIzOiAxOSwgMjQ6IDIwLCAyNTogMjEsIDI2OiAyMiwgMjc6ICRWOSwgMzI6IFsxLCAyODhdLCAzMzogMjQsIDM0OiAkVmEsIDM2OiAkVmIsIDM4OiAkVmMsIDQyOiAyOCwgNDM6IDM5LCA0NDogJFZkLCA0NTogNDAsIDQ3OiA0MSwgNjA6ICRWZSwgODQ6ICRWZiwgODU6ICRWZywgODY6ICRWaCwgODc6ICRWaSwgODg6ICRWaiwgODk6ICRWaywgMTAyOiAkVmwsIDEwNTogJFZtLCAxMDY6ICRWbiwgMTA5OiAkVm8sIDExMTogJFZwLCAxMTM6IDQyLCAxMTQ6ICRWcSwgMTE1OiAkVnIsIDExNjogJFZzLCAxMjE6ICRWdCwgMTIyOiAkVnUsIDEyMzogJFZ2LCAxMjQ6ICRWdywgMTI1OiAkVnggfSwgeyAxMDogJFZ5MSwgNjA6ICRWejEsIDg0OiAkVkExLCA5MjogMjg5LCAxMDU6ICRWQjEsIDEwNzogMjQyLCAxMDg6IDI0MywgMTA5OiAkVkMxLCAxMTA6ICRWRDEsIDExMTogJFZFMSwgMTEyOiAkVkYxIH0sIHsgMTA6ICRWeTEsIDYwOiAkVnoxLCA4NDogJFZBMSwgOTI6IDI5MCwgMTA1OiAkVkIxLCAxMDc6IDI0MiwgMTA4OiAyNDMsIDEwOTogJFZDMSwgMTEwOiAkVkQxLCAxMTE6ICRWRTEsIDExMjogJFZGMSB9LCBvKCRWUiwgWzIsIDYyXSksIG8oJFZ6LCBbMiwgMzNdKSwgbygkVm0xLCBbMiwgMTI0XSwgeyAxMDY6ICRWRzEgfSksIG8oJFZtMSwgWzIsIDEyNV0sIHsgMTA2OiAkVkcxIH0pXSxcbiAgICBkZWZhdWx0QWN0aW9uczoge30sXG4gICAgcGFyc2VFcnJvcjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwYXJzZUVycm9yKHN0ciwgaGFzaCkge1xuICAgICAgaWYgKGhhc2gucmVjb3ZlcmFibGUpIHtcbiAgICAgICAgdGhpcy50cmFjZShzdHIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKHN0cik7XG4gICAgICAgIGVycm9yLmhhc2ggPSBoYXNoO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LCBcInBhcnNlRXJyb3JcIiksXG4gICAgcGFyc2U6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcGFyc2UoaW5wdXQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcywgc3RhY2sgPSBbMF0sIHRzdGFjayA9IFtdLCB2c3RhY2sgPSBbbnVsbF0sIGxzdGFjayA9IFtdLCB0YWJsZSA9IHRoaXMudGFibGUsIHl5dGV4dCA9IFwiXCIsIHl5bGluZW5vID0gMCwgeXlsZW5nID0gMCwgcmVjb3ZlcmluZyA9IDAsIFRFUlJPUiA9IDIsIEVPRiA9IDE7XG4gICAgICB2YXIgYXJncyA9IGxzdGFjay5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICB2YXIgbGV4ZXIyID0gT2JqZWN0LmNyZWF0ZSh0aGlzLmxleGVyKTtcbiAgICAgIHZhciBzaGFyZWRTdGF0ZSA9IHsgeXk6IHt9IH07XG4gICAgICBmb3IgKHZhciBrIGluIHRoaXMueXkpIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnl5LCBrKSkge1xuICAgICAgICAgIHNoYXJlZFN0YXRlLnl5W2tdID0gdGhpcy55eVtrXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGV4ZXIyLnNldElucHV0KGlucHV0LCBzaGFyZWRTdGF0ZS55eSk7XG4gICAgICBzaGFyZWRTdGF0ZS55eS5sZXhlciA9IGxleGVyMjtcbiAgICAgIHNoYXJlZFN0YXRlLnl5LnBhcnNlciA9IHRoaXM7XG4gICAgICBpZiAodHlwZW9mIGxleGVyMi55eWxsb2MgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBsZXhlcjIueXlsbG9jID0ge307XG4gICAgICB9XG4gICAgICB2YXIgeXlsb2MgPSBsZXhlcjIueXlsbG9jO1xuICAgICAgbHN0YWNrLnB1c2goeXlsb2MpO1xuICAgICAgdmFyIHJhbmdlcyA9IGxleGVyMi5vcHRpb25zICYmIGxleGVyMi5vcHRpb25zLnJhbmdlcztcbiAgICAgIGlmICh0eXBlb2Ygc2hhcmVkU3RhdGUueXkucGFyc2VFcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRoaXMucGFyc2VFcnJvciA9IHNoYXJlZFN0YXRlLnl5LnBhcnNlRXJyb3I7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBhcnNlRXJyb3IgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykucGFyc2VFcnJvcjtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHBvcFN0YWNrKG4pIHtcbiAgICAgICAgc3RhY2subGVuZ3RoID0gc3RhY2subGVuZ3RoIC0gMiAqIG47XG4gICAgICAgIHZzdGFjay5sZW5ndGggPSB2c3RhY2subGVuZ3RoIC0gbjtcbiAgICAgICAgbHN0YWNrLmxlbmd0aCA9IGxzdGFjay5sZW5ndGggLSBuO1xuICAgICAgfVxuICAgICAgX19uYW1lKHBvcFN0YWNrLCBcInBvcFN0YWNrXCIpO1xuICAgICAgZnVuY3Rpb24gbGV4KCkge1xuICAgICAgICB2YXIgdG9rZW47XG4gICAgICAgIHRva2VuID0gdHN0YWNrLnBvcCgpIHx8IGxleGVyMi5sZXgoKSB8fCBFT0Y7XG4gICAgICAgIGlmICh0eXBlb2YgdG9rZW4gIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICBpZiAodG9rZW4gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgdHN0YWNrID0gdG9rZW47XG4gICAgICAgICAgICB0b2tlbiA9IHRzdGFjay5wb3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdG9rZW4gPSBzZWxmLnN5bWJvbHNfW3Rva2VuXSB8fCB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICB9XG4gICAgICBfX25hbWUobGV4LCBcImxleFwiKTtcbiAgICAgIHZhciBzeW1ib2wsIHByZUVycm9yU3ltYm9sLCBzdGF0ZSwgYWN0aW9uLCBhLCByLCB5eXZhbCA9IHt9LCBwLCBsZW4sIG5ld1N0YXRlLCBleHBlY3RlZDtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHN0YXRlID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRBY3Rpb25zW3N0YXRlXSkge1xuICAgICAgICAgIGFjdGlvbiA9IHRoaXMuZGVmYXVsdEFjdGlvbnNbc3RhdGVdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChzeW1ib2wgPT09IG51bGwgfHwgdHlwZW9mIHN5bWJvbCA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBzeW1ib2wgPSBsZXgoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aW9uID0gdGFibGVbc3RhdGVdICYmIHRhYmxlW3N0YXRlXVtzeW1ib2xdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgYWN0aW9uID09PSBcInVuZGVmaW5lZFwiIHx8ICFhY3Rpb24ubGVuZ3RoIHx8ICFhY3Rpb25bMF0pIHtcbiAgICAgICAgICB2YXIgZXJyU3RyID0gXCJcIjtcbiAgICAgICAgICBleHBlY3RlZCA9IFtdO1xuICAgICAgICAgIGZvciAocCBpbiB0YWJsZVtzdGF0ZV0pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRlcm1pbmFsc19bcF0gJiYgcCA+IFRFUlJPUikge1xuICAgICAgICAgICAgICBleHBlY3RlZC5wdXNoKFwiJ1wiICsgdGhpcy50ZXJtaW5hbHNfW3BdICsgXCInXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobGV4ZXIyLnNob3dQb3NpdGlvbikge1xuICAgICAgICAgICAgZXJyU3RyID0gXCJQYXJzZSBlcnJvciBvbiBsaW5lIFwiICsgKHl5bGluZW5vICsgMSkgKyBcIjpcXG5cIiArIGxleGVyMi5zaG93UG9zaXRpb24oKSArIFwiXFxuRXhwZWN0aW5nIFwiICsgZXhwZWN0ZWQuam9pbihcIiwgXCIpICsgXCIsIGdvdCAnXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlcnJTdHIgPSBcIlBhcnNlIGVycm9yIG9uIGxpbmUgXCIgKyAoeXlsaW5lbm8gKyAxKSArIFwiOiBVbmV4cGVjdGVkIFwiICsgKHN5bWJvbCA9PSBFT0YgPyBcImVuZCBvZiBpbnB1dFwiIDogXCInXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wYXJzZUVycm9yKGVyclN0ciwge1xuICAgICAgICAgICAgdGV4dDogbGV4ZXIyLm1hdGNoLFxuICAgICAgICAgICAgdG9rZW46IHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCxcbiAgICAgICAgICAgIGxpbmU6IGxleGVyMi55eWxpbmVubyxcbiAgICAgICAgICAgIGxvYzogeXlsb2MsXG4gICAgICAgICAgICBleHBlY3RlZFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhY3Rpb25bMF0gaW5zdGFuY2VvZiBBcnJheSAmJiBhY3Rpb24ubGVuZ3RoID4gMSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcnNlIEVycm9yOiBtdWx0aXBsZSBhY3Rpb25zIHBvc3NpYmxlIGF0IHN0YXRlOiBcIiArIHN0YXRlICsgXCIsIHRva2VuOiBcIiArIHN5bWJvbCk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChhY3Rpb25bMF0pIHtcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBzdGFjay5wdXNoKHN5bWJvbCk7XG4gICAgICAgICAgICB2c3RhY2sucHVzaChsZXhlcjIueXl0ZXh0KTtcbiAgICAgICAgICAgIGxzdGFjay5wdXNoKGxleGVyMi55eWxsb2MpO1xuICAgICAgICAgICAgc3RhY2sucHVzaChhY3Rpb25bMV0pO1xuICAgICAgICAgICAgc3ltYm9sID0gbnVsbDtcbiAgICAgICAgICAgIGlmICghcHJlRXJyb3JTeW1ib2wpIHtcbiAgICAgICAgICAgICAgeXlsZW5nID0gbGV4ZXIyLnl5bGVuZztcbiAgICAgICAgICAgICAgeXl0ZXh0ID0gbGV4ZXIyLnl5dGV4dDtcbiAgICAgICAgICAgICAgeXlsaW5lbm8gPSBsZXhlcjIueXlsaW5lbm87XG4gICAgICAgICAgICAgIHl5bG9jID0gbGV4ZXIyLnl5bGxvYztcbiAgICAgICAgICAgICAgaWYgKHJlY292ZXJpbmcgPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVjb3ZlcmluZy0tO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzeW1ib2wgPSBwcmVFcnJvclN5bWJvbDtcbiAgICAgICAgICAgICAgcHJlRXJyb3JTeW1ib2wgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgbGVuID0gdGhpcy5wcm9kdWN0aW9uc19bYWN0aW9uWzFdXVsxXTtcbiAgICAgICAgICAgIHl5dmFsLiQgPSB2c3RhY2tbdnN0YWNrLmxlbmd0aCAtIGxlbl07XG4gICAgICAgICAgICB5eXZhbC5fJCA9IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5maXJzdF9saW5lLFxuICAgICAgICAgICAgICBsYXN0X2xpbmU6IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gMV0ubGFzdF9saW5lLFxuICAgICAgICAgICAgICBmaXJzdF9jb2x1bW46IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0uZmlyc3RfY29sdW1uLFxuICAgICAgICAgICAgICBsYXN0X2NvbHVtbjogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAxXS5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChyYW5nZXMpIHtcbiAgICAgICAgICAgICAgeXl2YWwuXyQucmFuZ2UgPSBbXG4gICAgICAgICAgICAgICAgbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5yYW5nZVswXSxcbiAgICAgICAgICAgICAgICBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIDFdLnJhbmdlWzFdXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByID0gdGhpcy5wZXJmb3JtQWN0aW9uLmFwcGx5KHl5dmFsLCBbXG4gICAgICAgICAgICAgIHl5dGV4dCxcbiAgICAgICAgICAgICAgeXlsZW5nLFxuICAgICAgICAgICAgICB5eWxpbmVubyxcbiAgICAgICAgICAgICAgc2hhcmVkU3RhdGUueXksXG4gICAgICAgICAgICAgIGFjdGlvblsxXSxcbiAgICAgICAgICAgICAgdnN0YWNrLFxuICAgICAgICAgICAgICBsc3RhY2tcbiAgICAgICAgICAgIF0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsZW4pIHtcbiAgICAgICAgICAgICAgc3RhY2sgPSBzdGFjay5zbGljZSgwLCAtMSAqIGxlbiAqIDIpO1xuICAgICAgICAgICAgICB2c3RhY2sgPSB2c3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgICBsc3RhY2sgPSBsc3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhY2sucHVzaCh0aGlzLnByb2R1Y3Rpb25zX1thY3Rpb25bMV1dWzBdKTtcbiAgICAgICAgICAgIHZzdGFjay5wdXNoKHl5dmFsLiQpO1xuICAgICAgICAgICAgbHN0YWNrLnB1c2goeXl2YWwuXyQpO1xuICAgICAgICAgICAgbmV3U3RhdGUgPSB0YWJsZVtzdGFja1tzdGFjay5sZW5ndGggLSAyXV1bc3RhY2tbc3RhY2subGVuZ3RoIC0gMV1dO1xuICAgICAgICAgICAgc3RhY2sucHVzaChuZXdTdGF0ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSwgXCJwYXJzZVwiKVxuICB9O1xuICB2YXIgbGV4ZXIgPSAvKiBAX19QVVJFX18gKi8gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZXhlcjIgPSB7XG4gICAgICBFT0Y6IDEsXG4gICAgICBwYXJzZUVycm9yOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBhcnNlRXJyb3Ioc3RyLCBoYXNoKSB7XG4gICAgICAgIGlmICh0aGlzLnl5LnBhcnNlcikge1xuICAgICAgICAgIHRoaXMueXkucGFyc2VyLnBhcnNlRXJyb3Ioc3RyLCBoYXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3RyKTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwYXJzZUVycm9yXCIpLFxuICAgICAgLy8gcmVzZXRzIHRoZSBsZXhlciwgc2V0cyBuZXcgaW5wdXRcbiAgICAgIHNldElucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGlucHV0LCB5eSkge1xuICAgICAgICB0aGlzLnl5ID0geXkgfHwgdGhpcy55eSB8fCB7fTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBpbnB1dDtcbiAgICAgICAgdGhpcy5fbW9yZSA9IHRoaXMuX2JhY2t0cmFjayA9IHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnl5bGluZW5vID0gdGhpcy55eWxlbmcgPSAwO1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2ggPSBcIlwiO1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrID0gW1wiSU5JVElBTFwiXTtcbiAgICAgICAgdGhpcy55eWxsb2MgPSB7XG4gICAgICAgICAgZmlyc3RfbGluZTogMSxcbiAgICAgICAgICBmaXJzdF9jb2x1bW46IDAsXG4gICAgICAgICAgbGFzdF9saW5lOiAxLFxuICAgICAgICAgIGxhc3RfY29sdW1uOiAwXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2UgPSBbMCwgMF07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vZmZzZXQgPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwic2V0SW5wdXRcIiksXG4gICAgICAvLyBjb25zdW1lcyBhbmQgcmV0dXJucyBvbmUgY2hhciBmcm9tIHRoZSBpbnB1dFxuICAgICAgaW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjaCA9IHRoaXMuX2lucHV0WzBdO1xuICAgICAgICB0aGlzLnl5dGV4dCArPSBjaDtcbiAgICAgICAgdGhpcy55eWxlbmcrKztcbiAgICAgICAgdGhpcy5vZmZzZXQrKztcbiAgICAgICAgdGhpcy5tYXRjaCArPSBjaDtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IGNoO1xuICAgICAgICB2YXIgbGluZXMgPSBjaC5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8rKztcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2xpbmUrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtbisrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2VbMV0rKztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pbnB1dCA9IHRoaXMuX2lucHV0LnNsaWNlKDEpO1xuICAgICAgICByZXR1cm4gY2g7XG4gICAgICB9LCBcImlucHV0XCIpLFxuICAgICAgLy8gdW5zaGlmdHMgb25lIGNoYXIgKG9yIGEgc3RyaW5nKSBpbnRvIHRoZSBpbnB1dFxuICAgICAgdW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oY2gpIHtcbiAgICAgICAgdmFyIGxlbiA9IGNoLmxlbmd0aDtcbiAgICAgICAgdmFyIGxpbmVzID0gY2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBjaCArIHRoaXMuX2lucHV0O1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMueXl0ZXh0LnN1YnN0cigwLCB0aGlzLnl5dGV4dC5sZW5ndGggLSBsZW4pO1xuICAgICAgICB0aGlzLm9mZnNldCAtPSBsZW47XG4gICAgICAgIHZhciBvbGRMaW5lcyA9IHRoaXMubWF0Y2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5tYXRjaCA9IHRoaXMubWF0Y2guc3Vic3RyKDAsIHRoaXMubWF0Y2gubGVuZ3RoIC0gMSk7XG4gICAgICAgIHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2hlZC5zdWJzdHIoMCwgdGhpcy5tYXRjaGVkLmxlbmd0aCAtIDEpO1xuICAgICAgICBpZiAobGluZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gLT0gbGluZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgciA9IHRoaXMueXlsbG9jLnJhbmdlO1xuICAgICAgICB0aGlzLnl5bGxvYyA9IHtcbiAgICAgICAgICBmaXJzdF9saW5lOiB0aGlzLnl5bGxvYy5maXJzdF9saW5lLFxuICAgICAgICAgIGxhc3RfbGluZTogdGhpcy55eWxpbmVubyArIDEsXG4gICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gKGxpbmVzLmxlbmd0aCA9PT0gb2xkTGluZXMubGVuZ3RoID8gdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uIDogMCkgKyBvbGRMaW5lc1tvbGRMaW5lcy5sZW5ndGggLSBsaW5lcy5sZW5ndGhdLmxlbmd0aCAtIGxpbmVzWzBdLmxlbmd0aCA6IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbiAtIGxlblxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlID0gW3JbMF0sIHJbMF0gKyB0aGlzLnl5bGVuZyAtIGxlbl07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy55eWxlbmcgPSB0aGlzLnl5dGV4dC5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJ1bnB1dFwiKSxcbiAgICAgIC8vIFdoZW4gY2FsbGVkIGZyb20gYWN0aW9uLCBjYWNoZXMgbWF0Y2hlZCB0ZXh0IGFuZCBhcHBlbmRzIGl0IG9uIG5leHQgYWN0aW9uXG4gICAgICBtb3JlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9tb3JlID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcIm1vcmVcIiksXG4gICAgICAvLyBXaGVuIGNhbGxlZCBmcm9tIGFjdGlvbiwgc2lnbmFscyB0aGUgbGV4ZXIgdGhhdCB0aGlzIHJ1bGUgZmFpbHMgdG8gbWF0Y2ggdGhlIGlucHV0LCBzbyB0aGUgbmV4dCBtYXRjaGluZyBydWxlIChyZWdleCkgc2hvdWxkIGJlIHRlc3RlZCBpbnN0ZWFkLlxuICAgICAgcmVqZWN0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2t0cmFja19sZXhlcikge1xuICAgICAgICAgIHRoaXMuX2JhY2t0cmFjayA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gWW91IGNhbiBvbmx5IGludm9rZSByZWplY3QoKSBpbiB0aGUgbGV4ZXIgd2hlbiB0aGUgbGV4ZXIgaXMgb2YgdGhlIGJhY2t0cmFja2luZyBwZXJzdWFzaW9uIChvcHRpb25zLmJhY2t0cmFja19sZXhlciA9IHRydWUpLlxcblwiICsgdGhpcy5zaG93UG9zaXRpb24oKSwge1xuICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgIHRva2VuOiBudWxsLFxuICAgICAgICAgICAgbGluZTogdGhpcy55eWxpbmVub1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJyZWplY3RcIiksXG4gICAgICAvLyByZXRhaW4gZmlyc3QgbiBjaGFyYWN0ZXJzIG9mIHRoZSBtYXRjaFxuICAgICAgbGVzczogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihuKSB7XG4gICAgICAgIHRoaXMudW5wdXQodGhpcy5tYXRjaC5zbGljZShuKSk7XG4gICAgICB9LCBcImxlc3NcIiksXG4gICAgICAvLyBkaXNwbGF5cyBhbHJlYWR5IG1hdGNoZWQgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICBwYXN0SW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwYXN0ID0gdGhpcy5tYXRjaGVkLnN1YnN0cigwLCB0aGlzLm1hdGNoZWQubGVuZ3RoIC0gdGhpcy5tYXRjaC5sZW5ndGgpO1xuICAgICAgICByZXR1cm4gKHBhc3QubGVuZ3RoID4gMjAgPyBcIi4uLlwiIDogXCJcIikgKyBwYXN0LnN1YnN0cigtMjApLnJlcGxhY2UoL1xcbi9nLCBcIlwiKTtcbiAgICAgIH0sIFwicGFzdElucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdXBjb21pbmcgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICB1cGNvbWluZ0lucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV4dCA9IHRoaXMubWF0Y2g7XG4gICAgICAgIGlmIChuZXh0Lmxlbmd0aCA8IDIwKSB7XG4gICAgICAgICAgbmV4dCArPSB0aGlzLl9pbnB1dC5zdWJzdHIoMCwgMjAgLSBuZXh0Lmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChuZXh0LnN1YnN0cigwLCAyMCkgKyAobmV4dC5sZW5ndGggPiAyMCA/IFwiLi4uXCIgOiBcIlwiKSkucmVwbGFjZSgvXFxuL2csIFwiXCIpO1xuICAgICAgfSwgXCJ1cGNvbWluZ0lucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdGhlIGNoYXJhY3RlciBwb3NpdGlvbiB3aGVyZSB0aGUgbGV4aW5nIGVycm9yIG9jY3VycmVkLCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgc2hvd1Bvc2l0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJlID0gdGhpcy5wYXN0SW5wdXQoKTtcbiAgICAgICAgdmFyIGMgPSBuZXcgQXJyYXkocHJlLmxlbmd0aCArIDEpLmpvaW4oXCItXCIpO1xuICAgICAgICByZXR1cm4gcHJlICsgdGhpcy51cGNvbWluZ0lucHV0KCkgKyBcIlxcblwiICsgYyArIFwiXlwiO1xuICAgICAgfSwgXCJzaG93UG9zaXRpb25cIiksXG4gICAgICAvLyB0ZXN0IHRoZSBsZXhlZCB0b2tlbjogcmV0dXJuIEZBTFNFIHdoZW4gbm90IGEgbWF0Y2gsIG90aGVyd2lzZSByZXR1cm4gdG9rZW5cbiAgICAgIHRlc3RfbWF0Y2g6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obWF0Y2gsIGluZGV4ZWRfcnVsZSkge1xuICAgICAgICB2YXIgdG9rZW4sIGxpbmVzLCBiYWNrdXA7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFja3RyYWNrX2xleGVyKSB7XG4gICAgICAgICAgYmFja3VwID0ge1xuICAgICAgICAgICAgeXlsaW5lbm86IHRoaXMueXlsaW5lbm8sXG4gICAgICAgICAgICB5eWxsb2M6IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogdGhpcy55eWxsb2MuZmlyc3RfbGluZSxcbiAgICAgICAgICAgICAgbGFzdF9saW5lOiB0aGlzLmxhc3RfbGluZSxcbiAgICAgICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgICAgIGxhc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHl5dGV4dDogdGhpcy55eXRleHQsXG4gICAgICAgICAgICBtYXRjaDogdGhpcy5tYXRjaCxcbiAgICAgICAgICAgIG1hdGNoZXM6IHRoaXMubWF0Y2hlcyxcbiAgICAgICAgICAgIG1hdGNoZWQ6IHRoaXMubWF0Y2hlZCxcbiAgICAgICAgICAgIHl5bGVuZzogdGhpcy55eWxlbmcsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgX21vcmU6IHRoaXMuX21vcmUsXG4gICAgICAgICAgICBfaW5wdXQ6IHRoaXMuX2lucHV0LFxuICAgICAgICAgICAgeXk6IHRoaXMueXksXG4gICAgICAgICAgICBjb25kaXRpb25TdGFjazogdGhpcy5jb25kaXRpb25TdGFjay5zbGljZSgwKSxcbiAgICAgICAgICAgIGRvbmU6IHRoaXMuZG9uZVxuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICAgIGJhY2t1cC55eWxsb2MucmFuZ2UgPSB0aGlzLnl5bGxvYy5yYW5nZS5zbGljZSgwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMgPSBtYXRjaFswXS5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gKz0gbGluZXMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueXlsbG9jID0ge1xuICAgICAgICAgIGZpcnN0X2xpbmU6IHRoaXMueXlsbG9jLmxhc3RfbGluZSxcbiAgICAgICAgICBsYXN0X2xpbmU6IHRoaXMueXlsaW5lbm8gKyAxLFxuICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubGVuZ3RoIC0gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubWF0Y2goL1xccj9cXG4/LylbMF0ubGVuZ3RoIDogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4gKyBtYXRjaFswXS5sZW5ndGhcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy55eXRleHQgKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2ggKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2hlcyA9IG1hdGNoO1xuICAgICAgICB0aGlzLnl5bGVuZyA9IHRoaXMueXl0ZXh0Lmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZSA9IFt0aGlzLm9mZnNldCwgdGhpcy5vZmZzZXQgKz0gdGhpcy55eWxlbmddO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX21vcmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fYmFja3RyYWNrID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2lucHV0ID0gdGhpcy5faW5wdXQuc2xpY2UobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IG1hdGNoWzBdO1xuICAgICAgICB0b2tlbiA9IHRoaXMucGVyZm9ybUFjdGlvbi5jYWxsKHRoaXMsIHRoaXMueXksIHRoaXMsIGluZGV4ZWRfcnVsZSwgdGhpcy5jb25kaXRpb25TdGFja1t0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgaWYgKHRoaXMuZG9uZSAmJiB0aGlzLl9pbnB1dCkge1xuICAgICAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9iYWNrdHJhY2spIHtcbiAgICAgICAgICBmb3IgKHZhciBrIGluIGJhY2t1cCkge1xuICAgICAgICAgICAgdGhpc1trXSA9IGJhY2t1cFtrXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sIFwidGVzdF9tYXRjaFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIGluIGlucHV0XG4gICAgICBuZXh0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuRU9GO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5faW5wdXQpIHtcbiAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0b2tlbiwgbWF0Y2gsIHRlbXBNYXRjaCwgaW5kZXg7XG4gICAgICAgIGlmICghdGhpcy5fbW9yZSkge1xuICAgICAgICAgIHRoaXMueXl0ZXh0ID0gXCJcIjtcbiAgICAgICAgICB0aGlzLm1hdGNoID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcnVsZXMgPSB0aGlzLl9jdXJyZW50UnVsZXMoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRlbXBNYXRjaCA9IHRoaXMuX2lucHV0Lm1hdGNoKHRoaXMucnVsZXNbcnVsZXNbaV1dKTtcbiAgICAgICAgICBpZiAodGVtcE1hdGNoICYmICghbWF0Y2ggfHwgdGVtcE1hdGNoWzBdLmxlbmd0aCA+IG1hdGNoWzBdLmxlbmd0aCkpIHtcbiAgICAgICAgICAgIG1hdGNoID0gdGVtcE1hdGNoO1xuICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIpIHtcbiAgICAgICAgICAgICAgdG9rZW4gPSB0aGlzLnRlc3RfbWF0Y2godGVtcE1hdGNoLCBydWxlc1tpXSk7XG4gICAgICAgICAgICAgIGlmICh0b2tlbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmFja3RyYWNrKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMub3B0aW9ucy5mbGV4KSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICB0b2tlbiA9IHRoaXMudGVzdF9tYXRjaChtYXRjaCwgcnVsZXNbaW5kZXhdKTtcbiAgICAgICAgICBpZiAodG9rZW4gIT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5faW5wdXQgPT09IFwiXCIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5FT0Y7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gVW5yZWNvZ25pemVkIHRleHQuXFxuXCIgKyB0aGlzLnNob3dQb3NpdGlvbigpLCB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgdG9rZW46IG51bGwsXG4gICAgICAgICAgICBsaW5lOiB0aGlzLnl5bGluZW5vXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibmV4dFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIHRoYXQgaGFzIGEgdG9rZW5cbiAgICAgIGxleDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBsZXgoKSB7XG4gICAgICAgIHZhciByID0gdGhpcy5uZXh0KCk7XG4gICAgICAgIGlmIChyKSB7XG4gICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubGV4KCk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibGV4XCIpLFxuICAgICAgLy8gYWN0aXZhdGVzIGEgbmV3IGxleGVyIGNvbmRpdGlvbiBzdGF0ZSAocHVzaGVzIHRoZSBuZXcgbGV4ZXIgY29uZGl0aW9uIHN0YXRlIG9udG8gdGhlIGNvbmRpdGlvbiBzdGFjaylcbiAgICAgIGJlZ2luOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGJlZ2luKGNvbmRpdGlvbikge1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrLnB1c2goY29uZGl0aW9uKTtcbiAgICAgIH0sIFwiYmVnaW5cIiksXG4gICAgICAvLyBwb3AgdGhlIHByZXZpb3VzbHkgYWN0aXZlIGxleGVyIGNvbmRpdGlvbiBzdGF0ZSBvZmYgdGhlIGNvbmRpdGlvbiBzdGFja1xuICAgICAgcG9wU3RhdGU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcG9wU3RhdGUoKSB7XG4gICAgICAgIHZhciBuID0gdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxO1xuICAgICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFjay5wb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1swXTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwb3BTdGF0ZVwiKSxcbiAgICAgIC8vIHByb2R1Y2UgdGhlIGxleGVyIHJ1bGUgc2V0IHdoaWNoIGlzIGFjdGl2ZSBmb3IgdGhlIGN1cnJlbnRseSBhY3RpdmUgbGV4ZXIgY29uZGl0aW9uIHN0YXRlXG4gICAgICBfY3VycmVudFJ1bGVzOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIF9jdXJyZW50UnVsZXMoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAmJiB0aGlzLmNvbmRpdGlvblN0YWNrW3RoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25zW3RoaXMuY29uZGl0aW9uU3RhY2tbdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxXV0ucnVsZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uc1tcIklOSVRJQUxcIl0ucnVsZXM7XG4gICAgICAgIH1cbiAgICAgIH0sIFwiX2N1cnJlbnRSdWxlc1wiKSxcbiAgICAgIC8vIHJldHVybiB0aGUgY3VycmVudGx5IGFjdGl2ZSBsZXhlciBjb25kaXRpb24gc3RhdGU7IHdoZW4gYW4gaW5kZXggYXJndW1lbnQgaXMgcHJvdmlkZWQgaXQgcHJvZHVjZXMgdGhlIE4tdGggcHJldmlvdXMgY29uZGl0aW9uIHN0YXRlLCBpZiBhdmFpbGFibGVcbiAgICAgIHRvcFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHRvcFN0YXRlKG4pIHtcbiAgICAgICAgbiA9IHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMSAtIE1hdGguYWJzKG4gfHwgMCk7XG4gICAgICAgIGlmIChuID49IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1tuXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gXCJJTklUSUFMXCI7XG4gICAgICAgIH1cbiAgICAgIH0sIFwidG9wU3RhdGVcIiksXG4gICAgICAvLyBhbGlhcyBmb3IgYmVnaW4oY29uZGl0aW9uKVxuICAgICAgcHVzaFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHB1c2hTdGF0ZShjb25kaXRpb24pIHtcbiAgICAgICAgdGhpcy5iZWdpbihjb25kaXRpb24pO1xuICAgICAgfSwgXCJwdXNoU3RhdGVcIiksXG4gICAgICAvLyByZXR1cm4gdGhlIG51bWJlciBvZiBzdGF0ZXMgY3VycmVudGx5IG9uIHRoZSBzdGFja1xuICAgICAgc3RhdGVTdGFja1NpemU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gc3RhdGVTdGFja1NpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aDtcbiAgICAgIH0sIFwic3RhdGVTdGFja1NpemVcIiksXG4gICAgICBvcHRpb25zOiB7fSxcbiAgICAgIHBlcmZvcm1BY3Rpb246IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gYW5vbnltb3VzKHl5LCB5eV8sICRhdm9pZGluZ19uYW1lX2NvbGxpc2lvbnMsIFlZX1NUQVJUKSB7XG4gICAgICAgIHZhciBZWVNUQVRFID0gWVlfU1RBUlQ7XG4gICAgICAgIHN3aXRjaCAoJGF2b2lkaW5nX25hbWVfY29sbGlzaW9ucykge1xuICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJhY2NfdGl0bGVcIik7XG4gICAgICAgICAgICByZXR1cm4gMzQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gXCJhY2NfdGl0bGVfdmFsdWVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJhY2NfZGVzY3JcIik7XG4gICAgICAgICAgICByZXR1cm4gMzY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gXCJhY2NfZGVzY3JfdmFsdWVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJhY2NfZGVzY3JfbXVsdGlsaW5lXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgcmV0dXJuIFwiYWNjX2Rlc2NyX211bHRpbGluZV92YWx1ZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJzaGFwZURhdGFcIik7XG4gICAgICAgICAgICB5eV8ueXl0ZXh0ID0gXCJcIjtcbiAgICAgICAgICAgIHJldHVybiA0MDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwic2hhcGVEYXRhU3RyXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDQwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIDQwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICAgIGNvbnN0IHJlID0gL1xcblxccyovZztcbiAgICAgICAgICAgIHl5Xy55eXRleHQgPSB5eV8ueXl0ZXh0LnJlcGxhY2UocmUsIFwiPGJyLz5cIik7XG4gICAgICAgICAgICByZXR1cm4gNDA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgICAgcmV0dXJuIDQwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiY2FsbGJhY2tuYW1lXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxNDpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiY2FsbGJhY2thcmdzXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgIHJldHVybiA5NTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE4OlxuICAgICAgICAgICAgcmV0dXJuIDk2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxOTpcbiAgICAgICAgICAgIHJldHVybiBcIk1EX1NUUlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyMDpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjE6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwibWRfc3RyaW5nXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyMjpcbiAgICAgICAgICAgIHJldHVybiBcIlNUUlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyMzpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjQ6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcInN0cmluZ1wiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjU6XG4gICAgICAgICAgICByZXR1cm4gODQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI2OlxuICAgICAgICAgICAgcmV0dXJuIDEwMjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjc6XG4gICAgICAgICAgICByZXR1cm4gODU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI4OlxuICAgICAgICAgICAgcmV0dXJuIDEwNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjk6XG4gICAgICAgICAgICByZXR1cm4gODY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDMwOlxuICAgICAgICAgICAgcmV0dXJuIDg3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzMTpcbiAgICAgICAgICAgIHJldHVybiA5NztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzI6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiY2xpY2tcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDMzOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNDpcbiAgICAgICAgICAgIHJldHVybiA4ODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzU6XG4gICAgICAgICAgICBpZiAoeXkubGV4LmZpcnN0R3JhcGgoKSkge1xuICAgICAgICAgICAgICB0aGlzLmJlZ2luKFwiZGlyXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDEyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNjpcbiAgICAgICAgICAgIGlmICh5eS5sZXguZmlyc3RHcmFwaCgpKSB7XG4gICAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJkaXJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gMTI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgICAgaWYgKHl5LmxleC5maXJzdEdyYXBoKCkpIHtcbiAgICAgICAgICAgICAgdGhpcy5iZWdpbihcImRpclwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAxMjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzg6XG4gICAgICAgICAgICByZXR1cm4gMjc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM5OlxuICAgICAgICAgICAgcmV0dXJuIDMyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0MDpcbiAgICAgICAgICAgIHJldHVybiA5ODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDE6XG4gICAgICAgICAgICByZXR1cm4gOTg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQyOlxuICAgICAgICAgICAgcmV0dXJuIDk4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0MzpcbiAgICAgICAgICAgIHJldHVybiA5ODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDQ6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gMTM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ1OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIDE0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0NjpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiAxNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDc6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gMTQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ4OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIDE0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0OTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiAxNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTA6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gMTQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDUxOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIDE0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1MjpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiAxNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTM6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gMTQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU0OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIDE0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1NTpcbiAgICAgICAgICAgIHJldHVybiAxMjE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU2OlxuICAgICAgICAgICAgcmV0dXJuIDEyMjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTc6XG4gICAgICAgICAgICByZXR1cm4gMTIzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1ODpcbiAgICAgICAgICAgIHJldHVybiAxMjQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU5OlxuICAgICAgICAgICAgcmV0dXJuIDEyNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjA6XG4gICAgICAgICAgICByZXR1cm4gNzg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDYxOlxuICAgICAgICAgICAgcmV0dXJuIDEwNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjI6XG4gICAgICAgICAgICByZXR1cm4gMTExO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2MzpcbiAgICAgICAgICAgIHJldHVybiA0NjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjQ6XG4gICAgICAgICAgICByZXR1cm4gNjA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDY1OlxuICAgICAgICAgICAgcmV0dXJuIDQ0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2NjpcbiAgICAgICAgICAgIHJldHVybiA4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2NzpcbiAgICAgICAgICAgIHJldHVybiAxMDY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDY4OlxuICAgICAgICAgICAgcmV0dXJuIDExNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjk6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gNzc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDcwOlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJlZGdlVGV4dFwiKTtcbiAgICAgICAgICAgIHJldHVybiA3NTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzE6XG4gICAgICAgICAgICByZXR1cm4gMTE5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3MjpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiA3NztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzM6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcInRoaWNrRWRnZVRleHRcIik7XG4gICAgICAgICAgICByZXR1cm4gNzU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDc0OlxuICAgICAgICAgICAgcmV0dXJuIDExOTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzU6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gNzc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDc2OlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJkb3R0ZWRFZGdlVGV4dFwiKTtcbiAgICAgICAgICAgIHJldHVybiA3NTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzc6XG4gICAgICAgICAgICByZXR1cm4gMTE5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3ODpcbiAgICAgICAgICAgIHJldHVybiA3NztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzk6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gNTM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDgwOlxuICAgICAgICAgICAgcmV0dXJuIFwiVEVYVFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4MTpcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiZWxsaXBzZVRleHRcIik7XG4gICAgICAgICAgICByZXR1cm4gNTI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDgyOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIDU1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4MzpcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwidGV4dFwiKTtcbiAgICAgICAgICAgIHJldHVybiA1NDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgODQ6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gNTc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDg1OlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJ0ZXh0XCIpO1xuICAgICAgICAgICAgcmV0dXJuIDU2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4NjpcbiAgICAgICAgICAgIHJldHVybiA1ODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgODc6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcInRleHRcIik7XG4gICAgICAgICAgICByZXR1cm4gNjc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDg4OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIDY0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4OTpcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwidGV4dFwiKTtcbiAgICAgICAgICAgIHJldHVybiA2MztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTA6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gNDk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDkxOlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJ0ZXh0XCIpO1xuICAgICAgICAgICAgcmV0dXJuIDQ4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA5MjpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiA2OTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTM6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gNzE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDk0OlxuICAgICAgICAgICAgcmV0dXJuIDExNztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTU6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcInRyYXBUZXh0XCIpO1xuICAgICAgICAgICAgcmV0dXJuIDY4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA5NjpcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwidHJhcFRleHRcIik7XG4gICAgICAgICAgICByZXR1cm4gNzA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDk3OlxuICAgICAgICAgICAgcmV0dXJuIDExODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTg6XG4gICAgICAgICAgICByZXR1cm4gNjc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDk5OlxuICAgICAgICAgICAgcmV0dXJuIDkwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMDA6XG4gICAgICAgICAgICByZXR1cm4gXCJTRVBcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTAxOlxuICAgICAgICAgICAgcmV0dXJuIDg5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMDI6XG4gICAgICAgICAgICByZXR1cm4gMTE1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMDM6XG4gICAgICAgICAgICByZXR1cm4gMTExO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMDQ6XG4gICAgICAgICAgICByZXR1cm4gNDQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEwNTpcbiAgICAgICAgICAgIHJldHVybiAxMDk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEwNjpcbiAgICAgICAgICAgIHJldHVybiAxMTQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEwNzpcbiAgICAgICAgICAgIHJldHVybiAxMTY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEwODpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiA2MjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTA5OlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJ0ZXh0XCIpO1xuICAgICAgICAgICAgcmV0dXJuIDYyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMTA6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gNTE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDExMTpcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwidGV4dFwiKTtcbiAgICAgICAgICAgIHJldHVybiA1MDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTEyOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIDMxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMTM6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcInRleHRcIik7XG4gICAgICAgICAgICByZXR1cm4gMjk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDExNDpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiA2NjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTE1OlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJ0ZXh0XCIpO1xuICAgICAgICAgICAgcmV0dXJuIDY1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMTY6XG4gICAgICAgICAgICByZXR1cm4gXCJURVhUXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDExNzpcbiAgICAgICAgICAgIHJldHVybiBcIlFVT1RFXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDExODpcbiAgICAgICAgICAgIHJldHVybiA5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMTk6XG4gICAgICAgICAgICByZXR1cm4gMTA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEyMDpcbiAgICAgICAgICAgIHJldHVybiAxMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9LCBcImFub255bW91c1wiKSxcbiAgICAgIHJ1bGVzOiBbL14oPzphY2NUaXRsZVxccyo6XFxzKikvLCAvXig/Oig/IVxcbnx8KSpbXlxcbl0qKS8sIC9eKD86YWNjRGVzY3JcXHMqOlxccyopLywgL14oPzooPyFcXG58fCkqW15cXG5dKikvLCAvXig/OmFjY0Rlc2NyXFxzKlxce1xccyopLywgL14oPzpbXFx9XSkvLCAvXig/OlteXFx9XSopLywgL14oPzpAXFx7KS8sIC9eKD86W1wiXSkvLCAvXig/OltcIl0pLywgL14oPzpbXlxcXCJdKykvLCAvXig/OltefV5cIl0rKS8sIC9eKD86XFx9KS8sIC9eKD86Y2FsbFtcXHNdKykvLCAvXig/OlxcKFtcXHNdKlxcKSkvLCAvXig/OlxcKCkvLCAvXig/OlteKF0qKS8sIC9eKD86XFwpKS8sIC9eKD86W14pXSopLywgL14oPzpbXmBcIl0rKS8sIC9eKD86W2BdW1wiXSkvLCAvXig/OltcIl1bYF0pLywgL14oPzpbXlwiXSspLywgL14oPzpbXCJdKS8sIC9eKD86W1wiXSkvLCAvXig/OnN0eWxlXFxiKS8sIC9eKD86ZGVmYXVsdFxcYikvLCAvXig/OmxpbmtTdHlsZVxcYikvLCAvXig/OmludGVycG9sYXRlXFxiKS8sIC9eKD86Y2xhc3NEZWZcXGIpLywgL14oPzpjbGFzc1xcYikvLCAvXig/OmhyZWZbXFxzXSkvLCAvXig/OmNsaWNrW1xcc10rKS8sIC9eKD86W1xcc1xcbl0pLywgL14oPzpbXlxcc1xcbl0qKS8sIC9eKD86Zmxvd2NoYXJ0LWVsa1xcYikvLCAvXig/OmdyYXBoXFxiKS8sIC9eKD86Zmxvd2NoYXJ0XFxiKS8sIC9eKD86c3ViZ3JhcGhcXGIpLywgL14oPzplbmRcXGJcXHMqKS8sIC9eKD86X3NlbGZcXGIpLywgL14oPzpfYmxhbmtcXGIpLywgL14oPzpfcGFyZW50XFxiKS8sIC9eKD86X3RvcFxcYikvLCAvXig/OihcXHI/XFxuKSpcXHMqXFxuKS8sIC9eKD86XFxzKkxSXFxiKS8sIC9eKD86XFxzKlJMXFxiKS8sIC9eKD86XFxzKlRCXFxiKS8sIC9eKD86XFxzKkJUXFxiKS8sIC9eKD86XFxzKlREXFxiKS8sIC9eKD86XFxzKkJSXFxiKS8sIC9eKD86XFxzKjwpLywgL14oPzpcXHMqPikvLCAvXig/OlxccypcXF4pLywgL14oPzpcXHMqdlxcYikvLCAvXig/Oi4qZGlyZWN0aW9uXFxzK1RCW15cXG5dKikvLCAvXig/Oi4qZGlyZWN0aW9uXFxzK0JUW15cXG5dKikvLCAvXig/Oi4qZGlyZWN0aW9uXFxzK1JMW15cXG5dKikvLCAvXig/Oi4qZGlyZWN0aW9uXFxzK0xSW15cXG5dKikvLCAvXig/Oi4qZGlyZWN0aW9uXFxzK1REW15cXG5dKikvLCAvXig/OlteXFxzXFxcIl0rQCg/PVteXFx7XFxcIl0pKS8sIC9eKD86WzAtOV0rKS8sIC9eKD86IykvLCAvXig/Ojo6OikvLCAvXig/OjopLywgL14oPzomKS8sIC9eKD86OykvLCAvXig/OiwpLywgL14oPzpcXCopLywgL14oPzpcXHMqW3hvPF0/LS0rWy14bz5dXFxzKikvLCAvXig/OlxccypbeG88XT8tLVxccyopLywgL14oPzpbXi1dfC0oPyEtKSspLywgL14oPzpcXHMqW3hvPF0/PT0rWz14bz5dXFxzKikvLCAvXig/OlxccypbeG88XT89PVxccyopLywgL14oPzpbXj1dfD0oPyEpKS8sIC9eKD86XFxzKlt4bzxdPy0/XFwuKy1beG8+XT9cXHMqKS8sIC9eKD86XFxzKlt4bzxdPy1cXC5cXHMqKS8sIC9eKD86W15cXC5dfFxcLig/ISkpLywgL14oPzpcXHMqfn5bXFx+XStcXHMqKS8sIC9eKD86Wy0vXFwpXVtcXCldKS8sIC9eKD86W15cXChcXClcXFtcXF1cXHtcXH1dfCFcXCkrKS8sIC9eKD86XFwoLSkvLCAvXig/OlxcXVxcKSkvLCAvXig/OlxcKFxcWykvLCAvXig/OlxcXVxcXSkvLCAvXig/OlxcW1xcWykvLCAvXig/OlxcW1xcfCkvLCAvXig/Oj4pLywgL14oPzpcXClcXF0pLywgL14oPzpcXFtcXCgpLywgL14oPzpcXClcXClcXCkpLywgL14oPzpcXChcXChcXCgpLywgL14oPzpbXFxcXCg/PVxcXSldW1xcXV0pLywgL14oPzpcXC8oPz1cXF0pXFxdKS8sIC9eKD86XFwvKD8hXFxdKXxcXFxcKD8hXFxdKXxbXlxcXFxcXFtcXF1cXChcXClcXHtcXH1cXC9dKykvLCAvXig/OlxcW1xcLykvLCAvXig/OlxcW1xcXFwpLywgL14oPzo8KS8sIC9eKD86PikvLCAvXig/OlxcXikvLCAvXig/OlxcXFxcXHwpLywgL14oPzp2XFxiKS8sIC9eKD86XFwqKS8sIC9eKD86IykvLCAvXig/OiYpLywgL14oPzooW0EtWmEtejAtOSFcIlxcIyQlJicqK1xcLmA/XFxcXF9cXC9dfC0oPz1bXlxcPlxcLVxcLl0pfCg/ISkpKykvLCAvXig/Oi0pLywgL14oPzpbXFx1MDBBQVxcdTAwQjVcXHUwMEJBXFx1MDBDMC1cXHUwMEQ2XFx1MDBEOC1cXHUwMEY2XXxbXFx1MDBGOC1cXHUwMkMxXFx1MDJDNi1cXHUwMkQxXFx1MDJFMC1cXHUwMkU0XFx1MDJFQ1xcdTAyRUVcXHUwMzcwLVxcdTAzNzRcXHUwMzc2XFx1MDM3N118W1xcdTAzN0EtXFx1MDM3RFxcdTAzODZcXHUwMzg4LVxcdTAzOEFcXHUwMzhDXFx1MDM4RS1cXHUwM0ExXFx1MDNBMy1cXHUwM0Y1XXxbXFx1MDNGNy1cXHUwNDgxXFx1MDQ4QS1cXHUwNTI3XFx1MDUzMS1cXHUwNTU2XFx1MDU1OVxcdTA1NjEtXFx1MDU4N1xcdTA1RDAtXFx1MDVFQV18W1xcdTA1RjAtXFx1MDVGMlxcdTA2MjAtXFx1MDY0QVxcdTA2NkVcXHUwNjZGXFx1MDY3MS1cXHUwNkQzXFx1MDZENVxcdTA2RTVcXHUwNkU2XFx1MDZFRV18W1xcdTA2RUZcXHUwNkZBLVxcdTA2RkNcXHUwNkZGXFx1MDcxMFxcdTA3MTItXFx1MDcyRlxcdTA3NEQtXFx1MDdBNVxcdTA3QjFcXHUwN0NBLVxcdTA3RUFdfFtcXHUwN0Y0XFx1MDdGNVxcdTA3RkFcXHUwODAwLVxcdTA4MTVcXHUwODFBXFx1MDgyNFxcdTA4MjhcXHUwODQwLVxcdTA4NThcXHUwOEEwXXxbXFx1MDhBMi1cXHUwOEFDXFx1MDkwNC1cXHUwOTM5XFx1MDkzRFxcdTA5NTBcXHUwOTU4LVxcdTA5NjFcXHUwOTcxLVxcdTA5NzddfFtcXHUwOTc5LVxcdTA5N0ZcXHUwOTg1LVxcdTA5OENcXHUwOThGXFx1MDk5MFxcdTA5OTMtXFx1MDlBOFxcdTA5QUEtXFx1MDlCMFxcdTA5QjJdfFtcXHUwOUI2LVxcdTA5QjlcXHUwOUJEXFx1MDlDRVxcdTA5RENcXHUwOUREXFx1MDlERi1cXHUwOUUxXFx1MDlGMFxcdTA5RjFcXHUwQTA1LVxcdTBBMEFdfFtcXHUwQTBGXFx1MEExMFxcdTBBMTMtXFx1MEEyOFxcdTBBMkEtXFx1MEEzMFxcdTBBMzJcXHUwQTMzXFx1MEEzNVxcdTBBMzZcXHUwQTM4XFx1MEEzOV18W1xcdTBBNTktXFx1MEE1Q1xcdTBBNUVcXHUwQTcyLVxcdTBBNzRcXHUwQTg1LVxcdTBBOERcXHUwQThGLVxcdTBBOTFcXHUwQTkzLVxcdTBBQThdfFtcXHUwQUFBLVxcdTBBQjBcXHUwQUIyXFx1MEFCM1xcdTBBQjUtXFx1MEFCOVxcdTBBQkRcXHUwQUQwXFx1MEFFMFxcdTBBRTFcXHUwQjA1LVxcdTBCMENdfFtcXHUwQjBGXFx1MEIxMFxcdTBCMTMtXFx1MEIyOFxcdTBCMkEtXFx1MEIzMFxcdTBCMzJcXHUwQjMzXFx1MEIzNS1cXHUwQjM5XFx1MEIzRFxcdTBCNUNdfFtcXHUwQjVEXFx1MEI1Ri1cXHUwQjYxXFx1MEI3MVxcdTBCODNcXHUwQjg1LVxcdTBCOEFcXHUwQjhFLVxcdTBCOTBcXHUwQjkyLVxcdTBCOTVcXHUwQjk5XXxbXFx1MEI5QVxcdTBCOUNcXHUwQjlFXFx1MEI5RlxcdTBCQTNcXHUwQkE0XFx1MEJBOC1cXHUwQkFBXFx1MEJBRS1cXHUwQkI5XFx1MEJEMF18W1xcdTBDMDUtXFx1MEMwQ1xcdTBDMEUtXFx1MEMxMFxcdTBDMTItXFx1MEMyOFxcdTBDMkEtXFx1MEMzM1xcdTBDMzUtXFx1MEMzOVxcdTBDM0RdfFtcXHUwQzU4XFx1MEM1OVxcdTBDNjBcXHUwQzYxXFx1MEM4NS1cXHUwQzhDXFx1MEM4RS1cXHUwQzkwXFx1MEM5Mi1cXHUwQ0E4XFx1MENBQS1cXHUwQ0IzXXxbXFx1MENCNS1cXHUwQ0I5XFx1MENCRFxcdTBDREVcXHUwQ0UwXFx1MENFMVxcdTBDRjFcXHUwQ0YyXFx1MEQwNS1cXHUwRDBDXFx1MEQwRS1cXHUwRDEwXXxbXFx1MEQxMi1cXHUwRDNBXFx1MEQzRFxcdTBENEVcXHUwRDYwXFx1MEQ2MVxcdTBEN0EtXFx1MEQ3RlxcdTBEODUtXFx1MEQ5NlxcdTBEOUEtXFx1MERCMV18W1xcdTBEQjMtXFx1MERCQlxcdTBEQkRcXHUwREMwLVxcdTBEQzZcXHUwRTAxLVxcdTBFMzBcXHUwRTMyXFx1MEUzM1xcdTBFNDAtXFx1MEU0NlxcdTBFODFdfFtcXHUwRTgyXFx1MEU4NFxcdTBFODdcXHUwRTg4XFx1MEU4QVxcdTBFOERcXHUwRTk0LVxcdTBFOTdcXHUwRTk5LVxcdTBFOUZcXHUwRUExLVxcdTBFQTNdfFtcXHUwRUE1XFx1MEVBN1xcdTBFQUFcXHUwRUFCXFx1MEVBRC1cXHUwRUIwXFx1MEVCMlxcdTBFQjNcXHUwRUJEXFx1MEVDMC1cXHUwRUM0XFx1MEVDNl18W1xcdTBFREMtXFx1MEVERlxcdTBGMDBcXHUwRjQwLVxcdTBGNDdcXHUwRjQ5LVxcdTBGNkNcXHUwRjg4LVxcdTBGOENcXHUxMDAwLVxcdTEwMkFdfFtcXHUxMDNGXFx1MTA1MC1cXHUxMDU1XFx1MTA1QS1cXHUxMDVEXFx1MTA2MVxcdTEwNjVcXHUxMDY2XFx1MTA2RS1cXHUxMDcwXFx1MTA3NS1cXHUxMDgxXXxbXFx1MTA4RVxcdTEwQTAtXFx1MTBDNVxcdTEwQzdcXHUxMENEXFx1MTBEMC1cXHUxMEZBXFx1MTBGQy1cXHUxMjQ4XFx1MTI0QS1cXHUxMjREXXxbXFx1MTI1MC1cXHUxMjU2XFx1MTI1OFxcdTEyNUEtXFx1MTI1RFxcdTEyNjAtXFx1MTI4OFxcdTEyOEEtXFx1MTI4RFxcdTEyOTAtXFx1MTJCMF18W1xcdTEyQjItXFx1MTJCNVxcdTEyQjgtXFx1MTJCRVxcdTEyQzBcXHUxMkMyLVxcdTEyQzVcXHUxMkM4LVxcdTEyRDZcXHUxMkQ4LVxcdTEzMTBdfFtcXHUxMzEyLVxcdTEzMTVcXHUxMzE4LVxcdTEzNUFcXHUxMzgwLVxcdTEzOEZcXHUxM0EwLVxcdTEzRjRcXHUxNDAxLVxcdTE2NkNdfFtcXHUxNjZGLVxcdTE2N0ZcXHUxNjgxLVxcdTE2OUFcXHUxNkEwLVxcdTE2RUFcXHUxNzAwLVxcdTE3MENcXHUxNzBFLVxcdTE3MTFdfFtcXHUxNzIwLVxcdTE3MzFcXHUxNzQwLVxcdTE3NTFcXHUxNzYwLVxcdTE3NkNcXHUxNzZFLVxcdTE3NzBcXHUxNzgwLVxcdTE3QjNcXHUxN0Q3XXxbXFx1MTdEQ1xcdTE4MjAtXFx1MTg3N1xcdTE4ODAtXFx1MThBOFxcdTE4QUFcXHUxOEIwLVxcdTE4RjVcXHUxOTAwLVxcdTE5MUNdfFtcXHUxOTUwLVxcdTE5NkRcXHUxOTcwLVxcdTE5NzRcXHUxOTgwLVxcdTE5QUJcXHUxOUMxLVxcdTE5QzdcXHUxQTAwLVxcdTFBMTZdfFtcXHUxQTIwLVxcdTFBNTRcXHUxQUE3XFx1MUIwNS1cXHUxQjMzXFx1MUI0NS1cXHUxQjRCXFx1MUI4My1cXHUxQkEwXFx1MUJBRVxcdTFCQUZdfFtcXHUxQkJBLVxcdTFCRTVcXHUxQzAwLVxcdTFDMjNcXHUxQzRELVxcdTFDNEZcXHUxQzVBLVxcdTFDN0RcXHUxQ0U5LVxcdTFDRUNdfFtcXHUxQ0VFLVxcdTFDRjFcXHUxQ0Y1XFx1MUNGNlxcdTFEMDAtXFx1MURCRlxcdTFFMDAtXFx1MUYxNVxcdTFGMTgtXFx1MUYxRF18W1xcdTFGMjAtXFx1MUY0NVxcdTFGNDgtXFx1MUY0RFxcdTFGNTAtXFx1MUY1N1xcdTFGNTlcXHUxRjVCXFx1MUY1RFxcdTFGNUYtXFx1MUY3RF18W1xcdTFGODAtXFx1MUZCNFxcdTFGQjYtXFx1MUZCQ1xcdTFGQkVcXHUxRkMyLVxcdTFGQzRcXHUxRkM2LVxcdTFGQ0NcXHUxRkQwLVxcdTFGRDNdfFtcXHUxRkQ2LVxcdTFGREJcXHUxRkUwLVxcdTFGRUNcXHUxRkYyLVxcdTFGRjRcXHUxRkY2LVxcdTFGRkNcXHUyMDcxXFx1MjA3Rl18W1xcdTIwOTAtXFx1MjA5Q1xcdTIxMDJcXHUyMTA3XFx1MjEwQS1cXHUyMTEzXFx1MjExNVxcdTIxMTktXFx1MjExRFxcdTIxMjRcXHUyMTI2XFx1MjEyOF18W1xcdTIxMkEtXFx1MjEyRFxcdTIxMkYtXFx1MjEzOVxcdTIxM0MtXFx1MjEzRlxcdTIxNDUtXFx1MjE0OVxcdTIxNEVcXHUyMTgzXFx1MjE4NF18W1xcdTJDMDAtXFx1MkMyRVxcdTJDMzAtXFx1MkM1RVxcdTJDNjAtXFx1MkNFNFxcdTJDRUItXFx1MkNFRVxcdTJDRjJcXHUyQ0YzXXxbXFx1MkQwMC1cXHUyRDI1XFx1MkQyN1xcdTJEMkRcXHUyRDMwLVxcdTJENjdcXHUyRDZGXFx1MkQ4MC1cXHUyRDk2XFx1MkRBMC1cXHUyREE2XXxbXFx1MkRBOC1cXHUyREFFXFx1MkRCMC1cXHUyREI2XFx1MkRCOC1cXHUyREJFXFx1MkRDMC1cXHUyREM2XFx1MkRDOC1cXHUyRENFXXxbXFx1MkREMC1cXHUyREQ2XFx1MkREOC1cXHUyRERFXFx1MkUyRlxcdTMwMDVcXHUzMDA2XFx1MzAzMS1cXHUzMDM1XFx1MzAzQlxcdTMwM0NdfFtcXHUzMDQxLVxcdTMwOTZcXHUzMDlELVxcdTMwOUZcXHUzMEExLVxcdTMwRkFcXHUzMEZDLVxcdTMwRkZcXHUzMTA1LVxcdTMxMkRdfFtcXHUzMTMxLVxcdTMxOEVcXHUzMUEwLVxcdTMxQkFcXHUzMUYwLVxcdTMxRkZcXHUzNDAwLVxcdTREQjVcXHU0RTAwLVxcdTlGQ0NdfFtcXHVBMDAwLVxcdUE0OENcXHVBNEQwLVxcdUE0RkRcXHVBNTAwLVxcdUE2MENcXHVBNjEwLVxcdUE2MUZcXHVBNjJBXFx1QTYyQl18W1xcdUE2NDAtXFx1QTY2RVxcdUE2N0YtXFx1QTY5N1xcdUE2QTAtXFx1QTZFNVxcdUE3MTctXFx1QTcxRlxcdUE3MjItXFx1QTc4OF18W1xcdUE3OEItXFx1QTc4RVxcdUE3OTAtXFx1QTc5M1xcdUE3QTAtXFx1QTdBQVxcdUE3RjgtXFx1QTgwMVxcdUE4MDMtXFx1QTgwNV18W1xcdUE4MDctXFx1QTgwQVxcdUE4MEMtXFx1QTgyMlxcdUE4NDAtXFx1QTg3M1xcdUE4ODItXFx1QThCM1xcdUE4RjItXFx1QThGN1xcdUE4RkJdfFtcXHVBOTBBLVxcdUE5MjVcXHVBOTMwLVxcdUE5NDZcXHVBOTYwLVxcdUE5N0NcXHVBOTg0LVxcdUE5QjJcXHVBOUNGXFx1QUEwMC1cXHVBQTI4XXxbXFx1QUE0MC1cXHVBQTQyXFx1QUE0NC1cXHVBQTRCXFx1QUE2MC1cXHVBQTc2XFx1QUE3QVxcdUFBODAtXFx1QUFBRlxcdUFBQjFcXHVBQUI1XXxbXFx1QUFCNlxcdUFBQjktXFx1QUFCRFxcdUFBQzBcXHVBQUMyXFx1QUFEQi1cXHVBQUREXFx1QUFFMC1cXHVBQUVBXFx1QUFGMi1cXHVBQUY0XXxbXFx1QUIwMS1cXHVBQjA2XFx1QUIwOS1cXHVBQjBFXFx1QUIxMS1cXHVBQjE2XFx1QUIyMC1cXHVBQjI2XFx1QUIyOC1cXHVBQjJFXXxbXFx1QUJDMC1cXHVBQkUyXFx1QUMwMC1cXHVEN0EzXFx1RDdCMC1cXHVEN0M2XFx1RDdDQi1cXHVEN0ZCXFx1RjkwMC1cXHVGQTZEXXxbXFx1RkE3MC1cXHVGQUQ5XFx1RkIwMC1cXHVGQjA2XFx1RkIxMy1cXHVGQjE3XFx1RkIxRFxcdUZCMUYtXFx1RkIyOFxcdUZCMkEtXFx1RkIzNl18W1xcdUZCMzgtXFx1RkIzQ1xcdUZCM0VcXHVGQjQwXFx1RkI0MVxcdUZCNDNcXHVGQjQ0XFx1RkI0Ni1cXHVGQkIxXFx1RkJEMy1cXHVGRDNEXXxbXFx1RkQ1MC1cXHVGRDhGXFx1RkQ5Mi1cXHVGREM3XFx1RkRGMC1cXHVGREZCXFx1RkU3MC1cXHVGRTc0XFx1RkU3Ni1cXHVGRUZDXXxbXFx1RkYyMS1cXHVGRjNBXFx1RkY0MS1cXHVGRjVBXFx1RkY2Ni1cXHVGRkJFXFx1RkZDMi1cXHVGRkM3XFx1RkZDQS1cXHVGRkNGXXxbXFx1RkZEMi1cXHVGRkQ3XFx1RkZEQS1cXHVGRkRDXSkvLCAvXig/OlxcfCkvLCAvXig/OlxcfCkvLCAvXig/OlxcKSkvLCAvXig/OlxcKCkvLCAvXig/OlxcXSkvLCAvXig/OlxcWykvLCAvXig/OihcXH0pKS8sIC9eKD86XFx7KS8sIC9eKD86W15cXFtcXF1cXChcXClcXHtcXH1cXHxcXFwiXSspLywgL14oPzpcIikvLCAvXig/OihcXHI/XFxuKSspLywgL14oPzpcXHMpLywgL14oPzokKS9dLFxuICAgICAgY29uZGl0aW9uczogeyBcInNoYXBlRGF0YUVuZEJyYWNrZXRcIjogeyBcInJ1bGVzXCI6IFsyMSwgMjQsIDc4LCA4MSwgODMsIDg1LCA4OSwgOTEsIDk1LCA5NiwgMTA5LCAxMTEsIDExMywgMTE1XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJzaGFwZURhdGFTdHJcIjogeyBcInJ1bGVzXCI6IFs5LCAxMCwgMjEsIDI0LCA3OCwgODEsIDgzLCA4NSwgODksIDkxLCA5NSwgOTYsIDEwOSwgMTExLCAxMTMsIDExNV0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwic2hhcGVEYXRhXCI6IHsgXCJydWxlc1wiOiBbOCwgMTEsIDEyLCAyMSwgMjQsIDc4LCA4MSwgODMsIDg1LCA4OSwgOTEsIDk1LCA5NiwgMTA5LCAxMTEsIDExMywgMTE1XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJjYWxsYmFja2FyZ3NcIjogeyBcInJ1bGVzXCI6IFsxNywgMTgsIDIxLCAyNCwgNzgsIDgxLCA4MywgODUsIDg5LCA5MSwgOTUsIDk2LCAxMDksIDExMSwgMTEzLCAxMTVdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImNhbGxiYWNrbmFtZVwiOiB7IFwicnVsZXNcIjogWzE0LCAxNSwgMTYsIDIxLCAyNCwgNzgsIDgxLCA4MywgODUsIDg5LCA5MSwgOTUsIDk2LCAxMDksIDExMSwgMTEzLCAxMTVdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImhyZWZcIjogeyBcInJ1bGVzXCI6IFsyMSwgMjQsIDc4LCA4MSwgODMsIDg1LCA4OSwgOTEsIDk1LCA5NiwgMTA5LCAxMTEsIDExMywgMTE1XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJjbGlja1wiOiB7IFwicnVsZXNcIjogWzIxLCAyNCwgMzMsIDM0LCA3OCwgODEsIDgzLCA4NSwgODksIDkxLCA5NSwgOTYsIDEwOSwgMTExLCAxMTMsIDExNV0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiZG90dGVkRWRnZVRleHRcIjogeyBcInJ1bGVzXCI6IFsyMSwgMjQsIDc1LCA3NywgNzgsIDgxLCA4MywgODUsIDg5LCA5MSwgOTUsIDk2LCAxMDksIDExMSwgMTEzLCAxMTVdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcInRoaWNrRWRnZVRleHRcIjogeyBcInJ1bGVzXCI6IFsyMSwgMjQsIDcyLCA3NCwgNzgsIDgxLCA4MywgODUsIDg5LCA5MSwgOTUsIDk2LCAxMDksIDExMSwgMTEzLCAxMTVdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImVkZ2VUZXh0XCI6IHsgXCJydWxlc1wiOiBbMjEsIDI0LCA2OSwgNzEsIDc4LCA4MSwgODMsIDg1LCA4OSwgOTEsIDk1LCA5NiwgMTA5LCAxMTEsIDExMywgMTE1XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJ0cmFwVGV4dFwiOiB7IFwicnVsZXNcIjogWzIxLCAyNCwgNzgsIDgxLCA4MywgODUsIDg5LCA5MSwgOTIsIDkzLCA5NCwgOTUsIDk2LCAxMDksIDExMSwgMTEzLCAxMTVdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImVsbGlwc2VUZXh0XCI6IHsgXCJydWxlc1wiOiBbMjEsIDI0LCA3OCwgNzksIDgwLCA4MSwgODMsIDg1LCA4OSwgOTEsIDk1LCA5NiwgMTA5LCAxMTEsIDExMywgMTE1XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJ0ZXh0XCI6IHsgXCJydWxlc1wiOiBbMjEsIDI0LCA3OCwgODEsIDgyLCA4MywgODQsIDg1LCA4OCwgODksIDkwLCA5MSwgOTUsIDk2LCAxMDgsIDEwOSwgMTEwLCAxMTEsIDExMiwgMTEzLCAxMTQsIDExNSwgMTE2XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJ2ZXJ0ZXhcIjogeyBcInJ1bGVzXCI6IFsyMSwgMjQsIDc4LCA4MSwgODMsIDg1LCA4OSwgOTEsIDk1LCA5NiwgMTA5LCAxMTEsIDExMywgMTE1XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJkaXJcIjogeyBcInJ1bGVzXCI6IFsyMSwgMjQsIDQ0LCA0NSwgNDYsIDQ3LCA0OCwgNDksIDUwLCA1MSwgNTIsIDUzLCA1NCwgNzgsIDgxLCA4MywgODUsIDg5LCA5MSwgOTUsIDk2LCAxMDksIDExMSwgMTEzLCAxMTVdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImFjY19kZXNjcl9tdWx0aWxpbmVcIjogeyBcInJ1bGVzXCI6IFs1LCA2LCAyMSwgMjQsIDc4LCA4MSwgODMsIDg1LCA4OSwgOTEsIDk1LCA5NiwgMTA5LCAxMTEsIDExMywgMTE1XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJhY2NfZGVzY3JcIjogeyBcInJ1bGVzXCI6IFszLCAyMSwgMjQsIDc4LCA4MSwgODMsIDg1LCA4OSwgOTEsIDk1LCA5NiwgMTA5LCAxMTEsIDExMywgMTE1XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJhY2NfdGl0bGVcIjogeyBcInJ1bGVzXCI6IFsxLCAyMSwgMjQsIDc4LCA4MSwgODMsIDg1LCA4OSwgOTEsIDk1LCA5NiwgMTA5LCAxMTEsIDExMywgMTE1XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJtZF9zdHJpbmdcIjogeyBcInJ1bGVzXCI6IFsxOSwgMjAsIDIxLCAyNCwgNzgsIDgxLCA4MywgODUsIDg5LCA5MSwgOTUsIDk2LCAxMDksIDExMSwgMTEzLCAxMTVdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcInN0cmluZ1wiOiB7IFwicnVsZXNcIjogWzIxLCAyMiwgMjMsIDI0LCA3OCwgODEsIDgzLCA4NSwgODksIDkxLCA5NSwgOTYsIDEwOSwgMTExLCAxMTMsIDExNV0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiSU5JVElBTFwiOiB7IFwicnVsZXNcIjogWzAsIDIsIDQsIDcsIDEzLCAyMSwgMjQsIDI1LCAyNiwgMjcsIDI4LCAyOSwgMzAsIDMxLCAzMiwgMzUsIDM2LCAzNywgMzgsIDM5LCA0MCwgNDEsIDQyLCA0MywgNTUsIDU2LCA1NywgNTgsIDU5LCA2MCwgNjEsIDYyLCA2MywgNjQsIDY1LCA2NiwgNjcsIDY4LCA2OSwgNzAsIDcyLCA3MywgNzUsIDc2LCA3OCwgODEsIDgzLCA4NSwgODYsIDg3LCA4OSwgOTEsIDk1LCA5NiwgOTcsIDk4LCA5OSwgMTAwLCAxMDEsIDEwMiwgMTAzLCAxMDQsIDEwNSwgMTA2LCAxMDcsIDEwOSwgMTExLCAxMTMsIDExNSwgMTE3LCAxMTgsIDExOSwgMTIwXSwgXCJpbmNsdXNpdmVcIjogdHJ1ZSB9IH1cbiAgICB9O1xuICAgIHJldHVybiBsZXhlcjI7XG4gIH0pKCk7XG4gIHBhcnNlcjIubGV4ZXIgPSBsZXhlcjtcbiAgZnVuY3Rpb24gUGFyc2VyKCkge1xuICAgIHRoaXMueXkgPSB7fTtcbiAgfVxuICBfX25hbWUoUGFyc2VyLCBcIlBhcnNlclwiKTtcbiAgUGFyc2VyLnByb3RvdHlwZSA9IHBhcnNlcjI7XG4gIHBhcnNlcjIuUGFyc2VyID0gUGFyc2VyO1xuICByZXR1cm4gbmV3IFBhcnNlcigpO1xufSkoKTtcbnBhcnNlci5wYXJzZXIgPSBwYXJzZXI7XG52YXIgZmxvd19kZWZhdWx0ID0gcGFyc2VyO1xuXG4vLyBzcmMvZGlhZ3JhbXMvZmxvd2NoYXJ0L3BhcnNlci9mbG93UGFyc2VyLnRzXG52YXIgbmV3UGFyc2VyID0gT2JqZWN0LmFzc2lnbih7fSwgZmxvd19kZWZhdWx0KTtcbm5ld1BhcnNlci5wYXJzZSA9IChzcmMpID0+IHtcbiAgY29uc3QgbmV3U3JjID0gc3JjLnJlcGxhY2UoL31cXHMqXFxuL2csIFwifVxcblwiKTtcbiAgcmV0dXJuIGZsb3dfZGVmYXVsdC5wYXJzZShuZXdTcmMpO1xufTtcbnZhciBmbG93UGFyc2VyX2RlZmF1bHQgPSBuZXdQYXJzZXI7XG5cbi8vIHNyYy9kaWFncmFtcy9mbG93Y2hhcnQvc3R5bGVzLnRzXG5pbXBvcnQgKiBhcyBraHJvbWEgZnJvbSBcImtocm9tYVwiO1xudmFyIGZhZGUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChjb2xvciwgb3BhY2l0eSkgPT4ge1xuICBjb25zdCBjaGFubmVsMiA9IGtocm9tYS5jaGFubmVsO1xuICBjb25zdCByID0gY2hhbm5lbDIoY29sb3IsIFwiclwiKTtcbiAgY29uc3QgZyA9IGNoYW5uZWwyKGNvbG9yLCBcImdcIik7XG4gIGNvbnN0IGIgPSBjaGFubmVsMihjb2xvciwgXCJiXCIpO1xuICByZXR1cm4ga2hyb21hLnJnYmEociwgZywgYiwgb3BhY2l0eSk7XG59LCBcImZhZGVcIik7XG52YXIgZ2V0U3R5bGVzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgob3B0aW9ucykgPT4gYC5sYWJlbCB7XG4gICAgZm9udC1mYW1pbHk6ICR7b3B0aW9ucy5mb250RmFtaWx5fTtcbiAgICBjb2xvcjogJHtvcHRpb25zLm5vZGVUZXh0Q29sb3IgfHwgb3B0aW9ucy50ZXh0Q29sb3J9O1xuICB9XG4gIC5jbHVzdGVyLWxhYmVsIHRleHQge1xuICAgIGZpbGw6ICR7b3B0aW9ucy50aXRsZUNvbG9yfTtcbiAgfVxuICAuY2x1c3Rlci1sYWJlbCBzcGFuIHtcbiAgICBjb2xvcjogJHtvcHRpb25zLnRpdGxlQ29sb3J9O1xuICB9XG4gIC5jbHVzdGVyLWxhYmVsIHNwYW4gcCB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gIH1cblxuICAubGFiZWwgdGV4dCxzcGFuIHtcbiAgICBmaWxsOiAke29wdGlvbnMubm9kZVRleHRDb2xvciB8fCBvcHRpb25zLnRleHRDb2xvcn07XG4gICAgY29sb3I6ICR7b3B0aW9ucy5ub2RlVGV4dENvbG9yIHx8IG9wdGlvbnMudGV4dENvbG9yfTtcbiAgfVxuXG4gIC5ub2RlIHJlY3QsXG4gIC5ub2RlIGNpcmNsZSxcbiAgLm5vZGUgZWxsaXBzZSxcbiAgLm5vZGUgcG9seWdvbixcbiAgLm5vZGUgcGF0aCB7XG4gICAgZmlsbDogJHtvcHRpb25zLm1haW5Ca2d9O1xuICAgIHN0cm9rZTogJHtvcHRpb25zLm5vZGVCb3JkZXJ9O1xuICAgIHN0cm9rZS13aWR0aDogJHtvcHRpb25zLnN0cm9rZVdpZHRoID8/IDF9cHg7XG4gIH1cbiAgLnJvdWdoLW5vZGUgLmxhYmVsIHRleHQgLCAubm9kZSAubGFiZWwgdGV4dCwgLmltYWdlLXNoYXBlIC5sYWJlbCwgLmljb24tc2hhcGUgLmxhYmVsIHtcbiAgICB0ZXh0LWFuY2hvcjogbWlkZGxlO1xuICB9XG4gIC8vIC5mbG93Y2hhcnQtbGFiZWwgLnRleHQtb3V0ZXItdHNwYW4ge1xuICAvLyAgIHRleHQtYW5jaG9yOiBtaWRkbGU7XG4gIC8vIH1cbiAgLy8gLmZsb3djaGFydC1sYWJlbCAudGV4dC1pbm5lci10c3BhbiB7XG4gIC8vICAgdGV4dC1hbmNob3I6IHN0YXJ0O1xuICAvLyB9XG5cbiAgLm5vZGUgLmthdGV4IHBhdGgge1xuICAgIGZpbGw6ICMwMDA7XG4gICAgc3Ryb2tlOiAjMDAwO1xuICAgIHN0cm9rZS13aWR0aDogMXB4O1xuICB9XG5cbiAgLnJvdWdoLW5vZGUgLmxhYmVsLC5ub2RlIC5sYWJlbCwgLmltYWdlLXNoYXBlIC5sYWJlbCwgLmljb24tc2hhcGUgLmxhYmVsIHtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIH1cbiAgLm5vZGUuY2xpY2thYmxlIHtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gIH1cblxuXG4gIC5yb290IC5hbmNob3IgcGF0aCB7XG4gICAgZmlsbDogJHtvcHRpb25zLmxpbmVDb2xvcn0gIWltcG9ydGFudDtcbiAgICBzdHJva2Utd2lkdGg6IDA7XG4gICAgc3Ryb2tlOiAke29wdGlvbnMubGluZUNvbG9yfTtcbiAgfVxuXG4gIC5hcnJvd2hlYWRQYXRoIHtcbiAgICBmaWxsOiAke29wdGlvbnMuYXJyb3doZWFkQ29sb3J9O1xuICB9XG5cbiAgLmVkZ2VQYXRoIC5wYXRoIHtcbiAgICBzdHJva2U6ICR7b3B0aW9ucy5saW5lQ29sb3J9O1xuICAgIHN0cm9rZS13aWR0aDogJHtvcHRpb25zLnN0cm9rZVdpZHRoID8/IDJ9cHg7XG4gIH1cblxuICAuZmxvd2NoYXJ0LWxpbmsge1xuICAgIHN0cm9rZTogJHtvcHRpb25zLmxpbmVDb2xvcn07XG4gICAgZmlsbDogbm9uZTtcbiAgfVxuXG4gIC5lZGdlTGFiZWwge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICR7b3B0aW9ucy5lZGdlTGFiZWxCYWNrZ3JvdW5kfTtcbiAgICBwIHtcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICR7b3B0aW9ucy5lZGdlTGFiZWxCYWNrZ3JvdW5kfTtcbiAgICB9XG4gICAgcmVjdCB7XG4gICAgICBvcGFjaXR5OiAwLjU7XG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke29wdGlvbnMuZWRnZUxhYmVsQmFja2dyb3VuZH07XG4gICAgICBmaWxsOiAke29wdGlvbnMuZWRnZUxhYmVsQmFja2dyb3VuZH07XG4gICAgfVxuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgfVxuXG4gIC8qIEZvciBodG1sIGxhYmVscyBvbmx5ICovXG4gIC5sYWJlbEJrZyB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogJHtmYWRlKG9wdGlvbnMuZWRnZUxhYmVsQmFja2dyb3VuZCwgMC41KX07XG4gICAgLy8gYmFja2dyb3VuZC1jb2xvcjpcbiAgfVxuXG4gIC5jbHVzdGVyIHJlY3Qge1xuICAgIGZpbGw6ICR7b3B0aW9ucy5jbHVzdGVyQmtnfTtcbiAgICBzdHJva2U6ICR7b3B0aW9ucy5jbHVzdGVyQm9yZGVyfTtcbiAgICBzdHJva2Utd2lkdGg6IDFweDtcbiAgfVxuXG4gIC5jbHVzdGVyIHRleHQge1xuICAgIGZpbGw6ICR7b3B0aW9ucy50aXRsZUNvbG9yfTtcbiAgfVxuXG4gIC5jbHVzdGVyIHNwYW4ge1xuICAgIGNvbG9yOiAke29wdGlvbnMudGl0bGVDb2xvcn07XG4gIH1cbiAgLyogLmNsdXN0ZXIgZGl2IHtcbiAgICBjb2xvcjogJHtvcHRpb25zLnRpdGxlQ29sb3J9O1xuICB9ICovXG5cbiAgZGl2Lm1lcm1haWRUb29sdGlwIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgIG1heC13aWR0aDogMjAwcHg7XG4gICAgcGFkZGluZzogMnB4O1xuICAgIGZvbnQtZmFtaWx5OiAke29wdGlvbnMuZm9udEZhbWlseX07XG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGJhY2tncm91bmQ6ICR7b3B0aW9ucy50ZXJ0aWFyeUNvbG9yfTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAke29wdGlvbnMuYm9yZGVyMn07XG4gICAgYm9yZGVyLXJhZGl1czogMnB4O1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICAgIHotaW5kZXg6IDEwMDtcbiAgfVxuXG4gIC5mbG93Y2hhcnRUaXRsZVRleHQge1xuICAgIHRleHQtYW5jaG9yOiBtaWRkbGU7XG4gICAgZm9udC1zaXplOiAxOHB4O1xuICAgIGZpbGw6ICR7b3B0aW9ucy50ZXh0Q29sb3J9O1xuICB9XG5cbiAgcmVjdC50ZXh0IHtcbiAgICBmaWxsOiBub25lO1xuICAgIHN0cm9rZS13aWR0aDogMDtcbiAgfVxuXG4gIC5pY29uLXNoYXBlLCAuaW1hZ2Utc2hhcGUge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICR7b3B0aW9ucy5lZGdlTGFiZWxCYWNrZ3JvdW5kfTtcbiAgICBwIHtcbiAgICAgIGJhY2tncm91bmQtY29sb3I6ICR7b3B0aW9ucy5lZGdlTGFiZWxCYWNrZ3JvdW5kfTtcbiAgICAgIHBhZGRpbmc6IDJweDtcbiAgICB9XG4gICAgLmxhYmVsIHJlY3Qge1xuICAgICAgb3BhY2l0eTogMC41O1xuICAgICAgYmFja2dyb3VuZC1jb2xvcjogJHtvcHRpb25zLmVkZ2VMYWJlbEJhY2tncm91bmR9O1xuICAgICAgZmlsbDogJHtvcHRpb25zLmVkZ2VMYWJlbEJhY2tncm91bmR9O1xuICAgIH1cbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIH1cbiAgJHtnZXRJY29uU3R5bGVzKCl9XG5gLCBcImdldFN0eWxlc1wiKTtcbnZhciBzdHlsZXNfZGVmYXVsdCA9IGdldFN0eWxlcztcblxuLy8gc3JjL2RpYWdyYW1zL2Zsb3djaGFydC9mbG93RGlhZ3JhbS50c1xudmFyIGRpYWdyYW0gPSB7XG4gIHBhcnNlcjogZmxvd1BhcnNlcl9kZWZhdWx0LFxuICBnZXQgZGIoKSB7XG4gICAgcmV0dXJuIG5ldyBGbG93REIoKTtcbiAgfSxcbiAgcmVuZGVyZXI6IGZsb3dSZW5kZXJlcl92M191bmlmaWVkX2RlZmF1bHQsXG4gIHN0eWxlczogc3R5bGVzX2RlZmF1bHQsXG4gIGluaXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGNuZikgPT4ge1xuICAgIGlmICghY25mLmZsb3djaGFydCkge1xuICAgICAgY25mLmZsb3djaGFydCA9IHt9O1xuICAgIH1cbiAgICBpZiAoY25mLmxheW91dCkge1xuICAgICAgc2V0Q29uZmlnKHsgbGF5b3V0OiBjbmYubGF5b3V0IH0pO1xuICAgIH1cbiAgICBjbmYuZmxvd2NoYXJ0LmFycm93TWFya2VyQWJzb2x1dGUgPSBjbmYuYXJyb3dNYXJrZXJBYnNvbHV0ZTtcbiAgICBzZXRDb25maWcoeyBmbG93Y2hhcnQ6IHsgYXJyb3dNYXJrZXJBYnNvbHV0ZTogY25mLmFycm93TWFya2VyQWJzb2x1dGUgfSB9KTtcbiAgfSwgXCJpbml0XCIpXG59O1xuZXhwb3J0IHtcbiAgZGlhZ3JhbVxufTtcbiIKICBdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFxREEsSUFBSSx3QkFBd0I7QUFDNUIsSUFBSSxTQUFTLE1BQU07QUFBQSxFQUVqQixXQUFXLEdBQUc7QUFBQSxJQUNaLEtBQUssZ0JBQWdCO0FBQUEsSUFDckIsS0FBSyxTQUFTLFdBQVU7QUFBQSxJQUN4QixLQUFLLFlBQVk7QUFBQSxJQUNqQixLQUFLLDJCQUEyQixJQUFJO0FBQUEsSUFDcEMsS0FBSyxRQUFRLENBQUM7QUFBQSxJQUNkLEtBQUssMEJBQTBCLElBQUk7QUFBQSxJQUNuQyxLQUFLLFlBQVksQ0FBQztBQUFBLElBQ2xCLEtBQUssaUNBQWlDLElBQUk7QUFBQSxJQUMxQyxLQUFLLDJCQUEyQixJQUFJO0FBQUEsSUFDcEMsS0FBSyxXQUFXO0FBQUEsSUFDaEIsS0FBSyxpQkFBaUI7QUFBQSxJQUV0QixLQUFLLFdBQVc7QUFBQSxJQUNoQixLQUFLLGNBQWMsQ0FBQztBQUFBLElBRXBCLEtBQUssT0FBTyxDQUFDO0FBQUEsSUFDYixLQUFLLGNBQWM7QUFBQSxJQUNuQixLQUFLLG9CQUFvQjtBQUFBLElBQ3pCLEtBQUssa0JBQWtCO0FBQUEsSUFDdkIsS0FBSyxjQUFjO0FBQUEsSUFDbkIsS0FBSyxvQkFBb0I7QUFBQSxJQUN6QixLQUFLLGtCQUFrQjtBQUFBLElBQ3ZCLEtBQUssS0FBSyxLQUFLLEtBQUssY0FBYyxLQUFLLElBQUksQ0FBQztBQUFBLElBQzVDLEtBQUssWUFBWSxLQUFLLFVBQVUsS0FBSyxJQUFJO0FBQUEsSUFDekMsS0FBSyxhQUFhLEtBQUssV0FBVyxLQUFLLElBQUk7QUFBQSxJQUMzQyxLQUFLLGVBQWUsS0FBSyxhQUFhLEtBQUssSUFBSTtBQUFBLElBQy9DLEtBQUssY0FBYyxLQUFLLFlBQVksS0FBSyxJQUFJO0FBQUEsSUFDN0MsS0FBSyxVQUFVLEtBQUssUUFBUSxLQUFLLElBQUk7QUFBQSxJQUNyQyxLQUFLLFVBQVUsS0FBSyxRQUFRLEtBQUssSUFBSTtBQUFBLElBQ3JDLEtBQUssYUFBYSxLQUFLLFdBQVcsS0FBSyxJQUFJO0FBQUEsSUFDM0MsS0FBSyxXQUFXLEtBQUssU0FBUyxLQUFLLElBQUk7QUFBQSxJQUN2QyxLQUFLLFdBQVcsS0FBSyxTQUFTLEtBQUssSUFBSTtBQUFBLElBQ3ZDLEtBQUssZUFBZSxLQUFLLGFBQWEsS0FBSyxJQUFJO0FBQUEsSUFDL0MsS0FBSyxnQkFBZ0IsS0FBSyxjQUFjLEtBQUssSUFBSTtBQUFBLElBQ2pELEtBQUssYUFBYSxLQUFLLFdBQVcsS0FBSyxJQUFJO0FBQUEsSUFDM0MsS0FBSyx3QkFBd0IsS0FBSyxzQkFBc0IsS0FBSyxJQUFJO0FBQUEsSUFDakUsS0FBSyxjQUFjLEtBQUssWUFBWSxLQUFLLElBQUk7QUFBQSxJQUM3QyxLQUFLLGdCQUFnQixLQUFLLGNBQWMsS0FBSyxJQUFJO0FBQUEsSUFDakQsS0FBSyxNQUFNO0FBQUEsTUFDVCxZQUFZLEtBQUssV0FBVyxLQUFLLElBQUk7QUFBQSxJQUN2QztBQUFBLElBQ0EsS0FBSyxNQUFNO0FBQUEsSUFDWCxLQUFLLE9BQU8sT0FBTztBQUFBO0FBQUEsU0FFZDtBQUFBLElBQ0wsT0FBTyxNQUFNLFFBQVE7QUFBQTtBQUFBLEVBRXZCLFlBQVksQ0FBQyxLQUFLO0FBQUEsSUFDaEIsT0FBTyxlQUFlLGFBQWEsS0FBSyxLQUFLLE1BQU07QUFBQTtBQUFBLEVBRXJELHFCQUFxQixDQUFDLFdBQVc7QUFBQSxJQUMvQixRQUFRO0FBQUEsV0FDRDtBQUFBLFdBQ0E7QUFBQSxXQUNBO0FBQUEsUUFDSCxPQUFPO0FBQUE7QUFBQSxRQUVQLE9BQU87QUFBQTtBQUFBO0FBQUEsRUFPYixZQUFZLENBQUMsY0FBYztBQUFBLElBQ3pCLEtBQUssWUFBWTtBQUFBO0FBQUEsRUFRbkIsV0FBVyxDQUFDLElBQUk7QUFBQSxJQUNkLFdBQVcsVUFBVSxLQUFLLFNBQVMsT0FBTyxHQUFHO0FBQUEsTUFDM0MsSUFBSSxPQUFPLE9BQU8sSUFBSTtBQUFBLFFBQ3BCLE9BQU8sS0FBSyxZQUFZLEdBQUcsS0FBSyxhQUFhLE9BQU8sVUFBVSxPQUFPO0FBQUEsTUFDdkU7QUFBQSxJQUNGO0FBQUEsSUFDQSxPQUFPLEtBQUssWUFBWSxHQUFHLEtBQUssYUFBYSxPQUFPO0FBQUE7QUFBQSxFQUt0RCxTQUFTLENBQUMsSUFBSSxTQUFTLE1BQU0sT0FBTyxTQUFTLEtBQUssUUFBUSxDQUFDLEdBQUcsVUFBVTtBQUFBLElBQ3RFLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxFQUFFLFdBQVcsR0FBRztBQUFBLE1BQ2pDO0FBQUEsSUFDRjtBQUFBLElBQ0EsSUFBSTtBQUFBLElBQ0osSUFBSSxhQUFrQixXQUFHO0FBQUEsTUFDdkIsSUFBSTtBQUFBLE1BQ0osSUFBSSxDQUFDLFNBQVMsU0FBUztBQUFBLENBQUksR0FBRztBQUFBLFFBQzVCLFdBQVc7QUFBQSxJQUFRLFdBQVc7QUFBQTtBQUFBLE1BQ2hDLEVBQU87QUFBQSxRQUNMLFdBQVcsV0FBVztBQUFBO0FBQUE7QUFBQSxNQUV4QixNQUFNLEtBQUssVUFBVSxFQUFFLFFBQVEsWUFBWSxDQUFDO0FBQUEsSUFDOUM7QUFBQSxJQUNBLE1BQU0sT0FBTyxLQUFLLE1BQU0sS0FBSyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUU7QUFBQSxJQUMvQyxJQUFJLE1BQU07QUFBQSxNQUNSLE1BQU0sVUFBVTtBQUFBLE1BQ2hCLElBQUksU0FBUyxZQUFpQixXQUFHO0FBQUEsUUFDL0IsS0FBSyxVQUFVLFFBQVE7QUFBQSxNQUN6QjtBQUFBLE1BQ0EsSUFBSSxTQUFTLGNBQW1CLFdBQUc7QUFBQSxRQUNqQyxLQUFLLFlBQVksUUFBUTtBQUFBLE1BQzNCO0FBQUEsTUFDQSxJQUFJLFNBQVMsVUFBZSxXQUFHO0FBQUEsUUFDN0IsS0FBSyxjQUFjLFFBQVE7QUFBQSxNQUM3QjtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxJQUFJO0FBQUEsSUFDSixJQUFJLFNBQVMsS0FBSyxTQUFTLElBQUksRUFBRTtBQUFBLElBQ2pDLElBQUksV0FBZ0IsV0FBRztBQUFBLE1BQ3JCLElBQUksWUFBaUIsYUFBSyxTQUFjLGFBQUssVUFBZSxhQUFLLFVBQVUsTUFBTTtBQUFBLFFBQy9FLElBQUksS0FDRixrQ0FBa0Msd0VBQ3BDO0FBQUEsTUFDRjtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBLFdBQVc7QUFBQSxRQUNYLE9BQU8sd0JBQXdCLEtBQUssTUFBTSxLQUFLO0FBQUEsUUFDL0MsUUFBUSxDQUFDO0FBQUEsUUFDVCxTQUFTLENBQUM7QUFBQSxNQUNaO0FBQUEsTUFDQSxLQUFLLFNBQVMsSUFBSSxJQUFJLE1BQU07QUFBQSxJQUM5QjtBQUFBLElBQ0EsS0FBSztBQUFBLElBQ0wsSUFBSSxZQUFpQixXQUFHO0FBQUEsTUFDdEIsS0FBSyxTQUFTLFdBQVU7QUFBQSxNQUN4QixNQUFNLEtBQUssYUFBYSxRQUFRLEtBQUssS0FBSyxDQUFDO0FBQUEsTUFDM0MsT0FBTyxZQUFZLFFBQVE7QUFBQSxNQUMzQixJQUFJLElBQUksV0FBVyxHQUFHLEtBQUssSUFBSSxTQUFTLEdBQUcsR0FBRztBQUFBLFFBQzVDLE1BQU0sSUFBSSxVQUFVLEdBQUcsSUFBSSxTQUFTLENBQUM7QUFBQSxNQUN2QztBQUFBLE1BQ0EsT0FBTyxPQUFPO0FBQUEsSUFDaEIsRUFBTztBQUFBLE1BQ0wsSUFBSSxPQUFPLFNBQWMsV0FBRztBQUFBLFFBQzFCLE9BQU8sT0FBTztBQUFBLE1BQ2hCO0FBQUE7QUFBQSxJQUVGLElBQUksU0FBYyxXQUFHO0FBQUEsTUFDbkIsT0FBTyxPQUFPO0FBQUEsSUFDaEI7QUFBQSxJQUNBLElBQUksVUFBZSxhQUFLLFVBQVUsTUFBTTtBQUFBLE1BQ3RDLE1BQU0sUUFBUSxDQUFDLE1BQU07QUFBQSxRQUNuQixPQUFPLE9BQU8sS0FBSyxDQUFDO0FBQUEsT0FDckI7QUFBQSxJQUNIO0FBQUEsSUFDQSxJQUFJLFlBQWlCLGFBQUssWUFBWSxNQUFNO0FBQUEsTUFDMUMsUUFBUSxRQUFRLENBQUMsTUFBTTtBQUFBLFFBQ3JCLE9BQU8sUUFBUSxLQUFLLENBQUM7QUFBQSxPQUN0QjtBQUFBLElBQ0g7QUFBQSxJQUNBLElBQUksUUFBYSxXQUFHO0FBQUEsTUFDbEIsT0FBTyxNQUFNO0FBQUEsSUFDZjtBQUFBLElBQ0EsSUFBSSxPQUFPLFVBQWUsV0FBRztBQUFBLE1BQzNCLE9BQU8sUUFBUTtBQUFBLElBQ2pCLEVBQU8sU0FBSSxVQUFlLFdBQUc7QUFBQSxNQUMzQixPQUFPLE9BQU8sT0FBTyxPQUFPLEtBQUs7QUFBQSxJQUNuQztBQUFBLElBQ0EsSUFBSSxRQUFhLFdBQUc7QUFBQSxNQUNsQixJQUFJLElBQUksT0FBTztBQUFBLFFBQ2IsSUFBSSxJQUFJLFVBQVUsSUFBSSxNQUFNLFlBQVksS0FBSyxJQUFJLE1BQU0sU0FBUyxHQUFHLEdBQUc7QUFBQSxVQUNwRSxNQUFNLElBQUksTUFBTSxrQkFBa0IsSUFBSSx5Q0FBeUM7QUFBQSxRQUNqRixFQUFPLFNBQUksQ0FBQyxhQUFhLElBQUksS0FBSyxHQUFHO0FBQUEsVUFDbkMsTUFBTSxJQUFJLE1BQU0sa0JBQWtCLElBQUksUUFBUTtBQUFBLFFBQ2hEO0FBQUEsUUFDQSxPQUFPLE9BQU8sS0FBSztBQUFBLE1BQ3JCO0FBQUEsTUFDQSxJQUFJLEtBQUssT0FBTztBQUFBLFFBQ2QsT0FBTyxPQUFPLEtBQUs7QUFBQSxRQUNuQixPQUFPLFlBQVksS0FBSyxzQkFBc0IsS0FBSyxTQUFTO0FBQUEsTUFDOUQ7QUFBQSxNQUNBLElBQUksS0FBSyxNQUFNO0FBQUEsUUFDYixPQUFPLE9BQU8sS0FBSztBQUFBLFFBQ25CLElBQUksQ0FBQyxJQUFJLE9BQU8sS0FBSyxLQUFLLE9BQU8sU0FBUyxJQUFJO0FBQUEsVUFDNUMsT0FBTyxPQUFPO0FBQUEsUUFDaEI7QUFBQSxNQUNGO0FBQUEsTUFDQSxJQUFJLEtBQUssTUFBTTtBQUFBLFFBQ2IsT0FBTyxPQUFPLEtBQUs7QUFBQSxNQUNyQjtBQUFBLE1BQ0EsSUFBSSxLQUFLLEtBQUs7QUFBQSxRQUNaLE9BQU8sTUFBTSxLQUFLO0FBQUEsTUFDcEI7QUFBQSxNQUNBLElBQUksS0FBSyxLQUFLO0FBQUEsUUFDWixPQUFPLE1BQU0sS0FBSztBQUFBLFFBQ2xCLElBQUksQ0FBQyxJQUFJLE9BQU8sS0FBSyxLQUFLLE9BQU8sU0FBUyxJQUFJO0FBQUEsVUFDNUMsT0FBTyxPQUFPO0FBQUEsUUFDaEI7QUFBQSxNQUNGO0FBQUEsTUFDQSxJQUFJLEtBQUssWUFBWTtBQUFBLFFBQ25CLE9BQU8sYUFBYSxJQUFJO0FBQUEsTUFDMUI7QUFBQSxNQUNBLElBQUksSUFBSSxHQUFHO0FBQUEsUUFDVCxPQUFPLGFBQWEsT0FBTyxJQUFJLENBQUM7QUFBQSxNQUNsQztBQUFBLE1BQ0EsSUFBSSxJQUFJLEdBQUc7QUFBQSxRQUNULE9BQU8sY0FBYyxPQUFPLElBQUksQ0FBQztBQUFBLE1BQ25DO0FBQUEsSUFDRjtBQUFBO0FBQUEsRUFNRixhQUFhLENBQUMsUUFBUSxNQUFNLE1BQU0sSUFBSTtBQUFBLElBQ3BDLE1BQU0sUUFBUTtBQUFBLElBQ2QsTUFBTSxNQUFNO0FBQUEsSUFDWixNQUFNLE9BQU87QUFBQSxNQUNYO0FBQUEsTUFDQTtBQUFBLE1BQ0EsTUFBVztBQUFBLE1BQ1gsTUFBTTtBQUFBLE1BQ04sV0FBVztBQUFBLE1BQ1gsU0FBUyxDQUFDO0FBQUEsTUFDVixpQkFBaUI7QUFBQSxNQUNqQixhQUFhLEtBQUssTUFBTTtBQUFBLElBQzFCO0FBQUEsSUFDQSxJQUFJLEtBQUsscUJBQXFCLElBQUk7QUFBQSxJQUNsQyxNQUFNLGNBQWMsS0FBSztBQUFBLElBQ3pCLElBQUksZ0JBQXFCLFdBQUc7QUFBQSxNQUMxQixLQUFLLE9BQU8sS0FBSyxhQUFhLFlBQVksS0FBSyxLQUFLLENBQUM7QUFBQSxNQUNyRCxJQUFJLEtBQUssS0FBSyxXQUFXLEdBQUcsS0FBSyxLQUFLLEtBQUssU0FBUyxHQUFHLEdBQUc7QUFBQSxRQUN4RCxLQUFLLE9BQU8sS0FBSyxLQUFLLFVBQVUsR0FBRyxLQUFLLEtBQUssU0FBUyxDQUFDO0FBQUEsTUFDekQ7QUFBQSxNQUNBLEtBQUssWUFBWSxLQUFLLHNCQUFzQixZQUFZLElBQUk7QUFBQSxJQUM5RDtBQUFBLElBQ0EsSUFBSSxTQUFjLFdBQUc7QUFBQSxNQUNuQixLQUFLLE9BQU8sS0FBSztBQUFBLE1BQ2pCLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDbkIsS0FBSyxTQUFTLEtBQUssU0FBUyxLQUFLLEtBQUssS0FBSztBQUFBLElBQzdDO0FBQUEsSUFDQSxJQUFJLE1BQU0sQ0FBQyxLQUFLLE1BQU0sS0FBSyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRztBQUFBLE1BQzlDLEtBQUssS0FBSztBQUFBLE1BQ1YsS0FBSyxrQkFBa0I7QUFBQSxJQUN6QixFQUFPO0FBQUEsTUFDTCxNQUFNLGdCQUFnQixLQUFLLE1BQU0sT0FBTyxDQUFDLE1BQU0sRUFBRSxVQUFVLEtBQUssU0FBUyxFQUFFLFFBQVEsS0FBSyxHQUFHO0FBQUEsTUFDM0YsSUFBSSxjQUFjLFdBQVcsR0FBRztBQUFBLFFBQzlCLEtBQUssS0FBSyxVQUFVLEtBQUssT0FBTyxLQUFLLEtBQUssRUFBRSxTQUFTLEdBQUcsUUFBUSxJQUFJLENBQUM7QUFBQSxNQUN2RSxFQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssVUFBVSxLQUFLLE9BQU8sS0FBSyxLQUFLO0FBQUEsVUFDeEMsU0FBUyxjQUFjLFNBQVM7QUFBQSxVQUNoQyxRQUFRO0FBQUEsUUFDVixDQUFDO0FBQUE7QUFBQTtBQUFBLElBR0wsSUFBSSxLQUFLLE1BQU0sVUFBVSxLQUFLLE9BQU8sWUFBWSxNQUFNO0FBQUEsTUFDckQsSUFBSSxLQUFLLGlCQUFpQjtBQUFBLE1BQzFCLEtBQUssTUFBTSxLQUFLLElBQUk7QUFBQSxJQUN0QixFQUFPO0FBQUEsTUFDTCxNQUFNLElBQUksTUFDUix3QkFBd0IsS0FBSyxNQUFNLHdDQUF3QyxLQUFLLE9BQU87QUFBQTtBQUFBO0FBQUE7QUFBQSxxQ0FLekY7QUFBQTtBQUFBO0FBQUEsRUFHSixVQUFVLENBQUMsT0FBTztBQUFBLElBQ2hCLE9BQU8sVUFBVSxRQUFRLE9BQU8sVUFBVSxZQUFZLFFBQVEsU0FBUyxPQUFPLE1BQU0sT0FBTztBQUFBO0FBQUEsRUFFN0YsT0FBTyxDQUFDLFFBQVEsTUFBTSxVQUFVO0FBQUEsSUFDOUIsTUFBTSxLQUFLLEtBQUssV0FBVyxRQUFRLElBQUksU0FBUyxHQUFHLFFBQVEsS0FBSyxFQUFFLElBQVM7QUFBQSxJQUMzRSxJQUFJLEtBQUssV0FBVyxRQUFRLE1BQU0sRUFBRTtBQUFBLElBQ3BDLFdBQVcsU0FBUyxRQUFRO0FBQUEsTUFDMUIsV0FBVyxPQUFPLE1BQU07QUFBQSxRQUN0QixNQUFNLGNBQWMsVUFBVSxPQUFPLE9BQU8sU0FBUztBQUFBLFFBQ3JELE1BQU0sYUFBYSxRQUFRLEtBQUs7QUFBQSxRQUNoQyxJQUFJLGVBQWUsWUFBWTtBQUFBLFVBQzdCLEtBQUssY0FBYyxPQUFPLEtBQUssVUFBVSxFQUFFO0FBQUEsUUFDN0MsRUFBTztBQUFBLFVBQ0wsS0FBSyxjQUFjLE9BQU8sS0FBSyxVQUFlLFNBQUM7QUFBQTtBQUFBLE1BRW5EO0FBQUEsSUFDRjtBQUFBO0FBQUEsRUFLRixxQkFBcUIsQ0FBQyxXQUFXLGFBQWE7QUFBQSxJQUM1QyxVQUFVLFFBQVEsQ0FBQyxRQUFRO0FBQUEsTUFDekIsSUFBSSxRQUFRLFdBQVc7QUFBQSxRQUNyQixLQUFLLE1BQU0scUJBQXFCO0FBQUEsTUFDbEMsRUFBTztBQUFBLFFBQ0wsS0FBSyxNQUFNLEtBQUssY0FBYztBQUFBO0FBQUEsS0FFakM7QUFBQTtBQUFBLEVBTUgsVUFBVSxDQUFDLFdBQVcsT0FBTztBQUFBLElBQzNCLFVBQVUsUUFBUSxDQUFDLFFBQVE7QUFBQSxNQUN6QixJQUFJLE9BQU8sUUFBUSxZQUFZLE9BQU8sS0FBSyxNQUFNLFFBQVE7QUFBQSxRQUN2RCxNQUFNLElBQUksTUFDUixhQUFhLHFGQUFxRixLQUFLLE1BQU0sU0FBUyx5RUFDeEg7QUFBQSxNQUNGO0FBQUEsTUFDQSxJQUFJLFFBQVEsV0FBVztBQUFBLFFBQ3JCLEtBQUssTUFBTSxlQUFlO0FBQUEsTUFDNUIsRUFBTztBQUFBLFFBQ0wsS0FBSyxNQUFNLEtBQUssUUFBUTtBQUFBLFFBQ3hCLEtBQUssS0FBSyxNQUFNLE1BQU0sT0FBTyxVQUFVLEtBQUssS0FBSyxDQUFDLEtBQUssTUFBTSxNQUFNLE9BQU8sS0FBSyxDQUFDLE1BQU0sR0FBRyxXQUFXLE1BQU0sQ0FBQyxHQUFHO0FBQUEsVUFDNUcsS0FBSyxNQUFNLE1BQU0sT0FBTyxLQUFLLFdBQVc7QUFBQSxRQUMxQztBQUFBO0FBQUEsS0FFSDtBQUFBO0FBQUEsRUFFSCxRQUFRLENBQUMsS0FBSyxRQUFRO0FBQUEsSUFDcEIsTUFBTSxRQUFRLE9BQU8sS0FBSyxFQUFFLFFBQVEsUUFBUSxLQUFjLEVBQUUsUUFBUSxNQUFNLEdBQUcsRUFBRSxRQUFRLFFBQU8sR0FBRyxFQUFFLE1BQU0sR0FBRztBQUFBLElBQzVHLElBQUksTUFBTSxHQUFHLEVBQUUsUUFBUSxDQUFDLE9BQU87QUFBQSxNQUM3QixJQUFJLFlBQVksS0FBSyxRQUFRLElBQUksRUFBRTtBQUFBLE1BQ25DLElBQUksY0FBbUIsV0FBRztBQUFBLFFBQ3hCLFlBQVksRUFBRSxJQUFJLFFBQVEsQ0FBQyxHQUFHLFlBQVksQ0FBQyxFQUFFO0FBQUEsUUFDN0MsS0FBSyxRQUFRLElBQUksSUFBSSxTQUFTO0FBQUEsTUFDaEM7QUFBQSxNQUNBLElBQUksVUFBZSxhQUFLLFVBQVUsTUFBTTtBQUFBLFFBQ3RDLE1BQU0sUUFBUSxDQUFDLE1BQU07QUFBQSxVQUNuQixJQUFJLFFBQVEsS0FBSyxDQUFDLEdBQUc7QUFBQSxZQUNuQixNQUFNLFdBQVcsRUFBRSxRQUFRLFFBQVEsUUFBUTtBQUFBLFlBQzNDLFVBQVUsV0FBVyxLQUFLLFFBQVE7QUFBQSxVQUNwQztBQUFBLFVBQ0EsVUFBVSxPQUFPLEtBQUssQ0FBQztBQUFBLFNBQ3hCO0FBQUEsTUFDSDtBQUFBLEtBQ0Q7QUFBQTtBQUFBLEVBTUgsWUFBWSxDQUFDLEtBQUs7QUFBQSxJQUNoQixLQUFLLFlBQVksSUFBSSxLQUFLO0FBQUEsSUFDMUIsSUFBSSxNQUFNLEtBQUssS0FBSyxTQUFTLEdBQUc7QUFBQSxNQUM5QixLQUFLLFlBQVk7QUFBQSxJQUNuQjtBQUFBLElBQ0EsSUFBSSxPQUFPLEtBQUssS0FBSyxTQUFTLEdBQUc7QUFBQSxNQUMvQixLQUFLLFlBQVk7QUFBQSxJQUNuQjtBQUFBLElBQ0EsSUFBSSxNQUFNLEtBQUssS0FBSyxTQUFTLEdBQUc7QUFBQSxNQUM5QixLQUFLLFlBQVk7QUFBQSxJQUNuQjtBQUFBLElBQ0EsSUFBSSxNQUFNLEtBQUssS0FBSyxTQUFTLEdBQUc7QUFBQSxNQUM5QixLQUFLLFlBQVk7QUFBQSxJQUNuQjtBQUFBLElBQ0EsSUFBSSxLQUFLLGNBQWMsTUFBTTtBQUFBLE1BQzNCLEtBQUssWUFBWTtBQUFBLElBQ25CO0FBQUE7QUFBQSxFQVFGLFFBQVEsQ0FBQyxLQUFLLFdBQVc7QUFBQSxJQUN2QixXQUFXLE1BQU0sSUFBSSxNQUFNLEdBQUcsR0FBRztBQUFBLE1BQy9CLE1BQU0sU0FBUyxLQUFLLFNBQVMsSUFBSSxFQUFFO0FBQUEsTUFDbkMsSUFBSSxRQUFRO0FBQUEsUUFDVixPQUFPLFFBQVEsS0FBSyxTQUFTO0FBQUEsTUFDL0I7QUFBQSxNQUNBLE1BQU0sT0FBTyxLQUFLLE1BQU0sS0FBSyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUU7QUFBQSxNQUMvQyxJQUFJLE1BQU07QUFBQSxRQUNSLEtBQUssUUFBUSxLQUFLLFNBQVM7QUFBQSxNQUM3QjtBQUFBLE1BQ0EsTUFBTSxXQUFXLEtBQUssZUFBZSxJQUFJLEVBQUU7QUFBQSxNQUMzQyxJQUFJLFVBQVU7QUFBQSxRQUNaLFNBQVMsUUFBUSxLQUFLLFNBQVM7QUFBQSxNQUNqQztBQUFBLElBQ0Y7QUFBQTtBQUFBLEVBRUYsVUFBVSxDQUFDLEtBQUssU0FBUztBQUFBLElBQ3ZCLElBQUksWUFBaUIsV0FBRztBQUFBLE1BQ3RCO0FBQUEsSUFDRjtBQUFBLElBQ0EsVUFBVSxLQUFLLGFBQWEsT0FBTztBQUFBLElBQ25DLFdBQVcsTUFBTSxJQUFJLE1BQU0sR0FBRyxHQUFHO0FBQUEsTUFDL0IsS0FBSyxTQUFTLElBQUksS0FBSyxZQUFZLFVBQVUsS0FBSyxZQUFZLEVBQUUsSUFBSSxJQUFJLE9BQU87QUFBQSxJQUNqRjtBQUFBO0FBQUEsRUFFRixXQUFXLENBQUMsSUFBSSxjQUFjLGNBQWM7QUFBQSxJQUMxQyxJQUFJLFdBQVUsRUFBRSxrQkFBa0IsU0FBUztBQUFBLE1BQ3pDO0FBQUEsSUFDRjtBQUFBLElBQ0EsSUFBSSxpQkFBc0IsV0FBRztBQUFBLE1BQzNCO0FBQUEsSUFDRjtBQUFBLElBQ0EsSUFBSSxVQUFVLENBQUM7QUFBQSxJQUNmLElBQUksT0FBTyxpQkFBaUIsVUFBVTtBQUFBLE1BQ3BDLFVBQVUsYUFBYSxNQUFNLCtCQUErQjtBQUFBLE1BQzVELFNBQVMsSUFBSSxFQUFHLElBQUksUUFBUSxRQUFRLEtBQUs7QUFBQSxRQUN2QyxJQUFJLE9BQU8sUUFBUSxHQUFHLEtBQUs7QUFBQSxRQUMzQixJQUFJLEtBQUssV0FBVyxHQUFHLEtBQUssS0FBSyxTQUFTLEdBQUcsR0FBRztBQUFBLFVBQzlDLE9BQU8sS0FBSyxPQUFPLEdBQUcsS0FBSyxTQUFTLENBQUM7QUFBQSxRQUN2QztBQUFBLFFBQ0EsUUFBUSxLQUFLO0FBQUEsTUFDZjtBQUFBLElBQ0Y7QUFBQSxJQUNBLElBQUksUUFBUSxXQUFXLEdBQUc7QUFBQSxNQUN4QixRQUFRLEtBQUssRUFBRTtBQUFBLElBQ2pCO0FBQUEsSUFDQSxNQUFNLFNBQVMsS0FBSyxTQUFTLElBQUksRUFBRTtBQUFBLElBQ25DLElBQUksUUFBUTtBQUFBLE1BQ1YsT0FBTyxlQUFlO0FBQUEsTUFDdEIsS0FBSyxLQUFLLEtBQUssTUFBTTtBQUFBLFFBQ25CLE1BQU0sUUFBUSxLQUFLLFlBQVksRUFBRTtBQUFBLFFBQ2pDLE1BQU0sT0FBTyxTQUFTLGNBQWMsUUFBUSxTQUFTO0FBQUEsUUFDckQsSUFBSSxTQUFTLE1BQU07QUFBQSxVQUNqQixLQUFLLGlCQUNILFNBQ0EsTUFBTTtBQUFBLFlBQ0osY0FBYyxRQUFRLGNBQWMsR0FBRyxPQUFPO0FBQUEsYUFFaEQsS0FDRjtBQUFBLFFBQ0Y7QUFBQSxPQUNEO0FBQUEsSUFDSDtBQUFBO0FBQUEsRUFTRixPQUFPLENBQUMsS0FBSyxTQUFTLFFBQVE7QUFBQSxJQUM1QixJQUFJLE1BQU0sR0FBRyxFQUFFLFFBQVEsQ0FBQyxPQUFPO0FBQUEsTUFDN0IsTUFBTSxTQUFTLEtBQUssU0FBUyxJQUFJLEVBQUU7QUFBQSxNQUNuQyxJQUFJLFdBQWdCLFdBQUc7QUFBQSxRQUNyQixPQUFPLE9BQU8sY0FBYyxVQUFVLFNBQVMsS0FBSyxNQUFNO0FBQUEsUUFDMUQsT0FBTyxhQUFhO0FBQUEsTUFDdEI7QUFBQSxLQUNEO0FBQUEsSUFDRCxLQUFLLFNBQVMsS0FBSyxXQUFXO0FBQUE7QUFBQSxFQUVoQyxVQUFVLENBQUMsSUFBSTtBQUFBLElBQ2IsT0FBTyxLQUFLLFNBQVMsSUFBSSxFQUFFO0FBQUE7QUFBQSxFQVM3QixhQUFhLENBQUMsS0FBSyxjQUFjLGNBQWM7QUFBQSxJQUM3QyxJQUFJLE1BQU0sR0FBRyxFQUFFLFFBQVEsQ0FBQyxPQUFPO0FBQUEsTUFDN0IsS0FBSyxZQUFZLElBQUksY0FBYyxZQUFZO0FBQUEsS0FDaEQ7QUFBQSxJQUNELEtBQUssU0FBUyxLQUFLLFdBQVc7QUFBQTtBQUFBLEVBRWhDLGFBQWEsQ0FBQyxTQUFTO0FBQUEsSUFDckIsS0FBSyxLQUFLLFFBQVEsQ0FBQyxRQUFRO0FBQUEsTUFDekIsSUFBSSxPQUFPO0FBQUEsS0FDWjtBQUFBO0FBQUEsRUFFSCxZQUFZLEdBQUc7QUFBQSxJQUNiLE9BQU8sS0FBSyxXQUFXLEtBQUs7QUFBQTtBQUFBLEVBTTlCLFdBQVcsR0FBRztBQUFBLElBQ1osT0FBTyxLQUFLO0FBQUE7QUFBQSxFQU1kLFFBQVEsR0FBRztBQUFBLElBQ1QsT0FBTyxLQUFLO0FBQUE7QUFBQSxFQU1kLFVBQVUsR0FBRztBQUFBLElBQ1gsT0FBTyxLQUFLO0FBQUE7QUFBQSxFQUVkLGFBQWEsQ0FBQyxTQUFTO0FBQUEsSUFDckIsTUFBTSxjQUFjLGNBQWM7QUFBQSxJQUNsQyxNQUFNLE1BQU0sZUFBTyxPQUFPLEVBQUUsT0FBTyxLQUFLO0FBQUEsSUFDeEMsTUFBTSxRQUFRLElBQUksVUFBVSxRQUFRO0FBQUEsSUFDcEMsTUFBTSxHQUFHLGFBQWEsQ0FBQyxNQUFNO0FBQUEsTUFDM0IsTUFBTSxLQUFLLGVBQU8sRUFBRSxhQUFhO0FBQUEsTUFDakMsTUFBTSxRQUFRLEdBQUcsS0FBSyxPQUFPO0FBQUEsTUFDN0IsSUFBSSxVQUFVLE1BQU07QUFBQSxRQUNsQjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLE1BQU0sT0FBTyxFQUFFLGVBQWUsc0JBQXNCO0FBQUEsTUFDcEQsWUFBWSxXQUFXLEVBQUUsU0FBUyxHQUFHLEVBQUUsTUFBTSxXQUFXLElBQUk7QUFBQSxNQUM1RCxZQUFZLEtBQUssR0FBRyxLQUFLLE9BQU8sQ0FBQyxFQUFFLE1BQU0sUUFBUSxPQUFPLFVBQVUsS0FBSyxRQUFRLEtBQUssUUFBUSxLQUFLLFFBQVEsSUFBSSxJQUFJLEVBQUUsTUFBTSxPQUFPLE9BQU8sVUFBVSxLQUFLLFNBQVMsSUFBSTtBQUFBLE1BQ25LLFlBQVksS0FBSyxPQUFVLFNBQVMsS0FBSyxDQUFDO0FBQUEsTUFDMUMsR0FBRyxRQUFRLFNBQVMsSUFBSTtBQUFBLEtBQ3pCLEVBQUUsR0FBRyxZQUFZLENBQUMsTUFBTTtBQUFBLE1BQ3ZCLFlBQVksV0FBVyxFQUFFLFNBQVMsR0FBRyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQUEsTUFDekQsTUFBTSxLQUFLLGVBQU8sRUFBRSxhQUFhO0FBQUEsTUFDakMsR0FBRyxRQUFRLFNBQVMsS0FBSztBQUFBLEtBQzFCO0FBQUE7QUFBQSxFQU1ILEtBQUssQ0FBQyxNQUFNLFNBQVM7QUFBQSxJQUNuQixLQUFLLDJCQUEyQixJQUFJO0FBQUEsSUFDcEMsS0FBSywwQkFBMEIsSUFBSTtBQUFBLElBQ25DLEtBQUssUUFBUSxDQUFDO0FBQUEsSUFDZCxLQUFLLE9BQU8sQ0FBQyxLQUFLLGNBQWMsS0FBSyxJQUFJLENBQUM7QUFBQSxJQUMxQyxLQUFLLFlBQVk7QUFBQSxJQUNqQixLQUFLLFlBQVksQ0FBQztBQUFBLElBQ2xCLEtBQUssaUNBQWlDLElBQUk7QUFBQSxJQUMxQyxLQUFLLFdBQVc7QUFBQSxJQUNoQixLQUFLLDJCQUEyQixJQUFJO0FBQUEsSUFDcEMsS0FBSyxpQkFBaUI7QUFBQSxJQUN0QixLQUFLLFVBQVU7QUFBQSxJQUNmLEtBQUssU0FBUyxXQUFVO0FBQUEsSUFDeEIsTUFBTTtBQUFBO0FBQUEsRUFFUixNQUFNLENBQUMsS0FBSztBQUFBLElBQ1YsS0FBSyxVQUFVLE9BQU87QUFBQTtBQUFBLEVBRXhCLFlBQVksR0FBRztBQUFBLElBQ2IsT0FBTztBQUFBO0FBQUEsRUFFVCxXQUFXLENBQUMsS0FBSyxNQUFNLFFBQVE7QUFBQSxJQUM3QixJQUFJLEtBQUssSUFBSSxLQUFLLEtBQUs7QUFBQSxJQUN2QixJQUFJLFFBQVEsT0FBTztBQUFBLElBQ25CLElBQUksUUFBUSxVQUFVLEtBQUssS0FBSyxPQUFPLElBQUksR0FBRztBQUFBLE1BQzVDLEtBQVU7QUFBQSxJQUNaO0FBQUEsSUFDQSxNQUFNLHVCQUF1QixPQUFPLENBQUMsTUFBTTtBQUFBLE1BQ3pDLE1BQU0sUUFBUSxFQUFFLFNBQVMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxFQUFFO0FBQUEsTUFDcEQsTUFBTSxPQUFPLENBQUM7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE1BQU0sWUFBWSxFQUFFLE9BQU8sUUFBUSxDQUFDLE1BQU07QUFBQSxRQUN4QyxNQUFNLE9BQU8sT0FBTztBQUFBLFFBQ3BCLElBQUksS0FBSyxRQUFRLEtBQUssU0FBUyxPQUFPO0FBQUEsVUFDcEMsT0FBTyxLQUFLO0FBQUEsVUFDWixPQUFPO0FBQUEsUUFDVDtBQUFBLFFBQ0EsSUFBSSxLQUFLLEtBQUssTUFBTSxJQUFJO0FBQUEsVUFDdEIsT0FBTztBQUFBLFFBQ1Q7QUFBQSxRQUNBLElBQUksUUFBUSxPQUFPO0FBQUEsVUFDakIsT0FBTyxNQUFNLE1BQU0sZUFBZSxJQUFJLElBQUksUUFBUSxNQUFNLE1BQU0sUUFBUTtBQUFBLFFBQ3hFLEVBQU87QUFBQSxVQUNMLE9BQU8sS0FBSyxTQUFTLElBQUksSUFBSSxRQUFRLEtBQUssS0FBSyxJQUFJO0FBQUE7QUFBQSxPQUV0RDtBQUFBLE1BQ0QsT0FBTyxFQUFFLFVBQVUsV0FBVyxLQUFLLEtBQUs7QUFBQSxPQUN2QyxNQUFNO0FBQUEsSUFDVCxNQUFNLFNBQVMsS0FBSyxLQUFLLEtBQUssQ0FBQztBQUFBLElBQy9CLE1BQU0sV0FBVyxPQUFPO0FBQUEsSUFDeEIsSUFBSSxNQUFNLE9BQU87QUFBQSxJQUNqQixNQUFNLGtCQUFrQixXQUFVLEVBQUUsYUFBYSxDQUFDO0FBQUEsSUFDbEQsTUFBTSxRQUFRLGdCQUFnQixhQUFhLEtBQUssYUFBYSxLQUFLLFdBQVUsRUFBRSxhQUFrQixZQUFTO0FBQUEsSUFDekcsSUFBSSxLQUFLLFlBQVksU0FBUztBQUFBLE1BQzVCLFNBQVMsSUFBSSxFQUFHLElBQUksU0FBUyxRQUFRLEtBQUs7QUFBQSxRQUN4QyxTQUFTLEtBQUssS0FBSyxZQUFZLFNBQVMsRUFBRTtBQUFBLE1BQzVDO0FBQUEsSUFDRjtBQUFBLElBQ0EsS0FBSyxNQUFNLGFBQWEsS0FBSztBQUFBLElBQzdCLFFBQVEsU0FBUztBQUFBLElBQ2pCLFFBQVEsS0FBSyxhQUFhLEtBQUs7QUFBQSxJQUMvQixLQUFLLFdBQVcsS0FBSyxXQUFXO0FBQUEsSUFDaEMsTUFBTSxXQUFXO0FBQUEsTUFDZjtBQUFBLE1BQ0EsT0FBTztBQUFBLE1BQ1AsT0FBTyxNQUFNLEtBQUs7QUFBQSxNQUNsQixTQUFTLENBQUM7QUFBQSxNQUNWO0FBQUEsTUFDQSxXQUFXLEtBQUssc0JBQXNCLFFBQVEsSUFBSTtBQUFBLElBQ3BEO0FBQUEsSUFDQSxJQUFJLEtBQUssVUFBVSxTQUFTLElBQUksU0FBUyxPQUFPLFNBQVMsR0FBRztBQUFBLElBQzVELFNBQVMsUUFBUSxLQUFLLFNBQVMsVUFBVSxLQUFLLFNBQVMsRUFBRTtBQUFBLElBQ3pELEtBQUssVUFBVSxLQUFLLFFBQVE7QUFBQSxJQUM1QixLQUFLLGVBQWUsSUFBSSxJQUFJLFFBQVE7QUFBQSxJQUNwQyxPQUFPO0FBQUE7QUFBQSxFQUVULFdBQVcsQ0FBQyxJQUFJO0FBQUEsSUFDZCxZQUFZLEdBQUcsYUFBYSxLQUFLLFVBQVUsUUFBUSxHQUFHO0FBQUEsTUFDcEQsSUFBSSxTQUFTLE9BQU8sSUFBSTtBQUFBLFFBQ3RCLE9BQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTztBQUFBO0FBQUEsRUFFVCxXQUFXLENBQUMsSUFBSSxLQUFLO0FBQUEsSUFDbkIsTUFBTSxRQUFRLEtBQUssVUFBVSxLQUFLO0FBQUEsSUFDbEMsS0FBSyxXQUFXLEtBQUssV0FBVztBQUFBLElBQ2hDLElBQUksS0FBSyxXQUFXLE1BQUs7QUFBQSxNQUN2QixPQUFPO0FBQUEsUUFDTCxRQUFRO0FBQUEsUUFDUixPQUFPO0FBQUEsTUFDVDtBQUFBLElBQ0Y7QUFBQSxJQUNBLEtBQUssWUFBWSxLQUFLLFlBQVk7QUFBQSxJQUNsQyxJQUFJLEtBQUssVUFBVSxLQUFLLE9BQU8sSUFBSTtBQUFBLE1BQ2pDLE9BQU87QUFBQSxRQUNMLFFBQVE7QUFBQSxRQUNSLE9BQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsSUFBSSxRQUFRO0FBQUEsSUFDWixJQUFJLFdBQVc7QUFBQSxJQUNmLE9BQU8sUUFBUSxNQUFNLFFBQVE7QUFBQSxNQUMzQixNQUFNLFdBQVcsS0FBSyxZQUFZLE1BQU0sTUFBTTtBQUFBLE1BQzlDLElBQUksWUFBWSxHQUFHO0FBQUEsUUFDakIsTUFBTSxNQUFNLEtBQUssWUFBWSxJQUFJLFFBQVE7QUFBQSxRQUN6QyxJQUFJLElBQUksUUFBUTtBQUFBLFVBQ2QsT0FBTztBQUFBLFlBQ0wsUUFBUTtBQUFBLFlBQ1IsT0FBTyxXQUFXLElBQUk7QUFBQSxVQUN4QjtBQUFBLFFBQ0YsRUFBTztBQUFBLFVBQ0wsV0FBVyxXQUFXLElBQUk7QUFBQTtBQUFBLE1BRTlCO0FBQUEsTUFDQSxRQUFRLFFBQVE7QUFBQSxJQUNsQjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsT0FBTztBQUFBLElBQ1Q7QUFBQTtBQUFBLEVBRUYsZ0JBQWdCLENBQUMsS0FBSztBQUFBLElBQ3BCLE9BQU8sS0FBSyxZQUFZO0FBQUE7QUFBQSxFQUUxQixVQUFVLEdBQUc7QUFBQSxJQUNYLEtBQUssV0FBVztBQUFBLElBQ2hCLElBQUksS0FBSyxVQUFVLFNBQVMsR0FBRztBQUFBLE1BQzdCLEtBQUssWUFBWSxRQUFRLEtBQUssVUFBVSxTQUFTLENBQUM7QUFBQSxJQUNwRDtBQUFBO0FBQUEsRUFFRixZQUFZLEdBQUc7QUFBQSxJQUNiLE9BQU8sS0FBSztBQUFBO0FBQUEsRUFFZCxVQUFVLEdBQUc7QUFBQSxJQUNYLElBQUksS0FBSyxnQkFBZ0I7QUFBQSxNQUN2QixLQUFLLGlCQUFpQjtBQUFBLE1BQ3RCLE9BQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxPQUFPO0FBQUE7QUFBQSxFQUVULGlCQUFpQixDQUFDLE1BQU07QUFBQSxJQUN0QixJQUFJLE1BQU0sS0FBSyxLQUFLO0FBQUEsSUFDcEIsSUFBSSxPQUFPO0FBQUEsSUFDWCxRQUFRLElBQUk7QUFBQSxXQUNMO0FBQUEsUUFDSCxPQUFPO0FBQUEsUUFDUCxNQUFNLElBQUksTUFBTSxDQUFDO0FBQUEsUUFDakI7QUFBQSxXQUNHO0FBQUEsUUFDSCxPQUFPO0FBQUEsUUFDUCxNQUFNLElBQUksTUFBTSxDQUFDO0FBQUEsUUFDakI7QUFBQSxXQUNHO0FBQUEsUUFDSCxPQUFPO0FBQUEsUUFDUCxNQUFNLElBQUksTUFBTSxDQUFDO0FBQUEsUUFDakI7QUFBQTtBQUFBLElBRUosSUFBSSxTQUFTO0FBQUEsSUFDYixJQUFJLElBQUksU0FBUyxHQUFHLEdBQUc7QUFBQSxNQUNyQixTQUFTO0FBQUEsSUFDWDtBQUFBLElBQ0EsSUFBSSxJQUFJLFNBQVMsR0FBRyxHQUFHO0FBQUEsTUFDckIsU0FBUztBQUFBLElBQ1g7QUFBQSxJQUNBLE9BQU8sRUFBRSxNQUFNLE9BQU87QUFBQTtBQUFBLEVBRXhCLFNBQVMsQ0FBQyxNQUFNLEtBQUs7QUFBQSxJQUNuQixNQUFNLFNBQVMsSUFBSTtBQUFBLElBQ25CLElBQUksUUFBUTtBQUFBLElBQ1osU0FBUyxJQUFJLEVBQUcsSUFBSSxRQUFRLEVBQUUsR0FBRztBQUFBLE1BQy9CLElBQUksSUFBSSxPQUFPLE1BQU07QUFBQSxRQUNuQixFQUFFO0FBQUEsTUFDSjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQTtBQUFBLEVBRVQsZUFBZSxDQUFDLE1BQU07QUFBQSxJQUNwQixNQUFNLE1BQU0sS0FBSyxLQUFLO0FBQUEsSUFDdEIsSUFBSSxPQUFPLElBQUksTUFBTSxHQUFHLEVBQUU7QUFBQSxJQUMxQixJQUFJLE9BQU87QUFBQSxJQUNYLFFBQVEsSUFBSSxNQUFNLEVBQUU7QUFBQSxXQUNiO0FBQUEsUUFDSCxPQUFPO0FBQUEsUUFDUCxJQUFJLElBQUksV0FBVyxHQUFHLEdBQUc7QUFBQSxVQUN2QixPQUFPLFlBQVk7QUFBQSxVQUNuQixPQUFPLEtBQUssTUFBTSxDQUFDO0FBQUEsUUFDckI7QUFBQSxRQUNBO0FBQUEsV0FDRztBQUFBLFFBQ0gsT0FBTztBQUFBLFFBQ1AsSUFBSSxJQUFJLFdBQVcsR0FBRyxHQUFHO0FBQUEsVUFDdkIsT0FBTyxZQUFZO0FBQUEsVUFDbkIsT0FBTyxLQUFLLE1BQU0sQ0FBQztBQUFBLFFBQ3JCO0FBQUEsUUFDQTtBQUFBLFdBQ0c7QUFBQSxRQUNILE9BQU87QUFBQSxRQUNQLElBQUksSUFBSSxXQUFXLEdBQUcsR0FBRztBQUFBLFVBQ3ZCLE9BQU8sWUFBWTtBQUFBLFVBQ25CLE9BQU8sS0FBSyxNQUFNLENBQUM7QUFBQSxRQUNyQjtBQUFBLFFBQ0E7QUFBQTtBQUFBLElBRUosSUFBSSxTQUFTO0FBQUEsSUFDYixJQUFJLFNBQVMsS0FBSyxTQUFTO0FBQUEsSUFDM0IsSUFBSSxLQUFLLFdBQVcsR0FBRyxHQUFHO0FBQUEsTUFDeEIsU0FBUztBQUFBLElBQ1g7QUFBQSxJQUNBLElBQUksS0FBSyxXQUFXLEdBQUcsR0FBRztBQUFBLE1BQ3hCLFNBQVM7QUFBQSxJQUNYO0FBQUEsSUFDQSxNQUFNLE9BQU8sS0FBSyxVQUFVLEtBQUssSUFBSTtBQUFBLElBQ3JDLElBQUksTUFBTTtBQUFBLE1BQ1IsU0FBUztBQUFBLE1BQ1QsU0FBUztBQUFBLElBQ1g7QUFBQSxJQUNBLE9BQU8sRUFBRSxNQUFNLFFBQVEsT0FBTztBQUFBO0FBQUEsRUFFaEMsWUFBWSxDQUFDLE1BQU0sV0FBVztBQUFBLElBQzVCLE1BQU0sT0FBTyxLQUFLLGdCQUFnQixJQUFJO0FBQUEsSUFDdEMsSUFBSTtBQUFBLElBQ0osSUFBSSxXQUFXO0FBQUEsTUFDYixZQUFZLEtBQUssa0JBQWtCLFNBQVM7QUFBQSxNQUM1QyxJQUFJLFVBQVUsV0FBVyxLQUFLLFFBQVE7QUFBQSxRQUNwQyxPQUFPLEVBQUUsTUFBTSxXQUFXLFFBQVEsVUFBVTtBQUFBLE1BQzlDO0FBQUEsTUFDQSxJQUFJLFVBQVUsU0FBUyxjQUFjO0FBQUEsUUFDbkMsVUFBVSxPQUFPLEtBQUs7QUFBQSxNQUN4QixFQUFPO0FBQUEsUUFDTCxJQUFJLFVBQVUsU0FBUyxLQUFLLE1BQU07QUFBQSxVQUNoQyxPQUFPLEVBQUUsTUFBTSxXQUFXLFFBQVEsVUFBVTtBQUFBLFFBQzlDO0FBQUEsUUFDQSxVQUFVLE9BQU8sWUFBWSxVQUFVO0FBQUE7QUFBQSxNQUV6QyxJQUFJLFVBQVUsU0FBUyxnQkFBZ0I7QUFBQSxRQUNyQyxVQUFVLE9BQU87QUFBQSxNQUNuQjtBQUFBLE1BQ0EsVUFBVSxTQUFTLEtBQUs7QUFBQSxNQUN4QixPQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsT0FBTztBQUFBO0FBQUEsRUFHVCxNQUFNLENBQUMsUUFBUSxLQUFLO0FBQUEsSUFDbEIsV0FBVyxNQUFNLFFBQVE7QUFBQSxNQUN2QixJQUFJLEdBQUcsTUFBTSxTQUFTLEdBQUcsR0FBRztBQUFBLFFBQzFCLE9BQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTztBQUFBO0FBQUEsRUFNVCxRQUFRLENBQUMsSUFBSSxjQUFjO0FBQUEsSUFDekIsTUFBTSxNQUFNLENBQUM7QUFBQSxJQUNiLEdBQUcsTUFBTSxRQUFRLENBQUMsS0FBSyxRQUFRO0FBQUEsTUFDN0IsSUFBSSxDQUFDLEtBQUssT0FBTyxjQUFjLEdBQUcsR0FBRztBQUFBLFFBQ25DLElBQUksS0FBSyxHQUFHLE1BQU0sSUFBSTtBQUFBLE1BQ3hCO0FBQUEsS0FDRDtBQUFBLElBQ0QsT0FBTyxFQUFFLE9BQU8sSUFBSTtBQUFBO0FBQUEsRUFFdEIsaUJBQWlCLENBQUMsUUFBUTtBQUFBLElBQ3hCLElBQUksT0FBTyxLQUFLO0FBQUEsTUFDZCxPQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsSUFBSSxPQUFPLE1BQU07QUFBQSxNQUNmLElBQUksT0FBTyxTQUFTLFVBQVU7QUFBQSxRQUM1QixPQUFPO0FBQUEsTUFDVDtBQUFBLE1BQ0EsSUFBSSxPQUFPLFNBQVMsVUFBVTtBQUFBLFFBQzVCLE9BQU87QUFBQSxNQUNUO0FBQUEsTUFDQSxJQUFJLE9BQU8sU0FBUyxXQUFXO0FBQUEsUUFDN0IsT0FBTztBQUFBLE1BQ1Q7QUFBQSxNQUNBLE9BQU87QUFBQSxJQUNUO0FBQUEsSUFDQSxRQUFRLE9BQU87QUFBQSxXQUNSO0FBQUEsV0FDSztBQUFBLFFBQ1IsT0FBTztBQUFBLFdBQ0o7QUFBQSxRQUNILE9BQU87QUFBQSxXQUNKO0FBQUEsUUFDSCxPQUFPO0FBQUE7QUFBQSxRQUVQLE9BQU8sT0FBTztBQUFBO0FBQUE7QUFBQSxFQUdwQixRQUFRLENBQUMsT0FBTyxJQUFJO0FBQUEsSUFDbEIsT0FBTyxNQUFNLEtBQUssQ0FBQyxTQUFTLEtBQUssT0FBTyxFQUFFO0FBQUE7QUFBQSxFQUU1QyxnQkFBZ0IsQ0FBQyxNQUFNO0FBQUEsSUFDckIsSUFBSSxpQkFBaUI7QUFBQSxJQUNyQixJQUFJLGVBQWU7QUFBQSxJQUNuQixRQUFRO0FBQUEsV0FDRDtBQUFBLFdBQ0E7QUFBQSxXQUNBO0FBQUEsUUFDSCxlQUFlO0FBQUEsUUFDZjtBQUFBLFdBQ0c7QUFBQSxXQUNBO0FBQUEsV0FDQTtBQUFBLFFBQ0gsaUJBQWlCLEtBQUssUUFBUSxXQUFXLEVBQUU7QUFBQSxRQUMzQyxlQUFlO0FBQUEsUUFDZjtBQUFBO0FBQUEsSUFFSixPQUFPLEVBQUUsZ0JBQWdCLGFBQWE7QUFBQTtBQUFBLEVBRXhDLGlCQUFpQixDQUFDLFFBQVEsT0FBTyxVQUFVLFlBQVksUUFBUSxNQUFNO0FBQUEsSUFDbkUsTUFBTSxXQUFXLFNBQVMsSUFBSSxPQUFPLEVBQUU7QUFBQSxJQUN2QyxNQUFNLFVBQVUsV0FBVyxJQUFJLE9BQU8sRUFBRSxLQUFLO0FBQUEsSUFDN0MsTUFBTSxPQUFPLEtBQUssU0FBUyxPQUFPLE9BQU8sRUFBRTtBQUFBLElBQzNDLElBQUksTUFBTTtBQUFBLE1BQ1IsS0FBSyxZQUFZLE9BQU87QUFBQSxNQUN4QixLQUFLLG9CQUFvQixLQUFLLGtCQUFrQixPQUFPLE9BQU87QUFBQSxNQUM5RCxLQUFLLGFBQWEsT0FBTyxRQUFRLEtBQUssR0FBRztBQUFBLElBQzNDLEVBQU87QUFBQSxNQUNMLE1BQU0sV0FBVztBQUFBLFFBQ2YsSUFBSSxPQUFPO0FBQUEsUUFDWCxPQUFPLE9BQU87QUFBQSxRQUNkLFdBQVcsT0FBTztBQUFBLFFBQ2xCLFlBQVk7QUFBQSxRQUNaO0FBQUEsUUFDQSxTQUFTLE9BQU8sV0FBVyxXQUFXO0FBQUEsUUFDdEMsV0FBVyxPQUFPO0FBQUEsUUFDbEIsbUJBQW1CLEtBQUssa0JBQWtCLENBQUMsV0FBVyxRQUFRLEdBQUcsT0FBTyxPQUFPLENBQUM7QUFBQSxRQUNoRixZQUFZLGFBQWEsT0FBTyxRQUFRLEtBQUssR0FBRztBQUFBLFFBQ2hELEtBQUssT0FBTztBQUFBLFFBQ1osT0FBTyxPQUFPO0FBQUEsUUFDZDtBQUFBLFFBQ0EsTUFBTSxPQUFPO0FBQUEsUUFDYixZQUFZLE9BQU87QUFBQSxRQUNuQixTQUFTLEtBQUssV0FBVyxPQUFPLEVBQUU7QUFBQSxRQUNsQyxNQUFNLE9BQU87QUFBQSxRQUNiLEtBQUssT0FBTztBQUFBLFFBQ1osS0FBSyxPQUFPO0FBQUEsUUFDWixZQUFZLE9BQU87QUFBQSxRQUNuQixhQUFhLE9BQU87QUFBQSxRQUNwQixZQUFZLE9BQU87QUFBQSxNQUNyQjtBQUFBLE1BQ0EsSUFBSSxTQUFTO0FBQUEsUUFDWCxNQUFNLEtBQUs7QUFBQSxhQUNOO0FBQUEsVUFDSCxTQUFTO0FBQUEsVUFDVCxPQUFPO0FBQUEsUUFDVCxDQUFDO0FBQUEsTUFDSCxFQUFPO0FBQUEsUUFDTCxNQUFNLEtBQUs7QUFBQSxhQUNOO0FBQUEsVUFDSCxTQUFTO0FBQUEsVUFDVCxPQUFPLEtBQUssa0JBQWtCLE1BQU07QUFBQSxRQUN0QyxDQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJUCxpQkFBaUIsQ0FBQyxXQUFXO0FBQUEsSUFDM0IsSUFBSSxpQkFBaUIsQ0FBQztBQUFBLElBQ3RCLFdBQVcsZUFBZSxXQUFXO0FBQUEsTUFDbkMsTUFBTSxXQUFXLEtBQUssUUFBUSxJQUFJLFdBQVc7QUFBQSxNQUM3QyxJQUFJLFVBQVUsUUFBUTtBQUFBLFFBQ3BCLGlCQUFpQixDQUFDLEdBQUcsZ0JBQWdCLEdBQUcsU0FBUyxVQUFVLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDO0FBQUEsTUFDcEY7QUFBQSxNQUNBLElBQUksVUFBVSxZQUFZO0FBQUEsUUFDeEIsaUJBQWlCLENBQUMsR0FBRyxnQkFBZ0IsR0FBRyxTQUFTLGNBQWMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7QUFBQSxNQUN4RjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQTtBQUFBLEVBRVQsT0FBTyxHQUFHO0FBQUEsSUFDUixNQUFNLFNBQVMsV0FBVTtBQUFBLElBQ3pCLE1BQU0sUUFBUSxDQUFDO0FBQUEsSUFDZixNQUFNLFFBQVEsQ0FBQztBQUFBLElBQ2YsTUFBTSxZQUFZLEtBQUssYUFBYTtBQUFBLElBQ3BDLE1BQU0sMkJBQTJCLElBQUk7QUFBQSxJQUNyQyxNQUFNLDZCQUE2QixJQUFJO0FBQUEsSUFDdkMsU0FBUyxJQUFJLFVBQVUsU0FBUyxFQUFHLEtBQUssR0FBRyxLQUFLO0FBQUEsTUFDOUMsTUFBTSxXQUFXLFVBQVU7QUFBQSxNQUMzQixJQUFJLFNBQVMsTUFBTSxTQUFTLEdBQUc7QUFBQSxRQUM3QixXQUFXLElBQUksU0FBUyxJQUFJLElBQUk7QUFBQSxNQUNsQztBQUFBLE1BQ0EsV0FBVyxNQUFNLFNBQVMsT0FBTztBQUFBLFFBQy9CLFNBQVMsSUFBSSxJQUFJLFNBQVMsRUFBRTtBQUFBLE1BQzlCO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUyxJQUFJLFVBQVUsU0FBUyxFQUFHLEtBQUssR0FBRyxLQUFLO0FBQUEsTUFDOUMsTUFBTSxXQUFXLFVBQVU7QUFBQSxNQUMzQixNQUFNLEtBQUs7QUFBQSxRQUNULElBQUksU0FBUztBQUFBLFFBQ2IsT0FBTyxTQUFTO0FBQUEsUUFDaEIsWUFBWTtBQUFBLFFBQ1osV0FBVyxTQUFTO0FBQUEsUUFDcEIsVUFBVSxTQUFTLElBQUksU0FBUyxFQUFFO0FBQUEsUUFDbEMsU0FBUztBQUFBLFFBQ1QsbUJBQW1CLEtBQUssa0JBQWtCLFNBQVMsT0FBTztBQUFBLFFBQzFELFlBQVksU0FBUyxRQUFRLEtBQUssR0FBRztBQUFBLFFBQ3JDLE9BQU87QUFBQSxRQUNQLEtBQUssU0FBUztBQUFBLFFBQ2QsU0FBUztBQUFBLFFBQ1QsTUFBTSxPQUFPO0FBQUEsTUFDZixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsTUFBTSxJQUFJLEtBQUssWUFBWTtBQUFBLElBQzNCLEVBQUUsUUFBUSxDQUFDLFdBQVc7QUFBQSxNQUNwQixLQUFLLGtCQUFrQixRQUFRLE9BQU8sVUFBVSxZQUFZLFFBQVEsT0FBTyxRQUFRLFNBQVM7QUFBQSxLQUM3RjtBQUFBLElBQ0QsTUFBTSxJQUFJLEtBQUssU0FBUztBQUFBLElBQ3hCLEVBQUUsUUFBUSxDQUFDLFNBQVMsVUFBVTtBQUFBLE1BQzVCLFFBQVEsZ0JBQWdCLGlCQUFpQixLQUFLLGlCQUFpQixRQUFRLElBQUk7QUFBQSxNQUMzRSxNQUFNLFNBQVMsQ0FBQyxHQUFHLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztBQUFBLE1BQ3ZDLElBQUksUUFBUSxPQUFPO0FBQUEsUUFDakIsT0FBTyxLQUFLLEdBQUcsUUFBUSxLQUFLO0FBQUEsTUFDOUI7QUFBQSxNQUNBLE1BQU0sT0FBTztBQUFBLFFBQ1gsSUFBSSxVQUFVLFFBQVEsT0FBTyxRQUFRLEtBQUssRUFBRSxTQUFTLE9BQU8sUUFBUSxJQUFJLEdBQUcsUUFBUSxFQUFFO0FBQUEsUUFDckYsaUJBQWlCLFFBQVE7QUFBQSxRQUN6QixPQUFPLFFBQVE7QUFBQSxRQUNmLEtBQUssUUFBUTtBQUFBLFFBQ2IsTUFBTSxRQUFRLFFBQVE7QUFBQSxRQUN0QixPQUFPLFFBQVE7QUFBQSxRQUNmLFdBQVcsUUFBUTtBQUFBLFFBQ25CLFVBQVU7QUFBQSxRQUNWLFdBQVcsUUFBUTtBQUFBLFFBQ25CLFFBQVEsUUFBUTtBQUFBLFFBQ2hCLFNBQVMsU0FBUyxXQUFXLGNBQWMsS0FBSztBQUFBLFFBQ2hELGdCQUFnQixTQUFTLFdBQVcsZUFBZSxTQUFTLFNBQVMsZUFBZSxTQUFTO0FBQUEsUUFDN0YsY0FBYyxTQUFTLFdBQVcsZUFBZSxTQUFTLFNBQVMsZUFBZSxTQUFTO0FBQUEsUUFDM0YsZ0JBQWdCO0FBQUEsUUFDaEIsbUJBQW1CLEtBQUssa0JBQWtCLFFBQVEsT0FBTztBQUFBLFFBQ3pELFlBQVk7QUFBQSxRQUNaLE9BQU87QUFBQSxRQUNQLFNBQVMsUUFBUTtBQUFBLFFBQ2pCLE1BQU0sT0FBTztBQUFBLFFBQ2IsU0FBUyxRQUFRO0FBQUEsUUFDakIsV0FBVyxRQUFRO0FBQUEsUUFDbkIsT0FBTyxRQUFRLGVBQWUsS0FBSyxNQUFNLHNCQUFzQixPQUFPLFdBQVc7QUFBQSxNQUNuRjtBQUFBLE1BQ0EsTUFBTSxLQUFLLElBQUk7QUFBQSxLQUNoQjtBQUFBLElBQ0QsT0FBTyxFQUFFLE9BQU8sT0FBTyxPQUFPLENBQUMsR0FBRyxPQUFPO0FBQUE7QUFBQSxFQUUzQyxhQUFhLEdBQUc7QUFBQSxJQUNkLE9BQU8sZUFBYztBQUFBO0FBRXpCO0FBR0EsSUFBSSw2QkFBNkIsT0FBTyxRQUFRLENBQUMsTUFBTSxZQUFZO0FBQUEsRUFDakUsT0FBTyxXQUFXLEdBQUcsV0FBVztBQUFBLEdBQy9CLFlBQVk7QUFDZixJQUFJLHVCQUF1QixPQUFPLGNBQWMsQ0FBQyxNQUFNLElBQUksVUFBVSxNQUFNO0FBQUEsRUFDekUsSUFBSSxLQUFLLE9BQU87QUFBQSxFQUNoQixJQUFJLEtBQUssOEJBQThCLEVBQUU7QUFBQSxFQUN6QyxRQUFRLGVBQWUsV0FBVyxNQUFNLFdBQVcsV0FBVTtBQUFBLEVBQzdELEtBQUssR0FBRyxhQUFhLEVBQUU7QUFBQSxFQUN2QixJQUFJLE1BQU0sa0JBQWtCO0FBQUEsRUFDNUIsTUFBTSxjQUFjLEtBQUssR0FBRyxRQUFRO0FBQUEsRUFDcEMsSUFBSSxNQUFNLFVBQVUsV0FBVztBQUFBLEVBQy9CLE1BQU0sTUFBTSxrQkFBa0IsSUFBSSxhQUFhO0FBQUEsRUFDL0MsTUFBTSxZQUFZLEtBQUssR0FBRyxhQUFhO0FBQUEsRUFDdkMsWUFBWSxPQUFPLEtBQUs7QUFBQSxFQUN4QixZQUFZLGtCQUFrQiw2QkFBNkIsTUFBTTtBQUFBLEVBQ2pFLElBQUksWUFBWSxvQkFBb0IsV0FBVyxXQUFXLE9BQU87QUFBQSxJQUMvRCxJQUFJLEtBQ0YsNk9BQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxZQUFZLFlBQVk7QUFBQSxFQUN4QixZQUFZLGNBQWMsTUFBTSxlQUFlO0FBQUEsRUFDL0MsWUFBWSxjQUFjLE1BQU0sZUFBZTtBQUFBLEVBQy9DLFlBQVksVUFBVSxDQUFDLFNBQVMsVUFBVSxPQUFPO0FBQUEsRUFDakQsWUFBWSxZQUFZO0FBQUEsRUFDeEIsSUFBSSxNQUFNLFNBQVMsV0FBVztBQUFBLEVBQzlCLE1BQU0sT0FBTyxhQUFhLEdBQUc7QUFBQSxFQUM3QixNQUFNLFVBQVUsWUFBWSxPQUFPLFdBQVcsa0JBQWtCO0FBQUEsRUFDaEUsY0FBYyxZQUNaLEtBQ0Esc0JBQ0EsTUFBTSxrQkFBa0IsR0FDeEIsS0FBSyxHQUFHLGdCQUFnQixDQUMxQjtBQUFBLEVBQ0Esb0JBQW9CLEtBQUssU0FBUyxhQUFhLE1BQU0sZUFBZSxLQUFLO0FBQUEsR0FDeEUsTUFBTTtBQUNULElBQUksa0NBQWtDO0FBQUEsRUFDcEM7QUFBQSxFQUNBO0FBQ0Y7QUFHQSxJQUFJLFNBQVUsUUFBUSxHQUFHO0FBQUEsRUFDdkIsSUFBSSxvQkFBb0IsT0FBTyxRQUFRLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRztBQUFBLElBQ25ELEtBQUssS0FBSyxNQUFNLENBQUMsR0FBRyxJQUFJLEVBQUUsT0FBUSxLQUFLLEdBQUcsRUFBRSxNQUFNO0FBQUE7QUFBQSxJQUNsRCxPQUFPO0FBQUEsS0FDTixHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxH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bUJBQW1CLElBQUksZ0JBQWdCLElBQUksZ0JBQWdCLElBQUksUUFBUSxJQUFJLGVBQWUsSUFBSSxhQUFhLEtBQUssZ0JBQWdCLEtBQUssV0FBVyxLQUFLLGVBQWUsS0FBSyxPQUFPLEtBQUssU0FBUyxLQUFLLGVBQWUsS0FBSyxRQUFRLEtBQUssUUFBUSxLQUFLLE9BQU8sS0FBSyxTQUFTLEtBQUssUUFBUSxLQUFLLGdCQUFnQixLQUFLLFFBQVEsS0FBSyxZQUFZLEtBQUssYUFBYSxLQUFLLGdCQUFnQixLQUFLLGdCQUFnQixLQUFLLGdCQUFnQixLQUFLLGdCQUFnQixLQUFLLGVBQWU7QUFBQSxJQUNoNUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcs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QjtBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxFQUFFLE1BQU0sT0FBTyxPQUFPLEtBQUs7QUFBQSxVQUNwQztBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxFQUFFLE1BQU0sT0FBTyxPQUFPLEtBQUs7QUFBQSxVQUNwQztBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxFQUFFLE1BQU0sT0FBTyxPQUFPLEtBQUs7QUFBQSxVQUNwQztBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxFQUFFLE1BQU0sT0FBTyxPQUFPLEtBQUs7QUFBQSxVQUNwQztBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxFQUFFLE1BQU0sT0FBTyxPQUFPLEtBQUs7QUFBQSxVQUNwQztBQUFBO0FBQUEsT0FFSCxXQUFXO0FBQUEsSUFDZCxPQUFPLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEdBQUcsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEdBQUcsR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLElBQUksR0FBRyxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxHQUFHLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEdBQUcsR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLElBQUksR0FBRyxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxLQUFLLElBQUksR0FBRyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEdBQUcsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEtBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxLQUFLLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksS0FBSyxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxNQUFNLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLEtBQUssS0FBSyxLQUFLLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsS0FBSyxLQUFLLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLEtBQUssS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLEtBQUssR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLEtBQUssS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLEtBQUssR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLEtBQUssS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLEtBQUssR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksS0FBSyxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssS0FBSyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLE1BQU0sSUFBSSxLQUFLLElBQUksTUFBTSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksS0FBSyxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxNQUFNLElBQUksS0FBSyxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssS0FBSyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxNQUFNLElBQUksS0FBSyxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssS0FBSyxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksS0FBSyxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssS0FBSyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksTUFBTSxJQUFJLEtBQUssS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLEtBQUssR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLE1BQU0sSUFBSSxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxNQUFNLElBQUksS0FBSyxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssS0FBSyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksTUFBTSxJQUFJLEtBQUssS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLEtBQUssR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksTUFBTSxJQUFJLEtBQUssS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLEtBQUssR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLE1BQU0sSUFBSSxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxNQUFNLElBQUksS0FBSyxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssS0FBSyxHQUFHLEVBQUUsSUFBSSxNQUFNLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxJQUFJLE1BQU0sSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLEtBQUssS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLEtBQUssR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksTUFBTSxJQUFJLEtBQUssS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLEtBQUssR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLEtBQUssS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLEtBQUssR0FBRyxFQUFFLE1BQU0sS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksS0FBSyxLQUFLLE1BQU0sS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLEtBQUssR0FBRyxFQUFFLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksS0FBSyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsS0FBSyxNQUFNLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLEtBQUssS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLEtBQUssTUFBTSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssS0FBSyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLEtBQUssS0FBSyxNQUFNLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLE1BQU0sSUFBSSxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLE1BQU0sSUFBSSxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksTUFBTSxJQUFJLEtBQUssS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLEtBQUssR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEtBQUssS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxLQUFLLEtBQUssSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxLQUFLLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxLQUFLLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLEtBQUssS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxLQUFLLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sS0FBSyxNQUFNLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssR0FBRyxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxHQUFHLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxLQUFLLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxLQUFLLEtBQUssSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxLQUFLLEtBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsS0FBSyxLQUFLLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksTUFBTSxJQUFJLEtBQUssS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLEtBQUssR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxFQUFFLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksS0FBSyxLQUFLLE1BQU0sS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLEtBQUssR0FBRyxFQUFFLElBQUksTUFBTSxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksS0FBSyxLQUFLLE1BQU0sS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLEtBQUssR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxLQUFLLEtBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsS0FBSyxLQUFLLENBQUMsQ0FBQztBQUFBLElBQ3hqYixnQkFBZ0IsQ0FBQztBQUFBLElBQ2pCLDRCQUE0QixPQUFPLFNBQVMsVUFBVSxDQUFDLEtBQUssTUFBTTtBQUFBLE1BQ2hFLElBQUksS0FBSyxhQUFhO0FBQUEs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UztBQUFBLFlBQ2QsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxLQUFLLFNBQVM7QUFBQSxZQUNkLE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsS0FBSyxTQUFTO0FBQUEsWUFDZCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxLQUFLLFNBQVM7QUFBQSxZQUNkLE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsS0FBSyxVQUFVLFVBQVU7QUFBQSxZQUN6QixPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsS0FBSyxTQUFTO0FBQUEsWUFDZCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILEtBQUssVUFBVSxlQUFlO0FBQUEsWUFDOUIsT0FBTztBQUFBLFlBQ1A7QUFBQSxl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TSxHQUFHLE1BQVEsRUFBRSxPQUFTLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxHQUFHLEdBQUcsV0FBYSxNQUFNLEdBQUcsT0FBUyxFQUFFLE9BQVMsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxHQUFHLEdBQUcsV0FBYSxNQUFNLEdBQUcsZ0JBQWtCLEVBQUUsT0FBUyxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEdBQUcsR0FBRyxXQUFhLE1BQU0sR0FBRyxlQUFpQixFQUFFLE9BQVMsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxHQUFHLEdBQUcsV0FBYSxNQUFNLEdBQUcsVUFBWSxFQUFFLE9BQVMsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxHQUFHLEdBQUcsV0FBYSxNQUFNLEdBQUcsVUFBWSxFQUFFLE9BQVMsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEdBQUcsR0FBRyxXQUFhLE1BQU0sR0FBRyxhQUFlLEVBQUUsT0FBUyxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEdBQUcsR0FBRyxXQUFhLE1BQU0sR0FBRyxNQUFRLEVBQUUsT0FBUyxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssR0FBRyxHQUFHLFdBQWEsTUFBTSxHQUFHLFFBQVUsRUFBRSxPQUFTLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxHQUFHLEdBQUcsV0FBYSxNQUFNLEdBQUcsS0FBTyxFQUFFLE9BQVMsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxHQUFHLEdBQUcsV0FBYSxNQUFNLEdBQUcscUJBQXVCLEVBQUUsT0FBUyxDQUFDLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEdBQUcsR0FBRyxXQUFhLE1BQU0sR0FBRyxXQUFhLEVBQUUsT0FBUyxDQUFDLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssS0FBSyxHQUFHLEdBQUcsV0FBYSxNQUFNLEdBQUcsV0FBYSxFQUFFLE9BQVMsQ0FBQyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxLQUFLLEtBQUssR0FBRyxHQUFHLFdBQWEsTUFBTSxHQUFHLFdBQWEsRUFBRSxPQUFTLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxLQUFLLEtBQUssR0FBRyxHQUFHLFdBQWEsTUFBTSxHQUFHLFFBQVUsRUFBRSxPQUFTLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFB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
