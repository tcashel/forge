import {
  ImperativeState
} from "./chunk-main-91q4jzw9.js";
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
  defaultConfig_default,
  getAccDescription,
  getAccTitle,
  getConfig,
  getDiagramTitle,
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

// node_modules/mermaid/dist/chunks/mermaid.core/diagram-5GNKFQAL.mjs
var state = new ImperativeState(() => ({
  cnt: 1,
  stack: [
    {
      id: 0,
      level: -1,
      name: "/",
      children: []
    }
  ]
}));
var clear2 = /* @__PURE__ */ __name(() => {
  state.reset();
  clear();
}, "clear");
var getRoot = /* @__PURE__ */ __name(() => {
  return state.records.stack[0];
}, "getRoot");
var getCount = /* @__PURE__ */ __name(() => state.records.cnt, "getCount");
var defaultConfig = defaultConfig_default.treeView;
var getConfig2 = /* @__PURE__ */ __name(() => {
  return cleanAndMerge(defaultConfig, getConfig().treeView);
}, "getConfig");
var addNode = /* @__PURE__ */ __name((level, name) => {
  while (level <= state.records.stack[state.records.stack.length - 1].level) {
    state.records.stack.pop();
  }
  const node = {
    id: state.records.cnt++,
    level,
    name,
    children: []
  };
  state.records.stack[state.records.stack.length - 1].children.push(node);
  state.records.stack.push(node);
}, "addNode");
var db = {
  clear: clear2,
  addNode,
  getRoot,
  getCount,
  getConfig: getConfig2,
  getAccTitle,
  getAccDescription,
  getDiagramTitle,
  setAccDescription,
  setAccTitle,
  setDiagramTitle
};
var db_default = db;
var populate = /* @__PURE__ */ __name((ast) => {
  populateCommonDb(ast, db_default);
  ast.nodes.map((node) => db_default.addNode(node.indent ? parseInt(node.indent) : 0, node.name));
}, "populate");
var parser = {
  parse: /* @__PURE__ */ __name(async (input) => {
    const ast = await parse("treeView", input);
    log.debug(ast);
    populate(ast);
  }, "parse")
};
var positionLabel = /* @__PURE__ */ __name((x, y, node, domElem, config) => {
  const label = domElem.append("text").text(node.name).attr("dominant-baseline", "middle").attr("class", "treeView-node-label");
  const { height: labelHeight, width: labelWidth } = label.node().getBBox();
  const height = labelHeight + config.paddingY * 2;
  const width = labelWidth + config.paddingX * 2;
  label.attr("x", x + config.paddingX);
  label.attr("y", y + height / 2);
  node.BBox = {
    x,
    y,
    width,
    height
  };
}, "positionLabel");
var positionLine = /* @__PURE__ */ __name((domElem, x1, y1, x2, y2, lineThickness) => {
  return domElem.append("line").attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2).attr("stroke-width", lineThickness).attr("class", "treeView-node-line");
}, "positionLine");
var drawTree = /* @__PURE__ */ __name((elem, root, config) => {
  let totalHeight = 0;
  let totalWidth = 0;
  const drawNode = /* @__PURE__ */ __name((elem2, node, config2, depth) => {
    const indent = depth * (config2.rowIndent + config2.paddingX);
    positionLabel(indent, totalHeight, node, elem2, config2);
    const { height, width } = node.BBox;
    positionLine(elem2, indent - config2.rowIndent, totalHeight + height / 2, indent, totalHeight + height / 2, config2.lineThickness);
    totalWidth = Math.max(totalWidth, indent + width);
    totalHeight += height;
  }, "drawNode");
  const processNode = /* @__PURE__ */ __name((node, depth = 0) => {
    drawNode(elem, node, config, depth);
    node.children.forEach((child) => {
      processNode(child, depth + 1);
    });
    const { x, y, height } = node.BBox;
    if (node.children.length) {
      const { y: endY, height: endHeight } = node.children[node.children.length - 1].BBox;
      positionLine(elem, x + config.paddingX, y + height, x + config.paddingX, endY + endHeight / 2 + config.lineThickness / 2, config.lineThickness);
    }
  }, "processNode");
  processNode(root);
  return { totalHeight, totalWidth };
}, "drawTree");
var draw = /* @__PURE__ */ __name((text, id, _ver, diagObj) => {
  log.debug(`Rendering treeView diagram
` + text);
  const db2 = diagObj.db;
  const root = db2.getRoot();
  const config = db2.getConfig();
  const svg = selectSvgElement(id);
  const treeElem = svg.append("g");
  treeElem.attr("class", "tree-view");
  const { totalHeight, totalWidth } = drawTree(treeElem, root, config);
  svg.attr("viewBox", `-${config.lineThickness / 2} 0 ${totalWidth} ${totalHeight}`);
  configureSvgSize(svg, totalHeight, totalWidth, config.useMaxWidth);
}, "draw");
var renderer = {
  draw
};
var renderer_default = renderer;
var defaultTreeViewDiagramStyles = {
  labelFontSize: "16px",
  labelColor: "black",
  lineColor: "black"
};
var styles = /* @__PURE__ */ __name(({
  treeView
}) => {
  const { labelFontSize, labelColor, lineColor } = cleanAndMerge(defaultTreeViewDiagramStyles, treeView);
  return `
    .treeView-node-label {
        font-size: ${labelFontSize};
        fill: ${labelColor};
    }
    .treeView-node-line {
        stroke: ${lineColor};
    }
    `;
}, "styles");
var styles_default = styles;
var diagram = {
  db: db_default,
  renderer: renderer_default,
  parser,
  styles: styles_default
};
export {
  diagram
};

