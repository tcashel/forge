import {
  insertEdge,
  insertEdgeLabel,
  markers_default,
  positionEdgeLabel
} from "./chunk-main-wx3x4ygf.js";
import {
  insertCluster,
  insertNode,
  labelHelper
} from "./chunk-main-xxv6x4s9.js";
import {
  interpolateToCurve
} from "./chunk-main-vvfzntzy.js";
import {
  common_default,
  getConfig
} from "./chunk-main-aws590jt.js";
import {
  __name,
  log
} from "./chunk-main-vcnyggwp.js";
import {
  __require
} from "./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/chunk-LZXEDZCA.mjs
var internalHelpers = {
  common: common_default,
  getConfig,
  insertCluster,
  insertEdge,
  insertEdgeLabel,
  insertMarkers: markers_default,
  insertNode,
  interpolateToCurve,
  labelHelper,
  log,
  positionEdgeLabel
};
var layoutAlgorithms = {};
var registerLayoutLoaders = /* @__PURE__ */ __name((loaders) => {
  for (const loader of loaders) {
    layoutAlgorithms[loader.name] = loader;
  }
}, "registerLayoutLoaders");
var registerDefaultLayoutLoaders = /* @__PURE__ */ __name(() => {
  registerLayoutLoaders([
    {
      name: "dagre",
      loader: /* @__PURE__ */ __name(async () => await import("./chunk-dagre-BM42HDAG-rbgf21z2.js"), "loader")
    },
    ...[
      {
        name: "cose-bilkent",
        loader: /* @__PURE__ */ __name(async () => await import("./chunk-cose-bilkent-S5V4N54A-s1avq3xb.js"), "loader")
      }
    ]
  ]);
}, "registerDefaultLayoutLoaders");
registerDefaultLayoutLoaders();
var render = /* @__PURE__ */ __name(async (data4Layout, svg) => {
  if (!(data4Layout.layoutAlgorithm in layoutAlgorithms)) {
    throw new Error(`Unknown layout algorithm: ${data4Layout.layoutAlgorithm}`);
  }
  if (data4Layout.diagramId) {
    for (const node of data4Layout.nodes) {
      const originalDomId = node.domId || node.id;
      node.domId = `${data4Layout.diagramId}-${originalDomId}`;
    }
  }
  const layoutDefinition = layoutAlgorithms[data4Layout.layoutAlgorithm];
  const layoutRenderer = await layoutDefinition.loader();
  const { theme, themeVariables } = data4Layout.config;
  const { useGradient, gradientStart, gradientStop } = themeVariables;
  const svgId = svg.attr("id");
  svg.append("defs").append("filter").attr("id", `${svgId}-drop-shadow`).attr("height", "130%").attr("width", "130%").append("feDropShadow").attr("dx", "4").attr("dy", "4").attr("stdDeviation", 0).attr("flood-opacity", "0.06").attr("flood-color", `${theme?.includes("dark") ? "#FFFFFF" : "#000000"}`);
  svg.append("defs").append("filter").attr("id", `${svgId}-drop-shadow-small`).attr("height", "150%").attr("width", "150%").append("feDropShadow").attr("dx", "2").attr("dy", "2").attr("stdDeviation", 0).attr("flood-opacity", "0.06").attr("flood-color", `${theme?.includes("dark") ? "#FFFFFF" : "#000000"}`);
  if (useGradient) {
    const gradient = svg.append("linearGradient").attr("id", svg.attr("id") + "-gradient").attr("gradientUnits", "objectBoundingBox").attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
    gradient.append("svg:stop").attr("offset", "0%").attr("stop-color", gradientStart).attr("stop-opacity", 1);
    gradient.append("svg:stop").attr("offset", "100%").attr("stop-color", gradientStop).attr("stop-opacity", 1);
  }
  return layoutRenderer.render(data4Layout, svg, internalHelpers, {
    algorithm: layoutDefinition.algorithm
  });
}, "render");
var getRegisteredLayoutAlgorithm = /* @__PURE__ */ __name((algorithm = "", { fallback = "dagre" } = {}) => {
  if (algorithm in layoutAlgorithms) {
    return algorithm;
  }
  if (fallback in layoutAlgorithms) {
    log.warn(`Layout algorithm ${algorithm} is not registered. Using ${fallback} as fallback.`);
    return fallback;
  }
  throw new Error(`Both layout algorithms ${algorithm} and ${fallback} are not registered.`);
}, "getRegisteredLayoutAlgorithm");

