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
  getEdgeId,
  utils_default
} from "./chunk-main-vvfzntzy.js";
import"./chunk-main-ck580f0k.js";
import {
  channel_default,
  clear,
  getAccDescription,
  getAccTitle,
  getConfig2,
  getDiagramTitle,
  rgba_default,
  setAccDescription,
  setAccTitle,
  setDiagramTitle
} from "./chunk-main-aws590jt.js";
import {
  __export,
  __name,
  log,
  select_default
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/erDiagram-TEJ5UH35.mjs
var parser = function() {
  var o = /* @__PURE__ */ __name(function(k, v, o2, l) {
    for (o2 = o2 || {}, l = k.length;l--; o2[k[l]] = v)
      ;
    return o2;
  }, "o"), $V0 = [6, 8, 10, 22, 24, 26, 28, 33, 34, 35, 36, 37, 40, 43, 44, 48, 50, 51, 52], $V1 = [1, 10], $V2 = [1, 11], $V3 = [1, 12], $V4 = [1, 13], $V5 = [1, 23], $V6 = [1, 24], $V7 = [1, 25], $V8 = [1, 26], $V9 = [1, 27], $Va = [1, 19], $Vb = [1, 28], $Vc = [1, 29], $Vd = [1, 20], $Ve = [1, 18], $Vf = [1, 21], $Vg = [1, 22], $Vh = [1, 36], $Vi = [1, 37], $Vj = [1, 38], $Vk = [1, 39], $Vl = [1, 40], $Vm = [6, 8, 10, 13, 15, 17, 20, 21, 22, 24, 26, 28, 33, 34, 35, 36, 37, 40, 43, 44, 48, 50, 51, 52, 65, 66, 67, 68, 69], $Vn = [1, 45], $Vo = [1, 46], $Vp = [1, 55], $Vq = [40, 48, 50, 51, 52, 70, 71], $Vr = [1, 66], $Vs = [1, 64], $Vt = [1, 61], $Vu = [1, 65], $Vv = [1, 67], $Vw = [6, 8, 10, 13, 17, 22, 24, 26, 28, 33, 34, 35, 36, 37, 40, 41, 42, 43, 44, 48, 49, 50, 51, 52, 65, 66, 67, 68, 69], $Vx = [65, 66, 67, 68, 69], $Vy = [1, 84], $Vz = [1, 83], $VA = [1, 81], $VB = [1, 82], $VC = [6, 10, 42, 47], $VD = [6, 10, 13, 41, 42, 47, 48, 49], $VE = [1, 92], $VF = [1, 91], $VG = [1, 90], $VH = [19, 58], $VI = [1, 101], $VJ = [1, 100], $VK = [19, 58, 60, 62];
  var parser2 = {
    trace: /* @__PURE__ */ __name(function trace() {}, "trace"),
    yy: {},
    symbols_: { error: 2, start: 3, ER_DIAGRAM: 4, document: 5, EOF: 6, line: 7, SPACE: 8, statement: 9, NEWLINE: 10, entityName: 11, relSpec: 12, COLON: 13, role: 14, STYLE_SEPARATOR: 15, idList: 16, BLOCK_START: 17, attributes: 18, BLOCK_STOP: 19, SQS: 20, SQE: 21, title: 22, title_value: 23, acc_title: 24, acc_title_value: 25, acc_descr: 26, acc_descr_value: 27, acc_descr_multiline_value: 28, direction: 29, classDefStatement: 30, classStatement: 31, styleStatement: 32, direction_tb: 33, direction_bt: 34, direction_rl: 35, direction_lr: 36, CLASSDEF: 37, stylesOpt: 38, separator: 39, UNICODE_TEXT: 40, STYLE_TEXT: 41, COMMA: 42, CLASS: 43, STYLE: 44, style: 45, styleComponent: 46, SEMI: 47, NUM: 48, BRKT: 49, ENTITY_NAME: 50, DECIMAL_NUM: 51, ENTITY_ONE: 52, attribute: 53, attributeType: 54, attributeName: 55, attributeKeyTypeList: 56, attributeComment: 57, ATTRIBUTE_WORD: 58, attributeKeyType: 59, ",": 60, ATTRIBUTE_KEY: 61, COMMENT: 62, cardinality: 63, relType: 64, ZERO_OR_ONE: 65, ZERO_OR_MORE: 66, ONE_OR_MORE: 67, ONLY_ONE: 68, MD_PARENT: 69, NON_IDENTIFYING: 70, IDENTIFYING: 71, WORD: 72, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 4: "ER_DIAGRAM", 6: "EOF", 8: "SPACE", 10: "NEWLINE", 13: "COLON", 15: "STYLE_SEPARATOR", 17: "BLOCK_START", 19: "BLOCK_STOP", 20: "SQS", 21: "SQE", 22: "title", 23: "title_value", 24: "acc_title", 25: "acc_title_value", 26: "acc_descr", 27: "acc_descr_value", 28: "acc_descr_multiline_value", 33: "direction_tb", 34: "direction_bt", 35: "direction_rl", 36: "direction_lr", 37: "CLASSDEF", 40: "UNICODE_TEXT", 41: "STYLE_TEXT", 42: "COMMA", 43: "CLASS", 44: "STYLE", 47: "SEMI", 48: "NUM", 49: "BRKT", 50: "ENTITY_NAME", 51: "DECIMAL_NUM", 52: "ENTITY_ONE", 58: "ATTRIBUTE_WORD", 60: ",", 61: "ATTRIBUTE_KEY", 62: "COMMENT", 65: "ZERO_OR_ONE", 66: "ZERO_OR_MORE", 67: "ONE_OR_MORE", 68: "ONLY_ONE", 69: "MD_PARENT", 70: "NON_IDENTIFYING", 71: "IDENTIFYING", 72: "WORD" },
    productions_: [0, [3, 3], [5, 0], [5, 2], [7, 2], [7, 1], [7, 1], [7, 1], [9, 5], [9, 9], [9, 7], [9, 7], [9, 4], [9, 6], [9, 3], [9, 5], [9, 1], [9, 3], [9, 7], [9, 9], [9, 6], [9, 8], [9, 4], [9, 6], [9, 2], [9, 2], [9, 2], [9, 1], [9, 1], [9, 1], [9, 1], [9, 1], [29, 1], [29, 1], [29, 1], [29, 1], [30, 4], [16, 1], [16, 1], [16, 3], [16, 3], [31, 3], [32, 4], [38, 1], [38, 3], [45, 1], [45, 2], [39, 1], [39, 1], [39, 1], [46, 1], [46, 1], [46, 1], [46, 1], [11, 1], [11, 1], [11, 1], [11, 1], [11, 1], [18, 1], [18, 2], [53, 2], [53, 3], [53, 3], [53, 4], [54, 1], [55, 1], [56, 1], [56, 3], [59, 1], [57, 1], [12, 3], [63, 1], [63, 1], [63, 1], [63, 1], [63, 1], [64, 1], [64, 1], [14, 1], [14, 1], [14, 1]],
    performAction: /* @__PURE__ */ __name(function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
      var $0 = $$.length - 1;
      switch (yystate) {
        case 1:
          break;
        case 2:
          this.$ = [];
          break;
        case 3:
          $$[$0 - 1].push($$[$0]);
          this.$ = $$[$0 - 1];
          break;
        case 4:
        case 5:
          this.$ = $$[$0];
          break;
        case 6:
        case 7:
          this.$ = [];
          break;
        case 8:
          yy.addEntity($$[$0 - 4]);
          yy.addEntity($$[$0 - 2]);
          yy.addRelationship($$[$0 - 4], $$[$0], $$[$0 - 2], $$[$0 - 3]);
          break;
        case 9:
          yy.addEntity($$[$0 - 8]);
          yy.addEntity($$[$0 - 4]);
          yy.addRelationship($$[$0 - 8], $$[$0], $$[$0 - 4], $$[$0 - 5]);
          yy.setClass([$$[$0 - 8]], $$[$0 - 6]);
          yy.setClass([$$[$0 - 4]], $$[$0 - 2]);
          break;
        case 10:
          yy.addEntity($$[$0 - 6]);
          yy.addEntity($$[$0 - 2]);
          yy.addRelationship($$[$0 - 6], $$[$0], $$[$0 - 2], $$[$0 - 3]);
          yy.setClass([$$[$0 - 6]], $$[$0 - 4]);
          break;
        case 11:
          yy.addEntity($$[$0 - 6]);
          yy.addEntity($$[$0 - 4]);
          yy.addRelationship($$[$0 - 6], $$[$0], $$[$0 - 4], $$[$0 - 5]);
          yy.setClass([$$[$0 - 4]], $$[$0 - 2]);
          break;
        case 12:
          yy.addEntity($$[$0 - 3]);
          yy.addAttributes($$[$0 - 3], $$[$0 - 1]);
          break;
        case 13:
          yy.addEntity($$[$0 - 5]);
          yy.addAttributes($$[$0 - 5], $$[$0 - 1]);
          yy.setClass([$$[$0 - 5]], $$[$0 - 3]);
          break;
        case 14:
          yy.addEntity($$[$0 - 2]);
          break;
        case 15:
          yy.addEntity($$[$0 - 4]);
          yy.setClass([$$[$0 - 4]], $$[$0 - 2]);
          break;
        case 16:
          yy.addEntity($$[$0]);
          break;
        case 17:
          yy.addEntity($$[$0 - 2]);
          yy.setClass([$$[$0 - 2]], $$[$0]);
          break;
        case 18:
          yy.addEntity($$[$0 - 6], $$[$0 - 4]);
          yy.addAttributes($$[$0 - 6], $$[$0 - 1]);
          break;
        case 19:
          yy.addEntity($$[$0 - 8], $$[$0 - 6]);
          yy.addAttributes($$[$0 - 8], $$[$0 - 1]);
          yy.setClass([$$[$0 - 8]], $$[$0 - 3]);
          break;
        case 20:
          yy.addEntity($$[$0 - 5], $$[$0 - 3]);
          break;
        case 21:
          yy.addEntity($$[$0 - 7], $$[$0 - 5]);
          yy.setClass([$$[$0 - 7]], $$[$0 - 2]);
          break;
        case 22:
          yy.addEntity($$[$0 - 3], $$[$0 - 1]);
          break;
        case 23:
          yy.addEntity($$[$0 - 5], $$[$0 - 3]);
          yy.setClass([$$[$0 - 5]], $$[$0]);
          break;
        case 24:
        case 25:
          this.$ = $$[$0].trim();
          yy.setAccTitle(this.$);
          break;
        case 26:
        case 27:
          this.$ = $$[$0].trim();
          yy.setAccDescription(this.$);
          break;
        case 32:
          yy.setDirection("TB");
          break;
        case 33:
          yy.setDirection("BT");
          break;
        case 34:
          yy.setDirection("RL");
          break;
        case 35:
          yy.setDirection("LR");
          break;
        case 36:
          this.$ = $$[$0 - 3];
          yy.addClass($$[$0 - 2], $$[$0 - 1]);
          break;
        case 37:
        case 38:
        case 59:
        case 67:
          this.$ = [$$[$0]];
          break;
        case 39:
        case 40:
          this.$ = $$[$0 - 2].concat([$$[$0]]);
          break;
        case 41:
          this.$ = $$[$0 - 2];
          yy.setClass($$[$0 - 1], $$[$0]);
          break;
        case 42:
          ;
          this.$ = $$[$0 - 3];
          yy.addCssStyles($$[$0 - 2], $$[$0 - 1]);
          break;
        case 43:
          this.$ = [$$[$0]];
          break;
        case 44:
          $$[$0 - 2].push($$[$0]);
          this.$ = $$[$0 - 2];
          break;
        case 46:
          this.$ = $$[$0 - 1] + $$[$0];
          break;
        case 54:
        case 79:
        case 80:
          this.$ = $$[$0].replace(/"/g, "");
          break;
        case 55:
        case 56:
        case 57:
        case 58:
        case 81:
          this.$ = $$[$0];
          break;
        case 60:
          $$[$0].push($$[$0 - 1]);
          this.$ = $$[$0];
          break;
        case 61:
          this.$ = { type: $$[$0 - 1], name: $$[$0] };
          break;
        case 62:
          this.$ = { type: $$[$0 - 2], name: $$[$0 - 1], keys: $$[$0] };
          break;
        case 63:
          this.$ = { type: $$[$0 - 2], name: $$[$0 - 1], comment: $$[$0] };
          break;
        case 64:
          this.$ = { type: $$[$0 - 3], name: $$[$0 - 2], keys: $$[$0 - 1], comment: $$[$0] };
          break;
        case 65:
        case 66:
        case 69:
          this.$ = $$[$0];
          break;
        case 68:
          $$[$0 - 2].push($$[$0]);
          this.$ = $$[$0 - 2];
          break;
        case 70:
          this.$ = $$[$0].replace(/"/g, "");
          break;
        case 71:
          this.$ = { cardA: $$[$0], relType: $$[$0 - 1], cardB: $$[$0 - 2] };
          break;
        case 72:
          this.$ = yy.Cardinality.ZERO_OR_ONE;
          break;
        case 73:
          this.$ = yy.Cardinality.ZERO_OR_MORE;
          break;
        case 74:
          this.$ = yy.Cardinality.ONE_OR_MORE;
          break;
        case 75:
          this.$ = yy.Cardinality.ONLY_ONE;
          break;
        case 76:
          this.$ = yy.Cardinality.MD_PARENT;
          break;
        case 77:
          this.$ = yy.Identification.NON_IDENTIFYING;
          break;
        case 78:
          this.$ = yy.Identification.IDENTIFYING;
          break;
      }
    }, "anonymous"),
    table: [{ 3: 1, 4: [1, 2] }, { 1: [3] }, o($V0, [2, 2], { 5: 3 }), { 6: [1, 4], 7: 5, 8: [1, 6], 9: 7, 10: [1, 8], 11: 9, 22: $V1, 24: $V2, 26: $V3, 28: $V4, 29: 14, 30: 15, 31: 16, 32: 17, 33: $V5, 34: $V6, 35: $V7, 36: $V8, 37: $V9, 40: $Va, 43: $Vb, 44: $Vc, 48: $Vd, 50: $Ve, 51: $Vf, 52: $Vg }, o($V0, [2, 7], { 1: [2, 1] }), o($V0, [2, 3]), { 9: 30, 11: 9, 22: $V1, 24: $V2, 26: $V3, 28: $V4, 29: 14, 30: 15, 31: 16, 32: 17, 33: $V5, 34: $V6, 35: $V7, 36: $V8, 37: $V9, 40: $Va, 43: $Vb, 44: $Vc, 48: $Vd, 50: $Ve, 51: $Vf, 52: $Vg }, o($V0, [2, 5]), o($V0, [2, 6]), o($V0, [2, 16], { 12: 31, 63: 35, 15: [1, 32], 17: [1, 33], 20: [1, 34], 65: $Vh, 66: $Vi, 67: $Vj, 68: $Vk, 69: $Vl }), { 23: [1, 41] }, { 25: [1, 42] }, { 27: [1, 43] }, o($V0, [2, 27]), o($V0, [2, 28]), o($V0, [2, 29]), o($V0, [2, 30]), o($V0, [2, 31]), o($Vm, [2, 54]), o($Vm, [2, 55]), o($Vm, [2, 56]), o($Vm, [2, 57]), o($Vm, [2, 58]), o($V0, [2, 32]), o($V0, [2, 33]), o($V0, [2, 34]), o($V0, [2, 35]), { 16: 44, 40: $Vn, 41: $Vo }, { 16: 47, 40: $Vn, 41: $Vo }, { 16: 48, 40: $Vn, 41: $Vo }, o($V0, [2, 4]), { 11: 49, 40: $Va, 48: $Vd, 50: $Ve, 51: $Vf, 52: $Vg }, { 16: 50, 40: $Vn, 41: $Vo }, { 18: 51, 19: [1, 52], 53: 53, 54: 54, 58: $Vp }, { 11: 56, 40: $Va, 48: $Vd, 50: $Ve, 51: $Vf, 52: $Vg }, { 64: 57, 70: [1, 58], 71: [1, 59] }, o($Vq, [2, 72]), o($Vq, [2, 73]), o($Vq, [2, 74]), o($Vq, [2, 75]), o($Vq, [2, 76]), o($V0, [2, 24]), o($V0, [2, 25]), o($V0, [2, 26]), { 13: $Vr, 38: 60, 41: $Vs, 42: $Vt, 45: 62, 46: 63, 48: $Vu, 49: $Vv }, o($Vw, [2, 37]), o($Vw, [2, 38]), { 16: 68, 40: $Vn, 41: $Vo, 42: $Vt }, { 13: $Vr, 38: 69, 41: $Vs, 42: $Vt, 45: 62, 46: 63, 48: $Vu, 49: $Vv }, { 13: [1, 70], 15: [1, 71] }, o($V0, [2, 17], { 63: 35, 12: 72, 17: [1, 73], 42: $Vt, 65: $Vh, 66: $Vi, 67: $Vj, 68: $Vk, 69: $Vl }), { 19: [1, 74] }, o($V0, [2, 14]), { 18: 75, 19: [2, 59], 53: 53, 54: 54, 58: $Vp }, { 55: 76, 58: [1, 77] }, { 58: [2, 65] }, { 21: [1, 78] }, { 63: 79, 65: $Vh, 66: $Vi, 67: $Vj, 68: $Vk, 69: $Vl }, o($Vx, [2, 77]), o($Vx, [2, 78]), { 6: $Vy, 10: $Vz, 39: 80, 42: $VA, 47: $VB }, { 40: [1, 85], 41: [1, 86] }, o($VC, [2, 43], { 46: 87, 13: $Vr, 41: $Vs, 48: $Vu, 49: $Vv }), o($VD, [2, 45]), o($VD, [2, 50]), o($VD, [2, 51]), o($VD, [2, 52]), o($VD, [2, 53]), o($V0, [2, 41], { 42: $Vt }), { 6: $Vy, 10: $Vz, 39: 88, 42: $VA, 47: $VB }, { 14: 89, 40: $VE, 50: $VF, 72: $VG }, { 16: 93, 40: $Vn, 41: $Vo }, { 11: 94, 40: $Va, 48: $Vd, 50: $Ve, 51: $Vf, 52: $Vg }, { 18: 95, 19: [1, 96], 53: 53, 54: 54, 58: $Vp }, o($V0, [2, 12]), { 19: [2, 60] }, o($VH, [2, 61], { 56: 97, 57: 98, 59: 99, 61: $VI, 62: $VJ }), o([19, 58, 61, 62], [2, 66]), o($V0, [2, 22], { 15: [1, 103], 17: [1, 102] }), o([40, 48, 50, 51, 52], [2, 71]), o($V0, [2, 36]), { 13: $Vr, 41: $Vs, 45: 104, 46: 63, 48: $Vu, 49: $Vv }, o($V0, [2, 47]), o($V0, [2, 48]), o($V0, [2, 49]), o($Vw, [2, 39]), o($Vw, [2, 40]), o($VD, [2, 46]), o($V0, [2, 42]), o($V0, [2, 8]), o($V0, [2, 79]), o($V0, [2, 80]), o($V0, [2, 81]), { 13: [1, 105], 42: $Vt }, { 13: [1, 107], 15: [1, 106] }, { 19: [1, 108] }, o($V0, [2, 15]), o($VH, [2, 62], { 57: 109, 60: [1, 110], 62: $VJ }), o($VH, [2, 63]), o($VK, [2, 67]), o($VH, [2, 70]), o($VK, [2, 69]), { 18: 111, 19: [1, 112], 53: 53, 54: 54, 58: $Vp }, { 16: 113, 40: $Vn, 41: $Vo }, o($VC, [2, 44], { 46: 87, 13: $Vr, 41: $Vs, 48: $Vu, 49: $Vv }), { 14: 114, 40: $VE, 50: $VF, 72: $VG }, { 16: 115, 40: $Vn, 41: $Vo }, { 14: 116, 40: $VE, 50: $VF, 72: $VG }, o($V0, [2, 13]), o($VH, [2, 64]), { 59: 117, 61: $VI }, { 19: [1, 118] }, o($V0, [2, 20]), o($V0, [2, 23], { 17: [1, 119], 42: $Vt }), o($V0, [2, 11]), { 13: [1, 120], 42: $Vt }, o($V0, [2, 10]), o($VK, [2, 68]), o($V0, [2, 18]), { 18: 121, 19: [1, 122], 53: 53, 54: 54, 58: $Vp }, { 14: 123, 40: $VE, 50: $VF, 72: $VG }, { 19: [1, 124] }, o($V0, [2, 21]), o($V0, [2, 9]), o($V0, [2, 19])],
    defaultActions: { 55: [2, 65], 75: [2, 60] },
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
            this.begin("acc_title");
            return 24;
            break;
          case 1:
            this.popState();
            return "acc_title_value";
            break;
          case 2:
            this.begin("acc_descr");
            return 26;
            break;
          case 3:
            this.popState();
            return "acc_descr_value";
            break;
          case 4:
            this.begin("acc_descr_multiline");
            break;
          case 5:
            this.popState();
            break;
          case 6:
            return "acc_descr_multiline_value";
            break;
          case 7:
            return 33;
            break;
          case 8:
            return 34;
            break;
          case 9:
            return 35;
            break;
          case 10:
            return 36;
            break;
          case 11:
            return 10;
            break;
          case 12:
            break;
          case 13:
            return 8;
            break;
          case 14:
            return 50;
            break;
          case 15:
            return 72;
            break;
          case 16:
            return 4;
            break;
          case 17:
            this.begin("block");
            return 17;
            break;
          case 18:
            return 49;
            break;
          case 19:
            return 49;
            break;
          case 20:
            return 42;
            break;
          case 21:
            return 15;
            break;
          case 22:
            return 13;
            break;
          case 23:
            break;
          case 24:
            return 61;
            break;
          case 25:
            return 58;
            break;
          case 26:
            return 58;
            break;
          case 27:
            return 62;
            break;
          case 28:
            break;
          case 29:
            this.popState();
            return 19;
            break;
          case 30:
            return yy_.yytext[0];
            break;
          case 31:
            return 20;
            break;
          case 32:
            return 21;
            break;
          case 33:
            this.begin("style");
            return 44;
            break;
          case 34:
            this.popState();
            return 10;
            break;
          case 35:
            break;
          case 36:
            return 13;
            break;
          case 37:
            return 42;
            break;
          case 38:
            return 49;
            break;
          case 39:
            this.begin("style");
            return 37;
            break;
          case 40:
            return 43;
            break;
          case 41:
            return 65;
            break;
          case 42:
            return 67;
            break;
          case 43:
            return 67;
            break;
          case 44:
            return 67;
            break;
          case 45:
            return 65;
            break;
          case 46:
            return 65;
            break;
          case 47:
            return 66;
            break;
          case 48:
            return 66;
            break;
          case 49:
            return 66;
            break;
          case 50:
            return 66;
            break;
          case 51:
            return 66;
            break;
          case 52:
            return 67;
            break;
          case 53:
            return 66;
            break;
          case 54:
            return 67;
            break;
          case 55:
            return 68;
            break;
          case 56:
            return 68;
            break;
          case 57:
            return 51;
            break;
          case 58:
            return 68;
            break;
          case 59:
            return 68;
            break;
          case 60:
            return 68;
            break;
          case 61:
            return 52;
            break;
          case 62:
            return 48;
            break;
          case 63:
            return 68;
            break;
          case 64:
            return 65;
            break;
          case 65:
            return 66;
            break;
          case 66:
            return 67;
            break;
          case 67:
            return 69;
            break;
          case 68:
            return 70;
            break;
          case 69:
            return 71;
            break;
          case 70:
            return 71;
            break;
          case 71:
            return 70;
            break;
          case 72:
            return 70;
            break;
          case 73:
            return 70;
            break;
          case 74:
            return 41;
            break;
          case 75:
            return 47;
            break;
          case 76:
            return 40;
            break;
          case 77:
            return yy_.yytext[0];
            break;
          case 78:
            return 6;
            break;
        }
      }, "anonymous"),
      rules: [/^(?:accTitle\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*\{\s*)/i, /^(?:[\}])/i, /^(?:[^\}]*)/i, /^(?:.*direction\s+TB[^\n]*)/i, /^(?:.*direction\s+BT[^\n]*)/i, /^(?:.*direction\s+RL[^\n]*)/i, /^(?:.*direction\s+LR[^\n]*)/i, /^(?:[\n]+)/i, /^(?:\s+)/i, /^(?:[\s]+)/i, /^(?:"[^"%\r\n\v\b\\]+")/i, /^(?:"[^"]*")/i, /^(?:erDiagram\b)/i, /^(?:\{)/i, /^(?:#)/i, /^(?:#)/i, /^(?:,)/i, /^(?::::)/i, /^(?::)/i, /^(?:\s+)/i, /^(?:\b((?:PK)|(?:FK)|(?:UK))\b)/i, /^(?:([^\s]*)[~].*[~]([^\s]*))/i, /^(?:([\*A-Za-z_\u00C0-\uFFFF][A-Za-z0-9\-\_\[\]\(\)\u00C0-\uFFFF\*]*))/i, /^(?:"[^"]*")/i, /^(?:[\n]+)/i, /^(?:\})/i, /^(?:.)/i, /^(?:\[)/i, /^(?:\])/i, /^(?:style\b)/i, /^(?:[\n]+)/i, /^(?:\s+)/i, /^(?::)/i, /^(?:,)/i, /^(?:#)/i, /^(?:classDef\b)/i, /^(?:class\b)/i, /^(?:one or zero\b)/i, /^(?:one or more\b)/i, /^(?:one or many\b)/i, /^(?:1\+)/i, /^(?:\|o\b)/i, /^(?:zero or one\b)/i, /^(?:zero or more\b)/i, /^(?:zero or many\b)/i, /^(?:0\+)/i, /^(?:\}o\b)/i, /^(?:many\(0\))/i, /^(?:many\(1\))/i, /^(?:many\b)/i, /^(?:\}\|)/i, /^(?:one\b)/i, /^(?:only one\b)/i, /^(?:[0-9]+\.[0-9]+)/i, /^(?:1(?=\s+[A-Za-z_"']))/i, /^(?:1(?=\s+[0-9]))/i, /^(?:1(?=(--|\.\.|\.-|-\.)))/i, /^(?:1\b)/i, /^(?:[0-9]+)/i, /^(?:\|\|)/i, /^(?:o\|)/i, /^(?:o\{)/i, /^(?:\|\{)/i, /^(?:u(?=[\.\-\|]))/i, /^(?:\.\.)/i, /^(?:--)/i, /^(?:to\b)/i, /^(?:optionally to\b)/i, /^(?:\.-)/i, /^(?:-\.)/i, /^(?:([^\x00-\x7F]|\w|-|\*)+)/i, /^(?:;)/i, /^(?:([^\x00-\x7F]|\w|-|\*|\.)+)/i, /^(?:.)/i, /^(?:$)/i],
      conditions: { style: { rules: [34, 35, 36, 37, 38, 74, 75], inclusive: false }, acc_descr_multiline: { rules: [5, 6], inclusive: false }, acc_descr: { rules: [3], inclusive: false }, acc_title: { rules: [1], inclusive: false }, block: { rules: [23, 24, 25, 26, 27, 28, 29, 30], inclusive: false }, INITIAL: { rules: [0, 2, 4, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 31, 32, 33, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 76, 77, 78], inclusive: true } }
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
var erDiagram_default = parser;
var ErDB = class {
  constructor() {
    this.entities = /* @__PURE__ */ new Map;
    this.relationships = [];
    this.classes = /* @__PURE__ */ new Map;
    this.direction = "TB";
    this.Cardinality = {
      ZERO_OR_ONE: "ZERO_OR_ONE",
      ZERO_OR_MORE: "ZERO_OR_MORE",
      ONE_OR_MORE: "ONE_OR_MORE",
      ONLY_ONE: "ONLY_ONE",
      MD_PARENT: "MD_PARENT"
    };
    this.Identification = {
      NON_IDENTIFYING: "NON_IDENTIFYING",
      IDENTIFYING: "IDENTIFYING"
    };
    this.setAccTitle = setAccTitle;
    this.getAccTitle = getAccTitle;
    this.setAccDescription = setAccDescription;
    this.getAccDescription = getAccDescription;
    this.setDiagramTitle = setDiagramTitle;
    this.getDiagramTitle = getDiagramTitle;
    this.getConfig = /* @__PURE__ */ __name(() => getConfig2().er, "getConfig");
    this.clear();
    this.addEntity = this.addEntity.bind(this);
    this.addAttributes = this.addAttributes.bind(this);
    this.addRelationship = this.addRelationship.bind(this);
    this.setDirection = this.setDirection.bind(this);
    this.addCssStyles = this.addCssStyles.bind(this);
    this.addClass = this.addClass.bind(this);
    this.setClass = this.setClass.bind(this);
    this.setAccTitle = this.setAccTitle.bind(this);
    this.setAccDescription = this.setAccDescription.bind(this);
  }
  static {
    __name(this, "ErDB");
  }
  addEntity(name, alias = "") {
    if (!this.entities.has(name)) {
      this.entities.set(name, {
        id: `entity-${name}-${this.entities.size}`,
        label: name,
        attributes: [],
        alias,
        shape: "erBox",
        look: getConfig2().look ?? "default",
        cssClasses: "default",
        cssStyles: [],
        labelType: "markdown"
      });
      log.info("Added new entity :", name);
    } else if (!this.entities.get(name)?.alias && alias) {
      this.entities.get(name).alias = alias;
      log.info(`Add alias '${alias}' to entity '${name}'`);
    }
    return this.entities.get(name);
  }
  getEntity(name) {
    return this.entities.get(name);
  }
  getEntities() {
    return this.entities;
  }
  getClasses() {
    return this.classes;
  }
  addAttributes(entityName, attribs) {
    const entity = this.addEntity(entityName);
    let i;
    for (i = attribs.length - 1;i >= 0; i--) {
      if (!attribs[i].keys) {
        attribs[i].keys = [];
      }
      if (!attribs[i].comment) {
        attribs[i].comment = "";
      }
      entity.attributes.push(attribs[i]);
      log.debug("Added attribute ", attribs[i].name);
    }
  }
  addRelationship(entA, rolA, entB, rSpec) {
    const entityA = this.entities.get(entA);
    const entityB = this.entities.get(entB);
    if (!entityA || !entityB) {
      return;
    }
    const rel = {
      entityA: entityA.id,
      roleA: rolA,
      entityB: entityB.id,
      relSpec: rSpec
    };
    this.relationships.push(rel);
    log.debug("Added new relationship :", rel);
  }
  getRelationships() {
    return this.relationships;
  }
  getDirection() {
    return this.direction;
  }
  setDirection(dir) {
    this.direction = dir;
  }
  getCompiledStyles(classDefs) {
    let compiledStyles = [];
    for (const customClass of classDefs) {
      const cssClass = this.classes.get(customClass);
      if (cssClass?.styles) {
        compiledStyles = [...compiledStyles, ...cssClass.styles ?? []].map((s) => s.trim());
      }
      if (cssClass?.textStyles) {
        compiledStyles = [...compiledStyles, ...cssClass.textStyles ?? []].map((s) => s.trim());
      }
    }
    return compiledStyles;
  }
  addCssStyles(ids, styles) {
    for (const id of ids) {
      const entity = this.entities.get(id);
      if (!styles || !entity) {
        return;
      }
      for (const style of styles) {
        entity.cssStyles.push(style);
      }
    }
  }
  addClass(ids, style) {
    ids.forEach((id) => {
      let classNode = this.classes.get(id);
      if (classNode === undefined) {
        classNode = { id, styles: [], textStyles: [] };
        this.classes.set(id, classNode);
      }
      if (style) {
        style.forEach(function(s) {
          if (/color/.exec(s)) {
            const newStyle = s.replace("fill", "bgFill");
            classNode.textStyles.push(newStyle);
          }
          classNode.styles.push(s);
        });
      }
    });
  }
  setClass(ids, classNames) {
    for (const id of ids) {
      const entity = this.entities.get(id);
      if (entity) {
        for (const className of classNames) {
          entity.cssClasses += " " + className;
        }
      }
    }
  }
  clear() {
    this.entities = /* @__PURE__ */ new Map;
    this.classes = /* @__PURE__ */ new Map;
    this.relationships = [];
    clear();
  }
  getData() {
    const nodes = [];
    const edges = [];
    const config = getConfig2();
    let colorIndex = 0;
    for (const entityKey of this.entities.keys()) {
      const entityNode = this.entities.get(entityKey);
      if (entityNode) {
        entityNode.cssCompiledStyles = this.getCompiledStyles(entityNode.cssClasses.split(" "));
        entityNode.colorIndex = colorIndex++;
        nodes.push(entityNode);
      }
    }
    let count = 0;
    for (const relationship of this.relationships) {
      const edge = {
        id: getEdgeId(relationship.entityA, relationship.entityB, {
          prefix: "id",
          counter: count++
        }),
        type: "normal",
        curve: "basis",
        start: relationship.entityA,
        end: relationship.entityB,
        label: relationship.roleA,
        labelpos: "c",
        thickness: "normal",
        classes: "relationshipLine",
        arrowTypeStart: relationship.relSpec.cardB.toLowerCase(),
        arrowTypeEnd: relationship.relSpec.cardA.toLowerCase(),
        pattern: relationship.relSpec.relType == "IDENTIFYING" ? "solid" : "dashed",
        look: config.look,
        labelType: "markdown"
      };
      edges.push(edge);
    }
    return { nodes, edges, other: {}, config, direction: "TB" };
  }
};
var erRenderer_unified_exports = {};
__export(erRenderer_unified_exports, {
  draw: () => draw
});
var draw = /* @__PURE__ */ __name(async function(text, id, _version, diag) {
  log.info("REF0:");
  log.info("Drawing er diagram (unified)", id);
  const { securityLevel, er: conf, layout } = getConfig2();
  const data4Layout = diag.db.getData();
  const svg = getDiagramElement(id, securityLevel);
  data4Layout.type = diag.type;
  data4Layout.layoutAlgorithm = getRegisteredLayoutAlgorithm(layout);
  data4Layout.config.flowchart.nodeSpacing = conf?.nodeSpacing || 140;
  data4Layout.config.flowchart.rankSpacing = conf?.rankSpacing || 80;
  data4Layout.direction = diag.db.getDirection();
  const { config } = data4Layout;
  const { look } = config;
  if (look === "neo") {
    data4Layout.markers = [
      "only_one_neo",
      "zero_or_one_neo",
      "one_or_more_neo",
      "zero_or_more_neo"
    ];
  } else {
    data4Layout.markers = ["only_one", "zero_or_one", "one_or_more", "zero_or_more"];
  }
  data4Layout.diagramId = id;
  await render(data4Layout, svg);
  if (data4Layout.layoutAlgorithm === "elk") {
    svg.select(".edges").lower();
  }
  const backgroundNodes = svg.selectAll('[id*="-background"]');
  if (Array.from(backgroundNodes).length > 0) {
    backgroundNodes.each(function() {
      const backgroundNode = select_default(this);
      const backgroundId = backgroundNode.attr("id");
      const nonBackgroundId = backgroundId.replace("-background", "");
      const nonBackgroundNode = svg.select(`#${CSS.escape(nonBackgroundId)}`);
      if (!nonBackgroundNode.empty()) {
        const transform = nonBackgroundNode.attr("transform");
        backgroundNode.attr("transform", transform);
      }
    });
  }
  const padding = 8;
  utils_default.insertTitle(svg, "erDiagramTitleText", conf?.titleTopMargin ?? 25, diag.db.getDiagramTitle());
  setupViewPortForSVG(svg, padding, "erDiagram", conf?.useMaxWidth ?? true);
}, "draw");
var fade = /* @__PURE__ */ __name((color, opacity) => {
  const channel2 = channel_default;
  const r = channel2(color, "r");
  const g = channel2(color, "g");
  const b = channel2(color, "b");
  return rgba_default(r, g, b, opacity);
}, "fade");
var COLOR_THEMES = /* @__PURE__ */ new Set(["redux-color", "redux-dark-color"]);
var genColor = /* @__PURE__ */ __name((options) => {
  const { theme, look, bkgColorArray, borderColorArray } = options;
  if (!COLOR_THEMES.has(theme)) {
    return "";
  }
  const hasBkgColors = bkgColorArray?.length > 0;
  let sections = "";
  for (let i = 0;i < options.THEME_COLOR_LIMIT; i++) {
    sections += `

    [data-look="${look}"][data-color-id="color-${i}"].node path {
    stroke: ${borderColorArray[i]};
    ${hasBkgColors ? `fill: ${bkgColorArray[i]};` : ""}
    }

    [data-look="${look}"][data-color-id="color-${i}"].node  rect {
    stroke: ${borderColorArray[i]};
    ${hasBkgColors ? `fill: ${bkgColorArray[i]};` : ""}
     }
    `;
  }
  return sections;
}, "genColor");
var getStyles = /* @__PURE__ */ __name((options) => {
  const { look, theme, erEdgeLabelBackground, strokeWidth } = options;
  return `
    ${genColor(options)}
  .entityBox {
    fill: ${options.mainBkg};
    stroke: ${options.nodeBorder};
  }

  .relationshipLabelBox {
    fill: ${options.tertiaryColor};
    opacity: 0.7;
    background-color: ${options.tertiaryColor};
      rect {
        opacity: 0.5;
      }
  }

  .labelBkg {
    background-color: ${COLOR_THEMES.has(theme) && erEdgeLabelBackground ? erEdgeLabelBackground : fade(options.tertiaryColor, 0.5)};
  }

  .edgeLabel {
    background-color: ${COLOR_THEMES.has(theme) && erEdgeLabelBackground ? erEdgeLabelBackground : options.edgeLabelBackground};
  }
  .edgeLabel .label rect {
    fill: ${COLOR_THEMES.has(theme) && erEdgeLabelBackground ? erEdgeLabelBackground : options.edgeLabelBackground};
  }
  .edgeLabel .label text {
    fill: ${options.textColor};
  }

  .edgeLabel .label {
    fill: ${options.nodeBorder};
    font-size: 14px;
  }

  .label {
    font-family: ${options.fontFamily};
    color: ${options.nodeTextColor || options.textColor};
  }

  .edge-pattern-dashed {
    stroke-dasharray: 8,8;
  }

  .node rect,
  .node circle,
  .node ellipse,
  .node polygon
  {
    fill: ${options.mainBkg};
    stroke: ${options.nodeBorder};
    stroke-width: ${look === "neo" ? strokeWidth : "1px"};
  }

  .relationshipLine {
    stroke: ${options.lineColor};
    stroke-width: ${look === "neo" ? strokeWidth : "1px"};
    fill: none;
  }

  .marker {
    fill: none !important;
    stroke: ${options.lineColor} !important;
    stroke-width: 1;
  }
  [data-look=neo].labelBkg {
    background-color: ${fade(options.tertiaryColor, 0.5)};
  }
`;
}, "getStyles");
var styles_default = getStyles;
var diagram = {
  parser: erDiagram_default,
  get db() {
    return new ErDB;
  },
  renderer: erRenderer_unified_exports,
  styles: styles_default
};
export {
  diagram
};

//# debugId=7F837F331A425EAA64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2VyRGlhZ3JhbS1URUo1VUgzNS5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiaW1wb3J0IHtcbiAgZ2V0RGlhZ3JhbUVsZW1lbnRcbn0gZnJvbSBcIi4vY2h1bmstNTVJQUNFQjYubWpzXCI7XG5pbXBvcnQge1xuICBzZXR1cFZpZXdQb3J0Rm9yU1ZHXG59IGZyb20gXCIuL2NodW5rLTJKMzNXVE1ILm1qc1wiO1xuaW1wb3J0IHtcbiAgZ2V0UmVnaXN0ZXJlZExheW91dEFsZ29yaXRobSxcbiAgcmVuZGVyXG59IGZyb20gXCIuL2NodW5rLUxaWEVEWkNBLm1qc1wiO1xuaW1wb3J0IFwiLi9jaHVuay1LU0NTNU42QS5tanNcIjtcbmltcG9ydCBcIi4vY2h1bmstQlNKUDdDQlAubWpzXCI7XG5pbXBvcnQgXCIuL2NodW5rLTNPUElGR0RFLm1qc1wiO1xuaW1wb3J0IFwiLi9jaHVuay1MNVpUTERXVi5tanNcIjtcbmltcG9ydCBcIi4vY2h1bmstTlpLMkQ3R1UubWpzXCI7XG5pbXBvcnQgXCIuL2NodW5rLU81Q0JFTDZPLm1qc1wiO1xuaW1wb3J0IHtcbiAgZ2V0RWRnZUlkLFxuICB1dGlsc19kZWZhdWx0XG59IGZyb20gXCIuL2NodW5rLTVaUVlIWEtVLm1qc1wiO1xuaW1wb3J0IHtcbiAgY2xlYXIsXG4gIGdldEFjY0Rlc2NyaXB0aW9uLFxuICBnZXRBY2NUaXRsZSxcbiAgZ2V0Q29uZmlnMiBhcyBnZXRDb25maWcsXG4gIGdldERpYWdyYW1UaXRsZSxcbiAgc2V0QWNjRGVzY3JpcHRpb24sXG4gIHNldEFjY1RpdGxlLFxuICBzZXREaWFncmFtVGl0bGVcbn0gZnJvbSBcIi4vY2h1bmstQ1NDSUhLN1EubWpzXCI7XG5pbXBvcnQge1xuICBfX2V4cG9ydCxcbiAgX19uYW1lLFxuICBsb2dcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIHNyYy9kaWFncmFtcy9lci9wYXJzZXIvZXJEaWFncmFtLmppc29uXG52YXIgcGFyc2VyID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgbyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oaywgdiwgbzIsIGwpIHtcbiAgICBmb3IgKG8yID0gbzIgfHwge30sIGwgPSBrLmxlbmd0aDsgbC0tOyBvMltrW2xdXSA9IHYpIDtcbiAgICByZXR1cm4gbzI7XG4gIH0sIFwib1wiKSwgJFYwID0gWzYsIDgsIDEwLCAyMiwgMjQsIDI2LCAyOCwgMzMsIDM0LCAzNSwgMzYsIDM3LCA0MCwgNDMsIDQ0LCA0OCwgNTAsIDUxLCA1Ml0sICRWMSA9IFsxLCAxMF0sICRWMiA9IFsxLCAxMV0sICRWMyA9IFsxLCAxMl0sICRWNCA9IFsxLCAxM10sICRWNSA9IFsxLCAyM10sICRWNiA9IFsxLCAyNF0sICRWNyA9IFsxLCAyNV0sICRWOCA9IFsxLCAyNl0sICRWOSA9IFsxLCAyN10sICRWYSA9IFsxLCAxOV0sICRWYiA9IFsxLCAyOF0sICRWYyA9IFsxLCAyOV0sICRWZCA9IFsxLCAyMF0sICRWZSA9IFsxLCAxOF0sICRWZiA9IFsxLCAyMV0sICRWZyA9IFsxLCAyMl0sICRWaCA9IFsxLCAzNl0sICRWaSA9IFsxLCAzN10sICRWaiA9IFsxLCAzOF0sICRWayA9IFsxLCAzOV0sICRWbCA9IFsxLCA0MF0sICRWbSA9IFs2LCA4LCAxMCwgMTMsIDE1LCAxNywgMjAsIDIxLCAyMiwgMjQsIDI2LCAyOCwgMzMsIDM0LCAzNSwgMzYsIDM3LCA0MCwgNDMsIDQ0LCA0OCwgNTAsIDUxLCA1MiwgNjUsIDY2LCA2NywgNjgsIDY5XSwgJFZuID0gWzEsIDQ1XSwgJFZvID0gWzEsIDQ2XSwgJFZwID0gWzEsIDU1XSwgJFZxID0gWzQwLCA0OCwgNTAsIDUxLCA1MiwgNzAsIDcxXSwgJFZyID0gWzEsIDY2XSwgJFZzID0gWzEsIDY0XSwgJFZ0ID0gWzEsIDYxXSwgJFZ1ID0gWzEsIDY1XSwgJFZ2ID0gWzEsIDY3XSwgJFZ3ID0gWzYsIDgsIDEwLCAxMywgMTcsIDIyLCAyNCwgMjYsIDI4LCAzMywgMzQsIDM1LCAzNiwgMzcsIDQwLCA0MSwgNDIsIDQzLCA0NCwgNDgsIDQ5LCA1MCwgNTEsIDUyLCA2NSwgNjYsIDY3LCA2OCwgNjldLCAkVnggPSBbNjUsIDY2LCA2NywgNjgsIDY5XSwgJFZ5ID0gWzEsIDg0XSwgJFZ6ID0gWzEsIDgzXSwgJFZBID0gWzEsIDgxXSwgJFZCID0gWzEsIDgyXSwgJFZDID0gWzYsIDEwLCA0MiwgNDddLCAkVkQgPSBbNiwgMTAsIDEzLCA0MSwgNDIsIDQ3LCA0OCwgNDldLCAkVkUgPSBbMSwgOTJdLCAkVkYgPSBbMSwgOTFdLCAkVkcgPSBbMSwgOTBdLCAkVkggPSBbMTksIDU4XSwgJFZJID0gWzEsIDEwMV0sICRWSiA9IFsxLCAxMDBdLCAkVksgPSBbMTksIDU4LCA2MCwgNjJdO1xuICB2YXIgcGFyc2VyMiA9IHtcbiAgICB0cmFjZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiB0cmFjZSgpIHtcbiAgICB9LCBcInRyYWNlXCIpLFxuICAgIHl5OiB7fSxcbiAgICBzeW1ib2xzXzogeyBcImVycm9yXCI6IDIsIFwic3RhcnRcIjogMywgXCJFUl9ESUFHUkFNXCI6IDQsIFwiZG9jdW1lbnRcIjogNSwgXCJFT0ZcIjogNiwgXCJsaW5lXCI6IDcsIFwiU1BBQ0VcIjogOCwgXCJzdGF0ZW1lbnRcIjogOSwgXCJORVdMSU5FXCI6IDEwLCBcImVudGl0eU5hbWVcIjogMTEsIFwicmVsU3BlY1wiOiAxMiwgXCJDT0xPTlwiOiAxMywgXCJyb2xlXCI6IDE0LCBcIlNUWUxFX1NFUEFSQVRPUlwiOiAxNSwgXCJpZExpc3RcIjogMTYsIFwiQkxPQ0tfU1RBUlRcIjogMTcsIFwiYXR0cmlidXRlc1wiOiAxOCwgXCJCTE9DS19TVE9QXCI6IDE5LCBcIlNRU1wiOiAyMCwgXCJTUUVcIjogMjEsIFwidGl0bGVcIjogMjIsIFwidGl0bGVfdmFsdWVcIjogMjMsIFwiYWNjX3RpdGxlXCI6IDI0LCBcImFjY190aXRsZV92YWx1ZVwiOiAyNSwgXCJhY2NfZGVzY3JcIjogMjYsIFwiYWNjX2Rlc2NyX3ZhbHVlXCI6IDI3LCBcImFjY19kZXNjcl9tdWx0aWxpbmVfdmFsdWVcIjogMjgsIFwiZGlyZWN0aW9uXCI6IDI5LCBcImNsYXNzRGVmU3RhdGVtZW50XCI6IDMwLCBcImNsYXNzU3RhdGVtZW50XCI6IDMxLCBcInN0eWxlU3RhdGVtZW50XCI6IDMyLCBcImRpcmVjdGlvbl90YlwiOiAzMywgXCJkaXJlY3Rpb25fYnRcIjogMzQsIFwiZGlyZWN0aW9uX3JsXCI6IDM1LCBcImRpcmVjdGlvbl9sclwiOiAzNiwgXCJDTEFTU0RFRlwiOiAzNywgXCJzdHlsZXNPcHRcIjogMzgsIFwic2VwYXJhdG9yXCI6IDM5LCBcIlVOSUNPREVfVEVYVFwiOiA0MCwgXCJTVFlMRV9URVhUXCI6IDQxLCBcIkNPTU1BXCI6IDQyLCBcIkNMQVNTXCI6IDQzLCBcIlNUWUxFXCI6IDQ0LCBcInN0eWxlXCI6IDQ1LCBcInN0eWxlQ29tcG9uZW50XCI6IDQ2LCBcIlNFTUlcIjogNDcsIFwiTlVNXCI6IDQ4LCBcIkJSS1RcIjogNDksIFwiRU5USVRZX05BTUVcIjogNTAsIFwiREVDSU1BTF9OVU1cIjogNTEsIFwiRU5USVRZX09ORVwiOiA1MiwgXCJhdHRyaWJ1dGVcIjogNTMsIFwiYXR0cmlidXRlVHlwZVwiOiA1NCwgXCJhdHRyaWJ1dGVOYW1lXCI6IDU1LCBcImF0dHJpYnV0ZUtleVR5cGVMaXN0XCI6IDU2LCBcImF0dHJpYnV0ZUNvbW1lbnRcIjogNTcsIFwiQVRUUklCVVRFX1dPUkRcIjogNTgsIFwiYXR0cmlidXRlS2V5VHlwZVwiOiA1OSwgXCIsXCI6IDYwLCBcIkFUVFJJQlVURV9LRVlcIjogNjEsIFwiQ09NTUVOVFwiOiA2MiwgXCJjYXJkaW5hbGl0eVwiOiA2MywgXCJyZWxUeXBlXCI6IDY0LCBcIlpFUk9fT1JfT05FXCI6IDY1LCBcIlpFUk9fT1JfTU9SRVwiOiA2NiwgXCJPTkVfT1JfTU9SRVwiOiA2NywgXCJPTkxZX09ORVwiOiA2OCwgXCJNRF9QQVJFTlRcIjogNjksIFwiTk9OX0lERU5USUZZSU5HXCI6IDcwLCBcIklERU5USUZZSU5HXCI6IDcxLCBcIldPUkRcIjogNzIsIFwiJGFjY2VwdFwiOiAwLCBcIiRlbmRcIjogMSB9LFxuICAgIHRlcm1pbmFsc186IHsgMjogXCJlcnJvclwiLCA0OiBcIkVSX0RJQUdSQU1cIiwgNjogXCJFT0ZcIiwgODogXCJTUEFDRVwiLCAxMDogXCJORVdMSU5FXCIsIDEzOiBcIkNPTE9OXCIsIDE1OiBcIlNUWUxFX1NFUEFSQVRPUlwiLCAxNzogXCJCTE9DS19TVEFSVFwiLCAxOTogXCJCTE9DS19TVE9QXCIsIDIwOiBcIlNRU1wiLCAyMTogXCJTUUVcIiwgMjI6IFwidGl0bGVcIiwgMjM6IFwidGl0bGVfdmFsdWVcIiwgMjQ6IFwiYWNjX3RpdGxlXCIsIDI1OiBcImFjY190aXRsZV92YWx1ZVwiLCAyNjogXCJhY2NfZGVzY3JcIiwgMjc6IFwiYWNjX2Rlc2NyX3ZhbHVlXCIsIDI4OiBcImFjY19kZXNjcl9tdWx0aWxpbmVfdmFsdWVcIiwgMzM6IFwiZGlyZWN0aW9uX3RiXCIsIDM0OiBcImRpcmVjdGlvbl9idFwiLCAzNTogXCJkaXJlY3Rpb25fcmxcIiwgMzY6IFwiZGlyZWN0aW9uX2xyXCIsIDM3OiBcIkNMQVNTREVGXCIsIDQwOiBcIlVOSUNPREVfVEVYVFwiLCA0MTogXCJTVFlMRV9URVhUXCIsIDQyOiBcIkNPTU1BXCIsIDQzOiBcIkNMQVNTXCIsIDQ0OiBcIlNUWUxFXCIsIDQ3OiBcIlNFTUlcIiwgNDg6IFwiTlVNXCIsIDQ5OiBcIkJSS1RcIiwgNTA6IFwiRU5USVRZX05BTUVcIiwgNTE6IFwiREVDSU1BTF9OVU1cIiwgNTI6IFwiRU5USVRZX09ORVwiLCA1ODogXCJBVFRSSUJVVEVfV09SRFwiLCA2MDogXCIsXCIsIDYxOiBcIkFUVFJJQlVURV9LRVlcIiwgNjI6IFwiQ09NTUVOVFwiLCA2NTogXCJaRVJPX09SX09ORVwiLCA2NjogXCJaRVJPX09SX01PUkVcIiwgNjc6IFwiT05FX09SX01PUkVcIiwgNjg6IFwiT05MWV9PTkVcIiwgNjk6IFwiTURfUEFSRU5UXCIsIDcwOiBcIk5PTl9JREVOVElGWUlOR1wiLCA3MTogXCJJREVOVElGWUlOR1wiLCA3MjogXCJXT1JEXCIgfSxcbiAgICBwcm9kdWN0aW9uc186IFswLCBbMywgM10sIFs1LCAwXSwgWzUsIDJdLCBbNywgMl0sIFs3LCAxXSwgWzcsIDFdLCBbNywgMV0sIFs5LCA1XSwgWzksIDldLCBbOSwgN10sIFs5LCA3XSwgWzksIDRdLCBbOSwgNl0sIFs5LCAzXSwgWzksIDVdLCBbOSwgMV0sIFs5LCAzXSwgWzksIDddLCBbOSwgOV0sIFs5LCA2XSwgWzksIDhdLCBbOSwgNF0sIFs5LCA2XSwgWzksIDJdLCBbOSwgMl0sIFs5LCAyXSwgWzksIDFdLCBbOSwgMV0sIFs5LCAxXSwgWzksIDFdLCBbOSwgMV0sIFsyOSwgMV0sIFsyOSwgMV0sIFsyOSwgMV0sIFsyOSwgMV0sIFszMCwgNF0sIFsxNiwgMV0sIFsxNiwgMV0sIFsxNiwgM10sIFsxNiwgM10sIFszMSwgM10sIFszMiwgNF0sIFszOCwgMV0sIFszOCwgM10sIFs0NSwgMV0sIFs0NSwgMl0sIFszOSwgMV0sIFszOSwgMV0sIFszOSwgMV0sIFs0NiwgMV0sIFs0NiwgMV0sIFs0NiwgMV0sIFs0NiwgMV0sIFsxMSwgMV0sIFsxMSwgMV0sIFsxMSwgMV0sIFsxMSwgMV0sIFsxMSwgMV0sIFsxOCwgMV0sIFsxOCwgMl0sIFs1MywgMl0sIFs1MywgM10sIFs1MywgM10sIFs1MywgNF0sIFs1NCwgMV0sIFs1NSwgMV0sIFs1NiwgMV0sIFs1NiwgM10sIFs1OSwgMV0sIFs1NywgMV0sIFsxMiwgM10sIFs2MywgMV0sIFs2MywgMV0sIFs2MywgMV0sIFs2MywgMV0sIFs2MywgMV0sIFs2NCwgMV0sIFs2NCwgMV0sIFsxNCwgMV0sIFsxNCwgMV0sIFsxNCwgMV1dLFxuICAgIHBlcmZvcm1BY3Rpb246IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gYW5vbnltb3VzKHl5dGV4dCwgeXlsZW5nLCB5eWxpbmVubywgeXksIHl5c3RhdGUsICQkLCBfJCkge1xuICAgICAgdmFyICQwID0gJCQubGVuZ3RoIC0gMTtcbiAgICAgIHN3aXRjaCAoeXlzdGF0ZSkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICB0aGlzLiQgPSBbXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICQkWyQwIC0gMV0ucHVzaCgkJFskMF0pO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgY2FzZSA1OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgdGhpcy4kID0gW107XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgODpcbiAgICAgICAgICB5eS5hZGRFbnRpdHkoJCRbJDAgLSA0XSk7XG4gICAgICAgICAgeXkuYWRkRW50aXR5KCQkWyQwIC0gMl0pO1xuICAgICAgICAgIHl5LmFkZFJlbGF0aW9uc2hpcCgkJFskMCAtIDRdLCAkJFskMF0sICQkWyQwIC0gMl0sICQkWyQwIC0gM10pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgeXkuYWRkRW50aXR5KCQkWyQwIC0gOF0pO1xuICAgICAgICAgIHl5LmFkZEVudGl0eSgkJFskMCAtIDRdKTtcbiAgICAgICAgICB5eS5hZGRSZWxhdGlvbnNoaXAoJCRbJDAgLSA4XSwgJCRbJDBdLCAkJFskMCAtIDRdLCAkJFskMCAtIDVdKTtcbiAgICAgICAgICB5eS5zZXRDbGFzcyhbJCRbJDAgLSA4XV0sICQkWyQwIC0gNl0pO1xuICAgICAgICAgIHl5LnNldENsYXNzKFskJFskMCAtIDRdXSwgJCRbJDAgLSAyXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgeXkuYWRkRW50aXR5KCQkWyQwIC0gNl0pO1xuICAgICAgICAgIHl5LmFkZEVudGl0eSgkJFskMCAtIDJdKTtcbiAgICAgICAgICB5eS5hZGRSZWxhdGlvbnNoaXAoJCRbJDAgLSA2XSwgJCRbJDBdLCAkJFskMCAtIDJdLCAkJFskMCAtIDNdKTtcbiAgICAgICAgICB5eS5zZXRDbGFzcyhbJCRbJDAgLSA2XV0sICQkWyQwIC0gNF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDExOlxuICAgICAgICAgIHl5LmFkZEVudGl0eSgkJFskMCAtIDZdKTtcbiAgICAgICAgICB5eS5hZGRFbnRpdHkoJCRbJDAgLSA0XSk7XG4gICAgICAgICAgeXkuYWRkUmVsYXRpb25zaGlwKCQkWyQwIC0gNl0sICQkWyQwXSwgJCRbJDAgLSA0XSwgJCRbJDAgLSA1XSk7XG4gICAgICAgICAgeXkuc2V0Q2xhc3MoWyQkWyQwIC0gNF1dLCAkJFskMCAtIDJdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICB5eS5hZGRFbnRpdHkoJCRbJDAgLSAzXSk7XG4gICAgICAgICAgeXkuYWRkQXR0cmlidXRlcygkJFskMCAtIDNdLCAkJFskMCAtIDFdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICB5eS5hZGRFbnRpdHkoJCRbJDAgLSA1XSk7XG4gICAgICAgICAgeXkuYWRkQXR0cmlidXRlcygkJFskMCAtIDVdLCAkJFskMCAtIDFdKTtcbiAgICAgICAgICB5eS5zZXRDbGFzcyhbJCRbJDAgLSA1XV0sICQkWyQwIC0gM10pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgIHl5LmFkZEVudGl0eSgkJFskMCAtIDJdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNTpcbiAgICAgICAgICB5eS5hZGRFbnRpdHkoJCRbJDAgLSA0XSk7XG4gICAgICAgICAgeXkuc2V0Q2xhc3MoWyQkWyQwIC0gNF1dLCAkJFskMCAtIDJdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICB5eS5hZGRFbnRpdHkoJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNzpcbiAgICAgICAgICB5eS5hZGRFbnRpdHkoJCRbJDAgLSAyXSk7XG4gICAgICAgICAgeXkuc2V0Q2xhc3MoWyQkWyQwIC0gMl1dLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE4OlxuICAgICAgICAgIHl5LmFkZEVudGl0eSgkJFskMCAtIDZdLCAkJFskMCAtIDRdKTtcbiAgICAgICAgICB5eS5hZGRBdHRyaWJ1dGVzKCQkWyQwIC0gNl0sICQkWyQwIC0gMV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE5OlxuICAgICAgICAgIHl5LmFkZEVudGl0eSgkJFskMCAtIDhdLCAkJFskMCAtIDZdKTtcbiAgICAgICAgICB5eS5hZGRBdHRyaWJ1dGVzKCQkWyQwIC0gOF0sICQkWyQwIC0gMV0pO1xuICAgICAgICAgIHl5LnNldENsYXNzKFskJFskMCAtIDhdXSwgJCRbJDAgLSAzXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgeXkuYWRkRW50aXR5KCQkWyQwIC0gNV0sICQkWyQwIC0gM10pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDIxOlxuICAgICAgICAgIHl5LmFkZEVudGl0eSgkJFskMCAtIDddLCAkJFskMCAtIDVdKTtcbiAgICAgICAgICB5eS5zZXRDbGFzcyhbJCRbJDAgLSA3XV0sICQkWyQwIC0gMl0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDIyOlxuICAgICAgICAgIHl5LmFkZEVudGl0eSgkJFskMCAtIDNdLCAkJFskMCAtIDFdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyMzpcbiAgICAgICAgICB5eS5hZGRFbnRpdHkoJCRbJDAgLSA1XSwgJCRbJDAgLSAzXSk7XG4gICAgICAgICAgeXkuc2V0Q2xhc3MoWyQkWyQwIC0gNV1dLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI0OlxuICAgICAgICBjYXNlIDI1OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS50cmltKCk7XG4gICAgICAgICAgeXkuc2V0QWNjVGl0bGUodGhpcy4kKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyNjpcbiAgICAgICAgY2FzZSAyNzpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF0udHJpbSgpO1xuICAgICAgICAgIHl5LnNldEFjY0Rlc2NyaXB0aW9uKHRoaXMuJCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzI6XG4gICAgICAgICAgeXkuc2V0RGlyZWN0aW9uKFwiVEJcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzM6XG4gICAgICAgICAgeXkuc2V0RGlyZWN0aW9uKFwiQlRcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzQ6XG4gICAgICAgICAgeXkuc2V0RGlyZWN0aW9uKFwiUkxcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzU6XG4gICAgICAgICAgeXkuc2V0RGlyZWN0aW9uKFwiTFJcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzY6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAzXTtcbiAgICAgICAgICB5eS5hZGRDbGFzcygkJFskMCAtIDJdLCAkJFskMCAtIDFdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgY2FzZSAzODpcbiAgICAgICAgY2FzZSA1OTpcbiAgICAgICAgY2FzZSA2NzpcbiAgICAgICAgICB0aGlzLiQgPSBbJCRbJDBdXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOTpcbiAgICAgICAgY2FzZSA0MDpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDJdLmNvbmNhdChbJCRbJDBdXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDE6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAyXTtcbiAgICAgICAgICB5eS5zZXRDbGFzcygkJFskMCAtIDFdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQyOlxuICAgICAgICAgIDtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDNdO1xuICAgICAgICAgIHl5LmFkZENzc1N0eWxlcygkJFskMCAtIDJdLCAkJFskMCAtIDFdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0MzpcbiAgICAgICAgICB0aGlzLiQgPSBbJCRbJDBdXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0NDpcbiAgICAgICAgICAkJFskMCAtIDJdLnB1c2goJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDJdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ2OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMV0gKyAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTQ6XG4gICAgICAgIGNhc2UgNzk6XG4gICAgICAgIGNhc2UgODA6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdLnJlcGxhY2UoL1wiL2csIFwiXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU1OlxuICAgICAgICBjYXNlIDU2OlxuICAgICAgICBjYXNlIDU3OlxuICAgICAgICBjYXNlIDU4OlxuICAgICAgICBjYXNlIDgxOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2MDpcbiAgICAgICAgICAkJFskMF0ucHVzaCgkJFskMCAtIDFdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjE6XG4gICAgICAgICAgdGhpcy4kID0geyB0eXBlOiAkJFskMCAtIDFdLCBuYW1lOiAkJFskMF0gfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2MjpcbiAgICAgICAgICB0aGlzLiQgPSB7IHR5cGU6ICQkWyQwIC0gMl0sIG5hbWU6ICQkWyQwIC0gMV0sIGtleXM6ICQkWyQwXSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDYzOlxuICAgICAgICAgIHRoaXMuJCA9IHsgdHlwZTogJCRbJDAgLSAyXSwgbmFtZTogJCRbJDAgLSAxXSwgY29tbWVudDogJCRbJDBdIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjQ6XG4gICAgICAgICAgdGhpcy4kID0geyB0eXBlOiAkJFskMCAtIDNdLCBuYW1lOiAkJFskMCAtIDJdLCBrZXlzOiAkJFskMCAtIDFdLCBjb21tZW50OiAkJFskMF0gfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2NTpcbiAgICAgICAgY2FzZSA2NjpcbiAgICAgICAgY2FzZSA2OTpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjg6XG4gICAgICAgICAgJCRbJDAgLSAyXS5wdXNoKCQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAyXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA3MDpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF0ucmVwbGFjZSgvXCIvZywgXCJcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzE6XG4gICAgICAgICAgdGhpcy4kID0geyBjYXJkQTogJCRbJDBdLCByZWxUeXBlOiAkJFskMCAtIDFdLCBjYXJkQjogJCRbJDAgLSAyXSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDcyOlxuICAgICAgICAgIHRoaXMuJCA9IHl5LkNhcmRpbmFsaXR5LlpFUk9fT1JfT05FO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDczOlxuICAgICAgICAgIHRoaXMuJCA9IHl5LkNhcmRpbmFsaXR5LlpFUk9fT1JfTU9SRTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA3NDpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5DYXJkaW5hbGl0eS5PTkVfT1JfTU9SRTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA3NTpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5DYXJkaW5hbGl0eS5PTkxZX09ORTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA3NjpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5DYXJkaW5hbGl0eS5NRF9QQVJFTlQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzc6XG4gICAgICAgICAgdGhpcy4kID0geXkuSWRlbnRpZmljYXRpb24uTk9OX0lERU5USUZZSU5HO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc4OlxuICAgICAgICAgIHRoaXMuJCA9IHl5LklkZW50aWZpY2F0aW9uLklERU5USUZZSU5HO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0sIFwiYW5vbnltb3VzXCIpLFxuICAgIHRhYmxlOiBbeyAzOiAxLCA0OiBbMSwgMl0gfSwgeyAxOiBbM10gfSwgbygkVjAsIFsyLCAyXSwgeyA1OiAzIH0pLCB7IDY6IFsxLCA0XSwgNzogNSwgODogWzEsIDZdLCA5OiA3LCAxMDogWzEsIDhdLCAxMTogOSwgMjI6ICRWMSwgMjQ6ICRWMiwgMjY6ICRWMywgMjg6ICRWNCwgMjk6IDE0LCAzMDogMTUsIDMxOiAxNiwgMzI6IDE3LCAzMzogJFY1LCAzNDogJFY2LCAzNTogJFY3LCAzNjogJFY4LCAzNzogJFY5LCA0MDogJFZhLCA0MzogJFZiLCA0NDogJFZjLCA0ODogJFZkLCA1MDogJFZlLCA1MTogJFZmLCA1MjogJFZnIH0sIG8oJFYwLCBbMiwgN10sIHsgMTogWzIsIDFdIH0pLCBvKCRWMCwgWzIsIDNdKSwgeyA5OiAzMCwgMTE6IDksIDIyOiAkVjEsIDI0OiAkVjIsIDI2OiAkVjMsIDI4OiAkVjQsIDI5OiAxNCwgMzA6IDE1LCAzMTogMTYsIDMyOiAxNywgMzM6ICRWNSwgMzQ6ICRWNiwgMzU6ICRWNywgMzY6ICRWOCwgMzc6ICRWOSwgNDA6ICRWYSwgNDM6ICRWYiwgNDQ6ICRWYywgNDg6ICRWZCwgNTA6ICRWZSwgNTE6ICRWZiwgNTI6ICRWZyB9LCBvKCRWMCwgWzIsIDVdKSwgbygkVjAsIFsyLCA2XSksIG8oJFYwLCBbMiwgMTZdLCB7IDEyOiAzMSwgNjM6IDM1LCAxNTogWzEsIDMyXSwgMTc6IFsxLCAzM10sIDIwOiBbMSwgMzRdLCA2NTogJFZoLCA2NjogJFZpLCA2NzogJFZqLCA2ODogJFZrLCA2OTogJFZsIH0pLCB7IDIzOiBbMSwgNDFdIH0sIHsgMjU6IFsxLCA0Ml0gfSwgeyAyNzogWzEsIDQzXSB9LCBvKCRWMCwgWzIsIDI3XSksIG8oJFYwLCBbMiwgMjhdKSwgbygkVjAsIFsyLCAyOV0pLCBvKCRWMCwgWzIsIDMwXSksIG8oJFYwLCBbMiwgMzFdKSwgbygkVm0sIFsyLCA1NF0pLCBvKCRWbSwgWzIsIDU1XSksIG8oJFZtLCBbMiwgNTZdKSwgbygkVm0sIFsyLCA1N10pLCBvKCRWbSwgWzIsIDU4XSksIG8oJFYwLCBbMiwgMzJdKSwgbygkVjAsIFsyLCAzM10pLCBvKCRWMCwgWzIsIDM0XSksIG8oJFYwLCBbMiwgMzVdKSwgeyAxNjogNDQsIDQwOiAkVm4sIDQxOiAkVm8gfSwgeyAxNjogNDcsIDQwOiAkVm4sIDQxOiAkVm8gfSwgeyAxNjogNDgsIDQwOiAkVm4sIDQxOiAkVm8gfSwgbygkVjAsIFsyLCA0XSksIHsgMTE6IDQ5LCA0MDogJFZhLCA0ODogJFZkLCA1MDogJFZlLCA1MTogJFZmLCA1MjogJFZnIH0sIHsgMTY6IDUwLCA0MDogJFZuLCA0MTogJFZvIH0sIHsgMTg6IDUxLCAxOTogWzEsIDUyXSwgNTM6IDUzLCA1NDogNTQsIDU4OiAkVnAgfSwgeyAxMTogNTYsIDQwOiAkVmEsIDQ4OiAkVmQsIDUwOiAkVmUsIDUxOiAkVmYsIDUyOiAkVmcgfSwgeyA2NDogNTcsIDcwOiBbMSwgNThdLCA3MTogWzEsIDU5XSB9LCBvKCRWcSwgWzIsIDcyXSksIG8oJFZxLCBbMiwgNzNdKSwgbygkVnEsIFsyLCA3NF0pLCBvKCRWcSwgWzIsIDc1XSksIG8oJFZxLCBbMiwgNzZdKSwgbygkVjAsIFsyLCAyNF0pLCBvKCRWMCwgWzIsIDI1XSksIG8oJFYwLCBbMiwgMjZdKSwgeyAxMzogJFZyLCAzODogNjAsIDQxOiAkVnMsIDQyOiAkVnQsIDQ1OiA2MiwgNDY6IDYzLCA0ODogJFZ1LCA0OTogJFZ2IH0sIG8oJFZ3LCBbMiwgMzddKSwgbygkVncsIFsyLCAzOF0pLCB7IDE2OiA2OCwgNDA6ICRWbiwgNDE6ICRWbywgNDI6ICRWdCB9LCB7IDEzOiAkVnIsIDM4OiA2OSwgNDE6ICRWcywgNDI6ICRWdCwgNDU6IDYyLCA0NjogNjMsIDQ4OiAkVnUsIDQ5OiAkVnYgfSwgeyAxMzogWzEsIDcwXSwgMTU6IFsxLCA3MV0gfSwgbygkVjAsIFsyLCAxN10sIHsgNjM6IDM1LCAxMjogNzIsIDE3OiBbMSwgNzNdLCA0MjogJFZ0LCA2NTogJFZoLCA2NjogJFZpLCA2NzogJFZqLCA2ODogJFZrLCA2OTogJFZsIH0pLCB7IDE5OiBbMSwgNzRdIH0sIG8oJFYwLCBbMiwgMTRdKSwgeyAxODogNzUsIDE5OiBbMiwgNTldLCA1MzogNTMsIDU0OiA1NCwgNTg6ICRWcCB9LCB7IDU1OiA3NiwgNTg6IFsxLCA3N10gfSwgeyA1ODogWzIsIDY1XSB9LCB7IDIxOiBbMSwgNzhdIH0sIHsgNjM6IDc5LCA2NTogJFZoLCA2NjogJFZpLCA2NzogJFZqLCA2ODogJFZrLCA2OTogJFZsIH0sIG8oJFZ4LCBbMiwgNzddKSwgbygkVngsIFsyLCA3OF0pLCB7IDY6ICRWeSwgMTA6ICRWeiwgMzk6IDgwLCA0MjogJFZBLCA0NzogJFZCIH0sIHsgNDA6IFsxLCA4NV0sIDQxOiBbMSwgODZdIH0sIG8oJFZDLCBbMiwgNDNdLCB7IDQ2OiA4NywgMTM6ICRWciwgNDE6ICRWcywgNDg6ICRWdSwgNDk6ICRWdiB9KSwgbygkVkQsIFsyLCA0NV0pLCBvKCRWRCwgWzIsIDUwXSksIG8oJFZELCBbMiwgNTFdKSwgbygkVkQsIFsyLCA1Ml0pLCBvKCRWRCwgWzIsIDUzXSksIG8oJFYwLCBbMiwgNDFdLCB7IDQyOiAkVnQgfSksIHsgNjogJFZ5LCAxMDogJFZ6LCAzOTogODgsIDQyOiAkVkEsIDQ3OiAkVkIgfSwgeyAxNDogODksIDQwOiAkVkUsIDUwOiAkVkYsIDcyOiAkVkcgfSwgeyAxNjogOTMsIDQwOiAkVm4sIDQxOiAkVm8gfSwgeyAxMTogOTQsIDQwOiAkVmEsIDQ4OiAkVmQsIDUwOiAkVmUsIDUxOiAkVmYsIDUyOiAkVmcgfSwgeyAxODogOTUsIDE5OiBbMSwgOTZdLCA1MzogNTMsIDU0OiA1NCwgNTg6ICRWcCB9LCBvKCRWMCwgWzIsIDEyXSksIHsgMTk6IFsyLCA2MF0gfSwgbygkVkgsIFsyLCA2MV0sIHsgNTY6IDk3LCA1NzogOTgsIDU5OiA5OSwgNjE6ICRWSSwgNjI6ICRWSiB9KSwgbyhbMTksIDU4LCA2MSwgNjJdLCBbMiwgNjZdKSwgbygkVjAsIFsyLCAyMl0sIHsgMTU6IFsxLCAxMDNdLCAxNzogWzEsIDEwMl0gfSksIG8oWzQwLCA0OCwgNTAsIDUxLCA1Ml0sIFsyLCA3MV0pLCBvKCRWMCwgWzIsIDM2XSksIHsgMTM6ICRWciwgNDE6ICRWcywgNDU6IDEwNCwgNDY6IDYzLCA0ODogJFZ1LCA0OTogJFZ2IH0sIG8oJFYwLCBbMiwgNDddKSwgbygkVjAsIFsyLCA0OF0pLCBvKCRWMCwgWzIsIDQ5XSksIG8oJFZ3LCBbMiwgMzldKSwgbygkVncsIFsyLCA0MF0pLCBvKCRWRCwgWzIsIDQ2XSksIG8oJFYwLCBbMiwgNDJdKSwgbygkVjAsIFsyLCA4XSksIG8oJFYwLCBbMiwgNzldKSwgbygkVjAsIFsyLCA4MF0pLCBvKCRWMCwgWzIsIDgxXSksIHsgMTM6IFsxLCAxMDVdLCA0MjogJFZ0IH0sIHsgMTM6IFsxLCAxMDddLCAxNTogWzEsIDEwNl0gfSwgeyAxOTogWzEsIDEwOF0gfSwgbygkVjAsIFsyLCAxNV0pLCBvKCRWSCwgWzIsIDYyXSwgeyA1NzogMTA5LCA2MDogWzEsIDExMF0sIDYyOiAkVkogfSksIG8oJFZILCBbMiwgNjNdKSwgbygkVkssIFsyLCA2N10pLCBvKCRWSCwgWzIsIDcwXSksIG8oJFZLLCBbMiwgNjldKSwgeyAxODogMTExLCAxOTogWzEsIDExMl0sIDUzOiA1MywgNTQ6IDU0LCA1ODogJFZwIH0sIHsgMTY6IDExMywgNDA6ICRWbiwgNDE6ICRWbyB9LCBvKCRWQywgWzIsIDQ0XSwgeyA0NjogODcsIDEzOiAkVnIsIDQxOiAkVnMsIDQ4OiAkVnUsIDQ5OiAkVnYgfSksIHsgMTQ6IDExNCwgNDA6ICRWRSwgNTA6ICRWRiwgNzI6ICRWRyB9LCB7IDE2OiAxMTUsIDQwOiAkVm4sIDQxOiAkVm8gfSwgeyAxNDogMTE2LCA0MDogJFZFLCA1MDogJFZGLCA3MjogJFZHIH0sIG8oJFYwLCBbMiwgMTNdKSwgbygkVkgsIFsyLCA2NF0pLCB7IDU5OiAxMTcsIDYxOiAkVkkgfSwgeyAxOTogWzEsIDExOF0gfSwgbygkVjAsIFsyLCAyMF0pLCBvKCRWMCwgWzIsIDIzXSwgeyAxNzogWzEsIDExOV0sIDQyOiAkVnQgfSksIG8oJFYwLCBbMiwgMTFdKSwgeyAxMzogWzEsIDEyMF0sIDQyOiAkVnQgfSwgbygkVjAsIFsyLCAxMF0pLCBvKCRWSywgWzIsIDY4XSksIG8oJFYwLCBbMiwgMThdKSwgeyAxODogMTIxLCAxOTogWzEsIDEyMl0sIDUzOiA1MywgNTQ6IDU0LCA1ODogJFZwIH0sIHsgMTQ6IDEyMywgNDA6ICRWRSwgNTA6ICRWRiwgNzI6ICRWRyB9LCB7IDE5OiBbMSwgMTI0XSB9LCBvKCRWMCwgWzIsIDIxXSksIG8oJFYwLCBbMiwgOV0pLCBvKCRWMCwgWzIsIDE5XSldLFxuICAgIGRlZmF1bHRBY3Rpb25zOiB7IDU1OiBbMiwgNjVdLCA3NTogWzIsIDYwXSB9LFxuICAgIHBhcnNlRXJyb3I6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcGFyc2VFcnJvcihzdHIsIGhhc2gpIHtcbiAgICAgIGlmIChoYXNoLnJlY292ZXJhYmxlKSB7XG4gICAgICAgIHRoaXMudHJhY2Uoc3RyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcihzdHIpO1xuICAgICAgICBlcnJvci5oYXNoID0gaGFzaDtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSwgXCJwYXJzZUVycm9yXCIpLFxuICAgIHBhcnNlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBhcnNlKGlucHV0KSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsIHN0YWNrID0gWzBdLCB0c3RhY2sgPSBbXSwgdnN0YWNrID0gW251bGxdLCBsc3RhY2sgPSBbXSwgdGFibGUgPSB0aGlzLnRhYmxlLCB5eXRleHQgPSBcIlwiLCB5eWxpbmVubyA9IDAsIHl5bGVuZyA9IDAsIHJlY292ZXJpbmcgPSAwLCBURVJST1IgPSAyLCBFT0YgPSAxO1xuICAgICAgdmFyIGFyZ3MgPSBsc3RhY2suc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgdmFyIGxleGVyMiA9IE9iamVjdC5jcmVhdGUodGhpcy5sZXhlcik7XG4gICAgICB2YXIgc2hhcmVkU3RhdGUgPSB7IHl5OiB7fSB9O1xuICAgICAgZm9yICh2YXIgayBpbiB0aGlzLnl5KSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy55eSwgaykpIHtcbiAgICAgICAgICBzaGFyZWRTdGF0ZS55eVtrXSA9IHRoaXMueXlba107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxleGVyMi5zZXRJbnB1dChpbnB1dCwgc2hhcmVkU3RhdGUueXkpO1xuICAgICAgc2hhcmVkU3RhdGUueXkubGV4ZXIgPSBsZXhlcjI7XG4gICAgICBzaGFyZWRTdGF0ZS55eS5wYXJzZXIgPSB0aGlzO1xuICAgICAgaWYgKHR5cGVvZiBsZXhlcjIueXlsbG9jID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgbGV4ZXIyLnl5bGxvYyA9IHt9O1xuICAgICAgfVxuICAgICAgdmFyIHl5bG9jID0gbGV4ZXIyLnl5bGxvYztcbiAgICAgIGxzdGFjay5wdXNoKHl5bG9jKTtcbiAgICAgIHZhciByYW5nZXMgPSBsZXhlcjIub3B0aW9ucyAmJiBsZXhlcjIub3B0aW9ucy5yYW5nZXM7XG4gICAgICBpZiAodHlwZW9mIHNoYXJlZFN0YXRlLnl5LnBhcnNlRXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aGlzLnBhcnNlRXJyb3IgPSBzaGFyZWRTdGF0ZS55eS5wYXJzZUVycm9yO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wYXJzZUVycm9yID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpLnBhcnNlRXJyb3I7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBwb3BTdGFjayhuKSB7XG4gICAgICAgIHN0YWNrLmxlbmd0aCA9IHN0YWNrLmxlbmd0aCAtIDIgKiBuO1xuICAgICAgICB2c3RhY2subGVuZ3RoID0gdnN0YWNrLmxlbmd0aCAtIG47XG4gICAgICAgIGxzdGFjay5sZW5ndGggPSBsc3RhY2subGVuZ3RoIC0gbjtcbiAgICAgIH1cbiAgICAgIF9fbmFtZShwb3BTdGFjaywgXCJwb3BTdGFja1wiKTtcbiAgICAgIGZ1bmN0aW9uIGxleCgpIHtcbiAgICAgICAgdmFyIHRva2VuO1xuICAgICAgICB0b2tlbiA9IHRzdGFjay5wb3AoKSB8fCBsZXhlcjIubGV4KCkgfHwgRU9GO1xuICAgICAgICBpZiAodHlwZW9mIHRva2VuICE9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgaWYgKHRva2VuIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIHRzdGFjayA9IHRva2VuO1xuICAgICAgICAgICAgdG9rZW4gPSB0c3RhY2sucG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRva2VuID0gc2VsZi5zeW1ib2xzX1t0b2tlbl0gfHwgdG9rZW47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgfVxuICAgICAgX19uYW1lKGxleCwgXCJsZXhcIik7XG4gICAgICB2YXIgc3ltYm9sLCBwcmVFcnJvclN5bWJvbCwgc3RhdGUsIGFjdGlvbiwgYSwgciwgeXl2YWwgPSB7fSwgcCwgbGVuLCBuZXdTdGF0ZSwgZXhwZWN0ZWQ7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBzdGF0ZSA9IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAodGhpcy5kZWZhdWx0QWN0aW9uc1tzdGF0ZV0pIHtcbiAgICAgICAgICBhY3Rpb24gPSB0aGlzLmRlZmF1bHRBY3Rpb25zW3N0YXRlXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoc3ltYm9sID09PSBudWxsIHx8IHR5cGVvZiBzeW1ib2wgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgc3ltYm9sID0gbGV4KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFjdGlvbiA9IHRhYmxlW3N0YXRlXSAmJiB0YWJsZVtzdGF0ZV1bc3ltYm9sXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGFjdGlvbiA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhYWN0aW9uLmxlbmd0aCB8fCAhYWN0aW9uWzBdKSB7XG4gICAgICAgICAgdmFyIGVyclN0ciA9IFwiXCI7XG4gICAgICAgICAgZXhwZWN0ZWQgPSBbXTtcbiAgICAgICAgICBmb3IgKHAgaW4gdGFibGVbc3RhdGVdKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50ZXJtaW5hbHNfW3BdICYmIHAgPiBURVJST1IpIHtcbiAgICAgICAgICAgICAgZXhwZWN0ZWQucHVzaChcIidcIiArIHRoaXMudGVybWluYWxzX1twXSArIFwiJ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGxleGVyMi5zaG93UG9zaXRpb24pIHtcbiAgICAgICAgICAgIGVyclN0ciA9IFwiUGFyc2UgZXJyb3Igb24gbGluZSBcIiArICh5eWxpbmVubyArIDEpICsgXCI6XFxuXCIgKyBsZXhlcjIuc2hvd1Bvc2l0aW9uKCkgKyBcIlxcbkV4cGVjdGluZyBcIiArIGV4cGVjdGVkLmpvaW4oXCIsIFwiKSArIFwiLCBnb3QgJ1wiICsgKHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCkgKyBcIidcIjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyU3RyID0gXCJQYXJzZSBlcnJvciBvbiBsaW5lIFwiICsgKHl5bGluZW5vICsgMSkgKyBcIjogVW5leHBlY3RlZCBcIiArIChzeW1ib2wgPT0gRU9GID8gXCJlbmQgb2YgaW5wdXRcIiA6IFwiJ1wiICsgKHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCkgKyBcIidcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMucGFyc2VFcnJvcihlcnJTdHIsIHtcbiAgICAgICAgICAgIHRleHQ6IGxleGVyMi5tYXRjaCxcbiAgICAgICAgICAgIHRva2VuOiB0aGlzLnRlcm1pbmFsc19bc3ltYm9sXSB8fCBzeW1ib2wsXG4gICAgICAgICAgICBsaW5lOiBsZXhlcjIueXlsaW5lbm8sXG4gICAgICAgICAgICBsb2M6IHl5bG9jLFxuICAgICAgICAgICAgZXhwZWN0ZWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYWN0aW9uWzBdIGluc3RhbmNlb2YgQXJyYXkgJiYgYWN0aW9uLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZSBFcnJvcjogbXVsdGlwbGUgYWN0aW9ucyBwb3NzaWJsZSBhdCBzdGF0ZTogXCIgKyBzdGF0ZSArIFwiLCB0b2tlbjogXCIgKyBzeW1ib2wpO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAoYWN0aW9uWzBdKSB7XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgc3RhY2sucHVzaChzeW1ib2wpO1xuICAgICAgICAgICAgdnN0YWNrLnB1c2gobGV4ZXIyLnl5dGV4dCk7XG4gICAgICAgICAgICBsc3RhY2sucHVzaChsZXhlcjIueXlsbG9jKTtcbiAgICAgICAgICAgIHN0YWNrLnB1c2goYWN0aW9uWzFdKTtcbiAgICAgICAgICAgIHN5bWJvbCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoIXByZUVycm9yU3ltYm9sKSB7XG4gICAgICAgICAgICAgIHl5bGVuZyA9IGxleGVyMi55eWxlbmc7XG4gICAgICAgICAgICAgIHl5dGV4dCA9IGxleGVyMi55eXRleHQ7XG4gICAgICAgICAgICAgIHl5bGluZW5vID0gbGV4ZXIyLnl5bGluZW5vO1xuICAgICAgICAgICAgICB5eWxvYyA9IGxleGVyMi55eWxsb2M7XG4gICAgICAgICAgICAgIGlmIChyZWNvdmVyaW5nID4gMCkge1xuICAgICAgICAgICAgICAgIHJlY292ZXJpbmctLTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3ltYm9sID0gcHJlRXJyb3JTeW1ib2w7XG4gICAgICAgICAgICAgIHByZUVycm9yU3ltYm9sID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGxlbiA9IHRoaXMucHJvZHVjdGlvbnNfW2FjdGlvblsxXV1bMV07XG4gICAgICAgICAgICB5eXZhbC4kID0gdnN0YWNrW3ZzdGFjay5sZW5ndGggLSBsZW5dO1xuICAgICAgICAgICAgeXl2YWwuXyQgPSB7XG4gICAgICAgICAgICAgIGZpcnN0X2xpbmU6IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0uZmlyc3RfbGluZSxcbiAgICAgICAgICAgICAgbGFzdF9saW5lOiBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIDFdLmxhc3RfbGluZSxcbiAgICAgICAgICAgICAgZmlyc3RfY29sdW1uOiBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIChsZW4gfHwgMSldLmZpcnN0X2NvbHVtbixcbiAgICAgICAgICAgICAgbGFzdF9jb2x1bW46IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gMV0ubGFzdF9jb2x1bW5cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAocmFuZ2VzKSB7XG4gICAgICAgICAgICAgIHl5dmFsLl8kLnJhbmdlID0gW1xuICAgICAgICAgICAgICAgIGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0ucmFuZ2VbMF0sXG4gICAgICAgICAgICAgICAgbHN0YWNrW2xzdGFjay5sZW5ndGggLSAxXS5yYW5nZVsxXVxuICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgciA9IHRoaXMucGVyZm9ybUFjdGlvbi5hcHBseSh5eXZhbCwgW1xuICAgICAgICAgICAgICB5eXRleHQsXG4gICAgICAgICAgICAgIHl5bGVuZyxcbiAgICAgICAgICAgICAgeXlsaW5lbm8sXG4gICAgICAgICAgICAgIHNoYXJlZFN0YXRlLnl5LFxuICAgICAgICAgICAgICBhY3Rpb25bMV0sXG4gICAgICAgICAgICAgIHZzdGFjayxcbiAgICAgICAgICAgICAgbHN0YWNrXG4gICAgICAgICAgICBdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGVuKSB7XG4gICAgICAgICAgICAgIHN0YWNrID0gc3RhY2suc2xpY2UoMCwgLTEgKiBsZW4gKiAyKTtcbiAgICAgICAgICAgICAgdnN0YWNrID0gdnN0YWNrLnNsaWNlKDAsIC0xICogbGVuKTtcbiAgICAgICAgICAgICAgbHN0YWNrID0gbHN0YWNrLnNsaWNlKDAsIC0xICogbGVuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0YWNrLnB1c2godGhpcy5wcm9kdWN0aW9uc19bYWN0aW9uWzFdXVswXSk7XG4gICAgICAgICAgICB2c3RhY2sucHVzaCh5eXZhbC4kKTtcbiAgICAgICAgICAgIGxzdGFjay5wdXNoKHl5dmFsLl8kKTtcbiAgICAgICAgICAgIG5ld1N0YXRlID0gdGFibGVbc3RhY2tbc3RhY2subGVuZ3RoIC0gMl1dW3N0YWNrW3N0YWNrLmxlbmd0aCAtIDFdXTtcbiAgICAgICAgICAgIHN0YWNrLnB1c2gobmV3U3RhdGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sIFwicGFyc2VcIilcbiAgfTtcbiAgdmFyIGxleGVyID0gLyogQF9fUFVSRV9fICovIChmdW5jdGlvbigpIHtcbiAgICB2YXIgbGV4ZXIyID0ge1xuICAgICAgRU9GOiAxLFxuICAgICAgcGFyc2VFcnJvcjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwYXJzZUVycm9yKHN0ciwgaGFzaCkge1xuICAgICAgICBpZiAodGhpcy55eS5wYXJzZXIpIHtcbiAgICAgICAgICB0aGlzLnl5LnBhcnNlci5wYXJzZUVycm9yKHN0ciwgaGFzaCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHN0cik7XG4gICAgICAgIH1cbiAgICAgIH0sIFwicGFyc2VFcnJvclwiKSxcbiAgICAgIC8vIHJlc2V0cyB0aGUgbGV4ZXIsIHNldHMgbmV3IGlucHV0XG4gICAgICBzZXRJbnB1dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihpbnB1dCwgeXkpIHtcbiAgICAgICAgdGhpcy55eSA9IHl5IHx8IHRoaXMueXkgfHwge307XG4gICAgICAgIHRoaXMuX2lucHV0ID0gaW5wdXQ7XG4gICAgICAgIHRoaXMuX21vcmUgPSB0aGlzLl9iYWNrdHJhY2sgPSB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy55eWxpbmVubyA9IHRoaXMueXlsZW5nID0gMDtcbiAgICAgICAgdGhpcy55eXRleHQgPSB0aGlzLm1hdGNoZWQgPSB0aGlzLm1hdGNoID0gXCJcIjtcbiAgICAgICAgdGhpcy5jb25kaXRpb25TdGFjayA9IFtcIklOSVRJQUxcIl07XG4gICAgICAgIHRoaXMueXlsbG9jID0ge1xuICAgICAgICAgIGZpcnN0X2xpbmU6IDEsXG4gICAgICAgICAgZmlyc3RfY29sdW1uOiAwLFxuICAgICAgICAgIGxhc3RfbGluZTogMSxcbiAgICAgICAgICBsYXN0X2NvbHVtbjogMFxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlID0gWzAsIDBdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub2Zmc2V0ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcInNldElucHV0XCIpLFxuICAgICAgLy8gY29uc3VtZXMgYW5kIHJldHVybnMgb25lIGNoYXIgZnJvbSB0aGUgaW5wdXRcbiAgICAgIGlucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2ggPSB0aGlzLl9pbnB1dFswXTtcbiAgICAgICAgdGhpcy55eXRleHQgKz0gY2g7XG4gICAgICAgIHRoaXMueXlsZW5nKys7XG4gICAgICAgIHRoaXMub2Zmc2V0Kys7XG4gICAgICAgIHRoaXMubWF0Y2ggKz0gY2g7XG4gICAgICAgIHRoaXMubWF0Y2hlZCArPSBjaDtcbiAgICAgICAgdmFyIGxpbmVzID0gY2gubWF0Y2goLyg/Olxcclxcbj98XFxuKS4qL2cpO1xuICAgICAgICBpZiAobGluZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGluZW5vKys7XG4gICAgICAgICAgdGhpcy55eWxsb2MubGFzdF9saW5lKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MubGFzdF9jb2x1bW4rKztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlWzFdKys7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faW5wdXQgPSB0aGlzLl9pbnB1dC5zbGljZSgxKTtcbiAgICAgICAgcmV0dXJuIGNoO1xuICAgICAgfSwgXCJpbnB1dFwiKSxcbiAgICAgIC8vIHVuc2hpZnRzIG9uZSBjaGFyIChvciBhIHN0cmluZykgaW50byB0aGUgaW5wdXRcbiAgICAgIHVucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGNoKSB7XG4gICAgICAgIHZhciBsZW4gPSBjaC5sZW5ndGg7XG4gICAgICAgIHZhciBsaW5lcyA9IGNoLnNwbGl0KC8oPzpcXHJcXG4/fFxcbikvZyk7XG4gICAgICAgIHRoaXMuX2lucHV0ID0gY2ggKyB0aGlzLl9pbnB1dDtcbiAgICAgICAgdGhpcy55eXRleHQgPSB0aGlzLnl5dGV4dC5zdWJzdHIoMCwgdGhpcy55eXRleHQubGVuZ3RoIC0gbGVuKTtcbiAgICAgICAgdGhpcy5vZmZzZXQgLT0gbGVuO1xuICAgICAgICB2YXIgb2xkTGluZXMgPSB0aGlzLm1hdGNoLnNwbGl0KC8oPzpcXHJcXG4/fFxcbikvZyk7XG4gICAgICAgIHRoaXMubWF0Y2ggPSB0aGlzLm1hdGNoLnN1YnN0cigwLCB0aGlzLm1hdGNoLmxlbmd0aCAtIDEpO1xuICAgICAgICB0aGlzLm1hdGNoZWQgPSB0aGlzLm1hdGNoZWQuc3Vic3RyKDAsIHRoaXMubWF0Y2hlZC5sZW5ndGggLSAxKTtcbiAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICB0aGlzLnl5bGluZW5vIC09IGxpbmVzLmxlbmd0aCAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHIgPSB0aGlzLnl5bGxvYy5yYW5nZTtcbiAgICAgICAgdGhpcy55eWxsb2MgPSB7XG4gICAgICAgICAgZmlyc3RfbGluZTogdGhpcy55eWxsb2MuZmlyc3RfbGluZSxcbiAgICAgICAgICBsYXN0X2xpbmU6IHRoaXMueXlsaW5lbm8gKyAxLFxuICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uLFxuICAgICAgICAgIGxhc3RfY29sdW1uOiBsaW5lcyA/IChsaW5lcy5sZW5ndGggPT09IG9sZExpbmVzLmxlbmd0aCA/IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbiA6IDApICsgb2xkTGluZXNbb2xkTGluZXMubGVuZ3RoIC0gbGluZXMubGVuZ3RoXS5sZW5ndGggLSBsaW5lc1swXS5sZW5ndGggOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4gLSBsZW5cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZSA9IFtyWzBdLCByWzBdICsgdGhpcy55eWxlbmcgLSBsZW5dO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueXlsZW5nID0gdGhpcy55eXRleHQubGVuZ3RoO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwidW5wdXRcIiksXG4gICAgICAvLyBXaGVuIGNhbGxlZCBmcm9tIGFjdGlvbiwgY2FjaGVzIG1hdGNoZWQgdGV4dCBhbmQgYXBwZW5kcyBpdCBvbiBuZXh0IGFjdGlvblxuICAgICAgbW9yZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fbW9yZSA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJtb3JlXCIpLFxuICAgICAgLy8gV2hlbiBjYWxsZWQgZnJvbSBhY3Rpb24sIHNpZ25hbHMgdGhlIGxleGVyIHRoYXQgdGhpcyBydWxlIGZhaWxzIHRvIG1hdGNoIHRoZSBpbnB1dCwgc28gdGhlIG5leHQgbWF0Y2hpbmcgcnVsZSAocmVnZXgpIHNob3VsZCBiZSB0ZXN0ZWQgaW5zdGVhZC5cbiAgICAgIHJlamVjdDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIpIHtcbiAgICAgICAgICB0aGlzLl9iYWNrdHJhY2sgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRXJyb3IoXCJMZXhpY2FsIGVycm9yIG9uIGxpbmUgXCIgKyAodGhpcy55eWxpbmVubyArIDEpICsgXCIuIFlvdSBjYW4gb25seSBpbnZva2UgcmVqZWN0KCkgaW4gdGhlIGxleGVyIHdoZW4gdGhlIGxleGVyIGlzIG9mIHRoZSBiYWNrdHJhY2tpbmcgcGVyc3Vhc2lvbiAob3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIgPSB0cnVlKS5cXG5cIiArIHRoaXMuc2hvd1Bvc2l0aW9uKCksIHtcbiAgICAgICAgICAgIHRleHQ6IFwiXCIsXG4gICAgICAgICAgICB0b2tlbjogbnVsbCxcbiAgICAgICAgICAgIGxpbmU6IHRoaXMueXlsaW5lbm9cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwicmVqZWN0XCIpLFxuICAgICAgLy8gcmV0YWluIGZpcnN0IG4gY2hhcmFjdGVycyBvZiB0aGUgbWF0Y2hcbiAgICAgIGxlc3M6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obikge1xuICAgICAgICB0aGlzLnVucHV0KHRoaXMubWF0Y2guc2xpY2UobikpO1xuICAgICAgfSwgXCJsZXNzXCIpLFxuICAgICAgLy8gZGlzcGxheXMgYWxyZWFkeSBtYXRjaGVkIGlucHV0LCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgcGFzdElucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGFzdCA9IHRoaXMubWF0Y2hlZC5zdWJzdHIoMCwgdGhpcy5tYXRjaGVkLmxlbmd0aCAtIHRoaXMubWF0Y2gubGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuIChwYXN0Lmxlbmd0aCA+IDIwID8gXCIuLi5cIiA6IFwiXCIpICsgcGFzdC5zdWJzdHIoLTIwKS5yZXBsYWNlKC9cXG4vZywgXCJcIik7XG4gICAgICB9LCBcInBhc3RJbnB1dFwiKSxcbiAgICAgIC8vIGRpc3BsYXlzIHVwY29taW5nIGlucHV0LCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgdXBjb21pbmdJbnB1dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG5leHQgPSB0aGlzLm1hdGNoO1xuICAgICAgICBpZiAobmV4dC5sZW5ndGggPCAyMCkge1xuICAgICAgICAgIG5leHQgKz0gdGhpcy5faW5wdXQuc3Vic3RyKDAsIDIwIC0gbmV4dC5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAobmV4dC5zdWJzdHIoMCwgMjApICsgKG5leHQubGVuZ3RoID4gMjAgPyBcIi4uLlwiIDogXCJcIikpLnJlcGxhY2UoL1xcbi9nLCBcIlwiKTtcbiAgICAgIH0sIFwidXBjb21pbmdJbnB1dFwiKSxcbiAgICAgIC8vIGRpc3BsYXlzIHRoZSBjaGFyYWN0ZXIgcG9zaXRpb24gd2hlcmUgdGhlIGxleGluZyBlcnJvciBvY2N1cnJlZCwgaS5lLiBmb3IgZXJyb3IgbWVzc2FnZXNcbiAgICAgIHNob3dQb3NpdGlvbjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHByZSA9IHRoaXMucGFzdElucHV0KCk7XG4gICAgICAgIHZhciBjID0gbmV3IEFycmF5KHByZS5sZW5ndGggKyAxKS5qb2luKFwiLVwiKTtcbiAgICAgICAgcmV0dXJuIHByZSArIHRoaXMudXBjb21pbmdJbnB1dCgpICsgXCJcXG5cIiArIGMgKyBcIl5cIjtcbiAgICAgIH0sIFwic2hvd1Bvc2l0aW9uXCIpLFxuICAgICAgLy8gdGVzdCB0aGUgbGV4ZWQgdG9rZW46IHJldHVybiBGQUxTRSB3aGVuIG5vdCBhIG1hdGNoLCBvdGhlcndpc2UgcmV0dXJuIHRva2VuXG4gICAgICB0ZXN0X21hdGNoOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKG1hdGNoLCBpbmRleGVkX3J1bGUpIHtcbiAgICAgICAgdmFyIHRva2VuLCBsaW5lcywgYmFja3VwO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2t0cmFja19sZXhlcikge1xuICAgICAgICAgIGJhY2t1cCA9IHtcbiAgICAgICAgICAgIHl5bGluZW5vOiB0aGlzLnl5bGluZW5vLFxuICAgICAgICAgICAgeXlsbG9jOiB7XG4gICAgICAgICAgICAgIGZpcnN0X2xpbmU6IHRoaXMueXlsbG9jLmZpcnN0X2xpbmUsXG4gICAgICAgICAgICAgIGxhc3RfbGluZTogdGhpcy5sYXN0X2xpbmUsXG4gICAgICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uLFxuICAgICAgICAgICAgICBsYXN0X2NvbHVtbjogdGhpcy55eWxsb2MubGFzdF9jb2x1bW5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB5eXRleHQ6IHRoaXMueXl0ZXh0LFxuICAgICAgICAgICAgbWF0Y2g6IHRoaXMubWF0Y2gsXG4gICAgICAgICAgICBtYXRjaGVzOiB0aGlzLm1hdGNoZXMsXG4gICAgICAgICAgICBtYXRjaGVkOiB0aGlzLm1hdGNoZWQsXG4gICAgICAgICAgICB5eWxlbmc6IHRoaXMueXlsZW5nLFxuICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgIF9tb3JlOiB0aGlzLl9tb3JlLFxuICAgICAgICAgICAgX2lucHV0OiB0aGlzLl9pbnB1dCxcbiAgICAgICAgICAgIHl5OiB0aGlzLnl5LFxuICAgICAgICAgICAgY29uZGl0aW9uU3RhY2s6IHRoaXMuY29uZGl0aW9uU3RhY2suc2xpY2UoMCksXG4gICAgICAgICAgICBkb25lOiB0aGlzLmRvbmVcbiAgICAgICAgICB9O1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgICBiYWNrdXAueXlsbG9jLnJhbmdlID0gdGhpcy55eWxsb2MucmFuZ2Uuc2xpY2UoMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxpbmVzID0gbWF0Y2hbMF0ubWF0Y2goLyg/Olxcclxcbj98XFxuKS4qL2cpO1xuICAgICAgICBpZiAobGluZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGluZW5vICs9IGxpbmVzLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnl5bGxvYyA9IHtcbiAgICAgICAgICBmaXJzdF9saW5lOiB0aGlzLnl5bGxvYy5sYXN0X2xpbmUsXG4gICAgICAgICAgbGFzdF9saW5lOiB0aGlzLnl5bGluZW5vICsgMSxcbiAgICAgICAgICBmaXJzdF9jb2x1bW46IHRoaXMueXlsbG9jLmxhc3RfY29sdW1uLFxuICAgICAgICAgIGxhc3RfY29sdW1uOiBsaW5lcyA/IGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdLmxlbmd0aCAtIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdLm1hdGNoKC9cXHI/XFxuPy8pWzBdLmxlbmd0aCA6IHRoaXMueXlsbG9jLmxhc3RfY29sdW1uICsgbWF0Y2hbMF0ubGVuZ3RoXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMueXl0ZXh0ICs9IG1hdGNoWzBdO1xuICAgICAgICB0aGlzLm1hdGNoICs9IG1hdGNoWzBdO1xuICAgICAgICB0aGlzLm1hdGNoZXMgPSBtYXRjaDtcbiAgICAgICAgdGhpcy55eWxlbmcgPSB0aGlzLnl5dGV4dC5sZW5ndGg7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2UgPSBbdGhpcy5vZmZzZXQsIHRoaXMub2Zmc2V0ICs9IHRoaXMueXlsZW5nXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9tb3JlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2JhY2t0cmFjayA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9pbnB1dCA9IHRoaXMuX2lucHV0LnNsaWNlKG1hdGNoWzBdLmxlbmd0aCk7XG4gICAgICAgIHRoaXMubWF0Y2hlZCArPSBtYXRjaFswXTtcbiAgICAgICAgdG9rZW4gPSB0aGlzLnBlcmZvcm1BY3Rpb24uY2FsbCh0aGlzLCB0aGlzLnl5LCB0aGlzLCBpbmRleGVkX3J1bGUsIHRoaXMuY29uZGl0aW9uU3RhY2tbdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxXSk7XG4gICAgICAgIGlmICh0aGlzLmRvbmUgJiYgdGhpcy5faW5wdXQpIHtcbiAgICAgICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmFja3RyYWNrKSB7XG4gICAgICAgICAgZm9yICh2YXIgayBpbiBiYWNrdXApIHtcbiAgICAgICAgICAgIHRoaXNba10gPSBiYWNrdXBba107XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LCBcInRlc3RfbWF0Y2hcIiksXG4gICAgICAvLyByZXR1cm4gbmV4dCBtYXRjaCBpbiBpbnB1dFxuICAgICAgbmV4dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLkVPRjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2lucHV0KSB7XG4gICAgICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdG9rZW4sIG1hdGNoLCB0ZW1wTWF0Y2gsIGluZGV4O1xuICAgICAgICBpZiAoIXRoaXMuX21vcmUpIHtcbiAgICAgICAgICB0aGlzLnl5dGV4dCA9IFwiXCI7XG4gICAgICAgICAgdGhpcy5tYXRjaCA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJ1bGVzID0gdGhpcy5fY3VycmVudFJ1bGVzKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0ZW1wTWF0Y2ggPSB0aGlzLl9pbnB1dC5tYXRjaCh0aGlzLnJ1bGVzW3J1bGVzW2ldXSk7XG4gICAgICAgICAgaWYgKHRlbXBNYXRjaCAmJiAoIW1hdGNoIHx8IHRlbXBNYXRjaFswXS5sZW5ndGggPiBtYXRjaFswXS5sZW5ndGgpKSB7XG4gICAgICAgICAgICBtYXRjaCA9IHRlbXBNYXRjaDtcbiAgICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFja3RyYWNrX2xleGVyKSB7XG4gICAgICAgICAgICAgIHRva2VuID0gdGhpcy50ZXN0X21hdGNoKHRlbXBNYXRjaCwgcnVsZXNbaV0pO1xuICAgICAgICAgICAgICBpZiAodG9rZW4gIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JhY2t0cmFjaykge1xuICAgICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLm9wdGlvbnMuZmxleCkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgdG9rZW4gPSB0aGlzLnRlc3RfbWF0Y2gobWF0Y2gsIHJ1bGVzW2luZGV4XSk7XG4gICAgICAgICAgaWYgKHRva2VuICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2lucHV0ID09PSBcIlwiKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuRU9GO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRXJyb3IoXCJMZXhpY2FsIGVycm9yIG9uIGxpbmUgXCIgKyAodGhpcy55eWxpbmVubyArIDEpICsgXCIuIFVucmVjb2duaXplZCB0ZXh0LlxcblwiICsgdGhpcy5zaG93UG9zaXRpb24oKSwge1xuICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgIHRva2VuOiBudWxsLFxuICAgICAgICAgICAgbGluZTogdGhpcy55eWxpbmVub1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9LCBcIm5leHRcIiksXG4gICAgICAvLyByZXR1cm4gbmV4dCBtYXRjaCB0aGF0IGhhcyBhIHRva2VuXG4gICAgICBsZXg6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gbGV4KCkge1xuICAgICAgICB2YXIgciA9IHRoaXMubmV4dCgpO1xuICAgICAgICBpZiAocikge1xuICAgICAgICAgIHJldHVybiByO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmxleCgpO1xuICAgICAgICB9XG4gICAgICB9LCBcImxleFwiKSxcbiAgICAgIC8vIGFjdGl2YXRlcyBhIG5ldyBsZXhlciBjb25kaXRpb24gc3RhdGUgKHB1c2hlcyB0aGUgbmV3IGxleGVyIGNvbmRpdGlvbiBzdGF0ZSBvbnRvIHRoZSBjb25kaXRpb24gc3RhY2spXG4gICAgICBiZWdpbjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBiZWdpbihjb25kaXRpb24pIHtcbiAgICAgICAgdGhpcy5jb25kaXRpb25TdGFjay5wdXNoKGNvbmRpdGlvbik7XG4gICAgICB9LCBcImJlZ2luXCIpLFxuICAgICAgLy8gcG9wIHRoZSBwcmV2aW91c2x5IGFjdGl2ZSBsZXhlciBjb25kaXRpb24gc3RhdGUgb2ZmIHRoZSBjb25kaXRpb24gc3RhY2tcbiAgICAgIHBvcFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBvcFN0YXRlKCkge1xuICAgICAgICB2YXIgbiA9IHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMTtcbiAgICAgICAgaWYgKG4gPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uU3RhY2sucG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uU3RhY2tbMF07XG4gICAgICAgIH1cbiAgICAgIH0sIFwicG9wU3RhdGVcIiksXG4gICAgICAvLyBwcm9kdWNlIHRoZSBsZXhlciBydWxlIHNldCB3aGljaCBpcyBhY3RpdmUgZm9yIHRoZSBjdXJyZW50bHkgYWN0aXZlIGxleGVyIGNvbmRpdGlvbiBzdGF0ZVxuICAgICAgX2N1cnJlbnRSdWxlczogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBfY3VycmVudFJ1bGVzKCkge1xuICAgICAgICBpZiAodGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggJiYgdGhpcy5jb25kaXRpb25TdGFja1t0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uc1t0aGlzLmNvbmRpdGlvblN0YWNrW3RoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMV1dLnJ1bGVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvbnNbXCJJTklUSUFMXCJdLnJ1bGVzO1xuICAgICAgICB9XG4gICAgICB9LCBcIl9jdXJyZW50UnVsZXNcIiksXG4gICAgICAvLyByZXR1cm4gdGhlIGN1cnJlbnRseSBhY3RpdmUgbGV4ZXIgY29uZGl0aW9uIHN0YXRlOyB3aGVuIGFuIGluZGV4IGFyZ3VtZW50IGlzIHByb3ZpZGVkIGl0IHByb2R1Y2VzIHRoZSBOLXRoIHByZXZpb3VzIGNvbmRpdGlvbiBzdGF0ZSwgaWYgYXZhaWxhYmxlXG4gICAgICB0b3BTdGF0ZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiB0b3BTdGF0ZShuKSB7XG4gICAgICAgIG4gPSB0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDEgLSBNYXRoLmFicyhuIHx8IDApO1xuICAgICAgICBpZiAobiA+PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uU3RhY2tbbl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFwiSU5JVElBTFwiO1xuICAgICAgICB9XG4gICAgICB9LCBcInRvcFN0YXRlXCIpLFxuICAgICAgLy8gYWxpYXMgZm9yIGJlZ2luKGNvbmRpdGlvbilcbiAgICAgIHB1c2hTdGF0ZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwdXNoU3RhdGUoY29uZGl0aW9uKSB7XG4gICAgICAgIHRoaXMuYmVnaW4oY29uZGl0aW9uKTtcbiAgICAgIH0sIFwicHVzaFN0YXRlXCIpLFxuICAgICAgLy8gcmV0dXJuIHRoZSBudW1iZXIgb2Ygc3RhdGVzIGN1cnJlbnRseSBvbiB0aGUgc3RhY2tcbiAgICAgIHN0YXRlU3RhY2tTaXplOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHN0YXRlU3RhY2tTaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGg7XG4gICAgICB9LCBcInN0YXRlU3RhY2tTaXplXCIpLFxuICAgICAgb3B0aW9uczogeyBcImNhc2UtaW5zZW5zaXRpdmVcIjogdHJ1ZSB9LFxuICAgICAgcGVyZm9ybUFjdGlvbjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBhbm9ueW1vdXMoeXksIHl5XywgJGF2b2lkaW5nX25hbWVfY29sbGlzaW9ucywgWVlfU1RBUlQpIHtcbiAgICAgICAgdmFyIFlZU1RBVEUgPSBZWV9TVEFSVDtcbiAgICAgICAgc3dpdGNoICgkYXZvaWRpbmdfbmFtZV9jb2xsaXNpb25zKSB7XG4gICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImFjY190aXRsZVwiKTtcbiAgICAgICAgICAgIHJldHVybiAyNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiBcImFjY190aXRsZV92YWx1ZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImFjY19kZXNjclwiKTtcbiAgICAgICAgICAgIHJldHVybiAyNjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiBcImFjY19kZXNjcl92YWx1ZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImFjY19kZXNjcl9tdWx0aWxpbmVcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICByZXR1cm4gXCJhY2NfZGVzY3JfbXVsdGlsaW5lX3ZhbHVlXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICByZXR1cm4gMzM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICByZXR1cm4gMzQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICByZXR1cm4gMzU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgICAgcmV0dXJuIDM2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMTpcbiAgICAgICAgICAgIHJldHVybiAxMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgcmV0dXJuIDg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgICAgcmV0dXJuIDUwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxNTpcbiAgICAgICAgICAgIHJldHVybiA3MjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICByZXR1cm4gNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiYmxvY2tcIik7XG4gICAgICAgICAgICByZXR1cm4gMTc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE4OlxuICAgICAgICAgICAgcmV0dXJuIDQ5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxOTpcbiAgICAgICAgICAgIHJldHVybiA0OTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgICByZXR1cm4gNDI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDIxOlxuICAgICAgICAgICAgcmV0dXJuIDE1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyMjpcbiAgICAgICAgICAgIHJldHVybiAxMztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjM6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI0OlxuICAgICAgICAgICAgcmV0dXJuIDYxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyNTpcbiAgICAgICAgICAgIHJldHVybiA1ODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjY6XG4gICAgICAgICAgICByZXR1cm4gNTg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgICAgcmV0dXJuIDYyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyODpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjk6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gMTk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDMwOlxuICAgICAgICAgICAgcmV0dXJuIHl5Xy55eXRleHRbMF07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDMxOlxuICAgICAgICAgICAgcmV0dXJuIDIwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzMjpcbiAgICAgICAgICAgIHJldHVybiAyMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzM6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwic3R5bGVcIik7XG4gICAgICAgICAgICByZXR1cm4gNDQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM0OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIDEwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNTpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzY6XG4gICAgICAgICAgICByZXR1cm4gMTM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgICAgcmV0dXJuIDQyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzODpcbiAgICAgICAgICAgIHJldHVybiA0OTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzk6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwic3R5bGVcIik7XG4gICAgICAgICAgICByZXR1cm4gMzc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQwOlxuICAgICAgICAgICAgcmV0dXJuIDQzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0MTpcbiAgICAgICAgICAgIHJldHVybiA2NTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDI6XG4gICAgICAgICAgICByZXR1cm4gNjc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQzOlxuICAgICAgICAgICAgcmV0dXJuIDY3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0NDpcbiAgICAgICAgICAgIHJldHVybiA2NztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDU6XG4gICAgICAgICAgICByZXR1cm4gNjU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ2OlxuICAgICAgICAgICAgcmV0dXJuIDY1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0NzpcbiAgICAgICAgICAgIHJldHVybiA2NjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDg6XG4gICAgICAgICAgICByZXR1cm4gNjY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ5OlxuICAgICAgICAgICAgcmV0dXJuIDY2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1MDpcbiAgICAgICAgICAgIHJldHVybiA2NjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTE6XG4gICAgICAgICAgICByZXR1cm4gNjY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDUyOlxuICAgICAgICAgICAgcmV0dXJuIDY3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1MzpcbiAgICAgICAgICAgIHJldHVybiA2NjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTQ6XG4gICAgICAgICAgICByZXR1cm4gNjc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU1OlxuICAgICAgICAgICAgcmV0dXJuIDY4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1NjpcbiAgICAgICAgICAgIHJldHVybiA2ODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTc6XG4gICAgICAgICAgICByZXR1cm4gNTE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU4OlxuICAgICAgICAgICAgcmV0dXJuIDY4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1OTpcbiAgICAgICAgICAgIHJldHVybiA2ODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjA6XG4gICAgICAgICAgICByZXR1cm4gNjg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDYxOlxuICAgICAgICAgICAgcmV0dXJuIDUyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2MjpcbiAgICAgICAgICAgIHJldHVybiA0ODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjM6XG4gICAgICAgICAgICByZXR1cm4gNjg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDY0OlxuICAgICAgICAgICAgcmV0dXJuIDY1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2NTpcbiAgICAgICAgICAgIHJldHVybiA2NjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjY6XG4gICAgICAgICAgICByZXR1cm4gNjc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDY3OlxuICAgICAgICAgICAgcmV0dXJuIDY5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2ODpcbiAgICAgICAgICAgIHJldHVybiA3MDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjk6XG4gICAgICAgICAgICByZXR1cm4gNzE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDcwOlxuICAgICAgICAgICAgcmV0dXJuIDcxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3MTpcbiAgICAgICAgICAgIHJldHVybiA3MDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzI6XG4gICAgICAgICAgICByZXR1cm4gNzA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDczOlxuICAgICAgICAgICAgcmV0dXJuIDcwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3NDpcbiAgICAgICAgICAgIHJldHVybiA0MTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzU6XG4gICAgICAgICAgICByZXR1cm4gNDc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDc2OlxuICAgICAgICAgICAgcmV0dXJuIDQwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3NzpcbiAgICAgICAgICAgIHJldHVybiB5eV8ueXl0ZXh0WzBdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3ODpcbiAgICAgICAgICAgIHJldHVybiA2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0sIFwiYW5vbnltb3VzXCIpLFxuICAgICAgcnVsZXM6IFsvXig/OmFjY1RpdGxlXFxzKjpcXHMqKS9pLCAvXig/Oig/IVxcbnx8KSpbXlxcbl0qKS9pLCAvXig/OmFjY0Rlc2NyXFxzKjpcXHMqKS9pLCAvXig/Oig/IVxcbnx8KSpbXlxcbl0qKS9pLCAvXig/OmFjY0Rlc2NyXFxzKlxce1xccyopL2ksIC9eKD86W1xcfV0pL2ksIC9eKD86W15cXH1dKikvaSwgL14oPzouKmRpcmVjdGlvblxccytUQlteXFxuXSopL2ksIC9eKD86LipkaXJlY3Rpb25cXHMrQlRbXlxcbl0qKS9pLCAvXig/Oi4qZGlyZWN0aW9uXFxzK1JMW15cXG5dKikvaSwgL14oPzouKmRpcmVjdGlvblxccytMUlteXFxuXSopL2ksIC9eKD86W1xcbl0rKS9pLCAvXig/OlxccyspL2ksIC9eKD86W1xcc10rKS9pLCAvXig/OlwiW15cIiVcXHJcXG5cXHZcXGJcXFxcXStcIikvaSwgL14oPzpcIlteXCJdKlwiKS9pLCAvXig/OmVyRGlhZ3JhbVxcYikvaSwgL14oPzpcXHspL2ksIC9eKD86IykvaSwgL14oPzojKS9pLCAvXig/OiwpL2ksIC9eKD86Ojo6KS9pLCAvXig/OjopL2ksIC9eKD86XFxzKykvaSwgL14oPzpcXGIoKD86UEspfCg/OkZLKXwoPzpVSykpXFxiKS9pLCAvXig/OihbXlxcc10qKVt+XS4qW35dKFteXFxzXSopKS9pLCAvXig/OihbXFwqQS1aYS16X1xcdTAwQzAtXFx1RkZGRl1bQS1aYS16MC05XFwtXFxfXFxbXFxdXFwoXFwpXFx1MDBDMC1cXHVGRkZGXFwqXSopKS9pLCAvXig/OlwiW15cIl0qXCIpL2ksIC9eKD86W1xcbl0rKS9pLCAvXig/OlxcfSkvaSwgL14oPzouKS9pLCAvXig/OlxcWykvaSwgL14oPzpcXF0pL2ksIC9eKD86c3R5bGVcXGIpL2ksIC9eKD86W1xcbl0rKS9pLCAvXig/OlxccyspL2ksIC9eKD86OikvaSwgL14oPzosKS9pLCAvXig/OiMpL2ksIC9eKD86Y2xhc3NEZWZcXGIpL2ksIC9eKD86Y2xhc3NcXGIpL2ksIC9eKD86b25lIG9yIHplcm9cXGIpL2ksIC9eKD86b25lIG9yIG1vcmVcXGIpL2ksIC9eKD86b25lIG9yIG1hbnlcXGIpL2ksIC9eKD86MVxcKykvaSwgL14oPzpcXHxvXFxiKS9pLCAvXig/Onplcm8gb3Igb25lXFxiKS9pLCAvXig/Onplcm8gb3IgbW9yZVxcYikvaSwgL14oPzp6ZXJvIG9yIG1hbnlcXGIpL2ksIC9eKD86MFxcKykvaSwgL14oPzpcXH1vXFxiKS9pLCAvXig/Om1hbnlcXCgwXFwpKS9pLCAvXig/Om1hbnlcXCgxXFwpKS9pLCAvXig/Om1hbnlcXGIpL2ksIC9eKD86XFx9XFx8KS9pLCAvXig/Om9uZVxcYikvaSwgL14oPzpvbmx5IG9uZVxcYikvaSwgL14oPzpbMC05XStcXC5bMC05XSspL2ksIC9eKD86MSg/PVxccytbQS1aYS16X1wiJ10pKS9pLCAvXig/OjEoPz1cXHMrWzAtOV0pKS9pLCAvXig/OjEoPz0oLS18XFwuXFwufFxcLi18LVxcLikpKS9pLCAvXig/OjFcXGIpL2ksIC9eKD86WzAtOV0rKS9pLCAvXig/OlxcfFxcfCkvaSwgL14oPzpvXFx8KS9pLCAvXig/Om9cXHspL2ksIC9eKD86XFx8XFx7KS9pLCAvXig/OnUoPz1bXFwuXFwtXFx8XSkpL2ksIC9eKD86XFwuXFwuKS9pLCAvXig/Oi0tKS9pLCAvXig/OnRvXFxiKS9pLCAvXig/Om9wdGlvbmFsbHkgdG9cXGIpL2ksIC9eKD86XFwuLSkvaSwgL14oPzotXFwuKS9pLCAvXig/OihbXlxceDAwLVxceDdGXXxcXHd8LXxcXCopKykvaSwgL14oPzo7KS9pLCAvXig/OihbXlxceDAwLVxceDdGXXxcXHd8LXxcXCp8XFwuKSspL2ksIC9eKD86LikvaSwgL14oPzokKS9pXSxcbiAgICAgIGNvbmRpdGlvbnM6IHsgXCJzdHlsZVwiOiB7IFwicnVsZXNcIjogWzM0LCAzNSwgMzYsIDM3LCAzOCwgNzQsIDc1XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJhY2NfZGVzY3JfbXVsdGlsaW5lXCI6IHsgXCJydWxlc1wiOiBbNSwgNl0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiYWNjX2Rlc2NyXCI6IHsgXCJydWxlc1wiOiBbM10sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiYWNjX3RpdGxlXCI6IHsgXCJydWxlc1wiOiBbMV0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiYmxvY2tcIjogeyBcInJ1bGVzXCI6IFsyMywgMjQsIDI1LCAyNiwgMjcsIDI4LCAyOSwgMzBdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIklOSVRJQUxcIjogeyBcInJ1bGVzXCI6IFswLCAyLCA0LCA3LCA4LCA5LCAxMCwgMTEsIDEyLCAxMywgMTQsIDE1LCAxNiwgMTcsIDE4LCAxOSwgMjAsIDIxLCAyMiwgMzEsIDMyLCAzMywgMzksIDQwLCA0MSwgNDIsIDQzLCA0NCwgNDUsIDQ2LCA0NywgNDgsIDQ5LCA1MCwgNTEsIDUyLCA1MywgNTQsIDU1LCA1NiwgNTcsIDU4LCA1OSwgNjAsIDYxLCA2MiwgNjMsIDY0LCA2NSwgNjYsIDY3LCA2OCwgNjksIDcwLCA3MSwgNzIsIDczLCA3NiwgNzcsIDc4XSwgXCJpbmNsdXNpdmVcIjogdHJ1ZSB9IH1cbiAgICB9O1xuICAgIHJldHVybiBsZXhlcjI7XG4gIH0pKCk7XG4gIHBhcnNlcjIubGV4ZXIgPSBsZXhlcjtcbiAgZnVuY3Rpb24gUGFyc2VyKCkge1xuICAgIHRoaXMueXkgPSB7fTtcbiAgfVxuICBfX25hbWUoUGFyc2VyLCBcIlBhcnNlclwiKTtcbiAgUGFyc2VyLnByb3RvdHlwZSA9IHBhcnNlcjI7XG4gIHBhcnNlcjIuUGFyc2VyID0gUGFyc2VyO1xuICByZXR1cm4gbmV3IFBhcnNlcigpO1xufSkoKTtcbnBhcnNlci5wYXJzZXIgPSBwYXJzZXI7XG52YXIgZXJEaWFncmFtX2RlZmF1bHQgPSBwYXJzZXI7XG5cbi8vIHNyYy9kaWFncmFtcy9lci9lckRiLnRzXG52YXIgRXJEQiA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5lbnRpdGllcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgdGhpcy5yZWxhdGlvbnNoaXBzID0gW107XG4gICAgdGhpcy5jbGFzc2VzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICB0aGlzLmRpcmVjdGlvbiA9IFwiVEJcIjtcbiAgICB0aGlzLkNhcmRpbmFsaXR5ID0ge1xuICAgICAgWkVST19PUl9PTkU6IFwiWkVST19PUl9PTkVcIixcbiAgICAgIFpFUk9fT1JfTU9SRTogXCJaRVJPX09SX01PUkVcIixcbiAgICAgIE9ORV9PUl9NT1JFOiBcIk9ORV9PUl9NT1JFXCIsXG4gICAgICBPTkxZX09ORTogXCJPTkxZX09ORVwiLFxuICAgICAgTURfUEFSRU5UOiBcIk1EX1BBUkVOVFwiXG4gICAgfTtcbiAgICB0aGlzLklkZW50aWZpY2F0aW9uID0ge1xuICAgICAgTk9OX0lERU5USUZZSU5HOiBcIk5PTl9JREVOVElGWUlOR1wiLFxuICAgICAgSURFTlRJRllJTkc6IFwiSURFTlRJRllJTkdcIlxuICAgIH07XG4gICAgdGhpcy5zZXRBY2NUaXRsZSA9IHNldEFjY1RpdGxlO1xuICAgIHRoaXMuZ2V0QWNjVGl0bGUgPSBnZXRBY2NUaXRsZTtcbiAgICB0aGlzLnNldEFjY0Rlc2NyaXB0aW9uID0gc2V0QWNjRGVzY3JpcHRpb247XG4gICAgdGhpcy5nZXRBY2NEZXNjcmlwdGlvbiA9IGdldEFjY0Rlc2NyaXB0aW9uO1xuICAgIHRoaXMuc2V0RGlhZ3JhbVRpdGxlID0gc2V0RGlhZ3JhbVRpdGxlO1xuICAgIHRoaXMuZ2V0RGlhZ3JhbVRpdGxlID0gZ2V0RGlhZ3JhbVRpdGxlO1xuICAgIHRoaXMuZ2V0Q29uZmlnID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiBnZXRDb25maWcoKS5lciwgXCJnZXRDb25maWdcIik7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMuYWRkRW50aXR5ID0gdGhpcy5hZGRFbnRpdHkuYmluZCh0aGlzKTtcbiAgICB0aGlzLmFkZEF0dHJpYnV0ZXMgPSB0aGlzLmFkZEF0dHJpYnV0ZXMuYmluZCh0aGlzKTtcbiAgICB0aGlzLmFkZFJlbGF0aW9uc2hpcCA9IHRoaXMuYWRkUmVsYXRpb25zaGlwLmJpbmQodGhpcyk7XG4gICAgdGhpcy5zZXREaXJlY3Rpb24gPSB0aGlzLnNldERpcmVjdGlvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuYWRkQ3NzU3R5bGVzID0gdGhpcy5hZGRDc3NTdHlsZXMuYmluZCh0aGlzKTtcbiAgICB0aGlzLmFkZENsYXNzID0gdGhpcy5hZGRDbGFzcy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc2V0Q2xhc3MgPSB0aGlzLnNldENsYXNzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5zZXRBY2NUaXRsZSA9IHRoaXMuc2V0QWNjVGl0bGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLnNldEFjY0Rlc2NyaXB0aW9uID0gdGhpcy5zZXRBY2NEZXNjcmlwdGlvbi5iaW5kKHRoaXMpO1xuICB9XG4gIHN0YXRpYyB7XG4gICAgX19uYW1lKHRoaXMsIFwiRXJEQlwiKTtcbiAgfVxuICAvKipcbiAgICogQWRkIGVudGl0eVxuICAgKiBAcGFyYW0gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBlbnRpdHlcbiAgICogQHBhcmFtIGFsaWFzIC0gVGhlIGFsaWFzIG9mIHRoZSBlbnRpdHlcbiAgICovXG4gIGFkZEVudGl0eShuYW1lLCBhbGlhcyA9IFwiXCIpIHtcbiAgICBpZiAoIXRoaXMuZW50aXRpZXMuaGFzKG5hbWUpKSB7XG4gICAgICB0aGlzLmVudGl0aWVzLnNldChuYW1lLCB7XG4gICAgICAgIGlkOiBgZW50aXR5LSR7bmFtZX0tJHt0aGlzLmVudGl0aWVzLnNpemV9YCxcbiAgICAgICAgbGFiZWw6IG5hbWUsXG4gICAgICAgIGF0dHJpYnV0ZXM6IFtdLFxuICAgICAgICBhbGlhcyxcbiAgICAgICAgc2hhcGU6IFwiZXJCb3hcIixcbiAgICAgICAgbG9vazogZ2V0Q29uZmlnKCkubG9vayA/PyBcImRlZmF1bHRcIixcbiAgICAgICAgY3NzQ2xhc3NlczogXCJkZWZhdWx0XCIsXG4gICAgICAgIGNzc1N0eWxlczogW10sXG4gICAgICAgIGxhYmVsVHlwZTogXCJtYXJrZG93blwiXG4gICAgICB9KTtcbiAgICAgIGxvZy5pbmZvKFwiQWRkZWQgbmV3IGVudGl0eSA6XCIsIG5hbWUpO1xuICAgIH0gZWxzZSBpZiAoIXRoaXMuZW50aXRpZXMuZ2V0KG5hbWUpPy5hbGlhcyAmJiBhbGlhcykge1xuICAgICAgdGhpcy5lbnRpdGllcy5nZXQobmFtZSkuYWxpYXMgPSBhbGlhcztcbiAgICAgIGxvZy5pbmZvKGBBZGQgYWxpYXMgJyR7YWxpYXN9JyB0byBlbnRpdHkgJyR7bmFtZX0nYCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVudGl0aWVzLmdldChuYW1lKTtcbiAgfVxuICBnZXRFbnRpdHkobmFtZSkge1xuICAgIHJldHVybiB0aGlzLmVudGl0aWVzLmdldChuYW1lKTtcbiAgfVxuICBnZXRFbnRpdGllcygpIHtcbiAgICByZXR1cm4gdGhpcy5lbnRpdGllcztcbiAgfVxuICBnZXRDbGFzc2VzKCkge1xuICAgIHJldHVybiB0aGlzLmNsYXNzZXM7XG4gIH1cbiAgYWRkQXR0cmlidXRlcyhlbnRpdHlOYW1lLCBhdHRyaWJzKSB7XG4gICAgY29uc3QgZW50aXR5ID0gdGhpcy5hZGRFbnRpdHkoZW50aXR5TmFtZSk7XG4gICAgbGV0IGk7XG4gICAgZm9yIChpID0gYXR0cmlicy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgaWYgKCFhdHRyaWJzW2ldLmtleXMpIHtcbiAgICAgICAgYXR0cmlic1tpXS5rZXlzID0gW107XG4gICAgICB9XG4gICAgICBpZiAoIWF0dHJpYnNbaV0uY29tbWVudCkge1xuICAgICAgICBhdHRyaWJzW2ldLmNvbW1lbnQgPSBcIlwiO1xuICAgICAgfVxuICAgICAgZW50aXR5LmF0dHJpYnV0ZXMucHVzaChhdHRyaWJzW2ldKTtcbiAgICAgIGxvZy5kZWJ1ZyhcIkFkZGVkIGF0dHJpYnV0ZSBcIiwgYXR0cmlic1tpXS5uYW1lKTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIEFkZCBhIHJlbGF0aW9uc2hpcFxuICAgKlxuICAgKiBAcGFyYW0gZW50QSAtIFRoZSBmaXJzdCBlbnRpdHkgaW4gdGhlIHJlbGF0aW9uc2hpcFxuICAgKiBAcGFyYW0gcm9sQSAtIFRoZSByb2xlIHBsYXllZCBieSB0aGUgZmlyc3QgZW50aXR5IGluIHJlbGF0aW9uIHRvIHRoZSBzZWNvbmRcbiAgICogQHBhcmFtIGVudEIgLSBUaGUgc2Vjb25kIGVudGl0eSBpbiB0aGUgcmVsYXRpb25zaGlwXG4gICAqIEBwYXJhbSByU3BlYyAtIFRoZSBkZXRhaWxzIG9mIHRoZSByZWxhdGlvbnNoaXAgYmV0d2VlbiB0aGUgdHdvIGVudGl0aWVzXG4gICAqL1xuICBhZGRSZWxhdGlvbnNoaXAoZW50QSwgcm9sQSwgZW50QiwgclNwZWMpIHtcbiAgICBjb25zdCBlbnRpdHlBID0gdGhpcy5lbnRpdGllcy5nZXQoZW50QSk7XG4gICAgY29uc3QgZW50aXR5QiA9IHRoaXMuZW50aXRpZXMuZ2V0KGVudEIpO1xuICAgIGlmICghZW50aXR5QSB8fCAhZW50aXR5Qikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZWwgPSB7XG4gICAgICBlbnRpdHlBOiBlbnRpdHlBLmlkLFxuICAgICAgcm9sZUE6IHJvbEEsXG4gICAgICBlbnRpdHlCOiBlbnRpdHlCLmlkLFxuICAgICAgcmVsU3BlYzogclNwZWNcbiAgICB9O1xuICAgIHRoaXMucmVsYXRpb25zaGlwcy5wdXNoKHJlbCk7XG4gICAgbG9nLmRlYnVnKFwiQWRkZWQgbmV3IHJlbGF0aW9uc2hpcCA6XCIsIHJlbCk7XG4gIH1cbiAgZ2V0UmVsYXRpb25zaGlwcygpIHtcbiAgICByZXR1cm4gdGhpcy5yZWxhdGlvbnNoaXBzO1xuICB9XG4gIGdldERpcmVjdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb247XG4gIH1cbiAgc2V0RGlyZWN0aW9uKGRpcikge1xuICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyO1xuICB9XG4gIGdldENvbXBpbGVkU3R5bGVzKGNsYXNzRGVmcykge1xuICAgIGxldCBjb21waWxlZFN0eWxlcyA9IFtdO1xuICAgIGZvciAoY29uc3QgY3VzdG9tQ2xhc3Mgb2YgY2xhc3NEZWZzKSB7XG4gICAgICBjb25zdCBjc3NDbGFzcyA9IHRoaXMuY2xhc3Nlcy5nZXQoY3VzdG9tQ2xhc3MpO1xuICAgICAgaWYgKGNzc0NsYXNzPy5zdHlsZXMpIHtcbiAgICAgICAgY29tcGlsZWRTdHlsZXMgPSBbLi4uY29tcGlsZWRTdHlsZXMsIC4uLmNzc0NsYXNzLnN0eWxlcyA/PyBbXV0ubWFwKChzKSA9PiBzLnRyaW0oKSk7XG4gICAgICB9XG4gICAgICBpZiAoY3NzQ2xhc3M/LnRleHRTdHlsZXMpIHtcbiAgICAgICAgY29tcGlsZWRTdHlsZXMgPSBbLi4uY29tcGlsZWRTdHlsZXMsIC4uLmNzc0NsYXNzLnRleHRTdHlsZXMgPz8gW11dLm1hcCgocykgPT4gcy50cmltKCkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29tcGlsZWRTdHlsZXM7XG4gIH1cbiAgYWRkQ3NzU3R5bGVzKGlkcywgc3R5bGVzKSB7XG4gICAgZm9yIChjb25zdCBpZCBvZiBpZHMpIHtcbiAgICAgIGNvbnN0IGVudGl0eSA9IHRoaXMuZW50aXRpZXMuZ2V0KGlkKTtcbiAgICAgIGlmICghc3R5bGVzIHx8ICFlbnRpdHkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBzdHlsZSBvZiBzdHlsZXMpIHtcbiAgICAgICAgZW50aXR5LmNzc1N0eWxlcy5wdXNoKHN0eWxlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgYWRkQ2xhc3MoaWRzLCBzdHlsZSkge1xuICAgIGlkcy5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgbGV0IGNsYXNzTm9kZSA9IHRoaXMuY2xhc3Nlcy5nZXQoaWQpO1xuICAgICAgaWYgKGNsYXNzTm9kZSA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGNsYXNzTm9kZSA9IHsgaWQsIHN0eWxlczogW10sIHRleHRTdHlsZXM6IFtdIH07XG4gICAgICAgIHRoaXMuY2xhc3Nlcy5zZXQoaWQsIGNsYXNzTm9kZSk7XG4gICAgICB9XG4gICAgICBpZiAoc3R5bGUpIHtcbiAgICAgICAgc3R5bGUuZm9yRWFjaChmdW5jdGlvbihzKSB7XG4gICAgICAgICAgaWYgKC9jb2xvci8uZXhlYyhzKSkge1xuICAgICAgICAgICAgY29uc3QgbmV3U3R5bGUgPSBzLnJlcGxhY2UoXCJmaWxsXCIsIFwiYmdGaWxsXCIpO1xuICAgICAgICAgICAgY2xhc3NOb2RlLnRleHRTdHlsZXMucHVzaChuZXdTdHlsZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNsYXNzTm9kZS5zdHlsZXMucHVzaChzKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgc2V0Q2xhc3MoaWRzLCBjbGFzc05hbWVzKSB7XG4gICAgZm9yIChjb25zdCBpZCBvZiBpZHMpIHtcbiAgICAgIGNvbnN0IGVudGl0eSA9IHRoaXMuZW50aXRpZXMuZ2V0KGlkKTtcbiAgICAgIGlmIChlbnRpdHkpIHtcbiAgICAgICAgZm9yIChjb25zdCBjbGFzc05hbWUgb2YgY2xhc3NOYW1lcykge1xuICAgICAgICAgIGVudGl0eS5jc3NDbGFzc2VzICs9IFwiIFwiICsgY2xhc3NOYW1lO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNsZWFyKCkge1xuICAgIHRoaXMuZW50aXRpZXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgIHRoaXMuY2xhc3NlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgdGhpcy5yZWxhdGlvbnNoaXBzID0gW107XG4gICAgY2xlYXIoKTtcbiAgfVxuICBnZXREYXRhKCkge1xuICAgIGNvbnN0IG5vZGVzID0gW107XG4gICAgY29uc3QgZWRnZXMgPSBbXTtcbiAgICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgICBsZXQgY29sb3JJbmRleCA9IDA7XG4gICAgZm9yIChjb25zdCBlbnRpdHlLZXkgb2YgdGhpcy5lbnRpdGllcy5rZXlzKCkpIHtcbiAgICAgIGNvbnN0IGVudGl0eU5vZGUgPSB0aGlzLmVudGl0aWVzLmdldChlbnRpdHlLZXkpO1xuICAgICAgaWYgKGVudGl0eU5vZGUpIHtcbiAgICAgICAgZW50aXR5Tm9kZS5jc3NDb21waWxlZFN0eWxlcyA9IHRoaXMuZ2V0Q29tcGlsZWRTdHlsZXMoZW50aXR5Tm9kZS5jc3NDbGFzc2VzLnNwbGl0KFwiIFwiKSk7XG4gICAgICAgIGVudGl0eU5vZGUuY29sb3JJbmRleCA9IGNvbG9ySW5kZXgrKztcbiAgICAgICAgbm9kZXMucHVzaChlbnRpdHlOb2RlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbGV0IGNvdW50ID0gMDtcbiAgICBmb3IgKGNvbnN0IHJlbGF0aW9uc2hpcCBvZiB0aGlzLnJlbGF0aW9uc2hpcHMpIHtcbiAgICAgIGNvbnN0IGVkZ2UgPSB7XG4gICAgICAgIGlkOiBnZXRFZGdlSWQocmVsYXRpb25zaGlwLmVudGl0eUEsIHJlbGF0aW9uc2hpcC5lbnRpdHlCLCB7XG4gICAgICAgICAgcHJlZml4OiBcImlkXCIsXG4gICAgICAgICAgY291bnRlcjogY291bnQrK1xuICAgICAgICB9KSxcbiAgICAgICAgdHlwZTogXCJub3JtYWxcIixcbiAgICAgICAgY3VydmU6IFwiYmFzaXNcIixcbiAgICAgICAgc3RhcnQ6IHJlbGF0aW9uc2hpcC5lbnRpdHlBLFxuICAgICAgICBlbmQ6IHJlbGF0aW9uc2hpcC5lbnRpdHlCLFxuICAgICAgICBsYWJlbDogcmVsYXRpb25zaGlwLnJvbGVBLFxuICAgICAgICBsYWJlbHBvczogXCJjXCIsXG4gICAgICAgIHRoaWNrbmVzczogXCJub3JtYWxcIixcbiAgICAgICAgY2xhc3NlczogXCJyZWxhdGlvbnNoaXBMaW5lXCIsXG4gICAgICAgIGFycm93VHlwZVN0YXJ0OiByZWxhdGlvbnNoaXAucmVsU3BlYy5jYXJkQi50b0xvd2VyQ2FzZSgpLFxuICAgICAgICBhcnJvd1R5cGVFbmQ6IHJlbGF0aW9uc2hpcC5yZWxTcGVjLmNhcmRBLnRvTG93ZXJDYXNlKCksXG4gICAgICAgIHBhdHRlcm46IHJlbGF0aW9uc2hpcC5yZWxTcGVjLnJlbFR5cGUgPT0gXCJJREVOVElGWUlOR1wiID8gXCJzb2xpZFwiIDogXCJkYXNoZWRcIixcbiAgICAgICAgbG9vazogY29uZmlnLmxvb2ssXG4gICAgICAgIGxhYmVsVHlwZTogXCJtYXJrZG93blwiXG4gICAgICB9O1xuICAgICAgZWRnZXMucHVzaChlZGdlKTtcbiAgICB9XG4gICAgcmV0dXJuIHsgbm9kZXMsIGVkZ2VzLCBvdGhlcjoge30sIGNvbmZpZywgZGlyZWN0aW9uOiBcIlRCXCIgfTtcbiAgfVxufTtcblxuLy8gc3JjL2RpYWdyYW1zL2VyL2VyUmVuZGVyZXItdW5pZmllZC50c1xudmFyIGVyUmVuZGVyZXJfdW5pZmllZF9leHBvcnRzID0ge307XG5fX2V4cG9ydChlclJlbmRlcmVyX3VuaWZpZWRfZXhwb3J0cywge1xuICBkcmF3OiAoKSA9PiBkcmF3XG59KTtcbmltcG9ydCB7IHNlbGVjdCB9IGZyb20gXCJkM1wiO1xudmFyIGRyYXcgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGFzeW5jIGZ1bmN0aW9uKHRleHQsIGlkLCBfdmVyc2lvbiwgZGlhZykge1xuICBsb2cuaW5mbyhcIlJFRjA6XCIpO1xuICBsb2cuaW5mbyhcIkRyYXdpbmcgZXIgZGlhZ3JhbSAodW5pZmllZClcIiwgaWQpO1xuICBjb25zdCB7IHNlY3VyaXR5TGV2ZWwsIGVyOiBjb25mLCBsYXlvdXQgfSA9IGdldENvbmZpZygpO1xuICBjb25zdCBkYXRhNExheW91dCA9IGRpYWcuZGIuZ2V0RGF0YSgpO1xuICBjb25zdCBzdmcgPSBnZXREaWFncmFtRWxlbWVudChpZCwgc2VjdXJpdHlMZXZlbCk7XG4gIGRhdGE0TGF5b3V0LnR5cGUgPSBkaWFnLnR5cGU7XG4gIGRhdGE0TGF5b3V0LmxheW91dEFsZ29yaXRobSA9IGdldFJlZ2lzdGVyZWRMYXlvdXRBbGdvcml0aG0obGF5b3V0KTtcbiAgZGF0YTRMYXlvdXQuY29uZmlnLmZsb3djaGFydC5ub2RlU3BhY2luZyA9IGNvbmY/Lm5vZGVTcGFjaW5nIHx8IDE0MDtcbiAgZGF0YTRMYXlvdXQuY29uZmlnLmZsb3djaGFydC5yYW5rU3BhY2luZyA9IGNvbmY/LnJhbmtTcGFjaW5nIHx8IDgwO1xuICBkYXRhNExheW91dC5kaXJlY3Rpb24gPSBkaWFnLmRiLmdldERpcmVjdGlvbigpO1xuICBjb25zdCB7IGNvbmZpZyB9ID0gZGF0YTRMYXlvdXQ7XG4gIGNvbnN0IHsgbG9vayB9ID0gY29uZmlnO1xuICBpZiAobG9vayA9PT0gXCJuZW9cIikge1xuICAgIGRhdGE0TGF5b3V0Lm1hcmtlcnMgPSBbXG4gICAgICBcIm9ubHlfb25lX25lb1wiLFxuICAgICAgXCJ6ZXJvX29yX29uZV9uZW9cIixcbiAgICAgIFwib25lX29yX21vcmVfbmVvXCIsXG4gICAgICBcInplcm9fb3JfbW9yZV9uZW9cIlxuICAgIF07XG4gIH0gZWxzZSB7XG4gICAgZGF0YTRMYXlvdXQubWFya2VycyA9IFtcIm9ubHlfb25lXCIsIFwiemVyb19vcl9vbmVcIiwgXCJvbmVfb3JfbW9yZVwiLCBcInplcm9fb3JfbW9yZVwiXTtcbiAgfVxuICBkYXRhNExheW91dC5kaWFncmFtSWQgPSBpZDtcbiAgYXdhaXQgcmVuZGVyKGRhdGE0TGF5b3V0LCBzdmcpO1xuICBpZiAoZGF0YTRMYXlvdXQubGF5b3V0QWxnb3JpdGhtID09PSBcImVsa1wiKSB7XG4gICAgc3ZnLnNlbGVjdChcIi5lZGdlc1wiKS5sb3dlcigpO1xuICB9XG4gIGNvbnN0IGJhY2tncm91bmROb2RlcyA9IHN2Zy5zZWxlY3RBbGwoJ1tpZCo9XCItYmFja2dyb3VuZFwiXScpO1xuICBpZiAoQXJyYXkuZnJvbShiYWNrZ3JvdW5kTm9kZXMpLmxlbmd0aCA+IDApIHtcbiAgICBiYWNrZ3JvdW5kTm9kZXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGJhY2tncm91bmROb2RlID0gc2VsZWN0KHRoaXMpO1xuICAgICAgY29uc3QgYmFja2dyb3VuZElkID0gYmFja2dyb3VuZE5vZGUuYXR0cihcImlkXCIpO1xuICAgICAgY29uc3Qgbm9uQmFja2dyb3VuZElkID0gYmFja2dyb3VuZElkLnJlcGxhY2UoXCItYmFja2dyb3VuZFwiLCBcIlwiKTtcbiAgICAgIGNvbnN0IG5vbkJhY2tncm91bmROb2RlID0gc3ZnLnNlbGVjdChgIyR7Q1NTLmVzY2FwZShub25CYWNrZ3JvdW5kSWQpfWApO1xuICAgICAgaWYgKCFub25CYWNrZ3JvdW5kTm9kZS5lbXB0eSgpKSB7XG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybSA9IG5vbkJhY2tncm91bmROb2RlLmF0dHIoXCJ0cmFuc2Zvcm1cIik7XG4gICAgICAgIGJhY2tncm91bmROb2RlLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgdHJhbnNmb3JtKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBjb25zdCBwYWRkaW5nID0gODtcbiAgdXRpbHNfZGVmYXVsdC5pbnNlcnRUaXRsZShcbiAgICBzdmcsXG4gICAgXCJlckRpYWdyYW1UaXRsZVRleHRcIixcbiAgICBjb25mPy50aXRsZVRvcE1hcmdpbiA/PyAyNSxcbiAgICBkaWFnLmRiLmdldERpYWdyYW1UaXRsZSgpXG4gICk7XG4gIHNldHVwVmlld1BvcnRGb3JTVkcoc3ZnLCBwYWRkaW5nLCBcImVyRGlhZ3JhbVwiLCBjb25mPy51c2VNYXhXaWR0aCA/PyB0cnVlKTtcbn0sIFwiZHJhd1wiKTtcblxuLy8gc3JjL2RpYWdyYW1zL2VyL3N0eWxlcy50c1xuaW1wb3J0ICogYXMga2hyb21hIGZyb20gXCJraHJvbWFcIjtcbnZhciBmYWRlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoY29sb3IsIG9wYWNpdHkpID0+IHtcbiAgY29uc3QgY2hhbm5lbDIgPSBraHJvbWEuY2hhbm5lbDtcbiAgY29uc3QgciA9IGNoYW5uZWwyKGNvbG9yLCBcInJcIik7XG4gIGNvbnN0IGcgPSBjaGFubmVsMihjb2xvciwgXCJnXCIpO1xuICBjb25zdCBiID0gY2hhbm5lbDIoY29sb3IsIFwiYlwiKTtcbiAgcmV0dXJuIGtocm9tYS5yZ2JhKHIsIGcsIGIsIG9wYWNpdHkpO1xufSwgXCJmYWRlXCIpO1xudmFyIENPTE9SX1RIRU1FUyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KFtcInJlZHV4LWNvbG9yXCIsIFwicmVkdXgtZGFyay1jb2xvclwiXSk7XG52YXIgZ2VuQ29sb3IgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChvcHRpb25zKSA9PiB7XG4gIGNvbnN0IHsgdGhlbWUsIGxvb2ssIGJrZ0NvbG9yQXJyYXksIGJvcmRlckNvbG9yQXJyYXkgfSA9IG9wdGlvbnM7XG4gIGlmICghQ09MT1JfVEhFTUVTLmhhcyh0aGVtZSkpIHtcbiAgICByZXR1cm4gXCJcIjtcbiAgfVxuICBjb25zdCBoYXNCa2dDb2xvcnMgPSBia2dDb2xvckFycmF5Py5sZW5ndGggPiAwO1xuICBsZXQgc2VjdGlvbnMgPSBcIlwiO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG9wdGlvbnMuVEhFTUVfQ09MT1JfTElNSVQ7IGkrKykge1xuICAgIHNlY3Rpb25zICs9IGBcblxuICAgIFtkYXRhLWxvb2s9XCIke2xvb2t9XCJdW2RhdGEtY29sb3ItaWQ9XCJjb2xvci0ke2l9XCJdLm5vZGUgcGF0aCB7XG4gICAgc3Ryb2tlOiAke2JvcmRlckNvbG9yQXJyYXlbaV19O1xuICAgICR7aGFzQmtnQ29sb3JzID8gYGZpbGw6ICR7YmtnQ29sb3JBcnJheVtpXX07YCA6IFwiXCJ9XG4gICAgfVxuXG4gICAgW2RhdGEtbG9vaz1cIiR7bG9va31cIl1bZGF0YS1jb2xvci1pZD1cImNvbG9yLSR7aX1cIl0ubm9kZSAgcmVjdCB7XG4gICAgc3Ryb2tlOiAke2JvcmRlckNvbG9yQXJyYXlbaV19O1xuICAgICR7aGFzQmtnQ29sb3JzID8gYGZpbGw6ICR7YmtnQ29sb3JBcnJheVtpXX07YCA6IFwiXCJ9XG4gICAgIH1cbiAgICBgO1xuICB9XG4gIHJldHVybiBzZWN0aW9ucztcbn0sIFwiZ2VuQ29sb3JcIik7XG52YXIgZ2V0U3R5bGVzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgob3B0aW9ucykgPT4ge1xuICBjb25zdCB7IGxvb2ssIHRoZW1lLCBlckVkZ2VMYWJlbEJhY2tncm91bmQsIHN0cm9rZVdpZHRoIH0gPSBvcHRpb25zO1xuICByZXR1cm4gYFxuICAgICR7Z2VuQ29sb3Iob3B0aW9ucyl9XG4gIC5lbnRpdHlCb3gge1xuICAgIGZpbGw6ICR7b3B0aW9ucy5tYWluQmtnfTtcbiAgICBzdHJva2U6ICR7b3B0aW9ucy5ub2RlQm9yZGVyfTtcbiAgfVxuXG4gIC5yZWxhdGlvbnNoaXBMYWJlbEJveCB7XG4gICAgZmlsbDogJHtvcHRpb25zLnRlcnRpYXJ5Q29sb3J9O1xuICAgIG9wYWNpdHk6IDAuNztcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke29wdGlvbnMudGVydGlhcnlDb2xvcn07XG4gICAgICByZWN0IHtcbiAgICAgICAgb3BhY2l0eTogMC41O1xuICAgICAgfVxuICB9XG5cbiAgLmxhYmVsQmtnIHtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke0NPTE9SX1RIRU1FUy5oYXModGhlbWUpICYmIGVyRWRnZUxhYmVsQmFja2dyb3VuZCA/IGVyRWRnZUxhYmVsQmFja2dyb3VuZCA6IGZhZGUob3B0aW9ucy50ZXJ0aWFyeUNvbG9yLCAwLjUpfTtcbiAgfVxuXG4gIC5lZGdlTGFiZWwge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICR7Q09MT1JfVEhFTUVTLmhhcyh0aGVtZSkgJiYgZXJFZGdlTGFiZWxCYWNrZ3JvdW5kID8gZXJFZGdlTGFiZWxCYWNrZ3JvdW5kIDogb3B0aW9ucy5lZGdlTGFiZWxCYWNrZ3JvdW5kfTtcbiAgfVxuICAuZWRnZUxhYmVsIC5sYWJlbCByZWN0IHtcbiAgICBmaWxsOiAke0NPTE9SX1RIRU1FUy5oYXModGhlbWUpICYmIGVyRWRnZUxhYmVsQmFja2dyb3VuZCA/IGVyRWRnZUxhYmVsQmFja2dyb3VuZCA6IG9wdGlvbnMuZWRnZUxhYmVsQmFja2dyb3VuZH07XG4gIH1cbiAgLmVkZ2VMYWJlbCAubGFiZWwgdGV4dCB7XG4gICAgZmlsbDogJHtvcHRpb25zLnRleHRDb2xvcn07XG4gIH1cblxuICAuZWRnZUxhYmVsIC5sYWJlbCB7XG4gICAgZmlsbDogJHtvcHRpb25zLm5vZGVCb3JkZXJ9O1xuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgfVxuXG4gIC5sYWJlbCB7XG4gICAgZm9udC1mYW1pbHk6ICR7b3B0aW9ucy5mb250RmFtaWx5fTtcbiAgICBjb2xvcjogJHtvcHRpb25zLm5vZGVUZXh0Q29sb3IgfHwgb3B0aW9ucy50ZXh0Q29sb3J9O1xuICB9XG5cbiAgLmVkZ2UtcGF0dGVybi1kYXNoZWQge1xuICAgIHN0cm9rZS1kYXNoYXJyYXk6IDgsODtcbiAgfVxuXG4gIC5ub2RlIHJlY3QsXG4gIC5ub2RlIGNpcmNsZSxcbiAgLm5vZGUgZWxsaXBzZSxcbiAgLm5vZGUgcG9seWdvblxuICB7XG4gICAgZmlsbDogJHtvcHRpb25zLm1haW5Ca2d9O1xuICAgIHN0cm9rZTogJHtvcHRpb25zLm5vZGVCb3JkZXJ9O1xuICAgIHN0cm9rZS13aWR0aDogJHtsb29rID09PSBcIm5lb1wiID8gc3Ryb2tlV2lkdGggOiBcIjFweFwifTtcbiAgfVxuXG4gIC5yZWxhdGlvbnNoaXBMaW5lIHtcbiAgICBzdHJva2U6ICR7b3B0aW9ucy5saW5lQ29sb3J9O1xuICAgIHN0cm9rZS13aWR0aDogJHtsb29rID09PSBcIm5lb1wiID8gc3Ryb2tlV2lkdGggOiBcIjFweFwifTtcbiAgICBmaWxsOiBub25lO1xuICB9XG5cbiAgLm1hcmtlciB7XG4gICAgZmlsbDogbm9uZSAhaW1wb3J0YW50O1xuICAgIHN0cm9rZTogJHtvcHRpb25zLmxpbmVDb2xvcn0gIWltcG9ydGFudDtcbiAgICBzdHJva2Utd2lkdGg6IDE7XG4gIH1cbiAgW2RhdGEtbG9vaz1uZW9dLmxhYmVsQmtnIHtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke2ZhZGUob3B0aW9ucy50ZXJ0aWFyeUNvbG9yLCAwLjUpfTtcbiAgfVxuYDtcbn0sIFwiZ2V0U3R5bGVzXCIpO1xudmFyIHN0eWxlc19kZWZhdWx0ID0gZ2V0U3R5bGVzO1xuXG4vLyBzcmMvZGlhZ3JhbXMvZXIvZXJEaWFncmFtLnRzXG52YXIgZGlhZ3JhbSA9IHtcbiAgcGFyc2VyOiBlckRpYWdyYW1fZGVmYXVsdCxcbiAgZ2V0IGRiKCkge1xuICAgIHJldHVybiBuZXcgRXJEQigpO1xuICB9LFxuICByZW5kZXJlcjogZXJSZW5kZXJlcl91bmlmaWVkX2V4cG9ydHMsXG4gIHN0eWxlczogc3R5bGVzX2RlZmF1bHRcbn07XG5leHBvcnQge1xuICBkaWFncmFtXG59O1xuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXFDQSxJQUFJLFNBQVUsUUFBUSxHQUFHO0FBQUEsRUFDdkIsSUFBSSxvQkFBb0IsT0FBTyxRQUFRLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRztBQUFBLElBQ25ELEtBQUssS0FBSyxNQUFNLENBQUMsR0FBRyxJQUFJLEVBQUUsT0FBUSxLQUFLLEdBQUcsRUFBRSxNQUFNO0FBQUE7QUFBQSxJQUNsRCxPQUFPO0FBQUEsS0FDTixHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFO0FBQUEsRUFDOWlDLElBQUksVUFBVTtBQUFBLElBQ1osdUJBQXVCLE9BQU8sU0FBUyxLQUFLLEdBQUcsSUFDNUMsT0FBTztBQUFBLElBQ1YsSUFBSSxDQUFDO0FBQUEsSUFDTCxVQUFVLEVBQUUsT0FBUyxHQUFHLE9BQVMsR0FBRyxZQUFjLEdBQUcsVUFBWSxHQUFHLEtBQU8sR0FBRyxNQUFRLEdBQUcsT0FBUyxHQUFHLFdBQWEsR0FBRyxTQUFXLElBQUksWUFBYyxJQUFJLFNBQVcsSUFBSSxPQUFTLElBQUksTUFBUSxJQUFJLGlCQUFtQixJQUFJLFFBQVUsSUFBSSxhQUFlLElBQUksWUFBYyxJQUFJLFlBQWMsSUFBSSxLQUFPLElBQUksS0FBTyxJQUFJLE9BQVMsSUFBSSxhQUFlLElBQUksV0FBYSxJQUFJLGlCQUFtQixJQUFJLFdBQWEsSUFBSSxpQkFBbUIsSUFBSSwyQkFBNkIsSUFBSSxXQUFhLElBQUksbUJBQXFCLElBQUksZ0JBQWtCLElBQUksZ0JBQWtCLElBQUksY0FBZ0IsSUFBSSxjQUFnQixJQUFJLGNBQWdCLElBQUksY0FBZ0IsSUFBSSxVQUFZLElBQUksV0FBYSxJQUFJLFdBQWEsSUFBSSxjQUFnQixJQUFJLFlBQWMsSUFBSSxPQUFTLElBQUksT0FBUyxJQUFJLE9BQVMsSUFBSSxPQUFTLElBQUksZ0JBQWtCLElBQUksTUFBUSxJQUFJLEtBQU8sSUFBSSxNQUFRLElBQUksYUFBZSxJQUFJLGFBQWUsSUFBSSxZQUFjLElBQUksV0FBYSxJQUFJLGVBQWlCLElBQUksZUFBaUIsSUFBSSxzQkFBd0IsSUFBSSxrQkFBb0IsSUFBSSxnQkFBa0IsSUFBSSxrQkFBb0IsSUFBSSxLQUFLLElBQUksZUFBaUIsSUFBSSxTQUFXLElBQUksYUFBZSxJQUFJLFNBQVcsSUFBSSxhQUFlLElBQUksY0FBZ0IsSUFBSSxhQUFlLElBQUksVUFBWSxJQUFJLFdBQWEsSUFBSSxpQkFBbUIsSUFBSSxhQUFlLElBQUksTUFBUSxJQUFJLFNBQVcsR0FBRyxNQUFRLEVBQUU7QUFBQSxJQUN6dkMsWUFBWSxFQUFFLEdBQUcsU0FBUyxHQUFHLGNBQWMsR0FBRyxPQUFPLEdBQUcsU0FBUyxJQUFJLFdBQVcsSUFBSSxTQUFTLElBQUksbUJBQW1CLElBQUksZUFBZSxJQUFJLGNBQWMsSUFBSSxPQUFPLElBQUksT0FBTyxJQUFJLFNBQVMsSUFBSSxlQUFlLElBQUksYUFBYSxJQUFJLG1CQUFtQixJQUFJLGFBQWEsSUFBSSxtQkFBbUIsSUFBSSw2QkFBNkIsSUFBSSxnQkFBZ0IsSUFBSSxnQkFBZ0IsSUFBSSxnQkFBZ0IsSUFBSSxnQkFBZ0IsSUFBSSxZQUFZLElBQUksZ0JBQWdCLElBQUksY0FBYyxJQUFJLFNBQVMsSUFBSSxTQUFTLElBQUksU0FBUyxJQUFJLFFBQVEsSUFBSSxPQUFPLElBQUksUUFBUSxJQUFJLGVBQWUsSUFBSSxlQUFlLElBQUksY0FBYyxJQUFJLGtCQUFrQixJQUFJLEtBQUssSUFBSSxpQkFBaUIsSUFBSSxXQUFXLElBQUksZUFBZSxJQUFJLGdCQUFnQixJQUFJLGVBQWUsSUFBSSxZQUFZLElBQUksYUFBYSxJQUFJLG1CQUFtQixJQUFJLGVBQWUsSUFBSSxPQUFPO0FBQUEsSUFDM3hCLGNBQWMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQUEsSUFDMXNCLCtCQUErQixPQUFPLFNBQVMsU0FBUyxDQUFDLFFBQVEsUUFBUSxVQUFVLElBQUksU0FBUyxJQUFJLElBQUk7QUFBQSxNQUN0RyxJQUFJLEtBQUssR0FBRyxTQUFTO0FBQUEsTUFDckIsUUFBUTtBQUFBLGFBQ0Q7QUFBQSxVQUNIO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLENBQUM7QUFBQSxVQUNWO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEdBQUc7QUFBQSxVQUN0QixLQUFLLElBQUksR0FBRyxLQUFLO0FBQUEsVUFDakI7QUFBQSxhQUNHO0FBQUEsYUFDQTtBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUc7QUFBQSxVQUNaO0FBQUEsYUFDRztBQUFBLGFBQ0E7QUFBQSxVQUNILEtBQUssSUFBSSxDQUFDO0FBQUEsVUFDVjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsVUFBVSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ3ZCLEdBQUcsVUFBVSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ3ZCLEdBQUcsZ0JBQWdCLEdBQUcsS0FBSyxJQUFJLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQzdEO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxVQUFVLEdBQUcsS0FBSyxFQUFFO0FBQUEsVUFDdkIsR0FBRyxVQUFVLEdBQUcsS0FBSyxFQUFFO0FBQUEsVUFDdkIsR0FBRyxnQkFBZ0IsR0FBRyxLQUFLLElBQUksR0FBRyxLQUFLLEdBQUcsS0FBSyxJQUFJLEdBQUcsS0FBSyxFQUFFO0FBQUEsVUFDN0QsR0FBRyxTQUFTLENBQUMsR0FBRyxLQUFLLEVBQUUsR0FBRyxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ3BDLEdBQUcsU0FBUyxDQUFDLEdBQUcsS0FBSyxFQUFFLEdBQUcsR0FBRyxLQUFLLEVBQUU7QUFBQSxVQUNwQztBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsVUFBVSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ3ZCLEdBQUcsVUFBVSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ3ZCLEdBQUcsZ0JBQWdCLEdBQUcsS0FBSyxJQUFJLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQzdELEdBQUcsU0FBUyxDQUFDLEdBQUcsS0FBSyxFQUFFLEdBQUcsR0FBRyxLQUFLLEVBQUU7QUFBQSxVQUNwQztBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsVUFBVSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ3ZCLEdBQUcsVUFBVSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ3ZCLEdBQUcsZ0JBQWdCLEdBQUcsS0FBSyxJQUFJLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQzdELEdBQUcsU0FBUyxDQUFDLEdBQUcsS0FBSyxFQUFFLEdBQUcsR0FBRyxLQUFLLEVBQUU7QUFBQSxVQUNwQztBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsVUFBVSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ3ZCLEdBQUcsY0FBYyxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ3ZDO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxVQUFVLEdBQUcsS0FBSyxFQUFFO0FBQUEsVUFDdkIsR0FBRyxjQUFjLEdBQUcsS0FBSyxJQUFJLEdBQUcsS0FBSyxFQUFFO0FBQUEsVUFDdkMsR0FBRyxTQUFTLENBQUMsR0FBRyxLQUFLLEVBQUUsR0FBRyxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ3BDO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxVQUFVLEdBQUcsS0FBSyxFQUFFO0FBQUEsVUFDdkI7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLFVBQVUsR0FBRyxLQUFLLEVBQUU7QUFBQSxVQUN2QixHQUFHLFNBQVMsQ0FBQyxHQUFHLEtBQUssRUFBRSxHQUFHLEdBQUcsS0FBSyxFQUFFO0FBQUEsVUFDcEM7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QUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksSUFBSSxHQUFHLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVB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LFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFB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QUFLLFFBQVEsZUFBZSxHQUFHO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0JBSTFHLGFBQWEsSUFBSSxLQUFLLEtBQUssd0JBQXdCLHdCQUF3QixRQUFRO0FBQUE7QUFBQTtBQUFBLFlBRy9GLGFBQWEsSUFBSSxLQUFLLEtBQUssd0JBQXdCLHdCQUF3QixRQUFRO0FBQUE7QUFBQTtBQUFBLFlBR25GLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQUlSLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQUtELFFBQVE7QUFBQSxhQUNkLFFBQVEsaUJBQWlCLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsWUFZbEMsUUFBUTtBQUFBLGNBQ04sUUFBUTtBQUFBLG9CQUNGLFNBQVMsUUFBUSxjQUFjO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FJckMsUUFBUTtBQUFBLG9CQUNGLFNBQVMsUUFBUSxjQUFjO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGNBTXJDLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQSx3QkFJRSxLQUFLLFFBQVEsZUFBZSxHQUFHO0FBQUE7QUFBQTtBQUFBLEdBR3BELFdBQVc7QUFDZCxJQUFJLGlCQUFpQjtBQUdyQixJQUFJLFVBQVU7QUFBQSxFQUNaLFFBQVE7QUFBQSxNQUNKLEVBQUUsR0FBRztBQUFBLElBQ1AsT0FBTyxJQUFJO0FBQUE7QUFBQSxFQUViLFVBQVU7QUFBQSxFQUNWLFFBQVE7QUFDVjsiLAogICJkZWJ1Z0lkIjogIjdGODM3RjMzMUE0MjVFQUE2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
