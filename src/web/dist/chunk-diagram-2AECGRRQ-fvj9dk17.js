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
  getThemeVariables3,
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

// node_modules/mermaid/dist/chunks/mermaid.core/diagram-2AECGRRQ.mjs
var defaultOptions = {
  showLegend: true,
  ticks: 5,
  max: null,
  min: 0,
  graticule: "circle"
};
var defaultRadarData = {
  axes: [],
  curves: [],
  options: defaultOptions
};
var data = structuredClone(defaultRadarData);
var DEFAULT_RADAR_CONFIG = defaultConfig_default.radar;
var getConfig2 = /* @__PURE__ */ __name(() => {
  const config = cleanAndMerge({
    ...DEFAULT_RADAR_CONFIG,
    ...getConfig().radar
  });
  return config;
}, "getConfig");
var getAxes = /* @__PURE__ */ __name(() => data.axes, "getAxes");
var getCurves = /* @__PURE__ */ __name(() => data.curves, "getCurves");
var getOptions = /* @__PURE__ */ __name(() => data.options, "getOptions");
var setAxes = /* @__PURE__ */ __name((axes) => {
  data.axes = axes.map((axis) => {
    return {
      name: axis.name,
      label: axis.label ?? axis.name
    };
  });
}, "setAxes");
var setCurves = /* @__PURE__ */ __name((curves) => {
  data.curves = curves.map((curve) => {
    return {
      name: curve.name,
      label: curve.label ?? curve.name,
      entries: computeCurveEntries(curve.entries)
    };
  });
}, "setCurves");
var computeCurveEntries = /* @__PURE__ */ __name((entries) => {
  if (entries[0].axis == undefined) {
    return entries.map((entry) => entry.value);
  }
  const axes = getAxes();
  if (axes.length === 0) {
    throw new Error("Axes must be populated before curves for reference entries");
  }
  return axes.map((axis) => {
    const entry = entries.find((entry2) => entry2.axis?.$refText === axis.name);
    if (entry === undefined) {
      throw new Error("Missing entry for axis " + axis.label);
    }
    return entry.value;
  });
}, "computeCurveEntries");
var setOptions = /* @__PURE__ */ __name((options) => {
  const optionMap = options.reduce((acc, option) => {
    acc[option.name] = option;
    return acc;
  }, {});
  data.options = {
    showLegend: optionMap.showLegend?.value ?? defaultOptions.showLegend,
    ticks: optionMap.ticks?.value ?? defaultOptions.ticks,
    max: optionMap.max?.value ?? defaultOptions.max,
    min: optionMap.min?.value ?? defaultOptions.min,
    graticule: optionMap.graticule?.value ?? defaultOptions.graticule
  };
}, "setOptions");
var clear2 = /* @__PURE__ */ __name(() => {
  clear();
  data = structuredClone(defaultRadarData);
}, "clear");
var db = {
  getAxes,
  getCurves,
  getOptions,
  setAxes,
  setCurves,
  setOptions,
  getConfig: getConfig2,
  clear: clear2,
  setAccTitle,
  getAccTitle,
  setDiagramTitle,
  getDiagramTitle,
  getAccDescription,
  setAccDescription
};
var populate = /* @__PURE__ */ __name((ast) => {
  populateCommonDb(ast, db);
  const { axes, curves, options } = ast;
  db.setAxes(axes);
  db.setCurves(curves);
  db.setOptions(options);
}, "populate");
var parser = {
  parse: /* @__PURE__ */ __name(async (input) => {
    const ast = await parse("radar", input);
    log.debug(ast);
    populate(ast);
  }, "parse")
};
var draw = /* @__PURE__ */ __name((_text, id, _version, diagram2) => {
  const db2 = diagram2.db;
  const axes = db2.getAxes();
  const curves = db2.getCurves();
  const options = db2.getOptions();
  const config = db2.getConfig();
  const title = db2.getDiagramTitle();
  const svg = selectSvgElement(id);
  const g = drawFrame(svg, config);
  const maxValue = options.max ?? Math.max(...curves.map((curve) => Math.max(...curve.entries)));
  const minValue = options.min;
  const radius = Math.min(config.width, config.height) / 2;
  drawGraticule(g, axes, radius, options.ticks, options.graticule);
  drawAxes(g, axes, radius, config);
  drawCurves(g, axes, curves, minValue, maxValue, options.graticule, config);
  drawLegend(g, curves, options.showLegend, config);
  g.append("text").attr("class", "radarTitle").text(title).attr("x", 0).attr("y", -config.height / 2 - config.marginTop);
}, "draw");
var drawFrame = /* @__PURE__ */ __name((svg, config) => {
  const totalWidth = config.width + config.marginLeft + config.marginRight;
  const totalHeight = config.height + config.marginTop + config.marginBottom;
  const center = {
    x: config.marginLeft + config.width / 2,
    y: config.marginTop + config.height / 2
  };
  configureSvgSize(svg, totalHeight, totalWidth, config.useMaxWidth ?? true);
  svg.attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`);
  return svg.append("g").attr("transform", `translate(${center.x}, ${center.y})`);
}, "drawFrame");
var drawGraticule = /* @__PURE__ */ __name((g, axes, radius, ticks, graticule) => {
  if (graticule === "circle") {
    for (let i = 0;i < ticks; i++) {
      const r = radius * (i + 1) / ticks;
      g.append("circle").attr("r", r).attr("class", "radarGraticule");
    }
  } else if (graticule === "polygon") {
    const numAxes = axes.length;
    for (let i = 0;i < ticks; i++) {
      const r = radius * (i + 1) / ticks;
      const points = axes.map((_, j) => {
        const angle = 2 * j * Math.PI / numAxes - Math.PI / 2;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        return `${x},${y}`;
      }).join(" ");
      g.append("polygon").attr("points", points).attr("class", "radarGraticule");
    }
  }
}, "drawGraticule");
var drawAxes = /* @__PURE__ */ __name((g, axes, radius, config) => {
  const numAxes = axes.length;
  for (let i = 0;i < numAxes; i++) {
    const label = axes[i].label;
    const angle = 2 * i * Math.PI / numAxes - Math.PI / 2;
    g.append("line").attr("x1", 0).attr("y1", 0).attr("x2", radius * config.axisScaleFactor * Math.cos(angle)).attr("y2", radius * config.axisScaleFactor * Math.sin(angle)).attr("class", "radarAxisLine");
    g.append("text").text(label).attr("x", radius * config.axisLabelFactor * Math.cos(angle)).attr("y", radius * config.axisLabelFactor * Math.sin(angle)).attr("class", "radarAxisLabel");
  }
}, "drawAxes");
function drawCurves(g, axes, curves, minValue, maxValue, graticule, config) {
  const numAxes = axes.length;
  const radius = Math.min(config.width, config.height) / 2;
  curves.forEach((curve, index) => {
    if (curve.entries.length !== numAxes) {
      return;
    }
    const points = curve.entries.map((entry, i) => {
      const angle = 2 * Math.PI * i / numAxes - Math.PI / 2;
      const r = relativeRadius(entry, minValue, maxValue, radius);
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);
      return { x, y };
    });
    if (graticule === "circle") {
      g.append("path").attr("d", closedRoundCurve(points, config.curveTension)).attr("class", `radarCurve-${index}`);
    } else if (graticule === "polygon") {
      g.append("polygon").attr("points", points.map((p) => `${p.x},${p.y}`).join(" ")).attr("class", `radarCurve-${index}`);
    }
  });
}
__name(drawCurves, "drawCurves");
function relativeRadius(value, minValue, maxValue, radius) {
  const clippedValue = Math.min(Math.max(value, minValue), maxValue);
  return radius * (clippedValue - minValue) / (maxValue - minValue);
}
__name(relativeRadius, "relativeRadius");
function closedRoundCurve(points, tension) {
  const numPoints = points.length;
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0;i < numPoints; i++) {
    const p0 = points[(i - 1 + numPoints) % numPoints];
    const p1 = points[i];
    const p2 = points[(i + 1) % numPoints];
    const p3 = points[(i + 2) % numPoints];
    const cp1 = {
      x: p1.x + (p2.x - p0.x) * tension,
      y: p1.y + (p2.y - p0.y) * tension
    };
    const cp2 = {
      x: p2.x - (p3.x - p1.x) * tension,
      y: p2.y - (p3.y - p1.y) * tension
    };
    d += ` C${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${p2.x},${p2.y}`;
  }
  return `${d} Z`;
}
__name(closedRoundCurve, "closedRoundCurve");
function drawLegend(g, curves, showLegend, config) {
  if (!showLegend) {
    return;
  }
  const legendX = (config.width / 2 + config.marginRight) * 3 / 4;
  const legendY = -(config.height / 2 + config.marginTop) * 3 / 4;
  const lineHeight = 20;
  curves.forEach((curve, index) => {
    const itemGroup = g.append("g").attr("transform", `translate(${legendX}, ${legendY + index * lineHeight})`);
    itemGroup.append("rect").attr("width", 12).attr("height", 12).attr("class", `radarLegendBox-${index}`);
    itemGroup.append("text").attr("x", 16).attr("y", 0).attr("class", "radarLegendText").text(curve.label);
  });
}
__name(drawLegend, "drawLegend");
var renderer = { draw };
var genIndexStyles = /* @__PURE__ */ __name((themeVariables, radarOptions) => {
  let sections = "";
  for (let i = 0;i < themeVariables.THEME_COLOR_LIMIT; i++) {
    const indexColor = themeVariables[`cScale${i}`];
    sections += `
		.radarCurve-${i} {
			color: ${indexColor};
			fill: ${indexColor};
			fill-opacity: ${radarOptions.curveOpacity};
			stroke: ${indexColor};
			stroke-width: ${radarOptions.curveStrokeWidth};
		}
		.radarLegendBox-${i} {
			fill: ${indexColor};
			fill-opacity: ${radarOptions.curveOpacity};
			stroke: ${indexColor};
		}
		`;
  }
  return sections;
}, "genIndexStyles");
var buildRadarStyleOptions = /* @__PURE__ */ __name((radar) => {
  const defaultThemeVariables = getThemeVariables3();
  const currentConfig = getConfig();
  const themeVariables = cleanAndMerge(defaultThemeVariables, currentConfig.themeVariables);
  const radarOptions = cleanAndMerge(themeVariables.radar, radar);
  return { themeVariables, radarOptions };
}, "buildRadarStyleOptions");
var styles = /* @__PURE__ */ __name(({ radar } = {}) => {
  const { themeVariables, radarOptions } = buildRadarStyleOptions(radar);
  return `
	.radarTitle {
		font-size: ${themeVariables.fontSize};
		color: ${themeVariables.titleColor};
		dominant-baseline: hanging;
		text-anchor: middle;
	}
	.radarAxisLine {
		stroke: ${radarOptions.axisColor};
		stroke-width: ${radarOptions.axisStrokeWidth};
	}
	.radarAxisLabel {
		dominant-baseline: middle;
		text-anchor: middle;
		font-size: ${radarOptions.axisLabelFontSize}px;
		color: ${radarOptions.axisColor};
	}
	.radarGraticule {
		fill: ${radarOptions.graticuleColor};
		fill-opacity: ${radarOptions.graticuleOpacity};
		stroke: ${radarOptions.graticuleColor};
		stroke-width: ${radarOptions.graticuleStrokeWidth};
	}
	.radarLegendText {
		text-anchor: start;
		font-size: ${radarOptions.legendFontSize}px;
		dominant-baseline: hanging;
	}
	${genIndexStyles(themeVariables, radarOptions)}
	`;
}, "styles");
var diagram = {
  parser,
  db,
  renderer,
  styles
};
export {
  diagram
};

//# debugId=122B02BDC3200B3964756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2RpYWdyYW0tMkFFQ0dSUlEubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgImltcG9ydCB7XG4gIHNlbGVjdFN2Z0VsZW1lbnRcbn0gZnJvbSBcIi4vY2h1bmstV1U1TVlHMkcubWpzXCI7XG5pbXBvcnQge1xuICBwb3B1bGF0ZUNvbW1vbkRiXG59IGZyb20gXCIuL2NodW5rLTRCWDJWVUFCLm1qc1wiO1xuaW1wb3J0IHtcbiAgY2xlYW5BbmRNZXJnZVxufSBmcm9tIFwiLi9jaHVuay01WlFZSFhLVS5tanNcIjtcbmltcG9ydCB7XG4gIGNsZWFyLFxuICBjb25maWd1cmVTdmdTaXplLFxuICBkZWZhdWx0Q29uZmlnX2RlZmF1bHQsXG4gIGdldEFjY0Rlc2NyaXB0aW9uLFxuICBnZXRBY2NUaXRsZSxcbiAgZ2V0Q29uZmlnLFxuICBnZXREaWFncmFtVGl0bGUsXG4gIGdldFRoZW1lVmFyaWFibGVzLFxuICBzZXRBY2NEZXNjcmlwdGlvbixcbiAgc2V0QWNjVGl0bGUsXG4gIHNldERpYWdyYW1UaXRsZVxufSBmcm9tIFwiLi9jaHVuay1DU0NJSEs3US5tanNcIjtcbmltcG9ydCB7XG4gIF9fbmFtZSxcbiAgbG9nXG59IGZyb20gXCIuL2NodW5rLUFHSFJCNEpGLm1qc1wiO1xuXG4vLyBzcmMvZGlhZ3JhbXMvcmFkYXIvZGIudHNcbnZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgc2hvd0xlZ2VuZDogdHJ1ZSxcbiAgdGlja3M6IDUsXG4gIG1heDogbnVsbCxcbiAgbWluOiAwLFxuICBncmF0aWN1bGU6IFwiY2lyY2xlXCJcbn07XG52YXIgZGVmYXVsdFJhZGFyRGF0YSA9IHtcbiAgYXhlczogW10sXG4gIGN1cnZlczogW10sXG4gIG9wdGlvbnM6IGRlZmF1bHRPcHRpb25zXG59O1xudmFyIGRhdGEgPSBzdHJ1Y3R1cmVkQ2xvbmUoZGVmYXVsdFJhZGFyRGF0YSk7XG52YXIgREVGQVVMVF9SQURBUl9DT05GSUcgPSBkZWZhdWx0Q29uZmlnX2RlZmF1bHQucmFkYXI7XG52YXIgZ2V0Q29uZmlnMiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKCkgPT4ge1xuICBjb25zdCBjb25maWcgPSBjbGVhbkFuZE1lcmdlKHtcbiAgICAuLi5ERUZBVUxUX1JBREFSX0NPTkZJRyxcbiAgICAuLi5nZXRDb25maWcoKS5yYWRhclxuICB9KTtcbiAgcmV0dXJuIGNvbmZpZztcbn0sIFwiZ2V0Q29uZmlnXCIpO1xudmFyIGdldEF4ZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCgpID0+IGRhdGEuYXhlcywgXCJnZXRBeGVzXCIpO1xudmFyIGdldEN1cnZlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKCkgPT4gZGF0YS5jdXJ2ZXMsIFwiZ2V0Q3VydmVzXCIpO1xudmFyIGdldE9wdGlvbnMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCgpID0+IGRhdGEub3B0aW9ucywgXCJnZXRPcHRpb25zXCIpO1xudmFyIHNldEF4ZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChheGVzKSA9PiB7XG4gIGRhdGEuYXhlcyA9IGF4ZXMubWFwKChheGlzKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IGF4aXMubmFtZSxcbiAgICAgIGxhYmVsOiBheGlzLmxhYmVsID8/IGF4aXMubmFtZVxuICAgIH07XG4gIH0pO1xufSwgXCJzZXRBeGVzXCIpO1xudmFyIHNldEN1cnZlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGN1cnZlcykgPT4ge1xuICBkYXRhLmN1cnZlcyA9IGN1cnZlcy5tYXAoKGN1cnZlKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IGN1cnZlLm5hbWUsXG4gICAgICBsYWJlbDogY3VydmUubGFiZWwgPz8gY3VydmUubmFtZSxcbiAgICAgIGVudHJpZXM6IGNvbXB1dGVDdXJ2ZUVudHJpZXMoY3VydmUuZW50cmllcylcbiAgICB9O1xuICB9KTtcbn0sIFwic2V0Q3VydmVzXCIpO1xudmFyIGNvbXB1dGVDdXJ2ZUVudHJpZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChlbnRyaWVzKSA9PiB7XG4gIGlmIChlbnRyaWVzWzBdLmF4aXMgPT0gdm9pZCAwKSB7XG4gICAgcmV0dXJuIGVudHJpZXMubWFwKChlbnRyeSkgPT4gZW50cnkudmFsdWUpO1xuICB9XG4gIGNvbnN0IGF4ZXMgPSBnZXRBeGVzKCk7XG4gIGlmIChheGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkF4ZXMgbXVzdCBiZSBwb3B1bGF0ZWQgYmVmb3JlIGN1cnZlcyBmb3IgcmVmZXJlbmNlIGVudHJpZXNcIik7XG4gIH1cbiAgcmV0dXJuIGF4ZXMubWFwKChheGlzKSA9PiB7XG4gICAgY29uc3QgZW50cnkgPSBlbnRyaWVzLmZpbmQoKGVudHJ5MikgPT4gZW50cnkyLmF4aXM/LiRyZWZUZXh0ID09PSBheGlzLm5hbWUpO1xuICAgIGlmIChlbnRyeSA9PT0gdm9pZCAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIGVudHJ5IGZvciBheGlzIFwiICsgYXhpcy5sYWJlbCk7XG4gICAgfVxuICAgIHJldHVybiBlbnRyeS52YWx1ZTtcbiAgfSk7XG59LCBcImNvbXB1dGVDdXJ2ZUVudHJpZXNcIik7XG52YXIgc2V0T3B0aW9ucyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKG9wdGlvbnMpID0+IHtcbiAgY29uc3Qgb3B0aW9uTWFwID0gb3B0aW9ucy5yZWR1Y2UoXG4gICAgKGFjYywgb3B0aW9uKSA9PiB7XG4gICAgICBhY2Nbb3B0aW9uLm5hbWVdID0gb3B0aW9uO1xuICAgICAgcmV0dXJuIGFjYztcbiAgICB9LFxuICAgIHt9XG4gICk7XG4gIGRhdGEub3B0aW9ucyA9IHtcbiAgICBzaG93TGVnZW5kOiBvcHRpb25NYXAuc2hvd0xlZ2VuZD8udmFsdWUgPz8gZGVmYXVsdE9wdGlvbnMuc2hvd0xlZ2VuZCxcbiAgICB0aWNrczogb3B0aW9uTWFwLnRpY2tzPy52YWx1ZSA/PyBkZWZhdWx0T3B0aW9ucy50aWNrcyxcbiAgICBtYXg6IG9wdGlvbk1hcC5tYXg/LnZhbHVlID8/IGRlZmF1bHRPcHRpb25zLm1heCxcbiAgICBtaW46IG9wdGlvbk1hcC5taW4/LnZhbHVlID8/IGRlZmF1bHRPcHRpb25zLm1pbixcbiAgICBncmF0aWN1bGU6IG9wdGlvbk1hcC5ncmF0aWN1bGU/LnZhbHVlID8/IGRlZmF1bHRPcHRpb25zLmdyYXRpY3VsZVxuICB9O1xufSwgXCJzZXRPcHRpb25zXCIpO1xudmFyIGNsZWFyMiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKCkgPT4ge1xuICBjbGVhcigpO1xuICBkYXRhID0gc3RydWN0dXJlZENsb25lKGRlZmF1bHRSYWRhckRhdGEpO1xufSwgXCJjbGVhclwiKTtcbnZhciBkYiA9IHtcbiAgZ2V0QXhlcyxcbiAgZ2V0Q3VydmVzLFxuICBnZXRPcHRpb25zLFxuICBzZXRBeGVzLFxuICBzZXRDdXJ2ZXMsXG4gIHNldE9wdGlvbnMsXG4gIGdldENvbmZpZzogZ2V0Q29uZmlnMixcbiAgY2xlYXI6IGNsZWFyMixcbiAgc2V0QWNjVGl0bGUsXG4gIGdldEFjY1RpdGxlLFxuICBzZXREaWFncmFtVGl0bGUsXG4gIGdldERpYWdyYW1UaXRsZSxcbiAgZ2V0QWNjRGVzY3JpcHRpb24sXG4gIHNldEFjY0Rlc2NyaXB0aW9uXG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMvcmFkYXIvcGFyc2VyLnRzXG5pbXBvcnQgeyBwYXJzZSB9IGZyb20gXCJAbWVybWFpZC1qcy9wYXJzZXJcIjtcbnZhciBwb3B1bGF0ZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGFzdCkgPT4ge1xuICBwb3B1bGF0ZUNvbW1vbkRiKGFzdCwgZGIpO1xuICBjb25zdCB7IGF4ZXMsIGN1cnZlcywgb3B0aW9ucyB9ID0gYXN0O1xuICBkYi5zZXRBeGVzKGF4ZXMpO1xuICBkYi5zZXRDdXJ2ZXMoY3VydmVzKTtcbiAgZGIuc2V0T3B0aW9ucyhvcHRpb25zKTtcbn0sIFwicG9wdWxhdGVcIik7XG52YXIgcGFyc2VyID0ge1xuICBwYXJzZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAoaW5wdXQpID0+IHtcbiAgICBjb25zdCBhc3QgPSBhd2FpdCBwYXJzZShcInJhZGFyXCIsIGlucHV0KTtcbiAgICBsb2cuZGVidWcoYXN0KTtcbiAgICBwb3B1bGF0ZShhc3QpO1xuICB9LCBcInBhcnNlXCIpXG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMvcmFkYXIvcmVuZGVyZXIudHNcbnZhciBkcmF3ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoX3RleHQsIGlkLCBfdmVyc2lvbiwgZGlhZ3JhbTIpID0+IHtcbiAgY29uc3QgZGIyID0gZGlhZ3JhbTIuZGI7XG4gIGNvbnN0IGF4ZXMgPSBkYjIuZ2V0QXhlcygpO1xuICBjb25zdCBjdXJ2ZXMgPSBkYjIuZ2V0Q3VydmVzKCk7XG4gIGNvbnN0IG9wdGlvbnMgPSBkYjIuZ2V0T3B0aW9ucygpO1xuICBjb25zdCBjb25maWcgPSBkYjIuZ2V0Q29uZmlnKCk7XG4gIGNvbnN0IHRpdGxlID0gZGIyLmdldERpYWdyYW1UaXRsZSgpO1xuICBjb25zdCBzdmcgPSBzZWxlY3RTdmdFbGVtZW50KGlkKTtcbiAgY29uc3QgZyA9IGRyYXdGcmFtZShzdmcsIGNvbmZpZyk7XG4gIGNvbnN0IG1heFZhbHVlID0gb3B0aW9ucy5tYXggPz8gTWF0aC5tYXgoLi4uY3VydmVzLm1hcCgoY3VydmUpID0+IE1hdGgubWF4KC4uLmN1cnZlLmVudHJpZXMpKSk7XG4gIGNvbnN0IG1pblZhbHVlID0gb3B0aW9ucy5taW47XG4gIGNvbnN0IHJhZGl1cyA9IE1hdGgubWluKGNvbmZpZy53aWR0aCwgY29uZmlnLmhlaWdodCkgLyAyO1xuICBkcmF3R3JhdGljdWxlKGcsIGF4ZXMsIHJhZGl1cywgb3B0aW9ucy50aWNrcywgb3B0aW9ucy5ncmF0aWN1bGUpO1xuICBkcmF3QXhlcyhnLCBheGVzLCByYWRpdXMsIGNvbmZpZyk7XG4gIGRyYXdDdXJ2ZXMoZywgYXhlcywgY3VydmVzLCBtaW5WYWx1ZSwgbWF4VmFsdWUsIG9wdGlvbnMuZ3JhdGljdWxlLCBjb25maWcpO1xuICBkcmF3TGVnZW5kKGcsIGN1cnZlcywgb3B0aW9ucy5zaG93TGVnZW5kLCBjb25maWcpO1xuICBnLmFwcGVuZChcInRleHRcIikuYXR0cihcImNsYXNzXCIsIFwicmFkYXJUaXRsZVwiKS50ZXh0KHRpdGxlKS5hdHRyKFwieFwiLCAwKS5hdHRyKFwieVwiLCAtY29uZmlnLmhlaWdodCAvIDIgLSBjb25maWcubWFyZ2luVG9wKTtcbn0sIFwiZHJhd1wiKTtcbnZhciBkcmF3RnJhbWUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChzdmcsIGNvbmZpZykgPT4ge1xuICBjb25zdCB0b3RhbFdpZHRoID0gY29uZmlnLndpZHRoICsgY29uZmlnLm1hcmdpbkxlZnQgKyBjb25maWcubWFyZ2luUmlnaHQ7XG4gIGNvbnN0IHRvdGFsSGVpZ2h0ID0gY29uZmlnLmhlaWdodCArIGNvbmZpZy5tYXJnaW5Ub3AgKyBjb25maWcubWFyZ2luQm90dG9tO1xuICBjb25zdCBjZW50ZXIgPSB7XG4gICAgeDogY29uZmlnLm1hcmdpbkxlZnQgKyBjb25maWcud2lkdGggLyAyLFxuICAgIHk6IGNvbmZpZy5tYXJnaW5Ub3AgKyBjb25maWcuaGVpZ2h0IC8gMlxuICB9O1xuICBjb25maWd1cmVTdmdTaXplKHN2ZywgdG90YWxIZWlnaHQsIHRvdGFsV2lkdGgsIGNvbmZpZy51c2VNYXhXaWR0aCA/PyB0cnVlKTtcbiAgc3ZnLmF0dHIoXCJ2aWV3Qm94XCIsIGAwIDAgJHt0b3RhbFdpZHRofSAke3RvdGFsSGVpZ2h0fWApO1xuICByZXR1cm4gc3ZnLmFwcGVuZChcImdcIikuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7Y2VudGVyLnh9LCAke2NlbnRlci55fSlgKTtcbn0sIFwiZHJhd0ZyYW1lXCIpO1xudmFyIGRyYXdHcmF0aWN1bGUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChnLCBheGVzLCByYWRpdXMsIHRpY2tzLCBncmF0aWN1bGUpID0+IHtcbiAgaWYgKGdyYXRpY3VsZSA9PT0gXCJjaXJjbGVcIikge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGlja3M7IGkrKykge1xuICAgICAgY29uc3QgciA9IHJhZGl1cyAqIChpICsgMSkgLyB0aWNrcztcbiAgICAgIGcuYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJyXCIsIHIpLmF0dHIoXCJjbGFzc1wiLCBcInJhZGFyR3JhdGljdWxlXCIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChncmF0aWN1bGUgPT09IFwicG9seWdvblwiKSB7XG4gICAgY29uc3QgbnVtQXhlcyA9IGF4ZXMubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGlja3M7IGkrKykge1xuICAgICAgY29uc3QgciA9IHJhZGl1cyAqIChpICsgMSkgLyB0aWNrcztcbiAgICAgIGNvbnN0IHBvaW50cyA9IGF4ZXMubWFwKChfLCBqKSA9PiB7XG4gICAgICAgIGNvbnN0IGFuZ2xlID0gMiAqIGogKiBNYXRoLlBJIC8gbnVtQXhlcyAtIE1hdGguUEkgLyAyO1xuICAgICAgICBjb25zdCB4ID0gciAqIE1hdGguY29zKGFuZ2xlKTtcbiAgICAgICAgY29uc3QgeSA9IHIgKiBNYXRoLnNpbihhbmdsZSk7XG4gICAgICAgIHJldHVybiBgJHt4fSwke3l9YDtcbiAgICAgIH0pLmpvaW4oXCIgXCIpO1xuICAgICAgZy5hcHBlbmQoXCJwb2x5Z29uXCIpLmF0dHIoXCJwb2ludHNcIiwgcG9pbnRzKS5hdHRyKFwiY2xhc3NcIiwgXCJyYWRhckdyYXRpY3VsZVwiKTtcbiAgICB9XG4gIH1cbn0sIFwiZHJhd0dyYXRpY3VsZVwiKTtcbnZhciBkcmF3QXhlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGcsIGF4ZXMsIHJhZGl1cywgY29uZmlnKSA9PiB7XG4gIGNvbnN0IG51bUF4ZXMgPSBheGVzLmxlbmd0aDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1BeGVzOyBpKyspIHtcbiAgICBjb25zdCBsYWJlbCA9IGF4ZXNbaV0ubGFiZWw7XG4gICAgY29uc3QgYW5nbGUgPSAyICogaSAqIE1hdGguUEkgLyBudW1BeGVzIC0gTWF0aC5QSSAvIDI7XG4gICAgZy5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJ4MVwiLCAwKS5hdHRyKFwieTFcIiwgMCkuYXR0cihcIngyXCIsIHJhZGl1cyAqIGNvbmZpZy5heGlzU2NhbGVGYWN0b3IgKiBNYXRoLmNvcyhhbmdsZSkpLmF0dHIoXCJ5MlwiLCByYWRpdXMgKiBjb25maWcuYXhpc1NjYWxlRmFjdG9yICogTWF0aC5zaW4oYW5nbGUpKS5hdHRyKFwiY2xhc3NcIiwgXCJyYWRhckF4aXNMaW5lXCIpO1xuICAgIGcuYXBwZW5kKFwidGV4dFwiKS50ZXh0KGxhYmVsKS5hdHRyKFwieFwiLCByYWRpdXMgKiBjb25maWcuYXhpc0xhYmVsRmFjdG9yICogTWF0aC5jb3MoYW5nbGUpKS5hdHRyKFwieVwiLCByYWRpdXMgKiBjb25maWcuYXhpc0xhYmVsRmFjdG9yICogTWF0aC5zaW4oYW5nbGUpKS5hdHRyKFwiY2xhc3NcIiwgXCJyYWRhckF4aXNMYWJlbFwiKTtcbiAgfVxufSwgXCJkcmF3QXhlc1wiKTtcbmZ1bmN0aW9uIGRyYXdDdXJ2ZXMoZywgYXhlcywgY3VydmVzLCBtaW5WYWx1ZSwgbWF4VmFsdWUsIGdyYXRpY3VsZSwgY29uZmlnKSB7XG4gIGNvbnN0IG51bUF4ZXMgPSBheGVzLmxlbmd0aDtcbiAgY29uc3QgcmFkaXVzID0gTWF0aC5taW4oY29uZmlnLndpZHRoLCBjb25maWcuaGVpZ2h0KSAvIDI7XG4gIGN1cnZlcy5mb3JFYWNoKChjdXJ2ZSwgaW5kZXgpID0+IHtcbiAgICBpZiAoY3VydmUuZW50cmllcy5sZW5ndGggIT09IG51bUF4ZXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcG9pbnRzID0gY3VydmUuZW50cmllcy5tYXAoKGVudHJ5LCBpKSA9PiB7XG4gICAgICBjb25zdCBhbmdsZSA9IDIgKiBNYXRoLlBJICogaSAvIG51bUF4ZXMgLSBNYXRoLlBJIC8gMjtcbiAgICAgIGNvbnN0IHIgPSByZWxhdGl2ZVJhZGl1cyhlbnRyeSwgbWluVmFsdWUsIG1heFZhbHVlLCByYWRpdXMpO1xuICAgICAgY29uc3QgeCA9IHIgKiBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICBjb25zdCB5ID0gciAqIE1hdGguc2luKGFuZ2xlKTtcbiAgICAgIHJldHVybiB7IHgsIHkgfTtcbiAgICB9KTtcbiAgICBpZiAoZ3JhdGljdWxlID09PSBcImNpcmNsZVwiKSB7XG4gICAgICBnLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgY2xvc2VkUm91bmRDdXJ2ZShwb2ludHMsIGNvbmZpZy5jdXJ2ZVRlbnNpb24pKS5hdHRyKFwiY2xhc3NcIiwgYHJhZGFyQ3VydmUtJHtpbmRleH1gKTtcbiAgICB9IGVsc2UgaWYgKGdyYXRpY3VsZSA9PT0gXCJwb2x5Z29uXCIpIHtcbiAgICAgIGcuYXBwZW5kKFwicG9seWdvblwiKS5hdHRyKFwicG9pbnRzXCIsIHBvaW50cy5tYXAoKHApID0+IGAke3AueH0sJHtwLnl9YCkuam9pbihcIiBcIikpLmF0dHIoXCJjbGFzc1wiLCBgcmFkYXJDdXJ2ZS0ke2luZGV4fWApO1xuICAgIH1cbiAgfSk7XG59XG5fX25hbWUoZHJhd0N1cnZlcywgXCJkcmF3Q3VydmVzXCIpO1xuZnVuY3Rpb24gcmVsYXRpdmVSYWRpdXModmFsdWUsIG1pblZhbHVlLCBtYXhWYWx1ZSwgcmFkaXVzKSB7XG4gIGNvbnN0IGNsaXBwZWRWYWx1ZSA9IE1hdGgubWluKE1hdGgubWF4KHZhbHVlLCBtaW5WYWx1ZSksIG1heFZhbHVlKTtcbiAgcmV0dXJuIHJhZGl1cyAqIChjbGlwcGVkVmFsdWUgLSBtaW5WYWx1ZSkgLyAobWF4VmFsdWUgLSBtaW5WYWx1ZSk7XG59XG5fX25hbWUocmVsYXRpdmVSYWRpdXMsIFwicmVsYXRpdmVSYWRpdXNcIik7XG5mdW5jdGlvbiBjbG9zZWRSb3VuZEN1cnZlKHBvaW50cywgdGVuc2lvbikge1xuICBjb25zdCBudW1Qb2ludHMgPSBwb2ludHMubGVuZ3RoO1xuICBsZXQgZCA9IGBNJHtwb2ludHNbMF0ueH0sJHtwb2ludHNbMF0ueX1gO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG51bVBvaW50czsgaSsrKSB7XG4gICAgY29uc3QgcDAgPSBwb2ludHNbKGkgLSAxICsgbnVtUG9pbnRzKSAlIG51bVBvaW50c107XG4gICAgY29uc3QgcDEgPSBwb2ludHNbaV07XG4gICAgY29uc3QgcDIgPSBwb2ludHNbKGkgKyAxKSAlIG51bVBvaW50c107XG4gICAgY29uc3QgcDMgPSBwb2ludHNbKGkgKyAyKSAlIG51bVBvaW50c107XG4gICAgY29uc3QgY3AxID0ge1xuICAgICAgeDogcDEueCArIChwMi54IC0gcDAueCkgKiB0ZW5zaW9uLFxuICAgICAgeTogcDEueSArIChwMi55IC0gcDAueSkgKiB0ZW5zaW9uXG4gICAgfTtcbiAgICBjb25zdCBjcDIgPSB7XG4gICAgICB4OiBwMi54IC0gKHAzLnggLSBwMS54KSAqIHRlbnNpb24sXG4gICAgICB5OiBwMi55IC0gKHAzLnkgLSBwMS55KSAqIHRlbnNpb25cbiAgICB9O1xuICAgIGQgKz0gYCBDJHtjcDEueH0sJHtjcDEueX0gJHtjcDIueH0sJHtjcDIueX0gJHtwMi54fSwke3AyLnl9YDtcbiAgfVxuICByZXR1cm4gYCR7ZH0gWmA7XG59XG5fX25hbWUoY2xvc2VkUm91bmRDdXJ2ZSwgXCJjbG9zZWRSb3VuZEN1cnZlXCIpO1xuZnVuY3Rpb24gZHJhd0xlZ2VuZChnLCBjdXJ2ZXMsIHNob3dMZWdlbmQsIGNvbmZpZykge1xuICBpZiAoIXNob3dMZWdlbmQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgbGVnZW5kWCA9IChjb25maWcud2lkdGggLyAyICsgY29uZmlnLm1hcmdpblJpZ2h0KSAqIDMgLyA0O1xuICBjb25zdCBsZWdlbmRZID0gLShjb25maWcuaGVpZ2h0IC8gMiArIGNvbmZpZy5tYXJnaW5Ub3ApICogMyAvIDQ7XG4gIGNvbnN0IGxpbmVIZWlnaHQgPSAyMDtcbiAgY3VydmVzLmZvckVhY2goKGN1cnZlLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IGl0ZW1Hcm91cCA9IGcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHtsZWdlbmRYfSwgJHtsZWdlbmRZICsgaW5kZXggKiBsaW5lSGVpZ2h0fSlgKTtcbiAgICBpdGVtR3JvdXAuYXBwZW5kKFwicmVjdFwiKS5hdHRyKFwid2lkdGhcIiwgMTIpLmF0dHIoXCJoZWlnaHRcIiwgMTIpLmF0dHIoXCJjbGFzc1wiLCBgcmFkYXJMZWdlbmRCb3gtJHtpbmRleH1gKTtcbiAgICBpdGVtR3JvdXAuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwieFwiLCAxNikuYXR0cihcInlcIiwgMCkuYXR0cihcImNsYXNzXCIsIFwicmFkYXJMZWdlbmRUZXh0XCIpLnRleHQoY3VydmUubGFiZWwpO1xuICB9KTtcbn1cbl9fbmFtZShkcmF3TGVnZW5kLCBcImRyYXdMZWdlbmRcIik7XG52YXIgcmVuZGVyZXIgPSB7IGRyYXcgfTtcblxuLy8gc3JjL2RpYWdyYW1zL3JhZGFyL3N0eWxlcy50c1xudmFyIGdlbkluZGV4U3R5bGVzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgodGhlbWVWYXJpYWJsZXMsIHJhZGFyT3B0aW9ucykgPT4ge1xuICBsZXQgc2VjdGlvbnMgPSBcIlwiO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHRoZW1lVmFyaWFibGVzLlRIRU1FX0NPTE9SX0xJTUlUOyBpKyspIHtcbiAgICBjb25zdCBpbmRleENvbG9yID0gdGhlbWVWYXJpYWJsZXNbYGNTY2FsZSR7aX1gXTtcbiAgICBzZWN0aW9ucyArPSBgXG5cdFx0LnJhZGFyQ3VydmUtJHtpfSB7XG5cdFx0XHRjb2xvcjogJHtpbmRleENvbG9yfTtcblx0XHRcdGZpbGw6ICR7aW5kZXhDb2xvcn07XG5cdFx0XHRmaWxsLW9wYWNpdHk6ICR7cmFkYXJPcHRpb25zLmN1cnZlT3BhY2l0eX07XG5cdFx0XHRzdHJva2U6ICR7aW5kZXhDb2xvcn07XG5cdFx0XHRzdHJva2Utd2lkdGg6ICR7cmFkYXJPcHRpb25zLmN1cnZlU3Ryb2tlV2lkdGh9O1xuXHRcdH1cblx0XHQucmFkYXJMZWdlbmRCb3gtJHtpfSB7XG5cdFx0XHRmaWxsOiAke2luZGV4Q29sb3J9O1xuXHRcdFx0ZmlsbC1vcGFjaXR5OiAke3JhZGFyT3B0aW9ucy5jdXJ2ZU9wYWNpdHl9O1xuXHRcdFx0c3Ryb2tlOiAke2luZGV4Q29sb3J9O1xuXHRcdH1cblx0XHRgO1xuICB9XG4gIHJldHVybiBzZWN0aW9ucztcbn0sIFwiZ2VuSW5kZXhTdHlsZXNcIik7XG52YXIgYnVpbGRSYWRhclN0eWxlT3B0aW9ucyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHJhZGFyKSA9PiB7XG4gIGNvbnN0IGRlZmF1bHRUaGVtZVZhcmlhYmxlcyA9IGdldFRoZW1lVmFyaWFibGVzKCk7XG4gIGNvbnN0IGN1cnJlbnRDb25maWcgPSBnZXRDb25maWcoKTtcbiAgY29uc3QgdGhlbWVWYXJpYWJsZXMgPSBjbGVhbkFuZE1lcmdlKGRlZmF1bHRUaGVtZVZhcmlhYmxlcywgY3VycmVudENvbmZpZy50aGVtZVZhcmlhYmxlcyk7XG4gIGNvbnN0IHJhZGFyT3B0aW9ucyA9IGNsZWFuQW5kTWVyZ2UodGhlbWVWYXJpYWJsZXMucmFkYXIsIHJhZGFyKTtcbiAgcmV0dXJuIHsgdGhlbWVWYXJpYWJsZXMsIHJhZGFyT3B0aW9ucyB9O1xufSwgXCJidWlsZFJhZGFyU3R5bGVPcHRpb25zXCIpO1xudmFyIHN0eWxlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHsgcmFkYXIgfSA9IHt9KSA9PiB7XG4gIGNvbnN0IHsgdGhlbWVWYXJpYWJsZXMsIHJhZGFyT3B0aW9ucyB9ID0gYnVpbGRSYWRhclN0eWxlT3B0aW9ucyhyYWRhcik7XG4gIHJldHVybiBgXG5cdC5yYWRhclRpdGxlIHtcblx0XHRmb250LXNpemU6ICR7dGhlbWVWYXJpYWJsZXMuZm9udFNpemV9O1xuXHRcdGNvbG9yOiAke3RoZW1lVmFyaWFibGVzLnRpdGxlQ29sb3J9O1xuXHRcdGRvbWluYW50LWJhc2VsaW5lOiBoYW5naW5nO1xuXHRcdHRleHQtYW5jaG9yOiBtaWRkbGU7XG5cdH1cblx0LnJhZGFyQXhpc0xpbmUge1xuXHRcdHN0cm9rZTogJHtyYWRhck9wdGlvbnMuYXhpc0NvbG9yfTtcblx0XHRzdHJva2Utd2lkdGg6ICR7cmFkYXJPcHRpb25zLmF4aXNTdHJva2VXaWR0aH07XG5cdH1cblx0LnJhZGFyQXhpc0xhYmVsIHtcblx0XHRkb21pbmFudC1iYXNlbGluZTogbWlkZGxlO1xuXHRcdHRleHQtYW5jaG9yOiBtaWRkbGU7XG5cdFx0Zm9udC1zaXplOiAke3JhZGFyT3B0aW9ucy5heGlzTGFiZWxGb250U2l6ZX1weDtcblx0XHRjb2xvcjogJHtyYWRhck9wdGlvbnMuYXhpc0NvbG9yfTtcblx0fVxuXHQucmFkYXJHcmF0aWN1bGUge1xuXHRcdGZpbGw6ICR7cmFkYXJPcHRpb25zLmdyYXRpY3VsZUNvbG9yfTtcblx0XHRmaWxsLW9wYWNpdHk6ICR7cmFkYXJPcHRpb25zLmdyYXRpY3VsZU9wYWNpdHl9O1xuXHRcdHN0cm9rZTogJHtyYWRhck9wdGlvbnMuZ3JhdGljdWxlQ29sb3J9O1xuXHRcdHN0cm9rZS13aWR0aDogJHtyYWRhck9wdGlvbnMuZ3JhdGljdWxlU3Ryb2tlV2lkdGh9O1xuXHR9XG5cdC5yYWRhckxlZ2VuZFRleHQge1xuXHRcdHRleHQtYW5jaG9yOiBzdGFydDtcblx0XHRmb250LXNpemU6ICR7cmFkYXJPcHRpb25zLmxlZ2VuZEZvbnRTaXplfXB4O1xuXHRcdGRvbWluYW50LWJhc2VsaW5lOiBoYW5naW5nO1xuXHR9XG5cdCR7Z2VuSW5kZXhTdHlsZXModGhlbWVWYXJpYWJsZXMsIHJhZGFyT3B0aW9ucyl9XG5cdGA7XG59LCBcInN0eWxlc1wiKTtcblxuLy8gc3JjL2RpYWdyYW1zL3JhZGFyL2RpYWdyYW0udHNcbnZhciBkaWFncmFtID0ge1xuICBwYXJzZXIsXG4gIGRiLFxuICByZW5kZXJlcixcbiAgc3R5bGVzXG59O1xuZXhwb3J0IHtcbiAgZGlhZ3JhbVxufTtcbiIKICBdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNEJBLElBQUksaUJBQWlCO0FBQUEsRUFDbkIsWUFBWTtBQUFBLEVBQ1osT0FBTztBQUFBLEVBQ1AsS0FBSztBQUFBLEVBQ0wsS0FBSztBQUFBLEVBQ0wsV0FBVztBQUNiO0FBQ0EsSUFBSSxtQkFBbUI7QUFBQSxFQUNyQixNQUFNLENBQUM7QUFBQSxFQUNQLFFBQVEsQ0FBQztBQUFBLEVBQ1QsU0FBUztBQUNYO0FBQ0EsSUFBSSxPQUFPLGdCQUFnQixnQkFBZ0I7QUFDM0MsSUFBSSx1QkFBdUIsc0JBQXNCO0FBQ2pELElBQUksNkJBQTZCLE9BQU8sTUFBTTtBQUFBLEVBQzVDLE1BQU0sU0FBUyxjQUFjO0FBQUEsT0FDeEI7QUFBQSxPQUNBLFVBQVUsRUFBRTtBQUFBLEVBQ2pCLENBQUM7QUFBQSxFQUNELE9BQU87QUFBQSxHQUNOLFdBQVc7QUFDZCxJQUFJLDBCQUEwQixPQUFPLE1BQU0sS0FBSyxNQUFNLFNBQVM7QUFDL0QsSUFBSSw0QkFBNEIsT0FBTyxNQUFNLEtBQUssUUFBUSxXQUFXO0FBQ3JFLElBQUksNkJBQTZCLE9BQU8sTUFBTSxLQUFLLFNBQVMsWUFBWTtBQUN4RSxJQUFJLDBCQUEwQixPQUFPLENBQUMsU0FBUztBQUFBLEVBQzdDLEtBQUssT0FBTyxLQUFLLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDN0IsT0FBTztBQUFBLE1BQ0wsTUFBTSxLQUFLO0FBQUEsTUFDWCxPQUFPLEtBQUssU0FBUyxLQUFLO0FBQUEsSUFDNUI7QUFBQSxHQUNEO0FBQUEsR0FDQSxTQUFTO0FBQ1osSUFBSSw0QkFBNEIsT0FBTyxDQUFDLFdBQVc7QUFBQSxFQUNqRCxLQUFLLFNBQVMsT0FBTyxJQUFJLENBQUMsVUFBVTtBQUFBLElBQ2xDLE9BQU87QUFBQSxNQUNMLE1BQU0sTUFBTTtBQUFBLE1BQ1osT0FBTyxNQUFNLFNBQVMsTUFBTTtBQUFBLE1BQzVCLFNBQVMsb0JBQW9CLE1BQU0sT0FBTztBQUFBLElBQzVDO0FBQUEsR0FDRDtBQUFBLEdBQ0EsV0FBVztBQUNkLElBQUksc0NBQXNDLE9BQU8sQ0FBQyxZQUFZO0FBQUEsRUFDNUQsSUFBSSxRQUFRLEdBQUcsUUFBYSxXQUFHO0FBQUEsSUFDN0IsT0FBTyxRQUFRLElBQUksQ0FBQyxVQUFVLE1BQU0sS0FBSztBQUFBLEVBQzNDO0FBQUEsRUFDQSxNQUFNLE9BQU8sUUFBUTtBQUFBLEVBQ3JCLElBQUksS0FBSyxXQUFXLEdBQUc7QUFBQSxJQUNyQixNQUFNLElBQUksTUFBTSw0REFBNEQ7QUFBQSxFQUM5RTtBQUFBLEVBQ0EsT0FBTyxLQUFLLElBQUksQ0FBQyxTQUFTO0FBQUEsSUFDeEIsTUFBTSxRQUFRLFFBQVEsS0FBSyxDQUFDLFdBQVcsT0FBTyxNQUFNLGFBQWEsS0FBSyxJQUFJO0FBQUEsSUFDMUUsSUFBSSxVQUFlLFdBQUc7QUFBQSxNQUNwQixNQUFNLElBQUksTUFBTSw0QkFBNEIsS0FBSyxLQUFLO0FBQUEsSUFDeEQ7QUFBQSxJQUNBLE9BQU8sTUFBTTtBQUFBLEdBQ2Q7QUFBQSxHQUNBLHFCQUFxQjtBQUN4QixJQUFJLDZCQUE2QixPQUFPLENBQUMsWUFBWTtBQUFBLEVBQ25ELE1BQU0sWUFBWSxRQUFRLE9BQ3hCLENBQUMsS0FBSyxXQUFXO0FBQUEsSUFDZixJQUFJLE9BQU8sUUFBUTtBQUFBLElBQ25CLE9BQU87QUFBQSxLQUVULENBQUMsQ0FDSDtBQUFBLEVBQ0EsS0FBSyxVQUFVO0FBQUEsSUFDYixZQUFZLFVBQVUsWUFBWSxTQUFTLGVBQWU7QUFBQSxJQUMxRCxPQUFPLFVBQVUsT0FBTyxTQUFTLGVBQWU7QUFBQSxJQUNoRCxLQUFLLFVBQVUsS0FBSyxTQUFTLGVBQWU7QUFBQSxJQUM1QyxLQUFLLFVBQVUsS0FBSyxTQUFTLGVBQWU7QUFBQSxJQUM1QyxXQUFXLFVBQVUsV0FBVyxTQUFTLGVBQWU7QUFBQSxFQUMxRDtBQUFBLEdBQ0MsWUFBWTtBQUNmLElBQUkseUJBQXlCLE9BQU8sTUFBTTtBQUFBLEVBQ3hDLE1BQU07QUFBQSxFQUNOLE9BQU8sZ0JBQWdCLGdCQUFnQjtBQUFBLEdBQ3RDLE9BQU87QUFDVixJQUFJLEtBQUs7QUFBQSxFQUNQO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBLFdBQVc7QUFBQSxFQUNYLE9BQU87QUFBQSxFQUNQO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRjtBQUlBLElBQUksMkJBQTJCLE9BQU8sQ0FBQyxRQUFRO0FBQUEsRUFDN0MsaUJBQWlCLEtBQUssRUFBRTtBQUFBLEVBQ3hCLFFBQVEsTUFBTSxRQUFRLFlBQVk7QUFBQSxFQUNsQyxHQUFHLFFBQVEsSUFBSTtBQUFBLEVBQ2YsR0FBRyxVQUFVLE1BQU07QUFBQSxFQUNuQixHQUFHLFdBQVcsT0FBTztBQUFBLEdBQ3BCLFVBQVU7QUFDYixJQUFJLFNBQVM7QUFBQSxFQUNYLHVCQUF1QixPQUFPLE9BQU8sVUFBVTtBQUFBLElBQzdDLE1BQU0sTUFBTSxNQUFNLE1BQU0sU0FBUyxLQUFLO0FBQUEsSUFDdEMsSUFBSSxNQUFNLEdBQUc7QUFBQSxJQUNiLFNBQVMsR0FBRztBQUFBLEtBQ1gsT0FBTztBQUNaO0FBR0EsSUFBSSx1QkFBdUIsT0FBTyxDQUFDLE9BQU8sSUFBSSxVQUFVLGFBQWE7QUFBQSxFQUNuRSxNQUFNLE1BQU0sU0FBUztBQUFBLEVBQ3JCLE1BQU0sT0FBTyxJQUFJLFFBQVE7QUFBQSxFQUN6QixNQUFNLFNBQVMsSUFBSSxVQUFVO0FBQUEsRUFDN0IsTUFBTSxVQUFVLElBQUksV0FBVztBQUFBLEVBQy9CLE1BQU0sU0FBUyxJQUFJLFVBQVU7QUFBQSxFQUM3QixNQUFNLFFBQVEsSUFBSSxnQkFBZ0I7QUFBQSxFQUNsQyxNQUFNLE1BQU0saUJBQWlCLEVBQUU7QUFBQSxFQUMvQixNQUFNLElBQUksVUFBVSxLQUFLLE1BQU07QUFBQSxFQUMvQixNQUFNLFdBQVcsUUFBUSxPQUFPLEtBQUssSUFBSSxHQUFHLE9BQU8sSUFBSSxDQUFDLFVBQVUsS0FBSyxJQUFJLEdBQUcsTUFBTSxPQUFPLENBQUMsQ0FBQztBQUFBLEVBQzdGLE1BQU0sV0FBVyxRQUFRO0FBQUEsRUFDekIsTUFBTSxTQUFTLEtBQUssSUFBSSxPQUFPLE9BQU8sT0FBTyxNQUFNLElBQUk7QUFBQSxFQUN2RCxjQUFjLEdBQUcsTUFBTSxRQUFRLFFBQVEsT0FBTyxRQUFRLFNBQVM7QUFBQSxFQUMvRCxTQUFTLEdBQUcsTUFBTSxRQUFRLE1BQU07QUFBQSxFQUNoQyxXQUFXLEdBQUcsTUFBTSxRQUFRLFVBQVUsVUFBVSxRQUFRLFdBQVcsTUFBTTtBQUFBLEVBQ3pFLFdBQVcsR0FBRyxRQUFRLFFBQVEsWUFBWSxNQUFNO0FBQUEsRUFDaEQsRUFBRSxPQUFPLE1BQU0sRUFBRSxLQUFLLFNBQVMsWUFBWSxFQUFFLEtBQUssS0FBSyxFQUFFLEtBQUssS0FBSyxDQUFDLEVBQUUsS0FBSyxLQUFLLENBQUMsT0FBTyxTQUFTLElBQUksT0FBTyxTQUFTO0FBQUEsR0FDcEgsTUFBTTtBQUNULElBQUksNEJBQTRCLE9BQU8sQ0FBQyxLQUFLLFdBQVc7QUFBQSxFQUN0RCxNQUFNLGFBQWEsT0FBTyxRQUFRLE9BQU8sYUFBYSxPQUFPO0FBQUEsRUFDN0QsTUFBTSxjQUFjLE9BQU8sU0FBUyxPQUFPLFlBQVksT0FBTztBQUFBLEVBQzlELE1BQU0sU0FBUztBQUFBLElBQ2IsR0FBRyxPQUFPLGFBQWEsT0FBTyxRQUFRO0FBQUEsSUFDdEMsR0FBRyxPQUFPLFlBQVksT0FBTyxTQUFTO0FBQUEsRUFDeEM7QUFBQSxFQUNBLGlCQUFpQixLQUFLLGFBQWEsWUFBWSxPQUFPLGVBQWUsSUFBSTtBQUFBLEVBQ3pFLElBQUksS0FBSyxXQUFXLE9BQU8sY0FBYyxhQUFhO0FBQUEsRUFDdEQsT0FBTyxJQUFJLE9BQU8sR0FBRyxFQUFFLEtBQUssYUFBYSxhQUFhLE9BQU8sTUFBTSxPQUFPLElBQUk7QUFBQSxHQUM3RSxXQUFXO0FBQ2QsSUFBSSxnQ0FBZ0MsT0FBTyxDQUFDLEdBQUcsTUFBTSxRQUFRLE9BQU8sY0FBYztBQUFBLEVBQ2hGLElBQUksY0FBYyxVQUFVO0FBQUEsSUFDMUIsU0FBUyxJQUFJLEVBQUcsSUFBSSxPQUFPLEtBQUs7QUFBQSxNQUM5QixNQUFNLElBQUksVUFBVSxJQUFJLEtBQUs7QUFBQSxNQUM3QixFQUFFLE9BQU8sUUFBUSxFQUFFLEtBQUssS0FBSyxDQUFDLEVBQUUsS0FBSyxTQUFTLGdCQUFnQjtBQUFBLElBQ2hFO0FBQUEsRUFDRixFQUFPLFNBQUksY0FBYyxXQUFXO0FBQUEsSUFDbEMsTUFBTSxVQUFVLEtBQUs7QUFBQSxJQUNyQixTQUFTLElBQUksRUFBRyxJQUFJLE9BQU8sS0FBSztBQUFBLE1BQzlCLE1BQU0sSUFBSSxVQUFVLElBQUksS0FBSztBQUFBLE1BQzdCLE1BQU0sU0FBUyxLQUFLLElBQUksQ0FBQyxHQUFHLE1BQU07QUFBQSxRQUNoQyxNQUFNLFFBQVEsSUFBSSxJQUFJLEtBQUssS0FBSyxVQUFVLEtBQUssS0FBSztBQUFBLFFBQ3BELE1BQU0sSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLO0FBQUEsUUFDNUIsTUFBTSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUs7QUFBQSxRQUM1QixPQUFPLEdBQUcsS0FBSztBQUFBLE9BQ2hCLEVBQUUsS0FBSyxHQUFHO0FBQUEsTUFDWCxFQUFFLE9BQU8sU0FBUyxFQUFFLEtBQUssVUFBVSxNQUFNLEVBQUUsS0FBSyxTQUFTLGdCQUFnQjtBQUFBLElBQzNFO0FBQUEsRUFDRjtBQUFBLEdBQ0MsZUFBZTtBQUNsQixJQUFJLDJCQUEyQixPQUFPLENBQUMsR0FBRyxNQUFNLFFBQVEsV0FBVztBQUFBLEVBQ2pFLE1BQU0sVUFBVSxLQUFLO0FBQUEsRUFDckIsU0FBUyxJQUFJLEVBQUcsSUFBSSxTQUFTLEtBQUs7QUFBQSxJQUNoQyxNQUFNLFFBQVEsS0FBSyxHQUFHO0FBQUEsSUFDdEIsTUFBTSxRQUFRLElBQUksSUFBSSxLQUFLLEtBQUssVUFBVSxLQUFLLEtBQUs7QUFBQSxJQUNwRCxFQUFFLE9BQU8sTUFBTSxFQUFFLEtBQUssTUFBTSxDQUFDLEVBQUUsS0FBSyxNQUFNLENBQUMsRUFBRSxLQUFLLE1BQU0sU0FBUyxPQUFPLGtCQUFrQixLQUFLLElBQUksS0FBSyxDQUFDLEVBQUUsS0FBSyxNQUFNLFNBQVMsT0FBTyxrQkFBa0IsS0FBSyxJQUFJLEtBQUssQ0FBQyxFQUFFLEtBQUssU0FBUyxlQUFlO0FBQUEsSUFDdE0sRUFBRSxPQUFPLE1BQU0sRUFBRSxLQUFLLEtBQUssRUFBRSxLQUFLLEtBQUssU0FBUyxPQUFPLGtCQUFrQixLQUFLLElBQUksS0FBSyxDQUFDLEVBQUUsS0FBSyxLQUFLLFNBQVMsT0FBTyxrQkFBa0IsS0FBSyxJQUFJLEtBQUssQ0FBQyxFQUFFLEtBQUssU0FBUyxnQkFBZ0I7QUFBQSxFQUN2TDtBQUFBLEdBQ0MsVUFBVTtBQUNiLFNBQVMsVUFBVSxDQUFDLEdBQUcsTUFBTSxRQUFRLFVBQVUsVUFBVSxXQUFXLFFBQVE7QUFBQSxFQUMxRSxNQUFNLFVBQVUsS0FBSztBQUFBLEVBQ3JCLE1BQU0sU0FBUyxLQUFLLElBQUksT0FBTyxPQUFPLE9BQU8sTUFBTSxJQUFJO0FBQUEsRUFDdkQsT0FBTyxRQUFRLENBQUMsT0FBTyxVQUFVO0FBQUEsSUFDL0IsSUFBSSxNQUFNLFFBQVEsV0FBVyxTQUFTO0FBQUEsTUFDcEM7QUFBQSxJQUNGO0FBQUEsSUFDQSxNQUFNLFNBQVMsTUFBTSxRQUFRLElBQUksQ0FBQyxPQUFPLE1BQU07QUFBQSxNQUM3QyxNQUFNLFFBQVEsSUFBSSxLQUFLLEtBQUssSUFBSSxVQUFVLEtBQUssS0FBSztBQUFBLE1BQ3BELE1BQU0sSUFBSSxlQUFlLE9BQU8sVUFBVSxVQUFVLE1BQU07QUFBQSxNQUMxRCxNQUFNLElBQUksSUFBSSxLQUFLLElBQUksS0FBSztBQUFBLE1BQzVCLE1BQU0sSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLO0FBQUEsTUFDNUIsT0FBTyxFQUFFLEdBQUcsRUFBRTtBQUFBLEtBQ2Y7QUFBQSxJQUNELElBQUksY0FBYyxVQUFVO0FBQUEsTUFDMUIsRUFBRSxPQUFPLE1BQU0sRUFBRSxLQUFLLEtBQUssaUJBQWlCLFFBQVEsT0FBTyxZQUFZLENBQUMsRUFBRSxLQUFLLFNBQVMsY0FBYyxPQUFPO0FBQUEsSUFDL0csRUFBTyxTQUFJLGNBQWMsV0FBVztBQUFBLE1BQ2xDLEVBQUUsT0FBTyxTQUFTLEVBQUUsS0FBSyxVQUFVLE9BQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLFNBQVMsY0FBYyxPQUFPO0FBQUEsSUFDdEg7QUFBQSxHQUNEO0FBQUE7QUFFSCxPQUFPLFlBQVksWUFBWTtBQUMvQixTQUFTLGNBQWMsQ0FBQyxPQUFPLFVBQVUsVUFBVSxRQUFRO0FBQUEsRUFDekQsTUFBTSxlQUFlLEtBQUssSUFBSSxLQUFLLElBQUksT0FBTyxRQUFRLEdBQUcsUUFBUTtBQUFBLEVBQ2pFLE9BQU8sVUFBVSxlQUFlLGFBQWEsV0FBVztBQUFBO0FBRTFELE9BQU8sZ0JBQWdCLGdCQUFnQjtBQUN2QyxTQUFTLGdCQUFnQixDQUFDLFFBQVEsU0FBUztBQUFBLEVBQ3pDLE1BQU0sWUFBWSxPQUFPO0FBQUEsRUFDekIsSUFBSSxJQUFJLElBQUksT0FBTyxHQUFHLEtBQUssT0FBTyxHQUFHO0FBQUEsRUFDckMsU0FBUyxJQUFJLEVBQUcsSUFBSSxXQUFXLEtBQUs7QUFBQSxJQUNsQyxNQUFNLEtBQUssT0FBUSxLQUFJLElBQUksYUFBYTtBQUFBLElBQ3hDLE1BQU0sS0FBSyxPQUFPO0FBQUEsSUFDbEIsTUFBTSxLQUFLLE9BQVEsS0FBSSxLQUFLO0FBQUEsSUFDNUIsTUFBTSxLQUFLLE9BQVEsS0FBSSxLQUFLO0FBQUEsSUFDNUIsTUFBTSxNQUFNO0FBQUEsTUFDVixHQUFHLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLO0FBQUEsTUFDMUIsR0FBRyxHQUFHLEtBQUssR0FBRyxJQUFJLEdBQUcsS0FBSztBQUFBLElBQzVCO0FBQUEsSUFDQSxNQUFNLE1BQU07QUFBQSxNQUNWLEdBQUcsR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUs7QUFBQSxNQUMxQixHQUFHLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLO0FBQUEsSUFDNUI7QUFBQSxJQUNBLEtBQUssS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssR0FBRyxLQUFLLEdBQUc7QUFBQSxFQUMzRDtBQUFBLEVBQ0EsT0FBTyxHQUFHO0FBQUE7QUFFWixPQUFPLGtCQUFrQixrQkFBa0I7QUFDM0MsU0FBUyxVQUFVLENBQUMsR0FBRyxRQUFRLFlBQVksUUFBUTtBQUFBLEVBQ2pELElBQUksQ0FBQyxZQUFZO0FBQUEsSUFDZjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU0sV0FBVyxPQUFPLFFBQVEsSUFBSSxPQUFPLGVBQWUsSUFBSTtBQUFBLEVBQzlELE1BQU0sVUFBVSxFQUFFLE9BQU8sU0FBUyxJQUFJLE9BQU8sYUFBYSxJQUFJO0FBQUEsRUFDOUQsTUFBTSxhQUFhO0FBQUEsRUFDbkIsT0FBTyxRQUFRLENBQUMsT0FBTyxVQUFVO0FBQUEsSUFDL0IsTUFBTSxZQUFZLEVBQUUsT0FBTyxHQUFHLEVBQUUsS0FBSyxhQUFhLGFBQWEsWUFBWSxVQUFVLFFBQVEsYUFBYTtBQUFBLElBQzFHLFVBQVUsT0FBTyxNQUFNLEVBQUUsS0FBSyxTQUFTLEVBQUUsRUFBRSxLQUFLLFVBQVUsRUFBRSxFQUFFLEtBQUssU0FBUyxrQkFBa0IsT0FBTztBQUFBLElBQ3JHLFVBQVUsT0FBTyxNQUFNLEVBQUUsS0FBSyxLQUFLLEVBQUUsRUFBRSxLQUFLLEtBQUssQ0FBQyxFQUFFLEtBQUssU0FBUyxpQkFBaUIsRUFBRSxLQUFLLE1BQU0sS0FBSztBQUFBLEdBQ3RHO0FBQUE7QUFFSCxPQUFPLFlBQVksWUFBWTtBQUMvQixJQUFJLFdBQVcsRUFBRSxLQUFLO0FBR3RCLElBQUksaUNBQWlDLE9BQU8sQ0FBQyxnQkFBZ0IsaUJBQWlCO0FBQUEsRUFDNUUsSUFBSSxXQUFXO0FBQUEsRUFDZixTQUFTLElBQUksRUFBRyxJQUFJLGVBQWUsbUJBQW1CLEtBQUs7QUFBQSxJQUN6RCxNQUFNLGFBQWEsZUFBZSxTQUFTO0FBQUEsSUFDM0MsWUFBWTtBQUFBLGdCQUNBO0FBQUEsWUFDSjtBQUFBLFdBQ0Q7QUFBQSxtQkFDUSxhQUFhO0FBQUEsYUFDbkI7QUFBQSxtQkFDTSxhQUFhO0FBQUE7QUFBQSxvQkFFWjtBQUFBLFdBQ1Q7QUFBQSxtQkFDUSxhQUFhO0FBQUEsYUFDbkI7QUFBQTtBQUFBO0FBQUEsRUFHWDtBQUFBLEVBQ0EsT0FBTztBQUFBLEdBQ04sZ0JBQWdCO0FBQ25CLElBQUkseUNBQXlDLE9BQU8sQ0FBQyxVQUFVO0FBQUEsRUFDN0QsTUFBTSx3QkFBd0IsbUJBQWtCO0FBQUEsRUFDaEQsTUFBTSxnQkFBZ0IsVUFBVTtBQUFBLEVBQ2hDLE1BQU0saUJBQWlCLGNBQWMsdUJBQXVCLGNBQWMsY0FBYztBQUFBLEVBQ3hGLE1BQU0sZUFBZSxjQUFjLGVBQWUsT0FBTyxLQUFLO0FBQUEsRUFDOUQsT0FBTyxFQUFFLGdCQUFnQixhQUFhO0FBQUEsR0FDckMsd0JBQXdCO0FBQzNCLElBQUkseUJBQXlCLE9BQU8sR0FBRyxVQUFVLENBQUMsTUFBTTtBQUFBLEVBQ3RELFFBQVEsZ0JBQWdCLGlCQUFpQix1QkFBdUIsS0FBSztBQUFBLEVBQ3JFLE9BQU87QUFBQTtBQUFBLGVBRU0sZUFBZTtBQUFBLFdBQ25CLGVBQWU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBS2QsYUFBYTtBQUFBLGtCQUNQLGFBQWE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBS2hCLGFBQWE7QUFBQSxXQUNqQixhQUFhO0FBQUE7QUFBQTtBQUFBLFVBR2QsYUFBYTtBQUFBLGtCQUNMLGFBQWE7QUFBQSxZQUNuQixhQUFhO0FBQUEsa0JBQ1AsYUFBYTtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBSWhCLGFBQWE7QUFBQTtBQUFBO0FBQUEsR0FHekIsZUFBZSxnQkFBZ0IsWUFBWTtBQUFBO0FBQUEsR0FFM0MsUUFBUTtBQUdYLElBQUksVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRjsiLAogICJkZWJ1Z0lkIjogIjEyMkIwMkJEQzMyMDBCMzk2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
