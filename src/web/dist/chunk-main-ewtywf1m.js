import {
  Graph,
  cloneDeep_default,
  constant_default,
  defaults_default,
  filter_default,
  find_default,
  flatten_default,
  forEach_default,
  forIn_default,
  forOwn_default,
  has_default,
  isArray_default,
  isUndefined_default,
  last_default,
  mapValues_default,
  map_default,
  max_default,
  merge_default,
  minBy_default,
  min_default,
  now_default,
  pick_default,
  range_default,
  reduce_default,
  size_default,
  sortBy_default,
  uniqueId_default,
  values_default,
  zipObject_default
} from "./chunk-main-g8v87zdn.js";

// node_modules/dagre-d3-es/src/dagre/util.js
function addDummyNode(g, type, attrs, name) {
  var v;
  do {
    v = uniqueId_default(name);
  } while (g.hasNode(v));
  attrs.dummy = type;
  g.setNode(v, attrs);
  return v;
}
function simplify(g) {
  var simplified = new Graph().setGraph(g.graph());
  forEach_default(g.nodes(), function(v) {
    simplified.setNode(v, g.node(v));
  });
  forEach_default(g.edges(), function(e) {
    var simpleLabel = simplified.edge(e.v, e.w) || { weight: 0, minlen: 1 };
    var label = g.edge(e);
    simplified.setEdge(e.v, e.w, {
      weight: simpleLabel.weight + label.weight,
      minlen: Math.max(simpleLabel.minlen, label.minlen)
    });
  });
  return simplified;
}
function asNonCompoundGraph(g) {
  var simplified = new Graph({ multigraph: g.isMultigraph() }).setGraph(g.graph());
  forEach_default(g.nodes(), function(v) {
    if (!g.children(v).length) {
      simplified.setNode(v, g.node(v));
    }
  });
  forEach_default(g.edges(), function(e) {
    simplified.setEdge(e, g.edge(e));
  });
  return simplified;
}
function intersectRect(rect, point) {
  var x = rect.x;
  var y = rect.y;
  var dx = point.x - x;
  var dy = point.y - y;
  var w = rect.width / 2;
  var h = rect.height / 2;
  if (!dx && !dy) {
    throw new Error("Not possible to find intersection inside of the rectangle");
  }
  var sx, sy;
  if (Math.abs(dy) * w > Math.abs(dx) * h) {
    if (dy < 0) {
      h = -h;
    }
    sx = h * dx / dy;
    sy = h;
  } else {
    if (dx < 0) {
      w = -w;
    }
    sx = w;
    sy = w * dy / dx;
  }
  return { x: x + sx, y: y + sy };
}
function buildLayerMatrix(g) {
  var layering = map_default(range_default(maxRank(g) + 1), function() {
    return [];
  });
  forEach_default(g.nodes(), function(v) {
    var node = g.node(v);
    var rank = node.rank;
    if (!isUndefined_default(rank)) {
      layering[rank][node.order] = v;
    }
  });
  return layering;
}
function normalizeRanks(g) {
  var min = min_default(map_default(g.nodes(), function(v) {
    return g.node(v).rank;
  }));
  forEach_default(g.nodes(), function(v) {
    var node = g.node(v);
    if (has_default(node, "rank")) {
      node.rank -= min;
    }
  });
}
function removeEmptyRanks(g) {
  var offset = min_default(map_default(g.nodes(), function(v) {
    return g.node(v).rank;
  }));
  var layers = [];
  forEach_default(g.nodes(), function(v) {
    var rank = g.node(v).rank - offset;
    if (!layers[rank]) {
      layers[rank] = [];
    }
    layers[rank].push(v);
  });
  var delta = 0;
  var nodeRankFactor = g.graph().nodeRankFactor;
  forEach_default(layers, function(vs, i) {
    if (isUndefined_default(vs) && i % nodeRankFactor !== 0) {
      --delta;
    } else if (delta) {
      forEach_default(vs, function(v) {
        g.node(v).rank += delta;
      });
    }
  });
}
function addBorderNode(g, prefix, rank, order) {
  var node = {
    width: 0,
    height: 0
  };
  if (arguments.length >= 4) {
    node.rank = rank;
    node.order = order;
  }
  return addDummyNode(g, "border", node, prefix);
}
function maxRank(g) {
  return max_default(map_default(g.nodes(), function(v) {
    var rank = g.node(v).rank;
    if (!isUndefined_default(rank)) {
      return rank;
    }
  }));
}
function partition(collection, fn) {
  var result = { lhs: [], rhs: [] };
  forEach_default(collection, function(value) {
    if (fn(value)) {
      result.lhs.push(value);
    } else {
      result.rhs.push(value);
    }
  });
  return result;
}
function time(name, fn) {
  var start = now_default();
  try {
    return fn();
  } finally {
    console.log(name + " time: " + (now_default() - start) + "ms");
  }
}
function notime(name, fn) {
  return fn();
}

// node_modules/dagre-d3-es/src/dagre/add-border-segments.js
function addBorderSegments(g) {
  function dfs(v) {
    var children = g.children(v);
    var node = g.node(v);
    if (children.length) {
      forEach_default(children, dfs);
    }
    if (Object.prototype.hasOwnProperty.call(node, "minRank")) {
      node.borderLeft = [];
      node.borderRight = [];
      for (var rank = node.minRank, maxRank2 = node.maxRank + 1;rank < maxRank2; ++rank) {
        addBorderNode2(g, "borderLeft", "_bl", v, node, rank);
        addBorderNode2(g, "borderRight", "_br", v, node, rank);
      }
    }
  }
  forEach_default(g.children(), dfs);
}
function addBorderNode2(g, prop, prefix, sg, sgNode, rank) {
  var label = { width: 0, height: 0, rank, borderType: prop };
  var prev = sgNode[prop][rank - 1];
  var curr = addDummyNode(g, "border", label, prefix);
  sgNode[prop][rank] = curr;
  g.setParent(curr, sg);
  if (prev) {
    g.setEdge(prev, curr, { weight: 1 });
  }
}

// node_modules/dagre-d3-es/src/dagre/coordinate-system.js
function adjust(g) {
  var rankDir = g.graph().rankdir.toLowerCase();
  if (rankDir === "lr" || rankDir === "rl") {
    swapWidthHeight(g);
  }
}
function undo(g) {
  var rankDir = g.graph().rankdir.toLowerCase();
  if (rankDir === "bt" || rankDir === "rl") {
    reverseY(g);
  }
  if (rankDir === "lr" || rankDir === "rl") {
    swapXY(g);
    swapWidthHeight(g);
  }
}
function swapWidthHeight(g) {
  forEach_default(g.nodes(), function(v) {
    swapWidthHeightOne(g.node(v));
  });
  forEach_default(g.edges(), function(e) {
    swapWidthHeightOne(g.edge(e));
  });
}
function swapWidthHeightOne(attrs) {
  var w = attrs.width;
  attrs.width = attrs.height;
  attrs.height = w;
}
function reverseY(g) {
  forEach_default(g.nodes(), function(v) {
    reverseYOne(g.node(v));
  });
  forEach_default(g.edges(), function(e) {
    var edge = g.edge(e);
    forEach_default(edge.points, reverseYOne);
    if (Object.prototype.hasOwnProperty.call(edge, "y")) {
      reverseYOne(edge);
    }
  });
}
function reverseYOne(attrs) {
  attrs.y = -attrs.y;
}
function swapXY(g) {
  forEach_default(g.nodes(), function(v) {
    swapXYOne(g.node(v));
  });
  forEach_default(g.edges(), function(e) {
    var edge = g.edge(e);
    forEach_default(edge.points, swapXYOne);
    if (Object.prototype.hasOwnProperty.call(edge, "x")) {
      swapXYOne(edge);
    }
  });
}
function swapXYOne(attrs) {
  var x = attrs.x;
  attrs.x = attrs.y;
  attrs.y = x;
}

// node_modules/dagre-d3-es/src/dagre/data/list.js
class List {
  constructor() {
    var sentinel = {};
    sentinel._next = sentinel._prev = sentinel;
    this._sentinel = sentinel;
  }
  dequeue() {
    var sentinel = this._sentinel;
    var entry = sentinel._prev;
    if (entry !== sentinel) {
      unlink(entry);
      return entry;
    }
  }
  enqueue(entry) {
    var sentinel = this._sentinel;
    if (entry._prev && entry._next) {
      unlink(entry);
    }
    entry._next = sentinel._next;
    sentinel._next._prev = entry;
    sentinel._next = entry;
    entry._prev = sentinel;
  }
  toString() {
    var strs = [];
    var sentinel = this._sentinel;
    var curr = sentinel._prev;
    while (curr !== sentinel) {
      strs.push(JSON.stringify(curr, filterOutLinks));
      curr = curr._prev;
    }
    return "[" + strs.join(", ") + "]";
  }
}
function unlink(entry) {
  entry._prev._next = entry._next;
  entry._next._prev = entry._prev;
  delete entry._next;
  delete entry._prev;
}
function filterOutLinks(k, v) {
  if (k !== "_next" && k !== "_prev") {
    return v;
  }
}

// node_modules/dagre-d3-es/src/dagre/greedy-fas.js
var DEFAULT_WEIGHT_FN = constant_default(1);
function greedyFAS(g, weightFn) {
  if (g.nodeCount() <= 1) {
    return [];
  }
  var state = buildState(g, weightFn || DEFAULT_WEIGHT_FN);
  var results = doGreedyFAS(state.graph, state.buckets, state.zeroIdx);
  return flatten_default(map_default(results, function(e) {
    return g.outEdges(e.v, e.w);
  }));
}
function doGreedyFAS(g, buckets, zeroIdx) {
  var results = [];
  var sources = buckets[buckets.length - 1];
  var sinks = buckets[0];
  var entry;
  while (g.nodeCount()) {
    while (entry = sinks.dequeue()) {
      removeNode(g, buckets, zeroIdx, entry);
    }
    while (entry = sources.dequeue()) {
      removeNode(g, buckets, zeroIdx, entry);
    }
    if (g.nodeCount()) {
      for (var i = buckets.length - 2;i > 0; --i) {
        entry = buckets[i].dequeue();
        if (entry) {
          results = results.concat(removeNode(g, buckets, zeroIdx, entry, true));
          break;
        }
      }
    }
  }
  return results;
}
function removeNode(g, buckets, zeroIdx, entry, collectPredecessors) {
  var results = collectPredecessors ? [] : undefined;
  forEach_default(g.inEdges(entry.v), function(edge) {
    var weight = g.edge(edge);
    var uEntry = g.node(edge.v);
    if (collectPredecessors) {
      results.push({ v: edge.v, w: edge.w });
    }
    uEntry.out -= weight;
    assignBucket(buckets, zeroIdx, uEntry);
  });
  forEach_default(g.outEdges(entry.v), function(edge) {
    var weight = g.edge(edge);
    var w = edge.w;
    var wEntry = g.node(w);
    wEntry["in"] -= weight;
    assignBucket(buckets, zeroIdx, wEntry);
  });
  g.removeNode(entry.v);
  return results;
}
function buildState(g, weightFn) {
  var fasGraph = new Graph;
  var maxIn = 0;
  var maxOut = 0;
  forEach_default(g.nodes(), function(v) {
    fasGraph.setNode(v, { v, in: 0, out: 0 });
  });
  forEach_default(g.edges(), function(e) {
    var prevWeight = fasGraph.edge(e.v, e.w) || 0;
    var weight = weightFn(e);
    var edgeWeight = prevWeight + weight;
    fasGraph.setEdge(e.v, e.w, edgeWeight);
    maxOut = Math.max(maxOut, fasGraph.node(e.v).out += weight);
    maxIn = Math.max(maxIn, fasGraph.node(e.w)["in"] += weight);
  });
  var buckets = range_default(maxOut + maxIn + 3).map(function() {
    return new List;
  });
  var zeroIdx = maxIn + 1;
  forEach_default(fasGraph.nodes(), function(v) {
    assignBucket(buckets, zeroIdx, fasGraph.node(v));
  });
  return { graph: fasGraph, buckets, zeroIdx };
}
function assignBucket(buckets, zeroIdx, entry) {
  if (!entry.out) {
    buckets[0].enqueue(entry);
  } else if (!entry["in"]) {
    buckets[buckets.length - 1].enqueue(entry);
  } else {
    buckets[entry.out - entry["in"] + zeroIdx].enqueue(entry);
  }
}

// node_modules/dagre-d3-es/src/dagre/acyclic.js
function run(g) {
  var fas = g.graph().acyclicer === "greedy" ? greedyFAS(g, weightFn(g)) : dfsFAS(g);
  forEach_default(fas, function(e) {
    var label = g.edge(e);
    g.removeEdge(e);
    label.forwardName = e.name;
    label.reversed = true;
    g.setEdge(e.w, e.v, label, uniqueId_default("rev"));
  });
  function weightFn(g2) {
    return function(e) {
      return g2.edge(e).weight;
    };
  }
}
function dfsFAS(g) {
  var fas = [];
  var stack = {};
  var visited = {};
  function dfs(v) {
    if (Object.prototype.hasOwnProperty.call(visited, v)) {
      return;
    }
    visited[v] = true;
    stack[v] = true;
    forEach_default(g.outEdges(v), function(e) {
      if (Object.prototype.hasOwnProperty.call(stack, e.w)) {
        fas.push(e);
      } else {
        dfs(e.w);
      }
    });
    delete stack[v];
  }
  forEach_default(g.nodes(), dfs);
  return fas;
}
function undo2(g) {
  forEach_default(g.edges(), function(e) {
    var label = g.edge(e);
    if (label.reversed) {
      g.removeEdge(e);
      var forwardName = label.forwardName;
      delete label.reversed;
      delete label.forwardName;
      g.setEdge(e.w, e.v, label, forwardName);
    }
  });
}

// node_modules/dagre-d3-es/src/dagre/normalize.js
function run2(g) {
  g.graph().dummyChains = [];
  forEach_default(g.edges(), function(edge) {
    normalizeEdge(g, edge);
  });
}
function normalizeEdge(g, e) {
  var v = e.v;
  var vRank = g.node(v).rank;
  var w = e.w;
  var wRank = g.node(w).rank;
  var name = e.name;
  var edgeLabel = g.edge(e);
  var labelRank = edgeLabel.labelRank;
  if (wRank === vRank + 1)
    return;
  g.removeEdge(e);
  var attrs = undefined;
  var dummy, i;
  for (i = 0, ++vRank;vRank < wRank; ++i, ++vRank) {
    edgeLabel.points = [];
    attrs = {
      width: 0,
      height: 0,
      edgeLabel,
      edgeObj: e,
      rank: vRank
    };
    dummy = addDummyNode(g, "edge", attrs, "_d");
    if (vRank === labelRank) {
      attrs.width = edgeLabel.width;
      attrs.height = edgeLabel.height;
      attrs.dummy = "edge-label";
      attrs.labelpos = edgeLabel.labelpos;
    }
    g.setEdge(v, dummy, { weight: edgeLabel.weight }, name);
    if (i === 0) {
      g.graph().dummyChains.push(dummy);
    }
    v = dummy;
  }
  g.setEdge(v, w, { weight: edgeLabel.weight }, name);
}
function undo3(g) {
  forEach_default(g.graph().dummyChains, function(v) {
    var node = g.node(v);
    var origLabel = node.edgeLabel;
    var w;
    g.setEdge(node.edgeObj, origLabel);
    while (node.dummy) {
      w = g.successors(v)[0];
      g.removeNode(v);
      origLabel.points.push({ x: node.x, y: node.y });
      if (node.dummy === "edge-label") {
        origLabel.x = node.x;
        origLabel.y = node.y;
        origLabel.width = node.width;
        origLabel.height = node.height;
      }
      v = w;
      node = g.node(v);
    }
  });
}

// node_modules/dagre-d3-es/src/dagre/rank/util.js
function longestPath(g) {
  var visited = {};
  function dfs(v) {
    var label = g.node(v);
    if (Object.prototype.hasOwnProperty.call(visited, v)) {
      return label.rank;
    }
    visited[v] = true;
    var rank = min_default(map_default(g.outEdges(v), function(e) {
      return dfs(e.w) - g.edge(e).minlen;
    }));
    if (rank === Number.POSITIVE_INFINITY || rank === undefined || rank === null) {
      rank = 0;
    }
    return label.rank = rank;
  }
  forEach_default(g.sources(), dfs);
}
function slack(g, e) {
  return g.node(e.w).rank - g.node(e.v).rank - g.edge(e).minlen;
}

// node_modules/dagre-d3-es/src/dagre/rank/feasible-tree.js
function feasibleTree(g) {
  var t = new Graph({ directed: false });
  var start = g.nodes()[0];
  var size = g.nodeCount();
  t.setNode(start, {});
  var edge, delta;
  while (tightTree(t, g) < size) {
    edge = findMinSlackEdge(t, g);
    delta = t.hasNode(edge.v) ? slack(g, edge) : -slack(g, edge);
    shiftRanks(t, g, delta);
  }
  return t;
}
function tightTree(t, g) {
  function dfs(v) {
    forEach_default(g.nodeEdges(v), function(e) {
      var edgeV = e.v, w = v === edgeV ? e.w : edgeV;
      if (!t.hasNode(w) && !slack(g, e)) {
        t.setNode(w, {});
        t.setEdge(v, w, {});
        dfs(w);
      }
    });
  }
  forEach_default(t.nodes(), dfs);
  return t.nodeCount();
}
function findMinSlackEdge(t, g) {
  return minBy_default(g.edges(), function(e) {
    if (t.hasNode(e.v) !== t.hasNode(e.w)) {
      return slack(g, e);
    }
  });
}
function shiftRanks(t, g, delta) {
  forEach_default(t.nodes(), function(v) {
    g.node(v).rank += delta;
  });
}

// node_modules/dagre-d3-es/src/graphlib/alg/dijkstra.js
var DEFAULT_WEIGHT_FUNC = constant_default(1);

// node_modules/dagre-d3-es/src/graphlib/alg/floyd-warshall.js
var DEFAULT_WEIGHT_FUNC2 = constant_default(1);

// node_modules/dagre-d3-es/src/graphlib/alg/topsort.js
topsort.CycleException = CycleException;
function topsort(g) {
  var visited = {};
  var stack = {};
  var results = [];
  function visit(node) {
    if (Object.prototype.hasOwnProperty.call(stack, node)) {
      throw new CycleException;
    }
    if (!Object.prototype.hasOwnProperty.call(visited, node)) {
      stack[node] = true;
      visited[node] = true;
      forEach_default(g.predecessors(node), visit);
      delete stack[node];
      results.push(node);
    }
  }
  forEach_default(g.sinks(), visit);
  if (size_default(visited) !== g.nodeCount()) {
    throw new CycleException;
  }
  return results;
}
function CycleException() {}
CycleException.prototype = new Error;

// node_modules/dagre-d3-es/src/graphlib/alg/dfs.js
function dfs(g, vs, order) {
  if (!isArray_default(vs)) {
    vs = [vs];
  }
  var navigation = (g.isDirected() ? g.successors : g.neighbors).bind(g);
  var acc = [];
  var visited = {};
  forEach_default(vs, function(v) {
    if (!g.hasNode(v)) {
      throw new Error("Graph does not have node: " + v);
    }
    doDfs(g, v, order === "post", visited, navigation, acc);
  });
  return acc;
}
function doDfs(g, v, postorder, visited, navigation, acc) {
  if (!Object.prototype.hasOwnProperty.call(visited, v)) {
    visited[v] = true;
    if (!postorder) {
      acc.push(v);
    }
    forEach_default(navigation(v), function(w) {
      doDfs(g, w, postorder, visited, navigation, acc);
    });
    if (postorder) {
      acc.push(v);
    }
  }
}

// node_modules/dagre-d3-es/src/graphlib/alg/postorder.js
function postorder(g, vs) {
  return dfs(g, vs, "post");
}

// node_modules/dagre-d3-es/src/graphlib/alg/preorder.js
function preorder(g, vs) {
  return dfs(g, vs, "pre");
}

// node_modules/dagre-d3-es/src/dagre/rank/network-simplex.js
networkSimplex.initLowLimValues = initLowLimValues;
networkSimplex.initCutValues = initCutValues;
networkSimplex.calcCutValue = calcCutValue;
networkSimplex.leaveEdge = leaveEdge;
networkSimplex.enterEdge = enterEdge;
networkSimplex.exchangeEdges = exchangeEdges;
function networkSimplex(g) {
  g = simplify(g);
  longestPath(g);
  var t = feasibleTree(g);
  initLowLimValues(t);
  initCutValues(t, g);
  var e, f;
  while (e = leaveEdge(t)) {
    f = enterEdge(t, g, e);
    exchangeEdges(t, g, e, f);
  }
}
function initCutValues(t, g) {
  var vs = postorder(t, t.nodes());
  vs = vs.slice(0, vs.length - 1);
  forEach_default(vs, function(v) {
    assignCutValue(t, g, v);
  });
}
function assignCutValue(t, g, child) {
  var childLab = t.node(child);
  var parent = childLab.parent;
  t.edge(child, parent).cutvalue = calcCutValue(t, g, child);
}
function calcCutValue(t, g, child) {
  var childLab = t.node(child);
  var parent = childLab.parent;
  var childIsTail = true;
  var graphEdge = g.edge(child, parent);
  var cutValue = 0;
  if (!graphEdge) {
    childIsTail = false;
    graphEdge = g.edge(parent, child);
  }
  cutValue = graphEdge.weight;
  forEach_default(g.nodeEdges(child), function(e) {
    var isOutEdge = e.v === child, other = isOutEdge ? e.w : e.v;
    if (other !== parent) {
      var pointsToHead = isOutEdge === childIsTail, otherWeight = g.edge(e).weight;
      cutValue += pointsToHead ? otherWeight : -otherWeight;
      if (isTreeEdge(t, child, other)) {
        var otherCutValue = t.edge(child, other).cutvalue;
        cutValue += pointsToHead ? -otherCutValue : otherCutValue;
      }
    }
  });
  return cutValue;
}
function initLowLimValues(tree, root) {
  if (arguments.length < 2) {
    root = tree.nodes()[0];
  }
  dfsAssignLowLim(tree, {}, 1, root);
}
function dfsAssignLowLim(tree, visited, nextLim, v, parent) {
  var low = nextLim;
  var label = tree.node(v);
  visited[v] = true;
  forEach_default(tree.neighbors(v), function(w) {
    if (!Object.prototype.hasOwnProperty.call(visited, w)) {
      nextLim = dfsAssignLowLim(tree, visited, nextLim, w, v);
    }
  });
  label.low = low;
  label.lim = nextLim++;
  if (parent) {
    label.parent = parent;
  } else {
    delete label.parent;
  }
  return nextLim;
}
function leaveEdge(tree) {
  return find_default(tree.edges(), function(e) {
    return tree.edge(e).cutvalue < 0;
  });
}
function enterEdge(t, g, edge) {
  var v = edge.v;
  var w = edge.w;
  if (!g.hasEdge(v, w)) {
    v = edge.w;
    w = edge.v;
  }
  var vLabel = t.node(v);
  var wLabel = t.node(w);
  var tailLabel = vLabel;
  var flip = false;
  if (vLabel.lim > wLabel.lim) {
    tailLabel = wLabel;
    flip = true;
  }
  var candidates = filter_default(g.edges(), function(edge2) {
    return flip === isDescendant(t, t.node(edge2.v), tailLabel) && flip !== isDescendant(t, t.node(edge2.w), tailLabel);
  });
  return minBy_default(candidates, function(edge2) {
    return slack(g, edge2);
  });
}
function exchangeEdges(t, g, e, f) {
  var v = e.v;
  var w = e.w;
  t.removeEdge(v, w);
  t.setEdge(f.v, f.w, {});
  initLowLimValues(t);
  initCutValues(t, g);
  updateRanks(t, g);
}
function updateRanks(t, g) {
  var root = find_default(t.nodes(), function(v) {
    return !g.node(v).parent;
  });
  var vs = preorder(t, root);
  vs = vs.slice(1);
  forEach_default(vs, function(v) {
    var parent = t.node(v).parent, edge = g.edge(v, parent), flipped = false;
    if (!edge) {
      edge = g.edge(parent, v);
      flipped = true;
    }
    g.node(v).rank = g.node(parent).rank + (flipped ? edge.minlen : -edge.minlen);
  });
}
function isTreeEdge(tree, u, v) {
  return tree.hasEdge(u, v);
}
function isDescendant(tree, vLabel, rootLabel) {
  return rootLabel.low <= vLabel.lim && vLabel.lim <= rootLabel.lim;
}

// node_modules/dagre-d3-es/src/dagre/rank/index.js
function rank(g) {
  switch (g.graph().ranker) {
    case "network-simplex":
      networkSimplexRanker(g);
      break;
    case "tight-tree":
      tightTreeRanker(g);
      break;
    case "longest-path":
      longestPathRanker(g);
      break;
    default:
      networkSimplexRanker(g);
  }
}
var longestPathRanker = longestPath;
function tightTreeRanker(g) {
  longestPath(g);
  feasibleTree(g);
}
function networkSimplexRanker(g) {
  networkSimplex(g);
}

// node_modules/dagre-d3-es/src/dagre/nesting-graph.js
function run3(g) {
  var root = addDummyNode(g, "root", {}, "_root");
  var depths = treeDepths(g);
  var height = max_default(values_default(depths)) - 1;
  var nodeSep = 2 * height + 1;
  g.graph().nestingRoot = root;
  forEach_default(g.edges(), function(e) {
    g.edge(e).minlen *= nodeSep;
  });
  var weight = sumWeights(g) + 1;
  forEach_default(g.children(), function(child) {
    dfs2(g, root, nodeSep, weight, height, depths, child);
  });
  g.graph().nodeRankFactor = nodeSep;
}
function dfs2(g, root, nodeSep, weight, height, depths, v) {
  var children = g.children(v);
  if (!children.length) {
    if (v !== root) {
      g.setEdge(root, v, { weight: 0, minlen: nodeSep });
    }
    return;
  }
  var top = addBorderNode(g, "_bt");
  var bottom = addBorderNode(g, "_bb");
  var label = g.node(v);
  g.setParent(top, v);
  label.borderTop = top;
  g.setParent(bottom, v);
  label.borderBottom = bottom;
  forEach_default(children, function(child) {
    dfs2(g, root, nodeSep, weight, height, depths, child);
    var childNode = g.node(child);
    var childTop = childNode.borderTop ? childNode.borderTop : child;
    var childBottom = childNode.borderBottom ? childNode.borderBottom : child;
    var thisWeight = childNode.borderTop ? weight : 2 * weight;
    var minlen = childTop !== childBottom ? 1 : height - depths[v] + 1;
    g.setEdge(top, childTop, {
      weight: thisWeight,
      minlen,
      nestingEdge: true
    });
    g.setEdge(childBottom, bottom, {
      weight: thisWeight,
      minlen,
      nestingEdge: true
    });
  });
  if (!g.parent(v)) {
    g.setEdge(root, top, { weight: 0, minlen: height + depths[v] });
  }
}
function treeDepths(g) {
  var depths = {};
  function dfs3(v, depth) {
    var children = g.children(v);
    if (children && children.length) {
      forEach_default(children, function(child) {
        dfs3(child, depth + 1);
      });
    }
    depths[v] = depth;
  }
  forEach_default(g.children(), function(v) {
    dfs3(v, 1);
  });
  return depths;
}
function sumWeights(g) {
  return reduce_default(g.edges(), function(acc, e) {
    return acc + g.edge(e).weight;
  }, 0);
}
function cleanup(g) {
  var graphLabel = g.graph();
  g.removeNode(graphLabel.nestingRoot);
  delete graphLabel.nestingRoot;
  forEach_default(g.edges(), function(e) {
    var edge = g.edge(e);
    if (edge.nestingEdge) {
      g.removeEdge(e);
    }
  });
}

// node_modules/dagre-d3-es/src/dagre/order/add-subgraph-constraints.js
function addSubgraphConstraints(g, cg, vs) {
  var prev = {}, rootPrev;
  forEach_default(vs, function(v) {
    var child = g.parent(v), parent, prevChild;
    while (child) {
      parent = g.parent(child);
      if (parent) {
        prevChild = prev[parent];
        prev[parent] = child;
      } else {
        prevChild = rootPrev;
        rootPrev = child;
      }
      if (prevChild && prevChild !== child) {
        cg.setEdge(prevChild, child);
        return;
      }
      child = parent;
    }
  });
}

// node_modules/dagre-d3-es/src/dagre/order/build-layer-graph.js
function buildLayerGraph(g, rank2, relationship) {
  var root = createRootNode(g), result = new Graph({ compound: true }).setGraph({ root }).setDefaultNodeLabel(function(v) {
    return g.node(v);
  });
  forEach_default(g.nodes(), function(v) {
    var node = g.node(v), parent = g.parent(v);
    if (node.rank === rank2 || node.minRank <= rank2 && rank2 <= node.maxRank) {
      result.setNode(v);
      result.setParent(v, parent || root);
      forEach_default(g[relationship](v), function(e) {
        var u = e.v === v ? e.w : e.v, edge = result.edge(u, v), weight = !isUndefined_default(edge) ? edge.weight : 0;
        result.setEdge(u, v, { weight: g.edge(e).weight + weight });
      });
      if (Object.prototype.hasOwnProperty.call(node, "minRank")) {
        result.setNode(v, {
          borderLeft: node.borderLeft[rank2],
          borderRight: node.borderRight[rank2]
        });
      }
    }
  });
  return result;
}
function createRootNode(g) {
  var v;
  while (g.hasNode(v = uniqueId_default("_root")))
    ;
  return v;
}

// node_modules/dagre-d3-es/src/dagre/order/cross-count.js
function crossCount(g, layering) {
  var cc = 0;
  for (var i = 1;i < layering.length; ++i) {
    cc += twoLayerCrossCount(g, layering[i - 1], layering[i]);
  }
  return cc;
}
function twoLayerCrossCount(g, northLayer, southLayer) {
  var southPos = zipObject_default(southLayer, map_default(southLayer, function(v, i) {
    return i;
  }));
  var southEntries = flatten_default(map_default(northLayer, function(v) {
    return sortBy_default(map_default(g.outEdges(v), function(e) {
      return { pos: southPos[e.w], weight: g.edge(e).weight };
    }), "pos");
  }));
  var firstIndex = 1;
  while (firstIndex < southLayer.length)
    firstIndex <<= 1;
  var treeSize = 2 * firstIndex - 1;
  firstIndex -= 1;
  var tree = map_default(new Array(treeSize), function() {
    return 0;
  });
  var cc = 0;
  forEach_default(southEntries.forEach(function(entry) {
    var index = entry.pos + firstIndex;
    tree[index] += entry.weight;
    var weightSum = 0;
    while (index > 0) {
      if (index % 2) {
        weightSum += tree[index + 1];
      }
      index = index - 1 >> 1;
      tree[index] += entry.weight;
    }
    cc += entry.weight * weightSum;
  }));
  return cc;
}

// node_modules/dagre-d3-es/src/dagre/order/init-order.js
function initOrder(g) {
  var visited = {};
  var simpleNodes = filter_default(g.nodes(), function(v) {
    return !g.children(v).length;
  });
  var maxRank2 = max_default(map_default(simpleNodes, function(v) {
    return g.node(v).rank;
  }));
  var layers = map_default(range_default(maxRank2 + 1), function() {
    return [];
  });
  function dfs3(v) {
    if (has_default(visited, v))
      return;
    visited[v] = true;
    var node = g.node(v);
    layers[node.rank].push(v);
    forEach_default(g.successors(v), dfs3);
  }
  var orderedVs = sortBy_default(simpleNodes, function(v) {
    return g.node(v).rank;
  });
  forEach_default(orderedVs, dfs3);
  return layers;
}

// node_modules/dagre-d3-es/src/dagre/order/barycenter.js
function barycenter(g, movable) {
  return map_default(movable, function(v) {
    var inV = g.inEdges(v);
    if (!inV.length) {
      return { v };
    } else {
      var result = reduce_default(inV, function(acc, e) {
        var edge = g.edge(e), nodeU = g.node(e.v);
        return {
          sum: acc.sum + edge.weight * nodeU.order,
          weight: acc.weight + edge.weight
        };
      }, { sum: 0, weight: 0 });
      return {
        v,
        barycenter: result.sum / result.weight,
        weight: result.weight
      };
    }
  });
}

// node_modules/dagre-d3-es/src/dagre/order/resolve-conflicts.js
function resolveConflicts(entries, cg) {
  var mappedEntries = {};
  forEach_default(entries, function(entry, i) {
    var tmp = mappedEntries[entry.v] = {
      indegree: 0,
      in: [],
      out: [],
      vs: [entry.v],
      i
    };
    if (!isUndefined_default(entry.barycenter)) {
      tmp.barycenter = entry.barycenter;
      tmp.weight = entry.weight;
    }
  });
  forEach_default(cg.edges(), function(e) {
    var entryV = mappedEntries[e.v];
    var entryW = mappedEntries[e.w];
    if (!isUndefined_default(entryV) && !isUndefined_default(entryW)) {
      entryW.indegree++;
      entryV.out.push(mappedEntries[e.w]);
    }
  });
  var sourceSet = filter_default(mappedEntries, function(entry) {
    return !entry.indegree;
  });
  return doResolveConflicts(sourceSet);
}
function doResolveConflicts(sourceSet) {
  var entries = [];
  function handleIn(vEntry) {
    return function(uEntry) {
      if (uEntry.merged) {
        return;
      }
      if (isUndefined_default(uEntry.barycenter) || isUndefined_default(vEntry.barycenter) || uEntry.barycenter >= vEntry.barycenter) {
        mergeEntries(vEntry, uEntry);
      }
    };
  }
  function handleOut(vEntry) {
    return function(wEntry) {
      wEntry["in"].push(vEntry);
      if (--wEntry.indegree === 0) {
        sourceSet.push(wEntry);
      }
    };
  }
  while (sourceSet.length) {
    var entry = sourceSet.pop();
    entries.push(entry);
    forEach_default(entry["in"].reverse(), handleIn(entry));
    forEach_default(entry.out, handleOut(entry));
  }
  return map_default(filter_default(entries, function(entry2) {
    return !entry2.merged;
  }), function(entry2) {
    return pick_default(entry2, ["vs", "i", "barycenter", "weight"]);
  });
}
function mergeEntries(target, source) {
  var sum = 0;
  var weight = 0;
  if (target.weight) {
    sum += target.barycenter * target.weight;
    weight += target.weight;
  }
  if (source.weight) {
    sum += source.barycenter * source.weight;
    weight += source.weight;
  }
  target.vs = source.vs.concat(target.vs);
  target.barycenter = sum / weight;
  target.weight = weight;
  target.i = Math.min(source.i, target.i);
  source.merged = true;
}

// node_modules/dagre-d3-es/src/dagre/order/sort.js
function sort(entries, biasRight) {
  var parts = partition(entries, function(entry) {
    return Object.prototype.hasOwnProperty.call(entry, "barycenter");
  });
  var sortable = parts.lhs, unsortable = sortBy_default(parts.rhs, function(entry) {
    return -entry.i;
  }), vs = [], sum = 0, weight = 0, vsIndex = 0;
  sortable.sort(compareWithBias(!!biasRight));
  vsIndex = consumeUnsortable(vs, unsortable, vsIndex);
  forEach_default(sortable, function(entry) {
    vsIndex += entry.vs.length;
    vs.push(entry.vs);
    sum += entry.barycenter * entry.weight;
    weight += entry.weight;
    vsIndex = consumeUnsortable(vs, unsortable, vsIndex);
  });
  var result = { vs: flatten_default(vs) };
  if (weight) {
    result.barycenter = sum / weight;
    result.weight = weight;
  }
  return result;
}
function consumeUnsortable(vs, unsortable, index) {
  var last;
  while (unsortable.length && (last = last_default(unsortable)).i <= index) {
    unsortable.pop();
    vs.push(last.vs);
    index++;
  }
  return index;
}
function compareWithBias(bias) {
  return function(entryV, entryW) {
    if (entryV.barycenter < entryW.barycenter) {
      return -1;
    } else if (entryV.barycenter > entryW.barycenter) {
      return 1;
    }
    return !bias ? entryV.i - entryW.i : entryW.i - entryV.i;
  };
}

// node_modules/dagre-d3-es/src/dagre/order/sort-subgraph.js
function sortSubgraph(g, v, cg, biasRight) {
  var movable = g.children(v);
  var node = g.node(v);
  var bl = node ? node.borderLeft : undefined;
  var br = node ? node.borderRight : undefined;
  var subgraphs = {};
  if (bl) {
    movable = filter_default(movable, function(w) {
      return w !== bl && w !== br;
    });
  }
  var barycenters = barycenter(g, movable);
  forEach_default(barycenters, function(entry) {
    if (g.children(entry.v).length) {
      var subgraphResult = sortSubgraph(g, entry.v, cg, biasRight);
      subgraphs[entry.v] = subgraphResult;
      if (Object.prototype.hasOwnProperty.call(subgraphResult, "barycenter")) {
        mergeBarycenters(entry, subgraphResult);
      }
    }
  });
  var entries = resolveConflicts(barycenters, cg);
  expandSubgraphs(entries, subgraphs);
  var result = sort(entries, biasRight);
  if (bl) {
    result.vs = flatten_default([bl, result.vs, br]);
    if (g.predecessors(bl).length) {
      var blPred = g.node(g.predecessors(bl)[0]), brPred = g.node(g.predecessors(br)[0]);
      if (!Object.prototype.hasOwnProperty.call(result, "barycenter")) {
        result.barycenter = 0;
        result.weight = 0;
      }
      result.barycenter = (result.barycenter * result.weight + blPred.order + brPred.order) / (result.weight + 2);
      result.weight += 2;
    }
  }
  return result;
}
function expandSubgraphs(entries, subgraphs) {
  forEach_default(entries, function(entry) {
    entry.vs = flatten_default(entry.vs.map(function(v) {
      if (subgraphs[v]) {
        return subgraphs[v].vs;
      }
      return v;
    }));
  });
}
function mergeBarycenters(target, other) {
  if (!isUndefined_default(target.barycenter)) {
    target.barycenter = (target.barycenter * target.weight + other.barycenter * other.weight) / (target.weight + other.weight);
    target.weight += other.weight;
  } else {
    target.barycenter = other.barycenter;
    target.weight = other.weight;
  }
}

// node_modules/dagre-d3-es/src/dagre/order/index.js
function order(g) {
  var maxRank2 = maxRank(g), downLayerGraphs = buildLayerGraphs(g, range_default(1, maxRank2 + 1), "inEdges"), upLayerGraphs = buildLayerGraphs(g, range_default(maxRank2 - 1, -1, -1), "outEdges");
  var layering = initOrder(g);
  assignOrder(g, layering);
  var bestCC = Number.POSITIVE_INFINITY, best;
  for (var i = 0, lastBest = 0;lastBest < 4; ++i, ++lastBest) {
    sweepLayerGraphs(i % 2 ? downLayerGraphs : upLayerGraphs, i % 4 >= 2);
    layering = buildLayerMatrix(g);
    var cc = crossCount(g, layering);
    if (cc < bestCC) {
      lastBest = 0;
      best = cloneDeep_default(layering);
      bestCC = cc;
    }
  }
  assignOrder(g, best);
}
function buildLayerGraphs(g, ranks, relationship) {
  return map_default(ranks, function(rank2) {
    return buildLayerGraph(g, rank2, relationship);
  });
}
function sweepLayerGraphs(layerGraphs, biasRight) {
  var cg = new Graph;
  forEach_default(layerGraphs, function(lg) {
    var root = lg.graph().root;
    var sorted = sortSubgraph(lg, root, cg, biasRight);
    forEach_default(sorted.vs, function(v, i) {
      lg.node(v).order = i;
    });
    addSubgraphConstraints(lg, cg, sorted.vs);
  });
}
function assignOrder(g, layering) {
  forEach_default(layering, function(layer) {
    forEach_default(layer, function(v, i) {
      g.node(v).order = i;
    });
  });
}

// node_modules/dagre-d3-es/src/dagre/parent-dummy-chains.js
function parentDummyChains(g) {
  var postorderNums = postorder2(g);
  forEach_default(g.graph().dummyChains, function(v) {
    var node = g.node(v);
    var edgeObj = node.edgeObj;
    var pathData = findPath(g, postorderNums, edgeObj.v, edgeObj.w);
    var path = pathData.path;
    var lca = pathData.lca;
    var pathIdx = 0;
    var pathV = path[pathIdx];
    var ascending = true;
    while (v !== edgeObj.w) {
      node = g.node(v);
      if (ascending) {
        while ((pathV = path[pathIdx]) !== lca && g.node(pathV).maxRank < node.rank) {
          pathIdx++;
        }
        if (pathV === lca) {
          ascending = false;
        }
      }
      if (!ascending) {
        while (pathIdx < path.length - 1 && g.node(pathV = path[pathIdx + 1]).minRank <= node.rank) {
          pathIdx++;
        }
        pathV = path[pathIdx];
      }
      g.setParent(v, pathV);
      v = g.successors(v)[0];
    }
  });
}
function findPath(g, postorderNums, v, w) {
  var vPath = [];
  var wPath = [];
  var low = Math.min(postorderNums[v].low, postorderNums[w].low);
  var lim = Math.max(postorderNums[v].lim, postorderNums[w].lim);
  var parent;
  var lca;
  parent = v;
  do {
    parent = g.parent(parent);
    vPath.push(parent);
  } while (parent && (postorderNums[parent].low > low || lim > postorderNums[parent].lim));
  lca = parent;
  parent = w;
  while ((parent = g.parent(parent)) !== lca) {
    wPath.push(parent);
  }
  return { path: vPath.concat(wPath.reverse()), lca };
}
function postorder2(g) {
  var result = {};
  var lim = 0;
  function dfs3(v) {
    var low = lim;
    forEach_default(g.children(v), dfs3);
    result[v] = { low, lim: lim++ };
  }
  forEach_default(g.children(), dfs3);
  return result;
}

// node_modules/dagre-d3-es/src/dagre/position/bk.js
function findType1Conflicts(g, layering) {
  var conflicts = {};
  function visitLayer(prevLayer, layer) {
    var k0 = 0, scanPos = 0, prevLayerLength = prevLayer.length, lastNode = last_default(layer);
    forEach_default(layer, function(v, i) {
      var w = findOtherInnerSegmentNode(g, v), k1 = w ? g.node(w).order : prevLayerLength;
      if (w || v === lastNode) {
        forEach_default(layer.slice(scanPos, i + 1), function(scanNode) {
          forEach_default(g.predecessors(scanNode), function(u) {
            var uLabel = g.node(u), uPos = uLabel.order;
            if ((uPos < k0 || k1 < uPos) && !(uLabel.dummy && g.node(scanNode).dummy)) {
              addConflict(conflicts, u, scanNode);
            }
          });
        });
        scanPos = i + 1;
        k0 = k1;
      }
    });
    return layer;
  }
  reduce_default(layering, visitLayer);
  return conflicts;
}
function findType2Conflicts(g, layering) {
  var conflicts = {};
  function scan(south, southPos, southEnd, prevNorthBorder, nextNorthBorder) {
    var v;
    forEach_default(range_default(southPos, southEnd), function(i) {
      v = south[i];
      if (g.node(v).dummy) {
        forEach_default(g.predecessors(v), function(u) {
          var uNode = g.node(u);
          if (uNode.dummy && (uNode.order < prevNorthBorder || uNode.order > nextNorthBorder)) {
            addConflict(conflicts, u, v);
          }
        });
      }
    });
  }
  function visitLayer(north, south) {
    var prevNorthPos = -1, nextNorthPos, southPos = 0;
    forEach_default(south, function(v, southLookahead) {
      if (g.node(v).dummy === "border") {
        var predecessors = g.predecessors(v);
        if (predecessors.length) {
          nextNorthPos = g.node(predecessors[0]).order;
          scan(south, southPos, southLookahead, prevNorthPos, nextNorthPos);
          southPos = southLookahead;
          prevNorthPos = nextNorthPos;
        }
      }
      scan(south, southPos, south.length, nextNorthPos, north.length);
    });
    return south;
  }
  reduce_default(layering, visitLayer);
  return conflicts;
}
function findOtherInnerSegmentNode(g, v) {
  if (g.node(v).dummy) {
    return find_default(g.predecessors(v), function(u) {
      return g.node(u).dummy;
    });
  }
}
function addConflict(conflicts, v, w) {
  if (v > w) {
    var tmp = v;
    v = w;
    w = tmp;
  }
  if (!Object.prototype.hasOwnProperty.call(conflicts, v)) {
    Object.defineProperty(conflicts, v, {
      enumerable: true,
      configurable: true,
      value: {},
      writable: true
    });
  }
  var conflictsV = conflicts[v];
  Object.defineProperty(conflictsV, w, {
    enumerable: true,
    configurable: true,
    value: true,
    writable: true
  });
}
function hasConflict(conflicts, v, w) {
  if (v > w) {
    var tmp = v;
    v = w;
    w = tmp;
  }
  return !!conflicts[v] && Object.prototype.hasOwnProperty.call(conflicts[v], w);
}
function verticalAlignment(g, layering, conflicts, neighborFn) {
  var root = {}, align = {}, pos = {};
  forEach_default(layering, function(layer) {
    forEach_default(layer, function(v, order2) {
      root[v] = v;
      align[v] = v;
      pos[v] = order2;
    });
  });
  forEach_default(layering, function(layer) {
    var prevIdx = -1;
    forEach_default(layer, function(v) {
      var ws = neighborFn(v);
      if (ws.length) {
        ws = sortBy_default(ws, function(w2) {
          return pos[w2];
        });
        var mp = (ws.length - 1) / 2;
        for (var i = Math.floor(mp), il = Math.ceil(mp);i <= il; ++i) {
          var w = ws[i];
          if (align[v] === v && prevIdx < pos[w] && !hasConflict(conflicts, v, w)) {
            align[w] = v;
            align[v] = root[v] = root[w];
            prevIdx = pos[w];
          }
        }
      }
    });
  });
  return { root, align };
}
function horizontalCompaction(g, layering, root, align, reverseSep) {
  var xs = {}, blockG = buildBlockGraph(g, layering, root, reverseSep), borderType = reverseSep ? "borderLeft" : "borderRight";
  function iterate(setXsFunc, nextNodesFunc) {
    var stack = blockG.nodes();
    var elem = stack.pop();
    var visited = {};
    while (elem) {
      if (visited[elem]) {
        setXsFunc(elem);
      } else {
        visited[elem] = true;
        stack.push(elem);
        stack = stack.concat(nextNodesFunc(elem));
      }
      elem = stack.pop();
    }
  }
  function pass1(elem) {
    xs[elem] = blockG.inEdges(elem).reduce(function(acc, e) {
      return Math.max(acc, xs[e.v] + blockG.edge(e));
    }, 0);
  }
  function pass2(elem) {
    var min = blockG.outEdges(elem).reduce(function(acc, e) {
      return Math.min(acc, xs[e.w] - blockG.edge(e));
    }, Number.POSITIVE_INFINITY);
    var node = g.node(elem);
    if (min !== Number.POSITIVE_INFINITY && node.borderType !== borderType) {
      xs[elem] = Math.max(xs[elem], min);
    }
  }
  iterate(pass1, blockG.predecessors.bind(blockG));
  iterate(pass2, blockG.successors.bind(blockG));
  forEach_default(align, function(v) {
    xs[v] = xs[root[v]];
  });
  return xs;
}
function buildBlockGraph(g, layering, root, reverseSep) {
  var blockGraph = new Graph, graphLabel = g.graph(), sepFn = sep(graphLabel.nodesep, graphLabel.edgesep, reverseSep);
  forEach_default(layering, function(layer) {
    var u;
    forEach_default(layer, function(v) {
      var vRoot = root[v];
      blockGraph.setNode(vRoot);
      if (u) {
        var uRoot = root[u], prevMax = blockGraph.edge(uRoot, vRoot);
        blockGraph.setEdge(uRoot, vRoot, Math.max(sepFn(g, v, u), prevMax || 0));
      }
      u = v;
    });
  });
  return blockGraph;
}
function findSmallestWidthAlignment(g, xss) {
  return minBy_default(values_default(xss), function(xs) {
    var max = Number.NEGATIVE_INFINITY;
    var min = Number.POSITIVE_INFINITY;
    forIn_default(xs, function(x, v) {
      var halfWidth = width(g, v) / 2;
      max = Math.max(x + halfWidth, max);
      min = Math.min(x - halfWidth, min);
    });
    return max - min;
  });
}
function alignCoordinates(xss, alignTo) {
  var alignToVals = values_default(alignTo), alignToMin = min_default(alignToVals), alignToMax = max_default(alignToVals);
  forEach_default(["u", "d"], function(vert) {
    forEach_default(["l", "r"], function(horiz) {
      var alignment = vert + horiz, xs = xss[alignment], delta;
      if (xs === alignTo)
        return;
      var xsVals = values_default(xs);
      delta = horiz === "l" ? alignToMin - min_default(xsVals) : alignToMax - max_default(xsVals);
      if (delta) {
        xss[alignment] = mapValues_default(xs, function(x) {
          return x + delta;
        });
      }
    });
  });
}
function balance(xss, align) {
  return mapValues_default(xss.ul, function(ignore, v) {
    if (align) {
      return xss[align.toLowerCase()][v];
    } else {
      var xs = sortBy_default(map_default(xss, v));
      return (xs[1] + xs[2]) / 2;
    }
  });
}
function positionX(g) {
  var layering = buildLayerMatrix(g);
  var conflicts = merge_default(findType1Conflicts(g, layering), findType2Conflicts(g, layering));
  var xss = {};
  var adjustedLayering;
  forEach_default(["u", "d"], function(vert) {
    adjustedLayering = vert === "u" ? layering : values_default(layering).reverse();
    forEach_default(["l", "r"], function(horiz) {
      if (horiz === "r") {
        adjustedLayering = map_default(adjustedLayering, function(inner) {
          return values_default(inner).reverse();
        });
      }
      var neighborFn = (vert === "u" ? g.predecessors : g.successors).bind(g);
      var align = verticalAlignment(g, adjustedLayering, conflicts, neighborFn);
      var xs = horizontalCompaction(g, adjustedLayering, align.root, align.align, horiz === "r");
      if (horiz === "r") {
        xs = mapValues_default(xs, function(x) {
          return -x;
        });
      }
      xss[vert + horiz] = xs;
    });
  });
  var smallestWidth = findSmallestWidthAlignment(g, xss);
  alignCoordinates(xss, smallestWidth);
  return balance(xss, g.graph().align);
}
function sep(nodeSep, edgeSep, reverseSep) {
  return function(g, v, w) {
    var vLabel = g.node(v);
    var wLabel = g.node(w);
    var sum = 0;
    var delta;
    sum += vLabel.width / 2;
    if (Object.prototype.hasOwnProperty.call(vLabel, "labelpos")) {
      switch (vLabel.labelpos.toLowerCase()) {
        case "l":
          delta = -vLabel.width / 2;
          break;
        case "r":
          delta = vLabel.width / 2;
          break;
      }
    }
    if (delta) {
      sum += reverseSep ? delta : -delta;
    }
    delta = 0;
    sum += (vLabel.dummy ? edgeSep : nodeSep) / 2;
    sum += (wLabel.dummy ? edgeSep : nodeSep) / 2;
    sum += wLabel.width / 2;
    if (Object.prototype.hasOwnProperty.call(wLabel, "labelpos")) {
      switch (wLabel.labelpos.toLowerCase()) {
        case "l":
          delta = wLabel.width / 2;
          break;
        case "r":
          delta = -wLabel.width / 2;
          break;
      }
    }
    if (delta) {
      sum += reverseSep ? delta : -delta;
    }
    delta = 0;
    return sum;
  };
}
function width(g, v) {
  return g.node(v).width;
}

// node_modules/dagre-d3-es/src/dagre/position/index.js
function position(g) {
  g = asNonCompoundGraph(g);
  positionY(g);
  forOwn_default(positionX(g), function(x, v) {
    g.node(v).x = x;
  });
}
function positionY(g) {
  var layering = buildLayerMatrix(g);
  var rankSep = g.graph().ranksep;
  var prevY = 0;
  forEach_default(layering, function(layer) {
    var maxHeight = max_default(map_default(layer, function(v) {
      return g.node(v).height;
    }));
    forEach_default(layer, function(v) {
      g.node(v).y = prevY + maxHeight / 2;
    });
    prevY += maxHeight + rankSep;
  });
}

// node_modules/dagre-d3-es/src/dagre/layout.js
function layout(g, opts) {
  var time2 = opts && opts.debugTiming ? time : notime;
  time2("layout", () => {
    var layoutGraph = time2("  buildLayoutGraph", () => buildLayoutGraph(g));
    time2("  runLayout", () => runLayout(layoutGraph, time2));
    time2("  updateInputGraph", () => updateInputGraph(g, layoutGraph));
  });
}
function runLayout(g, time2) {
  time2("    makeSpaceForEdgeLabels", () => makeSpaceForEdgeLabels(g));
  time2("    removeSelfEdges", () => removeSelfEdges(g));
  time2("    acyclic", () => run(g));
  time2("    nestingGraph.run", () => run3(g));
  time2("    rank", () => rank(asNonCompoundGraph(g)));
  time2("    injectEdgeLabelProxies", () => injectEdgeLabelProxies(g));
  time2("    removeEmptyRanks", () => removeEmptyRanks(g));
  time2("    nestingGraph.cleanup", () => cleanup(g));
  time2("    normalizeRanks", () => normalizeRanks(g));
  time2("    assignRankMinMax", () => assignRankMinMax(g));
  time2("    removeEdgeLabelProxies", () => removeEdgeLabelProxies(g));
  time2("    normalize.run", () => run2(g));
  time2("    parentDummyChains", () => parentDummyChains(g));
  time2("    addBorderSegments", () => addBorderSegments(g));
  time2("    order", () => order(g));
  time2("    insertSelfEdges", () => insertSelfEdges(g));
  time2("    adjustCoordinateSystem", () => adjust(g));
  time2("    position", () => position(g));
  time2("    positionSelfEdges", () => positionSelfEdges(g));
  time2("    removeBorderNodes", () => removeBorderNodes(g));
  time2("    normalize.undo", () => undo3(g));
  time2("    fixupEdgeLabelCoords", () => fixupEdgeLabelCoords(g));
  time2("    undoCoordinateSystem", () => undo(g));
  time2("    translateGraph", () => translateGraph(g));
  time2("    assignNodeIntersects", () => assignNodeIntersects(g));
  time2("    reversePoints", () => reversePointsForReversedEdges(g));
  time2("    acyclic.undo", () => undo2(g));
}
function updateInputGraph(inputGraph, layoutGraph) {
  forEach_default(inputGraph.nodes(), function(v) {
    var inputLabel = inputGraph.node(v);
    var layoutLabel = layoutGraph.node(v);
    if (inputLabel) {
      inputLabel.x = layoutLabel.x;
      inputLabel.y = layoutLabel.y;
      if (layoutGraph.children(v).length) {
        inputLabel.width = layoutLabel.width;
        inputLabel.height = layoutLabel.height;
      }
    }
  });
  forEach_default(inputGraph.edges(), function(e) {
    var inputLabel = inputGraph.edge(e);
    var layoutLabel = layoutGraph.edge(e);
    inputLabel.points = layoutLabel.points;
    if (Object.prototype.hasOwnProperty.call(layoutLabel, "x")) {
      inputLabel.x = layoutLabel.x;
      inputLabel.y = layoutLabel.y;
    }
  });
  inputGraph.graph().width = layoutGraph.graph().width;
  inputGraph.graph().height = layoutGraph.graph().height;
}
var graphNumAttrs = ["nodesep", "edgesep", "ranksep", "marginx", "marginy"];
var graphDefaults = { ranksep: 50, edgesep: 20, nodesep: 50, rankdir: "tb" };
var graphAttrs = ["acyclicer", "ranker", "rankdir", "align"];
var nodeNumAttrs = ["width", "height"];
var nodeDefaults = { width: 0, height: 0 };
var edgeNumAttrs = ["minlen", "weight", "width", "height", "labeloffset"];
var edgeDefaults = {
  minlen: 1,
  weight: 1,
  width: 0,
  height: 0,
  labeloffset: 10,
  labelpos: "r"
};
var edgeAttrs = ["labelpos"];
function buildLayoutGraph(inputGraph) {
  var g = new Graph({ multigraph: true, compound: true });
  var graph = canonicalize(inputGraph.graph());
  g.setGraph(merge_default({}, graphDefaults, selectNumberAttrs(graph, graphNumAttrs), pick_default(graph, graphAttrs)));
  forEach_default(inputGraph.nodes(), function(v) {
    var node = canonicalize(inputGraph.node(v));
    g.setNode(v, defaults_default(selectNumberAttrs(node, nodeNumAttrs), nodeDefaults));
    g.setParent(v, inputGraph.parent(v));
  });
  forEach_default(inputGraph.edges(), function(e) {
    var edge = canonicalize(inputGraph.edge(e));
    g.setEdge(e, merge_default({}, edgeDefaults, selectNumberAttrs(edge, edgeNumAttrs), pick_default(edge, edgeAttrs)));
  });
  return g;
}
function makeSpaceForEdgeLabels(g) {
  var graph = g.graph();
  graph.ranksep /= 2;
  forEach_default(g.edges(), function(e) {
    var edge = g.edge(e);
    edge.minlen *= 2;
    if (edge.labelpos.toLowerCase() !== "c") {
      if (graph.rankdir === "TB" || graph.rankdir === "BT") {
        edge.width += edge.labeloffset;
      } else {
        edge.height += edge.labeloffset;
      }
    }
  });
}
function injectEdgeLabelProxies(g) {
  forEach_default(g.edges(), function(e) {
    var edge = g.edge(e);
    if (edge.width && edge.height) {
      var v = g.node(e.v);
      var w = g.node(e.w);
      var label = { rank: (w.rank - v.rank) / 2 + v.rank, e };
      addDummyNode(g, "edge-proxy", label, "_ep");
    }
  });
}
function assignRankMinMax(g) {
  var maxRank2 = 0;
  forEach_default(g.nodes(), function(v) {
    var node = g.node(v);
    if (node.borderTop) {
      node.minRank = g.node(node.borderTop).rank;
      node.maxRank = g.node(node.borderBottom).rank;
      maxRank2 = max_default(maxRank2, node.maxRank);
    }
  });
  g.graph().maxRank = maxRank2;
}
function removeEdgeLabelProxies(g) {
  forEach_default(g.nodes(), function(v) {
    var node = g.node(v);
    if (node.dummy === "edge-proxy") {
      g.edge(node.e).labelRank = node.rank;
      g.removeNode(v);
    }
  });
}
function translateGraph(g) {
  var minX = Number.POSITIVE_INFINITY;
  var maxX = 0;
  var minY = Number.POSITIVE_INFINITY;
  var maxY = 0;
  var graphLabel = g.graph();
  var marginX = graphLabel.marginx || 0;
  var marginY = graphLabel.marginy || 0;
  function getExtremes(attrs) {
    var x = attrs.x;
    var y = attrs.y;
    var w = attrs.width;
    var h = attrs.height;
    minX = Math.min(minX, x - w / 2);
    maxX = Math.max(maxX, x + w / 2);
    minY = Math.min(minY, y - h / 2);
    maxY = Math.max(maxY, y + h / 2);
  }
  forEach_default(g.nodes(), function(v) {
    getExtremes(g.node(v));
  });
  forEach_default(g.edges(), function(e) {
    var edge = g.edge(e);
    if (Object.prototype.hasOwnProperty.call(edge, "x")) {
      getExtremes(edge);
    }
  });
  minX -= marginX;
  minY -= marginY;
  forEach_default(g.nodes(), function(v) {
    var node = g.node(v);
    node.x -= minX;
    node.y -= minY;
  });
  forEach_default(g.edges(), function(e) {
    var edge = g.edge(e);
    forEach_default(edge.points, function(p) {
      p.x -= minX;
      p.y -= minY;
    });
    if (Object.prototype.hasOwnProperty.call(edge, "x")) {
      edge.x -= minX;
    }
    if (Object.prototype.hasOwnProperty.call(edge, "y")) {
      edge.y -= minY;
    }
  });
  graphLabel.width = maxX - minX + marginX;
  graphLabel.height = maxY - minY + marginY;
}
function assignNodeIntersects(g) {
  forEach_default(g.edges(), function(e) {
    var edge = g.edge(e);
    var nodeV = g.node(e.v);
    var nodeW = g.node(e.w);
    var p1, p2;
    if (!edge.points) {
      edge.points = [];
      p1 = nodeW;
      p2 = nodeV;
    } else {
      p1 = edge.points[0];
      p2 = edge.points[edge.points.length - 1];
    }
    edge.points.unshift(intersectRect(nodeV, p1));
    edge.points.push(intersectRect(nodeW, p2));
  });
}
function fixupEdgeLabelCoords(g) {
  forEach_default(g.edges(), function(e) {
    var edge = g.edge(e);
    if (Object.prototype.hasOwnProperty.call(edge, "x")) {
      if (edge.labelpos === "l" || edge.labelpos === "r") {
        edge.width -= edge.labeloffset;
      }
      switch (edge.labelpos) {
        case "l":
          edge.x -= edge.width / 2 + edge.labeloffset;
          break;
        case "r":
          edge.x += edge.width / 2 + edge.labeloffset;
          break;
      }
    }
  });
}
function reversePointsForReversedEdges(g) {
  forEach_default(g.edges(), function(e) {
    var edge = g.edge(e);
    if (edge.reversed) {
      edge.points.reverse();
    }
  });
}
function removeBorderNodes(g) {
  forEach_default(g.nodes(), function(v) {
    if (g.children(v).length) {
      var node = g.node(v);
      var t = g.node(node.borderTop);
      var b = g.node(node.borderBottom);
      var l = g.node(last_default(node.borderLeft));
      var r = g.node(last_default(node.borderRight));
      node.width = Math.abs(r.x - l.x);
      node.height = Math.abs(b.y - t.y);
      node.x = l.x + node.width / 2;
      node.y = t.y + node.height / 2;
    }
  });
  forEach_default(g.nodes(), function(v) {
    if (g.node(v).dummy === "border") {
      g.removeNode(v);
    }
  });
}
function removeSelfEdges(g) {
  forEach_default(g.edges(), function(e) {
    if (e.v === e.w) {
      var node = g.node(e.v);
      if (!node.selfEdges) {
        node.selfEdges = [];
      }
      node.selfEdges.push({ e, label: g.edge(e) });
      g.removeEdge(e);
    }
  });
}
function insertSelfEdges(g) {
  var layers = buildLayerMatrix(g);
  forEach_default(layers, function(layer) {
    var orderShift = 0;
    forEach_default(layer, function(v, i) {
      var node = g.node(v);
      node.order = i + orderShift;
      forEach_default(node.selfEdges, function(selfEdge) {
        addDummyNode(g, "selfedge", {
          width: selfEdge.label.width,
          height: selfEdge.label.height,
          rank: node.rank,
          order: i + ++orderShift,
          e: selfEdge.e,
          label: selfEdge.label
        }, "_se");
      });
      delete node.selfEdges;
    });
  });
}
function positionSelfEdges(g) {
  forEach_default(g.nodes(), function(v) {
    var node = g.node(v);
    if (node.dummy === "selfedge") {
      var selfNode = g.node(node.e.v);
      var x = selfNode.x + selfNode.width / 2;
      var y = selfNode.y;
      var dx = node.x - x;
      var dy = selfNode.height / 2;
      g.setEdge(node.e, node.label);
      g.removeNode(v);
      node.label.points = [
        { x: x + 2 * dx / 3, y: y - dy },
        { x: x + 5 * dx / 6, y: y - dy },
        { x: x + dx, y },
        { x: x + 5 * dx / 6, y: y + dy },
        { x: x + 2 * dx / 3, y: y + dy }
      ];
      node.label.x = node.x;
      node.label.y = node.y;
    }
  });
}
function selectNumberAttrs(obj, attrs) {
  return mapValues_default(pick_default(obj, attrs), Number);
}
function canonicalize(attrs) {
  var newAttrs = {};
  forEach_default(attrs, function(v, k) {
    newAttrs[k.toLowerCase()] = v;
  });
  return newAttrs;
}

export { layout };

//# debugId=B40FE16A4C7319B064756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2RhZ3JlLWQzLWVzL3NyYy9kYWdyZS91dGlsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kYWdyZS1kMy1lcy9zcmMvZGFncmUvYWRkLWJvcmRlci1zZWdtZW50cy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZGFncmUtZDMtZXMvc3JjL2RhZ3JlL2Nvb3JkaW5hdGUtc3lzdGVtLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kYWdyZS1kMy1lcy9zcmMvZGFncmUvZGF0YS9saXN0LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kYWdyZS1kMy1lcy9zcmMvZGFncmUvZ3JlZWR5LWZhcy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZGFncmUtZDMtZXMvc3JjL2RhZ3JlL2FjeWNsaWMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2RhZ3JlLWQzLWVzL3NyYy9kYWdyZS9ub3JtYWxpemUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2RhZ3JlLWQzLWVzL3NyYy9kYWdyZS9yYW5rL3V0aWwuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2RhZ3JlLWQzLWVzL3NyYy9kYWdyZS9yYW5rL2ZlYXNpYmxlLXRyZWUuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2RhZ3JlLWQzLWVzL3NyYy9ncmFwaGxpYi9hbGcvZGlqa3N0cmEuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2RhZ3JlLWQzLWVzL3NyYy9ncmFwaGxpYi9hbGcvZmxveWQtd2Fyc2hhbGwuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2RhZ3JlLWQzLWVzL3NyYy9ncmFwaGxpYi9hbGcvdG9wc29ydC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZGFncmUtZDMtZXMvc3JjL2dyYXBobGliL2FsZy9kZnMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2RhZ3JlLWQzLWVzL3NyYy9ncmFwaGxpYi9hbGcvcG9zdG9yZGVyLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kYWdyZS1kMy1lcy9zcmMvZ3JhcGhsaWIvYWxnL3ByZW9yZGVyLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kYWdyZS1kMy1lcy9zcmMvZGFncmUvcmFuay9uZXR3b3JrLXNpbXBsZXguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2RhZ3JlLWQzLWVzL3NyYy9kYWdyZS9yYW5rL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kYWdyZS1kMy1lcy9zcmMvZGFncmUvbmVzdGluZy1ncmFwaC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZGFncmUtZDMtZXMvc3JjL2RhZ3JlL29yZGVyL2FkZC1zdWJncmFwaC1jb25zdHJhaW50cy5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZGFncmUtZDMtZXMvc3JjL2RhZ3JlL29yZGVyL2J1aWxkLWxheWVyLWdyYXBoLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kYWdyZS1kMy1lcy9zcmMvZGFncmUvb3JkZXIvY3Jvc3MtY291bnQuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2RhZ3JlLWQzLWVzL3NyYy9kYWdyZS9vcmRlci9pbml0LW9yZGVyLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kYWdyZS1kMy1lcy9zcmMvZGFncmUvb3JkZXIvYmFyeWNlbnRlci5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZGFncmUtZDMtZXMvc3JjL2RhZ3JlL29yZGVyL3Jlc29sdmUtY29uZmxpY3RzLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kYWdyZS1kMy1lcy9zcmMvZGFncmUvb3JkZXIvc29ydC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZGFncmUtZDMtZXMvc3JjL2RhZ3JlL29yZGVyL3NvcnQtc3ViZ3JhcGguanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2RhZ3JlLWQzLWVzL3NyYy9kYWdyZS9vcmRlci9pbmRleC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZGFncmUtZDMtZXMvc3JjL2RhZ3JlL3BhcmVudC1kdW1teS1jaGFpbnMuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2RhZ3JlLWQzLWVzL3NyYy9kYWdyZS9wb3NpdGlvbi9iay5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZGFncmUtZDMtZXMvc3JjL2RhZ3JlL3Bvc2l0aW9uL2luZGV4LmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kYWdyZS1kMy1lcy9zcmMvZGFncmUvbGF5b3V0LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgImltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoLWVzJztcbmltcG9ydCB7IEdyYXBoIH0gZnJvbSAnLi4vZ3JhcGhsaWIvaW5kZXguanMnO1xuXG5leHBvcnQge1xuICBhZGREdW1teU5vZGUsXG4gIHNpbXBsaWZ5LFxuICBhc05vbkNvbXBvdW5kR3JhcGgsXG4gIHN1Y2Nlc3NvcldlaWdodHMsXG4gIHByZWRlY2Vzc29yV2VpZ2h0cyxcbiAgaW50ZXJzZWN0UmVjdCxcbiAgYnVpbGRMYXllck1hdHJpeCxcbiAgbm9ybWFsaXplUmFua3MsXG4gIHJlbW92ZUVtcHR5UmFua3MsXG4gIGFkZEJvcmRlck5vZGUsXG4gIG1heFJhbmssXG4gIHBhcnRpdGlvbixcbiAgdGltZSxcbiAgbm90aW1lLFxufTtcblxuLypcbiAqIEFkZHMgYSBkdW1teSBub2RlIHRvIHRoZSBncmFwaCBhbmQgcmV0dXJuIHYuXG4gKi9cbmZ1bmN0aW9uIGFkZER1bW15Tm9kZShnLCB0eXBlLCBhdHRycywgbmFtZSkge1xuICB2YXIgdjtcbiAgZG8ge1xuICAgIHYgPSBfLnVuaXF1ZUlkKG5hbWUpO1xuICB9IHdoaWxlIChnLmhhc05vZGUodikpO1xuXG4gIGF0dHJzLmR1bW15ID0gdHlwZTtcbiAgZy5zZXROb2RlKHYsIGF0dHJzKTtcbiAgcmV0dXJuIHY7XG59XG5cbi8qXG4gKiBSZXR1cm5zIGEgbmV3IGdyYXBoIHdpdGggb25seSBzaW1wbGUgZWRnZXMuIEhhbmRsZXMgYWdncmVnYXRpb24gb2YgZGF0YVxuICogYXNzb2NpYXRlZCB3aXRoIG11bHRpLWVkZ2VzLlxuICovXG5mdW5jdGlvbiBzaW1wbGlmeShnKSB7XG4gIHZhciBzaW1wbGlmaWVkID0gbmV3IEdyYXBoKCkuc2V0R3JhcGgoZy5ncmFwaCgpKTtcbiAgXy5mb3JFYWNoKGcubm9kZXMoKSwgZnVuY3Rpb24gKHYpIHtcbiAgICBzaW1wbGlmaWVkLnNldE5vZGUodiwgZy5ub2RlKHYpKTtcbiAgfSk7XG4gIF8uZm9yRWFjaChnLmVkZ2VzKCksIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIHNpbXBsZUxhYmVsID0gc2ltcGxpZmllZC5lZGdlKGUudiwgZS53KSB8fCB7IHdlaWdodDogMCwgbWlubGVuOiAxIH07XG4gICAgdmFyIGxhYmVsID0gZy5lZGdlKGUpO1xuICAgIHNpbXBsaWZpZWQuc2V0RWRnZShlLnYsIGUudywge1xuICAgICAgd2VpZ2h0OiBzaW1wbGVMYWJlbC53ZWlnaHQgKyBsYWJlbC53ZWlnaHQsXG4gICAgICBtaW5sZW46IE1hdGgubWF4KHNpbXBsZUxhYmVsLm1pbmxlbiwgbGFiZWwubWlubGVuKSxcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiBzaW1wbGlmaWVkO1xufVxuXG5mdW5jdGlvbiBhc05vbkNvbXBvdW5kR3JhcGgoZykge1xuICB2YXIgc2ltcGxpZmllZCA9IG5ldyBHcmFwaCh7IG11bHRpZ3JhcGg6IGcuaXNNdWx0aWdyYXBoKCkgfSkuc2V0R3JhcGgoZy5ncmFwaCgpKTtcbiAgXy5mb3JFYWNoKGcubm9kZXMoKSwgZnVuY3Rpb24gKHYpIHtcbiAgICBpZiAoIWcuY2hpbGRyZW4odikubGVuZ3RoKSB7XG4gICAgICBzaW1wbGlmaWVkLnNldE5vZGUodiwgZy5ub2RlKHYpKTtcbiAgICB9XG4gIH0pO1xuICBfLmZvckVhY2goZy5lZGdlcygpLCBmdW5jdGlvbiAoZSkge1xuICAgIHNpbXBsaWZpZWQuc2V0RWRnZShlLCBnLmVkZ2UoZSkpO1xuICB9KTtcbiAgcmV0dXJuIHNpbXBsaWZpZWQ7XG59XG5cbmZ1bmN0aW9uIHN1Y2Nlc3NvcldlaWdodHMoZykge1xuICB2YXIgd2VpZ2h0TWFwID0gXy5tYXAoZy5ub2RlcygpLCBmdW5jdGlvbiAodikge1xuICAgIHZhciBzdWNzID0ge307XG4gICAgXy5mb3JFYWNoKGcub3V0RWRnZXModiksIGZ1bmN0aW9uIChlKSB7XG4gICAgICBzdWNzW2Uud10gPSAoc3Vjc1tlLnddIHx8IDApICsgZy5lZGdlKGUpLndlaWdodDtcbiAgICB9KTtcbiAgICByZXR1cm4gc3VjcztcbiAgfSk7XG4gIHJldHVybiBfLnppcE9iamVjdChnLm5vZGVzKCksIHdlaWdodE1hcCk7XG59XG5cbmZ1bmN0aW9uIHByZWRlY2Vzc29yV2VpZ2h0cyhnKSB7XG4gIHZhciB3ZWlnaHRNYXAgPSBfLm1hcChnLm5vZGVzKCksIGZ1bmN0aW9uICh2KSB7XG4gICAgdmFyIHByZWRzID0ge307XG4gICAgXy5mb3JFYWNoKGcuaW5FZGdlcyh2KSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIHByZWRzW2Uudl0gPSAocHJlZHNbZS52XSB8fCAwKSArIGcuZWRnZShlKS53ZWlnaHQ7XG4gICAgfSk7XG4gICAgcmV0dXJuIHByZWRzO1xuICB9KTtcbiAgcmV0dXJuIF8uemlwT2JqZWN0KGcubm9kZXMoKSwgd2VpZ2h0TWFwKTtcbn1cblxuLypcbiAqIEZpbmRzIHdoZXJlIGEgbGluZSBzdGFydGluZyBhdCBwb2ludCAoe3gsIHl9KSB3b3VsZCBpbnRlcnNlY3QgYSByZWN0YW5nbGVcbiAqICh7eCwgeSwgd2lkdGgsIGhlaWdodH0pIGlmIGl0IHdlcmUgcG9pbnRpbmcgYXQgdGhlIHJlY3RhbmdsZSdzIGNlbnRlci5cbiAqL1xuZnVuY3Rpb24gaW50ZXJzZWN0UmVjdChyZWN0LCBwb2ludCkge1xuICB2YXIgeCA9IHJlY3QueDtcbiAgdmFyIHkgPSByZWN0Lnk7XG5cbiAgLy8gUmVjdGFuZ2xlIGludGVyc2VjdGlvbiBhbGdvcml0aG0gZnJvbTpcbiAgLy8gaHR0cDovL21hdGguc3RhY2tleGNoYW5nZS5jb20vcXVlc3Rpb25zLzEwODExMy9maW5kLWVkZ2UtYmV0d2Vlbi10d28tYm94ZXNcbiAgdmFyIGR4ID0gcG9pbnQueCAtIHg7XG4gIHZhciBkeSA9IHBvaW50LnkgLSB5O1xuICB2YXIgdyA9IHJlY3Qud2lkdGggLyAyO1xuICB2YXIgaCA9IHJlY3QuaGVpZ2h0IC8gMjtcblxuICBpZiAoIWR4ICYmICFkeSkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IHBvc3NpYmxlIHRvIGZpbmQgaW50ZXJzZWN0aW9uIGluc2lkZSBvZiB0aGUgcmVjdGFuZ2xlJyk7XG4gIH1cblxuICB2YXIgc3gsIHN5O1xuICBpZiAoTWF0aC5hYnMoZHkpICogdyA+IE1hdGguYWJzKGR4KSAqIGgpIHtcbiAgICAvLyBJbnRlcnNlY3Rpb24gaXMgdG9wIG9yIGJvdHRvbSBvZiByZWN0LlxuICAgIGlmIChkeSA8IDApIHtcbiAgICAgIGggPSAtaDtcbiAgICB9XG4gICAgc3ggPSAoaCAqIGR4KSAvIGR5O1xuICAgIHN5ID0gaDtcbiAgfSBlbHNlIHtcbiAgICAvLyBJbnRlcnNlY3Rpb24gaXMgbGVmdCBvciByaWdodCBvZiByZWN0LlxuICAgIGlmIChkeCA8IDApIHtcbiAgICAgIHcgPSAtdztcbiAgICB9XG4gICAgc3ggPSB3O1xuICAgIHN5ID0gKHcgKiBkeSkgLyBkeDtcbiAgfVxuXG4gIHJldHVybiB7IHg6IHggKyBzeCwgeTogeSArIHN5IH07XG59XG5cbi8qXG4gKiBHaXZlbiBhIERBRyB3aXRoIGVhY2ggbm9kZSBhc3NpZ25lZCBcInJhbmtcIiBhbmQgXCJvcmRlclwiIHByb3BlcnRpZXMsIHRoaXNcbiAqIGZ1bmN0aW9uIHdpbGwgcHJvZHVjZSBhIG1hdHJpeCB3aXRoIHRoZSBpZHMgb2YgZWFjaCBub2RlLlxuICovXG5mdW5jdGlvbiBidWlsZExheWVyTWF0cml4KGcpIHtcbiAgdmFyIGxheWVyaW5nID0gXy5tYXAoXy5yYW5nZShtYXhSYW5rKGcpICsgMSksIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gW107XG4gIH0pO1xuICBfLmZvckVhY2goZy5ub2RlcygpLCBmdW5jdGlvbiAodikge1xuICAgIHZhciBub2RlID0gZy5ub2RlKHYpO1xuICAgIHZhciByYW5rID0gbm9kZS5yYW5rO1xuICAgIGlmICghXy5pc1VuZGVmaW5lZChyYW5rKSkge1xuICAgICAgbGF5ZXJpbmdbcmFua11bbm9kZS5vcmRlcl0gPSB2O1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBsYXllcmluZztcbn1cblxuLypcbiAqIEFkanVzdHMgdGhlIHJhbmtzIGZvciBhbGwgbm9kZXMgaW4gdGhlIGdyYXBoIHN1Y2ggdGhhdCBhbGwgbm9kZXMgdiBoYXZlXG4gKiByYW5rKHYpID49IDAgYW5kIGF0IGxlYXN0IG9uZSBub2RlIHcgaGFzIHJhbmsodykgPSAwLlxuICovXG5mdW5jdGlvbiBub3JtYWxpemVSYW5rcyhnKSB7XG4gIHZhciBtaW4gPSBfLm1pbihcbiAgICBfLm1hcChnLm5vZGVzKCksIGZ1bmN0aW9uICh2KSB7XG4gICAgICByZXR1cm4gZy5ub2RlKHYpLnJhbms7XG4gICAgfSksXG4gICk7XG4gIF8uZm9yRWFjaChnLm5vZGVzKCksIGZ1bmN0aW9uICh2KSB7XG4gICAgdmFyIG5vZGUgPSBnLm5vZGUodik7XG4gICAgaWYgKF8uaGFzKG5vZGUsICdyYW5rJykpIHtcbiAgICAgIG5vZGUucmFuayAtPSBtaW47XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRW1wdHlSYW5rcyhnKSB7XG4gIC8vIFJhbmtzIG1heSBub3Qgc3RhcnQgYXQgMCwgc28gd2UgbmVlZCB0byBvZmZzZXQgdGhlbVxuICB2YXIgb2Zmc2V0ID0gXy5taW4oXG4gICAgXy5tYXAoZy5ub2RlcygpLCBmdW5jdGlvbiAodikge1xuICAgICAgcmV0dXJuIGcubm9kZSh2KS5yYW5rO1xuICAgIH0pLFxuICApO1xuXG4gIHZhciBsYXllcnMgPSBbXTtcbiAgXy5mb3JFYWNoKGcubm9kZXMoKSwgZnVuY3Rpb24gKHYpIHtcbiAgICB2YXIgcmFuayA9IGcubm9kZSh2KS5yYW5rIC0gb2Zmc2V0O1xuICAgIGlmICghbGF5ZXJzW3JhbmtdKSB7XG4gICAgICBsYXllcnNbcmFua10gPSBbXTtcbiAgICB9XG4gICAgbGF5ZXJzW3JhbmtdLnB1c2godik7XG4gIH0pO1xuXG4gIHZhciBkZWx0YSA9IDA7XG4gIHZhciBub2RlUmFua0ZhY3RvciA9IGcuZ3JhcGgoKS5ub2RlUmFua0ZhY3RvcjtcbiAgXy5mb3JFYWNoKGxheWVycywgZnVuY3Rpb24gKHZzLCBpKSB7XG4gICAgaWYgKF8uaXNVbmRlZmluZWQodnMpICYmIGkgJSBub2RlUmFua0ZhY3RvciAhPT0gMCkge1xuICAgICAgLS1kZWx0YTtcbiAgICB9IGVsc2UgaWYgKGRlbHRhKSB7XG4gICAgICBfLmZvckVhY2godnMsIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIGcubm9kZSh2KS5yYW5rICs9IGRlbHRhO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkQm9yZGVyTm9kZShnLCBwcmVmaXgsIHJhbmssIG9yZGVyKSB7XG4gIHZhciBub2RlID0ge1xuICAgIHdpZHRoOiAwLFxuICAgIGhlaWdodDogMCxcbiAgfTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gNCkge1xuICAgIG5vZGUucmFuayA9IHJhbms7XG4gICAgbm9kZS5vcmRlciA9IG9yZGVyO1xuICB9XG4gIHJldHVybiBhZGREdW1teU5vZGUoZywgJ2JvcmRlcicsIG5vZGUsIHByZWZpeCk7XG59XG5cbmZ1bmN0aW9uIG1heFJhbmsoZykge1xuICByZXR1cm4gXy5tYXgoXG4gICAgXy5tYXAoZy5ub2RlcygpLCBmdW5jdGlvbiAodikge1xuICAgICAgdmFyIHJhbmsgPSBnLm5vZGUodikucmFuaztcbiAgICAgIGlmICghXy5pc1VuZGVmaW5lZChyYW5rKSkge1xuICAgICAgICByZXR1cm4gcmFuaztcbiAgICAgIH1cbiAgICB9KSxcbiAgKTtcbn1cblxuLypcbiAqIFBhcnRpdGlvbiBhIGNvbGxlY3Rpb24gaW50byB0d28gZ3JvdXBzOiBgbGhzYCBhbmQgYHJoc2AuIElmIHRoZSBzdXBwbGllZFxuICogZnVuY3Rpb24gcmV0dXJucyB0cnVlIGZvciBhbiBlbnRyeSBpdCBnb2VzIGludG8gYGxoc2AuIE90aGVyd2lzZSBpdCBnb2VzXG4gKiBpbnRvIGByaHMuXG4gKi9cbmZ1bmN0aW9uIHBhcnRpdGlvbihjb2xsZWN0aW9uLCBmbikge1xuICB2YXIgcmVzdWx0ID0geyBsaHM6IFtdLCByaHM6IFtdIH07XG4gIF8uZm9yRWFjaChjb2xsZWN0aW9uLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAoZm4odmFsdWUpKSB7XG4gICAgICByZXN1bHQubGhzLnB1c2godmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucmhzLnB1c2godmFsdWUpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qXG4gKiBSZXR1cm5zIGEgbmV3IGZ1bmN0aW9uIHRoYXQgd3JhcHMgYGZuYCB3aXRoIGEgdGltZXIuIFRoZSB3cmFwcGVyIGxvZ3MgdGhlXG4gKiB0aW1lIGl0IHRha2VzIHRvIGV4ZWN1dGUgdGhlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiB0aW1lKG5hbWUsIGZuKSB7XG4gIHZhciBzdGFydCA9IF8ubm93KCk7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGZuKCk7XG4gIH0gZmluYWxseSB7XG4gICAgY29uc29sZS5sb2cobmFtZSArICcgdGltZTogJyArIChfLm5vdygpIC0gc3RhcnQpICsgJ21zJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbm90aW1lKG5hbWUsIGZuKSB7XG4gIHJldHVybiBmbigpO1xufVxuIiwKICAgICJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaC1lcyc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCB7IGFkZEJvcmRlclNlZ21lbnRzIH07XG5cbmZ1bmN0aW9uIGFkZEJvcmRlclNlZ21lbnRzKGcpIHtcbiAgZnVuY3Rpb24gZGZzKHYpIHtcbiAgICB2YXIgY2hpbGRyZW4gPSBnLmNoaWxkcmVuKHYpO1xuICAgIHZhciBub2RlID0gZy5ub2RlKHYpO1xuICAgIGlmIChjaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIF8uZm9yRWFjaChjaGlsZHJlbiwgZGZzKTtcbiAgICB9XG5cbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG5vZGUsICdtaW5SYW5rJykpIHtcbiAgICAgIG5vZGUuYm9yZGVyTGVmdCA9IFtdO1xuICAgICAgbm9kZS5ib3JkZXJSaWdodCA9IFtdO1xuICAgICAgZm9yICh2YXIgcmFuayA9IG5vZGUubWluUmFuaywgbWF4UmFuayA9IG5vZGUubWF4UmFuayArIDE7IHJhbmsgPCBtYXhSYW5rOyArK3JhbmspIHtcbiAgICAgICAgYWRkQm9yZGVyTm9kZShnLCAnYm9yZGVyTGVmdCcsICdfYmwnLCB2LCBub2RlLCByYW5rKTtcbiAgICAgICAgYWRkQm9yZGVyTm9kZShnLCAnYm9yZGVyUmlnaHQnLCAnX2JyJywgdiwgbm9kZSwgcmFuayk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgXy5mb3JFYWNoKGcuY2hpbGRyZW4oKSwgZGZzKTtcbn1cblxuZnVuY3Rpb24gYWRkQm9yZGVyTm9kZShnLCBwcm9wLCBwcmVmaXgsIHNnLCBzZ05vZGUsIHJhbmspIHtcbiAgdmFyIGxhYmVsID0geyB3aWR0aDogMCwgaGVpZ2h0OiAwLCByYW5rOiByYW5rLCBib3JkZXJUeXBlOiBwcm9wIH07XG4gIHZhciBwcmV2ID0gc2dOb2RlW3Byb3BdW3JhbmsgLSAxXTtcbiAgdmFyIGN1cnIgPSB1dGlsLmFkZER1bW15Tm9kZShnLCAnYm9yZGVyJywgbGFiZWwsIHByZWZpeCk7XG4gIHNnTm9kZVtwcm9wXVtyYW5rXSA9IGN1cnI7XG4gIGcuc2V0UGFyZW50KGN1cnIsIHNnKTtcbiAgaWYgKHByZXYpIHtcbiAgICBnLnNldEVkZ2UocHJldiwgY3VyciwgeyB3ZWlnaHQ6IDEgfSk7XG4gIH1cbn1cbiIsCiAgICAiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gtZXMnO1xuXG5leHBvcnQgeyBhZGp1c3QsIHVuZG8gfTtcblxuZnVuY3Rpb24gYWRqdXN0KGcpIHtcbiAgdmFyIHJhbmtEaXIgPSBnLmdyYXBoKCkucmFua2Rpci50b0xvd2VyQ2FzZSgpO1xuICBpZiAocmFua0RpciA9PT0gJ2xyJyB8fCByYW5rRGlyID09PSAncmwnKSB7XG4gICAgc3dhcFdpZHRoSGVpZ2h0KGcpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHVuZG8oZykge1xuICB2YXIgcmFua0RpciA9IGcuZ3JhcGgoKS5yYW5rZGlyLnRvTG93ZXJDYXNlKCk7XG4gIGlmIChyYW5rRGlyID09PSAnYnQnIHx8IHJhbmtEaXIgPT09ICdybCcpIHtcbiAgICByZXZlcnNlWShnKTtcbiAgfVxuXG4gIGlmIChyYW5rRGlyID09PSAnbHInIHx8IHJhbmtEaXIgPT09ICdybCcpIHtcbiAgICBzd2FwWFkoZyk7XG4gICAgc3dhcFdpZHRoSGVpZ2h0KGcpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHN3YXBXaWR0aEhlaWdodChnKSB7XG4gIF8uZm9yRWFjaChnLm5vZGVzKCksIGZ1bmN0aW9uICh2KSB7XG4gICAgc3dhcFdpZHRoSGVpZ2h0T25lKGcubm9kZSh2KSk7XG4gIH0pO1xuICBfLmZvckVhY2goZy5lZGdlcygpLCBmdW5jdGlvbiAoZSkge1xuICAgIHN3YXBXaWR0aEhlaWdodE9uZShnLmVkZ2UoZSkpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc3dhcFdpZHRoSGVpZ2h0T25lKGF0dHJzKSB7XG4gIHZhciB3ID0gYXR0cnMud2lkdGg7XG4gIGF0dHJzLndpZHRoID0gYXR0cnMuaGVpZ2h0O1xuICBhdHRycy5oZWlnaHQgPSB3O1xufVxuXG5mdW5jdGlvbiByZXZlcnNlWShnKSB7XG4gIF8uZm9yRWFjaChnLm5vZGVzKCksIGZ1bmN0aW9uICh2KSB7XG4gICAgcmV2ZXJzZVlPbmUoZy5ub2RlKHYpKTtcbiAgfSk7XG5cbiAgXy5mb3JFYWNoKGcuZWRnZXMoKSwgZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgZWRnZSA9IGcuZWRnZShlKTtcbiAgICBfLmZvckVhY2goZWRnZS5wb2ludHMsIHJldmVyc2VZT25lKTtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGVkZ2UsICd5JykpIHtcbiAgICAgIHJldmVyc2VZT25lKGVkZ2UpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJldmVyc2VZT25lKGF0dHJzKSB7XG4gIGF0dHJzLnkgPSAtYXR0cnMueTtcbn1cblxuZnVuY3Rpb24gc3dhcFhZKGcpIHtcbiAgXy5mb3JFYWNoKGcubm9kZXMoKSwgZnVuY3Rpb24gKHYpIHtcbiAgICBzd2FwWFlPbmUoZy5ub2RlKHYpKTtcbiAgfSk7XG5cbiAgXy5mb3JFYWNoKGcuZWRnZXMoKSwgZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgZWRnZSA9IGcuZWRnZShlKTtcbiAgICBfLmZvckVhY2goZWRnZS5wb2ludHMsIHN3YXBYWU9uZSk7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlZGdlLCAneCcpKSB7XG4gICAgICBzd2FwWFlPbmUoZWRnZSk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gc3dhcFhZT25lKGF0dHJzKSB7XG4gIHZhciB4ID0gYXR0cnMueDtcbiAgYXR0cnMueCA9IGF0dHJzLnk7XG4gIGF0dHJzLnkgPSB4O1xufVxuIiwKICAgICIvKlxuICogU2ltcGxlIGRvdWJseSBsaW5rZWQgbGlzdCBpbXBsZW1lbnRhdGlvbiBkZXJpdmVkIGZyb20gQ29ybWVuLCBldCBhbC4sXG4gKiBcIkludHJvZHVjdGlvbiB0byBBbGdvcml0aG1zXCIuXG4gKi9cblxuZXhwb3J0IHsgTGlzdCB9O1xuXG5jbGFzcyBMaXN0IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdmFyIHNlbnRpbmVsID0ge307XG4gICAgc2VudGluZWwuX25leHQgPSBzZW50aW5lbC5fcHJldiA9IHNlbnRpbmVsO1xuICAgIHRoaXMuX3NlbnRpbmVsID0gc2VudGluZWw7XG4gIH1cbiAgZGVxdWV1ZSgpIHtcbiAgICB2YXIgc2VudGluZWwgPSB0aGlzLl9zZW50aW5lbDtcbiAgICB2YXIgZW50cnkgPSBzZW50aW5lbC5fcHJldjtcbiAgICBpZiAoZW50cnkgIT09IHNlbnRpbmVsKSB7XG4gICAgICB1bmxpbmsoZW50cnkpO1xuICAgICAgcmV0dXJuIGVudHJ5O1xuICAgIH1cbiAgfVxuICBlbnF1ZXVlKGVudHJ5KSB7XG4gICAgdmFyIHNlbnRpbmVsID0gdGhpcy5fc2VudGluZWw7XG4gICAgaWYgKGVudHJ5Ll9wcmV2ICYmIGVudHJ5Ll9uZXh0KSB7XG4gICAgICB1bmxpbmsoZW50cnkpO1xuICAgIH1cbiAgICBlbnRyeS5fbmV4dCA9IHNlbnRpbmVsLl9uZXh0O1xuICAgIHNlbnRpbmVsLl9uZXh0Ll9wcmV2ID0gZW50cnk7XG4gICAgc2VudGluZWwuX25leHQgPSBlbnRyeTtcbiAgICBlbnRyeS5fcHJldiA9IHNlbnRpbmVsO1xuICB9XG4gIHRvU3RyaW5nKCkge1xuICAgIHZhciBzdHJzID0gW107XG4gICAgdmFyIHNlbnRpbmVsID0gdGhpcy5fc2VudGluZWw7XG4gICAgdmFyIGN1cnIgPSBzZW50aW5lbC5fcHJldjtcbiAgICB3aGlsZSAoY3VyciAhPT0gc2VudGluZWwpIHtcbiAgICAgIHN0cnMucHVzaChKU09OLnN0cmluZ2lmeShjdXJyLCBmaWx0ZXJPdXRMaW5rcykpO1xuICAgICAgY3VyciA9IGN1cnIuX3ByZXY7XG4gICAgfVxuICAgIHJldHVybiAnWycgKyBzdHJzLmpvaW4oJywgJykgKyAnXSc7XG4gIH1cbn1cblxuZnVuY3Rpb24gdW5saW5rKGVudHJ5KSB7XG4gIGVudHJ5Ll9wcmV2Ll9uZXh0ID0gZW50cnkuX25leHQ7XG4gIGVudHJ5Ll9uZXh0Ll9wcmV2ID0gZW50cnkuX3ByZXY7XG4gIGRlbGV0ZSBlbnRyeS5fbmV4dDtcbiAgZGVsZXRlIGVudHJ5Ll9wcmV2O1xufVxuXG5mdW5jdGlvbiBmaWx0ZXJPdXRMaW5rcyhrLCB2KSB7XG4gIGlmIChrICE9PSAnX25leHQnICYmIGsgIT09ICdfcHJldicpIHtcbiAgICByZXR1cm4gdjtcbiAgfVxufVxuIiwKICAgICJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaC1lcyc7XG5pbXBvcnQgeyBHcmFwaCB9IGZyb20gJy4uL2dyYXBobGliL2luZGV4LmpzJztcbmltcG9ydCB7IExpc3QgfSBmcm9tICcuL2RhdGEvbGlzdC5qcyc7XG5cbi8qXG4gKiBBIGdyZWVkeSBoZXVyaXN0aWMgZm9yIGZpbmRpbmcgYSBmZWVkYmFjayBhcmMgc2V0IGZvciBhIGdyYXBoLiBBIGZlZWRiYWNrXG4gKiBhcmMgc2V0IGlzIGEgc2V0IG9mIGVkZ2VzIHRoYXQgY2FuIGJlIHJlbW92ZWQgdG8gbWFrZSBhIGdyYXBoIGFjeWNsaWMuXG4gKiBUaGUgYWxnb3JpdGhtIGNvbWVzIGZyb206IFAuIEVhZGVzLCBYLiBMaW4sIGFuZCBXLiBGLiBTbXl0aCwgXCJBIGZhc3QgYW5kXG4gKiBlZmZlY3RpdmUgaGV1cmlzdGljIGZvciB0aGUgZmVlZGJhY2sgYXJjIHNldCBwcm9ibGVtLlwiIFRoaXMgaW1wbGVtZW50YXRpb25cbiAqIGFkanVzdHMgdGhhdCBmcm9tIHRoZSBwYXBlciB0byBhbGxvdyBmb3Igd2VpZ2h0ZWQgZWRnZXMuXG4gKi9cbmV4cG9ydCB7IGdyZWVkeUZBUyB9O1xuXG52YXIgREVGQVVMVF9XRUlHSFRfRk4gPSBfLmNvbnN0YW50KDEpO1xuXG5mdW5jdGlvbiBncmVlZHlGQVMoZywgd2VpZ2h0Rm4pIHtcbiAgaWYgKGcubm9kZUNvdW50KCkgPD0gMSkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICB2YXIgc3RhdGUgPSBidWlsZFN0YXRlKGcsIHdlaWdodEZuIHx8IERFRkFVTFRfV0VJR0hUX0ZOKTtcbiAgdmFyIHJlc3VsdHMgPSBkb0dyZWVkeUZBUyhzdGF0ZS5ncmFwaCwgc3RhdGUuYnVja2V0cywgc3RhdGUuemVyb0lkeCk7XG5cbiAgLy8gRXhwYW5kIG11bHRpLWVkZ2VzXG4gIHJldHVybiBfLmZsYXR0ZW4oXG4gICAgXy5tYXAocmVzdWx0cywgZnVuY3Rpb24gKGUpIHtcbiAgICAgIHJldHVybiBnLm91dEVkZ2VzKGUudiwgZS53KTtcbiAgICB9KSxcbiAgKTtcbn1cblxuZnVuY3Rpb24gZG9HcmVlZHlGQVMoZywgYnVja2V0cywgemVyb0lkeCkge1xuICB2YXIgcmVzdWx0cyA9IFtdO1xuICB2YXIgc291cmNlcyA9IGJ1Y2tldHNbYnVja2V0cy5sZW5ndGggLSAxXTtcbiAgdmFyIHNpbmtzID0gYnVja2V0c1swXTtcblxuICB2YXIgZW50cnk7XG4gIHdoaWxlIChnLm5vZGVDb3VudCgpKSB7XG4gICAgd2hpbGUgKChlbnRyeSA9IHNpbmtzLmRlcXVldWUoKSkpIHtcbiAgICAgIHJlbW92ZU5vZGUoZywgYnVja2V0cywgemVyb0lkeCwgZW50cnkpO1xuICAgIH1cbiAgICB3aGlsZSAoKGVudHJ5ID0gc291cmNlcy5kZXF1ZXVlKCkpKSB7XG4gICAgICByZW1vdmVOb2RlKGcsIGJ1Y2tldHMsIHplcm9JZHgsIGVudHJ5KTtcbiAgICB9XG4gICAgaWYgKGcubm9kZUNvdW50KCkpIHtcbiAgICAgIGZvciAodmFyIGkgPSBidWNrZXRzLmxlbmd0aCAtIDI7IGkgPiAwOyAtLWkpIHtcbiAgICAgICAgZW50cnkgPSBidWNrZXRzW2ldLmRlcXVldWUoKTtcbiAgICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KHJlbW92ZU5vZGUoZywgYnVja2V0cywgemVyb0lkeCwgZW50cnksIHRydWUpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHRzO1xufVxuXG5mdW5jdGlvbiByZW1vdmVOb2RlKGcsIGJ1Y2tldHMsIHplcm9JZHgsIGVudHJ5LCBjb2xsZWN0UHJlZGVjZXNzb3JzKSB7XG4gIHZhciByZXN1bHRzID0gY29sbGVjdFByZWRlY2Vzc29ycyA/IFtdIDogdW5kZWZpbmVkO1xuXG4gIF8uZm9yRWFjaChnLmluRWRnZXMoZW50cnkudiksIGZ1bmN0aW9uIChlZGdlKSB7XG4gICAgdmFyIHdlaWdodCA9IGcuZWRnZShlZGdlKTtcbiAgICB2YXIgdUVudHJ5ID0gZy5ub2RlKGVkZ2Uudik7XG5cbiAgICBpZiAoY29sbGVjdFByZWRlY2Vzc29ycykge1xuICAgICAgcmVzdWx0cy5wdXNoKHsgdjogZWRnZS52LCB3OiBlZGdlLncgfSk7XG4gICAgfVxuXG4gICAgdUVudHJ5Lm91dCAtPSB3ZWlnaHQ7XG4gICAgYXNzaWduQnVja2V0KGJ1Y2tldHMsIHplcm9JZHgsIHVFbnRyeSk7XG4gIH0pO1xuXG4gIF8uZm9yRWFjaChnLm91dEVkZ2VzKGVudHJ5LnYpLCBmdW5jdGlvbiAoZWRnZSkge1xuICAgIHZhciB3ZWlnaHQgPSBnLmVkZ2UoZWRnZSk7XG4gICAgdmFyIHcgPSBlZGdlLnc7XG4gICAgdmFyIHdFbnRyeSA9IGcubm9kZSh3KTtcbiAgICB3RW50cnlbJ2luJ10gLT0gd2VpZ2h0O1xuICAgIGFzc2lnbkJ1Y2tldChidWNrZXRzLCB6ZXJvSWR4LCB3RW50cnkpO1xuICB9KTtcblxuICBnLnJlbW92ZU5vZGUoZW50cnkudik7XG5cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkU3RhdGUoZywgd2VpZ2h0Rm4pIHtcbiAgdmFyIGZhc0dyYXBoID0gbmV3IEdyYXBoKCk7XG4gIHZhciBtYXhJbiA9IDA7XG4gIHZhciBtYXhPdXQgPSAwO1xuXG4gIF8uZm9yRWFjaChnLm5vZGVzKCksIGZ1bmN0aW9uICh2KSB7XG4gICAgZmFzR3JhcGguc2V0Tm9kZSh2LCB7IHY6IHYsIGluOiAwLCBvdXQ6IDAgfSk7XG4gIH0pO1xuXG4gIC8vIEFnZ3JlZ2F0ZSB3ZWlnaHRzIG9uIG5vZGVzLCBidXQgYWxzbyBzdW0gdGhlIHdlaWdodHMgYWNyb3NzIG11bHRpLWVkZ2VzXG4gIC8vIGludG8gYSBzaW5nbGUgZWRnZSBmb3IgdGhlIGZhc0dyYXBoLlxuICBfLmZvckVhY2goZy5lZGdlcygpLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBwcmV2V2VpZ2h0ID0gZmFzR3JhcGguZWRnZShlLnYsIGUudykgfHwgMDtcbiAgICB2YXIgd2VpZ2h0ID0gd2VpZ2h0Rm4oZSk7XG4gICAgdmFyIGVkZ2VXZWlnaHQgPSBwcmV2V2VpZ2h0ICsgd2VpZ2h0O1xuICAgIGZhc0dyYXBoLnNldEVkZ2UoZS52LCBlLncsIGVkZ2VXZWlnaHQpO1xuICAgIG1heE91dCA9IE1hdGgubWF4KG1heE91dCwgKGZhc0dyYXBoLm5vZGUoZS52KS5vdXQgKz0gd2VpZ2h0KSk7XG4gICAgbWF4SW4gPSBNYXRoLm1heChtYXhJbiwgKGZhc0dyYXBoLm5vZGUoZS53KVsnaW4nXSArPSB3ZWlnaHQpKTtcbiAgfSk7XG5cbiAgdmFyIGJ1Y2tldHMgPSBfLnJhbmdlKG1heE91dCArIG1heEluICsgMykubWFwKGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gbmV3IExpc3QoKTtcbiAgfSk7XG4gIHZhciB6ZXJvSWR4ID0gbWF4SW4gKyAxO1xuXG4gIF8uZm9yRWFjaChmYXNHcmFwaC5ub2RlcygpLCBmdW5jdGlvbiAodikge1xuICAgIGFzc2lnbkJ1Y2tldChidWNrZXRzLCB6ZXJvSWR4LCBmYXNHcmFwaC5ub2RlKHYpKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHsgZ3JhcGg6IGZhc0dyYXBoLCBidWNrZXRzOiBidWNrZXRzLCB6ZXJvSWR4OiB6ZXJvSWR4IH07XG59XG5cbmZ1bmN0aW9uIGFzc2lnbkJ1Y2tldChidWNrZXRzLCB6ZXJvSWR4LCBlbnRyeSkge1xuICBpZiAoIWVudHJ5Lm91dCkge1xuICAgIGJ1Y2tldHNbMF0uZW5xdWV1ZShlbnRyeSk7XG4gIH0gZWxzZSBpZiAoIWVudHJ5WydpbiddKSB7XG4gICAgYnVja2V0c1tidWNrZXRzLmxlbmd0aCAtIDFdLmVucXVldWUoZW50cnkpO1xuICB9IGVsc2Uge1xuICAgIGJ1Y2tldHNbZW50cnkub3V0IC0gZW50cnlbJ2luJ10gKyB6ZXJvSWR4XS5lbnF1ZXVlKGVudHJ5KTtcbiAgfVxufVxuIiwKICAgICJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaC1lcyc7XG5pbXBvcnQgeyBncmVlZHlGQVMgfSBmcm9tICcuL2dyZWVkeS1mYXMuanMnO1xuXG5leHBvcnQgeyBydW4sIHVuZG8gfTtcblxuZnVuY3Rpb24gcnVuKGcpIHtcbiAgdmFyIGZhcyA9IGcuZ3JhcGgoKS5hY3ljbGljZXIgPT09ICdncmVlZHknID8gZ3JlZWR5RkFTKGcsIHdlaWdodEZuKGcpKSA6IGRmc0ZBUyhnKTtcbiAgXy5mb3JFYWNoKGZhcywgZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgbGFiZWwgPSBnLmVkZ2UoZSk7XG4gICAgZy5yZW1vdmVFZGdlKGUpO1xuICAgIGxhYmVsLmZvcndhcmROYW1lID0gZS5uYW1lO1xuICAgIGxhYmVsLnJldmVyc2VkID0gdHJ1ZTtcbiAgICBnLnNldEVkZ2UoZS53LCBlLnYsIGxhYmVsLCBfLnVuaXF1ZUlkKCdyZXYnKSk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHdlaWdodEZuKGcpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGUpIHtcbiAgICAgIHJldHVybiBnLmVkZ2UoZSkud2VpZ2h0O1xuICAgIH07XG4gIH1cbn1cblxuZnVuY3Rpb24gZGZzRkFTKGcpIHtcbiAgdmFyIGZhcyA9IFtdO1xuICB2YXIgc3RhY2sgPSB7fTtcbiAgdmFyIHZpc2l0ZWQgPSB7fTtcblxuICBmdW5jdGlvbiBkZnModikge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmlzaXRlZCwgdikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmlzaXRlZFt2XSA9IHRydWU7XG4gICAgc3RhY2tbdl0gPSB0cnVlO1xuICAgIF8uZm9yRWFjaChnLm91dEVkZ2VzKHYpLCBmdW5jdGlvbiAoZSkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzdGFjaywgZS53KSkge1xuICAgICAgICBmYXMucHVzaChlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRmcyhlLncpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGRlbGV0ZSBzdGFja1t2XTtcbiAgfVxuXG4gIF8uZm9yRWFjaChnLm5vZGVzKCksIGRmcyk7XG4gIHJldHVybiBmYXM7XG59XG5cbmZ1bmN0aW9uIHVuZG8oZykge1xuICBfLmZvckVhY2goZy5lZGdlcygpLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBsYWJlbCA9IGcuZWRnZShlKTtcbiAgICBpZiAobGFiZWwucmV2ZXJzZWQpIHtcbiAgICAgIGcucmVtb3ZlRWRnZShlKTtcblxuICAgICAgdmFyIGZvcndhcmROYW1lID0gbGFiZWwuZm9yd2FyZE5hbWU7XG4gICAgICBkZWxldGUgbGFiZWwucmV2ZXJzZWQ7XG4gICAgICBkZWxldGUgbGFiZWwuZm9yd2FyZE5hbWU7XG4gICAgICBnLnNldEVkZ2UoZS53LCBlLnYsIGxhYmVsLCBmb3J3YXJkTmFtZSk7XG4gICAgfVxuICB9KTtcbn1cbiIsCiAgICAiLyoqXG4gKiBUeXBlU2NyaXB0IHR5cGUgaW1wb3J0czpcbiAqXG4gKiBAaW1wb3J0IHsgR3JhcGggfSBmcm9tICcuLi9ncmFwaGxpYi9ncmFwaC5qcyc7XG4gKi9cbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoLWVzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IHsgcnVuLCB1bmRvIH07XG5cbi8qXG4gKiBCcmVha3MgYW55IGxvbmcgZWRnZXMgaW4gdGhlIGdyYXBoIGludG8gc2hvcnQgc2VnbWVudHMgdGhhdCBzcGFuIDEgbGF5ZXJcbiAqIGVhY2guIFRoaXMgb3BlcmF0aW9uIGlzIHVuZG9hYmxlIHdpdGggdGhlIGRlbm9ybWFsaXplIGZ1bmN0aW9uLlxuICpcbiAqIFByZS1jb25kaXRpb25zOlxuICpcbiAqICAgIDEuIFRoZSBpbnB1dCBncmFwaCBpcyBhIERBRy5cbiAqICAgIDIuIEVhY2ggbm9kZSBpbiB0aGUgZ3JhcGggaGFzIGEgXCJyYW5rXCIgcHJvcGVydHkuXG4gKlxuICogUG9zdC1jb25kaXRpb246XG4gKlxuICogICAgMS4gQWxsIGVkZ2VzIGluIHRoZSBncmFwaCBoYXZlIGEgbGVuZ3RoIG9mIDEuXG4gKiAgICAyLiBEdW1teSBub2RlcyBhcmUgYWRkZWQgd2hlcmUgZWRnZXMgaGF2ZSBiZWVuIHNwbGl0IGludG8gc2VnbWVudHMuXG4gKiAgICAzLiBUaGUgZ3JhcGggaXMgYXVnbWVudGVkIHdpdGggYSBcImR1bW15Q2hhaW5zXCIgYXR0cmlidXRlIHdoaWNoIGNvbnRhaW5zXG4gKiAgICAgICB0aGUgZmlyc3QgZHVtbXkgaW4gZWFjaCBjaGFpbiBvZiBkdW1teSBub2RlcyBwcm9kdWNlZC5cbiAqL1xuZnVuY3Rpb24gcnVuKGcpIHtcbiAgZy5ncmFwaCgpLmR1bW15Q2hhaW5zID0gW107XG4gIF8uZm9yRWFjaChnLmVkZ2VzKCksIGZ1bmN0aW9uIChlZGdlKSB7XG4gICAgbm9ybWFsaXplRWRnZShnLCBlZGdlKTtcbiAgfSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtHcmFwaH0gZ1xuICovXG5mdW5jdGlvbiBub3JtYWxpemVFZGdlKGcsIGUpIHtcbiAgdmFyIHYgPSBlLnY7XG4gIHZhciB2UmFuayA9IGcubm9kZSh2KS5yYW5rO1xuICB2YXIgdyA9IGUudztcbiAgdmFyIHdSYW5rID0gZy5ub2RlKHcpLnJhbms7XG4gIHZhciBuYW1lID0gZS5uYW1lO1xuICB2YXIgZWRnZUxhYmVsID0gZy5lZGdlKGUpO1xuICB2YXIgbGFiZWxSYW5rID0gZWRnZUxhYmVsLmxhYmVsUmFuaztcblxuICBpZiAod1JhbmsgPT09IHZSYW5rICsgMSkgcmV0dXJuO1xuXG4gIGcucmVtb3ZlRWRnZShlKTtcblxuICAvKipcbiAgICogQHR5cGVkZWYge09iamVjdH0gQXR0cnNcbiAgICogQHByb3BlcnR5IHtudW1iZXJ9IHdpZHRoXG4gICAqIEBwcm9wZXJ0eSB7bnVtYmVyfSBoZWlnaHRcbiAgICogQHByb3BlcnR5IHtSZXR1cm5UeXBlPEdyYXBoW1wibm9kZVwiXT59IGVkZ2VMYWJlbFxuICAgKiBAcHJvcGVydHkge2FueX0gZWRnZU9ialxuICAgKiBAcHJvcGVydHkge1JldHVyblR5cGU8R3JhcGhbXCJub2RlXCJdPltcInJhbmtcIl19IHJhbmtcbiAgICogQHByb3BlcnR5IHtzdHJpbmd9IFtkdW1teV1cbiAgICogQHByb3BlcnR5IHtSZXR1cm5UeXBlPEdyYXBoW1wibm9kZVwiXT5bXCJsYWJlbHBvc1wiXX0gW2xhYmVscG9zXVxuICAgKi9cblxuICAvKiogQHR5cGUge0F0dHJzIHwgdW5kZWZpbmVkfSAqL1xuICB2YXIgYXR0cnMgPSB1bmRlZmluZWQ7XG4gIHZhciBkdW1teSwgaTtcbiAgZm9yIChpID0gMCwgKyt2UmFuazsgdlJhbmsgPCB3UmFuazsgKytpLCArK3ZSYW5rKSB7XG4gICAgZWRnZUxhYmVsLnBvaW50cyA9IFtdO1xuICAgIGF0dHJzID0ge1xuICAgICAgd2lkdGg6IDAsXG4gICAgICBoZWlnaHQ6IDAsXG4gICAgICBlZGdlTGFiZWw6IGVkZ2VMYWJlbCxcbiAgICAgIGVkZ2VPYmo6IGUsXG4gICAgICByYW5rOiB2UmFuayxcbiAgICB9O1xuICAgIGR1bW15ID0gdXRpbC5hZGREdW1teU5vZGUoZywgJ2VkZ2UnLCBhdHRycywgJ19kJyk7XG4gICAgaWYgKHZSYW5rID09PSBsYWJlbFJhbmspIHtcbiAgICAgIGF0dHJzLndpZHRoID0gZWRnZUxhYmVsLndpZHRoO1xuICAgICAgYXR0cnMuaGVpZ2h0ID0gZWRnZUxhYmVsLmhlaWdodDtcbiAgICAgIGF0dHJzLmR1bW15ID0gJ2VkZ2UtbGFiZWwnO1xuICAgICAgYXR0cnMubGFiZWxwb3MgPSBlZGdlTGFiZWwubGFiZWxwb3M7XG4gICAgfVxuICAgIGcuc2V0RWRnZSh2LCBkdW1teSwgeyB3ZWlnaHQ6IGVkZ2VMYWJlbC53ZWlnaHQgfSwgbmFtZSk7XG4gICAgaWYgKGkgPT09IDApIHtcbiAgICAgIGcuZ3JhcGgoKS5kdW1teUNoYWlucy5wdXNoKGR1bW15KTtcbiAgICB9XG4gICAgdiA9IGR1bW15O1xuICB9XG5cbiAgZy5zZXRFZGdlKHYsIHcsIHsgd2VpZ2h0OiBlZGdlTGFiZWwud2VpZ2h0IH0sIG5hbWUpO1xufVxuXG5mdW5jdGlvbiB1bmRvKGcpIHtcbiAgXy5mb3JFYWNoKGcuZ3JhcGgoKS5kdW1teUNoYWlucywgZnVuY3Rpb24gKHYpIHtcbiAgICB2YXIgbm9kZSA9IGcubm9kZSh2KTtcbiAgICB2YXIgb3JpZ0xhYmVsID0gbm9kZS5lZGdlTGFiZWw7XG4gICAgdmFyIHc7XG4gICAgZy5zZXRFZGdlKG5vZGUuZWRnZU9iaiwgb3JpZ0xhYmVsKTtcbiAgICB3aGlsZSAobm9kZS5kdW1teSkge1xuICAgICAgdyA9IGcuc3VjY2Vzc29ycyh2KVswXTtcbiAgICAgIGcucmVtb3ZlTm9kZSh2KTtcbiAgICAgIG9yaWdMYWJlbC5wb2ludHMucHVzaCh7IHg6IG5vZGUueCwgeTogbm9kZS55IH0pO1xuICAgICAgaWYgKG5vZGUuZHVtbXkgPT09ICdlZGdlLWxhYmVsJykge1xuICAgICAgICBvcmlnTGFiZWwueCA9IG5vZGUueDtcbiAgICAgICAgb3JpZ0xhYmVsLnkgPSBub2RlLnk7XG4gICAgICAgIG9yaWdMYWJlbC53aWR0aCA9IG5vZGUud2lkdGg7XG4gICAgICAgIG9yaWdMYWJlbC5oZWlnaHQgPSBub2RlLmhlaWdodDtcbiAgICAgIH1cbiAgICAgIHYgPSB3O1xuICAgICAgbm9kZSA9IGcubm9kZSh2KTtcbiAgICB9XG4gIH0pO1xufVxuIiwKICAgICJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaC1lcyc7XG5cbmV4cG9ydCB7IGxvbmdlc3RQYXRoLCBzbGFjayB9O1xuXG4vKlxuICogSW5pdGlhbGl6ZXMgcmFua3MgZm9yIHRoZSBpbnB1dCBncmFwaCB1c2luZyB0aGUgbG9uZ2VzdCBwYXRoIGFsZ29yaXRobS4gVGhpc1xuICogYWxnb3JpdGhtIHNjYWxlcyB3ZWxsIGFuZCBpcyBmYXN0IGluIHByYWN0aWNlLCBpdCB5aWVsZHMgcmF0aGVyIHBvb3JcbiAqIHNvbHV0aW9ucy4gTm9kZXMgYXJlIHB1c2hlZCB0byB0aGUgbG93ZXN0IGxheWVyIHBvc3NpYmxlLCBsZWF2aW5nIHRoZSBib3R0b21cbiAqIHJhbmtzIHdpZGUgYW5kIGxlYXZpbmcgZWRnZXMgbG9uZ2VyIHRoYW4gbmVjZXNzYXJ5LiBIb3dldmVyLCBkdWUgdG8gaXRzXG4gKiBzcGVlZCwgdGhpcyBhbGdvcml0aG0gaXMgZ29vZCBmb3IgZ2V0dGluZyBhbiBpbml0aWFsIHJhbmtpbmcgdGhhdCBjYW4gYmUgZmVkXG4gKiBpbnRvIG90aGVyIGFsZ29yaXRobXMuXG4gKlxuICogVGhpcyBhbGdvcml0aG0gZG9lcyBub3Qgbm9ybWFsaXplIGxheWVycyBiZWNhdXNlIGl0IHdpbGwgYmUgdXNlZCBieSBvdGhlclxuICogYWxnb3JpdGhtcyBpbiBtb3N0IGNhc2VzLiBJZiB1c2luZyB0aGlzIGFsZ29yaXRobSBkaXJlY3RseSwgYmUgc3VyZSB0b1xuICogcnVuIG5vcm1hbGl6ZSBhdCB0aGUgZW5kLlxuICpcbiAqIFByZS1jb25kaXRpb25zOlxuICpcbiAqICAgIDEuIElucHV0IGdyYXBoIGlzIGEgREFHLlxuICogICAgMi4gSW5wdXQgZ3JhcGggbm9kZSBsYWJlbHMgY2FuIGJlIGFzc2lnbmVkIHByb3BlcnRpZXMuXG4gKlxuICogUG9zdC1jb25kaXRpb25zOlxuICpcbiAqICAgIDEuIEVhY2ggbm9kZSB3aWxsIGJlIGFzc2lnbiBhbiAodW5ub3JtYWxpemVkKSBcInJhbmtcIiBwcm9wZXJ0eS5cbiAqL1xuZnVuY3Rpb24gbG9uZ2VzdFBhdGgoZykge1xuICB2YXIgdmlzaXRlZCA9IHt9O1xuXG4gIGZ1bmN0aW9uIGRmcyh2KSB7XG4gICAgdmFyIGxhYmVsID0gZy5ub2RlKHYpO1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmlzaXRlZCwgdikpIHtcbiAgICAgIHJldHVybiBsYWJlbC5yYW5rO1xuICAgIH1cbiAgICB2aXNpdGVkW3ZdID0gdHJ1ZTtcblxuICAgIHZhciByYW5rID0gXy5taW4oXG4gICAgICBfLm1hcChnLm91dEVkZ2VzKHYpLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICByZXR1cm4gZGZzKGUudykgLSBnLmVkZ2UoZSkubWlubGVuO1xuICAgICAgfSksXG4gICAgKTtcblxuICAgIGlmIChcbiAgICAgIHJhbmsgPT09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSB8fCAvLyByZXR1cm4gdmFsdWUgb2YgXy5tYXAoW10pIGZvciBMb2Rhc2ggM1xuICAgICAgcmFuayA9PT0gdW5kZWZpbmVkIHx8IC8vIHJldHVybiB2YWx1ZSBvZiBfLm1hcChbXSkgZm9yIExvZGFzaCA0XG4gICAgICByYW5rID09PSBudWxsXG4gICAgKSB7XG4gICAgICAvLyByZXR1cm4gdmFsdWUgb2YgXy5tYXAoW251bGxdKVxuICAgICAgcmFuayA9IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIChsYWJlbC5yYW5rID0gcmFuayk7XG4gIH1cblxuICBfLmZvckVhY2goZy5zb3VyY2VzKCksIGRmcyk7XG59XG5cbi8qXG4gKiBSZXR1cm5zIHRoZSBhbW91bnQgb2Ygc2xhY2sgZm9yIHRoZSBnaXZlbiBlZGdlLiBUaGUgc2xhY2sgaXMgZGVmaW5lZCBhcyB0aGVcbiAqIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgbGVuZ3RoIG9mIHRoZSBlZGdlIGFuZCBpdHMgbWluaW11bSBsZW5ndGguXG4gKi9cbmZ1bmN0aW9uIHNsYWNrKGcsIGUpIHtcbiAgcmV0dXJuIGcubm9kZShlLncpLnJhbmsgLSBnLm5vZGUoZS52KS5yYW5rIC0gZy5lZGdlKGUpLm1pbmxlbjtcbn1cbiIsCiAgICAiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gtZXMnO1xuaW1wb3J0IHsgR3JhcGggfSBmcm9tICcuLi8uLi9ncmFwaGxpYi9pbmRleC5qcyc7XG5pbXBvcnQgeyBzbGFjayB9IGZyb20gJy4vdXRpbC5qcyc7XG5cbmV4cG9ydCB7IGZlYXNpYmxlVHJlZSB9O1xuXG4vKlxuICogQ29uc3RydWN0cyBhIHNwYW5uaW5nIHRyZWUgd2l0aCB0aWdodCBlZGdlcyBhbmQgYWRqdXN0ZWQgdGhlIGlucHV0IG5vZGUnc1xuICogcmFua3MgdG8gYWNoaWV2ZSB0aGlzLiBBIHRpZ2h0IGVkZ2UgaXMgb25lIHRoYXQgaXMgaGFzIGEgbGVuZ3RoIHRoYXQgbWF0Y2hlc1xuICogaXRzIFwibWlubGVuXCIgYXR0cmlidXRlLlxuICpcbiAqIFRoZSBiYXNpYyBzdHJ1Y3R1cmUgZm9yIHRoaXMgZnVuY3Rpb24gaXMgZGVyaXZlZCBmcm9tIEdhbnNuZXIsIGV0IGFsLiwgXCJBXG4gKiBUZWNobmlxdWUgZm9yIERyYXdpbmcgRGlyZWN0ZWQgR3JhcGhzLlwiXG4gKlxuICogUHJlLWNvbmRpdGlvbnM6XG4gKlxuICogICAgMS4gR3JhcGggbXVzdCBiZSBhIERBRy5cbiAqICAgIDIuIEdyYXBoIG11c3QgYmUgY29ubmVjdGVkLlxuICogICAgMy4gR3JhcGggbXVzdCBoYXZlIGF0IGxlYXN0IG9uZSBub2RlLlxuICogICAgNS4gR3JhcGggbm9kZXMgbXVzdCBoYXZlIGJlZW4gcHJldmlvdXNseSBhc3NpZ25lZCBhIFwicmFua1wiIHByb3BlcnR5IHRoYXRcbiAqICAgICAgIHJlc3BlY3RzIHRoZSBcIm1pbmxlblwiIHByb3BlcnR5IG9mIGluY2lkZW50IGVkZ2VzLlxuICogICAgNi4gR3JhcGggZWRnZXMgbXVzdCBoYXZlIGEgXCJtaW5sZW5cIiBwcm9wZXJ0eS5cbiAqXG4gKiBQb3N0LWNvbmRpdGlvbnM6XG4gKlxuICogICAgLSBHcmFwaCBub2RlcyB3aWxsIGhhdmUgdGhlaXIgcmFuayBhZGp1c3RlZCB0byBlbnN1cmUgdGhhdCBhbGwgZWRnZXMgYXJlXG4gKiAgICAgIHRpZ2h0LlxuICpcbiAqIFJldHVybnMgYSB0cmVlICh1bmRpcmVjdGVkIGdyYXBoKSB0aGF0IGlzIGNvbnN0cnVjdGVkIHVzaW5nIG9ubHkgXCJ0aWdodFwiXG4gKiBlZGdlcy5cbiAqL1xuZnVuY3Rpb24gZmVhc2libGVUcmVlKGcpIHtcbiAgdmFyIHQgPSBuZXcgR3JhcGgoeyBkaXJlY3RlZDogZmFsc2UgfSk7XG5cbiAgLy8gQ2hvb3NlIGFyYml0cmFyeSBub2RlIGZyb20gd2hpY2ggdG8gc3RhcnQgb3VyIHRyZWVcbiAgdmFyIHN0YXJ0ID0gZy5ub2RlcygpWzBdO1xuICB2YXIgc2l6ZSA9IGcubm9kZUNvdW50KCk7XG4gIHQuc2V0Tm9kZShzdGFydCwge30pO1xuXG4gIHZhciBlZGdlLCBkZWx0YTtcbiAgd2hpbGUgKHRpZ2h0VHJlZSh0LCBnKSA8IHNpemUpIHtcbiAgICBlZGdlID0gZmluZE1pblNsYWNrRWRnZSh0LCBnKTtcbiAgICBkZWx0YSA9IHQuaGFzTm9kZShlZGdlLnYpID8gc2xhY2soZywgZWRnZSkgOiAtc2xhY2soZywgZWRnZSk7XG4gICAgc2hpZnRSYW5rcyh0LCBnLCBkZWx0YSk7XG4gIH1cblxuICByZXR1cm4gdDtcbn1cblxuLypcbiAqIEZpbmRzIGEgbWF4aW1hbCB0cmVlIG9mIHRpZ2h0IGVkZ2VzIGFuZCByZXR1cm5zIHRoZSBudW1iZXIgb2Ygbm9kZXMgaW4gdGhlXG4gKiB0cmVlLlxuICovXG5mdW5jdGlvbiB0aWdodFRyZWUodCwgZykge1xuICBmdW5jdGlvbiBkZnModikge1xuICAgIF8uZm9yRWFjaChnLm5vZGVFZGdlcyh2KSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIHZhciBlZGdlViA9IGUudixcbiAgICAgICAgdyA9IHYgPT09IGVkZ2VWID8gZS53IDogZWRnZVY7XG4gICAgICBpZiAoIXQuaGFzTm9kZSh3KSAmJiAhc2xhY2soZywgZSkpIHtcbiAgICAgICAgdC5zZXROb2RlKHcsIHt9KTtcbiAgICAgICAgdC5zZXRFZGdlKHYsIHcsIHt9KTtcbiAgICAgICAgZGZzKHcpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgXy5mb3JFYWNoKHQubm9kZXMoKSwgZGZzKTtcbiAgcmV0dXJuIHQubm9kZUNvdW50KCk7XG59XG5cbi8qXG4gKiBGaW5kcyB0aGUgZWRnZSB3aXRoIHRoZSBzbWFsbGVzdCBzbGFjayB0aGF0IGlzIGluY2lkZW50IG9uIHRyZWUgYW5kIHJldHVybnNcbiAqIGl0LlxuICovXG5mdW5jdGlvbiBmaW5kTWluU2xhY2tFZGdlKHQsIGcpIHtcbiAgcmV0dXJuIF8ubWluQnkoZy5lZGdlcygpLCBmdW5jdGlvbiAoZSkge1xuICAgIGlmICh0Lmhhc05vZGUoZS52KSAhPT0gdC5oYXNOb2RlKGUudykpIHtcbiAgICAgIHJldHVybiBzbGFjayhnLCBlKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzaGlmdFJhbmtzKHQsIGcsIGRlbHRhKSB7XG4gIF8uZm9yRWFjaCh0Lm5vZGVzKCksIGZ1bmN0aW9uICh2KSB7XG4gICAgZy5ub2RlKHYpLnJhbmsgKz0gZGVsdGE7XG4gIH0pO1xufVxuIiwKICAgICJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaC1lcyc7XG5pbXBvcnQgeyBQcmlvcml0eVF1ZXVlIH0gZnJvbSAnLi4vZGF0YS9wcmlvcml0eS1xdWV1ZS5qcyc7XG5cbi8qKlxuICogQGltcG9ydCB7IEVkZ2VPYmosIEdyYXBoLCBOb2RlSUQgfSBmcm9tICcuLi9ncmFwaC5qcyc7XG4gKi9cblxuZXhwb3J0IHsgZGlqa3N0cmEgfTtcblxudmFyIERFRkFVTFRfV0VJR0hUX0ZVTkMgPSBfLmNvbnN0YW50KDEpO1xuXG4vKipcbiAqIEB0eXBlZGVmIHtPYmplY3R9IFBhdGhFbnRyeVxuICogQHByb3BlcnR5IHtudW1iZXJ9IGRpc3RhbmNlIFRoZSBzdW0gb2YgdGhlIHdlaWdodHMgZnJvbSBgc291cmNlYCB0byBgdmBcbiAqIGFsb25nIHRoZSBzaG9ydGVzdCBwYXRoIG9yIGBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFlgIGlmIHRoZXJlIGlzIG5vIHBhdGhcbiAqIGZyb20gYHNvdXJjZWAuXG4gKiBAcHJvcGVydHkge05vZGVJRH0gW3ByZWRlY2Vzc29yXSBDYW4gYmUgdXNlZCB0byB3YWxrIHRoZSBpbmRpdmlkdWFsXG4gKiBlbGVtZW50cyBvZiB0aGUgcGF0aCBmcm9tIGBzb3VyY2VgIHRvIGB2YCBpbiByZXZlcnNlIG9yZGVyLlxuICovXG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBpcyBhbiBpbXBsZW1lbnRhdGlvbiBvZiBbRGlqa3N0cmEncyBhbGdvcml0aG1dW10gd2hpY2ggZmluZHNcbiAqIHRoZSBzaG9ydGVzdCBwYXRoIGZyb20gYHNvdXJjZWAgdG8gYWxsIG90aGVyIG5vZGVzIGluIGBnYC4gVGhpc1xuICogZnVuY3Rpb24gcmV0dXJuc1xuICpcbiAqIFtEaWprc3RyYSdzIGFsZ29yaXRobV06IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRGlqa3N0cmElMjdzX2FsZ29yaXRobVxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogIVtdKGh0dHBzOi8vZ2l0aHViLmNvbS9kYWdyZWpzL2dyYXBobGliL3dpa2kvaW1hZ2VzL2RpamtzdHJhLXNvdXJjZS5wbmcpXG4gKiA8IS0tIFNPVVJDRTpcbiAqIGh0dHA6Ly9kYWdyZWpzLmdpdGh1Yi5pby9wcm9qZWN0L2RhZ3JlLWQzL2xhdGVzdC9kZW1vL2ludGVyYWN0aXZlLWRlbW8uaHRtbD9ncmFwaD1kaWdyYXBoJTIwJTdCJTBBbm9kZSUyMCU1QnNoYXBlJTNEY2lyY2xlJTJDJTIwc3R5bGUlM0QlMjJmaWxsJTNBd2hpdGUlM0JzdHJva2UlM0ElMjMzMzMlM0JzdHJva2Utd2lkdGglM0ExLjVweCUyMiU1RCUwQWVkZ2UlMjAlNUJsYWJlbG9mZnNldCUzRDIlMjBsYWJlbHBvcyUzRHIlNUQlMEFyYW5rZGlyJTNEbHIlMEElMjAlMjBBJTIwLSUzRSUyMEIlNUJsYWJlbCUzRDEwJTVEJTBBJTIwJTIwQSUyMC0lM0UlMjBDJTVCbGFiZWwlM0Q0JTVEJTBBJTIwJTIwQSUyMC0lM0UlMjBEJTVCbGFiZWwlM0QyJTVEJTBBJTIwJTIwQyUyMC0lM0UlMjBCJTVCbGFiZWwlM0QyJTVEJTBBJTIwJTIwQyUyMC0lM0UlMjBEJTVCbGFiZWwlM0Q4JTVEJTBBJTIwJTIwQiUyMC0lM0UlMjBFJTVCbGFiZWwlM0Q2JTVEJTBBJTIwJTIwRCUyMC0lM0UlMjBGJTVCbGFiZWwlM0QyJTVEJTBBJTIwJTIwRiUyMC0lM0UlMjBFJTVCbGFiZWwlM0Q0JTVEJTBBJTdEXG4gKiAtLT5cbiAqXG4gKiBgYGBqc1xuICogZnVuY3Rpb24gd2VpZ2h0KGUpIHsgcmV0dXJuIGcuZWRnZShlKTsgfVxuICpcbiAqIGdyYXBobGliLmFsZy5kaWprc3RyYShnLCBcIkFcIiwgd2VpZ2h0KTtcbiAqIC8vID0+IHsgQTogeyBkaXN0YW5jZTogMCB9LFxuICogLy8gICAgICBCOiB7IGRpc3RhbmNlOiA2LCBwcmVkZWNlc3NvcjogJ0MnIH0sXG4gKiAvLyAgICAgIEM6IHsgZGlzdGFuY2U6IDQsIHByZWRlY2Vzc29yOiAnQScgfSxcbiAqIC8vICAgICAgRDogeyBkaXN0YW5jZTogMiwgcHJlZGVjZXNzb3I6ICdBJyB9LFxuICogLy8gICAgICBFOiB7IGRpc3RhbmNlOiA4LCBwcmVkZWNlc3NvcjogJ0YnIH0sXG4gKiAvLyAgICAgIEY6IHsgZGlzdGFuY2U6IDQsIHByZWRlY2Vzc29yOiAnRCcgfSB9XG4gKiBgYGBcbiAqXG4gKiBAcmVtYXJrcyBJdCB0YWtlcyBgTygofEV8ICsgfFZ8KSAqIGxvZyB8VnwpYCB0aW1lLlxuICpcbiAqIEBwYXJhbSB7R3JhcGh9IGcgLSBJbnB1dCBncmFwaC5cbiAqIEBwYXJhbSB7Tm9kZUlEIHwgbnVtYmVyfSBzb3VyY2UgLSBUaGUgc291cmNlIG5vZGUgaWQuIENvbnZlcnRlZCB0byBhIHN0cmluZy5cbiAqIEBwYXJhbSB7KGU6IEVkZ2VPYmopID0+IG51bWJlcn0gW3dlaWdodEZuXSAtIE9wdGlvbmFsIGZ1bmN0aW9uIHRoYXQgcmV0dXJuc1xuICogdGhlIHdlaWdodCBmb3IgZWRnZSBgZWAuIElmIG5vIGB3ZWlnaHRGbmAgaXMgc3VwcGxpZWQgdGhlbiBlYWNoIGVkZ2UgaXNcbiAqIGFzc3VtZWQgdG8gaGF2ZSBhIHdlaWdodCBvZiAxLlxuICogQHBhcmFtIHsodjogTm9kZUlEKSA9PiBFZGdlT2JqW119IFtlZGdlRm5dIC0gT3B0aW9uYWwgZnVuY3Rpb24gdGhhdCByZXR1cm5zXG4gKiB0aGUgaWRzIG9mIGFsbCBlZGdlcyBpbmNpZGVudCB0byB0aGUgbm9kZSBgdmAgZm9yIHRoZSBwdXJwb3NlcyBvZiBzaG9ydGVzdFxuICogcGF0aCB0cmF2ZXJzYWwuXG4gKiBCeSBkZWZhdWx0IHRoaXMgZnVuY3Rpb24gdXNlcyB0aGUge0BsaW5rIEdyYXBoLm91dEVkZ2VzfSBmdW5jdGlvbiBvbiB0aGVcbiAqIHN1cHBsaWVkIGdyYXBoLlxuICogQHJldHVybnMge1JlY29yZDxOb2RlSUQsIFBhdGhFbnRyeT59IGEgbWFwIG9mIGB2IC0+IHsgZGlzdGFuY2UsIHByZWRlY2Vzc29yIH1gLlxuICogQHRocm93cyB7RXJyb3J9IElmIGFueSBvZiB0aGUgdHJhdmVyc2VkIGVkZ2VzIGhhcyBhIG5lZ2F0aXZlIGVkZ2Ugd2VpZ2h0LlxuICovXG5mdW5jdGlvbiBkaWprc3RyYShnLCBzb3VyY2UsIHdlaWdodEZuLCBlZGdlRm4pIHtcbiAgcmV0dXJuIHJ1bkRpamtzdHJhKFxuICAgIGcsXG4gICAgU3RyaW5nKHNvdXJjZSksXG4gICAgd2VpZ2h0Rm4gfHwgREVGQVVMVF9XRUlHSFRfRlVOQyxcbiAgICBlZGdlRm4gfHxcbiAgICAgIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHJldHVybiBnLm91dEVkZ2VzKHYpO1xuICAgICAgfSxcbiAgKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge0dyYXBofSBnIC0gSW5wdXQgZ3JhcGguXG4gKiBAcGFyYW0ge05vZGVJRH0gc291cmNlIC0gVGhlIHNvdXJjZSBub2RlIGlkLlxuICogQHBhcmFtIHsoZTogRWRnZU9iaikgPT4gbnVtYmVyfSB3ZWlnaHRGbiAtIFJlcXVpcmVkIHdlaWdodCBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7KHY6IE5vZGVJRCkgPT4gRWRnZU9ialtdfSBlZGdlRm4gLSBSZXF1aXJlZCBlZGdlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBydW5EaWprc3RyYShnLCBzb3VyY2UsIHdlaWdodEZuLCBlZGdlRm4pIHtcbiAgLyoqIEB0eXBlIHtSZWNvcmQ8Tm9kZUlELCBQYXRoRW50cnk+fSAqL1xuICB2YXIgcmVzdWx0cyA9IHt9O1xuICB2YXIgcHEgPSBuZXcgUHJpb3JpdHlRdWV1ZSgpO1xuICAvKiogQHR5cGUge05vZGVJRH0gKi9cbiAgdmFyIHY7XG4gIC8qKiBAdHlwZSB7UGF0aEVudHJ5fSAqL1xuICB2YXIgdkVudHJ5O1xuXG4gIC8qKiBAcGFyYW0ge0VkZ2VPYmp9IGVkZ2UgKi9cbiAgdmFyIHVwZGF0ZU5laWdoYm9ycyA9IGZ1bmN0aW9uIChlZGdlKSB7XG4gICAgdmFyIHcgPSBlZGdlLnYgIT09IHYgPyBlZGdlLnYgOiBlZGdlLnc7XG4gICAgdmFyIHdFbnRyeSA9IHJlc3VsdHNbd107XG4gICAgdmFyIHdlaWdodCA9IHdlaWdodEZuKGVkZ2UpO1xuICAgIHZhciBkaXN0YW5jZSA9IHZFbnRyeS5kaXN0YW5jZSArIHdlaWdodDtcblxuICAgIGlmICh3ZWlnaHQgPCAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdkaWprc3RyYSBkb2VzIG5vdCBhbGxvdyBuZWdhdGl2ZSBlZGdlIHdlaWdodHMuICcgK1xuICAgICAgICAgICdCYWQgZWRnZTogJyArXG4gICAgICAgICAgZWRnZSArXG4gICAgICAgICAgJyBXZWlnaHQ6ICcgK1xuICAgICAgICAgIHdlaWdodCxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGRpc3RhbmNlIDwgd0VudHJ5LmRpc3RhbmNlKSB7XG4gICAgICB3RW50cnkuZGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgIHdFbnRyeS5wcmVkZWNlc3NvciA9IHY7XG4gICAgICBwcS5kZWNyZWFzZSh3LCBkaXN0YW5jZSk7XG4gICAgfVxuICB9O1xuXG4gIGcubm9kZXMoKS5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgdmFyIGRpc3RhbmNlID0gdiA9PT0gc291cmNlID8gMCA6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICByZXN1bHRzW3ZdID0geyBkaXN0YW5jZTogZGlzdGFuY2UgfTtcbiAgICBwcS5hZGQodiwgZGlzdGFuY2UpO1xuICB9KTtcblxuICB3aGlsZSAocHEuc2l6ZSgpID4gMCkge1xuICAgIHYgPSBwcS5yZW1vdmVNaW4oKTtcbiAgICB2RW50cnkgPSByZXN1bHRzW3ZdO1xuICAgIGlmICh2RW50cnkuZGlzdGFuY2UgPT09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgZWRnZUZuKHYpLmZvckVhY2godXBkYXRlTmVpZ2hib3JzKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHRzO1xufVxuIiwKICAgICJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaC1lcyc7XG5cbi8qKlxuICogQGltcG9ydCB7IEdyYXBoLCBFZGdlT2JqLCBOb2RlSUQgfSBmcm9tICcuLi9ncmFwaC5qcyc7XG4gKiBAaW1wb3J0IHsgUGF0aEVudHJ5IH0gZnJvbSAnLi9kaWprc3RyYS5qcyc7XG4gKi9cblxuZXhwb3J0IHsgZmxveWRXYXJzaGFsbCB9O1xuXG52YXIgREVGQVVMVF9XRUlHSFRfRlVOQyA9IF8uY29uc3RhbnQoMSk7XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBpcyBhbiBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgW0Zsb3lkLVdhcnNoYWxsIGFsZ29yaXRobV1bXSxcbiAqIHdoaWNoIGZpbmRzIHRoZSBzaG9ydGVzdCBwYXRoIGZyb20gZWFjaCBub2RlIHRvIGV2ZXJ5IG90aGVyIHJlYWNoYWJsZSBub2RlXG4gKiBpbiB0aGUgZ3JhcGguIEl0IGlzIHNpbWlsYXIgdG8ge0BsaW5rIGRpamtzdHJhQWxsfSwgYnV0XG4gKiBpdCBoYW5kbGVzIG5lZ2F0aXZlIGVkZ2Ugd2VpZ2h0cyBhbmQgaXMgbW9yZSBlZmZpY2llbnQgZm9yIHNvbWUgdHlwZXMgb2ZcbiAqIGdyYXBocy5cbiAqXG4gKiBbRmxveWQtV2Fyc2hhbGwgYWxnb3JpdGhtXTogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRmxveWQtV2Fyc2hhbGxfYWxnb3JpdGhtXG4gKlxuICogQHJlbWFya3MgVGhpcyBhbGdvcml0aG0gdGFrZXMgYE8ofFZ8XjMpYCB0aW1lLlxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogIVtdKGh0dHBzOi8vZ2l0aHViLmNvbS9kYWdyZWpzL2dyYXBobGliL3dpa2kvaW1hZ2VzL2RpamtzdHJhLXNvdXJjZS5wbmcpXG4gKlxuICogYGBganNcbiAqIGZ1bmN0aW9uIHdlaWdodChlKSB7IHJldHVybiBnLmVkZ2UoZSk7IH1cbiAqXG4gKiBncmFwaGxpYi5hbGcuZmxveWRXYXJzaGFsbChnLCBmdW5jdGlvbihlKSB7IHJldHVybiBnLmVkZ2UoZSk7IH0pO1xuICpcbiAqIC8vID0+IHsgQTpcbiAqIC8vICAgICAgIHsgQTogeyBkaXN0YW5jZTogMCB9LFxuICogLy8gICAgICAgICBCOiB7IGRpc3RhbmNlOiA2LCBwcmVkZWNlc3NvcjogJ0MnIH0sXG4gKiAvLyAgICAgICAgIEM6IHsgZGlzdGFuY2U6IDQsIHByZWRlY2Vzc29yOiAnQScgfSxcbiAqIC8vICAgICAgICAgRDogeyBkaXN0YW5jZTogMiwgcHJlZGVjZXNzb3I6ICdBJyB9LFxuICogLy8gICAgICAgICBFOiB7IGRpc3RhbmNlOiA4LCBwcmVkZWNlc3NvcjogJ0YnIH0sXG4gKiAvLyAgICAgICAgIEY6IHsgZGlzdGFuY2U6IDQsIHByZWRlY2Vzc29yOiAnRCcgfSB9LFxuICogLy8gICAgICBCOlxuICogLy8gICAgICAgeyBBOiB7IGRpc3RhbmNlOiBJbmZpbml0eSB9LFxuICogLy8gICAgICAgICBCOiB7IGRpc3RhbmNlOiAwIH0sXG4gKiAvLyAgICAgICAgIEM6IHsgZGlzdGFuY2U6IEluZmluaXR5IH0sXG4gKiAvLyAgICAgICAgIEQ6IHsgZGlzdGFuY2U6IEluZmluaXR5IH0sXG4gKiAvLyAgICAgICAgIEU6IHsgZGlzdGFuY2U6IDYsIHByZWRlY2Vzc29yOiAnQicgfSxcbiAqIC8vICAgICAgICAgRjogeyBkaXN0YW5jZTogSW5maW5pdHkgfSB9LFxuICogLy8gICAgICBDOiB7IC4uLiB9LFxuICogLy8gICAgICBEOiB7IC4uLiB9LFxuICogLy8gICAgICBFOiB7IC4uLiB9LFxuICogLy8gICAgICBGOiB7IC4uLiB9IH1cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7R3JhcGh9IGcgLSBUaGUgZ3JhcGggdG8gYW5hbHl6ZS5cbiAqIEBwYXJhbSB7KGU6IEVkZ2VPYmopID0+IG51bWJlcn0gW3dlaWdodEZuXSAtIE9wdGlvbmFsIGZ1bmN0aW9uIHRoYXQgcmV0dXJuc1xuICogdGhlIHdlaWdodCBmb3IgZWRnZSBgZWAuIElmIG5vIGB3ZWlnaHRGbmAgaXMgc3VwcGxpZWQgdGhlbiBlYWNoIGVkZ2UgaXNcbiAqIGFzc3VtZWQgdG8gaGF2ZSBhIHdlaWdodCBvZiAxLlxuICogQHBhcmFtIHsodjogTm9kZUlEKSA9PiBFZGdlT2JqW119IFtlZGdlRm5dIC0gT3B0aW9uYWwgZnVuY3Rpb24gdGhhdCByZXR1cm5zXG4gKiB0aGUgaWRzIG9mIGFsbCBlZGdlcyBpbmNpZGVudCB0byB0aGUgbm9kZSBgdmAgZm9yIHRoZSBwdXJwb3NlcyBvZiBzaG9ydGVzdFxuICogcGF0aCB0cmF2ZXJzYWwuXG4gKiBCeSBkZWZhdWx0IHRoaXMgZnVuY3Rpb24gdXNlcyB0aGUge0BsaW5rIEdyYXBoLm91dEVkZ2VzfSBmdW5jdGlvbiBvbiB0aGVcbiAqIHN1cHBsaWVkIGdyYXBoLlxuICogQHJldHVybnMge1JlY29yZDxOb2RlSUQsIFJlY29yZDxOb2RlSUQsIFBhdGhFbnRyeT4+fSBhIG1hcCBvZlxuICogYHNvdXJjZSAtPiB7IHRhcmdldCAtPiB7IGRpc3RhbmNlLCBwcmVkZWNlc3NvciB9YC5cbiAqL1xuZnVuY3Rpb24gZmxveWRXYXJzaGFsbChnLCB3ZWlnaHRGbiwgZWRnZUZuKSB7XG4gIHJldHVybiBydW5GbG95ZFdhcnNoYWxsKFxuICAgIGcsXG4gICAgd2VpZ2h0Rm4gfHwgREVGQVVMVF9XRUlHSFRfRlVOQyxcbiAgICBlZGdlRm4gfHxcbiAgICAgIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHJldHVybiBnLm91dEVkZ2VzKHYpO1xuICAgICAgfSxcbiAgKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge0dyYXBofSBnIC0gSW5wdXQgZ3JhcGguXG4gKiBAcGFyYW0geyhlOiBFZGdlT2JqKSA9PiBudW1iZXJ9IHdlaWdodEZuIC0gUmVxdWlyZWQgd2VpZ2h0IGZ1bmN0aW9uLlxuICogQHBhcmFtIHsodjogTm9kZUlEKSA9PiBFZGdlT2JqW119IGVkZ2VGbiAtIFJlcXVpcmVkIGVkZ2UgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHJ1bkZsb3lkV2Fyc2hhbGwoZywgd2VpZ2h0Rm4sIGVkZ2VGbikge1xuICAvKiogQHR5cGUge1JlY29yZDxOb2RlSUQsIFJlY29yZDxOb2RlSUQsIFBhdGhFbnRyeT4+fSAqL1xuICB2YXIgcmVzdWx0cyA9IHt9O1xuICB2YXIgbm9kZXMgPSBnLm5vZGVzKCk7XG5cbiAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgIHJlc3VsdHNbdl0gPSB7fTtcbiAgICByZXN1bHRzW3ZdW3ZdID0geyBkaXN0YW5jZTogMCB9O1xuICAgIG5vZGVzLmZvckVhY2goZnVuY3Rpb24gKHcpIHtcbiAgICAgIGlmICh2ICE9PSB3KSB7XG4gICAgICAgIHJlc3VsdHNbdl1bd10gPSB7IGRpc3RhbmNlOiBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgfTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBlZGdlRm4odikuZm9yRWFjaChmdW5jdGlvbiAoZWRnZSkge1xuICAgICAgdmFyIHcgPSBlZGdlLnYgPT09IHYgPyBlZGdlLncgOiBlZGdlLnY7XG4gICAgICB2YXIgZCA9IHdlaWdodEZuKGVkZ2UpO1xuICAgICAgcmVzdWx0c1t2XVt3XSA9IHsgZGlzdGFuY2U6IGQsIHByZWRlY2Vzc29yOiB2IH07XG4gICAgfSk7XG4gIH0pO1xuXG4gIG5vZGVzLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICB2YXIgcm93SyA9IHJlc3VsdHNba107XG4gICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAoaSkge1xuICAgICAgdmFyIHJvd0kgPSByZXN1bHRzW2ldO1xuICAgICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAoaikge1xuICAgICAgICB2YXIgaWsgPSByb3dJW2tdO1xuICAgICAgICB2YXIga2ogPSByb3dLW2pdO1xuICAgICAgICB2YXIgaWogPSByb3dJW2pdO1xuICAgICAgICB2YXIgYWx0RGlzdGFuY2UgPSBpay5kaXN0YW5jZSArIGtqLmRpc3RhbmNlO1xuICAgICAgICBpZiAoYWx0RGlzdGFuY2UgPCBpai5kaXN0YW5jZSkge1xuICAgICAgICAgIGlqLmRpc3RhbmNlID0gYWx0RGlzdGFuY2U7XG4gICAgICAgICAgaWoucHJlZGVjZXNzb3IgPSBrai5wcmVkZWNlc3NvcjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJldHVybiByZXN1bHRzO1xufVxuIiwKICAgICJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaC1lcyc7XG5cbi8qKlxuICogQGltcG9ydCB7IEdyYXBoLCBOb2RlSUQgfSBmcm9tICcuLi9ncmFwaC5qcyc7XG4gKi9cblxuZXhwb3J0IHsgdG9wc29ydCwgQ3ljbGVFeGNlcHRpb24gfTtcblxudG9wc29ydC5DeWNsZUV4Y2VwdGlvbiA9IEN5Y2xlRXhjZXB0aW9uO1xuXG4vKipcbiAqIEFuIGltcGxlbWVudGF0aW9uIG9mIFt0b3BvbG9naWNhbCBzb3J0aW5nXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Ub3BvbG9naWNhbF9zb3J0aW5nKS5cbiAqXG4gKiBAcmVtYXJrcyBUYWtlcyBgTyh8VnwgKyB8RXwpYCB0aW1lLlxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogIVtdKGh0dHBzOi8vZ2l0aHViLmNvbS9kYWdyZWpzL2dyYXBobGliL3dpa2kvaW1hZ2VzL3RvcHNvcnQucG5nKVxuICpcbiAqIGBgYGpzXG4gKiBncmFwaGxpYi5hbGcudG9wc29ydChnKVxuICogLy8gWyAnMScsICcyJywgJzMnLCAnNCcgXSBvciBbICcxJywgJzMnLCAnMicsICc0JyBdXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge0dyYXBofSBnIC0gVGhlIGdyYXBoIHRvIHNvcnQuXG4gKiBAcmV0dXJucyB7Tm9kZUlEW119IGFuIGFycmF5IG9mIG5vZGVzXG4gKiBzdWNoIHRoYXQgZm9yIGVhY2ggZWRnZSBgdSAtPiB2YCwgYHVgIGFwcGVhcnMgYmVmb3JlIGB2YCBpbiB0aGUgYXJyYXkuXG4gKiBAdGhyb3dzIHtDeWNsZUV4Y2VwdGlvbn0gSWYgdGhlIGdyYXBoIGhhcyBhIGN5Y2xlIHNvIHRoYXQgaXQgaXMgaW1wb3NzaWJsZVxuICogdG8gZ2VuZXJhdGUgYSB0b3BvbG9naWNhbCBzb3J0LlxuICovXG5mdW5jdGlvbiB0b3Bzb3J0KGcpIHtcbiAgLyoqIEB0eXBlIHtSZWNvcmQ8Tm9kZUlELCB0cnVlPn0gKi9cbiAgdmFyIHZpc2l0ZWQgPSB7fTtcbiAgLyoqIEB0eXBlIHtSZWNvcmQ8Tm9kZUlELCB0cnVlPn0gKi9cbiAgdmFyIHN0YWNrID0ge307XG4gIC8qKiBAdHlwZSB7Tm9kZUlEW119ICovXG4gIHZhciByZXN1bHRzID0gW107XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7Tm9kZUlEfSBub2RlIC0gTm9kZSB0byByZWN1cnNpdmVseSB2aXNpdC5cbiAgICovXG4gIGZ1bmN0aW9uIHZpc2l0KG5vZGUpIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHN0YWNrLCBub2RlKSkge1xuICAgICAgdGhyb3cgbmV3IEN5Y2xlRXhjZXB0aW9uKCk7XG4gICAgfVxuXG4gICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmlzaXRlZCwgbm9kZSkpIHtcbiAgICAgIHN0YWNrW25vZGVdID0gdHJ1ZTtcbiAgICAgIHZpc2l0ZWRbbm9kZV0gPSB0cnVlO1xuICAgICAgXy5lYWNoKGcucHJlZGVjZXNzb3JzKG5vZGUpLCB2aXNpdCk7XG4gICAgICBkZWxldGUgc3RhY2tbbm9kZV07XG4gICAgICByZXN1bHRzLnB1c2gobm9kZSk7XG4gICAgfVxuICB9XG5cbiAgXy5lYWNoKGcuc2lua3MoKSwgdmlzaXQpO1xuXG4gIGlmIChfLnNpemUodmlzaXRlZCkgIT09IGcubm9kZUNvdW50KCkpIHtcbiAgICB0aHJvdyBuZXcgQ3ljbGVFeGNlcHRpb24oKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHRzO1xufVxuXG4vKipcbiAqIEBjbGFzc1xuICovXG5mdW5jdGlvbiBDeWNsZUV4Y2VwdGlvbigpIHt9XG5DeWNsZUV4Y2VwdGlvbi5wcm90b3R5cGUgPSBuZXcgRXJyb3IoKTsgLy8gbXVzdCBiZSBhbiBpbnN0YW5jZSBvZiBFcnJvciB0byBwYXNzIHRlc3RpbmdcbiIsCiAgICAiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gtZXMnO1xuXG4vKipcbiAqIEBpbXBvcnQgeyBHcmFwaCwgTm9kZUlEIH0gZnJvbSAnLi4vZ3JhcGguanMnO1xuICovXG5cbmV4cG9ydCB7IGRmcyB9O1xuXG4vKipcbiAqIEEgaGVscGVyIHRoYXQgcHJlZm9ybXMgYSBwcmUtIG9yIHBvc3Qtb3JkZXIgdHJhdmVyc2FsIG9uIHRoZSBpbnB1dCBncmFwaFxuICogYW5kIHJldHVybnMgdGhlIG5vZGVzIGluIHRoZSBvcmRlciB0aGV5IHdlcmUgdmlzaXRlZC4gSWYgdGhlIGdyYXBoIGlzXG4gKiB1bmRpcmVjdGVkIHRoZW4gdGhpcyBhbGdvcml0aG0gd2lsbCBuYXZpZ2F0ZSB1c2luZyBuZWlnaGJvcnMuIElmIHRoZSBncmFwaFxuICogaXMgZGlyZWN0ZWQgdGhlbiB0aGlzIGFsZ29yaXRobSB3aWxsIG5hdmlnYXRlIHVzaW5nIHN1Y2Nlc3NvcnMuXG4gKlxuICogQHBhcmFtIHtHcmFwaH0gZyAtIElucHV0IGdyYXBoLlxuICogQHBhcmFtIHtOb2RlSURbXSB8IE5vZGVJRH0gdnMgLSBTdGFydGluZyBub2RlIG9yIGFycmF5IG9mIG5vZGVzLlxuICogQHBhcmFtIHsncG9zdCcgfCAncHJlJ30gb3JkZXIgLSBUaGUgb3JkZXIgdG8gdXNlLiBNdXN0IGJlIG9uZSBvZiBcInByZVwiIG9yIFwicG9zdFwiLlxuICogQHJldHVybnMge05vZGVJRFtdfSBUaGUgbm9kZXMgaW4gdGhlIG9yZGVyIHRoZXkgd2VyZSB2aXNpdGVkLlxuICovXG5mdW5jdGlvbiBkZnMoZywgdnMsIG9yZGVyKSB7XG4gIGlmICghXy5pc0FycmF5KHZzKSkge1xuICAgIHZzID0gW3ZzXTtcbiAgfVxuXG4gIC8qKiBAdHlwZSB7UGFyYW1ldGVyczx0eXBlb2YgZG9EZnM+WzRdfSAqL1xuICB2YXIgbmF2aWdhdGlvbiA9IChnLmlzRGlyZWN0ZWQoKSA/IGcuc3VjY2Vzc29ycyA6IGcubmVpZ2hib3JzKS5iaW5kKGcpO1xuICAvKiogQHR5cGUge1BhcmFtZXRlcnM8dHlwZW9mIGRvRGZzPls1XX0gKi9cbiAgdmFyIGFjYyA9IFtdO1xuICAvKiogQHR5cGUge1BhcmFtZXRlcnM8dHlwZW9mIGRvRGZzPlszXX0gKi9cbiAgdmFyIHZpc2l0ZWQgPSB7fTtcbiAgXy5lYWNoKHZzLCBmdW5jdGlvbiAodikge1xuICAgIGlmICghZy5oYXNOb2RlKHYpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0dyYXBoIGRvZXMgbm90IGhhdmUgbm9kZTogJyArIHYpO1xuICAgIH1cblxuICAgIGRvRGZzKGcsIHYsIG9yZGVyID09PSAncG9zdCcsIHZpc2l0ZWQsIG5hdmlnYXRpb24sIGFjYyk7XG4gIH0pO1xuICByZXR1cm4gYWNjO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7R3JhcGh9IGcgLSBJbnB1dCBncmFwaC5cbiAqIEBwYXJhbSB7Tm9kZUlEfSB2IC0gVGhlIG5vZGUgdG8gdmlzaXQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHBvc3RvcmRlciAtIFdoZXRoZXIgdG8gZG8gcG9zdG9yZGVyIHRyYXZlcnNhbC5cbiAqIEBwYXJhbSB7UmVjb3JkPE5vZGVJRCwgdHJ1ZT59IHZpc2l0ZWQgLSBWaXNpdGVkIG5vZGVzLlxuICogQHBhcmFtIHsobm9kZTogTm9kZUlEKSA9PiAoTm9kZUlEW10gfCB1bmRlZmluZWQpfSBuYXZpZ2F0aW9uIC0gRnVuY3Rpb24gdG8gZ2V0XG4gKiBuZWlnaGJvcnMvc3VjY2Vzc29ycy5cbiAqIEBwYXJhbSB7Tm9kZUlEW119IGFjYyAtIEFjY3VtdWxhdG9yIGZvciB2aXNpdGVkIG5vZGVzLlxuICovXG5mdW5jdGlvbiBkb0RmcyhnLCB2LCBwb3N0b3JkZXIsIHZpc2l0ZWQsIG5hdmlnYXRpb24sIGFjYykge1xuICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2aXNpdGVkLCB2KSkge1xuICAgIHZpc2l0ZWRbdl0gPSB0cnVlO1xuXG4gICAgaWYgKCFwb3N0b3JkZXIpIHtcbiAgICAgIGFjYy5wdXNoKHYpO1xuICAgIH1cbiAgICBfLmVhY2gobmF2aWdhdGlvbih2KSwgZnVuY3Rpb24gKHcpIHtcbiAgICAgIGRvRGZzKGcsIHcsIHBvc3RvcmRlciwgdmlzaXRlZCwgbmF2aWdhdGlvbiwgYWNjKTtcbiAgICB9KTtcbiAgICBpZiAocG9zdG9yZGVyKSB7XG4gICAgICBhY2MucHVzaCh2KTtcbiAgICB9XG4gIH1cbn1cbiIsCiAgICAiaW1wb3J0IHsgZGZzIH0gZnJvbSAnLi9kZnMuanMnO1xuXG5leHBvcnQgeyBwb3N0b3JkZXIgfTtcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHBlcmZvcm1zIGEgW3Bvc3RvcmRlciB0cmF2ZXJzYWxdW10gb2YgdGhlIGdyYXBoIGBnYCBzdGFydGluZ1xuICogYXQgdGhlIG5vZGVzIGB2c2AuIEZvciBlYWNoIG5vZGUgdmlzaXRlZCwgYHZgLCAgdGhlIGZ1bmN0aW9uIGBjYWxsYmFjayh2KWBcbiAqIGlzIGNhbGxlZC5cbiAqXG4gKiBbcG9zdG9yZGVyIHRyYXZlcnNhbF06IGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RyZWVfdHJhdmVyc2FsI0RlcHRoLWZpcnN0XG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiAhW10oaHR0cHM6Ly9naXRodWIuY29tL2RhZ3JlanMvZ3JhcGhsaWIvd2lraS9pbWFnZXMvcHJlb3JkZXIucG5nKVxuICpcbiAqIGBgYGpzXG4gKiBncmFwaGxpYi5hbGcucG9zdG9yZGVyKGcsIFwiQVwiKTtcbiAqIC8vID0+IE9uZSBvZjpcbiAqIC8vIFsgXCJCXCIsIFwiRFwiLCBcIkVcIiwgQ1wiLCBcIkFcIiBdXG4gKiAvLyBbIFwiQlwiLCBcIkVcIiwgXCJEXCIsIENcIiwgXCJBXCIgXVxuICogLy8gWyBcIkRcIiwgXCJFXCIsIFwiQ1wiLCBCXCIsIFwiQVwiIF1cbiAqIC8vIFsgXCJFXCIsIFwiRFwiLCBcIkNcIiwgQlwiLCBcIkFcIiBdXG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge1BhcmFtZXRlcnM8dHlwZW9mIGRmcz5bMF19IGcgLSBUaGUgZ3JhcGggdG8gdHJhdmVyc2UuXG4gKiBAcGFyYW0ge1BhcmFtZXRlcnM8dHlwZW9mIGRmcz5bMV19IHZzIC0gTm9kZXMgdG8gc3RhcnQgdGhlIHRyYXZlcnNhbCBmcm9tLlxuICogQHJldHVybnMge1JldHVyblR5cGU8dHlwZW9mIGRmcz59IFRoZSBub2RlcyBpbiB0aGUgb3JkZXIgdGhleSB3ZXJlIHZpc2l0ZWQuXG4gKi9cbmZ1bmN0aW9uIHBvc3RvcmRlcihnLCB2cykge1xuICByZXR1cm4gZGZzKGcsIHZzLCAncG9zdCcpO1xufVxuIiwKICAgICJpbXBvcnQgeyBkZnMgfSBmcm9tICcuL2Rmcy5qcyc7XG5cbmV4cG9ydCB7IHByZW9yZGVyIH07XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBwZXJmb3JtcyBhIFtwcmVvcmRlciB0cmF2ZXJzYWxdW10gb2YgdGhlIGdyYXBoIGBnYCBzdGFydGluZ1xuICogYXQgdGhlIG5vZGVzIGB2c2AuIEZvciBlYWNoIG5vZGUgdmlzaXRlZCwgYHZgLCAgdGhlIGZ1bmN0aW9uIGBjYWxsYmFjayh2KWBcbiAqIGlzIGNhbGxlZC5cbiAqXG4gKiBbcHJlb3JkZXIgdHJhdmVyc2FsXTogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvVHJlZV90cmF2ZXJzYWwjRGVwdGgtZmlyc3RcbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqICFbXShodHRwczovL2dpdGh1Yi5jb20vZGFncmVqcy9ncmFwaGxpYi93aWtpL2ltYWdlcy9wcmVvcmRlci5wbmcpXG4gKiA8IS0tIFNPVVJDRTpcbiAqIGh0dHA6Ly9kYWdyZWpzLmdpdGh1Yi5pby9wcm9qZWN0L2RhZ3JlLWQzL2xhdGVzdC9kZW1vL2ludGVyYWN0aXZlLWRlbW8uaHRtbD9ncmFwaD1kaWdyYXBoJTIwJTdCJTBBbm9kZSUyMCU1QnNoYXBlJTNEY2lyY2xlJTJDJTIwc3R5bGUlM0QlMjJmaWxsJTNBd2hpdGUlM0JzdHJva2UlM0ElMjMzMzMlM0JzdHJva2Utd2lkdGglM0ExLjVweCUyMiU1RCUwQWVkZ2UlMjAlNUJsYWJlbG9mZnNldCUzRDIlMjBsYWJlbHBvcyUzRHIlNUQlMEFyYW5rZGlyJTNEbHIlMEElMjAlMjBBJTIwLSUzRSUyMEIlMEElMjAlMjBBJTIwLSUzRSUyMEMlMEElMjAlMjBDJTIwLSUzRSUyMEQlMEElMjAlMjBDJTIwLSUzRSUyMEUlMEElN0RcbiAqIC0tPlxuICpcbiAqIGBgYGpzXG4gKiBncmFwaGxpYi5hbGcucHJlb3JkZXIoZywgXCJBXCIpO1xuICogLy8gPT4gT25lIG9mOlxuICogLy8gWyBcIkFcIiwgXCJCXCIsIFwiQ1wiLCBcIkRcIiwgXCJFXCIgXVxuICogLy8gWyBcIkFcIiwgXCJCXCIsIFwiQ1wiLCBcIkVcIiwgXCJEXCIgXVxuICogLy8gWyBcIkFcIiwgXCJDXCIsIFwiRFwiLCBcIkVcIiwgXCJCXCIgXVxuICogLy8gWyBcIkFcIiwgXCJDXCIsIFwiRVwiLCBcIkRcIiwgXCJCXCIgXVxuICogYGBgXG4gKlxuICogQHBhcmFtIHtQYXJhbWV0ZXJzPHR5cGVvZiBkZnM+WzBdfSBnIC0gVGhlIGdyYXBoIHRvIHRyYXZlcnNlLlxuICogQHBhcmFtIHtQYXJhbWV0ZXJzPHR5cGVvZiBkZnM+WzFdfSB2cyAtIE5vZGVzIHRvIHN0YXJ0IHRoZSB0cmF2ZXJzYWwgZnJvbS5cbiAqIEByZXR1cm5zIHtSZXR1cm5UeXBlPHR5cGVvZiBkZnM+fSBUaGUgbm9kZXMgaW4gdGhlIG9yZGVyIHRoZXkgd2VyZSB2aXNpdGVkLlxuICovXG5mdW5jdGlvbiBwcmVvcmRlcihnLCB2cykge1xuICByZXR1cm4gZGZzKGcsIHZzLCAncHJlJyk7XG59XG4iLAogICAgImltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoLWVzJztcbmltcG9ydCAqIGFzIGFsZyBmcm9tICcuLi8uLi9ncmFwaGxpYi9hbGcvaW5kZXguanMnO1xuaW1wb3J0IHsgc2ltcGxpZnkgfSBmcm9tICcuLi91dGlsLmpzJztcbmltcG9ydCB7IGZlYXNpYmxlVHJlZSB9IGZyb20gJy4vZmVhc2libGUtdHJlZS5qcyc7XG5pbXBvcnQgeyBsb25nZXN0UGF0aCwgc2xhY2sgfSBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgeyBuZXR3b3JrU2ltcGxleCB9O1xuXG4vLyBFeHBvc2Ugc29tZSBpbnRlcm5hbHMgZm9yIHRlc3RpbmcgcHVycG9zZXNcbm5ldHdvcmtTaW1wbGV4LmluaXRMb3dMaW1WYWx1ZXMgPSBpbml0TG93TGltVmFsdWVzO1xubmV0d29ya1NpbXBsZXguaW5pdEN1dFZhbHVlcyA9IGluaXRDdXRWYWx1ZXM7XG5uZXR3b3JrU2ltcGxleC5jYWxjQ3V0VmFsdWUgPSBjYWxjQ3V0VmFsdWU7XG5uZXR3b3JrU2ltcGxleC5sZWF2ZUVkZ2UgPSBsZWF2ZUVkZ2U7XG5uZXR3b3JrU2ltcGxleC5lbnRlckVkZ2UgPSBlbnRlckVkZ2U7XG5uZXR3b3JrU2ltcGxleC5leGNoYW5nZUVkZ2VzID0gZXhjaGFuZ2VFZGdlcztcblxuLypcbiAqIFRoZSBuZXR3b3JrIHNpbXBsZXggYWxnb3JpdGhtIGFzc2lnbnMgcmFua3MgdG8gZWFjaCBub2RlIGluIHRoZSBpbnB1dCBncmFwaFxuICogYW5kIGl0ZXJhdGl2ZWx5IGltcHJvdmVzIHRoZSByYW5raW5nIHRvIHJlZHVjZSB0aGUgbGVuZ3RoIG9mIGVkZ2VzLlxuICpcbiAqIFByZWNvbmRpdGlvbnM6XG4gKlxuICogICAgMS4gVGhlIGlucHV0IGdyYXBoIG11c3QgYmUgYSBEQUcuXG4gKiAgICAyLiBBbGwgbm9kZXMgaW4gdGhlIGdyYXBoIG11c3QgaGF2ZSBhbiBvYmplY3QgdmFsdWUuXG4gKiAgICAzLiBBbGwgZWRnZXMgaW4gdGhlIGdyYXBoIG11c3QgaGF2ZSBcIm1pbmxlblwiIGFuZCBcIndlaWdodFwiIGF0dHJpYnV0ZXMuXG4gKlxuICogUG9zdGNvbmRpdGlvbnM6XG4gKlxuICogICAgMS4gQWxsIG5vZGVzIGluIHRoZSBncmFwaCB3aWxsIGhhdmUgYW4gYXNzaWduZWQgXCJyYW5rXCIgYXR0cmlidXRlIHRoYXQgaGFzXG4gKiAgICAgICBiZWVuIG9wdGltaXplZCBieSB0aGUgbmV0d29yayBzaW1wbGV4IGFsZ29yaXRobS4gUmFua3Mgc3RhcnQgYXQgMC5cbiAqXG4gKlxuICogQSByb3VnaCBza2V0Y2ggb2YgdGhlIGFsZ29yaXRobSBpcyBhcyBmb2xsb3dzOlxuICpcbiAqICAgIDEuIEFzc2lnbiBpbml0aWFsIHJhbmtzIHRvIGVhY2ggbm9kZS4gV2UgdXNlIHRoZSBsb25nZXN0IHBhdGggYWxnb3JpdGhtLFxuICogICAgICAgd2hpY2ggYXNzaWducyByYW5rcyB0byB0aGUgbG93ZXN0IHBvc2l0aW9uIHBvc3NpYmxlLiBJbiBnZW5lcmFsIHRoaXNcbiAqICAgICAgIGxlYWRzIHRvIHZlcnkgd2lkZSBib3R0b20gcmFua3MgYW5kIHVubmVjZXNzYXJpbHkgbG9uZyBlZGdlcy5cbiAqICAgIDIuIENvbnN0cnVjdCBhIGZlYXNpYmxlIHRpZ2h0IHRyZWUuIEEgdGlnaHQgdHJlZSBpcyBvbmUgc3VjaCB0aGF0IGFsbFxuICogICAgICAgZWRnZXMgaW4gdGhlIHRyZWUgaGF2ZSBubyBzbGFjayAoZGlmZmVyZW5jZSBiZXR3ZWVuIGxlbmd0aCBvZiBlZGdlXG4gKiAgICAgICBhbmQgbWlubGVuIGZvciB0aGUgZWRnZSkuIFRoaXMgYnkgaXRzZWxmIGdyZWF0bHkgaW1wcm92ZXMgdGhlIGFzc2lnbmVkXG4gKiAgICAgICByYW5raW5ncyBieSBzaG9ydGluZyBlZGdlcy5cbiAqICAgIDMuIEl0ZXJhdGl2ZWx5IGZpbmQgZWRnZXMgdGhhdCBoYXZlIG5lZ2F0aXZlIGN1dCB2YWx1ZXMuIEdlbmVyYWxseSBhXG4gKiAgICAgICBuZWdhdGl2ZSBjdXQgdmFsdWUgaW5kaWNhdGVzIHRoYXQgdGhlIGVkZ2UgY291bGQgYmUgcmVtb3ZlZCBhbmQgYSBuZXdcbiAqICAgICAgIHRyZWUgZWRnZSBjb3VsZCBiZSBhZGRlZCB0byBwcm9kdWNlIGEgbW9yZSBjb21wYWN0IGdyYXBoLlxuICpcbiAqIE11Y2ggb2YgdGhlIGFsZ29yaXRobXMgaGVyZSBhcmUgZGVyaXZlZCBmcm9tIEdhbnNuZXIsIGV0IGFsLiwgXCJBIFRlY2huaXF1ZVxuICogZm9yIERyYXdpbmcgRGlyZWN0ZWQgR3JhcGhzLlwiIFRoZSBzdHJ1Y3R1cmUgb2YgdGhlIGZpbGUgcm91Z2hseSBmb2xsb3dzIHRoZVxuICogc3RydWN0dXJlIG9mIHRoZSBvdmVyYWxsIGFsZ29yaXRobS5cbiAqL1xuZnVuY3Rpb24gbmV0d29ya1NpbXBsZXgoZykge1xuICBnID0gc2ltcGxpZnkoZyk7XG4gIGxvbmdlc3RQYXRoKGcpO1xuICB2YXIgdCA9IGZlYXNpYmxlVHJlZShnKTtcbiAgaW5pdExvd0xpbVZhbHVlcyh0KTtcbiAgaW5pdEN1dFZhbHVlcyh0LCBnKTtcblxuICB2YXIgZSwgZjtcbiAgd2hpbGUgKChlID0gbGVhdmVFZGdlKHQpKSkge1xuICAgIGYgPSBlbnRlckVkZ2UodCwgZywgZSk7XG4gICAgZXhjaGFuZ2VFZGdlcyh0LCBnLCBlLCBmKTtcbiAgfVxufVxuXG4vKlxuICogSW5pdGlhbGl6ZXMgY3V0IHZhbHVlcyBmb3IgYWxsIGVkZ2VzIGluIHRoZSB0cmVlLlxuICovXG5mdW5jdGlvbiBpbml0Q3V0VmFsdWVzKHQsIGcpIHtcbiAgdmFyIHZzID0gYWxnLnBvc3RvcmRlcih0LCB0Lm5vZGVzKCkpO1xuICB2cyA9IHZzLnNsaWNlKDAsIHZzLmxlbmd0aCAtIDEpO1xuICBfLmZvckVhY2godnMsIGZ1bmN0aW9uICh2KSB7XG4gICAgYXNzaWduQ3V0VmFsdWUodCwgZywgdik7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhc3NpZ25DdXRWYWx1ZSh0LCBnLCBjaGlsZCkge1xuICB2YXIgY2hpbGRMYWIgPSB0Lm5vZGUoY2hpbGQpO1xuICB2YXIgcGFyZW50ID0gY2hpbGRMYWIucGFyZW50O1xuICB0LmVkZ2UoY2hpbGQsIHBhcmVudCkuY3V0dmFsdWUgPSBjYWxjQ3V0VmFsdWUodCwgZywgY2hpbGQpO1xufVxuXG4vKlxuICogR2l2ZW4gdGhlIHRpZ2h0IHRyZWUsIGl0cyBncmFwaCwgYW5kIGEgY2hpbGQgaW4gdGhlIGdyYXBoIGNhbGN1bGF0ZSBhbmRcbiAqIHJldHVybiB0aGUgY3V0IHZhbHVlIGZvciB0aGUgZWRnZSBiZXR3ZWVuIHRoZSBjaGlsZCBhbmQgaXRzIHBhcmVudC5cbiAqL1xuZnVuY3Rpb24gY2FsY0N1dFZhbHVlKHQsIGcsIGNoaWxkKSB7XG4gIHZhciBjaGlsZExhYiA9IHQubm9kZShjaGlsZCk7XG4gIHZhciBwYXJlbnQgPSBjaGlsZExhYi5wYXJlbnQ7XG4gIC8vIFRydWUgaWYgdGhlIGNoaWxkIGlzIG9uIHRoZSB0YWlsIGVuZCBvZiB0aGUgZWRnZSBpbiB0aGUgZGlyZWN0ZWQgZ3JhcGhcbiAgdmFyIGNoaWxkSXNUYWlsID0gdHJ1ZTtcbiAgLy8gVGhlIGdyYXBoJ3MgdmlldyBvZiB0aGUgdHJlZSBlZGdlIHdlJ3JlIGluc3BlY3RpbmdcbiAgdmFyIGdyYXBoRWRnZSA9IGcuZWRnZShjaGlsZCwgcGFyZW50KTtcbiAgLy8gVGhlIGFjY3VtdWxhdGVkIGN1dCB2YWx1ZSBmb3IgdGhlIGVkZ2UgYmV0d2VlbiB0aGlzIG5vZGUgYW5kIGl0cyBwYXJlbnRcbiAgdmFyIGN1dFZhbHVlID0gMDtcblxuICBpZiAoIWdyYXBoRWRnZSkge1xuICAgIGNoaWxkSXNUYWlsID0gZmFsc2U7XG4gICAgZ3JhcGhFZGdlID0gZy5lZGdlKHBhcmVudCwgY2hpbGQpO1xuICB9XG5cbiAgY3V0VmFsdWUgPSBncmFwaEVkZ2Uud2VpZ2h0O1xuXG4gIF8uZm9yRWFjaChnLm5vZGVFZGdlcyhjaGlsZCksIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIGlzT3V0RWRnZSA9IGUudiA9PT0gY2hpbGQsXG4gICAgICBvdGhlciA9IGlzT3V0RWRnZSA/IGUudyA6IGUudjtcblxuICAgIGlmIChvdGhlciAhPT0gcGFyZW50KSB7XG4gICAgICB2YXIgcG9pbnRzVG9IZWFkID0gaXNPdXRFZGdlID09PSBjaGlsZElzVGFpbCxcbiAgICAgICAgb3RoZXJXZWlnaHQgPSBnLmVkZ2UoZSkud2VpZ2h0O1xuXG4gICAgICBjdXRWYWx1ZSArPSBwb2ludHNUb0hlYWQgPyBvdGhlcldlaWdodCA6IC1vdGhlcldlaWdodDtcbiAgICAgIGlmIChpc1RyZWVFZGdlKHQsIGNoaWxkLCBvdGhlcikpIHtcbiAgICAgICAgdmFyIG90aGVyQ3V0VmFsdWUgPSB0LmVkZ2UoY2hpbGQsIG90aGVyKS5jdXR2YWx1ZTtcbiAgICAgICAgY3V0VmFsdWUgKz0gcG9pbnRzVG9IZWFkID8gLW90aGVyQ3V0VmFsdWUgOiBvdGhlckN1dFZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGN1dFZhbHVlO1xufVxuXG5mdW5jdGlvbiBpbml0TG93TGltVmFsdWVzKHRyZWUsIHJvb3QpIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgcm9vdCA9IHRyZWUubm9kZXMoKVswXTtcbiAgfVxuICBkZnNBc3NpZ25Mb3dMaW0odHJlZSwge30sIDEsIHJvb3QpO1xufVxuXG5mdW5jdGlvbiBkZnNBc3NpZ25Mb3dMaW0odHJlZSwgdmlzaXRlZCwgbmV4dExpbSwgdiwgcGFyZW50KSB7XG4gIHZhciBsb3cgPSBuZXh0TGltO1xuICB2YXIgbGFiZWwgPSB0cmVlLm5vZGUodik7XG5cbiAgdmlzaXRlZFt2XSA9IHRydWU7XG4gIF8uZm9yRWFjaCh0cmVlLm5laWdoYm9ycyh2KSwgZnVuY3Rpb24gKHcpIHtcbiAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2aXNpdGVkLCB3KSkge1xuICAgICAgbmV4dExpbSA9IGRmc0Fzc2lnbkxvd0xpbSh0cmVlLCB2aXNpdGVkLCBuZXh0TGltLCB3LCB2KTtcbiAgICB9XG4gIH0pO1xuXG4gIGxhYmVsLmxvdyA9IGxvdztcbiAgbGFiZWwubGltID0gbmV4dExpbSsrO1xuICBpZiAocGFyZW50KSB7XG4gICAgbGFiZWwucGFyZW50ID0gcGFyZW50O1xuICB9IGVsc2Uge1xuICAgIC8vIFRPRE8gc2hvdWxkIGJlIGFibGUgdG8gcmVtb3ZlIHRoaXMgd2hlbiB3ZSBpbmNyZW1lbnRhbGx5IHVwZGF0ZSBsb3cgbGltXG4gICAgZGVsZXRlIGxhYmVsLnBhcmVudDtcbiAgfVxuXG4gIHJldHVybiBuZXh0TGltO1xufVxuXG5mdW5jdGlvbiBsZWF2ZUVkZ2UodHJlZSkge1xuICByZXR1cm4gXy5maW5kKHRyZWUuZWRnZXMoKSwgZnVuY3Rpb24gKGUpIHtcbiAgICByZXR1cm4gdHJlZS5lZGdlKGUpLmN1dHZhbHVlIDwgMDtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGVudGVyRWRnZSh0LCBnLCBlZGdlKSB7XG4gIHZhciB2ID0gZWRnZS52O1xuICB2YXIgdyA9IGVkZ2UudztcblxuICAvLyBGb3IgdGhlIHJlc3Qgb2YgdGhpcyBmdW5jdGlvbiB3ZSBhc3N1bWUgdGhhdCB2IGlzIHRoZSB0YWlsIGFuZCB3IGlzIHRoZVxuICAvLyBoZWFkLCBzbyBpZiB3ZSBkb24ndCBoYXZlIHRoaXMgZWRnZSBpbiB0aGUgZ3JhcGggd2Ugc2hvdWxkIGZsaXAgaXQgdG9cbiAgLy8gbWF0Y2ggdGhlIGNvcnJlY3Qgb3JpZW50YXRpb24uXG4gIGlmICghZy5oYXNFZGdlKHYsIHcpKSB7XG4gICAgdiA9IGVkZ2UudztcbiAgICB3ID0gZWRnZS52O1xuICB9XG5cbiAgdmFyIHZMYWJlbCA9IHQubm9kZSh2KTtcbiAgdmFyIHdMYWJlbCA9IHQubm9kZSh3KTtcbiAgdmFyIHRhaWxMYWJlbCA9IHZMYWJlbDtcbiAgdmFyIGZsaXAgPSBmYWxzZTtcblxuICAvLyBJZiB0aGUgcm9vdCBpcyBpbiB0aGUgdGFpbCBvZiB0aGUgZWRnZSB0aGVuIHdlIG5lZWQgdG8gZmxpcCB0aGUgbG9naWMgdGhhdFxuICAvLyBjaGVja3MgZm9yIHRoZSBoZWFkIGFuZCB0YWlsIG5vZGVzIGluIHRoZSBjYW5kaWRhdGVzIGZ1bmN0aW9uIGJlbG93LlxuICBpZiAodkxhYmVsLmxpbSA+IHdMYWJlbC5saW0pIHtcbiAgICB0YWlsTGFiZWwgPSB3TGFiZWw7XG4gICAgZmxpcCA9IHRydWU7XG4gIH1cblxuICB2YXIgY2FuZGlkYXRlcyA9IF8uZmlsdGVyKGcuZWRnZXMoKSwgZnVuY3Rpb24gKGVkZ2UpIHtcbiAgICByZXR1cm4gKFxuICAgICAgZmxpcCA9PT0gaXNEZXNjZW5kYW50KHQsIHQubm9kZShlZGdlLnYpLCB0YWlsTGFiZWwpICYmXG4gICAgICBmbGlwICE9PSBpc0Rlc2NlbmRhbnQodCwgdC5ub2RlKGVkZ2UudyksIHRhaWxMYWJlbClcbiAgICApO1xuICB9KTtcblxuICByZXR1cm4gXy5taW5CeShjYW5kaWRhdGVzLCBmdW5jdGlvbiAoZWRnZSkge1xuICAgIHJldHVybiBzbGFjayhnLCBlZGdlKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGV4Y2hhbmdlRWRnZXModCwgZywgZSwgZikge1xuICB2YXIgdiA9IGUudjtcbiAgdmFyIHcgPSBlLnc7XG4gIHQucmVtb3ZlRWRnZSh2LCB3KTtcbiAgdC5zZXRFZGdlKGYudiwgZi53LCB7fSk7XG4gIGluaXRMb3dMaW1WYWx1ZXModCk7XG4gIGluaXRDdXRWYWx1ZXModCwgZyk7XG4gIHVwZGF0ZVJhbmtzKHQsIGcpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVSYW5rcyh0LCBnKSB7XG4gIHZhciByb290ID0gXy5maW5kKHQubm9kZXMoKSwgZnVuY3Rpb24gKHYpIHtcbiAgICByZXR1cm4gIWcubm9kZSh2KS5wYXJlbnQ7XG4gIH0pO1xuICB2YXIgdnMgPSBhbGcucHJlb3JkZXIodCwgcm9vdCk7XG4gIHZzID0gdnMuc2xpY2UoMSk7XG4gIF8uZm9yRWFjaCh2cywgZnVuY3Rpb24gKHYpIHtcbiAgICB2YXIgcGFyZW50ID0gdC5ub2RlKHYpLnBhcmVudCxcbiAgICAgIGVkZ2UgPSBnLmVkZ2UodiwgcGFyZW50KSxcbiAgICAgIGZsaXBwZWQgPSBmYWxzZTtcblxuICAgIGlmICghZWRnZSkge1xuICAgICAgZWRnZSA9IGcuZWRnZShwYXJlbnQsIHYpO1xuICAgICAgZmxpcHBlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgZy5ub2RlKHYpLnJhbmsgPSBnLm5vZGUocGFyZW50KS5yYW5rICsgKGZsaXBwZWQgPyBlZGdlLm1pbmxlbiA6IC1lZGdlLm1pbmxlbik7XG4gIH0pO1xufVxuXG4vKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBlZGdlIGlzIGluIHRoZSB0cmVlLlxuICovXG5mdW5jdGlvbiBpc1RyZWVFZGdlKHRyZWUsIHUsIHYpIHtcbiAgcmV0dXJuIHRyZWUuaGFzRWRnZSh1LCB2KTtcbn1cblxuLypcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIG5vZGUgaXMgZGVzY2VuZGFudCBvZiB0aGUgcm9vdCBub2RlIHBlciB0aGVcbiAqIGFzc2lnbmVkIGxvdyBhbmQgbGltIGF0dHJpYnV0ZXMgaW4gdGhlIHRyZWUuXG4gKi9cbmZ1bmN0aW9uIGlzRGVzY2VuZGFudCh0cmVlLCB2TGFiZWwsIHJvb3RMYWJlbCkge1xuICByZXR1cm4gcm9vdExhYmVsLmxvdyA8PSB2TGFiZWwubGltICYmIHZMYWJlbC5saW0gPD0gcm9vdExhYmVsLmxpbTtcbn1cbiIsCiAgICAiaW1wb3J0IHsgZmVhc2libGVUcmVlIH0gZnJvbSAnLi9mZWFzaWJsZS10cmVlLmpzJztcbmltcG9ydCB7IG5ldHdvcmtTaW1wbGV4IH0gZnJvbSAnLi9uZXR3b3JrLXNpbXBsZXguanMnO1xuaW1wb3J0IHsgbG9uZ2VzdFBhdGggfSBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgeyByYW5rIH07XG5cbi8qXG4gKiBBc3NpZ25zIGEgcmFuayB0byBlYWNoIG5vZGUgaW4gdGhlIGlucHV0IGdyYXBoIHRoYXQgcmVzcGVjdHMgdGhlIFwibWlubGVuXCJcbiAqIGNvbnN0cmFpbnQgc3BlY2lmaWVkIG9uIGVkZ2VzIGJldHdlZW4gbm9kZXMuXG4gKlxuICogVGhpcyBiYXNpYyBzdHJ1Y3R1cmUgaXMgZGVyaXZlZCBmcm9tIEdhbnNuZXIsIGV0IGFsLiwgXCJBIFRlY2huaXF1ZSBmb3JcbiAqIERyYXdpbmcgRGlyZWN0ZWQgR3JhcGhzLlwiXG4gKlxuICogUHJlLWNvbmRpdGlvbnM6XG4gKlxuICogICAgMS4gR3JhcGggbXVzdCBiZSBhIGNvbm5lY3RlZCBEQUdcbiAqICAgIDIuIEdyYXBoIG5vZGVzIG11c3QgYmUgb2JqZWN0c1xuICogICAgMy4gR3JhcGggZWRnZXMgbXVzdCBoYXZlIFwid2VpZ2h0XCIgYW5kIFwibWlubGVuXCIgYXR0cmlidXRlc1xuICpcbiAqIFBvc3QtY29uZGl0aW9uczpcbiAqXG4gKiAgICAxLiBHcmFwaCBub2RlcyB3aWxsIGhhdmUgYSBcInJhbmtcIiBhdHRyaWJ1dGUgYmFzZWQgb24gdGhlIHJlc3VsdHMgb2YgdGhlXG4gKiAgICAgICBhbGdvcml0aG0uIFJhbmtzIGNhbiBzdGFydCBhdCBhbnkgaW5kZXggKGluY2x1ZGluZyBuZWdhdGl2ZSksIHdlJ2xsXG4gKiAgICAgICBmaXggdGhlbSB1cCBsYXRlci5cbiAqL1xuZnVuY3Rpb24gcmFuayhnKSB7XG4gIHN3aXRjaCAoZy5ncmFwaCgpLnJhbmtlcikge1xuICAgIGNhc2UgJ25ldHdvcmstc2ltcGxleCc6XG4gICAgICBuZXR3b3JrU2ltcGxleFJhbmtlcihnKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3RpZ2h0LXRyZWUnOlxuICAgICAgdGlnaHRUcmVlUmFua2VyKGcpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbG9uZ2VzdC1wYXRoJzpcbiAgICAgIGxvbmdlc3RQYXRoUmFua2VyKGcpO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIG5ldHdvcmtTaW1wbGV4UmFua2VyKGcpO1xuICB9XG59XG5cbi8vIEEgZmFzdCBhbmQgc2ltcGxlIHJhbmtlciwgYnV0IHJlc3VsdHMgYXJlIGZhciBmcm9tIG9wdGltYWwuXG52YXIgbG9uZ2VzdFBhdGhSYW5rZXIgPSBsb25nZXN0UGF0aDtcblxuZnVuY3Rpb24gdGlnaHRUcmVlUmFua2VyKGcpIHtcbiAgbG9uZ2VzdFBhdGgoZyk7XG4gIGZlYXNpYmxlVHJlZShnKTtcbn1cblxuZnVuY3Rpb24gbmV0d29ya1NpbXBsZXhSYW5rZXIoZykge1xuICBuZXR3b3JrU2ltcGxleChnKTtcbn1cbiIsCiAgICAiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gtZXMnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuL3V0aWwuanMnO1xuXG5leHBvcnQgeyBydW4sIGNsZWFudXAgfTtcblxuLypcbiAqIEEgbmVzdGluZyBncmFwaCBjcmVhdGVzIGR1bW15IG5vZGVzIGZvciB0aGUgdG9wcyBhbmQgYm90dG9tcyBvZiBzdWJncmFwaHMsXG4gKiBhZGRzIGFwcHJvcHJpYXRlIGVkZ2VzIHRvIGVuc3VyZSB0aGF0IGFsbCBjbHVzdGVyIG5vZGVzIGFyZSBwbGFjZWQgYmV0d2VlblxuICogdGhlc2UgYm91bmRyaWVzLCBhbmQgZW5zdXJlcyB0aGF0IHRoZSBncmFwaCBpcyBjb25uZWN0ZWQuXG4gKlxuICogSW4gYWRkaXRpb24gd2UgZW5zdXJlLCB0aHJvdWdoIHRoZSB1c2Ugb2YgdGhlIG1pbmxlbiBwcm9wZXJ0eSwgdGhhdCBub2Rlc1xuICogYW5kIHN1YmdyYXBoIGJvcmRlciBub2RlcyB0byBub3QgZW5kIHVwIG9uIHRoZSBzYW1lIHJhbmsuXG4gKlxuICogUHJlY29uZGl0aW9uczpcbiAqXG4gKiAgICAxLiBJbnB1dCBncmFwaCBpcyBhIERBR1xuICogICAgMi4gTm9kZXMgaW4gdGhlIGlucHV0IGdyYXBoIGhhcyBhIG1pbmxlbiBhdHRyaWJ1dGVcbiAqXG4gKiBQb3N0Y29uZGl0aW9uczpcbiAqXG4gKiAgICAxLiBJbnB1dCBncmFwaCBpcyBjb25uZWN0ZWQuXG4gKiAgICAyLiBEdW1teSBub2RlcyBhcmUgYWRkZWQgZm9yIHRoZSB0b3BzIGFuZCBib3R0b21zIG9mIHN1YmdyYXBocy5cbiAqICAgIDMuIFRoZSBtaW5sZW4gYXR0cmlidXRlIGZvciBub2RlcyBpcyBhZGp1c3RlZCB0byBlbnN1cmUgbm9kZXMgZG8gbm90XG4gKiAgICAgICBnZXQgcGxhY2VkIG9uIHRoZSBzYW1lIHJhbmsgYXMgc3ViZ3JhcGggYm9yZGVyIG5vZGVzLlxuICpcbiAqIFRoZSBuZXN0aW5nIGdyYXBoIGlkZWEgY29tZXMgZnJvbSBTYW5kZXIsIFwiTGF5b3V0IG9mIENvbXBvdW5kIERpcmVjdGVkXG4gKiBHcmFwaHMuXCJcbiAqL1xuZnVuY3Rpb24gcnVuKGcpIHtcbiAgdmFyIHJvb3QgPSB1dGlsLmFkZER1bW15Tm9kZShnLCAncm9vdCcsIHt9LCAnX3Jvb3QnKTtcbiAgdmFyIGRlcHRocyA9IHRyZWVEZXB0aHMoZyk7XG4gIHZhciBoZWlnaHQgPSBfLm1heChfLnZhbHVlcyhkZXB0aHMpKSAtIDE7IC8vIE5vdGU6IGRlcHRocyBpcyBhbiBPYmplY3Qgbm90IGFuIGFycmF5XG4gIHZhciBub2RlU2VwID0gMiAqIGhlaWdodCArIDE7XG5cbiAgZy5ncmFwaCgpLm5lc3RpbmdSb290ID0gcm9vdDtcblxuICAvLyBNdWx0aXBseSBtaW5sZW4gYnkgbm9kZVNlcCB0byBhbGlnbiBub2RlcyBvbiBub24tYm9yZGVyIHJhbmtzLlxuICBfLmZvckVhY2goZy5lZGdlcygpLCBmdW5jdGlvbiAoZSkge1xuICAgIGcuZWRnZShlKS5taW5sZW4gKj0gbm9kZVNlcDtcbiAgfSk7XG5cbiAgLy8gQ2FsY3VsYXRlIGEgd2VpZ2h0IHRoYXQgaXMgc3VmZmljaWVudCB0byBrZWVwIHN1YmdyYXBocyB2ZXJ0aWNhbGx5IGNvbXBhY3RcbiAgdmFyIHdlaWdodCA9IHN1bVdlaWdodHMoZykgKyAxO1xuXG4gIC8vIENyZWF0ZSBib3JkZXIgbm9kZXMgYW5kIGxpbmsgdGhlbSB1cFxuICBfLmZvckVhY2goZy5jaGlsZHJlbigpLCBmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICBkZnMoZywgcm9vdCwgbm9kZVNlcCwgd2VpZ2h0LCBoZWlnaHQsIGRlcHRocywgY2hpbGQpO1xuICB9KTtcblxuICAvLyBTYXZlIHRoZSBtdWx0aXBsaWVyIGZvciBub2RlIGxheWVycyBmb3IgbGF0ZXIgcmVtb3ZhbCBvZiBlbXB0eSBib3JkZXJcbiAgLy8gbGF5ZXJzLlxuICBnLmdyYXBoKCkubm9kZVJhbmtGYWN0b3IgPSBub2RlU2VwO1xufVxuXG5mdW5jdGlvbiBkZnMoZywgcm9vdCwgbm9kZVNlcCwgd2VpZ2h0LCBoZWlnaHQsIGRlcHRocywgdikge1xuICB2YXIgY2hpbGRyZW4gPSBnLmNoaWxkcmVuKHYpO1xuICBpZiAoIWNoaWxkcmVuLmxlbmd0aCkge1xuICAgIGlmICh2ICE9PSByb290KSB7XG4gICAgICBnLnNldEVkZ2Uocm9vdCwgdiwgeyB3ZWlnaHQ6IDAsIG1pbmxlbjogbm9kZVNlcCB9KTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHRvcCA9IHV0aWwuYWRkQm9yZGVyTm9kZShnLCAnX2J0Jyk7XG4gIHZhciBib3R0b20gPSB1dGlsLmFkZEJvcmRlck5vZGUoZywgJ19iYicpO1xuICB2YXIgbGFiZWwgPSBnLm5vZGUodik7XG5cbiAgZy5zZXRQYXJlbnQodG9wLCB2KTtcbiAgbGFiZWwuYm9yZGVyVG9wID0gdG9wO1xuICBnLnNldFBhcmVudChib3R0b20sIHYpO1xuICBsYWJlbC5ib3JkZXJCb3R0b20gPSBib3R0b207XG5cbiAgXy5mb3JFYWNoKGNoaWxkcmVuLCBmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICBkZnMoZywgcm9vdCwgbm9kZVNlcCwgd2VpZ2h0LCBoZWlnaHQsIGRlcHRocywgY2hpbGQpO1xuXG4gICAgdmFyIGNoaWxkTm9kZSA9IGcubm9kZShjaGlsZCk7XG4gICAgdmFyIGNoaWxkVG9wID0gY2hpbGROb2RlLmJvcmRlclRvcCA/IGNoaWxkTm9kZS5ib3JkZXJUb3AgOiBjaGlsZDtcbiAgICB2YXIgY2hpbGRCb3R0b20gPSBjaGlsZE5vZGUuYm9yZGVyQm90dG9tID8gY2hpbGROb2RlLmJvcmRlckJvdHRvbSA6IGNoaWxkO1xuICAgIHZhciB0aGlzV2VpZ2h0ID0gY2hpbGROb2RlLmJvcmRlclRvcCA/IHdlaWdodCA6IDIgKiB3ZWlnaHQ7XG4gICAgdmFyIG1pbmxlbiA9IGNoaWxkVG9wICE9PSBjaGlsZEJvdHRvbSA/IDEgOiBoZWlnaHQgLSBkZXB0aHNbdl0gKyAxO1xuXG4gICAgZy5zZXRFZGdlKHRvcCwgY2hpbGRUb3AsIHtcbiAgICAgIHdlaWdodDogdGhpc1dlaWdodCxcbiAgICAgIG1pbmxlbjogbWlubGVuLFxuICAgICAgbmVzdGluZ0VkZ2U6IHRydWUsXG4gICAgfSk7XG5cbiAgICBnLnNldEVkZ2UoY2hpbGRCb3R0b20sIGJvdHRvbSwge1xuICAgICAgd2VpZ2h0OiB0aGlzV2VpZ2h0LFxuICAgICAgbWlubGVuOiBtaW5sZW4sXG4gICAgICBuZXN0aW5nRWRnZTogdHJ1ZSxcbiAgICB9KTtcbiAgfSk7XG5cbiAgaWYgKCFnLnBhcmVudCh2KSkge1xuICAgIGcuc2V0RWRnZShyb290LCB0b3AsIHsgd2VpZ2h0OiAwLCBtaW5sZW46IGhlaWdodCArIGRlcHRoc1t2XSB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0cmVlRGVwdGhzKGcpIHtcbiAgdmFyIGRlcHRocyA9IHt9O1xuICBmdW5jdGlvbiBkZnModiwgZGVwdGgpIHtcbiAgICB2YXIgY2hpbGRyZW4gPSBnLmNoaWxkcmVuKHYpO1xuICAgIGlmIChjaGlsZHJlbiAmJiBjaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIF8uZm9yRWFjaChjaGlsZHJlbiwgZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgICAgIGRmcyhjaGlsZCwgZGVwdGggKyAxKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBkZXB0aHNbdl0gPSBkZXB0aDtcbiAgfVxuICBfLmZvckVhY2goZy5jaGlsZHJlbigpLCBmdW5jdGlvbiAodikge1xuICAgIGRmcyh2LCAxKTtcbiAgfSk7XG4gIHJldHVybiBkZXB0aHM7XG59XG5cbmZ1bmN0aW9uIHN1bVdlaWdodHMoZykge1xuICByZXR1cm4gXy5yZWR1Y2UoXG4gICAgZy5lZGdlcygpLFxuICAgIGZ1bmN0aW9uIChhY2MsIGUpIHtcbiAgICAgIHJldHVybiBhY2MgKyBnLmVkZ2UoZSkud2VpZ2h0O1xuICAgIH0sXG4gICAgMCxcbiAgKTtcbn1cblxuZnVuY3Rpb24gY2xlYW51cChnKSB7XG4gIHZhciBncmFwaExhYmVsID0gZy5ncmFwaCgpO1xuICBnLnJlbW92ZU5vZGUoZ3JhcGhMYWJlbC5uZXN0aW5nUm9vdCk7XG4gIGRlbGV0ZSBncmFwaExhYmVsLm5lc3RpbmdSb290O1xuICBfLmZvckVhY2goZy5lZGdlcygpLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBlZGdlID0gZy5lZGdlKGUpO1xuICAgIGlmIChlZGdlLm5lc3RpbmdFZGdlKSB7XG4gICAgICBnLnJlbW92ZUVkZ2UoZSk7XG4gICAgfVxuICB9KTtcbn1cbiIsCiAgICAiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gtZXMnO1xuXG5leHBvcnQgeyBhZGRTdWJncmFwaENvbnN0cmFpbnRzIH07XG5cbmZ1bmN0aW9uIGFkZFN1YmdyYXBoQ29uc3RyYWludHMoZywgY2csIHZzKSB7XG4gIHZhciBwcmV2ID0ge30sXG4gICAgcm9vdFByZXY7XG5cbiAgXy5mb3JFYWNoKHZzLCBmdW5jdGlvbiAodikge1xuICAgIHZhciBjaGlsZCA9IGcucGFyZW50KHYpLFxuICAgICAgcGFyZW50LFxuICAgICAgcHJldkNoaWxkO1xuICAgIHdoaWxlIChjaGlsZCkge1xuICAgICAgcGFyZW50ID0gZy5wYXJlbnQoY2hpbGQpO1xuICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICBwcmV2Q2hpbGQgPSBwcmV2W3BhcmVudF07XG4gICAgICAgIHByZXZbcGFyZW50XSA9IGNoaWxkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJldkNoaWxkID0gcm9vdFByZXY7XG4gICAgICAgIHJvb3RQcmV2ID0gY2hpbGQ7XG4gICAgICB9XG4gICAgICBpZiAocHJldkNoaWxkICYmIHByZXZDaGlsZCAhPT0gY2hpbGQpIHtcbiAgICAgICAgY2cuc2V0RWRnZShwcmV2Q2hpbGQsIGNoaWxkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY2hpbGQgPSBwYXJlbnQ7XG4gICAgfVxuICB9KTtcblxuICAvKlxuICBmdW5jdGlvbiBkZnModikge1xuICAgIHZhciBjaGlsZHJlbiA9IHYgPyBnLmNoaWxkcmVuKHYpIDogZy5jaGlsZHJlbigpO1xuICAgIGlmIChjaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIHZhciBtaW4gPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gICAgICAgICAgc3ViZ3JhcGhzID0gW107XG4gICAgICBfLmVhY2goY2hpbGRyZW4sIGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgIHZhciBjaGlsZE1pbiA9IGRmcyhjaGlsZCk7XG4gICAgICAgIGlmIChnLmNoaWxkcmVuKGNoaWxkKS5sZW5ndGgpIHtcbiAgICAgICAgICBzdWJncmFwaHMucHVzaCh7IHY6IGNoaWxkLCBvcmRlcjogY2hpbGRNaW4gfSk7XG4gICAgICAgIH1cbiAgICAgICAgbWluID0gTWF0aC5taW4obWluLCBjaGlsZE1pbik7XG4gICAgICB9KTtcbiAgICAgIF8ucmVkdWNlKF8uc29ydEJ5KHN1YmdyYXBocywgXCJvcmRlclwiKSwgZnVuY3Rpb24ocHJldiwgY3Vycikge1xuICAgICAgICBjZy5zZXRFZGdlKHByZXYudiwgY3Vyci52KTtcbiAgICAgICAgcmV0dXJuIGN1cnI7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBtaW47XG4gICAgfVxuICAgIHJldHVybiBnLm5vZGUodikub3JkZXI7XG4gIH1cbiAgZGZzKHVuZGVmaW5lZCk7XG4gICovXG59XG4iLAogICAgImltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoLWVzJztcbmltcG9ydCB7IEdyYXBoIH0gZnJvbSAnLi4vLi4vZ3JhcGhsaWIvaW5kZXguanMnO1xuXG5leHBvcnQgeyBidWlsZExheWVyR3JhcGggfTtcblxuLypcbiAqIENvbnN0cnVjdHMgYSBncmFwaCB0aGF0IGNhbiBiZSB1c2VkIHRvIHNvcnQgYSBsYXllciBvZiBub2Rlcy4gVGhlIGdyYXBoIHdpbGxcbiAqIGNvbnRhaW4gYWxsIGJhc2UgYW5kIHN1YmdyYXBoIG5vZGVzIGZyb20gdGhlIHJlcXVlc3QgbGF5ZXIgaW4gdGhlaXIgb3JpZ2luYWxcbiAqIGhpZXJhcmNoeSBhbmQgYW55IGVkZ2VzIHRoYXQgYXJlIGluY2lkZW50IG9uIHRoZXNlIG5vZGVzIGFuZCBhcmUgb2YgdGhlIHR5cGVcbiAqIHJlcXVlc3RlZCBieSB0aGUgXCJyZWxhdGlvbnNoaXBcIiBwYXJhbWV0ZXIuXG4gKlxuICogTm9kZXMgZnJvbSB0aGUgcmVxdWVzdGVkIHJhbmsgdGhhdCBkbyBub3QgaGF2ZSBwYXJlbnRzIGFyZSBhc3NpZ25lZCBhIHJvb3RcbiAqIG5vZGUgaW4gdGhlIG91dHB1dCBncmFwaCwgd2hpY2ggaXMgc2V0IGluIHRoZSByb290IGdyYXBoIGF0dHJpYnV0ZS4gVGhpc1xuICogbWFrZXMgaXQgZWFzeSB0byB3YWxrIHRoZSBoaWVyYXJjaHkgb2YgbW92YWJsZSBub2RlcyBkdXJpbmcgb3JkZXJpbmcuXG4gKlxuICogUHJlLWNvbmRpdGlvbnM6XG4gKlxuICogICAgMS4gSW5wdXQgZ3JhcGggaXMgYSBEQUdcbiAqICAgIDIuIEJhc2Ugbm9kZXMgaW4gdGhlIGlucHV0IGdyYXBoIGhhdmUgYSByYW5rIGF0dHJpYnV0ZVxuICogICAgMy4gU3ViZ3JhcGggbm9kZXMgaW4gdGhlIGlucHV0IGdyYXBoIGhhcyBtaW5SYW5rIGFuZCBtYXhSYW5rIGF0dHJpYnV0ZXNcbiAqICAgIDQuIEVkZ2VzIGhhdmUgYW4gYXNzaWduZWQgd2VpZ2h0XG4gKlxuICogUG9zdC1jb25kaXRpb25zOlxuICpcbiAqICAgIDEuIE91dHB1dCBncmFwaCBoYXMgYWxsIG5vZGVzIGluIHRoZSBtb3ZhYmxlIHJhbmsgd2l0aCBwcmVzZXJ2ZWRcbiAqICAgICAgIGhpZXJhcmNoeS5cbiAqICAgIDIuIFJvb3Qgbm9kZXMgaW4gdGhlIG1vdmFibGUgbGF5ZXIgYXJlIG1hZGUgY2hpbGRyZW4gb2YgdGhlIG5vZGVcbiAqICAgICAgIGluZGljYXRlZCBieSB0aGUgcm9vdCBhdHRyaWJ1dGUgb2YgdGhlIGdyYXBoLlxuICogICAgMy4gTm9uLW1vdmFibGUgbm9kZXMgaW5jaWRlbnQgb24gbW92YWJsZSBub2Rlcywgc2VsZWN0ZWQgYnkgdGhlXG4gKiAgICAgICByZWxhdGlvbnNoaXAgcGFyYW1ldGVyLCBhcmUgaW5jbHVkZWQgaW4gdGhlIGdyYXBoICh3aXRob3V0IGhpZXJhcmNoeSkuXG4gKiAgICA0LiBFZGdlcyBpbmNpZGVudCBvbiBtb3ZhYmxlIG5vZGVzLCBzZWxlY3RlZCBieSB0aGUgcmVsYXRpb25zaGlwXG4gKiAgICAgICBwYXJhbWV0ZXIsIGFyZSBhZGRlZCB0byB0aGUgb3V0cHV0IGdyYXBoLlxuICogICAgNS4gVGhlIHdlaWdodHMgZm9yIGNvcGllZCBlZGdlcyBhcmUgYWdncmVnYXRlZCBhcyBuZWVkLCBzaW5jZSB0aGUgb3V0cHV0XG4gKiAgICAgICBncmFwaCBpcyBub3QgYSBtdWx0aS1ncmFwaC5cbiAqL1xuZnVuY3Rpb24gYnVpbGRMYXllckdyYXBoKGcsIHJhbmssIHJlbGF0aW9uc2hpcCkge1xuICB2YXIgcm9vdCA9IGNyZWF0ZVJvb3ROb2RlKGcpLFxuICAgIHJlc3VsdCA9IG5ldyBHcmFwaCh7IGNvbXBvdW5kOiB0cnVlIH0pXG4gICAgICAuc2V0R3JhcGgoeyByb290OiByb290IH0pXG4gICAgICAuc2V0RGVmYXVsdE5vZGVMYWJlbChmdW5jdGlvbiAodikge1xuICAgICAgICByZXR1cm4gZy5ub2RlKHYpO1xuICAgICAgfSk7XG5cbiAgXy5mb3JFYWNoKGcubm9kZXMoKSwgZnVuY3Rpb24gKHYpIHtcbiAgICB2YXIgbm9kZSA9IGcubm9kZSh2KSxcbiAgICAgIHBhcmVudCA9IGcucGFyZW50KHYpO1xuXG4gICAgaWYgKG5vZGUucmFuayA9PT0gcmFuayB8fCAobm9kZS5taW5SYW5rIDw9IHJhbmsgJiYgcmFuayA8PSBub2RlLm1heFJhbmspKSB7XG4gICAgICByZXN1bHQuc2V0Tm9kZSh2KTtcbiAgICAgIHJlc3VsdC5zZXRQYXJlbnQodiwgcGFyZW50IHx8IHJvb3QpO1xuXG4gICAgICAvLyBUaGlzIGFzc3VtZXMgd2UgaGF2ZSBvbmx5IHNob3J0IGVkZ2VzIVxuICAgICAgXy5mb3JFYWNoKGdbcmVsYXRpb25zaGlwXSh2KSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIHUgPSBlLnYgPT09IHYgPyBlLncgOiBlLnYsXG4gICAgICAgICAgZWRnZSA9IHJlc3VsdC5lZGdlKHUsIHYpLFxuICAgICAgICAgIHdlaWdodCA9ICFfLmlzVW5kZWZpbmVkKGVkZ2UpID8gZWRnZS53ZWlnaHQgOiAwO1xuICAgICAgICByZXN1bHQuc2V0RWRnZSh1LCB2LCB7IHdlaWdodDogZy5lZGdlKGUpLndlaWdodCArIHdlaWdodCB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG5vZGUsICdtaW5SYW5rJykpIHtcbiAgICAgICAgcmVzdWx0LnNldE5vZGUodiwge1xuICAgICAgICAgIGJvcmRlckxlZnQ6IG5vZGUuYm9yZGVyTGVmdFtyYW5rXSxcbiAgICAgICAgICBib3JkZXJSaWdodDogbm9kZS5ib3JkZXJSaWdodFtyYW5rXSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBjcmVhdGVSb290Tm9kZShnKSB7XG4gIHZhciB2O1xuICB3aGlsZSAoZy5oYXNOb2RlKCh2ID0gXy51bmlxdWVJZCgnX3Jvb3QnKSkpKTtcbiAgcmV0dXJuIHY7XG59XG4iLAogICAgImltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoLWVzJztcblxuZXhwb3J0IHsgY3Jvc3NDb3VudCB9O1xuXG4vKlxuICogQSBmdW5jdGlvbiB0aGF0IHRha2VzIGEgbGF5ZXJpbmcgKGFuIGFycmF5IG9mIGxheWVycywgZWFjaCB3aXRoIGFuIGFycmF5IG9mXG4gKiBvcmRlcmVyZCBub2RlcykgYW5kIGEgZ3JhcGggYW5kIHJldHVybnMgYSB3ZWlnaHRlZCBjcm9zc2luZyBjb3VudC5cbiAqXG4gKiBQcmUtY29uZGl0aW9uczpcbiAqXG4gKiAgICAxLiBJbnB1dCBncmFwaCBtdXN0IGJlIHNpbXBsZSAobm90IGEgbXVsdGlncmFwaCksIGRpcmVjdGVkLCBhbmQgaW5jbHVkZVxuICogICAgICAgb25seSBzaW1wbGUgZWRnZXMuXG4gKiAgICAyLiBFZGdlcyBpbiB0aGUgaW5wdXQgZ3JhcGggbXVzdCBoYXZlIGFzc2lnbmVkIHdlaWdodHMuXG4gKlxuICogUG9zdC1jb25kaXRpb25zOlxuICpcbiAqICAgIDEuIFRoZSBncmFwaCBhbmQgbGF5ZXJpbmcgbWF0cml4IGFyZSBsZWZ0IHVuY2hhbmdlZC5cbiAqXG4gKiBUaGlzIGFsZ29yaXRobSBpcyBkZXJpdmVkIGZyb20gQmFydGgsIGV0IGFsLiwgXCJCaWxheWVyIENyb3NzIENvdW50aW5nLlwiXG4gKi9cbmZ1bmN0aW9uIGNyb3NzQ291bnQoZywgbGF5ZXJpbmcpIHtcbiAgdmFyIGNjID0gMDtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBsYXllcmluZy5sZW5ndGg7ICsraSkge1xuICAgIGNjICs9IHR3b0xheWVyQ3Jvc3NDb3VudChnLCBsYXllcmluZ1tpIC0gMV0sIGxheWVyaW5nW2ldKTtcbiAgfVxuICByZXR1cm4gY2M7XG59XG5cbmZ1bmN0aW9uIHR3b0xheWVyQ3Jvc3NDb3VudChnLCBub3J0aExheWVyLCBzb3V0aExheWVyKSB7XG4gIC8vIFNvcnQgYWxsIG9mIHRoZSBlZGdlcyBiZXR3ZWVuIHRoZSBub3J0aCBhbmQgc291dGggbGF5ZXJzIGJ5IHRoZWlyIHBvc2l0aW9uXG4gIC8vIGluIHRoZSBub3J0aCBsYXllciBhbmQgdGhlbiB0aGUgc291dGguIE1hcCB0aGVzZSBlZGdlcyB0byB0aGUgcG9zaXRpb24gb2ZcbiAgLy8gdGhlaXIgaGVhZCBpbiB0aGUgc291dGggbGF5ZXIuXG4gIHZhciBzb3V0aFBvcyA9IF8uemlwT2JqZWN0KFxuICAgIHNvdXRoTGF5ZXIsXG4gICAgXy5tYXAoc291dGhMYXllciwgZnVuY3Rpb24gKHYsIGkpIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH0pLFxuICApO1xuICB2YXIgc291dGhFbnRyaWVzID0gXy5mbGF0dGVuKFxuICAgIF8ubWFwKG5vcnRoTGF5ZXIsIGZ1bmN0aW9uICh2KSB7XG4gICAgICByZXR1cm4gXy5zb3J0QnkoXG4gICAgICAgIF8ubWFwKGcub3V0RWRnZXModiksIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgcmV0dXJuIHsgcG9zOiBzb3V0aFBvc1tlLnddLCB3ZWlnaHQ6IGcuZWRnZShlKS53ZWlnaHQgfTtcbiAgICAgICAgfSksXG4gICAgICAgICdwb3MnLFxuICAgICAgKTtcbiAgICB9KSxcbiAgKTtcblxuICAvLyBCdWlsZCB0aGUgYWNjdW11bGF0b3IgdHJlZVxuICB2YXIgZmlyc3RJbmRleCA9IDE7XG4gIHdoaWxlIChmaXJzdEluZGV4IDwgc291dGhMYXllci5sZW5ndGgpIGZpcnN0SW5kZXggPDw9IDE7XG4gIHZhciB0cmVlU2l6ZSA9IDIgKiBmaXJzdEluZGV4IC0gMTtcbiAgZmlyc3RJbmRleCAtPSAxO1xuICB2YXIgdHJlZSA9IF8ubWFwKG5ldyBBcnJheSh0cmVlU2l6ZSksIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gMDtcbiAgfSk7XG5cbiAgLy8gQ2FsY3VsYXRlIHRoZSB3ZWlnaHRlZCBjcm9zc2luZ3NcbiAgdmFyIGNjID0gMDtcbiAgXy5mb3JFYWNoKFxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICBzb3V0aEVudHJpZXMuZm9yRWFjaChmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgIHZhciBpbmRleCA9IGVudHJ5LnBvcyArIGZpcnN0SW5kZXg7XG4gICAgICB0cmVlW2luZGV4XSArPSBlbnRyeS53ZWlnaHQ7XG4gICAgICB2YXIgd2VpZ2h0U3VtID0gMDtcbiAgICAgIHdoaWxlIChpbmRleCA+IDApIHtcbiAgICAgICAgaWYgKGluZGV4ICUgMikge1xuICAgICAgICAgIHdlaWdodFN1bSArPSB0cmVlW2luZGV4ICsgMV07XG4gICAgICAgIH1cbiAgICAgICAgaW5kZXggPSAoaW5kZXggLSAxKSA+PiAxO1xuICAgICAgICB0cmVlW2luZGV4XSArPSBlbnRyeS53ZWlnaHQ7XG4gICAgICB9XG4gICAgICBjYyArPSBlbnRyeS53ZWlnaHQgKiB3ZWlnaHRTdW07XG4gICAgfSksXG4gICk7XG5cbiAgcmV0dXJuIGNjO1xufVxuIiwKICAgICJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaC1lcyc7XG5cbi8qXG4gKiBBc3NpZ25zIGFuIGluaXRpYWwgb3JkZXIgdmFsdWUgZm9yIGVhY2ggbm9kZSBieSBwZXJmb3JtaW5nIGEgREZTIHNlYXJjaFxuICogc3RhcnRpbmcgZnJvbSBub2RlcyBpbiB0aGUgZmlyc3QgcmFuay4gTm9kZXMgYXJlIGFzc2lnbmVkIGFuIG9yZGVyIGluIHRoZWlyXG4gKiByYW5rIGFzIHRoZXkgYXJlIGZpcnN0IHZpc2l0ZWQuXG4gKlxuICogVGhpcyBhcHByb2FjaCBjb21lcyBmcm9tIEdhbnNuZXIsIGV0IGFsLiwgXCJBIFRlY2huaXF1ZSBmb3IgRHJhd2luZyBEaXJlY3RlZFxuICogR3JhcGhzLlwiXG4gKlxuICogUmV0dXJucyBhIGxheWVyaW5nIG1hdHJpeCB3aXRoIGFuIGFycmF5IHBlciBsYXllciBhbmQgZWFjaCBsYXllciBzb3J0ZWQgYnlcbiAqIHRoZSBvcmRlciBvZiBpdHMgbm9kZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbml0T3JkZXIoZykge1xuICB2YXIgdmlzaXRlZCA9IHt9O1xuICB2YXIgc2ltcGxlTm9kZXMgPSBfLmZpbHRlcihnLm5vZGVzKCksIGZ1bmN0aW9uICh2KSB7XG4gICAgcmV0dXJuICFnLmNoaWxkcmVuKHYpLmxlbmd0aDtcbiAgfSk7XG4gIHZhciBtYXhSYW5rID0gXy5tYXgoXG4gICAgXy5tYXAoc2ltcGxlTm9kZXMsIGZ1bmN0aW9uICh2KSB7XG4gICAgICByZXR1cm4gZy5ub2RlKHYpLnJhbms7XG4gICAgfSksXG4gICk7XG4gIHZhciBsYXllcnMgPSBfLm1hcChfLnJhbmdlKG1heFJhbmsgKyAxKSwgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBbXTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gZGZzKHYpIHtcbiAgICBpZiAoXy5oYXModmlzaXRlZCwgdikpIHJldHVybjtcbiAgICB2aXNpdGVkW3ZdID0gdHJ1ZTtcbiAgICB2YXIgbm9kZSA9IGcubm9kZSh2KTtcbiAgICBsYXllcnNbbm9kZS5yYW5rXS5wdXNoKHYpO1xuICAgIF8uZm9yRWFjaChnLnN1Y2Nlc3NvcnModiksIGRmcyk7XG4gIH1cblxuICB2YXIgb3JkZXJlZFZzID0gXy5zb3J0Qnkoc2ltcGxlTm9kZXMsIGZ1bmN0aW9uICh2KSB7XG4gICAgcmV0dXJuIGcubm9kZSh2KS5yYW5rO1xuICB9KTtcbiAgXy5mb3JFYWNoKG9yZGVyZWRWcywgZGZzKTtcblxuICByZXR1cm4gbGF5ZXJzO1xufVxuIiwKICAgICJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaC1lcyc7XG5cbmV4cG9ydCB7IGJhcnljZW50ZXIgfTtcblxuZnVuY3Rpb24gYmFyeWNlbnRlcihnLCBtb3ZhYmxlKSB7XG4gIHJldHVybiBfLm1hcChtb3ZhYmxlLCBmdW5jdGlvbiAodikge1xuICAgIHZhciBpblYgPSBnLmluRWRnZXModik7XG4gICAgaWYgKCFpblYubGVuZ3RoKSB7XG4gICAgICByZXR1cm4geyB2OiB2IH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciByZXN1bHQgPSBfLnJlZHVjZShcbiAgICAgICAgaW5WLFxuICAgICAgICBmdW5jdGlvbiAoYWNjLCBlKSB7XG4gICAgICAgICAgdmFyIGVkZ2UgPSBnLmVkZ2UoZSksXG4gICAgICAgICAgICBub2RlVSA9IGcubm9kZShlLnYpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdW06IGFjYy5zdW0gKyBlZGdlLndlaWdodCAqIG5vZGVVLm9yZGVyLFxuICAgICAgICAgICAgd2VpZ2h0OiBhY2Mud2VpZ2h0ICsgZWRnZS53ZWlnaHQsXG4gICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgeyBzdW06IDAsIHdlaWdodDogMCB9LFxuICAgICAgKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdjogdixcbiAgICAgICAgYmFyeWNlbnRlcjogcmVzdWx0LnN1bSAvIHJlc3VsdC53ZWlnaHQsXG4gICAgICAgIHdlaWdodDogcmVzdWx0LndlaWdodCxcbiAgICAgIH07XG4gICAgfVxuICB9KTtcbn1cbiIsCiAgICAiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gtZXMnO1xuXG5leHBvcnQgeyByZXNvbHZlQ29uZmxpY3RzIH07XG5cbi8qXG4gKiBHaXZlbiBhIGxpc3Qgb2YgZW50cmllcyBvZiB0aGUgZm9ybSB7diwgYmFyeWNlbnRlciwgd2VpZ2h0fSBhbmQgYVxuICogY29uc3RyYWludCBncmFwaCB0aGlzIGZ1bmN0aW9uIHdpbGwgcmVzb2x2ZSBhbnkgY29uZmxpY3RzIGJldHdlZW4gdGhlXG4gKiBjb25zdHJhaW50IGdyYXBoIGFuZCB0aGUgYmFyeWNlbnRlcnMgZm9yIHRoZSBlbnRyaWVzLiBJZiB0aGUgYmFyeWNlbnRlcnMgZm9yXG4gKiBhbiBlbnRyeSB3b3VsZCB2aW9sYXRlIGEgY29uc3RyYWludCBpbiB0aGUgY29uc3RyYWludCBncmFwaCB0aGVuIHdlIGNvYWxlc2NlXG4gKiB0aGUgbm9kZXMgaW4gdGhlIGNvbmZsaWN0IGludG8gYSBuZXcgbm9kZSB0aGF0IHJlc3BlY3RzIHRoZSBjb250cmFpbnQgYW5kXG4gKiBhZ2dyZWdhdGVzIGJhcnljZW50ZXIgYW5kIHdlaWdodCBpbmZvcm1hdGlvbi5cbiAqXG4gKiBUaGlzIGltcGxlbWVudGF0aW9uIGlzIGJhc2VkIG9uIHRoZSBkZXNjcmlwdGlvbiBpbiBGb3JzdGVyLCBcIkEgRmFzdCBhbmRcbiAqIFNpbXBsZSBIdWVyaXN0aWMgZm9yIENvbnN0cmFpbmVkIFR3by1MZXZlbCBDcm9zc2luZyBSZWR1Y3Rpb24sXCIgdGhvdWdodCBpdFxuICogZGlmZmVycyBpbiBzb21lIHNwZWNpZmljIGRldGFpbHMuXG4gKlxuICogUHJlLWNvbmRpdGlvbnM6XG4gKlxuICogICAgMS4gRWFjaCBlbnRyeSBoYXMgdGhlIGZvcm0ge3YsIGJhcnljZW50ZXIsIHdlaWdodH0sIG9yIGlmIHRoZSBub2RlIGhhc1xuICogICAgICAgbm8gYmFyeWNlbnRlciwgdGhlbiB7dn0uXG4gKlxuICogUmV0dXJuczpcbiAqXG4gKiAgICBBIG5ldyBsaXN0IG9mIGVudHJpZXMgb2YgdGhlIGZvcm0ge3ZzLCBpLCBiYXJ5Y2VudGVyLCB3ZWlnaHR9LiBUaGUgbGlzdFxuICogICAgYHZzYCBtYXkgZWl0aGVyIGJlIGEgc2luZ2xldG9uIG9yIGl0IG1heSBiZSBhbiBhZ2dyZWdhdGlvbiBvZiBub2Rlc1xuICogICAgb3JkZXJlZCBzdWNoIHRoYXQgdGhleSBkbyBub3QgdmlvbGF0ZSBjb25zdHJhaW50cyBmcm9tIHRoZSBjb25zdHJhaW50XG4gKiAgICBncmFwaC4gVGhlIHByb3BlcnR5IGBpYCBpcyB0aGUgbG93ZXN0IG9yaWdpbmFsIGluZGV4IG9mIGFueSBvZiB0aGVcbiAqICAgIGVsZW1lbnRzIGluIGB2c2AuXG4gKi9cbmZ1bmN0aW9uIHJlc29sdmVDb25mbGljdHMoZW50cmllcywgY2cpIHtcbiAgdmFyIG1hcHBlZEVudHJpZXMgPSB7fTtcbiAgXy5mb3JFYWNoKGVudHJpZXMsIGZ1bmN0aW9uIChlbnRyeSwgaSkge1xuICAgIHZhciB0bXAgPSAobWFwcGVkRW50cmllc1tlbnRyeS52XSA9IHtcbiAgICAgIGluZGVncmVlOiAwLFxuICAgICAgaW46IFtdLFxuICAgICAgb3V0OiBbXSxcbiAgICAgIHZzOiBbZW50cnkudl0sXG4gICAgICBpOiBpLFxuICAgIH0pO1xuICAgIGlmICghXy5pc1VuZGVmaW5lZChlbnRyeS5iYXJ5Y2VudGVyKSkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgdG1wLmJhcnljZW50ZXIgPSBlbnRyeS5iYXJ5Y2VudGVyO1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgdG1wLndlaWdodCA9IGVudHJ5LndlaWdodDtcbiAgICB9XG4gIH0pO1xuXG4gIF8uZm9yRWFjaChjZy5lZGdlcygpLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBlbnRyeVYgPSBtYXBwZWRFbnRyaWVzW2Uudl07XG4gICAgdmFyIGVudHJ5VyA9IG1hcHBlZEVudHJpZXNbZS53XTtcbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoZW50cnlWKSAmJiAhXy5pc1VuZGVmaW5lZChlbnRyeVcpKSB7XG4gICAgICBlbnRyeVcuaW5kZWdyZWUrKztcbiAgICAgIGVudHJ5Vi5vdXQucHVzaChtYXBwZWRFbnRyaWVzW2Uud10pO1xuICAgIH1cbiAgfSk7XG5cbiAgdmFyIHNvdXJjZVNldCA9IF8uZmlsdGVyKG1hcHBlZEVudHJpZXMsIGZ1bmN0aW9uIChlbnRyeSkge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICByZXR1cm4gIWVudHJ5LmluZGVncmVlO1xuICB9KTtcblxuICByZXR1cm4gZG9SZXNvbHZlQ29uZmxpY3RzKHNvdXJjZVNldCk7XG59XG5cbmZ1bmN0aW9uIGRvUmVzb2x2ZUNvbmZsaWN0cyhzb3VyY2VTZXQpIHtcbiAgdmFyIGVudHJpZXMgPSBbXTtcblxuICBmdW5jdGlvbiBoYW5kbGVJbih2RW50cnkpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHVFbnRyeSkge1xuICAgICAgaWYgKHVFbnRyeS5tZXJnZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKFxuICAgICAgICBfLmlzVW5kZWZpbmVkKHVFbnRyeS5iYXJ5Y2VudGVyKSB8fFxuICAgICAgICBfLmlzVW5kZWZpbmVkKHZFbnRyeS5iYXJ5Y2VudGVyKSB8fFxuICAgICAgICB1RW50cnkuYmFyeWNlbnRlciA+PSB2RW50cnkuYmFyeWNlbnRlclxuICAgICAgKSB7XG4gICAgICAgIG1lcmdlRW50cmllcyh2RW50cnksIHVFbnRyeSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZU91dCh2RW50cnkpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHdFbnRyeSkge1xuICAgICAgd0VudHJ5WydpbiddLnB1c2godkVudHJ5KTtcbiAgICAgIGlmICgtLXdFbnRyeS5pbmRlZ3JlZSA9PT0gMCkge1xuICAgICAgICBzb3VyY2VTZXQucHVzaCh3RW50cnkpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICB3aGlsZSAoc291cmNlU2V0Lmxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IHNvdXJjZVNldC5wb3AoKTtcbiAgICBlbnRyaWVzLnB1c2goZW50cnkpO1xuICAgIF8uZm9yRWFjaChlbnRyeVsnaW4nXS5yZXZlcnNlKCksIGhhbmRsZUluKGVudHJ5KSk7XG4gICAgXy5mb3JFYWNoKGVudHJ5Lm91dCwgaGFuZGxlT3V0KGVudHJ5KSk7XG4gIH1cblxuICByZXR1cm4gXy5tYXAoXG4gICAgXy5maWx0ZXIoZW50cmllcywgZnVuY3Rpb24gKGVudHJ5KSB7XG4gICAgICByZXR1cm4gIWVudHJ5Lm1lcmdlZDtcbiAgICB9KSxcbiAgICBmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgIHJldHVybiBfLnBpY2soZW50cnksIFsndnMnLCAnaScsICdiYXJ5Y2VudGVyJywgJ3dlaWdodCddKTtcbiAgICB9LFxuICApO1xufVxuXG5mdW5jdGlvbiBtZXJnZUVudHJpZXModGFyZ2V0LCBzb3VyY2UpIHtcbiAgdmFyIHN1bSA9IDA7XG4gIHZhciB3ZWlnaHQgPSAwO1xuXG4gIGlmICh0YXJnZXQud2VpZ2h0KSB7XG4gICAgc3VtICs9IHRhcmdldC5iYXJ5Y2VudGVyICogdGFyZ2V0LndlaWdodDtcbiAgICB3ZWlnaHQgKz0gdGFyZ2V0LndlaWdodDtcbiAgfVxuXG4gIGlmIChzb3VyY2Uud2VpZ2h0KSB7XG4gICAgc3VtICs9IHNvdXJjZS5iYXJ5Y2VudGVyICogc291cmNlLndlaWdodDtcbiAgICB3ZWlnaHQgKz0gc291cmNlLndlaWdodDtcbiAgfVxuXG4gIHRhcmdldC52cyA9IHNvdXJjZS52cy5jb25jYXQodGFyZ2V0LnZzKTtcbiAgdGFyZ2V0LmJhcnljZW50ZXIgPSBzdW0gLyB3ZWlnaHQ7XG4gIHRhcmdldC53ZWlnaHQgPSB3ZWlnaHQ7XG4gIHRhcmdldC5pID0gTWF0aC5taW4oc291cmNlLmksIHRhcmdldC5pKTtcbiAgc291cmNlLm1lcmdlZCA9IHRydWU7XG59XG4iLAogICAgImltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoLWVzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi4vdXRpbC5qcyc7XG5cbmV4cG9ydCB7IHNvcnQgfTtcblxuZnVuY3Rpb24gc29ydChlbnRyaWVzLCBiaWFzUmlnaHQpIHtcbiAgdmFyIHBhcnRzID0gdXRpbC5wYXJ0aXRpb24oZW50cmllcywgZnVuY3Rpb24gKGVudHJ5KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlbnRyeSwgJ2JhcnljZW50ZXInKTtcbiAgfSk7XG4gIHZhciBzb3J0YWJsZSA9IHBhcnRzLmxocyxcbiAgICB1bnNvcnRhYmxlID0gXy5zb3J0QnkocGFydHMucmhzLCBmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgIHJldHVybiAtZW50cnkuaTtcbiAgICB9KSxcbiAgICB2cyA9IFtdLFxuICAgIHN1bSA9IDAsXG4gICAgd2VpZ2h0ID0gMCxcbiAgICB2c0luZGV4ID0gMDtcblxuICBzb3J0YWJsZS5zb3J0KGNvbXBhcmVXaXRoQmlhcyghIWJpYXNSaWdodCkpO1xuXG4gIHZzSW5kZXggPSBjb25zdW1lVW5zb3J0YWJsZSh2cywgdW5zb3J0YWJsZSwgdnNJbmRleCk7XG5cbiAgXy5mb3JFYWNoKHNvcnRhYmxlLCBmdW5jdGlvbiAoZW50cnkpIHtcbiAgICB2c0luZGV4ICs9IGVudHJ5LnZzLmxlbmd0aDtcbiAgICB2cy5wdXNoKGVudHJ5LnZzKTtcbiAgICBzdW0gKz0gZW50cnkuYmFyeWNlbnRlciAqIGVudHJ5LndlaWdodDtcbiAgICB3ZWlnaHQgKz0gZW50cnkud2VpZ2h0O1xuICAgIHZzSW5kZXggPSBjb25zdW1lVW5zb3J0YWJsZSh2cywgdW5zb3J0YWJsZSwgdnNJbmRleCk7XG4gIH0pO1xuXG4gIHZhciByZXN1bHQgPSB7IHZzOiBfLmZsYXR0ZW4odnMpIH07XG4gIGlmICh3ZWlnaHQpIHtcbiAgICByZXN1bHQuYmFyeWNlbnRlciA9IHN1bSAvIHdlaWdodDtcbiAgICByZXN1bHQud2VpZ2h0ID0gd2VpZ2h0O1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGNvbnN1bWVVbnNvcnRhYmxlKHZzLCB1bnNvcnRhYmxlLCBpbmRleCkge1xuICB2YXIgbGFzdDtcbiAgd2hpbGUgKHVuc29ydGFibGUubGVuZ3RoICYmIChsYXN0ID0gXy5sYXN0KHVuc29ydGFibGUpKS5pIDw9IGluZGV4KSB7XG4gICAgdW5zb3J0YWJsZS5wb3AoKTtcbiAgICB2cy5wdXNoKGxhc3QudnMpO1xuICAgIGluZGV4Kys7XG4gIH1cbiAgcmV0dXJuIGluZGV4O1xufVxuXG5mdW5jdGlvbiBjb21wYXJlV2l0aEJpYXMoYmlhcykge1xuICByZXR1cm4gZnVuY3Rpb24gKGVudHJ5ViwgZW50cnlXKSB7XG4gICAgaWYgKGVudHJ5Vi5iYXJ5Y2VudGVyIDwgZW50cnlXLmJhcnljZW50ZXIpIHtcbiAgICAgIHJldHVybiAtMTtcbiAgICB9IGVsc2UgaWYgKGVudHJ5Vi5iYXJ5Y2VudGVyID4gZW50cnlXLmJhcnljZW50ZXIpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH1cblxuICAgIHJldHVybiAhYmlhcyA/IGVudHJ5Vi5pIC0gZW50cnlXLmkgOiBlbnRyeVcuaSAtIGVudHJ5Vi5pO1xuICB9O1xufVxuIiwKICAgICJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaC1lcyc7XG5pbXBvcnQgeyBiYXJ5Y2VudGVyIH0gZnJvbSAnLi9iYXJ5Y2VudGVyLmpzJztcbmltcG9ydCB7IHJlc29sdmVDb25mbGljdHMgfSBmcm9tICcuL3Jlc29sdmUtY29uZmxpY3RzLmpzJztcbmltcG9ydCB7IHNvcnQgfSBmcm9tICcuL3NvcnQuanMnO1xuXG5leHBvcnQgeyBzb3J0U3ViZ3JhcGggfTtcblxuZnVuY3Rpb24gc29ydFN1YmdyYXBoKGcsIHYsIGNnLCBiaWFzUmlnaHQpIHtcbiAgdmFyIG1vdmFibGUgPSBnLmNoaWxkcmVuKHYpO1xuICB2YXIgbm9kZSA9IGcubm9kZSh2KTtcbiAgdmFyIGJsID0gbm9kZSA/IG5vZGUuYm9yZGVyTGVmdCA6IHVuZGVmaW5lZDtcbiAgdmFyIGJyID0gbm9kZSA/IG5vZGUuYm9yZGVyUmlnaHQgOiB1bmRlZmluZWQ7XG4gIHZhciBzdWJncmFwaHMgPSB7fTtcblxuICBpZiAoYmwpIHtcbiAgICBtb3ZhYmxlID0gXy5maWx0ZXIobW92YWJsZSwgZnVuY3Rpb24gKHcpIHtcbiAgICAgIHJldHVybiB3ICE9PSBibCAmJiB3ICE9PSBicjtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciBiYXJ5Y2VudGVycyA9IGJhcnljZW50ZXIoZywgbW92YWJsZSk7XG4gIF8uZm9yRWFjaChiYXJ5Y2VudGVycywgZnVuY3Rpb24gKGVudHJ5KSB7XG4gICAgaWYgKGcuY2hpbGRyZW4oZW50cnkudikubGVuZ3RoKSB7XG4gICAgICB2YXIgc3ViZ3JhcGhSZXN1bHQgPSBzb3J0U3ViZ3JhcGgoZywgZW50cnkudiwgY2csIGJpYXNSaWdodCk7XG4gICAgICBzdWJncmFwaHNbZW50cnkudl0gPSBzdWJncmFwaFJlc3VsdDtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc3ViZ3JhcGhSZXN1bHQsICdiYXJ5Y2VudGVyJykpIHtcbiAgICAgICAgbWVyZ2VCYXJ5Y2VudGVycyhlbnRyeSwgc3ViZ3JhcGhSZXN1bHQpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgdmFyIGVudHJpZXMgPSByZXNvbHZlQ29uZmxpY3RzKGJhcnljZW50ZXJzLCBjZyk7XG4gIGV4cGFuZFN1YmdyYXBocyhlbnRyaWVzLCBzdWJncmFwaHMpO1xuXG4gIHZhciByZXN1bHQgPSBzb3J0KGVudHJpZXMsIGJpYXNSaWdodCk7XG5cbiAgaWYgKGJsKSB7XG4gICAgcmVzdWx0LnZzID0gXy5mbGF0dGVuKFtibCwgcmVzdWx0LnZzLCBicl0pO1xuICAgIGlmIChnLnByZWRlY2Vzc29ycyhibCkubGVuZ3RoKSB7XG4gICAgICB2YXIgYmxQcmVkID0gZy5ub2RlKGcucHJlZGVjZXNzb3JzKGJsKVswXSksXG4gICAgICAgIGJyUHJlZCA9IGcubm9kZShnLnByZWRlY2Vzc29ycyhicilbMF0pO1xuICAgICAgaWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocmVzdWx0LCAnYmFyeWNlbnRlcicpKSB7XG4gICAgICAgIHJlc3VsdC5iYXJ5Y2VudGVyID0gMDtcbiAgICAgICAgcmVzdWx0LndlaWdodCA9IDA7XG4gICAgICB9XG4gICAgICByZXN1bHQuYmFyeWNlbnRlciA9XG4gICAgICAgIChyZXN1bHQuYmFyeWNlbnRlciAqIHJlc3VsdC53ZWlnaHQgKyBibFByZWQub3JkZXIgKyBiclByZWQub3JkZXIpIC8gKHJlc3VsdC53ZWlnaHQgKyAyKTtcbiAgICAgIHJlc3VsdC53ZWlnaHQgKz0gMjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBleHBhbmRTdWJncmFwaHMoZW50cmllcywgc3ViZ3JhcGhzKSB7XG4gIF8uZm9yRWFjaChlbnRyaWVzLCBmdW5jdGlvbiAoZW50cnkpIHtcbiAgICBlbnRyeS52cyA9IF8uZmxhdHRlbihcbiAgICAgIGVudHJ5LnZzLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgICBpZiAoc3ViZ3JhcGhzW3ZdKSB7XG4gICAgICAgICAgcmV0dXJuIHN1YmdyYXBoc1t2XS52cztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdjtcbiAgICAgIH0pLFxuICAgICk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBtZXJnZUJhcnljZW50ZXJzKHRhcmdldCwgb3RoZXIpIHtcbiAgaWYgKCFfLmlzVW5kZWZpbmVkKHRhcmdldC5iYXJ5Y2VudGVyKSkge1xuICAgIHRhcmdldC5iYXJ5Y2VudGVyID1cbiAgICAgICh0YXJnZXQuYmFyeWNlbnRlciAqIHRhcmdldC53ZWlnaHQgKyBvdGhlci5iYXJ5Y2VudGVyICogb3RoZXIud2VpZ2h0KSAvXG4gICAgICAodGFyZ2V0LndlaWdodCArIG90aGVyLndlaWdodCk7XG4gICAgdGFyZ2V0LndlaWdodCArPSBvdGhlci53ZWlnaHQ7XG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0LmJhcnljZW50ZXIgPSBvdGhlci5iYXJ5Y2VudGVyO1xuICAgIHRhcmdldC53ZWlnaHQgPSBvdGhlci53ZWlnaHQ7XG4gIH1cbn1cbiIsCiAgICAiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gtZXMnO1xuaW1wb3J0IHsgR3JhcGggfSBmcm9tICcuLi8uLi9ncmFwaGxpYi9pbmRleC5qcyc7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJy4uL3V0aWwuanMnO1xuaW1wb3J0IHsgYWRkU3ViZ3JhcGhDb25zdHJhaW50cyB9IGZyb20gJy4vYWRkLXN1YmdyYXBoLWNvbnN0cmFpbnRzLmpzJztcbmltcG9ydCB7IGJ1aWxkTGF5ZXJHcmFwaCB9IGZyb20gJy4vYnVpbGQtbGF5ZXItZ3JhcGguanMnO1xuaW1wb3J0IHsgY3Jvc3NDb3VudCB9IGZyb20gJy4vY3Jvc3MtY291bnQuanMnO1xuaW1wb3J0IHsgaW5pdE9yZGVyIH0gZnJvbSAnLi9pbml0LW9yZGVyLmpzJztcbmltcG9ydCB7IHNvcnRTdWJncmFwaCB9IGZyb20gJy4vc29ydC1zdWJncmFwaC5qcyc7XG5cbmV4cG9ydCB7IG9yZGVyIH07XG5cbi8qXG4gKiBBcHBsaWVzIGhldXJpc3RpY3MgdG8gbWluaW1pemUgZWRnZSBjcm9zc2luZ3MgaW4gdGhlIGdyYXBoIGFuZCBzZXRzIHRoZSBiZXN0XG4gKiBvcmRlciBzb2x1dGlvbiBhcyBhbiBvcmRlciBhdHRyaWJ1dGUgb24gZWFjaCBub2RlLlxuICpcbiAqIFByZS1jb25kaXRpb25zOlxuICpcbiAqICAgIDEuIEdyYXBoIG11c3QgYmUgREFHXG4gKiAgICAyLiBHcmFwaCBub2RlcyBtdXN0IGJlIG9iamVjdHMgd2l0aCBhIFwicmFua1wiIGF0dHJpYnV0ZVxuICogICAgMy4gR3JhcGggZWRnZXMgbXVzdCBoYXZlIHRoZSBcIndlaWdodFwiIGF0dHJpYnV0ZVxuICpcbiAqIFBvc3QtY29uZGl0aW9uczpcbiAqXG4gKiAgICAxLiBHcmFwaCBub2RlcyB3aWxsIGhhdmUgYW4gXCJvcmRlclwiIGF0dHJpYnV0ZSBiYXNlZCBvbiB0aGUgcmVzdWx0cyBvZiB0aGVcbiAqICAgICAgIGFsZ29yaXRobS5cbiAqL1xuZnVuY3Rpb24gb3JkZXIoZykge1xuICB2YXIgbWF4UmFuayA9IHV0aWwubWF4UmFuayhnKSxcbiAgICBkb3duTGF5ZXJHcmFwaHMgPSBidWlsZExheWVyR3JhcGhzKGcsIF8ucmFuZ2UoMSwgbWF4UmFuayArIDEpLCAnaW5FZGdlcycpLFxuICAgIHVwTGF5ZXJHcmFwaHMgPSBidWlsZExheWVyR3JhcGhzKGcsIF8ucmFuZ2UobWF4UmFuayAtIDEsIC0xLCAtMSksICdvdXRFZGdlcycpO1xuXG4gIHZhciBsYXllcmluZyA9IGluaXRPcmRlcihnKTtcbiAgYXNzaWduT3JkZXIoZywgbGF5ZXJpbmcpO1xuXG4gIHZhciBiZXN0Q0MgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gICAgYmVzdDtcblxuICBmb3IgKHZhciBpID0gMCwgbGFzdEJlc3QgPSAwOyBsYXN0QmVzdCA8IDQ7ICsraSwgKytsYXN0QmVzdCkge1xuICAgIHN3ZWVwTGF5ZXJHcmFwaHMoaSAlIDIgPyBkb3duTGF5ZXJHcmFwaHMgOiB1cExheWVyR3JhcGhzLCBpICUgNCA+PSAyKTtcblxuICAgIGxheWVyaW5nID0gdXRpbC5idWlsZExheWVyTWF0cml4KGcpO1xuICAgIHZhciBjYyA9IGNyb3NzQ291bnQoZywgbGF5ZXJpbmcpO1xuICAgIGlmIChjYyA8IGJlc3RDQykge1xuICAgICAgbGFzdEJlc3QgPSAwO1xuICAgICAgYmVzdCA9IF8uY2xvbmVEZWVwKGxheWVyaW5nKTtcbiAgICAgIGJlc3RDQyA9IGNjO1xuICAgIH1cbiAgfVxuXG4gIGFzc2lnbk9yZGVyKGcsIGJlc3QpO1xufVxuXG5mdW5jdGlvbiBidWlsZExheWVyR3JhcGhzKGcsIHJhbmtzLCByZWxhdGlvbnNoaXApIHtcbiAgcmV0dXJuIF8ubWFwKHJhbmtzLCBmdW5jdGlvbiAocmFuaykge1xuICAgIHJldHVybiBidWlsZExheWVyR3JhcGgoZywgcmFuaywgcmVsYXRpb25zaGlwKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHN3ZWVwTGF5ZXJHcmFwaHMobGF5ZXJHcmFwaHMsIGJpYXNSaWdodCkge1xuICB2YXIgY2cgPSBuZXcgR3JhcGgoKTtcbiAgXy5mb3JFYWNoKGxheWVyR3JhcGhzLCBmdW5jdGlvbiAobGcpIHtcbiAgICB2YXIgcm9vdCA9IGxnLmdyYXBoKCkucm9vdDtcbiAgICB2YXIgc29ydGVkID0gc29ydFN1YmdyYXBoKGxnLCByb290LCBjZywgYmlhc1JpZ2h0KTtcbiAgICBfLmZvckVhY2goc29ydGVkLnZzLCBmdW5jdGlvbiAodiwgaSkge1xuICAgICAgbGcubm9kZSh2KS5vcmRlciA9IGk7XG4gICAgfSk7XG4gICAgYWRkU3ViZ3JhcGhDb25zdHJhaW50cyhsZywgY2csIHNvcnRlZC52cyk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhc3NpZ25PcmRlcihnLCBsYXllcmluZykge1xuICBfLmZvckVhY2gobGF5ZXJpbmcsIGZ1bmN0aW9uIChsYXllcikge1xuICAgIF8uZm9yRWFjaChsYXllciwgZnVuY3Rpb24gKHYsIGkpIHtcbiAgICAgIGcubm9kZSh2KS5vcmRlciA9IGk7XG4gICAgfSk7XG4gIH0pO1xufVxuIiwKICAgICJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaC1lcyc7XG5cbmV4cG9ydCB7IHBhcmVudER1bW15Q2hhaW5zIH07XG5cbmZ1bmN0aW9uIHBhcmVudER1bW15Q2hhaW5zKGcpIHtcbiAgdmFyIHBvc3RvcmRlck51bXMgPSBwb3N0b3JkZXIoZyk7XG5cbiAgXy5mb3JFYWNoKGcuZ3JhcGgoKS5kdW1teUNoYWlucywgZnVuY3Rpb24gKHYpIHtcbiAgICB2YXIgbm9kZSA9IGcubm9kZSh2KTtcbiAgICB2YXIgZWRnZU9iaiA9IG5vZGUuZWRnZU9iajtcbiAgICB2YXIgcGF0aERhdGEgPSBmaW5kUGF0aChnLCBwb3N0b3JkZXJOdW1zLCBlZGdlT2JqLnYsIGVkZ2VPYmoudyk7XG4gICAgdmFyIHBhdGggPSBwYXRoRGF0YS5wYXRoO1xuICAgIHZhciBsY2EgPSBwYXRoRGF0YS5sY2E7XG4gICAgdmFyIHBhdGhJZHggPSAwO1xuICAgIHZhciBwYXRoViA9IHBhdGhbcGF0aElkeF07XG4gICAgdmFyIGFzY2VuZGluZyA9IHRydWU7XG5cbiAgICB3aGlsZSAodiAhPT0gZWRnZU9iai53KSB7XG4gICAgICBub2RlID0gZy5ub2RlKHYpO1xuXG4gICAgICBpZiAoYXNjZW5kaW5nKSB7XG4gICAgICAgIHdoaWxlICgocGF0aFYgPSBwYXRoW3BhdGhJZHhdKSAhPT0gbGNhICYmIGcubm9kZShwYXRoVikubWF4UmFuayA8IG5vZGUucmFuaykge1xuICAgICAgICAgIHBhdGhJZHgrKztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXRoViA9PT0gbGNhKSB7XG4gICAgICAgICAgYXNjZW5kaW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCFhc2NlbmRpbmcpIHtcbiAgICAgICAgd2hpbGUgKFxuICAgICAgICAgIHBhdGhJZHggPCBwYXRoLmxlbmd0aCAtIDEgJiZcbiAgICAgICAgICBnLm5vZGUoKHBhdGhWID0gcGF0aFtwYXRoSWR4ICsgMV0pKS5taW5SYW5rIDw9IG5vZGUucmFua1xuICAgICAgICApIHtcbiAgICAgICAgICBwYXRoSWR4Kys7XG4gICAgICAgIH1cbiAgICAgICAgcGF0aFYgPSBwYXRoW3BhdGhJZHhdO1xuICAgICAgfVxuXG4gICAgICBnLnNldFBhcmVudCh2LCBwYXRoVik7XG4gICAgICB2ID0gZy5zdWNjZXNzb3JzKHYpWzBdO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIEZpbmQgYSBwYXRoIGZyb20gdiB0byB3IHRocm91Z2ggdGhlIGxvd2VzdCBjb21tb24gYW5jZXN0b3IgKExDQSkuIFJldHVybiB0aGVcbi8vIGZ1bGwgcGF0aCBhbmQgdGhlIExDQS5cbmZ1bmN0aW9uIGZpbmRQYXRoKGcsIHBvc3RvcmRlck51bXMsIHYsIHcpIHtcbiAgdmFyIHZQYXRoID0gW107XG4gIHZhciB3UGF0aCA9IFtdO1xuICB2YXIgbG93ID0gTWF0aC5taW4ocG9zdG9yZGVyTnVtc1t2XS5sb3csIHBvc3RvcmRlck51bXNbd10ubG93KTtcbiAgdmFyIGxpbSA9IE1hdGgubWF4KHBvc3RvcmRlck51bXNbdl0ubGltLCBwb3N0b3JkZXJOdW1zW3ddLmxpbSk7XG4gIHZhciBwYXJlbnQ7XG4gIHZhciBsY2E7XG5cbiAgLy8gVHJhdmVyc2UgdXAgZnJvbSB2IHRvIGZpbmQgdGhlIExDQVxuICBwYXJlbnQgPSB2O1xuICBkbyB7XG4gICAgcGFyZW50ID0gZy5wYXJlbnQocGFyZW50KTtcbiAgICB2UGF0aC5wdXNoKHBhcmVudCk7XG4gIH0gd2hpbGUgKHBhcmVudCAmJiAocG9zdG9yZGVyTnVtc1twYXJlbnRdLmxvdyA+IGxvdyB8fCBsaW0gPiBwb3N0b3JkZXJOdW1zW3BhcmVudF0ubGltKSk7XG4gIGxjYSA9IHBhcmVudDtcblxuICAvLyBUcmF2ZXJzZSBmcm9tIHcgdG8gTENBXG4gIHBhcmVudCA9IHc7XG4gIHdoaWxlICgocGFyZW50ID0gZy5wYXJlbnQocGFyZW50KSkgIT09IGxjYSkge1xuICAgIHdQYXRoLnB1c2gocGFyZW50KTtcbiAgfVxuXG4gIHJldHVybiB7IHBhdGg6IHZQYXRoLmNvbmNhdCh3UGF0aC5yZXZlcnNlKCkpLCBsY2E6IGxjYSB9O1xufVxuXG5mdW5jdGlvbiBwb3N0b3JkZXIoZykge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIHZhciBsaW0gPSAwO1xuXG4gIGZ1bmN0aW9uIGRmcyh2KSB7XG4gICAgdmFyIGxvdyA9IGxpbTtcbiAgICBfLmZvckVhY2goZy5jaGlsZHJlbih2KSwgZGZzKTtcbiAgICByZXN1bHRbdl0gPSB7IGxvdzogbG93LCBsaW06IGxpbSsrIH07XG4gIH1cbiAgXy5mb3JFYWNoKGcuY2hpbGRyZW4oKSwgZGZzKTtcblxuICByZXR1cm4gcmVzdWx0O1xufVxuIiwKICAgICJpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaC1lcyc7XG5pbXBvcnQgeyBHcmFwaCB9IGZyb20gJy4uLy4uL2dyYXBobGliL2luZGV4LmpzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi4vdXRpbC5qcyc7XG5cbi8qXG4gKiBUaGlzIG1vZHVsZSBwcm92aWRlcyBjb29yZGluYXRlIGFzc2lnbm1lbnQgYmFzZWQgb24gQnJhbmRlcyBhbmQgS8O2cGYsIFwiRmFzdFxuICogYW5kIFNpbXBsZSBIb3Jpem9udGFsIENvb3JkaW5hdGUgQXNzaWdubWVudC5cIlxuICovXG5cbmV4cG9ydCB7XG4gIHBvc2l0aW9uWCxcbiAgZmluZFR5cGUxQ29uZmxpY3RzLFxuICBmaW5kVHlwZTJDb25mbGljdHMsXG4gIGFkZENvbmZsaWN0LFxuICBoYXNDb25mbGljdCxcbiAgdmVydGljYWxBbGlnbm1lbnQsXG4gIGhvcml6b250YWxDb21wYWN0aW9uLFxuICBhbGlnbkNvb3JkaW5hdGVzLFxuICBmaW5kU21hbGxlc3RXaWR0aEFsaWdubWVudCxcbiAgYmFsYW5jZSxcbn07XG5cbi8qXG4gKiBNYXJrcyBhbGwgZWRnZXMgaW4gdGhlIGdyYXBoIHdpdGggYSB0eXBlLTEgY29uZmxpY3Qgd2l0aCB0aGUgXCJ0eXBlMUNvbmZsaWN0XCJcbiAqIHByb3BlcnR5LiBBIHR5cGUtMSBjb25mbGljdCBpcyBvbmUgd2hlcmUgYSBub24taW5uZXIgc2VnbWVudCBjcm9zc2VzIGFuXG4gKiBpbm5lciBzZWdtZW50LiBBbiBpbm5lciBzZWdtZW50IGlzIGFuIGVkZ2Ugd2l0aCBib3RoIGluY2lkZW50IG5vZGVzIG1hcmtlZFxuICogd2l0aCB0aGUgXCJkdW1teVwiIHByb3BlcnR5LlxuICpcbiAqIFRoaXMgYWxnb3JpdGhtIHNjYW5zIGxheWVyIGJ5IGxheWVyLCBzdGFydGluZyB3aXRoIHRoZSBzZWNvbmQsIGZvciB0eXBlLTFcbiAqIGNvbmZsaWN0cyBiZXR3ZWVuIHRoZSBjdXJyZW50IGxheWVyIGFuZCB0aGUgcHJldmlvdXMgbGF5ZXIuIEZvciBlYWNoIGxheWVyXG4gKiBpdCBzY2FucyB0aGUgbm9kZXMgZnJvbSBsZWZ0IHRvIHJpZ2h0IHVudGlsIGl0IHJlYWNoZXMgb25lIHRoYXQgaXMgaW5jaWRlbnRcbiAqIG9uIGFuIGlubmVyIHNlZ21lbnQuIEl0IHRoZW4gc2NhbnMgcHJlZGVjZXNzb3JzIHRvIGRldGVybWluZSBpZiB0aGV5IGhhdmVcbiAqIGVkZ2VzIHRoYXQgY3Jvc3MgdGhhdCBpbm5lciBzZWdtZW50LiBBdCB0aGUgZW5kIGEgZmluYWwgc2NhbiBpcyBkb25lIGZvciBhbGxcbiAqIG5vZGVzIG9uIHRoZSBjdXJyZW50IHJhbmsgdG8gc2VlIGlmIHRoZXkgY3Jvc3MgdGhlIGxhc3QgdmlzaXRlZCBpbm5lclxuICogc2VnbWVudC5cbiAqXG4gKiBUaGlzIGFsZ29yaXRobSAoc2FmZWx5KSBhc3N1bWVzIHRoYXQgYSBkdW1teSBub2RlIHdpbGwgb25seSBiZSBpbmNpZGVudCBvbiBhXG4gKiBzaW5nbGUgbm9kZSBpbiB0aGUgbGF5ZXJzIGJlaW5nIHNjYW5uZWQuXG4gKi9cbmZ1bmN0aW9uIGZpbmRUeXBlMUNvbmZsaWN0cyhnLCBsYXllcmluZykge1xuICAvKiogQHR5cGUge3tbbm9kZUlkOiBzdHJpbmcgfCBudW1iZXJdOiB7W25vZGVJZDogc3RyaW5nIHwgbnVtYmVyXTogdHJ1ZX19fSAqL1xuICB2YXIgY29uZmxpY3RzID0ge307XG5cbiAgZnVuY3Rpb24gdmlzaXRMYXllcihwcmV2TGF5ZXIsIGxheWVyKSB7XG4gICAgdmFyIC8vIGxhc3QgdmlzaXRlZCBub2RlIGluIHRoZSBwcmV2aW91cyBsYXllciB0aGF0IGlzIGluY2lkZW50IG9uIGFuIGlubmVyXG4gICAgICAvLyBzZWdtZW50LlxuICAgICAgazAgPSAwLFxuICAgICAgLy8gVHJhY2tzIHRoZSBsYXN0IG5vZGUgaW4gdGhpcyBsYXllciBzY2FubmVkIGZvciBjcm9zc2luZ3Mgd2l0aCBhIHR5cGUtMVxuICAgICAgLy8gc2VnbWVudC5cbiAgICAgIHNjYW5Qb3MgPSAwLFxuICAgICAgcHJldkxheWVyTGVuZ3RoID0gcHJldkxheWVyLmxlbmd0aCxcbiAgICAgIGxhc3ROb2RlID0gXy5sYXN0KGxheWVyKTtcblxuICAgIF8uZm9yRWFjaChsYXllciwgZnVuY3Rpb24gKHYsIGkpIHtcbiAgICAgIHZhciB3ID0gZmluZE90aGVySW5uZXJTZWdtZW50Tm9kZShnLCB2KSxcbiAgICAgICAgazEgPSB3ID8gZy5ub2RlKHcpLm9yZGVyIDogcHJldkxheWVyTGVuZ3RoO1xuXG4gICAgICBpZiAodyB8fCB2ID09PSBsYXN0Tm9kZSkge1xuICAgICAgICBfLmZvckVhY2gobGF5ZXIuc2xpY2Uoc2NhblBvcywgaSArIDEpLCBmdW5jdGlvbiAoc2Nhbk5vZGUpIHtcbiAgICAgICAgICBfLmZvckVhY2goZy5wcmVkZWNlc3NvcnMoc2Nhbk5vZGUpLCBmdW5jdGlvbiAodSkge1xuICAgICAgICAgICAgdmFyIHVMYWJlbCA9IGcubm9kZSh1KSxcbiAgICAgICAgICAgICAgdVBvcyA9IHVMYWJlbC5vcmRlcjtcbiAgICAgICAgICAgIGlmICgodVBvcyA8IGswIHx8IGsxIDwgdVBvcykgJiYgISh1TGFiZWwuZHVtbXkgJiYgZy5ub2RlKHNjYW5Ob2RlKS5kdW1teSkpIHtcbiAgICAgICAgICAgICAgYWRkQ29uZmxpY3QoY29uZmxpY3RzLCB1LCBzY2FuTm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yXG4gICAgICAgIHNjYW5Qb3MgPSBpICsgMTtcbiAgICAgICAgazAgPSBrMTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBsYXllcjtcbiAgfVxuXG4gIF8ucmVkdWNlKGxheWVyaW5nLCB2aXNpdExheWVyKTtcbiAgcmV0dXJuIGNvbmZsaWN0cztcbn1cblxuZnVuY3Rpb24gZmluZFR5cGUyQ29uZmxpY3RzKGcsIGxheWVyaW5nKSB7XG4gIC8qKiBAdHlwZSB7e1tub2RlSWQ6IHN0cmluZyB8IG51bWJlcl06IHtbbm9kZUlkOiBzdHJpbmcgfCBudW1iZXJdOiB0cnVlfX19ICovXG4gIHZhciBjb25mbGljdHMgPSB7fTtcblxuICBmdW5jdGlvbiBzY2FuKHNvdXRoLCBzb3V0aFBvcywgc291dGhFbmQsIHByZXZOb3J0aEJvcmRlciwgbmV4dE5vcnRoQm9yZGVyKSB7XG4gICAgdmFyIHY7XG4gICAgXy5mb3JFYWNoKF8ucmFuZ2Uoc291dGhQb3MsIHNvdXRoRW5kKSwgZnVuY3Rpb24gKGkpIHtcbiAgICAgIHYgPSBzb3V0aFtpXTtcbiAgICAgIGlmIChnLm5vZGUodikuZHVtbXkpIHtcbiAgICAgICAgXy5mb3JFYWNoKGcucHJlZGVjZXNzb3JzKHYpLCBmdW5jdGlvbiAodSkge1xuICAgICAgICAgIHZhciB1Tm9kZSA9IGcubm9kZSh1KTtcbiAgICAgICAgICBpZiAodU5vZGUuZHVtbXkgJiYgKHVOb2RlLm9yZGVyIDwgcHJldk5vcnRoQm9yZGVyIHx8IHVOb2RlLm9yZGVyID4gbmV4dE5vcnRoQm9yZGVyKSkge1xuICAgICAgICAgICAgYWRkQ29uZmxpY3QoY29uZmxpY3RzLCB1LCB2KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gdmlzaXRMYXllcihub3J0aCwgc291dGgpIHtcbiAgICB2YXIgcHJldk5vcnRoUG9zID0gLTEsXG4gICAgICBuZXh0Tm9ydGhQb3MsXG4gICAgICBzb3V0aFBvcyA9IDA7XG5cbiAgICBfLmZvckVhY2goc291dGgsIGZ1bmN0aW9uICh2LCBzb3V0aExvb2thaGVhZCkge1xuICAgICAgaWYgKGcubm9kZSh2KS5kdW1teSA9PT0gJ2JvcmRlcicpIHtcbiAgICAgICAgdmFyIHByZWRlY2Vzc29ycyA9IGcucHJlZGVjZXNzb3JzKHYpO1xuICAgICAgICBpZiAocHJlZGVjZXNzb3JzLmxlbmd0aCkge1xuICAgICAgICAgIG5leHROb3J0aFBvcyA9IGcubm9kZShwcmVkZWNlc3NvcnNbMF0pLm9yZGVyO1xuICAgICAgICAgIHNjYW4oc291dGgsIHNvdXRoUG9zLCBzb3V0aExvb2thaGVhZCwgcHJldk5vcnRoUG9zLCBuZXh0Tm9ydGhQb3MpO1xuICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgICAgICBzb3V0aFBvcyA9IHNvdXRoTG9va2FoZWFkO1xuICAgICAgICAgIHByZXZOb3J0aFBvcyA9IG5leHROb3J0aFBvcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2Nhbihzb3V0aCwgc291dGhQb3MsIHNvdXRoLmxlbmd0aCwgbmV4dE5vcnRoUG9zLCBub3J0aC5sZW5ndGgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHNvdXRoO1xuICB9XG5cbiAgXy5yZWR1Y2UobGF5ZXJpbmcsIHZpc2l0TGF5ZXIpO1xuICByZXR1cm4gY29uZmxpY3RzO1xufVxuXG5mdW5jdGlvbiBmaW5kT3RoZXJJbm5lclNlZ21lbnROb2RlKGcsIHYpIHtcbiAgaWYgKGcubm9kZSh2KS5kdW1teSkge1xuICAgIHJldHVybiBfLmZpbmQoZy5wcmVkZWNlc3NvcnModiksIGZ1bmN0aW9uICh1KSB7XG4gICAgICByZXR1cm4gZy5ub2RlKHUpLmR1bW15O1xuICAgIH0pO1xuICB9XG59XG5cbi8qKlxuICogU2V0cyBgY29uZmxpY3RzW3ZdW3ddID0gdHJ1ZWAsIGNyZWF0aW5nIG9iamVjdHMgaWYgbmVlZGVkLlxuICpcbiAqIEBwYXJhbSB7e1tub2RlSWQ6IHN0cmluZyB8IG51bWJlcl06IHtbbm9kZUlkOiBzdHJpbmcgfCBudW1iZXJdOiB0cnVlfX19IGNvbmZsaWN0cyAtIE9iamVjdCB0byBzZXQuXG4gKiBAcGFyYW0ge3N0cmluZyB8IG51bWJlcn0gdiAtIEZpcnN0IE5vZGUgSURcbiAqIEBwYXJhbSB7c3RyaW5nIHwgbnVtYmVyfSB3IC0gU2Vjb25kIE5vZGUgSURcbiAqL1xuZnVuY3Rpb24gYWRkQ29uZmxpY3QoY29uZmxpY3RzLCB2LCB3KSB7XG4gIGlmICh2ID4gdykge1xuICAgIHZhciB0bXAgPSB2O1xuICAgIHYgPSB3O1xuICAgIHcgPSB0bXA7XG4gIH1cblxuICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChjb25mbGljdHMsIHYpKSB7XG4gICAgLy8gY2FuJ3QgdXNlIGNvbmZsaWN0c1t2XSA9IHt9IHNpbmNlIGl0J3MgdW5zYWZlIGlmIHYgPSBgX19wcm90b19fYFxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjb25mbGljdHMsIHYsIHtcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB2YWx1ZToge30sXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB9KTtcbiAgfVxuICB2YXIgY29uZmxpY3RzViA9IGNvbmZsaWN0c1t2XTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvbmZsaWN0c1YsIHcsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICB2YWx1ZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGhhc0NvbmZsaWN0KGNvbmZsaWN0cywgdiwgdykge1xuICBpZiAodiA+IHcpIHtcbiAgICB2YXIgdG1wID0gdjtcbiAgICB2ID0gdztcbiAgICB3ID0gdG1wO1xuICB9XG4gIHJldHVybiAhIWNvbmZsaWN0c1t2XSAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoY29uZmxpY3RzW3ZdLCB3KTtcbn1cblxuLypcbiAqIFRyeSB0byBhbGlnbiBub2RlcyBpbnRvIHZlcnRpY2FsIFwiYmxvY2tzXCIgd2hlcmUgcG9zc2libGUuIFRoaXMgYWxnb3JpdGhtXG4gKiBhdHRlbXB0cyB0byBhbGlnbiBhIG5vZGUgd2l0aCBvbmUgb2YgaXRzIG1lZGlhbiBuZWlnaGJvcnMuIElmIHRoZSBlZGdlXG4gKiBjb25uZWN0aW5nIGEgbmVpZ2hib3IgaXMgYSB0eXBlLTEgY29uZmxpY3QgdGhlbiB3ZSBpZ25vcmUgdGhhdCBwb3NzaWJpbGl0eS5cbiAqIElmIGEgcHJldmlvdXMgbm9kZSBoYXMgYWxyZWFkeSBmb3JtZWQgYSBibG9jayB3aXRoIGEgbm9kZSBhZnRlciB0aGUgbm9kZVxuICogd2UncmUgdHJ5aW5nIHRvIGZvcm0gYSBibG9jayB3aXRoLCB3ZSBhbHNvIGlnbm9yZSB0aGF0IHBvc3NpYmlsaXR5IC0gb3VyXG4gKiBibG9ja3Mgd291bGQgYmUgc3BsaXQgaW4gdGhhdCBzY2VuYXJpby5cbiAqL1xuZnVuY3Rpb24gdmVydGljYWxBbGlnbm1lbnQoZywgbGF5ZXJpbmcsIGNvbmZsaWN0cywgbmVpZ2hib3JGbikge1xuICB2YXIgcm9vdCA9IHt9LFxuICAgIGFsaWduID0ge30sXG4gICAgcG9zID0ge307XG5cbiAgLy8gV2UgY2FjaGUgdGhlIHBvc2l0aW9uIGhlcmUgYmFzZWQgb24gdGhlIGxheWVyaW5nIGJlY2F1c2UgdGhlIGdyYXBoIGFuZFxuICAvLyBsYXllcmluZyBtYXkgYmUgb3V0IG9mIHN5bmMuIFRoZSBsYXllcmluZyBtYXRyaXggaXMgbWFuaXB1bGF0ZWQgdG9cbiAgLy8gZ2VuZXJhdGUgZGlmZmVyZW50IGV4dHJlbWUgYWxpZ25tZW50cy5cbiAgXy5mb3JFYWNoKGxheWVyaW5nLCBmdW5jdGlvbiAobGF5ZXIpIHtcbiAgICBfLmZvckVhY2gobGF5ZXIsIGZ1bmN0aW9uICh2LCBvcmRlcikge1xuICAgICAgcm9vdFt2XSA9IHY7XG4gICAgICBhbGlnblt2XSA9IHY7XG4gICAgICBwb3Nbdl0gPSBvcmRlcjtcbiAgICB9KTtcbiAgfSk7XG5cbiAgXy5mb3JFYWNoKGxheWVyaW5nLCBmdW5jdGlvbiAobGF5ZXIpIHtcbiAgICB2YXIgcHJldklkeCA9IC0xO1xuICAgIF8uZm9yRWFjaChsYXllciwgZnVuY3Rpb24gKHYpIHtcbiAgICAgIHZhciB3cyA9IG5laWdoYm9yRm4odik7XG4gICAgICBpZiAod3MubGVuZ3RoKSB7XG4gICAgICAgIHdzID0gXy5zb3J0Qnkod3MsIGZ1bmN0aW9uICh3KSB7XG4gICAgICAgICAgcmV0dXJuIHBvc1t3XTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBtcCA9ICh3cy5sZW5ndGggLSAxKSAvIDI7XG4gICAgICAgIGZvciAodmFyIGkgPSBNYXRoLmZsb29yKG1wKSwgaWwgPSBNYXRoLmNlaWwobXApOyBpIDw9IGlsOyArK2kpIHtcbiAgICAgICAgICB2YXIgdyA9IHdzW2ldO1xuICAgICAgICAgIGlmIChhbGlnblt2XSA9PT0gdiAmJiBwcmV2SWR4IDwgcG9zW3ddICYmICFoYXNDb25mbGljdChjb25mbGljdHMsIHYsIHcpKSB7XG4gICAgICAgICAgICBhbGlnblt3XSA9IHY7XG4gICAgICAgICAgICBhbGlnblt2XSA9IHJvb3Rbdl0gPSByb290W3ddO1xuICAgICAgICAgICAgcHJldklkeCA9IHBvc1t3XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIHsgcm9vdDogcm9vdCwgYWxpZ246IGFsaWduIH07XG59XG5cbmZ1bmN0aW9uIGhvcml6b250YWxDb21wYWN0aW9uKGcsIGxheWVyaW5nLCByb290LCBhbGlnbiwgcmV2ZXJzZVNlcCkge1xuICAvLyBUaGlzIHBvcnRpb24gb2YgdGhlIGFsZ29yaXRobSBkaWZmZXJzIGZyb20gQksgZHVlIHRvIGEgbnVtYmVyIG9mIHByb2JsZW1zLlxuICAvLyBJbnN0ZWFkIG9mIHRoZWlyIGFsZ29yaXRobSB3ZSBjb25zdHJ1Y3QgYSBuZXcgYmxvY2sgZ3JhcGggYW5kIGRvIHR3b1xuICAvLyBzd2VlcHMuIFRoZSBmaXJzdCBzd2VlcCBwbGFjZXMgYmxvY2tzIHdpdGggdGhlIHNtYWxsZXN0IHBvc3NpYmxlXG4gIC8vIGNvb3JkaW5hdGVzLiBUaGUgc2Vjb25kIHN3ZWVwIHJlbW92ZXMgdW51c2VkIHNwYWNlIGJ5IG1vdmluZyBibG9ja3MgdG8gdGhlXG4gIC8vIGdyZWF0ZXN0IGNvb3JkaW5hdGVzIHdpdGhvdXQgdmlvbGF0aW5nIHNlcGFyYXRpb24uXG4gIC8qKiBAdHlwZSB7UmVjb3JkPGltcG9ydCgnLi4vLi4vZ3JhcGhsaWIvZ3JhcGguanMnKS5Ob2RlSUQsIG51bWJlcj59ICovXG4gIHZhciB4cyA9IHt9LFxuICAgIGJsb2NrRyA9IGJ1aWxkQmxvY2tHcmFwaChnLCBsYXllcmluZywgcm9vdCwgcmV2ZXJzZVNlcCksXG4gICAgYm9yZGVyVHlwZSA9IHJldmVyc2VTZXAgPyAnYm9yZGVyTGVmdCcgOiAnYm9yZGVyUmlnaHQnO1xuXG4gIGZ1bmN0aW9uIGl0ZXJhdGUoc2V0WHNGdW5jLCBuZXh0Tm9kZXNGdW5jKSB7XG4gICAgdmFyIHN0YWNrID0gYmxvY2tHLm5vZGVzKCk7XG4gICAgdmFyIGVsZW0gPSBzdGFjay5wb3AoKTtcbiAgICB2YXIgdmlzaXRlZCA9IHt9O1xuICAgIHdoaWxlIChlbGVtKSB7XG4gICAgICBpZiAodmlzaXRlZFtlbGVtXSkge1xuICAgICAgICBzZXRYc0Z1bmMoZWxlbSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2aXNpdGVkW2VsZW1dID0gdHJ1ZTtcbiAgICAgICAgc3RhY2sucHVzaChlbGVtKTtcbiAgICAgICAgc3RhY2sgPSBzdGFjay5jb25jYXQobmV4dE5vZGVzRnVuYyhlbGVtKSk7XG4gICAgICB9XG5cbiAgICAgIGVsZW0gPSBzdGFjay5wb3AoKTtcbiAgICB9XG4gIH1cblxuICAvLyBGaXJzdCBwYXNzLCBhc3NpZ24gc21hbGxlc3QgY29vcmRpbmF0ZXNcbiAgZnVuY3Rpb24gcGFzczEoZWxlbSkge1xuICAgIHhzW2VsZW1dID0gYmxvY2tHLmluRWRnZXMoZWxlbSkucmVkdWNlKGZ1bmN0aW9uIChhY2MsIGUpIHtcbiAgICAgIHJldHVybiBNYXRoLm1heChhY2MsIHhzW2Uudl0gKyBibG9ja0cuZWRnZShlKSk7XG4gICAgfSwgMCk7XG4gIH1cblxuICAvLyBTZWNvbmQgcGFzcywgYXNzaWduIGdyZWF0ZXN0IGNvb3JkaW5hdGVzXG4gIGZ1bmN0aW9uIHBhc3MyKGVsZW0pIHtcbiAgICB2YXIgbWluID0gYmxvY2tHLm91dEVkZ2VzKGVsZW0pLnJlZHVjZShmdW5jdGlvbiAoYWNjLCBlKSB7XG4gICAgICByZXR1cm4gTWF0aC5taW4oYWNjLCB4c1tlLnddIC0gYmxvY2tHLmVkZ2UoZSkpO1xuICAgIH0sIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSk7XG5cbiAgICB2YXIgbm9kZSA9IGcubm9kZShlbGVtKTtcbiAgICBpZiAobWluICE9PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgJiYgbm9kZS5ib3JkZXJUeXBlICE9PSBib3JkZXJUeXBlKSB7XG4gICAgICB4c1tlbGVtXSA9IE1hdGgubWF4KHhzW2VsZW1dLCBtaW4pO1xuICAgIH1cbiAgfVxuXG4gIGl0ZXJhdGUocGFzczEsIGJsb2NrRy5wcmVkZWNlc3NvcnMuYmluZChibG9ja0cpKTtcbiAgaXRlcmF0ZShwYXNzMiwgYmxvY2tHLnN1Y2Nlc3NvcnMuYmluZChibG9ja0cpKTtcblxuICAvLyBBc3NpZ24geCBjb29yZGluYXRlcyB0byBhbGwgbm9kZXNcbiAgXy5mb3JFYWNoKGFsaWduLCBmdW5jdGlvbiAodikge1xuICAgIHhzW3ZdID0geHNbcm9vdFt2XV07XG4gIH0pO1xuXG4gIHJldHVybiB4cztcbn1cblxuZnVuY3Rpb24gYnVpbGRCbG9ja0dyYXBoKGcsIGxheWVyaW5nLCByb290LCByZXZlcnNlU2VwKSB7XG4gIHZhciBibG9ja0dyYXBoID0gbmV3IEdyYXBoKCksXG4gICAgZ3JhcGhMYWJlbCA9IGcuZ3JhcGgoKSxcbiAgICBzZXBGbiA9IHNlcChncmFwaExhYmVsLm5vZGVzZXAsIGdyYXBoTGFiZWwuZWRnZXNlcCwgcmV2ZXJzZVNlcCk7XG5cbiAgXy5mb3JFYWNoKGxheWVyaW5nLCBmdW5jdGlvbiAobGF5ZXIpIHtcbiAgICB2YXIgdTtcbiAgICBfLmZvckVhY2gobGF5ZXIsIGZ1bmN0aW9uICh2KSB7XG4gICAgICB2YXIgdlJvb3QgPSByb290W3ZdO1xuICAgICAgYmxvY2tHcmFwaC5zZXROb2RlKHZSb290KTtcbiAgICAgIGlmICh1KSB7XG4gICAgICAgIHZhciB1Um9vdCA9IHJvb3RbdV0sXG4gICAgICAgICAgcHJldk1heCA9IGJsb2NrR3JhcGguZWRnZSh1Um9vdCwgdlJvb3QpO1xuICAgICAgICBibG9ja0dyYXBoLnNldEVkZ2UodVJvb3QsIHZSb290LCBNYXRoLm1heChzZXBGbihnLCB2LCB1KSwgcHJldk1heCB8fCAwKSk7XG4gICAgICB9XG4gICAgICB1ID0gdjtcbiAgICB9KTtcbiAgfSk7XG5cbiAgcmV0dXJuIGJsb2NrR3JhcGg7XG59XG5cbi8qXG4gKiBSZXR1cm5zIHRoZSBhbGlnbm1lbnQgdGhhdCBoYXMgdGhlIHNtYWxsZXN0IHdpZHRoIG9mIHRoZSBnaXZlbiBhbGlnbm1lbnRzLlxuICovXG5mdW5jdGlvbiBmaW5kU21hbGxlc3RXaWR0aEFsaWdubWVudChnLCB4c3MpIHtcbiAgcmV0dXJuIF8ubWluQnkoXy52YWx1ZXMoeHNzKSwgZnVuY3Rpb24gKHhzKSB7XG4gICAgdmFyIG1heCA9IE51bWJlci5ORUdBVElWRV9JTkZJTklUWTtcbiAgICB2YXIgbWluID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuXG4gICAgXy5mb3JJbih4cywgZnVuY3Rpb24gKHgsIHYpIHtcbiAgICAgIHZhciBoYWxmV2lkdGggPSB3aWR0aChnLCB2KSAvIDI7XG5cbiAgICAgIG1heCA9IE1hdGgubWF4KHggKyBoYWxmV2lkdGgsIG1heCk7XG4gICAgICBtaW4gPSBNYXRoLm1pbih4IC0gaGFsZldpZHRoLCBtaW4pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG1heCAtIG1pbjtcbiAgfSk7XG59XG5cbi8qXG4gKiBBbGlnbiB0aGUgY29vcmRpbmF0ZXMgb2YgZWFjaCBvZiB0aGUgbGF5b3V0IGFsaWdubWVudHMgc3VjaCB0aGF0XG4gKiBsZWZ0LWJpYXNlZCBhbGlnbm1lbnRzIGhhdmUgdGhlaXIgbWluaW11bSBjb29yZGluYXRlIGF0IHRoZSBzYW1lIHBvaW50IGFzXG4gKiB0aGUgbWluaW11bSBjb29yZGluYXRlIG9mIHRoZSBzbWFsbGVzdCB3aWR0aCBhbGlnbm1lbnQgYW5kIHJpZ2h0LWJpYXNlZFxuICogYWxpZ25tZW50cyBoYXZlIHRoZWlyIG1heGltdW0gY29vcmRpbmF0ZSBhdCB0aGUgc2FtZSBwb2ludCBhcyB0aGUgbWF4aW11bVxuICogY29vcmRpbmF0ZSBvZiB0aGUgc21hbGxlc3Qgd2lkdGggYWxpZ25tZW50LlxuICovXG5mdW5jdGlvbiBhbGlnbkNvb3JkaW5hdGVzKHhzcywgYWxpZ25Ubykge1xuICB2YXIgYWxpZ25Ub1ZhbHMgPSBfLnZhbHVlcyhhbGlnblRvKSxcbiAgICBhbGlnblRvTWluID0gXy5taW4oYWxpZ25Ub1ZhbHMpLFxuICAgIGFsaWduVG9NYXggPSBfLm1heChhbGlnblRvVmFscyk7XG5cbiAgXy5mb3JFYWNoKFsndScsICdkJ10sIGZ1bmN0aW9uICh2ZXJ0KSB7XG4gICAgXy5mb3JFYWNoKFsnbCcsICdyJ10sIGZ1bmN0aW9uIChob3Jpeikge1xuICAgICAgdmFyIGFsaWdubWVudCA9IHZlcnQgKyBob3JpeixcbiAgICAgICAgeHMgPSB4c3NbYWxpZ25tZW50XSxcbiAgICAgICAgZGVsdGE7XG4gICAgICBpZiAoeHMgPT09IGFsaWduVG8pIHJldHVybjtcblxuICAgICAgdmFyIHhzVmFscyA9IF8udmFsdWVzKHhzKTtcbiAgICAgIGRlbHRhID0gaG9yaXogPT09ICdsJyA/IGFsaWduVG9NaW4gLSBfLm1pbih4c1ZhbHMpIDogYWxpZ25Ub01heCAtIF8ubWF4KHhzVmFscyk7XG5cbiAgICAgIGlmIChkZWx0YSkge1xuICAgICAgICB4c3NbYWxpZ25tZW50XSA9IF8ubWFwVmFsdWVzKHhzLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgIHJldHVybiB4ICsgZGVsdGE7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gYmFsYW5jZSh4c3MsIGFsaWduKSB7XG4gIHJldHVybiBfLm1hcFZhbHVlcyh4c3MudWwsIGZ1bmN0aW9uIChpZ25vcmUsIHYpIHtcbiAgICBpZiAoYWxpZ24pIHtcbiAgICAgIHJldHVybiB4c3NbYWxpZ24udG9Mb3dlckNhc2UoKV1bdl07XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB4cyA9IF8uc29ydEJ5KF8ubWFwKHhzcywgdikpO1xuICAgICAgcmV0dXJuICh4c1sxXSArIHhzWzJdKSAvIDI7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gcG9zaXRpb25YKGcpIHtcbiAgdmFyIGxheWVyaW5nID0gdXRpbC5idWlsZExheWVyTWF0cml4KGcpO1xuICB2YXIgY29uZmxpY3RzID0gXy5tZXJnZShmaW5kVHlwZTFDb25mbGljdHMoZywgbGF5ZXJpbmcpLCBmaW5kVHlwZTJDb25mbGljdHMoZywgbGF5ZXJpbmcpKTtcblxuICB2YXIgeHNzID0ge307XG4gIHZhciBhZGp1c3RlZExheWVyaW5nO1xuICBfLmZvckVhY2goWyd1JywgJ2QnXSwgZnVuY3Rpb24gKHZlcnQpIHtcbiAgICBhZGp1c3RlZExheWVyaW5nID0gdmVydCA9PT0gJ3UnID8gbGF5ZXJpbmcgOiBfLnZhbHVlcyhsYXllcmluZykucmV2ZXJzZSgpO1xuICAgIF8uZm9yRWFjaChbJ2wnLCAnciddLCBmdW5jdGlvbiAoaG9yaXopIHtcbiAgICAgIGlmIChob3JpeiA9PT0gJ3InKSB7XG4gICAgICAgIGFkanVzdGVkTGF5ZXJpbmcgPSBfLm1hcChhZGp1c3RlZExheWVyaW5nLCBmdW5jdGlvbiAoaW5uZXIpIHtcbiAgICAgICAgICByZXR1cm4gXy52YWx1ZXMoaW5uZXIpLnJldmVyc2UoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBuZWlnaGJvckZuID0gKHZlcnQgPT09ICd1JyA/IGcucHJlZGVjZXNzb3JzIDogZy5zdWNjZXNzb3JzKS5iaW5kKGcpO1xuICAgICAgdmFyIGFsaWduID0gdmVydGljYWxBbGlnbm1lbnQoZywgYWRqdXN0ZWRMYXllcmluZywgY29uZmxpY3RzLCBuZWlnaGJvckZuKTtcbiAgICAgIHZhciB4cyA9IGhvcml6b250YWxDb21wYWN0aW9uKGcsIGFkanVzdGVkTGF5ZXJpbmcsIGFsaWduLnJvb3QsIGFsaWduLmFsaWduLCBob3JpeiA9PT0gJ3InKTtcbiAgICAgIGlmIChob3JpeiA9PT0gJ3InKSB7XG4gICAgICAgIHhzID0gXy5tYXBWYWx1ZXMoeHMsIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgcmV0dXJuIC14O1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHhzc1t2ZXJ0ICsgaG9yaXpdID0geHM7XG4gICAgfSk7XG4gIH0pO1xuXG4gIHZhciBzbWFsbGVzdFdpZHRoID0gZmluZFNtYWxsZXN0V2lkdGhBbGlnbm1lbnQoZywgeHNzKTtcbiAgYWxpZ25Db29yZGluYXRlcyh4c3MsIHNtYWxsZXN0V2lkdGgpO1xuICByZXR1cm4gYmFsYW5jZSh4c3MsIGcuZ3JhcGgoKS5hbGlnbik7XG59XG5cbmZ1bmN0aW9uIHNlcChub2RlU2VwLCBlZGdlU2VwLCByZXZlcnNlU2VwKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoZywgdiwgdykge1xuICAgIHZhciB2TGFiZWwgPSBnLm5vZGUodik7XG4gICAgdmFyIHdMYWJlbCA9IGcubm9kZSh3KTtcbiAgICB2YXIgc3VtID0gMDtcbiAgICB2YXIgZGVsdGE7XG5cbiAgICBzdW0gKz0gdkxhYmVsLndpZHRoIC8gMjtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHZMYWJlbCwgJ2xhYmVscG9zJykpIHtcbiAgICAgIHN3aXRjaCAodkxhYmVsLmxhYmVscG9zLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgY2FzZSAnbCc6XG4gICAgICAgICAgZGVsdGEgPSAtdkxhYmVsLndpZHRoIC8gMjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncic6XG4gICAgICAgICAgZGVsdGEgPSB2TGFiZWwud2lkdGggLyAyO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZGVsdGEpIHtcbiAgICAgIHN1bSArPSByZXZlcnNlU2VwID8gZGVsdGEgOiAtZGVsdGE7XG4gICAgfVxuICAgIGRlbHRhID0gMDtcblxuICAgIHN1bSArPSAodkxhYmVsLmR1bW15ID8gZWRnZVNlcCA6IG5vZGVTZXApIC8gMjtcbiAgICBzdW0gKz0gKHdMYWJlbC5kdW1teSA/IGVkZ2VTZXAgOiBub2RlU2VwKSAvIDI7XG5cbiAgICBzdW0gKz0gd0xhYmVsLndpZHRoIC8gMjtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHdMYWJlbCwgJ2xhYmVscG9zJykpIHtcbiAgICAgIHN3aXRjaCAod0xhYmVsLmxhYmVscG9zLnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgICAgY2FzZSAnbCc6XG4gICAgICAgICAgZGVsdGEgPSB3TGFiZWwud2lkdGggLyAyO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdyJzpcbiAgICAgICAgICBkZWx0YSA9IC13TGFiZWwud2lkdGggLyAyO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZGVsdGEpIHtcbiAgICAgIHN1bSArPSByZXZlcnNlU2VwID8gZGVsdGEgOiAtZGVsdGE7XG4gICAgfVxuICAgIGRlbHRhID0gMDtcblxuICAgIHJldHVybiBzdW07XG4gIH07XG59XG5cbmZ1bmN0aW9uIHdpZHRoKGcsIHYpIHtcbiAgcmV0dXJuIGcubm9kZSh2KS53aWR0aDtcbn1cbiIsCiAgICAiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gtZXMnO1xuaW1wb3J0ICogYXMgdXRpbCBmcm9tICcuLi91dGlsLmpzJztcbmltcG9ydCB7IHBvc2l0aW9uWCB9IGZyb20gJy4vYmsuanMnO1xuXG5leHBvcnQgeyBwb3NpdGlvbiB9O1xuXG5mdW5jdGlvbiBwb3NpdGlvbihnKSB7XG4gIGcgPSB1dGlsLmFzTm9uQ29tcG91bmRHcmFwaChnKTtcblxuICBwb3NpdGlvblkoZyk7XG4gIF8uZm9yT3duKHBvc2l0aW9uWChnKSwgZnVuY3Rpb24gKHgsIHYpIHtcbiAgICBnLm5vZGUodikueCA9IHg7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBwb3NpdGlvblkoZykge1xuICB2YXIgbGF5ZXJpbmcgPSB1dGlsLmJ1aWxkTGF5ZXJNYXRyaXgoZyk7XG4gIHZhciByYW5rU2VwID0gZy5ncmFwaCgpLnJhbmtzZXA7XG4gIHZhciBwcmV2WSA9IDA7XG4gIF8uZm9yRWFjaChsYXllcmluZywgZnVuY3Rpb24gKGxheWVyKSB7XG4gICAgdmFyIG1heEhlaWdodCA9IF8ubWF4KFxuICAgICAgXy5tYXAobGF5ZXIsIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHJldHVybiBnLm5vZGUodikuaGVpZ2h0O1xuICAgICAgfSksXG4gICAgKTtcbiAgICBfLmZvckVhY2gobGF5ZXIsIGZ1bmN0aW9uICh2KSB7XG4gICAgICBnLm5vZGUodikueSA9IHByZXZZICsgbWF4SGVpZ2h0IC8gMjtcbiAgICB9KTtcbiAgICBwcmV2WSArPSBtYXhIZWlnaHQgKyByYW5rU2VwO1xuICB9KTtcbn1cbiIsCiAgICAiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gtZXMnO1xuaW1wb3J0IHsgR3JhcGggfSBmcm9tICcuLi9ncmFwaGxpYi9pbmRleC5qcyc7XG5pbXBvcnQgeyBhZGRCb3JkZXJTZWdtZW50cyB9IGZyb20gJy4vYWRkLWJvcmRlci1zZWdtZW50cy5qcyc7XG5pbXBvcnQgKiBhcyBjb29yZGluYXRlU3lzdGVtIGZyb20gJy4vY29vcmRpbmF0ZS1zeXN0ZW0uanMnO1xuaW1wb3J0ICogYXMgYWN5Y2xpYyBmcm9tICcuL2FjeWNsaWMuanMnO1xuaW1wb3J0ICogYXMgbm9ybWFsaXplIGZyb20gJy4vbm9ybWFsaXplLmpzJztcbmltcG9ydCB7IHJhbmsgfSBmcm9tICcuL3JhbmsvaW5kZXguanMnO1xuaW1wb3J0ICogYXMgbmVzdGluZ0dyYXBoIGZyb20gJy4vbmVzdGluZy1ncmFwaC5qcyc7XG5pbXBvcnQgeyBvcmRlciB9IGZyb20gJy4vb3JkZXIvaW5kZXguanMnO1xuaW1wb3J0IHsgcGFyZW50RHVtbXlDaGFpbnMgfSBmcm9tICcuL3BhcmVudC1kdW1teS1jaGFpbnMuanMnO1xuaW1wb3J0IHsgcG9zaXRpb24gfSBmcm9tICcuL3Bvc2l0aW9uL2luZGV4LmpzJztcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAnLi91dGlsLmpzJztcblxuZXhwb3J0IHsgbGF5b3V0IH07XG5cbmZ1bmN0aW9uIGxheW91dChnLCBvcHRzKSB7XG4gIHZhciB0aW1lID0gb3B0cyAmJiBvcHRzLmRlYnVnVGltaW5nID8gdXRpbC50aW1lIDogdXRpbC5ub3RpbWU7XG4gIHRpbWUoJ2xheW91dCcsICgpID0+IHtcbiAgICB2YXIgbGF5b3V0R3JhcGggPSB0aW1lKCcgIGJ1aWxkTGF5b3V0R3JhcGgnLCAoKSA9PiBidWlsZExheW91dEdyYXBoKGcpKTtcbiAgICB0aW1lKCcgIHJ1bkxheW91dCcsICgpID0+IHJ1bkxheW91dChsYXlvdXRHcmFwaCwgdGltZSkpO1xuICAgIHRpbWUoJyAgdXBkYXRlSW5wdXRHcmFwaCcsICgpID0+IHVwZGF0ZUlucHV0R3JhcGgoZywgbGF5b3V0R3JhcGgpKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJ1bkxheW91dChnLCB0aW1lKSB7XG4gIHRpbWUoJyAgICBtYWtlU3BhY2VGb3JFZGdlTGFiZWxzJywgKCkgPT4gbWFrZVNwYWNlRm9yRWRnZUxhYmVscyhnKSk7XG4gIHRpbWUoJyAgICByZW1vdmVTZWxmRWRnZXMnLCAoKSA9PiByZW1vdmVTZWxmRWRnZXMoZykpO1xuICB0aW1lKCcgICAgYWN5Y2xpYycsICgpID0+IGFjeWNsaWMucnVuKGcpKTtcbiAgdGltZSgnICAgIG5lc3RpbmdHcmFwaC5ydW4nLCAoKSA9PiBuZXN0aW5nR3JhcGgucnVuKGcpKTtcbiAgdGltZSgnICAgIHJhbmsnLCAoKSA9PiByYW5rKHV0aWwuYXNOb25Db21wb3VuZEdyYXBoKGcpKSk7XG4gIHRpbWUoJyAgICBpbmplY3RFZGdlTGFiZWxQcm94aWVzJywgKCkgPT4gaW5qZWN0RWRnZUxhYmVsUHJveGllcyhnKSk7XG4gIHRpbWUoJyAgICByZW1vdmVFbXB0eVJhbmtzJywgKCkgPT4gdXRpbC5yZW1vdmVFbXB0eVJhbmtzKGcpKTtcbiAgdGltZSgnICAgIG5lc3RpbmdHcmFwaC5jbGVhbnVwJywgKCkgPT4gbmVzdGluZ0dyYXBoLmNsZWFudXAoZykpO1xuICB0aW1lKCcgICAgbm9ybWFsaXplUmFua3MnLCAoKSA9PiB1dGlsLm5vcm1hbGl6ZVJhbmtzKGcpKTtcbiAgdGltZSgnICAgIGFzc2lnblJhbmtNaW5NYXgnLCAoKSA9PiBhc3NpZ25SYW5rTWluTWF4KGcpKTtcbiAgdGltZSgnICAgIHJlbW92ZUVkZ2VMYWJlbFByb3hpZXMnLCAoKSA9PiByZW1vdmVFZGdlTGFiZWxQcm94aWVzKGcpKTtcbiAgdGltZSgnICAgIG5vcm1hbGl6ZS5ydW4nLCAoKSA9PiBub3JtYWxpemUucnVuKGcpKTtcbiAgdGltZSgnICAgIHBhcmVudER1bW15Q2hhaW5zJywgKCkgPT4gcGFyZW50RHVtbXlDaGFpbnMoZykpO1xuICB0aW1lKCcgICAgYWRkQm9yZGVyU2VnbWVudHMnLCAoKSA9PiBhZGRCb3JkZXJTZWdtZW50cyhnKSk7XG4gIHRpbWUoJyAgICBvcmRlcicsICgpID0+IG9yZGVyKGcpKTtcbiAgdGltZSgnICAgIGluc2VydFNlbGZFZGdlcycsICgpID0+IGluc2VydFNlbGZFZGdlcyhnKSk7XG4gIHRpbWUoJyAgICBhZGp1c3RDb29yZGluYXRlU3lzdGVtJywgKCkgPT4gY29vcmRpbmF0ZVN5c3RlbS5hZGp1c3QoZykpO1xuICB0aW1lKCcgICAgcG9zaXRpb24nLCAoKSA9PiBwb3NpdGlvbihnKSk7XG4gIHRpbWUoJyAgICBwb3NpdGlvblNlbGZFZGdlcycsICgpID0+IHBvc2l0aW9uU2VsZkVkZ2VzKGcpKTtcbiAgdGltZSgnICAgIHJlbW92ZUJvcmRlck5vZGVzJywgKCkgPT4gcmVtb3ZlQm9yZGVyTm9kZXMoZykpO1xuICB0aW1lKCcgICAgbm9ybWFsaXplLnVuZG8nLCAoKSA9PiBub3JtYWxpemUudW5kbyhnKSk7XG4gIHRpbWUoJyAgICBmaXh1cEVkZ2VMYWJlbENvb3JkcycsICgpID0+IGZpeHVwRWRnZUxhYmVsQ29vcmRzKGcpKTtcbiAgdGltZSgnICAgIHVuZG9Db29yZGluYXRlU3lzdGVtJywgKCkgPT4gY29vcmRpbmF0ZVN5c3RlbS51bmRvKGcpKTtcbiAgdGltZSgnICAgIHRyYW5zbGF0ZUdyYXBoJywgKCkgPT4gdHJhbnNsYXRlR3JhcGgoZykpO1xuICB0aW1lKCcgICAgYXNzaWduTm9kZUludGVyc2VjdHMnLCAoKSA9PiBhc3NpZ25Ob2RlSW50ZXJzZWN0cyhnKSk7XG4gIHRpbWUoJyAgICByZXZlcnNlUG9pbnRzJywgKCkgPT4gcmV2ZXJzZVBvaW50c0ZvclJldmVyc2VkRWRnZXMoZykpO1xuICB0aW1lKCcgICAgYWN5Y2xpYy51bmRvJywgKCkgPT4gYWN5Y2xpYy51bmRvKGcpKTtcbn1cblxuLypcbiAqIENvcGllcyBmaW5hbCBsYXlvdXQgaW5mb3JtYXRpb24gZnJvbSB0aGUgbGF5b3V0IGdyYXBoIGJhY2sgdG8gdGhlIGlucHV0XG4gKiBncmFwaC4gVGhpcyBwcm9jZXNzIG9ubHkgY29waWVzIHdoaXRlbGlzdGVkIGF0dHJpYnV0ZXMgZnJvbSB0aGUgbGF5b3V0IGdyYXBoXG4gKiB0byB0aGUgaW5wdXQgZ3JhcGgsIHNvIGl0IHNlcnZlcyBhcyBhIGdvb2QgcGxhY2UgdG8gZGV0ZXJtaW5lIHdoYXRcbiAqIGF0dHJpYnV0ZXMgY2FuIGluZmx1ZW5jZSBsYXlvdXQuXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZUlucHV0R3JhcGgoaW5wdXRHcmFwaCwgbGF5b3V0R3JhcGgpIHtcbiAgXy5mb3JFYWNoKGlucHV0R3JhcGgubm9kZXMoKSwgZnVuY3Rpb24gKHYpIHtcbiAgICB2YXIgaW5wdXRMYWJlbCA9IGlucHV0R3JhcGgubm9kZSh2KTtcbiAgICB2YXIgbGF5b3V0TGFiZWwgPSBsYXlvdXRHcmFwaC5ub2RlKHYpO1xuXG4gICAgaWYgKGlucHV0TGFiZWwpIHtcbiAgICAgIGlucHV0TGFiZWwueCA9IGxheW91dExhYmVsLng7XG4gICAgICBpbnB1dExhYmVsLnkgPSBsYXlvdXRMYWJlbC55O1xuXG4gICAgICBpZiAobGF5b3V0R3JhcGguY2hpbGRyZW4odikubGVuZ3RoKSB7XG4gICAgICAgIGlucHV0TGFiZWwud2lkdGggPSBsYXlvdXRMYWJlbC53aWR0aDtcbiAgICAgICAgaW5wdXRMYWJlbC5oZWlnaHQgPSBsYXlvdXRMYWJlbC5oZWlnaHQ7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBfLmZvckVhY2goaW5wdXRHcmFwaC5lZGdlcygpLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBpbnB1dExhYmVsID0gaW5wdXRHcmFwaC5lZGdlKGUpO1xuICAgIHZhciBsYXlvdXRMYWJlbCA9IGxheW91dEdyYXBoLmVkZ2UoZSk7XG5cbiAgICBpbnB1dExhYmVsLnBvaW50cyA9IGxheW91dExhYmVsLnBvaW50cztcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGxheW91dExhYmVsLCAneCcpKSB7XG4gICAgICBpbnB1dExhYmVsLnggPSBsYXlvdXRMYWJlbC54O1xuICAgICAgaW5wdXRMYWJlbC55ID0gbGF5b3V0TGFiZWwueTtcbiAgICB9XG4gIH0pO1xuXG4gIGlucHV0R3JhcGguZ3JhcGgoKS53aWR0aCA9IGxheW91dEdyYXBoLmdyYXBoKCkud2lkdGg7XG4gIGlucHV0R3JhcGguZ3JhcGgoKS5oZWlnaHQgPSBsYXlvdXRHcmFwaC5ncmFwaCgpLmhlaWdodDtcbn1cblxudmFyIGdyYXBoTnVtQXR0cnMgPSBbJ25vZGVzZXAnLCAnZWRnZXNlcCcsICdyYW5rc2VwJywgJ21hcmdpbngnLCAnbWFyZ2lueSddO1xudmFyIGdyYXBoRGVmYXVsdHMgPSB7IHJhbmtzZXA6IDUwLCBlZGdlc2VwOiAyMCwgbm9kZXNlcDogNTAsIHJhbmtkaXI6ICd0YicgfTtcbnZhciBncmFwaEF0dHJzID0gWydhY3ljbGljZXInLCAncmFua2VyJywgJ3JhbmtkaXInLCAnYWxpZ24nXTtcbnZhciBub2RlTnVtQXR0cnMgPSBbJ3dpZHRoJywgJ2hlaWdodCddO1xudmFyIG5vZGVEZWZhdWx0cyA9IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9O1xudmFyIGVkZ2VOdW1BdHRycyA9IFsnbWlubGVuJywgJ3dlaWdodCcsICd3aWR0aCcsICdoZWlnaHQnLCAnbGFiZWxvZmZzZXQnXTtcbnZhciBlZGdlRGVmYXVsdHMgPSB7XG4gIG1pbmxlbjogMSxcbiAgd2VpZ2h0OiAxLFxuICB3aWR0aDogMCxcbiAgaGVpZ2h0OiAwLFxuICBsYWJlbG9mZnNldDogMTAsXG4gIGxhYmVscG9zOiAncicsXG59O1xudmFyIGVkZ2VBdHRycyA9IFsnbGFiZWxwb3MnXTtcblxuLypcbiAqIENvbnN0cnVjdHMgYSBuZXcgZ3JhcGggZnJvbSB0aGUgaW5wdXQgZ3JhcGgsIHdoaWNoIGNhbiBiZSB1c2VkIGZvciBsYXlvdXQuXG4gKiBUaGlzIHByb2Nlc3MgY29waWVzIG9ubHkgd2hpdGVsaXN0ZWQgYXR0cmlidXRlcyBmcm9tIHRoZSBpbnB1dCBncmFwaCB0byB0aGVcbiAqIGxheW91dCBncmFwaC4gVGh1cyB0aGlzIGZ1bmN0aW9uIHNlcnZlcyBhcyBhIGdvb2QgcGxhY2UgdG8gZGV0ZXJtaW5lIHdoYXRcbiAqIGF0dHJpYnV0ZXMgY2FuIGluZmx1ZW5jZSBsYXlvdXQuXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkTGF5b3V0R3JhcGgoaW5wdXRHcmFwaCkge1xuICB2YXIgZyA9IG5ldyBHcmFwaCh7IG11bHRpZ3JhcGg6IHRydWUsIGNvbXBvdW5kOiB0cnVlIH0pO1xuICB2YXIgZ3JhcGggPSBjYW5vbmljYWxpemUoaW5wdXRHcmFwaC5ncmFwaCgpKTtcblxuICBnLnNldEdyYXBoKFxuICAgIF8ubWVyZ2Uoe30sIGdyYXBoRGVmYXVsdHMsIHNlbGVjdE51bWJlckF0dHJzKGdyYXBoLCBncmFwaE51bUF0dHJzKSwgXy5waWNrKGdyYXBoLCBncmFwaEF0dHJzKSksXG4gICk7XG5cbiAgXy5mb3JFYWNoKGlucHV0R3JhcGgubm9kZXMoKSwgZnVuY3Rpb24gKHYpIHtcbiAgICB2YXIgbm9kZSA9IGNhbm9uaWNhbGl6ZShpbnB1dEdyYXBoLm5vZGUodikpO1xuICAgIGcuc2V0Tm9kZSh2LCBfLmRlZmF1bHRzKHNlbGVjdE51bWJlckF0dHJzKG5vZGUsIG5vZGVOdW1BdHRycyksIG5vZGVEZWZhdWx0cykpO1xuICAgIGcuc2V0UGFyZW50KHYsIGlucHV0R3JhcGgucGFyZW50KHYpKTtcbiAgfSk7XG5cbiAgXy5mb3JFYWNoKGlucHV0R3JhcGguZWRnZXMoKSwgZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgZWRnZSA9IGNhbm9uaWNhbGl6ZShpbnB1dEdyYXBoLmVkZ2UoZSkpO1xuICAgIGcuc2V0RWRnZShcbiAgICAgIGUsXG4gICAgICBfLm1lcmdlKHt9LCBlZGdlRGVmYXVsdHMsIHNlbGVjdE51bWJlckF0dHJzKGVkZ2UsIGVkZ2VOdW1BdHRycyksIF8ucGljayhlZGdlLCBlZGdlQXR0cnMpKSxcbiAgICApO1xuICB9KTtcblxuICByZXR1cm4gZztcbn1cblxuLypcbiAqIFRoaXMgaWRlYSBjb21lcyBmcm9tIHRoZSBHYW5zbmVyIHBhcGVyOiB0byBhY2NvdW50IGZvciBlZGdlIGxhYmVscyBpbiBvdXJcbiAqIGxheW91dCB3ZSBzcGxpdCBlYWNoIHJhbmsgaW4gaGFsZiBieSBkb3VibGluZyBtaW5sZW4gYW5kIGhhbHZpbmcgcmFua3NlcC5cbiAqIFRoZW4gd2UgY2FuIHBsYWNlIGxhYmVscyBhdCB0aGVzZSBtaWQtcG9pbnRzIGJldHdlZW4gbm9kZXMuXG4gKlxuICogV2UgYWxzbyBhZGQgc29tZSBtaW5pbWFsIHBhZGRpbmcgdG8gdGhlIHdpZHRoIHRvIHB1c2ggdGhlIGxhYmVsIGZvciB0aGUgZWRnZVxuICogYXdheSBmcm9tIHRoZSBlZGdlIGl0c2VsZiBhIGJpdC5cbiAqL1xuZnVuY3Rpb24gbWFrZVNwYWNlRm9yRWRnZUxhYmVscyhnKSB7XG4gIHZhciBncmFwaCA9IGcuZ3JhcGgoKTtcbiAgZ3JhcGgucmFua3NlcCAvPSAyO1xuICBfLmZvckVhY2goZy5lZGdlcygpLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBlZGdlID0gZy5lZGdlKGUpO1xuICAgIGVkZ2UubWlubGVuICo9IDI7XG4gICAgaWYgKGVkZ2UubGFiZWxwb3MudG9Mb3dlckNhc2UoKSAhPT0gJ2MnKSB7XG4gICAgICBpZiAoZ3JhcGgucmFua2RpciA9PT0gJ1RCJyB8fCBncmFwaC5yYW5rZGlyID09PSAnQlQnKSB7XG4gICAgICAgIGVkZ2Uud2lkdGggKz0gZWRnZS5sYWJlbG9mZnNldDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVkZ2UuaGVpZ2h0ICs9IGVkZ2UubGFiZWxvZmZzZXQ7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuLypcbiAqIENyZWF0ZXMgdGVtcG9yYXJ5IGR1bW15IG5vZGVzIHRoYXQgY2FwdHVyZSB0aGUgcmFuayBpbiB3aGljaCBlYWNoIGVkZ2Unc1xuICogbGFiZWwgaXMgZ29pbmcgdG8sIGlmIGl0IGhhcyBvbmUgb2Ygbm9uLXplcm8gd2lkdGggYW5kIGhlaWdodC4gV2UgZG8gdGhpc1xuICogc28gdGhhdCB3ZSBjYW4gc2FmZWx5IHJlbW92ZSBlbXB0eSByYW5rcyB3aGlsZSBwcmVzZXJ2aW5nIGJhbGFuY2UgZm9yIHRoZVxuICogbGFiZWwncyBwb3NpdGlvbi5cbiAqL1xuZnVuY3Rpb24gaW5qZWN0RWRnZUxhYmVsUHJveGllcyhnKSB7XG4gIF8uZm9yRWFjaChnLmVkZ2VzKCksIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIGVkZ2UgPSBnLmVkZ2UoZSk7XG4gICAgaWYgKGVkZ2Uud2lkdGggJiYgZWRnZS5oZWlnaHQpIHtcbiAgICAgIHZhciB2ID0gZy5ub2RlKGUudik7XG4gICAgICB2YXIgdyA9IGcubm9kZShlLncpO1xuICAgICAgdmFyIGxhYmVsID0geyByYW5rOiAody5yYW5rIC0gdi5yYW5rKSAvIDIgKyB2LnJhbmssIGU6IGUgfTtcbiAgICAgIHV0aWwuYWRkRHVtbXlOb2RlKGcsICdlZGdlLXByb3h5JywgbGFiZWwsICdfZXAnKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhc3NpZ25SYW5rTWluTWF4KGcpIHtcbiAgdmFyIG1heFJhbmsgPSAwO1xuICBfLmZvckVhY2goZy5ub2RlcygpLCBmdW5jdGlvbiAodikge1xuICAgIHZhciBub2RlID0gZy5ub2RlKHYpO1xuICAgIGlmIChub2RlLmJvcmRlclRvcCkge1xuICAgICAgbm9kZS5taW5SYW5rID0gZy5ub2RlKG5vZGUuYm9yZGVyVG9wKS5yYW5rO1xuICAgICAgbm9kZS5tYXhSYW5rID0gZy5ub2RlKG5vZGUuYm9yZGVyQm90dG9tKS5yYW5rO1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvclxuICAgICAgbWF4UmFuayA9IF8ubWF4KG1heFJhbmssIG5vZGUubWF4UmFuayk7XG4gICAgfVxuICB9KTtcbiAgZy5ncmFwaCgpLm1heFJhbmsgPSBtYXhSYW5rO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFZGdlTGFiZWxQcm94aWVzKGcpIHtcbiAgXy5mb3JFYWNoKGcubm9kZXMoKSwgZnVuY3Rpb24gKHYpIHtcbiAgICB2YXIgbm9kZSA9IGcubm9kZSh2KTtcbiAgICBpZiAobm9kZS5kdW1teSA9PT0gJ2VkZ2UtcHJveHknKSB7XG4gICAgICBnLmVkZ2Uobm9kZS5lKS5sYWJlbFJhbmsgPSBub2RlLnJhbms7XG4gICAgICBnLnJlbW92ZU5vZGUodik7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gdHJhbnNsYXRlR3JhcGgoZykge1xuICB2YXIgbWluWCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgdmFyIG1heFggPSAwO1xuICB2YXIgbWluWSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgdmFyIG1heFkgPSAwO1xuICB2YXIgZ3JhcGhMYWJlbCA9IGcuZ3JhcGgoKTtcbiAgdmFyIG1hcmdpblggPSBncmFwaExhYmVsLm1hcmdpbnggfHwgMDtcbiAgdmFyIG1hcmdpblkgPSBncmFwaExhYmVsLm1hcmdpbnkgfHwgMDtcblxuICBmdW5jdGlvbiBnZXRFeHRyZW1lcyhhdHRycykge1xuICAgIHZhciB4ID0gYXR0cnMueDtcbiAgICB2YXIgeSA9IGF0dHJzLnk7XG4gICAgdmFyIHcgPSBhdHRycy53aWR0aDtcbiAgICB2YXIgaCA9IGF0dHJzLmhlaWdodDtcbiAgICBtaW5YID0gTWF0aC5taW4obWluWCwgeCAtIHcgLyAyKTtcbiAgICBtYXhYID0gTWF0aC5tYXgobWF4WCwgeCArIHcgLyAyKTtcbiAgICBtaW5ZID0gTWF0aC5taW4obWluWSwgeSAtIGggLyAyKTtcbiAgICBtYXhZID0gTWF0aC5tYXgobWF4WSwgeSArIGggLyAyKTtcbiAgfVxuXG4gIF8uZm9yRWFjaChnLm5vZGVzKCksIGZ1bmN0aW9uICh2KSB7XG4gICAgZ2V0RXh0cmVtZXMoZy5ub2RlKHYpKTtcbiAgfSk7XG4gIF8uZm9yRWFjaChnLmVkZ2VzKCksIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIGVkZ2UgPSBnLmVkZ2UoZSk7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlZGdlLCAneCcpKSB7XG4gICAgICBnZXRFeHRyZW1lcyhlZGdlKTtcbiAgICB9XG4gIH0pO1xuXG4gIG1pblggLT0gbWFyZ2luWDtcbiAgbWluWSAtPSBtYXJnaW5ZO1xuXG4gIF8uZm9yRWFjaChnLm5vZGVzKCksIGZ1bmN0aW9uICh2KSB7XG4gICAgdmFyIG5vZGUgPSBnLm5vZGUodik7XG4gICAgbm9kZS54IC09IG1pblg7XG4gICAgbm9kZS55IC09IG1pblk7XG4gIH0pO1xuXG4gIF8uZm9yRWFjaChnLmVkZ2VzKCksIGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIGVkZ2UgPSBnLmVkZ2UoZSk7XG4gICAgXy5mb3JFYWNoKGVkZ2UucG9pbnRzLCBmdW5jdGlvbiAocCkge1xuICAgICAgcC54IC09IG1pblg7XG4gICAgICBwLnkgLT0gbWluWTtcbiAgICB9KTtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGVkZ2UsICd4JykpIHtcbiAgICAgIGVkZ2UueCAtPSBtaW5YO1xuICAgIH1cbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGVkZ2UsICd5JykpIHtcbiAgICAgIGVkZ2UueSAtPSBtaW5ZO1xuICAgIH1cbiAgfSk7XG5cbiAgZ3JhcGhMYWJlbC53aWR0aCA9IG1heFggLSBtaW5YICsgbWFyZ2luWDtcbiAgZ3JhcGhMYWJlbC5oZWlnaHQgPSBtYXhZIC0gbWluWSArIG1hcmdpblk7XG59XG5cbmZ1bmN0aW9uIGFzc2lnbk5vZGVJbnRlcnNlY3RzKGcpIHtcbiAgXy5mb3JFYWNoKGcuZWRnZXMoKSwgZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgZWRnZSA9IGcuZWRnZShlKTtcbiAgICB2YXIgbm9kZVYgPSBnLm5vZGUoZS52KTtcbiAgICB2YXIgbm9kZVcgPSBnLm5vZGUoZS53KTtcbiAgICB2YXIgcDEsIHAyO1xuICAgIGlmICghZWRnZS5wb2ludHMpIHtcbiAgICAgIGVkZ2UucG9pbnRzID0gW107XG4gICAgICBwMSA9IG5vZGVXO1xuICAgICAgcDIgPSBub2RlVjtcbiAgICB9IGVsc2Uge1xuICAgICAgcDEgPSBlZGdlLnBvaW50c1swXTtcbiAgICAgIHAyID0gZWRnZS5wb2ludHNbZWRnZS5wb2ludHMubGVuZ3RoIC0gMV07XG4gICAgfVxuICAgIGVkZ2UucG9pbnRzLnVuc2hpZnQodXRpbC5pbnRlcnNlY3RSZWN0KG5vZGVWLCBwMSkpO1xuICAgIGVkZ2UucG9pbnRzLnB1c2godXRpbC5pbnRlcnNlY3RSZWN0KG5vZGVXLCBwMikpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZml4dXBFZGdlTGFiZWxDb29yZHMoZykge1xuICBfLmZvckVhY2goZy5lZGdlcygpLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBlZGdlID0gZy5lZGdlKGUpO1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZWRnZSwgJ3gnKSkge1xuICAgICAgaWYgKGVkZ2UubGFiZWxwb3MgPT09ICdsJyB8fCBlZGdlLmxhYmVscG9zID09PSAncicpIHtcbiAgICAgICAgZWRnZS53aWR0aCAtPSBlZGdlLmxhYmVsb2Zmc2V0O1xuICAgICAgfVxuICAgICAgc3dpdGNoIChlZGdlLmxhYmVscG9zKSB7XG4gICAgICAgIGNhc2UgJ2wnOlxuICAgICAgICAgIGVkZ2UueCAtPSBlZGdlLndpZHRoIC8gMiArIGVkZ2UubGFiZWxvZmZzZXQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3InOlxuICAgICAgICAgIGVkZ2UueCArPSBlZGdlLndpZHRoIC8gMiArIGVkZ2UubGFiZWxvZmZzZXQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gcmV2ZXJzZVBvaW50c0ZvclJldmVyc2VkRWRnZXMoZykge1xuICBfLmZvckVhY2goZy5lZGdlcygpLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBlZGdlID0gZy5lZGdlKGUpO1xuICAgIGlmIChlZGdlLnJldmVyc2VkKSB7XG4gICAgICBlZGdlLnBvaW50cy5yZXZlcnNlKCk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlQm9yZGVyTm9kZXMoZykge1xuICBfLmZvckVhY2goZy5ub2RlcygpLCBmdW5jdGlvbiAodikge1xuICAgIGlmIChnLmNoaWxkcmVuKHYpLmxlbmd0aCkge1xuICAgICAgdmFyIG5vZGUgPSBnLm5vZGUodik7XG4gICAgICB2YXIgdCA9IGcubm9kZShub2RlLmJvcmRlclRvcCk7XG4gICAgICB2YXIgYiA9IGcubm9kZShub2RlLmJvcmRlckJvdHRvbSk7XG4gICAgICB2YXIgbCA9IGcubm9kZShfLmxhc3Qobm9kZS5ib3JkZXJMZWZ0KSk7XG4gICAgICB2YXIgciA9IGcubm9kZShfLmxhc3Qobm9kZS5ib3JkZXJSaWdodCkpO1xuXG4gICAgICBub2RlLndpZHRoID0gTWF0aC5hYnMoci54IC0gbC54KTtcbiAgICAgIG5vZGUuaGVpZ2h0ID0gTWF0aC5hYnMoYi55IC0gdC55KTtcbiAgICAgIG5vZGUueCA9IGwueCArIG5vZGUud2lkdGggLyAyO1xuICAgICAgbm9kZS55ID0gdC55ICsgbm9kZS5oZWlnaHQgLyAyO1xuICAgIH1cbiAgfSk7XG5cbiAgXy5mb3JFYWNoKGcubm9kZXMoKSwgZnVuY3Rpb24gKHYpIHtcbiAgICBpZiAoZy5ub2RlKHYpLmR1bW15ID09PSAnYm9yZGVyJykge1xuICAgICAgZy5yZW1vdmVOb2RlKHYpO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVNlbGZFZGdlcyhnKSB7XG4gIF8uZm9yRWFjaChnLmVkZ2VzKCksIGZ1bmN0aW9uIChlKSB7XG4gICAgaWYgKGUudiA9PT0gZS53KSB7XG4gICAgICB2YXIgbm9kZSA9IGcubm9kZShlLnYpO1xuICAgICAgaWYgKCFub2RlLnNlbGZFZGdlcykge1xuICAgICAgICBub2RlLnNlbGZFZGdlcyA9IFtdO1xuICAgICAgfVxuICAgICAgbm9kZS5zZWxmRWRnZXMucHVzaCh7IGU6IGUsIGxhYmVsOiBnLmVkZ2UoZSkgfSk7XG4gICAgICBnLnJlbW92ZUVkZ2UoZSk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gaW5zZXJ0U2VsZkVkZ2VzKGcpIHtcbiAgdmFyIGxheWVycyA9IHV0aWwuYnVpbGRMYXllck1hdHJpeChnKTtcbiAgXy5mb3JFYWNoKGxheWVycywgZnVuY3Rpb24gKGxheWVyKSB7XG4gICAgdmFyIG9yZGVyU2hpZnQgPSAwO1xuICAgIF8uZm9yRWFjaChsYXllciwgZnVuY3Rpb24gKHYsIGkpIHtcbiAgICAgIHZhciBub2RlID0gZy5ub2RlKHYpO1xuICAgICAgbm9kZS5vcmRlciA9IGkgKyBvcmRlclNoaWZ0O1xuICAgICAgXy5mb3JFYWNoKG5vZGUuc2VsZkVkZ2VzLCBmdW5jdGlvbiAoc2VsZkVkZ2UpIHtcbiAgICAgICAgdXRpbC5hZGREdW1teU5vZGUoXG4gICAgICAgICAgZyxcbiAgICAgICAgICAnc2VsZmVkZ2UnLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHdpZHRoOiBzZWxmRWRnZS5sYWJlbC53aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogc2VsZkVkZ2UubGFiZWwuaGVpZ2h0LFxuICAgICAgICAgICAgcmFuazogbm9kZS5yYW5rLFxuICAgICAgICAgICAgb3JkZXI6IGkgKyArK29yZGVyU2hpZnQsXG4gICAgICAgICAgICBlOiBzZWxmRWRnZS5lLFxuICAgICAgICAgICAgbGFiZWw6IHNlbGZFZGdlLmxhYmVsLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgJ19zZScsXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICAgIGRlbGV0ZSBub2RlLnNlbGZFZGdlcztcbiAgICB9KTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHBvc2l0aW9uU2VsZkVkZ2VzKGcpIHtcbiAgXy5mb3JFYWNoKGcubm9kZXMoKSwgZnVuY3Rpb24gKHYpIHtcbiAgICB2YXIgbm9kZSA9IGcubm9kZSh2KTtcbiAgICBpZiAobm9kZS5kdW1teSA9PT0gJ3NlbGZlZGdlJykge1xuICAgICAgdmFyIHNlbGZOb2RlID0gZy5ub2RlKG5vZGUuZS52KTtcbiAgICAgIHZhciB4ID0gc2VsZk5vZGUueCArIHNlbGZOb2RlLndpZHRoIC8gMjtcbiAgICAgIHZhciB5ID0gc2VsZk5vZGUueTtcbiAgICAgIHZhciBkeCA9IG5vZGUueCAtIHg7XG4gICAgICB2YXIgZHkgPSBzZWxmTm9kZS5oZWlnaHQgLyAyO1xuICAgICAgZy5zZXRFZGdlKG5vZGUuZSwgbm9kZS5sYWJlbCk7XG4gICAgICBnLnJlbW92ZU5vZGUodik7XG4gICAgICBub2RlLmxhYmVsLnBvaW50cyA9IFtcbiAgICAgICAgeyB4OiB4ICsgKDIgKiBkeCkgLyAzLCB5OiB5IC0gZHkgfSxcbiAgICAgICAgeyB4OiB4ICsgKDUgKiBkeCkgLyA2LCB5OiB5IC0gZHkgfSxcbiAgICAgICAgeyB4OiB4ICsgZHgsIHk6IHkgfSxcbiAgICAgICAgeyB4OiB4ICsgKDUgKiBkeCkgLyA2LCB5OiB5ICsgZHkgfSxcbiAgICAgICAgeyB4OiB4ICsgKDIgKiBkeCkgLyAzLCB5OiB5ICsgZHkgfSxcbiAgICAgIF07XG4gICAgICBub2RlLmxhYmVsLnggPSBub2RlLng7XG4gICAgICBub2RlLmxhYmVsLnkgPSBub2RlLnk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0TnVtYmVyQXR0cnMob2JqLCBhdHRycykge1xuICByZXR1cm4gXy5tYXBWYWx1ZXMoXy5waWNrKG9iaiwgYXR0cnMpLCBOdW1iZXIpO1xufVxuXG5mdW5jdGlvbiBjYW5vbmljYWxpemUoYXR0cnMpIHtcbiAgdmFyIG5ld0F0dHJzID0ge307XG4gIF8uZm9yRWFjaChhdHRycywgZnVuY3Rpb24gKHYsIGspIHtcbiAgICBuZXdBdHRyc1trLnRvTG93ZXJDYXNlKCldID0gdjtcbiAgfSk7XG4g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Q3ZCLE1BQU0sS0FBSztBQUFBLFVBQ1gsT0FBTyxJQUFJLEVBQUU7QUFBQSxVQUNiLEdBQUcsU0FBUztBQUFBLFVBQ1osT0FBTyxTQUFTO0FBQUEsUUFDbEIsR0FDQSxLQUNGO0FBQUEsT0FDRDtBQUFBLE1BQ0QsT0FBTyxLQUFLO0FBQUEsS0FDYjtBQUFBLEdBQ0Y7QUFBQTtBQUdILFNBQVMsaUJBQWlCLENBQUMsR0FBRztBQUFBLEVBQzFCLGdCQUFRLEVBQUUsTUFBTSxHQUFHLFFBQVMsQ0FBQyxHQUFHO0FBQUEsSUFDaEMsSUFBSSxPQUFPLEVBQUUsS0FBSyxDQUFDO0FBQUEsSUFDbkIsSUFBSSxLQUFLLFVBQVUsWUFBWTtBQUFBLE1BQzdCLElBQUksV0FBVyxFQUFFLEtBQUssS0FBSyxFQUFFLENBQUM7QUFBQSxNQUM5QixJQUFJLElBQUksU0FBUyxJQUFJLFNBQVMsUUFBUTtBQUFBLE1BQ3RDLElBQUksSUFBSSxTQUFTO0FBQUEsTUFDakIsSUFBSSxLQUFLLEtBQUssSUFBSTtBQUFBLE1BQ2xCLElBQUksS0FBSyxTQUFTLFNBQVM7QUFBQSxNQUMzQixFQUFFLFFBQVEsS0FBSyxHQUFHLEtBQUssS0FBSztBQUFBLE1BQzVCLEVBQUUsV0FBVyxDQUFDO0FBQUEsTUFDZCxLQUFLLE1BQU0sU0FBUztBQUFBLFFBQ2xCLEVBQUUsR0FBRyxJQUFLLElBQUksS0FBTSxHQUFHLEdBQUcsSUFBSSxHQUFHO0FBQUEsUUFDakMsRUFBRSxHQUFHLElBQUssSUFBSSxLQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUc7QUFBQSxRQUNqQyxFQUFFLEdBQUcsSUFBSSxJQUFJLEVBQUs7QUFBQSxRQUNsQixFQUFFLEdBQUcsSUFBSyxJQUFJLEtBQU0sR0FBRyxHQUFHLElBQUksR0FBRztBQUFBLFFBQ2pDLEVBQUUsR0FBRyxJQUFLLElBQUksS0FBTSxHQUFHLEdBQUcsSUFBSSxHQUFHO0FBQUEsTUFDbkM7QUFBQSxNQUNBLEtBQUssTUFBTSxJQUFJLEtBQUs7QUFBQSxNQUNwQixLQUFLLE1BQU0sSUFBSSxLQUFLO0FBQUEsSUFDdEI7QUFBQSxHQUNEO0FBQUE7QUFHSCxTQUFTLGlCQUFpQixDQUFDLEtBQUssT0FBTztBQUFBLEVBQ3JDLE9BQVMsa0JBQVksYUFBSyxLQUFLLEtBQUssR0FBRyxNQUFNO0FBQUE7QUFHL0MsU0FBUyxZQUFZLENBQUMsT0FBTztBQUFBLEVBQzNCLElBQUksV0FBVyxDQUFDO0FBQUEsRUFDZCxnQkFBUSxPQUFPLFFBQVMsQ0FBQyxHQUFHLEdBQUc7QUFBQSxJQUMvQixTQUFTLEVBQUUsWUFBWSxLQUFLO0FBQUEsR0FDN0I7QUFBQSxFQUNELE9BQU87QUFBQTsiLAogICJkZWJ1Z0lkIjogIkI0MEZFMTZBNEM3MzE5QjA2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
