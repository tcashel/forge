import {
  clear,
  common_default,
  defaultConfig2,
  getAccDescription,
  getAccTitle,
  getConfig2,
  getDiagramTitle,
  setAccDescription,
  setAccTitle,
  setDiagramTitle,
  setupGraphViewbox
} from "./chunk-main-aws590jt.js";
import {
  Tableau10_default,
  __name,
  ordinal,
  select_default
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-g8wf8be2.js";
// node_modules/d3-sankey/node_modules/d3-array/src/max.js
function max(values, valueof) {
  let max2;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null && (max2 < value || max2 === undefined && value >= value)) {
        max2 = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (max2 < value || max2 === undefined && value >= value)) {
        max2 = value;
      }
    }
  }
  return max2;
}
// node_modules/d3-sankey/node_modules/d3-array/src/min.js
function min(values, valueof) {
  let min2;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null && (min2 > value || min2 === undefined && value >= value)) {
        min2 = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (min2 > value || min2 === undefined && value >= value)) {
        min2 = value;
      }
    }
  }
  return min2;
}
// node_modules/d3-sankey/node_modules/d3-array/src/sum.js
function sum(values, valueof) {
  let sum2 = 0;
  if (valueof === undefined) {
    for (let value of values) {
      if (value = +value) {
        sum2 += value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if (value = +valueof(value, ++index, values)) {
        sum2 += value;
      }
    }
  }
  return sum2;
}
// node_modules/d3-sankey/src/align.js
function targetDepth(d) {
  return d.target.depth;
}
function left(node) {
  return node.depth;
}
function right(node, n) {
  return n - 1 - node.height;
}
function justify(node, n) {
  return node.sourceLinks.length ? node.depth : n - 1;
}
function center(node) {
  return node.targetLinks.length ? node.depth : node.sourceLinks.length ? min(node.sourceLinks, targetDepth) - 1 : 0;
}

// node_modules/d3-sankey/src/constant.js
function constant(x) {
  return function() {
    return x;
  };
}

// node_modules/d3-sankey/src/sankey.js
function ascendingSourceBreadth(a, b) {
  return ascendingBreadth(a.source, b.source) || a.index - b.index;
}
function ascendingTargetBreadth(a, b) {
  return ascendingBreadth(a.target, b.target) || a.index - b.index;
}
function ascendingBreadth(a, b) {
  return a.y0 - b.y0;
}
function value(d) {
  return d.value;
}
function defaultId(d) {
  return d.index;
}
function defaultNodes(graph) {
  return graph.nodes;
}
function defaultLinks(graph) {
  return graph.links;
}
function find(nodeById, id) {
  const node = nodeById.get(id);
  if (!node)
    throw new Error("missing: " + id);
  return node;
}
function computeLinkBreadths({ nodes }) {
  for (const node of nodes) {
    let y0 = node.y0;
    let y1 = y0;
    for (const link of node.sourceLinks) {
      link.y0 = y0 + link.width / 2;
      y0 += link.width;
    }
    for (const link of node.targetLinks) {
      link.y1 = y1 + link.width / 2;
      y1 += link.width;
    }
  }
}
function Sankey() {
  let x0 = 0, y0 = 0, x1 = 1, y1 = 1;
  let dx = 24;
  let dy = 8, py;
  let id = defaultId;
  let align = justify;
  let sort;
  let linkSort;
  let nodes = defaultNodes;
  let links = defaultLinks;
  let iterations = 6;
  function sankey() {
    const graph = { nodes: nodes.apply(null, arguments), links: links.apply(null, arguments) };
    computeNodeLinks(graph);
    computeNodeValues(graph);
    computeNodeDepths(graph);
    computeNodeHeights(graph);
    computeNodeBreadths(graph);
    computeLinkBreadths(graph);
    return graph;
  }
  sankey.update = function(graph) {
    computeLinkBreadths(graph);
    return graph;
  };
  sankey.nodeId = function(_) {
    return arguments.length ? (id = typeof _ === "function" ? _ : constant(_), sankey) : id;
  };
  sankey.nodeAlign = function(_) {
    return arguments.length ? (align = typeof _ === "function" ? _ : constant(_), sankey) : align;
  };
  sankey.nodeSort = function(_) {
    return arguments.length ? (sort = _, sankey) : sort;
  };
  sankey.nodeWidth = function(_) {
    return arguments.length ? (dx = +_, sankey) : dx;
  };
  sankey.nodePadding = function(_) {
    return arguments.length ? (dy = py = +_, sankey) : dy;
  };
  sankey.nodes = function(_) {
    return arguments.length ? (nodes = typeof _ === "function" ? _ : constant(_), sankey) : nodes;
  };
  sankey.links = function(_) {
    return arguments.length ? (links = typeof _ === "function" ? _ : constant(_), sankey) : links;
  };
  sankey.linkSort = function(_) {
    return arguments.length ? (linkSort = _, sankey) : linkSort;
  };
  sankey.size = function(_) {
    return arguments.length ? (x0 = y0 = 0, x1 = +_[0], y1 = +_[1], sankey) : [x1 - x0, y1 - y0];
  };
  sankey.extent = function(_) {
    return arguments.length ? (x0 = +_[0][0], x1 = +_[1][0], y0 = +_[0][1], y1 = +_[1][1], sankey) : [[x0, y0], [x1, y1]];
  };
  sankey.iterations = function(_) {
    return arguments.length ? (iterations = +_, sankey) : iterations;
  };
  function computeNodeLinks({ nodes: nodes2, links: links2 }) {
    for (const [i, node] of nodes2.entries()) {
      node.index = i;
      node.sourceLinks = [];
      node.targetLinks = [];
    }
    const nodeById = new Map(nodes2.map((d, i) => [id(d, i, nodes2), d]));
    for (const [i, link] of links2.entries()) {
      link.index = i;
      let { source, target } = link;
      if (typeof source !== "object")
        source = link.source = find(nodeById, source);
      if (typeof target !== "object")
        target = link.target = find(nodeById, target);
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    }
    if (linkSort != null) {
      for (const { sourceLinks, targetLinks } of nodes2) {
        sourceLinks.sort(linkSort);
        targetLinks.sort(linkSort);
      }
    }
  }
  function computeNodeValues({ nodes: nodes2 }) {
    for (const node of nodes2) {
      node.value = node.fixedValue === undefined ? Math.max(sum(node.sourceLinks, value), sum(node.targetLinks, value)) : node.fixedValue;
    }
  }
  function computeNodeDepths({ nodes: nodes2 }) {
    const n = nodes2.length;
    let current = new Set(nodes2);
    let next = new Set;
    let x = 0;
    while (current.size) {
      for (const node of current) {
        node.depth = x;
        for (const { target } of node.sourceLinks) {
          next.add(target);
        }
      }
      if (++x > n)
        throw new Error("circular link");
      current = next;
      next = new Set;
    }
  }
  function computeNodeHeights({ nodes: nodes2 }) {
    const n = nodes2.length;
    let current = new Set(nodes2);
    let next = new Set;
    let x = 0;
    while (current.size) {
      for (const node of current) {
        node.height = x;
        for (const { source } of node.targetLinks) {
          next.add(source);
        }
      }
      if (++x > n)
        throw new Error("circular link");
      current = next;
      next = new Set;
    }
  }
  function computeNodeLayers({ nodes: nodes2 }) {
    const x = max(nodes2, (d) => d.depth) + 1;
    const kx = (x1 - x0 - dx) / (x - 1);
    const columns = new Array(x);
    for (const node of nodes2) {
      const i = Math.max(0, Math.min(x - 1, Math.floor(align.call(null, node, x))));
      node.layer = i;
      node.x0 = x0 + i * kx;
      node.x1 = node.x0 + dx;
      if (columns[i])
        columns[i].push(node);
      else
        columns[i] = [node];
    }
    if (sort)
      for (const column of columns) {
        column.sort(sort);
      }
    return columns;
  }
  function initializeNodeBreadths(columns) {
    const ky = min(columns, (c) => (y1 - y0 - (c.length - 1) * py) / sum(c, value));
    for (const nodes2 of columns) {
      let y = y0;
      for (const node of nodes2) {
        node.y0 = y;
        node.y1 = y + node.value * ky;
        y = node.y1 + py;
        for (const link of node.sourceLinks) {
          link.width = link.value * ky;
        }
      }
      y = (y1 - y + py) / (nodes2.length + 1);
      for (let i = 0;i < nodes2.length; ++i) {
        const node = nodes2[i];
        node.y0 += y * (i + 1);
        node.y1 += y * (i + 1);
      }
      reorderLinks(nodes2);
    }
  }
  function computeNodeBreadths(graph) {
    const columns = computeNodeLayers(graph);
    py = Math.min(dy, (y1 - y0) / (max(columns, (c) => c.length) - 1));
    initializeNodeBreadths(columns);
    for (let i = 0;i < iterations; ++i) {
      const alpha = Math.pow(0.99, i);
      const beta = Math.max(1 - alpha, (i + 1) / iterations);
      relaxRightToLeft(columns, alpha, beta);
      relaxLeftToRight(columns, alpha, beta);
    }
  }
  function relaxLeftToRight(columns, alpha, beta) {
    for (let i = 1, n = columns.length;i < n; ++i) {
      const column = columns[i];
      for (const target of column) {
        let y = 0;
        let w = 0;
        for (const { source, value: value2 } of target.targetLinks) {
          let v = value2 * (target.layer - source.layer);
          y += targetTop(source, target) * v;
          w += v;
        }
        if (!(w > 0))
          continue;
        let dy2 = (y / w - target.y0) * alpha;
        target.y0 += dy2;
        target.y1 += dy2;
        reorderNodeLinks(target);
      }
      if (sort === undefined)
        column.sort(ascendingBreadth);
      resolveCollisions(column, beta);
    }
  }
  function relaxRightToLeft(columns, alpha, beta) {
    for (let n = columns.length, i = n - 2;i >= 0; --i) {
      const column = columns[i];
      for (const source of column) {
        let y = 0;
        let w = 0;
        for (const { target, value: value2 } of source.sourceLinks) {
          let v = value2 * (target.layer - source.layer);
          y += sourceTop(source, target) * v;
          w += v;
        }
        if (!(w > 0))
          continue;
        let dy2 = (y / w - source.y0) * alpha;
        source.y0 += dy2;
        source.y1 += dy2;
        reorderNodeLinks(source);
      }
      if (sort === undefined)
        column.sort(ascendingBreadth);
      resolveCollisions(column, beta);
    }
  }
  function resolveCollisions(nodes2, alpha) {
    const i = nodes2.length >> 1;
    const subject = nodes2[i];
    resolveCollisionsBottomToTop(nodes2, subject.y0 - py, i - 1, alpha);
    resolveCollisionsTopToBottom(nodes2, subject.y1 + py, i + 1, alpha);
    resolveCollisionsBottomToTop(nodes2, y1, nodes2.length - 1, alpha);
    resolveCollisionsTopToBottom(nodes2, y0, 0, alpha);
  }
  function resolveCollisionsTopToBottom(nodes2, y, i, alpha) {
    for (;i < nodes2.length; ++i) {
      const node = nodes2[i];
      const dy2 = (y - node.y0) * alpha;
      if (dy2 > 0.000001)
        node.y0 += dy2, node.y1 += dy2;
      y = node.y1 + py;
    }
  }
  function resolveCollisionsBottomToTop(nodes2, y, i, alpha) {
    for (;i >= 0; --i) {
      const node = nodes2[i];
      const dy2 = (node.y1 - y) * alpha;
      if (dy2 > 0.000001)
        node.y0 -= dy2, node.y1 -= dy2;
      y = node.y0 - py;
    }
  }
  function reorderNodeLinks({ sourceLinks, targetLinks }) {
    if (linkSort === undefined) {
      for (const { source: { sourceLinks: sourceLinks2 } } of targetLinks) {
        sourceLinks2.sort(ascendingTargetBreadth);
      }
      for (const { target: { targetLinks: targetLinks2 } } of sourceLinks) {
        targetLinks2.sort(ascendingSourceBreadth);
      }
    }
  }
  function reorderLinks(nodes2) {
    if (linkSort === undefined) {
      for (const { sourceLinks, targetLinks } of nodes2) {
        sourceLinks.sort(ascendingTargetBreadth);
        targetLinks.sort(ascendingSourceBreadth);
      }
    }
  }
  function targetTop(source, target) {
    let y = source.y0 - (source.sourceLinks.length - 1) * py / 2;
    for (const { target: node, width } of source.sourceLinks) {
      if (node === target)
        break;
      y += width + py;
    }
    for (const { source: node, width } of target.targetLinks) {
      if (node === source)
        break;
      y -= width;
    }
    return y;
  }
  function sourceTop(source, target) {
    let y = target.y0 - (target.targetLinks.length - 1) * py / 2;
    for (const { source: node, width } of target.targetLinks) {
      if (node === source)
        break;
      y += width + py;
    }
    for (const { target: node, width } of source.sourceLinks) {
      if (node === target)
        break;
      y -= width;
    }
    return y;
  }
  return sankey;
}
// node_modules/d3-sankey/node_modules/d3-shape/node_modules/d3-path/src/path.js
var pi = Math.PI;
var tau = 2 * pi;
var epsilon = 0.000001;
var tauEpsilon = tau - epsilon;
function Path() {
  this._x0 = this._y0 = this._x1 = this._y1 = null;
  this._ = "";
}
function path() {
  return new Path;
}
Path.prototype = path.prototype = {
  constructor: Path,
  moveTo: function(x, y) {
    this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y);
  },
  closePath: function() {
    if (this._x1 !== null) {
      this._x1 = this._x0, this._y1 = this._y0;
      this._ += "Z";
    }
  },
  lineTo: function(x, y) {
    this._ += "L" + (this._x1 = +x) + "," + (this._y1 = +y);
  },
  quadraticCurveTo: function(x1, y1, x, y) {
    this._ += "Q" + +x1 + "," + +y1 + "," + (this._x1 = +x) + "," + (this._y1 = +y);
  },
  bezierCurveTo: function(x1, y1, x2, y2, x, y) {
    this._ += "C" + +x1 + "," + +y1 + "," + +x2 + "," + +y2 + "," + (this._x1 = +x) + "," + (this._y1 = +y);
  },
  arcTo: function(x1, y1, x2, y2, r) {
    x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
    var x0 = this._x1, y0 = this._y1, x21 = x2 - x1, y21 = y2 - y1, x01 = x0 - x1, y01 = y0 - y1, l01_2 = x01 * x01 + y01 * y01;
    if (r < 0)
      throw new Error("negative radius: " + r);
    if (this._x1 === null) {
      this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
    } else if (!(l01_2 > epsilon))
      ;
    else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
      this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
    } else {
      var x20 = x2 - x0, y20 = y2 - y0, l21_2 = x21 * x21 + y21 * y21, l20_2 = x20 * x20 + y20 * y20, l21 = Math.sqrt(l21_2), l01 = Math.sqrt(l01_2), l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2), t01 = l / l01, t21 = l / l21;
      if (Math.abs(t01 - 1) > epsilon) {
        this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
      }
      this._ += "A" + r + "," + r + ",0,0," + +(y01 * x20 > x01 * y20) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
    }
  },
  arc: function(x, y, r, a0, a1, ccw) {
    x = +x, y = +y, r = +r, ccw = !!ccw;
    var dx = r * Math.cos(a0), dy = r * Math.sin(a0), x0 = x + dx, y0 = y + dy, cw = 1 ^ ccw, da = ccw ? a0 - a1 : a1 - a0;
    if (r < 0)
      throw new Error("negative radius: " + r);
    if (this._x1 === null) {
      this._ += "M" + x0 + "," + y0;
    } else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) {
      this._ += "L" + x0 + "," + y0;
    }
    if (!r)
      return;
    if (da < 0)
      da = da % tau + tau;
    if (da > tauEpsilon) {
      this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x - dx) + "," + (y - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
    } else if (da > epsilon) {
      this._ += "A" + r + "," + r + ",0," + +(da >= pi) + "," + cw + "," + (this._x1 = x + r * Math.cos(a1)) + "," + (this._y1 = y + r * Math.sin(a1));
    }
  },
  rect: function(x, y, w, h) {
    this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y) + "h" + +w + "v" + +h + "h" + -w + "Z";
  },
  toString: function() {
    return this._;
  }
};
var path_default = path;
// node_modules/d3-sankey/node_modules/d3-shape/src/array.js
var slice = Array.prototype.slice;

// node_modules/d3-sankey/node_modules/d3-shape/src/constant.js
function constant_default(x) {
  return function constant2() {
    return x;
  };
}

// node_modules/d3-sankey/node_modules/d3-shape/src/point.js
function x(p) {
  return p[0];
}
function y(p) {
  return p[1];
}

