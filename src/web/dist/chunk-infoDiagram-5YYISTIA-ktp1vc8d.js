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
  configureSvgSize
} from "./chunk-main-aws590jt.js";
import {
  __name,
  log
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-x0xz2rje.js";
import"./chunk-main-rxe1mr61.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/infoDiagram-5YYISTIA.mjs
var parser = {
  parse: /* @__PURE__ */ __name(async (input) => {
    const ast = await parse("info", input);
    log.debug(ast);
  }, "parse")
};
var DEFAULT_INFO_DB = {
  version: "11.15.0" + ""
};
var getVersion = /* @__PURE__ */ __name(() => DEFAULT_INFO_DB.version, "getVersion");
var db = {
  getVersion
};
var draw = /* @__PURE__ */ __name((text, id, version) => {
  log.debug(`rendering info diagram
` + text);
  const svg = selectSvgElement(id);
  configureSvgSize(svg, 100, 400, true);
  const group = svg.append("g");
  group.append("text").attr("x", 100).attr("y", 40).attr("class", "version").attr("font-size", 32).style("text-anchor", "middle").text(`v${version}`);
}, "draw");
var renderer = { draw };
var diagram = {
  parser,
  db,
  renderer
};
export {
  diagram
};

//# debugId=BA5B9AF396DAB83B64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2luZm9EaWFncmFtLTVZWUlTVElBLm1qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJpbXBvcnQge1xuICBzZWxlY3RTdmdFbGVtZW50XG59IGZyb20gXCIuL2NodW5rLVdVNU1ZRzJHLm1qc1wiO1xuaW1wb3J0IHtcbiAgY29uZmlndXJlU3ZnU2l6ZVxufSBmcm9tIFwiLi9jaHVuay1DU0NJSEs3US5tanNcIjtcbmltcG9ydCB7XG4gIF9fbmFtZSxcbiAgbG9nXG59IGZyb20gXCIuL2NodW5rLUFHSFJCNEpGLm1qc1wiO1xuXG4vLyBzcmMvZGlhZ3JhbXMvaW5mby9pbmZvUGFyc2VyLnRzXG5pbXBvcnQgeyBwYXJzZSB9IGZyb20gXCJAbWVybWFpZC1qcy9wYXJzZXJcIjtcbnZhciBwYXJzZXIgPSB7XG4gIHBhcnNlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGFzeW5jIChpbnB1dCkgPT4ge1xuICAgIGNvbnN0IGFzdCA9IGF3YWl0IHBhcnNlKFwiaW5mb1wiLCBpbnB1dCk7XG4gICAgbG9nLmRlYnVnKGFzdCk7XG4gIH0sIFwicGFyc2VcIilcbn07XG5cbi8vIHNyYy9kaWFncmFtcy9pbmZvL2luZm9EYi50c1xudmFyIERFRkFVTFRfSU5GT19EQiA9IHtcbiAgdmVyc2lvbjogXCIxMS4xNS4wXCIgKyAodHJ1ZSA/IFwiXCIgOiBcIi10aW55XCIpXG59O1xudmFyIGdldFZlcnNpb24gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCgpID0+IERFRkFVTFRfSU5GT19EQi52ZXJzaW9uLCBcImdldFZlcnNpb25cIik7XG52YXIgZGIgPSB7XG4gIGdldFZlcnNpb25cbn07XG5cbi8vIHNyYy9kaWFncmFtcy9pbmZvL2luZm9SZW5kZXJlci50c1xudmFyIGRyYXcgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCh0ZXh0LCBpZCwgdmVyc2lvbikgPT4ge1xuICBsb2cuZGVidWcoXCJyZW5kZXJpbmcgaW5mbyBkaWFncmFtXFxuXCIgKyB0ZXh0KTtcbiAgY29uc3Qgc3ZnID0gc2VsZWN0U3ZnRWxlbWVudChpZCk7XG4gIGNvbmZpZ3VyZVN2Z1NpemUoc3ZnLCAxMDAsIDQwMCwgdHJ1ZSk7XG4gIGNvbnN0IGdyb3VwID0gc3ZnLmFwcGVuZChcImdcIik7XG4gIGdyb3VwLmFwcGVuZChcInRleHRcIikuYXR0cihcInhcIiwgMTAwKS5hdHRyKFwieVwiLCA0MCkuYXR0cihcImNsYXNzXCIsIFwidmVyc2lvblwiKS5hdHRyKFwiZm9udC1zaXplXCIsIDMyKS5zdHlsZShcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpLnRleHQoYHYke3ZlcnNpb259YCk7XG59LCBcImRyYXdcIik7XG52YXIgcmVuZGVyZXIgPSB7IGRyYXcgfTtcblxuLy8gc3JjL2RpYWdyYW1zL2luZm8vaW5mb0RpYWdyYW0udHNcbnZhciBkaWFncmFtID0ge1xuICBwYXJzZXIsXG4gIGRiLFxuICByZW5kZXJlclxufTtcbmV4cG9ydCB7XG4gIGRpYWdyYW1cbn07XG4iCiAgXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFhQSxJQUFJLFNBQVM7QUFBQSxFQUNYLHVCQUF1QixPQUFPLE9BQU8sVUFBVTtBQUFBLElBQzdDLE1BQU0sTUFBTSxNQUFNLE1BQU0sUUFBUSxLQUFLO0FBQUEsSUFDckMsSUFBSSxNQUFNLEdBQUc7QUFBQSxLQUNaLE9BQU87QUFDWjtBQUdBLElBQUksa0JBQWtCO0FBQUEsRUFDcEIsU0FBUyxZQUFvQjtBQUMvQjtBQUNBLElBQUksNkJBQTZCLE9BQU8sTUFBTSxnQkFBZ0IsU0FBUyxZQUFZO0FBQ25GLElBQUksS0FBSztBQUFBLEVBQ1A7QUFDRjtBQUdBLElBQUksdUJBQXVCLE9BQU8sQ0FBQyxNQUFNLElBQUksWUFBWTtBQUFBLEVBQ3ZELElBQUksTUFBTTtBQUFBLElBQTZCLElBQUk7QUFBQSxFQUMzQyxNQUFNLE1BQU0saUJBQWlCLEVBQUU7QUFBQSxFQUMvQixpQkFBaUIsS0FBSyxLQUFLLEtBQUssSUFBSTtBQUFBLEVBQ3BDLE1BQU0sUUFBUSxJQUFJLE9BQU8sR0FBRztBQUFBLEVBQzVCLE1BQU0sT0FBTyxNQUFNLEVBQUUsS0FBSyxLQUFLLEdBQUcsRUFBRSxLQUFLLEtBQUssRUFBRSxFQUFFLEtBQUssU0FBUyxTQUFTLEVBQUUsS0FBSyxhQUFhLEVBQUUsRUFBRSxNQUFNLGVBQWUsUUFBUSxFQUFFLEtBQUssSUFBSSxTQUFTO0FBQUEsR0FDakosTUFBTTtBQUNULElBQUksV0FBVyxFQUFFLEtBQUs7QUFHdEIsSUFBSSxVQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQ0Y7IiwKICAiZGVidWdJZCI6ICJCQTVCOUFGMzk2REFCODNCNjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
