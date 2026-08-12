import {
  clear,
  configureSvgSize,
  defaultConfig_default,
  getAccDescription,
  getAccTitle,
  getConfig2,
  getDiagramTitle,
  getThemeVariables3,
  sanitizeText,
  setAccDescription,
  setAccTitle,
  setDiagramTitle
} from "./chunk-main-aws590jt.js";
import {
  __name,
  linear,
  log,
  select_default
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/quadrantDiagram-W4KKPZXB.mjs
var parser = function() {
  var o = /* @__PURE__ */ __name(function(k, v, o2, l) {
    for (o2 = o2 || {}, l = k.length;l--; o2[k[l]] = v)
      ;
    return o2;
  }, "o"), $V0 = [1, 3], $V1 = [1, 4], $V2 = [1, 5], $V3 = [1, 6], $V4 = [1, 7], $V5 = [1, 4, 5, 10, 12, 13, 14, 15, 18, 25, 35, 37, 39, 41, 42, 48, 50, 51, 52, 53, 54, 55, 56, 57, 60, 61, 63, 64, 65, 66, 67], $V6 = [1, 4, 5, 10, 12, 13, 14, 15, 18, 25, 28, 35, 37, 39, 41, 42, 48, 50, 51, 52, 53, 54, 55, 56, 57, 60, 61, 63, 64, 65, 66, 67], $V7 = [55, 56, 57], $V8 = [2, 36], $V9 = [1, 37], $Va = [1, 36], $Vb = [1, 38], $Vc = [1, 35], $Vd = [1, 43], $Ve = [1, 41], $Vf = [1, 45], $Vg = [1, 14], $Vh = [1, 23], $Vi = [1, 18], $Vj = [1, 19], $Vk = [1, 20], $Vl = [1, 21], $Vm = [1, 22], $Vn = [1, 24], $Vo = [1, 25], $Vp = [1, 26], $Vq = [1, 27], $Vr = [1, 28], $Vs = [1, 29], $Vt = [1, 32], $Vu = [1, 33], $Vv = [1, 34], $Vw = [1, 39], $Vx = [1, 40], $Vy = [1, 42], $Vz = [1, 44], $VA = [1, 63], $VB = [1, 62], $VC = [4, 5, 8, 10, 12, 13, 14, 15, 18, 44, 47, 49, 55, 56, 57, 63, 64, 65, 66, 67], $VD = [1, 66], $VE = [1, 67], $VF = [1, 68], $VG = [1, 69], $VH = [1, 70], $VI = [1, 71], $VJ = [1, 72], $VK = [1, 73], $VL = [1, 74], $VM = [1, 75], $VN = [1, 76], $VO = [1, 77], $VP = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 18], $VQ = [1, 91], $VR = [1, 92], $VS = [1, 93], $VT = [1, 100], $VU = [1, 94], $VV = [1, 97], $VW = [1, 95], $VX = [1, 96], $VY = [1, 98], $VZ = [1, 99], $V_ = [1, 103], $V$ = [10, 55, 56, 57], $V01 = [4, 5, 6, 8, 10, 11, 13, 17, 18, 19, 20, 55, 56, 57];
  var parser2 = {
    trace: /* @__PURE__ */ __name(function trace() {}, "trace"),
    yy: {},
    symbols_: { error: 2, idStringToken: 3, ALPHA: 4, NUM: 5, NODE_STRING: 6, DOWN: 7, MINUS: 8, DEFAULT: 9, COMMA: 10, COLON: 11, AMP: 12, BRKT: 13, MULT: 14, UNICODE_TEXT: 15, styleComponent: 16, UNIT: 17, SPACE: 18, STYLE: 19, PCT: 20, idString: 21, style: 22, stylesOpt: 23, classDefStatement: 24, CLASSDEF: 25, start: 26, eol: 27, QUADRANT: 28, document: 29, line: 30, statement: 31, axisDetails: 32, quadrantDetails: 33, points: 34, title: 35, title_value: 36, acc_title: 37, acc_title_value: 38, acc_descr: 39, acc_descr_value: 40, acc_descr_multiline_value: 41, section: 42, text: 43, point_start: 44, point_x: 45, point_y: 46, class_name: 47, "X-AXIS": 48, "AXIS-TEXT-DELIMITER": 49, "Y-AXIS": 50, QUADRANT_1: 51, QUADRANT_2: 52, QUADRANT_3: 53, QUADRANT_4: 54, NEWLINE: 55, SEMI: 56, EOF: 57, alphaNumToken: 58, textNoTagsToken: 59, STR: 60, MD_STR: 61, alphaNum: 62, PUNCTUATION: 63, PLUS: 64, EQUALS: 65, DOT: 66, UNDERSCORE: 67, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 4: "ALPHA", 5: "NUM", 6: "NODE_STRING", 7: "DOWN", 8: "MINUS", 9: "DEFAULT", 10: "COMMA", 11: "COLON", 12: "AMP", 13: "BRKT", 14: "MULT", 15: "UNICODE_TEXT", 17: "UNIT", 18: "SPACE", 19: "STYLE", 20: "PCT", 25: "CLASSDEF", 28: "QUADRANT", 35: "title", 36: "title_value", 37: "acc_title", 38: "acc_title_value", 39: "acc_descr", 40: "acc_descr_value", 41: "acc_descr_multiline_value", 42: "section", 44: "point_start", 45: "point_x", 46: "point_y", 47: "class_name", 48: "X-AXIS", 49: "AXIS-TEXT-DELIMITER", 50: "Y-AXIS", 51: "QUADRANT_1", 52: "QUADRANT_2", 53: "QUADRANT_3", 54: "QUADRANT_4", 55: "NEWLINE", 56: "SEMI", 57: "EOF", 60: "STR", 61: "MD_STR", 63: "PUNCTUATION", 64: "PLUS", 65: "EQUALS", 66: "DOT", 67: "UNDERSCORE" },
    productions_: [0, [3, 1], [3, 1], [3, 1], [3, 1], [3, 1], [3, 1], [3, 1], [3, 1], [3, 1], [3, 1], [3, 1], [3, 1], [16, 1], [16, 1], [16, 1], [16, 1], [16, 1], [16, 1], [16, 1], [16, 1], [16, 1], [16, 1], [21, 1], [21, 2], [22, 1], [22, 2], [23, 1], [23, 3], [24, 5], [26, 2], [26, 2], [26, 2], [29, 0], [29, 2], [30, 2], [31, 0], [31, 1], [31, 2], [31, 1], [31, 1], [31, 1], [31, 2], [31, 2], [31, 2], [31, 1], [31, 1], [34, 4], [34, 5], [34, 5], [34, 6], [32, 4], [32, 3], [32, 2], [32, 4], [32, 3], [32, 2], [33, 2], [33, 2], [33, 2], [33, 2], [27, 1], [27, 1], [27, 1], [43, 1], [43, 2], [43, 1], [43, 1], [62, 1], [62, 2], [58, 1], [58, 1], [58, 1], [58, 1], [58, 1], [58, 1], [58, 1], [58, 1], [58, 1], [58, 1], [58, 1], [58, 1], [59, 1], [59, 1], [59, 1]],
    performAction: /* @__PURE__ */ __name(function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
      var $0 = $$.length - 1;
      switch (yystate) {
        case 23:
          this.$ = $$[$0];
          break;
        case 24:
          this.$ = $$[$0 - 1] + "" + $$[$0];
          break;
        case 26:
          this.$ = $$[$0 - 1] + $$[$0];
          break;
        case 27:
          this.$ = [$$[$0].trim()];
          break;
        case 28:
          $$[$0 - 2].push($$[$0].trim());
          this.$ = $$[$0 - 2];
          break;
        case 29:
          this.$ = $$[$0 - 4];
          yy.addClass($$[$0 - 2], $$[$0]);
          break;
        case 37:
          this.$ = [];
          break;
        case 42:
          this.$ = $$[$0].trim();
          yy.setDiagramTitle(this.$);
          break;
        case 43:
          this.$ = $$[$0].trim();
          yy.setAccTitle(this.$);
          break;
        case 44:
        case 45:
          this.$ = $$[$0].trim();
          yy.setAccDescription(this.$);
          break;
        case 46:
          yy.addSection($$[$0].substr(8));
          this.$ = $$[$0].substr(8);
          break;
        case 47:
          yy.addPoint($$[$0 - 3], "", $$[$0 - 1], $$[$0], []);
          break;
        case 48:
          yy.addPoint($$[$0 - 4], $$[$0 - 3], $$[$0 - 1], $$[$0], []);
          break;
        case 49:
          yy.addPoint($$[$0 - 4], "", $$[$0 - 2], $$[$0 - 1], $$[$0]);
          break;
        case 50:
          yy.addPoint($$[$0 - 5], $$[$0 - 4], $$[$0 - 2], $$[$0 - 1], $$[$0]);
          break;
        case 51:
          yy.setXAxisLeftText($$[$0 - 2]);
          yy.setXAxisRightText($$[$0]);
          break;
        case 52:
          $$[$0 - 1].text += " ⟶ ";
          yy.setXAxisLeftText($$[$0 - 1]);
          break;
        case 53:
          yy.setXAxisLeftText($$[$0]);
          break;
        case 54:
          yy.setYAxisBottomText($$[$0 - 2]);
          yy.setYAxisTopText($$[$0]);
          break;
        case 55:
          $$[$0 - 1].text += " ⟶ ";
          yy.setYAxisBottomText($$[$0 - 1]);
          break;
        case 56:
          yy.setYAxisBottomText($$[$0]);
          break;
        case 57:
          yy.setQuadrant1Text($$[$0]);
          break;
        case 58:
          yy.setQuadrant2Text($$[$0]);
          break;
        case 59:
          yy.setQuadrant3Text($$[$0]);
          break;
        case 60:
          yy.setQuadrant4Text($$[$0]);
          break;
        case 64:
          this.$ = { text: $$[$0], type: "text" };
          break;
        case 65:
          this.$ = { text: $$[$0 - 1].text + "" + $$[$0], type: $$[$0 - 1].type };
          break;
        case 66:
          this.$ = { text: $$[$0], type: "text" };
          break;
        case 67:
          this.$ = { text: $$[$0], type: "markdown" };
          break;
        case 68:
          this.$ = $$[$0];
          break;
        case 69:
          this.$ = $$[$0 - 1] + "" + $$[$0];
          break;
      }
    }, "anonymous"),
    table: [{ 18: $V0, 26: 1, 27: 2, 28: $V1, 55: $V2, 56: $V3, 57: $V4 }, { 1: [3] }, { 18: $V0, 26: 8, 27: 2, 28: $V1, 55: $V2, 56: $V3, 57: $V4 }, { 18: $V0, 26: 9, 27: 2, 28: $V1, 55: $V2, 56: $V3, 57: $V4 }, o($V5, [2, 33], { 29: 10 }), o($V6, [2, 61]), o($V6, [2, 62]), o($V6, [2, 63]), { 1: [2, 30] }, { 1: [2, 31] }, o($V7, $V8, { 30: 11, 31: 12, 24: 13, 32: 15, 33: 16, 34: 17, 43: 30, 58: 31, 1: [2, 32], 4: $V9, 5: $Va, 10: $Vb, 12: $Vc, 13: $Vd, 14: $Ve, 15: $Vf, 18: $Vg, 25: $Vh, 35: $Vi, 37: $Vj, 39: $Vk, 41: $Vl, 42: $Vm, 48: $Vn, 50: $Vo, 51: $Vp, 52: $Vq, 53: $Vr, 54: $Vs, 60: $Vt, 61: $Vu, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz }), o($V5, [2, 34]), { 27: 46, 55: $V2, 56: $V3, 57: $V4 }, o($V7, [2, 37]), o($V7, $V8, { 24: 13, 32: 15, 33: 16, 34: 17, 43: 30, 58: 31, 31: 47, 4: $V9, 5: $Va, 10: $Vb, 12: $Vc, 13: $Vd, 14: $Ve, 15: $Vf, 18: $Vg, 25: $Vh, 35: $Vi, 37: $Vj, 39: $Vk, 41: $Vl, 42: $Vm, 48: $Vn, 50: $Vo, 51: $Vp, 52: $Vq, 53: $Vr, 54: $Vs, 60: $Vt, 61: $Vu, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz }), o($V7, [2, 39]), o($V7, [2, 40]), o($V7, [2, 41]), { 36: [1, 48] }, { 38: [1, 49] }, { 40: [1, 50] }, o($V7, [2, 45]), o($V7, [2, 46]), { 18: [1, 51] }, { 4: $V9, 5: $Va, 10: $Vb, 12: $Vc, 13: $Vd, 14: $Ve, 15: $Vf, 43: 52, 58: 31, 60: $Vt, 61: $Vu, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz }, { 4: $V9, 5: $Va, 10: $Vb, 12: $Vc, 13: $Vd, 14: $Ve, 15: $Vf, 43: 53, 58: 31, 60: $Vt, 61: $Vu, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz }, { 4: $V9, 5: $Va, 10: $Vb, 12: $Vc, 13: $Vd, 14: $Ve, 15: $Vf, 43: 54, 58: 31, 60: $Vt, 61: $Vu, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz }, { 4: $V9, 5: $Va, 10: $Vb, 12: $Vc, 13: $Vd, 14: $Ve, 15: $Vf, 43: 55, 58: 31, 60: $Vt, 61: $Vu, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz }, { 4: $V9, 5: $Va, 10: $Vb, 12: $Vc, 13: $Vd, 14: $Ve, 15: $Vf, 43: 56, 58: 31, 60: $Vt, 61: $Vu, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz }, { 4: $V9, 5: $Va, 10: $Vb, 12: $Vc, 13: $Vd, 14: $Ve, 15: $Vf, 43: 57, 58: 31, 60: $Vt, 61: $Vu, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz }, { 4: $V9, 5: $Va, 8: $VA, 10: $Vb, 12: $Vc, 13: $Vd, 14: $Ve, 15: $Vf, 18: $VB, 44: [1, 58], 47: [1, 59], 58: 61, 59: 60, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz }, o($VC, [2, 64]), o($VC, [2, 66]), o($VC, [2, 67]), o($VC, [2, 70]), o($VC, [2, 71]), o($VC, [2, 72]), o($VC, [2, 73]), o($VC, [2, 74]), o($VC, [2, 75]), o($VC, [2, 76]), o($VC, [2, 77]), o($VC, [2, 78]), o($VC, [2, 79]), o($VC, [2, 80]), o($VC, [2, 81]), o($V5, [2, 35]), o($V7, [2, 38]), o($V7, [2, 42]), o($V7, [2, 43]), o($V7, [2, 44]), { 3: 65, 4: $VD, 5: $VE, 6: $VF, 7: $VG, 8: $VH, 9: $VI, 10: $VJ, 11: $VK, 12: $VL, 13: $VM, 14: $VN, 15: $VO, 21: 64 }, o($V7, [2, 53], { 59: 60, 58: 61, 4: $V9, 5: $Va, 8: $VA, 10: $Vb, 12: $Vc, 13: $Vd, 14: $Ve, 15: $Vf, 18: $VB, 49: [1, 78], 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz }), o($V7, [2, 56], { 59: 60, 58: 61, 4: $V9, 5: $Va, 8: $VA, 10: $Vb, 12: $Vc, 13: $Vd, 14: $Ve, 15: $Vf, 18: $VB, 49: [1, 79], 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz }), o($V7, [2, 57], { 59: 60, 58: 61, 4: $V9, 5: $Va, 8: $VA, 10: $Vb, 12: $Vc, 13: $Vd, 14: $Ve, 15: $Vf, 18: $VB, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz }), o($V7, [2, 58], { 59: 60, 58: 61, 4: $V9, 5: $Va, 8: $VA, 10: $Vb, 12: $Vc, 13: $Vd, 14: $Ve, 15: $Vf, 18: $VB, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz }), o($V7, [2, 59], { 59: 60, 58: 61, 4: $V9, 5: $Va, 8: $VA, 10: $Vb, 12: $Vc, 13: $Vd, 14: $Ve, 15: $Vf, 18: $VB, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz }), o($V7, [2, 60], { 59: 60, 58: 61, 4: $V9, 5: $Va, 8: $VA, 10: $Vb, 12: $Vc, 13: $Vd, 14: $Ve, 15: $Vf, 18: $VB, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz }), { 45: [1, 80] }, { 44: [1, 81] }, o($VC, [2, 65]), o($VC, [2, 82]), o($VC, [2, 83]), o($VC, [2, 84]), { 3: 83, 4: $VD, 5: $VE, 6: $VF, 7: $VG, 8: $VH, 9: $VI, 10: $VJ, 11: $VK, 12: $VL, 13: $VM, 14: $VN, 15: $VO, 18: [1, 82] }, o($VP, [2, 23]), o($VP, [2, 1]), o($VP, [2, 2]), o($VP, [2, 3]), o($VP, [2, 4]), o($VP, [2, 5]), o($VP, [2, 6]), o($VP, [2, 7]), o($VP, [2, 8]), o($VP, [2, 9]), o($VP, [2, 10]), o($VP, [2, 11]), o($VP, [2, 12]), o($V7, [2, 52], { 58: 31, 43: 84, 4: $V9, 5: $Va, 10: $Vb, 12: $Vc, 13: $Vd, 14: $Ve, 15: $Vf, 60: $Vt, 61: $Vu, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz }), o($V7, [2, 55], { 58: 31, 43: 85, 4: $V9, 5: $Va, 10: $Vb, 12: $Vc, 13: $Vd, 14: $Ve, 15: $Vf, 60: $Vt, 61: $Vu, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz }), { 46: [1, 86] }, { 45: [1, 87] }, { 4: $VQ, 5: $VR, 6: $VS, 8: $VT, 11: $VU, 13: $VV, 16: 90, 17: $VW, 18: $VX, 19: $VY, 20: $VZ, 22: 89, 23: 88 }, o($VP, [2, 24]), o($V7, [2, 51], { 59: 60, 58: 61, 4: $V9, 5: $Va, 8: $VA, 10: $Vb, 12: $Vc, 13: $Vd, 14: $Ve, 15: $Vf, 18: $VB, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz }), o($V7, [2, 54], { 59: 60, 58: 61, 4: $V9, 5: $Va, 8: $VA, 10: $Vb, 12: $Vc, 13: $Vd, 14: $Ve, 15: $Vf, 18: $VB, 63: $Vv, 64: $Vw, 65: $Vx, 66: $Vy, 67: $Vz }), o($V7, [2, 47], { 22: 89, 16: 90, 23: 101, 4: $VQ, 5: $VR, 6: $VS, 8: $VT, 11: $VU, 13: $VV, 17: $VW, 18: $VX, 19: $VY, 20: $VZ }), { 46: [1, 102] }, o($V7, [2, 29], { 10: $V_ }), o($V$, [2, 27], { 16: 104, 4: $VQ, 5: $VR, 6: $VS, 8: $VT, 11: $VU, 13: $VV, 17: $VW, 18: $VX, 19: $VY, 20: $VZ }), o($V01, [2, 25]), o($V01, [2, 13]), o($V01, [2, 14]), o($V01, [2, 15]), o($V01, [2, 16]), o($V01, [2, 17]), o($V01, [2, 18]), o($V01, [2, 19]), o($V01, [2, 20]), o($V01, [2, 21]), o($V01, [2, 22]), o($V7, [2, 49], { 10: $V_ }), o($V7, [2, 48], { 22: 89, 16: 90, 23: 105, 4: $VQ, 5: $VR, 6: $VS, 8: $VT, 11: $VU, 13: $VV, 17: $VW, 18: $VX, 19: $VY, 20: $VZ }), { 4: $VQ, 5: $VR, 6: $VS, 8: $VT, 11: $VU, 13: $VV, 16: 90, 17: $VW, 18: $VX, 19: $VY, 20: $VZ, 22: 106 }, o($V01, [2, 26]), o($V7, [2, 50], { 10: $V_ }), o($V$, [2, 28], { 16: 104, 4: $VQ, 5: $VR, 6: $VS, 8: $VT, 11: $VU, 13: $VV, 17: $VW, 18: $VX, 19: $VY, 20: $VZ })],
    defaultActions: { 8: [2, 30], 9: [2, 31] },
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
            break;
          case 1:
            break;
          case 2:
            return 55;
            break;
          case 3:
            break;
          case 4:
            this.begin("title");
            return 35;
            break;
          case 5:
            this.popState();
            return "title_value";
            break;
          case 6:
            this.begin("acc_title");
            return 37;
            break;
          case 7:
            this.popState();
            return "acc_title_value";
            break;
          case 8:
            this.begin("acc_descr");
            return 39;
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
            return 48;
            break;
          case 14:
            return 50;
            break;
          case 15:
            return 49;
            break;
          case 16:
            return 51;
            break;
          case 17:
            return 52;
            break;
          case 18:
            return 53;
            break;
          case 19:
            return 54;
            break;
          case 20:
            return 25;
            break;
          case 21:
            this.begin("md_string");
            break;
          case 22:
            return "MD_STR";
            break;
          case 23:
            this.popState();
            break;
          case 24:
            this.begin("string");
            break;
          case 25:
            this.popState();
            break;
          case 26:
            return "STR";
            break;
          case 27:
            this.begin("class_name");
            break;
          case 28:
            this.popState();
            return 47;
            break;
          case 29:
            this.begin("point_start");
            return 44;
            break;
          case 30:
            this.begin("point_x");
            return 45;
            break;
          case 31:
            this.popState();
            break;
          case 32:
            this.popState();
            this.begin("point_y");
            break;
          case 33:
            this.popState();
            return 46;
            break;
          case 34:
            return 28;
            break;
          case 35:
            return 4;
            break;
          case 36:
            return 15;
            break;
          case 37:
            return 11;
            break;
          case 38:
            return 64;
            break;
          case 39:
            return 10;
            break;
          case 40:
            return 65;
            break;
          case 41:
            return 65;
            break;
          case 42:
            return 14;
            break;
          case 43:
            return 13;
            break;
          case 44:
            return 67;
            break;
          case 45:
            return 66;
            break;
          case 46:
            return 12;
            break;
          case 47:
            return 8;
            break;
          case 48:
            return 5;
            break;
          case 49:
            return 18;
            break;
          case 50:
            return 56;
            break;
          case 51:
            return 63;
            break;
          case 52:
            return 57;
            break;
        }
      }, "anonymous"),
      rules: [/^(?:%%(?!\{)[^\n]*)/i, /^(?:[^\}]%%[^\n]*)/i, /^(?:[\n\r]+)/i, /^(?:%%[^\n]*)/i, /^(?:title\b)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accTitle\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*\{\s*)/i, /^(?:[\}])/i, /^(?:[^\}]*)/i, /^(?: *x-axis *)/i, /^(?: *y-axis *)/i, /^(?: *--+> *)/i, /^(?: *quadrant-1 *)/i, /^(?: *quadrant-2 *)/i, /^(?: *quadrant-3 *)/i, /^(?: *quadrant-4 *)/i, /^(?:classDef\b)/i, /^(?:["][`])/i, /^(?:[^`"]+)/i, /^(?:[`]["])/i, /^(?:["])/i, /^(?:["])/i, /^(?:[^"]*)/i, /^(?::::)/i, /^(?:^\w+)/i, /^(?:\s*:\s*\[\s*)/i, /^(?:(1)|(0(.\d+)?))/i, /^(?:\s*\] *)/i, /^(?:\s*,\s*)/i, /^(?:(1)|(0(.\d+)?))/i, /^(?: *quadrantChart *)/i, /^(?:[A-Za-z]+)/i, /^(?:[^\x00-\x7F]+)/i, /^(?::)/i, /^(?:\+)/i, /^(?:,)/i, /^(?:=)/i, /^(?:=)/i, /^(?:\*)/i, /^(?:#)/i, /^(?:[\_])/i, /^(?:\.)/i, /^(?:&)/i, /^(?:-)/i, /^(?:[0-9]+)/i, /^(?:\s)/i, /^(?:;)/i, /^(?:[!"#$%&'*+,-.`?\\_/])/i, /^(?:$)/i],
      conditions: { class_name: { rules: [28], inclusive: false }, point_y: { rules: [33], inclusive: false }, point_x: { rules: [32], inclusive: false }, point_start: { rules: [30, 31], inclusive: false }, acc_descr_multiline: { rules: [11, 12], inclusive: false }, acc_descr: { rules: [9], inclusive: false }, acc_title: { rules: [7], inclusive: false }, title: { rules: [5], inclusive: false }, md_string: { rules: [22, 23], inclusive: false }, string: { rules: [25, 26], inclusive: false }, INITIAL: { rules: [0, 1, 2, 3, 4, 6, 8, 10, 13, 14, 15, 16, 17, 18, 19, 20, 21, 24, 27, 29, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52], inclusive: true } }
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
var quadrant_default = parser;
var defaultThemeVariables = getThemeVariables3();
var QuadrantBuilder = class {
  constructor() {
    this.classes = /* @__PURE__ */ new Map;
    this.config = this.getDefaultConfig();
    this.themeConfig = this.getDefaultThemeConfig();
    this.data = this.getDefaultData();
  }
  static {
    __name(this, "QuadrantBuilder");
  }
  getDefaultData() {
    return {
      titleText: "",
      quadrant1Text: "",
      quadrant2Text: "",
      quadrant3Text: "",
      quadrant4Text: "",
      xAxisLeftText: "",
      xAxisRightText: "",
      yAxisBottomText: "",
      yAxisTopText: "",
      points: []
    };
  }
  getDefaultConfig() {
    return {
      showXAxis: true,
      showYAxis: true,
      showTitle: true,
      chartHeight: defaultConfig_default.quadrantChart?.chartWidth || 500,
      chartWidth: defaultConfig_default.quadrantChart?.chartHeight || 500,
      titlePadding: defaultConfig_default.quadrantChart?.titlePadding || 10,
      titleFontSize: defaultConfig_default.quadrantChart?.titleFontSize || 20,
      quadrantPadding: defaultConfig_default.quadrantChart?.quadrantPadding || 5,
      xAxisLabelPadding: defaultConfig_default.quadrantChart?.xAxisLabelPadding || 5,
      yAxisLabelPadding: defaultConfig_default.quadrantChart?.yAxisLabelPadding || 5,
      xAxisLabelFontSize: defaultConfig_default.quadrantChart?.xAxisLabelFontSize || 16,
      yAxisLabelFontSize: defaultConfig_default.quadrantChart?.yAxisLabelFontSize || 16,
      quadrantLabelFontSize: defaultConfig_default.quadrantChart?.quadrantLabelFontSize || 16,
      quadrantTextTopPadding: defaultConfig_default.quadrantChart?.quadrantTextTopPadding || 5,
      pointTextPadding: defaultConfig_default.quadrantChart?.pointTextPadding || 5,
      pointLabelFontSize: defaultConfig_default.quadrantChart?.pointLabelFontSize || 12,
      pointRadius: defaultConfig_default.quadrantChart?.pointRadius || 5,
      xAxisPosition: defaultConfig_default.quadrantChart?.xAxisPosition || "top",
      yAxisPosition: defaultConfig_default.quadrantChart?.yAxisPosition || "left",
      quadrantInternalBorderStrokeWidth: defaultConfig_default.quadrantChart?.quadrantInternalBorderStrokeWidth || 1,
      quadrantExternalBorderStrokeWidth: defaultConfig_default.quadrantChart?.quadrantExternalBorderStrokeWidth || 2
    };
  }
  getDefaultThemeConfig() {
    return {
      quadrant1Fill: defaultThemeVariables.quadrant1Fill,
      quadrant2Fill: defaultThemeVariables.quadrant2Fill,
      quadrant3Fill: defaultThemeVariables.quadrant3Fill,
      quadrant4Fill: defaultThemeVariables.quadrant4Fill,
      quadrant1TextFill: defaultThemeVariables.quadrant1TextFill,
      quadrant2TextFill: defaultThemeVariables.quadrant2TextFill,
      quadrant3TextFill: defaultThemeVariables.quadrant3TextFill,
      quadrant4TextFill: defaultThemeVariables.quadrant4TextFill,
      quadrantPointFill: defaultThemeVariables.quadrantPointFill,
      quadrantPointTextFill: defaultThemeVariables.quadrantPointTextFill,
      quadrantXAxisTextFill: defaultThemeVariables.quadrantXAxisTextFill,
      quadrantYAxisTextFill: defaultThemeVariables.quadrantYAxisTextFill,
      quadrantTitleFill: defaultThemeVariables.quadrantTitleFill,
      quadrantInternalBorderStrokeFill: defaultThemeVariables.quadrantInternalBorderStrokeFill,
      quadrantExternalBorderStrokeFill: defaultThemeVariables.quadrantExternalBorderStrokeFill
    };
  }
  clear() {
    this.config = this.getDefaultConfig();
    this.themeConfig = this.getDefaultThemeConfig();
    this.data = this.getDefaultData();
    this.classes = /* @__PURE__ */ new Map;
    log.info("clear called");
  }
  setData(data) {
    this.data = { ...this.data, ...data };
  }
  addPoints(points) {
    this.data.points = [...points, ...this.data.points];
  }
  addClass(className, styles) {
    this.classes.set(className, styles);
  }
  setConfig(config2) {
    log.trace("setConfig called with: ", config2);
    this.config = { ...this.config, ...config2 };
  }
  setThemeConfig(themeConfig) {
    log.trace("setThemeConfig called with: ", themeConfig);
    this.themeConfig = { ...this.themeConfig, ...themeConfig };
  }
  calculateSpace(xAxisPosition, showXAxis, showYAxis, showTitle) {
    const xAxisSpaceCalculation = this.config.xAxisLabelPadding * 2 + this.config.xAxisLabelFontSize;
    const xAxisSpace = {
      top: xAxisPosition === "top" && showXAxis ? xAxisSpaceCalculation : 0,
      bottom: xAxisPosition === "bottom" && showXAxis ? xAxisSpaceCalculation : 0
    };
    const yAxisSpaceCalculation = this.config.yAxisLabelPadding * 2 + this.config.yAxisLabelFontSize;
    const yAxisSpace = {
      left: this.config.yAxisPosition === "left" && showYAxis ? yAxisSpaceCalculation : 0,
      right: this.config.yAxisPosition === "right" && showYAxis ? yAxisSpaceCalculation : 0
    };
    const titleSpaceCalculation = this.config.titleFontSize + this.config.titlePadding * 2;
    const titleSpace = {
      top: showTitle ? titleSpaceCalculation : 0
    };
    const quadrantLeft = this.config.quadrantPadding + yAxisSpace.left;
    const quadrantTop = this.config.quadrantPadding + xAxisSpace.top + titleSpace.top;
    const quadrantWidth = this.config.chartWidth - this.config.quadrantPadding * 2 - yAxisSpace.left - yAxisSpace.right;
    const quadrantHeight = this.config.chartHeight - this.config.quadrantPadding * 2 - xAxisSpace.top - xAxisSpace.bottom - titleSpace.top;
    const quadrantHalfWidth = quadrantWidth / 2;
    const quadrantHalfHeight = quadrantHeight / 2;
    const quadrantSpace = {
      quadrantLeft,
      quadrantTop,
      quadrantWidth,
      quadrantHalfWidth,
      quadrantHeight,
      quadrantHalfHeight
    };
    return {
      xAxisSpace,
      yAxisSpace,
      titleSpace,
      quadrantSpace
    };
  }
  getAxisLabels(xAxisPosition, showXAxis, showYAxis, spaceData) {
    const { quadrantSpace, titleSpace } = spaceData;
    const {
      quadrantHalfHeight,
      quadrantHeight,
      quadrantLeft,
      quadrantHalfWidth,
      quadrantTop,
      quadrantWidth
    } = quadrantSpace;
    const drawXAxisLabelsInMiddle = Boolean(this.data.xAxisRightText);
    const drawYAxisLabelsInMiddle = Boolean(this.data.yAxisTopText);
    const axisLabels = [];
    if (this.data.xAxisLeftText && showXAxis) {
      axisLabels.push({
        text: this.data.xAxisLeftText,
        fill: this.themeConfig.quadrantXAxisTextFill,
        x: quadrantLeft + (drawXAxisLabelsInMiddle ? quadrantHalfWidth / 2 : 0),
        y: xAxisPosition === "top" ? this.config.xAxisLabelPadding + titleSpace.top : this.config.xAxisLabelPadding + quadrantTop + quadrantHeight + this.config.quadrantPadding,
        fontSize: this.config.xAxisLabelFontSize,
        verticalPos: drawXAxisLabelsInMiddle ? "center" : "left",
        horizontalPos: "top",
        rotation: 0
      });
    }
    if (this.data.xAxisRightText && showXAxis) {
      axisLabels.push({
        text: this.data.xAxisRightText,
        fill: this.themeConfig.quadrantXAxisTextFill,
        x: quadrantLeft + quadrantHalfWidth + (drawXAxisLabelsInMiddle ? quadrantHalfWidth / 2 : 0),
        y: xAxisPosition === "top" ? this.config.xAxisLabelPadding + titleSpace.top : this.config.xAxisLabelPadding + quadrantTop + quadrantHeight + this.config.quadrantPadding,
        fontSize: this.config.xAxisLabelFontSize,
        verticalPos: drawXAxisLabelsInMiddle ? "center" : "left",
        horizontalPos: "top",
        rotation: 0
      });
    }
    if (this.data.yAxisBottomText && showYAxis) {
      axisLabels.push({
        text: this.data.yAxisBottomText,
        fill: this.themeConfig.quadrantYAxisTextFill,
        x: this.config.yAxisPosition === "left" ? this.config.yAxisLabelPadding : this.config.yAxisLabelPadding + quadrantLeft + quadrantWidth + this.config.quadrantPadding,
        y: quadrantTop + quadrantHeight - (drawYAxisLabelsInMiddle ? quadrantHalfHeight / 2 : 0),
        fontSize: this.config.yAxisLabelFontSize,
        verticalPos: drawYAxisLabelsInMiddle ? "center" : "left",
        horizontalPos: "top",
        rotation: -90
      });
    }
    if (this.data.yAxisTopText && showYAxis) {
      axisLabels.push({
        text: this.data.yAxisTopText,
        fill: this.themeConfig.quadrantYAxisTextFill,
        x: this.config.yAxisPosition === "left" ? this.config.yAxisLabelPadding : this.config.yAxisLabelPadding + quadrantLeft + quadrantWidth + this.config.quadrantPadding,
        y: quadrantTop + quadrantHalfHeight - (drawYAxisLabelsInMiddle ? quadrantHalfHeight / 2 : 0),
        fontSize: this.config.yAxisLabelFontSize,
        verticalPos: drawYAxisLabelsInMiddle ? "center" : "left",
        horizontalPos: "top",
        rotation: -90
      });
    }
    return axisLabels;
  }
  getQuadrants(spaceData) {
    const { quadrantSpace } = spaceData;
    const { quadrantHalfHeight, quadrantLeft, quadrantHalfWidth, quadrantTop } = quadrantSpace;
    const quadrants = [
      {
        text: {
          text: this.data.quadrant1Text,
          fill: this.themeConfig.quadrant1TextFill,
          x: 0,
          y: 0,
          fontSize: this.config.quadrantLabelFontSize,
          verticalPos: "center",
          horizontalPos: "middle",
          rotation: 0
        },
        x: quadrantLeft + quadrantHalfWidth,
        y: quadrantTop,
        width: quadrantHalfWidth,
        height: quadrantHalfHeight,
        fill: this.themeConfig.quadrant1Fill
      },
      {
        text: {
          text: this.data.quadrant2Text,
          fill: this.themeConfig.quadrant2TextFill,
          x: 0,
          y: 0,
          fontSize: this.config.quadrantLabelFontSize,
          verticalPos: "center",
          horizontalPos: "middle",
          rotation: 0
        },
        x: quadrantLeft,
        y: quadrantTop,
        width: quadrantHalfWidth,
        height: quadrantHalfHeight,
        fill: this.themeConfig.quadrant2Fill
      },
      {
        text: {
          text: this.data.quadrant3Text,
          fill: this.themeConfig.quadrant3TextFill,
          x: 0,
          y: 0,
          fontSize: this.config.quadrantLabelFontSize,
          verticalPos: "center",
          horizontalPos: "middle",
          rotation: 0
        },
        x: quadrantLeft,
        y: quadrantTop + quadrantHalfHeight,
        width: quadrantHalfWidth,
        height: quadrantHalfHeight,
        fill: this.themeConfig.quadrant3Fill
      },
      {
        text: {
          text: this.data.quadrant4Text,
          fill: this.themeConfig.quadrant4TextFill,
          x: 0,
          y: 0,
          fontSize: this.config.quadrantLabelFontSize,
          verticalPos: "center",
          horizontalPos: "middle",
          rotation: 0
        },
        x: quadrantLeft + quadrantHalfWidth,
        y: quadrantTop + quadrantHalfHeight,
        width: quadrantHalfWidth,
        height: quadrantHalfHeight,
        fill: this.themeConfig.quadrant4Fill
      }
    ];
    for (const quadrant of quadrants) {
      quadrant.text.x = quadrant.x + quadrant.width / 2;
      if (this.data.points.length === 0) {
        quadrant.text.y = quadrant.y + quadrant.height / 2;
        quadrant.text.horizontalPos = "middle";
      } else {
        quadrant.text.y = quadrant.y + this.config.quadrantTextTopPadding;
        quadrant.text.horizontalPos = "top";
      }
    }
    return quadrants;
  }
  getQuadrantPoints(spaceData) {
    const { quadrantSpace } = spaceData;
    const { quadrantHeight, quadrantLeft, quadrantTop, quadrantWidth } = quadrantSpace;
    const xAxis = linear().domain([0, 1]).range([quadrantLeft, quadrantWidth + quadrantLeft]);
    const yAxis = linear().domain([0, 1]).range([quadrantHeight + quadrantTop, quadrantTop]);
    const points = this.data.points.map((point) => {
      const classStyles = this.classes.get(point.className);
      if (classStyles) {
        point = { ...classStyles, ...point };
      }
      const props = {
        x: xAxis(point.x),
        y: yAxis(point.y),
        fill: point.color ?? this.themeConfig.quadrantPointFill,
        radius: point.radius ?? this.config.pointRadius,
        text: {
          text: point.text,
          fill: this.themeConfig.quadrantPointTextFill,
          x: xAxis(point.x),
          y: yAxis(point.y) + this.config.pointTextPadding,
          verticalPos: "center",
          horizontalPos: "top",
          fontSize: this.config.pointLabelFontSize,
          rotation: 0
        },
        strokeColor: point.strokeColor ?? this.themeConfig.quadrantPointFill,
        strokeWidth: point.strokeWidth ?? "0px"
      };
      return props;
    });
    return points;
  }
  getBorders(spaceData) {
    const halfExternalBorderWidth = this.config.quadrantExternalBorderStrokeWidth / 2;
    const { quadrantSpace } = spaceData;
    const {
      quadrantHalfHeight,
      quadrantHeight,
      quadrantLeft,
      quadrantHalfWidth,
      quadrantTop,
      quadrantWidth
    } = quadrantSpace;
    const borderLines = [
      {
        strokeFill: this.themeConfig.quadrantExternalBorderStrokeFill,
        strokeWidth: this.config.quadrantExternalBorderStrokeWidth,
        x1: quadrantLeft - halfExternalBorderWidth,
        y1: quadrantTop,
        x2: quadrantLeft + quadrantWidth + halfExternalBorderWidth,
        y2: quadrantTop
      },
      {
        strokeFill: this.themeConfig.quadrantExternalBorderStrokeFill,
        strokeWidth: this.config.quadrantExternalBorderStrokeWidth,
        x1: quadrantLeft + quadrantWidth,
        y1: quadrantTop + halfExternalBorderWidth,
        x2: quadrantLeft + quadrantWidth,
        y2: quadrantTop + quadrantHeight - halfExternalBorderWidth
      },
      {
        strokeFill: this.themeConfig.quadrantExternalBorderStrokeFill,
        strokeWidth: this.config.quadrantExternalBorderStrokeWidth,
        x1: quadrantLeft - halfExternalBorderWidth,
        y1: quadrantTop + quadrantHeight,
        x2: quadrantLeft + quadrantWidth + halfExternalBorderWidth,
        y2: quadrantTop + quadrantHeight
      },
      {
        strokeFill: this.themeConfig.quadrantExternalBorderStrokeFill,
        strokeWidth: this.config.quadrantExternalBorderStrokeWidth,
        x1: quadrantLeft,
        y1: quadrantTop + halfExternalBorderWidth,
        x2: quadrantLeft,
        y2: quadrantTop + quadrantHeight - halfExternalBorderWidth
      },
      {
        strokeFill: this.themeConfig.quadrantInternalBorderStrokeFill,
        strokeWidth: this.config.quadrantInternalBorderStrokeWidth,
        x1: quadrantLeft + quadrantHalfWidth,
        y1: quadrantTop + halfExternalBorderWidth,
        x2: quadrantLeft + quadrantHalfWidth,
        y2: quadrantTop + quadrantHeight - halfExternalBorderWidth
      },
      {
        strokeFill: this.themeConfig.quadrantInternalBorderStrokeFill,
        strokeWidth: this.config.quadrantInternalBorderStrokeWidth,
        x1: quadrantLeft + halfExternalBorderWidth,
        y1: quadrantTop + quadrantHalfHeight,
        x2: quadrantLeft + quadrantWidth - halfExternalBorderWidth,
        y2: quadrantTop + quadrantHalfHeight
      }
    ];
    return borderLines;
  }
  getTitle(showTitle) {
    if (showTitle) {
      return {
        text: this.data.titleText,
        fill: this.themeConfig.quadrantTitleFill,
        fontSize: this.config.titleFontSize,
        horizontalPos: "top",
        verticalPos: "center",
        rotation: 0,
        y: this.config.titlePadding,
        x: this.config.chartWidth / 2
      };
    }
    return;
  }
  build() {
    const showXAxis = this.config.showXAxis && !!(this.data.xAxisLeftText || this.data.xAxisRightText);
    const showYAxis = this.config.showYAxis && !!(this.data.yAxisTopText || this.data.yAxisBottomText);
    const showTitle = this.config.showTitle && !!this.data.titleText;
    const xAxisPosition = this.data.points.length > 0 ? "bottom" : this.config.xAxisPosition;
    const calculatedSpace = this.calculateSpace(xAxisPosition, showXAxis, showYAxis, showTitle);
    return {
      points: this.getQuadrantPoints(calculatedSpace),
      quadrants: this.getQuadrants(calculatedSpace),
      axisLabels: this.getAxisLabels(xAxisPosition, showXAxis, showYAxis, calculatedSpace),
      borderLines: this.getBorders(calculatedSpace),
      title: this.getTitle(showTitle)
    };
  }
};
var InvalidStyleError = class extends Error {
  static {
    __name(this, "InvalidStyleError");
  }
  constructor(style, value, type) {
    super(`value for ${style} ${value} is invalid, please use a valid ${type}`);
    this.name = "InvalidStyleError";
  }
};
function validateHexCode(value) {
  return !/^#?([\dA-Fa-f]{6}|[\dA-Fa-f]{3})$/.test(value);
}
__name(validateHexCode, "validateHexCode");
function validateNumber(value) {
  return !/^\d+$/.test(value);
}
__name(validateNumber, "validateNumber");
function validateSizeInPixels(value) {
  return !/^\d+px$/.test(value);
}
__name(validateSizeInPixels, "validateSizeInPixels");
var config = getConfig2();
function textSanitizer(text) {
  return sanitizeText(text.trim(), config);
}
__name(textSanitizer, "textSanitizer");
var quadrantBuilder = new QuadrantBuilder;
function setQuadrant1Text(textObj) {
  quadrantBuilder.setData({ quadrant1Text: textSanitizer(textObj.text) });
}
__name(setQuadrant1Text, "setQuadrant1Text");
function setQuadrant2Text(textObj) {
  quadrantBuilder.setData({ quadrant2Text: textSanitizer(textObj.text) });
}
__name(setQuadrant2Text, "setQuadrant2Text");
function setQuadrant3Text(textObj) {
  quadrantBuilder.setData({ quadrant3Text: textSanitizer(textObj.text) });
}
__name(setQuadrant3Text, "setQuadrant3Text");
function setQuadrant4Text(textObj) {
  quadrantBuilder.setData({ quadrant4Text: textSanitizer(textObj.text) });
}
__name(setQuadrant4Text, "setQuadrant4Text");
function setXAxisLeftText(textObj) {
  quadrantBuilder.setData({ xAxisLeftText: textSanitizer(textObj.text) });
}
__name(setXAxisLeftText, "setXAxisLeftText");
function setXAxisRightText(textObj) {
  quadrantBuilder.setData({ xAxisRightText: textSanitizer(textObj.text) });
}
__name(setXAxisRightText, "setXAxisRightText");
function setYAxisTopText(textObj) {
  quadrantBuilder.setData({ yAxisTopText: textSanitizer(textObj.text) });
}
__name(setYAxisTopText, "setYAxisTopText");
function setYAxisBottomText(textObj) {
  quadrantBuilder.setData({ yAxisBottomText: textSanitizer(textObj.text) });
}
__name(setYAxisBottomText, "setYAxisBottomText");
function parseStyles(styles) {
  const stylesObject = {};
  for (const style of styles) {
    const [key, value] = style.trim().split(/\s*:\s*/);
    if (key === "radius") {
      if (validateNumber(value)) {
        throw new InvalidStyleError(key, value, "number");
      }
      stylesObject.radius = parseInt(value);
    } else if (key === "color") {
      if (validateHexCode(value)) {
        throw new InvalidStyleError(key, value, "hex code");
      }
      stylesObject.color = value;
    } else if (key === "stroke-color") {
      if (validateHexCode(value)) {
        throw new InvalidStyleError(key, value, "hex code");
      }
      stylesObject.strokeColor = value;
    } else if (key === "stroke-width") {
      if (validateSizeInPixels(value)) {
        throw new InvalidStyleError(key, value, "number of pixels (eg. 10px)");
      }
      stylesObject.strokeWidth = value;
    } else {
      throw new Error(`style named ${key} is not supported.`);
    }
  }
  return stylesObject;
}
__name(parseStyles, "parseStyles");
function addPoint(textObj, className, x, y, styles) {
  const stylesObject = parseStyles(styles);
  quadrantBuilder.addPoints([
    {
      x,
      y,
      text: textSanitizer(textObj.text),
      className,
      ...stylesObject
    }
  ]);
}
__name(addPoint, "addPoint");
function addClass(className, styles) {
  quadrantBuilder.addClass(className, parseStyles(styles));
}
__name(addClass, "addClass");
function setWidth(width) {
  quadrantBuilder.setConfig({ chartWidth: width });
}
__name(setWidth, "setWidth");
function setHeight(height) {
  quadrantBuilder.setConfig({ chartHeight: height });
}
__name(setHeight, "setHeight");
function getQuadrantData() {
  const config2 = getConfig2();
  const { themeVariables, quadrantChart: quadrantChartConfig } = config2;
  if (quadrantChartConfig) {
    quadrantBuilder.setConfig(quadrantChartConfig);
  }
  quadrantBuilder.setThemeConfig({
    quadrant1Fill: themeVariables.quadrant1Fill,
    quadrant2Fill: themeVariables.quadrant2Fill,
    quadrant3Fill: themeVariables.quadrant3Fill,
    quadrant4Fill: themeVariables.quadrant4Fill,
    quadrant1TextFill: themeVariables.quadrant1TextFill,
    quadrant2TextFill: themeVariables.quadrant2TextFill,
    quadrant3TextFill: themeVariables.quadrant3TextFill,
    quadrant4TextFill: themeVariables.quadrant4TextFill,
    quadrantPointFill: themeVariables.quadrantPointFill,
    quadrantPointTextFill: themeVariables.quadrantPointTextFill,
    quadrantXAxisTextFill: themeVariables.quadrantXAxisTextFill,
    quadrantYAxisTextFill: themeVariables.quadrantYAxisTextFill,
    quadrantExternalBorderStrokeFill: themeVariables.quadrantExternalBorderStrokeFill,
    quadrantInternalBorderStrokeFill: themeVariables.quadrantInternalBorderStrokeFill,
    quadrantTitleFill: themeVariables.quadrantTitleFill
  });
  quadrantBuilder.setData({ titleText: getDiagramTitle() });
  return quadrantBuilder.build();
}
__name(getQuadrantData, "getQuadrantData");
var clear2 = /* @__PURE__ */ __name(function() {
  quadrantBuilder.clear();
  clear();
}, "clear");
var quadrantDb_default = {
  setWidth,
  setHeight,
  setQuadrant1Text,
  setQuadrant2Text,
  setQuadrant3Text,
  setQuadrant4Text,
  setXAxisLeftText,
  setXAxisRightText,
  setYAxisTopText,
  setYAxisBottomText,
  parseStyles,
  addPoint,
  addClass,
  getQuadrantData,
  clear: clear2,
  setAccTitle,
  getAccTitle,
  setDiagramTitle,
  getDiagramTitle,
  getAccDescription,
  setAccDescription
};
var draw = /* @__PURE__ */ __name((txt, id, _version, diagObj) => {
  function getDominantBaseLine(horizontalPos) {
    return horizontalPos === "top" ? "hanging" : "middle";
  }
  __name(getDominantBaseLine, "getDominantBaseLine");
  function getTextAnchor(verticalPos) {
    return verticalPos === "left" ? "start" : "middle";
  }
  __name(getTextAnchor, "getTextAnchor");
  function getTransformation(data) {
    return `translate(${data.x}, ${data.y}) rotate(${data.rotation || 0})`;
  }
  __name(getTransformation, "getTransformation");
  const conf = getConfig2();
  log.debug(`Rendering quadrant chart
` + txt);
  const securityLevel = conf.securityLevel;
  let sandboxElement;
  if (securityLevel === "sandbox") {
    sandboxElement = select_default("#i" + id);
  }
  const root = securityLevel === "sandbox" ? select_default(sandboxElement.nodes()[0].contentDocument.body) : select_default("body");
  const svg = root.select(`[id="${id}"]`);
  const group = svg.append("g").attr("class", "main");
  const width = conf.quadrantChart?.chartWidth ?? 500;
  const height = conf.quadrantChart?.chartHeight ?? 500;
  configureSvgSize(svg, height, width, conf.quadrantChart?.useMaxWidth ?? true);
  svg.attr("viewBox", "0 0 " + width + " " + height);
  diagObj.db.setHeight(height);
  diagObj.db.setWidth(width);
  const quadrantData = diagObj.db.getQuadrantData();
  const quadrantsGroup = group.append("g").attr("class", "quadrants");
  const borderGroup = group.append("g").attr("class", "border");
  const dataPointGroup = group.append("g").attr("class", "data-points");
  const labelGroup = group.append("g").attr("class", "labels");
  const titleGroup = group.append("g").attr("class", "title");
  if (quadrantData.title) {
    titleGroup.append("text").attr("x", 0).attr("y", 0).attr("fill", quadrantData.title.fill).attr("font-size", quadrantData.title.fontSize).attr("dominant-baseline", getDominantBaseLine(quadrantData.title.horizontalPos)).attr("text-anchor", getTextAnchor(quadrantData.title.verticalPos)).attr("transform", getTransformation(quadrantData.title)).text(quadrantData.title.text);
  }
  if (quadrantData.borderLines) {
    borderGroup.selectAll("line").data(quadrantData.borderLines).enter().append("line").attr("x1", (data) => data.x1).attr("y1", (data) => data.y1).attr("x2", (data) => data.x2).attr("y2", (data) => data.y2).style("stroke", (data) => data.strokeFill).style("stroke-width", (data) => data.strokeWidth);
  }
  const quadrants = quadrantsGroup.selectAll("g.quadrant").data(quadrantData.quadrants).enter().append("g").attr("class", "quadrant");
  quadrants.append("rect").attr("x", (data) => data.x).attr("y", (data) => data.y).attr("width", (data) => data.width).attr("height", (data) => data.height).attr("fill", (data) => data.fill);
  quadrants.append("text").attr("x", 0).attr("y", 0).attr("fill", (data) => data.text.fill).attr("font-size", (data) => data.text.fontSize).attr("dominant-baseline", (data) => getDominantBaseLine(data.text.horizontalPos)).attr("text-anchor", (data) => getTextAnchor(data.text.verticalPos)).attr("transform", (data) => getTransformation(data.text)).text((data) => data.text.text);
  const labels = labelGroup.selectAll("g.label").data(quadrantData.axisLabels).enter().append("g").attr("class", "label");
  labels.append("text").attr("x", 0).attr("y", 0).text((data) => data.text).attr("fill", (data) => data.fill).attr("font-size", (data) => data.fontSize).attr("dominant-baseline", (data) => getDominantBaseLine(data.horizontalPos)).attr("text-anchor", (data) => getTextAnchor(data.verticalPos)).attr("transform", (data) => getTransformation(data));
  const dataPoints = dataPointGroup.selectAll("g.data-point").data(quadrantData.points).enter().append("g").attr("class", "data-point");
  dataPoints.append("circle").attr("cx", (data) => data.x).attr("cy", (data) => data.y).attr("r", (data) => data.radius).attr("fill", (data) => data.fill).attr("stroke", (data) => data.strokeColor).attr("stroke-width", (data) => data.strokeWidth);
  dataPoints.append("text").attr("x", 0).attr("y", 0).text((data) => data.text.text).attr("fill", (data) => data.text.fill).attr("font-size", (data) => data.text.fontSize).attr("dominant-baseline", (data) => getDominantBaseLine(data.text.horizontalPos)).attr("text-anchor", (data) => getTextAnchor(data.text.verticalPos)).attr("transform", (data) => getTransformation(data.text));
}, "draw");
var quadrantRenderer_default = {
  draw
};
var diagram = {
  parser: quadrant_default,
  db: quadrantDb_default,
  renderer: quadrantRenderer_default,
  styles: /* @__PURE__ */ __name(() => "", "styles")
};
export {
  diagram
};

