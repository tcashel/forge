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
  setupViewPortForSVG
} from "./chunk-main-snyzap23.js";
import {
  isLabelStyle,
  styles2String
} from "./chunk-main-4ceh9h9g.js";
import {
  cleanAndMerge
} from "./chunk-main-vvfzntzy.js";
import"./chunk-main-ck580f0k.js";
import {
  clear,
  configureSvgSize,
  defaultConfig_default,
  getAccDescription,
  getAccTitle,
  getConfig,
  getDiagramTitle,
  getThemeVariables3,
  setAccDescription,
  setAccTitle,
  setDiagramTitle
} from "./chunk-main-aws590jt.js";
import {
  __name,
  format,
  hierarchy,
  log,
  ordinal,
  select_default,
  treemap_default
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-x0xz2rje.js";
import"./chunk-main-rxe1mr61.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/diagram-OG6HWLK6.mjs
var TreeMapDB = class {
  constructor() {
    this.nodes = [];
    this.levels = /* @__PURE__ */ new Map;
    this.outerNodes = [];
    this.classes = /* @__PURE__ */ new Map;
    this.setAccTitle = setAccTitle;
    this.getAccTitle = getAccTitle;
    this.setDiagramTitle = setDiagramTitle;
    this.getDiagramTitle = getDiagramTitle;
    this.getAccDescription = getAccDescription;
    this.setAccDescription = setAccDescription;
  }
  static {
    __name(this, "TreeMapDB");
  }
  getNodes() {
    return this.nodes;
  }
  getConfig() {
    const defaultConfig = defaultConfig_default;
    const userConfig = getConfig();
    return cleanAndMerge({
      ...defaultConfig.treemap,
      ...userConfig.treemap ?? {}
    });
  }
  addNode(node, level) {
    this.nodes.push(node);
    this.levels.set(node, level);
    if (level === 0) {
      this.outerNodes.push(node);
      this.root ??= node;
    }
  }
  getRoot() {
    return { name: "", children: this.outerNodes };
  }
  addClass(id, _style) {
    const styleClass = this.classes.get(id) ?? { id, styles: [], textStyles: [] };
    const styles = _style.replace(/\\,/g, "§§§").replace(/,/g, ";").replace(/§§§/g, ",").split(";");
    if (styles) {
      styles.forEach((s) => {
        if (isLabelStyle(s)) {
          if (styleClass?.textStyles) {
            styleClass.textStyles.push(s);
          } else {
            styleClass.textStyles = [s];
          }
        }
        if (styleClass?.styles) {
          styleClass.styles.push(s);
        } else {
          styleClass.styles = [s];
        }
      });
    }
    this.classes.set(id, styleClass);
  }
  getClasses() {
    return this.classes;
  }
  getStylesForClass(classSelector) {
    return this.classes.get(classSelector)?.styles ?? [];
  }
  clear() {
    clear();
    this.nodes = [];
    this.levels = /* @__PURE__ */ new Map;
    this.outerNodes = [];
    this.classes = /* @__PURE__ */ new Map;
    this.root = undefined;
  }
};
function buildHierarchy(items) {
  if (!items.length) {
    return [];
  }
  const root = [];
  const stack = [];
  items.forEach((item) => {
    const node = {
      name: item.name,
      children: item.type === "Leaf" ? undefined : []
    };
    node.classSelector = item?.classSelector;
    if (item?.cssCompiledStyles) {
      node.cssCompiledStyles = item.cssCompiledStyles;
    }
    if (item.type === "Leaf" && item.value !== undefined) {
      node.value = item.value;
    }
    while (stack.length > 0 && stack[stack.length - 1].level >= item.level) {
      stack.pop();
    }
    if (stack.length === 0) {
      root.push(node);
    } else {
      const parent = stack[stack.length - 1].node;
      if (parent.children) {
        parent.children.push(node);
      } else {
        parent.children = [node];
      }
    }
    if (item.type !== "Leaf") {
      stack.push({ node, level: item.level });
    }
  });
  return root;
}
__name(buildHierarchy, "buildHierarchy");
var populate = /* @__PURE__ */ __name((ast, db) => {
  populateCommonDb(ast, db);
  const items = [];
  for (const row of ast.TreemapRows ?? []) {
    if (row.$type === "ClassDefStatement") {
      db.addClass(row.className ?? "", row.styleText ?? "");
    }
  }
  for (const row of ast.TreemapRows ?? []) {
    const item = row.item;
    if (!item) {
      continue;
    }
    const level = row.indent ? parseInt(row.indent) : 0;
    const name = getItemName(item);
    const styles = item.classSelector ? db.getStylesForClass(item.classSelector) : [];
    const cssCompiledStyles = styles.length > 0 ? styles : undefined;
    const itemData = {
      level,
      name,
      type: item.$type,
      value: item.value,
      classSelector: item.classSelector,
      cssCompiledStyles
    };
    items.push(itemData);
  }
  const hierarchyNodes = buildHierarchy(items);
  const addNodesRecursively = /* @__PURE__ */ __name((nodes, level) => {
    for (const node of nodes) {
      db.addNode(node, level);
      if (node.children && node.children.length > 0) {
        addNodesRecursively(node.children, level + 1);
      }
    }
  }, "addNodesRecursively");
  addNodesRecursively(hierarchyNodes, 0);
}, "populate");
var getItemName = /* @__PURE__ */ __name((item) => {
  return item.name ? String(item.name) : "";
}, "getItemName");
var parser = {
  parser: { yy: undefined },
  parse: /* @__PURE__ */ __name(async (text) => {
    try {
      const parseFunc = parse;
      const ast = await parseFunc("treemap", text);
      log.debug("Treemap AST:", ast);
      const db = parser.parser?.yy;
      if (!(db instanceof TreeMapDB)) {
        throw new Error("parser.parser?.yy was not a TreemapDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.");
      }
      populate(ast, db);
    } catch (error) {
      log.error("Error parsing treemap:", error);
      throw error;
    }
  }, "parse")
};
var DEFAULT_INNER_PADDING = 10;
var SECTION_INNER_PADDING = 10;
var SECTION_HEADER_HEIGHT = 25;
var draw = /* @__PURE__ */ __name((_text, id, _version, diagram2) => {
  const treemapDb = diagram2.db;
  const config = treemapDb.getConfig();
  const treemapInnerPadding = config.padding ?? DEFAULT_INNER_PADDING;
  const title = treemapDb.getDiagramTitle();
  const root = treemapDb.getRoot();
  const { themeVariables } = getConfig();
  if (!root) {
    return;
  }
  const titleHeight = title ? 30 : 0;
  const svg = selectSvgElement(id);
  const width = config.nodeWidth ? config.nodeWidth * SECTION_INNER_PADDING : 960;
  const height = config.nodeHeight ? config.nodeHeight * SECTION_INNER_PADDING : 500;
  const svgWidth = width;
  const svgHeight = height + titleHeight;
  svg.attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
  configureSvgSize(svg, svgHeight, svgWidth, config.useMaxWidth);
  let valueFormat;
  try {
    const formatStr = config.valueFormat || ",";
    if (formatStr === "$0,0") {
      valueFormat = /* @__PURE__ */ __name((value) => "$" + format(",")(value), "valueFormat");
    } else if (formatStr.startsWith("$") && formatStr.includes(",")) {
      const precision = /\.\d+/.exec(formatStr);
      const precisionStr = precision ? precision[0] : "";
      valueFormat = /* @__PURE__ */ __name((value) => "$" + format("," + precisionStr)(value), "valueFormat");
    } else if (formatStr.startsWith("$")) {
      const restOfFormat = formatStr.substring(1);
      valueFormat = /* @__PURE__ */ __name((value) => "$" + format(restOfFormat || "")(value), "valueFormat");
    } else {
      valueFormat = format(formatStr);
    }
  } catch (error) {
    log.error("Error creating format function:", error);
    valueFormat = format(",");
  }
  const colorScale = ordinal().range([
    "transparent",
    themeVariables.cScale0,
    themeVariables.cScale1,
    themeVariables.cScale2,
    themeVariables.cScale3,
    themeVariables.cScale4,
    themeVariables.cScale5,
    themeVariables.cScale6,
    themeVariables.cScale7,
    themeVariables.cScale8,
    themeVariables.cScale9,
    themeVariables.cScale10,
    themeVariables.cScale11
  ]);
  const colorScalePeer = ordinal().range([
    "transparent",
    themeVariables.cScalePeer0,
    themeVariables.cScalePeer1,
    themeVariables.cScalePeer2,
    themeVariables.cScalePeer3,
    themeVariables.cScalePeer4,
    themeVariables.cScalePeer5,
    themeVariables.cScalePeer6,
    themeVariables.cScalePeer7,
    themeVariables.cScalePeer8,
    themeVariables.cScalePeer9,
    themeVariables.cScalePeer10,
    themeVariables.cScalePeer11
  ]);
  const colorScaleLabel = ordinal().range([
    themeVariables.cScaleLabel0,
    themeVariables.cScaleLabel1,
    themeVariables.cScaleLabel2,
    themeVariables.cScaleLabel3,
    themeVariables.cScaleLabel4,
    themeVariables.cScaleLabel5,
    themeVariables.cScaleLabel6,
    themeVariables.cScaleLabel7,
    themeVariables.cScaleLabel8,
    themeVariables.cScaleLabel9,
    themeVariables.cScaleLabel10,
    themeVariables.cScaleLabel11
  ]);
  if (title) {
    svg.append("text").attr("x", svgWidth / 2).attr("y", titleHeight / 2).attr("class", "treemapTitle").attr("text-anchor", "middle").attr("dominant-baseline", "middle").text(title);
  }
  const g = svg.append("g").attr("transform", `translate(0, ${titleHeight})`).attr("class", "treemapContainer");
  const hierarchyRoot = hierarchy(root).sum((d) => d.value ?? 0).sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  const treemapLayout = treemap_default().size([width, height]).paddingTop((d) => d.children && d.children.length > 0 ? SECTION_HEADER_HEIGHT + SECTION_INNER_PADDING : 0).paddingInner(treemapInnerPadding).paddingLeft((d) => d.children && d.children.length > 0 ? SECTION_INNER_PADDING : 0).paddingRight((d) => d.children && d.children.length > 0 ? SECTION_INNER_PADDING : 0).paddingBottom((d) => d.children && d.children.length > 0 ? SECTION_INNER_PADDING : 0).round(true);
  const treemapData = treemapLayout(hierarchyRoot);
  const branchNodes = treemapData.descendants().filter((d) => d.children && d.children.length > 0);
  const sections = g.selectAll(".treemapSection").data(branchNodes).enter().append("g").attr("class", "treemapSection").attr("transform", (d) => `translate(${d.x0},${d.y0})`);
  sections.append("rect").attr("width", (d) => d.x1 - d.x0).attr("height", SECTION_HEADER_HEIGHT).attr("class", "treemapSectionHeader").attr("fill", "none").attr("fill-opacity", 0.6).attr("stroke-width", 0.6).attr("style", (d) => {
    if (d.depth === 0) {
      return "display: none;";
    }
    return "";
  });
  sections.append("clipPath").attr("id", (_d, i) => `clip-section-${id}-${i}`).append("rect").attr("width", (d) => Math.max(0, d.x1 - d.x0 - 12)).attr("height", SECTION_HEADER_HEIGHT);
  sections.append("rect").attr("width", (d) => d.x1 - d.x0).attr("height", (d) => d.y1 - d.y0).attr("class", (_d, i) => {
    return `treemapSection section${i}`;
  }).attr("fill", (d) => colorScale(d.data.name)).attr("fill-opacity", 0.6).attr("stroke", (d) => colorScalePeer(d.data.name)).attr("stroke-width", 2).attr("stroke-opacity", 0.4).attr("style", (d) => {
    if (d.depth === 0) {
      return "display: none;";
    }
    const styles = styles2String({ cssCompiledStyles: d.data.cssCompiledStyles });
    return styles.nodeStyles + ";" + styles.borderStyles.join(";");
  });
  sections.append("text").attr("class", "treemapSectionLabel").attr("x", 6).attr("y", SECTION_HEADER_HEIGHT / 2).attr("dominant-baseline", "middle").text((d) => d.depth === 0 ? "" : d.data.name).attr("font-weight", "bold").attr("style", (d) => {
    if (d.depth === 0) {
      return "display: none;";
    }
    const labelStyles = "dominant-baseline: middle; font-size: 12px; fill:" + colorScaleLabel(d.data.name) + "; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;";
    const styles = styles2String({ cssCompiledStyles: d.data.cssCompiledStyles });
    return labelStyles + styles.labelStyles.replace("color:", "fill:");
  }).each(function(d) {
    if (d.depth === 0) {
      return;
    }
    const self = select_default(this);
    const originalText = d.data.name;
    self.text(originalText);
    const totalHeaderWidth = d.x1 - d.x0;
    const labelXPosition = 6;
    let spaceForTextContent;
    if (config.showValues !== false && d.value) {
      const valueEndsAtXRelative = totalHeaderWidth - 10;
      const estimatedValueTextActualWidth = 30;
      const gapBetweenLabelAndValue = 10;
      const labelMustEndBeforeX = valueEndsAtXRelative - estimatedValueTextActualWidth - gapBetweenLabelAndValue;
      spaceForTextContent = labelMustEndBeforeX - labelXPosition;
    } else {
      const labelOwnRightPadding = 6;
      spaceForTextContent = totalHeaderWidth - labelXPosition - labelOwnRightPadding;
    }
    const minimumWidthToDisplay = 15;
    const actualAvailableWidth = Math.max(minimumWidthToDisplay, spaceForTextContent);
    const textNode = self.node();
    const currentTextContentLength = textNode.getComputedTextLength();
    if (currentTextContentLength > actualAvailableWidth) {
      const ellipsis = "...";
      let currentTruncatedText = originalText;
      while (currentTruncatedText.length > 0) {
        currentTruncatedText = originalText.substring(0, currentTruncatedText.length - 1);
        if (currentTruncatedText.length === 0) {
          self.text(ellipsis);
          if (textNode.getComputedTextLength() > actualAvailableWidth) {
            self.text("");
          }
          break;
        }
        self.text(currentTruncatedText + ellipsis);
        if (textNode.getComputedTextLength() <= actualAvailableWidth) {
          break;
        }
      }
    }
  });
  if (config.showValues !== false) {
    sections.append("text").attr("class", "treemapSectionValue").attr("x", (d) => d.x1 - d.x0 - 10).attr("y", SECTION_HEADER_HEIGHT / 2).attr("text-anchor", "end").attr("dominant-baseline", "middle").text((d) => d.value ? valueFormat(d.value) : "").attr("font-style", "italic").attr("style", (d) => {
      if (d.depth === 0) {
        return "display: none;";
      }
      const labelStyles = "text-anchor: end; dominant-baseline: middle; font-size: 10px; fill:" + colorScaleLabel(d.data.name) + "; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;";
      const styles = styles2String({ cssCompiledStyles: d.data.cssCompiledStyles });
      return labelStyles + styles.labelStyles.replace("color:", "fill:");
    });
  }
  const leafNodes = treemapData.leaves();
  const cell = g.selectAll(".treemapLeafGroup").data(leafNodes).enter().append("g").attr("class", (d, i) => {
    return `treemapNode treemapLeafGroup leaf${i}${d.data.classSelector ? ` ${d.data.classSelector}` : ""}x`;
  }).attr("transform", (d) => `translate(${d.x0},${d.y0})`);
  cell.append("rect").attr("width", (d) => d.x1 - d.x0).attr("height", (d) => d.y1 - d.y0).attr("class", "treemapLeaf").attr("fill", (d) => {
    return d.parent ? colorScale(d.parent.data.name) : colorScale(d.data.name);
  }).attr("style", (d) => {
    const styles = styles2String({ cssCompiledStyles: d.data.cssCompiledStyles });
    return styles.nodeStyles;
  }).attr("fill-opacity", 0.3).attr("stroke", (d) => {
    return d.parent ? colorScale(d.parent.data.name) : colorScale(d.data.name);
  }).attr("stroke-width", 3);
  cell.append("clipPath").attr("id", (_d, i) => `clip-${id}-${i}`).append("rect").attr("width", (d) => Math.max(0, d.x1 - d.x0 - 4)).attr("height", (d) => Math.max(0, d.y1 - d.y0 - 4));
  const leafLabels = cell.append("text").attr("class", "treemapLabel").attr("x", (d) => (d.x1 - d.x0) / 2).attr("y", (d) => (d.y1 - d.y0) / 2).attr("style", (d) => {
    const labelStyles = "text-anchor: middle; dominant-baseline: middle; font-size: 38px;fill:" + colorScaleLabel(d.data.name) + ";";
    const styles = styles2String({ cssCompiledStyles: d.data.cssCompiledStyles });
    return labelStyles + styles.labelStyles.replace("color:", "fill:");
  }).attr("clip-path", (_d, i) => `url(#clip-${id}-${i})`).text((d) => d.data.name);
  leafLabels.each(function(d) {
    const self = select_default(this);
    const nodeWidth = d.x1 - d.x0;
    const nodeHeight = d.y1 - d.y0;
    const textNode = self.node();
    const padding = 4;
    const availableWidth = nodeWidth - 2 * padding;
    const availableHeight = nodeHeight - 2 * padding;
    if (availableWidth < 10 || availableHeight < 10) {
      self.style("display", "none");
      return;
    }
    let currentLabelFontSize = parseInt(self.style("font-size"), 10);
    const minLabelFontSize = 8;
    const originalValueRelFontSize = 28;
    const valueScaleFactor = 0.6;
    const minValueFontSize = 6;
    const spacingBetweenLabelAndValue = 2;
    while (textNode.getComputedTextLength() > availableWidth && currentLabelFontSize > minLabelFontSize) {
      currentLabelFontSize--;
      self.style("font-size", `${currentLabelFontSize}px`);
    }
    let prospectiveValueFontSize = Math.max(minValueFontSize, Math.min(originalValueRelFontSize, Math.round(currentLabelFontSize * valueScaleFactor)));
    let combinedHeight = currentLabelFontSize + spacingBetweenLabelAndValue + prospectiveValueFontSize;
    while (combinedHeight > availableHeight && currentLabelFontSize > minLabelFontSize) {
      currentLabelFontSize--;
      prospectiveValueFontSize = Math.max(minValueFontSize, Math.min(originalValueRelFontSize, Math.round(currentLabelFontSize * valueScaleFactor)));
      if (prospectiveValueFontSize < minValueFontSize && currentLabelFontSize === minLabelFontSize) {
        break;
      }
      self.style("font-size", `${currentLabelFontSize}px`);
      combinedHeight = currentLabelFontSize + spacingBetweenLabelAndValue + prospectiveValueFontSize;
      if (prospectiveValueFontSize <= minValueFontSize && combinedHeight > availableHeight) {}
    }
    self.style("font-size", `${currentLabelFontSize}px`);
    if (textNode.getComputedTextLength() > availableWidth || currentLabelFontSize < minLabelFontSize || availableHeight < currentLabelFontSize) {
      self.style("display", "none");
    }
  });
  if (config.showValues !== false) {
    const leafValues = cell.append("text").attr("class", "treemapValue").attr("x", (d) => (d.x1 - d.x0) / 2).attr("y", function(d) {
      return (d.y1 - d.y0) / 2;
    }).attr("style", (d) => {
      const labelStyles = "text-anchor: middle; dominant-baseline: hanging; font-size: 28px;fill:" + colorScaleLabel(d.data.name) + ";";
      const styles = styles2String({ cssCompiledStyles: d.data.cssCompiledStyles });
      return labelStyles + styles.labelStyles.replace("color:", "fill:");
    }).attr("clip-path", (_d, i) => `url(#clip-${id}-${i})`).text((d) => d.value ? valueFormat(d.value) : "");
    leafValues.each(function(d) {
      const valueTextElement = select_default(this);
      const parentCellNode = this.parentNode;
      if (!parentCellNode) {
        valueTextElement.style("display", "none");
        return;
      }
      const labelElement = select_default(parentCellNode).select(".treemapLabel");
      if (labelElement.empty() || labelElement.style("display") === "none") {
        valueTextElement.style("display", "none");
        return;
      }
      const finalLabelFontSize = parseFloat(labelElement.style("font-size"));
      const originalValueFontSize = 28;
      const valueScaleFactor = 0.6;
      const minValueFontSize = 6;
      const spacingBetweenLabelAndValue = 2;
      const actualValueFontSize = Math.max(minValueFontSize, Math.min(originalValueFontSize, Math.round(finalLabelFontSize * valueScaleFactor)));
      valueTextElement.style("font-size", `${actualValueFontSize}px`);
      const labelCenterY = (d.y1 - d.y0) / 2;
      const valueTopActualY = labelCenterY + finalLabelFontSize / 2 + spacingBetweenLabelAndValue;
      valueTextElement.attr("y", valueTopActualY);
      const nodeWidth = d.x1 - d.x0;
      const nodeTotalHeight = d.y1 - d.y0;
      const cellBottomPadding = 4;
      const maxValueBottomY = nodeTotalHeight - cellBottomPadding;
      const availableWidthForValue = nodeWidth - 2 * 4;
      if (valueTextElement.node().getComputedTextLength() > availableWidthForValue || valueTopActualY + actualValueFontSize > maxValueBottomY || actualValueFontSize < minValueFontSize) {
        valueTextElement.style("display", "none");
      } else {
        valueTextElement.style("display", null);
      }
    });
  }
  const diagramPadding = config.diagramPadding ?? 8;
  setupViewPortForSVG(svg, diagramPadding, "flowchart", config?.useMaxWidth || false);
}, "draw");
var getClasses = /* @__PURE__ */ __name(function(_text, diagramObj) {
  return diagramObj.db.getClasses();
}, "getClasses");
var renderer = { draw, getClasses };
var defaultTreemapStyleOptions = {
  sectionStrokeColor: "black",
  sectionStrokeWidth: "1",
  sectionFillColor: "#efefef",
  leafStrokeColor: "black",
  leafStrokeWidth: "1",
  leafFillColor: "#efefef",
  labelFontSize: "12px",
  valueFontSize: "10px",
  titleFontSize: "14px"
};
var getStyles = /* @__PURE__ */ __name(({
  treemap: treemap2
} = {}) => {
  const defaultThemeVariables = getThemeVariables3();
  const currentConfig = getConfig();
  const themeVariables = cleanAndMerge(defaultThemeVariables, currentConfig.themeVariables);
  const options = cleanAndMerge(defaultTreemapStyleOptions, treemap2);
  const titleColor = options.titleColor ?? themeVariables.titleColor;
  const labelColor = options.labelColor ?? themeVariables.textColor;
  const valueColor = options.valueColor ?? themeVariables.textColor;
  return `
  .treemapNode.section {
    stroke: ${options.sectionStrokeColor};
    stroke-width: ${options.sectionStrokeWidth};
    fill: ${options.sectionFillColor};
  }
  .treemapNode.leaf {
    stroke: ${options.leafStrokeColor};
    stroke-width: ${options.leafStrokeWidth};
    fill: ${options.leafFillColor};
  }
  .treemapLabel {
    fill: ${labelColor};
    font-size: ${options.labelFontSize};
  }
  .treemapValue {
    fill: ${valueColor};
    font-size: ${options.valueFontSize};
  }
  .treemapTitle {
    fill: ${titleColor};
    font-size: ${options.titleFontSize};
  }
  `;
}, "getStyles");
var styles_default = getStyles;
var diagram = {
  parser,
  get db() {
    return new TreeMapDB;
  },
  renderer,
  styles: styles_default
};
export {
  diagram
};

//# debugId=20094BFA26E59FB464756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2RpYWdyYW0tT0c2SFdMSzYubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgImltcG9ydCB7XG4gIHNlbGVjdFN2Z0VsZW1lbnRcbn0gZnJvbSBcIi4vY2h1bmstV1U1TVlHMkcubWpzXCI7XG5pbXBvcnQge1xuICBzZXR1cFZpZXdQb3J0Rm9yU1ZHXG59IGZyb20gXCIuL2NodW5rLTJKMzNXVE1ILm1qc1wiO1xuaW1wb3J0IHtcbiAgaXNMYWJlbFN0eWxlLFxuICBzdHlsZXMyU3RyaW5nXG59IGZyb20gXCIuL2NodW5rLU5aSzJEN0dVLm1qc1wiO1xuaW1wb3J0IHtcbiAgcG9wdWxhdGVDb21tb25EYlxufSBmcm9tIFwiLi9jaHVuay00QlgyVlVBQi5tanNcIjtcbmltcG9ydCB7XG4gIGNsZWFuQW5kTWVyZ2Vcbn0gZnJvbSBcIi4vY2h1bmstNVpRWUhYS1UubWpzXCI7XG5pbXBvcnQge1xuICBjbGVhcixcbiAgY29uZmlndXJlU3ZnU2l6ZSxcbiAgZGVmYXVsdENvbmZpZ19kZWZhdWx0LFxuICBnZXRBY2NEZXNjcmlwdGlvbixcbiAgZ2V0QWNjVGl0bGUsXG4gIGdldENvbmZpZyxcbiAgZ2V0RGlhZ3JhbVRpdGxlLFxuICBnZXRUaGVtZVZhcmlhYmxlcyxcbiAgc2V0QWNjRGVzY3JpcHRpb24sXG4gIHNldEFjY1RpdGxlLFxuICBzZXREaWFncmFtVGl0bGVcbn0gZnJvbSBcIi4vY2h1bmstQ1NDSUhLN1EubWpzXCI7XG5pbXBvcnQge1xuICBfX25hbWUsXG4gIGxvZ1xufSBmcm9tIFwiLi9jaHVuay1BR0hSQjRKRi5tanNcIjtcblxuLy8gc3JjL2RpYWdyYW1zL3RyZWVtYXAvZGIudHNcbnZhciBUcmVlTWFwREIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubm9kZXMgPSBbXTtcbiAgICB0aGlzLmxldmVscyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgdGhpcy5vdXRlck5vZGVzID0gW107XG4gICAgdGhpcy5jbGFzc2VzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICB0aGlzLnNldEFjY1RpdGxlID0gc2V0QWNjVGl0bGU7XG4gICAgdGhpcy5nZXRBY2NUaXRsZSA9IGdldEFjY1RpdGxlO1xuICAgIHRoaXMuc2V0RGlhZ3JhbVRpdGxlID0gc2V0RGlhZ3JhbVRpdGxlO1xuICAgIHRoaXMuZ2V0RGlhZ3JhbVRpdGxlID0gZ2V0RGlhZ3JhbVRpdGxlO1xuICAgIHRoaXMuZ2V0QWNjRGVzY3JpcHRpb24gPSBnZXRBY2NEZXNjcmlwdGlvbjtcbiAgICB0aGlzLnNldEFjY0Rlc2NyaXB0aW9uID0gc2V0QWNjRGVzY3JpcHRpb247XG4gIH1cbiAgc3RhdGljIHtcbiAgICBfX25hbWUodGhpcywgXCJUcmVlTWFwREJcIik7XG4gIH1cbiAgZ2V0Tm9kZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZXM7XG4gIH1cbiAgZ2V0Q29uZmlnKCkge1xuICAgIGNvbnN0IGRlZmF1bHRDb25maWcgPSBkZWZhdWx0Q29uZmlnX2RlZmF1bHQ7XG4gICAgY29uc3QgdXNlckNvbmZpZyA9IGdldENvbmZpZygpO1xuICAgIHJldHVybiBjbGVhbkFuZE1lcmdlKHtcbiAgICAgIC4uLmRlZmF1bHRDb25maWcudHJlZW1hcCxcbiAgICAgIC4uLnVzZXJDb25maWcudHJlZW1hcCA/PyB7fVxuICAgIH0pO1xuICB9XG4gIGFkZE5vZGUobm9kZSwgbGV2ZWwpIHtcbiAgICB0aGlzLm5vZGVzLnB1c2gobm9kZSk7XG4gICAgdGhpcy5sZXZlbHMuc2V0KG5vZGUsIGxldmVsKTtcbiAgICBpZiAobGV2ZWwgPT09IDApIHtcbiAgICAgIHRoaXMub3V0ZXJOb2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgdGhpcy5yb290ID8/PSBub2RlO1xuICAgIH1cbiAgfVxuICBnZXRSb290KCkge1xuICAgIHJldHVybiB7IG5hbWU6IFwiXCIsIGNoaWxkcmVuOiB0aGlzLm91dGVyTm9kZXMgfTtcbiAgfVxuICBhZGRDbGFzcyhpZCwgX3N0eWxlKSB7XG4gICAgY29uc3Qgc3R5bGVDbGFzcyA9IHRoaXMuY2xhc3Nlcy5nZXQoaWQpID8/IHsgaWQsIHN0eWxlczogW10sIHRleHRTdHlsZXM6IFtdIH07XG4gICAgY29uc3Qgc3R5bGVzID0gX3N0eWxlLnJlcGxhY2UoL1xcXFwsL2csIFwiXFx4QTdcXHhBN1xceEE3XCIpLnJlcGxhY2UoLywvZywgXCI7XCIpLnJlcGxhY2UoL8KnwqfCpy9nLCBcIixcIikuc3BsaXQoXCI7XCIpO1xuICAgIGlmIChzdHlsZXMpIHtcbiAgICAgIHN0eWxlcy5mb3JFYWNoKChzKSA9PiB7XG4gICAgICAgIGlmIChpc0xhYmVsU3R5bGUocykpIHtcbiAgICAgICAgICBpZiAoc3R5bGVDbGFzcz8udGV4dFN0eWxlcykge1xuICAgICAgICAgICAgc3R5bGVDbGFzcy50ZXh0U3R5bGVzLnB1c2gocyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0eWxlQ2xhc3MudGV4dFN0eWxlcyA9IFtzXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0eWxlQ2xhc3M/LnN0eWxlcykge1xuICAgICAgICAgIHN0eWxlQ2xhc3Muc3R5bGVzLnB1c2gocyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3R5bGVDbGFzcy5zdHlsZXMgPSBbc107XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLmNsYXNzZXMuc2V0KGlkLCBzdHlsZUNsYXNzKTtcbiAgfVxuICBnZXRDbGFzc2VzKCkge1xuICAgIHJldHVybiB0aGlzLmNsYXNzZXM7XG4gIH1cbiAgZ2V0U3R5bGVzRm9yQ2xhc3MoY2xhc3NTZWxlY3Rvcikge1xuICAgIHJldHVybiB0aGlzLmNsYXNzZXMuZ2V0KGNsYXNzU2VsZWN0b3IpPy5zdHlsZXMgPz8gW107XG4gIH1cbiAgY2xlYXIoKSB7XG4gICAgY2xlYXIoKTtcbiAgICB0aGlzLm5vZGVzID0gW107XG4gICAgdGhpcy5sZXZlbHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgIHRoaXMub3V0ZXJOb2RlcyA9IFtdO1xuICAgIHRoaXMuY2xhc3NlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgdGhpcy5yb290ID0gdm9pZCAwO1xuICB9XG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMvdHJlZW1hcC9wYXJzZXIudHNcbmltcG9ydCB7IHBhcnNlIH0gZnJvbSBcIkBtZXJtYWlkLWpzL3BhcnNlclwiO1xuXG4vLyBzcmMvZGlhZ3JhbXMvdHJlZW1hcC91dGlscy50c1xuZnVuY3Rpb24gYnVpbGRIaWVyYXJjaHkoaXRlbXMpIHtcbiAgaWYgKCFpdGVtcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgY29uc3Qgcm9vdCA9IFtdO1xuICBjb25zdCBzdGFjayA9IFtdO1xuICBpdGVtcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgY29uc3Qgbm9kZSA9IHtcbiAgICAgIG5hbWU6IGl0ZW0ubmFtZSxcbiAgICAgIGNoaWxkcmVuOiBpdGVtLnR5cGUgPT09IFwiTGVhZlwiID8gdm9pZCAwIDogW11cbiAgICB9O1xuICAgIG5vZGUuY2xhc3NTZWxlY3RvciA9IGl0ZW0/LmNsYXNzU2VsZWN0b3I7XG4gICAgaWYgKGl0ZW0/LmNzc0NvbXBpbGVkU3R5bGVzKSB7XG4gICAgICBub2RlLmNzc0NvbXBpbGVkU3R5bGVzID0gaXRlbS5jc3NDb21waWxlZFN0eWxlcztcbiAgICB9XG4gICAgaWYgKGl0ZW0udHlwZSA9PT0gXCJMZWFmXCIgJiYgaXRlbS52YWx1ZSAhPT0gdm9pZCAwKSB7XG4gICAgICBub2RlLnZhbHVlID0gaXRlbS52YWx1ZTtcbiAgICB9XG4gICAgd2hpbGUgKHN0YWNrLmxlbmd0aCA+IDAgJiYgc3RhY2tbc3RhY2subGVuZ3RoIC0gMV0ubGV2ZWwgPj0gaXRlbS5sZXZlbCkge1xuICAgICAgc3RhY2sucG9wKCk7XG4gICAgfVxuICAgIGlmIChzdGFjay5sZW5ndGggPT09IDApIHtcbiAgICAgIHJvb3QucHVzaChub2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcGFyZW50ID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV0ubm9kZTtcbiAgICAgIGlmIChwYXJlbnQuY2hpbGRyZW4pIHtcbiAgICAgICAgcGFyZW50LmNoaWxkcmVuLnB1c2gobm9kZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJlbnQuY2hpbGRyZW4gPSBbbm9kZV07XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpdGVtLnR5cGUgIT09IFwiTGVhZlwiKSB7XG4gICAgICBzdGFjay5wdXNoKHsgbm9kZSwgbGV2ZWw6IGl0ZW0ubGV2ZWwgfSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJvb3Q7XG59XG5fX25hbWUoYnVpbGRIaWVyYXJjaHksIFwiYnVpbGRIaWVyYXJjaHlcIik7XG5cbi8vIHNyYy9kaWFncmFtcy90cmVlbWFwL3BhcnNlci50c1xudmFyIHBvcHVsYXRlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoYXN0LCBkYikgPT4ge1xuICBwb3B1bGF0ZUNvbW1vbkRiKGFzdCwgZGIpO1xuICBjb25zdCBpdGVtcyA9IFtdO1xuICBmb3IgKGNvbnN0IHJvdyBvZiBhc3QuVHJlZW1hcFJvd3MgPz8gW10pIHtcbiAgICBpZiAocm93LiR0eXBlID09PSBcIkNsYXNzRGVmU3RhdGVtZW50XCIpIHtcbiAgICAgIGRiLmFkZENsYXNzKHJvdy5jbGFzc05hbWUgPz8gXCJcIiwgcm93LnN0eWxlVGV4dCA/PyBcIlwiKTtcbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCByb3cgb2YgYXN0LlRyZWVtYXBSb3dzID8/IFtdKSB7XG4gICAgY29uc3QgaXRlbSA9IHJvdy5pdGVtO1xuICAgIGlmICghaXRlbSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNvbnN0IGxldmVsID0gcm93LmluZGVudCA/IHBhcnNlSW50KHJvdy5pbmRlbnQpIDogMDtcbiAgICBjb25zdCBuYW1lID0gZ2V0SXRlbU5hbWUoaXRlbSk7XG4gICAgY29uc3Qgc3R5bGVzID0gaXRlbS5jbGFzc1NlbGVjdG9yID8gZGIuZ2V0U3R5bGVzRm9yQ2xhc3MoaXRlbS5jbGFzc1NlbGVjdG9yKSA6IFtdO1xuICAgIGNvbnN0IGNzc0NvbXBpbGVkU3R5bGVzID0gc3R5bGVzLmxlbmd0aCA+IDAgPyBzdHlsZXMgOiB2b2lkIDA7XG4gICAgY29uc3QgaXRlbURhdGEgPSB7XG4gICAgICBsZXZlbCxcbiAgICAgIG5hbWUsXG4gICAgICB0eXBlOiBpdGVtLiR0eXBlLFxuICAgICAgdmFsdWU6IGl0ZW0udmFsdWUsXG4gICAgICBjbGFzc1NlbGVjdG9yOiBpdGVtLmNsYXNzU2VsZWN0b3IsXG4gICAgICBjc3NDb21waWxlZFN0eWxlc1xuICAgIH07XG4gICAgaXRlbXMucHVzaChpdGVtRGF0YSk7XG4gIH1cbiAgY29uc3QgaGllcmFyY2h5Tm9kZXMgPSBidWlsZEhpZXJhcmNoeShpdGVtcyk7XG4gIGNvbnN0IGFkZE5vZGVzUmVjdXJzaXZlbHkgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChub2RlcywgbGV2ZWwpID0+IHtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgIGRiLmFkZE5vZGUobm9kZSwgbGV2ZWwpO1xuICAgICAgaWYgKG5vZGUuY2hpbGRyZW4gJiYgbm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIGFkZE5vZGVzUmVjdXJzaXZlbHkobm9kZS5jaGlsZHJlbiwgbGV2ZWwgKyAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIFwiYWRkTm9kZXNSZWN1cnNpdmVseVwiKTtcbiAgYWRkTm9kZXNSZWN1cnNpdmVseShoaWVyYXJjaHlOb2RlcywgMCk7XG59LCBcInBvcHVsYXRlXCIpO1xudmFyIGdldEl0ZW1OYW1lID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoaXRlbSkgPT4ge1xuICByZXR1cm4gaXRlbS5uYW1lID8gU3RyaW5nKGl0ZW0ubmFtZSkgOiBcIlwiO1xufSwgXCJnZXRJdGVtTmFtZVwiKTtcbnZhciBwYXJzZXIgPSB7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBUcmVlTWFwREIgaXMgbm90IGFzc2lnbmFibGUgdG8gRGlhZ3JhbURCXG4gIHBhcnNlcjogeyB5eTogdm9pZCAwIH0sXG4gIHBhcnNlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGFzeW5jICh0ZXh0KSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHBhcnNlRnVuYyA9IHBhcnNlO1xuICAgICAgY29uc3QgYXN0ID0gYXdhaXQgcGFyc2VGdW5jKFwidHJlZW1hcFwiLCB0ZXh0KTtcbiAgICAgIGxvZy5kZWJ1ZyhcIlRyZWVtYXAgQVNUOlwiLCBhc3QpO1xuICAgICAgY29uc3QgZGIgPSBwYXJzZXIucGFyc2VyPy55eTtcbiAgICAgIGlmICghKGRiIGluc3RhbmNlb2YgVHJlZU1hcERCKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgXCJwYXJzZXIucGFyc2VyPy55eSB3YXMgbm90IGEgVHJlZW1hcERCLiBUaGlzIGlzIGR1ZSB0byBhIGJ1ZyB3aXRoaW4gTWVybWFpZCwgcGxlYXNlIHJlcG9ydCB0aGlzIGlzc3VlIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9tZXJtYWlkLWpzL21lcm1haWQvaXNzdWVzLlwiXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBwb3B1bGF0ZShhc3QsIGRiKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbG9nLmVycm9yKFwiRXJyb3IgcGFyc2luZyB0cmVlbWFwOlwiLCBlcnJvcik7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH0sIFwicGFyc2VcIilcbn07XG5cbi8vIHNyYy9kaWFncmFtcy90cmVlbWFwL3JlbmRlcmVyLnRzXG5pbXBvcnQgeyBzY2FsZU9yZGluYWwsIHRyZWVtYXAsIGhpZXJhcmNoeSwgZm9ybWF0LCBzZWxlY3QgfSBmcm9tIFwiZDNcIjtcbnZhciBERUZBVUxUX0lOTkVSX1BBRERJTkcgPSAxMDtcbnZhciBTRUNUSU9OX0lOTkVSX1BBRERJTkcgPSAxMDtcbnZhciBTRUNUSU9OX0hFQURFUl9IRUlHSFQgPSAyNTtcbnZhciBkcmF3ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoX3RleHQsIGlkLCBfdmVyc2lvbiwgZGlhZ3JhbTIpID0+IHtcbiAgY29uc3QgdHJlZW1hcERiID0gZGlhZ3JhbTIuZGI7XG4gIGNvbnN0IGNvbmZpZyA9IHRyZWVtYXBEYi5nZXRDb25maWcoKTtcbiAgY29uc3QgdHJlZW1hcElubmVyUGFkZGluZyA9IGNvbmZpZy5wYWRkaW5nID8/IERFRkFVTFRfSU5ORVJfUEFERElORztcbiAgY29uc3QgdGl0bGUgPSB0cmVlbWFwRGIuZ2V0RGlhZ3JhbVRpdGxlKCk7XG4gIGNvbnN0IHJvb3QgPSB0cmVlbWFwRGIuZ2V0Um9vdCgpO1xuICBjb25zdCB7IHRoZW1lVmFyaWFibGVzIH0gPSBnZXRDb25maWcoKTtcbiAgaWYgKCFyb290KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHRpdGxlSGVpZ2h0ID0gdGl0bGUgPyAzMCA6IDA7XG4gIGNvbnN0IHN2ZyA9IHNlbGVjdFN2Z0VsZW1lbnQoaWQpO1xuICBjb25zdCB3aWR0aCA9IGNvbmZpZy5ub2RlV2lkdGggPyBjb25maWcubm9kZVdpZHRoICogU0VDVElPTl9JTk5FUl9QQURESU5HIDogOTYwO1xuICBjb25zdCBoZWlnaHQgPSBjb25maWcubm9kZUhlaWdodCA/IGNvbmZpZy5ub2RlSGVpZ2h0ICogU0VDVElPTl9JTk5FUl9QQURESU5HIDogNTAwO1xuICBjb25zdCBzdmdXaWR0aCA9IHdpZHRoO1xuICBjb25zdCBzdmdIZWlnaHQgPSBoZWlnaHQgKyB0aXRsZUhlaWdodDtcbiAgc3ZnLmF0dHIoXCJ2aWV3Qm94XCIsIGAwIDAgJHtzdmdXaWR0aH0gJHtzdmdIZWlnaHR9YCk7XG4gIGNvbmZpZ3VyZVN2Z1NpemUoc3ZnLCBzdmdIZWlnaHQsIHN2Z1dpZHRoLCBjb25maWcudXNlTWF4V2lkdGgpO1xuICBsZXQgdmFsdWVGb3JtYXQ7XG4gIHRyeSB7XG4gICAgY29uc3QgZm9ybWF0U3RyID0gY29uZmlnLnZhbHVlRm9ybWF0IHx8IFwiLFwiO1xuICAgIGlmIChmb3JtYXRTdHIgPT09IFwiJDAsMFwiKSB7XG4gICAgICB2YWx1ZUZvcm1hdCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHZhbHVlKSA9PiBcIiRcIiArIGZvcm1hdChcIixcIikodmFsdWUpLCBcInZhbHVlRm9ybWF0XCIpO1xuICAgIH0gZWxzZSBpZiAoZm9ybWF0U3RyLnN0YXJ0c1dpdGgoXCIkXCIpICYmIGZvcm1hdFN0ci5pbmNsdWRlcyhcIixcIikpIHtcbiAgICAgIGNvbnN0IHByZWNpc2lvbiA9IC9cXC5cXGQrLy5leGVjKGZvcm1hdFN0cik7XG4gICAgICBjb25zdCBwcmVjaXNpb25TdHIgPSBwcmVjaXNpb24gPyBwcmVjaXNpb25bMF0gOiBcIlwiO1xuICAgICAgdmFsdWVGb3JtYXQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCh2YWx1ZSkgPT4gXCIkXCIgKyBmb3JtYXQoXCIsXCIgKyBwcmVjaXNpb25TdHIpKHZhbHVlKSwgXCJ2YWx1ZUZvcm1hdFwiKTtcbiAgICB9IGVsc2UgaWYgKGZvcm1hdFN0ci5zdGFydHNXaXRoKFwiJFwiKSkge1xuICAgICAgY29uc3QgcmVzdE9mRm9ybWF0ID0gZm9ybWF0U3RyLnN1YnN0cmluZygxKTtcbiAgICAgIHZhbHVlRm9ybWF0ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgodmFsdWUpID0+IFwiJFwiICsgZm9ybWF0KHJlc3RPZkZvcm1hdCB8fCBcIlwiKSh2YWx1ZSksIFwidmFsdWVGb3JtYXRcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlRm9ybWF0ID0gZm9ybWF0KGZvcm1hdFN0cik7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZy5lcnJvcihcIkVycm9yIGNyZWF0aW5nIGZvcm1hdCBmdW5jdGlvbjpcIiwgZXJyb3IpO1xuICAgIHZhbHVlRm9ybWF0ID0gZm9ybWF0KFwiLFwiKTtcbiAgfVxuICBjb25zdCBjb2xvclNjYWxlID0gc2NhbGVPcmRpbmFsKCkucmFuZ2UoW1xuICAgIFwidHJhbnNwYXJlbnRcIixcbiAgICB0aGVtZVZhcmlhYmxlcy5jU2NhbGUwLFxuICAgIHRoZW1lVmFyaWFibGVzLmNTY2FsZTEsXG4gICAgdGhlbWVWYXJpYWJsZXMuY1NjYWxlMixcbiAgICB0aGVtZVZhcmlhYmxlcy5jU2NhbGUzLFxuICAgIHRoZW1lVmFyaWFibGVzLmNTY2FsZTQsXG4gICAgdGhlbWVWYXJpYWJsZXMuY1NjYWxlNSxcbiAgICB0aGVtZVZhcmlhYmxlcy5jU2NhbGU2LFxuICAgIHRoZW1lVmFyaWFibGVzLmNTY2FsZTcsXG4gICAgdGhlbWVWYXJpYWJsZXMuY1NjYWxlOCxcbiAgICB0aGVtZVZhcmlhYmxlcy5jU2NhbGU5LFxuICAgIHRoZW1lVmFyaWFibGVzLmNTY2FsZTEwLFxuICAgIHRoZW1lVmFyaWFibGVzLmNTY2FsZTExXG4gIF0pO1xuICBjb25zdCBjb2xvclNjYWxlUGVlciA9IHNjYWxlT3JkaW5hbCgpLnJhbmdlKFtcbiAgICBcInRyYW5zcGFyZW50XCIsXG4gICAgdGhlbWVWYXJpYWJsZXMuY1NjYWxlUGVlcjAsXG4gICAgdGhlbWVWYXJpYWJsZXMuY1NjYWxlUGVlcjEsXG4gICAgdGhlbWVWYXJpYWJsZXMuY1NjYWxlUGVlcjIsXG4gICAgdGhlbWVWYXJpYWJsZXMuY1NjYWxlUGVlcjMsXG4gICAgdGhlbWVWYXJpYWJsZXMuY1NjYWxlUGVlcjQsXG4gICAgdGhlbWVWYXJpYWJsZXMuY1NjYWxlUGVlcjUsXG4gICAgdGhlbWVWYXJpYWJsZXMuY1NjYWxlUGVlcjYsXG4gICAgdGhlbWVWYXJpYWJsZXMuY1NjYWxlUGVlcjcsXG4gICAgdGhlbWVWYXJpYWJsZXMuY1NjYWxlUGVlcjgsXG4gICAgdGhlbWVWYXJpYWJsZXMuY1NjYWxlUGVlcjksXG4gICAgdGhlbWVWYXJpYWJsZXMuY1NjYWxlUGVlcjEwLFxuICAgIHRoZW1lVmFyaWFibGVzLmNTY2FsZVBlZXIxMVxuICBdKTtcbiAgY29uc3QgY29sb3JTY2FsZUxhYmVsID0gc2NhbGVPcmRpbmFsKCkucmFuZ2UoW1xuICAgIHRoZW1lVmFyaWFibGVzLmNTY2FsZUxhYmVsMCxcbiAgICB0aGVtZVZhcmlhYmxlcy5jU2NhbGVMYWJlbDEsXG4gICAgdGhlbWVWYXJpYWJsZXMuY1NjYWxlTGFiZWwyLFxuICAgIHRoZW1lVmFyaWFibGVzLmNTY2FsZUxhYmVsMyxcbiAgICB0aGVtZVZhcmlhYmxlcy5jU2NhbGVMYWJlbDQsXG4gICAgdGhlbWVWYXJpYWJsZXMuY1NjYWxlTGFiZWw1LFxuICAgIHRoZW1lVmFyaWFibGVzLmNTY2FsZUxhYmVsNixcbiAgICB0aGVtZVZhcmlhYmxlcy5jU2NhbGVMYWJlbDcsXG4gICAgdGhlbWVWYXJpYWJsZXMuY1NjYWxlTGFiZWw4LFxuICAgIHRoZW1lVmFyaWFibGVzLmNTY2FsZUxhYmVsOSxcbiAgICB0aGVtZVZhcmlhYmxlcy5jU2NhbGVMYWJlbDEwLFxuICAgIHRoZW1lVmFyaWFibGVzLmNTY2FsZUxhYmVsMTFcbiAgXSk7XG4gIGlmICh0aXRsZSkge1xuICAgIHN2Zy5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJ4XCIsIHN2Z1dpZHRoIC8gMikuYXR0cihcInlcIiwgdGl0bGVIZWlnaHQgLyAyKS5hdHRyKFwiY2xhc3NcIiwgXCJ0cmVlbWFwVGl0bGVcIikuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpLmF0dHIoXCJkb21pbmFudC1iYXNlbGluZVwiLCBcIm1pZGRsZVwiKS50ZXh0KHRpdGxlKTtcbiAgfVxuICBjb25zdCBnID0gc3ZnLmFwcGVuZChcImdcIikuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKDAsICR7dGl0bGVIZWlnaHR9KWApLmF0dHIoXCJjbGFzc1wiLCBcInRyZWVtYXBDb250YWluZXJcIik7XG4gIGNvbnN0IGhpZXJhcmNoeVJvb3QgPSBoaWVyYXJjaHkocm9vdCkuc3VtKChkKSA9PiBkLnZhbHVlID8/IDApLnNvcnQoKGEsIGIpID0+IChiLnZhbHVlID8/IDApIC0gKGEudmFsdWUgPz8gMCkpO1xuICBjb25zdCB0cmVlbWFwTGF5b3V0ID0gdHJlZW1hcCgpLnNpemUoW3dpZHRoLCBoZWlnaHRdKS5wYWRkaW5nVG9wKFxuICAgIChkKSA9PiBkLmNoaWxkcmVuICYmIGQuY2hpbGRyZW4ubGVuZ3RoID4gMCA/IFNFQ1RJT05fSEVBREVSX0hFSUdIVCArIFNFQ1RJT05fSU5ORVJfUEFERElORyA6IDBcbiAgKS5wYWRkaW5nSW5uZXIodHJlZW1hcElubmVyUGFkZGluZykucGFkZGluZ0xlZnQoKGQpID0+IGQuY2hpbGRyZW4gJiYgZC5jaGlsZHJlbi5sZW5ndGggPiAwID8gU0VDVElPTl9JTk5FUl9QQURESU5HIDogMCkucGFkZGluZ1JpZ2h0KChkKSA9PiBkLmNoaWxkcmVuICYmIGQuY2hpbGRyZW4ubGVuZ3RoID4gMCA/IFNFQ1RJT05fSU5ORVJfUEFERElORyA6IDApLnBhZGRpbmdCb3R0b20oKGQpID0+IGQuY2hpbGRyZW4gJiYgZC5jaGlsZHJlbi5sZW5ndGggPiAwID8gU0VDVElPTl9JTk5FUl9QQURESU5HIDogMCkucm91bmQodHJ1ZSk7XG4gIGNvbnN0IHRyZWVtYXBEYXRhID0gdHJlZW1hcExheW91dChoaWVyYXJjaHlSb290KTtcbiAgY29uc3QgYnJhbmNoTm9kZXMgPSB0cmVlbWFwRGF0YS5kZXNjZW5kYW50cygpLmZpbHRlcigoZCkgPT4gZC5jaGlsZHJlbiAmJiBkLmNoaWxkcmVuLmxlbmd0aCA+IDApO1xuICBjb25zdCBzZWN0aW9ucyA9IGcuc2VsZWN0QWxsKFwiLnRyZWVtYXBTZWN0aW9uXCIpLmRhdGEoYnJhbmNoTm9kZXMpLmVudGVyKCkuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJ0cmVlbWFwU2VjdGlvblwiKS5hdHRyKFwidHJhbnNmb3JtXCIsIChkKSA9PiBgdHJhbnNsYXRlKCR7ZC54MH0sJHtkLnkwfSlgKTtcbiAgc2VjdGlvbnMuYXBwZW5kKFwicmVjdFwiKS5hdHRyKFwid2lkdGhcIiwgKGQpID0+IGQueDEgLSBkLngwKS5hdHRyKFwiaGVpZ2h0XCIsIFNFQ1RJT05fSEVBREVSX0hFSUdIVCkuYXR0cihcImNsYXNzXCIsIFwidHJlZW1hcFNlY3Rpb25IZWFkZXJcIikuYXR0cihcImZpbGxcIiwgXCJub25lXCIpLmF0dHIoXCJmaWxsLW9wYWNpdHlcIiwgMC42KS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDAuNikuYXR0cihcInN0eWxlXCIsIChkKSA9PiB7XG4gICAgaWYgKGQuZGVwdGggPT09IDApIHtcbiAgICAgIHJldHVybiBcImRpc3BsYXk6IG5vbmU7XCI7XG4gICAgfVxuICAgIHJldHVybiBcIlwiO1xuICB9KTtcbiAgc2VjdGlvbnMuYXBwZW5kKFwiY2xpcFBhdGhcIikuYXR0cihcImlkXCIsIChfZCwgaSkgPT4gYGNsaXAtc2VjdGlvbi0ke2lkfS0ke2l9YCkuYXBwZW5kKFwicmVjdFwiKS5hdHRyKFwid2lkdGhcIiwgKGQpID0+IE1hdGgubWF4KDAsIGQueDEgLSBkLngwIC0gMTIpKS5hdHRyKFwiaGVpZ2h0XCIsIFNFQ1RJT05fSEVBREVSX0hFSUdIVCk7XG4gIHNlY3Rpb25zLmFwcGVuZChcInJlY3RcIikuYXR0cihcIndpZHRoXCIsIChkKSA9PiBkLngxIC0gZC54MCkuYXR0cihcImhlaWdodFwiLCAoZCkgPT4gZC55MSAtIGQueTApLmF0dHIoXCJjbGFzc1wiLCAoX2QsIGkpID0+IHtcbiAgICByZXR1cm4gYHRyZWVtYXBTZWN0aW9uIHNlY3Rpb24ke2l9YDtcbiAgfSkuYXR0cihcImZpbGxcIiwgKGQpID0+IGNvbG9yU2NhbGUoZC5kYXRhLm5hbWUpKS5hdHRyKFwiZmlsbC1vcGFjaXR5XCIsIDAuNikuYXR0cihcInN0cm9rZVwiLCAoZCkgPT4gY29sb3JTY2FsZVBlZXIoZC5kYXRhLm5hbWUpKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDIpLmF0dHIoXCJzdHJva2Utb3BhY2l0eVwiLCAwLjQpLmF0dHIoXCJzdHlsZVwiLCAoZCkgPT4ge1xuICAgIGlmIChkLmRlcHRoID09PSAwKSB7XG4gICAgICByZXR1cm4gXCJkaXNwbGF5OiBub25lO1wiO1xuICAgIH1cbiAgICBjb25zdCBzdHlsZXMgPSBzdHlsZXMyU3RyaW5nKHsgY3NzQ29tcGlsZWRTdHlsZXM6IGQuZGF0YS5jc3NDb21waWxlZFN0eWxlcyB9KTtcbiAgICByZXR1cm4gc3R5bGVzLm5vZGVTdHlsZXMgKyBcIjtcIiArIHN0eWxlcy5ib3JkZXJTdHlsZXMuam9pbihcIjtcIik7XG4gIH0pO1xuICBzZWN0aW9ucy5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJjbGFzc1wiLCBcInRyZWVtYXBTZWN0aW9uTGFiZWxcIikuYXR0cihcInhcIiwgNikuYXR0cihcInlcIiwgU0VDVElPTl9IRUFERVJfSEVJR0hUIC8gMikuYXR0cihcImRvbWluYW50LWJhc2VsaW5lXCIsIFwibWlkZGxlXCIpLnRleHQoKGQpID0+IGQuZGVwdGggPT09IDAgPyBcIlwiIDogZC5kYXRhLm5hbWUpLmF0dHIoXCJmb250LXdlaWdodFwiLCBcImJvbGRcIikuYXR0cihcInN0eWxlXCIsIChkKSA9PiB7XG4gICAgaWYgKGQuZGVwdGggPT09IDApIHtcbiAgICAgIHJldHVybiBcImRpc3BsYXk6IG5vbmU7XCI7XG4gICAgfVxuICAgIGNvbnN0IGxhYmVsU3R5bGVzID0gXCJkb21pbmFudC1iYXNlbGluZTogbWlkZGxlOyBmb250LXNpemU6IDEycHg7IGZpbGw6XCIgKyBjb2xvclNjYWxlTGFiZWwoZC5kYXRhLm5hbWUpICsgXCI7IHdoaXRlLXNwYWNlOiBub3dyYXA7IG92ZXJmbG93OiBoaWRkZW47IHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1wiO1xuICAgIGNvbnN0IHN0eWxlcyA9IHN0eWxlczJTdHJpbmcoeyBjc3NDb21waWxlZFN0eWxlczogZC5kYXRhLmNzc0NvbXBpbGVkU3R5bGVzIH0pO1xuICAgIHJldHVybiBsYWJlbFN0eWxlcyArIHN0eWxlcy5sYWJlbFN0eWxlcy5yZXBsYWNlKFwiY29sb3I6XCIsIFwiZmlsbDpcIik7XG4gIH0pLmVhY2goZnVuY3Rpb24oZCkge1xuICAgIGlmIChkLmRlcHRoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHNlbGYgPSBzZWxlY3QodGhpcyk7XG4gICAgY29uc3Qgb3JpZ2luYWxUZXh0ID0gZC5kYXRhLm5hbWU7XG4gICAgc2VsZi50ZXh0KG9yaWdpbmFsVGV4dCk7XG4gICAgY29uc3QgdG90YWxIZWFkZXJXaWR0aCA9IGQueDEgLSBkLngwO1xuICAgIGNvbnN0IGxhYmVsWFBvc2l0aW9uID0gNjtcbiAgICBsZXQgc3BhY2VGb3JUZXh0Q29udGVudDtcbiAgICBpZiAoY29uZmlnLnNob3dWYWx1ZXMgIT09IGZhbHNlICYmIGQudmFsdWUpIHtcbiAgICAgIGNvbnN0IHZhbHVlRW5kc0F0WFJlbGF0aXZlID0gdG90YWxIZWFkZXJXaWR0aCAtIDEwO1xuICAgICAgY29uc3QgZXN0aW1hdGVkVmFsdWVUZXh0QWN0dWFsV2lkdGggPSAzMDtcbiAgICAgIGNvbnN0IGdhcEJldHdlZW5MYWJlbEFuZFZhbHVlID0gMTA7XG4gICAgICBjb25zdCBsYWJlbE11c3RFbmRCZWZvcmVYID0gdmFsdWVFbmRzQXRYUmVsYXRpdmUgLSBlc3RpbWF0ZWRWYWx1ZVRleHRBY3R1YWxXaWR0aCAtIGdhcEJldHdlZW5MYWJlbEFuZFZhbHVlO1xuICAgICAgc3BhY2VGb3JUZXh0Q29udGVudCA9IGxhYmVsTXVzdEVuZEJlZm9yZVggLSBsYWJlbFhQb3NpdGlvbjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbGFiZWxPd25SaWdodFBhZGRpbmcgPSA2O1xuICAgICAgc3BhY2VGb3JUZXh0Q29udGVudCA9IHRvdGFsSGVhZGVyV2lkdGggLSBsYWJlbFhQb3NpdGlvbiAtIGxhYmVsT3duUmlnaHRQYWRkaW5nO1xuICAgIH1cbiAgICBjb25zdCBtaW5pbXVtV2lkdGhUb0Rpc3BsYXkgPSAxNTtcbiAgICBjb25zdCBhY3R1YWxBdmFpbGFibGVXaWR0aCA9IE1hdGgubWF4KG1pbmltdW1XaWR0aFRvRGlzcGxheSwgc3BhY2VGb3JUZXh0Q29udGVudCk7XG4gICAgY29uc3QgdGV4dE5vZGUgPSBzZWxmLm5vZGUoKTtcbiAgICBjb25zdCBjdXJyZW50VGV4dENvbnRlbnRMZW5ndGggPSB0ZXh0Tm9kZS5nZXRDb21wdXRlZFRleHRMZW5ndGgoKTtcbiAgICBpZiAoY3VycmVudFRleHRDb250ZW50TGVuZ3RoID4gYWN0dWFsQXZhaWxhYmxlV2lkdGgpIHtcbiAgICAgIGNvbnN0IGVsbGlwc2lzID0gXCIuLi5cIjtcbiAgICAgIGxldCBjdXJyZW50VHJ1bmNhdGVkVGV4dCA9IG9yaWdpbmFsVGV4dDtcbiAgICAgIHdoaWxlIChjdXJyZW50VHJ1bmNhdGVkVGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGN1cnJlbnRUcnVuY2F0ZWRUZXh0ID0gb3JpZ2luYWxUZXh0LnN1YnN0cmluZygwLCBjdXJyZW50VHJ1bmNhdGVkVGV4dC5sZW5ndGggLSAxKTtcbiAgICAgICAgaWYgKGN1cnJlbnRUcnVuY2F0ZWRUZXh0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHNlbGYudGV4dChlbGxpcHNpcyk7XG4gICAgICAgICAgaWYgKHRleHROb2RlLmdldENvbXB1dGVkVGV4dExlbmd0aCgpID4gYWN0dWFsQXZhaWxhYmxlV2lkdGgpIHtcbiAgICAgICAgICAgIHNlbGYudGV4dChcIlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi50ZXh0KGN1cnJlbnRUcnVuY2F0ZWRUZXh0ICsgZWxsaXBzaXMpO1xuICAgICAgICBpZiAodGV4dE5vZGUuZ2V0Q29tcHV0ZWRUZXh0TGVuZ3RoKCkgPD0gYWN0dWFsQXZhaWxhYmxlV2lkdGgpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIGlmIChjb25maWcuc2hvd1ZhbHVlcyAhPT0gZmFsc2UpIHtcbiAgICBzZWN0aW9ucy5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJjbGFzc1wiLCBcInRyZWVtYXBTZWN0aW9uVmFsdWVcIikuYXR0cihcInhcIiwgKGQpID0+IGQueDEgLSBkLngwIC0gMTApLmF0dHIoXCJ5XCIsIFNFQ1RJT05fSEVBREVSX0hFSUdIVCAvIDIpLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBcImVuZFwiKS5hdHRyKFwiZG9taW5hbnQtYmFzZWxpbmVcIiwgXCJtaWRkbGVcIikudGV4dCgoZCkgPT4gZC52YWx1ZSA/IHZhbHVlRm9ybWF0KGQudmFsdWUpIDogXCJcIikuYXR0cihcImZvbnQtc3R5bGVcIiwgXCJpdGFsaWNcIikuYXR0cihcInN0eWxlXCIsIChkKSA9PiB7XG4gICAgICBpZiAoZC5kZXB0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gXCJkaXNwbGF5OiBub25lO1wiO1xuICAgICAgfVxuICAgICAgY29uc3QgbGFiZWxTdHlsZXMgPSBcInRleHQtYW5jaG9yOiBlbmQ7IGRvbWluYW50LWJhc2VsaW5lOiBtaWRkbGU7IGZvbnQtc2l6ZTogMTBweDsgZmlsbDpcIiArIGNvbG9yU2NhbGVMYWJlbChkLmRhdGEubmFtZSkgKyBcIjsgd2hpdGUtc3BhY2U6IG5vd3JhcDsgb3ZlcmZsb3c6IGhpZGRlbjsgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XCI7XG4gICAgICBjb25zdCBzdHlsZXMgPSBzdHlsZXMyU3RyaW5nKHsgY3NzQ29tcGlsZWRTdHlsZXM6IGQuZGF0YS5jc3NDb21waWxlZFN0eWxlcyB9KTtcbiAgICAgIHJldHVybiBsYWJlbFN0eWxlcyArIHN0eWxlcy5sYWJlbFN0eWxlcy5yZXBsYWNlKFwiY29sb3I6XCIsIFwiZmlsbDpcIik7XG4gICAgfSk7XG4gIH1cbiAgY29uc3QgbGVhZk5vZGVzID0gdHJlZW1hcERhdGEubGVhdmVzKCk7XG4gIGNvbnN0IGNlbGwgPSBnLnNlbGVjdEFsbChcIi50cmVlbWFwTGVhZkdyb3VwXCIpLmRhdGEobGVhZk5vZGVzKS5lbnRlcigpLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIChkLCBpKSA9PiB7XG4gICAgcmV0dXJuIGB0cmVlbWFwTm9kZSB0cmVlbWFwTGVhZkdyb3VwIGxlYWYke2l9JHtkLmRhdGEuY2xhc3NTZWxlY3RvciA/IGAgJHtkLmRhdGEuY2xhc3NTZWxlY3Rvcn1gIDogXCJcIn14YDtcbiAgfSkuYXR0cihcInRyYW5zZm9ybVwiLCAoZCkgPT4gYHRyYW5zbGF0ZSgke2QueDB9LCR7ZC55MH0pYCk7XG4gIGNlbGwuYXBwZW5kKFwicmVjdFwiKS5hdHRyKFwid2lkdGhcIiwgKGQpID0+IGQueDEgLSBkLngwKS5hdHRyKFwiaGVpZ2h0XCIsIChkKSA9PiBkLnkxIC0gZC55MCkuYXR0cihcImNsYXNzXCIsIFwidHJlZW1hcExlYWZcIikuYXR0cihcImZpbGxcIiwgKGQpID0+IHtcbiAgICByZXR1cm4gZC5wYXJlbnQgPyBjb2xvclNjYWxlKGQucGFyZW50LmRhdGEubmFtZSkgOiBjb2xvclNjYWxlKGQuZGF0YS5uYW1lKTtcbiAgfSkuYXR0cihcInN0eWxlXCIsIChkKSA9PiB7XG4gICAgY29uc3Qgc3R5bGVzID0gc3R5bGVzMlN0cmluZyh7IGNzc0NvbXBpbGVkU3R5bGVzOiBkLmRhdGEuY3NzQ29tcGlsZWRTdHlsZXMgfSk7XG4gICAgcmV0dXJuIHN0eWxlcy5ub2RlU3R5bGVzO1xuICB9KS5hdHRyKFwiZmlsbC1vcGFjaXR5XCIsIDAuMykuYXR0cihcInN0cm9rZVwiLCAoZCkgPT4ge1xuICAgIHJldHVybiBkLnBhcmVudCA/IGNvbG9yU2NhbGUoZC5wYXJlbnQuZGF0YS5uYW1lKSA6IGNvbG9yU2NhbGUoZC5kYXRhLm5hbWUpO1xuICB9KS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDMpO1xuICBjZWxsLmFwcGVuZChcImNsaXBQYXRoXCIpLmF0dHIoXCJpZFwiLCAoX2QsIGkpID0+IGBjbGlwLSR7aWR9LSR7aX1gKS5hcHBlbmQoXCJyZWN0XCIpLmF0dHIoXCJ3aWR0aFwiLCAoZCkgPT4gTWF0aC5tYXgoMCwgZC54MSAtIGQueDAgLSA0KSkuYXR0cihcImhlaWdodFwiLCAoZCkgPT4gTWF0aC5tYXgoMCwgZC55MSAtIGQueTAgLSA0KSk7XG4gIGNvbnN0IGxlYWZMYWJlbHMgPSBjZWxsLmFwcGVuZChcInRleHRcIikuYXR0cihcImNsYXNzXCIsIFwidHJlZW1hcExhYmVsXCIpLmF0dHIoXCJ4XCIsIChkKSA9PiAoZC54MSAtIGQueDApIC8gMikuYXR0cihcInlcIiwgKGQpID0+IChkLnkxIC0gZC55MCkgLyAyKS5hdHRyKFwic3R5bGVcIiwgKGQpID0+IHtcbiAgICBjb25zdCBsYWJlbFN0eWxlcyA9IFwidGV4dC1hbmNob3I6IG1pZGRsZTsgZG9taW5hbnQtYmFzZWxpbmU6IG1pZGRsZTsgZm9udC1zaXplOiAzOHB4O2ZpbGw6XCIgKyBjb2xvclNjYWxlTGFiZWwoZC5kYXRhLm5hbWUpICsgXCI7XCI7XG4gICAgY29uc3Qgc3R5bGVzID0gc3R5bGVzMlN0cmluZyh7IGNzc0NvbXBpbGVkU3R5bGVzOiBkLmRhdGEuY3NzQ29tcGlsZWRTdHlsZXMgfSk7XG4gICAgcmV0dXJuIGxhYmVsU3R5bGVzICsgc3R5bGVzLmxhYmVsU3R5bGVzLnJlcGxhY2UoXCJjb2xvcjpcIiwgXCJmaWxsOlwiKTtcbiAgfSkuYXR0cihcImNsaXAtcGF0aFwiLCAoX2QsIGkpID0+IGB1cmwoI2NsaXAtJHtpZH0tJHtpfSlgKS50ZXh0KChkKSA9PiBkLmRhdGEubmFtZSk7XG4gIGxlYWZMYWJlbHMuZWFjaChmdW5jdGlvbihkKSB7XG4gICAgY29uc3Qgc2VsZiA9IHNlbGVjdCh0aGlzKTtcbiAgICBjb25zdCBub2RlV2lkdGggPSBkLngxIC0gZC54MDtcbiAgICBjb25zdCBub2RlSGVpZ2h0ID0gZC55MSAtIGQueTA7XG4gICAgY29uc3QgdGV4dE5vZGUgPSBzZWxmLm5vZGUoKTtcbiAgICBjb25zdCBwYWRkaW5nID0gNDtcbiAgICBjb25zdCBhdmFpbGFibGVXaWR0aCA9IG5vZGVXaWR0aCAtIDIgKiBwYWRkaW5nO1xuICAgIGNvbnN0IGF2YWlsYWJsZUhlaWdodCA9IG5vZGVIZWlnaHQgLSAyICogcGFkZGluZztcbiAgICBpZiAoYXZhaWxhYmxlV2lkdGggPCAxMCB8fCBhdmFpbGFibGVIZWlnaHQgPCAxMCkge1xuICAgICAgc2VsZi5zdHlsZShcImRpc3BsYXlcIiwgXCJub25lXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgY3VycmVudExhYmVsRm9udFNpemUgPSBwYXJzZUludChzZWxmLnN0eWxlKFwiZm9udC1zaXplXCIpLCAxMCk7XG4gICAgY29uc3QgbWluTGFiZWxGb250U2l6ZSA9IDg7XG4gICAgY29uc3Qgb3JpZ2luYWxWYWx1ZVJlbEZvbnRTaXplID0gMjg7XG4gICAgY29uc3QgdmFsdWVTY2FsZUZhY3RvciA9IDAuNjtcbiAgICBjb25zdCBtaW5WYWx1ZUZvbnRTaXplID0gNjtcbiAgICBjb25zdCBzcGFjaW5nQmV0d2VlbkxhYmVsQW5kVmFsdWUgPSAyO1xuICAgIHdoaWxlICh0ZXh0Tm9kZS5nZXRDb21wdXRlZFRleHRMZW5ndGgoKSA+IGF2YWlsYWJsZVdpZHRoICYmIGN1cnJlbnRMYWJlbEZvbnRTaXplID4gbWluTGFiZWxGb250U2l6ZSkge1xuICAgICAgY3VycmVudExhYmVsRm9udFNpemUtLTtcbiAgICAgIHNlbGYuc3R5bGUoXCJmb250LXNpemVcIiwgYCR7Y3VycmVudExhYmVsRm9udFNpemV9cHhgKTtcbiAgICB9XG4gICAgbGV0IHByb3NwZWN0aXZlVmFsdWVGb250U2l6ZSA9IE1hdGgubWF4KFxuICAgICAgbWluVmFsdWVGb250U2l6ZSxcbiAgICAgIE1hdGgubWluKG9yaWdpbmFsVmFsdWVSZWxGb250U2l6ZSwgTWF0aC5yb3VuZChjdXJyZW50TGFiZWxGb250U2l6ZSAqIHZhbHVlU2NhbGVGYWN0b3IpKVxuICAgICk7XG4gICAgbGV0IGNvbWJpbmVkSGVpZ2h0ID0gY3VycmVudExhYmVsRm9udFNpemUgKyBzcGFjaW5nQmV0d2VlbkxhYmVsQW5kVmFsdWUgKyBwcm9zcGVjdGl2ZVZhbHVlRm9udFNpemU7XG4gICAgd2hpbGUgKGNvbWJpbmVkSGVpZ2h0ID4gYXZhaWxhYmxlSGVpZ2h0ICYmIGN1cnJlbnRMYWJlbEZvbnRTaXplID4gbWluTGFiZWxGb250U2l6ZSkge1xuICAgICAgY3VycmVudExhYmVsRm9udFNpemUtLTtcbiAgICAgIHByb3NwZWN0aXZlVmFsdWVGb250U2l6ZSA9IE1hdGgubWF4KFxuICAgICAgICBtaW5WYWx1ZUZvbnRTaXplLFxuICAgICAgICBNYXRoLm1pbihvcmlnaW5hbFZhbHVlUmVsRm9udFNpemUsIE1hdGgucm91bmQoY3VycmVudExhYmVsRm9udFNpemUgKiB2YWx1ZVNjYWxlRmFjdG9yKSlcbiAgICAgICk7XG4gICAgICBpZiAocHJvc3BlY3RpdmVWYWx1ZUZvbnRTaXplIDwgbWluVmFsdWVGb250U2l6ZSAmJiBjdXJyZW50TGFiZWxGb250U2l6ZSA9PT0gbWluTGFiZWxGb250U2l6ZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHNlbGYuc3R5bGUoXCJmb250LXNpemVcIiwgYCR7Y3VycmVudExhYmVsRm9udFNpemV9cHhgKTtcbiAgICAgIGNvbWJpbmVkSGVpZ2h0ID0gY3VycmVudExhYmVsRm9udFNpemUgKyBzcGFjaW5nQmV0d2VlbkxhYmVsQW5kVmFsdWUgKyBwcm9zcGVjdGl2ZVZhbHVlRm9udFNpemU7XG4gICAgICBpZiAocHJvc3BlY3RpdmVWYWx1ZUZvbnRTaXplIDw9IG1pblZhbHVlRm9udFNpemUgJiYgY29tYmluZWRIZWlnaHQgPiBhdmFpbGFibGVIZWlnaHQpIHtcbiAgICAgIH1cbiAgICB9XG4gICAgc2VsZi5zdHlsZShcImZvbnQtc2l6ZVwiLCBgJHtjdXJyZW50TGFiZWxGb250U2l6ZX1weGApO1xuICAgIGlmICh0ZXh0Tm9kZS5nZXRDb21wdXRlZFRleHRMZW5ndGgoKSA+IGF2YWlsYWJsZVdpZHRoIHx8IGN1cnJlbnRMYWJlbEZvbnRTaXplIDwgbWluTGFiZWxGb250U2l6ZSB8fCBhdmFpbGFibGVIZWlnaHQgPCBjdXJyZW50TGFiZWxGb250U2l6ZSkge1xuICAgICAgc2VsZi5zdHlsZShcImRpc3BsYXlcIiwgXCJub25lXCIpO1xuICAgIH1cbiAgfSk7XG4gIGlmIChjb25maWcuc2hvd1ZhbHVlcyAhPT0gZmFsc2UpIHtcbiAgICBjb25zdCBsZWFmVmFsdWVzID0gY2VsbC5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJjbGFzc1wiLCBcInRyZWVtYXBWYWx1ZVwiKS5hdHRyKFwieFwiLCAoZCkgPT4gKGQueDEgLSBkLngwKSAvIDIpLmF0dHIoXCJ5XCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiAoZC55MSAtIGQueTApIC8gMjtcbiAgICB9KS5hdHRyKFwic3R5bGVcIiwgKGQpID0+IHtcbiAgICAgIGNvbnN0IGxhYmVsU3R5bGVzID0gXCJ0ZXh0LWFuY2hvcjogbWlkZGxlOyBkb21pbmFudC1iYXNlbGluZTogaGFuZ2luZzsgZm9udC1zaXplOiAyOHB4O2ZpbGw6XCIgKyBjb2xvclNjYWxlTGFiZWwoZC5kYXRhLm5hbWUpICsgXCI7XCI7XG4gICAgICBjb25zdCBzdHlsZXMgPSBzdHlsZXMyU3RyaW5nKHsgY3NzQ29tcGlsZWRTdHlsZXM6IGQuZGF0YS5jc3NDb21waWxlZFN0eWxlcyB9KTtcbiAgICAgIHJldHVybiBsYWJlbFN0eWxlcyArIHN0eWxlcy5sYWJlbFN0eWxlcy5yZXBsYWNlKFwiY29sb3I6XCIsIFwiZmlsbDpcIik7XG4gICAgfSkuYXR0cihcImNsaXAtcGF0aFwiLCAoX2QsIGkpID0+IGB1cmwoI2NsaXAtJHtpZH0tJHtpfSlgKS50ZXh0KChkKSA9PiBkLnZhbHVlID8gdmFsdWVGb3JtYXQoZC52YWx1ZSkgOiBcIlwiKTtcbiAgICBsZWFmVmFsdWVzLmVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgY29uc3QgdmFsdWVUZXh0RWxlbWVudCA9IHNlbGVjdCh0aGlzKTtcbiAgICAgIGNvbnN0IHBhcmVudENlbGxOb2RlID0gdGhpcy5wYXJlbnROb2RlO1xuICAgICAgaWYgKCFwYXJlbnRDZWxsTm9kZSkge1xuICAgICAgICB2YWx1ZVRleHRFbGVtZW50LnN0eWxlKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGxhYmVsRWxlbWVudCA9IHNlbGVjdChwYXJlbnRDZWxsTm9kZSkuc2VsZWN0KFwiLnRyZWVtYXBMYWJlbFwiKTtcbiAgICAgIGlmIChsYWJlbEVsZW1lbnQuZW1wdHkoKSB8fCBsYWJlbEVsZW1lbnQuc3R5bGUoXCJkaXNwbGF5XCIpID09PSBcIm5vbmVcIikge1xuICAgICAgICB2YWx1ZVRleHRFbGVtZW50LnN0eWxlKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGZpbmFsTGFiZWxGb250U2l6ZSA9IHBhcnNlRmxvYXQobGFiZWxFbGVtZW50LnN0eWxlKFwiZm9udC1zaXplXCIpKTtcbiAgICAgIGNvbnN0IG9yaWdpbmFsVmFsdWVGb250U2l6ZSA9IDI4O1xuICAgICAgY29uc3QgdmFsdWVTY2FsZUZhY3RvciA9IDAuNjtcbiAgICAgIGNvbnN0IG1pblZhbHVlRm9udFNpemUgPSA2O1xuICAgICAgY29uc3Qgc3BhY2luZ0JldHdlZW5MYWJlbEFuZFZhbHVlID0gMjtcbiAgICAgIGNvbnN0IGFjdHVhbFZhbHVlRm9udFNpemUgPSBNYXRoLm1heChcbiAgICAgICAgbWluVmFsdWVGb250U2l6ZSxcbiAgICAgICAgTWF0aC5taW4ob3JpZ2luYWxWYWx1ZUZvbnRTaXplLCBNYXRoLnJvdW5kKGZpbmFsTGFiZWxGb250U2l6ZSAqIHZhbHVlU2NhbGVGYWN0b3IpKVxuICAgICAgKTtcbiAgICAgIHZhbHVlVGV4dEVsZW1lbnQuc3R5bGUoXCJmb250LXNpemVcIiwgYCR7YWN0dWFsVmFsdWVGb250U2l6ZX1weGApO1xuICAgICAgY29uc3QgbGFiZWxDZW50ZXJZID0gKGQueTEgLSBkLnkwKSAvIDI7XG4gICAgICBjb25zdCB2YWx1ZVRvcEFjdHVhbFkgPSBsYWJlbENlbnRlclkgKyBmaW5hbExhYmVsRm9udFNpemUgLyAyICsgc3BhY2luZ0JldHdlZW5MYWJlbEFuZFZhbHVlO1xuICAgICAgdmFsdWVUZXh0RWxlbWVudC5hdHRyKFwieVwiLCB2YWx1ZVRvcEFjdHVhbFkpO1xuICAgICAgY29uc3Qgbm9kZVdpZHRoID0gZC54MSAtIGQueDA7XG4gICAgICBjb25zdCBub2RlVG90YWxIZWlnaHQgPSBkLnkxIC0gZC55MDtcbiAgICAgIGNvbnN0IGNlbGxCb3R0b21QYWRkaW5nID0gNDtcbiAgICAgIGNvbnN0IG1heFZhbHVlQm90dG9tWSA9IG5vZGVUb3RhbEhlaWdodCAtIGNlbGxCb3R0b21QYWRkaW5nO1xuICAgICAgY29uc3QgYXZhaWxhYmxlV2lkdGhGb3JWYWx1ZSA9IG5vZGVXaWR0aCAtIDIgKiA0O1xuICAgICAgaWYgKHZhbHVlVGV4dEVsZW1lbnQubm9kZSgpLmdldENvbXB1dGVkVGV4dExlbmd0aCgpID4gYXZhaWxhYmxlV2lkdGhGb3JWYWx1ZSB8fCB2YWx1ZVRvcEFjdHVhbFkgKyBhY3R1YWxWYWx1ZUZvbnRTaXplID4gbWF4VmFsdWVCb3R0b21ZIHx8IGFjdHVhbFZhbHVlRm9udFNpemUgPCBtaW5WYWx1ZUZvbnRTaXplKSB7XG4gICAgICAgIHZhbHVlVGV4dEVsZW1lbnQuc3R5bGUoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlVGV4dEVsZW1lbnQuc3R5bGUoXCJkaXNwbGF5XCIsIG51bGwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGNvbnN0IGRpYWdyYW1QYWRkaW5nID0gY29uZmlnLmRpYWdyYW1QYWRkaW5nID8/IDg7XG4gIHNldHVwVmlld1BvcnRGb3JTVkcoc3ZnLCBkaWFncmFtUGFkZGluZywgXCJmbG93Y2hhcnRcIiwgY29uZmlnPy51c2VNYXhXaWR0aCB8fCBmYWxzZSk7XG59LCBcImRyYXdcIik7XG52YXIgZ2V0Q2xhc3NlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oX3RleHQsIGRpYWdyYW1PYmopIHtcbiAgcmV0dXJuIGRpYWdyYW1PYmouZGIuZ2V0Q2xhc3NlcygpO1xufSwgXCJnZXRDbGFzc2VzXCIpO1xudmFyIHJlbmRlcmVyID0geyBkcmF3LCBnZXRDbGFzc2VzIH07XG5cbi8vIHNyYy9kaWFncmFtcy90cmVlbWFwL3N0eWxlcy50c1xudmFyIGRlZmF1bHRUcmVlbWFwU3R5bGVPcHRpb25zID0ge1xuICBzZWN0aW9uU3Ryb2tlQ29sb3I6IFwiYmxhY2tcIixcbiAgc2VjdGlvblN0cm9rZVdpZHRoOiBcIjFcIixcbiAgc2VjdGlvbkZpbGxDb2xvcjogXCIjZWZlZmVmXCIsXG4gIGxlYWZTdHJva2VDb2xvcjogXCJibGFja1wiLFxuICBsZWFmU3Ryb2tlV2lkdGg6IFwiMVwiLFxuICBsZWFmRmlsbENvbG9yOiBcIiNlZmVmZWZcIixcbiAgbGFiZWxGb250U2l6ZTogXCIxMnB4XCIsXG4gIHZhbHVlRm9udFNpemU6IFwiMTBweFwiLFxuICB0aXRsZUZvbnRTaXplOiBcIjE0cHhcIlxufTtcbnZhciBnZXRTdHlsZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCh7XG4gIHRyZWVtYXA6IHRyZWVtYXAyXG59ID0ge30pID0+IHtcbiAgY29uc3QgZGVmYXVsdFRoZW1lVmFyaWFibGVzID0gZ2V0VGhlbWVWYXJpYWJsZXMoKTtcbiAgY29uc3QgY3VycmVudENvbmZpZyA9IGdldENvbmZpZygpO1xuICBjb25zdCB0aGVtZVZhcmlhYmxlcyA9IGNsZWFuQW5kTWVyZ2UoZGVmYXVsdFRoZW1lVmFyaWFibGVzLCBjdXJyZW50Q29uZmlnLnRoZW1lVmFyaWFibGVzKTtcbiAgY29uc3Qgb3B0aW9ucyA9IGNsZWFuQW5kTWVyZ2UoZGVmYXVsdFRyZWVtYXBTdHlsZU9wdGlvbnMsIHRyZWVtYXAyKTtcbiAgY29uc3QgdGl0bGVDb2xvciA9IG9wdGlvbnMudGl0bGVDb2xvciA/PyB0aGVtZVZhcmlhYmxlcy50aXRsZUNvbG9yO1xuICBjb25zdCBsYWJlbENvbG9yID0gb3B0aW9ucy5sYWJlbENvbG9yID8/IHRoZW1lVmFyaWFibGVzLnRleHRDb2xvcjtcbiAgY29uc3QgdmFsdWVDb2xvciA9IG9wdGlvbnMudmFsdWVDb2xvciA/PyB0aGVtZVZhcmlhYmxlcy50ZXh0Q29sb3I7XG4gIHJldHVybiBgXG4gIC50cmVlbWFwTm9kZS5zZWN0aW9uIHtcbiAgICBzdHJva2U6ICR7b3B0aW9ucy5zZWN0aW9uU3Ryb2tlQ29sb3J9O1xuICAgIHN0cm9rZS13aWR0aDogJHtvcHRpb25zLnNlY3Rpb25TdHJva2VXaWR0aH07XG4gICAgZmlsbDogJHtvcHRpb25zLnNlY3Rpb25GaWxsQ29sb3J9O1xuICB9XG4gIC50cmVlbWFwTm9kZS5sZWFmIHtcbiAgICBzdHJva2U6ICR7b3B0aW9ucy5sZWFmU3Ryb2tlQ29sb3J9O1xuICAgIHN0cm9rZS13aWR0aDogJHtvcHRpb25zLmxlYWZTdHJva2VXaWR0aH07XG4gICAgZmlsbDogJHtvcHRpb25zLmxlYWZGaWxsQ29sb3J9O1xuICB9XG4gIC50cmVlbWFwTGFiZWwge1xuICAgIGZpbGw6ICR7bGFiZWxDb2xvcn07XG4gICAgZm9udC1zaXplOiAke29wdGlvbnMubGFiZWxGb250U2l6ZX07XG4gIH1cbiAgLnRyZWVtYXBWYWx1ZSB7XG4gICAgZmlsbDogJHt2YWx1ZUNvbG9yfTtcbiAgICBmb250LXNpemU6ICR7b3B0aW9ucy52YWx1ZUZvbnRTaXplfTtcbiAgfVxuICAudHJlZW1hcFRpdGxlIHtcbiAgICBmaWxsOiAke3RpdGxlQ29sb3J9O1xuICAgIGZvbnQtc2l6ZTogJHtvcHRpb25zLnRpdGxlRm9udFNpemV9O1xuICB9XG4gIGA7XG59LCBcImdldFN0eWxlc1wiKTtcbnZhciBzdHlsZXNfZGVmYXVsdCA9IGdldFN0eWxlcztcblxuLy8gc3JjL2RpYWdyYW1zL3RyZWVtYXAvZGlhZ3JhbS50c1xudmFyIGRpYWdyYW0gPSB7XG4gIHBhcnNlcixcbiAgZ2V0IGRiKCkge1xuICAgIHJldHVybiBuZXcgVHJlZU1hcERCKCk7XG4gIH0sXG4gIHJlbmRlcmVyLFxuICBzdHlsZXM6IHN0eWxlc19kZWZhdWx0XG59O1xuZXhwb3J0IHtcbiAgZGlhZ3JhbVxufTtcbiIKICBdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUNBLElBQUksWUFBWSxNQUFNO0FBQUEsRUFDcEIsV0FBVyxHQUFHO0FBQUEsSUFDWixLQUFLLFFBQVEsQ0FBQztBQUFBLElBQ2QsS0FBSyx5QkFBeUIsSUFBSTtBQUFBLElBQ2xDLEtBQUssYUFBYSxDQUFDO0FBQUEsSUFDbkIsS0FBSywwQkFBMEIsSUFBSTtBQUFBLElBQ25DLEtBQUssY0FBYztBQUFBLElBQ25CLEtBQUssY0FBYztBQUFBLElBQ25CLEtBQUssa0JBQWtCO0FBQUEsSUFDdkIsS0FBSyxrQkFBa0I7QUFBQSxJQUN2QixLQUFLLG9CQUFvQjtBQUFBLElBQ3pCLEtBQUssb0JBQW9CO0FBQUE7QUFBQSxTQUVwQjtBQUFBLElBQ0wsT0FBTyxNQUFNLFdBQVc7QUFBQTtBQUFBLEVBRTFCLFFBQVEsR0FBRztBQUFBLElBQ1QsT0FBTyxLQUFLO0FBQUE7QUFBQSxFQUVkLFNBQVMsR0FBRztBQUFBLElBQ1YsTUFBTSxnQkFBZ0I7QUFBQSxJQUN0QixNQUFNLGFBQWEsVUFBVTtBQUFBLElBQzdCLE9BQU8sY0FBYztBQUFBLFNBQ2hCLGNBQWM7QUFBQSxTQUNkLFdBQVcsV0FBVyxDQUFDO0FBQUEsSUFDNUIsQ0FBQztBQUFBO0FBQUEsRUFFSCxPQUFPLENBQUMsTUFBTSxPQUFPO0FBQUEsSUFDbkIsS0FBSyxNQUFNLEtBQUssSUFBSTtBQUFBLElBQ3BCLEtBQUssT0FBTyxJQUFJLE1BQU0sS0FBSztBQUFBLElBQzNCLElBQUksVUFBVSxHQUFHO0FBQUEsTUFDZixLQUFLLFdBQVcsS0FBSyxJQUFJO0FBQUEsTUFDekIsS0FBSyxTQUFTO0FBQUEsSUFDaEI7QUFBQTtBQUFBLEVBRUYsT0FBTyxHQUFHO0FBQUEsSUFDUixPQUFP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LGtCQUFrQixzQkFBc0IsbUJBQW1CLHNCQUFzQixrQkFBa0I7QUFBQSxRQUNqTCxpQkFBaUIsTUFBTSxXQUFXLE1BQU07QUFBQSxNQUMxQyxFQUFPO0FBQUEsUUFDTCxpQkFBaUIsTUFBTSxXQUFXLElBQUk7QUFBQTtBQUFBLEtBRXpDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsTUFBTSxpQkFBaUIsT0FBTyxrQkFBa0I7QUFBQSxFQUNoRCxvQkFBb0IsS0FBSyxnQkFBZ0IsYUFBYSxRQUFRLGVBQWUsS0FBSztBQUFBLEdBQ2pGLE1BQU07QUFDVCxJQUFJLDZCQUE2QixPQUFPLFFBQVEsQ0FBQyxPQUFPLFlBQVk7QUFBQSxFQUNsRSxPQUFPLFdBQVcsR0FBRyxXQUFXO0FBQUEsR0FDL0IsWUFBWTtBQUNmLElBQUksV0FBVyxFQUFFLE1BQU0sV0FBVztBQUdsQyxJQUFJLDZCQUE2QjtBQUFBLEVBQy9CLG9CQUFvQjtBQUFBLEVBQ3BCLG9CQUFvQjtBQUFBLEVBQ3BCLGtCQUFrQjtBQUFBLEVBQ2xCLGlCQUFpQjtBQUFBLEVBQ2pCLGlCQUFpQjtBQUFBLEVBQ2pCLGVBQWU7QUFBQSxFQUNmLGVBQWU7QUFBQSxFQUNmLGVBQWU7QUFBQSxFQUNmLGVBQWU7QUFDakI7QUFDQSxJQUFJLDRCQUE0QixPQUFPO0FBQUEsRUFDckMsU0FBUztBQUFBLElBQ1AsQ0FBQyxNQUFNO0FBQUEsRUFDVCxNQUFNLHdCQUF3QixtQkFBa0I7QUFBQSxFQUNoRCxNQUFNLGdCQUFnQixVQUFVO0FBQUEsRUFDaEMsTUFBTSxpQkFBaUIsY0FBYyx1QkFBdUIsY0FBYyxjQUFjO0FBQUEsRUFDeEYsTUFBTSxVQUFVLGNBQWMsNEJBQTRCLFFBQVE7QUFBQSxFQUNsRSxNQUFNLGFBQWEsUUFBUSxjQUFjLGVBQWU7QUFBQSxFQUN4RCxNQUFNLGFBQWEsUUFBUSxjQUFjLGVBQWU7QUFBQSxFQUN4RCxNQUFNLGFBQWEsUUFBUSxjQUFjLGVBQWU7QUFBQSxFQUN4RCxPQUFPO0FBQUE7QUFBQSxjQUVLLFFBQVE7QUFBQSxvQkFDRixRQUFRO0FBQUEsWUFDaEIsUUFBUTtBQUFBO0FBQUE7QUFBQSxjQUdOLFFBQVE7QUFBQSxvQkFDRixRQUFRO0FBQUEsWUFDaEIsUUFBUTtBQUFBO0FBQUE7QUFBQSxZQUdSO0FBQUEsaUJBQ0ssUUFBUTtBQUFBO0FBQUE7QUFBQSxZQUdiO0FBQUEsaUJBQ0ssUUFBUTtBQUFBO0FBQUE7QUFBQSxZQUdiO0FBQUEsaUJBQ0ssUUFBUTtBQUFBO0FBQUE7QUFBQSxHQUd0QixXQUFXO0FBQ2QsSUFBSSxpQkFBaUI7QUFHckIsSUFBSSxVQUFVO0FBQUEsRUFDWjtBQUFBLE1BQ0ksRUFBRSxHQUFHO0FBQUEsSUFDUCxPQUFPLElBQUk7QUFBQTtBQUFBLEVBRWI7QUFBQSxFQUNBLFFBQVE7QUFDVjsiLAogICJkZWJ1Z0lkIjogIjIwMDk0QkZBMjZFNTlGQjQ2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
