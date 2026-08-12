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
  cleanAndMerge,
  random,
  utils_default
} from "./chunk-main-vvfzntzy.js";
import"./chunk-main-ck580f0k.js";
import {
  clear,
  common_default,
  defaultConfig_default,
  getAccDescription,
  getAccTitle,
  getConfig,
  getConfig2,
  getDiagramTitle,
  setAccDescription,
  setAccTitle,
  setDiagramTitle,
  setupGraphViewbox2
} from "./chunk-main-aws590jt.js";
import {
  __name,
  log,
  select_default
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-x0xz2rje.js";
import"./chunk-main-rxe1mr61.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/gitGraphDiagram-PVQCEYII.mjs
var commitType = {
  NORMAL: 0,
  REVERSE: 1,
  HIGHLIGHT: 2,
  MERGE: 3,
  CHERRY_PICK: 4
};
var DEFAULT_GITGRAPH_CONFIG = defaultConfig_default.gitGraph;
var getConfig3 = /* @__PURE__ */ __name(() => {
  const config = cleanAndMerge({
    ...DEFAULT_GITGRAPH_CONFIG,
    ...getConfig().gitGraph
  });
  return config;
}, "getConfig");
var state = new ImperativeState(() => {
  const config = getConfig3();
  const mainBranchName = config.mainBranchName;
  const mainBranchOrder = config.mainBranchOrder;
  return {
    mainBranchName,
    commits: /* @__PURE__ */ new Map,
    head: null,
    branchConfig: /* @__PURE__ */ new Map([[mainBranchName, { name: mainBranchName, order: mainBranchOrder }]]),
    branches: /* @__PURE__ */ new Map([[mainBranchName, null]]),
    currBranch: mainBranchName,
    direction: "LR",
    seq: 0,
    options: {}
  };
});
function getID() {
  return random({ length: 7 });
}
__name(getID, "getID");
function uniqBy(list, fn) {
  const recordMap = /* @__PURE__ */ Object.create(null);
  return list.reduce((out, item) => {
    const key = fn(item);
    if (!recordMap[key]) {
      recordMap[key] = true;
      out.push(item);
    }
    return out;
  }, []);
}
__name(uniqBy, "uniqBy");
var setDirection = /* @__PURE__ */ __name(function(dir2) {
  state.records.direction = dir2;
}, "setDirection");
var setOptions = /* @__PURE__ */ __name(function(rawOptString) {
  log.debug("options str", rawOptString);
  rawOptString = rawOptString?.trim();
  rawOptString = rawOptString || "{}";
  try {
    state.records.options = JSON.parse(rawOptString);
  } catch (e) {
    log.error("error while parsing gitGraph options", e.message);
  }
}, "setOptions");
var getOptions = /* @__PURE__ */ __name(function() {
  return state.records.options;
}, "getOptions");
var commit = /* @__PURE__ */ __name(function(commitDB) {
  let msg = commitDB.msg;
  let id = commitDB.id;
  const type = commitDB.type;
  let tags = commitDB.tags;
  log.info("commit", msg, id, type, tags);
  log.debug("Entering commit:", msg, id, type, tags);
  const config = getConfig3();
  id = common_default.sanitizeText(id, config);
  msg = common_default.sanitizeText(msg, config);
  tags = tags?.map((tag) => common_default.sanitizeText(tag, config));
  const newCommit = {
    id: id ? id : state.records.seq + "-" + getID(),
    message: msg,
    seq: state.records.seq++,
    type: type ?? commitType.NORMAL,
    tags: tags ?? [],
    parents: state.records.head == null ? [] : [state.records.head.id],
    branch: state.records.currBranch
  };
  state.records.head = newCommit;
  log.info("main branch", config.mainBranchName);
  if (state.records.commits.has(newCommit.id)) {
    log.warn(`Commit ID ${newCommit.id} already exists`);
  }
  state.records.commits.set(newCommit.id, newCommit);
  state.records.branches.set(state.records.currBranch, newCommit.id);
  log.debug("in pushCommit " + newCommit.id);
}, "commit");
var branch = /* @__PURE__ */ __name(function(branchDB) {
  let name = branchDB.name;
  const order = branchDB.order;
  name = common_default.sanitizeText(name, getConfig3());
  if (state.records.branches.has(name)) {
    throw new Error(`Trying to create an existing branch. (Help: Either use a new name if you want create a new branch or try using "checkout ${name}")`);
  }
  state.records.branches.set(name, state.records.head != null ? state.records.head.id : null);
  state.records.branchConfig.set(name, { name, order });
  checkout(name);
  log.debug("in createBranch");
}, "branch");
var merge = /* @__PURE__ */ __name((mergeDB) => {
  let otherBranch = mergeDB.branch;
  let customId = mergeDB.id;
  const overrideType = mergeDB.type;
  const customTags = mergeDB.tags;
  const config = getConfig3();
  otherBranch = common_default.sanitizeText(otherBranch, config);
  if (customId) {
    customId = common_default.sanitizeText(customId, config);
  }
  const currentBranchCheck = state.records.branches.get(state.records.currBranch);
  const otherBranchCheck = state.records.branches.get(otherBranch);
  const currentCommit = currentBranchCheck ? state.records.commits.get(currentBranchCheck) : undefined;
  const otherCommit = otherBranchCheck ? state.records.commits.get(otherBranchCheck) : undefined;
  if (currentCommit && otherCommit && currentCommit.branch === otherBranch) {
    throw new Error(`Cannot merge branch '${otherBranch}' into itself.`);
  }
  if (state.records.currBranch === otherBranch) {
    const error = new Error('Incorrect usage of "merge". Cannot merge a branch to itself');
    error.hash = {
      text: `merge ${otherBranch}`,
      token: `merge ${otherBranch}`,
      expected: ["branch abc"]
    };
    throw error;
  }
  if (currentCommit === undefined || !currentCommit) {
    const error = new Error(`Incorrect usage of "merge". Current branch (${state.records.currBranch})has no commits`);
    error.hash = {
      text: `merge ${otherBranch}`,
      token: `merge ${otherBranch}`,
      expected: ["commit"]
    };
    throw error;
  }
  if (!state.records.branches.has(otherBranch)) {
    const error = new Error('Incorrect usage of "merge". Branch to be merged (' + otherBranch + ") does not exist");
    error.hash = {
      text: `merge ${otherBranch}`,
      token: `merge ${otherBranch}`,
      expected: [`branch ${otherBranch}`]
    };
    throw error;
  }
  if (otherCommit === undefined || !otherCommit) {
    const error = new Error('Incorrect usage of "merge". Branch to be merged (' + otherBranch + ") has no commits");
    error.hash = {
      text: `merge ${otherBranch}`,
      token: `merge ${otherBranch}`,
      expected: ['"commit"']
    };
    throw error;
  }
  if (currentCommit === otherCommit) {
    const error = new Error('Incorrect usage of "merge". Both branches have same head');
    error.hash = {
      text: `merge ${otherBranch}`,
      token: `merge ${otherBranch}`,
      expected: ["branch abc"]
    };
    throw error;
  }
  if (customId && state.records.commits.has(customId)) {
    const error = new Error('Incorrect usage of "merge". Commit with id:' + customId + " already exists, use different custom id");
    error.hash = {
      text: `merge ${otherBranch} ${customId} ${overrideType} ${customTags?.join(" ")}`,
      token: `merge ${otherBranch} ${customId} ${overrideType} ${customTags?.join(" ")}`,
      expected: [
        `merge ${otherBranch} ${customId}_UNIQUE ${overrideType} ${customTags?.join(" ")}`
      ]
    };
    throw error;
  }
  const verifiedBranch = otherBranchCheck ? otherBranchCheck : "";
  const commit2 = {
    id: customId || `${state.records.seq}-${getID()}`,
    message: `merged branch ${otherBranch} into ${state.records.currBranch}`,
    seq: state.records.seq++,
    parents: state.records.head == null ? [] : [state.records.head.id, verifiedBranch],
    branch: state.records.currBranch,
    type: commitType.MERGE,
    customType: overrideType,
    customId: customId ? true : false,
    tags: customTags ?? []
  };
  state.records.head = commit2;
  state.records.commits.set(commit2.id, commit2);
  state.records.branches.set(state.records.currBranch, commit2.id);
  log.debug(state.records.branches);
  log.debug("in mergeBranch");
}, "merge");
var cherryPick = /* @__PURE__ */ __name(function(cherryPickDB) {
  let sourceId = cherryPickDB.id;
  let targetId = cherryPickDB.targetId;
  let tags = cherryPickDB.tags;
  let parentCommitId = cherryPickDB.parent;
  log.debug("Entering cherryPick:", sourceId, targetId, tags);
  const config = getConfig3();
  sourceId = common_default.sanitizeText(sourceId, config);
  targetId = common_default.sanitizeText(targetId, config);
  tags = tags?.map((tag) => common_default.sanitizeText(tag, config));
  parentCommitId = common_default.sanitizeText(parentCommitId, config);
  if (!sourceId || !state.records.commits.has(sourceId)) {
    const error = new Error('Incorrect usage of "cherryPick". Source commit id should exist and provided');
    error.hash = {
      text: `cherryPick ${sourceId} ${targetId}`,
      token: `cherryPick ${sourceId} ${targetId}`,
      expected: ["cherry-pick abc"]
    };
    throw error;
  }
  const sourceCommit = state.records.commits.get(sourceId);
  if (sourceCommit === undefined || !sourceCommit) {
    throw new Error('Incorrect usage of "cherryPick". Source commit id should exist and provided');
  }
  if (parentCommitId && !(Array.isArray(sourceCommit.parents) && sourceCommit.parents.includes(parentCommitId))) {
    const error = new Error("Invalid operation: The specified parent commit is not an immediate parent of the cherry-picked commit.");
    throw error;
  }
  const sourceCommitBranch = sourceCommit.branch;
  if (sourceCommit.type === commitType.MERGE && !parentCommitId) {
    const error = new Error("Incorrect usage of cherry-pick: If the source commit is a merge commit, an immediate parent commit must be specified.");
    throw error;
  }
  if (!targetId || !state.records.commits.has(targetId)) {
    if (sourceCommitBranch === state.records.currBranch) {
      const error = new Error('Incorrect usage of "cherryPick". Source commit is already on current branch');
      error.hash = {
        text: `cherryPick ${sourceId} ${targetId}`,
        token: `cherryPick ${sourceId} ${targetId}`,
        expected: ["cherry-pick abc"]
      };
      throw error;
    }
    const currentCommitId = state.records.branches.get(state.records.currBranch);
    if (currentCommitId === undefined || !currentCommitId) {
      const error = new Error(`Incorrect usage of "cherry-pick". Current branch (${state.records.currBranch})has no commits`);
      error.hash = {
        text: `cherryPick ${sourceId} ${targetId}`,
        token: `cherryPick ${sourceId} ${targetId}`,
        expected: ["cherry-pick abc"]
      };
      throw error;
    }
    const currentCommit = state.records.commits.get(currentCommitId);
    if (currentCommit === undefined || !currentCommit) {
      const error = new Error(`Incorrect usage of "cherry-pick". Current branch (${state.records.currBranch})has no commits`);
      error.hash = {
        text: `cherryPick ${sourceId} ${targetId}`,
        token: `cherryPick ${sourceId} ${targetId}`,
        expected: ["cherry-pick abc"]
      };
      throw error;
    }
    const commit2 = {
      id: state.records.seq + "-" + getID(),
      message: `cherry-picked ${sourceCommit?.message} into ${state.records.currBranch}`,
      seq: state.records.seq++,
      parents: state.records.head == null ? [] : [state.records.head.id, sourceCommit.id],
      branch: state.records.currBranch,
      type: commitType.CHERRY_PICK,
      tags: tags ? tags.filter(Boolean) : [
        `cherry-pick:${sourceCommit.id}${sourceCommit.type === commitType.MERGE ? `|parent:${parentCommitId}` : ""}`
      ]
    };
    state.records.head = commit2;
    state.records.commits.set(commit2.id, commit2);
    state.records.branches.set(state.records.currBranch, commit2.id);
    log.debug(state.records.branches);
    log.debug("in cherryPick");
  }
}, "cherryPick");
var checkout = /* @__PURE__ */ __name(function(branch2) {
  branch2 = common_default.sanitizeText(branch2, getConfig3());
  if (!state.records.branches.has(branch2)) {
    const error = new Error(`Trying to checkout branch which is not yet created. (Help try using "branch ${branch2}")`);
    error.hash = {
      text: `checkout ${branch2}`,
      token: `checkout ${branch2}`,
      expected: [`branch ${branch2}`]
    };
    throw error;
  } else {
    state.records.currBranch = branch2;
    const id = state.records.branches.get(state.records.currBranch);
    if (id === undefined || !id) {
      state.records.head = null;
    } else {
      state.records.head = state.records.commits.get(id) ?? null;
    }
  }
}, "checkout");
function upsert(arr, key, newVal) {
  const index = arr.indexOf(key);
  if (index === -1) {
    arr.push(newVal);
  } else {
    arr.splice(index, 1, newVal);
  }
}
__name(upsert, "upsert");
function prettyPrintCommitHistory(commitArr) {
  const commit2 = commitArr.reduce((out, commit3) => {
    if (out.seq > commit3.seq) {
      return out;
    }
    return commit3;
  }, commitArr[0]);
  let line = "";
  commitArr.forEach(function(c) {
    if (c === commit2) {
      line += "\t*";
    } else {
      line += "\t|";
    }
  });
  const label = [line, commit2.id, commit2.seq];
  for (const branch2 in state.records.branches) {
    if (state.records.branches.get(branch2) === commit2.id) {
      label.push(branch2);
    }
  }
  log.debug(label.join(" "));
  if (commit2.parents && commit2.parents.length == 2 && commit2.parents[0] && commit2.parents[1]) {
    const newCommit = state.records.commits.get(commit2.parents[0]);
    upsert(commitArr, commit2, newCommit);
    if (commit2.parents[1]) {
      commitArr.push(state.records.commits.get(commit2.parents[1]));
    }
  } else if (commit2.parents.length == 0) {
    return;
  } else {
    if (commit2.parents[0]) {
      const newCommit = state.records.commits.get(commit2.parents[0]);
      upsert(commitArr, commit2, newCommit);
    }
  }
  commitArr = uniqBy(commitArr, (c) => c.id);
  prettyPrintCommitHistory(commitArr);
}
__name(prettyPrintCommitHistory, "prettyPrintCommitHistory");
var prettyPrint = /* @__PURE__ */ __name(function() {
  log.debug(state.records.commits);
  const node = getCommitsArray()[0];
  prettyPrintCommitHistory([node]);
}, "prettyPrint");
var clear2 = /* @__PURE__ */ __name(function() {
  state.reset();
  clear();
}, "clear");
var getBranchesAsObjArray = /* @__PURE__ */ __name(function() {
  const branchesArray = [...state.records.branchConfig.values()].map((branchConfig, i) => {
    if (branchConfig.order !== null && branchConfig.order !== undefined) {
      return branchConfig;
    }
    return {
      ...branchConfig,
      order: parseFloat(`0.${i}`)
    };
  }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(({ name }) => ({ name }));
  return branchesArray;
}, "getBranchesAsObjArray");
var getBranches = /* @__PURE__ */ __name(function() {
  return state.records.branches;
}, "getBranches");
var getCommits = /* @__PURE__ */ __name(function() {
  return state.records.commits;
}, "getCommits");
var getCommitsArray = /* @__PURE__ */ __name(function() {
  const commitArr = [...state.records.commits.values()];
  commitArr.forEach(function(o) {
    log.debug(o.id);
  });
  commitArr.sort((a, b) => a.seq - b.seq);
  return commitArr;
}, "getCommitsArray");
var getCurrentBranch = /* @__PURE__ */ __name(function() {
  return state.records.currBranch;
}, "getCurrentBranch");
var getDirection = /* @__PURE__ */ __name(function() {
  return state.records.direction;
}, "getDirection");
var getHead = /* @__PURE__ */ __name(function() {
  return state.records.head;
}, "getHead");
var db = {
  commitType,
  getConfig: getConfig3,
  setDirection,
  setOptions,
  getOptions,
  commit,
  branch,
  merge,
  cherryPick,
  checkout,
  prettyPrint,
  clear: clear2,
  getBranchesAsObjArray,
  getBranches,
  getCommits,
  getCommitsArray,
  getCurrentBranch,
  getDirection,
  getHead,
  setAccTitle,
  getAccTitle,
  getAccDescription,
  setAccDescription,
  setDiagramTitle,
  getDiagramTitle
};
var populate = /* @__PURE__ */ __name((ast, db2) => {
  populateCommonDb(ast, db2);
  if (ast.dir) {
    db2.setDirection(ast.dir);
  }
  for (const statement of ast.statements) {
    parseStatement(statement, db2);
  }
}, "populate");
var parseStatement = /* @__PURE__ */ __name((statement, db2) => {
  const parsers = {
    Commit: /* @__PURE__ */ __name((stmt) => db2.commit(parseCommit(stmt)), "Commit"),
    Branch: /* @__PURE__ */ __name((stmt) => db2.branch(parseBranch(stmt)), "Branch"),
    Merge: /* @__PURE__ */ __name((stmt) => db2.merge(parseMerge(stmt)), "Merge"),
    Checkout: /* @__PURE__ */ __name((stmt) => db2.checkout(parseCheckout(stmt)), "Checkout"),
    CherryPicking: /* @__PURE__ */ __name((stmt) => db2.cherryPick(parseCherryPicking(stmt)), "CherryPicking")
  };
  const parser2 = parsers[statement.$type];
  if (parser2) {
    parser2(statement);
  } else {
    log.error(`Unknown statement type: ${statement.$type}`);
  }
}, "parseStatement");
var parseCommit = /* @__PURE__ */ __name((commit2) => {
  const commitDB = {
    id: commit2.id,
    msg: commit2.message ?? "",
    type: commit2.type !== undefined ? commitType[commit2.type] : commitType.NORMAL,
    tags: commit2.tags ?? undefined
  };
  return commitDB;
}, "parseCommit");
var parseBranch = /* @__PURE__ */ __name((branch2) => {
  const branchDB = {
    name: branch2.name,
    order: branch2.order ?? 0
  };
  return branchDB;
}, "parseBranch");
var parseMerge = /* @__PURE__ */ __name((merge2) => {
  const mergeDB = {
    branch: merge2.branch,
    id: merge2.id ?? "",
    type: merge2.type !== undefined ? commitType[merge2.type] : undefined,
    tags: merge2.tags ?? undefined
  };
  return mergeDB;
}, "parseMerge");
var parseCheckout = /* @__PURE__ */ __name((checkout2) => {
  const branch2 = checkout2.branch;
  return branch2;
}, "parseCheckout");
var parseCherryPicking = /* @__PURE__ */ __name((cherryPicking) => {
  const cherryPickDB = {
    id: cherryPicking.id,
    targetId: "",
    tags: cherryPicking.tags?.length === 0 ? undefined : cherryPicking.tags,
    parent: cherryPicking.parent
  };
  return cherryPickDB;
}, "parseCherryPicking");
var parser = {
  parse: /* @__PURE__ */ __name(async (input) => {
    const ast = await parse("gitGraph", input);
    log.debug(ast);
    populate(ast, db);
  }, "parse")
};
if (undefined) {}
var LAYOUT_OFFSET = 10;
var COMMIT_STEP = 40;
var PX = 4;
var PY = 2;
var THEME_COLOR_LIMIT = 8;
var REDUX_GEOMETRY_THEMES = /* @__PURE__ */ new Set(["redux", "redux-dark", "redux-color", "redux-dark-color"]);
var REDUX_BRANCH_LABEL_PADDING_Y = 12;
var COLOR_THEMES = /* @__PURE__ */ new Set(["redux-color", "redux-dark-color"]);
var DARK_THEMES = /* @__PURE__ */ new Set(["dark", "redux-dark", "redux-dark-color", "neo-dark"]);
var calcColorIndex = /* @__PURE__ */ __name((rawIndex, limit, avoidDefaultColor = false) => {
  if (avoidDefaultColor && rawIndex > 0) {
    return (rawIndex - 1) % (limit - 1) + 1;
  }
  return rawIndex % limit;
}, "calcColorIndex");
var branchPos = /* @__PURE__ */ new Map;
var commitPos = /* @__PURE__ */ new Map;
var defaultPos = 30;
var allCommitsDict = /* @__PURE__ */ new Map;
var lanes = [];
var maxPos = 0;
var dir = "LR";
var clear3 = /* @__PURE__ */ __name(() => {
  branchPos.clear();
  commitPos.clear();
  allCommitsDict.clear();
  maxPos = 0;
  lanes = [];
  dir = "LR";
}, "clear");
var drawText = /* @__PURE__ */ __name((txt) => {
  const svgLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  const rows = typeof txt === "string" ? txt.split(/\\n|\n|<br\s*\/?>/gi) : txt;
  rows.forEach((row) => {
    const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    tspan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
    tspan.setAttribute("dy", "1em");
    tspan.setAttribute("x", "0");
    tspan.setAttribute("class", "row");
    tspan.textContent = row.trim();
    svgLabel.appendChild(tspan);
  });
  return svgLabel;
}, "drawText");
var findClosestParent = /* @__PURE__ */ __name((parents) => {
  let closestParent;
  let comparisonFunc;
  let targetPosition;
  if (dir === "BT") {
    comparisonFunc = /* @__PURE__ */ __name((a, b) => a <= b, "comparisonFunc");
    targetPosition = Infinity;
  } else {
    comparisonFunc = /* @__PURE__ */ __name((a, b) => a >= b, "comparisonFunc");
    targetPosition = 0;
  }
  parents.forEach((parent) => {
    const parentPosition = dir === "TB" || dir == "BT" ? commitPos.get(parent)?.y : commitPos.get(parent)?.x;
    if (parentPosition !== undefined && comparisonFunc(parentPosition, targetPosition)) {
      closestParent = parent;
      targetPosition = parentPosition;
    }
  });
  return closestParent;
}, "findClosestParent");
var findClosestParentBT = /* @__PURE__ */ __name((parents) => {
  let closestParent = "";
  let maxPosition = Infinity;
  parents.forEach((parent) => {
    const parentPosition = commitPos.get(parent).y;
    if (parentPosition <= maxPosition) {
      closestParent = parent;
      maxPosition = parentPosition;
    }
  });
  return closestParent || undefined;
}, "findClosestParentBT");
var setParallelBTPos = /* @__PURE__ */ __name((sortedKeys, commits, defaultPos2) => {
  let curPos = defaultPos2;
  let maxPosition = defaultPos2;
  const roots = [];
  sortedKeys.forEach((key) => {
    const commit2 = commits.get(key);
    if (!commit2) {
      throw new Error(`Commit not found for key ${key}`);
    }
    if (commit2.parents.length) {
      curPos = calculateCommitPosition(commit2);
      maxPosition = Math.max(curPos, maxPosition);
    } else {
      roots.push(commit2);
    }
    setCommitPosition(commit2, curPos);
  });
  curPos = maxPosition;
  roots.forEach((commit2) => {
    setRootPosition(commit2, curPos, defaultPos2);
  });
  sortedKeys.forEach((key) => {
    const commit2 = commits.get(key);
    if (commit2?.parents.length) {
      const closestParent = findClosestParentBT(commit2.parents);
      curPos = commitPos.get(closestParent).y - COMMIT_STEP;
      if (curPos <= maxPosition) {
        maxPosition = curPos;
      }
      const x = branchPos.get(commit2.branch).pos;
      const y = curPos - LAYOUT_OFFSET;
      commitPos.set(commit2.id, { x, y });
    }
  });
}, "setParallelBTPos");
var findClosestParentPos = /* @__PURE__ */ __name((commit2) => {
  const closestParent = findClosestParent(commit2.parents.filter((p) => p !== null));
  if (!closestParent) {
    throw new Error(`Closest parent not found for commit ${commit2.id}`);
  }
  const closestParentPos = commitPos.get(closestParent)?.y;
  if (closestParentPos === undefined) {
    throw new Error(`Closest parent position not found for commit ${commit2.id}`);
  }
  return closestParentPos;
}, "findClosestParentPos");
var calculateCommitPosition = /* @__PURE__ */ __name((commit2) => {
  const closestParentPos = findClosestParentPos(commit2);
  return closestParentPos + COMMIT_STEP;
}, "calculateCommitPosition");
var setCommitPosition = /* @__PURE__ */ __name((commit2, curPos) => {
  const branch2 = branchPos.get(commit2.branch);
  if (!branch2) {
    throw new Error(`Branch not found for commit ${commit2.id}`);
  }
  const x = branch2.pos;
  const y = curPos + LAYOUT_OFFSET;
  commitPos.set(commit2.id, { x, y });
  return { x, y };
}, "setCommitPosition");
var setRootPosition = /* @__PURE__ */ __name((commit2, curPos, defaultPos2) => {
  const branch2 = branchPos.get(commit2.branch);
  if (!branch2) {
    throw new Error(`Branch not found for commit ${commit2.id}`);
  }
  const y = curPos + defaultPos2;
  const x = branch2.pos;
  commitPos.set(commit2.id, { x, y });
}, "setRootPosition");
var drawCommitBullet = /* @__PURE__ */ __name((gBullets, commit2, commitPosition, typeClass, branchIndex, commitSymbolType) => {
  const { theme } = getConfig2();
  const useReduxGeometry = REDUX_GEOMETRY_THEMES.has(theme ?? "");
  const useColorTheme = COLOR_THEMES.has(theme ?? "");
  const isDark = DARK_THEMES.has(theme ?? "");
  if (commitSymbolType === commitType.HIGHLIGHT) {
    gBullets.append("rect").attr("x", commitPosition.x - 10 + (useReduxGeometry ? 3 : 0)).attr("y", commitPosition.y - 10 + (useReduxGeometry ? 3 : 0)).attr("width", useReduxGeometry ? 14 : 20).attr("height", useReduxGeometry ? 14 : 20).attr("class", `commit ${commit2.id} commit-highlight${calcColorIndex(branchIndex, THEME_COLOR_LIMIT, useColorTheme)} ${typeClass}-outer`);
    gBullets.append("rect").attr("x", commitPosition.x - 6 + (useReduxGeometry ? 2 : 0)).attr("y", commitPosition.y - 6 + (useReduxGeometry ? 2 : 0)).attr("width", useReduxGeometry ? 8 : 12).attr("height", useReduxGeometry ? 8 : 12).attr("class", `commit ${commit2.id} commit${calcColorIndex(branchIndex, THEME_COLOR_LIMIT, useColorTheme)} ${typeClass}-inner`);
  } else if (commitSymbolType === commitType.CHERRY_PICK) {
    gBullets.append("circle").attr("cx", commitPosition.x).attr("cy", commitPosition.y).attr("r", useReduxGeometry ? 7 : 10).attr("class", `commit ${commit2.id} ${typeClass}`);
    gBullets.append("circle").attr("cx", commitPosition.x - 3).attr("cy", commitPosition.y + 2).attr("r", useReduxGeometry ? 2.5 : 2.75).attr("fill", isDark ? "#000000" : "#fff").attr("class", `commit ${commit2.id} ${typeClass}`);
    gBullets.append("circle").attr("cx", commitPosition.x + 3).attr("cy", commitPosition.y + 2).attr("r", useReduxGeometry ? 2.5 : 2.75).attr("fill", isDark ? "#000000" : "#fff").attr("class", `commit ${commit2.id} ${typeClass}`);
    gBullets.append("line").attr("x1", commitPosition.x + 3).attr("y1", commitPosition.y + 1).attr("x2", commitPosition.x).attr("y2", commitPosition.y - 5).attr("stroke", isDark ? "#000000" : "#fff").attr("class", `commit ${commit2.id} ${typeClass}`);
    gBullets.append("line").attr("x1", commitPosition.x - 3).attr("y1", commitPosition.y + 1).attr("x2", commitPosition.x).attr("y2", commitPosition.y - 5).attr("stroke", isDark ? "#000000" : "#fff").attr("class", `commit ${commit2.id} ${typeClass}`);
  } else {
    const circle = gBullets.append("circle");
    circle.attr("cx", commitPosition.x);
    circle.attr("cy", commitPosition.y);
    circle.attr("r", useReduxGeometry ? 7 : 10);
    circle.attr("class", `commit ${commit2.id} commit${calcColorIndex(branchIndex, THEME_COLOR_LIMIT, useColorTheme)}`);
    if (commitSymbolType === commitType.MERGE) {
      const circle2 = gBullets.append("circle");
      circle2.attr("cx", commitPosition.x);
      circle2.attr("cy", commitPosition.y);
      circle2.attr("r", useReduxGeometry ? 5 : 6);
      circle2.attr("class", `commit ${typeClass} ${commit2.id} commit${calcColorIndex(branchIndex, THEME_COLOR_LIMIT, useColorTheme)}`);
    }
    if (commitSymbolType === commitType.REVERSE) {
      const cross = gBullets.append("path");
      const constValue = useReduxGeometry ? 4 : 5;
      cross.attr("d", `M ${commitPosition.x - constValue},${commitPosition.y - constValue}L${commitPosition.x + constValue},${commitPosition.y + constValue}M${commitPosition.x - constValue},${commitPosition.y + constValue}L${commitPosition.x + constValue},${commitPosition.y - constValue}`).attr("class", `commit ${typeClass} ${commit2.id} commit${calcColorIndex(branchIndex, THEME_COLOR_LIMIT, useColorTheme)}`);
    }
  }
}, "drawCommitBullet");
var drawCommitLabel = /* @__PURE__ */ __name((gLabels, commit2, commitPosition, pos, gitGraphConfig) => {
  if (commit2.type !== commitType.CHERRY_PICK && (commit2.customId && commit2.type === commitType.MERGE || commit2.type !== commitType.MERGE) && gitGraphConfig.showCommitLabel) {
    const wrapper = gLabels.append("g");
    const labelBkg = wrapper.insert("rect").attr("class", "commit-label-bkg");
    const text = wrapper.append("text").attr("x", pos).attr("y", commitPosition.y + 25).attr("class", "commit-label").text(commit2.id);
    const bbox = text.node()?.getBBox();
    if (bbox) {
      labelBkg.attr("x", commitPosition.posWithOffset - bbox.width / 2 - PY).attr("y", commitPosition.y + 13.5).attr("width", bbox.width + 2 * PY).attr("height", bbox.height + 2 * PY);
      if (dir === "TB" || dir === "BT") {
        labelBkg.attr("x", commitPosition.x - (bbox.width + 4 * PX + 5)).attr("y", commitPosition.y - 12);
        text.attr("x", commitPosition.x - (bbox.width + 4 * PX)).attr("y", commitPosition.y + bbox.height - 12);
      } else {
        text.attr("x", commitPosition.posWithOffset - bbox.width / 2);
      }
      if (gitGraphConfig.rotateCommitLabel) {
        if (dir === "TB" || dir === "BT") {
          text.attr("transform", "rotate(-45, " + commitPosition.x + ", " + commitPosition.y + ")");
          labelBkg.attr("transform", "rotate(-45, " + commitPosition.x + ", " + commitPosition.y + ")");
        } else {
          const r_x = -7.5 - (bbox.width + 10) / 25 * 9.5;
          const r_y = 10 + bbox.width / 25 * 8.5;
          wrapper.attr("transform", "translate(" + r_x + ", " + r_y + ") rotate(-45, " + pos + ", " + commitPosition.y + ")");
        }
      }
    }
  }
}, "drawCommitLabel");
var drawCommitTags = /* @__PURE__ */ __name((gLabels, commit2, commitPosition, pos) => {
  if (commit2.tags.length > 0) {
    let yOffset = 0;
    let maxTagBboxWidth = 0;
    let maxTagBboxHeight = 0;
    const tagElements = [];
    for (const tagValue of commit2.tags.reverse()) {
      const rect = gLabels.insert("polygon");
      const hole = gLabels.append("circle");
      const tag = gLabels.append("text").attr("y", commitPosition.y - 16 - yOffset).attr("class", "tag-label").text(tagValue);
      const tagBbox = tag.node()?.getBBox();
      if (!tagBbox) {
        throw new Error("Tag bbox not found");
      }
      maxTagBboxWidth = Math.max(maxTagBboxWidth, tagBbox.width);
      maxTagBboxHeight = Math.max(maxTagBboxHeight, tagBbox.height);
      tag.attr("x", commitPosition.posWithOffset - tagBbox.width / 2);
      tagElements.push({
        tag,
        hole,
        rect,
        yOffset
      });
      yOffset += 20;
    }
    for (const { tag, hole, rect, yOffset: yOffset2 } of tagElements) {
      const h2 = maxTagBboxHeight / 2;
      const ly = commitPosition.y - 19.2 - yOffset2;
      rect.attr("class", "tag-label-bkg").attr("points", `
      ${pos - maxTagBboxWidth / 2 - PX / 2},${ly + PY}  
      ${pos - maxTagBboxWidth / 2 - PX / 2},${ly - PY}
      ${commitPosition.posWithOffset - maxTagBboxWidth / 2 - PX},${ly - h2 - PY}
      ${commitPosition.posWithOffset + maxTagBboxWidth / 2 + PX},${ly - h2 - PY}
      ${commitPosition.posWithOffset + maxTagBboxWidth / 2 + PX},${ly + h2 + PY}
      ${commitPosition.posWithOffset - maxTagBboxWidth / 2 - PX},${ly + h2 + PY}`);
      hole.attr("cy", ly).attr("cx", pos - maxTagBboxWidth / 2 + PX / 2).attr("r", 1.5).attr("class", "tag-hole");
      if (dir === "TB" || dir === "BT") {
        const yOrigin = pos + yOffset2;
        rect.attr("class", "tag-label-bkg").attr("points", `
        ${commitPosition.x},${yOrigin + 2}
        ${commitPosition.x},${yOrigin - 2}
        ${commitPosition.x + LAYOUT_OFFSET},${yOrigin - h2 - 2}
        ${commitPosition.x + LAYOUT_OFFSET + maxTagBboxWidth + 4},${yOrigin - h2 - 2}
        ${commitPosition.x + LAYOUT_OFFSET + maxTagBboxWidth + 4},${yOrigin + h2 + 2}
        ${commitPosition.x + LAYOUT_OFFSET},${yOrigin + h2 + 2}`).attr("transform", "translate(12,12) rotate(45, " + commitPosition.x + "," + pos + ")");
        hole.attr("cx", commitPosition.x + PX / 2).attr("cy", yOrigin).attr("transform", "translate(12,12) rotate(45, " + commitPosition.x + "," + pos + ")");
        tag.attr("x", commitPosition.x + 5).attr("y", yOrigin + 3).attr("transform", "translate(14,14) rotate(45, " + commitPosition.x + "," + pos + ")");
      }
    }
  }
}, "drawCommitTags");
var getCommitClassType = /* @__PURE__ */ __name((commit2) => {
  const commitSymbolType = commit2.customType ?? commit2.type;
  switch (commitSymbolType) {
    case commitType.NORMAL:
      return "commit-normal";
    case commitType.REVERSE:
      return "commit-reverse";
    case commitType.HIGHLIGHT:
      return "commit-highlight";
    case commitType.MERGE:
      return "commit-merge";
    case commitType.CHERRY_PICK:
      return "commit-cherry-pick";
    default:
      return "commit-normal";
  }
}, "getCommitClassType");
var calculatePosition = /* @__PURE__ */ __name((commit2, dir2, pos, commitPos2) => {
  const defaultCommitPosition = { x: 0, y: 0 };
  if (commit2.parents.length > 0) {
    const closestParent = findClosestParent(commit2.parents);
    if (closestParent) {
      const parentPosition = commitPos2.get(closestParent) ?? defaultCommitPosition;
      if (dir2 === "TB") {
        return parentPosition.y + COMMIT_STEP;
      } else if (dir2 === "BT") {
        const currentPosition = commitPos2.get(commit2.id) ?? defaultCommitPosition;
        return currentPosition.y - COMMIT_STEP;
      } else {
        return parentPosition.x + COMMIT_STEP;
      }
    }
  } else {
    if (dir2 === "TB") {
      return defaultPos;
    } else if (dir2 === "BT") {
      const currentPosition = commitPos2.get(commit2.id) ?? defaultCommitPosition;
      return currentPosition.y - COMMIT_STEP;
    } else {
      return 0;
    }
  }
  return 0;
}, "calculatePosition");
var getCommitPosition = /* @__PURE__ */ __name((commit2, pos, isParallelCommits) => {
  const posWithOffset = dir === "BT" && isParallelCommits ? pos : pos + LAYOUT_OFFSET;
  const branchY = branchPos.get(commit2.branch)?.pos;
  const x = dir === "TB" || dir === "BT" ? branchPos.get(commit2.branch)?.pos : posWithOffset;
  if (x === undefined || branchY === undefined) {
    throw new Error(`Position were undefined for commit ${commit2.id}`);
  }
  const useReduxGeometry = REDUX_GEOMETRY_THEMES.has(getConfig2().theme ?? "");
  const y = dir === "TB" || dir === "BT" ? posWithOffset : branchY + (useReduxGeometry ? REDUX_BRANCH_LABEL_PADDING_Y / 2 + 1 : -2);
  return { x, y, posWithOffset };
}, "getCommitPosition");
var drawCommits = /* @__PURE__ */ __name((svg, commits, modifyGraph, gitGraphConfig) => {
  const gBullets = svg.append("g").attr("class", "commit-bullets");
  const gLabels = svg.append("g").attr("class", "commit-labels");
  let pos = dir === "TB" || dir === "BT" ? defaultPos : 0;
  const keys = [...commits.keys()];
  const isParallelCommits = gitGraphConfig.parallelCommits ?? false;
  const sortKeys = /* @__PURE__ */ __name((a, b) => {
    const seqA = commits.get(a)?.seq;
    const seqB = commits.get(b)?.seq;
    return seqA !== undefined && seqB !== undefined ? seqA - seqB : 0;
  }, "sortKeys");
  let sortedKeys = keys.sort(sortKeys);
  if (dir === "BT") {
    if (isParallelCommits) {
      setParallelBTPos(sortedKeys, commits, pos);
    }
    sortedKeys = sortedKeys.reverse();
  }
  sortedKeys.forEach((key) => {
    const commit2 = commits.get(key);
    if (!commit2) {
      throw new Error(`Commit not found for key ${key}`);
    }
    if (isParallelCommits) {
      pos = calculatePosition(commit2, dir, pos, commitPos);
    }
    const commitPosition = getCommitPosition(commit2, pos, isParallelCommits);
    if (modifyGraph) {
      const typeClass = getCommitClassType(commit2);
      const commitSymbolType = commit2.customType ?? commit2.type;
      const branchIndex = branchPos.get(commit2.branch)?.index ?? 0;
      drawCommitBullet(gBullets, commit2, commitPosition, typeClass, branchIndex, commitSymbolType);
      drawCommitLabel(gLabels, commit2, commitPosition, pos, gitGraphConfig);
      drawCommitTags(gLabels, commit2, commitPosition, pos);
    }
    if (dir === "TB" || dir === "BT") {
      commitPos.set(commit2.id, { x: commitPosition.x, y: commitPosition.posWithOffset });
    } else {
      commitPos.set(commit2.id, { x: commitPosition.posWithOffset, y: commitPosition.y });
    }
    pos = dir === "BT" && isParallelCommits ? pos + COMMIT_STEP : pos + COMMIT_STEP + LAYOUT_OFFSET;
    if (pos > maxPos) {
      maxPos = pos;
    }
  });
}, "drawCommits");
var shouldRerouteArrow = /* @__PURE__ */ __name((commitA, commitB, p1, p2, allCommits) => {
  const commitBIsFurthest = dir === "TB" || dir === "BT" ? p1.x < p2.x : p1.y < p2.y;
  const branchToGetCurve = commitBIsFurthest ? commitB.branch : commitA.branch;
  const isOnBranchToGetCurve = /* @__PURE__ */ __name((x) => x.branch === branchToGetCurve, "isOnBranchToGetCurve");
  const isBetweenCommits = /* @__PURE__ */ __name((x) => x.seq > commitA.seq && x.seq < commitB.seq, "isBetweenCommits");
  return [...allCommits.values()].some((commitX) => {
    return isBetweenCommits(commitX) && isOnBranchToGetCurve(commitX);
  });
}, "shouldRerouteArrow");
var findLane = /* @__PURE__ */ __name((y1, y2, depth = 0) => {
  const candidate = y1 + Math.abs(y1 - y2) / 2;
  if (depth > 5) {
    return candidate;
  }
  const ok = lanes.every((lane) => Math.abs(lane - candidate) >= 10);
  if (ok) {
    lanes.push(candidate);
    return candidate;
  }
  const diff = Math.abs(y1 - y2);
  return findLane(y1, y2 - diff / 5, depth + 1);
}, "findLane");
var drawArrow = /* @__PURE__ */ __name((svg, commitA, commitB, allCommits) => {
  const { theme: arrowTheme } = getConfig2();
  const useColorTheme = COLOR_THEMES.has(arrowTheme ?? "");
  const p1 = commitPos.get(commitA.id);
  const p2 = commitPos.get(commitB.id);
  if (p1 === undefined || p2 === undefined) {
    throw new Error(`Commit positions not found for commits ${commitA.id} and ${commitB.id}`);
  }
  const arrowNeedsRerouting = shouldRerouteArrow(commitA, commitB, p1, p2, allCommits);
  let arc = "";
  let arc2 = "";
  let radius = 0;
  let offset = 0;
  let colorClassNum = branchPos.get(commitB.branch)?.index;
  if (commitB.type === commitType.MERGE && commitA.id !== commitB.parents[0]) {
    colorClassNum = branchPos.get(commitA.branch)?.index;
  }
  let lineDef;
  if (arrowNeedsRerouting) {
    arc = "A 10 10, 0, 0, 0,";
    arc2 = "A 10 10, 0, 0, 1,";
    radius = 10;
    offset = 10;
    const lineY = p1.y < p2.y ? findLane(p1.y, p2.y) : findLane(p2.y, p1.y);
    const lineX = p1.x < p2.x ? findLane(p1.x, p2.x) : findLane(p2.x, p1.x);
    if (dir === "TB") {
      if (p1.x < p2.x) {
        lineDef = `M ${p1.x} ${p1.y} L ${lineX - radius} ${p1.y} ${arc2} ${lineX} ${p1.y + offset} L ${lineX} ${p2.y - radius} ${arc} ${lineX + offset} ${p2.y} L ${p2.x} ${p2.y}`;
      } else {
        colorClassNum = branchPos.get(commitA.branch)?.index;
        lineDef = `M ${p1.x} ${p1.y} L ${lineX + radius} ${p1.y} ${arc} ${lineX} ${p1.y + offset} L ${lineX} ${p2.y - radius} ${arc2} ${lineX - offset} ${p2.y} L ${p2.x} ${p2.y}`;
      }
    } else if (dir === "BT") {
      if (p1.x < p2.x) {
        lineDef = `M ${p1.x} ${p1.y} L ${lineX - radius} ${p1.y} ${arc} ${lineX} ${p1.y - offset} L ${lineX} ${p2.y + radius} ${arc2} ${lineX + offset} ${p2.y} L ${p2.x} ${p2.y}`;
      } else {
        colorClassNum = branchPos.get(commitA.branch)?.index;
        lineDef = `M ${p1.x} ${p1.y} L ${lineX + radius} ${p1.y} ${arc2} ${lineX} ${p1.y - offset} L ${lineX} ${p2.y + radius} ${arc} ${lineX - offset} ${p2.y} L ${p2.x} ${p2.y}`;
      }
    } else {
      if (p1.y < p2.y) {
        lineDef = `M ${p1.x} ${p1.y} L ${p1.x} ${lineY - radius} ${arc} ${p1.x + offset} ${lineY} L ${p2.x - radius} ${lineY} ${arc2} ${p2.x} ${lineY + offset} L ${p2.x} ${p2.y}`;
      } else {
        colorClassNum = branchPos.get(commitA.branch)?.index;
        lineDef = `M ${p1.x} ${p1.y} L ${p1.x} ${lineY + radius} ${arc2} ${p1.x + offset} ${lineY} L ${p2.x - radius} ${lineY} ${arc} ${p2.x} ${lineY - offset} L ${p2.x} ${p2.y}`;
      }
    }
  } else {
    arc = "A 20 20, 0, 0, 0,";
    arc2 = "A 20 20, 0, 0, 1,";
    radius = 20;
    offset = 20;
    if (dir === "TB") {
      if (p1.x < p2.x) {
        if (commitB.type === commitType.MERGE && commitA.id !== commitB.parents[0]) {
          lineDef = `M ${p1.x} ${p1.y} L ${p1.x} ${p2.y - radius} ${arc} ${p1.x + offset} ${p2.y} L ${p2.x} ${p2.y}`;
        } else {
          lineDef = `M ${p1.x} ${p1.y} L ${p2.x - radius} ${p1.y} ${arc2} ${p2.x} ${p1.y + offset} L ${p2.x} ${p2.y}`;
        }
      }
      if (p1.x > p2.x) {
        arc = "A 20 20, 0, 0, 0,";
        arc2 = "A 20 20, 0, 0, 1,";
        radius = 20;
        offset = 20;
        if (commitB.type === commitType.MERGE && commitA.id !== commitB.parents[0]) {
          lineDef = `M ${p1.x} ${p1.y} L ${p1.x} ${p2.y - radius} ${arc2} ${p1.x - offset} ${p2.y} L ${p2.x} ${p2.y}`;
        } else {
          lineDef = `M ${p1.x} ${p1.y} L ${p2.x + radius} ${p1.y} ${arc} ${p2.x} ${p1.y + offset} L ${p2.x} ${p2.y}`;
        }
      }
      if (p1.x === p2.x) {
        lineDef = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
      }
    } else if (dir === "BT") {
      if (p1.x < p2.x) {
        if (commitB.type === commitType.MERGE && commitA.id !== commitB.parents[0]) {
          lineDef = `M ${p1.x} ${p1.y} L ${p1.x} ${p2.y + radius} ${arc2} ${p1.x + offset} ${p2.y} L ${p2.x} ${p2.y}`;
        } else {
          lineDef = `M ${p1.x} ${p1.y} L ${p2.x - radius} ${p1.y} ${arc} ${p2.x} ${p1.y - offset} L ${p2.x} ${p2.y}`;
        }
      }
      if (p1.x > p2.x) {
        arc = "A 20 20, 0, 0, 0,";
        arc2 = "A 20 20, 0, 0, 1,";
        radius = 20;
        offset = 20;
        if (commitB.type === commitType.MERGE && commitA.id !== commitB.parents[0]) {
          lineDef = `M ${p1.x} ${p1.y} L ${p1.x} ${p2.y + radius} ${arc} ${p1.x - offset} ${p2.y} L ${p2.x} ${p2.y}`;
        } else {
          lineDef = `M ${p1.x} ${p1.y} L ${p2.x + radius} ${p1.y} ${arc2} ${p2.x} ${p1.y - offset} L ${p2.x} ${p2.y}`;
        }
      }
      if (p1.x === p2.x) {
        lineDef = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
      }
    } else {
      if (p1.y < p2.y) {
        if (commitB.type === commitType.MERGE && commitA.id !== commitB.parents[0]) {
          lineDef = `M ${p1.x} ${p1.y} L ${p2.x - radius} ${p1.y} ${arc2} ${p2.x} ${p1.y + offset} L ${p2.x} ${p2.y}`;
        } else {
          lineDef = `M ${p1.x} ${p1.y} L ${p1.x} ${p2.y - radius} ${arc} ${p1.x + offset} ${p2.y} L ${p2.x} ${p2.y}`;
        }
      }
      if (p1.y > p2.y) {
        if (commitB.type === commitType.MERGE && commitA.id !== commitB.parents[0]) {
          lineDef = `M ${p1.x} ${p1.y} L ${p2.x - radius} ${p1.y} ${arc} ${p2.x} ${p1.y - offset} L ${p2.x} ${p2.y}`;
        } else {
          lineDef = `M ${p1.x} ${p1.y} L ${p1.x} ${p2.y + radius} ${arc2} ${p1.x + offset} ${p2.y} L ${p2.x} ${p2.y}`;
        }
      }
      if (p1.y === p2.y) {
        lineDef = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
      }
    }
  }
  if (lineDef === undefined) {
    throw new Error("Line definition not found");
  }
  svg.append("path").attr("d", lineDef).attr("class", "arrow arrow" + calcColorIndex(colorClassNum, THEME_COLOR_LIMIT, useColorTheme));
}, "drawArrow");
var drawArrows = /* @__PURE__ */ __name((svg, commits) => {
  const gArrows = svg.append("g").attr("class", "commit-arrows");
  [...commits.keys()].forEach((key) => {
    const commit2 = commits.get(key);
    if (commit2.parents && commit2.parents.length > 0) {
      commit2.parents.forEach((parent) => {
        drawArrow(gArrows, commits.get(parent), commit2, commits);
      });
    }
  });
}, "drawArrows");
var drawBranches = /* @__PURE__ */ __name((svg, branches, gitGraphConfig, id) => {
  const { look, theme, themeVariables } = getConfig2();
  const { dropShadow, THEME_COLOR_LIMIT: themeColorLimit } = themeVariables;
  const useReduxGeometry = REDUX_GEOMETRY_THEMES.has(theme ?? "");
  const useColorTheme = COLOR_THEMES.has(theme ?? "");
  const g = svg.append("g");
  branches.forEach((branch2, index) => {
    const adjustIndexForTheme = calcColorIndex(index, useReduxGeometry ? themeColorLimit : THEME_COLOR_LIMIT, useColorTheme);
    const pos = branchPos.get(branch2.name)?.pos;
    if (pos === undefined) {
      throw new Error(`Position not found for branch ${branch2.name}`);
    }
    const spineY = dir === "TB" || dir === "BT" ? pos : useReduxGeometry ? pos + REDUX_BRANCH_LABEL_PADDING_Y / 2 + 1 : pos - 2;
    const line = g.append("line");
    line.attr("x1", 0);
    line.attr("y1", spineY);
    line.attr("x2", maxPos);
    line.attr("y2", spineY);
    line.attr("class", "branch branch" + adjustIndexForTheme);
    if (dir === "TB") {
      line.attr("y1", defaultPos);
      line.attr("x1", pos);
      line.attr("y2", maxPos);
      line.attr("x2", pos);
    } else if (dir === "BT") {
      line.attr("y1", maxPos);
      line.attr("x1", pos);
      line.attr("y2", defaultPos);
      line.attr("x2", pos);
    }
    lanes.push(spineY);
    const name = branch2.name;
    const labelElement = drawText(name);
    const bkg = g.insert("rect");
    const branchLabel = g.insert("g").attr("class", "branchLabel");
    const label = branchLabel.insert("g").attr("class", "label branch-label" + adjustIndexForTheme);
    label.node().appendChild(labelElement);
    const bbox = labelElement.getBBox();
    const borderRadius = useReduxGeometry ? 0 : 4;
    const labelPaddingX = useReduxGeometry ? 16 : 0;
    const labelPaddingY = useReduxGeometry ? REDUX_BRANCH_LABEL_PADDING_Y : 0;
    if (look === "neo") {
      bkg.attr("data-look", `neo`);
    }
    bkg.attr("class", "branchLabelBkg label" + adjustIndexForTheme).attr("style", look === "neo" ? `filter:${useReduxGeometry ? `url(#${id}-drop-shadow)` : dropShadow}` : "").attr("rx", borderRadius).attr("ry", borderRadius).attr("x", -bbox.width - 4 - (gitGraphConfig.rotateCommitLabel === true ? 30 : 0)).attr("y", -bbox.height / 2 + 10).attr("width", bbox.width + 18 + labelPaddingX).attr("height", bbox.height + 4 + labelPaddingY);
    label.attr("transform", "translate(" + (-bbox.width - 14 - (gitGraphConfig.rotateCommitLabel === true ? 30 : 0) + labelPaddingX / 2) + ", " + (spineY - bbox.height / 2 - 2) + ")");
    if (dir === "TB") {
      bkg.attr("x", pos - bbox.width / 2 - 10).attr("y", 0);
      label.attr("transform", "translate(" + (pos - bbox.width / 2 - 5) + ", 0)");
      if (useReduxGeometry) {
        bkg.attr("transform", `translate(${-labelPaddingX / 2 - 3}, ${-labelPaddingY - 10})`);
        label.attr("transform", "translate(" + (pos - bbox.width / 2 - 5) + ", " + (-labelPaddingY * 2 + 7) + ")");
      }
    } else if (dir === "BT") {
      bkg.attr("x", pos - bbox.width / 2 - 10).attr("y", maxPos);
      label.attr("transform", "translate(" + (pos - bbox.width / 2 - 5) + ", " + maxPos + ")");
      if (useReduxGeometry) {
        bkg.attr("transform", `translate(${-labelPaddingX / 2 - 3}, ${labelPaddingY + 10})`);
        label.attr("transform", "translate(" + (pos - bbox.width / 2 - 5) + ", " + (maxPos + labelPaddingY * 2 + 4) + ")");
      }
    } else {
      bkg.attr("transform", "translate(-19, " + (spineY - 12 - labelPaddingY / 2) + ")");
    }
  });
}, "drawBranches");
var setBranchPosition = /* @__PURE__ */ __name(function(name, pos, index, bbox, rotateCommitLabel) {
  branchPos.set(name, { pos, index });
  pos += 50 + (rotateCommitLabel ? 40 : 0) + (dir === "TB" || dir === "BT" ? bbox.width / 2 : 0);
  return pos;
}, "setBranchPosition");
var draw = /* @__PURE__ */ __name(function(txt, id, ver, diagObj) {
  clear3();
  log.debug("in gitgraph renderer", txt + `
`, "id:", id, ver);
  const db2 = diagObj.db;
  if (!db2.getConfig) {
    log.error("getConfig method is not available on db");
    return;
  }
  const gitGraphConfig = db2.getConfig();
  const rotateCommitLabel = gitGraphConfig.rotateCommitLabel ?? false;
  allCommitsDict = db2.getCommits();
  const branches = db2.getBranchesAsObjArray();
  dir = db2.getDirection();
  const diagram2 = select_default(`[id="${id}"]`);
  const { look, theme, themeVariables } = getConfig2();
  const { useGradient, gradientStart, gradientStop, filterColor } = themeVariables;
  if (useGradient) {
    const gradient = diagram2.append("defs").append("linearGradient").attr("id", id + "-gradient").attr("gradientUnits", "objectBoundingBox").attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", gradientStart).attr("stop-opacity", 1);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", gradientStop).attr("stop-opacity", 1);
  }
  if (look === "neo" && REDUX_GEOMETRY_THEMES.has(theme ?? "")) {
    diagram2.append("defs").append("filter").attr("id", id + "-drop-shadow").attr("height", "130%").attr("width", "130%").append("feDropShadow").attr("dx", "4").attr("dy", "4").attr("stdDeviation", 0).attr("flood-opacity", "0.06").attr("flood-color", filterColor);
  }
  let pos = 0;
  branches.forEach((branch2, index) => {
    const labelElement = drawText(branch2.name);
    const g = diagram2.append("g");
    const branchLabel = g.insert("g").attr("class", "branchLabel");
    const label = branchLabel.insert("g").attr("class", "label branch-label");
    label.node()?.appendChild(labelElement);
    const bbox = labelElement.getBBox();
    pos = setBranchPosition(branch2.name, pos, index, bbox, rotateCommitLabel);
    label.remove();
    branchLabel.remove();
    g.remove();
  });
  drawCommits(diagram2, allCommitsDict, false, gitGraphConfig);
  if (gitGraphConfig.showBranches) {
    drawBranches(diagram2, branches, gitGraphConfig, id);
  }
  drawArrows(diagram2, allCommitsDict);
  drawCommits(diagram2, allCommitsDict, true, gitGraphConfig);
  utils_default.insertTitle(diagram2, "gitTitleText", gitGraphConfig.titleTopMargin ?? 0, db2.getDiagramTitle());
  setupGraphViewbox2(undefined, diagram2, gitGraphConfig.diagramPadding, gitGraphConfig.useMaxWidth);
}, "draw");
var gitGraphRenderer_default = {
  draw
};
if (undefined) {}
var GIT_NAMED_COLOR_COUNT = 8;
var REDUX_GEOMETRY_THEMES2 = /* @__PURE__ */ new Set(["redux", "redux-dark", "redux-color", "redux-dark-color"]);
var COLOR_THEMES2 = /* @__PURE__ */ new Set(["redux-color", "redux-dark-color"]);
var NEO_THEMES = /* @__PURE__ */ new Set(["neo", "neo-dark"]);
var DARK_THEMES2 = /* @__PURE__ */ new Set(["dark", "redux-dark", "redux-dark-color", "neo-dark"]);
var NEO_COLOR_GEN_THEMES = /* @__PURE__ */ new Set([
  "redux",
  "redux-dark",
  "redux-color",
  "redux-dark-color",
  "neo",
  "neo-dark"
]);
var genGitGraphGradient = /* @__PURE__ */ __name((options) => {
  const { svgId } = options;
  let sections = "";
  if (options.useGradient && svgId) {
    for (let i = 0;i < options.THEME_COLOR_LIMIT; i++) {
      sections += `
      .label${i}  { fill: ${options.mainBkg}; stroke: url(${svgId}-gradient); stroke-width: ${options.strokeWidth};}
             `;
    }
  }
  return sections;
}, "genGitGraphGradient");
var genColor = /* @__PURE__ */ __name((options) => {
  const config = getConfig();
  const { theme, themeVariables } = config;
  const { borderColorArray } = themeVariables;
  const useReduxGeometry = REDUX_GEOMETRY_THEMES2.has(theme);
  if (NEO_THEMES.has(theme)) {
    let sections = "";
    for (let i = 0;i < options.THEME_COLOR_LIMIT; i++) {
      if (i === 0) {
        sections += `
        .branch-label${i} { fill: ${options.nodeBorder};}
        .commit${i} { stroke: ${options.nodeBorder};   }
        .commit-highlight${i} { stroke: ${options.nodeBorder}; fill: ${options.nodeBorder}; }
        .arrow${i} { stroke: ${options.nodeBorder}; }
        .commit-bullets { fill: ${options.nodeBorder}; }
        .commit-cherry-pick${i} { stroke: ${options.nodeBorder}; }
        ${genGitGraphGradient(options)}`;
      } else {
        const ci = i % GIT_NAMED_COLOR_COUNT;
        sections += `
        .branch-label${i} { fill: ${options["gitBranchLabel" + ci]}; }
        .commit${i} { stroke: ${options["git" + ci]}; fill: ${options["git" + ci]}; }
        .commit-highlight${i} { stroke: ${options["gitInv" + ci]}; fill: ${options["gitInv" + ci]}; }
        .arrow${i} { stroke: ${options["git" + ci]}; }
        `;
      }
    }
    return sections;
  } else if (!COLOR_THEMES2.has(theme)) {
    let sections = "";
    for (let i = 0;i < options.THEME_COLOR_LIMIT; i++) {
      sections += `
        .branch-label${i} { fill: ${options.nodeBorder}; ${useReduxGeometry ? `font-weight:${options.noteFontWeight}` : ""} }
        .commit${i} { stroke: ${options.nodeBorder};   }
        .commit-highlight${i} { stroke: ${options.nodeBorder}; fill: ${options.nodeBorder}; }
        .label${i}  { fill: ${options.mainBkg}; stroke: ${options.nodeBorder}; stroke-width: ${options.strokeWidth}; ${useReduxGeometry ? `font-weight:${options.noteFontWeight}` : ""}}
        .arrow${i} { stroke: ${options.nodeBorder}; }
        .commit-bullets { fill: ${options.nodeBorder}; }
        .commit-cherry-pick${i} { stroke: ${options.nodeBorder}; }
        `;
    }
    return sections;
  } else {
    let sections = "";
    for (let i = 0;i < options.THEME_COLOR_LIMIT; i++) {
      if (i === 0) {
        sections += `
        .branch-label${i} { fill: ${options.nodeBorder}; ${useReduxGeometry ? `font-weight:${options.noteFontWeight}` : ""} }
        .commit${i} { stroke: ${options.nodeBorder}; }
        .commit-highlight${i} { stroke: ${options.nodeBorder}; fill: ${options.mainBkg}; }
        .label${i}  { fill: ${options.mainBkg}; stroke: ${options.nodeBorder}; stroke-width: ${options.strokeWidth}; ${useReduxGeometry ? `font-weight:${options.noteFontWeight}` : ""} }
        .arrow${i} { stroke: ${options.nodeBorder}; }
        .commit-bullets { fill: ${options.nodeBorder}; }
        `;
      } else {
        const colorIndex = i % borderColorArray.length;
        sections += `
        .branch-label${i} { fill: ${options.nodeBorder}; ${useReduxGeometry ? `font-weight:${options.noteFontWeight}` : ""} }
        .commit${i} { stroke: ${borderColorArray[colorIndex]}; fill: ${borderColorArray[colorIndex]}; }
        .commit-highlight${i} { stroke: ${borderColorArray[colorIndex]}; fill: ${borderColorArray[colorIndex]}; }
        .label${i}  { fill: ${DARK_THEMES2.has(theme) ? options.mainBkg : borderColorArray[colorIndex]}; stroke: ${borderColorArray[colorIndex]};  stroke-width: ${options.strokeWidth}; }
        .arrow${i} { stroke: ${borderColorArray[colorIndex]}; }
        `;
      }
    }
    return sections;
  }
}, "genColor");
var normalTheme = /* @__PURE__ */ __name((options) => {
  return `${Array.from({ length: options.THEME_COLOR_LIMIT }, (_, i) => i).map((i) => {
    const ci = i % GIT_NAMED_COLOR_COUNT;
    return `
        .branch-label${i} { fill: ${options["gitBranchLabel" + ci]}; }
        .commit${i} { stroke: ${options["git" + ci]}; fill: ${options["git" + ci]}; }
        .commit-highlight${i} { stroke: ${options["gitInv" + ci]}; fill: ${options["gitInv" + ci]}; }
        .label${i}  { fill: ${options["git" + ci]}; }
        .arrow${i} { stroke: ${options["git" + ci]}; }
        `;
  }).join(`
`)}`;
}, "normalTheme");
var getStyles = /* @__PURE__ */ __name((options) => {
  const config = getConfig();
  const { theme } = config;
  const useNeoColorGen = NEO_COLOR_GEN_THEMES.has(theme);
  return `
  .commit-id,
  .commit-msg,
  .branch-label {
    fill: lightgrey;
    color: lightgrey;
    font-family: 'trebuchet ms', verdana, arial, sans-serif;
    font-family: var(--mermaid-font-family);
  }
  
  ${useNeoColorGen ? genColor(options) : normalTheme(options)}

  .branch {
    stroke-width: ${options.strokeWidth};
    stroke: ${options.commitLineColor ?? options.lineColor};
    stroke-dasharray:  ${useNeoColorGen ? "4 2" : "2"};
  }
  .commit-label { font-size: ${options.commitLabelFontSize}; fill: ${useNeoColorGen ? options.nodeBorder : options.commitLabelColor}; ${useNeoColorGen ? `font-weight:${options.noteFontWeight};` : ""}}
  .commit-label-bkg { font-size: ${options.commitLabelFontSize}; fill: ${useNeoColorGen ? "transparent" : options.commitLabelBackground}; opacity: ${useNeoColorGen ? "" : 0.5};  }
  .tag-label { font-size: ${options.tagLabelFontSize}; fill: ${options.tagLabelColor};}
  .tag-label-bkg { fill: ${useNeoColorGen ? options.mainBkg : options.tagLabelBackground}; stroke: ${useNeoColorGen ? options.nodeBorder : options.tagLabelBorder}; ${useNeoColorGen ? `filter:${options.dropShadow}` : ""}  }
  .tag-hole { fill: ${options.textColor}; }

  .commit-merge {
    stroke: ${useNeoColorGen ? options.mainBkg : options.primaryColor};
    fill: ${useNeoColorGen ? options.mainBkg : options.primaryColor};
  }
  .commit-reverse {
    stroke: ${useNeoColorGen ? options.mainBkg : options.primaryColor};
    fill: ${useNeoColorGen ? options.mainBkg : options.primaryColor};
    stroke-width: ${useNeoColorGen ? options.strokeWidth : 3};
  }
  .commit-highlight-outer {
  }
  .commit-highlight-inner {
    stroke: ${useNeoColorGen ? options.mainBkg : options.primaryColor};
    fill: ${useNeoColorGen ? options.mainBkg : options.primaryColor};
  }

  .arrow {
    /* Intentional: neo themes keep the bold 8px arrow (like classic themes); only redux-geometry themes use the thinner options.strokeWidth. */
    stroke-width: ${REDUX_GEOMETRY_THEMES2.has(theme) ? options.strokeWidth : 8};
    stroke-linecap: round;
    fill: none
  }
  .gitTitleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${options.textColor};
  }
`;
}, "getStyles");
var styles_default = getStyles;
var diagram = {
  parser,
  db,
  renderer: gitGraphRenderer_default,
  styles: styles_default
};
export {
  diagram
};

//# debugId=3229A5E8833B6AB064756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2dpdEdyYXBoRGlhZ3JhbS1QVlFDRVlJSS5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiaW1wb3J0IHtcbiAgcG9wdWxhdGVDb21tb25EYlxufSBmcm9tIFwiLi9jaHVuay00QlgyVlVBQi5tanNcIjtcbmltcG9ydCB7XG4gIEltcGVyYXRpdmVTdGF0ZVxufSBmcm9tIFwiLi9jaHVuay1RWkhLTjNWTi5tanNcIjtcbmltcG9ydCB7XG4gIGNsZWFuQW5kTWVyZ2UsXG4gIHJhbmRvbSxcbiAgdXRpbHNfZGVmYXVsdFxufSBmcm9tIFwiLi9jaHVuay01WlFZSFhLVS5tanNcIjtcbmltcG9ydCB7XG4gIGNsZWFyLFxuICBjb21tb25fZGVmYXVsdCxcbiAgZGVmYXVsdENvbmZpZ19kZWZhdWx0LFxuICBnZXRBY2NEZXNjcmlwdGlvbixcbiAgZ2V0QWNjVGl0bGUsXG4gIGdldENvbmZpZyxcbiAgZ2V0Q29uZmlnMixcbiAgZ2V0RGlhZ3JhbVRpdGxlLFxuICBzZXRBY2NEZXNjcmlwdGlvbixcbiAgc2V0QWNjVGl0bGUsXG4gIHNldERpYWdyYW1UaXRsZSxcbiAgc2V0dXBHcmFwaFZpZXdib3gyIGFzIHNldHVwR3JhcGhWaWV3Ym94XG59IGZyb20gXCIuL2NodW5rLUNTQ0lISzdRLm1qc1wiO1xuaW1wb3J0IHtcbiAgX19uYW1lLFxuICBsb2dcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIHNyYy9kaWFncmFtcy9naXQvZ2l0R3JhcGhQYXJzZXIudHNcbmltcG9ydCB7IHBhcnNlIH0gZnJvbSBcIkBtZXJtYWlkLWpzL3BhcnNlclwiO1xuXG4vLyBzcmMvZGlhZ3JhbXMvZ2l0L2dpdEdyYXBoVHlwZXMudHNcbnZhciBjb21taXRUeXBlID0ge1xuICBOT1JNQUw6IDAsXG4gIFJFVkVSU0U6IDEsXG4gIEhJR0hMSUdIVDogMixcbiAgTUVSR0U6IDMsXG4gIENIRVJSWV9QSUNLOiA0XG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMvZ2l0L2dpdEdyYXBoQXN0LnRzXG52YXIgREVGQVVMVF9HSVRHUkFQSF9DT05GSUcgPSBkZWZhdWx0Q29uZmlnX2RlZmF1bHQuZ2l0R3JhcGg7XG52YXIgZ2V0Q29uZmlnMyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKCkgPT4ge1xuICBjb25zdCBjb25maWcgPSBjbGVhbkFuZE1lcmdlKHtcbiAgICAuLi5ERUZBVUxUX0dJVEdSQVBIX0NPTkZJRyxcbiAgICAuLi5nZXRDb25maWcoKS5naXRHcmFwaFxuICB9KTtcbiAgcmV0dXJuIGNvbmZpZztcbn0sIFwiZ2V0Q29uZmlnXCIpO1xudmFyIHN0YXRlID0gbmV3IEltcGVyYXRpdmVTdGF0ZSgoKSA9PiB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZzMoKTtcbiAgY29uc3QgbWFpbkJyYW5jaE5hbWUgPSBjb25maWcubWFpbkJyYW5jaE5hbWU7XG4gIGNvbnN0IG1haW5CcmFuY2hPcmRlciA9IGNvbmZpZy5tYWluQnJhbmNoT3JkZXI7XG4gIHJldHVybiB7XG4gICAgbWFpbkJyYW5jaE5hbWUsXG4gICAgY29tbWl0czogLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSxcbiAgICBoZWFkOiBudWxsLFxuICAgIGJyYW5jaENvbmZpZzogLyogQF9fUFVSRV9fICovIG5ldyBNYXAoW1ttYWluQnJhbmNoTmFtZSwgeyBuYW1lOiBtYWluQnJhbmNoTmFtZSwgb3JkZXI6IG1haW5CcmFuY2hPcmRlciB9XV0pLFxuICAgIGJyYW5jaGVzOiAvKiBAX19QVVJFX18gKi8gbmV3IE1hcChbW21haW5CcmFuY2hOYW1lLCBudWxsXV0pLFxuICAgIGN1cnJCcmFuY2g6IG1haW5CcmFuY2hOYW1lLFxuICAgIGRpcmVjdGlvbjogXCJMUlwiLFxuICAgIHNlcTogMCxcbiAgICBvcHRpb25zOiB7fVxuICB9O1xufSk7XG5mdW5jdGlvbiBnZXRJRCgpIHtcbiAgcmV0dXJuIHJhbmRvbSh7IGxlbmd0aDogNyB9KTtcbn1cbl9fbmFtZShnZXRJRCwgXCJnZXRJRFwiKTtcbmZ1bmN0aW9uIHVuaXFCeShsaXN0LCBmbikge1xuICBjb25zdCByZWNvcmRNYXAgPSAvKiBAX19QVVJFX18gKi8gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgcmV0dXJuIGxpc3QucmVkdWNlKChvdXQsIGl0ZW0pID0+IHtcbiAgICBjb25zdCBrZXkgPSBmbihpdGVtKTtcbiAgICBpZiAoIXJlY29yZE1hcFtrZXldKSB7XG4gICAgICByZWNvcmRNYXBba2V5XSA9IHRydWU7XG4gICAgICBvdXQucHVzaChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbiAgfSwgW10pO1xufVxuX19uYW1lKHVuaXFCeSwgXCJ1bmlxQnlcIik7XG52YXIgc2V0RGlyZWN0aW9uID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihkaXIyKSB7XG4gIHN0YXRlLnJlY29yZHMuZGlyZWN0aW9uID0gZGlyMjtcbn0sIFwic2V0RGlyZWN0aW9uXCIpO1xudmFyIHNldE9wdGlvbnMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHJhd09wdFN0cmluZykge1xuICBsb2cuZGVidWcoXCJvcHRpb25zIHN0clwiLCByYXdPcHRTdHJpbmcpO1xuICByYXdPcHRTdHJpbmcgPSByYXdPcHRTdHJpbmc/LnRyaW0oKTtcbiAgcmF3T3B0U3RyaW5nID0gcmF3T3B0U3RyaW5nIHx8IFwie31cIjtcbiAgdHJ5IHtcbiAgICBzdGF0ZS5yZWNvcmRzLm9wdGlvbnMgPSBKU09OLnBhcnNlKHJhd09wdFN0cmluZyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2cuZXJyb3IoXCJlcnJvciB3aGlsZSBwYXJzaW5nIGdpdEdyYXBoIG9wdGlvbnNcIiwgZS5tZXNzYWdlKTtcbiAgfVxufSwgXCJzZXRPcHRpb25zXCIpO1xudmFyIGdldE9wdGlvbnMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gc3RhdGUucmVjb3Jkcy5vcHRpb25zO1xufSwgXCJnZXRPcHRpb25zXCIpO1xudmFyIGNvbW1pdCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oY29tbWl0REIpIHtcbiAgbGV0IG1zZyA9IGNvbW1pdERCLm1zZztcbiAgbGV0IGlkID0gY29tbWl0REIuaWQ7XG4gIGNvbnN0IHR5cGUgPSBjb21taXREQi50eXBlO1xuICBsZXQgdGFncyA9IGNvbW1pdERCLnRhZ3M7XG4gIGxvZy5pbmZvKFwiY29tbWl0XCIsIG1zZywgaWQsIHR5cGUsIHRhZ3MpO1xuICBsb2cuZGVidWcoXCJFbnRlcmluZyBjb21taXQ6XCIsIG1zZywgaWQsIHR5cGUsIHRhZ3MpO1xuICBjb25zdCBjb25maWcgPSBnZXRDb25maWczKCk7XG4gIGlkID0gY29tbW9uX2RlZmF1bHQuc2FuaXRpemVUZXh0KGlkLCBjb25maWcpO1xuICBtc2cgPSBjb21tb25fZGVmYXVsdC5zYW5pdGl6ZVRleHQobXNnLCBjb25maWcpO1xuICB0YWdzID0gdGFncz8ubWFwKCh0YWcpID0+IGNvbW1vbl9kZWZhdWx0LnNhbml0aXplVGV4dCh0YWcsIGNvbmZpZykpO1xuICBjb25zdCBuZXdDb21taXQgPSB7XG4gICAgaWQ6IGlkID8gaWQgOiBzdGF0ZS5yZWNvcmRzLnNlcSArIFwiLVwiICsgZ2V0SUQoKSxcbiAgICBtZXNzYWdlOiBtc2csXG4gICAgc2VxOiBzdGF0ZS5yZWNvcmRzLnNlcSsrLFxuICAgIHR5cGU6IHR5cGUgPz8gY29tbWl0VHlwZS5OT1JNQUwsXG4gICAgdGFnczogdGFncyA/PyBbXSxcbiAgICBwYXJlbnRzOiBzdGF0ZS5yZWNvcmRzLmhlYWQgPT0gbnVsbCA/IFtdIDogW3N0YXRlLnJlY29yZHMuaGVhZC5pZF0sXG4gICAgYnJhbmNoOiBzdGF0ZS5yZWNvcmRzLmN1cnJCcmFuY2hcbiAgfTtcbiAgc3RhdGUucmVjb3Jkcy5oZWFkID0gbmV3Q29tbWl0O1xuICBsb2cuaW5mbyhcIm1haW4gYnJhbmNoXCIsIGNvbmZpZy5tYWluQnJhbmNoTmFtZSk7XG4gIGlmIChzdGF0ZS5yZWNvcmRzLmNvbW1pdHMuaGFzKG5ld0NvbW1pdC5pZCkpIHtcbiAgICBsb2cud2FybihgQ29tbWl0IElEICR7bmV3Q29tbWl0LmlkfSBhbHJlYWR5IGV4aXN0c2ApO1xuICB9XG4gIHN0YXRlLnJlY29yZHMuY29tbWl0cy5zZXQobmV3Q29tbWl0LmlkLCBuZXdDb21taXQpO1xuICBzdGF0ZS5yZWNvcmRzLmJyYW5jaGVzLnNldChzdGF0ZS5yZWNvcmRzLmN1cnJCcmFuY2gsIG5ld0NvbW1pdC5pZCk7XG4gIGxvZy5kZWJ1ZyhcImluIHB1c2hDb21taXQgXCIgKyBuZXdDb21taXQuaWQpO1xufSwgXCJjb21taXRcIik7XG52YXIgYnJhbmNoID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihicmFuY2hEQikge1xuICBsZXQgbmFtZSA9IGJyYW5jaERCLm5hbWU7XG4gIGNvbnN0IG9yZGVyID0gYnJhbmNoREIub3JkZXI7XG4gIG5hbWUgPSBjb21tb25fZGVmYXVsdC5zYW5pdGl6ZVRleHQobmFtZSwgZ2V0Q29uZmlnMygpKTtcbiAgaWYgKHN0YXRlLnJlY29yZHMuYnJhbmNoZXMuaGFzKG5hbWUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYFRyeWluZyB0byBjcmVhdGUgYW4gZXhpc3RpbmcgYnJhbmNoLiAoSGVscDogRWl0aGVyIHVzZSBhIG5ldyBuYW1lIGlmIHlvdSB3YW50IGNyZWF0ZSBhIG5ldyBicmFuY2ggb3IgdHJ5IHVzaW5nIFwiY2hlY2tvdXQgJHtuYW1lfVwiKWBcbiAgICApO1xuICB9XG4gIHN0YXRlLnJlY29yZHMuYnJhbmNoZXMuc2V0KG5hbWUsIHN0YXRlLnJlY29yZHMuaGVhZCAhPSBudWxsID8gc3RhdGUucmVjb3Jkcy5oZWFkLmlkIDogbnVsbCk7XG4gIHN0YXRlLnJlY29yZHMuYnJhbmNoQ29uZmlnLnNldChuYW1lLCB7IG5hbWUsIG9yZGVyIH0pO1xuICBjaGVja291dChuYW1lKTtcbiAgbG9nLmRlYnVnKFwiaW4gY3JlYXRlQnJhbmNoXCIpO1xufSwgXCJicmFuY2hcIik7XG52YXIgbWVyZ2UgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChtZXJnZURCKSA9PiB7XG4gIGxldCBvdGhlckJyYW5jaCA9IG1lcmdlREIuYnJhbmNoO1xuICBsZXQgY3VzdG9tSWQgPSBtZXJnZURCLmlkO1xuICBjb25zdCBvdmVycmlkZVR5cGUgPSBtZXJnZURCLnR5cGU7XG4gIGNvbnN0IGN1c3RvbVRhZ3MgPSBtZXJnZURCLnRhZ3M7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZzMoKTtcbiAgb3RoZXJCcmFuY2ggPSBjb21tb25fZGVmYXVsdC5zYW5pdGl6ZVRleHQob3RoZXJCcmFuY2gsIGNvbmZpZyk7XG4gIGlmIChjdXN0b21JZCkge1xuICAgIGN1c3RvbUlkID0gY29tbW9uX2RlZmF1bHQuc2FuaXRpemVUZXh0KGN1c3RvbUlkLCBjb25maWcpO1xuICB9XG4gIGNvbnN0IGN1cnJlbnRCcmFuY2hDaGVjayA9IHN0YXRlLnJlY29yZHMuYnJhbmNoZXMuZ2V0KHN0YXRlLnJlY29yZHMuY3VyckJyYW5jaCk7XG4gIGNvbnN0IG90aGVyQnJhbmNoQ2hlY2sgPSBzdGF0ZS5yZWNvcmRzLmJyYW5jaGVzLmdldChvdGhlckJyYW5jaCk7XG4gIGNvbnN0IGN1cnJlbnRDb21taXQgPSBjdXJyZW50QnJhbmNoQ2hlY2sgPyBzdGF0ZS5yZWNvcmRzLmNvbW1pdHMuZ2V0KGN1cnJlbnRCcmFuY2hDaGVjaykgOiB2b2lkIDA7XG4gIGNvbnN0IG90aGVyQ29tbWl0ID0gb3RoZXJCcmFuY2hDaGVjayA/IHN0YXRlLnJlY29yZHMuY29tbWl0cy5nZXQob3RoZXJCcmFuY2hDaGVjaykgOiB2b2lkIDA7XG4gIGlmIChjdXJyZW50Q29tbWl0ICYmIG90aGVyQ29tbWl0ICYmIGN1cnJlbnRDb21taXQuYnJhbmNoID09PSBvdGhlckJyYW5jaCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IG1lcmdlIGJyYW5jaCAnJHtvdGhlckJyYW5jaH0nIGludG8gaXRzZWxmLmApO1xuICB9XG4gIGlmIChzdGF0ZS5yZWNvcmRzLmN1cnJCcmFuY2ggPT09IG90aGVyQnJhbmNoKSB7XG4gICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoJ0luY29ycmVjdCB1c2FnZSBvZiBcIm1lcmdlXCIuIENhbm5vdCBtZXJnZSBhIGJyYW5jaCB0byBpdHNlbGYnKTtcbiAgICBlcnJvci5oYXNoID0ge1xuICAgICAgdGV4dDogYG1lcmdlICR7b3RoZXJCcmFuY2h9YCxcbiAgICAgIHRva2VuOiBgbWVyZ2UgJHtvdGhlckJyYW5jaH1gLFxuICAgICAgZXhwZWN0ZWQ6IFtcImJyYW5jaCBhYmNcIl1cbiAgICB9O1xuICAgIHRocm93IGVycm9yO1xuICB9XG4gIGlmIChjdXJyZW50Q29tbWl0ID09PSB2b2lkIDAgfHwgIWN1cnJlbnRDb21taXQpIHtcbiAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgIGBJbmNvcnJlY3QgdXNhZ2Ugb2YgXCJtZXJnZVwiLiBDdXJyZW50IGJyYW5jaCAoJHtzdGF0ZS5yZWNvcmRzLmN1cnJCcmFuY2h9KWhhcyBubyBjb21taXRzYFxuICAgICk7XG4gICAgZXJyb3IuaGFzaCA9IHtcbiAgICAgIHRleHQ6IGBtZXJnZSAke290aGVyQnJhbmNofWAsXG4gICAgICB0b2tlbjogYG1lcmdlICR7b3RoZXJCcmFuY2h9YCxcbiAgICAgIGV4cGVjdGVkOiBbXCJjb21taXRcIl1cbiAgICB9O1xuICAgIHRocm93IGVycm9yO1xuICB9XG4gIGlmICghc3RhdGUucmVjb3Jkcy5icmFuY2hlcy5oYXMob3RoZXJCcmFuY2gpKSB7XG4gICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAnSW5jb3JyZWN0IHVzYWdlIG9mIFwibWVyZ2VcIi4gQnJhbmNoIHRvIGJlIG1lcmdlZCAoJyArIG90aGVyQnJhbmNoICsgXCIpIGRvZXMgbm90IGV4aXN0XCJcbiAgICApO1xuICAgIGVycm9yLmhhc2ggPSB7XG4gICAgICB0ZXh0OiBgbWVyZ2UgJHtvdGhlckJyYW5jaH1gLFxuICAgICAgdG9rZW46IGBtZXJnZSAke290aGVyQnJhbmNofWAsXG4gICAgICBleHBlY3RlZDogW2BicmFuY2ggJHtvdGhlckJyYW5jaH1gXVxuICAgIH07XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbiAgaWYgKG90aGVyQ29tbWl0ID09PSB2b2lkIDAgfHwgIW90aGVyQ29tbWl0KSB7XG4gICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAnSW5jb3JyZWN0IHVzYWdlIG9mIFwibWVyZ2VcIi4gQnJhbmNoIHRvIGJlIG1lcmdlZCAoJyArIG90aGVyQnJhbmNoICsgXCIpIGhhcyBubyBjb21taXRzXCJcbiAgICApO1xuICAgIGVycm9yLmhhc2ggPSB7XG4gICAgICB0ZXh0OiBgbWVyZ2UgJHtvdGhlckJyYW5jaH1gLFxuICAgICAgdG9rZW46IGBtZXJnZSAke290aGVyQnJhbmNofWAsXG4gICAgICBleHBlY3RlZDogWydcImNvbW1pdFwiJ11cbiAgICB9O1xuICAgIHRocm93IGVycm9yO1xuICB9XG4gIGlmIChjdXJyZW50Q29tbWl0ID09PSBvdGhlckNvbW1pdCkge1xuICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCdJbmNvcnJlY3QgdXNhZ2Ugb2YgXCJtZXJnZVwiLiBCb3RoIGJyYW5jaGVzIGhhdmUgc2FtZSBoZWFkJyk7XG4gICAgZXJyb3IuaGFzaCA9IHtcbiAgICAgIHRleHQ6IGBtZXJnZSAke290aGVyQnJhbmNofWAsXG4gICAgICB0b2tlbjogYG1lcmdlICR7b3RoZXJCcmFuY2h9YCxcbiAgICAgIGV4cGVjdGVkOiBbXCJicmFuY2ggYWJjXCJdXG4gICAgfTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxuICBpZiAoY3VzdG9tSWQgJiYgc3RhdGUucmVjb3Jkcy5jb21taXRzLmhhcyhjdXN0b21JZCkpIHtcbiAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICdJbmNvcnJlY3QgdXNhZ2Ugb2YgXCJtZXJnZVwiLiBDb21taXQgd2l0aCBpZDonICsgY3VzdG9tSWQgKyBcIiBhbHJlYWR5IGV4aXN0cywgdXNlIGRpZmZlcmVudCBjdXN0b20gaWRcIlxuICAgICk7XG4gICAgZXJyb3IuaGFzaCA9IHtcbiAgICAgIHRleHQ6IGBtZXJnZSAke290aGVyQnJhbmNofSAke2N1c3RvbUlkfSAke292ZXJyaWRlVHlwZX0gJHtjdXN0b21UYWdzPy5qb2luKFwiIFwiKX1gLFxuICAgICAgdG9rZW46IGBtZXJnZSAke290aGVyQnJhbmNofSAke2N1c3RvbUlkfSAke292ZXJyaWRlVHlwZX0gJHtjdXN0b21UYWdzPy5qb2luKFwiIFwiKX1gLFxuICAgICAgZXhwZWN0ZWQ6IFtcbiAgICAgICAgYG1lcmdlICR7b3RoZXJCcmFuY2h9ICR7Y3VzdG9tSWR9X1VOSVFVRSAke292ZXJyaWRlVHlwZX0gJHtjdXN0b21UYWdzPy5qb2luKFwiIFwiKX1gXG4gICAgICBdXG4gICAgfTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxuICBjb25zdCB2ZXJpZmllZEJyYW5jaCA9IG90aGVyQnJhbmNoQ2hlY2sgPyBvdGhlckJyYW5jaENoZWNrIDogXCJcIjtcbiAgY29uc3QgY29tbWl0MiA9IHtcbiAgICBpZDogY3VzdG9tSWQgfHwgYCR7c3RhdGUucmVjb3Jkcy5zZXF9LSR7Z2V0SUQoKX1gLFxuICAgIG1lc3NhZ2U6IGBtZXJnZWQgYnJhbmNoICR7b3RoZXJCcmFuY2h9IGludG8gJHtzdGF0ZS5yZWNvcmRzLmN1cnJCcmFuY2h9YCxcbiAgICBzZXE6IHN0YXRlLnJlY29yZHMuc2VxKyssXG4gICAgcGFyZW50czogc3RhdGUucmVjb3Jkcy5oZWFkID09IG51bGwgPyBbXSA6IFtzdGF0ZS5yZWNvcmRzLmhlYWQuaWQsIHZlcmlmaWVkQnJhbmNoXSxcbiAgICBicmFuY2g6IHN0YXRlLnJlY29yZHMuY3VyckJyYW5jaCxcbiAgICB0eXBlOiBjb21taXRUeXBlLk1FUkdFLFxuICAgIGN1c3RvbVR5cGU6IG92ZXJyaWRlVHlwZSxcbiAgICBjdXN0b21JZDogY3VzdG9tSWQgPyB0cnVlIDogZmFsc2UsXG4gICAgdGFnczogY3VzdG9tVGFncyA/PyBbXVxuICB9O1xuICBzdGF0ZS5yZWNvcmRzLmhlYWQgPSBjb21taXQyO1xuICBzdGF0ZS5yZWNvcmRzLmNvbW1pdHMuc2V0KGNvbW1pdDIuaWQsIGNvbW1pdDIpO1xuICBzdGF0ZS5yZWNvcmRzLmJyYW5jaGVzLnNldChzdGF0ZS5yZWNvcmRzLmN1cnJCcmFuY2gsIGNvbW1pdDIuaWQpO1xuICBsb2cuZGVidWcoc3RhdGUucmVjb3Jkcy5icmFuY2hlcyk7XG4gIGxvZy5kZWJ1ZyhcImluIG1lcmdlQnJhbmNoXCIpO1xufSwgXCJtZXJnZVwiKTtcbnZhciBjaGVycnlQaWNrID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihjaGVycnlQaWNrREIpIHtcbiAgbGV0IHNvdXJjZUlkID0gY2hlcnJ5UGlja0RCLmlkO1xuICBsZXQgdGFyZ2V0SWQgPSBjaGVycnlQaWNrREIudGFyZ2V0SWQ7XG4gIGxldCB0YWdzID0gY2hlcnJ5UGlja0RCLnRhZ3M7XG4gIGxldCBwYXJlbnRDb21taXRJZCA9IGNoZXJyeVBpY2tEQi5wYXJlbnQ7XG4gIGxvZy5kZWJ1ZyhcIkVudGVyaW5nIGNoZXJyeVBpY2s6XCIsIHNvdXJjZUlkLCB0YXJnZXRJZCwgdGFncyk7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZzMoKTtcbiAgc291cmNlSWQgPSBjb21tb25fZGVmYXVsdC5zYW5pdGl6ZVRleHQoc291cmNlSWQsIGNvbmZpZyk7XG4gIHRhcmdldElkID0gY29tbW9uX2RlZmF1bHQuc2FuaXRpemVUZXh0KHRhcmdldElkLCBjb25maWcpO1xuICB0YWdzID0gdGFncz8ubWFwKCh0YWcpID0+IGNvbW1vbl9kZWZhdWx0LnNhbml0aXplVGV4dCh0YWcsIGNvbmZpZykpO1xuICBwYXJlbnRDb21taXRJZCA9IGNvbW1vbl9kZWZhdWx0LnNhbml0aXplVGV4dChwYXJlbnRDb21taXRJZCwgY29uZmlnKTtcbiAgaWYgKCFzb3VyY2VJZCB8fCAhc3RhdGUucmVjb3Jkcy5jb21taXRzLmhhcyhzb3VyY2VJZCkpIHtcbiAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICdJbmNvcnJlY3QgdXNhZ2Ugb2YgXCJjaGVycnlQaWNrXCIuIFNvdXJjZSBjb21taXQgaWQgc2hvdWxkIGV4aXN0IGFuZCBwcm92aWRlZCdcbiAgICApO1xuICAgIGVycm9yLmhhc2ggPSB7XG4gICAgICB0ZXh0OiBgY2hlcnJ5UGljayAke3NvdXJjZUlkfSAke3RhcmdldElkfWAsXG4gICAgICB0b2tlbjogYGNoZXJyeVBpY2sgJHtzb3VyY2VJZH0gJHt0YXJnZXRJZH1gLFxuICAgICAgZXhwZWN0ZWQ6IFtcImNoZXJyeS1waWNrIGFiY1wiXVxuICAgIH07XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbiAgY29uc3Qgc291cmNlQ29tbWl0ID0gc3RhdGUucmVjb3Jkcy5jb21taXRzLmdldChzb3VyY2VJZCk7XG4gIGlmIChzb3VyY2VDb21taXQgPT09IHZvaWQgMCB8fCAhc291cmNlQ29tbWl0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbmNvcnJlY3QgdXNhZ2Ugb2YgXCJjaGVycnlQaWNrXCIuIFNvdXJjZSBjb21taXQgaWQgc2hvdWxkIGV4aXN0IGFuZCBwcm92aWRlZCcpO1xuICB9XG4gIGlmIChwYXJlbnRDb21taXRJZCAmJiAhKEFycmF5LmlzQXJyYXkoc291cmNlQ29tbWl0LnBhcmVudHMpICYmIHNvdXJjZUNvbW1pdC5wYXJlbnRzLmluY2x1ZGVzKHBhcmVudENvbW1pdElkKSkpIHtcbiAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgIFwiSW52YWxpZCBvcGVyYXRpb246IFRoZSBzcGVjaWZpZWQgcGFyZW50IGNvbW1pdCBpcyBub3QgYW4gaW1tZWRpYXRlIHBhcmVudCBvZiB0aGUgY2hlcnJ5LXBpY2tlZCBjb21taXQuXCJcbiAgICApO1xuICAgIHRocm93IGVycm9yO1xuICB9XG4gIGNvbnN0IHNvdXJjZUNvbW1pdEJyYW5jaCA9IHNvdXJjZUNvbW1pdC5icmFuY2g7XG4gIGlmIChzb3VyY2VDb21taXQudHlwZSA9PT0gY29tbWl0VHlwZS5NRVJHRSAmJiAhcGFyZW50Q29tbWl0SWQpIHtcbiAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgIFwiSW5jb3JyZWN0IHVzYWdlIG9mIGNoZXJyeS1waWNrOiBJZiB0aGUgc291cmNlIGNvbW1pdCBpcyBhIG1lcmdlIGNvbW1pdCwgYW4gaW1tZWRpYXRlIHBhcmVudCBjb21taXQgbXVzdCBiZSBzcGVjaWZpZWQuXCJcbiAgICApO1xuICAgIHRocm93IGVycm9yO1xuICB9XG4gIGlmICghdGFyZ2V0SWQgfHwgIXN0YXRlLnJlY29yZHMuY29tbWl0cy5oYXModGFyZ2V0SWQpKSB7XG4gICAgaWYgKHNvdXJjZUNvbW1pdEJyYW5jaCA9PT0gc3RhdGUucmVjb3Jkcy5jdXJyQnJhbmNoKSB7XG4gICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ0luY29ycmVjdCB1c2FnZSBvZiBcImNoZXJyeVBpY2tcIi4gU291cmNlIGNvbW1pdCBpcyBhbHJlYWR5IG9uIGN1cnJlbnQgYnJhbmNoJ1xuICAgICAgKTtcbiAgICAgIGVycm9yLmhhc2ggPSB7XG4gICAgICAgIHRleHQ6IGBjaGVycnlQaWNrICR7c291cmNlSWR9ICR7dGFyZ2V0SWR9YCxcbiAgICAgICAgdG9rZW46IGBjaGVycnlQaWNrICR7c291cmNlSWR9ICR7dGFyZ2V0SWR9YCxcbiAgICAgICAgZXhwZWN0ZWQ6IFtcImNoZXJyeS1waWNrIGFiY1wiXVxuICAgICAgfTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgICBjb25zdCBjdXJyZW50Q29tbWl0SWQgPSBzdGF0ZS5yZWNvcmRzLmJyYW5jaGVzLmdldChzdGF0ZS5yZWNvcmRzLmN1cnJCcmFuY2gpO1xuICAgIGlmIChjdXJyZW50Q29tbWl0SWQgPT09IHZvaWQgMCB8fCAhY3VycmVudENvbW1pdElkKSB7XG4gICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgYEluY29ycmVjdCB1c2FnZSBvZiBcImNoZXJyeS1waWNrXCIuIEN1cnJlbnQgYnJhbmNoICgke3N0YXRlLnJlY29yZHMuY3VyckJyYW5jaH0paGFzIG5vIGNvbW1pdHNgXG4gICAgICApO1xuICAgICAgZXJyb3IuaGFzaCA9IHtcbiAgICAgICAgdGV4dDogYGNoZXJyeVBpY2sgJHtzb3VyY2VJZH0gJHt0YXJnZXRJZH1gLFxuICAgICAgICB0b2tlbjogYGNoZXJyeVBpY2sgJHtzb3VyY2VJZH0gJHt0YXJnZXRJZH1gLFxuICAgICAgICBleHBlY3RlZDogW1wiY2hlcnJ5LXBpY2sgYWJjXCJdXG4gICAgICB9O1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICAgIGNvbnN0IGN1cnJlbnRDb21taXQgPSBzdGF0ZS5yZWNvcmRzLmNvbW1pdHMuZ2V0KGN1cnJlbnRDb21taXRJZCk7XG4gICAgaWYgKGN1cnJlbnRDb21taXQgPT09IHZvaWQgMCB8fCAhY3VycmVudENvbW1pdCkge1xuICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoXG4gICAgICAgIGBJbmNvcnJlY3QgdXNhZ2Ugb2YgXCJjaGVycnktcGlja1wiLiBDdXJyZW50IGJyYW5jaCAoJHtzdGF0ZS5yZWNvcmRzLmN1cnJCcmFuY2h9KWhhcyBubyBjb21taXRzYFxuICAgICAgKTtcbiAgICAgIGVycm9yLmhhc2ggPSB7XG4gICAgICAgIHRleHQ6IGBjaGVycnlQaWNrICR7c291cmNlSWR9ICR7dGFyZ2V0SWR9YCxcbiAgICAgICAgdG9rZW46IGBjaGVycnlQaWNrICR7c291cmNlSWR9ICR7dGFyZ2V0SWR9YCxcbiAgICAgICAgZXhwZWN0ZWQ6IFtcImNoZXJyeS1waWNrIGFiY1wiXVxuICAgICAgfTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgICBjb25zdCBjb21taXQyID0ge1xuICAgICAgaWQ6IHN0YXRlLnJlY29yZHMuc2VxICsgXCItXCIgKyBnZXRJRCgpLFxuICAgICAgbWVzc2FnZTogYGNoZXJyeS1waWNrZWQgJHtzb3VyY2VDb21taXQ/Lm1lc3NhZ2V9IGludG8gJHtzdGF0ZS5yZWNvcmRzLmN1cnJCcmFuY2h9YCxcbiAgICAgIHNlcTogc3RhdGUucmVjb3Jkcy5zZXErKyxcbiAgICAgIHBhcmVudHM6IHN0YXRlLnJlY29yZHMuaGVhZCA9PSBudWxsID8gW10gOiBbc3RhdGUucmVjb3Jkcy5oZWFkLmlkLCBzb3VyY2VDb21taXQuaWRdLFxuICAgICAgYnJhbmNoOiBzdGF0ZS5yZWNvcmRzLmN1cnJCcmFuY2gsXG4gICAgICB0eXBlOiBjb21taXRUeXBlLkNIRVJSWV9QSUNLLFxuICAgICAgdGFnczogdGFncyA/IHRhZ3MuZmlsdGVyKEJvb2xlYW4pIDogW1xuICAgICAgICBgY2hlcnJ5LXBpY2s6JHtzb3VyY2VDb21taXQuaWR9JHtzb3VyY2VDb21taXQudHlwZSA9PT0gY29tbWl0VHlwZS5NRVJHRSA/IGB8cGFyZW50OiR7cGFyZW50Q29tbWl0SWR9YCA6IFwiXCJ9YFxuICAgICAgXVxuICAgIH07XG4gICAgc3RhdGUucmVjb3Jkcy5oZWFkID0gY29tbWl0MjtcbiAgICBzdGF0ZS5yZWNvcmRzLmNvbW1pdHMuc2V0KGNvbW1pdDIuaWQsIGNvbW1pdDIpO1xuICAgIHN0YXRlLnJlY29yZHMuYnJhbmNoZXMuc2V0KHN0YXRlLnJlY29yZHMuY3VyckJyYW5jaCwgY29tbWl0Mi5pZCk7XG4gICAgbG9nLmRlYnVnKHN0YXRlLnJlY29yZHMuYnJhbmNoZXMpO1xuICAgIGxvZy5kZWJ1ZyhcImluIGNoZXJyeVBpY2tcIik7XG4gIH1cbn0sIFwiY2hlcnJ5UGlja1wiKTtcbnZhciBjaGVja291dCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oYnJhbmNoMikge1xuICBicmFuY2gyID0gY29tbW9uX2RlZmF1bHQuc2FuaXRpemVUZXh0KGJyYW5jaDIsIGdldENvbmZpZzMoKSk7XG4gIGlmICghc3RhdGUucmVjb3Jkcy5icmFuY2hlcy5oYXMoYnJhbmNoMikpIHtcbiAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgIGBUcnlpbmcgdG8gY2hlY2tvdXQgYnJhbmNoIHdoaWNoIGlzIG5vdCB5ZXQgY3JlYXRlZC4gKEhlbHAgdHJ5IHVzaW5nIFwiYnJhbmNoICR7YnJhbmNoMn1cIilgXG4gICAgKTtcbiAgICBlcnJvci5oYXNoID0ge1xuICAgICAgdGV4dDogYGNoZWNrb3V0ICR7YnJhbmNoMn1gLFxuICAgICAgdG9rZW46IGBjaGVja291dCAke2JyYW5jaDJ9YCxcbiAgICAgIGV4cGVjdGVkOiBbYGJyYW5jaCAke2JyYW5jaDJ9YF1cbiAgICB9O1xuICAgIHRocm93IGVycm9yO1xuICB9IGVsc2Uge1xuICAgIHN0YXRlLnJlY29yZHMuY3VyckJyYW5jaCA9IGJyYW5jaDI7XG4gICAgY29uc3QgaWQgPSBzdGF0ZS5yZWNvcmRzLmJyYW5jaGVzLmdldChzdGF0ZS5yZWNvcmRzLmN1cnJCcmFuY2gpO1xuICAgIGlmIChpZCA9PT0gdm9pZCAwIHx8ICFpZCkge1xuICAgICAgc3RhdGUucmVjb3Jkcy5oZWFkID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhdGUucmVjb3Jkcy5oZWFkID0gc3RhdGUucmVjb3Jkcy5jb21taXRzLmdldChpZCkgPz8gbnVsbDtcbiAgICB9XG4gIH1cbn0sIFwiY2hlY2tvdXRcIik7XG5mdW5jdGlvbiB1cHNlcnQoYXJyLCBrZXksIG5ld1ZhbCkge1xuICBjb25zdCBpbmRleCA9IGFyci5pbmRleE9mKGtleSk7XG4gIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICBhcnIucHVzaChuZXdWYWwpO1xuICB9IGVsc2Uge1xuICAgIGFyci5zcGxpY2UoaW5kZXgsIDEsIG5ld1ZhbCk7XG4gIH1cbn1cbl9fbmFtZSh1cHNlcnQsIFwidXBzZXJ0XCIpO1xuZnVuY3Rpb24gcHJldHR5UHJpbnRDb21taXRIaXN0b3J5KGNvbW1pdEFycikge1xuICBjb25zdCBjb21taXQyID0gY29tbWl0QXJyLnJlZHVjZSgob3V0LCBjb21taXQzKSA9PiB7XG4gICAgaWYgKG91dC5zZXEgPiBjb21taXQzLnNlcSkge1xuICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gICAgcmV0dXJuIGNvbW1pdDM7XG4gIH0sIGNvbW1pdEFyclswXSk7XG4gIGxldCBsaW5lID0gXCJcIjtcbiAgY29tbWl0QXJyLmZvckVhY2goZnVuY3Rpb24oYykge1xuICAgIGlmIChjID09PSBjb21taXQyKSB7XG4gICAgICBsaW5lICs9IFwiXHQqXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpbmUgKz0gXCJcdHxcIjtcbiAgICB9XG4gIH0pO1xuICBjb25zdCBsYWJlbCA9IFtsaW5lLCBjb21taXQyLmlkLCBjb21taXQyLnNlcV07XG4gIGZvciAoY29uc3QgYnJhbmNoMiBpbiBzdGF0ZS5yZWNvcmRzLmJyYW5jaGVzKSB7XG4gICAgaWYgKHN0YXRlLnJlY29yZHMuYnJhbmNoZXMuZ2V0KGJyYW5jaDIpID09PSBjb21taXQyLmlkKSB7XG4gICAgICBsYWJlbC5wdXNoKGJyYW5jaDIpO1xuICAgIH1cbiAgfVxuICBsb2cuZGVidWcobGFiZWwuam9pbihcIiBcIikpO1xuICBpZiAoY29tbWl0Mi5wYXJlbnRzICYmIGNvbW1pdDIucGFyZW50cy5sZW5ndGggPT0gMiAmJiBjb21taXQyLnBhcmVudHNbMF0gJiYgY29tbWl0Mi5wYXJlbnRzWzFdKSB7XG4gICAgY29uc3QgbmV3Q29tbWl0ID0gc3RhdGUucmVjb3Jkcy5jb21taXRzLmdldChjb21taXQyLnBhcmVudHNbMF0pO1xuICAgIHVwc2VydChjb21taXRBcnIsIGNvbW1pdDIsIG5ld0NvbW1pdCk7XG4gICAgaWYgKGNvbW1pdDIucGFyZW50c1sxXSkge1xuICAgICAgY29tbWl0QXJyLnB1c2goc3RhdGUucmVjb3Jkcy5jb21taXRzLmdldChjb21taXQyLnBhcmVudHNbMV0pKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoY29tbWl0Mi5wYXJlbnRzLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuO1xuICB9IGVsc2Uge1xuICAgIGlmIChjb21taXQyLnBhcmVudHNbMF0pIHtcbiAgICAgIGNvbnN0IG5ld0NvbW1pdCA9IHN0YXRlLnJlY29yZHMuY29tbWl0cy5nZXQoY29tbWl0Mi5wYXJlbnRzWzBdKTtcbiAgICAgIHVwc2VydChjb21taXRBcnIsIGNvbW1pdDIsIG5ld0NvbW1pdCk7XG4gICAgfVxuICB9XG4gIGNvbW1pdEFyciA9IHVuaXFCeShjb21taXRBcnIsIChjKSA9PiBjLmlkKTtcbiAgcHJldHR5UHJpbnRDb21taXRIaXN0b3J5KGNvbW1pdEFycik7XG59XG5fX25hbWUocHJldHR5UHJpbnRDb21taXRIaXN0b3J5LCBcInByZXR0eVByaW50Q29tbWl0SGlzdG9yeVwiKTtcbnZhciBwcmV0dHlQcmludCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gIGxvZy5kZWJ1ZyhzdGF0ZS5yZWNvcmRzLmNvbW1pdHMpO1xuICBjb25zdCBub2RlID0gZ2V0Q29tbWl0c0FycmF5KClbMF07XG4gIHByZXR0eVByaW50Q29tbWl0SGlzdG9yeShbbm9kZV0pO1xufSwgXCJwcmV0dHlQcmludFwiKTtcbnZhciBjbGVhcjIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICBzdGF0ZS5yZXNldCgpO1xuICBjbGVhcigpO1xufSwgXCJjbGVhclwiKTtcbnZhciBnZXRCcmFuY2hlc0FzT2JqQXJyYXkgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICBjb25zdCBicmFuY2hlc0FycmF5ID0gWy4uLnN0YXRlLnJlY29yZHMuYnJhbmNoQ29uZmlnLnZhbHVlcygpXS5tYXAoKGJyYW5jaENvbmZpZywgaSkgPT4ge1xuICAgIGlmIChicmFuY2hDb25maWcub3JkZXIgIT09IG51bGwgJiYgYnJhbmNoQ29uZmlnLm9yZGVyICE9PSB2b2lkIDApIHtcbiAgICAgIHJldHVybiBicmFuY2hDb25maWc7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAuLi5icmFuY2hDb25maWcsXG4gICAgICBvcmRlcjogcGFyc2VGbG9hdChgMC4ke2l9YClcbiAgICB9O1xuICB9KS5zb3J0KChhLCBiKSA9PiAoYS5vcmRlciA/PyAwKSAtIChiLm9yZGVyID8/IDApKS5tYXAoKHsgbmFtZSB9KSA9PiAoeyBuYW1lIH0pKTtcbiAgcmV0dXJuIGJyYW5jaGVzQXJyYXk7XG59LCBcImdldEJyYW5jaGVzQXNPYmpBcnJheVwiKTtcbnZhciBnZXRCcmFuY2hlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gIHJldHVybiBzdGF0ZS5yZWNvcmRzLmJyYW5jaGVzO1xufSwgXCJnZXRCcmFuY2hlc1wiKTtcbnZhciBnZXRDb21taXRzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHN0YXRlLnJlY29yZHMuY29tbWl0cztcbn0sIFwiZ2V0Q29tbWl0c1wiKTtcbnZhciBnZXRDb21taXRzQXJyYXkgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICBjb25zdCBjb21taXRBcnIgPSBbLi4uc3RhdGUucmVjb3Jkcy5jb21taXRzLnZhbHVlcygpXTtcbiAgY29tbWl0QXJyLmZvckVhY2goZnVuY3Rpb24obykge1xuICAgIGxvZy5kZWJ1ZyhvLmlkKTtcbiAgfSk7XG4gIGNvbW1pdEFyci5zb3J0KChhLCBiKSA9PiBhLnNlcSAtIGIuc2VxKTtcbiAgcmV0dXJuIGNvbW1pdEFycjtcbn0sIFwiZ2V0Q29tbWl0c0FycmF5XCIpO1xudmFyIGdldEN1cnJlbnRCcmFuY2ggPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gc3RhdGUucmVjb3Jkcy5jdXJyQnJhbmNoO1xufSwgXCJnZXRDdXJyZW50QnJhbmNoXCIpO1xudmFyIGdldERpcmVjdGlvbiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gIHJldHVybiBzdGF0ZS5yZWNvcmRzLmRpcmVjdGlvbjtcbn0sIFwiZ2V0RGlyZWN0aW9uXCIpO1xudmFyIGdldEhlYWQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gc3RhdGUucmVjb3Jkcy5oZWFkO1xufSwgXCJnZXRIZWFkXCIpO1xudmFyIGRiID0ge1xuICBjb21taXRUeXBlLFxuICBnZXRDb25maWc6IGdldENvbmZpZzMsXG4gIHNldERpcmVjdGlvbixcbiAgc2V0T3B0aW9ucyxcbiAgZ2V0T3B0aW9ucyxcbiAgY29tbWl0LFxuICBicmFuY2gsXG4gIG1lcmdlLFxuICBjaGVycnlQaWNrLFxuICBjaGVja291dCxcbiAgLy9yZXNldCxcbiAgcHJldHR5UHJpbnQsXG4gIGNsZWFyOiBjbGVhcjIsXG4gIGdldEJyYW5jaGVzQXNPYmpBcnJheSxcbiAgZ2V0QnJhbmNoZXMsXG4gIGdldENvbW1pdHMsXG4gIGdldENvbW1pdHNBcnJheSxcbiAgZ2V0Q3VycmVudEJyYW5jaCxcbiAgZ2V0RGlyZWN0aW9uLFxuICBnZXRIZWFkLFxuICBzZXRBY2NUaXRsZSxcbiAgZ2V0QWNjVGl0bGUsXG4gIGdldEFjY0Rlc2NyaXB0aW9uLFxuICBzZXRBY2NEZXNjcmlwdGlvbixcbiAgc2V0RGlhZ3JhbVRpdGxlLFxuICBnZXREaWFncmFtVGl0bGVcbn07XG5cbi8vIHNyYy9kaWFncmFtcy9naXQvZ2l0R3JhcGhQYXJzZXIudHNcbnZhciBwb3B1bGF0ZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGFzdCwgZGIyKSA9PiB7XG4gIHBvcHVsYXRlQ29tbW9uRGIoYXN0LCBkYjIpO1xuICBpZiAoYXN0LmRpcikge1xuICAgIGRiMi5zZXREaXJlY3Rpb24oYXN0LmRpcik7XG4gIH1cbiAgZm9yIChjb25zdCBzdGF0ZW1lbnQgb2YgYXN0LnN0YXRlbWVudHMpIHtcbiAgICBwYXJzZVN0YXRlbWVudChzdGF0ZW1lbnQsIGRiMik7XG4gIH1cbn0sIFwicG9wdWxhdGVcIik7XG52YXIgcGFyc2VTdGF0ZW1lbnQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChzdGF0ZW1lbnQsIGRiMikgPT4ge1xuICBjb25zdCBwYXJzZXJzID0ge1xuICAgIENvbW1pdDogLyogQF9fUFVSRV9fICovIF9fbmFtZSgoc3RtdCkgPT4gZGIyLmNvbW1pdChwYXJzZUNvbW1pdChzdG10KSksIFwiQ29tbWl0XCIpLFxuICAgIEJyYW5jaDogLyogQF9fUFVSRV9fICovIF9fbmFtZSgoc3RtdCkgPT4gZGIyLmJyYW5jaChwYXJzZUJyYW5jaChzdG10KSksIFwiQnJhbmNoXCIpLFxuICAgIE1lcmdlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKChzdG10KSA9PiBkYjIubWVyZ2UocGFyc2VNZXJnZShzdG10KSksIFwiTWVyZ2VcIiksXG4gICAgQ2hlY2tvdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHN0bXQpID0+IGRiMi5jaGVja291dChwYXJzZUNoZWNrb3V0KHN0bXQpKSwgXCJDaGVja291dFwiKSxcbiAgICBDaGVycnlQaWNraW5nOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKChzdG10KSA9PiBkYjIuY2hlcnJ5UGljayhwYXJzZUNoZXJyeVBpY2tpbmcoc3RtdCkpLCBcIkNoZXJyeVBpY2tpbmdcIilcbiAgfTtcbiAgY29uc3QgcGFyc2VyMiA9IHBhcnNlcnNbc3RhdGVtZW50LiR0eXBlXTtcbiAgaWYgKHBhcnNlcjIpIHtcbiAgICBwYXJzZXIyKHN0YXRlbWVudCk7XG4gIH0gZWxzZSB7XG4gICAgbG9nLmVycm9yKGBVbmtub3duIHN0YXRlbWVudCB0eXBlOiAke3N0YXRlbWVudC4kdHlwZX1gKTtcbiAgfVxufSwgXCJwYXJzZVN0YXRlbWVudFwiKTtcbnZhciBwYXJzZUNvbW1pdCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGNvbW1pdDIpID0+IHtcbiAgY29uc3QgY29tbWl0REIgPSB7XG4gICAgaWQ6IGNvbW1pdDIuaWQsXG4gICAgbXNnOiBjb21taXQyLm1lc3NhZ2UgPz8gXCJcIixcbiAgICB0eXBlOiBjb21taXQyLnR5cGUgIT09IHZvaWQgMCA/IGNvbW1pdFR5cGVbY29tbWl0Mi50eXBlXSA6IGNvbW1pdFR5cGUuTk9STUFMLFxuICAgIHRhZ3M6IGNvbW1pdDIudGFncyA/PyB2b2lkIDBcbiAgfTtcbiAgcmV0dXJuIGNvbW1pdERCO1xufSwgXCJwYXJzZUNvbW1pdFwiKTtcbnZhciBwYXJzZUJyYW5jaCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGJyYW5jaDIpID0+IHtcbiAgY29uc3QgYnJhbmNoREIgPSB7XG4gICAgbmFtZTogYnJhbmNoMi5uYW1lLFxuICAgIG9yZGVyOiBicmFuY2gyLm9yZGVyID8/IDBcbiAgfTtcbiAgcmV0dXJuIGJyYW5jaERCO1xufSwgXCJwYXJzZUJyYW5jaFwiKTtcbnZhciBwYXJzZU1lcmdlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgobWVyZ2UyKSA9PiB7XG4gIGNvbnN0IG1lcmdlREIgPSB7XG4gICAgYnJhbmNoOiBtZXJnZTIuYnJhbmNoLFxuICAgIGlkOiBtZXJnZTIuaWQgPz8gXCJcIixcbiAgICB0eXBlOiBtZXJnZTIudHlwZSAhPT0gdm9pZCAwID8gY29tbWl0VHlwZVttZXJnZTIudHlwZV0gOiB2b2lkIDAsXG4gICAgdGFnczogbWVyZ2UyLnRhZ3MgPz8gdm9pZCAwXG4gIH07XG4gIHJldHVybiBtZXJnZURCO1xufSwgXCJwYXJzZU1lcmdlXCIpO1xudmFyIHBhcnNlQ2hlY2tvdXQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChjaGVja291dDIpID0+IHtcbiAgY29uc3QgYnJhbmNoMiA9IGNoZWNrb3V0Mi5icmFuY2g7XG4gIHJldHVybiBicmFuY2gyO1xufSwgXCJwYXJzZUNoZWNrb3V0XCIpO1xudmFyIHBhcnNlQ2hlcnJ5UGlja2luZyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGNoZXJyeVBpY2tpbmcpID0+IHtcbiAgY29uc3QgY2hlcnJ5UGlja0RCID0ge1xuICAgIGlkOiBjaGVycnlQaWNraW5nLmlkLFxuICAgIHRhcmdldElkOiBcIlwiLFxuICAgIHRhZ3M6IGNoZXJyeVBpY2tpbmcudGFncz8ubGVuZ3RoID09PSAwID8gdm9pZCAwIDogY2hlcnJ5UGlja2luZy50YWdzLFxuICAgIHBhcmVudDogY2hlcnJ5UGlja2luZy5wYXJlbnRcbiAgfTtcbiAgcmV0dXJuIGNoZXJyeVBpY2tEQjtcbn0sIFwicGFyc2VDaGVycnlQaWNraW5nXCIpO1xudmFyIHBhcnNlciA9IHtcbiAgcGFyc2U6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgKGlucHV0KSA9PiB7XG4gICAgY29uc3QgYXN0ID0gYXdhaXQgcGFyc2UoXCJnaXRHcmFwaFwiLCBpbnB1dCk7XG4gICAgbG9nLmRlYnVnKGFzdCk7XG4gICAgcG9wdWxhdGUoYXN0LCBkYik7XG4gIH0sIFwicGFyc2VcIilcbn07XG5pZiAodm9pZCAwKSB7XG4gIGNvbnN0IHsgaXQsIGV4cGVjdCwgZGVzY3JpYmUgfSA9IHZvaWQgMDtcbiAgY29uc3QgbW9ja0RCID0ge1xuICAgIGNvbW1pdFR5cGUsXG4gICAgc2V0RGlyZWN0aW9uOiB2aS5mbigpLFxuICAgIGNvbW1pdDogdmkuZm4oKSxcbiAgICBicmFuY2g6IHZpLmZuKCksXG4gICAgbWVyZ2U6IHZpLmZuKCksXG4gICAgY2hlcnJ5UGljazogdmkuZm4oKSxcbiAgICBjaGVja291dDogdmkuZm4oKVxuICB9O1xuICBkZXNjcmliZShcIkdpdEdyYXBoIFBhcnNlclwiLCAoKSA9PiB7XG4gICAgaXQoXCJzaG91bGQgcGFyc2UgYSBjb21taXQgc3RhdGVtZW50XCIsICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbW1pdDIgPSB7XG4gICAgICAgICR0eXBlOiBcIkNvbW1pdFwiLFxuICAgICAgICBpZDogXCIxXCIsXG4gICAgICAgIG1lc3NhZ2U6IFwidGVzdFwiLFxuICAgICAgICB0YWdzOiBbXCJ0YWcxXCIsIFwidGFnMlwiXSxcbiAgICAgICAgdHlwZTogXCJOT1JNQUxcIlxuICAgICAgfTtcbiAgICAgIHBhcnNlU3RhdGVtZW50KGNvbW1pdDIsIG1vY2tEQik7XG4gICAgICBleHBlY3QobW9ja0RCLmNvbW1pdCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoe1xuICAgICAgICBpZDogXCIxXCIsXG4gICAgICAgIG1zZzogXCJ0ZXN0XCIsXG4gICAgICAgIHRhZ3M6IFtcInRhZzFcIiwgXCJ0YWcyXCJdLFxuICAgICAgICB0eXBlOiAwXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBpdChcInNob3VsZCBwYXJzZSBhIGJyYW5jaCBzdGF0ZW1lbnRcIiwgKCkgPT4ge1xuICAgICAgY29uc3QgYnJhbmNoMiA9IHtcbiAgICAgICAgJHR5cGU6IFwiQnJhbmNoXCIsXG4gICAgICAgIG5hbWU6IFwibmV3QnJhbmNoXCIsXG4gICAgICAgIG9yZGVyOiAxXG4gICAgICB9O1xuICAgICAgcGFyc2VTdGF0ZW1lbnQoYnJhbmNoMiwgbW9ja0RCKTtcbiAgICAgIGV4cGVjdChtb2NrREIuYnJhbmNoKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7IG5hbWU6IFwibmV3QnJhbmNoXCIsIG9yZGVyOiAxIH0pO1xuICAgIH0pO1xuICAgIGl0KFwic2hvdWxkIHBhcnNlIGEgY2hlY2tvdXQgc3RhdGVtZW50XCIsICgpID0+IHtcbiAgICAgIGNvbnN0IGNoZWNrb3V0MiA9IHtcbiAgICAgICAgJHR5cGU6IFwiQ2hlY2tvdXRcIixcbiAgICAgICAgYnJhbmNoOiBcIm5ld0JyYW5jaFwiXG4gICAgICB9O1xuICAgICAgcGFyc2VTdGF0ZW1lbnQoY2hlY2tvdXQyLCBtb2NrREIpO1xuICAgICAgZXhwZWN0KG1vY2tEQi5jaGVja291dCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoXCJuZXdCcmFuY2hcIik7XG4gICAgfSk7XG4gICAgaXQoXCJzaG91bGQgcGFyc2UgYSBtZXJnZSBzdGF0ZW1lbnRcIiwgKCkgPT4ge1xuICAgICAgY29uc3QgbWVyZ2UyID0ge1xuICAgICAgICAkdHlwZTogXCJNZXJnZVwiLFxuICAgICAgICBicmFuY2g6IFwibmV3QnJhbmNoXCIsXG4gICAgICAgIGlkOiBcIjFcIixcbiAgICAgICAgdGFnczogW1widGFnMVwiLCBcInRhZzJcIl0sXG4gICAgICAgIHR5cGU6IFwiTk9STUFMXCJcbiAgICAgIH07XG4gICAgICBwYXJzZVN0YXRlbWVudChtZXJnZTIsIG1vY2tEQik7XG4gICAgICBleHBlY3QobW9ja0RCLm1lcmdlKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7XG4gICAgICAgIGJyYW5jaDogXCJuZXdCcmFuY2hcIixcbiAgICAgICAgaWQ6IFwiMVwiLFxuICAgICAgICB0YWdzOiBbXCJ0YWcxXCIsIFwidGFnMlwiXSxcbiAgICAgICAgdHlwZTogMFxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgaXQoXCJzaG91bGQgcGFyc2UgYSBjaGVycnkgcGlja2luZyBzdGF0ZW1lbnRcIiwgKCkgPT4ge1xuICAgICAgY29uc3QgY2hlcnJ5UGljazIgPSB7XG4gICAgICAgICR0eXBlOiBcIkNoZXJyeVBpY2tpbmdcIixcbiAgICAgICAgaWQ6IFwiMVwiLFxuICAgICAgICB0YWdzOiBbXCJ0YWcxXCIsIFwidGFnMlwiXSxcbiAgICAgICAgcGFyZW50OiBcIjJcIlxuICAgICAgfTtcbiAgICAgIHBhcnNlU3RhdGVtZW50KGNoZXJyeVBpY2syLCBtb2NrREIpO1xuICAgICAgZXhwZWN0KG1vY2tEQi5jaGVycnlQaWNrKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7XG4gICAgICAgIGlkOiBcIjFcIixcbiAgICAgICAgdGFyZ2V0SWQ6IFwiXCIsXG4gICAgICAgIHBhcmVudDogXCIyXCIsXG4gICAgICAgIHRhZ3M6IFtcInRhZzFcIiwgXCJ0YWcyXCJdXG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBpdChcInNob3VsZCBwYXJzZSBhIGxhbmdpdW0gZ2VuZXJhdGVkIGdpdEdyYXBoIGFzdFwiLCAoKSA9PiB7XG4gICAgICBjb25zdCBkdW1teSA9IHtcbiAgICAgICAgJHR5cGU6IFwiR2l0R3JhcGhcIixcbiAgICAgICAgc3RhdGVtZW50czogW10sXG4gICAgICAgIGFjY0Rlc2NyOiBcIlwiLFxuICAgICAgICBhY2NUaXRsZTogXCJcIixcbiAgICAgICAgdGl0bGU6IFwiXCJcbiAgICAgIH07XG4gICAgICBjb25zdCBnaXRHcmFwaEFzdCA9IHtcbiAgICAgICAgJHR5cGU6IFwiR2l0R3JhcGhcIixcbiAgICAgICAgc3RhdGVtZW50czogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgICRjb250YWluZXI6IGR1bW15LFxuICAgICAgICAgICAgJHR5cGU6IFwiQ29tbWl0XCIsXG4gICAgICAgICAgICBpZDogXCIxXCIsXG4gICAgICAgICAgICBtZXNzYWdlOiBcInRlc3RcIixcbiAgICAgICAgICAgIHRhZ3M6IFtcInRhZzFcIiwgXCJ0YWcyXCJdLFxuICAgICAgICAgICAgdHlwZTogXCJOT1JNQUxcIlxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgJGNvbnRhaW5lcjogZHVtbXksXG4gICAgICAgICAgICAkdHlwZTogXCJCcmFuY2hcIixcbiAgICAgICAgICAgIG5hbWU6IFwibmV3QnJhbmNoXCIsXG4gICAgICAgICAgICBvcmRlcjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgJGNvbnRhaW5lcjogZHVtbXksXG4gICAgICAgICAgICAkdHlwZTogXCJNZXJnZVwiLFxuICAgICAgICAgICAgYnJhbmNoOiBcIm5ld0JyYW5jaFwiLFxuICAgICAgICAgICAgaWQ6IFwiMVwiLFxuICAgICAgICAgICAgdGFnczogW1widGFnMVwiLCBcInRhZzJcIl0sXG4gICAgICAgICAgICB0eXBlOiBcIk5PUk1BTFwiXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICAkY29udGFpbmVyOiBkdW1teSxcbiAgICAgICAgICAgICR0eXBlOiBcIkNoZWNrb3V0XCIsXG4gICAgICAgICAgICBicmFuY2g6IFwibmV3QnJhbmNoXCJcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgICRjb250YWluZXI6IGR1bW15LFxuICAgICAgICAgICAgJHR5cGU6IFwiQ2hlcnJ5UGlja2luZ1wiLFxuICAgICAgICAgICAgaWQ6IFwiMVwiLFxuICAgICAgICAgICAgdGFnczogW1widGFnMVwiLCBcInRhZzJcIl0sXG4gICAgICAgICAgICBwYXJlbnQ6IFwiMlwiXG4gICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBhY2NEZXNjcjogXCJcIixcbiAgICAgICAgYWNjVGl0bGU6IFwiXCIsXG4gICAgICAgIHRpdGxlOiBcIlwiXG4gICAgICB9O1xuICAgICAgcG9wdWxhdGUoZ2l0R3JhcGhBc3QsIG1vY2tEQik7XG4gICAgICBleHBlY3QobW9ja0RCLmNvbW1pdCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoe1xuICAgICAgICBpZDogXCIxXCIsXG4gICAgICAgIG1zZzogXCJ0ZXN0XCIsXG4gICAgICAgIHRhZ3M6IFtcInRhZzFcIiwgXCJ0YWcyXCJdLFxuICAgICAgICB0eXBlOiAwXG4gICAgICB9KTtcbiAgICAgIGV4cGVjdChtb2NrREIuYnJhbmNoKS50b0hhdmVCZWVuQ2FsbGVkV2l0aCh7IG5hbWU6IFwibmV3QnJhbmNoXCIsIG9yZGVyOiAxIH0pO1xuICAgICAgZXhwZWN0KG1vY2tEQi5tZXJnZSkudG9IYXZlQmVlbkNhbGxlZFdpdGgoe1xuICAgICAgICBicmFuY2g6IFwibmV3QnJhbmNoXCIsXG4gICAgICAgIGlkOiBcIjFcIixcbiAgICAgICAgdGFnczogW1widGFnMVwiLCBcInRhZzJcIl0sXG4gICAgICAgIHR5cGU6IDBcbiAgICAgIH0pO1xuICAgICAgZXhwZWN0KG1vY2tEQi5jaGVja291dCkudG9IYXZlQmVlbkNhbGxlZFdpdGgoXCJuZXdCcmFuY2hcIik7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vLyBzcmMvZGlhZ3JhbXMvZ2l0L2dpdEdyYXBoUmVuZGVyZXIudHNcbmltcG9ydCB7IHNlbGVjdCB9IGZyb20gXCJkM1wiO1xudmFyIExBWU9VVF9PRkZTRVQgPSAxMDtcbnZhciBDT01NSVRfU1RFUCA9IDQwO1xudmFyIFBYID0gNDtcbnZhciBQWSA9IDI7XG52YXIgVEhFTUVfQ09MT1JfTElNSVQgPSA4O1xudmFyIFJFRFVYX0dFT01FVFJZX1RIRU1FUyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KFtcInJlZHV4XCIsIFwicmVkdXgtZGFya1wiLCBcInJlZHV4LWNvbG9yXCIsIFwicmVkdXgtZGFyay1jb2xvclwiXSk7XG52YXIgUkVEVVhfQlJBTkNIX0xBQkVMX1BBRERJTkdfWSA9IDEyO1xudmFyIENPTE9SX1RIRU1FUyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KFtcInJlZHV4LWNvbG9yXCIsIFwicmVkdXgtZGFyay1jb2xvclwiXSk7XG52YXIgREFSS19USEVNRVMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldChbXCJkYXJrXCIsIFwicmVkdXgtZGFya1wiLCBcInJlZHV4LWRhcmstY29sb3JcIiwgXCJuZW8tZGFya1wiXSk7XG52YXIgY2FsY0NvbG9ySW5kZXggPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChyYXdJbmRleCwgbGltaXQsIGF2b2lkRGVmYXVsdENvbG9yID0gZmFsc2UpID0+IHtcbiAgaWYgKGF2b2lkRGVmYXVsdENvbG9yICYmIHJhd0luZGV4ID4gMCkge1xuICAgIHJldHVybiAocmF3SW5kZXggLSAxKSAlIChsaW1pdCAtIDEpICsgMTtcbiAgfVxuICByZXR1cm4gcmF3SW5kZXggJSBsaW1pdDtcbn0sIFwiY2FsY0NvbG9ySW5kZXhcIik7XG52YXIgYnJhbmNoUG9zID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbnZhciBjb21taXRQb3MgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xudmFyIGRlZmF1bHRQb3MgPSAzMDtcbnZhciBhbGxDb21taXRzRGljdCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG52YXIgbGFuZXMgPSBbXTtcbnZhciBtYXhQb3MgPSAwO1xudmFyIGRpciA9IFwiTFJcIjtcbnZhciBjbGVhcjMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCgpID0+IHtcbiAgYnJhbmNoUG9zLmNsZWFyKCk7XG4gIGNvbW1pdFBvcy5jbGVhcigpO1xuICBhbGxDb21taXRzRGljdC5jbGVhcigpO1xuICBtYXhQb3MgPSAwO1xuICBsYW5lcyA9IFtdO1xuICBkaXIgPSBcIkxSXCI7XG59LCBcImNsZWFyXCIpO1xudmFyIGRyYXdUZXh0ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgodHh0KSA9PiB7XG4gIGNvbnN0IHN2Z0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJ0ZXh0XCIpO1xuICBjb25zdCByb3dzID0gdHlwZW9mIHR4dCA9PT0gXCJzdHJpbmdcIiA/IHR4dC5zcGxpdCgvXFxcXG58XFxufDxiclxccypcXC8/Pi9naSkgOiB0eHQ7XG4gIHJvd3MuZm9yRWFjaCgocm93KSA9PiB7XG4gICAgY29uc3QgdHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInRzcGFuXCIpO1xuICAgIHRzcGFuLnNldEF0dHJpYnV0ZU5TKFwiaHR0cDovL3d3dy53My5vcmcvWE1MLzE5OTgvbmFtZXNwYWNlXCIsIFwieG1sOnNwYWNlXCIsIFwicHJlc2VydmVcIik7XG4gICAgdHNwYW4uc2V0QXR0cmlidXRlKFwiZHlcIiwgXCIxZW1cIik7XG4gICAgdHNwYW4uc2V0QXR0cmlidXRlKFwieFwiLCBcIjBcIik7XG4gICAgdHNwYW4uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJyb3dcIik7XG4gICAgdHNwYW4udGV4dENvbnRlbnQgPSByb3cudHJpbSgpO1xuICAgIHN2Z0xhYmVsLmFwcGVuZENoaWxkKHRzcGFuKTtcbiAgfSk7XG4gIHJldHVybiBzdmdMYWJlbDtcbn0sIFwiZHJhd1RleHRcIik7XG52YXIgZmluZENsb3Nlc3RQYXJlbnQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChwYXJlbnRzKSA9PiB7XG4gIGxldCBjbG9zZXN0UGFyZW50O1xuICBsZXQgY29tcGFyaXNvbkZ1bmM7XG4gIGxldCB0YXJnZXRQb3NpdGlvbjtcbiAgaWYgKGRpciA9PT0gXCJCVFwiKSB7XG4gICAgY29tcGFyaXNvbkZ1bmMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChhLCBiKSA9PiBhIDw9IGIsIFwiY29tcGFyaXNvbkZ1bmNcIik7XG4gICAgdGFyZ2V0UG9zaXRpb24gPSBJbmZpbml0eTtcbiAgfSBlbHNlIHtcbiAgICBjb21wYXJpc29uRnVuYyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGEsIGIpID0+IGEgPj0gYiwgXCJjb21wYXJpc29uRnVuY1wiKTtcbiAgICB0YXJnZXRQb3NpdGlvbiA9IDA7XG4gIH1cbiAgcGFyZW50cy5mb3JFYWNoKChwYXJlbnQpID0+IHtcbiAgICBjb25zdCBwYXJlbnRQb3NpdGlvbiA9IGRpciA9PT0gXCJUQlwiIHx8IGRpciA9PSBcIkJUXCIgPyBjb21taXRQb3MuZ2V0KHBhcmVudCk/LnkgOiBjb21taXRQb3MuZ2V0KHBhcmVudCk/Lng7XG4gICAgaWYgKHBhcmVudFBvc2l0aW9uICE9PSB2b2lkIDAgJiYgY29tcGFyaXNvbkZ1bmMocGFyZW50UG9zaXRpb24sIHRhcmdldFBvc2l0aW9uKSkge1xuICAgICAgY2xvc2VzdFBhcmVudCA9IHBhcmVudDtcbiAgICAgIHRhcmdldFBvc2l0aW9uID0gcGFyZW50UG9zaXRpb247XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGNsb3Nlc3RQYXJlbnQ7XG59LCBcImZpbmRDbG9zZXN0UGFyZW50XCIpO1xudmFyIGZpbmRDbG9zZXN0UGFyZW50QlQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChwYXJlbnRzKSA9PiB7XG4gIGxldCBjbG9zZXN0UGFyZW50ID0gXCJcIjtcbiAgbGV0IG1heFBvc2l0aW9uID0gSW5maW5pdHk7XG4gIHBhcmVudHMuZm9yRWFjaCgocGFyZW50KSA9PiB7XG4gICAgY29uc3QgcGFyZW50UG9zaXRpb24gPSBjb21taXRQb3MuZ2V0KHBhcmVudCkueTtcbiAgICBpZiAocGFyZW50UG9zaXRpb24gPD0gbWF4UG9zaXRpb24pIHtcbiAgICAgIGNsb3Nlc3RQYXJlbnQgPSBwYXJlbnQ7XG4gICAgICBtYXhQb3NpdGlvbiA9IHBhcmVudFBvc2l0aW9uO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBjbG9zZXN0UGFyZW50IHx8IHZvaWQgMDtcbn0sIFwiZmluZENsb3Nlc3RQYXJlbnRCVFwiKTtcbnZhciBzZXRQYXJhbGxlbEJUUG9zID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoc29ydGVkS2V5cywgY29tbWl0cywgZGVmYXVsdFBvczIpID0+IHtcbiAgbGV0IGN1clBvcyA9IGRlZmF1bHRQb3MyO1xuICBsZXQgbWF4UG9zaXRpb24gPSBkZWZhdWx0UG9zMjtcbiAgY29uc3Qgcm9vdHMgPSBbXTtcbiAgc29ydGVkS2V5cy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBjb25zdCBjb21taXQyID0gY29tbWl0cy5nZXQoa2V5KTtcbiAgICBpZiAoIWNvbW1pdDIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ29tbWl0IG5vdCBmb3VuZCBmb3Iga2V5ICR7a2V5fWApO1xuICAgIH1cbiAgICBpZiAoY29tbWl0Mi5wYXJlbnRzLmxlbmd0aCkge1xuICAgICAgY3VyUG9zID0gY2FsY3VsYXRlQ29tbWl0UG9zaXRpb24oY29tbWl0Mik7XG4gICAgICBtYXhQb3NpdGlvbiA9IE1hdGgubWF4KGN1clBvcywgbWF4UG9zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICByb290cy5wdXNoKGNvbW1pdDIpO1xuICAgIH1cbiAgICBzZXRDb21taXRQb3NpdGlvbihjb21taXQyLCBjdXJQb3MpO1xuICB9KTtcbiAgY3VyUG9zID0gbWF4UG9zaXRpb247XG4gIHJvb3RzLmZvckVhY2goKGNvbW1pdDIpID0+IHtcbiAgICBzZXRSb290UG9zaXRpb24oY29tbWl0MiwgY3VyUG9zLCBkZWZhdWx0UG9zMik7XG4gIH0pO1xuICBzb3J0ZWRLZXlzLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGNvbnN0IGNvbW1pdDIgPSBjb21taXRzLmdldChrZXkpO1xuICAgIGlmIChjb21taXQyPy5wYXJlbnRzLmxlbmd0aCkge1xuICAgICAgY29uc3QgY2xvc2VzdFBhcmVudCA9IGZpbmRDbG9zZXN0UGFyZW50QlQoY29tbWl0Mi5wYXJlbnRzKTtcbiAgICAgIGN1clBvcyA9IGNvbW1pdFBvcy5nZXQoY2xvc2VzdFBhcmVudCkueSAtIENPTU1JVF9TVEVQO1xuICAgICAgaWYgKGN1clBvcyA8PSBtYXhQb3NpdGlvbikge1xuICAgICAgICBtYXhQb3NpdGlvbiA9IGN1clBvcztcbiAgICAgIH1cbiAgICAgIGNvbnN0IHggPSBicmFuY2hQb3MuZ2V0KGNvbW1pdDIuYnJhbmNoKS5wb3M7XG4gICAgICBjb25zdCB5ID0gY3VyUG9zIC0gTEFZT1VUX09GRlNFVDtcbiAgICAgIGNvbW1pdFBvcy5zZXQoY29tbWl0Mi5pZCwgeyB4LCB5IH0pO1xuICAgIH1cbiAgfSk7XG59LCBcInNldFBhcmFsbGVsQlRQb3NcIik7XG52YXIgZmluZENsb3Nlc3RQYXJlbnRQb3MgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChjb21taXQyKSA9PiB7XG4gIGNvbnN0IGNsb3Nlc3RQYXJlbnQgPSBmaW5kQ2xvc2VzdFBhcmVudChjb21taXQyLnBhcmVudHMuZmlsdGVyKChwKSA9PiBwICE9PSBudWxsKSk7XG4gIGlmICghY2xvc2VzdFBhcmVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ2xvc2VzdCBwYXJlbnQgbm90IGZvdW5kIGZvciBjb21taXQgJHtjb21taXQyLmlkfWApO1xuICB9XG4gIGNvbnN0IGNsb3Nlc3RQYXJlbnRQb3MgPSBjb21taXRQb3MuZ2V0KGNsb3Nlc3RQYXJlbnQpPy55O1xuICBpZiAoY2xvc2VzdFBhcmVudFBvcyA9PT0gdm9pZCAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDbG9zZXN0IHBhcmVudCBwb3NpdGlvbiBub3QgZm91bmQgZm9yIGNvbW1pdCAke2NvbW1pdDIuaWR9YCk7XG4gIH1cbiAgcmV0dXJuIGNsb3Nlc3RQYXJlbnRQb3M7XG59LCBcImZpbmRDbG9zZXN0UGFyZW50UG9zXCIpO1xudmFyIGNhbGN1bGF0ZUNvbW1pdFBvc2l0aW9uID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoY29tbWl0MikgPT4ge1xuICBjb25zdCBjbG9zZXN0UGFyZW50UG9zID0gZmluZENsb3Nlc3RQYXJlbnRQb3MoY29tbWl0Mik7XG4gIHJldHVybiBjbG9zZXN0UGFyZW50UG9zICsgQ09NTUlUX1NURVA7XG59LCBcImNhbGN1bGF0ZUNvbW1pdFBvc2l0aW9uXCIpO1xudmFyIHNldENvbW1pdFBvc2l0aW9uID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoY29tbWl0MiwgY3VyUG9zKSA9PiB7XG4gIGNvbnN0IGJyYW5jaDIgPSBicmFuY2hQb3MuZ2V0KGNvbW1pdDIuYnJhbmNoKTtcbiAgaWYgKCFicmFuY2gyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBCcmFuY2ggbm90IGZvdW5kIGZvciBjb21taXQgJHtjb21taXQyLmlkfWApO1xuICB9XG4gIGNvbnN0IHggPSBicmFuY2gyLnBvcztcbiAgY29uc3QgeSA9IGN1clBvcyArIExBWU9VVF9PRkZTRVQ7XG4gIGNvbW1pdFBvcy5zZXQoY29tbWl0Mi5pZCwgeyB4LCB5IH0pO1xuICByZXR1cm4geyB4LCB5IH07XG59LCBcInNldENvbW1pdFBvc2l0aW9uXCIpO1xudmFyIHNldFJvb3RQb3NpdGlvbiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGNvbW1pdDIsIGN1clBvcywgZGVmYXVsdFBvczIpID0+IHtcbiAgY29uc3QgYnJhbmNoMiA9IGJyYW5jaFBvcy5nZXQoY29tbWl0Mi5icmFuY2gpO1xuICBpZiAoIWJyYW5jaDIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEJyYW5jaCBub3QgZm91bmQgZm9yIGNvbW1pdCAke2NvbW1pdDIuaWR9YCk7XG4gIH1cbiAgY29uc3QgeSA9IGN1clBvcyArIGRlZmF1bHRQb3MyO1xuICBjb25zdCB4ID0gYnJhbmNoMi5wb3M7XG4gIGNvbW1pdFBvcy5zZXQoY29tbWl0Mi5pZCwgeyB4LCB5IH0pO1xufSwgXCJzZXRSb290UG9zaXRpb25cIik7XG52YXIgZHJhd0NvbW1pdEJ1bGxldCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGdCdWxsZXRzLCBjb21taXQyLCBjb21taXRQb3NpdGlvbiwgdHlwZUNsYXNzLCBicmFuY2hJbmRleCwgY29tbWl0U3ltYm9sVHlwZSkgPT4ge1xuICBjb25zdCB7IHRoZW1lIH0gPSBnZXRDb25maWcyKCk7XG4gIGNvbnN0IHVzZVJlZHV4R2VvbWV0cnkgPSBSRURVWF9HRU9NRVRSWV9USEVNRVMuaGFzKHRoZW1lID8/IFwiXCIpO1xuICBjb25zdCB1c2VDb2xvclRoZW1lID0gQ09MT1JfVEhFTUVTLmhhcyh0aGVtZSA/PyBcIlwiKTtcbiAgY29uc3QgaXNEYXJrID0gREFSS19USEVNRVMuaGFzKHRoZW1lID8/IFwiXCIpO1xuICBpZiAoY29tbWl0U3ltYm9sVHlwZSA9PT0gY29tbWl0VHlwZS5ISUdITElHSFQpIHtcbiAgICBnQnVsbGV0cy5hcHBlbmQoXCJyZWN0XCIpLmF0dHIoXCJ4XCIsIGNvbW1pdFBvc2l0aW9uLnggLSAxMCArICh1c2VSZWR1eEdlb21ldHJ5ID8gMyA6IDApKS5hdHRyKFwieVwiLCBjb21taXRQb3NpdGlvbi55IC0gMTAgKyAodXNlUmVkdXhHZW9tZXRyeSA/IDMgOiAwKSkuYXR0cihcIndpZHRoXCIsIHVzZVJlZHV4R2VvbWV0cnkgPyAxNCA6IDIwKS5hdHRyKFwiaGVpZ2h0XCIsIHVzZVJlZHV4R2VvbWV0cnkgPyAxNCA6IDIwKS5hdHRyKFxuICAgICAgXCJjbGFzc1wiLFxuICAgICAgYGNvbW1pdCAke2NvbW1pdDIuaWR9IGNvbW1pdC1oaWdobGlnaHQke2NhbGNDb2xvckluZGV4KGJyYW5jaEluZGV4LCBUSEVNRV9DT0xPUl9MSU1JVCwgdXNlQ29sb3JUaGVtZSl9ICR7dHlwZUNsYXNzfS1vdXRlcmBcbiAgICApO1xuICAgIGdCdWxsZXRzLmFwcGVuZChcInJlY3RcIikuYXR0cihcInhcIiwgY29tbWl0UG9zaXRpb24ueCAtIDYgKyAodXNlUmVkdXhHZW9tZXRyeSA/IDIgOiAwKSkuYXR0cihcInlcIiwgY29tbWl0UG9zaXRpb24ueSAtIDYgKyAodXNlUmVkdXhHZW9tZXRyeSA/IDIgOiAwKSkuYXR0cihcIndpZHRoXCIsIHVzZVJlZHV4R2VvbWV0cnkgPyA4IDogMTIpLmF0dHIoXCJoZWlnaHRcIiwgdXNlUmVkdXhHZW9tZXRyeSA/IDggOiAxMikuYXR0cihcbiAgICAgIFwiY2xhc3NcIixcbiAgICAgIGBjb21taXQgJHtjb21taXQyLmlkfSBjb21taXQke2NhbGNDb2xvckluZGV4KGJyYW5jaEluZGV4LCBUSEVNRV9DT0xPUl9MSU1JVCwgdXNlQ29sb3JUaGVtZSl9ICR7dHlwZUNsYXNzfS1pbm5lcmBcbiAgICApO1xuICB9IGVsc2UgaWYgKGNvbW1pdFN5bWJvbFR5cGUgPT09IGNvbW1pdFR5cGUuQ0hFUlJZX1BJQ0spIHtcbiAgICBnQnVsbGV0cy5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImN4XCIsIGNvbW1pdFBvc2l0aW9uLngpLmF0dHIoXCJjeVwiLCBjb21taXRQb3NpdGlvbi55KS5hdHRyKFwiclwiLCB1c2VSZWR1eEdlb21ldHJ5ID8gNyA6IDEwKS5hdHRyKFwiY2xhc3NcIiwgYGNvbW1pdCAke2NvbW1pdDIuaWR9ICR7dHlwZUNsYXNzfWApO1xuICAgIGdCdWxsZXRzLmFwcGVuZChcImNpcmNsZVwiKS5hdHRyKFwiY3hcIiwgY29tbWl0UG9zaXRpb24ueCAtIDMpLmF0dHIoXCJjeVwiLCBjb21taXRQb3NpdGlvbi55ICsgMikuYXR0cihcInJcIiwgdXNlUmVkdXhHZW9tZXRyeSA/IDIuNSA6IDIuNzUpLmF0dHIoXCJmaWxsXCIsIGlzRGFyayA/IFwiIzAwMDAwMFwiIDogXCIjZmZmXCIpLmF0dHIoXCJjbGFzc1wiLCBgY29tbWl0ICR7Y29tbWl0Mi5pZH0gJHt0eXBlQ2xhc3N9YCk7XG4gICAgZ0J1bGxldHMuYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJjeFwiLCBjb21taXRQb3NpdGlvbi54ICsgMykuYXR0cihcImN5XCIsIGNvbW1pdFBvc2l0aW9uLnkgKyAyKS5hdHRyKFwiclwiLCB1c2VSZWR1eEdlb21ldHJ5ID8gMi41IDogMi43NSkuYXR0cihcImZpbGxcIiwgaXNEYXJrID8gXCIjMDAwMDAwXCIgOiBcIiNmZmZcIikuYXR0cihcImNsYXNzXCIsIGBjb21taXQgJHtjb21taXQyLmlkfSAke3R5cGVDbGFzc31gKTtcbiAgICBnQnVsbGV0cy5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJ4MVwiLCBjb21taXRQb3NpdGlvbi54ICsgMykuYXR0cihcInkxXCIsIGNvbW1pdFBvc2l0aW9uLnkgKyAxKS5hdHRyKFwieDJcIiwgY29tbWl0UG9zaXRpb24ueCkuYXR0cihcInkyXCIsIGNvbW1pdFBvc2l0aW9uLnkgLSA1KS5hdHRyKFwic3Ryb2tlXCIsIGlzRGFyayA/IFwiIzAwMDAwMFwiIDogXCIjZmZmXCIpLmF0dHIoXCJjbGFzc1wiLCBgY29tbWl0ICR7Y29tbWl0Mi5pZH0gJHt0eXBlQ2xhc3N9YCk7XG4gICAgZ0J1bGxldHMuYXBwZW5kKFwibGluZVwiKS5hdHRyKFwieDFcIiwgY29tbWl0UG9zaXRpb24ueCAtIDMpLmF0dHIoXCJ5MVwiLCBjb21taXRQb3NpdGlvbi55ICsgMSkuYXR0cihcIngyXCIsIGNvbW1pdFBvc2l0aW9uLngpLmF0dHIoXCJ5MlwiLCBjb21taXRQb3NpdGlvbi55IC0gNSkuYXR0cihcInN0cm9rZVwiLCBpc0RhcmsgPyBcIiMwMDAwMDBcIiA6IFwiI2ZmZlwiKS5hdHRyKFwiY2xhc3NcIiwgYGNvbW1pdCAke2NvbW1pdDIuaWR9ICR7dHlwZUNsYXNzfWApO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGNpcmNsZSA9IGdCdWxsZXRzLmFwcGVuZChcImNpcmNsZVwiKTtcbiAgICBjaXJjbGUuYXR0cihcImN4XCIsIGNvbW1pdFBvc2l0aW9uLngpO1xuICAgIGNpcmNsZS5hdHRyKFwiY3lcIiwgY29tbWl0UG9zaXRpb24ueSk7XG4gICAgY2lyY2xlLmF0dHIoXCJyXCIsIHVzZVJlZHV4R2VvbWV0cnkgPyA3IDogMTApO1xuICAgIGNpcmNsZS5hdHRyKFxuICAgICAgXCJjbGFzc1wiLFxuICAgICAgYGNvbW1pdCAke2NvbW1pdDIuaWR9IGNvbW1pdCR7Y2FsY0NvbG9ySW5kZXgoYnJhbmNoSW5kZXgsIFRIRU1FX0NPTE9SX0xJTUlULCB1c2VDb2xvclRoZW1lKX1gXG4gICAgKTtcbiAgICBpZiAoY29tbWl0U3ltYm9sVHlwZSA9PT0gY29tbWl0VHlwZS5NRVJHRSkge1xuICAgICAgY29uc3QgY2lyY2xlMiA9IGdCdWxsZXRzLmFwcGVuZChcImNpcmNsZVwiKTtcbiAgICAgIGNpcmNsZTIuYXR0cihcImN4XCIsIGNvbW1pdFBvc2l0aW9uLngpO1xuICAgICAgY2lyY2xlMi5hdHRyKFwiY3lcIiwgY29tbWl0UG9zaXRpb24ueSk7XG4gICAgICBjaXJjbGUyLmF0dHIoXCJyXCIsIHVzZVJlZHV4R2VvbWV0cnkgPyA1IDogNik7XG4gICAgICBjaXJjbGUyLmF0dHIoXG4gICAgICAgIFwiY2xhc3NcIixcbiAgICAgICAgYGNvbW1pdCAke3R5cGVDbGFzc30gJHtjb21taXQyLmlkfSBjb21taXQke2NhbGNDb2xvckluZGV4KGJyYW5jaEluZGV4LCBUSEVNRV9DT0xPUl9MSU1JVCwgdXNlQ29sb3JUaGVtZSl9YFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGNvbW1pdFN5bWJvbFR5cGUgPT09IGNvbW1pdFR5cGUuUkVWRVJTRSkge1xuICAgICAgY29uc3QgY3Jvc3MgPSBnQnVsbGV0cy5hcHBlbmQoXCJwYXRoXCIpO1xuICAgICAgY29uc3QgY29uc3RWYWx1ZSA9IHVzZVJlZHV4R2VvbWV0cnkgPyA0IDogNTtcbiAgICAgIGNyb3NzLmF0dHIoXG4gICAgICAgIFwiZFwiLFxuICAgICAgICBgTSAke2NvbW1pdFBvc2l0aW9uLnggLSBjb25zdFZhbHVlfSwke2NvbW1pdFBvc2l0aW9uLnkgLSBjb25zdFZhbHVlfUwke2NvbW1pdFBvc2l0aW9uLnggKyBjb25zdFZhbHVlfSwke2NvbW1pdFBvc2l0aW9uLnkgKyBjb25zdFZhbHVlfU0ke2NvbW1pdFBvc2l0aW9uLnggLSBjb25zdFZhbHVlfSwke2NvbW1pdFBvc2l0aW9uLnkgKyBjb25zdFZhbHVlfUwke2NvbW1pdFBvc2l0aW9uLnggKyBjb25zdFZhbHVlfSwke2NvbW1pdFBvc2l0aW9uLnkgLSBjb25zdFZhbHVlfWBcbiAgICAgICkuYXR0cihcbiAgICAgICAgXCJjbGFzc1wiLFxuICAgICAgICBgY29tbWl0ICR7dHlwZUNsYXNzfSAke2NvbW1pdDIuaWR9IGNvbW1pdCR7Y2FsY0NvbG9ySW5kZXgoYnJhbmNoSW5kZXgsIFRIRU1FX0NPTE9SX0xJTUlULCB1c2VDb2xvclRoZW1lKX1gXG4gICAgICApO1xuICAgIH1cbiAgfVxufSwgXCJkcmF3Q29tbWl0QnVsbGV0XCIpO1xudmFyIGRyYXdDb21taXRMYWJlbCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGdMYWJlbHMsIGNvbW1pdDIsIGNvbW1pdFBvc2l0aW9uLCBwb3MsIGdpdEdyYXBoQ29uZmlnKSA9PiB7XG4gIGlmIChjb21taXQyLnR5cGUgIT09IGNvbW1pdFR5cGUuQ0hFUlJZX1BJQ0sgJiYgKGNvbW1pdDIuY3VzdG9tSWQgJiYgY29tbWl0Mi50eXBlID09PSBjb21taXRUeXBlLk1FUkdFIHx8IGNvbW1pdDIudHlwZSAhPT0gY29tbWl0VHlwZS5NRVJHRSkgJiYgZ2l0R3JhcGhDb25maWcuc2hvd0NvbW1pdExhYmVsKSB7XG4gICAgY29uc3Qgd3JhcHBlciA9IGdMYWJlbHMuYXBwZW5kKFwiZ1wiKTtcbiAgICBjb25zdCBsYWJlbEJrZyA9IHdyYXBwZXIuaW5zZXJ0KFwicmVjdFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJjb21taXQtbGFiZWwtYmtnXCIpO1xuICAgIGNvbnN0IHRleHQgPSB3cmFwcGVyLmFwcGVuZChcInRleHRcIikuYXR0cihcInhcIiwgcG9zKS5hdHRyKFwieVwiLCBjb21taXRQb3NpdGlvbi55ICsgMjUpLmF0dHIoXCJjbGFzc1wiLCBcImNvbW1pdC1sYWJlbFwiKS50ZXh0KGNvbW1pdDIuaWQpO1xuICAgIGNvbnN0IGJib3ggPSB0ZXh0Lm5vZGUoKT8uZ2V0QkJveCgpO1xuICAgIGlmIChiYm94KSB7XG4gICAgICBsYWJlbEJrZy5hdHRyKFwieFwiLCBjb21taXRQb3NpdGlvbi5wb3NXaXRoT2Zmc2V0IC0gYmJveC53aWR0aCAvIDIgLSBQWSkuYXR0cihcInlcIiwgY29tbWl0UG9zaXRpb24ueSArIDEzLjUpLmF0dHIoXCJ3aWR0aFwiLCBiYm94LndpZHRoICsgMiAqIFBZKS5hdHRyKFwiaGVpZ2h0XCIsIGJib3guaGVpZ2h0ICsgMiAqIFBZKTtcbiAgICAgIGlmIChkaXIgPT09IFwiVEJcIiB8fCBkaXIgPT09IFwiQlRcIikge1xuICAgICAgICBsYWJlbEJrZy5hdHRyKFwieFwiLCBjb21taXRQb3NpdGlvbi54IC0gKGJib3gud2lkdGggKyA0ICogUFggKyA1KSkuYXR0cihcInlcIiwgY29tbWl0UG9zaXRpb24ueSAtIDEyKTtcbiAgICAgICAgdGV4dC5hdHRyKFwieFwiLCBjb21taXRQb3NpdGlvbi54IC0gKGJib3gud2lkdGggKyA0ICogUFgpKS5hdHRyKFwieVwiLCBjb21taXRQb3NpdGlvbi55ICsgYmJveC5oZWlnaHQgLSAxMik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0LmF0dHIoXCJ4XCIsIGNvbW1pdFBvc2l0aW9uLnBvc1dpdGhPZmZzZXQgLSBiYm94LndpZHRoIC8gMik7XG4gICAgICB9XG4gICAgICBpZiAoZ2l0R3JhcGhDb25maWcucm90YXRlQ29tbWl0TGFiZWwpIHtcbiAgICAgICAgaWYgKGRpciA9PT0gXCJUQlwiIHx8IGRpciA9PT0gXCJCVFwiKSB7XG4gICAgICAgICAgdGV4dC5hdHRyKFxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1cIixcbiAgICAgICAgICAgIFwicm90YXRlKC00NSwgXCIgKyBjb21taXRQb3NpdGlvbi54ICsgXCIsIFwiICsgY29tbWl0UG9zaXRpb24ueSArIFwiKVwiXG4gICAgICAgICAgKTtcbiAgICAgICAgICBsYWJlbEJrZy5hdHRyKFxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1cIixcbiAgICAgICAgICAgIFwicm90YXRlKC00NSwgXCIgKyBjb21taXRQb3NpdGlvbi54ICsgXCIsIFwiICsgY29tbWl0UG9zaXRpb24ueSArIFwiKVwiXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCByX3ggPSAtNy41IC0gKGJib3gud2lkdGggKyAxMCkgLyAyNSAqIDkuNTtcbiAgICAgICAgICBjb25zdCByX3kgPSAxMCArIGJib3gud2lkdGggLyAyNSAqIDguNTtcbiAgICAgICAgICB3cmFwcGVyLmF0dHIoXG4gICAgICAgICAgICBcInRyYW5zZm9ybVwiLFxuICAgICAgICAgICAgXCJ0cmFuc2xhdGUoXCIgKyByX3ggKyBcIiwgXCIgKyByX3kgKyBcIikgcm90YXRlKC00NSwgXCIgKyBwb3MgKyBcIiwgXCIgKyBjb21taXRQb3NpdGlvbi55ICsgXCIpXCJcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59LCBcImRyYXdDb21taXRMYWJlbFwiKTtcbnZhciBkcmF3Q29tbWl0VGFncyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGdMYWJlbHMsIGNvbW1pdDIsIGNvbW1pdFBvc2l0aW9uLCBwb3MpID0+IHtcbiAgaWYgKGNvbW1pdDIudGFncy5sZW5ndGggPiAwKSB7XG4gICAgbGV0IHlPZmZzZXQgPSAwO1xuICAgIGxldCBtYXhUYWdCYm94V2lkdGggPSAwO1xuICAgIGxldCBtYXhUYWdCYm94SGVpZ2h0ID0gMDtcbiAgICBjb25zdCB0YWdFbGVtZW50cyA9IFtdO1xuICAgIGZvciAoY29uc3QgdGFnVmFsdWUgb2YgY29tbWl0Mi50YWdzLnJldmVyc2UoKSkge1xuICAgICAgY29uc3QgcmVjdCA9IGdMYWJlbHMuaW5zZXJ0KFwicG9seWdvblwiKTtcbiAgICAgIGNvbnN0IGhvbGUgPSBnTGFiZWxzLmFwcGVuZChcImNpcmNsZVwiKTtcbiAgICAgIGNvbnN0IHRhZyA9IGdMYWJlbHMuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwieVwiLCBjb21taXRQb3NpdGlvbi55IC0gMTYgLSB5T2Zmc2V0KS5hdHRyKFwiY2xhc3NcIiwgXCJ0YWctbGFiZWxcIikudGV4dCh0YWdWYWx1ZSk7XG4gICAgICBjb25zdCB0YWdCYm94ID0gdGFnLm5vZGUoKT8uZ2V0QkJveCgpO1xuICAgICAgaWYgKCF0YWdCYm94KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRhZyBiYm94IG5vdCBmb3VuZFwiKTtcbiAgICAgIH1cbiAgICAgIG1heFRhZ0Jib3hXaWR0aCA9IE1hdGgubWF4KG1heFRhZ0Jib3hXaWR0aCwgdGFnQmJveC53aWR0aCk7XG4gICAgICBtYXhUYWdCYm94SGVpZ2h0ID0gTWF0aC5tYXgobWF4VGFnQmJveEhlaWdodCwgdGFnQmJveC5oZWlnaHQpO1xuICAgICAgdGFnLmF0dHIoXCJ4XCIsIGNvbW1pdFBvc2l0aW9uLnBvc1dpdGhPZmZzZXQgLSB0YWdCYm94LndpZHRoIC8gMik7XG4gICAgICB0YWdFbGVtZW50cy5wdXNoKHtcbiAgICAgICAgdGFnLFxuICAgICAgICBob2xlLFxuICAgICAgICByZWN0LFxuICAgICAgICB5T2Zmc2V0XG4gICAgICB9KTtcbiAgICAgIHlPZmZzZXQgKz0gMjA7XG4gICAgfVxuICAgIGZvciAoY29uc3QgeyB0YWcsIGhvbGUsIHJlY3QsIHlPZmZzZXQ6IHlPZmZzZXQyIH0gb2YgdGFnRWxlbWVudHMpIHtcbiAgICAgIGNvbnN0IGgyID0gbWF4VGFnQmJveEhlaWdodCAvIDI7XG4gICAgICBjb25zdCBseSA9IGNvbW1pdFBvc2l0aW9uLnkgLSAxOS4yIC0geU9mZnNldDI7XG4gICAgICByZWN0LmF0dHIoXCJjbGFzc1wiLCBcInRhZy1sYWJlbC1ia2dcIikuYXR0cihcbiAgICAgICAgXCJwb2ludHNcIixcbiAgICAgICAgYFxuICAgICAgJHtwb3MgLSBtYXhUYWdCYm94V2lkdGggLyAyIC0gUFggLyAyfSwke2x5ICsgUFl9ICBcbiAgICAgICR7cG9zIC0gbWF4VGFnQmJveFdpZHRoIC8gMiAtIFBYIC8gMn0sJHtseSAtIFBZfVxuICAgICAgJHtjb21taXRQb3NpdGlvbi5wb3NXaXRoT2Zmc2V0IC0gbWF4VGFnQmJveFdpZHRoIC8gMiAtIFBYfSwke2x5IC0gaDIgLSBQWX1cbiAgICAgICR7Y29tbWl0UG9zaXRpb24ucG9zV2l0aE9mZnNldCArIG1heFRhZ0Jib3hXaWR0aCAvIDIgKyBQWH0sJHtseSAtIGgyIC0gUFl9XG4gICAgICAke2NvbW1pdFBvc2l0aW9uLnBvc1dpdGhPZmZzZXQgKyBtYXhUYWdCYm94V2lkdGggLyAyICsgUFh9LCR7bHkgKyBoMiArIFBZfVxuICAgICAgJHtjb21taXRQb3NpdGlvbi5wb3NXaXRoT2Zmc2V0IC0gbWF4VGFnQmJveFdpZHRoIC8gMiAtIFBYfSwke2x5ICsgaDIgKyBQWX1gXG4gICAgICApO1xuICAgICAgaG9sZS5hdHRyKFwiY3lcIiwgbHkpLmF0dHIoXCJjeFwiLCBwb3MgLSBtYXhUYWdCYm94V2lkdGggLyAyICsgUFggLyAyKS5hdHRyKFwiclwiLCAxLjUpLmF0dHIoXCJjbGFzc1wiLCBcInRhZy1ob2xlXCIpO1xuICAgICAgaWYgKGRpciA9PT0gXCJUQlwiIHx8IGRpciA9PT0gXCJCVFwiKSB7XG4gICAgICAgIGNvbnN0IHlPcmlnaW4gPSBwb3MgKyB5T2Zmc2V0MjtcbiAgICAgICAgcmVjdC5hdHRyKFwiY2xhc3NcIiwgXCJ0YWctbGFiZWwtYmtnXCIpLmF0dHIoXG4gICAgICAgICAgXCJwb2ludHNcIixcbiAgICAgICAgICBgXG4gICAgICAgICR7Y29tbWl0UG9zaXRpb24ueH0sJHt5T3JpZ2luICsgMn1cbiAgICAgICAgJHtjb21taXRQb3NpdGlvbi54fSwke3lPcmlnaW4gLSAyfVxuICAgICAgICAke2NvbW1pdFBvc2l0aW9uLnggKyBMQVlPVVRfT0ZGU0VUfSwke3lPcmlnaW4gLSBoMiAtIDJ9XG4gICAgICAgICR7Y29tbWl0UG9zaXRpb24ueCArIExBWU9VVF9PRkZTRVQgKyBtYXhUYWdCYm94V2lkdGggKyA0fSwke3lPcmlnaW4gLSBoMiAtIDJ9XG4gICAgICAgICR7Y29tbWl0UG9zaXRpb24ueCArIExBWU9VVF9PRkZTRVQgKyBtYXhUYWdCYm94V2lkdGggKyA0fSwke3lPcmlnaW4gKyBoMiArIDJ9XG4gICAgICAgICR7Y29tbWl0UG9zaXRpb24ueCArIExBWU9VVF9PRkZTRVR9LCR7eU9yaWdpbiArIGgyICsgMn1gXG4gICAgICAgICkuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgxMiwxMikgcm90YXRlKDQ1LCBcIiArIGNvbW1pdFBvc2l0aW9uLnggKyBcIixcIiArIHBvcyArIFwiKVwiKTtcbiAgICAgICAgaG9sZS5hdHRyKFwiY3hcIiwgY29tbWl0UG9zaXRpb24ueCArIFBYIC8gMikuYXR0cihcImN5XCIsIHlPcmlnaW4pLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMTIsMTIpIHJvdGF0ZSg0NSwgXCIgKyBjb21taXRQb3NpdGlvbi54ICsgXCIsXCIgKyBwb3MgKyBcIilcIik7XG4gICAgICAgIHRhZy5hdHRyKFwieFwiLCBjb21taXRQb3NpdGlvbi54ICsgNSkuYXR0cihcInlcIiwgeU9yaWdpbiArIDMpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMTQsMTQpIHJvdGF0ZSg0NSwgXCIgKyBjb21taXRQb3NpdGlvbi54ICsgXCIsXCIgKyBwb3MgKyBcIilcIik7XG4gICAgICB9XG4gICAgfVxuICB9XG59LCBcImRyYXdDb21taXRUYWdzXCIpO1xudmFyIGdldENvbW1pdENsYXNzVHlwZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGNvbW1pdDIpID0+IHtcbiAgY29uc3QgY29tbWl0U3ltYm9sVHlwZSA9IGNvbW1pdDIuY3VzdG9tVHlwZSA/PyBjb21taXQyLnR5cGU7XG4gIHN3aXRjaCAoY29tbWl0U3ltYm9sVHlwZSkge1xuICAgIGNhc2UgY29tbWl0VHlwZS5OT1JNQUw6XG4gICAgICByZXR1cm4gXCJjb21taXQtbm9ybWFsXCI7XG4gICAgY2FzZSBjb21taXRUeXBlLlJFVkVSU0U6XG4gICAgICByZXR1cm4gXCJjb21taXQtcmV2ZXJzZVwiO1xuICAgIGNhc2UgY29tbWl0VHlwZS5ISUdITElHSFQ6XG4gICAgICByZXR1cm4gXCJjb21taXQtaGlnaGxpZ2h0XCI7XG4gICAgY2FzZSBjb21taXRUeXBlLk1FUkdFOlxuICAgICAgcmV0dXJuIFwiY29tbWl0LW1lcmdlXCI7XG4gICAgY2FzZSBjb21taXRUeXBlLkNIRVJSWV9QSUNLOlxuICAgICAgcmV0dXJuIFwiY29tbWl0LWNoZXJyeS1waWNrXCI7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBcImNvbW1pdC1ub3JtYWxcIjtcbiAgfVxufSwgXCJnZXRDb21taXRDbGFzc1R5cGVcIik7XG52YXIgY2FsY3VsYXRlUG9zaXRpb24gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChjb21taXQyLCBkaXIyLCBwb3MsIGNvbW1pdFBvczIpID0+IHtcbiAgY29uc3QgZGVmYXVsdENvbW1pdFBvc2l0aW9uID0geyB4OiAwLCB5OiAwIH07XG4gIGlmIChjb21taXQyLnBhcmVudHMubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGNsb3Nlc3RQYXJlbnQgPSBmaW5kQ2xvc2VzdFBhcmVudChjb21taXQyLnBhcmVudHMpO1xuICAgIGlmIChjbG9zZXN0UGFyZW50KSB7XG4gICAgICBjb25zdCBwYXJlbnRQb3NpdGlvbiA9IGNvbW1pdFBvczIuZ2V0KGNsb3Nlc3RQYXJlbnQpID8/IGRlZmF1bHRDb21taXRQb3NpdGlvbjtcbiAgICAgIGlmIChkaXIyID09PSBcIlRCXCIpIHtcbiAgICAgICAgcmV0dXJuIHBhcmVudFBvc2l0aW9uLnkgKyBDT01NSVRfU1RFUDtcbiAgICAgIH0gZWxzZSBpZiAoZGlyMiA9PT0gXCJCVFwiKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRQb3NpdGlvbiA9IGNvbW1pdFBvczIuZ2V0KGNvbW1pdDIuaWQpID8/IGRlZmF1bHRDb21taXRQb3NpdGlvbjtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRQb3NpdGlvbi55IC0gQ09NTUlUX1NURVA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcGFyZW50UG9zaXRpb24ueCArIENPTU1JVF9TVEVQO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZGlyMiA9PT0gXCJUQlwiKSB7XG4gICAgICByZXR1cm4gZGVmYXVsdFBvcztcbiAgICB9IGVsc2UgaWYgKGRpcjIgPT09IFwiQlRcIikge1xuICAgICAgY29uc3QgY3VycmVudFBvc2l0aW9uID0gY29tbWl0UG9zMi5nZXQoY29tbWl0Mi5pZCkgPz8gZGVmYXVsdENvbW1pdFBvc2l0aW9uO1xuICAgICAgcmV0dXJuIGN1cnJlbnRQb3NpdGlvbi55IC0gQ09NTUlUX1NURVA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgfVxuICByZXR1cm4gMDtcbn0sIFwiY2FsY3VsYXRlUG9zaXRpb25cIik7XG52YXIgZ2V0Q29tbWl0UG9zaXRpb24gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChjb21taXQyLCBwb3MsIGlzUGFyYWxsZWxDb21taXRzKSA9PiB7XG4gIGNvbnN0IHBvc1dpdGhPZmZzZXQgPSBkaXIgPT09IFwiQlRcIiAmJiBpc1BhcmFsbGVsQ29tbWl0cyA/IHBvcyA6IHBvcyArIExBWU9VVF9PRkZTRVQ7XG4gIGNvbnN0IGJyYW5jaFkgPSBicmFuY2hQb3MuZ2V0KGNvbW1pdDIuYnJhbmNoKT8ucG9zO1xuICBjb25zdCB4ID0gZGlyID09PSBcIlRCXCIgfHwgZGlyID09PSBcIkJUXCIgPyBicmFuY2hQb3MuZ2V0KGNvbW1pdDIuYnJhbmNoKT8ucG9zIDogcG9zV2l0aE9mZnNldDtcbiAgaWYgKHggPT09IHZvaWQgMCB8fCBicmFuY2hZID09PSB2b2lkIDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFBvc2l0aW9uIHdlcmUgdW5kZWZpbmVkIGZvciBjb21taXQgJHtjb21taXQyLmlkfWApO1xuICB9XG4gIGNvbnN0IHVzZVJlZHV4R2VvbWV0cnkgPSBSRURVWF9HRU9NRVRSWV9USEVNRVMuaGFzKGdldENvbmZpZzIoKS50aGVtZSA/PyBcIlwiKTtcbiAgY29uc3QgeSA9IGRpciA9PT0gXCJUQlwiIHx8IGRpciA9PT0gXCJCVFwiID8gcG9zV2l0aE9mZnNldCA6IGJyYW5jaFkgKyAodXNlUmVkdXhHZW9tZXRyeSA/IFJFRFVYX0JSQU5DSF9MQUJFTF9QQURESU5HX1kgLyAyICsgMSA6IC0yKTtcbiAgcmV0dXJuIHsgeCwgeSwgcG9zV2l0aE9mZnNldCB9O1xufSwgXCJnZXRDb21taXRQb3NpdGlvblwiKTtcbnZhciBkcmF3Q29tbWl0cyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHN2ZywgY29tbWl0cywgbW9kaWZ5R3JhcGgsIGdpdEdyYXBoQ29uZmlnKSA9PiB7XG4gIGNvbnN0IGdCdWxsZXRzID0gc3ZnLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwiY29tbWl0LWJ1bGxldHNcIik7XG4gIGNvbnN0IGdMYWJlbHMgPSBzdmcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJjb21taXQtbGFiZWxzXCIpO1xuICBsZXQgcG9zID0gZGlyID09PSBcIlRCXCIgfHwgZGlyID09PSBcIkJUXCIgPyBkZWZhdWx0UG9zIDogMDtcbiAgY29uc3Qga2V5cyA9IFsuLi5jb21taXRzLmtleXMoKV07XG4gIGNvbnN0IGlzUGFyYWxsZWxDb21taXRzID0gZ2l0R3JhcGhDb25maWcucGFyYWxsZWxDb21taXRzID8/IGZhbHNlO1xuICBjb25zdCBzb3J0S2V5cyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGEsIGIpID0+IHtcbiAgICBjb25zdCBzZXFBID0gY29tbWl0cy5nZXQoYSk/LnNlcTtcbiAgICBjb25zdCBzZXFCID0gY29tbWl0cy5nZXQoYik/LnNlcTtcbiAgICByZXR1cm4gc2VxQSAhPT0gdm9pZCAwICYmIHNlcUIgIT09IHZvaWQgMCA/IHNlcUEgLSBzZXFCIDogMDtcbiAgfSwgXCJzb3J0S2V5c1wiKTtcbiAgbGV0IHNvcnRlZEtleXMgPSBrZXlzLnNvcnQoc29ydEtleXMpO1xuICBpZiAoZGlyID09PSBcIkJUXCIpIHtcbiAgICBpZiAoaXNQYXJhbGxlbENvbW1pdHMpIHtcbiAgICAgIHNldFBhcmFsbGVsQlRQb3Moc29ydGVkS2V5cywgY29tbWl0cywgcG9zKTtcbiAgICB9XG4gICAgc29ydGVkS2V5cyA9IHNvcnRlZEtleXMucmV2ZXJzZSgpO1xuICB9XG4gIHNvcnRlZEtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgY29uc3QgY29tbWl0MiA9IGNvbW1pdHMuZ2V0KGtleSk7XG4gICAgaWYgKCFjb21taXQyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbW1pdCBub3QgZm91bmQgZm9yIGtleSAke2tleX1gKTtcbiAgICB9XG4gICAgaWYgKGlzUGFyYWxsZWxDb21taXRzKSB7XG4gICAgICBwb3MgPSBjYWxjdWxhdGVQb3NpdGlvbihjb21taXQyLCBkaXIsIHBvcywgY29tbWl0UG9zKTtcbiAgICB9XG4gICAgY29uc3QgY29tbWl0UG9zaXRpb24gPSBnZXRDb21taXRQb3NpdGlvbihjb21taXQyLCBwb3MsIGlzUGFyYWxsZWxDb21taXRzKTtcbiAgICBpZiAobW9kaWZ5R3JhcGgpIHtcbiAgICAgIGNvbnN0IHR5cGVDbGFzcyA9IGdldENvbW1pdENsYXNzVHlwZShjb21taXQyKTtcbiAgICAgIGNvbnN0IGNvbW1pdFN5bWJvbFR5cGUgPSBjb21taXQyLmN1c3RvbVR5cGUgPz8gY29tbWl0Mi50eXBlO1xuICAgICAgY29uc3QgYnJhbmNoSW5kZXggPSBicmFuY2hQb3MuZ2V0KGNvbW1pdDIuYnJhbmNoKT8uaW5kZXggPz8gMDtcbiAgICAgIGRyYXdDb21taXRCdWxsZXQoZ0J1bGxldHMsIGNvbW1pdDIsIGNvbW1pdFBvc2l0aW9uLCB0eXBlQ2xhc3MsIGJyYW5jaEluZGV4LCBjb21taXRTeW1ib2xUeXBlKTtcbiAgICAgIGRyYXdDb21taXRMYWJlbChnTGFiZWxzLCBjb21taXQyLCBjb21taXRQb3NpdGlvbiwgcG9zLCBnaXRHcmFwaENvbmZpZyk7XG4gICAgICBkcmF3Q29tbWl0VGFncyhnTGFiZWxzLCBjb21taXQyLCBjb21taXRQb3NpdGlvbiwgcG9zKTtcbiAgICB9XG4gICAgaWYgKGRpciA9PT0gXCJUQlwiIHx8IGRpciA9PT0gXCJCVFwiKSB7XG4gICAgICBjb21taXRQb3Muc2V0KGNvbW1pdDIuaWQsIHsgeDogY29tbWl0UG9zaXRpb24ueCwgeTogY29tbWl0UG9zaXRpb24ucG9zV2l0aE9mZnNldCB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29tbWl0UG9zLnNldChjb21taXQyLmlkLCB7IHg6IGNvbW1pdFBvc2l0aW9uLnBvc1dpdGhPZmZzZXQsIHk6IGNvbW1pdFBvc2l0aW9uLnkgfSk7XG4gICAgfVxuICAgIHBvcyA9IGRpciA9PT0gXCJCVFwiICYmIGlzUGFyYWxsZWxDb21taXRzID8gcG9zICsgQ09NTUlUX1NURVAgOiBwb3MgKyBDT01NSVRfU1RFUCArIExBWU9VVF9PRkZTRVQ7XG4gICAgaWYgKHBvcyA+IG1heFBvcykge1xuICAgICAgbWF4UG9zID0gcG9zO1xuICAgIH1cbiAgfSk7XG59LCBcImRyYXdDb21taXRzXCIpO1xudmFyIHNob3VsZFJlcm91dGVBcnJvdyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGNvbW1pdEEsIGNvbW1pdEIsIHAxLCBwMiwgYWxsQ29tbWl0cykgPT4ge1xuICBjb25zdCBjb21taXRCSXNGdXJ0aGVzdCA9IGRpciA9PT0gXCJUQlwiIHx8IGRpciA9PT0gXCJCVFwiID8gcDEueCA8IHAyLnggOiBwMS55IDwgcDIueTtcbiAgY29uc3QgYnJhbmNoVG9HZXRDdXJ2ZSA9IGNvbW1pdEJJc0Z1cnRoZXN0ID8gY29tbWl0Qi5icmFuY2ggOiBjb21taXRBLmJyYW5jaDtcbiAgY29uc3QgaXNPbkJyYW5jaFRvR2V0Q3VydmUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCh4KSA9PiB4LmJyYW5jaCA9PT0gYnJhbmNoVG9HZXRDdXJ2ZSwgXCJpc09uQnJhbmNoVG9HZXRDdXJ2ZVwiKTtcbiAgY29uc3QgaXNCZXR3ZWVuQ29tbWl0cyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHgpID0+IHguc2VxID4gY29tbWl0QS5zZXEgJiYgeC5zZXEgPCBjb21taXRCLnNlcSwgXCJpc0JldHdlZW5Db21taXRzXCIpO1xuICByZXR1cm4gWy4uLmFsbENvbW1pdHMudmFsdWVzKCldLnNvbWUoKGNvbW1pdFgpID0+IHtcbiAgICByZXR1cm4gaXNCZXR3ZWVuQ29tbWl0cyhjb21taXRYKSAmJiBpc09uQnJhbmNoVG9HZXRDdXJ2ZShjb21taXRYKTtcbiAgfSk7XG59LCBcInNob3VsZFJlcm91dGVBcnJvd1wiKTtcbnZhciBmaW5kTGFuZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHkxLCB5MiwgZGVwdGggPSAwKSA9PiB7XG4gIGNvbnN0IGNhbmRpZGF0ZSA9IHkxICsgTWF0aC5hYnMoeTEgLSB5MikgLyAyO1xuICBpZiAoZGVwdGggPiA1KSB7XG4gICAgcmV0dXJuIGNhbmRpZGF0ZTtcbiAgfVxuICBjb25zdCBvayA9IGxhbmVzLmV2ZXJ5KChsYW5lKSA9PiBNYXRoLmFicyhsYW5lIC0gY2FuZGlkYXRlKSA+PSAxMCk7XG4gIGlmIChvaykge1xuICAgIGxhbmVzLnB1c2goY2FuZGlkYXRlKTtcbiAgICByZXR1cm4gY2FuZGlkYXRlO1xuICB9XG4gIGNvbnN0IGRpZmYgPSBNYXRoLmFicyh5MSAtIHkyKTtcbiAgcmV0dXJuIGZpbmRMYW5lKHkxLCB5MiAtIGRpZmYgLyA1LCBkZXB0aCArIDEpO1xufSwgXCJmaW5kTGFuZVwiKTtcbnZhciBkcmF3QXJyb3cgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChzdmcsIGNvbW1pdEEsIGNvbW1pdEIsIGFsbENvbW1pdHMpID0+IHtcbiAgY29uc3QgeyB0aGVtZTogYXJyb3dUaGVtZSB9ID0gZ2V0Q29uZmlnMigpO1xuICBjb25zdCB1c2VDb2xvclRoZW1lID0gQ09MT1JfVEhFTUVTLmhhcyhhcnJvd1RoZW1lID8/IFwiXCIpO1xuICBjb25zdCBwMSA9IGNvbW1pdFBvcy5nZXQoY29tbWl0QS5pZCk7XG4gIGNvbnN0IHAyID0gY29tbWl0UG9zLmdldChjb21taXRCLmlkKTtcbiAgaWYgKHAxID09PSB2b2lkIDAgfHwgcDIgPT09IHZvaWQgMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ29tbWl0IHBvc2l0aW9ucyBub3QgZm91bmQgZm9yIGNvbW1pdHMgJHtjb21taXRBLmlkfSBhbmQgJHtjb21taXRCLmlkfWApO1xuICB9XG4gIGNvbnN0IGFycm93TmVlZHNSZXJvdXRpbmcgPSBzaG91bGRSZXJvdXRlQXJyb3coY29tbWl0QSwgY29tbWl0QiwgcDEsIHAyLCBhbGxDb21taXRzKTtcbiAgbGV0IGFyYyA9IFwiXCI7XG4gIGxldCBhcmMyID0gXCJcIjtcbiAgbGV0IHJhZGl1cyA9IDA7XG4gIGxldCBvZmZzZXQgPSAwO1xuICBsZXQgY29sb3JDbGFzc051bSA9IGJyYW5jaFBvcy5nZXQoY29tbWl0Qi5icmFuY2gpPy5pbmRleDtcbiAgaWYgKGNvbW1pdEIudHlwZSA9PT0gY29tbWl0VHlwZS5NRVJHRSAmJiBjb21taXRBLmlkICE9PSBjb21taXRCLnBhcmVudHNbMF0pIHtcbiAgICBjb2xvckNsYXNzTnVtID0gYnJhbmNoUG9zLmdldChjb21taXRBLmJyYW5jaCk/LmluZGV4O1xuICB9XG4gIGxldCBsaW5lRGVmO1xuICBpZiAoYXJyb3dOZWVkc1Jlcm91dGluZykge1xuICAgIGFyYyA9IFwiQSAxMCAxMCwgMCwgMCwgMCxcIjtcbiAgICBhcmMyID0gXCJBIDEwIDEwLCAwLCAwLCAxLFwiO1xuICAgIHJhZGl1cyA9IDEwO1xuICAgIG9mZnNldCA9IDEwO1xuICAgIGNvbnN0IGxpbmVZID0gcDEueSA8IHAyLnkgPyBmaW5kTGFuZShwMS55LCBwMi55KSA6IGZpbmRMYW5lKHAyLnksIHAxLnkpO1xuICAgIGNvbnN0IGxpbmVYID0gcDEueCA8IHAyLnggPyBmaW5kTGFuZShwMS54LCBwMi54KSA6IGZpbmRMYW5lKHAyLngsIHAxLngpO1xuICAgIGlmIChkaXIgPT09IFwiVEJcIikge1xuICAgICAgaWYgKHAxLnggPCBwMi54KSB7XG4gICAgICAgIGxpbmVEZWYgPSBgTSAke3AxLnh9ICR7cDEueX0gTCAke2xpbmVYIC0gcmFkaXVzfSAke3AxLnl9ICR7YXJjMn0gJHtsaW5lWH0gJHtwMS55ICsgb2Zmc2V0fSBMICR7bGluZVh9ICR7cDIueSAtIHJhZGl1c30gJHthcmN9ICR7bGluZVggKyBvZmZzZXR9ICR7cDIueX0gTCAke3AyLnh9ICR7cDIueX1gO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29sb3JDbGFzc051bSA9IGJyYW5jaFBvcy5nZXQoY29tbWl0QS5icmFuY2gpPy5pbmRleDtcbiAgICAgICAgbGluZURlZiA9IGBNICR7cDEueH0gJHtwMS55fSBMICR7bGluZVggKyByYWRpdXN9ICR7cDEueX0gJHthcmN9ICR7bGluZVh9ICR7cDEueSArIG9mZnNldH0gTCAke2xpbmVYfSAke3AyLnkgLSByYWRpdXN9ICR7YXJjMn0gJHtsaW5lWCAtIG9mZnNldH0gJHtwMi55fSBMICR7cDIueH0gJHtwMi55fWA7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChkaXIgPT09IFwiQlRcIikge1xuICAgICAgaWYgKHAxLnggPCBwMi54KSB7XG4gICAgICAgIGxpbmVEZWYgPSBgTSAke3AxLnh9ICR7cDEueX0gTCAke2xpbmVYIC0gcmFkaXVzfSAke3AxLnl9ICR7YXJjfSAke2xpbmVYfSAke3AxLnkgLSBvZmZzZXR9IEwgJHtsaW5lWH0gJHtwMi55ICsgcmFkaXVzfSAke2FyYzJ9ICR7bGluZVggKyBvZmZzZXR9ICR7cDIueX0gTCAke3AyLnh9ICR7cDIueX1gO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29sb3JDbGFzc051bSA9IGJyYW5jaFBvcy5nZXQoY29tbWl0QS5icmFuY2gpPy5pbmRleDtcbiAgICAgICAgbGluZURlZiA9IGBNICR7cDEueH0gJHtwMS55fSBMICR7bGluZVggKyByYWRpdXN9ICR7cDEueX0gJHthcmMyfSAke2xpbmVYfSAke3AxLnkgLSBvZmZzZXR9IEwgJHtsaW5lWH0gJHtwMi55ICsgcmFkaXVzfSAke2FyY30gJHtsaW5lWCAtIG9mZnNldH0gJHtwMi55fSBMICR7cDIueH0gJHtwMi55fWA7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChwMS55IDwgcDIueSkge1xuICAgICAgICBsaW5lRGVmID0gYE0gJHtwMS54fSAke3AxLnl9IEwgJHtwMS54fSAke2xpbmVZIC0gcmFkaXVzfSAke2FyY30gJHtwMS54ICsgb2Zmc2V0fSAke2xpbmVZfSBMICR7cDIueCAtIHJhZGl1c30gJHtsaW5lWX0gJHthcmMyfSAke3AyLnh9ICR7bGluZVkgKyBvZmZzZXR9IEwgJHtwMi54fSAke3AyLnl9YDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbG9yQ2xhc3NOdW0gPSBicmFuY2hQb3MuZ2V0KGNvbW1pdEEuYnJhbmNoKT8uaW5kZXg7XG4gICAgICAgIGxpbmVEZWYgPSBgTSAke3AxLnh9ICR7cDEueX0gTCAke3AxLnh9ICR7bGluZVkgKyByYWRpdXN9ICR7YXJjMn0gJHtwMS54ICsgb2Zmc2V0fSAke2xpbmVZfSBMICR7cDIueCAtIHJhZGl1c30gJHtsaW5lWX0gJHthcmN9ICR7cDIueH0gJHtsaW5lWSAtIG9mZnNldH0gTCAke3AyLnh9ICR7cDIueX1gO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBhcmMgPSBcIkEgMjAgMjAsIDAsIDAsIDAsXCI7XG4gICAgYXJjMiA9IFwiQSAyMCAyMCwgMCwgMCwgMSxcIjtcbiAgICByYWRpdXMgPSAyMDtcbiAgICBvZmZzZXQgPSAyMDtcbiAgICBpZiAoZGlyID09PSBcIlRCXCIpIHtcbiAgICAgIGlmIChwMS54IDwgcDIueCkge1xuICAgICAgICBpZiAoY29tbWl0Qi50eXBlID09PSBjb21taXRUeXBlLk1FUkdFICYmIGNvbW1pdEEuaWQgIT09IGNvbW1pdEIucGFyZW50c1swXSkge1xuICAgICAgICAgIGxpbmVEZWYgPSBgTSAke3AxLnh9ICR7cDEueX0gTCAke3AxLnh9ICR7cDIueSAtIHJhZGl1c30gJHthcmN9ICR7cDEueCArIG9mZnNldH0gJHtwMi55fSBMICR7cDIueH0gJHtwMi55fWA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGluZURlZiA9IGBNICR7cDEueH0gJHtwMS55fSBMICR7cDIueCAtIHJhZGl1c30gJHtwMS55fSAke2FyYzJ9ICR7cDIueH0gJHtwMS55ICsgb2Zmc2V0fSBMICR7cDIueH0gJHtwMi55fWA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChwMS54ID4gcDIueCkge1xuICAgICAgICBhcmMgPSBcIkEgMjAgMjAsIDAsIDAsIDAsXCI7XG4gICAgICAgIGFyYzIgPSBcIkEgMjAgMjAsIDAsIDAsIDEsXCI7XG4gICAgICAgIHJhZGl1cyA9IDIwO1xuICAgICAgICBvZmZzZXQgPSAyMDtcbiAgICAgICAgaWYgKGNvbW1pdEIudHlwZSA9PT0gY29tbWl0VHlwZS5NRVJHRSAmJiBjb21taXRBLmlkICE9PSBjb21taXRCLnBhcmVudHNbMF0pIHtcbiAgICAgICAgICBsaW5lRGVmID0gYE0gJHtwMS54fSAke3AxLnl9IEwgJHtwMS54fSAke3AyLnkgLSByYWRpdXN9ICR7YXJjMn0gJHtwMS54IC0gb2Zmc2V0fSAke3AyLnl9IEwgJHtwMi54fSAke3AyLnl9YDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaW5lRGVmID0gYE0gJHtwMS54fSAke3AxLnl9IEwgJHtwMi54ICsgcmFkaXVzfSAke3AxLnl9ICR7YXJjfSAke3AyLnh9ICR7cDEueSArIG9mZnNldH0gTCAke3AyLnh9ICR7cDIueX1gO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocDEueCA9PT0gcDIueCkge1xuICAgICAgICBsaW5lRGVmID0gYE0gJHtwMS54fSAke3AxLnl9IEwgJHtwMi54fSAke3AyLnl9YDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGRpciA9PT0gXCJCVFwiKSB7XG4gICAgICBpZiAocDEueCA8IHAyLngpIHtcbiAgICAgICAgaWYgKGNvbW1pdEIudHlwZSA9PT0gY29tbWl0VHlwZS5NRVJHRSAmJiBjb21taXRBLmlkICE9PSBjb21taXRCLnBhcmVudHNbMF0pIHtcbiAgICAgICAgICBsaW5lRGVmID0gYE0gJHtwMS54fSAke3AxLnl9IEwgJHtwMS54fSAke3AyLnkgKyByYWRpdXN9ICR7YXJjMn0gJHtwMS54ICsgb2Zmc2V0fSAke3AyLnl9IEwgJHtwMi54fSAke3AyLnl9YDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaW5lRGVmID0gYE0gJHtwMS54fSAke3AxLnl9IEwgJHtwMi54IC0gcmFkaXVzfSAke3AxLnl9ICR7YXJjfSAke3AyLnh9ICR7cDEueSAtIG9mZnNldH0gTCAke3AyLnh9ICR7cDIueX1gO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAocDEueCA+IHAyLngpIHtcbiAgICAgICAgYXJjID0gXCJBIDIwIDIwLCAwLCAwLCAwLFwiO1xuICAgICAgICBhcmMyID0gXCJBIDIwIDIwLCAwLCAwLCAxLFwiO1xuICAgICAgICByYWRpdXMgPSAyMDtcbiAgICAgICAgb2Zmc2V0ID0gMjA7XG4gICAgICAgIGlmIChjb21taXRCLnR5cGUgPT09IGNvbW1pdFR5cGUuTUVSR0UgJiYgY29tbWl0QS5pZCAhPT0gY29tbWl0Qi5wYXJlbnRzWzBdKSB7XG4gICAgICAgICAgbGluZURlZiA9IGBNICR7cDEueH0gJHtwMS55fSBMICR7cDEueH0gJHtwMi55ICsgcmFkaXVzfSAke2FyY30gJHtwMS54IC0gb2Zmc2V0fSAke3AyLnl9IEwgJHtwMi54fSAke3AyLnl9YDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaW5lRGVmID0gYE0gJHtwMS54fSAke3AxLnl9IEwgJHtwMi54ICsgcmFkaXVzfSAke3AxLnl9ICR7YXJjMn0gJHtwMi54fSAke3AxLnkgLSBvZmZzZXR9IEwgJHtwMi54fSAke3AyLnl9YDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHAxLnggPT09IHAyLngpIHtcbiAgICAgICAgbGluZURlZiA9IGBNICR7cDEueH0gJHtwMS55fSBMICR7cDIueH0gJHtwMi55fWA7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChwMS55IDwgcDIueSkge1xuICAgICAgICBpZiAoY29tbWl0Qi50eXBlID09PSBjb21taXRUeXBlLk1FUkdFICYmIGNvbW1pdEEuaWQgIT09IGNvbW1pdEIucGFyZW50c1swXSkge1xuICAgICAgICAgIGxpbmVEZWYgPSBgTSAke3AxLnh9ICR7cDEueX0gTCAke3AyLnggLSByYWRpdXN9ICR7cDEueX0gJHthcmMyfSAke3AyLnh9ICR7cDEueSArIG9mZnNldH0gTCAke3AyLnh9ICR7cDIueX1gO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxpbmVEZWYgPSBgTSAke3AxLnh9ICR7cDEueX0gTCAke3AxLnh9ICR7cDIueSAtIHJhZGl1c30gJHthcmN9ICR7cDEueCArIG9mZnNldH0gJHtwMi55fSBMICR7cDIueH0gJHtwMi55fWA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChwMS55ID4gcDIueSkge1xuICAgICAgICBpZiAoY29tbWl0Qi50eXBlID09PSBjb21taXRUeXBlLk1FUkdFICYmIGNvbW1pdEEuaWQgIT09IGNvbW1pdEIucGFyZW50c1swXSkge1xuICAgICAgICAgIGxpbmVEZWYgPSBgTSAke3AxLnh9ICR7cDEueX0gTCAke3AyLnggLSByYWRpdXN9ICR7cDEueX0gJHthcmN9ICR7cDIueH0gJHtwMS55IC0gb2Zmc2V0fSBMICR7cDIueH0gJHtwMi55fWA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGluZURlZiA9IGBNICR7cDEueH0gJHtwMS55fSBMICR7cDEueH0gJHtwMi55ICsgcmFkaXVzfSAke2FyYzJ9ICR7cDEueCArIG9mZnNldH0gJHtwMi55fSBMICR7cDIueH0gJHtwMi55fWA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChwMS55ID09PSBwMi55KSB7XG4gICAgICAgIGxpbmVEZWYgPSBgTSAke3AxLnh9ICR7cDEueX0gTCAke3AyLnh9ICR7cDIueX1gO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAobGluZURlZiA9PT0gdm9pZCAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTGluZSBkZWZpbml0aW9uIG5vdCBmb3VuZFwiKTtcbiAgfVxuICBzdmcuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBsaW5lRGVmKS5hdHRyKFxuICAgIFwiY2xhc3NcIixcbiAgICBcImFycm93IGFycm93XCIgKyBjYWxjQ29sb3JJbmRleChjb2xvckNsYXNzTnVtLCBUSEVNRV9DT0xPUl9MSU1JVCwgdXNlQ29sb3JUaGVtZSlcbiAgKTtcbn0sIFwiZHJhd0Fycm93XCIpO1xudmFyIGRyYXdBcnJvd3MgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChzdmcsIGNvbW1pdHMpID0+IHtcbiAgY29uc3QgZ0Fycm93cyA9IHN2Zy5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImNvbW1pdC1hcnJvd3NcIik7XG4gIFsuLi5jb21taXRzLmtleXMoKV0uZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgY29uc3QgY29tbWl0MiA9IGNvbW1pdHMuZ2V0KGtleSk7XG4gICAgaWYgKGNvbW1pdDIucGFyZW50cyAmJiBjb21taXQyLnBhcmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgY29tbWl0Mi5wYXJlbnRzLmZvckVhY2goKHBhcmVudCkgPT4ge1xuICAgICAgICBkcmF3QXJyb3coZ0Fycm93cywgY29tbWl0cy5nZXQocGFyZW50KSwgY29tbWl0MiwgY29tbWl0cyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufSwgXCJkcmF3QXJyb3dzXCIpO1xudmFyIGRyYXdCcmFuY2hlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHN2ZywgYnJhbmNoZXMsIGdpdEdyYXBoQ29uZmlnLCBpZCkgPT4ge1xuICBjb25zdCB7IGxvb2ssIHRoZW1lLCB0aGVtZVZhcmlhYmxlcyB9ID0gZ2V0Q29uZmlnMigpO1xuICBjb25zdCB7IGRyb3BTaGFkb3csIFRIRU1FX0NPTE9SX0xJTUlUOiB0aGVtZUNvbG9yTGltaXQgfSA9IHRoZW1lVmFyaWFibGVzO1xuICBjb25zdCB1c2VSZWR1eEdlb21ldHJ5ID0gUkVEVVhfR0VPTUVUUllfVEhFTUVTLmhhcyh0aGVtZSA/PyBcIlwiKTtcbiAgY29uc3QgdXNlQ29sb3JUaGVtZSA9IENPTE9SX1RIRU1FUy5oYXModGhlbWUgPz8gXCJcIik7XG4gIGNvbnN0IGcgPSBzdmcuYXBwZW5kKFwiZ1wiKTtcbiAgYnJhbmNoZXMuZm9yRWFjaCgoYnJhbmNoMiwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBhZGp1c3RJbmRleEZvclRoZW1lID0gY2FsY0NvbG9ySW5kZXgoXG4gICAgICBpbmRleCxcbiAgICAgIHVzZVJlZHV4R2VvbWV0cnkgPyB0aGVtZUNvbG9yTGltaXQgOiBUSEVNRV9DT0xPUl9MSU1JVCxcbiAgICAgIHVzZUNvbG9yVGhlbWVcbiAgICApO1xuICAgIGNvbnN0IHBvcyA9IGJyYW5jaFBvcy5nZXQoYnJhbmNoMi5uYW1lKT8ucG9zO1xuICAgIGlmIChwb3MgPT09IHZvaWQgMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBQb3NpdGlvbiBub3QgZm91bmQgZm9yIGJyYW5jaCAke2JyYW5jaDIubmFtZX1gKTtcbiAgICB9XG4gICAgY29uc3Qgc3BpbmVZID0gZGlyID09PSBcIlRCXCIgfHwgZGlyID09PSBcIkJUXCIgPyBwb3MgOiB1c2VSZWR1eEdlb21ldHJ5ID8gcG9zICsgUkVEVVhfQlJBTkNIX0xBQkVMX1BBRERJTkdfWSAvIDIgKyAxIDogcG9zIC0gMjtcbiAgICBjb25zdCBsaW5lID0gZy5hcHBlbmQoXCJsaW5lXCIpO1xuICAgIGxpbmUuYXR0cihcIngxXCIsIDApO1xuICAgIGxpbmUuYXR0cihcInkxXCIsIHNwaW5lWSk7XG4gICAgbGluZS5hdHRyKFwieDJcIiwgbWF4UG9zKTtcbiAgICBsaW5lLmF0dHIoXCJ5MlwiLCBzcGluZVkpO1xuICAgIGxpbmUuYXR0cihcImNsYXNzXCIsIFwiYnJhbmNoIGJyYW5jaFwiICsgYWRqdXN0SW5kZXhGb3JUaGVtZSk7XG4gICAgaWYgKGRpciA9PT0gXCJUQlwiKSB7XG4gICAgICBsaW5lLmF0dHIoXCJ5MVwiLCBkZWZhdWx0UG9zKTtcbiAgICAgIGxpbmUuYXR0cihcIngxXCIsIHBvcyk7XG4gICAgICBsaW5lLmF0dHIoXCJ5MlwiLCBtYXhQb3MpO1xuICAgICAgbGluZS5hdHRyKFwieDJcIiwgcG9zKTtcbiAgICB9IGVsc2UgaWYgKGRpciA9PT0gXCJCVFwiKSB7XG4gICAgICBsaW5lLmF0dHIoXCJ5MVwiLCBtYXhQb3MpO1xuICAgICAgbGluZS5hdHRyKFwieDFcIiwgcG9zKTtcbiAgICAgIGxpbmUuYXR0cihcInkyXCIsIGRlZmF1bHRQb3MpO1xuICAgICAgbGluZS5hdHRyKFwieDJcIiwgcG9zKTtcbiAgICB9XG4gICAgbGFuZXMucHVzaChzcGluZVkpO1xuICAgIGNvbnN0IG5hbWUgPSBicmFuY2gyLm5hbWU7XG4gICAgY29uc3QgbGFiZWxFbGVtZW50ID0gZHJhd1RleHQobmFtZSk7XG4gICAgY29uc3QgYmtnID0gZy5pbnNlcnQoXCJyZWN0XCIpO1xuICAgIGNvbnN0IGJyYW5jaExhYmVsID0gZy5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImJyYW5jaExhYmVsXCIpO1xuICAgIGNvbnN0IGxhYmVsID0gYnJhbmNoTGFiZWwuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJsYWJlbCBicmFuY2gtbGFiZWxcIiArIGFkanVzdEluZGV4Rm9yVGhlbWUpO1xuICAgIGxhYmVsLm5vZGUoKS5hcHBlbmRDaGlsZChsYWJlbEVsZW1lbnQpO1xuICAgIGNvbnN0IGJib3ggPSBsYWJlbEVsZW1lbnQuZ2V0QkJveCgpO1xuICAgIGNvbnN0IGJvcmRlclJhZGl1cyA9IHVzZVJlZHV4R2VvbWV0cnkgPyAwIDogNDtcbiAgICBjb25zdCBsYWJlbFBhZGRpbmdYID0gdXNlUmVkdXhHZW9tZXRyeSA/IDE2IDogMDtcbiAgICBjb25zdCBsYWJlbFBhZGRpbmdZID0gdXNlUmVkdXhHZW9tZXRyeSA/IFJFRFVYX0JSQU5DSF9MQUJFTF9QQURESU5HX1kgOiAwO1xuICAgIGlmIChsb29rID09PSBcIm5lb1wiKSB7XG4gICAgICBia2cuYXR0cihcImRhdGEtbG9va1wiLCBgbmVvYCk7XG4gICAgfVxuICAgIGJrZy5hdHRyKFwiY2xhc3NcIiwgXCJicmFuY2hMYWJlbEJrZyBsYWJlbFwiICsgYWRqdXN0SW5kZXhGb3JUaGVtZSkuYXR0cihcbiAgICAgIFwic3R5bGVcIixcbiAgICAgIGxvb2sgPT09IFwibmVvXCIgPyBgZmlsdGVyOiR7dXNlUmVkdXhHZW9tZXRyeSA/IGB1cmwoIyR7aWR9LWRyb3Atc2hhZG93KWAgOiBkcm9wU2hhZG93fWAgOiBcIlwiXG4gICAgKS5hdHRyKFwicnhcIiwgYm9yZGVyUmFkaXVzKS5hdHRyKFwicnlcIiwgYm9yZGVyUmFkaXVzKS5hdHRyKFwieFwiLCAtYmJveC53aWR0aCAtIDQgLSAoZ2l0R3JhcGhDb25maWcucm90YXRlQ29tbWl0TGFiZWwgPT09IHRydWUgPyAzMCA6IDApKS5hdHRyKFwieVwiLCAtYmJveC5oZWlnaHQgLyAyICsgMTApLmF0dHIoXCJ3aWR0aFwiLCBiYm94LndpZHRoICsgMTggKyBsYWJlbFBhZGRpbmdYKS5hdHRyKFwiaGVpZ2h0XCIsIGJib3guaGVpZ2h0ICsgNCArIGxhYmVsUGFkZGluZ1kpO1xuICAgIGxhYmVsLmF0dHIoXG4gICAgICBcInRyYW5zZm9ybVwiLFxuICAgICAgXCJ0cmFuc2xhdGUoXCIgKyAoLWJib3gud2lkdGggLSAxNCAtIChnaXRHcmFwaENvbmZpZy5yb3RhdGVDb21taXRMYWJlbCA9PT0gdHJ1ZSA/IDMwIDogMCkgKyBsYWJlbFBhZGRpbmdYIC8gMikgKyBcIiwgXCIgKyAoc3BpbmVZIC0gYmJveC5oZWlnaHQgLyAyIC0gMikgKyBcIilcIlxuICAgICk7XG4gICAgaWYgKGRpciA9PT0gXCJUQlwiKSB7XG4gICAgICBia2cuYXR0cihcInhcIiwgcG9zIC0gYmJveC53aWR0aCAvIDIgLSAxMCkuYXR0cihcInlcIiwgMCk7XG4gICAgICBsYWJlbC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgKHBvcyAtIGJib3gud2lkdGggLyAyIC0gNSkgKyBcIiwgMClcIik7XG4gICAgICBpZiAodXNlUmVkdXhHZW9tZXRyeSkge1xuICAgICAgICBia2cuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7LWxhYmVsUGFkZGluZ1ggLyAyIC0gM30sICR7LWxhYmVsUGFkZGluZ1kgLSAxMH0pYCk7XG4gICAgICAgIGxhYmVsLmF0dHIoXG4gICAgICAgICAgXCJ0cmFuc2Zvcm1cIixcbiAgICAgICAgICBcInRyYW5zbGF0ZShcIiArIChwb3MgLSBiYm94LndpZHRoIC8gMiAtIDUpICsgXCIsIFwiICsgKC1sYWJlbFBhZGRpbmdZICogMiArIDcpICsgXCIpXCJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGRpciA9PT0gXCJCVFwiKSB7XG4gICAgICBia2cuYXR0cihcInhcIiwgcG9zIC0gYmJveC53aWR0aCAvIDIgLSAxMCkuYXR0cihcInlcIiwgbWF4UG9zKTtcbiAgICAgIGxhYmVsLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyAocG9zIC0gYmJveC53aWR0aCAvIDIgLSA1KSArIFwiLCBcIiArIG1heFBvcyArIFwiKVwiKTtcbiAgICAgIGlmICh1c2VSZWR1eEdlb21ldHJ5KSB7XG4gICAgICAgIGJrZy5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHstbGFiZWxQYWRkaW5nWCAvIDIgLSAzfSwgJHtsYWJlbFBhZGRpbmdZICsgMTB9KWApO1xuICAgICAgICBsYWJlbC5hdHRyKFxuICAgICAgICAgIFwidHJhbnNmb3JtXCIsXG4gICAgICAgICAgXCJ0cmFuc2xhdGUoXCIgKyAocG9zIC0gYmJveC53aWR0aCAvIDIgLSA1KSArIFwiLCBcIiArIChtYXhQb3MgKyBsYWJlbFBhZGRpbmdZICogMiArIDQpICsgXCIpXCJcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYmtnLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoLTE5LCBcIiArIChzcGluZVkgLSAxMiAtIGxhYmVsUGFkZGluZ1kgLyAyKSArIFwiKVwiKTtcbiAgICB9XG4gIH0pO1xufSwgXCJkcmF3QnJhbmNoZXNcIik7XG52YXIgc2V0QnJhbmNoUG9zaXRpb24gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKG5hbWUsIHBvcywgaW5kZXgsIGJib3gsIHJvdGF0ZUNvbW1pdExhYmVsKSB7XG4gIGJyYW5jaFBvcy5zZXQobmFtZSwgeyBwb3MsIGluZGV4IH0pO1xuICBwb3MgKz0gNTAgKyAocm90YXRlQ29tbWl0TGFiZWwgPyA0MCA6IDApICsgKGRpciA9PT0gXCJUQlwiIHx8IGRpciA9PT0gXCJCVFwiID8gYmJveC53aWR0aCAvIDIgOiAwKTtcbiAgcmV0dXJuIHBvcztcbn0sIFwic2V0QnJhbmNoUG9zaXRpb25cIik7XG52YXIgZHJhdyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24odHh0LCBpZCwgdmVyLCBkaWFnT2JqKSB7XG4gIGNsZWFyMygpO1xuICBsb2cuZGVidWcoXCJpbiBnaXRncmFwaCByZW5kZXJlclwiLCB0eHQgKyBcIlxcblwiLCBcImlkOlwiLCBpZCwgdmVyKTtcbiAgY29uc3QgZGIyID0gZGlhZ09iai5kYjtcbiAgaWYgKCFkYjIuZ2V0Q29uZmlnKSB7XG4gICAgbG9nLmVycm9yKFwiZ2V0Q29uZmlnIG1ldGhvZCBpcyBub3QgYXZhaWxhYmxlIG9uIGRiXCIpO1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBnaXRHcmFwaENvbmZpZyA9IGRiMi5nZXRDb25maWcoKTtcbiAgY29uc3Qgcm90YXRlQ29tbWl0TGFiZWwgPSBnaXRHcmFwaENvbmZpZy5yb3RhdGVDb21taXRMYWJlbCA/PyBmYWxzZTtcbiAgYWxsQ29tbWl0c0RpY3QgPSBkYjIuZ2V0Q29tbWl0cygpO1xuICBjb25zdCBicmFuY2hlcyA9IGRiMi5nZXRCcmFuY2hlc0FzT2JqQXJyYXkoKTtcbiAgZGlyID0gZGIyLmdldERpcmVjdGlvbigpO1xuICBjb25zdCBkaWFncmFtMiA9IHNlbGVjdChgW2lkPVwiJHtpZH1cIl1gKTtcbiAgY29uc3QgeyBsb29rLCB0aGVtZSwgdGhlbWVWYXJpYWJsZXMgfSA9IGdldENvbmZpZzIoKTtcbiAgY29uc3QgeyB1c2VHcmFkaWVudCwgZ3JhZGllbnRTdGFydCwgZ3JhZGllbnRTdG9wLCBmaWx0ZXJDb2xvciB9ID0gdGhlbWVWYXJpYWJsZXM7XG4gIGlmICh1c2VHcmFkaWVudCkge1xuICAgIGNvbnN0IGdyYWRpZW50ID0gZGlhZ3JhbTIuYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJsaW5lYXJHcmFkaWVudFwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIi1ncmFkaWVudFwiKS5hdHRyKFwiZ3JhZGllbnRVbml0c1wiLCBcIm9iamVjdEJvdW5kaW5nQm94XCIpLmF0dHIoXCJ4MVwiLCBcIjAlXCIpLmF0dHIoXCJ5MVwiLCBcIjAlXCIpLmF0dHIoXCJ4MlwiLCBcIjEwMCVcIikuYXR0cihcInkyXCIsIFwiMCVcIik7XG4gICAgZ3JhZGllbnQuYXBwZW5kKFwic3RvcFwiKS5hdHRyKFwib2Zmc2V0XCIsIFwiMCVcIikuYXR0cihcInN0b3AtY29sb3JcIiwgZ3JhZGllbnRTdGFydCkuYXR0cihcInN0b3Atb3BhY2l0eVwiLCAxKTtcbiAgICBncmFkaWVudC5hcHBlbmQoXCJzdG9wXCIpLmF0dHIoXCJvZmZzZXRcIiwgXCIxMDAlXCIpLmF0dHIoXCJzdG9wLWNvbG9yXCIsIGdyYWRpZW50U3RvcCkuYXR0cihcInN0b3Atb3BhY2l0eVwiLCAxKTtcbiAgfVxuICBpZiAobG9vayA9PT0gXCJuZW9cIiAmJiBSRURVWF9HRU9NRVRSWV9USEVNRVMuaGFzKHRoZW1lID8/IFwiXCIpKSB7XG4gICAgZGlhZ3JhbTIuYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJmaWx0ZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCItZHJvcC1zaGFkb3dcIikuYXR0cihcImhlaWdodFwiLCBcIjEzMCVcIikuYXR0cihcIndpZHRoXCIsIFwiMTMwJVwiKS5hcHBlbmQoXCJmZURyb3BTaGFkb3dcIikuYXR0cihcImR4XCIsIFwiNFwiKS5hdHRyKFwiZHlcIiwgXCI0XCIpLmF0dHIoXCJzdGREZXZpYXRpb25cIiwgMCkuYXR0cihcImZsb29kLW9wYWNpdHlcIiwgXCIwLjA2XCIpLmF0dHIoXCJmbG9vZC1jb2xvclwiLCBmaWx0ZXJDb2xvcik7XG4gIH1cbiAgbGV0IHBvcyA9IDA7XG4gIGJyYW5jaGVzLmZvckVhY2goKGJyYW5jaDIsIGluZGV4KSA9PiB7XG4gICAgY29uc3QgbGFiZWxFbGVtZW50ID0gZHJhd1RleHQoYnJhbmNoMi5uYW1lKTtcbiAgICBjb25zdCBnID0gZGlhZ3JhbTIuYXBwZW5kKFwiZ1wiKTtcbiAgICBjb25zdCBicmFuY2hMYWJlbCA9IGcuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJicmFuY2hMYWJlbFwiKTtcbiAgICBjb25zdCBsYWJlbCA9IGJyYW5jaExhYmVsLmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIFwibGFiZWwgYnJhbmNoLWxhYmVsXCIpO1xuICAgIGxhYmVsLm5vZGUoKT8uYXBwZW5kQ2hpbGQobGFiZWxFbGVtZW50KTtcbiAgICBjb25zdCBiYm94ID0gbGFiZWxFbGVtZW50LmdldEJCb3goKTtcbiAgICBwb3MgPSBzZXRCcmFuY2hQb3NpdGlvbihicmFuY2gyLm5hbWUsIHBvcywgaW5kZXgsIGJib3gsIHJvdGF0ZUNvbW1pdExhYmVsKTtcbiAgICBsYWJlbC5yZW1vdmUoKTtcbiAgICBicmFuY2hMYWJlbC5yZW1vdmUoKTtcbiAgICBnLnJlbW92ZSgpO1xuICB9KTtcbiAgZHJhd0NvbW1pdHMoZGlhZ3JhbTIsIGFsbENvbW1pdHNEaWN0LCBmYWxzZSwgZ2l0R3JhcGhDb25maWcpO1xuICBpZiAoZ2l0R3JhcGhDb25maWcuc2hvd0JyYW5jaGVzKSB7XG4gICAgZHJhd0JyYW5jaGVzKGRpYWdyYW0yLCBicmFuY2hlcywgZ2l0R3JhcGhDb25maWcsIGlkKTtcbiAgfVxuICBkcmF3QXJyb3dzKGRpYWdyYW0yLCBhbGxDb21taXRzRGljdCk7XG4gIGRyYXdDb21taXRzKGRpYWdyYW0yLCBhbGxDb21taXRzRGljdCwgdHJ1ZSwgZ2l0R3JhcGhDb25maWcpO1xuICB1dGlsc19kZWZhdWx0Lmluc2VydFRpdGxlKFxuICAgIGRpYWdyYW0yLFxuICAgIFwiZ2l0VGl0bGVUZXh0XCIsXG4gICAgZ2l0R3JhcGhDb25maWcudGl0bGVUb3BNYXJnaW4gPz8gMCxcbiAgICBkYjIuZ2V0RGlhZ3JhbVRpdGxlKClcbiAgKTtcbiAgc2V0dXBHcmFwaFZpZXdib3godm9pZCAwLCBkaWFncmFtMiwgZ2l0R3JhcGhDb25maWcuZGlhZ3JhbVBhZGRpbmcsIGdpdEdyYXBoQ29uZmlnLnVzZU1heFdpZHRoKTtcbn0sIFwiZHJhd1wiKTtcbnZhciBnaXRHcmFwaFJlbmRlcmVyX2RlZmF1bHQgPSB7XG4gIGRyYXdcbn07XG5pZiAodm9pZCAwKSB7XG4gIGNvbnN0IHsgaXQsIGV4cGVjdCwgZGVzY3JpYmUgfSA9IHZvaWQgMDtcbiAgZGVzY3JpYmUoXCJkcmF3VGV4dFwiLCAoKSA9PiB7XG4gICAgaXQoXCJzaG91bGQgZHJhd1RleHRcIiwgKCkgPT4ge1xuICAgICAgY29uc3Qgc3ZnTGFiZWwgPSBkcmF3VGV4dChcIm1haW5cIik7XG4gICAgICBleHBlY3Qoc3ZnTGFiZWwpLnRvQmVEZWZpbmVkKCk7XG4gICAgICBleHBlY3Qoc3ZnTGFiZWwuY2hpbGRyZW5bMF0uaW5uZXJIVE1MKS50b0JlKFwibWFpblwiKTtcbiAgICB9KTtcbiAgfSk7XG4gIGRlc2NyaWJlKFwiYnJhbmNoUG9zaXRpb25cIiwgKCkgPT4ge1xuICAgIGNvbnN0IGJib3ggPSB7XG4gICAgICB4OiAwLFxuICAgICAgeTogMCxcbiAgICAgIHdpZHRoOiAxMCxcbiAgICAgIGhlaWdodDogMTAsXG4gICAgICB0b3A6IDAsXG4gICAgICByaWdodDogMCxcbiAgICAgIGJvdHRvbTogMCxcbiAgICAgIGxlZnQ6IDAsXG4gICAgICB0b0pTT046IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKCkgPT4gXCJcIiwgXCJ0b0pTT05cIilcbiAgICB9O1xuICAgIGl0KFwic2hvdWxkIHNldEJyYW5jaFBvc2l0aW9ucyBMUiB3aXRoIHR3byBicmFuY2hlc1wiLCAoKSA9PiB7XG4gICAgICBkaXIgPSBcIkxSXCI7XG4gICAgICBjb25zdCBwb3MgPSBzZXRCcmFuY2hQb3NpdGlvbihcIm1haW5cIiwgMCwgMCwgYmJveCwgdHJ1ZSk7XG4gICAgICBleHBlY3QocG9zKS50b0JlKDkwKTtcbiAgICAgIGV4cGVjdChicmFuY2hQb3MuZ2V0KFwibWFpblwiKSkudG9FcXVhbCh7IHBvczogMCwgaW5kZXg6IDAgfSk7XG4gICAgICBjb25zdCBwb3NOZXh0ID0gc2V0QnJhbmNoUG9zaXRpb24oXCJkZXZlbG9wXCIsIHBvcywgMSwgYmJveCwgdHJ1ZSk7XG4gICAgICBleHBlY3QocG9zTmV4dCkudG9CZSgxODApO1xuICAgICAgZXhwZWN0KGJyYW5jaFBvcy5nZXQoXCJkZXZlbG9wXCIpKS50b0VxdWFsKHsgcG9zLCBpbmRleDogMSB9KTtcbiAgICB9KTtcbiAgICBpdChcInNob3VsZCBzZXRCcmFuY2hQb3NpdGlvbnMgVEIgd2l0aCB0d28gYnJhbmNoZXNcIiwgKCkgPT4ge1xuICAgICAgZGlyID0gXCJUQlwiO1xuICAgICAgYmJveC53aWR0aCA9IDM0Ljk5MjE4NzU7XG4gICAgICBjb25zdCBwb3MgPSBzZXRCcmFuY2hQb3NpdGlvbihcIm1haW5cIiwgMCwgMCwgYmJveCwgdHJ1ZSk7XG4gICAgICBleHBlY3QocG9zKS50b0JlKDEwNy40OTYwOTM3NSk7XG4gICAgICBleHBlY3QoYnJhbmNoUG9zLmdldChcIm1haW5cIikpLnRvRXF1YWwoeyBwb3M6IDAsIGluZGV4OiAwIH0pO1xuICAgICAgYmJveC53aWR0aCA9IDU2LjQyMTg3NTtcbiAgICAgIGNvbnN0IHBvc05leHQgPSBzZXRCcmFuY2hQb3NpdGlvbihcImRldmVsb3BcIiwgcG9zLCAxLCBiYm94LCB0cnVlKTtcbiAgICAgIGV4cGVjdChwb3NOZXh0KS50b0JlKDIyNS43MDcwMzEyNSk7XG4gICAgICBleHBlY3QoYnJhbmNoUG9zLmdldChcImRldmVsb3BcIikpLnRvRXF1YWwoeyBwb3MsIGluZGV4OiAxIH0pO1xuICAgIH0pO1xuICB9KTtcbiAgZGVzY3JpYmUoXCJjb21taXRQb3NpdGlvblwiLCAoKSA9PiB7XG4gICAgY29uc3QgY29tbWl0cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKFtcbiAgICAgIFtcbiAgICAgICAgXCJjb21taXRaZXJvXCIsXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogXCJaRVJPXCIsXG4gICAgICAgICAgbWVzc2FnZTogXCJcIixcbiAgICAgICAgICBzZXE6IDAsXG4gICAgICAgICAgdHlwZTogY29tbWl0VHlwZS5OT1JNQUwsXG4gICAgICAgICAgdGFnczogW10sXG4gICAgICAgICAgcGFyZW50czogW10sXG4gICAgICAgICAgYnJhbmNoOiBcIm1haW5cIlxuICAgICAgICB9XG4gICAgICBdLFxuICAgICAgW1xuICAgICAgICBcImNvbW1pdEFcIixcbiAgICAgICAge1xuICAgICAgICAgIGlkOiBcIkFcIixcbiAgICAgICAgICBtZXNzYWdlOiBcIlwiLFxuICAgICAgICAgIHNlcTogMSxcbiAgICAgICAgICB0eXBlOiBjb21taXRUeXBlLk5PUk1BTCxcbiAgICAgICAgICB0YWdzOiBbXSxcbiAgICAgICAgICBwYXJlbnRzOiBbXCJaRVJPXCJdLFxuICAgICAgICAgIGJyYW5jaDogXCJmZWF0dXJlXCJcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgXCJjb21taXRCXCIsXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogXCJCXCIsXG4gICAgICAgICAgbWVzc2FnZTogXCJcIixcbiAgICAgICAgICBzZXE6IDIsXG4gICAgICAgICAgdHlwZTogY29tbWl0VHlwZS5OT1JNQUwsXG4gICAgICAgICAgdGFnczogW10sXG4gICAgICAgICAgcGFyZW50czogW1wiQVwiXSxcbiAgICAgICAgICBicmFuY2g6IFwiZmVhdHVyZVwiXG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIFwiY29tbWl0TVwiLFxuICAgICAgICB7XG4gICAgICAgICAgaWQ6IFwiTVwiLFxuICAgICAgICAgIG1lc3NhZ2U6IFwibWVyZ2VkIGJyYW5jaCBmZWF0dXJlIGludG8gbWFpblwiLFxuICAgICAgICAgIHNlcTogMyxcbiAgICAgICAgICB0eXBlOiBjb21taXRUeXBlLk1FUkdFLFxuICAgICAgICAgIHRhZ3M6IFtdLFxuICAgICAgICAgIHBhcmVudHM6IFtcIlpFUk9cIiwgXCJCXCJdLFxuICAgICAgICAgIGJyYW5jaDogXCJtYWluXCIsXG4gICAgICAgICAgY3VzdG9tSWQ6IHRydWVcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgXCJjb21taXRDXCIsXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogXCJDXCIsXG4gICAgICAgICAgbWVzc2FnZTogXCJcIixcbiAgICAgICAgICBzZXE6IDQsXG4gICAgICAgICAgdHlwZTogY29tbWl0VHlwZS5OT1JNQUwsXG4gICAgICAgICAgdGFnczogW10sXG4gICAgICAgICAgcGFyZW50czogW1wiWkVST1wiXSxcbiAgICAgICAgICBicmFuY2g6IFwicmVsZWFzZVwiXG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBbXG4gICAgICAgIFwiY29tbWl0NV84OTI4ZWEwXCIsXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogXCI1LTg5MjhlYTBcIixcbiAgICAgICAgICBtZXNzYWdlOiBcImNoZXJyeS1waWNrZWQgW29iamVjdCBPYmplY3RdIGludG8gcmVsZWFzZVwiLFxuICAgICAgICAgIHNlcTogNSxcbiAgICAgICAgICB0eXBlOiBjb21taXRUeXBlLkNIRVJSWV9QSUNLLFxuICAgICAgICAgIHRhZ3M6IFtdLFxuICAgICAgICAgIHBhcmVudHM6IFtcIkNcIiwgXCJNXCJdLFxuICAgICAgICAgIGJyYW5jaDogXCJyZWxlYXNlXCJcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgXCJjb21taXREXCIsXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogXCJEXCIsXG4gICAgICAgICAgbWVzc2FnZTogXCJcIixcbiAgICAgICAgICBzZXE6IDYsXG4gICAgICAgICAgdHlwZTogY29tbWl0VHlwZS5OT1JNQUwsXG4gICAgICAgICAgdGFnczogW10sXG4gICAgICAgICAgcGFyZW50czogW1wiNS04OTI4ZWEwXCJdLFxuICAgICAgICAgIGJyYW5jaDogXCJyZWxlYXNlXCJcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgXCJjb21taXQ3X2VkODQ4YmFcIixcbiAgICAgICAge1xuICAgICAgICAgIGlkOiBcIjctZWQ4NDhiYVwiLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiY2hlcnJ5LXBpY2tlZCBbb2JqZWN0IE9iamVjdF0gaW50byByZWxlYXNlXCIsXG4gICAgICAgICAgc2VxOiA3LFxuICAgICAgICAgIHR5cGU6IGNvbW1pdFR5cGUuQ0hFUlJZX1BJQ0ssXG4gICAgICAgICAgdGFnczogW10sXG4gICAgICAgICAgcGFyZW50czogW1wiRFwiLCBcIk1cIl0sXG4gICAgICAgICAgYnJhbmNoOiBcInJlbGVhc2VcIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgXSk7XG4gICAgbGV0IHBvcyA9IDA7XG4gICAgYnJhbmNoUG9zLnNldChcIm1haW5cIiwgeyBwb3M6IDAsIGluZGV4OiAwIH0pO1xuICAgIGJyYW5jaFBvcy5zZXQoXCJmZWF0dXJlXCIsIHsgcG9zOiAxMDcuNDk2MDkzNzUsIGluZGV4OiAxIH0pO1xuICAgIGJyYW5jaFBvcy5zZXQoXCJyZWxlYXNlXCIsIHsgcG9zOiAyMjQuMDM1MTU2MjUsIGluZGV4OiAyIH0pO1xuICAgIGRlc2NyaWJlKFwiVEJcIiwgKCkgPT4ge1xuICAgICAgcG9zID0gMzA7XG4gICAgICBkaXIgPSBcIlRCXCI7XG4gICAgICBjb25zdCBleHBlY3RlZENvbW1pdFBvc2l0aW9uVEIgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcChbXG4gICAgICAgIFtcImNvbW1pdFplcm9cIiwgeyB4OiAwLCB5OiA0MCwgcG9zV2l0aE9mZnNldDogNDAgfV0sXG4gICAgICAgIFtcImNvbW1pdEFcIiwgeyB4OiAxMDcuNDk2MDkzNzUsIHk6IDkwLCBwb3NXaXRoT2Zmc2V0OiA5MCB9XSxcbiAgICAgICAgW1wiY29tbWl0QlwiLCB7IHg6IDEwNy40OTYwOTM3NSwgeTogMTQwLCBwb3NXaXRoT2Zmc2V0OiAxNDAgfV0sXG4gICAgICAgIFtcImNvbW1pdE1cIiwgeyB4OiAwLCB5OiAxOTAsIHBvc1dpdGhPZmZzZXQ6IDE5MCB9XSxcbiAgICAgICAgW1wiY29tbWl0Q1wiLCB7IHg6IDIyNC4wMzUxNTYyNSwgeTogMjQwLCBwb3NXaXRoT2Zmc2V0OiAyNDAgfV0sXG4gICAgICAgIFtcImNvbW1pdDVfODkyOGVhMFwiLCB7IHg6IDIyNC4wMzUxNTYyNSwgeTogMjkwLCBwb3NXaXRoT2Zmc2V0OiAyOTAgfV0sXG4gICAgICAgIFtcImNvbW1pdERcIiwgeyB4OiAyMjQuMDM1MTU2MjUsIHk6IDM0MCwgcG9zV2l0aE9mZnNldDogMzQwIH1dLFxuICAgICAgICBbXCJjb21taXQ3X2VkODQ4YmFcIiwgeyB4OiAyMjQuMDM1MTU2MjUsIHk6IDM5MCwgcG9zV2l0aE9mZnNldDogMzkwIH1dXG4gICAgICBdKTtcbiAgICAgIGNvbW1pdHMuZm9yRWFjaCgoY29tbWl0Miwga2V5KSA9PiB7XG4gICAgICAgIGl0KGBzaG91bGQgZ2l2ZSB0aGUgY29ycmVjdCBwb3NpdGlvbiBmb3IgY29tbWl0ICR7a2V5fWAsICgpID0+IHtcbiAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IGdldENvbW1pdFBvc2l0aW9uKGNvbW1pdDIsIHBvcywgZmFsc2UpO1xuICAgICAgICAgIGV4cGVjdChwb3NpdGlvbikudG9FcXVhbChleHBlY3RlZENvbW1pdFBvc2l0aW9uVEIuZ2V0KGtleSkpO1xuICAgICAgICAgIHBvcyArPSA1MDtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBkZXNjcmliZShcIkxSXCIsICgpID0+IHtcbiAgICAgIGxldCBwb3MyID0gMzA7XG4gICAgICBkaXIgPSBcIkxSXCI7XG4gICAgICBjb25zdCBleHBlY3RlZENvbW1pdFBvc2l0aW9uTFIgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcChbXG4gICAgICAgIFtcImNvbW1pdFplcm9cIiwgeyB4OiAwLCB5OiA0MCwgcG9zV2l0aE9mZnNldDogNDAgfV0sXG4gICAgICAgIFtcImNvbW1pdEFcIiwgeyB4OiAxMDcuNDk2MDkzNzUsIHk6IDkwLCBwb3NXaXRoT2Zmc2V0OiA5MCB9XSxcbiAgICAgICAgW1wiY29tbWl0QlwiLCB7IHg6IDEwNy40OTYwOTM3NSwgeTogMTQwLCBwb3NXaXRoT2Zmc2V0OiAxNDAgfV0sXG4gICAgICAgIFtcImNvbW1pdE1cIiwgeyB4OiAwLCB5OiAxOTAsIHBvc1dpdGhPZmZzZXQ6IDE5MCB9XSxcbiAgICAgICAgW1wiY29tbWl0Q1wiLCB7IHg6IDIyNC4wMzUxNTYyNSwgeTogMjQwLCBwb3NXaXRoT2Zmc2V0OiAyNDAgfV0sXG4gICAgICAgIFtcImNvbW1pdDVfODkyOGVhMFwiLCB7IHg6IDIyNC4wMzUxNTYyNSwgeTogMjkwLCBwb3NXaXRoT2Zmc2V0OiAyOTAgfV0sXG4gICAgICAgIFtcImNvbW1pdERcIiwgeyB4OiAyMjQuMDM1MTU2MjUsIHk6IDM0MCwgcG9zV2l0aE9mZnNldDogMzQwIH1dLFxuICAgICAgICBbXCJjb21taXQ3X2VkODQ4YmFcIiwgeyB4OiAyMjQuMDM1MTU2MjUsIHk6IDM5MCwgcG9zV2l0aE9mZnNldDogMzkwIH1dXG4gICAgICBdKTtcbiAgICAgIGNvbW1pdHMuZm9yRWFjaCgoY29tbWl0Miwga2V5KSA9PiB7XG4gICAgICAgIGl0KGBzaG91bGQgZ2l2ZSB0aGUgY29ycmVjdCBwb3NpdGlvbiBmb3IgY29tbWl0ICR7a2V5fWAsICgpID0+IHtcbiAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IGdldENvbW1pdFBvc2l0aW9uKGNvbW1pdDIsIHBvczIsIGZhbHNlKTtcbiAgICAgICAgICBleHBlY3QocG9zaXRpb24pLnRvRXF1YWwoZXhwZWN0ZWRDb21taXRQb3NpdGlvbkxSLmdldChrZXkpKTtcbiAgICAgICAgICBwb3MyICs9IDUwO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGRlc2NyaWJlKFwiZ2V0Q29tbWl0Q2xhc3NUeXBlXCIsICgpID0+IHtcbiAgICAgIGNvbnN0IGV4cGVjdGVkQ29tbWl0Q2xhc3NUeXBlID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoW1xuICAgICAgICBbXCJjb21taXRaZXJvXCIsIFwiY29tbWl0LW5vcm1hbFwiXSxcbiAgICAgICAgW1wiY29tbWl0QVwiLCBcImNvbW1pdC1ub3JtYWxcIl0sXG4gICAgICAgIFtcImNvbW1pdEJcIiwgXCJjb21taXQtbm9ybWFsXCJdLFxuICAgICAgICBbXCJjb21taXRNXCIsIFwiY29tbWl0LW1lcmdlXCJdLFxuICAgICAgICBbXCJjb21taXRDXCIsIFwiY29tbWl0LW5vcm1hbFwiXSxcbiAgICAgICAgW1wiY29tbWl0NV84OTI4ZWEwXCIsIFwiY29tbWl0LWNoZXJyeS1waWNrXCJdLFxuICAgICAgICBbXCJjb21taXREXCIsIFwiY29tbWl0LW5vcm1hbFwiXSxcbiAgICAgICAgW1wiY29tbWl0N19lZDg0OGJhXCIsIFwiY29tbWl0LWNoZXJyeS1waWNrXCJdXG4gICAgICBdKTtcbiAgICAgIGNvbW1pdHMuZm9yRWFjaCgoY29tbWl0Miwga2V5KSA9PiB7XG4gICAgICAgIGl0KGBzaG91bGQgZ2l2ZSB0aGUgY29ycmVjdCBjbGFzcyB0eXBlIGZvciBjb21taXQgJHtrZXl9YCwgKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGNsYXNzVHlwZSA9IGdldENvbW1pdENsYXNzVHlwZShjb21taXQyKTtcbiAgICAgICAgICBleHBlY3QoY2xhc3NUeXBlKS50b0JlKGV4cGVjdGVkQ29tbWl0Q2xhc3NUeXBlLmdldChrZXkpKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG4gIGRlc2NyaWJlKFwiYnVpbGRpbmcgQlQgcGFyYWxsZWwgY29tbWl0IGRpYWdyYW1cIiwgKCkgPT4ge1xuICAgIGNvbnN0IGNvbW1pdHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcChbXG4gICAgICBbXG4gICAgICAgIFwiMS1hYmNkZWZnXCIsXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogXCIxLWFiY2RlZmdcIixcbiAgICAgICAgICBtZXNzYWdlOiBcIlwiLFxuICAgICAgICAgIHNlcTogMCxcbiAgICAgICAgICB0eXBlOiAwLFxuICAgICAgICAgIHRhZ3M6IFtdLFxuICAgICAgICAgIHBhcmVudHM6IFtdLFxuICAgICAgICAgIGJyYW5jaDogXCJtYWluXCJcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgXCIyLWFiY2RlZmdcIixcbiAgICAgICAge1xuICAgICAgICAgIGlkOiBcIjItYWJjZGVmZ1wiLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiXCIsXG4gICAgICAgICAgc2VxOiAxLFxuICAgICAgICAgIHR5cGU6IDAsXG4gICAgICAgICAgdGFnczogW10sXG4gICAgICAgICAgcGFyZW50czogW1wiMS1hYmNkZWZnXCJdLFxuICAgICAgICAgIGJyYW5jaDogXCJtYWluXCJcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgXCIzLWFiY2RlZmdcIixcbiAgICAgICAge1xuICAgICAgICAgIGlkOiBcIjMtYWJjZGVmZ1wiLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiXCIsXG4gICAgICAgICAgc2VxOiAyLFxuICAgICAgICAgIHR5cGU6IDAsXG4gICAgICAgICAgdGFnczogW10sXG4gICAgICAgICAgcGFyZW50czogW1wiMi1hYmNkZWZnXCJdLFxuICAgICAgICAgIGJyYW5jaDogXCJkZXZlbG9wXCJcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgXCI0LWFiY2RlZmdcIixcbiAgICAgICAge1xuICAgICAgICAgIGlkOiBcIjQtYWJjZGVmZ1wiLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiXCIsXG4gICAgICAgICAgc2VxOiAzLFxuICAgICAgICAgIHR5cGU6IDAsXG4gICAgICAgICAgdGFnczogW10sXG4gICAgICAgICAgcGFyZW50czogW1wiMy1hYmNkZWZnXCJdLFxuICAgICAgICAgIGJyYW5jaDogXCJkZXZlbG9wXCJcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgXCI1LWFiY2RlZmdcIixcbiAgICAgICAge1xuICAgICAgICAgIGlkOiBcIjUtYWJjZGVmZ1wiLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiXCIsXG4gICAgICAgICAgc2VxOiA0LFxuICAgICAgICAgIHR5cGU6IDAsXG4gICAgICAgICAgdGFnczogW10sXG4gICAgICAgICAgcGFyZW50czogW1wiMi1hYmNkZWZnXCJdLFxuICAgICAgICAgIGJyYW5jaDogXCJmZWF0dXJlXCJcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgXCI2LWFiY2RlZmdcIixcbiAgICAgICAge1xuICAgICAgICAgIGlkOiBcIjYtYWJjZGVmZ1wiLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiXCIsXG4gICAgICAgICAgc2VxOiA1LFxuICAgICAgICAgIHR5cGU6IDAsXG4gICAgICAgICAgdGFnczogW10sXG4gICAgICAgICAgcGFyZW50czogW1wiNS1hYmNkZWZnXCJdLFxuICAgICAgICAgIGJyYW5jaDogXCJmZWF0dXJlXCJcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgXCI3LWFiY2RlZmdcIixcbiAgICAgICAge1xuICAgICAgICAgIGlkOiBcIjctYWJjZGVmZ1wiLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiXCIsXG4gICAgICAgICAgc2VxOiA2LFxuICAgICAgICAgIHR5cGU6IDAsXG4gICAgICAgICAgdGFnczogW10sXG4gICAgICAgICAgcGFyZW50czogW1wiMi1hYmNkZWZnXCJdLFxuICAgICAgICAgIGJyYW5jaDogXCJtYWluXCJcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIFtcbiAgICAgICAgXCI4LWFiY2RlZmdcIixcbiAgICAgICAge1xuICAgICAgICAgIGlkOiBcIjgtYWJjZGVmZ1wiLFxuICAgICAgICAgIG1lc3NhZ2U6IFwiXCIsXG4gICAgICAgICAgc2VxOiA3LFxuICAgICAgICAgIHR5cGU6IDAsXG4gICAgICAgICAgdGFnczogW10sXG4gICAgICAgICAgcGFyZW50czogW1wiNy1hYmNkZWZnXCJdLFxuICAgICAgICAgIGJyYW5jaDogXCJtYWluXCJcbiAgICAgICAgfVxuICAgICAgXVxuICAgIF0pO1xuICAgIGNvbnN0IGV4cGVjdGVkQ29tbWl0UG9zaXRpb24gPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcChbXG4gICAgICBbXCIxLWFiY2RlZmdcIiwgeyB4OiAwLCB5OiA0MCB9XSxcbiAgICAgIFtcIjItYWJjZGVmZ1wiLCB7IHg6IDAsIHk6IDkwIH1dLFxuICAgICAgW1wiMy1hYmNkZWZnXCIsIHsgeDogMTA3LjQ5NjA5Mzc1LCB5OiAxNDAgfV0sXG4gICAgICBbXCI0LWFiY2RlZmdcIiwgeyB4OiAxMDcuNDk2MDkzNzUsIHk6IDE5MCB9XSxcbiAgICAgIFtcIjUtYWJjZGVmZ1wiLCB7IHg6IDIyNS43MDcwMzEyNSwgeTogMTQwIH1dLFxuICAgICAgW1wiNi1hYmNkZWZnXCIsIHsgeDogMjI1LjcwNzAzMTI1LCB5OiAxOTAgfV0sXG4gICAgICBbXCI3LWFiY2RlZmdcIiwgeyB4OiAwLCB5OiAxNDAgfV0sXG4gICAgICBbXCI4LWFiY2RlZmdcIiwgeyB4OiAwLCB5OiAxOTAgfV1cbiAgICBdKTtcbiAgICBjb25zdCBleHBlY3RlZENvbW1pdFBvc2l0aW9uQWZ0ZXJQYXJhbGxlbCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKFtcbiAgICAgIFtcIjEtYWJjZGVmZ1wiLCB7IHg6IDAsIHk6IDIxMCB9XSxcbiAgICAgIFtcIjItYWJjZGVmZ1wiLCB7IHg6IDAsIHk6IDE2MCB9XSxcbiAgICAgIFtcIjMtYWJjZGVmZ1wiLCB7IHg6IDEwNy40OTYwOTM3NSwgeTogMTEwIH1dLFxuICAgICAgW1wiNC1hYmNkZWZnXCIsIHsgeDogMTA3LjQ5NjA5Mzc1LCB5OiA2MCB9XSxcbiAgICAgIFtcIjUtYWJjZGVmZ1wiLCB7IHg6IDIyNS43MDcwMzEyNSwgeTogMTEwIH1dLFxuICAgICAgW1wiNi1hYmNkZWZnXCIsIHsgeDogMjI1LjcwNzAzMTI1LCB5OiA2MCB9XSxcbiAgICAgIFtcIjctYWJjZGVmZ1wiLCB7IHg6IDAsIHk6IDExMCB9XSxcbiAgICAgIFtcIjgtYWJjZGVmZ1wiLCB7IHg6IDAsIHk6IDYwIH1dXG4gICAgXSk7XG4gICAgY29uc3QgZXhwZWN0ZWRDb21taXRDdXJyZW50UG9zaXRpb24gPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcChbXG4gICAgICBbXCIxLWFiY2RlZmdcIiwgMzBdLFxuICAgICAgW1wiMi1hYmNkZWZnXCIsIDgwXSxcbiAgICAgIFtcIjMtYWJjZGVmZ1wiLCAxMzBdLFxuICAgICAgW1wiNC1hYmNkZWZnXCIsIDE4MF0sXG4gICAgICBbXCI1LWFiY2RlZmdcIiwgMTMwXSxcbiAgICAgIFtcIjYtYWJjZGVmZ1wiLCAxODBdLFxuICAgICAgW1wiNy1hYmNkZWZnXCIsIDEzMF0sXG4gICAgICBbXCI4LWFiY2RlZmdcIiwgMTgwXVxuICAgIF0pO1xuICAgIGNvbnN0IHNvcnRlZEtleXMgPSBbLi4uZXhwZWN0ZWRDb21taXRQb3NpdGlvbi5rZXlzKCldO1xuICAgIGl0KFwic2hvdWxkIGdldCB0aGUgY29ycmVjdCBjb21taXQgcG9zaXRpb24gYW5kIGN1cnJlbnQgcG9zaXRpb25cIiwgKCkgPT4ge1xuICAgICAgZGlyID0gXCJCVFwiO1xuICAgICAgbGV0IGN1clBvcyA9IDMwO1xuICAgICAgY29tbWl0UG9zLmNsZWFyKCk7XG4gICAgICBicmFuY2hQb3MuY2xlYXIoKTtcbiAgICAgIGJyYW5jaFBvcy5zZXQoXCJtYWluXCIsIHsgcG9zOiAwLCBpbmRleDogMCB9KTtcbiAgICAgIGJyYW5jaFBvcy5zZXQoXCJkZXZlbG9wXCIsIHsgcG9zOiAxMDcuNDk2MDkzNzUsIGluZGV4OiAxIH0pO1xuICAgICAgYnJhbmNoUG9zLnNldChcImZlYXR1cmVcIiwgeyBwb3M6IDIyNS43MDcwMzEyNSwgaW5kZXg6IDIgfSk7XG4gICAgICBjb21taXRzLmZvckVhY2goKGNvbW1pdDIsIGtleSkgPT4ge1xuICAgICAgICBpZiAoY29tbWl0Mi5wYXJlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBjdXJQb3MgPSBjYWxjdWxhdGVDb21taXRQb3NpdGlvbihjb21taXQyKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHNldENvbW1pdFBvc2l0aW9uKGNvbW1pdDIsIGN1clBvcyk7XG4gICAgICAgIGV4cGVjdChwb3NpdGlvbikudG9FcXVhbChleHBlY3RlZENvbW1pdFBvc2l0aW9uLmdldChrZXkpKTtcbiAgICAgICAgZXhwZWN0KGN1clBvcykudG9FcXVhbChleHBlY3RlZENvbW1pdEN1cnJlbnRQb3NpdGlvbi5nZXQoa2V5KSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBpdChcInNob3VsZCBnZXQgdGhlIGNvcnJlY3QgY29tbWl0IHBvc2l0aW9uIGFmdGVyIHBhcmFsbGVsIGNvbW1pdHNcIiwgKCkgPT4ge1xuICAgICAgY29tbWl0UG9zLmNsZWFyKCk7XG4gICAgICBicmFuY2hQb3MuY2xlYXIoKTtcbiAgICAgIGRpciA9IFwiQlRcIjtcbiAgICAgIGNvbnN0IGN1clBvcyA9IDMwO1xuICAgICAgY29tbWl0UG9zLmNsZWFyKCk7XG4gICAgICBicmFuY2hQb3MuY2xlYXIoKTtcbiAgICAgIGJyYW5jaFBvcy5zZXQoXCJtYWluXCIsIHsgcG9zOiAwLCBpbmRleDogMCB9KTtcbiAgICAgIGJyYW5jaFBvcy5zZXQoXCJkZXZlbG9wXCIsIHsgcG9zOiAxMDcuNDk2MDkzNzUsIGluZGV4OiAxIH0pO1xuICAgICAgYnJhbmNoUG9zLnNldChcImZlYXR1cmVcIiwgeyBwb3M6IDIyNS43MDcwMzEyNSwgaW5kZXg6IDIgfSk7XG4gICAgICBzZXRQYXJhbGxlbEJUUG9zKHNvcnRlZEtleXMsIGNvbW1pdHMsIGN1clBvcyk7XG4gICAgICBzb3J0ZWRLZXlzLmZvckVhY2goKGNvbW1pdDIpID0+IHtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBjb21taXRQb3MuZ2V0KGNvbW1pdDIpO1xuICAgICAgICBleHBlY3QocG9zaXRpb24pLnRvRXF1YWwoZXhwZWN0ZWRDb21taXRQb3NpdGlvbkFmdGVyUGFyYWxsZWwuZ2V0KGNvbW1pdDIpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbiAgaXQoXCJhZGRcIiwgKCkgPT4ge1xuICAgIGNvbW1pdFBvcy5zZXQoXCJwYXJlbnQxXCIsIHsgeDogMSwgeTogMSB9KTtcbiAgICBjb21taXRQb3Muc2V0KFwicGFyZW50MlwiLCB7IHg6IDIsIHk6IDIgfSk7XG4gICAgY29tbWl0UG9zLnNldChcInBhcmVudDNcIiwgeyB4OiAzLCB5OiAzIH0pO1xuICAgIGRpciA9IFwiTFJcIjtcbiAgICBjb25zdCBwYXJlbnRzID0gW1wicGFyZW50MVwiLCBcInBhcmVudDJcIiwgXCJwYXJlbnQzXCJdO1xuICAgIGNvbnN0IGNsb3Nlc3RQYXJlbnQgPSBmaW5kQ2xvc2VzdFBhcmVudChwYXJlbnRzKTtcbiAgICBleHBlY3QoY2xvc2VzdFBhcmVudCkudG9CZShcInBhcmVudDNcIik7XG4gICAgY29tbWl0UG9zLmNsZWFyKCk7XG4gIH0pO1xufVxuXG4vLyBzcmMvZGlhZ3JhbXMvZ2l0L3N0eWxlcy5qc1xudmFyIEdJVF9OQU1FRF9DT0xPUl9DT1VOVCA9IDg7XG52YXIgUkVEVVhfR0VPTUVUUllfVEhFTUVTMiA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KFtcInJlZHV4XCIsIFwicmVkdXgtZGFya1wiLCBcInJlZHV4LWNvbG9yXCIsIFwicmVkdXgtZGFyay1jb2xvclwiXSk7XG52YXIgQ09MT1JfVEhFTUVTMiA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KFtcInJlZHV4LWNvbG9yXCIsIFwicmVkdXgtZGFyay1jb2xvclwiXSk7XG52YXIgTkVPX1RIRU1FUyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KFtcIm5lb1wiLCBcIm5lby1kYXJrXCJdKTtcbnZhciBEQVJLX1RIRU1FUzIgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldChbXCJkYXJrXCIsIFwicmVkdXgtZGFya1wiLCBcInJlZHV4LWRhcmstY29sb3JcIiwgXCJuZW8tZGFya1wiXSk7XG52YXIgTkVPX0NPTE9SX0dFTl9USEVNRVMgPSAvKiBAX19QVVJFX18gKi8gbmV3IFNldChbXG4gIFwicmVkdXhcIixcbiAgXCJyZWR1eC1kYXJrXCIsXG4gIFwicmVkdXgtY29sb3JcIixcbiAgXCJyZWR1eC1kYXJrLWNvbG9yXCIsXG4gIFwibmVvXCIsXG4gIFwibmVvLWRhcmtcIlxuXSk7XG52YXIgZ2VuR2l0R3JhcGhHcmFkaWVudCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKG9wdGlvbnMpID0+IHtcbiAgY29uc3QgeyBzdmdJZCB9ID0gb3B0aW9ucztcbiAgbGV0IHNlY3Rpb25zID0gXCJcIjtcbiAgaWYgKG9wdGlvbnMudXNlR3JhZGllbnQgJiYgc3ZnSWQpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9wdGlvbnMuVEhFTUVfQ09MT1JfTElNSVQ7IGkrKykge1xuICAgICAgc2VjdGlvbnMgKz0gYFxuICAgICAgLmxhYmVsJHtpfSAgeyBmaWxsOiAke29wdGlvbnMubWFpbkJrZ307IHN0cm9rZTogdXJsKCR7c3ZnSWR9LWdyYWRpZW50KTsgc3Ryb2tlLXdpZHRoOiAke29wdGlvbnMuc3Ryb2tlV2lkdGh9O31cbiAgICAgICAgICAgICBgO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc2VjdGlvbnM7XG59LCBcImdlbkdpdEdyYXBoR3JhZGllbnRcIik7XG52YXIgZ2VuQ29sb3IgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChvcHRpb25zKSA9PiB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICBjb25zdCB7IHRoZW1lLCB0aGVtZVZhcmlhYmxlcyB9ID0gY29uZmlnO1xuICBjb25zdCB7IGJvcmRlckNvbG9yQXJyYXkgfSA9IHRoZW1lVmFyaWFibGVzO1xuICBjb25zdCB1c2VSZWR1eEdlb21ldHJ5ID0gUkVEVVhfR0VPTUVUUllfVEhFTUVTMi5oYXModGhlbWUpO1xuICBpZiAoTkVPX1RIRU1FUy5oYXModGhlbWUpKSB7XG4gICAgbGV0IHNlY3Rpb25zID0gXCJcIjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG9wdGlvbnMuVEhFTUVfQ09MT1JfTElNSVQ7IGkrKykge1xuICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgc2VjdGlvbnMgKz0gYFxuICAgICAgICAuYnJhbmNoLWxhYmVsJHtpfSB7IGZpbGw6ICR7b3B0aW9ucy5ub2RlQm9yZGVyfTt9XG4gICAgICAgIC5jb21taXQke2l9IHsgc3Ryb2tlOiAke29wdGlvbnMubm9kZUJvcmRlcn07ICAgfVxuICAgICAgICAuY29tbWl0LWhpZ2hsaWdodCR7aX0geyBzdHJva2U6ICR7b3B0aW9ucy5ub2RlQm9yZGVyfTsgZmlsbDogJHtvcHRpb25zLm5vZGVCb3JkZXJ9OyB9XG4gICAgICAgIC5hcnJvdyR7aX0geyBzdHJva2U6ICR7b3B0aW9ucy5ub2RlQm9yZGVyfTsgfVxuICAgICAgICAuY29tbWl0LWJ1bGxldHMgeyBmaWxsOiAke29wdGlvbnMubm9kZUJvcmRlcn07IH1cbiAgICAgICAgLmNvbW1pdC1jaGVycnktcGljayR7aX0geyBzdHJva2U6ICR7b3B0aW9ucy5ub2RlQm9yZGVyfTsgfVxuICAgICAgICAke2dlbkdpdEdyYXBoR3JhZGllbnQob3B0aW9ucyl9YDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGNpID0gaSAlIEdJVF9OQU1FRF9DT0xPUl9DT1VOVDtcbiAgICAgICAgc2VjdGlvbnMgKz0gYFxuICAgICAgICAuYnJhbmNoLWxhYmVsJHtpfSB7IGZpbGw6ICR7b3B0aW9uc1tcImdpdEJyYW5jaExhYmVsXCIgKyBjaV19OyB9XG4gICAgICAgIC5jb21taXQke2l9IHsgc3Ryb2tlOiAke29wdGlvbnNbXCJnaXRcIiArIGNpXX07IGZpbGw6ICR7b3B0aW9uc1tcImdpdFwiICsgY2ldfTsgfVxuICAgICAgICAuY29tbWl0LWhpZ2hsaWdodCR7aX0geyBzdHJva2U6ICR7b3B0aW9uc1tcImdpdEludlwiICsgY2ldfTsgZmlsbDogJHtvcHRpb25zW1wiZ2l0SW52XCIgKyBjaV19OyB9XG4gICAgICAgIC5hcnJvdyR7aX0geyBzdHJva2U6ICR7b3B0aW9uc1tcImdpdFwiICsgY2ldfTsgfVxuICAgICAgICBgO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc2VjdGlvbnM7XG4gIH0gZWxzZSBpZiAoIUNPTE9SX1RIRU1FUzIuaGFzKHRoZW1lKSkge1xuICAgIGxldCBzZWN0aW9ucyA9IFwiXCI7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcHRpb25zLlRIRU1FX0NPTE9SX0xJTUlUOyBpKyspIHtcbiAgICAgIHNlY3Rpb25zICs9IGBcbiAgICAgICAgLmJyYW5jaC1sYWJlbCR7aX0geyBmaWxsOiAke29wdGlvbnMubm9kZUJvcmRlcn07ICR7dXNlUmVkdXhHZW9tZXRyeSA/IGBmb250LXdlaWdodDoke29wdGlvbnMubm90ZUZvbnRXZWlnaHR9YCA6IFwiXCJ9IH1cbiAgICAgICAgLmNvbW1pdCR7aX0geyBzdHJva2U6ICR7b3B0aW9ucy5ub2RlQm9yZGVyfTsgICB9XG4gICAgICAgIC5jb21taXQtaGlnaGxpZ2h0JHtpfSB7IHN0cm9rZTogJHtvcHRpb25zLm5vZGVCb3JkZXJ9OyBmaWxsOiAke29wdGlvbnMubm9kZUJvcmRlcn07IH1cbiAgICAgICAgLmxhYmVsJHtpfSAgeyBmaWxsOiAke29wdGlvbnMubWFpbkJrZ307IHN0cm9rZTogJHtvcHRpb25zLm5vZGVCb3JkZXJ9OyBzdHJva2Utd2lkdGg6ICR7b3B0aW9ucy5zdHJva2VXaWR0aH07ICR7dXNlUmVkdXhHZW9tZXRyeSA/IGBmb250LXdlaWdodDoke29wdGlvbnMubm90ZUZvbnRXZWlnaHR9YCA6IFwiXCJ9fVxuICAgICAgICAuYXJyb3cke2l9IHsgc3Ryb2tlOiAke29wdGlvbnMubm9kZUJvcmRlcn07IH1cbiAgICAgICAgLmNvbW1pdC1idWxsZXRzIHsgZmlsbDogJHtvcHRpb25zLm5vZGVCb3JkZXJ9OyB9XG4gICAgICAgIC5jb21taXQtY2hlcnJ5LXBpY2ske2l9IHsgc3Ryb2tlOiAke29wdGlvbnMubm9kZUJvcmRlcn07IH1cbiAgICAgICAgYDtcbiAgICB9XG4gICAgcmV0dXJuIHNlY3Rpb25zO1xuICB9IGVsc2Uge1xuICAgIGxldCBzZWN0aW9ucyA9IFwiXCI7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcHRpb25zLlRIRU1FX0NPTE9SX0xJTUlUOyBpKyspIHtcbiAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgIHNlY3Rpb25zICs9IGBcbiAgICAgICAgLmJyYW5jaC1sYWJlbCR7aX0geyBmaWxsOiAke29wdGlvbnMubm9kZUJvcmRlcn07ICR7dXNlUmVkdXhHZW9tZXRyeSA/IGBmb250LXdlaWdodDoke29wdGlvbnMubm90ZUZvbnRXZWlnaHR9YCA6IFwiXCJ9IH1cbiAgICAgICAgLmNvbW1pdCR7aX0geyBzdHJva2U6ICR7b3B0aW9ucy5ub2RlQm9yZGVyfTsgfVxuICAgICAgICAuY29tbWl0LWhpZ2hsaWdodCR7aX0geyBzdHJva2U6ICR7b3B0aW9ucy5ub2RlQm9yZGVyfTsgZmlsbDogJHtvcHRpb25zLm1haW5Ca2d9OyB9XG4gICAgICAgIC5sYWJlbCR7aX0gIHsgZmlsbDogJHtvcHRpb25zLm1haW5Ca2d9OyBzdHJva2U6ICR7b3B0aW9ucy5ub2RlQm9yZGVyfTsgc3Ryb2tlLXdpZHRoOiAke29wdGlvbnMuc3Ryb2tlV2lkdGh9OyAke3VzZVJlZHV4R2VvbWV0cnkgPyBgZm9udC13ZWlnaHQ6JHtvcHRpb25zLm5vdGVGb250V2VpZ2h0fWAgOiBcIlwifSB9XG4gICAgICAgIC5hcnJvdyR7aX0geyBzdHJva2U6ICR7b3B0aW9ucy5ub2RlQm9yZGVyfTsgfVxuICAgICAgICAuY29tbWl0LWJ1bGxldHMgeyBmaWxsOiAke29wdGlvbnMubm9kZUJvcmRlcn07IH1cbiAgICAgICAgYDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGNvbG9ySW5kZXggPSBpICUgYm9yZGVyQ29sb3JBcnJheS5sZW5ndGg7XG4gICAgICAgIHNlY3Rpb25zICs9IGBcbiAgICAgICAgLmJyYW5jaC1sYWJlbCR7aX0geyBmaWxsOiAke29wdGlvbnMubm9kZUJvcmRlcn07ICR7dXNlUmVkdXhHZW9tZXRyeSA/IGBmb250LXdlaWdodDoke29wdGlvbnMubm90ZUZvbnRXZWlnaHR9YCA6IFwiXCJ9IH1cbiAgICAgICAgLmNvbW1pdCR7aX0geyBzdHJva2U6ICR7Ym9yZGVyQ29sb3JBcnJheVtjb2xvckluZGV4XX07IGZpbGw6ICR7Ym9yZGVyQ29sb3JBcnJheVtjb2xvckluZGV4XX07IH1cbiAgICAgICAgLmNvbW1pdC1oaWdobGlnaHQke2l9IHsgc3Ryb2tlOiAke2JvcmRlckNvbG9yQXJyYXlbY29sb3JJbmRleF19OyBmaWxsOiAke2JvcmRlckNvbG9yQXJyYXlbY29sb3JJbmRleF19OyB9XG4gICAgICAgIC5sYWJlbCR7aX0gIHsgZmlsbDogJHtEQVJLX1RIRU1FUzIuaGFzKHRoZW1lKSA/IG9wdGlvbnMubWFpbkJrZyA6IGJvcmRlckNvbG9yQXJyYXlbY29sb3JJbmRleF19OyBzdHJva2U6ICR7Ym9yZGVyQ29sb3JBcnJheVtjb2xvckluZGV4XX07ICBzdHJva2Utd2lkdGg6ICR7b3B0aW9ucy5zdHJva2VXaWR0aH07IH1cbiAgICAgICAgLmFycm93JHtpfSB7IHN0cm9rZTogJHtib3JkZXJDb2xvckFycmF5W2NvbG9ySW5kZXhdfTsgfVxuICAgICAgICBgO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc2VjdGlvbnM7XG4gIH1cbn0sIFwiZ2VuQ29sb3JcIik7XG52YXIgbm9ybWFsVGhlbWUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChvcHRpb25zKSA9PiB7XG4gIHJldHVybiBgJHtBcnJheS5mcm9tKHsgbGVuZ3RoOiBvcHRpb25zLlRIRU1FX0NPTE9SX0xJTUlUIH0sIChfLCBpKSA9PiBpKS5tYXAoKGkpID0+IHtcbiAgICBjb25zdCBjaSA9IGkgJSBHSVRfTkFNRURfQ09MT1JfQ09VTlQ7XG4gICAgcmV0dXJuIGBcbiAgICAgICAgLmJyYW5jaC1sYWJlbCR7aX0geyBmaWxsOiAke29wdGlvbnNbXCJnaXRCcmFuY2hMYWJlbFwiICsgY2ldfTsgfVxuICAgICAgICAuY29tbWl0JHtpfSB7IHN0cm9rZTogJHtvcHRpb25zW1wiZ2l0XCIgKyBjaV19OyBmaWxsOiAke29wdGlvbnNbXCJnaXRcIiArIGNpXX07IH1cbiAgICAgICAgLmNvbW1pdC1oaWdobGlnaHQke2l9IHsgc3Ryb2tlOiAke29wdGlvbnNbXCJnaXRJbnZcIiArIGNpXX07IGZpbGw6ICR7b3B0aW9uc1tcImdpdEludlwiICsgY2ldfTsgfVxuICAgICAgICAubGFiZWwke2l9ICB7IGZpbGw6ICR7b3B0aW9uc1tcImdpdFwiICsgY2ldfTsgfVxuICAgICAgICAuYXJyb3cke2l9IHsgc3Ryb2tlOiAke29wdGlvbnNbXCJnaXRcIiArIGNpXX07IH1cbiAgICAgICAgYDtcbiAgfSkuam9pbihcIlxcblwiKX1gO1xufSwgXCJub3JtYWxUaGVtZVwiKTtcbnZhciBnZXRTdHlsZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChvcHRpb25zKSA9PiB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICBjb25zdCB7IHRoZW1lIH0gPSBjb25maWc7XG4gIGNvbnN0IHVzZU5lb0NvbG9yR2VuID0gTkVPX0NPTE9SX0dFTl9USEVNRVMuaGFzKHRoZW1lKTtcbiAgcmV0dXJuIGBcbiAgLmNvbW1pdC1pZCxcbiAgLmNvbW1pdC1tc2csXG4gIC5icmFuY2gtbGFiZWwge1xuICAgIGZpbGw6IGxpZ2h0Z3JleTtcbiAgICBjb2xvcjogbGlnaHRncmV5O1xuICAgIGZvbnQtZmFtaWx5OiAndHJlYnVjaGV0IG1zJywgdmVyZGFuYSwgYXJpYWwsIHNhbnMtc2VyaWY7XG4gICAgZm9udC1mYW1pbHk6IHZhcigtLW1lcm1haWQtZm9udC1mYW1pbHkpO1xuICB9XG4gIFxuICAke3VzZU5lb0NvbG9yR2VuID8gZ2VuQ29sb3Iob3B0aW9ucykgOiBub3JtYWxUaGVtZShvcHRpb25zKX1cblxuICAuYnJhbmNoIHtcbiAgICBzdHJva2Utd2lkdGg6ICR7b3B0aW9ucy5zdHJva2VXaWR0aH07XG4gICAgc3Ryb2tlOiAke29wdGlvbnMuY29tbWl0TGluZUNvbG9yID8/IG9wdGlvbnMubGluZUNvbG9yfTtcbiAgICBzdHJva2UtZGFzaGFycmF5OiAgJHt1c2VOZW9Db2xvckdlbiA/IFwiNCAyXCIgOiBcIjJcIn07XG4gIH1cbiAgLmNvbW1pdC1sYWJlbCB7IGZvbnQtc2l6ZTogJHtvcHRpb25zLmNvbW1pdExhYmVsRm9udFNpemV9OyBmaWxsOiAke3VzZU5lb0NvbG9yR2VuID8gb3B0aW9ucy5ub2RlQm9yZGVyIDogb3B0aW9ucy5jb21taXRMYWJlbENvbG9yfTsgJHt1c2VOZW9Db2xvckdlbiA/IGBmb250LXdlaWdodDoke29wdGlvbnMubm90ZUZvbnRXZWlnaHR9O2AgOiBcIlwifX1cbiAgLmNvbW1pdC1sYWJlbC1ia2cgeyBmb250LXNpemU6ICR7b3B0aW9ucy5jb21taXRMYWJlbEZvbnRTaXplfTsgZmlsbDogJHt1c2VOZW9Db2xvckdlbiA/IFwidHJhbnNwYXJlbnRcIiA6IG9wdGlvbnMuY29tbWl0TGFiZWxCYWNrZ3JvdW5kfTsgb3BhY2l0eTogJHt1c2VOZW9Db2xvckdlbiA/IFwiXCIgOiAwLjV9OyAgfVxuICAudGFnLWxhYmVsIHsgZm9udC1zaXplOiAke29wdGlvbnMudGFnTGFiZWxGb250U2l6ZX07IGZpbGw6ICR7b3B0aW9ucy50YWdMYWJlbENvbG9yfTt9XG4gIC50YWctbGFiZWwtYmtnIHsgZmlsbDogJHt1c2VOZW9Db2xvckdlbiA/IG9wdGlvbnMubWFpbkJrZyA6IG9wdGlvbnMudGFnTGFiZWxCYWNrZ3JvdW5kfTsgc3Ryb2tlOiAke3VzZU5lb0NvbG9yR2VuID8gb3B0aW9ucy5ub2RlQm9yZGVyIDogb3B0aW9ucy50YWdMYWJlbEJvcmRlcn07ICR7dXNlTmVvQ29sb3JHZW4gPyBgZmlsdGVyOiR7b3B0aW9ucy5kcm9wU2hhZG93fWAgOiBcIlwifSAgfVxuICAudGFnLWhvbGUgeyBmaWxsOiAke29wdGlvbnMudGV4dENvbG9yfTsgfVxuXG4gIC5jb21taXQtbWVyZ2Uge1xuICAgIHN0cm9rZTogJHt1c2VOZW9Db2xvckdlbiA/IG9wdGlvbnMubWFpbkJrZyA6IG9wdGlvbnMucHJpbWFyeUNvbG9yfTtcbiAgICBmaWxsOiAke3VzZU5lb0NvbG9yR2VuID8gb3B0aW9ucy5tYWluQmtnIDogb3B0aW9ucy5wcmltYXJ5Q29sb3J9O1xuICB9XG4gIC5jb21taXQtcmV2ZXJzZSB7XG4gICAgc3Ryb2tlOiAke3VzZU5lb0NvbG9yR2VuID8gb3B0aW9ucy5tYWluQmtnIDogb3B0aW9ucy5wcmltYXJ5Q29sb3J9O1xuICAgIGZpbGw6ICR7dXNlTmVvQ29sb3JHZW4gPyBvcHRpb25zLm1haW5Ca2cgOiBvcHRpb25zLnByaW1hcnlDb2xvcn07XG4gICAgc3Ryb2tlLXdpZHRoOiAke3VzZU5lb0NvbG9yR2VuID8gb3B0aW9ucy5zdHJva2VXaWR0aCA6IDN9O1xuICB9XG4gIC5jb21taXQtaGlnaGxpZ2h0LW91dGVyIHtcbiAgfVxuICAuY29tbWl0LWhpZ2hsaWdodC1pbm5lciB7XG4gICAgc3Ryb2tlOiAke3VzZU5lb0NvbG9yR2VuID8gb3B0aW9ucy5tYWluQmtnIDogb3B0aW9ucy5wcmltYXJ5Q29sb3J9O1xuICAgIGZpbGw6ICR7dXNlTmVvQ29sb3JHZW4gPyBvcHRpb25zLm1haW5Ca2cgOiBvcHRpb25zLnByaW1hcnlDb2xvcn07XG4gIH1cblxuICAuYXJyb3cge1xuICAgIC8qIEludGVudGlvbmFsOiBuZW8gdGhlbWVzIGtlZXAgdGhlIGJvbGQgOHB4IGFycm93IChsaWtlIGNsYXNzaWMgdGhlbWVzKTsgb25seSByZWR1eC1nZW9tZXRyeSB0aGVtZXMgdXNlIHRoZSB0aGlubmVyIG9wdGlvbnMuc3Ryb2tlV2lkdGguICovXG4gICAgc3Ryb2tlLXdpZHRoOiAke1JFRFVYX0dFT01FVFJZX1RIRU1FUzIuaGFzKHRoZW1lKSA/IG9wdGlvbnMuc3Ryb2tlV2lkdGggOiA4fTtcbiAgICBzdHJva2UtbGluZWNhcDogcm91bmQ7XG4gICAgZmlsbDogbm9uZVxuICB9XG4gIC5naXRUaXRsZVRleHQge1xuICAgIHRleHQtYW5jaG9yOiBtaWRkbGU7XG4gICAgZm9udC1zaXplOiAxOHB4O1xuICAgIGZpbGw6ICR7b3B0aW9ucy50ZXh0Q29sb3J9O1xuICB9XG5gO1xufSwgXCJnZXRTdHlsZXNcIik7XG52YXIgc3R5bGVzX2RlZmF1bHQgPSBnZXRTdHlsZXM7XG5cbi8vIHNyYy9kaWFncmFtcy9naXQvZ2l0R3JhcGhEaWFncmFtLnRzXG52YXIgZGlhZ3JhbSA9IHtcbiAgcGFyc2VyLFxuICBkYixcbiAgcmVuZGVyZXI6IGdpdEdyYXBoUmVuZGVyZXJfZGVmYXVsdCxcbiAgc3R5bGVzOiBzdHlsZXNfZGVmYXVsdFxufTtcbmV4cG9ydCB7XG4gIGRpYWdyYW1cbn07XG4iCiAgXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQ0EsSUFBSSxhQUFhO0FBQUEsRUFDZixRQUFR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LEVBQU87QUFBQSxNQUNMLElBQUksR0FBRyxJQUFJLEdBQUcsR0FBRztBQUFBLFFBQ2YsSUFBSSxRQUFRLFNBQVMsV0FBVyxTQUFTLFFBQVEsT0FBTyxRQUFRLFFBQVEsSUFBSTtBQUFBLFVBQzFFLFVBQVUsS0FBSyxHQUFHLEtBQUssR0FBRyxPQUFPLEdBQUcsSUFBSSxVQUFVLEdBQUcsS0FBSyxRQUFRLEdBQUcsS0FBSyxHQUFHLElBQUksWUFBWSxHQUFHLEtBQUssR0FBRztBQUFBLFFBQzFHLEVBQU87QUFBQSxVQUNMLFVBQVUsS0FBSyxHQUFHLEtBQUssR0FBRyxPQUFPLEdBQUcsS0FBSyxHQUFHLElBQUksVUFBVSxPQUFPLEdBQUcsSUFBSSxVQUFVLEdBQUcsT0FBTyxHQUFHLEtBQUssR0FBRztBQUFBO0FBQUEsTUFFM0c7QUFBQSxNQUNBLElBQUksR0FBRyxJQUFJLEdBQUcsR0FBRztBQUFBLFFBQ2YsSUFBSSxRQUFRLFNBQVMsV0FBVyxTQUFTLFFBQVEsT0FBTyxRQUFRLFFBQVEsSUFBSTtBQUFBLFVBQzFFLFVBQVUsS0FBSyxHQUFHLEtBQUssR0FBRyxPQUFPLEdBQUcsSUFBSSxVQUFVLEdBQUcsS0FBSyxPQUFPLEdBQUcsS0FBSyxHQUFHLElBQUksWUFBWSxHQUFHLEtBQUssR0FBRztBQUFBLFFBQ3pHLEVBQU87QUFBQSxVQUNMLFVBQVUsS0FBSyxHQUFHLEtBQUssR0FBRyxPQUFPLEdBQUcsS0FBSyxHQUFHLElBQUksVUFBVSxRQUFRLEdBQUcsSUFBSSxVQUFVLEdBQUcsT0FBTyxHQUFHLEtBQUssR0FBRztBQUFBO0FBQUEsTUFFNUc7QUFBQSxNQUNBLElBQUksR0FBRyxNQUFNLEdBQUcsR0FBRztBQUFBLFFBQ2pCLFVBQVUsS0FBSyxHQUFHLEtBQUssR0FBRyxPQUFPLEdBQUcsS0FBSyxHQUFHO0FBQUEsTUFDOUM7QUFBQTtBQUFBO0FBQUEsRUFHSixJQUFJLFlBQWlCLFdBQUc7QUFBQSxJQUN0QixNQUFNLElBQUksTUFBTSwyQkFBMkI7QUFBQSxFQUM3QztBQUFBLEVBQ0EsSUFBSSxPQUFPLE1BQU0sRUFBRSxLQUFLLEtBQUssT0FBTyxFQUFFLEtBQ3BDLFNBQ0EsZ0JBQWdCLGVBQWUsZUFBZSxtQkFBbUIsYUFBYSxDQUNoRjtBQUFBLEdBQ0MsV0FBVztBQUNkLElBQUksNkJBQTZCLE9BQU8sQ0FBQyxLQUFLLFlBQVk7QUFBQSxFQUN4RCxNQUFNLFVBQVUsSUFBSSxPQUFPLEdBQUcsRUFBRSxLQUFLLFNBQVMsZUFBZTtBQUFBLEVBQzdELENBQUMsR0FBRyxRQUFRLEtBQUssQ0FBQyxFQUFFLFFBQVEsQ0FBQyxRQUFRO0FBQUEsSUFDbkMsTUFBTSxVQUFVLFFBQVEsSUFBSSxHQUFHO0FBQUEsSUFDL0IsSUFBSSxRQUFRLFdBQVcsUUFBUSxRQUFRLFNBQVMsR0FBRztBQUFBLE1BQ2pELFFBQVEsUUFBUSxRQUFRLENBQUMsV0FBVztBQUFBLFFBQ2xDLFVBQVUsU0FBUyxRQUFRLElBQUksTUFBTSxHQUFHLFNBQVMsT0FBTztBQUFBLE9BQ3pEO0FBQUEsSUFDSDtBQUFBLEdBQ0Q7QUFBQSxHQUNBLFlBQVk7QUFDZixJQUFJLCtCQUErQixPQUFPLENBQUMsS0FBSyxVQUFVLGdCQUFnQixPQUFPO0FBQUEsRUFDL0UsUUFBUSxNQUFNLE9BQU8sbUJBQW1CLFdBQVc7QUFBQSxFQUNuRCxRQUFRLFlBQVksbUJBQW1CLG9CQUFvQjtBQUFBLEVBQzNELE1BQU0sbUJBQW1CLHNCQUFzQixJQUFJLFNBQVMsRUFBRTtBQUFBLEVBQzlELE1BQU0sZ0JBQWdCLGFBQWEsSUFBSSxTQUFTLEVBQUU7QUFBQSxFQUNsRCxNQUFNLElBQUksSUFBSSxPQUFPLEdBQUc7QUFBQSxFQUN4QixTQUFTLFFBQVEsQ0FBQyxTQUFTLFVBQVU7QUFBQSxJQUNuQyxNQUFNLHNCQUFzQixlQUMxQixPQUNBLG1CQUFtQixrQkFBa0IsbUJBQ3JDLGFBQ0Y7QUFBQSxJQUNBLE1BQU0sTUFBTSxVQUFVLElBQUksUUFBUSxJQUFJLEdBQUc7QUFBQSxJQUN6QyxJQUFJLFFBQWEsV0FBRztBQUFBLE1BQ2xCLE1BQU0sSUFBSSxNQUFNLGlDQUFpQyxRQUFRLE1BQU07QUFBQSxJQUNqRTtBQUFBLElBQ0EsTUFBTSxTQUFTLFFBQVEsUUFBUSxRQUFRLE9BQU8sTUFBTSxtQkFBbUIsTUFBTSwrQkFBK0IsSUFBSSxJQUFJLE1BQU07QUFBQSxJQUMxSCxNQUFNLE9BQU8sRUFBRSxPQUFPLE1BQU07QUFBQSxJQUM1QixLQUFLLEtBQUssTUFBTSxDQUFDO0FBQUEsSUFDakIsS0FBSyxLQUFLLE1BQU0sTUFBTTtBQUFBLElBQ3RCLEtBQUssS0FBSyxNQUFNLE1BQU07QUFBQSxJQUN0QixLQUFLLEtBQUssTUFBTSxNQUFNO0FBQUEsSUFDdEIsS0FBSyxLQUFLLFNBQVMsa0JBQWtCLG1CQUFtQjtBQUFBLElBQ3hELElBQUksUUFBUSxNQUFNO0FBQUEsTUFDaEIsS0FBSyxLQUFLLE1BQU0sVUFBVTtBQUFBLE1BQzFCLEtBQUssS0FBSyxNQUFNLEdBQUc7QUFBQSxNQUNuQixLQUFLLEtBQUssTUFBTSxNQUFNO0FBQUEsTUFDdEIsS0FBSyxLQUFLLE1BQU0sR0FBRztBQUFBLElBQ3JCLEVBQU8sU0FBSSxRQUFRLE1BQU07QUFBQSxNQUN2QixLQUFLLEtBQUssTUFBTSxNQUFNO0FBQUEsTUFDdEIsS0FBSyxLQUFLLE1BQU0sR0FBRztBQUFBLE1BQ25CLEtBQUssS0FBSyxNQUFNLFVBQVU7QUFBQSxNQUMxQixLQUFLLEtBQUssTUFBTSxHQUFHO0FBQUEsSUFDckI7QUFBQSxJQUNBLE1BQU0sS0FBSyxNQUFNO0FBQUEsSUFDakIsTUFBTSxPQUFPLFFBQVE7QUFBQSxJQUNyQixNQUFNLGVBQWUsU0FBUyxJQUFJO0FBQUEsSUFDbEMsTUFBTSxNQUFNLEVBQUUsT0FBTyxNQUFNO0FBQUEsSUFDM0IsTUFBTSxjQUFjLEVBQUUsT0FBTyxHQUFHLEVBQUUsS0FBSyxTQUFTLGFBQWE7QUFBQSxJQUM3RCxNQUFNLFFBQVEsWUFBWSxPQUFPLEdBQUcsRUFBRSxLQUFLLFNBQVMsdUJBQXVCLG1CQUFtQjtBQUFBLElBQzlGLE1BQU0sS0FBSyxFQUFFLFlBQVksWUFBWTtBQUFBLElBQ3JDLE1BQU0sT0FBTyxhQUFhLFFBQVE7QUFBQSxJQUNsQyxNQUFNLGVBQWUsbUJBQW1CLElBQUk7QUFBQSxJQUM1QyxNQUFNLGdCQUFnQixtQkFBbUIsS0FBSztBQUFBLElBQzlDLE1BQU0sZ0JBQWdCLG1CQUFtQiwrQkFBK0I7QUFBQSxJQUN4RSxJQUFJLFNBQVMsT0FBTztBQUFBLE1BQ2xCLElBQUksS0FBSyxhQUFhLEtBQUs7QUFBQSxJQUM3QjtBQUFBLElBQ0EsSUFBSSxLQUFLLFNBQVMseUJBQXlCLG1CQUFtQixFQUFFLEtBQzlELFNBQ0EsU0FBUyxRQUFRLFVBQVUsbUJBQW1CLFFBQVEsb0JBQW9CLGVBQWUsRUFDM0YsRUFBRSxLQUFLLE1BQU0sWUFBWSxFQUFFLEtBQUssTUFBTSxZQUFZLEVBQUUsS0FBSyxLQUFLLENBQUMsS0FBSyxRQUFRLEtBQUssZUFBZSxzQkFBc0IsT0FBTyxLQUFLLEVBQUUsRUFBRSxLQUFLLEtBQUssQ0FBQyxLQUFLLFNBQVMsSUFBSSxFQUFFLEVBQUUsS0FBSyxTQUFTLEtBQUssUUFBUSxLQUFLLGFBQWEsRUFBRSxLQUFLLFVBQVUsS0FBSyxTQUFTLElBQUksYUFBYTtBQUFBLElBQ3BRLE1BQU0sS0FDSixhQUNBLGdCQUFnQixDQUFDLEtBQUssUUFBUSxNQUFNLGVBQWUsc0JBQXNCLE9BQU8sS0FBSyxLQUFLLGdCQUFnQixLQUFLLFFBQVEsU0FBUyxLQUFLLFNBQVMsSUFBSSxLQUFLLEdBQ3pKO0FBQUEsSUFDQSxJQUFJLFFBQVEsTUFBTTtBQUFBLE1BQ2hCLElBQUksS0FBSyxLQUFLLE1BQU0sS0FBSyxRQUFRLElBQUksRUFBRSxFQUFFLEtBQUssS0FBSyxDQUFDO0FBQUEsTUFDcEQsTUFBTSxLQUFLLGFBQWEsZ0JBQWdCLE1BQU0sS0FBSyxRQUFRLElBQUksS0FBSyxNQUFNO0FBQUEsTUFDMUUsSUFBSSxrQkFBa0I7QUFBQSxRQUNwQixJQUFJLEtBQUssYUFBYSxhQUFhLENBQUMsZ0JBQWdCLElBQUksTUFBTSxDQUFDLGdCQUFnQixLQUFLO0FBQUEsUUFDcEYsTUFBTSxLQUNKLGFBQ0EsZ0JBQWdCLE1BQU0sS0FBSyxRQUFRLElBQUksS0FBSyxRQUFRLENBQUMsZ0JBQWdCLElBQUksS0FBSyxHQUNoRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLEVBQU8sU0FBSSxRQUFRLE1BQU07QUFBQSxNQUN2QixJQUFJLEtBQUssS0FBSyxNQUFNLEtBQUssUUFBUSxJQUFJLEVBQUUsRUFBRSxLQUFLLEtBQUssTUFBTTtBQUFBLE1BQ3pELE1BQU0sS0FBSyxhQUFhLGdCQUFnQixNQUFNLEtBQUssUUFBUSxJQUFJLEtBQUssT0FBTyxTQUFTLEdBQUc7QUFBQSxNQUN2RixJQUFJLGtCQUFrQjtBQUFBLFFBQ3BCLElBQUksS0FBSyxhQUFhLGFBQWEsQ0FBQyxnQkFBZ0IsSUFBSSxNQUFNLGdCQUFnQixLQUFLO0FBQUEsUUFDbkYsTUFBTSxLQUNKLGFBQ0EsZ0JBQWdCLE1BQU0sS0FBSyxRQUFRLElBQUksS0FBSyxRQUFRLFNBQVMsZ0JBQWdCLElBQUksS0FBSyxHQUN4RjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLEVBQU87QUFBQSxNQUNMLElBQUksS0FBSyxhQUFhLHFCQUFxQixTQUFTLEtBQUssZ0JBQWdCLEtBQUssR0FBRztBQUFBO0FBQUEsR0FFcEY7QUFBQSxHQUNBLGNBQWM7QUFDakIsSUFBSSxvQ0FBb0MsT0FBTyxRQUFRLENBQUMsTUFBTSxLQUFLLE9BQU8sTUFBTSxtQkFBbUI7QUFBQSxFQUNqRyxVQUFVLElBQUksTUFBTSxFQUFFLEtBQUssTUFBTSxDQUFDO0FBQUEsRUFDbEMsT0FBTyxNQUFNLG9CQUFvQixLQUFLLE1BQU0sUUFBUSxRQUFRLFFBQVEsT0FBTyxLQUFLLFFBQVEsSUFBSTtBQUFBLEVBQzVGLE9BQU87QUFBQSxHQUNOLG1CQUFtQjtBQUN0QixJQUFJLHVCQUF1QixPQUFPLFFBQVEsQ0FBQyxLQUFLLElBQUksS0FBSyxTQUFTO0FBQUEsRUFDaEUsT0FBTztBQUFBLEVBQ1AsSUFBSSxNQUFNLHdCQUF3QixNQUFNO0FBQUEsR0FBTSxPQUFPLElBQUksR0FBRztBQUFBLEVBQzVELE1BQU0sTUFBTSxRQUFRO0FBQUEsRUFDcEIsSUFBSSxDQUFDLElBQUksV0FBVztBQUFBLElBQ2xCLElBQUksTUFBTSx5Q0FBeUM7QUFBQSxJQUNuRDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU0saUJBQWlCLElBQUksVUFBVTtBQUFBLEVBQ3JDLE1BQU0sb0JBQW9CLGVBQWUscUJBQXFCO0FBQUEsRUFDOUQsaUJBQWlCLElBQUksV0FBVztBQUFBLEVBQ2hDLE1BQU0sV0FBVyxJQUFJLHNCQUFzQjtBQUFBLEVBQzNDLE1BQU0sSUFBSSxhQUFhO0FBQUEsRUFDdkIsTUFBTSxXQUFXLGVBQU8sUUFBUSxNQUFNO0FBQUEsRUFDdEMsUUFBUSxNQUFNLE9BQU8sbUJBQW1CLFdBQVc7QUFBQSxFQUNuRCxRQUFRLGFBQWEsZUFBZSxjQUFjLGdCQUFnQjtBQUFBLEVBQ2xFLElBQUksYUFBYTtBQUFBLElBQ2YsTUFBTSxXQUFXLFNBQVMsT0FBTyxNQUFNLEVBQUUsT0FBTyxnQkFBZ0IsRUFBRSxLQUFLLE1BQU0sS0FBSyxXQUFXLEVBQUUsS0FBSyxpQkFBaUIsbUJBQW1CLEVBQUUsS0FBSyxNQUFNLElBQUksRUFBRSxLQUFLLE1BQU0sSUFBSSxFQUFFLEtBQUssTUFBTSxNQUFNLEVBQUUsS0FBSyxNQUFNLElBQUk7QUFBQSxJQUM5TSxTQUFTLE9BQU8sTUFBTSxFQUFFLEtBQUssVUFBVSxJQUFJLEVBQUUsS0FBSyxjQUFjLGFBQWEsRUFBRSxLQUFLLGdCQUFnQixDQUFDO0FBQUEsSUFDckcsU0FBUyxPQUFPLE1BQU0sRUFBRSxLQUFLLFVBQVUsTUFBTSxFQUFFLEtBQUssY0FBYyxZQUFZLEVBQUUsS0FBSyxnQkFBZ0IsQ0FBQztBQUFBLEVBQ3hHO0FBQUEsRUFDQSxJQUFJLFNBQVMsU0FBUyxzQkFBc0IsSUFBSSxTQUFTLEVBQUUsR0FBRztBQUFBLElBQzVELFNBQVMsT0FBTyxNQUFNLEVBQUUsT0FBTyxRQUFRLEVBQUUsS0FBSyxNQUFNLEtBQUssY0FBYyxFQUFFLEtBQUssVUFBVSxNQUFNLEVBQUUsS0FBSyxTQUFTLE1BQU0sRUFBRSxPQUFPLGNBQWMsRUFBRSxLQUFLLE1BQU0sR0FBRyxFQUFFLEtBQUssTUFBTSxHQUFHLEVBQUUsS0FBSyxnQkFBZ0IsQ0FBQyxFQUFFLEtBQUssaUJBQWlCLE1BQU0sRUFBRSxLQUFLLGVBQWUsV0FBVztBQUFBLEVBQ3BRO0FBQUEsRUFDQSxJQUFJLE1BQU07QUFBQSxFQUNWLFNBQVMsUUFBUSxDQUFDLFNBQVMsVUFBVTtBQUFBLElBQ25DLE1BQU0sZUFBZSxTQUFTLFFBQVEsSUFBSTtBQUFBLElBQzFDLE1BQU0sSUFBSSxTQUFTLE9BQU8sR0FBRztBQUFBLElBQzdCLE1BQU0sY0FBYyxFQUFFLE9BQU8sR0FBRyxFQUFFLEtBQUssU0FBUyxhQUFhO0FBQUEsSUFDN0QsTUFBTSxRQUFRLFlBQVksT0FBTyxHQUFHLEVBQUUsS0FBSyxTQUFTLG9CQUFvQjtBQUFBLElBQ3hFLE1BQU0sS0FBSyxHQUFHLFlBQVksWUFBWTtBQUFBLElBQ3RDLE1BQU0sT0FBTyxhQUFhLFFBQVE7QUFBQSxJQUNsQyxNQUFNLGtCQUFrQixRQUFRLE1BQU0sS0FBSyxPQUFPLE1BQU0saUJBQWlCO0FBQUEsSUFDekUsTUFBTSxPQUFPO0FBQUEsSUFDYixZQUFZLE9BQU87QUFBQSxJQUNuQixFQUFFLE9BQU87QUFBQSxHQUNWO0FBQUEsRUFDRCxZQUFZLFVBQVUsZ0JBQWdCLE9BQU8sY0FBYztBQUFBLEVBQzNELElBQUksZUFBZSxjQUFjO0FBQUEsSUFDL0IsYUFBYSxVQUFVLFVBQVUsZ0JBQWdCLEVBQUU7QUFBQSxFQUNyRDtBQUFBLEVBQ0EsV0FBVyxVQUFVLGNBQWM7QUFBQSxFQUNuQyxZQUFZLFVBQVUsZ0JBQWdCLE1BQU0sY0FBYztBQUFBLEVBQzFELGNBQWMsWUFDWixVQUNBLGdCQUNBLGVBQWUsa0JBQWtCLEdBQ2pDLElBQUksZ0JBQWdCLENBQ3RCO0FBQUEsRUFDQSxtQkFBdUIsV0FBRyxVQUFVLGVBQWUsZ0JBQWdCLGVBQWUsV0FBVztBQUFBLEdBQzVGLE1BQU07QUFDVCxJQUFJLDJCQUEyQjtBQUFBLEVBQzdCO0FBQ0Y7QUFDQSxJQUFTLFdBQUcsQ0E2WFo7QUFHQSxJQUFJLHdCQUF3QjtBQUM1QixJQUFJLHlDQUF5QyxJQUFJLElBQUksQ0FBQyxTQUFTLGNBQWMsZUFBZSxrQkFBa0IsQ0FBQztBQUMvRyxJQUFJLGdDQUFnQyxJQUFJLElBQUksQ0FBQyxlQUFlLGtCQUFrQixDQUFDO0FBQy9FLElBQUksNkJBQTZCLElBQUksSUFBSSxDQUFDLE9BQU8sVUFBVSxDQUFDO0FBQzVELElBQUksK0JBQStCLElBQUksSUFBSSxDQUFDLFFBQVEsY0FBYyxvQkFBb0IsVUFBVSxDQUFDO0FBQ2pHLElBQUksdUNBQXVDLElBQUksSUFBSTtBQUFBLEVBQ2pEO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRixDQUFDO0FBQ0QsSUFBSSxzQ0FBc0MsT0FBTyxDQUFDLFlBQVk7QUFBQSxFQUM1RCxRQUFRLFVBQVU7QUFBQSxFQUNsQixJQUFJLFdBQVc7QUFBQSxFQUNmLElBQUksUUFBUSxlQUFlLE9BQU87QUFBQSxJQUNoQyxTQUFTLElBQUksRUFBRyxJQUFJLFFBQVEsbUJBQW1CLEtBQUs7QUFBQSxNQUNsRCxZQUFZO0FBQUEsY0FDSixjQUFjLFFBQVEsd0JBQXdCLGtDQUFrQyxRQUFRO0FBQUE7QUFBQSxJQUVsRztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxHQUNOLHFCQUFxQjtBQUN4QixJQUFJLDJCQUEyQixPQUFPLENBQUMsWUFBWTtBQUFBLEVBQ2pELE1BQU0sU0FBUyxVQUFVO0FBQUEsRUFDekIsUUFBUSxPQUFPLG1CQUFtQjtBQUFBLEVBQ2xDLFFBQVEscUJBQXFCO0FBQUEsRUFDN0IsTUFBTSxtQkFBbUIsdUJBQXVCLElBQUksS0FBSztBQUFBLEVBQ3pELElBQUksV0FBVyxJQUFJLEtBQUssR0FBRztBQUFBLElBQ3pCLElBQUksV0FBVztBQUFBLElBQ2YsU0FBUyxJQUFJLEVBQUcsSUFBSSxRQUFRLG1CQUFtQixLQUFLO0FBQUEsTUFDbEQsSUFBSSxNQUFNLEdBQUc7QUFBQSxRQUNYLFlBQVk7QUFBQSx1QkFDRyxhQUFhLFFBQVE7QUFBQSxpQkFDM0IsZUFBZSxRQUFRO0FBQUEsMkJBQ2IsZUFBZSxRQUFRLHFCQUFxQixRQUFRO0FBQUEsZ0JBQy9ELGVBQWUsUUFBUTtBQUFBLGtDQUNMLFFBQVE7QUFBQSw2QkFDYixlQUFlLFFBQVE7QUFBQSxVQUMxQyxvQkFBb0IsT0FBTztBQUFBLE1BQy9CLEVBQU87QUFBQSxRQUNMLE1BQU0sS0FBSyxJQUFJO0FBQUEsUUFDZixZQUFZO0FBQUEsdUJBQ0csYUFBYSxRQUFRLG1CQUFtQjtBQUFBLGlCQUM5QyxlQUFlLFFBQVEsUUFBUSxjQUFjLFFBQVEsUUFBUTtBQUFBLDJCQUNuRCxlQUFlLFFBQVEsV0FBVyxjQUFjLFFBQVEsV0FBVztBQUFBLGdCQUM5RSxlQUFlLFFBQVEsUUFBUTtBQUFBO0FBQUE7QUFBQSxJQUczQztBQUFBLElBQ0EsT0FBTztBQUFBLEVBQ1QsRUFBTyxTQUFJLENBQUMsY0FBYyxJQUFJLEtBQUssR0FBRztBQUFBLElBQ3BDLElBQUksV0FBVztBQUFBLElBQ2YsU0FBUyxJQUFJLEVBQUcsSUFBSSxRQUFRLG1CQUFtQixLQUFLO0FBQUEsTUFDbEQsWUFBWTtBQUFBLHVCQUNLLGFBQWEsUUFBUSxlQUFlLG1CQUFtQixlQUFlLFFBQVEsbUJBQW1CO0FBQUEsaUJBQ3ZHLGVBQWUsUUFBUTtBQUFBLDJCQUNiLGVBQWUsUUFBUSxxQkFBcUIsUUFBUTtBQUFBLGdCQUMvRCxjQUFjLFFBQVEsb0JBQW9CLFFBQVEsNkJBQTZCLFFBQVEsZ0JBQWdCLG1CQUFtQixlQUFlLFFBQVEsbUJBQW1CO0FBQUEsZ0JBQ3BLLGVBQWUsUUFBUTtBQUFBLGtDQUNMLFFBQVE7QUFBQSw2QkFDYixlQUFlLFFBQVE7QUFBQTtBQUFBLElBRWhEO0FBQUEsSUFDQSxPQUFPO0FBQUEsRUFDVCxFQUFPO0FBQUEsSUFDTCxJQUFJLFdBQVc7QUFBQSxJQUNmLFNBQVMsSUFBSSxFQUFHLElBQUksUUFBUSxtQkFBbUIsS0FBSztBQUFBLE1BQ2xELElBQUksTUFBTSxHQUFHO0FBQUEsUUFDWCxZQUFZO0FBQUEsdUJBQ0csYUFBYSxRQUFRLGVBQWUsbUJBQW1CLGVBQWUsUUFBUSxtQkFBbUI7QUFBQSxpQkFDdkcsZUFBZSxRQUFRO0FBQUEsMkJBQ2IsZUFBZSxRQUFRLHFCQUFxQixRQUFRO0FBQUEsZ0JBQy9ELGNBQWMsUUFBUSxvQkFBb0IsUUFBUSw2QkFBNkIsUUFBUSxnQkFBZ0IsbUJBQW1CLGVBQWUsUUFBUSxtQkFBbUI7QUFBQSxnQkFDcEssZUFBZSxRQUFRO0FBQUEsa0NBQ0wsUUFBUTtBQUFBO0FBQUEsTUFFcEMsRUFBTztBQUFBLFFBQ0wsTUFBTSxhQUFhLElBQUksaUJBQWlCO0FBQUEsUUFDeEMsWUFBWTtBQUFBLHVCQUNHLGFBQWEsUUFBUSxlQUFlLG1CQUFtQixlQUFlLFFBQVEsbUJBQW1CO0FBQUEsaUJBQ3ZHLGVBQWUsaUJBQWlCLHNCQUFzQixpQkFBaUI7QUFBQSwyQkFDN0QsZUFBZSxpQkFBaUIsc0JBQXNCLGlCQUFpQjtBQUFBLGdCQUNsRixjQUFjLGFBQWEsSUFBSSxLQUFLLElBQUksUUFBUSxVQUFVLGlCQUFpQix3QkFBd0IsaUJBQWlCLCtCQUErQixRQUFRO0FBQUEsZ0JBQzNKLGVBQWUsaUJBQWlCO0FBQUE7QUFBQTtBQUFBLElBRzVDO0FBQUEsSUFDQSxPQUFPO0FBQUE7QUFBQSxHQUVSLFVBQVU7QUFDYixJQUFJLDhCQUE4QixPQUFPLENBQUMsWUFBWTtBQUFBLEVBQ3BELE9BQU8sR0FBRyxNQUFNLEtBQUssRUFBRSxRQUFRLFFBQVEsa0JBQWtCLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNO0FBQUEsSUFDbEYsTUFBTSxLQUFLLElBQUk7QUFBQSxJQUNmLE9BQU87QUFBQSx1QkFDWSxhQUFhLFFBQVEsbUJBQW1CO0FBQUEsaUJBQzlDLGVBQWUsUUFBUSxRQUFRLGNBQWMsUUFBUSxRQUFRO0FBQUEsMkJBQ25ELGVBQWUsUUFBUSxXQUFXLGNBQWMsUUFBUSxXQUFXO0FBQUEsZ0JBQzlFLGNBQWMsUUFBUSxRQUFRO0FBQUEsZ0JBQzlCLGVBQWUsUUFBUSxRQUFRO0FBQUE7QUFBQSxHQUU1QyxFQUFFLEtBQUs7QUFBQSxDQUFJO0FBQUEsR0FDWCxhQUFhO0FBQ2hCLElBQUksNEJBQTRCLE9BQU8sQ0FBQyxZQUFZO0FBQUEsRUFDbEQsTUFBTSxTQUFTLFVBQVU7QUFBQSxFQUN6QixRQUFRLFVBQVU7QUFBQSxFQUNsQixNQUFNLGlCQUFpQixxQkFBcUIsSUFBSSxLQUFLO0FBQUEsRUFDckQsT0FBTztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBVUwsaUJBQWlCLFNBQVMsT0FBTyxJQUFJLFlBQVksT0FBTztBQUFBO0FBQUE7QUFBQSxvQkFHeEMsUUFBUTtBQUFBLGNBQ2QsUUFBUSxtQkFBbUIsUUFBUTtBQUFBLHlCQUN4QixpQkFBaUIsUUFBUTtBQUFBO0FBQUEsK0JBRW5CLFFBQVEsOEJBQThCLGlCQUFpQixRQUFRLGFBQWEsUUFBUSxxQkFBcUIsaUJBQWlCLGVBQWUsUUFBUSxvQkFBb0I7QUFBQSxtQ0FDakssUUFBUSw4QkFBOEIsaUJBQWlCLGdCQUFnQixRQUFRLG1DQUFtQyxpQkFBaUIsS0FBSztBQUFBLDRCQUMvSSxRQUFRLDJCQUEyQixRQUFRO0FBQUEsMkJBQzVDLGlCQUFpQixRQUFRLFVBQVUsUUFBUSwrQkFBK0IsaUJBQWlCLFFBQVEsYUFBYSxRQUFRLG1CQUFtQixpQkFBaUIsVUFBVSxRQUFRLGVBQWU7QUFBQSxzQkFDbE0sUUFBUTtBQUFBO0FBQUE7QUFBQSxjQUdoQixpQkFBaUIsUUFBUSxVQUFVLFFBQVE7QUFBQSxZQUM3QyxpQkFBaUIsUUFBUSxVQUFVLFFBQVE7QUFBQTtBQUFBO0FBQUEsY0FHekMsaUJBQWlCLFFBQVEsVUFBVSxRQUFRO0FBQUEsWUFDN0MsaUJBQWlCLFFBQVEsVUFBVSxRQUFRO0FBQUEsb0JBQ25DLGlCQUFpQixRQUFRLGNBQWM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGNBSzdDLGlCQUFpQixRQUFRLFVBQVUsUUFBUTtBQUFBLFlBQzdDLGlCQUFpQixRQUFRLFVBQVUsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsb0JBS25DLHVCQUF1QixJQUFJLEtBQUssSUFBSSxRQUFRLGNBQWM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQU9sRSxRQUFRO0FBQUE7QUFBQTtBQUFBLEdBR2pCLFdBQVc7QUFDZCxJQUFJLGlCQUFpQjtBQUdyQixJQUFJLFVBQVU7QUFBQSxFQUNaO0FBQUEsRUFDQTtBQUFBLEVBQ0EsVUFBVTtBQUFBLEVBQ1YsUUFBUTtBQUNWOyIsCiAgImRlYnVnSWQiOiAiMzIyOUE1RTg4MzNCNkFCMDY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