//# debugId=E1DB4D98B000400764756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL3F1YWRyYW50RGlhZ3JhbS1XNEtLUFpYQi5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiaW1wb3J0IHtcbiAgY2xlYXIsXG4gIGNvbmZpZ3VyZVN2Z1NpemUsXG4gIGRlZmF1bHRDb25maWdfZGVmYXVsdCxcbiAgZ2V0QWNjRGVzY3JpcHRpb24sXG4gIGdldEFjY1RpdGxlLFxuICBnZXRDb25maWcyIGFzIGdldENvbmZpZyxcbiAgZ2V0RGlhZ3JhbVRpdGxlLFxuICBnZXRUaGVtZVZhcmlhYmxlcyxcbiAgc2FuaXRpemVUZXh0LFxuICBzZXRBY2NEZXNjcmlwdGlvbixcbiAgc2V0QWNjVGl0bGUsXG4gIHNldERpYWdyYW1UaXRsZVxufSBmcm9tIFwiLi9jaHVuay1DU0NJSEs3US5tanNcIjtcbmltcG9ydCB7XG4gIF9fbmFtZSxcbiAgbG9nXG59IGZyb20gXCIuL2NodW5rLUFHSFJCNEpGLm1qc1wiO1xuXG4vLyBzcmMvZGlhZ3JhbXMvcXVhZHJhbnQtY2hhcnQvcGFyc2VyL3F1YWRyYW50Lmppc29uXG52YXIgcGFyc2VyID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgbyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oaywgdiwgbzIsIGwpIHtcbiAgICBmb3IgKG8yID0gbzIgfHwge30sIGwgPSBrLmxlbmd0aDsgbC0tOyBvMltrW2xdXSA9IHYpIDtcbiAgICByZXR1cm4gbzI7XG4gIH0sIFwib1wiKSwgJFYwID0gWzEsIDNdLCAkVjEgPSBbMSwgNF0sICRWMiA9IFsxLCA1XSwgJFYzID0gWzEsIDZdLCAkVjQgPSBbMSwgN10sICRWNSA9IFsxLCA0LCA1LCAxMCwgMTIsIDEzLCAxNCwgMTUsIDE4LCAyNSwgMzUsIDM3LCAzOSwgNDEsIDQyLCA0OCwgNTAsIDUxLCA1MiwgNTMsIDU0LCA1NSwgNTYsIDU3LCA2MCwgNjEsIDYzLCA2NCwgNjUsIDY2LCA2N10sICRWNiA9IFsxLCA0LCA1LCAxMCwgMTIsIDEzLCAxNCwgMTUsIDE4LCAyNSwgMjgsIDM1LCAzNywgMzksIDQxLCA0MiwgNDgsIDUwLCA1MSwgNTIsIDUzLCA1NCwgNTUsIDU2LCA1NywgNjAsIDYxLCA2MywgNjQsIDY1LCA2NiwgNjddLCAkVjcgPSBbNTUsIDU2LCA1N10sICRWOCA9IFsyLCAzNl0sICRWOSA9IFsxLCAzN10sICRWYSA9IFsxLCAzNl0sICRWYiA9IFsxLCAzOF0sICRWYyA9IFsxLCAzNV0sICRWZCA9IFsxLCA0M10sICRWZSA9IFsxLCA0MV0sICRWZiA9IFsxLCA0NV0sICRWZyA9IFsxLCAxNF0sICRWaCA9IFsxLCAyM10sICRWaSA9IFsxLCAxOF0sICRWaiA9IFsxLCAxOV0sICRWayA9IFsxLCAyMF0sICRWbCA9IFsxLCAyMV0sICRWbSA9IFsxLCAyMl0sICRWbiA9IFsxLCAyNF0sICRWbyA9IFsxLCAyNV0sICRWcCA9IFsxLCAyNl0sICRWcSA9IFsxLCAyN10sICRWciA9IFsxLCAyOF0sICRWcyA9IFsxLCAyOV0sICRWdCA9IFsxLCAzMl0sICRWdSA9IFsxLCAzM10sICRWdiA9IFsxLCAzNF0sICRWdyA9IFsxLCAzOV0sICRWeCA9IFsxLCA0MF0sICRWeSA9IFsxLCA0Ml0sICRWeiA9IFsxLCA0NF0sICRWQSA9IFsxLCA2M10sICRWQiA9IFsxLCA2Ml0sICRWQyA9IFs0LCA1LCA4LCAxMCwgMTIsIDEzLCAxNCwgMTUsIDE4LCA0NCwgNDcsIDQ5LCA1NSwgNTYsIDU3LCA2MywgNjQsIDY1LCA2NiwgNjddLCAkVkQgPSBbMSwgNjZdLCAkVkUgPSBbMSwgNjddLCAkVkYgPSBbMSwgNjhdLCAkVkcgPSBbMSwgNjldLCAkVkggPSBbMSwgNzBdLCAkVkkgPSBbMSwgNzFdLCAkVkogPSBbMSwgNzJdLCAkVksgPSBbMSwgNzNdLCAkVkwgPSBbMSwgNzRdLCAkVk0gPSBbMSwgNzVdLCAkVk4gPSBbMSwgNzZdLCAkVk8gPSBbMSwgNzddLCAkVlAgPSBbNCwgNSwgNiwgNywgOCwgOSwgMTAsIDExLCAxMiwgMTMsIDE0LCAxNSwgMThdLCAkVlEgPSBbMSwgOTFdLCAkVlIgPSBbMSwgOTJdLCAkVlMgPSBbMSwgOTNdLCAkVlQgPSBbMSwgMTAwXSwgJFZVID0gWzEsIDk0XSwgJFZWID0gWzEsIDk3XSwgJFZXID0gWzEsIDk1XSwgJFZYID0gWzEsIDk2XSwgJFZZID0gWzEsIDk4XSwgJFZaID0gWzEsIDk5XSwgJFZfID0gWzEsIDEwM10sICRWJCA9IFsxMCwgNTUsIDU2LCA1N10sICRWMDEgPSBbNCwgNSwgNiwgOCwgMTAsIDExLCAxMywgMTcsIDE4LCAxOSwgMjAsIDU1LCA1NiwgNTddO1xuICB2YXIgcGFyc2VyMiA9IHtcbiAgICB0cmFjZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiB0cmFjZSgpIHtcbiAgICB9LCBcInRyYWNlXCIpLFxuICAgIHl5OiB7fSxcbiAgICBzeW1ib2xzXzogeyBcImVycm9yXCI6IDIsIFwiaWRTdHJpbmdUb2tlblwiOiAzLCBcIkFMUEhBXCI6IDQsIFwiTlVNXCI6IDUsIFwiTk9ERV9TVFJJTkdcIjogNiwgXCJET1dOXCI6IDcsIFwiTUlOVVNcIjogOCwgXCJERUZBVUxUXCI6IDksIFwiQ09NTUFcIjogMTAsIFwiQ09MT05cIjogMTEsIFwiQU1QXCI6IDEyLCBcIkJSS1RcIjogMTMsIFwiTVVMVFwiOiAxNCwgXCJVTklDT0RFX1RFWFRcIjogMTUsIFwic3R5bGVDb21wb25lbnRcIjogMTYsIFwiVU5JVFwiOiAxNywgXCJTUEFDRVwiOiAxOCwgXCJTVFlMRVwiOiAxOSwgXCJQQ1RcIjogMjAsIFwiaWRTdHJpbmdcIjogMjEsIFwic3R5bGVcIjogMjIsIFwic3R5bGVzT3B0XCI6IDIzLCBcImNsYXNzRGVmU3RhdGVtZW50XCI6IDI0LCBcIkNMQVNTREVGXCI6IDI1LCBcInN0YXJ0XCI6IDI2LCBcImVvbFwiOiAyNywgXCJRVUFEUkFOVFwiOiAyOCwgXCJkb2N1bWVudFwiOiAyOSwgXCJsaW5lXCI6IDMwLCBcInN0YXRlbWVudFwiOiAzMSwgXCJheGlzRGV0YWlsc1wiOiAzMiwgXCJxdWFkcmFudERldGFpbHNcIjogMzMsIFwicG9pbnRzXCI6IDM0LCBcInRpdGxlXCI6IDM1LCBcInRpdGxlX3ZhbHVlXCI6IDM2LCBcImFjY190aXRsZVwiOiAzNywgXCJhY2NfdGl0bGVfdmFsdWVcIjogMzgsIFwiYWNjX2Rlc2NyXCI6IDM5LCBcImFjY19kZXNjcl92YWx1ZVwiOiA0MCwgXCJhY2NfZGVzY3JfbXVsdGlsaW5lX3ZhbHVlXCI6IDQxLCBcInNlY3Rpb25cIjogNDIsIFwidGV4dFwiOiA0MywgXCJwb2ludF9zdGFydFwiOiA0NCwgXCJwb2ludF94XCI6IDQ1LCBcInBvaW50X3lcIjogNDYsIFwiY2xhc3NfbmFtZVwiOiA0NywgXCJYLUFYSVNcIjogNDgsIFwiQVhJUy1URVhULURFTElNSVRFUlwiOiA0OSwgXCJZLUFYSVNcIjogNTAsIFwiUVVBRFJBTlRfMVwiOiA1MSwgXCJRVUFEUkFOVF8yXCI6IDUyLCBcIlFVQURSQU5UXzNcIjogNTMsIFwiUVVBRFJBTlRfNFwiOiA1NCwgXCJORVdMSU5FXCI6IDU1LCBcIlNFTUlcIjogNTYsIFwiRU9GXCI6IDU3LCBcImFscGhhTnVtVG9rZW5cIjogNTgsIFwidGV4dE5vVGFnc1Rva2VuXCI6IDU5LCBcIlNUUlwiOiA2MCwgXCJNRF9TVFJcIjogNjEsIFwiYWxwaGFOdW1cIjogNjIsIFwiUFVOQ1RVQVRJT05cIjogNjMsIFwiUExVU1wiOiA2NCwgXCJFUVVBTFNcIjogNjUsIFwiRE9UXCI6IDY2LCBcIlVOREVSU0NPUkVcIjogNjcsIFwiJGFjY2VwdFwiOiAwLCBcIiRlbmRcIjogMSB9LFxuICAgIHRlcm1pbmFsc186IHsgMjogXCJlcnJvclwiLCA0OiBcIkFMUEhBXCIsIDU6IFwiTlVNXCIsIDY6IFwiTk9ERV9TVFJJTkdcIiwgNzogXCJET1dOXCIsIDg6IFwiTUlOVVNcIiwgOTogXCJERUZBVUxUXCIsIDEwOiBcIkNPTU1BXCIsIDExOiBcIkNPTE9OXCIsIDEyOiBcIkFNUFwiLCAxMzogXCJCUktUXCIsIDE0OiBcIk1VTFRcIiwgMTU6IFwiVU5JQ09ERV9URVhUXCIsIDE3OiBcIlVOSVRcIiwgMTg6IFwiU1BBQ0VcIiwgMTk6IFwiU1RZTEVcIiwgMjA6IFwiUENUXCIsIDI1OiBcIkNMQVNTREVGXCIsIDI4OiBcIlFVQURSQU5UXCIsIDM1OiBcInRpdGxlXCIsIDM2OiBcInRpdGxlX3ZhbHVlXCIsIDM3OiBcImFjY190aXRsZVwiLCAzODogXCJhY2NfdGl0bGVfdmFsdWVcIiwgMzk6IFwiYWNjX2Rlc2NyXCIsIDQwOiBcImFjY19kZXNjcl92YWx1ZVwiLCA0MTogXCJhY2NfZGVzY3JfbXVsdGlsaW5lX3ZhbHVlXCIsIDQyOiBcInNlY3Rpb25cIiwgNDQ6IFwicG9pbnRfc3RhcnRcIiwgNDU6IFwicG9pbnRfeFwiLCA0NjogXCJwb2ludF95XCIsIDQ3OiBcImNsYXNzX25hbWVcIiwgNDg6IFwiWC1BWElTXCIsIDQ5OiBcIkFYSVMtVEVYVC1ERUxJTUlURVJcIiwgNTA6IFwiWS1BWElTXCIsIDUxOiBcIlFVQURSQU5UXzFcIiwgNTI6IFwiUVVBRFJBTlRfMlwiLCA1MzogXCJRVUFEUkFOVF8zXCIsIDU0OiBcIlFVQURSQU5UXzRcIiwgNTU6IFwiTkVXTElORVwiLCA1NjogXCJTRU1JXCIsIDU3OiBcIkVPRlwiLCA2MDogXCJTVFJcIiwgNjE6IFwiTURfU1RSXCIsIDYzOiBcIlBVTkNUVUFUSU9OXCIsIDY0OiBcIlBMVVNcIiwgNjU6IFwiRVFVQUxTXCIsIDY2OiBcIkRPVFwiLCA2NzogXCJVTkRFUlNDT1JFXCIgfSxcbiAgICBwcm9kdWN0aW9uc186IFswLCBbMywgMV0sIFszLCAxXSwgWzMsIDFdLCBbMywgMV0sIFszLCAxXSwgWzMsIDFdLCBbMywgMV0sIFszLCAxXSwgWzMsIDFdLCBbMywgMV0sIFszLCAxXSwgWzMsIDFdLCBbMTYsIDFdLCBbMTYsIDFdLCBbMTYsIDFdLCBbMTYsIDFdLCBbMTYsIDFdLCBbMTYsIDFdLCBbMTYsIDFdLCBbMTYsIDFdLCBbMTYsIDFdLCBbMTYsIDFdLCBbMjEsIDFdLCBbMjEsIDJdLCBbMjIsIDFdLCBbMjIsIDJdLCBbMjMsIDFdLCBbMjMsIDNdLCBbMjQsIDVdLCBbMjYsIDJdLCBbMjYsIDJdLCBbMjYsIDJdLCBbMjksIDBdLCBbMjksIDJdLCBbMzAsIDJdLCBbMzEsIDBdLCBbMzEsIDFdLCBbMzEsIDJdLCBbMzEsIDFdLCBbMzEsIDFdLCBbMzEsIDFdLCBbMzEsIDJdLCBbMzEsIDJdLCBbMzEsIDJdLCBbMzEsIDFdLCBbMzEsIDFdLCBbMzQsIDRdLCBbMzQsIDVdLCBbMzQsIDVdLCBbMzQsIDZdLCBbMzIsIDRdLCBbMzIsIDNdLCBbMzIsIDJdLCBbMzIsIDRdLCBbMzIsIDNdLCBbMzIsIDJdLCBbMzMsIDJdLCBbMzMsIDJdLCBbMzMsIDJdLCBbMzMsIDJdLCBbMjcsIDFdLCBbMjcsIDFdLCBbMjcsIDFdLCBbNDMsIDFdLCBbNDMsIDJdLCBbNDMsIDFdLCBbNDMsIDFdLCBbNjIsIDFdLCBbNjIsIDJdLCBbNTgsIDFdLCBbNTgsIDFdLCBbNTgsIDFdLCBbNTgsIDFdLCBbNTgsIDFdLCBbNTgsIDFdLCBbNTgsIDFdLCBbNTgsIDFdLCBbNTgsIDFdLCBbNTgsIDFdLCBbNTgsIDFdLCBbNTgsIDFdLCBbNTksIDFdLCBbNTksIDFdLCBbNTksIDFdXSxcbiAgICBwZXJmb3JtQWN0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGFub255bW91cyh5eXRleHQsIHl5bGVuZywgeXlsaW5lbm8sIHl5LCB5eXN0YXRlLCAkJCwgXyQpIHtcbiAgICAgIHZhciAkMCA9ICQkLmxlbmd0aCAtIDE7XG4gICAgICBzd2l0Y2ggKHl5c3RhdGUpIHtcbiAgICAgICAgY2FzZSAyMzpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjQ6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAxXSArIFwiXCIgKyAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjY6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAxXSArICQkWyQwXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyNzpcbiAgICAgICAgICB0aGlzLiQgPSBbJCRbJDBdLnRyaW0oKV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjg6XG4gICAgICAgICAgJCRbJDAgLSAyXS5wdXNoKCQkWyQwXS50cmltKCkpO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMl07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjk6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSA0XTtcbiAgICAgICAgICB5eS5hZGRDbGFzcygkJFskMCAtIDJdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgIHRoaXMuJCA9IFtdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQyOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS50cmltKCk7XG4gICAgICAgICAgeXkuc2V0RGlhZ3JhbVRpdGxlKHRoaXMuJCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDM6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdLnRyaW0oKTtcbiAgICAgICAgICB5eS5zZXRBY2NUaXRsZSh0aGlzLiQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ0OlxuICAgICAgICBjYXNlIDQ1OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS50cmltKCk7XG4gICAgICAgICAgeXkuc2V0QWNjRGVzY3JpcHRpb24odGhpcy4kKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0NjpcbiAgICAgICAgICB5eS5hZGRTZWN0aW9uKCQkWyQwXS5zdWJzdHIoOCkpO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS5zdWJzdHIoOCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDc6XG4gICAgICAgICAgeXkuYWRkUG9pbnQoJCRbJDAgLSAzXSwgXCJcIiwgJCRbJDAgLSAxXSwgJCRbJDBdLCBbXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDg6XG4gICAgICAgICAgeXkuYWRkUG9pbnQoJCRbJDAgLSA0XSwgJCRbJDAgLSAzXSwgJCRbJDAgLSAxXSwgJCRbJDBdLCBbXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDk6XG4gICAgICAgICAgeXkuYWRkUG9pbnQoJCRbJDAgLSA0XSwgXCJcIiwgJCRbJDAgLSAyXSwgJCRbJDAgLSAxXSwgJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1MDpcbiAgICAgICAgICB5eS5hZGRQb2ludCgkJFskMCAtIDVdLCAkJFskMCAtIDRdLCAkJFskMCAtIDJdLCAkJFskMCAtIDFdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDUxOlxuICAgICAgICAgIHl5LnNldFhBeGlzTGVmdFRleHQoJCRbJDAgLSAyXSk7XG4gICAgICAgICAgeXkuc2V0WEF4aXNSaWdodFRleHQoJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1MjpcbiAgICAgICAgICAkJFskMCAtIDFdLnRleHQgKz0gXCIgXFx1MjdGNiBcIjtcbiAgICAgICAgICB5eS5zZXRYQXhpc0xlZnRUZXh0KCQkWyQwIC0gMV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDUzOlxuICAgICAgICAgIHl5LnNldFhBeGlzTGVmdFRleHQoJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1NDpcbiAgICAgICAgICB5eS5zZXRZQXhpc0JvdHRvbVRleHQoJCRbJDAgLSAyXSk7XG4gICAgICAgICAgeXkuc2V0WUF4aXNUb3BUZXh0KCQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTU6XG4gICAgICAgICAgJCRbJDAgLSAxXS50ZXh0ICs9IFwiIFxcdTI3RjYgXCI7XG4gICAgICAgICAgeXkuc2V0WUF4aXNCb3R0b21UZXh0KCQkWyQwIC0gMV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU2OlxuICAgICAgICAgIHl5LnNldFlBeGlzQm90dG9tVGV4dCgkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU3OlxuICAgICAgICAgIHl5LnNldFF1YWRyYW50MVRleHQoJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1ODpcbiAgICAgICAgICB5eS5zZXRRdWFkcmFudDJUZXh0KCQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTk6XG4gICAgICAgICAgeXkuc2V0UXVhZHJhbnQzVGV4dCgkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDYwOlxuICAgICAgICAgIHl5LnNldFF1YWRyYW50NFRleHQoJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2NDpcbiAgICAgICAgICB0aGlzLiQgPSB7IHRleHQ6ICQkWyQwXSwgdHlwZTogXCJ0ZXh0XCIgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2NTpcbiAgICAgICAgICB0aGlzLiQgPSB7IHRleHQ6ICQkWyQwIC0gMV0udGV4dCArIFwiXCIgKyAkJFskMF0sIHR5cGU6ICQkWyQwIC0gMV0udHlwZSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY2OlxuICAgICAgICAgIHRoaXMuJCA9IHsgdGV4dDogJCRbJDBdLCB0eXBlOiBcInRleHRcIiB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY3OlxuICAgICAgICAgIHRoaXMuJCA9IHsgdGV4dDogJCRbJDBdLCB0eXBlOiBcIm1hcmtkb3duXCIgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2ODpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjk6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAxXSArIFwiXCIgKyAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSwgXCJhbm9ueW1vdXNcIiksXG4gICAgdGFibGU6IFt7IDE4OiAkVjAsIDI2OiAxLCAyNzogMiwgMjg6ICRWMSwgNTU6ICRWMiwgNTY6ICRWMywgNTc6ICRWNCB9LCB7IDE6IFszXSB9LCB7IDE4OiAkVjAsIDI2OiA4LCAyNzogMiwgMjg6ICRWMSwgNTU6ICRWMiwgNTY6ICRWMywgNTc6ICRWNCB9LCB7IDE4OiAkVjAsIDI2OiA5LCAyNzogMiwgMjg6ICRWMSwgNTU6ICRWMiwgNTY6ICRWMywgNTc6ICRWNCB9LCBvKCRWNSwgWzIsIDMzXSwgeyAyOTogMTAgfSksIG8oJFY2LCBbMiwgNjFdKSwgbygkVjYsIFsyLCA2Ml0pLCBvKCRWNiwgWzIsIDYzXSksIHsgMTogWzIsIDMwXSB9LCB7IDE6IFsyLCAzMV0gfSwgbygkVjcsICRWOCwgeyAzMDogMTEsIDMxOiAxMiwgMjQ6IDEzLCAzMjogMTUsIDMzOiAxNiwgMzQ6IDE3LCA0MzogMzAsIDU4OiAzMSwgMTogWzIsIDMyXSwgNDogJFY5LCA1OiAkVmEsIDEwOiAkVmIsIDEyOiAkVmMsIDEzOiAkVmQsIDE0OiAkVmUsIDE1OiAkVmYsIDE4OiAkVmcsIDI1OiAkVmgsIDM1OiAkVmksIDM3OiAkVmosIDM5OiAkVmssIDQxOiAkVmwsIDQyOiAkVm0sIDQ4OiAkVm4sIDUwOiAkVm8sIDUxOiAkVnAsIDUyOiAkVnEsIDUzOiAkVnIsIDU0OiAkVnMsIDYwOiAkVnQsIDYxOiAkVnUsIDYzOiAkVnYsIDY0OiAkVncsIDY1OiAkVngsIDY2OiAkVnksIDY3OiAkVnogfSksIG8oJFY1LCBbMiwgMzRdKSwgeyAyNzogNDYsIDU1OiAkVjIsIDU2OiAkVjMsIDU3OiAkVjQgfSwgbygkVjcsIFsyLCAzN10pLCBvKCRWNywgJFY4LCB7IDI0OiAxMywgMzI6IDE1LCAzMzogMTYsIDM0OiAxNywgNDM6IDMwLCA1ODogMzEsIDMxOiA0NywgNDogJFY5LCA1OiAkVmEsIDEwOiAkVmIsIDEyOiAkVmMsIDEzOiAkVmQsIDE0OiAkVmUsIDE1OiAkVmYsIDE4OiAkVmcsIDI1OiAkVmgsIDM1OiAkVmksIDM3OiAkVmosIDM5OiAkVmssIDQxOiAkVmwsIDQyOiAkVm0sIDQ4OiAkVm4sIDUwOiAkVm8sIDUxOiAkVnAsIDUyOiAkVnEsIDUzOiAkVnIsIDU0OiAkVnMsIDYwOiAkVnQsIDYxOiAkVnUsIDYzOiAkVnYsIDY0OiAkVncsIDY1OiAkVngsIDY2OiAkVnksIDY3OiAkVnogfSksIG8oJFY3LCBbMiwgMzldKSwgbygkVjcsIFsyLCA0MF0pLCBvKCRWNywgWzIsIDQxXSksIHsgMzY6IFsxLCA0OF0gfSwgeyAzODogWzEsIDQ5XSB9LCB7IDQwOiBbMSwgNTBdIH0sIG8oJFY3LCBbMiwgNDVdKSwgbygkVjcsIFsyLCA0Nl0pLCB7IDE4OiBbMSwgNTFdIH0sIHsgNDogJFY5LCA1OiAkVmEsIDEwOiAkVmIsIDEyOiAkVmMsIDEzOiAkVmQsIDE0OiAkVmUsIDE1OiAkVmYsIDQzOiA1MiwgNTg6IDMxLCA2MDogJFZ0LCA2MTogJFZ1LCA2MzogJFZ2LCA2NDogJFZ3LCA2NTogJFZ4LCA2NjogJFZ5LCA2NzogJFZ6IH0sIHsgNDogJFY5LCA1OiAkVmEsIDEwOiAkVmIsIDEyOiAkVmMsIDEzOiAkVmQsIDE0OiAkVmUsIDE1OiAkVmYsIDQzOiA1MywgNTg6IDMxLCA2MDogJFZ0LCA2MTogJFZ1LCA2MzogJFZ2LCA2NDogJFZ3LCA2NTogJFZ4LCA2NjogJFZ5LCA2NzogJFZ6IH0sIHsgNDogJFY5LCA1OiAkVmEsIDEwOiAkVmIsIDEyOiAkVmMsIDEzOiAkVmQsIDE0OiAkVmUsIDE1OiAkVmYsIDQzOiA1NCwgNTg6IDMxLCA2MDogJFZ0LCA2MTogJFZ1LCA2MzogJFZ2LCA2NDogJFZ3LCA2NTogJFZ4LCA2NjogJFZ5LCA2NzogJFZ6IH0sIHsgNDogJFY5LCA1OiAkVmEsIDEwOiAkVmIsIDEyOiAkVmMsIDEzOiAkVmQsIDE0OiAkVmUsIDE1OiAkVmYsIDQzOiA1NSwgNTg6IDMxLCA2MDogJFZ0LCA2MTogJFZ1LCA2MzogJFZ2LCA2NDogJFZ3LCA2NTogJFZ4LCA2NjogJFZ5LCA2NzogJFZ6IH0sIHsgNDogJFY5LCA1OiAkVmEsIDEwOiAkVmIsIDEyOiAkVmMsIDEzOiAkVmQsIDE0OiAkVmUsIDE1OiAkVmYsIDQzOiA1NiwgNTg6IDMxLCA2MDogJFZ0LCA2MTogJFZ1LCA2MzogJFZ2LCA2NDogJFZ3LCA2NTogJFZ4LCA2NjogJFZ5LCA2NzogJFZ6IH0sIHsgNDogJFY5LCA1OiAkVmEsIDEwOiAkVmIsIDEyOiAkVmMsIDEzOiAkVmQsIDE0OiAkVmUsIDE1OiAkVmYsIDQzOiA1NywgNTg6IDMxLCA2MDogJFZ0LCA2MTogJFZ1LCA2MzogJFZ2LCA2NDogJFZ3LCA2NTogJFZ4LCA2NjogJFZ5LCA2NzogJFZ6IH0sIHsgNDogJFY5LCA1OiAkVmEsIDg6ICRWQSwgMTA6ICRWYiwgMTI6ICRWYywgMTM6ICRWZCwgMTQ6ICRWZSwgMTU6ICRWZiwgMTg6ICRWQiwgNDQ6IFsxLCA1OF0sIDQ3OiBbMSwgNTldLCA1ODogNjEsIDU5OiA2MCwgNjM6ICRWdiwgNjQ6ICRWdywgNjU6ICRWeCwgNjY6ICRWeSwgNjc6ICRWeiB9LCBvKCRWQywgWzIsIDY0XSksIG8oJFZDLCBbMiwgNjZdKSwgbygkVkMsIFsyLCA2N10pLCBvKCRWQywgWzIsIDcwXSksIG8oJFZDLCBbMiwgNzFdKSwgbygkVkMsIFsyLCA3Ml0pLCBvKCRWQywgWzIsIDczXSksIG8oJFZDLCBbMiwgNzRdKSwgbygkVkMsIFsyLCA3NV0pLCBvKCRWQywgWzIsIDc2XSksIG8oJFZDLCBbMiwgNzddKSwgbygkVkMsIFsyLCA3OF0pLCBvKCRWQywgWzIsIDc5XSksIG8oJFZDLCBbMiwgODBdKSwgbygkVkMsIFsyLCA4MV0pLCBvKCRWNSwgWzIsIDM1XSksIG8oJFY3LCBbMiwgMzhdKSwgbygkVjcsIFsyLCA0Ml0pLCBvKCRWNywgWzIsIDQzXSksIG8oJFY3LCBbMiwgNDRdKSwgeyAzOiA2NSwgNDogJFZELCA1OiAkVkUsIDY6ICRWRiwgNzogJFZHLCA4OiAkVkgsIDk6ICRWSSwgMTA6ICRWSiwgMTE6ICRWSywgMTI6ICRWTCwgMTM6ICRWTSwgMTQ6ICRWTiwgMTU6ICRWTywgMjE6IDY0IH0sIG8oJFY3LCBbMiwgNTNdLCB7IDU5OiA2MCwgNTg6IDYxLCA0OiAkVjksIDU6ICRWYSwgODogJFZBLCAxMDogJFZiLCAxMjogJFZjLCAxMzogJFZkLCAxNDogJFZlLCAxNTogJFZmLCAxODogJFZCLCA0OTogWzEsIDc4XSwgNjM6ICRWdiwgNjQ6ICRWdywgNjU6ICRWeCwgNjY6ICRWeSwgNjc6ICRWeiB9KSwgbygkVjcsIFsyLCA1Nl0sIHsgNTk6IDYwLCA1ODogNjEsIDQ6ICRWOSwgNTogJFZhLCA4OiAkVkEsIDEwOiAkVmIsIDEyOiAkVmMsIDEzOiAkVmQsIDE0OiAkVmUsIDE1OiAkVmYsIDE4OiAkVkIsIDQ5OiBbMSwgNzldLCA2MzogJFZ2LCA2NDogJFZ3LCA2NTogJFZ4LCA2NjogJFZ5LCA2NzogJFZ6IH0pLCBvKCRWNywgWzIsIDU3XSwgeyA1OTogNjAsIDU4OiA2MSwgNDogJFY5LCA1OiAkVmEsIDg6ICRWQSwgMTA6ICRWYiwgMTI6ICRWYywgMTM6ICRWZCwgMTQ6ICRWZSwgMTU6ICRWZiwgMTg6ICRWQiwgNjM6ICRWdiwgNjQ6ICRWdywgNjU6ICRWeCwgNjY6ICRWeSwgNjc6ICRWeiB9KSwgbygkVjcsIFsyLCA1OF0sIHsgNTk6IDYwLCA1ODogNjEsIDQ6ICRWOSwgNTogJFZhLCA4OiAkVkEsIDEwOiAkVmIsIDEyOiAkVmMsIDEzOiAkVmQsIDE0OiAkVmUsIDE1OiAkVmYsIDE4OiAkVkIsIDYzOiAkVnYsIDY0OiAkVncsIDY1OiAkVngsIDY2OiAkVnksIDY3OiAkVnogfSksIG8oJFY3LCBbMiwgNTldLCB7IDU5OiA2MCwgNTg6IDYxLCA0OiAkVjksIDU6ICRWYSwgODogJFZBLCAxMDogJFZiLCAxMjogJFZjLCAxMzogJFZkLCAxNDogJFZlLCAxNTogJFZmLCAxODogJFZCLCA2MzogJFZ2LCA2NDogJFZ3LCA2NTogJFZ4LCA2NjogJFZ5LCA2NzogJFZ6IH0pLCBvKCRWNywgWzIsIDYwXSwgeyA1OTogNjAsIDU4OiA2MSwgNDogJFY5LCA1OiAkVmEsIDg6ICRWQSwgMTA6ICRWYiwgMTI6ICRWYywgMTM6ICRWZCwgMTQ6ICRWZSwgMTU6ICRWZiwgMTg6ICRWQiwgNjM6ICRWdiwgNjQ6ICRWdywgNjU6ICRWeCwgNjY6ICRWeSwgNjc6ICRWeiB9KSwgeyA0NTogWzEsIDgwXSB9LCB7IDQ0OiBbMSwgODFdIH0sIG8oJFZDLCBbMiwgNjVdKSwgbygkVkMsIFsyLCA4Ml0pLCBvKCRWQywgWzIsIDgzXSksIG8oJFZDLCBbMiwgODRdKSwgeyAzOiA4MywgNDogJFZELCA1OiAkVkUsIDY6ICRWRiwgNzogJFZHLCA4OiAkVkgsIDk6ICRWSSwgMTA6ICRWSiwgMTE6ICRWSywgMTI6ICRWTCwgMTM6ICRWTSwgMTQ6ICRWTiwgMTU6ICRWTywgMTg6IFsxLCA4Ml0gfSwgbygkVlAsIFsyLCAyM10pLCBvKCRWUCwgWzIsIDFdKSwgbygkVlAsIFsyLCAyXSksIG8oJFZQLCBbMiwgM10pLCBvKCRWUCwgWzIsIDRdKSwgbygkVlAsIFsyLCA1XSksIG8oJFZQLCBbMiwgNl0pLCBvKCRWUCwgWzIsIDddKSwgbygkVlAsIFsyLCA4XSksIG8oJFZQLCBbMiwgOV0pLCBvKCRWUCwgWzIsIDEwXSksIG8oJFZQLCBbMiwgMTFdKSwgbygkVlAsIFsyLCAxMl0pLCBvKCRWNywgWzIsIDUyXSwgeyA1ODogMzEsIDQzOiA4NCwgNDogJFY5LCA1OiAkVmEsIDEwOiAkVmIsIDEyOiAkVmMsIDEzOiAkVmQsIDE0OiAkVmUsIDE1OiAkVmYsIDYwOiAkVnQsIDYxOiAkVnUsIDYzOiAkVnYsIDY0OiAkVncsIDY1OiAkVngsIDY2OiAkVnksIDY3OiAkVnogfSksIG8oJFY3LCBbMiwgNTVdLCB7IDU4OiAzMSwgNDM6IDg1LCA0OiAkVjksIDU6ICRWYSwgMTA6ICRWYiwgMTI6ICRWYywgMTM6ICRWZCwgMTQ6ICRWZSwgMTU6ICRWZiwgNjA6ICRWdCwgNjE6ICRWdSwgNjM6ICRWdiwgNjQ6ICRWdywgNjU6ICRWeCwgNjY6ICRWeSwgNjc6ICRWeiB9KSwgeyA0NjogWzEsIDg2XSB9LCB7IDQ1OiBbMSwgODddIH0sIHsgNDogJFZRLCA1OiAkVlIsIDY6ICRWUywgODogJFZULCAxMTogJFZVLCAxMzogJFZWLCAxNjogOTAsIDE3OiAkVlcsIDE4OiAkVlgsIDE5OiAkVlksIDIwOiAkVlosIDIyOiA4OSwgMjM6IDg4IH0sIG8oJFZQLCBbMiwgMjRdKSwgbygkVjcsIFsyLCA1MV0sIHsgNTk6IDYwLCA1ODogNjEsIDQ6ICRWOSwgNTogJFZhLCA4OiAkVkEsIDEwOiAkVmIsIDEyOiAkVmMsIDEzOiAkVmQsIDE0OiAkVmUsIDE1OiAkVmYsIDE4OiAkVkIsIDYzOiAkVnYsIDY0OiAkVncsIDY1OiAkVngsIDY2OiAkVnksIDY3OiAkVnogfSksIG8oJFY3LCBbMiwgNTRdLCB7IDU5OiA2MCwgNTg6IDYxLCA0OiAkVjksIDU6ICRWYSwgODogJFZBLCAxMDogJFZiLCAxMjogJFZjLCAxMzogJFZkLCAxNDogJFZlLCAxNTogJFZmLCAxODogJFZCLCA2MzogJFZ2LCA2NDogJFZ3LCA2NTogJFZ4LCA2NjogJFZ5LCA2NzogJFZ6IH0pLCBvKCRWNywgWzIsIDQ3XSwgeyAyMjogODksIDE2OiA5MCwgMjM6IDEwMSwgNDogJFZRLCA1OiAkVlIsIDY6ICRWUywgODogJFZULCAxMTogJFZVLCAxMzogJFZWLCAxNzogJFZXLCAxODogJFZYLCAxOTogJFZZLCAyMDogJFZaIH0pLCB7IDQ2OiBbMSwgMTAyXSB9LCBvKCRWNywgWzIsIDI5XSwgeyAxMDogJFZfIH0pLCBvKCRWJCwgWzIsIDI3XSwgeyAxNjogMTA0LCA0OiAkVlEsIDU6ICRWUiwgNjogJFZTLCA4OiAkVlQsIDExOiAkVlUsIDEzOiAkVlYsIDE3OiAkVlcsIDE4OiAkVlgsIDE5OiAkVlksIDIwOiAkVlogfSksIG8oJFYwMSwgWzIsIDI1XSksIG8oJFYwMSwgWzIsIDEzXSksIG8oJFYwMSwgWzIsIDE0XSksIG8oJFYwMSwgWzIsIDE1XSksIG8oJFYwMSwgWzIsIDE2XSksIG8oJFYwMSwgWzIsIDE3XSksIG8oJFYwMSwgWzIsIDE4XSksIG8oJFYwMSwgWzIsIDE5XSksIG8oJFYwMSwgWzIsIDIwXSksIG8oJFYwMSwgWzIsIDIxXSksIG8oJFYwMSwgWzIsIDIyXSksIG8oJFY3LCBbMiwgNDldLCB7IDEwOiAkVl8gfSksIG8oJFY3LCBbMiwgNDhdLCB7IDIyOiA4OSwgMTY6IDkwLCAyMzogMTA1LCA0OiAkVlEsIDU6ICRWUiwgNjogJFZTLCA4OiAkVlQsIDExOiAkVlUsIDEzOiAkVlYsIDE3OiAkVlcsIDE4OiAkVlgsIDE5OiAkVlksIDIwOiAkVlogfSksIHsgNDogJFZRLCA1OiAkVlIsIDY6ICRWUywgODogJFZULCAxMTogJFZVLCAxMzogJFZWLCAxNjogOTAsIDE3OiAkVlcsIDE4OiAkVlgsIDE5OiAkVlksIDIwOiAkVlosIDIyOiAxMDYgfSwgbygkVjAxLCBbMiwgMjZdKSwgbygkVjcsIFsyLCA1MF0sIHsgMTA6ICRWXyB9KSwgbygkViQsIFsyLCAyOF0sIHsgMTY6IDEwNCwgNDogJFZRLCA1OiAkVlIsIDY6ICRWUywgODogJFZULCAxMTogJFZVLCAxMzogJFZWLCAxNzogJFZXLCAxODogJFZYLCAxOTogJFZZLCAyMDogJFZaIH0pXSxcbiAgICBkZWZhdWx0QWN0aW9uczogeyA4OiBbMiwgMzBdLCA5OiBbMiwgMzFdIH0sXG4gICAgcGFyc2VFcnJvcjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwYXJzZUVycm9yKHN0ciwgaGFzaCkge1xuICAgICAgaWYgKGhhc2gucmVjb3ZlcmFibGUpIHtcbiAgICAgICAgdGhpcy50cmFjZShzdHIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKHN0cik7XG4gICAgICAgIGVycm9yLmhhc2ggPSBoYXNoO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LCBcInBhcnNlRXJyb3JcIiksXG4gICAgcGFyc2U6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcGFyc2UoaW5wdXQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcywgc3RhY2sgPSBbMF0sIHRzdGFjayA9IFtdLCB2c3RhY2sgPSBbbnVsbF0sIGxzdGFjayA9IFtdLCB0YWJsZSA9IHRoaXMudGFibGUsIHl5dGV4dCA9IFwiXCIsIHl5bGluZW5vID0gMCwgeXlsZW5nID0gMCwgcmVjb3ZlcmluZyA9IDAsIFRFUlJPUiA9IDIsIEVPRiA9IDE7XG4gICAgICB2YXIgYXJncyA9IGxzdGFjay5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICB2YXIgbGV4ZXIyID0gT2JqZWN0LmNyZWF0ZSh0aGlzLmxleGVyKTtcbiAgICAgIHZhciBzaGFyZWRTdGF0ZSA9IHsgeXk6IHt9IH07XG4gICAgICBmb3IgKHZhciBrIGluIHRoaXMueXkpIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnl5LCBrKSkge1xuICAgICAgICAgIHNoYXJlZFN0YXRlLnl5W2tdID0gdGhpcy55eVtrXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGV4ZXIyLnNldElucHV0KGlucHV0LCBzaGFyZWRTdGF0ZS55eSk7XG4gICAgICBzaGFyZWRTdGF0ZS55eS5sZXhlciA9IGxleGVyMjtcbiAgICAgIHNoYXJlZFN0YXRlLnl5LnBhcnNlciA9IHRoaXM7XG4gICAgICBpZiAodHlwZW9mIGxleGVyMi55eWxsb2MgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBsZXhlcjIueXlsbG9jID0ge307XG4gICAgICB9XG4gICAgICB2YXIgeXlsb2MgPSBsZXhlcjIueXlsbG9jO1xuICAgICAgbHN0YWNrLnB1c2goeXlsb2MpO1xuICAgICAgdmFyIHJhbmdlcyA9IGxleGVyMi5vcHRpb25zICYmIGxleGVyMi5vcHRpb25zLnJhbmdlcztcbiAgICAgIGlmICh0eXBlb2Ygc2hhcmVkU3RhdGUueXkucGFyc2VFcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRoaXMucGFyc2VFcnJvciA9IHNoYXJlZFN0YXRlLnl5LnBhcnNlRXJyb3I7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBhcnNlRXJyb3IgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykucGFyc2VFcnJvcjtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHBvcFN0YWNrKG4pIHtcbiAgICAgICAgc3RhY2subGVuZ3RoID0gc3RhY2subGVuZ3RoIC0gMiAqIG47XG4gICAgICAgIHZzdGFjay5sZW5ndGggPSB2c3RhY2subGVuZ3RoIC0gbjtcbiAgICAgICAgbHN0YWNrLmxlbmd0aCA9IGxzdGFjay5sZW5ndGggLSBuO1xuICAgICAgfVxuICAgICAgX19uYW1lKHBvcFN0YWNrLCBcInBvcFN0YWNrXCIpO1xuICAgICAgZnVuY3Rpb24gbGV4KCkge1xuICAgICAgICB2YXIgdG9rZW47XG4gICAgICAgIHRva2VuID0gdHN0YWNrLnBvcCgpIHx8IGxleGVyMi5sZXgoKSB8fCBFT0Y7XG4gICAgICAgIGlmICh0eXBlb2YgdG9rZW4gIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICBpZiAodG9rZW4gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgdHN0YWNrID0gdG9rZW47XG4gICAgICAgICAgICB0b2tlbiA9IHRzdGFjay5wb3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdG9rZW4gPSBzZWxmLnN5bWJvbHNfW3Rva2VuXSB8fCB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICB9XG4gICAgICBfX25hbWUobGV4LCBcImxleFwiKTtcbiAgICAgIHZhciBzeW1ib2wsIHByZUVycm9yU3ltYm9sLCBzdGF0ZSwgYWN0aW9uLCBhLCByLCB5eXZhbCA9IHt9LCBwLCBsZW4sIG5ld1N0YXRlLCBleHBlY3RlZDtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHN0YXRlID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRBY3Rpb25zW3N0YXRlXSkge1xuICAgICAgICAgIGFjdGlvbiA9IHRoaXMuZGVmYXVsdEFjdGlvbnNbc3RhdGVdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChzeW1ib2wgPT09IG51bGwgfHwgdHlwZW9mIHN5bWJvbCA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBzeW1ib2wgPSBsZXgoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aW9uID0gdGFibGVbc3RhdGVdICYmIHRhYmxlW3N0YXRlXVtzeW1ib2xdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgYWN0aW9uID09PSBcInVuZGVmaW5lZFwiIHx8ICFhY3Rpb24ubGVuZ3RoIHx8ICFhY3Rpb25bMF0pIHtcbiAgICAgICAgICB2YXIgZXJyU3RyID0gXCJcIjtcbiAgICAgICAgICBleHBlY3RlZCA9IFtdO1xuICAgICAgICAgIGZvciAocCBpbiB0YWJsZVtzdGF0ZV0pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRlcm1pbmFsc19bcF0gJiYgcCA+IFRFUlJPUikge1xuICAgICAgICAgICAgICBleHBlY3RlZC5wdXNoKFwiJ1wiICsgdGhpcy50ZXJtaW5hbHNfW3BdICsgXCInXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobGV4ZXIyLnNob3dQb3NpdGlvbikge1xuICAgICAgICAgICAgZXJyU3RyID0gXCJQYXJzZSBlcnJvciBvbiBsaW5lIFwiICsgKHl5bGluZW5vICsgMSkgKyBcIjpcXG5cIiArIGxleGVyMi5zaG93UG9zaXRpb24oKSArIFwiXFxuRXhwZWN0aW5nIFwiICsgZXhwZWN0ZWQuam9pbihcIiwgXCIpICsgXCIsIGdvdCAnXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlcnJTdHIgPSBcIlBhcnNlIGVycm9yIG9uIGxpbmUgXCIgKyAoeXlsaW5lbm8gKyAxKSArIFwiOiBVbmV4cGVjdGVkIFwiICsgKHN5bWJvbCA9PSBFT0YgPyBcImVuZCBvZiBpbnB1dFwiIDogXCInXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wYXJzZUVycm9yKGVyclN0ciwge1xuICAgICAgICAgICAgdGV4dDogbGV4ZXIyLm1hdGNoLFxuICAgICAgICAgICAgdG9rZW46IHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCxcbiAgICAgICAgICAgIGxpbmU6IGxleGVyMi55eWxpbmVubyxcbiAgICAgICAgICAgIGxvYzogeXlsb2MsXG4gICAgICAgICAgICBleHBlY3RlZFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhY3Rpb25bMF0gaW5zdGFuY2VvZiBBcnJheSAmJiBhY3Rpb24ubGVuZ3RoID4gMSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcnNlIEVycm9yOiBtdWx0aXBsZSBhY3Rpb25zIHBvc3NpYmxlIGF0IHN0YXRlOiBcIiArIHN0YXRlICsgXCIsIHRva2VuOiBcIiArIHN5bWJvbCk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChhY3Rpb25bMF0pIHtcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBzdGFjay5wdXNoKHN5bWJvbCk7XG4gICAgICAgICAgICB2c3RhY2sucHVzaChsZXhlcjIueXl0ZXh0KTtcbiAgICAgICAgICAgIGxzdGFjay5wdXNoKGxleGVyMi55eWxsb2MpO1xuICAgICAgICAgICAgc3RhY2sucHVzaChhY3Rpb25bMV0pO1xuICAgICAgICAgICAgc3ltYm9sID0gbnVsbDtcbiAgICAgICAgICAgIGlmICghcHJlRXJyb3JTeW1ib2wpIHtcbiAgICAgICAgICAgICAgeXlsZW5nID0gbGV4ZXIyLnl5bGVuZztcbiAgICAgICAgICAgICAgeXl0ZXh0ID0gbGV4ZXIyLnl5dGV4dDtcbiAgICAgICAgICAgICAgeXlsaW5lbm8gPSBsZXhlcjIueXlsaW5lbm87XG4gICAgICAgICAgICAgIHl5bG9jID0gbGV4ZXIyLnl5bGxvYztcbiAgICAgICAgICAgICAgaWYgKHJlY292ZXJpbmcgPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVjb3ZlcmluZy0tO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzeW1ib2wgPSBwcmVFcnJvclN5bWJvbDtcbiAgICAgICAgICAgICAgcHJlRXJyb3JTeW1ib2wgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgbGVuID0gdGhpcy5wcm9kdWN0aW9uc19bYWN0aW9uWzFdXVsxXTtcbiAgICAgICAgICAgIHl5dmFsLiQgPSB2c3RhY2tbdnN0YWNrLmxlbmd0aCAtIGxlbl07XG4gICAgICAgICAgICB5eXZhbC5fJCA9IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5maXJzdF9saW5lLFxuICAgICAgICAgICAgICBsYXN0X2xpbmU6IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gMV0ubGFzdF9saW5lLFxuICAgICAgICAgICAgICBmaXJzdF9jb2x1bW46IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0uZmlyc3RfY29sdW1uLFxuICAgICAgICAgICAgICBsYXN0X2NvbHVtbjogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAxXS5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChyYW5nZXMpIHtcbiAgICAgICAgICAgICAgeXl2YWwuXyQucmFuZ2UgPSBbXG4gICAgICAgICAgICAgICAgbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5yYW5nZVswXSxcbiAgICAgICAgICAgICAgICBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIDFdLnJhbmdlWzFdXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByID0gdGhpcy5wZXJmb3JtQWN0aW9uLmFwcGx5KHl5dmFsLCBbXG4gICAgICAgICAgICAgIHl5dGV4dCxcbiAgICAgICAgICAgICAgeXlsZW5nLFxuICAgICAgICAgICAgICB5eWxpbmVubyxcbiAgICAgICAgICAgICAgc2hhcmVkU3RhdGUueXksXG4gICAgICAgICAgICAgIGFjdGlvblsxXSxcbiAgICAgICAgICAgICAgdnN0YWNrLFxuICAgICAgICAgICAgICBsc3RhY2tcbiAgICAgICAgICAgIF0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsZW4pIHtcbiAgICAgICAgICAgICAgc3RhY2sgPSBzdGFjay5zbGljZSgwLCAtMSAqIGxlbiAqIDIpO1xuICAgICAgICAgICAgICB2c3RhY2sgPSB2c3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgICBsc3RhY2sgPSBsc3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhY2sucHVzaCh0aGlzLnByb2R1Y3Rpb25zX1thY3Rpb25bMV1dWzBdKTtcbiAgICAgICAgICAgIHZzdGFjay5wdXNoKHl5dmFsLiQpO1xuICAgICAgICAgICAgbHN0YWNrLnB1c2goeXl2YWwuXyQpO1xuICAgICAgICAgICAgbmV3U3RhdGUgPSB0YWJsZVtzdGFja1tzdGFjay5sZW5ndGggLSAyXV1bc3RhY2tbc3RhY2subGVuZ3RoIC0gMV1dO1xuICAgICAgICAgICAgc3RhY2sucHVzaChuZXdTdGF0ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSwgXCJwYXJzZVwiKVxuICB9O1xuICB2YXIgbGV4ZXIgPSAvKiBAX19QVVJFX18gKi8gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZXhlcjIgPSB7XG4gICAgICBFT0Y6IDEsXG4gICAgICBwYXJzZUVycm9yOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBhcnNlRXJyb3Ioc3RyLCBoYXNoKSB7XG4gICAgICAgIGlmICh0aGlzLnl5LnBhcnNlcikge1xuICAgICAgICAgIHRoaXMueXkucGFyc2VyLnBhcnNlRXJyb3Ioc3RyLCBoYXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3RyKTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwYXJzZUVycm9yXCIpLFxuICAgICAgLy8gcmVzZXRzIHRoZSBsZXhlciwgc2V0cyBuZXcgaW5wdXRcbiAgICAgIHNldElucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGlucHV0LCB5eSkge1xuICAgICAgICB0aGlzLnl5ID0geXkgfHwgdGhpcy55eSB8fCB7fTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBpbnB1dDtcbiAgICAgICAgdGhpcy5fbW9yZSA9IHRoaXMuX2JhY2t0cmFjayA9IHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnl5bGluZW5vID0gdGhpcy55eWxlbmcgPSAwO1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2ggPSBcIlwiO1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrID0gW1wiSU5JVElBTFwiXTtcbiAgICAgICAgdGhpcy55eWxsb2MgPSB7XG4gICAgICAgICAgZmlyc3RfbGluZTogMSxcbiAgICAgICAgICBmaXJzdF9jb2x1bW46IDAsXG4gICAgICAgICAgbGFzdF9saW5lOiAxLFxuICAgICAgICAgIGxhc3RfY29sdW1uOiAwXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2UgPSBbMCwgMF07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vZmZzZXQgPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwic2V0SW5wdXRcIiksXG4gICAgICAvLyBjb25zdW1lcyBhbmQgcmV0dXJucyBvbmUgY2hhciBmcm9tIHRoZSBpbnB1dFxuICAgICAgaW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjaCA9IHRoaXMuX2lucHV0WzBdO1xuICAgICAgICB0aGlzLnl5dGV4dCArPSBjaDtcbiAgICAgICAgdGhpcy55eWxlbmcrKztcbiAgICAgICAgdGhpcy5vZmZzZXQrKztcbiAgICAgICAgdGhpcy5tYXRjaCArPSBjaDtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IGNoO1xuICAgICAgICB2YXIgbGluZXMgPSBjaC5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8rKztcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2xpbmUrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtbisrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2VbMV0rKztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pbnB1dCA9IHRoaXMuX2lucHV0LnNsaWNlKDEpO1xuICAgICAgICByZXR1cm4gY2g7XG4gICAgICB9LCBcImlucHV0XCIpLFxuICAgICAgLy8gdW5zaGlmdHMgb25lIGNoYXIgKG9yIGEgc3RyaW5nKSBpbnRvIHRoZSBpbnB1dFxuICAgICAgdW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oY2gpIHtcbiAgICAgICAgdmFyIGxlbiA9IGNoLmxlbmd0aDtcbiAgICAgICAgdmFyIGxpbmVzID0gY2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBjaCArIHRoaXMuX2lucHV0O1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMueXl0ZXh0LnN1YnN0cigwLCB0aGlzLnl5dGV4dC5sZW5ndGggLSBsZW4pO1xuICAgICAgICB0aGlzLm9mZnNldCAtPSBsZW47XG4gICAgICAgIHZhciBvbGRMaW5lcyA9IHRoaXMubWF0Y2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5tYXRjaCA9IHRoaXMubWF0Y2guc3Vic3RyKDAsIHRoaXMubWF0Y2gubGVuZ3RoIC0gMSk7XG4gICAgICAgIHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2hlZC5zdWJzdHIoMCwgdGhpcy5tYXRjaGVkLmxlbmd0aCAtIDEpO1xuICAgICAgICBpZiAobGluZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gLT0gbGluZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgciA9IHRoaXMueXlsbG9jLnJhbmdlO1xuICAgICAgICB0aGlzLnl5bGxvYyA9IHtcbiAgICAgICAgICBmaXJzdF9saW5lOiB0aGlzLnl5bGxvYy5maXJzdF9saW5lLFxuICAgICAgICAgIGxhc3RfbGluZTogdGhpcy55eWxpbmVubyArIDEsXG4gICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gKGxpbmVzLmxlbmd0aCA9PT0gb2xkTGluZXMubGVuZ3RoID8gdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uIDogMCkgKyBvbGRMaW5lc1tvbGRMaW5lcy5sZW5ndGggLSBsaW5lcy5sZW5ndGhdLmxlbmd0aCAtIGxpbmVzWzBdLmxlbmd0aCA6IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbiAtIGxlblxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlID0gW3JbMF0sIHJbMF0gKyB0aGlzLnl5bGVuZyAtIGxlbl07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy55eWxlbmcgPSB0aGlzLnl5dGV4dC5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJ1bnB1dFwiKSxcbiAgICAgIC8vIFdoZW4gY2FsbGVkIGZyb20gYWN0aW9uLCBjYWNoZXMgbWF0Y2hlZCB0ZXh0IGFuZCBhcHBlbmRzIGl0IG9uIG5leHQgYWN0aW9uXG4gICAgICBtb3JlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9tb3JlID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcIm1vcmVcIiksXG4gICAgICAvLyBXaGVuIGNhbGxlZCBmcm9tIGFjdGlvbiwgc2lnbmFscyB0aGUgbGV4ZXIgdGhhdCB0aGlzIHJ1bGUgZmFpbHMgdG8gbWF0Y2ggdGhlIGlucHV0LCBzbyB0aGUgbmV4dCBtYXRjaGluZyBydWxlIChyZWdleCkgc2hvdWxkIGJlIHRlc3RlZCBpbnN0ZWFkLlxuICAgICAgcmVqZWN0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2t0cmFja19sZXhlcikge1xuICAgICAgICAgIHRoaXMuX2JhY2t0cmFjayA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gWW91IGNhbiBvbmx5IGludm9rZSByZWplY3QoKSBpbiB0aGUgbGV4ZXIgd2hlbiB0aGUgbGV4ZXIgaXMgb2YgdGhlIGJhY2t0cmFja2luZyBwZXJzdWFzaW9uIChvcHRpb25zLmJhY2t0cmFja19sZXhlciA9IHRydWUpLlxcblwiICsgdGhpcy5zaG93UG9zaXRpb24oKSwge1xuICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgIHRva2VuOiBudWxsLFxuICAgICAgICAgICAgbGluZTogdGhpcy55eWxpbmVub1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJyZWplY3RcIiksXG4gICAgICAvLyByZXRhaW4gZmlyc3QgbiBjaGFyYWN0ZXJzIG9mIHRoZSBtYXRjaFxuICAgICAgbGVzczogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihuKSB7XG4gICAgICAgIHRoaXMudW5wdXQodGhpcy5tYXRjaC5zbGljZShuKSk7XG4gICAgICB9LCBcImxlc3NcIiksXG4gICAgICAvLyBkaXNwbGF5cyBhbHJlYWR5IG1hdGNoZWQgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICBwYXN0SW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwYXN0ID0gdGhpcy5tYXRjaGVkLnN1YnN0cigwLCB0aGlzLm1hdGNoZWQubGVuZ3RoIC0gdGhpcy5tYXRjaC5sZW5ndGgpO1xuICAgICAgICByZXR1cm4gKHBhc3QubGVuZ3RoID4gMjAgPyBcIi4uLlwiIDogXCJcIikgKyBwYXN0LnN1YnN0cigtMjApLnJlcGxhY2UoL1xcbi9nLCBcIlwiKTtcbiAgICAgIH0sIFwicGFzdElucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdXBjb21pbmcgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICB1cGNvbWluZ0lucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV4dCA9IHRoaXMubWF0Y2g7XG4gICAgICAgIGlmIChuZXh0Lmxlbmd0aCA8IDIwKSB7XG4gICAgICAgICAgbmV4dCArPSB0aGlzLl9pbnB1dC5zdWJzdHIoMCwgMjAgLSBuZXh0Lmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChuZXh0LnN1YnN0cigwLCAyMCkgKyAobmV4dC5sZW5ndGggPiAyMCA/IFwiLi4uXCIgOiBcIlwiKSkucmVwbGFjZSgvXFxuL2csIFwiXCIpO1xuICAgICAgfSwgXCJ1cGNvbWluZ0lucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdGhlIGNoYXJhY3RlciBwb3NpdGlvbiB3aGVyZSB0aGUgbGV4aW5nIGVycm9yIG9jY3VycmVkLCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgc2hvd1Bvc2l0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJlID0gdGhpcy5wYXN0SW5wdXQoKTtcbiAgICAgICAgdmFyIGMgPSBuZXcgQXJyYXkocHJlLmxlbmd0aCArIDEpLmpvaW4oXCItXCIpO1xuICAgICAgICByZXR1cm4gcHJlICsgdGhpcy51cGNvbWluZ0lucHV0KCkgKyBcIlxcblwiICsgYyArIFwiXlwiO1xuICAgICAgfSwgXCJzaG93UG9zaXRpb25cIiksXG4gICAgICAvLyB0ZXN0IHRoZSBsZXhlZCB0b2tlbjogcmV0dXJuIEZBTFNFIHdoZW4gbm90IGEgbWF0Y2gsIG90aGVyd2lzZSByZXR1cm4gdG9rZW5cbiAgICAgIHRlc3RfbWF0Y2g6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obWF0Y2gsIGluZGV4ZWRfcnVsZSkge1xuICAgICAgICB2YXIgdG9rZW4sIGxpbmVzLCBiYWNrdXA7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFja3RyYWNrX2xleGVyKSB7XG4gICAgICAgICAgYmFja3VwID0ge1xuICAgICAgICAgICAgeXlsaW5lbm86IHRoaXMueXlsaW5lbm8sXG4gICAgICAgICAgICB5eWxsb2M6IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogdGhpcy55eWxsb2MuZmlyc3RfbGluZSxcbiAgICAgICAgICAgICAgbGFzdF9saW5lOiB0aGlzLmxhc3RfbGluZSxcbiAgICAgICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgICAgIGxhc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHl5dGV4dDogdGhpcy55eXRleHQsXG4gICAgICAgICAgICBtYXRjaDogdGhpcy5tYXRjaCxcbiAgICAgICAgICAgIG1hdGNoZXM6IHRoaXMubWF0Y2hlcyxcbiAgICAgICAgICAgIG1hdGNoZWQ6IHRoaXMubWF0Y2hlZCxcbiAgICAgICAgICAgIHl5bGVuZzogdGhpcy55eWxlbmcsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgX21vcmU6IHRoaXMuX21vcmUsXG4gICAgICAgICAgICBfaW5wdXQ6IHRoaXMuX2lucHV0LFxuICAgICAgICAgICAgeXk6IHRoaXMueXksXG4gICAgICAgICAgICBjb25kaXRpb25TdGFjazogdGhpcy5jb25kaXRpb25TdGFjay5zbGljZSgwKSxcbiAgICAgICAgICAgIGRvbmU6IHRoaXMuZG9uZVxuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICAgIGJhY2t1cC55eWxsb2MucmFuZ2UgPSB0aGlzLnl5bGxvYy5yYW5nZS5zbGljZSgwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMgPSBtYXRjaFswXS5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gKz0gbGluZXMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueXlsbG9jID0ge1xuICAgICAgICAgIGZpcnN0X2xpbmU6IHRoaXMueXlsbG9jLmxhc3RfbGluZSxcbiAgICAgICAgICBsYXN0X2xpbmU6IHRoaXMueXlsaW5lbm8gKyAxLFxuICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubGVuZ3RoIC0gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubWF0Y2goL1xccj9cXG4/LylbMF0ubGVuZ3RoIDogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4gKyBtYXRjaFswXS5sZW5ndGhcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy55eXRleHQgKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2ggKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2hlcyA9IG1hdGNoO1xuICAgICAgICB0aGlzLnl5bGVuZyA9IHRoaXMueXl0ZXh0Lmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZSA9IFt0aGlzLm9mZnNldCwgdGhpcy5vZmZzZXQgKz0gdGhpcy55eWxlbmddO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX21vcmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fYmFja3RyYWNrID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2lucHV0ID0gdGhpcy5faW5wdXQuc2xpY2UobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IG1hdGNoWzBdO1xuICAgICAgICB0b2tlbiA9IHRoaXMucGVyZm9ybUFjdGlvbi5jYWxsKHRoaXMsIHRoaXMueXksIHRoaXMsIGluZGV4ZWRfcnVsZSwgdGhpcy5jb25kaXRpb25TdGFja1t0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgaWYgKHRoaXMuZG9uZSAmJiB0aGlzLl9pbnB1dCkge1xuICAgICAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9iYWNrdHJhY2spIHtcbiAgICAgICAgICBmb3IgKHZhciBrIGluIGJhY2t1cCkge1xuICAgICAgICAgICAgdGhpc1trXSA9IGJhY2t1cFtrXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sIFwidGVzdF9tYXRjaFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIGluIGlucHV0XG4gICAgICBuZXh0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuRU9GO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5faW5wdXQpIHtcbiAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0b2tlbiwgbWF0Y2gsIHRlbXBNYXRjaCwgaW5kZXg7XG4gICAgICAgIGlmICghdGhpcy5fbW9yZSkge1xuICAgICAgICAgIHRoaXMueXl0ZXh0ID0gXCJcIjtcbiAgICAgICAgICB0aGlzLm1hdGNoID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcnVsZXMgPSB0aGlzLl9jdXJyZW50UnVsZXMoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRlbXBNYXRjaCA9IHRoaXMuX2lucHV0Lm1hdGNoKHRoaXMucnVsZXNbcnVsZXNbaV1dKTtcbiAgICAgICAgICBpZiAodGVtcE1hdGNoICYmICghbWF0Y2ggfHwgdGVtcE1hdGNoWzBdLmxlbmd0aCA+IG1hdGNoWzBdLmxlbmd0aCkpIHtcbiAgICAgICAgICAgIG1hdGNoID0gdGVtcE1hdGNoO1xuICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIpIHtcbiAgICAgICAgICAgICAgdG9rZW4gPSB0aGlzLnRlc3RfbWF0Y2godGVtcE1hdGNoLCBydWxlc1tpXSk7XG4gICAgICAgICAgICAgIGlmICh0b2tlbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmFja3RyYWNrKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMub3B0aW9ucy5mbGV4KSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICB0b2tlbiA9IHRoaXMudGVzdF9tYXRjaChtYXRjaCwgcnVsZXNbaW5kZXhdKTtcbiAgICAgICAgICBpZiAodG9rZW4gIT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5faW5wdXQgPT09IFwiXCIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5FT0Y7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gVW5yZWNvZ25pemVkIHRleHQuXFxuXCIgKyB0aGlzLnNob3dQb3NpdGlvbigpLCB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgdG9rZW46IG51bGwsXG4gICAgICAgICAgICBsaW5lOiB0aGlzLnl5bGluZW5vXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibmV4dFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIHRoYXQgaGFzIGEgdG9rZW5cbiAgICAgIGxleDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBsZXgoKSB7XG4gICAgICAgIHZhciByID0gdGhpcy5uZXh0KCk7XG4gICAgICAgIGlmIChyKSB7XG4gICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubGV4KCk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibGV4XCIpLFxuICAgICAgLy8gYWN0aXZhdGVzIGEgbmV3IGxleGVyIGNvbmRpdGlvbiBzdGF0ZSAocHVzaGVzIHRoZSBuZXcgbGV4ZXIgY29uZGl0aW9uIHN0YXRlIG9udG8gdGhlIGNvbmRpdGlvbiBzdGFjaylcbiAgICAgIGJlZ2luOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGJlZ2luKGNvbmRpdGlvbikge1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrLnB1c2goY29uZGl0aW9uKTtcbiAgICAgIH0sIFwiYmVnaW5cIiksXG4gICAgICAvLyBwb3AgdGhlIHByZXZpb3VzbHkgYWN0aXZlIGxleGVyIGNvbmRpdGlvbiBzdGF0ZSBvZmYgdGhlIGNvbmRpdGlvbiBzdGFja1xuICAgICAgcG9wU3RhdGU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcG9wU3RhdGUoKSB7XG4gICAgICAgIHZhciBuID0gdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxO1xuICAgICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFjay5wb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1swXTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwb3BTdGF0ZVwiKSxcbiAgICAgIC8vIHByb2R1Y2UgdGhlIGxleGVyIHJ1bGUgc2V0IHdoaWNoIGlzIGFjdGl2ZSBmb3IgdGhlIGN1cnJlbnRseSBhY3RpdmUgbGV4ZXIgY29uZGl0aW9uIHN0YXRlXG4gICAgICBfY3VycmVudFJ1bGVzOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIF9jdXJyZW50UnVsZXMoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAmJiB0aGlzLmNvbmRpdGlvblN0YWNrW3RoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25zW3RoaXMuY29uZGl0aW9uU3RhY2tbdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxXV0ucnVsZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uc1tcIklOSVRJQUxcIl0ucnVsZXM7XG4gICAgICAgIH1cbiAgICAgIH0sIFwiX2N1cnJlbnRSdWxlc1wiKSxcbiAgICAgIC8vIHJldHVybiB0aGUgY3VycmVudGx5IGFjdGl2ZSBsZXhlciBjb25kaXRpb24gc3RhdGU7IHdoZW4gYW4gaW5kZXggYXJndW1lbnQgaXMgcHJvdmlkZWQgaXQgcHJvZHVjZXMgdGhlIE4tdGggcHJldmlvdXMgY29uZGl0aW9uIHN0YXRlLCBpZiBhdmFpbGFibGVcbiAgICAgIHRvcFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHRvcFN0YXRlKG4pIHtcbiAgICAgICAgbiA9IHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMSAtIE1hdGguYWJzKG4gfHwgMCk7XG4gICAgICAgIGlmIChuID49IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1tuXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gXCJJTklUSUFMXCI7XG4gICAgICAgIH1cbiAgICAgIH0sIFwidG9wU3RhdGVcIiksXG4gICAgICAvLyBhbGlhcyBmb3IgYmVnaW4oY29uZGl0aW9uKVxuICAgICAgcHVzaFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHB1c2hTdGF0ZShjb25kaXRpb24pIHtcbiAgICAgICAgdGhpcy5iZWdpbihjb25kaXRpb24pO1xuICAgICAgfSwgXCJwdXNoU3RhdGVcIiksXG4gICAgICAvLyByZXR1cm4gdGhlIG51bWJlciBvZiBzdGF0ZXMgY3VycmVudGx5IG9uIHRoZSBzdGFja1xuICAgICAgc3RhdGVTdGFja1NpemU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gc3RhdGVTdGFja1NpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aDtcbiAgICAgIH0sIFwic3RhdGVTdGFja1NpemVcIiksXG4gICAgICBvcHRpb25zOiB7IFwiY2FzZS1pbnNlbnNpdGl2ZVwiOiB0cnVlIH0sXG4gICAgICBwZXJmb3JtQWN0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGFub255bW91cyh5eSwgeXlfLCAkYXZvaWRpbmdfbmFtZV9jb2xsaXNpb25zLCBZWV9TVEFSVCkge1xuICAgICAgICB2YXIgWVlTVEFURSA9IFlZX1NUQVJUO1xuICAgICAgICBzd2l0Y2ggKCRhdm9pZGluZ19uYW1lX2NvbGxpc2lvbnMpIHtcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gNTU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwidGl0bGVcIik7XG4gICAgICAgICAgICByZXR1cm4gMzU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gXCJ0aXRsZV92YWx1ZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImFjY190aXRsZVwiKTtcbiAgICAgICAgICAgIHJldHVybiAzNztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiBcImFjY190aXRsZV92YWx1ZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImFjY19kZXNjclwiKTtcbiAgICAgICAgICAgIHJldHVybiAzOTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiBcImFjY19kZXNjcl92YWx1ZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJhY2NfZGVzY3JfbXVsdGlsaW5lXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICByZXR1cm4gXCJhY2NfZGVzY3JfbXVsdGlsaW5lX3ZhbHVlXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgcmV0dXJuIDQ4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxNDpcbiAgICAgICAgICAgIHJldHVybiA1MDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgICByZXR1cm4gNDk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgcmV0dXJuIDUxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxNzpcbiAgICAgICAgICAgIHJldHVybiA1MjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTg6XG4gICAgICAgICAgICByZXR1cm4gNTM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE5OlxuICAgICAgICAgICAgcmV0dXJuIDU0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyMDpcbiAgICAgICAgICAgIHJldHVybiAyNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjE6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwibWRfc3RyaW5nXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyMjpcbiAgICAgICAgICAgIHJldHVybiBcIk1EX1NUUlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyMzpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjQ6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwic3RyaW5nXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyNTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjY6XG4gICAgICAgICAgICByZXR1cm4gXCJTVFJcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjc6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiY2xhc3NfbmFtZVwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjg6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gNDc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI5OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcInBvaW50X3N0YXJ0XCIpO1xuICAgICAgICAgICAgcmV0dXJuIDQ0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzMDpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJwb2ludF94XCIpO1xuICAgICAgICAgICAgcmV0dXJuIDQ1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzMTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzI6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwicG9pbnRfeVwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzM6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gNDY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM0OlxuICAgICAgICAgICAgcmV0dXJuIDI4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNTpcbiAgICAgICAgICAgIHJldHVybiA0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNjpcbiAgICAgICAgICAgIHJldHVybiAxNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzc6XG4gICAgICAgICAgICByZXR1cm4gMTE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM4OlxuICAgICAgICAgICAgcmV0dXJuIDY0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzOTpcbiAgICAgICAgICAgIHJldHVybiAxMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgICByZXR1cm4gNjU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQxOlxuICAgICAgICAgICAgcmV0dXJuIDY1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0MjpcbiAgICAgICAgICAgIHJldHVybiAxNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDM6XG4gICAgICAgICAgICByZXR1cm4gMTM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ0OlxuICAgICAgICAgICAgcmV0dXJuIDY3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0NTpcbiAgICAgICAgICAgIHJldHVybiA2NjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDY6XG4gICAgICAgICAgICByZXR1cm4gMTI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ3OlxuICAgICAgICAgICAgcmV0dXJuIDg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ4OlxuICAgICAgICAgICAgcmV0dXJuIDU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ5OlxuICAgICAgICAgICAgcmV0dXJuIDE4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1MDpcbiAgICAgICAgICAgIHJldHVybiA1NjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTE6XG4gICAgICAgICAgICByZXR1cm4gNjM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDUyOlxuICAgICAgICAgICAgcmV0dXJuIDU3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0sIFwiYW5vbnltb3VzXCIpLFxuICAgICAgcnVsZXM6IFsvXig/OiUlKD8hXFx7KVteXFxuXSopL2ksIC9eKD86W15cXH1dJSVbXlxcbl0qKS9pLCAvXig/OltcXG5cXHJdKykvaSwgL14oPzolJVteXFxuXSopL2ksIC9eKD86dGl0bGVcXGIpL2ksIC9eKD86KD8hXFxufHwpKlteXFxuXSopL2ksIC9eKD86YWNjVGl0bGVcXHMqOlxccyopL2ksIC9eKD86KD8hXFxufHwpKlteXFxuXSopL2ksIC9eKD86YWNjRGVzY3JcXHMqOlxccyopL2ksIC9eKD86KD8hXFxufHwpKlteXFxuXSopL2ksIC9eKD86YWNjRGVzY3JcXHMqXFx7XFxzKikvaSwgL14oPzpbXFx9XSkvaSwgL14oPzpbXlxcfV0qKS9pLCAvXig/OiAqeC1heGlzICopL2ksIC9eKD86ICp5LWF4aXMgKikvaSwgL14oPzogKi0tKz4gKikvaSwgL14oPzogKnF1YWRyYW50LTEgKikvaSwgL14oPzogKnF1YWRyYW50LTIgKikvaSwgL14oPzogKnF1YWRyYW50LTMgKikvaSwgL14oPzogKnF1YWRyYW50LTQgKikvaSwgL14oPzpjbGFzc0RlZlxcYikvaSwgL14oPzpbXCJdW2BdKS9pLCAvXig/OlteYFwiXSspL2ksIC9eKD86W2BdW1wiXSkvaSwgL14oPzpbXCJdKS9pLCAvXig/OltcIl0pL2ksIC9eKD86W15cIl0qKS9pLCAvXig/Ojo6OikvaSwgL14oPzpeXFx3KykvaSwgL14oPzpcXHMqOlxccypcXFtcXHMqKS9pLCAvXig/OigxKXwoMCguXFxkKyk/KSkvaSwgL14oPzpcXHMqXFxdICopL2ksIC9eKD86XFxzKixcXHMqKS9pLCAvXig/OigxKXwoMCguXFxkKyk/KSkvaSwgL14oPzogKnF1YWRyYW50Q2hhcnQgKikvaSwgL14oPzpbQS1aYS16XSspL2ksIC9eKD86W15cXHgwMC1cXHg3Rl0rKS9pLCAvXig/OjopL2ksIC9eKD86XFwrKS9pLCAvXig/OiwpL2ksIC9eKD86PSkvaSwgL14oPzo9KS9pLCAvXig/OlxcKikvaSwgL14oPzojKS9pLCAvXig/OltcXF9dKS9pLCAvXig/OlxcLikvaSwgL14oPzomKS9pLCAvXig/Oi0pL2ksIC9eKD86WzAtOV0rKS9pLCAvXig/OlxccykvaSwgL14oPzo7KS9pLCAvXig/OlshXCIjJCUmJyorLC0uYD9cXFxcXy9dKS9pLCAvXig/OiQpL2ldLFxuICAgICAgY29uZGl0aW9uczogeyBcImNsYXNzX25hbWVcIjogeyBcInJ1bGVzXCI6IFsyOF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwicG9pbnRfeVwiOiB7IFwicnVsZXNcIjogWzMzXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJwb2ludF94XCI6IHsgXCJydWxlc1wiOiBbMzJdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcInBvaW50X3N0YXJ0XCI6IHsgXCJydWxlc1wiOiBbMzAsIDMxXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJhY2NfZGVzY3JfbXVsdGlsaW5lXCI6IHsgXCJydWxlc1wiOiBbMTEsIDEyXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJhY2NfZGVzY3JcIjogeyBcInJ1bGVzXCI6IFs5XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJhY2NfdGl0bGVcIjogeyBcInJ1bGVzXCI6IFs3XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJ0aXRsZVwiOiB7IFwicnVsZXNcIjogWzVdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIm1kX3N0cmluZ1wiOiB7IFwicnVsZXNcIjogWzIyLCAyM10sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwic3RyaW5nXCI6IHsgXCJydWxlc1wiOiBbMjUsIDI2XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJJTklUSUFMXCI6IHsgXCJydWxlc1wiOiBbMCwgMSwgMiwgMywgNCwgNiwgOCwgMTAsIDEzLCAxNCwgMTUsIDE2LCAxNywgMTgsIDE5LCAyMCwgMjEsIDI0LCAyNywgMjksIDM0LCAzNSwgMzYsIDM3LCAzOCwgMzksIDQwLCA0MSwgNDIsIDQzLCA0NCwgNDUsIDQ2LCA0NywgNDgsIDQ5LCA1MCwgNTEsIDUyXSwgXCJpbmNsdXNpdmVcIjogdHJ1ZSB9IH1cbiAgICB9O1xuICAgIHJldHVybiBsZXhlcjI7XG4gIH0pKCk7XG4gIHBhcnNlcjIubGV4ZXIgPSBsZXhlcjtcbiAgZnVuY3Rpb24gUGFyc2VyKCkge1xuICAgIHRoaXMueXkgPSB7fTtcbiAgfVxuICBfX25hbWUoUGFyc2VyLCBcIlBhcnNlclwiKTtcbiAgUGFyc2VyLnByb3RvdHlwZSA9IHBhcnNlcjI7XG4gIHBhcnNlcjIuUGFyc2VyID0gUGFyc2VyO1xuICByZXR1cm4gbmV3IFBhcnNlcigpO1xufSkoKTtcbnBhcnNlci5wYXJzZXIgPSBwYXJzZXI7XG52YXIgcXVhZHJhbnRfZGVmYXVsdCA9IHBhcnNlcjtcblxuLy8gc3JjL2RpYWdyYW1zL3F1YWRyYW50LWNoYXJ0L3F1YWRyYW50QnVpbGRlci50c1xuaW1wb3J0IHsgc2NhbGVMaW5lYXIgfSBmcm9tIFwiZDNcIjtcbnZhciBkZWZhdWx0VGhlbWVWYXJpYWJsZXMgPSBnZXRUaGVtZVZhcmlhYmxlcygpO1xudmFyIFF1YWRyYW50QnVpbGRlciA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jbGFzc2VzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICB0aGlzLmNvbmZpZyA9IHRoaXMuZ2V0RGVmYXVsdENvbmZpZygpO1xuICAgIHRoaXMudGhlbWVDb25maWcgPSB0aGlzLmdldERlZmF1bHRUaGVtZUNvbmZpZygpO1xuICAgIHRoaXMuZGF0YSA9IHRoaXMuZ2V0RGVmYXVsdERhdGEoKTtcbiAgfVxuICBzdGF0aWMge1xuICAgIF9fbmFtZSh0aGlzLCBcIlF1YWRyYW50QnVpbGRlclwiKTtcbiAgfVxuICBnZXREZWZhdWx0RGF0YSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGl0bGVUZXh0OiBcIlwiLFxuICAgICAgcXVhZHJhbnQxVGV4dDogXCJcIixcbiAgICAgIHF1YWRyYW50MlRleHQ6IFwiXCIsXG4gICAgICBxdWFkcmFudDNUZXh0OiBcIlwiLFxuICAgICAgcXVhZHJhbnQ0VGV4dDogXCJcIixcbiAgICAgIHhBeGlzTGVmdFRleHQ6IFwiXCIsXG4gICAgICB4QXhpc1JpZ2h0VGV4dDogXCJcIixcbiAgICAgIHlBeGlzQm90dG9tVGV4dDogXCJcIixcbiAgICAgIHlBeGlzVG9wVGV4dDogXCJcIixcbiAgICAgIHBvaW50czogW11cbiAgICB9O1xuICB9XG4gIGdldERlZmF1bHRDb25maWcoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNob3dYQXhpczogdHJ1ZSxcbiAgICAgIHNob3dZQXhpczogdHJ1ZSxcbiAgICAgIHNob3dUaXRsZTogdHJ1ZSxcbiAgICAgIGNoYXJ0SGVpZ2h0OiBkZWZhdWx0Q29uZmlnX2RlZmF1bHQucXVhZHJhbnRDaGFydD8uY2hhcnRXaWR0aCB8fCA1MDAsXG4gICAgICBjaGFydFdpZHRoOiBkZWZhdWx0Q29uZmlnX2RlZmF1bHQucXVhZHJhbnRDaGFydD8uY2hhcnRIZWlnaHQgfHwgNTAwLFxuICAgICAgdGl0bGVQYWRkaW5nOiBkZWZhdWx0Q29uZmlnX2RlZmF1bHQucXVhZHJhbnRDaGFydD8udGl0bGVQYWRkaW5nIHx8IDEwLFxuICAgICAgdGl0bGVGb250U2l6ZTogZGVmYXVsdENvbmZpZ19kZWZhdWx0LnF1YWRyYW50Q2hhcnQ/LnRpdGxlRm9udFNpemUgfHwgMjAsXG4gICAgICBxdWFkcmFudFBhZGRpbmc6IGRlZmF1bHRDb25maWdfZGVmYXVsdC5xdWFkcmFudENoYXJ0Py5xdWFkcmFudFBhZGRpbmcgfHwgNSxcbiAgICAgIHhBeGlzTGFiZWxQYWRkaW5nOiBkZWZhdWx0Q29uZmlnX2RlZmF1bHQucXVhZHJhbnRDaGFydD8ueEF4aXNMYWJlbFBhZGRpbmcgfHwgNSxcbiAgICAgIHlBeGlzTGFiZWxQYWRkaW5nOiBkZWZhdWx0Q29uZmlnX2RlZmF1bHQucXVhZHJhbnRDaGFydD8ueUF4aXNMYWJlbFBhZGRpbmcgfHwgNSxcbiAgICAgIHhBeGlzTGFiZWxGb250U2l6ZTogZGVmYXVsdENvbmZpZ19kZWZhdWx0LnF1YWRyYW50Q2hhcnQ/LnhBeGlzTGFiZWxGb250U2l6ZSB8fCAxNixcbiAgICAgIHlBeGlzTGFiZWxGb250U2l6ZTogZGVmYXVsdENvbmZpZ19kZWZhdWx0LnF1YWRyYW50Q2hhcnQ/LnlBeGlzTGFiZWxGb250U2l6ZSB8fCAxNixcbiAgICAgIHF1YWRyYW50TGFiZWxGb250U2l6ZTogZGVmYXVsdENvbmZpZ19kZWZhdWx0LnF1YWRyYW50Q2hhcnQ/LnF1YWRyYW50TGFiZWxGb250U2l6ZSB8fCAxNixcbiAgICAgIHF1YWRyYW50VGV4dFRvcFBhZGRpbmc6IGRlZmF1bHRDb25maWdfZGVmYXVsdC5xdWFkcmFudENoYXJ0Py5xdWFkcmFudFRleHRUb3BQYWRkaW5nIHx8IDUsXG4gICAgICBwb2ludFRleHRQYWRkaW5nOiBkZWZhdWx0Q29uZmlnX2RlZmF1bHQucXVhZHJhbnRDaGFydD8ucG9pbnRUZXh0UGFkZGluZyB8fCA1LFxuICAgICAgcG9pbnRMYWJlbEZvbnRTaXplOiBkZWZhdWx0Q29uZmlnX2RlZmF1bHQucXVhZHJhbnRDaGFydD8ucG9pbnRMYWJlbEZvbnRTaXplIHx8IDEyLFxuICAgICAgcG9pbnRSYWRpdXM6IGRlZmF1bHRDb25maWdfZGVmYXVsdC5xdWFkcmFudENoYXJ0Py5wb2ludFJhZGl1cyB8fCA1LFxuICAgICAgeEF4aXNQb3NpdGlvbjogZGVmYXVsdENvbmZpZ19kZWZhdWx0LnF1YWRyYW50Q2hhcnQ/LnhBeGlzUG9zaXRpb24gfHwgXCJ0b3BcIixcbiAgICAgIHlBeGlzUG9zaXRpb246IGRlZmF1bHRDb25maWdfZGVmYXVsdC5xdWFkcmFudENoYXJ0Py55QXhpc1Bvc2l0aW9uIHx8IFwibGVmdFwiLFxuICAgICAgcXVhZHJhbnRJbnRlcm5hbEJvcmRlclN0cm9rZVdpZHRoOiBkZWZhdWx0Q29uZmlnX2RlZmF1bHQucXVhZHJhbnRDaGFydD8ucXVhZHJhbnRJbnRlcm5hbEJvcmRlclN0cm9rZVdpZHRoIHx8IDEsXG4gICAgICBxdWFkcmFudEV4dGVybmFsQm9yZGVyU3Ryb2tlV2lkdGg6IGRlZmF1bHRDb25maWdfZGVmYXVsdC5xdWFkcmFudENoYXJ0Py5xdWFkcmFudEV4dGVybmFsQm9yZGVyU3Ryb2tlV2lkdGggfHwgMlxuICAgIH07XG4gIH1cbiAgZ2V0RGVmYXVsdFRoZW1lQ29uZmlnKCkge1xuICAgIHJldHVybiB7XG4gICAgICBxdWFkcmFudDFGaWxsOiBkZWZhdWx0VGhlbWVWYXJpYWJsZXMucXVhZHJhbnQxRmlsbCxcbiAgICAgIHF1YWRyYW50MkZpbGw6IGRlZmF1bHRUaGVtZVZhcmlhYmxlcy5xdWFkcmFudDJGaWxsLFxuICAgICAgcXVhZHJhbnQzRmlsbDogZGVmYXVsdFRoZW1lVmFyaWFibGVzLnF1YWRyYW50M0ZpbGwsXG4gICAgICBxdWFkcmFudDRGaWxsOiBkZWZhdWx0VGhlbWVWYXJpYWJsZXMucXVhZHJhbnQ0RmlsbCxcbiAgICAgIHF1YWRyYW50MVRleHRGaWxsOiBkZWZhdWx0VGhlbWVWYXJpYWJsZXMucXVhZHJhbnQxVGV4dEZpbGwsXG4gICAgICBxdWFkcmFudDJUZXh0RmlsbDogZGVmYXVsdFRoZW1lVmFyaWFibGVzLnF1YWRyYW50MlRleHRGaWxsLFxuICAgICAgcXVhZHJhbnQzVGV4dEZpbGw6IGRlZmF1bHRUaGVtZVZhcmlhYmxlcy5xdWFkcmFudDNUZXh0RmlsbCxcbiAgICAgIHF1YWRyYW50NFRleHRGaWxsOiBkZWZhdWx0VGhlbWVWYXJpYWJsZXMucXVhZHJhbnQ0VGV4dEZpbGwsXG4gICAgICBxdWFkcmFudFBvaW50RmlsbDogZGVmYXVsdFRoZW1lVmFyaWFibGVzLnF1YWRyYW50UG9pbnRGaWxsLFxuICAgICAgcXVhZHJhbnRQb2ludFRleHRGaWxsOiBkZWZhdWx0VGhlbWVWYXJpYWJsZXMucXVhZHJhbnRQb2ludFRleHRGaWxsLFxuICAgICAgcXVhZHJhbnRYQXhpc1RleHRGaWxsOiBkZWZhdWx0VGhlbWVWYXJpYWJsZXMucXVhZHJhbnRYQXhpc1RleHRGaWxsLFxuICAgICAgcXVhZHJhbnRZQXhpc1RleHRGaWxsOiBkZWZhdWx0VGhlbWVWYXJpYWJsZXMucXVhZHJhbnRZQXhpc1RleHRGaWxsLFxuICAgICAgcXVhZHJhbnRUaXRsZUZpbGw6IGRlZmF1bHRUaGVtZVZhcmlhYmxlcy5xdWFkcmFudFRpdGxlRmlsbCxcbiAgICAgIHF1YWRyYW50SW50ZXJuYWxCb3JkZXJTdHJva2VGaWxsOiBkZWZhdWx0VGhlbWVWYXJpYWJsZXMucXVhZHJhbnRJbnRlcm5hbEJvcmRlclN0cm9rZUZpbGwsXG4gICAgICBxdWFkcmFudEV4dGVybmFsQm9yZGVyU3Ryb2tlRmlsbDogZGVmYXVsdFRoZW1lVmFyaWFibGVzLnF1YWRyYW50RXh0ZXJuYWxCb3JkZXJTdHJva2VGaWxsXG4gICAgfTtcbiAgfVxuICBjbGVhcigpIHtcbiAgICB0aGlzLmNvbmZpZyA9IHRoaXMuZ2V0RGVmYXVsdENvbmZpZygpO1xuICAgIHRoaXMudGhlbWVDb25maWcgPSB0aGlzLmdldERlZmF1bHRUaGVtZUNvbmZpZygpO1xuICAgIHRoaXMuZGF0YSA9IHRoaXMuZ2V0RGVmYXVsdERhdGEoKTtcbiAgICB0aGlzLmNsYXNzZXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgIGxvZy5pbmZvKFwiY2xlYXIgY2FsbGVkXCIpO1xuICB9XG4gIHNldERhdGEoZGF0YSkge1xuICAgIHRoaXMuZGF0YSA9IHsgLi4udGhpcy5kYXRhLCAuLi5kYXRhIH07XG4gIH1cbiAgYWRkUG9pbnRzKHBvaW50cykge1xuICAgIHRoaXMuZGF0YS5wb2ludHMgPSBbLi4ucG9pbnRzLCAuLi50aGlzLmRhdGEucG9pbnRzXTtcbiAgfVxuICBhZGRDbGFzcyhjbGFzc05hbWUsIHN0eWxlcykge1xuICAgIHRoaXMuY2xhc3Nlcy5zZXQoY2xhc3NOYW1lLCBzdHlsZXMpO1xuICB9XG4gIHNldENvbmZpZyhjb25maWcyKSB7XG4gICAgbG9nLnRyYWNlKFwic2V0Q29uZmlnIGNhbGxlZCB3aXRoOiBcIiwgY29uZmlnMik7XG4gICAgdGhpcy5jb25maWcgPSB7IC4uLnRoaXMuY29uZmlnLCAuLi5jb25maWcyIH07XG4gIH1cbiAgc2V0VGhlbWVDb25maWcodGhlbWVDb25maWcpIHtcbiAgICBsb2cudHJhY2UoXCJzZXRUaGVtZUNvbmZpZyBjYWxsZWQgd2l0aDogXCIsIHRoZW1lQ29uZmlnKTtcbiAgICB0aGlzLnRoZW1lQ29uZmlnID0geyAuLi50aGlzLnRoZW1lQ29uZmlnLCAuLi50aGVtZUNvbmZpZyB9O1xuICB9XG4gIGNhbGN1bGF0ZVNwYWNlKHhBeGlzUG9zaXRpb24sIHNob3dYQXhpcywgc2hvd1lBeGlzLCBzaG93VGl0bGUpIHtcbiAgICBjb25zdCB4QXhpc1NwYWNlQ2FsY3VsYXRpb24gPSB0aGlzLmNvbmZpZy54QXhpc0xhYmVsUGFkZGluZyAqIDIgKyB0aGlzLmNvbmZpZy54QXhpc0xhYmVsRm9udFNpemU7XG4gICAgY29uc3QgeEF4aXNTcGFjZSA9IHtcbiAgICAgIHRvcDogeEF4aXNQb3NpdGlvbiA9PT0gXCJ0b3BcIiAmJiBzaG93WEF4aXMgPyB4QXhpc1NwYWNlQ2FsY3VsYXRpb24gOiAwLFxuICAgICAgYm90dG9tOiB4QXhpc1Bvc2l0aW9uID09PSBcImJvdHRvbVwiICYmIHNob3dYQXhpcyA/IHhBeGlzU3BhY2VDYWxjdWxhdGlvbiA6IDBcbiAgICB9O1xuICAgIGNvbnN0IHlBeGlzU3BhY2VDYWxjdWxhdGlvbiA9IHRoaXMuY29uZmlnLnlBeGlzTGFiZWxQYWRkaW5nICogMiArIHRoaXMuY29uZmlnLnlBeGlzTGFiZWxGb250U2l6ZTtcbiAgICBjb25zdCB5QXhpc1NwYWNlID0ge1xuICAgICAgbGVmdDogdGhpcy5jb25maWcueUF4aXNQb3NpdGlvbiA9PT0gXCJsZWZ0XCIgJiYgc2hvd1lBeGlzID8geUF4aXNTcGFjZUNhbGN1bGF0aW9uIDogMCxcbiAgICAgIHJpZ2h0OiB0aGlzLmNvbmZpZy55QXhpc1Bvc2l0aW9uID09PSBcInJpZ2h0XCIgJiYgc2hvd1lBeGlzID8geUF4aXNTcGFjZUNhbGN1bGF0aW9uIDogMFxuICAgIH07XG4gICAgY29uc3QgdGl0bGVTcGFjZUNhbGN1bGF0aW9uID0gdGhpcy5jb25maWcudGl0bGVGb250U2l6ZSArIHRoaXMuY29uZmlnLnRpdGxlUGFkZGluZyAqIDI7XG4gICAgY29uc3QgdGl0bGVTcGFjZSA9IHtcbiAgICAgIHRvcDogc2hvd1RpdGxlID8gdGl0bGVTcGFjZUNhbGN1bGF0aW9uIDogMFxuICAgIH07XG4gICAgY29uc3QgcXVhZHJhbnRMZWZ0ID0gdGhpcy5jb25maWcucXVhZHJhbnRQYWRkaW5nICsgeUF4aXNTcGFjZS5sZWZ0O1xuICAgIGNvbnN0IHF1YWRyYW50VG9wID0gdGhpcy5jb25maWcucXVhZHJhbnRQYWRkaW5nICsgeEF4aXNTcGFjZS50b3AgKyB0aXRsZVNwYWNlLnRvcDtcbiAgICBjb25zdCBxdWFkcmFudFdpZHRoID0gdGhpcy5jb25maWcuY2hhcnRXaWR0aCAtIHRoaXMuY29uZmlnLnF1YWRyYW50UGFkZGluZyAqIDIgLSB5QXhpc1NwYWNlLmxlZnQgLSB5QXhpc1NwYWNlLnJpZ2h0O1xuICAgIGNvbnN0IHF1YWRyYW50SGVpZ2h0ID0gdGhpcy5jb25maWcuY2hhcnRIZWlnaHQgLSB0aGlzLmNvbmZpZy5xdWFkcmFudFBhZGRpbmcgKiAyIC0geEF4aXNTcGFjZS50b3AgLSB4QXhpc1NwYWNlLmJvdHRvbSAtIHRpdGxlU3BhY2UudG9wO1xuICAgIGNvbnN0IHF1YWRyYW50SGFsZldpZHRoID0gcXVhZHJhbnRXaWR0aCAvIDI7XG4gICAgY29uc3QgcXVhZHJhbnRIYWxmSGVpZ2h0ID0gcXVhZHJhbnRIZWlnaHQgLyAyO1xuICAgIGNvbnN0IHF1YWRyYW50U3BhY2UgPSB7XG4gICAgICBxdWFkcmFudExlZnQsXG4gICAgICBxdWFkcmFudFRvcCxcbiAgICAgIHF1YWRyYW50V2lkdGgsXG4gICAgICBxdWFkcmFudEhhbGZXaWR0aCxcbiAgICAgIHF1YWRyYW50SGVpZ2h0LFxuICAgICAgcXVhZHJhbnRIYWxmSGVpZ2h0XG4gICAgfTtcbiAgICByZXR1cm4ge1xuICAgICAgeEF4aXNTcGFjZSxcbiAgICAgIHlBeGlzU3BhY2UsXG4gICAgICB0aXRsZVNwYWNlLFxuICAgICAgcXVhZHJhbnRTcGFjZVxuICAgIH07XG4gIH1cbiAgZ2V0QXhpc0xhYmVscyh4QXhpc1Bvc2l0aW9uLCBzaG93WEF4aXMsIHNob3dZQXhpcywgc3BhY2VEYXRhKSB7XG4gICAgY29uc3QgeyBxdWFkcmFudFNwYWNlLCB0aXRsZVNwYWNlIH0gPSBzcGFjZURhdGE7XG4gICAgY29uc3Qge1xuICAgICAgcXVhZHJhbnRIYWxmSGVpZ2h0LFxuICAgICAgcXVhZHJhbnRIZWlnaHQsXG4gICAgICBxdWFkcmFudExlZnQsXG4gICAgICBxdWFkcmFudEhhbGZXaWR0aCxcbiAgICAgIHF1YWRyYW50VG9wLFxuICAgICAgcXVhZHJhbnRXaWR0aFxuICAgIH0gPSBxdWFkcmFudFNwYWNlO1xuICAgIGNvbnN0IGRyYXdYQXhpc0xhYmVsc0luTWlkZGxlID0gQm9vbGVhbih0aGlzLmRhdGEueEF4aXNSaWdodFRleHQpO1xuICAgIGNvbnN0IGRyYXdZQXhpc0xhYmVsc0luTWlkZGxlID0gQm9vbGVhbih0aGlzLmRhdGEueUF4aXNUb3BUZXh0KTtcbiAgICBjb25zdCBheGlzTGFiZWxzID0gW107XG4gICAgaWYgKHRoaXMuZGF0YS54QXhpc0xlZnRUZXh0ICYmIHNob3dYQXhpcykge1xuICAgICAgYXhpc0xhYmVscy5wdXNoKHtcbiAgICAgICAgdGV4dDogdGhpcy5kYXRhLnhBeGlzTGVmdFRleHQsXG4gICAgICAgIGZpbGw6IHRoaXMudGhlbWVDb25maWcucXVhZHJhbnRYQXhpc1RleHRGaWxsLFxuICAgICAgICB4OiBxdWFkcmFudExlZnQgKyAoZHJhd1hBeGlzTGFiZWxzSW5NaWRkbGUgPyBxdWFkcmFudEhhbGZXaWR0aCAvIDIgOiAwKSxcbiAgICAgICAgeTogeEF4aXNQb3NpdGlvbiA9PT0gXCJ0b3BcIiA/IHRoaXMuY29uZmlnLnhBeGlzTGFiZWxQYWRkaW5nICsgdGl0bGVTcGFjZS50b3AgOiB0aGlzLmNvbmZpZy54QXhpc0xhYmVsUGFkZGluZyArIHF1YWRyYW50VG9wICsgcXVhZHJhbnRIZWlnaHQgKyB0aGlzLmNvbmZpZy5xdWFkcmFudFBhZGRpbmcsXG4gICAgICAgIGZvbnRTaXplOiB0aGlzLmNvbmZpZy54QXhpc0xhYmVsRm9udFNpemUsXG4gICAgICAgIHZlcnRpY2FsUG9zOiBkcmF3WEF4aXNMYWJlbHNJbk1pZGRsZSA/IFwiY2VudGVyXCIgOiBcImxlZnRcIixcbiAgICAgICAgaG9yaXpvbnRhbFBvczogXCJ0b3BcIixcbiAgICAgICAgcm90YXRpb246IDBcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5kYXRhLnhBeGlzUmlnaHRUZXh0ICYmIHNob3dYQXhpcykge1xuICAgICAgYXhpc0xhYmVscy5wdXNoKHtcbiAgICAgICAgdGV4dDogdGhpcy5kYXRhLnhBeGlzUmlnaHRUZXh0LFxuICAgICAgICBmaWxsOiB0aGlzLnRoZW1lQ29uZmlnLnF1YWRyYW50WEF4aXNUZXh0RmlsbCxcbiAgICAgICAgeDogcXVhZHJhbnRMZWZ0ICsgcXVhZHJhbnRIYWxmV2lkdGggKyAoZHJhd1hBeGlzTGFiZWxzSW5NaWRkbGUgPyBxdWFkcmFudEhhbGZXaWR0aCAvIDIgOiAwKSxcbiAgICAgICAgeTogeEF4aXNQb3NpdGlvbiA9PT0gXCJ0b3BcIiA/IHRoaXMuY29uZmlnLnhBeGlzTGFiZWxQYWRkaW5nICsgdGl0bGVTcGFjZS50b3AgOiB0aGlzLmNvbmZpZy54QXhpc0xhYmVsUGFkZGluZyArIHF1YWRyYW50VG9wICsgcXVhZHJhbnRIZWlnaHQgKyB0aGlzLmNvbmZpZy5xdWFkcmFudFBhZGRpbmcsXG4gICAgICAgIGZvbnRTaXplOiB0aGlzLmNvbmZpZy54QXhpc0xhYmVsRm9udFNpemUsXG4gICAgICAgIHZlcnRpY2FsUG9zOiBkcmF3WEF4aXNMYWJlbHNJbk1pZGRsZSA/IFwiY2VudGVyXCIgOiBcImxlZnRcIixcbiAgICAgICAgaG9yaXpvbnRhbFBvczogXCJ0b3BcIixcbiAgICAgICAgcm90YXRpb246IDBcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5kYXRhLnlBeGlzQm90dG9tVGV4dCAmJiBzaG93WUF4aXMpIHtcbiAgICAgIGF4aXNMYWJlbHMucHVzaCh7XG4gICAgICAgIHRleHQ6IHRoaXMuZGF0YS55QXhpc0JvdHRvbVRleHQsXG4gICAgICAgIGZpbGw6IHRoaXMudGhlbWVDb25maWcucXVhZHJhbnRZQXhpc1RleHRGaWxsLFxuICAgICAgICB4OiB0aGlzLmNvbmZpZy55QXhpc1Bvc2l0aW9uID09PSBcImxlZnRcIiA/IHRoaXMuY29uZmlnLnlBeGlzTGFiZWxQYWRkaW5nIDogdGhpcy5jb25maWcueUF4aXNMYWJlbFBhZGRpbmcgKyBxdWFkcmFudExlZnQgKyBxdWFkcmFudFdpZHRoICsgdGhpcy5jb25maWcucXVhZHJhbnRQYWRkaW5nLFxuICAgICAgICB5OiBxdWFkcmFudFRvcCArIHF1YWRyYW50SGVpZ2h0IC0gKGRyYXdZQXhpc0xhYmVsc0luTWlkZGxlID8gcXVhZHJhbnRIYWxmSGVpZ2h0IC8gMiA6IDApLFxuICAgICAgICBmb250U2l6ZTogdGhpcy5jb25maWcueUF4aXNMYWJlbEZvbnRTaXplLFxuICAgICAgICB2ZXJ0aWNhbFBvczogZHJhd1lBeGlzTGFiZWxzSW5NaWRkbGUgPyBcImNlbnRlclwiIDogXCJsZWZ0XCIsXG4gICAgICAgIGhvcml6b250YWxQb3M6IFwidG9wXCIsXG4gICAgICAgIHJvdGF0aW9uOiAtOTBcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5kYXRhLnlBeGlzVG9wVGV4dCAmJiBzaG93WUF4aXMpIHtcbiAgICAgIGF4aXNMYWJlbHMucHVzaCh7XG4gICAgICAgIHRleHQ6IHRoaXMuZGF0YS55QXhpc1RvcFRleHQsXG4gICAgICAgIGZpbGw6IHRoaXMudGhlbWVDb25maWcucXVhZHJhbnRZQXhpc1RleHRGaWxsLFxuICAgICAgICB4OiB0aGlzLmNvbmZpZy55QXhpc1Bvc2l0aW9uID09PSBcImxlZnRcIiA/IHRoaXMuY29uZmlnLnlBeGlzTGFiZWxQYWRkaW5nIDogdGhpcy5jb25maWcueUF4aXNMYWJlbFBhZGRpbmcgKyBxdWFkcmFudExlZnQgKyBxdWFkcmFudFdpZHRoICsgdGhpcy5jb25maWcucXVhZHJhbnRQYWRkaW5nLFxuICAgICAgICB5OiBxdWFkcmFudFRvcCArIHF1YWRyYW50SGFsZkhlaWdodCAtIChkcmF3WUF4aXNMYWJlbHNJbk1pZGRsZSA/IHF1YWRyYW50SGFsZkhlaWdodCAvIDIgOiAwKSxcbiAgICAgICAgZm9udFNpemU6IHRoaXMuY29uZmlnLnlBeGlzTGFiZWxGb250U2l6ZSxcbiAgICAgICAgdmVydGljYWxQb3M6IGRyYXdZQXhpc0xhYmVsc0luTWlkZGxlID8gXCJjZW50ZXJcIiA6IFwibGVmdFwiLFxuICAgICAgICBob3Jpem9udGFsUG9zOiBcInRvcFwiLFxuICAgICAgICByb3RhdGlvbjogLTkwXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGF4aXNMYWJlbHM7XG4gIH1cbiAgZ2V0UXVhZHJhbnRzKHNwYWNlRGF0YSkge1xuICAgIGNvbnN0IHsgcXVhZHJhbnRTcGFjZSB9ID0gc3BhY2VEYXRhO1xuICAgIGNvbnN0IHsgcXVhZHJhbnRIYWxmSGVpZ2h0LCBxdWFkcmFudExlZnQsIHF1YWRyYW50SGFsZldpZHRoLCBxdWFkcmFudFRvcCB9ID0gcXVhZHJhbnRTcGFjZTtcbiAgICBjb25zdCBxdWFkcmFudHMgPSBbXG4gICAgICB7XG4gICAgICAgIHRleHQ6IHtcbiAgICAgICAgICB0ZXh0OiB0aGlzLmRhdGEucXVhZHJhbnQxVGV4dCxcbiAgICAgICAgICBmaWxsOiB0aGlzLnRoZW1lQ29uZmlnLnF1YWRyYW50MVRleHRGaWxsLFxuICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgeTogMCxcbiAgICAgICAgICBmb250U2l6ZTogdGhpcy5jb25maWcucXVhZHJhbnRMYWJlbEZvbnRTaXplLFxuICAgICAgICAgIHZlcnRpY2FsUG9zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGhvcml6b250YWxQb3M6IFwibWlkZGxlXCIsXG4gICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSxcbiAgICAgICAgeDogcXVhZHJhbnRMZWZ0ICsgcXVhZHJhbnRIYWxmV2lkdGgsXG4gICAgICAgIHk6IHF1YWRyYW50VG9wLFxuICAgICAgICB3aWR0aDogcXVhZHJhbnRIYWxmV2lkdGgsXG4gICAgICAgIGhlaWdodDogcXVhZHJhbnRIYWxmSGVpZ2h0LFxuICAgICAgICBmaWxsOiB0aGlzLnRoZW1lQ29uZmlnLnF1YWRyYW50MUZpbGxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHRleHQ6IHtcbiAgICAgICAgICB0ZXh0OiB0aGlzLmRhdGEucXVhZHJhbnQyVGV4dCxcbiAgICAgICAgICBmaWxsOiB0aGlzLnRoZW1lQ29uZmlnLnF1YWRyYW50MlRleHRGaWxsLFxuICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgeTogMCxcbiAgICAgICAgICBmb250U2l6ZTogdGhpcy5jb25maWcucXVhZHJhbnRMYWJlbEZvbnRTaXplLFxuICAgICAgICAgIHZlcnRpY2FsUG9zOiBcImNlbnRlclwiLFxuICAgICAgICAgIGhvcml6b250YWxQb3M6IFwibWlkZGxlXCIsXG4gICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSxcbiAgICAgICAgeDogcXVhZHJhbnRMZWZ0LFxuICAgICAgICB5OiBxdWFkcmFudFRvcCxcbiAgICAgICAgd2lkdGg6IHF1YWRyYW50SGFsZldpZHRoLFxuICAgICAgICBoZWlnaHQ6IHF1YWRyYW50SGFsZkhlaWdodCxcbiAgICAgICAgZmlsbDogdGhpcy50aGVtZUNvbmZpZy5xdWFkcmFudDJGaWxsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICB0ZXh0OiB7XG4gICAgICAgICAgdGV4dDogdGhpcy5kYXRhLnF1YWRyYW50M1RleHQsXG4gICAgICAgICAgZmlsbDogdGhpcy50aGVtZUNvbmZpZy5xdWFkcmFudDNUZXh0RmlsbCxcbiAgICAgICAgICB4OiAwLFxuICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgZm9udFNpemU6IHRoaXMuY29uZmlnLnF1YWRyYW50TGFiZWxGb250U2l6ZSxcbiAgICAgICAgICB2ZXJ0aWNhbFBvczogXCJjZW50ZXJcIixcbiAgICAgICAgICBob3Jpem9udGFsUG9zOiBcIm1pZGRsZVwiLFxuICAgICAgICAgIHJvdGF0aW9uOiAwXG4gICAgICAgIH0sXG4gICAgICAgIHg6IHF1YWRyYW50TGVmdCxcbiAgICAgICAgeTogcXVhZHJhbnRUb3AgKyBxdWFkcmFudEhhbGZIZWlnaHQsXG4gICAgICAgIHdpZHRoOiBxdWFkcmFudEhhbGZXaWR0aCxcbiAgICAgICAgaGVpZ2h0OiBxdWFkcmFudEhhbGZIZWlnaHQsXG4gICAgICAgIGZpbGw6IHRoaXMudGhlbWVDb25maWcucXVhZHJhbnQzRmlsbFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGV4dDoge1xuICAgICAgICAgIHRleHQ6IHRoaXMuZGF0YS5xdWFkcmFudDRUZXh0LFxuICAgICAgICAgIGZpbGw6IHRoaXMudGhlbWVDb25maWcucXVhZHJhbnQ0VGV4dEZpbGwsXG4gICAgICAgICAgeDogMCxcbiAgICAgICAgICB5OiAwLFxuICAgICAgICAgIGZvbnRTaXplOiB0aGlzLmNvbmZpZy5xdWFkcmFudExhYmVsRm9udFNpemUsXG4gICAgICAgICAgdmVydGljYWxQb3M6IFwiY2VudGVyXCIsXG4gICAgICAgICAgaG9yaXpvbnRhbFBvczogXCJtaWRkbGVcIixcbiAgICAgICAgICByb3RhdGlvbjogMFxuICAgICAgICB9LFxuICAgICAgICB4OiBxdWFkcmFudExlZnQgKyBxdWFkcmFudEhhbGZXaWR0aCxcbiAgICAgICAgeTogcXVhZHJhbnRUb3AgKyBxdWFkcmFudEhhbGZIZWlnaHQsXG4gICAgICAgIHdpZHRoOiBxdWFkcmFudEhhbGZXaWR0aCxcbiAgICAgICAgaGVpZ2h0OiBxdWFkcmFudEhhbGZIZWlnaHQsXG4gICAgICAgIGZpbGw6IHRoaXMudGhlbWVDb25maWcucXVhZHJhbnQ0RmlsbFxuICAgICAgfVxuICAgIF07XG4gICAgZm9yIChjb25zdCBxdWFkcmFudCBvZiBxdWFkcmFudHMpIHtcbiAgICAgIHF1YWRyYW50LnRleHQueCA9IHF1YWRyYW50LnggKyBxdWFkcmFudC53aWR0aCAvIDI7XG4gICAgICBpZiAodGhpcy5kYXRhLnBvaW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcXVhZHJhbnQudGV4dC55ID0gcXVhZHJhbnQueSArIHF1YWRyYW50LmhlaWdodCAvIDI7XG4gICAgICAgIHF1YWRyYW50LnRleHQuaG9yaXpvbnRhbFBvcyA9IFwibWlkZGxlXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWFkcmFudC50ZXh0LnkgPSBxdWFkcmFudC55ICsgdGhpcy5jb25maWcucXVhZHJhbnRUZXh0VG9wUGFkZGluZztcbiAgICAgICAgcXVhZHJhbnQudGV4dC5ob3Jpem9udGFsUG9zID0gXCJ0b3BcIjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHF1YWRyYW50cztcbiAgfVxuICBnZXRRdWFkcmFudFBvaW50cyhzcGFjZURhdGEpIHtcbiAgICBjb25zdCB7IHF1YWRyYW50U3BhY2UgfSA9IHNwYWNlRGF0YTtcbiAgICBjb25zdCB7IHF1YWRyYW50SGVpZ2h0LCBxdWFkcmFudExlZnQsIHF1YWRyYW50VG9wLCBxdWFkcmFudFdpZHRoIH0gPSBxdWFkcmFudFNwYWNlO1xuICAgIGNvbnN0IHhBeGlzID0gc2NhbGVMaW5lYXIoKS5kb21haW4oWzAsIDFdKS5yYW5nZShbcXVhZHJhbnRMZWZ0LCBxdWFkcmFudFdpZHRoICsgcXVhZHJhbnRMZWZ0XSk7XG4gICAgY29uc3QgeUF4aXMgPSBzY2FsZUxpbmVhcigpLmRvbWFpbihbMCwgMV0pLnJhbmdlKFtxdWFkcmFudEhlaWdodCArIHF1YWRyYW50VG9wLCBxdWFkcmFudFRvcF0pO1xuICAgIGNvbnN0IHBvaW50cyA9IHRoaXMuZGF0YS5wb2ludHMubWFwKChwb2ludCkgPT4ge1xuICAgICAgY29uc3QgY2xhc3NTdHlsZXMgPSB0aGlzLmNsYXNzZXMuZ2V0KHBvaW50LmNsYXNzTmFtZSk7XG4gICAgICBpZiAoY2xhc3NTdHlsZXMpIHtcbiAgICAgICAgcG9pbnQgPSB7IC4uLmNsYXNzU3R5bGVzLCAuLi5wb2ludCB9O1xuICAgICAgfVxuICAgICAgY29uc3QgcHJvcHMgPSB7XG4gICAgICAgIHg6IHhBeGlzKHBvaW50LngpLFxuICAgICAgICB5OiB5QXhpcyhwb2ludC55KSxcbiAgICAgICAgZmlsbDogcG9pbnQuY29sb3IgPz8gdGhpcy50aGVtZUNvbmZpZy5xdWFkcmFudFBvaW50RmlsbCxcbiAgICAgICAgcmFkaXVzOiBwb2ludC5yYWRpdXMgPz8gdGhpcy5jb25maWcucG9pbnRSYWRpdXMsXG4gICAgICAgIHRleHQ6IHtcbiAgICAgICAgICB0ZXh0OiBwb2ludC50ZXh0LFxuICAgICAgICAgIGZpbGw6IHRoaXMudGhlbWVDb25maWcucXVhZHJhbnRQb2ludFRleHRGaWxsLFxuICAgICAgICAgIHg6IHhBeGlzKHBvaW50LngpLFxuICAgICAgICAgIHk6IHlBeGlzKHBvaW50LnkpICsgdGhpcy5jb25maWcucG9pbnRUZXh0UGFkZGluZyxcbiAgICAgICAgICB2ZXJ0aWNhbFBvczogXCJjZW50ZXJcIixcbiAgICAgICAgICBob3Jpem9udGFsUG9zOiBcInRvcFwiLFxuICAgICAgICAgIGZvbnRTaXplOiB0aGlzLmNvbmZpZy5wb2ludExhYmVsRm9udFNpemUsXG4gICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgfSxcbiAgICAgICAgc3Ryb2tlQ29sb3I6IHBvaW50LnN0cm9rZUNvbG9yID8/IHRoaXMudGhlbWVDb25maWcucXVhZHJhbnRQb2ludEZpbGwsXG4gICAgICAgIHN0cm9rZVdpZHRoOiBwb2ludC5zdHJva2VXaWR0aCA/PyBcIjBweFwiXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHByb3BzO1xuICAgIH0pO1xuICAgIHJldHVybiBwb2ludHM7XG4gIH1cbiAgZ2V0Qm9yZGVycyhzcGFjZURhdGEpIHtcbiAgICBjb25zdCBoYWxmRXh0ZXJuYWxCb3JkZXJXaWR0aCA9IHRoaXMuY29uZmlnLnF1YWRyYW50RXh0ZXJuYWxCb3JkZXJTdHJva2VXaWR0aCAvIDI7XG4gICAgY29uc3QgeyBxdWFkcmFudFNwYWNlIH0gPSBzcGFjZURhdGE7XG4gICAgY29uc3Qge1xuICAgICAgcXVhZHJhbnRIYWxmSGVpZ2h0LFxuICAgICAgcXVhZHJhbnRIZWlnaHQsXG4gICAgICBxdWFkcmFudExlZnQsXG4gICAgICBxdWFkcmFudEhhbGZXaWR0aCxcbiAgICAgIHF1YWRyYW50VG9wLFxuICAgICAgcXVhZHJhbnRXaWR0aFxuICAgIH0gPSBxdWFkcmFudFNwYWNlO1xuICAgIGNvbnN0IGJvcmRlckxpbmVzID0gW1xuICAgICAgLy8gdG9wIGJvcmRlclxuICAgICAge1xuICAgICAgICBzdHJva2VGaWxsOiB0aGlzLnRoZW1lQ29uZmlnLnF1YWRyYW50RXh0ZXJuYWxCb3JkZXJTdHJva2VGaWxsLFxuICAgICAgICBzdHJva2VXaWR0aDogdGhpcy5jb25maWcucXVhZHJhbnRFeHRlcm5hbEJvcmRlclN0cm9rZVdpZHRoLFxuICAgICAgICB4MTogcXVhZHJhbnRMZWZ0IC0gaGFsZkV4dGVybmFsQm9yZGVyV2lkdGgsXG4gICAgICAgIHkxOiBxdWFkcmFudFRvcCxcbiAgICAgICAgeDI6IHF1YWRyYW50TGVmdCArIHF1YWRyYW50V2lkdGggKyBoYWxmRXh0ZXJuYWxCb3JkZXJXaWR0aCxcbiAgICAgICAgeTI6IHF1YWRyYW50VG9wXG4gICAgICB9LFxuICAgICAgLy8gcmlnaHQgYm9yZGVyXG4gICAgICB7XG4gICAgICAgIHN0cm9rZUZpbGw6IHRoaXMudGhlbWVDb25maWcucXVhZHJhbnRFeHRlcm5hbEJvcmRlclN0cm9rZUZpbGwsXG4gICAgICAgIHN0cm9rZVdpZHRoOiB0aGlzLmNvbmZpZy5xdWFkcmFudEV4dGVybmFsQm9yZGVyU3Ryb2tlV2lkdGgsXG4gICAgICAgIHgxOiBxdWFkcmFudExlZnQgKyBxdWFkcmFudFdpZHRoLFxuICAgICAgICB5MTogcXVhZHJhbnRUb3AgKyBoYWxmRXh0ZXJuYWxCb3JkZXJXaWR0aCxcbiAgICAgICAgeDI6IHF1YWRyYW50TGVmdCArIHF1YWRyYW50V2lkdGgsXG4gICAgICAgIHkyOiBxdWFkcmFudFRvcCArIHF1YWRyYW50SGVpZ2h0IC0gaGFsZkV4dGVybmFsQm9yZGVyV2lkdGhcbiAgICAgIH0sXG4gICAgICAvLyBib3R0b20gYm9yZGVyXG4gICAgICB7XG4gICAgICAgIHN0cm9rZUZpbGw6IHRoaXMudGhlbWVDb25maWcucXVhZHJhbnRFeHRlcm5hbEJvcmRlclN0cm9rZUZpbGwsXG4gICAgICAgIHN0cm9rZVdpZHRoOiB0aGlzLmNvbmZpZy5xdWFkcmFudEV4dGVybmFsQm9yZGVyU3Ryb2tlV2lkdGgsXG4gICAgICAgIHgxOiBxdWFkcmFudExlZnQgLSBoYWxmRXh0ZXJuYWxCb3JkZXJXaWR0aCxcbiAgICAgICAgeTE6IHF1YWRyYW50VG9wICsgcXVhZHJhbnRIZWlnaHQsXG4gICAgICAgIHgyOiBxdWFkcmFudExlZnQgKyBxdWFkcmFudFdpZHRoICsgaGFsZkV4dGVybmFsQm9yZGVyV2lkdGgsXG4gICAgICAgIHkyOiBxdWFkcmFudFRvcCArIHF1YWRyYW50SGVpZ2h0XG4gICAgICB9LFxuICAgICAgLy8gbGVmdCBib3JkZXJcbiAgICAgIHtcbiAgICAgICAgc3Ryb2tlRmlsbDogdGhpcy50aGVtZUNvbmZpZy5xdWFkcmFudEV4dGVybmFsQm9yZGVyU3Ryb2tlRmlsbCxcbiAgICAgICAgc3Ryb2tlV2lkdGg6IHRoaXMuY29uZmlnLnF1YWRyYW50RXh0ZXJuYWxCb3JkZXJTdHJva2VXaWR0aCxcbiAgICAgICAgeDE6IHF1YWRyYW50TGVmdCxcbiAgICAgICAgeTE6IHF1YWRyYW50VG9wICsgaGFsZkV4dGVybmFsQm9yZGVyV2lkdGgsXG4gICAgICAgIHgyOiBxdWFkcmFudExlZnQsXG4gICAgICAgIHkyOiBxdWFkcmFudFRvcCArIHF1YWRyYW50SGVpZ2h0IC0gaGFsZkV4dGVybmFsQm9yZGVyV2lkdGhcbiAgICAgIH0sXG4gICAgICAvLyB2ZXJ0aWNhbCBpbm5lciBib3JkZXJcbiAgICAgIHtcbiAgICAgICAgc3Ryb2tlRmlsbDogdGhpcy50aGVtZUNvbmZpZy5xdWFkcmFudEludGVybmFsQm9yZGVyU3Ryb2tlRmlsbCxcbiAgICAgICAgc3Ryb2tlV2lkdGg6IHRoaXMuY29uZmlnLnF1YWRyYW50SW50ZXJuYWxCb3JkZXJTdHJva2VXaWR0aCxcbiAgICAgICAgeDE6IHF1YWRyYW50TGVmdCArIHF1YWRyYW50SGFsZldpZHRoLFxuICAgICAgICB5MTogcXVhZHJhbnRUb3AgKyBoYWxmRXh0ZXJuYWxCb3JkZXJXaWR0aCxcbiAgICAgICAgeDI6IHF1YWRyYW50TGVmdCArIHF1YWRyYW50SGFsZldpZHRoLFxuICAgICAgICB5MjogcXVhZHJhbnRUb3AgKyBxdWFkcmFudEhlaWdodCAtIGhhbGZFeHRlcm5hbEJvcmRlcldpZHRoXG4gICAgICB9LFxuICAgICAgLy8gaG9yaXpvbnRhbCBpbm5lciBib3JkZXJcbiAgICAgIHtcbiAgICAgICAgc3Ryb2tlRmlsbDogdGhpcy50aGVtZUNvbmZpZy5xdWFkcmFudEludGVybmFsQm9yZGVyU3Ryb2tlRmlsbCxcbiAgICAgICAgc3Ryb2tlV2lkdGg6IHRoaXMuY29uZmlnLnF1YWRyYW50SW50ZXJuYWxCb3JkZXJTdHJva2VXaWR0aCxcbiAgICAgICAgeDE6IHF1YWRyYW50TGVmdCArIGhhbGZFeHRlcm5hbEJvcmRlcldpZHRoLFxuICAgICAgICB5MTogcXVhZHJhbnRUb3AgKyBxdWFkcmFudEhhbGZIZWlnaHQsXG4gICAgICAgIHgyOiBxdWFkcmFudExlZnQgKyBxdWFkcmFudFdpZHRoIC0gaGFsZkV4dGVybmFsQm9yZGVyV2lkdGgsXG4gICAgICAgIHkyOiBxdWFkcmFudFRvcCArIHF1YWRyYW50SGFsZkhlaWdodFxuICAgICAgfVxuICAgIF07XG4gICAgcmV0dXJuIGJvcmRlckxpbmVzO1xuICB9XG4gIGdldFRpdGxlKHNob3dUaXRsZSkge1xuICAgIGlmIChzaG93VGl0bGUpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRleHQ6IHRoaXMuZGF0YS50aXRsZVRleHQsXG4gICAgICAgIGZpbGw6IHRoaXMudGhlbWVDb25maWcucXVhZHJhbnRUaXRsZUZpbGwsXG4gICAgICAgIGZvbnRTaXplOiB0aGlzLmNvbmZpZy50aXRsZUZvbnRTaXplLFxuICAgICAgICBob3Jpem9udGFsUG9zOiBcInRvcFwiLFxuICAgICAgICB2ZXJ0aWNhbFBvczogXCJjZW50ZXJcIixcbiAgICAgICAgcm90YXRpb246IDAsXG4gICAgICAgIHk6IHRoaXMuY29uZmlnLnRpdGxlUGFkZGluZyxcbiAgICAgICAgeDogdGhpcy5jb25maWcuY2hhcnRXaWR0aCAvIDJcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuICBidWlsZCgpIHtcbiAgICBjb25zdCBzaG93WEF4aXMgPSB0aGlzLmNvbmZpZy5zaG93WEF4aXMgJiYgISEodGhpcy5kYXRhLnhBeGlzTGVmdFRleHQgfHwgdGhpcy5kYXRhLnhBeGlzUmlnaHRUZXh0KTtcbiAgICBjb25zdCBzaG93WUF4aXMgPSB0aGlzLmNvbmZpZy5zaG93WUF4aXMgJiYgISEodGhpcy5kYXRhLnlBeGlzVG9wVGV4dCB8fCB0aGlzLmRhdGEueUF4aXNCb3R0b21UZXh0KTtcbiAgICBjb25zdCBzaG93VGl0bGUgPSB0aGlzLmNvbmZpZy5zaG93VGl0bGUgJiYgISF0aGlzLmRhdGEudGl0bGVUZXh0O1xuICAgIGNvbnN0IHhBeGlzUG9zaXRpb24gPSB0aGlzLmRhdGEucG9pbnRzLmxlbmd0aCA+IDAgPyBcImJvdHRvbVwiIDogdGhpcy5jb25maWcueEF4aXNQb3NpdGlvbjtcbiAgICBjb25zdCBjYWxjdWxhdGVkU3BhY2UgPSB0aGlzLmNhbGN1bGF0ZVNwYWNlKHhBeGlzUG9zaXRpb24sIHNob3dYQXhpcywgc2hvd1lBeGlzLCBzaG93VGl0bGUpO1xuICAgIHJldHVybiB7XG4gICAgICBwb2ludHM6IHRoaXMuZ2V0UXVhZHJhbnRQb2ludHMoY2FsY3VsYXRlZFNwYWNlKSxcbiAgICAgIHF1YWRyYW50czogdGhpcy5nZXRRdWFkcmFudHMoY2FsY3VsYXRlZFNwYWNlKSxcbiAgICAgIGF4aXNMYWJlbHM6IHRoaXMuZ2V0QXhpc0xhYmVscyh4QXhpc1Bvc2l0aW9uLCBzaG93WEF4aXMsIHNob3dZQXhpcywgY2FsY3VsYXRlZFNwYWNlKSxcbiAgICAgIGJvcmRlckxpbmVzOiB0aGlzLmdldEJvcmRlcnMoY2FsY3VsYXRlZFNwYWNlKSxcbiAgICAgIHRpdGxlOiB0aGlzLmdldFRpdGxlKHNob3dUaXRsZSlcbiAgICB9O1xuICB9XG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMvcXVhZHJhbnQtY2hhcnQvdXRpbHMudHNcbnZhciBJbnZhbGlkU3R5bGVFcnJvciA9IGNsYXNzIGV4dGVuZHMgRXJyb3Ige1xuICBzdGF0aWMge1xuICAgIF9fbmFtZSh0aGlzLCBcIkludmFsaWRTdHlsZUVycm9yXCIpO1xuICB9XG4gIGNvbnN0cnVjdG9yKHN0eWxlLCB2YWx1ZSwgdHlwZSkge1xuICAgIHN1cGVyKGB2YWx1ZSBmb3IgJHtzdHlsZX0gJHt2YWx1ZX0gaXMgaW52YWxpZCwgcGxlYXNlIHVzZSBhIHZhbGlkICR7dHlwZX1gKTtcbiAgICB0aGlzLm5hbWUgPSBcIkludmFsaWRTdHlsZUVycm9yXCI7XG4gIH1cbn07XG5mdW5jdGlvbiB2YWxpZGF0ZUhleENvZGUodmFsdWUpIHtcbiAgcmV0dXJuICEvXiM/KFtcXGRBLUZhLWZdezZ9fFtcXGRBLUZhLWZdezN9KSQvLnRlc3QodmFsdWUpO1xufVxuX19uYW1lKHZhbGlkYXRlSGV4Q29kZSwgXCJ2YWxpZGF0ZUhleENvZGVcIik7XG5mdW5jdGlvbiB2YWxpZGF0ZU51bWJlcih2YWx1ZSkge1xuICByZXR1cm4gIS9eXFxkKyQvLnRlc3QodmFsdWUpO1xufVxuX19uYW1lKHZhbGlkYXRlTnVtYmVyLCBcInZhbGlkYXRlTnVtYmVyXCIpO1xuZnVuY3Rpb24gdmFsaWRhdGVTaXplSW5QaXhlbHModmFsdWUpIHtcbiAgcmV0dXJuICEvXlxcZCtweCQvLnRlc3QodmFsdWUpO1xufVxuX19uYW1lKHZhbGlkYXRlU2l6ZUluUGl4ZWxzLCBcInZhbGlkYXRlU2l6ZUluUGl4ZWxzXCIpO1xuXG4vLyBzcmMvZGlhZ3JhbXMvcXVhZHJhbnQtY2hhcnQvcXVhZHJhbnREYi50c1xudmFyIGNvbmZpZyA9IGdldENvbmZpZygpO1xuZnVuY3Rpb24gdGV4dFNhbml0aXplcih0ZXh0KSB7XG4gIHJldHVybiBzYW5pdGl6ZVRleHQodGV4dC50cmltKCksIGNvbmZpZyk7XG59XG5fX25hbWUodGV4dFNhbml0aXplciwgXCJ0ZXh0U2FuaXRpemVyXCIpO1xudmFyIHF1YWRyYW50QnVpbGRlciA9IG5ldyBRdWFkcmFudEJ1aWxkZXIoKTtcbmZ1bmN0aW9uIHNldFF1YWRyYW50MVRleHQodGV4dE9iaikge1xuICBxdWFkcmFudEJ1aWxkZXIuc2V0RGF0YSh7IHF1YWRyYW50MVRleHQ6IHRleHRTYW5pdGl6ZXIodGV4dE9iai50ZXh0KSB9KTtcbn1cbl9fbmFtZShzZXRRdWFkcmFudDFUZXh0LCBcInNldFF1YWRyYW50MVRleHRcIik7XG5mdW5jdGlvbiBzZXRRdWFkcmFudDJUZXh0KHRleHRPYmopIHtcbiAgcXVhZHJhbnRCdWlsZGVyLnNldERhdGEoeyBxdWFkcmFudDJUZXh0OiB0ZXh0U2FuaXRpemVyKHRleHRPYmoudGV4dCkgfSk7XG59XG5fX25hbWUoc2V0UXVhZHJhbnQyVGV4dCwgXCJzZXRRdWFkcmFudDJUZXh0XCIpO1xuZnVuY3Rpb24gc2V0UXVhZHJhbnQzVGV4dCh0ZXh0T2JqKSB7XG4gIHF1YWRyYW50QnVpbGRlci5zZXREYXRhKHsgcXVhZHJhbnQzVGV4dDogdGV4dFNhbml0aXplcih0ZXh0T2JqLnRleHQpIH0pO1xufVxuX19uYW1lKHNldFF1YWRyYW50M1RleHQsIFwic2V0UXVhZHJhbnQzVGV4dFwiKTtcbmZ1bmN0aW9uIHNldFF1YWRyYW50NFRleHQodGV4dE9iaikge1xuICBxdWFkcmFudEJ1aWxkZXIuc2V0RGF0YSh7IHF1YWRyYW50NFRleHQ6IHRleHRTYW5pdGl6ZXIodGV4dE9iai50ZXh0KSB9KTtcbn1cbl9fbmFtZShzZXRRdWFkcmFudDRUZXh0LCBcInNldFF1YWRyYW50NFRleHRcIik7XG5mdW5jdGlvbiBzZXRYQXhpc0xlZnRUZXh0KHRleHRPYmopIHtcbiAgcXVhZHJhbnRCdWlsZGVyLnNldERhdGEoeyB4QXhpc0xlZnRUZXh0OiB0ZXh0U2FuaXRpemVyKHRleHRPYmoudGV4dCkgfSk7XG59XG5fX25hbWUoc2V0WEF4aXNMZWZ0VGV4dCwgXCJzZXRYQXhpc0xlZnRUZXh0XCIpO1xuZnVuY3Rpb24gc2V0WEF4aXNSaWdodFRleHQodGV4dE9iaikge1xuICBxdWFkcmFudEJ1aWxkZXIuc2V0RGF0YSh7IHhBeGlzUmlnaHRUZXh0OiB0ZXh0U2FuaXRpemVyKHRleHRPYmoudGV4dCkgfSk7XG59XG5fX25hbWUoc2V0WEF4aXNSaWdodFRleHQsIFwic2V0WEF4aXNSaWdodFRleHRcIik7XG5mdW5jdGlvbiBzZXRZQXhpc1RvcFRleHQodGV4dE9iaikge1xuICBxdWFkcmFudEJ1aWxkZXIuc2V0RGF0YSh7IHlBeGlzVG9wVGV4dDogdGV4dFNhbml0aXplcih0ZXh0T2JqLnRleHQpIH0pO1xufVxuX19uYW1lKHNldFlBeGlzVG9wVGV4dCwgXCJzZXRZQXhpc1RvcFRleHRcIik7XG5mdW5jdGlvbiBzZXRZQXhpc0JvdHRvbVRleHQodGV4dE9iaikge1xuICBxdWFkcmFudEJ1aWxkZXIuc2V0RGF0YSh7IHlBeGlzQm90dG9tVGV4dDogdGV4dFNhbml0aXplcih0ZXh0T2JqLnRleHQpIH0pO1xufVxuX19uYW1lKHNldFlBeGlzQm90dG9tVGV4dCwgXCJzZXRZQXhpc0JvdHRvbVRleHRcIik7XG5mdW5jdGlvbiBwYXJzZVN0eWxlcyhzdHlsZXMpIHtcbiAgY29uc3Qgc3R5bGVzT2JqZWN0ID0ge307XG4gIGZvciAoY29uc3Qgc3R5bGUgb2Ygc3R5bGVzKSB7XG4gICAgY29uc3QgW2tleSwgdmFsdWVdID0gc3R5bGUudHJpbSgpLnNwbGl0KC9cXHMqOlxccyovKTtcbiAgICBpZiAoa2V5ID09PSBcInJhZGl1c1wiKSB7XG4gICAgICBpZiAodmFsaWRhdGVOdW1iZXIodmFsdWUpKSB7XG4gICAgICAgIHRocm93IG5ldyBJbnZhbGlkU3R5bGVFcnJvcihrZXksIHZhbHVlLCBcIm51bWJlclwiKTtcbiAgICAgIH1cbiAgICAgIHN0eWxlc09iamVjdC5yYWRpdXMgPSBwYXJzZUludCh2YWx1ZSk7XG4gICAgfSBlbHNlIGlmIChrZXkgPT09IFwiY29sb3JcIikge1xuICAgICAgaWYgKHZhbGlkYXRlSGV4Q29kZSh2YWx1ZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEludmFsaWRTdHlsZUVycm9yKGtleSwgdmFsdWUsIFwiaGV4IGNvZGVcIik7XG4gICAgICB9XG4gICAgICBzdHlsZXNPYmplY3QuY29sb3IgPSB2YWx1ZTtcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJzdHJva2UtY29sb3JcIikge1xuICAgICAgaWYgKHZhbGlkYXRlSGV4Q29kZSh2YWx1ZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEludmFsaWRTdHlsZUVycm9yKGtleSwgdmFsdWUsIFwiaGV4IGNvZGVcIik7XG4gICAgICB9XG4gICAgICBzdHlsZXNPYmplY3Quc3Ryb2tlQ29sb3IgPSB2YWx1ZTtcbiAgICB9IGVsc2UgaWYgKGtleSA9PT0gXCJzdHJva2Utd2lkdGhcIikge1xuICAgICAgaWYgKHZhbGlkYXRlU2l6ZUluUGl4ZWxzKHZhbHVlKSkge1xuICAgICAgICB0aHJvdyBuZXcgSW52YWxpZFN0eWxlRXJyb3Ioa2V5LCB2YWx1ZSwgXCJudW1iZXIgb2YgcGl4ZWxzIChlZy4gMTBweClcIik7XG4gICAgICB9XG4gICAgICBzdHlsZXNPYmplY3Quc3Ryb2tlV2lkdGggPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBzdHlsZSBuYW1lZCAke2tleX0gaXMgbm90IHN1cHBvcnRlZC5gKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0eWxlc09iamVjdDtcbn1cbl9fbmFtZShwYXJzZVN0eWxlcywgXCJwYXJzZVN0eWxlc1wiKTtcbmZ1bmN0aW9uIGFkZFBvaW50KHRleHRPYmosIGNsYXNzTmFtZSwgeCwgeSwgc3R5bGVzKSB7XG4gIGNvbnN0IHN0eWxlc09iamVjdCA9IHBhcnNlU3R5bGVzKHN0eWxlcyk7XG4gIHF1YWRyYW50QnVpbGRlci5hZGRQb2ludHMoW1xuICAgIHtcbiAgICAgIHgsXG4gICAgICB5LFxuICAgICAgdGV4dDogdGV4dFNhbml0aXplcih0ZXh0T2JqLnRleHQpLFxuICAgICAgY2xhc3NOYW1lLFxuICAgICAgLi4uc3R5bGVzT2JqZWN0XG4gICAgfVxuICBdKTtcbn1cbl9fbmFtZShhZGRQb2ludCwgXCJhZGRQb2ludFwiKTtcbmZ1bmN0aW9uIGFkZENsYXNzKGNsYXNzTmFtZSwgc3R5bGVzKSB7XG4gIHF1YWRyYW50QnVpbGRlci5hZGRDbGFzcyhjbGFzc05hbWUsIHBhcnNlU3R5bGVzKHN0eWxlcykpO1xufVxuX19uYW1lKGFkZENsYXNzLCBcImFkZENsYXNzXCIpO1xuZnVuY3Rpb24gc2V0V2lkdGgod2lkdGgpIHtcbiAgcXVhZHJhbnRCdWlsZGVyLnNldENvbmZpZyh7IGNoYXJ0V2lkdGg6IHdpZHRoIH0pO1xufVxuX19uYW1lKHNldFdpZHRoLCBcInNldFdpZHRoXCIpO1xuZnVuY3Rpb24gc2V0SGVpZ2h0KGhlaWdodCkge1xuICBxdWFkcmFudEJ1aWxkZXIuc2V0Q29uZmlnKHsgY2hhcnRIZWlnaHQ6IGhlaWdodCB9KTtcbn1cbl9fbmFtZShzZXRIZWlnaHQsIFwic2V0SGVpZ2h0XCIpO1xuZnVuY3Rpb24gZ2V0UXVhZHJhbnREYXRhKCkge1xuICBjb25zdCBjb25maWcyID0gZ2V0Q29uZmlnKCk7XG4gIGNvbnN0IHsgdGhlbWVWYXJpYWJsZXMsIHF1YWRyYW50Q2hhcnQ6IHF1YWRyYW50Q2hhcnRDb25maWcgfSA9IGNvbmZpZzI7XG4gIGlmIChxdWFkcmFudENoYXJ0Q29uZmlnKSB7XG4gICAgcXVhZHJhbnRCdWlsZGVyLnNldENvbmZpZyhxdWFkcmFudENoYXJ0Q29uZmlnKTtcbiAgfVxuICBxdWFkcmFudEJ1aWxkZXIuc2V0VGhlbWVDb25maWcoe1xuICAgIHF1YWRyYW50MUZpbGw6IHRoZW1lVmFyaWFibGVzLnF1YWRyYW50MUZpbGwsXG4gICAgcXVhZHJhbnQyRmlsbDogdGhlbWVWYXJpYWJsZXMucXVhZHJhbnQyRmlsbCxcbiAgICBxdWFkcmFudDNGaWxsOiB0aGVtZVZhcmlhYmxlcy5xdWFkcmFudDNGaWxsLFxuICAgIHF1YWRyYW50NEZpbGw6IHRoZW1lVmFyaWFibGVzLnF1YWRyYW50NEZpbGwsXG4gICAgcXVhZHJhbnQxVGV4dEZpbGw6IHRoZW1lVmFyaWFibGVzLnF1YWRyYW50MVRleHRGaWxsLFxuICAgIHF1YWRyYW50MlRleHRGaWxsOiB0aGVtZVZhcmlhYmxlcy5xdWFkcmFudDJUZXh0RmlsbCxcbiAgICBxdWFkcmFudDNUZXh0RmlsbDogdGhlbWVWYXJpYWJsZXMucXVhZHJhbnQzVGV4dEZpbGwsXG4gICAgcXVhZHJhbnQ0VGV4dEZpbGw6IHRoZW1lVmFyaWFibGVzLnF1YWRyYW50NFRleHRGaWxsLFxuICAgIHF1YWRyYW50UG9pbnRGaWxsOiB0aGVtZVZhcmlhYmxlcy5xdWFkcmFudFBvaW50RmlsbCxcbiAgICBxdWFkcmFudFBvaW50VGV4dEZpbGw6IHRoZW1lVmFyaWFibGVzLnF1YWRyYW50UG9pbnRUZXh0RmlsbCxcbiAgICBxdWFkcmFudFhBeGlzVGV4dEZpbGw6IHRoZW1lVmFyaWFibGVzLnF1YWRyYW50WEF4aXNUZXh0RmlsbCxcbiAgICBxdWFkcmFudFlBeGlzVGV4dEZpbGw6IHRoZW1lVmFyaWFibGVzLnF1YWRyYW50WUF4aXNUZXh0RmlsbCxcbiAgICBxdWFkcmFudEV4dGVybmFsQm9yZGVyU3Ryb2tlRmlsbDogdGhlbWVWYXJpYWJsZXMucXVhZHJhbnRFeHRlcm5hbEJvcmRlclN0cm9rZUZpbGwsXG4gICAgcXVhZHJhbnRJbnRlcm5hbEJvcmRlclN0cm9rZUZpbGw6IHRoZW1lVmFyaWFibGVzLnF1YWRyYW50SW50ZXJuYWxCb3JkZXJTdHJva2VGaWxsLFxuICAgIHF1YWRyYW50VGl0bGVGaWxsOiB0aGVtZVZhcmlhYmxlcy5xdWFkcmFudFRpdGxlRmlsbFxuICB9KTtcbiAgcXVhZHJhbnRCdWlsZGVyLnNldERhdGEoeyB0aXRsZVRleHQ6IGdldERpYWdyYW1UaXRsZSgpIH0pO1xuICByZXR1cm4gcXVhZHJhbnRCdWlsZGVyLmJ1aWxkKCk7XG59XG5fX25hbWUoZ2V0UXVhZHJhbnREYXRhLCBcImdldFF1YWRyYW50RGF0YVwiKTtcbnZhciBjbGVhcjIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICBxdWFkcmFudEJ1aWxkZXIuY2xlYXIoKTtcbiAgY2xlYXIoKTtcbn0sIFwiY2xlYXJcIik7XG52YXIgcXVhZHJhbnREYl9kZWZhdWx0ID0ge1xuICBzZXRXaWR0aCxcbiAgc2V0SGVpZ2h0LFxuICBzZXRRdWFkcmFudDFUZXh0LFxuICBzZXRRdWFkcmFudDJUZXh0LFxuICBzZXRRdWFkcmFudDNUZXh0LFxuICBzZXRRdWFkcmFudDRUZXh0LFxuICBzZXRYQXhpc0xlZnRUZXh0LFxuICBzZXRYQXhpc1JpZ2h0VGV4dCxcbiAgc2V0WUF4aXNUb3BUZXh0LFxuICBzZXRZQXhpc0JvdHRvbVRleHQsXG4gIHBhcnNlU3R5bGVzLFxuICBhZGRQb2ludCxcbiAgYWRkQ2xhc3MsXG4gIGdldFF1YWRyYW50RGF0YSxcbiAgY2xlYXI6IGNsZWFyMixcbiAgc2V0QWNjVGl0bGUsXG4gIGdldEFjY1RpdGxlLFxuICBzZXREaWFncmFtVGl0bGUsXG4gIGdldERpYWdyYW1UaXRsZSxcbiAgZ2V0QWNjRGVzY3JpcHRpb24sXG4gIHNldEFjY0Rlc2NyaXB0aW9uXG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMvcXVhZHJhbnQtY2hhcnQvcXVhZHJhbnRSZW5kZXJlci50c1xuaW1wb3J0IHsgc2VsZWN0IH0gZnJvbSBcImQzXCI7XG52YXIgZHJhdyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHR4dCwgaWQsIF92ZXJzaW9uLCBkaWFnT2JqKSA9PiB7XG4gIGZ1bmN0aW9uIGdldERvbWluYW50QmFzZUxpbmUoaG9yaXpvbnRhbFBvcykge1xuICAgIHJldHVybiBob3Jpem9udGFsUG9zID09PSBcInRvcFwiID8gXCJoYW5naW5nXCIgOiBcIm1pZGRsZVwiO1xuICB9XG4gIF9fbmFtZShnZXREb21pbmFudEJhc2VMaW5lLCBcImdldERvbWluYW50QmFzZUxpbmVcIik7XG4gIGZ1bmN0aW9uIGdldFRleHRBbmNob3IodmVydGljYWxQb3MpIHtcbiAgICByZXR1cm4gdmVydGljYWxQb3MgPT09IFwibGVmdFwiID8gXCJzdGFydFwiIDogXCJtaWRkbGVcIjtcbiAgfVxuICBfX25hbWUoZ2V0VGV4dEFuY2hvciwgXCJnZXRUZXh0QW5jaG9yXCIpO1xuICBmdW5jdGlvbiBnZXRUcmFuc2Zvcm1hdGlvbihkYXRhKSB7XG4gICAgcmV0dXJuIGB0cmFuc2xhdGUoJHtkYXRhLnh9LCAke2RhdGEueX0pIHJvdGF0ZSgke2RhdGEucm90YXRpb24gfHwgMH0pYDtcbiAgfVxuICBfX25hbWUoZ2V0VHJhbnNmb3JtYXRpb24sIFwiZ2V0VHJhbnNmb3JtYXRpb25cIik7XG4gIGNvbnN0IGNvbmYgPSBnZXRDb25maWcoKTtcbiAgbG9nLmRlYnVnKFwiUmVuZGVyaW5nIHF1YWRyYW50IGNoYXJ0XFxuXCIgKyB0eHQpO1xuICBjb25zdCBzZWN1cml0eUxldmVsID0gY29uZi5zZWN1cml0eUxldmVsO1xuICBsZXQgc2FuZGJveEVsZW1lbnQ7XG4gIGlmIChzZWN1cml0eUxldmVsID09PSBcInNhbmRib3hcIikge1xuICAgIHNhbmRib3hFbGVtZW50ID0gc2VsZWN0KFwiI2lcIiArIGlkKTtcbiAgfVxuICBjb25zdCByb290ID0gc2VjdXJpdHlMZXZlbCA9PT0gXCJzYW5kYm94XCIgPyBzZWxlY3Qoc2FuZGJveEVsZW1lbnQubm9kZXMoKVswXS5jb250ZW50RG9jdW1lbnQuYm9keSkgOiBzZWxlY3QoXCJib2R5XCIpO1xuICBjb25zdCBzdmcgPSByb290LnNlbGVjdChgW2lkPVwiJHtpZH1cIl1gKTtcbiAgY29uc3QgZ3JvdXAgPSBzdmcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYWluXCIpO1xuICBjb25zdCB3aWR0aCA9IGNvbmYucXVhZHJhbnRDaGFydD8uY2hhcnRXaWR0aCA/PyA1MDA7XG4gIGNvbnN0IGhlaWdodCA9IGNvbmYucXVhZHJhbnRDaGFydD8uY2hhcnRIZWlnaHQgPz8gNTAwO1xuICBjb25maWd1cmVTdmdTaXplKHN2ZywgaGVpZ2h0LCB3aWR0aCwgY29uZi5xdWFkcmFudENoYXJ0Py51c2VNYXhXaWR0aCA/PyB0cnVlKTtcbiAgc3ZnLmF0dHIoXCJ2aWV3Qm94XCIsIFwiMCAwIFwiICsgd2lkdGggKyBcIiBcIiArIGhlaWdodCk7XG4gIGRpYWdPYmouZGIuc2V0SGVpZ2h0KGhlaWdodCk7XG4gIGRpYWdPYmouZGIuc2V0V2lkdGgod2lkdGgpO1xuICBjb25zdCBxdWFkcmFudERhdGEgPSBkaWFnT2JqLmRiLmdldFF1YWRyYW50RGF0YSgpO1xuICBjb25zdCBxdWFkcmFudHNHcm91cCA9IGdyb3VwLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwicXVhZHJhbnRzXCIpO1xuICBjb25zdCBib3JkZXJHcm91cCA9IGdyb3VwLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwiYm9yZGVyXCIpO1xuICBjb25zdCBkYXRhUG9pbnRHcm91cCA9IGdyb3VwLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwiZGF0YS1wb2ludHNcIik7XG4gIGNvbnN0IGxhYmVsR3JvdXAgPSBncm91cC5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImxhYmVsc1wiKTtcbiAgY29uc3QgdGl0bGVHcm91cCA9IGdyb3VwLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwidGl0bGVcIik7XG4gIGlmIChxdWFkcmFudERhdGEudGl0bGUpIHtcbiAgICB0aXRsZUdyb3VwLmFwcGVuZChcInRleHRcIikuYXR0cihcInhcIiwgMCkuYXR0cihcInlcIiwgMCkuYXR0cihcImZpbGxcIiwgcXVhZHJhbnREYXRhLnRpdGxlLmZpbGwpLmF0dHIoXCJmb250LXNpemVcIiwgcXVhZHJhbnREYXRhLnRpdGxlLmZvbnRTaXplKS5hdHRyKFwiZG9taW5hbnQtYmFzZWxpbmVcIiwgZ2V0RG9taW5hbnRCYXNlTGluZShxdWFkcmFudERhdGEudGl0bGUuaG9yaXpvbnRhbFBvcykpLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBnZXRUZXh0QW5jaG9yKHF1YWRyYW50RGF0YS50aXRsZS52ZXJ0aWNhbFBvcykpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZ2V0VHJhbnNmb3JtYXRpb24ocXVhZHJhbnREYXRhLnRpdGxlKSkudGV4dChxdWFkcmFudERhdGEudGl0bGUudGV4dCk7XG4gIH1cbiAgaWYgKHF1YWRyYW50RGF0YS5ib3JkZXJMaW5lcykge1xuICAgIGJvcmRlckdyb3VwLnNlbGVjdEFsbChcImxpbmVcIikuZGF0YShxdWFkcmFudERhdGEuYm9yZGVyTGluZXMpLmVudGVyKCkuYXBwZW5kKFwibGluZVwiKS5hdHRyKFwieDFcIiwgKGRhdGEpID0+IGRhdGEueDEpLmF0dHIoXCJ5MVwiLCAoZGF0YSkgPT4gZGF0YS55MSkuYXR0cihcIngyXCIsIChkYXRhKSA9PiBkYXRhLngyKS5hdHRyKFwieTJcIiwgKGRhdGEpID0+IGRhdGEueTIpLnN0eWxlKFwic3Ryb2tlXCIsIChkYXRhKSA9PiBkYXRhLnN0cm9rZUZpbGwpLnN0eWxlKFwic3Ryb2tlLXdpZHRoXCIsIChkYXRhKSA9PiBkYXRhLnN0cm9rZVdpZHRoKTtcbiAgfVxuICBjb25zdCBxdWFkcmFudHMgPSBxdWFkcmFudHNHcm91cC5zZWxlY3RBbGwoXCJnLnF1YWRyYW50XCIpLmRhdGEocXVhZHJhbnREYXRhLnF1YWRyYW50cykuZW50ZXIoKS5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcInF1YWRyYW50XCIpO1xuICBxdWFkcmFudHMuYXBwZW5kKFwicmVjdFwiKS5hdHRyKFwieFwiLCAoZGF0YSkgPT4gZGF0YS54KS5hdHRyKFwieVwiLCAoZGF0YSkgPT4gZGF0YS55KS5hdHRyKFwid2lkdGhcIiwgKGRhdGEpID0+IGRhdGEud2lkdGgpLmF0dHIoXCJoZWlnaHRcIiwgKGRhdGEpID0+IGRhdGEuaGVpZ2h0KS5hdHRyKFwiZmlsbFwiLCAoZGF0YSkgPT4gZGF0YS5maWxsKTtcbiAgcXVhZHJhbnRzLmFwcGVuZChcInRleHRcIikuYXR0cihcInhcIiwgMCkuYXR0cihcInlcIiwgMCkuYXR0cihcImZpbGxcIiwgKGRhdGEpID0+IGRhdGEudGV4dC5maWxsKS5hdHRyKFwiZm9udC1zaXplXCIsIChkYXRhKSA9PiBkYXRhLnRleHQuZm9udFNpemUpLmF0dHIoXG4gICAgXCJkb21pbmFudC1iYXNlbGluZVwiLFxuICAgIChkYXRhKSA9PiBnZXREb21pbmFudEJhc2VMaW5lKGRhdGEudGV4dC5ob3Jpem9udGFsUG9zKVxuICApLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCAoZGF0YSkgPT4gZ2V0VGV4dEFuY2hvcihkYXRhLnRleHQudmVydGljYWxQb3MpKS5hdHRyKFwidHJhbnNmb3JtXCIsIChkYXRhKSA9PiBnZXRUcmFuc2Zvcm1hdGlvbihkYXRhLnRleHQpKS50ZXh0KChkYXRhKSA9PiBkYXRhLnRleHQudGV4dCk7XG4gIGNvbnN0IGxhYmVscyA9IGxhYmVsR3JvdXAuc2VsZWN0QWxsKFwiZy5sYWJlbFwiKS5kYXRhKHF1YWRyYW50RGF0YS5heGlzTGFiZWxzKS5lbnRlcigpLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwibGFiZWxcIik7XG4gIGxhYmVscy5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJ4XCIsIDApLmF0dHIoXCJ5XCIsIDApLnRleHQoKGRhdGEpID0+IGRhdGEudGV4dCkuYXR0cihcImZpbGxcIiwgKGRhdGEpID0+IGRhdGEuZmlsbCkuYXR0cihcImZvbnQtc2l6ZVwiLCAoZGF0YSkgPT4gZGF0YS5mb250U2l6ZSkuYXR0cihcImRvbWluYW50LWJhc2VsaW5lXCIsIChkYXRhKSA9PiBnZXREb21pbmFudEJhc2VMaW5lKGRhdGEuaG9yaXpvbnRhbFBvcykpLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCAoZGF0YSkgPT4gZ2V0VGV4dEFuY2hvcihkYXRhLnZlcnRpY2FsUG9zKSkuYXR0cihcInRyYW5zZm9ybVwiLCAoZGF0YSkgPT4gZ2V0VHJhbnNmb3JtYXRpb24oZGF0YSkpO1xuICBjb25zdCBkYXRhUG9pbnRzID0gZGF0YVBvaW50R3JvdXAuc2VsZWN0QWxsKFwiZy5kYXRhLXBvaW50XCIpLmRhdGEocXVhZHJhbnREYXRhLnBvaW50cykuZW50ZXIoKS5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImRhdGEtcG9pbnRcIik7XG4gIGRhdGFQb2ludHMuYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJjeFwiLCAoZGF0YSkgPT4gZGF0YS54KS5hdHRyKFwiY3lcIiwgKGRhdGEpID0+IGRhdGEueSkuYXR0cihcInJcIiwgKGRhdGEpID0+IGRhdGEucmFkaXVzKS5hdHRyKFwiZmlsbFwiLCAoZGF0YSkgPT4gZGF0YS5maWxsKS5hdHRyKFwic3Ryb2tlXCIsIChkYXRhKSA9PiBkYXRhLnN0cm9rZUNvbG9yKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIChkYXRhKSA9PiBkYXRhLnN0cm9rZVdpZHRoKTtcbiAgZGF0YVBvaW50cy5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJ4XCIsIDApLmF0dHIoXCJ5XCIsIDApLnRleHQoKGRhdGEpID0+IGRhdGEudGV4dC50ZXh0KS5hdHRyKFwiZmlsbFwiLCAoZGF0YSkgPT4gZGF0YS50ZXh0LmZpbGwpLmF0dHIoXCJmb250LXNpemVcIiwgKGRhdGEpID0+IGRhdGEudGV4dC5mb250U2l6ZSkuYXR0cihcbiAgICBcImRvbWluYW50LWJhc2VsaW5lXCIsXG4gICAgKGRhdGEpID0+IGdldERvbWluYW50QmFzZUxpbmUoZGF0YS50ZXh0Lmhvcml6b250YWxQb3MpXG4gICkuYXR0cihcInRleHQtYW5jaG9yXCIsIChkYXRhKSA9PiBnZXRUZXh0QW5jaG9yKGRhdGEudGV4dC52ZXJ0aWNhbFBvcykpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgKGRhdGEpID0+IGdldFRyYW5zZm9ybWF0aW9uKGRhdGEudGV4dCkpO1xufSwgXCJkcmF3XCIpO1xudmFyIHF1YWRyYW50UmVuZGVyZXJfZGVmYXVsdCA9IHtcbiAgZHJhd1xufTtcblxuLy8gc3JjL2RpYWdyYW1zL3F1YWRyYW50LWNoYXJ0L3F1YWRyYW50RGlhZ3JhbS50c1xudmFyIGRpYWdyYW0gPSB7XG4gIHBhcnNlcjogcXVhZHJhbnRfZGVmYXVsdCxcbiAgZGI6IHF1YWRyYW50RGJfZGVmYXVsdCxcbiAgcmVuZGVyZXI6IHF1YWRyYW50UmVuZGVyZXJfZGVmYXVsdCxcbiAgc3R5bGVzOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKCgpID0+IFwiXCIsIFwic3R5bGVzXCIpXG59O1xuZXhwb3J0IHtcbiAgZGlhZ3JhbVxufTtcbiIKICBdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBLElBQUksU0FBVSxRQUFRLEdBQUc7QUFBQSxFQUN2QixJQUFJLG9CQUFvQixPQUFPLFFBQVEsQ0FBQyxHQUFHLEdBQUcsSUFBSSxHQUFHO0FBQUEsSUFDbkQsS0FBSyxLQUFLLE1BQU0sQ0FBQyxHQUFHLElBQUksRUFBRSxPQUFRLEtBQUssR0FBRyxFQUFFLE1BQU07QUFBQTtBQUFBLElBQ2xELE9BQU87QUFBQSxLQUNOLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FB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R0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUFBLElBQ3h2QiwrQkFBK0IsT0FBTyxTQUFTLFNBQVMsQ0FBQyxRQUFRLFFBQVEsVUFBVSxJQUFJLFNBQVMsSUFBSSxJQUFJO0FBQUEsTUFDdEcsSUFBSSxLQUFLLEdBQUcsU0FBUztBQUFBLE1BQ3JCLFFBQVE7QUFBQSxhQUNEO0FBQUEsVUFDSCxLQUFLLElBQUksR0FBRztBQUFBLFVBQ1o7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksR0FBRyxLQUFLLEtBQUssS0FBSyxHQUFHO0FBQUEsVUFDOUI7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksR0FB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RyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLEtBQUssRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLEtBQUssRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksR0FBRyxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxHQUFHLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksR0FBRyxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxHQUFHLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksS0FBSyxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQUEsSUFDdnRMLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUU7QUFBQSxJQUN6Qyw0QkFBNEIsT0FBTyxTQUFTLFVBQVUsQ0FBQyxLQUFLLE1BQU07QUFBQSxN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
