import {
  getConfig2
} from "./chunk-main-aws590jt.js";
import {
  __name
} from "./chunk-main-vcnyggwp.js";

// node_modules/mermaid/dist/chunks/mermaid.core/chunk-NZK2D7GU.mjs
var solidStateFill = /* @__PURE__ */ __name((color) => {
  const { handDrawnSeed } = getConfig2();
  return {
    fill: color,
    hachureAngle: 120,
    hachureGap: 4,
    fillWeight: 2,
    roughness: 0.7,
    stroke: color,
    seed: handDrawnSeed
  };
}, "solidStateFill");
var compileStyles = /* @__PURE__ */ __name((node) => {
  const stylesMap = styles2Map([
    ...node.cssCompiledStyles || [],
    ...node.cssStyles || [],
    ...node.labelStyle || []
  ]);
  return { stylesMap, stylesArray: [...stylesMap] };
}, "compileStyles");
var styles2Map = /* @__PURE__ */ __name((styles) => {
  const styleMap = /* @__PURE__ */ new Map;
  styles.forEach((style) => {
    const [key, value] = style.split(":");
    styleMap.set(key.trim(), value?.trim());
  });
  return styleMap;
}, "styles2Map");
var isLabelStyle = /* @__PURE__ */ __name((key) => {
  return key === "color" || key === "font-size" || key === "font-family" || key === "font-weight" || key === "font-style" || key === "text-decoration" || key === "text-align" || key === "text-transform" || key === "line-height" || key === "letter-spacing" || key === "word-spacing" || key === "text-shadow" || key === "text-overflow" || key === "white-space" || key === "word-wrap" || key === "word-break" || key === "overflow-wrap" || key === "hyphens";
}, "isLabelStyle");
var styles2String = /* @__PURE__ */ __name((node) => {
  const { stylesArray } = compileStyles(node);
  const labelStyles = [];
  const nodeStyles = [];
  const borderStyles = [];
  const backgroundStyles = [];
  stylesArray.forEach((style) => {
    const key = style[0];
    if (isLabelStyle(key)) {
      labelStyles.push(style.join(":") + " !important");
    } else {
      nodeStyles.push(style.join(":") + " !important");
      if (key.includes("stroke")) {
        borderStyles.push(style.join(":") + " !important");
      }
      if (key === "fill") {
        backgroundStyles.push(style.join(":") + " !important");
      }
    }
  });
  return {
    labelStyles: labelStyles.join(";"),
    nodeStyles: nodeStyles.join(";"),
    stylesArray,
    borderStyles,
    backgroundStyles
  };
}, "styles2String");
var userNodeOverrides = /* @__PURE__ */ __name((node, options) => {
  const { themeVariables, handDrawnSeed } = getConfig2();
  const { nodeBorder, mainBkg } = themeVariables;
  const { stylesMap } = compileStyles(node);
  const result = Object.assign({
    roughness: 0.7,
    fill: stylesMap.get("fill") || mainBkg,
    fillStyle: "hachure",
    fillWeight: 4,
    hachureGap: 5.2,
    stroke: stylesMap.get("stroke") || nodeBorder,
    seed: handDrawnSeed,
    strokeWidth: stylesMap.get("stroke-width")?.replace("px", "") || 1.3,
    fillLineDash: [0, 0],
    strokeLineDash: getStrokeDashArray(stylesMap.get("stroke-dasharray"))
  }, options);
  return result;
}, "userNodeOverrides");
var getStrokeDashArray = /* @__PURE__ */ __name((strokeDasharrayStyle) => {
  if (!strokeDasharrayStyle) {
    return [0, 0];
  }
  const dashArray = strokeDasharrayStyle.trim().split(/\s+/).map(Number);
  if (dashArray.length === 1) {
    const val = isNaN(dashArray[0]) ? 0 : dashArray[0];
    return [val, val];
  }
  const first = isNaN(dashArray[0]) ? 0 : dashArray[0];
  const second = isNaN(dashArray[1]) ? 0 : dashArray[1];
  return [first, second];
}, "getStrokeDashArray");

