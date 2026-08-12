import {
  getDiagramElement
} from "./chunk-main-h8a1r6rk.js";
import {
  setupViewPortForSVG
} from "./chunk-main-snyzap23.js";
import {
  getRegisteredLayoutAlgorithm,
  render
} from "./chunk-main-3qqx6zcj.js";
import"./chunk-main-wx3x4ygf.js";
import"./chunk-main-xxv6x4s9.js";
import"./chunk-main-2se6cwec.js";
import"./chunk-main-4ceh9h9g.js";
import"./chunk-main-h1tqf3mz.js";
import"./chunk-main-s8463nwg.js";
import"./chunk-main-wsp4jakw.js";
import {
  utils_default
} from "./chunk-main-vvfzntzy.js";
import"./chunk-main-ck580f0k.js";
import {
  clear,
  getAccDescription,
  getAccTitle,
  getConfig,
  getConfig2,
  getDiagramTitle,
  setAccDescription,
  setAccTitle,
  setDiagramTitle
} from "./chunk-main-aws590jt.js";
import {
  __export,
  __name,
  log
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/requirementDiagram-4Y6WPE33.mjs
var parser = function() {
  var o = /* @__PURE__ */ __name(function(k, v, o2, l) {
    for (o2 = o2 || {}, l = k.length;l--; o2[k[l]] = v)
      ;
    return o2;
  }, "o"), $V0 = [1, 3], $V1 = [1, 4], $V2 = [1, 5], $V3 = [1, 6], $V4 = [5, 6, 8, 9, 11, 13, 21, 22, 23, 24, 41, 42, 43, 44, 45, 46, 54, 72, 74, 77, 89, 90], $V5 = [1, 22], $V6 = [2, 7], $V7 = [1, 26], $V8 = [1, 27], $V9 = [1, 28], $Va = [1, 29], $Vb = [1, 33], $Vc = [1, 34], $Vd = [1, 35], $Ve = [1, 36], $Vf = [1, 37], $Vg = [1, 38], $Vh = [1, 24], $Vi = [1, 31], $Vj = [1, 32], $Vk = [1, 30], $Vl = [1, 39], $Vm = [1, 40], $Vn = [5, 8, 9, 11, 13, 21, 22, 23, 24, 41, 42, 43, 44, 45, 46, 54, 72, 74, 77, 89, 90], $Vo = [1, 61], $Vp = [89, 90], $Vq = [5, 8, 9, 11, 13, 21, 22, 23, 24, 27, 29, 41, 42, 43, 44, 45, 46, 54, 61, 63, 72, 74, 75, 76, 77, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90], $Vr = [27, 29], $Vs = [1, 70], $Vt = [1, 71], $Vu = [1, 72], $Vv = [1, 73], $Vw = [1, 74], $Vx = [1, 75], $Vy = [1, 76], $Vz = [1, 83], $VA = [1, 80], $VB = [1, 84], $VC = [1, 85], $VD = [1, 86], $VE = [1, 87], $VF = [1, 88], $VG = [1, 89], $VH = [1, 90], $VI = [1, 91], $VJ = [1, 92], $VK = [5, 8, 9, 11, 13, 21, 22, 23, 24, 27, 41, 42, 43, 44, 45, 46, 54, 72, 74, 75, 76, 77, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90], $VL = [63, 64], $VM = [1, 101], $VN = [5, 8, 9, 11, 13, 21, 22, 23, 24, 41, 42, 43, 44, 45, 46, 54, 72, 74, 76, 77, 89, 90], $VO = [5, 8, 9, 11, 13, 21, 22, 23, 24, 41, 42, 43, 44, 45, 46, 54, 72, 74, 75, 76, 77, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90], $VP = [1, 110], $VQ = [1, 106], $VR = [1, 107], $VS = [1, 108], $VT = [1, 109], $VU = [1, 111], $VV = [1, 116], $VW = [1, 117], $VX = [1, 114], $VY = [1, 115];
  var parser2 = {
    trace: /* @__PURE__ */ __name(function trace() {}, "trace"),
    yy: {},
    symbols_: { error: 2, start: 3, directive: 4, NEWLINE: 5, RD: 6, diagram: 7, EOF: 8, acc_title: 9, acc_title_value: 10, acc_descr: 11, acc_descr_value: 12, acc_descr_multiline_value: 13, requirementDef: 14, elementDef: 15, relationshipDef: 16, direction: 17, styleStatement: 18, classDefStatement: 19, classStatement: 20, direction_tb: 21, direction_bt: 22, direction_rl: 23, direction_lr: 24, requirementType: 25, requirementName: 26, STRUCT_START: 27, requirementBody: 28, STYLE_SEPARATOR: 29, idList: 30, ID: 31, COLONSEP: 32, id: 33, TEXT: 34, text: 35, RISK: 36, riskLevel: 37, VERIFYMTHD: 38, verifyType: 39, STRUCT_STOP: 40, REQUIREMENT: 41, FUNCTIONAL_REQUIREMENT: 42, INTERFACE_REQUIREMENT: 43, PERFORMANCE_REQUIREMENT: 44, PHYSICAL_REQUIREMENT: 45, DESIGN_CONSTRAINT: 46, LOW_RISK: 47, MED_RISK: 48, HIGH_RISK: 49, VERIFY_ANALYSIS: 50, VERIFY_DEMONSTRATION: 51, VERIFY_INSPECTION: 52, VERIFY_TEST: 53, ELEMENT: 54, elementName: 55, elementBody: 56, TYPE: 57, type: 58, DOCREF: 59, ref: 60, END_ARROW_L: 61, relationship: 62, LINE: 63, END_ARROW_R: 64, CONTAINS: 65, COPIES: 66, DERIVES: 67, SATISFIES: 68, VERIFIES: 69, REFINES: 70, TRACES: 71, CLASSDEF: 72, stylesOpt: 73, CLASS: 74, ALPHA: 75, COMMA: 76, STYLE: 77, style: 78, styleComponent: 79, NUM: 80, COLON: 81, UNIT: 82, SPACE: 83, BRKT: 84, PCT: 85, MINUS: 86, LABEL: 87, SEMICOLON: 88, unqString: 89, qString: 90, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 5: "NEWLINE", 6: "RD", 8: "EOF", 9: "acc_title", 10: "acc_title_value", 11: "acc_descr", 12: "acc_descr_value", 13: "acc_descr_multiline_value", 21: "direction_tb", 22: "direction_bt", 23: "direction_rl", 24: "direction_lr", 27: "STRUCT_START", 29: "STYLE_SEPARATOR", 31: "ID", 32: "COLONSEP", 34: "TEXT", 36: "RISK", 38: "VERIFYMTHD", 40: "STRUCT_STOP", 41: "REQUIREMENT", 42: "FUNCTIONAL_REQUIREMENT", 43: "INTERFACE_REQUIREMENT", 44: "PERFORMANCE_REQUIREMENT", 45: "PHYSICAL_REQUIREMENT", 46: "DESIGN_CONSTRAINT", 47: "LOW_RISK", 48: "MED_RISK", 49: "HIGH_RISK", 50: "VERIFY_ANALYSIS", 51: "VERIFY_DEMONSTRATION", 52: "VERIFY_INSPECTION", 53: "VERIFY_TEST", 54: "ELEMENT", 57: "TYPE", 59: "DOCREF", 61: "END_ARROW_L", 63: "LINE", 64: "END_ARROW_R", 65: "CONTAINS", 66: "COPIES", 67: "DERIVES", 68: "SATISFIES", 69: "VERIFIES", 70: "REFINES", 71: "TRACES", 72: "CLASSDEF", 74: "CLASS", 75: "ALPHA", 76: "COMMA", 77: "STYLE", 80: "NUM", 81: "COLON", 82: "UNIT", 83: "SPACE", 84: "BRKT", 85: "PCT", 86: "MINUS", 87: "LABEL", 88: "SEMICOLON", 89: "unqString", 90: "qString" },
    productions_: [0, [3, 3], [3, 2], [3, 4], [4, 2], [4, 2], [4, 1], [7, 0], [7, 2], [7, 2], [7, 2], [7, 2], [7, 2], [7, 2], [7, 2], [7, 2], [7, 2], [17, 1], [17, 1], [17, 1], [17, 1], [14, 5], [14, 7], [28, 5], [28, 5], [28, 5], [28, 5], [28, 2], [28, 1], [25, 1], [25, 1], [25, 1], [25, 1], [25, 1], [25, 1], [37, 1], [37, 1], [37, 1], [39, 1], [39, 1], [39, 1], [39, 1], [15, 5], [15, 7], [56, 5], [56, 5], [56, 2], [56, 1], [16, 5], [16, 5], [62, 1], [62, 1], [62, 1], [62, 1], [62, 1], [62, 1], [62, 1], [19, 3], [20, 3], [20, 3], [30, 1], [30, 3], [30, 1], [30, 3], [18, 3], [73, 1], [73, 3], [78, 1], [78, 2], [79, 1], [79, 1], [79, 1], [79, 1], [79, 1], [79, 1], [79, 1], [79, 1], [79, 1], [79, 1], [26, 1], [26, 1], [33, 1], [33, 1], [35, 1], [35, 1], [55, 1], [55, 1], [58, 1], [58, 1], [60, 1], [60, 1]],
    performAction: /* @__PURE__ */ __name(function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
      var $0 = $$.length - 1;
      switch (yystate) {
        case 4:
          this.$ = $$[$0].trim();
          yy.setAccTitle(this.$);
          break;
        case 5:
        case 6:
          this.$ = $$[$0].trim();
          yy.setAccDescription(this.$);
          break;
        case 7:
          this.$ = [];
          break;
        case 17:
          yy.setDirection("TB");
          break;
        case 18:
          yy.setDirection("BT");
          break;
        case 19:
          yy.setDirection("RL");
          break;
        case 20:
          yy.setDirection("LR");
          break;
        case 21:
          yy.addRequirement($$[$0 - 3], $$[$0 - 4]);
          break;
        case 22:
          yy.addRequirement($$[$0 - 5], $$[$0 - 6]);
          yy.setClass([$$[$0 - 5]], $$[$0 - 3]);
          break;
        case 23:
          yy.setNewReqId($$[$0 - 2]);
          break;
        case 24:
          yy.setNewReqText($$[$0 - 2]);
          break;
        case 25:
          yy.setNewReqRisk($$[$0 - 2]);
          break;
        case 26:
          yy.setNewReqVerifyMethod($$[$0 - 2]);
          break;
        case 29:
          this.$ = yy.RequirementType.REQUIREMENT;
          break;
        case 30:
          this.$ = yy.RequirementType.FUNCTIONAL_REQUIREMENT;
          break;
        case 31:
          this.$ = yy.RequirementType.INTERFACE_REQUIREMENT;
          break;
        case 32:
          this.$ = yy.RequirementType.PERFORMANCE_REQUIREMENT;
          break;
        case 33:
          this.$ = yy.RequirementType.PHYSICAL_REQUIREMENT;
          break;
        case 34:
          this.$ = yy.RequirementType.DESIGN_CONSTRAINT;
          break;
        case 35:
          this.$ = yy.RiskLevel.LOW_RISK;
          break;
        case 36:
          this.$ = yy.RiskLevel.MED_RISK;
          break;
        case 37:
          this.$ = yy.RiskLevel.HIGH_RISK;
          break;
        case 38:
          this.$ = yy.VerifyType.VERIFY_ANALYSIS;
          break;
        case 39:
          this.$ = yy.VerifyType.VERIFY_DEMONSTRATION;
          break;
        case 40:
          this.$ = yy.VerifyType.VERIFY_INSPECTION;
          break;
        case 41:
          this.$ = yy.VerifyType.VERIFY_TEST;
          break;
        case 42:
          yy.addElement($$[$0 - 3]);
          break;
        case 43:
          yy.addElement($$[$0 - 5]);
          yy.setClass([$$[$0 - 5]], $$[$0 - 3]);
          break;
        case 44:
          yy.setNewElementType($$[$0 - 2]);
          break;
        case 45:
          yy.setNewElementDocRef($$[$0 - 2]);
          break;
        case 48:
          yy.addRelationship($$[$0 - 2], $$[$0], $$[$0 - 4]);
          break;
        case 49:
          yy.addRelationship($$[$0 - 2], $$[$0 - 4], $$[$0]);
          break;
        case 50:
          this.$ = yy.Relationships.CONTAINS;
          break;
        case 51:
          this.$ = yy.Relationships.COPIES;
          break;
        case 52:
          this.$ = yy.Relationships.DERIVES;
          break;
        case 53:
          this.$ = yy.Relationships.SATISFIES;
          break;
        case 54:
          this.$ = yy.Relationships.VERIFIES;
          break;
        case 55:
          this.$ = yy.Relationships.REFINES;
          break;
        case 56:
          this.$ = yy.Relationships.TRACES;
          break;
        case 57:
          this.$ = $$[$0 - 2];
          yy.defineClass($$[$0 - 1], $$[$0]);
          break;
        case 58:
          yy.setClass($$[$0 - 1], $$[$0]);
          break;
        case 59:
          yy.setClass([$$[$0 - 2]], $$[$0]);
          break;
        case 60:
        case 62:
          this.$ = [$$[$0]];
          break;
        case 61:
        case 63:
          this.$ = $$[$0 - 2].concat([$$[$0]]);
          break;
        case 64:
          this.$ = $$[$0 - 2];
          yy.setCssStyle($$[$0 - 1], $$[$0]);
          break;
        case 65:
          this.$ = [$$[$0]];
          break;
        case 66:
          $$[$0 - 2].push($$[$0]);
          this.$ = $$[$0 - 2];
          break;
        case 68:
          this.$ = $$[$0 - 1] + $$[$0];
          break;
      }
    }, "anonymous"),
    table: [{ 3: 1, 4: 2, 6: $V0, 9: $V1, 11: $V2, 13: $V3 }, { 1: [3] }, { 3: 8, 4: 2, 5: [1, 7], 6: $V0, 9: $V1, 11: $V2, 13: $V3 }, { 5: [1, 9] }, { 10: [1, 10] }, { 12: [1, 11] }, o($V4, [2, 6]), { 3: 12, 4: 2, 6: $V0, 9: $V1, 11: $V2, 13: $V3 }, { 1: [2, 2] }, { 4: 17, 5: $V5, 7: 13, 8: $V6, 9: $V1, 11: $V2, 13: $V3, 14: 14, 15: 15, 16: 16, 17: 18, 18: 19, 19: 20, 20: 21, 21: $V7, 22: $V8, 23: $V9, 24: $Va, 25: 23, 33: 25, 41: $Vb, 42: $Vc, 43: $Vd, 44: $Ve, 45: $Vf, 46: $Vg, 54: $Vh, 72: $Vi, 74: $Vj, 77: $Vk, 89: $Vl, 90: $Vm }, o($V4, [2, 4]), o($V4, [2, 5]), { 1: [2, 1] }, { 8: [1, 41] }, { 4: 17, 5: $V5, 7: 42, 8: $V6, 9: $V1, 11: $V2, 13: $V3, 14: 14, 15: 15, 16: 16, 17: 18, 18: 19, 19: 20, 20: 21, 21: $V7, 22: $V8, 23: $V9, 24: $Va, 25: 23, 33: 25, 41: $Vb, 42: $Vc, 43: $Vd, 44: $Ve, 45: $Vf, 46: $Vg, 54: $Vh, 72: $Vi, 74: $Vj, 77: $Vk, 89: $Vl, 90: $Vm }, { 4: 17, 5: $V5, 7: 43, 8: $V6, 9: $V1, 11: $V2, 13: $V3, 14: 14, 15: 15, 16: 16, 17: 18, 18: 19, 19: 20, 20: 21, 21: $V7, 22: $V8, 23: $V9, 24: $Va, 25: 23, 33: 25, 41: $Vb, 42: $Vc, 43: $Vd, 44: $Ve, 45: $Vf, 46: $Vg, 54: $Vh, 72: $Vi, 74: $Vj, 77: $Vk, 89: $Vl, 90: $Vm }, { 4: 17, 5: $V5, 7: 44, 8: $V6, 9: $V1, 11: $V2, 13: $V3, 14: 14, 15: 15, 16: 16, 17: 18, 18: 19, 19: 20, 20: 21, 21: $V7, 22: $V8, 23: $V9, 24: $Va, 25: 23, 33: 25, 41: $Vb, 42: $Vc, 43: $Vd, 44: $Ve, 45: $Vf, 46: $Vg, 54: $Vh, 72: $Vi, 74: $Vj, 77: $Vk, 89: $Vl, 90: $Vm }, { 4: 17, 5: $V5, 7: 45, 8: $V6, 9: $V1, 11: $V2, 13: $V3, 14: 14, 15: 15, 16: 16, 17: 18, 18: 19, 19: 20, 20: 21, 21: $V7, 22: $V8, 23: $V9, 24: $Va, 25: 23, 33: 25, 41: $Vb, 42: $Vc, 43: $Vd, 44: $Ve, 45: $Vf, 46: $Vg, 54: $Vh, 72: $Vi, 74: $Vj, 77: $Vk, 89: $Vl, 90: $Vm }, { 4: 17, 5: $V5, 7: 46, 8: $V6, 9: $V1, 11: $V2, 13: $V3, 14: 14, 15: 15, 16: 16, 17: 18, 18: 19, 19: 20, 20: 21, 21: $V7, 22: $V8, 23: $V9, 24: $Va, 25: 23, 33: 25, 41: $Vb, 42: $Vc, 43: $Vd, 44: $Ve, 45: $Vf, 46: $Vg, 54: $Vh, 72: $Vi, 74: $Vj, 77: $Vk, 89: $Vl, 90: $Vm }, { 4: 17, 5: $V5, 7: 47, 8: $V6, 9: $V1, 11: $V2, 13: $V3, 14: 14, 15: 15, 16: 16, 17: 18, 18: 19, 19: 20, 20: 21, 21: $V7, 22: $V8, 23: $V9, 24: $Va, 25: 23, 33: 25, 41: $Vb, 42: $Vc, 43: $Vd, 44: $Ve, 45: $Vf, 46: $Vg, 54: $Vh, 72: $Vi, 74: $Vj, 77: $Vk, 89: $Vl, 90: $Vm }, { 4: 17, 5: $V5, 7: 48, 8: $V6, 9: $V1, 11: $V2, 13: $V3, 14: 14, 15: 15, 16: 16, 17: 18, 18: 19, 19: 20, 20: 21, 21: $V7, 22: $V8, 23: $V9, 24: $Va, 25: 23, 33: 25, 41: $Vb, 42: $Vc, 43: $Vd, 44: $Ve, 45: $Vf, 46: $Vg, 54: $Vh, 72: $Vi, 74: $Vj, 77: $Vk, 89: $Vl, 90: $Vm }, { 4: 17, 5: $V5, 7: 49, 8: $V6, 9: $V1, 11: $V2, 13: $V3, 14: 14, 15: 15, 16: 16, 17: 18, 18: 19, 19: 20, 20: 21, 21: $V7, 22: $V8, 23: $V9, 24: $Va, 25: 23, 33: 25, 41: $Vb, 42: $Vc, 43: $Vd, 44: $Ve, 45: $Vf, 46: $Vg, 54: $Vh, 72: $Vi, 74: $Vj, 77: $Vk, 89: $Vl, 90: $Vm }, { 4: 17, 5: $V5, 7: 50, 8: $V6, 9: $V1, 11: $V2, 13: $V3, 14: 14, 15: 15, 16: 16, 17: 18, 18: 19, 19: 20, 20: 21, 21: $V7, 22: $V8, 23: $V9, 24: $Va, 25: 23, 33: 25, 41: $Vb, 42: $Vc, 43: $Vd, 44: $Ve, 45: $Vf, 46: $Vg, 54: $Vh, 72: $Vi, 74: $Vj, 77: $Vk, 89: $Vl, 90: $Vm }, { 26: 51, 89: [1, 52], 90: [1, 53] }, { 55: 54, 89: [1, 55], 90: [1, 56] }, { 29: [1, 59], 61: [1, 57], 63: [1, 58] }, o($Vn, [2, 17]), o($Vn, [2, 18]), o($Vn, [2, 19]), o($Vn, [2, 20]), { 30: 60, 33: 62, 75: $Vo, 89: $Vl, 90: $Vm }, { 30: 63, 33: 62, 75: $Vo, 89: $Vl, 90: $Vm }, { 30: 64, 33: 62, 75: $Vo, 89: $Vl, 90: $Vm }, o($Vp, [2, 29]), o($Vp, [2, 30]), o($Vp, [2, 31]), o($Vp, [2, 32]), o($Vp, [2, 33]), o($Vp, [2, 34]), o($Vq, [2, 81]), o($Vq, [2, 82]), { 1: [2, 3] }, { 8: [2, 8] }, { 8: [2, 9] }, { 8: [2, 10] }, { 8: [2, 11] }, { 8: [2, 12] }, { 8: [2, 13] }, { 8: [2, 14] }, { 8: [2, 15] }, { 8: [2, 16] }, { 27: [1, 65], 29: [1, 66] }, o($Vr, [2, 79]), o($Vr, [2, 80]), { 27: [1, 67], 29: [1, 68] }, o($Vr, [2, 85]), o($Vr, [2, 86]), { 62: 69, 65: $Vs, 66: $Vt, 67: $Vu, 68: $Vv, 69: $Vw, 70: $Vx, 71: $Vy }, { 62: 77, 65: $Vs, 66: $Vt, 67: $Vu, 68: $Vv, 69: $Vw, 70: $Vx, 71: $Vy }, { 30: 78, 33: 62, 75: $Vo, 89: $Vl, 90: $Vm }, { 73: 79, 75: $Vz, 76: $VA, 78: 81, 79: 82, 80: $VB, 81: $VC, 82: $VD, 83: $VE, 84: $VF, 85: $VG, 86: $VH, 87: $VI, 88: $VJ }, o($VK, [2, 60]), o($VK, [2, 62]), { 73: 93, 75: $Vz, 76: $VA, 78: 81, 79: 82, 80: $VB, 81: $VC, 82: $VD, 83: $VE, 84: $VF, 85: $VG, 86: $VH, 87: $VI, 88: $VJ }, { 30: 94, 33: 62, 75: $Vo, 76: $VA, 89: $Vl, 90: $Vm }, { 5: [1, 95] }, { 30: 96, 33: 62, 75: $Vo, 89: $Vl, 90: $Vm }, { 5: [1, 97] }, { 30: 98, 33: 62, 75: $Vo, 89: $Vl, 90: $Vm }, { 63: [1, 99] }, o($VL, [2, 50]), o($VL, [2, 51]), o($VL, [2, 52]), o($VL, [2, 53]), o($VL, [2, 54]), o($VL, [2, 55]), o($VL, [2, 56]), { 64: [1, 100] }, o($Vn, [2, 59], { 76: $VA }), o($Vn, [2, 64], { 76: $VM }), { 33: 103, 75: [1, 102], 89: $Vl, 90: $Vm }, o($VN, [2, 65], { 79: 104, 75: $Vz, 80: $VB, 81: $VC, 82: $VD, 83: $VE, 84: $VF, 85: $VG, 86: $VH, 87: $VI, 88: $VJ }), o($VO, [2, 67]), o($VO, [2, 69]), o($VO, [2, 70]), o($VO, [2, 71]), o($VO, [2, 72]), o($VO, [2, 73]), o($VO, [2, 74]), o($VO, [2, 75]), o($VO, [2, 76]), o($VO, [2, 77]), o($VO, [2, 78]), o($Vn, [2, 57], { 76: $VM }), o($Vn, [2, 58], { 76: $VA }), { 5: $VP, 28: 105, 31: $VQ, 34: $VR, 36: $VS, 38: $VT, 40: $VU }, { 27: [1, 112], 76: $VA }, { 5: $VV, 40: $VW, 56: 113, 57: $VX, 59: $VY }, { 27: [1, 118], 76: $VA }, { 33: 119, 89: $Vl, 90: $Vm }, { 33: 120, 89: $Vl, 90: $Vm }, { 75: $Vz, 78: 121, 79: 82, 80: $VB, 81: $VC, 82: $VD, 83: $VE, 84: $VF, 85: $VG, 86: $VH, 87: $VI, 88: $VJ }, o($VK, [2, 61]), o($VK, [2, 63]), o($VO, [2, 68]), o($Vn, [2, 21]), { 32: [1, 122] }, { 32: [1, 123] }, { 32: [1, 124] }, { 32: [1, 125] }, { 5: $VP, 28: 126, 31: $VQ, 34: $VR, 36: $VS, 38: $VT, 40: $VU }, o($Vn, [2, 28]), { 5: [1, 127] }, o($Vn, [2, 42]), { 32: [1, 128] }, { 32: [1, 129] }, { 5: $VV, 40: $VW, 56: 130, 57: $VX, 59: $VY }, o($Vn, [2, 47]), { 5: [1, 131] }, o($Vn, [2, 48]), o($Vn, [2, 49]), o($VN, [2, 66], { 79: 104, 75: $Vz, 80: $VB, 81: $VC, 82: $VD, 83: $VE, 84: $VF, 85: $VG, 86: $VH, 87: $VI, 88: $VJ }), { 33: 132, 89: $Vl, 90: $Vm }, { 35: 133, 89: [1, 134], 90: [1, 135] }, { 37: 136, 47: [1, 137], 48: [1, 138], 49: [1, 139] }, { 39: 140, 50: [1, 141], 51: [1, 142], 52: [1, 143], 53: [1, 144] }, o($Vn, [2, 27]), { 5: $VP, 28: 145, 31: $VQ, 34: $VR, 36: $VS, 38: $VT, 40: $VU }, { 58: 146, 89: [1, 147], 90: [1, 148] }, { 60: 149, 89: [1, 150], 90: [1, 151] }, o($Vn, [2, 46]), { 5: $VV, 40: $VW, 56: 152, 57: $VX, 59: $VY }, { 5: [1, 153] }, { 5: [1, 154] }, { 5: [2, 83] }, { 5: [2, 84] }, { 5: [1, 155] }, { 5: [2, 35] }, { 5: [2, 36] }, { 5: [2, 37] }, { 5: [1, 156] }, { 5: [2, 38] }, { 5: [2, 39] }, { 5: [2, 40] }, { 5: [2, 41] }, o($Vn, [2, 22]), { 5: [1, 157] }, { 5: [2, 87] }, { 5: [2, 88] }, { 5: [1, 158] }, { 5: [2, 89] }, { 5: [2, 90] }, o($Vn, [2, 43]), { 5: $VP, 28: 159, 31: $VQ, 34: $VR, 36: $VS, 38: $VT, 40: $VU }, { 5: $VP, 28: 160, 31: $VQ, 34: $VR, 36: $VS, 38: $VT, 40: $VU }, { 5: $VP, 28: 161, 31: $VQ, 34: $VR, 36: $VS, 38: $VT, 40: $VU }, { 5: $VP, 28: 162, 31: $VQ, 34: $VR, 36: $VS, 38: $VT, 40: $VU }, { 5: $VV, 40: $VW, 56: 163, 57: $VX, 59: $VY }, { 5: $VV, 40: $VW, 56: 164, 57: $VX, 59: $VY }, o($Vn, [2, 23]), o($Vn, [2, 24]), o($Vn, [2, 25]), o($Vn, [2, 26]), o($Vn, [2, 44]), o($Vn, [2, 45])],
    defaultActions: { 8: [2, 2], 12: [2, 1], 41: [2, 3], 42: [2, 8], 43: [2, 9], 44: [2, 10], 45: [2, 11], 46: [2, 12], 47: [2, 13], 48: [2, 14], 49: [2, 15], 50: [2, 16], 134: [2, 83], 135: [2, 84], 137: [2, 35], 138: [2, 36], 139: [2, 37], 141: [2, 38], 142: [2, 39], 143: [2, 40], 144: [2, 41], 147: [2, 87], 148: [2, 88], 150: [2, 89], 151: [2, 90] },
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
      options: { "case-insensitive": true },
      performAction: /* @__PURE__ */ __name(function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {
        var YYSTATE = YY_START;
        switch ($avoiding_name_collisions) {
          case 0:
            return "title";
            break;
          case 1:
            this.begin("acc_title");
            return 9;
            break;
          case 2:
            this.popState();
            return "acc_title_value";
            break;
          case 3:
            this.begin("acc_descr");
            return 11;
            break;
          case 4:
            this.popState();
            return "acc_descr_value";
            break;
          case 5:
            this.begin("acc_descr_multiline");
            break;
          case 6:
            this.popState();
            break;
          case 7:
            return "acc_descr_multiline_value";
            break;
          case 8:
            return 21;
            break;
          case 9:
            return 22;
            break;
          case 10:
            return 23;
            break;
          case 11:
            return 24;
            break;
          case 12:
            return 5;
            break;
          case 13:
            break;
          case 14:
            break;
          case 15:
            break;
          case 16:
            return 8;
            break;
          case 17:
            return 6;
            break;
          case 18:
            return 27;
            break;
          case 19:
            return 40;
            break;
          case 20:
            return 29;
            break;
          case 21:
            return 32;
            break;
          case 22:
            return 31;
            break;
          case 23:
            return 34;
            break;
          case 24:
            return 36;
            break;
          case 25:
            return 38;
            break;
          case 26:
            return 41;
            break;
          case 27:
            return 42;
            break;
          case 28:
            return 43;
            break;
          case 29:
            return 44;
            break;
          case 30:
            return 45;
            break;
          case 31:
            return 46;
            break;
          case 32:
            return 47;
            break;
          case 33:
            return 48;
            break;
          case 34:
            return 49;
            break;
          case 35:
            return 50;
            break;
          case 36:
            return 51;
            break;
          case 37:
            return 52;
            break;
          case 38:
            return 53;
            break;
          case 39:
            return 54;
            break;
          case 40:
            return 65;
            break;
          case 41:
            return 66;
            break;
          case 42:
            return 67;
            break;
          case 43:
            return 68;
            break;
          case 44:
            return 69;
            break;
          case 45:
            return 70;
            break;
          case 46:
            return 71;
            break;
          case 47:
            return 57;
            break;
          case 48:
            return 59;
            break;
          case 49:
            this.begin("style");
            return 77;
            break;
          case 50:
            return 75;
            break;
          case 51:
            return 81;
            break;
          case 52:
            return 88;
            break;
          case 53:
            return "PERCENT";
            break;
          case 54:
            return 86;
            break;
          case 55:
            return 84;
            break;
          case 56:
            break;
          case 57:
            this.begin("string");
            break;
          case 58:
            this.popState();
            break;
          case 59:
            this.begin("style");
            return 72;
            break;
          case 60:
            this.begin("style");
            return 74;
            break;
          case 61:
            return 61;
            break;
          case 62:
            return 64;
            break;
          case 63:
            return 63;
            break;
          case 64:
            this.begin("string");
            break;
          case 65:
            this.popState();
            break;
          case 66:
            return "qString";
            break;
          case 67:
            yy_.yytext = yy_.yytext.trim();
            return 89;
            break;
          case 68:
            return 75;
            break;
          case 69:
            return 80;
            break;
          case 70:
            return 76;
            break;
        }
      }, "anonymous"),
      rules: [/^(?:title\s[^#\n;]+)/i, /^(?:accTitle\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*\{\s*)/i, /^(?:[\}])/i, /^(?:[^\}]*)/i, /^(?:.*direction\s+TB[^\n]*)/i, /^(?:.*direction\s+BT[^\n]*)/i, /^(?:.*direction\s+RL[^\n]*)/i, /^(?:.*direction\s+LR[^\n]*)/i, /^(?:(\r?\n)+)/i, /^(?:\s+)/i, /^(?:#[^\n]*)/i, /^(?:%[^\n]*)/i, /^(?:$)/i, /^(?:requirementDiagram\b)/i, /^(?:\{)/i, /^(?:\})/i, /^(?::{3})/i, /^(?::)/i, /^(?:id\b)/i, /^(?:text\b)/i, /^(?:risk\b)/i, /^(?:verifyMethod\b)/i, /^(?:requirement\b)/i, /^(?:functionalRequirement\b)/i, /^(?:interfaceRequirement\b)/i, /^(?:performanceRequirement\b)/i, /^(?:physicalRequirement\b)/i, /^(?:designConstraint\b)/i, /^(?:low\b)/i, /^(?:medium\b)/i, /^(?:high\b)/i, /^(?:analysis\b)/i, /^(?:demonstration\b)/i, /^(?:inspection\b)/i, /^(?:test\b)/i, /^(?:element\b)/i, /^(?:contains\b)/i, /^(?:copies\b)/i, /^(?:derives\b)/i, /^(?:satisfies\b)/i, /^(?:verifies\b)/i, /^(?:refines\b)/i, /^(?:traces\b)/i, /^(?:type\b)/i, /^(?:docref\b)/i, /^(?:style\b)/i, /^(?:\w+)/i, /^(?::)/i, /^(?:;)/i, /^(?:%)/i, /^(?:-)/i, /^(?:#)/i, /^(?: )/i, /^(?:["])/i, /^(?:\n)/i, /^(?:classDef\b)/i, /^(?:class\b)/i, /^(?:<-)/i, /^(?:->)/i, /^(?:-)/i, /^(?:["])/i, /^(?:["])/i, /^(?:[^"]*)/i, /^(?:[\w][^:,\r\n\{\<\>\-\=]*)/i, /^(?:\w+)/i, /^(?:[0-9]+)/i, /^(?:,)/i],
      conditions: { acc_descr_multiline: { rules: [6, 7, 68, 69, 70], inclusive: false }, acc_descr: { rules: [4, 68, 69, 70], inclusive: false }, acc_title: { rules: [2, 68, 69, 70], inclusive: false }, style: { rules: [50, 51, 52, 53, 54, 55, 56, 57, 58, 68, 69, 70], inclusive: false }, unqString: { rules: [68, 69, 70], inclusive: false }, token: { rules: [68, 69, 70], inclusive: false }, string: { rules: [65, 66, 68, 69, 70], inclusive: false }, INITIAL: { rules: [0, 1, 3, 5, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 59, 60, 61, 62, 63, 64, 67, 68, 69, 70], inclusive: true } }
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
var requirementDiagram_default = parser;
var RequirementDB = class {
  constructor() {
    this.relations = [];
    this.latestRequirement = this.getInitialRequirement();
    this.requirements = /* @__PURE__ */ new Map;
    this.latestElement = this.getInitialElement();
    this.elements = /* @__PURE__ */ new Map;
    this.classes = /* @__PURE__ */ new Map;
    this.direction = "TB";
    this.RequirementType = {
      REQUIREMENT: "Requirement",
      FUNCTIONAL_REQUIREMENT: "Functional Requirement",
      INTERFACE_REQUIREMENT: "Interface Requirement",
      PERFORMANCE_REQUIREMENT: "Performance Requirement",
      PHYSICAL_REQUIREMENT: "Physical Requirement",
      DESIGN_CONSTRAINT: "Design Constraint"
    };
    this.RiskLevel = {
      LOW_RISK: "Low",
      MED_RISK: "Medium",
      HIGH_RISK: "High"
    };
    this.VerifyType = {
      VERIFY_ANALYSIS: "Analysis",
      VERIFY_DEMONSTRATION: "Demonstration",
      VERIFY_INSPECTION: "Inspection",
      VERIFY_TEST: "Test"
    };
    this.Relationships = {
      CONTAINS: "contains",
      COPIES: "copies",
      DERIVES: "derives",
      SATISFIES: "satisfies",
      VERIFIES: "verifies",
      REFINES: "refines",
      TRACES: "traces"
    };
    this.setAccTitle = setAccTitle;
    this.getAccTitle = getAccTitle;
    this.setAccDescription = setAccDescription;
    this.getAccDescription = getAccDescription;
    this.setDiagramTitle = setDiagramTitle;
    this.getDiagramTitle = getDiagramTitle;
    this.getConfig = /* @__PURE__ */ __name(() => getConfig2().requirement, "getConfig");
    this.clear();
    this.setDirection = this.setDirection.bind(this);
    this.addRequirement = this.addRequirement.bind(this);
    this.setNewReqId = this.setNewReqId.bind(this);
    this.setNewReqRisk = this.setNewReqRisk.bind(this);
    this.setNewReqText = this.setNewReqText.bind(this);
    this.setNewReqVerifyMethod = this.setNewReqVerifyMethod.bind(this);
    this.addElement = this.addElement.bind(this);
    this.setNewElementType = this.setNewElementType.bind(this);
    this.setNewElementDocRef = this.setNewElementDocRef.bind(this);
    this.addRelationship = this.addRelationship.bind(this);
    this.setCssStyle = this.setCssStyle.bind(this);
    this.setClass = this.setClass.bind(this);
    this.defineClass = this.defineClass.bind(this);
    this.setAccTitle = this.setAccTitle.bind(this);
    this.setAccDescription = this.setAccDescription.bind(this);
  }
  static {
    __name(this, "RequirementDB");
  }
  getDirection() {
    return this.direction;
  }
  setDirection(dir) {
    this.direction = dir;
  }
  resetLatestRequirement() {
    this.latestRequirement = this.getInitialRequirement();
  }
  resetLatestElement() {
    this.latestElement = this.getInitialElement();
  }
  getInitialRequirement() {
    return {
      requirementId: "",
      text: "",
      risk: "",
      verifyMethod: "",
      name: "",
      type: "",
      cssStyles: [],
      classes: ["default"]
    };
  }
  getInitialElement() {
    return {
      name: "",
      type: "",
      docRef: "",
      cssStyles: [],
      classes: ["default"]
    };
  }
  addRequirement(name, type) {
    if (!this.requirements.has(name)) {
      this.requirements.set(name, {
        name,
        type,
        requirementId: this.latestRequirement.requirementId,
        text: this.latestRequirement.text,
        risk: this.latestRequirement.risk,
        verifyMethod: this.latestRequirement.verifyMethod,
        cssStyles: [],
        classes: ["default"]
      });
    }
    this.resetLatestRequirement();
    return this.requirements.get(name);
  }
  getRequirements() {
    return this.requirements;
  }
  setNewReqId(id) {
    if (this.latestRequirement !== undefined) {
      this.latestRequirement.requirementId = id;
    }
  }
  setNewReqText(text) {
    if (this.latestRequirement !== undefined) {
      this.latestRequirement.text = text;
    }
  }
  setNewReqRisk(risk) {
    if (this.latestRequirement !== undefined) {
      this.latestRequirement.risk = risk;
    }
  }
  setNewReqVerifyMethod(verifyMethod) {
    if (this.latestRequirement !== undefined) {
      this.latestRequirement.verifyMethod = verifyMethod;
    }
  }
  addElement(name) {
    if (!this.elements.has(name)) {
      this.elements.set(name, {
        name,
        type: this.latestElement.type,
        docRef: this.latestElement.docRef,
        cssStyles: [],
        classes: ["default"]
      });
      log.info("Added new element: ", name);
    }
    this.resetLatestElement();
    return this.elements.get(name);
  }
  getElements() {
    return this.elements;
  }
  setNewElementType(type) {
    if (this.latestElement !== undefined) {
      this.latestElement.type = type;
    }
  }
  setNewElementDocRef(docRef) {
    if (this.latestElement !== undefined) {
      this.latestElement.docRef = docRef;
    }
  }
  addRelationship(type, src, dst) {
    this.relations.push({
      type,
      src,
      dst
    });
  }
  getRelationships() {
    return this.relations;
  }
  clear() {
    this.relations = [];
    this.resetLatestRequirement();
    this.requirements = /* @__PURE__ */ new Map;
    this.resetLatestElement();
    this.elements = /* @__PURE__ */ new Map;
    this.classes = /* @__PURE__ */ new Map;
    clear();
  }
  setCssStyle(ids, styles) {
    for (const id of ids) {
      const node = this.requirements.get(id) ?? this.elements.get(id);
      if (!styles || !node) {
        return;
      }
      for (const s of styles) {
        if (s.includes(",")) {
          node.cssStyles.push(...s.split(","));
        } else {
          node.cssStyles.push(s);
        }
      }
    }
  }
  setClass(ids, classNames) {
    for (const id of ids) {
      const node = this.requirements.get(id) ?? this.elements.get(id);
      if (node) {
        for (const _class of classNames) {
          node.classes.push(_class);
          const styles = this.classes.get(_class)?.styles;
          if (styles) {
            node.cssStyles.push(...styles);
          }
        }
      }
    }
  }
  defineClass(ids, style) {
    for (const id of ids) {
      let styleClass = this.classes.get(id);
      if (styleClass === undefined) {
        styleClass = { id, styles: [], textStyles: [] };
        this.classes.set(id, styleClass);
      }
      if (style) {
        style.forEach(function(s) {
          if (/color/.exec(s)) {
            const newStyle = s.replace("fill", "bgFill");
            styleClass.textStyles.push(newStyle);
          }
          styleClass.styles.push(s);
        });
      }
      this.requirements.forEach((value) => {
        if (value.classes.includes(id)) {
          value.cssStyles.push(...style.flatMap((s) => s.split(",")));
        }
      });
      this.elements.forEach((value) => {
        if (value.classes.includes(id)) {
          value.cssStyles.push(...style.flatMap((s) => s.split(",")));
        }
      });
    }
  }
  getClasses() {
    return this.classes;
  }
  getData() {
    const config = getConfig2();
    const nodes = [];
    const edges = [];
    for (const requirement of this.requirements.values()) {
      const node = requirement;
      node.id = requirement.name;
      node.cssStyles = requirement.cssStyles;
      node.cssClasses = requirement.classes.join(" ");
      node.shape = "requirementBox";
      node.look = config.look;
      node.colorIndex = nodes.length;
      nodes.push(node);
    }
    for (const element of this.elements.values()) {
      const node = element;
      node.shape = "requirementBox";
      node.look = config.look;
      node.id = element.name;
      node.cssStyles = element.cssStyles;
      node.cssClasses = element.classes.join(" ");
      node.colorIndex = nodes.length;
      nodes.push(node);
    }
    for (const relation of this.relations) {
      let counter = 0;
      const isContains = relation.type === this.Relationships.CONTAINS;
      const edge = {
        id: `${relation.src}-${relation.dst}-${counter}`,
        start: this.requirements.get(relation.src)?.name ?? this.elements.get(relation.src)?.name,
        end: this.requirements.get(relation.dst)?.name ?? this.elements.get(relation.dst)?.name,
        label: `&lt;&lt;${relation.type}&gt;&gt;`,
        classes: "relationshipLine",
        style: ["fill:none", isContains ? "" : "stroke-dasharray: 10,7"],
        labelpos: "c",
        thickness: "normal",
        type: "normal",
        pattern: isContains ? "normal" : "dashed",
        arrowTypeStart: isContains ? "requirement_contains" : "",
        arrowTypeEnd: isContains ? "" : "requirement_arrow",
        look: config.look,
        labelType: "markdown"
      };
      edges.push(edge);
      counter++;
    }
    return { nodes, edges, other: {}, config, direction: this.getDirection() };
  }
};
var genColor = /* @__PURE__ */ __name((options) => {
  const config = getConfig();
  const { themeVariables, look } = config;
  const { bkgColorArray, borderColorArray } = themeVariables;
  if (!borderColorArray?.length) {
    return "";
  }
  let sections = "";
  for (let i = 0;i < options.THEME_COLOR_LIMIT; i++) {
    sections += `

    [data-look="${look}"][data-color-id="color-${i}"].node path {
    stroke: ${borderColorArray[i]};
    fill: ${bkgColorArray?.length ? bkgColorArray[i] : ""};
    }

    [data-look="${look}"][data-color-id="color-${i}"].node  rect {
    stroke: ${borderColorArray[i]};
    fill: ${bkgColorArray?.length ? bkgColorArray[i] : ""};
     }
    `;
  }
  return sections;
}, "genColor");
var getStyles = /* @__PURE__ */ __name((options) => {
  const config = getConfig();
  const { look, themeVariables } = config;
  const { requirementEdgeLabelBackground } = themeVariables;
  return `
  ${genColor(options)}
  marker {
    fill: ${options.relationColor};
    stroke: ${options.relationColor};
  }

  marker.cross {
    stroke: ${options.lineColor};
  }

  svg {
    font-family: ${options.fontFamily};
    font-size: ${options.fontSize};
  }

  .reqBox {
    fill: ${options.requirementBackground};
    fill-opacity: 1.0;
    stroke: ${options.requirementBorderColor};
    stroke-width: ${options.requirementBorderSize};
  }
  
  .reqTitle, .reqLabel{
    fill:  ${options.requirementTextColor};
  }
  .reqLabelBox {
    fill: ${options.relationLabelBackground};
    fill-opacity: 1.0;
  }

  .req-title-line {
    stroke: ${options.requirementBorderColor};
    stroke-width: ${options.requirementBorderSize};
  }
  .relationshipLine {
    stroke: ${options.relationColor};
    stroke-width: ${look === "neo" ? options.strokeWidth : "1px"};
  }
  .relationshipLabel {
    fill: ${options.relationLabelColor};
  }
    .edgeLabel {
    background-color: ${options.edgeLabelBackground};
  }
  .edgeLabel .label rect {
    fill: ${options.edgeLabelBackground};
  }
  .edgeLabel .label text {
    fill: ${options.relationLabelColor};
  }
  .divider {
    stroke: ${options.nodeBorder};
    stroke-width: 1;
  }
  .label {
    font-family: ${options.fontFamily};
    color: ${options.nodeTextColor || options.textColor};
  }
  .label text,span {
    fill: ${options.nodeTextColor || options.textColor};
    color: ${options.nodeTextColor || options.textColor};
  }
  .labelBkg {
    background-color: ${requirementEdgeLabelBackground ?? options.edgeLabelBackground};
  }

`;
}, "getStyles");
var styles_default = getStyles;
var requirementRenderer_exports = {};
__export(requirementRenderer_exports, {
  draw: () => draw
});
var draw = /* @__PURE__ */ __name(async function(text, id, _version, diag) {
  log.info("REF0:");
  log.info("Drawing requirement diagram (unified)", id);
  const { securityLevel, state: conf, layout, look } = getConfig2();
  const data4Layout = diag.db.getData();
  const svg = getDiagramElement(id, securityLevel);
  data4Layout.type = diag.type;
  data4Layout.layoutAlgorithm = getRegisteredLayoutAlgorithm(layout);
  data4Layout.nodeSpacing = conf?.nodeSpacing ?? 50;
  data4Layout.rankSpacing = conf?.rankSpacing ?? 50;
  data4Layout.markers = look === "neo" ? ["requirement_contains_neo", "requirement_arrow_neo"] : ["requirement_contains", "requirement_arrow"];
  data4Layout.diagramId = id;
  await render(data4Layout, svg);
  const padding = 8;
  utils_default.insertTitle(svg, "requirementDiagramTitleText", conf?.titleTopMargin ?? 25, diag.db.getDiagramTitle());
  setupViewPortForSVG(svg, padding, "requirementDiagram", conf?.useMaxWidth ?? true);
}, "draw");
var diagram = {
  parser: requirementDiagram_default,
  get db() {
    return new RequirementDB;
  },
  renderer: requirementRenderer_exports,
  styles: styles_default
};
export {
  diagram
};

//# debugId=29C766723897F76964756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL3JlcXVpcmVtZW50RGlhZ3JhbS00WTZXUEUzMy5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiaW1wb3J0IHtcbiAgZ2V0RGlhZ3JhbUVsZW1lbnRcbn0gZnJvbSBcIi4vY2h1bmstNTVJQUNFQjYubWpzXCI7XG5pbXBvcnQge1xuICBzZXR1cFZpZXdQb3J0Rm9yU1ZHXG59IGZyb20gXCIuL2NodW5rLTJKMzNXVE1ILm1qc1wiO1xuaW1wb3J0IHtcbiAgZ2V0UmVnaXN0ZXJlZExheW91dEFsZ29yaXRobSxcbiAgcmVuZGVyXG59IGZyb20gXCIuL2NodW5rLUxaWEVEWkNBLm1qc1wiO1xuaW1wb3J0IFwiLi9jaHVuay1LU0NTNU42QS5tanNcIjtcbmltcG9ydCBcIi4vY2h1bmstQlNKUDdDQlAubWpzXCI7XG5pbXBvcnQgXCIuL2NodW5rLTNPUElGR0RFLm1qc1wiO1xuaW1wb3J0IFwiLi9jaHVuay1MNVpUTERXVi5tanNcIjtcbmltcG9ydCBcIi4vY2h1bmstTlpLMkQ3R1UubWpzXCI7XG5pbXBvcnQgXCIuL2NodW5rLU81Q0JFTDZPLm1qc1wiO1xuaW1wb3J0IHtcbiAgdXRpbHNfZGVmYXVsdFxufSBmcm9tIFwiLi9jaHVuay01WlFZSFhLVS5tanNcIjtcbmltcG9ydCB7XG4gIGNsZWFyLFxuICBnZXRBY2NEZXNjcmlwdGlvbixcbiAgZ2V0QWNjVGl0bGUsXG4gIGdldENvbmZpZyxcbiAgZ2V0Q29uZmlnMixcbiAgZ2V0RGlhZ3JhbVRpdGxlLFxuICBzZXRBY2NEZXNjcmlwdGlvbixcbiAgc2V0QWNjVGl0bGUsXG4gIHNldERpYWdyYW1UaXRsZVxufSBmcm9tIFwiLi9jaHVuay1DU0NJSEs3US5tanNcIjtcbmltcG9ydCB7XG4gIF9fZXhwb3J0LFxuICBfX25hbWUsXG4gIGxvZ1xufSBmcm9tIFwiLi9jaHVuay1BR0hSQjRKRi5tanNcIjtcblxuLy8gc3JjL2RpYWdyYW1zL3JlcXVpcmVtZW50L3BhcnNlci9yZXF1aXJlbWVudERpYWdyYW0uamlzb25cbnZhciBwYXJzZXIgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBvID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihrLCB2LCBvMiwgbCkge1xuICAgIGZvciAobzIgPSBvMiB8fCB7fSwgbCA9IGsubGVuZ3RoOyBsLS07IG8yW2tbbF1dID0gdikgO1xuICAgIHJldHVybiBvMjtcbiAgfSwgXCJvXCIpLCAkVjAgPSBbMSwgM10sICRWMSA9IFsxLCA0XSwgJFYyID0gWzEsIDVdLCAkVjMgPSBbMSwgNl0sICRWNCA9IFs1LCA2LCA4LCA5LCAxMSwgMTMsIDIxLCAyMiwgMjMsIDI0LCA0MSwgNDIsIDQzLCA0NCwgNDUsIDQ2LCA1NCwgNzIsIDc0LCA3NywgODksIDkwXSwgJFY1ID0gWzEsIDIyXSwgJFY2ID0gWzIsIDddLCAkVjcgPSBbMSwgMjZdLCAkVjggPSBbMSwgMjddLCAkVjkgPSBbMSwgMjhdLCAkVmEgPSBbMSwgMjldLCAkVmIgPSBbMSwgMzNdLCAkVmMgPSBbMSwgMzRdLCAkVmQgPSBbMSwgMzVdLCAkVmUgPSBbMSwgMzZdLCAkVmYgPSBbMSwgMzddLCAkVmcgPSBbMSwgMzhdLCAkVmggPSBbMSwgMjRdLCAkVmkgPSBbMSwgMzFdLCAkVmogPSBbMSwgMzJdLCAkVmsgPSBbMSwgMzBdLCAkVmwgPSBbMSwgMzldLCAkVm0gPSBbMSwgNDBdLCAkVm4gPSBbNSwgOCwgOSwgMTEsIDEzLCAyMSwgMjIsIDIzLCAyNCwgNDEsIDQyLCA0MywgNDQsIDQ1LCA0NiwgNTQsIDcyLCA3NCwgNzcsIDg5LCA5MF0sICRWbyA9IFsxLCA2MV0sICRWcCA9IFs4OSwgOTBdLCAkVnEgPSBbNSwgOCwgOSwgMTEsIDEzLCAyMSwgMjIsIDIzLCAyNCwgMjcsIDI5LCA0MSwgNDIsIDQzLCA0NCwgNDUsIDQ2LCA1NCwgNjEsIDYzLCA3MiwgNzQsIDc1LCA3NiwgNzcsIDgwLCA4MSwgODIsIDgzLCA4NCwgODUsIDg2LCA4NywgODgsIDg5LCA5MF0sICRWciA9IFsyNywgMjldLCAkVnMgPSBbMSwgNzBdLCAkVnQgPSBbMSwgNzFdLCAkVnUgPSBbMSwgNzJdLCAkVnYgPSBbMSwgNzNdLCAkVncgPSBbMSwgNzRdLCAkVnggPSBbMSwgNzVdLCAkVnkgPSBbMSwgNzZdLCAkVnogPSBbMSwgODNdLCAkVkEgPSBbMSwgODBdLCAkVkIgPSBbMSwgODRdLCAkVkMgPSBbMSwgODVdLCAkVkQgPSBbMSwgODZdLCAkVkUgPSBbMSwgODddLCAkVkYgPSBbMSwgODhdLCAkVkcgPSBbMSwgODldLCAkVkggPSBbMSwgOTBdLCAkVkkgPSBbMSwgOTFdLCAkVkogPSBbMSwgOTJdLCAkVksgPSBbNSwgOCwgOSwgMTEsIDEzLCAyMSwgMjIsIDIzLCAyNCwgMjcsIDQxLCA0MiwgNDMsIDQ0LCA0NSwgNDYsIDU0LCA3MiwgNzQsIDc1LCA3NiwgNzcsIDgwLCA4MSwgODIsIDgzLCA4NCwgODUsIDg2LCA4NywgODgsIDg5LCA5MF0sICRWTCA9IFs2MywgNjRdLCAkVk0gPSBbMSwgMTAxXSwgJFZOID0gWzUsIDgsIDksIDExLCAxMywgMjEsIDIyLCAyMywgMjQsIDQxLCA0MiwgNDMsIDQ0LCA0NSwgNDYsIDU0LCA3MiwgNzQsIDc2LCA3NywgODksIDkwXSwgJFZPID0gWzUsIDgsIDksIDExLCAxMywgMjEsIDIyLCAyMywgMjQsIDQxLCA0MiwgNDMsIDQ0LCA0NSwgNDYsIDU0LCA3MiwgNzQsIDc1LCA3NiwgNzcsIDgwLCA4MSwgODIsIDgzLCA4NCwgODUsIDg2LCA4NywgODgsIDg5LCA5MF0sICRWUCA9IFsxLCAxMTBdLCAkVlEgPSBbMSwgMTA2XSwgJFZSID0gWzEsIDEwN10sICRWUyA9IFsxLCAxMDhdLCAkVlQgPSBbMSwgMTA5XSwgJFZVID0gWzEsIDExMV0sICRWViA9IFsxLCAxMTZdLCAkVlcgPSBbMSwgMTE3XSwgJFZYID0gWzEsIDExNF0sICRWWSA9IFsxLCAxMTVdO1xuICB2YXIgcGFyc2VyMiA9IHtcbiAgICB0cmFjZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiB0cmFjZSgpIHtcbiAgICB9LCBcInRyYWNlXCIpLFxuICAgIHl5OiB7fSxcbiAgICBzeW1ib2xzXzogeyBcImVycm9yXCI6IDIsIFwic3RhcnRcIjogMywgXCJkaXJlY3RpdmVcIjogNCwgXCJORVdMSU5FXCI6IDUsIFwiUkRcIjogNiwgXCJkaWFncmFtXCI6IDcsIFwiRU9GXCI6IDgsIFwiYWNjX3RpdGxlXCI6IDksIFwiYWNjX3RpdGxlX3ZhbHVlXCI6IDEwLCBcImFjY19kZXNjclwiOiAxMSwgXCJhY2NfZGVzY3JfdmFsdWVcIjogMTIsIFwiYWNjX2Rlc2NyX211bHRpbGluZV92YWx1ZVwiOiAxMywgXCJyZXF1aXJlbWVudERlZlwiOiAxNCwgXCJlbGVtZW50RGVmXCI6IDE1LCBcInJlbGF0aW9uc2hpcERlZlwiOiAxNiwgXCJkaXJlY3Rpb25cIjogMTcsIFwic3R5bGVTdGF0ZW1lbnRcIjogMTgsIFwiY2xhc3NEZWZTdGF0ZW1lbnRcIjogMTksIFwiY2xhc3NTdGF0ZW1lbnRcIjogMjAsIFwiZGlyZWN0aW9uX3RiXCI6IDIxLCBcImRpcmVjdGlvbl9idFwiOiAyMiwgXCJkaXJlY3Rpb25fcmxcIjogMjMsIFwiZGlyZWN0aW9uX2xyXCI6IDI0LCBcInJlcXVpcmVtZW50VHlwZVwiOiAyNSwgXCJyZXF1aXJlbWVudE5hbWVcIjogMjYsIFwiU1RSVUNUX1NUQVJUXCI6IDI3LCBcInJlcXVpcmVtZW50Qm9keVwiOiAyOCwgXCJTVFlMRV9TRVBBUkFUT1JcIjogMjksIFwiaWRMaXN0XCI6IDMwLCBcIklEXCI6IDMxLCBcIkNPTE9OU0VQXCI6IDMyLCBcImlkXCI6IDMzLCBcIlRFWFRcIjogMzQsIFwidGV4dFwiOiAzNSwgXCJSSVNLXCI6IDM2LCBcInJpc2tMZXZlbFwiOiAzNywgXCJWRVJJRllNVEhEXCI6IDM4LCBcInZlcmlmeVR5cGVcIjogMzksIFwiU1RSVUNUX1NUT1BcIjogNDAsIFwiUkVRVUlSRU1FTlRcIjogNDEsIFwiRlVOQ1RJT05BTF9SRVFVSVJFTUVOVFwiOiA0MiwgXCJJTlRFUkZBQ0VfUkVRVUlSRU1FTlRcIjogNDMsIFwiUEVSRk9STUFOQ0VfUkVRVUlSRU1FTlRcIjogNDQsIFwiUEhZU0lDQUxfUkVRVUlSRU1FTlRcIjogNDUsIFwiREVTSUdOX0NPTlNUUkFJTlRcIjogNDYsIFwiTE9XX1JJU0tcIjogNDcsIFwiTUVEX1JJU0tcIjogNDgsIFwiSElHSF9SSVNLXCI6IDQ5LCBcIlZFUklGWV9BTkFMWVNJU1wiOiA1MCwgXCJWRVJJRllfREVNT05TVFJBVElPTlwiOiA1MSwgXCJWRVJJRllfSU5TUEVDVElPTlwiOiA1MiwgXCJWRVJJRllfVEVTVFwiOiA1MywgXCJFTEVNRU5UXCI6IDU0LCBcImVsZW1lbnROYW1lXCI6IDU1LCBcImVsZW1lbnRCb2R5XCI6IDU2LCBcIlRZUEVcIjogNTcsIFwidHlwZVwiOiA1OCwgXCJET0NSRUZcIjogNTksIFwicmVmXCI6IDYwLCBcIkVORF9BUlJPV19MXCI6IDYxLCBcInJlbGF0aW9uc2hpcFwiOiA2MiwgXCJMSU5FXCI6IDYzLCBcIkVORF9BUlJPV19SXCI6IDY0LCBcIkNPTlRBSU5TXCI6IDY1LCBcIkNPUElFU1wiOiA2NiwgXCJERVJJVkVTXCI6IDY3LCBcIlNBVElTRklFU1wiOiA2OCwgXCJWRVJJRklFU1wiOiA2OSwgXCJSRUZJTkVTXCI6IDcwLCBcIlRSQUNFU1wiOiA3MSwgXCJDTEFTU0RFRlwiOiA3MiwgXCJzdHlsZXNPcHRcIjogNzMsIFwiQ0xBU1NcIjogNzQsIFwiQUxQSEFcIjogNzUsIFwiQ09NTUFcIjogNzYsIFwiU1RZTEVcIjogNzcsIFwic3R5bGVcIjogNzgsIFwic3R5bGVDb21wb25lbnRcIjogNzksIFwiTlVNXCI6IDgwLCBcIkNPTE9OXCI6IDgxLCBcIlVOSVRcIjogODIsIFwiU1BBQ0VcIjogODMsIFwiQlJLVFwiOiA4NCwgXCJQQ1RcIjogODUsIFwiTUlOVVNcIjogODYsIFwiTEFCRUxcIjogODcsIFwiU0VNSUNPTE9OXCI6IDg4LCBcInVucVN0cmluZ1wiOiA4OSwgXCJxU3RyaW5nXCI6IDkwLCBcIiRhY2NlcHRcIjogMCwgXCIkZW5kXCI6IDEgfSxcbiAgICB0ZXJtaW5hbHNfOiB7IDI6IFwiZXJyb3JcIiwgNTogXCJORVdMSU5FXCIsIDY6IFwiUkRcIiwgODogXCJFT0ZcIiwgOTogXCJhY2NfdGl0bGVcIiwgMTA6IFwiYWNjX3RpdGxlX3ZhbHVlXCIsIDExOiBcImFjY19kZXNjclwiLCAxMjogXCJhY2NfZGVzY3JfdmFsdWVcIiwgMTM6IFwiYWNjX2Rlc2NyX211bHRpbGluZV92YWx1ZVwiLCAyMTogXCJkaXJlY3Rpb25fdGJcIiwgMjI6IFwiZGlyZWN0aW9uX2J0XCIsIDIzOiBcImRpcmVjdGlvbl9ybFwiLCAyNDogXCJkaXJlY3Rpb25fbHJcIiwgMjc6IFwiU1RSVUNUX1NUQVJUXCIsIDI5OiBcIlNUWUxFX1NFUEFSQVRPUlwiLCAzMTogXCJJRFwiLCAzMjogXCJDT0xPTlNFUFwiLCAzNDogXCJURVhUXCIsIDM2OiBcIlJJU0tcIiwgMzg6IFwiVkVSSUZZTVRIRFwiLCA0MDogXCJTVFJVQ1RfU1RPUFwiLCA0MTogXCJSRVFVSVJFTUVOVFwiLCA0MjogXCJGVU5DVElPTkFMX1JFUVVJUkVNRU5UXCIsIDQzOiBcIklOVEVSRkFDRV9SRVFVSVJFTUVOVFwiLCA0NDogXCJQRVJGT1JNQU5DRV9SRVFVSVJFTUVOVFwiLCA0NTogXCJQSFlTSUNBTF9SRVFVSVJFTUVOVFwiLCA0NjogXCJERVNJR05fQ09OU1RSQUlOVFwiLCA0NzogXCJMT1dfUklTS1wiLCA0ODogXCJNRURfUklTS1wiLCA0OTogXCJISUdIX1JJU0tcIiwgNTA6IFwiVkVSSUZZX0FOQUxZU0lTXCIsIDUxOiBcIlZFUklGWV9ERU1PTlNUUkFUSU9OXCIsIDUyOiBcIlZFUklGWV9JTlNQRUNUSU9OXCIsIDUzOiBcIlZFUklGWV9URVNUXCIsIDU0OiBcIkVMRU1FTlRcIiwgNTc6IFwiVFlQRVwiLCA1OTogXCJET0NSRUZcIiwgNjE6IFwiRU5EX0FSUk9XX0xcIiwgNjM6IFwiTElORVwiLCA2NDogXCJFTkRfQVJST1dfUlwiLCA2NTogXCJDT05UQUlOU1wiLCA2NjogXCJDT1BJRVNcIiwgNjc6IFwiREVSSVZFU1wiLCA2ODogXCJTQVRJU0ZJRVNcIiwgNjk6IFwiVkVSSUZJRVNcIiwgNzA6IFwiUkVGSU5FU1wiLCA3MTogXCJUUkFDRVNcIiwgNzI6IFwiQ0xBU1NERUZcIiwgNzQ6IFwiQ0xBU1NcIiwgNzU6IFwiQUxQSEFcIiwgNzY6IFwiQ09NTUFcIiwgNzc6IFwiU1RZTEVcIiwgODA6IFwiTlVNXCIsIDgxOiBcIkNPTE9OXCIsIDgyOiBcIlVOSVRcIiwgODM6IFwiU1BBQ0VcIiwgODQ6IFwiQlJLVFwiLCA4NTogXCJQQ1RcIiwgODY6IFwiTUlOVVNcIiwgODc6IFwiTEFCRUxcIiwgODg6IFwiU0VNSUNPTE9OXCIsIDg5OiBcInVucVN0cmluZ1wiLCA5MDogXCJxU3RyaW5nXCIgfSxcbiAgICBwcm9kdWN0aW9uc186IFswLCBbMywgM10sIFszLCAyXSwgWzMsIDRdLCBbNCwgMl0sIFs0LCAyXSwgWzQsIDFdLCBbNywgMF0sIFs3LCAyXSwgWzcsIDJdLCBbNywgMl0sIFs3LCAyXSwgWzcsIDJdLCBbNywgMl0sIFs3LCAyXSwgWzcsIDJdLCBbNywgMl0sIFsxNywgMV0sIFsxNywgMV0sIFsxNywgMV0sIFsxNywgMV0sIFsxNCwgNV0sIFsxNCwgN10sIFsyOCwgNV0sIFsyOCwgNV0sIFsyOCwgNV0sIFsyOCwgNV0sIFsyOCwgMl0sIFsyOCwgMV0sIFsyNSwgMV0sIFsyNSwgMV0sIFsyNSwgMV0sIFsyNSwgMV0sIFsyNSwgMV0sIFsyNSwgMV0sIFszNywgMV0sIFszNywgMV0sIFszNywgMV0sIFszOSwgMV0sIFszOSwgMV0sIFszOSwgMV0sIFszOSwgMV0sIFsxNSwgNV0sIFsxNSwgN10sIFs1NiwgNV0sIFs1NiwgNV0sIFs1NiwgMl0sIFs1NiwgMV0sIFsxNiwgNV0sIFsxNiwgNV0sIFs2MiwgMV0sIFs2MiwgMV0sIFs2MiwgMV0sIFs2MiwgMV0sIFs2MiwgMV0sIFs2MiwgMV0sIFs2MiwgMV0sIFsxOSwgM10sIFsyMCwgM10sIFsyMCwgM10sIFszMCwgMV0sIFszMCwgM10sIFszMCwgMV0sIFszMCwgM10sIFsxOCwgM10sIFs3MywgMV0sIFs3MywgM10sIFs3OCwgMV0sIFs3OCwgMl0sIFs3OSwgMV0sIFs3OSwgMV0sIFs3OSwgMV0sIFs3OSwgMV0sIFs3OSwgMV0sIFs3OSwgMV0sIFs3OSwgMV0sIFs3OSwgMV0sIFs3OSwgMV0sIFs3OSwgMV0sIFsyNiwgMV0sIFsyNiwgMV0sIFszMywgMV0sIFszMywgMV0sIFszNSwgMV0sIFszNSwgMV0sIFs1NSwgMV0sIFs1NSwgMV0sIFs1OCwgMV0sIFs1OCwgMV0sIFs2MCwgMV0sIFs2MCwgMV1dLFxuICAgIHBlcmZvcm1BY3Rpb246IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gYW5vbnltb3VzKHl5dGV4dCwgeXlsZW5nLCB5eWxpbmVubywgeXksIHl5c3RhdGUsICQkLCBfJCkge1xuICAgICAgdmFyICQwID0gJCQubGVuZ3RoIC0gMTtcbiAgICAgIHN3aXRjaCAoeXlzdGF0ZSkge1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdLnRyaW0oKTtcbiAgICAgICAgICB5eS5zZXRBY2NUaXRsZSh0aGlzLiQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU6XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF0udHJpbSgpO1xuICAgICAgICAgIHl5LnNldEFjY0Rlc2NyaXB0aW9uKHRoaXMuJCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzpcbiAgICAgICAgICB0aGlzLiQgPSBbXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNzpcbiAgICAgICAgICB5eS5zZXREaXJlY3Rpb24oXCJUQlwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxODpcbiAgICAgICAgICB5eS5zZXREaXJlY3Rpb24oXCJCVFwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOTpcbiAgICAgICAgICB5eS5zZXREaXJlY3Rpb24oXCJSTFwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyMDpcbiAgICAgICAgICB5eS5zZXREaXJlY3Rpb24oXCJMUlwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyMTpcbiAgICAgICAgICB5eS5hZGRSZXF1aXJlbWVudCgkJFskMCAtIDNdLCAkJFskMCAtIDRdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyMjpcbiAgICAgICAgICB5eS5hZGRSZXF1aXJlbWVudCgkJFskMCAtIDVdLCAkJFskMCAtIDZdKTtcbiAgICAgICAgICB5eS5zZXRDbGFzcyhbJCRbJDAgLSA1XV0sICQkWyQwIC0gM10pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDIzOlxuICAgICAgICAgIHl5LnNldE5ld1JlcUlkKCQkWyQwIC0gMl0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI0OlxuICAgICAgICAgIHl5LnNldE5ld1JlcVRleHQoJCRbJDAgLSAyXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjU6XG4gICAgICAgICAgeXkuc2V0TmV3UmVxUmlzaygkJFskMCAtIDJdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyNjpcbiAgICAgICAgICB5eS5zZXROZXdSZXFWZXJpZnlNZXRob2QoJCRbJDAgLSAyXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjk6XG4gICAgICAgICAgdGhpcy4kID0geXkuUmVxdWlyZW1lbnRUeXBlLlJFUVVJUkVNRU5UO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMwOlxuICAgICAgICAgIHRoaXMuJCA9IHl5LlJlcXVpcmVtZW50VHlwZS5GVU5DVElPTkFMX1JFUVVJUkVNRU5UO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMxOlxuICAgICAgICAgIHRoaXMuJCA9IHl5LlJlcXVpcmVtZW50VHlwZS5JTlRFUkZBQ0VfUkVRVUlSRU1FTlQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzI6XG4gICAgICAgICAgdGhpcy4kID0geXkuUmVxdWlyZW1lbnRUeXBlLlBFUkZPUk1BTkNFX1JFUVVJUkVNRU5UO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMzOlxuICAgICAgICAgIHRoaXMuJCA9IHl5LlJlcXVpcmVtZW50VHlwZS5QSFlTSUNBTF9SRVFVSVJFTUVOVDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzNDpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5SZXF1aXJlbWVudFR5cGUuREVTSUdOX0NPTlNUUkFJTlQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzU6XG4gICAgICAgICAgdGhpcy4kID0geXkuUmlza0xldmVsLkxPV19SSVNLO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM2OlxuICAgICAgICAgIHRoaXMuJCA9IHl5LlJpc2tMZXZlbC5NRURfUklTSztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5SaXNrTGV2ZWwuSElHSF9SSVNLO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM4OlxuICAgICAgICAgIHRoaXMuJCA9IHl5LlZlcmlmeVR5cGUuVkVSSUZZX0FOQUxZU0lTO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM5OlxuICAgICAgICAgIHRoaXMuJCA9IHl5LlZlcmlmeVR5cGUuVkVSSUZZX0RFTU9OU1RSQVRJT047XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgdGhpcy4kID0geXkuVmVyaWZ5VHlwZS5WRVJJRllfSU5TUEVDVElPTjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0MTpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5WZXJpZnlUeXBlLlZFUklGWV9URVNUO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQyOlxuICAgICAgICAgIHl5LmFkZEVsZW1lbnQoJCRbJDAgLSAzXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDM6XG4gICAgICAgICAgeXkuYWRkRWxlbWVudCgkJFskMCAtIDVdKTtcbiAgICAgICAgICB5eS5zZXRDbGFzcyhbJCRbJDAgLSA1XV0sICQkWyQwIC0gM10pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ0OlxuICAgICAgICAgIHl5LnNldE5ld0VsZW1lbnRUeXBlKCQkWyQwIC0gMl0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ1OlxuICAgICAgICAgIHl5LnNldE5ld0VsZW1lbnREb2NSZWYoJCRbJDAgLSAyXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDg6XG4gICAgICAgICAgeXkuYWRkUmVsYXRpb25zaGlwKCQkWyQwIC0gMl0sICQkWyQwXSwgJCRbJDAgLSA0XSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDk6XG4gICAgICAgICAgeXkuYWRkUmVsYXRpb25zaGlwKCQkWyQwIC0gMl0sICQkWyQwIC0gNF0sICQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTA6XG4gICAgICAgICAgdGhpcy4kID0geXkuUmVsYXRpb25zaGlwcy5DT05UQUlOUztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1MTpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5SZWxhdGlvbnNoaXBzLkNPUElFUztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1MjpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5SZWxhdGlvbnNoaXBzLkRFUklWRVM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTM6XG4gICAgICAgICAgdGhpcy4kID0geXkuUmVsYXRpb25zaGlwcy5TQVRJU0ZJRVM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTQ6XG4gICAgICAgICAgdGhpcy4kID0geXkuUmVsYXRpb25zaGlwcy5WRVJJRklFUztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1NTpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5SZWxhdGlvbnNoaXBzLlJFRklORVM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTY6XG4gICAgICAgICAgdGhpcy4kID0geXkuUmVsYXRpb25zaGlwcy5UUkFDRVM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTc6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAyXTtcbiAgICAgICAgICB5eS5kZWZpbmVDbGFzcygkJFskMCAtIDFdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU4OlxuICAgICAgICAgIHl5LnNldENsYXNzKCQkWyQwIC0gMV0sICQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTk6XG4gICAgICAgICAgeXkuc2V0Q2xhc3MoWyQkWyQwIC0gMl1dLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDYwOlxuICAgICAgICBjYXNlIDYyOlxuICAgICAgICAgIHRoaXMuJCA9IFskJFskMF1dO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDYxOlxuICAgICAgICBjYXNlIDYzOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMl0uY29uY2F0KFskJFskMF1dKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2NDpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDJdO1xuICAgICAgICAgIHl5LnNldENzc1N0eWxlKCQkWyQwIC0gMV0sICQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjU6XG4gICAgICAgICAgdGhpcy4kID0gWyQkWyQwXV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjY6XG4gICAgICAgICAgJCRbJDAgLSAyXS5wdXNoKCQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAyXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2ODpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDFdICsgJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0sIFwiYW5vbnltb3VzXCIpLFxuICAgIHRhYmxlOiBbeyAzOiAxLCA0OiAyLCA2OiAkVjAsIDk6ICRWMSwgMTE6ICRWMiwgMTM6ICRWMyB9LCB7IDE6IFszXSB9LCB7IDM6IDgsIDQ6IDIsIDU6IFsxLCA3XSwgNjogJFYwLCA5OiAkVjEsIDExOiAkVjIsIDEzOiAkVjMgfSwgeyA1OiBbMSwgOV0gfSwgeyAxMDogWzEsIDEwXSB9LCB7IDEyOiBbMSwgMTFdIH0sIG8oJFY0LCBbMiwgNl0pLCB7IDM6IDEyLCA0OiAyLCA2OiAkVjAsIDk6ICRWMSwgMTE6ICRWMiwgMTM6ICRWMyB9LCB7IDE6IFsyLCAyXSB9LCB7IDQ6IDE3LCA1OiAkVjUsIDc6IDEzLCA4OiAkVjYsIDk6ICRWMSwgMTE6ICRWMiwgMTM6ICRWMywgMTQ6IDE0LCAxNTogMTUsIDE2OiAxNiwgMTc6IDE4LCAxODogMTksIDE5OiAyMCwgMjA6IDIxLCAyMTogJFY3LCAyMjogJFY4LCAyMzogJFY5LCAyNDogJFZhLCAyNTogMjMsIDMzOiAyNSwgNDE6ICRWYiwgNDI6ICRWYywgNDM6ICRWZCwgNDQ6ICRWZSwgNDU6ICRWZiwgNDY6ICRWZywgNTQ6ICRWaCwgNzI6ICRWaSwgNzQ6ICRWaiwgNzc6ICRWaywgODk6ICRWbCwgOTA6ICRWbSB9LCBvKCRWNCwgWzIsIDRdKSwgbygkVjQsIFsyLCA1XSksIHsgMTogWzIsIDFdIH0sIHsgODogWzEsIDQxXSB9LCB7IDQ6IDE3LCA1OiAkVjUsIDc6IDQyLCA4OiAkVjYsIDk6ICRWMSwgMTE6ICRWMiwgMTM6ICRWMywgMTQ6IDE0LCAxNTogMTUsIDE2OiAxNiwgMTc6IDE4LCAxODogMTksIDE5OiAyMCwgMjA6IDIxLCAyMTogJFY3LCAyMjogJFY4LCAyMzogJFY5LCAyNDogJFZhLCAyNTogMjMsIDMzOiAyNSwgNDE6ICRWYiwgNDI6ICRWYywgNDM6ICRWZCwgNDQ6ICRWZSwgNDU6ICRWZiwgNDY6ICRWZywgNTQ6ICRWaCwgNzI6ICRWaSwgNzQ6ICRWaiwgNzc6ICRWaywgODk6ICRWbCwgOTA6ICRWbSB9LCB7IDQ6IDE3LCA1OiAkVjUsIDc6IDQzLCA4OiAkVjYsIDk6ICRWMSwgMTE6ICRWMiwgMTM6ICRWMywgMTQ6IDE0LCAxNTogMTUsIDE2OiAxNiwgMTc6IDE4LCAxODogMTksIDE5OiAyMCwgMjA6IDIxLCAyMTogJFY3LCAyMjogJFY4LCAyMzogJFY5LCAyNDogJFZhLCAyNTogMjMsIDMzOiAyNSwgNDE6ICRWYiwgNDI6ICRWYywgNDM6ICRWZCwgNDQ6ICRWZSwgNDU6ICRWZiwgNDY6ICRWZywgNTQ6ICRWaCwgNzI6ICRWaSwgNzQ6ICRWaiwgNzc6ICRWaywgODk6ICRWbCwgOTA6ICRWbSB9LCB7IDQ6IDE3LCA1OiAkVjUsIDc6IDQ0LCA4OiAkVjYsIDk6ICRWMSwgMTE6ICRWMiwgMTM6ICRWMywgMTQ6IDE0LCAxNTogMTUsIDE2OiAxNiwgMTc6IDE4LCAxODogMTksIDE5OiAyMCwgMjA6IDIxLCAyMTogJFY3LCAyMjogJFY4LCAyMzogJFY5LCAyNDogJFZhLCAyNTogMjMsIDMzOiAyNSwgNDE6ICRWYiwgNDI6ICRWYywgNDM6ICRWZCwgNDQ6ICRWZSwgNDU6ICRWZiwgNDY6ICRWZywgNTQ6ICRWaCwgNzI6ICRWaSwgNzQ6ICRWaiwgNzc6ICRWaywgODk6ICRWbCwgOTA6ICRWbSB9LCB7IDQ6IDE3LCA1OiAkVjUsIDc6IDQ1LCA4OiAkVjYsIDk6ICRWMSwgMTE6ICRWMiwgMTM6ICRWMywgMTQ6IDE0LCAxNTogMTUsIDE2OiAxNiwgMTc6IDE4LCAxODogMTksIDE5OiAyMCwgMjA6IDIxLCAyMTogJFY3LCAyMjogJFY4LCAyMzogJFY5LCAyNDogJFZhLCAyNTogMjMsIDMzOiAyNSwgNDE6ICRWYiwgNDI6ICRWYywgNDM6ICRWZCwgNDQ6ICRWZSwgNDU6ICRWZiwgNDY6ICRWZywgNTQ6ICRWaCwgNzI6ICRWaSwgNzQ6ICRWaiwgNzc6ICRWaywgODk6ICRWbCwgOTA6ICRWbSB9LCB7IDQ6IDE3LCA1OiAkVjUsIDc6IDQ2LCA4OiAkVjYsIDk6ICRWMSwgMTE6ICRWMiwgMTM6ICRWMywgMTQ6IDE0LCAxNTogMTUsIDE2OiAxNiwgMTc6IDE4LCAxODogMTksIDE5OiAyMCwgMjA6IDIxLCAyMTogJFY3LCAyMjogJFY4LCAyMzogJFY5LCAyNDogJFZhLCAyNTogMjMsIDMzOiAyNSwgNDE6ICRWYiwgNDI6ICRWYywgNDM6ICRWZCwgNDQ6ICRWZSwgNDU6ICRWZiwgNDY6ICRWZywgNTQ6ICRWaCwgNzI6ICRWaSwgNzQ6ICRWaiwgNzc6ICRWaywgODk6ICRWbCwgOTA6ICRWbSB9LCB7IDQ6IDE3LCA1OiAkVjUsIDc6IDQ3LCA4OiAkVjYsIDk6ICRWMSwgMTE6ICRWMiwgMTM6ICRWMywgMTQ6IDE0LCAxNTogMTUsIDE2OiAxNiwgMTc6IDE4LCAxODogMTksIDE5OiAyMCwgMjA6IDIxLCAyMTogJFY3LCAyMjogJFY4LCAyMzogJFY5LCAyNDogJFZhLCAyNTogMjMsIDMzOiAyNSwgNDE6ICRWYiwgNDI6ICRWYywgNDM6ICRWZCwgNDQ6ICRWZSwgNDU6ICRWZiwgNDY6ICRWZywgNTQ6ICRWaCwgNzI6ICRWaSwgNzQ6ICRWaiwgNzc6ICRWaywgODk6ICRWbCwgOTA6ICRWbSB9LCB7IDQ6IDE3LCA1OiAkVjUsIDc6IDQ4LCA4OiAkVjYsIDk6ICRWMSwgMTE6ICRWMiwgMTM6ICRWMywgMTQ6IDE0LCAxNTogMTUsIDE2OiAxNiwgMTc6IDE4LCAxODogMTksIDE5OiAyMCwgMjA6IDIxLCAyMTogJFY3LCAyMjogJFY4LCAyMzogJFY5LCAyNDogJFZhLCAyNTogMjMsIDMzOiAyNSwgNDE6ICRWYiwgNDI6ICRWYywgNDM6ICRWZCwgNDQ6ICRWZSwgNDU6ICRWZiwgNDY6ICRWZywgNTQ6ICRWaCwgNzI6ICRWaSwgNzQ6ICRWaiwgNzc6ICRWaywgODk6ICRWbCwgOTA6ICRWbSB9LCB7IDQ6IDE3LCA1OiAkVjUsIDc6IDQ5LCA4OiAkVjYsIDk6ICRWMSwgMTE6ICRWMiwgMTM6ICRWMywgMTQ6IDE0LCAxNTogMTUsIDE2OiAxNiwgMTc6IDE4LCAxODogMTksIDE5OiAyMCwgMjA6IDIxLCAyMTogJFY3LCAyMjogJFY4LCAyMzogJFY5LCAyNDogJFZhLCAyNTogMjMsIDMzOiAyNSwgNDE6ICRWYiwgNDI6ICRWYywgNDM6ICRWZCwgNDQ6ICRWZSwgNDU6ICRWZiwgNDY6ICRWZywgNTQ6ICRWaCwgNzI6ICRWaSwgNzQ6ICRWaiwgNzc6ICRWaywgODk6ICRWbCwgOTA6ICRWbSB9LCB7IDQ6IDE3LCA1OiAkVjUsIDc6IDUwLCA4OiAkVjYsIDk6ICRWMSwgMTE6ICRWMiwgMTM6ICRWMywgMTQ6IDE0LCAxNTogMTUsIDE2OiAxNiwgMTc6IDE4LCAxODogMTksIDE5OiAyMCwgMjA6IDIxLCAyMTogJFY3LCAyMjogJFY4LCAyMzogJFY5LCAyNDogJFZhLCAyNTogMjMsIDMzOiAyNSwgNDE6ICRWYiwgNDI6ICRWYywgNDM6ICRWZCwgNDQ6ICRWZSwgNDU6ICRWZiwgNDY6ICRWZywgNTQ6ICRWaCwgNzI6ICRWaSwgNzQ6ICRWaiwgNzc6ICRWaywgODk6ICRWbCwgOTA6ICRWbSB9LCB7IDI2OiA1MSwgODk6IFsxLCA1Ml0sIDkwOiBbMSwgNTNdIH0sIHsgNTU6IDU0LCA4OTogWzEsIDU1XSwgOTA6IFsxLCA1Nl0gfSwgeyAyOTogWzEsIDU5XSwgNjE6IFsxLCA1N10sIDYzOiBbMSwgNThdIH0sIG8oJFZuLCBbMiwgMTddKSwgbygkVm4sIFsyLCAxOF0pLCBvKCRWbiwgWzIsIDE5XSksIG8oJFZuLCBbMiwgMjBdKSwgeyAzMDogNjAsIDMzOiA2MiwgNzU6ICRWbywgODk6ICRWbCwgOTA6ICRWbSB9LCB7IDMwOiA2MywgMzM6IDYyLCA3NTogJFZvLCA4OTogJFZsLCA5MDogJFZtIH0sIHsgMzA6IDY0LCAzMzogNjIsIDc1OiAkVm8sIDg5OiAkVmwsIDkwOiAkVm0gfSwgbygkVnAsIFsyLCAyOV0pLCBvKCRWcCwgWzIsIDMwXSksIG8oJFZwLCBbMiwgMzFdKSwgbygkVnAsIFsyLCAzMl0pLCBvKCRWcCwgWzIsIDMzXSksIG8oJFZwLCBbMiwgMzRdKSwgbygkVnEsIFsyLCA4MV0pLCBvKCRWcSwgWzIsIDgyXSksIHsgMTogWzIsIDNdIH0sIHsgODogWzIsIDhdIH0sIHsgODogWzIsIDldIH0sIHsgODogWzIsIDEwXSB9LCB7IDg6IFsyLCAxMV0gfSwgeyA4OiBbMiwgMTJdIH0sIHsgODogWzIsIDEzXSB9LCB7IDg6IFsyLCAxNF0gfSwgeyA4OiBbMiwgMTVdIH0sIHsgODogWzIsIDE2XSB9LCB7IDI3OiBbMSwgNjVdLCAyOTogWzEsIDY2XSB9LCBvKCRWciwgWzIsIDc5XSksIG8oJFZyLCBbMiwgODBdKSwgeyAyNzogWzEsIDY3XSwgMjk6IFsxLCA2OF0gfSwgbygkVnIsIFsyLCA4NV0pLCBvKCRWciwgWzIsIDg2XSksIHsgNjI6IDY5LCA2NTogJFZzLCA2NjogJFZ0LCA2NzogJFZ1LCA2ODogJFZ2LCA2OTogJFZ3LCA3MDogJFZ4LCA3MTogJFZ5IH0sIHsgNjI6IDc3LCA2NTogJFZzLCA2NjogJFZ0LCA2NzogJFZ1LCA2ODogJFZ2LCA2OTogJFZ3LCA3MDogJFZ4LCA3MTogJFZ5IH0sIHsgMzA6IDc4LCAzMzogNjIsIDc1OiAkVm8sIDg5OiAkVmwsIDkwOiAkVm0gfSwgeyA3MzogNzksIDc1OiAkVnosIDc2OiAkVkEsIDc4OiA4MSwgNzk6IDgyLCA4MDogJFZCLCA4MTogJFZDLCA4MjogJFZELCA4MzogJFZFLCA4NDogJFZGLCA4NTogJFZHLCA4NjogJFZILCA4NzogJFZJLCA4ODogJFZKIH0sIG8oJFZLLCBbMiwgNjBdKSwgbygkVkssIFsyLCA2Ml0pLCB7IDczOiA5MywgNzU6ICRWeiwgNzY6ICRWQSwgNzg6IDgxLCA3OTogODIsIDgwOiAkVkIsIDgxOiAkVkMsIDgyOiAkVkQsIDgzOiAkVkUsIDg0OiAkVkYsIDg1OiAkVkcsIDg2OiAkVkgsIDg3OiAkVkksIDg4OiAkVkogfSwgeyAzMDogOTQsIDMzOiA2MiwgNzU6ICRWbywgNzY6ICRWQSwgODk6ICRWbCwgOTA6ICRWbSB9LCB7IDU6IFsxLCA5NV0gfSwgeyAzMDogOTYsIDMzOiA2MiwgNzU6ICRWbywgODk6ICRWbCwgOTA6ICRWbSB9LCB7IDU6IFsxLCA5N10gfSwgeyAzMDogOTgsIDMzOiA2MiwgNzU6ICRWbywgODk6ICRWbCwgOTA6ICRWbSB9LCB7IDYzOiBbMSwgOTldIH0sIG8oJFZMLCBbMiwgNTBdKSwgbygkVkwsIFsyLCA1MV0pLCBvKCRWTCwgWzIsIDUyXSksIG8oJFZMLCBbMiwgNTNdKSwgbygkVkwsIFsyLCA1NF0pLCBvKCRWTCwgWzIsIDU1XSksIG8oJFZMLCBbMiwgNTZdKSwgeyA2NDogWzEsIDEwMF0gfSwgbygkVm4sIFsyLCA1OV0sIHsgNzY6ICRWQSB9KSwgbygkVm4sIFsyLCA2NF0sIHsgNzY6ICRWTSB9KSwgeyAzMzogMTAzLCA3NTogWzEsIDEwMl0sIDg5OiAkVmwsIDkwOiAkVm0gfSwgbygkVk4sIFsyLCA2NV0sIHsgNzk6IDEwNCwgNzU6ICRWeiwgODA6ICRWQiwgODE6ICRWQywgODI6ICRWRCwgODM6ICRWRSwgODQ6ICRWRiwgODU6ICRWRywgODY6ICRWSCwgODc6ICRWSSwgODg6ICRWSiB9KSwgbygkVk8sIFsyLCA2N10pLCBvKCRWTywgWzIsIDY5XSksIG8oJFZPLCBbMiwgNzBdKSwgbygkVk8sIFsyLCA3MV0pLCBvKCRWTywgWzIsIDcyXSksIG8oJFZPLCBbMiwgNzNdKSwgbygkVk8sIFsyLCA3NF0pLCBvKCRWTywgWzIsIDc1XSksIG8oJFZPLCBbMiwgNzZdKSwgbygkVk8sIFsyLCA3N10pLCBvKCRWTywgWzIsIDc4XSksIG8oJFZuLCBbMiwgNTddLCB7IDc2OiAkVk0gfSksIG8oJFZuLCBbMiwgNThdLCB7IDc2OiAkVkEgfSksIHsgNTogJFZQLCAyODogMTA1LCAzMTogJFZRLCAzNDogJFZSLCAzNjogJFZTLCAzODogJFZULCA0MDogJFZVIH0sIHsgMjc6IFsxLCAxMTJdLCA3NjogJFZBIH0sIHsgNTogJFZWLCA0MDogJFZXLCA1NjogMTEzLCA1NzogJFZYLCA1OTogJFZZIH0sIHsgMjc6IFsxLCAxMThdLCA3NjogJFZBIH0sIHsgMzM6IDExOSwgODk6ICRWbCwgOTA6ICRWbSB9LCB7IDMzOiAxMjAsIDg5OiAkVmwsIDkwOiAkVm0gfSwgeyA3NTogJFZ6LCA3ODogMTIxLCA3OTogODIsIDgwOiAkVkIsIDgxOiAkVkMsIDgyOiAkVkQsIDgzOiAkVkUsIDg0OiAkVkYsIDg1OiAkVkcsIDg2OiAkVkgsIDg3OiAkVkksIDg4OiAkVkogfSwgbygkVkssIFsyLCA2MV0pLCBvKCRWSywgWzIsIDYzXSksIG8oJFZPLCBbMiwgNjhdKSwgbygkVm4sIFsyLCAyMV0pLCB7IDMyOiBbMSwgMTIyXSB9LCB7IDMyOiBbMSwgMTIzXSB9LCB7IDMyOiBbMSwgMTI0XSB9LCB7IDMyOiBbMSwgMTI1XSB9LCB7IDU6ICRWUCwgMjg6IDEyNiwgMzE6ICRWUSwgMzQ6ICRWUiwgMzY6ICRWUywgMzg6ICRWVCwgNDA6ICRWVSB9LCBvKCRWbiwgWzIsIDI4XSksIHsgNTogWzEsIDEyN10gfSwgbygkVm4sIFsyLCA0Ml0pLCB7IDMyOiBbMSwgMTI4XSB9LCB7IDMyOiBbMSwgMTI5XSB9LCB7IDU6ICRWViwgNDA6ICRWVywgNTY6IDEzMCwgNTc6ICRWWCwgNTk6ICRWWSB9LCBvKCRWbiwgWzIsIDQ3XSksIHsgNTogWzEsIDEzMV0gfSwgbygkVm4sIFsyLCA0OF0pLCBvKCRWbiwgWzIsIDQ5XSksIG8oJFZOLCBbMiwgNjZdLCB7IDc5OiAxMDQsIDc1OiAkVnosIDgwOiAkVkIsIDgxOiAkVkMsIDgyOiAkVkQsIDgzOiAkVkUsIDg0OiAkVkYsIDg1OiAkVkcsIDg2OiAkVkgsIDg3OiAkVkksIDg4OiAkVkogfSksIHsgMzM6IDEzMiwgODk6ICRWbCwgOTA6ICRWbSB9LCB7IDM1OiAxMzMsIDg5OiBbMSwgMTM0XSwgOTA6IFsxLCAxMzVdIH0sIHsgMzc6IDEzNiwgNDc6IFsxLCAxMzddLCA0ODogWzEsIDEzOF0sIDQ5OiBbMSwgMTM5XSB9LCB7IDM5OiAxNDAsIDUwOiBbMSwgMTQxXSwgNTE6IFsxLCAxNDJdLCA1MjogWzEsIDE0M10sIDUzOiBbMSwgMTQ0XSB9LCBvKCRWbiwgWzIsIDI3XSksIHsgNTogJFZQLCAyODogMTQ1LCAzMTogJFZRLCAzNDogJFZSLCAzNjogJFZTLCAzODogJFZULCA0MDogJFZVIH0sIHsgNTg6IDE0NiwgODk6IFsxLCAxNDddLCA5MDogWzEsIDE0OF0gfSwgeyA2MDogMTQ5LCA4OTogWzEsIDE1MF0sIDkwOiBbMSwgMTUxXSB9LCBvKCRWbiwgWzIsIDQ2XSksIHsgNTogJFZWLCA0MDogJFZXLCA1NjogMTUyLCA1NzogJFZYLCA1OTogJFZZIH0sIHsgNTogWzEsIDE1M10gfSwgeyA1OiBbMSwgMTU0XSB9LCB7IDU6IFsyLCA4M10gfSwgeyA1OiBbMiwgODRdIH0sIHsgNTogWzEsIDE1NV0gfSwgeyA1OiBbMiwgMzVdIH0sIHsgNTogWzIsIDM2XSB9LCB7IDU6IFsyLCAzN10gfSwgeyA1OiBbMSwgMTU2XSB9LCB7IDU6IFsyLCAzOF0gfSwgeyA1OiBbMiwgMzldIH0sIHsgNTogWzIsIDQwXSB9LCB7IDU6IFsyLCA0MV0gfSwgbygkVm4sIFsyLCAyMl0pLCB7IDU6IFsxLCAxNTddIH0sIHsgNTogWzIsIDg3XSB9LCB7IDU6IFsyLCA4OF0gfSwgeyA1OiBbMSwgMTU4XSB9LCB7IDU6IFsyLCA4OV0gfSwgeyA1OiBbMiwgOTBdIH0sIG8oJFZuLCBbMiwgNDNdKSwgeyA1OiAkVlAsIDI4OiAxNTksIDMxOiAkVlEsIDM0OiAkVlIsIDM2OiAkVlMsIDM4OiAkVlQsIDQwOiAkVlUgfSwgeyA1OiAkVlAsIDI4OiAxNjAsIDMxOiAkVlEsIDM0OiAkVlIsIDM2OiAkVlMsIDM4OiAkVlQsIDQwOiAkVlUgfSwgeyA1OiAkVlAsIDI4OiAxNjEsIDMxOiAkVlEsIDM0OiAkVlIsIDM2OiAkVlMsIDM4OiAkVlQsIDQwOiAkVlUgfSwgeyA1OiAkVlAsIDI4OiAxNjIsIDMxOiAkVlEsIDM0OiAkVlIsIDM2OiAkVlMsIDM4OiAkVlQsIDQwOiAkVlUgfSwgeyA1OiAkVlYsIDQwOiAkVlcsIDU2OiAxNjMsIDU3OiAkVlgsIDU5OiAkVlkgfSwgeyA1OiAkVlYsIDQwOiAkVlcsIDU2OiAxNjQsIDU3OiAkVlgsIDU5OiAkVlkgfSwgbygkVm4sIFsyLCAyM10pLCBvKCRWbiwgWzIsIDI0XSksIG8oJFZuLCBbMiwgMjVdKSwgbygkVm4sIFsyLCAyNl0pLCBvKCRWbiwgWzIsIDQ0XSksIG8oJFZuLCBbMiwgNDVdKV0sXG4gICAgZGVmYXVsdEFjdGlvbnM6IHsgODogWzIsIDJdLCAxMjogWzIsIDFdLCA0MTogWzIsIDNdLCA0MjogWzIsIDhdLCA0MzogWzIsIDldLCA0NDogWzIsIDEwXSwgNDU6IFsyLCAxMV0sIDQ2OiBbMiwgMTJdLCA0NzogWzIsIDEzXSwgNDg6IFsyLCAxNF0sIDQ5OiBbMiwgMTVdLCA1MDogWzIsIDE2XSwgMTM0OiBbMiwgODNdLCAxMzU6IFsyLCA4NF0sIDEzNzogWzIsIDM1XSwgMTM4OiBbMiwgMzZdLCAxMzk6IFsyLCAzN10sIDE0MTogWzIsIDM4XSwgMTQyOiBbMiwgMzldLCAxNDM6IFsyLCA0MF0sIDE0NDogWzIsIDQxXSwgMTQ3OiBbMiwgODddLCAxNDg6IFsyLCA4OF0sIDE1MDogWzIsIDg5XSwgMTUxOiBbMiwgOTBdIH0sXG4gICAgcGFyc2VFcnJvcjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwYXJzZUVycm9yKHN0ciwgaGFzaCkge1xuICAgICAgaWYgKGhhc2gucmVjb3ZlcmFibGUpIHtcbiAgICAgICAgdGhpcy50cmFjZShzdHIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKHN0cik7XG4gICAgICAgIGVycm9yLmhhc2ggPSBoYXNoO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LCBcInBhcnNlRXJyb3JcIiksXG4gICAgcGFyc2U6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcGFyc2UoaW5wdXQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcywgc3RhY2sgPSBbMF0sIHRzdGFjayA9IFtdLCB2c3RhY2sgPSBbbnVsbF0sIGxzdGFjayA9IFtdLCB0YWJsZSA9IHRoaXMudGFibGUsIHl5dGV4dCA9IFwiXCIsIHl5bGluZW5vID0gMCwgeXlsZW5nID0gMCwgcmVjb3ZlcmluZyA9IDAsIFRFUlJPUiA9IDIsIEVPRiA9IDE7XG4gICAgICB2YXIgYXJncyA9IGxzdGFjay5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICB2YXIgbGV4ZXIyID0gT2JqZWN0LmNyZWF0ZSh0aGlzLmxleGVyKTtcbiAgICAgIHZhciBzaGFyZWRTdGF0ZSA9IHsgeXk6IHt9IH07XG4gICAgICBmb3IgKHZhciBrIGluIHRoaXMueXkpIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnl5LCBrKSkge1xuICAgICAgICAgIHNoYXJlZFN0YXRlLnl5W2tdID0gdGhpcy55eVtrXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGV4ZXIyLnNldElucHV0KGlucHV0LCBzaGFyZWRTdGF0ZS55eSk7XG4gICAgICBzaGFyZWRTdGF0ZS55eS5sZXhlciA9IGxleGVyMjtcbiAgICAgIHNoYXJlZFN0YXRlLnl5LnBhcnNlciA9IHRoaXM7XG4gICAgICBpZiAodHlwZW9mIGxleGVyMi55eWxsb2MgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBsZXhlcjIueXlsbG9jID0ge307XG4gICAgICB9XG4gICAgICB2YXIgeXlsb2MgPSBsZXhlcjIueXlsbG9jO1xuICAgICAgbHN0YWNrLnB1c2goeXlsb2MpO1xuICAgICAgdmFyIHJhbmdlcyA9IGxleGVyMi5vcHRpb25zICYmIGxleGVyMi5vcHRpb25zLnJhbmdlcztcbiAgICAgIGlmICh0eXBlb2Ygc2hhcmVkU3RhdGUueXkucGFyc2VFcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRoaXMucGFyc2VFcnJvciA9IHNoYXJlZFN0YXRlLnl5LnBhcnNlRXJyb3I7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBhcnNlRXJyb3IgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykucGFyc2VFcnJvcjtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHBvcFN0YWNrKG4pIHtcbiAgICAgICAgc3RhY2subGVuZ3RoID0gc3RhY2subGVuZ3RoIC0gMiAqIG47XG4gICAgICAgIHZzdGFjay5sZW5ndGggPSB2c3RhY2subGVuZ3RoIC0gbjtcbiAgICAgICAgbHN0YWNrLmxlbmd0aCA9IGxzdGFjay5sZW5ndGggLSBuO1xuICAgICAgfVxuICAgICAgX19uYW1lKHBvcFN0YWNrLCBcInBvcFN0YWNrXCIpO1xuICAgICAgZnVuY3Rpb24gbGV4KCkge1xuICAgICAgICB2YXIgdG9rZW47XG4gICAgICAgIHRva2VuID0gdHN0YWNrLnBvcCgpIHx8IGxleGVyMi5sZXgoKSB8fCBFT0Y7XG4gICAgICAgIGlmICh0eXBlb2YgdG9rZW4gIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICBpZiAodG9rZW4gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgdHN0YWNrID0gdG9rZW47XG4gICAgICAgICAgICB0b2tlbiA9IHRzdGFjay5wb3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdG9rZW4gPSBzZWxmLnN5bWJvbHNfW3Rva2VuXSB8fCB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICB9XG4gICAgICBfX25hbWUobGV4LCBcImxleFwiKTtcbiAgICAgIHZhciBzeW1ib2wsIHByZUVycm9yU3ltYm9sLCBzdGF0ZSwgYWN0aW9uLCBhLCByLCB5eXZhbCA9IHt9LCBwLCBsZW4sIG5ld1N0YXRlLCBleHBlY3RlZDtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHN0YXRlID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRBY3Rpb25zW3N0YXRlXSkge1xuICAgICAgICAgIGFjdGlvbiA9IHRoaXMuZGVmYXVsdEFjdGlvbnNbc3RhdGVdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChzeW1ib2wgPT09IG51bGwgfHwgdHlwZW9mIHN5bWJvbCA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBzeW1ib2wgPSBsZXgoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aW9uID0gdGFibGVbc3RhdGVdICYmIHRhYmxlW3N0YXRlXVtzeW1ib2xdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgYWN0aW9uID09PSBcInVuZGVmaW5lZFwiIHx8ICFhY3Rpb24ubGVuZ3RoIHx8ICFhY3Rpb25bMF0pIHtcbiAgICAgICAgICB2YXIgZXJyU3RyID0gXCJcIjtcbiAgICAgICAgICBleHBlY3RlZCA9IFtdO1xuICAgICAgICAgIGZvciAocCBpbiB0YWJsZVtzdGF0ZV0pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRlcm1pbmFsc19bcF0gJiYgcCA+IFRFUlJPUikge1xuICAgICAgICAgICAgICBleHBlY3RlZC5wdXNoKFwiJ1wiICsgdGhpcy50ZXJtaW5hbHNfW3BdICsgXCInXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobGV4ZXIyLnNob3dQb3NpdGlvbikge1xuICAgICAgICAgICAgZXJyU3RyID0gXCJQYXJzZSBlcnJvciBvbiBsaW5lIFwiICsgKHl5bGluZW5vICsgMSkgKyBcIjpcXG5cIiArIGxleGVyMi5zaG93UG9zaXRpb24oKSArIFwiXFxuRXhwZWN0aW5nIFwiICsgZXhwZWN0ZWQuam9pbihcIiwgXCIpICsgXCIsIGdvdCAnXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlcnJTdHIgPSBcIlBhcnNlIGVycm9yIG9uIGxpbmUgXCIgKyAoeXlsaW5lbm8gKyAxKSArIFwiOiBVbmV4cGVjdGVkIFwiICsgKHN5bWJvbCA9PSBFT0YgPyBcImVuZCBvZiBpbnB1dFwiIDogXCInXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wYXJzZUVycm9yKGVyclN0ciwge1xuICAgICAgICAgICAgdGV4dDogbGV4ZXIyLm1hdGNoLFxuICAgICAgICAgICAgdG9rZW46IHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCxcbiAgICAgICAgICAgIGxpbmU6IGxleGVyMi55eWxpbmVubyxcbiAgICAgICAgICAgIGxvYzogeXlsb2MsXG4gICAgICAgICAgICBleHBlY3RlZFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhY3Rpb25bMF0gaW5zdGFuY2VvZiBBcnJheSAmJiBhY3Rpb24ubGVuZ3RoID4gMSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcnNlIEVycm9yOiBtdWx0aXBsZSBhY3Rpb25zIHBvc3NpYmxlIGF0IHN0YXRlOiBcIiArIHN0YXRlICsgXCIsIHRva2VuOiBcIiArIHN5bWJvbCk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChhY3Rpb25bMF0pIHtcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBzdGFjay5wdXNoKHN5bWJvbCk7XG4gICAgICAgICAgICB2c3RhY2sucHVzaChsZXhlcjIueXl0ZXh0KTtcbiAgICAgICAgICAgIGxzdGFjay5wdXNoKGxleGVyMi55eWxsb2MpO1xuICAgICAgICAgICAgc3RhY2sucHVzaChhY3Rpb25bMV0pO1xuICAgICAgICAgICAgc3ltYm9sID0gbnVsbDtcbiAgICAgICAgICAgIGlmICghcHJlRXJyb3JTeW1ib2wpIHtcbiAgICAgICAgICAgICAgeXlsZW5nID0gbGV4ZXIyLnl5bGVuZztcbiAgICAgICAgICAgICAgeXl0ZXh0ID0gbGV4ZXIyLnl5dGV4dDtcbiAgICAgICAgICAgICAgeXlsaW5lbm8gPSBsZXhlcjIueXlsaW5lbm87XG4gICAgICAgICAgICAgIHl5bG9jID0gbGV4ZXIyLnl5bGxvYztcbiAgICAgICAgICAgICAgaWYgKHJlY292ZXJpbmcgPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVjb3ZlcmluZy0tO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzeW1ib2wgPSBwcmVFcnJvclN5bWJvbDtcbiAgICAgICAgICAgICAgcHJlRXJyb3JTeW1ib2wgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgbGVuID0gdGhpcy5wcm9kdWN0aW9uc19bYWN0aW9uWzFdXVsxXTtcbiAgICAgICAgICAgIHl5dmFsLiQgPSB2c3RhY2tbdnN0YWNrLmxlbmd0aCAtIGxlbl07XG4gICAgICAgICAgICB5eXZhbC5fJCA9IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5maXJzdF9saW5lLFxuICAgICAgICAgICAgICBsYXN0X2xpbmU6IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gMV0ubGFzdF9saW5lLFxuICAgICAgICAgICAgICBmaXJzdF9jb2x1bW46IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0uZmlyc3RfY29sdW1uLFxuICAgICAgICAgICAgICBsYXN0X2NvbHVtbjogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAxXS5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChyYW5nZXMpIHtcbiAgICAgICAgICAgICAgeXl2YWwuXyQucmFuZ2UgPSBbXG4gICAgICAgICAgICAgICAgbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5yYW5nZVswXSxcbiAgICAgICAgICAgICAgICBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIDFdLnJhbmdlWzFdXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByID0gdGhpcy5wZXJmb3JtQWN0aW9uLmFwcGx5KHl5dmFsLCBbXG4gICAgICAgICAgICAgIHl5dGV4dCxcbiAgICAgICAgICAgICAgeXlsZW5nLFxuICAgICAgICAgICAgICB5eWxpbmVubyxcbiAgICAgICAgICAgICAgc2hhcmVkU3RhdGUueXksXG4gICAgICAgICAgICAgIGFjdGlvblsxXSxcbiAgICAgICAgICAgICAgdnN0YWNrLFxuICAgICAgICAgICAgICBsc3RhY2tcbiAgICAgICAgICAgIF0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsZW4pIHtcbiAgICAgICAgICAgICAgc3RhY2sgPSBzdGFjay5zbGljZSgwLCAtMSAqIGxlbiAqIDIpO1xuICAgICAgICAgICAgICB2c3RhY2sgPSB2c3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgICBsc3RhY2sgPSBsc3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhY2sucHVzaCh0aGlzLnByb2R1Y3Rpb25zX1thY3Rpb25bMV1dWzBdKTtcbiAgICAgICAgICAgIHZzdGFjay5wdXNoKHl5dmFsLiQpO1xuICAgICAgICAgICAgbHN0YWNrLnB1c2goeXl2YWwuXyQpO1xuICAgICAgICAgICAgbmV3U3RhdGUgPSB0YWJsZVtzdGFja1tzdGFjay5sZW5ndGggLSAyXV1bc3RhY2tbc3RhY2subGVuZ3RoIC0gMV1dO1xuICAgICAgICAgICAgc3RhY2sucHVzaChuZXdTdGF0ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSwgXCJwYXJzZVwiKVxuICB9O1xuICB2YXIgbGV4ZXIgPSAvKiBAX19QVVJFX18gKi8gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZXhlcjIgPSB7XG4gICAgICBFT0Y6IDEsXG4gICAgICBwYXJzZUVycm9yOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBhcnNlRXJyb3Ioc3RyLCBoYXNoKSB7XG4gICAgICAgIGlmICh0aGlzLnl5LnBhcnNlcikge1xuICAgICAgICAgIHRoaXMueXkucGFyc2VyLnBhcnNlRXJyb3Ioc3RyLCBoYXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3RyKTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwYXJzZUVycm9yXCIpLFxuICAgICAgLy8gcmVzZXRzIHRoZSBsZXhlciwgc2V0cyBuZXcgaW5wdXRcbiAgICAgIHNldElucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGlucHV0LCB5eSkge1xuICAgICAgICB0aGlzLnl5ID0geXkgfHwgdGhpcy55eSB8fCB7fTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBpbnB1dDtcbiAgICAgICAgdGhpcy5fbW9yZSA9IHRoaXMuX2JhY2t0cmFjayA9IHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnl5bGluZW5vID0gdGhpcy55eWxlbmcgPSAwO1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2ggPSBcIlwiO1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrID0gW1wiSU5JVElBTFwiXTtcbiAgICAgICAgdGhpcy55eWxsb2MgPSB7XG4gICAgICAgICAgZmlyc3RfbGluZTogMSxcbiAgICAgICAgICBmaXJzdF9jb2x1bW46IDAsXG4gICAgICAgICAgbGFzdF9saW5lOiAxLFxuICAgICAgICAgIGxhc3RfY29sdW1uOiAwXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2UgPSBbMCwgMF07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vZmZzZXQgPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwic2V0SW5wdXRcIiksXG4gICAgICAvLyBjb25zdW1lcyBhbmQgcmV0dXJucyBvbmUgY2hhciBmcm9tIHRoZSBpbnB1dFxuICAgICAgaW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjaCA9IHRoaXMuX2lucHV0WzBdO1xuICAgICAgICB0aGlzLnl5dGV4dCArPSBjaDtcbiAgICAgICAgdGhpcy55eWxlbmcrKztcbiAgICAgICAgdGhpcy5vZmZzZXQrKztcbiAgICAgICAgdGhpcy5tYXRjaCArPSBjaDtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IGNoO1xuICAgICAgICB2YXIgbGluZXMgPSBjaC5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8rKztcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2xpbmUrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtbisrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2VbMV0rKztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pbnB1dCA9IHRoaXMuX2lucHV0LnNsaWNlKDEpO1xuICAgICAgICByZXR1cm4gY2g7XG4gICAgICB9LCBcImlucHV0XCIpLFxuICAgICAgLy8gdW5zaGlmdHMgb25lIGNoYXIgKG9yIGEgc3RyaW5nKSBpbnRvIHRoZSBpbnB1dFxuICAgICAgdW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oY2gpIHtcbiAgICAgICAgdmFyIGxlbiA9IGNoLmxlbmd0aDtcbiAgICAgICAgdmFyIGxpbmVzID0gY2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBjaCArIHRoaXMuX2lucHV0O1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMueXl0ZXh0LnN1YnN0cigwLCB0aGlzLnl5dGV4dC5sZW5ndGggLSBsZW4pO1xuICAgICAgICB0aGlzLm9mZnNldCAtPSBsZW47XG4gICAgICAgIHZhciBvbGRMaW5lcyA9IHRoaXMubWF0Y2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5tYXRjaCA9IHRoaXMubWF0Y2guc3Vic3RyKDAsIHRoaXMubWF0Y2gubGVuZ3RoIC0gMSk7XG4gICAgICAgIHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2hlZC5zdWJzdHIoMCwgdGhpcy5tYXRjaGVkLmxlbmd0aCAtIDEpO1xuICAgICAgICBpZiAobGluZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gLT0gbGluZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgciA9IHRoaXMueXlsbG9jLnJhbmdlO1xuICAgICAgICB0aGlzLnl5bGxvYyA9IHtcbiAgICAgICAgICBmaXJzdF9saW5lOiB0aGlzLnl5bGxvYy5maXJzdF9saW5lLFxuICAgICAgICAgIGxhc3RfbGluZTogdGhpcy55eWxpbmVubyArIDEsXG4gICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gKGxpbmVzLmxlbmd0aCA9PT0gb2xkTGluZXMubGVuZ3RoID8gdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uIDogMCkgKyBvbGRMaW5lc1tvbGRMaW5lcy5sZW5ndGggLSBsaW5lcy5sZW5ndGhdLmxlbmd0aCAtIGxpbmVzWzBdLmxlbmd0aCA6IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbiAtIGxlblxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlID0gW3JbMF0sIHJbMF0gKyB0aGlzLnl5bGVuZyAtIGxlbl07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy55eWxlbmcgPSB0aGlzLnl5dGV4dC5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJ1bnB1dFwiKSxcbiAgICAgIC8vIFdoZW4gY2FsbGVkIGZyb20gYWN0aW9uLCBjYWNoZXMgbWF0Y2hlZCB0ZXh0IGFuZCBhcHBlbmRzIGl0IG9uIG5leHQgYWN0aW9uXG4gICAgICBtb3JlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9tb3JlID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcIm1vcmVcIiksXG4gICAgICAvLyBXaGVuIGNhbGxlZCBmcm9tIGFjdGlvbiwgc2lnbmFscyB0aGUgbGV4ZXIgdGhhdCB0aGlzIHJ1bGUgZmFpbHMgdG8gbWF0Y2ggdGhlIGlucHV0LCBzbyB0aGUgbmV4dCBtYXRjaGluZyBydWxlIChyZWdleCkgc2hvdWxkIGJlIHRlc3RlZCBpbnN0ZWFkLlxuICAgICAgcmVqZWN0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2t0cmFja19sZXhlcikge1xuICAgICAgICAgIHRoaXMuX2JhY2t0cmFjayA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gWW91IGNhbiBvbmx5IGludm9rZSByZWplY3QoKSBpbiB0aGUgbGV4ZXIgd2hlbiB0aGUgbGV4ZXIgaXMgb2YgdGhlIGJhY2t0cmFja2luZyBwZXJzdWFzaW9uIChvcHRpb25zLmJhY2t0cmFja19sZXhlciA9IHRydWUpLlxcblwiICsgdGhpcy5zaG93UG9zaXRpb24oKSwge1xuICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgIHRva2VuOiBudWxsLFxuICAgICAgICAgICAgbGluZTogdGhpcy55eWxpbmVub1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJyZWplY3RcIiksXG4gICAgICAvLyByZXRhaW4gZmlyc3QgbiBjaGFyYWN0ZXJzIG9mIHRoZSBtYXRjaFxuICAgICAgbGVzczogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihuKSB7XG4gICAgICAgIHRoaXMudW5wdXQodGhpcy5tYXRjaC5zbGljZShuKSk7XG4gICAgICB9LCBcImxlc3NcIiksXG4gICAgICAvLyBkaXNwbGF5cyBhbHJlYWR5IG1hdGNoZWQgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICBwYXN0SW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwYXN0ID0gdGhpcy5tYXRjaGVkLnN1YnN0cigwLCB0aGlzLm1hdGNoZWQubGVuZ3RoIC0gdGhpcy5tYXRjaC5sZW5ndGgpO1xuICAgICAgICByZXR1cm4gKHBhc3QubGVuZ3RoID4gMjAgPyBcIi4uLlwiIDogXCJcIikgKyBwYXN0LnN1YnN0cigtMjApLnJlcGxhY2UoL1xcbi9nLCBcIlwiKTtcbiAgICAgIH0sIFwicGFzdElucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdXBjb21pbmcgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICB1cGNvbWluZ0lucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV4dCA9IHRoaXMubWF0Y2g7XG4gICAgICAgIGlmIChuZXh0Lmxlbmd0aCA8IDIwKSB7XG4gICAgICAgICAgbmV4dCArPSB0aGlzLl9pbnB1dC5zdWJzdHIoMCwgMjAgLSBuZXh0Lmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChuZXh0LnN1YnN0cigwLCAyMCkgKyAobmV4dC5sZW5ndGggPiAyMCA/IFwiLi4uXCIgOiBcIlwiKSkucmVwbGFjZSgvXFxuL2csIFwiXCIpO1xuICAgICAgfSwgXCJ1cGNvbWluZ0lucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdGhlIGNoYXJhY3RlciBwb3NpdGlvbiB3aGVyZSB0aGUgbGV4aW5nIGVycm9yIG9jY3VycmVkLCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgc2hvd1Bvc2l0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJlID0gdGhpcy5wYXN0SW5wdXQoKTtcbiAgICAgICAgdmFyIGMgPSBuZXcgQXJyYXkocHJlLmxlbmd0aCArIDEpLmpvaW4oXCItXCIpO1xuICAgICAgICByZXR1cm4gcHJlICsgdGhpcy51cGNvbWluZ0lucHV0KCkgKyBcIlxcblwiICsgYyArIFwiXlwiO1xuICAgICAgfSwgXCJzaG93UG9zaXRpb25cIiksXG4gICAgICAvLyB0ZXN0IHRoZSBsZXhlZCB0b2tlbjogcmV0dXJuIEZBTFNFIHdoZW4gbm90IGEgbWF0Y2gsIG90aGVyd2lzZSByZXR1cm4gdG9rZW5cbiAgICAgIHRlc3RfbWF0Y2g6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obWF0Y2gsIGluZGV4ZWRfcnVsZSkge1xuICAgICAgICB2YXIgdG9rZW4sIGxpbmVzLCBiYWNrdXA7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFja3RyYWNrX2xleGVyKSB7XG4gICAgICAgICAgYmFja3VwID0ge1xuICAgICAgICAgICAgeXlsaW5lbm86IHRoaXMueXlsaW5lbm8sXG4gICAgICAgICAgICB5eWxsb2M6IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogdGhpcy55eWxsb2MuZmlyc3RfbGluZSxcbiAgICAgICAgICAgICAgbGFzdF9saW5lOiB0aGlzLmxhc3RfbGluZSxcbiAgICAgICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgICAgIGxhc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHl5dGV4dDogdGhpcy55eXRleHQsXG4gICAgICAgICAgICBtYXRjaDogdGhpcy5tYXRjaCxcbiAgICAgICAgICAgIG1hdGNoZXM6IHRoaXMubWF0Y2hlcyxcbiAgICAgICAgICAgIG1hdGNoZWQ6IHRoaXMubWF0Y2hlZCxcbiAgICAgICAgICAgIHl5bGVuZzogdGhpcy55eWxlbmcsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgX21vcmU6IHRoaXMuX21vcmUsXG4gICAgICAgICAgICBfaW5wdXQ6IHRoaXMuX2lucHV0LFxuICAgICAgICAgICAgeXk6IHRoaXMueXksXG4gICAgICAgICAgICBjb25kaXRpb25TdGFjazogdGhpcy5jb25kaXRpb25TdGFjay5zbGljZSgwKSxcbiAgICAgICAgICAgIGRvbmU6IHRoaXMuZG9uZVxuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICAgIGJhY2t1cC55eWxsb2MucmFuZ2UgPSB0aGlzLnl5bGxvYy5yYW5nZS5zbGljZSgwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMgPSBtYXRjaFswXS5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gKz0gbGluZXMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueXlsbG9jID0ge1xuICAgICAgICAgIGZpcnN0X2xpbmU6IHRoaXMueXlsbG9jLmxhc3RfbGluZSxcbiAgICAgICAgICBsYXN0X2xpbmU6IHRoaXMueXlsaW5lbm8gKyAxLFxuICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubGVuZ3RoIC0gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubWF0Y2goL1xccj9cXG4/LylbMF0ubGVuZ3RoIDogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4gKyBtYXRjaFswXS5sZW5ndGhcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy55eXRleHQgKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2ggKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2hlcyA9IG1hdGNoO1xuICAgICAgICB0aGlzLnl5bGVuZyA9IHRoaXMueXl0ZXh0Lmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZSA9IFt0aGlzLm9mZnNldCwgdGhpcy5vZmZzZXQgKz0gdGhpcy55eWxlbmddO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX21vcmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fYmFja3RyYWNrID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2lucHV0ID0gdGhpcy5faW5wdXQuc2xpY2UobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IG1hdGNoWzBdO1xuICAgICAgICB0b2tlbiA9IHRoaXMucGVyZm9ybUFjdGlvbi5jYWxsKHRoaXMsIHRoaXMueXksIHRoaXMsIGluZGV4ZWRfcnVsZSwgdGhpcy5jb25kaXRpb25TdGFja1t0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgaWYgKHRoaXMuZG9uZSAmJiB0aGlzLl9pbnB1dCkge1xuICAgICAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9iYWNrdHJhY2spIHtcbiAgICAgICAgICBmb3IgKHZhciBrIGluIGJhY2t1cCkge1xuICAgICAgICAgICAgdGhpc1trXSA9IGJhY2t1cFtrXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sIFwidGVzdF9tYXRjaFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIGluIGlucHV0XG4gICAgICBuZXh0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuRU9GO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5faW5wdXQpIHtcbiAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0b2tlbiwgbWF0Y2gsIHRlbXBNYXRjaCwgaW5kZXg7XG4gICAgICAgIGlmICghdGhpcy5fbW9yZSkge1xuICAgICAgICAgIHRoaXMueXl0ZXh0ID0gXCJcIjtcbiAgICAgICAgICB0aGlzLm1hdGNoID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcnVsZXMgPSB0aGlzLl9jdXJyZW50UnVsZXMoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRlbXBNYXRjaCA9IHRoaXMuX2lucHV0Lm1hdGNoKHRoaXMucnVsZXNbcnVsZXNbaV1dKTtcbiAgICAgICAgICBpZiAodGVtcE1hdGNoICYmICghbWF0Y2ggfHwgdGVtcE1hdGNoWzBdLmxlbmd0aCA+IG1hdGNoWzBdLmxlbmd0aCkpIHtcbiAgICAgICAgICAgIG1hdGNoID0gdGVtcE1hdGNoO1xuICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIpIHtcbiAgICAgICAgICAgICAgdG9rZW4gPSB0aGlzLnRlc3RfbWF0Y2godGVtcE1hdGNoLCBydWxlc1tpXSk7XG4gICAgICAgICAgICAgIGlmICh0b2tlbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmFja3RyYWNrKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMub3B0aW9ucy5mbGV4KSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICB0b2tlbiA9IHRoaXMudGVzdF9tYXRjaChtYXRjaCwgcnVsZXNbaW5kZXhdKTtcbiAgICAgICAgICBpZiAodG9rZW4gIT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5faW5wdXQgPT09IFwiXCIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5FT0Y7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gVW5yZWNvZ25pemVkIHRleHQuXFxuXCIgKyB0aGlzLnNob3dQb3NpdGlvbigpLCB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgdG9rZW46IG51bGwsXG4gICAgICAgICAgICBsaW5lOiB0aGlzLnl5bGluZW5vXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibmV4dFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIHRoYXQgaGFzIGEgdG9rZW5cbiAgICAgIGxleDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBsZXgoKSB7XG4gICAgICAgIHZhciByID0gdGhpcy5uZXh0KCk7XG4gICAgICAgIGlmIChyKSB7XG4gICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubGV4KCk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibGV4XCIpLFxuICAgICAgLy8gYWN0aXZhdGVzIGEgbmV3IGxleGVyIGNvbmRpdGlvbiBzdGF0ZSAocHVzaGVzIHRoZSBuZXcgbGV4ZXIgY29uZGl0aW9uIHN0YXRlIG9udG8gdGhlIGNvbmRpdGlvbiBzdGFjaylcbiAgICAgIGJlZ2luOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGJlZ2luKGNvbmRpdGlvbikge1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrLnB1c2goY29uZGl0aW9uKTtcbiAgICAgIH0sIFwiYmVnaW5cIiksXG4gICAgICAvLyBwb3AgdGhlIHByZXZpb3VzbHkgYWN0aXZlIGxleGVyIGNvbmRpdGlvbiBzdGF0ZSBvZmYgdGhlIGNvbmRpdGlvbiBzdGFja1xuICAgICAgcG9wU3RhdGU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcG9wU3RhdGUoKSB7XG4gICAgICAgIHZhciBuID0gdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxO1xuICAgICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFjay5wb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1swXTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwb3BTdGF0ZVwiKSxcbiAgICAgIC8vIHByb2R1Y2UgdGhlIGxleGVyIHJ1bGUgc2V0IHdoaWNoIGlzIGFjdGl2ZSBmb3IgdGhlIGN1cnJlbnRseSBhY3RpdmUgbGV4ZXIgY29uZGl0aW9uIHN0YXRlXG4gICAgICBfY3VycmVudFJ1bGVzOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIF9jdXJyZW50UnVsZXMoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAmJiB0aGlzLmNvbmRpdGlvblN0YWNrW3RoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25zW3RoaXMuY29uZGl0aW9uU3RhY2tbdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxXV0ucnVsZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uc1tcIklOSVRJQUxcIl0ucnVsZXM7XG4gICAgICAgIH1cbiAgICAgIH0sIFwiX2N1cnJlbnRSdWxlc1wiKSxcbiAgICAgIC8vIHJldHVybiB0aGUgY3VycmVudGx5IGFjdGl2ZSBsZXhlciBjb25kaXRpb24gc3RhdGU7IHdoZW4gYW4gaW5kZXggYXJndW1lbnQgaXMgcHJvdmlkZWQgaXQgcHJvZHVjZXMgdGhlIE4tdGggcHJldmlvdXMgY29uZGl0aW9uIHN0YXRlLCBpZiBhdmFpbGFibGVcbiAgICAgIHRvcFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHRvcFN0YXRlKG4pIHtcbiAgICAgICAgbiA9IHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMSAtIE1hdGguYWJzKG4gfHwgMCk7XG4gICAgICAgIGlmIChuID49IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1tuXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gXCJJTklUSUFMXCI7XG4gICAgICAgIH1cbiAgICAgIH0sIFwidG9wU3RhdGVcIiksXG4gICAgICAvLyBhbGlhcyBmb3IgYmVnaW4oY29uZGl0aW9uKVxuICAgICAgcHVzaFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHB1c2hTdGF0ZShjb25kaXRpb24pIHtcbiAgICAgICAgdGhpcy5iZWdpbihjb25kaXRpb24pO1xuICAgICAgfSwgXCJwdXNoU3RhdGVcIiksXG4gICAgICAvLyByZXR1cm4gdGhlIG51bWJlciBvZiBzdGF0ZXMgY3VycmVudGx5IG9uIHRoZSBzdGFja1xuICAgICAgc3RhdGVTdGFja1NpemU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gc3RhdGVTdGFja1NpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aDtcbiAgICAgIH0sIFwic3RhdGVTdGFja1NpemVcIiksXG4gICAgICBvcHRpb25zOiB7IFwiY2FzZS1pbnNlbnNpdGl2ZVwiOiB0cnVlIH0sXG4gICAgICBwZXJmb3JtQWN0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGFub255bW91cyh5eSwgeXlfLCAkYXZvaWRpbmdfbmFtZV9jb2xsaXNpb25zLCBZWV9TVEFSVCkge1xuICAgICAgICB2YXIgWVlTVEFURSA9IFlZX1NUQVJUO1xuICAgICAgICBzd2l0Y2ggKCRhdm9pZGluZ19uYW1lX2NvbGxpc2lvbnMpIHtcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICByZXR1cm4gXCJ0aXRsZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImFjY190aXRsZVwiKTtcbiAgICAgICAgICAgIHJldHVybiA5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIFwiYWNjX3RpdGxlX3ZhbHVlXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiYWNjX2Rlc2NyXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDExO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIFwiYWNjX2Rlc2NyX3ZhbHVlXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiYWNjX2Rlc2NyX211bHRpbGluZVwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgIHJldHVybiBcImFjY19kZXNjcl9tdWx0aWxpbmVfdmFsdWVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgIHJldHVybiAyMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgIHJldHVybiAyMjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgICByZXR1cm4gMjM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgICAgcmV0dXJuIDI0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgIHJldHVybiA1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgIHJldHVybiA4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxNzpcbiAgICAgICAgICAgIHJldHVybiA2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxODpcbiAgICAgICAgICAgIHJldHVybiAyNztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTk6XG4gICAgICAgICAgICByZXR1cm4gNDA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDIwOlxuICAgICAgICAgICAgcmV0dXJuIDI5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyMTpcbiAgICAgICAgICAgIHJldHVybiAzMjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjI6XG4gICAgICAgICAgICByZXR1cm4gMzE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDIzOlxuICAgICAgICAgICAgcmV0dXJuIDM0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyNDpcbiAgICAgICAgICAgIHJldHVybiAzNjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjU6XG4gICAgICAgICAgICByZXR1cm4gMzg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI2OlxuICAgICAgICAgICAgcmV0dXJuIDQxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyNzpcbiAgICAgICAgICAgIHJldHVybiA0MjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjg6XG4gICAgICAgICAgICByZXR1cm4gNDM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI5OlxuICAgICAgICAgICAgcmV0dXJuIDQ0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzMDpcbiAgICAgICAgICAgIHJldHVybiA0NTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzE6XG4gICAgICAgICAgICByZXR1cm4gNDY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDMyOlxuICAgICAgICAgICAgcmV0dXJuIDQ3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzMzpcbiAgICAgICAgICAgIHJldHVybiA0ODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzQ6XG4gICAgICAgICAgICByZXR1cm4gNDk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM1OlxuICAgICAgICAgICAgcmV0dXJuIDUwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNjpcbiAgICAgICAgICAgIHJldHVybiA1MTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzc6XG4gICAgICAgICAgICByZXR1cm4gNTI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM4OlxuICAgICAgICAgICAgcmV0dXJuIDUzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzOTpcbiAgICAgICAgICAgIHJldHVybiA1NDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgICByZXR1cm4gNjU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQxOlxuICAgICAgICAgICAgcmV0dXJuIDY2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0MjpcbiAgICAgICAgICAgIHJldHVybiA2NztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDM6XG4gICAgICAgICAgICByZXR1cm4gNjg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ0OlxuICAgICAgICAgICAgcmV0dXJuIDY5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0NTpcbiAgICAgICAgICAgIHJldHVybiA3MDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDY6XG4gICAgICAgICAgICByZXR1cm4gNzE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ3OlxuICAgICAgICAgICAgcmV0dXJuIDU3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0ODpcbiAgICAgICAgICAgIHJldHVybiA1OTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDk6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwic3R5bGVcIik7XG4gICAgICAgICAgICByZXR1cm4gNzc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDUwOlxuICAgICAgICAgICAgcmV0dXJuIDc1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1MTpcbiAgICAgICAgICAgIHJldHVybiA4MTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTI6XG4gICAgICAgICAgICByZXR1cm4gODg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDUzOlxuICAgICAgICAgICAgcmV0dXJuIFwiUEVSQ0VOVFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1NDpcbiAgICAgICAgICAgIHJldHVybiA4NjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTU6XG4gICAgICAgICAgICByZXR1cm4gODQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU2OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1NzpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJzdHJpbmdcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU4OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1OTpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJzdHlsZVwiKTtcbiAgICAgICAgICAgIHJldHVybiA3MjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjA6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwic3R5bGVcIik7XG4gICAgICAgICAgICByZXR1cm4gNzQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDYxOlxuICAgICAgICAgICAgcmV0dXJuIDYxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2MjpcbiAgICAgICAgICAgIHJldHVybiA2NDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjM6XG4gICAgICAgICAgICByZXR1cm4gNjM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDY0OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcInN0cmluZ1wiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjU6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDY2OlxuICAgICAgICAgICAgcmV0dXJuIFwicVN0cmluZ1wiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2NzpcbiAgICAgICAgICAgIHl5Xy55eXRleHQgPSB5eV8ueXl0ZXh0LnRyaW0oKTtcbiAgICAgICAgICAgIHJldHVybiA4OTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjg6XG4gICAgICAgICAgICByZXR1cm4gNzU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDY5OlxuICAgICAgICAgICAgcmV0dXJuIDgwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3MDpcbiAgICAgICAgICAgIHJldHVybiA3NjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9LCBcImFub255bW91c1wiKSxcbiAgICAgIHJ1bGVzOiBbL14oPzp0aXRsZVxcc1teI1xcbjtdKykvaSwgL14oPzphY2NUaXRsZVxccyo6XFxzKikvaSwgL14oPzooPyFcXG58fCkqW15cXG5dKikvaSwgL14oPzphY2NEZXNjclxccyo6XFxzKikvaSwgL14oPzooPyFcXG58fCkqW15cXG5dKikvaSwgL14oPzphY2NEZXNjclxccypcXHtcXHMqKS9pLCAvXig/OltcXH1dKS9pLCAvXig/OlteXFx9XSopL2ksIC9eKD86LipkaXJlY3Rpb25cXHMrVEJbXlxcbl0qKS9pLCAvXig/Oi4qZGlyZWN0aW9uXFxzK0JUW15cXG5dKikvaSwgL14oPzouKmRpcmVjdGlvblxccytSTFteXFxuXSopL2ksIC9eKD86LipkaXJlY3Rpb25cXHMrTFJbXlxcbl0qKS9pLCAvXig/OihcXHI/XFxuKSspL2ksIC9eKD86XFxzKykvaSwgL14oPzojW15cXG5dKikvaSwgL14oPzolW15cXG5dKikvaSwgL14oPzokKS9pLCAvXig/OnJlcXVpcmVtZW50RGlhZ3JhbVxcYikvaSwgL14oPzpcXHspL2ksIC9eKD86XFx9KS9pLCAvXig/Ojp7M30pL2ksIC9eKD86OikvaSwgL14oPzppZFxcYikvaSwgL14oPzp0ZXh0XFxiKS9pLCAvXig/OnJpc2tcXGIpL2ksIC9eKD86dmVyaWZ5TWV0aG9kXFxiKS9pLCAvXig/OnJlcXVpcmVtZW50XFxiKS9pLCAvXig/OmZ1bmN0aW9uYWxSZXF1aXJlbWVudFxcYikvaSwgL14oPzppbnRlcmZhY2VSZXF1aXJlbWVudFxcYikvaSwgL14oPzpwZXJmb3JtYW5jZVJlcXVpcmVtZW50XFxiKS9pLCAvXig/OnBoeXNpY2FsUmVxdWlyZW1lbnRcXGIpL2ksIC9eKD86ZGVzaWduQ29uc3RyYWludFxcYikvaSwgL14oPzpsb3dcXGIpL2ksIC9eKD86bWVkaXVtXFxiKS9pLCAvXig/OmhpZ2hcXGIpL2ksIC9eKD86YW5hbHlzaXNcXGIpL2ksIC9eKD86ZGVtb25zdHJhdGlvblxcYikvaSwgL14oPzppbnNwZWN0aW9uXFxiKS9pLCAvXig/OnRlc3RcXGIpL2ksIC9eKD86ZWxlbWVudFxcYikvaSwgL14oPzpjb250YWluc1xcYikvaSwgL14oPzpjb3BpZXNcXGIpL2ksIC9eKD86ZGVyaXZlc1xcYikvaSwgL14oPzpzYXRpc2ZpZXNcXGIpL2ksIC9eKD86dmVyaWZpZXNcXGIpL2ksIC9eKD86cmVmaW5lc1xcYikvaSwgL14oPzp0cmFjZXNcXGIpL2ksIC9eKD86dHlwZVxcYikvaSwgL14oPzpkb2NyZWZcXGIpL2ksIC9eKD86c3R5bGVcXGIpL2ksIC9eKD86XFx3KykvaSwgL14oPzo6KS9pLCAvXig/OjspL2ksIC9eKD86JSkvaSwgL14oPzotKS9pLCAvXig/OiMpL2ksIC9eKD86ICkvaSwgL14oPzpbXCJdKS9pLCAvXig/OlxcbikvaSwgL14oPzpjbGFzc0RlZlxcYikvaSwgL14oPzpjbGFzc1xcYikvaSwgL14oPzo8LSkvaSwgL14oPzotPikvaSwgL14oPzotKS9pLCAvXig/OltcIl0pL2ksIC9eKD86W1wiXSkvaSwgL14oPzpbXlwiXSopL2ksIC9eKD86W1xcd11bXjosXFxyXFxuXFx7XFw8XFw+XFwtXFw9XSopL2ksIC9eKD86XFx3KykvaSwgL14oPzpbMC05XSspL2ksIC9eKD86LCkvaV0sXG4gICAgICBjb25kaXRpb25zOiB7IFwiYWNjX2Rlc2NyX211bHRpbGluZVwiOiB7IFwicnVsZXNcIjogWzYsIDcsIDY4LCA2OSwgNzBdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImFjY19kZXNjclwiOiB7IFwicnVsZXNcIjogWzQsIDY4LCA2OSwgNzBdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImFjY190aXRsZVwiOiB7IFwicnVsZXNcIjogWzIsIDY4LCA2OSwgNzBdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcInN0eWxlXCI6IHsgXCJydWxlc1wiOiBbNTAsIDUxLCA1MiwgNTMsIDU0LCA1NSwgNTYsIDU3LCA1OCwgNjgsIDY5LCA3MF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwidW5xU3RyaW5nXCI6IHsgXCJydWxlc1wiOiBbNjgsIDY5LCA3MF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwidG9rZW5cIjogeyBcInJ1bGVzXCI6IFs2OCwgNjksIDcwXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJzdHJpbmdcIjogeyBcInJ1bGVzXCI6IFs2NSwgNjYsIDY4LCA2OSwgNzBdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIklOSVRJQUxcIjogeyBcInJ1bGVzXCI6IFswLCAxLCAzLCA1LCA4LCA5LCAxMCwgMTEsIDEyLCAxMywgMTQsIDE1LCAxNiwgMTcsIDE4LCAxOSwgMjAsIDIxLCAyMiwgMjMsIDI0LCAyNSwgMjYsIDI3LCAyOCwgMjksIDMwLCAzMSwgMzIsIDMzLCAzNCwgMzUsIDM2LCAzNywgMzgsIDM5LCA0MCwgNDEsIDQyLCA0MywgNDQsIDQ1LCA0NiwgNDcsIDQ4LCA0OSwgNTksIDYwLCA2MSwgNjIsIDYzLCA2NCwgNjcsIDY4LCA2OSwgNzBdLCBcImluY2x1c2l2ZVwiOiB0cnVlIH0gfVxuICAgIH07XG4gICAgcmV0dXJuIGxleGVyMjtcbiAgfSkoKTtcbiAgcGFyc2VyMi5sZXhlciA9IGxleGVyO1xuICBmdW5jdGlvbiBQYXJzZXIoKSB7XG4gICAgdGhpcy55eSA9IHt9O1xuICB9XG4gIF9fbmFtZShQYXJzZXIsIFwiUGFyc2VyXCIpO1xuICBQYXJzZXIucHJvdG90eXBlID0gcGFyc2VyMjtcbiAgcGFyc2VyMi5QYXJzZXIgPSBQYXJzZXI7XG4gIHJldHVybiBuZXcgUGFyc2VyKCk7XG59KSgpO1xucGFyc2VyLnBhcnNlciA9IHBhcnNlcjtcbnZhciByZXF1aXJlbWVudERpYWdyYW1fZGVmYXVsdCA9IHBhcnNlcjtcblxuLy8gc3JjL2RpYWdyYW1zL3JlcXVpcmVtZW50L3JlcXVpcmVtZW50RGIudHNcbnZhciBSZXF1aXJlbWVudERCID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnJlbGF0aW9ucyA9IFtdO1xuICAgIHRoaXMubGF0ZXN0UmVxdWlyZW1lbnQgPSB0aGlzLmdldEluaXRpYWxSZXF1aXJlbWVudCgpO1xuICAgIHRoaXMucmVxdWlyZW1lbnRzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICB0aGlzLmxhdGVzdEVsZW1lbnQgPSB0aGlzLmdldEluaXRpYWxFbGVtZW50KCk7XG4gICAgdGhpcy5lbGVtZW50cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgdGhpcy5jbGFzc2VzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICB0aGlzLmRpcmVjdGlvbiA9IFwiVEJcIjtcbiAgICB0aGlzLlJlcXVpcmVtZW50VHlwZSA9IHtcbiAgICAgIFJFUVVJUkVNRU5UOiBcIlJlcXVpcmVtZW50XCIsXG4gICAgICBGVU5DVElPTkFMX1JFUVVJUkVNRU5UOiBcIkZ1bmN0aW9uYWwgUmVxdWlyZW1lbnRcIixcbiAgICAgIElOVEVSRkFDRV9SRVFVSVJFTUVOVDogXCJJbnRlcmZhY2UgUmVxdWlyZW1lbnRcIixcbiAgICAgIFBFUkZPUk1BTkNFX1JFUVVJUkVNRU5UOiBcIlBlcmZvcm1hbmNlIFJlcXVpcmVtZW50XCIsXG4gICAgICBQSFlTSUNBTF9SRVFVSVJFTUVOVDogXCJQaHlzaWNhbCBSZXF1aXJlbWVudFwiLFxuICAgICAgREVTSUdOX0NPTlNUUkFJTlQ6IFwiRGVzaWduIENvbnN0cmFpbnRcIlxuICAgIH07XG4gICAgdGhpcy5SaXNrTGV2ZWwgPSB7XG4gICAgICBMT1dfUklTSzogXCJMb3dcIixcbiAgICAgIE1FRF9SSVNLOiBcIk1lZGl1bVwiLFxuICAgICAgSElHSF9SSVNLOiBcIkhpZ2hcIlxuICAgIH07XG4gICAgdGhpcy5WZXJpZnlUeXBlID0ge1xuICAgICAgVkVSSUZZX0FOQUxZU0lTOiBcIkFuYWx5c2lzXCIsXG4gICAgICBWRVJJRllfREVNT05TVFJBVElPTjogXCJEZW1vbnN0cmF0aW9uXCIsXG4gICAgICBWRVJJRllfSU5TUEVDVElPTjogXCJJbnNwZWN0aW9uXCIsXG4gICAgICBWRVJJRllfVEVTVDogXCJUZXN0XCJcbiAgICB9O1xuICAgIHRoaXMuUmVsYXRpb25zaGlwcyA9IHtcbiAgICAgIENPTlRBSU5TOiBcImNvbnRhaW5zXCIsXG4gICAgICBDT1BJRVM6IFwiY29waWVzXCIsXG4gICAgICBERVJJVkVTOiBcImRlcml2ZXNcIixcbiAgICAgIFNBVElTRklFUzogXCJzYXRpc2ZpZXNcIixcbiAgICAgIFZFUklGSUVTOiBcInZlcmlmaWVzXCIsXG4gICAgICBSRUZJTkVTOiBcInJlZmluZXNcIixcbiAgICAgIFRSQUNFUzogXCJ0cmFjZXNcIlxuICAgIH07XG4gICAgdGhpcy5zZXRBY2NUaXRsZSA9IHNldEFjY1RpdGxlO1xuICAgIHRoaXMuZ2V0QWNjVGl0bGUgPSBnZXRBY2NUaXRsZTtcbiAgICB0aGlzLnNldEFjY0Rlc2NyaXB0aW9uID0gc2V0QWNjRGVzY3JpcHRpb247XG4gICAgdGhpcy5nZXRBY2NEZXNjcmlwdGlvbiA9IGdldEFjY0Rlc2NyaXB0aW9uO1xuICAgIHRoaXMuc2V0RGlhZ3JhbVRpdGxlID0gc2V0RGlhZ3JhbVRpdGxlO1xuICAgIHRoaXMuZ2V0RGlhZ3JhbVRpdGxlID0gZ2V0RGlhZ3JhbVRpdGxlO1xuICAgIHRoaXMuZ2V0Q29uZmlnID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiBnZXRDb25maWcyKCkucmVxdWlyZW1lbnQsIFwiZ2V0Q29uZmlnXCIpO1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICB0aGlzLnNldERpcmVjdGlvbiA9IHRoaXMuc2V0RGlyZWN0aW9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy5hZGRSZXF1aXJlbWVudCA9IHRoaXMuYWRkUmVxdWlyZW1lbnQuYmluZCh0aGlzKTtcbiAgICB0aGlzLnNldE5ld1JlcUlkID0gdGhpcy5zZXROZXdSZXFJZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc2V0TmV3UmVxUmlzayA9IHRoaXMuc2V0TmV3UmVxUmlzay5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc2V0TmV3UmVxVGV4dCA9IHRoaXMuc2V0TmV3UmVxVGV4dC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc2V0TmV3UmVxVmVyaWZ5TWV0aG9kID0gdGhpcy5zZXROZXdSZXFWZXJpZnlNZXRob2QuYmluZCh0aGlzKTtcbiAgICB0aGlzLmFkZEVsZW1lbnQgPSB0aGlzLmFkZEVsZW1lbnQuYmluZCh0aGlzKTtcbiAgICB0aGlzLnNldE5ld0VsZW1lbnRUeXBlID0gdGhpcy5zZXROZXdFbGVtZW50VHlwZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc2V0TmV3RWxlbWVudERvY1JlZiA9IHRoaXMuc2V0TmV3RWxlbWVudERvY1JlZi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuYWRkUmVsYXRpb25zaGlwID0gdGhpcy5hZGRSZWxhdGlvbnNoaXAuYmluZCh0aGlzKTtcbiAgICB0aGlzLnNldENzc1N0eWxlID0gdGhpcy5zZXRDc3NTdHlsZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc2V0Q2xhc3MgPSB0aGlzLnNldENsYXNzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5kZWZpbmVDbGFzcyA9IHRoaXMuZGVmaW5lQ2xhc3MuYmluZCh0aGlzKTtcbiAgICB0aGlzLnNldEFjY1RpdGxlID0gdGhpcy5zZXRBY2NUaXRsZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc2V0QWNjRGVzY3JpcHRpb24gPSB0aGlzLnNldEFjY0Rlc2NyaXB0aW9uLmJpbmQodGhpcyk7XG4gIH1cbiAgc3RhdGljIHtcbiAgICBfX25hbWUodGhpcywgXCJSZXF1aXJlbWVudERCXCIpO1xuICB9XG4gIGdldERpcmVjdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb247XG4gIH1cbiAgc2V0RGlyZWN0aW9uKGRpcikge1xuICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyO1xuICB9XG4gIHJlc2V0TGF0ZXN0UmVxdWlyZW1lbnQoKSB7XG4gICAgdGhpcy5sYXRlc3RSZXF1aXJlbWVudCA9IHRoaXMuZ2V0SW5pdGlhbFJlcXVpcmVtZW50KCk7XG4gIH1cbiAgcmVzZXRMYXRlc3RFbGVtZW50KCkge1xuICAgIHRoaXMubGF0ZXN0RWxlbWVudCA9IHRoaXMuZ2V0SW5pdGlhbEVsZW1lbnQoKTtcbiAgfVxuICBnZXRJbml0aWFsUmVxdWlyZW1lbnQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlcXVpcmVtZW50SWQ6IFwiXCIsXG4gICAgICB0ZXh0OiBcIlwiLFxuICAgICAgcmlzazogXCJcIixcbiAgICAgIHZlcmlmeU1ldGhvZDogXCJcIixcbiAgICAgIG5hbWU6IFwiXCIsXG4gICAgICB0eXBlOiBcIlwiLFxuICAgICAgY3NzU3R5bGVzOiBbXSxcbiAgICAgIGNsYXNzZXM6IFtcImRlZmF1bHRcIl1cbiAgICB9O1xuICB9XG4gIGdldEluaXRpYWxFbGVtZW50KCkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiBcIlwiLFxuICAgICAgdHlwZTogXCJcIixcbiAgICAgIGRvY1JlZjogXCJcIixcbiAgICAgIGNzc1N0eWxlczogW10sXG4gICAgICBjbGFzc2VzOiBbXCJkZWZhdWx0XCJdXG4gICAgfTtcbiAgfVxuICBhZGRSZXF1aXJlbWVudChuYW1lLCB0eXBlKSB7XG4gICAgaWYgKCF0aGlzLnJlcXVpcmVtZW50cy5oYXMobmFtZSkpIHtcbiAgICAgIHRoaXMucmVxdWlyZW1lbnRzLnNldChuYW1lLCB7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIHR5cGUsXG4gICAgICAgIHJlcXVpcmVtZW50SWQ6IHRoaXMubGF0ZXN0UmVxdWlyZW1lbnQucmVxdWlyZW1lbnRJZCxcbiAgICAgICAgdGV4dDogdGhpcy5sYXRlc3RSZXF1aXJlbWVudC50ZXh0LFxuICAgICAgICByaXNrOiB0aGlzLmxhdGVzdFJlcXVpcmVtZW50LnJpc2ssXG4gICAgICAgIHZlcmlmeU1ldGhvZDogdGhpcy5sYXRlc3RSZXF1aXJlbWVudC52ZXJpZnlNZXRob2QsXG4gICAgICAgIGNzc1N0eWxlczogW10sXG4gICAgICAgIGNsYXNzZXM6IFtcImRlZmF1bHRcIl1cbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLnJlc2V0TGF0ZXN0UmVxdWlyZW1lbnQoKTtcbiAgICByZXR1cm4gdGhpcy5yZXF1aXJlbWVudHMuZ2V0KG5hbWUpO1xuICB9XG4gIGdldFJlcXVpcmVtZW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5yZXF1aXJlbWVudHM7XG4gIH1cbiAgc2V0TmV3UmVxSWQoaWQpIHtcbiAgICBpZiAodGhpcy5sYXRlc3RSZXF1aXJlbWVudCAhPT0gdm9pZCAwKSB7XG4gICAgICB0aGlzLmxhdGVzdFJlcXVpcmVtZW50LnJlcXVpcmVtZW50SWQgPSBpZDtcbiAgICB9XG4gIH1cbiAgc2V0TmV3UmVxVGV4dCh0ZXh0KSB7XG4gICAgaWYgKHRoaXMubGF0ZXN0UmVxdWlyZW1lbnQgIT09IHZvaWQgMCkge1xuICAgICAgdGhpcy5sYXRlc3RSZXF1aXJlbWVudC50ZXh0ID0gdGV4dDtcbiAgICB9XG4gIH1cbiAgc2V0TmV3UmVxUmlzayhyaXNrKSB7XG4gICAgaWYgKHRoaXMubGF0ZXN0UmVxdWlyZW1lbnQgIT09IHZvaWQgMCkge1xuICAgICAgdGhpcy5sYXRlc3RSZXF1aXJlbWVudC5yaXNrID0gcmlzaztcbiAgICB9XG4gIH1cbiAgc2V0TmV3UmVxVmVyaWZ5TWV0aG9kKHZlcmlmeU1ldGhvZCkge1xuICAgIGlmICh0aGlzLmxhdGVzdFJlcXVpcmVtZW50ICE9PSB2b2lkIDApIHtcbiAgICAgIHRoaXMubGF0ZXN0UmVxdWlyZW1lbnQudmVyaWZ5TWV0aG9kID0gdmVyaWZ5TWV0aG9kO1xuICAgIH1cbiAgfVxuICBhZGRFbGVtZW50KG5hbWUpIHtcbiAgICBpZiAoIXRoaXMuZWxlbWVudHMuaGFzKG5hbWUpKSB7XG4gICAgICB0aGlzLmVsZW1lbnRzLnNldChuYW1lLCB7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIHR5cGU6IHRoaXMubGF0ZXN0RWxlbWVudC50eXBlLFxuICAgICAgICBkb2NSZWY6IHRoaXMubGF0ZXN0RWxlbWVudC5kb2NSZWYsXG4gICAgICAgIGNzc1N0eWxlczogW10sXG4gICAgICAgIGNsYXNzZXM6IFtcImRlZmF1bHRcIl1cbiAgICAgIH0pO1xuICAgICAgbG9nLmluZm8oXCJBZGRlZCBuZXcgZWxlbWVudDogXCIsIG5hbWUpO1xuICAgIH1cbiAgICB0aGlzLnJlc2V0TGF0ZXN0RWxlbWVudCgpO1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnRzLmdldChuYW1lKTtcbiAgfVxuICBnZXRFbGVtZW50cygpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50cztcbiAgfVxuICBzZXROZXdFbGVtZW50VHlwZSh0eXBlKSB7XG4gICAgaWYgKHRoaXMubGF0ZXN0RWxlbWVudCAhPT0gdm9pZCAwKSB7XG4gICAgICB0aGlzLmxhdGVzdEVsZW1lbnQudHlwZSA9IHR5cGU7XG4gICAgfVxuICB9XG4gIHNldE5ld0VsZW1lbnREb2NSZWYoZG9jUmVmKSB7XG4gICAgaWYgKHRoaXMubGF0ZXN0RWxlbWVudCAhPT0gdm9pZCAwKSB7XG4gICAgICB0aGlzLmxhdGVzdEVsZW1lbnQuZG9jUmVmID0gZG9jUmVmO1xuICAgIH1cbiAgfVxuICBhZGRSZWxhdGlvbnNoaXAodHlwZSwgc3JjLCBkc3QpIHtcbiAgICB0aGlzLnJlbGF0aW9ucy5wdXNoKHtcbiAgICAgIHR5cGUsXG4gICAgICBzcmMsXG4gICAgICBkc3RcbiAgICB9KTtcbiAgfVxuICBnZXRSZWxhdGlvbnNoaXBzKCkge1xuICAgIHJldHVybiB0aGlzLnJlbGF0aW9ucztcbiAgfVxuICBjbGVhcigpIHtcbiAgICB0aGlzLnJlbGF0aW9ucyA9IFtdO1xuICAgIHRoaXMucmVzZXRMYXRlc3RSZXF1aXJlbWVudCgpO1xuICAgIHRoaXMucmVxdWlyZW1lbnRzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICB0aGlzLnJlc2V0TGF0ZXN0RWxlbWVudCgpO1xuICAgIHRoaXMuZWxlbWVudHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgIHRoaXMuY2xhc3NlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgY2xlYXIoKTtcbiAgfVxuICBzZXRDc3NTdHlsZShpZHMsIHN0eWxlcykge1xuICAgIGZvciAoY29uc3QgaWQgb2YgaWRzKSB7XG4gICAgICBjb25zdCBub2RlID0gdGhpcy5yZXF1aXJlbWVudHMuZ2V0KGlkKSA/PyB0aGlzLmVsZW1lbnRzLmdldChpZCk7XG4gICAgICBpZiAoIXN0eWxlcyB8fCAhbm9kZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IHMgb2Ygc3R5bGVzKSB7XG4gICAgICAgIGlmIChzLmluY2x1ZGVzKFwiLFwiKSkge1xuICAgICAgICAgIG5vZGUuY3NzU3R5bGVzLnB1c2goLi4ucy5zcGxpdChcIixcIikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5vZGUuY3NzU3R5bGVzLnB1c2gocyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgc2V0Q2xhc3MoaWRzLCBjbGFzc05hbWVzKSB7XG4gICAgZm9yIChjb25zdCBpZCBvZiBpZHMpIHtcbiAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLnJlcXVpcmVtZW50cy5nZXQoaWQpID8/IHRoaXMuZWxlbWVudHMuZ2V0KGlkKTtcbiAgICAgIGlmIChub2RlKSB7XG4gICAgICAgIGZvciAoY29uc3QgX2NsYXNzIG9mIGNsYXNzTmFtZXMpIHtcbiAgICAgICAgICBub2RlLmNsYXNzZXMucHVzaChfY2xhc3MpO1xuICAgICAgICAgIGNvbnN0IHN0eWxlcyA9IHRoaXMuY2xhc3Nlcy5nZXQoX2NsYXNzKT8uc3R5bGVzO1xuICAgICAgICAgIGlmIChzdHlsZXMpIHtcbiAgICAgICAgICAgIG5vZGUuY3NzU3R5bGVzLnB1c2goLi4uc3R5bGVzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZGVmaW5lQ2xhc3MoaWRzLCBzdHlsZSkge1xuICAgIGZvciAoY29uc3QgaWQgb2YgaWRzKSB7XG4gICAgICBsZXQgc3R5bGVDbGFzcyA9IHRoaXMuY2xhc3Nlcy5nZXQoaWQpO1xuICAgICAgaWYgKHN0eWxlQ2xhc3MgPT09IHZvaWQgMCkge1xuICAgICAgICBzdHlsZUNsYXNzID0geyBpZCwgc3R5bGVzOiBbXSwgdGV4dFN0eWxlczogW10gfTtcbiAgICAgICAgdGhpcy5jbGFzc2VzLnNldChpZCwgc3R5bGVDbGFzcyk7XG4gICAgICB9XG4gICAgICBpZiAoc3R5bGUpIHtcbiAgICAgICAgc3R5bGUuZm9yRWFjaChmdW5jdGlvbihzKSB7XG4gICAgICAgICAgaWYgKC9jb2xvci8uZXhlYyhzKSkge1xuICAgICAgICAgICAgY29uc3QgbmV3U3R5bGUgPSBzLnJlcGxhY2UoXCJmaWxsXCIsIFwiYmdGaWxsXCIpO1xuICAgICAgICAgICAgc3R5bGVDbGFzcy50ZXh0U3R5bGVzLnB1c2gobmV3U3R5bGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzdHlsZUNsYXNzLnN0eWxlcy5wdXNoKHMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmVxdWlyZW1lbnRzLmZvckVhY2goKHZhbHVlKSA9PiB7XG4gICAgICAgIGlmICh2YWx1ZS5jbGFzc2VzLmluY2x1ZGVzKGlkKSkge1xuICAgICAgICAgIHZhbHVlLmNzc1N0eWxlcy5wdXNoKC4uLnN0eWxlLmZsYXRNYXAoKHMpID0+IHMuc3BsaXQoXCIsXCIpKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5lbGVtZW50cy5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAodmFsdWUuY2xhc3Nlcy5pbmNsdWRlcyhpZCkpIHtcbiAgICAgICAgICB2YWx1ZS5jc3NTdHlsZXMucHVzaCguLi5zdHlsZS5mbGF0TWFwKChzKSA9PiBzLnNwbGl0KFwiLFwiKSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgZ2V0Q2xhc3NlcygpIHtcbiAgICByZXR1cm4gdGhpcy5jbGFzc2VzO1xuICB9XG4gIGdldERhdGEoKSB7XG4gICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnMigpO1xuICAgIGNvbnN0IG5vZGVzID0gW107XG4gICAgY29uc3QgZWRnZXMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHJlcXVpcmVtZW50IG9mIHRoaXMucmVxdWlyZW1lbnRzLnZhbHVlcygpKSB7XG4gICAgICBjb25zdCBub2RlID0gcmVxdWlyZW1lbnQ7XG4gICAgICBub2RlLmlkID0gcmVxdWlyZW1lbnQubmFtZTtcbiAgICAgIG5vZGUuY3NzU3R5bGVzID0gcmVxdWlyZW1lbnQuY3NzU3R5bGVzO1xuICAgICAgbm9kZS5jc3NDbGFzc2VzID0gcmVxdWlyZW1lbnQuY2xhc3Nlcy5qb2luKFwiIFwiKTtcbiAgICAgIG5vZGUuc2hhcGUgPSBcInJlcXVpcmVtZW50Qm94XCI7XG4gICAgICBub2RlLmxvb2sgPSBjb25maWcubG9vaztcbiAgICAgIG5vZGUuY29sb3JJbmRleCA9IG5vZGVzLmxlbmd0aDtcbiAgICAgIG5vZGVzLnB1c2gobm9kZSk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiB0aGlzLmVsZW1lbnRzLnZhbHVlcygpKSB7XG4gICAgICBjb25zdCBub2RlID0gZWxlbWVudDtcbiAgICAgIG5vZGUuc2hhcGUgPSBcInJlcXVpcmVtZW50Qm94XCI7XG4gICAgICBub2RlLmxvb2sgPSBjb25maWcubG9vaztcbiAgICAgIG5vZGUuaWQgPSBlbGVtZW50Lm5hbWU7XG4gICAgICBub2RlLmNzc1N0eWxlcyA9IGVsZW1lbnQuY3NzU3R5bGVzO1xuICAgICAgbm9kZS5jc3NDbGFzc2VzID0gZWxlbWVudC5jbGFzc2VzLmpvaW4oXCIgXCIpO1xuICAgICAgbm9kZS5jb2xvckluZGV4ID0gbm9kZXMubGVuZ3RoO1xuICAgICAgbm9kZXMucHVzaChub2RlKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCByZWxhdGlvbiBvZiB0aGlzLnJlbGF0aW9ucykge1xuICAgICAgbGV0IGNvdW50ZXIgPSAwO1xuICAgICAgY29uc3QgaXNDb250YWlucyA9IHJlbGF0aW9uLnR5cGUgPT09IHRoaXMuUmVsYXRpb25zaGlwcy5DT05UQUlOUztcbiAgICAgIGNvbnN0IGVkZ2UgPSB7XG4gICAgICAgIGlkOiBgJHtyZWxhdGlvbi5zcmN9LSR7cmVsYXRpb24uZHN0fS0ke2NvdW50ZXJ9YCxcbiAgICAgICAgc3RhcnQ6IHRoaXMucmVxdWlyZW1lbnRzLmdldChyZWxhdGlvbi5zcmMpPy5uYW1lID8/IHRoaXMuZWxlbWVudHMuZ2V0KHJlbGF0aW9uLnNyYyk/Lm5hbWUsXG4gICAgICAgIGVuZDogdGhpcy5yZXF1aXJlbWVudHMuZ2V0KHJlbGF0aW9uLmRzdCk/Lm5hbWUgPz8gdGhpcy5lbGVtZW50cy5nZXQocmVsYXRpb24uZHN0KT8ubmFtZSxcbiAgICAgICAgbGFiZWw6IGAmbHQ7Jmx0OyR7cmVsYXRpb24udHlwZX0mZ3Q7Jmd0O2AsXG4gICAgICAgIGNsYXNzZXM6IFwicmVsYXRpb25zaGlwTGluZVwiLFxuICAgICAgICBzdHlsZTogW1wiZmlsbDpub25lXCIsIGlzQ29udGFpbnMgPyBcIlwiIDogXCJzdHJva2UtZGFzaGFycmF5OiAxMCw3XCJdLFxuICAgICAgICBsYWJlbHBvczogXCJjXCIsXG4gICAgICAgIHRoaWNrbmVzczogXCJub3JtYWxcIixcbiAgICAgICAgdHlwZTogXCJub3JtYWxcIixcbiAgICAgICAgcGF0dGVybjogaXNDb250YWlucyA/IFwibm9ybWFsXCIgOiBcImRhc2hlZFwiLFxuICAgICAgICBhcnJvd1R5cGVTdGFydDogaXNDb250YWlucyA/IFwicmVxdWlyZW1lbnRfY29udGFpbnNcIiA6IFwiXCIsXG4gICAgICAgIGFycm93VHlwZUVuZDogaXNDb250YWlucyA/IFwiXCIgOiBcInJlcXVpcmVtZW50X2Fycm93XCIsXG4gICAgICAgIGxvb2s6IGNvbmZpZy5sb29rLFxuICAgICAgICBsYWJlbFR5cGU6IFwibWFya2Rvd25cIlxuICAgICAgfTtcbiAgICAgIGVkZ2VzLnB1c2goZWRnZSk7XG4gICAgICBjb3VudGVyKys7XG4gICAgfVxuICAgIHJldHVybiB7IG5vZGVzLCBlZGdlcywgb3RoZXI6IHt9LCBjb25maWcsIGRpcmVjdGlvbjogdGhpcy5nZXREaXJlY3Rpb24oKSB9O1xuICB9XG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMvcmVxdWlyZW1lbnQvc3R5bGVzLmpzXG52YXIgZ2VuQ29sb3IgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChvcHRpb25zKSA9PiB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICBjb25zdCB7IHRoZW1lVmFyaWFibGVzLCBsb29rIH0gPSBjb25maWc7XG4gIGNvbnN0IHsgYmtnQ29sb3JBcnJheSwgYm9yZGVyQ29sb3JBcnJheSB9ID0gdGhlbWVWYXJpYWJsZXM7XG4gIGlmICghYm9yZGVyQ29sb3JBcnJheT8ubGVuZ3RoKSB7XG4gICAgcmV0dXJuIFwiXCI7XG4gIH1cbiAgbGV0IHNlY3Rpb25zID0gXCJcIjtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcHRpb25zLlRIRU1FX0NPTE9SX0xJTUlUOyBpKyspIHtcbiAgICBzZWN0aW9ucyArPSBgXG5cbiAgICBbZGF0YS1sb29rPVwiJHtsb29rfVwiXVtkYXRhLWNvbG9yLWlkPVwiY29sb3ItJHtpfVwiXS5ub2RlIHBhdGgge1xuICAgIHN0cm9rZTogJHtib3JkZXJDb2xvckFycmF5W2ldfTtcbiAgICBmaWxsOiAke2JrZ0NvbG9yQXJyYXk/Lmxlbmd0aCA/IGJrZ0NvbG9yQXJyYXlbaV0gOiBcIlwifTtcbiAgICB9XG5cbiAgICBbZGF0YS1sb29rPVwiJHtsb29rfVwiXVtkYXRhLWNvbG9yLWlkPVwiY29sb3ItJHtpfVwiXS5ub2RlICByZWN0IHtcbiAgICBzdHJva2U6ICR7Ym9yZGVyQ29sb3JBcnJheVtpXX07XG4gICAgZmlsbDogJHtia2dDb2xvckFycmF5Py5sZW5ndGggPyBia2dDb2xvckFycmF5W2ldIDogXCJcIn07XG4gICAgIH1cbiAgICBgO1xuICB9XG4gIHJldHVybiBzZWN0aW9ucztcbn0sIFwiZ2VuQ29sb3JcIik7XG52YXIgZ2V0U3R5bGVzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgob3B0aW9ucykgPT4ge1xuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgY29uc3QgeyBsb29rLCB0aGVtZVZhcmlhYmxlcyB9ID0gY29uZmlnO1xuICBjb25zdCB7IHJlcXVpcmVtZW50RWRnZUxhYmVsQmFja2dyb3VuZCB9ID0gdGhlbWVWYXJpYWJsZXM7XG4gIHJldHVybiBgXG4gICR7Z2VuQ29sb3Iob3B0aW9ucyl9XG4gIG1hcmtlciB7XG4gICAgZmlsbDogJHtvcHRpb25zLnJlbGF0aW9uQ29sb3J9O1xuICAgIHN0cm9rZTogJHtvcHRpb25zLnJlbGF0aW9uQ29sb3J9O1xuICB9XG5cbiAgbWFya2VyLmNyb3NzIHtcbiAgICBzdHJva2U6ICR7b3B0aW9ucy5saW5lQ29sb3J9O1xuICB9XG5cbiAgc3ZnIHtcbiAgICBmb250LWZhbWlseTogJHtvcHRpb25zLmZvbnRGYW1pbHl9O1xuICAgIGZvbnQtc2l6ZTogJHtvcHRpb25zLmZvbnRTaXplfTtcbiAgfVxuXG4gIC5yZXFCb3gge1xuICAgIGZpbGw6ICR7b3B0aW9ucy5yZXF1aXJlbWVudEJhY2tncm91bmR9O1xuICAgIGZpbGwtb3BhY2l0eTogMS4wO1xuICAgIHN0cm9rZTogJHtvcHRpb25zLnJlcXVpcmVtZW50Qm9yZGVyQ29sb3J9O1xuICAgIHN0cm9rZS13aWR0aDogJHtvcHRpb25zLnJlcXVpcmVtZW50Qm9yZGVyU2l6ZX07XG4gIH1cbiAgXG4gIC5yZXFUaXRsZSwgLnJlcUxhYmVse1xuICAgIGZpbGw6ICAke29wdGlvbnMucmVxdWlyZW1lbnRUZXh0Q29sb3J9O1xuICB9XG4gIC5yZXFMYWJlbEJveCB7XG4gICAgZmlsbDogJHtvcHRpb25zLnJlbGF0aW9uTGFiZWxCYWNrZ3JvdW5kfTtcbiAgICBmaWxsLW9wYWNpdHk6IDEuMDtcbiAgfVxuXG4gIC5yZXEtdGl0bGUtbGluZSB7XG4gICAgc3Ryb2tlOiAke29wdGlvbnMucmVxdWlyZW1lbnRCb3JkZXJDb2xvcn07XG4gICAgc3Ryb2tlLXdpZHRoOiAke29wdGlvbnMucmVxdWlyZW1lbnRCb3JkZXJTaXplfTtcbiAgfVxuICAucmVsYXRpb25zaGlwTGluZSB7XG4gICAgc3Ryb2tlOiAke29wdGlvbnMucmVsYXRpb25Db2xvcn07XG4gICAgc3Ryb2tlLXdpZHRoOiAke2xvb2sgPT09IFwibmVvXCIgPyBvcHRpb25zLnN0cm9rZVdpZHRoIDogXCIxcHhcIn07XG4gIH1cbiAgLnJlbGF0aW9uc2hpcExhYmVsIHtcbiAgICBmaWxsOiAke29wdGlvbnMucmVsYXRpb25MYWJlbENvbG9yfTtcbiAgfVxuICAgIC5lZGdlTGFiZWwge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICR7b3B0aW9ucy5lZGdlTGFiZWxCYWNrZ3JvdW5kfTtcbiAgfVxuICAuZWRnZUxhYmVsIC5sYWJlbCByZWN0IHtcbiAgICBmaWxsOiAke29wdGlvbnMuZWRnZUxhYmVsQmFja2dyb3VuZH07XG4gIH1cbiAgLmVkZ2VMYWJlbCAubGFiZWwgdGV4dCB7XG4gICAgZmlsbDogJHtvcHRpb25zLnJlbGF0aW9uTGFiZWxDb2xvcn07XG4gIH1cbiAgLmRpdmlkZXIge1xuICAgIHN0cm9rZTogJHtvcHRpb25zLm5vZGVCb3JkZXJ9O1xuICAgIHN0cm9rZS13aWR0aDogMTtcbiAgfVxuICAubGFiZWwge1xuICAgIGZvbnQtZmFtaWx5OiAke29wdGlvbnMuZm9udEZhbWlseX07XG4gICAgY29sb3I6ICR7b3B0aW9ucy5ub2RlVGV4dENvbG9yIHx8IG9wdGlvbnMudGV4dENvbG9yfTtcbiAgfVxuICAubGFiZWwgdGV4dCxzcGFuIHtcbiAgICBmaWxsOiAke29wdGlvbnMubm9kZVRleHRDb2xvciB8fCBvcHRpb25zLnRleHRDb2xvcn07XG4gICAgY29sb3I6ICR7b3B0aW9ucy5ub2RlVGV4dENvbG9yIHx8IG9wdGlvbnMudGV4dENvbG9yfTtcbiAgfVxuICAubGFiZWxCa2cge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICR7cmVxdWlyZW1lbnRFZGdlTGFiZWxCYWNrZ3JvdW5kID8/IG9wdGlvbnMuZWRnZUxhYmVsQmFja2dyb3VuZH07XG4gIH1cblxuYDtcbn0sIFwiZ2V0U3R5bGVzXCIpO1xudmFyIHN0eWxlc19kZWZhdWx0ID0gZ2V0U3R5bGVzO1xuXG4vLyBzcmMvZGlhZ3JhbXMvcmVxdWlyZW1lbnQvcmVxdWlyZW1lbnRSZW5kZXJlci50c1xudmFyIHJlcXVpcmVtZW50UmVuZGVyZXJfZXhwb3J0cyA9IHt9O1xuX19leHBvcnQocmVxdWlyZW1lbnRSZW5kZXJlcl9leHBvcnRzLCB7XG4gIGRyYXc6ICgpID0+IGRyYXdcbn0pO1xudmFyIGRyYXcgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGFzeW5jIGZ1bmN0aW9uKHRleHQsIGlkLCBfdmVyc2lvbiwgZGlhZykge1xuICBsb2cuaW5mbyhcIlJFRjA6XCIpO1xuICBsb2cuaW5mbyhcIkRyYXdpbmcgcmVxdWlyZW1lbnQgZGlhZ3JhbSAodW5pZmllZClcIiwgaWQpO1xuICBjb25zdCB7IHNlY3VyaXR5TGV2ZWwsIHN0YXRlOiBjb25mLCBsYXlvdXQsIGxvb2sgfSA9IGdldENvbmZpZzIoKTtcbiAgY29uc3QgZGF0YTRMYXlvdXQgPSBkaWFnLmRiLmdldERhdGEoKTtcbiAgY29uc3Qgc3ZnID0gZ2V0RGlhZ3JhbUVsZW1lbnQoaWQsIHNlY3VyaXR5TGV2ZWwpO1xuICBkYXRhNExheW91dC50eXBlID0gZGlhZy50eXBlO1xuICBkYXRhNExheW91dC5sYXlvdXRBbGdvcml0aG0gPSBnZXRSZWdpc3RlcmVkTGF5b3V0QWxnb3JpdGhtKGxheW91dCk7XG4gIGRhdGE0TGF5b3V0Lm5vZGVTcGFjaW5nID0gY29uZj8ubm9kZVNwYWNpbmcgPz8gNTA7XG4gIGRhdGE0TGF5b3V0LnJhbmtTcGFjaW5nID0gY29uZj8ucmFua1NwYWNpbmcgPz8gNTA7XG4gIGRhdGE0TGF5b3V0Lm1hcmtlcnMgPSBsb29rID09PSBcIm5lb1wiID8gW1wicmVxdWlyZW1lbnRfY29udGFpbnNfbmVvXCIsIFwicmVxdWlyZW1lbnRfYXJyb3dfbmVvXCJdIDogW1wicmVxdWlyZW1lbnRfY29udGFpbnNcIiwgXCJyZXF1aXJlbWVudF9hcnJvd1wiXTtcbiAgZGF0YTRMYXlvdXQuZGlhZ3JhbUlkID0gaWQ7XG4gIGF3YWl0IHJlbmRlcihkYXRhNExheW91dCwgc3ZnKTtcbiAgY29uc3QgcGFkZGluZyA9IDg7XG4gIHV0aWxzX2RlZmF1bHQuaW5zZXJ0VGl0bGUoXG4gICAgc3ZnLFxuICAgIFwicmVxdWlyZW1lbnREaWFncmFtVGl0bGVUZXh0XCIsXG4gICAgY29uZj8udGl0bGVUb3BNYXJnaW4gPz8gMjUsXG4gICAgZGlhZy5kYi5nZXREaWFncmFtVGl0bGUoKVxuICApO1xuICBzZXR1cFZpZXdQb3J0Rm9yU1ZHKHN2ZywgcGFkZGluZywgXCJyZXF1aXJlbWVudERpYWdyYW1cIiwgY29uZj8udXNlTWF4V2lkdGggPz8gdHJ1ZSk7XG59LCBcImRyYXdcIik7XG5cbi8vIHNyYy9kaWFncmFtcy9yZXF1aXJlbWVudC9yZXF1aXJlbWVudERpYWdyYW0udHNcbnZhciBkaWFncmFtID0ge1xuICBwYXJzZXI6IHJlcXVpcmVtZW50RGlhZ3JhbV9kZWZhdWx0LFxuICBnZXQgZGIoKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1aXJlbWVudERCKCk7XG4gIH0sXG4gIHJlbmRlcmVyOiByZXF1aXJlbWVudFJlbmRlcmVyX2V4cG9ydHMsXG4gIHN0eWxlczogc3R5bGVzX2RlZmF1bHRcbn07XG5leHBvcnQge1xuICBkaWFncmFtXG59O1xuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXFDQSxJQUFJLFNBQVUsUUFBUSxHQUFHO0FBQUEsRUFDdkIsSUFBSSxvQkFBb0IsT0FBTyxRQUFRLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRztBQUFBLElBQ25ELEtBQUssS0FBSyxNQUFNLENBQUMsR0FBRyxJQUFJLEVBQUUsT0FBUSxLQUFLLEdBQUcsRUFBRSxNQUFNO0FBQUE7QUFBQSxJQUNsRCxPQUFPO0FBQUEsS0FDTixHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHO0FBQUEsRUFDNy9DLElBQUksVUFBVTtBQUFBLElBQ1osdUJBQXVCLE9BQU8sU0FBUyxLQUFLLEdBQUcsSUFDNUMsT0FBTztBQUFBLElBQ1YsSUFBSSxDQUFDO0FBQUEsSUFDTCxVQUFVLEVBQUUsT0FBUyxHQUFHLE9BQVMs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LEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFBQSxJQUMxeUIsK0JBQStCLE9BQU8sU0FBUyxTQUFTLENBQUMsUUFBUSxRQUFRLFVBQVUsSUFBSSxTQUFTLElBQUksSUFBSTtBQUFBLE1BQ3RHLElBQUksS0FBSyxHQUFHLFNBQVM7QUFBQSxNQUNyQixRQUFRO0FBQUEsYUFDRDtBQUFBLFVBQ0gsS0FB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SUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQUEsSUFDM2pPLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRTtBQUFBLElBQzdWLDRCQUE0QixPQUFPLFNBQVMsVUFBVSxDQUFDLEtBQUssTUFBTTtBQUFBLE1BQ2hFLElBQUksS0FBSyxhQUFhO0FBQUEsUUFDcEIsS0FBSyxNQUFNLEdBQUc7QUFBQSxNQUNoQixFQUFPO0FBQUEsUUFDTCxJQUFJLFFBQVEsSUFBSSxNQUFNLEdBQUc7QUFBQSxRQUN6QixNQUFNLE9BQU87QUFBQSxRQUNiLE1BQU07QUFBQTtBQUFBLE9BRVAsWUFBWTtBQUFBLElBQ2YsdUJBQXVCLE9BQU8sU0FBUyxLQUFLLENBQUMsT0FBTztBQUFBLE1BQ2xELElBQUksT0FBTyxNQUFNLFFBQVEsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsR0FBRyxRQUFRLEtBQUssT0FBTyxTQUFTLElBQUksV0FBVyxHQUFHLFNBQVMsR0FBRyxhQUFhLEdBQUcsU0FBUyxHQUFHLE1BQU07QUFBQSxNQUN0SyxJQUFJLE9BQU8sT0FBTyxNQUFNLEtBQUssV0FBVyxDQUFDO0FBQUEsTUFDekMsSUFBSSxTQUFTLE9BQU8sT0FBTyxLQUFLLEtBQUs7QUFBQSxNQUNyQyxJQUFJLGNBQWMsRUFBRSxJQUFJLENBQUMsRUFBRTtBQUFBLE1BQzNCLFNBQVMsS0FBSyxLQUFLLElBQUk7QUFBQSxRQUNyQixJQUFJLE9BQU8sVUFBVSxlQUFlLEtBQUssS0FBSyxJQUFJLENBQUMsR0FBRztBQUFBLFVBQ3BELFlBQVksR0FBRyxLQUFLLEtBQUssR0FBRztBQUFBLFFBQzlCO0FBQUEsTUFDRjtBQUFBLE1BQ0EsT0FBTyxTQUFTLE9BQU8sWUFBWSxFQUFFO0FBQUEsTUFDckMsWUFBWSxHQUFHLFFBQVE7QUFBQSxNQUN2QixZQUFZLEdBQUcsU0FBUztBQUFBLE1BQ3hCLElBQUksT0FBTyxPQUFPLFVBQVUsYUFBYTtBQUFBLFFBQ3ZDLE9BQU8sU0FBUyxDQUFDO0FBQUEsTUFDbkI7QUFBQSxNQUNBLElBQUksUUFBUSxPQUFPO0FBQUEsTUFDbkIsT0FBTyxLQUFLLEtBQUs7QUFBQSxNQUNqQixJQUFJLFNBQVMsT0FBTyxXQUFXLE9BQU8sUUFBUTtBQUFBLE1BQzlDLElBQUksT0FBTyxZQUFZLEdBQUcsZUFBZSxZQUFZO0FBQUEsUUFDbkQsS0FBSyxhQUFhLFlBQVksR0FBRztBQUFBLE1BQ25DLEVBQU87QUFBQSxRQUNMLEtBQUssYUFBYSxPQUFPLGVBQWUsSUFBSSxFQUFFO0FBQUE7QUFBQSxNQUVoRCxTQUFTLFFBQVEsQ0FBQyxHQUFHO0FBQUEsUUFDbkIsTUFBTSxTQUFTLE1BQU0sU0FBUyxJQUFJO0FBQUEsUUFDbEMsT0FBTyxTQUFTLE9BQU8sU0FBUztBQUFBLFFBQ2hDLE9BQU8sU0FBUyxPQUFPLFNBQVM7QUFBQTtBQUFBLE1BRWxDLE9BQU8sVUFBVSxVQUFVO0FBQUEsTUFDM0IsU0FBUyxHQUFHLEdBQUc7QUFBQSxRQUNiLElBQUk7QUFBQSxRQUNKLFFBQVEsT0FBTyxJQUFJLEtBQUssT0FBTyxJQUFJLEtBQUs7QUFBQSxRQUN4QyxJQUFJLE9BQU8sVUFBVSxVQUFVO0FBQUEsVUFDN0IsSUFBSSxpQkFBaUIsT0FBTztBQUFBLFlBQzFCLFNBQVM7QUFBQSxZQUNULFFBQVEsT0FBTyxJQUFJO0FBQUEsVUFDckI7QUFBQSxVQUNBLFFBQVEsS0FBSyxTQUFTLFVBQVU7QUFBQSxRQUNsQztBQUFBLFFBQ0EsT0FBTztBQUFBO0FBQUEsTUFFVCxPQUFPLEtBQUssS0FBSztBQUFBLE1BQ2pCLElBQUksUUFBUSxnQkFBZ0IsT0FBTyxRQUFRLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxHQUFHLEtBQUssVUFBVTtBQUFBLE1BQy9FLE9BQU8sTUFBTTtBQUFBLFFBQ1gsUUFBUSxNQUFNLE1BQU0sU0FBUztBQUFBLFFBQzdCLElBQUksS0FBSyxlQUFlLFFBQVE7QUFBQSxVQUM5QixTQUFTLEtBQUssZUFBZTtBQUFBLFFBQy9CLEVBQU87QUFBQSxVQUNMLElBQUksV0FBVyxRQUFRLE9BQU8sVUFBVSxhQUFhO0FBQUEsWUFDbkQsU0FBUyxJQUFJO0FBQUEsVUFDZjtBQUFBLFVBQ0EsU0FBUyxNQUFNLFVBQVUsTUFBTSxPQUFPO0FBQUE7QUFBQSxRQUV4QyxJQUFJLE9BQU8sV0FBVyxlQUFlLENBQUMsT0FBTyxVQUFVLENBQUMsT0FBTyxJQUFJO0FBQUEsVUFDakUsSUFBSSxTQUFTO0FBQUEsVUFDYixXQUFXLENBQUM7QUFBQSxVQUNaLEtBQUssS0FBSyxNQUFNLFFBQVE7QUFBQSxZQUN0QixJQUFJLEtBQUssV0FBVyxNQUFNLElBQUksUUFBUTtBQUFBLGNBQ3BDLFNBQVMsS0FBSyxNQUFNLEtBQUssV0FBVyxLQUFLLEdBQUc7QUFBQSxZQUM5QztBQUFBLFVBQ0Y7QUFBQSxVQUNBLElBQUksT0FBTyxjQUFjO0FBQUEsWUFDdkIsU0FBUywwQkFBMEIsV0FBVyxLQUFLO0FBQUEsSUFBUSxPQUFPLGFBQWEsSUFBSTtBQUFBLGNBQWlCLFNBQVMsS0FBSyxJQUFJLElBQUksYUFBYSxLQUFLLFdBQVcsV0FBVyxVQUFVO0FBQUEsVUFDOUssRUFBTztBQUFBLFlBQ0wsU0FBUywwQkFBMEIsV0FBVyxLQUFLLG1CQUFtQixVQUFVLE1BQU0saUJBQWlCLE9BQU8sS0FBSyxXQUFXLFdBQVcsVUFBVTtBQUFBO0FBQUEsVUFFckosS0FBSyxXQUFXLFFBQVE7QUFBQSxZQUN0QixNQUFNLE9BQU87QUFBQSxZQUNiLE9BQU8sS0FBSyxXQUFXLFdBQVc7QUFBQSxZQUNsQyxNQUFNLE9BQU87QUFBQSxZQUNiLEtBQUs7QUFBQSxZQUNMO0FBQUEsVUFDRixDQUFDO0FBQUEsUUFDSDtBQUFBLFFBQ0EsSUFBSSxPQUFPLGNBQWMsU0FBUyxPQUFPLFNBQVMsR0FBRztBQUFBLFVBQ25ELE1BQU0sSUFBSSxNQUFNLHNEQUFzRCxRQUFRLGNBQWMsTUFBTTtBQUFBLFFBQ3BHO0FBQUEsUUFDQSxRQUFRLE9BQU87QUFBQSxlQUNSO0FBQUEsWUFDSCxNQUFNLEtBQUssTUFBTTtBQUFBLFlBQ2pCLE9BQU8sS0FBSyxPQUFPLE1BQU07QUFBQSxZQUN6QixPQUFPLEtBQUssT0FBTyxNQUFNO0FBQUEsWUFDekIsTUFBTSxLQUFLLE9BQU8sRUFBRTtBQUFBLFlBQ3BCLFNBQVM7QUFBQSxZQUNULElBQUksQ0FBQyxnQkFBZ0I7QUFBQSxjQUNuQixTQUFTLE9BQU87QUFBQSxjQUNoQixTQUFTLE9BQU87QUFBQSxjQUNoQixXQUFXLE9BQU87QUFBQSxjQUNsQixRQUFRLE9BQU87QUFBQSxjQUNmLElBQUksYUFBYSxHQUFHO0FBQUEsZ0JBQ2xCO0FBQUEsY0FDRjtBQUFBLFlBQ0YsRUFBTztBQUFBLGNBQ0wsU0FBUztBQUFBLGNBQ1QsaUJBQWlCO0FBQUE7QUFBQSxZQUVuQjtBQUFBLGVBQ0c7QUFBQSxZQUNILE1BQU0sS0FBSyxhQUFhLE9BQU8sSUFBSTtBQUFBLFlBQ25DLE1BQU0sSUFBSSxPQUFPLE9BQU8sU0FBUztBQUFBLFlBQ2pDLE1BQU0sS0FBSztBQUFBLGNBQ1QsWUFBWSxPQUFPLE9BQU8sVUFBVSxPQUFPLElBQUk7QUFBQSxjQUMvQyxXQUFXLE9BQU8sT0FBTyxTQUFTLEdBQUc7QUFBQSxjQUNyQyxjQUFjLE9BQU8sT0FBTyxVQUFVLE9BQU8sSUFBSTtBQUFBLGNBQ2pELGFBQWEsT0FBTyxPQUFPLFNBQVMsR0FBRztBQUFBLFlBQ3pDO0FBQUEsWUFDQSxJQUFJLFFBQVE7QUFBQSxjQUNWLE1BQU0sR0FBRyxRQUFRO0FBQUEsZ0JBQ2YsT0FBTyxPQUFPLFVBQVUsT0FBTyxJQUFJLE1BQU07QUFBQSxnQkFDekMsT0FBTyxPQUFPLFNBQVMsR0FBRyxNQUFNO0FBQUEsY0FDbEM7QUFBQSxZQUNGO0FBQUEsWUFDQSxJQUFJLEtBQUssY0FBYyxNQUFNLE9BQU87QUFBQSxjQUNsQztBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQSxZQUFZO0FBQUEsY0FDWixPQUFPO0FBQUEsY0FDUDtBQUFBLGNBQ0E7QUFBQSxZQUNGLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFBQSxZQUNkLElBQUksT0FBTyxNQUFNLGFBQWE7QUFBQSxjQUM1QixPQUFPO0FBQUEsWUFDVDtBQUFBLFlBQ0EsSUFBSSxLQUFLO0FBQUEsY0FDUCxRQUFRLE1BQU0sTUFBTSxHQUFHLEtBQUssTUFBTSxDQUFDO0FBQUEsY0FDbkMsU0FBUyxPQUFPLE1BQU0sR0FBRyxLQUFLLEdBQUc7QUFBQSxjQUNqQyxTQUFTLE9BQU8sTUFBTSxHQUFHLEtBQUssR0FBRztBQUFBLFlBQ25DO0FBQUEsWUFDQSxNQUFNLEtBQUssS0FBSyxhQUFhLE9BQU8sSUFBSSxFQUFFO0FBQUEsWUFDMUMsT0FBTyxLQUFLLE1BQU0sQ0FBQztBQUFBLFlBQ25CLE9BQU8sS0FBSyxNQUFNLEVBQUU7QUFBQSxZQUNwQixXQUFXLE1BQU0sTUFBTSxNQUFNLFNBQVMsSUFBSSxNQUFNLE1BQU0sU0FBUztBQUFBLFlBQy9ELE1BQU0sS0FBSyxRQUFRO0FBQUEsWUFDbkI7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUE7QUFBQSxNQUViO0FBQUEsTUFDQSxPQUFPO0FBQUEsT0FDTixPQUFPO0FBQUEsRUFDWjtBQUFBLEVBQ0EsSUFBSSx3QkFBeUIsUUFBUSxHQUFHO0FBQUEsSUFDdEMsSUFBSSxTQUFTO0FBQUEsTUFDWCxLQUFLO0FBQUEsTUFDTCw0QkFBNEIsT0FBTyxTQUFTLFVBQVUsQ0FBQyxLQUFLLE1BQU07QUFBQSxRQUNoRSxJQUFJLEtBQUssR0FBRyxRQUFRO0FBQUEsVUFDbEIsS0FBSyxHQUFHLE9BQU8sV0FBVyxLQUFLLElBQUk7QUFBQSxRQUNyQyxFQUFPO0FBQUEsVUFDTCxNQUFNLElBQUksTUFBTSxHQUFHO0FBQUE7QUFBQSxTQUVwQixZQUFZO0FBQUEsTUFFZiwwQkFBMEIsT0FBTyxRQUFRLENBQUMsT0FBTyxJQUFJO0FBQUEsUUFDbkQsS0FBSyxLQUFLLE1BQU0sS0FBSyxNQUFNLENBQUM7QUFBQSxRQUM1QixLQUFLLFNBQVM7QUFBQSxRQUNkLEtBQUssUUFBUSxLQUFLLGFBQWEsS0FBSyxPQUFPO0FBQUEsUUFDM0MsS0FBSyxXQUFXLEtBQUssU0FBUztBQUFBLFFBQzlCLEtBQUssU0FBUyxLQUFLLFVBQVUsS0FBSyxRQUFRO0FBQUEsUUFDMUMsS0FBSyxpQkFBaUIsQ0FBQyxTQUFTO0FBQUEsUUFDaEMsS0FBSyxTQUFTO0FBQUEsVUFDWixZQUFZO0FBQUEsVUFDWixjQUFjO0FBQUEsVUFDZCxXQUFXO0FBQUEsVUFDWCxhQUFhO0FBQUEsUUFDZjtBQUFBLFFBQ0EsSUFBSSxLQUFLLFFBQVEsUUFBUTtBQUFBLFVBQ3ZCLEtBQUssT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDO0FBQUEsUUFDM0I7QUFBQSxRQUNBLEtBQUssU0FBUztBQUFBLFFBQ2QsT0FBTztBQUFBLFNBQ04sVUFBVTtBQUFBLE1BRWIsdUJBQXVCLE9BQU8sUUFBUSxHQUFHO0FBQUEsUUFDdkMsSUFBSSxLQUFLLEtBQUssT0FBTztBQUFBLFFBQ3JCLEtBQUssVUFBVTtBQUFBLFFBQ2YsS0FBSztBQUFBLFFBQ0wsS0FBSztBQUFBLFFBQ0wsS0FBSyxTQUFTO0FBQUEsUUFDZCxLQUFLLFdBQVc7QUFBQSxRQUNoQixJQUFJLFFBQVEsR0FBRyxNQUFNLGlCQUFpQjtBQUFBLFFBQ3RDLElBQUksT0FBTztBQUFBLFVBQ1QsS0FBSztBQUFBLFVBQ0wsS0FBSyxPQUFPO0FBQUEsUUFDZCxFQUFPO0FBQUEsVUFDTCxLQUFLLE9BQU87QUFBQTtBQUFBLFFBRWQsSUFBSSxLQUFLLFFBQVEsUUFBUTtBQUFBLFVBQ3ZCLEtBQUssT0FBTyxNQUFNO0FBQUEsUUFDcEI7QUFBQSxRQUNBLEtBQUssU0FBUyxLQUFLLE9BQU8sTUFBTSxDQUFDO0FBQUEsUUFDakMsT0FBTztBQUFBLFNBQ04sT0FBTztBQUFBLE1BRVYsdUJBQXVCLE9BQU8sUUFBUSxDQUFDLElBQUk7QUFBQSxRQUN6QyxJQUFJLE1BQU0sR0FBRztBQUFBLFFBQ2IsSUFBSSxRQUFRLEdBQUcsTUFBTSxlQUFlO0FBQUEsUUFDcEMsS0FBSyxTQUFTLEtBQUssS0FBSztBQUFBLFFBQ3hCLEtBQUssU0FBUyxLQUFLLE9BQU8sT0FBTyxHQUFHLEtBQUssT0FBTyxTQUFTLEdBQUc7QUFBQSxRQUM1RCxLQUFLLFVBQVU7QUFBQSxRQUNmLElBQUksV0FBVyxLQUFLLE1BQU0sTUFBTSxlQUFlO0FBQUEsUUFDL0MsS0FBSyxRQUFRLEtBQUssTUFBTSxPQUFPLEdBQUcsS0FBSyxNQUFNLFNBQVMsQ0FBQztBQUFBLFFBQ3ZELEtBQUssVUFBVSxLQUFLLFFBQVEsT0FBTyxHQUFHLEtBQUssUUFBUSxTQUFTLENBQUM7QUFBQSxRQUM3RCxJQUFJLE1BQU0sU0FBUyxHQUFHO0FBQUEsVUFDcEIsS0FBSyxZQUFZLE1BQU0sU0FBUztBQUFBLFFBQ2xDO0FBQUEsUUFDQSxJQUFJLElBQUksS0FBSyxPQUFPO0FBQUEsUUFDcEIsS0FBSyxTQUFTO0FBQUEsVUFDWixZQUFZLEtBQUssT0FBTztBQUFBLFVBQ3hCLFdBQVcsS0FBSyxXQUFXO0FBQUEsVUFDM0IsY0FBYyxLQUFLLE9BQU87QUFBQSxVQUMxQixhQUFhLFNBQVMsTUFBTSxXQUFXLFNBQVMsU0FBUyxLQUFLLE9BQU8sZUFBZSxLQUFLLFNBQVMsU0FBUyxTQUFTLE1BQU0sUUFBUSxTQUFTLE1BQU0sR0FBRyxTQUFTLEtBQUssT0FBTyxlQUFlO0FBQUEsUUFDMUw7QUFBQSxRQUNBLElBQUksS0FBSyxRQUFRLFFBQVE7QUFBQSxVQUN2QixLQUFLLE9BQU8sUUFBUSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssS0FBSyxTQUFTLEdBQUc7QUFBQSxRQUNyRDtBQUFBLFFBQ0EsS0FBSyxTQUFTLEtBQUssT0FBTztBQUFBLFFBQzFCLE9BQU87QUFBQSxTQUNOLE9BQU87QUFBQSxNQUVWLHNCQUFzQixPQUFPLFFBQVEsR0FBRztBQUFBLFFBQ3RDLEtBQUssUUFBUTtBQUFBLFFBQ2IsT0FBTztBQUFBLFNBQ04sTUFBTTtBQUFBLE1BRVQsd0JBQXdCLE9BQU8sUUFBUSxHQUFHO0FBQUEsUUFDeEMsSUFBSSxLQUFLLFFBQVEsaUJBQWlCO0FBQUEsVUFDaEMsS0FBSyxhQUFhO0FBQUEsUUFDcEIsRUFBTztBQUFBLFVBQ0wsT0FBTyxLQUFLLFdBQVcsNEJBQTRCLEtBQUssV0FBVyxLQUFLO0FBQUEsSUFBcUksS0FBSyxhQUFhLEdBQUc7QUFBQSxZQUNoTyxNQUFNO0FBQUEsWUFDTixPQUFPO0FBQUEsWUFDUCxNQUFNLEtBQUs7QUFBQSxVQUNiLENBQUM7QUFBQTtBQUFBLFFBRUgsT0FBTztBQUFBLFNBQ04sUUFBUTtBQUFBLE1BRVgsc0JBQXNCLE9BQU8sUUFBUSxDQUFDLEdBQUc7QUFBQSxRQUN2QyxLQUFLLE1BQU0sS0FBSyxNQUFNLE1BQU0sQ0FBQyxDQUFDO0FBQUEsU0FDN0IsTUFBTTtBQUFBLE1BRVQsMkJBQTJCLE9BQU8sUUFBUSxHQUFHO0FBQUEsUUFDM0MsSUFBSSxPQUFPLEtBQUssUUFBUSxPQUFPLEdBQUcsS0FBSyxRQUFRLFNBQVMsS0FBSyxNQUFNLE1BQU07QUFBQSxRQUN6RSxRQUFRLEtBQUssU0FBUyxLQUFLLFFBQVEsTUFBTSxLQUFLLE9BQU8sR0FBRyxFQUFFLFFBQVEsT0FBTyxFQUFFO0FBQUEsU0FDMUUsV0FBVztBQUFBLE1BRWQsK0JBQStCLE9BQU8sUUFBUSxHQUFHO0FBQUEsUUFDL0MsSUFBSSxPQUFPLEtBQUs7QUFBQSxRQUNoQixJQUFJLEtBQUssU0FBUyxJQUFJO0FBQUEsVUFDcEIsUUFBUSxLQUFLLE9BQU8sT0FBTyxHQUFHLEtBQUssS0FBSyxNQUFNO0FBQUEsUUFDaEQ7QUFBQSxRQUNBLFFBQVEsS0FBSyxPQUFPLEdBQUcsRUFBRSxLQUFLLEtBQUssU0FBUyxLQUFLLFFBQVEsS0FBSyxRQUFRLE9BQU8sRUFBRTtBQUFBLFNBQzlFLGVBQWU7QUFBQSxNQUVsQiw4QkFBOEIsT0FBTyxRQUFRLEdBQUc7QUFBQSxRQUM5QyxJQUFJLE1BQU0sS0FBSyxVQUFVO0FBQUEsUUFDekIsSUFBSSxJQUFJLElBQUksTUFBTSxJQUFJLFNBQVMsQ0FBQyxFQUFFLEtBQUssR0FBRztBQUFBLFFBQzFDLE9BQU8sTUFBTSxLQUFLLGNBQWMsSUFBSTtBQUFBLElBQU8sSUFBSTtBQUFBLFNBQzlDLGNBQWM7QUFBQSxNQUVqQiw0QkFBNEIsT0FBTyxRQUFRLENBQUMsT0FBTyxjQUFjO0FBQUEsUUFDL0QsSUFBSSxPQUFPLE9BQU87QUFBQSxRQUNsQixJQUFJLEtBQUssUUFBUSxpQkFBaUI7QUFBQSxVQUNoQyxTQUFTO0FBQUEsWUFDUCxVQUFVLEtBQUs7QUFBQSxZQUNmLFFBQVE7QUFBQSxjQUNOLFlBQVksS0FBSyxPQUFPO0FBQUEsY0FDeEIsV0FBVyxLQUFLO0FBQUEsY0FDaEIsY0FBYyxLQUFLLE9BQU87QUFBQSxjQUMxQixhQUFhLEtBQUssT0FBTztBQUFBLFlBQzNCO0FBQUEsWUFDQSxRQUFRLEtBQUs7QUFBQSxZQUNiLE9BQU8sS0FBSztBQUFBLFlBQ1osU0FBUyxLQUFLO0FBQUEsWUFDZCxTQUFTLEtBQUs7QUFBQSxZQUNkLFFBQVEsS0FBSztBQUFBLFlBQ2IsUUFBUSxLQUFLO0FBQUEsWUFDYixPQUFPLEtBQUs7QUFBQSxZQUNaLFFBQVEsS0FBSztBQUFBLFlBQ2IsSUFBSSxLQUFLO0FBQUEsWUFDVCxnQkFBZ0IsS0FBSyxlQUFlLE1BQU0sQ0FBQztBQUFBLFlBQzNDLE1BQU0sS0FBSztBQUFBLFVBQ2I7QUFBQSxVQUNBLElBQUksS0FBSyxRQUFRLFFBQVE7QUFBQSxZQUN2QixPQUFPLE9BQU8sUUFBUSxLQUFLLE9BQU8sTUFBTSxNQUFNLENBQUM7QUFBQSxVQUNqRDtBQUFBLFFBQ0Y7QUFBQSxRQUNBLFFBQVEsTUFBTSxHQUFHLE1BQU0saUJBQWlCO0FBQUEsUUFDeEMsSUFBSSxPQUFPO0FBQUEsVUFDVCxLQUFLLFlBQVksTUFBTTtBQUFBLFFBQ3pCO0FBQUEsUUFDQSxLQUFLLFNBQVM7QUFBQSxVQUNaLFlBQVksS0FBSyxPQUFPO0FBQUEsVUFDeEIsV0FBVyxLQUFLLFdBQVc7QUFBQSxVQUMzQixjQUFjLEtBQUssT0FBTztBQUFBLFVBQzFCLGFBQWEsUUFBUSxNQUFNLE1BQU0sU0FBUyxHQUFHLFNBQVMsTUFBTSxNQUFNLFNBQVMsR0FBRyxNQUFNLFFBQVEsRUFBRSxHQUFHLFNBQVMsS0FBSyxPQUFPLGNBQWMsTUFBTSxHQUFHO0FBQUEsUUFDL0k7QUFBQSxRQUNBLEtBQUssVUFBVSxNQUFNO0FBQUEsUUFDckIsS0FBSyxTQUFTLE1BQU07QUFBQSxRQUNwQixLQUFLLFVBQVU7QUFBQSxRQUNmLEtBQUssU0FBUyxLQUFLLE9BQU87QUFBQSxRQUMxQixJQUFJLEtBQUssUUFBUSxRQUFRO0FBQUEsVUFDdkIsS0FBSyxPQUFPLFFBQVEsQ0FBQyxLQUFLLFFBQVEsS0FBSyxVQUFVLEtBQUssTUFBTTtBQUFBLFFBQzlEO0FBQUEsUUFDQSxLQUFLLFFBQVE7QUFBQSxRQUNiLEtBQUssYUFBYTtBQUFBLFFBQ2xCLEtBQUssU0FBUyxLQUFLLE9BQU8sTUFBTSxNQUFNLEdBQUcsTUFBTTtBQUFBLFFBQy9DLEtBQUssV0FBVyxNQUFNO0FBQUEsUUFDdEIsUUFBUSxLQUFLLGNBQWMsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLGNBQWMsS0FBSyxlQUFlLEtBQUssZUFBZSxTQUFTLEVBQUU7QUFBQSxRQUN0SCxJQUFJLEtBQUssUUFBUSxLQUFLLFFBQVE7QUFBQSxVQUM1QixLQUFLLE9BQU87QUFBQSxRQUNkO0FBQUEsUUFDQSxJQUFJLE9BQU87QUFBQSxVQUNULE9BQU87QUFBQSxRQUNULEVBQU8sU0FBSSxLQUFLLFlBQVk7QUFBQSxVQUMxQixTQUFTLEtBQUssUUFBUTtBQUFBLFlBQ3BCLEtBQUssS0FBSyxPQUFPO0FBQUEsVUFDbkI7QUFBQSxVQUNBLE9BQU87QUFBQSxRQUNUO0FBQUEsUUFDQSxPQUFPO0FBQUEsU0FDTixZQUFZO0FBQUEsTUFFZixzQkFBc0IsT0FBTyxRQUFRLEdBQUc7QUFBQSxRQUN0QyxJQUFJLEtBQUssTUFBTTtBQUFBLFVBQ2IsT0FBTyxLQUFLO0FBQUEsUUFDZDtBQUFBLFFBQ0EsSUFBSSxDQUFDLEtBQUssUUFBUTtBQUFBLFVBQ2hCLEtBQUssT0FBTztBQUFBLFFBQ2Q7QUFBQSxRQUNBLElBQUksT0FBTyxPQUFPLFdBQVc7QUFBQSxRQUM3QixJQUFJLENBQUMsS0FBSyxPQUFPO0FBQUEsVUFDZixLQUFLLFNBQVM7QUFBQSxVQUNkLEtBQUssUUFBUTtBQUFBLFFBQ2Y7QUFBQSxRQUNBLElBQUksUUFBUSxLQUFLLGNBQWM7QUFBQSxRQUMvQixTQUFTLElBQUksRUFBRyxJQUFJLE1BQU0sUUFBUSxLQUFLO0FBQUEsVUFDckMsWUFBWSxLQUFLLE9BQU8sTUFBTSxLQUFLLE1BQU0sTUFBTSxHQUFHO0FBQUEsVUFDbEQsSUFBSSxjQUFjLENBQUMsU0FBUyxVQUFVLEdBQUcsU0FBUyxNQUFNLEdBQUcsU0FBUztBQUFBLFlBQ2xFLFFBQVE7QUFBQSxZQUNSLFFBQVE7QUFBQSxZQUNSLElBQUksS0FBSyxRQUFRLGlCQUFpQjtBQUFBLGNBQ2hDLFFBQVEsS0FBSyxXQUFXLFdBQVcsTUFBTSxFQUFFO0FBQUEsY0FDM0MsSUFBSSxVQUFVLE9BQU87QUFBQSxnQkFDbkIsT0FBTztBQUFBLGNBQ1QsRUFBTyxTQUFJLEtBQUssWUFBWTtBQUFBLGdCQUMxQixRQUFRO0FBQUEsZ0JBQ1I7QUFBQSxjQUNGLEVBQU87QUFBQSxnQkFDTCxPQUFPO0FBQUE7QUFBQSxZQUVYLEVBQU8sU0FBSSxDQUFDLEtBQUssUUFBUSxNQUFNO0FBQUEsY0FDN0I7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxRQUNBLElBQUksT0FBTztBQUFBLFVBQ1QsUUFBUSxLQUFLLFdBQVcsT0FBTyxNQUFNLE1BQU07QUFBQSxVQUMzQyxJQUFJLFVBQVUsT0FBTztBQUFBLFlBQ25CLE9BQU87QUFBQSxVQUNUO0FBQUEsVUFDQSxPQUFPO0FBQUEsUUFDVDtBQUFBLFFBQ0EsSUFBSSxLQUFLLFdBQVcsSUFBSTtBQUFBLFVBQ3RCLE9BQU8sS0FBSztBQUFBLFFBQ2QsRUFBTztBQUFBLFVBQ0wsT0FBTyxLQUFLLFdBQVcsNEJBQTRCLEtBQUssV0FBVyxLQUFLO0FBQUEsSUFBMkIsS0FBSyxhQUFhLEdBQUc7QUFBQSxZQUN0SCxNQUFNO0FBQUEsWUFDTixPQUFPO0FBQUEsWUFDUCxNQUFNLEtBQUs7QUFBQSxVQUNiLENBQUM7QUFBQTtBQUFBLFNBRUYsTUFBTTtBQUFBLE1BRVQscUJBQXFCLE9BQU8sU0FBUyxHQUFHLEdBQUc7QUFBQSxRQUN6QyxJQUFJLElBQUksS0FBSyxLQUFLO0FBQUEsUUFDbEIsSUFBSSxHQUFHO0FBQUEsVUFDTCxPQUFPO0FBQUEsUUFDVCxFQUFPO0FBQUEsVUFDTCxPQUFPLEtBQUssSUFBSTtBQUFBO0FBQUEsU0FFakIsS0FBSztBQUFBLE1BRVIsdUJBQXVCLE9BQU8sU0FBUyxLQUFLLENBQUMsV0FBVztBQUFBLFFBQ3RELEtBQUssZUFBZSxLQUFLLFNBQVM7QUFBQSxTQUNqQyxPQUFPO0FBQUEsTUFFViwwQkFBMEIsT0FBTyxTQUFTLFFBQVEsR0FBRztBQUFBLFFBQ25ELElBQUksSUFBSSxLQUFLLGVBQWUsU0FBUztBQUFBLFFBQ3JDLElBQUksSUFBSSxHQUFHO0FBQUEsVUFDVCxPQUFPLEtBQUssZUFBZSxJQUFJO0FBQUEsUUFDakMsRUFBTztBQUFBLFVBQ0wsT0FBTyxLQUFLLGVBQWU7QUFBQTtBQUFBLFNBRTVCLFVBQVU7QUFBQSxNQUViLCtCQUErQixPQUFPLFNBQVMsYUFBYSxHQUFHO0FBQUEsUUFDN0QsSUFBSSxLQUFLLGVBQWUsVUFBVSxLQUFLLGVBQWUsS0FBSyxlQUFlLFNBQVMsSUFBSTtBQUFBLFVBQ3JGLE9BQU8sS0FBSyxXQUFXLEtBQUssZUFBZSxLQUFLLGVBQWUsU0FBUyxJQUFJO0FBQUEsUUFDOUUsRUFBTztBQUFBLFVBQ0wsT0FBTyxLQUFLLFdBQVcsV0FBVztBQUFBO0FBQUEsU0FFbkMsZUFBZTtBQUFBLE1BRWxCLDBCQUEwQixPQUFPLFNBQVMsUUFBUSxDQUFDLEdBQUc7QUFBQSxRQUNwRCxJQUFJLEtBQUssZUFBZSxTQUFTLElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQztBQUFBLFFBQ3BELElBQUksS0FBSyxHQUFHO0FBQUEsVUFDVixPQUFPLEtBQUssZUFBZTtBQUFBLFFBQzdCLEVBQU87QUFBQSxVQUNMLE9BQU87QUFBQTtBQUFBLFNBRVIsVUFBVTtBQUFBLE1BRWIsMkJBQTJCLE9BQU8sU0FBUyxTQUFTLENBQUMsV0FBVztBQUFBLFFBQzlELEtBQUssTUFBTSxTQUFTO0FBQUEsU0FDbkIsV0FBVztBQUFBLE1BRWQsZ0NBQWdDLE9BQU8sU0FBUyxjQUFjLEdBQUc7QUFBQSxRQUMvRCxPQUFPLEtBQUssZUFBZTtBQUFBLFNBQzFCLGdCQUFnQjtBQUFBLE1BQ25CLFNBQVMsRUFBRSxvQkFBb0IsS0FBSztBQUFBLE1BQ3BDLCtCQUErQixPQUFPLFNBQVMsU0FBUyxDQUFDLElBQUksS0FBSywyQkFBMkIsVUFBVTtBQUFBLFFBQ3JHLElBQUksVUFBVTtBQUFBLFFBQ2QsUUFBUTtBQUFBLGVBQ0Q7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsS0FBSyxNQUFNLFdBQVc7QUFBQSxZQUN0QixPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILEtBQUssU0FBUztBQUFBLFlBQ2QsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxLQUFLLE1BQU0sV0FBVztBQUFBLFlBQ3RCLE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsS0FBSyxTQUFTO0FBQUEsWUFDZCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILEtBQUssTUFBTSxxQkFBcUI7QUFBQSxZQUNoQztBQUFBLGVBQ0c7QUFBQSxZQUNILEtBQUssU0FBUztBQUFBLFlBQ2Q7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSDtBQUFBLGVBQ0c7QUFBQSxZQUNIO0FBQUEsZUFDRztBQUFBLFlBQ0g7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxLQUFLLE1BQU0sT0FBTztBQUFBLFlBQ2xCLE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0g7QUFBQSxlQUNHO0FBQUEsWUFDSCxLQUFLLE1BQU0sUUFBUTtBQUFBLFlBQ25CO0FBQUEsZUFDRztBQUFBLFlBQ0gsS0FBSyxTQUFTO0FBQUEsWUFDZDtBQUFBLGVBQ0c7QUFBQSxZQUNILEtBQUssTUFBTSxPQUFPO0FBQUEsWUFDbEIsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxLQUFLLE1BQU0sT0FBTztBQUFBLFlBQ2xCLE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsS0FBSyxNQUFNLFFBQVE7QUFBQSxZQUNuQjtBQUFBLGVBQ0c7QUFBQSxZQUNILEtBQUssU0FBUztBQUFBLFlBQ2Q7QUFBQSxlQUNHO0FBQUEsWUFDSCxP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QUFjLENBQUMsTUFBTSxJQUFJLFVBQVUsTUFBTTtBQUFBLEVBQ3pFLElBQUksS0FBSyxPQUFPO0FBQUEsRUFDaEIsSUFBSSxLQUFLLHlDQUF5QyxFQUFFO0FBQUEsRUFDcEQsUUFBUSxlQUFlLE9BQU8sTUFBTSxRQUFRLFNBQVMsV0FBVztBQUFBLEVBQ2hFLE1BQU0sY0FBYyxLQUFLLEdBQUcsUUFBUTtBQUFBLEVBQ3BDLE1BQU0sTUFBTSxrQkFBa0IsSUFBSSxhQUFhO0FBQUEsRUFDL0MsWUFBWSxPQUFPLEtBQUs7QUFBQSxFQUN4QixZQUFZLGtCQUFrQiw2QkFBNkIsTUFBTTtBQUFBLEVBQ2pFLFlBQVksY0FBYyxNQUFNLGVBQWU7QUFBQSxFQUMvQyxZQUFZLGNBQWMsTUFBTSxlQUFlO0FBQUEsRUFDL0MsWUFBWSxVQUFVLFNBQVMsUUFBUSxDQUFDLDRCQUE0Qix1QkFBdUIsSUFBSSxDQUFDLHdCQUF3QixtQkFBbUI7QUFBQSxFQUMzSSxZQUFZLFlBQVk7QUFBQSxFQUN4QixNQUFNLE9BQU8sYUFBYSxHQUFHO0FBQUEsRUFDN0IsTUFBTSxVQUFVO0FBQUEsRUFDaEIsY0FBYyxZQUNaLEtBQ0EsK0JBQ0EsTUFBTSxrQkFBa0IsSUFDeEIsS0FBSyxHQUFHLGdCQUFnQixDQUMxQjtBQUFBLEVBQ0Esb0JBQW9CLEtBQUssU0FBUyxzQkFBc0IsTUFBTSxlQUFlLElBQUk7QUFBQSxHQUNoRixNQUFNO0FBR1QsSUFBSSxVQUFVO0FBQUEsRUFDWixRQUFRO0FBQUEsTUFDSixFQUFFLEdBQUc7QUFBQSxJQUNQLE9BQU8sSUFBSTtBQUFBO0FBQUEsRUFFYixVQUFVO0FBQUEsRUFDVixRQUFRO0FBQ1Y7IiwKICAiZGVidWdJZCI6ICIyOUM3NjY3MjM4OTdGNzY5NjQ3NTZFMjE2NDc1NkUyMSIsCiAgIm5hbWVzIjogW10KfQ==
