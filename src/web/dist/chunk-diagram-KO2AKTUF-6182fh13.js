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
  calculateTextDimensions,
  cleanAndMerge,
  wrapLabel
} from "./chunk-main-vvfzntzy.js";
import"./chunk-main-ck580f0k.js";
import {
  clear,
  defaultConfig_default,
  getAccDescription,
  getAccTitle,
  getConfig,
  getConfig2,
  getDiagramTitle,
  sanitizeText,
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
import {
  isEmResetFrame
} from "./chunk-main-rxe1mr61.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/diagram-KO2AKTUF.mjs
var PositionFrameKind = "position frame";
var FramePositionedKind = "frame positioned";
var PositionRelationKind = "position relation";
var RelationPositionedKind = "relation positioned";
var setOptions = /* @__PURE__ */ __name(function(_rawOptString) {
  log.debug("options str", _rawOptString);
}, "setOptions");
var getOptions = /* @__PURE__ */ __name(function() {
  return {};
}, "getOptions");
var clear2 = /* @__PURE__ */ __name(function() {
  reset();
  clear();
}, "clear");
function reset() {
  store = {};
}
__name(reset, "reset");
var DEFAULT_EVENTMODELING_CONFIG = defaultConfig_default.eventmodeling;
var getConfig3 = /* @__PURE__ */ __name(() => {
  const config = cleanAndMerge({
    ...DEFAULT_EVENTMODELING_CONFIG,
    ...getConfig().eventmodeling
  });
  return config;
}, "getConfig");
var store = {};
function getState() {
  let state = initial;
  const { ast } = store;
  const diagramProps2 = getDiagramProps();
  if (!ast) {
    throw new Error("No data for EventModel");
  }
  ast.frames.forEach((frame, index) => {
    const textProps = calculateTextProps(frame, ast.dataEntities, diagramProps2);
    state = dispatch(state, {
      $kind: PositionFrameKind,
      index,
      frame,
      textProps
    });
    let sourceFrames = undefined;
    if (hasSourceFrame(frame)) {
      log.debug(`source frame`, frame.sourceFrames);
      sourceFrames = ast.frames.filter((currentFrame) => {
        return frame.sourceFrames.some((sf) => sf.$refText === currentFrame.name);
      });
      sourceFrames.forEach((sourceFrame) => {
        state = dispatch(state, {
          $kind: PositionRelationKind,
          index,
          frame,
          sourceFrame
        });
      });
    } else {
      state = dispatch(state, {
        $kind: PositionRelationKind,
        index,
        frame
      });
    }
  });
  state = {
    ...state,
    sortedSwimlanesArray: sortedSwimlanesArray(state.swimlanes)
  };
  return state;
}
__name(getState, "getState");
function setAst(ast) {
  store.ast = ast;
}
__name(setAst, "setAst");
var diagramProps = {
  swimlaneMinHeight: 70,
  swimlanePadding: 15,
  swimlaneGap: 10,
  boxPadding: 10,
  boxOverlap: 90,
  boxDefaultY: 0,
  boxMinWidth: 80,
  boxMaxWidth: 450,
  boxMinHeight: 80,
  boxMaxHeight: 750,
  contentStartX: 250,
  textMaxWidth: 450 - 2 * 10,
  boxTextFontWeight: "bold",
  boxTextPadding: 10,
  swimlaneTextFontWeight: "bold",
  labelUiAutomation: "UI/Automation",
  labelUiAutomationPrefix: "UI/A: ",
  labelCommandReadModel: "Command/Read Model",
  labelCommandReadModelPrefix: "C/RM: ",
  labelEvents: "Events",
  labelEventsPrefix: "Stream: "
};
function getDiagramProps() {
  return diagramProps;
}
__name(getDiagramProps, "getDiagramProps");
var initial = {
  boxes: [],
  swimlanes: {},
  relations: [],
  maxR: 0,
  sortedSwimlanesArray: []
};
function extractNamespace(entityIdentifier) {
  const spl = entityIdentifier.split(".");
  if (spl.length === 2) {
    return spl[0];
  }
  return;
}
__name(extractNamespace, "extractNamespace");
function extractName(entityIdentifier) {
  const spl = entityIdentifier.split(".");
  if (spl.length === 2) {
    return spl[1];
  }
  return entityIdentifier;
}
__name(extractName, "extractName");
function findSwimlaneByNamespace(swimlanes, namespace) {
  if (!namespace || namespace.length === 0) {
    return;
  }
  return Object.values(swimlanes).find((swimlane) => swimlane.namespace === namespace);
}
__name(findSwimlaneByNamespace, "findSwimlaneByNamespace");
function findNextAvailableIndex(swimlanes, boundaryMin, boundaryMax) {
  return Math.max(boundaryMin, ...Object.keys(swimlanes).filter((key) => {
    const index = Number.parseInt(key);
    return index > boundaryMin && index < boundaryMax;
  }).map((key) => Number.parseInt(key))) + 1;
}
__name(findNextAvailableIndex, "findNextAvailableIndex");
function calculateSwimlaneProps(frame, swimlanes) {
  const namespace = extractNamespace(frame.entityIdentifier);
  const sw = findSwimlaneByNamespace(swimlanes, namespace);
  switch (frame.modelEntityType) {
    case "ui":
    case "pcr":
    case "processor":
      if (sw) {
        return {
          index: sw.index,
          label: sw.namespace || diagramProps.labelUiAutomation
        };
      } else if (namespace) {
        return {
          index: findNextAvailableIndex(swimlanes, 0, 100),
          label: diagramProps.labelUiAutomationPrefix + namespace
        };
      }
      return { index: 0, label: diagramProps.labelUiAutomation };
    case "rmo":
    case "readmodel":
    case "cmd":
    case "command":
      if (sw) {
        return {
          index: sw.index,
          label: sw.namespace || diagramProps.labelCommandReadModel
        };
      } else if (namespace) {
        return {
          index: findNextAvailableIndex(swimlanes, 100, 200),
          label: diagramProps.labelCommandReadModelPrefix + namespace
        };
      }
      return { index: 100, label: diagramProps.labelCommandReadModel };
    case "evt":
    case "event":
    default:
      if (sw) {
        return {
          index: sw.index,
          label: sw.namespace || diagramProps.labelEvents
        };
      } else if (namespace) {
        return {
          index: findNextAvailableIndex(swimlanes, 200, 300),
          label: diagramProps.labelEventsPrefix + namespace
        };
      }
      return { index: 200, label: diagramProps.labelEvents };
  }
}
__name(calculateSwimlaneProps, "calculateSwimlaneProps");
function calculateEntityVisualProps(frame) {
  const { themeVariables } = getConfig();
  switch (frame.modelEntityType) {
    case "ui":
      return {
        fill: themeVariables.emUiFill ?? "white",
        stroke: themeVariables.emUiStroke ?? "#dbdada"
      };
    case "pcr":
    case "processor":
      return {
        fill: themeVariables.emProcessorFill ?? "#edb3f6",
        stroke: themeVariables.emProcessorStroke ?? "#b88cbf"
      };
    case "rmo":
    case "readmodel":
      return {
        fill: themeVariables.emReadModelFill ?? "#d3f1a2",
        stroke: themeVariables.emReadModelStroke ?? "#a3b732"
      };
    case "cmd":
    case "command":
      return {
        fill: themeVariables.emCommandFill ?? "#bcd6fe",
        stroke: themeVariables.emCommandStroke ?? "#679ac3"
      };
    case "evt":
    case "event":
      return {
        fill: themeVariables.emEventFill ?? "#ffb778",
        stroke: themeVariables.emEventStroke ?? "#c19a0f"
      };
    default:
      return {
        fill: "red",
        stroke: "black"
      };
  }
}
__name(calculateEntityVisualProps, "calculateEntityVisualProps");
function calculateTextProps(frame, dataEntities, diagramProps2) {
  const config = getConfig();
  const name = sanitizeText(extractName(frame.entityIdentifier) ?? "", config);
  let toHtml;
  const wrapLabelConfig = {
    fontSize: 16,
    fontWeight: 700,
    fontFamily: '"trebuchet ms", verdana, arial, sans-serif',
    joinWith: "<br/>"
  };
  const wrappedName = wrapLabel(name, diagramProps2.textMaxWidth, wrapLabelConfig);
  let content = `<b>${wrappedName}</b>`;
  if (frame.dataInlineValue) {
    toHtml = frame.dataInlineValue;
    toHtml = toHtml.substring(toHtml.indexOf("{") + 1);
    toHtml = toHtml.substring(0, toHtml.lastIndexOf("}") - 1);
    toHtml = sanitizeText(toHtml, config);
    toHtml = wrapLabel(toHtml, diagramProps2.textMaxWidth, wrapLabelConfig);
    toHtml = toHtml.replaceAll(" ", "&nbsp;");
  }
  if (frame.dataReference) {
    const dataEntity = dataEntities.find((dataEntity2) => dataEntity2.name === frame.dataReference?.$refText);
    if (dataEntity) {
      toHtml = dataEntity.dataBlockValue;
      toHtml = toHtml.substring(toHtml.indexOf(`{
`) + 2);
      toHtml = toHtml.substring(0, toHtml.lastIndexOf("}") - 1);
      toHtml = sanitizeText(toHtml, config);
      toHtml = wrapLabel(toHtml, diagramProps2.textMaxWidth, wrapLabelConfig);
      toHtml = toHtml.replaceAll(" ", "&nbsp;");
      toHtml += `<br/>`;
    }
  }
  const hasRenderedData = toHtml !== undefined;
  if (hasRenderedData) {
    content += `<br/><br/><code style="text-align: left; display: block;max-width:${diagramProps2.textMaxWidth}px">${toHtml}</code>`;
  }
  const textDimensionConfig = {
    fontSize: wrapLabelConfig.fontSize,
    fontWeight: wrapLabelConfig.fontWeight,
    fontFamily: wrapLabelConfig.fontFamily
  };
  const dimensions = calculateTextDimensions(content, textDimensionConfig);
  const calculatedWidthFix = hasRenderedData ? dimensions.width / 3 : dimensions.width;
  const props = {
    content,
    width: calculatedWidthFix,
    height: dimensions.height
  };
  log.debug(`[${frame.name}] ${frame.entityIdentifier} text`, props);
  return props;
}
__name(calculateTextProps, "calculateTextProps");
function decidePositionFrame(state, _command) {
  const command = _command;
  const visual = calculateEntityVisualProps(command.frame);
  const dimension = {
    width: command.textProps.width + 2 * diagramProps.boxTextPadding,
    height: command.textProps.height + 2 * diagramProps.boxTextPadding
  };
  const event = {
    $kind: FramePositionedKind,
    frame: command.frame,
    index: command.index,
    visual,
    dimension,
    textProps: command.textProps
  };
  return [event];
}
__name(decidePositionFrame, "decidePositionFrame");
function calculateX(swimlane, previousSwimlane, lastBox) {
  if (previousSwimlane === undefined) {
    return diagramProps.contentStartX;
  }
  if (previousSwimlane.index === swimlane.index && swimlane.r) {
    return swimlane.r + diagramProps.boxPadding;
  }
  if (lastBox === undefined) {
    return diagramProps.contentStartX;
  }
  return lastBox.r - diagramProps.boxOverlap + diagramProps.boxPadding;
}
__name(calculateX, "calculateX");
function calculateMaxRight(swimlanes, swimlaneR) {
  const rs = [...swimlanes.map((s) => s.r), swimlaneR];
  return Math.max(...rs);
}
__name(calculateMaxRight, "calculateMaxRight");
function sortedSwimlanesArray(swimlanes) {
  return Object.values(swimlanes).sort((a, b) => a.index - b.index);
}
__name(sortedSwimlanesArray, "sortedSwimlanesArray");
function evolveFramePositioned(state, _event) {
  const event = _event;
  const swimlaneProps = calculateSwimlaneProps(event.frame, state.swimlanes);
  let swimlane;
  if (swimlaneProps.index in state.swimlanes) {
    swimlane = state.swimlanes[swimlaneProps.index];
  } else {
    swimlane = {
      index: swimlaneProps.index,
      label: swimlaneProps.label,
      r: 0,
      y: swimlaneProps.index * diagramProps.swimlaneMinHeight + diagramProps.swimlaneGap,
      height: diagramProps.swimlaneMinHeight,
      maxHeight: diagramProps.swimlaneMinHeight
    };
  }
  const lastBox = state.boxes.length > 0 ? state.boxes[state.boxes.length - 1] : undefined;
  const previousSwimlane = state.previousSwimlaneNumber !== undefined ? state.swimlanes[state.previousSwimlaneNumber] : undefined;
  const dimension = {
    width: Math.max(diagramProps.boxMinWidth, Math.min(diagramProps.boxMaxWidth, event.dimension.width)) + 2 * diagramProps.boxPadding,
    height: Math.max(diagramProps.boxMinHeight, Math.min(diagramProps.boxMaxHeight, event.dimension.height)) + 2 * diagramProps.boxPadding
  };
  const x = calculateX(swimlane, previousSwimlane, lastBox);
  const r = x + dimension.width + diagramProps.boxPadding;
  const maxR = calculateMaxRight(Object.values(state.swimlanes), r);
  swimlane.r = x + dimension.width;
  swimlane.maxHeight = Math.max(swimlane.maxHeight, dimension.height);
  swimlane.height = Math.max(diagramProps.swimlaneMinHeight, swimlane.maxHeight) + 2 * diagramProps.swimlanePadding;
  const box = {
    x,
    y: diagramProps.swimlanePadding + swimlane.y,
    r,
    dimension,
    leftSibling: false,
    swimlane,
    visual: event.visual,
    text: event.textProps.content,
    frame: event.frame,
    index: event.index
  };
  const newState = {
    ...state,
    boxes: [...state.boxes, box],
    swimlanes: {
      ...state.swimlanes,
      [`${swimlane.index}`]: swimlane
    },
    previousSwimlaneNumber: swimlaneProps.index,
    previousFrame: event.frame,
    maxR
  };
  const swimlanes = sortedSwimlanesArray(newState.swimlanes);
  if (swimlanes.length > 0) {
    swimlanes[0].y = 0;
  }
  for (let i = 1;i < swimlanes.length; i++) {
    const sw = swimlanes[i];
    const prevSw = swimlanes[i - 1];
    sw.y = prevSw.y + prevSw.height + diagramProps.swimlaneGap;
  }
  return newState;
}
__name(evolveFramePositioned, "evolveFramePositioned");
function isFirstFrame(index, frame) {
  if (index === 0 && frame.sourceFrames.length === 0) {
    return true;
  }
  return false;
}
__name(isFirstFrame, "isFirstFrame");
function hasSourceFrame(frame) {
  return frame.sourceFrames !== undefined && frame.sourceFrames !== null && frame.sourceFrames.length > 0;
}
__name(hasSourceFrame, "hasSourceFrame");
function findBoxByFrame(boxes, frame) {
  if (frame === undefined || frame === null) {
    return;
  }
  return boxes.find((box) => box.frame.name === frame.name);
}
__name(findBoxByFrame, "findBoxByFrame");
function findBoxByLineIndex(boxes, targetSwimlane, lineIndex) {
  if (lineIndex < 0) {
    return;
  }
  for (let i = lineIndex;i >= 0; i--) {
    const box = boxes[i];
    if (box.swimlane.index !== targetSwimlane) {
      return box;
    }
  }
  return;
}
__name(findBoxByLineIndex, "findBoxByLineIndex");
function decidePositionRelation(state, _command) {
  const command = _command;
  if (isEmResetFrame(command.frame) || isFirstFrame(command.index, command.frame)) {
    return [];
  }
  const targetBox = findBoxByFrame(state.boxes, command.frame);
  if (targetBox === undefined) {
    throw new Error(`Target box not found for frame ${command.frame.name}`);
  }
  let sourceBox;
  if (command.sourceFrame) {
    sourceBox = findBoxByFrame(state.boxes, command.sourceFrame);
  } else {
    sourceBox = findBoxByLineIndex(state.boxes, targetBox.swimlane.index, command.index - 1);
  }
  if (sourceBox === undefined) {
    return [];
  }
  const event = {
    $kind: RelationPositionedKind,
    frame: command.frame,
    index: command.index,
    sourceBox,
    targetBox
  };
  return [event];
}
__name(decidePositionRelation, "decidePositionRelation");
function evolveRelationPositioned(state, _event) {
  const event = _event;
  const relation = {
    visual: {
      fill: "none",
      stroke: "#000"
    },
    source: {
      x: event.sourceBox.x,
      y: event.sourceBox.y
    },
    target: {
      x: event.targetBox.x,
      y: event.targetBox.y
    },
    sourceBox: event.sourceBox,
    targetBox: event.targetBox
  };
  const newState = {
    ...state,
    relations: [...state.relations, relation]
  };
  return newState;
}
__name(evolveRelationPositioned, "evolveRelationPositioned");
var deciders = {
  [PositionFrameKind]: decidePositionFrame,
  [PositionRelationKind]: decidePositionRelation
};
var evolvers = {
  [FramePositionedKind]: evolveFramePositioned,
  [RelationPositionedKind]: evolveRelationPositioned
};
function decide(state, command) {
  const fn = deciders[command.$kind];
  if (fn === undefined || fn === null) {
    return [];
  }
  const events = fn(state, command);
  log.debug(`decided events`, events);
  return events;
}
__name(decide, "decide");
function evolve(state, events) {
  const newState = events.reduce((previousState, event) => {
    const fn = evolvers[event.$kind];
    if (fn === undefined || fn === null) {
      return previousState;
    }
    return fn(previousState, event);
  }, state);
  log.debug(`evolve events`, { state, newState, events });
  return newState;
}
__name(evolve, "evolve");
function dispatch(state, command) {
  const events = decide(state, command);
  const newState = evolve(state, events);
  return newState;
}
__name(dispatch, "dispatch");
var db = {
  getConfig: getConfig3,
  setOptions,
  getOptions,
  clear: clear2,
  setAccTitle,
  getAccTitle,
  getAccDescription,
  setAccDescription,
  setDiagramTitle,
  getDiagramTitle,
  setAst,
  getDiagramProps,
  getState
};
var parser = {
  parse: /* @__PURE__ */ __name(async (input) => {
    const ast = await parse("eventmodeling", input);
    log.debug(ast);
    db.setAst(ast);
    populateCommonDb(ast, db);
  }, "parse")
};
if (undefined) {}
var DEFAULT_CONFIG = getConfig2();
var DEFAULT_EVENTMODELING_CONFIG2 = DEFAULT_CONFIG?.eventmodeling;
function renderD3Box(diagram2, diagramProps2) {
  return (box) => {
    const y = box.swimlane.y + diagramProps2.swimlanePadding;
    const g = diagram2.append("g").attr("class", "em-box");
    g.append("rect").attr("x", box.x).attr("y", y).attr("rx", "3").attr("width", box.dimension.width).attr("height", box.dimension.height).attr("stroke", box.visual.stroke).attr("fill", box.visual.fill);
    const f = g.append("foreignObject").attr("x", box.x + diagramProps2.boxPadding).attr("y", y + 10).attr("width", box.dimension.width - 2 * diagramProps2.boxPadding).attr("height", box.dimension.height - 2 * diagramProps2.boxPadding);
    const text = f.append("xhtml:div").style("display", "table").style("height", "100%").style("width", "100%");
    text.append("span").style("display", "table-cell").style("text-align", "center").style("vertical-align", "middle").html(box.text);
  };
}
__name(renderD3Box, "renderD3Box");
function dirUpwards(sourceY, targetY) {
  return sourceY > targetY;
}
__name(dirUpwards, "dirUpwards");
function renderD3Relation(diagram2, diagramProps2, arrowheadId, themeVariables) {
  return (relation) => {
    const sourceBoxY = relation.sourceBox.swimlane.y + diagramProps2.swimlanePadding;
    const targetBoxY = relation.targetBox.swimlane.y + diagramProps2.swimlanePadding;
    const upwards = dirUpwards(sourceBoxY, targetBoxY);
    const sourceX = relation.sourceBox.x + relation.sourceBox.dimension.width * 2 / 3;
    const targetX = relation.targetBox.x + relation.targetBox.dimension.width / 3;
    let sourceY;
    let targetY;
    log.debug(`rendering relation up=${upwards} for `, {
      sourceBox: relation.sourceBox,
      targetBox: relation.targetBox
    });
    if (upwards) {
      sourceY = sourceBoxY;
      targetY = targetBoxY + relation.targetBox.dimension.height;
    } else {
      sourceY = sourceBoxY + relation.sourceBox.dimension.height;
      targetY = targetBoxY;
    }
    const relationStroke = themeVariables.emRelationStroke ?? relation.visual.stroke;
    diagram2.append("path").attr("class", "em-relation").attr("fill", relation.visual.fill).attr("stroke", relationStroke).attr("stroke-width", "1").attr("marker-end", `url(#${arrowheadId})`).attr("d", `M${sourceX} ${sourceY} L${targetX} ${targetY}`);
  };
}
__name(renderD3Relation, "renderD3Relation");
function renderD3Swimlane(diagram2, maxR, diagramProps2, themeVariables) {
  return (swimlane) => {
    const g = diagram2.append("g").attr("class", "em-swimlane");
    const oddBackground = themeVariables.emSwimlaneBackgroundOdd ?? "rgb(250,250,250)";
    const backgroundStroke = themeVariables.emSwimlaneBackgroundStroke ?? "rgb(240,240,240)";
    g.append("rect").attr("x", 0).attr("y", swimlane.y).attr("rx", "3").attr("width", maxR + diagramProps2.swimlanePadding).attr("height", swimlane.height).attr("fill", oddBackground).attr("stroke", backgroundStroke);
    g.append("text").attr("font-weight", diagramProps2.swimlaneTextFontWeight).attr("x", 30).attr("y", swimlane.y + 30).text(swimlane.label);
  };
}
__name(renderD3Swimlane, "renderD3Swimlane");
var draw = /* @__PURE__ */ __name(function(txt, id, ver, diagObj) {
  log.debug("in eventmodeling renderer", txt + `
`, "id:", id, ver);
  if (!DEFAULT_EVENTMODELING_CONFIG2) {
    throw new Error("EventModeling config not found");
  }
  const db2 = diagObj.db;
  const { themeVariables, eventmodeling: config } = getConfig2();
  const diagram2 = select_default(`[id="${id}"]`);
  const diagramProps2 = db2.getDiagramProps();
  const state = db2.getState();
  const arrowheadId = `em-arrowhead-${id}`;
  const arrowheadColor = themeVariables.emArrowhead ?? "#000000";
  state.sortedSwimlanesArray.forEach(renderD3Swimlane(diagram2, state.maxR, diagramProps2, themeVariables));
  state.boxes.forEach(renderD3Box(diagram2, diagramProps2));
  state.relations.forEach(renderD3Relation(diagram2, diagramProps2, arrowheadId, themeVariables));
  const marker = diagram2.append("defs").append("marker").attr("id", arrowheadId).attr("markerWidth", "10").attr("markerHeight", "7").attr("refX", "10").attr("refY", "3.5").attr("orient", "auto");
  marker.append("polygon").attr("points", "0 0, 10 3.5, 0 7").attr("fill", arrowheadColor);
  setupGraphViewbox2(undefined, diagram2, config?.padding ?? 30, config?.useMaxWidth);
}, "draw");
var renderer_default = {
  draw
};
var getStyles = /* @__PURE__ */ __name((_options) => ``, "getStyles");
var styles_default = getStyles;
var diagram = {
  parser,
  db,
  renderer: renderer_default,
  styles: styles_default
};
export {
  diagram
};

//# debugId=888D5AE08F1A13AC64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2RpYWdyYW0tS08yQUtUVUYubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgImltcG9ydCB7XG4gIHBvcHVsYXRlQ29tbW9uRGJcbn0gZnJvbSBcIi4vY2h1bmstNEJYMlZVQUIubWpzXCI7XG5pbXBvcnQge1xuICBjYWxjdWxhdGVUZXh0RGltZW5zaW9ucyxcbiAgY2xlYW5BbmRNZXJnZSxcbiAgd3JhcExhYmVsXG59IGZyb20gXCIuL2NodW5rLTVaUVlIWEtVLm1qc1wiO1xuaW1wb3J0IHtcbiAgY2xlYXIsXG4gIGRlZmF1bHRDb25maWdfZGVmYXVsdCxcbiAgZ2V0QWNjRGVzY3JpcHRpb24sXG4gIGdldEFjY1RpdGxlLFxuICBnZXRDb25maWcsXG4gIGdldENvbmZpZzIsXG4gIGdldERpYWdyYW1UaXRsZSxcbiAgc2FuaXRpemVUZXh0LFxuICBzZXRBY2NEZXNjcmlwdGlvbixcbiAgc2V0QWNjVGl0bGUsXG4gIHNldERpYWdyYW1UaXRsZSxcbiAgc2V0dXBHcmFwaFZpZXdib3gyIGFzIHNldHVwR3JhcGhWaWV3Ym94XG59IGZyb20gXCIuL2NodW5rLUNTQ0lISzdRLm1qc1wiO1xuaW1wb3J0IHtcbiAgX19uYW1lLFxuICBsb2dcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIHNyYy9kaWFncmFtcy9ldmVudG1vZGVsaW5nL3BhcnNlci50c1xuaW1wb3J0IHsgcGFyc2UgfSBmcm9tIFwiQG1lcm1haWQtanMvcGFyc2VyXCI7XG5cbi8vIHNyYy9kaWFncmFtcy9ldmVudG1vZGVsaW5nL2RiLnRzXG5pbXBvcnQgeyBpc0VtUmVzZXRGcmFtZSB9IGZyb20gXCJAbWVybWFpZC1qcy9wYXJzZXJcIjtcblxuLy8gc3JjL2RpYWdyYW1zL2V2ZW50bW9kZWxpbmcvdHlwZXMudHNcbnZhciBQb3NpdGlvbkZyYW1lS2luZCA9IFwicG9zaXRpb24gZnJhbWVcIjtcbnZhciBGcmFtZVBvc2l0aW9uZWRLaW5kID0gXCJmcmFtZSBwb3NpdGlvbmVkXCI7XG52YXIgUG9zaXRpb25SZWxhdGlvbktpbmQgPSBcInBvc2l0aW9uIHJlbGF0aW9uXCI7XG52YXIgUmVsYXRpb25Qb3NpdGlvbmVkS2luZCA9IFwicmVsYXRpb24gcG9zaXRpb25lZFwiO1xuXG4vLyBzcmMvZGlhZ3JhbXMvZXZlbnRtb2RlbGluZy9kYi50c1xudmFyIHNldE9wdGlvbnMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKF9yYXdPcHRTdHJpbmcpIHtcbiAgbG9nLmRlYnVnKFwib3B0aW9ucyBzdHJcIiwgX3Jhd09wdFN0cmluZyk7XG59LCBcInNldE9wdGlvbnNcIik7XG52YXIgZ2V0T3B0aW9ucyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7fTtcbn0sIFwiZ2V0T3B0aW9uc1wiKTtcbnZhciBjbGVhcjIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICByZXNldCgpO1xuICBjbGVhcigpO1xufSwgXCJjbGVhclwiKTtcbmZ1bmN0aW9uIHJlc2V0KCkge1xuICBzdG9yZSA9IHt9O1xufVxuX19uYW1lKHJlc2V0LCBcInJlc2V0XCIpO1xudmFyIERFRkFVTFRfRVZFTlRNT0RFTElOR19DT05GSUcgPSBkZWZhdWx0Q29uZmlnX2RlZmF1bHQuZXZlbnRtb2RlbGluZztcbnZhciBnZXRDb25maWczID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiB7XG4gIGNvbnN0IGNvbmZpZyA9IGNsZWFuQW5kTWVyZ2Uoe1xuICAgIC4uLkRFRkFVTFRfRVZFTlRNT0RFTElOR19DT05GSUcsXG4gICAgLi4uZ2V0Q29uZmlnKCkuZXZlbnRtb2RlbGluZ1xuICB9KTtcbiAgcmV0dXJuIGNvbmZpZztcbn0sIFwiZ2V0Q29uZmlnXCIpO1xudmFyIHN0b3JlID0ge307XG5mdW5jdGlvbiBnZXRTdGF0ZSgpIHtcbiAgbGV0IHN0YXRlID0gaW5pdGlhbDtcbiAgY29uc3QgeyBhc3QgfSA9IHN0b3JlO1xuICBjb25zdCBkaWFncmFtUHJvcHMyID0gZ2V0RGlhZ3JhbVByb3BzKCk7XG4gIGlmICghYXN0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gZGF0YSBmb3IgRXZlbnRNb2RlbFwiKTtcbiAgfVxuICBhc3QuZnJhbWVzLmZvckVhY2goKGZyYW1lLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IHRleHRQcm9wcyA9IGNhbGN1bGF0ZVRleHRQcm9wcyhmcmFtZSwgYXN0LmRhdGFFbnRpdGllcywgZGlhZ3JhbVByb3BzMik7XG4gICAgc3RhdGUgPSBkaXNwYXRjaChzdGF0ZSwge1xuICAgICAgJGtpbmQ6IFBvc2l0aW9uRnJhbWVLaW5kLFxuICAgICAgaW5kZXgsXG4gICAgICBmcmFtZSxcbiAgICAgIHRleHRQcm9wc1xuICAgIH0pO1xuICAgIGxldCBzb3VyY2VGcmFtZXMgPSB2b2lkIDA7XG4gICAgaWYgKGhhc1NvdXJjZUZyYW1lKGZyYW1lKSkge1xuICAgICAgbG9nLmRlYnVnKGBzb3VyY2UgZnJhbWVgLCBmcmFtZS5zb3VyY2VGcmFtZXMpO1xuICAgICAgc291cmNlRnJhbWVzID0gYXN0LmZyYW1lcy5maWx0ZXIoKGN1cnJlbnRGcmFtZSkgPT4ge1xuICAgICAgICByZXR1cm4gZnJhbWUuc291cmNlRnJhbWVzLnNvbWUoKHNmKSA9PiBzZi4kcmVmVGV4dCA9PT0gY3VycmVudEZyYW1lLm5hbWUpO1xuICAgICAgfSk7XG4gICAgICBzb3VyY2VGcmFtZXMuZm9yRWFjaCgoc291cmNlRnJhbWUpID0+IHtcbiAgICAgICAgc3RhdGUgPSBkaXNwYXRjaChzdGF0ZSwge1xuICAgICAgICAgICRraW5kOiBQb3NpdGlvblJlbGF0aW9uS2luZCxcbiAgICAgICAgICBpbmRleCxcbiAgICAgICAgICBmcmFtZSxcbiAgICAgICAgICBzb3VyY2VGcmFtZVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0ZSA9IGRpc3BhdGNoKHN0YXRlLCB7XG4gICAgICAgICRraW5kOiBQb3NpdGlvblJlbGF0aW9uS2luZCxcbiAgICAgICAgaW5kZXgsXG4gICAgICAgIGZyYW1lXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuICBzdGF0ZSA9IHtcbiAgICAuLi5zdGF0ZSxcbiAgICBzb3J0ZWRTd2ltbGFuZXNBcnJheTogc29ydGVkU3dpbWxhbmVzQXJyYXkoc3RhdGUuc3dpbWxhbmVzKVxuICB9O1xuICByZXR1cm4gc3RhdGU7XG59XG5fX25hbWUoZ2V0U3RhdGUsIFwiZ2V0U3RhdGVcIik7XG5mdW5jdGlvbiBzZXRBc3QoYXN0KSB7XG4gIHN0b3JlLmFzdCA9IGFzdDtcbn1cbl9fbmFtZShzZXRBc3QsIFwic2V0QXN0XCIpO1xudmFyIGRpYWdyYW1Qcm9wcyA9IHtcbiAgc3dpbWxhbmVNaW5IZWlnaHQ6IDcwLFxuICBzd2ltbGFuZVBhZGRpbmc6IDE1LFxuICBzd2ltbGFuZUdhcDogMTAsXG4gIGJveFBhZGRpbmc6IDEwLFxuICBib3hPdmVybGFwOiA5MCxcbiAgYm94RGVmYXVsdFk6IDAsXG4gIGJveE1pbldpZHRoOiA4MCxcbiAgYm94TWF4V2lkdGg6IDQ1MCxcbiAgYm94TWluSGVpZ2h0OiA4MCxcbiAgYm94TWF4SGVpZ2h0OiA3NTAsXG4gIGNvbnRlbnRTdGFydFg6IDI1MCxcbiAgdGV4dE1heFdpZHRoOiA0NTAgLSAyICogMTAsXG4gIGJveFRleHRGb250V2VpZ2h0OiBcImJvbGRcIixcbiAgYm94VGV4dFBhZGRpbmc6IDEwLFxuICBzd2ltbGFuZVRleHRGb250V2VpZ2h0OiBcImJvbGRcIixcbiAgbGFiZWxVaUF1dG9tYXRpb246IFwiVUkvQXV0b21hdGlvblwiLFxuICBsYWJlbFVpQXV0b21hdGlvblByZWZpeDogXCJVSS9BOiBcIixcbiAgbGFiZWxDb21tYW5kUmVhZE1vZGVsOiBcIkNvbW1hbmQvUmVhZCBNb2RlbFwiLFxuICBsYWJlbENvbW1hbmRSZWFkTW9kZWxQcmVmaXg6IFwiQy9STTogXCIsXG4gIGxhYmVsRXZlbnRzOiBcIkV2ZW50c1wiLFxuICBsYWJlbEV2ZW50c1ByZWZpeDogXCJTdHJlYW06IFwiXG59O1xuZnVuY3Rpb24gZ2V0RGlhZ3JhbVByb3BzKCkge1xuICByZXR1cm4gZGlhZ3JhbVByb3BzO1xufVxuX19uYW1lKGdldERpYWdyYW1Qcm9wcywgXCJnZXREaWFncmFtUHJvcHNcIik7XG52YXIgaW5pdGlhbCA9IHtcbiAgYm94ZXM6IFtdLFxuICBzd2ltbGFuZXM6IHt9LFxuICByZWxhdGlvbnM6IFtdLFxuICBtYXhSOiAwLFxuICBzb3J0ZWRTd2ltbGFuZXNBcnJheTogW11cbn07XG5mdW5jdGlvbiBleHRyYWN0TmFtZXNwYWNlKGVudGl0eUlkZW50aWZpZXIpIHtcbiAgY29uc3Qgc3BsID0gZW50aXR5SWRlbnRpZmllci5zcGxpdChcIi5cIik7XG4gIGlmIChzcGwubGVuZ3RoID09PSAyKSB7XG4gICAgcmV0dXJuIHNwbFswXTtcbiAgfVxuICByZXR1cm4gdm9pZCAwO1xufVxuX19uYW1lKGV4dHJhY3ROYW1lc3BhY2UsIFwiZXh0cmFjdE5hbWVzcGFjZVwiKTtcbmZ1bmN0aW9uIGV4dHJhY3ROYW1lKGVudGl0eUlkZW50aWZpZXIpIHtcbiAgY29uc3Qgc3BsID0gZW50aXR5SWRlbnRpZmllci5zcGxpdChcIi5cIik7XG4gIGlmIChzcGwubGVuZ3RoID09PSAyKSB7XG4gICAgcmV0dXJuIHNwbFsxXTtcbiAgfVxuICByZXR1cm4gZW50aXR5SWRlbnRpZmllcjtcbn1cbl9fbmFtZShleHRyYWN0TmFtZSwgXCJleHRyYWN0TmFtZVwiKTtcbmZ1bmN0aW9uIGZpbmRTd2ltbGFuZUJ5TmFtZXNwYWNlKHN3aW1sYW5lcywgbmFtZXNwYWNlKSB7XG4gIGlmICghbmFtZXNwYWNlIHx8IG5hbWVzcGFjZS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdm9pZCAwO1xuICB9XG4gIHJldHVybiBPYmplY3QudmFsdWVzKHN3aW1sYW5lcykuZmluZCgoc3dpbWxhbmUpID0+IHN3aW1sYW5lLm5hbWVzcGFjZSA9PT0gbmFtZXNwYWNlKTtcbn1cbl9fbmFtZShmaW5kU3dpbWxhbmVCeU5hbWVzcGFjZSwgXCJmaW5kU3dpbWxhbmVCeU5hbWVzcGFjZVwiKTtcbmZ1bmN0aW9uIGZpbmROZXh0QXZhaWxhYmxlSW5kZXgoc3dpbWxhbmVzLCBib3VuZGFyeU1pbiwgYm91bmRhcnlNYXgpIHtcbiAgcmV0dXJuIE1hdGgubWF4KFxuICAgIGJvdW5kYXJ5TWluLFxuICAgIC4uLk9iamVjdC5rZXlzKHN3aW1sYW5lcykuZmlsdGVyKChrZXkpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gTnVtYmVyLnBhcnNlSW50KGtleSk7XG4gICAgICByZXR1cm4gaW5kZXggPiBib3VuZGFyeU1pbiAmJiBpbmRleCA8IGJvdW5kYXJ5TWF4O1xuICAgIH0pLm1hcCgoa2V5KSA9PiBOdW1iZXIucGFyc2VJbnQoa2V5KSlcbiAgKSArIDE7XG59XG5fX25hbWUoZmluZE5leHRBdmFpbGFibGVJbmRleCwgXCJmaW5kTmV4dEF2YWlsYWJsZUluZGV4XCIpO1xuZnVuY3Rpb24gY2FsY3VsYXRlU3dpbWxhbmVQcm9wcyhmcmFtZSwgc3dpbWxhbmVzKSB7XG4gIGNvbnN0IG5hbWVzcGFjZSA9IGV4dHJhY3ROYW1lc3BhY2UoZnJhbWUuZW50aXR5SWRlbnRpZmllcik7XG4gIGNvbnN0IHN3ID0gZmluZFN3aW1sYW5lQnlOYW1lc3BhY2Uoc3dpbWxhbmVzLCBuYW1lc3BhY2UpO1xuICBzd2l0Y2ggKGZyYW1lLm1vZGVsRW50aXR5VHlwZSkge1xuICAgIGNhc2UgXCJ1aVwiOlxuICAgIGNhc2UgXCJwY3JcIjpcbiAgICBjYXNlIFwicHJvY2Vzc29yXCI6XG4gICAgICBpZiAoc3cpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpbmRleDogc3cuaW5kZXgsXG4gICAgICAgICAgbGFiZWw6IHN3Lm5hbWVzcGFjZSB8fCBkaWFncmFtUHJvcHMubGFiZWxVaUF1dG9tYXRpb25cbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAobmFtZXNwYWNlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaW5kZXg6IGZpbmROZXh0QXZhaWxhYmxlSW5kZXgoc3dpbWxhbmVzLCAwLCAxMDApLFxuICAgICAgICAgIGxhYmVsOiBkaWFncmFtUHJvcHMubGFiZWxVaUF1dG9tYXRpb25QcmVmaXggKyBuYW1lc3BhY2VcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGluZGV4OiAwLCBsYWJlbDogZGlhZ3JhbVByb3BzLmxhYmVsVWlBdXRvbWF0aW9uIH07XG4gICAgY2FzZSBcInJtb1wiOlxuICAgIGNhc2UgXCJyZWFkbW9kZWxcIjpcbiAgICBjYXNlIFwiY21kXCI6XG4gICAgY2FzZSBcImNvbW1hbmRcIjpcbiAgICAgIGlmIChzdykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGluZGV4OiBzdy5pbmRleCxcbiAgICAgICAgICBsYWJlbDogc3cubmFtZXNwYWNlIHx8IGRpYWdyYW1Qcm9wcy5sYWJlbENvbW1hbmRSZWFkTW9kZWxcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAobmFtZXNwYWNlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaW5kZXg6IGZpbmROZXh0QXZhaWxhYmxlSW5kZXgoc3dpbWxhbmVzLCAxMDAsIDIwMCksXG4gICAgICAgICAgbGFiZWw6IGRpYWdyYW1Qcm9wcy5sYWJlbENvbW1hbmRSZWFkTW9kZWxQcmVmaXggKyBuYW1lc3BhY2VcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7IGluZGV4OiAxMDAsIGxhYmVsOiBkaWFncmFtUHJvcHMubGFiZWxDb21tYW5kUmVhZE1vZGVsIH07XG4gICAgY2FzZSBcImV2dFwiOlxuICAgIGNhc2UgXCJldmVudFwiOlxuICAgIGRlZmF1bHQ6XG4gICAgICBpZiAoc3cpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpbmRleDogc3cuaW5kZXgsXG4gICAgICAgICAgbGFiZWw6IHN3Lm5hbWVzcGFjZSB8fCBkaWFncmFtUHJvcHMubGFiZWxFdmVudHNcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSBpZiAobmFtZXNwYWNlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaW5kZXg6IGZpbmROZXh0QXZhaWxhYmxlSW5kZXgoc3dpbWxhbmVzLCAyMDAsIDMwMCksXG4gICAgICAgICAgbGFiZWw6IGRpYWdyYW1Qcm9wcy5sYWJlbEV2ZW50c1ByZWZpeCArIG5hbWVzcGFjZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgaW5kZXg6IDIwMCwgbGFiZWw6IGRpYWdyYW1Qcm9wcy5sYWJlbEV2ZW50cyB9O1xuICB9XG59XG5fX25hbWUoY2FsY3VsYXRlU3dpbWxhbmVQcm9wcywgXCJjYWxjdWxhdGVTd2ltbGFuZVByb3BzXCIpO1xuZnVuY3Rpb24gY2FsY3VsYXRlRW50aXR5VmlzdWFsUHJvcHMoZnJhbWUpIHtcbiAgY29uc3QgeyB0aGVtZVZhcmlhYmxlcyB9ID0gZ2V0Q29uZmlnKCk7XG4gIHN3aXRjaCAoZnJhbWUubW9kZWxFbnRpdHlUeXBlKSB7XG4gICAgY2FzZSBcInVpXCI6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBmaWxsOiB0aGVtZVZhcmlhYmxlcy5lbVVpRmlsbCA/PyBcIndoaXRlXCIsXG4gICAgICAgIHN0cm9rZTogdGhlbWVWYXJpYWJsZXMuZW1VaVN0cm9rZSA/PyBcIiNkYmRhZGFcIlxuICAgICAgfTtcbiAgICBjYXNlIFwicGNyXCI6XG4gICAgY2FzZSBcInByb2Nlc3NvclwiOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZmlsbDogdGhlbWVWYXJpYWJsZXMuZW1Qcm9jZXNzb3JGaWxsID8/IFwiI2VkYjNmNlwiLFxuICAgICAgICBzdHJva2U6IHRoZW1lVmFyaWFibGVzLmVtUHJvY2Vzc29yU3Ryb2tlID8/IFwiI2I4OGNiZlwiXG4gICAgICB9O1xuICAgIGNhc2UgXCJybW9cIjpcbiAgICBjYXNlIFwicmVhZG1vZGVsXCI6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBmaWxsOiB0aGVtZVZhcmlhYmxlcy5lbVJlYWRNb2RlbEZpbGwgPz8gXCIjZDNmMWEyXCIsXG4gICAgICAgIHN0cm9rZTogdGhlbWVWYXJpYWJsZXMuZW1SZWFkTW9kZWxTdHJva2UgPz8gXCIjYTNiNzMyXCJcbiAgICAgIH07XG4gICAgY2FzZSBcImNtZFwiOlxuICAgIGNhc2UgXCJjb21tYW5kXCI6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBmaWxsOiB0aGVtZVZhcmlhYmxlcy5lbUNvbW1hbmRGaWxsID8/IFwiI2JjZDZmZVwiLFxuICAgICAgICBzdHJva2U6IHRoZW1lVmFyaWFibGVzLmVtQ29tbWFuZFN0cm9rZSA/PyBcIiM2NzlhYzNcIlxuICAgICAgfTtcbiAgICBjYXNlIFwiZXZ0XCI6XG4gICAgY2FzZSBcImV2ZW50XCI6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBmaWxsOiB0aGVtZVZhcmlhYmxlcy5lbUV2ZW50RmlsbCA/PyBcIiNmZmI3NzhcIixcbiAgICAgICAgc3Ryb2tlOiB0aGVtZVZhcmlhYmxlcy5lbUV2ZW50U3Ryb2tlID8/IFwiI2MxOWEwZlwiXG4gICAgICB9O1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBmaWxsOiBcInJlZFwiLFxuICAgICAgICBzdHJva2U6IFwiYmxhY2tcIlxuICAgICAgfTtcbiAgfVxufVxuX19uYW1lKGNhbGN1bGF0ZUVudGl0eVZpc3VhbFByb3BzLCBcImNhbGN1bGF0ZUVudGl0eVZpc3VhbFByb3BzXCIpO1xuZnVuY3Rpb24gY2FsY3VsYXRlVGV4dFByb3BzKGZyYW1lLCBkYXRhRW50aXRpZXMsIGRpYWdyYW1Qcm9wczIpIHtcbiAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIGNvbnN0IG5hbWUgPSBzYW5pdGl6ZVRleHQoZXh0cmFjdE5hbWUoZnJhbWUuZW50aXR5SWRlbnRpZmllcikgPz8gXCJcIiwgY29uZmlnKTtcbiAgbGV0IHRvSHRtbDtcbiAgY29uc3Qgd3JhcExhYmVsQ29uZmlnID0ge1xuICAgIGZvbnRTaXplOiAxNixcbiAgICBmb250V2VpZ2h0OiA3MDAsXG4gICAgZm9udEZhbWlseTogJ1widHJlYnVjaGV0IG1zXCIsIHZlcmRhbmEsIGFyaWFsLCBzYW5zLXNlcmlmJyxcbiAgICBqb2luV2l0aDogXCI8YnIvPlwiXG4gIH07XG4gIGNvbnN0IHdyYXBwZWROYW1lID0gd3JhcExhYmVsKG5hbWUsIGRpYWdyYW1Qcm9wczIudGV4dE1heFdpZHRoLCB3cmFwTGFiZWxDb25maWcpO1xuICBsZXQgY29udGVudCA9IGA8Yj4ke3dyYXBwZWROYW1lfTwvYj5gO1xuICBpZiAoZnJhbWUuZGF0YUlubGluZVZhbHVlKSB7XG4gICAgdG9IdG1sID0gZnJhbWUuZGF0YUlubGluZVZhbHVlO1xuICAgIHRvSHRtbCA9IHRvSHRtbC5zdWJzdHJpbmcodG9IdG1sLmluZGV4T2YoXCJ7XCIpICsgMSk7XG4gICAgdG9IdG1sID0gdG9IdG1sLnN1YnN0cmluZygwLCB0b0h0bWwubGFzdEluZGV4T2YoXCJ9XCIpIC0gMSk7XG4gICAgdG9IdG1sID0gc2FuaXRpemVUZXh0KHRvSHRtbCwgY29uZmlnKTtcbiAgICB0b0h0bWwgPSB3cmFwTGFiZWwodG9IdG1sLCBkaWFncmFtUHJvcHMyLnRleHRNYXhXaWR0aCwgd3JhcExhYmVsQ29uZmlnKTtcbiAgICB0b0h0bWwgPSB0b0h0bWwucmVwbGFjZUFsbChcIiBcIiwgXCImbmJzcDtcIik7XG4gIH1cbiAgaWYgKGZyYW1lLmRhdGFSZWZlcmVuY2UpIHtcbiAgICBjb25zdCBkYXRhRW50aXR5ID0gZGF0YUVudGl0aWVzLmZpbmQoXG4gICAgICAoZGF0YUVudGl0eTIpID0+IGRhdGFFbnRpdHkyLm5hbWUgPT09IGZyYW1lLmRhdGFSZWZlcmVuY2U/LiRyZWZUZXh0XG4gICAgKTtcbiAgICBpZiAoZGF0YUVudGl0eSkge1xuICAgICAgdG9IdG1sID0gZGF0YUVudGl0eS5kYXRhQmxvY2tWYWx1ZTtcbiAgICAgIHRvSHRtbCA9IHRvSHRtbC5zdWJzdHJpbmcodG9IdG1sLmluZGV4T2YoXCJ7XFxuXCIpICsgMik7XG4gICAgICB0b0h0bWwgPSB0b0h0bWwuc3Vic3RyaW5nKDAsIHRvSHRtbC5sYXN0SW5kZXhPZihcIn1cIikgLSAxKTtcbiAgICAgIHRvSHRtbCA9IHNhbml0aXplVGV4dCh0b0h0bWwsIGNvbmZpZyk7XG4gICAgICB0b0h0bWwgPSB3cmFwTGFiZWwodG9IdG1sLCBkaWFncmFtUHJvcHMyLnRleHRNYXhXaWR0aCwgd3JhcExhYmVsQ29uZmlnKTtcbiAgICAgIHRvSHRtbCA9IHRvSHRtbC5yZXBsYWNlQWxsKFwiIFwiLCBcIiZuYnNwO1wiKTtcbiAgICAgIHRvSHRtbCArPSBgPGJyLz5gO1xuICAgIH1cbiAgfVxuICBjb25zdCBoYXNSZW5kZXJlZERhdGEgPSB0b0h0bWwgIT09IHZvaWQgMDtcbiAgaWYgKGhhc1JlbmRlcmVkRGF0YSkge1xuICAgIGNvbnRlbnQgKz0gYDxici8+PGJyLz48Y29kZSBzdHlsZT1cInRleHQtYWxpZ246IGxlZnQ7IGRpc3BsYXk6IGJsb2NrO21heC13aWR0aDoke2RpYWdyYW1Qcm9wczIudGV4dE1heFdpZHRofXB4XCI+JHt0b0h0bWx9PC9jb2RlPmA7XG4gIH1cbiAgY29uc3QgdGV4dERpbWVuc2lvbkNvbmZpZyA9IHtcbiAgICBmb250U2l6ZTogd3JhcExhYmVsQ29uZmlnLmZvbnRTaXplLFxuICAgIGZvbnRXZWlnaHQ6IHdyYXBMYWJlbENvbmZpZy5mb250V2VpZ2h0LFxuICAgIGZvbnRGYW1pbHk6IHdyYXBMYWJlbENvbmZpZy5mb250RmFtaWx5XG4gIH07XG4gIGNvbnN0IGRpbWVuc2lvbnMgPSBjYWxjdWxhdGVUZXh0RGltZW5zaW9ucyhjb250ZW50LCB0ZXh0RGltZW5zaW9uQ29uZmlnKTtcbiAgY29uc3QgY2FsY3VsYXRlZFdpZHRoRml4ID0gaGFzUmVuZGVyZWREYXRhID8gZGltZW5zaW9ucy53aWR0aCAvIDMgOiBkaW1lbnNpb25zLndpZHRoO1xuICBjb25zdCBwcm9wcyA9IHtcbiAgICBjb250ZW50LFxuICAgIHdpZHRoOiBjYWxjdWxhdGVkV2lkdGhGaXgsXG4gICAgaGVpZ2h0OiBkaW1lbnNpb25zLmhlaWdodFxuICB9O1xuICBsb2cuZGVidWcoYFske2ZyYW1lLm5hbWV9XSAke2ZyYW1lLmVudGl0eUlkZW50aWZpZXJ9IHRleHRgLCBwcm9wcyk7XG4gIHJldHVybiBwcm9wcztcbn1cbl9fbmFtZShjYWxjdWxhdGVUZXh0UHJvcHMsIFwiY2FsY3VsYXRlVGV4dFByb3BzXCIpO1xuZnVuY3Rpb24gZGVjaWRlUG9zaXRpb25GcmFtZShzdGF0ZSwgX2NvbW1hbmQpIHtcbiAgY29uc3QgY29tbWFuZCA9IF9jb21tYW5kO1xuICBjb25zdCB2aXN1YWwgPSBjYWxjdWxhdGVFbnRpdHlWaXN1YWxQcm9wcyhjb21tYW5kLmZyYW1lKTtcbiAgY29uc3QgZGltZW5zaW9uID0ge1xuICAgIHdpZHRoOiBjb21tYW5kLnRleHRQcm9wcy53aWR0aCArIDIgKiBkaWFncmFtUHJvcHMuYm94VGV4dFBhZGRpbmcsXG4gICAgaGVpZ2h0OiBjb21tYW5kLnRleHRQcm9wcy5oZWlnaHQgKyAyICogZGlhZ3JhbVByb3BzLmJveFRleHRQYWRkaW5nXG4gIH07XG4gIGNvbnN0IGV2ZW50ID0ge1xuICAgICRraW5kOiBGcmFtZVBvc2l0aW9uZWRLaW5kLFxuICAgIGZyYW1lOiBjb21tYW5kLmZyYW1lLFxuICAgIGluZGV4OiBjb21tYW5kLmluZGV4LFxuICAgIHZpc3VhbCxcbiAgICBkaW1lbnNpb24sXG4gICAgdGV4dFByb3BzOiBjb21tYW5kLnRleHRQcm9wc1xuICB9O1xuICByZXR1cm4gW2V2ZW50XTtcbn1cbl9fbmFtZShkZWNpZGVQb3NpdGlvbkZyYW1lLCBcImRlY2lkZVBvc2l0aW9uRnJhbWVcIik7XG5mdW5jdGlvbiBjYWxjdWxhdGVYKHN3aW1sYW5lLCBwcmV2aW91c1N3aW1sYW5lLCBsYXN0Qm94KSB7XG4gIGlmIChwcmV2aW91c1N3aW1sYW5lID09PSB2b2lkIDApIHtcbiAgICByZXR1cm4gZGlhZ3JhbVByb3BzLmNvbnRlbnRTdGFydFg7XG4gIH1cbiAgaWYgKHByZXZpb3VzU3dpbWxhbmUuaW5kZXggPT09IHN3aW1sYW5lLmluZGV4ICYmIHN3aW1sYW5lLnIpIHtcbiAgICByZXR1cm4gc3dpbWxhbmUuciArIGRpYWdyYW1Qcm9wcy5ib3hQYWRkaW5nO1xuICB9XG4gIGlmIChsYXN0Qm94ID09PSB2b2lkIDApIHtcbiAgICByZXR1cm4gZGlhZ3JhbVByb3BzLmNvbnRlbnRTdGFydFg7XG4gIH1cbiAgcmV0dXJuIGxhc3RCb3guciAtIGRpYWdyYW1Qcm9wcy5ib3hPdmVybGFwICsgZGlhZ3JhbVByb3BzLmJveFBhZGRpbmc7XG59XG5fX25hbWUoY2FsY3VsYXRlWCwgXCJjYWxjdWxhdGVYXCIpO1xuZnVuY3Rpb24gY2FsY3VsYXRlTWF4UmlnaHQoc3dpbWxhbmVzLCBzd2ltbGFuZVIpIHtcbiAgY29uc3QgcnMgPSBbLi4uc3dpbWxhbmVzLm1hcCgocykgPT4gcy5yKSwgc3dpbWxhbmVSXTtcbiAgcmV0dXJuIE1hdGgubWF4KC4uLnJzKTtcbn1cbl9fbmFtZShjYWxjdWxhdGVNYXhSaWdodCwgXCJjYWxjdWxhdGVNYXhSaWdodFwiKTtcbmZ1bmN0aW9uIHNvcnRlZFN3aW1sYW5lc0FycmF5KHN3aW1sYW5lcykge1xuICByZXR1cm4gT2JqZWN0LnZhbHVlcyhzd2ltbGFuZXMpLnNvcnQoKGEsIGIpID0+IGEuaW5kZXggLSBiLmluZGV4KTtcbn1cbl9fbmFtZShzb3J0ZWRTd2ltbGFuZXNBcnJheSwgXCJzb3J0ZWRTd2ltbGFuZXNBcnJheVwiKTtcbmZ1bmN0aW9uIGV2b2x2ZUZyYW1lUG9zaXRpb25lZChzdGF0ZSwgX2V2ZW50KSB7XG4gIGNvbnN0IGV2ZW50ID0gX2V2ZW50O1xuICBjb25zdCBzd2ltbGFuZVByb3BzID0gY2FsY3VsYXRlU3dpbWxhbmVQcm9wcyhldmVudC5mcmFtZSwgc3RhdGUuc3dpbWxhbmVzKTtcbiAgbGV0IHN3aW1sYW5lO1xuICBpZiAoc3dpbWxhbmVQcm9wcy5pbmRleCBpbiBzdGF0ZS5zd2ltbGFuZXMpIHtcbiAgICBzd2ltbGFuZSA9IHN0YXRlLnN3aW1sYW5lc1tzd2ltbGFuZVByb3BzLmluZGV4XTtcbiAgfSBlbHNlIHtcbiAgICBzd2ltbGFuZSA9IHtcbiAgICAgIGluZGV4OiBzd2ltbGFuZVByb3BzLmluZGV4LFxuICAgICAgbGFiZWw6IHN3aW1sYW5lUHJvcHMubGFiZWwsXG4gICAgICByOiAwLFxuICAgICAgeTogc3dpbWxhbmVQcm9wcy5pbmRleCAqIGRpYWdyYW1Qcm9wcy5zd2ltbGFuZU1pbkhlaWdodCArIGRpYWdyYW1Qcm9wcy5zd2ltbGFuZUdhcCxcbiAgICAgIGhlaWdodDogZGlhZ3JhbVByb3BzLnN3aW1sYW5lTWluSGVpZ2h0LFxuICAgICAgbWF4SGVpZ2h0OiBkaWFncmFtUHJvcHMuc3dpbWxhbmVNaW5IZWlnaHRcbiAgICB9O1xuICB9XG4gIGNvbnN0IGxhc3RCb3ggPSBzdGF0ZS5ib3hlcy5sZW5ndGggPiAwID8gc3RhdGUuYm94ZXNbc3RhdGUuYm94ZXMubGVuZ3RoIC0gMV0gOiB2b2lkIDA7XG4gIGNvbnN0IHByZXZpb3VzU3dpbWxhbmUgPSBzdGF0ZS5wcmV2aW91c1N3aW1sYW5lTnVtYmVyICE9PSB2b2lkIDAgPyBzdGF0ZS5zd2ltbGFuZXNbc3RhdGUucHJldmlvdXNTd2ltbGFuZU51bWJlcl0gOiB2b2lkIDA7XG4gIGNvbnN0IGRpbWVuc2lvbiA9IHtcbiAgICB3aWR0aDogTWF0aC5tYXgoXG4gICAgICBkaWFncmFtUHJvcHMuYm94TWluV2lkdGgsXG4gICAgICBNYXRoLm1pbihkaWFncmFtUHJvcHMuYm94TWF4V2lkdGgsIGV2ZW50LmRpbWVuc2lvbi53aWR0aClcbiAgICApICsgMiAqIGRpYWdyYW1Qcm9wcy5ib3hQYWRkaW5nLFxuICAgIGhlaWdodDogTWF0aC5tYXgoXG4gICAgICBkaWFncmFtUHJvcHMuYm94TWluSGVpZ2h0LFxuICAgICAgTWF0aC5taW4oZGlhZ3JhbVByb3BzLmJveE1heEhlaWdodCwgZXZlbnQuZGltZW5zaW9uLmhlaWdodClcbiAgICApICsgMiAqIGRpYWdyYW1Qcm9wcy5ib3hQYWRkaW5nXG4gIH07XG4gIGNvbnN0IHggPSBjYWxjdWxhdGVYKHN3aW1sYW5lLCBwcmV2aW91c1N3aW1sYW5lLCBsYXN0Qm94KTtcbiAgY29uc3QgciA9IHggKyBkaW1lbnNpb24ud2lkdGggKyBkaWFncmFtUHJvcHMuYm94UGFkZGluZztcbiAgY29uc3QgbWF4UiA9IGNhbGN1bGF0ZU1heFJpZ2h0KE9iamVjdC52YWx1ZXMoc3RhdGUuc3dpbWxhbmVzKSwgcik7XG4gIHN3aW1sYW5lLnIgPSB4ICsgZGltZW5zaW9uLndpZHRoO1xuICBzd2ltbGFuZS5tYXhIZWlnaHQgPSBNYXRoLm1heChzd2ltbGFuZS5tYXhIZWlnaHQsIGRpbWVuc2lvbi5oZWlnaHQpO1xuICBzd2ltbGFuZS5oZWlnaHQgPSBNYXRoLm1heChkaWFncmFtUHJvcHMuc3dpbWxhbmVNaW5IZWlnaHQsIHN3aW1sYW5lLm1heEhlaWdodCkgKyAyICogZGlhZ3JhbVByb3BzLnN3aW1sYW5lUGFkZGluZztcbiAgY29uc3QgYm94ID0ge1xuICAgIHgsXG4gICAgeTogZGlhZ3JhbVByb3BzLnN3aW1sYW5lUGFkZGluZyArIHN3aW1sYW5lLnksXG4gICAgLy8geTogZGlhZ3JhbVByb3BzLnN3aW1sYW5lUGFkZGluZyArIChzd2ltbGFuZS55IHx8IGRpYWdyYW1Qcm9wcy5ib3hEZWZhdWx0WSksXG4gICAgcixcbiAgICBkaW1lbnNpb24sXG4gICAgbGVmdFNpYmxpbmc6IGZhbHNlLFxuICAgIHN3aW1sYW5lLFxuICAgIHZpc3VhbDogZXZlbnQudmlzdWFsLFxuICAgIHRleHQ6IGV2ZW50LnRleHRQcm9wcy5jb250ZW50LFxuICAgIGZyYW1lOiBldmVudC5mcmFtZSxcbiAgICBpbmRleDogZXZlbnQuaW5kZXhcbiAgfTtcbiAgY29uc3QgbmV3U3RhdGUgPSB7XG4gICAgLi4uc3RhdGUsXG4gICAgYm94ZXM6IFsuLi5zdGF0ZS5ib3hlcywgYm94XSxcbiAgICBzd2ltbGFuZXM6IHtcbiAgICAgIC4uLnN0YXRlLnN3aW1sYW5lcyxcbiAgICAgIFtgJHtzd2ltbGFuZS5pbmRleH1gXTogc3dpbWxhbmVcbiAgICB9LFxuICAgIHByZXZpb3VzU3dpbWxhbmVOdW1iZXI6IHN3aW1sYW5lUHJvcHMuaW5kZXgsXG4gICAgcHJldmlvdXNGcmFtZTogZXZlbnQuZnJhbWUsXG4gICAgbWF4UlxuICB9O1xuICBjb25zdCBzd2ltbGFuZXMgPSBzb3J0ZWRTd2ltbGFuZXNBcnJheShuZXdTdGF0ZS5zd2ltbGFuZXMpO1xuICBpZiAoc3dpbWxhbmVzLmxlbmd0aCA+IDApIHtcbiAgICBzd2ltbGFuZXNbMF0ueSA9IDA7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBzd2ltbGFuZXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBzdyA9IHN3aW1sYW5lc1tpXTtcbiAgICBjb25zdCBwcmV2U3cgPSBzd2ltbGFuZXNbaSAtIDFdO1xuICAgIHN3LnkgPSBwcmV2U3cueSArIHByZXZTdy5oZWlnaHQgKyBkaWFncmFtUHJvcHMuc3dpbWxhbmVHYXA7XG4gIH1cbiAgcmV0dXJuIG5ld1N0YXRlO1xufVxuX19uYW1lKGV2b2x2ZUZyYW1lUG9zaXRpb25lZCwgXCJldm9sdmVGcmFtZVBvc2l0aW9uZWRcIik7XG5mdW5jdGlvbiBpc0ZpcnN0RnJhbWUoaW5kZXgsIGZyYW1lKSB7XG4gIGlmIChpbmRleCA9PT0gMCAmJiBmcmFtZS5zb3VyY2VGcmFtZXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuX19uYW1lKGlzRmlyc3RGcmFtZSwgXCJpc0ZpcnN0RnJhbWVcIik7XG5mdW5jdGlvbiBoYXNTb3VyY2VGcmFtZShmcmFtZSkge1xuICByZXR1cm4gZnJhbWUuc291cmNlRnJhbWVzICE9PSB2b2lkIDAgJiYgZnJhbWUuc291cmNlRnJhbWVzICE9PSBudWxsICYmIGZyYW1lLnNvdXJjZUZyYW1lcy5sZW5ndGggPiAwO1xufVxuX19uYW1lKGhhc1NvdXJjZUZyYW1lLCBcImhhc1NvdXJjZUZyYW1lXCIpO1xuZnVuY3Rpb24gZmluZEJveEJ5RnJhbWUoYm94ZXMsIGZyYW1lKSB7XG4gIGlmIChmcmFtZSA9PT0gdm9pZCAwIHx8IGZyYW1lID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHZvaWQgMDtcbiAgfVxuICByZXR1cm4gYm94ZXMuZmluZCgoYm94KSA9PiBib3guZnJhbWUubmFtZSA9PT0gZnJhbWUubmFtZSk7XG59XG5fX25hbWUoZmluZEJveEJ5RnJhbWUsIFwiZmluZEJveEJ5RnJhbWVcIik7XG5mdW5jdGlvbiBmaW5kQm94QnlMaW5lSW5kZXgoYm94ZXMsIHRhcmdldFN3aW1sYW5lLCBsaW5lSW5kZXgpIHtcbiAgaWYgKGxpbmVJbmRleCA8IDApIHtcbiAgICByZXR1cm4gdm9pZCAwO1xuICB9XG4gIGZvciAobGV0IGkgPSBsaW5lSW5kZXg7IGkgPj0gMDsgaS0tKSB7XG4gICAgY29uc3QgYm94ID0gYm94ZXNbaV07XG4gICAgaWYgKGJveC5zd2ltbGFuZS5pbmRleCAhPT0gdGFyZ2V0U3dpbWxhbmUpIHtcbiAgICAgIHJldHVybiBib3g7XG4gICAgfVxuICB9XG4gIHJldHVybiB2b2lkIDA7XG59XG5fX25hbWUoZmluZEJveEJ5TGluZUluZGV4LCBcImZpbmRCb3hCeUxpbmVJbmRleFwiKTtcbmZ1bmN0aW9uIGRlY2lkZVBvc2l0aW9uUmVsYXRpb24oc3RhdGUsIF9jb21tYW5kKSB7XG4gIGNvbnN0IGNvbW1hbmQgPSBfY29tbWFuZDtcbiAgaWYgKGlzRW1SZXNldEZyYW1lKGNvbW1hbmQuZnJhbWUpIHx8IGlzRmlyc3RGcmFtZShjb21tYW5kLmluZGV4LCBjb21tYW5kLmZyYW1lKSkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBjb25zdCB0YXJnZXRCb3ggPSBmaW5kQm94QnlGcmFtZShzdGF0ZS5ib3hlcywgY29tbWFuZC5mcmFtZSk7XG4gIGlmICh0YXJnZXRCb3ggPT09IHZvaWQgMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVGFyZ2V0IGJveCBub3QgZm91bmQgZm9yIGZyYW1lICR7Y29tbWFuZC5mcmFtZS5uYW1lfWApO1xuICB9XG4gIGxldCBzb3VyY2VCb3g7XG4gIGlmIChjb21tYW5kLnNvdXJjZUZyYW1lKSB7XG4gICAgc291cmNlQm94ID0gZmluZEJveEJ5RnJhbWUoc3RhdGUuYm94ZXMsIGNvbW1hbmQuc291cmNlRnJhbWUpO1xuICB9IGVsc2Uge1xuICAgIHNvdXJjZUJveCA9IGZpbmRCb3hCeUxpbmVJbmRleChzdGF0ZS5ib3hlcywgdGFyZ2V0Qm94LnN3aW1sYW5lLmluZGV4LCBjb21tYW5kLmluZGV4IC0gMSk7XG4gIH1cbiAgaWYgKHNvdXJjZUJveCA9PT0gdm9pZCAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGNvbnN0IGV2ZW50ID0ge1xuICAgICRraW5kOiBSZWxhdGlvblBvc2l0aW9uZWRLaW5kLFxuICAgIGZyYW1lOiBjb21tYW5kLmZyYW1lLFxuICAgIGluZGV4OiBjb21tYW5kLmluZGV4LFxuICAgIHNvdXJjZUJveCxcbiAgICB0YXJnZXRCb3hcbiAgfTtcbiAgcmV0dXJuIFtldmVudF07XG59XG5fX25hbWUoZGVjaWRlUG9zaXRpb25SZWxhdGlvbiwgXCJkZWNpZGVQb3NpdGlvblJlbGF0aW9uXCIpO1xuZnVuY3Rpb24gZXZvbHZlUmVsYXRpb25Qb3NpdGlvbmVkKHN0YXRlLCBfZXZlbnQpIHtcbiAgY29uc3QgZXZlbnQgPSBfZXZlbnQ7XG4gIGNvbnN0IHJlbGF0aW9uID0ge1xuICAgIHZpc3VhbDoge1xuICAgICAgZmlsbDogXCJub25lXCIsXG4gICAgICBzdHJva2U6IFwiIzAwMFwiXG4gICAgfSxcbiAgICBzb3VyY2U6IHtcbiAgICAgIHg6IGV2ZW50LnNvdXJjZUJveC54LFxuICAgICAgeTogZXZlbnQuc291cmNlQm94LnlcbiAgICB9LFxuICAgIHRhcmdldDoge1xuICAgICAgeDogZXZlbnQudGFyZ2V0Qm94LngsXG4gICAgICB5OiBldmVudC50YXJnZXRCb3gueVxuICAgIH0sXG4gICAgc291cmNlQm94OiBldmVudC5zb3VyY2VCb3gsXG4gICAgdGFyZ2V0Qm94OiBldmVudC50YXJnZXRCb3hcbiAgfTtcbiAgY29uc3QgbmV3U3RhdGUgPSB7XG4gICAgLi4uc3RhdGUsXG4gICAgcmVsYXRpb25zOiBbLi4uc3RhdGUucmVsYXRpb25zLCByZWxhdGlvbl1cbiAgfTtcbiAgcmV0dXJuIG5ld1N0YXRlO1xufVxuX19uYW1lKGV2b2x2ZVJlbGF0aW9uUG9zaXRpb25lZCwgXCJldm9sdmVSZWxhdGlvblBvc2l0aW9uZWRcIik7XG52YXIgZGVjaWRlcnMgPSB7XG4gIFtQb3NpdGlvbkZyYW1lS2luZF06IGRlY2lkZVBvc2l0aW9uRnJhbWUsXG4gIFtQb3NpdGlvblJlbGF0aW9uS2luZF06IGRlY2lkZVBvc2l0aW9uUmVsYXRpb25cbn07XG52YXIgZXZvbHZlcnMgPSB7XG4gIFtGcmFtZVBvc2l0aW9uZWRLaW5kXTogZXZvbHZlRnJhbWVQb3NpdGlvbmVkLFxuICBbUmVsYXRpb25Qb3NpdGlvbmVkS2luZF06IGV2b2x2ZVJlbGF0aW9uUG9zaXRpb25lZFxufTtcbmZ1bmN0aW9uIGRlY2lkZShzdGF0ZSwgY29tbWFuZCkge1xuICBjb25zdCBmbiA9IGRlY2lkZXJzW2NvbW1hbmQuJGtpbmRdO1xuICBpZiAoZm4gPT09IHZvaWQgMCB8fCBmbiA9PT0gbnVsbCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBjb25zdCBldmVudHMgPSBmbihzdGF0ZSwgY29tbWFuZCk7XG4gIGxvZy5kZWJ1ZyhgZGVjaWRlZCBldmVudHNgLCBldmVudHMpO1xuICByZXR1cm4gZXZlbnRzO1xufVxuX19uYW1lKGRlY2lkZSwgXCJkZWNpZGVcIik7XG5mdW5jdGlvbiBldm9sdmUoc3RhdGUsIGV2ZW50cykge1xuICBjb25zdCBuZXdTdGF0ZSA9IGV2ZW50cy5yZWR1Y2UoKHByZXZpb3VzU3RhdGUsIGV2ZW50KSA9PiB7XG4gICAgY29uc3QgZm4gPSBldm9sdmVyc1tldmVudC4ka2luZF07XG4gICAgaWYgKGZuID09PSB2b2lkIDAgfHwgZm4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBwcmV2aW91c1N0YXRlO1xuICAgIH1cbiAgICByZXR1cm4gZm4ocHJldmlvdXNTdGF0ZSwgZXZlbnQpO1xuICB9LCBzdGF0ZSk7XG4gIGxvZy5kZWJ1ZyhgZXZvbHZlIGV2ZW50c2AsIHsgc3RhdGUsIG5ld1N0YXRlLCBldmVudHMgfSk7XG4gIHJldHVybiBuZXdTdGF0ZTtcbn1cbl9fbmFtZShldm9sdmUsIFwiZXZvbHZlXCIpO1xuZnVuY3Rpb24gZGlzcGF0Y2goc3RhdGUsIGNvbW1hbmQpIHtcbiAgY29uc3QgZXZlbnRzID0gZGVjaWRlKHN0YXRlLCBjb21tYW5kKTtcbiAgY29uc3QgbmV3U3RhdGUgPSBldm9sdmUoc3RhdGUsIGV2ZW50cyk7XG4gIHJldHVybiBuZXdTdGF0ZTtcbn1cbl9fbmFtZShkaXNwYXRjaCwgXCJkaXNwYXRjaFwiKTtcbnZhciBkYiA9IHtcbiAgZ2V0Q29uZmlnOiBnZXRDb25maWczLFxuICBzZXRPcHRpb25zLFxuICBnZXRPcHRpb25zLFxuICBjbGVhcjogY2xlYXIyLFxuICBzZXRBY2NUaXRsZSxcbiAgZ2V0QWNjVGl0bGUsXG4gIGdldEFjY0Rlc2NyaXB0aW9uLFxuICBzZXRBY2NEZXNjcmlwdGlvbixcbiAgc2V0RGlhZ3JhbVRpdGxlLFxuICBnZXREaWFncmFtVGl0bGUsXG4gIHNldEFzdCxcbiAgZ2V0RGlhZ3JhbVByb3BzLFxuICBnZXRTdGF0ZVxufTtcblxuLy8gc3JjL2RpYWdyYW1zL2V2ZW50bW9kZWxpbmcvcGFyc2VyLnRzXG52YXIgcGFyc2VyID0ge1xuICBwYXJzZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAoaW5wdXQpID0+IHtcbiAgICBjb25zdCBhc3QgPSBhd2FpdCBwYXJzZShcImV2ZW50bW9kZWxpbmdcIiwgaW5wdXQpO1xuICAgIGxvZy5kZWJ1Zyhhc3QpO1xuICAgIGRiLnNldEFzdChhc3QpO1xuICAgIHBvcHVsYXRlQ29tbW9uRGIoYXN0LCBkYik7XG4gIH0sIFwicGFyc2VcIilcbn07XG5pZiAodm9pZCAwKSB7XG4gIGNvbnN0IHsgaXQsIGV4cGVjdCwgZGVzY3JpYmUgfSA9IHZvaWQgMDtcbiAgZGVzY3JpYmUoXCJFdmVudE1vZGVsaW5nIFBhcnNlclwiLCAoKSA9PiB7XG4gICAgaXQoXCJzaG91bGQgcGFyc2Ugc2ltcGxlIG1vZGVsXCIsICgpID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IHBhcnNlci5wYXJzZShgZXZlbnRtb2RlbGluZ1xuICB0ZiAwMSBldnQgU3RhcnRcblxuICAgIGApO1xuICAgICAgZXhwZWN0KHJlc3VsdCAhPT0gdm9pZCAwKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8vIHNyYy9kaWFncmFtcy9ldmVudG1vZGVsaW5nL3JlbmRlcmVyLnRzXG5pbXBvcnQgeyBzZWxlY3QgfSBmcm9tIFwiZDNcIjtcbnZhciBERUZBVUxUX0NPTkZJRyA9IGdldENvbmZpZzIoKTtcbnZhciBERUZBVUxUX0VWRU5UTU9ERUxJTkdfQ09ORklHMiA9IERFRkFVTFRfQ09ORklHPy5ldmVudG1vZGVsaW5nO1xuZnVuY3Rpb24gcmVuZGVyRDNCb3goZGlhZ3JhbTIsIGRpYWdyYW1Qcm9wczIpIHtcbiAgcmV0dXJuIChib3gpID0+IHtcbiAgICBjb25zdCB5ID0gYm94LnN3aW1sYW5lLnkgKyBkaWFncmFtUHJvcHMyLnN3aW1sYW5lUGFkZGluZztcbiAgICBjb25zdCBnID0gZGlhZ3JhbTIuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJlbS1ib3hcIik7XG4gICAgZy5hcHBlbmQoXCJyZWN0XCIpLmF0dHIoXCJ4XCIsIGJveC54KS5hdHRyKFwieVwiLCB5KS5hdHRyKFwicnhcIiwgXCIzXCIpLmF0dHIoXCJ3aWR0aFwiLCBib3guZGltZW5zaW9uLndpZHRoKS5hdHRyKFwiaGVpZ2h0XCIsIGJveC5kaW1lbnNpb24uaGVpZ2h0KS5hdHRyKFwic3Ryb2tlXCIsIGJveC52aXN1YWwuc3Ryb2tlKS5hdHRyKFwiZmlsbFwiLCBib3gudmlzdWFsLmZpbGwpO1xuICAgIGNvbnN0IGYgPSBnLmFwcGVuZChcImZvcmVpZ25PYmplY3RcIikuYXR0cihcInhcIiwgYm94LnggKyBkaWFncmFtUHJvcHMyLmJveFBhZGRpbmcpLmF0dHIoXCJ5XCIsIHkgKyAxMCkuYXR0cihcIndpZHRoXCIsIGJveC5kaW1lbnNpb24ud2lkdGggLSAyICogZGlhZ3JhbVByb3BzMi5ib3hQYWRkaW5nKS5hdHRyKFwiaGVpZ2h0XCIsIGJveC5kaW1lbnNpb24uaGVpZ2h0IC0gMiAqIGRpYWdyYW1Qcm9wczIuYm94UGFkZGluZyk7XG4gICAgY29uc3QgdGV4dCA9IGYuYXBwZW5kKFwieGh0bWw6ZGl2XCIpLnN0eWxlKFwiZGlzcGxheVwiLCBcInRhYmxlXCIpLnN0eWxlKFwiaGVpZ2h0XCIsIFwiMTAwJVwiKS5zdHlsZShcIndpZHRoXCIsIFwiMTAwJVwiKTtcbiAgICB0ZXh0LmFwcGVuZChcInNwYW5cIikuc3R5bGUoXCJkaXNwbGF5XCIsIFwidGFibGUtY2VsbFwiKS5zdHlsZShcInRleHQtYWxpZ25cIiwgXCJjZW50ZXJcIikuc3R5bGUoXCJ2ZXJ0aWNhbC1hbGlnblwiLCBcIm1pZGRsZVwiKS5odG1sKGJveC50ZXh0KTtcbiAgfTtcbn1cbl9fbmFtZShyZW5kZXJEM0JveCwgXCJyZW5kZXJEM0JveFwiKTtcbmZ1bmN0aW9uIGRpclVwd2FyZHMoc291cmNlWSwgdGFyZ2V0WSkge1xuICByZXR1cm4gc291cmNlWSA+IHRhcmdldFk7XG59XG5fX25hbWUoZGlyVXB3YXJkcywgXCJkaXJVcHdhcmRzXCIpO1xuZnVuY3Rpb24gcmVuZGVyRDNSZWxhdGlvbihkaWFncmFtMiwgZGlhZ3JhbVByb3BzMiwgYXJyb3doZWFkSWQsIHRoZW1lVmFyaWFibGVzKSB7XG4gIHJldHVybiAocmVsYXRpb24pID0+IHtcbiAgICBjb25zdCBzb3VyY2VCb3hZID0gcmVsYXRpb24uc291cmNlQm94LnN3aW1sYW5lLnkgKyBkaWFncmFtUHJvcHMyLnN3aW1sYW5lUGFkZGluZztcbiAgICBjb25zdCB0YXJnZXRCb3hZID0gcmVsYXRpb24udGFyZ2V0Qm94LnN3aW1sYW5lLnkgKyBkaWFncmFtUHJvcHMyLnN3aW1sYW5lUGFkZGluZztcbiAgICBjb25zdCB1cHdhcmRzID0gZGlyVXB3YXJkcyhzb3VyY2VCb3hZLCB0YXJnZXRCb3hZKTtcbiAgICBjb25zdCBzb3VyY2VYID0gcmVsYXRpb24uc291cmNlQm94LnggKyByZWxhdGlvbi5zb3VyY2VCb3guZGltZW5zaW9uLndpZHRoICogMiAvIDM7XG4gICAgY29uc3QgdGFyZ2V0WCA9IHJlbGF0aW9uLnRhcmdldEJveC54ICsgcmVsYXRpb24udGFyZ2V0Qm94LmRpbWVuc2lvbi53aWR0aCAvIDM7XG4gICAgbGV0IHNvdXJjZVk7XG4gICAgbGV0IHRhcmdldFk7XG4gICAgbG9nLmRlYnVnKGByZW5kZXJpbmcgcmVsYXRpb24gdXA9JHt1cHdhcmRzfSBmb3IgYCwge1xuICAgICAgc291cmNlQm94OiByZWxhdGlvbi5zb3VyY2VCb3gsXG4gICAgICB0YXJnZXRCb3g6IHJlbGF0aW9uLnRhcmdldEJveFxuICAgIH0pO1xuICAgIGlmICh1cHdhcmRzKSB7XG4gICAgICBzb3VyY2VZID0gc291cmNlQm94WTtcbiAgICAgIHRhcmdldFkgPSB0YXJnZXRCb3hZICsgcmVsYXRpb24udGFyZ2V0Qm94LmRpbWVuc2lvbi5oZWlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNvdXJjZVkgPSBzb3VyY2VCb3hZICsgcmVsYXRpb24uc291cmNlQm94LmRpbWVuc2lvbi5oZWlnaHQ7XG4gICAgICB0YXJnZXRZID0gdGFyZ2V0Qm94WTtcbiAgICB9XG4gICAgY29uc3QgcmVsYXRpb25TdHJva2UgPSB0aGVtZVZhcmlhYmxlcy5lbVJlbGF0aW9uU3Ryb2tlID8/IHJlbGF0aW9uLnZpc3VhbC5zdHJva2U7XG4gICAgZGlhZ3JhbTIuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJlbS1yZWxhdGlvblwiKS5hdHRyKFwiZmlsbFwiLCByZWxhdGlvbi52aXN1YWwuZmlsbCkuYXR0cihcInN0cm9rZVwiLCByZWxhdGlvblN0cm9rZSkuYXR0cihcInN0cm9rZS13aWR0aFwiLCBcIjFcIikuYXR0cihcIm1hcmtlci1lbmRcIiwgYHVybCgjJHthcnJvd2hlYWRJZH0pYCkuYXR0cihcImRcIiwgYE0ke3NvdXJjZVh9ICR7c291cmNlWX0gTCR7dGFyZ2V0WH0gJHt0YXJnZXRZfWApO1xuICB9O1xufVxuX19uYW1lKHJlbmRlckQzUmVsYXRpb24sIFwicmVuZGVyRDNSZWxhdGlvblwiKTtcbmZ1bmN0aW9uIHJlbmRlckQzU3dpbWxhbmUoZGlhZ3JhbTIsIG1heFIsIGRpYWdyYW1Qcm9wczIsIHRoZW1lVmFyaWFibGVzKSB7XG4gIHJldHVybiAoc3dpbWxhbmUpID0+IHtcbiAgICBjb25zdCBnID0gZGlhZ3JhbTIuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJlbS1zd2ltbGFuZVwiKTtcbiAgICBjb25zdCBvZGRCYWNrZ3JvdW5kID0gdGhlbWVWYXJpYWJsZXMuZW1Td2ltbGFuZUJhY2tncm91bmRPZGQgPz8gXCJyZ2IoMjUwLDI1MCwyNTApXCI7XG4gICAgY29uc3QgYmFja2dyb3VuZFN0cm9rZSA9IHRoZW1lVmFyaWFibGVzLmVtU3dpbWxhbmVCYWNrZ3JvdW5kU3Ryb2tlID8/IFwicmdiKDI0MCwyNDAsMjQwKVwiO1xuICAgIGcuYXBwZW5kKFwicmVjdFwiKS5hdHRyKFwieFwiLCAwKS5hdHRyKFwieVwiLCBzd2ltbGFuZS55KS5hdHRyKFwicnhcIiwgXCIzXCIpLmF0dHIoXCJ3aWR0aFwiLCBtYXhSICsgZGlhZ3JhbVByb3BzMi5zd2ltbGFuZVBhZGRpbmcpLmF0dHIoXCJoZWlnaHRcIiwgc3dpbWxhbmUuaGVpZ2h0KS5hdHRyKFwiZmlsbFwiLCBvZGRCYWNrZ3JvdW5kKS5hdHRyKFwic3Ryb2tlXCIsIGJhY2tncm91bmRTdHJva2UpO1xuICAgIGcuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwiZm9udC13ZWlnaHRcIiwgZGlhZ3JhbVByb3BzMi5zd2ltbGFuZVRleHRGb250V2VpZ2h0KS5hdHRyKFwieFwiLCAzMCkuYXR0cihcInlcIiwgc3dpbWxhbmUueSArIDMwKS50ZXh0KHN3aW1sYW5lLmxhYmVsKTtcbiAgfTtcbn1cbl9fbmFtZShyZW5kZXJEM1N3aW1sYW5lLCBcInJlbmRlckQzU3dpbWxhbmVcIik7XG52YXIgZHJhdyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24odHh0LCBpZCwgdmVyLCBkaWFnT2JqKSB7XG4gIGxvZy5kZWJ1ZyhcImluIGV2ZW50bW9kZWxpbmcgcmVuZGVyZXJcIiwgdHh0ICsgXCJcXG5cIiwgXCJpZDpcIiwgaWQsIHZlcik7XG4gIGlmICghREVGQVVMVF9FVkVOVE1PREVMSU5HX0NPTkZJRzIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJFdmVudE1vZGVsaW5nIGNvbmZpZyBub3QgZm91bmRcIik7XG4gIH1cbiAgY29uc3QgZGIyID0gZGlhZ09iai5kYjtcbiAgY29uc3QgeyB0aGVtZVZhcmlhYmxlcywgZXZlbnRtb2RlbGluZzogY29uZmlnIH0gPSBnZXRDb25maWcyKCk7XG4gIGNvbnN0IGRpYWdyYW0yID0gc2VsZWN0KGBbaWQ9XCIke2lkfVwiXWApO1xuICBjb25zdCBkaWFncmFtUHJvcHMyID0gZGIyLmdldERpYWdyYW1Qcm9wcygpO1xuICBjb25zdCBzdGF0ZSA9IGRiMi5nZXRTdGF0ZSgpO1xuICBjb25zdCBhcnJvd2hlYWRJZCA9IGBlbS1hcnJvd2hlYWQtJHtpZH1gO1xuICBjb25zdCBhcnJvd2hlYWRDb2xvciA9IHRoZW1lVmFyaWFibGVzLmVtQXJyb3doZWFkID8/IFwiIzAwMDAwMFwiO1xuICBzdGF0ZS5zb3J0ZWRTd2ltbGFuZXNBcnJheS5mb3JFYWNoKFxuICAgIHJlbmRlckQzU3dpbWxhbmUoZGlhZ3JhbTIsIHN0YXRlLm1heFIsIGRpYWdyYW1Qcm9wczIsIHRoZW1lVmFyaWFibGVzKVxuICApO1xuICBzdGF0ZS5ib3hlcy5mb3JFYWNoKHJlbmRlckQzQm94KGRpYWdyYW0yLCBkaWFncmFtUHJvcHMyKSk7XG4gIHN0YXRlLnJlbGF0aW9ucy5mb3JFYWNoKHJlbmRlckQzUmVsYXRpb24oZGlhZ3JhbTIsIGRpYWdyYW1Qcm9wczIsIGFycm93aGVhZElkLCB0aGVtZVZhcmlhYmxlcykpO1xuICBjb25zdCBtYXJrZXIgPSBkaWFncmFtMi5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgYXJyb3doZWFkSWQpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCBcIjEwXCIpLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgXCI3XCIpLmF0dHIoXCJyZWZYXCIsIFwiMTBcIikuYXR0cihcInJlZllcIiwgXCIzLjVcIikuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIik7XG4gIG1hcmtlci5hcHBlbmQoXCJwb2x5Z29uXCIpLmF0dHIoXCJwb2ludHNcIiwgXCIwIDAsIDEwIDMuNSwgMCA3XCIpLmF0dHIoXCJmaWxsXCIsIGFycm93aGVhZENvbG9yKTtcbiAgc2V0dXBHcmFwaFZpZXdib3godm9pZCAwLCBkaWFncmFtMiwgY29uZmlnPy5wYWRkaW5nID8/IDMwLCBjb25maWc/LnVzZU1heFdpZHRoKTtcbn0sIFwiZHJhd1wiKTtcbnZhciByZW5kZXJlcl9kZWZhdWx0ID0ge1xuICBkcmF3XG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMvZXZlbnRtb2RlbGluZy9zdHlsZXMuanNcbnZhciBnZXRTdHlsZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChfb3B0aW9ucykgPT4gYGAsIFwiZ2V0U3R5bGVzXCIpO1xudmFyIHN0eWxlc19kZWZhdWx0ID0gZ2V0U3R5bGVzO1xuXG4vLyBzcmMvZGlhZ3JhbXMvZXZlbnRtb2RlbGluZy9kaWFncmFtLnRzXG52YXIgZGlhZ3JhbSA9IHtcbiAgcGFyc2VyLFxuICBkYixcbiAgcmVuZGVyZXI6IHJlbmRlcmVyX2RlZmF1bHQsXG4gIHN0eWxlczogc3R5bGVzX2RlZmF1bHRcbn07XG5leHBvcnQge1xuICBkaWFncmFtXG59O1xuIgogIF0s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