export { solidStateFill, compileStyles, isLabelStyle, styles2String, userNodeOverrides };

//# debugId=89F53E7A8C741FE364756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2NodW5rLU5aSzJEN0dVLm1qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJpbXBvcnQge1xuICBnZXRDb25maWcyIGFzIGdldENvbmZpZ1xufSBmcm9tIFwiLi9jaHVuay1DU0NJSEs3US5tanNcIjtcbmltcG9ydCB7XG4gIF9fbmFtZVxufSBmcm9tIFwiLi9jaHVuay1BR0hSQjRKRi5tanNcIjtcblxuLy8gc3JjL3JlbmRlcmluZy11dGlsL3JlbmRlcmluZy1lbGVtZW50cy9zaGFwZXMvaGFuZERyYXduU2hhcGVTdHlsZXMudHNcbnZhciBzb2xpZFN0YXRlRmlsbCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGNvbG9yKSA9PiB7XG4gIGNvbnN0IHsgaGFuZERyYXduU2VlZCB9ID0gZ2V0Q29uZmlnKCk7XG4gIHJldHVybiB7XG4gICAgZmlsbDogY29sb3IsXG4gICAgaGFjaHVyZUFuZ2xlOiAxMjAsXG4gICAgLy8gYW5nbGUgb2YgaGFjaHVyZSxcbiAgICBoYWNodXJlR2FwOiA0LFxuICAgIGZpbGxXZWlnaHQ6IDIsXG4gICAgcm91Z2huZXNzOiAwLjcsXG4gICAgc3Ryb2tlOiBjb2xvcixcbiAgICBzZWVkOiBoYW5kRHJhd25TZWVkXG4gIH07XG59LCBcInNvbGlkU3RhdGVGaWxsXCIpO1xudmFyIGNvbXBpbGVTdHlsZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChub2RlKSA9PiB7XG4gIGNvbnN0IHN0eWxlc01hcCA9IHN0eWxlczJNYXAoW1xuICAgIC4uLm5vZGUuY3NzQ29tcGlsZWRTdHlsZXMgfHwgW10sXG4gICAgLi4ubm9kZS5jc3NTdHlsZXMgfHwgW10sXG4gICAgLi4ubm9kZS5sYWJlbFN0eWxlIHx8IFtdXG4gIF0pO1xuICByZXR1cm4geyBzdHlsZXNNYXAsIHN0eWxlc0FycmF5OiBbLi4uc3R5bGVzTWFwXSB9O1xufSwgXCJjb21waWxlU3R5bGVzXCIpO1xudmFyIHN0eWxlczJNYXAgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChzdHlsZXMpID0+IHtcbiAgY29uc3Qgc3R5bGVNYXAgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICBzdHlsZXMuZm9yRWFjaCgoc3R5bGUpID0+IHtcbiAgICBjb25zdCBba2V5LCB2YWx1ZV0gPSBzdHlsZS5zcGxpdChcIjpcIik7XG4gICAgc3R5bGVNYXAuc2V0KGtleS50cmltKCksIHZhbHVlPy50cmltKCkpO1xuICB9KTtcbiAgcmV0dXJuIHN0eWxlTWFwO1xufSwgXCJzdHlsZXMyTWFwXCIpO1xudmFyIGlzTGFiZWxTdHlsZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGtleSkgPT4ge1xuICByZXR1cm4ga2V5ID09PSBcImNvbG9yXCIgfHwga2V5ID09PSBcImZvbnQtc2l6ZVwiIHx8IGtleSA9PT0gXCJmb250LWZhbWlseVwiIHx8IGtleSA9PT0gXCJmb250LXdlaWdodFwiIHx8IGtleSA9PT0gXCJmb250LXN0eWxlXCIgfHwga2V5ID09PSBcInRleHQtZGVjb3JhdGlvblwiIHx8IGtleSA9PT0gXCJ0ZXh0LWFsaWduXCIgfHwga2V5ID09PSBcInRleHQtdHJhbnNmb3JtXCIgfHwga2V5ID09PSBcImxpbmUtaGVpZ2h0XCIgfHwga2V5ID09PSBcImxldHRlci1zcGFjaW5nXCIgfHwga2V5ID09PSBcIndvcmQtc3BhY2luZ1wiIHx8IGtleSA9PT0gXCJ0ZXh0LXNoYWRvd1wiIHx8IGtleSA9PT0gXCJ0ZXh0LW92ZXJmbG93XCIgfHwga2V5ID09PSBcIndoaXRlLXNwYWNlXCIgfHwga2V5ID09PSBcIndvcmQtd3JhcFwiIHx8IGtleSA9PT0gXCJ3b3JkLWJyZWFrXCIgfHwga2V5ID09PSBcIm92ZXJmbG93LXdyYXBcIiB8fCBrZXkgPT09IFwiaHlwaGVuc1wiO1xufSwgXCJpc0xhYmVsU3R5bGVcIik7XG52YXIgc3R5bGVzMlN0cmluZyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKG5vZGUpID0+IHtcbiAgY29uc3QgeyBzdHlsZXNBcnJheSB9ID0gY29tcGlsZVN0eWxlcyhub2RlKTtcbiAgY29uc3QgbGFiZWxTdHlsZXMgPSBbXTtcbiAgY29uc3Qgbm9kZVN0eWxlcyA9IFtdO1xuICBjb25zdCBib3JkZXJTdHlsZXMgPSBbXTtcbiAgY29uc3QgYmFja2dyb3VuZFN0eWxlcyA9IFtdO1xuICBzdHlsZXNBcnJheS5mb3JFYWNoKChzdHlsZSkgPT4ge1xuICAgIGNvbnN0IGtleSA9IHN0eWxlWzBdO1xuICAgIGlmIChpc0xhYmVsU3R5bGUoa2V5KSkge1xuICAgICAgbGFiZWxTdHlsZXMucHVzaChzdHlsZS5qb2luKFwiOlwiKSArIFwiICFpbXBvcnRhbnRcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGVTdHlsZXMucHVzaChzdHlsZS5qb2luKFwiOlwiKSArIFwiICFpbXBvcnRhbnRcIik7XG4gICAgICBpZiAoa2V5LmluY2x1ZGVzKFwic3Ryb2tlXCIpKSB7XG4gICAgICAgIGJvcmRlclN0eWxlcy5wdXNoKHN0eWxlLmpvaW4oXCI6XCIpICsgXCIgIWltcG9ydGFudFwiKTtcbiAgICAgIH1cbiAgICAgIGlmIChrZXkgPT09IFwiZmlsbFwiKSB7XG4gICAgICAgIGJhY2tncm91bmRTdHlsZXMucHVzaChzdHlsZS5qb2luKFwiOlwiKSArIFwiICFpbXBvcnRhbnRcIik7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHtcbiAgICBsYWJlbFN0eWxlczogbGFiZWxTdHlsZXMuam9pbihcIjtcIiksXG4gICAgbm9kZVN0eWxlczogbm9kZVN0eWxlcy5qb2luKFwiO1wiKSxcbiAgICBzdHlsZXNBcnJheSxcbiAgICBib3JkZXJTdHlsZXMsXG4gICAgYmFja2dyb3VuZFN0eWxlc1xuICB9O1xufSwgXCJzdHlsZXMyU3RyaW5nXCIpO1xudmFyIHVzZXJOb2RlT3ZlcnJpZGVzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgobm9kZSwgb3B0aW9ucykgPT4ge1xuICBjb25zdCB7IHRoZW1lVmFyaWFibGVzLCBoYW5kRHJhd25TZWVkIH0gPSBnZXRDb25maWcoKTtcbiAgY29uc3QgeyBub2RlQm9yZGVyLCBtYWluQmtnIH0gPSB0aGVtZVZhcmlhYmxlcztcbiAgY29uc3QgeyBzdHlsZXNNYXAgfSA9IGNvbXBpbGVTdHlsZXMobm9kZSk7XG4gIGNvbnN0IHJlc3VsdCA9IE9iamVjdC5hc3NpZ24oXG4gICAge1xuICAgICAgcm91Z2huZXNzOiAwLjcsXG4gICAgICBmaWxsOiBzdHlsZXNNYXAuZ2V0KFwiZmlsbFwiKSB8fCBtYWluQmtnLFxuICAgICAgZmlsbFN0eWxlOiBcImhhY2h1cmVcIixcbiAgICAgIC8vIHNvbGlkIGZpbGxcbiAgICAgIGZpbGxXZWlnaHQ6IDQsXG4gICAgICBoYWNodXJlR2FwOiA1LjIsXG4gICAgICBzdHJva2U6IHN0eWxlc01hcC5nZXQoXCJzdHJva2VcIikgfHwgbm9kZUJvcmRlcixcbiAgICAgIHNlZWQ6IGhhbmREcmF3blNlZWQsXG4gICAgICBzdHJva2VXaWR0aDogc3R5bGVzTWFwLmdldChcInN0cm9rZS13aWR0aFwiKT8ucmVwbGFjZShcInB4XCIsIFwiXCIpIHx8IDEuMyxcbiAgICAgIGZpbGxMaW5lRGFzaDogWzAsIDBdLFxuICAgICAgc3Ryb2tlTGluZURhc2g6IGdldFN0cm9rZURhc2hBcnJheShzdHlsZXNNYXAuZ2V0KFwic3Ryb2tlLWRhc2hhcnJheVwiKSlcbiAgICB9LFxuICAgIG9wdGlvbnNcbiAgKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn0sIFwidXNlck5vZGVPdmVycmlkZXNcIik7XG52YXIgZ2V0U3Ryb2tlRGFzaEFycmF5ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoc3Ryb2tlRGFzaGFycmF5U3R5bGUpID0+IHtcbiAgaWYgKCFzdHJva2VEYXNoYXJyYXlTdHlsZSkge1xuICAgIHJldHVybiBbMCwgMF07XG4gIH1cbiAgY29uc3QgZGFzaEFycmF5ID0gc3Ryb2tlRGFzaGFycmF5U3R5bGUudHJpbSgpLnNwbGl0KC9cXHMrLykubWFwKE51bWJlcik7XG4gIGlmIChkYXNoQXJyYXkubGVuZ3RoID09PSAxKSB7XG4gICAgY29uc3QgdmFsID0gaXNOYU4oZGFzaEFycmF5WzBdKSA/IDAgOiBkYXNoQXJyYXlbMF07XG4gICAgcmV0dXJuIFt2YWwsIHZhbF07XG4gIH1cbiAgY29uc3QgZmlyc3QgPSBpc05hTihkYXNoQXJyYXlbMF0pID8gMCA6IGRhc2hBcnJheVswXTtcbiAgY29uc3Qgc2Vjb25kID0gaXNOYU4oZGFzaEFycmF5WzFdKSA/IDAgOiBkYXNoQXJyYXlbMV07XG4gIHJldHVybiBbZmlyc3QsIHNlY29uZF07XG59LCBcImdldFN0cm9rZURhc2hBcnJheVwiKTtcblxuZXhwb3J0IHtcbiAgc29saWRTdGF0ZUZpbGwsXG4gIGNvbXBpbGVTdHlsZXMsXG4gIGlzTGFiZWxTdHlsZSxcbiAgc3R5bGVzMlN0cmluZyxcbiAgdXNlck5vZGVPdmVycmlkZXNcbn07XG4iCiAgXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7OztBQVFBLElBQUksaUNBQWlDLE9BQU8sQ0FBQyxVQUFVO0FBQUEsRUFDckQsUUFBUSxrQkFBa0IsV0FBVTtBQUFBLEVBQ3BDLE9BQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLGNBQWM7QUFBQSxJQUVkLFlBQVk7QUFBQSxJQUNaLFlBQVk7QUFBQSxJQUNaLFdBQVc7QUFBQSxJQUNYLFFBQVE7QUFBQSxJQUNSLE1BQU07QUFBQSxFQUNSO0FBQUEsR0FDQyxnQkFBZ0I7QUFDbkIsSUFBSSxnQ0FBZ0MsT0FBTyxDQUFDLFNBQVM7QUFBQSxFQUNuRCxNQUFNLFlBQVksV0FBVztBQUFBLElBQzNCLEdBQUcsS0FBSyxxQkFBcUIsQ0FBQztBQUFBLElBQzlCLEdBQUcsS0FBSyxhQUFhLENBQUM7QUFBQSxJQUN0QixHQUFHLEtBQUssY0FBYyxDQUFDO0FBQUEsRUFDekIsQ0FBQztBQUFBLEVBQ0QsT0FBTyxFQUFFLFdBQVcsYUFBYSxDQUFDLEdBQUcsU0FBUyxFQUFFO0FBQUEsR0FDL0MsZUFBZTtBQUNsQixJQUFJLDZCQUE2QixPQUFPLENBQUMsV0FBVztBQUFBLEVBQ2xELE1BQU0sMkJBQTJCLElBQUk7QUFBQSxFQUNyQyxPQUFPLFFBQVEsQ0FBQyxVQUFVO0FBQUEsSUFDeEIsT0FBTyxLQUFLLFNBQVMsTUFBTSxNQUFNLEdBQUc7QUFBQSxJQUNwQyxTQUFTLElBQUksSUFBSSxLQUFLLEdBQUcsT0FBTyxLQUFLLENBQUM7QUFBQSxHQUN2QztBQUFBLEVBQ0QsT0FBTztBQUFBLEdBQ04sWUFBWTtBQUNmLElBQUksK0JBQStCLE9BQU8sQ0FBQyxRQUFRO0FBQUEsRUFDakQsT0FBTyxRQUFRLFdBQVcsUUFBUSxlQUFlLFFBQVEsaUJBQWlCLFFBQVEsaUJBQWlCLFFBQVEsZ0JBQWdCLFFBQVEscUJBQXFCLFFBQVEsZ0JBQWdCLFFBQVEsb0JBQW9CLFFBQVEsaUJBQWlCLFFBQVEsb0JBQW9CLFFBQVEsa0JBQWtCLFFBQVEsaUJBQWlCLFFBQVEsbUJBQW1CLFFBQVEsaUJBQWlCLFFBQVEsZUFBZSxRQUFRLGdCQUFnQixRQUFRLG1CQUFtQixRQUFRO0FBQUEsR0FDemIsY0FBYztBQUNqQixJQUFJLGdDQUFnQyxPQUFPLENBQUMsU0FBUztBQUFBLEVBQ25ELFFBQVEsZ0JBQWdCLGNBQWMsSUFBSTtBQUFBLEVBQzFDLE1BQU0sY0FBYyxDQUFDO0FBQUEsRUFDckIsTUFBTSxhQUFhLENBQUM7QUFBQSxFQUNwQixNQUFNLGVBQWUsQ0FBQztBQUFBLEVBQ3RCLE1BQU0sbUJBQW1CLENBQUM7QUFBQSxFQUMxQixZQUFZLFFBQVEsQ0FBQyxVQUFVO0FBQUEsSUFDN0IsTUFBTSxNQUFNLE1BQU07QUFBQSxJQUNsQixJQUFJLGFBQWEsR0FBRyxHQUFHO0FBQUEsTUFDckIsWUFBWSxLQUFLLE1BQU0sS0FBSyxHQUFHLElBQUksYUFBYTtBQUFBLElBQ2xELEVBQU87QUFBQSxNQUNMLFdBQVcsS0FBSyxNQUFNLEtBQUssR0FBRyxJQUFJLGFBQWE7QUFBQSxNQUMvQyxJQUFJLElBQUksU0FBUyxRQUFRLEdBQUc7QUFBQSxRQUMxQixhQUFhLEtBQUssTUFBTSxLQUFLLEdBQUcsSUFBSSxhQUFhO0FBQUEsTUFDbkQ7QUFBQSxNQUNBLElBQUksUUFBUSxRQUFRO0FBQUEsUUFDbEIsaUJBQWlCLEtBQUssTUFBTSxLQUFLLEdBQUcsSUFBSSxhQUFhO0FBQUEsTUFDdkQ7QUFBQTtBQUFBLEdBRUg7QUFBQSxFQUNELE9BQU87QUFBQSxJQUNMLGFBQWEsWUFBWSxLQUFLLEdBQUc7QUFBQSxJQUNqQyxZQUFZLFdBQVcsS0FBSyxHQUFHO0FBQUEsSUFDL0I7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLEVBQ0Y7QUFBQSxHQUNDLGVBQWU7QUFDbEIsSUFBSSxvQ0FBb0MsT0FBTyxDQUFDLE1BQU0sWUFBWTtBQUFBLEVBQ2hFLFFBQVEsZ0JBQWdCLGtCQUFrQixXQUFVO0FBQUEsRUFDcEQsUUFBUSxZQUFZLFlBQVk7QUFBQSxFQUNoQyxRQUFRLGNBQWMsY0FBYyxJQUFJO0FBQUEsRUFDeEMsTUFBTSxTQUFTLE9BQU8sT0FDcEI7QUFBQSxJQUNFLFdBQVc7QUFBQSxJQUNYLE1BQU0sVUFBVSxJQUFJLE1BQU0sS0FBSztBQUFBLElBQy9CLFdBQVc7QUFBQSxJQUVYLFlBQVk7QUFBQSxJQUNaLFlBQVk7QUFBQSxJQUNaLFFBQVEsVUFBVSxJQUFJLFFBQVEsS0FBSztBQUFBLElBQ25DLE1BQU07QUFBQSxJQUNOLGFBQWEsVUFBVSxJQUFJLGNBQWMsR0FBRyxRQUFRLE1BQU0sRUFBRSxLQUFLO0FBQUEsSUFDakUsY0FBYyxDQUFDLEdBQUcsQ0FBQztBQUFBLElBQ25CLGdCQUFnQixtQkFBbUIsVUFBVSxJQUFJLGtCQUFrQixDQUFDO0FBQUEsRUFDdEUsR0FDQSxPQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsR0FDTixtQkFBbUI7QUFDdEIsSUFBSSxxQ0FBcUMsT0FBTyxDQUFDLHlCQUF5QjtBQUFBLEVBQ3hFLElBQUksQ0FBQyxzQkFBc0I7QUFBQSxJQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDO0FBQUEsRUFDZDtBQUFBLEVBQ0EsTUFBTSxZQUFZLHFCQUFxQixLQUFLLEVBQUUsTUFBTSxLQUFLLEVBQUUsSUFBSSxNQUFNO0FBQUEsRUFDckUsSUFBSSxVQUFVLFdBQVcsR0FBRztBQUFBLElBQzFCLE1BQU0sTUFBTSxNQUFNLFVBQVUsRUFBRSxJQUFJLElBQUksVUFBVTtBQUFBLElBQ2hELE9BQU8sQ0FBQyxLQUFLLEdBQUc7QUFBQSxFQUNsQjtBQUFBLEVBQ0EsTUFBTSxRQUFRLE1BQU0sVUFBVSxFQUFFLElBQUksSUFBSSxVQUFVO0FBQUEsRUFDbEQsTUFBTSxTQUFTLE1BQU0sVUFBVSxFQUFFLElBQUksSUFBSSxVQUFVO0FBQUEsRUFDbkQsT0FBTyxDQUFDLE9BQU8sTUFBTTtBQUFBLEdBQ3BCLG9CQUFvQjsiLAogICJkZWJ1Z0lkIjogIjg5RjUzRTdBOEM3NDFGRTM2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