// node_modules/d3-sankey/node_modules/d3-shape/src/link/index.js
function linkSource(d) {
  return d.source;
}
function linkTarget(d) {
  return d.target;
}
function link(curve) {
  var source = linkSource, target = linkTarget, x2 = x, y2 = y, context = null;
  function link2() {
    var buffer, argv = slice.call(arguments), s = source.apply(this, argv), t = target.apply(this, argv);
    if (!context)
      context = buffer = path_default();
    curve(context, +x2.apply(this, (argv[0] = s, argv)), +y2.apply(this, argv), +x2.apply(this, (argv[0] = t, argv)), +y2.apply(this, argv));
    if (buffer)
      return context = null, buffer + "" || null;
  }
  link2.source = function(_) {
    return arguments.length ? (source = _, link2) : source;
  };
  link2.target = function(_) {
    return arguments.length ? (target = _, link2) : target;
  };
  link2.x = function(_) {
    return arguments.length ? (x2 = typeof _ === "function" ? _ : constant_default(+_), link2) : x2;
  };
  link2.y = function(_) {
    return arguments.length ? (y2 = typeof _ === "function" ? _ : constant_default(+_), link2) : y2;
  };
  link2.context = function(_) {
    return arguments.length ? (context = _ == null ? null : _, link2) : context;
  };
  return link2;
}
function curveHorizontal(context, x0, y0, x1, y1) {
  context.moveTo(x0, y0);
  context.bezierCurveTo(x0 = (x0 + x1) / 2, y0, x0, y1, x1, y1);
}
function linkHorizontal() {
  return link(curveHorizontal);
}
// node_modules/d3-sankey/src/sankeyLinkHorizontal.js
function horizontalSource(d) {
  return [d.source.x1, d.y0];
}
function horizontalTarget(d) {
  return [d.target.x0, d.y1];
}
function sankeyLinkHorizontal_default() {
  return linkHorizontal().source(horizontalSource).target(horizontalTarget);
}
// node_modules/mermaid/dist/chunks/mermaid.core/sankeyDiagram-5OEKKPKP.mjs
var parser = function() {
  var o = /* @__PURE__ */ __name(function(k, v, o2, l) {
    for (o2 = o2 || {}, l = k.length;l--; o2[k[l]] = v)
      ;
    return o2;
  }, "o"), $V0 = [1, 9], $V1 = [1, 10], $V2 = [1, 5, 10, 12];
  var parser2 = {
    trace: /* @__PURE__ */ __name(function trace() {}, "trace"),
    yy: {},
    symbols_: { error: 2, start: 3, SANKEY: 4, NEWLINE: 5, csv: 6, opt_eof: 7, record: 8, csv_tail: 9, EOF: 10, "field[source]": 11, COMMA: 12, "field[target]": 13, "field[value]": 14, field: 15, escaped: 16, non_escaped: 17, DQUOTE: 18, ESCAPED_TEXT: 19, NON_ESCAPED_TEXT: 20, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 4: "SANKEY", 5: "NEWLINE", 10: "EOF", 11: "field[source]", 12: "COMMA", 13: "field[target]", 14: "field[value]", 18: "DQUOTE", 19: "ESCAPED_TEXT", 20: "NON_ESCAPED_TEXT" },
    productions_: [0, [3, 4], [6, 2], [9, 2], [9, 0], [7, 1], [7, 0], [8, 5], [15, 1], [15, 1], [16, 3], [17, 1]],
    performAction: /* @__PURE__ */ __name(function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
      var $0 = $$.length - 1;
      switch (yystate) {
        case 7:
          const source = yy.findOrCreateNode($$[$0 - 4].trim().replaceAll('""', '"'));
          const target = yy.findOrCreateNode($$[$0 - 2].trim().replaceAll('""', '"'));
          const value2 = parseFloat($$[$0].trim());
          yy.addLink(source, target, value2);
          break;
        case 8:
        case 9:
        case 11:
          this.$ = $$[$0];
          break;
        case 10:
          this.$ = $$[$0 - 1];
          break;
      }
    }, "anonymous"),
    table: [{ 3: 1, 4: [1, 2] }, { 1: [3] }, { 5: [1, 3] }, { 6: 4, 8: 5, 15: 6, 16: 7, 17: 8, 18: $V0, 20: $V1 }, { 1: [2, 6], 7: 11, 10: [1, 12] }, o($V1, [2, 4], { 9: 13, 5: [1, 14] }), { 12: [1, 15] }, o($V2, [2, 8]), o($V2, [2, 9]), { 19: [1, 16] }, o($V2, [2, 11]), { 1: [2, 1] }, { 1: [2, 5] }, o($V1, [2, 2]), { 6: 17, 8: 5, 15: 6, 16: 7, 17: 8, 18: $V0, 20: $V1 }, { 15: 18, 16: 7, 17: 8, 18: $V0, 20: $V1 }, { 18: [1, 19] }, o($V1, [2, 3]), { 12: [1, 20] }, o($V2, [2, 10]), { 15: 21, 16: 7, 17: 8, 18: $V0, 20: $V1 }, o([1, 5, 10], [2, 7])],
    defaultActions: { 11: [2, 1], 12: [2, 5] },
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
        var token, match, tempMatch, index2;
        if (!this._more) {
          this.yytext = "";
          this.match = "";
        }
        var rules = this._currentRules();
        for (var i = 0;i < rules.length; i++) {
          tempMatch = this._input.match(this.rules[rules[i]]);
          if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
            match = tempMatch;
            index2 = i;
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
          token = this.test_match(match, rules[index2]);
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
      options: { "case-insensitive": true },
      performAction: /* @__PURE__ */ __name(function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {
        var YYSTATE = YY_START;
        switch ($avoiding_name_collisions) {
          case 0:
            this.pushState("csv");
            return 4;
            break;
          case 1:
            this.pushState("csv");
            return 4;
            break;
          case 2:
            return 10;
            break;
          case 3:
            return 5;
            break;
          case 4:
            return 12;
            break;
          case 5:
            this.pushState("escaped_text");
            return 18;
            break;
          case 6:
            return 20;
            break;
          case 7:
            this.popState("escaped_text");
            return 18;
            break;
          case 8:
            return 19;
            break;
        }
      }, "anonymous"),
      rules: [/^(?:sankey-beta\b)/i, /^(?:sankey\b)/i, /^(?:$)/i, /^(?:((\u000D\u000A)|(\u000A)))/i, /^(?:(\u002C))/i, /^(?:(\u0022))/i, /^(?:([\u0020-\u0021\u0023-\u002B\u002D-\u007E])*)/i, /^(?:(\u0022)(?!(\u0022)))/i, /^(?:(([\u0020-\u0021\u0023-\u002B\u002D-\u007E])|(\u002C)|(\u000D)|(\u000A)|(\u0022)(\u0022))*)/i],
      conditions: { csv: { rules: [2, 3, 4, 5, 6, 7, 8], inclusive: false }, escaped_text: { rules: [7, 8], inclusive: false }, INITIAL: { rules: [0, 1, 2, 3, 4, 5, 6, 7, 8], inclusive: true } }
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
var sankey_default = parser;
var links = [];
var nodes = [];
var nodesMap = /* @__PURE__ */ new Map;
var clear2 = /* @__PURE__ */ __name(() => {
  links = [];
  nodes = [];
  nodesMap = /* @__PURE__ */ new Map;
  clear();
}, "clear");
var SankeyLink = class {
  constructor(source, target, value2 = 0) {
    this.source = source;
    this.target = target;
    this.value = value2;
  }
  static {
    __name(this, "SankeyLink");
  }
};
var addLink = /* @__PURE__ */ __name((source, target, value2) => {
  links.push(new SankeyLink(source, target, value2));
}, "addLink");
var SankeyNode = class {
  constructor(ID) {
    this.ID = ID;
  }
  static {
    __name(this, "SankeyNode");
  }
};
var findOrCreateNode = /* @__PURE__ */ __name((ID) => {
  ID = common_default.sanitizeText(ID, getConfig2());
  let node = nodesMap.get(ID);
  if (node === undefined) {
    node = new SankeyNode(ID);
    nodesMap.set(ID, node);
    nodes.push(node);
  }
  return node;
}, "findOrCreateNode");
var getNodes = /* @__PURE__ */ __name(() => nodes, "getNodes");
var getLinks = /* @__PURE__ */ __name(() => links, "getLinks");
var getGraph = /* @__PURE__ */ __name(() => ({
  nodes: nodes.map((node) => ({ id: node.ID })),
  links: links.map((link2) => ({
    source: link2.source.ID,
    target: link2.target.ID,
    value: link2.value
  }))
}), "getGraph");
var sankeyDB_default = {
  nodesMap,
  getConfig: /* @__PURE__ */ __name(() => getConfig2().sankey, "getConfig"),
  getNodes,
  getLinks,
  getGraph,
  addLink,
  findOrCreateNode,
  getAccTitle,
  setAccTitle,
  getAccDescription,
  setAccDescription,
  getDiagramTitle,
  setDiagramTitle,
  clear: clear2
};
var Uid = class _Uid {
  static {
    __name(this, "Uid");
  }
  static {
    this.count = 0;
  }
  static next(name) {
    return new _Uid(name + ++_Uid.count);
  }
  constructor(id) {
    this.id = id;
    this.href = `#${id}`;
  }
  toString() {
    return "url(" + this.href + ")";
  }
};
var alignmentsMap = {
  left,
  right,
  center,
  justify
};
var findCentralNodeLayer = /* @__PURE__ */ __name((nodes2) => {
  let maxValue = 0;
  let centralLayer = 0;
  for (const node of nodes2) {
    const value2 = node.value ?? 0;
    if (value2 > maxValue) {
      maxValue = value2;
      centralLayer = node.layer ?? 0;
    }
  }
  return centralLayer;
}, "findCentralNodeLayer");
var draw = /* @__PURE__ */ __name(function(text, id, _version, diagObj) {
  const { securityLevel, sankey: conf } = getConfig2();
  const defaultSankeyConfig = defaultConfig2.sankey;
  let sandboxElement;
  if (securityLevel === "sandbox") {
    sandboxElement = select_default("#i" + id);
  }
  const root = securityLevel === "sandbox" ? select_default(sandboxElement.nodes()[0].contentDocument.body) : select_default("body");
  const svg = securityLevel === "sandbox" ? root.select(`[id="${id}"]`) : select_default(`[id="${id}"]`);
  const width = conf?.width ?? defaultSankeyConfig.width;
  const height = conf?.height ?? defaultSankeyConfig.width;
  const useMaxWidth = conf?.useMaxWidth ?? defaultSankeyConfig.useMaxWidth;
  const nodeAlignment = conf?.nodeAlignment ?? defaultSankeyConfig.nodeAlignment;
  const prefix = conf?.prefix ?? defaultSankeyConfig.prefix;
  const suffix = conf?.suffix ?? defaultSankeyConfig.suffix;
  const showValues = conf?.showValues ?? defaultSankeyConfig.showValues;
  const nodeWidth = conf?.nodeWidth ?? defaultSankeyConfig.nodeWidth ?? 10;
  const nodePadding = conf?.nodePadding ?? defaultSankeyConfig.nodePadding ?? 12;
  const labelStyle = conf?.labelStyle ?? defaultSankeyConfig.labelStyle ?? "legacy";
  const nodeColors = conf?.nodeColors ?? {};
  const graph = diagObj.db.getGraph();
  const nodeAlign = alignmentsMap[nodeAlignment];
  const sankey = Sankey().nodeId((d) => d.id).nodeWidth(nodeWidth).nodePadding(nodePadding + (showValues ? 15 : 0)).nodeAlign(nodeAlign).extent([
    [0, 0],
    [width, height]
  ]);
  sankey(graph);
  const centralNodeLayer = findCentralNodeLayer(graph.nodes);
  const colorScheme = ordinal(Tableau10_default);
  const getNodeColor = /* @__PURE__ */ __name((nodeId) => {
    return nodeColors[nodeId] ?? colorScheme(nodeId);
  }, "getNodeColor");
  svg.append("g").attr("class", "nodes").selectAll(".node").data(graph.nodes).join("g").attr("class", "node").attr("id", (d) => (d.uid = Uid.next("node-")).id).attr("transform", function(d) {
    return "translate(" + d.x0 + "," + d.y0 + ")";
  }).attr("x", (d) => d.x0).attr("y", (d) => d.y0).append("rect").attr("height", (d) => {
    return d.y1 - d.y0;
  }).attr("width", (d) => d.x1 - d.x0).attr("fill", (d) => getNodeColor(d.id));
  const getText = /* @__PURE__ */ __name(({ id: id2, value: value2 }) => {
    if (!showValues) {
      return id2;
    }
    return `${id2}
${prefix}${Math.round(value2 * 100) / 100}${suffix}`;
  }, "getText");
  const getLabelPosition = /* @__PURE__ */ __name((d) => {
    if (labelStyle === "outlined") {
      const nodeLayer = d.layer ?? 0;
      if (nodeLayer < centralNodeLayer) {
        return { x: d.x0 - 6, anchor: "end" };
      }
      return { x: d.x1 + 6, anchor: "start" };
    }
    if (d.x0 < width / 2) {
      return { x: d.x1 + 6, anchor: "start" };
    }
    return { x: d.x0 - 6, anchor: "end" };
  }, "getLabelPosition");
  const labelsGroup = svg.append("g").attr("class", "node-labels").attr("font-size", 14);
  const appendLabel = /* @__PURE__ */ __name((className) => labelsGroup.selectAll(className ? `.${className}` : "text").data(graph.nodes).join("text").attr("class", className ?? null).attr("x", (d) => getLabelPosition(d).x).attr("y", (d) => (d.y1 + d.y0) / 2).attr("dy", `${showValues ? "0" : "0.35"}em`).attr("text-anchor", (d) => getLabelPosition(d).anchor).text(getText), "appendLabel");
  if (labelStyle === "outlined") {
    appendLabel("sankey-label-bg");
    appendLabel("sankey-label-fg");
  } else {
    appendLabel();
  }
  const link2 = svg.append("g").attr("class", "links").attr("fill", "none").attr("stroke-opacity", 0.5).selectAll(".link").data(graph.links).join("g").attr("class", "link").style("mix-blend-mode", "multiply");
  const linkColor = conf?.linkColor ?? "gradient";
  if (linkColor === "gradient") {
    const gradient = link2.append("linearGradient").attr("id", (d) => (d.uid = Uid.next("linearGradient-")).id).attr("gradientUnits", "userSpaceOnUse").attr("x1", (d) => d.source.x1).attr("x2", (d) => d.target.x0);
    gradient.append("stop").attr("offset", "0%").attr("stop-color", (d) => getNodeColor(d.source.id));
    gradient.append("stop").attr("offset", "100%").attr("stop-color", (d) => getNodeColor(d.target.id));
  }
  let coloring;
  switch (linkColor) {
    case "gradient":
      coloring = /* @__PURE__ */ __name((d) => d.uid, "coloring");
      break;
    case "source":
      coloring = /* @__PURE__ */ __name((d) => getNodeColor(d.source.id), "coloring");
      break;
    case "target":
      coloring = /* @__PURE__ */ __name((d) => getNodeColor(d.target.id), "coloring");
      break;
    default:
      coloring = linkColor;
  }
  link2.append("path").attr("d", sankeyLinkHorizontal_default()).attr("stroke", coloring).attr("stroke-width", (d) => Math.max(1, d.width));
  setupGraphViewbox(undefined, svg, 0, useMaxWidth);
}, "draw");
var sankeyRenderer_default = {
  draw
};
var prepareTextForParsing = /* @__PURE__ */ __name((text) => {
  const textToParse = text.replaceAll(/^[^\S\n\r]+|[^\S\n\r]+$/g, "").replaceAll(/([\n\r])+/g, `
`).trim();
  return textToParse;
}, "prepareTextForParsing");
var getStyles = /* @__PURE__ */ __name((options) => `.label {
    font-family: ${options.fontFamily};
  }

  .node-labels {
    font-family: ${options.fontFamily};
  }

  /* Outlined label style - background stroke for better readability */
  .sankey-label-bg {
    stroke: ${options.mainBkg || options.background || "#fff"};
    stroke-width: 4px;
    stroke-linejoin: round;
    paint-order: stroke;
  }

  /* Foreground label text */
  .sankey-label-fg {
    fill: ${options.textColor};
  }

  /* Node styling */
  .node rect {
    shape-rendering: crispEdges;
  }

  /* Link styling */
  .link {
    fill: none;
    stroke-opacity: 0.5;
    mix-blend-mode: multiply;
  }
`, "getStyles");
var styles_default = getStyles;
var originalParse = sankey_default.parse.bind(sankey_default);
sankey_default.parse = (text) => originalParse(prepareTextForParsing(text));
var diagram = {
  styles: styles_default,
  parser: sankey_default,
  db: sankeyDB_default,
  renderer: sankeyRenderer_default
};
export {
  diagram
};

//# debugId=51450E24DCD5B20864756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNhbmtleS9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL21heC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2Fua2V5L25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvbWluLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zYW5rZXkvbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9zdW0uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNhbmtleS9zcmMvYWxpZ24uanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNhbmtleS9zcmMvY29uc3RhbnQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNhbmtleS9zcmMvc2Fua2V5LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zYW5rZXkvbm9kZV9tb2R1bGVzL2QzLXNoYXBlL25vZGVfbW9kdWxlcy9kMy1wYXRoL3NyYy9wYXRoLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zYW5rZXkvbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9hcnJheS5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2Fua2V5L25vZGVfbW9kdWxlcy9kMy1zaGFwZS9zcmMvY29uc3RhbnQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNhbmtleS9ub2RlX21vZHVsZXMvZDMtc2hhcGUvc3JjL3BvaW50LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zYW5rZXkvbm9kZV9tb2R1bGVzL2QzLXNoYXBlL3NyYy9saW5rL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zYW5rZXkvc3JjL3NhbmtleUxpbmtIb3Jpem9udGFsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9tZXJtYWlkL2Rpc3QvY2h1bmtzL21lcm1haWQuY29yZS9zYW5rZXlEaWFncmFtLTVPRUtLUEtQLm1qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtYXgodmFsdWVzLCB2YWx1ZW9mKSB7XG4gIGxldCBtYXg7XG4gIGlmICh2YWx1ZW9mID09PSB1bmRlZmluZWQpIHtcbiAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHZhbHVlICE9IG51bGxcbiAgICAgICAgICAmJiAobWF4IDwgdmFsdWUgfHwgKG1heCA9PT0gdW5kZWZpbmVkICYmIHZhbHVlID49IHZhbHVlKSkpIHtcbiAgICAgICAgbWF4ID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxldCBpbmRleCA9IC0xO1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKCh2YWx1ZSA9IHZhbHVlb2YodmFsdWUsICsraW5kZXgsIHZhbHVlcykpICE9IG51bGxcbiAgICAgICAgICAmJiAobWF4IDwgdmFsdWUgfHwgKG1heCA9PT0gdW5kZWZpbmVkICYmIHZhbHVlID49IHZhbHVlKSkpIHtcbiAgICAgICAgbWF4ID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBtYXg7XG59XG4iLAogICAgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1pbih2YWx1ZXMsIHZhbHVlb2YpIHtcbiAgbGV0IG1pbjtcbiAgaWYgKHZhbHVlb2YgPT09IHVuZGVmaW5lZCkge1xuICAgIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICBpZiAodmFsdWUgIT0gbnVsbFxuICAgICAgICAgICYmIChtaW4gPiB2YWx1ZSB8fCAobWluID09PSB1bmRlZmluZWQgJiYgdmFsdWUgPj0gdmFsdWUpKSkge1xuICAgICAgICBtaW4gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbGV0IGluZGV4ID0gLTE7XG4gICAgZm9yIChsZXQgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICBpZiAoKHZhbHVlID0gdmFsdWVvZih2YWx1ZSwgKytpbmRleCwgdmFsdWVzKSkgIT0gbnVsbFxuICAgICAgICAgICYmIChtaW4gPiB2YWx1ZSB8fCAobWluID09PSB1bmRlZmluZWQgJiYgdmFsdWUgPj0gdmFsdWUpKSkge1xuICAgICAgICBtaW4gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG1pbjtcbn1cbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3VtKHZhbHVlcywgdmFsdWVvZikge1xuICBsZXQgc3VtID0gMDtcbiAgaWYgKHZhbHVlb2YgPT09IHVuZGVmaW5lZCkge1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHZhbHVlID0gK3ZhbHVlKSB7XG4gICAgICAgIHN1bSArPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbGV0IGluZGV4ID0gLTE7XG4gICAgZm9yIChsZXQgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICBpZiAodmFsdWUgPSArdmFsdWVvZih2YWx1ZSwgKytpbmRleCwgdmFsdWVzKSkge1xuICAgICAgICBzdW0gKz0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBzdW07XG59XG4iLAogICAgImltcG9ydCB7bWlufSBmcm9tIFwiZDMtYXJyYXlcIjtcblxuZnVuY3Rpb24gdGFyZ2V0RGVwdGgoZCkge1xuICByZXR1cm4gZC50YXJnZXQuZGVwdGg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsZWZ0KG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUuZGVwdGg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByaWdodChub2RlLCBuKSB7XG4gIHJldHVybiBuIC0gMSAtIG5vZGUuaGVpZ2h0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24ganVzdGlmeShub2RlLCBuKSB7XG4gIHJldHVybiBub2RlLnNvdXJjZUxpbmtzLmxlbmd0aCA/IG5vZGUuZGVwdGggOiBuIC0gMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNlbnRlcihub2RlKSB7XG4gIHJldHVybiBub2RlLnRhcmdldExpbmtzLmxlbmd0aCA/IG5vZGUuZGVwdGhcbiAgICAgIDogbm9kZS5zb3VyY2VMaW5rcy5sZW5ndGggPyBtaW4obm9kZS5zb3VyY2VMaW5rcywgdGFyZ2V0RGVwdGgpIC0gMVxuICAgICAgOiAwO1xufVxuIiwKICAgICJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb25zdGFudCh4KSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4geDtcbiAgfTtcbn1cbiIsCiAgICAiaW1wb3J0IHttYXgsIG1pbiwgc3VtfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7anVzdGlmeX0gZnJvbSBcIi4vYWxpZ24uanNcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuXG5mdW5jdGlvbiBhc2NlbmRpbmdTb3VyY2VCcmVhZHRoKGEsIGIpIHtcbiAgcmV0dXJuIGFzY2VuZGluZ0JyZWFkdGgoYS5zb3VyY2UsIGIuc291cmNlKSB8fCBhLmluZGV4IC0gYi5pbmRleDtcbn1cblxuZnVuY3Rpb24gYXNjZW5kaW5nVGFyZ2V0QnJlYWR0aChhLCBiKSB7XG4gIHJldHVybiBhc2NlbmRpbmdCcmVhZHRoKGEudGFyZ2V0LCBiLnRhcmdldCkgfHwgYS5pbmRleCAtIGIuaW5kZXg7XG59XG5cbmZ1bmN0aW9uIGFzY2VuZGluZ0JyZWFkdGgoYSwgYikge1xuICByZXR1cm4gYS55MCAtIGIueTA7XG59XG5cbmZ1bmN0aW9uIHZhbHVlKGQpIHtcbiAgcmV0dXJuIGQudmFsdWU7XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRJZChkKSB7XG4gIHJldHVybiBkLmluZGV4O1xufVxuXG5mdW5jdGlvbiBkZWZhdWx0Tm9kZXMoZ3JhcGgpIHtcbiAgcmV0dXJuIGdyYXBoLm5vZGVzO1xufVxuXG5mdW5jdGlvbiBkZWZhdWx0TGlua3MoZ3JhcGgpIHtcbiAgcmV0dXJuIGdyYXBoLmxpbmtzO1xufVxuXG5mdW5jdGlvbiBmaW5kKG5vZGVCeUlkLCBpZCkge1xuICBjb25zdCBub2RlID0gbm9kZUJ5SWQuZ2V0KGlkKTtcbiAgaWYgKCFub2RlKSB0aHJvdyBuZXcgRXJyb3IoXCJtaXNzaW5nOiBcIiArIGlkKTtcbiAgcmV0dXJuIG5vZGU7XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVMaW5rQnJlYWR0aHMoe25vZGVzfSkge1xuICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICBsZXQgeTAgPSBub2RlLnkwO1xuICAgIGxldCB5MSA9IHkwO1xuICAgIGZvciAoY29uc3QgbGluayBvZiBub2RlLnNvdXJjZUxpbmtzKSB7XG4gICAgICBsaW5rLnkwID0geTAgKyBsaW5rLndpZHRoIC8gMjtcbiAgICAgIHkwICs9IGxpbmsud2lkdGg7XG4gICAgfVxuICAgIGZvciAoY29uc3QgbGluayBvZiBub2RlLnRhcmdldExpbmtzKSB7XG4gICAgICBsaW5rLnkxID0geTEgKyBsaW5rLndpZHRoIC8gMjtcbiAgICAgIHkxICs9IGxpbmsud2lkdGg7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFNhbmtleSgpIHtcbiAgbGV0IHgwID0gMCwgeTAgPSAwLCB4MSA9IDEsIHkxID0gMTsgLy8gZXh0ZW50XG4gIGxldCBkeCA9IDI0OyAvLyBub2RlV2lkdGhcbiAgbGV0IGR5ID0gOCwgcHk7IC8vIG5vZGVQYWRkaW5nXG4gIGxldCBpZCA9IGRlZmF1bHRJZDtcbiAgbGV0IGFsaWduID0ganVzdGlmeTtcbiAgbGV0IHNvcnQ7XG4gIGxldCBsaW5rU29ydDtcbiAgbGV0IG5vZGVzID0gZGVmYXVsdE5vZGVzO1xuICBsZXQgbGlua3MgPSBkZWZhdWx0TGlua3M7XG4gIGxldCBpdGVyYXRpb25zID0gNjtcblxuICBmdW5jdGlvbiBzYW5rZXkoKSB7XG4gICAgY29uc3QgZ3JhcGggPSB7bm9kZXM6IG5vZGVzLmFwcGx5KG51bGwsIGFyZ3VtZW50cyksIGxpbmtzOiBsaW5rcy5hcHBseShudWxsLCBhcmd1bWVudHMpfTtcbiAgICBjb21wdXRlTm9kZUxpbmtzKGdyYXBoKTtcbiAgICBjb21wdXRlTm9kZVZhbHVlcyhncmFwaCk7XG4gICAgY29tcHV0ZU5vZGVEZXB0aHMoZ3JhcGgpO1xuICAgIGNvbXB1dGVOb2RlSGVpZ2h0cyhncmFwaCk7XG4gICAgY29tcHV0ZU5vZGVCcmVhZHRocyhncmFwaCk7XG4gICAgY29tcHV0ZUxpbmtCcmVhZHRocyhncmFwaCk7XG4gICAgcmV0dXJuIGdyYXBoO1xuICB9XG5cbiAgc2Fua2V5LnVwZGF0ZSA9IGZ1bmN0aW9uKGdyYXBoKSB7XG4gICAgY29tcHV0ZUxpbmtCcmVhZHRocyhncmFwaCk7XG4gICAgcmV0dXJuIGdyYXBoO1xuICB9O1xuXG4gIHNhbmtleS5ub2RlSWQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoaWQgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KF8pLCBzYW5rZXkpIDogaWQ7XG4gIH07XG5cbiAgc2Fua2V5Lm5vZGVBbGlnbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChhbGlnbiA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoXyksIHNhbmtleSkgOiBhbGlnbjtcbiAgfTtcblxuICBzYW5rZXkubm9kZVNvcnQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoc29ydCA9IF8sIHNhbmtleSkgOiBzb3J0O1xuICB9O1xuXG4gIHNhbmtleS5ub2RlV2lkdGggPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZHggPSArXywgc2Fua2V5KSA6IGR4O1xuICB9O1xuXG4gIHNhbmtleS5ub2RlUGFkZGluZyA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChkeSA9IHB5ID0gK18sIHNhbmtleSkgOiBkeTtcbiAgfTtcblxuICBzYW5rZXkubm9kZXMgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAobm9kZXMgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KF8pLCBzYW5rZXkpIDogbm9kZXM7XG4gIH07XG5cbiAgc2Fua2V5LmxpbmtzID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGxpbmtzID0gdHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIiA/IF8gOiBjb25zdGFudChfKSwgc2Fua2V5KSA6IGxpbmtzO1xuICB9O1xuXG4gIHNhbmtleS5saW5rU29ydCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChsaW5rU29ydCA9IF8sIHNhbmtleSkgOiBsaW5rU29ydDtcbiAgfTtcblxuICBzYW5rZXkuc2l6ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh4MCA9IHkwID0gMCwgeDEgPSArX1swXSwgeTEgPSArX1sxXSwgc2Fua2V5KSA6IFt4MSAtIHgwLCB5MSAtIHkwXTtcbiAgfTtcblxuICBzYW5rZXkuZXh0ZW50ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHgwID0gK19bMF1bMF0sIHgxID0gK19bMV1bMF0sIHkwID0gK19bMF1bMV0sIHkxID0gK19bMV1bMV0sIHNhbmtleSkgOiBbW3gwLCB5MF0sIFt4MSwgeTFdXTtcbiAgfTtcblxuICBzYW5rZXkuaXRlcmF0aW9ucyA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChpdGVyYXRpb25zID0gK18sIHNhbmtleSkgOiBpdGVyYXRpb25zO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGNvbXB1dGVOb2RlTGlua3Moe25vZGVzLCBsaW5rc30pIHtcbiAgICBmb3IgKGNvbnN0IFtpLCBub2RlXSBvZiBub2Rlcy5lbnRyaWVzKCkpIHtcbiAgICAgIG5vZGUuaW5kZXggPSBpO1xuICAgICAgbm9kZS5zb3VyY2VMaW5rcyA9IFtdO1xuICAgICAgbm9kZS50YXJnZXRMaW5rcyA9IFtdO1xuICAgIH1cbiAgICBjb25zdCBub2RlQnlJZCA9IG5ldyBNYXAobm9kZXMubWFwKChkLCBpKSA9PiBbaWQoZCwgaSwgbm9kZXMpLCBkXSkpO1xuICAgIGZvciAoY29uc3QgW2ksIGxpbmtdIG9mIGxpbmtzLmVudHJpZXMoKSkge1xuICAgICAgbGluay5pbmRleCA9IGk7XG4gICAgICBsZXQge3NvdXJjZSwgdGFyZ2V0fSA9IGxpbms7XG4gICAgICBpZiAodHlwZW9mIHNvdXJjZSAhPT0gXCJvYmplY3RcIikgc291cmNlID0gbGluay5zb3VyY2UgPSBmaW5kKG5vZGVCeUlkLCBzb3VyY2UpO1xuICAgICAgaWYgKHR5cGVvZiB0YXJnZXQgIT09IFwib2JqZWN0XCIpIHRhcmdldCA9IGxpbmsudGFyZ2V0ID0gZmluZChub2RlQnlJZCwgdGFyZ2V0KTtcbiAgICAgIHNvdXJjZS5zb3VyY2VMaW5rcy5wdXNoKGxpbmspO1xuICAgICAgdGFyZ2V0LnRhcmdldExpbmtzLnB1c2gobGluayk7XG4gICAgfVxuICAgIGlmIChsaW5rU29ydCAhPSBudWxsKSB7XG4gICAgICBmb3IgKGNvbnN0IHtzb3VyY2VMaW5rcywgdGFyZ2V0TGlua3N9IG9mIG5vZGVzKSB7XG4gICAgICAgIHNvdXJjZUxpbmtzLnNvcnQobGlua1NvcnQpO1xuICAgICAgICB0YXJnZXRMaW5rcy5zb3J0KGxpbmtTb3J0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjb21wdXRlTm9kZVZhbHVlcyh7bm9kZXN9KSB7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgICBub2RlLnZhbHVlID0gbm9kZS5maXhlZFZhbHVlID09PSB1bmRlZmluZWRcbiAgICAgICAgICA/IE1hdGgubWF4KHN1bShub2RlLnNvdXJjZUxpbmtzLCB2YWx1ZSksIHN1bShub2RlLnRhcmdldExpbmtzLCB2YWx1ZSkpXG4gICAgICAgICAgOiBub2RlLmZpeGVkVmFsdWU7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY29tcHV0ZU5vZGVEZXB0aHMoe25vZGVzfSkge1xuICAgIGNvbnN0IG4gPSBub2Rlcy5sZW5ndGg7XG4gICAgbGV0IGN1cnJlbnQgPSBuZXcgU2V0KG5vZGVzKTtcbiAgICBsZXQgbmV4dCA9IG5ldyBTZXQ7XG4gICAgbGV0IHggPSAwO1xuICAgIHdoaWxlIChjdXJyZW50LnNpemUpIHtcbiAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiBjdXJyZW50KSB7XG4gICAgICAgIG5vZGUuZGVwdGggPSB4O1xuICAgICAgICBmb3IgKGNvbnN0IHt0YXJnZXR9IG9mIG5vZGUuc291cmNlTGlua3MpIHtcbiAgICAgICAgICBuZXh0LmFkZCh0YXJnZXQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoKyt4ID4gbikgdGhyb3cgbmV3IEVycm9yKFwiY2lyY3VsYXIgbGlua1wiKTtcbiAgICAgIGN1cnJlbnQgPSBuZXh0O1xuICAgICAgbmV4dCA9IG5ldyBTZXQ7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY29tcHV0ZU5vZGVIZWlnaHRzKHtub2Rlc30pIHtcbiAgICBjb25zdCBuID0gbm9kZXMubGVuZ3RoO1xuICAgIGxldCBjdXJyZW50ID0gbmV3IFNldChub2Rlcyk7XG4gICAgbGV0IG5leHQgPSBuZXcgU2V0O1xuICAgIGxldCB4ID0gMDtcbiAgICB3aGlsZSAoY3VycmVudC5zaXplKSB7XG4gICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgY3VycmVudCkge1xuICAgICAgICBub2RlLmhlaWdodCA9IHg7XG4gICAgICAgIGZvciAoY29uc3Qge3NvdXJjZX0gb2Ygbm9kZS50YXJnZXRMaW5rcykge1xuICAgICAgICAgIG5leHQuYWRkKHNvdXJjZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICgrK3ggPiBuKSB0aHJvdyBuZXcgRXJyb3IoXCJjaXJjdWxhciBsaW5rXCIpO1xuICAgICAgY3VycmVudCA9IG5leHQ7XG4gICAgICBuZXh0ID0gbmV3IFNldDtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjb21wdXRlTm9kZUxheWVycyh7bm9kZXN9KSB7XG4gICAgY29uc3QgeCA9IG1heChub2RlcywgZCA9PiBkLmRlcHRoKSArIDE7XG4gICAgY29uc3Qga3ggPSAoeDEgLSB4MCAtIGR4KSAvICh4IC0gMSk7XG4gICAgY29uc3QgY29sdW1ucyA9IG5ldyBBcnJheSh4KTtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgIGNvbnN0IGkgPSBNYXRoLm1heCgwLCBNYXRoLm1pbih4IC0gMSwgTWF0aC5mbG9vcihhbGlnbi5jYWxsKG51bGwsIG5vZGUsIHgpKSkpO1xuICAgICAgbm9kZS5sYXllciA9IGk7XG4gICAgICBub2RlLngwID0geDAgKyBpICoga3g7XG4gICAgICBub2RlLngxID0gbm9kZS54MCArIGR4O1xuICAgICAgaWYgKGNvbHVtbnNbaV0pIGNvbHVtbnNbaV0ucHVzaChub2RlKTtcbiAgICAgIGVsc2UgY29sdW1uc1tpXSA9IFtub2RlXTtcbiAgICB9XG4gICAgaWYgKHNvcnQpIGZvciAoY29uc3QgY29sdW1uIG9mIGNvbHVtbnMpIHtcbiAgICAgIGNvbHVtbi5zb3J0KHNvcnQpO1xuICAgIH1cbiAgICByZXR1cm4gY29sdW1ucztcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRpYWxpemVOb2RlQnJlYWR0aHMoY29sdW1ucykge1xuICAgIGNvbnN0IGt5ID0gbWluKGNvbHVtbnMsIGMgPT4gKHkxIC0geTAgLSAoYy5sZW5ndGggLSAxKSAqIHB5KSAvIHN1bShjLCB2YWx1ZSkpO1xuICAgIGZvciAoY29uc3Qgbm9kZXMgb2YgY29sdW1ucykge1xuICAgICAgbGV0IHkgPSB5MDtcbiAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgICAgICBub2RlLnkwID0geTtcbiAgICAgICAgbm9kZS55MSA9IHkgKyBub2RlLnZhbHVlICoga3k7XG4gICAgICAgIHkgPSBub2RlLnkxICsgcHk7XG4gICAgICAgIGZvciAoY29uc3QgbGluayBvZiBub2RlLnNvdXJjZUxpbmtzKSB7XG4gICAgICAgICAgbGluay53aWR0aCA9IGxpbmsudmFsdWUgKiBreTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgeSA9ICh5MSAtIHkgKyBweSkgLyAobm9kZXMubGVuZ3RoICsgMSk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgICAgbm9kZS55MCArPSB5ICogKGkgKyAxKTtcbiAgICAgICAgbm9kZS55MSArPSB5ICogKGkgKyAxKTtcbiAgICAgIH1cbiAgICAgIHJlb3JkZXJMaW5rcyhub2Rlcyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY29tcHV0ZU5vZGVCcmVhZHRocyhncmFwaCkge1xuICAgIGNvbnN0IGNvbHVtbnMgPSBjb21wdXRlTm9kZUxheWVycyhncmFwaCk7XG4gICAgcHkgPSBNYXRoLm1pbihkeSwgKHkxIC0geTApIC8gKG1heChjb2x1bW5zLCBjID0+IGMubGVuZ3RoKSAtIDEpKTtcbiAgICBpbml0aWFsaXplTm9kZUJyZWFkdGhzKGNvbHVtbnMpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlcmF0aW9uczsgKytpKSB7XG4gICAgICBjb25zdCBhbHBoYSA9IE1hdGgucG93KDAuOTksIGkpO1xuICAgICAgY29uc3QgYmV0YSA9IE1hdGgubWF4KDEgLSBhbHBoYSwgKGkgKyAxKSAvIGl0ZXJhdGlvbnMpO1xuICAgICAgcmVsYXhSaWdodFRvTGVmdChjb2x1bW5zLCBhbHBoYSwgYmV0YSk7XG4gICAgICByZWxheExlZnRUb1JpZ2h0KGNvbHVtbnMsIGFscGhhLCBiZXRhKTtcbiAgICB9XG4gIH1cblxuICAvLyBSZXBvc2l0aW9uIGVhY2ggbm9kZSBiYXNlZCBvbiBpdHMgaW5jb21pbmcgKHRhcmdldCkgbGlua3MuXG4gIGZ1bmN0aW9uIHJlbGF4TGVmdFRvUmlnaHQoY29sdW1ucywgYWxwaGEsIGJldGEpIHtcbiAgICBmb3IgKGxldCBpID0gMSwgbiA9IGNvbHVtbnMubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICBjb25zdCBjb2x1bW4gPSBjb2x1bW5zW2ldO1xuICAgICAgZm9yIChjb25zdCB0YXJnZXQgb2YgY29sdW1uKSB7XG4gICAgICAgIGxldCB5ID0gMDtcbiAgICAgICAgbGV0IHcgPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IHtzb3VyY2UsIHZhbHVlfSBvZiB0YXJnZXQudGFyZ2V0TGlua3MpIHtcbiAgICAgICAgICBsZXQgdiA9IHZhbHVlICogKHRhcmdldC5sYXllciAtIHNvdXJjZS5sYXllcik7XG4gICAgICAgICAgeSArPSB0YXJnZXRUb3Aoc291cmNlLCB0YXJnZXQpICogdjtcbiAgICAgICAgICB3ICs9IHY7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCEodyA+IDApKSBjb250aW51ZTtcbiAgICAgICAgbGV0IGR5ID0gKHkgLyB3IC0gdGFyZ2V0LnkwKSAqIGFscGhhO1xuICAgICAgICB0YXJnZXQueTAgKz0gZHk7XG4gICAgICAgIHRhcmdldC55MSArPSBkeTtcbiAgICAgICAgcmVvcmRlck5vZGVMaW5rcyh0YXJnZXQpO1xuICAgICAgfVxuICAgICAgaWYgKHNvcnQgPT09IHVuZGVmaW5lZCkgY29sdW1uLnNvcnQoYXNjZW5kaW5nQnJlYWR0aCk7XG4gICAgICByZXNvbHZlQ29sbGlzaW9ucyhjb2x1bW4sIGJldGEpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJlcG9zaXRpb24gZWFjaCBub2RlIGJhc2VkIG9uIGl0cyBvdXRnb2luZyAoc291cmNlKSBsaW5rcy5cbiAgZnVuY3Rpb24gcmVsYXhSaWdodFRvTGVmdChjb2x1bW5zLCBhbHBoYSwgYmV0YSkge1xuICAgIGZvciAobGV0IG4gPSBjb2x1bW5zLmxlbmd0aCwgaSA9IG4gLSAyOyBpID49IDA7IC0taSkge1xuICAgICAgY29uc3QgY29sdW1uID0gY29sdW1uc1tpXTtcbiAgICAgIGZvciAoY29uc3Qgc291cmNlIG9mIGNvbHVtbikge1xuICAgICAgICBsZXQgeSA9IDA7XG4gICAgICAgIGxldCB3ID0gMDtcbiAgICAgICAgZm9yIChjb25zdCB7dGFyZ2V0LCB2YWx1ZX0gb2Ygc291cmNlLnNvdXJjZUxpbmtzKSB7XG4gICAgICAgICAgbGV0IHYgPSB2YWx1ZSAqICh0YXJnZXQubGF5ZXIgLSBzb3VyY2UubGF5ZXIpO1xuICAgICAgICAgIHkgKz0gc291cmNlVG9wKHNvdXJjZSwgdGFyZ2V0KSAqIHY7XG4gICAgICAgICAgdyArPSB2O1xuICAgICAgICB9XG4gICAgICAgIGlmICghKHcgPiAwKSkgY29udGludWU7XG4gICAgICAgIGxldCBkeSA9ICh5IC8gdyAtIHNvdXJjZS55MCkgKiBhbHBoYTtcbiAgICAgICAgc291cmNlLnkwICs9IGR5O1xuICAgICAgICBzb3VyY2UueTEgKz0gZHk7XG4gICAgICAgIHJlb3JkZXJOb2RlTGlua3Moc291cmNlKTtcbiAgICAgIH1cbiAgICAgIGlmIChzb3J0ID09PSB1bmRlZmluZWQpIGNvbHVtbi5zb3J0KGFzY2VuZGluZ0JyZWFkdGgpO1xuICAgICAgcmVzb2x2ZUNvbGxpc2lvbnMoY29sdW1uLCBiZXRhKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZXNvbHZlQ29sbGlzaW9ucyhub2RlcywgYWxwaGEpIHtcbiAgICBjb25zdCBpID0gbm9kZXMubGVuZ3RoID4+IDE7XG4gICAgY29uc3Qgc3ViamVjdCA9IG5vZGVzW2ldO1xuICAgIHJlc29sdmVDb2xsaXNpb25zQm90dG9tVG9Ub3Aobm9kZXMsIHN1YmplY3QueTAgLSBweSwgaSAtIDEsIGFscGhhKTtcbiAgICByZXNvbHZlQ29sbGlzaW9uc1RvcFRvQm90dG9tKG5vZGVzLCBzdWJqZWN0LnkxICsgcHksIGkgKyAxLCBhbHBoYSk7XG4gICAgcmVzb2x2ZUNvbGxpc2lvbnNCb3R0b21Ub1RvcChub2RlcywgeTEsIG5vZGVzLmxlbmd0aCAtIDEsIGFscGhhKTtcbiAgICByZXNvbHZlQ29sbGlzaW9uc1RvcFRvQm90dG9tKG5vZGVzLCB5MCwgMCwgYWxwaGEpO1xuICB9XG5cbiAgLy8gUHVzaCBhbnkgb3ZlcmxhcHBpbmcgbm9kZXMgZG93bi5cbiAgZnVuY3Rpb24gcmVzb2x2ZUNvbGxpc2lvbnNUb3BUb0JvdHRvbShub2RlcywgeSwgaSwgYWxwaGEpIHtcbiAgICBmb3IgKDsgaSA8IG5vZGVzLmxlbmd0aDsgKytpKSB7XG4gICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XG4gICAgICBjb25zdCBkeSA9ICh5IC0gbm9kZS55MCkgKiBhbHBoYTtcbiAgICAgIGlmIChkeSA+IDFlLTYpIG5vZGUueTAgKz0gZHksIG5vZGUueTEgKz0gZHk7XG4gICAgICB5ID0gbm9kZS55MSArIHB5O1xuICAgIH1cbiAgfVxuXG4gIC8vIFB1c2ggYW55IG92ZXJsYXBwaW5nIG5vZGVzIHVwLlxuICBmdW5jdGlvbiByZXNvbHZlQ29sbGlzaW9uc0JvdHRvbVRvVG9wKG5vZGVzLCB5LCBpLCBhbHBoYSkge1xuICAgIGZvciAoOyBpID49IDA7IC0taSkge1xuICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgY29uc3QgZHkgPSAobm9kZS55MSAtIHkpICogYWxwaGE7XG4gICAgICBpZiAoZHkgPiAxZS02KSBub2RlLnkwIC09IGR5LCBub2RlLnkxIC09IGR5O1xuICAgICAgeSA9IG5vZGUueTAgLSBweTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZW9yZGVyTm9kZUxpbmtzKHtzb3VyY2VMaW5rcywgdGFyZ2V0TGlua3N9KSB7XG4gICAgaWYgKGxpbmtTb3J0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGZvciAoY29uc3Qge3NvdXJjZToge3NvdXJjZUxpbmtzfX0gb2YgdGFyZ2V0TGlua3MpIHtcbiAgICAgICAgc291cmNlTGlua3Muc29ydChhc2NlbmRpbmdUYXJnZXRCcmVhZHRoKTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3Qge3RhcmdldDoge3RhcmdldExpbmtzfX0gb2Ygc291cmNlTGlua3MpIHtcbiAgICAgICAgdGFyZ2V0TGlua3Muc29ydChhc2NlbmRpbmdTb3VyY2VCcmVhZHRoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZW9yZGVyTGlua3Mobm9kZXMpIHtcbiAgICBpZiAobGlua1NvcnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZm9yIChjb25zdCB7c291cmNlTGlua3MsIHRhcmdldExpbmtzfSBvZiBub2Rlcykge1xuICAgICAgICBzb3VyY2VMaW5rcy5zb3J0KGFzY2VuZGluZ1RhcmdldEJyZWFkdGgpO1xuICAgICAgICB0YXJnZXRMaW5rcy5zb3J0KGFzY2VuZGluZ1NvdXJjZUJyZWFkdGgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFJldHVybnMgdGhlIHRhcmdldC55MCB0aGF0IHdvdWxkIHByb2R1Y2UgYW4gaWRlYWwgbGluayBmcm9tIHNvdXJjZSB0byB0YXJnZXQuXG4gIGZ1bmN0aW9uIHRhcmdldFRvcChzb3VyY2UsIHRhcmdldCkge1xuICAgIGxldCB5ID0gc291cmNlLnkwIC0gKHNvdXJjZS5zb3VyY2VMaW5rcy5sZW5ndGggLSAxKSAqIHB5IC8gMjtcbiAgICBmb3IgKGNvbnN0IHt0YXJnZXQ6IG5vZGUsIHdpZHRofSBvZiBzb3VyY2Uuc291cmNlTGlua3MpIHtcbiAgICAgIGlmIChub2RlID09PSB0YXJnZXQpIGJyZWFrO1xuICAgICAgeSArPSB3aWR0aCArIHB5O1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IHtzb3VyY2U6IG5vZGUsIHdpZHRofSBvZiB0YXJnZXQudGFyZ2V0TGlua3MpIHtcbiAgICAgIGlmIChub2RlID09PSBzb3VyY2UpIGJyZWFrO1xuICAgICAgeSAtPSB3aWR0aDtcbiAgICB9XG4gICAgcmV0dXJuIHk7XG4gIH1cblxuICAvLyBSZXR1cm5zIHRoZSBzb3VyY2UueTAgdGhhdCB3b3VsZCBwcm9kdWNlIGFuIGlkZWFsIGxpbmsgZnJvbSBzb3VyY2UgdG8gdGFyZ2V0LlxuICBmdW5jdGlvbiBzb3VyY2VUb3Aoc291cmNlLCB0YXJnZXQpIHtcbiAgICBsZXQgeSA9IHRhcmdldC55MCAtICh0YXJnZXQudGFyZ2V0TGlua3MubGVuZ3RoIC0gMSkgKiBweSAvIDI7XG4gICAgZm9yIChjb25zdCB7c291cmNlOiBub2RlLCB3aWR0aH0gb2YgdGFyZ2V0LnRhcmdldExpbmtzKSB7XG4gICAgICBpZiAobm9kZSA9PT0gc291cmNlKSBicmVhaztcbiAgICAgIHkgKz0gd2lkdGggKyBweTtcbiAgICB9XG4gICAgZm9yIChjb25zdCB7dGFyZ2V0OiBub2RlLCB3aWR0aH0gb2Ygc291cmNlLnNvdXJjZUxpbmtzKSB7XG4gICAgICBpZiAobm9kZSA9PT0gdGFyZ2V0KSBicmVhaztcbiAgICAgIHkgLT0gd2lkdGg7XG4gICAgfVxuICAgIHJldHVybiB5O1xuICB9XG5cbiAgcmV0dXJuIHNhbmtleTtcbn1cbiIsCiAgICAidmFyIHBpID0gTWF0aC5QSSxcbiAgICB0YXUgPSAyICogcGksXG4gICAgZXBzaWxvbiA9IDFlLTYsXG4gICAgdGF1RXBzaWxvbiA9IHRhdSAtIGVwc2lsb247XG5cbmZ1bmN0aW9uIFBhdGgoKSB7XG4gIHRoaXMuX3gwID0gdGhpcy5feTAgPSAvLyBzdGFydCBvZiBjdXJyZW50IHN1YnBhdGhcbiAgdGhpcy5feDEgPSB0aGlzLl95MSA9IG51bGw7IC8vIGVuZCBvZiBjdXJyZW50IHN1YnBhdGhcbiAgdGhpcy5fID0gXCJcIjtcbn1cblxuZnVuY3Rpb24gcGF0aCgpIHtcbiAgcmV0dXJuIG5ldyBQYXRoO1xufVxuXG5QYXRoLnByb3RvdHlwZSA9IHBhdGgucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogUGF0aCxcbiAgbW92ZVRvOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgdGhpcy5fICs9IFwiTVwiICsgKHRoaXMuX3gwID0gdGhpcy5feDEgPSAreCkgKyBcIixcIiArICh0aGlzLl95MCA9IHRoaXMuX3kxID0gK3kpO1xuICB9LFxuICBjbG9zZVBhdGg6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl94MSAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5feDEgPSB0aGlzLl94MCwgdGhpcy5feTEgPSB0aGlzLl95MDtcbiAgICAgIHRoaXMuXyArPSBcIlpcIjtcbiAgICB9XG4gIH0sXG4gIGxpbmVUbzogZnVuY3Rpb24oeCwgeSkge1xuICAgIHRoaXMuXyArPSBcIkxcIiArICh0aGlzLl94MSA9ICt4KSArIFwiLFwiICsgKHRoaXMuX3kxID0gK3kpO1xuICB9LFxuICBxdWFkcmF0aWNDdXJ2ZVRvOiBmdW5jdGlvbih4MSwgeTEsIHgsIHkpIHtcbiAgICB0aGlzLl8gKz0gXCJRXCIgKyAoK3gxKSArIFwiLFwiICsgKCt5MSkgKyBcIixcIiArICh0aGlzLl94MSA9ICt4KSArIFwiLFwiICsgKHRoaXMuX3kxID0gK3kpO1xuICB9LFxuICBiZXppZXJDdXJ2ZVRvOiBmdW5jdGlvbih4MSwgeTEsIHgyLCB5MiwgeCwgeSkge1xuICAgIHRoaXMuXyArPSBcIkNcIiArICgreDEpICsgXCIsXCIgKyAoK3kxKSArIFwiLFwiICsgKCt4MikgKyBcIixcIiArICgreTIpICsgXCIsXCIgKyAodGhpcy5feDEgPSAreCkgKyBcIixcIiArICh0aGlzLl95MSA9ICt5KTtcbiAgfSxcbiAgYXJjVG86IGZ1bmN0aW9uKHgxLCB5MSwgeDIsIHkyLCByKSB7XG4gICAgeDEgPSAreDEsIHkxID0gK3kxLCB4MiA9ICt4MiwgeTIgPSAreTIsIHIgPSArcjtcbiAgICB2YXIgeDAgPSB0aGlzLl94MSxcbiAgICAgICAgeTAgPSB0aGlzLl95MSxcbiAgICAgICAgeDIxID0geDIgLSB4MSxcbiAgICAgICAgeTIxID0geTIgLSB5MSxcbiAgICAgICAgeDAxID0geDAgLSB4MSxcbiAgICAgICAgeTAxID0geTAgLSB5MSxcbiAgICAgICAgbDAxXzIgPSB4MDEgKiB4MDEgKyB5MDEgKiB5MDE7XG5cbiAgICAvLyBJcyB0aGUgcmFkaXVzIG5lZ2F0aXZlPyBFcnJvci5cbiAgICBpZiAociA8IDApIHRocm93IG5ldyBFcnJvcihcIm5lZ2F0aXZlIHJhZGl1czogXCIgKyByKTtcblxuICAgIC8vIElzIHRoaXMgcGF0aCBlbXB0eT8gTW92ZSB0byAoeDEseTEpLlxuICAgIGlmICh0aGlzLl94MSA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5fICs9IFwiTVwiICsgKHRoaXMuX3gxID0geDEpICsgXCIsXCIgKyAodGhpcy5feTEgPSB5MSk7XG4gICAgfVxuXG4gICAgLy8gT3IsIGlzICh4MSx5MSkgY29pbmNpZGVudCB3aXRoICh4MCx5MCk/IERvIG5vdGhpbmcuXG4gICAgZWxzZSBpZiAoIShsMDFfMiA+IGVwc2lsb24pKTtcblxuICAgIC8vIE9yLCBhcmUgKHgwLHkwKSwgKHgxLHkxKSBhbmQgKHgyLHkyKSBjb2xsaW5lYXI/XG4gICAgLy8gRXF1aXZhbGVudGx5LCBpcyAoeDEseTEpIGNvaW5jaWRlbnQgd2l0aCAoeDIseTIpP1xuICAgIC8vIE9yLCBpcyB0aGUgcmFkaXVzIHplcm8/IExpbmUgdG8gKHgxLHkxKS5cbiAgICBlbHNlIGlmICghKE1hdGguYWJzKHkwMSAqIHgyMSAtIHkyMSAqIHgwMSkgPiBlcHNpbG9uKSB8fCAhcikge1xuICAgICAgdGhpcy5fICs9IFwiTFwiICsgKHRoaXMuX3gxID0geDEpICsgXCIsXCIgKyAodGhpcy5feTEgPSB5MSk7XG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCBkcmF3IGFuIGFyYyFcbiAgICBlbHNlIHtcbiAgICAgIHZhciB4MjAgPSB4MiAtIHgwLFxuICAgICAgICAgIHkyMCA9IHkyIC0geTAsXG4gICAgICAgICAgbDIxXzIgPSB4MjEgKiB4MjEgKyB5MjEgKiB5MjEsXG4gICAgICAgICAgbDIwXzIgPSB4MjAgKiB4MjAgKyB5MjAgKiB5MjAsXG4gICAgICAgICAgbDIxID0gTWF0aC5zcXJ0KGwyMV8yKSxcbiAgICAgICAgICBsMDEgPSBNYXRoLnNxcnQobDAxXzIpLFxuICAgICAgICAgIGwgPSByICogTWF0aC50YW4oKHBpIC0gTWF0aC5hY29zKChsMjFfMiArIGwwMV8yIC0gbDIwXzIpIC8gKDIgKiBsMjEgKiBsMDEpKSkgLyAyKSxcbiAgICAgICAgICB0MDEgPSBsIC8gbDAxLFxuICAgICAgICAgIHQyMSA9IGwgLyBsMjE7XG5cbiAgICAgIC8vIElmIHRoZSBzdGFydCB0YW5nZW50IGlzIG5vdCBjb2luY2lkZW50IHdpdGggKHgwLHkwKSwgbGluZSB0by5cbiAgICAgIGlmIChNYXRoLmFicyh0MDEgLSAxKSA+IGVwc2lsb24pIHtcbiAgICAgICAgdGhpcy5fICs9IFwiTFwiICsgKHgxICsgdDAxICogeDAxKSArIFwiLFwiICsgKHkxICsgdDAxICogeTAxKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fICs9IFwiQVwiICsgciArIFwiLFwiICsgciArIFwiLDAsMCxcIiArICgrKHkwMSAqIHgyMCA+IHgwMSAqIHkyMCkpICsgXCIsXCIgKyAodGhpcy5feDEgPSB4MSArIHQyMSAqIHgyMSkgKyBcIixcIiArICh0aGlzLl95MSA9IHkxICsgdDIxICogeTIxKTtcbiAgICB9XG4gIH0sXG4gIGFyYzogZnVuY3Rpb24oeCwgeSwgciwgYTAsIGExLCBjY3cpIHtcbiAgICB4ID0gK3gsIHkgPSAreSwgciA9ICtyLCBjY3cgPSAhIWNjdztcbiAgICB2YXIgZHggPSByICogTWF0aC5jb3MoYTApLFxuICAgICAgICBkeSA9IHIgKiBNYXRoLnNpbihhMCksXG4gICAgICAgIHgwID0geCArIGR4LFxuICAgICAgICB5MCA9IHkgKyBkeSxcbiAgICAgICAgY3cgPSAxIF4gY2N3LFxuICAgICAgICBkYSA9IGNjdyA/IGEwIC0gYTEgOiBhMSAtIGEwO1xuXG4gICAgLy8gSXMgdGhlIHJhZGl1cyBuZWdhdGl2ZT8gRXJyb3IuXG4gICAgaWYgKHIgPCAwKSB0aHJvdyBuZXcgRXJyb3IoXCJuZWdhdGl2ZSByYWRpdXM6IFwiICsgcik7XG5cbiAgICAvLyBJcyB0aGlzIHBhdGggZW1wdHk/IE1vdmUgdG8gKHgwLHkwKS5cbiAgICBpZiAodGhpcy5feDEgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuXyArPSBcIk1cIiArIHgwICsgXCIsXCIgKyB5MDtcbiAgICB9XG5cbiAgICAvLyBPciwgaXMgKHgwLHkwKSBub3QgY29pbmNpZGVudCB3aXRoIHRoZSBwcmV2aW91cyBwb2ludD8gTGluZSB0byAoeDAseTApLlxuICAgIGVsc2UgaWYgKE1hdGguYWJzKHRoaXMuX3gxIC0geDApID4gZXBzaWxvbiB8fCBNYXRoLmFicyh0aGlzLl95MSAtIHkwKSA+IGVwc2lsb24pIHtcbiAgICAgIHRoaXMuXyArPSBcIkxcIiArIHgwICsgXCIsXCIgKyB5MDtcbiAgICB9XG5cbiAgICAvLyBJcyB0aGlzIGFyYyBlbXB0eT8gV2XigJlyZSBkb25lLlxuICAgIGlmICghcikgcmV0dXJuO1xuXG4gICAgLy8gRG9lcyB0aGUgYW5nbGUgZ28gdGhlIHdyb25nIHdheT8gRmxpcCB0aGUgZGlyZWN0aW9uLlxuICAgIGlmIChkYSA8IDApIGRhID0gZGEgJSB0YXUgKyB0YXU7XG5cbiAgICAvLyBJcyB0aGlzIGEgY29tcGxldGUgY2lyY2xlPyBEcmF3IHR3byBhcmNzIHRvIGNvbXBsZXRlIHRoZSBjaXJjbGUuXG4gICAgaWYgKGRhID4gdGF1RXBzaWxvbikge1xuICAgICAgdGhpcy5fICs9IFwiQVwiICsgciArIFwiLFwiICsgciArIFwiLDAsMSxcIiArIGN3ICsgXCIsXCIgKyAoeCAtIGR4KSArIFwiLFwiICsgKHkgLSBkeSkgKyBcIkFcIiArIHIgKyBcIixcIiArIHIgKyBcIiwwLDEsXCIgKyBjdyArIFwiLFwiICsgKHRoaXMuX3gxID0geDApICsgXCIsXCIgKyAodGhpcy5feTEgPSB5MCk7XG4gICAgfVxuXG4gICAgLy8gSXMgdGhpcyBhcmMgbm9uLWVtcHR5PyBEcmF3IGFuIGFyYyFcbiAgICBlbHNlIGlmIChkYSA+IGVwc2lsb24pIHtcbiAgICAgIHRoaXMuXyArPSBcIkFcIiArIHIgKyBcIixcIiArIHIgKyBcIiwwLFwiICsgKCsoZGEgPj0gcGkpKSArIFwiLFwiICsgY3cgKyBcIixcIiArICh0aGlzLl94MSA9IHggKyByICogTWF0aC5jb3MoYTEpKSArIFwiLFwiICsgKHRoaXMuX3kxID0geSArIHIgKiBNYXRoLnNpbihhMSkpO1xuICAgIH1cbiAgfSxcbiAgcmVjdDogZnVuY3Rpb24oeCwgeSwgdywgaCkge1xuICAgIHRoaXMuXyArPSBcIk1cIiArICh0aGlzLl94MCA9IHRoaXMuX3gxID0gK3gpICsgXCIsXCIgKyAodGhpcy5feTAgPSB0aGlzLl95MSA9ICt5KSArIFwiaFwiICsgKCt3KSArIFwidlwiICsgKCtoKSArIFwiaFwiICsgKC13KSArIFwiWlwiO1xuICB9LFxuICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuXztcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgcGF0aDtcbiIsCiAgICAiZXhwb3J0IHZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbiIsCiAgICAiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCkge1xuICByZXR1cm4gZnVuY3Rpb24gY29uc3RhbnQoKSB7XG4gICAgcmV0dXJuIHg7XG4gIH07XG59XG4iLAogICAgImV4cG9ydCBmdW5jdGlvbiB4KHApIHtcbiAgcmV0dXJuIHBbMF07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB5KHApIHtcbiAgcmV0dXJuIHBbMV07XG59XG4iLAogICAgImltcG9ydCB7cGF0aH0gZnJvbSBcImQzLXBhdGhcIjtcbmltcG9ydCB7c2xpY2V9IGZyb20gXCIuLi9hcnJheS5qc1wiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuLi9jb25zdGFudC5qc1wiO1xuaW1wb3J0IHt4IGFzIHBvaW50WCwgeSBhcyBwb2ludFl9IGZyb20gXCIuLi9wb2ludC5qc1wiO1xuaW1wb3J0IHBvaW50UmFkaWFsIGZyb20gXCIuLi9wb2ludFJhZGlhbC5qc1wiO1xuXG5mdW5jdGlvbiBsaW5rU291cmNlKGQpIHtcbiAgcmV0dXJuIGQuc291cmNlO1xufVxuXG5mdW5jdGlvbiBsaW5rVGFyZ2V0KGQpIHtcbiAgcmV0dXJuIGQudGFyZ2V0O1xufVxuXG5mdW5jdGlvbiBsaW5rKGN1cnZlKSB7XG4gIHZhciBzb3VyY2UgPSBsaW5rU291cmNlLFxuICAgICAgdGFyZ2V0ID0gbGlua1RhcmdldCxcbiAgICAgIHggPSBwb2ludFgsXG4gICAgICB5ID0gcG9pbnRZLFxuICAgICAgY29udGV4dCA9IG51bGw7XG5cbiAgZnVuY3Rpb24gbGluaygpIHtcbiAgICB2YXIgYnVmZmVyLCBhcmd2ID0gc2xpY2UuY2FsbChhcmd1bWVudHMpLCBzID0gc291cmNlLmFwcGx5KHRoaXMsIGFyZ3YpLCB0ID0gdGFyZ2V0LmFwcGx5KHRoaXMsIGFyZ3YpO1xuICAgIGlmICghY29udGV4dCkgY29udGV4dCA9IGJ1ZmZlciA9IHBhdGgoKTtcbiAgICBjdXJ2ZShjb250ZXh0LCAreC5hcHBseSh0aGlzLCAoYXJndlswXSA9IHMsIGFyZ3YpKSwgK3kuYXBwbHkodGhpcywgYXJndiksICt4LmFwcGx5KHRoaXMsIChhcmd2WzBdID0gdCwgYXJndikpLCAreS5hcHBseSh0aGlzLCBhcmd2KSk7XG4gICAgaWYgKGJ1ZmZlcikgcmV0dXJuIGNvbnRleHQgPSBudWxsLCBidWZmZXIgKyBcIlwiIHx8IG51bGw7XG4gIH1cblxuICBsaW5rLnNvdXJjZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChzb3VyY2UgPSBfLCBsaW5rKSA6IHNvdXJjZTtcbiAgfTtcblxuICBsaW5rLnRhcmdldCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh0YXJnZXQgPSBfLCBsaW5rKSA6IHRhcmdldDtcbiAgfTtcblxuICBsaW5rLnggPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoeCA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogY29uc3RhbnQoK18pLCBsaW5rKSA6IHg7XG4gIH07XG5cbiAgbGluay55ID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHkgPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gXyA6IGNvbnN0YW50KCtfKSwgbGluaykgOiB5O1xuICB9O1xuXG4gIGxpbmsuY29udGV4dCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICgoY29udGV4dCA9IF8gPT0gbnVsbCA/IG51bGwgOiBfKSwgbGluaykgOiBjb250ZXh0O1xuICB9O1xuXG4gIHJldHVybiBsaW5rO1xufVxuXG5mdW5jdGlvbiBjdXJ2ZUhvcml6b250YWwoY29udGV4dCwgeDAsIHkwLCB4MSwgeTEpIHtcbiAgY29udGV4dC5tb3ZlVG8oeDAsIHkwKTtcbiAgY29udGV4dC5iZXppZXJDdXJ2ZVRvKHgwID0gKHgwICsgeDEpIC8gMiwgeTAsIHgwLCB5MSwgeDEsIHkxKTtcbn1cblxuZnVuY3Rpb24gY3VydmVWZXJ0aWNhbChjb250ZXh0LCB4MCwgeTAsIHgxLCB5MSkge1xuICBjb250ZXh0Lm1vdmVUbyh4MCwgeTApO1xuICBjb250ZXh0LmJlemllckN1cnZlVG8oeDAsIHkwID0gKHkwICsgeTEpIC8gMiwgeDEsIHkwLCB4MSwgeTEpO1xufVxuXG5mdW5jdGlvbiBjdXJ2ZVJhZGlhbChjb250ZXh0LCB4MCwgeTAsIHgxLCB5MSkge1xuICB2YXIgcDAgPSBwb2ludFJhZGlhbCh4MCwgeTApLFxuICAgICAgcDEgPSBwb2ludFJhZGlhbCh4MCwgeTAgPSAoeTAgKyB5MSkgLyAyKSxcbiAgICAgIHAyID0gcG9pbnRSYWRpYWwoeDEsIHkwKSxcbiAgICAgIHAzID0gcG9pbnRSYWRpYWwoeDEsIHkxKTtcbiAgY29udGV4dC5tb3ZlVG8ocDBbMF0sIHAwWzFdKTtcbiAgY29udGV4dC5iZXppZXJDdXJ2ZVRvKHAxWzBdLCBwMVsxXSwgcDJbMF0sIHAyWzFdLCBwM1swXSwgcDNbMV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlua0hvcml6b250YWwoKSB7XG4gIHJldHVybiBsaW5rKGN1cnZlSG9yaXpvbnRhbCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaW5rVmVydGljYWwoKSB7XG4gIHJldHVybiBsaW5rKGN1cnZlVmVydGljYWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlua1JhZGlhbCgpIHtcbiAgdmFyIGwgPSBsaW5rKGN1cnZlUmFkaWFsKTtcbiAgbC5hbmdsZSA9IGwueCwgZGVsZXRlIGwueDtcbiAgbC5yYWRpdXMgPSBsLnksIGRlbGV0ZSBsLnk7XG4gIHJldHVybiBsO1xufVxuIiwKICAgICJpbXBvcnQge2xpbmtIb3Jpem9udGFsfSBmcm9tIFwiZDMtc2hhcGVcIjtcblxuZnVuY3Rpb24gaG9yaXpvbnRhbFNvdXJjZShkKSB7XG4gIHJldHVybiBbZC5zb3VyY2UueDEsIGQueTBdO1xufVxuXG5mdW5jdGlvbiBob3Jpem9udGFsVGFyZ2V0KGQpIHtcbiAgcmV0dXJuIFtkLnRhcmdldC54MCwgZC55MV07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbGlua0hvcml6b250YWwoKVxuICAgICAgLnNvdXJjZShob3Jpem9udGFsU291cmNlKVxuICAgICAgLnRhcmdldChob3Jpem9udGFsVGFyZ2V0KTtcbn1cbiIsCiAgICAiaW1wb3J0IHtcbiAgY2xlYXIsXG4gIGNvbW1vbl9kZWZhdWx0LFxuICBkZWZhdWx0Q29uZmlnMiBhcyBkZWZhdWx0Q29uZmlnLFxuICBnZXRBY2NEZXNjcmlwdGlvbixcbiAgZ2V0QWNjVGl0bGUsXG4gIGdldENvbmZpZzIgYXMgZ2V0Q29uZmlnLFxuICBnZXREaWFncmFtVGl0bGUsXG4gIHNldEFjY0Rlc2NyaXB0aW9uLFxuICBzZXRBY2NUaXRsZSxcbiAgc2V0RGlhZ3JhbVRpdGxlLFxuICBzZXR1cEdyYXBoVmlld2JveFxufSBmcm9tIFwiLi9jaHVuay1DU0NJSEs3US5tanNcIjtcbmltcG9ydCB7XG4gIF9fbmFtZVxufSBmcm9tIFwiLi9jaHVuay1BR0hSQjRKRi5tanNcIjtcblxuLy8gc3JjL2RpYWdyYW1zL3NhbmtleS9wYXJzZXIvc2Fua2V5Lmppc29uXG52YXIgcGFyc2VyID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgbyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oaywgdiwgbzIsIGwpIHtcbiAgICBmb3IgKG8yID0gbzIgfHwge30sIGwgPSBrLmxlbmd0aDsgbC0tOyBvMltrW2xdXSA9IHYpIDtcbiAgICByZXR1cm4gbzI7XG4gIH0sIFwib1wiKSwgJFYwID0gWzEsIDldLCAkVjEgPSBbMSwgMTBdLCAkVjIgPSBbMSwgNSwgMTAsIDEyXTtcbiAgdmFyIHBhcnNlcjIgPSB7XG4gICAgdHJhY2U6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gdHJhY2UoKSB7XG4gICAgfSwgXCJ0cmFjZVwiKSxcbiAgICB5eToge30sXG4gICAgc3ltYm9sc186IHsgXCJlcnJvclwiOiAyLCBcInN0YXJ0XCI6IDMsIFwiU0FOS0VZXCI6IDQsIFwiTkVXTElORVwiOiA1LCBcImNzdlwiOiA2LCBcIm9wdF9lb2ZcIjogNywgXCJyZWNvcmRcIjogOCwgXCJjc3ZfdGFpbFwiOiA5LCBcIkVPRlwiOiAxMCwgXCJmaWVsZFtzb3VyY2VdXCI6IDExLCBcIkNPTU1BXCI6IDEyLCBcImZpZWxkW3RhcmdldF1cIjogMTMsIFwiZmllbGRbdmFsdWVdXCI6IDE0LCBcImZpZWxkXCI6IDE1LCBcImVzY2FwZWRcIjogMTYsIFwibm9uX2VzY2FwZWRcIjogMTcsIFwiRFFVT1RFXCI6IDE4LCBcIkVTQ0FQRURfVEVYVFwiOiAxOSwgXCJOT05fRVNDQVBFRF9URVhUXCI6IDIwLCBcIiRhY2NlcHRcIjogMCwgXCIkZW5kXCI6IDEgfSxcbiAgICB0ZXJtaW5hbHNfOiB7IDI6IFwiZXJyb3JcIiwgNDogXCJTQU5LRVlcIiwgNTogXCJORVdMSU5FXCIsIDEwOiBcIkVPRlwiLCAxMTogXCJmaWVsZFtzb3VyY2VdXCIsIDEyOiBcIkNPTU1BXCIsIDEzOiBcImZpZWxkW3RhcmdldF1cIiwgMTQ6IFwiZmllbGRbdmFsdWVdXCIsIDE4OiBcIkRRVU9URVwiLCAxOTogXCJFU0NBUEVEX1RFWFRcIiwgMjA6IFwiTk9OX0VTQ0FQRURfVEVYVFwiIH0sXG4gICAgcHJvZHVjdGlvbnNfOiBbMCwgWzMsIDRdLCBbNiwgMl0sIFs5LCAyXSwgWzksIDBdLCBbNywgMV0sIFs3LCAwXSwgWzgsIDVdLCBbMTUsIDFdLCBbMTUsIDFdLCBbMTYsIDNdLCBbMTcsIDFdXSxcbiAgICBwZXJmb3JtQWN0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGFub255bW91cyh5eXRleHQsIHl5bGVuZywgeXlsaW5lbm8sIHl5LCB5eXN0YXRlLCAkJCwgXyQpIHtcbiAgICAgIHZhciAkMCA9ICQkLmxlbmd0aCAtIDE7XG4gICAgICBzd2l0Y2ggKHl5c3RhdGUpIHtcbiAgICAgICAgY2FzZSA3OlxuICAgICAgICAgIGNvbnN0IHNvdXJjZSA9IHl5LmZpbmRPckNyZWF0ZU5vZGUoJCRbJDAgLSA0XS50cmltKCkucmVwbGFjZUFsbCgnXCJcIicsICdcIicpKTtcbiAgICAgICAgICBjb25zdCB0YXJnZXQgPSB5eS5maW5kT3JDcmVhdGVOb2RlKCQkWyQwIC0gMl0udHJpbSgpLnJlcGxhY2VBbGwoJ1wiXCInLCAnXCInKSk7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZUZsb2F0KCQkWyQwXS50cmltKCkpO1xuICAgICAgICAgIHl5LmFkZExpbmsoc291cmNlLCB0YXJnZXQsIHZhbHVlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA4OlxuICAgICAgICBjYXNlIDk6XG4gICAgICAgIGNhc2UgMTE6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSwgXCJhbm9ueW1vdXNcIiksXG4gICAgdGFibGU6IFt7IDM6IDEsIDQ6IFsxLCAyXSB9LCB7IDE6IFszXSB9LCB7IDU6IFsxLCAzXSB9LCB7IDY6IDQsIDg6IDUsIDE1OiA2LCAxNjogNywgMTc6IDgsIDE4OiAkVjAsIDIwOiAkVjEgfSwgeyAxOiBbMiwgNl0sIDc6IDExLCAxMDogWzEsIDEyXSB9LCBvKCRWMSwgWzIsIDRdLCB7IDk6IDEzLCA1OiBbMSwgMTRdIH0pLCB7IDEyOiBbMSwgMTVdIH0sIG8oJFYyLCBbMiwgOF0pLCBvKCRWMiwgWzIsIDldKSwgeyAxOTogWzEsIDE2XSB9LCBvKCRWMiwgWzIsIDExXSksIHsgMTogWzIsIDFdIH0sIHsgMTogWzIsIDVdIH0sIG8oJFYxLCBbMiwgMl0pLCB7IDY6IDE3LCA4OiA1LCAxNTogNiwgMTY6IDcsIDE3OiA4LCAxODogJFYwLCAyMDogJFYxIH0sIHsgMTU6IDE4LCAxNjogNywgMTc6IDgsIDE4OiAkVjAsIDIwOiAkVjEgfSwgeyAxODogWzEsIDE5XSB9LCBvKCRWMSwgWzIsIDNdKSwgeyAxMjogWzEsIDIwXSB9LCBvKCRWMiwgWzIsIDEwXSksIHsgMTU6IDIxLCAxNjogNywgMTc6IDgsIDE4OiAkVjAsIDIwOiAkVjEgfSwgbyhbMSwgNSwgMTBdLCBbMiwgN10pXSxcbiAgICBkZWZhdWx0QWN0aW9uczogeyAxMTogWzIsIDFdLCAxMjogWzIsIDVdIH0sXG4gICAgcGFyc2VFcnJvcjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwYXJzZUVycm9yKHN0ciwgaGFzaCkge1xuICAgICAgaWYgKGhhc2gucmVjb3ZlcmFibGUpIHtcbiAgICAgICAgdGhpcy50cmFjZShzdHIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKHN0cik7XG4gICAgICAgIGVycm9yLmhhc2ggPSBoYXNoO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LCBcInBhcnNlRXJyb3JcIiksXG4gICAgcGFyc2U6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcGFyc2UoaW5wdXQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcywgc3RhY2sgPSBbMF0sIHRzdGFjayA9IFtdLCB2c3RhY2sgPSBbbnVsbF0sIGxzdGFjayA9IFtdLCB0YWJsZSA9IHRoaXMudGFibGUsIHl5dGV4dCA9IFwiXCIsIHl5bGluZW5vID0gMCwgeXlsZW5nID0gMCwgcmVjb3ZlcmluZyA9IDAsIFRFUlJPUiA9IDIsIEVPRiA9IDE7XG4gICAgICB2YXIgYXJncyA9IGxzdGFjay5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICB2YXIgbGV4ZXIyID0gT2JqZWN0LmNyZWF0ZSh0aGlzLmxleGVyKTtcbiAgICAgIHZhciBzaGFyZWRTdGF0ZSA9IHsgeXk6IHt9IH07XG4gICAgICBmb3IgKHZhciBrIGluIHRoaXMueXkpIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnl5LCBrKSkge1xuICAgICAgICAgIHNoYXJlZFN0YXRlLnl5W2tdID0gdGhpcy55eVtrXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGV4ZXIyLnNldElucHV0KGlucHV0LCBzaGFyZWRTdGF0ZS55eSk7XG4gICAgICBzaGFyZWRTdGF0ZS55eS5sZXhlciA9IGxleGVyMjtcbiAgICAgIHNoYXJlZFN0YXRlLnl5LnBhcnNlciA9IHRoaXM7XG4gICAgICBpZiAodHlwZW9mIGxleGVyMi55eWxsb2MgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBsZXhlcjIueXlsbG9jID0ge307XG4gICAgICB9XG4gICAgICB2YXIgeXlsb2MgPSBsZXhlcjIueXlsbG9jO1xuICAgICAgbHN0YWNrLnB1c2goeXlsb2MpO1xuICAgICAgdmFyIHJhbmdlcyA9IGxleGVyMi5vcHRpb25zICYmIGxleGVyMi5vcHRpb25zLnJhbmdlcztcbiAgICAgIGlmICh0eXBlb2Ygc2hhcmVkU3RhdGUueXkucGFyc2VFcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRoaXMucGFyc2VFcnJvciA9IHNoYXJlZFN0YXRlLnl5LnBhcnNlRXJyb3I7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBhcnNlRXJyb3IgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykucGFyc2VFcnJvcjtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHBvcFN0YWNrKG4pIHtcbiAgICAgICAgc3RhY2subGVuZ3RoID0gc3RhY2subGVuZ3RoIC0gMiAqIG47XG4gICAgICAgIHZzdGFjay5sZW5ndGggPSB2c3RhY2subGVuZ3RoIC0gbjtcbiAgICAgICAgbHN0YWNrLmxlbmd0aCA9IGxzdGFjay5sZW5ndGggLSBuO1xuICAgICAgfVxuICAgICAgX19uYW1lKHBvcFN0YWNrLCBcInBvcFN0YWNrXCIpO1xuICAgICAgZnVuY3Rpb24gbGV4KCkge1xuICAgICAgICB2YXIgdG9rZW47XG4gICAgICAgIHRva2VuID0gdHN0YWNrLnBvcCgpIHx8IGxleGVyMi5sZXgoKSB8fCBFT0Y7XG4gICAgICAgIGlmICh0eXBlb2YgdG9rZW4gIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICBpZiAodG9rZW4gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgdHN0YWNrID0gdG9rZW47XG4gICAgICAgICAgICB0b2tlbiA9IHRzdGFjay5wb3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdG9rZW4gPSBzZWxmLnN5bWJvbHNfW3Rva2VuXSB8fCB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICB9XG4gICAgICBfX25hbWUobGV4LCBcImxleFwiKTtcbiAgICAgIHZhciBzeW1ib2wsIHByZUVycm9yU3ltYm9sLCBzdGF0ZSwgYWN0aW9uLCBhLCByLCB5eXZhbCA9IHt9LCBwLCBsZW4sIG5ld1N0YXRlLCBleHBlY3RlZDtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHN0YXRlID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRBY3Rpb25zW3N0YXRlXSkge1xuICAgICAgICAgIGFjdGlvbiA9IHRoaXMuZGVmYXVsdEFjdGlvbnNbc3RhdGVdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChzeW1ib2wgPT09IG51bGwgfHwgdHlwZW9mIHN5bWJvbCA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBzeW1ib2wgPSBsZXgoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aW9uID0gdGFibGVbc3RhdGVdICYmIHRhYmxlW3N0YXRlXVtzeW1ib2xdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgYWN0aW9uID09PSBcInVuZGVmaW5lZFwiIHx8ICFhY3Rpb24ubGVuZ3RoIHx8ICFhY3Rpb25bMF0pIHtcbiAgICAgICAgICB2YXIgZXJyU3RyID0gXCJcIjtcbiAgICAgICAgICBleHBlY3RlZCA9IFtdO1xuICAgICAgICAgIGZvciAocCBpbiB0YWJsZVtzdGF0ZV0pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRlcm1pbmFsc19bcF0gJiYgcCA+IFRFUlJPUikge1xuICAgICAgICAgICAgICBleHBlY3RlZC5wdXNoKFwiJ1wiICsgdGhpcy50ZXJtaW5hbHNfW3BdICsgXCInXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobGV4ZXIyLnNob3dQb3NpdGlvbikge1xuICAgICAgICAgICAgZXJyU3RyID0gXCJQYXJzZSBlcnJvciBvbiBsaW5lIFwiICsgKHl5bGluZW5vICsgMSkgKyBcIjpcXG5cIiArIGxleGVyMi5zaG93UG9zaXRpb24oKSArIFwiXFxuRXhwZWN0aW5nIFwiICsgZXhwZWN0ZWQuam9pbihcIiwgXCIpICsgXCIsIGdvdCAnXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlcnJTdHIgPSBcIlBhcnNlIGVycm9yIG9uIGxpbmUgXCIgKyAoeXlsaW5lbm8gKyAxKSArIFwiOiBVbmV4cGVjdGVkIFwiICsgKHN5bWJvbCA9PSBFT0YgPyBcImVuZCBvZiBpbnB1dFwiIDogXCInXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wYXJzZUVycm9yKGVyclN0ciwge1xuICAgICAgICAgICAgdGV4dDogbGV4ZXIyLm1hdGNoLFxuICAgICAgICAgICAgdG9rZW46IHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCxcbiAgICAgICAgICAgIGxpbmU6IGxleGVyMi55eWxpbmVubyxcbiAgICAgICAgICAgIGxvYzogeXlsb2MsXG4gICAgICAgICAgICBleHBlY3RlZFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhY3Rpb25bMF0gaW5zdGFuY2VvZiBBcnJheSAmJiBhY3Rpb24ubGVuZ3RoID4gMSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcnNlIEVycm9yOiBtdWx0aXBsZSBhY3Rpb25zIHBvc3NpYmxlIGF0IHN0YXRlOiBcIiArIHN0YXRlICsgXCIsIHRva2VuOiBcIiArIHN5bWJvbCk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChhY3Rpb25bMF0pIHtcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBzdGFjay5wdXNoKHN5bWJvbCk7XG4gICAgICAgICAgICB2c3RhY2sucHVzaChsZXhlcjIueXl0ZXh0KTtcbiAgICAgICAgICAgIGxzdGFjay5wdXNoKGxleGVyMi55eWxsb2MpO1xuICAgICAgICAgICAgc3RhY2sucHVzaChhY3Rpb25bMV0pO1xuICAgICAgICAgICAgc3ltYm9sID0gbnVsbDtcbiAgICAgICAgICAgIGlmICghcHJlRXJyb3JTeW1ib2wpIHtcbiAgICAgICAgICAgICAgeXlsZW5nID0gbGV4ZXIyLnl5bGVuZztcbiAgICAgICAgICAgICAgeXl0ZXh0ID0gbGV4ZXIyLnl5dGV4dDtcbiAgICAgICAgICAgICAgeXlsaW5lbm8gPSBsZXhlcjIueXlsaW5lbm87XG4gICAgICAgICAgICAgIHl5bG9jID0gbGV4ZXIyLnl5bGxvYztcbiAgICAgICAgICAgICAgaWYgKHJlY292ZXJpbmcgPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVjb3ZlcmluZy0tO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzeW1ib2wgPSBwcmVFcnJvclN5bWJvbDtcbiAgICAgICAgICAgICAgcHJlRXJyb3JTeW1ib2wgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgbGVuID0gdGhpcy5wcm9kdWN0aW9uc19bYWN0aW9uWzFdXVsxXTtcbiAgICAgICAgICAgIHl5dmFsLiQgPSB2c3RhY2tbdnN0YWNrLmxlbmd0aCAtIGxlbl07XG4gICAgICAgICAgICB5eXZhbC5fJCA9IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5maXJzdF9saW5lLFxuICAgICAgICAgICAgICBsYXN0X2xpbmU6IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gMV0ubGFzdF9saW5lLFxuICAgICAgICAgICAgICBmaXJzdF9jb2x1bW46IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0uZmlyc3RfY29sdW1uLFxuICAgICAgICAgICAgICBsYXN0X2NvbHVtbjogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAxXS5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChyYW5nZXMpIHtcbiAgICAgICAgICAgICAgeXl2YWwuXyQucmFuZ2UgPSBbXG4gICAgICAgICAgICAgICAgbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5yYW5nZVswXSxcbiAgICAgICAgICAgICAgICBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIDFdLnJhbmdlWzFdXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByID0gdGhpcy5wZXJmb3JtQWN0aW9uLmFwcGx5KHl5dmFsLCBbXG4gICAgICAgICAgICAgIHl5dGV4dCxcbiAgICAgICAgICAgICAgeXlsZW5nLFxuICAgICAgICAgICAgICB5eWxpbmVubyxcbiAgICAgICAgICAgICAgc2hhcmVkU3RhdGUueXksXG4gICAgICAgICAgICAgIGFjdGlvblsxXSxcbiAgICAgICAgICAgICAgdnN0YWNrLFxuICAgICAgICAgICAgICBsc3RhY2tcbiAgICAgICAgICAgIF0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsZW4pIHtcbiAgICAgICAgICAgICAgc3RhY2sgPSBzdGFjay5zbGljZSgwLCAtMSAqIGxlbiAqIDIpO1xuICAgICAgICAgICAgICB2c3RhY2sgPSB2c3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgICBsc3RhY2sgPSBsc3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhY2sucHVzaCh0aGlzLnByb2R1Y3Rpb25zX1thY3Rpb25bMV1dWzBdKTtcbiAgICAgICAgICAgIHZzdGFjay5wdXNoKHl5dmFsLiQpO1xuICAgICAgICAgICAgbHN0YWNrLnB1c2goeXl2YWwuXyQpO1xuICAgICAgICAgICAgbmV3U3RhdGUgPSB0YWJsZVtzdGFja1tzdGFjay5sZW5ndGggLSAyXV1bc3RhY2tbc3RhY2subGVuZ3RoIC0gMV1dO1xuICAgICAgICAgICAgc3RhY2sucHVzaChuZXdTdGF0ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSwgXCJwYXJzZVwiKVxuICB9O1xuICB2YXIgbGV4ZXIgPSAvKiBAX19QVVJFX18gKi8gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZXhlcjIgPSB7XG4gICAgICBFT0Y6IDEsXG4gICAgICBwYXJzZUVycm9yOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBhcnNlRXJyb3Ioc3RyLCBoYXNoKSB7XG4gICAgICAgIGlmICh0aGlzLnl5LnBhcnNlcikge1xuICAgICAgICAgIHRoaXMueXkucGFyc2VyLnBhcnNlRXJyb3Ioc3RyLCBoYXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3RyKTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwYXJzZUVycm9yXCIpLFxuICAgICAgLy8gcmVzZXRzIHRoZSBsZXhlciwgc2V0cyBuZXcgaW5wdXRcbiAgICAgIHNldElucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGlucHV0LCB5eSkge1xuICAgICAgICB0aGlzLnl5ID0geXkgfHwgdGhpcy55eSB8fCB7fTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBpbnB1dDtcbiAgICAgICAgdGhpcy5fbW9yZSA9IHRoaXMuX2JhY2t0cmFjayA9IHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnl5bGluZW5vID0gdGhpcy55eWxlbmcgPSAwO1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2ggPSBcIlwiO1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrID0gW1wiSU5JVElBTFwiXTtcbiAgICAgICAgdGhpcy55eWxsb2MgPSB7XG4gICAgICAgICAgZmlyc3RfbGluZTogMSxcbiAgICAgICAgICBmaXJzdF9jb2x1bW46IDAsXG4gICAgICAgICAgbGFzdF9saW5lOiAxLFxuICAgICAgICAgIGxhc3RfY29sdW1uOiAwXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2UgPSBbMCwgMF07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vZmZzZXQgPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwic2V0SW5wdXRcIiksXG4gICAgICAvLyBjb25zdW1lcyBhbmQgcmV0dXJucyBvbmUgY2hhciBmcm9tIHRoZSBpbnB1dFxuICAgICAgaW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjaCA9IHRoaXMuX2lucHV0WzBdO1xuICAgICAgICB0aGlzLnl5dGV4dCArPSBjaDtcbiAgICAgICAgdGhpcy55eWxlbmcrKztcbiAgICAgICAgdGhpcy5vZmZzZXQrKztcbiAgICAgICAgdGhpcy5tYXRjaCArPSBjaDtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IGNoO1xuICAgICAgICB2YXIgbGluZXMgPSBjaC5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8rKztcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2xpbmUrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtbisrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2VbMV0rKztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pbnB1dCA9IHRoaXMuX2lucHV0LnNsaWNlKDEpO1xuICAgICAgICByZXR1cm4gY2g7XG4gICAgICB9LCBcImlucHV0XCIpLFxuICAgICAgLy8gdW5zaGlmdHMgb25lIGNoYXIgKG9yIGEgc3RyaW5nKSBpbnRvIHRoZSBpbnB1dFxuICAgICAgdW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oY2gpIHtcbiAgICAgICAgdmFyIGxlbiA9IGNoLmxlbmd0aDtcbiAgICAgICAgdmFyIGxpbmVzID0gY2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBjaCArIHRoaXMuX2lucHV0O1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMueXl0ZXh0LnN1YnN0cigwLCB0aGlzLnl5dGV4dC5sZW5ndGggLSBsZW4pO1xuICAgICAgICB0aGlzLm9mZnNldCAtPSBsZW47XG4gICAgICAgIHZhciBvbGRMaW5lcyA9IHRoaXMubWF0Y2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5tYXRjaCA9IHRoaXMubWF0Y2guc3Vic3RyKDAsIHRoaXMubWF0Y2gubGVuZ3RoIC0gMSk7XG4gICAgICAgIHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2hlZC5zdWJzdHIoMCwgdGhpcy5tYXRjaGVkLmxlbmd0aCAtIDEpO1xuICAgICAgICBpZiAobGluZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gLT0gbGluZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgciA9IHRoaXMueXlsbG9jLnJhbmdlO1xuICAgICAgICB0aGlzLnl5bGxvYyA9IHtcbiAgICAgICAgICBmaXJzdF9saW5lOiB0aGlzLnl5bGxvYy5maXJzdF9saW5lLFxuICAgICAgICAgIGxhc3RfbGluZTogdGhpcy55eWxpbmVubyArIDEsXG4gICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gKGxpbmVzLmxlbmd0aCA9PT0gb2xkTGluZXMubGVuZ3RoID8gdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uIDogMCkgKyBvbGRMaW5lc1tvbGRMaW5lcy5sZW5ndGggLSBsaW5lcy5sZW5ndGhdLmxlbmd0aCAtIGxpbmVzWzBdLmxlbmd0aCA6IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbiAtIGxlblxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlID0gW3JbMF0sIHJbMF0gKyB0aGlzLnl5bGVuZyAtIGxlbl07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy55eWxlbmcgPSB0aGlzLnl5dGV4dC5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJ1bnB1dFwiKSxcbiAgICAgIC8vIFdoZW4gY2FsbGVkIGZyb20gYWN0aW9uLCBjYWNoZXMgbWF0Y2hlZCB0ZXh0IGFuZCBhcHBlbmRzIGl0IG9uIG5leHQgYWN0aW9uXG4gICAgICBtb3JlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9tb3JlID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcIm1vcmVcIiksXG4gICAgICAvLyBXaGVuIGNhbGxlZCBmcm9tIGFjdGlvbiwgc2lnbmFscyB0aGUgbGV4ZXIgdGhhdCB0aGlzIHJ1bGUgZmFpbHMgdG8gbWF0Y2ggdGhlIGlucHV0LCBzbyB0aGUgbmV4dCBtYXRjaGluZyBydWxlIChyZWdleCkgc2hvdWxkIGJlIHRlc3RlZCBpbnN0ZWFkLlxuICAgICAgcmVqZWN0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2t0cmFja19sZXhlcikge1xuICAgICAgICAgIHRoaXMuX2JhY2t0cmFjayA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gWW91IGNhbiBvbmx5IGludm9rZSByZWplY3QoKSBpbiB0aGUgbGV4ZXIgd2hlbiB0aGUgbGV4ZXIgaXMgb2YgdGhlIGJhY2t0cmFja2luZyBwZXJzdWFzaW9uIChvcHRpb25zLmJhY2t0cmFja19sZXhlciA9IHRydWUpLlxcblwiICsgdGhpcy5zaG93UG9zaXRpb24oKSwge1xuICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgIHRva2VuOiBudWxsLFxuICAgICAgICAgICAgbGluZTogdGhpcy55eWxpbmVub1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJyZWplY3RcIiksXG4gICAgICAvLyByZXRhaW4gZmlyc3QgbiBjaGFyYWN0ZXJzIG9mIHRoZSBtYXRjaFxuICAgICAgbGVzczogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihuKSB7XG4gICAgICAgIHRoaXMudW5wdXQodGhpcy5tYXRjaC5zbGljZShuKSk7XG4gICAgICB9LCBcImxlc3NcIiksXG4gICAgICAvLyBkaXNwbGF5cyBhbHJlYWR5IG1hdGNoZWQgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICBwYXN0SW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwYXN0ID0gdGhpcy5tYXRjaGVkLnN1YnN0cigwLCB0aGlzLm1hdGNoZWQubGVuZ3RoIC0gdGhpcy5tYXRjaC5sZW5ndGgpO1xuICAgICAgICByZXR1cm4gKHBhc3QubGVuZ3RoID4gMjAgPyBcIi4uLlwiIDogXCJcIikgKyBwYXN0LnN1YnN0cigtMjApLnJlcGxhY2UoL1xcbi9nLCBcIlwiKTtcbiAgICAgIH0sIFwicGFzdElucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdXBjb21pbmcgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICB1cGNvbWluZ0lucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV4dCA9IHRoaXMubWF0Y2g7XG4gICAgICAgIGlmIChuZXh0Lmxlbmd0aCA8IDIwKSB7XG4gICAgICAgICAgbmV4dCArPSB0aGlzLl9pbnB1dC5zdWJzdHIoMCwgMjAgLSBuZXh0Lmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChuZXh0LnN1YnN0cigwLCAyMCkgKyAobmV4dC5sZW5ndGggPiAyMCA/IFwiLi4uXCIgOiBcIlwiKSkucmVwbGFjZSgvXFxuL2csIFwiXCIpO1xuICAgICAgfSwgXCJ1cGNvbWluZ0lucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdGhlIGNoYXJhY3RlciBwb3NpdGlvbiB3aGVyZSB0aGUgbGV4aW5nIGVycm9yIG9jY3VycmVkLCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgc2hvd1Bvc2l0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJlID0gdGhpcy5wYXN0SW5wdXQoKTtcbiAgICAgICAgdmFyIGMgPSBuZXcgQXJyYXkocHJlLmxlbmd0aCArIDEpLmpvaW4oXCItXCIpO1xuICAgICAgICByZXR1cm4gcHJlICsgdGhpcy51cGNvbWluZ0lucHV0KCkgKyBcIlxcblwiICsgYyArIFwiXlwiO1xuICAgICAgfSwgXCJzaG93UG9zaXRpb25cIiksXG4gICAgICAvLyB0ZXN0IHRoZSBsZXhlZCB0b2tlbjogcmV0dXJuIEZBTFNFIHdoZW4gbm90IGEgbWF0Y2gsIG90aGVyd2lzZSByZXR1cm4gdG9rZW5cbiAgICAgIHRlc3RfbWF0Y2g6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obWF0Y2gsIGluZGV4ZWRfcnVsZSkge1xuICAgICAgICB2YXIgdG9rZW4sIGxpbmVzLCBiYWNrdXA7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFja3RyYWNrX2xleGVyKSB7XG4gICAgICAgICAgYmFja3VwID0ge1xuICAgICAgICAgICAgeXlsaW5lbm86IHRoaXMueXlsaW5lbm8sXG4gICAgICAgICAgICB5eWxsb2M6IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogdGhpcy55eWxsb2MuZmlyc3RfbGluZSxcbiAgICAgICAgICAgICAgbGFzdF9saW5lOiB0aGlzLmxhc3RfbGluZSxcbiAgICAgICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgICAgIGxhc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHl5dGV4dDogdGhpcy55eXRleHQsXG4gICAgICAgICAgICBtYXRjaDogdGhpcy5tYXRjaCxcbiAgICAgICAgICAgIG1hdGNoZXM6IHRoaXMubWF0Y2hlcyxcbiAgICAgICAgICAgIG1hdGNoZWQ6IHRoaXMubWF0Y2hlZCxcbiAgICAgICAgICAgIHl5bGVuZzogdGhpcy55eWxlbmcsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgX21vcmU6IHRoaXMuX21vcmUsXG4gICAgICAgICAgICBfaW5wdXQ6IHRoaXMuX2lucHV0LFxuICAgICAgICAgICAgeXk6IHRoaXMueXksXG4gICAgICAgICAgICBjb25kaXRpb25TdGFjazogdGhpcy5jb25kaXRpb25TdGFjay5zbGljZSgwKSxcbiAgICAgICAgICAgIGRvbmU6IHRoaXMuZG9uZVxuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICAgIGJhY2t1cC55eWxsb2MucmFuZ2UgPSB0aGlzLnl5bGxvYy5yYW5nZS5zbGljZSgwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMgPSBtYXRjaFswXS5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gKz0gbGluZXMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueXlsbG9jID0ge1xuICAgICAgICAgIGZpcnN0X2xpbmU6IHRoaXMueXlsbG9jLmxhc3RfbGluZSxcbiAgICAgICAgICBsYXN0X2xpbmU6IHRoaXMueXlsaW5lbm8gKyAxLFxuICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubGVuZ3RoIC0gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubWF0Y2goL1xccj9cXG4/LylbMF0ubGVuZ3RoIDogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4gKyBtYXRjaFswXS5sZW5ndGhcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy55eXRleHQgKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2ggKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2hlcyA9IG1hdGNoO1xuICAgICAgICB0aGlzLnl5bGVuZyA9IHRoaXMueXl0ZXh0Lmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZSA9IFt0aGlzLm9mZnNldCwgdGhpcy5vZmZzZXQgKz0gdGhpcy55eWxlbmddO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX21vcmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fYmFja3RyYWNrID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2lucHV0ID0gdGhpcy5faW5wdXQuc2xpY2UobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IG1hdGNoWzBdO1xuICAgICAgICB0b2tlbiA9IHRoaXMucGVyZm9ybUFjdGlvbi5jYWxsKHRoaXMsIHRoaXMueXksIHRoaXMsIGluZGV4ZWRfcnVsZSwgdGhpcy5jb25kaXRpb25TdGFja1t0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgaWYgKHRoaXMuZG9uZSAmJiB0aGlzLl9pbnB1dCkge1xuICAgICAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9iYWNrdHJhY2spIHtcbiAgICAgICAgICBmb3IgKHZhciBrIGluIGJhY2t1cCkge1xuICAgICAgICAgICAgdGhpc1trXSA9IGJhY2t1cFtrXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sIFwidGVzdF9tYXRjaFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIGluIGlucHV0XG4gICAgICBuZXh0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuRU9GO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5faW5wdXQpIHtcbiAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0b2tlbiwgbWF0Y2gsIHRlbXBNYXRjaCwgaW5kZXg7XG4gICAgICAgIGlmICghdGhpcy5fbW9yZSkge1xuICAgICAgICAgIHRoaXMueXl0ZXh0ID0gXCJcIjtcbiAgICAgICAgICB0aGlzLm1hdGNoID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcnVsZXMgPSB0aGlzLl9jdXJyZW50UnVsZXMoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRlbXBNYXRjaCA9IHRoaXMuX2lucHV0Lm1hdGNoKHRoaXMucnVsZXNbcnVsZXNbaV1dKTtcbiAgICAgICAgICBpZiAodGVtcE1hdGNoICYmICghbWF0Y2ggfHwgdGVtcE1hdGNoWzBdLmxlbmd0aCA+IG1hdGNoWzBdLmxlbmd0aCkpIHtcbiAgICAgICAgICAgIG1hdGNoID0gdGVtcE1hdGNoO1xuICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIpIHtcbiAgICAgICAgICAgICAgdG9rZW4gPSB0aGlzLnRlc3RfbWF0Y2godGVtcE1hdGNoLCBydWxlc1tpXSk7XG4gICAgICAgICAgICAgIGlmICh0b2tlbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmFja3RyYWNrKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMub3B0aW9ucy5mbGV4KSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICB0b2tlbiA9IHRoaXMudGVzdF9tYXRjaChtYXRjaCwgcnVsZXNbaW5kZXhdKTtcbiAgICAgICAgICBpZiAodG9rZW4gIT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5faW5wdXQgPT09IFwiXCIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5FT0Y7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gVW5yZWNvZ25pemVkIHRleHQuXFxuXCIgKyB0aGlzLnNob3dQb3NpdGlvbigpLCB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgdG9rZW46IG51bGwsXG4gICAgICAgICAgICBsaW5lOiB0aGlzLnl5bGluZW5vXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibmV4dFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIHRoYXQgaGFzIGEgdG9rZW5cbiAgICAgIGxleDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBsZXgoKSB7XG4gICAgICAgIHZhciByID0gdGhpcy5uZXh0KCk7XG4gICAgICAgIGlmIChyKSB7XG4gICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubGV4KCk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibGV4XCIpLFxuICAgICAgLy8gYWN0aXZhdGVzIGEgbmV3IGxleGVyIGNvbmRpdGlvbiBzdGF0ZSAocHVzaGVzIHRoZSBuZXcgbGV4ZXIgY29uZGl0aW9uIHN0YXRlIG9udG8gdGhlIGNvbmRpdGlvbiBzdGFjaylcbiAgICAgIGJlZ2luOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGJlZ2luKGNvbmRpdGlvbikge1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrLnB1c2goY29uZGl0aW9uKTtcbiAgICAgIH0sIFwiYmVnaW5cIiksXG4gICAgICAvLyBwb3AgdGhlIHByZXZpb3VzbHkgYWN0aXZlIGxleGVyIGNvbmRpdGlvbiBzdGF0ZSBvZmYgdGhlIGNvbmRpdGlvbiBzdGFja1xuICAgICAgcG9wU3RhdGU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcG9wU3RhdGUoKSB7XG4gICAgICAgIHZhciBuID0gdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxO1xuICAgICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFjay5wb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1swXTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwb3BTdGF0ZVwiKSxcbiAgICAgIC8vIHByb2R1Y2UgdGhlIGxleGVyIHJ1bGUgc2V0IHdoaWNoIGlzIGFjdGl2ZSBmb3IgdGhlIGN1cnJlbnRseSBhY3RpdmUgbGV4ZXIgY29uZGl0aW9uIHN0YXRlXG4gICAgICBfY3VycmVudFJ1bGVzOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIF9jdXJyZW50UnVsZXMoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAmJiB0aGlzLmNvbmRpdGlvblN0YWNrW3RoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25zW3RoaXMuY29uZGl0aW9uU3RhY2tbdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxXV0ucnVsZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uc1tcIklOSVRJQUxcIl0ucnVsZXM7XG4gICAgICAgIH1cbiAgICAgIH0sIFwiX2N1cnJlbnRSdWxlc1wiKSxcbiAgICAgIC8vIHJldHVybiB0aGUgY3VycmVudGx5IGFjdGl2ZSBsZXhlciBjb25kaXRpb24gc3RhdGU7IHdoZW4gYW4gaW5kZXggYXJndW1lbnQgaXMgcHJvdmlkZWQgaXQgcHJvZHVjZXMgdGhlIE4tdGggcHJldmlvdXMgY29uZGl0aW9uIHN0YXRlLCBpZiBhdmFpbGFibGVcbiAgICAgIHRvcFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHRvcFN0YXRlKG4pIHtcbiAgICAgICAgbiA9IHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMSAtIE1hdGguYWJzKG4gfHwgMCk7XG4gICAgICAgIGlmIChuID49IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1tuXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gXCJJTklUSUFMXCI7XG4gICAgICAgIH1cbiAgICAgIH0sIFwidG9wU3RhdGVcIiksXG4gICAgICAvLyBhbGlhcyBmb3IgYmVnaW4oY29uZGl0aW9uKVxuICAgICAgcHVzaFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHB1c2hTdGF0ZShjb25kaXRpb24pIHtcbiAgICAgICAgdGhpcy5iZWdpbihjb25kaXRpb24pO1xuICAgICAgfSwgXCJwdXNoU3RhdGVcIiksXG4gICAgICAvLyByZXR1cm4gdGhlIG51bWJlciBvZiBzdGF0ZXMgY3VycmVudGx5IG9uIHRoZSBzdGFja1xuICAgICAgc3RhdGVTdGFja1NpemU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gc3RhdGVTdGFja1NpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aDtcbiAgICAgIH0sIFwic3RhdGVTdGFja1NpemVcIiksXG4gICAgICBvcHRpb25zOiB7IFwiY2FzZS1pbnNlbnNpdGl2ZVwiOiB0cnVlIH0sXG4gICAgICBwZXJmb3JtQWN0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGFub255bW91cyh5eSwgeXlfLCAkYXZvaWRpbmdfbmFtZV9jb2xsaXNpb25zLCBZWV9TVEFSVCkge1xuICAgICAgICB2YXIgWVlTVEFURSA9IFlZX1NUQVJUO1xuICAgICAgICBzd2l0Y2ggKCRhdm9pZGluZ19uYW1lX2NvbGxpc2lvbnMpIHtcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcImNzdlwiKTtcbiAgICAgICAgICAgIHJldHVybiA0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJjc3ZcIik7XG4gICAgICAgICAgICByZXR1cm4gNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiAxMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiA1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIDEyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJlc2NhcGVkX3RleHRcIik7XG4gICAgICAgICAgICByZXR1cm4gMTg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICByZXR1cm4gMjA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKFwiZXNjYXBlZF90ZXh0XCIpO1xuICAgICAgICAgICAgcmV0dXJuIDE4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgcmV0dXJuIDE5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0sIFwiYW5vbnltb3VzXCIpLFxuICAgICAgcnVsZXM6IFsvXig/OnNhbmtleS1iZXRhXFxiKS9pLCAvXig/OnNhbmtleVxcYikvaSwgL14oPzokKS9pLCAvXig/OigoXFx1MDAwRFxcdTAwMEEpfChcXHUwMDBBKSkpL2ksIC9eKD86KFxcdTAwMkMpKS9pLCAvXig/OihcXHUwMDIyKSkvaSwgL14oPzooW1xcdTAwMjAtXFx1MDAyMVxcdTAwMjMtXFx1MDAyQlxcdTAwMkQtXFx1MDA3RV0pKikvaSwgL14oPzooXFx1MDAyMikoPyEoXFx1MDAyMikpKS9pLCAvXig/OigoW1xcdTAwMjAtXFx1MDAyMVxcdTAwMjMtXFx1MDAyQlxcdTAwMkQtXFx1MDA3RV0pfChcXHUwMDJDKXwoXFx1MDAwRCl8KFxcdTAwMEEpfChcXHUwMDIyKShcXHUwMDIyKSkqKS9pXSxcbiAgICAgIGNvbmRpdGlvbnM6IHsgXCJjc3ZcIjogeyBcInJ1bGVzXCI6IFsyLCAzLCA0LCA1LCA2LCA3LCA4XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJlc2NhcGVkX3RleHRcIjogeyBcInJ1bGVzXCI6IFs3LCA4XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJJTklUSUFMXCI6IHsgXCJydWxlc1wiOiBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOF0sIFwiaW5jbHVzaXZlXCI6IHRydWUgfSB9XG4gICAgfTtcbiAgICByZXR1cm4gbGV4ZXIyO1xuICB9KSgpO1xuICBwYXJzZXIyLmxleGVyID0gbGV4ZXI7XG4gIGZ1bmN0aW9uIFBhcnNlcigpIHtcbiAgICB0aGlzLnl5ID0ge307XG4gIH1cbiAgX19uYW1lKFBhcnNlciwgXCJQYXJzZXJcIik7XG4gIFBhcnNlci5wcm90b3R5cGUgPSBwYXJzZXIyO1xuICBwYXJzZXIyLlBhcnNlciA9IFBhcnNlcjtcbiAgcmV0dXJuIG5ldyBQYXJzZXIoKTtcbn0pKCk7XG5wYXJzZXIucGFyc2VyID0gcGFyc2VyO1xudmFyIHNhbmtleV9kZWZhdWx0ID0gcGFyc2VyO1xuXG4vLyBzcmMvZGlhZ3JhbXMvc2Fua2V5L3NhbmtleURCLnRzXG52YXIgbGlua3MgPSBbXTtcbnZhciBub2RlcyA9IFtdO1xudmFyIG5vZGVzTWFwID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbnZhciBjbGVhcjIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCgpID0+IHtcbiAgbGlua3MgPSBbXTtcbiAgbm9kZXMgPSBbXTtcbiAgbm9kZXNNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICBjbGVhcigpO1xufSwgXCJjbGVhclwiKTtcbnZhciBTYW5rZXlMaW5rID0gY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcihzb3VyY2UsIHRhcmdldCwgdmFsdWUgPSAwKSB7XG4gICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICB9XG4gIHN0YXRpYyB7XG4gICAgX19uYW1lKHRoaXMsIFwiU2Fua2V5TGlua1wiKTtcbiAgfVxufTtcbnZhciBhZGRMaW5rID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoc291cmNlLCB0YXJnZXQsIHZhbHVlKSA9PiB7XG4gIGxpbmtzLnB1c2gobmV3IFNhbmtleUxpbmsoc291cmNlLCB0YXJnZXQsIHZhbHVlKSk7XG59LCBcImFkZExpbmtcIik7XG52YXIgU2Fua2V5Tm9kZSA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoSUQpIHtcbiAgICB0aGlzLklEID0gSUQ7XG4gIH1cbiAgc3RhdGljIHtcbiAgICBfX25hbWUodGhpcywgXCJTYW5rZXlOb2RlXCIpO1xuICB9XG59O1xudmFyIGZpbmRPckNyZWF0ZU5vZGUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChJRCkgPT4ge1xuICBJRCA9IGNvbW1vbl9kZWZhdWx0LnNhbml0aXplVGV4dChJRCwgZ2V0Q29uZmlnKCkpO1xuICBsZXQgbm9kZSA9IG5vZGVzTWFwLmdldChJRCk7XG4gIGlmIChub2RlID09PSB2b2lkIDApIHtcbiAgICBub2RlID0gbmV3IFNhbmtleU5vZGUoSUQpO1xuICAgIG5vZGVzTWFwLnNldChJRCwgbm9kZSk7XG4gICAgbm9kZXMucHVzaChub2RlKTtcbiAgfVxuICByZXR1cm4gbm9kZTtcbn0sIFwiZmluZE9yQ3JlYXRlTm9kZVwiKTtcbnZhciBnZXROb2RlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKCkgPT4gbm9kZXMsIFwiZ2V0Tm9kZXNcIik7XG52YXIgZ2V0TGlua3MgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCgpID0+IGxpbmtzLCBcImdldExpbmtzXCIpO1xudmFyIGdldEdyYXBoID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiAoe1xuICBub2Rlczogbm9kZXMubWFwKChub2RlKSA9PiAoeyBpZDogbm9kZS5JRCB9KSksXG4gIGxpbmtzOiBsaW5rcy5tYXAoKGxpbmspID0+ICh7XG4gICAgc291cmNlOiBsaW5rLnNvdXJjZS5JRCxcbiAgICB0YXJnZXQ6IGxpbmsudGFyZ2V0LklELFxuICAgIHZhbHVlOiBsaW5rLnZhbHVlXG4gIH0pKVxufSksIFwiZ2V0R3JhcGhcIik7XG52YXIgc2Fua2V5REJfZGVmYXVsdCA9IHtcbiAgbm9kZXNNYXAsXG4gIGdldENvbmZpZzogLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiBnZXRDb25maWcoKS5zYW5rZXksIFwiZ2V0Q29uZmlnXCIpLFxuICBnZXROb2RlcyxcbiAgZ2V0TGlua3MsXG4gIGdldEdyYXBoLFxuICBhZGRMaW5rLFxuICBmaW5kT3JDcmVhdGVOb2RlLFxuICBnZXRBY2NUaXRsZSxcbiAgc2V0QWNjVGl0bGUsXG4gIGdldEFjY0Rlc2NyaXB0aW9uLFxuICBzZXRBY2NEZXNjcmlwdGlvbixcbiAgZ2V0RGlhZ3JhbVRpdGxlLFxuICBzZXREaWFncmFtVGl0bGUsXG4gIGNsZWFyOiBjbGVhcjJcbn07XG5cbi8vIHNyYy9kaWFncmFtcy9zYW5rZXkvc2Fua2V5UmVuZGVyZXIudHNcbmltcG9ydCB7XG4gIHNlbGVjdCBhcyBkM3NlbGVjdCxcbiAgc2NhbGVPcmRpbmFsIGFzIGQzc2NhbGVPcmRpbmFsLFxuICBzY2hlbWVUYWJsZWF1MTAgYXMgZDNzY2hlbWVUYWJsZWF1MTBcbn0gZnJvbSBcImQzXCI7XG5pbXBvcnQge1xuICBzYW5rZXkgYXMgZDNTYW5rZXksXG4gIHNhbmtleUxpbmtIb3Jpem9udGFsIGFzIGQzU2Fua2V5TGlua0hvcml6b250YWwsXG4gIHNhbmtleUxlZnQgYXMgZDNTYW5rZXlMZWZ0LFxuICBzYW5rZXlSaWdodCBhcyBkM1NhbmtleVJpZ2h0LFxuICBzYW5rZXlDZW50ZXIgYXMgZDNTYW5rZXlDZW50ZXIsXG4gIHNhbmtleUp1c3RpZnkgYXMgZDNTYW5rZXlKdXN0aWZ5XG59IGZyb20gXCJkMy1zYW5rZXlcIjtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3VpZC50c1xudmFyIFVpZCA9IGNsYXNzIF9VaWQge1xuICBzdGF0aWMge1xuICAgIF9fbmFtZSh0aGlzLCBcIlVpZFwiKTtcbiAgfVxuICBzdGF0aWMge1xuICAgIHRoaXMuY291bnQgPSAwO1xuICB9XG4gIHN0YXRpYyBuZXh0KG5hbWUpIHtcbiAgICByZXR1cm4gbmV3IF9VaWQobmFtZSArICsrX1VpZC5jb3VudCk7XG4gIH1cbiAgY29uc3RydWN0b3IoaWQpIHtcbiAgICB0aGlzLmlkID0gaWQ7XG4gICAgdGhpcy5ocmVmID0gYCMke2lkfWA7XG4gIH1cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIFwidXJsKFwiICsgdGhpcy5ocmVmICsgXCIpXCI7XG4gIH1cbn07XG5cbi8vIHNyYy9kaWFncmFtcy9zYW5rZXkvc2Fua2V5UmVuZGVyZXIudHNcbnZhciBhbGlnbm1lbnRzTWFwID0ge1xuICBsZWZ0OiBkM1NhbmtleUxlZnQsXG4gIHJpZ2h0OiBkM1NhbmtleVJpZ2h0LFxuICBjZW50ZXI6IGQzU2Fua2V5Q2VudGVyLFxuICBqdXN0aWZ5OiBkM1NhbmtleUp1c3RpZnlcbn07XG52YXIgZmluZENlbnRyYWxOb2RlTGF5ZXIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChub2RlczIpID0+IHtcbiAgbGV0IG1heFZhbHVlID0gMDtcbiAgbGV0IGNlbnRyYWxMYXllciA9IDA7XG4gIGZvciAoY29uc3Qgbm9kZSBvZiBub2RlczIpIHtcbiAgICBjb25zdCB2YWx1ZSA9IG5vZGUudmFsdWUgPz8gMDtcbiAgICBpZiAodmFsdWUgPiBtYXhWYWx1ZSkge1xuICAgICAgbWF4VmFsdWUgPSB2YWx1ZTtcbiAgICAgIGNlbnRyYWxMYXllciA9IG5vZGUubGF5ZXIgPz8gMDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNlbnRyYWxMYXllcjtcbn0sIFwiZmluZENlbnRyYWxOb2RlTGF5ZXJcIik7XG52YXIgZHJhdyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24odGV4dCwgaWQsIF92ZXJzaW9uLCBkaWFnT2JqKSB7XG4gIGNvbnN0IHsgc2VjdXJpdHlMZXZlbCwgc2Fua2V5OiBjb25mIH0gPSBnZXRDb25maWcoKTtcbiAgY29uc3QgZGVmYXVsdFNhbmtleUNvbmZpZyA9IGRlZmF1bHRDb25maWcuc2Fua2V5O1xuICBsZXQgc2FuZGJveEVsZW1lbnQ7XG4gIGlmIChzZWN1cml0eUxldmVsID09PSBcInNhbmRib3hcIikge1xuICAgIHNhbmRib3hFbGVtZW50ID0gZDNzZWxlY3QoXCIjaVwiICsgaWQpO1xuICB9XG4gIGNvbnN0IHJvb3QgPSBzZWN1cml0eUxldmVsID09PSBcInNhbmRib3hcIiA/IGQzc2VsZWN0KHNhbmRib3hFbGVtZW50Lm5vZGVzKClbMF0uY29udGVudERvY3VtZW50LmJvZHkpIDogZDNzZWxlY3QoXCJib2R5XCIpO1xuICBjb25zdCBzdmcgPSBzZWN1cml0eUxldmVsID09PSBcInNhbmRib3hcIiA/IHJvb3Quc2VsZWN0KGBbaWQ9XCIke2lkfVwiXWApIDogZDNzZWxlY3QoYFtpZD1cIiR7aWR9XCJdYCk7XG4gIGNvbnN0IHdpZHRoID0gY29uZj8ud2lkdGggPz8gZGVmYXVsdFNhbmtleUNvbmZpZy53aWR0aDtcbiAgY29uc3QgaGVpZ2h0ID0gY29uZj8uaGVpZ2h0ID8/IGRlZmF1bHRTYW5rZXlDb25maWcud2lkdGg7XG4gIGNvbnN0IHVzZU1heFdpZHRoID0gY29uZj8udXNlTWF4V2lkdGggPz8gZGVmYXVsdFNhbmtleUNvbmZpZy51c2VNYXhXaWR0aDtcbiAgY29uc3Qgbm9kZUFsaWdubWVudCA9IGNvbmY/Lm5vZGVBbGlnbm1lbnQgPz8gZGVmYXVsdFNhbmtleUNvbmZpZy5ub2RlQWxpZ25tZW50O1xuICBjb25zdCBwcmVmaXggPSBjb25mPy5wcmVmaXggPz8gZGVmYXVsdFNhbmtleUNvbmZpZy5wcmVmaXg7XG4gIGNvbnN0IHN1ZmZpeCA9IGNvbmY/LnN1ZmZpeCA/PyBkZWZhdWx0U2Fua2V5Q29uZmlnLnN1ZmZpeDtcbiAgY29uc3Qgc2hvd1ZhbHVlcyA9IGNvbmY/LnNob3dWYWx1ZXMgPz8gZGVmYXVsdFNhbmtleUNvbmZpZy5zaG93VmFsdWVzO1xuICBjb25zdCBub2RlV2lkdGggPSBjb25mPy5ub2RlV2lkdGggPz8gZGVmYXVsdFNhbmtleUNvbmZpZy5ub2RlV2lkdGggPz8gMTA7XG4gIGNvbnN0IG5vZGVQYWRkaW5nID0gY29uZj8ubm9kZVBhZGRpbmcgPz8gZGVmYXVsdFNhbmtleUNvbmZpZy5ub2RlUGFkZGluZyA/PyAxMjtcbiAgY29uc3QgbGFiZWxTdHlsZSA9IGNvbmY/LmxhYmVsU3R5bGUgPz8gZGVmYXVsdFNhbmtleUNvbmZpZy5sYWJlbFN0eWxlID8/IFwibGVnYWN5XCI7XG4gIGNvbnN0IG5vZGVDb2xvcnMgPSBjb25mPy5ub2RlQ29sb3JzID8/IHt9O1xuICBjb25zdCBncmFwaCA9IGRpYWdPYmouZGIuZ2V0R3JhcGgoKTtcbiAgY29uc3Qgbm9kZUFsaWduID0gYWxpZ25tZW50c01hcFtub2RlQWxpZ25tZW50XTtcbiAgY29uc3Qgc2Fua2V5ID0gZDNTYW5rZXkoKS5ub2RlSWQoKGQpID0+IGQuaWQpLm5vZGVXaWR0aChub2RlV2lkdGgpLm5vZGVQYWRkaW5nKG5vZGVQYWRkaW5nICsgKHNob3dWYWx1ZXMgPyAxNSA6IDApKS5ub2RlQWxpZ24obm9kZUFsaWduKS5leHRlbnQoW1xuICAgIFswLCAwXSxcbiAgICBbd2lkdGgsIGhlaWdodF1cbiAgXSk7XG4gIHNhbmtleShncmFwaCk7XG4gIGNvbnN0IGNlbnRyYWxOb2RlTGF5ZXIgPSBmaW5kQ2VudHJhbE5vZGVMYXllcihncmFwaC5ub2Rlcyk7XG4gIGNvbnN0IGNvbG9yU2NoZW1lID0gZDNzY2FsZU9yZGluYWwoZDNzY2hlbWVUYWJsZWF1MTApO1xuICBjb25zdCBnZXROb2RlQ29sb3IgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChub2RlSWQpID0+IHtcbiAgICByZXR1cm4gbm9kZUNvbG9yc1tub2RlSWRdID8/IGNvbG9yU2NoZW1lKG5vZGVJZCk7XG4gIH0sIFwiZ2V0Tm9kZUNvbG9yXCIpO1xuICBzdmcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJub2Rlc1wiKS5zZWxlY3RBbGwoXCIubm9kZVwiKS5kYXRhKGdyYXBoLm5vZGVzKS5qb2luKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJub2RlXCIpLmF0dHIoXCJpZFwiLCAoZCkgPT4gKGQudWlkID0gVWlkLm5leHQoXCJub2RlLVwiKSkuaWQpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBcInRyYW5zbGF0ZShcIiArIGQueDAgKyBcIixcIiArIGQueTAgKyBcIilcIjtcbiAgfSkuYXR0cihcInhcIiwgKGQpID0+IGQueDApLmF0dHIoXCJ5XCIsIChkKSA9PiBkLnkwKS5hcHBlbmQoXCJyZWN0XCIpLmF0dHIoXCJoZWlnaHRcIiwgKGQpID0+IHtcbiAgICByZXR1cm4gZC55MSAtIGQueTA7XG4gIH0pLmF0dHIoXCJ3aWR0aFwiLCAoZCkgPT4gZC54MSAtIGQueDApLmF0dHIoXCJmaWxsXCIsIChkKSA9PiBnZXROb2RlQ29sb3IoZC5pZCkpO1xuICBjb25zdCBnZXRUZXh0ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoeyBpZDogaWQyLCB2YWx1ZSB9KSA9PiB7XG4gICAgaWYgKCFzaG93VmFsdWVzKSB7XG4gICAgICByZXR1cm4gaWQyO1xuICAgIH1cbiAgICByZXR1cm4gYCR7aWQyfVxuJHtwcmVmaXh9JHtNYXRoLnJvdW5kKHZhbHVlICogMTAwKSAvIDEwMH0ke3N1ZmZpeH1gO1xuICB9LCBcImdldFRleHRcIik7XG4gIGNvbnN0IGdldExhYmVsUG9zaXRpb24gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChkKSA9PiB7XG4gICAgaWYgKGxhYmVsU3R5bGUgPT09IFwib3V0bGluZWRcIikge1xuICAgICAgY29uc3Qgbm9kZUxheWVyID0gZC5sYXllciA/PyAwO1xuICAgICAgaWYgKG5vZGVMYXllciA8IGNlbnRyYWxOb2RlTGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuIHsgeDogZC54MCAtIDYsIGFuY2hvcjogXCJlbmRcIiB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgeDogZC54MSArIDYsIGFuY2hvcjogXCJzdGFydFwiIH07XG4gICAgfVxuICAgIGlmIChkLngwIDwgd2lkdGggLyAyKSB7XG4gICAgICByZXR1cm4geyB4OiBkLngxICsgNiwgYW5jaG9yOiBcInN0YXJ0XCIgfTtcbiAgICB9XG4gICAgcmV0dXJuIHsgeDogZC54MCAtIDYsIGFuY2hvcjogXCJlbmRcIiB9O1xuICB9LCBcImdldExhYmVsUG9zaXRpb25cIik7XG4gIGNvbnN0IGxhYmVsc0dyb3VwID0gc3ZnLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwibm9kZS1sYWJlbHNcIikuYXR0cihcImZvbnQtc2l6ZVwiLCAxNCk7XG4gIGNvbnN0IGFwcGVuZExhYmVsID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoY2xhc3NOYW1lKSA9PiBsYWJlbHNHcm91cC5zZWxlY3RBbGwoY2xhc3NOYW1lID8gYC4ke2NsYXNzTmFtZX1gIDogXCJ0ZXh0XCIpLmRhdGEoZ3JhcGgubm9kZXMpLmpvaW4oXCJ0ZXh0XCIpLmF0dHIoXCJjbGFzc1wiLCBjbGFzc05hbWUgPz8gbnVsbCkuYXR0cihcInhcIiwgKGQpID0+IGdldExhYmVsUG9zaXRpb24oZCkueCkuYXR0cihcInlcIiwgKGQpID0+IChkLnkxICsgZC55MCkgLyAyKS5hdHRyKFwiZHlcIiwgYCR7c2hvd1ZhbHVlcyA/IFwiMFwiIDogXCIwLjM1XCJ9ZW1gKS5hdHRyKFwidGV4dC1hbmNob3JcIiwgKGQpID0+IGdldExhYmVsUG9zaXRpb24oZCkuYW5jaG9yKS50ZXh0KGdldFRleHQpLCBcImFwcGVuZExhYmVsXCIpO1xuICBpZiAobGFiZWxTdHlsZSA9PT0gXCJvdXRsaW5lZFwiKSB7XG4gICAgYXBwZW5kTGFiZWwoXCJzYW5rZXktbGFiZWwtYmdcIik7XG4gICAgYXBwZW5kTGFiZWwoXCJzYW5rZXktbGFiZWwtZmdcIik7XG4gIH0gZWxzZSB7XG4gICAgYXBwZW5kTGFiZWwoKTtcbiAgfVxuICBjb25zdCBsaW5rID0gc3ZnLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwibGlua3NcIikuYXR0cihcImZpbGxcIiwgXCJub25lXCIpLmF0dHIoXCJzdHJva2Utb3BhY2l0eVwiLCAwLjUpLnNlbGVjdEFsbChcIi5saW5rXCIpLmRhdGEoZ3JhcGgubGlua3MpLmpvaW4oXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImxpbmtcIikuc3R5bGUoXCJtaXgtYmxlbmQtbW9kZVwiLCBcIm11bHRpcGx5XCIpO1xuICBjb25zdCBsaW5rQ29sb3IgPSBjb25mPy5saW5rQ29sb3IgPz8gXCJncmFkaWVudFwiO1xuICBpZiAobGlua0NvbG9yID09PSBcImdyYWRpZW50XCIpIHtcbiAgICBjb25zdCBncmFkaWVudCA9IGxpbmsuYXBwZW5kKFwibGluZWFyR3JhZGllbnRcIikuYXR0cihcImlkXCIsIChkKSA9PiAoZC51aWQgPSBVaWQubmV4dChcImxpbmVhckdyYWRpZW50LVwiKSkuaWQpLmF0dHIoXCJncmFkaWVudFVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIikuYXR0cihcIngxXCIsIChkKSA9PiBkLnNvdXJjZS54MSkuYXR0cihcIngyXCIsIChkKSA9PiBkLnRhcmdldC54MCk7XG4gICAgZ3JhZGllbnQuYXBwZW5kKFwic3RvcFwiKS5hdHRyKFwib2Zmc2V0XCIsIFwiMCVcIikuYXR0cihcInN0b3AtY29sb3JcIiwgKGQpID0+IGdldE5vZGVDb2xvcihkLnNvdXJjZS5pZCkpO1xuICAgIGdyYWRpZW50LmFwcGVuZChcInN0b3BcIikuYXR0cihcIm9mZnNldFwiLCBcIjEwMCVcIikuYXR0cihcInN0b3AtY29sb3JcIiwgKGQpID0+IGdldE5vZGVDb2xvcihkLnRhcmdldC5pZCkpO1xuICB9XG4gIGxldCBjb2xvcmluZztcbiAgc3dpdGNoIChsaW5rQ29sb3IpIHtcbiAgICBjYXNlIFwiZ3JhZGllbnRcIjpcbiAgICAgIGNvbG9yaW5nID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZCkgPT4gZC51aWQsIFwiY29sb3JpbmdcIik7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwic291cmNlXCI6XG4gICAgICBjb2xvcmluZyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGQpID0+IGdldE5vZGVDb2xvcihkLnNvdXJjZS5pZCksIFwiY29sb3JpbmdcIik7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwidGFyZ2V0XCI6XG4gICAgICBjb2xvcmluZyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGQpID0+IGdldE5vZGVDb2xvcihkLnRhcmdldC5pZCksIFwiY29sb3JpbmdcIik7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgY29sb3JpbmcgPSBsaW5rQ29sb3I7XG4gIH1cbiAgbGluay5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIGQzU2Fua2V5TGlua0hvcml6b250YWwoKSkuYXR0cihcInN0cm9rZVwiLCBjb2xvcmluZykuYXR0cihcInN0cm9rZS13aWR0aFwiLCAoZCkgPT4gTWF0aC5tYXgoMSwgZC53aWR0aCkpO1xuICBzZXR1cEdyYXBoVmlld2JveCh2b2lkIDAsIHN2ZywgMCwgdXNlTWF4V2lkdGgpO1xufSwgXCJkcmF3XCIpO1xudmFyIHNhbmtleVJlbmRlcmVyX2RlZmF1bHQgPSB7XG4gIGRyYXdcbn07XG5cbi8vIHNyYy9kaWFncmFtcy9zYW5rZXkvc2Fua2V5VXRpbHMudHNcbnZhciBwcmVwYXJlVGV4dEZvclBhcnNpbmcgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCh0ZXh0KSA9PiB7XG4gIGNvbnN0IHRleHRUb1BhcnNlID0gdGV4dC5yZXBsYWNlQWxsKC9eW15cXFNcXG5cXHJdK3xbXlxcU1xcblxccl0rJC9nLCBcIlwiKS5yZXBsYWNlQWxsKC8oW1xcblxccl0pKy9nLCBcIlxcblwiKS50cmltKCk7XG4gIHJldHVybiB0ZXh0VG9QYXJzZTtcbn0sIFwicHJlcGFyZVRleHRGb3JQYXJzaW5nXCIpO1xuXG4vLyBzcmMvZGlhZ3JhbXMvc2Fua2V5L3N0eWxlcy5qc1xudmFyIGdldFN0eWxlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKG9wdGlvbnMpID0+IGAubGFiZWwge1xuICAgIGZvbnQtZmFtaWx5OiAke29wdGlvbnMuZm9udEZhbWlseX07XG4gIH1cblxuICAubm9kZS1sYWJlbHMge1xuICAgIGZvbnQtZmFtaWx5OiAke29wdGlvbnMuZm9udEZhbWlseX07XG4gIH1cblxuICAvKiBPdXRsaW5lZCBsYWJlbCBzdHlsZSAtIGJhY2tncm91bmQgc3Ryb2tlIGZvciBiZXR0ZXIgcmVhZGFiaWxpdHkgKi9cbiAgLnNhbmtleS1sYWJlbC1iZyB7XG4gICAgc3Ryb2tlOiAke29wdGlvbnMubWFpbkJrZyB8fCBvcHRpb25zLmJhY2tncm91bmQgfHwgXCIjZmZmXCJ9O1xuICAgIHN0cm9rZS13aWR0aDogNHB4O1xuICAgIHN0cm9rZS1saW5lam9pbjogcm91bmQ7XG4gICAgcGFpbnQtb3JkZXI6IHN0cm9rZTtcbiAgfVxuXG4gIC8qIEZvcmVncm91bmQgbGFiZWwgdGV4dCAqL1xuICAuc2Fua2V5LWxhYmVsLWZnIHtcbiAgICBmaWxsOiAke29wdGlvbnMudGV4dENvbG9yfTtcbiAgfVxuXG4gIC8qIE5vZGUgc3R5bGluZyAqL1xuICAubm9kZSByZWN0IHtcbiAgICBzaGFwZS1yZW5kZXJpbmc6IGNyaXNwRWRnZXM7XG4gIH1cblxuICAvKiBMaW5rIHN0eWxpbmcgKi9cbiAgLmxpbmsge1xuICAgIGZpbGw6IG5vbmU7XG4gICAgc3Ryb2tlLW9wYWNpdHk6IDAuNTtcbiAgICBtaXgtYmxlbmQtbW9kZTogbXVsdGlwbHk7XG4gIH1cbmAsIFwiZ2V0U3R5bGVzXCIpO1xudmFyIHN0eWxlc19kZWZhdWx0ID0gZ2V0U3R5bGVzO1xuXG4vLyBzcmMvZGlhZ3JhbXMvc2Fua2V5L3NhbmtleURpYWdyYW0udHNcbnZhciBvcmlnaW5hbFBhcnNlID0gc2Fua2V5X2RlZmF1bHQucGFyc2UuYmluZChzYW5rZXlfZGVmYXVsdCk7XG5zYW5rZXlfZGVmYXVsdC5wYXJzZSA9ICh0ZXh0KSA9PiBvcmlnaW5hbFBhcnNlKHByZXBhcmVUZXh0Rm9yUGFyc2luZyh0ZXh0KSk7XG52YXIgZGlhZ3JhbSA9IHtcbiAgc3R5bGVzOiBzdHlsZXNfZGVmYXVsdCxcbiAgcGFyc2VyOiBzYW5rZXlfZGVmYXVsdCxcbiAgZGI6IHNhbmtleURCX2RlZmF1bHQsXG4gIHJlbmRlcmVyOiBzYW5rZXlSZW5kZXJlcl9kZWZhdWx0XG59O1xuZXhwb3J0IHtcbiAgZGlhZ3JhbVxufTtcbiIKICBdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLFNBQXdCLEdBQUcsQ0FBQyxRQUFRLFNBQVM7QUFBQSxFQUMzQyxJQUFJO0FBQUEsRUFDSixJQUFJLFlBQVksV0FBVztBQUFBLElBQ3pCLFdBQVcsU0FBUyxRQUFRO0FBQUEsTUFDMUIsSUFBSSxTQUFTLFNBQ0wsT0FBTSxTQUFVLFNBQVEsYUFBYSxTQUFTLFFBQVM7QUFBQSxRQUM3RCxPQUFNO0FBQUEsTUFDUjtBQUFBLElBQ0Y7QUFBQSxFQUNGLEVBQU87QUFBQSxJQUNMLElBQUksUUFBUTtBQUFBLElBQ1osU0FBUyxTQUFTLFFBQVE7QUFBQSxNQUN4QixLQUFLLFFBQVEsUUFBUSxPQUFPLEVBQUUsT0FBTyxNQUFNLE1BQU0sU0FDekMsT0FBTSxTQUFVLFNBQVEsYUFBYSxTQUFTLFFBQVM7QUFBQSxRQUM3RCxPQUFNO0FBQUEsTUFDUjtBQUFBLElBQ0Y7QUFBQTtBQUFBLEVBRUYsT0FBTztBQUFBOztBQ2xCVCxTQUF3QixHQUFHLENBQUMsUUFBUSxTQUFTO0FBQUEsRUFDM0MsSUFBSTtBQUFBLEVBQ0osSUFBSSxZQUFZLFdBQVc7QUFBQSxJQUN6QixXQUFXLFNBQVMsUUFBUTtBQUFBLE1BQzFCLElBQUksU0FBUyxTQUNMLE9BQU0sU0FBVSxTQUFRLGFBQWEsU0FBUyxRQUFTO0FBQUEsUUFDN0QsT0FB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SUFBSSxJQUFJLEdBQUcsR0FBRztBQUFBLElBQzVDLEtBQUssS0FBSyxNQUFPLENBQUMsS0FBTSxNQUFPLENBQUMsS0FBTSxNQUFPLENBQUMsS0FBTSxNQUFPLENBQUMsS0FBTSxPQUFPLEtBQUssTUFBTSxDQUFDLEtBQUssT0FBTyxLQUFLLE1BQU0sQ0FBQztBQUFBO0FBQUEsRUFFL0csT0FBTyxRQUFRLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHO0FBQUEsSUFDakMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDO0FBQUEsSUFDN0MsSUFBSSxLQUFLLEtBQUssS0FDVixLQUFLLEtBQUssS0FDVixNQUFNLEtBQUssSUFDWCxNQUFNLEtBQUssSUFDWCxNQUFNLEtBQUssSUFDWCxNQUFNLEtBQUssSUFDWCxRQUFRLE1BQU0sTUFBTSxNQUFNO0FBQUEsSUFHOUIsSUFBSSxJQUFJO0FBQUEsTUFBRyxNQUFNLElBQUksTUFBTSxzQkFBc0IsQ0FBQztBQUFBLElBR2xELElBQUksS0FBSyxRQUFRLE1BQU07QUFBQSxNQUNyQixLQUFLLEtBQUssT0FBTyxLQUFLLE1BQU0sTUFBTSxPQUFPLEtBQUssTUFBTTtBQUFBLElBQ3RELEVBR0ssU0FBSSxFQUFFLFFBQVE7QUFBQTtBQUFBLElBS2QsU0FBSSxFQUFFLEtBQUssSUFBSSxNQUFNLE1BQU0sTUFBTSxHQUFHLElBQUksWUFBWSxDQUFDLEdBQUc7QUFBQSxNQUMzRCxLQUFLLEtBQUssT0FBTyxLQUFLLE1BQU0sTUFBTSxPQUFPLEtBQUssTUFBTTtBQUFBLElBQ3RELEVBR0s7QUFBQSxNQUNILElBQUksTUFBTSxLQUFLLElBQ1gsTUFBTSxLQUFLLElBQ1gsUUFBUSxNQUFNLE1BQU0sTUFBTSxLQUMxQixRQUFRLE1BQU0sTUFBTSxNQUFNLEtBQzFCLE1BQU0sS0FBSyxLQUFLLEtBQUssR0FDckIsTUFBTSxLQUFLLEtBQUssS0FBSyxHQUNyQixJQUFJLElBQUksS0FBSyxLQUFL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LGFBQWEsRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUFBLEVBQ3BHO0FBQUEsRUFDQSxJQUFJO0FBQUEsRUFDSixRQUFRO0FBQUEsU0FDRDtBQUFBLE1BQ0gsMkJBQTJCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxVQUFVO0FBQUEsTUFDMUQ7QUFBQSxTQUNHO0FBQUEsTUFDSCwyQkFBMkIsT0FBTyxDQUFDLE1BQU0sYUFBYSxFQUFFLE9BQU8sRUFBRSxHQUFHLFVBQVU7QUFBQSxNQUM5RTtBQUFBLFNBQ0c7QUFBQSxNQUNILDJCQUEyQixPQUFPLENBQUMsTUFBTSxhQUFhLEVBQUUsT0FBTyxFQUFFLEdBQUcsVUFBVTtBQUFBLE1BQzlFO0FBQUE7QUFBQSxNQUVBLFdBQVc7QUFBQTtBQUFBLEVBRWYsTUFBSyxPQUFPLE1BQU0sRUFBRSxLQUFLLEtBQUssNkJBQXVCLENBQUMsRUFBRSxLQUFLLFVBQVUsUUFBUSxFQUFFLEtBQUssZ0JBQWdCLENBQUMsTUFBTSxLQUFLLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQztBQUFBLEVBQ2pJLGtCQUF1QixXQUFHLEtBQUssR0FBRyxXQUFXO0FBQUEsR0FDNUMsTUFBTTtBQUNULElBQUkseUJBQXlCO0FBQUEsRUFDM0I7QUFDRjtBQUdBLElBQUksd0NBQXdDLE9BQU8sQ0FBQyxTQUFTO0FBQUEsRUFDM0QsTUFBTSxjQUFjLEtBQUssV0FBVyw0QkFBNEIsRUFBRSxFQUFFLFdBQVcsY0FBYztBQUFBLENBQUksRUFBRSxLQUFLO0FBQUEsRUFDeEcsT0FBTztBQUFBLEdBQ04sdUJBQXVCO0FBRzFCLElBQUksNEJBQTRCLE9BQU8sQ0FBQyxZQUFZO0FBQUEsbUJBQ2pDLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQSxtQkFJUixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxjQUtiLFFBQVEsV0FBVyxRQUFRLGNBQWM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBUTNDLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEdBY2pCLFdBQVc7QUFDZCxJQUFJLGlCQUFpQjtBQUdyQixJQUFJLGdCQUFnQixlQUFlLE1BQU0sS0FBSyxjQUFjO0FBQzVELGVBQWUsUUFBUSxDQUFDLFNBQVMsY0FBYyxzQkFBc0IsSUFBSSxDQUFDO0FBQzFFLElBQUksVUFBVTtBQUFBLEVBQ1osUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUFBLEVBQ1IsSUFBSTtBQUFBLEVBQ0osVUFBVTtBQUNaOyIsCiAgImRlYnVnSWQiOiAiNTE0NTBFMjREQ0Q1QjIwODY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