export { registerLayoutLoaders, render, getRegisteredLayoutAlgorithm };

//# debugId=836723569EE7F56264756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2NodW5rLUxaWEVEWkNBLm1qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJpbXBvcnQge1xuICBpbnNlcnRFZGdlLFxuICBpbnNlcnRFZGdlTGFiZWwsXG4gIG1hcmtlcnNfZGVmYXVsdCxcbiAgcG9zaXRpb25FZGdlTGFiZWxcbn0gZnJvbSBcIi4vY2h1bmstS1NDUzVONkEubWpzXCI7XG5pbXBvcnQge1xuICBpbnNlcnRDbHVzdGVyLFxuICBpbnNlcnROb2RlLFxuICBsYWJlbEhlbHBlclxufSBmcm9tIFwiLi9jaHVuay0zT1BJRkdERS5tanNcIjtcbmltcG9ydCB7XG4gIGludGVycG9sYXRlVG9DdXJ2ZVxufSBmcm9tIFwiLi9jaHVuay01WlFZSFhLVS5tanNcIjtcbmltcG9ydCB7XG4gIGNvbW1vbl9kZWZhdWx0LFxuICBnZXRDb25maWdcbn0gZnJvbSBcIi4vY2h1bmstQ1NDSUhLN1EubWpzXCI7XG5pbXBvcnQge1xuICBfX25hbWUsXG4gIGxvZ1xufSBmcm9tIFwiLi9jaHVuay1BR0hSQjRKRi5tanNcIjtcblxuLy8gc3JjL2ludGVybmFscy50c1xudmFyIGludGVybmFsSGVscGVycyA9IHtcbiAgY29tbW9uOiBjb21tb25fZGVmYXVsdCxcbiAgZ2V0Q29uZmlnLFxuICBpbnNlcnRDbHVzdGVyLFxuICBpbnNlcnRFZGdlLFxuICBpbnNlcnRFZGdlTGFiZWwsXG4gIGluc2VydE1hcmtlcnM6IG1hcmtlcnNfZGVmYXVsdCxcbiAgaW5zZXJ0Tm9kZSxcbiAgaW50ZXJwb2xhdGVUb0N1cnZlLFxuICBsYWJlbEhlbHBlcixcbiAgbG9nLFxuICBwb3NpdGlvbkVkZ2VMYWJlbFxufTtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlci50c1xudmFyIGxheW91dEFsZ29yaXRobXMgPSB7fTtcbnZhciByZWdpc3RlckxheW91dExvYWRlcnMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChsb2FkZXJzKSA9PiB7XG4gIGZvciAoY29uc3QgbG9hZGVyIG9mIGxvYWRlcnMpIHtcbiAgICBsYXlvdXRBbGdvcml0aG1zW2xvYWRlci5uYW1lXSA9IGxvYWRlcjtcbiAgfVxufSwgXCJyZWdpc3RlckxheW91dExvYWRlcnNcIik7XG52YXIgcmVnaXN0ZXJEZWZhdWx0TGF5b3V0TG9hZGVycyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKCkgPT4ge1xuICByZWdpc3RlckxheW91dExvYWRlcnMoW1xuICAgIHtcbiAgICAgIG5hbWU6IFwiZGFncmVcIixcbiAgICAgIGxvYWRlcjogLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAoKSA9PiBhd2FpdCBpbXBvcnQoXCIuL2RhZ3JlLUJNNDJIREFHLm1qc1wiKSwgXCJsb2FkZXJcIilcbiAgICB9LFxuICAgIC4uLnRydWUgPyBbXG4gICAgICB7XG4gICAgICAgIG5hbWU6IFwiY29zZS1iaWxrZW50XCIsXG4gICAgICAgIGxvYWRlcjogLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAoKSA9PiBhd2FpdCBpbXBvcnQoXCIuL2Nvc2UtYmlsa2VudC1TNVY0TjU0QS5tanNcIiksIFwibG9hZGVyXCIpXG4gICAgICB9XG4gICAgXSA6IFtdXG4gIF0pO1xufSwgXCJyZWdpc3RlckRlZmF1bHRMYXlvdXRMb2FkZXJzXCIpO1xucmVnaXN0ZXJEZWZhdWx0TGF5b3V0TG9hZGVycygpO1xudmFyIHJlbmRlciA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgKGRhdGE0TGF5b3V0LCBzdmcpID0+IHtcbiAgaWYgKCEoZGF0YTRMYXlvdXQubGF5b3V0QWxnb3JpdGhtIGluIGxheW91dEFsZ29yaXRobXMpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIGxheW91dCBhbGdvcml0aG06ICR7ZGF0YTRMYXlvdXQubGF5b3V0QWxnb3JpdGhtfWApO1xuICB9XG4gIGlmIChkYXRhNExheW91dC5kaWFncmFtSWQpIHtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2YgZGF0YTRMYXlvdXQubm9kZXMpIHtcbiAgICAgIGNvbnN0IG9yaWdpbmFsRG9tSWQgPSBub2RlLmRvbUlkIHx8IG5vZGUuaWQ7XG4gICAgICBub2RlLmRvbUlkID0gYCR7ZGF0YTRMYXlvdXQuZGlhZ3JhbUlkfS0ke29yaWdpbmFsRG9tSWR9YDtcbiAgICB9XG4gIH1cbiAgY29uc3QgbGF5b3V0RGVmaW5pdGlvbiA9IGxheW91dEFsZ29yaXRobXNbZGF0YTRMYXlvdXQubGF5b3V0QWxnb3JpdGhtXTtcbiAgY29uc3QgbGF5b3V0UmVuZGVyZXIgPSBhd2FpdCBsYXlvdXREZWZpbml0aW9uLmxvYWRlcigpO1xuICBjb25zdCB7IHRoZW1lLCB0aGVtZVZhcmlhYmxlcyB9ID0gZGF0YTRMYXlvdXQuY29uZmlnO1xuICBjb25zdCB7IHVzZUdyYWRpZW50LCBncmFkaWVudFN0YXJ0LCBncmFkaWVudFN0b3AgfSA9IHRoZW1lVmFyaWFibGVzO1xuICBjb25zdCBzdmdJZCA9IHN2Zy5hdHRyKFwiaWRcIik7XG4gIHN2Zy5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcImZpbHRlclwiKS5hdHRyKFwiaWRcIiwgYCR7c3ZnSWR9LWRyb3Atc2hhZG93YCkuYXR0cihcImhlaWdodFwiLCBcIjEzMCVcIikuYXR0cihcIndpZHRoXCIsIFwiMTMwJVwiKS5hcHBlbmQoXCJmZURyb3BTaGFkb3dcIikuYXR0cihcImR4XCIsIFwiNFwiKS5hdHRyKFwiZHlcIiwgXCI0XCIpLmF0dHIoXCJzdGREZXZpYXRpb25cIiwgMCkuYXR0cihcImZsb29kLW9wYWNpdHlcIiwgXCIwLjA2XCIpLmF0dHIoXCJmbG9vZC1jb2xvclwiLCBgJHt0aGVtZT8uaW5jbHVkZXMoXCJkYXJrXCIpID8gXCIjRkZGRkZGXCIgOiBcIiMwMDAwMDBcIn1gKTtcbiAgc3ZnLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwiZmlsdGVyXCIpLmF0dHIoXCJpZFwiLCBgJHtzdmdJZH0tZHJvcC1zaGFkb3ctc21hbGxgKS5hdHRyKFwiaGVpZ2h0XCIsIFwiMTUwJVwiKS5hdHRyKFwid2lkdGhcIiwgXCIxNTAlXCIpLmFwcGVuZChcImZlRHJvcFNoYWRvd1wiKS5hdHRyKFwiZHhcIiwgXCIyXCIpLmF0dHIoXCJkeVwiLCBcIjJcIikuYXR0cihcInN0ZERldmlhdGlvblwiLCAwKS5hdHRyKFwiZmxvb2Qtb3BhY2l0eVwiLCBcIjAuMDZcIikuYXR0cihcImZsb29kLWNvbG9yXCIsIGAke3RoZW1lPy5pbmNsdWRlcyhcImRhcmtcIikgPyBcIiNGRkZGRkZcIiA6IFwiIzAwMDAwMFwifWApO1xuICBpZiAodXNlR3JhZGllbnQpIHtcbiAgICBjb25zdCBncmFkaWVudCA9IHN2Zy5hcHBlbmQoXCJsaW5lYXJHcmFkaWVudFwiKS5hdHRyKFwiaWRcIiwgc3ZnLmF0dHIoXCJpZFwiKSArIFwiLWdyYWRpZW50XCIpLmF0dHIoXCJncmFkaWVudFVuaXRzXCIsIFwib2JqZWN0Qm91bmRpbmdCb3hcIikuYXR0cihcIngxXCIsIFwiMCVcIikuYXR0cihcInkxXCIsIFwiMCVcIikuYXR0cihcIngyXCIsIFwiMTAwJVwiKS5hdHRyKFwieTJcIiwgXCIwJVwiKTtcbiAgICBncmFkaWVudC5hcHBlbmQoXCJzdmc6c3RvcFwiKS5hdHRyKFwib2Zmc2V0XCIsIFwiMCVcIikuYXR0cihcInN0b3AtY29sb3JcIiwgZ3JhZGllbnRTdGFydCkuYXR0cihcInN0b3Atb3BhY2l0eVwiLCAxKTtcbiAgICBncmFkaWVudC5hcHBlbmQoXCJzdmc6c3RvcFwiKS5hdHRyKFwib2Zmc2V0XCIsIFwiMTAwJVwiKS5hdHRyKFwic3RvcC1jb2xvclwiLCBncmFkaWVudFN0b3ApLmF0dHIoXCJzdG9wLW9wYWNpdHlcIiwgMSk7XG4gIH1cbiAgcmV0dXJuIGxheW91dFJlbmRlcmVyLnJlbmRlcihkYXRhNExheW91dCwgc3ZnLCBpbnRlcm5hbEhlbHBlcnMsIHtcbiAgICBhbGdvcml0aG06IGxheW91dERlZmluaXRpb24uYWxnb3JpdGhtXG4gIH0pO1xufSwgXCJyZW5kZXJcIik7XG52YXIgZ2V0UmVnaXN0ZXJlZExheW91dEFsZ29yaXRobSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGFsZ29yaXRobSA9IFwiXCIsIHsgZmFsbGJhY2sgPSBcImRhZ3JlXCIgfSA9IHt9KSA9PiB7XG4gIGlmIChhbGdvcml0aG0gaW4gbGF5b3V0QWxnb3JpdGhtcykge1xuICAgIHJldHVybiBhbGdvcml0aG07XG4gIH1cbiAgaWYgKGZhbGxiYWNrIGluIGxheW91dEFsZ29yaXRobXMpIHtcbiAgICBsb2cud2FybihgTGF5b3V0IGFsZ29yaXRobSAke2FsZ29yaXRobX0gaXMgbm90IHJlZ2lzdGVyZWQuIFVzaW5nICR7ZmFsbGJhY2t9IGFzIGZhbGxiYWNrLmApO1xuICAgIHJldHVybiBmYWxsYmFjaztcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoYEJvdGggbGF5b3V0IGFsZ29yaXRobXMgJHthbGdvcml0aG19IGFuZCAke2ZhbGxiYWNrfSBhcmUgbm90IHJlZ2lzdGVyZWQuYCk7XG59LCBcImdldFJlZ2lzdGVyZWRMYXlvdXRBbGdvcml0aG1cIik7XG5cbmV4cG9ydCB7XG4gIHJlZ2lzdGVyTGF5b3V0TG9hZGVycyxcbiAgcmVuZGVyLFxuICBnZXRSZWdpc3RlcmVkTGF5b3V0QWxnb3JpdGhtXG59O1xuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBd0JBLElBQUksa0JBQWtCO0FBQUEsRUFDcEIsUUFBUTtBQUFBLEVBQ1I7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBLGVBQWU7QUFBQSxFQUNmO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGO0FBR0EsSUFBSSxtQkFBbUIsQ0FBQztBQUN4QixJQUFJLHdDQUF3QyxPQUFPLENBQUMsWUFBWTtBQUFBLEVBQzlELFdBQVcsVUFBVSxTQUFTO0FBQUEsSUFDNUIsaUJBQWlCLE9BQU8sUUFBUTtBQUFBLEVBQ2xDO0FBQUEsR0FDQyx1QkFBdUI7QUFDMUIsSUFBSSwrQ0FBK0MsT0FBTyxNQUFNO0FBQUEsRUFDOUQsc0JBQXNCO0FBQUEsSUFDcEI7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLHdCQUF3QixPQUFPLFlBQVksTUFBYSw4Q0FBeUIsUUFBUTtBQUFBLElBQzNGO0FBQUEsSUFDQSxHQUFVO0FBQUEsTUFDUjtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sd0JBQXdCLE9BQU8sWUFBWSxNQUFhLHFEQUFnQyxRQUFRO0FBQUEsTUFDbEc7QUFBQSxJQUNGO0FBQUEsRUFDRixDQUFDO0FBQUEsR0FDQSw4QkFBOEI7QUFDakMsNkJBQTZCO0FBQzdCLElBQUkseUJBQXlCLE9BQU8sT0FBTyxhQUFhLFFBQVE7QUFBQSxFQUM5RCxJQUFJLEVBQUUsWUFBWSxtQkFBbUIsbUJBQW1CO0FBQUEsSUFDdEQsTUFBTSxJQUFJLE1BQU0sNkJBQTZCLFlBQVksaUJBQWlCO0FBQUEsRUFDNUU7QUFBQSxFQUNBLElBQUksWUFBWSxXQUFXO0FBQUEsSUFDekIsV0FBVyxRQUFRLFlBQVksT0FBTztBQUFBLE1BQ3BDLE1BQU0sZ0JBQWdCLEtBQUssU0FBUyxLQUFLO0FBQUEsTUFDekMsS0FBSyxRQUFRLEdBQUcsWUFBWSxhQUFhO0FBQUEsSUFDM0M7QUFBQSxFQUNGO0FBQUEsRUFDQSxNQUFNLG1CQUFtQixpQkFBaUIsWUFBWTtBQUFBLEVBQ3RELE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE9BQU87QUFBQSxFQUNyRCxRQUFRLE9BQU8sbUJBQW1CLFlBQVk7QUFBQSxFQUM5QyxRQUFRLGFBQWEsZUFBZSxpQkFBaUI7QUFBQSxFQUNyRCxNQUFNLFFBQVEsSUFBSSxLQUFLLElBQUk7QUFBQSxFQUMzQixJQUFJLE9BQU8sTUFBTSxFQUFFLE9BQU8sUUFBUSxFQUFFLEtBQUssTUFBTSxHQUFHLG1CQUFtQixFQUFFLEtBQUssVUFBVSxNQUFNLEVBQUUsS0FBSyxTQUFTLE1BQU0sRUFBRSxPQUFPLGNBQWMsRUFBRSxLQUFLLE1BQU0sR0FBRyxFQUFFLEtBQUssTUFBTSxHQUFHLEVBQUUsS0FBSyxnQkFBZ0IsQ0FBQyxFQUFFLEtBQUssaUJBQWlCLE1BQU0sRUFBRSxLQUFLLGVBQWUsR0FBRyxPQUFPLFNBQVMsTUFBTSxJQUFJLFlBQVksV0FBVztBQUFBLEVBQ3pTLElBQUksT0FBTyxNQUFNLEVBQUUsT0FBTyxRQUFRLEVBQUUsS0FBSyxNQUFNLEdBQUcseUJBQXlCLEVBQUUsS0FBSyxVQUFVLE1BQU0sRUFBRSxLQUFLLFNBQVMsTUFBTSxFQUFFLE9BQU8sY0FBYyxFQUFFLEtBQUssTUFBTSxHQUFHLEVBQUUsS0FBSyxNQUFNLEdBQUcsRUFBRSxLQUFLLGdCQUFnQixDQUFDLEVBQUUsS0FBSyxpQkFBaUIsTUFBTSxFQUFFLEtBQUssZUFBZSxHQUFHLE9BQU8sU0FBUyxNQUFNLElBQUksWUFBWSxXQUFXO0FBQUEsRUFDL1MsSUFBSSxhQUFhO0FBQUEsSUFDZixNQUFNLFdBQVcsSUFBSSxPQUFPLGdCQUFnQixFQUFFLEtBQUssTUFBTSxJQUFJLEtBQUssSUFBSSxJQUFJLFdBQVcsRUFBRSxLQUFLLGlCQUFpQixtQkFBbUIsRUFBRSxLQUFLLE1BQU0sSUFBSSxFQUFFLEtBQUssTUFBTSxJQUFJLEVBQUUsS0FBSyxNQUFNLE1BQU0sRUFBRSxLQUFLLE1BQU0sSUFBSTtBQUFBLElBQ3RNLFNBQVMsT0FBTyxVQUFVLEVBQUUsS0FBSyxVQUFVLElBQUksRUFBRSxLQUFLLGNBQWMsYUFBYSxFQUFFLEtBQUssZ0JBQWdCLENBQUM7QUFBQSxJQUN6RyxTQUFTLE9BQU8sVUFBVSxFQUFFLEtBQUssVUFBVSxNQUFNLEVBQUUsS0FBSyxjQUFjLFlBQVksRUFBRSxLQUFLLGdCQUFnQixDQUFDO0FBQUEsRUFDNUc7QUFBQSxFQUNBLE9BQU8sZUFBZSxPQUFPLGFBQWEsS0FBSyxpQkFBaUI7QUFBQSxJQUM5RCxXQUFXLGlCQUFpQjtBQUFBLEVBQzlCLENBQUM7QUFBQSxHQUNBLFFBQVE7QUFDWCxJQUFJLCtDQUErQyxPQUFPLENBQUMsWUFBWSxNQUFNLFdBQVcsWUFBWSxDQUFDLE1BQU07QUFBQSxFQUN6RyxJQUFJLGFBQWEsa0JBQWtCO0FBQUEsSUFDakMsT0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLElBQUksWUFBWSxrQkFBa0I7QUFBQSxJQUNoQyxJQUFJLEtBQUssb0JBQW9CLHNDQUFzQyx1QkFBdUI7QUFBQSxJQUMxRixPQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsTUFBTSxJQUFJLE1BQU0sMEJBQTBCLGlCQUFpQiw4QkFBOEI7QUFBQSxHQUN4Riw4QkFBOEI7IiwKICAiZGVidWdJZCI6ICI4MzY3MjM1NjlFRTdGNTYyNjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