//# debugId=6D5160206ACB2E6364756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2RpYWdyYW0tNUdOS0ZRQUwubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgImltcG9ydCB7XG4gIHNlbGVjdFN2Z0VsZW1lbnRcbn0gZnJvbSBcIi4vY2h1bmstV1U1TVlHMkcubWpzXCI7XG5pbXBvcnQge1xuICBwb3B1bGF0ZUNvbW1vbkRiXG59IGZyb20gXCIuL2NodW5rLTRCWDJWVUFCLm1qc1wiO1xuaW1wb3J0IHtcbiAgSW1wZXJhdGl2ZVN0YXRlXG59IGZyb20gXCIuL2NodW5rLVFaSEtOM1ZOLm1qc1wiO1xuaW1wb3J0IHtcbiAgY2xlYW5BbmRNZXJnZVxufSBmcm9tIFwiLi9jaHVuay01WlFZSFhLVS5tanNcIjtcbmltcG9ydCB7XG4gIGNsZWFyLFxuICBjb25maWd1cmVTdmdTaXplLFxuICBkZWZhdWx0Q29uZmlnX2RlZmF1bHQsXG4gIGdldEFjY0Rlc2NyaXB0aW9uLFxuICBnZXRBY2NUaXRsZSxcbiAgZ2V0Q29uZmlnLFxuICBnZXREaWFncmFtVGl0bGUsXG4gIHNldEFjY0Rlc2NyaXB0aW9uLFxuICBzZXRBY2NUaXRsZSxcbiAgc2V0RGlhZ3JhbVRpdGxlXG59IGZyb20gXCIuL2NodW5rLUNTQ0lISzdRLm1qc1wiO1xuaW1wb3J0IHtcbiAgX19uYW1lLFxuICBsb2dcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIHNyYy9kaWFncmFtcy90cmVlVmlldy9kYi50c1xudmFyIHN0YXRlID0gbmV3IEltcGVyYXRpdmVTdGF0ZSgoKSA9PiAoe1xuICBjbnQ6IDEsXG4gIHN0YWNrOiBbXG4gICAge1xuICAgICAgaWQ6IDAsXG4gICAgICBsZXZlbDogLTEsXG4gICAgICBuYW1lOiBcIi9cIixcbiAgICAgIGNoaWxkcmVuOiBbXVxuICAgIH1cbiAgXVxufSkpO1xudmFyIGNsZWFyMiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKCkgPT4ge1xuICBzdGF0ZS5yZXNldCgpO1xuICBjbGVhcigpO1xufSwgXCJjbGVhclwiKTtcbnZhciBnZXRSb290ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiB7XG4gIHJldHVybiBzdGF0ZS5yZWNvcmRzLnN0YWNrWzBdO1xufSwgXCJnZXRSb290XCIpO1xudmFyIGdldENvdW50ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiBzdGF0ZS5yZWNvcmRzLmNudCwgXCJnZXRDb3VudFwiKTtcbnZhciBkZWZhdWx0Q29uZmlnID0gZGVmYXVsdENvbmZpZ19kZWZhdWx0LnRyZWVWaWV3O1xudmFyIGdldENvbmZpZzIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCgpID0+IHtcbiAgcmV0dXJuIGNsZWFuQW5kTWVyZ2UoZGVmYXVsdENvbmZpZywgZ2V0Q29uZmlnKCkudHJlZVZpZXcpO1xufSwgXCJnZXRDb25maWdcIik7XG52YXIgYWRkTm9kZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGxldmVsLCBuYW1lKSA9PiB7XG4gIHdoaWxlIChsZXZlbCA8PSBzdGF0ZS5yZWNvcmRzLnN0YWNrW3N0YXRlLnJlY29yZHMuc3RhY2subGVuZ3RoIC0gMV0ubGV2ZWwpIHtcbiAgICBzdGF0ZS5yZWNvcmRzLnN0YWNrLnBvcCgpO1xuICB9XG4gIGNvbnN0IG5vZGUgPSB7XG4gICAgaWQ6IHN0YXRlLnJlY29yZHMuY250KyssXG4gICAgbGV2ZWwsXG4gICAgbmFtZSxcbiAgICBjaGlsZHJlbjogW11cbiAgfTtcbiAgc3RhdGUucmVjb3Jkcy5zdGFja1tzdGF0ZS5yZWNvcmRzLnN0YWNrLmxlbmd0aCAtIDFdLmNoaWxkcmVuLnB1c2gobm9kZSk7XG4gIHN0YXRlLnJlY29yZHMuc3RhY2sucHVzaChub2RlKTtcbn0sIFwiYWRkTm9kZVwiKTtcbnZhciBkYiA9IHtcbiAgY2xlYXI6IGNsZWFyMixcbiAgYWRkTm9kZSxcbiAgZ2V0Um9vdCxcbiAgZ2V0Q291bnQsXG4gIGdldENvbmZpZzogZ2V0Q29uZmlnMixcbiAgZ2V0QWNjVGl0bGUsXG4gIGdldEFjY0Rlc2NyaXB0aW9uLFxuICBnZXREaWFncmFtVGl0bGUsXG4gIHNldEFjY0Rlc2NyaXB0aW9uLFxuICBzZXRBY2NUaXRsZSxcbiAgc2V0RGlhZ3JhbVRpdGxlXG59O1xudmFyIGRiX2RlZmF1bHQgPSBkYjtcblxuLy8gc3JjL2RpYWdyYW1zL3RyZWVWaWV3L3BhcnNlci50c1xuaW1wb3J0IHsgcGFyc2UgfSBmcm9tIFwiQG1lcm1haWQtanMvcGFyc2VyXCI7XG52YXIgcG9wdWxhdGUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChhc3QpID0+IHtcbiAgcG9wdWxhdGVDb21tb25EYihhc3QsIGRiX2RlZmF1bHQpO1xuICBhc3Qubm9kZXMubWFwKChub2RlKSA9PiBkYl9kZWZhdWx0LmFkZE5vZGUobm9kZS5pbmRlbnQgPyBwYXJzZUludChub2RlLmluZGVudCkgOiAwLCBub2RlLm5hbWUpKTtcbn0sIFwicG9wdWxhdGVcIik7XG52YXIgcGFyc2VyID0ge1xuICBwYXJzZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAoaW5wdXQpID0+IHtcbiAgICBjb25zdCBhc3QgPSBhd2FpdCBwYXJzZShcInRyZWVWaWV3XCIsIGlucHV0KTtcbiAgICBsb2cuZGVidWcoYXN0KTtcbiAgICBwb3B1bGF0ZShhc3QpO1xuICB9LCBcInBhcnNlXCIpXG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMvdHJlZVZpZXcvcmVuZGVyZXIudHNcbnZhciBwb3NpdGlvbkxhYmVsID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoeCwgeSwgbm9kZSwgZG9tRWxlbSwgY29uZmlnKSA9PiB7XG4gIGNvbnN0IGxhYmVsID0gZG9tRWxlbS5hcHBlbmQoXCJ0ZXh0XCIpLnRleHQobm9kZS5uYW1lKS5hdHRyKFwiZG9taW5hbnQtYmFzZWxpbmVcIiwgXCJtaWRkbGVcIikuYXR0cihcImNsYXNzXCIsIFwidHJlZVZpZXctbm9kZS1sYWJlbFwiKTtcbiAgY29uc3QgeyBoZWlnaHQ6IGxhYmVsSGVpZ2h0LCB3aWR0aDogbGFiZWxXaWR0aCB9ID0gbGFiZWwubm9kZSgpLmdldEJCb3goKTtcbiAgY29uc3QgaGVpZ2h0ID0gbGFiZWxIZWlnaHQgKyBjb25maWcucGFkZGluZ1kgKiAyO1xuICBjb25zdCB3aWR0aCA9IGxhYmVsV2lkdGggKyBjb25maWcucGFkZGluZ1ggKiAyO1xuICBsYWJlbC5hdHRyKFwieFwiLCB4ICsgY29uZmlnLnBhZGRpbmdYKTtcbiAgbGFiZWwuYXR0cihcInlcIiwgeSArIGhlaWdodCAvIDIpO1xuICBub2RlLkJCb3ggPSB7XG4gICAgeCxcbiAgICB5LFxuICAgIHdpZHRoLFxuICAgIGhlaWdodFxuICB9O1xufSwgXCJwb3NpdGlvbkxhYmVsXCIpO1xudmFyIHBvc2l0aW9uTGluZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGRvbUVsZW0sIHgxLCB5MSwgeDIsIHkyLCBsaW5lVGhpY2tuZXNzKSA9PiB7XG4gIHJldHVybiBkb21FbGVtLmFwcGVuZChcImxpbmVcIikuYXR0cihcIngxXCIsIHgxKS5hdHRyKFwieTFcIiwgeTEpLmF0dHIoXCJ4MlwiLCB4MikuYXR0cihcInkyXCIsIHkyKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIGxpbmVUaGlja25lc3MpLmF0dHIoXCJjbGFzc1wiLCBcInRyZWVWaWV3LW5vZGUtbGluZVwiKTtcbn0sIFwicG9zaXRpb25MaW5lXCIpO1xudmFyIGRyYXdUcmVlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZWxlbSwgcm9vdCwgY29uZmlnKSA9PiB7XG4gIGxldCB0b3RhbEhlaWdodCA9IDA7XG4gIGxldCB0b3RhbFdpZHRoID0gMDtcbiAgY29uc3QgZHJhd05vZGUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChlbGVtMiwgbm9kZSwgY29uZmlnMiwgZGVwdGgpID0+IHtcbiAgICBjb25zdCBpbmRlbnQgPSBkZXB0aCAqIChjb25maWcyLnJvd0luZGVudCArIGNvbmZpZzIucGFkZGluZ1gpO1xuICAgIHBvc2l0aW9uTGFiZWwoaW5kZW50LCB0b3RhbEhlaWdodCwgbm9kZSwgZWxlbTIsIGNvbmZpZzIpO1xuICAgIGNvbnN0IHsgaGVpZ2h0LCB3aWR0aCB9ID0gbm9kZS5CQm94O1xuICAgIHBvc2l0aW9uTGluZShcbiAgICAgIGVsZW0yLFxuICAgICAgaW5kZW50IC0gY29uZmlnMi5yb3dJbmRlbnQsXG4gICAgICB0b3RhbEhlaWdodCArIGhlaWdodCAvIDIsXG4gICAgICBpbmRlbnQsXG4gICAgICB0b3RhbEhlaWdodCArIGhlaWdodCAvIDIsXG4gICAgICBjb25maWcyLmxpbmVUaGlja25lc3NcbiAgICApO1xuICAgIHRvdGFsV2lkdGggPSBNYXRoLm1heCh0b3RhbFdpZHRoLCBpbmRlbnQgKyB3aWR0aCk7XG4gICAgdG90YWxIZWlnaHQgKz0gaGVpZ2h0O1xuICB9LCBcImRyYXdOb2RlXCIpO1xuICBjb25zdCBwcm9jZXNzTm9kZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKG5vZGUsIGRlcHRoID0gMCkgPT4ge1xuICAgIGRyYXdOb2RlKGVsZW0sIG5vZGUsIGNvbmZpZywgZGVwdGgpO1xuICAgIG5vZGUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgIHByb2Nlc3NOb2RlKGNoaWxkLCBkZXB0aCArIDEpO1xuICAgIH0pO1xuICAgIGNvbnN0IHsgeCwgeSwgaGVpZ2h0IH0gPSBub2RlLkJCb3g7XG4gICAgaWYgKG5vZGUuY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICBjb25zdCB7IHk6IGVuZFksIGhlaWdodDogZW5kSGVpZ2h0IH0gPSBub2RlLmNoaWxkcmVuW25vZGUuY2hpbGRyZW4ubGVuZ3RoIC0gMV0uQkJveDtcbiAgICAgIHBvc2l0aW9uTGluZShcbiAgICAgICAgZWxlbSxcbiAgICAgICAgeCArIGNvbmZpZy5wYWRkaW5nWCxcbiAgICAgICAgeSArIGhlaWdodCxcbiAgICAgICAgeCArIGNvbmZpZy5wYWRkaW5nWCxcbiAgICAgICAgZW5kWSArIGVuZEhlaWdodCAvIDIgKyBjb25maWcubGluZVRoaWNrbmVzcyAvIDIsXG4gICAgICAgIGNvbmZpZy5saW5lVGhpY2tuZXNzXG4gICAgICApO1xuICAgIH1cbiAgfSwgXCJwcm9jZXNzTm9kZVwiKTtcbiAgcHJvY2Vzc05vZGUocm9vdCk7XG4gIHJldHVybiB7IHRvdGFsSGVpZ2h0LCB0b3RhbFdpZHRoIH07XG59LCBcImRyYXdUcmVlXCIpO1xudmFyIGRyYXcgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCh0ZXh0LCBpZCwgX3ZlciwgZGlhZ09iaikgPT4ge1xuICBsb2cuZGVidWcoXCJSZW5kZXJpbmcgdHJlZVZpZXcgZGlhZ3JhbVxcblwiICsgdGV4dCk7XG4gIGNvbnN0IGRiMiA9IGRpYWdPYmouZGI7XG4gIGNvbnN0IHJvb3QgPSBkYjIuZ2V0Um9vdCgpO1xuICBjb25zdCBjb25maWcgPSBkYjIuZ2V0Q29uZmlnKCk7XG4gIGNvbnN0IHN2ZyA9IHNlbGVjdFN2Z0VsZW1lbnQoaWQpO1xuICBjb25zdCB0cmVlRWxlbSA9IHN2Zy5hcHBlbmQoXCJnXCIpO1xuICB0cmVlRWxlbS5hdHRyKFwiY2xhc3NcIiwgXCJ0cmVlLXZpZXdcIik7XG4gIGNvbnN0IHsgdG90YWxIZWlnaHQsIHRvdGFsV2lkdGggfSA9IGRyYXdUcmVlKHRyZWVFbGVtLCByb290LCBjb25maWcpO1xuICBzdmcuYXR0cihcInZpZXdCb3hcIiwgYC0ke2NvbmZpZy5saW5lVGhpY2tuZXNzIC8gMn0gMCAke3RvdGFsV2lkdGh9ICR7dG90YWxIZWlnaHR9YCk7XG4gIGNvbmZpZ3VyZVN2Z1NpemUoc3ZnLCB0b3RhbEhlaWdodCwgdG90YWxXaWR0aCwgY29uZmlnLnVzZU1heFdpZHRoKTtcbn0sIFwiZHJhd1wiKTtcbnZhciByZW5kZXJlciA9IHtcbiAgZHJhd1xufTtcbnZhciByZW5kZXJlcl9kZWZhdWx0ID0gcmVuZGVyZXI7XG5cbi8vIHNyYy9kaWFncmFtcy90cmVlVmlldy9zdHlsZXMudHNcbnZhciBkZWZhdWx0VHJlZVZpZXdEaWFncmFtU3R5bGVzID0ge1xuICBsYWJlbEZvbnRTaXplOiBcIjE2cHhcIixcbiAgbGFiZWxDb2xvcjogXCJibGFja1wiLFxuICBsaW5lQ29sb3I6IFwiYmxhY2tcIlxufTtcbnZhciBzdHlsZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCh7XG4gIHRyZWVWaWV3XG59KSA9PiB7XG4gIGNvbnN0IHsgbGFiZWxGb250U2l6ZSwgbGFiZWxDb2xvciwgbGluZUNvbG9yIH0gPSBjbGVhbkFuZE1lcmdlKFxuICAgIGRlZmF1bHRUcmVlVmlld0RpYWdyYW1TdHlsZXMsXG4gICAgdHJlZVZpZXdcbiAgKTtcbiAgcmV0dXJuIGBcbiAgICAudHJlZVZpZXctbm9kZS1sYWJlbCB7XG4gICAgICAgIGZvbnQtc2l6ZTogJHtsYWJlbEZvbnRTaXplfTtcbiAgICAgICAgZmlsbDogJHtsYWJlbENvbG9yfTtcbiAgICB9XG4gICAgLnRyZWVWaWV3LW5vZGUtbGluZSB7XG4gICAgICAgIHN0cm9rZTogJHtsaW5lQ29sb3J9O1xuICAgIH1cbiAgICBgO1xufSwgXCJzdHlsZXNcIik7XG52YXIgc3R5bGVzX2RlZmF1bHQgPSBzdHlsZXM7XG5cbi8vIHNyYy9kaWFncmFtcy90cmVlVmlldy9kaWFncmFtLnRzXG52YXIgZGlhZ3JhbSA9IHtcbiAgZGI6IGRiX2RlZmF1bHQsXG4gIHJlbmRlcmVyOiByZW5kZXJlcl9kZWZhdWx0LFxuICBwYXJzZXIsXG4gIHN0eWxlczogc3R5bGVzX2RlZmF1bHRcbn07XG5leHBvcnQge1xuICBkaWFncmFtXG59O1xuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQThCQSxJQUFJLFFBQVEsSUFBSSxnQkFBZ0IsT0FBTztBQUFBLEVBQ3JDLEtBQUs7QUFBQSxFQUNMLE9BQU87QUFBQSxJQUNMO0FBQUEsTUFDRSxJQUFJO0FBQUEsTUFDSixPQUFPO0FBQUEsTUFDUCxNQUFNO0FBQUEsTUFDTixVQUFVLENBQUM7QUFBQSxJQUNiO0FBQUEs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
