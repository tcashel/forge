import {
  layout
} from "./chunk-main-ewtywf1m.js";
import {
  Graph,
  clone_default,
  isUndefined_default,
  map_default
} from "./chunk-main-g8v87zdn.js";
import {
  clear as clear3,
  insertEdge,
  insertEdgeLabel,
  markers_default,
  positionEdgeLabel
} from "./chunk-main-wx3x4ygf.js";
import {
  clear,
  clear2,
  insertCluster,
  insertNode,
  positionNode,
  setNodeElem,
  updateNodeBounds
} from "./chunk-main-xxv6x4s9.js";
import"./chunk-main-2se6cwec.js";
import"./chunk-main-4ceh9h9g.js";
import"./chunk-main-h1tqf3mz.js";
import {
  getSubGraphTitleMargins
} from "./chunk-main-s8463nwg.js";
import"./chunk-main-wsp4jakw.js";
import"./chunk-main-vvfzntzy.js";
import"./chunk-main-ck580f0k.js";
import {
  getConfig2
} from "./chunk-main-aws590jt.js";
import {
  __name,
  log
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/dagre-d3-es/src/graphlib/json.js
function write(g) {
  var json = {
    options: {
      directed: g.isDirected(),
      multigraph: g.isMultigraph(),
      compound: g.isCompound()
    },
    nodes: writeNodes(g),
    edges: writeEdges(g)
  };
  if (!isUndefined_default(g.graph())) {
    json.value = clone_default(g.graph());
  }
  return json;
}
function writeNodes(g) {
  return map_default(g.nodes(), function(v) {
    var nodeValue = g.node(v);
    var parent = g.parent(v);
    var node = { v };
    if (!isUndefined_default(nodeValue)) {
      node.value = nodeValue;
    }
    if (!isUndefined_default(parent)) {
      node.parent = parent;
    }
    return node;
  });
}
function writeEdges(g) {
  return map_default(g.edges(), function(e) {
    var edgeValue = g.edge(e);
    var edge = { v: e.v, w: e.w };
    if (!isUndefined_default(e.name)) {
      edge.name = e.name;
    }
    if (!isUndefined_default(edgeValue)) {
      edge.value = edgeValue;
    }
    return edge;
  });
}

// node_modules/mermaid/dist/chunks/mermaid.core/dagre-BM42HDAG.mjs
var clusterDb = /* @__PURE__ */ new Map;
var descendants = /* @__PURE__ */ new Map;
var parents = /* @__PURE__ */ new Map;
var clear4 = /* @__PURE__ */ __name(() => {
  descendants.clear();
  parents.clear();
  clusterDb.clear();
}, "clear");
var isDescendant = /* @__PURE__ */ __name((id, ancestorId) => {
  const ancestorDescendants = descendants.get(ancestorId) || [];
  log.trace("In isDescendant", ancestorId, " ", id, " = ", ancestorDescendants.includes(id));
  return ancestorDescendants.includes(id);
}, "isDescendant");
var edgeInCluster = /* @__PURE__ */ __name((edge, clusterId) => {
  const clusterDescendants = descendants.get(clusterId) || [];
  log.info("Descendants of ", clusterId, " is ", clusterDescendants);
  log.info("Edge is ", edge);
  if (edge.v === clusterId || edge.w === clusterId) {
    return false;
  }
  if (!clusterDescendants) {
    log.debug("Tilt, ", clusterId, ",not in descendants");
    return false;
  }
  return clusterDescendants.includes(edge.v) || isDescendant(edge.v, clusterId) || isDescendant(edge.w, clusterId) || clusterDescendants.includes(edge.w);
}, "edgeInCluster");
var copy = /* @__PURE__ */ __name((clusterId, graph, newGraph, rootId) => {
  log.warn("Copying children of ", clusterId, "root", rootId, "data", graph.node(clusterId), rootId);
  const nodes = graph.children(clusterId) || [];
  if (clusterId !== rootId) {
    nodes.push(clusterId);
  }
  log.warn("Copying (nodes) clusterId", clusterId, "nodes", nodes);
  nodes.forEach((node) => {
    if (graph.children(node).length > 0) {
      copy(node, graph, newGraph, rootId);
    } else {
      const data = graph.node(node);
      log.info("cp ", node, " to ", rootId, " with parent ", clusterId);
      newGraph.setNode(node, data);
      if (rootId !== graph.parent(node)) {
        log.warn("Setting parent", node, graph.parent(node));
        newGraph.setParent(node, graph.parent(node));
      }
      if (clusterId !== rootId && node !== clusterId) {
        log.debug("Setting parent", node, clusterId);
        newGraph.setParent(node, clusterId);
      } else {
        log.info("In copy ", clusterId, "root", rootId, "data", graph.node(clusterId), rootId);
        log.debug("Not Setting parent for node=", node, "cluster!==rootId", clusterId !== rootId, "node!==clusterId", node !== clusterId);
      }
      const edges = graph.edges(node);
      log.debug("Copying Edges", edges);
      edges.forEach((edge) => {
        log.info("Edge", edge);
        const data2 = graph.edge(edge.v, edge.w, edge.name);
        log.info("Edge data", data2, rootId);
        try {
          if (edgeInCluster(edge, rootId)) {
            log.info("Copying as ", edge.v, edge.w, data2, edge.name);
            newGraph.setEdge(edge.v, edge.w, data2, edge.name);
            log.info("newGraph edges ", newGraph.edges(), newGraph.edge(newGraph.edges()[0]));
          } else {
            log.info("Skipping copy of edge ", edge.v, "-->", edge.w, " rootId: ", rootId, " clusterId:", clusterId);
          }
        } catch (e) {
          log.error(e);
        }
      });
    }
    log.debug("Removing node", node);
    graph.removeNode(node);
  });
}, "copy");
var extractDescendants = /* @__PURE__ */ __name((id, graph) => {
  const children = graph.children(id);
  let res = [...children];
  for (const child of children) {
    parents.set(child, id);
    res = [...res, ...extractDescendants(child, graph)];
  }
  return res;
}, "extractDescendants");
var findCommonEdges = /* @__PURE__ */ __name((graph, id1, id2) => {
  const edges1 = graph.edges().filter((edge) => edge.v === id1 || edge.w === id1);
  const edges2 = graph.edges().filter((edge) => edge.v === id2 || edge.w === id2);
  const edges1Prim = edges1.map((edge) => {
    return { v: edge.v === id1 ? id2 : edge.v, w: edge.w === id1 ? id1 : edge.w };
  });
  const edges2Prim = edges2.map((edge) => {
    return { v: edge.v, w: edge.w };
  });
  const result = edges1Prim.filter((edgeIn1) => {
    return edges2Prim.some((edge) => edgeIn1.v === edge.v && edgeIn1.w === edge.w);
  });
  return result;
}, "findCommonEdges");
var findNonClusterChild = /* @__PURE__ */ __name((id, graph, clusterId) => {
  const children = graph.children(id);
  log.trace("Searching children of id ", id, children);
  if (children.length < 1) {
    return id;
  }
  let reserve;
  for (const child of children) {
    const _id = findNonClusterChild(child, graph, clusterId);
    const commonEdges = findCommonEdges(graph, clusterId, _id);
    if (_id) {
      if (commonEdges.length > 0) {
        reserve = _id;
      } else {
        return _id;
      }
    }
  }
  return reserve;
}, "findNonClusterChild");
var getAnchorId = /* @__PURE__ */ __name((id) => {
  if (!clusterDb.has(id)) {
    return id;
  }
  if (!clusterDb.get(id).externalConnections) {
    return id;
  }
  if (clusterDb.has(id)) {
    return clusterDb.get(id).id;
  }
  return id;
}, "getAnchorId");
var adjustClustersAndEdges = /* @__PURE__ */ __name((graph, depth) => {
  if (!graph || depth > 10) {
    log.debug("Opting out, no graph ");
    return;
  } else {
    log.debug("Opting in, graph ");
  }
  graph.nodes().forEach(function(id) {
    const children = graph.children(id);
    if (children.length > 0) {
      log.warn("Cluster identified", id, " Replacement id in edges: ", findNonClusterChild(id, graph, id));
      descendants.set(id, extractDescendants(id, graph));
      clusterDb.set(id, { id: findNonClusterChild(id, graph, id), clusterData: graph.node(id) });
    }
  });
  graph.nodes().forEach(function(id) {
    const children = graph.children(id);
    const edges = graph.edges();
    if (children.length > 0) {
      log.debug("Cluster identified", id, descendants);
      edges.forEach((edge) => {
        const d1 = isDescendant(edge.v, id);
        const d2 = isDescendant(edge.w, id);
        if (d1 ^ d2) {
          log.warn("Edge: ", edge, " leaves cluster ", id);
          log.warn("Descendants of XXX ", id, ": ", descendants.get(id));
          clusterDb.get(id).externalConnections = true;
        }
      });
    } else {
      log.debug("Not a cluster ", id, descendants);
    }
  });
  for (let id of clusterDb.keys()) {
    const nonClusterChild = clusterDb.get(id).id;
    const parent = graph.parent(nonClusterChild);
    if (parent !== id && clusterDb.has(parent) && !clusterDb.get(parent).externalConnections) {
      clusterDb.get(id).id = parent;
    }
  }
  graph.edges().forEach(function(e) {
    const edge = graph.edge(e);
    log.warn("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(e));
    log.warn("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(graph.edge(e)));
    let v = e.v;
    let w = e.w;
    log.warn("Fix XXX", clusterDb, "ids:", e.v, e.w, "Translating: ", clusterDb.get(e.v), " --- ", clusterDb.get(e.w));
    if (clusterDb.get(e.v) || clusterDb.get(e.w)) {
      log.warn("Fixing and trying - removing XXX", e.v, e.w, e.name);
      v = getAnchorId(e.v);
      w = getAnchorId(e.w);
      graph.removeEdge(e.v, e.w, e.name);
      if (v !== e.v) {
        const parent = graph.parent(v);
        clusterDb.get(parent).externalConnections = true;
        edge.fromCluster = e.v;
      }
      if (w !== e.w) {
        const parent = graph.parent(w);
        clusterDb.get(parent).externalConnections = true;
        edge.toCluster = e.w;
      }
      log.warn("Fix Replacing with XXX", v, w, e.name);
      graph.setEdge(v, w, edge, e.name);
    }
  });
  log.warn("Adjusted Graph", write(graph));
  extractor(graph, 0);
  log.trace(clusterDb);
}, "adjustClustersAndEdges");
var extractor = /* @__PURE__ */ __name((graph, depth) => {
  log.warn("extractor - ", depth, write(graph), graph.children("D"));
  if (depth > 10) {
    log.error("Bailing out");
    return;
  }
  let nodes = graph.nodes();
  let hasChildren = false;
  for (const node of nodes) {
    const children = graph.children(node);
    hasChildren = hasChildren || children.length > 0;
  }
  if (!hasChildren) {
    log.debug("Done, no node has children", graph.nodes());
    return;
  }
  log.debug("Nodes = ", nodes, depth);
  for (const node of nodes) {
    log.debug("Extracting node", node, clusterDb, clusterDb.has(node) && !clusterDb.get(node).externalConnections, !graph.parent(node), graph.node(node), graph.children("D"), " Depth ", depth);
    if (!clusterDb.has(node)) {
      log.debug("Not a cluster", node, depth);
    } else if (!clusterDb.get(node).externalConnections && graph.children(node) && graph.children(node).length > 0) {
      log.warn("Cluster without external connections, without a parent and with children", node, depth);
      const graphSettings = graph.graph();
      let dir = graphSettings.rankdir === "TB" ? "LR" : "TB";
      if (clusterDb.get(node)?.clusterData?.dir) {
        dir = clusterDb.get(node).clusterData.dir;
        log.warn("Fixing dir", clusterDb.get(node).clusterData.dir, dir);
      }
      const clusterGraph = new Graph({
        multigraph: true,
        compound: true
      }).setGraph({
        rankdir: dir,
        nodesep: 50,
        ranksep: 50,
        marginx: 8,
        marginy: 8
      }).setDefaultEdgeLabel(function() {
        return {};
      });
      log.warn("Old graph before copy", write(graph));
      copy(node, graph, clusterGraph, node);
      graph.setNode(node, {
        clusterNode: true,
        id: node,
        clusterData: clusterDb.get(node).clusterData,
        label: clusterDb.get(node).label,
        graph: clusterGraph
      });
      log.warn("New graph after copy node: (", node, ")", write(clusterGraph));
      log.debug("Old graph after copy", write(graph));
    } else {
      log.warn("Cluster ** ", node, " **not meeting the criteria !externalConnections:", !clusterDb.get(node).externalConnections, " no parent: ", !graph.parent(node), " children ", graph.children(node) && graph.children(node).length > 0, graph.children("D"), depth);
      log.debug(clusterDb);
    }
  }
  nodes = graph.nodes();
  log.warn("New list of nodes", nodes);
  for (const node of nodes) {
    const data = graph.node(node);
    log.warn(" Now next level", node, data);
    if (data?.clusterNode) {
      extractor(data.graph, depth + 1);
    }
  }
}, "extractor");
var sorter = /* @__PURE__ */ __name((graph, nodes) => {
  if (nodes.length === 0) {
    return [];
  }
  let result = Object.assign([], nodes);
  nodes.forEach((node) => {
    const children = graph.children(node);
    const sorted = sorter(graph, children);
    result = [...result, ...sorted];
  });
  return result;
}, "sorter");
var sortNodesByHierarchy = /* @__PURE__ */ __name((graph) => sorter(graph, graph.children()), "sortNodesByHierarchy");
var recursiveRender = /* @__PURE__ */ __name(async (_elem, graph, diagramType, id, parentCluster, siteConfig) => {
  log.warn("Graph in recursive render:XAX", write(graph), parentCluster);
  const dir = graph.graph().rankdir;
  log.trace("Dir in recursive render - dir:", dir);
  const elem = _elem.insert("g").attr("class", "root");
  if (!graph.nodes()) {
    log.info("No nodes found for", graph);
  } else {
    log.info("Recursive render XXX", graph.nodes());
  }
  if (graph.edges().length > 0) {
    log.info("Recursive edges", graph.edge(graph.edges()[0]));
  }
  const clusters = elem.insert("g").attr("class", "clusters");
  const edgePaths = elem.insert("g").attr("class", "edgePaths");
  const edgeLabels = elem.insert("g").attr("class", "edgeLabels");
  const nodes = elem.insert("g").attr("class", "nodes");
  await Promise.all(graph.nodes().map(async function(v) {
    const node = graph.node(v);
    if (parentCluster !== undefined) {
      const data = JSON.parse(JSON.stringify(parentCluster.clusterData));
      log.trace(`Setting data for parent cluster XXX
 Node.id = `, v, `
 data=`, data.height, `
Parent cluster`, parentCluster.height);
      graph.setNode(parentCluster.id, data);
      if (!graph.parent(v)) {
        log.trace("Setting parent", v, parentCluster.id);
        graph.setParent(v, parentCluster.id, data);
      }
    }
    log.info("(Insert) Node XXX" + v + ": " + JSON.stringify(graph.node(v)));
    if (node?.clusterNode) {
      log.info("Cluster identified XBX", v, node.width, graph.node(v));
      const { ranksep, nodesep } = graph.graph();
      node.graph.setGraph({
        ...node.graph.graph(),
        ranksep: ranksep + 25,
        nodesep
      });
      const o = await recursiveRender(nodes, node.graph, diagramType, id, graph.node(v), siteConfig);
      const newEl = o.elem;
      updateNodeBounds(node, newEl);
      node.diff = o.diff || 0;
      log.info("New compound node after recursive render XAX", v, "width", node.width, "height", node.height);
      setNodeElem(newEl, node);
    } else {
      if (graph.children(v).length > 0) {
        log.trace("Cluster - the non recursive path XBX", v, node.id, node, node.width, "Graph:", graph);
        log.trace(findNonClusterChild(node.id, graph));
        clusterDb.set(node.id, { id: findNonClusterChild(node.id, graph), node });
      } else {
        log.trace("Node - the non recursive path XAX", v, nodes, graph.node(v), dir);
        await insertNode(nodes, graph.node(v), { config: siteConfig, dir });
      }
    }
  }));
  const processEdges = /* @__PURE__ */ __name(async () => {
    const edgePromises = graph.edges().map(async function(e) {
      const edge = graph.edge(e.v, e.w, e.name);
      log.info("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(e));
      log.info("Edge " + e.v + " -> " + e.w + ": ", e, " ", JSON.stringify(graph.edge(e)));
      log.info("Fix", clusterDb, "ids:", e.v, e.w, "Translating: ", clusterDb.get(e.v), clusterDb.get(e.w));
      await insertEdgeLabel(edgeLabels, edge);
    });
    await Promise.all(edgePromises);
  }, "processEdges");
  await processEdges();
  log.info("Graph before layout:", JSON.stringify(write(graph)));
  log.info("############################################# XXX");
  log.info("###                Layout                 ### XXX");
  log.info("############################################# XXX");
  layout(graph);
  log.info("Graph after layout:", JSON.stringify(write(graph)));
  let diff = 0;
  let { subGraphTitleTotalMargin } = getSubGraphTitleMargins(siteConfig);
  await Promise.all(sortNodesByHierarchy(graph).map(async function(v) {
    const node = graph.node(v);
    log.info("Position XBX => " + v + ": (" + node.x, "," + node.y, ") width: ", node.width, " height: ", node.height);
    if (node?.clusterNode) {
      node.y += subGraphTitleTotalMargin;
      log.info("A tainted cluster node XBX1", v, node.id, node.width, node.height, node.x, node.y, graph.parent(v));
      clusterDb.get(node.id).node = node;
      positionNode(node);
    } else {
      if (graph.children(v).length > 0) {
        log.info("A pure cluster node XBX1", v, node.id, node.x, node.y, node.width, node.height, graph.parent(v));
        node.height += subGraphTitleTotalMargin;
        graph.node(node.parentId);
        const halfPadding = node?.padding / 2 || 0;
        const labelHeight = node?.labelBBox?.height || 0;
        const offsetY = labelHeight - halfPadding || 0;
        log.debug("OffsetY", offsetY, "labelHeight", labelHeight, "halfPadding", halfPadding);
        await insertCluster(clusters, node);
        clusterDb.get(node.id).node = node;
      } else {
        const parent = graph.node(node.parentId);
        node.y += subGraphTitleTotalMargin / 2;
        log.info("A regular node XBX1 - using the padding", node.id, "parent", node.parentId, node.width, node.height, node.x, node.y, "offsetY", node.offsetY, "parent", parent, parent?.offsetY, node);
        positionNode(node);
      }
    }
  }));
  graph.edges().forEach(function(e) {
    const edge = graph.edge(e);
    log.info("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(edge), edge);
    edge.points.forEach((point) => point.y += subGraphTitleTotalMargin / 2);
    const startNode = graph.node(e.v);
    var endNode = graph.node(e.w);
    const paths = insertEdge(edgePaths, edge, clusterDb, diagramType, startNode, endNode, id);
    positionEdgeLabel(edge, paths);
  });
  graph.nodes().forEach(function(v) {
    const n = graph.node(v);
    log.info(v, n.type, n.diff);
    if (n.isGroup) {
      diff = n.diff;
    }
  });
  log.warn("Returning from recursive render XAX", elem, diff);
  return { elem, diff };
}, "recursiveRender");
var render = /* @__PURE__ */ __name(async (data4Layout, svg) => {
  const graph = new Graph({
    multigraph: true,
    compound: true
  }).setGraph({
    rankdir: data4Layout.direction,
    nodesep: data4Layout.config?.nodeSpacing || data4Layout.config?.flowchart?.nodeSpacing || data4Layout.nodeSpacing,
    ranksep: data4Layout.config?.rankSpacing || data4Layout.config?.flowchart?.rankSpacing || data4Layout.rankSpacing,
    marginx: 8,
    marginy: 8
  }).setDefaultEdgeLabel(function() {
    return {};
  });
  const element = svg.select("g");
  markers_default(element, data4Layout.markers, data4Layout.type, data4Layout.diagramId);
  clear2();
  clear3();
  clear();
  clear4();
  data4Layout.nodes.forEach((node) => {
    graph.setNode(node.id, { ...node });
    if (node.parentId) {
      graph.setParent(node.id, node.parentId);
    }
  });
  log.debug("Edges:", data4Layout.edges);
  data4Layout.edges.forEach((edge) => {
    if (edge.start === edge.end) {
      const nodeId = edge.start;
      const specialId1 = nodeId + "---" + nodeId + "---1";
      const specialId2 = nodeId + "---" + nodeId + "---2";
      const node = graph.node(nodeId);
      graph.setNode(specialId1, {
        domId: specialId1,
        id: specialId1,
        parentId: node.parentId,
        labelStyle: "",
        label: "",
        padding: 0,
        shape: "labelRect",
        style: "",
        width: 10,
        height: 10
      });
      graph.setParent(specialId1, node.parentId);
      graph.setNode(specialId2, {
        domId: specialId2,
        id: specialId2,
        parentId: node.parentId,
        labelStyle: "",
        padding: 0,
        shape: "labelRect",
        label: "",
        style: "",
        width: 10,
        height: 10
      });
      graph.setParent(specialId2, node.parentId);
      const edge1 = structuredClone(edge);
      const edgeMid = structuredClone(edge);
      const edge2 = structuredClone(edge);
      edge1.label = "";
      edge1.arrowTypeEnd = "none";
      edge1.endLabelLeft = "";
      edge1.endLabelRight = "";
      edge1.startLabelLeft = "";
      edge1.id = nodeId + "-cyclic-special-1";
      edgeMid.startLabelRight = "";
      edgeMid.startLabelLeft = "";
      edgeMid.endLabelLeft = "";
      edgeMid.endLabelRight = "";
      edgeMid.arrowTypeStart = "none";
      edgeMid.arrowTypeEnd = "none";
      edgeMid.id = nodeId + "-cyclic-special-mid";
      edge2.label = "";
      edge2.startLabelRight = "";
      edge2.startLabelLeft = "";
      edge2.arrowTypeStart = "none";
      if (node.isGroup) {
        edge1.fromCluster = nodeId;
        edge2.toCluster = nodeId;
      }
      edge2.id = nodeId + "-cyclic-special-2";
      edge2.arrowTypeStart = "none";
      graph.setEdge(nodeId, specialId1, edge1, nodeId + "-cyclic-special-0");
      graph.setEdge(specialId1, specialId2, edgeMid, nodeId + "-cyclic-special-1");
      graph.setEdge(specialId2, nodeId, edge2, nodeId + "-cyc<lic-special-2");
    } else {
      graph.setEdge(edge.start, edge.end, { ...edge }, edge.id);
    }
  });
  log.warn("Graph at first:", JSON.stringify(write(graph)));
  adjustClustersAndEdges(graph);
  log.warn("Graph after XAX:", JSON.stringify(write(graph)));
  const siteConfig = getConfig2();
  await recursiveRender(element, graph, data4Layout.type, data4Layout.diagramId, undefined, siteConfig);
}, "render");
export {
  render
};

//# debugId=1D04D218BF9D01F564756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2RhZ3JlLWQzLWVzL3NyYy9ncmFwaGxpYi9qc29uLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9tZXJtYWlkL2Rpc3QvY2h1bmtzL21lcm1haWQuY29yZS9kYWdyZS1CTTQySERBRy5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gtZXMnO1xuaW1wb3J0IHsgR3JhcGggfSBmcm9tICcuL2dyYXBoLmpzJztcblxuLyoqXG4gKiBAaW1wb3J0IHsgTm9kZUlELCBFZGdlT2JqLCBHcmFwaE9wdGlvbnMgfSBmcm9tICcuL2dyYXBoLmpzJztcbiAqL1xuXG5leHBvcnQgeyB3cml0ZSwgcmVhZCB9O1xuXG4vKipcbiAqIEB0ZW1wbGF0ZSBbR3JhcGhMYWJlbD1hbnldIC0gTGFiZWwgb2YgdGhlIGdyYXBoLlxuICogQHRlbXBsYXRlIFtOb2RlTGFiZWw9YW55XSAtIExhYmVsIG9mIGEgbm9kZS5cbiAqIEB0ZW1wbGF0ZSBbRWRnZUxhYmVsPWFueV0gLSBMYWJlbCBvZiBhbiBlZGdlLlxuICpcbiAqIEB0eXBlZGVmIHtvYmplY3R9IEdyYXBoSlNPTlxuICogQHByb3BlcnR5IHtSZXF1aXJlZDxHcmFwaE9wdGlvbnM+fSBvcHRpb25zIC0gVGhlIG9wdGlvbnMgdXNlZCB0byBjcmVhdGUgdGhlIGdyYXBoLlxuICogQHByb3BlcnR5IHtBcnJheTx7IHY6IE5vZGVJRDsgdmFsdWU/OiBOb2RlTGFiZWw7IHBhcmVudD86IE5vZGVJRCB9Pn0gbm9kZXMgLSBUaGUgbm9kZXMgaW4gdGhlIGdyYXBoLlxuICogQHByb3BlcnR5IHtBcnJheTxFZGdlT2JqICYgeyB2YWx1ZT86IEVkZ2VMYWJlbCB9Pn0gZWRnZXMgLSBUaGUgZWRnZXMgaW4gdGhlIGdyYXBoLlxuICogQHByb3BlcnR5IHtHcmFwaExhYmVsfSBbdmFsdWVdIC0gVGhlIGdyYXBoJ3MgdmFsdWUsIGlmIGFueS5cbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBncmFwaCB0aGF0IGNhbiBiZSBzZXJpYWxpemVkIHRvIGFcbiAqIHN0cmluZyB3aXRoXG4gKiBbSlNPTi5zdHJpbmdpZnldKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0pTT04vc3RyaW5naWZ5KS5cbiAqIFRoZSBncmFwaCBjYW4gbGF0ZXIgYmUgcmVzdG9yZWQgdXNpbmcge0BsaW5rIHJlYWR9LlxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogYGBganNcbiAqIHZhciBnID0gbmV3IGdyYXBobGliLkdyYXBoKCk7XG4gKiBnLnNldE5vZGUoXCJhXCIsIHsgbGFiZWw6IFwibm9kZSBhXCIgfSk7XG4gKiBnLnNldE5vZGUoXCJiXCIsIHsgbGFiZWw6IFwibm9kZSBiXCIgfSk7XG4gKiBnLnNldEVkZ2UoXCJhXCIsIFwiYlwiLCB7IGxhYmVsOiBcImVkZ2UgYS0+YlwiIH0pO1xuICogZ3JhcGhsaWIuanNvbi53cml0ZShnKTtcbiAqIC8vIFJldHVybnMgdGhlIG9iamVjdDpcbiAqIC8vXG4gKiAvLyB7XG4gKiAvLyAgIFwib3B0aW9uc1wiOiB7XG4gKiAvLyAgICAgXCJkaXJlY3RlZFwiOiB0cnVlLFxuICogLy8gICAgIFwibXVsdGlncmFwaFwiOiBmYWxzZSxcbiAqIC8vICAgICBcImNvbXBvdW5kXCI6IGZhbHNlXG4gKiAvLyAgIH0sXG4gKiAvLyAgIFwibm9kZXNcIjogW1xuICogLy8gICAgIHsgXCJ2XCI6IFwiYVwiLCBcInZhbHVlXCI6IHsgXCJsYWJlbFwiOiBcIm5vZGUgYVwiIH0gfSxcbiAqIC8vICAgICB7IFwidlwiOiBcImJcIiwgXCJ2YWx1ZVwiOiB7IFwibGFiZWxcIjogXCJub2RlIGJcIiB9IH1cbiAqIC8vICAgXSxcbiAqIC8vICAgXCJlZGdlc1wiOiBbXG4gKiAvLyAgICAgeyBcInZcIjogXCJhXCIsIFwid1wiOiBcImJcIiwgXCJ2YWx1ZVwiOiB7IFwibGFiZWxcIjogXCJlZGdlIGEtPmJcIiB9IH1cbiAqIC8vICAgXVxuICogLy8gfVxuICogYGBgXG4gKlxuICogQHRlbXBsYXRlIFtHcmFwaExhYmVsPWFueV0gLSBMYWJlbCBvZiB0aGUgZ3JhcGguXG4gKiBAdGVtcGxhdGUgW05vZGVMYWJlbD1hbnldIC0gTGFiZWwgb2YgYSBub2RlLlxuICogQHRlbXBsYXRlIFtFZGdlTGFiZWw9YW55XSAtIExhYmVsIG9mIGFuIGVkZ2UuXG4gKiBAcGFyYW0ge0dyYXBoPEdyYXBoTGFiZWwsIE5vZGVMYWJlbCwgRWRnZUxhYmVsPn0gZyAtIFRoZSBncmFwaCB0byBzZXJpYWxpemUuXG4gKiBAcmV0dXJucyB7R3JhcGhKU09OPEdyYXBoTGFiZWwsIE5vZGVMYWJlbCwgRWRnZUxhYmVsPn0gVGhlIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGdyYXBoLlxuICovXG5mdW5jdGlvbiB3cml0ZShnKSB7XG4gIC8qKiBAdHlwZSB7R3JhcGhKU09OPEdyYXBoTGFiZWwsIE5vZGVMYWJlbCwgRWRnZUxhYmVsPn0gKi9cbiAgdmFyIGpzb24gPSB7XG4gICAgb3B0aW9uczoge1xuICAgICAgZGlyZWN0ZWQ6IGcuaXNEaXJlY3RlZCgpLFxuICAgICAgbXVsdGlncmFwaDogZy5pc011bHRpZ3JhcGgoKSxcbiAgICAgIGNvbXBvdW5kOiBnLmlzQ29tcG91bmQoKSxcbiAgICB9LFxuICAgIG5vZGVzOiB3cml0ZU5vZGVzKGcpLFxuICAgIGVkZ2VzOiB3cml0ZUVkZ2VzKGcpLFxuICB9O1xuICBpZiAoIV8uaXNVbmRlZmluZWQoZy5ncmFwaCgpKSkge1xuICAgIGpzb24udmFsdWUgPSBfLmNsb25lKGcuZ3JhcGgoKSk7XG4gIH1cbiAgcmV0dXJuIGpzb247XG59XG5cbi8qKlxuICogQHRlbXBsYXRlIE5vZGVMYWJlbCAtIExhYmVsIG9mIGEgbm9kZS5cbiAqXG4gKiBAcGFyYW0ge0dyYXBoPHVua25vd24sIE5vZGVMYWJlbCwgdW5rbm93bj59IGcgLSBUaGUgZ3JhcGggdG8gc2VyaWFsaXplLlxuICogQHJldHVybnMge0FycmF5PHsgdjogTm9kZUlEOyB2YWx1ZT86IE5vZGVMYWJlbDsgcGFyZW50PzogTm9kZUlEIH0+fSBUaGUgbm9kZXMgaW4gdGhlIGdyYXBoLlxuICovXG5mdW5jdGlvbiB3cml0ZU5vZGVzKGcpIHtcbiAgcmV0dXJuIF8ubWFwKGcubm9kZXMoKSwgZnVuY3Rpb24gKHYpIHtcbiAgICB2YXIgbm9kZVZhbHVlID0gZy5ub2RlKHYpO1xuICAgIHZhciBwYXJlbnQgPSBnLnBhcmVudCh2KTtcbiAgICAvKiogQHR5cGUge3sgdjogTm9kZUlEOyB2YWx1ZT86IE5vZGVMYWJlbDsgcGFyZW50PzogTm9kZUlEIH19ICovXG4gICAgdmFyIG5vZGUgPSB7IHY6IHYgfTtcbiAgICBpZiAoIV8uaXNVbmRlZmluZWQobm9kZVZhbHVlKSkge1xuICAgICAgbm9kZS52YWx1ZSA9IG5vZGVWYWx1ZTtcbiAgICB9XG4gICAgaWYgKCFfLmlzVW5kZWZpbmVkKHBhcmVudCkpIHtcbiAgICAgIG5vZGUucGFyZW50ID0gcGFyZW50O1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbiAgfSk7XG59XG5cbi8qKlxuICogQHRlbXBsYXRlIEVkZ2VMYWJlbCAtIExhYmVsIG9mIGEgbm9kZS5cbiAqXG4gKiBAcGFyYW0ge0dyYXBoPHVua25vd24sIHVua25vd24sIEVkZ2VMYWJlbD59IGcgLSBUaGUgZ3JhcGggdG8gc2VyaWFsaXplLlxuICogQHJldHVybnMge0FycmF5PEVkZ2VPYmogJiB7IHZhbHVlPzogRWRnZUxhYmVsIH0+fSBUaGUgZWRnZXMgaW4gdGhlIGdyYXBoLlxuICovXG5mdW5jdGlvbiB3cml0ZUVkZ2VzKGcpIHtcbiAgcmV0dXJuIF8ubWFwKGcuZWRnZXMoKSwgZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgZWRnZVZhbHVlID0gZy5lZGdlKGUpO1xuICAgIC8qKiBAdHlwZSB7RWRnZU9iaiAmIHsgdmFsdWU/OiBFZGdlTGFiZWwgfX0gKi9cbiAgICB2YXIgZWRnZSA9IHsgdjogZS52LCB3OiBlLncgfTtcbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoZS5uYW1lKSkge1xuICAgICAgZWRnZS5uYW1lID0gZS5uYW1lO1xuICAgIH1cbiAgICBpZiAoIV8uaXNVbmRlZmluZWQoZWRnZVZhbHVlKSkge1xuICAgICAgZWRnZS52YWx1ZSA9IGVkZ2VWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGVkZ2U7XG4gIH0pO1xufVxuXG4vKipcbiAqIFRha2VzIEpTT04gYXMgaW5wdXQgYW5kIHJldHVybnMgdGhlIGdyYXBoIHJlcHJlc2VudGF0aW9uLlxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogRm9yIGV4YW1wbGUsIGlmIHdlIGhhdmUgc2VyaWFsaXplZCB0aGUgZ3JhcGggaW4ge0BsaW5rIHdyaXRlfVxuICogdG8gYSBzdHJpbmcgbmFtZWQgYHN0cmAsIHdlIGNhbiByZXN0b3JlIGl0IHRvIGEgZ3JhcGggYXMgZm9sbG93czpcbiAqXG4gKiBgYGBqc1xuICogdmFyIGcyID0gZ3JhcGhsaWIuanNvbi5yZWFkKEpTT04ucGFyc2Uoc3RyKSk7XG4gKiAvLyBvciwgaW4gb3JkZXIgdG8gY29weSB0aGUgZ3JhcGhcbiAqIHZhciBnMyA9IGdyYXBobGliLmpzb24ucmVhZChncmFwaGxpYi5qc29uLndyaXRlKGcpKVxuICpcbiAqIGcyLm5vZGVzKCk7XG4gKiAvLyBbJ2EnLCAnYiddXG4gKiBnMi5lZGdlcygpXG4gKiAvLyBbIHsgdjogJ2EnLCB3OiAnYicgfSBdXG4gKiBgYGBcbiAqXG4gKiBAdGVtcGxhdGUgW0dyYXBoTGFiZWw9YW55XSAtIExhYmVsIG9mIHRoZSBncmFwaC5cbiAqIEB0ZW1wbGF0ZSBbTm9kZUxhYmVsPWFueV0gLSBMYWJlbCBvZiBhIG5vZGUuXG4gKiBAdGVtcGxhdGUgW0VkZ2VMYWJlbD1hbnldIC0gTGFiZWwgb2YgYW4gZWRnZS5cbiAqIEBwYXJhbSB7R3JhcGhKU09OPEdyYXBoTGFiZWwsIE5vZGVMYWJlbCwgRWRnZUxhYmVsPn0ganNvbiAtIFRoZSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBncmFwaC5cbiAqIEByZXR1cm5zIHtHcmFwaDxHcmFwaExhYmVsLCBOb2RlTGFiZWwsIEVkZ2VMYWJlbD59IFRoZSByZXN0b3JlZCBncmFwaC5cbiAqL1xuZnVuY3Rpb24gcmVhZChqc29uKSB7XG4gIHZhciBnID0gbmV3IEdyYXBoKGpzb24ub3B0aW9ucykuc2V0R3JhcGgoanNvbi52YWx1ZSk7XG4gIF8uZWFjaChqc29uLm5vZGVzLCBmdW5jdGlvbiAoZW50cnkpIHtcbiAgICBnLnNldE5vZGUoZW50cnkudiwgZW50cnkudmFsdWUpO1xuICAgIGlmIChlbnRyeS5wYXJlbnQpIHtcbiAgICAgIGcuc2V0UGFyZW50KGVudHJ5LnYsIGVudHJ5LnBhcmVudCk7XG4gICAgfVxuICB9KTtcbiAgXy5lYWNoKGpzb24uZWRnZXMsIGZ1bmN0aW9uIChlbnRyeSkge1xuICAgIGcuc2V0RWRnZSh7IHY6IGVudHJ5LnYsIHc6IGVudHJ5LncsIG5hbWU6IGVudHJ5Lm5hbWUgfSwgZW50cnkudmFsdWUpO1xuICB9KTtcbiAgcmV0dXJuIGc7XG59XG4iLAogICAgImltcG9ydCB7XG4gIGNsZWFyIGFzIGNsZWFyMixcbiAgaW5zZXJ0RWRnZSxcbiAgaW5zZXJ0RWRnZUxhYmVsLFxuICBtYXJrZXJzX2RlZmF1bHQsXG4gIHBvc2l0aW9uRWRnZUxhYmVsXG59IGZyb20gXCIuL2NodW5rLUtTQ1M1TjZBLm1qc1wiO1xuaW1wb3J0IFwiLi9jaHVuay1CU0pQN0NCUC5tanNcIjtcbmltcG9ydCB7XG4gIGNsZWFyLFxuICBjbGVhcjIgYXMgY2xlYXIzLFxuICBpbnNlcnRDbHVzdGVyLFxuICBpbnNlcnROb2RlLFxuICBwb3NpdGlvbk5vZGUsXG4gIHNldE5vZGVFbGVtLFxuICB1cGRhdGVOb2RlQm91bmRzXG59IGZyb20gXCIuL2NodW5rLTNPUElGR0RFLm1qc1wiO1xuaW1wb3J0IHtcbiAgZ2V0U3ViR3JhcGhUaXRsZU1hcmdpbnNcbn0gZnJvbSBcIi4vY2h1bmstTDVaVExEV1YubWpzXCI7XG5pbXBvcnQgXCIuL2NodW5rLU5aSzJEN0dVLm1qc1wiO1xuaW1wb3J0IFwiLi9jaHVuay1PNUNCRUw2Ty5tanNcIjtcbmltcG9ydCBcIi4vY2h1bmstNVpRWUhYS1UubWpzXCI7XG5pbXBvcnQge1xuICBnZXRDb25maWcyIGFzIGdldENvbmZpZ1xufSBmcm9tIFwiLi9jaHVuay1DU0NJSEs3US5tanNcIjtcbmltcG9ydCB7XG4gIF9fbmFtZSxcbiAgbG9nXG59IGZyb20gXCIuL2NodW5rLUFHSFJCNEpGLm1qc1wiO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvbGF5b3V0LWFsZ29yaXRobXMvZGFncmUvaW5kZXguanNcbmltcG9ydCB7IGxheW91dCBhcyBkYWdyZUxheW91dCB9IGZyb20gXCJkYWdyZS1kMy1lcy9zcmMvZGFncmUvaW5kZXguanNcIjtcbmltcG9ydCAqIGFzIGdyYXBobGliSnNvbjIgZnJvbSBcImRhZ3JlLWQzLWVzL3NyYy9ncmFwaGxpYi9qc29uLmpzXCI7XG5pbXBvcnQgKiBhcyBncmFwaGxpYjIgZnJvbSBcImRhZ3JlLWQzLWVzL3NyYy9ncmFwaGxpYi9pbmRleC5qc1wiO1xuXG4vLyBzcmMvcmVuZGVyaW5nLXV0aWwvbGF5b3V0LWFsZ29yaXRobXMvZGFncmUvbWVybWFpZC1ncmFwaGxpYi5qc1xuaW1wb3J0ICogYXMgZ3JhcGhsaWIgZnJvbSBcImRhZ3JlLWQzLWVzL3NyYy9ncmFwaGxpYi9pbmRleC5qc1wiO1xuaW1wb3J0ICogYXMgZ3JhcGhsaWJKc29uIGZyb20gXCJkYWdyZS1kMy1lcy9zcmMvZ3JhcGhsaWIvanNvbi5qc1wiO1xudmFyIGNsdXN0ZXJEYiA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG52YXIgZGVzY2VuZGFudHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xudmFyIHBhcmVudHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xudmFyIGNsZWFyNCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKCkgPT4ge1xuICBkZXNjZW5kYW50cy5jbGVhcigpO1xuICBwYXJlbnRzLmNsZWFyKCk7XG4gIGNsdXN0ZXJEYi5jbGVhcigpO1xufSwgXCJjbGVhclwiKTtcbnZhciBpc0Rlc2NlbmRhbnQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChpZCwgYW5jZXN0b3JJZCkgPT4ge1xuICBjb25zdCBhbmNlc3RvckRlc2NlbmRhbnRzID0gZGVzY2VuZGFudHMuZ2V0KGFuY2VzdG9ySWQpIHx8IFtdO1xuICBsb2cudHJhY2UoXCJJbiBpc0Rlc2NlbmRhbnRcIiwgYW5jZXN0b3JJZCwgXCIgXCIsIGlkLCBcIiA9IFwiLCBhbmNlc3RvckRlc2NlbmRhbnRzLmluY2x1ZGVzKGlkKSk7XG4gIHJldHVybiBhbmNlc3RvckRlc2NlbmRhbnRzLmluY2x1ZGVzKGlkKTtcbn0sIFwiaXNEZXNjZW5kYW50XCIpO1xudmFyIGVkZ2VJbkNsdXN0ZXIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChlZGdlLCBjbHVzdGVySWQpID0+IHtcbiAgY29uc3QgY2x1c3RlckRlc2NlbmRhbnRzID0gZGVzY2VuZGFudHMuZ2V0KGNsdXN0ZXJJZCkgfHwgW107XG4gIGxvZy5pbmZvKFwiRGVzY2VuZGFudHMgb2YgXCIsIGNsdXN0ZXJJZCwgXCIgaXMgXCIsIGNsdXN0ZXJEZXNjZW5kYW50cyk7XG4gIGxvZy5pbmZvKFwiRWRnZSBpcyBcIiwgZWRnZSk7XG4gIGlmIChlZGdlLnYgPT09IGNsdXN0ZXJJZCB8fCBlZGdlLncgPT09IGNsdXN0ZXJJZCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAoIWNsdXN0ZXJEZXNjZW5kYW50cykge1xuICAgIGxvZy5kZWJ1ZyhcIlRpbHQsIFwiLCBjbHVzdGVySWQsIFwiLG5vdCBpbiBkZXNjZW5kYW50c1wiKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGNsdXN0ZXJEZXNjZW5kYW50cy5pbmNsdWRlcyhlZGdlLnYpIHx8IGlzRGVzY2VuZGFudChlZGdlLnYsIGNsdXN0ZXJJZCkgfHwgaXNEZXNjZW5kYW50KGVkZ2UudywgY2x1c3RlcklkKSB8fCBjbHVzdGVyRGVzY2VuZGFudHMuaW5jbHVkZXMoZWRnZS53KTtcbn0sIFwiZWRnZUluQ2x1c3RlclwiKTtcbnZhciBjb3B5ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoY2x1c3RlcklkLCBncmFwaCwgbmV3R3JhcGgsIHJvb3RJZCkgPT4ge1xuICBsb2cud2FybihcbiAgICBcIkNvcHlpbmcgY2hpbGRyZW4gb2YgXCIsXG4gICAgY2x1c3RlcklkLFxuICAgIFwicm9vdFwiLFxuICAgIHJvb3RJZCxcbiAgICBcImRhdGFcIixcbiAgICBncmFwaC5ub2RlKGNsdXN0ZXJJZCksXG4gICAgcm9vdElkXG4gICk7XG4gIGNvbnN0IG5vZGVzID0gZ3JhcGguY2hpbGRyZW4oY2x1c3RlcklkKSB8fCBbXTtcbiAgaWYgKGNsdXN0ZXJJZCAhPT0gcm9vdElkKSB7XG4gICAgbm9kZXMucHVzaChjbHVzdGVySWQpO1xuICB9XG4gIGxvZy53YXJuKFwiQ29weWluZyAobm9kZXMpIGNsdXN0ZXJJZFwiLCBjbHVzdGVySWQsIFwibm9kZXNcIiwgbm9kZXMpO1xuICBub2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgaWYgKGdyYXBoLmNoaWxkcmVuKG5vZGUpLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvcHkobm9kZSwgZ3JhcGgsIG5ld0dyYXBoLCByb290SWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBkYXRhID0gZ3JhcGgubm9kZShub2RlKTtcbiAgICAgIGxvZy5pbmZvKFwiY3AgXCIsIG5vZGUsIFwiIHRvIFwiLCByb290SWQsIFwiIHdpdGggcGFyZW50IFwiLCBjbHVzdGVySWQpO1xuICAgICAgbmV3R3JhcGguc2V0Tm9kZShub2RlLCBkYXRhKTtcbiAgICAgIGlmIChyb290SWQgIT09IGdyYXBoLnBhcmVudChub2RlKSkge1xuICAgICAgICBsb2cud2FybihcIlNldHRpbmcgcGFyZW50XCIsIG5vZGUsIGdyYXBoLnBhcmVudChub2RlKSk7XG4gICAgICAgIG5ld0dyYXBoLnNldFBhcmVudChub2RlLCBncmFwaC5wYXJlbnQobm9kZSkpO1xuICAgICAgfVxuICAgICAgaWYgKGNsdXN0ZXJJZCAhPT0gcm9vdElkICYmIG5vZGUgIT09IGNsdXN0ZXJJZCkge1xuICAgICAgICBsb2cuZGVidWcoXCJTZXR0aW5nIHBhcmVudFwiLCBub2RlLCBjbHVzdGVySWQpO1xuICAgICAgICBuZXdHcmFwaC5zZXRQYXJlbnQobm9kZSwgY2x1c3RlcklkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZy5pbmZvKFwiSW4gY29weSBcIiwgY2x1c3RlcklkLCBcInJvb3RcIiwgcm9vdElkLCBcImRhdGFcIiwgZ3JhcGgubm9kZShjbHVzdGVySWQpLCByb290SWQpO1xuICAgICAgICBsb2cuZGVidWcoXG4gICAgICAgICAgXCJOb3QgU2V0dGluZyBwYXJlbnQgZm9yIG5vZGU9XCIsXG4gICAgICAgICAgbm9kZSxcbiAgICAgICAgICBcImNsdXN0ZXIhPT1yb290SWRcIixcbiAgICAgICAgICBjbHVzdGVySWQgIT09IHJvb3RJZCxcbiAgICAgICAgICBcIm5vZGUhPT1jbHVzdGVySWRcIixcbiAgICAgICAgICBub2RlICE9PSBjbHVzdGVySWRcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVkZ2VzID0gZ3JhcGguZWRnZXMobm9kZSk7XG4gICAgICBsb2cuZGVidWcoXCJDb3B5aW5nIEVkZ2VzXCIsIGVkZ2VzKTtcbiAgICAgIGVkZ2VzLmZvckVhY2goKGVkZ2UpID0+IHtcbiAgICAgICAgbG9nLmluZm8oXCJFZGdlXCIsIGVkZ2UpO1xuICAgICAgICBjb25zdCBkYXRhMiA9IGdyYXBoLmVkZ2UoZWRnZS52LCBlZGdlLncsIGVkZ2UubmFtZSk7XG4gICAgICAgIGxvZy5pbmZvKFwiRWRnZSBkYXRhXCIsIGRhdGEyLCByb290SWQpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChlZGdlSW5DbHVzdGVyKGVkZ2UsIHJvb3RJZCkpIHtcbiAgICAgICAgICAgIGxvZy5pbmZvKFwiQ29weWluZyBhcyBcIiwgZWRnZS52LCBlZGdlLncsIGRhdGEyLCBlZGdlLm5hbWUpO1xuICAgICAgICAgICAgbmV3R3JhcGguc2V0RWRnZShlZGdlLnYsIGVkZ2UudywgZGF0YTIsIGVkZ2UubmFtZSk7XG4gICAgICAgICAgICBsb2cuaW5mbyhcIm5ld0dyYXBoIGVkZ2VzIFwiLCBuZXdHcmFwaC5lZGdlcygpLCBuZXdHcmFwaC5lZGdlKG5ld0dyYXBoLmVkZ2VzKClbMF0pKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9nLmluZm8oXG4gICAgICAgICAgICAgIFwiU2tpcHBpbmcgY29weSBvZiBlZGdlIFwiLFxuICAgICAgICAgICAgICBlZGdlLnYsXG4gICAgICAgICAgICAgIFwiLS0+XCIsXG4gICAgICAgICAgICAgIGVkZ2UudyxcbiAgICAgICAgICAgICAgXCIgcm9vdElkOiBcIixcbiAgICAgICAgICAgICAgcm9vdElkLFxuICAgICAgICAgICAgICBcIiBjbHVzdGVySWQ6XCIsXG4gICAgICAgICAgICAgIGNsdXN0ZXJJZFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBsb2cuZXJyb3IoZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBsb2cuZGVidWcoXCJSZW1vdmluZyBub2RlXCIsIG5vZGUpO1xuICAgIGdyYXBoLnJlbW92ZU5vZGUobm9kZSk7XG4gIH0pO1xufSwgXCJjb3B5XCIpO1xudmFyIGV4dHJhY3REZXNjZW5kYW50cyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGlkLCBncmFwaCkgPT4ge1xuICBjb25zdCBjaGlsZHJlbiA9IGdyYXBoLmNoaWxkcmVuKGlkKTtcbiAgbGV0IHJlcyA9IFsuLi5jaGlsZHJlbl07XG4gIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHtcbiAgICBwYXJlbnRzLnNldChjaGlsZCwgaWQpO1xuICAgIHJlcyA9IFsuLi5yZXMsIC4uLmV4dHJhY3REZXNjZW5kYW50cyhjaGlsZCwgZ3JhcGgpXTtcbiAgfVxuICByZXR1cm4gcmVzO1xufSwgXCJleHRyYWN0RGVzY2VuZGFudHNcIik7XG52YXIgZmluZENvbW1vbkVkZ2VzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZ3JhcGgsIGlkMSwgaWQyKSA9PiB7XG4gIGNvbnN0IGVkZ2VzMSA9IGdyYXBoLmVkZ2VzKCkuZmlsdGVyKChlZGdlKSA9PiBlZGdlLnYgPT09IGlkMSB8fCBlZGdlLncgPT09IGlkMSk7XG4gIGNvbnN0IGVkZ2VzMiA9IGdyYXBoLmVkZ2VzKCkuZmlsdGVyKChlZGdlKSA9PiBlZGdlLnYgPT09IGlkMiB8fCBlZGdlLncgPT09IGlkMik7XG4gIGNvbnN0IGVkZ2VzMVByaW0gPSBlZGdlczEubWFwKChlZGdlKSA9PiB7XG4gICAgcmV0dXJuIHsgdjogZWRnZS52ID09PSBpZDEgPyBpZDIgOiBlZGdlLnYsIHc6IGVkZ2UudyA9PT0gaWQxID8gaWQxIDogZWRnZS53IH07XG4gIH0pO1xuICBjb25zdCBlZGdlczJQcmltID0gZWRnZXMyLm1hcCgoZWRnZSkgPT4ge1xuICAgIHJldHVybiB7IHY6IGVkZ2UudiwgdzogZWRnZS53IH07XG4gIH0pO1xuICBjb25zdCByZXN1bHQgPSBlZGdlczFQcmltLmZpbHRlcigoZWRnZUluMSkgPT4ge1xuICAgIHJldHVybiBlZGdlczJQcmltLnNvbWUoKGVkZ2UpID0+IGVkZ2VJbjEudiA9PT0gZWRnZS52ICYmIGVkZ2VJbjEudyA9PT0gZWRnZS53KTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59LCBcImZpbmRDb21tb25FZGdlc1wiKTtcbnZhciBmaW5kTm9uQ2x1c3RlckNoaWxkID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoaWQsIGdyYXBoLCBjbHVzdGVySWQpID0+IHtcbiAgY29uc3QgY2hpbGRyZW4gPSBncmFwaC5jaGlsZHJlbihpZCk7XG4gIGxvZy50cmFjZShcIlNlYXJjaGluZyBjaGlsZHJlbiBvZiBpZCBcIiwgaWQsIGNoaWxkcmVuKTtcbiAgaWYgKGNoaWxkcmVuLmxlbmd0aCA8IDEpIHtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgbGV0IHJlc2VydmU7XG4gIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHtcbiAgICBjb25zdCBfaWQgPSBmaW5kTm9uQ2x1c3RlckNoaWxkKGNoaWxkLCBncmFwaCwgY2x1c3RlcklkKTtcbiAgICBjb25zdCBjb21tb25FZGdlcyA9IGZpbmRDb21tb25FZGdlcyhncmFwaCwgY2x1c3RlcklkLCBfaWQpO1xuICAgIGlmIChfaWQpIHtcbiAgICAgIGlmIChjb21tb25FZGdlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJlc2VydmUgPSBfaWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gX2lkO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzZXJ2ZTtcbn0sIFwiZmluZE5vbkNsdXN0ZXJDaGlsZFwiKTtcbnZhciBnZXRBbmNob3JJZCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGlkKSA9PiB7XG4gIGlmICghY2x1c3RlckRiLmhhcyhpZCkpIHtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgaWYgKCFjbHVzdGVyRGIuZ2V0KGlkKS5leHRlcm5hbENvbm5lY3Rpb25zKSB7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIGlmIChjbHVzdGVyRGIuaGFzKGlkKSkge1xuICAgIHJldHVybiBjbHVzdGVyRGIuZ2V0KGlkKS5pZDtcbiAgfVxuICByZXR1cm4gaWQ7XG59LCBcImdldEFuY2hvcklkXCIpO1xudmFyIGFkanVzdENsdXN0ZXJzQW5kRWRnZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChncmFwaCwgZGVwdGgpID0+IHtcbiAgaWYgKCFncmFwaCB8fCBkZXB0aCA+IDEwKSB7XG4gICAgbG9nLmRlYnVnKFwiT3B0aW5nIG91dCwgbm8gZ3JhcGggXCIpO1xuICAgIHJldHVybjtcbiAgfSBlbHNlIHtcbiAgICBsb2cuZGVidWcoXCJPcHRpbmcgaW4sIGdyYXBoIFwiKTtcbiAgfVxuICBncmFwaC5ub2RlcygpLmZvckVhY2goZnVuY3Rpb24oaWQpIHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IGdyYXBoLmNoaWxkcmVuKGlkKTtcbiAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgbG9nLndhcm4oXG4gICAgICAgIFwiQ2x1c3RlciBpZGVudGlmaWVkXCIsXG4gICAgICAgIGlkLFxuICAgICAgICBcIiBSZXBsYWNlbWVudCBpZCBpbiBlZGdlczogXCIsXG4gICAgICAgIGZpbmROb25DbHVzdGVyQ2hpbGQoaWQsIGdyYXBoLCBpZClcbiAgICAgICk7XG4gICAgICBkZXNjZW5kYW50cy5zZXQoaWQsIGV4dHJhY3REZXNjZW5kYW50cyhpZCwgZ3JhcGgpKTtcbiAgICAgIGNsdXN0ZXJEYi5zZXQoaWQsIHsgaWQ6IGZpbmROb25DbHVzdGVyQ2hpbGQoaWQsIGdyYXBoLCBpZCksIGNsdXN0ZXJEYXRhOiBncmFwaC5ub2RlKGlkKSB9KTtcbiAgICB9XG4gIH0pO1xuICBncmFwaC5ub2RlcygpLmZvckVhY2goZnVuY3Rpb24oaWQpIHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IGdyYXBoLmNoaWxkcmVuKGlkKTtcbiAgICBjb25zdCBlZGdlcyA9IGdyYXBoLmVkZ2VzKCk7XG4gICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgIGxvZy5kZWJ1ZyhcIkNsdXN0ZXIgaWRlbnRpZmllZFwiLCBpZCwgZGVzY2VuZGFudHMpO1xuICAgICAgZWRnZXMuZm9yRWFjaCgoZWRnZSkgPT4ge1xuICAgICAgICBjb25zdCBkMSA9IGlzRGVzY2VuZGFudChlZGdlLnYsIGlkKTtcbiAgICAgICAgY29uc3QgZDIgPSBpc0Rlc2NlbmRhbnQoZWRnZS53LCBpZCk7XG4gICAgICAgIGlmIChkMSBeIGQyKSB7XG4gICAgICAgICAgbG9nLndhcm4oXCJFZGdlOiBcIiwgZWRnZSwgXCIgbGVhdmVzIGNsdXN0ZXIgXCIsIGlkKTtcbiAgICAgICAgICBsb2cud2FybihcIkRlc2NlbmRhbnRzIG9mIFhYWCBcIiwgaWQsIFwiOiBcIiwgZGVzY2VuZGFudHMuZ2V0KGlkKSk7XG4gICAgICAgICAgY2x1c3RlckRiLmdldChpZCkuZXh0ZXJuYWxDb25uZWN0aW9ucyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2cuZGVidWcoXCJOb3QgYSBjbHVzdGVyIFwiLCBpZCwgZGVzY2VuZGFudHMpO1xuICAgIH1cbiAgfSk7XG4gIGZvciAobGV0IGlkIG9mIGNsdXN0ZXJEYi5rZXlzKCkpIHtcbiAgICBjb25zdCBub25DbHVzdGVyQ2hpbGQgPSBjbHVzdGVyRGIuZ2V0KGlkKS5pZDtcbiAgICBjb25zdCBwYXJlbnQgPSBncmFwaC5wYXJlbnQobm9uQ2x1c3RlckNoaWxkKTtcbiAgICBpZiAocGFyZW50ICE9PSBpZCAmJiBjbHVzdGVyRGIuaGFzKHBhcmVudCkgJiYgIWNsdXN0ZXJEYi5nZXQocGFyZW50KS5leHRlcm5hbENvbm5lY3Rpb25zKSB7XG4gICAgICBjbHVzdGVyRGIuZ2V0KGlkKS5pZCA9IHBhcmVudDtcbiAgICB9XG4gIH1cbiAgZ3JhcGguZWRnZXMoKS5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICBjb25zdCBlZGdlID0gZ3JhcGguZWRnZShlKTtcbiAgICBsb2cud2FybihcIkVkZ2UgXCIgKyBlLnYgKyBcIiAtPiBcIiArIGUudyArIFwiOiBcIiArIEpTT04uc3RyaW5naWZ5KGUpKTtcbiAgICBsb2cud2FybihcIkVkZ2UgXCIgKyBlLnYgKyBcIiAtPiBcIiArIGUudyArIFwiOiBcIiArIEpTT04uc3RyaW5naWZ5KGdyYXBoLmVkZ2UoZSkpKTtcbiAgICBsZXQgdiA9IGUudjtcbiAgICBsZXQgdyA9IGUudztcbiAgICBsb2cud2FybihcbiAgICAgIFwiRml4IFhYWFwiLFxuICAgICAgY2x1c3RlckRiLFxuICAgICAgXCJpZHM6XCIsXG4gICAgICBlLnYsXG4gICAgICBlLncsXG4gICAgICBcIlRyYW5zbGF0aW5nOiBcIixcbiAgICAgIGNsdXN0ZXJEYi5nZXQoZS52KSxcbiAgICAgIFwiIC0tLSBcIixcbiAgICAgIGNsdXN0ZXJEYi5nZXQoZS53KVxuICAgICk7XG4gICAgaWYgKGNsdXN0ZXJEYi5nZXQoZS52KSB8fCBjbHVzdGVyRGIuZ2V0KGUudykpIHtcbiAgICAgIGxvZy53YXJuKFwiRml4aW5nIGFuZCB0cnlpbmcgLSByZW1vdmluZyBYWFhcIiwgZS52LCBlLncsIGUubmFtZSk7XG4gICAgICB2ID0gZ2V0QW5jaG9ySWQoZS52KTtcbiAgICAgIHcgPSBnZXRBbmNob3JJZChlLncpO1xuICAgICAgZ3JhcGgucmVtb3ZlRWRnZShlLnYsIGUudywgZS5uYW1lKTtcbiAgICAgIGlmICh2ICE9PSBlLnYpIHtcbiAgICAgICAgY29uc3QgcGFyZW50ID0gZ3JhcGgucGFyZW50KHYpO1xuICAgICAgICBjbHVzdGVyRGIuZ2V0KHBhcmVudCkuZXh0ZXJuYWxDb25uZWN0aW9ucyA9IHRydWU7XG4gICAgICAgIGVkZ2UuZnJvbUNsdXN0ZXIgPSBlLnY7XG4gICAgICB9XG4gICAgICBpZiAodyAhPT0gZS53KSB7XG4gICAgICAgIGNvbnN0IHBhcmVudCA9IGdyYXBoLnBhcmVudCh3KTtcbiAgICAgICAgY2x1c3RlckRiLmdldChwYXJlbnQpLmV4dGVybmFsQ29ubmVjdGlvbnMgPSB0cnVlO1xuICAgICAgICBlZGdlLnRvQ2x1c3RlciA9IGUudztcbiAgICAgIH1cbiAgICAgIGxvZy53YXJuKFwiRml4IFJlcGxhY2luZyB3aXRoIFhYWFwiLCB2LCB3LCBlLm5hbWUpO1xuICAgICAgZ3JhcGguc2V0RWRnZSh2LCB3LCBlZGdlLCBlLm5hbWUpO1xuICAgIH1cbiAgfSk7XG4gIGxvZy53YXJuKFwiQWRqdXN0ZWQgR3JhcGhcIiwgZ3JhcGhsaWJKc29uLndyaXRlKGdyYXBoKSk7XG4gIGV4dHJhY3RvcihncmFwaCwgMCk7XG4gIGxvZy50cmFjZShjbHVzdGVyRGIpO1xufSwgXCJhZGp1c3RDbHVzdGVyc0FuZEVkZ2VzXCIpO1xudmFyIGV4dHJhY3RvciA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGdyYXBoLCBkZXB0aCkgPT4ge1xuICBsb2cud2FybihcImV4dHJhY3RvciAtIFwiLCBkZXB0aCwgZ3JhcGhsaWJKc29uLndyaXRlKGdyYXBoKSwgZ3JhcGguY2hpbGRyZW4oXCJEXCIpKTtcbiAgaWYgKGRlcHRoID4gMTApIHtcbiAgICBsb2cuZXJyb3IoXCJCYWlsaW5nIG91dFwiKTtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IG5vZGVzID0gZ3JhcGgubm9kZXMoKTtcbiAgbGV0IGhhc0NoaWxkcmVuID0gZmFsc2U7XG4gIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgIGNvbnN0IGNoaWxkcmVuID0gZ3JhcGguY2hpbGRyZW4obm9kZSk7XG4gICAgaGFzQ2hpbGRyZW4gPSBoYXNDaGlsZHJlbiB8fCBjaGlsZHJlbi5sZW5ndGggPiAwO1xuICB9XG4gIGlmICghaGFzQ2hpbGRyZW4pIHtcbiAgICBsb2cuZGVidWcoXCJEb25lLCBubyBub2RlIGhhcyBjaGlsZHJlblwiLCBncmFwaC5ub2RlcygpKTtcbiAgICByZXR1cm47XG4gIH1cbiAgbG9nLmRlYnVnKFwiTm9kZXMgPSBcIiwgbm9kZXMsIGRlcHRoKTtcbiAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgbG9nLmRlYnVnKFxuICAgICAgXCJFeHRyYWN0aW5nIG5vZGVcIixcbiAgICAgIG5vZGUsXG4gICAgICBjbHVzdGVyRGIsXG4gICAgICBjbHVzdGVyRGIuaGFzKG5vZGUpICYmICFjbHVzdGVyRGIuZ2V0KG5vZGUpLmV4dGVybmFsQ29ubmVjdGlvbnMsXG4gICAgICAhZ3JhcGgucGFyZW50KG5vZGUpLFxuICAgICAgZ3JhcGgubm9kZShub2RlKSxcbiAgICAgIGdyYXBoLmNoaWxkcmVuKFwiRFwiKSxcbiAgICAgIFwiIERlcHRoIFwiLFxuICAgICAgZGVwdGhcbiAgICApO1xuICAgIGlmICghY2x1c3RlckRiLmhhcyhub2RlKSkge1xuICAgICAgbG9nLmRlYnVnKFwiTm90IGEgY2x1c3RlclwiLCBub2RlLCBkZXB0aCk7XG4gICAgfSBlbHNlIGlmICghY2x1c3RlckRiLmdldChub2RlKS5leHRlcm5hbENvbm5lY3Rpb25zICYmIGdyYXBoLmNoaWxkcmVuKG5vZGUpICYmIGdyYXBoLmNoaWxkcmVuKG5vZGUpLmxlbmd0aCA+IDApIHtcbiAgICAgIGxvZy53YXJuKFxuICAgICAgICBcIkNsdXN0ZXIgd2l0aG91dCBleHRlcm5hbCBjb25uZWN0aW9ucywgd2l0aG91dCBhIHBhcmVudCBhbmQgd2l0aCBjaGlsZHJlblwiLFxuICAgICAgICBub2RlLFxuICAgICAgICBkZXB0aFxuICAgICAgKTtcbiAgICAgIGNvbnN0IGdyYXBoU2V0dGluZ3MgPSBncmFwaC5ncmFwaCgpO1xuICAgICAgbGV0IGRpciA9IGdyYXBoU2V0dGluZ3MucmFua2RpciA9PT0gXCJUQlwiID8gXCJMUlwiIDogXCJUQlwiO1xuICAgICAgaWYgKGNsdXN0ZXJEYi5nZXQobm9kZSk/LmNsdXN0ZXJEYXRhPy5kaXIpIHtcbiAgICAgICAgZGlyID0gY2x1c3RlckRiLmdldChub2RlKS5jbHVzdGVyRGF0YS5kaXI7XG4gICAgICAgIGxvZy53YXJuKFwiRml4aW5nIGRpclwiLCBjbHVzdGVyRGIuZ2V0KG5vZGUpLmNsdXN0ZXJEYXRhLmRpciwgZGlyKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNsdXN0ZXJHcmFwaCA9IG5ldyBncmFwaGxpYi5HcmFwaCh7XG4gICAgICAgIG11bHRpZ3JhcGg6IHRydWUsXG4gICAgICAgIGNvbXBvdW5kOiB0cnVlXG4gICAgICB9KS5zZXRHcmFwaCh7XG4gICAgICAgIHJhbmtkaXI6IGRpcixcbiAgICAgICAgbm9kZXNlcDogNTAsXG4gICAgICAgIHJhbmtzZXA6IDUwLFxuICAgICAgICBtYXJnaW54OiA4LFxuICAgICAgICBtYXJnaW55OiA4XG4gICAgICB9KS5zZXREZWZhdWx0RWRnZUxhYmVsKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgICB9KTtcbiAgICAgIGxvZy53YXJuKFwiT2xkIGdyYXBoIGJlZm9yZSBjb3B5XCIsIGdyYXBobGliSnNvbi53cml0ZShncmFwaCkpO1xuICAgICAgY29weShub2RlLCBncmFwaCwgY2x1c3RlckdyYXBoLCBub2RlKTtcbiAgICAgIGdyYXBoLnNldE5vZGUobm9kZSwge1xuICAgICAgICBjbHVzdGVyTm9kZTogdHJ1ZSxcbiAgICAgICAgaWQ6IG5vZGUsXG4gICAgICAgIGNsdXN0ZXJEYXRhOiBjbHVzdGVyRGIuZ2V0KG5vZGUpLmNsdXN0ZXJEYXRhLFxuICAgICAgICBsYWJlbDogY2x1c3RlckRiLmdldChub2RlKS5sYWJlbCxcbiAgICAgICAgZ3JhcGg6IGNsdXN0ZXJHcmFwaFxuICAgICAgfSk7XG4gICAgICBsb2cud2FybihcIk5ldyBncmFwaCBhZnRlciBjb3B5IG5vZGU6IChcIiwgbm9kZSwgXCIpXCIsIGdyYXBobGliSnNvbi53cml0ZShjbHVzdGVyR3JhcGgpKTtcbiAgICAgIGxvZy5kZWJ1ZyhcIk9sZCBncmFwaCBhZnRlciBjb3B5XCIsIGdyYXBobGliSnNvbi53cml0ZShncmFwaCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2cud2FybihcbiAgICAgICAgXCJDbHVzdGVyICoqIFwiLFxuICAgICAgICBub2RlLFxuICAgICAgICBcIiAqKm5vdCBtZWV0aW5nIHRoZSBjcml0ZXJpYSAhZXh0ZXJuYWxDb25uZWN0aW9uczpcIixcbiAgICAgICAgIWNsdXN0ZXJEYi5nZXQobm9kZSkuZXh0ZXJuYWxDb25uZWN0aW9ucyxcbiAgICAgICAgXCIgbm8gcGFyZW50OiBcIixcbiAgICAgICAgIWdyYXBoLnBhcmVudChub2RlKSxcbiAgICAgICAgXCIgY2hpbGRyZW4gXCIsXG4gICAgICAgIGdyYXBoLmNoaWxkcmVuKG5vZGUpICYmIGdyYXBoLmNoaWxkcmVuKG5vZGUpLmxlbmd0aCA+IDAsXG4gICAgICAgIGdyYXBoLmNoaWxkcmVuKFwiRFwiKSxcbiAgICAgICAgZGVwdGhcbiAgICAgICk7XG4gICAgICBsb2cuZGVidWcoY2x1c3RlckRiKTtcbiAgICB9XG4gIH1cbiAgbm9kZXMgPSBncmFwaC5ub2RlcygpO1xuICBsb2cud2FybihcIk5ldyBsaXN0IG9mIG5vZGVzXCIsIG5vZGVzKTtcbiAgZm9yIChjb25zdCBub2RlIG9mIG5vZGVzKSB7XG4gICAgY29uc3QgZGF0YSA9IGdyYXBoLm5vZGUobm9kZSk7XG4gICAgbG9nLndhcm4oXCIgTm93IG5leHQgbGV2ZWxcIiwgbm9kZSwgZGF0YSk7XG4gICAgaWYgKGRhdGE/LmNsdXN0ZXJOb2RlKSB7XG4gICAgICBleHRyYWN0b3IoZGF0YS5ncmFwaCwgZGVwdGggKyAxKTtcbiAgICB9XG4gIH1cbn0sIFwiZXh0cmFjdG9yXCIpO1xudmFyIHNvcnRlciA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGdyYXBoLCBub2RlcykgPT4ge1xuICBpZiAobm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGxldCByZXN1bHQgPSBPYmplY3QuYXNzaWduKFtdLCBub2Rlcyk7XG4gIG5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IGdyYXBoLmNoaWxkcmVuKG5vZGUpO1xuICAgIGNvbnN0IHNvcnRlZCA9IHNvcnRlcihncmFwaCwgY2hpbGRyZW4pO1xuICAgIHJlc3VsdCA9IFsuLi5yZXN1bHQsIC4uLnNvcnRlZF07XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufSwgXCJzb3J0ZXJcIik7XG52YXIgc29ydE5vZGVzQnlIaWVyYXJjaHkgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChncmFwaCkgPT4gc29ydGVyKGdyYXBoLCBncmFwaC5jaGlsZHJlbigpKSwgXCJzb3J0Tm9kZXNCeUhpZXJhcmNoeVwiKTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL2xheW91dC1hbGdvcml0aG1zL2RhZ3JlL2luZGV4LmpzXG52YXIgcmVjdXJzaXZlUmVuZGVyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAoX2VsZW0sIGdyYXBoLCBkaWFncmFtVHlwZSwgaWQsIHBhcmVudENsdXN0ZXIsIHNpdGVDb25maWcpID0+IHtcbiAgbG9nLndhcm4oXCJHcmFwaCBpbiByZWN1cnNpdmUgcmVuZGVyOlhBWFwiLCBncmFwaGxpYkpzb24yLndyaXRlKGdyYXBoKSwgcGFyZW50Q2x1c3Rlcik7XG4gIGNvbnN0IGRpciA9IGdyYXBoLmdyYXBoKCkucmFua2RpcjtcbiAgbG9nLnRyYWNlKFwiRGlyIGluIHJlY3Vyc2l2ZSByZW5kZXIgLSBkaXI6XCIsIGRpcik7XG4gIGNvbnN0IGVsZW0gPSBfZWxlbS5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcInJvb3RcIik7XG4gIGlmICghZ3JhcGgubm9kZXMoKSkge1xuICAgIGxvZy5pbmZvKFwiTm8gbm9kZXMgZm91bmQgZm9yXCIsIGdyYXBoKTtcbiAgfSBlbHNlIHtcbiAgICBsb2cuaW5mbyhcIlJlY3Vyc2l2ZSByZW5kZXIgWFhYXCIsIGdyYXBoLm5vZGVzKCkpO1xuICB9XG4gIGlmIChncmFwaC5lZGdlcygpLmxlbmd0aCA+IDApIHtcbiAgICBsb2cuaW5mbyhcIlJlY3Vyc2l2ZSBlZGdlc1wiLCBncmFwaC5lZGdlKGdyYXBoLmVkZ2VzKClbMF0pKTtcbiAgfVxuICBjb25zdCBjbHVzdGVycyA9IGVsZW0uaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJjbHVzdGVyc1wiKTtcbiAgY29uc3QgZWRnZVBhdGhzID0gZWxlbS5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImVkZ2VQYXRoc1wiKTtcbiAgY29uc3QgZWRnZUxhYmVscyA9IGVsZW0uaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJlZGdlTGFiZWxzXCIpO1xuICBjb25zdCBub2RlcyA9IGVsZW0uaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJub2Rlc1wiKTtcbiAgYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgZ3JhcGgubm9kZXMoKS5tYXAoYXN5bmMgZnVuY3Rpb24odikge1xuICAgICAgY29uc3Qgbm9kZSA9IGdyYXBoLm5vZGUodik7XG4gICAgICBpZiAocGFyZW50Q2x1c3RlciAhPT0gdm9pZCAwKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHBhcmVudENsdXN0ZXIuY2x1c3RlckRhdGEpKTtcbiAgICAgICAgbG9nLnRyYWNlKFxuICAgICAgICAgIFwiU2V0dGluZyBkYXRhIGZvciBwYXJlbnQgY2x1c3RlciBYWFhcXG4gTm9kZS5pZCA9IFwiLFxuICAgICAgICAgIHYsXG4gICAgICAgICAgXCJcXG4gZGF0YT1cIixcbiAgICAgICAgICBkYXRhLmhlaWdodCxcbiAgICAgICAgICBcIlxcblBhcmVudCBjbHVzdGVyXCIsXG4gICAgICAgICAgcGFyZW50Q2x1c3Rlci5oZWlnaHRcbiAgICAgICAgKTtcbiAgICAgICAgZ3JhcGguc2V0Tm9kZShwYXJlbnRDbHVzdGVyLmlkLCBkYXRhKTtcbiAgICAgICAgaWYgKCFncmFwaC5wYXJlbnQodikpIHtcbiAgICAgICAgICBsb2cudHJhY2UoXCJTZXR0aW5nIHBhcmVudFwiLCB2LCBwYXJlbnRDbHVzdGVyLmlkKTtcbiAgICAgICAgICBncmFwaC5zZXRQYXJlbnQodiwgcGFyZW50Q2x1c3Rlci5pZCwgZGF0YSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxvZy5pbmZvKFwiKEluc2VydCkgTm9kZSBYWFhcIiArIHYgKyBcIjogXCIgKyBKU09OLnN0cmluZ2lmeShncmFwaC5ub2RlKHYpKSk7XG4gICAgICBpZiAobm9kZT8uY2x1c3Rlck5vZGUpIHtcbiAgICAgICAgbG9nLmluZm8oXCJDbHVzdGVyIGlkZW50aWZpZWQgWEJYXCIsIHYsIG5vZGUud2lkdGgsIGdyYXBoLm5vZGUodikpO1xuICAgICAgICBjb25zdCB7IHJhbmtzZXAsIG5vZGVzZXAgfSA9IGdyYXBoLmdyYXBoKCk7XG4gICAgICAgIG5vZGUuZ3JhcGguc2V0R3JhcGgoe1xuICAgICAgICAgIC4uLm5vZGUuZ3JhcGguZ3JhcGgoKSxcbiAgICAgICAgICByYW5rc2VwOiByYW5rc2VwICsgMjUsXG4gICAgICAgICAgbm9kZXNlcFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgbyA9IGF3YWl0IHJlY3Vyc2l2ZVJlbmRlcihcbiAgICAgICAgICBub2RlcyxcbiAgICAgICAgICBub2RlLmdyYXBoLFxuICAgICAgICAgIGRpYWdyYW1UeXBlLFxuICAgICAgICAgIGlkLFxuICAgICAgICAgIGdyYXBoLm5vZGUodiksXG4gICAgICAgICAgc2l0ZUNvbmZpZ1xuICAgICAgICApO1xuICAgICAgICBjb25zdCBuZXdFbCA9IG8uZWxlbTtcbiAgICAgICAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCBuZXdFbCk7XG4gICAgICAgIG5vZGUuZGlmZiA9IG8uZGlmZiB8fCAwO1xuICAgICAgICBsb2cuaW5mbyhcbiAgICAgICAgICBcIk5ldyBjb21wb3VuZCBub2RlIGFmdGVyIHJlY3Vyc2l2ZSByZW5kZXIgWEFYXCIsXG4gICAgICAgICAgdixcbiAgICAgICAgICBcIndpZHRoXCIsXG4gICAgICAgICAgLy8gbm9kZSxcbiAgICAgICAgICBub2RlLndpZHRoLFxuICAgICAgICAgIFwiaGVpZ2h0XCIsXG4gICAgICAgICAgbm9kZS5oZWlnaHRcbiAgICAgICAgICAvLyBub2RlLngsXG4gICAgICAgICAgLy8gbm9kZS55XG4gICAgICAgICk7XG4gICAgICAgIHNldE5vZGVFbGVtKG5ld0VsLCBub2RlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChncmFwaC5jaGlsZHJlbih2KS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbG9nLnRyYWNlKFxuICAgICAgICAgICAgXCJDbHVzdGVyIC0gdGhlIG5vbiByZWN1cnNpdmUgcGF0aCBYQlhcIixcbiAgICAgICAgICAgIHYsXG4gICAgICAgICAgICBub2RlLmlkLFxuICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgIG5vZGUud2lkdGgsXG4gICAgICAgICAgICBcIkdyYXBoOlwiLFxuICAgICAgICAgICAgZ3JhcGhcbiAgICAgICAgICApO1xuICAgICAgICAgIGxvZy50cmFjZShmaW5kTm9uQ2x1c3RlckNoaWxkKG5vZGUuaWQsIGdyYXBoKSk7XG4gICAgICAgICAgY2x1c3RlckRiLnNldChub2RlLmlkLCB7IGlkOiBmaW5kTm9uQ2x1c3RlckNoaWxkKG5vZGUuaWQsIGdyYXBoKSwgbm9kZSB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsb2cudHJhY2UoXCJOb2RlIC0gdGhlIG5vbiByZWN1cnNpdmUgcGF0aCBYQVhcIiwgdiwgbm9kZXMsIGdyYXBoLm5vZGUodiksIGRpcik7XG4gICAgICAgICAgYXdhaXQgaW5zZXJ0Tm9kZShub2RlcywgZ3JhcGgubm9kZSh2KSwgeyBjb25maWc6IHNpdGVDb25maWcsIGRpciB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICk7XG4gIGNvbnN0IHByb2Nlc3NFZGdlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGVkZ2VQcm9taXNlcyA9IGdyYXBoLmVkZ2VzKCkubWFwKGFzeW5jIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGNvbnN0IGVkZ2UgPSBncmFwaC5lZGdlKGUudiwgZS53LCBlLm5hbWUpO1xuICAgICAgbG9nLmluZm8oXCJFZGdlIFwiICsgZS52ICsgXCIgLT4gXCIgKyBlLncgKyBcIjogXCIgKyBKU09OLnN0cmluZ2lmeShlKSk7XG4gICAgICBsb2cuaW5mbyhcIkVkZ2UgXCIgKyBlLnYgKyBcIiAtPiBcIiArIGUudyArIFwiOiBcIiwgZSwgXCIgXCIsIEpTT04uc3RyaW5naWZ5KGdyYXBoLmVkZ2UoZSkpKTtcbiAgICAgIGxvZy5pbmZvKFxuICAgICAgICBcIkZpeFwiLFxuICAgICAgICBjbHVzdGVyRGIsXG4gICAgICAgIFwiaWRzOlwiLFxuICAgICAgICBlLnYsXG4gICAgICAgIGUudyxcbiAgICAgICAgXCJUcmFuc2xhdGluZzogXCIsXG4gICAgICAgIGNsdXN0ZXJEYi5nZXQoZS52KSxcbiAgICAgICAgY2x1c3RlckRiLmdldChlLncpXG4gICAgICApO1xuICAgICAgYXdhaXQgaW5zZXJ0RWRnZUxhYmVsKGVkZ2VMYWJlbHMsIGVkZ2UpO1xuICAgIH0pO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKGVkZ2VQcm9taXNlcyk7XG4gIH0sIFwicHJvY2Vzc0VkZ2VzXCIpO1xuICBhd2FpdCBwcm9jZXNzRWRnZXMoKTtcbiAgbG9nLmluZm8oXCJHcmFwaCBiZWZvcmUgbGF5b3V0OlwiLCBKU09OLnN0cmluZ2lmeShncmFwaGxpYkpzb24yLndyaXRlKGdyYXBoKSkpO1xuICBsb2cuaW5mbyhcIiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyBYWFhcIik7XG4gIGxvZy5pbmZvKFwiIyMjICAgICAgICAgICAgICAgIExheW91dCAgICAgICAgICAgICAgICAgIyMjIFhYWFwiKTtcbiAgbG9nLmluZm8oXCIjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgWFhYXCIpO1xuICBkYWdyZUxheW91dChncmFwaCk7XG4gIGxvZy5pbmZvKFwiR3JhcGggYWZ0ZXIgbGF5b3V0OlwiLCBKU09OLnN0cmluZ2lmeShncmFwaGxpYkpzb24yLndyaXRlKGdyYXBoKSkpO1xuICBsZXQgZGlmZiA9IDA7XG4gIGxldCB7IHN1YkdyYXBoVGl0bGVUb3RhbE1hcmdpbiB9ID0gZ2V0U3ViR3JhcGhUaXRsZU1hcmdpbnMoc2l0ZUNvbmZpZyk7XG4gIGF3YWl0IFByb21pc2UuYWxsKFxuICAgIHNvcnROb2Rlc0J5SGllcmFyY2h5KGdyYXBoKS5tYXAoYXN5bmMgZnVuY3Rpb24odikge1xuICAgICAgY29uc3Qgbm9kZSA9IGdyYXBoLm5vZGUodik7XG4gICAgICBsb2cuaW5mbyhcbiAgICAgICAgXCJQb3NpdGlvbiBYQlggPT4gXCIgKyB2ICsgXCI6IChcIiArIG5vZGUueCxcbiAgICAgICAgXCIsXCIgKyBub2RlLnksXG4gICAgICAgIFwiKSB3aWR0aDogXCIsXG4gICAgICAgIG5vZGUud2lkdGgsXG4gICAgICAgIFwiIGhlaWdodDogXCIsXG4gICAgICAgIG5vZGUuaGVpZ2h0XG4gICAgICApO1xuICAgICAgaWYgKG5vZGU/LmNsdXN0ZXJOb2RlKSB7XG4gICAgICAgIG5vZGUueSArPSBzdWJHcmFwaFRpdGxlVG90YWxNYXJnaW47XG4gICAgICAgIGxvZy5pbmZvKFxuICAgICAgICAgIFwiQSB0YWludGVkIGNsdXN0ZXIgbm9kZSBYQlgxXCIsXG4gICAgICAgICAgdixcbiAgICAgICAgICBub2RlLmlkLFxuICAgICAgICAgIG5vZGUud2lkdGgsXG4gICAgICAgICAgbm9kZS5oZWlnaHQsXG4gICAgICAgICAgbm9kZS54LFxuICAgICAgICAgIG5vZGUueSxcbiAgICAgICAgICBncmFwaC5wYXJlbnQodilcbiAgICAgICAgKTtcbiAgICAgICAgY2x1c3RlckRiLmdldChub2RlLmlkKS5ub2RlID0gbm9kZTtcbiAgICAgICAgcG9zaXRpb25Ob2RlKG5vZGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGdyYXBoLmNoaWxkcmVuKHYpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsb2cuaW5mbyhcbiAgICAgICAgICAgIFwiQSBwdXJlIGNsdXN0ZXIgbm9kZSBYQlgxXCIsXG4gICAgICAgICAgICB2LFxuICAgICAgICAgICAgbm9kZS5pZCxcbiAgICAgICAgICAgIG5vZGUueCxcbiAgICAgICAgICAgIG5vZGUueSxcbiAgICAgICAgICAgIG5vZGUud2lkdGgsXG4gICAgICAgICAgICBub2RlLmhlaWdodCxcbiAgICAgICAgICAgIGdyYXBoLnBhcmVudCh2KVxuICAgICAgICAgICk7XG4gICAgICAgICAgbm9kZS5oZWlnaHQgKz0gc3ViR3JhcGhUaXRsZVRvdGFsTWFyZ2luO1xuICAgICAgICAgIGdyYXBoLm5vZGUobm9kZS5wYXJlbnRJZCk7XG4gICAgICAgICAgY29uc3QgaGFsZlBhZGRpbmcgPSBub2RlPy5wYWRkaW5nIC8gMiB8fCAwO1xuICAgICAgICAgIGNvbnN0IGxhYmVsSGVpZ2h0ID0gbm9kZT8ubGFiZWxCQm94Py5oZWlnaHQgfHwgMDtcbiAgICAgICAgICBjb25zdCBvZmZzZXRZID0gbGFiZWxIZWlnaHQgLSBoYWxmUGFkZGluZyB8fCAwO1xuICAgICAgICAgIGxvZy5kZWJ1ZyhcIk9mZnNldFlcIiwgb2Zmc2V0WSwgXCJsYWJlbEhlaWdodFwiLCBsYWJlbEhlaWdodCwgXCJoYWxmUGFkZGluZ1wiLCBoYWxmUGFkZGluZyk7XG4gICAgICAgICAgYXdhaXQgaW5zZXJ0Q2x1c3RlcihjbHVzdGVycywgbm9kZSk7XG4gICAgICAgICAgY2x1c3RlckRiLmdldChub2RlLmlkKS5ub2RlID0gbm9kZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBwYXJlbnQgPSBncmFwaC5ub2RlKG5vZGUucGFyZW50SWQpO1xuICAgICAgICAgIG5vZGUueSArPSBzdWJHcmFwaFRpdGxlVG90YWxNYXJnaW4gLyAyO1xuICAgICAgICAgIGxvZy5pbmZvKFxuICAgICAgICAgICAgXCJBIHJlZ3VsYXIgbm9kZSBYQlgxIC0gdXNpbmcgdGhlIHBhZGRpbmdcIixcbiAgICAgICAgICAgIG5vZGUuaWQsXG4gICAgICAgICAgICBcInBhcmVudFwiLFxuICAgICAgICAgICAgbm9kZS5wYXJlbnRJZCxcbiAgICAgICAgICAgIG5vZGUud2lkdGgsXG4gICAgICAgICAgICBub2RlLmhlaWdodCxcbiAgICAgICAgICAgIG5vZGUueCxcbiAgICAgICAgICAgIG5vZGUueSxcbiAgICAgICAgICAgIFwib2Zmc2V0WVwiLFxuICAgICAgICAgICAgbm9kZS5vZmZzZXRZLFxuICAgICAgICAgICAgXCJwYXJlbnRcIixcbiAgICAgICAgICAgIHBhcmVudCxcbiAgICAgICAgICAgIHBhcmVudD8ub2Zmc2V0WSxcbiAgICAgICAgICAgIG5vZGVcbiAgICAgICAgICApO1xuICAgICAgICAgIHBvc2l0aW9uTm9kZShub2RlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICk7XG4gIGdyYXBoLmVkZ2VzKCkuZm9yRWFjaChmdW5jdGlvbihlKSB7XG4gICAgY29uc3QgZWRnZSA9IGdyYXBoLmVkZ2UoZSk7XG4gICAgbG9nLmluZm8oXCJFZGdlIFwiICsgZS52ICsgXCIgLT4gXCIgKyBlLncgKyBcIjogXCIgKyBKU09OLnN0cmluZ2lmeShlZGdlKSwgZWRnZSk7XG4gICAgZWRnZS5wb2ludHMuZm9yRWFjaCgocG9pbnQpID0+IHBvaW50LnkgKz0gc3ViR3JhcGhUaXRsZVRvdGFsTWFyZ2luIC8gMik7XG4gICAgY29uc3Qgc3RhcnROb2RlID0gZ3JhcGgubm9kZShlLnYpO1xuICAgIHZhciBlbmROb2RlID0gZ3JhcGgubm9kZShlLncpO1xuICAgIGNvbnN0IHBhdGhzID0gaW5zZXJ0RWRnZShlZGdlUGF0aHMsIGVkZ2UsIGNsdXN0ZXJEYiwgZGlhZ3JhbVR5cGUsIHN0YXJ0Tm9kZSwgZW5kTm9kZSwgaWQpO1xuICAgIHBvc2l0aW9uRWRnZUxhYmVsKGVkZ2UsIHBhdGhzKTtcbiAgfSk7XG4gIGdyYXBoLm5vZGVzKCkuZm9yRWFjaChmdW5jdGlvbih2KSB7XG4gICAgY29uc3QgbiA9IGdyYXBoLm5vZGUodik7XG4gICAgbG9nLmluZm8odiwgbi50eXBlLCBuLmRpZmYpO1xuICAgIGlmIChuLmlzR3JvdXApIHtcbiAgICAgIGRpZmYgPSBuLmRpZmY7XG4gICAgfVxuICB9KTtcbiAgbG9nLndhcm4oXCJSZXR1cm5pbmcgZnJvbSByZWN1cnNpdmUgcmVuZGVyIFhBWFwiLCBlbGVtLCBkaWZmKTtcbiAgcmV0dXJuIHsgZWxlbSwgZGlmZiB9O1xufSwgXCJyZWN1cnNpdmVSZW5kZXJcIik7XG52YXIgcmVuZGVyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAoZGF0YTRMYXlvdXQsIHN2ZykgPT4ge1xuICBjb25zdCBncmFwaCA9IG5ldyBncmFwaGxpYjIuR3JhcGgoe1xuICAgIG11bHRpZ3JhcGg6IHRydWUsXG4gICAgY29tcG91bmQ6IHRydWVcbiAgfSkuc2V0R3JhcGgoe1xuICAgIHJhbmtkaXI6IGRhdGE0TGF5b3V0LmRpcmVjdGlvbixcbiAgICBub2Rlc2VwOiBkYXRhNExheW91dC5jb25maWc/Lm5vZGVTcGFjaW5nIHx8IGRhdGE0TGF5b3V0LmNvbmZpZz8uZmxvd2NoYXJ0Py5ub2RlU3BhY2luZyB8fCBkYXRhNExheW91dC5ub2RlU3BhY2luZyxcbiAgICByYW5rc2VwOiBkYXRhNExheW91dC5jb25maWc/LnJhbmtTcGFjaW5nIHx8IGRhdGE0TGF5b3V0LmNvbmZpZz8uZmxvd2NoYXJ0Py5yYW5rU3BhY2luZyB8fCBkYXRhNExheW91dC5yYW5rU3BhY2luZyxcbiAgICBtYXJnaW54OiA4LFxuICAgIG1hcmdpbnk6IDhcbiAgfSkuc2V0RGVmYXVsdEVkZ2VMYWJlbChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge307XG4gIH0pO1xuICBjb25zdCBlbGVtZW50ID0gc3ZnLnNlbGVjdChcImdcIik7XG4gIG1hcmtlcnNfZGVmYXVsdChlbGVtZW50LCBkYXRhNExheW91dC5tYXJrZXJzLCBkYXRhNExheW91dC50eXBlLCBkYXRhNExheW91dC5kaWFncmFtSWQpO1xuICBjbGVhcjMoKTtcbiAgY2xlYXIyKCk7XG4gIGNsZWFyKCk7XG4gIGNsZWFyNCgpO1xuICBkYXRhNExheW91dC5ub2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgZ3JhcGguc2V0Tm9kZShub2RlLmlkLCB7IC4uLm5vZGUgfSk7XG4gICAgaWYgKG5vZGUucGFyZW50SWQpIHtcbiAgICAgIGdyYXBoLnNldFBhcmVudChub2RlLmlkLCBub2RlLnBhcmVudElkKTtcbiAgICB9XG4gIH0pO1xuICBsb2cuZGVidWcoXCJFZGdlczpcIiwgZGF0YTRMYXlvdXQuZWRnZXMpO1xuICBkYXRhNExheW91dC5lZGdlcy5mb3JFYWNoKChlZGdlKSA9PiB7XG4gICAgaWYgKGVkZ2Uuc3RhcnQgPT09IGVkZ2UuZW5kKSB7XG4gICAgICBjb25zdCBub2RlSWQgPSBlZGdlLnN0YXJ0O1xuICAgICAgY29uc3Qgc3BlY2lhbElkMSA9IG5vZGVJZCArIFwiLS0tXCIgKyBub2RlSWQgKyBcIi0tLTFcIjtcbiAgICAgIGNvbnN0IHNwZWNpYWxJZDIgPSBub2RlSWQgKyBcIi0tLVwiICsgbm9kZUlkICsgXCItLS0yXCI7XG4gICAgICBjb25zdCBub2RlID0gZ3JhcGgubm9kZShub2RlSWQpO1xuICAgICAgZ3JhcGguc2V0Tm9kZShzcGVjaWFsSWQxLCB7XG4gICAgICAgIGRvbUlkOiBzcGVjaWFsSWQxLFxuICAgICAgICBpZDogc3BlY2lhbElkMSxcbiAgICAgICAgcGFyZW50SWQ6IG5vZGUucGFyZW50SWQsXG4gICAgICAgIGxhYmVsU3R5bGU6IFwiXCIsXG4gICAgICAgIGxhYmVsOiBcIlwiLFxuICAgICAgICBwYWRkaW5nOiAwLFxuICAgICAgICBzaGFwZTogXCJsYWJlbFJlY3RcIixcbiAgICAgICAgLy8gc2hhcGU6ICdyZWN0JyxcbiAgICAgICAgc3R5bGU6IFwiXCIsXG4gICAgICAgIHdpZHRoOiAxMCxcbiAgICAgICAgaGVpZ2h0OiAxMFxuICAgICAgfSk7XG4gICAgICBncmFwaC5zZXRQYXJlbnQoc3BlY2lhbElkMSwgbm9kZS5wYXJlbnRJZCk7XG4gICAgICBncmFwaC5zZXROb2RlKHNwZWNpYWxJZDIsIHtcbiAgICAgICAgZG9tSWQ6IHNwZWNpYWxJZDIsXG4gICAgICAgIGlkOiBzcGVjaWFsSWQyLFxuICAgICAgICBwYXJlbnRJZDogbm9kZS5wYXJlbnRJZCxcbiAgICAgICAgbGFiZWxTdHlsZTogXCJcIixcbiAgICAgICAgcGFkZGluZzogMCxcbiAgICAgICAgLy8gc2hhcGU6ICdyZWN0JyxcbiAgICAgICAgc2hhcGU6IFwibGFiZWxSZWN0XCIsXG4gICAgICAgIGxhYmVsOiBcIlwiLFxuICAgICAgICBzdHlsZTogXCJcIixcbiAgICAgICAgd2lkdGg6IDEwLFxuICAgICAgICBoZWlnaHQ6IDEwXG4gICAgICB9KTtcbiAgICAgIGdyYXBoLnNldFBhcmVudChzcGVjaWFsSWQyLCBub2RlLnBhcmVudElkKTtcbiAgICAgIGNvbnN0IGVkZ2UxID0gc3RydWN0dXJlZENsb25lKGVkZ2UpO1xuICAgICAgY29uc3QgZWRnZU1pZCA9IHN0cnVjdHVyZWRDbG9uZShlZGdlKTtcbiAgICAgIGNvbnN0IGVkZ2UyID0gc3RydWN0dXJlZENsb25lKGVkZ2UpO1xuICAgICAgZWRnZTEubGFiZWwgPSBcIlwiO1xuICAgICAgZWRnZTEuYXJyb3dUeXBlRW5kID0gXCJub25lXCI7XG4gICAgICBlZGdlMS5lbmRMYWJlbExlZnQgPSBcIlwiO1xuICAgICAgZWRnZTEuZW5kTGFiZWxSaWdodCA9IFwiXCI7XG4gICAgICBlZGdlMS5zdGFydExhYmVsTGVmdCA9IFwiXCI7XG4gICAgICBlZGdlMS5pZCA9IG5vZGVJZCArIFwiLWN5Y2xpYy1zcGVjaWFsLTFcIjtcbiAgICAgIGVkZ2VNaWQuc3RhcnRMYWJlbFJpZ2h0ID0gXCJcIjtcbiAgICAgIGVkZ2VNaWQuc3RhcnRMYWJlbExlZnQgPSBcIlwiO1xuICAgICAgZWRnZU1pZC5lbmRMYWJlbExlZnQgPSBcIlwiO1xuICAgICAgZWRnZU1pZC5lbmRMYWJlbFJpZ2h0ID0gXCJcIjtcbiAgICAgIGVkZ2VNaWQuYXJyb3dUeXBlU3RhcnQgPSBcIm5vbmVcIjtcbiAgICAgIGVkZ2VNaWQuYXJyb3dUeXBlRW5kID0gXCJub25lXCI7XG4gICAgICBlZGdlTWlkLmlkID0gbm9kZUlkICsgXCItY3ljbGljLXNwZWNpYWwtbWlkXCI7XG4gICAgICBlZGdlMi5sYWJlbCA9IFwiXCI7XG4gICAgICBlZGdlMi5zdGFydExhYmVsUmlnaHQgPSBcIlwiO1xuICAgICAgZWRnZTIuc3RhcnRMYWJlbExlZnQgPSBcIlwiO1xuICAgICAgZWRnZTIuYXJyb3dUeXBlU3RhcnQgPSBcIm5vbmVcIjtcbiAgICAgIGlmIChub2RlLmlzR3JvdXApIHtcbiAgICAgICAgZWRnZTEuZnJvbUNsdXN0ZXIgPSBub2RlSWQ7XG4gICAgICAgIGVkZ2UyLnRvQ2x1c3RlciA9IG5vZGVJZDtcbiAgICAgIH1cbiAgICAgIGVkZ2UyLmlkID0gbm9kZUlkICsgXCItY3ljbGljLXNwZWNpYWwtMlwiO1xuICAgICAgZWRnZTIuYXJyb3dUeXBlU3RhcnQgPSBcIm5vbmVcIjtcbiAgICAgIGdyYXBoLnNldEVkZ2Uobm9kZUlkLCBzcGVjaWFsSWQxLCBlZGdlMSwgbm9kZUlkICsgXCItY3ljbGljLXNwZWNpYWwtMFwiKTtcbiAgICAgIGdyYXBoLnNldEVkZ2Uoc3BlY2lhbElkMSwgc3BlY2lhbElkMiwgZWRnZU1pZCwgbm9kZUlkICsgXCItY3ljbGljLXNwZWNpYWwtMVwiKTtcbiAgICAgIGdyYXBoLnNldEVkZ2Uoc3BlY2lhbElkMiwgbm9kZUlkLCBlZGdlMiwgbm9kZUlkICsgXCItY3ljPGxpYy1zcGVjaWFsLTJcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdyYXBoLnNldEVkZ2UoZWRnZS5zdGFydCwgZWRnZS5lbmQsIHsgLi4uZWRnZSB9LCBlZGdlLmlkKTtcbiAgICB9XG4gIH0pO1xuICBsb2cud2FybihcIkdyYXBoIGF0IGZpcnN0OlwiLCBKU09OLnN0cmluZ2lmeShncmFwaGxpYkpzb24yLndyaXRlKGdyYXBoKSkpO1xuICBhZGp1c3RDbHVzdGVyc0FuZEVkZ2VzKGdyYXBoKTtcbiAgbG9nLndhcm4oXCJHcmFwaCBhZnRlciBYQVg6XCIsIEpTT04uc3RyaW5naWZ5KGdyYXBobGliSnNvbjIud3JpdGUoZ3JhcGgpKSk7XG4gIGNvbnN0IHNpdGVDb25maWcgPSBnZXRDb25maWcoKTtcbiAgYXdhaXQgcmVjdXJzaXZlUmVuZGVyKFxuICAgIGVsZW1lbnQsXG4gICAgZ3JhcGgsXG4gICAgZGF0YTRMYXlvdXQudHlwZSxcbiAgICBkYXRhNExheW91dC5kaWFncmFtSWQsXG4gICAgdm9pZCAwLFxuICAgIHNpdGVDb25maWdcbiAgKTtcbn0sIFwicmVuZGVyXCIpO1xuZXhwb3J0IHtcbiAgcmVu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LFFBQ1AsT0FBTztBQUFBLFFBQ1AsT0FBTztBQUFBLFFBQ1AsT0FBTztBQUFBLFFBQ1AsUUFBUTtBQUFBLE1BQ1YsQ0FBQztBQUFBLE1BQ0QsTUFBTSxVQUFVLFlBQVksS0FBSyxRQUFRO0FBQUEsTUFDekMsTUFBTSxRQUFRLGdCQUFnQixJQUFJO0FBQUEsTUFDbEMsTUFBTSxVQUFVLGdCQUFnQixJQUFJO0FBQUEsTUFDcEMsTUFBTSxRQUFRLGdCQUFnQixJQUFJO0FBQUEsTUFDbEMsTUFBTSxRQUFRO0FBQUEsTUFDZCxNQUFNLGVBQWU7QUFBQSxNQUNyQixNQUFNLGVBQWU7QUFBQSxNQUNyQixNQUFNLGdCQUFnQjtBQUFBLE1BQ3RCLE1BQU0saUJBQWlCO0FBQUEsTUFDdkIsTUFBTSxLQUFLLFNBQVM7QUFBQSxNQUNwQixRQUFRLGtCQUFrQjtBQUFBLE1BQzFCLFFBQVEsaUJBQWlCO0FBQUEsTUFDekIsUUFBUSxlQUFlO0FBQUEsTUFDdkIsUUFBUSxnQkFBZ0I7QUFBQSxNQUN4QixRQUFRLGlCQUFpQjtBQUFBLE1BQ3pCLFFBQVEsZUFBZTtBQUFBLE1BQ3ZCLFFBQVEsS0FBSyxTQUFTO0FBQUEsTUFDdEIsTUFBTSxRQUFRO0FBQUEsTUFDZCxNQUFNLGtCQUFrQjtBQUFBLE1BQ3hCLE1BQU0saUJBQWlCO0FBQUEsTUFDdkIsTUFBTSxpQkFBaUI7QUFBQSxNQUN2QixJQUFJLEtBQUssU0FBUztBQUFBLFFBQ2hCLE1BQU0sY0FBYztBQUFBLFFBQ3BCLE1BQU0sWUFBWTtBQUFBLE1BQ3BCO0FBQUEsTUFDQSxNQUFNLEtBQUssU0FBUztBQUFBLE1BQ3BCLE1BQU0saUJBQWlCO0FBQUEsTUFDdkIsTUFBTSxRQUFRLFFBQVEsWUFBWSxPQUFPLFNBQVMsbUJBQW1CO0FBQUEsTUFDckUsTUFBTSxRQUFRLFlBQVksWUFBWSxTQUFTLFNBQVMsbUJBQW1CO0FBQUEsTUFDM0UsTUFBTSxRQUFRLFlBQVksUUFBUSxPQUFPLFNBQVMsb0JBQW9CO0FBQUEsSUFDeEUsRUFBTztBQUFBLE1BQ0wsTUFBTSxRQUFRLEtBQUssT0FBTyxLQUFLLEtBQUssS0FBSyxLQUFLLEdBQUcsS0FBSyxFQUFFO0FBQUE7QUFBQSxHQUUzRDtBQUFBLEVBQ0QsSUFBSSxLQUFLLG1CQUFtQixLQUFLLFVBQXdCLE1BQU0sS0FBSyxDQUFDLENBQUM7QUFBQSxFQUN0RSx1QkFBdUIsS0FBSztBQUFBLEVBQzVCLElBQUksS0FBSyxvQkFBb0IsS0FBSyxVQUF3QixNQUFNLEtBQUssQ0FBQyxDQUFDO0FBQUEsRUFDdkUsTUFBTSxhQUFhLFdBQVU7QUFBQSxFQUM3QixNQUFNLGdCQUNKLFNBQ0EsT0FDQSxZQUFZLE1BQ1osWUFBWSxXQUNQLFdBQ0wsVUFDRjtBQUFBLEdBQ0MsUUFBUTsiLAogICJkZWJ1Z0lkIjogIjFEMDREMjE4QkY5RDAxRjU2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
