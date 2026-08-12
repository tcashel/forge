import {
  getIconStyles
} from "./chunk-main-0ekgv9a6.js";
import {
  createTooltip
} from "./chunk-main-sxwy6e53.js";
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
import {
  getEdgeId,
  utils_default
} from "./chunk-main-vvfzntzy.js";
import {
  clear,
  common_default,
  getAccDescription,
  getAccTitle,
  getConfig2,
  getDiagramTitle,
  parseGenericTypes,
  purify,
  sanitizeText,
  setAccDescription,
  setAccTitle,
  setDiagramTitle
} from "./chunk-main-aws590jt.js";
import {
  __name,
  log,
  select_default
} from "./chunk-main-vcnyggwp.js";

// node_modules/mermaid/dist/chunks/mermaid.core/chunk-727SXJPM.mjs
var parser = function() {
  var o = /* @__PURE__ */ __name(function(k, v, o2, l) {
    for (o2 = o2 || {}, l = k.length;l--; o2[k[l]] = v)
      ;
    return o2;
  }, "o"), $V0 = [1, 18], $V1 = [1, 19], $V2 = [1, 20], $V3 = [1, 41], $V4 = [1, 26], $V5 = [1, 42], $V6 = [1, 24], $V7 = [1, 25], $V8 = [1, 32], $V9 = [1, 33], $Va = [1, 34], $Vb = [1, 45], $Vc = [1, 35], $Vd = [1, 36], $Ve = [1, 37], $Vf = [1, 38], $Vg = [1, 27], $Vh = [1, 28], $Vi = [1, 29], $Vj = [1, 30], $Vk = [1, 31], $Vl = [1, 44], $Vm = [1, 46], $Vn = [1, 43], $Vo = [1, 47], $Vp = [1, 9], $Vq = [1, 8, 9], $Vr = [1, 58], $Vs = [1, 59], $Vt = [1, 60], $Vu = [1, 61], $Vv = [1, 62], $Vw = [1, 63], $Vx = [1, 64], $Vy = [1, 8, 9, 41], $Vz = [1, 77], $VA = [1, 8, 9, 12, 13, 22, 39, 41, 44, 46, 68, 69, 70, 71, 72, 73, 74, 79, 81], $VB = [1, 8, 9, 12, 13, 18, 20, 22, 39, 41, 44, 46, 47, 60, 68, 69, 70, 71, 72, 73, 74, 79, 81, 86, 100, 102, 103], $VC = [13, 60, 86, 100, 102, 103], $VD = [13, 60, 73, 74, 86, 100, 102, 103], $VE = [13, 60, 68, 69, 70, 71, 72, 86, 100, 102, 103], $VF = [1, 103], $VG = [1, 121], $VH = [1, 117], $VI = [1, 113], $VJ = [1, 119], $VK = [1, 114], $VL = [1, 115], $VM = [1, 116], $VN = [1, 118], $VO = [1, 120], $VP = [22, 50, 60, 61, 82, 86, 87, 88, 89, 90], $VQ = [1, 128], $VR = [12, 39], $VS = [1, 8, 9, 39, 41, 44, 46], $VT = [1, 8, 9, 22], $VU = [1, 153], $VV = [1, 8, 9, 61], $VW = [1, 8, 9, 22, 50, 60, 61, 82, 86, 87, 88, 89, 90];
  var parser2 = {
    trace: /* @__PURE__ */ __name(function trace() {}, "trace"),
    yy: {},
    symbols_: { error: 2, start: 3, mermaidDoc: 4, statements: 5, graphConfig: 6, CLASS_DIAGRAM: 7, NEWLINE: 8, EOF: 9, statement: 10, classLabel: 11, SQS: 12, STR: 13, SQE: 14, namespaceName: 15, alphaNumToken: 16, classLiteralName: 17, DOT: 18, className: 19, GENERICTYPE: 20, relationStatement: 21, LABEL: 22, namespaceStatement: 23, classStatement: 24, memberStatement: 25, annotationStatement: 26, clickStatement: 27, styleStatement: 28, cssClassStatement: 29, noteStatement: 30, classDefStatement: 31, direction: 32, acc_title: 33, acc_title_value: 34, acc_descr: 35, acc_descr_value: 36, acc_descr_multiline_value: 37, namespaceIdentifier: 38, STRUCT_START: 39, classStatements: 40, STRUCT_STOP: 41, NAMESPACE: 42, classIdentifier: 43, STYLE_SEPARATOR: 44, members: 45, ANNOTATION_START: 46, ANNOTATION_END: 47, CLASS: 48, emptyBody: 49, SPACE: 50, MEMBER: 51, SEPARATOR: 52, relation: 53, NOTE_FOR: 54, noteText: 55, NOTE: 56, CLASSDEF: 57, classList: 58, stylesOpt: 59, ALPHA: 60, COMMA: 61, direction_tb: 62, direction_bt: 63, direction_rl: 64, direction_lr: 65, relationType: 66, lineType: 67, AGGREGATION: 68, EXTENSION: 69, COMPOSITION: 70, DEPENDENCY: 71, LOLLIPOP: 72, LINE: 73, DOTTED_LINE: 74, CALLBACK: 75, LINK: 76, LINK_TARGET: 77, CLICK: 78, CALLBACK_NAME: 79, CALLBACK_ARGS: 80, HREF: 81, STYLE: 82, CSSCLASS: 83, style: 84, styleComponent: 85, NUM: 86, COLON: 87, UNIT: 88, BRKT: 89, PCT: 90, commentToken: 91, textToken: 92, graphCodeTokens: 93, textNoTagsToken: 94, TAGSTART: 95, TAGEND: 96, "==": 97, "--": 98, DEFAULT: 99, MINUS: 100, keywords: 101, UNICODE_TEXT: 102, BQUOTE_STR: 103, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 7: "CLASS_DIAGRAM", 8: "NEWLINE", 9: "EOF", 12: "SQS", 13: "STR", 14: "SQE", 18: "DOT", 20: "GENERICTYPE", 22: "LABEL", 33: "acc_title", 34: "acc_title_value", 35: "acc_descr", 36: "acc_descr_value", 37: "acc_descr_multiline_value", 39: "STRUCT_START", 41: "STRUCT_STOP", 42: "NAMESPACE", 44: "STYLE_SEPARATOR", 46: "ANNOTATION_START", 47: "ANNOTATION_END", 48: "CLASS", 50: "SPACE", 51: "MEMBER", 52: "SEPARATOR", 54: "NOTE_FOR", 56: "NOTE", 57: "CLASSDEF", 60: "ALPHA", 61: "COMMA", 62: "direction_tb", 63: "direction_bt", 64: "direction_rl", 65: "direction_lr", 68: "AGGREGATION", 69: "EXTENSION", 70: "COMPOSITION", 71: "DEPENDENCY", 72: "LOLLIPOP", 73: "LINE", 74: "DOTTED_LINE", 75: "CALLBACK", 76: "LINK", 77: "LINK_TARGET", 78: "CLICK", 79: "CALLBACK_NAME", 80: "CALLBACK_ARGS", 81: "HREF", 82: "STYLE", 83: "CSSCLASS", 86: "NUM", 87: "COLON", 88: "UNIT", 89: "BRKT", 90: "PCT", 93: "graphCodeTokens", 95: "TAGSTART", 96: "TAGEND", 97: "==", 98: "--", 99: "DEFAULT", 100: "MINUS", 101: "keywords", 102: "UNICODE_TEXT", 103: "BQUOTE_STR" },
    productions_: [0, [3, 1], [3, 1], [4, 1], [6, 4], [5, 1], [5, 2], [5, 3], [11, 3], [15, 1], [15, 1], [15, 3], [15, 2], [19, 1], [19, 3], [19, 1], [19, 2], [19, 2], [19, 2], [10, 1], [10, 2], [10, 1], [10, 1], [10, 1], [10, 1], [10, 1], [10, 1], [10, 1], [10, 1], [10, 1], [10, 1], [10, 2], [10, 2], [10, 1], [23, 4], [23, 5], [38, 2], [38, 3], [40, 1], [40, 2], [40, 3], [40, 1], [40, 2], [40, 3], [40, 1], [40, 2], [40, 3], [24, 1], [24, 3], [24, 4], [24, 3], [24, 6], [24, 4], [24, 7], [24, 6], [43, 2], [43, 3], [49, 0], [49, 2], [49, 2], [26, 4], [45, 1], [45, 2], [25, 1], [25, 2], [25, 1], [25, 1], [21, 3], [21, 4], [21, 4], [21, 5], [30, 3], [30, 2], [31, 3], [58, 1], [58, 3], [32, 1], [32, 1], [32, 1], [32, 1], [53, 3], [53, 2], [53, 2], [53, 1], [66, 1], [66, 1], [66, 1], [66, 1], [66, 1], [67, 1], [67, 1], [27, 3], [27, 4], [27, 3], [27, 4], [27, 4], [27, 5], [27, 3], [27, 4], [27, 4], [27, 5], [27, 4], [27, 5], [27, 5], [27, 6], [28, 3], [29, 3], [59, 1], [59, 3], [84, 1], [84, 2], [85, 1], [85, 1], [85, 1], [85, 1], [85, 1], [85, 1], [85, 1], [85, 1], [85, 1], [91, 1], [91, 1], [92, 1], [92, 1], [92, 1], [92, 1], [92, 1], [92, 1], [92, 1], [94, 1], [94, 1], [94, 1], [94, 1], [16, 1], [16, 1], [16, 1], [16, 1], [17, 1], [55, 1]],
    performAction: /* @__PURE__ */ __name(function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
      var $0 = $$.length - 1;
      switch (yystate) {
        case 8:
          this.$ = $$[$0 - 1];
          break;
        case 9:
        case 10:
        case 13:
        case 15:
          this.$ = $$[$0];
          break;
        case 11:
        case 14:
          this.$ = $$[$0 - 2] + "." + $$[$0];
          break;
        case 12:
        case 16:
          this.$ = $$[$0 - 1] + $$[$0];
          break;
        case 17:
        case 18:
          this.$ = $$[$0 - 1] + "~" + $$[$0] + "~";
          break;
        case 19:
          yy.addRelation($$[$0]);
          break;
        case 20:
          $$[$0 - 1].title = yy.cleanupLabel($$[$0]);
          yy.addRelation($$[$0 - 1]);
          break;
        case 31:
          this.$ = $$[$0].trim();
          yy.setAccTitle(this.$);
          break;
        case 32:
        case 33:
          this.$ = $$[$0].trim();
          yy.setAccDescription(this.$);
          break;
        case 34:
          yy.addClassesToNamespace($$[$0 - 3], $$[$0 - 1][0], $$[$0 - 1][1]);
          yy.popNamespace();
          break;
        case 35:
          yy.addClassesToNamespace($$[$0 - 4], $$[$0 - 1][0], $$[$0 - 1][1]);
          yy.popNamespace();
          break;
        case 36:
          this.$ = yy.addNamespace($$[$0]);
          break;
        case 37:
          this.$ = yy.addNamespace($$[$0 - 1], $$[$0]);
          break;
        case 38:
          this.$ = [[$$[$0]], []];
          break;
        case 39:
          this.$ = [[$$[$0 - 1]], []];
          break;
        case 40:
          $$[$0][0].unshift($$[$0 - 2]);
          this.$ = $$[$0];
          break;
        case 41:
          this.$ = [[], [$$[$0]]];
          break;
        case 42:
          this.$ = [[], [$$[$0 - 1]]];
          break;
        case 43:
          $$[$0][1].unshift($$[$0 - 2]);
          this.$ = $$[$0];
          break;
        case 44:
        case 45:
          this.$ = [[], []];
          break;
        case 46:
          this.$ = $$[$0];
          break;
        case 48:
          yy.setCssClass($$[$0 - 2], $$[$0]);
          break;
        case 49:
          yy.addMembers($$[$0 - 3], $$[$0 - 1]);
          break;
        case 51:
          yy.setCssClass($$[$0 - 5], $$[$0 - 3]);
          yy.addMembers($$[$0 - 5], $$[$0 - 1]);
          break;
        case 52:
          yy.addAnnotation($$[$0 - 3], $$[$0 - 1]);
          break;
        case 53:
          yy.addAnnotation($$[$0 - 6], $$[$0 - 4]);
          yy.addMembers($$[$0 - 6], $$[$0 - 1]);
          break;
        case 54:
          yy.addAnnotation($$[$0 - 5], $$[$0 - 3]);
          break;
        case 55:
          this.$ = $$[$0];
          yy.addClass($$[$0]);
          break;
        case 56:
          this.$ = $$[$0 - 1];
          yy.addClass($$[$0 - 1]);
          yy.setClassLabel($$[$0 - 1], $$[$0]);
          break;
        case 60:
          yy.addAnnotation($$[$0], $$[$0 - 2]);
          break;
        case 61:
        case 74:
          this.$ = [$$[$0]];
          break;
        case 62:
          $$[$0].push($$[$0 - 1]);
          this.$ = $$[$0];
          break;
        case 63:
          break;
        case 64:
          yy.addMember($$[$0 - 1], yy.cleanupLabel($$[$0]));
          break;
        case 65:
          break;
        case 66:
          break;
        case 67:
          this.$ = { id1: $$[$0 - 2], id2: $$[$0], relation: $$[$0 - 1], relationTitle1: "none", relationTitle2: "none" };
          break;
        case 68:
          this.$ = { id1: $$[$0 - 3], id2: $$[$0], relation: $$[$0 - 1], relationTitle1: $$[$0 - 2], relationTitle2: "none" };
          break;
        case 69:
          this.$ = { id1: $$[$0 - 3], id2: $$[$0], relation: $$[$0 - 2], relationTitle1: "none", relationTitle2: $$[$0 - 1] };
          break;
        case 70:
          this.$ = { id1: $$[$0 - 4], id2: $$[$0], relation: $$[$0 - 2], relationTitle1: $$[$0 - 3], relationTitle2: $$[$0 - 1] };
          break;
        case 71:
          this.$ = yy.addNote($$[$0], $$[$0 - 1]);
          break;
        case 72:
          this.$ = yy.addNote($$[$0]);
          break;
        case 73:
          this.$ = $$[$0 - 2];
          yy.defineClass($$[$0 - 1], $$[$0]);
          break;
        case 75:
          this.$ = $$[$0 - 2].concat([$$[$0]]);
          break;
        case 76:
          yy.setDirection("TB");
          break;
        case 77:
          yy.setDirection("BT");
          break;
        case 78:
          yy.setDirection("RL");
          break;
        case 79:
          yy.setDirection("LR");
          break;
        case 80:
          this.$ = { type1: $$[$0 - 2], type2: $$[$0], lineType: $$[$0 - 1] };
          break;
        case 81:
          this.$ = { type1: "none", type2: $$[$0], lineType: $$[$0 - 1] };
          break;
        case 82:
          this.$ = { type1: $$[$0 - 1], type2: "none", lineType: $$[$0] };
          break;
        case 83:
          this.$ = { type1: "none", type2: "none", lineType: $$[$0] };
          break;
        case 84:
          this.$ = yy.relationType.AGGREGATION;
          break;
        case 85:
          this.$ = yy.relationType.EXTENSION;
          break;
        case 86:
          this.$ = yy.relationType.COMPOSITION;
          break;
        case 87:
          this.$ = yy.relationType.DEPENDENCY;
          break;
        case 88:
          this.$ = yy.relationType.LOLLIPOP;
          break;
        case 89:
          this.$ = yy.lineType.LINE;
          break;
        case 90:
          this.$ = yy.lineType.DOTTED_LINE;
          break;
        case 91:
        case 97:
          this.$ = $$[$0 - 2];
          yy.setClickEvent($$[$0 - 1], $$[$0]);
          break;
        case 92:
        case 98:
          this.$ = $$[$0 - 3];
          yy.setClickEvent($$[$0 - 2], $$[$0 - 1]);
          yy.setTooltip($$[$0 - 2], $$[$0]);
          break;
        case 93:
          this.$ = $$[$0 - 2];
          yy.setLink($$[$0 - 1], $$[$0]);
          break;
        case 94:
          this.$ = $$[$0 - 3];
          yy.setLink($$[$0 - 2], $$[$0 - 1], $$[$0]);
          break;
        case 95:
          this.$ = $$[$0 - 3];
          yy.setLink($$[$0 - 2], $$[$0 - 1]);
          yy.setTooltip($$[$0 - 2], $$[$0]);
          break;
        case 96:
          this.$ = $$[$0 - 4];
          yy.setLink($$[$0 - 3], $$[$0 - 2], $$[$0]);
          yy.setTooltip($$[$0 - 3], $$[$0 - 1]);
          break;
        case 99:
          this.$ = $$[$0 - 3];
          yy.setClickEvent($$[$0 - 2], $$[$0 - 1], $$[$0]);
          break;
        case 100:
          this.$ = $$[$0 - 4];
          yy.setClickEvent($$[$0 - 3], $$[$0 - 2], $$[$0 - 1]);
          yy.setTooltip($$[$0 - 3], $$[$0]);
          break;
        case 101:
          this.$ = $$[$0 - 3];
          yy.setLink($$[$0 - 2], $$[$0]);
          break;
        case 102:
          this.$ = $$[$0 - 4];
          yy.setLink($$[$0 - 3], $$[$0 - 1], $$[$0]);
          break;
        case 103:
          this.$ = $$[$0 - 4];
          yy.setLink($$[$0 - 3], $$[$0 - 1]);
          yy.setTooltip($$[$0 - 3], $$[$0]);
          break;
        case 104:
          this.$ = $$[$0 - 5];
          yy.setLink($$[$0 - 4], $$[$0 - 2], $$[$0]);
          yy.setTooltip($$[$0 - 4], $$[$0 - 1]);
          break;
        case 105:
          this.$ = $$[$0 - 2];
          yy.setCssStyle($$[$0 - 1], $$[$0]);
          break;
        case 106:
          yy.setCssClass($$[$0 - 1], $$[$0]);
          break;
        case 107:
          this.$ = [$$[$0]];
          break;
        case 108:
          $$[$0 - 2].push($$[$0]);
          this.$ = $$[$0 - 2];
          break;
        case 110:
          this.$ = $$[$0 - 1] + $$[$0];
          break;
      }
    }, "anonymous"),
    table: [{ 3: 1, 4: 2, 5: 3, 6: 4, 7: [1, 6], 10: 5, 16: 39, 17: 40, 19: 21, 21: 7, 23: 8, 24: 9, 25: 10, 26: 11, 27: 12, 28: 13, 29: 14, 30: 15, 31: 16, 32: 17, 33: $V0, 35: $V1, 37: $V2, 38: 22, 42: $V3, 43: 23, 46: $V4, 48: $V5, 51: $V6, 52: $V7, 54: $V8, 56: $V9, 57: $Va, 60: $Vb, 62: $Vc, 63: $Vd, 64: $Ve, 65: $Vf, 75: $Vg, 76: $Vh, 78: $Vi, 82: $Vj, 83: $Vk, 86: $Vl, 100: $Vm, 102: $Vn, 103: $Vo }, { 1: [3] }, { 1: [2, 1] }, { 1: [2, 2] }, { 1: [2, 3] }, o($Vp, [2, 5], { 8: [1, 48] }), { 8: [1, 49] }, o($Vq, [2, 19], { 22: [1, 50] }), o($Vq, [2, 21]), o($Vq, [2, 22]), o($Vq, [2, 23]), o($Vq, [2, 24]), o($Vq, [2, 25]), o($Vq, [2, 26]), o($Vq, [2, 27]), o($Vq, [2, 28]), o($Vq, [2, 29]), o($Vq, [2, 30]), { 34: [1, 51] }, { 36: [1, 52] }, o($Vq, [2, 33]), o($Vq, [2, 63], { 53: 53, 66: 56, 67: 57, 13: [1, 54], 22: [1, 55], 68: $Vr, 69: $Vs, 70: $Vt, 71: $Vu, 72: $Vv, 73: $Vw, 74: $Vx }), { 39: [1, 65] }, o($Vy, [2, 47], { 39: [1, 67], 44: [1, 66], 46: [1, 68] }), o($Vq, [2, 65]), o($Vq, [2, 66]), { 16: 69, 60: $Vb, 86: $Vl, 100: $Vm, 102: $Vn }, { 16: 39, 17: 40, 19: 70, 60: $Vb, 86: $Vl, 100: $Vm, 102: $Vn, 103: $Vo }, { 16: 39, 17: 40, 19: 71, 60: $Vb, 86: $Vl, 100: $Vm, 102: $Vn, 103: $Vo }, { 16: 39, 17: 40, 19: 72, 60: $Vb, 86: $Vl, 100: $Vm, 102: $Vn, 103: $Vo }, { 60: [1, 73] }, { 13: [1, 74] }, { 16: 39, 17: 40, 19: 75, 60: $Vb, 86: $Vl, 100: $Vm, 102: $Vn, 103: $Vo }, { 13: $Vz, 55: 76 }, { 58: 78, 60: [1, 79] }, o($Vq, [2, 76]), o($Vq, [2, 77]), o($Vq, [2, 78]), o($Vq, [2, 79]), o($VA, [2, 13], { 16: 39, 17: 40, 19: 81, 18: [1, 80], 20: [1, 82], 60: $Vb, 86: $Vl, 100: $Vm, 102: $Vn, 103: $Vo }), o($VA, [2, 15], { 20: [1, 83] }), { 15: 84, 16: 85, 17: 86, 60: $Vb, 86: $Vl, 100: $Vm, 102: $Vn, 103: $Vo }, { 16: 39, 17: 40, 19: 87, 60: $Vb, 86: $Vl, 100: $Vm, 102: $Vn, 103: $Vo }, o($VB, [2, 133]), o($VB, [2, 134]), o($VB, [2, 135]), o($VB, [2, 136]), o([1, 8, 9, 12, 13, 20, 22, 39, 41, 44, 46, 68, 69, 70, 71, 72, 73, 74, 79, 81], [2, 137]), o($Vp, [2, 6], { 10: 5, 21: 7, 23: 8, 24: 9, 25: 10, 26: 11, 27: 12, 28: 13, 29: 14, 30: 15, 31: 16, 32: 17, 19: 21, 38: 22, 43: 23, 16: 39, 17: 40, 5: 88, 33: $V0, 35: $V1, 37: $V2, 42: $V3, 46: $V4, 48: $V5, 51: $V6, 52: $V7, 54: $V8, 56: $V9, 57: $Va, 60: $Vb, 62: $Vc, 63: $Vd, 64: $Ve, 65: $Vf, 75: $Vg, 76: $Vh, 78: $Vi, 82: $Vj, 83: $Vk, 86: $Vl, 100: $Vm, 102: $Vn, 103: $Vo }), { 5: 89, 10: 5, 16: 39, 17: 40, 19: 21, 21: 7, 23: 8, 24: 9, 25: 10, 26: 11, 27: 12, 28: 13, 29: 14, 30: 15, 31: 16, 32: 17, 33: $V0, 35: $V1, 37: $V2, 38: 22, 42: $V3, 43: 23, 46: $V4, 48: $V5, 51: $V6, 52: $V7, 54: $V8, 56: $V9, 57: $Va, 60: $Vb, 62: $Vc, 63: $Vd, 64: $Ve, 65: $Vf, 75: $Vg, 76: $Vh, 78: $Vi, 82: $Vj, 83: $Vk, 86: $Vl, 100: $Vm, 102: $Vn, 103: $Vo }, o($Vq, [2, 20]), o($Vq, [2, 31]), o($Vq, [2, 32]), { 13: [1, 91], 16: 39, 17: 40, 19: 90, 60: $Vb, 86: $Vl, 100: $Vm, 102: $Vn, 103: $Vo }, { 53: 92, 66: 56, 67: 57, 68: $Vr, 69: $Vs, 70: $Vt, 71: $Vu, 72: $Vv, 73: $Vw, 74: $Vx }, o($Vq, [2, 64]), { 67: 93, 73: $Vw, 74: $Vx }, o($VC, [2, 83], { 66: 94, 68: $Vr, 69: $Vs, 70: $Vt, 71: $Vu, 72: $Vv }), o($VD, [2, 84]), o($VD, [2, 85]), o($VD, [2, 86]), o($VD, [2, 87]), o($VD, [2, 88]), o($VE, [2, 89]), o($VE, [2, 90]), { 8: [1, 96], 23: 99, 24: 97, 30: 98, 38: 22, 40: 95, 42: $V3, 43: 23, 48: $V5, 54: $V8, 56: $V9 }, { 16: 100, 60: $Vb, 86: $Vl, 100: $Vm, 102: $Vn }, { 41: [1, 102], 45: 101, 51: $VF }, { 16: 104, 60: $Vb, 86: $Vl, 100: $Vm, 102: $Vn }, { 47: [1, 105] }, { 13: [1, 106] }, { 13: [1, 107] }, { 79: [1, 108], 81: [1, 109] }, { 22: $VG, 50: $VH, 59: 110, 60: $VI, 82: $VJ, 84: 111, 85: 112, 86: $VK, 87: $VL, 88: $VM, 89: $VN, 90: $VO }, { 60: [1, 122] }, { 13: $Vz, 55: 123 }, o($Vy, [2, 72]), o($Vy, [2, 138]), { 22: $VG, 50: $VH, 59: 124, 60: $VI, 61: [1, 125], 82: $VJ, 84: 111, 85: 112, 86: $VK, 87: $VL, 88: $VM, 89: $VN, 90: $VO }, o($VP, [2, 74]), { 16: 39, 17: 40, 19: 126, 60: $Vb, 86: $Vl, 100: $Vm, 102: $Vn, 103: $Vo }, o($VA, [2, 16]), o($VA, [2, 17]), o($VA, [2, 18]), { 11: 127, 12: $VQ, 39: [2, 36] }, o($VR, [2, 9], { 16: 85, 17: 86, 15: 130, 18: [1, 129], 60: $Vb, 86: $Vl, 100: $Vm, 102: $Vn, 103: $Vo }), o($VR, [2, 10]), o($VS, [2, 55], { 11: 131, 12: $VQ }), o($Vp, [2, 7]), { 9: [1, 132] }, o($VT, [2, 67]), { 16: 39, 17: 40, 19: 133, 60: $Vb, 86: $Vl, 100: $Vm, 102: $Vn, 103: $Vo }, { 13: [1, 135], 16: 39, 17: 40, 19: 134, 60: $Vb, 86: $Vl, 100: $Vm, 102: $Vn, 103: $Vo }, o($VC, [2, 82], { 66: 136, 68: $Vr, 69: $Vs, 70: $Vt, 71: $Vu, 72: $Vv }), o($VC, [2, 81]), { 41: [1, 137] }, { 23: 99, 24: 97, 30: 98, 38: 22, 40: 138, 42: $V3, 43: 23, 48: $V5, 54: $V8, 56: $V9 }, { 8: [1, 139], 41: [2, 38] }, { 8: [1, 140], 41: [2, 41] }, { 8: [1, 141], 41: [2, 44] }, o($Vy, [2, 48], { 39: [1, 142] }), { 41: [1, 143] }, o($Vy, [2, 50]), { 41: [2, 61], 45: 144, 51: $VF }, { 47: [1, 145] }, { 16: 39, 17: 40, 19: 146, 60: $Vb, 86: $Vl, 100: $Vm, 102: $Vn, 103: $Vo }, o($Vq, [2, 91], { 13: [1, 147] }), o($Vq, [2, 93], { 13: [1, 149], 77: [1, 148] }), o($Vq, [2, 97], { 13: [1, 150], 80: [1, 151] }), { 13: [1, 152] }, o($Vq, [2, 105], { 61: $VU }), o($VV, [2, 107], { 85: 154, 22: $VG, 50: $VH, 60: $VI, 82: $VJ, 86: $VK, 87: $VL, 88: $VM, 89: $VN, 90: $VO }), o($VW, [2, 109]), o($VW, [2, 111]), o($VW, [2, 112]), o($VW, [2, 113]), o($VW, [2, 114]), o($VW, [2, 115]), o($VW, [2, 116]), o($VW, [2, 117]), o($VW, [2, 118]), o($VW, [2, 119]), o($Vq, [2, 106]), o($Vy, [2, 71]), o($Vq, [2, 73], { 61: $VU }), { 60: [1, 155] }, o($VA, [2, 14]), { 39: [2, 37] }, { 13: [1, 156] }, { 15: 157, 16: 85, 17: 86, 60: $Vb, 86: $Vl, 100: $Vm, 102: $Vn, 103: $Vo }, o($VR, [2, 12]), o($VS, [2, 56]), { 1: [2, 4] }, o($VT, [2, 69]), o($VT, [2, 68]), { 16: 39, 17: 40, 19: 158, 60: $Vb, 86: $Vl, 100: $Vm, 102: $Vn, 103: $Vo }, o($VC, [2, 80]), o($Vy, [2, 34]), { 41: [1, 159] }, { 23: 99, 24: 97, 30: 98, 38: 22, 40: 160, 41: [2, 39], 42: $V3, 43: 23, 48: $V5, 54: $V8, 56: $V9 }, { 23: 99, 24: 97, 30: 98, 38: 22, 40: 161, 41: [2, 42], 42: $V3, 43: 23, 48: $V5, 54: $V8, 56: $V9 }, { 23: 99, 24: 97, 30: 98, 38: 22, 40: 162, 41: [2, 45], 42: $V3, 43: 23, 48: $V5, 54: $V8, 56: $V9 }, { 45: 163, 51: $VF }, o($Vy, [2, 49]), { 41: [2, 62] }, o($Vy, [2, 52], { 39: [1, 164] }), o($Vq, [2, 60]), o($Vq, [2, 92]), o($Vq, [2, 94]), o($Vq, [2, 95], { 77: [1, 165] }), o($Vq, [2, 98]), o($Vq, [2, 99], { 13: [1, 166] }), o($Vq, [2, 101], { 13: [1, 168], 77: [1, 167] }), { 22: $VG, 50: $VH, 60: $VI, 82: $VJ, 84: 169, 85: 112, 86: $VK, 87: $VL, 88: $VM, 89: $VN, 90: $VO }, o($VW, [2, 110]), o($VP, [2, 75]), { 14: [1, 170] }, o($VR, [2, 11]), o($VT, [2, 70]), o($Vy, [2, 35]), { 41: [2, 40] }, { 41: [2, 43] }, { 41: [2, 46] }, { 41: [1, 171] }, { 41: [1, 173], 45: 172, 51: $VF }, o($Vq, [2, 96]), o($Vq, [2, 100]), o($Vq, [2, 102]), o($Vq, [2, 103], { 77: [1, 174] }), o($VV, [2, 108], { 85: 154, 22: $VG, 50: $VH, 60: $VI, 82: $VJ, 86: $VK, 87: $VL, 88: $VM, 89: $VN, 90: $VO }), o($VS, [2, 8]), o($Vy, [2, 51]), { 41: [1, 175] }, o($Vy, [2, 54]), o($Vq, [2, 104]), o($Vy, [2, 53])],
    defaultActions: { 2: [2, 1], 3: [2, 2], 4: [2, 3], 127: [2, 37], 132: [2, 4], 144: [2, 62], 160: [2, 40], 161: [2, 43], 162: [2, 46] },
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
      options: {},
      performAction: /* @__PURE__ */ __name(function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {
        var YYSTATE = YY_START;
        switch ($avoiding_name_collisions) {
          case 0:
            return 62;
            break;
          case 1:
            return 63;
            break;
          case 2:
            return 64;
            break;
          case 3:
            return 65;
            break;
          case 4:
            break;
          case 5:
            break;
          case 6:
            this.begin("acc_title");
            return 33;
            break;
          case 7:
            this.popState();
            return "acc_title_value";
            break;
          case 8:
            this.begin("acc_descr");
            return 35;
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
            return 8;
            break;
          case 14:
            break;
          case 15:
            return 7;
            break;
          case 16:
            return 7;
            break;
          case 17:
            return "EDGE_STATE";
            break;
          case 18:
            this.begin("callback_name");
            break;
          case 19:
            this.popState();
            break;
          case 20:
            this.popState();
            this.begin("callback_args");
            break;
          case 21:
            return 79;
            break;
          case 22:
            this.popState();
            break;
          case 23:
            return 80;
            break;
          case 24:
            this.popState();
            break;
          case 25:
            return "STR";
            break;
          case 26:
            this.begin("string");
            break;
          case 27:
            return 82;
            break;
          case 28:
            return 57;
            break;
          case 29:
            this.begin("namespace");
            return 42;
            break;
          case 30:
            this.popState();
            return 8;
            break;
          case 31:
            break;
          case 32:
            this.begin("namespace-body");
            return 39;
            break;
          case 33:
            this.popState();
            this.less(0);
            break;
          case 34:
            this.popState();
            return 41;
            break;
          case 35:
            return "EOF_IN_STRUCT";
            break;
          case 36:
            return 8;
            break;
          case 37:
            break;
          case 38:
            return "EDGE_STATE";
            break;
          case 39:
            this.begin("class");
            return 48;
            break;
          case 40:
            this.popState();
            return 8;
            break;
          case 41:
            break;
          case 42:
            this.popState();
            this.popState();
            return 41;
            break;
          case 43:
            this.begin("class-body");
            return 39;
            break;
          case 44:
            this.popState();
            return 41;
            break;
          case 45:
            return "EOF_IN_STRUCT";
            break;
          case 46:
            return "EDGE_STATE";
            break;
          case 47:
            return "OPEN_IN_STRUCT";
            break;
          case 48:
            break;
          case 49:
            return "MEMBER";
            break;
          case 50:
            return 83;
            break;
          case 51:
            return 75;
            break;
          case 52:
            return 76;
            break;
          case 53:
            return 78;
            break;
          case 54:
            return 54;
            break;
          case 55:
            return 56;
            break;
          case 56:
            return 46;
            break;
          case 57:
            return 47;
            break;
          case 58:
            return 81;
            break;
          case 59:
            this.popState();
            break;
          case 60:
            return "GENERICTYPE";
            break;
          case 61:
            this.begin("generic");
            break;
          case 62:
            this.popState();
            break;
          case 63:
            return "BQUOTE_STR";
            break;
          case 64:
            this.begin("bqstring");
            break;
          case 65:
            return 77;
            break;
          case 66:
            return 77;
            break;
          case 67:
            return 77;
            break;
          case 68:
            return 77;
            break;
          case 69:
            return 69;
            break;
          case 70:
            return 69;
            break;
          case 71:
            return 71;
            break;
          case 72:
            return 71;
            break;
          case 73:
            return 70;
            break;
          case 74:
            return 68;
            break;
          case 75:
            return 72;
            break;
          case 76:
            return 73;
            break;
          case 77:
            return 74;
            break;
          case 78:
            return 22;
            break;
          case 79:
            return 44;
            break;
          case 80:
            return 100;
            break;
          case 81:
            return 18;
            break;
          case 82:
            return "PLUS";
            break;
          case 83:
            return 87;
            break;
          case 84:
            return 61;
            break;
          case 85:
            return 89;
            break;
          case 86:
            return 89;
            break;
          case 87:
            return 90;
            break;
          case 88:
            return "EQUALS";
            break;
          case 89:
            return "EQUALS";
            break;
          case 90:
            return 60;
            break;
          case 91:
            return 12;
            break;
          case 92:
            return 14;
            break;
          case 93:
            return "PUNCTUATION";
            break;
          case 94:
            return 86;
            break;
          case 95:
            return 102;
            break;
          case 96:
            return 50;
            break;
          case 97:
            return 50;
            break;
          case 98:
            return 9;
            break;
        }
      }, "anonymous"),
      rules: [/^(?:.*direction\s+TB[^\n]*)/, /^(?:.*direction\s+BT[^\n]*)/, /^(?:.*direction\s+RL[^\n]*)/, /^(?:.*direction\s+LR[^\n]*)/, /^(?:%%(?!\{)*[^\n]*(\r?\n?)+)/, /^(?:%%[^\n]*(\r?\n)*)/, /^(?:accTitle\s*:\s*)/, /^(?:(?!\n||)*[^\n]*)/, /^(?:accDescr\s*:\s*)/, /^(?:(?!\n||)*[^\n]*)/, /^(?:accDescr\s*\{\s*)/, /^(?:[\}])/, /^(?:[^\}]*)/, /^(?:\s*(\r?\n)+)/, /^(?:\s+)/, /^(?:classDiagram-v2\b)/, /^(?:classDiagram\b)/, /^(?:\[\*\])/, /^(?:call[\s]+)/, /^(?:\([\s]*\))/, /^(?:\()/, /^(?:[^(]*)/, /^(?:\))/, /^(?:[^)]*)/, /^(?:["])/, /^(?:[^"]*)/, /^(?:["])/, /^(?:style\b)/, /^(?:classDef\b)/, /^(?:namespace\b)/, /^(?:\s*(\r?\n)+)/, /^(?:\s+)/, /^(?:[{])/, /^(?:[}])/, /^(?:[}])/, /^(?:$)/, /^(?:\s*(\r?\n)+)/, /^(?:\s+)/, /^(?:\[\*\])/, /^(?:class\b)/, /^(?:\s*(\r?\n)+)/, /^(?:\s+)/, /^(?:[}])/, /^(?:[{])/, /^(?:[}])/, /^(?:$)/, /^(?:\[\*\])/, /^(?:[{])/, /^(?:[\n])/, /^(?:[^{}\n]*)/, /^(?:cssClass\b)/, /^(?:callback\b)/, /^(?:link\b)/, /^(?:click\b)/, /^(?:note for\b)/, /^(?:note\b)/, /^(?:<<)/, /^(?:>>)/, /^(?:href\b)/, /^(?:[~])/, /^(?:[^~]*)/, /^(?:~)/, /^(?:[`])/, /^(?:[^`]+)/, /^(?:[`])/, /^(?:_self\b)/, /^(?:_blank\b)/, /^(?:_parent\b)/, /^(?:_top\b)/, /^(?:\s*<\|)/, /^(?:\s*\|>)/, /^(?:\s*>)/, /^(?:\s*<)/, /^(?:\s*\*)/, /^(?:\s*o\b)/, /^(?:\s*\(\))/, /^(?:--)/, /^(?:\.\.)/, /^(?::{1}[^:\n;]+)/, /^(?::{3})/, /^(?:-)/, /^(?:\.)/, /^(?:\+)/, /^(?::)/, /^(?:,)/, /^(?:#)/, /^(?:#)/, /^(?:%)/, /^(?:=)/, /^(?:=)/, /^(?:\w+)/, /^(?:\[)/, /^(?:\])/, /^(?:[!"#$%&'*+,-.`?\\/])/, /^(?:[0-9]+)/, /^(?:[\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6]|[\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377]|[\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5]|[\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA]|[\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE]|[\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA]|[\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0]|[\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977]|[\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2]|[\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A]|[\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39]|[\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8]|[\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C]|[\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C]|[\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99]|[\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0]|[\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D]|[\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3]|[\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10]|[\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1]|[\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81]|[\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3]|[\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6]|[\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A]|[\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081]|[\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D]|[\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0]|[\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310]|[\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C]|[\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711]|[\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7]|[\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C]|[\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16]|[\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF]|[\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC]|[\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D]|[\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D]|[\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3]|[\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F]|[\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128]|[\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184]|[\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3]|[\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6]|[\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE]|[\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C]|[\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D]|[\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC]|[\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B]|[\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788]|[\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805]|[\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB]|[\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28]|[\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5]|[\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4]|[\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E]|[\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D]|[\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36]|[\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D]|[\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC]|[\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF]|[\uFFD2-\uFFD7\uFFDA-\uFFDC])/, /^(?:\s)/, /^(?:\s)/, /^(?:$)/],
      conditions: { "namespace-body": { rules: [26, 29, 34, 35, 36, 37, 38, 39, 50, 51, 52, 53, 54, 55, 56, 57, 58, 61, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 98], inclusive: false }, namespace: { rules: [26, 29, 30, 31, 32, 33, 50, 51, 52, 53, 54, 55, 56, 57, 58, 61, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 98], inclusive: false }, "class-body": { rules: [26, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 61, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 98], inclusive: false }, class: { rules: [26, 40, 41, 42, 43, 50, 51, 52, 53, 54, 55, 56, 57, 58, 61, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 98], inclusive: false }, acc_descr_multiline: { rules: [11, 12, 26, 50, 51, 52, 53, 54, 55, 56, 57, 58, 61, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 98], inclusive: false }, acc_descr: { rules: [9, 26, 50, 51, 52, 53, 54, 55, 56, 57, 58, 61, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 98], inclusive: false }, acc_title: { rules: [7, 26, 50, 51, 52, 53, 54, 55, 56, 57, 58, 61, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 98], inclusive: false }, callback_args: { rules: [22, 23, 26, 50, 51, 52, 53, 54, 55, 56, 57, 58, 61, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 98], inclusive: false }, callback_name: { rules: [19, 20, 21, 26, 50, 51, 52, 53, 54, 55, 56, 57, 58, 61, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 98], inclusive: false }, href: { rules: [26, 50, 51, 52, 53, 54, 55, 56, 57, 58, 61, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 98], inclusive: false }, struct: { rules: [26, 50, 51, 52, 53, 54, 55, 56, 57, 58, 61, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 98], inclusive: false }, generic: { rules: [26, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 98], inclusive: false }, bqstring: { rules: [26, 50, 51, 52, 53, 54, 55, 56, 57, 58, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 98], inclusive: false }, string: { rules: [24, 25, 26, 50, 51, 52, 53, 54, 55, 56, 57, 58, 61, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 98], inclusive: false }, INITIAL: { rules: [0, 1, 2, 3, 4, 5, 6, 8, 10, 13, 14, 15, 16, 17, 18, 26, 27, 28, 29, 39, 50, 51, 52, 53, 54, 55, 56, 57, 58, 61, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98], inclusive: true } }
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
var classDiagram_default = parser;
var visibilityValues = ["#", "+", "~", "-", ""];
var ClassMember = class {
  static {
    __name(this, "ClassMember");
  }
  constructor(input, memberType) {
    this.memberType = memberType;
    this.visibility = "";
    this.classifier = "";
    this.text = "";
    const sanitizedInput = sanitizeText(input, getConfig2());
    this.parseMember(sanitizedInput);
  }
  getDisplayDetails() {
    let displayText = this.visibility + parseGenericTypes(this.id);
    if (this.memberType === "method") {
      displayText += `(${parseGenericTypes(this.parameters.trim())})`;
      if (this.returnType) {
        displayText += " : " + parseGenericTypes(this.returnType);
      }
    }
    displayText = displayText.trim();
    const cssStyle = this.parseClassifier();
    return {
      displayText,
      cssStyle
    };
  }
  parseMember(input) {
    let potentialClassifier = "";
    if (this.memberType === "method") {
      const methodRegEx = /([#+~-])?(.+)\((.*)\)([\s$*])?(.*)([$*])?/;
      const match = methodRegEx.exec(input);
      if (match) {
        const detectedVisibility = match[1] ? match[1].trim() : "";
        if (visibilityValues.includes(detectedVisibility)) {
          this.visibility = detectedVisibility;
        }
        this.id = match[2];
        this.parameters = match[3] ? match[3].trim() : "";
        potentialClassifier = match[4] ? match[4].trim() : "";
        this.returnType = match[5] ? match[5].trim() : "";
        if (potentialClassifier === "") {
          const lastChar = this.returnType.substring(this.returnType.length - 1);
          if (/[$*]/.exec(lastChar)) {
            potentialClassifier = lastChar;
            this.returnType = this.returnType.substring(0, this.returnType.length - 1);
          }
        }
      }
    } else {
      const length = input.length;
      const firstChar = input.substring(0, 1);
      const lastChar = input.substring(length - 1);
      if (visibilityValues.includes(firstChar)) {
        this.visibility = firstChar;
      }
      if (/[$*]/.exec(lastChar)) {
        potentialClassifier = lastChar;
      }
      this.id = input.substring(this.visibility === "" ? 0 : 1, potentialClassifier === "" ? length : length - 1);
    }
    this.classifier = potentialClassifier;
    this.id = this.id.startsWith(" ") ? " " + this.id.trim() : this.id.trim();
    const combinedText = `${this.visibility ? "\\" + this.visibility : ""}${parseGenericTypes(this.id)}${this.memberType === "method" ? `(${parseGenericTypes(this.parameters)})${this.returnType ? " : " + parseGenericTypes(this.returnType) : ""}` : ""}`;
    this.text = combinedText.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    if (this.text.startsWith("\\&lt;")) {
      this.text = this.text.replace("\\&lt;", "~");
    }
  }
  parseClassifier() {
    switch (this.classifier) {
      case "*":
        return "font-style:italic;";
      case "$":
        return "text-decoration:underline;";
      default:
        return "";
    }
  }
};
var MERMAID_DOM_ID_PREFIX = "classId-";
var classCounter = 0;
var sanitizeText2 = /* @__PURE__ */ __name((txt) => common_default.sanitizeText(txt, getConfig2()), "sanitizeText");
var ClassDB = class _ClassDB {
  constructor() {
    this.relations = [];
    this.classes = /* @__PURE__ */ new Map;
    this.styleClasses = /* @__PURE__ */ new Map;
    this.notes = /* @__PURE__ */ new Map;
    this.interfaces = [];
    this.namespaces = /* @__PURE__ */ new Map;
    this.namespaceCounter = 0;
    this.namespaceStack = [];
    this.diagramId = "";
    this.functions = [];
    this.lineType = {
      LINE: 0,
      DOTTED_LINE: 1
    };
    this.relationType = {
      AGGREGATION: 0,
      EXTENSION: 1,
      COMPOSITION: 2,
      DEPENDENCY: 3,
      LOLLIPOP: 4
    };
    this.setupToolTips = /* @__PURE__ */ __name((element) => {
      const tooltipElem = createTooltip();
      const svg = select_default(element).select("svg");
      const nodes = svg.selectAll("g").filter(function() {
        return select_default(this).attr("title") !== null;
      });
      nodes.on("mouseover", (event) => {
        const el = select_default(event.currentTarget);
        const title = el.attr("title");
        if (!title) {
          return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        tooltipElem.transition().duration(200).style("opacity", ".9");
        tooltipElem.html(purify.sanitize(title)).style("left", `${window.scrollX + rect.left + rect.width / 2}px`).style("top", `${window.scrollY + rect.bottom + 4}px`);
        el.classed("hover", true);
      }).on("mouseout", (event) => {
        tooltipElem.transition().duration(500).style("opacity", 0);
        select_default(event.currentTarget).classed("hover", false);
      });
    }, "setupToolTips");
    this.direction = "TB";
    this.setAccTitle = setAccTitle;
    this.getAccTitle = getAccTitle;
    this.setAccDescription = setAccDescription;
    this.getAccDescription = getAccDescription;
    this.setDiagramTitle = setDiagramTitle;
    this.getDiagramTitle = getDiagramTitle;
    this.getConfig = /* @__PURE__ */ __name(() => getConfig2().class, "getConfig");
    this.functions.push(this.setupToolTips.bind(this));
    this.clear();
    this.addRelation = this.addRelation.bind(this);
    this.addClassesToNamespace = this.addClassesToNamespace.bind(this);
    this.addNamespace = this.addNamespace.bind(this);
    this.popNamespace = this.popNamespace.bind(this);
    this.setCssClass = this.setCssClass.bind(this);
    this.addMembers = this.addMembers.bind(this);
    this.addClass = this.addClass.bind(this);
    this.setClassLabel = this.setClassLabel.bind(this);
    this.addAnnotation = this.addAnnotation.bind(this);
    this.addMember = this.addMember.bind(this);
    this.cleanupLabel = this.cleanupLabel.bind(this);
    this.addNote = this.addNote.bind(this);
    this.defineClass = this.defineClass.bind(this);
    this.setDirection = this.setDirection.bind(this);
    this.setLink = this.setLink.bind(this);
    this.bindFunctions = this.bindFunctions.bind(this);
    this.clear = this.clear.bind(this);
    this.setTooltip = this.setTooltip.bind(this);
    this.setClickEvent = this.setClickEvent.bind(this);
    this.setCssStyle = this.setCssStyle.bind(this);
  }
  static {
    __name(this, "ClassDB");
  }
  splitClassNameAndType(_id) {
    const id = common_default.sanitizeText(_id, getConfig2());
    let genericType = "";
    let className = id;
    if (id.indexOf("~") > 0) {
      const split = id.split("~");
      className = sanitizeText2(split[0]);
      genericType = sanitizeText2(split[1]);
    }
    return { className, type: genericType };
  }
  setClassLabel(_id, label) {
    const id = common_default.sanitizeText(_id, getConfig2());
    if (label) {
      label = sanitizeText2(label);
    }
    const { className } = this.splitClassNameAndType(id);
    this.classes.get(className).label = label;
    this.classes.get(className).text = `${label}${this.classes.get(className).type ? `<${this.classes.get(className).type}>` : ""}`;
  }
  addClass(_id) {
    const id = common_default.sanitizeText(_id, getConfig2());
    const { className, type } = this.splitClassNameAndType(id);
    if (this.classes.has(className)) {
      return;
    }
    const name = common_default.sanitizeText(className, getConfig2());
    this.classes.set(name, {
      id: name,
      type,
      label: name,
      text: `${name}${type ? `&lt;${type}&gt;` : ""}`,
      shape: "classBox",
      cssClasses: "default",
      methods: [],
      members: [],
      annotations: [],
      styles: [],
      domId: MERMAID_DOM_ID_PREFIX + name + "-" + classCounter
    });
    classCounter++;
  }
  addInterface(label, classId) {
    const classInterface = {
      id: `interface${this.interfaces.length}`,
      label,
      classId
    };
    this.interfaces.push(classInterface);
  }
  setDiagramId(svgElementId) {
    this.diagramId = svgElementId;
  }
  lookUpDomId(_id) {
    const id = common_default.sanitizeText(_id, getConfig2());
    if (this.classes.has(id)) {
      const domId = this.classes.get(id).domId;
      return this.diagramId ? `${this.diagramId}-${domId}` : domId;
    }
    throw new Error("Class not found: " + id);
  }
  clear() {
    this.relations = [];
    this.classes = /* @__PURE__ */ new Map;
    this.notes = /* @__PURE__ */ new Map;
    this.interfaces = [];
    this.functions = [];
    this.functions.push(this.setupToolTips.bind(this));
    this.namespaces = /* @__PURE__ */ new Map;
    this.namespaceCounter = 0;
    this.namespaceStack = [];
    this.diagramId = "";
    this.direction = "TB";
    clear();
  }
  getClass(id) {
    return this.classes.get(id);
  }
  getClasses() {
    return this.classes;
  }
  getRelations() {
    return this.relations;
  }
  getNote(id) {
    const key = typeof id === "number" ? `note${id}` : id;
    return this.notes.get(key);
  }
  getNotes() {
    return this.notes;
  }
  addRelation(classRelation) {
    log.debug("Adding relation: " + JSON.stringify(classRelation));
    const invalidTypes = [
      this.relationType.LOLLIPOP,
      this.relationType.AGGREGATION,
      this.relationType.COMPOSITION,
      this.relationType.DEPENDENCY,
      this.relationType.EXTENSION
    ];
    if (classRelation.relation.type1 === this.relationType.LOLLIPOP && !invalidTypes.includes(classRelation.relation.type2)) {
      this.addClass(classRelation.id2);
      this.addInterface(classRelation.id1, classRelation.id2);
      classRelation.id1 = `interface${this.interfaces.length - 1}`;
    } else if (classRelation.relation.type2 === this.relationType.LOLLIPOP && !invalidTypes.includes(classRelation.relation.type1)) {
      this.addClass(classRelation.id1);
      this.addInterface(classRelation.id2, classRelation.id1);
      classRelation.id2 = `interface${this.interfaces.length - 1}`;
    } else {
      this.addClass(classRelation.id1);
      this.addClass(classRelation.id2);
    }
    classRelation.id1 = this.splitClassNameAndType(classRelation.id1).className;
    classRelation.id2 = this.splitClassNameAndType(classRelation.id2).className;
    classRelation.relationTitle1 = common_default.sanitizeText(classRelation.relationTitle1.trim(), getConfig2());
    classRelation.relationTitle2 = common_default.sanitizeText(classRelation.relationTitle2.trim(), getConfig2());
    this.relations.push(classRelation);
  }
  addAnnotation(className, annotation) {
    const validatedClassName = this.splitClassNameAndType(className).className;
    this.classes.get(validatedClassName).annotations.push(annotation);
  }
  addMember(className, member) {
    this.addClass(className);
    const validatedClassName = this.splitClassNameAndType(className).className;
    const theClass = this.classes.get(validatedClassName);
    if (typeof member === "string") {
      const memberString = member.trim();
      if (memberString.startsWith("<<") && memberString.endsWith(">>")) {
        theClass.annotations.push(sanitizeText2(memberString.substring(2, memberString.length - 2)));
      } else if (memberString.indexOf(")") > 0) {
        theClass.methods.push(new ClassMember(memberString, "method"));
      } else if (memberString) {
        theClass.members.push(new ClassMember(memberString, "attribute"));
      }
    }
  }
  addMembers(className, members) {
    if (Array.isArray(members)) {
      members.reverse();
      members.forEach((member) => this.addMember(className, member));
    }
  }
  addNote(text, className) {
    const index = this.notes.size;
    const note = {
      id: `note${index}`,
      class: className,
      text,
      index
    };
    this.notes.set(note.id, note);
    return note.id;
  }
  cleanupLabel(label) {
    if (label.startsWith(":")) {
      label = label.substring(1);
    }
    return sanitizeText2(label.trim());
  }
  setCssClass(ids, className) {
    ids.split(",").forEach((_id) => {
      let id = _id;
      if (/\d/.exec(_id[0])) {
        id = MERMAID_DOM_ID_PREFIX + id;
      }
      const classNode = this.classes.get(id);
      if (classNode) {
        classNode.cssClasses += " " + className;
      }
    });
  }
  defineClass(ids, style) {
    for (const id of ids) {
      let styleClass = this.styleClasses.get(id);
      if (styleClass === undefined) {
        styleClass = { id, styles: [], textStyles: [] };
        this.styleClasses.set(id, styleClass);
      }
      if (style) {
        style.forEach((s) => {
          if (/color/.exec(s)) {
            const newStyle = s.replace("fill", "bgFill");
            styleClass.textStyles.push(newStyle);
          }
          styleClass.styles.push(s);
        });
      }
      this.classes.forEach((value) => {
        if (value.cssClasses.includes(id)) {
          value.styles.push(...style.flatMap((s) => s.split(",")));
        }
      });
    }
  }
  setTooltip(ids, tooltip) {
    ids.split(",").forEach((id) => {
      if (tooltip !== undefined) {
        this.classes.get(id).tooltip = sanitizeText2(tooltip);
      }
    });
  }
  getTooltip(id, namespace) {
    if (namespace && this.namespaces.has(namespace)) {
      return this.namespaces.get(namespace).classes.get(id).tooltip;
    }
    return this.classes.get(id).tooltip;
  }
  setLink(ids, linkStr, target) {
    const config = getConfig2();
    ids.split(",").forEach((_id) => {
      let id = _id;
      if (/\d/.exec(_id[0])) {
        id = MERMAID_DOM_ID_PREFIX + id;
      }
      const theClass = this.classes.get(id);
      if (theClass) {
        theClass.link = utils_default.formatUrl(linkStr, config);
        if (config.securityLevel === "sandbox") {
          theClass.linkTarget = "_top";
        } else if (typeof target === "string") {
          theClass.linkTarget = sanitizeText2(target);
        } else {
          theClass.linkTarget = "_blank";
        }
      }
    });
    this.setCssClass(ids, "clickable");
  }
  setClickEvent(ids, functionName, functionArgs) {
    ids.split(",").forEach((id) => {
      this.setClickFunc(id, functionName, functionArgs);
      this.classes.get(id).haveCallback = true;
    });
    this.setCssClass(ids, "clickable");
  }
  setClickFunc(_domId, functionName, functionArgs) {
    const domId = common_default.sanitizeText(_domId, getConfig2());
    const config = getConfig2();
    if (config.securityLevel !== "loose") {
      return;
    }
    if (functionName === undefined) {
      return;
    }
    const id = domId;
    if (this.classes.has(id)) {
      let argList = [];
      if (typeof functionArgs === "string") {
        argList = functionArgs.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        for (let i = 0;i < argList.length; i++) {
          let item = argList[i].trim();
          if (item.startsWith('"') && item.endsWith('"')) {
            item = item.substr(1, item.length - 2);
          }
          argList[i] = item;
        }
      }
      if (argList.length === 0) {
        argList.push(id);
      }
      this.functions.push(() => {
        const elemId = this.lookUpDomId(id);
        const elem = document.querySelector(`[id="${elemId}"]`);
        if (elem !== null) {
          elem.addEventListener("click", () => {
            utils_default.runFunc(functionName, ...argList);
          }, false);
        }
      });
    }
  }
  bindFunctions(element) {
    this.functions.forEach((fun) => {
      fun(element);
    });
  }
  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  getDirection() {
    return this.direction;
  }
  setDirection(dir) {
    this.direction = dir;
  }
  static resolveQualifiedId(id, stack) {
    const prefix = stack.at(-1);
    return prefix ? `${prefix}.${id}` : id;
  }
  static getAncestorIds(qualifiedId) {
    const parts = qualifiedId.split(".");
    const ids = new Array(parts.length);
    ids[0] = parts[0];
    for (let i = 1;i < parts.length; i++) {
      ids[i] = `${ids[i - 1]}.${parts[i]}`;
    }
    return ids;
  }
  createNamespaceNode(id, label, parentId, explicit = false) {
    return {
      id,
      label,
      classes: /* @__PURE__ */ new Map,
      notes: /* @__PURE__ */ new Map,
      children: /* @__PURE__ */ new Map,
      domId: MERMAID_DOM_ID_PREFIX + id + "-" + this.namespaceCounter++,
      parent: parentId,
      explicit
    };
  }
  linkParentChild(parentId, childId) {
    const parent = this.namespaces.get(parentId);
    const child = this.namespaces.get(childId);
    if (!parent || !child) {
      return;
    }
    if (!parent.children.has(childId)) {
      parent.children.set(childId, child);
    }
    child.parent ??= parentId;
  }
  addNamespace(id, label) {
    const qualifiedId = _ClassDB.resolveQualifiedId(id, this.namespaceStack);
    this.namespaceStack.push(qualifiedId);
    if (this.namespaces.has(qualifiedId)) {
      const existing = this.namespaces.get(qualifiedId);
      existing.explicit = true;
      if (label) {
        existing.label = label;
      }
      return qualifiedId;
    }
    const parts = qualifiedId.split(".");
    const ancestorIds = _ClassDB.getAncestorIds(qualifiedId);
    for (let i = 0;i < ancestorIds.length; i++) {
      const currentId = ancestorIds[i];
      const parentId = i > 0 ? ancestorIds[i - 1] : undefined;
      const isLeaf = i === ancestorIds.length - 1;
      const nodeLabel = isLeaf && label ? label : parts[i];
      if (!this.namespaces.has(currentId)) {
        this.namespaces.set(currentId, this.createNamespaceNode(currentId, nodeLabel, parentId, isLeaf));
      } else if (isLeaf) {
        this.namespaces.get(currentId).explicit = true;
      }
      if (parentId) {
        this.linkParentChild(parentId, currentId);
      }
    }
    return qualifiedId;
  }
  popNamespace() {
    this.namespaceStack.pop();
  }
  getNamespace(name) {
    return this.namespaces.get(name);
  }
  getNamespaces() {
    return this.namespaces;
  }
  addClassesToNamespace(id, classNames, noteNames) {
    if (!this.namespaces.has(id)) {
      return;
    }
    for (const name of classNames) {
      const { className } = this.splitClassNameAndType(name);
      const classNode = this.getClass(className);
      classNode.parent = id;
      this.namespaces.get(id).classes.set(className, classNode);
    }
    for (const noteName of noteNames) {
      const noteNode = this.getNote(noteName);
      noteNode.parent = id;
      this.namespaces.get(id).notes.set(noteName, noteNode);
    }
  }
  setCssStyle(id, styles) {
    const thisClass = this.classes.get(id);
    if (!styles || !thisClass) {
      return;
    }
    for (const s of styles) {
      if (s.includes(",")) {
        thisClass.styles.push(...s.split(","));
      } else {
        thisClass.styles.push(s);
      }
    }
  }
  getArrowMarker(type) {
    let marker;
    switch (type) {
      case 0:
        marker = "aggregation";
        break;
      case 1:
        marker = "extension";
        break;
      case 2:
        marker = "composition";
        break;
      case 3:
        marker = "dependency";
        break;
      case 4:
        marker = "lollipop";
        break;
      default:
        marker = "none";
    }
    return marker;
  }
  resolveExplicitAncestor(id) {
    let current = id;
    while (current) {
      const ns = this.namespaces.get(current);
      if (!ns) {
        return;
      }
      if (ns.explicit) {
        return current;
      }
      current = ns.parent;
    }
    return;
  }
  getData() {
    const nodes = [];
    const edges = [];
    const config = getConfig2();
    const hierarchical = config.class?.hierarchicalNamespaces ?? true;
    for (const namespace of this.namespaces.values()) {
      if (!hierarchical && !namespace.explicit) {
        continue;
      }
      const node = {
        id: namespace.id,
        label: hierarchical ? namespace.label : namespace.id,
        isGroup: true,
        padding: config.class.padding ?? 16,
        shape: "rect",
        cssStyles: [],
        look: config.look,
        parentId: hierarchical ? namespace.parent : undefined
      };
      nodes.push(node);
    }
    for (const classNode of this.classes.values()) {
      const parentId = hierarchical ? classNode.parent : this.resolveExplicitAncestor(classNode.parent);
      const node = {
        ...classNode,
        type: undefined,
        isGroup: false,
        parentId,
        look: config.look
      };
      nodes.push(node);
    }
    for (const note of this.notes.values()) {
      const noteParentId = hierarchical ? note.parent : this.resolveExplicitAncestor(note.parent);
      const noteNode = {
        id: note.id,
        label: note.text,
        isGroup: false,
        shape: "note",
        padding: config.class.padding ?? 6,
        cssStyles: [
          "text-align: left",
          "white-space: nowrap",
          `fill: ${config.themeVariables.noteBkgColor}`,
          `stroke: ${config.themeVariables.noteBorderColor}`
        ],
        look: config.look,
        parentId: noteParentId,
        labelType: "markdown"
      };
      nodes.push(noteNode);
      const noteClassId = this.classes.get(note.class)?.id;
      if (noteClassId) {
        const edge = {
          id: `edgeNote${note.index}`,
          start: note.id,
          end: noteClassId,
          type: "normal",
          thickness: "normal",
          classes: "relation",
          arrowTypeStart: "none",
          arrowTypeEnd: "none",
          arrowheadStyle: "",
          labelStyle: [""],
          style: ["fill: none"],
          pattern: "dotted",
          look: config.look
        };
        edges.push(edge);
      }
    }
    for (const _interface of this.interfaces) {
      const interfaceNode = {
        id: _interface.id,
        label: _interface.label,
        isGroup: false,
        shape: "rect",
        cssStyles: ["opacity: 0;"],
        look: config.look
      };
      nodes.push(interfaceNode);
    }
    let cnt = 0;
    for (const classRelation of this.relations) {
      cnt++;
      const edge = {
        id: getEdgeId(classRelation.id1, classRelation.id2, {
          prefix: "id",
          counter: cnt
        }),
        start: classRelation.id1,
        end: classRelation.id2,
        type: "normal",
        label: classRelation.title,
        labelpos: "c",
        thickness: "normal",
        classes: "relation",
        arrowTypeStart: this.getArrowMarker(classRelation.relation.type1),
        arrowTypeEnd: this.getArrowMarker(classRelation.relation.type2),
        startLabelRight: classRelation.relationTitle1 === "none" ? "" : classRelation.relationTitle1,
        endLabelLeft: classRelation.relationTitle2 === "none" ? "" : classRelation.relationTitle2,
        arrowheadStyle: "",
        labelStyle: ["display: inline-block"],
        style: classRelation.style || "",
        pattern: classRelation.relation.lineType == 1 ? "dashed" : "solid",
        look: config.look,
        labelType: "markdown"
      };
      edges.push(edge);
    }
    return { nodes, edges, other: {}, config, direction: this.getDirection() };
  }
};
var getStyles = /* @__PURE__ */ __name((options) => `g.classGroup text {
  fill: ${options.nodeBorder || options.classText};
  stroke: none;
  font-family: ${options.fontFamily};
  font-size: 10px;

  .title {
    font-weight: bolder;
  }

}

  .cluster-label text {
    fill: ${options.titleColor};
  }
  .cluster-label span {
    color: ${options.titleColor};
  }
  .cluster-label span p {
    background-color: transparent;
  }

  .cluster rect {
    fill: ${options.clusterBkg};
    stroke: ${options.clusterBorder};
    stroke-width: 1px;
  }

  .cluster text {
    fill: ${options.titleColor};
  }

  .cluster span {
    color: ${options.titleColor};
  }

.nodeLabel, .edgeLabel {
  color: ${options.classText};
}

.noteLabel .nodeLabel, .noteLabel .edgeLabel {
  color: ${options.noteTextColor};
}
.edgeLabel .label rect {
  fill: ${options.mainBkg};
}
.label text {
  fill: ${options.classText};
}

.labelBkg {
  background: ${options.mainBkg};
}
.edgeLabel .label span {
  background: ${options.mainBkg};
}

.classTitle {
  font-weight: bolder;
}
.node rect,
  .node circle,
  .node ellipse,
  .node polygon,
  .node path {
    fill: ${options.mainBkg};
    stroke: ${options.nodeBorder};
    stroke-width: ${options.strokeWidth};
  }


.divider {
  stroke: ${options.nodeBorder};
  stroke-width: 1;
}

g.clickable {
  cursor: pointer;
}

g.classGroup rect {
  fill: ${options.mainBkg};
  stroke: ${options.nodeBorder};
}

g.classGroup line {
  stroke: ${options.nodeBorder};
  stroke-width: 1;
}

.classLabel .box {
  stroke: none;
  stroke-width: 0;
  fill: ${options.mainBkg};
  opacity: 0.5;
}

.classLabel .label {
  fill: ${options.nodeBorder};
  font-size: 10px;
}

.relation {
  stroke: ${options.lineColor};
  stroke-width: ${options.strokeWidth};
  fill: none;
}

.dashed-line{
  stroke-dasharray: 3;
}

.dotted-line{
  stroke-dasharray: 1 2;
}

[id$="-compositionStart"], .composition {
  fill: ${options.lineColor} !important;
  stroke: ${options.lineColor} !important;
  stroke-width: 1;
}

[id$="-compositionEnd"], .composition {
  fill: ${options.lineColor} !important;
  stroke: ${options.lineColor} !important;
  stroke-width: 1;
}

[id$="-dependencyStart"], .dependency {
  fill: ${options.lineColor} !important;
  stroke: ${options.lineColor} !important;
  stroke-width: 1;
}

[id$="-dependencyEnd"], .dependency {
  fill: ${options.lineColor} !important;
  stroke: ${options.lineColor} !important;
  stroke-width: 1;
}

[id$="-extensionStart"], .extension {
  fill: transparent !important;
  stroke: ${options.lineColor} !important;
  stroke-width: 1;
}

[id$="-extensionEnd"], .extension {
  fill: transparent !important;
  stroke: ${options.lineColor} !important;
  stroke-width: 1;
}

[id$="-aggregationStart"], .aggregation {
  fill: transparent !important;
  stroke: ${options.lineColor} !important;
  stroke-width: 1;
}

[id$="-aggregationEnd"], .aggregation {
  fill: transparent !important;
  stroke: ${options.lineColor} !important;
  stroke-width: 1;
}

[id$="-lollipopStart"], .lollipop {
  fill: ${options.mainBkg} !important;
  stroke: ${options.lineColor} !important;
  stroke-width: 1;
}

[id$="-lollipopEnd"], .lollipop {
  fill: ${options.mainBkg} !important;
  stroke: ${options.lineColor} !important;
  stroke-width: 1;
}

.edgeTerminals {
  font-size: 11px;
  line-height: initial;
}

.classTitleText {
  text-anchor: middle;
  font-size: 18px;
  fill: ${options.textColor};
}

.edgeLabel[data-look="neo"] {
  background-color: ${options.edgeLabelBackground};
  p {
    background-color: ${options.edgeLabelBackground};
  }
  rect {
    opacity: 0.5;
    background-color: ${options.edgeLabelBackground};
    fill: ${options.edgeLabelBackground};
  }
  text-align: center;
}
  ${getIconStyles()}
`, "getStyles");
var styles_default = getStyles;
var getDir = /* @__PURE__ */ __name((parsedItem, defaultDir = "TB") => {
  if (!parsedItem.doc) {
    return defaultDir;
  }
  let dir = defaultDir;
  for (const parsedItemDoc of parsedItem.doc) {
    if (parsedItemDoc.stmt === "dir") {
      dir = parsedItemDoc.value;
    }
  }
  return dir;
}, "getDir");
var getClasses = /* @__PURE__ */ __name(function(text, diagramObj) {
  return diagramObj.db.getClasses();
}, "getClasses");
var draw = /* @__PURE__ */ __name(async function(text, id, _version, diag) {
  log.info("REF0:");
  log.info("Drawing class diagram (v3)", id);
  const { securityLevel, state: conf, layout } = getConfig2();
  diag.db.setDiagramId(id);
  const data4Layout = diag.db.getData();
  const svg = getDiagramElement(id, securityLevel);
  data4Layout.type = diag.type;
  data4Layout.layoutAlgorithm = getRegisteredLayoutAlgorithm(layout);
  data4Layout.nodeSpacing = conf?.nodeSpacing || 50;
  data4Layout.rankSpacing = conf?.rankSpacing || 50;
  data4Layout.markers = ["aggregation", "extension", "composition", "dependency", "lollipop"];
  data4Layout.diagramId = id;
  await render(data4Layout, svg);
  const padding = 8;
  utils_default.insertTitle(svg, "classDiagramTitleText", conf?.titleTopMargin ?? 25, diag.db.getDiagramTitle());
  setupViewPortForSVG(svg, padding, "classDiagram", conf?.useMaxWidth ?? true);
}, "draw");
var classRenderer_v3_unified_default = {
  getClasses,
  draw,
  getDir
};

export { classDiagram_default, ClassDB, styles_default, classRenderer_v3_unified_default };

//# debugId=B734D2B2ED57B5FA64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2NodW5rLTcyN1NYSlBNLm1qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJpbXBvcnQge1xuICBnZXRJY29uU3R5bGVzXG59IGZyb20gXCIuL2NodW5rLUZNQkQ3VUM0Lm1qc1wiO1xuaW1wb3J0IHtcbiAgY3JlYXRlVG9vbHRpcFxufSBmcm9tIFwiLi9jaHVuay1ORDJHVUhBTS5tanNcIjtcbmltcG9ydCB7XG4gIGdldERpYWdyYW1FbGVtZW50XG59IGZyb20gXCIuL2NodW5rLTU1SUFDRUI2Lm1qc1wiO1xuaW1wb3J0IHtcbiAgc2V0dXBWaWV3UG9ydEZvclNWR1xufSBmcm9tIFwiLi9jaHVuay0ySjMzV1RNSC5tanNcIjtcbmltcG9ydCB7XG4gIGdldFJlZ2lzdGVyZWRMYXlvdXRBbGdvcml0aG0sXG4gIHJlbmRlclxufSBmcm9tIFwiLi9jaHVuay1MWlhFRFpDQS5tanNcIjtcbmltcG9ydCB7XG4gIGdldEVkZ2VJZCxcbiAgdXRpbHNfZGVmYXVsdFxufSBmcm9tIFwiLi9jaHVuay01WlFZSFhLVS5tanNcIjtcbmltcG9ydCB7XG4gIGNsZWFyLFxuICBjb21tb25fZGVmYXVsdCxcbiAgZ2V0QWNjRGVzY3JpcHRpb24sXG4gIGdldEFjY1RpdGxlLFxuICBnZXRDb25maWcyIGFzIGdldENvbmZpZyxcbiAgZ2V0RGlhZ3JhbVRpdGxlLFxuICBwYXJzZUdlbmVyaWNUeXBlcyxcbiAgc2FuaXRpemVUZXh0LFxuICBzZXRBY2NEZXNjcmlwdGlvbixcbiAgc2V0QWNjVGl0bGUsXG4gIHNldERpYWdyYW1UaXRsZVxufSBmcm9tIFwiLi9jaHVuay1DU0NJSEs3US5tanNcIjtcbmltcG9ydCB7XG4gIF9fbmFtZSxcbiAgbG9nXG59IGZyb20gXCIuL2NodW5rLUFHSFJCNEpGLm1qc1wiO1xuXG4vLyBzcmMvZGlhZ3JhbXMvY2xhc3MvcGFyc2VyL2NsYXNzRGlhZ3JhbS5qaXNvblxudmFyIHBhcnNlciA9IChmdW5jdGlvbigpIHtcbiAgdmFyIG8gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGssIHYsIG8yLCBsKSB7XG4gICAgZm9yIChvMiA9IG8yIHx8IHt9LCBsID0gay5sZW5ndGg7IGwtLTsgbzJba1tsXV0gPSB2KSA7XG4gICAgcmV0dXJuIG8yO1xuICB9LCBcIm9cIiksICRWMCA9IFsxLCAxOF0sICRWMSA9IFsxLCAxOV0sICRWMiA9IFsxLCAyMF0sICRWMyA9IFsxLCA0MV0sICRWNCA9IFsxLCAyNl0sICRWNSA9IFsxLCA0Ml0sICRWNiA9IFsxLCAyNF0sICRWNyA9IFsxLCAyNV0sICRWOCA9IFsxLCAzMl0sICRWOSA9IFsxLCAzM10sICRWYSA9IFsxLCAzNF0sICRWYiA9IFsxLCA0NV0sICRWYyA9IFsxLCAzNV0sICRWZCA9IFsxLCAzNl0sICRWZSA9IFsxLCAzN10sICRWZiA9IFsxLCAzOF0sICRWZyA9IFsxLCAyN10sICRWaCA9IFsxLCAyOF0sICRWaSA9IFsxLCAyOV0sICRWaiA9IFsxLCAzMF0sICRWayA9IFsxLCAzMV0sICRWbCA9IFsxLCA0NF0sICRWbSA9IFsxLCA0Nl0sICRWbiA9IFsxLCA0M10sICRWbyA9IFsxLCA0N10sICRWcCA9IFsxLCA5XSwgJFZxID0gWzEsIDgsIDldLCAkVnIgPSBbMSwgNThdLCAkVnMgPSBbMSwgNTldLCAkVnQgPSBbMSwgNjBdLCAkVnUgPSBbMSwgNjFdLCAkVnYgPSBbMSwgNjJdLCAkVncgPSBbMSwgNjNdLCAkVnggPSBbMSwgNjRdLCAkVnkgPSBbMSwgOCwgOSwgNDFdLCAkVnogPSBbMSwgNzddLCAkVkEgPSBbMSwgOCwgOSwgMTIsIDEzLCAyMiwgMzksIDQxLCA0NCwgNDYsIDY4LCA2OSwgNzAsIDcxLCA3MiwgNzMsIDc0LCA3OSwgODFdLCAkVkIgPSBbMSwgOCwgOSwgMTIsIDEzLCAxOCwgMjAsIDIyLCAzOSwgNDEsIDQ0LCA0NiwgNDcsIDYwLCA2OCwgNjksIDcwLCA3MSwgNzIsIDczLCA3NCwgNzksIDgxLCA4NiwgMTAwLCAxMDIsIDEwM10sICRWQyA9IFsxMywgNjAsIDg2LCAxMDAsIDEwMiwgMTAzXSwgJFZEID0gWzEzLCA2MCwgNzMsIDc0LCA4NiwgMTAwLCAxMDIsIDEwM10sICRWRSA9IFsxMywgNjAsIDY4LCA2OSwgNzAsIDcxLCA3MiwgODYsIDEwMCwgMTAyLCAxMDNdLCAkVkYgPSBbMSwgMTAzXSwgJFZHID0gWzEsIDEyMV0sICRWSCA9IFsxLCAxMTddLCAkVkkgPSBbMSwgMTEzXSwgJFZKID0gWzEsIDExOV0sICRWSyA9IFsxLCAxMTRdLCAkVkwgPSBbMSwgMTE1XSwgJFZNID0gWzEsIDExNl0sICRWTiA9IFsxLCAxMThdLCAkVk8gPSBbMSwgMTIwXSwgJFZQID0gWzIyLCA1MCwgNjAsIDYxLCA4MiwgODYsIDg3LCA4OCwgODksIDkwXSwgJFZRID0gWzEsIDEyOF0sICRWUiA9IFsxMiwgMzldLCAkVlMgPSBbMSwgOCwgOSwgMzksIDQxLCA0NCwgNDZdLCAkVlQgPSBbMSwgOCwgOSwgMjJdLCAkVlUgPSBbMSwgMTUzXSwgJFZWID0gWzEsIDgsIDksIDYxXSwgJFZXID0gWzEsIDgsIDksIDIyLCA1MCwgNjAsIDYxLCA4MiwgODYsIDg3LCA4OCwgODksIDkwXTtcbiAgdmFyIHBhcnNlcjIgPSB7XG4gICAgdHJhY2U6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gdHJhY2UoKSB7XG4gICAgfSwgXCJ0cmFjZVwiKSxcbiAgICB5eToge30sXG4gICAgc3ltYm9sc186IHsgXCJlcnJvclwiOiAyLCBcInN0YXJ0XCI6IDMsIFwibWVybWFpZERvY1wiOiA0LCBcInN0YXRlbWVudHNcIjogNSwgXCJncmFwaENvbmZpZ1wiOiA2LCBcIkNMQVNTX0RJQUdSQU1cIjogNywgXCJORVdMSU5FXCI6IDgsIFwiRU9GXCI6IDksIFwic3RhdGVtZW50XCI6IDEwLCBcImNsYXNzTGFiZWxcIjogMTEsIFwiU1FTXCI6IDEyLCBcIlNUUlwiOiAxMywgXCJTUUVcIjogMTQsIFwibmFtZXNwYWNlTmFtZVwiOiAxNSwgXCJhbHBoYU51bVRva2VuXCI6IDE2LCBcImNsYXNzTGl0ZXJhbE5hbWVcIjogMTcsIFwiRE9UXCI6IDE4LCBcImNsYXNzTmFtZVwiOiAxOSwgXCJHRU5FUklDVFlQRVwiOiAyMCwgXCJyZWxhdGlvblN0YXRlbWVudFwiOiAyMSwgXCJMQUJFTFwiOiAyMiwgXCJuYW1lc3BhY2VTdGF0ZW1lbnRcIjogMjMsIFwiY2xhc3NTdGF0ZW1lbnRcIjogMjQsIFwibWVtYmVyU3RhdGVtZW50XCI6IDI1LCBcImFubm90YXRpb25TdGF0ZW1lbnRcIjogMjYsIFwiY2xpY2tTdGF0ZW1lbnRcIjogMjcsIFwic3R5bGVTdGF0ZW1lbnRcIjogMjgsIFwiY3NzQ2xhc3NTdGF0ZW1lbnRcIjogMjksIFwibm90ZVN0YXRlbWVudFwiOiAzMCwgXCJjbGFzc0RlZlN0YXRlbWVudFwiOiAzMSwgXCJkaXJlY3Rpb25cIjogMzIsIFwiYWNjX3RpdGxlXCI6IDMzLCBcImFjY190aXRsZV92YWx1ZVwiOiAzNCwgXCJhY2NfZGVzY3JcIjogMzUsIFwiYWNjX2Rlc2NyX3ZhbHVlXCI6IDM2LCBcImFjY19kZXNjcl9tdWx0aWxpbmVfdmFsdWVcIjogMzcsIFwibmFtZXNwYWNlSWRlbnRpZmllclwiOiAzOCwgXCJTVFJVQ1RfU1RBUlRcIjogMzksIFwiY2xhc3NTdGF0ZW1lbnRzXCI6IDQwLCBcIlNUUlVDVF9TVE9QXCI6IDQxLCBcIk5BTUVTUEFDRVwiOiA0MiwgXCJjbGFzc0lkZW50aWZpZXJcIjogNDMsIFwiU1RZTEVfU0VQQVJBVE9SXCI6IDQ0LCBcIm1lbWJlcnNcIjogNDUsIFwiQU5OT1RBVElPTl9TVEFSVFwiOiA0NiwgXCJBTk5PVEFUSU9OX0VORFwiOiA0NywgXCJDTEFTU1wiOiA0OCwgXCJlbXB0eUJvZHlcIjogNDksIFwiU1BBQ0VcIjogNTAsIFwiTUVNQkVSXCI6IDUxLCBcIlNFUEFSQVRPUlwiOiA1MiwgXCJyZWxhdGlvblwiOiA1MywgXCJOT1RFX0ZPUlwiOiA1NCwgXCJub3RlVGV4dFwiOiA1NSwgXCJOT1RFXCI6IDU2LCBcIkNMQVNTREVGXCI6IDU3LCBcImNsYXNzTGlzdFwiOiA1OCwgXCJzdHlsZXNPcHRcIjogNTksIFwiQUxQSEFcIjogNjAsIFwiQ09NTUFcIjogNjEsIFwiZGlyZWN0aW9uX3RiXCI6IDYyLCBcImRpcmVjdGlvbl9idFwiOiA2MywgXCJkaXJlY3Rpb25fcmxcIjogNjQsIFwiZGlyZWN0aW9uX2xyXCI6IDY1LCBcInJlbGF0aW9uVHlwZVwiOiA2NiwgXCJsaW5lVHlwZVwiOiA2NywgXCJBR0dSRUdBVElPTlwiOiA2OCwgXCJFWFRFTlNJT05cIjogNjksIFwiQ09NUE9TSVRJT05cIjogNzAsIFwiREVQRU5ERU5DWVwiOiA3MSwgXCJMT0xMSVBPUFwiOiA3MiwgXCJMSU5FXCI6IDczLCBcIkRPVFRFRF9MSU5FXCI6IDc0LCBcIkNBTExCQUNLXCI6IDc1LCBcIkxJTktcIjogNzYsIFwiTElOS19UQVJHRVRcIjogNzcsIFwiQ0xJQ0tcIjogNzgsIFwiQ0FMTEJBQ0tfTkFNRVwiOiA3OSwgXCJDQUxMQkFDS19BUkdTXCI6IDgwLCBcIkhSRUZcIjogODEsIFwiU1RZTEVcIjogODIsIFwiQ1NTQ0xBU1NcIjogODMsIFwic3R5bGVcIjogODQsIFwic3R5bGVDb21wb25lbnRcIjogODUsIFwiTlVNXCI6IDg2LCBcIkNPTE9OXCI6IDg3LCBcIlVOSVRcIjogODgsIFwiQlJLVFwiOiA4OSwgXCJQQ1RcIjogOTAsIFwiY29tbWVudFRva2VuXCI6IDkxLCBcInRleHRUb2tlblwiOiA5MiwgXCJncmFwaENvZGVUb2tlbnNcIjogOTMsIFwidGV4dE5vVGFnc1Rva2VuXCI6IDk0LCBcIlRBR1NUQVJUXCI6IDk1LCBcIlRBR0VORFwiOiA5NiwgXCI9PVwiOiA5NywgXCItLVwiOiA5OCwgXCJERUZBVUxUXCI6IDk5LCBcIk1JTlVTXCI6IDEwMCwgXCJrZXl3b3Jkc1wiOiAxMDEsIFwiVU5JQ09ERV9URVhUXCI6IDEwMiwgXCJCUVVPVEVfU1RSXCI6IDEwMywgXCIkYWNjZXB0XCI6IDAsIFwiJGVuZFwiOiAxIH0sXG4gICAgdGVybWluYWxzXzogeyAyOiBcImVycm9yXCIsIDc6IFwiQ0xBU1NfRElBR1JBTVwiLCA4OiBcIk5FV0xJTkVcIiwgOTogXCJFT0ZcIiwgMTI6IFwiU1FTXCIsIDEzOiBcIlNUUlwiLCAxNDogXCJTUUVcIiwgMTg6IFwiRE9UXCIsIDIwOiBcIkdFTkVSSUNUWVBFXCIsIDIyOiBcIkxBQkVMXCIsIDMzOiBcImFjY190aXRsZVwiLCAzNDogXCJhY2NfdGl0bGVfdmFsdWVcIiwgMzU6IFwiYWNjX2Rlc2NyXCIsIDM2OiBcImFjY19kZXNjcl92YWx1ZVwiLCAzNzogXCJhY2NfZGVzY3JfbXVsdGlsaW5lX3ZhbHVlXCIsIDM5OiBcIlNUUlVDVF9TVEFSVFwiLCA0MTogXCJTVFJVQ1RfU1RPUFwiLCA0MjogXCJOQU1FU1BBQ0VcIiwgNDQ6IFwiU1RZTEVfU0VQQVJBVE9SXCIsIDQ2OiBcIkFOTk9UQVRJT05fU1RBUlRcIiwgNDc6IFwiQU5OT1RBVElPTl9FTkRcIiwgNDg6IFwiQ0xBU1NcIiwgNTA6IFwiU1BBQ0VcIiwgNTE6IFwiTUVNQkVSXCIsIDUyOiBcIlNFUEFSQVRPUlwiLCA1NDogXCJOT1RFX0ZPUlwiLCA1NjogXCJOT1RFXCIsIDU3OiBcIkNMQVNTREVGXCIsIDYwOiBcIkFMUEhBXCIsIDYxOiBcIkNPTU1BXCIsIDYyOiBcImRpcmVjdGlvbl90YlwiLCA2MzogXCJkaXJlY3Rpb25fYnRcIiwgNjQ6IFwiZGlyZWN0aW9uX3JsXCIsIDY1OiBcImRpcmVjdGlvbl9sclwiLCA2ODogXCJBR0dSRUdBVElPTlwiLCA2OTogXCJFWFRFTlNJT05cIiwgNzA6IFwiQ09NUE9TSVRJT05cIiwgNzE6IFwiREVQRU5ERU5DWVwiLCA3MjogXCJMT0xMSVBPUFwiLCA3MzogXCJMSU5FXCIsIDc0OiBcIkRPVFRFRF9MSU5FXCIsIDc1OiBcIkNBTExCQUNLXCIsIDc2OiBcIkxJTktcIiwgNzc6IFwiTElOS19UQVJHRVRcIiwgNzg6IFwiQ0xJQ0tcIiwgNzk6IFwiQ0FMTEJBQ0tfTkFNRVwiLCA4MDogXCJDQUxMQkFDS19BUkdTXCIsIDgxOiBcIkhSRUZcIiwgODI6IFwiU1RZTEVcIiwgODM6IFwiQ1NTQ0xBU1NcIiwgODY6IFwiTlVNXCIsIDg3OiBcIkNPTE9OXCIsIDg4OiBcIlVOSVRcIiwgODk6IFwiQlJLVFwiLCA5MDogXCJQQ1RcIiwgOTM6IFwiZ3JhcGhDb2RlVG9rZW5zXCIsIDk1OiBcIlRBR1NUQVJUXCIsIDk2OiBcIlRBR0VORFwiLCA5NzogXCI9PVwiLCA5ODogXCItLVwiLCA5OTogXCJERUZBVUxUXCIsIDEwMDogXCJNSU5VU1wiLCAxMDE6IFwia2V5d29yZHNcIiwgMTAyOiBcIlVOSUNPREVfVEVYVFwiLCAxMDM6IFwiQlFVT1RFX1NUUlwiIH0sXG4gICAgcHJvZHVjdGlvbnNfOiBbMCwgWzMsIDFdLCBbMywgMV0sIFs0LCAxXSwgWzYsIDRdLCBbNSwgMV0sIFs1LCAyXSwgWzUsIDNdLCBbMTEsIDNdLCBbMTUsIDFdLCBbMTUsIDFdLCBbMTUsIDNdLCBbMTUsIDJdLCBbMTksIDFdLCBbMTksIDNdLCBbMTksIDFdLCBbMTksIDJdLCBbMTksIDJdLCBbMTksIDJdLCBbMTAsIDFdLCBbMTAsIDJdLCBbMTAsIDFdLCBbMTAsIDFdLCBbMTAsIDFdLCBbMTAsIDFdLCBbMTAsIDFdLCBbMTAsIDFdLCBbMTAsIDFdLCBbMTAsIDFdLCBbMTAsIDFdLCBbMTAsIDFdLCBbMTAsIDJdLCBbMTAsIDJdLCBbMTAsIDFdLCBbMjMsIDRdLCBbMjMsIDVdLCBbMzgsIDJdLCBbMzgsIDNdLCBbNDAsIDFdLCBbNDAsIDJdLCBbNDAsIDNdLCBbNDAsIDFdLCBbNDAsIDJdLCBbNDAsIDNdLCBbNDAsIDFdLCBbNDAsIDJdLCBbNDAsIDNdLCBbMjQsIDFdLCBbMjQsIDNdLCBbMjQsIDRdLCBbMjQsIDNdLCBbMjQsIDZdLCBbMjQsIDRdLCBbMjQsIDddLCBbMjQsIDZdLCBbNDMsIDJdLCBbNDMsIDNdLCBbNDksIDBdLCBbNDksIDJdLCBbNDksIDJdLCBbMjYsIDRdLCBbNDUsIDFdLCBbNDUsIDJdLCBbMjUsIDFdLCBbMjUsIDJdLCBbMjUsIDFdLCBbMjUsIDFdLCBbMjEsIDNdLCBbMjEsIDRdLCBbMjEsIDRdLCBbMjEsIDVdLCBbMzAsIDNdLCBbMzAsIDJdLCBbMzEsIDNdLCBbNTgsIDFdLCBbNTgsIDNdLCBbMzIsIDFdLCBbMzIsIDFdLCBbMzIsIDFdLCBbMzIsIDFdLCBbNTMsIDNdLCBbNTMsIDJdLCBbNTMsIDJdLCBbNTMsIDFdLCBbNjYsIDFdLCBbNjYsIDFdLCBbNjYsIDFdLCBbNjYsIDFdLCBbNjYsIDFdLCBbNjcsIDFdLCBbNjcsIDFdLCBbMjcsIDNdLCBbMjcsIDRdLCBbMjcsIDNdLCBbMjcsIDRdLCBbMjcsIDRdLCBbMjcsIDVdLCBbMjcsIDNdLCBbMjcsIDRdLCBbMjcsIDRdLCBbMjcsIDVdLCBbMjcsIDRdLCBbMjcsIDVdLCBbMjcsIDVdLCBbMjcsIDZdLCBbMjgsIDNdLCBbMjksIDNdLCBbNTksIDFdLCBbNTksIDNdLCBbODQsIDFdLCBbODQsIDJdLCBbODUsIDFdLCBbODUsIDFdLCBbODUsIDFdLCBbODUsIDFdLCBbODUsIDFdLCBbODUsIDFdLCBbODUsIDFdLCBbODUsIDFdLCBbODUsIDFdLCBbOTEsIDFdLCBbOTEsIDFdLCBbOTIsIDFdLCBbOTIsIDFdLCBbOTIsIDFdLCBbOTIsIDFdLCBbOTIsIDFdLCBbOTIsIDFdLCBbOTIsIDFdLCBbOTQsIDFdLCBbOTQsIDFdLCBbOTQsIDFdLCBbOTQsIDFdLCBbMTYsIDFdLCBbMTYsIDFdLCBbMTYsIDFdLCBbMTYsIDFdLCBbMTcsIDFdLCBbNTUsIDFdXSxcbiAgICBwZXJmb3JtQWN0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGFub255bW91cyh5eXRleHQsIHl5bGVuZywgeXlsaW5lbm8sIHl5LCB5eXN0YXRlLCAkJCwgXyQpIHtcbiAgICAgIHZhciAkMCA9ICQkLmxlbmd0aCAtIDE7XG4gICAgICBzd2l0Y2ggKHl5c3RhdGUpIHtcbiAgICAgICAgY2FzZSA4OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTpcbiAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgY2FzZSAxNTpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTE6XG4gICAgICAgIGNhc2UgMTQ6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAyXSArIFwiLlwiICsgJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEyOlxuICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMV0gKyAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTc6XG4gICAgICAgIGNhc2UgMTg6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAxXSArIFwiflwiICsgJCRbJDBdICsgXCJ+XCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTk6XG4gICAgICAgICAgeXkuYWRkUmVsYXRpb24oJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyMDpcbiAgICAgICAgICAkJFskMCAtIDFdLnRpdGxlID0geXkuY2xlYW51cExhYmVsKCQkWyQwXSk7XG4gICAgICAgICAgeXkuYWRkUmVsYXRpb24oJCRbJDAgLSAxXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzE6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdLnRyaW0oKTtcbiAgICAgICAgICB5eS5zZXRBY2NUaXRsZSh0aGlzLiQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMyOlxuICAgICAgICBjYXNlIDMzOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS50cmltKCk7XG4gICAgICAgICAgeXkuc2V0QWNjRGVzY3JpcHRpb24odGhpcy4kKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzNDpcbiAgICAgICAgICB5eS5hZGRDbGFzc2VzVG9OYW1lc3BhY2UoJCRbJDAgLSAzXSwgJCRbJDAgLSAxXVswXSwgJCRbJDAgLSAxXVsxXSk7XG4gICAgICAgICAgeXkucG9wTmFtZXNwYWNlKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzU6XG4gICAgICAgICAgeXkuYWRkQ2xhc3Nlc1RvTmFtZXNwYWNlKCQkWyQwIC0gNF0sICQkWyQwIC0gMV1bMF0sICQkWyQwIC0gMV1bMV0pO1xuICAgICAgICAgIHl5LnBvcE5hbWVzcGFjZSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM2OlxuICAgICAgICAgIHRoaXMuJCA9IHl5LmFkZE5hbWVzcGFjZSgkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgIHRoaXMuJCA9IHl5LmFkZE5hbWVzcGFjZSgkJFskMCAtIDFdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM4OlxuICAgICAgICAgIHRoaXMuJCA9IFtbJCRbJDBdXSwgW11dO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM5OlxuICAgICAgICAgIHRoaXMuJCA9IFtbJCRbJDAgLSAxXV0sIFtdXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0MDpcbiAgICAgICAgICAkJFskMF1bMF0udW5zaGlmdCgkJFskMCAtIDJdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDE6XG4gICAgICAgICAgdGhpcy4kID0gW1tdLCBbJCRbJDBdXV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDI6XG4gICAgICAgICAgdGhpcy4kID0gW1tdLCBbJCRbJDAgLSAxXV1dO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQzOlxuICAgICAgICAgICQkWyQwXVsxXS51bnNoaWZ0KCQkWyQwIC0gMl0pO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0NDpcbiAgICAgICAgY2FzZSA0NTpcbiAgICAgICAgICB0aGlzLiQgPSBbW10sIFtdXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0NjpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDg6XG4gICAgICAgICAgeXkuc2V0Q3NzQ2xhc3MoJCRbJDAgLSAyXSwgJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OTpcbiAgICAgICAgICB5eS5hZGRNZW1iZXJzKCQkWyQwIC0gM10sICQkWyQwIC0gMV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDUxOlxuICAgICAgICAgIHl5LnNldENzc0NsYXNzKCQkWyQwIC0gNV0sICQkWyQwIC0gM10pO1xuICAgICAgICAgIHl5LmFkZE1lbWJlcnMoJCRbJDAgLSA1XSwgJCRbJDAgLSAxXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTI6XG4gICAgICAgICAgeXkuYWRkQW5ub3RhdGlvbigkJFskMCAtIDNdLCAkJFskMCAtIDFdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1MzpcbiAgICAgICAgICB5eS5hZGRBbm5vdGF0aW9uKCQkWyQwIC0gNl0sICQkWyQwIC0gNF0pO1xuICAgICAgICAgIHl5LmFkZE1lbWJlcnMoJCRbJDAgLSA2XSwgJCRbJDAgLSAxXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTQ6XG4gICAgICAgICAgeXkuYWRkQW5ub3RhdGlvbigkJFskMCAtIDVdLCAkJFskMCAtIDNdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1NTpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgeXkuYWRkQ2xhc3MoJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1NjpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDFdO1xuICAgICAgICAgIHl5LmFkZENsYXNzKCQkWyQwIC0gMV0pO1xuICAgICAgICAgIHl5LnNldENsYXNzTGFiZWwoJCRbJDAgLSAxXSwgJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2MDpcbiAgICAgICAgICB5eS5hZGRBbm5vdGF0aW9uKCQkWyQwXSwgJCRbJDAgLSAyXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjE6XG4gICAgICAgIGNhc2UgNzQ6XG4gICAgICAgICAgdGhpcy4kID0gWyQkWyQwXV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjI6XG4gICAgICAgICAgJCRbJDBdLnB1c2goJCRbJDAgLSAxXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDYzOlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY0OlxuICAgICAgICAgIHl5LmFkZE1lbWJlcigkJFskMCAtIDFdLCB5eS5jbGVhbnVwTGFiZWwoJCRbJDBdKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjU6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjY6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjc6XG4gICAgICAgICAgdGhpcy4kID0geyBcImlkMVwiOiAkJFskMCAtIDJdLCBcImlkMlwiOiAkJFskMF0sIHJlbGF0aW9uOiAkJFskMCAtIDFdLCByZWxhdGlvblRpdGxlMTogXCJub25lXCIsIHJlbGF0aW9uVGl0bGUyOiBcIm5vbmVcIiB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY4OlxuICAgICAgICAgIHRoaXMuJCA9IHsgaWQxOiAkJFskMCAtIDNdLCBpZDI6ICQkWyQwXSwgcmVsYXRpb246ICQkWyQwIC0gMV0sIHJlbGF0aW9uVGl0bGUxOiAkJFskMCAtIDJdLCByZWxhdGlvblRpdGxlMjogXCJub25lXCIgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2OTpcbiAgICAgICAgICB0aGlzLiQgPSB7IGlkMTogJCRbJDAgLSAzXSwgaWQyOiAkJFskMF0sIHJlbGF0aW9uOiAkJFskMCAtIDJdLCByZWxhdGlvblRpdGxlMTogXCJub25lXCIsIHJlbGF0aW9uVGl0bGUyOiAkJFskMCAtIDFdIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzA6XG4gICAgICAgICAgdGhpcy4kID0geyBpZDE6ICQkWyQwIC0gNF0sIGlkMjogJCRbJDBdLCByZWxhdGlvbjogJCRbJDAgLSAyXSwgcmVsYXRpb25UaXRsZTE6ICQkWyQwIC0gM10sIHJlbGF0aW9uVGl0bGUyOiAkJFskMCAtIDFdIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzE6XG4gICAgICAgICAgdGhpcy4kID0geXkuYWRkTm90ZSgkJFskMF0sICQkWyQwIC0gMV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDcyOlxuICAgICAgICAgIHRoaXMuJCA9IHl5LmFkZE5vdGUoJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA3MzpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDJdO1xuICAgICAgICAgIHl5LmRlZmluZUNsYXNzKCQkWyQwIC0gMV0sICQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzU6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAyXS5jb25jYXQoWyQkWyQwXV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc2OlxuICAgICAgICAgIHl5LnNldERpcmVjdGlvbihcIlRCXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc3OlxuICAgICAgICAgIHl5LnNldERpcmVjdGlvbihcIkJUXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc4OlxuICAgICAgICAgIHl5LnNldERpcmVjdGlvbihcIlJMXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc5OlxuICAgICAgICAgIHl5LnNldERpcmVjdGlvbihcIkxSXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDgwOlxuICAgICAgICAgIHRoaXMuJCA9IHsgdHlwZTE6ICQkWyQwIC0gMl0sIHR5cGUyOiAkJFskMF0sIGxpbmVUeXBlOiAkJFskMCAtIDFdIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgODE6XG4gICAgICAgICAgdGhpcy4kID0geyB0eXBlMTogXCJub25lXCIsIHR5cGUyOiAkJFskMF0sIGxpbmVUeXBlOiAkJFskMCAtIDFdIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgODI6XG4gICAgICAgICAgdGhpcy4kID0geyB0eXBlMTogJCRbJDAgLSAxXSwgdHlwZTI6IFwibm9uZVwiLCBsaW5lVHlwZTogJCRbJDBdIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgODM6XG4gICAgICAgICAgdGhpcy4kID0geyB0eXBlMTogXCJub25lXCIsIHR5cGUyOiBcIm5vbmVcIiwgbGluZVR5cGU6ICQkWyQwXSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDg0OlxuICAgICAgICAgIHRoaXMuJCA9IHl5LnJlbGF0aW9uVHlwZS5BR0dSRUdBVElPTjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA4NTpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5yZWxhdGlvblR5cGUuRVhURU5TSU9OO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDg2OlxuICAgICAgICAgIHRoaXMuJCA9IHl5LnJlbGF0aW9uVHlwZS5DT01QT1NJVElPTjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA4NzpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5yZWxhdGlvblR5cGUuREVQRU5ERU5DWTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA4ODpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5yZWxhdGlvblR5cGUuTE9MTElQT1A7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgODk6XG4gICAgICAgICAgdGhpcy4kID0geXkubGluZVR5cGUuTElORTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA5MDpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5saW5lVHlwZS5ET1RURURfTElORTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA5MTpcbiAgICAgICAgY2FzZSA5NzpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDJdO1xuICAgICAgICAgIHl5LnNldENsaWNrRXZlbnQoJCRbJDAgLSAxXSwgJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA5MjpcbiAgICAgICAgY2FzZSA5ODpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDNdO1xuICAgICAgICAgIHl5LnNldENsaWNrRXZlbnQoJCRbJDAgLSAyXSwgJCRbJDAgLSAxXSk7XG4gICAgICAgICAgeXkuc2V0VG9vbHRpcCgkJFskMCAtIDJdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDkzOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMl07XG4gICAgICAgICAgeXkuc2V0TGluaygkJFskMCAtIDFdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDk0OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gM107XG4gICAgICAgICAgeXkuc2V0TGluaygkJFskMCAtIDJdLCAkJFskMCAtIDFdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDk1OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gM107XG4gICAgICAgICAgeXkuc2V0TGluaygkJFskMCAtIDJdLCAkJFskMCAtIDFdKTtcbiAgICAgICAgICB5eS5zZXRUb29sdGlwKCQkWyQwIC0gMl0sICQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTY6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSA0XTtcbiAgICAgICAgICB5eS5zZXRMaW5rKCQkWyQwIC0gM10sICQkWyQwIC0gMl0sICQkWyQwXSk7XG4gICAgICAgICAgeXkuc2V0VG9vbHRpcCgkJFskMCAtIDNdLCAkJFskMCAtIDFdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA5OTpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDNdO1xuICAgICAgICAgIHl5LnNldENsaWNrRXZlbnQoJCRbJDAgLSAyXSwgJCRbJDAgLSAxXSwgJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMDA6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSA0XTtcbiAgICAgICAgICB5eS5zZXRDbGlja0V2ZW50KCQkWyQwIC0gM10sICQkWyQwIC0gMl0sICQkWyQwIC0gMV0pO1xuICAgICAgICAgIHl5LnNldFRvb2x0aXAoJCRbJDAgLSAzXSwgJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMDE6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAzXTtcbiAgICAgICAgICB5eS5zZXRMaW5rKCQkWyQwIC0gMl0sICQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTAyOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gNF07XG4gICAgICAgICAgeXkuc2V0TGluaygkJFskMCAtIDNdLCAkJFskMCAtIDFdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEwMzpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDRdO1xuICAgICAgICAgIHl5LnNldExpbmsoJCRbJDAgLSAzXSwgJCRbJDAgLSAxXSk7XG4gICAgICAgICAgeXkuc2V0VG9vbHRpcCgkJFskMCAtIDNdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEwNDpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDVdO1xuICAgICAgICAgIHl5LnNldExpbmsoJCRbJDAgLSA0XSwgJCRbJDAgLSAyXSwgJCRbJDBdKTtcbiAgICAgICAgICB5eS5zZXRUb29sdGlwKCQkWyQwIC0gNF0sICQkWyQwIC0gMV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEwNTpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDJdO1xuICAgICAgICAgIHl5LnNldENzc1N0eWxlKCQkWyQwIC0gMV0sICQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTA2OlxuICAgICAgICAgIHl5LnNldENzc0NsYXNzKCQkWyQwIC0gMV0sICQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTA3OlxuICAgICAgICAgIHRoaXMuJCA9IFskJFskMF1dO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEwODpcbiAgICAgICAgICAkJFskMCAtIDJdLnB1c2goJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDJdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDExMDpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDFdICsgJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0sIFwiYW5vbnltb3VzXCIpLFxuICAgIHRhYmxlOiBbeyAzOiAxLCA0OiAyLCA1OiAzLCA2OiA0LCA3OiBbMSwgNl0sIDEwOiA1LCAxNjogMzksIDE3OiA0MCwgMTk6IDIxLCAyMTogNywgMjM6IDgsIDI0OiA5LCAyNTogMTAsIDI2OiAxMSwgMjc6IDEyLCAyODogMTMsIDI5OiAxNCwgMzA6IDE1LCAzMTogMTYsIDMyOiAxNywgMzM6ICRWMCwgMzU6ICRWMSwgMzc6ICRWMiwgMzg6IDIyLCA0MjogJFYzLCA0MzogMjMsIDQ2OiAkVjQsIDQ4OiAkVjUsIDUxOiAkVjYsIDUyOiAkVjcsIDU0OiAkVjgsIDU2OiAkVjksIDU3OiAkVmEsIDYwOiAkVmIsIDYyOiAkVmMsIDYzOiAkVmQsIDY0OiAkVmUsIDY1OiAkVmYsIDc1OiAkVmcsIDc2OiAkVmgsIDc4OiAkVmksIDgyOiAkVmosIDgzOiAkVmssIDg2OiAkVmwsIDEwMDogJFZtLCAxMDI6ICRWbiwgMTAzOiAkVm8gfSwgeyAxOiBbM10gfSwgeyAxOiBbMiwgMV0gfSwgeyAxOiBbMiwgMl0gfSwgeyAxOiBbMiwgM10gfSwgbygkVnAsIFsyLCA1XSwgeyA4OiBbMSwgNDhdIH0pLCB7IDg6IFsxLCA0OV0gfSwgbygkVnEsIFsyLCAxOV0sIHsgMjI6IFsxLCA1MF0gfSksIG8oJFZxLCBbMiwgMjFdKSwgbygkVnEsIFsyLCAyMl0pLCBvKCRWcSwgWzIsIDIzXSksIG8oJFZxLCBbMiwgMjRdKSwgbygkVnEsIFsyLCAyNV0pLCBvKCRWcSwgWzIsIDI2XSksIG8oJFZxLCBbMiwgMjddKSwgbygkVnEsIFsyLCAyOF0pLCBvKCRWcSwgWzIsIDI5XSksIG8oJFZxLCBbMiwgMzBdKSwgeyAzNDogWzEsIDUxXSB9LCB7IDM2OiBbMSwgNTJdIH0sIG8oJFZxLCBbMiwgMzNdKSwgbygkVnEsIFsyLCA2M10sIHsgNTM6IDUzLCA2NjogNTYsIDY3OiA1NywgMTM6IFsxLCA1NF0sIDIyOiBbMSwgNTVdLCA2ODogJFZyLCA2OTogJFZzLCA3MDogJFZ0LCA3MTogJFZ1LCA3MjogJFZ2LCA3MzogJFZ3LCA3NDogJFZ4IH0pLCB7IDM5OiBbMSwgNjVdIH0sIG8oJFZ5LCBbMiwgNDddLCB7IDM5OiBbMSwgNjddLCA0NDogWzEsIDY2XSwgNDY6IFsxLCA2OF0gfSksIG8oJFZxLCBbMiwgNjVdKSwgbygkVnEsIFsyLCA2Nl0pLCB7IDE2OiA2OSwgNjA6ICRWYiwgODY6ICRWbCwgMTAwOiAkVm0sIDEwMjogJFZuIH0sIHsgMTY6IDM5LCAxNzogNDAsIDE5OiA3MCwgNjA6ICRWYiwgODY6ICRWbCwgMTAwOiAkVm0sIDEwMjogJFZuLCAxMDM6ICRWbyB9LCB7IDE2OiAzOSwgMTc6IDQwLCAxOTogNzEsIDYwOiAkVmIsIDg2OiAkVmwsIDEwMDogJFZtLCAxMDI6ICRWbiwgMTAzOiAkVm8gfSwgeyAxNjogMzksIDE3OiA0MCwgMTk6IDcyLCA2MDogJFZiLCA4NjogJFZsLCAxMDA6ICRWbSwgMTAyOiAkVm4sIDEwMzogJFZvIH0sIHsgNjA6IFsxLCA3M10gfSwgeyAxMzogWzEsIDc0XSB9LCB7IDE2OiAzOSwgMTc6IDQwLCAxOTogNzUsIDYwOiAkVmIsIDg2OiAkVmwsIDEwMDogJFZtLCAxMDI6ICRWbiwgMTAzOiAkVm8gfSwgeyAxMzogJFZ6LCA1NTogNzYgfSwgeyA1ODogNzgsIDYwOiBbMSwgNzldIH0sIG8oJFZxLCBbMiwgNzZdKSwgbygkVnEsIFsyLCA3N10pLCBvKCRWcSwgWzIsIDc4XSksIG8oJFZxLCBbMiwgNzldKSwgbygkVkEsIFsyLCAxM10sIHsgMTY6IDM5LCAxNzogNDAsIDE5OiA4MSwgMTg6IFsxLCA4MF0sIDIwOiBbMSwgODJdLCA2MDogJFZiLCA4NjogJFZsLCAxMDA6ICRWbSwgMTAyOiAkVm4sIDEwMzogJFZvIH0pLCBvKCRWQSwgWzIsIDE1XSwgeyAyMDogWzEsIDgzXSB9KSwgeyAxNTogODQsIDE2OiA4NSwgMTc6IDg2LCA2MDogJFZiLCA4NjogJFZsLCAxMDA6ICRWbSwgMTAyOiAkVm4sIDEwMzogJFZvIH0sIHsgMTY6IDM5LCAxNzogNDAsIDE5OiA4NywgNjA6ICRWYiwgODY6ICRWbCwgMTAwOiAkVm0sIDEwMjogJFZuLCAxMDM6ICRWbyB9LCBvKCRWQiwgWzIsIDEzM10pLCBvKCRWQiwgWzIsIDEzNF0pLCBvKCRWQiwgWzIsIDEzNV0pLCBvKCRWQiwgWzIsIDEzNl0pLCBvKFsxLCA4LCA5LCAxMiwgMTMsIDIwLCAyMiwgMzksIDQxLCA0NCwgNDYsIDY4LCA2OSwgNzAsIDcxLCA3MiwgNzMsIDc0LCA3OSwgODFdLCBbMiwgMTM3XSksIG8oJFZwLCBbMiwgNl0sIHsgMTA6IDUsIDIxOiA3LCAyMzogOCwgMjQ6IDksIDI1OiAxMCwgMjY6IDExLCAyNzogMTIsIDI4OiAxMywgMjk6IDE0LCAzMDogMTUsIDMxOiAxNiwgMzI6IDE3LCAxOTogMjEsIDM4OiAyMiwgNDM6IDIzLCAxNjogMzksIDE3OiA0MCwgNTogODgsIDMzOiAkVjAsIDM1OiAkVjEsIDM3OiAkVjIsIDQyOiAkVjMsIDQ2OiAkVjQsIDQ4OiAkVjUsIDUxOiAkVjYsIDUyOiAkVjcsIDU0OiAkVjgsIDU2OiAkVjksIDU3OiAkVmEsIDYwOiAkVmIsIDYyOiAkVmMsIDYzOiAkVmQsIDY0OiAkVmUsIDY1OiAkVmYsIDc1OiAkVmcsIDc2OiAkVmgsIDc4OiAkVmksIDgyOiAkVmosIDgzOiAkVmssIDg2OiAkVmwsIDEwMDogJFZtLCAxMDI6ICRWbiwgMTAzOiAkVm8gfSksIHsgNTogODksIDEwOiA1LCAxNjogMzksIDE3OiA0MCwgMTk6IDIxLCAyMTogNywgMjM6IDgsIDI0OiA5LCAyNTogMTAsIDI2OiAxMSwgMjc6IDEyLCAyODogMTMsIDI5OiAxNCwgMzA6IDE1LCAzMTogMTYsIDMyOiAxNywgMzM6ICRWMCwgMzU6ICRWMSwgMzc6ICRWMiwgMzg6IDIyLCA0MjogJFYzLCA0MzogMjMsIDQ2OiAkVjQsIDQ4OiAkVjUsIDUxOiAkVjYsIDUyOiAkVjcsIDU0OiAkVjgsIDU2OiAkVjksIDU3OiAkVmEsIDYwOiAkVmIsIDYyOiAkVmMsIDYzOiAkVmQsIDY0OiAkVmUsIDY1OiAkVmYsIDc1OiAkVmcsIDc2OiAkVmgsIDc4OiAkVmksIDgyOiAkVmosIDgzOiAkVmssIDg2OiAkVmwsIDEwMDogJFZtLCAxMDI6ICRWbiwgMTAzOiAkVm8gfSwgbygkVnEsIFsyLCAyMF0pLCBvKCRWcSwgWzIsIDMxXSksIG8oJFZxLCBbMiwgMzJdKSwgeyAxMzogWzEsIDkxXSwgMTY6IDM5LCAxNzogNDAsIDE5OiA5MCwgNjA6ICRWYiwgODY6ICRWbCwgMTAwOiAkVm0sIDEwMjogJFZuLCAxMDM6ICRWbyB9LCB7IDUzOiA5MiwgNjY6IDU2LCA2NzogNTcsIDY4OiAkVnIsIDY5OiAkVnMsIDcwOiAkVnQsIDcxOiAkVnUsIDcyOiAkVnYsIDczOiAkVncsIDc0OiAkVnggfSwgbygkVnEsIFsyLCA2NF0pLCB7IDY3OiA5MywgNzM6ICRWdywgNzQ6ICRWeCB9LCBvKCRWQywgWzIsIDgzXSwgeyA2NjogOTQsIDY4OiAkVnIsIDY5OiAkVnMsIDcwOiAkVnQsIDcxOiAkVnUsIDcyOiAkVnYgfSksIG8oJFZELCBbMiwgODRdKSwgbygkVkQsIFsyLCA4NV0pLCBvKCRWRCwgWzIsIDg2XSksIG8oJFZELCBbMiwgODddKSwgbygkVkQsIFsyLCA4OF0pLCBvKCRWRSwgWzIsIDg5XSksIG8oJFZFLCBbMiwgOTBdKSwgeyA4OiBbMSwgOTZdLCAyMzogOTksIDI0OiA5NywgMzA6IDk4LCAzODogMjIsIDQwOiA5NSwgNDI6ICRWMywgNDM6IDIzLCA0ODogJFY1LCA1NDogJFY4LCA1NjogJFY5IH0sIHsgMTY6IDEwMCwgNjA6ICRWYiwgODY6ICRWbCwgMTAwOiAkVm0sIDEwMjogJFZuIH0sIHsgNDE6IFsxLCAxMDJdLCA0NTogMTAxLCA1MTogJFZGIH0sIHsgMTY6IDEwNCwgNjA6ICRWYiwgODY6ICRWbCwgMTAwOiAkVm0sIDEwMjogJFZuIH0sIHsgNDc6IFsxLCAxMDVdIH0sIHsgMTM6IFsxLCAxMDZdIH0sIHsgMTM6IFsxLCAxMDddIH0sIHsgNzk6IFsxLCAxMDhdLCA4MTogWzEsIDEwOV0gfSwgeyAyMjogJFZHLCA1MDogJFZILCA1OTogMTEwLCA2MDogJFZJLCA4MjogJFZKLCA4NDogMTExLCA4NTogMTEyLCA4NjogJFZLLCA4NzogJFZMLCA4ODogJFZNLCA4OTogJFZOLCA5MDogJFZPIH0sIHsgNjA6IFsxLCAxMjJdIH0sIHsgMTM6ICRWeiwgNTU6IDEyMyB9LCBvKCRWeSwgWzIsIDcyXSksIG8oJFZ5LCBbMiwgMTM4XSksIHsgMjI6ICRWRywgNTA6ICRWSCwgNTk6IDEyNCwgNjA6ICRWSSwgNjE6IFsxLCAxMjVdLCA4MjogJFZKLCA4NDogMTExLCA4NTogMTEyLCA4NjogJFZLLCA4NzogJFZMLCA4ODogJFZNLCA4OTogJFZOLCA5MDogJFZPIH0sIG8oJFZQLCBbMiwgNzRdKSwgeyAxNjogMzksIDE3OiA0MCwgMTk6IDEyNiwgNjA6ICRWYiwgODY6ICRWbCwgMTAwOiAkVm0sIDEwMjogJFZuLCAxMDM6ICRWbyB9LCBvKCRWQSwgWzIsIDE2XSksIG8oJFZBLCBbMiwgMTddKSwgbygkVkEsIFsyLCAxOF0pLCB7IDExOiAxMjcsIDEyOiAkVlEsIDM5OiBbMiwgMzZdIH0sIG8oJFZSLCBbMiwgOV0sIHsgMTY6IDg1LCAxNzogODYsIDE1OiAxMzAsIDE4OiBbMSwgMTI5XSwgNjA6ICRWYiwgODY6ICRWbCwgMTAwOiAkVm0sIDEwMjogJFZuLCAxMDM6ICRWbyB9KSwgbygkVlIsIFsyLCAxMF0pLCBvKCRWUywgWzIsIDU1XSwgeyAxMTogMTMxLCAxMjogJFZRIH0pLCBvKCRWcCwgWzIsIDddKSwgeyA5OiBbMSwgMTMyXSB9LCBvKCRWVCwgWzIsIDY3XSksIHsgMTY6IDM5LCAxNzogNDAsIDE5OiAxMzMsIDYwOiAkVmIsIDg2OiAkVmwsIDEwMDogJFZtLCAxMDI6ICRWbiwgMTAzOiAkVm8gfSwgeyAxMzogWzEsIDEzNV0sIDE2OiAzOSwgMTc6IDQwLCAxOTogMTM0LCA2MDogJFZiLCA4NjogJFZsLCAxMDA6ICRWbSwgMTAyOiAkVm4sIDEwMzogJFZvIH0sIG8oJFZDLCBbMiwgODJdLCB7IDY2OiAxMzYsIDY4OiAkVnIsIDY5OiAkVnMsIDcwOiAkVnQsIDcxOiAkVnUsIDcyOiAkVnYgfSksIG8oJFZDLCBbMiwgODFdKSwgeyA0MTogWzEsIDEzN10gfSwgeyAyMzogOTksIDI0OiA5NywgMzA6IDk4LCAzODogMjIsIDQwOiAxMzgsIDQyOiAkVjMsIDQzOiAyMywgNDg6ICRWNSwgNTQ6ICRWOCwgNTY6ICRWOSB9LCB7IDg6IFsxLCAxMzldLCA0MTogWzIsIDM4XSB9LCB7IDg6IFsxLCAxNDBdLCA0MTogWzIsIDQxXSB9LCB7IDg6IFsxLCAxNDFdLCA0MTogWzIsIDQ0XSB9LCBvKCRWeSwgWzIsIDQ4XSwgeyAzOTogWzEsIDE0Ml0gfSksIHsgNDE6IFsxLCAxNDNdIH0sIG8oJFZ5LCBbMiwgNTBdKSwgeyA0MTogWzIsIDYxXSwgNDU6IDE0NCwgNTE6ICRWRiB9LCB7IDQ3OiBbMSwgMTQ1XSB9LCB7IDE2OiAzOSwgMTc6IDQwLCAxOTogMTQ2LCA2MDogJFZiLCA4NjogJFZsLCAxMDA6ICRWbSwgMTAyOiAkVm4sIDEwMzogJFZvIH0sIG8oJFZxLCBbMiwgOTFdLCB7IDEzOiBbMSwgMTQ3XSB9KSwgbygkVnEsIFsyLCA5M10sIHsgMTM6IFsxLCAxNDldLCA3NzogWzEsIDE0OF0gfSksIG8oJFZxLCBbMiwgOTddLCB7IDEzOiBbMSwgMTUwXSwgODA6IFsxLCAxNTFdIH0pLCB7IDEzOiBbMSwgMTUyXSB9LCBvKCRWcSwgWzIsIDEwNV0sIHsgNjE6ICRWVSB9KSwgbygkVlYsIFsyLCAxMDddLCB7IDg1OiAxNTQsIDIyOiAkVkcsIDUwOiAkVkgsIDYwOiAkVkksIDgyOiAkVkosIDg2OiAkVkssIDg3OiAkVkwsIDg4OiAkVk0sIDg5OiAkVk4sIDkwOiAkVk8gfSksIG8oJFZXLCBbMiwgMTA5XSksIG8oJFZXLCBbMiwgMTExXSksIG8oJFZXLCBbMiwgMTEyXSksIG8oJFZXLCBbMiwgMTEzXSksIG8oJFZXLCBbMiwgMTE0XSksIG8oJFZXLCBbMiwgMTE1XSksIG8oJFZXLCBbMiwgMTE2XSksIG8oJFZXLCBbMiwgMTE3XSksIG8oJFZXLCBbMiwgMTE4XSksIG8oJFZXLCBbMiwgMTE5XSksIG8oJFZxLCBbMiwgMTA2XSksIG8oJFZ5LCBbMiwgNzFdKSwgbygkVnEsIFsyLCA3M10sIHsgNjE6ICRWVSB9KSwgeyA2MDogWzEsIDE1NV0gfSwgbygkVkEsIFsyLCAxNF0pLCB7IDM5OiBbMiwgMzddIH0sIHsgMTM6IFsxLCAxNTZdIH0sIHsgMTU6IDE1NywgMTY6IDg1LCAxNzogODYsIDYwOiAkVmIsIDg2OiAkVmwsIDEwMDogJFZtLCAxMDI6ICRWbiwgMTAzOiAkVm8gfSwgbygkVlIsIFsyLCAxMl0pLCBvKCRWUywgWzIsIDU2XSksIHsgMTogWzIsIDRdIH0sIG8oJFZULCBbMiwgNjldKSwgbygkVlQsIFsyLCA2OF0pLCB7IDE2OiAzOSwgMTc6IDQwLCAxOTogMTU4LCA2MDogJFZiLCA4NjogJFZsLCAxMDA6ICRWbSwgMTAyOiAkVm4sIDEwMzogJFZvIH0sIG8oJFZDLCBbMiwgODBdKSwgbygkVnksIFsyLCAzNF0pLCB7IDQxOiBbMSwgMTU5XSB9LCB7IDIzOiA5OSwgMjQ6IDk3LCAzMDogOTgsIDM4OiAyMiwgNDA6IDE2MCwgNDE6IFsyLCAzOV0sIDQyOiAkVjMsIDQzOiAyMywgNDg6ICRWNSwgNTQ6ICRWOCwgNTY6ICRWOSB9LCB7IDIzOiA5OSwgMjQ6IDk3LCAzMDogOTgsIDM4OiAyMiwgNDA6IDE2MSwgNDE6IFsyLCA0Ml0sIDQyOiAkVjMsIDQzOiAyMywgNDg6ICRWNSwgNTQ6ICRWOCwgNTY6ICRWOSB9LCB7IDIzOiA5OSwgMjQ6IDk3LCAzMDogOTgsIDM4OiAyMiwgNDA6IDE2MiwgNDE6IFsyLCA0NV0sIDQyOiAkVjMsIDQzOiAyMywgNDg6ICRWNSwgNTQ6ICRWOCwgNTY6ICRWOSB9LCB7IDQ1OiAxNjMsIDUxOiAkVkYgfSwgbygkVnksIFsyLCA0OV0pLCB7IDQxOiBbMiwgNjJdIH0sIG8oJFZ5LCBbMiwgNTJdLCB7IDM5OiBbMSwgMTY0XSB9KSwgbygkVnEsIFsyLCA2MF0pLCBvKCRWcSwgWzIsIDkyXSksIG8oJFZxLCBbMiwgOTRdKSwgbygkVnEsIFsyLCA5NV0sIHsgNzc6IFsxLCAxNjVdIH0pLCBvKCRWcSwgWzIsIDk4XSksIG8oJFZxLCBbMiwgOTldLCB7IDEzOiBbMSwgMTY2XSB9KSwgbygkVnEsIFsyLCAxMDFdLCB7IDEzOiBbMSwgMTY4XSwgNzc6IFsxLCAxNjddIH0pLCB7IDIyOiAkVkcsIDUwOiAkVkgsIDYwOiAkVkksIDgyOiAkVkosIDg0OiAxNjksIDg1OiAxMTIsIDg2OiAkVkssIDg3OiAkVkwsIDg4OiAkVk0sIDg5OiAkVk4sIDkwOiAkVk8gfSwgbygkVlcsIFsyLCAxMTBdKSwgbygkVlAsIFsyLCA3NV0pLCB7IDE0OiBbMSwgMTcwXSB9LCBvKCRWUiwgWzIsIDExXSksIG8oJFZULCBbMiwgNzBdKSwgbygkVnksIFsyLCAzNV0pLCB7IDQxOiBbMiwgNDBdIH0sIHsgNDE6IFsyLCA0M10gfSwgeyA0MTogWzIsIDQ2XSB9LCB7IDQxOiBbMSwgMTcxXSB9LCB7IDQxOiBbMSwgMTczXSwgNDU6IDE3MiwgNTE6ICRWRiB9LCBvKCRWcSwgWzIsIDk2XSksIG8oJFZxLCBbMiwgMTAwXSksIG8oJFZxLCBbMiwgMTAyXSksIG8oJFZxLCBbMiwgMTAzXSwgeyA3NzogWzEsIDE3NF0gfSksIG8oJFZWLCBbMiwgMTA4XSwgeyA4NTogMTU0LCAyMjogJFZHLCA1MDogJFZILCA2MDogJFZJLCA4MjogJFZKLCA4NjogJFZLLCA4NzogJFZMLCA4ODogJFZNLCA4OTogJFZOLCA5MDogJFZPIH0pLCBvKCRWUywgWzIsIDhdKSwgbygkVnksIFsyLCA1MV0pLCB7IDQxOiBbMSwgMTc1XSB9LCBvKCRWeSwgWzIsIDU0XSksIG8oJFZxLCBbMiwgMTA0XSksIG8oJFZ5LCBbMiwgNTNdKV0sXG4gICAgZGVmYXVsdEFjdGlvbnM6IHsgMjogWzIsIDFdLCAzOiBbMiwgMl0sIDQ6IFsyLCAzXSwgMTI3OiBbMiwgMzddLCAxMzI6IFsyLCA0XSwgMTQ0OiBbMiwgNjJdLCAxNjA6IFsyLCA0MF0sIDE2MTogWzIsIDQzXSwgMTYyOiBbMiwgNDZdIH0sXG4gICAgcGFyc2VFcnJvcjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwYXJzZUVycm9yKHN0ciwgaGFzaCkge1xuICAgICAgaWYgKGhhc2gucmVjb3ZlcmFibGUpIHtcbiAgICAgICAgdGhpcy50cmFjZShzdHIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKHN0cik7XG4gICAgICAgIGVycm9yLmhhc2ggPSBoYXNoO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LCBcInBhcnNlRXJyb3JcIiksXG4gICAgcGFyc2U6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcGFyc2UoaW5wdXQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcywgc3RhY2sgPSBbMF0sIHRzdGFjayA9IFtdLCB2c3RhY2sgPSBbbnVsbF0sIGxzdGFjayA9IFtdLCB0YWJsZSA9IHRoaXMudGFibGUsIHl5dGV4dCA9IFwiXCIsIHl5bGluZW5vID0gMCwgeXlsZW5nID0gMCwgcmVjb3ZlcmluZyA9IDAsIFRFUlJPUiA9IDIsIEVPRiA9IDE7XG4gICAgICB2YXIgYXJncyA9IGxzdGFjay5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICB2YXIgbGV4ZXIyID0gT2JqZWN0LmNyZWF0ZSh0aGlzLmxleGVyKTtcbiAgICAgIHZhciBzaGFyZWRTdGF0ZSA9IHsgeXk6IHt9IH07XG4gICAgICBmb3IgKHZhciBrIGluIHRoaXMueXkpIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnl5LCBrKSkge1xuICAgICAgICAgIHNoYXJlZFN0YXRlLnl5W2tdID0gdGhpcy55eVtrXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGV4ZXIyLnNldElucHV0KGlucHV0LCBzaGFyZWRTdGF0ZS55eSk7XG4gICAgICBzaGFyZWRTdGF0ZS55eS5sZXhlciA9IGxleGVyMjtcbiAgICAgIHNoYXJlZFN0YXRlLnl5LnBhcnNlciA9IHRoaXM7XG4gICAgICBpZiAodHlwZW9mIGxleGVyMi55eWxsb2MgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBsZXhlcjIueXlsbG9jID0ge307XG4gICAgICB9XG4gICAgICB2YXIgeXlsb2MgPSBsZXhlcjIueXlsbG9jO1xuICAgICAgbHN0YWNrLnB1c2goeXlsb2MpO1xuICAgICAgdmFyIHJhbmdlcyA9IGxleGVyMi5vcHRpb25zICYmIGxleGVyMi5vcHRpb25zLnJhbmdlcztcbiAgICAgIGlmICh0eXBlb2Ygc2hhcmVkU3RhdGUueXkucGFyc2VFcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRoaXMucGFyc2VFcnJvciA9IHNoYXJlZFN0YXRlLnl5LnBhcnNlRXJyb3I7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBhcnNlRXJyb3IgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykucGFyc2VFcnJvcjtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHBvcFN0YWNrKG4pIHtcbiAgICAgICAgc3RhY2subGVuZ3RoID0gc3RhY2subGVuZ3RoIC0gMiAqIG47XG4gICAgICAgIHZzdGFjay5sZW5ndGggPSB2c3RhY2subGVuZ3RoIC0gbjtcbiAgICAgICAgbHN0YWNrLmxlbmd0aCA9IGxzdGFjay5sZW5ndGggLSBuO1xuICAgICAgfVxuICAgICAgX19uYW1lKHBvcFN0YWNrLCBcInBvcFN0YWNrXCIpO1xuICAgICAgZnVuY3Rpb24gbGV4KCkge1xuICAgICAgICB2YXIgdG9rZW47XG4gICAgICAgIHRva2VuID0gdHN0YWNrLnBvcCgpIHx8IGxleGVyMi5sZXgoKSB8fCBFT0Y7XG4gICAgICAgIGlmICh0eXBlb2YgdG9rZW4gIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICBpZiAodG9rZW4gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgdHN0YWNrID0gdG9rZW47XG4gICAgICAgICAgICB0b2tlbiA9IHRzdGFjay5wb3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdG9rZW4gPSBzZWxmLnN5bWJvbHNfW3Rva2VuXSB8fCB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICB9XG4gICAgICBfX25hbWUobGV4LCBcImxleFwiKTtcbiAgICAgIHZhciBzeW1ib2wsIHByZUVycm9yU3ltYm9sLCBzdGF0ZSwgYWN0aW9uLCBhLCByLCB5eXZhbCA9IHt9LCBwLCBsZW4sIG5ld1N0YXRlLCBleHBlY3RlZDtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHN0YXRlID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRBY3Rpb25zW3N0YXRlXSkge1xuICAgICAgICAgIGFjdGlvbiA9IHRoaXMuZGVmYXVsdEFjdGlvbnNbc3RhdGVdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChzeW1ib2wgPT09IG51bGwgfHwgdHlwZW9mIHN5bWJvbCA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBzeW1ib2wgPSBsZXgoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aW9uID0gdGFibGVbc3RhdGVdICYmIHRhYmxlW3N0YXRlXVtzeW1ib2xdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgYWN0aW9uID09PSBcInVuZGVmaW5lZFwiIHx8ICFhY3Rpb24ubGVuZ3RoIHx8ICFhY3Rpb25bMF0pIHtcbiAgICAgICAgICB2YXIgZXJyU3RyID0gXCJcIjtcbiAgICAgICAgICBleHBlY3RlZCA9IFtdO1xuICAgICAgICAgIGZvciAocCBpbiB0YWJsZVtzdGF0ZV0pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRlcm1pbmFsc19bcF0gJiYgcCA+IFRFUlJPUikge1xuICAgICAgICAgICAgICBleHBlY3RlZC5wdXNoKFwiJ1wiICsgdGhpcy50ZXJtaW5hbHNfW3BdICsgXCInXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobGV4ZXIyLnNob3dQb3NpdGlvbikge1xuICAgICAgICAgICAgZXJyU3RyID0gXCJQYXJzZSBlcnJvciBvbiBsaW5lIFwiICsgKHl5bGluZW5vICsgMSkgKyBcIjpcXG5cIiArIGxleGVyMi5zaG93UG9zaXRpb24oKSArIFwiXFxuRXhwZWN0aW5nIFwiICsgZXhwZWN0ZWQuam9pbihcIiwgXCIpICsgXCIsIGdvdCAnXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlcnJTdHIgPSBcIlBhcnNlIGVycm9yIG9uIGxpbmUgXCIgKyAoeXlsaW5lbm8gKyAxKSArIFwiOiBVbmV4cGVjdGVkIFwiICsgKHN5bWJvbCA9PSBFT0YgPyBcImVuZCBvZiBpbnB1dFwiIDogXCInXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wYXJzZUVycm9yKGVyclN0ciwge1xuICAgICAgICAgICAgdGV4dDogbGV4ZXIyLm1hdGNoLFxuICAgICAgICAgICAgdG9rZW46IHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCxcbiAgICAgICAgICAgIGxpbmU6IGxleGVyMi55eWxpbmVubyxcbiAgICAgICAgICAgIGxvYzogeXlsb2MsXG4gICAgICAgICAgICBleHBlY3RlZFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhY3Rpb25bMF0gaW5zdGFuY2VvZiBBcnJheSAmJiBhY3Rpb24ubGVuZ3RoID4gMSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcnNlIEVycm9yOiBtdWx0aXBsZSBhY3Rpb25zIHBvc3NpYmxlIGF0IHN0YXRlOiBcIiArIHN0YXRlICsgXCIsIHRva2VuOiBcIiArIHN5bWJvbCk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChhY3Rpb25bMF0pIHtcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBzdGFjay5wdXNoKHN5bWJvbCk7XG4gICAgICAgICAgICB2c3RhY2sucHVzaChsZXhlcjIueXl0ZXh0KTtcbiAgICAgICAgICAgIGxzdGFjay5wdXNoKGxleGVyMi55eWxsb2MpO1xuICAgICAgICAgICAgc3RhY2sucHVzaChhY3Rpb25bMV0pO1xuICAgICAgICAgICAgc3ltYm9sID0gbnVsbDtcbiAgICAgICAgICAgIGlmICghcHJlRXJyb3JTeW1ib2wpIHtcbiAgICAgICAgICAgICAgeXlsZW5nID0gbGV4ZXIyLnl5bGVuZztcbiAgICAgICAgICAgICAgeXl0ZXh0ID0gbGV4ZXIyLnl5dGV4dDtcbiAgICAgICAgICAgICAgeXlsaW5lbm8gPSBsZXhlcjIueXlsaW5lbm87XG4gICAgICAgICAgICAgIHl5bG9jID0gbGV4ZXIyLnl5bGxvYztcbiAgICAgICAgICAgICAgaWYgKHJlY292ZXJpbmcgPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVjb3ZlcmluZy0tO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzeW1ib2wgPSBwcmVFcnJvclN5bWJvbDtcbiAgICAgICAgICAgICAgcHJlRXJyb3JTeW1ib2wgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgbGVuID0gdGhpcy5wcm9kdWN0aW9uc19bYWN0aW9uWzFdXVsxXTtcbiAgICAgICAgICAgIHl5dmFsLiQgPSB2c3RhY2tbdnN0YWNrLmxlbmd0aCAtIGxlbl07XG4gICAgICAgICAgICB5eXZhbC5fJCA9IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5maXJzdF9saW5lLFxuICAgICAgICAgICAgICBsYXN0X2xpbmU6IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gMV0ubGFzdF9saW5lLFxuICAgICAgICAgICAgICBmaXJzdF9jb2x1bW46IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0uZmlyc3RfY29sdW1uLFxuICAgICAgICAgICAgICBsYXN0X2NvbHVtbjogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAxXS5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChyYW5nZXMpIHtcbiAgICAgICAgICAgICAgeXl2YWwuXyQucmFuZ2UgPSBbXG4gICAgICAgICAgICAgICAgbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5yYW5nZVswXSxcbiAgICAgICAgICAgICAgICBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIDFdLnJhbmdlWzFdXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByID0gdGhpcy5wZXJmb3JtQWN0aW9uLmFwcGx5KHl5dmFsLCBbXG4gICAgICAgICAgICAgIHl5dGV4dCxcbiAgICAgICAgICAgICAgeXlsZW5nLFxuICAgICAgICAgICAgICB5eWxpbmVubyxcbiAgICAgICAgICAgICAgc2hhcmVkU3RhdGUueXksXG4gICAgICAgICAgICAgIGFjdGlvblsxXSxcbiAgICAgICAgICAgICAgdnN0YWNrLFxuICAgICAgICAgICAgICBsc3RhY2tcbiAgICAgICAgICAgIF0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsZW4pIHtcbiAgICAgICAgICAgICAgc3RhY2sgPSBzdGFjay5zbGljZSgwLCAtMSAqIGxlbiAqIDIpO1xuICAgICAgICAgICAgICB2c3RhY2sgPSB2c3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgICBsc3RhY2sgPSBsc3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhY2sucHVzaCh0aGlzLnByb2R1Y3Rpb25zX1thY3Rpb25bMV1dWzBdKTtcbiAgICAgICAgICAgIHZzdGFjay5wdXNoKHl5dmFsLiQpO1xuICAgICAgICAgICAgbHN0YWNrLnB1c2goeXl2YWwuXyQpO1xuICAgICAgICAgICAgbmV3U3RhdGUgPSB0YWJsZVtzdGFja1tzdGFjay5sZW5ndGggLSAyXV1bc3RhY2tbc3RhY2subGVuZ3RoIC0gMV1dO1xuICAgICAgICAgICAgc3RhY2sucHVzaChuZXdTdGF0ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSwgXCJwYXJzZVwiKVxuICB9O1xuICB2YXIgbGV4ZXIgPSAvKiBAX19QVVJFX18gKi8gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZXhlcjIgPSB7XG4gICAgICBFT0Y6IDEsXG4gICAgICBwYXJzZUVycm9yOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBhcnNlRXJyb3Ioc3RyLCBoYXNoKSB7XG4gICAgICAgIGlmICh0aGlzLnl5LnBhcnNlcikge1xuICAgICAgICAgIHRoaXMueXkucGFyc2VyLnBhcnNlRXJyb3Ioc3RyLCBoYXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3RyKTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwYXJzZUVycm9yXCIpLFxuICAgICAgLy8gcmVzZXRzIHRoZSBsZXhlciwgc2V0cyBuZXcgaW5wdXRcbiAgICAgIHNldElucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGlucHV0LCB5eSkge1xuICAgICAgICB0aGlzLnl5ID0geXkgfHwgdGhpcy55eSB8fCB7fTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBpbnB1dDtcbiAgICAgICAgdGhpcy5fbW9yZSA9IHRoaXMuX2JhY2t0cmFjayA9IHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnl5bGluZW5vID0gdGhpcy55eWxlbmcgPSAwO1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2ggPSBcIlwiO1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrID0gW1wiSU5JVElBTFwiXTtcbiAgICAgICAgdGhpcy55eWxsb2MgPSB7XG4gICAgICAgICAgZmlyc3RfbGluZTogMSxcbiAgICAgICAgICBmaXJzdF9jb2x1bW46IDAsXG4gICAgICAgICAgbGFzdF9saW5lOiAxLFxuICAgICAgICAgIGxhc3RfY29sdW1uOiAwXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2UgPSBbMCwgMF07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vZmZzZXQgPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwic2V0SW5wdXRcIiksXG4gICAgICAvLyBjb25zdW1lcyBhbmQgcmV0dXJucyBvbmUgY2hhciBmcm9tIHRoZSBpbnB1dFxuICAgICAgaW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjaCA9IHRoaXMuX2lucHV0WzBdO1xuICAgICAgICB0aGlzLnl5dGV4dCArPSBjaDtcbiAgICAgICAgdGhpcy55eWxlbmcrKztcbiAgICAgICAgdGhpcy5vZmZzZXQrKztcbiAgICAgICAgdGhpcy5tYXRjaCArPSBjaDtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IGNoO1xuICAgICAgICB2YXIgbGluZXMgPSBjaC5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8rKztcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2xpbmUrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtbisrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2VbMV0rKztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pbnB1dCA9IHRoaXMuX2lucHV0LnNsaWNlKDEpO1xuICAgICAgICByZXR1cm4gY2g7XG4gICAgICB9LCBcImlucHV0XCIpLFxuICAgICAgLy8gdW5zaGlmdHMgb25lIGNoYXIgKG9yIGEgc3RyaW5nKSBpbnRvIHRoZSBpbnB1dFxuICAgICAgdW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oY2gpIHtcbiAgICAgICAgdmFyIGxlbiA9IGNoLmxlbmd0aDtcbiAgICAgICAgdmFyIGxpbmVzID0gY2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBjaCArIHRoaXMuX2lucHV0O1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMueXl0ZXh0LnN1YnN0cigwLCB0aGlzLnl5dGV4dC5sZW5ndGggLSBsZW4pO1xuICAgICAgICB0aGlzLm9mZnNldCAtPSBsZW47XG4gICAgICAgIHZhciBvbGRMaW5lcyA9IHRoaXMubWF0Y2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5tYXRjaCA9IHRoaXMubWF0Y2guc3Vic3RyKDAsIHRoaXMubWF0Y2gubGVuZ3RoIC0gMSk7XG4gICAgICAgIHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2hlZC5zdWJzdHIoMCwgdGhpcy5tYXRjaGVkLmxlbmd0aCAtIDEpO1xuICAgICAgICBpZiAobGluZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gLT0gbGluZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgciA9IHRoaXMueXlsbG9jLnJhbmdlO1xuICAgICAgICB0aGlzLnl5bGxvYyA9IHtcbiAgICAgICAgICBmaXJzdF9saW5lOiB0aGlzLnl5bGxvYy5maXJzdF9saW5lLFxuICAgICAgICAgIGxhc3RfbGluZTogdGhpcy55eWxpbmVubyArIDEsXG4gICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gKGxpbmVzLmxlbmd0aCA9PT0gb2xkTGluZXMubGVuZ3RoID8gdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uIDogMCkgKyBvbGRMaW5lc1tvbGRMaW5lcy5sZW5ndGggLSBsaW5lcy5sZW5ndGhdLmxlbmd0aCAtIGxpbmVzWzBdLmxlbmd0aCA6IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbiAtIGxlblxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlID0gW3JbMF0sIHJbMF0gKyB0aGlzLnl5bGVuZyAtIGxlbl07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy55eWxlbmcgPSB0aGlzLnl5dGV4dC5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJ1bnB1dFwiKSxcbiAgICAgIC8vIFdoZW4gY2FsbGVkIGZyb20gYWN0aW9uLCBjYWNoZXMgbWF0Y2hlZCB0ZXh0IGFuZCBhcHBlbmRzIGl0IG9uIG5leHQgYWN0aW9uXG4gICAgICBtb3JlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9tb3JlID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcIm1vcmVcIiksXG4gICAgICAvLyBXaGVuIGNhbGxlZCBmcm9tIGFjdGlvbiwgc2lnbmFscyB0aGUgbGV4ZXIgdGhhdCB0aGlzIHJ1bGUgZmFpbHMgdG8gbWF0Y2ggdGhlIGlucHV0LCBzbyB0aGUgbmV4dCBtYXRjaGluZyBydWxlIChyZWdleCkgc2hvdWxkIGJlIHRlc3RlZCBpbnN0ZWFkLlxuICAgICAgcmVqZWN0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2t0cmFja19sZXhlcikge1xuICAgICAgICAgIHRoaXMuX2JhY2t0cmFjayA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gWW91IGNhbiBvbmx5IGludm9rZSByZWplY3QoKSBpbiB0aGUgbGV4ZXIgd2hlbiB0aGUgbGV4ZXIgaXMgb2YgdGhlIGJhY2t0cmFja2luZyBwZXJzdWFzaW9uIChvcHRpb25zLmJhY2t0cmFja19sZXhlciA9IHRydWUpLlxcblwiICsgdGhpcy5zaG93UG9zaXRpb24oKSwge1xuICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgIHRva2VuOiBudWxsLFxuICAgICAgICAgICAgbGluZTogdGhpcy55eWxpbmVub1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJyZWplY3RcIiksXG4gICAgICAvLyByZXRhaW4gZmlyc3QgbiBjaGFyYWN0ZXJzIG9mIHRoZSBtYXRjaFxuICAgICAgbGVzczogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihuKSB7XG4gICAgICAgIHRoaXMudW5wdXQodGhpcy5tYXRjaC5zbGljZShuKSk7XG4gICAgICB9LCBcImxlc3NcIiksXG4gICAgICAvLyBkaXNwbGF5cyBhbHJlYWR5IG1hdGNoZWQgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICBwYXN0SW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwYXN0ID0gdGhpcy5tYXRjaGVkLnN1YnN0cigwLCB0aGlzLm1hdGNoZWQubGVuZ3RoIC0gdGhpcy5tYXRjaC5sZW5ndGgpO1xuICAgICAgICByZXR1cm4gKHBhc3QubGVuZ3RoID4gMjAgPyBcIi4uLlwiIDogXCJcIikgKyBwYXN0LnN1YnN0cigtMjApLnJlcGxhY2UoL1xcbi9nLCBcIlwiKTtcbiAgICAgIH0sIFwicGFzdElucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdXBjb21pbmcgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICB1cGNvbWluZ0lucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV4dCA9IHRoaXMubWF0Y2g7XG4gICAgICAgIGlmIChuZXh0Lmxlbmd0aCA8IDIwKSB7XG4gICAgICAgICAgbmV4dCArPSB0aGlzLl9pbnB1dC5zdWJzdHIoMCwgMjAgLSBuZXh0Lmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChuZXh0LnN1YnN0cigwLCAyMCkgKyAobmV4dC5sZW5ndGggPiAyMCA/IFwiLi4uXCIgOiBcIlwiKSkucmVwbGFjZSgvXFxuL2csIFwiXCIpO1xuICAgICAgfSwgXCJ1cGNvbWluZ0lucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdGhlIGNoYXJhY3RlciBwb3NpdGlvbiB3aGVyZSB0aGUgbGV4aW5nIGVycm9yIG9jY3VycmVkLCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgc2hvd1Bvc2l0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJlID0gdGhpcy5wYXN0SW5wdXQoKTtcbiAgICAgICAgdmFyIGMgPSBuZXcgQXJyYXkocHJlLmxlbmd0aCArIDEpLmpvaW4oXCItXCIpO1xuICAgICAgICByZXR1cm4gcHJlICsgdGhpcy51cGNvbWluZ0lucHV0KCkgKyBcIlxcblwiICsgYyArIFwiXlwiO1xuICAgICAgfSwgXCJzaG93UG9zaXRpb25cIiksXG4gICAgICAvLyB0ZXN0IHRoZSBsZXhlZCB0b2tlbjogcmV0dXJuIEZBTFNFIHdoZW4gbm90IGEgbWF0Y2gsIG90aGVyd2lzZSByZXR1cm4gdG9rZW5cbiAgICAgIHRlc3RfbWF0Y2g6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obWF0Y2gsIGluZGV4ZWRfcnVsZSkge1xuICAgICAgICB2YXIgdG9rZW4sIGxpbmVzLCBiYWNrdXA7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFja3RyYWNrX2xleGVyKSB7XG4gICAgICAgICAgYmFja3VwID0ge1xuICAgICAgICAgICAgeXlsaW5lbm86IHRoaXMueXlsaW5lbm8sXG4gICAgICAgICAgICB5eWxsb2M6IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogdGhpcy55eWxsb2MuZmlyc3RfbGluZSxcbiAgICAgICAgICAgICAgbGFzdF9saW5lOiB0aGlzLmxhc3RfbGluZSxcbiAgICAgICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgICAgIGxhc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHl5dGV4dDogdGhpcy55eXRleHQsXG4gICAgICAgICAgICBtYXRjaDogdGhpcy5tYXRjaCxcbiAgICAgICAgICAgIG1hdGNoZXM6IHRoaXMubWF0Y2hlcyxcbiAgICAgICAgICAgIG1hdGNoZWQ6IHRoaXMubWF0Y2hlZCxcbiAgICAgICAgICAgIHl5bGVuZzogdGhpcy55eWxlbmcsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgX21vcmU6IHRoaXMuX21vcmUsXG4gICAgICAgICAgICBfaW5wdXQ6IHRoaXMuX2lucHV0LFxuICAgICAgICAgICAgeXk6IHRoaXMueXksXG4gICAgICAgICAgICBjb25kaXRpb25TdGFjazogdGhpcy5jb25kaXRpb25TdGFjay5zbGljZSgwKSxcbiAgICAgICAgICAgIGRvbmU6IHRoaXMuZG9uZVxuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICAgIGJhY2t1cC55eWxsb2MucmFuZ2UgPSB0aGlzLnl5bGxvYy5yYW5nZS5zbGljZSgwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMgPSBtYXRjaFswXS5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gKz0gbGluZXMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueXlsbG9jID0ge1xuICAgICAgICAgIGZpcnN0X2xpbmU6IHRoaXMueXlsbG9jLmxhc3RfbGluZSxcbiAgICAgICAgICBsYXN0X2xpbmU6IHRoaXMueXlsaW5lbm8gKyAxLFxuICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubGVuZ3RoIC0gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubWF0Y2goL1xccj9cXG4/LylbMF0ubGVuZ3RoIDogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4gKyBtYXRjaFswXS5sZW5ndGhcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy55eXRleHQgKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2ggKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2hlcyA9IG1hdGNoO1xuICAgICAgICB0aGlzLnl5bGVuZyA9IHRoaXMueXl0ZXh0Lmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZSA9IFt0aGlzLm9mZnNldCwgdGhpcy5vZmZzZXQgKz0gdGhpcy55eWxlbmddO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX21vcmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fYmFja3RyYWNrID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2lucHV0ID0gdGhpcy5faW5wdXQuc2xpY2UobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IG1hdGNoWzBdO1xuICAgICAgICB0b2tlbiA9IHRoaXMucGVyZm9ybUFjdGlvbi5jYWxsKHRoaXMsIHRoaXMueXksIHRoaXMsIGluZGV4ZWRfcnVsZSwgdGhpcy5jb25kaXRpb25TdGFja1t0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgaWYgKHRoaXMuZG9uZSAmJiB0aGlzLl9pbnB1dCkge1xuICAgICAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9iYWNrdHJhY2spIHtcbiAgICAgICAgICBmb3IgKHZhciBrIGluIGJhY2t1cCkge1xuICAgICAgICAgICAgdGhpc1trXSA9IGJhY2t1cFtrXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sIFwidGVzdF9tYXRjaFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIGluIGlucHV0XG4gICAgICBuZXh0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuRU9GO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5faW5wdXQpIHtcbiAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0b2tlbiwgbWF0Y2gsIHRlbXBNYXRjaCwgaW5kZXg7XG4gICAgICAgIGlmICghdGhpcy5fbW9yZSkge1xuICAgICAgICAgIHRoaXMueXl0ZXh0ID0gXCJcIjtcbiAgICAgICAgICB0aGlzLm1hdGNoID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcnVsZXMgPSB0aGlzLl9jdXJyZW50UnVsZXMoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRlbXBNYXRjaCA9IHRoaXMuX2lucHV0Lm1hdGNoKHRoaXMucnVsZXNbcnVsZXNbaV1dKTtcbiAgICAgICAgICBpZiAodGVtcE1hdGNoICYmICghbWF0Y2ggfHwgdGVtcE1hdGNoWzBdLmxlbmd0aCA+IG1hdGNoWzBdLmxlbmd0aCkpIHtcbiAgICAgICAgICAgIG1hdGNoID0gdGVtcE1hdGNoO1xuICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIpIHtcbiAgICAgICAgICAgICAgdG9rZW4gPSB0aGlzLnRlc3RfbWF0Y2godGVtcE1hdGNoLCBydWxlc1tpXSk7XG4gICAgICAgICAgICAgIGlmICh0b2tlbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmFja3RyYWNrKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMub3B0aW9ucy5mbGV4KSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICB0b2tlbiA9IHRoaXMudGVzdF9tYXRjaChtYXRjaCwgcnVsZXNbaW5kZXhdKTtcbiAgICAgICAgICBpZiAodG9rZW4gIT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5faW5wdXQgPT09IFwiXCIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5FT0Y7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gVW5yZWNvZ25pemVkIHRleHQuXFxuXCIgKyB0aGlzLnNob3dQb3NpdGlvbigpLCB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgdG9rZW46IG51bGwsXG4gICAgICAgICAgICBsaW5lOiB0aGlzLnl5bGluZW5vXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibmV4dFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIHRoYXQgaGFzIGEgdG9rZW5cbiAgICAgIGxleDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBsZXgoKSB7XG4gICAgICAgIHZhciByID0gdGhpcy5uZXh0KCk7XG4gICAgICAgIGlmIChyKSB7XG4gICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubGV4KCk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibGV4XCIpLFxuICAgICAgLy8gYWN0aXZhdGVzIGEgbmV3IGxleGVyIGNvbmRpdGlvbiBzdGF0ZSAocHVzaGVzIHRoZSBuZXcgbGV4ZXIgY29uZGl0aW9uIHN0YXRlIG9udG8gdGhlIGNvbmRpdGlvbiBzdGFjaylcbiAgICAgIGJlZ2luOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGJlZ2luKGNvbmRpdGlvbikge1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrLnB1c2goY29uZGl0aW9uKTtcbiAgICAgIH0sIFwiYmVnaW5cIiksXG4gICAgICAvLyBwb3AgdGhlIHByZXZpb3VzbHkgYWN0aXZlIGxleGVyIGNvbmRpdGlvbiBzdGF0ZSBvZmYgdGhlIGNvbmRpdGlvbiBzdGFja1xuICAgICAgcG9wU3RhdGU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcG9wU3RhdGUoKSB7XG4gICAgICAgIHZhciBuID0gdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxO1xuICAgICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFjay5wb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1swXTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwb3BTdGF0ZVwiKSxcbiAgICAgIC8vIHByb2R1Y2UgdGhlIGxleGVyIHJ1bGUgc2V0IHdoaWNoIGlzIGFjdGl2ZSBmb3IgdGhlIGN1cnJlbnRseSBhY3RpdmUgbGV4ZXIgY29uZGl0aW9uIHN0YXRlXG4gICAgICBfY3VycmVudFJ1bGVzOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIF9jdXJyZW50UnVsZXMoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAmJiB0aGlzLmNvbmRpdGlvblN0YWNrW3RoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25zW3RoaXMuY29uZGl0aW9uU3RhY2tbdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxXV0ucnVsZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uc1tcIklOSVRJQUxcIl0ucnVsZXM7XG4gICAgICAgIH1cbiAgICAgIH0sIFwiX2N1cnJlbnRSdWxlc1wiKSxcbiAgICAgIC8vIHJldHVybiB0aGUgY3VycmVudGx5IGFjdGl2ZSBsZXhlciBjb25kaXRpb24gc3RhdGU7IHdoZW4gYW4gaW5kZXggYXJndW1lbnQgaXMgcHJvdmlkZWQgaXQgcHJvZHVjZXMgdGhlIE4tdGggcHJldmlvdXMgY29uZGl0aW9uIHN0YXRlLCBpZiBhdmFpbGFibGVcbiAgICAgIHRvcFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHRvcFN0YXRlKG4pIHtcbiAgICAgICAgbiA9IHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMSAtIE1hdGguYWJzKG4gfHwgMCk7XG4gICAgICAgIGlmIChuID49IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1tuXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gXCJJTklUSUFMXCI7XG4gICAgICAgIH1cbiAgICAgIH0sIFwidG9wU3RhdGVcIiksXG4gICAgICAvLyBhbGlhcyBmb3IgYmVnaW4oY29uZGl0aW9uKVxuICAgICAgcHVzaFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHB1c2hTdGF0ZShjb25kaXRpb24pIHtcbiAgICAgICAgdGhpcy5iZWdpbihjb25kaXRpb24pO1xuICAgICAgfSwgXCJwdXNoU3RhdGVcIiksXG4gICAgICAvLyByZXR1cm4gdGhlIG51bWJlciBvZiBzdGF0ZXMgY3VycmVudGx5IG9uIHRoZSBzdGFja1xuICAgICAgc3RhdGVTdGFja1NpemU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gc3RhdGVTdGFja1NpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aDtcbiAgICAgIH0sIFwic3RhdGVTdGFja1NpemVcIiksXG4gICAgICBvcHRpb25zOiB7fSxcbiAgICAgIHBlcmZvcm1BY3Rpb246IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gYW5vbnltb3VzKHl5LCB5eV8sICRhdm9pZGluZ19uYW1lX2NvbGxpc2lvbnMsIFlZX1NUQVJUKSB7XG4gICAgICAgIHZhciBZWVNUQVRFID0gWVlfU1RBUlQ7XG4gICAgICAgIHN3aXRjaCAoJGF2b2lkaW5nX25hbWVfY29sbGlzaW9ucykge1xuICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIHJldHVybiA2MjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHJldHVybiA2MztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHJldHVybiA2NDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiA2NTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJhY2NfdGl0bGVcIik7XG4gICAgICAgICAgICByZXR1cm4gMzM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gXCJhY2NfdGl0bGVfdmFsdWVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJhY2NfZGVzY3JcIik7XG4gICAgICAgICAgICByZXR1cm4gMzU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gXCJhY2NfZGVzY3JfdmFsdWVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiYWNjX2Rlc2NyX211bHRpbGluZVwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTE6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgcmV0dXJuIFwiYWNjX2Rlc2NyX211bHRpbGluZV92YWx1ZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICAgIHJldHVybiA4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxNDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgICByZXR1cm4gNztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICByZXR1cm4gNztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgICByZXR1cm4gXCJFREdFX1NUQVRFXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE4OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImNhbGxiYWNrX25hbWVcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE5OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyMDpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJjYWxsYmFja19hcmdzXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyMTpcbiAgICAgICAgICAgIHJldHVybiA3OTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjI6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDIzOlxuICAgICAgICAgICAgcmV0dXJuIDgwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyNDpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjU6XG4gICAgICAgICAgICByZXR1cm4gXCJTVFJcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjY6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwic3RyaW5nXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyNzpcbiAgICAgICAgICAgIHJldHVybiA4MjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjg6XG4gICAgICAgICAgICByZXR1cm4gNTc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI5OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcIm5hbWVzcGFjZVwiKTtcbiAgICAgICAgICAgIHJldHVybiA0MjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzA6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzE6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDMyOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcIm5hbWVzcGFjZS1ib2R5XCIpO1xuICAgICAgICAgICAgcmV0dXJuIDM5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzMzpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHRoaXMubGVzcygwKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzQ6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gNDE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM1OlxuICAgICAgICAgICAgcmV0dXJuIFwiRU9GX0lOX1NUUlVDVFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNjpcbiAgICAgICAgICAgIHJldHVybiA4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzg6XG4gICAgICAgICAgICByZXR1cm4gXCJFREdFX1NUQVRFXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM5OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImNsYXNzXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDQ4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0MDpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiA4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0MTpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDI6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gNDE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQzOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImNsYXNzLWJvZHlcIik7XG4gICAgICAgICAgICByZXR1cm4gMzk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ0OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIDQxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0NTpcbiAgICAgICAgICAgIHJldHVybiBcIkVPRl9JTl9TVFJVQ1RcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDY6XG4gICAgICAgICAgICByZXR1cm4gXCJFREdFX1NUQVRFXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ3OlxuICAgICAgICAgICAgcmV0dXJuIFwiT1BFTl9JTl9TVFJVQ1RcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDg6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ5OlxuICAgICAgICAgICAgcmV0dXJuIFwiTUVNQkVSXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDUwOlxuICAgICAgICAgICAgcmV0dXJuIDgzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1MTpcbiAgICAgICAgICAgIHJldHVybiA3NTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTI6XG4gICAgICAgICAgICByZXR1cm4gNzY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDUzOlxuICAgICAgICAgICAgcmV0dXJuIDc4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1NDpcbiAgICAgICAgICAgIHJldHVybiA1NDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTU6XG4gICAgICAgICAgICByZXR1cm4gNTY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU2OlxuICAgICAgICAgICAgcmV0dXJuIDQ2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1NzpcbiAgICAgICAgICAgIHJldHVybiA0NztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTg6XG4gICAgICAgICAgICByZXR1cm4gODE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU5OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2MDpcbiAgICAgICAgICAgIHJldHVybiBcIkdFTkVSSUNUWVBFXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDYxOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImdlbmVyaWNcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDYyOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2MzpcbiAgICAgICAgICAgIHJldHVybiBcIkJRVU9URV9TVFJcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjQ6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiYnFzdHJpbmdcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDY1OlxuICAgICAgICAgICAgcmV0dXJuIDc3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2NjpcbiAgICAgICAgICAgIHJldHVybiA3NztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjc6XG4gICAgICAgICAgICByZXR1cm4gNzc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDY4OlxuICAgICAgICAgICAgcmV0dXJuIDc3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2OTpcbiAgICAgICAgICAgIHJldHVybiA2OTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzA6XG4gICAgICAgICAgICByZXR1cm4gNjk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDcxOlxuICAgICAgICAgICAgcmV0dXJuIDcxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3MjpcbiAgICAgICAgICAgIHJldHVybiA3MTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzM6XG4gICAgICAgICAgICByZXR1cm4gNzA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDc0OlxuICAgICAgICAgICAgcmV0dXJuIDY4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3NTpcbiAgICAgICAgICAgIHJldHVybiA3MjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzY6XG4gICAgICAgICAgICByZXR1cm4gNzM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDc3OlxuICAgICAgICAgICAgcmV0dXJuIDc0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3ODpcbiAgICAgICAgICAgIHJldHVybiAyMjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzk6XG4gICAgICAgICAgICByZXR1cm4gNDQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDgwOlxuICAgICAgICAgICAgcmV0dXJuIDEwMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgODE6XG4gICAgICAgICAgICByZXR1cm4gMTg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDgyOlxuICAgICAgICAgICAgcmV0dXJuIFwiUExVU1wiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4MzpcbiAgICAgICAgICAgIHJldHVybiA4NztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgODQ6XG4gICAgICAgICAgICByZXR1cm4gNjE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDg1OlxuICAgICAgICAgICAgcmV0dXJuIDg5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4NjpcbiAgICAgICAgICAgIHJldHVybiA4OTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgODc6XG4gICAgICAgICAgICByZXR1cm4gOTA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDg4OlxuICAgICAgICAgICAgcmV0dXJuIFwiRVFVQUxTXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDg5OlxuICAgICAgICAgICAgcmV0dXJuIFwiRVFVQUxTXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDkwOlxuICAgICAgICAgICAgcmV0dXJuIDYwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA5MTpcbiAgICAgICAgICAgIHJldHVybiAxMjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTI6XG4gICAgICAgICAgICByZXR1cm4gMTQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDkzOlxuICAgICAgICAgICAgcmV0dXJuIFwiUFVOQ1RVQVRJT05cIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTQ6XG4gICAgICAgICAgICByZXR1cm4gODY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDk1OlxuICAgICAgICAgICAgcmV0dXJuIDEwMjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTY6XG4gICAgICAgICAgICByZXR1cm4gNTA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDk3OlxuICAgICAgICAgICAgcmV0dXJuIDUwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA5ODpcbiAgICAgICAgICAgIHJldHVybiA5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0sIFwiYW5vbnltb3VzXCIpLFxuICAgICAgcnVsZXM6IFsvXig/Oi4qZGlyZWN0aW9uXFxzK1RCW15cXG5dKikvLCAvXig/Oi4qZGlyZWN0aW9uXFxzK0JUW15cXG5dKikvLCAvXig/Oi4qZGlyZWN0aW9uXFxzK1JMW15cXG5dKikvLCAvXig/Oi4qZGlyZWN0aW9uXFxzK0xSW15cXG5dKikvLCAvXig/OiUlKD8hXFx7KSpbXlxcbl0qKFxccj9cXG4/KSspLywgL14oPzolJVteXFxuXSooXFxyP1xcbikqKS8sIC9eKD86YWNjVGl0bGVcXHMqOlxccyopLywgL14oPzooPyFcXG58fCkqW15cXG5dKikvLCAvXig/OmFjY0Rlc2NyXFxzKjpcXHMqKS8sIC9eKD86KD8hXFxufHwpKlteXFxuXSopLywgL14oPzphY2NEZXNjclxccypcXHtcXHMqKS8sIC9eKD86W1xcfV0pLywgL14oPzpbXlxcfV0qKS8sIC9eKD86XFxzKihcXHI/XFxuKSspLywgL14oPzpcXHMrKS8sIC9eKD86Y2xhc3NEaWFncmFtLXYyXFxiKS8sIC9eKD86Y2xhc3NEaWFncmFtXFxiKS8sIC9eKD86XFxbXFwqXFxdKS8sIC9eKD86Y2FsbFtcXHNdKykvLCAvXig/OlxcKFtcXHNdKlxcKSkvLCAvXig/OlxcKCkvLCAvXig/OlteKF0qKS8sIC9eKD86XFwpKS8sIC9eKD86W14pXSopLywgL14oPzpbXCJdKS8sIC9eKD86W15cIl0qKS8sIC9eKD86W1wiXSkvLCAvXig/OnN0eWxlXFxiKS8sIC9eKD86Y2xhc3NEZWZcXGIpLywgL14oPzpuYW1lc3BhY2VcXGIpLywgL14oPzpcXHMqKFxccj9cXG4pKykvLCAvXig/OlxccyspLywgL14oPzpbe10pLywgL14oPzpbfV0pLywgL14oPzpbfV0pLywgL14oPzokKS8sIC9eKD86XFxzKihcXHI/XFxuKSspLywgL14oPzpcXHMrKS8sIC9eKD86XFxbXFwqXFxdKS8sIC9eKD86Y2xhc3NcXGIpLywgL14oPzpcXHMqKFxccj9cXG4pKykvLCAvXig/OlxccyspLywgL14oPzpbfV0pLywgL14oPzpbe10pLywgL14oPzpbfV0pLywgL14oPzokKS8sIC9eKD86XFxbXFwqXFxdKS8sIC9eKD86W3tdKS8sIC9eKD86W1xcbl0pLywgL14oPzpbXnt9XFxuXSopLywgL14oPzpjc3NDbGFzc1xcYikvLCAvXig/OmNhbGxiYWNrXFxiKS8sIC9eKD86bGlua1xcYikvLCAvXig/OmNsaWNrXFxiKS8sIC9eKD86bm90ZSBmb3JcXGIpLywgL14oPzpub3RlXFxiKS8sIC9eKD86PDwpLywgL14oPzo+PikvLCAvXig/OmhyZWZcXGIpLywgL14oPzpbfl0pLywgL14oPzpbXn5dKikvLCAvXig/On4pLywgL14oPzpbYF0pLywgL14oPzpbXmBdKykvLCAvXig/OltgXSkvLCAvXig/Ol9zZWxmXFxiKS8sIC9eKD86X2JsYW5rXFxiKS8sIC9eKD86X3BhcmVudFxcYikvLCAvXig/Ol90b3BcXGIpLywgL14oPzpcXHMqPFxcfCkvLCAvXig/OlxccypcXHw+KS8sIC9eKD86XFxzKj4pLywgL14oPzpcXHMqPCkvLCAvXig/OlxccypcXCopLywgL14oPzpcXHMqb1xcYikvLCAvXig/OlxccypcXChcXCkpLywgL14oPzotLSkvLCAvXig/OlxcLlxcLikvLCAvXig/Ojp7MX1bXjpcXG47XSspLywgL14oPzo6ezN9KS8sIC9eKD86LSkvLCAvXig/OlxcLikvLCAvXig/OlxcKykvLCAvXig/OjopLywgL14oPzosKS8sIC9eKD86IykvLCAvXig/OiMpLywgL14oPzolKS8sIC9eKD86PSkvLCAvXig/Oj0pLywgL14oPzpcXHcrKS8sIC9eKD86XFxbKS8sIC9eKD86XFxdKS8sIC9eKD86WyFcIiMkJSYnKissLS5gP1xcXFwvXSkvLCAvXig/OlswLTldKykvLCAvXig/OltcXHUwMEFBXFx1MDBCNVxcdTAwQkFcXHUwMEMwLVxcdTAwRDZcXHUwMEQ4LVxcdTAwRjZdfFtcXHUwMEY4LVxcdTAyQzFcXHUwMkM2LVxcdTAyRDFcXHUwMkUwLVxcdTAyRTRcXHUwMkVDXFx1MDJFRVxcdTAzNzAtXFx1MDM3NFxcdTAzNzZcXHUwMzc3XXxbXFx1MDM3QS1cXHUwMzdEXFx1MDM4NlxcdTAzODgtXFx1MDM4QVxcdTAzOENcXHUwMzhFLVxcdTAzQTFcXHUwM0EzLVxcdTAzRjVdfFtcXHUwM0Y3LVxcdTA0ODFcXHUwNDhBLVxcdTA1MjdcXHUwNTMxLVxcdTA1NTZcXHUwNTU5XFx1MDU2MS1cXHUwNTg3XFx1MDVEMC1cXHUwNUVBXXxbXFx1MDVGMC1cXHUwNUYyXFx1MDYyMC1cXHUwNjRBXFx1MDY2RVxcdTA2NkZcXHUwNjcxLVxcdTA2RDNcXHUwNkQ1XFx1MDZFNVxcdTA2RTZcXHUwNkVFXXxbXFx1MDZFRlxcdTA2RkEtXFx1MDZGQ1xcdTA2RkZcXHUwNzEwXFx1MDcxMi1cXHUwNzJGXFx1MDc0RC1cXHUwN0E1XFx1MDdCMVxcdTA3Q0EtXFx1MDdFQV18W1xcdTA3RjRcXHUwN0Y1XFx1MDdGQVxcdTA4MDAtXFx1MDgxNVxcdTA4MUFcXHUwODI0XFx1MDgyOFxcdTA4NDAtXFx1MDg1OFxcdTA4QTBdfFtcXHUwOEEyLVxcdTA4QUNcXHUwOTA0LVxcdTA5MzlcXHUwOTNEXFx1MDk1MFxcdTA5NTgtXFx1MDk2MVxcdTA5NzEtXFx1MDk3N118W1xcdTA5NzktXFx1MDk3RlxcdTA5ODUtXFx1MDk4Q1xcdTA5OEZcXHUwOTkwXFx1MDk5My1cXHUwOUE4XFx1MDlBQS1cXHUwOUIwXFx1MDlCMl18W1xcdTA5QjYtXFx1MDlCOVxcdTA5QkRcXHUwOUNFXFx1MDlEQ1xcdTA5RERcXHUwOURGLVxcdTA5RTFcXHUwOUYwXFx1MDlGMVxcdTBBMDUtXFx1MEEwQV18W1xcdTBBMEZcXHUwQTEwXFx1MEExMy1cXHUwQTI4XFx1MEEyQS1cXHUwQTMwXFx1MEEzMlxcdTBBMzNcXHUwQTM1XFx1MEEzNlxcdTBBMzhcXHUwQTM5XXxbXFx1MEE1OS1cXHUwQTVDXFx1MEE1RVxcdTBBNzItXFx1MEE3NFxcdTBBODUtXFx1MEE4RFxcdTBBOEYtXFx1MEE5MVxcdTBBOTMtXFx1MEFBOF18W1xcdTBBQUEtXFx1MEFCMFxcdTBBQjJcXHUwQUIzXFx1MEFCNS1cXHUwQUI5XFx1MEFCRFxcdTBBRDBcXHUwQUUwXFx1MEFFMVxcdTBCMDUtXFx1MEIwQ118W1xcdTBCMEZcXHUwQjEwXFx1MEIxMy1cXHUwQjI4XFx1MEIyQS1cXHUwQjMwXFx1MEIzMlxcdTBCMzNcXHUwQjM1LVxcdTBCMzlcXHUwQjNEXFx1MEI1Q118W1xcdTBCNURcXHUwQjVGLVxcdTBCNjFcXHUwQjcxXFx1MEI4M1xcdTBCODUtXFx1MEI4QVxcdTBCOEUtXFx1MEI5MFxcdTBCOTItXFx1MEI5NVxcdTBCOTldfFtcXHUwQjlBXFx1MEI5Q1xcdTBCOUVcXHUwQjlGXFx1MEJBM1xcdTBCQTRcXHUwQkE4LVxcdTBCQUFcXHUwQkFFLVxcdTBCQjlcXHUwQkQwXXxbXFx1MEMwNS1cXHUwQzBDXFx1MEMwRS1cXHUwQzEwXFx1MEMxMi1cXHUwQzI4XFx1MEMyQS1cXHUwQzMzXFx1MEMzNS1cXHUwQzM5XFx1MEMzRF18W1xcdTBDNThcXHUwQzU5XFx1MEM2MFxcdTBDNjFcXHUwQzg1LVxcdTBDOENcXHUwQzhFLVxcdTBDOTBcXHUwQzkyLVxcdTBDQThcXHUwQ0FBLVxcdTBDQjNdfFtcXHUwQ0I1LVxcdTBDQjlcXHUwQ0JEXFx1MENERVxcdTBDRTBcXHUwQ0UxXFx1MENGMVxcdTBDRjJcXHUwRDA1LVxcdTBEMENcXHUwRDBFLVxcdTBEMTBdfFtcXHUwRDEyLVxcdTBEM0FcXHUwRDNEXFx1MEQ0RVxcdTBENjBcXHUwRDYxXFx1MEQ3QS1cXHUwRDdGXFx1MEQ4NS1cXHUwRDk2XFx1MEQ5QS1cXHUwREIxXXxbXFx1MERCMy1cXHUwREJCXFx1MERCRFxcdTBEQzAtXFx1MERDNlxcdTBFMDEtXFx1MEUzMFxcdTBFMzJcXHUwRTMzXFx1MEU0MC1cXHUwRTQ2XFx1MEU4MV18W1xcdTBFODJcXHUwRTg0XFx1MEU4N1xcdTBFODhcXHUwRThBXFx1MEU4RFxcdTBFOTQtXFx1MEU5N1xcdTBFOTktXFx1MEU5RlxcdTBFQTEtXFx1MEVBM118W1xcdTBFQTVcXHUwRUE3XFx1MEVBQVxcdTBFQUJcXHUwRUFELVxcdTBFQjBcXHUwRUIyXFx1MEVCM1xcdTBFQkRcXHUwRUMwLVxcdTBFQzRcXHUwRUM2XXxbXFx1MEVEQy1cXHUwRURGXFx1MEYwMFxcdTBGNDAtXFx1MEY0N1xcdTBGNDktXFx1MEY2Q1xcdTBGODgtXFx1MEY4Q1xcdTEwMDAtXFx1MTAyQV18W1xcdTEwM0ZcXHUxMDUwLVxcdTEwNTVcXHUxMDVBLVxcdTEwNURcXHUxMDYxXFx1MTA2NVxcdTEwNjZcXHUxMDZFLVxcdTEwNzBcXHUxMDc1LVxcdTEwODFdfFtcXHUxMDhFXFx1MTBBMC1cXHUxMEM1XFx1MTBDN1xcdTEwQ0RcXHUxMEQwLVxcdTEwRkFcXHUxMEZDLVxcdTEyNDhcXHUxMjRBLVxcdTEyNERdfFtcXHUxMjUwLVxcdTEyNTZcXHUxMjU4XFx1MTI1QS1cXHUxMjVEXFx1MTI2MC1cXHUxMjg4XFx1MTI4QS1cXHUxMjhEXFx1MTI5MC1cXHUxMkIwXXxbXFx1MTJCMi1cXHUxMkI1XFx1MTJCOC1cXHUxMkJFXFx1MTJDMFxcdTEyQzItXFx1MTJDNVxcdTEyQzgtXFx1MTJENlxcdTEyRDgtXFx1MTMxMF18W1xcdTEzMTItXFx1MTMxNVxcdTEzMTgtXFx1MTM1QVxcdTEzODAtXFx1MTM4RlxcdTEzQTAtXFx1MTNGNFxcdTE0MDEtXFx1MTY2Q118W1xcdTE2NkYtXFx1MTY3RlxcdTE2ODEtXFx1MTY5QVxcdTE2QTAtXFx1MTZFQVxcdTE3MDAtXFx1MTcwQ1xcdTE3MEUtXFx1MTcxMV18W1xcdTE3MjAtXFx1MTczMVxcdTE3NDAtXFx1MTc1MVxcdTE3NjAtXFx1MTc2Q1xcdTE3NkUtXFx1MTc3MFxcdTE3ODAtXFx1MTdCM1xcdTE3RDddfFtcXHUxN0RDXFx1MTgyMC1cXHUxODc3XFx1MTg4MC1cXHUxOEE4XFx1MThBQVxcdTE4QjAtXFx1MThGNVxcdTE5MDAtXFx1MTkxQ118W1xcdTE5NTAtXFx1MTk2RFxcdTE5NzAtXFx1MTk3NFxcdTE5ODAtXFx1MTlBQlxcdTE5QzEtXFx1MTlDN1xcdTFBMDAtXFx1MUExNl18W1xcdTFBMjAtXFx1MUE1NFxcdTFBQTdcXHUxQjA1LVxcdTFCMzNcXHUxQjQ1LVxcdTFCNEJcXHUxQjgzLVxcdTFCQTBcXHUxQkFFXFx1MUJBRl18W1xcdTFCQkEtXFx1MUJFNVxcdTFDMDAtXFx1MUMyM1xcdTFDNEQtXFx1MUM0RlxcdTFDNUEtXFx1MUM3RFxcdTFDRTktXFx1MUNFQ118W1xcdTFDRUUtXFx1MUNGMVxcdTFDRjVcXHUxQ0Y2XFx1MUQwMC1cXHUxREJGXFx1MUUwMC1cXHUxRjE1XFx1MUYxOC1cXHUxRjFEXXxbXFx1MUYyMC1cXHUxRjQ1XFx1MUY0OC1cXHUxRjREXFx1MUY1MC1cXHUxRjU3XFx1MUY1OVxcdTFGNUJcXHUxRjVEXFx1MUY1Ri1cXHUxRjdEXXxbXFx1MUY4MC1cXHUxRkI0XFx1MUZCNi1cXHUxRkJDXFx1MUZCRVxcdTFGQzItXFx1MUZDNFxcdTFGQzYtXFx1MUZDQ1xcdTFGRDAtXFx1MUZEM118W1xcdTFGRDYtXFx1MUZEQlxcdTFGRTAtXFx1MUZFQ1xcdTFGRjItXFx1MUZGNFxcdTFGRjYtXFx1MUZGQ1xcdTIwNzFcXHUyMDdGXXxbXFx1MjA5MC1cXHUyMDlDXFx1MjEwMlxcdTIxMDdcXHUyMTBBLVxcdTIxMTNcXHUyMTE1XFx1MjExOS1cXHUyMTFEXFx1MjEyNFxcdTIxMjZcXHUyMTI4XXxbXFx1MjEyQS1cXHUyMTJEXFx1MjEyRi1cXHUyMTM5XFx1MjEzQy1cXHUyMTNGXFx1MjE0NS1cXHUyMTQ5XFx1MjE0RVxcdTIxODNcXHUyMTg0XXxbXFx1MkMwMC1cXHUyQzJFXFx1MkMzMC1cXHUyQzVFXFx1MkM2MC1cXHUyQ0U0XFx1MkNFQi1cXHUyQ0VFXFx1MkNGMlxcdTJDRjNdfFtcXHUyRDAwLVxcdTJEMjVcXHUyRDI3XFx1MkQyRFxcdTJEMzAtXFx1MkQ2N1xcdTJENkZcXHUyRDgwLVxcdTJEOTZcXHUyREEwLVxcdTJEQTZdfFtcXHUyREE4LVxcdTJEQUVcXHUyREIwLVxcdTJEQjZcXHUyREI4LVxcdTJEQkVcXHUyREMwLVxcdTJEQzZcXHUyREM4LVxcdTJEQ0VdfFtcXHUyREQwLVxcdTJERDZcXHUyREQ4LVxcdTJEREVcXHUyRTJGXFx1MzAwNVxcdTMwMDZcXHUzMDMxLVxcdTMwMzVcXHUzMDNCXFx1MzAzQ118W1xcdTMwNDEtXFx1MzA5NlxcdTMwOUQtXFx1MzA5RlxcdTMwQTEtXFx1MzBGQVxcdTMwRkMtXFx1MzBGRlxcdTMxMDUtXFx1MzEyRF18W1xcdTMxMzEtXFx1MzE4RVxcdTMxQTAtXFx1MzFCQVxcdTMxRjAtXFx1MzFGRlxcdTM0MDAtXFx1NERCNVxcdTRFMDAtXFx1OUZDQ118W1xcdUEwMDAtXFx1QTQ4Q1xcdUE0RDAtXFx1QTRGRFxcdUE1MDAtXFx1QTYwQ1xcdUE2MTAtXFx1QTYxRlxcdUE2MkFcXHVBNjJCXXxbXFx1QTY0MC1cXHVBNjZFXFx1QTY3Ri1cXHVBNjk3XFx1QTZBMC1cXHVBNkU1XFx1QTcxNy1cXHVBNzFGXFx1QTcyMi1cXHVBNzg4XXxbXFx1QTc4Qi1cXHVBNzhFXFx1QTc5MC1cXHVBNzkzXFx1QTdBMC1cXHVBN0FBXFx1QTdGOC1cXHVBODAxXFx1QTgwMy1cXHVBODA1XXxbXFx1QTgwNy1cXHVBODBBXFx1QTgwQy1cXHVBODIyXFx1QTg0MC1cXHVBODczXFx1QTg4Mi1cXHVBOEIzXFx1QThGMi1cXHVBOEY3XFx1QThGQl18W1xcdUE5MEEtXFx1QTkyNVxcdUE5MzAtXFx1QTk0NlxcdUE5NjAtXFx1QTk3Q1xcdUE5ODQtXFx1QTlCMlxcdUE5Q0ZcXHVBQTAwLVxcdUFBMjhdfFtcXHVBQTQwLVxcdUFBNDJcXHVBQTQ0LVxcdUFBNEJcXHVBQTYwLVxcdUFBNzZcXHVBQTdBXFx1QUE4MC1cXHVBQUFGXFx1QUFCMVxcdUFBQjVdfFtcXHVBQUI2XFx1QUFCOS1cXHVBQUJEXFx1QUFDMFxcdUFBQzJcXHVBQURCLVxcdUFBRERcXHVBQUUwLVxcdUFBRUFcXHVBQUYyLVxcdUFBRjRdfFtcXHVBQjAxLVxcdUFCMDZcXHVBQjA5LVxcdUFCMEVcXHVBQjExLVxcdUFCMTZcXHVBQjIwLVxcdUFCMjZcXHVBQjI4LVxcdUFCMkVdfFtcXHVBQkMwLVxcdUFCRTJcXHVBQzAwLVxcdUQ3QTNcXHVEN0IwLVxcdUQ3QzZcXHVEN0NCLVxcdUQ3RkJcXHVGOTAwLVxcdUZBNkRdfFtcXHVGQTcwLVxcdUZBRDlcXHVGQjAwLVxcdUZCMDZcXHVGQjEzLVxcdUZCMTdcXHVGQjFEXFx1RkIxRi1cXHVGQjI4XFx1RkIyQS1cXHVGQjM2XXxbXFx1RkIzOC1cXHVGQjNDXFx1RkIzRVxcdUZCNDBcXHVGQjQxXFx1RkI0M1xcdUZCNDRcXHVGQjQ2LVxcdUZCQjFcXHVGQkQzLVxcdUZEM0RdfFtcXHVGRDUwLVxcdUZEOEZcXHVGRDkyLVxcdUZEQzdcXHVGREYwLVxcdUZERkJcXHVGRTcwLVxcdUZFNzRcXHVGRTc2LVxcdUZFRkNdfFtcXHVGRjIxLVxcdUZGM0FcXHVGRjQxLVxcdUZGNUFcXHVGRjY2LVxcdUZGQkVcXHVGRkMyLVxcdUZGQzdcXHVGRkNBLVxcdUZGQ0ZdfFtcXHVGRkQyLVxcdUZGRDdcXHVGRkRBLVxcdUZGRENdKS8sIC9eKD86XFxzKS8sIC9eKD86XFxzKS8sIC9eKD86JCkvXSxcbiAgICAgIGNvbmRpdGlvbnM6IHsgXCJuYW1lc3BhY2UtYm9keVwiOiB7IFwicnVsZXNcIjogWzI2LCAyOSwgMzQsIDM1LCAzNiwgMzcsIDM4LCAzOSwgNTAsIDUxLCA1MiwgNTMsIDU0LCA1NSwgNTYsIDU3LCA1OCwgNjEsIDY0LCA2NSwgNjYsIDY3LCA2OCwgNjksIDcwLCA3MSwgNzIsIDczLCA3NCwgNzUsIDc2LCA3NywgNzgsIDc5LCA4MCwgODEsIDgyLCA4NywgODgsIDg5LCA5MCwgOTEsIDkyLCA5MywgOTQsIDk1LCA5NiwgOThdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIm5hbWVzcGFjZVwiOiB7IFwicnVsZXNcIjogWzI2LCAyOSwgMzAsIDMxLCAzMiwgMzMsIDUwLCA1MSwgNTIsIDUzLCA1NCwgNTUsIDU2LCA1NywgNTgsIDYxLCA2NCwgNjUsIDY2LCA2NywgNjgsIDY5LCA3MCwgNzEsIDcyLCA3MywgNzQsIDc1LCA3NiwgNzcsIDc4LCA3OSwgODAsIDgxLCA4MiwgODcsIDg4LCA4OSwgOTAsIDkxLCA5MiwgOTMsIDk0LCA5NSwgOTYsIDk4XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJjbGFzcy1ib2R5XCI6IHsgXCJydWxlc1wiOiBbMjYsIDQ0LCA0NSwgNDYsIDQ3LCA0OCwgNDksIDUwLCA1MSwgNTIsIDUzLCA1NCwgNTUsIDU2LCA1NywgNTgsIDYxLCA2NCwgNjUsIDY2LCA2NywgNjgsIDY5LCA3MCwgNzEsIDcyLCA3MywgNzQsIDc1LCA3NiwgNzcsIDc4LCA3OSwgODAsIDgxLCA4MiwgODcsIDg4LCA4OSwgOTAsIDkxLCA5MiwgOTMsIDk0LCA5NSwgOTYsIDk4XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJjbGFzc1wiOiB7IFwicnVsZXNcIjogWzI2LCA0MCwgNDEsIDQyLCA0MywgNTAsIDUxLCA1MiwgNTMsIDU0LCA1NSwgNTYsIDU3LCA1OCwgNjEsIDY0LCA2NSwgNjYsIDY3LCA2OCwgNjksIDcwLCA3MSwgNzIsIDczLCA3NCwgNzUsIDc2LCA3NywgNzgsIDc5LCA4MCwgODEsIDgyLCA4NywgODgsIDg5LCA5MCwgOTEsIDkyLCA5MywgOTQsIDk1LCA5NiwgOThdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImFjY19kZXNjcl9tdWx0aWxpbmVcIjogeyBcInJ1bGVzXCI6IFsxMSwgMTIsIDI2LCA1MCwgNTEsIDUyLCA1MywgNTQsIDU1LCA1NiwgNTcsIDU4LCA2MSwgNjQsIDY1LCA2NiwgNjcsIDY4LCA2OSwgNzAsIDcxLCA3MiwgNzMsIDc0LCA3NSwgNzYsIDc3LCA3OCwgNzksIDgwLCA4MSwgODIsIDg3LCA4OCwgODksIDkwLCA5MSwgOTIsIDkzLCA5NCwgOTUsIDk2LCA5OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiYWNjX2Rlc2NyXCI6IHsgXCJydWxlc1wiOiBbOSwgMjYsIDUwLCA1MSwgNTIsIDUzLCA1NCwgNTUsIDU2LCA1NywgNTgsIDYxLCA2NCwgNjUsIDY2LCA2NywgNjgsIDY5LCA3MCwgNzEsIDcyLCA3MywgNzQsIDc1LCA3NiwgNzcsIDc4LCA3OSwgODAsIDgxLCA4MiwgODcsIDg4LCA4OSwgOTAsIDkxLCA5MiwgOTMsIDk0LCA5NSwgOTYsIDk4XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJhY2NfdGl0bGVcIjogeyBcInJ1bGVzXCI6IFs3LCAyNiwgNTAsIDUxLCA1MiwgNTMsIDU0LCA1NSwgNTYsIDU3LCA1OCwgNjEsIDY0LCA2NSwgNjYsIDY3LCA2OCwgNjksIDcwLCA3MSwgNzIsIDczLCA3NCwgNzUsIDc2LCA3NywgNzgsIDc5LCA4MCwgODEsIDgyLCA4NywgODgsIDg5LCA5MCwgOTEsIDkyLCA5MywgOTQsIDk1LCA5NiwgOThdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImNhbGxiYWNrX2FyZ3NcIjogeyBcInJ1bGVzXCI6IFsyMiwgMjMsIDI2LCA1MCwgNTEsIDUyLCA1MywgNTQsIDU1LCA1NiwgNTcsIDU4LCA2MSwgNjQsIDY1LCA2NiwgNjcsIDY4LCA2OSwgNzAsIDcxLCA3MiwgNzMsIDc0LCA3NSwgNzYsIDc3LCA3OCwgNzksIDgwLCA4MSwgODIsIDg3LCA4OCwgODksIDkwLCA5MSwgOTIsIDkzLCA5NCwgOTUsIDk2LCA5OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiY2FsbGJhY2tfbmFtZVwiOiB7IFwicnVsZXNcIjogWzE5LCAyMCwgMjEsIDI2LCA1MCwgNTEsIDUyLCA1MywgNTQsIDU1LCA1NiwgNTcsIDU4LCA2MSwgNjQsIDY1LCA2NiwgNjcsIDY4LCA2OSwgNzAsIDcxLCA3MiwgNzMsIDc0LCA3NSwgNzYsIDc3LCA3OCwgNzksIDgwLCA4MSwgODIsIDg3LCA4OCwgODksIDkwLCA5MSwgOTIsIDkzLCA5NCwgOTUsIDk2LCA5OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiaHJlZlwiOiB7IFwicnVsZXNcIjogWzI2LCA1MCwgNTEsIDUyLCA1MywgNTQsIDU1LCA1NiwgNTcsIDU4LCA2MSwgNjQsIDY1LCA2NiwgNjcsIDY4LCA2OSwgNzAsIDcxLCA3MiwgNzMsIDc0LCA3NSwgNzYsIDc3LCA3OCwgNzksIDgwLCA4MSwgODIsIDg3LCA4OCwgODksIDkwLCA5MSwgOTIsIDkzLCA5NCwgOTUsIDk2LCA5OF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwic3RydWN0XCI6IHsgXCJydWxlc1wiOiBbMjYsIDUwLCA1MSwgNTIsIDUzLCA1NCwgNTUsIDU2LCA1NywgNTgsIDYxLCA2NCwgNjUsIDY2LCA2NywgNjgsIDY5LCA3MCwgNzEsIDcyLCA3MywgNzQsIDc1LCA3NiwgNzcsIDc4LCA3OSwgODAsIDgxLCA4MiwgODcsIDg4LCA4OSwgOTAsIDkxLCA5MiwgOTMsIDk0LCA5NSwgOTYsIDk4XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJnZW5lcmljXCI6IHsgXCJydWxlc1wiOiBbMjYsIDUwLCA1MSwgNTIsIDUzLCA1NCwgNTUsIDU2LCA1NywgNTgsIDU5LCA2MCwgNjEsIDY0LCA2NSwgNjYsIDY3LCA2OCwgNjksIDcwLCA3MSwgNzIsIDczLCA3NCwgNzUsIDc2LCA3NywgNzgsIDc5LCA4MCwgODEsIDgyLCA4NywgODgsIDg5LCA5MCwgOTEsIDkyLCA5MywgOTQsIDk1LCA5NiwgOThdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImJxc3RyaW5nXCI6IHsgXCJydWxlc1wiOiBbMjYsIDUwLCA1MSwgNTIsIDUzLCA1NCwgNTUsIDU2LCA1NywgNTgsIDYxLCA2MiwgNjMsIDY0LCA2NSwgNjYsIDY3LCA2OCwgNjksIDcwLCA3MSwgNzIsIDczLCA3NCwgNzUsIDc2LCA3NywgNzgsIDc5LCA4MCwgODEsIDgyLCA4NywgODgsIDg5LCA5MCwgOTEsIDkyLCA5MywgOTQsIDk1LCA5NiwgOThdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcInN0cmluZ1wiOiB7IFwicnVsZXNcIjogWzI0LCAyNSwgMjYsIDUwLCA1MSwgNTIsIDUzLCA1NCwgNTUsIDU2LCA1NywgNTgsIDYxLCA2NCwgNjUsIDY2LCA2NywgNjgsIDY5LCA3MCwgNzEsIDcyLCA3MywgNzQsIDc1LCA3NiwgNzcsIDc4LCA3OSwgODAsIDgxLCA4MiwgODcsIDg4LCA4OSwgOTAsIDkxLCA5MiwgOTMsIDk0LCA5NSwgOTYsIDk4XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJJTklUSUFMXCI6IHsgXCJydWxlc1wiOiBbMCwgMSwgMiwgMywgNCwgNSwgNiwgOCwgMTAsIDEzLCAxNCwgMTUsIDE2LCAxNywgMTgsIDI2LCAyNywgMjgsIDI5LCAzOSwgNTAsIDUxLCA1MiwgNTMsIDU0LCA1NSwgNTYsIDU3LCA1OCwgNjEsIDY0LCA2NSwgNjYsIDY3LCA2OCwgNjksIDcwLCA3MSwgNzIsIDczLCA3NCwgNzUsIDc2LCA3NywgNzgsIDc5LCA4MCwgODEsIDgyLCA4MywgODQsIDg1LCA4NiwgODcsIDg4LCA4OSwgOTAsIDkxLCA5MiwgOTMsIDk0LCA5NSwgOTYsIDk3LCA5OF0sIFwiaW5jbHVzaXZlXCI6IHRydWUgfSB9XG4gICAgfTtcbiAgICByZXR1cm4gbGV4ZXIyO1xuICB9KSgpO1xuICBwYXJzZXIyLmxleGVyID0gbGV4ZXI7XG4gIGZ1bmN0aW9uIFBhcnNlcigpIHtcbiAgICB0aGlzLnl5ID0ge307XG4gIH1cbiAgX19uYW1lKFBhcnNlciwgXCJQYXJzZXJcIik7XG4gIFBhcnNlci5wcm90b3R5cGUgPSBwYXJzZXIyO1xuICBwYXJzZXIyLlBhcnNlciA9IFBhcnNlcjtcbiAgcmV0dXJuIG5ldyBQYXJzZXIoKTtcbn0pKCk7XG5wYXJzZXIucGFyc2VyID0gcGFyc2VyO1xudmFyIGNsYXNzRGlhZ3JhbV9kZWZhdWx0ID0gcGFyc2VyO1xuXG4vLyBzcmMvZGlhZ3JhbXMvY2xhc3MvY2xhc3NEYi50c1xuaW1wb3J0IHsgc2VsZWN0IH0gZnJvbSBcImQzXCI7XG5cbi8vIHNyYy9kaWFncmFtcy9jbGFzcy9jbGFzc1R5cGVzLnRzXG52YXIgdmlzaWJpbGl0eVZhbHVlcyA9IFtcIiNcIiwgXCIrXCIsIFwiflwiLCBcIi1cIiwgXCJcIl07XG52YXIgQ2xhc3NNZW1iZXIgPSBjbGFzcyB7XG4gIHN0YXRpYyB7XG4gICAgX19uYW1lKHRoaXMsIFwiQ2xhc3NNZW1iZXJcIik7XG4gIH1cbiAgY29uc3RydWN0b3IoaW5wdXQsIG1lbWJlclR5cGUpIHtcbiAgICB0aGlzLm1lbWJlclR5cGUgPSBtZW1iZXJUeXBlO1xuICAgIHRoaXMudmlzaWJpbGl0eSA9IFwiXCI7XG4gICAgdGhpcy5jbGFzc2lmaWVyID0gXCJcIjtcbiAgICB0aGlzLnRleHQgPSBcIlwiO1xuICAgIGNvbnN0IHNhbml0aXplZElucHV0ID0gc2FuaXRpemVUZXh0KGlucHV0LCBnZXRDb25maWcoKSk7XG4gICAgdGhpcy5wYXJzZU1lbWJlcihzYW5pdGl6ZWRJbnB1dCk7XG4gIH1cbiAgZ2V0RGlzcGxheURldGFpbHMoKSB7XG4gICAgbGV0IGRpc3BsYXlUZXh0ID0gdGhpcy52aXNpYmlsaXR5ICsgcGFyc2VHZW5lcmljVHlwZXModGhpcy5pZCk7XG4gICAgaWYgKHRoaXMubWVtYmVyVHlwZSA9PT0gXCJtZXRob2RcIikge1xuICAgICAgZGlzcGxheVRleHQgKz0gYCgke3BhcnNlR2VuZXJpY1R5cGVzKHRoaXMucGFyYW1ldGVycy50cmltKCkpfSlgO1xuICAgICAgaWYgKHRoaXMucmV0dXJuVHlwZSkge1xuICAgICAgICBkaXNwbGF5VGV4dCArPSBcIiA6IFwiICsgcGFyc2VHZW5lcmljVHlwZXModGhpcy5yZXR1cm5UeXBlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZGlzcGxheVRleHQgPSBkaXNwbGF5VGV4dC50cmltKCk7XG4gICAgY29uc3QgY3NzU3R5bGUgPSB0aGlzLnBhcnNlQ2xhc3NpZmllcigpO1xuICAgIHJldHVybiB7XG4gICAgICBkaXNwbGF5VGV4dCxcbiAgICAgIGNzc1N0eWxlXG4gICAgfTtcbiAgfVxuICBwYXJzZU1lbWJlcihpbnB1dCkge1xuICAgIGxldCBwb3RlbnRpYWxDbGFzc2lmaWVyID0gXCJcIjtcbiAgICBpZiAodGhpcy5tZW1iZXJUeXBlID09PSBcIm1ldGhvZFwiKSB7XG4gICAgICBjb25zdCBtZXRob2RSZWdFeCA9IC8oWyMrfi1dKT8oLispXFwoKC4qKVxcKShbXFxzJCpdKT8oLiopKFskKl0pPy87XG4gICAgICBjb25zdCBtYXRjaCA9IG1ldGhvZFJlZ0V4LmV4ZWMoaW5wdXQpO1xuICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIGNvbnN0IGRldGVjdGVkVmlzaWJpbGl0eSA9IG1hdGNoWzFdID8gbWF0Y2hbMV0udHJpbSgpIDogXCJcIjtcbiAgICAgICAgaWYgKHZpc2liaWxpdHlWYWx1ZXMuaW5jbHVkZXMoZGV0ZWN0ZWRWaXNpYmlsaXR5KSkge1xuICAgICAgICAgIHRoaXMudmlzaWJpbGl0eSA9IGRldGVjdGVkVmlzaWJpbGl0eTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlkID0gbWF0Y2hbMl07XG4gICAgICAgIHRoaXMucGFyYW1ldGVycyA9IG1hdGNoWzNdID8gbWF0Y2hbM10udHJpbSgpIDogXCJcIjtcbiAgICAgICAgcG90ZW50aWFsQ2xhc3NpZmllciA9IG1hdGNoWzRdID8gbWF0Y2hbNF0udHJpbSgpIDogXCJcIjtcbiAgICAgICAgdGhpcy5yZXR1cm5UeXBlID0gbWF0Y2hbNV0gPyBtYXRjaFs1XS50cmltKCkgOiBcIlwiO1xuICAgICAgICBpZiAocG90ZW50aWFsQ2xhc3NpZmllciA9PT0gXCJcIikge1xuICAgICAgICAgIGNvbnN0IGxhc3RDaGFyID0gdGhpcy5yZXR1cm5UeXBlLnN1YnN0cmluZyh0aGlzLnJldHVyblR5cGUubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgaWYgKC9bJCpdLy5leGVjKGxhc3RDaGFyKSkge1xuICAgICAgICAgICAgcG90ZW50aWFsQ2xhc3NpZmllciA9IGxhc3RDaGFyO1xuICAgICAgICAgICAgdGhpcy5yZXR1cm5UeXBlID0gdGhpcy5yZXR1cm5UeXBlLnN1YnN0cmluZygwLCB0aGlzLnJldHVyblR5cGUubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGxlbmd0aCA9IGlucHV0Lmxlbmd0aDtcbiAgICAgIGNvbnN0IGZpcnN0Q2hhciA9IGlucHV0LnN1YnN0cmluZygwLCAxKTtcbiAgICAgIGNvbnN0IGxhc3RDaGFyID0gaW5wdXQuc3Vic3RyaW5nKGxlbmd0aCAtIDEpO1xuICAgICAgaWYgKHZpc2liaWxpdHlWYWx1ZXMuaW5jbHVkZXMoZmlyc3RDaGFyKSkge1xuICAgICAgICB0aGlzLnZpc2liaWxpdHkgPSBmaXJzdENoYXI7XG4gICAgICB9XG4gICAgICBpZiAoL1skKl0vLmV4ZWMobGFzdENoYXIpKSB7XG4gICAgICAgIHBvdGVudGlhbENsYXNzaWZpZXIgPSBsYXN0Q2hhcjtcbiAgICAgIH1cbiAgICAgIHRoaXMuaWQgPSBpbnB1dC5zdWJzdHJpbmcoXG4gICAgICAgIHRoaXMudmlzaWJpbGl0eSA9PT0gXCJcIiA/IDAgOiAxLFxuICAgICAgICBwb3RlbnRpYWxDbGFzc2lmaWVyID09PSBcIlwiID8gbGVuZ3RoIDogbGVuZ3RoIC0gMVxuICAgICAgKTtcbiAgICB9XG4gICAgdGhpcy5jbGFzc2lmaWVyID0gcG90ZW50aWFsQ2xhc3NpZmllcjtcbiAgICB0aGlzLmlkID0gdGhpcy5pZC5zdGFydHNXaXRoKFwiIFwiKSA/IFwiIFwiICsgdGhpcy5pZC50cmltKCkgOiB0aGlzLmlkLnRyaW0oKTtcbiAgICBjb25zdCBjb21iaW5lZFRleHQgPSBgJHt0aGlzLnZpc2liaWxpdHkgPyBcIlxcXFxcIiArIHRoaXMudmlzaWJpbGl0eSA6IFwiXCJ9JHtwYXJzZUdlbmVyaWNUeXBlcyh0aGlzLmlkKX0ke3RoaXMubWVtYmVyVHlwZSA9PT0gXCJtZXRob2RcIiA/IGAoJHtwYXJzZUdlbmVyaWNUeXBlcyh0aGlzLnBhcmFtZXRlcnMpfSkke3RoaXMucmV0dXJuVHlwZSA/IFwiIDogXCIgKyBwYXJzZUdlbmVyaWNUeXBlcyh0aGlzLnJldHVyblR5cGUpIDogXCJcIn1gIDogXCJcIn1gO1xuICAgIHRoaXMudGV4dCA9IGNvbWJpbmVkVGV4dC5yZXBsYWNlQWxsKFwiPFwiLCBcIiZsdDtcIikucmVwbGFjZUFsbChcIj5cIiwgXCImZ3Q7XCIpO1xuICAgIGlmICh0aGlzLnRleHQuc3RhcnRzV2l0aChcIlxcXFwmbHQ7XCIpKSB7XG4gICAgICB0aGlzLnRleHQgPSB0aGlzLnRleHQucmVwbGFjZShcIlxcXFwmbHQ7XCIsIFwiflwiKTtcbiAgICB9XG4gIH1cbiAgcGFyc2VDbGFzc2lmaWVyKCkge1xuICAgIHN3aXRjaCAodGhpcy5jbGFzc2lmaWVyKSB7XG4gICAgICBjYXNlIFwiKlwiOlxuICAgICAgICByZXR1cm4gXCJmb250LXN0eWxlOml0YWxpYztcIjtcbiAgICAgIGNhc2UgXCIkXCI6XG4gICAgICAgIHJldHVybiBcInRleHQtZGVjb3JhdGlvbjp1bmRlcmxpbmU7XCI7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG4gIH1cbn07XG5cbi8vIHNyYy9kaWFncmFtcy9jbGFzcy9jbGFzc0RiLnRzXG5pbXBvcnQgRE9NUHVyaWZ5IGZyb20gXCJkb21wdXJpZnlcIjtcbnZhciBNRVJNQUlEX0RPTV9JRF9QUkVGSVggPSBcImNsYXNzSWQtXCI7XG52YXIgY2xhc3NDb3VudGVyID0gMDtcbnZhciBzYW5pdGl6ZVRleHQyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgodHh0KSA9PiBjb21tb25fZGVmYXVsdC5zYW5pdGl6ZVRleHQodHh0LCBnZXRDb25maWcoKSksIFwic2FuaXRpemVUZXh0XCIpO1xudmFyIENsYXNzREIgPSBjbGFzcyBfQ2xhc3NEQiB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucmVsYXRpb25zID0gW107XG4gICAgdGhpcy5jbGFzc2VzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICB0aGlzLnN0eWxlQ2xhc3NlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgdGhpcy5ub3RlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgdGhpcy5pbnRlcmZhY2VzID0gW107XG4gICAgLy8gcHJpdmF0ZSBzdGF0aWMgY2xhc3NDb3VudGVyID0gMDtcbiAgICB0aGlzLm5hbWVzcGFjZXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgIHRoaXMubmFtZXNwYWNlQ291bnRlciA9IDA7XG4gICAgdGhpcy5uYW1lc3BhY2VTdGFjayA9IFtdO1xuICAgIHRoaXMuZGlhZ3JhbUlkID0gXCJcIjtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVuc2FmZS1mdW5jdGlvbi10eXBlXG4gICAgdGhpcy5mdW5jdGlvbnMgPSBbXTtcbiAgICB0aGlzLmxpbmVUeXBlID0ge1xuICAgICAgTElORTogMCxcbiAgICAgIERPVFRFRF9MSU5FOiAxXG4gICAgfTtcbiAgICB0aGlzLnJlbGF0aW9uVHlwZSA9IHtcbiAgICAgIEFHR1JFR0FUSU9OOiAwLFxuICAgICAgRVhURU5TSU9OOiAxLFxuICAgICAgQ09NUE9TSVRJT046IDIsXG4gICAgICBERVBFTkRFTkNZOiAzLFxuICAgICAgTE9MTElQT1A6IDRcbiAgICB9O1xuICAgIHRoaXMuc2V0dXBUb29sVGlwcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGVsZW1lbnQpID0+IHtcbiAgICAgIGNvbnN0IHRvb2x0aXBFbGVtID0gY3JlYXRlVG9vbHRpcCgpO1xuICAgICAgY29uc3Qgc3ZnID0gc2VsZWN0KGVsZW1lbnQpLnNlbGVjdChcInN2Z1wiKTtcbiAgICAgIGNvbnN0IG5vZGVzID0gc3ZnLnNlbGVjdEFsbChcImdcIikuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gc2VsZWN0KHRoaXMpLmF0dHIoXCJ0aXRsZVwiKSAhPT0gbnVsbDtcbiAgICAgIH0pO1xuICAgICAgbm9kZXMub24oXCJtb3VzZW92ZXJcIiwgKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IGVsID0gc2VsZWN0KGV2ZW50LmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICBjb25zdCB0aXRsZSA9IGVsLmF0dHIoXCJ0aXRsZVwiKTtcbiAgICAgICAgaWYgKCF0aXRsZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZWN0ID0gZXZlbnQuY3VycmVudFRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdG9vbHRpcEVsZW0udHJhbnNpdGlvbigpLmR1cmF0aW9uKDIwMCkuc3R5bGUoXCJvcGFjaXR5XCIsIFwiLjlcIik7XG4gICAgICAgIHRvb2x0aXBFbGVtLmh0bWwoRE9NUHVyaWZ5LnNhbml0aXplKHRpdGxlKSkuc3R5bGUoXCJsZWZ0XCIsIGAke3dpbmRvdy5zY3JvbGxYICsgcmVjdC5sZWZ0ICsgcmVjdC53aWR0aCAvIDJ9cHhgKS5zdHlsZShcInRvcFwiLCBgJHt3aW5kb3cuc2Nyb2xsWSArIHJlY3QuYm90dG9tICsgNH1weGApO1xuICAgICAgICBlbC5jbGFzc2VkKFwiaG92ZXJcIiwgdHJ1ZSk7XG4gICAgICB9KS5vbihcIm1vdXNlb3V0XCIsIChldmVudCkgPT4ge1xuICAgICAgICB0b29sdGlwRWxlbS50cmFuc2l0aW9uKCkuZHVyYXRpb24oNTAwKS5zdHlsZShcIm9wYWNpdHlcIiwgMCk7XG4gICAgICAgIHNlbGVjdChldmVudC5jdXJyZW50VGFyZ2V0KS5jbGFzc2VkKFwiaG92ZXJcIiwgZmFsc2UpO1xuICAgICAgfSk7XG4gICAgfSwgXCJzZXR1cFRvb2xUaXBzXCIpO1xuICAgIHRoaXMuZGlyZWN0aW9uID0gXCJUQlwiO1xuICAgIHRoaXMuc2V0QWNjVGl0bGUgPSBzZXRBY2NUaXRsZTtcbiAgICB0aGlzLmdldEFjY1RpdGxlID0gZ2V0QWNjVGl0bGU7XG4gICAgdGhpcy5zZXRBY2NEZXNjcmlwdGlvbiA9IHNldEFjY0Rlc2NyaXB0aW9uO1xuICAgIHRoaXMuZ2V0QWNjRGVzY3JpcHRpb24gPSBnZXRBY2NEZXNjcmlwdGlvbjtcbiAgICB0aGlzLnNldERpYWdyYW1UaXRsZSA9IHNldERpYWdyYW1UaXRsZTtcbiAgICB0aGlzLmdldERpYWdyYW1UaXRsZSA9IGdldERpYWdyYW1UaXRsZTtcbiAgICB0aGlzLmdldENvbmZpZyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKCkgPT4gZ2V0Q29uZmlnKCkuY2xhc3MsIFwiZ2V0Q29uZmlnXCIpO1xuICAgIHRoaXMuZnVuY3Rpb25zLnB1c2godGhpcy5zZXR1cFRvb2xUaXBzLmJpbmQodGhpcykpO1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICB0aGlzLmFkZFJlbGF0aW9uID0gdGhpcy5hZGRSZWxhdGlvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuYWRkQ2xhc3Nlc1RvTmFtZXNwYWNlID0gdGhpcy5hZGRDbGFzc2VzVG9OYW1lc3BhY2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLmFkZE5hbWVzcGFjZSA9IHRoaXMuYWRkTmFtZXNwYWNlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5wb3BOYW1lc3BhY2UgPSB0aGlzLnBvcE5hbWVzcGFjZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc2V0Q3NzQ2xhc3MgPSB0aGlzLnNldENzc0NsYXNzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5hZGRNZW1iZXJzID0gdGhpcy5hZGRNZW1iZXJzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5hZGRDbGFzcyA9IHRoaXMuYWRkQ2xhc3MuYmluZCh0aGlzKTtcbiAgICB0aGlzLnNldENsYXNzTGFiZWwgPSB0aGlzLnNldENsYXNzTGFiZWwuYmluZCh0aGlzKTtcbiAgICB0aGlzLmFkZEFubm90YXRpb24gPSB0aGlzLmFkZEFubm90YXRpb24uYmluZCh0aGlzKTtcbiAgICB0aGlzLmFkZE1lbWJlciA9IHRoaXMuYWRkTWVtYmVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5jbGVhbnVwTGFiZWwgPSB0aGlzLmNsZWFudXBMYWJlbC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuYWRkTm90ZSA9IHRoaXMuYWRkTm90ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZGVmaW5lQ2xhc3MgPSB0aGlzLmRlZmluZUNsYXNzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5zZXREaXJlY3Rpb24gPSB0aGlzLnNldERpcmVjdGlvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc2V0TGluayA9IHRoaXMuc2V0TGluay5iaW5kKHRoaXMpO1xuICAgIHRoaXMuYmluZEZ1bmN0aW9ucyA9IHRoaXMuYmluZEZ1bmN0aW9ucy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuY2xlYXIgPSB0aGlzLmNsZWFyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5zZXRUb29sdGlwID0gdGhpcy5zZXRUb29sdGlwLmJpbmQodGhpcyk7XG4gICAgdGhpcy5zZXRDbGlja0V2ZW50ID0gdGhpcy5zZXRDbGlja0V2ZW50LmJpbmQodGhpcyk7XG4gICAgdGhpcy5zZXRDc3NTdHlsZSA9IHRoaXMuc2V0Q3NzU3R5bGUuYmluZCh0aGlzKTtcbiAgfVxuICBzdGF0aWMge1xuICAgIF9fbmFtZSh0aGlzLCBcIkNsYXNzREJcIik7XG4gIH1cbiAgc3BsaXRDbGFzc05hbWVBbmRUeXBlKF9pZCkge1xuICAgIGNvbnN0IGlkID0gY29tbW9uX2RlZmF1bHQuc2FuaXRpemVUZXh0KF9pZCwgZ2V0Q29uZmlnKCkpO1xuICAgIGxldCBnZW5lcmljVHlwZSA9IFwiXCI7XG4gICAgbGV0IGNsYXNzTmFtZSA9IGlkO1xuICAgIGlmIChpZC5pbmRleE9mKFwiflwiKSA+IDApIHtcbiAgICAgIGNvbnN0IHNwbGl0ID0gaWQuc3BsaXQoXCJ+XCIpO1xuICAgICAgY2xhc3NOYW1lID0gc2FuaXRpemVUZXh0MihzcGxpdFswXSk7XG4gICAgICBnZW5lcmljVHlwZSA9IHNhbml0aXplVGV4dDIoc3BsaXRbMV0pO1xuICAgIH1cbiAgICByZXR1cm4geyBjbGFzc05hbWUsIHR5cGU6IGdlbmVyaWNUeXBlIH07XG4gIH1cbiAgc2V0Q2xhc3NMYWJlbChfaWQsIGxhYmVsKSB7XG4gICAgY29uc3QgaWQgPSBjb21tb25fZGVmYXVsdC5zYW5pdGl6ZVRleHQoX2lkLCBnZXRDb25maWcoKSk7XG4gICAgaWYgKGxhYmVsKSB7XG4gICAgICBsYWJlbCA9IHNhbml0aXplVGV4dDIobGFiZWwpO1xuICAgIH1cbiAgICBjb25zdCB7IGNsYXNzTmFtZSB9ID0gdGhpcy5zcGxpdENsYXNzTmFtZUFuZFR5cGUoaWQpO1xuICAgIHRoaXMuY2xhc3Nlcy5nZXQoY2xhc3NOYW1lKS5sYWJlbCA9IGxhYmVsO1xuICAgIHRoaXMuY2xhc3Nlcy5nZXQoY2xhc3NOYW1lKS50ZXh0ID0gYCR7bGFiZWx9JHt0aGlzLmNsYXNzZXMuZ2V0KGNsYXNzTmFtZSkudHlwZSA/IGA8JHt0aGlzLmNsYXNzZXMuZ2V0KGNsYXNzTmFtZSkudHlwZX0+YCA6IFwiXCJ9YDtcbiAgfVxuICAvKipcbiAgICogRnVuY3Rpb24gY2FsbGVkIGJ5IHBhcnNlciB3aGVuIGEgbm9kZSBkZWZpbml0aW9uIGhhcyBiZWVuIGZvdW5kLlxuICAgKlxuICAgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgY2xhc3MgdG8gYWRkXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGFkZENsYXNzKF9pZCkge1xuICAgIGNvbnN0IGlkID0gY29tbW9uX2RlZmF1bHQuc2FuaXRpemVUZXh0KF9pZCwgZ2V0Q29uZmlnKCkpO1xuICAgIGNvbnN0IHsgY2xhc3NOYW1lLCB0eXBlIH0gPSB0aGlzLnNwbGl0Q2xhc3NOYW1lQW5kVHlwZShpZCk7XG4gICAgaWYgKHRoaXMuY2xhc3Nlcy5oYXMoY2xhc3NOYW1lKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBuYW1lID0gY29tbW9uX2RlZmF1bHQuc2FuaXRpemVUZXh0KGNsYXNzTmFtZSwgZ2V0Q29uZmlnKCkpO1xuICAgIHRoaXMuY2xhc3Nlcy5zZXQobmFtZSwge1xuICAgICAgaWQ6IG5hbWUsXG4gICAgICB0eXBlLFxuICAgICAgbGFiZWw6IG5hbWUsXG4gICAgICB0ZXh0OiBgJHtuYW1lfSR7dHlwZSA/IGAmbHQ7JHt0eXBlfSZndDtgIDogXCJcIn1gLFxuICAgICAgc2hhcGU6IFwiY2xhc3NCb3hcIixcbiAgICAgIGNzc0NsYXNzZXM6IFwiZGVmYXVsdFwiLFxuICAgICAgbWV0aG9kczogW10sXG4gICAgICBtZW1iZXJzOiBbXSxcbiAgICAgIGFubm90YXRpb25zOiBbXSxcbiAgICAgIHN0eWxlczogW10sXG4gICAgICBkb21JZDogTUVSTUFJRF9ET01fSURfUFJFRklYICsgbmFtZSArIFwiLVwiICsgY2xhc3NDb3VudGVyXG4gICAgfSk7XG4gICAgY2xhc3NDb3VudGVyKys7XG4gIH1cbiAgYWRkSW50ZXJmYWNlKGxhYmVsLCBjbGFzc0lkKSB7XG4gICAgY29uc3QgY2xhc3NJbnRlcmZhY2UgPSB7XG4gICAgICBpZDogYGludGVyZmFjZSR7dGhpcy5pbnRlcmZhY2VzLmxlbmd0aH1gLFxuICAgICAgbGFiZWwsXG4gICAgICBjbGFzc0lkXG4gICAgfTtcbiAgICB0aGlzLmludGVyZmFjZXMucHVzaChjbGFzc0ludGVyZmFjZSk7XG4gIH1cbiAgLyoqXG4gICAqIFNldHMgdGhlIGRpYWdyYW0ncyBTVkcgZWxlbWVudCBJRCwgdXNlZCB0byBwcmVmaXggZG9tSWRzIGZvciB1bmlxdWVuZXNzXG4gICAqIGFjcm9zcyBtdWx0aXBsZSBkaWFncmFtcyBvbiB0aGUgc2FtZSBwYWdlLlxuICAgKi9cbiAgc2V0RGlhZ3JhbUlkKHN2Z0VsZW1lbnRJZCkge1xuICAgIHRoaXMuZGlhZ3JhbUlkID0gc3ZnRWxlbWVudElkO1xuICB9XG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0byBsb29rdXAgZG9tSWQgZnJvbSBpZCBpbiB0aGUgZ3JhcGggZGVmaW5pdGlvbi5cbiAgICogV2hlbiBkaWFncmFtSWQgaXMgc2V0LCByZXR1cm5zIHRoZSBwcmVmaXhlZCB2ZXJzaW9uIGZvciBET00gdW5pcXVlbmVzcy5cbiAgICpcbiAgICogQHBhcmFtIGlkIC0gY2xhc3MgSUQgdG8gbG9va3VwXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGxvb2tVcERvbUlkKF9pZCkge1xuICAgIGNvbnN0IGlkID0gY29tbW9uX2RlZmF1bHQuc2FuaXRpemVUZXh0KF9pZCwgZ2V0Q29uZmlnKCkpO1xuICAgIGlmICh0aGlzLmNsYXNzZXMuaGFzKGlkKSkge1xuICAgICAgY29uc3QgZG9tSWQgPSB0aGlzLmNsYXNzZXMuZ2V0KGlkKS5kb21JZDtcbiAgICAgIHJldHVybiB0aGlzLmRpYWdyYW1JZCA/IGAke3RoaXMuZGlhZ3JhbUlkfS0ke2RvbUlkfWAgOiBkb21JZDtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ2xhc3Mgbm90IGZvdW5kOiBcIiArIGlkKTtcbiAgfVxuICBjbGVhcigpIHtcbiAgICB0aGlzLnJlbGF0aW9ucyA9IFtdO1xuICAgIHRoaXMuY2xhc3NlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgdGhpcy5ub3RlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgdGhpcy5pbnRlcmZhY2VzID0gW107XG4gICAgdGhpcy5mdW5jdGlvbnMgPSBbXTtcbiAgICB0aGlzLmZ1bmN0aW9ucy5wdXNoKHRoaXMuc2V0dXBUb29sVGlwcy5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLm5hbWVzcGFjZXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgIHRoaXMubmFtZXNwYWNlQ291bnRlciA9IDA7XG4gICAgdGhpcy5uYW1lc3BhY2VTdGFjayA9IFtdO1xuICAgIHRoaXMuZGlhZ3JhbUlkID0gXCJcIjtcbiAgICB0aGlzLmRpcmVjdGlvbiA9IFwiVEJcIjtcbiAgICBjbGVhcigpO1xuICB9XG4gIGdldENsYXNzKGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuY2xhc3Nlcy5nZXQoaWQpO1xuICB9XG4gIGdldENsYXNzZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2xhc3NlcztcbiAgfVxuICBnZXRSZWxhdGlvbnMoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVsYXRpb25zO1xuICB9XG4gIGdldE5vdGUoaWQpIHtcbiAgICBjb25zdCBrZXkgPSB0eXBlb2YgaWQgPT09IFwibnVtYmVyXCIgPyBgbm90ZSR7aWR9YCA6IGlkO1xuICAgIHJldHVybiB0aGlzLm5vdGVzLmdldChrZXkpO1xuICB9XG4gIGdldE5vdGVzKCkge1xuICAgIHJldHVybiB0aGlzLm5vdGVzO1xuICB9XG4gIGFkZFJlbGF0aW9uKGNsYXNzUmVsYXRpb24pIHtcbiAgICBsb2cuZGVidWcoXCJBZGRpbmcgcmVsYXRpb246IFwiICsgSlNPTi5zdHJpbmdpZnkoY2xhc3NSZWxhdGlvbikpO1xuICAgIGNvbnN0IGludmFsaWRUeXBlcyA9IFtcbiAgICAgIHRoaXMucmVsYXRpb25UeXBlLkxPTExJUE9QLFxuICAgICAgdGhpcy5yZWxhdGlvblR5cGUuQUdHUkVHQVRJT04sXG4gICAgICB0aGlzLnJlbGF0aW9uVHlwZS5DT01QT1NJVElPTixcbiAgICAgIHRoaXMucmVsYXRpb25UeXBlLkRFUEVOREVOQ1ksXG4gICAgICB0aGlzLnJlbGF0aW9uVHlwZS5FWFRFTlNJT05cbiAgICBdO1xuICAgIGlmIChjbGFzc1JlbGF0aW9uLnJlbGF0aW9uLnR5cGUxID09PSB0aGlzLnJlbGF0aW9uVHlwZS5MT0xMSVBPUCAmJiAhaW52YWxpZFR5cGVzLmluY2x1ZGVzKGNsYXNzUmVsYXRpb24ucmVsYXRpb24udHlwZTIpKSB7XG4gICAgICB0aGlzLmFkZENsYXNzKGNsYXNzUmVsYXRpb24uaWQyKTtcbiAgICAgIHRoaXMuYWRkSW50ZXJmYWNlKGNsYXNzUmVsYXRpb24uaWQxLCBjbGFzc1JlbGF0aW9uLmlkMik7XG4gICAgICBjbGFzc1JlbGF0aW9uLmlkMSA9IGBpbnRlcmZhY2Uke3RoaXMuaW50ZXJmYWNlcy5sZW5ndGggLSAxfWA7XG4gICAgfSBlbHNlIGlmIChjbGFzc1JlbGF0aW9uLnJlbGF0aW9uLnR5cGUyID09PSB0aGlzLnJlbGF0aW9uVHlwZS5MT0xMSVBPUCAmJiAhaW52YWxpZFR5cGVzLmluY2x1ZGVzKGNsYXNzUmVsYXRpb24ucmVsYXRpb24udHlwZTEpKSB7XG4gICAgICB0aGlzLmFkZENsYXNzKGNsYXNzUmVsYXRpb24uaWQxKTtcbiAgICAgIHRoaXMuYWRkSW50ZXJmYWNlKGNsYXNzUmVsYXRpb24uaWQyLCBjbGFzc1JlbGF0aW9uLmlkMSk7XG4gICAgICBjbGFzc1JlbGF0aW9uLmlkMiA9IGBpbnRlcmZhY2Uke3RoaXMuaW50ZXJmYWNlcy5sZW5ndGggLSAxfWA7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWRkQ2xhc3MoY2xhc3NSZWxhdGlvbi5pZDEpO1xuICAgICAgdGhpcy5hZGRDbGFzcyhjbGFzc1JlbGF0aW9uLmlkMik7XG4gICAgfVxuICAgIGNsYXNzUmVsYXRpb24uaWQxID0gdGhpcy5zcGxpdENsYXNzTmFtZUFuZFR5cGUoY2xhc3NSZWxhdGlvbi5pZDEpLmNsYXNzTmFtZTtcbiAgICBjbGFzc1JlbGF0aW9uLmlkMiA9IHRoaXMuc3BsaXRDbGFzc05hbWVBbmRUeXBlKGNsYXNzUmVsYXRpb24uaWQyKS5jbGFzc05hbWU7XG4gICAgY2xhc3NSZWxhdGlvbi5yZWxhdGlvblRpdGxlMSA9IGNvbW1vbl9kZWZhdWx0LnNhbml0aXplVGV4dChcbiAgICAgIGNsYXNzUmVsYXRpb24ucmVsYXRpb25UaXRsZTEudHJpbSgpLFxuICAgICAgZ2V0Q29uZmlnKClcbiAgICApO1xuICAgIGNsYXNzUmVsYXRpb24ucmVsYXRpb25UaXRsZTIgPSBjb21tb25fZGVmYXVsdC5zYW5pdGl6ZVRleHQoXG4gICAgICBjbGFzc1JlbGF0aW9uLnJlbGF0aW9uVGl0bGUyLnRyaW0oKSxcbiAgICAgIGdldENvbmZpZygpXG4gICAgKTtcbiAgICB0aGlzLnJlbGF0aW9ucy5wdXNoKGNsYXNzUmVsYXRpb24pO1xuICB9XG4gIC8qKlxuICAgKiBBZGRzIGFuIGFubm90YXRpb24gdG8gdGhlIHNwZWNpZmllZCBjbGFzcyBBbm5vdGF0aW9ucyBtYXJrIHNwZWNpYWwgcHJvcGVydGllcyBvZiB0aGUgZ2l2ZW4gdHlwZVxuICAgKiAobGlrZSAnaW50ZXJmYWNlJyBvciAnc2VydmljZScpXG4gICAqXG4gICAqIEBwYXJhbSBjbGFzc05hbWUgLSBUaGUgY2xhc3MgbmFtZVxuICAgKiBAcGFyYW0gYW5ub3RhdGlvbiAtIFRoZSBuYW1lIG9mIHRoZSBhbm5vdGF0aW9uIHdpdGhvdXQgYW55IGJyYWNrZXRzXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGFkZEFubm90YXRpb24oY2xhc3NOYW1lLCBhbm5vdGF0aW9uKSB7XG4gICAgY29uc3QgdmFsaWRhdGVkQ2xhc3NOYW1lID0gdGhpcy5zcGxpdENsYXNzTmFtZUFuZFR5cGUoY2xhc3NOYW1lKS5jbGFzc05hbWU7XG4gICAgdGhpcy5jbGFzc2VzLmdldCh2YWxpZGF0ZWRDbGFzc05hbWUpLmFubm90YXRpb25zLnB1c2goYW5ub3RhdGlvbik7XG4gIH1cbiAgLyoqXG4gICAqIEFkZHMgYSBtZW1iZXIgdG8gdGhlIHNwZWNpZmllZCBjbGFzc1xuICAgKlxuICAgKiBAcGFyYW0gY2xhc3NOYW1lIC0gVGhlIGNsYXNzIG5hbWVcbiAgICogQHBhcmFtIG1lbWJlciAtIFRoZSBmdWxsIG5hbWUgb2YgdGhlIG1lbWJlci4gSWYgdGhlIG1lbWJlciBpcyBlbmNsb3NlZCBpbiBgPDxicmFja2V0cz4+YCBpdCBpc1xuICAgKiAgIHRyZWF0ZWQgYXMgYW4gYW5ub3RhdGlvbiBJZiB0aGUgbWVtYmVyIGlzIGVuZGluZyB3aXRoIGEgY2xvc2luZyBicmFja2V0ICkgaXQgaXMgdHJlYXRlZCBhcyBhXG4gICAqICAgbWV0aG9kIE90aGVyd2lzZSB0aGUgbWVtYmVyIHdpbGwgYmUgdHJlYXRlZCBhcyBhIG5vcm1hbCBwcm9wZXJ0eVxuICAgKiBAcHVibGljXG4gICAqL1xuICBhZGRNZW1iZXIoY2xhc3NOYW1lLCBtZW1iZXIpIHtcbiAgICB0aGlzLmFkZENsYXNzKGNsYXNzTmFtZSk7XG4gICAgY29uc3QgdmFsaWRhdGVkQ2xhc3NOYW1lID0gdGhpcy5zcGxpdENsYXNzTmFtZUFuZFR5cGUoY2xhc3NOYW1lKS5jbGFzc05hbWU7XG4gICAgY29uc3QgdGhlQ2xhc3MgPSB0aGlzLmNsYXNzZXMuZ2V0KHZhbGlkYXRlZENsYXNzTmFtZSk7XG4gICAgaWYgKHR5cGVvZiBtZW1iZXIgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGNvbnN0IG1lbWJlclN0cmluZyA9IG1lbWJlci50cmltKCk7XG4gICAgICBpZiAobWVtYmVyU3RyaW5nLnN0YXJ0c1dpdGgoXCI8PFwiKSAmJiBtZW1iZXJTdHJpbmcuZW5kc1dpdGgoXCI+PlwiKSkge1xuICAgICAgICB0aGVDbGFzcy5hbm5vdGF0aW9ucy5wdXNoKHNhbml0aXplVGV4dDIobWVtYmVyU3RyaW5nLnN1YnN0cmluZygyLCBtZW1iZXJTdHJpbmcubGVuZ3RoIC0gMikpKTtcbiAgICAgIH0gZWxzZSBpZiAobWVtYmVyU3RyaW5nLmluZGV4T2YoXCIpXCIpID4gMCkge1xuICAgICAgICB0aGVDbGFzcy5tZXRob2RzLnB1c2gobmV3IENsYXNzTWVtYmVyKG1lbWJlclN0cmluZywgXCJtZXRob2RcIikpO1xuICAgICAgfSBlbHNlIGlmIChtZW1iZXJTdHJpbmcpIHtcbiAgICAgICAgdGhlQ2xhc3MubWVtYmVycy5wdXNoKG5ldyBDbGFzc01lbWJlcihtZW1iZXJTdHJpbmcsIFwiYXR0cmlidXRlXCIpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgYWRkTWVtYmVycyhjbGFzc05hbWUsIG1lbWJlcnMpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShtZW1iZXJzKSkge1xuICAgICAgbWVtYmVycy5yZXZlcnNlKCk7XG4gICAgICBtZW1iZXJzLmZvckVhY2goKG1lbWJlcikgPT4gdGhpcy5hZGRNZW1iZXIoY2xhc3NOYW1lLCBtZW1iZXIpKTtcbiAgICB9XG4gIH1cbiAgYWRkTm90ZSh0ZXh0LCBjbGFzc05hbWUpIHtcbiAgICBjb25zdCBpbmRleCA9IHRoaXMubm90ZXMuc2l6ZTtcbiAgICBjb25zdCBub3RlID0ge1xuICAgICAgaWQ6IGBub3RlJHtpbmRleH1gLFxuICAgICAgY2xhc3M6IGNsYXNzTmFtZSxcbiAgICAgIHRleHQsXG4gICAgICBpbmRleFxuICAgIH07XG4gICAgdGhpcy5ub3Rlcy5zZXQobm90ZS5pZCwgbm90ZSk7XG4gICAgcmV0dXJuIG5vdGUuaWQ7XG4gIH1cbiAgY2xlYW51cExhYmVsKGxhYmVsKSB7XG4gICAgaWYgKGxhYmVsLnN0YXJ0c1dpdGgoXCI6XCIpKSB7XG4gICAgICBsYWJlbCA9IGxhYmVsLnN1YnN0cmluZygxKTtcbiAgICB9XG4gICAgcmV0dXJuIHNhbml0aXplVGV4dDIobGFiZWwudHJpbSgpKTtcbiAgfVxuICAvKipcbiAgICogQ2FsbGVkIGJ5IHBhcnNlciB3aGVuIGFzc2lnbmluZyBjc3NDbGFzcyB0byBhIGNsYXNzXG4gICAqXG4gICAqIEBwYXJhbSBpZHMgLSBDb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiBpZHNcbiAgICogQHBhcmFtIGNsYXNzTmFtZSAtIENsYXNzIHRvIGFkZFxuICAgKi9cbiAgc2V0Q3NzQ2xhc3MoaWRzLCBjbGFzc05hbWUpIHtcbiAgICBpZHMuc3BsaXQoXCIsXCIpLmZvckVhY2goKF9pZCkgPT4ge1xuICAgICAgbGV0IGlkID0gX2lkO1xuICAgICAgaWYgKC9cXGQvLmV4ZWMoX2lkWzBdKSkge1xuICAgICAgICBpZCA9IE1FUk1BSURfRE9NX0lEX1BSRUZJWCArIGlkO1xuICAgICAgfVxuICAgICAgY29uc3QgY2xhc3NOb2RlID0gdGhpcy5jbGFzc2VzLmdldChpZCk7XG4gICAgICBpZiAoY2xhc3NOb2RlKSB7XG4gICAgICAgIGNsYXNzTm9kZS5jc3NDbGFzc2VzICs9IFwiIFwiICsgY2xhc3NOYW1lO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGRlZmluZUNsYXNzKGlkcywgc3R5bGUpIHtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIGlkcykge1xuICAgICAgbGV0IHN0eWxlQ2xhc3MgPSB0aGlzLnN0eWxlQ2xhc3Nlcy5nZXQoaWQpO1xuICAgICAgaWYgKHN0eWxlQ2xhc3MgPT09IHZvaWQgMCkge1xuICAgICAgICBzdHlsZUNsYXNzID0geyBpZCwgc3R5bGVzOiBbXSwgdGV4dFN0eWxlczogW10gfTtcbiAgICAgICAgdGhpcy5zdHlsZUNsYXNzZXMuc2V0KGlkLCBzdHlsZUNsYXNzKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHlsZSkge1xuICAgICAgICBzdHlsZS5mb3JFYWNoKChzKSA9PiB7XG4gICAgICAgICAgaWYgKC9jb2xvci8uZXhlYyhzKSkge1xuICAgICAgICAgICAgY29uc3QgbmV3U3R5bGUgPSBzLnJlcGxhY2UoXCJmaWxsXCIsIFwiYmdGaWxsXCIpO1xuICAgICAgICAgICAgc3R5bGVDbGFzcy50ZXh0U3R5bGVzLnB1c2gobmV3U3R5bGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzdHlsZUNsYXNzLnN0eWxlcy5wdXNoKHMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2xhc3Nlcy5mb3JFYWNoKCh2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAodmFsdWUuY3NzQ2xhc3Nlcy5pbmNsdWRlcyhpZCkpIHtcbiAgICAgICAgICB2YWx1ZS5zdHlsZXMucHVzaCguLi5zdHlsZS5mbGF0TWFwKChzKSA9PiBzLnNwbGl0KFwiLFwiKSkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgLyoqXG4gICAqIENhbGxlZCBieSBwYXJzZXIgd2hlbiBhIHRvb2x0aXAgaXMgZm91bmQsIGUuZy4gYSBjbGlja2FibGUgZWxlbWVudC5cbiAgICpcbiAgICogQHBhcmFtIGlkcyAtIENvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIGlkc1xuICAgKiBAcGFyYW0gdG9vbHRpcCAtIFRvb2x0aXAgdG8gYWRkXG4gICAqL1xuICBzZXRUb29sdGlwKGlkcywgdG9vbHRpcCkge1xuICAgIGlkcy5zcGxpdChcIixcIikuZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgIGlmICh0b29sdGlwICE9PSB2b2lkIDApIHtcbiAgICAgICAgdGhpcy5jbGFzc2VzLmdldChpZCkudG9vbHRpcCA9IHNhbml0aXplVGV4dDIodG9vbHRpcCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgZ2V0VG9vbHRpcChpZCwgbmFtZXNwYWNlKSB7XG4gICAgaWYgKG5hbWVzcGFjZSAmJiB0aGlzLm5hbWVzcGFjZXMuaGFzKG5hbWVzcGFjZSkpIHtcbiAgICAgIHJldHVybiB0aGlzLm5hbWVzcGFjZXMuZ2V0KG5hbWVzcGFjZSkuY2xhc3Nlcy5nZXQoaWQpLnRvb2x0aXA7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNsYXNzZXMuZ2V0KGlkKS50b29sdGlwO1xuICB9XG4gIC8qKlxuICAgKiBDYWxsZWQgYnkgcGFyc2VyIHdoZW4gYSBsaW5rIGlzIGZvdW5kLiBBZGRzIHRoZSBVUkwgdG8gdGhlIHZlcnRleCBkYXRhLlxuICAgKlxuICAgKiBAcGFyYW0gaWRzIC0gQ29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgaWRzXG4gICAqIEBwYXJhbSBsaW5rU3RyIC0gVVJMIHRvIGNyZWF0ZSBhIGxpbmsgZm9yXG4gICAqIEBwYXJhbSB0YXJnZXQgLSBUYXJnZXQgb2YgdGhlIGxpbmssIF9ibGFuayBieSBkZWZhdWx0IGFzIG9yaWdpbmFsbHkgZGVmaW5lZCBpbiB0aGUgc3ZnRHJhdy5qcyBmaWxlXG4gICAqL1xuICBzZXRMaW5rKGlkcywgbGlua1N0ciwgdGFyZ2V0KSB7XG4gICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gICAgaWRzLnNwbGl0KFwiLFwiKS5mb3JFYWNoKChfaWQpID0+IHtcbiAgICAgIGxldCBpZCA9IF9pZDtcbiAgICAgIGlmICgvXFxkLy5leGVjKF9pZFswXSkpIHtcbiAgICAgICAgaWQgPSBNRVJNQUlEX0RPTV9JRF9QUkVGSVggKyBpZDtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHRoZUNsYXNzID0gdGhpcy5jbGFzc2VzLmdldChpZCk7XG4gICAgICBpZiAodGhlQ2xhc3MpIHtcbiAgICAgICAgdGhlQ2xhc3MubGluayA9IHV0aWxzX2RlZmF1bHQuZm9ybWF0VXJsKGxpbmtTdHIsIGNvbmZpZyk7XG4gICAgICAgIGlmIChjb25maWcuc2VjdXJpdHlMZXZlbCA9PT0gXCJzYW5kYm94XCIpIHtcbiAgICAgICAgICB0aGVDbGFzcy5saW5rVGFyZ2V0ID0gXCJfdG9wXCI7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRhcmdldCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgIHRoZUNsYXNzLmxpbmtUYXJnZXQgPSBzYW5pdGl6ZVRleHQyKHRhcmdldCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhlQ2xhc3MubGlua1RhcmdldCA9IFwiX2JsYW5rXCI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLnNldENzc0NsYXNzKGlkcywgXCJjbGlja2FibGVcIik7XG4gIH1cbiAgLyoqXG4gICAqIENhbGxlZCBieSBwYXJzZXIgd2hlbiBhIGNsaWNrIGRlZmluaXRpb24gaXMgZm91bmQuIFJlZ2lzdGVycyBhbiBldmVudCBoYW5kbGVyLlxuICAgKlxuICAgKiBAcGFyYW0gaWRzIC0gQ29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgaWRzXG4gICAqIEBwYXJhbSBmdW5jdGlvbk5hbWUgLSBGdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gY2xpY2tcbiAgICogQHBhcmFtIGZ1bmN0aW9uQXJncyAtIEZ1bmN0aW9uIGFyZ3MgdGhlIGZ1bmN0aW9uIHNob3VsZCBiZSBjYWxsZWQgd2l0aFxuICAgKi9cbiAgc2V0Q2xpY2tFdmVudChpZHMsIGZ1bmN0aW9uTmFtZSwgZnVuY3Rpb25BcmdzKSB7XG4gICAgaWRzLnNwbGl0KFwiLFwiKS5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgdGhpcy5zZXRDbGlja0Z1bmMoaWQsIGZ1bmN0aW9uTmFtZSwgZnVuY3Rpb25BcmdzKTtcbiAgICAgIHRoaXMuY2xhc3Nlcy5nZXQoaWQpLmhhdmVDYWxsYmFjayA9IHRydWU7XG4gICAgfSk7XG4gICAgdGhpcy5zZXRDc3NDbGFzcyhpZHMsIFwiY2xpY2thYmxlXCIpO1xuICB9XG4gIHNldENsaWNrRnVuYyhfZG9tSWQsIGZ1bmN0aW9uTmFtZSwgZnVuY3Rpb25BcmdzKSB7XG4gICAgY29uc3QgZG9tSWQgPSBjb21tb25fZGVmYXVsdC5zYW5pdGl6ZVRleHQoX2RvbUlkLCBnZXRDb25maWcoKSk7XG4gICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gICAgaWYgKGNvbmZpZy5zZWN1cml0eUxldmVsICE9PSBcImxvb3NlXCIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGZ1bmN0aW9uTmFtZSA9PT0gdm9pZCAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGlkID0gZG9tSWQ7XG4gICAgaWYgKHRoaXMuY2xhc3Nlcy5oYXMoaWQpKSB7XG4gICAgICBsZXQgYXJnTGlzdCA9IFtdO1xuICAgICAgaWYgKHR5cGVvZiBmdW5jdGlvbkFyZ3MgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgYXJnTGlzdCA9IGZ1bmN0aW9uQXJncy5zcGxpdCgvLCg/PSg/Oig/OlteXCJdKlwiKXsyfSkqW15cIl0qJCkvKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmdMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgbGV0IGl0ZW0gPSBhcmdMaXN0W2ldLnRyaW0oKTtcbiAgICAgICAgICBpZiAoaXRlbS5zdGFydHNXaXRoKCdcIicpICYmIGl0ZW0uZW5kc1dpdGgoJ1wiJykpIHtcbiAgICAgICAgICAgIGl0ZW0gPSBpdGVtLnN1YnN0cigxLCBpdGVtLmxlbmd0aCAtIDIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhcmdMaXN0W2ldID0gaXRlbTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGFyZ0xpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGFyZ0xpc3QucHVzaChpZCk7XG4gICAgICB9XG4gICAgICB0aGlzLmZ1bmN0aW9ucy5wdXNoKCgpID0+IHtcbiAgICAgICAgY29uc3QgZWxlbUlkID0gdGhpcy5sb29rVXBEb21JZChpZCk7XG4gICAgICAgIGNvbnN0IGVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBbaWQ9XCIke2VsZW1JZH1cIl1gKTtcbiAgICAgICAgaWYgKGVsZW0gIT09IG51bGwpIHtcbiAgICAgICAgICBlbGVtLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgICAgICBcImNsaWNrXCIsXG4gICAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAgIHV0aWxzX2RlZmF1bHQucnVuRnVuYyhmdW5jdGlvbk5hbWUsIC4uLmFyZ0xpc3QpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIGJpbmRGdW5jdGlvbnMoZWxlbWVudCkge1xuICAgIHRoaXMuZnVuY3Rpb25zLmZvckVhY2goKGZ1bikgPT4ge1xuICAgICAgZnVuKGVsZW1lbnQpO1xuICAgIH0pO1xuICB9XG4gIC8vIFV0aWxpdHkgZnVuY3Rpb24gdG8gZXNjYXBlIEhUTUwgbWV0YS1jaGFyYWN0ZXJzXG4gIGVzY2FwZUh0bWwoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8mL2csIFwiJmFtcDtcIikucmVwbGFjZSgvPC9nLCBcIiZsdDtcIikucmVwbGFjZSgvPi9nLCBcIiZndDtcIikucmVwbGFjZSgvXCIvZywgXCImcXVvdDtcIikucmVwbGFjZSgvJy9nLCBcIiYjMzk7XCIpO1xuICB9XG4gIGdldERpcmVjdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb247XG4gIH1cbiAgc2V0RGlyZWN0aW9uKGRpcikge1xuICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyO1xuICB9XG4gIHN0YXRpYyByZXNvbHZlUXVhbGlmaWVkSWQoaWQsIHN0YWNrKSB7XG4gICAgY29uc3QgcHJlZml4ID0gc3RhY2suYXQoLTEpO1xuICAgIHJldHVybiBwcmVmaXggPyBgJHtwcmVmaXh9LiR7aWR9YCA6IGlkO1xuICB9XG4gIHN0YXRpYyBnZXRBbmNlc3RvcklkcyhxdWFsaWZpZWRJZCkge1xuICAgIGNvbnN0IHBhcnRzID0gcXVhbGlmaWVkSWQuc3BsaXQoXCIuXCIpO1xuICAgIGNvbnN0IGlkcyA9IG5ldyBBcnJheShwYXJ0cy5sZW5ndGgpO1xuICAgIGlkc1swXSA9IHBhcnRzWzBdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlkc1tpXSA9IGAke2lkc1tpIC0gMV19LiR7cGFydHNbaV19YDtcbiAgICB9XG4gICAgcmV0dXJuIGlkcztcbiAgfVxuICBjcmVhdGVOYW1lc3BhY2VOb2RlKGlkLCBsYWJlbCwgcGFyZW50SWQsIGV4cGxpY2l0ID0gZmFsc2UpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQsXG4gICAgICBsYWJlbCxcbiAgICAgIGNsYXNzZXM6IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksXG4gICAgICBub3RlczogLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSxcbiAgICAgIGNoaWxkcmVuOiAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLFxuICAgICAgZG9tSWQ6IE1FUk1BSURfRE9NX0lEX1BSRUZJWCArIGlkICsgXCItXCIgKyB0aGlzLm5hbWVzcGFjZUNvdW50ZXIrKyxcbiAgICAgIHBhcmVudDogcGFyZW50SWQsXG4gICAgICBleHBsaWNpdFxuICAgIH07XG4gIH1cbiAgbGlua1BhcmVudENoaWxkKHBhcmVudElkLCBjaGlsZElkKSB7XG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5uYW1lc3BhY2VzLmdldChwYXJlbnRJZCk7XG4gICAgY29uc3QgY2hpbGQgPSB0aGlzLm5hbWVzcGFjZXMuZ2V0KGNoaWxkSWQpO1xuICAgIGlmICghcGFyZW50IHx8ICFjaGlsZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIXBhcmVudC5jaGlsZHJlbi5oYXMoY2hpbGRJZCkpIHtcbiAgICAgIHBhcmVudC5jaGlsZHJlbi5zZXQoY2hpbGRJZCwgY2hpbGQpO1xuICAgIH1cbiAgICBjaGlsZC5wYXJlbnQgPz89IHBhcmVudElkO1xuICB9XG4gIGFkZE5hbWVzcGFjZShpZCwgbGFiZWwpIHtcbiAgICBjb25zdCBxdWFsaWZpZWRJZCA9IF9DbGFzc0RCLnJlc29sdmVRdWFsaWZpZWRJZChpZCwgdGhpcy5uYW1lc3BhY2VTdGFjayk7XG4gICAgdGhpcy5uYW1lc3BhY2VTdGFjay5wdXNoKHF1YWxpZmllZElkKTtcbiAgICBpZiAodGhpcy5uYW1lc3BhY2VzLmhhcyhxdWFsaWZpZWRJZCkpIHtcbiAgICAgIGNvbnN0IGV4aXN0aW5nID0gdGhpcy5uYW1lc3BhY2VzLmdldChxdWFsaWZpZWRJZCk7XG4gICAgICBleGlzdGluZy5leHBsaWNpdCA9IHRydWU7XG4gICAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgZXhpc3RpbmcubGFiZWwgPSBsYWJlbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBxdWFsaWZpZWRJZDtcbiAgICB9XG4gICAgY29uc3QgcGFydHMgPSBxdWFsaWZpZWRJZC5zcGxpdChcIi5cIik7XG4gICAgY29uc3QgYW5jZXN0b3JJZHMgPSBfQ2xhc3NEQi5nZXRBbmNlc3RvcklkcyhxdWFsaWZpZWRJZCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbmNlc3Rvcklkcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY3VycmVudElkID0gYW5jZXN0b3JJZHNbaV07XG4gICAgICBjb25zdCBwYXJlbnRJZCA9IGkgPiAwID8gYW5jZXN0b3JJZHNbaSAtIDFdIDogdm9pZCAwO1xuICAgICAgY29uc3QgaXNMZWFmID0gaSA9PT0gYW5jZXN0b3JJZHMubGVuZ3RoIC0gMTtcbiAgICAgIGNvbnN0IG5vZGVMYWJlbCA9IGlzTGVhZiAmJiBsYWJlbCA/IGxhYmVsIDogcGFydHNbaV07XG4gICAgICBpZiAoIXRoaXMubmFtZXNwYWNlcy5oYXMoY3VycmVudElkKSkge1xuICAgICAgICB0aGlzLm5hbWVzcGFjZXMuc2V0KFxuICAgICAgICAgIGN1cnJlbnRJZCxcbiAgICAgICAgICB0aGlzLmNyZWF0ZU5hbWVzcGFjZU5vZGUoY3VycmVudElkLCBub2RlTGFiZWwsIHBhcmVudElkLCBpc0xlYWYpXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKGlzTGVhZikge1xuICAgICAgICB0aGlzLm5hbWVzcGFjZXMuZ2V0KGN1cnJlbnRJZCkuZXhwbGljaXQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHBhcmVudElkKSB7XG4gICAgICAgIHRoaXMubGlua1BhcmVudENoaWxkKHBhcmVudElkLCBjdXJyZW50SWQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcXVhbGlmaWVkSWQ7XG4gIH1cbiAgcG9wTmFtZXNwYWNlKCkge1xuICAgIHRoaXMubmFtZXNwYWNlU3RhY2sucG9wKCk7XG4gIH1cbiAgZ2V0TmFtZXNwYWNlKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lc3BhY2VzLmdldChuYW1lKTtcbiAgfVxuICBnZXROYW1lc3BhY2VzKCkge1xuICAgIHJldHVybiB0aGlzLm5hbWVzcGFjZXM7XG4gIH1cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIGNhbGxlZCBieSBwYXJzZXIgd2hlbiBhIG5hbWVzcGFjZSBkZWZpbml0aW9uIGhhcyBiZWVuIGZvdW5kLlxuICAgKlxuICAgKiBAcGFyYW0gaWQgLSBJRCBvZiB0aGUgbmFtZXNwYWNlIHRvIGFkZFxuICAgKiBAcGFyYW0gY2xhc3NOYW1lcyAtIElEcyBvZiB0aGUgY2xhc3MgdG8gYWRkXG4gICAqIEBwYXJhbSBub3RlTmFtZXMgLSBJRHMgb2YgdGhlIG5vdGVzIHRvIGFkZFxuICAgKiBAcHVibGljXG4gICAqL1xuICBhZGRDbGFzc2VzVG9OYW1lc3BhY2UoaWQsIGNsYXNzTmFtZXMsIG5vdGVOYW1lcykge1xuICAgIGlmICghdGhpcy5uYW1lc3BhY2VzLmhhcyhpZCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZm9yIChjb25zdCBuYW1lIG9mIGNsYXNzTmFtZXMpIHtcbiAgICAgIGNvbnN0IHsgY2xhc3NOYW1lIH0gPSB0aGlzLnNwbGl0Q2xhc3NOYW1lQW5kVHlwZShuYW1lKTtcbiAgICAgIGNvbnN0IGNsYXNzTm9kZSA9IHRoaXMuZ2V0Q2xhc3MoY2xhc3NOYW1lKTtcbiAgICAgIGNsYXNzTm9kZS5wYXJlbnQgPSBpZDtcbiAgICAgIHRoaXMubmFtZXNwYWNlcy5nZXQoaWQpLmNsYXNzZXMuc2V0KGNsYXNzTmFtZSwgY2xhc3NOb2RlKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBub3RlTmFtZSBvZiBub3RlTmFtZXMpIHtcbiAgICAgIGNvbnN0IG5vdGVOb2RlID0gdGhpcy5nZXROb3RlKG5vdGVOYW1lKTtcbiAgICAgIG5vdGVOb2RlLnBhcmVudCA9IGlkO1xuICAgICAgdGhpcy5uYW1lc3BhY2VzLmdldChpZCkubm90ZXMuc2V0KG5vdGVOYW1lLCBub3RlTm9kZSk7XG4gICAgfVxuICB9XG4gIHNldENzc1N0eWxlKGlkLCBzdHlsZXMpIHtcbiAgICBjb25zdCB0aGlzQ2xhc3MgPSB0aGlzLmNsYXNzZXMuZ2V0KGlkKTtcbiAgICBpZiAoIXN0eWxlcyB8fCAhdGhpc0NsYXNzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGZvciAoY29uc3QgcyBvZiBzdHlsZXMpIHtcbiAgICAgIGlmIChzLmluY2x1ZGVzKFwiLFwiKSkge1xuICAgICAgICB0aGlzQ2xhc3Muc3R5bGVzLnB1c2goLi4ucy5zcGxpdChcIixcIikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpc0NsYXNzLnN0eWxlcy5wdXNoKHMpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvKipcbiAgICogR2V0cyB0aGUgYXJyb3cgbWFya2VyIGZvciBhIHR5cGUgaW5kZXhcbiAgICpcbiAgICogQHBhcmFtIHR5cGUgLSBUaGUgdHlwZSB0byBsb29rIGZvclxuICAgKiBAcmV0dXJucyBUaGUgYXJyb3cgbWFya2VyXG4gICAqL1xuICBnZXRBcnJvd01hcmtlcih0eXBlKSB7XG4gICAgbGV0IG1hcmtlcjtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgbWFya2VyID0gXCJhZ2dyZWdhdGlvblwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgbWFya2VyID0gXCJleHRlbnNpb25cIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIG1hcmtlciA9IFwiY29tcG9zaXRpb25cIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIG1hcmtlciA9IFwiZGVwZW5kZW5jeVwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgbWFya2VyID0gXCJsb2xsaXBvcFwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIG1hcmtlciA9IFwibm9uZVwiO1xuICAgIH1cbiAgICByZXR1cm4gbWFya2VyO1xuICB9XG4gIC8qKlxuICAgKiBXYWxrcyB1cCB0aGUgbmFtZXNwYWNlIHRyZWUgZnJvbSB0aGUgZ2l2ZW4gaWQgYW5kIHJldHVybnMgdGhlIG5lYXJlc3QgYW5jZXN0b3JcbiAgICogKG9yIHRoZSBpZCBpdHNlbGYpIHRoYXQgaXMgbWFya2VkIGFzIGV4cGxpY2l0LiBVc2VkIGJ5IGNvbXBhY3QgcmVuZGVyaW5nIG1vZGVcbiAgICogdG8gcmVhc3NpZ24gY2hpbGRyZW4gdG8gdGhlIG5lYXJlc3QgdXNlci1kZWNsYXJlZCBuYW1lc3BhY2UuXG4gICAqL1xuICByZXNvbHZlRXhwbGljaXRBbmNlc3RvcihpZCkge1xuICAgIGxldCBjdXJyZW50ID0gaWQ7XG4gICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgIGNvbnN0IG5zID0gdGhpcy5uYW1lc3BhY2VzLmdldChjdXJyZW50KTtcbiAgICAgIGlmICghbnMpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgIH1cbiAgICAgIGlmIChucy5leHBsaWNpdCkge1xuICAgICAgICByZXR1cm4gY3VycmVudDtcbiAgICAgIH1cbiAgICAgIGN1cnJlbnQgPSBucy5wYXJlbnQ7XG4gICAgfVxuICAgIHJldHVybiB2b2lkIDA7XG4gIH1cbiAgZ2V0RGF0YSgpIHtcbiAgICBjb25zdCBub2RlcyA9IFtdO1xuICAgIGNvbnN0IGVkZ2VzID0gW107XG4gICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gICAgY29uc3QgaGllcmFyY2hpY2FsID0gY29uZmlnLmNsYXNzPy5oaWVyYXJjaGljYWxOYW1lc3BhY2VzID8/IHRydWU7XG4gICAgZm9yIChjb25zdCBuYW1lc3BhY2Ugb2YgdGhpcy5uYW1lc3BhY2VzLnZhbHVlcygpKSB7XG4gICAgICBpZiAoIWhpZXJhcmNoaWNhbCAmJiAhbmFtZXNwYWNlLmV4cGxpY2l0KSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3Qgbm9kZSA9IHtcbiAgICAgICAgaWQ6IG5hbWVzcGFjZS5pZCxcbiAgICAgICAgbGFiZWw6IGhpZXJhcmNoaWNhbCA/IG5hbWVzcGFjZS5sYWJlbCA6IG5hbWVzcGFjZS5pZCxcbiAgICAgICAgaXNHcm91cDogdHJ1ZSxcbiAgICAgICAgcGFkZGluZzogY29uZmlnLmNsYXNzLnBhZGRpbmcgPz8gMTYsXG4gICAgICAgIC8vIHBhcmVudCBub2RlIG11c3QgYmUgb25lIG9mIFtyZWN0LCByb3VuZGVkV2l0aFRpdGxlLCBub3RlR3JvdXAsIGRpdmlkZXJdXG4gICAgICAgIHNoYXBlOiBcInJlY3RcIixcbiAgICAgICAgY3NzU3R5bGVzOiBbXSxcbiAgICAgICAgbG9vazogY29uZmlnLmxvb2ssXG4gICAgICAgIHBhcmVudElkOiBoaWVyYXJjaGljYWwgPyBuYW1lc3BhY2UucGFyZW50IDogdm9pZCAwXG4gICAgICB9O1xuICAgICAgbm9kZXMucHVzaChub2RlKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBjbGFzc05vZGUgb2YgdGhpcy5jbGFzc2VzLnZhbHVlcygpKSB7XG4gICAgICBjb25zdCBwYXJlbnRJZCA9IGhpZXJhcmNoaWNhbCA/IGNsYXNzTm9kZS5wYXJlbnQgOiB0aGlzLnJlc29sdmVFeHBsaWNpdEFuY2VzdG9yKGNsYXNzTm9kZS5wYXJlbnQpO1xuICAgICAgY29uc3Qgbm9kZSA9IHtcbiAgICAgICAgLi4uY2xhc3NOb2RlLFxuICAgICAgICB0eXBlOiB2b2lkIDAsXG4gICAgICAgIGlzR3JvdXA6IGZhbHNlLFxuICAgICAgICBwYXJlbnRJZCxcbiAgICAgICAgbG9vazogY29uZmlnLmxvb2tcbiAgICAgIH07XG4gICAgICBub2Rlcy5wdXNoKG5vZGUpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IG5vdGUgb2YgdGhpcy5ub3Rlcy52YWx1ZXMoKSkge1xuICAgICAgY29uc3Qgbm90ZVBhcmVudElkID0gaGllcmFyY2hpY2FsID8gbm90ZS5wYXJlbnQgOiB0aGlzLnJlc29sdmVFeHBsaWNpdEFuY2VzdG9yKG5vdGUucGFyZW50KTtcbiAgICAgIGNvbnN0IG5vdGVOb2RlID0ge1xuICAgICAgICBpZDogbm90ZS5pZCxcbiAgICAgICAgbGFiZWw6IG5vdGUudGV4dCxcbiAgICAgICAgaXNHcm91cDogZmFsc2UsXG4gICAgICAgIHNoYXBlOiBcIm5vdGVcIixcbiAgICAgICAgcGFkZGluZzogY29uZmlnLmNsYXNzLnBhZGRpbmcgPz8gNixcbiAgICAgICAgY3NzU3R5bGVzOiBbXG4gICAgICAgICAgXCJ0ZXh0LWFsaWduOiBsZWZ0XCIsXG4gICAgICAgICAgXCJ3aGl0ZS1zcGFjZTogbm93cmFwXCIsXG4gICAgICAgICAgYGZpbGw6ICR7Y29uZmlnLnRoZW1lVmFyaWFibGVzLm5vdGVCa2dDb2xvcn1gLFxuICAgICAgICAgIGBzdHJva2U6ICR7Y29uZmlnLnRoZW1lVmFyaWFibGVzLm5vdGVCb3JkZXJDb2xvcn1gXG4gICAgICAgIF0sXG4gICAgICAgIGxvb2s6IGNvbmZpZy5sb29rLFxuICAgICAgICBwYXJlbnRJZDogbm90ZVBhcmVudElkLFxuICAgICAgICBsYWJlbFR5cGU6IFwibWFya2Rvd25cIlxuICAgICAgfTtcbiAgICAgIG5vZGVzLnB1c2gobm90ZU5vZGUpO1xuICAgICAgY29uc3Qgbm90ZUNsYXNzSWQgPSB0aGlzLmNsYXNzZXMuZ2V0KG5vdGUuY2xhc3MpPy5pZDtcbiAgICAgIGlmIChub3RlQ2xhc3NJZCkge1xuICAgICAgICBjb25zdCBlZGdlID0ge1xuICAgICAgICAgIGlkOiBgZWRnZU5vdGUke25vdGUuaW5kZXh9YCxcbiAgICAgICAgICBzdGFydDogbm90ZS5pZCxcbiAgICAgICAgICBlbmQ6IG5vdGVDbGFzc0lkLFxuICAgICAgICAgIHR5cGU6IFwibm9ybWFsXCIsXG4gICAgICAgICAgdGhpY2tuZXNzOiBcIm5vcm1hbFwiLFxuICAgICAgICAgIGNsYXNzZXM6IFwicmVsYXRpb25cIixcbiAgICAgICAgICBhcnJvd1R5cGVTdGFydDogXCJub25lXCIsXG4gICAgICAgICAgYXJyb3dUeXBlRW5kOiBcIm5vbmVcIixcbiAgICAgICAgICBhcnJvd2hlYWRTdHlsZTogXCJcIixcbiAgICAgICAgICBsYWJlbFN0eWxlOiBbXCJcIl0sXG4gICAgICAgICAgc3R5bGU6IFtcImZpbGw6IG5vbmVcIl0sXG4gICAgICAgICAgcGF0dGVybjogXCJkb3R0ZWRcIixcbiAgICAgICAgICBsb29rOiBjb25maWcubG9va1xuICAgICAgICB9O1xuICAgICAgICBlZGdlcy5wdXNoKGVkZ2UpO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IF9pbnRlcmZhY2Ugb2YgdGhpcy5pbnRlcmZhY2VzKSB7XG4gICAgICBjb25zdCBpbnRlcmZhY2VOb2RlID0ge1xuICAgICAgICBpZDogX2ludGVyZmFjZS5pZCxcbiAgICAgICAgbGFiZWw6IF9pbnRlcmZhY2UubGFiZWwsXG4gICAgICAgIGlzR3JvdXA6IGZhbHNlLFxuICAgICAgICBzaGFwZTogXCJyZWN0XCIsXG4gICAgICAgIGNzc1N0eWxlczogW1wib3BhY2l0eTogMDtcIl0sXG4gICAgICAgIGxvb2s6IGNvbmZpZy5sb29rXG4gICAgICB9O1xuICAgICAgbm9kZXMucHVzaChpbnRlcmZhY2VOb2RlKTtcbiAgICB9XG4gICAgbGV0IGNudCA9IDA7XG4gICAgZm9yIChjb25zdCBjbGFzc1JlbGF0aW9uIG9mIHRoaXMucmVsYXRpb25zKSB7XG4gICAgICBjbnQrKztcbiAgICAgIGNvbnN0IGVkZ2UgPSB7XG4gICAgICAgIGlkOiBnZXRFZGdlSWQoY2xhc3NSZWxhdGlvbi5pZDEsIGNsYXNzUmVsYXRpb24uaWQyLCB7XG4gICAgICAgICAgcHJlZml4OiBcImlkXCIsXG4gICAgICAgICAgY291bnRlcjogY250XG4gICAgICAgIH0pLFxuICAgICAgICBzdGFydDogY2xhc3NSZWxhdGlvbi5pZDEsXG4gICAgICAgIGVuZDogY2xhc3NSZWxhdGlvbi5pZDIsXG4gICAgICAgIHR5cGU6IFwibm9ybWFsXCIsXG4gICAgICAgIGxhYmVsOiBjbGFzc1JlbGF0aW9uLnRpdGxlLFxuICAgICAgICBsYWJlbHBvczogXCJjXCIsXG4gICAgICAgIHRoaWNrbmVzczogXCJub3JtYWxcIixcbiAgICAgICAgY2xhc3NlczogXCJyZWxhdGlvblwiLFxuICAgICAgICBhcnJvd1R5cGVTdGFydDogdGhpcy5nZXRBcnJvd01hcmtlcihjbGFzc1JlbGF0aW9uLnJlbGF0aW9uLnR5cGUxKSxcbiAgICAgICAgYXJyb3dUeXBlRW5kOiB0aGlzLmdldEFycm93TWFya2VyKGNsYXNzUmVsYXRpb24ucmVsYXRpb24udHlwZTIpLFxuICAgICAgICBzdGFydExhYmVsUmlnaHQ6IGNsYXNzUmVsYXRpb24ucmVsYXRpb25UaXRsZTEgPT09IFwibm9uZVwiID8gXCJcIiA6IGNsYXNzUmVsYXRpb24ucmVsYXRpb25UaXRsZTEsXG4gICAgICAgIGVuZExhYmVsTGVmdDogY2xhc3NSZWxhdGlvbi5yZWxhdGlvblRpdGxlMiA9PT0gXCJub25lXCIgPyBcIlwiIDogY2xhc3NSZWxhdGlvbi5yZWxhdGlvblRpdGxlMixcbiAgICAgICAgYXJyb3doZWFkU3R5bGU6IFwiXCIsXG4gICAgICAgIGxhYmVsU3R5bGU6IFtcImRpc3BsYXk6IGlubGluZS1ibG9ja1wiXSxcbiAgICAgICAgc3R5bGU6IGNsYXNzUmVsYXRpb24uc3R5bGUgfHwgXCJcIixcbiAgICAgICAgcGF0dGVybjogY2xhc3NSZWxhdGlvbi5yZWxhdGlvbi5saW5lVHlwZSA9PSAxID8gXCJkYXNoZWRcIiA6IFwic29saWRcIixcbiAgICAgICAgbG9vazogY29uZmlnLmxvb2ssXG4gICAgICAgIGxhYmVsVHlwZTogXCJtYXJrZG93blwiXG4gICAgICB9O1xuICAgICAgZWRnZXMucHVzaChlZGdlKTtcbiAgICB9XG4gICAgcmV0dXJuIHsgbm9kZXMsIGVkZ2VzLCBvdGhlcjoge30sIGNvbmZpZywgZGlyZWN0aW9uOiB0aGlzLmdldERpcmVjdGlvbigpIH07XG4gIH1cbn07XG5cbi8vIHNyYy9kaWFncmFtcy9jbGFzcy9zdHlsZXMuanNcbnZhciBnZXRTdHlsZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChvcHRpb25zKSA9PiBgZy5jbGFzc0dyb3VwIHRleHQge1xuICBmaWxsOiAke29wdGlvbnMubm9kZUJvcmRlciB8fCBvcHRpb25zLmNsYXNzVGV4dH07XG4gIHN0cm9rZTogbm9uZTtcbiAgZm9udC1mYW1pbHk6ICR7b3B0aW9ucy5mb250RmFtaWx5fTtcbiAgZm9udC1zaXplOiAxMHB4O1xuXG4gIC50aXRsZSB7XG4gICAgZm9udC13ZWlnaHQ6IGJvbGRlcjtcbiAgfVxuXG59XG5cbiAgLmNsdXN0ZXItbGFiZWwgdGV4dCB7XG4gICAgZmlsbDogJHtvcHRpb25zLnRpdGxlQ29sb3J9O1xuICB9XG4gIC5jbHVzdGVyLWxhYmVsIHNwYW4ge1xuICAgIGNvbG9yOiAke29wdGlvbnMudGl0bGVDb2xvcn07XG4gIH1cbiAgLmNsdXN0ZXItbGFiZWwgc3BhbiBwIHtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAgfVxuXG4gIC5jbHVzdGVyIHJlY3Qge1xuICAgIGZpbGw6ICR7b3B0aW9ucy5jbHVzdGVyQmtnfTtcbiAgICBzdHJva2U6ICR7b3B0aW9ucy5jbHVzdGVyQm9yZGVyfTtcbiAgICBzdHJva2Utd2lkdGg6IDFweDtcbiAgfVxuXG4gIC5jbHVzdGVyIHRleHQge1xuICAgIGZpbGw6ICR7b3B0aW9ucy50aXRsZUNvbG9yfTtcbiAgfVxuXG4gIC5jbHVzdGVyIHNwYW4ge1xuICAgIGNvbG9yOiAke29wdGlvbnMudGl0bGVDb2xvcn07XG4gIH1cblxuLm5vZGVMYWJlbCwgLmVkZ2VMYWJlbCB7XG4gIGNvbG9yOiAke29wdGlvbnMuY2xhc3NUZXh0fTtcbn1cblxuLm5vdGVMYWJlbCAubm9kZUxhYmVsLCAubm90ZUxhYmVsIC5lZGdlTGFiZWwge1xuICBjb2xvcjogJHtvcHRpb25zLm5vdGVUZXh0Q29sb3J9O1xufVxuLmVkZ2VMYWJlbCAubGFiZWwgcmVjdCB7XG4gIGZpbGw6ICR7b3B0aW9ucy5tYWluQmtnfTtcbn1cbi5sYWJlbCB0ZXh0IHtcbiAgZmlsbDogJHtvcHRpb25zLmNsYXNzVGV4dH07XG59XG5cbi5sYWJlbEJrZyB7XG4gIGJhY2tncm91bmQ6ICR7b3B0aW9ucy5tYWluQmtnfTtcbn1cbi5lZGdlTGFiZWwgLmxhYmVsIHNwYW4ge1xuICBiYWNrZ3JvdW5kOiAke29wdGlvbnMubWFpbkJrZ307XG59XG5cbi5jbGFzc1RpdGxlIHtcbiAgZm9udC13ZWlnaHQ6IGJvbGRlcjtcbn1cbi5ub2RlIHJlY3QsXG4gIC5ub2RlIGNpcmNsZSxcbiAgLm5vZGUgZWxsaXBzZSxcbiAgLm5vZGUgcG9seWdvbixcbiAgLm5vZGUgcGF0aCB7XG4gICAgZmlsbDogJHtvcHRpb25zLm1haW5Ca2d9O1xuICAgIHN0cm9rZTogJHtvcHRpb25zLm5vZGVCb3JkZXJ9O1xuICAgIHN0cm9rZS13aWR0aDogJHtvcHRpb25zLnN0cm9rZVdpZHRofTtcbiAgfVxuXG5cbi5kaXZpZGVyIHtcbiAgc3Ryb2tlOiAke29wdGlvbnMubm9kZUJvcmRlcn07XG4gIHN0cm9rZS13aWR0aDogMTtcbn1cblxuZy5jbGlja2FibGUge1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG5cbmcuY2xhc3NHcm91cCByZWN0IHtcbiAgZmlsbDogJHtvcHRpb25zLm1haW5Ca2d9O1xuICBzdHJva2U6ICR7b3B0aW9ucy5ub2RlQm9yZGVyfTtcbn1cblxuZy5jbGFzc0dyb3VwIGxpbmUge1xuICBzdHJva2U6ICR7b3B0aW9ucy5ub2RlQm9yZGVyfTtcbiAgc3Ryb2tlLXdpZHRoOiAxO1xufVxuXG4uY2xhc3NMYWJlbCAuYm94IHtcbiAgc3Ryb2tlOiBub25lO1xuICBzdHJva2Utd2lkdGg6IDA7XG4gIGZpbGw6ICR7b3B0aW9ucy5tYWluQmtnfTtcbiAgb3BhY2l0eTogMC41O1xufVxuXG4uY2xhc3NMYWJlbCAubGFiZWwge1xuICBmaWxsOiAke29wdGlvbnMubm9kZUJvcmRlcn07XG4gIGZvbnQtc2l6ZTogMTBweDtcbn1cblxuLnJlbGF0aW9uIHtcbiAgc3Ryb2tlOiAke29wdGlvbnMubGluZUNvbG9yfTtcbiAgc3Ryb2tlLXdpZHRoOiAke29wdGlvbnMuc3Ryb2tlV2lkdGh9O1xuICBmaWxsOiBub25lO1xufVxuXG4uZGFzaGVkLWxpbmV7XG4gIHN0cm9rZS1kYXNoYXJyYXk6IDM7XG59XG5cbi5kb3R0ZWQtbGluZXtcbiAgc3Ryb2tlLWRhc2hhcnJheTogMSAyO1xufVxuXG5baWQkPVwiLWNvbXBvc2l0aW9uU3RhcnRcIl0sIC5jb21wb3NpdGlvbiB7XG4gIGZpbGw6ICR7b3B0aW9ucy5saW5lQ29sb3J9ICFpbXBvcnRhbnQ7XG4gIHN0cm9rZTogJHtvcHRpb25zLmxpbmVDb2xvcn0gIWltcG9ydGFudDtcbiAgc3Ryb2tlLXdpZHRoOiAxO1xufVxuXG5baWQkPVwiLWNvbXBvc2l0aW9uRW5kXCJdLCAuY29tcG9zaXRpb24ge1xuICBmaWxsOiAke29wdGlvbnMubGluZUNvbG9yfSAhaW1wb3J0YW50O1xuICBzdHJva2U6ICR7b3B0aW9ucy5saW5lQ29sb3J9ICFpbXBvcnRhbnQ7XG4gIHN0cm9rZS13aWR0aDogMTtcbn1cblxuW2lkJD1cIi1kZXBlbmRlbmN5U3RhcnRcIl0sIC5kZXBlbmRlbmN5IHtcbiAgZmlsbDogJHtvcHRpb25zLmxpbmVDb2xvcn0gIWltcG9ydGFudDtcbiAgc3Ryb2tlOiAke29wdGlvbnMubGluZUNvbG9yfSAhaW1wb3J0YW50O1xuICBzdHJva2Utd2lkdGg6IDE7XG59XG5cbltpZCQ9XCItZGVwZW5kZW5jeUVuZFwiXSwgLmRlcGVuZGVuY3kge1xuICBmaWxsOiAke29wdGlvbnMubGluZUNvbG9yfSAhaW1wb3J0YW50O1xuICBzdHJva2U6ICR7b3B0aW9ucy5saW5lQ29sb3J9ICFpbXBvcnRhbnQ7XG4gIHN0cm9rZS13aWR0aDogMTtcbn1cblxuW2lkJD1cIi1leHRlbnNpb25TdGFydFwiXSwgLmV4dGVuc2lvbiB7XG4gIGZpbGw6IHRyYW5zcGFyZW50ICFpbXBvcnRhbnQ7XG4gIHN0cm9rZTogJHtvcHRpb25zLmxpbmVDb2xvcn0gIWltcG9ydGFudDtcbiAgc3Ryb2tlLXdpZHRoOiAxO1xufVxuXG5baWQkPVwiLWV4dGVuc2lvbkVuZFwiXSwgLmV4dGVuc2lvbiB7XG4gIGZpbGw6IHRyYW5zcGFyZW50ICFpbXBvcnRhbnQ7XG4gIHN0cm9rZTogJHtvcHRpb25zLmxpbmVDb2xvcn0gIWltcG9ydGFudDtcbiAgc3Ryb2tlLXdpZHRoOiAxO1xufVxuXG5baWQkPVwiLWFnZ3JlZ2F0aW9uU3RhcnRcIl0sIC5hZ2dyZWdhdGlvbiB7XG4gIGZpbGw6IHRyYW5zcGFyZW50ICFpbXBvcnRhbnQ7XG4gIHN0cm9rZTogJHtvcHRpb25zLmxpbmVDb2xvcn0gIWltcG9ydGFudDtcbiAgc3Ryb2tlLXdpZHRoOiAxO1xufVxuXG5baWQkPVwiLWFnZ3JlZ2F0aW9uRW5kXCJdLCAuYWdncmVnYXRpb24ge1xuICBmaWxsOiB0cmFuc3BhcmVudCAhaW1wb3J0YW50O1xuICBzdHJva2U6ICR7b3B0aW9ucy5saW5lQ29sb3J9ICFpbXBvcnRhbnQ7XG4gIHN0cm9rZS13aWR0aDogMTtcbn1cblxuW2lkJD1cIi1sb2xsaXBvcFN0YXJ0XCJdLCAubG9sbGlwb3Age1xuICBmaWxsOiAke29wdGlvbnMubWFpbkJrZ30gIWltcG9ydGFudDtcbiAgc3Ryb2tlOiAke29wdGlvbnMubGluZUNvbG9yfSAhaW1wb3J0YW50O1xuICBzdHJva2Utd2lkdGg6IDE7XG59XG5cbltpZCQ9XCItbG9sbGlwb3BFbmRcIl0sIC5sb2xsaXBvcCB7XG4gIGZpbGw6ICR7b3B0aW9ucy5tYWluQmtnfSAhaW1wb3J0YW50O1xuICBzdHJva2U6ICR7b3B0aW9ucy5saW5lQ29sb3J9ICFpbXBvcnRhbnQ7XG4gIHN0cm9rZS13aWR0aDogMTtcbn1cblxuLmVkZ2VUZXJtaW5hbHMge1xuICBmb250LXNpemU6IDExcHg7XG4gIGxpbmUtaGVpZ2h0OiBpbml0aWFsO1xufVxuXG4uY2xhc3NUaXRsZVRleHQge1xuICB0ZXh0LWFuY2hvcjogbWlkZGxlO1xuICBmb250LXNpemU6IDE4cHg7XG4gIGZpbGw6ICR7b3B0aW9ucy50ZXh0Q29sb3J9O1xufVxuXG4uZWRnZUxhYmVsW2RhdGEtbG9vaz1cIm5lb1wiXSB7XG4gIGJhY2tncm91bmQtY29sb3I6ICR7b3B0aW9ucy5lZGdlTGFiZWxCYWNrZ3JvdW5kfTtcbiAgcCB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogJHtvcHRpb25zLmVkZ2VMYWJlbEJhY2tncm91bmR9O1xuICB9XG4gIHJlY3Qge1xuICAgIG9wYWNpdHk6IDAuNTtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke29wdGlvbnMuZWRnZUxhYmVsQmFja2dyb3VuZH07XG4gICAgZmlsbDogJHtvcHRpb25zLmVkZ2VMYWJlbEJhY2tncm91bmR9O1xuICB9XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbn1cbiAgJHtnZXRJY29uU3R5bGVzKCl9XG5gLCBcImdldFN0eWxlc1wiKTtcbnZhciBzdHlsZXNfZGVmYXVsdCA9IGdldFN0eWxlcztcblxuLy8gc3JjL2RpYWdyYW1zL2NsYXNzL2NsYXNzUmVuZGVyZXItdjMtdW5pZmllZC50c1xudmFyIGdldERpciA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHBhcnNlZEl0ZW0sIGRlZmF1bHREaXIgPSBcIlRCXCIpID0+IHtcbiAgaWYgKCFwYXJzZWRJdGVtLmRvYykge1xuICAgIHJldHVybiBkZWZhdWx0RGlyO1xuICB9XG4gIGxldCBkaXIgPSBkZWZhdWx0RGlyO1xuICBmb3IgKGNvbnN0IHBhcnNlZEl0ZW1Eb2Mgb2YgcGFyc2VkSXRlbS5kb2MpIHtcbiAgICBpZiAocGFyc2VkSXRlbURvYy5zdG10ID09PSBcImRpclwiKSB7XG4gICAgICBkaXIgPSBwYXJzZWRJdGVtRG9jLnZhbHVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGlyO1xufSwgXCJnZXREaXJcIik7XG52YXIgZ2V0Q2xhc3NlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24odGV4dCwgZGlhZ3JhbU9iaikge1xuICByZXR1cm4gZGlhZ3JhbU9iai5kYi5nZXRDbGFzc2VzKCk7XG59LCBcImdldENsYXNzZXNcIik7XG52YXIgZHJhdyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgZnVuY3Rpb24odGV4dCwgaWQsIF92ZXJzaW9uLCBkaWFnKSB7XG4gIGxvZy5pbmZvKFwiUkVGMDpcIik7XG4gIGxvZy5pbmZvKFwiRHJhd2luZyBjbGFzcyBkaWFncmFtICh2MylcIiwgaWQpO1xuICBjb25zdCB7IHNlY3VyaXR5TGV2ZWwsIHN0YXRlOiBjb25mLCBsYXlvdXQgfSA9IGdldENvbmZpZygpO1xuICBkaWFnLmRiLnNldERpYWdyYW1JZChpZCk7XG4gIGNvbnN0IGRhdGE0TGF5b3V0ID0gZGlhZy5kYi5nZXREYXRhKCk7XG4gIGNvbnN0IHN2ZyA9IGdldERpYWdyYW1FbGVtZW50KGlkLCBzZWN1cml0eUxldmVsKTtcbiAgZGF0YTRMYXlvdXQudHlwZSA9IGRpYWcudHlwZTtcbiAgZGF0YTRMYXlvdXQubGF5b3V0QWxnb3JpdGhtID0gZ2V0UmVnaXN0ZXJlZExheW91dEFsZ29yaXRobShsYXlvdXQpO1xuICBkYXRhNExheW91dC5ub2RlU3BhY2luZyA9IGNvbmY/Lm5vZGVTcGFjaW5nIHx8IDUwO1xuICBkYXRhNExheW91dC5yYW5rU3BhY2luZyA9IGNvbmY/LnJhbmtTcGFjaW5nIHx8IDUwO1xuICBkYXRhNExheW91dC5tYXJrZXJzID0gW1wiYWdncmVnYXRpb25cIiwgXCJleHRlbnNpb25cIiwgXCJjb21wb3NpdGlvblwiLCBcImRlcGVuZGVuY3lcIiwgXCJsb2xsaXBvcFwiXTtcbiAgZGF0YTRMYXlvdXQuZGlhZ3JhbUlkID0gaWQ7XG4gIGF3YWl0IHJlbmRlcihkYXRhNExheW91dCwgc3ZnKTtcbiAgY29uc3QgcGFkZGluZyA9IDg7XG4gIHV0aWxzX2RlZmF1bHQuaW5zZXJ0VGl0bGUoXG4gICAgc3ZnLFxuICAgIFwiY2xhc3NEaWFncmFtVGl0bGVUZXh0XCIsXG4gICAgY29uZj8udGl0bGVUb3BNYXJnaW4gPz8gMjUsXG4gICAgZGlhZy5kYi5nZXREaWFncmFtVGl0bGUoKVxuICApO1xuICBzZXR1cFZpZXdQb3J0Rm9yU1ZHKHN2ZywgcGFkZGluZywgXCJjbGFzc0RpYWdyYW1cIiwgY29uZj8udXNlTWF4V2lkdGggPz8gdHJ1ZSk7XG59LCBcImRyYXdcIik7XG52YXIgY2xhc3NSZW5kZXJlcl92M191bmlmaWVkX2RlZmF1bHQgPSB7XG4gIGdldENsYXNzZXMsXG4gIGRyYXcsXG4gIGdldERpclxufTtcblxuZXhwb3J0IHtcbiAgY2xhc3NEaWFncmFtX2RlZmF1bHQsXG4gIENsYXNzREIsXG4gIHN0eWxlc19kZWZhdWx0LFxuICBjbGFzc1JlbmRlcmVyX3YzX3VuaWZpZWRfZGVmYXVsdFxufTtcbiIKICBdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUNBLElBQUksU0FBVSxRQUFRLEdBQUc7QUFBQSxFQUN2QixJQUFJLG9CQUFvQixPQUFPLFFBQVEsQ0FBQyxHQUFHLEdBQUcsSUFBSSxHQUFHO0FBQUEsSUFDbkQsS0FBSyxLQUFLLE1BQU0sQ0FBQyxHQUFHLElBQUksRUFBRSxPQUFRLEtBQUssR0FBRyxFQUFFLE1BQU07QUFBQTtBQUFBLElBQ2xELE9BQU87QUFBQSxLQUNOLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxLQUFLLEtBQUssR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxJ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QUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQUEsSUFDbnVDLCtCQUErQixPQUFPLFNBQVMsU0FBUyxDQUFDLFFBQVEsUUFBUSxVQUFVLElBQUksU0FBUyxJQUFJLElBQUk7QUFBQSxNQUN0RyxJQUFJLEtBQUssR0FBRyxTQUFTO0FBQUEsTUFDckIsUUFBUTtBQUFBLGFBQ0Q7QUFBQSxVQUNILEtBQUssSUFBSSxHQUFHLEtBQUs7QUFBQSxVQUNqQjtBQUFBLGFBQ0c7QUFBQSxhQUNBO0FBQUEsYUFDQTtBQUFBLGFBQ0E7QUFBQSxVQUNILEtBQUssSUFBSSxHQUFHO0FBQUEsVUFDWjtBQUFBLGFBQ0c7QUFBQSxhQUNBO0FBQUEsVUFDSCxLQUFLLElBQUksR0FBRyxLQUFLLEtBQUssTUFBTSxHQUFHO0FBQUEsVUFDL0I7QUFBQSxhQUNHO0FBQUEsYUFDQTtBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsS0FBSyxLQUFLLEdBQUc7QUFBQSxVQUN6QjtBQUFBLGFBQ0c7QUFBQSxhQUNBO0FBQUEsVUFDSCxLQUFLLElBQUksR0FBRyxLQUFLLEtBQUssTUFBTSxHQUFHLE1BQU07QUFBQSxVQUNyQztBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsWUFBWSxHQUFHLEdBQUc7QUFBQSxVQUNyQjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsS0FBSyxHQUFHLFFBQVEsR0FBRyxhQUFhLEdBQUcsR0FBRztBQUFBLFVBQ3pDLEdBQUcsWUFBWSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ3pCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsSUFBSSxLQUFLO0FBQUEsVUFDckIsR0FBRyxZQUFZLEtBQUssQ0FBQztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLGFBQ0E7QUFBQSxVQUNILEtBQUssSUFBSSxHQUFHLElBQUksS0FBSztBQUFBLFVBQ3JCLEdBQUcsa0JBQWtCLEtBQUssQ0FBQztBQUFBLFVBQzNCO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxzQkFBc0IsR0FBRyxLQUFLLElBQUksR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEtBQUssR0FBRyxFQUFFO0FBQUEsVUFDakUsR0FBRyxhQUFhO0FBQUEsVUFDaEI7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLHNCQUFzQixHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLEdBQUcsS0FBSyxHQUFHLEVBQUU7QUFBQSxVQUNqRSxHQUFHLGFBQWE7QUFBQSxVQUNoQjtBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxHQUFHLGFBQWEsR0FBRyxHQUFHO0FBQUEsVUFDL0I7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksR0FBRyxhQUFhLEdBQUcsS0FBSyxJQUFJLEdBQUcsR0FBRztBQUFBLFVBQzNDO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFBQSxVQUN0QjtBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFBQSxVQUMxQjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsSUFBSSxHQUFHLFFBQVEsR0FBRyxLQUFLLEVBQUU7QUFBQSxVQUM1QixLQUFLLElBQUksR0FBRztBQUFBLFVBQ1o7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUFBLFVBQ3RCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQztBQUFBLFVBQzFCO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxJQUFJLEdBQUcsUUFBUSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQzVCLEtBQUssSUFBSSxHQUFHO0FBQUEsVUFDWjtBQUFBLGFBQ0c7QUFBQSxhQUNBO0FBQUEsVUFDSCxLQUFLLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQUEsVUFDaEI7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksR0FBRztBQUFBLFVBQ1o7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLFlBQVksR0FBRyxLQUFLLElBQUksR0FBRyxHQUFHO0FBQUEsVUFDakM7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLFdBQVcsR0FBRyxLQUFLLElBQUksR0FBRyxLQUFLLEVBQUU7QUFBQSxVQUNwQztBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsWUFBWSxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ3JDLEdBQUcsV0FBVyxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ3BDO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxjQUFjLEdBQUcsS0FBSyxJQUFJLEdBQUcsS0FBSyxFQUFFO0FBQUEsVUFDdkM7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLGNBQWMsR0FBRyxLQUFLLElBQUksR0FBRyxLQUFLLEVBQUU7QUFBQSxVQUN2QyxHQUFHLFdBQVcsR0FBRyxLQUFLLElBQUksR0FBRyxLQUFLLEVBQUU7QUFBQSxVQUNwQztBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsY0FBYyxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ3ZDO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUc7QUFBQSxVQUNaLEdBQUcsU0FBUyxHQUFHLEdBQUc7QUFBQSxVQUNsQjtBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxHQUFHLEtBQUs7QUFBQSxVQUNqQixHQUFHLFNBQVMsR0FBRyxLQUFLLEVBQUU7QUFBQSxVQUN0QixHQUFHLGNBQWMsR0FBRyxLQUFLLElBQUksR0FBRyxHQUFHO0FBQUEsVUFDbkM7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLGNBQWMsR0FBRyxLQUFLLEdBQUcsS0FBSyxFQUFFO0FBQUEsVUFDbkM7QUFBQSxhQUNHO0FBQUEsYUFDQTtBQUFBLFVBQ0gsS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHO0FBQUEsVUFDaEI7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLElBQUksS0FBSyxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ3RCLEtBQUssSUFBSSxHQUFHO0FBQUEsVUFDWjtBQUFBLGFBQ0c7QUFBQSxVQUNIO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxVQUFVLEdBQUcsS0FBSyxJQUFJLEdBQUcsYUFBYSxHQUFHLEdBQUcsQ0FBQztBQUFBLFVBQ2hEO0FBQUEsYUFDRztBQUFBLFVBQ0g7QUFBQSxhQUNHO0FBQUEsVUFDSDtBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxFQUFFLEtBQU8sR0FBRyxLQUFLLElBQUksS0FBTyxHQUFHLEtBQUssVUFBVSxHQUFHLEtBQUssSUFBSSxnQkFBZ0IsUUFBUSxnQkFBZ0IsT0FBTztBQUFBLFVBQ2xIO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEVBQUUsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLEdBQUcsS0FBSyxVQUFVLEdBQUcsS0FBSyxJQUFJLGdCQUFnQixHQUFHLEtBQUssSUFBSSxnQkFBZ0IsT0FBTztBQUFBLFVBQ2xIO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEVBQUUsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLEdBQUcsS0FBSyxVQUFVLEdBQUcsS0FBSyxJQUFJLGdCQUFnQixRQUFRLGdCQUFnQixHQUFHLEtBQUssR0FBRztBQUFBLFVBQ2xIO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEVBQUUsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLEdBQUcsS0FBSyxVQUFVLEdBQUcsS0FBSyxJQUFJLGdCQUFnQixHQUFHLEtBQUssSUFBSSxnQkFBZ0IsR0FBRyxLQUFLLEdBQUc7QUFBQSxVQUN0SDtBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxHQUFHLFFBQVEsR0FBRyxLQUFLLEdBQUcsS0FBSyxFQUFFO0FBQUEsVUFDdEM7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksR0FBRyxRQUFRLEdBQUcsR0FBRztBQUFBLFVBQzFCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsS0FBSztBQUFBLFVBQ2pCLEdBQUcsWUFBWSxHQUFHLEtBQUssSUFBSSxHQUFHLEdBQUc7QUFBQSxVQUNqQztBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxHQUFHLEtBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxHQUFHLENBQUM7QUFBQSxVQUNuQztBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsYUFBYSxJQUFJO0FBQUEsVUFDcEI7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLGFBQWEsSUFBSTtBQUFBLFVBQ3BCO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxhQUFhLElBQUk7QUFBQSxVQUNwQjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsYUFBYSxJQUFJO0FBQUEsVUFDcEI7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksRUFBRSxPQUFPLEdBQUcsS0FBSyxJQUFJLE9BQU8sR0FBRyxLQUFLLFVBQVUsR0FBRyxLQUFLLEdBQUc7QUFBQSxVQUNsRTtBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxFQUFFLE9BQU8sUUFBUSxPQUFPLEdBQUcsS0FBSyxVQUFVLEdBQUcsS0FBSyxHQUFHO0FBQUEsVUFDOUQ7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksRUFBRSxPQUFPLEdBQUcsS0FBSyxJQUFJLE9BQU8sUUFBUSxVQUFVLEdBQUcsSUFBSTtBQUFBLFVBQzlEO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEVBQUUsT0FBTyxRQUFRLE9BQU8sUUFBUSxVQUFVLEdBQUcsSUFBSTtBQUFBLFVBQzFEO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsYUFBYTtBQUFBLFVBQ3pCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsYUFBYTtBQUFBLFVBQ3pCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsYUFBYTtBQUFBLFVBQ3pCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsYUFBYTtBQUFBLFVBQ3pCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsYUFBYTtBQUFBLFVBQ3pCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLGFBQ0E7QUFBQSxVQUNILEtBQUssSUFBSSxHQUFHLEtBQUs7QUFBQSxVQUNqQixHQUFHLGNBQWMsR0FBRyxLQUFLLElBQUksR0FBRyxHQUFHO0FBQUEsVUFDbkM7QUFBQSxhQUNHO0FBQUEsYUFDQTtBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsS0FBSztBQUFBLFVBQ2pCLEdBQUcsY0FBYyxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ3ZDLEdBQUcsV0FBVyxHQUFHLEtBQUssSUFBSSxHQUFHLEdBQUc7QUFBQSxVQUNoQztBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxHQUFHLEtBQUs7QUFBQSxVQUNqQixHQUFHLFFBQVEsR0FBRyxLQUFLLElBQUksR0FBRyxHQUFHO0FBQUEsVUFDN0I7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksR0FBRyxLQUFLO0FBQUEsVUFDakIsR0FBRyxRQUFRLEdBQUcsS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLEdBQUcsR0FBRztBQUFBLFVBQ3pDO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsS0FBSztBQUFBLFVBQ2pCLEdBQUcsUUFBUSxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ2pDLEdBQUcsV0FBVyxHQUFHLEtBQUssSUFBSSxHQUFHLEdBQUc7QUFBQSxVQUNoQztBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxHQUFHLEtBQUs7QUFBQSxVQUNqQixHQUFHLFFBQVEsR0FBRyxLQUFLLElBQUksR0FBRyxLQUFLLElBQUksR0FBRyxHQUFHO0FBQUEsVUFDekMsR0FBRyxXQUFXLEdBQUcsS0FBSyxJQUFJLEdBQUcsS0FBSyxFQUFFO0FBQUEsVUFDcEM7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksR0FBRyxLQUFLO0FBQUEsVUFDakIsR0FBRyxjQUFjLEdBQUcsS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLEdBQUcsR0FBRztBQUFBLFVBQy9DO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsS0FBSztBQUFBLFVBQ2pCLEdBQUcsY0FBYyxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ25ELEdBQUcsV0FBVyxHQUFHLEtBQUssSUFBSSxHQUFHLEdBQUc7QUFBQSxVQUNoQztBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxHQUFHLEtBQUs7QUFBQSxVQUNqQixHQUFHLFFBQVEsR0FBRyxLQUFLLElBQUksR0FBRyxHQUFHO0FBQUEsVUFDN0I7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksR0FBRyxLQUFLO0FBQUEsVUFDakIsR0FBRyxRQUFRLEdBQUcsS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLEdBQUcsR0FBRztBQUFBLFVBQ3pDO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsS0FBSztBQUFBLFVBQ2pCLEdBQUcsUUFBUSxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssRUFBRTtBQUFBLFVBQ2pDLEdBQUcsV0FBVyxHQUFHLEtBQUssSUFBSSxHQUFHLEdBQUc7QUFBQSxVQUNoQztBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxHQUFHLEtBQUs7QUFBQSxVQUNqQixHQUFHLFFBQVEsR0FBRyxLQUFLLElBQUksR0FBRyxLQUFLLElBQUksR0FBRyxHQUFHO0FBQUEsVUFDekMsR0FBRyxXQUFXLEdBQUcsS0FBSyxJQUFJLEdBQUcsS0FBSyxFQUFFO0FBQUEsVUFDcEM7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksR0FBRyxLQUFLO0FBQUEsVUFDakIsR0FBRyxZQUFZLEdBQUcsS0FBSyxJQUFJLEdBQUcsR0FBRztBQUFBLFVBQ2pDO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxZQUFZLEdBQUcsS0FBSyxJQUFJLEdBQUcsR0FBRztBQUFBLFVBQ2pDO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHO0FBQUEsVUFDaEI7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsR0FBRztBQUFBLFVBQ3RCLEtBQUssSUFBSSxHQUFHLEtBQUs7QUFBQSxVQUNqQjtBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxHQUFHLEtBQUssS0FBSyxHQUFHO0FBQUEsVUFDekI7QUFBQTtBQUFBLE9BRUgsV0FBVztBQUFBLElBQ2QsT0FBTyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssSUFBSSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLEdBQUcsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FB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RztBQUFBLFlBQ0gsS0FBSyxTQUFTO0FBQUEsWUFDZCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNIO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxLQUFLLFNBQVM7QUFBQSxZQUNkO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxLQUFLLE1BQU0sU0FBUztBQUFBLFlBQ3BCO0FBQUEsZUFDRztBQUFBLFlBQ0gsS0FBSyxTQUFTO0FBQUEsWUFDZDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsS0FBSyxNQUFNLFVBQVU7QUFBQSxZQUNyQjtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUE7QUFBQSxTQUVILFdBQVc7QUFBQSxNQUNkLE9BQU8sQ0FBQywrQkFBK0IsK0JBQStCLCtCQUErQiwrQkFBK0IsaUNBQWlDLHlCQUF5Qix3QkFBd0Isd0JBQXdCLHdCQUF3Qix3QkFBd0IseUJBQXlCLGFBQWEsZUFBZSxvQkFBb0IsWUFBWSwwQkFBMEIsdUJBQXVCLGVBQWUsa0JBQWtCLGtCQUFrQixXQUFXLGNBQWMsV0FBVyxjQUFjLFlBQVksY0FBYyxZQUFZLGdCQUFnQixtQkFBbUIsb0JBQW9CLG9CQUFvQixZQUFZLFlBQVksWUFBWSxZQUFZLFVBQVUsb0JBQW9CLFlBQVksZUFBZSxnQkFBZ0Isb0JBQW9CLFlBQVksWUFBWSxZQUFZLFlBQVksVUFBVSxlQUFlLFlBQVksYUFBYSxpQkFBaUIsbUJBQW1CLG1CQUFtQixlQUFlLGdCQUFnQixtQkFBbUIsZUFBZSxXQUFXLFdBQVcsZUFBZSxZQUFZLGNBQWMsVUFBVSxZQUFZLGNBQWMsWUFBWSxnQkFBZ0IsaUJBQWlCLGtCQUFrQixlQUFlLGVBQWUsZUFBZSxhQUFhLGFBQWEsY0FBYyxlQUFlLGdCQUFnQixXQUFXLGFBQWEscUJBQXFCLGFBQWEsVUFBVSxXQUFXLFdBQVcsVUFBVSxVQUFVLFVBQVUsVUFBVSxVQUFVLFVBQVUsVUFBVSxZQUFZLFdBQVcsV0FBVyw0QkFBNEIsZUFBZSxzeElBQXN4SSxXQUFXLFdBQVcsUUFBUTtBQUFBLE1BQ3h4TCxZQUFZLEVBQUUsa0JBQWtCLEVBQUUsT0FBUyxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcsV0FBYSxFQUFFLE9BQVMsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcsY0FBYyxFQUFFLE9BQVMsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxXQUFhLE1BQU0sR0FBRyxPQUFTLEVBQUUsT0FBUyxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcscUJBQXVCLEVBQUUsT0FBUyxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxXQUFhLE1BQU0sR0FBRyxXQUFhLEVBQUUsT0FBUyxDQUFDLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcsV0FBYSxFQUFFLE9BQVMsQ0FBQyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLFdBQWEsTUFBTSxHQUFHLGVBQWlCLEVBQUUsT0FBUyxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxXQUFhLE1BQU0sR0FBRyxlQUFpQixFQUFFLE9BQVMsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxXQUFhLE1BQU0sR0FBRyxNQUFRLEVBQUUsT0FBUyxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLFdBQWEsTUFBTSxHQUFHLFFBQVUsRUFBRSxPQUFTLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcsU0FBVyxFQUFFLE9BQVMsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcsVUFBWSxFQUFFLE9BQVMsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcsUUFBVSxFQUFFLE9BQVMsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcsU0FBVyxFQUFFLE9BQVMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJ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QUE7QUFBQTtBQUFBO0FBQUEsV0FJUixRQUFRO0FBQUE7QUFBQTtBQUFBLFVBR1QsUUFBUTtBQUFBO0FBQUE7QUFBQSxVQUdSLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQSxnQkFJRixRQUFRO0FBQUE7QUFBQTtBQUFBLGdCQUdSLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBV1osUUFBUTtBQUFBLGNBQ04sUUFBUTtBQUFBLG9CQUNGLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBS2hCLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsVUFTVixRQUFRO0FBQUEsWUFDTixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsWUFJUixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsVUFPVixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQUtSLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBS04sUUFBUTtBQUFBLGtCQUNGLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQWFoQixRQUFRO0FBQUEsWUFDTixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQUtWLFFBQVE7QUFBQSxZQUNOLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBS1YsUUFBUTtBQUFBLFlBQ04sUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsVUFLVixRQUFRO0FBQUEsWUFDTixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBTVIsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQU1SLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsWUFNUixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBTVIsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsVUFLVixRQUFRO0FBQUEsWUFDTixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQUtWLFFBQVE7QUFBQSxZQUNOLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsVUFZVixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0JBSUksUUFBUTtBQUFBO0FBQUEsd0JBRU4sUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUlSLFFBQVE7QUFBQSxZQUNwQixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFJaEIsY0FBYztBQUFBLEdBQ2YsV0FBVztBQUNkLElBQUksaUJBQWlCO0FBR3JCLElBQUkseUJBQXlCLE9BQU8sQ0FBQyxZQUFZLGFBQWEsU0FBUztBQUFBLEVBQ3JFLElBQUksQ0FBQyxXQUFXLEtBQUs7QUFBQSxJQUNuQixPQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsSUFBSSxNQUFNO0FBQUEsRUFDVixXQUFXLGlCQUFpQixXQUFXLEtBQUs7QUFBQSxJQUMxQyxJQUFJLGNBQWMsU0FBUyxPQUFPO0FBQUEsTUFDaEMsTUFBTSxjQUFjO0FBQUEsSUFDdEI7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsR0FDTixRQUFRO0FBQ1gsSUFBSSw2QkFBNkIsT0FBTyxRQUFRLENBQUMsTUFBTSxZQUFZO0FBQUEsRUFDakUsT0FBTyxXQUFXLEdBQUcsV0FBVztBQUFBLEdBQy9CLFlBQVk7QUFDZixJQUFJLHVCQUF1QixPQUFPLGNBQWMsQ0FBQyxNQUFNLElBQUksVUFBVSxNQUFNO0FBQUEsRUFDekUsSUFBSSxLQUFLLE9BQU87QUFBQSxFQUNoQixJQUFJLEtBQUssOEJBQThCLEVBQUU7QUFBQSxFQUN6QyxRQUFRLGVBQWUsT0FBTyxNQUFNLFdBQVcsV0FBVTtBQUFBLEVBQ3pELEtBQUssR0FBRyxhQUFhLEVBQUU7QUFBQSxFQUN2QixNQUFNLGNBQWMsS0FBSyxHQUFHLFFBQVE7QUFBQSxFQUNwQyxNQUFNLE1BQU0sa0JBQWtCLElBQUksYUFBYTtBQUFBLEVBQy9DLFlBQVksT0FBTyxLQUFLO0FBQUEsRUFDeEIsWUFBWSxrQkFBa0IsNkJBQTZCLE1BQU07QUFBQSxFQUNqRSxZQUFZLGNBQWMsTUFBTSxlQUFlO0FBQUEsRUFDL0MsWUFBWSxjQUFjLE1BQU0sZUFBZTtBQUFBLEVBQy9DLFlBQVksVUFBVSxDQUFDLGVBQWUsYUFBYSxlQUFlLGNBQWMsVUFBVTtBQUFBLEVBQzFGLFlBQVksWUFBWTtBQUFBLEVBQ3hCLE1BQU0sT0FBTyxhQUFhLEdBQUc7QUFBQSxFQUM3QixNQUFNLFVBQVU7QUFBQSxFQUNoQixjQUFjLFlBQ1osS0FDQSx5QkFDQSxNQUFNLGtCQUFrQixJQUN4QixLQUFLLEdBQUcsZ0JBQWdCLENBQzFCO0FBQUEsRUFDQSxvQkFBb0IsS0FBSyxTQUFTLGdCQUFnQixNQUFNLGVBQWUsSUFBSTtBQUFBLEdBQzFFLE1BQU07QUFDVCxJQUFJLG1DQUFtQztBQUFBLEVBQ3JDO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRjsiLAogICJkZWJ1Z0lkIjogIkI3MzREMkIyRUQ1N0I1RkE2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
