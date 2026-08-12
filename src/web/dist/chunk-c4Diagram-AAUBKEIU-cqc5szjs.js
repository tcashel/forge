import {
  drawRect,
  getNoteRect
} from "./chunk-main-sxwy6e53.js";
import {
  calculateTextHeight,
  calculateTextWidth,
  wrapLabel
} from "./chunk-main-vvfzntzy.js";
import {
  require_dist
} from "./chunk-main-ck580f0k.js";
import {
  assignWithDepth_default,
  common_default,
  configureSvgSize,
  getAccDescription,
  getAccTitle,
  getConfig2,
  sanitizeText,
  setAccDescription,
  setAccTitle
} from "./chunk-main-aws590jt.js";
import {
  __name,
  log,
  select_default
} from "./chunk-main-vcnyggwp.js";
import {
  __toESM
} from "./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/c4Diagram-AAUBKEIU.mjs
var import_sanitize_url = __toESM(require_dist(), 1);
var parser = function() {
  var o = /* @__PURE__ */ __name(function(k, v, o2, l) {
    for (o2 = o2 || {}, l = k.length;l--; o2[k[l]] = v)
      ;
    return o2;
  }, "o"), $V0 = [1, 24], $V1 = [1, 25], $V2 = [1, 26], $V3 = [1, 27], $V4 = [1, 28], $V5 = [1, 63], $V6 = [1, 64], $V7 = [1, 65], $V8 = [1, 66], $V9 = [1, 67], $Va = [1, 68], $Vb = [1, 69], $Vc = [1, 29], $Vd = [1, 30], $Ve = [1, 31], $Vf = [1, 32], $Vg = [1, 33], $Vh = [1, 34], $Vi = [1, 35], $Vj = [1, 36], $Vk = [1, 37], $Vl = [1, 38], $Vm = [1, 39], $Vn = [1, 40], $Vo = [1, 41], $Vp = [1, 42], $Vq = [1, 43], $Vr = [1, 44], $Vs = [1, 45], $Vt = [1, 46], $Vu = [1, 47], $Vv = [1, 48], $Vw = [1, 50], $Vx = [1, 51], $Vy = [1, 52], $Vz = [1, 53], $VA = [1, 54], $VB = [1, 55], $VC = [1, 56], $VD = [1, 57], $VE = [1, 58], $VF = [1, 59], $VG = [1, 60], $VH = [14, 42], $VI = [14, 34, 36, 37, 38, 39, 40, 41, 42, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74], $VJ = [12, 14, 34, 36, 37, 38, 39, 40, 41, 42, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74], $VK = [1, 82], $VL = [1, 83], $VM = [1, 84], $VN = [1, 85], $VO = [12, 14, 42], $VP = [12, 14, 33, 42], $VQ = [12, 14, 33, 42, 76, 77, 79, 80], $VR = [12, 33], $VS = [34, 36, 37, 38, 39, 40, 41, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74];
  var parser2 = {
    trace: /* @__PURE__ */ __name(function trace() {}, "trace"),
    yy: {},
    symbols_: { error: 2, start: 3, mermaidDoc: 4, direction: 5, direction_tb: 6, direction_bt: 7, direction_rl: 8, direction_lr: 9, graphConfig: 10, C4_CONTEXT: 11, NEWLINE: 12, statements: 13, EOF: 14, C4_CONTAINER: 15, C4_COMPONENT: 16, C4_DYNAMIC: 17, C4_DEPLOYMENT: 18, otherStatements: 19, diagramStatements: 20, otherStatement: 21, title: 22, accDescription: 23, acc_title: 24, acc_title_value: 25, acc_descr: 26, acc_descr_value: 27, acc_descr_multiline_value: 28, boundaryStatement: 29, boundaryStartStatement: 30, boundaryStopStatement: 31, boundaryStart: 32, LBRACE: 33, ENTERPRISE_BOUNDARY: 34, attributes: 35, SYSTEM_BOUNDARY: 36, BOUNDARY: 37, CONTAINER_BOUNDARY: 38, NODE: 39, NODE_L: 40, NODE_R: 41, RBRACE: 42, diagramStatement: 43, PERSON: 44, PERSON_EXT: 45, SYSTEM: 46, SYSTEM_DB: 47, SYSTEM_QUEUE: 48, SYSTEM_EXT: 49, SYSTEM_EXT_DB: 50, SYSTEM_EXT_QUEUE: 51, CONTAINER: 52, CONTAINER_DB: 53, CONTAINER_QUEUE: 54, CONTAINER_EXT: 55, CONTAINER_EXT_DB: 56, CONTAINER_EXT_QUEUE: 57, COMPONENT: 58, COMPONENT_DB: 59, COMPONENT_QUEUE: 60, COMPONENT_EXT: 61, COMPONENT_EXT_DB: 62, COMPONENT_EXT_QUEUE: 63, REL: 64, BIREL: 65, REL_U: 66, REL_D: 67, REL_L: 68, REL_R: 69, REL_B: 70, REL_INDEX: 71, UPDATE_EL_STYLE: 72, UPDATE_REL_STYLE: 73, UPDATE_LAYOUT_CONFIG: 74, attribute: 75, STR: 76, STR_KEY: 77, STR_VALUE: 78, ATTRIBUTE: 79, ATTRIBUTE_EMPTY: 80, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 6: "direction_tb", 7: "direction_bt", 8: "direction_rl", 9: "direction_lr", 11: "C4_CONTEXT", 12: "NEWLINE", 14: "EOF", 15: "C4_CONTAINER", 16: "C4_COMPONENT", 17: "C4_DYNAMIC", 18: "C4_DEPLOYMENT", 22: "title", 23: "accDescription", 24: "acc_title", 25: "acc_title_value", 26: "acc_descr", 27: "acc_descr_value", 28: "acc_descr_multiline_value", 33: "LBRACE", 34: "ENTERPRISE_BOUNDARY", 36: "SYSTEM_BOUNDARY", 37: "BOUNDARY", 38: "CONTAINER_BOUNDARY", 39: "NODE", 40: "NODE_L", 41: "NODE_R", 42: "RBRACE", 44: "PERSON", 45: "PERSON_EXT", 46: "SYSTEM", 47: "SYSTEM_DB", 48: "SYSTEM_QUEUE", 49: "SYSTEM_EXT", 50: "SYSTEM_EXT_DB", 51: "SYSTEM_EXT_QUEUE", 52: "CONTAINER", 53: "CONTAINER_DB", 54: "CONTAINER_QUEUE", 55: "CONTAINER_EXT", 56: "CONTAINER_EXT_DB", 57: "CONTAINER_EXT_QUEUE", 58: "COMPONENT", 59: "COMPONENT_DB", 60: "COMPONENT_QUEUE", 61: "COMPONENT_EXT", 62: "COMPONENT_EXT_DB", 63: "COMPONENT_EXT_QUEUE", 64: "REL", 65: "BIREL", 66: "REL_U", 67: "REL_D", 68: "REL_L", 69: "REL_R", 70: "REL_B", 71: "REL_INDEX", 72: "UPDATE_EL_STYLE", 73: "UPDATE_REL_STYLE", 74: "UPDATE_LAYOUT_CONFIG", 76: "STR", 77: "STR_KEY", 78: "STR_VALUE", 79: "ATTRIBUTE", 80: "ATTRIBUTE_EMPTY" },
    productions_: [0, [3, 1], [3, 1], [5, 1], [5, 1], [5, 1], [5, 1], [4, 1], [10, 4], [10, 4], [10, 4], [10, 4], [10, 4], [13, 1], [13, 1], [13, 2], [19, 1], [19, 2], [19, 3], [21, 1], [21, 1], [21, 2], [21, 2], [21, 1], [29, 3], [30, 3], [30, 3], [30, 4], [32, 2], [32, 2], [32, 2], [32, 2], [32, 2], [32, 2], [32, 2], [31, 1], [20, 1], [20, 2], [20, 3], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 1], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [43, 2], [35, 1], [35, 2], [75, 1], [75, 2], [75, 1], [75, 1]],
    performAction: /* @__PURE__ */ __name(function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
      var $0 = $$.length - 1;
      switch (yystate) {
        case 3:
          yy.setDirection("TB");
          break;
        case 4:
          yy.setDirection("BT");
          break;
        case 5:
          yy.setDirection("RL");
          break;
        case 6:
          yy.setDirection("LR");
          break;
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
          yy.setC4Type($$[$0 - 3]);
          break;
        case 19:
          yy.setTitle($$[$0].substring(6));
          this.$ = $$[$0].substring(6);
          break;
        case 20:
          yy.setAccDescription($$[$0].substring(15));
          this.$ = $$[$0].substring(15);
          break;
        case 21:
          this.$ = $$[$0].trim();
          yy.setTitle(this.$);
          break;
        case 22:
        case 23:
          this.$ = $$[$0].trim();
          yy.setAccDescription(this.$);
          break;
        case 28:
          $$[$0].splice(2, 0, "ENTERPRISE");
          yy.addPersonOrSystemBoundary(...$$[$0]);
          this.$ = $$[$0];
          break;
        case 29:
          $$[$0].splice(2, 0, "SYSTEM");
          yy.addPersonOrSystemBoundary(...$$[$0]);
          this.$ = $$[$0];
          break;
        case 30:
          yy.addPersonOrSystemBoundary(...$$[$0]);
          this.$ = $$[$0];
          break;
        case 31:
          $$[$0].splice(2, 0, "CONTAINER");
          yy.addContainerBoundary(...$$[$0]);
          this.$ = $$[$0];
          break;
        case 32:
          yy.addDeploymentNode("node", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 33:
          yy.addDeploymentNode("nodeL", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 34:
          yy.addDeploymentNode("nodeR", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 35:
          yy.popBoundaryParseStack();
          break;
        case 39:
          yy.addPersonOrSystem("person", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 40:
          yy.addPersonOrSystem("external_person", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 41:
          yy.addPersonOrSystem("system", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 42:
          yy.addPersonOrSystem("system_db", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 43:
          yy.addPersonOrSystem("system_queue", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 44:
          yy.addPersonOrSystem("external_system", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 45:
          yy.addPersonOrSystem("external_system_db", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 46:
          yy.addPersonOrSystem("external_system_queue", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 47:
          yy.addContainer("container", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 48:
          yy.addContainer("container_db", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 49:
          yy.addContainer("container_queue", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 50:
          yy.addContainer("external_container", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 51:
          yy.addContainer("external_container_db", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 52:
          yy.addContainer("external_container_queue", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 53:
          yy.addComponent("component", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 54:
          yy.addComponent("component_db", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 55:
          yy.addComponent("component_queue", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 56:
          yy.addComponent("external_component", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 57:
          yy.addComponent("external_component_db", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 58:
          yy.addComponent("external_component_queue", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 60:
          yy.addRel("rel", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 61:
          yy.addRel("birel", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 62:
          yy.addRel("rel_u", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 63:
          yy.addRel("rel_d", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 64:
          yy.addRel("rel_l", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 65:
          yy.addRel("rel_r", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 66:
          yy.addRel("rel_b", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 67:
          $$[$0].splice(0, 1);
          yy.addRel("rel", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 68:
          yy.updateElStyle("update_el_style", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 69:
          yy.updateRelStyle("update_rel_style", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 70:
          yy.updateLayoutConfig("update_layout_config", ...$$[$0]);
          this.$ = $$[$0];
          break;
        case 71:
          this.$ = [$$[$0]];
          break;
        case 72:
          $$[$0].unshift($$[$0 - 1]);
          this.$ = $$[$0];
          break;
        case 73:
        case 75:
          this.$ = $$[$0].trim();
          break;
        case 74:
          let kv = {};
          kv[$$[$0 - 1].trim()] = $$[$0].trim();
          this.$ = kv;
          break;
        case 76:
          this.$ = "";
          break;
      }
    }, "anonymous"),
    table: [{ 3: 1, 4: 2, 5: 3, 6: [1, 5], 7: [1, 6], 8: [1, 7], 9: [1, 8], 10: 4, 11: [1, 9], 15: [1, 10], 16: [1, 11], 17: [1, 12], 18: [1, 13] }, { 1: [3] }, { 1: [2, 1] }, { 1: [2, 2] }, { 1: [2, 7] }, { 1: [2, 3] }, { 1: [2, 4] }, { 1: [2, 5] }, { 1: [2, 6] }, { 12: [1, 14] }, { 12: [1, 15] }, { 12: [1, 16] }, { 12: [1, 17] }, { 12: [1, 18] }, { 13: 19, 19: 20, 20: 21, 21: 22, 22: $V0, 23: $V1, 24: $V2, 26: $V3, 28: $V4, 29: 49, 30: 61, 32: 62, 34: $V5, 36: $V6, 37: $V7, 38: $V8, 39: $V9, 40: $Va, 41: $Vb, 43: 23, 44: $Vc, 45: $Vd, 46: $Ve, 47: $Vf, 48: $Vg, 49: $Vh, 50: $Vi, 51: $Vj, 52: $Vk, 53: $Vl, 54: $Vm, 55: $Vn, 56: $Vo, 57: $Vp, 58: $Vq, 59: $Vr, 60: $Vs, 61: $Vt, 62: $Vu, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz, 68: $VA, 69: $VB, 70: $VC, 71: $VD, 72: $VE, 73: $VF, 74: $VG }, { 13: 70, 19: 20, 20: 21, 21: 22, 22: $V0, 23: $V1, 24: $V2, 26: $V3, 28: $V4, 29: 49, 30: 61, 32: 62, 34: $V5, 36: $V6, 37: $V7, 38: $V8, 39: $V9, 40: $Va, 41: $Vb, 43: 23, 44: $Vc, 45: $Vd, 46: $Ve, 47: $Vf, 48: $Vg, 49: $Vh, 50: $Vi, 51: $Vj, 52: $Vk, 53: $Vl, 54: $Vm, 55: $Vn, 56: $Vo, 57: $Vp, 58: $Vq, 59: $Vr, 60: $Vs, 61: $Vt, 62: $Vu, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz, 68: $VA, 69: $VB, 70: $VC, 71: $VD, 72: $VE, 73: $VF, 74: $VG }, { 13: 71, 19: 20, 20: 21, 21: 22, 22: $V0, 23: $V1, 24: $V2, 26: $V3, 28: $V4, 29: 49, 30: 61, 32: 62, 34: $V5, 36: $V6, 37: $V7, 38: $V8, 39: $V9, 40: $Va, 41: $Vb, 43: 23, 44: $Vc, 45: $Vd, 46: $Ve, 47: $Vf, 48: $Vg, 49: $Vh, 50: $Vi, 51: $Vj, 52: $Vk, 53: $Vl, 54: $Vm, 55: $Vn, 56: $Vo, 57: $Vp, 58: $Vq, 59: $Vr, 60: $Vs, 61: $Vt, 62: $Vu, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz, 68: $VA, 69: $VB, 70: $VC, 71: $VD, 72: $VE, 73: $VF, 74: $VG }, { 13: 72, 19: 20, 20: 21, 21: 22, 22: $V0, 23: $V1, 24: $V2, 26: $V3, 28: $V4, 29: 49, 30: 61, 32: 62, 34: $V5, 36: $V6, 37: $V7, 38: $V8, 39: $V9, 40: $Va, 41: $Vb, 43: 23, 44: $Vc, 45: $Vd, 46: $Ve, 47: $Vf, 48: $Vg, 49: $Vh, 50: $Vi, 51: $Vj, 52: $Vk, 53: $Vl, 54: $Vm, 55: $Vn, 56: $Vo, 57: $Vp, 58: $Vq, 59: $Vr, 60: $Vs, 61: $Vt, 62: $Vu, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz, 68: $VA, 69: $VB, 70: $VC, 71: $VD, 72: $VE, 73: $VF, 74: $VG }, { 13: 73, 19: 20, 20: 21, 21: 22, 22: $V0, 23: $V1, 24: $V2, 26: $V3, 28: $V4, 29: 49, 30: 61, 32: 62, 34: $V5, 36: $V6, 37: $V7, 38: $V8, 39: $V9, 40: $Va, 41: $Vb, 43: 23, 44: $Vc, 45: $Vd, 46: $Ve, 47: $Vf, 48: $Vg, 49: $Vh, 50: $Vi, 51: $Vj, 52: $Vk, 53: $Vl, 54: $Vm, 55: $Vn, 56: $Vo, 57: $Vp, 58: $Vq, 59: $Vr, 60: $Vs, 61: $Vt, 62: $Vu, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz, 68: $VA, 69: $VB, 70: $VC, 71: $VD, 72: $VE, 73: $VF, 74: $VG }, { 14: [1, 74] }, o($VH, [2, 13], { 43: 23, 29: 49, 30: 61, 32: 62, 20: 75, 34: $V5, 36: $V6, 37: $V7, 38: $V8, 39: $V9, 40: $Va, 41: $Vb, 44: $Vc, 45: $Vd, 46: $Ve, 47: $Vf, 48: $Vg, 49: $Vh, 50: $Vi, 51: $Vj, 52: $Vk, 53: $Vl, 54: $Vm, 55: $Vn, 56: $Vo, 57: $Vp, 58: $Vq, 59: $Vr, 60: $Vs, 61: $Vt, 62: $Vu, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz, 68: $VA, 69: $VB, 70: $VC, 71: $VD, 72: $VE, 73: $VF, 74: $VG }), o($VH, [2, 14]), o($VI, [2, 16], { 12: [1, 76] }), o($VH, [2, 36], { 12: [1, 77] }), o($VJ, [2, 19]), o($VJ, [2, 20]), { 25: [1, 78] }, { 27: [1, 79] }, o($VJ, [2, 23]), { 35: 80, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 86, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 87, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 88, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 89, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 90, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 91, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 92, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 93, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 94, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 95, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 96, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 97, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 98, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 99, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 100, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 101, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 102, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 103, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 104, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, o($VO, [2, 59]), { 35: 105, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 106, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 107, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 108, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 109, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 110, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 111, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 112, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 113, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 114, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 115, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 20: 116, 29: 49, 30: 61, 32: 62, 34: $V5, 36: $V6, 37: $V7, 38: $V8, 39: $V9, 40: $Va, 41: $Vb, 43: 23, 44: $Vc, 45: $Vd, 46: $Ve, 47: $Vf, 48: $Vg, 49: $Vh, 50: $Vi, 51: $Vj, 52: $Vk, 53: $Vl, 54: $Vm, 55: $Vn, 56: $Vo, 57: $Vp, 58: $Vq, 59: $Vr, 60: $Vs, 61: $Vt, 62: $Vu, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz, 68: $VA, 69: $VB, 70: $VC, 71: $VD, 72: $VE, 73: $VF, 74: $VG }, { 12: [1, 118], 33: [1, 117] }, { 35: 119, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 120, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 121, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 122, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 123, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 124, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 35: 125, 75: 81, 76: $VK, 77: $VL, 79: $VM, 80: $VN }, { 14: [1, 126] }, { 14: [1, 127] }, { 14: [1, 128] }, { 14: [1, 129] }, { 1: [2, 8] }, o($VH, [2, 15]), o($VI, [2, 17], { 21: 22, 19: 130, 22: $V0, 23: $V1, 24: $V2, 26: $V3, 28: $V4 }), o($VH, [2, 37], { 19: 20, 20: 21, 21: 22, 43: 23, 29: 49, 30: 61, 32: 62, 13: 131, 22: $V0, 23: $V1, 24: $V2, 26: $V3, 28: $V4, 34: $V5, 36: $V6, 37: $V7, 38: $V8, 39: $V9, 40: $Va, 41: $Vb, 44: $Vc, 45: $Vd, 46: $Ve, 47: $Vf, 48: $Vg, 49: $Vh, 50: $Vi, 51: $Vj, 52: $Vk, 53: $Vl, 54: $Vm, 55: $Vn, 56: $Vo, 57: $Vp, 58: $Vq, 59: $Vr, 60: $Vs, 61: $Vt, 62: $Vu, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz, 68: $VA, 69: $VB, 70: $VC, 71: $VD, 72: $VE, 73: $VF, 74: $VG }), o($VJ, [2, 21]), o($VJ, [2, 22]), o($VO, [2, 39]), o($VP, [2, 71], { 75: 81, 35: 132, 76: $VK, 77: $VL, 79: $VM, 80: $VN }), o($VQ, [2, 73]), { 78: [1, 133] }, o($VQ, [2, 75]), o($VQ, [2, 76]), o($VO, [2, 40]), o($VO, [2, 41]), o($VO, [2, 42]), o($VO, [2, 43]), o($VO, [2, 44]), o($VO, [2, 45]), o($VO, [2, 46]), o($VO, [2, 47]), o($VO, [2, 48]), o($VO, [2, 49]), o($VO, [2, 50]), o($VO, [2, 51]), o($VO, [2, 52]), o($VO, [2, 53]), o($VO, [2, 54]), o($VO, [2, 55]), o($VO, [2, 56]), o($VO, [2, 57]), o($VO, [2, 58]), o($VO, [2, 60]), o($VO, [2, 61]), o($VO, [2, 62]), o($VO, [2, 63]), o($VO, [2, 64]), o($VO, [2, 65]), o($VO, [2, 66]), o($VO, [2, 67]), o($VO, [2, 68]), o($VO, [2, 69]), o($VO, [2, 70]), { 31: 134, 42: [1, 135] }, { 12: [1, 136] }, { 33: [1, 137] }, o($VR, [2, 28]), o($VR, [2, 29]), o($VR, [2, 30]), o($VR, [2, 31]), o($VR, [2, 32]), o($VR, [2, 33]), o($VR, [2, 34]), { 1: [2, 9] }, { 1: [2, 10] }, { 1: [2, 11] }, { 1: [2, 12] }, o($VI, [2, 18]), o($VH, [2, 38]), o($VP, [2, 72]), o($VQ, [2, 74]), o($VO, [2, 24]), o($VO, [2, 35]), o($VS, [2, 25]), o($VS, [2, 26], { 12: [1, 138] }), o($VS, [2, 27])],
    defaultActions: { 2: [2, 1], 3: [2, 2], 4: [2, 7], 5: [2, 3], 6: [2, 4], 7: [2, 5], 8: [2, 6], 74: [2, 8], 126: [2, 9], 127: [2, 10], 128: [2, 11], 129: [2, 12] },
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
        var c2 = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + `
` + c2 + "^";
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
        var token, match, tempMatch, index;
        if (!this._more) {
          this.yytext = "";
          this.match = "";
        }
        var rules = this._currentRules();
        for (var i = 0;i < rules.length; i++) {
          tempMatch = this._input.match(this.rules[rules[i]]);
          if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
            match = tempMatch;
            index = i;
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
          token = this.test_match(match, rules[index]);
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
      options: {},
      performAction: /* @__PURE__ */ __name(function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {
        var YYSTATE = YY_START;
        switch ($avoiding_name_collisions) {
          case 0:
            return 6;
            break;
          case 1:
            return 7;
            break;
          case 2:
            return 8;
            break;
          case 3:
            return 9;
            break;
          case 4:
            return 22;
            break;
          case 5:
            return 23;
            break;
          case 6:
            this.begin("acc_title");
            return 24;
            break;
          case 7:
            this.popState();
            return "acc_title_value";
            break;
          case 8:
            this.begin("acc_descr");
            return 26;
            break;
          case 9:
            this.popState();
            return "acc_descr_value";
            break;
          case 10:
            this.begin("acc_descr_multiline");
            break;
          case 11:
            this.popState();
            break;
          case 12:
            return "acc_descr_multiline_value";
            break;
          case 13:
            break;
          case 14:
            c;
            break;
          case 15:
            return 12;
            break;
          case 16:
            break;
          case 17:
            return 11;
            break;
          case 18:
            return 15;
            break;
          case 19:
            return 16;
            break;
          case 20:
            return 17;
            break;
          case 21:
            return 18;
            break;
          case 22:
            this.begin("person_ext");
            return 45;
            break;
          case 23:
            this.begin("person");
            return 44;
            break;
          case 24:
            this.begin("system_ext_queue");
            return 51;
            break;
          case 25:
            this.begin("system_ext_db");
            return 50;
            break;
          case 26:
            this.begin("system_ext");
            return 49;
            break;
          case 27:
            this.begin("system_queue");
            return 48;
            break;
          case 28:
            this.begin("system_db");
            return 47;
            break;
          case 29:
            this.begin("system");
            return 46;
            break;
          case 30:
            this.begin("boundary");
            return 37;
            break;
          case 31:
            this.begin("enterprise_boundary");
            return 34;
            break;
          case 32:
            this.begin("system_boundary");
            return 36;
            break;
          case 33:
            this.begin("container_ext_queue");
            return 57;
            break;
          case 34:
            this.begin("container_ext_db");
            return 56;
            break;
          case 35:
            this.begin("container_ext");
            return 55;
            break;
          case 36:
            this.begin("container_queue");
            return 54;
            break;
          case 37:
            this.begin("container_db");
            return 53;
            break;
          case 38:
            this.begin("container");
            return 52;
            break;
          case 39:
            this.begin("container_boundary");
            return 38;
            break;
          case 40:
            this.begin("component_ext_queue");
            return 63;
            break;
          case 41:
            this.begin("component_ext_db");
            return 62;
            break;
          case 42:
            this.begin("component_ext");
            return 61;
            break;
          case 43:
            this.begin("component_queue");
            return 60;
            break;
          case 44:
            this.begin("component_db");
            return 59;
            break;
          case 45:
            this.begin("component");
            return 58;
            break;
          case 46:
            this.begin("node");
            return 39;
            break;
          case 47:
            this.begin("node");
            return 39;
            break;
          case 48:
            this.begin("node_l");
            return 40;
            break;
          case 49:
            this.begin("node_r");
            return 41;
            break;
          case 50:
            this.begin("rel");
            return 64;
            break;
          case 51:
            this.begin("birel");
            return 65;
            break;
          case 52:
            this.begin("rel_u");
            return 66;
            break;
          case 53:
            this.begin("rel_u");
            return 66;
            break;
          case 54:
            this.begin("rel_d");
            return 67;
            break;
          case 55:
            this.begin("rel_d");
            return 67;
            break;
          case 56:
            this.begin("rel_l");
            return 68;
            break;
          case 57:
            this.begin("rel_l");
            return 68;
            break;
          case 58:
            this.begin("rel_r");
            return 69;
            break;
          case 59:
            this.begin("rel_r");
            return 69;
            break;
          case 60:
            this.begin("rel_b");
            return 70;
            break;
          case 61:
            this.begin("rel_index");
            return 71;
            break;
          case 62:
            this.begin("update_el_style");
            return 72;
            break;
          case 63:
            this.begin("update_rel_style");
            return 73;
            break;
          case 64:
            this.begin("update_layout_config");
            return 74;
            break;
          case 65:
            return "EOF_IN_STRUCT";
            break;
          case 66:
            this.begin("attribute");
            return "ATTRIBUTE_EMPTY";
            break;
          case 67:
            this.begin("attribute");
            break;
          case 68:
            this.popState();
            this.popState();
            break;
          case 69:
            return 80;
            break;
          case 70:
            break;
          case 71:
            return 80;
            break;
          case 72:
            this.begin("string");
            break;
          case 73:
            this.popState();
            break;
          case 74:
            return "STR";
            break;
          case 75:
            this.begin("string_kv");
            break;
          case 76:
            this.begin("string_kv_key");
            return "STR_KEY";
            break;
          case 77:
            this.popState();
            this.begin("string_kv_value");
            break;
          case 78:
            return "STR_VALUE";
            break;
          case 79:
            this.popState();
            this.popState();
            break;
          case 80:
            return "STR";
            break;
          case 81:
            return "LBRACE";
            break;
          case 82:
            return "RBRACE";
            break;
          case 83:
            return "SPACE";
            break;
          case 84:
            return "EOL";
            break;
          case 85:
            return 14;
            break;
        }
      }, "anonymous"),
      rules: [/^(?:.*direction\s+TB[^\n]*)/, /^(?:.*direction\s+BT[^\n]*)/, /^(?:.*direction\s+RL[^\n]*)/, /^(?:.*direction\s+LR[^\n]*)/, /^(?:title\s[^#\n;]+)/, /^(?:accDescription\s[^#\n;]+)/, /^(?:accTitle\s*:\s*)/, /^(?:(?!\n||)*[^\n]*)/, /^(?:accDescr\s*:\s*)/, /^(?:(?!\n||)*[^\n]*)/, /^(?:accDescr\s*\{\s*)/, /^(?:[\}])/, /^(?:[^\}]*)/, /^(?:%%(?!\{)*[^\n]*(\r?\n?)+)/, /^(?:%%[^\n]*(\r?\n)*)/, /^(?:\s*(\r?\n)+)/, /^(?:\s+)/, /^(?:C4Context\b)/, /^(?:C4Container\b)/, /^(?:C4Component\b)/, /^(?:C4Dynamic\b)/, /^(?:C4Deployment\b)/, /^(?:Person_Ext\b)/, /^(?:Person\b)/, /^(?:SystemQueue_Ext\b)/, /^(?:SystemDb_Ext\b)/, /^(?:System_Ext\b)/, /^(?:SystemQueue\b)/, /^(?:SystemDb\b)/, /^(?:System\b)/, /^(?:Boundary\b)/, /^(?:Enterprise_Boundary\b)/, /^(?:System_Boundary\b)/, /^(?:ContainerQueue_Ext\b)/, /^(?:ContainerDb_Ext\b)/, /^(?:Container_Ext\b)/, /^(?:ContainerQueue\b)/, /^(?:ContainerDb\b)/, /^(?:Container\b)/, /^(?:Container_Boundary\b)/, /^(?:ComponentQueue_Ext\b)/, /^(?:ComponentDb_Ext\b)/, /^(?:Component_Ext\b)/, /^(?:ComponentQueue\b)/, /^(?:ComponentDb\b)/, /^(?:Component\b)/, /^(?:Deployment_Node\b)/, /^(?:Node\b)/, /^(?:Node_L\b)/, /^(?:Node_R\b)/, /^(?:Rel\b)/, /^(?:BiRel\b)/, /^(?:Rel_Up\b)/, /^(?:Rel_U\b)/, /^(?:Rel_Down\b)/, /^(?:Rel_D\b)/, /^(?:Rel_Left\b)/, /^(?:Rel_L\b)/, /^(?:Rel_Right\b)/, /^(?:Rel_R\b)/, /^(?:Rel_Back\b)/, /^(?:RelIndex\b)/, /^(?:UpdateElementStyle\b)/, /^(?:UpdateRelStyle\b)/, /^(?:UpdateLayoutConfig\b)/, /^(?:$)/, /^(?:[(][ ]*[,])/, /^(?:[(])/, /^(?:[)])/, /^(?:,,)/, /^(?:,)/, /^(?:[ ]*["]["])/, /^(?:[ ]*["])/, /^(?:["])/, /^(?:[^"]*)/, /^(?:[ ]*[\$])/, /^(?:[^=]*)/, /^(?:[=][ ]*["])/, /^(?:[^"]+)/, /^(?:["])/, /^(?:[^,]+)/, /^(?:\{)/, /^(?:\})/, /^(?:[\s]+)/, /^(?:[\n\r]+)/, /^(?:$)/],
      conditions: { acc_descr_multiline: { rules: [11, 12], inclusive: false }, acc_descr: { rules: [9], inclusive: false }, acc_title: { rules: [7], inclusive: false }, string_kv_value: { rules: [78, 79], inclusive: false }, string_kv_key: { rules: [77], inclusive: false }, string_kv: { rules: [76], inclusive: false }, string: { rules: [73, 74], inclusive: false }, attribute: { rules: [68, 69, 70, 71, 72, 75, 80], inclusive: false }, update_layout_config: { rules: [65, 66, 67, 68], inclusive: false }, update_rel_style: { rules: [65, 66, 67, 68], inclusive: false }, update_el_style: { rules: [65, 66, 67, 68], inclusive: false }, rel_b: { rules: [65, 66, 67, 68], inclusive: false }, rel_r: { rules: [65, 66, 67, 68], inclusive: false }, rel_l: { rules: [65, 66, 67, 68], inclusive: false }, rel_d: { rules: [65, 66, 67, 68], inclusive: false }, rel_u: { rules: [65, 66, 67, 68], inclusive: false }, rel_bi: { rules: [], inclusive: false }, rel: { rules: [65, 66, 67, 68], inclusive: false }, node_r: { rules: [65, 66, 67, 68], inclusive: false }, node_l: { rules: [65, 66, 67, 68], inclusive: false }, node: { rules: [65, 66, 67, 68], inclusive: false }, index: { rules: [], inclusive: false }, rel_index: { rules: [65, 66, 67, 68], inclusive: false }, component_ext_queue: { rules: [65, 66, 67, 68], inclusive: false }, component_ext_db: { rules: [65, 66, 67, 68], inclusive: false }, component_ext: { rules: [65, 66, 67, 68], inclusive: false }, component_queue: { rules: [65, 66, 67, 68], inclusive: false }, component_db: { rules: [65, 66, 67, 68], inclusive: false }, component: { rules: [65, 66, 67, 68], inclusive: false }, container_boundary: { rules: [65, 66, 67, 68], inclusive: false }, container_ext_queue: { rules: [65, 66, 67, 68], inclusive: false }, container_ext_db: { rules: [65, 66, 67, 68], inclusive: false }, container_ext: { rules: [65, 66, 67, 68], inclusive: false }, container_queue: { rules: [65, 66, 67, 68], inclusive: false }, container_db: { rules: [65, 66, 67, 68], inclusive: false }, container: { rules: [65, 66, 67, 68], inclusive: false }, birel: { rules: [65, 66, 67, 68], inclusive: false }, system_boundary: { rules: [65, 66, 67, 68], inclusive: false }, enterprise_boundary: { rules: [65, 66, 67, 68], inclusive: false }, boundary: { rules: [65, 66, 67, 68], inclusive: false }, system_ext_queue: { rules: [65, 66, 67, 68], inclusive: false }, system_ext_db: { rules: [65, 66, 67, 68], inclusive: false }, system_ext: { rules: [65, 66, 67, 68], inclusive: false }, system_queue: { rules: [65, 66, 67, 68], inclusive: false }, system_db: { rules: [65, 66, 67, 68], inclusive: false }, system: { rules: [65, 66, 67, 68], inclusive: false }, person_ext: { rules: [65, 66, 67, 68], inclusive: false }, person: { rules: [65, 66, 67, 68], inclusive: false }, INITIAL: { rules: [0, 1, 2, 3, 4, 5, 6, 8, 10, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 81, 82, 83, 84, 85], inclusive: true } }
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
var c4Diagram_default = parser;
var c4ShapeArray = [];
var boundaryParseStack = [""];
var currentBoundaryParse = "global";
var parentBoundaryParse = "";
var boundaries = [
  {
    alias: "global",
    label: { text: "global" },
    type: { text: "global" },
    tags: null,
    link: null,
    parentBoundary: ""
  }
];
var rels = [];
var title = "";
var wrapEnabled = false;
var c4ShapeInRow = 4;
var c4BoundaryInRow = 2;
var c4Type;
var getC4Type = /* @__PURE__ */ __name(function() {
  return c4Type;
}, "getC4Type");
var setC4Type = /* @__PURE__ */ __name(function(c4TypeParam) {
  let sanitizedText = sanitizeText(c4TypeParam, getConfig2());
  c4Type = sanitizedText;
}, "setC4Type");
var addRel = /* @__PURE__ */ __name(function(type, from, to, label, techn, descr, sprite, tags, link) {
  if (type === undefined || type === null || from === undefined || from === null || to === undefined || to === null || label === undefined || label === null) {
    return;
  }
  let rel = {};
  const old = rels.find((rel2) => rel2.from === from && rel2.to === to);
  if (old) {
    rel = old;
  } else {
    rels.push(rel);
  }
  rel.type = type;
  rel.from = from;
  rel.to = to;
  rel.label = { text: label };
  if (techn === undefined || techn === null) {
    rel.techn = { text: "" };
  } else {
    if (typeof techn === "object") {
      let [key, value] = Object.entries(techn)[0];
      rel[key] = { text: value };
    } else {
      rel.techn = { text: techn };
    }
  }
  if (descr === undefined || descr === null) {
    rel.descr = { text: "" };
  } else {
    if (typeof descr === "object") {
      let [key, value] = Object.entries(descr)[0];
      rel[key] = { text: value };
    } else {
      rel.descr = { text: descr };
    }
  }
  if (typeof sprite === "object") {
    let [key, value] = Object.entries(sprite)[0];
    rel[key] = value;
  } else {
    rel.sprite = sprite;
  }
  if (typeof tags === "object") {
    let [key, value] = Object.entries(tags)[0];
    rel[key] = value;
  } else {
    rel.tags = tags;
  }
  if (typeof link === "object") {
    let [key, value] = Object.entries(link)[0];
    rel[key] = value;
  } else {
    rel.link = link;
  }
  rel.wrap = autoWrap();
}, "addRel");
var addPersonOrSystem = /* @__PURE__ */ __name(function(typeC4Shape, alias, label, descr, sprite, tags, link) {
  if (alias === null || label === null) {
    return;
  }
  let personOrSystem = {};
  const old = c4ShapeArray.find((personOrSystem2) => personOrSystem2.alias === alias);
  if (old && alias === old.alias) {
    personOrSystem = old;
  } else {
    personOrSystem.alias = alias;
    c4ShapeArray.push(personOrSystem);
  }
  if (label === undefined || label === null) {
    personOrSystem.label = { text: "" };
  } else {
    personOrSystem.label = { text: label };
  }
  if (descr === undefined || descr === null) {
    personOrSystem.descr = { text: "" };
  } else {
    if (typeof descr === "object") {
      let [key, value] = Object.entries(descr)[0];
      personOrSystem[key] = { text: value };
    } else {
      personOrSystem.descr = { text: descr };
    }
  }
  if (typeof sprite === "object") {
    let [key, value] = Object.entries(sprite)[0];
    personOrSystem[key] = value;
  } else {
    personOrSystem.sprite = sprite;
  }
  if (typeof tags === "object") {
    let [key, value] = Object.entries(tags)[0];
    personOrSystem[key] = value;
  } else {
    personOrSystem.tags = tags;
  }
  if (typeof link === "object") {
    let [key, value] = Object.entries(link)[0];
    personOrSystem[key] = value;
  } else {
    personOrSystem.link = link;
  }
  personOrSystem.typeC4Shape = { text: typeC4Shape };
  personOrSystem.parentBoundary = currentBoundaryParse;
  personOrSystem.wrap = autoWrap();
}, "addPersonOrSystem");
var addContainer = /* @__PURE__ */ __name(function(typeC4Shape, alias, label, techn, descr, sprite, tags, link) {
  if (alias === null || label === null) {
    return;
  }
  let container = {};
  const old = c4ShapeArray.find((container2) => container2.alias === alias);
  if (old && alias === old.alias) {
    container = old;
  } else {
    container.alias = alias;
    c4ShapeArray.push(container);
  }
  if (label === undefined || label === null) {
    container.label = { text: "" };
  } else {
    container.label = { text: label };
  }
  if (techn === undefined || techn === null) {
    container.techn = { text: "" };
  } else {
    if (typeof techn === "object") {
      let [key, value] = Object.entries(techn)[0];
      container[key] = { text: value };
    } else {
      container.techn = { text: techn };
    }
  }
  if (descr === undefined || descr === null) {
    container.descr = { text: "" };
  } else {
    if (typeof descr === "object") {
      let [key, value] = Object.entries(descr)[0];
      container[key] = { text: value };
    } else {
      container.descr = { text: descr };
    }
  }
  if (typeof sprite === "object") {
    let [key, value] = Object.entries(sprite)[0];
    container[key] = value;
  } else {
    container.sprite = sprite;
  }
  if (typeof tags === "object") {
    let [key, value] = Object.entries(tags)[0];
    container[key] = value;
  } else {
    container.tags = tags;
  }
  if (typeof link === "object") {
    let [key, value] = Object.entries(link)[0];
    container[key] = value;
  } else {
    container.link = link;
  }
  container.wrap = autoWrap();
  container.typeC4Shape = { text: typeC4Shape };
  container.parentBoundary = currentBoundaryParse;
}, "addContainer");
var addComponent = /* @__PURE__ */ __name(function(typeC4Shape, alias, label, techn, descr, sprite, tags, link) {
  if (alias === null || label === null) {
    return;
  }
  let component = {};
  const old = c4ShapeArray.find((component2) => component2.alias === alias);
  if (old && alias === old.alias) {
    component = old;
  } else {
    component.alias = alias;
    c4ShapeArray.push(component);
  }
  if (label === undefined || label === null) {
    component.label = { text: "" };
  } else {
    component.label = { text: label };
  }
  if (techn === undefined || techn === null) {
    component.techn = { text: "" };
  } else {
    if (typeof techn === "object") {
      let [key, value] = Object.entries(techn)[0];
      component[key] = { text: value };
    } else {
      component.techn = { text: techn };
    }
  }
  if (descr === undefined || descr === null) {
    component.descr = { text: "" };
  } else {
    if (typeof descr === "object") {
      let [key, value] = Object.entries(descr)[0];
      component[key] = { text: value };
    } else {
      component.descr = { text: descr };
    }
  }
  if (typeof sprite === "object") {
    let [key, value] = Object.entries(sprite)[0];
    component[key] = value;
  } else {
    component.sprite = sprite;
  }
  if (typeof tags === "object") {
    let [key, value] = Object.entries(tags)[0];
    component[key] = value;
  } else {
    component.tags = tags;
  }
  if (typeof link === "object") {
    let [key, value] = Object.entries(link)[0];
    component[key] = value;
  } else {
    component.link = link;
  }
  component.wrap = autoWrap();
  component.typeC4Shape = { text: typeC4Shape };
  component.parentBoundary = currentBoundaryParse;
}, "addComponent");
var addPersonOrSystemBoundary = /* @__PURE__ */ __name(function(alias, label, type, tags, link) {
  if (alias === null || label === null) {
    return;
  }
  let boundary = {};
  const old = boundaries.find((boundary2) => boundary2.alias === alias);
  if (old && alias === old.alias) {
    boundary = old;
  } else {
    boundary.alias = alias;
    boundaries.push(boundary);
  }
  if (label === undefined || label === null) {
    boundary.label = { text: "" };
  } else {
    boundary.label = { text: label };
  }
  if (type === undefined || type === null) {
    boundary.type = { text: "system" };
  } else {
    if (typeof type === "object") {
      let [key, value] = Object.entries(type)[0];
      boundary[key] = { text: value };
    } else {
      boundary.type = { text: type };
    }
  }
  if (typeof tags === "object") {
    let [key, value] = Object.entries(tags)[0];
    boundary[key] = value;
  } else {
    boundary.tags = tags;
  }
  if (typeof link === "object") {
    let [key, value] = Object.entries(link)[0];
    boundary[key] = value;
  } else {
    boundary.link = link;
  }
  boundary.parentBoundary = currentBoundaryParse;
  boundary.wrap = autoWrap();
  parentBoundaryParse = currentBoundaryParse;
  currentBoundaryParse = alias;
  boundaryParseStack.push(parentBoundaryParse);
}, "addPersonOrSystemBoundary");
var addContainerBoundary = /* @__PURE__ */ __name(function(alias, label, type, tags, link) {
  if (alias === null || label === null) {
    return;
  }
  let boundary = {};
  const old = boundaries.find((boundary2) => boundary2.alias === alias);
  if (old && alias === old.alias) {
    boundary = old;
  } else {
    boundary.alias = alias;
    boundaries.push(boundary);
  }
  if (label === undefined || label === null) {
    boundary.label = { text: "" };
  } else {
    boundary.label = { text: label };
  }
  if (type === undefined || type === null) {
    boundary.type = { text: "container" };
  } else {
    if (typeof type === "object") {
      let [key, value] = Object.entries(type)[0];
      boundary[key] = { text: value };
    } else {
      boundary.type = { text: type };
    }
  }
  if (typeof tags === "object") {
    let [key, value] = Object.entries(tags)[0];
    boundary[key] = value;
  } else {
    boundary.tags = tags;
  }
  if (typeof link === "object") {
    let [key, value] = Object.entries(link)[0];
    boundary[key] = value;
  } else {
    boundary.link = link;
  }
  boundary.parentBoundary = currentBoundaryParse;
  boundary.wrap = autoWrap();
  parentBoundaryParse = currentBoundaryParse;
  currentBoundaryParse = alias;
  boundaryParseStack.push(parentBoundaryParse);
}, "addContainerBoundary");
var addDeploymentNode = /* @__PURE__ */ __name(function(nodeType, alias, label, type, descr, sprite, tags, link) {
  if (alias === null || label === null) {
    return;
  }
  let boundary = {};
  const old = boundaries.find((boundary2) => boundary2.alias === alias);
  if (old && alias === old.alias) {
    boundary = old;
  } else {
    boundary.alias = alias;
    boundaries.push(boundary);
  }
  if (label === undefined || label === null) {
    boundary.label = { text: "" };
  } else {
    boundary.label = { text: label };
  }
  if (type === undefined || type === null) {
    boundary.type = { text: "node" };
  } else {
    if (typeof type === "object") {
      let [key, value] = Object.entries(type)[0];
      boundary[key] = { text: value };
    } else {
      boundary.type = { text: type };
    }
  }
  if (descr === undefined || descr === null) {
    boundary.descr = { text: "" };
  } else {
    if (typeof descr === "object") {
      let [key, value] = Object.entries(descr)[0];
      boundary[key] = { text: value };
    } else {
      boundary.descr = { text: descr };
    }
  }
  if (typeof tags === "object") {
    let [key, value] = Object.entries(tags)[0];
    boundary[key] = value;
  } else {
    boundary.tags = tags;
  }
  if (typeof link === "object") {
    let [key, value] = Object.entries(link)[0];
    boundary[key] = value;
  } else {
    boundary.link = link;
  }
  boundary.nodeType = nodeType;
  boundary.parentBoundary = currentBoundaryParse;
  boundary.wrap = autoWrap();
  parentBoundaryParse = currentBoundaryParse;
  currentBoundaryParse = alias;
  boundaryParseStack.push(parentBoundaryParse);
}, "addDeploymentNode");
var popBoundaryParseStack = /* @__PURE__ */ __name(function() {
  currentBoundaryParse = parentBoundaryParse;
  boundaryParseStack.pop();
  parentBoundaryParse = boundaryParseStack.pop();
  boundaryParseStack.push(parentBoundaryParse);
}, "popBoundaryParseStack");
var updateElStyle = /* @__PURE__ */ __name(function(typeC4Shape, elementName, bgColor, fontColor, borderColor, shadowing, shape, sprite, techn, legendText, legendSprite) {
  let old = c4ShapeArray.find((element) => element.alias === elementName);
  if (old === undefined) {
    old = boundaries.find((element) => element.alias === elementName);
    if (old === undefined) {
      return;
    }
  }
  if (bgColor !== undefined && bgColor !== null) {
    if (typeof bgColor === "object") {
      let [key, value] = Object.entries(bgColor)[0];
      old[key] = value;
    } else {
      old.bgColor = bgColor;
    }
  }
  if (fontColor !== undefined && fontColor !== null) {
    if (typeof fontColor === "object") {
      let [key, value] = Object.entries(fontColor)[0];
      old[key] = value;
    } else {
      old.fontColor = fontColor;
    }
  }
  if (borderColor !== undefined && borderColor !== null) {
    if (typeof borderColor === "object") {
      let [key, value] = Object.entries(borderColor)[0];
      old[key] = value;
    } else {
      old.borderColor = borderColor;
    }
  }
  if (shadowing !== undefined && shadowing !== null) {
    if (typeof shadowing === "object") {
      let [key, value] = Object.entries(shadowing)[0];
      old[key] = value;
    } else {
      old.shadowing = shadowing;
    }
  }
  if (shape !== undefined && shape !== null) {
    if (typeof shape === "object") {
      let [key, value] = Object.entries(shape)[0];
      old[key] = value;
    } else {
      old.shape = shape;
    }
  }
  if (sprite !== undefined && sprite !== null) {
    if (typeof sprite === "object") {
      let [key, value] = Object.entries(sprite)[0];
      old[key] = value;
    } else {
      old.sprite = sprite;
    }
  }
  if (techn !== undefined && techn !== null) {
    if (typeof techn === "object") {
      let [key, value] = Object.entries(techn)[0];
      old[key] = value;
    } else {
      old.techn = techn;
    }
  }
  if (legendText !== undefined && legendText !== null) {
    if (typeof legendText === "object") {
      let [key, value] = Object.entries(legendText)[0];
      old[key] = value;
    } else {
      old.legendText = legendText;
    }
  }
  if (legendSprite !== undefined && legendSprite !== null) {
    if (typeof legendSprite === "object") {
      let [key, value] = Object.entries(legendSprite)[0];
      old[key] = value;
    } else {
      old.legendSprite = legendSprite;
    }
  }
}, "updateElStyle");
var updateRelStyle = /* @__PURE__ */ __name(function(typeC4Shape, from, to, textColor, lineColor, offsetX, offsetY) {
  const old = rels.find((rel) => rel.from === from && rel.to === to);
  if (old === undefined) {
    return;
  }
  if (textColor !== undefined && textColor !== null) {
    if (typeof textColor === "object") {
      let [key, value] = Object.entries(textColor)[0];
      old[key] = value;
    } else {
      old.textColor = textColor;
    }
  }
  if (lineColor !== undefined && lineColor !== null) {
    if (typeof lineColor === "object") {
      let [key, value] = Object.entries(lineColor)[0];
      old[key] = value;
    } else {
      old.lineColor = lineColor;
    }
  }
  if (offsetX !== undefined && offsetX !== null) {
    if (typeof offsetX === "object") {
      let [key, value] = Object.entries(offsetX)[0];
      old[key] = parseInt(value);
    } else {
      old.offsetX = parseInt(offsetX);
    }
  }
  if (offsetY !== undefined && offsetY !== null) {
    if (typeof offsetY === "object") {
      let [key, value] = Object.entries(offsetY)[0];
      old[key] = parseInt(value);
    } else {
      old.offsetY = parseInt(offsetY);
    }
  }
}, "updateRelStyle");
var updateLayoutConfig = /* @__PURE__ */ __name(function(typeC4Shape, c4ShapeInRowParam, c4BoundaryInRowParam) {
  let c4ShapeInRowValue = c4ShapeInRow;
  let c4BoundaryInRowValue = c4BoundaryInRow;
  if (typeof c4ShapeInRowParam === "object") {
    const value = Object.values(c4ShapeInRowParam)[0];
    c4ShapeInRowValue = parseInt(value);
  } else {
    c4ShapeInRowValue = parseInt(c4ShapeInRowParam);
  }
  if (typeof c4BoundaryInRowParam === "object") {
    const value = Object.values(c4BoundaryInRowParam)[0];
    c4BoundaryInRowValue = parseInt(value);
  } else {
    c4BoundaryInRowValue = parseInt(c4BoundaryInRowParam);
  }
  if (c4ShapeInRowValue >= 1) {
    c4ShapeInRow = c4ShapeInRowValue;
  }
  if (c4BoundaryInRowValue >= 1) {
    c4BoundaryInRow = c4BoundaryInRowValue;
  }
}, "updateLayoutConfig");
var getC4ShapeInRow = /* @__PURE__ */ __name(function() {
  return c4ShapeInRow;
}, "getC4ShapeInRow");
var getC4BoundaryInRow = /* @__PURE__ */ __name(function() {
  return c4BoundaryInRow;
}, "getC4BoundaryInRow");
var getCurrentBoundaryParse = /* @__PURE__ */ __name(function() {
  return currentBoundaryParse;
}, "getCurrentBoundaryParse");
var getParentBoundaryParse = /* @__PURE__ */ __name(function() {
  return parentBoundaryParse;
}, "getParentBoundaryParse");
var getC4ShapeArray = /* @__PURE__ */ __name(function(parentBoundary) {
  if (parentBoundary === undefined || parentBoundary === null) {
    return c4ShapeArray;
  } else {
    return c4ShapeArray.filter((personOrSystem) => {
      return personOrSystem.parentBoundary === parentBoundary;
    });
  }
}, "getC4ShapeArray");
var getC4Shape = /* @__PURE__ */ __name(function(alias) {
  return c4ShapeArray.find((personOrSystem) => personOrSystem.alias === alias);
}, "getC4Shape");
var getC4ShapeKeys = /* @__PURE__ */ __name(function(parentBoundary) {
  return Object.keys(getC4ShapeArray(parentBoundary));
}, "getC4ShapeKeys");
var getBoundaries = /* @__PURE__ */ __name(function(parentBoundary) {
  if (parentBoundary === undefined || parentBoundary === null) {
    return boundaries;
  } else {
    return boundaries.filter((boundary) => boundary.parentBoundary === parentBoundary);
  }
}, "getBoundaries");
var getBoundarys = getBoundaries;
var getRels = /* @__PURE__ */ __name(function() {
  return rels;
}, "getRels");
var getTitle = /* @__PURE__ */ __name(function() {
  return title;
}, "getTitle");
var setWrap = /* @__PURE__ */ __name(function(wrapSetting) {
  wrapEnabled = wrapSetting;
}, "setWrap");
var autoWrap = /* @__PURE__ */ __name(function() {
  return wrapEnabled;
}, "autoWrap");
var clear = /* @__PURE__ */ __name(function() {
  c4ShapeArray = [];
  boundaries = [
    {
      alias: "global",
      label: { text: "global" },
      type: { text: "global" },
      tags: null,
      link: null,
      parentBoundary: ""
    }
  ];
  parentBoundaryParse = "";
  currentBoundaryParse = "global";
  boundaryParseStack = [""];
  rels = [];
  boundaryParseStack = [""];
  title = "";
  wrapEnabled = false;
  c4ShapeInRow = 4;
  c4BoundaryInRow = 2;
}, "clear");
var LINETYPE = {
  SOLID: 0,
  DOTTED: 1,
  NOTE: 2,
  SOLID_CROSS: 3,
  DOTTED_CROSS: 4,
  SOLID_OPEN: 5,
  DOTTED_OPEN: 6,
  LOOP_START: 10,
  LOOP_END: 11,
  ALT_START: 12,
  ALT_ELSE: 13,
  ALT_END: 14,
  OPT_START: 15,
  OPT_END: 16,
  ACTIVE_START: 17,
  ACTIVE_END: 18,
  PAR_START: 19,
  PAR_AND: 20,
  PAR_END: 21,
  RECT_START: 22,
  RECT_END: 23,
  SOLID_POINT: 24,
  DOTTED_POINT: 25
};
var ARROWTYPE = {
  FILLED: 0,
  OPEN: 1
};
var PLACEMENT = {
  LEFTOF: 0,
  RIGHTOF: 1,
  OVER: 2
};
var setTitle = /* @__PURE__ */ __name(function(txt) {
  let sanitizedText = sanitizeText(txt, getConfig2());
  title = sanitizedText;
}, "setTitle");
var c4Db_default = {
  addPersonOrSystem,
  addPersonOrSystemBoundary,
  addContainer,
  addContainerBoundary,
  addComponent,
  addDeploymentNode,
  popBoundaryParseStack,
  addRel,
  updateElStyle,
  updateRelStyle,
  updateLayoutConfig,
  autoWrap,
  setWrap,
  getC4ShapeArray,
  getC4Shape,
  getC4ShapeKeys,
  getBoundaries,
  getBoundarys,
  getCurrentBoundaryParse,
  getParentBoundaryParse,
  getRels,
  getTitle,
  getC4Type,
  getC4ShapeInRow,
  getC4BoundaryInRow,
  setAccTitle,
  getAccTitle,
  getAccDescription,
  setAccDescription,
  getConfig: /* @__PURE__ */ __name(() => getConfig2().c4, "getConfig"),
  clear,
  LINETYPE,
  ARROWTYPE,
  PLACEMENT,
  setTitle,
  setC4Type
};
var drawRect2 = /* @__PURE__ */ __name(function(elem, rectData) {
  return drawRect(elem, rectData);
}, "drawRect");
var drawImage = /* @__PURE__ */ __name(function(elem, width, height, x, y, link) {
  const imageElem = elem.append("image");
  imageElem.attr("width", width);
  imageElem.attr("height", height);
  imageElem.attr("x", x);
  imageElem.attr("y", y);
  let sanitizedLink = link.startsWith("data:image/png;base64") ? link : import_sanitize_url.sanitizeUrl(link);
  imageElem.attr("xlink:href", sanitizedLink);
}, "drawImage");
var drawRels = /* @__PURE__ */ __name((elem, rels2, conf2, diagramId) => {
  const relsElem = elem.append("g");
  let i = 0;
  for (let rel of rels2) {
    let textColor = rel.textColor ? rel.textColor : "#444444";
    let strokeColor = rel.lineColor ? rel.lineColor : "#444444";
    let offsetX = rel.offsetX ? parseInt(rel.offsetX) : 0;
    let offsetY = rel.offsetY ? parseInt(rel.offsetY) : 0;
    let url = "";
    if (i === 0) {
      let line = relsElem.append("line");
      line.attr("x1", rel.startPoint.x);
      line.attr("y1", rel.startPoint.y);
      line.attr("x2", rel.endPoint.x);
      line.attr("y2", rel.endPoint.y);
      line.attr("stroke-width", "1");
      line.attr("stroke", strokeColor);
      line.style("fill", "none");
      if (rel.type !== "rel_b") {
        line.attr("marker-end", "url(" + url + "#" + diagramId + "-arrowhead)");
      }
      if (rel.type === "birel" || rel.type === "rel_b") {
        line.attr("marker-start", "url(" + url + "#" + diagramId + "-arrowend)");
      }
      i = -1;
    } else {
      let line = relsElem.append("path");
      line.attr("fill", "none").attr("stroke-width", "1").attr("stroke", strokeColor).attr("d", "Mstartx,starty Qcontrolx,controly stopx,stopy ".replaceAll("startx", rel.startPoint.x).replaceAll("starty", rel.startPoint.y).replaceAll("controlx", rel.startPoint.x + (rel.endPoint.x - rel.startPoint.x) / 2 - (rel.endPoint.x - rel.startPoint.x) / 4).replaceAll("controly", rel.startPoint.y + (rel.endPoint.y - rel.startPoint.y) / 2).replaceAll("stopx", rel.endPoint.x).replaceAll("stopy", rel.endPoint.y));
      if (rel.type !== "rel_b") {
        line.attr("marker-end", "url(" + url + "#" + diagramId + "-arrowhead)");
      }
      if (rel.type === "birel" || rel.type === "rel_b") {
        line.attr("marker-start", "url(" + url + "#" + diagramId + "-arrowend)");
      }
    }
    let messageConf = conf2.messageFont();
    _drawTextCandidateFunc(conf2)(rel.label.text, relsElem, Math.min(rel.startPoint.x, rel.endPoint.x) + Math.abs(rel.endPoint.x - rel.startPoint.x) / 2 + offsetX, Math.min(rel.startPoint.y, rel.endPoint.y) + Math.abs(rel.endPoint.y - rel.startPoint.y) / 2 + offsetY, rel.label.width, rel.label.height, { fill: textColor }, messageConf);
    if (rel.techn && rel.techn.text !== "") {
      messageConf = conf2.messageFont();
      _drawTextCandidateFunc(conf2)("[" + rel.techn.text + "]", relsElem, Math.min(rel.startPoint.x, rel.endPoint.x) + Math.abs(rel.endPoint.x - rel.startPoint.x) / 2 + offsetX, Math.min(rel.startPoint.y, rel.endPoint.y) + Math.abs(rel.endPoint.y - rel.startPoint.y) / 2 + conf2.messageFontSize + 5 + offsetY, Math.max(rel.label.width, rel.techn.width), rel.techn.height, { fill: textColor, "font-style": "italic" }, messageConf);
    }
  }
}, "drawRels");
var drawBoundary = /* @__PURE__ */ __name(function(elem, boundary, conf2) {
  const boundaryElem = elem.append("g");
  let fillColor = boundary.bgColor ? boundary.bgColor : "none";
  let strokeColor = boundary.borderColor ? boundary.borderColor : "#444444";
  let fontColor = boundary.fontColor ? boundary.fontColor : "black";
  let attrsValue = { "stroke-width": 1, "stroke-dasharray": "7.0,7.0" };
  if (boundary.nodeType) {
    attrsValue = { "stroke-width": 1 };
  }
  let rectData = {
    x: boundary.x,
    y: boundary.y,
    fill: fillColor,
    stroke: strokeColor,
    width: boundary.width,
    height: boundary.height,
    rx: 2.5,
    ry: 2.5,
    attrs: attrsValue
  };
  drawRect2(boundaryElem, rectData);
  let boundaryConf = conf2.boundaryFont();
  boundaryConf.fontWeight = "bold";
  boundaryConf.fontSize = boundaryConf.fontSize + 2;
  boundaryConf.fontColor = fontColor;
  _drawTextCandidateFunc(conf2)(boundary.label.text, boundaryElem, boundary.x, boundary.y + boundary.label.Y, boundary.width, boundary.height, { fill: "#444444" }, boundaryConf);
  if (boundary.type && boundary.type.text !== "") {
    boundaryConf = conf2.boundaryFont();
    boundaryConf.fontColor = fontColor;
    _drawTextCandidateFunc(conf2)(boundary.type.text, boundaryElem, boundary.x, boundary.y + boundary.type.Y, boundary.width, boundary.height, { fill: "#444444" }, boundaryConf);
  }
  if (boundary.descr && boundary.descr.text !== "") {
    boundaryConf = conf2.boundaryFont();
    boundaryConf.fontSize = boundaryConf.fontSize - 2;
    boundaryConf.fontColor = fontColor;
    _drawTextCandidateFunc(conf2)(boundary.descr.text, boundaryElem, boundary.x, boundary.y + boundary.descr.Y, boundary.width, boundary.height, { fill: "#444444" }, boundaryConf);
  }
}, "drawBoundary");
var drawC4Shape = /* @__PURE__ */ __name(function(elem, c4Shape, conf2) {
  let fillColor = c4Shape.bgColor ? c4Shape.bgColor : conf2[c4Shape.typeC4Shape.text + "_bg_color"];
  let strokeColor = c4Shape.borderColor ? c4Shape.borderColor : conf2[c4Shape.typeC4Shape.text + "_border_color"];
  let fontColor = c4Shape.fontColor ? c4Shape.fontColor : "#FFFFFF";
  let personImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAIAAADYYG7QAAACD0lEQVR4Xu2YoU4EMRCGT+4j8Ai8AhaH4QHgAUjQuFMECUgMIUgwJAgMhgQsAYUiJCiQIBBY+EITsjfTdme6V24v4c8vyGbb+ZjOtN0bNcvjQXmkH83WvYBWto6PLm6v7p7uH1/w2fXD+PBycX1Pv2l3IdDm/vn7x+dXQiAubRzoURa7gRZWd0iGRIiJbOnhnfYBQZNJjNbuyY2eJG8fkDE3bbG4ep6MHUAsgYxmE3nVs6VsBWJSGccsOlFPmLIViMzLOB7pCVO2AtHJMohH7Fh6zqitQK7m0rJvAVYgGcEpe//PLdDz65sM4pF9N7ICcXDKIB5Nv6j7tD0NoSdM2QrU9Gg0ewE1LqBhHR3BBdvj2vapnidjHxD/q6vd7Pvhr31AwcY8eXMTXAKECZZJFXuEq27aLgQK5uLMohCenGGuGewOxSjBvYBqeG6B+Nqiblggdjnc+ZXDy+FNFpFzw76O3UBAROuXh6FoiAcf5g9eTvUgzy0nWg6I8cXHRUpg5bOVBCo+KDpFajOf23GgPme7RSQ+lacIENUgJ6gg1k6HjgOlqnLqip4tEuhv0hNEMXUD0clyXE3p6pZA0S2nnvTlXwLJEZWlb7cTQH1+USgTN4VhAenm/wea1OCAOmqo6fE1WCb9WSKBah+rbUWPWAmE2Rvk0ApiB45eOyNAzU8xcTvj8KvkKEoOaIYeHNA3ZuygAvFMUO0AAAAASUVORK5CYII=";
  switch (c4Shape.typeC4Shape.text) {
    case "person":
      personImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAIAAADYYG7QAAACD0lEQVR4Xu2YoU4EMRCGT+4j8Ai8AhaH4QHgAUjQuFMECUgMIUgwJAgMhgQsAYUiJCiQIBBY+EITsjfTdme6V24v4c8vyGbb+ZjOtN0bNcvjQXmkH83WvYBWto6PLm6v7p7uH1/w2fXD+PBycX1Pv2l3IdDm/vn7x+dXQiAubRzoURa7gRZWd0iGRIiJbOnhnfYBQZNJjNbuyY2eJG8fkDE3bbG4ep6MHUAsgYxmE3nVs6VsBWJSGccsOlFPmLIViMzLOB7pCVO2AtHJMohH7Fh6zqitQK7m0rJvAVYgGcEpe//PLdDz65sM4pF9N7ICcXDKIB5Nv6j7tD0NoSdM2QrU9Gg0ewE1LqBhHR3BBdvj2vapnidjHxD/q6vd7Pvhr31AwcY8eXMTXAKECZZJFXuEq27aLgQK5uLMohCenGGuGewOxSjBvYBqeG6B+Nqiblggdjnc+ZXDy+FNFpFzw76O3UBAROuXh6FoiAcf5g9eTvUgzy0nWg6I8cXHRUpg5bOVBCo+KDpFajOf23GgPme7RSQ+lacIENUgJ6gg1k6HjgOlqnLqip4tEuhv0hNEMXUD0clyXE3p6pZA0S2nnvTlXwLJEZWlb7cTQH1+USgTN4VhAenm/wea1OCAOmqo6fE1WCb9WSKBah+rbUWPWAmE2Rvk0ApiB45eOyNAzU8xcTvj8KvkKEoOaIYeHNA3ZuygAvFMUO0AAAAASUVORK5CYII=";
      break;
    case "external_person":
      personImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAIAAADYYG7QAAAB6ElEQVR4Xu2YLY+EMBCG9+dWr0aj0Wg0Go1Go0+j8Xdv2uTCvv1gpt0ebHKPuhDaeW4605Z9mJvx4AdXUyTUdd08z+u6flmWZRnHsWkafk9DptAwDPu+f0eAYtu2PEaGWuj5fCIZrBAC2eLBAnRCsEkkxmeaJp7iDJ2QMDdHsLg8SxKFEJaAo8lAXnmuOFIhTMpxxKATebo4UiFknuNo4OniSIXQyRxEA3YsnjGCVEjVXD7yLUAqxBGUyPv/Y4W2beMgGuS7kVQIBycH0fD+oi5pezQETxdHKmQKGk1eQEYldK+jw5GxPfZ9z7Mk0Qnhf1W1m3w//EUn5BDmSZsbR44QQLBEqrBHqOrmSKaQAxdnLArCrxZcM7A7ZKs4ioRq8LFC+NpC3WCBJsvpVw5edm9iEXFuyNfxXAgSwfrFQ1c0iNda8AdejvUgnktOtJQQxmcfFzGglc5WVCj7oDgFqU18boeFSs52CUh8LE8BIVQDT1ABrB0HtgSEYlX5doJnCwv9TXocKCaKbnwhdDKPq4lf3SwU3HLq4V/+WYhHVMa/3b4IlfyikAduCkcBc7mQ3/z/Qq/cTuikhkzB12Ae/mcJC9U+Vo8Ej1gWAtgbeGgFsAMHr50BIWOLCbezvhpBFUdY6EJuJ/QDW0XoMX60zZ0AAAAASUVORK5CYII=";
      break;
  }
  const c4ShapeElem = elem.append("g");
  c4ShapeElem.attr("class", "person-man");
  const rect = getNoteRect();
  switch (c4Shape.typeC4Shape.text) {
    case "person":
    case "external_person":
    case "system":
    case "external_system":
    case "container":
    case "external_container":
    case "component":
    case "external_component":
      rect.x = c4Shape.x;
      rect.y = c4Shape.y;
      rect.fill = fillColor;
      rect.width = c4Shape.width;
      rect.height = c4Shape.height;
      rect.stroke = strokeColor;
      rect.rx = 2.5;
      rect.ry = 2.5;
      rect.attrs = { "stroke-width": 0.5 };
      drawRect2(c4ShapeElem, rect);
      break;
    case "system_db":
    case "external_system_db":
    case "container_db":
    case "external_container_db":
    case "component_db":
    case "external_component_db":
      c4ShapeElem.append("path").attr("fill", fillColor).attr("stroke-width", "0.5").attr("stroke", strokeColor).attr("d", "Mstartx,startyc0,-10 half,-10 half,-10c0,0 half,0 half,10l0,heightc0,10 -half,10 -half,10c0,0 -half,0 -half,-10l0,-height".replaceAll("startx", c4Shape.x).replaceAll("starty", c4Shape.y).replaceAll("half", c4Shape.width / 2).replaceAll("height", c4Shape.height));
      c4ShapeElem.append("path").attr("fill", "none").attr("stroke-width", "0.5").attr("stroke", strokeColor).attr("d", "Mstartx,startyc0,10 half,10 half,10c0,0 half,0 half,-10".replaceAll("startx", c4Shape.x).replaceAll("starty", c4Shape.y).replaceAll("half", c4Shape.width / 2));
      break;
    case "system_queue":
    case "external_system_queue":
    case "container_queue":
    case "external_container_queue":
    case "component_queue":
    case "external_component_queue":
      c4ShapeElem.append("path").attr("fill", fillColor).attr("stroke-width", "0.5").attr("stroke", strokeColor).attr("d", "Mstartx,startylwidth,0c5,0 5,half 5,halfc0,0 0,half -5,halfl-width,0c-5,0 -5,-half -5,-halfc0,0 0,-half 5,-half".replaceAll("startx", c4Shape.x).replaceAll("starty", c4Shape.y).replaceAll("width", c4Shape.width).replaceAll("half", c4Shape.height / 2));
      c4ShapeElem.append("path").attr("fill", "none").attr("stroke-width", "0.5").attr("stroke", strokeColor).attr("d", "Mstartx,startyc-5,0 -5,half -5,halfc0,half 5,half 5,half".replaceAll("startx", c4Shape.x + c4Shape.width).replaceAll("starty", c4Shape.y).replaceAll("half", c4Shape.height / 2));
      break;
  }
  let c4ShapeFontConf = getC4ShapeFont(conf2, c4Shape.typeC4Shape.text);
  c4ShapeElem.append("text").attr("fill", fontColor).attr("font-family", c4ShapeFontConf.fontFamily).attr("font-size", c4ShapeFontConf.fontSize - 2).attr("font-style", "italic").attr("lengthAdjust", "spacing").attr("textLength", c4Shape.typeC4Shape.width).attr("x", c4Shape.x + c4Shape.width / 2 - c4Shape.typeC4Shape.width / 2).attr("y", c4Shape.y + c4Shape.typeC4Shape.Y).text("<<" + c4Shape.typeC4Shape.text + ">>");
  switch (c4Shape.typeC4Shape.text) {
    case "person":
    case "external_person":
      drawImage(c4ShapeElem, 48, 48, c4Shape.x + c4Shape.width / 2 - 24, c4Shape.y + c4Shape.image.Y, personImg);
      break;
  }
  let textFontConf = conf2[c4Shape.typeC4Shape.text + "Font"]();
  textFontConf.fontWeight = "bold";
  textFontConf.fontSize = textFontConf.fontSize + 2;
  textFontConf.fontColor = fontColor;
  _drawTextCandidateFunc(conf2)(c4Shape.label.text, c4ShapeElem, c4Shape.x, c4Shape.y + c4Shape.label.Y, c4Shape.width, c4Shape.height, { fill: fontColor }, textFontConf);
  textFontConf = conf2[c4Shape.typeC4Shape.text + "Font"]();
  textFontConf.fontColor = fontColor;
  if (c4Shape.techn && c4Shape.techn?.text !== "") {
    _drawTextCandidateFunc(conf2)(c4Shape.techn.text, c4ShapeElem, c4Shape.x, c4Shape.y + c4Shape.techn.Y, c4Shape.width, c4Shape.height, { fill: fontColor, "font-style": "italic" }, textFontConf);
  } else if (c4Shape.type && c4Shape.type.text !== "") {
    _drawTextCandidateFunc(conf2)(c4Shape.type.text, c4ShapeElem, c4Shape.x, c4Shape.y + c4Shape.type.Y, c4Shape.width, c4Shape.height, { fill: fontColor, "font-style": "italic" }, textFontConf);
  }
  if (c4Shape.descr && c4Shape.descr.text !== "") {
    textFontConf = conf2.personFont();
    textFontConf.fontColor = fontColor;
    _drawTextCandidateFunc(conf2)(c4Shape.descr.text, c4ShapeElem, c4Shape.x, c4Shape.y + c4Shape.descr.Y, c4Shape.width, c4Shape.height, { fill: fontColor }, textFontConf);
  }
  return c4Shape.height;
}, "drawC4Shape");
var insertDatabaseIcon = /* @__PURE__ */ __name(function(elem, id) {
  elem.append("defs").append("symbol").attr("id", id + "-database").attr("fill-rule", "evenodd").attr("clip-rule", "evenodd").append("path").attr("transform", "scale(.5)").attr("d", "M12.258.001l.256.004.255.005.253.008.251.01.249.012.247.015.246.016.242.019.241.02.239.023.236.024.233.027.231.028.229.031.225.032.223.034.22.036.217.038.214.04.211.041.208.043.205.045.201.046.198.048.194.05.191.051.187.053.183.054.18.056.175.057.172.059.168.06.163.061.16.063.155.064.15.066.074.033.073.033.071.034.07.034.069.035.068.035.067.035.066.035.064.036.064.036.062.036.06.036.06.037.058.037.058.037.055.038.055.038.053.038.052.038.051.039.05.039.048.039.047.039.045.04.044.04.043.04.041.04.04.041.039.041.037.041.036.041.034.041.033.042.032.042.03.042.029.042.027.042.026.043.024.043.023.043.021.043.02.043.018.044.017.043.015.044.013.044.012.044.011.045.009.044.007.045.006.045.004.045.002.045.001.045v17l-.001.045-.002.045-.004.045-.006.045-.007.045-.009.044-.011.045-.012.044-.013.044-.015.044-.017.043-.018.044-.02.043-.021.043-.023.043-.024.043-.026.043-.027.042-.029.042-.03.042-.032.042-.033.042-.034.041-.036.041-.037.041-.039.041-.04.041-.041.04-.043.04-.044.04-.045.04-.047.039-.048.039-.05.039-.051.039-.052.038-.053.038-.055.038-.055.038-.058.037-.058.037-.06.037-.06.036-.062.036-.064.036-.064.036-.066.035-.067.035-.068.035-.069.035-.07.034-.071.034-.073.033-.074.033-.15.066-.155.064-.16.063-.163.061-.168.06-.172.059-.175.057-.18.056-.183.054-.187.053-.191.051-.194.05-.198.048-.201.046-.205.045-.208.043-.211.041-.214.04-.217.038-.22.036-.223.034-.225.032-.229.031-.231.028-.233.027-.236.024-.239.023-.241.02-.242.019-.246.016-.247.015-.249.012-.251.01-.253.008-.255.005-.256.004-.258.001-.258-.001-.256-.004-.255-.005-.253-.008-.251-.01-.249-.012-.247-.015-.245-.016-.243-.019-.241-.02-.238-.023-.236-.024-.234-.027-.231-.028-.228-.031-.226-.032-.223-.034-.22-.036-.217-.038-.214-.04-.211-.041-.208-.043-.204-.045-.201-.046-.198-.048-.195-.05-.19-.051-.187-.053-.184-.054-.179-.056-.176-.057-.172-.059-.167-.06-.164-.061-.159-.063-.155-.064-.151-.066-.074-.033-.072-.033-.072-.034-.07-.034-.069-.035-.068-.035-.067-.035-.066-.035-.064-.036-.063-.036-.062-.036-.061-.036-.06-.037-.058-.037-.057-.037-.056-.038-.055-.038-.053-.038-.052-.038-.051-.039-.049-.039-.049-.039-.046-.039-.046-.04-.044-.04-.043-.04-.041-.04-.04-.041-.039-.041-.037-.041-.036-.041-.034-.041-.033-.042-.032-.042-.03-.042-.029-.042-.027-.042-.026-.043-.024-.043-.023-.043-.021-.043-.02-.043-.018-.044-.017-.043-.015-.044-.013-.044-.012-.044-.011-.045-.009-.044-.007-.045-.006-.045-.004-.045-.002-.045-.001-.045v-17l.001-.045.002-.045.004-.045.006-.045.007-.045.009-.044.011-.045.012-.044.013-.044.015-.044.017-.043.018-.044.02-.043.021-.043.023-.043.024-.043.026-.043.027-.042.029-.042.03-.042.032-.042.033-.042.034-.041.036-.041.037-.041.039-.041.04-.041.041-.04.043-.04.044-.04.046-.04.046-.039.049-.039.049-.039.051-.039.052-.038.053-.038.055-.038.056-.038.057-.037.058-.037.06-.037.061-.036.062-.036.063-.036.064-.036.066-.035.067-.035.068-.035.069-.035.07-.034.072-.034.072-.033.074-.033.151-.066.155-.064.159-.063.164-.061.167-.06.172-.059.176-.057.179-.056.184-.054.187-.053.19-.051.195-.05.198-.048.201-.046.204-.045.208-.043.211-.041.214-.04.217-.038.22-.036.223-.034.226-.032.228-.031.231-.028.234-.027.236-.024.238-.023.241-.02.243-.019.245-.016.247-.015.249-.012.251-.01.253-.008.255-.005.256-.004.258-.001.258.001zm-9.258 20.499v.01l.001.021.003.021.004.022.005.021.006.022.007.022.009.023.01.022.011.023.012.023.013.023.015.023.016.024.017.023.018.024.019.024.021.024.022.025.023.024.024.025.052.049.056.05.061.051.066.051.07.051.075.051.079.052.084.052.088.052.092.052.097.052.102.051.105.052.11.052.114.051.119.051.123.051.127.05.131.05.135.05.139.048.144.049.147.047.152.047.155.047.16.045.163.045.167.043.171.043.176.041.178.041.183.039.187.039.19.037.194.035.197.035.202.033.204.031.209.03.212.029.216.027.219.025.222.024.226.021.23.02.233.018.236.016.24.015.243.012.246.01.249.008.253.005.256.004.259.001.26-.001.257-.004.254-.005.25-.008.247-.011.244-.012.241-.014.237-.016.233-.018.231-.021.226-.021.224-.024.22-.026.216-.027.212-.028.21-.031.205-.031.202-.034.198-.034.194-.036.191-.037.187-.039.183-.04.179-.04.175-.042.172-.043.168-.044.163-.045.16-.046.155-.046.152-.047.148-.048.143-.049.139-.049.136-.05.131-.05.126-.05.123-.051.118-.052.114-.051.11-.052.106-.052.101-.052.096-.052.092-.052.088-.053.083-.051.079-.052.074-.052.07-.051.065-.051.06-.051.056-.05.051-.05.023-.024.023-.025.021-.024.02-.024.019-.024.018-.024.017-.024.015-.023.014-.024.013-.023.012-.023.01-.023.01-.022.008-.022.006-.022.006-.022.004-.022.004-.021.001-.021.001-.021v-4.127l-.077.055-.08.053-.083.054-.085.053-.087.052-.09.052-.093.051-.095.05-.097.05-.1.049-.102.049-.105.048-.106.047-.109.047-.111.046-.114.045-.115.045-.118.044-.12.043-.122.042-.124.042-.126.041-.128.04-.13.04-.132.038-.134.038-.135.037-.138.037-.139.035-.142.035-.143.034-.144.033-.147.032-.148.031-.15.03-.151.03-.153.029-.154.027-.156.027-.158.026-.159.025-.161.024-.162.023-.163.022-.165.021-.166.02-.167.019-.169.018-.169.017-.171.016-.173.015-.173.014-.175.013-.175.012-.177.011-.178.01-.179.008-.179.008-.181.006-.182.005-.182.004-.184.003-.184.002h-.37l-.184-.002-.184-.003-.182-.004-.182-.005-.181-.006-.179-.008-.179-.008-.178-.01-.176-.011-.176-.012-.175-.013-.173-.014-.172-.015-.171-.016-.17-.017-.169-.018-.167-.019-.166-.02-.165-.021-.163-.022-.162-.023-.161-.024-.159-.025-.157-.026-.156-.027-.155-.027-.153-.029-.151-.03-.15-.03-.148-.031-.146-.032-.145-.033-.143-.034-.141-.035-.14-.035-.137-.037-.136-.037-.134-.038-.132-.038-.13-.04-.128-.04-.126-.041-.124-.042-.122-.042-.12-.044-.117-.043-.116-.045-.113-.045-.112-.046-.109-.047-.106-.047-.105-.048-.102-.049-.1-.049-.097-.05-.095-.05-.093-.052-.09-.051-.087-.052-.085-.053-.083-.054-.08-.054-.077-.054v4.127zm0-5.654v.011l.001.021.003.021.004.021.005.022.006.022.007.022.009.022.01.022.011.023.012.023.013.023.015.024.016.023.017.024.018.024.019.024.021.024.022.024.023.025.024.024.052.05.056.05.061.05.066.051.07.051.075.052.079.051.084.052.088.052.092.052.097.052.102.052.105.052.11.051.114.051.119.052.123.05.127.051.131.05.135.049.139.049.144.048.147.048.152.047.155.046.16.045.163.045.167.044.171.042.176.042.178.04.183.04.187.038.19.037.194.036.197.034.202.033.204.032.209.03.212.028.216.027.219.025.222.024.226.022.23.02.233.018.236.016.24.014.243.012.246.01.249.008.253.006.256.003.259.001.26-.001.257-.003.254-.006.25-.008.247-.01.244-.012.241-.015.237-.016.233-.018.231-.02.226-.022.224-.024.22-.025.216-.027.212-.029.21-.03.205-.032.202-.033.198-.035.194-.036.191-.037.187-.039.183-.039.179-.041.175-.042.172-.043.168-.044.163-.045.16-.045.155-.047.152-.047.148-.048.143-.048.139-.05.136-.049.131-.05.126-.051.123-.051.118-.051.114-.052.11-.052.106-.052.101-.052.096-.052.092-.052.088-.052.083-.052.079-.052.074-.051.07-.052.065-.051.06-.05.056-.051.051-.049.023-.025.023-.024.021-.025.02-.024.019-.024.018-.024.017-.024.015-.023.014-.023.013-.024.012-.022.01-.023.01-.023.008-.022.006-.022.006-.022.004-.021.004-.022.001-.021.001-.021v-4.139l-.077.054-.08.054-.083.054-.085.052-.087.053-.09.051-.093.051-.095.051-.097.05-.1.049-.102.049-.105.048-.106.047-.109.047-.111.046-.114.045-.115.044-.118.044-.12.044-.122.042-.124.042-.126.041-.128.04-.13.039-.132.039-.134.038-.135.037-.138.036-.139.036-.142.035-.143.033-.144.033-.147.033-.148.031-.15.03-.151.03-.153.028-.154.028-.156.027-.158.026-.159.025-.161.024-.162.023-.163.022-.165.021-.166.02-.167.019-.169.018-.169.017-.171.016-.173.015-.173.014-.175.013-.175.012-.177.011-.178.009-.179.009-.179.007-.181.007-.182.005-.182.004-.184.003-.184.002h-.37l-.184-.002-.184-.003-.182-.004-.182-.005-.181-.007-.179-.007-.179-.009-.178-.009-.176-.011-.176-.012-.175-.013-.173-.014-.172-.015-.171-.016-.17-.017-.169-.018-.167-.019-.166-.02-.165-.021-.163-.022-.162-.023-.161-.024-.159-.025-.157-.026-.156-.027-.155-.028-.153-.028-.151-.03-.15-.03-.148-.031-.146-.033-.145-.033-.143-.033-.141-.035-.14-.036-.137-.036-.136-.037-.134-.038-.132-.039-.13-.039-.128-.04-.126-.041-.124-.042-.122-.043-.12-.043-.117-.044-.116-.044-.113-.046-.112-.046-.109-.046-.106-.047-.105-.048-.102-.049-.1-.049-.097-.05-.095-.051-.093-.051-.09-.051-.087-.053-.085-.052-.083-.054-.08-.054-.077-.054v4.139zm0-5.666v.011l.001.02.003.022.004.021.005.022.006.021.007.022.009.023.01.022.011.023.012.023.013.023.015.023.016.024.017.024.018.023.019.024.021.025.022.024.023.024.024.025.052.05.056.05.061.05.066.051.07.051.075.052.079.051.084.052.088.052.092.052.097.052.102.052.105.051.11.052.114.051.119.051.123.051.127.05.131.05.135.05.139.049.144.048.147.048.152.047.155.046.16.045.163.045.167.043.171.043.176.042.178.04.183.04.187.038.19.037.194.036.197.034.202.033.204.032.209.03.212.028.216.027.219.025.222.024.226.021.23.02.233.018.236.017.24.014.243.012.246.01.249.008.253.006.256.003.259.001.26-.001.257-.003.254-.006.25-.008.247-.01.244-.013.241-.014.237-.016.233-.018.231-.02.226-.022.224-.024.22-.025.216-.027.212-.029.21-.03.205-.032.202-.033.198-.035.194-.036.191-.037.187-.039.183-.039.179-.041.175-.042.172-.043.168-.044.163-.045.16-.045.155-.047.152-.047.148-.048.143-.049.139-.049.136-.049.131-.051.126-.05.123-.051.118-.052.114-.051.11-.052.106-.052.101-.052.096-.052.092-.052.088-.052.083-.052.079-.052.074-.052.07-.051.065-.051.06-.051.056-.05.051-.049.023-.025.023-.025.021-.024.02-.024.019-.024.018-.024.017-.024.015-.023.014-.024.013-.023.012-.023.01-.022.01-.023.008-.022.006-.022.006-.022.004-.022.004-.021.001-.021.001-.021v-4.153l-.077.054-.08.054-.083.053-.085.053-.087.053-.09.051-.093.051-.095.051-.097.05-.1.049-.102.048-.105.048-.106.048-.109.046-.111.046-.114.046-.115.044-.118.044-.12.043-.122.043-.124.042-.126.041-.128.04-.13.039-.132.039-.134.038-.135.037-.138.036-.139.036-.142.034-.143.034-.144.033-.147.032-.148.032-.15.03-.151.03-.153.028-.154.028-.156.027-.158.026-.159.024-.161.024-.162.023-.163.023-.165.021-.166.02-.167.019-.169.018-.169.017-.171.016-.173.015-.173.014-.175.013-.175.012-.177.01-.178.01-.179.009-.179.007-.181.006-.182.006-.182.004-.184.003-.184.001-.185.001-.185-.001-.184-.001-.184-.003-.182-.004-.182-.006-.181-.006-.179-.007-.179-.009-.178-.01-.176-.01-.176-.012-.175-.013-.173-.014-.172-.015-.171-.016-.17-.017-.169-.018-.167-.019-.166-.02-.165-.021-.163-.023-.162-.023-.161-.024-.159-.024-.157-.026-.156-.027-.155-.028-.153-.028-.151-.03-.15-.03-.148-.032-.146-.032-.145-.033-.143-.034-.141-.034-.14-.036-.137-.036-.136-.037-.134-.038-.132-.039-.13-.039-.128-.041-.126-.041-.124-.041-.122-.043-.12-.043-.117-.044-.116-.044-.113-.046-.112-.046-.109-.046-.106-.048-.105-.048-.102-.048-.1-.05-.097-.049-.095-.051-.093-.051-.09-.052-.087-.052-.085-.053-.083-.053-.08-.054-.077-.054v4.153zm8.74-8.179l-.257.004-.254.005-.25.008-.247.011-.244.012-.241.014-.237.016-.233.018-.231.021-.226.022-.224.023-.22.026-.216.027-.212.028-.21.031-.205.032-.202.033-.198.034-.194.036-.191.038-.187.038-.183.04-.179.041-.175.042-.172.043-.168.043-.163.045-.16.046-.155.046-.152.048-.148.048-.143.048-.139.049-.136.05-.131.05-.126.051-.123.051-.118.051-.114.052-.11.052-.106.052-.101.052-.096.052-.092.052-.088.052-.083.052-.079.052-.074.051-.07.052-.065.051-.06.05-.056.05-.051.05-.023.025-.023.024-.021.024-.02.025-.019.024-.018.024-.017.023-.015.024-.014.023-.013.023-.012.023-.01.023-.01.022-.008.022-.006.023-.006.021-.004.022-.004.021-.001.021-.001.021.001.021.001.021.004.021.004.022.006.021.006.023.008.022.01.022.01.023.012.023.013.023.014.023.015.024.017.023.018.024.019.024.02.025.021.024.023.024.023.025.051.05.056.05.06.05.065.051.07.052.074.051.079.052.083.052.088.052.092.052.096.052.101.052.106.052.11.052.114.052.118.051.123.051.126.051.131.05.136.05.139.049.143.048.148.048.152.048.155.046.16.046.163.045.168.043.172.043.175.042.179.041.183.04.187.038.191.038.194.036.198.034.202.033.205.032.21.031.212.028.216.027.22.026.224.023.226.022.231.021.233.018.237.016.241.014.244.012.247.011.25.008.254.005.257.004.26.001.26-.001.257-.004.254-.005.25-.008.247-.011.244-.012.241-.014.237-.016.233-.018.231-.021.226-.022.224-.023.22-.026.216-.027.212-.028.21-.031.205-.032.202-.033.198-.034.194-.036.191-.038.187-.038.183-.04.179-.041.175-.042.172-.043.168-.043.163-.045.16-.046.155-.046.152-.048.148-.048.143-.048.139-.049.136-.05.131-.05.126-.051.123-.051.118-.051.114-.052.11-.052.106-.052.101-.052.096-.052.092-.052.088-.052.083-.052.079-.052.074-.051.07-.052.065-.051.06-.05.056-.05.051-.05.023-.025.023-.024.021-.024.02-.025.019-.024.018-.024.017-.023.015-.024.014-.023.013-.023.012-.023.01-.023.01-.022.008-.022.006-.023.006-.021.004-.022.004-.021.001-.021.001-.021-.001-.021-.001-.021-.004-.021-.004-.022-.006-.021-.006-.023-.008-.022-.01-.022-.01-.023-.012-.023-.013-.023-.014-.023-.015-.024-.017-.023-.018-.024-.019-.024-.02-.025-.021-.024-.023-.024-.023-.025-.051-.05-.056-.05-.06-.05-.065-.051-.07-.052-.074-.051-.079-.052-.083-.052-.088-.052-.092-.052-.096-.052-.101-.052-.106-.052-.11-.052-.114-.052-.118-.051-.123-.051-.126-.051-.131-.05-.136-.05-.139-.049-.143-.048-.148-.048-.152-.048-.155-.046-.16-.046-.163-.045-.168-.043-.172-.043-.175-.042-.179-.041-.183-.04-.187-.038-.191-.038-.194-.036-.198-.034-.202-.033-.205-.032-.21-.031-.212-.028-.216-.027-.22-.026-.224-.023-.226-.022-.231-.021-.233-.018-.237-.016-.241-.014-.244-.012-.247-.011-.25-.008-.254-.005-.257-.004-.26-.001-.26.001z");
}, "insertDatabaseIcon");
var insertComputerIcon = /* @__PURE__ */ __name(function(elem, id) {
  elem.append("defs").append("symbol").attr("id", id + "-computer").attr("width", "24").attr("height", "24").append("path").attr("transform", "scale(.5)").attr("d", "M2 2v13h20v-13h-20zm18 11h-16v-9h16v9zm-10.228 6l.466-1h3.524l.467 1h-4.457zm14.228 3h-24l2-6h2.104l-1.33 4h18.45l-1.297-4h2.073l2 6zm-5-10h-14v-7h14v7z");
}, "insertComputerIcon");
var insertClockIcon = /* @__PURE__ */ __name(function(elem, id) {
  elem.append("defs").append("symbol").attr("id", id + "-clock").attr("width", "24").attr("height", "24").append("path").attr("transform", "scale(.5)").attr("d", "M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.848 12.459c.202.038.202.333.001.372-1.907.361-6.045 1.111-6.547 1.111-.719 0-1.301-.582-1.301-1.301 0-.512.77-5.447 1.125-7.445.034-.192.312-.181.343.014l.985 6.238 5.394 1.011z");
}, "insertClockIcon");
var insertArrowHead = /* @__PURE__ */ __name(function(elem, id) {
  elem.append("defs").append("marker").attr("id", id + "-arrowhead").attr("refX", 9).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto").append("path").attr("d", "M 0 0 L 10 5 L 0 10 z");
}, "insertArrowHead");
var insertArrowEnd = /* @__PURE__ */ __name(function(elem, id) {
  elem.append("defs").append("marker").attr("id", id + "-arrowend").attr("refX", 1).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto").append("path").attr("d", "M 10 0 L 0 5 L 10 10 z");
}, "insertArrowEnd");
var insertArrowFilledHead = /* @__PURE__ */ __name(function(elem, id) {
  elem.append("defs").append("marker").attr("id", id + "-filled-head").attr("refX", 18).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L14,7 L9,1 Z");
}, "insertArrowFilledHead");
var insertArrowCrossHead = /* @__PURE__ */ __name(function(elem, id) {
  const defs = elem.append("defs");
  const marker = defs.append("marker").attr("id", id + "-crosshead").attr("markerWidth", 15).attr("markerHeight", 8).attr("orient", "auto").attr("refX", 16).attr("refY", 4);
  marker.append("path").attr("fill", "black").attr("stroke", "#000000").style("stroke-dasharray", "0, 0").attr("stroke-width", "1px").attr("d", "M 9,2 V 6 L16,4 Z");
  marker.append("path").attr("fill", "none").attr("stroke", "#000000").style("stroke-dasharray", "0, 0").attr("stroke-width", "1px").attr("d", "M 0,1 L 6,7 M 6,1 L 0,7");
}, "insertArrowCrossHead");
var getC4ShapeFont = /* @__PURE__ */ __name((cnf, typeC4Shape) => {
  return {
    fontFamily: cnf[typeC4Shape + "FontFamily"],
    fontSize: cnf[typeC4Shape + "FontSize"],
    fontWeight: cnf[typeC4Shape + "FontWeight"]
  };
}, "getC4ShapeFont");
var _drawTextCandidateFunc = /* @__PURE__ */ function() {
  function byText(content, g, x, y, width, height, textAttrs) {
    const text = g.append("text").attr("x", x + width / 2).attr("y", y + height / 2 + 5).style("text-anchor", "middle").text(content);
    _setTextAttrs(text, textAttrs);
  }
  __name(byText, "byText");
  function byTspan(content, g, x, y, width, height, textAttrs, conf2) {
    const { fontSize, fontFamily, fontWeight } = conf2;
    const lines = content.split(common_default.lineBreakRegex);
    for (let i = 0;i < lines.length; i++) {
      const dy = i * fontSize - fontSize * (lines.length - 1) / 2;
      const text = g.append("text").attr("x", x + width / 2).attr("y", y).style("text-anchor", "middle").attr("dominant-baseline", "middle").style("font-size", fontSize).style("font-weight", fontWeight).style("font-family", fontFamily);
      text.append("tspan").attr("dy", dy).text(lines[i]).attr("alignment-baseline", "mathematical");
      _setTextAttrs(text, textAttrs);
    }
  }
  __name(byTspan, "byTspan");
  function byFo(content, g, x, y, width, height, textAttrs, conf2) {
    const s = g.append("switch");
    const f = s.append("foreignObject").attr("x", x).attr("y", y).attr("width", width).attr("height", height);
    const text = f.append("xhtml:div").style("display", "table").style("height", "100%").style("width", "100%");
    text.append("div").style("display", "table-cell").style("text-align", "center").style("vertical-align", "middle").text(content);
    byTspan(content, s, x, y, width, height, textAttrs, conf2);
    _setTextAttrs(text, textAttrs);
  }
  __name(byFo, "byFo");
  function _setTextAttrs(toText, fromTextAttrsDict) {
    for (const key in fromTextAttrsDict) {
      if (fromTextAttrsDict.hasOwnProperty(key)) {
        toText.attr(key, fromTextAttrsDict[key]);
      }
    }
  }
  __name(_setTextAttrs, "_setTextAttrs");
  return function(conf2) {
    return conf2.textPlacement === "fo" ? byFo : conf2.textPlacement === "old" ? byText : byTspan;
  };
}();
var svgDraw_default = {
  drawRect: drawRect2,
  drawBoundary,
  drawC4Shape,
  drawRels,
  drawImage,
  insertArrowHead,
  insertArrowEnd,
  insertArrowFilledHead,
  insertArrowCrossHead,
  insertDatabaseIcon,
  insertComputerIcon,
  insertClockIcon
};
var globalBoundaryMaxX = 0;
var globalBoundaryMaxY = 0;
var c4ShapeInRow2 = 4;
var c4BoundaryInRow2 = 2;
parser.yy = c4Db_default;
var conf = {};
var Bounds = class {
  static {
    __name(this, "Bounds");
  }
  constructor(diagObj) {
    this.name = "";
    this.data = {};
    this.data.startx = undefined;
    this.data.stopx = undefined;
    this.data.starty = undefined;
    this.data.stopy = undefined;
    this.data.widthLimit = undefined;
    this.nextData = {};
    this.nextData.startx = undefined;
    this.nextData.stopx = undefined;
    this.nextData.starty = undefined;
    this.nextData.stopy = undefined;
    this.nextData.cnt = 0;
    setConf(diagObj.db.getConfig());
  }
  setData(startx, stopx, starty, stopy) {
    this.nextData.startx = this.data.startx = startx;
    this.nextData.stopx = this.data.stopx = stopx;
    this.nextData.starty = this.data.starty = starty;
    this.nextData.stopy = this.data.stopy = stopy;
  }
  updateVal(obj, key, val, fun) {
    if (obj[key] === undefined) {
      obj[key] = val;
    } else {
      obj[key] = fun(val, obj[key]);
    }
  }
  insert(c4Shape) {
    this.nextData.cnt = this.nextData.cnt + 1;
    let _startx = this.nextData.startx === this.nextData.stopx ? this.nextData.stopx + c4Shape.margin : this.nextData.stopx + c4Shape.margin * 2;
    let _stopx = _startx + c4Shape.width;
    let _starty = this.nextData.starty + c4Shape.margin * 2;
    let _stopy = _starty + c4Shape.height;
    if (_startx >= this.data.widthLimit || _stopx >= this.data.widthLimit || this.nextData.cnt > c4ShapeInRow2) {
      _startx = this.nextData.startx + c4Shape.margin + conf.nextLinePaddingX;
      _starty = this.nextData.stopy + c4Shape.margin * 2;
      this.nextData.stopx = _stopx = _startx + c4Shape.width;
      this.nextData.starty = this.nextData.stopy;
      this.nextData.stopy = _stopy = _starty + c4Shape.height;
      this.nextData.cnt = 1;
    }
    c4Shape.x = _startx;
    c4Shape.y = _starty;
    this.updateVal(this.data, "startx", _startx, Math.min);
    this.updateVal(this.data, "starty", _starty, Math.min);
    this.updateVal(this.data, "stopx", _stopx, Math.max);
    this.updateVal(this.data, "stopy", _stopy, Math.max);
    this.updateVal(this.nextData, "startx", _startx, Math.min);
    this.updateVal(this.nextData, "starty", _starty, Math.min);
    this.updateVal(this.nextData, "stopx", _stopx, Math.max);
    this.updateVal(this.nextData, "stopy", _stopy, Math.max);
  }
  init(diagObj) {
    this.name = "";
    this.data = {
      startx: undefined,
      stopx: undefined,
      starty: undefined,
      stopy: undefined,
      widthLimit: undefined
    };
    this.nextData = {
      startx: undefined,
      stopx: undefined,
      starty: undefined,
      stopy: undefined,
      cnt: 0
    };
    setConf(diagObj.db.getConfig());
  }
  bumpLastMargin(margin) {
    this.data.stopx += margin;
    this.data.stopy += margin;
  }
};
var setConf = /* @__PURE__ */ __name(function(cnf) {
  assignWithDepth_default(conf, cnf);
  if (cnf.fontFamily) {
    conf.personFontFamily = conf.systemFontFamily = conf.messageFontFamily = cnf.fontFamily;
  }
  if (cnf.fontSize) {
    conf.personFontSize = conf.systemFontSize = conf.messageFontSize = cnf.fontSize;
  }
  if (cnf.fontWeight) {
    conf.personFontWeight = conf.systemFontWeight = conf.messageFontWeight = cnf.fontWeight;
  }
}, "setConf");
var c4ShapeFont = /* @__PURE__ */ __name((cnf, typeC4Shape) => {
  return {
    fontFamily: cnf[typeC4Shape + "FontFamily"],
    fontSize: cnf[typeC4Shape + "FontSize"],
    fontWeight: cnf[typeC4Shape + "FontWeight"]
  };
}, "c4ShapeFont");
var boundaryFont = /* @__PURE__ */ __name((cnf) => {
  return {
    fontFamily: cnf.boundaryFontFamily,
    fontSize: cnf.boundaryFontSize,
    fontWeight: cnf.boundaryFontWeight
  };
}, "boundaryFont");
var messageFont = /* @__PURE__ */ __name((cnf) => {
  return {
    fontFamily: cnf.messageFontFamily,
    fontSize: cnf.messageFontSize,
    fontWeight: cnf.messageFontWeight
  };
}, "messageFont");
function calcC4ShapeTextWH(textType, c4Shape, c4ShapeTextWrap, textConf, textLimitWidth) {
  if (!c4Shape[textType].width) {
    if (c4ShapeTextWrap) {
      c4Shape[textType].text = wrapLabel(c4Shape[textType].text, textLimitWidth, textConf);
      c4Shape[textType].textLines = c4Shape[textType].text.split(common_default.lineBreakRegex).length;
      c4Shape[textType].width = textLimitWidth;
      c4Shape[textType].height = calculateTextHeight(c4Shape[textType].text, textConf);
    } else {
      let lines = c4Shape[textType].text.split(common_default.lineBreakRegex);
      c4Shape[textType].textLines = lines.length;
      let lineHeight = 0;
      c4Shape[textType].height = 0;
      c4Shape[textType].width = 0;
      for (const line of lines) {
        c4Shape[textType].width = Math.max(calculateTextWidth(line, textConf), c4Shape[textType].width);
        lineHeight = calculateTextHeight(line, textConf);
        c4Shape[textType].height = c4Shape[textType].height + lineHeight;
      }
    }
  }
}
__name(calcC4ShapeTextWH, "calcC4ShapeTextWH");
var drawBoundary2 = /* @__PURE__ */ __name(function(diagram2, boundary, bounds) {
  boundary.x = bounds.data.startx;
  boundary.y = bounds.data.starty;
  boundary.width = bounds.data.stopx - bounds.data.startx;
  boundary.height = bounds.data.stopy - bounds.data.starty;
  boundary.label.y = conf.c4ShapeMargin - 35;
  let boundaryTextWrap = boundary.wrap && conf.wrap;
  let boundaryLabelConf = boundaryFont(conf);
  boundaryLabelConf.fontSize = boundaryLabelConf.fontSize + 2;
  boundaryLabelConf.fontWeight = "bold";
  let textLimitWidth = calculateTextWidth(boundary.label.text, boundaryLabelConf);
  calcC4ShapeTextWH("label", boundary, boundaryTextWrap, boundaryLabelConf, textLimitWidth);
  svgDraw_default.drawBoundary(diagram2, boundary, conf);
}, "drawBoundary");
var drawC4ShapeArray = /* @__PURE__ */ __name(function(currentBounds, diagram2, c4ShapeArray2, c4ShapeKeys) {
  let Y = 0;
  for (const c4ShapeKey of c4ShapeKeys) {
    Y = 0;
    const c4Shape = c4ShapeArray2[c4ShapeKey];
    let c4ShapeTypeConf = c4ShapeFont(conf, c4Shape.typeC4Shape.text);
    c4ShapeTypeConf.fontSize = c4ShapeTypeConf.fontSize - 2;
    c4Shape.typeC4Shape.width = calculateTextWidth("«" + c4Shape.typeC4Shape.text + "»", c4ShapeTypeConf);
    c4Shape.typeC4Shape.height = c4ShapeTypeConf.fontSize + 2;
    c4Shape.typeC4Shape.Y = conf.c4ShapePadding;
    Y = c4Shape.typeC4Shape.Y + c4Shape.typeC4Shape.height - 4;
    c4Shape.image = { width: 0, height: 0, Y: 0 };
    switch (c4Shape.typeC4Shape.text) {
      case "person":
      case "external_person":
        c4Shape.image.width = 48;
        c4Shape.image.height = 48;
        c4Shape.image.Y = Y;
        Y = c4Shape.image.Y + c4Shape.image.height;
        break;
    }
    if (c4Shape.sprite) {
      c4Shape.image.width = 48;
      c4Shape.image.height = 48;
      c4Shape.image.Y = Y;
      Y = c4Shape.image.Y + c4Shape.image.height;
    }
    let c4ShapeTextWrap = c4Shape.wrap && conf.wrap;
    let textLimitWidth = conf.width - conf.c4ShapePadding * 2;
    let c4ShapeLabelConf = c4ShapeFont(conf, c4Shape.typeC4Shape.text);
    c4ShapeLabelConf.fontSize = c4ShapeLabelConf.fontSize + 2;
    c4ShapeLabelConf.fontWeight = "bold";
    calcC4ShapeTextWH("label", c4Shape, c4ShapeTextWrap, c4ShapeLabelConf, textLimitWidth);
    c4Shape.label.Y = Y + 8;
    Y = c4Shape.label.Y + c4Shape.label.height;
    if (c4Shape.type && c4Shape.type.text !== "") {
      c4Shape.type.text = "[" + c4Shape.type.text + "]";
      let c4ShapeTypeConf2 = c4ShapeFont(conf, c4Shape.typeC4Shape.text);
      calcC4ShapeTextWH("type", c4Shape, c4ShapeTextWrap, c4ShapeTypeConf2, textLimitWidth);
      c4Shape.type.Y = Y + 5;
      Y = c4Shape.type.Y + c4Shape.type.height;
    } else if (c4Shape.techn && c4Shape.techn.text !== "") {
      c4Shape.techn.text = "[" + c4Shape.techn.text + "]";
      let c4ShapeTechnConf = c4ShapeFont(conf, c4Shape.techn.text);
      calcC4ShapeTextWH("techn", c4Shape, c4ShapeTextWrap, c4ShapeTechnConf, textLimitWidth);
      c4Shape.techn.Y = Y + 5;
      Y = c4Shape.techn.Y + c4Shape.techn.height;
    }
    let rectHeight = Y;
    let rectWidth = c4Shape.label.width;
    if (c4Shape.descr && c4Shape.descr.text !== "") {
      let c4ShapeDescrConf = c4ShapeFont(conf, c4Shape.typeC4Shape.text);
      calcC4ShapeTextWH("descr", c4Shape, c4ShapeTextWrap, c4ShapeDescrConf, textLimitWidth);
      c4Shape.descr.Y = Y + 20;
      Y = c4Shape.descr.Y + c4Shape.descr.height;
      rectWidth = Math.max(c4Shape.label.width, c4Shape.descr.width);
      rectHeight = Y - c4Shape.descr.textLines * 5;
    }
    rectWidth = rectWidth + conf.c4ShapePadding;
    c4Shape.width = Math.max(c4Shape.width || conf.width, rectWidth, conf.width);
    c4Shape.height = Math.max(c4Shape.height || conf.height, rectHeight, conf.height);
    c4Shape.margin = c4Shape.margin || conf.c4ShapeMargin;
    currentBounds.insert(c4Shape);
    svgDraw_default.drawC4Shape(diagram2, c4Shape, conf);
  }
  currentBounds.bumpLastMargin(conf.c4ShapeMargin);
}, "drawC4ShapeArray");
var Point = class {
  static {
    __name(this, "Point");
  }
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
};
var getIntersectPoint = /* @__PURE__ */ __name(function(fromNode, endPoint) {
  let x1 = fromNode.x;
  let y1 = fromNode.y;
  let x2 = endPoint.x;
  let y2 = endPoint.y;
  let fromCenterX = x1 + fromNode.width / 2;
  let fromCenterY = y1 + fromNode.height / 2;
  let dx = Math.abs(x1 - x2);
  let dy = Math.abs(y1 - y2);
  let tanDYX = dy / dx;
  let fromDYX = fromNode.height / fromNode.width;
  let returnPoint = null;
  if (y1 == y2 && x1 < x2) {
    returnPoint = new Point(x1 + fromNode.width, fromCenterY);
  } else if (y1 == y2 && x1 > x2) {
    returnPoint = new Point(x1, fromCenterY);
  } else if (x1 == x2 && y1 < y2) {
    returnPoint = new Point(fromCenterX, y1 + fromNode.height);
  } else if (x1 == x2 && y1 > y2) {
    returnPoint = new Point(fromCenterX, y1);
  }
  if (x1 > x2 && y1 < y2) {
    if (fromDYX >= tanDYX) {
      returnPoint = new Point(x1, fromCenterY + tanDYX * fromNode.width / 2);
    } else {
      returnPoint = new Point(fromCenterX - dx / dy * fromNode.height / 2, y1 + fromNode.height);
    }
  } else if (x1 < x2 && y1 < y2) {
    if (fromDYX >= tanDYX) {
      returnPoint = new Point(x1 + fromNode.width, fromCenterY + tanDYX * fromNode.width / 2);
    } else {
      returnPoint = new Point(fromCenterX + dx / dy * fromNode.height / 2, y1 + fromNode.height);
    }
  } else if (x1 < x2 && y1 > y2) {
    if (fromDYX >= tanDYX) {
      returnPoint = new Point(x1 + fromNode.width, fromCenterY - tanDYX * fromNode.width / 2);
    } else {
      returnPoint = new Point(fromCenterX + fromNode.height / 2 * dx / dy, y1);
    }
  } else if (x1 > x2 && y1 > y2) {
    if (fromDYX >= tanDYX) {
      returnPoint = new Point(x1, fromCenterY - fromNode.width / 2 * tanDYX);
    } else {
      returnPoint = new Point(fromCenterX - fromNode.height / 2 * dx / dy, y1);
    }
  }
  return returnPoint;
}, "getIntersectPoint");
var getIntersectPoints = /* @__PURE__ */ __name(function(fromNode, endNode) {
  let endIntersectPoint = { x: 0, y: 0 };
  endIntersectPoint.x = endNode.x + endNode.width / 2;
  endIntersectPoint.y = endNode.y + endNode.height / 2;
  let startPoint = getIntersectPoint(fromNode, endIntersectPoint);
  endIntersectPoint.x = fromNode.x + fromNode.width / 2;
  endIntersectPoint.y = fromNode.y + fromNode.height / 2;
  let endPoint = getIntersectPoint(endNode, endIntersectPoint);
  return { startPoint, endPoint };
}, "getIntersectPoints");
var drawRels2 = /* @__PURE__ */ __name(function(diagram2, rels2, getC4ShapeObj, diagObj, diagramId) {
  let i = 0;
  for (let rel of rels2) {
    i = i + 1;
    let relTextWrap = rel.wrap && conf.wrap;
    let relConf = messageFont(conf);
    let diagramType = diagObj.db.getC4Type();
    if (diagramType === "C4Dynamic") {
      rel.label.text = i + ": " + rel.label.text;
    }
    let textLimitWidth = calculateTextWidth(rel.label.text, relConf);
    calcC4ShapeTextWH("label", rel, relTextWrap, relConf, textLimitWidth);
    if (rel.techn && rel.techn.text !== "") {
      textLimitWidth = calculateTextWidth(rel.techn.text, relConf);
      calcC4ShapeTextWH("techn", rel, relTextWrap, relConf, textLimitWidth);
    }
    if (rel.descr && rel.descr.text !== "") {
      textLimitWidth = calculateTextWidth(rel.descr.text, relConf);
      calcC4ShapeTextWH("descr", rel, relTextWrap, relConf, textLimitWidth);
    }
    let fromNode = getC4ShapeObj(rel.from);
    let endNode = getC4ShapeObj(rel.to);
    let points = getIntersectPoints(fromNode, endNode);
    rel.startPoint = points.startPoint;
    rel.endPoint = points.endPoint;
  }
  svgDraw_default.drawRels(diagram2, rels2, conf, diagramId);
}, "drawRels");
function drawInsideBoundary(diagram2, parentBoundaryAlias, parentBounds, currentBoundaries, diagObj) {
  let currentBounds = new Bounds(diagObj);
  currentBounds.data.widthLimit = parentBounds.data.widthLimit / Math.min(c4BoundaryInRow2, currentBoundaries.length);
  for (let [i, currentBoundary] of currentBoundaries.entries()) {
    let Y = 0;
    currentBoundary.image = { width: 0, height: 0, Y: 0 };
    if (currentBoundary.sprite) {
      currentBoundary.image.width = 48;
      currentBoundary.image.height = 48;
      currentBoundary.image.Y = Y;
      Y = currentBoundary.image.Y + currentBoundary.image.height;
    }
    let currentBoundaryTextWrap = currentBoundary.wrap && conf.wrap;
    let currentBoundaryLabelConf = boundaryFont(conf);
    currentBoundaryLabelConf.fontSize = currentBoundaryLabelConf.fontSize + 2;
    currentBoundaryLabelConf.fontWeight = "bold";
    calcC4ShapeTextWH("label", currentBoundary, currentBoundaryTextWrap, currentBoundaryLabelConf, currentBounds.data.widthLimit);
    currentBoundary.label.Y = Y + 8;
    Y = currentBoundary.label.Y + currentBoundary.label.height;
    if (currentBoundary.type && currentBoundary.type.text !== "") {
      currentBoundary.type.text = "[" + currentBoundary.type.text + "]";
      let currentBoundaryTypeConf = boundaryFont(conf);
      calcC4ShapeTextWH("type", currentBoundary, currentBoundaryTextWrap, currentBoundaryTypeConf, currentBounds.data.widthLimit);
      currentBoundary.type.Y = Y + 5;
      Y = currentBoundary.type.Y + currentBoundary.type.height;
    }
    if (currentBoundary.descr && currentBoundary.descr.text !== "") {
      let currentBoundaryDescrConf = boundaryFont(conf);
      currentBoundaryDescrConf.fontSize = currentBoundaryDescrConf.fontSize - 2;
      calcC4ShapeTextWH("descr", currentBoundary, currentBoundaryTextWrap, currentBoundaryDescrConf, currentBounds.data.widthLimit);
      currentBoundary.descr.Y = Y + 20;
      Y = currentBoundary.descr.Y + currentBoundary.descr.height;
    }
    if (i == 0 || i % c4BoundaryInRow2 === 0) {
      let _x = parentBounds.data.startx + conf.diagramMarginX;
      let _y = parentBounds.data.stopy + conf.diagramMarginY + Y;
      currentBounds.setData(_x, _x, _y, _y);
    } else {
      let _x = currentBounds.data.stopx !== currentBounds.data.startx ? currentBounds.data.stopx + conf.diagramMarginX : currentBounds.data.startx;
      let _y = currentBounds.data.starty;
      currentBounds.setData(_x, _x, _y, _y);
    }
    currentBounds.name = currentBoundary.alias;
    let currentPersonOrSystemArray = diagObj.db.getC4ShapeArray(currentBoundary.alias);
    let currentPersonOrSystemKeys = diagObj.db.getC4ShapeKeys(currentBoundary.alias);
    if (currentPersonOrSystemKeys.length > 0) {
      drawC4ShapeArray(currentBounds, diagram2, currentPersonOrSystemArray, currentPersonOrSystemKeys);
    }
    parentBoundaryAlias = currentBoundary.alias;
    let nextCurrentBoundaries = diagObj.db.getBoundaries(parentBoundaryAlias);
    if (nextCurrentBoundaries.length > 0) {
      drawInsideBoundary(diagram2, parentBoundaryAlias, currentBounds, nextCurrentBoundaries, diagObj);
    }
    if (currentBoundary.alias !== "global") {
      drawBoundary2(diagram2, currentBoundary, currentBounds);
    }
    parentBounds.data.stopy = Math.max(currentBounds.data.stopy + conf.c4ShapeMargin, parentBounds.data.stopy);
    parentBounds.data.stopx = Math.max(currentBounds.data.stopx + conf.c4ShapeMargin, parentBounds.data.stopx);
    globalBoundaryMaxX = Math.max(globalBoundaryMaxX, parentBounds.data.stopx);
    globalBoundaryMaxY = Math.max(globalBoundaryMaxY, parentBounds.data.stopy);
  }
}
__name(drawInsideBoundary, "drawInsideBoundary");
var draw = /* @__PURE__ */ __name(function(_text, id, _version, diagObj) {
  conf = getConfig2().c4;
  const securityLevel = getConfig2().securityLevel;
  let sandboxElement;
  if (securityLevel === "sandbox") {
    sandboxElement = select_default("#i" + id);
  }
  const root = securityLevel === "sandbox" ? select_default(sandboxElement.nodes()[0].contentDocument.body) : select_default("body");
  let db = diagObj.db;
  diagObj.db.setWrap(conf.wrap);
  c4ShapeInRow2 = db.getC4ShapeInRow();
  c4BoundaryInRow2 = db.getC4BoundaryInRow();
  log.debug(`C:${JSON.stringify(conf, null, 2)}`);
  const diagram2 = securityLevel === "sandbox" ? root.select(`[id="${id}"]`) : select_default(`[id="${id}"]`);
  svgDraw_default.insertComputerIcon(diagram2, id);
  svgDraw_default.insertDatabaseIcon(diagram2, id);
  svgDraw_default.insertClockIcon(diagram2, id);
  let screenBounds = new Bounds(diagObj);
  screenBounds.setData(conf.diagramMarginX, conf.diagramMarginX, conf.diagramMarginY, conf.diagramMarginY);
  screenBounds.data.widthLimit = screen.availWidth;
  globalBoundaryMaxX = conf.diagramMarginX;
  globalBoundaryMaxY = conf.diagramMarginY;
  const title2 = diagObj.db.getTitle();
  let currentBoundaries = diagObj.db.getBoundaries("");
  drawInsideBoundary(diagram2, "", screenBounds, currentBoundaries, diagObj);
  svgDraw_default.insertArrowHead(diagram2, id);
  svgDraw_default.insertArrowEnd(diagram2, id);
  svgDraw_default.insertArrowCrossHead(diagram2, id);
  svgDraw_default.insertArrowFilledHead(diagram2, id);
  drawRels2(diagram2, diagObj.db.getRels(), diagObj.db.getC4Shape, diagObj, id);
  screenBounds.data.stopx = globalBoundaryMaxX;
  screenBounds.data.stopy = globalBoundaryMaxY;
  const box = screenBounds.data;
  let boxHeight = box.stopy - box.starty;
  let height = boxHeight + 2 * conf.diagramMarginY;
  let boxWidth = box.stopx - box.startx;
  const width = boxWidth + 2 * conf.diagramMarginX;
  if (title2) {
    diagram2.append("text").text(title2).attr("x", (box.stopx - box.startx) / 2 - 4 * conf.diagramMarginX).attr("y", box.starty + conf.diagramMarginY);
  }
  configureSvgSize(diagram2, height, width, conf.useMaxWidth);
  const extraVertForTitle = title2 ? 60 : 0;
  diagram2.attr("viewBox", box.startx - conf.diagramMarginX + " -" + (conf.diagramMarginY + extraVertForTitle) + " " + width + " " + (height + extraVertForTitle));
  log.debug(`models:`, box);
}, "draw");
var c4Renderer_default = {
  drawPersonOrSystemArray: drawC4ShapeArray,
  drawBoundary: drawBoundary2,
  setConf,
  draw
};
var getStyles = /* @__PURE__ */ __name((options) => `.person {
    stroke: ${options.personBorder};
    fill: ${options.personBkg};
  }
`, "getStyles");
var styles_default = getStyles;
var diagram = {
  parser: c4Diagram_default,
  db: c4Db_default,
  renderer: c4Renderer_default,
  styles: styles_default,
  init: /* @__PURE__ */ __name(({ c4, wrap }) => {
    c4Renderer_default.setConf(c4);
    c4Db_default.setWrap(wrap);
  }, "init")
};
export {
  diagram
};

//# debugId=AE179827C5D40F3D64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2M0RGlhZ3JhbS1BQVVCS0VJVS5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiaW1wb3J0IHtcbiAgZHJhd1JlY3QsXG4gIGdldE5vdGVSZWN0XG59IGZyb20gXCIuL2NodW5rLU5EMkdVSEFNLm1qc1wiO1xuaW1wb3J0IHtcbiAgY2FsY3VsYXRlVGV4dEhlaWdodCxcbiAgY2FsY3VsYXRlVGV4dFdpZHRoLFxuICB3cmFwTGFiZWxcbn0gZnJvbSBcIi4vY2h1bmstNVpRWUhYS1UubWpzXCI7XG5pbXBvcnQge1xuICBhc3NpZ25XaXRoRGVwdGhfZGVmYXVsdCxcbiAgY29tbW9uX2RlZmF1bHQsXG4gIGNvbmZpZ3VyZVN2Z1NpemUsXG4gIGdldEFjY0Rlc2NyaXB0aW9uLFxuICBnZXRBY2NUaXRsZSxcbiAgZ2V0Q29uZmlnMiBhcyBnZXRDb25maWcsXG4gIHNhbml0aXplVGV4dCxcbiAgc2V0QWNjRGVzY3JpcHRpb24sXG4gIHNldEFjY1RpdGxlXG59IGZyb20gXCIuL2NodW5rLUNTQ0lISzdRLm1qc1wiO1xuaW1wb3J0IHtcbiAgX19uYW1lLFxuICBsb2dcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIHNyYy9kaWFncmFtcy9jNC9wYXJzZXIvYzREaWFncmFtLmppc29uXG52YXIgcGFyc2VyID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgbyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oaywgdiwgbzIsIGwpIHtcbiAgICBmb3IgKG8yID0gbzIgfHwge30sIGwgPSBrLmxlbmd0aDsgbC0tOyBvMltrW2xdXSA9IHYpIDtcbiAgICByZXR1cm4gbzI7XG4gIH0sIFwib1wiKSwgJFYwID0gWzEsIDI0XSwgJFYxID0gWzEsIDI1XSwgJFYyID0gWzEsIDI2XSwgJFYzID0gWzEsIDI3XSwgJFY0ID0gWzEsIDI4XSwgJFY1ID0gWzEsIDYzXSwgJFY2ID0gWzEsIDY0XSwgJFY3ID0gWzEsIDY1XSwgJFY4ID0gWzEsIDY2XSwgJFY5ID0gWzEsIDY3XSwgJFZhID0gWzEsIDY4XSwgJFZiID0gWzEsIDY5XSwgJFZjID0gWzEsIDI5XSwgJFZkID0gWzEsIDMwXSwgJFZlID0gWzEsIDMxXSwgJFZmID0gWzEsIDMyXSwgJFZnID0gWzEsIDMzXSwgJFZoID0gWzEsIDM0XSwgJFZpID0gWzEsIDM1XSwgJFZqID0gWzEsIDM2XSwgJFZrID0gWzEsIDM3XSwgJFZsID0gWzEsIDM4XSwgJFZtID0gWzEsIDM5XSwgJFZuID0gWzEsIDQwXSwgJFZvID0gWzEsIDQxXSwgJFZwID0gWzEsIDQyXSwgJFZxID0gWzEsIDQzXSwgJFZyID0gWzEsIDQ0XSwgJFZzID0gWzEsIDQ1XSwgJFZ0ID0gWzEsIDQ2XSwgJFZ1ID0gWzEsIDQ3XSwgJFZ2ID0gWzEsIDQ4XSwgJFZ3ID0gWzEsIDUwXSwgJFZ4ID0gWzEsIDUxXSwgJFZ5ID0gWzEsIDUyXSwgJFZ6ID0gWzEsIDUzXSwgJFZBID0gWzEsIDU0XSwgJFZCID0gWzEsIDU1XSwgJFZDID0gWzEsIDU2XSwgJFZEID0gWzEsIDU3XSwgJFZFID0gWzEsIDU4XSwgJFZGID0gWzEsIDU5XSwgJFZHID0gWzEsIDYwXSwgJFZIID0gWzE0LCA0Ml0sICRWSSA9IFsxNCwgMzQsIDM2LCAzNywgMzgsIDM5LCA0MCwgNDEsIDQyLCA0NCwgNDUsIDQ2LCA0NywgNDgsIDQ5LCA1MCwgNTEsIDUyLCA1MywgNTQsIDU1LCA1NiwgNTcsIDU4LCA1OSwgNjAsIDYxLCA2MiwgNjMsIDY0LCA2NSwgNjYsIDY3LCA2OCwgNjksIDcwLCA3MSwgNzIsIDczLCA3NF0sICRWSiA9IFsxMiwgMTQsIDM0LCAzNiwgMzcsIDM4LCAzOSwgNDAsIDQxLCA0MiwgNDQsIDQ1LCA0NiwgNDcsIDQ4LCA0OSwgNTAsIDUxLCA1MiwgNTMsIDU0LCA1NSwgNTYsIDU3LCA1OCwgNTksIDYwLCA2MSwgNjIsIDYzLCA2NCwgNjUsIDY2LCA2NywgNjgsIDY5LCA3MCwgNzEsIDcyLCA3MywgNzRdLCAkVksgPSBbMSwgODJdLCAkVkwgPSBbMSwgODNdLCAkVk0gPSBbMSwgODRdLCAkVk4gPSBbMSwgODVdLCAkVk8gPSBbMTIsIDE0LCA0Ml0sICRWUCA9IFsxMiwgMTQsIDMzLCA0Ml0sICRWUSA9IFsxMiwgMTQsIDMzLCA0MiwgNzYsIDc3LCA3OSwgODBdLCAkVlIgPSBbMTIsIDMzXSwgJFZTID0gWzM0LCAzNiwgMzcsIDM4LCAzOSwgNDAsIDQxLCA0NCwgNDUsIDQ2LCA0NywgNDgsIDQ5LCA1MCwgNTEsIDUyLCA1MywgNTQsIDU1LCA1NiwgNTcsIDU4LCA1OSwgNjAsIDYxLCA2MiwgNjMsIDY0LCA2NSwgNjYsIDY3LCA2OCwgNjksIDcwLCA3MSwgNzIsIDczLCA3NF07XG4gIHZhciBwYXJzZXIyID0ge1xuICAgIHRyYWNlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHRyYWNlKCkge1xuICAgIH0sIFwidHJhY2VcIiksXG4gICAgeXk6IHt9LFxuICAgIHN5bWJvbHNfOiB7IFwiZXJyb3JcIjogMiwgXCJzdGFydFwiOiAzLCBcIm1lcm1haWREb2NcIjogNCwgXCJkaXJlY3Rpb25cIjogNSwgXCJkaXJlY3Rpb25fdGJcIjogNiwgXCJkaXJlY3Rpb25fYnRcIjogNywgXCJkaXJlY3Rpb25fcmxcIjogOCwgXCJkaXJlY3Rpb25fbHJcIjogOSwgXCJncmFwaENvbmZpZ1wiOiAxMCwgXCJDNF9DT05URVhUXCI6IDExLCBcIk5FV0xJTkVcIjogMTIsIFwic3RhdGVtZW50c1wiOiAxMywgXCJFT0ZcIjogMTQsIFwiQzRfQ09OVEFJTkVSXCI6IDE1LCBcIkM0X0NPTVBPTkVOVFwiOiAxNiwgXCJDNF9EWU5BTUlDXCI6IDE3LCBcIkM0X0RFUExPWU1FTlRcIjogMTgsIFwib3RoZXJTdGF0ZW1lbnRzXCI6IDE5LCBcImRpYWdyYW1TdGF0ZW1lbnRzXCI6IDIwLCBcIm90aGVyU3RhdGVtZW50XCI6IDIxLCBcInRpdGxlXCI6IDIyLCBcImFjY0Rlc2NyaXB0aW9uXCI6IDIzLCBcImFjY190aXRsZVwiOiAyNCwgXCJhY2NfdGl0bGVfdmFsdWVcIjogMjUsIFwiYWNjX2Rlc2NyXCI6IDI2LCBcImFjY19kZXNjcl92YWx1ZVwiOiAyNywgXCJhY2NfZGVzY3JfbXVsdGlsaW5lX3ZhbHVlXCI6IDI4LCBcImJvdW5kYXJ5U3RhdGVtZW50XCI6IDI5LCBcImJvdW5kYXJ5U3RhcnRTdGF0ZW1lbnRcIjogMzAsIFwiYm91bmRhcnlTdG9wU3RhdGVtZW50XCI6IDMxLCBcImJvdW5kYXJ5U3RhcnRcIjogMzIsIFwiTEJSQUNFXCI6IDMzLCBcIkVOVEVSUFJJU0VfQk9VTkRBUllcIjogMzQsIFwiYXR0cmlidXRlc1wiOiAzNSwgXCJTWVNURU1fQk9VTkRBUllcIjogMzYsIFwiQk9VTkRBUllcIjogMzcsIFwiQ09OVEFJTkVSX0JPVU5EQVJZXCI6IDM4LCBcIk5PREVcIjogMzksIFwiTk9ERV9MXCI6IDQwLCBcIk5PREVfUlwiOiA0MSwgXCJSQlJBQ0VcIjogNDIsIFwiZGlhZ3JhbVN0YXRlbWVudFwiOiA0MywgXCJQRVJTT05cIjogNDQsIFwiUEVSU09OX0VYVFwiOiA0NSwgXCJTWVNURU1cIjogNDYsIFwiU1lTVEVNX0RCXCI6IDQ3LCBcIlNZU1RFTV9RVUVVRVwiOiA0OCwgXCJTWVNURU1fRVhUXCI6IDQ5LCBcIlNZU1RFTV9FWFRfREJcIjogNTAsIFwiU1lTVEVNX0VYVF9RVUVVRVwiOiA1MSwgXCJDT05UQUlORVJcIjogNTIsIFwiQ09OVEFJTkVSX0RCXCI6IDUzLCBcIkNPTlRBSU5FUl9RVUVVRVwiOiA1NCwgXCJDT05UQUlORVJfRVhUXCI6IDU1LCBcIkNPTlRBSU5FUl9FWFRfREJcIjogNTYsIFwiQ09OVEFJTkVSX0VYVF9RVUVVRVwiOiA1NywgXCJDT01QT05FTlRcIjogNTgsIFwiQ09NUE9ORU5UX0RCXCI6IDU5LCBcIkNPTVBPTkVOVF9RVUVVRVwiOiA2MCwgXCJDT01QT05FTlRfRVhUXCI6IDYxLCBcIkNPTVBPTkVOVF9FWFRfREJcIjogNjIsIFwiQ09NUE9ORU5UX0VYVF9RVUVVRVwiOiA2MywgXCJSRUxcIjogNjQsIFwiQklSRUxcIjogNjUsIFwiUkVMX1VcIjogNjYsIFwiUkVMX0RcIjogNjcsIFwiUkVMX0xcIjogNjgsIFwiUkVMX1JcIjogNjksIFwiUkVMX0JcIjogNzAsIFwiUkVMX0lOREVYXCI6IDcxLCBcIlVQREFURV9FTF9TVFlMRVwiOiA3MiwgXCJVUERBVEVfUkVMX1NUWUxFXCI6IDczLCBcIlVQREFURV9MQVlPVVRfQ09ORklHXCI6IDc0LCBcImF0dHJpYnV0ZVwiOiA3NSwgXCJTVFJcIjogNzYsIFwiU1RSX0tFWVwiOiA3NywgXCJTVFJfVkFMVUVcIjogNzgsIFwiQVRUUklCVVRFXCI6IDc5LCBcIkFUVFJJQlVURV9FTVBUWVwiOiA4MCwgXCIkYWNjZXB0XCI6IDAsIFwiJGVuZFwiOiAxIH0sXG4gICAgdGVybWluYWxzXzogeyAyOiBcImVycm9yXCIsIDY6IFwiZGlyZWN0aW9uX3RiXCIsIDc6IFwiZGlyZWN0aW9uX2J0XCIsIDg6IFwiZGlyZWN0aW9uX3JsXCIsIDk6IFwiZGlyZWN0aW9uX2xyXCIsIDExOiBcIkM0X0NPTlRFWFRcIiwgMTI6IFwiTkVXTElORVwiLCAxNDogXCJFT0ZcIiwgMTU6IFwiQzRfQ09OVEFJTkVSXCIsIDE2OiBcIkM0X0NPTVBPTkVOVFwiLCAxNzogXCJDNF9EWU5BTUlDXCIsIDE4OiBcIkM0X0RFUExPWU1FTlRcIiwgMjI6IFwidGl0bGVcIiwgMjM6IFwiYWNjRGVzY3JpcHRpb25cIiwgMjQ6IFwiYWNjX3RpdGxlXCIsIDI1OiBcImFjY190aXRsZV92YWx1ZVwiLCAyNjogXCJhY2NfZGVzY3JcIiwgMjc6IFwiYWNjX2Rlc2NyX3ZhbHVlXCIsIDI4OiBcImFjY19kZXNjcl9tdWx0aWxpbmVfdmFsdWVcIiwgMzM6IFwiTEJSQUNFXCIsIDM0OiBcIkVOVEVSUFJJU0VfQk9VTkRBUllcIiwgMzY6IFwiU1lTVEVNX0JPVU5EQVJZXCIsIDM3OiBcIkJPVU5EQVJZXCIsIDM4OiBcIkNPTlRBSU5FUl9CT1VOREFSWVwiLCAzOTogXCJOT0RFXCIsIDQwOiBcIk5PREVfTFwiLCA0MTogXCJOT0RFX1JcIiwgNDI6IFwiUkJSQUNFXCIsIDQ0OiBcIlBFUlNPTlwiLCA0NTogXCJQRVJTT05fRVhUXCIsIDQ2OiBcIlNZU1RFTVwiLCA0NzogXCJTWVNURU1fREJcIiwgNDg6IFwiU1lTVEVNX1FVRVVFXCIsIDQ5OiBcIlNZU1RFTV9FWFRcIiwgNTA6IFwiU1lTVEVNX0VYVF9EQlwiLCA1MTogXCJTWVNURU1fRVhUX1FVRVVFXCIsIDUyOiBcIkNPTlRBSU5FUlwiLCA1MzogXCJDT05UQUlORVJfREJcIiwgNTQ6IFwiQ09OVEFJTkVSX1FVRVVFXCIsIDU1OiBcIkNPTlRBSU5FUl9FWFRcIiwgNTY6IFwiQ09OVEFJTkVSX0VYVF9EQlwiLCA1NzogXCJDT05UQUlORVJfRVhUX1FVRVVFXCIsIDU4OiBcIkNPTVBPTkVOVFwiLCA1OTogXCJDT01QT05FTlRfREJcIiwgNjA6IFwiQ09NUE9ORU5UX1FVRVVFXCIsIDYxOiBcIkNPTVBPTkVOVF9FWFRcIiwgNjI6IFwiQ09NUE9ORU5UX0VYVF9EQlwiLCA2MzogXCJDT01QT05FTlRfRVhUX1FVRVVFXCIsIDY0OiBcIlJFTFwiLCA2NTogXCJCSVJFTFwiLCA2NjogXCJSRUxfVVwiLCA2NzogXCJSRUxfRFwiLCA2ODogXCJSRUxfTFwiLCA2OTogXCJSRUxfUlwiLCA3MDogXCJSRUxfQlwiLCA3MTogXCJSRUxfSU5ERVhcIiwgNzI6IFwiVVBEQVRFX0VMX1NUWUxFXCIsIDczOiBcIlVQREFURV9SRUxfU1RZTEVcIiwgNzQ6IFwiVVBEQVRFX0xBWU9VVF9DT05GSUdcIiwgNzY6IFwiU1RSXCIsIDc3OiBcIlNUUl9LRVlcIiwgNzg6IFwiU1RSX1ZBTFVFXCIsIDc5OiBcIkFUVFJJQlVURVwiLCA4MDogXCJBVFRSSUJVVEVfRU1QVFlcIiB9LFxuICAgIHByb2R1Y3Rpb25zXzogWzAsIFszLCAxXSwgWzMsIDFdLCBbNSwgMV0sIFs1LCAxXSwgWzUsIDFdLCBbNSwgMV0sIFs0LCAxXSwgWzEwLCA0XSwgWzEwLCA0XSwgWzEwLCA0XSwgWzEwLCA0XSwgWzEwLCA0XSwgWzEzLCAxXSwgWzEzLCAxXSwgWzEzLCAyXSwgWzE5LCAxXSwgWzE5LCAyXSwgWzE5LCAzXSwgWzIxLCAxXSwgWzIxLCAxXSwgWzIxLCAyXSwgWzIxLCAyXSwgWzIxLCAxXSwgWzI5LCAzXSwgWzMwLCAzXSwgWzMwLCAzXSwgWzMwLCA0XSwgWzMyLCAyXSwgWzMyLCAyXSwgWzMyLCAyXSwgWzMyLCAyXSwgWzMyLCAyXSwgWzMyLCAyXSwgWzMyLCAyXSwgWzMxLCAxXSwgWzIwLCAxXSwgWzIwLCAyXSwgWzIwLCAzXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAxXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzQzLCAyXSwgWzM1LCAxXSwgWzM1LCAyXSwgWzc1LCAxXSwgWzc1LCAyXSwgWzc1LCAxXSwgWzc1LCAxXV0sXG4gICAgcGVyZm9ybUFjdGlvbjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBhbm9ueW1vdXMoeXl0ZXh0LCB5eWxlbmcsIHl5bGluZW5vLCB5eSwgeXlzdGF0ZSwgJCQsIF8kKSB7XG4gICAgICB2YXIgJDAgPSAkJC5sZW5ndGggLSAxO1xuICAgICAgc3dpdGNoICh5eXN0YXRlKSB7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICB5eS5zZXREaXJlY3Rpb24oXCJUQlwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHl5LnNldERpcmVjdGlvbihcIkJUXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgeXkuc2V0RGlyZWN0aW9uKFwiUkxcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgICB5eS5zZXREaXJlY3Rpb24oXCJMUlwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA4OlxuICAgICAgICBjYXNlIDk6XG4gICAgICAgIGNhc2UgMTA6XG4gICAgICAgIGNhc2UgMTE6XG4gICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgeXkuc2V0QzRUeXBlKCQkWyQwIC0gM10pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE5OlxuICAgICAgICAgIHl5LnNldFRpdGxlKCQkWyQwXS5zdWJzdHJpbmcoNikpO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS5zdWJzdHJpbmcoNik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgeXkuc2V0QWNjRGVzY3JpcHRpb24oJCRbJDBdLnN1YnN0cmluZygxNSkpO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS5zdWJzdHJpbmcoMTUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDIxOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS50cmltKCk7XG4gICAgICAgICAgeXkuc2V0VGl0bGUodGhpcy4kKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyMjpcbiAgICAgICAgY2FzZSAyMzpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF0udHJpbSgpO1xuICAgICAgICAgIHl5LnNldEFjY0Rlc2NyaXB0aW9uKHRoaXMuJCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjg6XG4gICAgICAgICAgJCRbJDBdLnNwbGljZSgyLCAwLCBcIkVOVEVSUFJJU0VcIik7XG4gICAgICAgICAgeXkuYWRkUGVyc29uT3JTeXN0ZW1Cb3VuZGFyeSguLi4kJFskMF0pO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOTpcbiAgICAgICAgICAkJFskMF0uc3BsaWNlKDIsIDAsIFwiU1lTVEVNXCIpO1xuICAgICAgICAgIHl5LmFkZFBlcnNvbk9yU3lzdGVtQm91bmRhcnkoLi4uJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzA6XG4gICAgICAgICAgeXkuYWRkUGVyc29uT3JTeXN0ZW1Cb3VuZGFyeSguLi4kJFskMF0pO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzMTpcbiAgICAgICAgICAkJFskMF0uc3BsaWNlKDIsIDAsIFwiQ09OVEFJTkVSXCIpO1xuICAgICAgICAgIHl5LmFkZENvbnRhaW5lckJvdW5kYXJ5KC4uLiQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMyOlxuICAgICAgICAgIHl5LmFkZERlcGxveW1lbnROb2RlKFwibm9kZVwiLCAuLi4kJFskMF0pO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzMzpcbiAgICAgICAgICB5eS5hZGREZXBsb3ltZW50Tm9kZShcIm5vZGVMXCIsIC4uLiQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM0OlxuICAgICAgICAgIHl5LmFkZERlcGxveW1lbnROb2RlKFwibm9kZVJcIiwgLi4uJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzU6XG4gICAgICAgICAgeXkucG9wQm91bmRhcnlQYXJzZVN0YWNrKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzk6XG4gICAgICAgICAgeXkuYWRkUGVyc29uT3JTeXN0ZW0oXCJwZXJzb25cIiwgLi4uJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgeXkuYWRkUGVyc29uT3JTeXN0ZW0oXCJleHRlcm5hbF9wZXJzb25cIiwgLi4uJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDE6XG4gICAgICAgICAgeXkuYWRkUGVyc29uT3JTeXN0ZW0oXCJzeXN0ZW1cIiwgLi4uJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDI6XG4gICAgICAgICAgeXkuYWRkUGVyc29uT3JTeXN0ZW0oXCJzeXN0ZW1fZGJcIiwgLi4uJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDM6XG4gICAgICAgICAgeXkuYWRkUGVyc29uT3JTeXN0ZW0oXCJzeXN0ZW1fcXVldWVcIiwgLi4uJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDQ6XG4gICAgICAgICAgeXkuYWRkUGVyc29uT3JTeXN0ZW0oXCJleHRlcm5hbF9zeXN0ZW1cIiwgLi4uJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDU6XG4gICAgICAgICAgeXkuYWRkUGVyc29uT3JTeXN0ZW0oXCJleHRlcm5hbF9zeXN0ZW1fZGJcIiwgLi4uJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDY6XG4gICAgICAgICAgeXkuYWRkUGVyc29uT3JTeXN0ZW0oXCJleHRlcm5hbF9zeXN0ZW1fcXVldWVcIiwgLi4uJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDc6XG4gICAgICAgICAgeXkuYWRkQ29udGFpbmVyKFwiY29udGFpbmVyXCIsIC4uLiQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ4OlxuICAgICAgICAgIHl5LmFkZENvbnRhaW5lcihcImNvbnRhaW5lcl9kYlwiLCAuLi4kJFskMF0pO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OTpcbiAgICAgICAgICB5eS5hZGRDb250YWluZXIoXCJjb250YWluZXJfcXVldWVcIiwgLi4uJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTA6XG4gICAgICAgICAgeXkuYWRkQ29udGFpbmVyKFwiZXh0ZXJuYWxfY29udGFpbmVyXCIsIC4uLiQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDUxOlxuICAgICAgICAgIHl5LmFkZENvbnRhaW5lcihcImV4dGVybmFsX2NvbnRhaW5lcl9kYlwiLCAuLi4kJFskMF0pO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1MjpcbiAgICAgICAgICB5eS5hZGRDb250YWluZXIoXCJleHRlcm5hbF9jb250YWluZXJfcXVldWVcIiwgLi4uJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTM6XG4gICAgICAgICAgeXkuYWRkQ29tcG9uZW50KFwiY29tcG9uZW50XCIsIC4uLiQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU0OlxuICAgICAgICAgIHl5LmFkZENvbXBvbmVudChcImNvbXBvbmVudF9kYlwiLCAuLi4kJFskMF0pO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1NTpcbiAgICAgICAgICB5eS5hZGRDb21wb25lbnQoXCJjb21wb25lbnRfcXVldWVcIiwgLi4uJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTY6XG4gICAgICAgICAgeXkuYWRkQ29tcG9uZW50KFwiZXh0ZXJuYWxfY29tcG9uZW50XCIsIC4uLiQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU3OlxuICAgICAgICAgIHl5LmFkZENvbXBvbmVudChcImV4dGVybmFsX2NvbXBvbmVudF9kYlwiLCAuLi4kJFskMF0pO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1ODpcbiAgICAgICAgICB5eS5hZGRDb21wb25lbnQoXCJleHRlcm5hbF9jb21wb25lbnRfcXVldWVcIiwgLi4uJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjA6XG4gICAgICAgICAgeXkuYWRkUmVsKFwicmVsXCIsIC4uLiQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDYxOlxuICAgICAgICAgIHl5LmFkZFJlbChcImJpcmVsXCIsIC4uLiQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDYyOlxuICAgICAgICAgIHl5LmFkZFJlbChcInJlbF91XCIsIC4uLiQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDYzOlxuICAgICAgICAgIHl5LmFkZFJlbChcInJlbF9kXCIsIC4uLiQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY0OlxuICAgICAgICAgIHl5LmFkZFJlbChcInJlbF9sXCIsIC4uLiQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY1OlxuICAgICAgICAgIHl5LmFkZFJlbChcInJlbF9yXCIsIC4uLiQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY2OlxuICAgICAgICAgIHl5LmFkZFJlbChcInJlbF9iXCIsIC4uLiQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY3OlxuICAgICAgICAgICQkWyQwXS5zcGxpY2UoMCwgMSk7XG4gICAgICAgICAgeXkuYWRkUmVsKFwicmVsXCIsIC4uLiQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY4OlxuICAgICAgICAgIHl5LnVwZGF0ZUVsU3R5bGUoXCJ1cGRhdGVfZWxfc3R5bGVcIiwgLi4uJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjk6XG4gICAgICAgICAgeXkudXBkYXRlUmVsU3R5bGUoXCJ1cGRhdGVfcmVsX3N0eWxlXCIsIC4uLiQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDcwOlxuICAgICAgICAgIHl5LnVwZGF0ZUxheW91dENvbmZpZyhcInVwZGF0ZV9sYXlvdXRfY29uZmlnXCIsIC4uLiQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDcxOlxuICAgICAgICAgIHRoaXMuJCA9IFskJFskMF1dO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDcyOlxuICAgICAgICAgICQkWyQwXS51bnNoaWZ0KCQkWyQwIC0gMV0pO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA3MzpcbiAgICAgICAgY2FzZSA3NTpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF0udHJpbSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc0OlxuICAgICAgICAgIGxldCBrdiA9IHt9O1xuICAgICAgICAgIGt2WyQkWyQwIC0gMV0udHJpbSgpXSA9ICQkWyQwXS50cmltKCk7XG4gICAgICAgICAgdGhpcy4kID0ga3Y7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzY6XG4gICAgICAgICAgdGhpcy4kID0gXCJcIjtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9LCBcImFub255bW91c1wiKSxcbiAgICB0YWJsZTogW3sgMzogMSwgNDogMiwgNTogMywgNjogWzEsIDVdLCA3OiBbMSwgNl0sIDg6IFsxLCA3XSwgOTogWzEsIDhdLCAxMDogNCwgMTE6IFsxLCA5XSwgMTU6IFsxLCAxMF0sIDE2OiBbMSwgMTFdLCAxNzogWzEsIDEyXSwgMTg6IFsxLCAxM10gfSwgeyAxOiBbM10gfSwgeyAxOiBbMiwgMV0gfSwgeyAxOiBbMiwgMl0gfSwgeyAxOiBbMiwgN10gfSwgeyAxOiBbMiwgM10gfSwgeyAxOiBbMiwgNF0gfSwgeyAxOiBbMiwgNV0gfSwgeyAxOiBbMiwgNl0gfSwgeyAxMjogWzEsIDE0XSB9LCB7IDEyOiBbMSwgMTVdIH0sIHsgMTI6IFsxLCAxNl0gfSwgeyAxMjogWzEsIDE3XSB9LCB7IDEyOiBbMSwgMThdIH0sIHsgMTM6IDE5LCAxOTogMjAsIDIwOiAyMSwgMjE6IDIyLCAyMjogJFYwLCAyMzogJFYxLCAyNDogJFYyLCAyNjogJFYzLCAyODogJFY0LCAyOTogNDksIDMwOiA2MSwgMzI6IDYyLCAzNDogJFY1LCAzNjogJFY2LCAzNzogJFY3LCAzODogJFY4LCAzOTogJFY5LCA0MDogJFZhLCA0MTogJFZiLCA0MzogMjMsIDQ0OiAkVmMsIDQ1OiAkVmQsIDQ2OiAkVmUsIDQ3OiAkVmYsIDQ4OiAkVmcsIDQ5OiAkVmgsIDUwOiAkVmksIDUxOiAkVmosIDUyOiAkVmssIDUzOiAkVmwsIDU0OiAkVm0sIDU1OiAkVm4sIDU2OiAkVm8sIDU3OiAkVnAsIDU4OiAkVnEsIDU5OiAkVnIsIDYwOiAkVnMsIDYxOiAkVnQsIDYyOiAkVnUsIDYzOiAkVnYsIDY0OiAkVncsIDY1OiAkVngsIDY2OiAkVnksIDY3OiAkVnosIDY4OiAkVkEsIDY5OiAkVkIsIDcwOiAkVkMsIDcxOiAkVkQsIDcyOiAkVkUsIDczOiAkVkYsIDc0OiAkVkcgfSwgeyAxMzogNzAsIDE5OiAyMCwgMjA6IDIxLCAyMTogMjIsIDIyOiAkVjAsIDIzOiAkVjEsIDI0OiAkVjIsIDI2OiAkVjMsIDI4OiAkVjQsIDI5OiA0OSwgMzA6IDYxLCAzMjogNjIsIDM0OiAkVjUsIDM2OiAkVjYsIDM3OiAkVjcsIDM4OiAkVjgsIDM5OiAkVjksIDQwOiAkVmEsIDQxOiAkVmIsIDQzOiAyMywgNDQ6ICRWYywgNDU6ICRWZCwgNDY6ICRWZSwgNDc6ICRWZiwgNDg6ICRWZywgNDk6ICRWaCwgNTA6ICRWaSwgNTE6ICRWaiwgNTI6ICRWaywgNTM6ICRWbCwgNTQ6ICRWbSwgNTU6ICRWbiwgNTY6ICRWbywgNTc6ICRWcCwgNTg6ICRWcSwgNTk6ICRWciwgNjA6ICRWcywgNjE6ICRWdCwgNjI6ICRWdSwgNjM6ICRWdiwgNjQ6ICRWdywgNjU6ICRWeCwgNjY6ICRWeSwgNjc6ICRWeiwgNjg6ICRWQSwgNjk6ICRWQiwgNzA6ICRWQywgNzE6ICRWRCwgNzI6ICRWRSwgNzM6ICRWRiwgNzQ6ICRWRyB9LCB7IDEzOiA3MSwgMTk6IDIwLCAyMDogMjEsIDIxOiAyMiwgMjI6ICRWMCwgMjM6ICRWMSwgMjQ6ICRWMiwgMjY6ICRWMywgMjg6ICRWNCwgMjk6IDQ5LCAzMDogNjEsIDMyOiA2MiwgMzQ6ICRWNSwgMzY6ICRWNiwgMzc6ICRWNywgMzg6ICRWOCwgMzk6ICRWOSwgNDA6ICRWYSwgNDE6ICRWYiwgNDM6IDIzLCA0NDogJFZjLCA0NTogJFZkLCA0NjogJFZlLCA0NzogJFZmLCA0ODogJFZnLCA0OTogJFZoLCA1MDogJFZpLCA1MTogJFZqLCA1MjogJFZrLCA1MzogJFZsLCA1NDogJFZtLCA1NTogJFZuLCA1NjogJFZvLCA1NzogJFZwLCA1ODogJFZxLCA1OTogJFZyLCA2MDogJFZzLCA2MTogJFZ0LCA2MjogJFZ1LCA2MzogJFZ2LCA2NDogJFZ3LCA2NTogJFZ4LCA2NjogJFZ5LCA2NzogJFZ6LCA2ODogJFZBLCA2OTogJFZCLCA3MDogJFZDLCA3MTogJFZELCA3MjogJFZFLCA3MzogJFZGLCA3NDogJFZHIH0sIHsgMTM6IDcyLCAxOTogMjAsIDIwOiAyMSwgMjE6IDIyLCAyMjogJFYwLCAyMzogJFYxLCAyNDogJFYyLCAyNjogJFYzLCAyODogJFY0LCAyOTogNDksIDMwOiA2MSwgMzI6IDYyLCAzNDogJFY1LCAzNjogJFY2LCAzNzogJFY3LCAzODogJFY4LCAzOTogJFY5LCA0MDogJFZhLCA0MTogJFZiLCA0MzogMjMsIDQ0OiAkVmMsIDQ1OiAkVmQsIDQ2OiAkVmUsIDQ3OiAkVmYsIDQ4OiAkVmcsIDQ5OiAkVmgsIDUwOiAkVmksIDUxOiAkVmosIDUyOiAkVmssIDUzOiAkVmwsIDU0OiAkVm0sIDU1OiAkVm4sIDU2OiAkVm8sIDU3OiAkVnAsIDU4OiAkVnEsIDU5OiAkVnIsIDYwOiAkVnMsIDYxOiAkVnQsIDYyOiAkVnUsIDYzOiAkVnYsIDY0OiAkVncsIDY1OiAkVngsIDY2OiAkVnksIDY3OiAkVnosIDY4OiAkVkEsIDY5OiAkVkIsIDcwOiAkVkMsIDcxOiAkVkQsIDcyOiAkVkUsIDczOiAkVkYsIDc0OiAkVkcgfSwgeyAxMzogNzMsIDE5OiAyMCwgMjA6IDIxLCAyMTogMjIsIDIyOiAkVjAsIDIzOiAkVjEsIDI0OiAkVjIsIDI2OiAkVjMsIDI4OiAkVjQsIDI5OiA0OSwgMzA6IDYxLCAzMjogNjIsIDM0OiAkVjUsIDM2OiAkVjYsIDM3OiAkVjcsIDM4OiAkVjgsIDM5OiAkVjksIDQwOiAkVmEsIDQxOiAkVmIsIDQzOiAyMywgNDQ6ICRWYywgNDU6ICRWZCwgNDY6ICRWZSwgNDc6ICRWZiwgNDg6ICRWZywgNDk6ICRWaCwgNTA6ICRWaSwgNTE6ICRWaiwgNTI6ICRWaywgNTM6ICRWbCwgNTQ6ICRWbSwgNTU6ICRWbiwgNTY6ICRWbywgNTc6ICRWcCwgNTg6ICRWcSwgNTk6ICRWciwgNjA6ICRWcywgNjE6ICRWdCwgNjI6ICRWdSwgNjM6ICRWdiwgNjQ6ICRWdywgNjU6ICRWeCwgNjY6ICRWeSwgNjc6ICRWeiwgNjg6ICRWQSwgNjk6ICRWQiwgNzA6ICRWQywgNzE6ICRWRCwgNzI6ICRWRSwgNzM6ICRWRiwgNzQ6ICRWRyB9LCB7IDE0OiBbMSwgNzRdIH0sIG8oJFZILCBbMiwgMTNdLCB7IDQzOiAyMywgMjk6IDQ5LCAzMDogNjEsIDMyOiA2MiwgMjA6IDc1LCAzNDogJFY1LCAzNjogJFY2LCAzNzogJFY3LCAzODogJFY4LCAzOTogJFY5LCA0MDogJFZhLCA0MTogJFZiLCA0NDogJFZjLCA0NTogJFZkLCA0NjogJFZlLCA0NzogJFZmLCA0ODogJFZnLCA0OTogJFZoLCA1MDogJFZpLCA1MTogJFZqLCA1MjogJFZrLCA1MzogJFZsLCA1NDogJFZtLCA1NTogJFZuLCA1NjogJFZvLCA1NzogJFZwLCA1ODogJFZxLCA1OTogJFZyLCA2MDogJFZzLCA2MTogJFZ0LCA2MjogJFZ1LCA2MzogJFZ2LCA2NDogJFZ3LCA2NTogJFZ4LCA2NjogJFZ5LCA2NzogJFZ6LCA2ODogJFZBLCA2OTogJFZCLCA3MDogJFZDLCA3MTogJFZELCA3MjogJFZFLCA3MzogJFZGLCA3NDogJFZHIH0pLCBvKCRWSCwgWzIsIDE0XSksIG8oJFZJLCBbMiwgMTZdLCB7IDEyOiBbMSwgNzZdIH0pLCBvKCRWSCwgWzIsIDM2XSwgeyAxMjogWzEsIDc3XSB9KSwgbygkVkosIFsyLCAxOV0pLCBvKCRWSiwgWzIsIDIwXSksIHsgMjU6IFsxLCA3OF0gfSwgeyAyNzogWzEsIDc5XSB9LCBvKCRWSiwgWzIsIDIzXSksIHsgMzU6IDgwLCA3NTogODEsIDc2OiAkVkssIDc3OiAkVkwsIDc5OiAkVk0sIDgwOiAkVk4gfSwgeyAzNTogODYsIDc1OiA4MSwgNzY6ICRWSywgNzc6ICRWTCwgNzk6ICRWTSwgODA6ICRWTiB9LCB7IDM1OiA4NywgNzU6IDgxLCA3NjogJFZLLCA3NzogJFZMLCA3OTogJFZNLCA4MDogJFZOIH0sIHsgMzU6IDg4LCA3NTogODEsIDc2OiAkVkssIDc3OiAkVkwsIDc5OiAkVk0sIDgwOiAkVk4gfSwgeyAzNTogODksIDc1OiA4MSwgNzY6ICRWSywgNzc6ICRWTCwgNzk6ICRWTSwgODA6ICRWTiB9LCB7IDM1OiA5MCwgNzU6IDgxLCA3NjogJFZLLCA3NzogJFZMLCA3OTogJFZNLCA4MDogJFZOIH0sIHsgMzU6IDkxLCA3NTogODEsIDc2OiAkVkssIDc3OiAkVkwsIDc5OiAkVk0sIDgwOiAkVk4gfSwgeyAzNTogOTIsIDc1OiA4MSwgNzY6ICRWSywgNzc6ICRWTCwgNzk6ICRWTSwgODA6ICRWTiB9LCB7IDM1OiA5MywgNzU6IDgxLCA3NjogJFZLLCA3NzogJFZMLCA3OTogJFZNLCA4MDogJFZOIH0sIHsgMzU6IDk0LCA3NTogODEsIDc2OiAkVkssIDc3OiAkVkwsIDc5OiAkVk0sIDgwOiAkVk4gfSwgeyAzNTogOTUsIDc1OiA4MSwgNzY6ICRWSywgNzc6ICRWTCwgNzk6ICRWTSwgODA6ICRWTiB9LCB7IDM1OiA5NiwgNzU6IDgxLCA3NjogJFZLLCA3NzogJFZMLCA3OTogJFZNLCA4MDogJFZOIH0sIHsgMzU6IDk3LCA3NTogODEsIDc2OiAkVkssIDc3OiAkVkwsIDc5OiAkVk0sIDgwOiAkVk4gfSwgeyAzNTogOTgsIDc1OiA4MSwgNzY6ICRWSywgNzc6ICRWTCwgNzk6ICRWTSwgODA6ICRWTiB9LCB7IDM1OiA5OSwgNzU6IDgxLCA3NjogJFZLLCA3NzogJFZMLCA3OTogJFZNLCA4MDogJFZOIH0sIHsgMzU6IDEwMCwgNzU6IDgxLCA3NjogJFZLLCA3NzogJFZMLCA3OTogJFZNLCA4MDogJFZOIH0sIHsgMzU6IDEwMSwgNzU6IDgxLCA3NjogJFZLLCA3NzogJFZMLCA3OTogJFZNLCA4MDogJFZOIH0sIHsgMzU6IDEwMiwgNzU6IDgxLCA3NjogJFZLLCA3NzogJFZMLCA3OTogJFZNLCA4MDogJFZOIH0sIHsgMzU6IDEwMywgNzU6IDgxLCA3NjogJFZLLCA3NzogJFZMLCA3OTogJFZNLCA4MDogJFZOIH0sIHsgMzU6IDEwNCwgNzU6IDgxLCA3NjogJFZLLCA3NzogJFZMLCA3OTogJFZNLCA4MDogJFZOIH0sIG8oJFZPLCBbMiwgNTldKSwgeyAzNTogMTA1LCA3NTogODEsIDc2OiAkVkssIDc3OiAkVkwsIDc5OiAkVk0sIDgwOiAkVk4gfSwgeyAzNTogMTA2LCA3NTogODEsIDc2OiAkVkssIDc3OiAkVkwsIDc5OiAkVk0sIDgwOiAkVk4gfSwgeyAzNTogMTA3LCA3NTogODEsIDc2OiAkVkssIDc3OiAkVkwsIDc5OiAkVk0sIDgwOiAkVk4gfSwgeyAzNTogMTA4LCA3NTogODEsIDc2OiAkVkssIDc3OiAkVkwsIDc5OiAkVk0sIDgwOiAkVk4gfSwgeyAzNTogMTA5LCA3NTogODEsIDc2OiAkVkssIDc3OiAkVkwsIDc5OiAkVk0sIDgwOiAkVk4gfSwgeyAzNTogMTEwLCA3NTogODEsIDc2OiAkVkssIDc3OiAkVkwsIDc5OiAkVk0sIDgwOiAkVk4gfSwgeyAzNTogMTExLCA3NTogODEsIDc2OiAkVkssIDc3OiAkVkwsIDc5OiAkVk0sIDgwOiAkVk4gfSwgeyAzNTogMTEyLCA3NTogODEsIDc2OiAkVkssIDc3OiAkVkwsIDc5OiAkVk0sIDgwOiAkVk4gfSwgeyAzNTogMTEzLCA3NTogODEsIDc2OiAkVkssIDc3OiAkVkwsIDc5OiAkVk0sIDgwOiAkVk4gfSwgeyAzNTogMTE0LCA3NTogODEsIDc2OiAkVkssIDc3OiAkVkwsIDc5OiAkVk0sIDgwOiAkVk4gfSwgeyAzNTogMTE1LCA3NTogODEsIDc2OiAkVkssIDc3OiAkVkwsIDc5OiAkVk0sIDgwOiAkVk4gfSwgeyAyMDogMTE2LCAyOTogNDksIDMwOiA2MSwgMzI6IDYyLCAzNDogJFY1LCAzNjogJFY2LCAzNzogJFY3LCAzODogJFY4LCAzOTogJFY5LCA0MDogJFZhLCA0MTogJFZiLCA0MzogMjMsIDQ0OiAkVmMsIDQ1OiAkVmQsIDQ2OiAkVmUsIDQ3OiAkVmYsIDQ4OiAkVmcsIDQ5OiAkVmgsIDUwOiAkVmksIDUxOiAkVmosIDUyOiAkVmssIDUzOiAkVmwsIDU0OiAkVm0sIDU1OiAkVm4sIDU2OiAkVm8sIDU3OiAkVnAsIDU4OiAkVnEsIDU5OiAkVnIsIDYwOiAkVnMsIDYxOiAkVnQsIDYyOiAkVnUsIDYzOiAkVnYsIDY0OiAkVncsIDY1OiAkVngsIDY2OiAkVnksIDY3OiAkVnosIDY4OiAkVkEsIDY5OiAkVkIsIDcwOiAkVkMsIDcxOiAkVkQsIDcyOiAkVkUsIDczOiAkVkYsIDc0OiAkVkcgfSwgeyAxMjogWzEsIDExOF0sIDMzOiBbMSwgMTE3XSB9LCB7IDM1OiAxMTksIDc1OiA4MSwgNzY6ICRWSywgNzc6ICRWTCwgNzk6ICRWTSwgODA6ICRWTiB9LCB7IDM1OiAxMjAsIDc1OiA4MSwgNzY6ICRWSywgNzc6ICRWTCwgNzk6ICRWTSwgODA6ICRWTiB9LCB7IDM1OiAxMjEsIDc1OiA4MSwgNzY6ICRWSywgNzc6ICRWTCwgNzk6ICRWTSwgODA6ICRWTiB9LCB7IDM1OiAxMjIsIDc1OiA4MSwgNzY6ICRWSywgNzc6ICRWTCwgNzk6ICRWTSwgODA6ICRWTiB9LCB7IDM1OiAxMjMsIDc1OiA4MSwgNzY6ICRWSywgNzc6ICRWTCwgNzk6ICRWTSwgODA6ICRWTiB9LCB7IDM1OiAxMjQsIDc1OiA4MSwgNzY6ICRWSywgNzc6ICRWTCwgNzk6ICRWTSwgODA6ICRWTiB9LCB7IDM1OiAxMjUsIDc1OiA4MSwgNzY6ICRWSywgNzc6ICRWTCwgNzk6ICRWTSwgODA6ICRWTiB9LCB7IDE0OiBbMSwgMTI2XSB9LCB7IDE0OiBbMSwgMTI3XSB9LCB7IDE0OiBbMSwgMTI4XSB9LCB7IDE0OiBbMSwgMTI5XSB9LCB7IDE6IFsyLCA4XSB9LCBvKCRWSCwgWzIsIDE1XSksIG8oJFZJLCBbMiwgMTddLCB7IDIxOiAyMiwgMTk6IDEzMCwgMjI6ICRWMCwgMjM6ICRWMSwgMjQ6ICRWMiwgMjY6ICRWMywgMjg6ICRWNCB9KSwgbygkVkgsIFsyLCAzN10sIHsgMTk6IDIwLCAyMDogMjEsIDIxOiAyMiwgNDM6IDIzLCAyOTogNDksIDMwOiA2MSwgMzI6IDYyLCAxMzogMTMxLCAyMjogJFYwLCAyMzogJFYxLCAyNDogJFYyLCAyNjogJFYzLCAyODogJFY0LCAzNDogJFY1LCAzNjogJFY2LCAzNzogJFY3LCAzODogJFY4LCAzOTogJFY5LCA0MDogJFZhLCA0MTogJFZiLCA0NDogJFZjLCA0NTogJFZkLCA0NjogJFZlLCA0NzogJFZmLCA0ODogJFZnLCA0OTogJFZoLCA1MDogJFZpLCA1MTogJFZqLCA1MjogJFZrLCA1MzogJFZsLCA1NDogJFZtLCA1NTogJFZuLCA1NjogJFZvLCA1NzogJFZwLCA1ODogJFZxLCA1OTogJFZyLCA2MDogJFZzLCA2MTogJFZ0LCA2MjogJFZ1LCA2MzogJFZ2LCA2NDogJFZ3LCA2NTogJFZ4LCA2NjogJFZ5LCA2NzogJFZ6LCA2ODogJFZBLCA2OTogJFZCLCA3MDogJFZDLCA3MTogJFZELCA3MjogJFZFLCA3MzogJFZGLCA3NDogJFZHIH0pLCBvKCRWSiwgWzIsIDIxXSksIG8oJFZKLCBbMiwgMjJdKSwgbygkVk8sIFsyLCAzOV0pLCBvKCRWUCwgWzIsIDcxXSwgeyA3NTogODEsIDM1OiAxMzIsIDc2OiAkVkssIDc3OiAkVkwsIDc5OiAkVk0sIDgwOiAkVk4gfSksIG8oJFZRLCBbMiwgNzNdKSwgeyA3ODogWzEsIDEzM10gfSwgbygkVlEsIFsyLCA3NV0pLCBvKCRWUSwgWzIsIDc2XSksIG8oJFZPLCBbMiwgNDBdKSwgbygkVk8sIFsyLCA0MV0pLCBvKCRWTywgWzIsIDQyXSksIG8oJFZPLCBbMiwgNDNdKSwgbygkVk8sIFsyLCA0NF0pLCBvKCRWTywgWzIsIDQ1XSksIG8oJFZPLCBbMiwgNDZdKSwgbygkVk8sIFsyLCA0N10pLCBvKCRWTywgWzIsIDQ4XSksIG8oJFZPLCBbMiwgNDldKSwgbygkVk8sIFsyLCA1MF0pLCBvKCRWTywgWzIsIDUxXSksIG8oJFZPLCBbMiwgNTJdKSwgbygkVk8sIFsyLCA1M10pLCBvKCRWTywgWzIsIDU0XSksIG8oJFZPLCBbMiwgNTVdKSwgbygkVk8sIFsyLCA1Nl0pLCBvKCRWTywgWzIsIDU3XSksIG8oJFZPLCBbMiwgNThdKSwgbygkVk8sIFsyLCA2MF0pLCBvKCRWTywgWzIsIDYxXSksIG8oJFZPLCBbMiwgNjJdKSwgbygkVk8sIFsyLCA2M10pLCBvKCRWTywgWzIsIDY0XSksIG8oJFZPLCBbMiwgNjVdKSwgbygkVk8sIFsyLCA2Nl0pLCBvKCRWTywgWzIsIDY3XSksIG8oJFZPLCBbMiwgNjhdKSwgbygkVk8sIFsyLCA2OV0pLCBvKCRWTywgWzIsIDcwXSksIHsgMzE6IDEzNCwgNDI6IFsxLCAxMzVdIH0sIHsgMTI6IFsxLCAxMzZdIH0sIHsgMzM6IFsxLCAxMzddIH0sIG8oJFZSLCBbMiwgMjhdKSwgbygkVlIsIFsyLCAyOV0pLCBvKCRWUiwgWzIsIDMwXSksIG8oJFZSLCBbMiwgMzFdKSwgbygkVlIsIFsyLCAzMl0pLCBvKCRWUiwgWzIsIDMzXSksIG8oJFZSLCBbMiwgMzRdKSwgeyAxOiBbMiwgOV0gfSwgeyAxOiBbMiwgMTBdIH0sIHsgMTogWzIsIDExXSB9LCB7IDE6IFsyLCAxMl0gfSwgbygkVkksIFsyLCAxOF0pLCBvKCRWSCwgWzIsIDM4XSksIG8oJFZQLCBbMiwgNzJdKSwgbygkVlEsIFsyLCA3NF0pLCBvKCRWTywgWzIsIDI0XSksIG8oJFZPLCBbMiwgMzVdKSwgbygkVlMsIFsyLCAyNV0pLCBvKCRWUywgWzIsIDI2XSwgeyAxMjogWzEsIDEzOF0gfSksIG8oJFZTLCBbMiwgMjddKV0sXG4gICAgZGVmYXVsdEFjdGlvbnM6IHsgMjogWzIsIDFdLCAzOiBbMiwgMl0sIDQ6IFsyLCA3XSwgNTogWzIsIDNdLCA2OiBbMiwgNF0sIDc6IFsyLCA1XSwgODogWzIsIDZdLCA3NDogWzIsIDhdLCAxMjY6IFsyLCA5XSwgMTI3OiBbMiwgMTBdLCAxMjg6IFsyLCAxMV0sIDEyOTogWzIsIDEyXSB9LFxuICAgIHBhcnNlRXJyb3I6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcGFyc2VFcnJvcihzdHIsIGhhc2gpIHtcbiAgICAgIGlmIChoYXNoLnJlY292ZXJhYmxlKSB7XG4gICAgICAgIHRoaXMudHJhY2Uoc3RyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcihzdHIpO1xuICAgICAgICBlcnJvci5oYXNoID0gaGFzaDtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSwgXCJwYXJzZUVycm9yXCIpLFxuICAgIHBhcnNlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBhcnNlKGlucHV0KSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsIHN0YWNrID0gWzBdLCB0c3RhY2sgPSBbXSwgdnN0YWNrID0gW251bGxdLCBsc3RhY2sgPSBbXSwgdGFibGUgPSB0aGlzLnRhYmxlLCB5eXRleHQgPSBcIlwiLCB5eWxpbmVubyA9IDAsIHl5bGVuZyA9IDAsIHJlY292ZXJpbmcgPSAwLCBURVJST1IgPSAyLCBFT0YgPSAxO1xuICAgICAgdmFyIGFyZ3MgPSBsc3RhY2suc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgdmFyIGxleGVyMiA9IE9iamVjdC5jcmVhdGUodGhpcy5sZXhlcik7XG4gICAgICB2YXIgc2hhcmVkU3RhdGUgPSB7IHl5OiB7fSB9O1xuICAgICAgZm9yICh2YXIgayBpbiB0aGlzLnl5KSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy55eSwgaykpIHtcbiAgICAgICAgICBzaGFyZWRTdGF0ZS55eVtrXSA9IHRoaXMueXlba107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxleGVyMi5zZXRJbnB1dChpbnB1dCwgc2hhcmVkU3RhdGUueXkpO1xuICAgICAgc2hhcmVkU3RhdGUueXkubGV4ZXIgPSBsZXhlcjI7XG4gICAgICBzaGFyZWRTdGF0ZS55eS5wYXJzZXIgPSB0aGlzO1xuICAgICAgaWYgKHR5cGVvZiBsZXhlcjIueXlsbG9jID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgbGV4ZXIyLnl5bGxvYyA9IHt9O1xuICAgICAgfVxuICAgICAgdmFyIHl5bG9jID0gbGV4ZXIyLnl5bGxvYztcbiAgICAgIGxzdGFjay5wdXNoKHl5bG9jKTtcbiAgICAgIHZhciByYW5nZXMgPSBsZXhlcjIub3B0aW9ucyAmJiBsZXhlcjIub3B0aW9ucy5yYW5nZXM7XG4gICAgICBpZiAodHlwZW9mIHNoYXJlZFN0YXRlLnl5LnBhcnNlRXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aGlzLnBhcnNlRXJyb3IgPSBzaGFyZWRTdGF0ZS55eS5wYXJzZUVycm9yO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wYXJzZUVycm9yID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpLnBhcnNlRXJyb3I7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBwb3BTdGFjayhuKSB7XG4gICAgICAgIHN0YWNrLmxlbmd0aCA9IHN0YWNrLmxlbmd0aCAtIDIgKiBuO1xuICAgICAgICB2c3RhY2subGVuZ3RoID0gdnN0YWNrLmxlbmd0aCAtIG47XG4gICAgICAgIGxzdGFjay5sZW5ndGggPSBsc3RhY2subGVuZ3RoIC0gbjtcbiAgICAgIH1cbiAgICAgIF9fbmFtZShwb3BTdGFjaywgXCJwb3BTdGFja1wiKTtcbiAgICAgIGZ1bmN0aW9uIGxleCgpIHtcbiAgICAgICAgdmFyIHRva2VuO1xuICAgICAgICB0b2tlbiA9IHRzdGFjay5wb3AoKSB8fCBsZXhlcjIubGV4KCkgfHwgRU9GO1xuICAgICAgICBpZiAodHlwZW9mIHRva2VuICE9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgaWYgKHRva2VuIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIHRzdGFjayA9IHRva2VuO1xuICAgICAgICAgICAgdG9rZW4gPSB0c3RhY2sucG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRva2VuID0gc2VsZi5zeW1ib2xzX1t0b2tlbl0gfHwgdG9rZW47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgfVxuICAgICAgX19uYW1lKGxleCwgXCJsZXhcIik7XG4gICAgICB2YXIgc3ltYm9sLCBwcmVFcnJvclN5bWJvbCwgc3RhdGUsIGFjdGlvbiwgYSwgciwgeXl2YWwgPSB7fSwgcCwgbGVuLCBuZXdTdGF0ZSwgZXhwZWN0ZWQ7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBzdGF0ZSA9IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAodGhpcy5kZWZhdWx0QWN0aW9uc1tzdGF0ZV0pIHtcbiAgICAgICAgICBhY3Rpb24gPSB0aGlzLmRlZmF1bHRBY3Rpb25zW3N0YXRlXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoc3ltYm9sID09PSBudWxsIHx8IHR5cGVvZiBzeW1ib2wgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgc3ltYm9sID0gbGV4KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFjdGlvbiA9IHRhYmxlW3N0YXRlXSAmJiB0YWJsZVtzdGF0ZV1bc3ltYm9sXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGFjdGlvbiA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhYWN0aW9uLmxlbmd0aCB8fCAhYWN0aW9uWzBdKSB7XG4gICAgICAgICAgdmFyIGVyclN0ciA9IFwiXCI7XG4gICAgICAgICAgZXhwZWN0ZWQgPSBbXTtcbiAgICAgICAgICBmb3IgKHAgaW4gdGFibGVbc3RhdGVdKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50ZXJtaW5hbHNfW3BdICYmIHAgPiBURVJST1IpIHtcbiAgICAgICAgICAgICAgZXhwZWN0ZWQucHVzaChcIidcIiArIHRoaXMudGVybWluYWxzX1twXSArIFwiJ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGxleGVyMi5zaG93UG9zaXRpb24pIHtcbiAgICAgICAgICAgIGVyclN0ciA9IFwiUGFyc2UgZXJyb3Igb24gbGluZSBcIiArICh5eWxpbmVubyArIDEpICsgXCI6XFxuXCIgKyBsZXhlcjIuc2hvd1Bvc2l0aW9uKCkgKyBcIlxcbkV4cGVjdGluZyBcIiArIGV4cGVjdGVkLmpvaW4oXCIsIFwiKSArIFwiLCBnb3QgJ1wiICsgKHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCkgKyBcIidcIjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyU3RyID0gXCJQYXJzZSBlcnJvciBvbiBsaW5lIFwiICsgKHl5bGluZW5vICsgMSkgKyBcIjogVW5leHBlY3RlZCBcIiArIChzeW1ib2wgPT0gRU9GID8gXCJlbmQgb2YgaW5wdXRcIiA6IFwiJ1wiICsgKHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCkgKyBcIidcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMucGFyc2VFcnJvcihlcnJTdHIsIHtcbiAgICAgICAgICAgIHRleHQ6IGxleGVyMi5tYXRjaCxcbiAgICAgICAgICAgIHRva2VuOiB0aGlzLnRlcm1pbmFsc19bc3ltYm9sXSB8fCBzeW1ib2wsXG4gICAgICAgICAgICBsaW5lOiBsZXhlcjIueXlsaW5lbm8sXG4gICAgICAgICAgICBsb2M6IHl5bG9jLFxuICAgICAgICAgICAgZXhwZWN0ZWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYWN0aW9uWzBdIGluc3RhbmNlb2YgQXJyYXkgJiYgYWN0aW9uLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZSBFcnJvcjogbXVsdGlwbGUgYWN0aW9ucyBwb3NzaWJsZSBhdCBzdGF0ZTogXCIgKyBzdGF0ZSArIFwiLCB0b2tlbjogXCIgKyBzeW1ib2wpO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAoYWN0aW9uWzBdKSB7XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgc3RhY2sucHVzaChzeW1ib2wpO1xuICAgICAgICAgICAgdnN0YWNrLnB1c2gobGV4ZXIyLnl5dGV4dCk7XG4gICAgICAgICAgICBsc3RhY2sucHVzaChsZXhlcjIueXlsbG9jKTtcbiAgICAgICAgICAgIHN0YWNrLnB1c2goYWN0aW9uWzFdKTtcbiAgICAgICAgICAgIHN5bWJvbCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoIXByZUVycm9yU3ltYm9sKSB7XG4gICAgICAgICAgICAgIHl5bGVuZyA9IGxleGVyMi55eWxlbmc7XG4gICAgICAgICAgICAgIHl5dGV4dCA9IGxleGVyMi55eXRleHQ7XG4gICAgICAgICAgICAgIHl5bGluZW5vID0gbGV4ZXIyLnl5bGluZW5vO1xuICAgICAgICAgICAgICB5eWxvYyA9IGxleGVyMi55eWxsb2M7XG4gICAgICAgICAgICAgIGlmIChyZWNvdmVyaW5nID4gMCkge1xuICAgICAgICAgICAgICAgIHJlY292ZXJpbmctLTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3ltYm9sID0gcHJlRXJyb3JTeW1ib2w7XG4gICAgICAgICAgICAgIHByZUVycm9yU3ltYm9sID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGxlbiA9IHRoaXMucHJvZHVjdGlvbnNfW2FjdGlvblsxXV1bMV07XG4gICAgICAgICAgICB5eXZhbC4kID0gdnN0YWNrW3ZzdGFjay5sZW5ndGggLSBsZW5dO1xuICAgICAgICAgICAgeXl2YWwuXyQgPSB7XG4gICAgICAgICAgICAgIGZpcnN0X2xpbmU6IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0uZmlyc3RfbGluZSxcbiAgICAgICAgICAgICAgbGFzdF9saW5lOiBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIDFdLmxhc3RfbGluZSxcbiAgICAgICAgICAgICAgZmlyc3RfY29sdW1uOiBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIChsZW4gfHwgMSldLmZpcnN0X2NvbHVtbixcbiAgICAgICAgICAgICAgbGFzdF9jb2x1bW46IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gMV0ubGFzdF9jb2x1bW5cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAocmFuZ2VzKSB7XG4gICAgICAgICAgICAgIHl5dmFsLl8kLnJhbmdlID0gW1xuICAgICAgICAgICAgICAgIGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0ucmFuZ2VbMF0sXG4gICAgICAgICAgICAgICAgbHN0YWNrW2xzdGFjay5sZW5ndGggLSAxXS5yYW5nZVsxXVxuICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgciA9IHRoaXMucGVyZm9ybUFjdGlvbi5hcHBseSh5eXZhbCwgW1xuICAgICAgICAgICAgICB5eXRleHQsXG4gICAgICAgICAgICAgIHl5bGVuZyxcbiAgICAgICAgICAgICAgeXlsaW5lbm8sXG4gICAgICAgICAgICAgIHNoYXJlZFN0YXRlLnl5LFxuICAgICAgICAgICAgICBhY3Rpb25bMV0sXG4gICAgICAgICAgICAgIHZzdGFjayxcbiAgICAgICAgICAgICAgbHN0YWNrXG4gICAgICAgICAgICBdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGVuKSB7XG4gICAgICAgICAgICAgIHN0YWNrID0gc3RhY2suc2xpY2UoMCwgLTEgKiBsZW4gKiAyKTtcbiAgICAgICAgICAgICAgdnN0YWNrID0gdnN0YWNrLnNsaWNlKDAsIC0xICogbGVuKTtcbiAgICAgICAgICAgICAgbHN0YWNrID0gbHN0YWNrLnNsaWNlKDAsIC0xICogbGVuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0YWNrLnB1c2godGhpcy5wcm9kdWN0aW9uc19bYWN0aW9uWzFdXVswXSk7XG4gICAgICAgICAgICB2c3RhY2sucHVzaCh5eXZhbC4kKTtcbiAgICAgICAgICAgIGxzdGFjay5wdXNoKHl5dmFsLl8kKTtcbiAgICAgICAgICAgIG5ld1N0YXRlID0gdGFibGVbc3RhY2tbc3RhY2subGVuZ3RoIC0gMl1dW3N0YWNrW3N0YWNrLmxlbmd0aCAtIDFdXTtcbiAgICAgICAgICAgIHN0YWNrLnB1c2gobmV3U3RhdGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sIFwicGFyc2VcIilcbiAgfTtcbiAgdmFyIGxleGVyID0gLyogQF9fUFVSRV9fICovIChmdW5jdGlvbigpIHtcbiAgICB2YXIgbGV4ZXIyID0ge1xuICAgICAgRU9GOiAxLFxuICAgICAgcGFyc2VFcnJvcjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwYXJzZUVycm9yKHN0ciwgaGFzaCkge1xuICAgICAgICBpZiAodGhpcy55eS5wYXJzZXIpIHtcbiAgICAgICAgICB0aGlzLnl5LnBhcnNlci5wYXJzZUVycm9yKHN0ciwgaGFzaCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHN0cik7XG4gICAgICAgIH1cbiAgICAgIH0sIFwicGFyc2VFcnJvclwiKSxcbiAgICAgIC8vIHJlc2V0cyB0aGUgbGV4ZXIsIHNldHMgbmV3IGlucHV0XG4gICAgICBzZXRJbnB1dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihpbnB1dCwgeXkpIHtcbiAgICAgICAgdGhpcy55eSA9IHl5IHx8IHRoaXMueXkgfHwge307XG4gICAgICAgIHRoaXMuX2lucHV0ID0gaW5wdXQ7XG4gICAgICAgIHRoaXMuX21vcmUgPSB0aGlzLl9iYWNrdHJhY2sgPSB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy55eWxpbmVubyA9IHRoaXMueXlsZW5nID0gMDtcbiAgICAgICAgdGhpcy55eXRleHQgPSB0aGlzLm1hdGNoZWQgPSB0aGlzLm1hdGNoID0gXCJcIjtcbiAgICAgICAgdGhpcy5jb25kaXRpb25TdGFjayA9IFtcIklOSVRJQUxcIl07XG4gICAgICAgIHRoaXMueXlsbG9jID0ge1xuICAgICAgICAgIGZpcnN0X2xpbmU6IDEsXG4gICAgICAgICAgZmlyc3RfY29sdW1uOiAwLFxuICAgICAgICAgIGxhc3RfbGluZTogMSxcbiAgICAgICAgICBsYXN0X2NvbHVtbjogMFxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlID0gWzAsIDBdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub2Zmc2V0ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcInNldElucHV0XCIpLFxuICAgICAgLy8gY29uc3VtZXMgYW5kIHJldHVybnMgb25lIGNoYXIgZnJvbSB0aGUgaW5wdXRcbiAgICAgIGlucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2ggPSB0aGlzLl9pbnB1dFswXTtcbiAgICAgICAgdGhpcy55eXRleHQgKz0gY2g7XG4gICAgICAgIHRoaXMueXlsZW5nKys7XG4gICAgICAgIHRoaXMub2Zmc2V0Kys7XG4gICAgICAgIHRoaXMubWF0Y2ggKz0gY2g7XG4gICAgICAgIHRoaXMubWF0Y2hlZCArPSBjaDtcbiAgICAgICAgdmFyIGxpbmVzID0gY2gubWF0Y2goLyg/Olxcclxcbj98XFxuKS4qL2cpO1xuICAgICAgICBpZiAobGluZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGluZW5vKys7XG4gICAgICAgICAgdGhpcy55eWxsb2MubGFzdF9saW5lKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MubGFzdF9jb2x1bW4rKztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlWzFdKys7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faW5wdXQgPSB0aGlzLl9pbnB1dC5zbGljZSgxKTtcbiAgICAgICAgcmV0dXJuIGNoO1xuICAgICAgfSwgXCJpbnB1dFwiKSxcbiAgICAgIC8vIHVuc2hpZnRzIG9uZSBjaGFyIChvciBhIHN0cmluZykgaW50byB0aGUgaW5wdXRcbiAgICAgIHVucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGNoKSB7XG4gICAgICAgIHZhciBsZW4gPSBjaC5sZW5ndGg7XG4gICAgICAgIHZhciBsaW5lcyA9IGNoLnNwbGl0KC8oPzpcXHJcXG4/fFxcbikvZyk7XG4gICAgICAgIHRoaXMuX2lucHV0ID0gY2ggKyB0aGlzLl9pbnB1dDtcbiAgICAgICAgdGhpcy55eXRleHQgPSB0aGlzLnl5dGV4dC5zdWJzdHIoMCwgdGhpcy55eXRleHQubGVuZ3RoIC0gbGVuKTtcbiAgICAgICAgdGhpcy5vZmZzZXQgLT0gbGVuO1xuICAgICAgICB2YXIgb2xkTGluZXMgPSB0aGlzLm1hdGNoLnNwbGl0KC8oPzpcXHJcXG4/fFxcbikvZyk7XG4gICAgICAgIHRoaXMubWF0Y2ggPSB0aGlzLm1hdGNoLnN1YnN0cigwLCB0aGlzLm1hdGNoLmxlbmd0aCAtIDEpO1xuICAgICAgICB0aGlzLm1hdGNoZWQgPSB0aGlzLm1hdGNoZWQuc3Vic3RyKDAsIHRoaXMubWF0Y2hlZC5sZW5ndGggLSAxKTtcbiAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICB0aGlzLnl5bGluZW5vIC09IGxpbmVzLmxlbmd0aCAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHIgPSB0aGlzLnl5bGxvYy5yYW5nZTtcbiAgICAgICAgdGhpcy55eWxsb2MgPSB7XG4gICAgICAgICAgZmlyc3RfbGluZTogdGhpcy55eWxsb2MuZmlyc3RfbGluZSxcbiAgICAgICAgICBsYXN0X2xpbmU6IHRoaXMueXlsaW5lbm8gKyAxLFxuICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uLFxuICAgICAgICAgIGxhc3RfY29sdW1uOiBsaW5lcyA/IChsaW5lcy5sZW5ndGggPT09IG9sZExpbmVzLmxlbmd0aCA/IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbiA6IDApICsgb2xkTGluZXNbb2xkTGluZXMubGVuZ3RoIC0gbGluZXMubGVuZ3RoXS5sZW5ndGggLSBsaW5lc1swXS5sZW5ndGggOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4gLSBsZW5cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZSA9IFtyWzBdLCByWzBdICsgdGhpcy55eWxlbmcgLSBsZW5dO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueXlsZW5nID0gdGhpcy55eXRleHQubGVuZ3RoO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwidW5wdXRcIiksXG4gICAgICAvLyBXaGVuIGNhbGxlZCBmcm9tIGFjdGlvbiwgY2FjaGVzIG1hdGNoZWQgdGV4dCBhbmQgYXBwZW5kcyBpdCBvbiBuZXh0IGFjdGlvblxuICAgICAgbW9yZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fbW9yZSA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJtb3JlXCIpLFxuICAgICAgLy8gV2hlbiBjYWxsZWQgZnJvbSBhY3Rpb24sIHNpZ25hbHMgdGhlIGxleGVyIHRoYXQgdGhpcyBydWxlIGZhaWxzIHRvIG1hdGNoIHRoZSBpbnB1dCwgc28gdGhlIG5leHQgbWF0Y2hpbmcgcnVsZSAocmVnZXgpIHNob3VsZCBiZSB0ZXN0ZWQgaW5zdGVhZC5cbiAgICAgIHJlamVjdDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIpIHtcbiAgICAgICAgICB0aGlzLl9iYWNrdHJhY2sgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRXJyb3IoXCJMZXhpY2FsIGVycm9yIG9uIGxpbmUgXCIgKyAodGhpcy55eWxpbmVubyArIDEpICsgXCIuIFlvdSBjYW4gb25seSBpbnZva2UgcmVqZWN0KCkgaW4gdGhlIGxleGVyIHdoZW4gdGhlIGxleGVyIGlzIG9mIHRoZSBiYWNrdHJhY2tpbmcgcGVyc3Vhc2lvbiAob3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIgPSB0cnVlKS5cXG5cIiArIHRoaXMuc2hvd1Bvc2l0aW9uKCksIHtcbiAgICAgICAgICAgIHRleHQ6IFwiXCIsXG4gICAgICAgICAgICB0b2tlbjogbnVsbCxcbiAgICAgICAgICAgIGxpbmU6IHRoaXMueXlsaW5lbm9cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwicmVqZWN0XCIpLFxuICAgICAgLy8gcmV0YWluIGZpcnN0IG4gY2hhcmFjdGVycyBvZiB0aGUgbWF0Y2hcbiAgICAgIGxlc3M6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obikge1xuICAgICAgICB0aGlzLnVucHV0KHRoaXMubWF0Y2guc2xpY2UobikpO1xuICAgICAgfSwgXCJsZXNzXCIpLFxuICAgICAgLy8gZGlzcGxheXMgYWxyZWFkeSBtYXRjaGVkIGlucHV0LCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgcGFzdElucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGFzdCA9IHRoaXMubWF0Y2hlZC5zdWJzdHIoMCwgdGhpcy5tYXRjaGVkLmxlbmd0aCAtIHRoaXMubWF0Y2gubGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuIChwYXN0Lmxlbmd0aCA+IDIwID8gXCIuLi5cIiA6IFwiXCIpICsgcGFzdC5zdWJzdHIoLTIwKS5yZXBsYWNlKC9cXG4vZywgXCJcIik7XG4gICAgICB9LCBcInBhc3RJbnB1dFwiKSxcbiAgICAgIC8vIGRpc3BsYXlzIHVwY29taW5nIGlucHV0LCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgdXBjb21pbmdJbnB1dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG5leHQgPSB0aGlzLm1hdGNoO1xuICAgICAgICBpZiAobmV4dC5sZW5ndGggPCAyMCkge1xuICAgICAgICAgIG5leHQgKz0gdGhpcy5faW5wdXQuc3Vic3RyKDAsIDIwIC0gbmV4dC5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAobmV4dC5zdWJzdHIoMCwgMjApICsgKG5leHQubGVuZ3RoID4gMjAgPyBcIi4uLlwiIDogXCJcIikpLnJlcGxhY2UoL1xcbi9nLCBcIlwiKTtcbiAgICAgIH0sIFwidXBjb21pbmdJbnB1dFwiKSxcbiAgICAgIC8vIGRpc3BsYXlzIHRoZSBjaGFyYWN0ZXIgcG9zaXRpb24gd2hlcmUgdGhlIGxleGluZyBlcnJvciBvY2N1cnJlZCwgaS5lLiBmb3IgZXJyb3IgbWVzc2FnZXNcbiAgICAgIHNob3dQb3NpdGlvbjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHByZSA9IHRoaXMucGFzdElucHV0KCk7XG4gICAgICAgIHZhciBjMiA9IG5ldyBBcnJheShwcmUubGVuZ3RoICsgMSkuam9pbihcIi1cIik7XG4gICAgICAgIHJldHVybiBwcmUgKyB0aGlzLnVwY29taW5nSW5wdXQoKSArIFwiXFxuXCIgKyBjMiArIFwiXlwiO1xuICAgICAgfSwgXCJzaG93UG9zaXRpb25cIiksXG4gICAgICAvLyB0ZXN0IHRoZSBsZXhlZCB0b2tlbjogcmV0dXJuIEZBTFNFIHdoZW4gbm90IGEgbWF0Y2gsIG90aGVyd2lzZSByZXR1cm4gdG9rZW5cbiAgICAgIHRlc3RfbWF0Y2g6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obWF0Y2gsIGluZGV4ZWRfcnVsZSkge1xuICAgICAgICB2YXIgdG9rZW4sIGxpbmVzLCBiYWNrdXA7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFja3RyYWNrX2xleGVyKSB7XG4gICAgICAgICAgYmFja3VwID0ge1xuICAgICAgICAgICAgeXlsaW5lbm86IHRoaXMueXlsaW5lbm8sXG4gICAgICAgICAgICB5eWxsb2M6IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogdGhpcy55eWxsb2MuZmlyc3RfbGluZSxcbiAgICAgICAgICAgICAgbGFzdF9saW5lOiB0aGlzLmxhc3RfbGluZSxcbiAgICAgICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgICAgIGxhc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHl5dGV4dDogdGhpcy55eXRleHQsXG4gICAgICAgICAgICBtYXRjaDogdGhpcy5tYXRjaCxcbiAgICAgICAgICAgIG1hdGNoZXM6IHRoaXMubWF0Y2hlcyxcbiAgICAgICAgICAgIG1hdGNoZWQ6IHRoaXMubWF0Y2hlZCxcbiAgICAgICAgICAgIHl5bGVuZzogdGhpcy55eWxlbmcsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgX21vcmU6IHRoaXMuX21vcmUsXG4gICAgICAgICAgICBfaW5wdXQ6IHRoaXMuX2lucHV0LFxuICAgICAgICAgICAgeXk6IHRoaXMueXksXG4gICAgICAgICAgICBjb25kaXRpb25TdGFjazogdGhpcy5jb25kaXRpb25TdGFjay5zbGljZSgwKSxcbiAgICAgICAgICAgIGRvbmU6IHRoaXMuZG9uZVxuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICAgIGJhY2t1cC55eWxsb2MucmFuZ2UgPSB0aGlzLnl5bGxvYy5yYW5nZS5zbGljZSgwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMgPSBtYXRjaFswXS5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gKz0gbGluZXMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueXlsbG9jID0ge1xuICAgICAgICAgIGZpcnN0X2xpbmU6IHRoaXMueXlsbG9jLmxhc3RfbGluZSxcbiAgICAgICAgICBsYXN0X2xpbmU6IHRoaXMueXlsaW5lbm8gKyAxLFxuICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubGVuZ3RoIC0gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubWF0Y2goL1xccj9cXG4/LylbMF0ubGVuZ3RoIDogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4gKyBtYXRjaFswXS5sZW5ndGhcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy55eXRleHQgKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2ggKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2hlcyA9IG1hdGNoO1xuICAgICAgICB0aGlzLnl5bGVuZyA9IHRoaXMueXl0ZXh0Lmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZSA9IFt0aGlzLm9mZnNldCwgdGhpcy5vZmZzZXQgKz0gdGhpcy55eWxlbmddO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX21vcmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fYmFja3RyYWNrID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2lucHV0ID0gdGhpcy5faW5wdXQuc2xpY2UobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IG1hdGNoWzBdO1xuICAgICAgICB0b2tlbiA9IHRoaXMucGVyZm9ybUFjdGlvbi5jYWxsKHRoaXMsIHRoaXMueXksIHRoaXMsIGluZGV4ZWRfcnVsZSwgdGhpcy5jb25kaXRpb25TdGFja1t0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgaWYgKHRoaXMuZG9uZSAmJiB0aGlzLl9pbnB1dCkge1xuICAgICAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9iYWNrdHJhY2spIHtcbiAgICAgICAgICBmb3IgKHZhciBrIGluIGJhY2t1cCkge1xuICAgICAgICAgICAgdGhpc1trXSA9IGJhY2t1cFtrXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sIFwidGVzdF9tYXRjaFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIGluIGlucHV0XG4gICAgICBuZXh0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuRU9GO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5faW5wdXQpIHtcbiAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0b2tlbiwgbWF0Y2gsIHRlbXBNYXRjaCwgaW5kZXg7XG4gICAgICAgIGlmICghdGhpcy5fbW9yZSkge1xuICAgICAgICAgIHRoaXMueXl0ZXh0ID0gXCJcIjtcbiAgICAgICAgICB0aGlzLm1hdGNoID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcnVsZXMgPSB0aGlzLl9jdXJyZW50UnVsZXMoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRlbXBNYXRjaCA9IHRoaXMuX2lucHV0Lm1hdGNoKHRoaXMucnVsZXNbcnVsZXNbaV1dKTtcbiAgICAgICAgICBpZiAodGVtcE1hdGNoICYmICghbWF0Y2ggfHwgdGVtcE1hdGNoWzBdLmxlbmd0aCA+IG1hdGNoWzBdLmxlbmd0aCkpIHtcbiAgICAgICAgICAgIG1hdGNoID0gdGVtcE1hdGNoO1xuICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIpIHtcbiAgICAgICAgICAgICAgdG9rZW4gPSB0aGlzLnRlc3RfbWF0Y2godGVtcE1hdGNoLCBydWxlc1tpXSk7XG4gICAgICAgICAgICAgIGlmICh0b2tlbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmFja3RyYWNrKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMub3B0aW9ucy5mbGV4KSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICB0b2tlbiA9IHRoaXMudGVzdF9tYXRjaChtYXRjaCwgcnVsZXNbaW5kZXhdKTtcbiAgICAgICAgICBpZiAodG9rZW4gIT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5faW5wdXQgPT09IFwiXCIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5FT0Y7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gVW5yZWNvZ25pemVkIHRleHQuXFxuXCIgKyB0aGlzLnNob3dQb3NpdGlvbigpLCB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgdG9rZW46IG51bGwsXG4gICAgICAgICAgICBsaW5lOiB0aGlzLnl5bGluZW5vXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibmV4dFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIHRoYXQgaGFzIGEgdG9rZW5cbiAgICAgIGxleDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBsZXgoKSB7XG4gICAgICAgIHZhciByID0gdGhpcy5uZXh0KCk7XG4gICAgICAgIGlmIChyKSB7XG4gICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubGV4KCk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibGV4XCIpLFxuICAgICAgLy8gYWN0aXZhdGVzIGEgbmV3IGxleGVyIGNvbmRpdGlvbiBzdGF0ZSAocHVzaGVzIHRoZSBuZXcgbGV4ZXIgY29uZGl0aW9uIHN0YXRlIG9udG8gdGhlIGNvbmRpdGlvbiBzdGFjaylcbiAgICAgIGJlZ2luOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGJlZ2luKGNvbmRpdGlvbikge1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrLnB1c2goY29uZGl0aW9uKTtcbiAgICAgIH0sIFwiYmVnaW5cIiksXG4gICAgICAvLyBwb3AgdGhlIHByZXZpb3VzbHkgYWN0aXZlIGxleGVyIGNvbmRpdGlvbiBzdGF0ZSBvZmYgdGhlIGNvbmRpdGlvbiBzdGFja1xuICAgICAgcG9wU3RhdGU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcG9wU3RhdGUoKSB7XG4gICAgICAgIHZhciBuID0gdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxO1xuICAgICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFjay5wb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1swXTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwb3BTdGF0ZVwiKSxcbiAgICAgIC8vIHByb2R1Y2UgdGhlIGxleGVyIHJ1bGUgc2V0IHdoaWNoIGlzIGFjdGl2ZSBmb3IgdGhlIGN1cnJlbnRseSBhY3RpdmUgbGV4ZXIgY29uZGl0aW9uIHN0YXRlXG4gICAgICBfY3VycmVudFJ1bGVzOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIF9jdXJyZW50UnVsZXMoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAmJiB0aGlzLmNvbmRpdGlvblN0YWNrW3RoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25zW3RoaXMuY29uZGl0aW9uU3RhY2tbdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxXV0ucnVsZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uc1tcIklOSVRJQUxcIl0ucnVsZXM7XG4gICAgICAgIH1cbiAgICAgIH0sIFwiX2N1cnJlbnRSdWxlc1wiKSxcbiAgICAgIC8vIHJldHVybiB0aGUgY3VycmVudGx5IGFjdGl2ZSBsZXhlciBjb25kaXRpb24gc3RhdGU7IHdoZW4gYW4gaW5kZXggYXJndW1lbnQgaXMgcHJvdmlkZWQgaXQgcHJvZHVjZXMgdGhlIE4tdGggcHJldmlvdXMgY29uZGl0aW9uIHN0YXRlLCBpZiBhdmFpbGFibGVcbiAgICAgIHRvcFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHRvcFN0YXRlKG4pIHtcbiAgICAgICAgbiA9IHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMSAtIE1hdGguYWJzKG4gfHwgMCk7XG4gICAgICAgIGlmIChuID49IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1tuXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gXCJJTklUSUFMXCI7XG4gICAgICAgIH1cbiAgICAgIH0sIFwidG9wU3RhdGVcIiksXG4gICAgICAvLyBhbGlhcyBmb3IgYmVnaW4oY29uZGl0aW9uKVxuICAgICAgcHVzaFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHB1c2hTdGF0ZShjb25kaXRpb24pIHtcbiAgICAgICAgdGhpcy5iZWdpbihjb25kaXRpb24pO1xuICAgICAgfSwgXCJwdXNoU3RhdGVcIiksXG4gICAgICAvLyByZXR1cm4gdGhlIG51bWJlciBvZiBzdGF0ZXMgY3VycmVudGx5IG9uIHRoZSBzdGFja1xuICAgICAgc3RhdGVTdGFja1NpemU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gc3RhdGVTdGFja1NpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aDtcbiAgICAgIH0sIFwic3RhdGVTdGFja1NpemVcIiksXG4gICAgICBvcHRpb25zOiB7fSxcbiAgICAgIHBlcmZvcm1BY3Rpb246IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gYW5vbnltb3VzKHl5LCB5eV8sICRhdm9pZGluZ19uYW1lX2NvbGxpc2lvbnMsIFlZX1NUQVJUKSB7XG4gICAgICAgIHZhciBZWVNUQVRFID0gWVlfU1RBUlQ7XG4gICAgICAgIHN3aXRjaCAoJGF2b2lkaW5nX25hbWVfY29sbGlzaW9ucykge1xuICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIHJldHVybiA2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgcmV0dXJuIDc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiA5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIDIyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgcmV0dXJuIDIzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImFjY190aXRsZVwiKTtcbiAgICAgICAgICAgIHJldHVybiAyNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiBcImFjY190aXRsZV92YWx1ZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImFjY19kZXNjclwiKTtcbiAgICAgICAgICAgIHJldHVybiAyNjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiBcImFjY19kZXNjcl92YWx1ZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJhY2NfZGVzY3JfbXVsdGlsaW5lXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICByZXR1cm4gXCJhY2NfZGVzY3JfbXVsdGlsaW5lX3ZhbHVlXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxNDpcbiAgICAgICAgICAgIGM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgICAgcmV0dXJuIDEyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgICByZXR1cm4gMTE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE4OlxuICAgICAgICAgICAgcmV0dXJuIDE1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxOTpcbiAgICAgICAgICAgIHJldHVybiAxNjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgICByZXR1cm4gMTc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDIxOlxuICAgICAgICAgICAgcmV0dXJuIDE4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyMjpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJwZXJzb25fZXh0XCIpO1xuICAgICAgICAgICAgcmV0dXJuIDQ1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyMzpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJwZXJzb25cIik7XG4gICAgICAgICAgICByZXR1cm4gNDQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI0OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcInN5c3RlbV9leHRfcXVldWVcIik7XG4gICAgICAgICAgICByZXR1cm4gNTE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI1OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcInN5c3RlbV9leHRfZGJcIik7XG4gICAgICAgICAgICByZXR1cm4gNTA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI2OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcInN5c3RlbV9leHRcIik7XG4gICAgICAgICAgICByZXR1cm4gNDk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcInN5c3RlbV9xdWV1ZVwiKTtcbiAgICAgICAgICAgIHJldHVybiA0ODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjg6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwic3lzdGVtX2RiXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDQ3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOTpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJzeXN0ZW1cIik7XG4gICAgICAgICAgICByZXR1cm4gNDY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDMwOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImJvdW5kYXJ5XCIpO1xuICAgICAgICAgICAgcmV0dXJuIDM3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzMTpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJlbnRlcnByaXNlX2JvdW5kYXJ5XCIpO1xuICAgICAgICAgICAgcmV0dXJuIDM0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzMjpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJzeXN0ZW1fYm91bmRhcnlcIik7XG4gICAgICAgICAgICByZXR1cm4gMzY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDMzOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImNvbnRhaW5lcl9leHRfcXVldWVcIik7XG4gICAgICAgICAgICByZXR1cm4gNTc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM0OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImNvbnRhaW5lcl9leHRfZGJcIik7XG4gICAgICAgICAgICByZXR1cm4gNTY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM1OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImNvbnRhaW5lcl9leHRcIik7XG4gICAgICAgICAgICByZXR1cm4gNTU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM2OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImNvbnRhaW5lcl9xdWV1ZVwiKTtcbiAgICAgICAgICAgIHJldHVybiA1NDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzc6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiY29udGFpbmVyX2RiXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDUzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzODpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJjb250YWluZXJcIik7XG4gICAgICAgICAgICByZXR1cm4gNTI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM5OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImNvbnRhaW5lcl9ib3VuZGFyeVwiKTtcbiAgICAgICAgICAgIHJldHVybiAzODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiY29tcG9uZW50X2V4dF9xdWV1ZVwiKTtcbiAgICAgICAgICAgIHJldHVybiA2MztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDE6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiY29tcG9uZW50X2V4dF9kYlwiKTtcbiAgICAgICAgICAgIHJldHVybiA2MjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDI6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiY29tcG9uZW50X2V4dFwiKTtcbiAgICAgICAgICAgIHJldHVybiA2MTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDM6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiY29tcG9uZW50X3F1ZXVlXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDYwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0NDpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJjb21wb25lbnRfZGJcIik7XG4gICAgICAgICAgICByZXR1cm4gNTk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ1OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImNvbXBvbmVudFwiKTtcbiAgICAgICAgICAgIHJldHVybiA1ODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDY6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwibm9kZVwiKTtcbiAgICAgICAgICAgIHJldHVybiAzOTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDc6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwibm9kZVwiKTtcbiAgICAgICAgICAgIHJldHVybiAzOTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDg6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwibm9kZV9sXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDQwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0OTpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJub2RlX3JcIik7XG4gICAgICAgICAgICByZXR1cm4gNDE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDUwOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcInJlbFwiKTtcbiAgICAgICAgICAgIHJldHVybiA2NDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTE6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiYmlyZWxcIik7XG4gICAgICAgICAgICByZXR1cm4gNjU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDUyOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcInJlbF91XCIpO1xuICAgICAgICAgICAgcmV0dXJuIDY2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1MzpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJyZWxfdVwiKTtcbiAgICAgICAgICAgIHJldHVybiA2NjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTQ6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwicmVsX2RcIik7XG4gICAgICAgICAgICByZXR1cm4gNjc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU1OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcInJlbF9kXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDY3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1NjpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJyZWxfbFwiKTtcbiAgICAgICAgICAgIHJldHVybiA2ODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTc6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwicmVsX2xcIik7XG4gICAgICAgICAgICByZXR1cm4gNjg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU4OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcInJlbF9yXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDY5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1OTpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJyZWxfclwiKTtcbiAgICAgICAgICAgIHJldHVybiA2OTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjA6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwicmVsX2JcIik7XG4gICAgICAgICAgICByZXR1cm4gNzA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDYxOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcInJlbF9pbmRleFwiKTtcbiAgICAgICAgICAgIHJldHVybiA3MTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjI6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwidXBkYXRlX2VsX3N0eWxlXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDcyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2MzpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJ1cGRhdGVfcmVsX3N0eWxlXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDczO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2NDpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJ1cGRhdGVfbGF5b3V0X2NvbmZpZ1wiKTtcbiAgICAgICAgICAgIHJldHVybiA3NDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjU6XG4gICAgICAgICAgICByZXR1cm4gXCJFT0ZfSU5fU1RSVUNUXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDY2OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImF0dHJpYnV0ZVwiKTtcbiAgICAgICAgICAgIHJldHVybiBcIkFUVFJJQlVURV9FTVBUWVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2NzpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJhdHRyaWJ1dGVcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDY4OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2OTpcbiAgICAgICAgICAgIHJldHVybiA4MDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzA6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDcxOlxuICAgICAgICAgICAgcmV0dXJuIDgwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3MjpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJzdHJpbmdcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDczOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3NDpcbiAgICAgICAgICAgIHJldHVybiBcIlNUUlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3NTpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJzdHJpbmdfa3ZcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDc2OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcInN0cmluZ19rdl9rZXlcIik7XG4gICAgICAgICAgICByZXR1cm4gXCJTVFJfS0VZXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDc3OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5iZWdpbihcInN0cmluZ19rdl92YWx1ZVwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzg6XG4gICAgICAgICAgICByZXR1cm4gXCJTVFJfVkFMVUVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzk6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDgwOlxuICAgICAgICAgICAgcmV0dXJuIFwiU1RSXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDgxOlxuICAgICAgICAgICAgcmV0dXJuIFwiTEJSQUNFXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDgyOlxuICAgICAgICAgICAgcmV0dXJuIFwiUkJSQUNFXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDgzOlxuICAgICAgICAgICAgcmV0dXJuIFwiU1BBQ0VcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgODQ6XG4gICAgICAgICAgICByZXR1cm4gXCJFT0xcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgODU6XG4gICAgICAgICAgICByZXR1cm4gMTQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSwgXCJhbm9ueW1vdXNcIiksXG4gICAgICBydWxlczogWy9eKD86LipkaXJlY3Rpb25cXHMrVEJbXlxcbl0qKS8sIC9eKD86LipkaXJlY3Rpb25cXHMrQlRbXlxcbl0qKS8sIC9eKD86LipkaXJlY3Rpb25cXHMrUkxbXlxcbl0qKS8sIC9eKD86LipkaXJlY3Rpb25cXHMrTFJbXlxcbl0qKS8sIC9eKD86dGl0bGVcXHNbXiNcXG47XSspLywgL14oPzphY2NEZXNjcmlwdGlvblxcc1teI1xcbjtdKykvLCAvXig/OmFjY1RpdGxlXFxzKjpcXHMqKS8sIC9eKD86KD8hXFxufHwpKlteXFxuXSopLywgL14oPzphY2NEZXNjclxccyo6XFxzKikvLCAvXig/Oig/IVxcbnx8KSpbXlxcbl0qKS8sIC9eKD86YWNjRGVzY3JcXHMqXFx7XFxzKikvLCAvXig/OltcXH1dKS8sIC9eKD86W15cXH1dKikvLCAvXig/OiUlKD8hXFx7KSpbXlxcbl0qKFxccj9cXG4/KSspLywgL14oPzolJVteXFxuXSooXFxyP1xcbikqKS8sIC9eKD86XFxzKihcXHI/XFxuKSspLywgL14oPzpcXHMrKS8sIC9eKD86QzRDb250ZXh0XFxiKS8sIC9eKD86QzRDb250YWluZXJcXGIpLywgL14oPzpDNENvbXBvbmVudFxcYikvLCAvXig/OkM0RHluYW1pY1xcYikvLCAvXig/OkM0RGVwbG95bWVudFxcYikvLCAvXig/OlBlcnNvbl9FeHRcXGIpLywgL14oPzpQZXJzb25cXGIpLywgL14oPzpTeXN0ZW1RdWV1ZV9FeHRcXGIpLywgL14oPzpTeXN0ZW1EYl9FeHRcXGIpLywgL14oPzpTeXN0ZW1fRXh0XFxiKS8sIC9eKD86U3lzdGVtUXVldWVcXGIpLywgL14oPzpTeXN0ZW1EYlxcYikvLCAvXig/OlN5c3RlbVxcYikvLCAvXig/OkJvdW5kYXJ5XFxiKS8sIC9eKD86RW50ZXJwcmlzZV9Cb3VuZGFyeVxcYikvLCAvXig/OlN5c3RlbV9Cb3VuZGFyeVxcYikvLCAvXig/OkNvbnRhaW5lclF1ZXVlX0V4dFxcYikvLCAvXig/OkNvbnRhaW5lckRiX0V4dFxcYikvLCAvXig/OkNvbnRhaW5lcl9FeHRcXGIpLywgL14oPzpDb250YWluZXJRdWV1ZVxcYikvLCAvXig/OkNvbnRhaW5lckRiXFxiKS8sIC9eKD86Q29udGFpbmVyXFxiKS8sIC9eKD86Q29udGFpbmVyX0JvdW5kYXJ5XFxiKS8sIC9eKD86Q29tcG9uZW50UXVldWVfRXh0XFxiKS8sIC9eKD86Q29tcG9uZW50RGJfRXh0XFxiKS8sIC9eKD86Q29tcG9uZW50X0V4dFxcYikvLCAvXig/OkNvbXBvbmVudFF1ZXVlXFxiKS8sIC9eKD86Q29tcG9uZW50RGJcXGIpLywgL14oPzpDb21wb25lbnRcXGIpLywgL14oPzpEZXBsb3ltZW50X05vZGVcXGIpLywgL14oPzpOb2RlXFxiKS8sIC9eKD86Tm9kZV9MXFxiKS8sIC9eKD86Tm9kZV9SXFxiKS8sIC9eKD86UmVsXFxiKS8sIC9eKD86QmlSZWxcXGIpLywgL14oPzpSZWxfVXBcXGIpLywgL14oPzpSZWxfVVxcYikvLCAvXig/OlJlbF9Eb3duXFxiKS8sIC9eKD86UmVsX0RcXGIpLywgL14oPzpSZWxfTGVmdFxcYikvLCAvXig/OlJlbF9MXFxiKS8sIC9eKD86UmVsX1JpZ2h0XFxiKS8sIC9eKD86UmVsX1JcXGIpLywgL14oPzpSZWxfQmFja1xcYikvLCAvXig/OlJlbEluZGV4XFxiKS8sIC9eKD86VXBkYXRlRWxlbWVudFN0eWxlXFxiKS8sIC9eKD86VXBkYXRlUmVsU3R5bGVcXGIpLywgL14oPzpVcGRhdGVMYXlvdXRDb25maWdcXGIpLywgL14oPzokKS8sIC9eKD86WyhdWyBdKlssXSkvLCAvXig/OlsoXSkvLCAvXig/OlspXSkvLCAvXig/OiwsKS8sIC9eKD86LCkvLCAvXig/OlsgXSpbXCJdW1wiXSkvLCAvXig/OlsgXSpbXCJdKS8sIC9eKD86W1wiXSkvLCAvXig/OlteXCJdKikvLCAvXig/OlsgXSpbXFwkXSkvLCAvXig/OltePV0qKS8sIC9eKD86Wz1dWyBdKltcIl0pLywgL14oPzpbXlwiXSspLywgL14oPzpbXCJdKS8sIC9eKD86W14sXSspLywgL14oPzpcXHspLywgL14oPzpcXH0pLywgL14oPzpbXFxzXSspLywgL14oPzpbXFxuXFxyXSspLywgL14oPzokKS9dLFxuICAgICAgY29uZGl0aW9uczogeyBcImFjY19kZXNjcl9tdWx0aWxpbmVcIjogeyBcInJ1bGVzXCI6IFsxMSwgMTJdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImFjY19kZXNjclwiOiB7IFwicnVsZXNcIjogWzldLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImFjY190aXRsZVwiOiB7IFwicnVsZXNcIjogWzddLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcInN0cmluZ19rdl92YWx1ZVwiOiB7IFwicnVsZXNcIjogWzc4LCA3OV0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwic3RyaW5nX2t2X2tleVwiOiB7IFwicnVsZXNcIjogWzc3XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJzdHJpbmdfa3ZcIjogeyBcInJ1bGVzXCI6IFs3Nl0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwic3RyaW5nXCI6IHsgXCJydWxlc1wiOiBbNzMsIDc0XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJhdHRyaWJ1dGVcIjogeyBcInJ1bGVzXCI6IFs2OCwgNjksIDcwLCA3MSwgNzIsIDc1LCA4MF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwidXBkYXRlX2xheW91dF9jb25maWdcIjogeyBcInJ1bGVzXCI6IFs2NSwgNjYsIDY3LCA2OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwidXBkYXRlX3JlbF9zdHlsZVwiOiB7IFwicnVsZXNcIjogWzY1LCA2NiwgNjcsIDY4XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJ1cGRhdGVfZWxfc3R5bGVcIjogeyBcInJ1bGVzXCI6IFs2NSwgNjYsIDY3LCA2OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwicmVsX2JcIjogeyBcInJ1bGVzXCI6IFs2NSwgNjYsIDY3LCA2OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwicmVsX3JcIjogeyBcInJ1bGVzXCI6IFs2NSwgNjYsIDY3LCA2OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwicmVsX2xcIjogeyBcInJ1bGVzXCI6IFs2NSwgNjYsIDY3LCA2OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwicmVsX2RcIjogeyBcInJ1bGVzXCI6IFs2NSwgNjYsIDY3LCA2OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwicmVsX3VcIjogeyBcInJ1bGVzXCI6IFs2NSwgNjYsIDY3LCA2OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwicmVsX2JpXCI6IHsgXCJydWxlc1wiOiBbXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJyZWxcIjogeyBcInJ1bGVzXCI6IFs2NSwgNjYsIDY3LCA2OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwibm9kZV9yXCI6IHsgXCJydWxlc1wiOiBbNjUsIDY2LCA2NywgNjhdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIm5vZGVfbFwiOiB7IFwicnVsZXNcIjogWzY1LCA2NiwgNjcsIDY4XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJub2RlXCI6IHsgXCJydWxlc1wiOiBbNjUsIDY2LCA2NywgNjhdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImluZGV4XCI6IHsgXCJydWxlc1wiOiBbXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJyZWxfaW5kZXhcIjogeyBcInJ1bGVzXCI6IFs2NSwgNjYsIDY3LCA2OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiY29tcG9uZW50X2V4dF9xdWV1ZVwiOiB7IFwicnVsZXNcIjogWzY1LCA2NiwgNjcsIDY4XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJjb21wb25lbnRfZXh0X2RiXCI6IHsgXCJydWxlc1wiOiBbNjUsIDY2LCA2NywgNjhdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImNvbXBvbmVudF9leHRcIjogeyBcInJ1bGVzXCI6IFs2NSwgNjYsIDY3LCA2OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiY29tcG9uZW50X3F1ZXVlXCI6IHsgXCJydWxlc1wiOiBbNjUsIDY2LCA2NywgNjhdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImNvbXBvbmVudF9kYlwiOiB7IFwicnVsZXNcIjogWzY1LCA2NiwgNjcsIDY4XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJjb21wb25lbnRcIjogeyBcInJ1bGVzXCI6IFs2NSwgNjYsIDY3LCA2OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiY29udGFpbmVyX2JvdW5kYXJ5XCI6IHsgXCJydWxlc1wiOiBbNjUsIDY2LCA2NywgNjhdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImNvbnRhaW5lcl9leHRfcXVldWVcIjogeyBcInJ1bGVzXCI6IFs2NSwgNjYsIDY3LCA2OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiY29udGFpbmVyX2V4dF9kYlwiOiB7IFwicnVsZXNcIjogWzY1LCA2NiwgNjcsIDY4XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJjb250YWluZXJfZXh0XCI6IHsgXCJydWxlc1wiOiBbNjUsIDY2LCA2NywgNjhdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImNvbnRhaW5lcl9xdWV1ZVwiOiB7IFwicnVsZXNcIjogWzY1LCA2NiwgNjcsIDY4XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJjb250YWluZXJfZGJcIjogeyBcInJ1bGVzXCI6IFs2NSwgNjYsIDY3LCA2OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiY29udGFpbmVyXCI6IHsgXCJydWxlc1wiOiBbNjUsIDY2LCA2NywgNjhdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImJpcmVsXCI6IHsgXCJydWxlc1wiOiBbNjUsIDY2LCA2NywgNjhdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcInN5c3RlbV9ib3VuZGFyeVwiOiB7IFwicnVsZXNcIjogWzY1LCA2NiwgNjcsIDY4XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJlbnRlcnByaXNlX2JvdW5kYXJ5XCI6IHsgXCJydWxlc1wiOiBbNjUsIDY2LCA2NywgNjhdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImJvdW5kYXJ5XCI6IHsgXCJydWxlc1wiOiBbNjUsIDY2LCA2NywgNjhdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcInN5c3RlbV9leHRfcXVldWVcIjogeyBcInJ1bGVzXCI6IFs2NSwgNjYsIDY3LCA2OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwic3lzdGVtX2V4dF9kYlwiOiB7IFwicnVsZXNcIjogWzY1LCA2NiwgNjcsIDY4XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJzeXN0ZW1fZXh0XCI6IHsgXCJydWxlc1wiOiBbNjUsIDY2LCA2NywgNjhdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcInN5c3RlbV9xdWV1ZVwiOiB7IFwicnVsZXNcIjogWzY1LCA2NiwgNjcsIDY4XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJzeXN0ZW1fZGJcIjogeyBcInJ1bGVzXCI6IFs2NSwgNjYsIDY3LCA2OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwic3lzdGVtXCI6IHsgXCJydWxlc1wiOiBbNjUsIDY2LCA2NywgNjhdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcInBlcnNvbl9leHRcIjogeyBcInJ1bGVzXCI6IFs2NSwgNjYsIDY3LCA2OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwicGVyc29uXCI6IHsgXCJydWxlc1wiOiBbNjUsIDY2LCA2NywgNjhdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIklOSVRJQUxcIjogeyBcInJ1bGVzXCI6IFswLCAxLCAyLCAzLCA0LCA1LCA2LCA4LCAxMCwgMTMsIDE0LCAxNSwgMTYsIDE3LCAxOCwgMTksIDIwLCAyMSwgMjIsIDIzLCAyNCwgMjUsIDI2LCAyNywgMjgsIDI5LCAzMCwgMzEsIDMyLCAzMywgMzQsIDM1LCAzNiwgMzcsIDM4LCAzOSwgNDAsIDQxLCA0MiwgNDMsIDQ0LCA0NSwgNDYsIDQ3LCA0OCwgNDksIDUwLCA1MSwgNTIsIDUzLCA1NCwgNTUsIDU2LCA1NywgNTgsIDU5LCA2MCwgNjEsIDYyLCA2MywgNjQsIDgxLCA4MiwgODMsIDg0LCA4NV0sIFwiaW5jbHVzaXZlXCI6IHRydWUgfSB9XG4gICAgfTtcbiAgICByZXR1cm4gbGV4ZXIyO1xuICB9KSgpO1xuICBwYXJzZXIyLmxleGVyID0gbGV4ZXI7XG4gIGZ1bmN0aW9uIFBhcnNlcigpIHtcbiAgICB0aGlzLnl5ID0ge307XG4gIH1cbiAgX19uYW1lKFBhcnNlciwgXCJQYXJzZXJcIik7XG4gIFBhcnNlci5wcm90b3R5cGUgPSBwYXJzZXIyO1xuICBwYXJzZXIyLlBhcnNlciA9IFBhcnNlcjtcbiAgcmV0dXJuIG5ldyBQYXJzZXIoKTtcbn0pKCk7XG5wYXJzZXIucGFyc2VyID0gcGFyc2VyO1xudmFyIGM0RGlhZ3JhbV9kZWZhdWx0ID0gcGFyc2VyO1xuXG4vLyBzcmMvZGlhZ3JhbXMvYzQvYzREYi5qc1xudmFyIGM0U2hhcGVBcnJheSA9IFtdO1xudmFyIGJvdW5kYXJ5UGFyc2VTdGFjayA9IFtcIlwiXTtcbnZhciBjdXJyZW50Qm91bmRhcnlQYXJzZSA9IFwiZ2xvYmFsXCI7XG52YXIgcGFyZW50Qm91bmRhcnlQYXJzZSA9IFwiXCI7XG52YXIgYm91bmRhcmllcyA9IFtcbiAge1xuICAgIGFsaWFzOiBcImdsb2JhbFwiLFxuICAgIGxhYmVsOiB7IHRleHQ6IFwiZ2xvYmFsXCIgfSxcbiAgICB0eXBlOiB7IHRleHQ6IFwiZ2xvYmFsXCIgfSxcbiAgICB0YWdzOiBudWxsLFxuICAgIGxpbms6IG51bGwsXG4gICAgcGFyZW50Qm91bmRhcnk6IFwiXCJcbiAgfVxuXTtcbnZhciByZWxzID0gW107XG52YXIgdGl0bGUgPSBcIlwiO1xudmFyIHdyYXBFbmFibGVkID0gZmFsc2U7XG52YXIgYzRTaGFwZUluUm93ID0gNDtcbnZhciBjNEJvdW5kYXJ5SW5Sb3cgPSAyO1xudmFyIGM0VHlwZTtcbnZhciBnZXRDNFR5cGUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gYzRUeXBlO1xufSwgXCJnZXRDNFR5cGVcIik7XG52YXIgc2V0QzRUeXBlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihjNFR5cGVQYXJhbSkge1xuICBsZXQgc2FuaXRpemVkVGV4dCA9IHNhbml0aXplVGV4dChjNFR5cGVQYXJhbSwgZ2V0Q29uZmlnKCkpO1xuICBjNFR5cGUgPSBzYW5pdGl6ZWRUZXh0O1xufSwgXCJzZXRDNFR5cGVcIik7XG52YXIgYWRkUmVsID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbih0eXBlLCBmcm9tLCB0bywgbGFiZWwsIHRlY2huLCBkZXNjciwgc3ByaXRlLCB0YWdzLCBsaW5rKSB7XG4gIGlmICh0eXBlID09PSB2b2lkIDAgfHwgdHlwZSA9PT0gbnVsbCB8fCBmcm9tID09PSB2b2lkIDAgfHwgZnJvbSA9PT0gbnVsbCB8fCB0byA9PT0gdm9pZCAwIHx8IHRvID09PSBudWxsIHx8IGxhYmVsID09PSB2b2lkIDAgfHwgbGFiZWwgPT09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IHJlbCA9IHt9O1xuICBjb25zdCBvbGQgPSByZWxzLmZpbmQoKHJlbDIpID0+IHJlbDIuZnJvbSA9PT0gZnJvbSAmJiByZWwyLnRvID09PSB0byk7XG4gIGlmIChvbGQpIHtcbiAgICByZWwgPSBvbGQ7XG4gIH0gZWxzZSB7XG4gICAgcmVscy5wdXNoKHJlbCk7XG4gIH1cbiAgcmVsLnR5cGUgPSB0eXBlO1xuICByZWwuZnJvbSA9IGZyb207XG4gIHJlbC50byA9IHRvO1xuICByZWwubGFiZWwgPSB7IHRleHQ6IGxhYmVsIH07XG4gIGlmICh0ZWNobiA9PT0gdm9pZCAwIHx8IHRlY2huID09PSBudWxsKSB7XG4gICAgcmVsLnRlY2huID0geyB0ZXh0OiBcIlwiIH07XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiB0ZWNobiA9PT0gXCJvYmplY3RcIikge1xuICAgICAgbGV0IFtrZXksIHZhbHVlXSA9IE9iamVjdC5lbnRyaWVzKHRlY2huKVswXTtcbiAgICAgIHJlbFtrZXldID0geyB0ZXh0OiB2YWx1ZSB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZWwudGVjaG4gPSB7IHRleHQ6IHRlY2huIH07XG4gICAgfVxuICB9XG4gIGlmIChkZXNjciA9PT0gdm9pZCAwIHx8IGRlc2NyID09PSBudWxsKSB7XG4gICAgcmVsLmRlc2NyID0geyB0ZXh0OiBcIlwiIH07XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBkZXNjciA9PT0gXCJvYmplY3RcIikge1xuICAgICAgbGV0IFtrZXksIHZhbHVlXSA9IE9iamVjdC5lbnRyaWVzKGRlc2NyKVswXTtcbiAgICAgIHJlbFtrZXldID0geyB0ZXh0OiB2YWx1ZSB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZWwuZGVzY3IgPSB7IHRleHQ6IGRlc2NyIH07XG4gICAgfVxuICB9XG4gIGlmICh0eXBlb2Ygc3ByaXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgbGV0IFtrZXksIHZhbHVlXSA9IE9iamVjdC5lbnRyaWVzKHNwcml0ZSlbMF07XG4gICAgcmVsW2tleV0gPSB2YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICByZWwuc3ByaXRlID0gc3ByaXRlO1xuICB9XG4gIGlmICh0eXBlb2YgdGFncyA9PT0gXCJvYmplY3RcIikge1xuICAgIGxldCBba2V5LCB2YWx1ZV0gPSBPYmplY3QuZW50cmllcyh0YWdzKVswXTtcbiAgICByZWxba2V5XSA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHJlbC50YWdzID0gdGFncztcbiAgfVxuICBpZiAodHlwZW9mIGxpbmsgPT09IFwib2JqZWN0XCIpIHtcbiAgICBsZXQgW2tleSwgdmFsdWVdID0gT2JqZWN0LmVudHJpZXMobGluaylbMF07XG4gICAgcmVsW2tleV0gPSB2YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICByZWwubGluayA9IGxpbms7XG4gIH1cbiAgcmVsLndyYXAgPSBhdXRvV3JhcCgpO1xufSwgXCJhZGRSZWxcIik7XG52YXIgYWRkUGVyc29uT3JTeXN0ZW0gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHR5cGVDNFNoYXBlLCBhbGlhcywgbGFiZWwsIGRlc2NyLCBzcHJpdGUsIHRhZ3MsIGxpbmspIHtcbiAgaWYgKGFsaWFzID09PSBudWxsIHx8IGxhYmVsID09PSBudWxsKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGxldCBwZXJzb25PclN5c3RlbSA9IHt9O1xuICBjb25zdCBvbGQgPSBjNFNoYXBlQXJyYXkuZmluZCgocGVyc29uT3JTeXN0ZW0yKSA9PiBwZXJzb25PclN5c3RlbTIuYWxpYXMgPT09IGFsaWFzKTtcbiAgaWYgKG9sZCAmJiBhbGlhcyA9PT0gb2xkLmFsaWFzKSB7XG4gICAgcGVyc29uT3JTeXN0ZW0gPSBvbGQ7XG4gIH0gZWxzZSB7XG4gICAgcGVyc29uT3JTeXN0ZW0uYWxpYXMgPSBhbGlhcztcbiAgICBjNFNoYXBlQXJyYXkucHVzaChwZXJzb25PclN5c3RlbSk7XG4gIH1cbiAgaWYgKGxhYmVsID09PSB2b2lkIDAgfHwgbGFiZWwgPT09IG51bGwpIHtcbiAgICBwZXJzb25PclN5c3RlbS5sYWJlbCA9IHsgdGV4dDogXCJcIiB9O1xuICB9IGVsc2Uge1xuICAgIHBlcnNvbk9yU3lzdGVtLmxhYmVsID0geyB0ZXh0OiBsYWJlbCB9O1xuICB9XG4gIGlmIChkZXNjciA9PT0gdm9pZCAwIHx8IGRlc2NyID09PSBudWxsKSB7XG4gICAgcGVyc29uT3JTeXN0ZW0uZGVzY3IgPSB7IHRleHQ6IFwiXCIgfTtcbiAgfSBlbHNlIHtcbiAgICBpZiAodHlwZW9mIGRlc2NyID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBsZXQgW2tleSwgdmFsdWVdID0gT2JqZWN0LmVudHJpZXMoZGVzY3IpWzBdO1xuICAgICAgcGVyc29uT3JTeXN0ZW1ba2V5XSA9IHsgdGV4dDogdmFsdWUgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGVyc29uT3JTeXN0ZW0uZGVzY3IgPSB7IHRleHQ6IGRlc2NyIH07XG4gICAgfVxuICB9XG4gIGlmICh0eXBlb2Ygc3ByaXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgbGV0IFtrZXksIHZhbHVlXSA9IE9iamVjdC5lbnRyaWVzKHNwcml0ZSlbMF07XG4gICAgcGVyc29uT3JTeXN0ZW1ba2V5XSA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHBlcnNvbk9yU3lzdGVtLnNwcml0ZSA9IHNwcml0ZTtcbiAgfVxuICBpZiAodHlwZW9mIHRhZ3MgPT09IFwib2JqZWN0XCIpIHtcbiAgICBsZXQgW2tleSwgdmFsdWVdID0gT2JqZWN0LmVudHJpZXModGFncylbMF07XG4gICAgcGVyc29uT3JTeXN0ZW1ba2V5XSA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHBlcnNvbk9yU3lzdGVtLnRhZ3MgPSB0YWdzO1xuICB9XG4gIGlmICh0eXBlb2YgbGluayA9PT0gXCJvYmplY3RcIikge1xuICAgIGxldCBba2V5LCB2YWx1ZV0gPSBPYmplY3QuZW50cmllcyhsaW5rKVswXTtcbiAgICBwZXJzb25PclN5c3RlbVtrZXldID0gdmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgcGVyc29uT3JTeXN0ZW0ubGluayA9IGxpbms7XG4gIH1cbiAgcGVyc29uT3JTeXN0ZW0udHlwZUM0U2hhcGUgPSB7IHRleHQ6IHR5cGVDNFNoYXBlIH07XG4gIHBlcnNvbk9yU3lzdGVtLnBhcmVudEJvdW5kYXJ5ID0gY3VycmVudEJvdW5kYXJ5UGFyc2U7XG4gIHBlcnNvbk9yU3lzdGVtLndyYXAgPSBhdXRvV3JhcCgpO1xufSwgXCJhZGRQZXJzb25PclN5c3RlbVwiKTtcbnZhciBhZGRDb250YWluZXIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHR5cGVDNFNoYXBlLCBhbGlhcywgbGFiZWwsIHRlY2huLCBkZXNjciwgc3ByaXRlLCB0YWdzLCBsaW5rKSB7XG4gIGlmIChhbGlhcyA9PT0gbnVsbCB8fCBsYWJlbCA9PT0gbnVsbCkge1xuICAgIHJldHVybjtcbiAgfVxuICBsZXQgY29udGFpbmVyID0ge307XG4gIGNvbnN0IG9sZCA9IGM0U2hhcGVBcnJheS5maW5kKChjb250YWluZXIyKSA9PiBjb250YWluZXIyLmFsaWFzID09PSBhbGlhcyk7XG4gIGlmIChvbGQgJiYgYWxpYXMgPT09IG9sZC5hbGlhcykge1xuICAgIGNvbnRhaW5lciA9IG9sZDtcbiAgfSBlbHNlIHtcbiAgICBjb250YWluZXIuYWxpYXMgPSBhbGlhcztcbiAgICBjNFNoYXBlQXJyYXkucHVzaChjb250YWluZXIpO1xuICB9XG4gIGlmIChsYWJlbCA9PT0gdm9pZCAwIHx8IGxhYmVsID09PSBudWxsKSB7XG4gICAgY29udGFpbmVyLmxhYmVsID0geyB0ZXh0OiBcIlwiIH07XG4gIH0gZWxzZSB7XG4gICAgY29udGFpbmVyLmxhYmVsID0geyB0ZXh0OiBsYWJlbCB9O1xuICB9XG4gIGlmICh0ZWNobiA9PT0gdm9pZCAwIHx8IHRlY2huID09PSBudWxsKSB7XG4gICAgY29udGFpbmVyLnRlY2huID0geyB0ZXh0OiBcIlwiIH07XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiB0ZWNobiA9PT0gXCJvYmplY3RcIikge1xuICAgICAgbGV0IFtrZXksIHZhbHVlXSA9IE9iamVjdC5lbnRyaWVzKHRlY2huKVswXTtcbiAgICAgIGNvbnRhaW5lcltrZXldID0geyB0ZXh0OiB2YWx1ZSB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250YWluZXIudGVjaG4gPSB7IHRleHQ6IHRlY2huIH07XG4gICAgfVxuICB9XG4gIGlmIChkZXNjciA9PT0gdm9pZCAwIHx8IGRlc2NyID09PSBudWxsKSB7XG4gICAgY29udGFpbmVyLmRlc2NyID0geyB0ZXh0OiBcIlwiIH07XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBkZXNjciA9PT0gXCJvYmplY3RcIikge1xuICAgICAgbGV0IFtrZXksIHZhbHVlXSA9IE9iamVjdC5lbnRyaWVzKGRlc2NyKVswXTtcbiAgICAgIGNvbnRhaW5lcltrZXldID0geyB0ZXh0OiB2YWx1ZSB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250YWluZXIuZGVzY3IgPSB7IHRleHQ6IGRlc2NyIH07XG4gICAgfVxuICB9XG4gIGlmICh0eXBlb2Ygc3ByaXRlID09PSBcIm9iamVjdFwiKSB7XG4gICAgbGV0IFtrZXksIHZhbHVlXSA9IE9iamVjdC5lbnRyaWVzKHNwcml0ZSlbMF07XG4gICAgY29udGFpbmVyW2tleV0gPSB2YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICBjb250YWluZXIuc3ByaXRlID0gc3ByaXRlO1xuICB9XG4gIGlmICh0eXBlb2YgdGFncyA9PT0gXCJvYmplY3RcIikge1xuICAgIGxldCBba2V5LCB2YWx1ZV0gPSBPYmplY3QuZW50cmllcyh0YWdzKVswXTtcbiAgICBjb250YWluZXJba2V5XSA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIGNvbnRhaW5lci50YWdzID0gdGFncztcbiAgfVxuICBpZiAodHlwZW9mIGxpbmsgPT09IFwib2JqZWN0XCIpIHtcbiAgICBsZXQgW2tleSwgdmFsdWVdID0gT2JqZWN0LmVudHJpZXMobGluaylbMF07XG4gICAgY29udGFpbmVyW2tleV0gPSB2YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICBjb250YWluZXIubGluayA9IGxpbms7XG4gIH1cbiAgY29udGFpbmVyLndyYXAgPSBhdXRvV3JhcCgpO1xuICBjb250YWluZXIudHlwZUM0U2hhcGUgPSB7IHRleHQ6IHR5cGVDNFNoYXBlIH07XG4gIGNvbnRhaW5lci5wYXJlbnRCb3VuZGFyeSA9IGN1cnJlbnRCb3VuZGFyeVBhcnNlO1xufSwgXCJhZGRDb250YWluZXJcIik7XG52YXIgYWRkQ29tcG9uZW50ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbih0eXBlQzRTaGFwZSwgYWxpYXMsIGxhYmVsLCB0ZWNobiwgZGVzY3IsIHNwcml0ZSwgdGFncywgbGluaykge1xuICBpZiAoYWxpYXMgPT09IG51bGwgfHwgbGFiZWwgPT09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IGNvbXBvbmVudCA9IHt9O1xuICBjb25zdCBvbGQgPSBjNFNoYXBlQXJyYXkuZmluZCgoY29tcG9uZW50MikgPT4gY29tcG9uZW50Mi5hbGlhcyA9PT0gYWxpYXMpO1xuICBpZiAob2xkICYmIGFsaWFzID09PSBvbGQuYWxpYXMpIHtcbiAgICBjb21wb25lbnQgPSBvbGQ7XG4gIH0gZWxzZSB7XG4gICAgY29tcG9uZW50LmFsaWFzID0gYWxpYXM7XG4gICAgYzRTaGFwZUFycmF5LnB1c2goY29tcG9uZW50KTtcbiAgfVxuICBpZiAobGFiZWwgPT09IHZvaWQgMCB8fCBsYWJlbCA9PT0gbnVsbCkge1xuICAgIGNvbXBvbmVudC5sYWJlbCA9IHsgdGV4dDogXCJcIiB9O1xuICB9IGVsc2Uge1xuICAgIGNvbXBvbmVudC5sYWJlbCA9IHsgdGV4dDogbGFiZWwgfTtcbiAgfVxuICBpZiAodGVjaG4gPT09IHZvaWQgMCB8fCB0ZWNobiA9PT0gbnVsbCkge1xuICAgIGNvbXBvbmVudC50ZWNobiA9IHsgdGV4dDogXCJcIiB9O1xuICB9IGVsc2Uge1xuICAgIGlmICh0eXBlb2YgdGVjaG4gPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGxldCBba2V5LCB2YWx1ZV0gPSBPYmplY3QuZW50cmllcyh0ZWNobilbMF07XG4gICAgICBjb21wb25lbnRba2V5XSA9IHsgdGV4dDogdmFsdWUgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29tcG9uZW50LnRlY2huID0geyB0ZXh0OiB0ZWNobiB9O1xuICAgIH1cbiAgfVxuICBpZiAoZGVzY3IgPT09IHZvaWQgMCB8fCBkZXNjciA9PT0gbnVsbCkge1xuICAgIGNvbXBvbmVudC5kZXNjciA9IHsgdGV4dDogXCJcIiB9O1xuICB9IGVsc2Uge1xuICAgIGlmICh0eXBlb2YgZGVzY3IgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGxldCBba2V5LCB2YWx1ZV0gPSBPYmplY3QuZW50cmllcyhkZXNjcilbMF07XG4gICAgICBjb21wb25lbnRba2V5XSA9IHsgdGV4dDogdmFsdWUgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29tcG9uZW50LmRlc2NyID0geyB0ZXh0OiBkZXNjciB9O1xuICAgIH1cbiAgfVxuICBpZiAodHlwZW9mIHNwcml0ZSA9PT0gXCJvYmplY3RcIikge1xuICAgIGxldCBba2V5LCB2YWx1ZV0gPSBPYmplY3QuZW50cmllcyhzcHJpdGUpWzBdO1xuICAgIGNvbXBvbmVudFtrZXldID0gdmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgY29tcG9uZW50LnNwcml0ZSA9IHNwcml0ZTtcbiAgfVxuICBpZiAodHlwZW9mIHRhZ3MgPT09IFwib2JqZWN0XCIpIHtcbiAgICBsZXQgW2tleSwgdmFsdWVdID0gT2JqZWN0LmVudHJpZXModGFncylbMF07XG4gICAgY29tcG9uZW50W2tleV0gPSB2YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICBjb21wb25lbnQudGFncyA9IHRhZ3M7XG4gIH1cbiAgaWYgKHR5cGVvZiBsaW5rID09PSBcIm9iamVjdFwiKSB7XG4gICAgbGV0IFtrZXksIHZhbHVlXSA9IE9iamVjdC5lbnRyaWVzKGxpbmspWzBdO1xuICAgIGNvbXBvbmVudFtrZXldID0gdmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgY29tcG9uZW50LmxpbmsgPSBsaW5rO1xuICB9XG4gIGNvbXBvbmVudC53cmFwID0gYXV0b1dyYXAoKTtcbiAgY29tcG9uZW50LnR5cGVDNFNoYXBlID0geyB0ZXh0OiB0eXBlQzRTaGFwZSB9O1xuICBjb21wb25lbnQucGFyZW50Qm91bmRhcnkgPSBjdXJyZW50Qm91bmRhcnlQYXJzZTtcbn0sIFwiYWRkQ29tcG9uZW50XCIpO1xudmFyIGFkZFBlcnNvbk9yU3lzdGVtQm91bmRhcnkgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGFsaWFzLCBsYWJlbCwgdHlwZSwgdGFncywgbGluaykge1xuICBpZiAoYWxpYXMgPT09IG51bGwgfHwgbGFiZWwgPT09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IGJvdW5kYXJ5ID0ge307XG4gIGNvbnN0IG9sZCA9IGJvdW5kYXJpZXMuZmluZCgoYm91bmRhcnkyKSA9PiBib3VuZGFyeTIuYWxpYXMgPT09IGFsaWFzKTtcbiAgaWYgKG9sZCAmJiBhbGlhcyA9PT0gb2xkLmFsaWFzKSB7XG4gICAgYm91bmRhcnkgPSBvbGQ7XG4gIH0gZWxzZSB7XG4gICAgYm91bmRhcnkuYWxpYXMgPSBhbGlhcztcbiAgICBib3VuZGFyaWVzLnB1c2goYm91bmRhcnkpO1xuICB9XG4gIGlmIChsYWJlbCA9PT0gdm9pZCAwIHx8IGxhYmVsID09PSBudWxsKSB7XG4gICAgYm91bmRhcnkubGFiZWwgPSB7IHRleHQ6IFwiXCIgfTtcbiAgfSBlbHNlIHtcbiAgICBib3VuZGFyeS5sYWJlbCA9IHsgdGV4dDogbGFiZWwgfTtcbiAgfVxuICBpZiAodHlwZSA9PT0gdm9pZCAwIHx8IHR5cGUgPT09IG51bGwpIHtcbiAgICBib3VuZGFyeS50eXBlID0geyB0ZXh0OiBcInN5c3RlbVwiIH07XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiB0eXBlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBsZXQgW2tleSwgdmFsdWVdID0gT2JqZWN0LmVudHJpZXModHlwZSlbMF07XG4gICAgICBib3VuZGFyeVtrZXldID0geyB0ZXh0OiB2YWx1ZSB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBib3VuZGFyeS50eXBlID0geyB0ZXh0OiB0eXBlIH07XG4gICAgfVxuICB9XG4gIGlmICh0eXBlb2YgdGFncyA9PT0gXCJvYmplY3RcIikge1xuICAgIGxldCBba2V5LCB2YWx1ZV0gPSBPYmplY3QuZW50cmllcyh0YWdzKVswXTtcbiAgICBib3VuZGFyeVtrZXldID0gdmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgYm91bmRhcnkudGFncyA9IHRhZ3M7XG4gIH1cbiAgaWYgKHR5cGVvZiBsaW5rID09PSBcIm9iamVjdFwiKSB7XG4gICAgbGV0IFtrZXksIHZhbHVlXSA9IE9iamVjdC5lbnRyaWVzKGxpbmspWzBdO1xuICAgIGJvdW5kYXJ5W2tleV0gPSB2YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICBib3VuZGFyeS5saW5rID0gbGluaztcbiAgfVxuICBib3VuZGFyeS5wYXJlbnRCb3VuZGFyeSA9IGN1cnJlbnRCb3VuZGFyeVBhcnNlO1xuICBib3VuZGFyeS53cmFwID0gYXV0b1dyYXAoKTtcbiAgcGFyZW50Qm91bmRhcnlQYXJzZSA9IGN1cnJlbnRCb3VuZGFyeVBhcnNlO1xuICBjdXJyZW50Qm91bmRhcnlQYXJzZSA9IGFsaWFzO1xuICBib3VuZGFyeVBhcnNlU3RhY2sucHVzaChwYXJlbnRCb3VuZGFyeVBhcnNlKTtcbn0sIFwiYWRkUGVyc29uT3JTeXN0ZW1Cb3VuZGFyeVwiKTtcbnZhciBhZGRDb250YWluZXJCb3VuZGFyeSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oYWxpYXMsIGxhYmVsLCB0eXBlLCB0YWdzLCBsaW5rKSB7XG4gIGlmIChhbGlhcyA9PT0gbnVsbCB8fCBsYWJlbCA9PT0gbnVsbCkge1xuICAgIHJldHVybjtcbiAgfVxuICBsZXQgYm91bmRhcnkgPSB7fTtcbiAgY29uc3Qgb2xkID0gYm91bmRhcmllcy5maW5kKChib3VuZGFyeTIpID0+IGJvdW5kYXJ5Mi5hbGlhcyA9PT0gYWxpYXMpO1xuICBpZiAob2xkICYmIGFsaWFzID09PSBvbGQuYWxpYXMpIHtcbiAgICBib3VuZGFyeSA9IG9sZDtcbiAgfSBlbHNlIHtcbiAgICBib3VuZGFyeS5hbGlhcyA9IGFsaWFzO1xuICAgIGJvdW5kYXJpZXMucHVzaChib3VuZGFyeSk7XG4gIH1cbiAgaWYgKGxhYmVsID09PSB2b2lkIDAgfHwgbGFiZWwgPT09IG51bGwpIHtcbiAgICBib3VuZGFyeS5sYWJlbCA9IHsgdGV4dDogXCJcIiB9O1xuICB9IGVsc2Uge1xuICAgIGJvdW5kYXJ5LmxhYmVsID0geyB0ZXh0OiBsYWJlbCB9O1xuICB9XG4gIGlmICh0eXBlID09PSB2b2lkIDAgfHwgdHlwZSA9PT0gbnVsbCkge1xuICAgIGJvdW5kYXJ5LnR5cGUgPSB7IHRleHQ6IFwiY29udGFpbmVyXCIgfTtcbiAgfSBlbHNlIHtcbiAgICBpZiAodHlwZW9mIHR5cGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGxldCBba2V5LCB2YWx1ZV0gPSBPYmplY3QuZW50cmllcyh0eXBlKVswXTtcbiAgICAgIGJvdW5kYXJ5W2tleV0gPSB7IHRleHQ6IHZhbHVlIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGJvdW5kYXJ5LnR5cGUgPSB7IHRleHQ6IHR5cGUgfTtcbiAgICB9XG4gIH1cbiAgaWYgKHR5cGVvZiB0YWdzID09PSBcIm9iamVjdFwiKSB7XG4gICAgbGV0IFtrZXksIHZhbHVlXSA9IE9iamVjdC5lbnRyaWVzKHRhZ3MpWzBdO1xuICAgIGJvdW5kYXJ5W2tleV0gPSB2YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICBib3VuZGFyeS50YWdzID0gdGFncztcbiAgfVxuICBpZiAodHlwZW9mIGxpbmsgPT09IFwib2JqZWN0XCIpIHtcbiAgICBsZXQgW2tleSwgdmFsdWVdID0gT2JqZWN0LmVudHJpZXMobGluaylbMF07XG4gICAgYm91bmRhcnlba2V5XSA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIGJvdW5kYXJ5LmxpbmsgPSBsaW5rO1xuICB9XG4gIGJvdW5kYXJ5LnBhcmVudEJvdW5kYXJ5ID0gY3VycmVudEJvdW5kYXJ5UGFyc2U7XG4gIGJvdW5kYXJ5LndyYXAgPSBhdXRvV3JhcCgpO1xuICBwYXJlbnRCb3VuZGFyeVBhcnNlID0gY3VycmVudEJvdW5kYXJ5UGFyc2U7XG4gIGN1cnJlbnRCb3VuZGFyeVBhcnNlID0gYWxpYXM7XG4gIGJvdW5kYXJ5UGFyc2VTdGFjay5wdXNoKHBhcmVudEJvdW5kYXJ5UGFyc2UpO1xufSwgXCJhZGRDb250YWluZXJCb3VuZGFyeVwiKTtcbnZhciBhZGREZXBsb3ltZW50Tm9kZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obm9kZVR5cGUsIGFsaWFzLCBsYWJlbCwgdHlwZSwgZGVzY3IsIHNwcml0ZSwgdGFncywgbGluaykge1xuICBpZiAoYWxpYXMgPT09IG51bGwgfHwgbGFiZWwgPT09IG51bGwpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbGV0IGJvdW5kYXJ5ID0ge307XG4gIGNvbnN0IG9sZCA9IGJvdW5kYXJpZXMuZmluZCgoYm91bmRhcnkyKSA9PiBib3VuZGFyeTIuYWxpYXMgPT09IGFsaWFzKTtcbiAgaWYgKG9sZCAmJiBhbGlhcyA9PT0gb2xkLmFsaWFzKSB7XG4gICAgYm91bmRhcnkgPSBvbGQ7XG4gIH0gZWxzZSB7XG4gICAgYm91bmRhcnkuYWxpYXMgPSBhbGlhcztcbiAgICBib3VuZGFyaWVzLnB1c2goYm91bmRhcnkpO1xuICB9XG4gIGlmIChsYWJlbCA9PT0gdm9pZCAwIHx8IGxhYmVsID09PSBudWxsKSB7XG4gICAgYm91bmRhcnkubGFiZWwgPSB7IHRleHQ6IFwiXCIgfTtcbiAgfSBlbHNlIHtcbiAgICBib3VuZGFyeS5sYWJlbCA9IHsgdGV4dDogbGFiZWwgfTtcbiAgfVxuICBpZiAodHlwZSA9PT0gdm9pZCAwIHx8IHR5cGUgPT09IG51bGwpIHtcbiAgICBib3VuZGFyeS50eXBlID0geyB0ZXh0OiBcIm5vZGVcIiB9O1xuICB9IGVsc2Uge1xuICAgIGlmICh0eXBlb2YgdHlwZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgbGV0IFtrZXksIHZhbHVlXSA9IE9iamVjdC5lbnRyaWVzKHR5cGUpWzBdO1xuICAgICAgYm91bmRhcnlba2V5XSA9IHsgdGV4dDogdmFsdWUgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgYm91bmRhcnkudHlwZSA9IHsgdGV4dDogdHlwZSB9O1xuICAgIH1cbiAgfVxuICBpZiAoZGVzY3IgPT09IHZvaWQgMCB8fCBkZXNjciA9PT0gbnVsbCkge1xuICAgIGJvdW5kYXJ5LmRlc2NyID0geyB0ZXh0OiBcIlwiIH07XG4gIH0gZWxzZSB7XG4gICAgaWYgKHR5cGVvZiBkZXNjciA9PT0gXCJvYmplY3RcIikge1xuICAgICAgbGV0IFtrZXksIHZhbHVlXSA9IE9iamVjdC5lbnRyaWVzKGRlc2NyKVswXTtcbiAgICAgIGJvdW5kYXJ5W2tleV0gPSB7IHRleHQ6IHZhbHVlIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGJvdW5kYXJ5LmRlc2NyID0geyB0ZXh0OiBkZXNjciB9O1xuICAgIH1cbiAgfVxuICBpZiAodHlwZW9mIHRhZ3MgPT09IFwib2JqZWN0XCIpIHtcbiAgICBsZXQgW2tleSwgdmFsdWVdID0gT2JqZWN0LmVudHJpZXModGFncylbMF07XG4gICAgYm91bmRhcnlba2V5XSA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIGJvdW5kYXJ5LnRhZ3MgPSB0YWdzO1xuICB9XG4gIGlmICh0eXBlb2YgbGluayA9PT0gXCJvYmplY3RcIikge1xuICAgIGxldCBba2V5LCB2YWx1ZV0gPSBPYmplY3QuZW50cmllcyhsaW5rKVswXTtcbiAgICBib3VuZGFyeVtrZXldID0gdmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgYm91bmRhcnkubGluayA9IGxpbms7XG4gIH1cbiAgYm91bmRhcnkubm9kZVR5cGUgPSBub2RlVHlwZTtcbiAgYm91bmRhcnkucGFyZW50Qm91bmRhcnkgPSBjdXJyZW50Qm91bmRhcnlQYXJzZTtcbiAgYm91bmRhcnkud3JhcCA9IGF1dG9XcmFwKCk7XG4gIHBhcmVudEJvdW5kYXJ5UGFyc2UgPSBjdXJyZW50Qm91bmRhcnlQYXJzZTtcbiAgY3VycmVudEJvdW5kYXJ5UGFyc2UgPSBhbGlhcztcbiAgYm91bmRhcnlQYXJzZVN0YWNrLnB1c2gocGFyZW50Qm91bmRhcnlQYXJzZSk7XG59LCBcImFkZERlcGxveW1lbnROb2RlXCIpO1xudmFyIHBvcEJvdW5kYXJ5UGFyc2VTdGFjayA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gIGN1cnJlbnRCb3VuZGFyeVBhcnNlID0gcGFyZW50Qm91bmRhcnlQYXJzZTtcbiAgYm91bmRhcnlQYXJzZVN0YWNrLnBvcCgpO1xuICBwYXJlbnRCb3VuZGFyeVBhcnNlID0gYm91bmRhcnlQYXJzZVN0YWNrLnBvcCgpO1xuICBib3VuZGFyeVBhcnNlU3RhY2sucHVzaChwYXJlbnRCb3VuZGFyeVBhcnNlKTtcbn0sIFwicG9wQm91bmRhcnlQYXJzZVN0YWNrXCIpO1xudmFyIHVwZGF0ZUVsU3R5bGUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHR5cGVDNFNoYXBlLCBlbGVtZW50TmFtZSwgYmdDb2xvciwgZm9udENvbG9yLCBib3JkZXJDb2xvciwgc2hhZG93aW5nLCBzaGFwZSwgc3ByaXRlLCB0ZWNobiwgbGVnZW5kVGV4dCwgbGVnZW5kU3ByaXRlKSB7XG4gIGxldCBvbGQgPSBjNFNoYXBlQXJyYXkuZmluZCgoZWxlbWVudCkgPT4gZWxlbWVudC5hbGlhcyA9PT0gZWxlbWVudE5hbWUpO1xuICBpZiAob2xkID09PSB2b2lkIDApIHtcbiAgICBvbGQgPSBib3VuZGFyaWVzLmZpbmQoKGVsZW1lbnQpID0+IGVsZW1lbnQuYWxpYXMgPT09IGVsZW1lbnROYW1lKTtcbiAgICBpZiAob2xkID09PSB2b2lkIDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbiAgaWYgKGJnQ29sb3IgIT09IHZvaWQgMCAmJiBiZ0NvbG9yICE9PSBudWxsKSB7XG4gICAgaWYgKHR5cGVvZiBiZ0NvbG9yID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBsZXQgW2tleSwgdmFsdWVdID0gT2JqZWN0LmVudHJpZXMoYmdDb2xvcilbMF07XG4gICAgICBvbGRba2V5XSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBvbGQuYmdDb2xvciA9IGJnQ29sb3I7XG4gICAgfVxuICB9XG4gIGlmIChmb250Q29sb3IgIT09IHZvaWQgMCAmJiBmb250Q29sb3IgIT09IG51bGwpIHtcbiAgICBpZiAodHlwZW9mIGZvbnRDb2xvciA9PT0gXCJvYmplY3RcIikge1xuICAgICAgbGV0IFtrZXksIHZhbHVlXSA9IE9iamVjdC5lbnRyaWVzKGZvbnRDb2xvcilbMF07XG4gICAgICBvbGRba2V5XSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBvbGQuZm9udENvbG9yID0gZm9udENvbG9yO1xuICAgIH1cbiAgfVxuICBpZiAoYm9yZGVyQ29sb3IgIT09IHZvaWQgMCAmJiBib3JkZXJDb2xvciAhPT0gbnVsbCkge1xuICAgIGlmICh0eXBlb2YgYm9yZGVyQ29sb3IgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGxldCBba2V5LCB2YWx1ZV0gPSBPYmplY3QuZW50cmllcyhib3JkZXJDb2xvcilbMF07XG4gICAgICBvbGRba2V5XSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBvbGQuYm9yZGVyQ29sb3IgPSBib3JkZXJDb2xvcjtcbiAgICB9XG4gIH1cbiAgaWYgKHNoYWRvd2luZyAhPT0gdm9pZCAwICYmIHNoYWRvd2luZyAhPT0gbnVsbCkge1xuICAgIGlmICh0eXBlb2Ygc2hhZG93aW5nID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBsZXQgW2tleSwgdmFsdWVdID0gT2JqZWN0LmVudHJpZXMoc2hhZG93aW5nKVswXTtcbiAgICAgIG9sZFtrZXldID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9sZC5zaGFkb3dpbmcgPSBzaGFkb3dpbmc7XG4gICAgfVxuICB9XG4gIGlmIChzaGFwZSAhPT0gdm9pZCAwICYmIHNoYXBlICE9PSBudWxsKSB7XG4gICAgaWYgKHR5cGVvZiBzaGFwZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgbGV0IFtrZXksIHZhbHVlXSA9IE9iamVjdC5lbnRyaWVzKHNoYXBlKVswXTtcbiAgICAgIG9sZFtrZXldID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9sZC5zaGFwZSA9IHNoYXBlO1xuICAgIH1cbiAgfVxuICBpZiAoc3ByaXRlICE9PSB2b2lkIDAgJiYgc3ByaXRlICE9PSBudWxsKSB7XG4gICAgaWYgKHR5cGVvZiBzcHJpdGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGxldCBba2V5LCB2YWx1ZV0gPSBPYmplY3QuZW50cmllcyhzcHJpdGUpWzBdO1xuICAgICAgb2xkW2tleV0gPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2xkLnNwcml0ZSA9IHNwcml0ZTtcbiAgICB9XG4gIH1cbiAgaWYgKHRlY2huICE9PSB2b2lkIDAgJiYgdGVjaG4gIT09IG51bGwpIHtcbiAgICBpZiAodHlwZW9mIHRlY2huID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBsZXQgW2tleSwgdmFsdWVdID0gT2JqZWN0LmVudHJpZXModGVjaG4pWzBdO1xuICAgICAgb2xkW2tleV0gPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2xkLnRlY2huID0gdGVjaG47XG4gICAgfVxuICB9XG4gIGlmIChsZWdlbmRUZXh0ICE9PSB2b2lkIDAgJiYgbGVnZW5kVGV4dCAhPT0gbnVsbCkge1xuICAgIGlmICh0eXBlb2YgbGVnZW5kVGV4dCA9PT0gXCJvYmplY3RcIikge1xuICAgICAgbGV0IFtrZXksIHZhbHVlXSA9IE9iamVjdC5lbnRyaWVzKGxlZ2VuZFRleHQpWzBdO1xuICAgICAgb2xkW2tleV0gPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2xkLmxlZ2VuZFRleHQgPSBsZWdlbmRUZXh0O1xuICAgIH1cbiAgfVxuICBpZiAobGVnZW5kU3ByaXRlICE9PSB2b2lkIDAgJiYgbGVnZW5kU3ByaXRlICE9PSBudWxsKSB7XG4gICAgaWYgKHR5cGVvZiBsZWdlbmRTcHJpdGUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGxldCBba2V5LCB2YWx1ZV0gPSBPYmplY3QuZW50cmllcyhsZWdlbmRTcHJpdGUpWzBdO1xuICAgICAgb2xkW2tleV0gPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2xkLmxlZ2VuZFNwcml0ZSA9IGxlZ2VuZFNwcml0ZTtcbiAgICB9XG4gIH1cbn0sIFwidXBkYXRlRWxTdHlsZVwiKTtcbnZhciB1cGRhdGVSZWxTdHlsZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24odHlwZUM0U2hhcGUsIGZyb20sIHRvLCB0ZXh0Q29sb3IsIGxpbmVDb2xvciwgb2Zmc2V0WCwgb2Zmc2V0WSkge1xuICBjb25zdCBvbGQgPSByZWxzLmZpbmQoKHJlbCkgPT4gcmVsLmZyb20gPT09IGZyb20gJiYgcmVsLnRvID09PSB0byk7XG4gIGlmIChvbGQgPT09IHZvaWQgMCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAodGV4dENvbG9yICE9PSB2b2lkIDAgJiYgdGV4dENvbG9yICE9PSBudWxsKSB7XG4gICAgaWYgKHR5cGVvZiB0ZXh0Q29sb3IgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGxldCBba2V5LCB2YWx1ZV0gPSBPYmplY3QuZW50cmllcyh0ZXh0Q29sb3IpWzBdO1xuICAgICAgb2xkW2tleV0gPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2xkLnRleHRDb2xvciA9IHRleHRDb2xvcjtcbiAgICB9XG4gIH1cbiAgaWYgKGxpbmVDb2xvciAhPT0gdm9pZCAwICYmIGxpbmVDb2xvciAhPT0gbnVsbCkge1xuICAgIGlmICh0eXBlb2YgbGluZUNvbG9yID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBsZXQgW2tleSwgdmFsdWVdID0gT2JqZWN0LmVudHJpZXMobGluZUNvbG9yKVswXTtcbiAgICAgIG9sZFtrZXldID0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9sZC5saW5lQ29sb3IgPSBsaW5lQ29sb3I7XG4gICAgfVxuICB9XG4gIGlmIChvZmZzZXRYICE9PSB2b2lkIDAgJiYgb2Zmc2V0WCAhPT0gbnVsbCkge1xuICAgIGlmICh0eXBlb2Ygb2Zmc2V0WCA9PT0gXCJvYmplY3RcIikge1xuICAgICAgbGV0IFtrZXksIHZhbHVlXSA9IE9iamVjdC5lbnRyaWVzKG9mZnNldFgpWzBdO1xuICAgICAgb2xkW2tleV0gPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9sZC5vZmZzZXRYID0gcGFyc2VJbnQob2Zmc2V0WCk7XG4gICAgfVxuICB9XG4gIGlmIChvZmZzZXRZICE9PSB2b2lkIDAgJiYgb2Zmc2V0WSAhPT0gbnVsbCkge1xuICAgIGlmICh0eXBlb2Ygb2Zmc2V0WSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgbGV0IFtrZXksIHZhbHVlXSA9IE9iamVjdC5lbnRyaWVzKG9mZnNldFkpWzBdO1xuICAgICAgb2xkW2tleV0gPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9sZC5vZmZzZXRZID0gcGFyc2VJbnQob2Zmc2V0WSk7XG4gICAgfVxuICB9XG59LCBcInVwZGF0ZVJlbFN0eWxlXCIpO1xudmFyIHVwZGF0ZUxheW91dENvbmZpZyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24odHlwZUM0U2hhcGUsIGM0U2hhcGVJblJvd1BhcmFtLCBjNEJvdW5kYXJ5SW5Sb3dQYXJhbSkge1xuICBsZXQgYzRTaGFwZUluUm93VmFsdWUgPSBjNFNoYXBlSW5Sb3c7XG4gIGxldCBjNEJvdW5kYXJ5SW5Sb3dWYWx1ZSA9IGM0Qm91bmRhcnlJblJvdztcbiAgaWYgKHR5cGVvZiBjNFNoYXBlSW5Sb3dQYXJhbSA9PT0gXCJvYmplY3RcIikge1xuICAgIGNvbnN0IHZhbHVlID0gT2JqZWN0LnZhbHVlcyhjNFNoYXBlSW5Sb3dQYXJhbSlbMF07XG4gICAgYzRTaGFwZUluUm93VmFsdWUgPSBwYXJzZUludCh2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgYzRTaGFwZUluUm93VmFsdWUgPSBwYXJzZUludChjNFNoYXBlSW5Sb3dQYXJhbSk7XG4gIH1cbiAgaWYgKHR5cGVvZiBjNEJvdW5kYXJ5SW5Sb3dQYXJhbSA9PT0gXCJvYmplY3RcIikge1xuICAgIGNvbnN0IHZhbHVlID0gT2JqZWN0LnZhbHVlcyhjNEJvdW5kYXJ5SW5Sb3dQYXJhbSlbMF07XG4gICAgYzRCb3VuZGFyeUluUm93VmFsdWUgPSBwYXJzZUludCh2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgYzRCb3VuZGFyeUluUm93VmFsdWUgPSBwYXJzZUludChjNEJvdW5kYXJ5SW5Sb3dQYXJhbSk7XG4gIH1cbiAgaWYgKGM0U2hhcGVJblJvd1ZhbHVlID49IDEpIHtcbiAgICBjNFNoYXBlSW5Sb3cgPSBjNFNoYXBlSW5Sb3dWYWx1ZTtcbiAgfVxuICBpZiAoYzRCb3VuZGFyeUluUm93VmFsdWUgPj0gMSkge1xuICAgIGM0Qm91bmRhcnlJblJvdyA9IGM0Qm91bmRhcnlJblJvd1ZhbHVlO1xuICB9XG59LCBcInVwZGF0ZUxheW91dENvbmZpZ1wiKTtcbnZhciBnZXRDNFNoYXBlSW5Sb3cgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gYzRTaGFwZUluUm93O1xufSwgXCJnZXRDNFNoYXBlSW5Sb3dcIik7XG52YXIgZ2V0QzRCb3VuZGFyeUluUm93ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGM0Qm91bmRhcnlJblJvdztcbn0sIFwiZ2V0QzRCb3VuZGFyeUluUm93XCIpO1xudmFyIGdldEN1cnJlbnRCb3VuZGFyeVBhcnNlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGN1cnJlbnRCb3VuZGFyeVBhcnNlO1xufSwgXCJnZXRDdXJyZW50Qm91bmRhcnlQYXJzZVwiKTtcbnZhciBnZXRQYXJlbnRCb3VuZGFyeVBhcnNlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHBhcmVudEJvdW5kYXJ5UGFyc2U7XG59LCBcImdldFBhcmVudEJvdW5kYXJ5UGFyc2VcIik7XG52YXIgZ2V0QzRTaGFwZUFycmF5ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihwYXJlbnRCb3VuZGFyeSkge1xuICBpZiAocGFyZW50Qm91bmRhcnkgPT09IHZvaWQgMCB8fCBwYXJlbnRCb3VuZGFyeSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBjNFNoYXBlQXJyYXk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGM0U2hhcGVBcnJheS5maWx0ZXIoKHBlcnNvbk9yU3lzdGVtKSA9PiB7XG4gICAgICByZXR1cm4gcGVyc29uT3JTeXN0ZW0ucGFyZW50Qm91bmRhcnkgPT09IHBhcmVudEJvdW5kYXJ5O1xuICAgIH0pO1xuICB9XG59LCBcImdldEM0U2hhcGVBcnJheVwiKTtcbnZhciBnZXRDNFNoYXBlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihhbGlhcykge1xuICByZXR1cm4gYzRTaGFwZUFycmF5LmZpbmQoKHBlcnNvbk9yU3lzdGVtKSA9PiBwZXJzb25PclN5c3RlbS5hbGlhcyA9PT0gYWxpYXMpO1xufSwgXCJnZXRDNFNoYXBlXCIpO1xudmFyIGdldEM0U2hhcGVLZXlzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihwYXJlbnRCb3VuZGFyeSkge1xuICByZXR1cm4gT2JqZWN0LmtleXMoZ2V0QzRTaGFwZUFycmF5KHBhcmVudEJvdW5kYXJ5KSk7XG59LCBcImdldEM0U2hhcGVLZXlzXCIpO1xudmFyIGdldEJvdW5kYXJpZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHBhcmVudEJvdW5kYXJ5KSB7XG4gIGlmIChwYXJlbnRCb3VuZGFyeSA9PT0gdm9pZCAwIHx8IHBhcmVudEJvdW5kYXJ5ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGJvdW5kYXJpZXM7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJvdW5kYXJpZXMuZmlsdGVyKChib3VuZGFyeSkgPT4gYm91bmRhcnkucGFyZW50Qm91bmRhcnkgPT09IHBhcmVudEJvdW5kYXJ5KTtcbiAgfVxufSwgXCJnZXRCb3VuZGFyaWVzXCIpO1xudmFyIGdldEJvdW5kYXJ5cyA9IGdldEJvdW5kYXJpZXM7XG52YXIgZ2V0UmVscyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gIHJldHVybiByZWxzO1xufSwgXCJnZXRSZWxzXCIpO1xudmFyIGdldFRpdGxlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRpdGxlO1xufSwgXCJnZXRUaXRsZVwiKTtcbnZhciBzZXRXcmFwID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbih3cmFwU2V0dGluZykge1xuICB3cmFwRW5hYmxlZCA9IHdyYXBTZXR0aW5nO1xufSwgXCJzZXRXcmFwXCIpO1xudmFyIGF1dG9XcmFwID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHdyYXBFbmFibGVkO1xufSwgXCJhdXRvV3JhcFwiKTtcbnZhciBjbGVhciA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gIGM0U2hhcGVBcnJheSA9IFtdO1xuICBib3VuZGFyaWVzID0gW1xuICAgIHtcbiAgICAgIGFsaWFzOiBcImdsb2JhbFwiLFxuICAgICAgbGFiZWw6IHsgdGV4dDogXCJnbG9iYWxcIiB9LFxuICAgICAgdHlwZTogeyB0ZXh0OiBcImdsb2JhbFwiIH0sXG4gICAgICB0YWdzOiBudWxsLFxuICAgICAgbGluazogbnVsbCxcbiAgICAgIHBhcmVudEJvdW5kYXJ5OiBcIlwiXG4gICAgfVxuICBdO1xuICBwYXJlbnRCb3VuZGFyeVBhcnNlID0gXCJcIjtcbiAgY3VycmVudEJvdW5kYXJ5UGFyc2UgPSBcImdsb2JhbFwiO1xuICBib3VuZGFyeVBhcnNlU3RhY2sgPSBbXCJcIl07XG4gIHJlbHMgPSBbXTtcbiAgYm91bmRhcnlQYXJzZVN0YWNrID0gW1wiXCJdO1xuICB0aXRsZSA9IFwiXCI7XG4gIHdyYXBFbmFibGVkID0gZmFsc2U7XG4gIGM0U2hhcGVJblJvdyA9IDQ7XG4gIGM0Qm91bmRhcnlJblJvdyA9IDI7XG59LCBcImNsZWFyXCIpO1xudmFyIExJTkVUWVBFID0ge1xuICBTT0xJRDogMCxcbiAgRE9UVEVEOiAxLFxuICBOT1RFOiAyLFxuICBTT0xJRF9DUk9TUzogMyxcbiAgRE9UVEVEX0NST1NTOiA0LFxuICBTT0xJRF9PUEVOOiA1LFxuICBET1RURURfT1BFTjogNixcbiAgTE9PUF9TVEFSVDogMTAsXG4gIExPT1BfRU5EOiAxMSxcbiAgQUxUX1NUQVJUOiAxMixcbiAgQUxUX0VMU0U6IDEzLFxuICBBTFRfRU5EOiAxNCxcbiAgT1BUX1NUQVJUOiAxNSxcbiAgT1BUX0VORDogMTYsXG4gIEFDVElWRV9TVEFSVDogMTcsXG4gIEFDVElWRV9FTkQ6IDE4LFxuICBQQVJfU1RBUlQ6IDE5LFxuICBQQVJfQU5EOiAyMCxcbiAgUEFSX0VORDogMjEsXG4gIFJFQ1RfU1RBUlQ6IDIyLFxuICBSRUNUX0VORDogMjMsXG4gIFNPTElEX1BPSU5UOiAyNCxcbiAgRE9UVEVEX1BPSU5UOiAyNVxufTtcbnZhciBBUlJPV1RZUEUgPSB7XG4gIEZJTExFRDogMCxcbiAgT1BFTjogMVxufTtcbnZhciBQTEFDRU1FTlQgPSB7XG4gIExFRlRPRjogMCxcbiAgUklHSFRPRjogMSxcbiAgT1ZFUjogMlxufTtcbnZhciBzZXRUaXRsZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24odHh0KSB7XG4gIGxldCBzYW5pdGl6ZWRUZXh0ID0gc2FuaXRpemVUZXh0KHR4dCwgZ2V0Q29uZmlnKCkpO1xuICB0aXRsZSA9IHNhbml0aXplZFRleHQ7XG59LCBcInNldFRpdGxlXCIpO1xudmFyIGM0RGJfZGVmYXVsdCA9IHtcbiAgYWRkUGVyc29uT3JTeXN0ZW0sXG4gIGFkZFBlcnNvbk9yU3lzdGVtQm91bmRhcnksXG4gIGFkZENvbnRhaW5lcixcbiAgYWRkQ29udGFpbmVyQm91bmRhcnksXG4gIGFkZENvbXBvbmVudCxcbiAgYWRkRGVwbG95bWVudE5vZGUsXG4gIHBvcEJvdW5kYXJ5UGFyc2VTdGFjayxcbiAgYWRkUmVsLFxuICB1cGRhdGVFbFN0eWxlLFxuICB1cGRhdGVSZWxTdHlsZSxcbiAgdXBkYXRlTGF5b3V0Q29uZmlnLFxuICBhdXRvV3JhcCxcbiAgc2V0V3JhcCxcbiAgZ2V0QzRTaGFwZUFycmF5LFxuICBnZXRDNFNoYXBlLFxuICBnZXRDNFNoYXBlS2V5cyxcbiAgZ2V0Qm91bmRhcmllcyxcbiAgZ2V0Qm91bmRhcnlzLFxuICBnZXRDdXJyZW50Qm91bmRhcnlQYXJzZSxcbiAgZ2V0UGFyZW50Qm91bmRhcnlQYXJzZSxcbiAgZ2V0UmVscyxcbiAgZ2V0VGl0bGUsXG4gIGdldEM0VHlwZSxcbiAgZ2V0QzRTaGFwZUluUm93LFxuICBnZXRDNEJvdW5kYXJ5SW5Sb3csXG4gIHNldEFjY1RpdGxlLFxuICBnZXRBY2NUaXRsZSxcbiAgZ2V0QWNjRGVzY3JpcHRpb24sXG4gIHNldEFjY0Rlc2NyaXB0aW9uLFxuICBnZXRDb25maWc6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKCkgPT4gZ2V0Q29uZmlnKCkuYzQsIFwiZ2V0Q29uZmlnXCIpLFxuICBjbGVhcixcbiAgTElORVRZUEUsXG4gIEFSUk9XVFlQRSxcbiAgUExBQ0VNRU5ULFxuICBzZXRUaXRsZSxcbiAgc2V0QzRUeXBlXG4gIC8vIGFwcGx5LFxufTtcblxuLy8gc3JjL2RpYWdyYW1zL2M0L2M0UmVuZGVyZXIuanNcbmltcG9ydCB7IHNlbGVjdCB9IGZyb20gXCJkM1wiO1xuXG4vLyBzcmMvZGlhZ3JhbXMvYzQvc3ZnRHJhdy5qc1xuaW1wb3J0IHsgc2FuaXRpemVVcmwgfSBmcm9tIFwiQGJyYWludHJlZS9zYW5pdGl6ZS11cmxcIjtcbnZhciBkcmF3UmVjdDIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIHJlY3REYXRhKSB7XG4gIHJldHVybiBkcmF3UmVjdChlbGVtLCByZWN0RGF0YSk7XG59LCBcImRyYXdSZWN0XCIpO1xudmFyIGRyYXdJbWFnZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbSwgd2lkdGgsIGhlaWdodCwgeCwgeSwgbGluaykge1xuICBjb25zdCBpbWFnZUVsZW0gPSBlbGVtLmFwcGVuZChcImltYWdlXCIpO1xuICBpbWFnZUVsZW0uYXR0cihcIndpZHRoXCIsIHdpZHRoKTtcbiAgaW1hZ2VFbGVtLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcbiAgaW1hZ2VFbGVtLmF0dHIoXCJ4XCIsIHgpO1xuICBpbWFnZUVsZW0uYXR0cihcInlcIiwgeSk7XG4gIGxldCBzYW5pdGl6ZWRMaW5rID0gbGluay5zdGFydHNXaXRoKFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0XCIpID8gbGluayA6IHNhbml0aXplVXJsKGxpbmspO1xuICBpbWFnZUVsZW0uYXR0cihcInhsaW5rOmhyZWZcIiwgc2FuaXRpemVkTGluayk7XG59LCBcImRyYXdJbWFnZVwiKTtcbnZhciBkcmF3UmVscyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGVsZW0sIHJlbHMyLCBjb25mMiwgZGlhZ3JhbUlkKSA9PiB7XG4gIGNvbnN0IHJlbHNFbGVtID0gZWxlbS5hcHBlbmQoXCJnXCIpO1xuICBsZXQgaSA9IDA7XG4gIGZvciAobGV0IHJlbCBvZiByZWxzMikge1xuICAgIGxldCB0ZXh0Q29sb3IgPSByZWwudGV4dENvbG9yID8gcmVsLnRleHRDb2xvciA6IFwiIzQ0NDQ0NFwiO1xuICAgIGxldCBzdHJva2VDb2xvciA9IHJlbC5saW5lQ29sb3IgPyByZWwubGluZUNvbG9yIDogXCIjNDQ0NDQ0XCI7XG4gICAgbGV0IG9mZnNldFggPSByZWwub2Zmc2V0WCA/IHBhcnNlSW50KHJlbC5vZmZzZXRYKSA6IDA7XG4gICAgbGV0IG9mZnNldFkgPSByZWwub2Zmc2V0WSA/IHBhcnNlSW50KHJlbC5vZmZzZXRZKSA6IDA7XG4gICAgbGV0IHVybCA9IFwiXCI7XG4gICAgaWYgKGkgPT09IDApIHtcbiAgICAgIGxldCBsaW5lID0gcmVsc0VsZW0uYXBwZW5kKFwibGluZVwiKTtcbiAgICAgIGxpbmUuYXR0cihcIngxXCIsIHJlbC5zdGFydFBvaW50LngpO1xuICAgICAgbGluZS5hdHRyKFwieTFcIiwgcmVsLnN0YXJ0UG9pbnQueSk7XG4gICAgICBsaW5lLmF0dHIoXCJ4MlwiLCByZWwuZW5kUG9pbnQueCk7XG4gICAgICBsaW5lLmF0dHIoXCJ5MlwiLCByZWwuZW5kUG9pbnQueSk7XG4gICAgICBsaW5lLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgXCIxXCIpO1xuICAgICAgbGluZS5hdHRyKFwic3Ryb2tlXCIsIHN0cm9rZUNvbG9yKTtcbiAgICAgIGxpbmUuc3R5bGUoXCJmaWxsXCIsIFwibm9uZVwiKTtcbiAgICAgIGlmIChyZWwudHlwZSAhPT0gXCJyZWxfYlwiKSB7XG4gICAgICAgIGxpbmUuYXR0cihcIm1hcmtlci1lbmRcIiwgXCJ1cmwoXCIgKyB1cmwgKyBcIiNcIiArIGRpYWdyYW1JZCArIFwiLWFycm93aGVhZClcIik7XG4gICAgICB9XG4gICAgICBpZiAocmVsLnR5cGUgPT09IFwiYmlyZWxcIiB8fCByZWwudHlwZSA9PT0gXCJyZWxfYlwiKSB7XG4gICAgICAgIGxpbmUuYXR0cihcIm1hcmtlci1zdGFydFwiLCBcInVybChcIiArIHVybCArIFwiI1wiICsgZGlhZ3JhbUlkICsgXCItYXJyb3dlbmQpXCIpO1xuICAgICAgfVxuICAgICAgaSA9IC0xO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgbGluZSA9IHJlbHNFbGVtLmFwcGVuZChcInBhdGhcIik7XG4gICAgICBsaW5lLmF0dHIoXCJmaWxsXCIsIFwibm9uZVwiKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIFwiMVwiKS5hdHRyKFwic3Ryb2tlXCIsIHN0cm9rZUNvbG9yKS5hdHRyKFxuICAgICAgICBcImRcIixcbiAgICAgICAgXCJNc3RhcnR4LHN0YXJ0eSBRY29udHJvbHgsY29udHJvbHkgc3RvcHgsc3RvcHkgXCIucmVwbGFjZUFsbChcInN0YXJ0eFwiLCByZWwuc3RhcnRQb2ludC54KS5yZXBsYWNlQWxsKFwic3RhcnR5XCIsIHJlbC5zdGFydFBvaW50LnkpLnJlcGxhY2VBbGwoXG4gICAgICAgICAgXCJjb250cm9seFwiLFxuICAgICAgICAgIHJlbC5zdGFydFBvaW50LnggKyAocmVsLmVuZFBvaW50LnggLSByZWwuc3RhcnRQb2ludC54KSAvIDIgLSAocmVsLmVuZFBvaW50LnggLSByZWwuc3RhcnRQb2ludC54KSAvIDRcbiAgICAgICAgKS5yZXBsYWNlQWxsKFwiY29udHJvbHlcIiwgcmVsLnN0YXJ0UG9pbnQueSArIChyZWwuZW5kUG9pbnQueSAtIHJlbC5zdGFydFBvaW50LnkpIC8gMikucmVwbGFjZUFsbChcInN0b3B4XCIsIHJlbC5lbmRQb2ludC54KS5yZXBsYWNlQWxsKFwic3RvcHlcIiwgcmVsLmVuZFBvaW50LnkpXG4gICAgICApO1xuICAgICAgaWYgKHJlbC50eXBlICE9PSBcInJlbF9iXCIpIHtcbiAgICAgICAgbGluZS5hdHRyKFwibWFya2VyLWVuZFwiLCBcInVybChcIiArIHVybCArIFwiI1wiICsgZGlhZ3JhbUlkICsgXCItYXJyb3doZWFkKVwiKTtcbiAgICAgIH1cbiAgICAgIGlmIChyZWwudHlwZSA9PT0gXCJiaXJlbFwiIHx8IHJlbC50eXBlID09PSBcInJlbF9iXCIpIHtcbiAgICAgICAgbGluZS5hdHRyKFwibWFya2VyLXN0YXJ0XCIsIFwidXJsKFwiICsgdXJsICsgXCIjXCIgKyBkaWFncmFtSWQgKyBcIi1hcnJvd2VuZClcIik7XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBtZXNzYWdlQ29uZiA9IGNvbmYyLm1lc3NhZ2VGb250KCk7XG4gICAgX2RyYXdUZXh0Q2FuZGlkYXRlRnVuYyhjb25mMikoXG4gICAgICByZWwubGFiZWwudGV4dCxcbiAgICAgIHJlbHNFbGVtLFxuICAgICAgTWF0aC5taW4ocmVsLnN0YXJ0UG9pbnQueCwgcmVsLmVuZFBvaW50LngpICsgTWF0aC5hYnMocmVsLmVuZFBvaW50LnggLSByZWwuc3RhcnRQb2ludC54KSAvIDIgKyBvZmZzZXRYLFxuICAgICAgTWF0aC5taW4ocmVsLnN0YXJ0UG9pbnQueSwgcmVsLmVuZFBvaW50LnkpICsgTWF0aC5hYnMocmVsLmVuZFBvaW50LnkgLSByZWwuc3RhcnRQb2ludC55KSAvIDIgKyBvZmZzZXRZLFxuICAgICAgcmVsLmxhYmVsLndpZHRoLFxuICAgICAgcmVsLmxhYmVsLmhlaWdodCxcbiAgICAgIHsgZmlsbDogdGV4dENvbG9yIH0sXG4gICAgICBtZXNzYWdlQ29uZlxuICAgICk7XG4gICAgaWYgKHJlbC50ZWNobiAmJiByZWwudGVjaG4udGV4dCAhPT0gXCJcIikge1xuICAgICAgbWVzc2FnZUNvbmYgPSBjb25mMi5tZXNzYWdlRm9udCgpO1xuICAgICAgX2RyYXdUZXh0Q2FuZGlkYXRlRnVuYyhjb25mMikoXG4gICAgICAgIFwiW1wiICsgcmVsLnRlY2huLnRleHQgKyBcIl1cIixcbiAgICAgICAgcmVsc0VsZW0sXG4gICAgICAgIE1hdGgubWluKHJlbC5zdGFydFBvaW50LngsIHJlbC5lbmRQb2ludC54KSArIE1hdGguYWJzKHJlbC5lbmRQb2ludC54IC0gcmVsLnN0YXJ0UG9pbnQueCkgLyAyICsgb2Zmc2V0WCxcbiAgICAgICAgTWF0aC5taW4ocmVsLnN0YXJ0UG9pbnQueSwgcmVsLmVuZFBvaW50LnkpICsgTWF0aC5hYnMocmVsLmVuZFBvaW50LnkgLSByZWwuc3RhcnRQb2ludC55KSAvIDIgKyBjb25mMi5tZXNzYWdlRm9udFNpemUgKyA1ICsgb2Zmc2V0WSxcbiAgICAgICAgTWF0aC5tYXgocmVsLmxhYmVsLndpZHRoLCByZWwudGVjaG4ud2lkdGgpLFxuICAgICAgICByZWwudGVjaG4uaGVpZ2h0LFxuICAgICAgICB7IGZpbGw6IHRleHRDb2xvciwgXCJmb250LXN0eWxlXCI6IFwiaXRhbGljXCIgfSxcbiAgICAgICAgbWVzc2FnZUNvbmZcbiAgICAgICk7XG4gICAgfVxuICB9XG59LCBcImRyYXdSZWxzXCIpO1xudmFyIGRyYXdCb3VuZGFyeSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbSwgYm91bmRhcnksIGNvbmYyKSB7XG4gIGNvbnN0IGJvdW5kYXJ5RWxlbSA9IGVsZW0uYXBwZW5kKFwiZ1wiKTtcbiAgbGV0IGZpbGxDb2xvciA9IGJvdW5kYXJ5LmJnQ29sb3IgPyBib3VuZGFyeS5iZ0NvbG9yIDogXCJub25lXCI7XG4gIGxldCBzdHJva2VDb2xvciA9IGJvdW5kYXJ5LmJvcmRlckNvbG9yID8gYm91bmRhcnkuYm9yZGVyQ29sb3IgOiBcIiM0NDQ0NDRcIjtcbiAgbGV0IGZvbnRDb2xvciA9IGJvdW5kYXJ5LmZvbnRDb2xvciA/IGJvdW5kYXJ5LmZvbnRDb2xvciA6IFwiYmxhY2tcIjtcbiAgbGV0IGF0dHJzVmFsdWUgPSB7IFwic3Ryb2tlLXdpZHRoXCI6IDEsIFwic3Ryb2tlLWRhc2hhcnJheVwiOiBcIjcuMCw3LjBcIiB9O1xuICBpZiAoYm91bmRhcnkubm9kZVR5cGUpIHtcbiAgICBhdHRyc1ZhbHVlID0geyBcInN0cm9rZS13aWR0aFwiOiAxIH07XG4gIH1cbiAgbGV0IHJlY3REYXRhID0ge1xuICAgIHg6IGJvdW5kYXJ5LngsXG4gICAgeTogYm91bmRhcnkueSxcbiAgICBmaWxsOiBmaWxsQ29sb3IsXG4gICAgc3Ryb2tlOiBzdHJva2VDb2xvcixcbiAgICB3aWR0aDogYm91bmRhcnkud2lkdGgsXG4gICAgaGVpZ2h0OiBib3VuZGFyeS5oZWlnaHQsXG4gICAgcng6IDIuNSxcbiAgICByeTogMi41LFxuICAgIGF0dHJzOiBhdHRyc1ZhbHVlXG4gIH07XG4gIGRyYXdSZWN0Mihib3VuZGFyeUVsZW0sIHJlY3REYXRhKTtcbiAgbGV0IGJvdW5kYXJ5Q29uZiA9IGNvbmYyLmJvdW5kYXJ5Rm9udCgpO1xuICBib3VuZGFyeUNvbmYuZm9udFdlaWdodCA9IFwiYm9sZFwiO1xuICBib3VuZGFyeUNvbmYuZm9udFNpemUgPSBib3VuZGFyeUNvbmYuZm9udFNpemUgKyAyO1xuICBib3VuZGFyeUNvbmYuZm9udENvbG9yID0gZm9udENvbG9yO1xuICBfZHJhd1RleHRDYW5kaWRhdGVGdW5jKGNvbmYyKShcbiAgICBib3VuZGFyeS5sYWJlbC50ZXh0LFxuICAgIGJvdW5kYXJ5RWxlbSxcbiAgICBib3VuZGFyeS54LFxuICAgIGJvdW5kYXJ5LnkgKyBib3VuZGFyeS5sYWJlbC5ZLFxuICAgIGJvdW5kYXJ5LndpZHRoLFxuICAgIGJvdW5kYXJ5LmhlaWdodCxcbiAgICB7IGZpbGw6IFwiIzQ0NDQ0NFwiIH0sXG4gICAgYm91bmRhcnlDb25mXG4gICk7XG4gIGlmIChib3VuZGFyeS50eXBlICYmIGJvdW5kYXJ5LnR5cGUudGV4dCAhPT0gXCJcIikge1xuICAgIGJvdW5kYXJ5Q29uZiA9IGNvbmYyLmJvdW5kYXJ5Rm9udCgpO1xuICAgIGJvdW5kYXJ5Q29uZi5mb250Q29sb3IgPSBmb250Q29sb3I7XG4gICAgX2RyYXdUZXh0Q2FuZGlkYXRlRnVuYyhjb25mMikoXG4gICAgICBib3VuZGFyeS50eXBlLnRleHQsXG4gICAgICBib3VuZGFyeUVsZW0sXG4gICAgICBib3VuZGFyeS54LFxuICAgICAgYm91bmRhcnkueSArIGJvdW5kYXJ5LnR5cGUuWSxcbiAgICAgIGJvdW5kYXJ5LndpZHRoLFxuICAgICAgYm91bmRhcnkuaGVpZ2h0LFxuICAgICAgeyBmaWxsOiBcIiM0NDQ0NDRcIiB9LFxuICAgICAgYm91bmRhcnlDb25mXG4gICAgKTtcbiAgfVxuICBpZiAoYm91bmRhcnkuZGVzY3IgJiYgYm91bmRhcnkuZGVzY3IudGV4dCAhPT0gXCJcIikge1xuICAgIGJvdW5kYXJ5Q29uZiA9IGNvbmYyLmJvdW5kYXJ5Rm9udCgpO1xuICAgIGJvdW5kYXJ5Q29uZi5mb250U2l6ZSA9IGJvdW5kYXJ5Q29uZi5mb250U2l6ZSAtIDI7XG4gICAgYm91bmRhcnlDb25mLmZvbnRDb2xvciA9IGZvbnRDb2xvcjtcbiAgICBfZHJhd1RleHRDYW5kaWRhdGVGdW5jKGNvbmYyKShcbiAgICAgIGJvdW5kYXJ5LmRlc2NyLnRleHQsXG4gICAgICBib3VuZGFyeUVsZW0sXG4gICAgICBib3VuZGFyeS54LFxuICAgICAgYm91bmRhcnkueSArIGJvdW5kYXJ5LmRlc2NyLlksXG4gICAgICBib3VuZGFyeS53aWR0aCxcbiAgICAgIGJvdW5kYXJ5LmhlaWdodCxcbiAgICAgIHsgZmlsbDogXCIjNDQ0NDQ0XCIgfSxcbiAgICAgIGJvdW5kYXJ5Q29uZlxuICAgICk7XG4gIH1cbn0sIFwiZHJhd0JvdW5kYXJ5XCIpO1xudmFyIGRyYXdDNFNoYXBlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihlbGVtLCBjNFNoYXBlLCBjb25mMikge1xuICBsZXQgZmlsbENvbG9yID0gYzRTaGFwZS5iZ0NvbG9yID8gYzRTaGFwZS5iZ0NvbG9yIDogY29uZjJbYzRTaGFwZS50eXBlQzRTaGFwZS50ZXh0ICsgXCJfYmdfY29sb3JcIl07XG4gIGxldCBzdHJva2VDb2xvciA9IGM0U2hhcGUuYm9yZGVyQ29sb3IgPyBjNFNoYXBlLmJvcmRlckNvbG9yIDogY29uZjJbYzRTaGFwZS50eXBlQzRTaGFwZS50ZXh0ICsgXCJfYm9yZGVyX2NvbG9yXCJdO1xuICBsZXQgZm9udENvbG9yID0gYzRTaGFwZS5mb250Q29sb3IgPyBjNFNoYXBlLmZvbnRDb2xvciA6IFwiI0ZGRkZGRlwiO1xuICBsZXQgcGVyc29uSW1nID0gXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdDQUlBQUFEWVlHN1FBQUFDRDBsRVFWUjRYdTJZb1U0RU1SQ0dUKzRqOEFpOEFoYUg0UUhnQVVqUXVGTUVDVWdNSVVnd0pBZ01oZ1FzQVlVaUpDaVFJQkJZK0VJVHNqZlRkbWU2VjI0djRjOHZ5R2JiK1pqT3ROMGJOY3ZqUVhta0g4M1d2WUJXdG82UExtNnY3cDd1SDEvdzJmWEQrUEJ5Y1gxUHYybDNJZERtL3ZuN3grZFhRaUF1YlJ6b1VSYTdnUlpXZDBpR1JJaUpiT25obmZZQlFaTkpqTmJ1eVkyZUpHOGZrREUzYmJHNGVwNk1IVUFzZ1l4bUUzblZzNlZzQldKU0djY3NPbEZQbUxJVmlNekxPQjdwQ1ZPMkF0SEpNb2hIN0ZoNnpxaXRRSzdtMHJKdkFWWWdHY0VwZS8vUExkRHo2NXNNNHBGOU43SUNjWERLSUI1TnY2ajd0RDBOb1NkTTJRclU5R2cwZXdFMUxxQmhIUjNCQmR2ajJ2YXBuaWRqSHhEL3E2dmQ3UHZocjMxQXdjWThlWE1UWEFLRUNaWkpGWHVFcTI3YUxnUUs1dUxNb2hDZW5HR3VHZXdPeFNqQnZZQnFlRzZCK05xaWJsZ2dkam5jK1pYRHkrRk5GcEZ6dzc2TzNVQkFST3VYaDZGb2lBY2Y1ZzllVHZVZ3p5MG5XZzZJOGNYSFJVcGc1Yk9WQkNvK0tEcEZhak9mMjNHZ1BtZTdSU1ErbGFjSUVOVWdKNmdnMWs2SGpnT2xxbkxxaXA0dEV1aHYwaE5FTVhVRDBjbHlYRTNwNnBaQTBTMm5udlRsWHdMSkVaV2xiN2NUUUgxK1VTZ1RONFZoQWVubS93ZWExT0NBT21xbzZmRTFXQ2I5V1NLQmFoK3JiVVdQV0FtRTJSdmswQXBpQjQ1ZU95TkF6VTh4Y1R2ajhLdmtLRW9PYUlZZUhOQTNadXlnQXZGTVVPMEFBQUFBU1VWT1JLNUNZSUk9XCI7XG4gIHN3aXRjaCAoYzRTaGFwZS50eXBlQzRTaGFwZS50ZXh0KSB7XG4gICAgY2FzZSBcInBlcnNvblwiOlxuICAgICAgcGVyc29uSW1nID0gXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdDQUlBQUFEWVlHN1FBQUFDRDBsRVFWUjRYdTJZb1U0RU1SQ0dUKzRqOEFpOEFoYUg0UUhnQVVqUXVGTUVDVWdNSVVnd0pBZ01oZ1FzQVlVaUpDaVFJQkJZK0VJVHNqZlRkbWU2VjI0djRjOHZ5R2JiK1pqT3ROMGJOY3ZqUVhta0g4M1d2WUJXdG82UExtNnY3cDd1SDEvdzJmWEQrUEJ5Y1gxUHYybDNJZERtL3ZuN3grZFhRaUF1YlJ6b1VSYTdnUlpXZDBpR1JJaUpiT25obmZZQlFaTkpqTmJ1eVkyZUpHOGZrREUzYmJHNGVwNk1IVUFzZ1l4bUUzblZzNlZzQldKU0djY3NPbEZQbUxJVmlNekxPQjdwQ1ZPMkF0SEpNb2hIN0ZoNnpxaXRRSzdtMHJKdkFWWWdHY0VwZS8vUExkRHo2NXNNNHBGOU43SUNjWERLSUI1TnY2ajd0RDBOb1NkTTJRclU5R2cwZXdFMUxxQmhIUjNCQmR2ajJ2YXBuaWRqSHhEL3E2dmQ3UHZocjMxQXdjWThlWE1UWEFLRUNaWkpGWHVFcTI3YUxnUUs1dUxNb2hDZW5HR3VHZXdPeFNqQnZZQnFlRzZCK05xaWJsZ2dkam5jK1pYRHkrRk5GcEZ6dzc2TzNVQkFST3VYaDZGb2lBY2Y1ZzllVHZVZ3p5MG5XZzZJOGNYSFJVcGc1Yk9WQkNvK0tEcEZhak9mMjNHZ1BtZTdSU1ErbGFjSUVOVWdKNmdnMWs2SGpnT2xxbkxxaXA0dEV1aHYwaE5FTVhVRDBjbHlYRTNwNnBaQTBTMm5udlRsWHdMSkVaV2xiN2NUUUgxK1VTZ1RONFZoQWVubS93ZWExT0NBT21xbzZmRTFXQ2I5V1NLQmFoK3JiVVdQV0FtRTJSdmswQXBpQjQ1ZU95TkF6VTh4Y1R2ajhLdmtLRW9PYUlZZUhOQTNadXlnQXZGTVVPMEFBQUFBU1VWT1JLNUNZSUk9XCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiZXh0ZXJuYWxfcGVyc29uXCI6XG4gICAgICBwZXJzb25JbWcgPSBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBREFBQUFBd0NBSUFBQURZWUc3UUFBQUI2RWxFUVZSNFh1MllMWStFTUJDRzkrZFdyMGFqMFdnMEdvMUdvMCtqOFhkdjJ1VEN2djFncHQwZWJIS1B1aERhZVc0NjA1WjltSnZ4NEFkWFV5VFVkZDA4eit1NmZsbVdaUm5Ic1drYWZrOURwdEF3RFB1K2YwZUFZdHUyUEVhR1d1ajVmQ0lackJBQzJlTEJBblJDc0Vra3htZWFKcDdpREoyUU1EZEhzTGc4U3hLRkVKYUFvOGxBWG5tdU9GSWhUTXB4eEtBVGVibzRVaUZrbnVObzRPbmlTSVhReVJ4RUEzWXNuakdDVkVqVlhEN3lMVUFxeEJHVXlQdi9ZNFcyYmVNZ0d1UzdrVlFJQnljSDBmRCtvaTVwZXpRRVR4ZEhLbVFLR2sxZVFFWWxkSytqdzVHeFBmWjl6N01rMFFuaGYxVzFtM3cvL0VVbjVCRG1TWnNiUjQ0UVFMQkVxckJIcU9ybVNLYVFBeGRuTEFyQ3J4WmNNN0E3WktzNGlvUnE4TEZDK05wQzNXQ0JKc3ZwVnc1ZWRtOWlFWEZ1eU5meFhBZ1N3ZnJGUTFjMGlOZGE4QWRlanZVZ25rdE90SlFReG1jZkZ6R2dsYzVXVkNqN29EZ0ZxVTE4Ym9lRlNzNTJDVWg4TEU4QklWUURUMUFCckIwSHRnU0VZbFg1ZG9KbkN3djlUWG9jS0NhS2Jud2hkREtQcTRsZjNTd1UzSExxNFYvK1dZaEhWTWEvM2I0SWxmeWlrQWR1Q2tjQmM3bVEzL3ovUXEvY1R1aWtoa3pCMTJBZS9tY0pDOVUrVm84RWoxZ1dBdGdiZUdnRnNBTUhyNTBCSVdPTENiZXp2aHBCRlVkWTZFSnVKL1FEVzBYb01YNjB6WjBBQUFBQVNVVk9SSzVDWUlJPVwiO1xuICAgICAgYnJlYWs7XG4gIH1cbiAgY29uc3QgYzRTaGFwZUVsZW0gPSBlbGVtLmFwcGVuZChcImdcIik7XG4gIGM0U2hhcGVFbGVtLmF0dHIoXCJjbGFzc1wiLCBcInBlcnNvbi1tYW5cIik7XG4gIGNvbnN0IHJlY3QgPSBnZXROb3RlUmVjdCgpO1xuICBzd2l0Y2ggKGM0U2hhcGUudHlwZUM0U2hhcGUudGV4dCkge1xuICAgIGNhc2UgXCJwZXJzb25cIjpcbiAgICBjYXNlIFwiZXh0ZXJuYWxfcGVyc29uXCI6XG4gICAgY2FzZSBcInN5c3RlbVwiOlxuICAgIGNhc2UgXCJleHRlcm5hbF9zeXN0ZW1cIjpcbiAgICBjYXNlIFwiY29udGFpbmVyXCI6XG4gICAgY2FzZSBcImV4dGVybmFsX2NvbnRhaW5lclwiOlxuICAgIGNhc2UgXCJjb21wb25lbnRcIjpcbiAgICBjYXNlIFwiZXh0ZXJuYWxfY29tcG9uZW50XCI6XG4gICAgICByZWN0LnggPSBjNFNoYXBlLng7XG4gICAgICByZWN0LnkgPSBjNFNoYXBlLnk7XG4gICAgICByZWN0LmZpbGwgPSBmaWxsQ29sb3I7XG4gICAgICByZWN0LndpZHRoID0gYzRTaGFwZS53aWR0aDtcbiAgICAgIHJlY3QuaGVpZ2h0ID0gYzRTaGFwZS5oZWlnaHQ7XG4gICAgICByZWN0LnN0cm9rZSA9IHN0cm9rZUNvbG9yO1xuICAgICAgcmVjdC5yeCA9IDIuNTtcbiAgICAgIHJlY3QucnkgPSAyLjU7XG4gICAgICByZWN0LmF0dHJzID0geyBcInN0cm9rZS13aWR0aFwiOiAwLjUgfTtcbiAgICAgIGRyYXdSZWN0MihjNFNoYXBlRWxlbSwgcmVjdCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwic3lzdGVtX2RiXCI6XG4gICAgY2FzZSBcImV4dGVybmFsX3N5c3RlbV9kYlwiOlxuICAgIGNhc2UgXCJjb250YWluZXJfZGJcIjpcbiAgICBjYXNlIFwiZXh0ZXJuYWxfY29udGFpbmVyX2RiXCI6XG4gICAgY2FzZSBcImNvbXBvbmVudF9kYlwiOlxuICAgIGNhc2UgXCJleHRlcm5hbF9jb21wb25lbnRfZGJcIjpcbiAgICAgIGM0U2hhcGVFbGVtLmFwcGVuZChcInBhdGhcIikuYXR0cihcImZpbGxcIiwgZmlsbENvbG9yKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIFwiMC41XCIpLmF0dHIoXCJzdHJva2VcIiwgc3Ryb2tlQ29sb3IpLmF0dHIoXG4gICAgICAgIFwiZFwiLFxuICAgICAgICBcIk1zdGFydHgsc3RhcnR5YzAsLTEwIGhhbGYsLTEwIGhhbGYsLTEwYzAsMCBoYWxmLDAgaGFsZiwxMGwwLGhlaWdodGMwLDEwIC1oYWxmLDEwIC1oYWxmLDEwYzAsMCAtaGFsZiwwIC1oYWxmLC0xMGwwLC1oZWlnaHRcIi5yZXBsYWNlQWxsKFwic3RhcnR4XCIsIGM0U2hhcGUueCkucmVwbGFjZUFsbChcInN0YXJ0eVwiLCBjNFNoYXBlLnkpLnJlcGxhY2VBbGwoXCJoYWxmXCIsIGM0U2hhcGUud2lkdGggLyAyKS5yZXBsYWNlQWxsKFwiaGVpZ2h0XCIsIGM0U2hhcGUuaGVpZ2h0KVxuICAgICAgKTtcbiAgICAgIGM0U2hhcGVFbGVtLmFwcGVuZChcInBhdGhcIikuYXR0cihcImZpbGxcIiwgXCJub25lXCIpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgXCIwLjVcIikuYXR0cihcInN0cm9rZVwiLCBzdHJva2VDb2xvcikuYXR0cihcbiAgICAgICAgXCJkXCIsXG4gICAgICAgIFwiTXN0YXJ0eCxzdGFydHljMCwxMCBoYWxmLDEwIGhhbGYsMTBjMCwwIGhhbGYsMCBoYWxmLC0xMFwiLnJlcGxhY2VBbGwoXCJzdGFydHhcIiwgYzRTaGFwZS54KS5yZXBsYWNlQWxsKFwic3RhcnR5XCIsIGM0U2hhcGUueSkucmVwbGFjZUFsbChcImhhbGZcIiwgYzRTaGFwZS53aWR0aCAvIDIpXG4gICAgICApO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcInN5c3RlbV9xdWV1ZVwiOlxuICAgIGNhc2UgXCJleHRlcm5hbF9zeXN0ZW1fcXVldWVcIjpcbiAgICBjYXNlIFwiY29udGFpbmVyX3F1ZXVlXCI6XG4gICAgY2FzZSBcImV4dGVybmFsX2NvbnRhaW5lcl9xdWV1ZVwiOlxuICAgIGNhc2UgXCJjb21wb25lbnRfcXVldWVcIjpcbiAgICBjYXNlIFwiZXh0ZXJuYWxfY29tcG9uZW50X3F1ZXVlXCI6XG4gICAgICBjNFNoYXBlRWxlbS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJmaWxsXCIsIGZpbGxDb2xvcikuYXR0cihcInN0cm9rZS13aWR0aFwiLCBcIjAuNVwiKS5hdHRyKFwic3Ryb2tlXCIsIHN0cm9rZUNvbG9yKS5hdHRyKFxuICAgICAgICBcImRcIixcbiAgICAgICAgXCJNc3RhcnR4LHN0YXJ0eWx3aWR0aCwwYzUsMCA1LGhhbGYgNSxoYWxmYzAsMCAwLGhhbGYgLTUsaGFsZmwtd2lkdGgsMGMtNSwwIC01LC1oYWxmIC01LC1oYWxmYzAsMCAwLC1oYWxmIDUsLWhhbGZcIi5yZXBsYWNlQWxsKFwic3RhcnR4XCIsIGM0U2hhcGUueCkucmVwbGFjZUFsbChcInN0YXJ0eVwiLCBjNFNoYXBlLnkpLnJlcGxhY2VBbGwoXCJ3aWR0aFwiLCBjNFNoYXBlLndpZHRoKS5yZXBsYWNlQWxsKFwiaGFsZlwiLCBjNFNoYXBlLmhlaWdodCAvIDIpXG4gICAgICApO1xuICAgICAgYzRTaGFwZUVsZW0uYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZmlsbFwiLCBcIm5vbmVcIikuYXR0cihcInN0cm9rZS13aWR0aFwiLCBcIjAuNVwiKS5hdHRyKFwic3Ryb2tlXCIsIHN0cm9rZUNvbG9yKS5hdHRyKFxuICAgICAgICBcImRcIixcbiAgICAgICAgXCJNc3RhcnR4LHN0YXJ0eWMtNSwwIC01LGhhbGYgLTUsaGFsZmMwLGhhbGYgNSxoYWxmIDUsaGFsZlwiLnJlcGxhY2VBbGwoXCJzdGFydHhcIiwgYzRTaGFwZS54ICsgYzRTaGFwZS53aWR0aCkucmVwbGFjZUFsbChcInN0YXJ0eVwiLCBjNFNoYXBlLnkpLnJlcGxhY2VBbGwoXCJoYWxmXCIsIGM0U2hhcGUuaGVpZ2h0IC8gMilcbiAgICAgICk7XG4gICAgICBicmVhaztcbiAgfVxuICBsZXQgYzRTaGFwZUZvbnRDb25mID0gZ2V0QzRTaGFwZUZvbnQoY29uZjIsIGM0U2hhcGUudHlwZUM0U2hhcGUudGV4dCk7XG4gIGM0U2hhcGVFbGVtLmFwcGVuZChcInRleHRcIikuYXR0cihcImZpbGxcIiwgZm9udENvbG9yKS5hdHRyKFwiZm9udC1mYW1pbHlcIiwgYzRTaGFwZUZvbnRDb25mLmZvbnRGYW1pbHkpLmF0dHIoXCJmb250LXNpemVcIiwgYzRTaGFwZUZvbnRDb25mLmZvbnRTaXplIC0gMikuYXR0cihcImZvbnQtc3R5bGVcIiwgXCJpdGFsaWNcIikuYXR0cihcImxlbmd0aEFkanVzdFwiLCBcInNwYWNpbmdcIikuYXR0cihcInRleHRMZW5ndGhcIiwgYzRTaGFwZS50eXBlQzRTaGFwZS53aWR0aCkuYXR0cihcInhcIiwgYzRTaGFwZS54ICsgYzRTaGFwZS53aWR0aCAvIDIgLSBjNFNoYXBlLnR5cGVDNFNoYXBlLndpZHRoIC8gMikuYXR0cihcInlcIiwgYzRTaGFwZS55ICsgYzRTaGFwZS50eXBlQzRTaGFwZS5ZKS50ZXh0KFwiPDxcIiArIGM0U2hhcGUudHlwZUM0U2hhcGUudGV4dCArIFwiPj5cIik7XG4gIHN3aXRjaCAoYzRTaGFwZS50eXBlQzRTaGFwZS50ZXh0KSB7XG4gICAgY2FzZSBcInBlcnNvblwiOlxuICAgIGNhc2UgXCJleHRlcm5hbF9wZXJzb25cIjpcbiAgICAgIGRyYXdJbWFnZShcbiAgICAgICAgYzRTaGFwZUVsZW0sXG4gICAgICAgIDQ4LFxuICAgICAgICA0OCxcbiAgICAgICAgYzRTaGFwZS54ICsgYzRTaGFwZS53aWR0aCAvIDIgLSAyNCxcbiAgICAgICAgYzRTaGFwZS55ICsgYzRTaGFwZS5pbWFnZS5ZLFxuICAgICAgICBwZXJzb25JbWdcbiAgICAgICk7XG4gICAgICBicmVhaztcbiAgfVxuICBsZXQgdGV4dEZvbnRDb25mID0gY29uZjJbYzRTaGFwZS50eXBlQzRTaGFwZS50ZXh0ICsgXCJGb250XCJdKCk7XG4gIHRleHRGb250Q29uZi5mb250V2VpZ2h0ID0gXCJib2xkXCI7XG4gIHRleHRGb250Q29uZi5mb250U2l6ZSA9IHRleHRGb250Q29uZi5mb250U2l6ZSArIDI7XG4gIHRleHRGb250Q29uZi5mb250Q29sb3IgPSBmb250Q29sb3I7XG4gIF9kcmF3VGV4dENhbmRpZGF0ZUZ1bmMoY29uZjIpKFxuICAgIGM0U2hhcGUubGFiZWwudGV4dCxcbiAgICBjNFNoYXBlRWxlbSxcbiAgICBjNFNoYXBlLngsXG4gICAgYzRTaGFwZS55ICsgYzRTaGFwZS5sYWJlbC5ZLFxuICAgIGM0U2hhcGUud2lkdGgsXG4gICAgYzRTaGFwZS5oZWlnaHQsXG4gICAgeyBmaWxsOiBmb250Q29sb3IgfSxcbiAgICB0ZXh0Rm9udENvbmZcbiAgKTtcbiAgdGV4dEZvbnRDb25mID0gY29uZjJbYzRTaGFwZS50eXBlQzRTaGFwZS50ZXh0ICsgXCJGb250XCJdKCk7XG4gIHRleHRGb250Q29uZi5mb250Q29sb3IgPSBmb250Q29sb3I7XG4gIGlmIChjNFNoYXBlLnRlY2huICYmIGM0U2hhcGUudGVjaG4/LnRleHQgIT09IFwiXCIpIHtcbiAgICBfZHJhd1RleHRDYW5kaWRhdGVGdW5jKGNvbmYyKShcbiAgICAgIGM0U2hhcGUudGVjaG4udGV4dCxcbiAgICAgIGM0U2hhcGVFbGVtLFxuICAgICAgYzRTaGFwZS54LFxuICAgICAgYzRTaGFwZS55ICsgYzRTaGFwZS50ZWNobi5ZLFxuICAgICAgYzRTaGFwZS53aWR0aCxcbiAgICAgIGM0U2hhcGUuaGVpZ2h0LFxuICAgICAgeyBmaWxsOiBmb250Q29sb3IsIFwiZm9udC1zdHlsZVwiOiBcIml0YWxpY1wiIH0sXG4gICAgICB0ZXh0Rm9udENvbmZcbiAgICApO1xuICB9IGVsc2UgaWYgKGM0U2hhcGUudHlwZSAmJiBjNFNoYXBlLnR5cGUudGV4dCAhPT0gXCJcIikge1xuICAgIF9kcmF3VGV4dENhbmRpZGF0ZUZ1bmMoY29uZjIpKFxuICAgICAgYzRTaGFwZS50eXBlLnRleHQsXG4gICAgICBjNFNoYXBlRWxlbSxcbiAgICAgIGM0U2hhcGUueCxcbiAgICAgIGM0U2hhcGUueSArIGM0U2hhcGUudHlwZS5ZLFxuICAgICAgYzRTaGFwZS53aWR0aCxcbiAgICAgIGM0U2hhcGUuaGVpZ2h0LFxuICAgICAgeyBmaWxsOiBmb250Q29sb3IsIFwiZm9udC1zdHlsZVwiOiBcIml0YWxpY1wiIH0sXG4gICAgICB0ZXh0Rm9udENvbmZcbiAgICApO1xuICB9XG4gIGlmIChjNFNoYXBlLmRlc2NyICYmIGM0U2hhcGUuZGVzY3IudGV4dCAhPT0gXCJcIikge1xuICAgIHRleHRGb250Q29uZiA9IGNvbmYyLnBlcnNvbkZvbnQoKTtcbiAgICB0ZXh0Rm9udENvbmYuZm9udENvbG9yID0gZm9udENvbG9yO1xuICAgIF9kcmF3VGV4dENhbmRpZGF0ZUZ1bmMoY29uZjIpKFxuICAgICAgYzRTaGFwZS5kZXNjci50ZXh0LFxuICAgICAgYzRTaGFwZUVsZW0sXG4gICAgICBjNFNoYXBlLngsXG4gICAgICBjNFNoYXBlLnkgKyBjNFNoYXBlLmRlc2NyLlksXG4gICAgICBjNFNoYXBlLndpZHRoLFxuICAgICAgYzRTaGFwZS5oZWlnaHQsXG4gICAgICB7IGZpbGw6IGZvbnRDb2xvciB9LFxuICAgICAgdGV4dEZvbnRDb25mXG4gICAgKTtcbiAgfVxuICByZXR1cm4gYzRTaGFwZS5oZWlnaHQ7XG59LCBcImRyYXdDNFNoYXBlXCIpO1xudmFyIGluc2VydERhdGFiYXNlSWNvbiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbSwgaWQpIHtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcInN5bWJvbFwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIi1kYXRhYmFzZVwiKS5hdHRyKFwiZmlsbC1ydWxlXCIsIFwiZXZlbm9kZFwiKS5hdHRyKFwiY2xpcC1ydWxlXCIsIFwiZXZlbm9kZFwiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJzY2FsZSguNSlcIikuYXR0cihcbiAgICBcImRcIixcbiAgICBcIk0xMi4yNTguMDAxbC4yNTYuMDA0LjI1NS4wMDUuMjUzLjAwOC4yNTEuMDEuMjQ5LjAxMi4yNDcuMDE1LjI0Ni4wMTYuMjQyLjAxOS4yNDEuMDIuMjM5LjAyMy4yMzYuMDI0LjIzMy4wMjcuMjMxLjAyOC4yMjkuMDMxLjIyNS4wMzIuMjIzLjAzNC4yMi4wMzYuMjE3LjAzOC4yMTQuMDQuMjExLjA0MS4yMDguMDQzLjIwNS4wNDUuMjAxLjA0Ni4xOTguMDQ4LjE5NC4wNS4xOTEuMDUxLjE4Ny4wNTMuMTgzLjA1NC4xOC4wNTYuMTc1LjA1Ny4xNzIuMDU5LjE2OC4wNi4xNjMuMDYxLjE2LjA2My4xNTUuMDY0LjE1LjA2Ni4wNzQuMDMzLjA3My4wMzMuMDcxLjAzNC4wNy4wMzQuMDY5LjAzNS4wNjguMDM1LjA2Ny4wMzUuMDY2LjAzNS4wNjQuMDM2LjA2NC4wMzYuMDYyLjAzNi4wNi4wMzYuMDYuMDM3LjA1OC4wMzcuMDU4LjAzNy4wNTUuMDM4LjA1NS4wMzguMDUzLjAzOC4wNTIuMDM4LjA1MS4wMzkuMDUuMDM5LjA0OC4wMzkuMDQ3LjAzOS4wNDUuMDQuMDQ0LjA0LjA0My4wNC4wNDEuMDQuMDQuMDQxLjAzOS4wNDEuMDM3LjA0MS4wMzYuMDQxLjAzNC4wNDEuMDMzLjA0Mi4wMzIuMDQyLjAzLjA0Mi4wMjkuMDQyLjAyNy4wNDIuMDI2LjA0My4wMjQuMDQzLjAyMy4wNDMuMDIxLjA0My4wMi4wNDMuMDE4LjA0NC4wMTcuMDQzLjAxNS4wNDQuMDEzLjA0NC4wMTIuMDQ0LjAxMS4wNDUuMDA5LjA0NC4wMDcuMDQ1LjAwNi4wNDUuMDA0LjA0NS4wMDIuMDQ1LjAwMS4wNDV2MTdsLS4wMDEuMDQ1LS4wMDIuMDQ1LS4wMDQuMDQ1LS4wMDYuMDQ1LS4wMDcuMDQ1LS4wMDkuMDQ0LS4wMTEuMDQ1LS4wMTIuMDQ0LS4wMTMuMDQ0LS4wMTUuMDQ0LS4wMTcuMDQzLS4wMTguMDQ0LS4wMi4wNDMtLjAyMS4wNDMtLjAyMy4wNDMtLjAyNC4wNDMtLjAyNi4wNDMtLjAyNy4wNDItLjAyOS4wNDItLjAzLjA0Mi0uMDMyLjA0Mi0uMDMzLjA0Mi0uMDM0LjA0MS0uMDM2LjA0MS0uMDM3LjA0MS0uMDM5LjA0MS0uMDQuMDQxLS4wNDEuMDQtLjA0My4wNC0uMDQ0LjA0LS4wNDUuMDQtLjA0Ny4wMzktLjA0OC4wMzktLjA1LjAzOS0uMDUxLjAzOS0uMDUyLjAzOC0uMDUzLjAzOC0uMDU1LjAzOC0uMDU1LjAzOC0uMDU4LjAzNy0uMDU4LjAzNy0uMDYuMDM3LS4wNi4wMzYtLjA2Mi4wMzYtLjA2NC4wMzYtLjA2NC4wMzYtLjA2Ni4wMzUtLjA2Ny4wMzUtLjA2OC4wMzUtLjA2OS4wMzUtLjA3LjAzNC0uMDcxLjAzNC0uMDczLjAzMy0uMDc0LjAzMy0uMTUuMDY2LS4xNTUuMDY0LS4xNi4wNjMtLjE2My4wNjEtLjE2OC4wNi0uMTcyLjA1OS0uMTc1LjA1Ny0uMTguMDU2LS4xODMuMDU0LS4xODcuMDUzLS4xOTEuMDUxLS4xOTQuMDUtLjE5OC4wNDgtLjIwMS4wNDYtLjIwNS4wNDUtLjIwOC4wNDMtLjIxMS4wNDEtLjIxNC4wNC0uMjE3LjAzOC0uMjIuMDM2LS4yMjMuMDM0LS4yMjUuMDMyLS4yMjkuMDMxLS4yMzEuMDI4LS4yMzMuMDI3LS4yMzYuMDI0LS4yMzkuMDIzLS4yNDEuMDItLjI0Mi4wMTktLjI0Ni4wMTYtLjI0Ny4wMTUtLjI0OS4wMTItLjI1MS4wMS0uMjUzLjAwOC0uMjU1LjAwNS0uMjU2LjAwNC0uMjU4LjAwMS0uMjU4LS4wMDEtLjI1Ni0uMDA0LS4yNTUtLjAwNS0uMjUzLS4wMDgtLjI1MS0uMDEtLjI0OS0uMDEyLS4yNDctLjAxNS0uMjQ1LS4wMTYtLjI0My0uMDE5LS4yNDEtLjAyLS4yMzgtLjAyMy0uMjM2LS4wMjQtLjIzNC0uMDI3LS4yMzEtLjAyOC0uMjI4LS4wMzEtLjIyNi0uMDMyLS4yMjMtLjAzNC0uMjItLjAzNi0uMjE3LS4wMzgtLjIxNC0uMDQtLjIxMS0uMDQxLS4yMDgtLjA0My0uMjA0LS4wNDUtLjIwMS0uMDQ2LS4xOTgtLjA0OC0uMTk1LS4wNS0uMTktLjA1MS0uMTg3LS4wNTMtLjE4NC0uMDU0LS4xNzktLjA1Ni0uMTc2LS4wNTctLjE3Mi0uMDU5LS4xNjctLjA2LS4xNjQtLjA2MS0uMTU5LS4wNjMtLjE1NS0uMDY0LS4xNTEtLjA2Ni0uMDc0LS4wMzMtLjA3Mi0uMDMzLS4wNzItLjAzNC0uMDctLjAzNC0uMDY5LS4wMzUtLjA2OC0uMDM1LS4wNjctLjAzNS0uMDY2LS4wMzUtLjA2NC0uMDM2LS4wNjMtLjAzNi0uMDYyLS4wMzYtLjA2MS0uMDM2LS4wNi0uMDM3LS4wNTgtLjAzNy0uMDU3LS4wMzctLjA1Ni0uMDM4LS4wNTUtLjAzOC0uMDUzLS4wMzgtLjA1Mi0uMDM4LS4wNTEtLjAzOS0uMDQ5LS4wMzktLjA0OS0uMDM5LS4wNDYtLjAzOS0uMDQ2LS4wNC0uMDQ0LS4wNC0uMDQzLS4wNC0uMDQxLS4wNC0uMDQtLjA0MS0uMDM5LS4wNDEtLjAzNy0uMDQxLS4wMzYtLjA0MS0uMDM0LS4wNDEtLjAzMy0uMDQyLS4wMzItLjA0Mi0uMDMtLjA0Mi0uMDI5LS4wNDItLjAyNy0uMDQyLS4wMjYtLjA0My0uMDI0LS4wNDMtLjAyMy0uMDQzLS4wMjEtLjA0My0uMDItLjA0My0uMDE4LS4wNDQtLjAxNy0uMDQzLS4wMTUtLjA0NC0uMDEzLS4wNDQtLjAxMi0uMDQ0LS4wMTEtLjA0NS0uMDA5LS4wNDQtLjAwNy0uMDQ1LS4wMDYtLjA0NS0uMDA0LS4wNDUtLjAwMi0uMDQ1LS4wMDEtLjA0NXYtMTdsLjAwMS0uMDQ1LjAwMi0uMDQ1LjAwNC0uMDQ1LjAwNi0uMDQ1LjAwNy0uMDQ1LjAwOS0uMDQ0LjAxMS0uMDQ1LjAxMi0uMDQ0LjAxMy0uMDQ0LjAxNS0uMDQ0LjAxNy0uMDQzLjAxOC0uMDQ0LjAyLS4wNDMuMDIxLS4wNDMuMDIzLS4wNDMuMDI0LS4wNDMuMDI2LS4wNDMuMDI3LS4wNDIuMDI5LS4wNDIuMDMtLjA0Mi4wMzItLjA0Mi4wMzMtLjA0Mi4wMzQtLjA0MS4wMzYtLjA0MS4wMzctLjA0MS4wMzktLjA0MS4wNC0uMDQxLjA0MS0uMDQuMDQzLS4wNC4wNDQtLjA0LjA0Ni0uMDQuMDQ2LS4wMzkuMDQ5LS4wMzkuMDQ5LS4wMzkuMDUxLS4wMzkuMDUyLS4wMzguMDUzLS4wMzguMDU1LS4wMzguMDU2LS4wMzguMDU3LS4wMzcuMDU4LS4wMzcuMDYtLjAzNy4wNjEtLjAzNi4wNjItLjAzNi4wNjMtLjAzNi4wNjQtLjAzNi4wNjYtLjAzNS4wNjctLjAzNS4wNjgtLjAzNS4wNjktLjAzNS4wNy0uMDM0LjA3Mi0uMDM0LjA3Mi0uMDMzLjA3NC0uMDMzLjE1MS0uMDY2LjE1NS0uMDY0LjE1OS0uMDYzLjE2NC0uMDYxLjE2Ny0uMDYuMTcyLS4wNTkuMTc2LS4wNTcuMTc5LS4wNTYuMTg0LS4wNTQuMTg3LS4wNTMuMTktLjA1MS4xOTUtLjA1LjE5OC0uMDQ4LjIwMS0uMDQ2LjIwNC0uMDQ1LjIwOC0uMDQzLjIxMS0uMDQxLjIxNC0uMDQuMjE3LS4wMzguMjItLjAzNi4yMjMtLjAzNC4yMjYtLjAzMi4yMjgtLjAzMS4yMzEtLjAyOC4yMzQtLjAyNy4yMzYtLjAyNC4yMzgtLjAyMy4yNDEtLjAyLjI0My0uMDE5LjI0NS0uMDE2LjI0Ny0uMDE1LjI0OS0uMDEyLjI1MS0uMDEuMjUzLS4wMDguMjU1LS4wMDUuMjU2LS4wMDQuMjU4LS4wMDEuMjU4LjAwMXptLTkuMjU4IDIwLjQ5OXYuMDFsLjAwMS4wMjEuMDAzLjAyMS4wMDQuMDIyLjAwNS4wMjEuMDA2LjAyMi4wMDcuMDIyLjAwOS4wMjMuMDEuMDIyLjAxMS4wMjMuMDEyLjAyMy4wMTMuMDIzLjAxNS4wMjMuMDE2LjAyNC4wMTcuMDIzLjAxOC4wMjQuMDE5LjAyNC4wMjEuMDI0LjAyMi4wMjUuMDIzLjAyNC4wMjQuMDI1LjA1Mi4wNDkuMDU2LjA1LjA2MS4wNTEuMDY2LjA1MS4wNy4wNTEuMDc1LjA1MS4wNzkuMDUyLjA4NC4wNTIuMDg4LjA1Mi4wOTIuMDUyLjA5Ny4wNTIuMTAyLjA1MS4xMDUuMDUyLjExLjA1Mi4xMTQuMDUxLjExOS4wNTEuMTIzLjA1MS4xMjcuMDUuMTMxLjA1LjEzNS4wNS4xMzkuMDQ4LjE0NC4wNDkuMTQ3LjA0Ny4xNTIuMDQ3LjE1NS4wNDcuMTYuMDQ1LjE2My4wNDUuMTY3LjA0My4xNzEuMDQzLjE3Ni4wNDEuMTc4LjA0MS4xODMuMDM5LjE4Ny4wMzkuMTkuMDM3LjE5NC4wMzUuMTk3LjAzNS4yMDIuMDMzLjIwNC4wMzEuMjA5LjAzLjIxMi4wMjkuMjE2LjAyNy4yMTkuMDI1LjIyMi4wMjQuMjI2LjAyMS4yMy4wMi4yMzMuMDE4LjIzNi4wMTYuMjQuMDE1LjI0My4wMTIuMjQ2LjAxLjI0OS4wMDguMjUzLjAwNS4yNTYuMDA0LjI1OS4wMDEuMjYtLjAwMS4yNTctLjAwNC4yNTQtLjAwNS4yNS0uMDA4LjI0Ny0uMDExLjI0NC0uMDEyLjI0MS0uMDE0LjIzNy0uMDE2LjIzMy0uMDE4LjIzMS0uMDIxLjIyNi0uMDIxLjIyNC0uMDI0LjIyLS4wMjYuMjE2LS4wMjcuMjEyLS4wMjguMjEtLjAzMS4yMDUtLjAzMS4yMDItLjAzNC4xOTgtLjAzNC4xOTQtLjAzNi4xOTEtLjAzNy4xODctLjAzOS4xODMtLjA0LjE3OS0uMDQuMTc1LS4wNDIuMTcyLS4wNDMuMTY4LS4wNDQuMTYzLS4wNDUuMTYtLjA0Ni4xNTUtLjA0Ni4xNTItLjA0Ny4xNDgtLjA0OC4xNDMtLjA0OS4xMzktLjA0OS4xMzYtLjA1LjEzMS0uMDUuMTI2LS4wNS4xMjMtLjA1MS4xMTgtLjA1Mi4xMTQtLjA1MS4xMS0uMDUyLjEwNi0uMDUyLjEwMS0uMDUyLjA5Ni0uMDUyLjA5Mi0uMDUyLjA4OC0uMDUzLjA4My0uMDUxLjA3OS0uMDUyLjA3NC0uMDUyLjA3LS4wNTEuMDY1LS4wNTEuMDYtLjA1MS4wNTYtLjA1LjA1MS0uMDUuMDIzLS4wMjQuMDIzLS4wMjUuMDIxLS4wMjQuMDItLjAyNC4wMTktLjAyNC4wMTgtLjAyNC4wMTctLjAyNC4wMTUtLjAyMy4wMTQtLjAyNC4wMTMtLjAyMy4wMTItLjAyMy4wMS0uMDIzLjAxLS4wMjIuMDA4LS4wMjIuMDA2LS4wMjIuMDA2LS4wMjIuMDA0LS4wMjIuMDA0LS4wMjEuMDAxLS4wMjEuMDAxLS4wMjF2LTQuMTI3bC0uMDc3LjA1NS0uMDguMDUzLS4wODMuMDU0LS4wODUuMDUzLS4wODcuMDUyLS4wOS4wNTItLjA5My4wNTEtLjA5NS4wNS0uMDk3LjA1LS4xLjA0OS0uMTAyLjA0OS0uMTA1LjA0OC0uMTA2LjA0Ny0uMTA5LjA0Ny0uMTExLjA0Ni0uMTE0LjA0NS0uMTE1LjA0NS0uMTE4LjA0NC0uMTIuMDQzLS4xMjIuMDQyLS4xMjQuMDQyLS4xMjYuMDQxLS4xMjguMDQtLjEzLjA0LS4xMzIuMDM4LS4xMzQuMDM4LS4xMzUuMDM3LS4xMzguMDM3LS4xMzkuMDM1LS4xNDIuMDM1LS4xNDMuMDM0LS4xNDQuMDMzLS4xNDcuMDMyLS4xNDguMDMxLS4xNS4wMy0uMTUxLjAzLS4xNTMuMDI5LS4xNTQuMDI3LS4xNTYuMDI3LS4xNTguMDI2LS4xNTkuMDI1LS4xNjEuMDI0LS4xNjIuMDIzLS4xNjMuMDIyLS4xNjUuMDIxLS4xNjYuMDItLjE2Ny4wMTktLjE2OS4wMTgtLjE2OS4wMTctLjE3MS4wMTYtLjE3My4wMTUtLjE3My4wMTQtLjE3NS4wMTMtLjE3NS4wMTItLjE3Ny4wMTEtLjE3OC4wMS0uMTc5LjAwOC0uMTc5LjAwOC0uMTgxLjAwNi0uMTgyLjAwNS0uMTgyLjAwNC0uMTg0LjAwMy0uMTg0LjAwMmgtLjM3bC0uMTg0LS4wMDItLjE4NC0uMDAzLS4xODItLjAwNC0uMTgyLS4wMDUtLjE4MS0uMDA2LS4xNzktLjAwOC0uMTc5LS4wMDgtLjE3OC0uMDEtLjE3Ni0uMDExLS4xNzYtLjAxMi0uMTc1LS4wMTMtLjE3My0uMDE0LS4xNzItLjAxNS0uMTcxLS4wMTYtLjE3LS4wMTctLjE2OS0uMDE4LS4xNjctLjAxOS0uMTY2LS4wMi0uMTY1LS4wMjEtLjE2My0uMDIyLS4xNjItLjAyMy0uMTYxLS4wMjQtLjE1OS0uMDI1LS4xNTctLjAyNi0uMTU2LS4wMjctLjE1NS0uMDI3LS4xNTMtLjAyOS0uMTUxLS4wMy0uMTUtLjAzLS4xNDgtLjAzMS0uMTQ2LS4wMzItLjE0NS0uMDMzLS4xNDMtLjAzNC0uMTQxLS4wMzUtLjE0LS4wMzUtLjEzNy0uMDM3LS4xMzYtLjAzNy0uMTM0LS4wMzgtLjEzMi0uMDM4LS4xMy0uMDQtLjEyOC0uMDQtLjEyNi0uMDQxLS4xMjQtLjA0Mi0uMTIyLS4wNDItLjEyLS4wNDQtLjExNy0uMDQzLS4xMTYtLjA0NS0uMTEzLS4wNDUtLjExMi0uMDQ2LS4xMDktLjA0Ny0uMTA2LS4wNDctLjEwNS0uMDQ4LS4xMDItLjA0OS0uMS0uMDQ5LS4wOTctLjA1LS4wOTUtLjA1LS4wOTMtLjA1Mi0uMDktLjA1MS0uMDg3LS4wNTItLjA4NS0uMDUzLS4wODMtLjA1NC0uMDgtLjA1NC0uMDc3LS4wNTR2NC4xMjd6bTAtNS42NTR2LjAxMWwuMDAxLjAyMS4wMDMuMDIxLjAwNC4wMjEuMDA1LjAyMi4wMDYuMDIyLjAwNy4wMjIuMDA5LjAyMi4wMS4wMjIuMDExLjAyMy4wMTIuMDIzLjAxMy4wMjMuMDE1LjAyNC4wMTYuMDIzLjAxNy4wMjQuMDE4LjAyNC4wMTkuMDI0LjAyMS4wMjQuMDIyLjAyNC4wMjMuMDI1LjAyNC4wMjQuMDUyLjA1LjA1Ni4wNS4wNjEuMDUuMDY2LjA1MS4wNy4wNTEuMDc1LjA1Mi4wNzkuMDUxLjA4NC4wNTIuMDg4LjA1Mi4wOTIuMDUyLjA5Ny4wNTIuMTAyLjA1Mi4xMDUuMDUyLjExLjA1MS4xMTQuMDUxLjExOS4wNTIuMTIzLjA1LjEyNy4wNTEuMTMxLjA1LjEzNS4wNDkuMTM5LjA0OS4xNDQuMDQ4LjE0Ny4wNDguMTUyLjA0Ny4xNTUuMDQ2LjE2LjA0NS4xNjMuMDQ1LjE2Ny4wNDQuMTcxLjA0Mi4xNzYuMDQyLjE3OC4wNC4xODMuMDQuMTg3LjAzOC4xOS4wMzcuMTk0LjAzNi4xOTcuMDM0LjIwMi4wMzMuMjA0LjAzMi4yMDkuMDMuMjEyLjAyOC4yMTYuMDI3LjIxOS4wMjUuMjIyLjAyNC4yMjYuMDIyLjIzLjAyLjIzMy4wMTguMjM2LjAxNi4yNC4wMTQuMjQzLjAxMi4yNDYuMDEuMjQ5LjAwOC4yNTMuMDA2LjI1Ni4wMDMuMjU5LjAwMS4yNi0uMDAxLjI1Ny0uMDAzLjI1NC0uMDA2LjI1LS4wMDguMjQ3LS4wMS4yNDQtLjAxMi4yNDEtLjAxNS4yMzctLjAxNi4yMzMtLjAxOC4yMzEtLjAyLjIyNi0uMDIyLjIyNC0uMDI0LjIyLS4wMjUuMjE2LS4wMjcuMjEyLS4wMjkuMjEtLjAzLjIwNS0uMDMyLjIwMi0uMDMzLjE5OC0uMDM1LjE5NC0uMDM2LjE5MS0uMDM3LjE4Ny0uMDM5LjE4My0uMDM5LjE3OS0uMDQxLjE3NS0uMDQyLjE3Mi0uMDQzLjE2OC0uMDQ0LjE2My0uMDQ1LjE2LS4wNDUuMTU1LS4wNDcuMTUyLS4wNDcuMTQ4LS4wNDguMTQzLS4wNDguMTM5LS4wNS4xMzYtLjA0OS4xMzEtLjA1LjEyNi0uMDUxLjEyMy0uMDUxLjExOC0uMDUxLjExNC0uMDUyLjExLS4wNTIuMTA2LS4wNTIuMTAxLS4wNTIuMDk2LS4wNTIuMDkyLS4wNTIuMDg4LS4wNTIuMDgzLS4wNTIuMDc5LS4wNTIuMDc0LS4wNTEuMDctLjA1Mi4wNjUtLjA1MS4wNi0uMDUuMDU2LS4wNTEuMDUxLS4wNDkuMDIzLS4wMjUuMDIzLS4wMjQuMDIxLS4wMjUuMDItLjAyNC4wMTktLjAyNC4wMTgtLjAyNC4wMTctLjAyNC4wMTUtLjAyMy4wMTQtLjAyMy4wMTMtLjAyNC4wMTItLjAyMi4wMS0uMDIzLjAxLS4wMjMuMDA4LS4wMjIuMDA2LS4wMjIuMDA2LS4wMjIuMDA0LS4wMjEuMDA0LS4wMjIuMDAxLS4wMjEuMDAxLS4wMjF2LTQuMTM5bC0uMDc3LjA1NC0uMDguMDU0LS4wODMuMDU0LS4wODUuMDUyLS4wODcuMDUzLS4wOS4wNTEtLjA5My4wNTEtLjA5NS4wNTEtLjA5Ny4wNS0uMS4wNDktLjEwMi4wNDktLjEwNS4wNDgtLjEwNi4wNDctLjEwOS4wNDctLjExMS4wNDYtLjExNC4wNDUtLjExNS4wNDQtLjExOC4wNDQtLjEyLjA0NC0uMTIyLjA0Mi0uMTI0LjA0Mi0uMTI2LjA0MS0uMTI4LjA0LS4xMy4wMzktLjEzMi4wMzktLjEzNC4wMzgtLjEzNS4wMzctLjEzOC4wMzYtLjEzOS4wMzYtLjE0Mi4wMzUtLjE0My4wMzMtLjE0NC4wMzMtLjE0Ny4wMzMtLjE0OC4wMzEtLjE1LjAzLS4xNTEuMDMtLjE1My4wMjgtLjE1NC4wMjgtLjE1Ni4wMjctLjE1OC4wMjYtLjE1OS4wMjUtLjE2MS4wMjQtLjE2Mi4wMjMtLjE2My4wMjItLjE2NS4wMjEtLjE2Ni4wMi0uMTY3LjAxOS0uMTY5LjAxOC0uMTY5LjAxNy0uMTcxLjAxNi0uMTczLjAxNS0uMTczLjAxNC0uMTc1LjAxMy0uMTc1LjAxMi0uMTc3LjAxMS0uMTc4LjAwOS0uMTc5LjAwOS0uMTc5LjAwNy0uMTgxLjAwNy0uMTgyLjAwNS0uMTgyLjAwNC0uMTg0LjAwMy0uMTg0LjAwMmgtLjM3bC0uMTg0LS4wMDItLjE4NC0uMDAzLS4xODItLjAwNC0uMTgyLS4wMDUtLjE4MS0uMDA3LS4xNzktLjAwNy0uMTc5LS4wMDktLjE3OC0uMDA5LS4xNzYtLjAxMS0uMTc2LS4wMTItLjE3NS0uMDEzLS4xNzMtLjAxNC0uMTcyLS4wMTUtLjE3MS0uMDE2LS4xNy0uMDE3LS4xNjktLjAxOC0uMTY3LS4wMTktLjE2Ni0uMDItLjE2NS0uMDIxLS4xNjMtLjAyMi0uMTYyLS4wMjMtLjE2MS0uMDI0LS4xNTktLjAyNS0uMTU3LS4wMjYtLjE1Ni0uMDI3LS4xNTUtLjAyOC0uMTUzLS4wMjgtLjE1MS0uMDMtLjE1LS4wMy0uMTQ4LS4wMzEtLjE0Ni0uMDMzLS4xNDUtLjAzMy0uMTQzLS4wMzMtLjE0MS0uMDM1LS4xNC0uMDM2LS4xMzctLjAzNi0uMTM2LS4wMzctLjEzNC0uMDM4LS4xMzItLjAzOS0uMTMtLjAzOS0uMTI4LS4wNC0uMTI2LS4wNDEtLjEyNC0uMDQyLS4xMjItLjA0My0uMTItLjA0My0uMTE3LS4wNDQtLjExNi0uMDQ0LS4xMTMtLjA0Ni0uMTEyLS4wNDYtLjEwOS0uMDQ2LS4xMDYtLjA0Ny0uMTA1LS4wNDgtLjEwMi0uMDQ5LS4xLS4wNDktLjA5Ny0uMDUtLjA5NS0uMDUxLS4wOTMtLjA1MS0uMDktLjA1MS0uMDg3LS4wNTMtLjA4NS0uMDUyLS4wODMtLjA1NC0uMDgtLjA1NC0uMDc3LS4wNTR2NC4xMzl6bTAtNS42NjZ2LjAxMWwuMDAxLjAyLjAwMy4wMjIuMDA0LjAyMS4wMDUuMDIyLjAwNi4wMjEuMDA3LjAyMi4wMDkuMDIzLjAxLjAyMi4wMTEuMDIzLjAxMi4wMjMuMDEzLjAyMy4wMTUuMDIzLjAxNi4wMjQuMDE3LjAyNC4wMTguMDIzLjAxOS4wMjQuMDIxLjAyNS4wMjIuMDI0LjAyMy4wMjQuMDI0LjAyNS4wNTIuMDUuMDU2LjA1LjA2MS4wNS4wNjYuMDUxLjA3LjA1MS4wNzUuMDUyLjA3OS4wNTEuMDg0LjA1Mi4wODguMDUyLjA5Mi4wNTIuMDk3LjA1Mi4xMDIuMDUyLjEwNS4wNTEuMTEuMDUyLjExNC4wNTEuMTE5LjA1MS4xMjMuMDUxLjEyNy4wNS4xMzEuMDUuMTM1LjA1LjEzOS4wNDkuMTQ0LjA0OC4xNDcuMDQ4LjE1Mi4wNDcuMTU1LjA0Ni4xNi4wNDUuMTYzLjA0NS4xNjcuMDQzLjE3MS4wNDMuMTc2LjA0Mi4xNzguMDQuMTgzLjA0LjE4Ny4wMzguMTkuMDM3LjE5NC4wMzYuMTk3LjAzNC4yMDIuMDMzLjIwNC4wMzIuMjA5LjAzLjIxMi4wMjguMjE2LjAyNy4yMTkuMDI1LjIyMi4wMjQuMjI2LjAyMS4yMy4wMi4yMzMuMDE4LjIzNi4wMTcuMjQuMDE0LjI0My4wMTIuMjQ2LjAxLjI0OS4wMDguMjUzLjAwNi4yNTYuMDAzLjI1OS4wMDEuMjYtLjAwMS4yNTctLjAwMy4yNTQtLjAwNi4yNS0uMDA4LjI0Ny0uMDEuMjQ0LS4wMTMuMjQxLS4wMTQuMjM3LS4wMTYuMjMzLS4wMTguMjMxLS4wMi4yMjYtLjAyMi4yMjQtLjAyNC4yMi0uMDI1LjIxNi0uMDI3LjIxMi0uMDI5LjIxLS4wMy4yMDUtLjAzMi4yMDItLjAzMy4xOTgtLjAzNS4xOTQtLjAzNi4xOTEtLjAzNy4xODctLjAzOS4xODMtLjAzOS4xNzktLjA0MS4xNzUtLjA0Mi4xNzItLjA0My4xNjgtLjA0NC4xNjMtLjA0NS4xNi0uMDQ1LjE1NS0uMDQ3LjE1Mi0uMDQ3LjE0OC0uMDQ4LjE0My0uMDQ5LjEzOS0uMDQ5LjEzNi0uMDQ5LjEzMS0uMDUxLjEyNi0uMDUuMTIzLS4wNTEuMTE4LS4wNTIuMTE0LS4wNTEuMTEtLjA1Mi4xMDYtLjA1Mi4xMDEtLjA1Mi4wOTYtLjA1Mi4wOTItLjA1Mi4wODgtLjA1Mi4wODMtLjA1Mi4wNzktLjA1Mi4wNzQtLjA1Mi4wNy0uMDUxLjA2NS0uMDUxLjA2LS4wNTEuMDU2LS4wNS4wNTEtLjA0OS4wMjMtLjAyNS4wMjMtLjAyNS4wMjEtLjAyNC4wMi0uMDI0LjAxOS0uMDI0LjAxOC0uMDI0LjAxNy0uMDI0LjAxNS0uMDIzLjAxNC0uMDI0LjAxMy0uMDIzLjAxMi0uMDIzLjAxLS4wMjIuMDEtLjAyMy4wMDgtLjAyMi4wMDYtLjAyMi4wMDYtLjAyMi4wMDQtLjAyMi4wMDQtLjAyMS4wMDEtLjAyMS4wMDEtLjAyMXYtNC4xNTNsLS4wNzcuMDU0LS4wOC4wNTQtLjA4My4wNTMtLjA4NS4wNTMtLjA4Ny4wNTMtLjA5LjA1MS0uMDkzLjA1MS0uMDk1LjA1MS0uMDk3LjA1LS4xLjA0OS0uMTAyLjA0OC0uMTA1LjA0OC0uMTA2LjA0OC0uMTA5LjA0Ni0uMTExLjA0Ni0uMTE0LjA0Ni0uMTE1LjA0NC0uMTE4LjA0NC0uMTIuMDQzLS4xMjIuMDQzLS4xMjQuMDQyLS4xMjYuMDQxLS4xMjguMDQtLjEzLjAzOS0uMTMyLjAzOS0uMTM0LjAzOC0uMTM1LjAzNy0uMTM4LjAzNi0uMTM5LjAzNi0uMTQyLjAzNC0uMTQzLjAzNC0uMTQ0LjAzMy0uMTQ3LjAzMi0uMTQ4LjAzMi0uMTUuMDMtLjE1MS4wMy0uMTUzLjAyOC0uMTU0LjAyOC0uMTU2LjAyNy0uMTU4LjAyNi0uMTU5LjAyNC0uMTYxLjAyNC0uMTYyLjAyMy0uMTYzLjAyMy0uMTY1LjAyMS0uMTY2LjAyLS4xNjcuMDE5LS4xNjkuMDE4LS4xNjkuMDE3LS4xNzEuMDE2LS4xNzMuMDE1LS4xNzMuMDE0LS4xNzUuMDEzLS4xNzUuMDEyLS4xNzcuMDEtLjE3OC4wMS0uMTc5LjAwOS0uMTc5LjAwNy0uMTgxLjAwNi0uMTgyLjAwNi0uMTgyLjAwNC0uMTg0LjAwMy0uMTg0LjAwMS0uMTg1LjAwMS0uMTg1LS4wMDEtLjE4NC0uMDAxLS4xODQtLjAwMy0uMTgyLS4wMDQtLjE4Mi0uMDA2LS4xODEtLjAwNi0uMTc5LS4wMDctLjE3OS0uMDA5LS4xNzgtLjAxLS4xNzYtLjAxLS4xNzYtLjAxMi0uMTc1LS4wMTMtLjE3My0uMDE0LS4xNzItLjAxNS0uMTcxLS4wMTYtLjE3LS4wMTctLjE2OS0uMDE4LS4xNjctLjAxOS0uMTY2LS4wMi0uMTY1LS4wMjEtLjE2My0uMDIzLS4xNjItLjAyMy0uMTYxLS4wMjQtLjE1OS0uMDI0LS4xNTctLjAyNi0uMTU2LS4wMjctLjE1NS0uMDI4LS4xNTMtLjAyOC0uMTUxLS4wMy0uMTUtLjAzLS4xNDgtLjAzMi0uMTQ2LS4wMzItLjE0NS0uMDMzLS4xNDMtLjAzNC0uMTQxLS4wMzQtLjE0LS4wMzYtLjEzNy0uMDM2LS4xMzYtLjAzNy0uMTM0LS4wMzgtLjEzMi0uMDM5LS4xMy0uMDM5LS4xMjgtLjA0MS0uMTI2LS4wNDEtLjEyNC0uMDQxLS4xMjItLjA0My0uMTItLjA0My0uMTE3LS4wNDQtLjExNi0uMDQ0LS4xMTMtLjA0Ni0uMTEyLS4wNDYtLjEwOS0uMDQ2LS4xMDYtLjA0OC0uMTA1LS4wNDgtLjEwMi0uMDQ4LS4xLS4wNS0uMDk3LS4wNDktLjA5NS0uMDUxLS4wOTMtLjA1MS0uMDktLjA1Mi0uMDg3LS4wNTItLjA4NS0uMDUzLS4wODMtLjA1My0uMDgtLjA1NC0uMDc3LS4wNTR2NC4xNTN6bTguNzQtOC4xNzlsLS4yNTcuMDA0LS4yNTQuMDA1LS4yNS4wMDgtLjI0Ny4wMTEtLjI0NC4wMTItLjI0MS4wMTQtLjIzNy4wMTYtLjIzMy4wMTgtLjIzMS4wMjEtLjIyNi4wMjItLjIyNC4wMjMtLjIyLjAyNi0uMjE2LjAyNy0uMjEyLjAyOC0uMjEuMDMxLS4yMDUuMDMyLS4yMDIuMDMzLS4xOTguMDM0LS4xOTQuMDM2LS4xOTEuMDM4LS4xODcuMDM4LS4xODMuMDQtLjE3OS4wNDEtLjE3NS4wNDItLjE3Mi4wNDMtLjE2OC4wNDMtLjE2My4wNDUtLjE2LjA0Ni0uMTU1LjA0Ni0uMTUyLjA0OC0uMTQ4LjA0OC0uMTQzLjA0OC0uMTM5LjA0OS0uMTM2LjA1LS4xMzEuMDUtLjEyNi4wNTEtLjEyMy4wNTEtLjExOC4wNTEtLjExNC4wNTItLjExLjA1Mi0uMTA2LjA1Mi0uMTAxLjA1Mi0uMDk2LjA1Mi0uMDkyLjA1Mi0uMDg4LjA1Mi0uMDgzLjA1Mi0uMDc5LjA1Mi0uMDc0LjA1MS0uMDcuMDUyLS4wNjUuMDUxLS4wNi4wNS0uMDU2LjA1LS4wNTEuMDUtLjAyMy4wMjUtLjAyMy4wMjQtLjAyMS4wMjQtLjAyLjAyNS0uMDE5LjAyNC0uMDE4LjAyNC0uMDE3LjAyMy0uMDE1LjAyNC0uMDE0LjAyMy0uMDEzLjAyMy0uMDEyLjAyMy0uMDEuMDIzLS4wMS4wMjItLjAwOC4wMjItLjAwNi4wMjMtLjAwNi4wMjEtLjAwNC4wMjItLjAwNC4wMjEtLjAwMS4wMjEtLjAwMS4wMjEuMDAxLjAyMS4wMDEuMDIxLjAwNC4wMjEuMDA0LjAyMi4wMDYuMDIxLjAwNi4wMjMuMDA4LjAyMi4wMS4wMjIuMDEuMDIzLjAxMi4wMjMuMDEzLjAyMy4wMTQuMDIzLjAxNS4wMjQuMDE3LjAyMy4wMTguMDI0LjAxOS4wMjQuMDIuMDI1LjAyMS4wMjQuMDIzLjAyNC4wMjMuMDI1LjA1MS4wNS4wNTYuMDUuMDYuMDUuMDY1LjA1MS4wNy4wNTIuMDc0LjA1MS4wNzkuMDUyLjA4My4wNTIuMDg4LjA1Mi4wOTIuMDUyLjA5Ni4wNTIuMTAxLjA1Mi4xMDYuMDUyLjExLjA1Mi4xMTQuMDUyLjExOC4wNTEuMTIzLjA1MS4xMjYuMDUxLjEzMS4wNS4xMzYuMDUuMTM5LjA0OS4xNDMuMDQ4LjE0OC4wNDguMTUyLjA0OC4xNTUuMDQ2LjE2LjA0Ni4xNjMuMDQ1LjE2OC4wNDMuMTcyLjA0My4xNzUuMDQyLjE3OS4wNDEuMTgzLjA0LjE4Ny4wMzguMTkxLjAzOC4xOTQuMDM2LjE5OC4wMzQuMjAyLjAzMy4yMDUuMDMyLjIxLjAzMS4yMTIuMDI4LjIxNi4wMjcuMjIuMDI2LjIyNC4wMjMuMjI2LjAyMi4yMzEuMDIxLjIzMy4wMTguMjM3LjAxNi4yNDEuMDE0LjI0NC4wMTIuMjQ3LjAxMS4yNS4wMDguMjU0LjAwNS4yNTcuMDA0LjI2LjAwMS4yNi0uMDAxLjI1Ny0uMDA0LjI1NC0uMDA1LjI1LS4wMDguMjQ3LS4wMTEuMjQ0LS4wMTIuMjQxLS4wMTQuMjM3LS4wMTYuMjMzLS4wMTguMjMxLS4wMjEuMjI2LS4wMjIuMjI0LS4wMjMuMjItLjAyNi4yMTYtLjAyNy4yMTItLjAyOC4yMS0uMDMxLjIwNS0uMDMyLjIwMi0uMDMzLjE5OC0uMDM0LjE5NC0uMDM2LjE5MS0uMDM4LjE4Ny0uMDM4LjE4My0uMDQuMTc5LS4wNDEuMTc1LS4wNDIuMTcyLS4wNDMuMTY4LS4wNDMuMTYzLS4wNDUuMTYtLjA0Ni4xNTUtLjA0Ni4xNTItLjA0OC4xNDgtLjA0OC4xNDMtLjA0OC4xMzktLjA0OS4xMzYtLjA1LjEzMS0uMDUuMTI2LS4wNTEuMTIzLS4wNTEuMTE4LS4wNTEuMTE0LS4wNTIuMTEtLjA1Mi4xMDYtLjA1Mi4xMDEtLjA1Mi4wOTYtLjA1Mi4wOTItLjA1Mi4wODgtLjA1Mi4wODMtLjA1Mi4wNzktLjA1Mi4wNzQtLjA1MS4wNy0uMDUyLjA2NS0uMDUxLjA2LS4wNS4wNTYtLjA1LjA1MS0uMDUuMDIzLS4wMjUuMDIzLS4wMjQuMDIxLS4wMjQuMDItLjAyNS4wMTktLjAyNC4wMTgtLjAyNC4wMTctLjAyMy4wMTUtLjAyNC4wMTQtLjAyMy4wMTMtLjAyMy4wMTItLjAyMy4wMS0uMDIzLjAxLS4wMjIuMDA4LS4wMjIuMDA2LS4wMjMuMDA2LS4wMjEuMDA0LS4wMjIuMDA0LS4wMjEuMDAxLS4wMjEuMDAxLS4wMjEtLjAwMS0uMDIxLS4wMDEtLjAyMS0uMDA0LS4wMjEtLjAwNC0uMDIyLS4wMDYtLjAyMS0uMDA2LS4wMjMtLjAwOC0uMDIyLS4wMS0uMDIyLS4wMS0uMDIzLS4wMTItLjAyMy0uMDEzLS4wMjMtLjAxNC0uMDIzLS4wMTUtLjAyNC0uMDE3LS4wMjMtLjAxOC0uMDI0LS4wMTktLjAyNC0uMDItLjAyNS0uMDIxLS4wMjQtLjAyMy0uMDI0LS4wMjMtLjAyNS0uMDUxLS4wNS0uMDU2LS4wNS0uMDYtLjA1LS4wNjUtLjA1MS0uMDctLjA1Mi0uMDc0LS4wNTEtLjA3OS0uMDUyLS4wODMtLjA1Mi0uMDg4LS4wNTItLjA5Mi0uMDUyLS4wOTYtLjA1Mi0uMTAxLS4wNTItLjEwNi0uMDUyLS4xMS0uMDUyLS4xMTQtLjA1Mi0uMTE4LS4wNTEtLjEyMy0uMDUxLS4xMjYtLjA1MS0uMTMxLS4wNS0uMTM2LS4wNS0uMTM5LS4wNDktLjE0My0uMDQ4LS4xNDgtLjA0OC0uMTUyLS4wNDgtLjE1NS0uMDQ2LS4xNi0uMDQ2LS4xNjMtLjA0NS0uMTY4LS4wNDMtLjE3Mi0uMDQzLS4xNzUtLjA0Mi0uMTc5LS4wNDEtLjE4My0uMDQtLjE4Ny0uMDM4LS4xOTEtLjAzOC0uMTk0LS4wMzYtLjE5OC0uMDM0LS4yMDItLjAzMy0uMjA1LS4wMzItLjIxLS4wMzEtLjIxMi0uMDI4LS4yMTYtLjAyNy0uMjItLjAyNi0uMjI0LS4wMjMtLjIyNi0uMDIyLS4yMzEtLjAyMS0uMjMzLS4wMTgtLjIzNy0uMDE2LS4yNDEtLjAxNC0uMjQ0LS4wMTItLjI0Ny0uMDExLS4yNS0uMDA4LS4yNTQtLjAwNS0uMjU3LS4wMDQtLjI2LS4wMDEtLjI2LjAwMXpcIlxuICApO1xufSwgXCJpbnNlcnREYXRhYmFzZUljb25cIik7XG52YXIgaW5zZXJ0Q29tcHV0ZXJJY29uID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihlbGVtLCBpZCkge1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwic3ltYm9sXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiLWNvbXB1dGVyXCIpLmF0dHIoXCJ3aWR0aFwiLCBcIjI0XCIpLmF0dHIoXCJoZWlnaHRcIiwgXCIyNFwiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJzY2FsZSguNSlcIikuYXR0cihcbiAgICBcImRcIixcbiAgICBcIk0yIDJ2MTNoMjB2LTEzaC0yMHptMTggMTFoLTE2di05aDE2djl6bS0xMC4yMjggNmwuNDY2LTFoMy41MjRsLjQ2NyAxaC00LjQ1N3ptMTQuMjI4IDNoLTI0bDItNmgyLjEwNGwtMS4zMyA0aDE4LjQ1bC0xLjI5Ny00aDIuMDczbDIgNnptLTUtMTBoLTE0di03aDE0djd6XCJcbiAgKTtcbn0sIFwiaW5zZXJ0Q29tcHV0ZXJJY29uXCIpO1xudmFyIGluc2VydENsb2NrSWNvbiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbSwgaWQpIHtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcInN5bWJvbFwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIi1jbG9ja1wiKS5hdHRyKFwid2lkdGhcIiwgXCIyNFwiKS5hdHRyKFwiaGVpZ2h0XCIsIFwiMjRcIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwidHJhbnNmb3JtXCIsIFwic2NhbGUoLjUpXCIpLmF0dHIoXG4gICAgXCJkXCIsXG4gICAgXCJNMTIgMmM1LjUxNCAwIDEwIDQuNDg2IDEwIDEwcy00LjQ4NiAxMC0xMCAxMC0xMC00LjQ4Ni0xMC0xMCA0LjQ4Ni0xMCAxMC0xMHptMC0yYy02LjYyNyAwLTEyIDUuMzczLTEyIDEyczUuMzczIDEyIDEyIDEyIDEyLTUuMzczIDEyLTEyLTUuMzczLTEyLTEyLTEyem01Ljg0OCAxMi40NTljLjIwMi4wMzguMjAyLjMzMy4wMDEuMzcyLTEuOTA3LjM2MS02LjA0NSAxLjExMS02LjU0NyAxLjExMS0uNzE5IDAtMS4zMDEtLjU4Mi0xLjMwMS0xLjMwMSAwLS41MTIuNzctNS40NDcgMS4xMjUtNy40NDUuMDM0LS4xOTIuMzEyLS4xODEuMzQzLjAxNGwuOTg1IDYuMjM4IDUuMzk0IDEuMDExelwiXG4gICk7XG59LCBcImluc2VydENsb2NrSWNvblwiKTtcbnZhciBpbnNlcnRBcnJvd0hlYWQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIGlkKSB7XG4gIGVsZW0uYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCItYXJyb3doZWFkXCIpLmF0dHIoXCJyZWZYXCIsIDkpLmF0dHIoXCJyZWZZXCIsIDUpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAxMikuYXR0cihcIm1hcmtlckhlaWdodFwiLCAxMikuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0gMCAwIEwgMTAgNSBMIDAgMTAgelwiKTtcbn0sIFwiaW5zZXJ0QXJyb3dIZWFkXCIpO1xudmFyIGluc2VydEFycm93RW5kID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihlbGVtLCBpZCkge1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiLWFycm93ZW5kXCIpLmF0dHIoXCJyZWZYXCIsIDEpLmF0dHIoXCJyZWZZXCIsIDUpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAxMikuYXR0cihcIm1hcmtlckhlaWdodFwiLCAxMikuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0gMTAgMCBMIDAgNSBMIDEwIDEwIHpcIik7XG59LCBcImluc2VydEFycm93RW5kXCIpO1xudmFyIGluc2VydEFycm93RmlsbGVkSGVhZCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbSwgaWQpIHtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIi1maWxsZWQtaGVhZFwiKS5hdHRyKFwicmVmWFwiLCAxOCkuYXR0cihcInJlZllcIiwgNykuYXR0cihcIm1hcmtlcldpZHRoXCIsIDIwKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDI4KS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSAxOCw3IEw5LDEzIEwxNCw3IEw5LDEgWlwiKTtcbn0sIFwiaW5zZXJ0QXJyb3dGaWxsZWRIZWFkXCIpO1xudmFyIGluc2VydEFycm93Q3Jvc3NIZWFkID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihlbGVtLCBpZCkge1xuICBjb25zdCBkZWZzID0gZWxlbS5hcHBlbmQoXCJkZWZzXCIpO1xuICBjb25zdCBtYXJrZXIgPSBkZWZzLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIi1jcm9zc2hlYWRcIikuYXR0cihcIm1hcmtlcldpZHRoXCIsIDE1KS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDgpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmF0dHIoXCJyZWZYXCIsIDE2KS5hdHRyKFwicmVmWVwiLCA0KTtcbiAgbWFya2VyLmFwcGVuZChcInBhdGhcIikuYXR0cihcImZpbGxcIiwgXCJibGFja1wiKS5hdHRyKFwic3Ryb2tlXCIsIFwiIzAwMDAwMFwiKS5zdHlsZShcInN0cm9rZS1kYXNoYXJyYXlcIiwgXCIwLCAwXCIpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgXCIxcHhcIikuYXR0cihcImRcIiwgXCJNIDksMiBWIDYgTDE2LDQgWlwiKTtcbiAgbWFya2VyLmFwcGVuZChcInBhdGhcIikuYXR0cihcImZpbGxcIiwgXCJub25lXCIpLmF0dHIoXCJzdHJva2VcIiwgXCIjMDAwMDAwXCIpLnN0eWxlKFwic3Ryb2tlLWRhc2hhcnJheVwiLCBcIjAsIDBcIikuYXR0cihcInN0cm9rZS13aWR0aFwiLCBcIjFweFwiKS5hdHRyKFwiZFwiLCBcIk0gMCwxIEwgNiw3IE0gNiwxIEwgMCw3XCIpO1xufSwgXCJpbnNlcnRBcnJvd0Nyb3NzSGVhZFwiKTtcbnZhciBnZXRDNFNoYXBlRm9udCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGNuZiwgdHlwZUM0U2hhcGUpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBmb250RmFtaWx5OiBjbmZbdHlwZUM0U2hhcGUgKyBcIkZvbnRGYW1pbHlcIl0sXG4gICAgZm9udFNpemU6IGNuZlt0eXBlQzRTaGFwZSArIFwiRm9udFNpemVcIl0sXG4gICAgZm9udFdlaWdodDogY25mW3R5cGVDNFNoYXBlICsgXCJGb250V2VpZ2h0XCJdXG4gIH07XG59LCBcImdldEM0U2hhcGVGb250XCIpO1xudmFyIF9kcmF3VGV4dENhbmRpZGF0ZUZ1bmMgPSAvKiBAX19QVVJFX18gKi8gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBieVRleHQoY29udGVudCwgZywgeCwgeSwgd2lkdGgsIGhlaWdodCwgdGV4dEF0dHJzKSB7XG4gICAgY29uc3QgdGV4dCA9IGcuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwieFwiLCB4ICsgd2lkdGggLyAyKS5hdHRyKFwieVwiLCB5ICsgaGVpZ2h0IC8gMiArIDUpLnN0eWxlKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIikudGV4dChjb250ZW50KTtcbiAgICBfc2V0VGV4dEF0dHJzKHRleHQsIHRleHRBdHRycyk7XG4gIH1cbiAgX19uYW1lKGJ5VGV4dCwgXCJieVRleHRcIik7XG4gIGZ1bmN0aW9uIGJ5VHNwYW4oY29udGVudCwgZywgeCwgeSwgd2lkdGgsIGhlaWdodCwgdGV4dEF0dHJzLCBjb25mMikge1xuICAgIGNvbnN0IHsgZm9udFNpemUsIGZvbnRGYW1pbHksIGZvbnRXZWlnaHQgfSA9IGNvbmYyO1xuICAgIGNvbnN0IGxpbmVzID0gY29udGVudC5zcGxpdChjb21tb25fZGVmYXVsdC5saW5lQnJlYWtSZWdleCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZHkgPSBpICogZm9udFNpemUgLSBmb250U2l6ZSAqIChsaW5lcy5sZW5ndGggLSAxKSAvIDI7XG4gICAgICBjb25zdCB0ZXh0ID0gZy5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJ4XCIsIHggKyB3aWR0aCAvIDIpLmF0dHIoXCJ5XCIsIHkpLnN0eWxlKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIikuYXR0cihcImRvbWluYW50LWJhc2VsaW5lXCIsIFwibWlkZGxlXCIpLnN0eWxlKFwiZm9udC1zaXplXCIsIGZvbnRTaXplKS5zdHlsZShcImZvbnQtd2VpZ2h0XCIsIGZvbnRXZWlnaHQpLnN0eWxlKFwiZm9udC1mYW1pbHlcIiwgZm9udEZhbWlseSk7XG4gICAgICB0ZXh0LmFwcGVuZChcInRzcGFuXCIpLmF0dHIoXCJkeVwiLCBkeSkudGV4dChsaW5lc1tpXSkuYXR0cihcImFsaWdubWVudC1iYXNlbGluZVwiLCBcIm1hdGhlbWF0aWNhbFwiKTtcbiAgICAgIF9zZXRUZXh0QXR0cnModGV4dCwgdGV4dEF0dHJzKTtcbiAgICB9XG4gIH1cbiAgX19uYW1lKGJ5VHNwYW4sIFwiYnlUc3BhblwiKTtcbiAgZnVuY3Rpb24gYnlGbyhjb250ZW50LCBnLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCB0ZXh0QXR0cnMsIGNvbmYyKSB7XG4gICAgY29uc3QgcyA9IGcuYXBwZW5kKFwic3dpdGNoXCIpO1xuICAgIGNvbnN0IGYgPSBzLmFwcGVuZChcImZvcmVpZ25PYmplY3RcIikuYXR0cihcInhcIiwgeCkuYXR0cihcInlcIiwgeSkuYXR0cihcIndpZHRoXCIsIHdpZHRoKS5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCk7XG4gICAgY29uc3QgdGV4dCA9IGYuYXBwZW5kKFwieGh0bWw6ZGl2XCIpLnN0eWxlKFwiZGlzcGxheVwiLCBcInRhYmxlXCIpLnN0eWxlKFwiaGVpZ2h0XCIsIFwiMTAwJVwiKS5zdHlsZShcIndpZHRoXCIsIFwiMTAwJVwiKTtcbiAgICB0ZXh0LmFwcGVuZChcImRpdlwiKS5zdHlsZShcImRpc3BsYXlcIiwgXCJ0YWJsZS1jZWxsXCIpLnN0eWxlKFwidGV4dC1hbGlnblwiLCBcImNlbnRlclwiKS5zdHlsZShcInZlcnRpY2FsLWFsaWduXCIsIFwibWlkZGxlXCIpLnRleHQoY29udGVudCk7XG4gICAgYnlUc3Bhbihjb250ZW50LCBzLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCB0ZXh0QXR0cnMsIGNvbmYyKTtcbiAgICBfc2V0VGV4dEF0dHJzKHRleHQsIHRleHRBdHRycyk7XG4gIH1cbiAgX19uYW1lKGJ5Rm8sIFwiYnlGb1wiKTtcbiAgZnVuY3Rpb24gX3NldFRleHRBdHRycyh0b1RleHQsIGZyb21UZXh0QXR0cnNEaWN0KSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gZnJvbVRleHRBdHRyc0RpY3QpIHtcbiAgICAgIGlmIChmcm9tVGV4dEF0dHJzRGljdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIHRvVGV4dC5hdHRyKGtleSwgZnJvbVRleHRBdHRyc0RpY3Rba2V5XSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIF9fbmFtZShfc2V0VGV4dEF0dHJzLCBcIl9zZXRUZXh0QXR0cnNcIik7XG4gIHJldHVybiBmdW5jdGlvbihjb25mMikge1xuICAgIHJldHVybiBjb25mMi50ZXh0UGxhY2VtZW50ID09PSBcImZvXCIgPyBieUZvIDogY29uZjIudGV4dFBsYWNlbWVudCA9PT0gXCJvbGRcIiA/IGJ5VGV4dCA6IGJ5VHNwYW47XG4gIH07XG59KSgpO1xudmFyIHN2Z0RyYXdfZGVmYXVsdCA9IHtcbiAgZHJhd1JlY3Q6IGRyYXdSZWN0MixcbiAgZHJhd0JvdW5kYXJ5LFxuICBkcmF3QzRTaGFwZSxcbiAgZHJhd1JlbHMsXG4gIGRyYXdJbWFnZSxcbiAgaW5zZXJ0QXJyb3dIZWFkLFxuICBpbnNlcnRBcnJvd0VuZCxcbiAgaW5zZXJ0QXJyb3dGaWxsZWRIZWFkLFxuICBpbnNlcnRBcnJvd0Nyb3NzSGVhZCxcbiAgaW5zZXJ0RGF0YWJhc2VJY29uLFxuICBpbnNlcnRDb21wdXRlckljb24sXG4gIGluc2VydENsb2NrSWNvblxufTtcblxuLy8gc3JjL2RpYWdyYW1zL2M0L2M0UmVuZGVyZXIuanNcbnZhciBnbG9iYWxCb3VuZGFyeU1heFggPSAwO1xudmFyIGdsb2JhbEJvdW5kYXJ5TWF4WSA9IDA7XG52YXIgYzRTaGFwZUluUm93MiA9IDQ7XG52YXIgYzRCb3VuZGFyeUluUm93MiA9IDI7XG5wYXJzZXIueXkgPSBjNERiX2RlZmF1bHQ7XG52YXIgY29uZiA9IHt9O1xudmFyIEJvdW5kcyA9IGNsYXNzIHtcbiAgc3RhdGljIHtcbiAgICBfX25hbWUodGhpcywgXCJCb3VuZHNcIik7XG4gIH1cbiAgY29uc3RydWN0b3IoZGlhZ09iaikge1xuICAgIHRoaXMubmFtZSA9IFwiXCI7XG4gICAgdGhpcy5kYXRhID0ge307XG4gICAgdGhpcy5kYXRhLnN0YXJ0eCA9IHZvaWQgMDtcbiAgICB0aGlzLmRhdGEuc3RvcHggPSB2b2lkIDA7XG4gICAgdGhpcy5kYXRhLnN0YXJ0eSA9IHZvaWQgMDtcbiAgICB0aGlzLmRhdGEuc3RvcHkgPSB2b2lkIDA7XG4gICAgdGhpcy5kYXRhLndpZHRoTGltaXQgPSB2b2lkIDA7XG4gICAgdGhpcy5uZXh0RGF0YSA9IHt9O1xuICAgIHRoaXMubmV4dERhdGEuc3RhcnR4ID0gdm9pZCAwO1xuICAgIHRoaXMubmV4dERhdGEuc3RvcHggPSB2b2lkIDA7XG4gICAgdGhpcy5uZXh0RGF0YS5zdGFydHkgPSB2b2lkIDA7XG4gICAgdGhpcy5uZXh0RGF0YS5zdG9weSA9IHZvaWQgMDtcbiAgICB0aGlzLm5leHREYXRhLmNudCA9IDA7XG4gICAgc2V0Q29uZihkaWFnT2JqLmRiLmdldENvbmZpZygpKTtcbiAgfVxuICBzZXREYXRhKHN0YXJ0eCwgc3RvcHgsIHN0YXJ0eSwgc3RvcHkpIHtcbiAgICB0aGlzLm5leHREYXRhLnN0YXJ0eCA9IHRoaXMuZGF0YS5zdGFydHggPSBzdGFydHg7XG4gICAgdGhpcy5uZXh0RGF0YS5zdG9weCA9IHRoaXMuZGF0YS5zdG9weCA9IHN0b3B4O1xuICAgIHRoaXMubmV4dERhdGEuc3RhcnR5ID0gdGhpcy5kYXRhLnN0YXJ0eSA9IHN0YXJ0eTtcbiAgICB0aGlzLm5leHREYXRhLnN0b3B5ID0gdGhpcy5kYXRhLnN0b3B5ID0gc3RvcHk7XG4gIH1cbiAgdXBkYXRlVmFsKG9iaiwga2V5LCB2YWwsIGZ1bikge1xuICAgIGlmIChvYmpba2V5XSA9PT0gdm9pZCAwKSB7XG4gICAgICBvYmpba2V5XSA9IHZhbDtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqW2tleV0gPSBmdW4odmFsLCBvYmpba2V5XSk7XG4gICAgfVxuICB9XG4gIGluc2VydChjNFNoYXBlKSB7XG4gICAgdGhpcy5uZXh0RGF0YS5jbnQgPSB0aGlzLm5leHREYXRhLmNudCArIDE7XG4gICAgbGV0IF9zdGFydHggPSB0aGlzLm5leHREYXRhLnN0YXJ0eCA9PT0gdGhpcy5uZXh0RGF0YS5zdG9weCA/IHRoaXMubmV4dERhdGEuc3RvcHggKyBjNFNoYXBlLm1hcmdpbiA6IHRoaXMubmV4dERhdGEuc3RvcHggKyBjNFNoYXBlLm1hcmdpbiAqIDI7XG4gICAgbGV0IF9zdG9weCA9IF9zdGFydHggKyBjNFNoYXBlLndpZHRoO1xuICAgIGxldCBfc3RhcnR5ID0gdGhpcy5uZXh0RGF0YS5zdGFydHkgKyBjNFNoYXBlLm1hcmdpbiAqIDI7XG4gICAgbGV0IF9zdG9weSA9IF9zdGFydHkgKyBjNFNoYXBlLmhlaWdodDtcbiAgICBpZiAoX3N0YXJ0eCA+PSB0aGlzLmRhdGEud2lkdGhMaW1pdCB8fCBfc3RvcHggPj0gdGhpcy5kYXRhLndpZHRoTGltaXQgfHwgdGhpcy5uZXh0RGF0YS5jbnQgPiBjNFNoYXBlSW5Sb3cyKSB7XG4gICAgICBfc3RhcnR4ID0gdGhpcy5uZXh0RGF0YS5zdGFydHggKyBjNFNoYXBlLm1hcmdpbiArIGNvbmYubmV4dExpbmVQYWRkaW5nWDtcbiAgICAgIF9zdGFydHkgPSB0aGlzLm5leHREYXRhLnN0b3B5ICsgYzRTaGFwZS5tYXJnaW4gKiAyO1xuICAgICAgdGhpcy5uZXh0RGF0YS5zdG9weCA9IF9zdG9weCA9IF9zdGFydHggKyBjNFNoYXBlLndpZHRoO1xuICAgICAgdGhpcy5uZXh0RGF0YS5zdGFydHkgPSB0aGlzLm5leHREYXRhLnN0b3B5O1xuICAgICAgdGhpcy5uZXh0RGF0YS5zdG9weSA9IF9zdG9weSA9IF9zdGFydHkgKyBjNFNoYXBlLmhlaWdodDtcbiAgICAgIHRoaXMubmV4dERhdGEuY250ID0gMTtcbiAgICB9XG4gICAgYzRTaGFwZS54ID0gX3N0YXJ0eDtcbiAgICBjNFNoYXBlLnkgPSBfc3RhcnR5O1xuICAgIHRoaXMudXBkYXRlVmFsKHRoaXMuZGF0YSwgXCJzdGFydHhcIiwgX3N0YXJ0eCwgTWF0aC5taW4pO1xuICAgIHRoaXMudXBkYXRlVmFsKHRoaXMuZGF0YSwgXCJzdGFydHlcIiwgX3N0YXJ0eSwgTWF0aC5taW4pO1xuICAgIHRoaXMudXBkYXRlVmFsKHRoaXMuZGF0YSwgXCJzdG9weFwiLCBfc3RvcHgsIE1hdGgubWF4KTtcbiAgICB0aGlzLnVwZGF0ZVZhbCh0aGlzLmRhdGEsIFwic3RvcHlcIiwgX3N0b3B5LCBNYXRoLm1heCk7XG4gICAgdGhpcy51cGRhdGVWYWwodGhpcy5uZXh0RGF0YSwgXCJzdGFydHhcIiwgX3N0YXJ0eCwgTWF0aC5taW4pO1xuICAgIHRoaXMudXBkYXRlVmFsKHRoaXMubmV4dERhdGEsIFwic3RhcnR5XCIsIF9zdGFydHksIE1hdGgubWluKTtcbiAgICB0aGlzLnVwZGF0ZVZhbCh0aGlzLm5leHREYXRhLCBcInN0b3B4XCIsIF9zdG9weCwgTWF0aC5tYXgpO1xuICAgIHRoaXMudXBkYXRlVmFsKHRoaXMubmV4dERhdGEsIFwic3RvcHlcIiwgX3N0b3B5LCBNYXRoLm1heCk7XG4gIH1cbiAgaW5pdChkaWFnT2JqKSB7XG4gICAgdGhpcy5uYW1lID0gXCJcIjtcbiAgICB0aGlzLmRhdGEgPSB7XG4gICAgICBzdGFydHg6IHZvaWQgMCxcbiAgICAgIHN0b3B4OiB2b2lkIDAsXG4gICAgICBzdGFydHk6IHZvaWQgMCxcbiAgICAgIHN0b3B5OiB2b2lkIDAsXG4gICAgICB3aWR0aExpbWl0OiB2b2lkIDBcbiAgICB9O1xuICAgIHRoaXMubmV4dERhdGEgPSB7XG4gICAgICBzdGFydHg6IHZvaWQgMCxcbiAgICAgIHN0b3B4OiB2b2lkIDAsXG4gICAgICBzdGFydHk6IHZvaWQgMCxcbiAgICAgIHN0b3B5OiB2b2lkIDAsXG4gICAgICBjbnQ6IDBcbiAgICB9O1xuICAgIHNldENvbmYoZGlhZ09iai5kYi5nZXRDb25maWcoKSk7XG4gIH1cbiAgYnVtcExhc3RNYXJnaW4obWFyZ2luKSB7XG4gICAgdGhpcy5kYXRhLnN0b3B4ICs9IG1hcmdpbjtcbiAgICB0aGlzLmRhdGEuc3RvcHkgKz0gbWFyZ2luO1xuICB9XG59O1xudmFyIHNldENvbmYgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGNuZikge1xuICBhc3NpZ25XaXRoRGVwdGhfZGVmYXVsdChjb25mLCBjbmYpO1xuICBpZiAoY25mLmZvbnRGYW1pbHkpIHtcbiAgICBjb25mLnBlcnNvbkZvbnRGYW1pbHkgPSBjb25mLnN5c3RlbUZvbnRGYW1pbHkgPSBjb25mLm1lc3NhZ2VGb250RmFtaWx5ID0gY25mLmZvbnRGYW1pbHk7XG4gIH1cbiAgaWYgKGNuZi5mb250U2l6ZSkge1xuICAgIGNvbmYucGVyc29uRm9udFNpemUgPSBjb25mLnN5c3RlbUZvbnRTaXplID0gY29uZi5tZXNzYWdlRm9udFNpemUgPSBjbmYuZm9udFNpemU7XG4gIH1cbiAgaWYgKGNuZi5mb250V2VpZ2h0KSB7XG4gICAgY29uZi5wZXJzb25Gb250V2VpZ2h0ID0gY29uZi5zeXN0ZW1Gb250V2VpZ2h0ID0gY29uZi5tZXNzYWdlRm9udFdlaWdodCA9IGNuZi5mb250V2VpZ2h0O1xuICB9XG59LCBcInNldENvbmZcIik7XG52YXIgYzRTaGFwZUZvbnQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChjbmYsIHR5cGVDNFNoYXBlKSA9PiB7XG4gIHJldHVybiB7XG4gICAgZm9udEZhbWlseTogY25mW3R5cGVDNFNoYXBlICsgXCJGb250RmFtaWx5XCJdLFxuICAgIGZvbnRTaXplOiBjbmZbdHlwZUM0U2hhcGUgKyBcIkZvbnRTaXplXCJdLFxuICAgIGZvbnRXZWlnaHQ6IGNuZlt0eXBlQzRTaGFwZSArIFwiRm9udFdlaWdodFwiXVxuICB9O1xufSwgXCJjNFNoYXBlRm9udFwiKTtcbnZhciBib3VuZGFyeUZvbnQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChjbmYpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBmb250RmFtaWx5OiBjbmYuYm91bmRhcnlGb250RmFtaWx5LFxuICAgIGZvbnRTaXplOiBjbmYuYm91bmRhcnlGb250U2l6ZSxcbiAgICBmb250V2VpZ2h0OiBjbmYuYm91bmRhcnlGb250V2VpZ2h0XG4gIH07XG59LCBcImJvdW5kYXJ5Rm9udFwiKTtcbnZhciBtZXNzYWdlRm9udCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGNuZikgPT4ge1xuICByZXR1cm4ge1xuICAgIGZvbnRGYW1pbHk6IGNuZi5tZXNzYWdlRm9udEZhbWlseSxcbiAgICBmb250U2l6ZTogY25mLm1lc3NhZ2VGb250U2l6ZSxcbiAgICBmb250V2VpZ2h0OiBjbmYubWVzc2FnZUZvbnRXZWlnaHRcbiAgfTtcbn0sIFwibWVzc2FnZUZvbnRcIik7XG5mdW5jdGlvbiBjYWxjQzRTaGFwZVRleHRXSCh0ZXh0VHlwZSwgYzRTaGFwZSwgYzRTaGFwZVRleHRXcmFwLCB0ZXh0Q29uZiwgdGV4dExpbWl0V2lkdGgpIHtcbiAgaWYgKCFjNFNoYXBlW3RleHRUeXBlXS53aWR0aCkge1xuICAgIGlmIChjNFNoYXBlVGV4dFdyYXApIHtcbiAgICAgIGM0U2hhcGVbdGV4dFR5cGVdLnRleHQgPSB3cmFwTGFiZWwoYzRTaGFwZVt0ZXh0VHlwZV0udGV4dCwgdGV4dExpbWl0V2lkdGgsIHRleHRDb25mKTtcbiAgICAgIGM0U2hhcGVbdGV4dFR5cGVdLnRleHRMaW5lcyA9IGM0U2hhcGVbdGV4dFR5cGVdLnRleHQuc3BsaXQoY29tbW9uX2RlZmF1bHQubGluZUJyZWFrUmVnZXgpLmxlbmd0aDtcbiAgICAgIGM0U2hhcGVbdGV4dFR5cGVdLndpZHRoID0gdGV4dExpbWl0V2lkdGg7XG4gICAgICBjNFNoYXBlW3RleHRUeXBlXS5oZWlnaHQgPSBjYWxjdWxhdGVUZXh0SGVpZ2h0KGM0U2hhcGVbdGV4dFR5cGVdLnRleHQsIHRleHRDb25mKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGxpbmVzID0gYzRTaGFwZVt0ZXh0VHlwZV0udGV4dC5zcGxpdChjb21tb25fZGVmYXVsdC5saW5lQnJlYWtSZWdleCk7XG4gICAgICBjNFNoYXBlW3RleHRUeXBlXS50ZXh0TGluZXMgPSBsaW5lcy5sZW5ndGg7XG4gICAgICBsZXQgbGluZUhlaWdodCA9IDA7XG4gICAgICBjNFNoYXBlW3RleHRUeXBlXS5oZWlnaHQgPSAwO1xuICAgICAgYzRTaGFwZVt0ZXh0VHlwZV0ud2lkdGggPSAwO1xuICAgICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICAgIGM0U2hhcGVbdGV4dFR5cGVdLndpZHRoID0gTWF0aC5tYXgoXG4gICAgICAgICAgY2FsY3VsYXRlVGV4dFdpZHRoKGxpbmUsIHRleHRDb25mKSxcbiAgICAgICAgICBjNFNoYXBlW3RleHRUeXBlXS53aWR0aFxuICAgICAgICApO1xuICAgICAgICBsaW5lSGVpZ2h0ID0gY2FsY3VsYXRlVGV4dEhlaWdodChsaW5lLCB0ZXh0Q29uZik7XG4gICAgICAgIGM0U2hhcGVbdGV4dFR5cGVdLmhlaWdodCA9IGM0U2hhcGVbdGV4dFR5cGVdLmhlaWdodCArIGxpbmVIZWlnaHQ7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5fX25hbWUoY2FsY0M0U2hhcGVUZXh0V0gsIFwiY2FsY0M0U2hhcGVUZXh0V0hcIik7XG52YXIgZHJhd0JvdW5kYXJ5MiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZGlhZ3JhbTIsIGJvdW5kYXJ5LCBib3VuZHMpIHtcbiAgYm91bmRhcnkueCA9IGJvdW5kcy5kYXRhLnN0YXJ0eDtcbiAgYm91bmRhcnkueSA9IGJvdW5kcy5kYXRhLnN0YXJ0eTtcbiAgYm91bmRhcnkud2lkdGggPSBib3VuZHMuZGF0YS5zdG9weCAtIGJvdW5kcy5kYXRhLnN0YXJ0eDtcbiAgYm91bmRhcnkuaGVpZ2h0ID0gYm91bmRzLmRhdGEuc3RvcHkgLSBib3VuZHMuZGF0YS5zdGFydHk7XG4gIGJvdW5kYXJ5LmxhYmVsLnkgPSBjb25mLmM0U2hhcGVNYXJnaW4gLSAzNTtcbiAgbGV0IGJvdW5kYXJ5VGV4dFdyYXAgPSBib3VuZGFyeS53cmFwICYmIGNvbmYud3JhcDtcbiAgbGV0IGJvdW5kYXJ5TGFiZWxDb25mID0gYm91bmRhcnlGb250KGNvbmYpO1xuICBib3VuZGFyeUxhYmVsQ29uZi5mb250U2l6ZSA9IGJvdW5kYXJ5TGFiZWxDb25mLmZvbnRTaXplICsgMjtcbiAgYm91bmRhcnlMYWJlbENvbmYuZm9udFdlaWdodCA9IFwiYm9sZFwiO1xuICBsZXQgdGV4dExpbWl0V2lkdGggPSBjYWxjdWxhdGVUZXh0V2lkdGgoYm91bmRhcnkubGFiZWwudGV4dCwgYm91bmRhcnlMYWJlbENvbmYpO1xuICBjYWxjQzRTaGFwZVRleHRXSChcImxhYmVsXCIsIGJvdW5kYXJ5LCBib3VuZGFyeVRleHRXcmFwLCBib3VuZGFyeUxhYmVsQ29uZiwgdGV4dExpbWl0V2lkdGgpO1xuICBzdmdEcmF3X2RlZmF1bHQuZHJhd0JvdW5kYXJ5KGRpYWdyYW0yLCBib3VuZGFyeSwgY29uZik7XG59LCBcImRyYXdCb3VuZGFyeVwiKTtcbnZhciBkcmF3QzRTaGFwZUFycmF5ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihjdXJyZW50Qm91bmRzLCBkaWFncmFtMiwgYzRTaGFwZUFycmF5MiwgYzRTaGFwZUtleXMpIHtcbiAgbGV0IFkgPSAwO1xuICBmb3IgKGNvbnN0IGM0U2hhcGVLZXkgb2YgYzRTaGFwZUtleXMpIHtcbiAgICBZID0gMDtcbiAgICBjb25zdCBjNFNoYXBlID0gYzRTaGFwZUFycmF5MltjNFNoYXBlS2V5XTtcbiAgICBsZXQgYzRTaGFwZVR5cGVDb25mID0gYzRTaGFwZUZvbnQoY29uZiwgYzRTaGFwZS50eXBlQzRTaGFwZS50ZXh0KTtcbiAgICBjNFNoYXBlVHlwZUNvbmYuZm9udFNpemUgPSBjNFNoYXBlVHlwZUNvbmYuZm9udFNpemUgLSAyO1xuICAgIGM0U2hhcGUudHlwZUM0U2hhcGUud2lkdGggPSBjYWxjdWxhdGVUZXh0V2lkdGgoXG4gICAgICBcIlxceEFCXCIgKyBjNFNoYXBlLnR5cGVDNFNoYXBlLnRleHQgKyBcIlxceEJCXCIsXG4gICAgICBjNFNoYXBlVHlwZUNvbmZcbiAgICApO1xuICAgIGM0U2hhcGUudHlwZUM0U2hhcGUuaGVpZ2h0ID0gYzRTaGFwZVR5cGVDb25mLmZvbnRTaXplICsgMjtcbiAgICBjNFNoYXBlLnR5cGVDNFNoYXBlLlkgPSBjb25mLmM0U2hhcGVQYWRkaW5nO1xuICAgIFkgPSBjNFNoYXBlLnR5cGVDNFNoYXBlLlkgKyBjNFNoYXBlLnR5cGVDNFNoYXBlLmhlaWdodCAtIDQ7XG4gICAgYzRTaGFwZS5pbWFnZSA9IHsgd2lkdGg6IDAsIGhlaWdodDogMCwgWTogMCB9O1xuICAgIHN3aXRjaCAoYzRTaGFwZS50eXBlQzRTaGFwZS50ZXh0KSB7XG4gICAgICBjYXNlIFwicGVyc29uXCI6XG4gICAgICBjYXNlIFwiZXh0ZXJuYWxfcGVyc29uXCI6XG4gICAgICAgIGM0U2hhcGUuaW1hZ2Uud2lkdGggPSA0ODtcbiAgICAgICAgYzRTaGFwZS5pbWFnZS5oZWlnaHQgPSA0ODtcbiAgICAgICAgYzRTaGFwZS5pbWFnZS5ZID0gWTtcbiAgICAgICAgWSA9IGM0U2hhcGUuaW1hZ2UuWSArIGM0U2hhcGUuaW1hZ2UuaGVpZ2h0O1xuICAgICAgICBicmVhaztcbiAgICB9XG4gICAgaWYgKGM0U2hhcGUuc3ByaXRlKSB7XG4gICAgICBjNFNoYXBlLmltYWdlLndpZHRoID0gNDg7XG4gICAgICBjNFNoYXBlLmltYWdlLmhlaWdodCA9IDQ4O1xuICAgICAgYzRTaGFwZS5pbWFnZS5ZID0gWTtcbiAgICAgIFkgPSBjNFNoYXBlLmltYWdlLlkgKyBjNFNoYXBlLmltYWdlLmhlaWdodDtcbiAgICB9XG4gICAgbGV0IGM0U2hhcGVUZXh0V3JhcCA9IGM0U2hhcGUud3JhcCAmJiBjb25mLndyYXA7XG4gICAgbGV0IHRleHRMaW1pdFdpZHRoID0gY29uZi53aWR0aCAtIGNvbmYuYzRTaGFwZVBhZGRpbmcgKiAyO1xuICAgIGxldCBjNFNoYXBlTGFiZWxDb25mID0gYzRTaGFwZUZvbnQoY29uZiwgYzRTaGFwZS50eXBlQzRTaGFwZS50ZXh0KTtcbiAgICBjNFNoYXBlTGFiZWxDb25mLmZvbnRTaXplID0gYzRTaGFwZUxhYmVsQ29uZi5mb250U2l6ZSArIDI7XG4gICAgYzRTaGFwZUxhYmVsQ29uZi5mb250V2VpZ2h0ID0gXCJib2xkXCI7XG4gICAgY2FsY0M0U2hhcGVUZXh0V0goXCJsYWJlbFwiLCBjNFNoYXBlLCBjNFNoYXBlVGV4dFdyYXAsIGM0U2hhcGVMYWJlbENvbmYsIHRleHRMaW1pdFdpZHRoKTtcbiAgICBjNFNoYXBlLmxhYmVsLlkgPSBZICsgODtcbiAgICBZID0gYzRTaGFwZS5sYWJlbC5ZICsgYzRTaGFwZS5sYWJlbC5oZWlnaHQ7XG4gICAgaWYgKGM0U2hhcGUudHlwZSAmJiBjNFNoYXBlLnR5cGUudGV4dCAhPT0gXCJcIikge1xuICAgICAgYzRTaGFwZS50eXBlLnRleHQgPSBcIltcIiArIGM0U2hhcGUudHlwZS50ZXh0ICsgXCJdXCI7XG4gICAgICBsZXQgYzRTaGFwZVR5cGVDb25mMiA9IGM0U2hhcGVGb250KGNvbmYsIGM0U2hhcGUudHlwZUM0U2hhcGUudGV4dCk7XG4gICAgICBjYWxjQzRTaGFwZVRleHRXSChcInR5cGVcIiwgYzRTaGFwZSwgYzRTaGFwZVRleHRXcmFwLCBjNFNoYXBlVHlwZUNvbmYyLCB0ZXh0TGltaXRXaWR0aCk7XG4gICAgICBjNFNoYXBlLnR5cGUuWSA9IFkgKyA1O1xuICAgICAgWSA9IGM0U2hhcGUudHlwZS5ZICsgYzRTaGFwZS50eXBlLmhlaWdodDtcbiAgICB9IGVsc2UgaWYgKGM0U2hhcGUudGVjaG4gJiYgYzRTaGFwZS50ZWNobi50ZXh0ICE9PSBcIlwiKSB7XG4gICAgICBjNFNoYXBlLnRlY2huLnRleHQgPSBcIltcIiArIGM0U2hhcGUudGVjaG4udGV4dCArIFwiXVwiO1xuICAgICAgbGV0IGM0U2hhcGVUZWNobkNvbmYgPSBjNFNoYXBlRm9udChjb25mLCBjNFNoYXBlLnRlY2huLnRleHQpO1xuICAgICAgY2FsY0M0U2hhcGVUZXh0V0goXCJ0ZWNoblwiLCBjNFNoYXBlLCBjNFNoYXBlVGV4dFdyYXAsIGM0U2hhcGVUZWNobkNvbmYsIHRleHRMaW1pdFdpZHRoKTtcbiAgICAgIGM0U2hhcGUudGVjaG4uWSA9IFkgKyA1O1xuICAgICAgWSA9IGM0U2hhcGUudGVjaG4uWSArIGM0U2hhcGUudGVjaG4uaGVpZ2h0O1xuICAgIH1cbiAgICBsZXQgcmVjdEhlaWdodCA9IFk7XG4gICAgbGV0IHJlY3RXaWR0aCA9IGM0U2hhcGUubGFiZWwud2lkdGg7XG4gICAgaWYgKGM0U2hhcGUuZGVzY3IgJiYgYzRTaGFwZS5kZXNjci50ZXh0ICE9PSBcIlwiKSB7XG4gICAgICBsZXQgYzRTaGFwZURlc2NyQ29uZiA9IGM0U2hhcGVGb250KGNvbmYsIGM0U2hhcGUudHlwZUM0U2hhcGUudGV4dCk7XG4gICAgICBjYWxjQzRTaGFwZVRleHRXSChcImRlc2NyXCIsIGM0U2hhcGUsIGM0U2hhcGVUZXh0V3JhcCwgYzRTaGFwZURlc2NyQ29uZiwgdGV4dExpbWl0V2lkdGgpO1xuICAgICAgYzRTaGFwZS5kZXNjci5ZID0gWSArIDIwO1xuICAgICAgWSA9IGM0U2hhcGUuZGVzY3IuWSArIGM0U2hhcGUuZGVzY3IuaGVpZ2h0O1xuICAgICAgcmVjdFdpZHRoID0gTWF0aC5tYXgoYzRTaGFwZS5sYWJlbC53aWR0aCwgYzRTaGFwZS5kZXNjci53aWR0aCk7XG4gICAgICByZWN0SGVpZ2h0ID0gWSAtIGM0U2hhcGUuZGVzY3IudGV4dExpbmVzICogNTtcbiAgICB9XG4gICAgcmVjdFdpZHRoID0gcmVjdFdpZHRoICsgY29uZi5jNFNoYXBlUGFkZGluZztcbiAgICBjNFNoYXBlLndpZHRoID0gTWF0aC5tYXgoYzRTaGFwZS53aWR0aCB8fCBjb25mLndpZHRoLCByZWN0V2lkdGgsIGNvbmYud2lkdGgpO1xuICAgIGM0U2hhcGUuaGVpZ2h0ID0gTWF0aC5tYXgoYzRTaGFwZS5oZWlnaHQgfHwgY29uZi5oZWlnaHQsIHJlY3RIZWlnaHQsIGNvbmYuaGVpZ2h0KTtcbiAgICBjNFNoYXBlLm1hcmdpbiA9IGM0U2hhcGUubWFyZ2luIHx8IGNvbmYuYzRTaGFwZU1hcmdpbjtcbiAgICBjdXJyZW50Qm91bmRzLmluc2VydChjNFNoYXBlKTtcbiAgICBzdmdEcmF3X2RlZmF1bHQuZHJhd0M0U2hhcGUoZGlhZ3JhbTIsIGM0U2hhcGUsIGNvbmYpO1xuICB9XG4gIGN1cnJlbnRCb3VuZHMuYnVtcExhc3RNYXJnaW4oY29uZi5jNFNoYXBlTWFyZ2luKTtcbn0sIFwiZHJhd0M0U2hhcGVBcnJheVwiKTtcbnZhciBQb2ludCA9IGNsYXNzIHtcbiAgc3RhdGljIHtcbiAgICBfX25hbWUodGhpcywgXCJQb2ludFwiKTtcbiAgfVxuICBjb25zdHJ1Y3Rvcih4LCB5KSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICB9XG59O1xudmFyIGdldEludGVyc2VjdFBvaW50ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihmcm9tTm9kZSwgZW5kUG9pbnQpIHtcbiAgbGV0IHgxID0gZnJvbU5vZGUueDtcbiAgbGV0IHkxID0gZnJvbU5vZGUueTtcbiAgbGV0IHgyID0gZW5kUG9pbnQueDtcbiAgbGV0IHkyID0gZW5kUG9pbnQueTtcbiAgbGV0IGZyb21DZW50ZXJYID0geDEgKyBmcm9tTm9kZS53aWR0aCAvIDI7XG4gIGxldCBmcm9tQ2VudGVyWSA9IHkxICsgZnJvbU5vZGUuaGVpZ2h0IC8gMjtcbiAgbGV0IGR4ID0gTWF0aC5hYnMoeDEgLSB4Mik7XG4gIGxldCBkeSA9IE1hdGguYWJzKHkxIC0geTIpO1xuICBsZXQgdGFuRFlYID0gZHkgLyBkeDtcbiAgbGV0IGZyb21EWVggPSBmcm9tTm9kZS5oZWlnaHQgLyBmcm9tTm9kZS53aWR0aDtcbiAgbGV0IHJldHVyblBvaW50ID0gbnVsbDtcbiAgaWYgKHkxID09IHkyICYmIHgxIDwgeDIpIHtcbiAgICByZXR1cm5Qb2ludCA9IG5ldyBQb2ludCh4MSArIGZyb21Ob2RlLndpZHRoLCBmcm9tQ2VudGVyWSk7XG4gIH0gZWxzZSBpZiAoeTEgPT0geTIgJiYgeDEgPiB4Mikge1xuICAgIHJldHVyblBvaW50ID0gbmV3IFBvaW50KHgxLCBmcm9tQ2VudGVyWSk7XG4gIH0gZWxzZSBpZiAoeDEgPT0geDIgJiYgeTEgPCB5Mikge1xuICAgIHJldHVyblBvaW50ID0gbmV3IFBvaW50KGZyb21DZW50ZXJYLCB5MSArIGZyb21Ob2RlLmhlaWdodCk7XG4gIH0gZWxzZSBpZiAoeDEgPT0geDIgJiYgeTEgPiB5Mikge1xuICAgIHJldHVyblBvaW50ID0gbmV3IFBvaW50KGZyb21DZW50ZXJYLCB5MSk7XG4gIH1cbiAgaWYgKHgxID4geDIgJiYgeTEgPCB5Mikge1xuICAgIGlmIChmcm9tRFlYID49IHRhbkRZWCkge1xuICAgICAgcmV0dXJuUG9pbnQgPSBuZXcgUG9pbnQoeDEsIGZyb21DZW50ZXJZICsgdGFuRFlYICogZnJvbU5vZGUud2lkdGggLyAyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuUG9pbnQgPSBuZXcgUG9pbnQoXG4gICAgICAgIGZyb21DZW50ZXJYIC0gZHggLyBkeSAqIGZyb21Ob2RlLmhlaWdodCAvIDIsXG4gICAgICAgIHkxICsgZnJvbU5vZGUuaGVpZ2h0XG4gICAgICApO1xuICAgIH1cbiAgfSBlbHNlIGlmICh4MSA8IHgyICYmIHkxIDwgeTIpIHtcbiAgICBpZiAoZnJvbURZWCA+PSB0YW5EWVgpIHtcbiAgICAgIHJldHVyblBvaW50ID0gbmV3IFBvaW50KHgxICsgZnJvbU5vZGUud2lkdGgsIGZyb21DZW50ZXJZICsgdGFuRFlYICogZnJvbU5vZGUud2lkdGggLyAyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuUG9pbnQgPSBuZXcgUG9pbnQoXG4gICAgICAgIGZyb21DZW50ZXJYICsgZHggLyBkeSAqIGZyb21Ob2RlLmhlaWdodCAvIDIsXG4gICAgICAgIHkxICsgZnJvbU5vZGUuaGVpZ2h0XG4gICAgICApO1xuICAgIH1cbiAgfSBlbHNlIGlmICh4MSA8IHgyICYmIHkxID4geTIpIHtcbiAgICBpZiAoZnJvbURZWCA+PSB0YW5EWVgpIHtcbiAgICAgIHJldHVyblBvaW50ID0gbmV3IFBvaW50KHgxICsgZnJvbU5vZGUud2lkdGgsIGZyb21DZW50ZXJZIC0gdGFuRFlYICogZnJvbU5vZGUud2lkdGggLyAyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuUG9pbnQgPSBuZXcgUG9pbnQoZnJvbUNlbnRlclggKyBmcm9tTm9kZS5oZWlnaHQgLyAyICogZHggLyBkeSwgeTEpO1xuICAgIH1cbiAgfSBlbHNlIGlmICh4MSA+IHgyICYmIHkxID4geTIpIHtcbiAgICBpZiAoZnJvbURZWCA+PSB0YW5EWVgpIHtcbiAgICAgIHJldHVyblBvaW50ID0gbmV3IFBvaW50KHgxLCBmcm9tQ2VudGVyWSAtIGZyb21Ob2RlLndpZHRoIC8gMiAqIHRhbkRZWCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVyblBvaW50ID0gbmV3IFBvaW50KGZyb21DZW50ZXJYIC0gZnJvbU5vZGUuaGVpZ2h0IC8gMiAqIGR4IC8gZHksIHkxKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJldHVyblBvaW50O1xufSwgXCJnZXRJbnRlcnNlY3RQb2ludFwiKTtcbnZhciBnZXRJbnRlcnNlY3RQb2ludHMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGZyb21Ob2RlLCBlbmROb2RlKSB7XG4gIGxldCBlbmRJbnRlcnNlY3RQb2ludCA9IHsgeDogMCwgeTogMCB9O1xuICBlbmRJbnRlcnNlY3RQb2ludC54ID0gZW5kTm9kZS54ICsgZW5kTm9kZS53aWR0aCAvIDI7XG4gIGVuZEludGVyc2VjdFBvaW50LnkgPSBlbmROb2RlLnkgKyBlbmROb2RlLmhlaWdodCAvIDI7XG4gIGxldCBzdGFydFBvaW50ID0gZ2V0SW50ZXJzZWN0UG9pbnQoZnJvbU5vZGUsIGVuZEludGVyc2VjdFBvaW50KTtcbiAgZW5kSW50ZXJzZWN0UG9pbnQueCA9IGZyb21Ob2RlLnggKyBmcm9tTm9kZS53aWR0aCAvIDI7XG4gIGVuZEludGVyc2VjdFBvaW50LnkgPSBmcm9tTm9kZS55ICsgZnJvbU5vZGUuaGVpZ2h0IC8gMjtcbiAgbGV0IGVuZFBvaW50ID0gZ2V0SW50ZXJzZWN0UG9pbnQoZW5kTm9kZSwgZW5kSW50ZXJzZWN0UG9pbnQpO1xuICByZXR1cm4geyBzdGFydFBvaW50LCBlbmRQb2ludCB9O1xufSwgXCJnZXRJbnRlcnNlY3RQb2ludHNcIik7XG52YXIgZHJhd1JlbHMyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihkaWFncmFtMiwgcmVsczIsIGdldEM0U2hhcGVPYmosIGRpYWdPYmosIGRpYWdyYW1JZCkge1xuICBsZXQgaSA9IDA7XG4gIGZvciAobGV0IHJlbCBvZiByZWxzMikge1xuICAgIGkgPSBpICsgMTtcbiAgICBsZXQgcmVsVGV4dFdyYXAgPSByZWwud3JhcCAmJiBjb25mLndyYXA7XG4gICAgbGV0IHJlbENvbmYgPSBtZXNzYWdlRm9udChjb25mKTtcbiAgICBsZXQgZGlhZ3JhbVR5cGUgPSBkaWFnT2JqLmRiLmdldEM0VHlwZSgpO1xuICAgIGlmIChkaWFncmFtVHlwZSA9PT0gXCJDNER5bmFtaWNcIikge1xuICAgICAgcmVsLmxhYmVsLnRleHQgPSBpICsgXCI6IFwiICsgcmVsLmxhYmVsLnRleHQ7XG4gICAgfVxuICAgIGxldCB0ZXh0TGltaXRXaWR0aCA9IGNhbGN1bGF0ZVRleHRXaWR0aChyZWwubGFiZWwudGV4dCwgcmVsQ29uZik7XG4gICAgY2FsY0M0U2hhcGVUZXh0V0goXCJsYWJlbFwiLCByZWwsIHJlbFRleHRXcmFwLCByZWxDb25mLCB0ZXh0TGltaXRXaWR0aCk7XG4gICAgaWYgKHJlbC50ZWNobiAmJiByZWwudGVjaG4udGV4dCAhPT0gXCJcIikge1xuICAgICAgdGV4dExpbWl0V2lkdGggPSBjYWxjdWxhdGVUZXh0V2lkdGgocmVsLnRlY2huLnRleHQsIHJlbENvbmYpO1xuICAgICAgY2FsY0M0U2hhcGVUZXh0V0goXCJ0ZWNoblwiLCByZWwsIHJlbFRleHRXcmFwLCByZWxDb25mLCB0ZXh0TGltaXRXaWR0aCk7XG4gICAgfVxuICAgIGlmIChyZWwuZGVzY3IgJiYgcmVsLmRlc2NyLnRleHQgIT09IFwiXCIpIHtcbiAgICAgIHRleHRMaW1pdFdpZHRoID0gY2FsY3VsYXRlVGV4dFdpZHRoKHJlbC5kZXNjci50ZXh0LCByZWxDb25mKTtcbiAgICAgIGNhbGNDNFNoYXBlVGV4dFdIKFwiZGVzY3JcIiwgcmVsLCByZWxUZXh0V3JhcCwgcmVsQ29uZiwgdGV4dExpbWl0V2lkdGgpO1xuICAgIH1cbiAgICBsZXQgZnJvbU5vZGUgPSBnZXRDNFNoYXBlT2JqKHJlbC5mcm9tKTtcbiAgICBsZXQgZW5kTm9kZSA9IGdldEM0U2hhcGVPYmoocmVsLnRvKTtcbiAgICBsZXQgcG9pbnRzID0gZ2V0SW50ZXJzZWN0UG9pbnRzKGZyb21Ob2RlLCBlbmROb2RlKTtcbiAgICByZWwuc3RhcnRQb2ludCA9IHBvaW50cy5zdGFydFBvaW50O1xuICAgIHJlbC5lbmRQb2ludCA9IHBvaW50cy5lbmRQb2ludDtcbiAgfVxuICBzdmdEcmF3X2RlZmF1bHQuZHJhd1JlbHMoZGlhZ3JhbTIsIHJlbHMyLCBjb25mLCBkaWFncmFtSWQpO1xufSwgXCJkcmF3UmVsc1wiKTtcbmZ1bmN0aW9uIGRyYXdJbnNpZGVCb3VuZGFyeShkaWFncmFtMiwgcGFyZW50Qm91bmRhcnlBbGlhcywgcGFyZW50Qm91bmRzLCBjdXJyZW50Qm91bmRhcmllcywgZGlhZ09iaikge1xuICBsZXQgY3VycmVudEJvdW5kcyA9IG5ldyBCb3VuZHMoZGlhZ09iaik7XG4gIGN1cnJlbnRCb3VuZHMuZGF0YS53aWR0aExpbWl0ID0gcGFyZW50Qm91bmRzLmRhdGEud2lkdGhMaW1pdCAvIE1hdGgubWluKGM0Qm91bmRhcnlJblJvdzIsIGN1cnJlbnRCb3VuZGFyaWVzLmxlbmd0aCk7XG4gIGZvciAobGV0IFtpLCBjdXJyZW50Qm91bmRhcnldIG9mIGN1cnJlbnRCb3VuZGFyaWVzLmVudHJpZXMoKSkge1xuICAgIGxldCBZID0gMDtcbiAgICBjdXJyZW50Qm91bmRhcnkuaW1hZ2UgPSB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAsIFk6IDAgfTtcbiAgICBpZiAoY3VycmVudEJvdW5kYXJ5LnNwcml0ZSkge1xuICAgICAgY3VycmVudEJvdW5kYXJ5LmltYWdlLndpZHRoID0gNDg7XG4gICAgICBjdXJyZW50Qm91bmRhcnkuaW1hZ2UuaGVpZ2h0ID0gNDg7XG4gICAgICBjdXJyZW50Qm91bmRhcnkuaW1hZ2UuWSA9IFk7XG4gICAgICBZID0gY3VycmVudEJvdW5kYXJ5LmltYWdlLlkgKyBjdXJyZW50Qm91bmRhcnkuaW1hZ2UuaGVpZ2h0O1xuICAgIH1cbiAgICBsZXQgY3VycmVudEJvdW5kYXJ5VGV4dFdyYXAgPSBjdXJyZW50Qm91bmRhcnkud3JhcCAmJiBjb25mLndyYXA7XG4gICAgbGV0IGN1cnJlbnRCb3VuZGFyeUxhYmVsQ29uZiA9IGJvdW5kYXJ5Rm9udChjb25mKTtcbiAgICBjdXJyZW50Qm91bmRhcnlMYWJlbENvbmYuZm9udFNpemUgPSBjdXJyZW50Qm91bmRhcnlMYWJlbENvbmYuZm9udFNpemUgKyAyO1xuICAgIGN1cnJlbnRCb3VuZGFyeUxhYmVsQ29uZi5mb250V2VpZ2h0ID0gXCJib2xkXCI7XG4gICAgY2FsY0M0U2hhcGVUZXh0V0goXG4gICAgICBcImxhYmVsXCIsXG4gICAgICBjdXJyZW50Qm91bmRhcnksXG4gICAgICBjdXJyZW50Qm91bmRhcnlUZXh0V3JhcCxcbiAgICAgIGN1cnJlbnRCb3VuZGFyeUxhYmVsQ29uZixcbiAgICAgIGN1cnJlbnRCb3VuZHMuZGF0YS53aWR0aExpbWl0XG4gICAgKTtcbiAgICBjdXJyZW50Qm91bmRhcnkubGFiZWwuWSA9IFkgKyA4O1xuICAgIFkgPSBjdXJyZW50Qm91bmRhcnkubGFiZWwuWSArIGN1cnJlbnRCb3VuZGFyeS5sYWJlbC5oZWlnaHQ7XG4gICAgaWYgKGN1cnJlbnRCb3VuZGFyeS50eXBlICYmIGN1cnJlbnRCb3VuZGFyeS50eXBlLnRleHQgIT09IFwiXCIpIHtcbiAgICAgIGN1cnJlbnRCb3VuZGFyeS50eXBlLnRleHQgPSBcIltcIiArIGN1cnJlbnRCb3VuZGFyeS50eXBlLnRleHQgKyBcIl1cIjtcbiAgICAgIGxldCBjdXJyZW50Qm91bmRhcnlUeXBlQ29uZiA9IGJvdW5kYXJ5Rm9udChjb25mKTtcbiAgICAgIGNhbGNDNFNoYXBlVGV4dFdIKFxuICAgICAgICBcInR5cGVcIixcbiAgICAgICAgY3VycmVudEJvdW5kYXJ5LFxuICAgICAgICBjdXJyZW50Qm91bmRhcnlUZXh0V3JhcCxcbiAgICAgICAgY3VycmVudEJvdW5kYXJ5VHlwZUNvbmYsXG4gICAgICAgIGN1cnJlbnRCb3VuZHMuZGF0YS53aWR0aExpbWl0XG4gICAgICApO1xuICAgICAgY3VycmVudEJvdW5kYXJ5LnR5cGUuWSA9IFkgKyA1O1xuICAgICAgWSA9IGN1cnJlbnRCb3VuZGFyeS50eXBlLlkgKyBjdXJyZW50Qm91bmRhcnkudHlwZS5oZWlnaHQ7XG4gICAgfVxuICAgIGlmIChjdXJyZW50Qm91bmRhcnkuZGVzY3IgJiYgY3VycmVudEJvdW5kYXJ5LmRlc2NyLnRleHQgIT09IFwiXCIpIHtcbiAgICAgIGxldCBjdXJyZW50Qm91bmRhcnlEZXNjckNvbmYgPSBib3VuZGFyeUZvbnQoY29uZik7XG4gICAgICBjdXJyZW50Qm91bmRhcnlEZXNjckNvbmYuZm9udFNpemUgPSBjdXJyZW50Qm91bmRhcnlEZXNjckNvbmYuZm9udFNpemUgLSAyO1xuICAgICAgY2FsY0M0U2hhcGVUZXh0V0goXG4gICAgICAgIFwiZGVzY3JcIixcbiAgICAgICAgY3VycmVudEJvdW5kYXJ5LFxuICAgICAgICBjdXJyZW50Qm91bmRhcnlUZXh0V3JhcCxcbiAgICAgICAgY3VycmVudEJvdW5kYXJ5RGVzY3JDb25mLFxuICAgICAgICBjdXJyZW50Qm91bmRzLmRhdGEud2lkdGhMaW1pdFxuICAgICAgKTtcbiAgICAgIGN1cnJlbnRCb3VuZGFyeS5kZXNjci5ZID0gWSArIDIwO1xuICAgICAgWSA9IGN1cnJlbnRCb3VuZGFyeS5kZXNjci5ZICsgY3VycmVudEJvdW5kYXJ5LmRlc2NyLmhlaWdodDtcbiAgICB9XG4gICAgaWYgKGkgPT0gMCB8fCBpICUgYzRCb3VuZGFyeUluUm93MiA9PT0gMCkge1xuICAgICAgbGV0IF94ID0gcGFyZW50Qm91bmRzLmRhdGEuc3RhcnR4ICsgY29uZi5kaWFncmFtTWFyZ2luWDtcbiAgICAgIGxldCBfeSA9IHBhcmVudEJvdW5kcy5kYXRhLnN0b3B5ICsgY29uZi5kaWFncmFtTWFyZ2luWSArIFk7XG4gICAgICBjdXJyZW50Qm91bmRzLnNldERhdGEoX3gsIF94LCBfeSwgX3kpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgX3ggPSBjdXJyZW50Qm91bmRzLmRhdGEuc3RvcHggIT09IGN1cnJlbnRCb3VuZHMuZGF0YS5zdGFydHggPyBjdXJyZW50Qm91bmRzLmRhdGEuc3RvcHggKyBjb25mLmRpYWdyYW1NYXJnaW5YIDogY3VycmVudEJvdW5kcy5kYXRhLnN0YXJ0eDtcbiAgICAgIGxldCBfeSA9IGN1cnJlbnRCb3VuZHMuZGF0YS5zdGFydHk7XG4gICAgICBjdXJyZW50Qm91bmRzLnNldERhdGEoX3gsIF94LCBfeSwgX3kpO1xuICAgIH1cbiAgICBjdXJyZW50Qm91bmRzLm5hbWUgPSBjdXJyZW50Qm91bmRhcnkuYWxpYXM7XG4gICAgbGV0IGN1cnJlbnRQZXJzb25PclN5c3RlbUFycmF5ID0gZGlhZ09iai5kYi5nZXRDNFNoYXBlQXJyYXkoY3VycmVudEJvdW5kYXJ5LmFsaWFzKTtcbiAgICBsZXQgY3VycmVudFBlcnNvbk9yU3lzdGVtS2V5cyA9IGRpYWdPYmouZGIuZ2V0QzRTaGFwZUtleXMoY3VycmVudEJvdW5kYXJ5LmFsaWFzKTtcbiAgICBpZiAoY3VycmVudFBlcnNvbk9yU3lzdGVtS2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICBkcmF3QzRTaGFwZUFycmF5KFxuICAgICAgICBjdXJyZW50Qm91bmRzLFxuICAgICAgICBkaWFncmFtMixcbiAgICAgICAgY3VycmVudFBlcnNvbk9yU3lzdGVtQXJyYXksXG4gICAgICAgIGN1cnJlbnRQZXJzb25PclN5c3RlbUtleXNcbiAgICAgICk7XG4gICAgfVxuICAgIHBhcmVudEJvdW5kYXJ5QWxpYXMgPSBjdXJyZW50Qm91bmRhcnkuYWxpYXM7XG4gICAgbGV0IG5leHRDdXJyZW50Qm91bmRhcmllcyA9IGRpYWdPYmouZGIuZ2V0Qm91bmRhcmllcyhwYXJlbnRCb3VuZGFyeUFsaWFzKTtcbiAgICBpZiAobmV4dEN1cnJlbnRCb3VuZGFyaWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGRyYXdJbnNpZGVCb3VuZGFyeShcbiAgICAgICAgZGlhZ3JhbTIsXG4gICAgICAgIHBhcmVudEJvdW5kYXJ5QWxpYXMsXG4gICAgICAgIGN1cnJlbnRCb3VuZHMsXG4gICAgICAgIG5leHRDdXJyZW50Qm91bmRhcmllcyxcbiAgICAgICAgZGlhZ09ialxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGN1cnJlbnRCb3VuZGFyeS5hbGlhcyAhPT0gXCJnbG9iYWxcIikge1xuICAgICAgZHJhd0JvdW5kYXJ5MihkaWFncmFtMiwgY3VycmVudEJvdW5kYXJ5LCBjdXJyZW50Qm91bmRzKTtcbiAgICB9XG4gICAgcGFyZW50Qm91bmRzLmRhdGEuc3RvcHkgPSBNYXRoLm1heChcbiAgICAgIGN1cnJlbnRCb3VuZHMuZGF0YS5zdG9weSArIGNvbmYuYzRTaGFwZU1hcmdpbixcbiAgICAgIHBhcmVudEJvdW5kcy5kYXRhLnN0b3B5XG4gICAgKTtcbiAgICBwYXJlbnRCb3VuZHMuZGF0YS5zdG9weCA9IE1hdGgubWF4KFxuICAgICAgY3VycmVudEJvdW5kcy5kYXRhLnN0b3B4ICsgY29uZi5jNFNoYXBlTWFyZ2luLFxuICAgICAgcGFyZW50Qm91bmRzLmRhdGEuc3RvcHhcbiAgICApO1xuICAgIGdsb2JhbEJvdW5kYXJ5TWF4WCA9IE1hdGgubWF4KGdsb2JhbEJvdW5kYXJ5TWF4WCwgcGFyZW50Qm91bmRzLmRhdGEuc3RvcHgpO1xuICAgIGdsb2JhbEJvdW5kYXJ5TWF4WSA9IE1hdGgubWF4KGdsb2JhbEJvdW5kYXJ5TWF4WSwgcGFyZW50Qm91bmRzLmRhdGEuc3RvcHkpO1xuICB9XG59XG5fX25hbWUoZHJhd0luc2lkZUJvdW5kYXJ5LCBcImRyYXdJbnNpZGVCb3VuZGFyeVwiKTtcbnZhciBkcmF3ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihfdGV4dCwgaWQsIF92ZXJzaW9uLCBkaWFnT2JqKSB7XG4gIGNvbmYgPSBnZXRDb25maWcoKS5jNDtcbiAgY29uc3Qgc2VjdXJpdHlMZXZlbCA9IGdldENvbmZpZygpLnNlY3VyaXR5TGV2ZWw7XG4gIGxldCBzYW5kYm94RWxlbWVudDtcbiAgaWYgKHNlY3VyaXR5TGV2ZWwgPT09IFwic2FuZGJveFwiKSB7XG4gICAgc2FuZGJveEVsZW1lbnQgPSBzZWxlY3QoXCIjaVwiICsgaWQpO1xuICB9XG4gIGNvbnN0IHJvb3QgPSBzZWN1cml0eUxldmVsID09PSBcInNhbmRib3hcIiA/IHNlbGVjdChzYW5kYm94RWxlbWVudC5ub2RlcygpWzBdLmNvbnRlbnREb2N1bWVudC5ib2R5KSA6IHNlbGVjdChcImJvZHlcIik7XG4gIGxldCBkYiA9IGRpYWdPYmouZGI7XG4gIGRpYWdPYmouZGIuc2V0V3JhcChjb25mLndyYXApO1xuICBjNFNoYXBlSW5Sb3cyID0gZGIuZ2V0QzRTaGFwZUluUm93KCk7XG4gIGM0Qm91bmRhcnlJblJvdzIgPSBkYi5nZXRDNEJvdW5kYXJ5SW5Sb3coKTtcbiAgbG9nLmRlYnVnKGBDOiR7SlNPTi5zdHJpbmdpZnkoY29uZiwgbnVsbCwgMil9YCk7XG4gIGNvbnN0IGRpYWdyYW0yID0gc2VjdXJpdHlMZXZlbCA9PT0gXCJzYW5kYm94XCIgPyByb290LnNlbGVjdChgW2lkPVwiJHtpZH1cIl1gKSA6IHNlbGVjdChgW2lkPVwiJHtpZH1cIl1gKTtcbiAgc3ZnRHJhd19kZWZhdWx0Lmluc2VydENvbXB1dGVySWNvbihkaWFncmFtMiwgaWQpO1xuICBzdmdEcmF3X2RlZmF1bHQuaW5zZXJ0RGF0YWJhc2VJY29uKGRpYWdyYW0yLCBpZCk7XG4gIHN2Z0RyYXdfZGVmYXVsdC5pbnNlcnRDbG9ja0ljb24oZGlhZ3JhbTIsIGlkKTtcbiAgbGV0IHNjcmVlbkJvdW5kcyA9IG5ldyBCb3VuZHMoZGlhZ09iaik7XG4gIHNjcmVlbkJvdW5kcy5zZXREYXRhKFxuICAgIGNvbmYuZGlhZ3JhbU1hcmdpblgsXG4gICAgY29uZi5kaWFncmFtTWFyZ2luWCxcbiAgICBjb25mLmRpYWdyYW1NYXJnaW5ZLFxuICAgIGNvbmYuZGlhZ3JhbU1hcmdpbllcbiAgKTtcbiAgc2NyZWVuQm91bmRzLmRhdGEud2lkdGhMaW1pdCA9IHNjcmVlbi5hdmFpbFdpZHRoO1xuICBnbG9iYWxCb3VuZGFyeU1heFggPSBjb25mLmRpYWdyYW1NYXJnaW5YO1xuICBnbG9iYWxCb3VuZGFyeU1heFkgPSBjb25mLmRpYWdyYW1NYXJnaW5ZO1xuICBjb25zdCB0aXRsZTIgPSBkaWFnT2JqLmRiLmdldFRpdGxlKCk7XG4gIGxldCBjdXJyZW50Qm91bmRhcmllcyA9IGRpYWdPYmouZGIuZ2V0Qm91bmRhcmllcyhcIlwiKTtcbiAgZHJhd0luc2lkZUJvdW5kYXJ5KGRpYWdyYW0yLCBcIlwiLCBzY3JlZW5Cb3VuZHMsIGN1cnJlbnRCb3VuZGFyaWVzLCBkaWFnT2JqKTtcbiAgc3ZnRHJhd19kZWZhdWx0Lmluc2VydEFycm93SGVhZChkaWFncmFtMiwgaWQpO1xuICBzdmdEcmF3X2RlZmF1bHQuaW5zZXJ0QXJyb3dFbmQoZGlhZ3JhbTIsIGlkKTtcbiAgc3ZnRHJhd19kZWZhdWx0Lmluc2VydEFycm93Q3Jvc3NIZWFkKGRpYWdyYW0yLCBpZCk7XG4gIHN2Z0RyYXdfZGVmYXVsdC5pbnNlcnRBcnJvd0ZpbGxlZEhlYWQoZGlhZ3JhbTIsIGlkKTtcbiAgZHJhd1JlbHMyKGRpYWdyYW0yLCBkaWFnT2JqLmRiLmdldFJlbHMoKSwgZGlhZ09iai5kYi5nZXRDNFNoYXBlLCBkaWFnT2JqLCBpZCk7XG4gIHNjcmVlbkJvdW5kcy5kYXRhLnN0b3B4ID0gZ2xvYmFsQm91bmRhcnlNYXhYO1xuICBzY3JlZW5Cb3VuZHMuZGF0YS5zdG9weSA9IGdsb2JhbEJvdW5kYXJ5TWF4WTtcbiAgY29uc3QgYm94ID0gc2NyZWVuQm91bmRzLmRhdGE7XG4gIGxldCBib3hIZWlnaHQgPSBib3guc3RvcHkgLSBib3guc3RhcnR5O1xuICBsZXQgaGVpZ2h0ID0gYm94SGVpZ2h0ICsgMiAqIGNvbmYuZGlhZ3JhbU1hcmdpblk7XG4gIGxldCBib3hXaWR0aCA9IGJveC5zdG9weCAtIGJveC5zdGFydHg7XG4gIGNvbnN0IHdpZHRoID0gYm94V2lkdGggKyAyICogY29uZi5kaWFncmFtTWFyZ2luWDtcbiAgaWYgKHRpdGxlMikge1xuICAgIGRpYWdyYW0yLmFwcGVuZChcInRleHRcIikudGV4dCh0aXRsZTIpLmF0dHIoXCJ4XCIsIChib3guc3RvcHggLSBib3guc3RhcnR4KSAvIDIgLSA0ICogY29uZi5kaWFncmFtTWFyZ2luWCkuYXR0cihcInlcIiwgYm94LnN0YXJ0eSArIGNvbmYuZGlhZ3JhbU1hcmdpblkpO1xuICB9XG4gIGNvbmZpZ3VyZVN2Z1NpemUoZGlhZ3JhbTIsIGhlaWdodCwgd2lkdGgsIGNvbmYudXNlTWF4V2lkdGgpO1xuICBjb25zdCBleHRyYVZlcnRGb3JUaXRsZSA9IHRpdGxlMiA/IDYwIDogMDtcbiAgZGlhZ3JhbTIuYXR0cihcbiAgICBcInZpZXdCb3hcIixcbiAgICBib3guc3RhcnR4IC0gY29uZi5kaWFncmFtTWFyZ2luWCArIFwiIC1cIiArIChjb25mLmRpYWdyYW1NYXJnaW5ZICsgZXh0cmFWZXJ0Rm9yVGl0bGUpICsgXCIgXCIgKyB3aWR0aCArIFwiIFwiICsgKGhlaWdodCArIGV4dHJhVmVydEZvclRpdGxlKVxuICApO1xuICBsb2cuZGVidWcoYG1vZGVsczpgLCBib3gpO1xufSwgXCJkcmF3XCIpO1xudmFyIGM0UmVuZGVyZXJfZGVmYXVsdCA9IHtcbiAgZHJhd1BlcnNvbk9yU3lzdGVtQXJyYXk6IGRyYXdDNFNoYXBlQXJyYXksXG4gIGRyYXdCb3VuZGFyeTogZHJhd0JvdW5kYXJ5MixcbiAgc2V0Q29uZixcbiAgZHJhd1xufTtcblxuLy8gc3JjL2RpYWdyYW1zL2M0L3N0eWxlcy5qc1xudmFyIGdldFN0eWxlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKG9wdGlvbnMpID0+IGAucGVyc29uIHtcbiAgICBzdHJva2U6ICR7b3B0aW9ucy5wZXJzb25Cb3JkZXJ9O1xuICAgIGZpbGw6ICR7b3B0aW9ucy5wZXJzb25Ca2d9O1xuICB9XG5gLCBcImdldFN0eWxlc1wiKTtcbnZhciBzdHlsZXNfZGVmYXVsdCA9IGdldFN0eWxlcztcblxuLy8gc3JjL2RpYWdyYW1zL2M0L2M0RGlhZ3JhbS50c1xudmFyIGRpYWdyYW0gPSB7XG4gIHBhcnNlcjogYzREaWFncmFtX2RlZmF1bHQsXG4gIGRiOiBjNERiX2RlZmF1bHQsXG4gIHJlbmRlcmVyOiBjNFJlbmRlcmVyX2RlZmF1bHQsXG4gIHN0eWxlczogc3R5bGVzX2RlZmF1bHQsXG4gIGluaXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHsgYzQsIHdyYXAgfSkgPT4ge1xuICAgIGM0UmVuZGVyZXJfZGVmYXVsdC5zZXRDb25mKGM0KTtcbiAgICBjNERiX2RlZmF1bHQuc2V0V3JhcCh3cmFwKTtcbiAgfSwgXCJpbml0XCIpXG59O1xuZXhwb3J0IHtcbiAgZGlhZ3JhbVxufTtcbiIKICBdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtyREE7QUF4cERBLElBQUksU0FBVSxRQUFRLEdBQUc7QUFBQSxFQUN2QixJQUFJLG9CQUFvQixPQUFPLFFBQVEsQ0FBQyxHQUFHLEdBQUcsSUFBSSxHQUFHO0FBQUEsSUFDbkQsS0FBSyxLQUFLLE1BQU0sQ0FBQyxHQUFHLElBQUksRUFBRSxPQUFRLEtBQUssR0FBRyxFQUFFLE1BQU07QUFBQTtBQUFBLElBQ2xELE9BQU87QUFBQSxLQUNOLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLElBQUks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Q0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUFBLElBQ3JyQiwrQkFBK0IsT0FBTyxTQUFTLFNBQVMsQ0FBQyxRQUFRLFFBQVEsVUFBVSxJQUFJLFNBQVMsSUFBSSxJQUFJO0FBQUEsTUFDdEcsSUFBSSxLQUFLLEdBQUcsU0FBUztBQUFBLE1BQ3JCLFFBQVE7QUFBQSxhQUNEO0FBQUEsVUFDSCxHQUFHLGFBQWEsSUFBSTtBQUFBLFVBQ3BCO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxhQUFhLElBQUk7QUFBQSxVQUNwQjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsYUFBYSxJQUFJO0FBQUEsVUFDcEI7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLGFBQWEsSUFBSTtBQUFBLFVBQ3BCO0FBQUEsYUFDRztBQUFBLGFBQ0E7QUFBQSxhQUNBO0FBQUEsYUFDQTtBQUFBLGFBQ0E7QUFBQSxVQUNILEdBQUcsVUFBVSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ3ZCO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxTQUFTLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQztBQUFBLFVBQy9CLEtBQUssSUFBSSxHQUFHLElBQUksVUFBVSxDQUFDO0FBQUEsVUFDM0I7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLGtCQUFrQixHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7QUFBQSxVQUN6QyxLQUFLLElBQUksR0FBRyxJQUFJLFVBQVUsRUFBRTtBQUFBLFVBQzVCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsSUFBSSxLQUFLO0FBQUEsVUFDckIsR0FBRyxTQUFTLEtBQUssQ0FBQztBQUFBLFVBQ2xCO0FBQUEsYUFDRztBQUFBLGFBQ0E7QUFBQSxVQUNILEtBQUssSUFBSSxHQUFHLElBQUksS0FBSztBQUFBLFVBQ3JCLEdBQUcsa0JBQWtCLEtBQUssQ0FBQztBQUFBLFVBQzNCO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxJQUFJLE9BQU8sR0FBRyxHQUFHLFlBQVk7QUFBQSxVQUNoQyxHQUFHLDBCQUEwQixHQUFHLEdBQUcsR0FBRztBQUFBLFVBQ3RDLEtBQUssSUFBSSxHQUFHO0FBQUEsVUFDWjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsSUFBSSxPQUFPLEdBQUcsR0FBRyxRQUFRO0FBQUEsVUFDNUIsR0FBRywwQkFBMEIsR0FBRyxHQUFHLEdBQUc7QUFBQSxVQUN0QyxLQUFLLElBQUksR0FBRztBQUFBLFVBQ1o7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLDBCQUEwQixHQUFHLEdBQUcsR0FBRztBQUFBLFVBQ3RDLEtBQUssSUFBSSxHQUFHO0FBQUEsVUFDWjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsSUFBSSxPQUFPLEdBQUcsR0FBRyxXQUFXO0FBQUEsVUFDL0IsR0FBRyxxQkFBcUIsR0FBRyxHQUFHLEdBQUc7QUFBQSxVQUNqQyxLQUFLLElBQUksR0FBRztBQUFBLFVBQ1o7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLGtCQUFrQixRQUFRLEdBQUcsR0FBRyxHQUFHO0FBQUEsVUFDdEMsS0FBSyxJQUFJLEdBQUc7QUFBQSxVQUNaO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxrQkFBa0IsU0FBUyxHQUFHLEdBQUcsR0FBRztBQUFBLFVBQ3ZDLEtBQUssSUFBSSxHQUFHO0FBQUEsVUFDWjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsa0JBQWtCLFNBQVMsR0FBRyxHQUFHLEdBQUc7QUFBQSxVQUN2QyxLQUFLLElBQUksR0FBRztBQUFBLFVBQ1o7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLHNCQUFzQjtBQUFBLFVBQ3pCO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxrQkFBa0IsVUFBVSxHQUFHLEdBQUcsR0FBRztBQUFBLFVBQ3hDLEtBQUssSUFBSSxHQUFHO0FBQUEsVUFDWjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsa0JBQWtCLG1CQUFtQixHQUFHLEdBQUcsR0FBRztBQUFBLFVBQ2pELEtBQUssSUFBSSxHQUFHO0FBQUEsVUFDWjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsa0JBQWtCLFVBQVUsR0FBRyxHQUFHLEdBQUc7QUFBQSxVQUN4QyxLQUFLLElBQUksR0FBRztBQUFBLFVBQ1o7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLGtCQUFrQixhQUFhLEdBQUcsR0FBRyxHQUFHO0FBQUEsVUFDM0MsS0FBSyxJQUFJLEdBQUc7QUFBQSxVQUNaO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxrQkFBa0IsZ0JBQWdCLEdBQUcsR0FBRyxHQUFHO0FBQUEsVUFDOUMsS0FBSyxJQUFJLEdBQUc7QUFBQSxVQUNaO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxrQkFBa0IsbUJBQW1CLEdBQUcsR0FBRyxHQUFHO0FBQUEsVUFDakQsS0FBSyxJQUFJLEdBQUc7QUFBQSxVQUNaO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxrQkFBa0Isc0JBQXNCLEdBQUcsR0FBRyxHQUFHO0FBQUEsVUFDcEQsS0FBSyxJQUFJLEdBQUc7QUFBQSxVQUNaO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxrQkFBa0IseUJBQXlCLEdBQUcsR0FBRyxHQUFHO0FBQUEsVUFDdkQsS0FBSyxJQUFJLEdBQUc7QUFBQSxVQUNaO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxhQUFhLGFBQWEsR0FBRyxHQUFHLEdBQUc7QUFBQSxVQUN0QyxLQUFLLElBQUksR0FBRztBQUFBLFVBQ1o7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLGFBQWEsZ0JBQWdCLEdBQUcsR0FBRyxHQUFHO0FBQUEsVUFDekMsS0FBSyxJQUFJLEdBQUc7QUFBQSxVQUNaO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxhQUFhLG1CQUFtQixHQUFHLEdBQUcsR0FBRztBQUFBLFVBQzVDLEtBQUssSUFBSSxHQUFHO0FBQUEsVUFDWjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsYUFBYSxzQkFBc0IsR0FBRyxHQUFHLEdBQUc7QUFBQSxVQUMvQyxLQUFLLElBQUksR0FBRztBQUFBLFVBQ1o7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLGFBQWEseUJBQXlCLEdBQUcsR0FBRyxHQUFHO0FBQUEsVUFDbEQsS0FBSyxJQUFJLEdBQUc7QUFBQSxVQUNaO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxhQUFhLDRCQUE0QixHQUFHLEdBQUcsR0FBRztBQUFBLFVBQ3JELEtBQUssSUFBSSxHQUFHO0FBQUEsVUFDWjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsYUFBYSxhQUFhLEdBQUcsR0FBRyxHQUFHO0FBQUEsVUFDdEMsS0FBSyxJQUFJLEdBQUc7QUFBQSxVQUNaO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxhQUFhLGdCQUFnQixHQUFHLEdBQUcsR0FBRztBQUFBLFVBQ3pDLEtBQUssSUFBSSxHQUFHO0FBQUEsVUFDWjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsYUFBYSxtQkFBbUIsR0FBRyxHQUFHLEdBQUc7QUFBQSxVQUM1QyxLQUFLLElBQUksR0FBRztBQUFBLFVBQ1o7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLGFBQWEsc0JBQXNCLEdBQUcsR0FBRyxHQUFHO0FBQUEsVUFDL0MsS0FBSyxJQUFJLEdBQUc7QUFBQSxVQUNaO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxhQUFhLHlCQUF5QixHQUFHLEdBQUcsR0FBRztBQUFBLFVBQ2xELEtBQUssSUFBSSxHQUFHO0FBQUEsVUFDWjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsYUFBYSw0QkFBNEIsR0FBRyxHQUFHLEdBQUc7QUFBQSxVQUNyRCxLQUFLLElBQUksR0FBRztBQUFBLFVBQ1o7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLE9BQU8sT0FBTyxHQUFHLEdBQUcsR0FBRztBQUFBLFVBQzFCLEtBQUssSUFBSSxHQUFHO0FBQUEsVUFDWjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsT0FBTyxTQUFTLEdBQUcsR0FBRyxHQUFHO0FBQUEsVUFDNUIsS0FBSyxJQUFJLEdBQUc7QUFBQSxVQUNaO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxPQUFPLFNBQVMsR0FBRyxHQUFHLEdBQUc7QUFBQSxVQUM1QixLQUFLLElBQUksR0FBRztBQUFBLFVBQ1o7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLE9BQU8sU0FBUyxHQUFHLEdBQUcsR0FBRztBQUFBLFVBQzVCLEtBQUssSUFBSSxHQUFHO0FBQUEsVUFDWjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsT0FBTyxTQUFTLEdBQUcsR0FBRyxHQUFHO0FBQUEsVUFDNUIsS0FBSyxJQUFJLEdBQUc7QUFBQSxVQUNaO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxPQUFPLFNBQVMsR0FBRyxHQUFHLEdBQUc7QUFBQSxVQUM1QixLQUFLLElBQUksR0FBRztBQUFBLFVBQ1o7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLE9BQU8sU0FBUyxHQUFHLEdBQUcsR0FBRztBQUFBLFVBQzVCLEtBQUssSUFBSSxHQUFHO0FBQUEsVUFDWjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsSUFBSSxPQUFPLEdBQUcsQ0FBQztBQUFBLFVBQ2xCLEdBQUcsT0FBTyxPQUFPLEdBQUcsR0FBRyxHQUFHO0FBQUEsVUFDMUIsS0FBSyxJQUFJLEdBQUc7QUFBQSxVQUNaO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxjQUFjLG1CQUFtQixHQUFHLEdBQUcsR0FBRztBQUFBLFVBQzdDLEtBQUssSUFBSSxHQUFHO0FBQUEsVUFDWjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsZUFBZSxvQkFBb0IsR0FBRyxHQUFHLEdBQUc7QUFBQSxVQUMvQyxLQUFLLElBQUksR0FBRztBQUFBLFVBQ1o7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLG1CQUFtQix3QkFBd0IsR0FBRyxHQUFHLEdBQUc7QUFBQSxVQUN2RCxLQUFLLElBQUksR0FBRztBQUFBLFVBQ1o7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksQ0FBQyxHQUFHLEdBQUc7QUFBQSxVQUNoQjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsSUFBSSxRQUFRLEdBQUcsS0FBSyxFQUFFO0FBQUEsVUFDekIsS0FBSyxJQUFJLEdBQUc7QUFBQSxVQUNaO0FBQUEsYUFDRztBQUFBLGFBQ0E7QUFBQSxVQUNILEtBQUssSUFBSSxHQUFHLElBQUksS0FBSztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsSUFBSSxLQUFLLENBQUM7QUFBQSxVQUNWLEdBQUcsR0FBRyxLQUFLLEdBQUcsS0FBSyxLQUFLLEdBQUcsSUFBSSxLQUFLO0FBQUEsVUFDcEMsS0FBSyxJQUFJO0FBQUEsVUFDVDtBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSTtBQUFBLFVBQ1Q7QUFBQTtBQUFBLE9BRUgsV0FBVztBQUFBLElBQ2QsT0FBTyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMs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QUMsSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLFdBQWEsTUFBTSxHQUFHLE9BQVMsRUFBRSxPQUFTLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLFdBQWEsTUFBTSxHQUFHLE9BQVMsRUFBRSxPQUFTLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLFdBQWEsTUFBTSxHQUFHLE9BQVMsRUFBRSxPQUFTLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLFdBQWEsTUFBTSxHQUFHLE9BQVMsRUFBRSxPQUFTLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLFdBQWEsTUFBTSxHQUFHLE9BQVMsRUFBRSxPQUFTLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLFdBQWEsTUFBTSxHQUFHLFFBQVUsRUFBRSxPQUFTLENBQUMsR0FBRyxXQUFhLE1BQU0sR0FBRyxLQUFPLEVBQUUsT0FBUyxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxXQUFhLE1BQU0sR0FBRyxRQUFVLEVBQUUsT0FBUyxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxXQUFhLE1BQU0sR0FBRyxRQUFVLEVBQUUsT0FBUyxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxXQUFhLE1BQU0sR0FBRyxNQUFRLEVBQUUsT0FBUyxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxXQUFhLE1BQU0sR0FBRyxPQUFTLEVBQUUsT0FBUyxDQUFDLEdBQUcsV0FBYSxNQUFNLEdBQUcsV0FBYSxFQUFFLE9BQVMsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcscUJBQXVCLEVBQUUsT0FBUyxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxXQUFhLE1BQU0sR0FBRyxrQkFBb0IsRUFBRSxPQUFTLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLFdBQWEsTUFBTSxHQUFHLGVBQWlCLEVBQUUsT0FBUyxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxXQUFhLE1B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RTtBQUFBLEVBQ25ELG1CQUFtQixVQUFVLElBQUksY0FBYyxtQkFBbUIsT0FBTztBQUFBLEVBQ3pFLGdCQUFnQixnQkFBZ0IsVUFBVSxFQUFFO0FBQUEsRUFDNUMsZ0JBQWdCLGVBQWUsVUFBVSxFQUFFO0FBQUEsRUFDM0MsZ0JBQWdCLHFCQUFxQixVQUFVLEVBQUU7QUFBQSxFQUNqRCxnQkFBZ0Isc0JBQXNCLFVBQVUsRUFBRTtBQUFBLEVBQ2xELFVBQVUsVUFBVSxRQUFRLEdBQUcsUUFBUSxHQUFHLFFBQVEsR0FBRyxZQUFZLFNBQVMsRUFBRTtBQUFBLEVBQzVFLGFBQWEsS0FBSyxRQUFRO0FBQUEsRUFDMUIsYUFBYSxLQUFLLFFBQVE7QUFBQSxFQUMxQixNQUFNLE1BQU0sYUFBYTtBQUFBLEVBQ3pCLElBQUksWUFBWSxJQUFJLFFBQVEsSUFBSTtBQUFBLEVBQ2hDLElBQUksU0FBUyxZQUFZLElBQUksS0FBSztBQUFBLEVBQ2xDLElBQUksV0FBVyxJQUFJLFFBQVEsSUFBSTtBQUFBLEVBQy9CLE1BQU0sUUFBUSxXQUFXLElBQUksS0FBSztBQUFBLEVBQ2xDLElBQUksUUFBUTtBQUFBLElBQ1YsU0FBUyxPQUFPLE1BQU0sRUFBRSxLQUFLLE1BQU0sRUFBRSxLQUFLLE1BQU0sSUFBSSxRQUFRLElBQUksVUFBVSxJQUFJLElBQUksS0FBSyxjQUFjLEVBQUUsS0FBSyxLQUFLLElBQUksU0FBUyxLQUFLLGNBQWM7QUFBQSxFQUNuSjtBQUFBLEVBQ0EsaUJBQWlCLFVBQVUsUUFBUSxPQUFPLEtBQUssV0FBVztBQUFBLEVBQzFELE1BQU0sb0JBQW9CLFNBQVMsS0FBSztBQUFBLEVBQ3hDLFNBQVMsS0FDUCxXQUNBLElBQUksU0FBUyxLQUFLLGlCQUFpQixRQUFRLEtBQUssaUJBQWlCLHFCQUFxQixNQUFNLFFBQVEsT0FBTyxTQUFTLGtCQUN0SDtBQUFBLEVBQ0EsSUFBSSxNQUFNLFdBQVcsR0FBRztBQUFBLEdBQ3ZCLE1BQU07QUFDVCxJQUFJLHFCQUFxQjtBQUFBLEVBQ3ZCLHlCQUF5QjtBQUFBLEVBQ3pCLGNBQWM7QUFBQSxFQUNkO0FBQUEsRUFDQTtBQUNGO0FBR0EsSUFBSSw0QkFBNEIsT0FBTyxDQUFDLFlBQVk7QUFBQSxjQUN0QyxRQUFRO0FBQUEsWUFDVixRQUFRO0FBQUE7QUFBQSxHQUVqQixXQUFXO0FBQ2QsSUFBSSxpQkFBaUI7QUFHckIsSUFBSSxVQUFVO0FBQUEsRUFDWixRQUFRO0FBQUEsRUFDUixJQUFJO0FBQUEsRUFDSixVQUFVO0FBQUEsRUFDVixRQUFRO0FBQUEsRUFDUixzQkFBc0IsT0FBTyxHQUFHLElBQUksV0FBVztBQUFBLElBQzdDLG1CQUFtQixRQUFRLEVBQUU7QUFBQSxJQUM3QixhQUFhLFFBQVEsSUFBSTtBQUFBLEtBQ3hCLE1BQU07QUFDWDsiLAogICJkZWJ1Z0lkIjogIkFFMTc5ODI3QzVENDBGM0Q2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
