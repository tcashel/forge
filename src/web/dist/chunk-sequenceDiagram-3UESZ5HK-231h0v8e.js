import {
  ImperativeState
} from "./chunk-main-91q4jzw9.js";
import {
  JSON_SCHEMA,
  load
} from "./chunk-main-vzv70y3p.js";
import {
  drawBackgroundRect,
  drawEmbeddedImage,
  drawImage,
  drawRect,
  getNoteRect,
  getTextObj
} from "./chunk-main-sxwy6e53.js";
import {
  ZERO_WIDTH_SPACE,
  parseFontSize,
  utils_default
} from "./chunk-main-vvfzntzy.js";
import {
  require_dist
} from "./chunk-main-ck580f0k.js";
import {
  assignWithDepth_default,
  calculateMathMLDimensions,
  clear,
  common_default,
  configureSvgSize,
  getAccDescription,
  getAccTitle,
  getConfig,
  getConfig2,
  getDiagramTitle,
  getUrl,
  hasKatex,
  renderKatexSanitized,
  sanitizeText,
  setAccDescription,
  setAccTitle,
  setConfig2,
  setDiagramTitle
} from "./chunk-main-aws590jt.js";
import {
  __name,
  log,
  select_default
} from "./chunk-main-vcnyggwp.js";
import {
  __toESM
} from "./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/sequenceDiagram-3UESZ5HK.mjs
var import_sanitize_url = __toESM(require_dist(), 1);
var parser = function() {
  var o = /* @__PURE__ */ __name(function(k, v, o2, l) {
    for (o2 = o2 || {}, l = k.length;l--; o2[k[l]] = v)
      ;
    return o2;
  }, "o"), $V0 = [1, 2], $V1 = [1, 3], $V2 = [1, 4], $V3 = [2, 4], $V4 = [1, 9], $V5 = [1, 11], $V6 = [1, 12], $V7 = [1, 14], $V8 = [1, 15], $V9 = [1, 17], $Va = [1, 18], $Vb = [1, 19], $Vc = [1, 25], $Vd = [1, 26], $Ve = [1, 27], $Vf = [1, 28], $Vg = [1, 29], $Vh = [1, 30], $Vi = [1, 31], $Vj = [1, 32], $Vk = [1, 33], $Vl = [1, 34], $Vm = [1, 35], $Vn = [1, 36], $Vo = [1, 37], $Vp = [1, 38], $Vq = [1, 39], $Vr = [1, 40], $Vs = [1, 42], $Vt = [1, 43], $Vu = [1, 44], $Vv = [1, 45], $Vw = [1, 46], $Vx = [1, 47], $Vy = [1, 4, 5, 10, 14, 15, 17, 19, 22, 24, 30, 31, 32, 34, 36, 37, 38, 39, 40, 42, 44, 45, 47, 48, 49, 50, 51, 53, 54, 56, 61, 62, 63, 64, 73], $Vz = [1, 74], $VA = [1, 80], $VB = [1, 81], $VC = [1, 82], $VD = [1, 83], $VE = [1, 84], $VF = [1, 85], $VG = [1, 86], $VH = [1, 87], $VI = [1, 88], $VJ = [1, 89], $VK = [1, 90], $VL = [1, 91], $VM = [1, 92], $VN = [1, 93], $VO = [1, 94], $VP = [1, 95], $VQ = [1, 96], $VR = [1, 97], $VS = [1, 98], $VT = [1, 99], $VU = [1, 100], $VV = [1, 101], $VW = [1, 102], $VX = [1, 103], $VY = [1, 104], $VZ = [1, 105], $V_ = [2, 78], $V$ = [4, 5, 17, 51, 53, 54], $V01 = [4, 5, 10, 14, 15, 17, 19, 22, 24, 30, 31, 32, 34, 36, 37, 38, 39, 40, 42, 44, 45, 47, 51, 53, 54, 56, 61, 62, 63, 64, 73], $V11 = [4, 5, 10, 14, 15, 17, 19, 22, 24, 30, 31, 32, 34, 36, 37, 38, 39, 40, 42, 44, 45, 47, 50, 51, 53, 54, 56, 61, 62, 63, 64, 73], $V21 = [4, 5, 10, 14, 15, 17, 19, 22, 24, 30, 31, 32, 34, 36, 37, 38, 39, 40, 42, 44, 45, 47, 49, 51, 53, 54, 56, 61, 62, 63, 64, 73], $V31 = [4, 5, 10, 14, 15, 17, 19, 22, 24, 30, 31, 32, 34, 36, 37, 38, 39, 40, 42, 44, 45, 47, 48, 51, 53, 54, 56, 61, 62, 63, 64, 73], $V41 = [5, 52], $V51 = [70, 71, 72, 73], $V61 = [1, 151];
  var parser2 = {
    trace: /* @__PURE__ */ __name(function trace() {}, "trace"),
    yy: {},
    symbols_: { error: 2, start: 3, SPACE: 4, NEWLINE: 5, SD: 6, document: 7, line: 8, statement: 9, INVALID: 10, box_section: 11, box_line: 12, participant_statement: 13, create: 14, box: 15, restOfLine: 16, end: 17, signal: 18, autonumber: 19, NUM: 20, off: 21, activate: 22, actor: 23, deactivate: 24, note_statement: 25, links_statement: 26, link_statement: 27, properties_statement: 28, details_statement: 29, title: 30, legacy_title: 31, acc_title: 32, acc_title_value: 33, acc_descr: 34, acc_descr_value: 35, acc_descr_multiline_value: 36, loop: 37, rect: 38, opt: 39, alt: 40, else_sections: 41, par: 42, par_sections: 43, par_over: 44, critical: 45, option_sections: 46, break: 47, option: 48, and: 49, else: 50, participant: 51, AS: 52, participant_actor: 53, destroy: 54, actor_with_config: 55, note: 56, placement: 57, text2: 58, over: 59, actor_pair: 60, links: 61, link: 62, properties: 63, details: 64, spaceList: 65, ",": 66, left_of: 67, right_of: 68, signaltype: 69, "+": 70, "-": 71, "()": 72, ACTOR: 73, config_object: 74, CONFIG_START: 75, CONFIG_CONTENT: 76, CONFIG_END: 77, SOLID_OPEN_ARROW: 78, DOTTED_OPEN_ARROW: 79, SOLID_ARROW: 80, SOLID_ARROW_TOP: 81, SOLID_ARROW_BOTTOM: 82, STICK_ARROW_TOP: 83, STICK_ARROW_BOTTOM: 84, SOLID_ARROW_TOP_DOTTED: 85, SOLID_ARROW_BOTTOM_DOTTED: 86, STICK_ARROW_TOP_DOTTED: 87, STICK_ARROW_BOTTOM_DOTTED: 88, SOLID_ARROW_TOP_REVERSE: 89, SOLID_ARROW_BOTTOM_REVERSE: 90, STICK_ARROW_TOP_REVERSE: 91, STICK_ARROW_BOTTOM_REVERSE: 92, SOLID_ARROW_TOP_REVERSE_DOTTED: 93, SOLID_ARROW_BOTTOM_REVERSE_DOTTED: 94, STICK_ARROW_TOP_REVERSE_DOTTED: 95, STICK_ARROW_BOTTOM_REVERSE_DOTTED: 96, BIDIRECTIONAL_SOLID_ARROW: 97, DOTTED_ARROW: 98, BIDIRECTIONAL_DOTTED_ARROW: 99, SOLID_CROSS: 100, DOTTED_CROSS: 101, SOLID_POINT: 102, DOTTED_POINT: 103, TXT: 104, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 4: "SPACE", 5: "NEWLINE", 6: "SD", 10: "INVALID", 14: "create", 15: "box", 16: "restOfLine", 17: "end", 19: "autonumber", 20: "NUM", 21: "off", 22: "activate", 24: "deactivate", 30: "title", 31: "legacy_title", 32: "acc_title", 33: "acc_title_value", 34: "acc_descr", 35: "acc_descr_value", 36: "acc_descr_multiline_value", 37: "loop", 38: "rect", 39: "opt", 40: "alt", 42: "par", 44: "par_over", 45: "critical", 47: "break", 48: "option", 49: "and", 50: "else", 51: "participant", 52: "AS", 53: "participant_actor", 54: "destroy", 56: "note", 59: "over", 61: "links", 62: "link", 63: "properties", 64: "details", 66: ",", 67: "left_of", 68: "right_of", 70: "+", 71: "-", 72: "()", 73: "ACTOR", 75: "CONFIG_START", 76: "CONFIG_CONTENT", 77: "CONFIG_END", 78: "SOLID_OPEN_ARROW", 79: "DOTTED_OPEN_ARROW", 80: "SOLID_ARROW", 81: "SOLID_ARROW_TOP", 82: "SOLID_ARROW_BOTTOM", 83: "STICK_ARROW_TOP", 84: "STICK_ARROW_BOTTOM", 85: "SOLID_ARROW_TOP_DOTTED", 86: "SOLID_ARROW_BOTTOM_DOTTED", 87: "STICK_ARROW_TOP_DOTTED", 88: "STICK_ARROW_BOTTOM_DOTTED", 89: "SOLID_ARROW_TOP_REVERSE", 90: "SOLID_ARROW_BOTTOM_REVERSE", 91: "STICK_ARROW_TOP_REVERSE", 92: "STICK_ARROW_BOTTOM_REVERSE", 93: "SOLID_ARROW_TOP_REVERSE_DOTTED", 94: "SOLID_ARROW_BOTTOM_REVERSE_DOTTED", 95: "STICK_ARROW_TOP_REVERSE_DOTTED", 96: "STICK_ARROW_BOTTOM_REVERSE_DOTTED", 97: "BIDIRECTIONAL_SOLID_ARROW", 98: "DOTTED_ARROW", 99: "BIDIRECTIONAL_DOTTED_ARROW", 100: "SOLID_CROSS", 101: "DOTTED_CROSS", 102: "SOLID_POINT", 103: "DOTTED_POINT", 104: "TXT" },
    productions_: [0, [3, 2], [3, 2], [3, 2], [7, 0], [7, 2], [8, 2], [8, 1], [8, 1], [8, 1], [11, 0], [11, 2], [12, 2], [12, 1], [12, 1], [9, 1], [9, 2], [9, 4], [9, 2], [9, 4], [9, 3], [9, 3], [9, 2], [9, 3], [9, 3], [9, 2], [9, 2], [9, 2], [9, 2], [9, 2], [9, 1], [9, 1], [9, 2], [9, 2], [9, 1], [9, 4], [9, 4], [9, 4], [9, 4], [9, 4], [9, 4], [9, 4], [9, 4], [46, 1], [46, 4], [43, 1], [43, 4], [41, 1], [41, 4], [13, 5], [13, 3], [13, 5], [13, 3], [13, 3], [13, 5], [13, 3], [13, 5], [13, 3], [25, 4], [25, 4], [26, 3], [27, 3], [28, 3], [29, 3], [65, 2], [65, 1], [60, 3], [60, 1], [57, 1], [57, 1], [18, 5], [18, 5], [18, 5], [18, 5], [18, 6], [18, 4], [55, 2], [74, 3], [23, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [69, 1], [58, 1]],
    performAction: /* @__PURE__ */ __name(function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
      var $0 = $$.length - 1;
      switch (yystate) {
        case 3:
          yy.apply($$[$0]);
          return $$[$0];
          break;
        case 4:
        case 10:
          this.$ = [];
          break;
        case 5:
        case 11:
          $$[$0 - 1].push($$[$0]);
          this.$ = $$[$0 - 1];
          break;
        case 6:
        case 7:
        case 12:
        case 13:
          this.$ = $$[$0];
          break;
        case 8:
        case 9:
        case 14:
          this.$ = [];
          break;
        case 16:
          $$[$0].type = "createParticipant";
          this.$ = $$[$0];
          break;
        case 17:
          $$[$0 - 1].unshift({ type: "boxStart", boxData: yy.parseBoxData($$[$0 - 2]) });
          $$[$0 - 1].push({ type: "boxEnd", boxText: $$[$0 - 2] });
          this.$ = $$[$0 - 1];
          break;
        case 19:
          this.$ = { type: "sequenceIndex", sequenceIndex: Number($$[$0 - 2]), sequenceIndexStep: Number($$[$0 - 1]), sequenceVisible: true, signalType: yy.LINETYPE.AUTONUMBER };
          break;
        case 20:
          this.$ = { type: "sequenceIndex", sequenceIndex: Number($$[$0 - 1]), sequenceIndexStep: 1, sequenceVisible: true, signalType: yy.LINETYPE.AUTONUMBER };
          break;
        case 21:
          this.$ = { type: "sequenceIndex", sequenceVisible: false, signalType: yy.LINETYPE.AUTONUMBER };
          break;
        case 22:
          this.$ = { type: "sequenceIndex", sequenceVisible: true, signalType: yy.LINETYPE.AUTONUMBER };
          break;
        case 23:
          this.$ = { type: "activeStart", signalType: yy.LINETYPE.ACTIVE_START, actor: $$[$0 - 1].actor };
          break;
        case 24:
          this.$ = { type: "activeEnd", signalType: yy.LINETYPE.ACTIVE_END, actor: $$[$0 - 1].actor };
          break;
        case 30:
          yy.setDiagramTitle($$[$0].substring(6));
          this.$ = $$[$0].substring(6);
          break;
        case 31:
          yy.setDiagramTitle($$[$0].substring(7));
          this.$ = $$[$0].substring(7);
          break;
        case 32:
          this.$ = $$[$0].trim();
          yy.setAccTitle(this.$);
          break;
        case 33:
        case 34:
          this.$ = $$[$0].trim();
          yy.setAccDescription(this.$);
          break;
        case 35:
          $$[$0 - 1].unshift({ type: "loopStart", loopText: yy.parseMessage($$[$0 - 2]), signalType: yy.LINETYPE.LOOP_START });
          $$[$0 - 1].push({ type: "loopEnd", loopText: $$[$0 - 2], signalType: yy.LINETYPE.LOOP_END });
          this.$ = $$[$0 - 1];
          break;
        case 36:
          $$[$0 - 1].unshift({ type: "rectStart", color: yy.parseMessage($$[$0 - 2]), signalType: yy.LINETYPE.RECT_START });
          $$[$0 - 1].push({ type: "rectEnd", color: yy.parseMessage($$[$0 - 2]), signalType: yy.LINETYPE.RECT_END });
          this.$ = $$[$0 - 1];
          break;
        case 37:
          $$[$0 - 1].unshift({ type: "optStart", optText: yy.parseMessage($$[$0 - 2]), signalType: yy.LINETYPE.OPT_START });
          $$[$0 - 1].push({ type: "optEnd", optText: yy.parseMessage($$[$0 - 2]), signalType: yy.LINETYPE.OPT_END });
          this.$ = $$[$0 - 1];
          break;
        case 38:
          $$[$0 - 1].unshift({ type: "altStart", altText: yy.parseMessage($$[$0 - 2]), signalType: yy.LINETYPE.ALT_START });
          $$[$0 - 1].push({ type: "altEnd", signalType: yy.LINETYPE.ALT_END });
          this.$ = $$[$0 - 1];
          break;
        case 39:
          $$[$0 - 1].unshift({ type: "parStart", parText: yy.parseMessage($$[$0 - 2]), signalType: yy.LINETYPE.PAR_START });
          $$[$0 - 1].push({ type: "parEnd", signalType: yy.LINETYPE.PAR_END });
          this.$ = $$[$0 - 1];
          break;
        case 40:
          $$[$0 - 1].unshift({ type: "parStart", parText: yy.parseMessage($$[$0 - 2]), signalType: yy.LINETYPE.PAR_OVER_START });
          $$[$0 - 1].push({ type: "parEnd", signalType: yy.LINETYPE.PAR_END });
          this.$ = $$[$0 - 1];
          break;
        case 41:
          $$[$0 - 1].unshift({ type: "criticalStart", criticalText: yy.parseMessage($$[$0 - 2]), signalType: yy.LINETYPE.CRITICAL_START });
          $$[$0 - 1].push({ type: "criticalEnd", signalType: yy.LINETYPE.CRITICAL_END });
          this.$ = $$[$0 - 1];
          break;
        case 42:
          $$[$0 - 1].unshift({ type: "breakStart", breakText: yy.parseMessage($$[$0 - 2]), signalType: yy.LINETYPE.BREAK_START });
          $$[$0 - 1].push({ type: "breakEnd", optText: yy.parseMessage($$[$0 - 2]), signalType: yy.LINETYPE.BREAK_END });
          this.$ = $$[$0 - 1];
          break;
        case 44:
          this.$ = $$[$0 - 3].concat([{ type: "option", optionText: yy.parseMessage($$[$0 - 1]), signalType: yy.LINETYPE.CRITICAL_OPTION }, $$[$0]]);
          break;
        case 46:
          this.$ = $$[$0 - 3].concat([{ type: "and", parText: yy.parseMessage($$[$0 - 1]), signalType: yy.LINETYPE.PAR_AND }, $$[$0]]);
          break;
        case 48:
          this.$ = $$[$0 - 3].concat([{ type: "else", altText: yy.parseMessage($$[$0 - 1]), signalType: yy.LINETYPE.ALT_ELSE }, $$[$0]]);
          break;
        case 49:
          $$[$0 - 3].draw = "participant";
          $$[$0 - 3].type = "addParticipant";
          $$[$0 - 3].description = yy.parseMessage($$[$0 - 1]);
          this.$ = $$[$0 - 3];
          break;
        case 50:
          $$[$0 - 1].draw = "participant";
          $$[$0 - 1].type = "addParticipant";
          this.$ = $$[$0 - 1];
          break;
        case 51:
          $$[$0 - 3].draw = "actor";
          $$[$0 - 3].type = "addParticipant";
          $$[$0 - 3].description = yy.parseMessage($$[$0 - 1]);
          this.$ = $$[$0 - 3];
          break;
        case 52:
        case 57:
          $$[$0 - 1].draw = "actor";
          $$[$0 - 1].type = "addParticipant";
          this.$ = $$[$0 - 1];
          break;
        case 53:
          $$[$0 - 1].type = "destroyParticipant";
          this.$ = $$[$0 - 1];
          break;
        case 54:
          $$[$0 - 3].draw = "participant";
          $$[$0 - 3].type = "addParticipant";
          $$[$0 - 3].description = yy.parseMessage($$[$0 - 1]);
          this.$ = $$[$0 - 3];
          break;
        case 55:
          $$[$0 - 1].draw = "participant";
          $$[$0 - 1].type = "addParticipant";
          this.$ = $$[$0 - 1];
          break;
        case 56:
          $$[$0 - 3].draw = "actor";
          $$[$0 - 3].type = "addParticipant";
          $$[$0 - 3].description = yy.parseMessage($$[$0 - 1]);
          this.$ = $$[$0 - 3];
          break;
        case 58:
          this.$ = [$$[$0 - 1], { type: "addNote", placement: $$[$0 - 2], actor: $$[$0 - 1].actor, text: $$[$0] }];
          break;
        case 59:
          $$[$0 - 2] = [].concat($$[$0 - 1], $$[$0 - 1]).slice(0, 2);
          $$[$0 - 2][0] = $$[$0 - 2][0].actor;
          $$[$0 - 2][1] = $$[$0 - 2][1].actor;
          this.$ = [$$[$0 - 1], { type: "addNote", placement: yy.PLACEMENT.OVER, actor: $$[$0 - 2].slice(0, 2), text: $$[$0] }];
          break;
        case 60:
          this.$ = [$$[$0 - 1], { type: "addLinks", actor: $$[$0 - 1].actor, text: $$[$0] }];
          break;
        case 61:
          this.$ = [$$[$0 - 1], { type: "addALink", actor: $$[$0 - 1].actor, text: $$[$0] }];
          break;
        case 62:
          this.$ = [$$[$0 - 1], { type: "addProperties", actor: $$[$0 - 1].actor, text: $$[$0] }];
          break;
        case 63:
          this.$ = [$$[$0 - 1], { type: "addDetails", actor: $$[$0 - 1].actor, text: $$[$0] }];
          break;
        case 66:
          this.$ = [$$[$0 - 2], $$[$0]];
          break;
        case 67:
          this.$ = $$[$0];
          break;
        case 68:
          this.$ = yy.PLACEMENT.LEFTOF;
          break;
        case 69:
          this.$ = yy.PLACEMENT.RIGHTOF;
          break;
        case 70:
          this.$ = [
            $$[$0 - 4],
            $$[$0 - 1],
            { type: "addMessage", from: $$[$0 - 4].actor, to: $$[$0 - 1].actor, signalType: $$[$0 - 3], msg: $$[$0], activate: true },
            { type: "activeStart", signalType: yy.LINETYPE.ACTIVE_START, actor: $$[$0 - 1].actor }
          ];
          break;
        case 71:
          this.$ = [
            $$[$0 - 4],
            $$[$0 - 1],
            { type: "addMessage", from: $$[$0 - 4].actor, to: $$[$0 - 1].actor, signalType: $$[$0 - 3], msg: $$[$0] },
            { type: "activeEnd", signalType: yy.LINETYPE.ACTIVE_END, actor: $$[$0 - 4].actor }
          ];
          break;
        case 72:
          this.$ = [
            $$[$0 - 4],
            $$[$0 - 1],
            { type: "addMessage", from: $$[$0 - 4].actor, to: $$[$0 - 1].actor, signalType: $$[$0 - 3], msg: $$[$0], activate: true, centralConnection: yy.LINETYPE.CENTRAL_CONNECTION },
            { type: "centralConnection", signalType: yy.LINETYPE.CENTRAL_CONNECTION, actor: $$[$0 - 1].actor }
          ];
          break;
        case 73:
          this.$ = [
            $$[$0 - 4],
            $$[$0 - 1],
            { type: "addMessage", from: $$[$0 - 4].actor, to: $$[$0 - 1].actor, signalType: $$[$0 - 2], msg: $$[$0], activate: false, centralConnection: yy.LINETYPE.CENTRAL_CONNECTION_REVERSE },
            { type: "centralConnectionReverse", signalType: yy.LINETYPE.CENTRAL_CONNECTION_REVERSE, actor: $$[$0 - 4].actor }
          ];
          break;
        case 74:
          this.$ = [
            $$[$0 - 5],
            $$[$0 - 1],
            { type: "addMessage", from: $$[$0 - 5].actor, to: $$[$0 - 1].actor, signalType: $$[$0 - 3], msg: $$[$0], activate: true, centralConnection: yy.LINETYPE.CENTRAL_CONNECTION_DUAL },
            { type: "centralConnection", signalType: yy.LINETYPE.CENTRAL_CONNECTION, actor: $$[$0 - 1].actor },
            { type: "centralConnectionReverse", signalType: yy.LINETYPE.CENTRAL_CONNECTION_REVERSE, actor: $$[$0 - 5].actor }
          ];
          break;
        case 75:
          this.$ = [$$[$0 - 3], $$[$0 - 1], { type: "addMessage", from: $$[$0 - 3].actor, to: $$[$0 - 1].actor, signalType: $$[$0 - 2], msg: $$[$0] }];
          break;
        case 76:
          this.$ = {
            type: "addParticipant",
            actor: $$[$0 - 1],
            config: $$[$0]
          };
          break;
        case 77:
          this.$ = $$[$0 - 1].trim();
          break;
        case 78:
          this.$ = { type: "addParticipant", actor: $$[$0] };
          break;
        case 79:
          this.$ = yy.LINETYPE.SOLID_OPEN;
          break;
        case 80:
          this.$ = yy.LINETYPE.DOTTED_OPEN;
          break;
        case 81:
          this.$ = yy.LINETYPE.SOLID;
          break;
        case 82:
          this.$ = yy.LINETYPE.SOLID_TOP;
          break;
        case 83:
          this.$ = yy.LINETYPE.SOLID_BOTTOM;
          break;
        case 84:
          this.$ = yy.LINETYPE.STICK_TOP;
          break;
        case 85:
          this.$ = yy.LINETYPE.STICK_BOTTOM;
          break;
        case 86:
          this.$ = yy.LINETYPE.SOLID_TOP_DOTTED;
          break;
        case 87:
          this.$ = yy.LINETYPE.SOLID_BOTTOM_DOTTED;
          break;
        case 88:
          this.$ = yy.LINETYPE.STICK_TOP_DOTTED;
          break;
        case 89:
          this.$ = yy.LINETYPE.STICK_BOTTOM_DOTTED;
          break;
        case 90:
          this.$ = yy.LINETYPE.SOLID_ARROW_TOP_REVERSE;
          break;
        case 91:
          this.$ = yy.LINETYPE.SOLID_ARROW_BOTTOM_REVERSE;
          break;
        case 92:
          this.$ = yy.LINETYPE.STICK_ARROW_TOP_REVERSE;
          break;
        case 93:
          this.$ = yy.LINETYPE.STICK_ARROW_BOTTOM_REVERSE;
          break;
        case 94:
          this.$ = yy.LINETYPE.SOLID_ARROW_TOP_REVERSE_DOTTED;
          break;
        case 95:
          this.$ = yy.LINETYPE.SOLID_ARROW_BOTTOM_REVERSE_DOTTED;
          break;
        case 96:
          this.$ = yy.LINETYPE.STICK_ARROW_TOP_REVERSE_DOTTED;
          break;
        case 97:
          this.$ = yy.LINETYPE.STICK_ARROW_BOTTOM_REVERSE_DOTTED;
          break;
        case 98:
          this.$ = yy.LINETYPE.BIDIRECTIONAL_SOLID;
          break;
        case 99:
          this.$ = yy.LINETYPE.DOTTED;
          break;
        case 100:
          this.$ = yy.LINETYPE.BIDIRECTIONAL_DOTTED;
          break;
        case 101:
          this.$ = yy.LINETYPE.SOLID_CROSS;
          break;
        case 102:
          this.$ = yy.LINETYPE.DOTTED_CROSS;
          break;
        case 103:
          this.$ = yy.LINETYPE.SOLID_POINT;
          break;
        case 104:
          this.$ = yy.LINETYPE.DOTTED_POINT;
          break;
        case 105:
          this.$ = yy.parseMessage($$[$0].trim().substring(1));
          break;
      }
    }, "anonymous"),
    table: [{ 3: 1, 4: $V0, 5: $V1, 6: $V2 }, { 1: [3] }, { 3: 5, 4: $V0, 5: $V1, 6: $V2 }, { 3: 6, 4: $V0, 5: $V1, 6: $V2 }, o([1, 4, 5, 10, 14, 15, 19, 22, 24, 30, 31, 32, 34, 36, 37, 38, 39, 40, 42, 44, 45, 47, 51, 53, 54, 56, 61, 62, 63, 64, 73], $V3, { 7: 7 }), { 1: [2, 1] }, { 1: [2, 2] }, { 1: [2, 3], 4: $V4, 5: $V5, 8: 8, 9: 10, 10: $V6, 13: 13, 14: $V7, 15: $V8, 18: 16, 19: $V9, 22: $Va, 23: 41, 24: $Vb, 25: 20, 26: 21, 27: 22, 28: 23, 29: 24, 30: $Vc, 31: $Vd, 32: $Ve, 34: $Vf, 36: $Vg, 37: $Vh, 38: $Vi, 39: $Vj, 40: $Vk, 42: $Vl, 44: $Vm, 45: $Vn, 47: $Vo, 51: $Vp, 53: $Vq, 54: $Vr, 56: $Vs, 61: $Vt, 62: $Vu, 63: $Vv, 64: $Vw, 73: $Vx }, o($Vy, [2, 5]), { 9: 48, 13: 13, 14: $V7, 15: $V8, 18: 16, 19: $V9, 22: $Va, 23: 41, 24: $Vb, 25: 20, 26: 21, 27: 22, 28: 23, 29: 24, 30: $Vc, 31: $Vd, 32: $Ve, 34: $Vf, 36: $Vg, 37: $Vh, 38: $Vi, 39: $Vj, 40: $Vk, 42: $Vl, 44: $Vm, 45: $Vn, 47: $Vo, 51: $Vp, 53: $Vq, 54: $Vr, 56: $Vs, 61: $Vt, 62: $Vu, 63: $Vv, 64: $Vw, 73: $Vx }, o($Vy, [2, 7]), o($Vy, [2, 8]), o($Vy, [2, 9]), o($Vy, [2, 15]), { 13: 49, 51: $Vp, 53: $Vq, 54: $Vr }, { 16: [1, 50] }, { 5: [1, 51] }, { 5: [1, 54], 20: [1, 52], 21: [1, 53] }, { 23: 55, 73: $Vx }, { 23: 56, 73: $Vx }, { 5: [1, 57] }, { 5: [1, 58] }, { 5: [1, 59] }, { 5: [1, 60] }, { 5: [1, 61] }, o($Vy, [2, 30]), o($Vy, [2, 31]), { 33: [1, 62] }, { 35: [1, 63] }, o($Vy, [2, 34]), { 16: [1, 64] }, { 16: [1, 65] }, { 16: [1, 66] }, { 16: [1, 67] }, { 16: [1, 68] }, { 16: [1, 69] }, { 16: [1, 70] }, { 16: [1, 71] }, { 23: 72, 55: 73, 73: $Vz }, { 23: 75, 55: 76, 73: $Vz }, { 23: 77, 73: $Vx }, { 69: 78, 72: [1, 79], 78: $VA, 79: $VB, 80: $VC, 81: $VD, 82: $VE, 83: $VF, 84: $VG, 85: $VH, 86: $VI, 87: $VJ, 88: $VK, 89: $VL, 90: $VM, 91: $VN, 92: $VO, 93: $VP, 94: $VQ, 95: $VR, 96: $VS, 97: $VT, 98: $VU, 99: $VV, 100: $VW, 101: $VX, 102: $VY, 103: $VZ }, { 57: 106, 59: [1, 107], 67: [1, 108], 68: [1, 109] }, { 23: 110, 73: $Vx }, { 23: 111, 73: $Vx }, { 23: 112, 73: $Vx }, { 23: 113, 73: $Vx }, o([5, 66, 72, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104], $V_), o($Vy, [2, 6]), o($Vy, [2, 16]), o($V$, [2, 10], { 11: 114 }), o($Vy, [2, 18]), { 5: [1, 116], 20: [1, 115] }, { 5: [1, 117] }, o($Vy, [2, 22]), { 5: [1, 118] }, { 5: [1, 119] }, o($Vy, [2, 25]), o($Vy, [2, 26]), o($Vy, [2, 27]), o($Vy, [2, 28]), o($Vy, [2, 29]), o($Vy, [2, 32]), o($Vy, [2, 33]), o($V01, $V3, { 7: 120 }), o($V01, $V3, { 7: 121 }), o($V01, $V3, { 7: 122 }), o($V11, $V3, { 41: 123, 7: 124 }), o($V21, $V3, { 43: 125, 7: 126 }), o($V21, $V3, { 7: 126, 43: 127 }), o($V31, $V3, { 46: 128, 7: 129 }), o($V01, $V3, { 7: 130 }), { 5: [1, 132], 52: [1, 131] }, { 5: [1, 134], 52: [1, 133] }, o($V41, $V_, { 74: 135, 75: [1, 136] }), { 5: [1, 138], 52: [1, 137] }, { 5: [1, 140], 52: [1, 139] }, { 5: [1, 141] }, { 23: 145, 70: [1, 142], 71: [1, 143], 72: [1, 144], 73: $Vx }, { 69: 146, 78: $VA, 79: $VB, 80: $VC, 81: $VD, 82: $VE, 83: $VF, 84: $VG, 85: $VH, 86: $VI, 87: $VJ, 88: $VK, 89: $VL, 90: $VM, 91: $VN, 92: $VO, 93: $VP, 94: $VQ, 95: $VR, 96: $VS, 97: $VT, 98: $VU, 99: $VV, 100: $VW, 101: $VX, 102: $VY, 103: $VZ }, o($V51, [2, 79]), o($V51, [2, 80]), o($V51, [2, 81]), o($V51, [2, 82]), o($V51, [2, 83]), o($V51, [2, 84]), o($V51, [2, 85]), o($V51, [2, 86]), o($V51, [2, 87]), o($V51, [2, 88]), o($V51, [2, 89]), o($V51, [2, 90]), o($V51, [2, 91]), o($V51, [2, 92]), o($V51, [2, 93]), o($V51, [2, 94]), o($V51, [2, 95]), o($V51, [2, 96]), o($V51, [2, 97]), o($V51, [2, 98]), o($V51, [2, 99]), o($V51, [2, 100]), o($V51, [2, 101]), o($V51, [2, 102]), o($V51, [2, 103]), o($V51, [2, 104]), { 23: 147, 73: $Vx }, { 23: 149, 60: 148, 73: $Vx }, { 73: [2, 68] }, { 73: [2, 69] }, { 58: 150, 104: $V61 }, { 58: 152, 104: $V61 }, { 58: 153, 104: $V61 }, { 58: 154, 104: $V61 }, { 4: [1, 157], 5: [1, 159], 12: 156, 13: 158, 17: [1, 155], 51: $Vp, 53: $Vq, 54: $Vr }, { 5: [1, 160] }, o($Vy, [2, 20]), o($Vy, [2, 21]), o($Vy, [2, 23]), o($Vy, [2, 24]), { 4: $V4, 5: $V5, 8: 8, 9: 10, 10: $V6, 13: 13, 14: $V7, 15: $V8, 17: [1, 161], 18: 16, 19: $V9, 22: $Va, 23: 41, 24: $Vb, 25: 20, 26: 21, 27: 22, 28: 23, 29: 24, 30: $Vc, 31: $Vd, 32: $Ve, 34: $Vf, 36: $Vg, 37: $Vh, 38: $Vi, 39: $Vj, 40: $Vk, 42: $Vl, 44: $Vm, 45: $Vn, 47: $Vo, 51: $Vp, 53: $Vq, 54: $Vr, 56: $Vs, 61: $Vt, 62: $Vu, 63: $Vv, 64: $Vw, 73: $Vx }, { 4: $V4, 5: $V5, 8: 8, 9: 10, 10: $V6, 13: 13, 14: $V7, 15: $V8, 17: [1, 162], 18: 16, 19: $V9, 22: $Va, 23: 41, 24: $Vb, 25: 20, 26: 21, 27: 22, 28: 23, 29: 24, 30: $Vc, 31: $Vd, 32: $Ve, 34: $Vf, 36: $Vg, 37: $Vh, 38: $Vi, 39: $Vj, 40: $Vk, 42: $Vl, 44: $Vm, 45: $Vn, 47: $Vo, 51: $Vp, 53: $Vq, 54: $Vr, 56: $Vs, 61: $Vt, 62: $Vu, 63: $Vv, 64: $Vw, 73: $Vx }, { 4: $V4, 5: $V5, 8: 8, 9: 10, 10: $V6, 13: 13, 14: $V7, 15: $V8, 17: [1, 163], 18: 16, 19: $V9, 22: $Va, 23: 41, 24: $Vb, 25: 20, 26: 21, 27: 22, 28: 23, 29: 24, 30: $Vc, 31: $Vd, 32: $Ve, 34: $Vf, 36: $Vg, 37: $Vh, 38: $Vi, 39: $Vj, 40: $Vk, 42: $Vl, 44: $Vm, 45: $Vn, 47: $Vo, 51: $Vp, 53: $Vq, 54: $Vr, 56: $Vs, 61: $Vt, 62: $Vu, 63: $Vv, 64: $Vw, 73: $Vx }, { 17: [1, 164] }, { 4: $V4, 5: $V5, 8: 8, 9: 10, 10: $V6, 13: 13, 14: $V7, 15: $V8, 17: [2, 47], 18: 16, 19: $V9, 22: $Va, 23: 41, 24: $Vb, 25: 20, 26: 21, 27: 22, 28: 23, 29: 24, 30: $Vc, 31: $Vd, 32: $Ve, 34: $Vf, 36: $Vg, 37: $Vh, 38: $Vi, 39: $Vj, 40: $Vk, 42: $Vl, 44: $Vm, 45: $Vn, 47: $Vo, 50: [1, 165], 51: $Vp, 53: $Vq, 54: $Vr, 56: $Vs, 61: $Vt, 62: $Vu, 63: $Vv, 64: $Vw, 73: $Vx }, { 17: [1, 166] }, { 4: $V4, 5: $V5, 8: 8, 9: 10, 10: $V6, 13: 13, 14: $V7, 15: $V8, 17: [2, 45], 18: 16, 19: $V9, 22: $Va, 23: 41, 24: $Vb, 25: 20, 26: 21, 27: 22, 28: 23, 29: 24, 30: $Vc, 31: $Vd, 32: $Ve, 34: $Vf, 36: $Vg, 37: $Vh, 38: $Vi, 39: $Vj, 40: $Vk, 42: $Vl, 44: $Vm, 45: $Vn, 47: $Vo, 49: [1, 167], 51: $Vp, 53: $Vq, 54: $Vr, 56: $Vs, 61: $Vt, 62: $Vu, 63: $Vv, 64: $Vw, 73: $Vx }, { 17: [1, 168] }, { 17: [1, 169] }, { 4: $V4, 5: $V5, 8: 8, 9: 10, 10: $V6, 13: 13, 14: $V7, 15: $V8, 17: [2, 43], 18: 16, 19: $V9, 22: $Va, 23: 41, 24: $Vb, 25: 20, 26: 21, 27: 22, 28: 23, 29: 24, 30: $Vc, 31: $Vd, 32: $Ve, 34: $Vf, 36: $Vg, 37: $Vh, 38: $Vi, 39: $Vj, 40: $Vk, 42: $Vl, 44: $Vm, 45: $Vn, 47: $Vo, 48: [1, 170], 51: $Vp, 53: $Vq, 54: $Vr, 56: $Vs, 61: $Vt, 62: $Vu, 63: $Vv, 64: $Vw, 73: $Vx }, { 4: $V4, 5: $V5, 8: 8, 9: 10, 10: $V6, 13: 13, 14: $V7, 15: $V8, 17: [1, 171], 18: 16, 19: $V9, 22: $Va, 23: 41, 24: $Vb, 25: 20, 26: 21, 27: 22, 28: 23, 29: 24, 30: $Vc, 31: $Vd, 32: $Ve, 34: $Vf, 36: $Vg, 37: $Vh, 38: $Vi, 39: $Vj, 40: $Vk, 42: $Vl, 44: $Vm, 45: $Vn, 47: $Vo, 51: $Vp, 53: $Vq, 54: $Vr, 56: $Vs, 61: $Vt, 62: $Vu, 63: $Vv, 64: $Vw, 73: $Vx }, { 16: [1, 172] }, o($Vy, [2, 50]), { 16: [1, 173] }, o($Vy, [2, 55]), o($V41, [2, 76]), { 76: [1, 174] }, { 16: [1, 175] }, o($Vy, [2, 52]), { 16: [1, 176] }, o($Vy, [2, 57]), o($Vy, [2, 53]), { 23: 177, 73: $Vx }, { 23: 178, 73: $Vx }, { 23: 179, 73: $Vx }, { 58: 180, 104: $V61 }, { 23: 181, 72: [1, 182], 73: $Vx }, { 58: 183, 104: $V61 }, { 58: 184, 104: $V61 }, { 66: [1, 185], 104: [2, 67] }, { 5: [2, 60] }, { 5: [2, 105] }, { 5: [2, 61] }, { 5: [2, 62] }, { 5: [2, 63] }, o($Vy, [2, 17]), o($V$, [2, 11]), { 13: 186, 51: $Vp, 53: $Vq, 54: $Vr }, o($V$, [2, 13]), o($V$, [2, 14]), o($Vy, [2, 19]), o($Vy, [2, 35]), o($Vy, [2, 36]), o($Vy, [2, 37]), o($Vy, [2, 38]), { 16: [1, 187] }, o($Vy, [2, 39]), { 16: [1, 188] }, o($Vy, [2, 40]), o($Vy, [2, 41]), { 16: [1, 189] }, o($Vy, [2, 42]), { 5: [1, 190] }, { 5: [1, 191] }, { 77: [1, 192] }, { 5: [1, 193] }, { 5: [1, 194] }, { 58: 195, 104: $V61 }, { 58: 196, 104: $V61 }, { 58: 197, 104: $V61 }, { 5: [2, 75] }, { 58: 198, 104: $V61 }, { 23: 199, 73: $Vx }, { 5: [2, 58] }, { 5: [2, 59] }, { 23: 200, 73: $Vx }, o($V$, [2, 12]), o($V11, $V3, { 7: 124, 41: 201 }), o($V21, $V3, { 7: 126, 43: 202 }), o($V31, $V3, { 7: 129, 46: 203 }), o($Vy, [2, 49]), o($Vy, [2, 54]), o($V41, [2, 77]), o($Vy, [2, 51]), o($Vy, [2, 56]), { 5: [2, 70] }, { 5: [2, 71] }, { 5: [2, 72] }, { 5: [2, 73] }, { 58: 204, 104: $V61 }, { 104: [2, 66] }, { 17: [2, 48] }, { 17: [2, 46] }, { 17: [2, 44] }, { 5: [2, 74] }],
    defaultActions: { 5: [2, 1], 6: [2, 2], 108: [2, 68], 109: [2, 69], 150: [2, 60], 151: [2, 105], 152: [2, 61], 153: [2, 62], 154: [2, 63], 180: [2, 75], 183: [2, 58], 184: [2, 59], 195: [2, 70], 196: [2, 71], 197: [2, 72], 198: [2, 73], 200: [2, 66], 201: [2, 48], 202: [2, 46], 203: [2, 44], 204: [2, 74] },
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
            return 5;
            break;
          case 1:
            break;
          case 2:
            break;
          case 3:
            break;
          case 4:
            break;
          case 5:
            break;
          case 6:
            return 20;
            break;
          case 7:
            this.begin("CONFIG");
            return 75;
            break;
          case 8:
            return 76;
            break;
          case 9:
            this.popState();
            this.begin("ALIAS");
            return 77;
            break;
          case 10:
            this.popState();
            this.popState();
            return 77;
            break;
          case 11:
            yy_.yytext = yy_.yytext.trim();
            return 73;
            break;
          case 12:
            yy_.yytext = yy_.yytext.trim();
            this.begin("ALIAS");
            return 73;
            break;
          case 13:
            yy_.yytext = yy_.yytext.trim();
            this.popState();
            return 73;
            break;
          case 14:
            this.popState();
            return 10;
            break;
          case 15:
            yy_.yytext = yy_.yytext.trim();
            this.popState();
            return 10;
            break;
          case 16:
            this.begin("LINE");
            return 15;
            break;
          case 17:
            this.begin("ID");
            return 51;
            break;
          case 18:
            this.begin("ID");
            return 53;
            break;
          case 19:
            return 14;
            break;
          case 20:
            this.begin("ID");
            return 54;
            break;
          case 21:
            this.popState();
            this.popState();
            this.begin("LINE");
            return 52;
            break;
          case 22:
            this.popState();
            this.popState();
            return 5;
            break;
          case 23:
            this.begin("LINE");
            return 37;
            break;
          case 24:
            this.begin("LINE");
            return 38;
            break;
          case 25:
            this.begin("LINE");
            return 39;
            break;
          case 26:
            this.begin("LINE");
            return 40;
            break;
          case 27:
            this.begin("LINE");
            return 50;
            break;
          case 28:
            this.begin("LINE");
            return 42;
            break;
          case 29:
            this.begin("LINE");
            return 44;
            break;
          case 30:
            this.begin("LINE");
            return 49;
            break;
          case 31:
            this.begin("LINE");
            return 45;
            break;
          case 32:
            this.begin("LINE");
            return 48;
            break;
          case 33:
            this.begin("LINE");
            return 47;
            break;
          case 34:
            this.popState();
            return 16;
            break;
          case 35:
            return 17;
            break;
          case 36:
            return 67;
            break;
          case 37:
            return 68;
            break;
          case 38:
            return 61;
            break;
          case 39:
            return 62;
            break;
          case 40:
            return 63;
            break;
          case 41:
            return 64;
            break;
          case 42:
            return 59;
            break;
          case 43:
            return 56;
            break;
          case 44:
            this.begin("ID");
            return 22;
            break;
          case 45:
            this.begin("ID");
            return 24;
            break;
          case 46:
            return 30;
            break;
          case 47:
            return 31;
            break;
          case 48:
            this.begin("acc_title");
            return 32;
            break;
          case 49:
            this.popState();
            return "acc_title_value";
            break;
          case 50:
            this.begin("acc_descr");
            return 34;
            break;
          case 51:
            this.popState();
            return "acc_descr_value";
            break;
          case 52:
            this.begin("acc_descr_multiline");
            break;
          case 53:
            this.popState();
            break;
          case 54:
            return "acc_descr_multiline_value";
            break;
          case 55:
            return 6;
            break;
          case 56:
            return 19;
            break;
          case 57:
            return 21;
            break;
          case 58:
            return 66;
            break;
          case 59:
            return 5;
            break;
          case 60:
            yy_.yytext = yy_.yytext.trim();
            return 73;
            break;
          case 61:
            return 80;
            break;
          case 62:
            return 97;
            break;
          case 63:
            return 98;
            break;
          case 64:
            return 99;
            break;
          case 65:
            return 78;
            break;
          case 66:
            return 79;
            break;
          case 67:
            return 100;
            break;
          case 68:
            return 101;
            break;
          case 69:
            return 102;
            break;
          case 70:
            return 103;
            break;
          case 71:
            return 85;
            break;
          case 72:
            return 86;
            break;
          case 73:
            return 87;
            break;
          case 74:
            return 88;
            break;
          case 75:
            return 93;
            break;
          case 76:
            return 94;
            break;
          case 77:
            return 95;
            break;
          case 78:
            return 96;
            break;
          case 79:
            return 81;
            break;
          case 80:
            return 82;
            break;
          case 81:
            return 83;
            break;
          case 82:
            return 84;
            break;
          case 83:
            return 89;
            break;
          case 84:
            return 90;
            break;
          case 85:
            return 91;
            break;
          case 86:
            return 92;
            break;
          case 87:
            return 104;
            break;
          case 88:
            return 104;
            break;
          case 89:
            return 70;
            break;
          case 90:
            return 71;
            break;
          case 91:
            return 72;
            break;
          case 92:
            return 5;
            break;
          case 93:
            return 10;
            break;
        }
      }, "anonymous"),
      rules: [/^(?:[\n]+)/i, /^(?:\s+)/i, /^(?:((?!\n)\s)+)/i, /^(?:#[^\n]*)/i, /^(?:%(?!\{)[^\n]*)/i, /^(?:[^\}]%%[^\n]*)/i, /^(?:([0-9]+(\.[0-9]{1,2})?|\.[0-9]{1,2})(?=[ \n]+))/i, /^(?:@\{)/i, /^(?:[^\}]+)/i, /^(?:\}(?=\s+as\s))/i, /^(?:\})/i, /^(?:[^\<->\->:\n,;@\s]+(?=@\{))/i, /^(?:[^<>:\n,;@\s]+(?=\s+as\s))/i, /^(?:[^<>:\n,;@]+(?=\s*[\n;#]|$))/i, /^(?:[^<>:\n,;@]*<[^\n]*)/i, /^(?:[^\n]+)/i, /^(?:box\b)/i, /^(?:participant\b)/i, /^(?:actor\b)/i, /^(?:create\b)/i, /^(?:destroy\b)/i, /^(?:as\b)/i, /^(?:(?:))/i, /^(?:loop\b)/i, /^(?:rect\b)/i, /^(?:opt\b)/i, /^(?:alt\b)/i, /^(?:else\b)/i, /^(?:par\b)/i, /^(?:par_over\b)/i, /^(?:and\b)/i, /^(?:critical\b)/i, /^(?:option\b)/i, /^(?:break\b)/i, /^(?:(?:[:]?(?:no)?wrap)?[^#\n;]*)/i, /^(?:end\b)/i, /^(?:left of\b)/i, /^(?:right of\b)/i, /^(?:links\b)/i, /^(?:link\b)/i, /^(?:properties\b)/i, /^(?:details\b)/i, /^(?:over\b)/i, /^(?:note\b)/i, /^(?:activate\b)/i, /^(?:deactivate\b)/i, /^(?:title\s[^#\n;]+)/i, /^(?:title:\s[^#\n;]+)/i, /^(?:accTitle\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*\{\s*)/i, /^(?:[\}])/i, /^(?:[^\}]*)/i, /^(?:sequenceDiagram\b)/i, /^(?:autonumber\b)/i, /^(?:off\b)/i, /^(?:,)/i, /^(?:;)/i, /^(?:[^\/\\\+\()\+<\->\->:\n,;]+((?!(-x|--x|-\)|--\)|-\|\\|-\\|-\/|-\/\/|-\|\/|\/\|-|\\\|-|\/\/-|\\\\-|\/\|-|--\|\\|--|\(\)))[\-]*[^\+<\->\->:\n,;]+)*)/i, /^(?:->>)/i, /^(?:<<->>)/i, /^(?:-->>)/i, /^(?:<<-->>)/i, /^(?:->)/i, /^(?:-->)/i, /^(?:-[x])/i, /^(?:--[x])/i, /^(?:-[\)])/i, /^(?:--[\)])/i, /^(?:--\|\\)/i, /^(?:--\|\/)/i, /^(?:--\\\\)/i, /^(?:--\/\/)/i, /^(?:\/\|--)/i, /^(?:\\\|--)/i, /^(?:\/\/--)/i, /^(?:\\\\--)/i, /^(?:-\|\\)/i, /^(?:-\|\/)/i, /^(?:-\\\\)/i, /^(?:-\/\/)/i, /^(?:\/\|-)/i, /^(?:\\\|-)/i, /^(?:\/\/-)/i, /^(?:\\\\-)/i, /^(?::(?:(?:no)?wrap)?[^#\n;]*)/i, /^(?::)/i, /^(?:\+)/i, /^(?:-)/i, /^(?:\(\))/i, /^(?:$)/i, /^(?:.)/i],
      conditions: { acc_descr_multiline: { rules: [53, 54], inclusive: false }, acc_descr: { rules: [51], inclusive: false }, acc_title: { rules: [49], inclusive: false }, ID: { rules: [2, 3, 7, 11, 12, 13, 14, 15], inclusive: false }, ALIAS: { rules: [2, 3, 21, 22], inclusive: false }, LINE: { rules: [2, 3, 34], inclusive: false }, CONFIG: { rules: [8, 9, 10], inclusive: false }, CONFIG_DATA: { rules: [], inclusive: false }, INITIAL: { rules: [0, 1, 3, 4, 5, 6, 16, 17, 18, 19, 20, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 50, 52, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93], inclusive: true } }
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
var sequenceDiagram_default = parser;
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
  DOTTED_POINT: 25,
  AUTONUMBER: 26,
  CRITICAL_START: 27,
  CRITICAL_OPTION: 28,
  CRITICAL_END: 29,
  BREAK_START: 30,
  BREAK_END: 31,
  PAR_OVER_START: 32,
  BIDIRECTIONAL_SOLID: 33,
  BIDIRECTIONAL_DOTTED: 34,
  SOLID_TOP: 41,
  SOLID_BOTTOM: 42,
  STICK_TOP: 43,
  STICK_BOTTOM: 44,
  SOLID_ARROW_TOP_REVERSE: 45,
  SOLID_ARROW_BOTTOM_REVERSE: 46,
  STICK_ARROW_TOP_REVERSE: 47,
  STICK_ARROW_BOTTOM_REVERSE: 48,
  SOLID_TOP_DOTTED: 51,
  SOLID_BOTTOM_DOTTED: 52,
  STICK_TOP_DOTTED: 53,
  STICK_BOTTOM_DOTTED: 54,
  SOLID_ARROW_TOP_REVERSE_DOTTED: 55,
  SOLID_ARROW_BOTTOM_REVERSE_DOTTED: 56,
  STICK_ARROW_TOP_REVERSE_DOTTED: 57,
  STICK_ARROW_BOTTOM_REVERSE_DOTTED: 58,
  CENTRAL_CONNECTION: 59,
  CENTRAL_CONNECTION_REVERSE: 60,
  CENTRAL_CONNECTION_DUAL: 61
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
var PARTICIPANT_TYPE = {
  ACTOR: "actor",
  BOUNDARY: "boundary",
  COLLECTIONS: "collections",
  CONTROL: "control",
  DATABASE: "database",
  ENTITY: "entity",
  PARTICIPANT: "participant",
  QUEUE: "queue"
};
var SequenceDB = class {
  constructor() {
    this.state = new ImperativeState(() => ({
      prevActor: undefined,
      actors: /* @__PURE__ */ new Map,
      createdActors: /* @__PURE__ */ new Map,
      destroyedActors: /* @__PURE__ */ new Map,
      boxes: [],
      messages: [],
      notes: [],
      sequenceNumbersEnabled: false,
      wrapEnabled: undefined,
      currentBox: undefined,
      lastCreated: undefined,
      lastDestroyed: undefined
    }));
    this.setAccTitle = setAccTitle;
    this.setAccDescription = setAccDescription;
    this.setDiagramTitle = setDiagramTitle;
    this.getAccTitle = getAccTitle;
    this.getAccDescription = getAccDescription;
    this.getDiagramTitle = getDiagramTitle;
    this.apply = this.apply.bind(this);
    this.parseBoxData = this.parseBoxData.bind(this);
    this.parseMessage = this.parseMessage.bind(this);
    this.clear();
    this.setWrap(getConfig2().wrap);
    this.LINETYPE = LINETYPE;
    this.ARROWTYPE = ARROWTYPE;
    this.PLACEMENT = PLACEMENT;
  }
  static {
    __name(this, "SequenceDB");
  }
  addBox(data) {
    this.state.records.boxes.push({
      name: data.text,
      wrap: data.wrap ?? this.autoWrap(),
      fill: data.color,
      actorKeys: []
    });
    this.state.records.currentBox = this.state.records.boxes.slice(-1)[0];
  }
  addActor(id, name, description, type, metadata) {
    let assignedBox = this.state.records.currentBox;
    let doc;
    if (metadata !== undefined) {
      let yamlData;
      if (!metadata.includes(`
`)) {
        yamlData = `{
` + metadata + `
}`;
      } else {
        yamlData = metadata + `
`;
      }
      doc = load(yamlData, { schema: JSON_SCHEMA });
    }
    type = doc?.type ?? type;
    if (doc?.alias && (!description || description.text === name)) {
      description = { text: doc.alias, wrap: description?.wrap, type };
    }
    const old = this.state.records.actors.get(id);
    if (old) {
      if (this.state.records.currentBox && old.box && this.state.records.currentBox !== old.box) {
        throw new Error(`A same participant should only be defined in one Box: ${old.name} can't be in '${old.box.name}' and in '${this.state.records.currentBox.name}' at the same time.`);
      }
      assignedBox = old.box ? old.box : this.state.records.currentBox;
      old.box = assignedBox;
      if (old && name === old.name && description == null) {
        return;
      }
    }
    if (description?.text == null) {
      description = { text: name, type };
    }
    if (type == null || description.text == null) {
      description = { text: name, type };
    }
    this.state.records.actors.set(id, {
      box: assignedBox,
      name,
      description: description.text,
      wrap: description.wrap ?? this.autoWrap(),
      prevActor: this.state.records.prevActor,
      links: {},
      properties: {},
      actorCnt: null,
      rectData: null,
      type: type ?? "participant"
    });
    if (this.state.records.prevActor) {
      const prevActorInRecords = this.state.records.actors.get(this.state.records.prevActor);
      if (prevActorInRecords) {
        prevActorInRecords.nextActor = id;
      }
    }
    if (this.state.records.currentBox) {
      this.state.records.currentBox.actorKeys.push(id);
    }
    this.state.records.prevActor = id;
  }
  activationCount(part) {
    let i;
    let count = 0;
    if (!part) {
      return 0;
    }
    for (i = 0;i < this.state.records.messages.length; i++) {
      if (this.state.records.messages[i].type === this.LINETYPE.ACTIVE_START && this.state.records.messages[i].from === part) {
        count++;
      }
      if (this.state.records.messages[i].type === this.LINETYPE.ACTIVE_END && this.state.records.messages[i].from === part) {
        count--;
      }
    }
    return count;
  }
  addMessage(idFrom, idTo, message, answer) {
    this.state.records.messages.push({
      id: this.state.records.messages.length.toString(),
      from: idFrom,
      to: idTo,
      message: message.text,
      wrap: message.wrap ?? this.autoWrap(),
      answer
    });
  }
  addSignal(idFrom, idTo, message, messageType, activate = false, centralConnection) {
    if (messageType === this.LINETYPE.ACTIVE_END) {
      const cnt = this.activationCount(idFrom ?? "");
      if (cnt < 1) {
        const error = new Error("Trying to inactivate an inactive participant (" + idFrom + ")");
        error.hash = {
          text: "->>-",
          token: "->>-",
          line: "1",
          loc: { first_line: 1, last_line: 1, first_column: 1, last_column: 1 },
          expected: ["'ACTIVE_PARTICIPANT'"]
        };
        throw error;
      }
    }
    this.state.records.messages.push({
      id: this.state.records.messages.length.toString(),
      from: idFrom,
      to: idTo,
      message: message?.text ?? "",
      wrap: message?.wrap ?? this.autoWrap(),
      type: messageType,
      activate,
      centralConnection: centralConnection ?? 0
    });
    return true;
  }
  hasAtLeastOneBox() {
    return this.state.records.boxes.length > 0;
  }
  hasAtLeastOneBoxWithTitle() {
    return this.state.records.boxes.some((b) => b.name);
  }
  getMessages() {
    return this.state.records.messages;
  }
  getBoxes() {
    return this.state.records.boxes;
  }
  getActors() {
    return this.state.records.actors;
  }
  getCreatedActors() {
    return this.state.records.createdActors;
  }
  getDestroyedActors() {
    return this.state.records.destroyedActors;
  }
  getActor(id) {
    return this.state.records.actors.get(id);
  }
  getActorKeys() {
    return [...this.state.records.actors.keys()];
  }
  enableSequenceNumbers() {
    this.state.records.sequenceNumbersEnabled = true;
  }
  disableSequenceNumbers() {
    this.state.records.sequenceNumbersEnabled = false;
  }
  showSequenceNumbers() {
    return this.state.records.sequenceNumbersEnabled;
  }
  setWrap(wrapSetting) {
    this.state.records.wrapEnabled = wrapSetting;
  }
  extractWrap(text) {
    if (text === undefined) {
      return {};
    }
    text = text.trim();
    const wrap = /^:?wrap:/.exec(text) !== null ? true : /^:?nowrap:/.exec(text) !== null ? false : undefined;
    const cleanedText = (wrap === undefined ? text : text.replace(/^:?(?:no)?wrap:/, "")).trim();
    return { cleanedText, wrap };
  }
  autoWrap() {
    if (this.state.records.wrapEnabled !== undefined) {
      return this.state.records.wrapEnabled;
    }
    return getConfig2().sequence?.wrap ?? false;
  }
  clear() {
    this.state.reset();
    clear();
  }
  parseMessage(str) {
    const trimmedStr = str.trim();
    const { wrap, cleanedText } = this.extractWrap(trimmedStr);
    const message = {
      text: cleanedText,
      wrap
    };
    log.debug(`parseMessage: ${JSON.stringify(message)}`);
    return message;
  }
  parseBoxData(str) {
    const match = /^((?:rgba?|hsla?)\s*\(.*\)|\w*)(.*)$/.exec(str);
    let color = match?.[1] ? match[1].trim() : "transparent";
    let title = match?.[2] ? match[2].trim() : undefined;
    if (window?.CSS) {
      if (!window.CSS.supports("color", color)) {
        color = "transparent";
        title = str.trim();
      }
    } else {
      const style = new Option().style;
      style.color = color;
      if (style.color !== color) {
        color = "transparent";
        title = str.trim();
      }
    }
    const { wrap, cleanedText } = this.extractWrap(title);
    return {
      text: cleanedText ? sanitizeText(cleanedText, getConfig2()) : undefined,
      color,
      wrap
    };
  }
  addNote(actor, placement, message) {
    const note = {
      actor,
      placement,
      message: message.text,
      wrap: message.wrap ?? this.autoWrap()
    };
    const actors = [].concat(actor, actor);
    this.state.records.notes.push(note);
    this.state.records.messages.push({
      id: this.state.records.messages.length.toString(),
      from: actors[0],
      to: actors[1],
      message: message.text,
      wrap: message.wrap ?? this.autoWrap(),
      type: this.LINETYPE.NOTE,
      placement
    });
  }
  addLinks(actorId, text) {
    const actor = this.getActor(actorId);
    try {
      let sanitizedText = sanitizeText(text.text, getConfig2());
      sanitizedText = sanitizedText.replace(/&equals;/g, "=");
      sanitizedText = sanitizedText.replace(/&amp;/g, "&");
      const links = JSON.parse(sanitizedText);
      this.insertLinks(actor, links);
    } catch (e) {
      log.error("error while parsing actor link text", e);
    }
  }
  addALink(actorId, text) {
    const actor = this.getActor(actorId);
    try {
      const links = {};
      let sanitizedText = sanitizeText(text.text, getConfig2());
      const sep = sanitizedText.indexOf("@");
      sanitizedText = sanitizedText.replace(/&equals;/g, "=");
      sanitizedText = sanitizedText.replace(/&amp;/g, "&");
      const label = sanitizedText.slice(0, sep - 1).trim();
      const link = sanitizedText.slice(sep + 1).trim();
      links[label] = link;
      this.insertLinks(actor, links);
    } catch (e) {
      log.error("error while parsing actor link text", e);
    }
  }
  insertLinks(actor, links) {
    if (actor.links == null) {
      actor.links = links;
    } else {
      for (const key in links) {
        actor.links[key] = links[key];
      }
    }
  }
  addProperties(actorId, text) {
    const actor = this.getActor(actorId);
    try {
      const sanitizedText = sanitizeText(text.text, getConfig2());
      const properties = JSON.parse(sanitizedText);
      this.insertProperties(actor, properties);
    } catch (e) {
      log.error("error while parsing actor properties text", e);
    }
  }
  insertProperties(actor, properties) {
    if (actor.properties == null) {
      actor.properties = properties;
    } else {
      for (const key in properties) {
        actor.properties[key] = properties[key];
      }
    }
  }
  boxEnd() {
    this.state.records.currentBox = undefined;
  }
  addDetails(actorId, text) {
    const actor = this.getActor(actorId);
    const elem = document.getElementById(text.text);
    try {
      const text2 = elem.innerHTML;
      const details = JSON.parse(text2);
      if (details.properties) {
        this.insertProperties(actor, details.properties);
      }
      if (details.links) {
        this.insertLinks(actor, details.links);
      }
    } catch (e) {
      log.error("error while parsing actor details text", e);
    }
  }
  getActorProperty(actor, key) {
    if (actor?.properties !== undefined) {
      return actor.properties[key];
    }
    return;
  }
  apply(param) {
    if (Array.isArray(param)) {
      param.forEach((item) => {
        this.apply(item);
      });
    } else {
      switch (param.type) {
        case "sequenceIndex":
          this.state.records.messages.push({
            id: this.state.records.messages.length.toString(),
            from: undefined,
            to: undefined,
            message: {
              start: param.sequenceIndex,
              step: param.sequenceIndexStep,
              visible: param.sequenceVisible
            },
            wrap: false,
            type: param.signalType
          });
          break;
        case "addParticipant":
          this.addActor(param.actor, param.actor, param.description, param.draw, param.config);
          break;
        case "createParticipant":
          if (this.state.records.actors.has(param.actor)) {
            throw new Error("It is not possible to have actors with the same id, even if one is destroyed before the next is created. Use 'AS' aliases to simulate the behavior");
          }
          this.state.records.lastCreated = param.actor;
          this.addActor(param.actor, param.actor, param.description, param.draw, param.config);
          this.state.records.createdActors.set(param.actor, this.state.records.messages.length);
          break;
        case "destroyParticipant":
          this.state.records.lastDestroyed = param.actor;
          this.state.records.destroyedActors.set(param.actor, this.state.records.messages.length);
          break;
        case "activeStart":
          this.addSignal(param.actor, undefined, undefined, param.signalType);
          break;
        case "centralConnection":
          this.addSignal(param.actor, undefined, undefined, param.signalType);
          break;
        case "centralConnectionReverse":
          this.addSignal(param.actor, undefined, undefined, param.signalType);
          break;
        case "activeEnd":
          this.addSignal(param.actor, undefined, undefined, param.signalType);
          break;
        case "addNote":
          this.addNote(param.actor, param.placement, param.text);
          break;
        case "addLinks":
          this.addLinks(param.actor, param.text);
          break;
        case "addALink":
          this.addALink(param.actor, param.text);
          break;
        case "addProperties":
          this.addProperties(param.actor, param.text);
          break;
        case "addDetails":
          this.addDetails(param.actor, param.text);
          break;
        case "addMessage":
          if (this.state.records.lastCreated) {
            if (param.to !== this.state.records.lastCreated) {
              throw new Error("The created participant " + this.state.records.lastCreated.name + " does not have an associated creating message after its declaration. Please check the sequence diagram.");
            } else {
              this.state.records.lastCreated = undefined;
            }
          } else if (this.state.records.lastDestroyed) {
            if (param.to !== this.state.records.lastDestroyed && param.from !== this.state.records.lastDestroyed) {
              throw new Error("The destroyed participant " + this.state.records.lastDestroyed.name + " does not have an associated destroying message after its declaration. Please check the sequence diagram.");
            } else {
              this.state.records.lastDestroyed = undefined;
            }
          }
          this.addSignal(param.from, param.to, param.msg, param.signalType, param.activate, param.centralConnection);
          break;
        case "boxStart":
          this.addBox(param.boxData);
          break;
        case "boxEnd":
          this.boxEnd();
          break;
        case "loopStart":
          this.addSignal(undefined, undefined, param.loopText, param.signalType);
          break;
        case "loopEnd":
          this.addSignal(undefined, undefined, undefined, param.signalType);
          break;
        case "rectStart":
          this.addSignal(undefined, undefined, param.color, param.signalType);
          break;
        case "rectEnd":
          this.addSignal(undefined, undefined, undefined, param.signalType);
          break;
        case "optStart":
          this.addSignal(undefined, undefined, param.optText, param.signalType);
          break;
        case "optEnd":
          this.addSignal(undefined, undefined, undefined, param.signalType);
          break;
        case "altStart":
          this.addSignal(undefined, undefined, param.altText, param.signalType);
          break;
        case "else":
          this.addSignal(undefined, undefined, param.altText, param.signalType);
          break;
        case "altEnd":
          this.addSignal(undefined, undefined, undefined, param.signalType);
          break;
        case "setAccTitle":
          setAccTitle(param.text);
          break;
        case "parStart":
          this.addSignal(undefined, undefined, param.parText, param.signalType);
          break;
        case "and":
          this.addSignal(undefined, undefined, param.parText, param.signalType);
          break;
        case "parEnd":
          this.addSignal(undefined, undefined, undefined, param.signalType);
          break;
        case "criticalStart":
          this.addSignal(undefined, undefined, param.criticalText, param.signalType);
          break;
        case "option":
          this.addSignal(undefined, undefined, param.optionText, param.signalType);
          break;
        case "criticalEnd":
          this.addSignal(undefined, undefined, undefined, param.signalType);
          break;
        case "breakStart":
          this.addSignal(undefined, undefined, param.breakText, param.signalType);
          break;
        case "breakEnd":
          this.addSignal(undefined, undefined, undefined, param.signalType);
          break;
      }
    }
  }
  getConfig() {
    return getConfig2().sequence;
  }
};
var getStyles = /* @__PURE__ */ __name((options) => {
  const dropShadow = options.dropShadow ?? "none";
  const { look } = getConfig2();
  return `.actor {
    stroke: ${options.actorBorder};
    fill: ${options.actorBkg};
    stroke-width: ${options.strokeWidth ?? 1};
  }

  rect.actor.outer-path[data-look="neo"] {
      filter: ${dropShadow};
  }

  rect.note[data-look="neo"] {
      stroke:${options.noteBorderColor};
      fill:${options.noteBkgColor};
      filter: ${dropShadow};
  }

  text.actor > tspan {
    fill: ${options.actorTextColor};
    stroke: none;
  }

  .actor-line {
    stroke: ${options.actorLineColor};
  }

  .innerArc {
    stroke-width: 1.5;
    stroke-dasharray: none;
  }

  .messageLine0 {
    stroke-width: 1.5;
    stroke-dasharray: none;
    stroke: ${options.signalColor};
  }

  .messageLine1 {
    stroke-width: 1.5;
    stroke-dasharray: 2, 2;
    stroke: ${options.signalColor};
  }

  [id$="-arrowhead"] path {
    fill: ${options.signalColor};
    stroke: ${options.signalColor};
  }

  .sequenceNumber {
    fill: ${options.sequenceNumberColor};
  }

  [id$="-sequencenumber"] {
    fill: ${options.signalColor};
  }

  [id$="-crosshead"] path {
    fill: ${options.signalColor};
    stroke: ${options.signalColor};
  }

  .messageText {
    fill: ${options.signalTextColor};
    stroke: none;
  }

  .labelBox {
    stroke: ${options.labelBoxBorderColor};
    fill: ${options.labelBoxBkgColor};
    filter: ${look === "neo" ? dropShadow : "none"};
  }

  .labelText, .labelText > tspan {
    fill: ${options.labelTextColor};
    stroke: none;
  }

  .loopText, .loopText > tspan {
    fill: ${options.loopTextColor};
    stroke: none;
  }

  .sectionTitle, .sectionTitle > tspan {
    fill: ${options.loopTextColor};
    stroke: none;
  }

  .loopLine {
    stroke-width: 2px;
    stroke-dasharray: 2, 2;
    stroke: ${options.labelBoxBorderColor};
    fill: ${options.labelBoxBorderColor};
  }

  .note {
    //stroke: #decc93;
    stroke: ${options.noteBorderColor};
    fill: ${options.noteBkgColor};
  }

  .noteText, .noteText > tspan {
    fill: ${options.noteTextColor};
    stroke: none;
    ${options.noteFontWeight ? `font-weight: ${options.noteFontWeight};` : ""}
  }

  .activation0 {
    fill: ${options.activationBkgColor};
    stroke: ${options.activationBorderColor};
  }

  .activation1 {
    fill: ${options.activationBkgColor};
    stroke: ${options.activationBorderColor};
  }

  .activation2 {
    fill: ${options.activationBkgColor};
    stroke: ${options.activationBorderColor};
  }

  .actorPopupMenu {
    position: absolute;
  }

  .actorPopupMenuPanel {
    position: absolute;
    fill: ${options.actorBkg};
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));
}
  .actor-man circle, line {
    fill: ${options.actorBkg};
    stroke-width: 2px;
  }

  g rect.rect {
    filter: ${dropShadow};
    stroke: ${options.nodeBorder};
  }
`;
}, "getStyles");
var styles_default = getStyles;
var ACTOR_TYPE_WIDTH = 18 * 2;
var TOP_ACTOR_CLASS = "actor-top";
var BOTTOM_ACTOR_CLASS = "actor-bottom";
var ACTOR_BOX_CLASS = "actor-box";
var ACTOR_MAN_FIGURE_CLASS = "actor-man";
var COLOR_THEMES = /* @__PURE__ */ new Set(["redux-color", "redux-dark-color"]);
var drawRect2 = /* @__PURE__ */ __name(function(elem, rectData) {
  const rectElement = drawRect(elem, rectData);
  if (getConfig().look === "neo") {
    rectElement.attr("data-look", "neo");
  }
  return rectElement;
}, "drawRect");
var drawPopup = /* @__PURE__ */ __name(function(elem, actor, minMenuWidth, textAttrs, forceMenus) {
  if (actor.links === undefined || actor.links === null || Object.keys(actor.links).length === 0) {
    return { height: 0, width: 0 };
  }
  const links = actor.links;
  const actorCnt2 = actor.actorCnt;
  const rectData = actor.rectData;
  var displayValue = "none";
  if (forceMenus) {
    displayValue = "block !important";
  }
  const g = elem.append("g");
  g.attr("id", "actor" + actorCnt2 + "_popup");
  g.attr("class", "actorPopupMenu");
  g.attr("display", displayValue);
  var actorClass = "";
  if (rectData.class !== undefined) {
    actorClass = " " + rectData.class;
  }
  let menuWidth = rectData.width > minMenuWidth ? rectData.width : minMenuWidth;
  const rectElem = g.append("rect");
  rectElem.attr("class", "actorPopupMenuPanel" + actorClass);
  rectElem.attr("x", rectData.x);
  rectElem.attr("y", rectData.height);
  rectElem.attr("fill", rectData.fill);
  rectElem.attr("stroke", rectData.stroke);
  rectElem.attr("width", menuWidth);
  rectElem.attr("height", rectData.height);
  rectElem.attr("rx", rectData.rx);
  rectElem.attr("ry", rectData.ry);
  if (links != null) {
    var linkY = 20;
    for (let key in links) {
      var linkElem = g.append("a");
      var sanitizedLink = import_sanitize_url.sanitizeUrl(links[key]);
      linkElem.attr("xlink:href", sanitizedLink);
      linkElem.attr("target", "_blank");
      _drawMenuItemTextCandidateFunc(textAttrs)(key, linkElem, rectData.x + 10, rectData.height + linkY, menuWidth, 20, { class: "actor" }, textAttrs);
      linkY += 30;
    }
  }
  rectElem.attr("height", linkY);
  return { height: rectData.height + linkY, width: menuWidth };
}, "drawPopup");
var popupMenuToggle = /* @__PURE__ */ __name(function(popId) {
  return "var pu = document.getElementById('" + popId + "'); if (pu != null) { pu.style.display = pu.style.display == 'block' ? 'none' : 'block'; }";
}, "popupMenuToggle");
var drawKatex = /* @__PURE__ */ __name(async function(elem, textData, msgModel = null) {
  let textElem = elem.append("foreignObject");
  const linesSanitized = await renderKatexSanitized(textData.text, getConfig());
  const divElem = textElem.append("xhtml:div").attr("style", "width: fit-content;").attr("xmlns", "http://www.w3.org/1999/xhtml").html(linesSanitized);
  const dim = divElem.node().getBoundingClientRect();
  textElem.attr("height", Math.round(dim.height)).attr("width", Math.round(dim.width));
  if (textData.class === "noteText") {
    const rectElem = elem.node().firstChild;
    rectElem.setAttribute("height", dim.height + 2 * textData.textMargin);
    const rectDim = rectElem.getBBox();
    textElem.attr("x", Math.round(rectDim.x + rectDim.width / 2 - dim.width / 2)).attr("y", Math.round(rectDim.y + rectDim.height / 2 - dim.height / 2));
  } else if (msgModel) {
    let { startx, stopx, starty } = msgModel;
    if (startx > stopx) {
      const temp = startx;
      startx = stopx;
      stopx = temp;
    }
    textElem.attr("x", Math.round(startx + Math.abs(startx - stopx) / 2 - dim.width / 2));
    if (textData.class === "loopText") {
      textElem.attr("y", Math.round(starty));
    } else {
      textElem.attr("y", Math.round(starty - dim.height));
    }
  }
  return [textElem];
}, "drawKatex");
var drawText = /* @__PURE__ */ __name(function(elem, textData) {
  let prevTextHeight = 0;
  let textHeight = 0;
  const lines = textData.text.split(common_default.lineBreakRegex);
  const [_textFontSize, _textFontSizePx] = parseFontSize(textData.fontSize);
  let textElems = [];
  let dy = 0;
  let yfunc = /* @__PURE__ */ __name(() => textData.y, "yfunc");
  if (textData.valign !== undefined && textData.textMargin !== undefined && textData.textMargin > 0) {
    switch (textData.valign) {
      case "top":
      case "start":
        yfunc = /* @__PURE__ */ __name(() => Math.round(textData.y + textData.textMargin), "yfunc");
        break;
      case "middle":
      case "center":
        yfunc = /* @__PURE__ */ __name(() => Math.round(textData.y + (prevTextHeight + textHeight + textData.textMargin) / 2), "yfunc");
        break;
      case "bottom":
      case "end":
        yfunc = /* @__PURE__ */ __name(() => Math.round(textData.y + (prevTextHeight + textHeight + 2 * textData.textMargin) - textData.textMargin), "yfunc");
        break;
    }
  }
  if (textData.anchor !== undefined && textData.textMargin !== undefined && textData.width !== undefined) {
    switch (textData.anchor) {
      case "left":
      case "start":
        textData.x = Math.round(textData.x + textData.textMargin);
        textData.anchor = "start";
        textData.dominantBaseline = "middle";
        textData.alignmentBaseline = "middle";
        break;
      case "middle":
      case "center":
        textData.x = Math.round(textData.x + textData.width / 2);
        textData.anchor = "middle";
        textData.dominantBaseline = "middle";
        textData.alignmentBaseline = "middle";
        break;
      case "right":
      case "end":
        textData.x = Math.round(textData.x + textData.width - textData.textMargin);
        textData.anchor = "end";
        textData.dominantBaseline = "middle";
        textData.alignmentBaseline = "middle";
        break;
    }
  }
  for (let [i, line] of lines.entries()) {
    if (textData.textMargin !== undefined && textData.textMargin === 0 && _textFontSize !== undefined) {
      dy = i * _textFontSize;
    }
    const textElem = elem.append("text");
    textElem.attr("x", textData.x);
    textElem.attr("y", yfunc());
    if (textData.anchor !== undefined) {
      textElem.attr("text-anchor", textData.anchor).attr("dominant-baseline", textData.dominantBaseline).attr("alignment-baseline", textData.alignmentBaseline);
    }
    if (textData.fontFamily !== undefined) {
      textElem.style("font-family", textData.fontFamily);
    }
    if (_textFontSizePx !== undefined) {
      textElem.style("font-size", _textFontSizePx);
    }
    if (textData.fontWeight !== undefined) {
      textElem.style("font-weight", textData.fontWeight);
    }
    if (textData.fill !== undefined) {
      textElem.attr("fill", textData.fill);
    }
    if (textData.class !== undefined) {
      textElem.attr("class", textData.class);
    }
    if (textData.dy !== undefined) {
      textElem.attr("dy", textData.dy);
    } else if (dy !== 0) {
      textElem.attr("dy", dy);
    }
    const text = line || ZERO_WIDTH_SPACE;
    if (textData.tspan) {
      const span = textElem.append("tspan");
      span.attr("x", textData.x);
      if (textData.fill !== undefined) {
        span.attr("fill", textData.fill);
      }
      span.text(text);
    } else {
      textElem.text(text);
    }
    if (textData.valign !== undefined && textData.textMargin !== undefined && textData.textMargin > 0) {
      textHeight += (textElem._groups || textElem)[0][0].getBBox().height;
      prevTextHeight = textHeight;
    }
    textElems.push(textElem);
  }
  return textElems;
}, "drawText");
var drawLabel = /* @__PURE__ */ __name(function(elem, txtObject) {
  function genPoints(x, y, width, height, cut) {
    return x + "," + y + " " + (x + width) + "," + y + " " + (x + width) + "," + (y + height - cut) + " " + (x + width - cut * 1.2) + "," + (y + height) + " " + x + "," + (y + height);
  }
  __name(genPoints, "genPoints");
  const polygon = elem.append("polygon");
  polygon.attr("points", genPoints(txtObject.x, txtObject.y, txtObject.width, txtObject.height, 7));
  polygon.attr("class", "labelBox");
  txtObject.y = txtObject.y + txtObject.height / 2;
  drawText(elem, txtObject);
  return polygon;
}, "drawLabel");
var actorCnt = -1;
var fixLifeLineHeights = /* @__PURE__ */ __name((diagram2, actors, actorKeys, conf2) => {
  if (!diagram2.select) {
    return;
  }
  actorKeys.forEach((actorKey) => {
    const actor = actors.get(actorKey);
    const actorDOM = diagram2.select("#actor" + actor.actorCnt);
    if (!conf2.mirrorActors && actor.stopy) {
      actorDOM.attr("y2", actor.stopy + actor.height / 2);
    } else if (conf2.mirrorActors) {
      actorDOM.attr("y2", actor.stopy);
    }
  });
}, "fixLifeLineHeights");
var drawActorTypeParticipant = /* @__PURE__ */ __name(function(elem, actor, conf2, isFooter, actorIndexMap) {
  const actorY = isFooter ? actor.stopy : actor.starty;
  const center = actor.x + actor.width / 2;
  const centerY = actorY + actor.height;
  const { look, theme, themeVariables } = conf2;
  const { bkgColorArray, borderColorArray } = themeVariables;
  const boxplusLineGroup = elem.append("g").lower();
  var g = boxplusLineGroup;
  if (!isFooter) {
    actorCnt++;
    if (Object.keys(actor.links || {}).length && !conf2.forceMenus) {
      g.attr("onclick", popupMenuToggle(`actor${actorCnt}_popup`)).attr("cursor", "pointer");
    }
    g.append("line").attr("id", "actor" + actorCnt).attr("x1", center).attr("y1", centerY).attr("x2", center).attr("y2", 2000).attr("class", "actor-line 200").attr("stroke-width", "0.5px").attr("stroke", "#999").attr("name", actor.name).attr("data-et", "life-line").attr("data-id", actor.name);
    g = boxplusLineGroup.append("g");
    actor.actorCnt = actorCnt;
    if (actor.links != null) {
      g.attr("id", "root-" + actorCnt);
    }
    if (look === "neo") {
      g.attr("data-look", "neo");
    }
  }
  const rect = getNoteRect();
  var cssclass = "actor";
  if (actor.properties?.class) {
    cssclass = actor.properties.class;
  } else {
    rect.fill = "#eaeaea";
  }
  if (isFooter) {
    cssclass += ` ${BOTTOM_ACTOR_CLASS}`;
  } else {
    cssclass += ` ${TOP_ACTOR_CLASS}`;
  }
  rect.x = actor.x;
  rect.y = actorY;
  rect.width = actor.width;
  rect.height = actor.height;
  rect.class = cssclass;
  rect.rx = 3;
  rect.ry = 3;
  rect.name = actor.name;
  if (look === "neo") {
    rect.rx = 6;
    rect.ry = 6;
  }
  const rectElem = drawRect2(g, rect);
  const actorCount = actorIndexMap.get(actor.name) ?? 0;
  if (COLOR_THEMES.has(theme)) {
    rectElem.style("stroke", borderColorArray[actorCount % borderColorArray.length]);
    rectElem.style("fill", bkgColorArray[actorCount % borderColorArray.length]);
  }
  if (look === "neo") {
    rectElem.attr("filter", "url(#drop-shadow)");
  }
  actor.rectData = rect;
  if (actor.properties?.icon) {
    const iconSrc = actor.properties.icon.trim();
    if (iconSrc.charAt(0) === "@") {
      drawEmbeddedImage(g, rect.x + rect.width - 20, rect.y + 10, iconSrc.substr(1));
    } else {
      drawImage(g, rect.x + rect.width - 20, rect.y + 10, iconSrc);
    }
  }
  if (!isFooter) {
    g.attr("data-et", "participant");
    g.attr("data-type", "participant");
    g.attr("data-id", actor.name);
  }
  _drawTextCandidateFunc(conf2, hasKatex(actor.description))(actor.description, g, rect.x, rect.y, rect.width, rect.height, { class: `actor ${ACTOR_BOX_CLASS}` }, conf2);
  let height = actor.height;
  if (rectElem.node) {
    const bounds2 = rectElem.node().getBBox();
    actor.height = bounds2.height;
    height = bounds2.height;
  }
  return height;
}, "drawActorTypeParticipant");
var drawActorTypeCollections = /* @__PURE__ */ __name(function(elem, actor, conf2, isFooter, actorIndexMap) {
  const actorY = isFooter ? actor.stopy : actor.starty;
  const center = actor.x + actor.width / 2;
  const centerY = actorY + actor.height;
  const { look, theme, themeVariables } = conf2;
  const { bkgColorArray, borderColorArray } = themeVariables;
  const boxplusLineGroup = elem.append("g").lower();
  var g = boxplusLineGroup;
  if (!isFooter) {
    actorCnt++;
    if (Object.keys(actor.links || {}).length && !conf2.forceMenus) {
      g.attr("onclick", popupMenuToggle(`actor${actorCnt}_popup`)).attr("cursor", "pointer");
    }
    g.append("line").attr("id", "actor" + actorCnt).attr("x1", center).attr("y1", centerY).attr("x2", center).attr("y2", 2000).attr("class", "actor-line 200").attr("stroke-width", "0.5px").attr("stroke", "#999").attr("name", actor.name).attr("data-et", "life-line").attr("data-id", actor.name);
    g = boxplusLineGroup.append("g");
    actor.actorCnt = actorCnt;
    if (actor.links != null) {
      g.attr("id", "root-" + actorCnt);
    }
    if (look === "neo") {
      g.attr("data-look", "neo");
    }
  }
  const rect = getNoteRect();
  var cssclass = "actor";
  if (actor.properties?.class) {
    cssclass = actor.properties.class;
  } else {
    rect.fill = "#eaeaea";
  }
  if (isFooter) {
    cssclass += ` ${BOTTOM_ACTOR_CLASS}`;
  } else {
    cssclass += ` ${TOP_ACTOR_CLASS}`;
  }
  rect.x = actor.x;
  rect.y = actorY;
  rect.width = actor.width;
  rect.height = actor.height;
  rect.class = cssclass;
  rect.name = actor.name;
  const offset = 6;
  const shadowRect = {
    ...rect,
    x: rect.x + (isFooter ? -offset : -offset),
    y: rect.y + (isFooter ? +offset : +offset),
    class: "actor"
  };
  const rectElem = drawRect2(g, rect);
  const stackedRect = drawRect2(g, shadowRect);
  actor.rectData = rect;
  if (look === "neo") {
    g.attr("filter", "url(#drop-shadow)");
  }
  const actorCount = actorIndexMap.get(actor.name) ?? 0;
  if (COLOR_THEMES.has(theme)) {
    rectElem.style("stroke", borderColorArray[actorCount % borderColorArray.length]);
    rectElem.style("fill", bkgColorArray[actorCount % borderColorArray.length]);
    stackedRect.style("stroke", borderColorArray[actorCount % borderColorArray.length]);
    stackedRect.style("fill", bkgColorArray[actorCount % borderColorArray.length]);
  }
  if (actor.properties?.icon) {
    const iconSrc = actor.properties.icon.trim();
    if (iconSrc.charAt(0) === "@") {
      drawEmbeddedImage(g, rect.x + rect.width - 20, rect.y + 10, iconSrc.substr(1));
    } else {
      drawImage(g, rect.x + rect.width - 20, rect.y + 10, iconSrc);
    }
  }
  _drawTextCandidateFunc(conf2, hasKatex(actor.description))(actor.description, g, rect.x - offset, rect.y + offset, rect.width, rect.height, { class: `actor ${ACTOR_BOX_CLASS}` }, conf2);
  let height = actor.height;
  if (rectElem.node) {
    const bounds2 = rectElem.node().getBBox();
    actor.height = bounds2.height;
    height = bounds2.height;
  }
  if (!isFooter) {
    g.attr("data-et", "participant");
    g.attr("data-type", "collections");
    g.attr("data-id", actor.name);
  }
  return height;
}, "drawActorTypeCollections");
var drawActorTypeQueue = /* @__PURE__ */ __name(function(elem, actor, conf2, isFooter, actorIndexMap) {
  const actorY = isFooter ? actor.stopy : actor.starty;
  const center = actor.x + actor.width / 2;
  const centerY = actorY + actor.height;
  const { look, theme, themeVariables } = conf2;
  const { bkgColorArray, borderColorArray } = themeVariables;
  const boxplusLineGroup = elem.append("g").lower();
  let g = boxplusLineGroup;
  if (!isFooter) {
    actorCnt++;
    if (Object.keys(actor.links || {}).length && !conf2.forceMenus) {
      g.attr("onclick", popupMenuToggle(`actor${actorCnt}_popup`)).attr("cursor", "pointer");
    }
    g.append("line").attr("id", "actor" + actorCnt).attr("x1", center).attr("y1", centerY).attr("x2", center).attr("y2", 2000).attr("class", "actor-line 200").attr("stroke-width", "0.5px").attr("stroke", "#999").attr("name", actor.name).attr("data-et", "life-line").attr("data-id", actor.name);
    g = boxplusLineGroup.append("g");
    actor.actorCnt = actorCnt;
    if (actor.links != null) {
      g.attr("id", "root-" + actorCnt);
    }
    if (look === "neo") {
      g.attr("data-look", "neo");
    }
  }
  const rect = getNoteRect();
  let cssclass = "actor";
  if (actor.properties?.class) {
    cssclass = actor.properties.class;
  } else {
    rect.fill = "#eaeaea";
  }
  if (isFooter) {
    cssclass += ` ${BOTTOM_ACTOR_CLASS}`;
  } else {
    cssclass += ` ${TOP_ACTOR_CLASS}`;
  }
  g.attr("class", cssclass);
  rect.x = actor.x;
  rect.y = actorY;
  rect.width = actor.width;
  rect.height = actor.height;
  rect.name = actor.name;
  const ry = rect.height / 2;
  const rx = ry / (2.5 + rect.height / 50);
  const cylinderGroup = g.append("g");
  const cylinderArc = g.append("g");
  const cylinderPath = `M ${rect.x},${rect.y + ry}
    a ${rx},${ry} 0 0 0 0,${rect.height}
    h ${rect.width - 2 * rx}
    a ${rx},${ry} 0 0 0 0,-${rect.height}
    Z
  `;
  cylinderGroup.append("path").attr("d", cylinderPath);
  cylinderArc.append("path").attr("d", `M ${rect.x},${rect.y + ry}
      a ${rx},${ry} 0 0 0 0,${rect.height}`);
  cylinderGroup.attr("transform", `translate(${rx}, ${-(rect.height / 2)})`);
  cylinderArc.attr("transform", `translate(${rect.width - rx}, ${-rect.height / 2})`);
  actor.rectData = rect;
  if (look === "neo") {
    cylinderGroup.attr("filter", "url(#drop-shadow)");
  }
  const actorCount = actorIndexMap.get(actor.name) ?? 0;
  if (COLOR_THEMES.has(theme)) {
    cylinderGroup.style("stroke", borderColorArray[actorCount % borderColorArray.length]);
    cylinderGroup.style("fill", bkgColorArray[actorCount % borderColorArray.length]);
    cylinderArc.style("stroke", borderColorArray[actorCount % borderColorArray.length]);
    cylinderArc.style("fill", bkgColorArray[actorCount % borderColorArray.length]);
  }
  if (actor.properties?.icon) {
    const iconSrc = actor.properties.icon.trim();
    const iconX = rect.x + rect.width - 20;
    const iconY = rect.y + 10;
    if (iconSrc.charAt(0) === "@") {
      drawEmbeddedImage(g, iconX, iconY, iconSrc.substr(1));
    } else {
      drawImage(g, iconX, iconY, iconSrc);
    }
  }
  _drawTextCandidateFunc(conf2, hasKatex(actor.description))(actor.description, g, rect.x, rect.y, rect.width, rect.height, { class: `actor ${ACTOR_BOX_CLASS}` }, conf2);
  let height = actor.height;
  const lastPath = cylinderGroup.select("path:last-child");
  if (lastPath.node()) {
    const bounds2 = lastPath.node().getBBox();
    actor.height = bounds2.height;
    height = bounds2.height;
  }
  if (!isFooter) {
    g.attr("data-et", "participant");
    g.attr("data-type", "queue");
    g.attr("data-id", actor.name);
  }
  return height;
}, "drawActorTypeQueue");
var drawActorTypeControl = /* @__PURE__ */ __name(function(elem, actor, conf2, isFooter, diagramId, actorIndexMap) {
  const actorY = isFooter ? actor.stopy : actor.starty;
  const center = actor.x + actor.width / 2;
  const centerY = actorY + 75;
  const { look, theme, themeVariables } = conf2;
  const { bkgColorArray, borderColorArray, actorBorder, actorBkg } = themeVariables;
  const line = elem.append("g").lower();
  if (!isFooter) {
    actorCnt++;
    line.append("line").attr("id", "actor" + actorCnt).attr("x1", center).attr("y1", centerY).attr("x2", center).attr("y2", 2000).attr("class", "actor-line 200").attr("stroke-width", "0.5px").attr("stroke", "#999").attr("name", actor.name).attr("data-et", "life-line").attr("data-id", actor.name);
    actor.actorCnt = actorCnt;
  }
  const actElem = elem.append("g");
  let cssClass = ACTOR_MAN_FIGURE_CLASS;
  if (isFooter) {
    cssClass += ` ${BOTTOM_ACTOR_CLASS}`;
  } else {
    cssClass += ` ${TOP_ACTOR_CLASS}`;
  }
  actElem.attr("class", cssClass);
  actElem.attr("name", actor.name);
  const rect = getNoteRect();
  rect.x = actor.x;
  rect.y = actorY;
  rect.fill = "#eaeaea";
  rect.width = actor.width;
  rect.height = actor.height;
  rect.class = "actor";
  const cx = actor.x + actor.width / 2;
  const cy = actorY + 32;
  const r = 22;
  actElem.append("defs").append("marker").attr("id", diagramId + "-filled-head-control").attr("refX", 11).attr("refY", 5.8).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "172.5").attr("stroke-width", 1.2).append("path").attr("d", "M 14.4 5.6 L 7.2 10.4 L 8.8 5.6 L 7.2 0.8 Z");
  actElem.append("circle").attr("cx", cx).attr("cy", cy).attr("r", r).attr("filter", `${look === "neo" ? "url(#drop-shadow)" : ""}`);
  actElem.append("line").attr("marker-end", "url(#" + diagramId + "-filled-head-control)").attr("transform", `translate(${cx}, ${cy - r})`);
  const actorCount = actorIndexMap.get(actor.name) ?? 0;
  if (COLOR_THEMES.has(theme)) {
    actElem.style("stroke", borderColorArray[actorCount % borderColorArray.length]);
    actElem.style("fill", bkgColorArray[actorCount % borderColorArray.length]);
  } else {
    actElem.style("stroke", actorBorder);
    actElem.style("fill", actorBkg);
  }
  const bounds2 = actElem.node().getBBox();
  actor.height = bounds2.height + 2 * (conf2?.sequence?.labelBoxHeight ?? 0);
  _drawTextCandidateFunc(conf2, hasKatex(actor.description))(actor.description, actElem, rect.x, rect.y + r + (!isFooter ? 12 : 5), rect.width, rect.height, { class: `actor ${ACTOR_MAN_FIGURE_CLASS}` }, conf2);
  if (!isFooter) {
    actElem.attr("data-et", "participant");
    actElem.attr("data-type", "control");
    actElem.attr("data-id", actor.name);
  }
  return actor.height;
}, "drawActorTypeControl");
var drawActorTypeEntity = /* @__PURE__ */ __name(function(elem, actor, conf2, isFooter, actorIndexMap) {
  const actorY = isFooter ? actor.stopy : actor.starty;
  const center = actor.x + actor.width / 2;
  const centerY = actorY + 75;
  const { look, theme, themeVariables } = conf2;
  const { bkgColorArray, borderColorArray } = themeVariables;
  const line = elem.append("g").lower();
  const actElem = elem.append("g");
  let cssClass = "actor";
  if (isFooter) {
    cssClass += ` ${BOTTOM_ACTOR_CLASS}`;
  } else {
    cssClass += ` ${TOP_ACTOR_CLASS}`;
  }
  actElem.attr("class", cssClass);
  actElem.attr("name", actor.name);
  const rect = getNoteRect();
  rect.x = actor.x;
  rect.y = actorY;
  rect.fill = "#eaeaea";
  rect.width = actor.width;
  rect.height = actor.height;
  rect.class = "actor";
  const cx = actor.x + actor.width / 2;
  const cy = actorY + (!isFooter ? 25 : 10);
  const r = 22;
  actElem.append("circle").attr("cx", cx).attr("cy", cy).attr("r", r).attr("width", actor.width).attr("height", actor.height);
  actElem.append("line").attr("x1", cx - r).attr("x2", cx + r).attr("y1", cy + r).attr("y2", cy + r).attr("stroke-width", 2);
  if (look === "neo") {
    actElem.attr("filter", "url(#drop-shadow)");
  }
  const actorCount = actorIndexMap.get(actor.name) ?? 0;
  if (COLOR_THEMES.has(theme)) {
    actElem.style("stroke", borderColorArray[actorCount % borderColorArray.length]);
    actElem.style("fill", bkgColorArray[actorCount % borderColorArray.length]);
  }
  const bounds2 = actElem.node().getBBox();
  actor.height = bounds2.height + (conf2?.sequence?.labelBoxHeight ?? 0);
  if (!isFooter) {
    actorCnt++;
    line.append("line").attr("id", "actor" + actorCnt).attr("x1", center).attr("y1", centerY).attr("x2", center).attr("y2", 2000).attr("class", "actor-line 200").attr("stroke-width", "0.5px").attr("stroke", "#999").attr("name", actor.name).attr("data-et", "life-line").attr("data-id", actor.name);
    actor.actorCnt = actorCnt;
  }
  _drawTextCandidateFunc(conf2, hasKatex(actor.description))(actor.description, actElem, rect.x, rect.y + (!isFooter ? 30 : 15), rect.width, rect.height, { class: `actor ${ACTOR_MAN_FIGURE_CLASS}` }, conf2);
  if (!isFooter) {
    actElem.attr("transform", `translate(${0}, ${r / 2 - 5})`);
    actElem.attr("data-et", "participant");
    actElem.attr("data-type", "entity");
    actElem.attr("data-id", actor.name);
  } else {
    actElem.attr("transform", `translate(${0}, ${r})`);
  }
  return actor.height;
}, "drawActorTypeEntity");
var drawActorTypeDatabase = /* @__PURE__ */ __name(function(elem, actor, conf2, isFooter, actorIndexMap) {
  const actorY = isFooter ? actor.stopy : actor.starty;
  const center = actor.x + actor.width / 2;
  const centerY = actorY + actor.height + 2 * conf2.boxTextMargin;
  const { theme, themeVariables, look } = conf2;
  const { bkgColorArray, borderColorArray, actorBorder } = themeVariables;
  const boxplusLineGroup = elem.append("g").lower();
  let g = boxplusLineGroup;
  if (!isFooter) {
    actorCnt++;
    if (Object.keys(actor.links || {}).length && !conf2.forceMenus) {
      g.attr("onclick", popupMenuToggle(`actor${actorCnt}_popup`)).attr("cursor", "pointer");
    }
    g.append("line").attr("id", "actor" + actorCnt).attr("x1", center).attr("y1", centerY).attr("x2", center).attr("y2", 2000).attr("class", "actor-line 200").attr("stroke-width", "0.5px").attr("stroke", "#999").attr("name", actor.name).attr("data-et", "life-line").attr("data-id", actor.name);
    g = boxplusLineGroup.append("g");
    actor.actorCnt = actorCnt;
    if (actor.links != null) {
      g.attr("id", "root-" + actorCnt);
    }
    if (look === "neo") {
      g.attr("data-look", "neo");
    }
  }
  const rect = getNoteRect();
  let cssclass = "actor";
  if (actor.properties?.class) {
    cssclass = actor.properties.class;
  } else {
    rect.fill = "#eaeaea";
  }
  if (isFooter) {
    cssclass += ` ${BOTTOM_ACTOR_CLASS}`;
  } else {
    cssclass += ` ${TOP_ACTOR_CLASS}`;
  }
  rect.x = actor.x;
  rect.y = actorY;
  rect.width = actor.width;
  rect.height = actor.height;
  rect.class = cssclass;
  rect.name = actor.name;
  rect.x = actor.x;
  rect.y = actorY;
  const w = rect.width / 3;
  const h = rect.width / 3;
  const rx = w / 2;
  const ry = rx / (2.5 + w / 50);
  const cylinderGroup = g.append("g");
  cylinderGroup.attr("class", cssclass);
  const d = `
  M ${rect.x},${rect.y + ry}
  a ${rx},${ry} 0 0 0 ${w},0
  a ${rx},${ry} 0 0 0 -${w},0
  l 0,${h - 2 * ry}
  a ${rx},${ry} 0 0 0 ${w},0
  l 0,-${h - 2 * ry}
`;
  cylinderGroup.append("path").attr("d", d);
  if (look === "neo") {
    cylinderGroup.attr("filter", "url(#drop-shadow)");
  }
  const actorCount = actorIndexMap.get(actor.name) ?? 0;
  if (COLOR_THEMES.has(theme)) {
    cylinderGroup.style("stroke", borderColorArray[actorCount % borderColorArray.length]);
    cylinderGroup.style("fill", bkgColorArray[actorCount % borderColorArray.length]);
  } else {
    cylinderGroup.style("stroke", actorBorder);
  }
  cylinderGroup.attr("transform", `translate(${w}, ${ry})`);
  actor.rectData = rect;
  _drawTextCandidateFunc(conf2, hasKatex(actor.description))(actor.description, g, rect.x, rect.y + 35, rect.width, rect.height, { class: `actor ${ACTOR_BOX_CLASS}` }, conf2);
  const lastPath = cylinderGroup.select("path:last-child");
  if (lastPath.node()) {
    const bounds2 = lastPath.node().getBBox();
    actor.height = bounds2.height + (conf2.sequence.labelBoxHeight ?? 0);
  }
  if (!isFooter) {
    g.attr("data-et", "participant");
    g.attr("data-type", "database");
    g.attr("data-id", actor.name);
  }
  return actor.height;
}, "drawActorTypeDatabase");
var drawActorTypeBoundary = /* @__PURE__ */ __name(function(elem, actor, conf2, isFooter, actorIndexMap) {
  const actorY = isFooter ? actor.stopy : actor.starty;
  const center = actor.x + actor.width / 2;
  const centerY = actorY + 80;
  const radius = 22;
  const line = elem.append("g").lower();
  const { look, theme, themeVariables } = conf2;
  const { bkgColorArray, borderColorArray, actorBorder } = themeVariables;
  if (!isFooter) {
    actorCnt++;
    line.append("line").attr("id", "actor" + actorCnt).attr("x1", center).attr("y1", centerY).attr("x2", center).attr("y2", 2000).attr("class", "actor-line 200").attr("stroke-width", "0.5px").attr("stroke", "#999").attr("name", actor.name).attr("data-et", "life-line").attr("data-id", actor.name);
    actor.actorCnt = actorCnt;
  }
  const actElem = elem.append("g");
  let cssClass = ACTOR_MAN_FIGURE_CLASS;
  if (isFooter) {
    cssClass += ` ${BOTTOM_ACTOR_CLASS}`;
  } else {
    cssClass += ` ${TOP_ACTOR_CLASS}`;
  }
  actElem.attr("class", cssClass);
  actElem.attr("name", actor.name);
  const rect = getNoteRect();
  rect.x = actor.x;
  rect.y = actorY;
  rect.fill = "#eaeaea";
  rect.width = actor.width;
  rect.height = actor.height;
  rect.class = "actor";
  actElem.append("line").attr("id", "actor-man-torso" + actorCnt).attr("x1", actor.x + actor.width / 2 - radius * 2.5).attr("y1", actorY + 12).attr("x2", actor.x + actor.width / 2 - 15).attr("y2", actorY + 12);
  actElem.append("line").attr("id", "actor-man-arms" + actorCnt).attr("x1", actor.x + actor.width / 2 - radius * 2.5).attr("y1", actorY + 2).attr("x2", actor.x + actor.width / 2 - radius * 2.5).attr("y2", actorY + 22);
  actElem.append("circle").attr("cx", actor.x + actor.width / 2).attr("cy", actorY + 12).attr("r", radius);
  if (look === "neo") {
    actElem.attr("filter", "url(#drop-shadow)");
  }
  const actorCount = actorIndexMap.get(actor.name) ?? 0;
  if (COLOR_THEMES.has(theme)) {
    actElem.style("stroke", borderColorArray[actorCount % borderColorArray.length]);
    actElem.style("fill", bkgColorArray[actorCount % borderColorArray.length]);
  } else {
    actElem.style("stroke", actorBorder);
  }
  const bounds2 = actElem.node().getBBox();
  actor.height = bounds2.height + (conf2.sequence.labelBoxHeight ?? 0);
  _drawTextCandidateFunc(conf2, hasKatex(actor.description))(actor.description, actElem, rect.x, rect.y + 15, rect.width, rect.height, { class: `actor ${ACTOR_MAN_FIGURE_CLASS}` }, conf2);
  actElem.attr("transform", `translate(0,${radius / 2 + 10})`);
  if (!isFooter) {
    actElem.attr("data-et", "participant");
    actElem.attr("data-type", "boundary");
    actElem.attr("data-id", actor.name);
  }
  return actor.height;
}, "drawActorTypeBoundary");
var drawActorTypeActor = /* @__PURE__ */ __name(function(elem, actor, conf2, isFooter, actorIndexMap) {
  const actorY = isFooter ? actor.stopy : actor.starty;
  const center = actor.x + actor.width / 2;
  const centerY = actorY + 80;
  const { look, theme, themeVariables } = conf2;
  const { bkgColorArray, borderColorArray, actorBorder } = themeVariables;
  const line = elem.append("g").lower();
  if (!isFooter) {
    actorCnt++;
    line.append("line").attr("id", "actor" + actorCnt).attr("x1", center).attr("y1", centerY).attr("x2", center).attr("y2", 2000).attr("class", "actor-line 200").attr("stroke-width", "0.5px").attr("stroke", "#999").attr("name", actor.name).attr("data-et", "life-line").attr("data-id", actor.name);
    actor.actorCnt = actorCnt;
  }
  const actElem = elem.append("g");
  let cssClass = ACTOR_MAN_FIGURE_CLASS;
  if (isFooter) {
    cssClass += ` ${BOTTOM_ACTOR_CLASS}`;
  } else {
    cssClass += ` ${TOP_ACTOR_CLASS}`;
  }
  actElem.attr("class", cssClass);
  actElem.attr("name", actor.name);
  if (!isFooter) {
    actElem.attr("data-et", "participant").attr("data-type", "actor").attr("data-id", actor.name);
  }
  const scale = look === "neo" ? 0.5 : 1;
  const adjustedActorY = look === "neo" ? actorY + (1 - scale) * 30 : actorY;
  actElem.append("line").attr("id", "actor-man-torso" + actorCnt).attr("x1", center).attr("y1", adjustedActorY + 25 * scale).attr("x2", center).attr("y2", adjustedActorY + 45 * scale);
  actElem.append("line").attr("id", "actor-man-arms" + actorCnt).attr("x1", center - ACTOR_TYPE_WIDTH / 2 * scale).attr("y1", adjustedActorY + 33 * scale).attr("x2", center + ACTOR_TYPE_WIDTH / 2 * scale).attr("y2", adjustedActorY + 33 * scale);
  actElem.append("line").attr("x1", center - ACTOR_TYPE_WIDTH / 2 * scale).attr("y1", adjustedActorY + 60 * scale).attr("x2", center).attr("y2", adjustedActorY + 45 * scale);
  actElem.append("line").attr("x1", center).attr("y1", adjustedActorY + 45 * scale).attr("x2", center + (ACTOR_TYPE_WIDTH / 2 - 2) * scale).attr("y2", adjustedActorY + 60 * scale);
  const circle = actElem.append("circle");
  circle.attr("cx", actor.x + actor.width / 2);
  circle.attr("cy", adjustedActorY + 10 * scale);
  circle.attr("r", 15 * scale);
  circle.attr("width", actor.width * scale);
  circle.attr("height", actor.height * scale);
  const bounds2 = actElem.node().getBBox();
  actor.height = bounds2.height;
  const rect = getNoteRect();
  rect.x = actor.x;
  rect.y = adjustedActorY;
  rect.fill = "#eaeaea";
  rect.width = actor.width;
  rect.height = actor.height / scale;
  rect.class = "actor";
  rect.rx = 3;
  rect.ry = 3;
  const actorCount = actorIndexMap.get(actor.name) ?? 0;
  if (COLOR_THEMES.has(theme)) {
    actElem.style("stroke", borderColorArray[actorCount % borderColorArray.length]);
    actElem.style("fill", bkgColorArray[actorCount % borderColorArray.length]);
  } else {
    actElem.style("stroke", actorBorder);
  }
  _drawTextCandidateFunc(conf2, hasKatex(actor.description))(actor.description, actElem, rect.x, adjustedActorY + 35 * scale - (look === "neo" ? 10 : 0), rect.width, rect.height, { class: `actor ${ACTOR_MAN_FIGURE_CLASS}` }, conf2);
  return actor.height;
}, "drawActorTypeActor");
var drawActor = /* @__PURE__ */ __name(async function(elem, actor, conf2, isFooter, diagramId, diagObj, actorIndexMap) {
  const resolvedActorIndexMap = actorIndexMap ?? new Map([...diagObj.db.getActors().values()].map((participant, index) => [participant.name, index]));
  switch (actor.type) {
    case "actor":
      return await drawActorTypeActor(elem, actor, conf2, isFooter, resolvedActorIndexMap);
    case "participant":
      return await drawActorTypeParticipant(elem, actor, conf2, isFooter, resolvedActorIndexMap);
    case "boundary":
      return await drawActorTypeBoundary(elem, actor, conf2, isFooter, resolvedActorIndexMap);
    case "control":
      return await drawActorTypeControl(elem, actor, conf2, isFooter, diagramId, resolvedActorIndexMap);
    case "entity":
      return await drawActorTypeEntity(elem, actor, conf2, isFooter, resolvedActorIndexMap);
    case "database":
      return await drawActorTypeDatabase(elem, actor, conf2, isFooter, resolvedActorIndexMap);
    case "collections":
      return await drawActorTypeCollections(elem, actor, conf2, isFooter, resolvedActorIndexMap);
    case "queue":
      return await drawActorTypeQueue(elem, actor, conf2, isFooter, resolvedActorIndexMap);
  }
}, "drawActor");
var drawBox = /* @__PURE__ */ __name(function(elem, box, conf2) {
  const boxplusTextGroup = elem.append("g");
  const g = boxplusTextGroup;
  drawBackgroundRect2(g, box);
  if (box.name) {
    _drawTextCandidateFunc(conf2)(box.name, g, box.x, box.y + conf2.boxTextMargin + (box.textMaxHeight || 0) / 2, box.width, 0, { class: "text" }, conf2);
  }
  g.lower();
}, "drawBox");
var anchorElement = /* @__PURE__ */ __name(function(elem) {
  return elem.append("g");
}, "anchorElement");
var drawActivation = /* @__PURE__ */ __name(function(_elem, bounds2, verticalPos, conf2, actorActivations2, diagObj, actorIndexMap) {
  const { theme, themeVariables } = conf2;
  const { bkgColorArray, borderColorArray, mainBkg } = themeVariables;
  const rect = getNoteRect();
  const g = bounds2.anchored;
  const actor = bounds2.actor;
  rect.x = bounds2.startx;
  rect.y = bounds2.starty;
  rect.class = "activation" + actorActivations2 % 3;
  rect.width = bounds2.stopx - bounds2.startx;
  rect.height = verticalPos - bounds2.starty;
  const rectElem = drawRect2(g, rect);
  const resolvedActorIndexMap = actorIndexMap ?? new Map([...diagObj.db.getActors().values()].map((participant, index) => [participant.name, index]));
  const actorCount = resolvedActorIndexMap.get(actor) ?? 0;
  if (COLOR_THEMES.has(theme)) {
    rectElem.style("stroke", borderColorArray[actorCount % borderColorArray.length]);
    rectElem.style("fill", bkgColorArray[actorCount % borderColorArray.length] ?? mainBkg);
  }
}, "drawActivation");
var drawLoop = /* @__PURE__ */ __name(async function(elem, loopModel, labelText, conf2, msg) {
  const {
    boxMargin,
    boxTextMargin,
    labelBoxHeight,
    labelBoxWidth,
    messageFontFamily: fontFamily,
    messageFontSize: fontSize,
    messageFontWeight: fontWeight
  } = conf2;
  const g = elem.append("g").attr("data-et", "control-structure").attr("data-id", "i" + msg.id);
  const drawLoopLine = /* @__PURE__ */ __name(function(startx, starty, stopx, stopy) {
    return g.append("line").attr("x1", startx).attr("y1", starty).attr("x2", stopx).attr("y2", stopy).attr("class", "loopLine");
  }, "drawLoopLine");
  drawLoopLine(loopModel.startx, loopModel.starty, loopModel.stopx, loopModel.starty);
  drawLoopLine(loopModel.stopx, loopModel.starty, loopModel.stopx, loopModel.stopy);
  drawLoopLine(loopModel.startx, loopModel.stopy, loopModel.stopx, loopModel.stopy);
  drawLoopLine(loopModel.startx, loopModel.starty, loopModel.startx, loopModel.stopy);
  if (loopModel.sections !== undefined) {
    loopModel.sections.forEach(function(item) {
      drawLoopLine(loopModel.startx, item.y, loopModel.stopx, item.y).style("stroke-dasharray", "3, 3");
    });
  }
  let txt = getTextObj();
  txt.text = labelText;
  txt.x = loopModel.startx;
  txt.y = loopModel.starty;
  txt.fontFamily = fontFamily;
  txt.fontSize = fontSize;
  txt.fontWeight = fontWeight;
  txt.anchor = "middle";
  txt.valign = "middle";
  txt.tspan = false;
  txt.width = Math.max(labelBoxWidth ?? 0, 50);
  txt.height = labelBoxHeight + (conf2.look === "neo" ? 15 : 0) || 20;
  txt.textMargin = boxTextMargin;
  txt.class = "labelText";
  drawLabel(g, txt);
  txt = getTextObj2();
  txt.text = loopModel.title;
  txt.x = loopModel.startx + labelBoxWidth / 2 + (loopModel.stopx - loopModel.startx) / 2;
  txt.y = loopModel.starty + boxMargin + boxTextMargin;
  txt.anchor = "middle";
  txt.valign = "middle";
  txt.textMargin = boxTextMargin;
  txt.class = "loopText";
  txt.fontFamily = fontFamily;
  txt.fontSize = fontSize;
  txt.fontWeight = fontWeight;
  txt.wrap = true;
  let textElem = hasKatex(txt.text) ? await drawKatex(g, txt, loopModel) : drawText(g, txt);
  if (loopModel.sectionTitles !== undefined) {
    for (const [idx, item] of Object.entries(loopModel.sectionTitles)) {
      if (item.message) {
        txt.text = item.message;
        txt.x = loopModel.startx + (loopModel.stopx - loopModel.startx) / 2;
        txt.y = loopModel.sections[idx].y + boxMargin + boxTextMargin;
        txt.class = "sectionTitle";
        txt.anchor = "middle";
        txt.valign = "middle";
        txt.tspan = false;
        txt.fontFamily = fontFamily;
        txt.fontSize = fontSize;
        txt.fontWeight = fontWeight;
        txt.wrap = loopModel.wrap;
        if (hasKatex(txt.text)) {
          loopModel.starty = loopModel.sections[idx].y;
          await drawKatex(g, txt, loopModel);
        } else {
          drawText(g, txt);
        }
        let sectionHeight = Math.round(textElem.map((te) => (te._groups || te)[0][0].getBBox().height).reduce((acc, curr) => acc + curr));
        loopModel.sections[idx].height += sectionHeight - (boxMargin + boxTextMargin);
      }
    }
  }
  loopModel.height = Math.round(loopModel.stopy - loopModel.starty);
  return g;
}, "drawLoop");
var drawBackgroundRect2 = /* @__PURE__ */ __name(function(elem, bounds2) {
  drawBackgroundRect(elem, bounds2);
}, "drawBackgroundRect");
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
  elem.append("defs").append("marker").attr("id", id + "-arrowhead").attr("refX", 7.9).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto-start-reverse").append("path").attr("d", "M -1 0 L 10 5 L 0 10 z");
}, "insertArrowHead");
var insertArrowFilledHead = /* @__PURE__ */ __name(function(elem, id) {
  elem.append("defs").append("marker").attr("id", id + "-filled-head").attr("refX", 15.5).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L14,7 L9,1 Z");
}, "insertArrowFilledHead");
var insertSequenceNumber = /* @__PURE__ */ __name(function(elem, id) {
  elem.append("defs").append("marker").attr("id", id + "-sequencenumber").attr("refX", 15).attr("refY", 15).attr("markerWidth", 60).attr("markerHeight", 40).attr("orient", "auto").append("circle").attr("cx", 15).attr("cy", 15).attr("r", 6);
}, "insertSequenceNumber");
var insertArrowCrossHead = /* @__PURE__ */ __name(function(elem, id) {
  const defs = elem.append("defs");
  const marker = defs.append("marker").attr("id", id + "-crosshead").attr("markerWidth", 15).attr("markerHeight", 8).attr("orient", "auto").attr("refX", 4).attr("refY", 4.5);
  marker.append("path").attr("fill", "none").attr("stroke", "#000000").style("stroke-dasharray", "0, 0").attr("stroke-width", "1pt").attr("d", "M 1,2 L 6,7 M 6,2 L 1,7");
}, "insertArrowCrossHead");
var insertDropShadow = /* @__PURE__ */ __name(function(elem, conf2) {
  const { theme } = conf2;
  elem.append("defs").append("filter").attr("id", "drop-shadow").attr("height", "130%").attr("width", "130%").append("feDropShadow").attr("dx", "4").attr("dy", "4").attr("stdDeviation", 0).attr("flood-opacity", "0.06").attr("flood-color", `${theme === "redux" || theme === "redux-color" ? "#000000" : "#FFFFFF"}`);
}, "insertDropShadow");
var getTextObj2 = /* @__PURE__ */ __name(function() {
  return {
    x: 0,
    y: 0,
    fill: undefined,
    anchor: undefined,
    style: "#666",
    width: undefined,
    height: undefined,
    textMargin: 0,
    rx: 0,
    ry: 0,
    tspan: true,
    valign: undefined
  };
}, "getTextObj");
var getNoteRect2 = /* @__PURE__ */ __name(function() {
  return {
    x: 0,
    y: 0,
    fill: "#EDF2AE",
    stroke: "#666",
    width: 100,
    anchor: "start",
    height: 100,
    rx: 0,
    ry: 0
  };
}, "getNoteRect");
var _drawTextCandidateFunc = /* @__PURE__ */ function() {
  function byText(content, g, x, y, width, height, textAttrs) {
    const text = g.append("text").attr("x", x + width / 2).attr("y", y + height / 2 + 5).style("text-anchor", "middle").text(content);
    _setTextAttrs(text, textAttrs);
  }
  __name(byText, "byText");
  function byTspan(content, g, x, y, width, height, textAttrs, conf2) {
    const { actorFontSize, actorFontFamily, actorFontWeight } = conf2;
    const [_actorFontSize, _actorFontSizePx] = parseFontSize(actorFontSize);
    const lines = content.split(common_default.lineBreakRegex);
    for (let i = 0;i < lines.length; i++) {
      const dy = i * _actorFontSize - _actorFontSize * (lines.length - 1) / 2;
      const text = g.append("text").attr("x", x + width / 2).attr("y", y).style("text-anchor", "middle").style("font-size", _actorFontSizePx).style("font-weight", actorFontWeight).style("font-family", actorFontFamily);
      text.append("tspan").attr("x", x + width / 2).attr("dy", dy).text(lines[i]);
      text.attr("y", y + height / 2).attr("dominant-baseline", "central").attr("alignment-baseline", "central");
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
  async function byKatex(content, g, x, y, width, height, textAttrs, conf2) {
    const dim = await calculateMathMLDimensions(content, getConfig());
    const s = g.append("switch");
    const f = s.append("foreignObject").attr("x", x + width / 2 - dim.width / 2).attr("y", y + height / 2 - dim.height / 2).attr("width", dim.width).attr("height", dim.height);
    const text = f.append("xhtml:div").style("height", "100%").style("width", "100%");
    text.append("div").style("text-align", "center").style("vertical-align", "middle").html(await renderKatexSanitized(content, getConfig()));
    byTspan(content, s, x, y, width, height, textAttrs, conf2);
    _setTextAttrs(text, textAttrs);
  }
  __name(byKatex, "byKatex");
  function _setTextAttrs(toText, fromTextAttrsDict) {
    for (const key in fromTextAttrsDict) {
      if (fromTextAttrsDict.hasOwnProperty(key)) {
        toText.attr(key, fromTextAttrsDict[key]);
      }
    }
  }
  __name(_setTextAttrs, "_setTextAttrs");
  return function(conf2, hasKatex2 = false) {
    if (hasKatex2) {
      return byKatex;
    }
    return conf2.textPlacement === "fo" ? byFo : conf2.textPlacement === "old" ? byText : byTspan;
  };
}();
var _drawMenuItemTextCandidateFunc = /* @__PURE__ */ function() {
  function byText(content, g, x, y, width, height, textAttrs) {
    const text = g.append("text").attr("x", x).attr("y", y).style("text-anchor", "start").text(content);
    _setTextAttrs(text, textAttrs);
  }
  __name(byText, "byText");
  function byTspan(content, g, x, y, width, height, textAttrs, conf2) {
    const { actorFontSize, actorFontFamily, actorFontWeight } = conf2;
    const lines = content.split(common_default.lineBreakRegex);
    for (let i = 0;i < lines.length; i++) {
      const dy = i * actorFontSize - actorFontSize * (lines.length - 1) / 2;
      const text = g.append("text").attr("x", x).attr("y", y).style("text-anchor", "start").style("font-size", actorFontSize).style("font-weight", actorFontWeight).style("font-family", actorFontFamily);
      text.append("tspan").attr("x", x).attr("dy", dy).text(lines[i]);
      text.attr("y", y + height / 2).attr("dominant-baseline", "central").attr("alignment-baseline", "central");
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
var insertSolidTopArrowHead = /* @__PURE__ */ __name(function(elem, id) {
  elem.append("defs").append("marker").attr("id", id + "-solidTopArrowHead").attr("refX", 7.9).attr("refY", 7.25).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto-start-reverse").append("path").attr("d", "M 0 0 L 10 8 L 0 8 z");
}, "insertSolidTopArrowHead");
var insertSolidBottomArrowHead = /* @__PURE__ */ __name(function(elem, id) {
  elem.append("defs").append("marker").attr("id", id + "-solidBottomArrowHead").attr("refX", 7.9).attr("refY", 0.75).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto-start-reverse").append("path").attr("d", "M 0 0 L 10 0 L 0 8 z");
}, "insertSolidBottomArrowHead");
var insertStickTopArrowHead = /* @__PURE__ */ __name(function(elem, id) {
  elem.append("defs").append("marker").attr("id", id + "-stickTopArrowHead").attr("refX", 7.5).attr("refY", 7).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto-start-reverse").append("path").attr("d", "M 0 0 L 7 7").attr("stroke", "black").attr("stroke-width", 1.5).attr("fill", "none");
}, "insertStickTopArrowHead");
var insertStickBottomArrowHead = /* @__PURE__ */ __name(function(elem, id) {
  elem.append("defs").append("marker").attr("id", id + "-stickBottomArrowHead").attr("refX", 7.5).attr("refY", 0).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto-start-reverse").append("path").attr("d", "M 0 7 L 7 0").attr("stroke", "black").attr("stroke-width", 1.5).attr("fill", "none");
}, "insertStickBottomArrowHead");
var svgDraw_default = {
  drawRect: drawRect2,
  drawText,
  drawLabel,
  drawActor,
  drawBox,
  drawPopup,
  anchorElement,
  drawActivation,
  drawLoop,
  drawBackgroundRect: drawBackgroundRect2,
  insertArrowHead,
  insertArrowFilledHead,
  insertSequenceNumber,
  insertArrowCrossHead,
  insertDatabaseIcon,
  insertComputerIcon,
  insertClockIcon,
  getTextObj: getTextObj2,
  getNoteRect: getNoteRect2,
  fixLifeLineHeights,
  sanitizeUrl: import_sanitize_url.sanitizeUrl,
  insertDropShadow,
  insertSolidTopArrowHead,
  insertSolidBottomArrowHead,
  insertStickTopArrowHead,
  insertStickBottomArrowHead
};
var conf = {};
var bounds = {
  data: {
    startx: undefined,
    stopx: undefined,
    starty: undefined,
    stopy: undefined
  },
  verticalPos: 0,
  sequenceItems: [],
  activations: [],
  models: {
    getHeight: /* @__PURE__ */ __name(function() {
      return Math.max.apply(null, this.actors.length === 0 ? [0] : this.actors.map((actor) => actor.height || 0)) + (this.loops.length === 0 ? 0 : this.loops.map((it) => it.height || 0).reduce((acc, h) => acc + h)) + (this.messages.length === 0 ? 0 : this.messages.map((it) => it.height || 0).reduce((acc, h) => acc + h)) + (this.notes.length === 0 ? 0 : this.notes.map((it) => it.height || 0).reduce((acc, h) => acc + h));
    }, "getHeight"),
    clear: /* @__PURE__ */ __name(function() {
      this.actors = [];
      this.boxes = [];
      this.loops = [];
      this.messages = [];
      this.notes = [];
    }, "clear"),
    addBox: /* @__PURE__ */ __name(function(boxModel) {
      this.boxes.push(boxModel);
    }, "addBox"),
    addActor: /* @__PURE__ */ __name(function(actorModel) {
      this.actors.push(actorModel);
    }, "addActor"),
    addLoop: /* @__PURE__ */ __name(function(loopModel) {
      this.loops.push(loopModel);
    }, "addLoop"),
    addMessage: /* @__PURE__ */ __name(function(msgModel) {
      this.messages.push(msgModel);
    }, "addMessage"),
    addNote: /* @__PURE__ */ __name(function(noteModel) {
      this.notes.push(noteModel);
    }, "addNote"),
    lastActor: /* @__PURE__ */ __name(function() {
      return this.actors[this.actors.length - 1];
    }, "lastActor"),
    lastLoop: /* @__PURE__ */ __name(function() {
      return this.loops[this.loops.length - 1];
    }, "lastLoop"),
    lastMessage: /* @__PURE__ */ __name(function() {
      return this.messages[this.messages.length - 1];
    }, "lastMessage"),
    lastNote: /* @__PURE__ */ __name(function() {
      return this.notes[this.notes.length - 1];
    }, "lastNote"),
    actors: [],
    boxes: [],
    loops: [],
    messages: [],
    notes: []
  },
  init: /* @__PURE__ */ __name(function() {
    this.sequenceItems = [];
    this.activations = [];
    this.models.clear();
    this.data = {
      startx: undefined,
      stopx: undefined,
      starty: undefined,
      stopy: undefined
    };
    this.verticalPos = 0;
    setConf(getConfig2());
  }, "init"),
  updateVal: /* @__PURE__ */ __name(function(obj, key, val, fun) {
    if (obj[key] === undefined) {
      obj[key] = val;
    } else {
      obj[key] = fun(val, obj[key]);
    }
  }, "updateVal"),
  updateBounds: /* @__PURE__ */ __name(function(startx, starty, stopx, stopy) {
    const _self = this;
    let cnt = 0;
    function updateFn(type) {
      return /* @__PURE__ */ __name(function updateItemBounds(item) {
        cnt++;
        const n = _self.sequenceItems.length - cnt + 1;
        _self.updateVal(item, "starty", starty - n * conf.boxMargin, Math.min);
        _self.updateVal(item, "stopy", stopy + n * conf.boxMargin, Math.max);
        _self.updateVal(bounds.data, "startx", startx - n * conf.boxMargin, Math.min);
        _self.updateVal(bounds.data, "stopx", stopx + n * conf.boxMargin, Math.max);
        if (!(type === "activation")) {
          _self.updateVal(item, "startx", startx - n * conf.boxMargin, Math.min);
          _self.updateVal(item, "stopx", stopx + n * conf.boxMargin, Math.max);
          _self.updateVal(bounds.data, "starty", starty - n * conf.boxMargin, Math.min);
          _self.updateVal(bounds.data, "stopy", stopy + n * conf.boxMargin, Math.max);
        }
      }, "updateItemBounds");
    }
    __name(updateFn, "updateFn");
    this.sequenceItems.forEach(updateFn());
    this.activations.forEach(updateFn("activation"));
  }, "updateBounds"),
  insert: /* @__PURE__ */ __name(function(startx, starty, stopx, stopy) {
    const _startx = common_default.getMin(startx, stopx);
    const _stopx = common_default.getMax(startx, stopx);
    const _starty = common_default.getMin(starty, stopy);
    const _stopy = common_default.getMax(starty, stopy);
    this.updateVal(bounds.data, "startx", _startx, Math.min);
    this.updateVal(bounds.data, "starty", _starty, Math.min);
    this.updateVal(bounds.data, "stopx", _stopx, Math.max);
    this.updateVal(bounds.data, "stopy", _stopy, Math.max);
    this.updateBounds(_startx, _starty, _stopx, _stopy);
  }, "insert"),
  newActivation: /* @__PURE__ */ __name(function(message, diagram2, actors) {
    const actorRect = actors.get(message.from);
    const stackedSize = actorActivations(message.from).length || 0;
    const x = actorRect.x + actorRect.width / 2 + (stackedSize - 1) * conf.activationWidth / 2;
    this.activations.push({
      startx: x,
      starty: this.verticalPos + 2,
      stopx: x + conf.activationWidth,
      stopy: undefined,
      actor: message.from,
      anchored: svgDraw_default.anchorElement(diagram2)
    });
  }, "newActivation"),
  endActivation: /* @__PURE__ */ __name(function(message) {
    const lastActorActivationIdx = this.activations.map(function(activation) {
      return activation.actor;
    }).lastIndexOf(message.from);
    return this.activations.splice(lastActorActivationIdx, 1)[0];
  }, "endActivation"),
  createLoop: /* @__PURE__ */ __name(function(title = { message: undefined, wrap: false, width: undefined }, fill) {
    return {
      startx: undefined,
      starty: this.verticalPos,
      stopx: undefined,
      stopy: undefined,
      title: title.message,
      wrap: title.wrap,
      width: title.width,
      height: 0,
      fill
    };
  }, "createLoop"),
  newLoop: /* @__PURE__ */ __name(function(title = { message: undefined, wrap: false, width: undefined }, fill) {
    this.sequenceItems.push(this.createLoop(title, fill));
  }, "newLoop"),
  endLoop: /* @__PURE__ */ __name(function() {
    return this.sequenceItems.pop();
  }, "endLoop"),
  isLoopOverlap: /* @__PURE__ */ __name(function() {
    return this.sequenceItems.length ? this.sequenceItems[this.sequenceItems.length - 1].overlap : false;
  }, "isLoopOverlap"),
  addSectionToLoop: /* @__PURE__ */ __name(function(message) {
    const loop = this.sequenceItems.pop();
    loop.sections = loop.sections || [];
    loop.sectionTitles = loop.sectionTitles || [];
    loop.sections.push({ y: bounds.getVerticalPos(), height: 0 });
    loop.sectionTitles.push(message);
    this.sequenceItems.push(loop);
  }, "addSectionToLoop"),
  saveVerticalPos: /* @__PURE__ */ __name(function() {
    if (this.isLoopOverlap()) {
      this.savedVerticalPos = this.verticalPos;
    }
  }, "saveVerticalPos"),
  resetVerticalPos: /* @__PURE__ */ __name(function() {
    if (this.isLoopOverlap()) {
      this.verticalPos = this.savedVerticalPos;
    }
  }, "resetVerticalPos"),
  bumpVerticalPos: /* @__PURE__ */ __name(function(bump) {
    this.verticalPos = this.verticalPos + bump;
    this.data.stopy = common_default.getMax(this.data.stopy, this.verticalPos);
  }, "bumpVerticalPos"),
  getVerticalPos: /* @__PURE__ */ __name(function() {
    return this.verticalPos;
  }, "getVerticalPos"),
  getBounds: /* @__PURE__ */ __name(function() {
    return { bounds: this.data, models: this.models };
  }, "getBounds")
};
var drawNote = /* @__PURE__ */ __name(async function(elem, noteModel, id) {
  bounds.bumpVerticalPos(conf.boxMargin);
  noteModel.height = conf.boxMargin;
  noteModel.starty = bounds.getVerticalPos();
  const rect = getNoteRect();
  rect.x = noteModel.startx;
  rect.y = noteModel.starty;
  rect.width = noteModel.width || conf.width;
  rect.class = "note";
  const g = elem.append("g");
  g.attr("data-et", "note");
  g.attr("data-id", "i" + id);
  const rectElem = svgDraw_default.drawRect(g, rect);
  const textObj = getTextObj();
  textObj.x = noteModel.startx;
  textObj.y = noteModel.starty;
  textObj.width = rect.width;
  textObj.dy = "1em";
  textObj.text = noteModel.message;
  textObj.class = "noteText";
  textObj.fontFamily = conf.noteFontFamily;
  textObj.fontSize = conf.noteFontSize;
  textObj.fontWeight = conf.noteFontWeight;
  textObj.anchor = conf.noteAlign;
  textObj.textMargin = conf.noteMargin;
  textObj.valign = "center";
  const textElem = hasKatex(textObj.text) ? await drawKatex(g, textObj) : drawText(g, textObj);
  const textHeight = Math.round(textElem.map((te) => (te._groups || te)[0][0].getBBox().height).reduce((acc, curr) => acc + curr));
  rectElem.attr("height", textHeight + 2 * conf.noteMargin);
  noteModel.height += textHeight + 2 * conf.noteMargin;
  bounds.bumpVerticalPos(textHeight + 2 * conf.noteMargin);
  noteModel.stopy = noteModel.starty + textHeight + 2 * conf.noteMargin;
  noteModel.stopx = noteModel.startx + rect.width;
  bounds.insert(noteModel.startx, noteModel.starty, noteModel.stopx, noteModel.stopy);
  bounds.models.addNote(noteModel);
}, "drawNote");
var drawCentralConnection = /* @__PURE__ */ __name(function(elem, msg, msgModel, diagObj, startx, stopx, lineStartY) {
  const actors = diagObj.db.getActors();
  const fromActor = actors.get(msg.from);
  const toActor = actors.get(msg.to);
  const isAutoNumberOn = msgModel.sequenceVisible;
  let fromCenter = fromActor.x + fromActor.width / 2;
  let toCenter = toActor.x + toActor.width / 2;
  const isLeftToRight = fromCenter <= toCenter;
  const isReverse = isReverseArrowType(msg, diagObj);
  const g = elem.append("g");
  const CENTRAL_CONNECTION_CIRCLE_OFFSET = 16.5;
  const getCircleOffset = /* @__PURE__ */ __name((isLeftToRight2, isReverse2) => {
    const baseOffset = isLeftToRight2 ? CENTRAL_CONNECTION_CIRCLE_OFFSET : -CENTRAL_CONNECTION_CIRCLE_OFFSET;
    return isReverse2 ? -baseOffset : baseOffset;
  }, "getCircleOffset");
  const drawCircle = /* @__PURE__ */ __name((cx) => {
    g.append("circle").attr("cx", cx).attr("cy", lineStartY).attr("r", 5).attr("width", 10).attr("height", 10);
  }, "drawCircle");
  const { CENTRAL_CONNECTION, CENTRAL_CONNECTION_REVERSE, CENTRAL_CONNECTION_DUAL } = diagObj.db.LINETYPE;
  if (isAutoNumberOn) {
    switch (msg.centralConnection) {
      case CENTRAL_CONNECTION:
        if (isReverse) {
          toCenter += getCircleOffset(isLeftToRight, true);
        }
        break;
      case CENTRAL_CONNECTION_REVERSE:
        if (!isReverse) {
          fromCenter += getCircleOffset(isLeftToRight, false);
        }
        break;
      case CENTRAL_CONNECTION_DUAL:
        if (isReverse) {
          toCenter += getCircleOffset(isLeftToRight, true);
        } else {
          fromCenter += getCircleOffset(isLeftToRight, false);
        }
        break;
    }
  }
  switch (msg.centralConnection) {
    case CENTRAL_CONNECTION:
      drawCircle(toCenter);
      break;
    case CENTRAL_CONNECTION_REVERSE:
      drawCircle(fromCenter);
      break;
    case CENTRAL_CONNECTION_DUAL:
      drawCircle(fromCenter);
      drawCircle(toCenter);
      break;
  }
}, "drawCentralConnection");
var messageFont = /* @__PURE__ */ __name((cnf) => {
  return {
    fontFamily: cnf.messageFontFamily,
    fontSize: cnf.messageFontSize,
    fontWeight: cnf.messageFontWeight
  };
}, "messageFont");
var noteFont = /* @__PURE__ */ __name((cnf) => {
  return {
    fontFamily: cnf.noteFontFamily,
    fontSize: cnf.noteFontSize,
    fontWeight: cnf.noteFontWeight
  };
}, "noteFont");
var actorFont = /* @__PURE__ */ __name((cnf) => {
  return {
    fontFamily: cnf.actorFontFamily,
    fontSize: cnf.actorFontSize,
    fontWeight: cnf.actorFontWeight
  };
}, "actorFont");
async function boundMessage(_diagram, msgModel) {
  bounds.bumpVerticalPos(10);
  const { startx, stopx, message } = msgModel;
  const lines = common_default.splitBreaks(message).length;
  const isKatexMsg = hasKatex(message);
  const textDims = isKatexMsg ? await calculateMathMLDimensions(message, getConfig2()) : utils_default.calculateTextDimensions(message, messageFont(conf));
  if (!isKatexMsg) {
    const lineHeight = textDims.height / lines;
    msgModel.height += lineHeight;
    bounds.bumpVerticalPos(lineHeight);
  }
  let lineStartY;
  let totalOffset = textDims.height - 10;
  const textWidth = textDims.width;
  if (startx === stopx) {
    lineStartY = bounds.getVerticalPos() + totalOffset;
    if (!conf.rightAngles) {
      totalOffset += conf.boxMargin;
      lineStartY = bounds.getVerticalPos() + totalOffset;
    }
    totalOffset += 30;
    const dx = common_default.getMax(textWidth / 2, conf.width / 2);
    bounds.insert(startx - dx, bounds.getVerticalPos() - 10 + totalOffset, stopx + dx, bounds.getVerticalPos() + 30 + totalOffset);
  } else {
    totalOffset += conf.boxMargin;
    lineStartY = bounds.getVerticalPos() + totalOffset;
    bounds.insert(startx, lineStartY - 10, stopx, lineStartY);
  }
  bounds.bumpVerticalPos(totalOffset);
  msgModel.height += totalOffset;
  msgModel.stopy = msgModel.starty + msgModel.height;
  bounds.insert(msgModel.fromBounds, msgModel.starty, msgModel.toBounds, msgModel.stopy);
  return lineStartY;
}
__name(boundMessage, "boundMessage");
var drawMessage = /* @__PURE__ */ __name(async function(diagram2, msgModel, lineStartY, diagObj, msg, diagramId) {
  const { startx, stopx, starty, message, type, sequenceIndex, sequenceVisible } = msgModel;
  const textDims = utils_default.calculateTextDimensions(message, messageFont(conf));
  const textObj = getTextObj();
  textObj.x = Math.min(startx, stopx);
  textObj.y = starty + 10;
  textObj.width = Math.abs(stopx - startx);
  textObj.class = "messageText";
  textObj.dy = "1em";
  textObj.text = message;
  textObj.fontFamily = conf.messageFontFamily;
  textObj.fontSize = conf.messageFontSize;
  textObj.fontWeight = conf.messageFontWeight;
  textObj.anchor = conf.messageAlign;
  textObj.valign = "center";
  textObj.textMargin = conf.wrapPadding;
  textObj.tspan = false;
  if (hasKatex(textObj.text)) {
    await drawKatex(diagram2, textObj, { startx, stopx, starty: lineStartY });
  } else {
    drawText(diagram2, textObj);
  }
  const textWidth = textDims.width;
  let line;
  if (startx === stopx) {
    const isAutoNumberOn = sequenceVisible || conf.showSequenceNumbers;
    const isReverse = isReverseArrowType(msg, diagObj);
    const isBidirectional = isBidirectionalArrowType(msg, diagObj);
    const lineStartX = startx + (isAutoNumberOn && (isReverse || isBidirectional) ? 10 : 0);
    if (conf.rightAngles) {
      line = diagram2.append("path").attr("d", `M  ${lineStartX},${lineStartY} H ${startx + common_default.getMax(conf.width / 2, textWidth / 2)} V ${lineStartY + 25} H ${startx}`);
    } else {
      line = diagram2.append("path").attr("d", "M " + lineStartX + "," + lineStartY + " C " + (lineStartX + 60) + "," + (lineStartY - 10) + " " + (startx + 60) + "," + (lineStartY + 30) + " " + startx + "," + (lineStartY + 20));
    }
    if (hasCentralConnection(msg, diagObj)) {
      drawCentralConnection(diagram2, msg, msgModel, diagObj, startx, stopx, lineStartY);
    }
  } else {
    line = diagram2.append("line");
    line.attr("x1", startx);
    line.attr("y1", lineStartY);
    line.attr("x2", stopx);
    line.attr("y2", lineStartY);
    if (hasCentralConnection(msg, diagObj)) {
      drawCentralConnection(diagram2, msg, msgModel, diagObj, startx, stopx, lineStartY);
    }
  }
  if (type === diagObj.db.LINETYPE.DOTTED || type === diagObj.db.LINETYPE.DOTTED_CROSS || type === diagObj.db.LINETYPE.DOTTED_POINT || type === diagObj.db.LINETYPE.DOTTED_OPEN || type === diagObj.db.LINETYPE.BIDIRECTIONAL_DOTTED || type === diagObj.db.LINETYPE.SOLID_TOP_DOTTED || type === diagObj.db.LINETYPE.SOLID_BOTTOM_DOTTED || type === diagObj.db.LINETYPE.STICK_TOP_DOTTED || type === diagObj.db.LINETYPE.STICK_BOTTOM_DOTTED || type === diagObj.db.LINETYPE.SOLID_ARROW_TOP_REVERSE_DOTTED || type === diagObj.db.LINETYPE.SOLID_ARROW_BOTTOM_REVERSE_DOTTED || type === diagObj.db.LINETYPE.STICK_ARROW_TOP_REVERSE_DOTTED || type === diagObj.db.LINETYPE.STICK_ARROW_BOTTOM_REVERSE_DOTTED) {
    line.style("stroke-dasharray", "3, 3");
    line.attr("class", "messageLine1");
  } else {
    line.attr("class", "messageLine0");
  }
  line.attr("data-et", "message");
  line.attr("data-id", "i" + msgModel.id);
  line.attr("data-from", msgModel.from);
  line.attr("data-to", msgModel.to);
  let url = "";
  if (conf.arrowMarkerAbsolute) {
    url = getUrl(true);
  }
  line.attr("stroke-width", 2);
  line.attr("stroke", "none");
  line.style("fill", "none");
  if (type === diagObj.db.LINETYPE.SOLID_TOP || type === diagObj.db.LINETYPE.SOLID_TOP_DOTTED) {
    line.attr("marker-end", "url(" + url + "#" + diagramId + "-solidTopArrowHead)");
  }
  if (type === diagObj.db.LINETYPE.SOLID_BOTTOM || type === diagObj.db.LINETYPE.SOLID_BOTTOM_DOTTED) {
    line.attr("marker-end", "url(" + url + "#" + diagramId + "-solidBottomArrowHead)");
  }
  if (type === diagObj.db.LINETYPE.STICK_TOP || type === diagObj.db.LINETYPE.STICK_TOP_DOTTED) {
    line.attr("marker-end", "url(" + url + "#" + diagramId + "-stickTopArrowHead)");
  }
  if (type === diagObj.db.LINETYPE.STICK_BOTTOM || type === diagObj.db.LINETYPE.STICK_BOTTOM_DOTTED) {
    line.attr("marker-end", "url(" + url + "#" + diagramId + "-stickBottomArrowHead)");
  }
  if (type === diagObj.db.LINETYPE.SOLID_ARROW_TOP_REVERSE || type === diagObj.db.LINETYPE.SOLID_ARROW_TOP_REVERSE_DOTTED) {
    line.attr("marker-start", "url(" + url + "#" + diagramId + "-solidBottomArrowHead)");
  }
  if (type === diagObj.db.LINETYPE.SOLID_ARROW_BOTTOM_REVERSE || type === diagObj.db.LINETYPE.SOLID_ARROW_BOTTOM_REVERSE_DOTTED) {
    line.attr("marker-start", "url(" + url + "#" + diagramId + "-solidTopArrowHead)");
  }
  if (type === diagObj.db.LINETYPE.STICK_ARROW_TOP_REVERSE || type === diagObj.db.LINETYPE.STICK_ARROW_TOP_REVERSE_DOTTED) {
    line.attr("marker-start", "url(" + url + "#" + diagramId + "-stickBottomArrowHead)");
  }
  if (type === diagObj.db.LINETYPE.STICK_ARROW_BOTTOM_REVERSE || type === diagObj.db.LINETYPE.STICK_ARROW_BOTTOM_REVERSE_DOTTED) {
    line.attr("marker-start", "url(" + url + "#" + diagramId + "-stickTopArrowHead)");
  }
  if (type === diagObj.db.LINETYPE.SOLID || type === diagObj.db.LINETYPE.DOTTED) {
    line.attr("marker-end", "url(" + url + "#" + diagramId + "-arrowhead)");
  }
  if (type === diagObj.db.LINETYPE.BIDIRECTIONAL_SOLID || type === diagObj.db.LINETYPE.BIDIRECTIONAL_DOTTED) {
    line.attr("marker-start", "url(" + url + "#" + diagramId + "-arrowhead)");
    line.attr("marker-end", "url(" + url + "#" + diagramId + "-arrowhead)");
  }
  if (type === diagObj.db.LINETYPE.SOLID_POINT || type === diagObj.db.LINETYPE.DOTTED_POINT) {
    line.attr("marker-end", "url(" + url + "#" + diagramId + "-filled-head)");
  }
  if (type === diagObj.db.LINETYPE.SOLID_CROSS || type === diagObj.db.LINETYPE.DOTTED_CROSS) {
    line.attr("marker-end", "url(" + url + "#" + diagramId + "-crosshead)");
  }
  if (sequenceVisible || conf.showSequenceNumbers) {
    const isBidirectional = type === diagObj.db.LINETYPE.BIDIRECTIONAL_SOLID || type === diagObj.db.LINETYPE.BIDIRECTIONAL_DOTTED;
    const isReverseArrowType2 = type === diagObj.db.LINETYPE.SOLID_ARROW_TOP_REVERSE || type === diagObj.db.LINETYPE.SOLID_ARROW_TOP_REVERSE_DOTTED || type === diagObj.db.LINETYPE.SOLID_ARROW_BOTTOM_REVERSE || type === diagObj.db.LINETYPE.SOLID_ARROW_BOTTOM_REVERSE_DOTTED || type === diagObj.db.LINETYPE.STICK_ARROW_TOP_REVERSE || type === diagObj.db.LINETYPE.STICK_ARROW_TOP_REVERSE_DOTTED || type === diagObj.db.LINETYPE.STICK_ARROW_BOTTOM_REVERSE || type === diagObj.db.LINETYPE.STICK_ARROW_BOTTOM_REVERSE_DOTTED;
    const SEQUENCE_NUMBER_RADIUS = 6;
    const hasCentralConn = hasCentralConnection(msg, diagObj);
    let lineStartX = startx;
    let lineStopX = stopx;
    if (isBidirectional) {
      if (startx < stopx) {
        lineStartX = startx + SEQUENCE_NUMBER_RADIUS * 2;
      } else {
        lineStartX = startx - SEQUENCE_NUMBER_RADIUS + (hasCentralConn ? -5 : 0);
        lineStartX += msg?.centralConnection === diagObj.db.LINETYPE.CENTRAL_CONNECTION_DUAL || msg?.centralConnection === diagObj.db.LINETYPE.CENTRAL_CONNECTION_REVERSE ? -7.5 : 0;
      }
      line.attr("x1", lineStartX);
    } else if (isReverseArrowType2) {
      if (stopx > startx) {
        lineStopX = stopx - 2 * SEQUENCE_NUMBER_RADIUS;
      } else {
        lineStopX = stopx - SEQUENCE_NUMBER_RADIUS;
        lineStartX += msg?.centralConnection === diagObj.db.LINETYPE.CENTRAL_CONNECTION_DUAL || msg?.centralConnection === diagObj.db.LINETYPE.CENTRAL_CONNECTION_REVERSE ? -7.5 : 0;
      }
      lineStopX += hasCentralConn ? 15 : 0;
      line.attr("x2", lineStopX);
      line.attr("x1", lineStartX);
    } else {
      line.attr("x1", startx + SEQUENCE_NUMBER_RADIUS);
    }
    let autonumberX = 0;
    const isSelfMessage = startx === stopx;
    const isLeftToRight = startx <= stopx;
    if (isSelfMessage) {
      autonumberX = msgModel.fromBounds + 1;
    } else if (isReverseArrowType2) {
      autonumberX = isLeftToRight ? msgModel.toBounds - 1 : msgModel.fromBounds + 1;
    } else {
      autonumberX = isLeftToRight ? msgModel.fromBounds + 1 : msgModel.toBounds - 1;
    }
    let fontSize = "12px";
    const sequenceIndexLength = sequenceIndex.toString().length;
    if (sequenceIndexLength > 5) {
      fontSize = "7px";
    } else if (sequenceIndexLength > 3) {
      fontSize = "9px";
    }
    diagram2.append("line").attr("x1", autonumberX).attr("y1", lineStartY).attr("x2", autonumberX).attr("y2", lineStartY).attr("stroke-width", 0).attr("marker-start", "url(" + url + "#" + diagramId + "-sequencenumber)");
    diagram2.append("text").attr("x", autonumberX).attr("y", lineStartY + 4).attr("font-family", "sans-serif").attr("font-size", fontSize).attr("text-anchor", "middle").attr("class", "sequenceNumber").text(sequenceIndex);
  }
}, "drawMessage");
var addActorRenderingData = /* @__PURE__ */ __name(function(diagram2, actors, createdActors, actorKeys, verticalPos, messages, isFooter) {
  let prevWidth = 0;
  let prevMargin = 0;
  let prevBox = undefined;
  let maxHeight = 0;
  for (const actorKey of actorKeys) {
    const actor = actors.get(actorKey);
    const box = actor.box;
    if (prevBox && prevBox != box) {
      if (!isFooter) {
        bounds.models.addBox(prevBox);
      }
      prevMargin += conf.boxMargin + prevBox.margin;
    }
    if (box && box != prevBox) {
      if (!isFooter) {
        box.x = prevWidth + prevMargin;
        box.y = verticalPos;
      }
      prevMargin += box.margin;
    }
    actor.width = common_default.getMax(actor.width || conf.width, conf.width);
    actor.height = common_default.getMax(actor.height || conf.height, conf.height);
    actor.margin = actor.margin || conf.actorMargin;
    maxHeight = common_default.getMax(maxHeight, actor.height);
    if (createdActors.get(actor.name)) {
      prevMargin += actor.width / 2;
    }
    actor.x = prevWidth + prevMargin;
    actor.starty = bounds.getVerticalPos();
    bounds.insert(actor.x, verticalPos, actor.x + actor.width, actor.height);
    prevWidth += actor.width + prevMargin;
    if (actor.box) {
      actor.box.width = prevWidth + box.margin - actor.box.x;
    }
    prevMargin = actor.margin;
    prevBox = actor.box;
    bounds.models.addActor(actor);
  }
  if (prevBox && !isFooter) {
    bounds.models.addBox(prevBox);
  }
  bounds.bumpVerticalPos(maxHeight);
}, "addActorRenderingData");
var drawActors = /* @__PURE__ */ __name(async function(diagram2, actors, actorKeys, isFooter, diagramId, diagObj, actorIndexMap) {
  if (!isFooter) {
    for (const actorKey of actorKeys) {
      const actor = actors.get(actorKey);
      await svgDraw_default.drawActor(diagram2, actor, conf, false, diagramId, diagObj, actorIndexMap);
    }
  } else {
    let maxHeight = 0;
    bounds.bumpVerticalPos(conf.boxMargin * 2);
    for (const actorKey of actorKeys) {
      const actor = actors.get(actorKey);
      if (!actor.stopy) {
        actor.stopy = bounds.getVerticalPos();
      }
      const height = await svgDraw_default.drawActor(diagram2, actor, conf, true, diagramId, diagObj, actorIndexMap);
      maxHeight = common_default.getMax(maxHeight, height);
    }
    bounds.bumpVerticalPos(maxHeight + conf.boxMargin);
  }
}, "drawActors");
var drawActorsPopup = /* @__PURE__ */ __name(function(diagram2, actors, actorKeys, doc) {
  let maxHeight = 0;
  let maxWidth = 0;
  for (const actorKey of actorKeys) {
    const actor = actors.get(actorKey);
    const minMenuWidth = getRequiredPopupWidth(actor);
    const menuDimensions = svgDraw_default.drawPopup(diagram2, actor, minMenuWidth, conf, conf.forceMenus, doc);
    if (menuDimensions.height > maxHeight) {
      maxHeight = menuDimensions.height;
    }
    if (menuDimensions.width + actor.x > maxWidth) {
      maxWidth = menuDimensions.width + actor.x;
    }
  }
  return { maxHeight, maxWidth };
}, "drawActorsPopup");
var setConf = /* @__PURE__ */ __name(function(cnf) {
  assignWithDepth_default(conf, cnf);
  if (cnf.fontFamily) {
    conf.actorFontFamily = conf.noteFontFamily = conf.messageFontFamily = cnf.fontFamily;
  }
  if (cnf.fontSize) {
    conf.actorFontSize = conf.noteFontSize = conf.messageFontSize = cnf.fontSize;
  }
  if (cnf.fontWeight) {
    conf.actorFontWeight = conf.noteFontWeight = conf.messageFontWeight = cnf.fontWeight;
  }
}, "setConf");
var actorActivations = /* @__PURE__ */ __name(function(actor) {
  return bounds.activations.filter(function(activation) {
    return activation.actor === actor;
  });
}, "actorActivations");
var activationBounds = /* @__PURE__ */ __name(function(actor, actors) {
  const actorObj = actors.get(actor);
  const activations = actorActivations(actor);
  const left = activations.reduce(function(acc, activation) {
    return common_default.getMin(acc, activation.startx);
  }, actorObj.x + actorObj.width / 2 - 1);
  const right = activations.reduce(function(acc, activation) {
    return common_default.getMax(acc, activation.stopx);
  }, actorObj.x + actorObj.width / 2 + 1);
  return [left, right];
}, "activationBounds");
function adjustLoopHeightForWrap(loopWidths, msg, preMargin, postMargin, addLoopFn) {
  bounds.bumpVerticalPos(preMargin);
  let heightAdjust = postMargin;
  if (msg.id && msg.message && loopWidths[msg.id]) {
    const loopWidth = loopWidths[msg.id].width;
    const textConf = messageFont(conf);
    msg.message = utils_default.wrapLabel(`[${msg.message}]`, loopWidth - 2 * conf.wrapPadding, textConf);
    msg.width = loopWidth;
    msg.wrap = true;
    const textDims = utils_default.calculateTextDimensions(msg.message, textConf);
    const totalOffset = common_default.getMax(textDims.height, conf.labelBoxHeight);
    heightAdjust = postMargin + totalOffset;
    log.debug(`${totalOffset} - ${msg.message}`);
  }
  addLoopFn(msg);
  bounds.bumpVerticalPos(heightAdjust);
}
__name(adjustLoopHeightForWrap, "adjustLoopHeightForWrap");
function adjustCreatedDestroyedData(msg, msgModel, lineStartY, index, actors, createdActors, destroyedActors) {
  function receiverAdjustment(actor, adjustment) {
    if (actor.x < actors.get(msg.from).x) {
      bounds.insert(msgModel.stopx - adjustment, msgModel.starty, msgModel.startx, msgModel.stopy + actor.height / 2 + conf.noteMargin);
      msgModel.stopx = msgModel.stopx + adjustment;
    } else {
      bounds.insert(msgModel.startx, msgModel.starty, msgModel.stopx + adjustment, msgModel.stopy + actor.height / 2 + conf.noteMargin);
      msgModel.stopx = msgModel.stopx - adjustment;
    }
  }
  __name(receiverAdjustment, "receiverAdjustment");
  function senderAdjustment(actor, adjustment) {
    if (actor.x < actors.get(msg.to).x) {
      bounds.insert(msgModel.startx - adjustment, msgModel.starty, msgModel.stopx, msgModel.stopy + actor.height / 2 + conf.noteMargin);
      msgModel.startx = msgModel.startx + adjustment;
    } else {
      bounds.insert(msgModel.stopx, msgModel.starty, msgModel.startx + adjustment, msgModel.stopy + actor.height / 2 + conf.noteMargin);
      msgModel.startx = msgModel.startx - adjustment;
    }
  }
  __name(senderAdjustment, "senderAdjustment");
  const actorArray = [
    PARTICIPANT_TYPE.ACTOR,
    PARTICIPANT_TYPE.CONTROL,
    PARTICIPANT_TYPE.ENTITY,
    PARTICIPANT_TYPE.DATABASE
  ];
  if (createdActors.get(msg.to) == index) {
    const actor = actors.get(msg.to);
    const adjustment = actorArray.includes(actor.type) ? ACTOR_TYPE_WIDTH / 2 + 3 : actor.width / 2 + 3;
    receiverAdjustment(actor, adjustment);
    actor.starty = lineStartY - actor.height / 2;
    bounds.bumpVerticalPos(actor.height / 2);
  } else if (destroyedActors.get(msg.from) == index) {
    const actor = actors.get(msg.from);
    if (conf.mirrorActors) {
      const adjustment = actorArray.includes(actor.type) ? ACTOR_TYPE_WIDTH / 2 : actor.width / 2;
      senderAdjustment(actor, adjustment);
    }
    actor.stopy = lineStartY - actor.height / 2;
    bounds.bumpVerticalPos(actor.height / 2);
  } else if (destroyedActors.get(msg.to) == index) {
    const actor = actors.get(msg.to);
    if (conf.mirrorActors) {
      const adjustment = actorArray.includes(actor.type) ? ACTOR_TYPE_WIDTH / 2 + 3 : actor.width / 2 + 3;
      receiverAdjustment(actor, adjustment);
    }
    actor.stopy = lineStartY - actor.height / 2;
    bounds.bumpVerticalPos(actor.height / 2);
  }
}
__name(adjustCreatedDestroyedData, "adjustCreatedDestroyedData");
var draw = /* @__PURE__ */ __name(async function(_text, id, _version, diagObj) {
  const { securityLevel, sequence, look } = getConfig2();
  conf = sequence;
  let sandboxElement;
  if (securityLevel === "sandbox") {
    sandboxElement = select_default("#i" + id);
  }
  const root = securityLevel === "sandbox" ? select_default(sandboxElement.nodes()[0].contentDocument.body) : select_default("body");
  const doc = securityLevel === "sandbox" ? sandboxElement.nodes()[0].contentDocument : document;
  bounds.init();
  log.debug(diagObj.db);
  const diagram2 = securityLevel === "sandbox" ? root.select(`[id="${id}"]`) : select_default(`[id="${id}"]`);
  const actors = diagObj.db.getActors();
  const createdActors = diagObj.db.getCreatedActors();
  const destroyedActors = diagObj.db.getDestroyedActors();
  const boxes = diagObj.db.getBoxes();
  let actorKeys = diagObj.db.getActorKeys();
  const messages = diagObj.db.getMessages();
  const title = diagObj.db.getDiagramTitle();
  const hasBoxes = diagObj.db.hasAtLeastOneBox();
  const hasBoxTitles = diagObj.db.hasAtLeastOneBoxWithTitle();
  const maxMessageWidthPerActor = await getMaxMessageWidthPerActor(actors, messages, diagObj);
  conf.height = await calculateActorMargins(actors, maxMessageWidthPerActor, boxes);
  svgDraw_default.insertComputerIcon(diagram2, id);
  svgDraw_default.insertDatabaseIcon(diagram2, id);
  svgDraw_default.insertClockIcon(diagram2, id);
  if (hasBoxes) {
    bounds.bumpVerticalPos(conf.boxMargin);
    if (hasBoxTitles) {
      bounds.bumpVerticalPos(boxes[0].textMaxHeight);
    }
  }
  if (conf.hideUnusedParticipants === true) {
    const newActors = /* @__PURE__ */ new Set;
    messages.forEach((message) => {
      newActors.add(message.from);
      newActors.add(message.to);
    });
    actorKeys = actorKeys.filter((actorKey) => newActors.has(actorKey));
  }
  const actorIndexMap = new Map(actorKeys.map((actorKey, index2) => [actors.get(actorKey)?.name ?? actorKey, index2]));
  addActorRenderingData(diagram2, actors, createdActors, actorKeys, 0, messages, false);
  const loopWidths = await calculateLoopBounds(messages, actors, maxMessageWidthPerActor, diagObj);
  svgDraw_default.insertArrowHead(diagram2, id);
  svgDraw_default.insertArrowCrossHead(diagram2, id);
  svgDraw_default.insertArrowFilledHead(diagram2, id);
  svgDraw_default.insertSequenceNumber(diagram2, id);
  svgDraw_default.insertSolidTopArrowHead(diagram2, id);
  svgDraw_default.insertSolidBottomArrowHead(diagram2, id);
  svgDraw_default.insertStickTopArrowHead(diagram2, id);
  svgDraw_default.insertStickBottomArrowHead(diagram2, id);
  if (look === "neo") {
    svgDraw_default.insertDropShadow(diagram2, conf);
  }
  function activeEnd(msg, verticalPos) {
    const activationData = bounds.endActivation(msg);
    if (activationData.starty + 18 > verticalPos) {
      activationData.starty = verticalPos - 6;
      verticalPos += 12;
    }
    svgDraw_default.drawActivation(diagram2, activationData, verticalPos, conf, actorActivations(msg.from).length, diagObj, actorIndexMap);
    bounds.insert(activationData.startx, verticalPos - 10, activationData.stopx, verticalPos);
  }
  __name(activeEnd, "activeEnd");
  let sequenceIndex = 1;
  let sequenceIndexStep = 1;
  const messagesToDraw = [];
  const backgrounds = [];
  let index = 0;
  for (const msg of messages) {
    let loopModel, noteModel, msgModel;
    switch (msg.type) {
      case diagObj.db.LINETYPE.NOTE:
        bounds.resetVerticalPos();
        noteModel = msg.noteModel;
        await drawNote(diagram2, noteModel, msg.id);
        break;
      case diagObj.db.LINETYPE.ACTIVE_START:
        bounds.newActivation(msg, diagram2, actors);
        break;
      case diagObj.db.LINETYPE.CENTRAL_CONNECTION:
        bounds.newActivation(msg, diagram2, actors);
        break;
      case diagObj.db.LINETYPE.CENTRAL_CONNECTION_REVERSE:
        bounds.newActivation(msg, diagram2, actors);
        break;
      case diagObj.db.LINETYPE.ACTIVE_END:
        activeEnd(msg, bounds.getVerticalPos());
        break;
      case diagObj.db.LINETYPE.LOOP_START:
        adjustLoopHeightForWrap(loopWidths, msg, conf.boxMargin, conf.boxMargin + conf.boxTextMargin, (message) => bounds.newLoop(message));
        break;
      case diagObj.db.LINETYPE.LOOP_END:
        loopModel = bounds.endLoop();
        await svgDraw_default.drawLoop(diagram2, loopModel, "loop", conf, msg);
        bounds.bumpVerticalPos(loopModel.stopy - bounds.getVerticalPos());
        bounds.models.addLoop(loopModel);
        break;
      case diagObj.db.LINETYPE.RECT_START:
        adjustLoopHeightForWrap(loopWidths, msg, conf.boxMargin, conf.boxMargin, (message) => bounds.newLoop(undefined, message.message));
        break;
      case diagObj.db.LINETYPE.RECT_END:
        loopModel = bounds.endLoop();
        backgrounds.push(loopModel);
        bounds.models.addLoop(loopModel);
        bounds.bumpVerticalPos(loopModel.stopy - bounds.getVerticalPos());
        break;
      case diagObj.db.LINETYPE.OPT_START:
        adjustLoopHeightForWrap(loopWidths, msg, conf.boxMargin, conf.boxMargin + conf.boxTextMargin, (message) => bounds.newLoop(message));
        break;
      case diagObj.db.LINETYPE.OPT_END:
        loopModel = bounds.endLoop();
        await svgDraw_default.drawLoop(diagram2, loopModel, "opt", conf, msg);
        bounds.bumpVerticalPos(loopModel.stopy - bounds.getVerticalPos());
        bounds.models.addLoop(loopModel);
        break;
      case diagObj.db.LINETYPE.ALT_START:
        adjustLoopHeightForWrap(loopWidths, msg, conf.boxMargin, conf.boxMargin + conf.boxTextMargin, (message) => bounds.newLoop(message));
        break;
      case diagObj.db.LINETYPE.ALT_ELSE:
        adjustLoopHeightForWrap(loopWidths, msg, conf.boxMargin + conf.boxTextMargin, conf.boxMargin, (message) => bounds.addSectionToLoop(message));
        break;
      case diagObj.db.LINETYPE.ALT_END:
        loopModel = bounds.endLoop();
        await svgDraw_default.drawLoop(diagram2, loopModel, "alt", conf, msg);
        bounds.bumpVerticalPos(loopModel.stopy - bounds.getVerticalPos());
        bounds.models.addLoop(loopModel);
        break;
      case diagObj.db.LINETYPE.PAR_START:
      case diagObj.db.LINETYPE.PAR_OVER_START:
        adjustLoopHeightForWrap(loopWidths, msg, conf.boxMargin, conf.boxMargin + conf.boxTextMargin, (message) => bounds.newLoop(message));
        bounds.saveVerticalPos();
        break;
      case diagObj.db.LINETYPE.PAR_AND:
        adjustLoopHeightForWrap(loopWidths, msg, conf.boxMargin + conf.boxTextMargin, conf.boxMargin, (message) => bounds.addSectionToLoop(message));
        break;
      case diagObj.db.LINETYPE.PAR_END:
        loopModel = bounds.endLoop();
        await svgDraw_default.drawLoop(diagram2, loopModel, "par", conf, msg);
        bounds.bumpVerticalPos(loopModel.stopy - bounds.getVerticalPos());
        bounds.models.addLoop(loopModel);
        break;
      case diagObj.db.LINETYPE.AUTONUMBER:
        sequenceIndex = msg.message.start || sequenceIndex;
        sequenceIndexStep = msg.message.step || sequenceIndexStep;
        if (msg.message.visible) {
          diagObj.db.enableSequenceNumbers();
        } else {
          diagObj.db.disableSequenceNumbers();
        }
        break;
      case diagObj.db.LINETYPE.CRITICAL_START:
        adjustLoopHeightForWrap(loopWidths, msg, conf.boxMargin, conf.boxMargin + conf.boxTextMargin, (message) => bounds.newLoop(message));
        break;
      case diagObj.db.LINETYPE.CRITICAL_OPTION:
        adjustLoopHeightForWrap(loopWidths, msg, conf.boxMargin + conf.boxTextMargin, conf.boxMargin, (message) => bounds.addSectionToLoop(message));
        break;
      case diagObj.db.LINETYPE.CRITICAL_END:
        loopModel = bounds.endLoop();
        await svgDraw_default.drawLoop(diagram2, loopModel, "critical", conf, msg);
        bounds.bumpVerticalPos(loopModel.stopy - bounds.getVerticalPos());
        bounds.models.addLoop(loopModel);
        break;
      case diagObj.db.LINETYPE.BREAK_START:
        adjustLoopHeightForWrap(loopWidths, msg, conf.boxMargin, conf.boxMargin + conf.boxTextMargin, (message) => bounds.newLoop(message));
        break;
      case diagObj.db.LINETYPE.BREAK_END:
        loopModel = bounds.endLoop();
        await svgDraw_default.drawLoop(diagram2, loopModel, "break", conf, msg);
        bounds.bumpVerticalPos(loopModel.stopy - bounds.getVerticalPos());
        bounds.models.addLoop(loopModel);
        break;
      default:
        try {
          msgModel = msg.msgModel;
          msgModel.starty = bounds.getVerticalPos();
          msgModel.sequenceIndex = sequenceIndex;
          msgModel.sequenceVisible = diagObj.db.showSequenceNumbers();
          msgModel.id = msg.id;
          msgModel.from = msg.from;
          msgModel.to = msg.to;
          const lineStartY = await boundMessage(diagram2, msgModel);
          adjustCreatedDestroyedData(msg, msgModel, lineStartY, index, actors, createdActors, destroyedActors);
          messagesToDraw.push({ messageModel: msgModel, lineStartY, msg });
          bounds.models.addMessage(msgModel);
        } catch (e) {
          log.error("error while drawing message", e);
        }
    }
    if ([
      diagObj.db.LINETYPE.SOLID_OPEN,
      diagObj.db.LINETYPE.DOTTED_OPEN,
      diagObj.db.LINETYPE.SOLID,
      diagObj.db.LINETYPE.SOLID_TOP,
      diagObj.db.LINETYPE.SOLID_BOTTOM,
      diagObj.db.LINETYPE.STICK_TOP,
      diagObj.db.LINETYPE.STICK_BOTTOM,
      diagObj.db.LINETYPE.SOLID_TOP_DOTTED,
      diagObj.db.LINETYPE.SOLID_BOTTOM_DOTTED,
      diagObj.db.LINETYPE.STICK_TOP_DOTTED,
      diagObj.db.LINETYPE.STICK_BOTTOM_DOTTED,
      diagObj.db.LINETYPE.SOLID_ARROW_TOP_REVERSE,
      diagObj.db.LINETYPE.SOLID_ARROW_BOTTOM_REVERSE,
      diagObj.db.LINETYPE.STICK_ARROW_TOP_REVERSE,
      diagObj.db.LINETYPE.STICK_ARROW_BOTTOM_REVERSE,
      diagObj.db.LINETYPE.SOLID_ARROW_TOP_REVERSE_DOTTED,
      diagObj.db.LINETYPE.SOLID_ARROW_BOTTOM_REVERSE_DOTTED,
      diagObj.db.LINETYPE.STICK_ARROW_TOP_REVERSE_DOTTED,
      diagObj.db.LINETYPE.STICK_ARROW_BOTTOM_REVERSE_DOTTED,
      diagObj.db.LINETYPE.DOTTED,
      diagObj.db.LINETYPE.SOLID_CROSS,
      diagObj.db.LINETYPE.DOTTED_CROSS,
      diagObj.db.LINETYPE.SOLID_POINT,
      diagObj.db.LINETYPE.DOTTED_POINT,
      diagObj.db.LINETYPE.BIDIRECTIONAL_SOLID,
      diagObj.db.LINETYPE.BIDIRECTIONAL_DOTTED
    ].includes(msg.type)) {
      sequenceIndex = Math.round((sequenceIndex + sequenceIndexStep) * 100) / 100;
    }
    index++;
  }
  log.debug("createdActors", createdActors);
  log.debug("destroyedActors", destroyedActors);
  await drawActors(diagram2, actors, actorKeys, false, id, diagObj, actorIndexMap);
  for (const e of messagesToDraw) {
    await drawMessage(diagram2, e.messageModel, e.lineStartY, diagObj, e.msg, id);
  }
  if (conf.mirrorActors) {
    await drawActors(diagram2, actors, actorKeys, true, id, diagObj, actorIndexMap);
  }
  backgrounds.forEach((e) => svgDraw_default.drawBackgroundRect(diagram2, e));
  fixLifeLineHeights(diagram2, actors, actorKeys, conf);
  for (const box2 of bounds.models.boxes) {
    box2.height = bounds.getVerticalPos() - box2.y;
    bounds.insert(box2.x, box2.y, box2.x + box2.width, box2.height);
    const boxPadding = conf.boxMargin * 2;
    box2.startx = box2.x - boxPadding;
    box2.starty = box2.y - boxPadding * 0.25;
    box2.stopx = box2.startx + box2.width + 2 * boxPadding;
    box2.stopy = box2.starty + box2.height + boxPadding * 0.75;
    box2.stroke = "rgb(0,0,0, 0.5)";
    svgDraw_default.drawBox(diagram2, box2, conf);
  }
  if (hasBoxes) {
    bounds.bumpVerticalPos(conf.boxMargin);
  }
  const requiredBoxSize = drawActorsPopup(diagram2, actors, actorKeys, doc);
  const { bounds: box } = bounds.getBounds();
  if (box.startx === undefined) {
    box.startx = 0;
  }
  if (box.starty === undefined) {
    box.starty = 0;
  }
  if (box.stopx === undefined) {
    box.stopx = 0;
  }
  if (box.stopy === undefined) {
    box.stopy = 0;
  }
  let boxHeight = box.stopy - box.starty;
  if (boxHeight < requiredBoxSize.maxHeight) {
    boxHeight = requiredBoxSize.maxHeight;
  }
  let height = boxHeight + 2 * conf.diagramMarginY;
  if (conf.mirrorActors) {
    height = height - conf.boxMargin + conf.bottomMarginAdj;
  }
  let boxWidth = box.stopx - box.startx;
  if (boxWidth < requiredBoxSize.maxWidth) {
    boxWidth = requiredBoxSize.maxWidth;
  }
  const width = boxWidth + 2 * conf.diagramMarginX;
  if (title) {
    diagram2.append("text").text(title).attr("x", (box.stopx - box.startx) / 2 - 2 * conf.diagramMarginX).attr("y", -25);
  }
  configureSvgSize(diagram2, height, width, conf.useMaxWidth);
  const extraVertForTitle = title ? 40 : 0;
  const extraHeightForNeoActors = actors.size && look === "neo" ? 30 : 0;
  diagram2.attr("viewBox", box.startx - conf.diagramMarginX + " -" + (conf.diagramMarginY + extraVertForTitle) + " " + width + " " + (height + extraVertForTitle + extraHeightForNeoActors));
  log.debug(`models:`, bounds.models);
}, "draw");
async function getMaxMessageWidthPerActor(actors, messages, diagObj) {
  const maxMessageWidthPerActor = {};
  for (const msg of messages) {
    if (actors.get(msg.to) && actors.get(msg.from)) {
      const actor = actors.get(msg.to);
      if (msg.placement === diagObj.db.PLACEMENT.LEFTOF && !actor.prevActor) {
        continue;
      }
      if (msg.placement === diagObj.db.PLACEMENT.RIGHTOF && !actor.nextActor) {
        continue;
      }
      const isNote = msg.placement !== undefined;
      const isMessage = !isNote;
      const textFont = isNote ? noteFont(conf) : messageFont(conf);
      const wrappedMessage = msg.wrap ? utils_default.wrapLabel(msg.message, conf.width - 2 * conf.wrapPadding, textFont) : msg.message;
      const messageDimensions = hasKatex(wrappedMessage) ? await calculateMathMLDimensions(msg.message, getConfig2()) : utils_default.calculateTextDimensions(wrappedMessage, textFont);
      const messageWidth = messageDimensions.width + 2 * conf.wrapPadding;
      if (isMessage && msg.from === actor.nextActor) {
        maxMessageWidthPerActor[msg.to] = common_default.getMax(maxMessageWidthPerActor[msg.to] || 0, messageWidth);
      } else if (isMessage && msg.from === actor.prevActor) {
        maxMessageWidthPerActor[msg.from] = common_default.getMax(maxMessageWidthPerActor[msg.from] || 0, messageWidth);
      } else if (isMessage && msg.from === msg.to) {
        maxMessageWidthPerActor[msg.from] = common_default.getMax(maxMessageWidthPerActor[msg.from] || 0, messageWidth / 2);
        maxMessageWidthPerActor[msg.to] = common_default.getMax(maxMessageWidthPerActor[msg.to] || 0, messageWidth / 2);
      } else if (msg.placement === diagObj.db.PLACEMENT.RIGHTOF) {
        maxMessageWidthPerActor[msg.from] = common_default.getMax(maxMessageWidthPerActor[msg.from] || 0, messageWidth);
      } else if (msg.placement === diagObj.db.PLACEMENT.LEFTOF) {
        maxMessageWidthPerActor[actor.prevActor] = common_default.getMax(maxMessageWidthPerActor[actor.prevActor] || 0, messageWidth);
      } else if (msg.placement === diagObj.db.PLACEMENT.OVER) {
        if (actor.prevActor) {
          maxMessageWidthPerActor[actor.prevActor] = common_default.getMax(maxMessageWidthPerActor[actor.prevActor] || 0, messageWidth / 2);
        }
        if (actor.nextActor) {
          maxMessageWidthPerActor[msg.from] = common_default.getMax(maxMessageWidthPerActor[msg.from] || 0, messageWidth / 2);
        }
      }
    }
  }
  log.debug("maxMessageWidthPerActor:", maxMessageWidthPerActor);
  return maxMessageWidthPerActor;
}
__name(getMaxMessageWidthPerActor, "getMaxMessageWidthPerActor");
var getRequiredPopupWidth = /* @__PURE__ */ __name(function(actor) {
  let requiredPopupWidth = 0;
  const textFont = actorFont(conf);
  for (const key in actor.links) {
    const labelDimensions = utils_default.calculateTextDimensions(key, textFont);
    const labelWidth = labelDimensions.width + 2 * conf.wrapPadding + 2 * conf.boxMargin;
    if (requiredPopupWidth < labelWidth) {
      requiredPopupWidth = labelWidth;
    }
  }
  return requiredPopupWidth;
}, "getRequiredPopupWidth");
async function calculateActorMargins(actors, actorToMessageWidth, boxes) {
  let maxHeight = 0;
  for (const prop of actors.keys()) {
    const actor = actors.get(prop);
    if (actor.wrap) {
      actor.description = utils_default.wrapLabel(actor.description, conf.width - 2 * conf.wrapPadding, actorFont(conf));
    }
    const actDims = hasKatex(actor.description) ? await calculateMathMLDimensions(actor.description, getConfig2()) : utils_default.calculateTextDimensions(actor.description, actorFont(conf));
    actor.width = actor.wrap ? conf.width : common_default.getMax(conf.width, actDims.width + 2 * conf.wrapPadding);
    actor.height = actor.wrap ? common_default.getMax(actDims.height, conf.height) : conf.height;
    maxHeight = common_default.getMax(maxHeight, actor.height);
  }
  for (const actorKey in actorToMessageWidth) {
    const actor = actors.get(actorKey);
    if (!actor) {
      continue;
    }
    const nextActor = actors.get(actor.nextActor);
    if (!nextActor) {
      const messageWidth2 = actorToMessageWidth[actorKey];
      const actorWidth2 = messageWidth2 + conf.actorMargin - actor.width / 2;
      actor.margin = common_default.getMax(actorWidth2, conf.actorMargin);
      continue;
    }
    const messageWidth = actorToMessageWidth[actorKey];
    const actorWidth = messageWidth + conf.actorMargin - actor.width / 2 - nextActor.width / 2;
    actor.margin = common_default.getMax(actorWidth, conf.actorMargin);
  }
  let maxBoxHeight = 0;
  boxes.forEach((box) => {
    const textFont = messageFont(conf);
    let totalWidth = box.actorKeys.reduce((total, aKey) => {
      return total += actors.get(aKey).width + (actors.get(aKey).margin || 0);
    }, 0);
    const standardBoxPadding = conf.boxMargin * 8;
    totalWidth += standardBoxPadding;
    totalWidth -= 2 * conf.boxTextMargin;
    if (box.wrap) {
      box.name = utils_default.wrapLabel(box.name, totalWidth - 2 * conf.wrapPadding, textFont);
    }
    const boxMsgDimensions = utils_default.calculateTextDimensions(box.name, textFont);
    maxBoxHeight = common_default.getMax(boxMsgDimensions.height, maxBoxHeight);
    const minWidth = common_default.getMax(totalWidth, boxMsgDimensions.width + 2 * conf.wrapPadding);
    box.margin = conf.boxTextMargin;
    if (totalWidth < minWidth) {
      const missing = (minWidth - totalWidth) / 2;
      box.margin += missing;
    }
  });
  boxes.forEach((box) => box.textMaxHeight = maxBoxHeight);
  return common_default.getMax(maxHeight, conf.height);
}
__name(calculateActorMargins, "calculateActorMargins");
var buildNoteModel = /* @__PURE__ */ __name(async function(msg, actors, diagObj) {
  const fromActor = actors.get(msg.from);
  const toActor = actors.get(msg.to);
  const startx = fromActor.x;
  const stopx = toActor.x;
  const shouldWrap = msg.wrap && msg.message;
  let textDimensions = hasKatex(msg.message) ? await calculateMathMLDimensions(msg.message, getConfig2()) : utils_default.calculateTextDimensions(shouldWrap ? utils_default.wrapLabel(msg.message, conf.width, noteFont(conf)) : msg.message, noteFont(conf));
  const noteModel = {
    width: shouldWrap ? conf.width : common_default.getMax(conf.width, textDimensions.width + 2 * conf.noteMargin),
    height: 0,
    startx: fromActor.x,
    stopx: 0,
    starty: 0,
    stopy: 0,
    message: msg.message
  };
  if (msg.placement === diagObj.db.PLACEMENT.RIGHTOF) {
    noteModel.width = shouldWrap ? common_default.getMax(conf.width, textDimensions.width) : common_default.getMax(fromActor.width / 2 + toActor.width / 2, textDimensions.width + 2 * conf.noteMargin);
    noteModel.startx = startx + (fromActor.width + conf.actorMargin) / 2;
  } else if (msg.placement === diagObj.db.PLACEMENT.LEFTOF) {
    noteModel.width = shouldWrap ? common_default.getMax(conf.width, textDimensions.width + 2 * conf.noteMargin) : common_default.getMax(fromActor.width / 2 + toActor.width / 2, textDimensions.width + 2 * conf.noteMargin);
    noteModel.startx = startx - noteModel.width + (fromActor.width - conf.actorMargin) / 2;
  } else if (msg.to === msg.from) {
    textDimensions = utils_default.calculateTextDimensions(shouldWrap ? utils_default.wrapLabel(msg.message, common_default.getMax(conf.width, fromActor.width), noteFont(conf)) : msg.message, noteFont(conf));
    noteModel.width = shouldWrap ? common_default.getMax(conf.width, fromActor.width) : common_default.getMax(fromActor.width, conf.width, textDimensions.width + 2 * conf.noteMargin);
    noteModel.startx = startx + (fromActor.width - noteModel.width) / 2;
  } else {
    noteModel.width = Math.abs(startx + fromActor.width / 2 - (stopx + toActor.width / 2)) + conf.actorMargin;
    noteModel.startx = startx < stopx ? startx + fromActor.width / 2 - conf.actorMargin / 2 : stopx + toActor.width / 2 - conf.actorMargin / 2;
  }
  if (shouldWrap) {
    noteModel.message = utils_default.wrapLabel(msg.message, noteModel.width - 2 * conf.wrapPadding, noteFont(conf));
  }
  log.debug(`NM:[${noteModel.startx},${noteModel.stopx},${noteModel.starty},${noteModel.stopy}:${noteModel.width},${noteModel.height}=${msg.message}]`);
  return noteModel;
}, "buildNoteModel");
var CENTRAL_CONNECTION_BASE_OFFSET = 4;
var CENTRAL_CONNECTION_BIDIRECTIONAL_OFFSET = 6;
var hasCentralConnection = /* @__PURE__ */ __name(function(msg, diagObj) {
  const { CENTRAL_CONNECTION, CENTRAL_CONNECTION_REVERSE, CENTRAL_CONNECTION_DUAL } = diagObj.db.LINETYPE;
  return [CENTRAL_CONNECTION, CENTRAL_CONNECTION_REVERSE, CENTRAL_CONNECTION_DUAL].includes(msg.centralConnection);
}, "hasCentralConnection");
var calculateCentralConnectionOffset = /* @__PURE__ */ __name(function(msg, diagObj, isArrowToRight) {
  const {
    CENTRAL_CONNECTION_REVERSE,
    CENTRAL_CONNECTION_DUAL,
    BIDIRECTIONAL_SOLID,
    BIDIRECTIONAL_DOTTED
  } = diagObj.db.LINETYPE;
  let offset = 0;
  if (msg.centralConnection === CENTRAL_CONNECTION_REVERSE || msg.centralConnection === CENTRAL_CONNECTION_DUAL) {
    offset += CENTRAL_CONNECTION_BASE_OFFSET;
  }
  if ((msg.centralConnection === CENTRAL_CONNECTION_REVERSE || msg.centralConnection === CENTRAL_CONNECTION_DUAL) && (msg.type === BIDIRECTIONAL_SOLID || msg.type === BIDIRECTIONAL_DOTTED)) {
    offset += isArrowToRight ? 0 : -CENTRAL_CONNECTION_BIDIRECTIONAL_OFFSET;
  }
  return offset;
}, "calculateCentralConnectionOffset");
var isReverseArrowType = /* @__PURE__ */ __name(function(msg, diagObj) {
  const {
    SOLID_ARROW_TOP_REVERSE,
    SOLID_ARROW_TOP_REVERSE_DOTTED,
    SOLID_ARROW_BOTTOM_REVERSE,
    SOLID_ARROW_BOTTOM_REVERSE_DOTTED,
    STICK_ARROW_TOP_REVERSE,
    STICK_ARROW_TOP_REVERSE_DOTTED,
    STICK_ARROW_BOTTOM_REVERSE,
    STICK_ARROW_BOTTOM_REVERSE_DOTTED
  } = diagObj.db.LINETYPE;
  return [
    SOLID_ARROW_TOP_REVERSE,
    SOLID_ARROW_TOP_REVERSE_DOTTED,
    SOLID_ARROW_BOTTOM_REVERSE,
    SOLID_ARROW_BOTTOM_REVERSE_DOTTED,
    STICK_ARROW_TOP_REVERSE,
    STICK_ARROW_TOP_REVERSE_DOTTED,
    STICK_ARROW_BOTTOM_REVERSE,
    STICK_ARROW_BOTTOM_REVERSE_DOTTED
  ].includes(msg.type);
}, "isReverseArrowType");
var isBidirectionalArrowType = /* @__PURE__ */ __name(function(msg, diagObj) {
  const { BIDIRECTIONAL_SOLID, BIDIRECTIONAL_DOTTED } = diagObj.db.LINETYPE;
  return [BIDIRECTIONAL_SOLID, BIDIRECTIONAL_DOTTED].includes(msg.type);
}, "isBidirectionalArrowType");
var buildMessageModel = /* @__PURE__ */ __name(function(msg, actors, diagObj) {
  const { look } = getConfig2();
  if (![
    diagObj.db.LINETYPE.SOLID_OPEN,
    diagObj.db.LINETYPE.DOTTED_OPEN,
    diagObj.db.LINETYPE.SOLID,
    diagObj.db.LINETYPE.SOLID_TOP,
    diagObj.db.LINETYPE.SOLID_BOTTOM,
    diagObj.db.LINETYPE.STICK_TOP,
    diagObj.db.LINETYPE.STICK_BOTTOM,
    diagObj.db.LINETYPE.SOLID_TOP_DOTTED,
    diagObj.db.LINETYPE.SOLID_BOTTOM_DOTTED,
    diagObj.db.LINETYPE.STICK_TOP_DOTTED,
    diagObj.db.LINETYPE.STICK_BOTTOM_DOTTED,
    diagObj.db.LINETYPE.SOLID_ARROW_TOP_REVERSE,
    diagObj.db.LINETYPE.SOLID_ARROW_BOTTOM_REVERSE,
    diagObj.db.LINETYPE.STICK_ARROW_TOP_REVERSE,
    diagObj.db.LINETYPE.STICK_ARROW_BOTTOM_REVERSE,
    diagObj.db.LINETYPE.SOLID_ARROW_TOP_REVERSE_DOTTED,
    diagObj.db.LINETYPE.SOLID_ARROW_BOTTOM_REVERSE_DOTTED,
    diagObj.db.LINETYPE.STICK_ARROW_TOP_REVERSE_DOTTED,
    diagObj.db.LINETYPE.STICK_ARROW_BOTTOM_REVERSE_DOTTED,
    diagObj.db.LINETYPE.DOTTED,
    diagObj.db.LINETYPE.SOLID_CROSS,
    diagObj.db.LINETYPE.DOTTED_CROSS,
    diagObj.db.LINETYPE.SOLID_POINT,
    diagObj.db.LINETYPE.DOTTED_POINT,
    diagObj.db.LINETYPE.BIDIRECTIONAL_SOLID,
    diagObj.db.LINETYPE.BIDIRECTIONAL_DOTTED
  ].includes(msg.type)) {
    return {};
  }
  const [fromLeft, fromRight] = activationBounds(msg.from, actors);
  const [toLeft, toRight] = activationBounds(msg.to, actors);
  const isArrowToRight = fromLeft <= toLeft;
  let startx = isArrowToRight ? fromRight : fromLeft;
  let stopx = isArrowToRight ? toLeft : toRight;
  if (look === "neo") {
    const offset = 3;
    if (msg.type !== diagObj.db.LINETYPE.SOLID_OPEN) {
      stopx += isArrowToRight ? -offset : offset;
    }
    if (msg.type === diagObj.db.LINETYPE.BIDIRECTIONAL_SOLID || msg.type === diagObj.db.LINETYPE.BIDIRECTIONAL_DOTTED) {
      startx += isArrowToRight ? offset : -offset;
    }
  }
  startx += calculateCentralConnectionOffset(msg, diagObj, isArrowToRight);
  const isArrowToActivation = Math.abs(toLeft - toRight) > 2;
  const adjustValue = /* @__PURE__ */ __name((value) => {
    return isArrowToRight ? -value : value;
  }, "adjustValue");
  if (msg.from === msg.to) {
    stopx = startx;
  } else {
    if (msg.activate && !isArrowToActivation) {
      stopx += adjustValue(conf.activationWidth / 2 - 1);
    }
    if (![
      diagObj.db.LINETYPE.SOLID_OPEN,
      diagObj.db.LINETYPE.DOTTED_OPEN,
      diagObj.db.LINETYPE.STICK_TOP,
      diagObj.db.LINETYPE.STICK_BOTTOM,
      diagObj.db.LINETYPE.STICK_TOP_DOTTED,
      diagObj.db.LINETYPE.STICK_BOTTOM_DOTTED,
      diagObj.db.LINETYPE.SOLID_ARROW_TOP_REVERSE_DOTTED,
      diagObj.db.LINETYPE.SOLID_ARROW_BOTTOM_REVERSE_DOTTED,
      diagObj.db.LINETYPE.STICK_ARROW_TOP_REVERSE,
      diagObj.db.LINETYPE.STICK_ARROW_BOTTOM_REVERSE,
      diagObj.db.LINETYPE.STICK_ARROW_TOP_REVERSE_DOTTED,
      diagObj.db.LINETYPE.STICK_ARROW_BOTTOM_REVERSE_DOTTED,
      diagObj.db.LINETYPE.SOLID_ARROW_TOP_REVERSE,
      diagObj.db.LINETYPE.SOLID_ARROW_BOTTOM_REVERSE
    ].includes(msg.type)) {
      stopx += adjustValue(3);
    }
    if ([
      diagObj.db.LINETYPE.BIDIRECTIONAL_SOLID,
      diagObj.db.LINETYPE.BIDIRECTIONAL_DOTTED,
      diagObj.db.LINETYPE.SOLID_ARROW_TOP_REVERSE_DOTTED,
      diagObj.db.LINETYPE.SOLID_ARROW_BOTTOM_REVERSE_DOTTED,
      diagObj.db.LINETYPE.SOLID_ARROW_TOP_REVERSE,
      diagObj.db.LINETYPE.SOLID_ARROW_BOTTOM_REVERSE
    ].includes(msg.type)) {
      startx -= adjustValue(3);
    }
  }
  const allBounds = [fromLeft, fromRight, toLeft, toRight];
  const boundedWidth = Math.abs(startx - stopx);
  if (msg.wrap && msg.message) {
    msg.message = utils_default.wrapLabel(msg.message, common_default.getMax(boundedWidth + 2 * conf.wrapPadding, conf.width), messageFont(conf));
  }
  const msgDims = utils_default.calculateTextDimensions(msg.message, messageFont(conf));
  return {
    width: common_default.getMax(msg.wrap ? 0 : msgDims.width + 2 * conf.wrapPadding, boundedWidth + 2 * conf.wrapPadding, conf.width),
    height: 0,
    startx,
    stopx,
    starty: 0,
    stopy: 0,
    message: msg.message,
    type: msg.type,
    wrap: msg.wrap,
    fromBounds: Math.min.apply(null, allBounds),
    toBounds: Math.max.apply(null, allBounds)
  };
}, "buildMessageModel");
var calculateLoopBounds = /* @__PURE__ */ __name(async function(messages, actors, _maxWidthPerActor, diagObj) {
  const loops = {};
  const stack = [];
  let current, noteModel, msgModel;
  for (const msg of messages) {
    switch (msg.type) {
      case diagObj.db.LINETYPE.LOOP_START:
      case diagObj.db.LINETYPE.ALT_START:
      case diagObj.db.LINETYPE.OPT_START:
      case diagObj.db.LINETYPE.PAR_START:
      case diagObj.db.LINETYPE.PAR_OVER_START:
      case diagObj.db.LINETYPE.CRITICAL_START:
      case diagObj.db.LINETYPE.BREAK_START:
        stack.push({
          id: msg.id,
          msg: msg.message,
          from: Number.MAX_SAFE_INTEGER,
          to: Number.MIN_SAFE_INTEGER,
          width: 0
        });
        break;
      case diagObj.db.LINETYPE.ALT_ELSE:
      case diagObj.db.LINETYPE.PAR_AND:
      case diagObj.db.LINETYPE.CRITICAL_OPTION:
        if (msg.message) {
          current = stack.pop();
          loops[current.id] = current;
          loops[msg.id] = current;
          stack.push(current);
        }
        break;
      case diagObj.db.LINETYPE.LOOP_END:
      case diagObj.db.LINETYPE.ALT_END:
      case diagObj.db.LINETYPE.OPT_END:
      case diagObj.db.LINETYPE.PAR_END:
      case diagObj.db.LINETYPE.CRITICAL_END:
      case diagObj.db.LINETYPE.BREAK_END:
        current = stack.pop();
        loops[current.id] = current;
        break;
      case diagObj.db.LINETYPE.ACTIVE_START:
        {
          const actorRect = actors.get(msg.from ? msg.from : msg.to.actor);
          const stackedSize = actorActivations(msg.from ? msg.from : msg.to.actor).length;
          const x = actorRect.x + actorRect.width / 2 + (stackedSize - 1) * conf.activationWidth / 2;
          const toAdd = {
            startx: x,
            stopx: x + conf.activationWidth,
            actor: msg.from,
            enabled: true
          };
          bounds.activations.push(toAdd);
        }
        break;
      case diagObj.db.LINETYPE.ACTIVE_END:
        {
          const lastActorActivationIdx = bounds.activations.map((a) => a.actor).lastIndexOf(msg.from);
          bounds.activations.splice(lastActorActivationIdx, 1).splice(0, 1);
        }
        break;
    }
    const isNote = msg.placement !== undefined;
    if (isNote) {
      noteModel = await buildNoteModel(msg, actors, diagObj);
      msg.noteModel = noteModel;
      stack.forEach((stk) => {
        current = stk;
        current.from = common_default.getMin(current.from, noteModel.startx);
        current.to = common_default.getMax(current.to, noteModel.startx + noteModel.width);
        current.width = common_default.getMax(current.width, Math.abs(current.from - current.to)) - conf.labelBoxWidth;
      });
    } else {
      msgModel = buildMessageModel(msg, actors, diagObj);
      msg.msgModel = msgModel;
      if (msgModel.startx && msgModel.stopx && stack.length > 0) {
        stack.forEach((stk) => {
          current = stk;
          if (msgModel.startx === msgModel.stopx) {
            const from = actors.get(msg.from);
            const to = actors.get(msg.to);
            current.from = common_default.getMin(from.x - msgModel.width / 2, from.x - from.width / 2, current.from);
            current.to = common_default.getMax(to.x + msgModel.width / 2, to.x + from.width / 2, current.to);
            current.width = common_default.getMax(current.width, Math.abs(current.to - current.from)) - conf.labelBoxWidth;
          } else {
            current.from = common_default.getMin(msgModel.startx, current.from);
            current.to = common_default.getMax(msgModel.stopx, current.to);
            current.width = common_default.getMax(current.width, msgModel.width) - conf.labelBoxWidth;
          }
        });
      }
    }
  }
  bounds.activations = [];
  log.debug("Loop type widths:", loops);
  return loops;
}, "calculateLoopBounds");
var sequenceRenderer_default = {
  bounds,
  drawActors,
  drawActorsPopup,
  setConf,
  draw
};
var diagram = {
  parser: sequenceDiagram_default,
  get db() {
    return new SequenceDB;
  },
  renderer: sequenceRenderer_default,
  styles: styles_default,
  init: /* @__PURE__ */ __name((cnf) => {
    if (!cnf.sequence) {
      cnf.sequence = {};
    }
    if (cnf.wrap) {
      cnf.sequence.wrap = cnf.wrap;
      setConfig2({ sequence: { wrap: cnf.wrap } });
    }
  }, "init")
};
export {
  diagram
};

//# debugId=43B4A1F2514EA5B664756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL3NlcXVlbmNlRGlhZ3JhbS0zVUVTWjVISy5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiaW1wb3J0IHtcbiAgSlNPTl9TQ0hFTUEsXG4gIGxvYWRcbn0gZnJvbSBcIi4vY2h1bmstWFBXNDU3NkkubWpzXCI7XG5pbXBvcnQge1xuICBkcmF3QmFja2dyb3VuZFJlY3QsXG4gIGRyYXdFbWJlZGRlZEltYWdlLFxuICBkcmF3SW1hZ2UsXG4gIGRyYXdSZWN0LFxuICBnZXROb3RlUmVjdCxcbiAgZ2V0VGV4dE9ialxufSBmcm9tIFwiLi9jaHVuay1ORDJHVUhBTS5tanNcIjtcbmltcG9ydCB7XG4gIEltcGVyYXRpdmVTdGF0ZVxufSBmcm9tIFwiLi9jaHVuay1RWkhLTjNWTi5tanNcIjtcbmltcG9ydCB7XG4gIFpFUk9fV0lEVEhfU1BBQ0UsXG4gIHBhcnNlRm9udFNpemUsXG4gIHV0aWxzX2RlZmF1bHRcbn0gZnJvbSBcIi4vY2h1bmstNVpRWUhYS1UubWpzXCI7XG5pbXBvcnQge1xuICBhc3NpZ25XaXRoRGVwdGhfZGVmYXVsdCxcbiAgY2FsY3VsYXRlTWF0aE1MRGltZW5zaW9ucyxcbiAgY2xlYXIsXG4gIGNvbW1vbl9kZWZhdWx0LFxuICBjb25maWd1cmVTdmdTaXplLFxuICBnZXRBY2NEZXNjcmlwdGlvbixcbiAgZ2V0QWNjVGl0bGUsXG4gIGdldENvbmZpZyxcbiAgZ2V0Q29uZmlnMixcbiAgZ2V0RGlhZ3JhbVRpdGxlLFxuICBnZXRVcmwsXG4gIGhhc0thdGV4LFxuICByZW5kZXJLYXRleFNhbml0aXplZCxcbiAgc2FuaXRpemVUZXh0LFxuICBzZXRBY2NEZXNjcmlwdGlvbixcbiAgc2V0QWNjVGl0bGUsXG4gIHNldENvbmZpZzIgYXMgc2V0Q29uZmlnLFxuICBzZXREaWFncmFtVGl0bGVcbn0gZnJvbSBcIi4vY2h1bmstQ1NDSUhLN1EubWpzXCI7XG5pbXBvcnQge1xuICBfX25hbWUsXG4gIGxvZ1xufSBmcm9tIFwiLi9jaHVuay1BR0hSQjRKRi5tanNcIjtcblxuLy8gc3JjL2RpYWdyYW1zL3NlcXVlbmNlL3BhcnNlci9zZXF1ZW5jZURpYWdyYW0uamlzb25cbnZhciBwYXJzZXIgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBvID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihrLCB2LCBvMiwgbCkge1xuICAgIGZvciAobzIgPSBvMiB8fCB7fSwgbCA9IGsubGVuZ3RoOyBsLS07IG8yW2tbbF1dID0gdikgO1xuICAgIHJldHVybiBvMjtcbiAgfSwgXCJvXCIpLCAkVjAgPSBbMSwgMl0sICRWMSA9IFsxLCAzXSwgJFYyID0gWzEsIDRdLCAkVjMgPSBbMiwgNF0sICRWNCA9IFsxLCA5XSwgJFY1ID0gWzEsIDExXSwgJFY2ID0gWzEsIDEyXSwgJFY3ID0gWzEsIDE0XSwgJFY4ID0gWzEsIDE1XSwgJFY5ID0gWzEsIDE3XSwgJFZhID0gWzEsIDE4XSwgJFZiID0gWzEsIDE5XSwgJFZjID0gWzEsIDI1XSwgJFZkID0gWzEsIDI2XSwgJFZlID0gWzEsIDI3XSwgJFZmID0gWzEsIDI4XSwgJFZnID0gWzEsIDI5XSwgJFZoID0gWzEsIDMwXSwgJFZpID0gWzEsIDMxXSwgJFZqID0gWzEsIDMyXSwgJFZrID0gWzEsIDMzXSwgJFZsID0gWzEsIDM0XSwgJFZtID0gWzEsIDM1XSwgJFZuID0gWzEsIDM2XSwgJFZvID0gWzEsIDM3XSwgJFZwID0gWzEsIDM4XSwgJFZxID0gWzEsIDM5XSwgJFZyID0gWzEsIDQwXSwgJFZzID0gWzEsIDQyXSwgJFZ0ID0gWzEsIDQzXSwgJFZ1ID0gWzEsIDQ0XSwgJFZ2ID0gWzEsIDQ1XSwgJFZ3ID0gWzEsIDQ2XSwgJFZ4ID0gWzEsIDQ3XSwgJFZ5ID0gWzEsIDQsIDUsIDEwLCAxNCwgMTUsIDE3LCAxOSwgMjIsIDI0LCAzMCwgMzEsIDMyLCAzNCwgMzYsIDM3LCAzOCwgMzksIDQwLCA0MiwgNDQsIDQ1LCA0NywgNDgsIDQ5LCA1MCwgNTEsIDUzLCA1NCwgNTYsIDYxLCA2MiwgNjMsIDY0LCA3M10sICRWeiA9IFsxLCA3NF0sICRWQSA9IFsxLCA4MF0sICRWQiA9IFsxLCA4MV0sICRWQyA9IFsxLCA4Ml0sICRWRCA9IFsxLCA4M10sICRWRSA9IFsxLCA4NF0sICRWRiA9IFsxLCA4NV0sICRWRyA9IFsxLCA4Nl0sICRWSCA9IFsxLCA4N10sICRWSSA9IFsxLCA4OF0sICRWSiA9IFsxLCA4OV0sICRWSyA9IFsxLCA5MF0sICRWTCA9IFsxLCA5MV0sICRWTSA9IFsxLCA5Ml0sICRWTiA9IFsxLCA5M10sICRWTyA9IFsxLCA5NF0sICRWUCA9IFsxLCA5NV0sICRWUSA9IFsxLCA5Nl0sICRWUiA9IFsxLCA5N10sICRWUyA9IFsxLCA5OF0sICRWVCA9IFsxLCA5OV0sICRWVSA9IFsxLCAxMDBdLCAkVlYgPSBbMSwgMTAxXSwgJFZXID0gWzEsIDEwMl0sICRWWCA9IFsxLCAxMDNdLCAkVlkgPSBbMSwgMTA0XSwgJFZaID0gWzEsIDEwNV0sICRWXyA9IFsyLCA3OF0sICRWJCA9IFs0LCA1LCAxNywgNTEsIDUzLCA1NF0sICRWMDEgPSBbNCwgNSwgMTAsIDE0LCAxNSwgMTcsIDE5LCAyMiwgMjQsIDMwLCAzMSwgMzIsIDM0LCAzNiwgMzcsIDM4LCAzOSwgNDAsIDQyLCA0NCwgNDUsIDQ3LCA1MSwgNTMsIDU0LCA1NiwgNjEsIDYyLCA2MywgNjQsIDczXSwgJFYxMSA9IFs0LCA1LCAxMCwgMTQsIDE1LCAxNywgMTksIDIyLCAyNCwgMzAsIDMxLCAzMiwgMzQsIDM2LCAzNywgMzgsIDM5LCA0MCwgNDIsIDQ0LCA0NSwgNDcsIDUwLCA1MSwgNTMsIDU0LCA1NiwgNjEsIDYyLCA2MywgNjQsIDczXSwgJFYyMSA9IFs0LCA1LCAxMCwgMTQsIDE1LCAxNywgMTksIDIyLCAyNCwgMzAsIDMxLCAzMiwgMzQsIDM2LCAzNywgMzgsIDM5LCA0MCwgNDIsIDQ0LCA0NSwgNDcsIDQ5LCA1MSwgNTMsIDU0LCA1NiwgNjEsIDYyLCA2MywgNjQsIDczXSwgJFYzMSA9IFs0LCA1LCAxMCwgMTQsIDE1LCAxNywgMTksIDIyLCAyNCwgMzAsIDMxLCAzMiwgMzQsIDM2LCAzNywgMzgsIDM5LCA0MCwgNDIsIDQ0LCA0NSwgNDcsIDQ4LCA1MSwgNTMsIDU0LCA1NiwgNjEsIDYyLCA2MywgNjQsIDczXSwgJFY0MSA9IFs1LCA1Ml0sICRWNTEgPSBbNzAsIDcxLCA3MiwgNzNdLCAkVjYxID0gWzEsIDE1MV07XG4gIHZhciBwYXJzZXIyID0ge1xuICAgIHRyYWNlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHRyYWNlKCkge1xuICAgIH0sIFwidHJhY2VcIiksXG4gICAgeXk6IHt9LFxuICAgIHN5bWJvbHNfOiB7IFwiZXJyb3JcIjogMiwgXCJzdGFydFwiOiAzLCBcIlNQQUNFXCI6IDQsIFwiTkVXTElORVwiOiA1LCBcIlNEXCI6IDYsIFwiZG9jdW1lbnRcIjogNywgXCJsaW5lXCI6IDgsIFwic3RhdGVtZW50XCI6IDksIFwiSU5WQUxJRFwiOiAxMCwgXCJib3hfc2VjdGlvblwiOiAxMSwgXCJib3hfbGluZVwiOiAxMiwgXCJwYXJ0aWNpcGFudF9zdGF0ZW1lbnRcIjogMTMsIFwiY3JlYXRlXCI6IDE0LCBcImJveFwiOiAxNSwgXCJyZXN0T2ZMaW5lXCI6IDE2LCBcImVuZFwiOiAxNywgXCJzaWduYWxcIjogMTgsIFwiYXV0b251bWJlclwiOiAxOSwgXCJOVU1cIjogMjAsIFwib2ZmXCI6IDIxLCBcImFjdGl2YXRlXCI6IDIyLCBcImFjdG9yXCI6IDIzLCBcImRlYWN0aXZhdGVcIjogMjQsIFwibm90ZV9zdGF0ZW1lbnRcIjogMjUsIFwibGlua3Nfc3RhdGVtZW50XCI6IDI2LCBcImxpbmtfc3RhdGVtZW50XCI6IDI3LCBcInByb3BlcnRpZXNfc3RhdGVtZW50XCI6IDI4LCBcImRldGFpbHNfc3RhdGVtZW50XCI6IDI5LCBcInRpdGxlXCI6IDMwLCBcImxlZ2FjeV90aXRsZVwiOiAzMSwgXCJhY2NfdGl0bGVcIjogMzIsIFwiYWNjX3RpdGxlX3ZhbHVlXCI6IDMzLCBcImFjY19kZXNjclwiOiAzNCwgXCJhY2NfZGVzY3JfdmFsdWVcIjogMzUsIFwiYWNjX2Rlc2NyX211bHRpbGluZV92YWx1ZVwiOiAzNiwgXCJsb29wXCI6IDM3LCBcInJlY3RcIjogMzgsIFwib3B0XCI6IDM5LCBcImFsdFwiOiA0MCwgXCJlbHNlX3NlY3Rpb25zXCI6IDQxLCBcInBhclwiOiA0MiwgXCJwYXJfc2VjdGlvbnNcIjogNDMsIFwicGFyX292ZXJcIjogNDQsIFwiY3JpdGljYWxcIjogNDUsIFwib3B0aW9uX3NlY3Rpb25zXCI6IDQ2LCBcImJyZWFrXCI6IDQ3LCBcIm9wdGlvblwiOiA0OCwgXCJhbmRcIjogNDksIFwiZWxzZVwiOiA1MCwgXCJwYXJ0aWNpcGFudFwiOiA1MSwgXCJBU1wiOiA1MiwgXCJwYXJ0aWNpcGFudF9hY3RvclwiOiA1MywgXCJkZXN0cm95XCI6IDU0LCBcImFjdG9yX3dpdGhfY29uZmlnXCI6IDU1LCBcIm5vdGVcIjogNTYsIFwicGxhY2VtZW50XCI6IDU3LCBcInRleHQyXCI6IDU4LCBcIm92ZXJcIjogNTksIFwiYWN0b3JfcGFpclwiOiA2MCwgXCJsaW5rc1wiOiA2MSwgXCJsaW5rXCI6IDYyLCBcInByb3BlcnRpZXNcIjogNjMsIFwiZGV0YWlsc1wiOiA2NCwgXCJzcGFjZUxpc3RcIjogNjUsIFwiLFwiOiA2NiwgXCJsZWZ0X29mXCI6IDY3LCBcInJpZ2h0X29mXCI6IDY4LCBcInNpZ25hbHR5cGVcIjogNjksIFwiK1wiOiA3MCwgXCItXCI6IDcxLCBcIigpXCI6IDcyLCBcIkFDVE9SXCI6IDczLCBcImNvbmZpZ19vYmplY3RcIjogNzQsIFwiQ09ORklHX1NUQVJUXCI6IDc1LCBcIkNPTkZJR19DT05URU5UXCI6IDc2LCBcIkNPTkZJR19FTkRcIjogNzcsIFwiU09MSURfT1BFTl9BUlJPV1wiOiA3OCwgXCJET1RURURfT1BFTl9BUlJPV1wiOiA3OSwgXCJTT0xJRF9BUlJPV1wiOiA4MCwgXCJTT0xJRF9BUlJPV19UT1BcIjogODEsIFwiU09MSURfQVJST1dfQk9UVE9NXCI6IDgyLCBcIlNUSUNLX0FSUk9XX1RPUFwiOiA4MywgXCJTVElDS19BUlJPV19CT1RUT01cIjogODQsIFwiU09MSURfQVJST1dfVE9QX0RPVFRFRFwiOiA4NSwgXCJTT0xJRF9BUlJPV19CT1RUT01fRE9UVEVEXCI6IDg2LCBcIlNUSUNLX0FSUk9XX1RPUF9ET1RURURcIjogODcsIFwiU1RJQ0tfQVJST1dfQk9UVE9NX0RPVFRFRFwiOiA4OCwgXCJTT0xJRF9BUlJPV19UT1BfUkVWRVJTRVwiOiA4OSwgXCJTT0xJRF9BUlJPV19CT1RUT01fUkVWRVJTRVwiOiA5MCwgXCJTVElDS19BUlJPV19UT1BfUkVWRVJTRVwiOiA5MSwgXCJTVElDS19BUlJPV19CT1RUT01fUkVWRVJTRVwiOiA5MiwgXCJTT0xJRF9BUlJPV19UT1BfUkVWRVJTRV9ET1RURURcIjogOTMsIFwiU09MSURfQVJST1dfQk9UVE9NX1JFVkVSU0VfRE9UVEVEXCI6IDk0LCBcIlNUSUNLX0FSUk9XX1RPUF9SRVZFUlNFX0RPVFRFRFwiOiA5NSwgXCJTVElDS19BUlJPV19CT1RUT01fUkVWRVJTRV9ET1RURURcIjogOTYsIFwiQklESVJFQ1RJT05BTF9TT0xJRF9BUlJPV1wiOiA5NywgXCJET1RURURfQVJST1dcIjogOTgsIFwiQklESVJFQ1RJT05BTF9ET1RURURfQVJST1dcIjogOTksIFwiU09MSURfQ1JPU1NcIjogMTAwLCBcIkRPVFRFRF9DUk9TU1wiOiAxMDEsIFwiU09MSURfUE9JTlRcIjogMTAyLCBcIkRPVFRFRF9QT0lOVFwiOiAxMDMsIFwiVFhUXCI6IDEwNCwgXCIkYWNjZXB0XCI6IDAsIFwiJGVuZFwiOiAxIH0sXG4gICAgdGVybWluYWxzXzogeyAyOiBcImVycm9yXCIsIDQ6IFwiU1BBQ0VcIiwgNTogXCJORVdMSU5FXCIsIDY6IFwiU0RcIiwgMTA6IFwiSU5WQUxJRFwiLCAxNDogXCJjcmVhdGVcIiwgMTU6IFwiYm94XCIsIDE2OiBcInJlc3RPZkxpbmVcIiwgMTc6IFwiZW5kXCIsIDE5OiBcImF1dG9udW1iZXJcIiwgMjA6IFwiTlVNXCIsIDIxOiBcIm9mZlwiLCAyMjogXCJhY3RpdmF0ZVwiLCAyNDogXCJkZWFjdGl2YXRlXCIsIDMwOiBcInRpdGxlXCIsIDMxOiBcImxlZ2FjeV90aXRsZVwiLCAzMjogXCJhY2NfdGl0bGVcIiwgMzM6IFwiYWNjX3RpdGxlX3ZhbHVlXCIsIDM0OiBcImFjY19kZXNjclwiLCAzNTogXCJhY2NfZGVzY3JfdmFsdWVcIiwgMzY6IFwiYWNjX2Rlc2NyX211bHRpbGluZV92YWx1ZVwiLCAzNzogXCJsb29wXCIsIDM4OiBcInJlY3RcIiwgMzk6IFwib3B0XCIsIDQwOiBcImFsdFwiLCA0MjogXCJwYXJcIiwgNDQ6IFwicGFyX292ZXJcIiwgNDU6IFwiY3JpdGljYWxcIiwgNDc6IFwiYnJlYWtcIiwgNDg6IFwib3B0aW9uXCIsIDQ5OiBcImFuZFwiLCA1MDogXCJlbHNlXCIsIDUxOiBcInBhcnRpY2lwYW50XCIsIDUyOiBcIkFTXCIsIDUzOiBcInBhcnRpY2lwYW50X2FjdG9yXCIsIDU0OiBcImRlc3Ryb3lcIiwgNTY6IFwibm90ZVwiLCA1OTogXCJvdmVyXCIsIDYxOiBcImxpbmtzXCIsIDYyOiBcImxpbmtcIiwgNjM6IFwicHJvcGVydGllc1wiLCA2NDogXCJkZXRhaWxzXCIsIDY2OiBcIixcIiwgNjc6IFwibGVmdF9vZlwiLCA2ODogXCJyaWdodF9vZlwiLCA3MDogXCIrXCIsIDcxOiBcIi1cIiwgNzI6IFwiKClcIiwgNzM6IFwiQUNUT1JcIiwgNzU6IFwiQ09ORklHX1NUQVJUXCIsIDc2OiBcIkNPTkZJR19DT05URU5UXCIsIDc3OiBcIkNPTkZJR19FTkRcIiwgNzg6IFwiU09MSURfT1BFTl9BUlJPV1wiLCA3OTogXCJET1RURURfT1BFTl9BUlJPV1wiLCA4MDogXCJTT0xJRF9BUlJPV1wiLCA4MTogXCJTT0xJRF9BUlJPV19UT1BcIiwgODI6IFwiU09MSURfQVJST1dfQk9UVE9NXCIsIDgzOiBcIlNUSUNLX0FSUk9XX1RPUFwiLCA4NDogXCJTVElDS19BUlJPV19CT1RUT01cIiwgODU6IFwiU09MSURfQVJST1dfVE9QX0RPVFRFRFwiLCA4NjogXCJTT0xJRF9BUlJPV19CT1RUT01fRE9UVEVEXCIsIDg3OiBcIlNUSUNLX0FSUk9XX1RPUF9ET1RURURcIiwgODg6IFwiU1RJQ0tfQVJST1dfQk9UVE9NX0RPVFRFRFwiLCA4OTogXCJTT0xJRF9BUlJPV19UT1BfUkVWRVJTRVwiLCA5MDogXCJTT0xJRF9BUlJPV19CT1RUT01fUkVWRVJTRVwiLCA5MTogXCJTVElDS19BUlJPV19UT1BfUkVWRVJTRVwiLCA5MjogXCJTVElDS19BUlJPV19CT1RUT01fUkVWRVJTRVwiLCA5MzogXCJTT0xJRF9BUlJPV19UT1BfUkVWRVJTRV9ET1RURURcIiwgOTQ6IFwiU09MSURfQVJST1dfQk9UVE9NX1JFVkVSU0VfRE9UVEVEXCIsIDk1OiBcIlNUSUNLX0FSUk9XX1RPUF9SRVZFUlNFX0RPVFRFRFwiLCA5NjogXCJTVElDS19BUlJPV19CT1RUT01fUkVWRVJTRV9ET1RURURcIiwgOTc6IFwiQklESVJFQ1RJT05BTF9TT0xJRF9BUlJPV1wiLCA5ODogXCJET1RURURfQVJST1dcIiwgOTk6IFwiQklESVJFQ1RJT05BTF9ET1RURURfQVJST1dcIiwgMTAwOiBcIlNPTElEX0NST1NTXCIsIDEwMTogXCJET1RURURfQ1JPU1NcIiwgMTAyOiBcIlNPTElEX1BPSU5UXCIsIDEwMzogXCJET1RURURfUE9JTlRcIiwgMTA0OiBcIlRYVFwiIH0sXG4gICAgcHJvZHVjdGlvbnNfOiBbMCwgWzMsIDJdLCBbMywgMl0sIFszLCAyXSwgWzcsIDBdLCBbNywgMl0sIFs4LCAyXSwgWzgsIDFdLCBbOCwgMV0sIFs4LCAxXSwgWzExLCAwXSwgWzExLCAyXSwgWzEyLCAyXSwgWzEyLCAxXSwgWzEyLCAxXSwgWzksIDFdLCBbOSwgMl0sIFs5LCA0XSwgWzksIDJdLCBbOSwgNF0sIFs5LCAzXSwgWzksIDNdLCBbOSwgMl0sIFs5LCAzXSwgWzksIDNdLCBbOSwgMl0sIFs5LCAyXSwgWzksIDJdLCBbOSwgMl0sIFs5LCAyXSwgWzksIDFdLCBbOSwgMV0sIFs5LCAyXSwgWzksIDJdLCBbOSwgMV0sIFs5LCA0XSwgWzksIDRdLCBbOSwgNF0sIFs5LCA0XSwgWzksIDRdLCBbOSwgNF0sIFs5LCA0XSwgWzksIDRdLCBbNDYsIDFdLCBbNDYsIDRdLCBbNDMsIDFdLCBbNDMsIDRdLCBbNDEsIDFdLCBbNDEsIDRdLCBbMTMsIDVdLCBbMTMsIDNdLCBbMTMsIDVdLCBbMTMsIDNdLCBbMTMsIDNdLCBbMTMsIDVdLCBbMTMsIDNdLCBbMTMsIDVdLCBbMTMsIDNdLCBbMjUsIDRdLCBbMjUsIDRdLCBbMjYsIDNdLCBbMjcsIDNdLCBbMjgsIDNdLCBbMjksIDNdLCBbNjUsIDJdLCBbNjUsIDFdLCBbNjAsIDNdLCBbNjAsIDFdLCBbNTcsIDFdLCBbNTcsIDFdLCBbMTgsIDVdLCBbMTgsIDVdLCBbMTgsIDVdLCBbMTgsIDVdLCBbMTgsIDZdLCBbMTgsIDRdLCBbNTUsIDJdLCBbNzQsIDNdLCBbMjMsIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNjksIDFdLCBbNTgsIDFdXSxcbiAgICBwZXJmb3JtQWN0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGFub255bW91cyh5eXRleHQsIHl5bGVuZywgeXlsaW5lbm8sIHl5LCB5eXN0YXRlLCAkJCwgXyQpIHtcbiAgICAgIHZhciAkMCA9ICQkLmxlbmd0aCAtIDE7XG4gICAgICBzd2l0Y2ggKHl5c3RhdGUpIHtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIHl5LmFwcGx5KCQkWyQwXSk7XG4gICAgICAgICAgcmV0dXJuICQkWyQwXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgIHRoaXMuJCA9IFtdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU6XG4gICAgICAgIGNhc2UgMTE6XG4gICAgICAgICAgJCRbJDAgLSAxXS5wdXNoKCQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAxXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICBjYXNlIDc6XG4gICAgICAgIGNhc2UgMTI6XG4gICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDg6XG4gICAgICAgIGNhc2UgOTpcbiAgICAgICAgY2FzZSAxNDpcbiAgICAgICAgICB0aGlzLiQgPSBbXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAkJFskMF0udHlwZSA9IFwiY3JlYXRlUGFydGljaXBhbnRcIjtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgJCRbJDAgLSAxXS51bnNoaWZ0KHsgdHlwZTogXCJib3hTdGFydFwiLCBib3hEYXRhOiB5eS5wYXJzZUJveERhdGEoJCRbJDAgLSAyXSkgfSk7XG4gICAgICAgICAgJCRbJDAgLSAxXS5wdXNoKHsgdHlwZTogXCJib3hFbmRcIiwgYm94VGV4dDogJCRbJDAgLSAyXSB9KTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDFdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE5OlxuICAgICAgICAgIHRoaXMuJCA9IHsgdHlwZTogXCJzZXF1ZW5jZUluZGV4XCIsIHNlcXVlbmNlSW5kZXg6IE51bWJlcigkJFskMCAtIDJdKSwgc2VxdWVuY2VJbmRleFN0ZXA6IE51bWJlcigkJFskMCAtIDFdKSwgc2VxdWVuY2VWaXNpYmxlOiB0cnVlLCBzaWduYWxUeXBlOiB5eS5MSU5FVFlQRS5BVVRPTlVNQkVSIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgdGhpcy4kID0geyB0eXBlOiBcInNlcXVlbmNlSW5kZXhcIiwgc2VxdWVuY2VJbmRleDogTnVtYmVyKCQkWyQwIC0gMV0pLCBzZXF1ZW5jZUluZGV4U3RlcDogMSwgc2VxdWVuY2VWaXNpYmxlOiB0cnVlLCBzaWduYWxUeXBlOiB5eS5MSU5FVFlQRS5BVVRPTlVNQkVSIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjE6XG4gICAgICAgICAgdGhpcy4kID0geyB0eXBlOiBcInNlcXVlbmNlSW5kZXhcIiwgc2VxdWVuY2VWaXNpYmxlOiBmYWxzZSwgc2lnbmFsVHlwZTogeXkuTElORVRZUEUuQVVUT05VTUJFUiB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDIyOlxuICAgICAgICAgIHRoaXMuJCA9IHsgdHlwZTogXCJzZXF1ZW5jZUluZGV4XCIsIHNlcXVlbmNlVmlzaWJsZTogdHJ1ZSwgc2lnbmFsVHlwZTogeXkuTElORVRZUEUuQVVUT05VTUJFUiB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDIzOlxuICAgICAgICAgIHRoaXMuJCA9IHsgdHlwZTogXCJhY3RpdmVTdGFydFwiLCBzaWduYWxUeXBlOiB5eS5MSU5FVFlQRS5BQ1RJVkVfU1RBUlQsIGFjdG9yOiAkJFskMCAtIDFdLmFjdG9yIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjQ6XG4gICAgICAgICAgdGhpcy4kID0geyB0eXBlOiBcImFjdGl2ZUVuZFwiLCBzaWduYWxUeXBlOiB5eS5MSU5FVFlQRS5BQ1RJVkVfRU5ELCBhY3RvcjogJCRbJDAgLSAxXS5hY3RvciB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMwOlxuICAgICAgICAgIHl5LnNldERpYWdyYW1UaXRsZSgkJFskMF0uc3Vic3RyaW5nKDYpKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF0uc3Vic3RyaW5nKDYpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMxOlxuICAgICAgICAgIHl5LnNldERpYWdyYW1UaXRsZSgkJFskMF0uc3Vic3RyaW5nKDcpKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF0uc3Vic3RyaW5nKDcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMyOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS50cmltKCk7XG4gICAgICAgICAgeXkuc2V0QWNjVGl0bGUodGhpcy4kKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzMzpcbiAgICAgICAgY2FzZSAzNDpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF0udHJpbSgpO1xuICAgICAgICAgIHl5LnNldEFjY0Rlc2NyaXB0aW9uKHRoaXMuJCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzU6XG4gICAgICAgICAgJCRbJDAgLSAxXS51bnNoaWZ0KHsgdHlwZTogXCJsb29wU3RhcnRcIiwgbG9vcFRleHQ6IHl5LnBhcnNlTWVzc2FnZSgkJFskMCAtIDJdKSwgc2lnbmFsVHlwZTogeXkuTElORVRZUEUuTE9PUF9TVEFSVCB9KTtcbiAgICAgICAgICAkJFskMCAtIDFdLnB1c2goeyB0eXBlOiBcImxvb3BFbmRcIiwgbG9vcFRleHQ6ICQkWyQwIC0gMl0sIHNpZ25hbFR5cGU6IHl5LkxJTkVUWVBFLkxPT1BfRU5EIH0pO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzY6XG4gICAgICAgICAgJCRbJDAgLSAxXS51bnNoaWZ0KHsgdHlwZTogXCJyZWN0U3RhcnRcIiwgY29sb3I6IHl5LnBhcnNlTWVzc2FnZSgkJFskMCAtIDJdKSwgc2lnbmFsVHlwZTogeXkuTElORVRZUEUuUkVDVF9TVEFSVCB9KTtcbiAgICAgICAgICAkJFskMCAtIDFdLnB1c2goeyB0eXBlOiBcInJlY3RFbmRcIiwgY29sb3I6IHl5LnBhcnNlTWVzc2FnZSgkJFskMCAtIDJdKSwgc2lnbmFsVHlwZTogeXkuTElORVRZUEUuUkVDVF9FTkQgfSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAxXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgICAkJFskMCAtIDFdLnVuc2hpZnQoeyB0eXBlOiBcIm9wdFN0YXJ0XCIsIG9wdFRleHQ6IHl5LnBhcnNlTWVzc2FnZSgkJFskMCAtIDJdKSwgc2lnbmFsVHlwZTogeXkuTElORVRZUEUuT1BUX1NUQVJUIH0pO1xuICAgICAgICAgICQkWyQwIC0gMV0ucHVzaCh7IHR5cGU6IFwib3B0RW5kXCIsIG9wdFRleHQ6IHl5LnBhcnNlTWVzc2FnZSgkJFskMCAtIDJdKSwgc2lnbmFsVHlwZTogeXkuTElORVRZUEUuT1BUX0VORCB9KTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDFdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM4OlxuICAgICAgICAgICQkWyQwIC0gMV0udW5zaGlmdCh7IHR5cGU6IFwiYWx0U3RhcnRcIiwgYWx0VGV4dDogeXkucGFyc2VNZXNzYWdlKCQkWyQwIC0gMl0pLCBzaWduYWxUeXBlOiB5eS5MSU5FVFlQRS5BTFRfU1RBUlQgfSk7XG4gICAgICAgICAgJCRbJDAgLSAxXS5wdXNoKHsgdHlwZTogXCJhbHRFbmRcIiwgc2lnbmFsVHlwZTogeXkuTElORVRZUEUuQUxUX0VORCB9KTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDFdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM5OlxuICAgICAgICAgICQkWyQwIC0gMV0udW5zaGlmdCh7IHR5cGU6IFwicGFyU3RhcnRcIiwgcGFyVGV4dDogeXkucGFyc2VNZXNzYWdlKCQkWyQwIC0gMl0pLCBzaWduYWxUeXBlOiB5eS5MSU5FVFlQRS5QQVJfU1RBUlQgfSk7XG4gICAgICAgICAgJCRbJDAgLSAxXS5wdXNoKHsgdHlwZTogXCJwYXJFbmRcIiwgc2lnbmFsVHlwZTogeXkuTElORVRZUEUuUEFSX0VORCB9KTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDFdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQwOlxuICAgICAgICAgICQkWyQwIC0gMV0udW5zaGlmdCh7IHR5cGU6IFwicGFyU3RhcnRcIiwgcGFyVGV4dDogeXkucGFyc2VNZXNzYWdlKCQkWyQwIC0gMl0pLCBzaWduYWxUeXBlOiB5eS5MSU5FVFlQRS5QQVJfT1ZFUl9TVEFSVCB9KTtcbiAgICAgICAgICAkJFskMCAtIDFdLnB1c2goeyB0eXBlOiBcInBhckVuZFwiLCBzaWduYWxUeXBlOiB5eS5MSU5FVFlQRS5QQVJfRU5EIH0pO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDE6XG4gICAgICAgICAgJCRbJDAgLSAxXS51bnNoaWZ0KHsgdHlwZTogXCJjcml0aWNhbFN0YXJ0XCIsIGNyaXRpY2FsVGV4dDogeXkucGFyc2VNZXNzYWdlKCQkWyQwIC0gMl0pLCBzaWduYWxUeXBlOiB5eS5MSU5FVFlQRS5DUklUSUNBTF9TVEFSVCB9KTtcbiAgICAgICAgICAkJFskMCAtIDFdLnB1c2goeyB0eXBlOiBcImNyaXRpY2FsRW5kXCIsIHNpZ25hbFR5cGU6IHl5LkxJTkVUWVBFLkNSSVRJQ0FMX0VORCB9KTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDFdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQyOlxuICAgICAgICAgICQkWyQwIC0gMV0udW5zaGlmdCh7IHR5cGU6IFwiYnJlYWtTdGFydFwiLCBicmVha1RleHQ6IHl5LnBhcnNlTWVzc2FnZSgkJFskMCAtIDJdKSwgc2lnbmFsVHlwZTogeXkuTElORVRZUEUuQlJFQUtfU1RBUlQgfSk7XG4gICAgICAgICAgJCRbJDAgLSAxXS5wdXNoKHsgdHlwZTogXCJicmVha0VuZFwiLCBvcHRUZXh0OiB5eS5wYXJzZU1lc3NhZ2UoJCRbJDAgLSAyXSksIHNpZ25hbFR5cGU6IHl5LkxJTkVUWVBFLkJSRUFLX0VORCB9KTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDFdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ0OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gM10uY29uY2F0KFt7IHR5cGU6IFwib3B0aW9uXCIsIG9wdGlvblRleHQ6IHl5LnBhcnNlTWVzc2FnZSgkJFskMCAtIDFdKSwgc2lnbmFsVHlwZTogeXkuTElORVRZUEUuQ1JJVElDQUxfT1BUSU9OIH0sICQkWyQwXV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ2OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gM10uY29uY2F0KFt7IHR5cGU6IFwiYW5kXCIsIHBhclRleHQ6IHl5LnBhcnNlTWVzc2FnZSgkJFskMCAtIDFdKSwgc2lnbmFsVHlwZTogeXkuTElORVRZUEUuUEFSX0FORCB9LCAkJFskMF1dKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0ODpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDNdLmNvbmNhdChbeyB0eXBlOiBcImVsc2VcIiwgYWx0VGV4dDogeXkucGFyc2VNZXNzYWdlKCQkWyQwIC0gMV0pLCBzaWduYWxUeXBlOiB5eS5MSU5FVFlQRS5BTFRfRUxTRSB9LCAkJFskMF1dKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OTpcbiAgICAgICAgICAkJFskMCAtIDNdLmRyYXcgPSBcInBhcnRpY2lwYW50XCI7XG4gICAgICAgICAgJCRbJDAgLSAzXS50eXBlID0gXCJhZGRQYXJ0aWNpcGFudFwiO1xuICAgICAgICAgICQkWyQwIC0gM10uZGVzY3JpcHRpb24gPSB5eS5wYXJzZU1lc3NhZ2UoJCRbJDAgLSAxXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAzXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1MDpcbiAgICAgICAgICAkJFskMCAtIDFdLmRyYXcgPSBcInBhcnRpY2lwYW50XCI7XG4gICAgICAgICAgJCRbJDAgLSAxXS50eXBlID0gXCJhZGRQYXJ0aWNpcGFudFwiO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTE6XG4gICAgICAgICAgJCRbJDAgLSAzXS5kcmF3ID0gXCJhY3RvclwiO1xuICAgICAgICAgICQkWyQwIC0gM10udHlwZSA9IFwiYWRkUGFydGljaXBhbnRcIjtcbiAgICAgICAgICAkJFskMCAtIDNdLmRlc2NyaXB0aW9uID0geXkucGFyc2VNZXNzYWdlKCQkWyQwIC0gMV0pO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gM107XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTI6XG4gICAgICAgIGNhc2UgNTc6XG4gICAgICAgICAgJCRbJDAgLSAxXS5kcmF3ID0gXCJhY3RvclwiO1xuICAgICAgICAgICQkWyQwIC0gMV0udHlwZSA9IFwiYWRkUGFydGljaXBhbnRcIjtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDFdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDUzOlxuICAgICAgICAgICQkWyQwIC0gMV0udHlwZSA9IFwiZGVzdHJveVBhcnRpY2lwYW50XCI7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAxXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1NDpcbiAgICAgICAgICAkJFskMCAtIDNdLmRyYXcgPSBcInBhcnRpY2lwYW50XCI7XG4gICAgICAgICAgJCRbJDAgLSAzXS50eXBlID0gXCJhZGRQYXJ0aWNpcGFudFwiO1xuICAgICAgICAgICQkWyQwIC0gM10uZGVzY3JpcHRpb24gPSB5eS5wYXJzZU1lc3NhZ2UoJCRbJDAgLSAxXSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDAgLSAzXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1NTpcbiAgICAgICAgICAkJFskMCAtIDFdLmRyYXcgPSBcInBhcnRpY2lwYW50XCI7XG4gICAgICAgICAgJCRbJDAgLSAxXS50eXBlID0gXCJhZGRQYXJ0aWNpcGFudFwiO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTY6XG4gICAgICAgICAgJCRbJDAgLSAzXS5kcmF3ID0gXCJhY3RvclwiO1xuICAgICAgICAgICQkWyQwIC0gM10udHlwZSA9IFwiYWRkUGFydGljaXBhbnRcIjtcbiAgICAgICAgICAkJFskMCAtIDNdLmRlc2NyaXB0aW9uID0geXkucGFyc2VNZXNzYWdlKCQkWyQwIC0gMV0pO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gM107XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTg6XG4gICAgICAgICAgdGhpcy4kID0gWyQkWyQwIC0gMV0sIHsgdHlwZTogXCJhZGROb3RlXCIsIHBsYWNlbWVudDogJCRbJDAgLSAyXSwgYWN0b3I6ICQkWyQwIC0gMV0uYWN0b3IsIHRleHQ6ICQkWyQwXSB9XTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1OTpcbiAgICAgICAgICAkJFskMCAtIDJdID0gW10uY29uY2F0KCQkWyQwIC0gMV0sICQkWyQwIC0gMV0pLnNsaWNlKDAsIDIpO1xuICAgICAgICAgICQkWyQwIC0gMl1bMF0gPSAkJFskMCAtIDJdWzBdLmFjdG9yO1xuICAgICAgICAgICQkWyQwIC0gMl1bMV0gPSAkJFskMCAtIDJdWzFdLmFjdG9yO1xuICAgICAgICAgIHRoaXMuJCA9IFskJFskMCAtIDFdLCB7IHR5cGU6IFwiYWRkTm90ZVwiLCBwbGFjZW1lbnQ6IHl5LlBMQUNFTUVOVC5PVkVSLCBhY3RvcjogJCRbJDAgLSAyXS5zbGljZSgwLCAyKSwgdGV4dDogJCRbJDBdIH1dO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDYwOlxuICAgICAgICAgIHRoaXMuJCA9IFskJFskMCAtIDFdLCB7IHR5cGU6IFwiYWRkTGlua3NcIiwgYWN0b3I6ICQkWyQwIC0gMV0uYWN0b3IsIHRleHQ6ICQkWyQwXSB9XTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2MTpcbiAgICAgICAgICB0aGlzLiQgPSBbJCRbJDAgLSAxXSwgeyB0eXBlOiBcImFkZEFMaW5rXCIsIGFjdG9yOiAkJFskMCAtIDFdLmFjdG9yLCB0ZXh0OiAkJFskMF0gfV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjI6XG4gICAgICAgICAgdGhpcy4kID0gWyQkWyQwIC0gMV0sIHsgdHlwZTogXCJhZGRQcm9wZXJ0aWVzXCIsIGFjdG9yOiAkJFskMCAtIDFdLmFjdG9yLCB0ZXh0OiAkJFskMF0gfV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjM6XG4gICAgICAgICAgdGhpcy4kID0gWyQkWyQwIC0gMV0sIHsgdHlwZTogXCJhZGREZXRhaWxzXCIsIGFjdG9yOiAkJFskMCAtIDFdLmFjdG9yLCB0ZXh0OiAkJFskMF0gfV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjY6XG4gICAgICAgICAgdGhpcy4kID0gWyQkWyQwIC0gMl0sICQkWyQwXV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjc6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY4OlxuICAgICAgICAgIHRoaXMuJCA9IHl5LlBMQUNFTUVOVC5MRUZUT0Y7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjk6XG4gICAgICAgICAgdGhpcy4kID0geXkuUExBQ0VNRU5ULlJJR0hUT0Y7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzA6XG4gICAgICAgICAgdGhpcy4kID0gW1xuICAgICAgICAgICAgJCRbJDAgLSA0XSxcbiAgICAgICAgICAgICQkWyQwIC0gMV0sXG4gICAgICAgICAgICB7IHR5cGU6IFwiYWRkTWVzc2FnZVwiLCBmcm9tOiAkJFskMCAtIDRdLmFjdG9yLCB0bzogJCRbJDAgLSAxXS5hY3Rvciwgc2lnbmFsVHlwZTogJCRbJDAgLSAzXSwgbXNnOiAkJFskMF0sIGFjdGl2YXRlOiB0cnVlIH0sXG4gICAgICAgICAgICB7IHR5cGU6IFwiYWN0aXZlU3RhcnRcIiwgc2lnbmFsVHlwZTogeXkuTElORVRZUEUuQUNUSVZFX1NUQVJULCBhY3RvcjogJCRbJDAgLSAxXS5hY3RvciB9XG4gICAgICAgICAgXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA3MTpcbiAgICAgICAgICB0aGlzLiQgPSBbXG4gICAgICAgICAgICAkJFskMCAtIDRdLFxuICAgICAgICAgICAgJCRbJDAgLSAxXSxcbiAgICAgICAgICAgIHsgdHlwZTogXCJhZGRNZXNzYWdlXCIsIGZyb206ICQkWyQwIC0gNF0uYWN0b3IsIHRvOiAkJFskMCAtIDFdLmFjdG9yLCBzaWduYWxUeXBlOiAkJFskMCAtIDNdLCBtc2c6ICQkWyQwXSB9LFxuICAgICAgICAgICAgeyB0eXBlOiBcImFjdGl2ZUVuZFwiLCBzaWduYWxUeXBlOiB5eS5MSU5FVFlQRS5BQ1RJVkVfRU5ELCBhY3RvcjogJCRbJDAgLSA0XS5hY3RvciB9XG4gICAgICAgICAgXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA3MjpcbiAgICAgICAgICB0aGlzLiQgPSBbXG4gICAgICAgICAgICAkJFskMCAtIDRdLFxuICAgICAgICAgICAgJCRbJDAgLSAxXSxcbiAgICAgICAgICAgIHsgdHlwZTogXCJhZGRNZXNzYWdlXCIsIGZyb206ICQkWyQwIC0gNF0uYWN0b3IsIHRvOiAkJFskMCAtIDFdLmFjdG9yLCBzaWduYWxUeXBlOiAkJFskMCAtIDNdLCBtc2c6ICQkWyQwXSwgYWN0aXZhdGU6IHRydWUsIGNlbnRyYWxDb25uZWN0aW9uOiB5eS5MSU5FVFlQRS5DRU5UUkFMX0NPTk5FQ1RJT04gfSxcbiAgICAgICAgICAgIHsgdHlwZTogXCJjZW50cmFsQ29ubmVjdGlvblwiLCBzaWduYWxUeXBlOiB5eS5MSU5FVFlQRS5DRU5UUkFMX0NPTk5FQ1RJT04sIGFjdG9yOiAkJFskMCAtIDFdLmFjdG9yIH1cbiAgICAgICAgICBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDczOlxuICAgICAgICAgIHRoaXMuJCA9IFtcbiAgICAgICAgICAgICQkWyQwIC0gNF0sXG4gICAgICAgICAgICAkJFskMCAtIDFdLFxuICAgICAgICAgICAgeyB0eXBlOiBcImFkZE1lc3NhZ2VcIiwgZnJvbTogJCRbJDAgLSA0XS5hY3RvciwgdG86ICQkWyQwIC0gMV0uYWN0b3IsIHNpZ25hbFR5cGU6ICQkWyQwIC0gMl0sIG1zZzogJCRbJDBdLCBhY3RpdmF0ZTogZmFsc2UsIGNlbnRyYWxDb25uZWN0aW9uOiB5eS5MSU5FVFlQRS5DRU5UUkFMX0NPTk5FQ1RJT05fUkVWRVJTRSB9LFxuICAgICAgICAgICAgeyB0eXBlOiBcImNlbnRyYWxDb25uZWN0aW9uUmV2ZXJzZVwiLCBzaWduYWxUeXBlOiB5eS5MSU5FVFlQRS5DRU5UUkFMX0NPTk5FQ1RJT05fUkVWRVJTRSwgYWN0b3I6ICQkWyQwIC0gNF0uYWN0b3IgfVxuICAgICAgICAgIF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzQ6XG4gICAgICAgICAgdGhpcy4kID0gW1xuICAgICAgICAgICAgJCRbJDAgLSA1XSxcbiAgICAgICAgICAgICQkWyQwIC0gMV0sXG4gICAgICAgICAgICB7IHR5cGU6IFwiYWRkTWVzc2FnZVwiLCBmcm9tOiAkJFskMCAtIDVdLmFjdG9yLCB0bzogJCRbJDAgLSAxXS5hY3Rvciwgc2lnbmFsVHlwZTogJCRbJDAgLSAzXSwgbXNnOiAkJFskMF0sIGFjdGl2YXRlOiB0cnVlLCBjZW50cmFsQ29ubmVjdGlvbjogeXkuTElORVRZUEUuQ0VOVFJBTF9DT05ORUNUSU9OX0RVQUwgfSxcbiAgICAgICAgICAgIHsgdHlwZTogXCJjZW50cmFsQ29ubmVjdGlvblwiLCBzaWduYWxUeXBlOiB5eS5MSU5FVFlQRS5DRU5UUkFMX0NPTk5FQ1RJT04sIGFjdG9yOiAkJFskMCAtIDFdLmFjdG9yIH0sXG4gICAgICAgICAgICB7IHR5cGU6IFwiY2VudHJhbENvbm5lY3Rpb25SZXZlcnNlXCIsIHNpZ25hbFR5cGU6IHl5LkxJTkVUWVBFLkNFTlRSQUxfQ09OTkVDVElPTl9SRVZFUlNFLCBhY3RvcjogJCRbJDAgLSA1XS5hY3RvciB9XG4gICAgICAgICAgXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA3NTpcbiAgICAgICAgICB0aGlzLiQgPSBbJCRbJDAgLSAzXSwgJCRbJDAgLSAxXSwgeyB0eXBlOiBcImFkZE1lc3NhZ2VcIiwgZnJvbTogJCRbJDAgLSAzXS5hY3RvciwgdG86ICQkWyQwIC0gMV0uYWN0b3IsIHNpZ25hbFR5cGU6ICQkWyQwIC0gMl0sIG1zZzogJCRbJDBdIH1dO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc2OlxuICAgICAgICAgIHRoaXMuJCA9IHtcbiAgICAgICAgICAgIHR5cGU6IFwiYWRkUGFydGljaXBhbnRcIixcbiAgICAgICAgICAgIGFjdG9yOiAkJFskMCAtIDFdLFxuICAgICAgICAgICAgY29uZmlnOiAkJFskMF1cbiAgICAgICAgICB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc3OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMV0udHJpbSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc4OlxuICAgICAgICAgIHRoaXMuJCA9IHsgdHlwZTogXCJhZGRQYXJ0aWNpcGFudFwiLCBhY3RvcjogJCRbJDBdIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNzk6XG4gICAgICAgICAgdGhpcy4kID0geXkuTElORVRZUEUuU09MSURfT1BFTjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA4MDpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5MSU5FVFlQRS5ET1RURURfT1BFTjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA4MTpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5MSU5FVFlQRS5TT0xJRDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA4MjpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5MSU5FVFlQRS5TT0xJRF9UT1A7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgODM6XG4gICAgICAgICAgdGhpcy4kID0geXkuTElORVRZUEUuU09MSURfQk9UVE9NO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDg0OlxuICAgICAgICAgIHRoaXMuJCA9IHl5LkxJTkVUWVBFLlNUSUNLX1RPUDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA4NTpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5MSU5FVFlQRS5TVElDS19CT1RUT007XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgODY6XG4gICAgICAgICAgdGhpcy4kID0geXkuTElORVRZUEUuU09MSURfVE9QX0RPVFRFRDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA4NzpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5MSU5FVFlQRS5TT0xJRF9CT1RUT01fRE9UVEVEO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDg4OlxuICAgICAgICAgIHRoaXMuJCA9IHl5LkxJTkVUWVBFLlNUSUNLX1RPUF9ET1RURUQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgODk6XG4gICAgICAgICAgdGhpcy4kID0geXkuTElORVRZUEUuU1RJQ0tfQk9UVE9NX0RPVFRFRDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA5MDpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5MSU5FVFlQRS5TT0xJRF9BUlJPV19UT1BfUkVWRVJTRTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA5MTpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5MSU5FVFlQRS5TT0xJRF9BUlJPV19CT1RUT01fUkVWRVJTRTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA5MjpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5MSU5FVFlQRS5TVElDS19BUlJPV19UT1BfUkVWRVJTRTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA5MzpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5MSU5FVFlQRS5TVElDS19BUlJPV19CT1RUT01fUkVWRVJTRTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA5NDpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5MSU5FVFlQRS5TT0xJRF9BUlJPV19UT1BfUkVWRVJTRV9ET1RURUQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTU6XG4gICAgICAgICAgdGhpcy4kID0geXkuTElORVRZUEUuU09MSURfQVJST1dfQk9UVE9NX1JFVkVSU0VfRE9UVEVEO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDk2OlxuICAgICAgICAgIHRoaXMuJCA9IHl5LkxJTkVUWVBFLlNUSUNLX0FSUk9XX1RPUF9SRVZFUlNFX0RPVFRFRDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA5NzpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5MSU5FVFlQRS5TVElDS19BUlJPV19CT1RUT01fUkVWRVJTRV9ET1RURUQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTg6XG4gICAgICAgICAgdGhpcy4kID0geXkuTElORVRZUEUuQklESVJFQ1RJT05BTF9TT0xJRDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA5OTpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5MSU5FVFlQRS5ET1RURUQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTAwOlxuICAgICAgICAgIHRoaXMuJCA9IHl5LkxJTkVUWVBFLkJJRElSRUNUSU9OQUxfRE9UVEVEO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEwMTpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5MSU5FVFlQRS5TT0xJRF9DUk9TUztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMDI6XG4gICAgICAgICAgdGhpcy4kID0geXkuTElORVRZUEUuRE9UVEVEX0NST1NTO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEwMzpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5MSU5FVFlQRS5TT0xJRF9QT0lOVDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMDQ6XG4gICAgICAgICAgdGhpcy4kID0geXkuTElORVRZUEUuRE9UVEVEX1BPSU5UO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEwNTpcbiAgICAgICAgICB0aGlzLiQgPSB5eS5wYXJzZU1lc3NhZ2UoJCRbJDBdLnRyaW0oKS5zdWJzdHJpbmcoMSkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0sIFwiYW5vbnltb3VzXCIpLFxuICAgIHRhYmxlOiBbeyAzOiAxLCA0OiAkVjAsIDU6ICRWMSwgNjogJFYyIH0sIHsgMTogWzNdIH0sIHsgMzogNSwgNDogJFYwLCA1OiAkVjEsIDY6ICRWMiB9LCB7IDM6IDYsIDQ6ICRWMCwgNTogJFYxLCA2OiAkVjIgfSwgbyhbMSwgNCwgNSwgMTAsIDE0LCAxNSwgMTksIDIyLCAyNCwgMzAsIDMxLCAzMiwgMzQsIDM2LCAzNywgMzgsIDM5LCA0MCwgNDIsIDQ0LCA0NSwgNDcsIDUxLCA1MywgNTQsIDU2LCA2MSwgNjIsIDYzLCA2NCwgNzNdLCAkVjMsIHsgNzogNyB9KSwgeyAxOiBbMiwgMV0gfSwgeyAxOiBbMiwgMl0gfSwgeyAxOiBbMiwgM10sIDQ6ICRWNCwgNTogJFY1LCA4OiA4LCA5OiAxMCwgMTA6ICRWNiwgMTM6IDEzLCAxNDogJFY3LCAxNTogJFY4LCAxODogMTYsIDE5OiAkVjksIDIyOiAkVmEsIDIzOiA0MSwgMjQ6ICRWYiwgMjU6IDIwLCAyNjogMjEsIDI3OiAyMiwgMjg6IDIzLCAyOTogMjQsIDMwOiAkVmMsIDMxOiAkVmQsIDMyOiAkVmUsIDM0OiAkVmYsIDM2OiAkVmcsIDM3OiAkVmgsIDM4OiAkVmksIDM5OiAkVmosIDQwOiAkVmssIDQyOiAkVmwsIDQ0OiAkVm0sIDQ1OiAkVm4sIDQ3OiAkVm8sIDUxOiAkVnAsIDUzOiAkVnEsIDU0OiAkVnIsIDU2OiAkVnMsIDYxOiAkVnQsIDYyOiAkVnUsIDYzOiAkVnYsIDY0OiAkVncsIDczOiAkVnggfSwgbygkVnksIFsyLCA1XSksIHsgOTogNDgsIDEzOiAxMywgMTQ6ICRWNywgMTU6ICRWOCwgMTg6IDE2LCAxOTogJFY5LCAyMjogJFZhLCAyMzogNDEsIDI0OiAkVmIsIDI1OiAyMCwgMjY6IDIxLCAyNzogMjIsIDI4OiAyMywgMjk6IDI0LCAzMDogJFZjLCAzMTogJFZkLCAzMjogJFZlLCAzNDogJFZmLCAzNjogJFZnLCAzNzogJFZoLCAzODogJFZpLCAzOTogJFZqLCA0MDogJFZrLCA0MjogJFZsLCA0NDogJFZtLCA0NTogJFZuLCA0NzogJFZvLCA1MTogJFZwLCA1MzogJFZxLCA1NDogJFZyLCA1NjogJFZzLCA2MTogJFZ0LCA2MjogJFZ1LCA2MzogJFZ2LCA2NDogJFZ3LCA3MzogJFZ4IH0sIG8oJFZ5LCBbMiwgN10pLCBvKCRWeSwgWzIsIDhdKSwgbygkVnksIFsyLCA5XSksIG8oJFZ5LCBbMiwgMTVdKSwgeyAxMzogNDksIDUxOiAkVnAsIDUzOiAkVnEsIDU0OiAkVnIgfSwgeyAxNjogWzEsIDUwXSB9LCB7IDU6IFsxLCA1MV0gfSwgeyA1OiBbMSwgNTRdLCAyMDogWzEsIDUyXSwgMjE6IFsxLCA1M10gfSwgeyAyMzogNTUsIDczOiAkVnggfSwgeyAyMzogNTYsIDczOiAkVnggfSwgeyA1OiBbMSwgNTddIH0sIHsgNTogWzEsIDU4XSB9LCB7IDU6IFsxLCA1OV0gfSwgeyA1OiBbMSwgNjBdIH0sIHsgNTogWzEsIDYxXSB9LCBvKCRWeSwgWzIsIDMwXSksIG8oJFZ5LCBbMiwgMzFdKSwgeyAzMzogWzEsIDYyXSB9LCB7IDM1OiBbMSwgNjNdIH0sIG8oJFZ5LCBbMiwgMzRdKSwgeyAxNjogWzEsIDY0XSB9LCB7IDE2OiBbMSwgNjVdIH0sIHsgMTY6IFsxLCA2Nl0gfSwgeyAxNjogWzEsIDY3XSB9LCB7IDE2OiBbMSwgNjhdIH0sIHsgMTY6IFsxLCA2OV0gfSwgeyAxNjogWzEsIDcwXSB9LCB7IDE2OiBbMSwgNzFdIH0sIHsgMjM6IDcyLCA1NTogNzMsIDczOiAkVnogfSwgeyAyMzogNzUsIDU1OiA3NiwgNzM6ICRWeiB9LCB7IDIzOiA3NywgNzM6ICRWeCB9LCB7IDY5OiA3OCwgNzI6IFsxLCA3OV0sIDc4OiAkVkEsIDc5OiAkVkIsIDgwOiAkVkMsIDgxOiAkVkQsIDgyOiAkVkUsIDgzOiAkVkYsIDg0OiAkVkcsIDg1OiAkVkgsIDg2OiAkVkksIDg3OiAkVkosIDg4OiAkVkssIDg5OiAkVkwsIDkwOiAkVk0sIDkxOiAkVk4sIDkyOiAkVk8sIDkzOiAkVlAsIDk0OiAkVlEsIDk1OiAkVlIsIDk2OiAkVlMsIDk3OiAkVlQsIDk4OiAkVlUsIDk5OiAkVlYsIDEwMDogJFZXLCAxMDE6ICRWWCwgMTAyOiAkVlksIDEwMzogJFZaIH0sIHsgNTc6IDEwNiwgNTk6IFsxLCAxMDddLCA2NzogWzEsIDEwOF0sIDY4OiBbMSwgMTA5XSB9LCB7IDIzOiAxMTAsIDczOiAkVnggfSwgeyAyMzogMTExLCA3MzogJFZ4IH0sIHsgMjM6IDExMiwgNzM6ICRWeCB9LCB7IDIzOiAxMTMsIDczOiAkVnggfSwgbyhbNSwgNjYsIDcyLCA3OCwgNzksIDgwLCA4MSwgODIsIDgzLCA4NCwgODUsIDg2LCA4NywgODgsIDg5LCA5MCwgOTEsIDkyLCA5MywgOTQsIDk1LCA5NiwgOTcsIDk4LCA5OSwgMTAwLCAxMDEsIDEwMiwgMTAzLCAxMDRdLCAkVl8pLCBvKCRWeSwgWzIsIDZdKSwgbygkVnksIFsyLCAxNl0pLCBvKCRWJCwgWzIsIDEwXSwgeyAxMTogMTE0IH0pLCBvKCRWeSwgWzIsIDE4XSksIHsgNTogWzEsIDExNl0sIDIwOiBbMSwgMTE1XSB9LCB7IDU6IFsxLCAxMTddIH0sIG8oJFZ5LCBbMiwgMjJdKSwgeyA1OiBbMSwgMTE4XSB9LCB7IDU6IFsxLCAxMTldIH0sIG8oJFZ5LCBbMiwgMjVdKSwgbygkVnksIFsyLCAyNl0pLCBvKCRWeSwgWzIsIDI3XSksIG8oJFZ5LCBbMiwgMjhdKSwgbygkVnksIFsyLCAyOV0pLCBvKCRWeSwgWzIsIDMyXSksIG8oJFZ5LCBbMiwgMzNdKSwgbygkVjAxLCAkVjMsIHsgNzogMTIwIH0pLCBvKCRWMDEsICRWMywgeyA3OiAxMjEgfSksIG8oJFYwMSwgJFYzLCB7IDc6IDEyMiB9KSwgbygkVjExLCAkVjMsIHsgNDE6IDEyMywgNzogMTI0IH0pLCBvKCRWMjEsICRWMywgeyA0MzogMTI1LCA3OiAxMjYgfSksIG8oJFYyMSwgJFYzLCB7IDc6IDEyNiwgNDM6IDEyNyB9KSwgbygkVjMxLCAkVjMsIHsgNDY6IDEyOCwgNzogMTI5IH0pLCBvKCRWMDEsICRWMywgeyA3OiAxMzAgfSksIHsgNTogWzEsIDEzMl0sIDUyOiBbMSwgMTMxXSB9LCB7IDU6IFsxLCAxMzRdLCA1MjogWzEsIDEzM10gfSwgbygkVjQxLCAkVl8sIHsgNzQ6IDEzNSwgNzU6IFsxLCAxMzZdIH0pLCB7IDU6IFsxLCAxMzhdLCA1MjogWzEsIDEzN10gfSwgeyA1OiBbMSwgMTQwXSwgNTI6IFsxLCAxMzldIH0sIHsgNTogWzEsIDE0MV0gfSwgeyAyMzogMTQ1LCA3MDogWzEsIDE0Ml0sIDcxOiBbMSwgMTQzXSwgNzI6IFsxLCAxNDRdLCA3MzogJFZ4IH0sIHsgNjk6IDE0NiwgNzg6ICRWQSwgNzk6ICRWQiwgODA6ICRWQywgODE6ICRWRCwgODI6ICRWRSwgODM6ICRWRiwgODQ6ICRWRywgODU6ICRWSCwgODY6ICRWSSwgODc6ICRWSiwgODg6ICRWSywgODk6ICRWTCwgOTA6ICRWTSwgOTE6ICRWTiwgOTI6ICRWTywgOTM6ICRWUCwgOTQ6ICRWUSwgOTU6ICRWUiwgOTY6ICRWUywgOTc6ICRWVCwgOTg6ICRWVSwgOTk6ICRWViwgMTAwOiAkVlcsIDEwMTogJFZYLCAxMDI6ICRWWSwgMTAzOiAkVlogfSwgbygkVjUxLCBbMiwgNzldKSwgbygkVjUxLCBbMiwgODBdKSwgbygkVjUxLCBbMiwgODFdKSwgbygkVjUxLCBbMiwgODJdKSwgbygkVjUxLCBbMiwgODNdKSwgbygkVjUxLCBbMiwgODRdKSwgbygkVjUxLCBbMiwgODVdKSwgbygkVjUxLCBbMiwgODZdKSwgbygkVjUxLCBbMiwgODddKSwgbygkVjUxLCBbMiwgODhdKSwgbygkVjUxLCBbMiwgODldKSwgbygkVjUxLCBbMiwgOTBdKSwgbygkVjUxLCBbMiwgOTFdKSwgbygkVjUxLCBbMiwgOTJdKSwgbygkVjUxLCBbMiwgOTNdKSwgbygkVjUxLCBbMiwgOTRdKSwgbygkVjUxLCBbMiwgOTVdKSwgbygkVjUxLCBbMiwgOTZdKSwgbygkVjUxLCBbMiwgOTddKSwgbygkVjUxLCBbMiwgOThdKSwgbygkVjUxLCBbMiwgOTldKSwgbygkVjUxLCBbMiwgMTAwXSksIG8oJFY1MSwgWzIsIDEwMV0pLCBvKCRWNTEsIFsyLCAxMDJdKSwgbygkVjUxLCBbMiwgMTAzXSksIG8oJFY1MSwgWzIsIDEwNF0pLCB7IDIzOiAxNDcsIDczOiAkVnggfSwgeyAyMzogMTQ5LCA2MDogMTQ4LCA3MzogJFZ4IH0sIHsgNzM6IFsyLCA2OF0gfSwgeyA3MzogWzIsIDY5XSB9LCB7IDU4OiAxNTAsIDEwNDogJFY2MSB9LCB7IDU4OiAxNTIsIDEwNDogJFY2MSB9LCB7IDU4OiAxNTMsIDEwNDogJFY2MSB9LCB7IDU4OiAxNTQsIDEwNDogJFY2MSB9LCB7IDQ6IFsxLCAxNTddLCA1OiBbMSwgMTU5XSwgMTI6IDE1NiwgMTM6IDE1OCwgMTc6IFsxLCAxNTVdLCA1MTogJFZwLCA1MzogJFZxLCA1NDogJFZyIH0sIHsgNTogWzEsIDE2MF0gfSwgbygkVnksIFsyLCAyMF0pLCBvKCRWeSwgWzIsIDIxXSksIG8oJFZ5LCBbMiwgMjNdKSwgbygkVnksIFsyLCAyNF0pLCB7IDQ6ICRWNCwgNTogJFY1LCA4OiA4LCA5OiAxMCwgMTA6ICRWNiwgMTM6IDEzLCAxNDogJFY3LCAxNTogJFY4LCAxNzogWzEsIDE2MV0sIDE4OiAxNiwgMTk6ICRWOSwgMjI6ICRWYSwgMjM6IDQxLCAyNDogJFZiLCAyNTogMjAsIDI2OiAyMSwgMjc6IDIyLCAyODogMjMsIDI5OiAyNCwgMzA6ICRWYywgMzE6ICRWZCwgMzI6ICRWZSwgMzQ6ICRWZiwgMzY6ICRWZywgMzc6ICRWaCwgMzg6ICRWaSwgMzk6ICRWaiwgNDA6ICRWaywgNDI6ICRWbCwgNDQ6ICRWbSwgNDU6ICRWbiwgNDc6ICRWbywgNTE6ICRWcCwgNTM6ICRWcSwgNTQ6ICRWciwgNTY6ICRWcywgNjE6ICRWdCwgNjI6ICRWdSwgNjM6ICRWdiwgNjQ6ICRWdywgNzM6ICRWeCB9LCB7IDQ6ICRWNCwgNTogJFY1LCA4OiA4LCA5OiAxMCwgMTA6ICRWNiwgMTM6IDEzLCAxNDogJFY3LCAxNTogJFY4LCAxNzogWzEsIDE2Ml0sIDE4OiAxNiwgMTk6ICRWOSwgMjI6ICRWYSwgMjM6IDQxLCAyNDogJFZiLCAyNTogMjAsIDI2OiAyMSwgMjc6IDIyLCAyODogMjMsIDI5OiAyNCwgMzA6ICRWYywgMzE6ICRWZCwgMzI6ICRWZSwgMzQ6ICRWZiwgMzY6ICRWZywgMzc6ICRWaCwgMzg6ICRWaSwgMzk6ICRWaiwgNDA6ICRWaywgNDI6ICRWbCwgNDQ6ICRWbSwgNDU6ICRWbiwgNDc6ICRWbywgNTE6ICRWcCwgNTM6ICRWcSwgNTQ6ICRWciwgNTY6ICRWcywgNjE6ICRWdCwgNjI6ICRWdSwgNjM6ICRWdiwgNjQ6ICRWdywgNzM6ICRWeCB9LCB7IDQ6ICRWNCwgNTogJFY1LCA4OiA4LCA5OiAxMCwgMTA6ICRWNiwgMTM6IDEzLCAxNDogJFY3LCAxNTogJFY4LCAxNzogWzEsIDE2M10sIDE4OiAxNiwgMTk6ICRWOSwgMjI6ICRWYSwgMjM6IDQxLCAyNDogJFZiLCAyNTogMjAsIDI2OiAyMSwgMjc6IDIyLCAyODogMjMsIDI5OiAyNCwgMzA6ICRWYywgMzE6ICRWZCwgMzI6ICRWZSwgMzQ6ICRWZiwgMzY6ICRWZywgMzc6ICRWaCwgMzg6ICRWaSwgMzk6ICRWaiwgNDA6ICRWaywgNDI6ICRWbCwgNDQ6ICRWbSwgNDU6ICRWbiwgNDc6ICRWbywgNTE6ICRWcCwgNTM6ICRWcSwgNTQ6ICRWciwgNTY6ICRWcywgNjE6ICRWdCwgNjI6ICRWdSwgNjM6ICRWdiwgNjQ6ICRWdywgNzM6ICRWeCB9LCB7IDE3OiBbMSwgMTY0XSB9LCB7IDQ6ICRWNCwgNTogJFY1LCA4OiA4LCA5OiAxMCwgMTA6ICRWNiwgMTM6IDEzLCAxNDogJFY3LCAxNTogJFY4LCAxNzogWzIsIDQ3XSwgMTg6IDE2LCAxOTogJFY5LCAyMjogJFZhLCAyMzogNDEsIDI0OiAkVmIsIDI1OiAyMCwgMjY6IDIxLCAyNzogMjIsIDI4OiAyMywgMjk6IDI0LCAzMDogJFZjLCAzMTogJFZkLCAzMjogJFZlLCAzNDogJFZmLCAzNjogJFZnLCAzNzogJFZoLCAzODogJFZpLCAzOTogJFZqLCA0MDogJFZrLCA0MjogJFZsLCA0NDogJFZtLCA0NTogJFZuLCA0NzogJFZvLCA1MDogWzEsIDE2NV0sIDUxOiAkVnAsIDUzOiAkVnEsIDU0OiAkVnIsIDU2OiAkVnMsIDYxOiAkVnQsIDYyOiAkVnUsIDYzOiAkVnYsIDY0OiAkVncsIDczOiAkVnggfSwgeyAxNzogWzEsIDE2Nl0gfSwgeyA0OiAkVjQsIDU6ICRWNSwgODogOCwgOTogMTAsIDEwOiAkVjYsIDEzOiAxMywgMTQ6ICRWNywgMTU6ICRWOCwgMTc6IFsyLCA0NV0sIDE4OiAxNiwgMTk6ICRWOSwgMjI6ICRWYSwgMjM6IDQxLCAyNDogJFZiLCAyNTogMjAsIDI2OiAyMSwgMjc6IDIyLCAyODogMjMsIDI5OiAyNCwgMzA6ICRWYywgMzE6ICRWZCwgMzI6ICRWZSwgMzQ6ICRWZiwgMzY6ICRWZywgMzc6ICRWaCwgMzg6ICRWaSwgMzk6ICRWaiwgNDA6ICRWaywgNDI6ICRWbCwgNDQ6ICRWbSwgNDU6ICRWbiwgNDc6ICRWbywgNDk6IFsxLCAxNjddLCA1MTogJFZwLCA1MzogJFZxLCA1NDogJFZyLCA1NjogJFZzLCA2MTogJFZ0LCA2MjogJFZ1LCA2MzogJFZ2LCA2NDogJFZ3LCA3MzogJFZ4IH0sIHsgMTc6IFsxLCAxNjhdIH0sIHsgMTc6IFsxLCAxNjldIH0sIHsgNDogJFY0LCA1OiAkVjUsIDg6IDgsIDk6IDEwLCAxMDogJFY2LCAxMzogMTMsIDE0OiAkVjcsIDE1OiAkVjgsIDE3OiBbMiwgNDNdLCAxODogMTYsIDE5OiAkVjksIDIyOiAkVmEsIDIzOiA0MSwgMjQ6ICRWYiwgMjU6IDIwLCAyNjogMjEsIDI3OiAyMiwgMjg6IDIzLCAyOTogMjQsIDMwOiAkVmMsIDMxOiAkVmQsIDMyOiAkVmUsIDM0OiAkVmYsIDM2OiAkVmcsIDM3OiAkVmgsIDM4OiAkVmksIDM5OiAkVmosIDQwOiAkVmssIDQyOiAkVmwsIDQ0OiAkVm0sIDQ1OiAkVm4sIDQ3OiAkVm8sIDQ4OiBbMSwgMTcwXSwgNTE6ICRWcCwgNTM6ICRWcSwgNTQ6ICRWciwgNTY6ICRWcywgNjE6ICRWdCwgNjI6ICRWdSwgNjM6ICRWdiwgNjQ6ICRWdywgNzM6ICRWeCB9LCB7IDQ6ICRWNCwgNTogJFY1LCA4OiA4LCA5OiAxMCwgMTA6ICRWNiwgMTM6IDEzLCAxNDogJFY3LCAxNTogJFY4LCAxNzogWzEsIDE3MV0sIDE4OiAxNiwgMTk6ICRWOSwgMjI6ICRWYSwgMjM6IDQxLCAyNDogJFZiLCAyNTogMjAsIDI2OiAyMSwgMjc6IDIyLCAyODogMjMsIDI5OiAyNCwgMzA6ICRWYywgMzE6ICRWZCwgMzI6ICRWZSwgMzQ6ICRWZiwgMzY6ICRWZywgMzc6ICRWaCwgMzg6ICRWaSwgMzk6ICRWaiwgNDA6ICRWaywgNDI6ICRWbCwgNDQ6ICRWbSwgNDU6ICRWbiwgNDc6ICRWbywgNTE6ICRWcCwgNTM6ICRWcSwgNTQ6ICRWciwgNTY6ICRWcywgNjE6ICRWdCwgNjI6ICRWdSwgNjM6ICRWdiwgNjQ6ICRWdywgNzM6ICRWeCB9LCB7IDE2OiBbMSwgMTcyXSB9LCBvKCRWeSwgWzIsIDUwXSksIHsgMTY6IFsxLCAxNzNdIH0sIG8oJFZ5LCBbMiwgNTVdKSwgbygkVjQxLCBbMiwgNzZdKSwgeyA3NjogWzEsIDE3NF0gfSwgeyAxNjogWzEsIDE3NV0gfSwgbygkVnksIFsyLCA1Ml0pLCB7IDE2OiBbMSwgMTc2XSB9LCBvKCRWeSwgWzIsIDU3XSksIG8oJFZ5LCBbMiwgNTNdKSwgeyAyMzogMTc3LCA3MzogJFZ4IH0sIHsgMjM6IDE3OCwgNzM6ICRWeCB9LCB7IDIzOiAxNzksIDczOiAkVnggfSwgeyA1ODogMTgwLCAxMDQ6ICRWNjEgfSwgeyAyMzogMTgxLCA3MjogWzEsIDE4Ml0sIDczOiAkVnggfSwgeyA1ODogMTgzLCAxMDQ6ICRWNjEgfSwgeyA1ODogMTg0LCAxMDQ6ICRWNjEgfSwgeyA2NjogWzEsIDE4NV0sIDEwNDogWzIsIDY3XSB9LCB7IDU6IFsyLCA2MF0gfSwgeyA1OiBbMiwgMTA1XSB9LCB7IDU6IFsyLCA2MV0gfSwgeyA1OiBbMiwgNjJdIH0sIHsgNTogWzIsIDYzXSB9LCBvKCRWeSwgWzIsIDE3XSksIG8oJFYkLCBbMiwgMTFdKSwgeyAxMzogMTg2LCA1MTogJFZwLCA1MzogJFZxLCA1NDogJFZyIH0sIG8oJFYkLCBbMiwgMTNdKSwgbygkViQsIFsyLCAxNF0pLCBvKCRWeSwgWzIsIDE5XSksIG8oJFZ5LCBbMiwgMzVdKSwgbygkVnksIFsyLCAzNl0pLCBvKCRWeSwgWzIsIDM3XSksIG8oJFZ5LCBbMiwgMzhdKSwgeyAxNjogWzEsIDE4N10gfSwgbygkVnksIFsyLCAzOV0pLCB7IDE2OiBbMSwgMTg4XSB9LCBvKCRWeSwgWzIsIDQwXSksIG8oJFZ5LCBbMiwgNDFdKSwgeyAxNjogWzEsIDE4OV0gfSwgbygkVnksIFsyLCA0Ml0pLCB7IDU6IFsxLCAxOTBdIH0sIHsgNTogWzEsIDE5MV0gfSwgeyA3NzogWzEsIDE5Ml0gfSwgeyA1OiBbMSwgMTkzXSB9LCB7IDU6IFsxLCAxOTRdIH0sIHsgNTg6IDE5NSwgMTA0OiAkVjYxIH0sIHsgNTg6IDE5NiwgMTA0OiAkVjYxIH0sIHsgNTg6IDE5NywgMTA0OiAkVjYxIH0sIHsgNTogWzIsIDc1XSB9LCB7IDU4OiAxOTgsIDEwNDogJFY2MSB9LCB7IDIzOiAxOTksIDczOiAkVnggfSwgeyA1OiBbMiwgNThdIH0sIHsgNTogWzIsIDU5XSB9LCB7IDIzOiAyMDAsIDczOiAkVnggfSwgbygkViQsIFsyLCAxMl0pLCBvKCRWMTEsICRWMywgeyA3OiAxMjQsIDQxOiAyMDEgfSksIG8oJFYyMSwgJFYzLCB7IDc6IDEyNiwgNDM6IDIwMiB9KSwgbygkVjMxLCAkVjMsIHsgNzogMTI5LCA0NjogMjAzIH0pLCBvKCRWeSwgWzIsIDQ5XSksIG8oJFZ5LCBbMiwgNTRdKSwgbygkVjQxLCBbMiwgNzddKSwgbygkVnksIFsyLCA1MV0pLCBvKCRWeSwgWzIsIDU2XSksIHsgNTogWzIsIDcwXSB9LCB7IDU6IFsyLCA3MV0gfSwgeyA1OiBbMiwgNzJdIH0sIHsgNTogWzIsIDczXSB9LCB7IDU4OiAyMDQsIDEwNDogJFY2MSB9LCB7IDEwNDogWzIsIDY2XSB9LCB7IDE3OiBbMiwgNDhdIH0sIHsgMTc6IFsyLCA0Nl0gfSwgeyAxNzogWzIsIDQ0XSB9LCB7IDU6IFsyLCA3NF0gfV0sXG4gICAgZGVmYXVsdEFjdGlvbnM6IHsgNTogWzIsIDFdLCA2OiBbMiwgMl0sIDEwODogWzIsIDY4XSwgMTA5OiBbMiwgNjldLCAxNTA6IFsyLCA2MF0sIDE1MTogWzIsIDEwNV0sIDE1MjogWzIsIDYxXSwgMTUzOiBbMiwgNjJdLCAxNTQ6IFsyLCA2M10sIDE4MDogWzIsIDc1XSwgMTgzOiBbMiwgNThdLCAxODQ6IFsyLCA1OV0sIDE5NTogWzIsIDcwXSwgMTk2OiBbMiwgNzFdLCAxOTc6IFsyLCA3Ml0sIDE5ODogWzIsIDczXSwgMjAwOiBbMiwgNjZdLCAyMDE6IFsyLCA0OF0sIDIwMjogWzIsIDQ2XSwgMjAzOiBbMiwgNDRdLCAyMDQ6IFsyLCA3NF0gfSxcbiAgICBwYXJzZUVycm9yOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBhcnNlRXJyb3Ioc3RyLCBoYXNoKSB7XG4gICAgICBpZiAoaGFzaC5yZWNvdmVyYWJsZSkge1xuICAgICAgICB0aGlzLnRyYWNlKHN0cik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3Ioc3RyKTtcbiAgICAgICAgZXJyb3IuaGFzaCA9IGhhc2g7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sIFwicGFyc2VFcnJvclwiKSxcbiAgICBwYXJzZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwYXJzZShpbnB1dCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLCBzdGFjayA9IFswXSwgdHN0YWNrID0gW10sIHZzdGFjayA9IFtudWxsXSwgbHN0YWNrID0gW10sIHRhYmxlID0gdGhpcy50YWJsZSwgeXl0ZXh0ID0gXCJcIiwgeXlsaW5lbm8gPSAwLCB5eWxlbmcgPSAwLCByZWNvdmVyaW5nID0gMCwgVEVSUk9SID0gMiwgRU9GID0gMTtcbiAgICAgIHZhciBhcmdzID0gbHN0YWNrLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIHZhciBsZXhlcjIgPSBPYmplY3QuY3JlYXRlKHRoaXMubGV4ZXIpO1xuICAgICAgdmFyIHNoYXJlZFN0YXRlID0geyB5eToge30gfTtcbiAgICAgIGZvciAodmFyIGsgaW4gdGhpcy55eSkge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMueXksIGspKSB7XG4gICAgICAgICAgc2hhcmVkU3RhdGUueXlba10gPSB0aGlzLnl5W2tdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsZXhlcjIuc2V0SW5wdXQoaW5wdXQsIHNoYXJlZFN0YXRlLnl5KTtcbiAgICAgIHNoYXJlZFN0YXRlLnl5LmxleGVyID0gbGV4ZXIyO1xuICAgICAgc2hhcmVkU3RhdGUueXkucGFyc2VyID0gdGhpcztcbiAgICAgIGlmICh0eXBlb2YgbGV4ZXIyLnl5bGxvYyA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGxleGVyMi55eWxsb2MgPSB7fTtcbiAgICAgIH1cbiAgICAgIHZhciB5eWxvYyA9IGxleGVyMi55eWxsb2M7XG4gICAgICBsc3RhY2sucHVzaCh5eWxvYyk7XG4gICAgICB2YXIgcmFuZ2VzID0gbGV4ZXIyLm9wdGlvbnMgJiYgbGV4ZXIyLm9wdGlvbnMucmFuZ2VzO1xuICAgICAgaWYgKHR5cGVvZiBzaGFyZWRTdGF0ZS55eS5wYXJzZUVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhpcy5wYXJzZUVycm9yID0gc2hhcmVkU3RhdGUueXkucGFyc2VFcnJvcjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGFyc2VFcnJvciA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKS5wYXJzZUVycm9yO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gcG9wU3RhY2sobikge1xuICAgICAgICBzdGFjay5sZW5ndGggPSBzdGFjay5sZW5ndGggLSAyICogbjtcbiAgICAgICAgdnN0YWNrLmxlbmd0aCA9IHZzdGFjay5sZW5ndGggLSBuO1xuICAgICAgICBsc3RhY2subGVuZ3RoID0gbHN0YWNrLmxlbmd0aCAtIG47XG4gICAgICB9XG4gICAgICBfX25hbWUocG9wU3RhY2ssIFwicG9wU3RhY2tcIik7XG4gICAgICBmdW5jdGlvbiBsZXgoKSB7XG4gICAgICAgIHZhciB0b2tlbjtcbiAgICAgICAgdG9rZW4gPSB0c3RhY2sucG9wKCkgfHwgbGV4ZXIyLmxleCgpIHx8IEVPRjtcbiAgICAgICAgaWYgKHR5cGVvZiB0b2tlbiAhPT0gXCJudW1iZXJcIikge1xuICAgICAgICAgIGlmICh0b2tlbiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICB0c3RhY2sgPSB0b2tlbjtcbiAgICAgICAgICAgIHRva2VuID0gdHN0YWNrLnBvcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0b2tlbiA9IHNlbGYuc3ltYm9sc19bdG9rZW5dIHx8IHRva2VuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgIH1cbiAgICAgIF9fbmFtZShsZXgsIFwibGV4XCIpO1xuICAgICAgdmFyIHN5bWJvbCwgcHJlRXJyb3JTeW1ib2wsIHN0YXRlLCBhY3Rpb24sIGEsIHIsIHl5dmFsID0ge30sIHAsIGxlbiwgbmV3U3RhdGUsIGV4cGVjdGVkO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgc3RhdGUgPSBzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKHRoaXMuZGVmYXVsdEFjdGlvbnNbc3RhdGVdKSB7XG4gICAgICAgICAgYWN0aW9uID0gdGhpcy5kZWZhdWx0QWN0aW9uc1tzdGF0ZV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHN5bWJvbCA9PT0gbnVsbCB8fCB0eXBlb2Ygc3ltYm9sID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHN5bWJvbCA9IGxleCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhY3Rpb24gPSB0YWJsZVtzdGF0ZV0gJiYgdGFibGVbc3RhdGVdW3N5bWJvbF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBhY3Rpb24gPT09IFwidW5kZWZpbmVkXCIgfHwgIWFjdGlvbi5sZW5ndGggfHwgIWFjdGlvblswXSkge1xuICAgICAgICAgIHZhciBlcnJTdHIgPSBcIlwiO1xuICAgICAgICAgIGV4cGVjdGVkID0gW107XG4gICAgICAgICAgZm9yIChwIGluIHRhYmxlW3N0YXRlXSkge1xuICAgICAgICAgICAgaWYgKHRoaXMudGVybWluYWxzX1twXSAmJiBwID4gVEVSUk9SKSB7XG4gICAgICAgICAgICAgIGV4cGVjdGVkLnB1c2goXCInXCIgKyB0aGlzLnRlcm1pbmFsc19bcF0gKyBcIidcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChsZXhlcjIuc2hvd1Bvc2l0aW9uKSB7XG4gICAgICAgICAgICBlcnJTdHIgPSBcIlBhcnNlIGVycm9yIG9uIGxpbmUgXCIgKyAoeXlsaW5lbm8gKyAxKSArIFwiOlxcblwiICsgbGV4ZXIyLnNob3dQb3NpdGlvbigpICsgXCJcXG5FeHBlY3RpbmcgXCIgKyBleHBlY3RlZC5qb2luKFwiLCBcIikgKyBcIiwgZ290ICdcIiArICh0aGlzLnRlcm1pbmFsc19bc3ltYm9sXSB8fCBzeW1ib2wpICsgXCInXCI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVyclN0ciA9IFwiUGFyc2UgZXJyb3Igb24gbGluZSBcIiArICh5eWxpbmVubyArIDEpICsgXCI6IFVuZXhwZWN0ZWQgXCIgKyAoc3ltYm9sID09IEVPRiA/IFwiZW5kIG9mIGlucHV0XCIgOiBcIidcIiArICh0aGlzLnRlcm1pbmFsc19bc3ltYm9sXSB8fCBzeW1ib2wpICsgXCInXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnBhcnNlRXJyb3IoZXJyU3RyLCB7XG4gICAgICAgICAgICB0ZXh0OiBsZXhlcjIubWF0Y2gsXG4gICAgICAgICAgICB0b2tlbjogdGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sLFxuICAgICAgICAgICAgbGluZTogbGV4ZXIyLnl5bGluZW5vLFxuICAgICAgICAgICAgbG9jOiB5eWxvYyxcbiAgICAgICAgICAgIGV4cGVjdGVkXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFjdGlvblswXSBpbnN0YW5jZW9mIEFycmF5ICYmIGFjdGlvbi5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyc2UgRXJyb3I6IG11bHRpcGxlIGFjdGlvbnMgcG9zc2libGUgYXQgc3RhdGU6IFwiICsgc3RhdGUgKyBcIiwgdG9rZW46IFwiICsgc3ltYm9sKTtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKGFjdGlvblswXSkge1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHN0YWNrLnB1c2goc3ltYm9sKTtcbiAgICAgICAgICAgIHZzdGFjay5wdXNoKGxleGVyMi55eXRleHQpO1xuICAgICAgICAgICAgbHN0YWNrLnB1c2gobGV4ZXIyLnl5bGxvYyk7XG4gICAgICAgICAgICBzdGFjay5wdXNoKGFjdGlvblsxXSk7XG4gICAgICAgICAgICBzeW1ib2wgPSBudWxsO1xuICAgICAgICAgICAgaWYgKCFwcmVFcnJvclN5bWJvbCkge1xuICAgICAgICAgICAgICB5eWxlbmcgPSBsZXhlcjIueXlsZW5nO1xuICAgICAgICAgICAgICB5eXRleHQgPSBsZXhlcjIueXl0ZXh0O1xuICAgICAgICAgICAgICB5eWxpbmVubyA9IGxleGVyMi55eWxpbmVubztcbiAgICAgICAgICAgICAgeXlsb2MgPSBsZXhlcjIueXlsbG9jO1xuICAgICAgICAgICAgICBpZiAocmVjb3ZlcmluZyA+IDApIHtcbiAgICAgICAgICAgICAgICByZWNvdmVyaW5nLS07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHN5bWJvbCA9IHByZUVycm9yU3ltYm9sO1xuICAgICAgICAgICAgICBwcmVFcnJvclN5bWJvbCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBsZW4gPSB0aGlzLnByb2R1Y3Rpb25zX1thY3Rpb25bMV1dWzFdO1xuICAgICAgICAgICAgeXl2YWwuJCA9IHZzdGFja1t2c3RhY2subGVuZ3RoIC0gbGVuXTtcbiAgICAgICAgICAgIHl5dmFsLl8kID0ge1xuICAgICAgICAgICAgICBmaXJzdF9saW5lOiBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIChsZW4gfHwgMSldLmZpcnN0X2xpbmUsXG4gICAgICAgICAgICAgIGxhc3RfbGluZTogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAxXS5sYXN0X2xpbmUsXG4gICAgICAgICAgICAgIGZpcnN0X2NvbHVtbjogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgICAgIGxhc3RfY29sdW1uOiBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIDFdLmxhc3RfY29sdW1uXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHJhbmdlcykge1xuICAgICAgICAgICAgICB5eXZhbC5fJC5yYW5nZSA9IFtcbiAgICAgICAgICAgICAgICBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIChsZW4gfHwgMSldLnJhbmdlWzBdLFxuICAgICAgICAgICAgICAgIGxzdGFja1tsc3RhY2subGVuZ3RoIC0gMV0ucmFuZ2VbMV1cbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHIgPSB0aGlzLnBlcmZvcm1BY3Rpb24uYXBwbHkoeXl2YWwsIFtcbiAgICAgICAgICAgICAgeXl0ZXh0LFxuICAgICAgICAgICAgICB5eWxlbmcsXG4gICAgICAgICAgICAgIHl5bGluZW5vLFxuICAgICAgICAgICAgICBzaGFyZWRTdGF0ZS55eSxcbiAgICAgICAgICAgICAgYWN0aW9uWzFdLFxuICAgICAgICAgICAgICB2c3RhY2ssXG4gICAgICAgICAgICAgIGxzdGFja1xuICAgICAgICAgICAgXS5jb25jYXQoYXJncykpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgIHJldHVybiByO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxlbikge1xuICAgICAgICAgICAgICBzdGFjayA9IHN0YWNrLnNsaWNlKDAsIC0xICogbGVuICogMik7XG4gICAgICAgICAgICAgIHZzdGFjayA9IHZzdGFjay5zbGljZSgwLCAtMSAqIGxlbik7XG4gICAgICAgICAgICAgIGxzdGFjayA9IGxzdGFjay5zbGljZSgwLCAtMSAqIGxlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdGFjay5wdXNoKHRoaXMucHJvZHVjdGlvbnNfW2FjdGlvblsxXV1bMF0pO1xuICAgICAgICAgICAgdnN0YWNrLnB1c2goeXl2YWwuJCk7XG4gICAgICAgICAgICBsc3RhY2sucHVzaCh5eXZhbC5fJCk7XG4gICAgICAgICAgICBuZXdTdGF0ZSA9IHRhYmxlW3N0YWNrW3N0YWNrLmxlbmd0aCAtIDJdXVtzdGFja1tzdGFjay5sZW5ndGggLSAxXV07XG4gICAgICAgICAgICBzdGFjay5wdXNoKG5ld1N0YXRlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LCBcInBhcnNlXCIpXG4gIH07XG4gIHZhciBsZXhlciA9IC8qIEBfX1BVUkVfXyAqLyAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxleGVyMiA9IHtcbiAgICAgIEVPRjogMSxcbiAgICAgIHBhcnNlRXJyb3I6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcGFyc2VFcnJvcihzdHIsIGhhc2gpIHtcbiAgICAgICAgaWYgKHRoaXMueXkucGFyc2VyKSB7XG4gICAgICAgICAgdGhpcy55eS5wYXJzZXIucGFyc2VFcnJvcihzdHIsIGhhc2gpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihzdHIpO1xuICAgICAgICB9XG4gICAgICB9LCBcInBhcnNlRXJyb3JcIiksXG4gICAgICAvLyByZXNldHMgdGhlIGxleGVyLCBzZXRzIG5ldyBpbnB1dFxuICAgICAgc2V0SW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oaW5wdXQsIHl5KSB7XG4gICAgICAgIHRoaXMueXkgPSB5eSB8fCB0aGlzLnl5IHx8IHt9O1xuICAgICAgICB0aGlzLl9pbnB1dCA9IGlucHV0O1xuICAgICAgICB0aGlzLl9tb3JlID0gdGhpcy5fYmFja3RyYWNrID0gdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICAgIHRoaXMueXlsaW5lbm8gPSB0aGlzLnl5bGVuZyA9IDA7XG4gICAgICAgIHRoaXMueXl0ZXh0ID0gdGhpcy5tYXRjaGVkID0gdGhpcy5tYXRjaCA9IFwiXCI7XG4gICAgICAgIHRoaXMuY29uZGl0aW9uU3RhY2sgPSBbXCJJTklUSUFMXCJdO1xuICAgICAgICB0aGlzLnl5bGxvYyA9IHtcbiAgICAgICAgICBmaXJzdF9saW5lOiAxLFxuICAgICAgICAgIGZpcnN0X2NvbHVtbjogMCxcbiAgICAgICAgICBsYXN0X2xpbmU6IDEsXG4gICAgICAgICAgbGFzdF9jb2x1bW46IDBcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZSA9IFswLCAwXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9mZnNldCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJzZXRJbnB1dFwiKSxcbiAgICAgIC8vIGNvbnN1bWVzIGFuZCByZXR1cm5zIG9uZSBjaGFyIGZyb20gdGhlIGlucHV0XG4gICAgICBpbnB1dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNoID0gdGhpcy5faW5wdXRbMF07XG4gICAgICAgIHRoaXMueXl0ZXh0ICs9IGNoO1xuICAgICAgICB0aGlzLnl5bGVuZysrO1xuICAgICAgICB0aGlzLm9mZnNldCsrO1xuICAgICAgICB0aGlzLm1hdGNoICs9IGNoO1xuICAgICAgICB0aGlzLm1hdGNoZWQgKz0gY2g7XG4gICAgICAgIHZhciBsaW5lcyA9IGNoLm1hdGNoKC8oPzpcXHJcXG4/fFxcbikuKi9nKTtcbiAgICAgICAgaWYgKGxpbmVzKSB7XG4gICAgICAgICAgdGhpcy55eWxpbmVubysrO1xuICAgICAgICAgIHRoaXMueXlsbG9jLmxhc3RfbGluZSsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMueXlsbG9jLmxhc3RfY29sdW1uKys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZVsxXSsrO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2lucHV0ID0gdGhpcy5faW5wdXQuc2xpY2UoMSk7XG4gICAgICAgIHJldHVybiBjaDtcbiAgICAgIH0sIFwiaW5wdXRcIiksXG4gICAgICAvLyB1bnNoaWZ0cyBvbmUgY2hhciAob3IgYSBzdHJpbmcpIGludG8gdGhlIGlucHV0XG4gICAgICB1bnB1dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihjaCkge1xuICAgICAgICB2YXIgbGVuID0gY2gubGVuZ3RoO1xuICAgICAgICB2YXIgbGluZXMgPSBjaC5zcGxpdCgvKD86XFxyXFxuP3xcXG4pL2cpO1xuICAgICAgICB0aGlzLl9pbnB1dCA9IGNoICsgdGhpcy5faW5wdXQ7XG4gICAgICAgIHRoaXMueXl0ZXh0ID0gdGhpcy55eXRleHQuc3Vic3RyKDAsIHRoaXMueXl0ZXh0Lmxlbmd0aCAtIGxlbik7XG4gICAgICAgIHRoaXMub2Zmc2V0IC09IGxlbjtcbiAgICAgICAgdmFyIG9sZExpbmVzID0gdGhpcy5tYXRjaC5zcGxpdCgvKD86XFxyXFxuP3xcXG4pL2cpO1xuICAgICAgICB0aGlzLm1hdGNoID0gdGhpcy5tYXRjaC5zdWJzdHIoMCwgdGhpcy5tYXRjaC5sZW5ndGggLSAxKTtcbiAgICAgICAgdGhpcy5tYXRjaGVkID0gdGhpcy5tYXRjaGVkLnN1YnN0cigwLCB0aGlzLm1hdGNoZWQubGVuZ3RoIC0gMSk7XG4gICAgICAgIGlmIChsaW5lcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgdGhpcy55eWxpbmVubyAtPSBsaW5lcy5sZW5ndGggLSAxO1xuICAgICAgICB9XG4gICAgICAgIHZhciByID0gdGhpcy55eWxsb2MucmFuZ2U7XG4gICAgICAgIHRoaXMueXlsbG9jID0ge1xuICAgICAgICAgIGZpcnN0X2xpbmU6IHRoaXMueXlsbG9jLmZpcnN0X2xpbmUsXG4gICAgICAgICAgbGFzdF9saW5lOiB0aGlzLnl5bGluZW5vICsgMSxcbiAgICAgICAgICBmaXJzdF9jb2x1bW46IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbixcbiAgICAgICAgICBsYXN0X2NvbHVtbjogbGluZXMgPyAobGluZXMubGVuZ3RoID09PSBvbGRMaW5lcy5sZW5ndGggPyB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4gOiAwKSArIG9sZExpbmVzW29sZExpbmVzLmxlbmd0aCAtIGxpbmVzLmxlbmd0aF0ubGVuZ3RoIC0gbGluZXNbMF0ubGVuZ3RoIDogdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uIC0gbGVuXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2UgPSBbclswXSwgclswXSArIHRoaXMueXlsZW5nIC0gbGVuXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnl5bGVuZyA9IHRoaXMueXl0ZXh0Lmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcInVucHV0XCIpLFxuICAgICAgLy8gV2hlbiBjYWxsZWQgZnJvbSBhY3Rpb24sIGNhY2hlcyBtYXRjaGVkIHRleHQgYW5kIGFwcGVuZHMgaXQgb24gbmV4dCBhY3Rpb25cbiAgICAgIG1vcmU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX21vcmUgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwibW9yZVwiKSxcbiAgICAgIC8vIFdoZW4gY2FsbGVkIGZyb20gYWN0aW9uLCBzaWduYWxzIHRoZSBsZXhlciB0aGF0IHRoaXMgcnVsZSBmYWlscyB0byBtYXRjaCB0aGUgaW5wdXQsIHNvIHRoZSBuZXh0IG1hdGNoaW5nIHJ1bGUgKHJlZ2V4KSBzaG91bGQgYmUgdGVzdGVkIGluc3RlYWQuXG4gICAgICByZWplY3Q6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFja3RyYWNrX2xleGVyKSB7XG4gICAgICAgICAgdGhpcy5fYmFja3RyYWNrID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZUVycm9yKFwiTGV4aWNhbCBlcnJvciBvbiBsaW5lIFwiICsgKHRoaXMueXlsaW5lbm8gKyAxKSArIFwiLiBZb3UgY2FuIG9ubHkgaW52b2tlIHJlamVjdCgpIGluIHRoZSBsZXhlciB3aGVuIHRoZSBsZXhlciBpcyBvZiB0aGUgYmFja3RyYWNraW5nIHBlcnN1YXNpb24gKG9wdGlvbnMuYmFja3RyYWNrX2xleGVyID0gdHJ1ZSkuXFxuXCIgKyB0aGlzLnNob3dQb3NpdGlvbigpLCB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgdG9rZW46IG51bGwsXG4gICAgICAgICAgICBsaW5lOiB0aGlzLnl5bGluZW5vXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcInJlamVjdFwiKSxcbiAgICAgIC8vIHJldGFpbiBmaXJzdCBuIGNoYXJhY3RlcnMgb2YgdGhlIG1hdGNoXG4gICAgICBsZXNzOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgdGhpcy51bnB1dCh0aGlzLm1hdGNoLnNsaWNlKG4pKTtcbiAgICAgIH0sIFwibGVzc1wiKSxcbiAgICAgIC8vIGRpc3BsYXlzIGFscmVhZHkgbWF0Y2hlZCBpbnB1dCwgaS5lLiBmb3IgZXJyb3IgbWVzc2FnZXNcbiAgICAgIHBhc3RJbnB1dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBhc3QgPSB0aGlzLm1hdGNoZWQuc3Vic3RyKDAsIHRoaXMubWF0Y2hlZC5sZW5ndGggLSB0aGlzLm1hdGNoLmxlbmd0aCk7XG4gICAgICAgIHJldHVybiAocGFzdC5sZW5ndGggPiAyMCA/IFwiLi4uXCIgOiBcIlwiKSArIHBhc3Quc3Vic3RyKC0yMCkucmVwbGFjZSgvXFxuL2csIFwiXCIpO1xuICAgICAgfSwgXCJwYXN0SW5wdXRcIiksXG4gICAgICAvLyBkaXNwbGF5cyB1cGNvbWluZyBpbnB1dCwgaS5lLiBmb3IgZXJyb3IgbWVzc2FnZXNcbiAgICAgIHVwY29taW5nSW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXh0ID0gdGhpcy5tYXRjaDtcbiAgICAgICAgaWYgKG5leHQubGVuZ3RoIDwgMjApIHtcbiAgICAgICAgICBuZXh0ICs9IHRoaXMuX2lucHV0LnN1YnN0cigwLCAyMCAtIG5leHQubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKG5leHQuc3Vic3RyKDAsIDIwKSArIChuZXh0Lmxlbmd0aCA+IDIwID8gXCIuLi5cIiA6IFwiXCIpKS5yZXBsYWNlKC9cXG4vZywgXCJcIik7XG4gICAgICB9LCBcInVwY29taW5nSW5wdXRcIiksXG4gICAgICAvLyBkaXNwbGF5cyB0aGUgY2hhcmFjdGVyIHBvc2l0aW9uIHdoZXJlIHRoZSBsZXhpbmcgZXJyb3Igb2NjdXJyZWQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICBzaG93UG9zaXRpb246IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwcmUgPSB0aGlzLnBhc3RJbnB1dCgpO1xuICAgICAgICB2YXIgYyA9IG5ldyBBcnJheShwcmUubGVuZ3RoICsgMSkuam9pbihcIi1cIik7XG4gICAgICAgIHJldHVybiBwcmUgKyB0aGlzLnVwY29taW5nSW5wdXQoKSArIFwiXFxuXCIgKyBjICsgXCJeXCI7XG4gICAgICB9LCBcInNob3dQb3NpdGlvblwiKSxcbiAgICAgIC8vIHRlc3QgdGhlIGxleGVkIHRva2VuOiByZXR1cm4gRkFMU0Ugd2hlbiBub3QgYSBtYXRjaCwgb3RoZXJ3aXNlIHJldHVybiB0b2tlblxuICAgICAgdGVzdF9tYXRjaDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihtYXRjaCwgaW5kZXhlZF9ydWxlKSB7XG4gICAgICAgIHZhciB0b2tlbiwgbGluZXMsIGJhY2t1cDtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIpIHtcbiAgICAgICAgICBiYWNrdXAgPSB7XG4gICAgICAgICAgICB5eWxpbmVubzogdGhpcy55eWxpbmVubyxcbiAgICAgICAgICAgIHl5bGxvYzoge1xuICAgICAgICAgICAgICBmaXJzdF9saW5lOiB0aGlzLnl5bGxvYy5maXJzdF9saW5lLFxuICAgICAgICAgICAgICBsYXN0X2xpbmU6IHRoaXMubGFzdF9saW5lLFxuICAgICAgICAgICAgICBmaXJzdF9jb2x1bW46IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbixcbiAgICAgICAgICAgICAgbGFzdF9jb2x1bW46IHRoaXMueXlsbG9jLmxhc3RfY29sdW1uXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeXl0ZXh0OiB0aGlzLnl5dGV4dCxcbiAgICAgICAgICAgIG1hdGNoOiB0aGlzLm1hdGNoLFxuICAgICAgICAgICAgbWF0Y2hlczogdGhpcy5tYXRjaGVzLFxuICAgICAgICAgICAgbWF0Y2hlZDogdGhpcy5tYXRjaGVkLFxuICAgICAgICAgICAgeXlsZW5nOiB0aGlzLnl5bGVuZyxcbiAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICBfbW9yZTogdGhpcy5fbW9yZSxcbiAgICAgICAgICAgIF9pbnB1dDogdGhpcy5faW5wdXQsXG4gICAgICAgICAgICB5eTogdGhpcy55eSxcbiAgICAgICAgICAgIGNvbmRpdGlvblN0YWNrOiB0aGlzLmNvbmRpdGlvblN0YWNrLnNsaWNlKDApLFxuICAgICAgICAgICAgZG9uZTogdGhpcy5kb25lXG4gICAgICAgICAgfTtcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgICAgYmFja3VwLnl5bGxvYy5yYW5nZSA9IHRoaXMueXlsbG9jLnJhbmdlLnNsaWNlKDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsaW5lcyA9IG1hdGNoWzBdLm1hdGNoKC8oPzpcXHJcXG4/fFxcbikuKi9nKTtcbiAgICAgICAgaWYgKGxpbmVzKSB7XG4gICAgICAgICAgdGhpcy55eWxpbmVubyArPSBsaW5lcy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy55eWxsb2MgPSB7XG4gICAgICAgICAgZmlyc3RfbGluZTogdGhpcy55eWxsb2MubGFzdF9saW5lLFxuICAgICAgICAgIGxhc3RfbGluZTogdGhpcy55eWxpbmVubyArIDEsXG4gICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtbixcbiAgICAgICAgICBsYXN0X2NvbHVtbjogbGluZXMgPyBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXS5sZW5ndGggLSBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXS5tYXRjaCgvXFxyP1xcbj8vKVswXS5sZW5ndGggOiB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtbiArIG1hdGNoWzBdLmxlbmd0aFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnl5dGV4dCArPSBtYXRjaFswXTtcbiAgICAgICAgdGhpcy5tYXRjaCArPSBtYXRjaFswXTtcbiAgICAgICAgdGhpcy5tYXRjaGVzID0gbWF0Y2g7XG4gICAgICAgIHRoaXMueXlsZW5nID0gdGhpcy55eXRleHQubGVuZ3RoO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlID0gW3RoaXMub2Zmc2V0LCB0aGlzLm9mZnNldCArPSB0aGlzLnl5bGVuZ107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbW9yZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9iYWNrdHJhY2sgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSB0aGlzLl9pbnB1dC5zbGljZShtYXRjaFswXS5sZW5ndGgpO1xuICAgICAgICB0aGlzLm1hdGNoZWQgKz0gbWF0Y2hbMF07XG4gICAgICAgIHRva2VuID0gdGhpcy5wZXJmb3JtQWN0aW9uLmNhbGwodGhpcywgdGhpcy55eSwgdGhpcywgaW5kZXhlZF9ydWxlLCB0aGlzLmNvbmRpdGlvblN0YWNrW3RoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMV0pO1xuICAgICAgICBpZiAodGhpcy5kb25lICYmIHRoaXMuX2lucHV0KSB7XG4gICAgICAgICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JhY2t0cmFjaykge1xuICAgICAgICAgIGZvciAodmFyIGsgaW4gYmFja3VwKSB7XG4gICAgICAgICAgICB0aGlzW2tdID0gYmFja3VwW2tdO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSwgXCJ0ZXN0X21hdGNoXCIpLFxuICAgICAgLy8gcmV0dXJuIG5leHQgbWF0Y2ggaW4gaW5wdXRcbiAgICAgIG5leHQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5FT0Y7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9pbnB1dCkge1xuICAgICAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRva2VuLCBtYXRjaCwgdGVtcE1hdGNoLCBpbmRleDtcbiAgICAgICAgaWYgKCF0aGlzLl9tb3JlKSB7XG4gICAgICAgICAgdGhpcy55eXRleHQgPSBcIlwiO1xuICAgICAgICAgIHRoaXMubWF0Y2ggPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIHZhciBydWxlcyA9IHRoaXMuX2N1cnJlbnRSdWxlcygpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdGVtcE1hdGNoID0gdGhpcy5faW5wdXQubWF0Y2godGhpcy5ydWxlc1tydWxlc1tpXV0pO1xuICAgICAgICAgIGlmICh0ZW1wTWF0Y2ggJiYgKCFtYXRjaCB8fCB0ZW1wTWF0Y2hbMF0ubGVuZ3RoID4gbWF0Y2hbMF0ubGVuZ3RoKSkge1xuICAgICAgICAgICAgbWF0Y2ggPSB0ZW1wTWF0Y2g7XG4gICAgICAgICAgICBpbmRleCA9IGk7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2t0cmFja19sZXhlcikge1xuICAgICAgICAgICAgICB0b2tlbiA9IHRoaXMudGVzdF9tYXRjaCh0ZW1wTWF0Y2gsIHJ1bGVzW2ldKTtcbiAgICAgICAgICAgICAgaWYgKHRva2VuICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9iYWNrdHJhY2spIHtcbiAgICAgICAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5vcHRpb25zLmZsZXgpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgIHRva2VuID0gdGhpcy50ZXN0X21hdGNoKG1hdGNoLCBydWxlc1tpbmRleF0pO1xuICAgICAgICAgIGlmICh0b2tlbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9pbnB1dCA9PT0gXCJcIikge1xuICAgICAgICAgIHJldHVybiB0aGlzLkVPRjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZUVycm9yKFwiTGV4aWNhbCBlcnJvciBvbiBsaW5lIFwiICsgKHRoaXMueXlsaW5lbm8gKyAxKSArIFwiLiBVbnJlY29nbml6ZWQgdGV4dC5cXG5cIiArIHRoaXMuc2hvd1Bvc2l0aW9uKCksIHtcbiAgICAgICAgICAgIHRleHQ6IFwiXCIsXG4gICAgICAgICAgICB0b2tlbjogbnVsbCxcbiAgICAgICAgICAgIGxpbmU6IHRoaXMueXlsaW5lbm9cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJuZXh0XCIpLFxuICAgICAgLy8gcmV0dXJuIG5leHQgbWF0Y2ggdGhhdCBoYXMgYSB0b2tlblxuICAgICAgbGV4OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGxleCgpIHtcbiAgICAgICAgdmFyIHIgPSB0aGlzLm5leHQoKTtcbiAgICAgICAgaWYgKHIpIHtcbiAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5sZXgoKTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJsZXhcIiksXG4gICAgICAvLyBhY3RpdmF0ZXMgYSBuZXcgbGV4ZXIgY29uZGl0aW9uIHN0YXRlIChwdXNoZXMgdGhlIG5ldyBsZXhlciBjb25kaXRpb24gc3RhdGUgb250byB0aGUgY29uZGl0aW9uIHN0YWNrKVxuICAgICAgYmVnaW46IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gYmVnaW4oY29uZGl0aW9uKSB7XG4gICAgICAgIHRoaXMuY29uZGl0aW9uU3RhY2sucHVzaChjb25kaXRpb24pO1xuICAgICAgfSwgXCJiZWdpblwiKSxcbiAgICAgIC8vIHBvcCB0aGUgcHJldmlvdXNseSBhY3RpdmUgbGV4ZXIgY29uZGl0aW9uIHN0YXRlIG9mZiB0aGUgY29uZGl0aW9uIHN0YWNrXG4gICAgICBwb3BTdGF0ZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwb3BTdGF0ZSgpIHtcbiAgICAgICAgdmFyIG4gPSB0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDE7XG4gICAgICAgIGlmIChuID4gMCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrLnBvcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrWzBdO1xuICAgICAgICB9XG4gICAgICB9LCBcInBvcFN0YXRlXCIpLFxuICAgICAgLy8gcHJvZHVjZSB0aGUgbGV4ZXIgcnVsZSBzZXQgd2hpY2ggaXMgYWN0aXZlIGZvciB0aGUgY3VycmVudGx5IGFjdGl2ZSBsZXhlciBjb25kaXRpb24gc3RhdGVcbiAgICAgIF9jdXJyZW50UnVsZXM6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gX2N1cnJlbnRSdWxlcygpIHtcbiAgICAgICAgaWYgKHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoICYmIHRoaXMuY29uZGl0aW9uU3RhY2tbdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxXSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvbnNbdGhpcy5jb25kaXRpb25TdGFja1t0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDFdXS5ydWxlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25zW1wiSU5JVElBTFwiXS5ydWxlcztcbiAgICAgICAgfVxuICAgICAgfSwgXCJfY3VycmVudFJ1bGVzXCIpLFxuICAgICAgLy8gcmV0dXJuIHRoZSBjdXJyZW50bHkgYWN0aXZlIGxleGVyIGNvbmRpdGlvbiBzdGF0ZTsgd2hlbiBhbiBpbmRleCBhcmd1bWVudCBpcyBwcm92aWRlZCBpdCBwcm9kdWNlcyB0aGUgTi10aCBwcmV2aW91cyBjb25kaXRpb24gc3RhdGUsIGlmIGF2YWlsYWJsZVxuICAgICAgdG9wU3RhdGU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gdG9wU3RhdGUobikge1xuICAgICAgICBuID0gdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxIC0gTWF0aC5hYnMobiB8fCAwKTtcbiAgICAgICAgaWYgKG4gPj0gMCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrW25dO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBcIklOSVRJQUxcIjtcbiAgICAgICAgfVxuICAgICAgfSwgXCJ0b3BTdGF0ZVwiKSxcbiAgICAgIC8vIGFsaWFzIGZvciBiZWdpbihjb25kaXRpb24pXG4gICAgICBwdXNoU3RhdGU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcHVzaFN0YXRlKGNvbmRpdGlvbikge1xuICAgICAgICB0aGlzLmJlZ2luKGNvbmRpdGlvbik7XG4gICAgICB9LCBcInB1c2hTdGF0ZVwiKSxcbiAgICAgIC8vIHJldHVybiB0aGUgbnVtYmVyIG9mIHN0YXRlcyBjdXJyZW50bHkgb24gdGhlIHN0YWNrXG4gICAgICBzdGF0ZVN0YWNrU2l6ZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBzdGF0ZVN0YWNrU2l6ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoO1xuICAgICAgfSwgXCJzdGF0ZVN0YWNrU2l6ZVwiKSxcbiAgICAgIG9wdGlvbnM6IHsgXCJjYXNlLWluc2Vuc2l0aXZlXCI6IHRydWUgfSxcbiAgICAgIHBlcmZvcm1BY3Rpb246IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gYW5vbnltb3VzKHl5LCB5eV8sICRhdm9pZGluZ19uYW1lX2NvbGxpc2lvbnMsIFlZX1NUQVJUKSB7XG4gICAgICAgIHZhciBZWVNUQVRFID0gWVlfU1RBUlQ7XG4gICAgICAgIHN3aXRjaCAoJGF2b2lkaW5nX25hbWVfY29sbGlzaW9ucykge1xuICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIHJldHVybiA1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgcmV0dXJuIDIwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcIkNPTkZJR1wiKTtcbiAgICAgICAgICAgIHJldHVybiA3NTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgIHJldHVybiA3NjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJBTElBU1wiKTtcbiAgICAgICAgICAgIHJldHVybiA3NztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gNzc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgICAgeXlfLnl5dGV4dCA9IHl5Xy55eXRleHQudHJpbSgpO1xuICAgICAgICAgICAgcmV0dXJuIDczO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgIHl5Xy55eXRleHQgPSB5eV8ueXl0ZXh0LnRyaW0oKTtcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJBTElBU1wiKTtcbiAgICAgICAgICAgIHJldHVybiA3MztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgICB5eV8ueXl0ZXh0ID0geXlfLnl5dGV4dC50cmltKCk7XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gNzM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIDEwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxNTpcbiAgICAgICAgICAgIHl5Xy55eXRleHQgPSB5eV8ueXl0ZXh0LnRyaW0oKTtcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiAxMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiTElORVwiKTtcbiAgICAgICAgICAgIHJldHVybiAxNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiSURcIik7XG4gICAgICAgICAgICByZXR1cm4gNTE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE4OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcIklEXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDUzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxOTpcbiAgICAgICAgICAgIHJldHVybiAxNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiSURcIik7XG4gICAgICAgICAgICByZXR1cm4gNTQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDIxOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5iZWdpbihcIkxJTkVcIik7XG4gICAgICAgICAgICByZXR1cm4gNTI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDIyOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIDU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDIzOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcIkxJTkVcIik7XG4gICAgICAgICAgICByZXR1cm4gMzc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI0OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcIkxJTkVcIik7XG4gICAgICAgICAgICByZXR1cm4gMzg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI1OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcIkxJTkVcIik7XG4gICAgICAgICAgICByZXR1cm4gMzk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI2OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcIkxJTkVcIik7XG4gICAgICAgICAgICByZXR1cm4gNDA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcIkxJTkVcIik7XG4gICAgICAgICAgICByZXR1cm4gNTA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI4OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcIkxJTkVcIik7XG4gICAgICAgICAgICByZXR1cm4gNDI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI5OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcIkxJTkVcIik7XG4gICAgICAgICAgICByZXR1cm4gNDQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDMwOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcIkxJTkVcIik7XG4gICAgICAgICAgICByZXR1cm4gNDk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDMxOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcIkxJTkVcIik7XG4gICAgICAgICAgICByZXR1cm4gNDU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDMyOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcIkxJTkVcIik7XG4gICAgICAgICAgICByZXR1cm4gNDg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDMzOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcIkxJTkVcIik7XG4gICAgICAgICAgICByZXR1cm4gNDc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM0OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIDE2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNTpcbiAgICAgICAgICAgIHJldHVybiAxNztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzY6XG4gICAgICAgICAgICByZXR1cm4gNjc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgICAgcmV0dXJuIDY4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzODpcbiAgICAgICAgICAgIHJldHVybiA2MTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzk6XG4gICAgICAgICAgICByZXR1cm4gNjI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQwOlxuICAgICAgICAgICAgcmV0dXJuIDYzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0MTpcbiAgICAgICAgICAgIHJldHVybiA2NDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDI6XG4gICAgICAgICAgICByZXR1cm4gNTk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQzOlxuICAgICAgICAgICAgcmV0dXJuIDU2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0NDpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJJRFwiKTtcbiAgICAgICAgICAgIHJldHVybiAyMjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDU6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiSURcIik7XG4gICAgICAgICAgICByZXR1cm4gMjQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ2OlxuICAgICAgICAgICAgcmV0dXJuIDMwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0NzpcbiAgICAgICAgICAgIHJldHVybiAzMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDg6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiYWNjX3RpdGxlXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDMyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0OTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiBcImFjY190aXRsZV92YWx1ZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1MDpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJhY2NfZGVzY3JcIik7XG4gICAgICAgICAgICByZXR1cm4gMzQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDUxOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIFwiYWNjX2Rlc2NyX3ZhbHVlXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDUyOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImFjY19kZXNjcl9tdWx0aWxpbmVcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDUzOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1NDpcbiAgICAgICAgICAgIHJldHVybiBcImFjY19kZXNjcl9tdWx0aWxpbmVfdmFsdWVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTU6XG4gICAgICAgICAgICByZXR1cm4gNjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTY6XG4gICAgICAgICAgICByZXR1cm4gMTk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU3OlxuICAgICAgICAgICAgcmV0dXJuIDIxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1ODpcbiAgICAgICAgICAgIHJldHVybiA2NjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTk6XG4gICAgICAgICAgICByZXR1cm4gNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjA6XG4gICAgICAgICAgICB5eV8ueXl0ZXh0ID0geXlfLnl5dGV4dC50cmltKCk7XG4gICAgICAgICAgICByZXR1cm4gNzM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDYxOlxuICAgICAgICAgICAgcmV0dXJuIDgwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2MjpcbiAgICAgICAgICAgIHJldHVybiA5NztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjM6XG4gICAgICAgICAgICByZXR1cm4gOTg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDY0OlxuICAgICAgICAgICAgcmV0dXJuIDk5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2NTpcbiAgICAgICAgICAgIHJldHVybiA3ODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjY6XG4gICAgICAgICAgICByZXR1cm4gNzk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDY3OlxuICAgICAgICAgICAgcmV0dXJuIDEwMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjg6XG4gICAgICAgICAgICByZXR1cm4gMTAxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2OTpcbiAgICAgICAgICAgIHJldHVybiAxMDI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDcwOlxuICAgICAgICAgICAgcmV0dXJuIDEwMztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzE6XG4gICAgICAgICAgICByZXR1cm4gODU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDcyOlxuICAgICAgICAgICAgcmV0dXJuIDg2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3MzpcbiAgICAgICAgICAgIHJldHVybiA4NztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzQ6XG4gICAgICAgICAgICByZXR1cm4gODg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDc1OlxuICAgICAgICAgICAgcmV0dXJuIDkzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3NjpcbiAgICAgICAgICAgIHJldHVybiA5NDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzc6XG4gICAgICAgICAgICByZXR1cm4gOTU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDc4OlxuICAgICAgICAgICAgcmV0dXJuIDk2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3OTpcbiAgICAgICAgICAgIHJldHVybiA4MTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgODA6XG4gICAgICAgICAgICByZXR1cm4gODI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDgxOlxuICAgICAgICAgICAgcmV0dXJuIDgzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4MjpcbiAgICAgICAgICAgIHJldHVybiA4NDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgODM6XG4gICAgICAgICAgICByZXR1cm4gODk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDg0OlxuICAgICAgICAgICAgcmV0dXJuIDkwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4NTpcbiAgICAgICAgICAgIHJldHVybiA5MTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgODY6XG4gICAgICAgICAgICByZXR1cm4gOTI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDg3OlxuICAgICAgICAgICAgcmV0dXJuIDEwNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgODg6XG4gICAgICAgICAgICByZXR1cm4gMTA0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4OTpcbiAgICAgICAgICAgIHJldHVybiA3MDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTA6XG4gICAgICAgICAgICByZXR1cm4gNzE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDkxOlxuICAgICAgICAgICAgcmV0dXJuIDcyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA5MjpcbiAgICAgICAgICAgIHJldHVybiA1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA5MzpcbiAgICAgICAgICAgIHJldHVybiAxMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9LCBcImFub255bW91c1wiKSxcbiAgICAgIHJ1bGVzOiBbL14oPzpbXFxuXSspL2ksIC9eKD86XFxzKykvaSwgL14oPzooKD8hXFxuKVxccykrKS9pLCAvXig/OiNbXlxcbl0qKS9pLCAvXig/OiUoPyFcXHspW15cXG5dKikvaSwgL14oPzpbXlxcfV0lJVteXFxuXSopL2ksIC9eKD86KFswLTldKyhcXC5bMC05XXsxLDJ9KT98XFwuWzAtOV17MSwyfSkoPz1bIFxcbl0rKSkvaSwgL14oPzpAXFx7KS9pLCAvXig/OlteXFx9XSspL2ksIC9eKD86XFx9KD89XFxzK2FzXFxzKSkvaSwgL14oPzpcXH0pL2ksIC9eKD86W15cXDwtPlxcLT46XFxuLDtAXFxzXSsoPz1AXFx7KSkvaSwgL14oPzpbXjw+Olxcbiw7QFxcc10rKD89XFxzK2FzXFxzKSkvaSwgL14oPzpbXjw+Olxcbiw7QF0rKD89XFxzKltcXG47I118JCkpL2ksIC9eKD86W148PjpcXG4sO0BdKjxbXlxcbl0qKS9pLCAvXig/OlteXFxuXSspL2ksIC9eKD86Ym94XFxiKS9pLCAvXig/OnBhcnRpY2lwYW50XFxiKS9pLCAvXig/OmFjdG9yXFxiKS9pLCAvXig/OmNyZWF0ZVxcYikvaSwgL14oPzpkZXN0cm95XFxiKS9pLCAvXig/OmFzXFxiKS9pLCAvXig/Oig/OikpL2ksIC9eKD86bG9vcFxcYikvaSwgL14oPzpyZWN0XFxiKS9pLCAvXig/Om9wdFxcYikvaSwgL14oPzphbHRcXGIpL2ksIC9eKD86ZWxzZVxcYikvaSwgL14oPzpwYXJcXGIpL2ksIC9eKD86cGFyX292ZXJcXGIpL2ksIC9eKD86YW5kXFxiKS9pLCAvXig/OmNyaXRpY2FsXFxiKS9pLCAvXig/Om9wdGlvblxcYikvaSwgL14oPzpicmVha1xcYikvaSwgL14oPzooPzpbOl0/KD86bm8pP3dyYXApP1teI1xcbjtdKikvaSwgL14oPzplbmRcXGIpL2ksIC9eKD86bGVmdCBvZlxcYikvaSwgL14oPzpyaWdodCBvZlxcYikvaSwgL14oPzpsaW5rc1xcYikvaSwgL14oPzpsaW5rXFxiKS9pLCAvXig/OnByb3BlcnRpZXNcXGIpL2ksIC9eKD86ZGV0YWlsc1xcYikvaSwgL14oPzpvdmVyXFxiKS9pLCAvXig/Om5vdGVcXGIpL2ksIC9eKD86YWN0aXZhdGVcXGIpL2ksIC9eKD86ZGVhY3RpdmF0ZVxcYikvaSwgL14oPzp0aXRsZVxcc1teI1xcbjtdKykvaSwgL14oPzp0aXRsZTpcXHNbXiNcXG47XSspL2ksIC9eKD86YWNjVGl0bGVcXHMqOlxccyopL2ksIC9eKD86KD8hXFxufHwpKlteXFxuXSopL2ksIC9eKD86YWNjRGVzY3JcXHMqOlxccyopL2ksIC9eKD86KD8hXFxufHwpKlteXFxuXSopL2ksIC9eKD86YWNjRGVzY3JcXHMqXFx7XFxzKikvaSwgL14oPzpbXFx9XSkvaSwgL14oPzpbXlxcfV0qKS9pLCAvXig/OnNlcXVlbmNlRGlhZ3JhbVxcYikvaSwgL14oPzphdXRvbnVtYmVyXFxiKS9pLCAvXig/Om9mZlxcYikvaSwgL14oPzosKS9pLCAvXig/OjspL2ksIC9eKD86W15cXC9cXFxcXFwrXFwoKVxcKzxcXC0+XFwtPjpcXG4sO10rKCg/ISgteHwtLXh8LVxcKXwtLVxcKXwtXFx8XFxcXHwtXFxcXHwtXFwvfC1cXC9cXC98LVxcfFxcL3xcXC9cXHwtfFxcXFxcXHwtfFxcL1xcLy18XFxcXFxcXFwtfFxcL1xcfC18LS1cXHxcXFxcfC0tfFxcKFxcKSkpW1xcLV0qW15cXCs8XFwtPlxcLT46XFxuLDtdKykqKS9pLCAvXig/Oi0+PikvaSwgL14oPzo8PC0+PikvaSwgL14oPzotLT4+KS9pLCAvXig/Ojw8LS0+PikvaSwgL14oPzotPikvaSwgL14oPzotLT4pL2ksIC9eKD86LVt4XSkvaSwgL14oPzotLVt4XSkvaSwgL14oPzotW1xcKV0pL2ksIC9eKD86LS1bXFwpXSkvaSwgL14oPzotLVxcfFxcXFwpL2ksIC9eKD86LS1cXHxcXC8pL2ksIC9eKD86LS1cXFxcXFxcXCkvaSwgL14oPzotLVxcL1xcLykvaSwgL14oPzpcXC9cXHwtLSkvaSwgL14oPzpcXFxcXFx8LS0pL2ksIC9eKD86XFwvXFwvLS0pL2ksIC9eKD86XFxcXFxcXFwtLSkvaSwgL14oPzotXFx8XFxcXCkvaSwgL14oPzotXFx8XFwvKS9pLCAvXig/Oi1cXFxcXFxcXCkvaSwgL14oPzotXFwvXFwvKS9pLCAvXig/OlxcL1xcfC0pL2ksIC9eKD86XFxcXFxcfC0pL2ksIC9eKD86XFwvXFwvLSkvaSwgL14oPzpcXFxcXFxcXC0pL2ksIC9eKD86Oig/Oig/Om5vKT93cmFwKT9bXiNcXG47XSopL2ksIC9eKD86OikvaSwgL14oPzpcXCspL2ksIC9eKD86LSkvaSwgL14oPzpcXChcXCkpL2ksIC9eKD86JCkvaSwgL14oPzouKS9pXSxcbiAgICAgIGNvbmRpdGlvbnM6IHsgXCJhY2NfZGVzY3JfbXVsdGlsaW5lXCI6IHsgXCJydWxlc1wiOiBbNTMsIDU0XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJhY2NfZGVzY3JcIjogeyBcInJ1bGVzXCI6IFs1MV0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiYWNjX3RpdGxlXCI6IHsgXCJydWxlc1wiOiBbNDldLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIklEXCI6IHsgXCJydWxlc1wiOiBbMiwgMywgNywgMTEsIDEyLCAxMywgMTQsIDE1XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJBTElBU1wiOiB7IFwicnVsZXNcIjogWzIsIDMsIDIxLCAyMl0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiTElORVwiOiB7IFwicnVsZXNcIjogWzIsIDMsIDM0XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJDT05GSUdcIjogeyBcInJ1bGVzXCI6IFs4LCA5LCAxMF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiQ09ORklHX0RBVEFcIjogeyBcInJ1bGVzXCI6IFtdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIklOSVRJQUxcIjogeyBcInJ1bGVzXCI6IFswLCAxLCAzLCA0LCA1LCA2LCAxNiwgMTcsIDE4LCAxOSwgMjAsIDIzLCAyNCwgMjUsIDI2LCAyNywgMjgsIDI5LCAzMCwgMzEsIDMyLCAzMywgMzUsIDM2LCAzNywgMzgsIDM5LCA0MCwgNDEsIDQyLCA0MywgNDQsIDQ1LCA0NiwgNDcsIDQ4LCA1MCwgNTIsIDU1LCA1NiwgNTcsIDU4LCA1OSwgNjAsIDYxLCA2MiwgNjMsIDY0LCA2NSwgNjYsIDY3LCA2OCwgNjksIDcwLCA3MSwgNzIsIDczLCA3NCwgNzUsIDc2LCA3NywgNzgsIDc5LCA4MCwgODEsIDgyLCA4MywgODQsIDg1LCA4NiwgODcsIDg4LCA4OSwgOTAsIDkxLCA5MiwgOTNdLCBcImluY2x1c2l2ZVwiOiB0cnVlIH0gfVxuICAgIH07XG4gICAgcmV0dXJuIGxleGVyMjtcbiAgfSkoKTtcbiAgcGFyc2VyMi5sZXhlciA9IGxleGVyO1xuICBmdW5jdGlvbiBQYXJzZXIoKSB7XG4gICAgdGhpcy55eSA9IHt9O1xuICB9XG4gIF9fbmFtZShQYXJzZXIsIFwiUGFyc2VyXCIpO1xuICBQYXJzZXIucHJvdG90eXBlID0gcGFyc2VyMjtcbiAgcGFyc2VyMi5QYXJzZXIgPSBQYXJzZXI7XG4gIHJldHVybiBuZXcgUGFyc2VyKCk7XG59KSgpO1xucGFyc2VyLnBhcnNlciA9IHBhcnNlcjtcbnZhciBzZXF1ZW5jZURpYWdyYW1fZGVmYXVsdCA9IHBhcnNlcjtcblxuLy8gc3JjL2RpYWdyYW1zL3NlcXVlbmNlL3NlcXVlbmNlRGIudHNcbnZhciBMSU5FVFlQRSA9IHtcbiAgU09MSUQ6IDAsXG4gIERPVFRFRDogMSxcbiAgTk9URTogMixcbiAgU09MSURfQ1JPU1M6IDMsXG4gIERPVFRFRF9DUk9TUzogNCxcbiAgU09MSURfT1BFTjogNSxcbiAgRE9UVEVEX09QRU46IDYsXG4gIExPT1BfU1RBUlQ6IDEwLFxuICBMT09QX0VORDogMTEsXG4gIEFMVF9TVEFSVDogMTIsXG4gIEFMVF9FTFNFOiAxMyxcbiAgQUxUX0VORDogMTQsXG4gIE9QVF9TVEFSVDogMTUsXG4gIE9QVF9FTkQ6IDE2LFxuICBBQ1RJVkVfU1RBUlQ6IDE3LFxuICBBQ1RJVkVfRU5EOiAxOCxcbiAgUEFSX1NUQVJUOiAxOSxcbiAgUEFSX0FORDogMjAsXG4gIFBBUl9FTkQ6IDIxLFxuICBSRUNUX1NUQVJUOiAyMixcbiAgUkVDVF9FTkQ6IDIzLFxuICBTT0xJRF9QT0lOVDogMjQsXG4gIERPVFRFRF9QT0lOVDogMjUsXG4gIEFVVE9OVU1CRVI6IDI2LFxuICBDUklUSUNBTF9TVEFSVDogMjcsXG4gIENSSVRJQ0FMX09QVElPTjogMjgsXG4gIENSSVRJQ0FMX0VORDogMjksXG4gIEJSRUFLX1NUQVJUOiAzMCxcbiAgQlJFQUtfRU5EOiAzMSxcbiAgUEFSX09WRVJfU1RBUlQ6IDMyLFxuICBCSURJUkVDVElPTkFMX1NPTElEOiAzMyxcbiAgQklESVJFQ1RJT05BTF9ET1RURUQ6IDM0LFxuICBTT0xJRF9UT1A6IDQxLFxuICBTT0xJRF9CT1RUT006IDQyLFxuICBTVElDS19UT1A6IDQzLFxuICBTVElDS19CT1RUT006IDQ0LFxuICBTT0xJRF9BUlJPV19UT1BfUkVWRVJTRTogNDUsXG4gIFNPTElEX0FSUk9XX0JPVFRPTV9SRVZFUlNFOiA0NixcbiAgU1RJQ0tfQVJST1dfVE9QX1JFVkVSU0U6IDQ3LFxuICBTVElDS19BUlJPV19CT1RUT01fUkVWRVJTRTogNDgsXG4gIFNPTElEX1RPUF9ET1RURUQ6IDUxLFxuICBTT0xJRF9CT1RUT01fRE9UVEVEOiA1MixcbiAgU1RJQ0tfVE9QX0RPVFRFRDogNTMsXG4gIFNUSUNLX0JPVFRPTV9ET1RURUQ6IDU0LFxuICBTT0xJRF9BUlJPV19UT1BfUkVWRVJTRV9ET1RURUQ6IDU1LFxuICBTT0xJRF9BUlJPV19CT1RUT01fUkVWRVJTRV9ET1RURUQ6IDU2LFxuICBTVElDS19BUlJPV19UT1BfUkVWRVJTRV9ET1RURUQ6IDU3LFxuICBTVElDS19BUlJPV19CT1RUT01fUkVWRVJTRV9ET1RURUQ6IDU4LFxuICBDRU5UUkFMX0NPTk5FQ1RJT046IDU5LFxuICBDRU5UUkFMX0NPTk5FQ1RJT05fUkVWRVJTRTogNjAsXG4gIENFTlRSQUxfQ09OTkVDVElPTl9EVUFMOiA2MVxufTtcbnZhciBBUlJPV1RZUEUgPSB7XG4gIEZJTExFRDogMCxcbiAgT1BFTjogMVxufTtcbnZhciBQTEFDRU1FTlQgPSB7XG4gIExFRlRPRjogMCxcbiAgUklHSFRPRjogMSxcbiAgT1ZFUjogMlxufTtcbnZhciBQQVJUSUNJUEFOVF9UWVBFID0ge1xuICBBQ1RPUjogXCJhY3RvclwiLFxuICBCT1VOREFSWTogXCJib3VuZGFyeVwiLFxuICBDT0xMRUNUSU9OUzogXCJjb2xsZWN0aW9uc1wiLFxuICBDT05UUk9MOiBcImNvbnRyb2xcIixcbiAgREFUQUJBU0U6IFwiZGF0YWJhc2VcIixcbiAgRU5USVRZOiBcImVudGl0eVwiLFxuICBQQVJUSUNJUEFOVDogXCJwYXJ0aWNpcGFudFwiLFxuICBRVUVVRTogXCJxdWV1ZVwiXG59O1xudmFyIFNlcXVlbmNlREIgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3RhdGUgPSBuZXcgSW1wZXJhdGl2ZVN0YXRlKCgpID0+ICh7XG4gICAgICBwcmV2QWN0b3I6IHZvaWQgMCxcbiAgICAgIGFjdG9yczogLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSxcbiAgICAgIGNyZWF0ZWRBY3RvcnM6IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksXG4gICAgICBkZXN0cm95ZWRBY3RvcnM6IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksXG4gICAgICBib3hlczogW10sXG4gICAgICBtZXNzYWdlczogW10sXG4gICAgICBub3RlczogW10sXG4gICAgICBzZXF1ZW5jZU51bWJlcnNFbmFibGVkOiBmYWxzZSxcbiAgICAgIHdyYXBFbmFibGVkOiB2b2lkIDAsXG4gICAgICBjdXJyZW50Qm94OiB2b2lkIDAsXG4gICAgICBsYXN0Q3JlYXRlZDogdm9pZCAwLFxuICAgICAgbGFzdERlc3Ryb3llZDogdm9pZCAwXG4gICAgfSkpO1xuICAgIHRoaXMuc2V0QWNjVGl0bGUgPSBzZXRBY2NUaXRsZTtcbiAgICB0aGlzLnNldEFjY0Rlc2NyaXB0aW9uID0gc2V0QWNjRGVzY3JpcHRpb247XG4gICAgdGhpcy5zZXREaWFncmFtVGl0bGUgPSBzZXREaWFncmFtVGl0bGU7XG4gICAgdGhpcy5nZXRBY2NUaXRsZSA9IGdldEFjY1RpdGxlO1xuICAgIHRoaXMuZ2V0QWNjRGVzY3JpcHRpb24gPSBnZXRBY2NEZXNjcmlwdGlvbjtcbiAgICB0aGlzLmdldERpYWdyYW1UaXRsZSA9IGdldERpYWdyYW1UaXRsZTtcbiAgICB0aGlzLmFwcGx5ID0gdGhpcy5hcHBseS5iaW5kKHRoaXMpO1xuICAgIHRoaXMucGFyc2VCb3hEYXRhID0gdGhpcy5wYXJzZUJveERhdGEuYmluZCh0aGlzKTtcbiAgICB0aGlzLnBhcnNlTWVzc2FnZSA9IHRoaXMucGFyc2VNZXNzYWdlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMuc2V0V3JhcChnZXRDb25maWcyKCkud3JhcCk7XG4gICAgdGhpcy5MSU5FVFlQRSA9IExJTkVUWVBFO1xuICAgIHRoaXMuQVJST1dUWVBFID0gQVJST1dUWVBFO1xuICAgIHRoaXMuUExBQ0VNRU5UID0gUExBQ0VNRU5UO1xuICB9XG4gIHN0YXRpYyB7XG4gICAgX19uYW1lKHRoaXMsIFwiU2VxdWVuY2VEQlwiKTtcbiAgfVxuICBhZGRCb3goZGF0YSkge1xuICAgIHRoaXMuc3RhdGUucmVjb3Jkcy5ib3hlcy5wdXNoKHtcbiAgICAgIG5hbWU6IGRhdGEudGV4dCxcbiAgICAgIHdyYXA6IGRhdGEud3JhcCA/PyB0aGlzLmF1dG9XcmFwKCksXG4gICAgICBmaWxsOiBkYXRhLmNvbG9yLFxuICAgICAgYWN0b3JLZXlzOiBbXVxuICAgIH0pO1xuICAgIHRoaXMuc3RhdGUucmVjb3Jkcy5jdXJyZW50Qm94ID0gdGhpcy5zdGF0ZS5yZWNvcmRzLmJveGVzLnNsaWNlKC0xKVswXTtcbiAgfVxuICBhZGRBY3RvcihpZCwgbmFtZSwgZGVzY3JpcHRpb24sIHR5cGUsIG1ldGFkYXRhKSB7XG4gICAgbGV0IGFzc2lnbmVkQm94ID0gdGhpcy5zdGF0ZS5yZWNvcmRzLmN1cnJlbnRCb3g7XG4gICAgbGV0IGRvYztcbiAgICBpZiAobWV0YWRhdGEgIT09IHZvaWQgMCkge1xuICAgICAgbGV0IHlhbWxEYXRhO1xuICAgICAgaWYgKCFtZXRhZGF0YS5pbmNsdWRlcyhcIlxcblwiKSkge1xuICAgICAgICB5YW1sRGF0YSA9IFwie1xcblwiICsgbWV0YWRhdGEgKyBcIlxcbn1cIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHlhbWxEYXRhID0gbWV0YWRhdGEgKyBcIlxcblwiO1xuICAgICAgfVxuICAgICAgZG9jID0gbG9hZCh5YW1sRGF0YSwgeyBzY2hlbWE6IEpTT05fU0NIRU1BIH0pO1xuICAgIH1cbiAgICB0eXBlID0gZG9jPy50eXBlID8/IHR5cGU7XG4gICAgaWYgKGRvYz8uYWxpYXMgJiYgKCFkZXNjcmlwdGlvbiB8fCBkZXNjcmlwdGlvbi50ZXh0ID09PSBuYW1lKSkge1xuICAgICAgZGVzY3JpcHRpb24gPSB7IHRleHQ6IGRvYy5hbGlhcywgd3JhcDogZGVzY3JpcHRpb24/LndyYXAsIHR5cGUgfTtcbiAgICB9XG4gICAgY29uc3Qgb2xkID0gdGhpcy5zdGF0ZS5yZWNvcmRzLmFjdG9ycy5nZXQoaWQpO1xuICAgIGlmIChvbGQpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLnJlY29yZHMuY3VycmVudEJveCAmJiBvbGQuYm94ICYmIHRoaXMuc3RhdGUucmVjb3Jkcy5jdXJyZW50Qm94ICE9PSBvbGQuYm94KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgQSBzYW1lIHBhcnRpY2lwYW50IHNob3VsZCBvbmx5IGJlIGRlZmluZWQgaW4gb25lIEJveDogJHtvbGQubmFtZX0gY2FuJ3QgYmUgaW4gJyR7b2xkLmJveC5uYW1lfScgYW5kIGluICcke3RoaXMuc3RhdGUucmVjb3Jkcy5jdXJyZW50Qm94Lm5hbWV9JyBhdCB0aGUgc2FtZSB0aW1lLmBcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGFzc2lnbmVkQm94ID0gb2xkLmJveCA/IG9sZC5ib3ggOiB0aGlzLnN0YXRlLnJlY29yZHMuY3VycmVudEJveDtcbiAgICAgIG9sZC5ib3ggPSBhc3NpZ25lZEJveDtcbiAgICAgIGlmIChvbGQgJiYgbmFtZSA9PT0gb2xkLm5hbWUgJiYgZGVzY3JpcHRpb24gPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChkZXNjcmlwdGlvbj8udGV4dCA9PSBudWxsKSB7XG4gICAgICBkZXNjcmlwdGlvbiA9IHsgdGV4dDogbmFtZSwgdHlwZSB9O1xuICAgIH1cbiAgICBpZiAodHlwZSA9PSBudWxsIHx8IGRlc2NyaXB0aW9uLnRleHQgPT0gbnVsbCkge1xuICAgICAgZGVzY3JpcHRpb24gPSB7IHRleHQ6IG5hbWUsIHR5cGUgfTtcbiAgICB9XG4gICAgdGhpcy5zdGF0ZS5yZWNvcmRzLmFjdG9ycy5zZXQoaWQsIHtcbiAgICAgIGJveDogYXNzaWduZWRCb3gsXG4gICAgICBuYW1lLFxuICAgICAgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLnRleHQsXG4gICAgICB3cmFwOiBkZXNjcmlwdGlvbi53cmFwID8/IHRoaXMuYXV0b1dyYXAoKSxcbiAgICAgIHByZXZBY3RvcjogdGhpcy5zdGF0ZS5yZWNvcmRzLnByZXZBY3RvcixcbiAgICAgIGxpbmtzOiB7fSxcbiAgICAgIHByb3BlcnRpZXM6IHt9LFxuICAgICAgYWN0b3JDbnQ6IG51bGwsXG4gICAgICByZWN0RGF0YTogbnVsbCxcbiAgICAgIHR5cGU6IHR5cGUgPz8gXCJwYXJ0aWNpcGFudFwiXG4gICAgfSk7XG4gICAgaWYgKHRoaXMuc3RhdGUucmVjb3Jkcy5wcmV2QWN0b3IpIHtcbiAgICAgIGNvbnN0IHByZXZBY3RvckluUmVjb3JkcyA9IHRoaXMuc3RhdGUucmVjb3Jkcy5hY3RvcnMuZ2V0KHRoaXMuc3RhdGUucmVjb3Jkcy5wcmV2QWN0b3IpO1xuICAgICAgaWYgKHByZXZBY3RvckluUmVjb3Jkcykge1xuICAgICAgICBwcmV2QWN0b3JJblJlY29yZHMubmV4dEFjdG9yID0gaWQ7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLnN0YXRlLnJlY29yZHMuY3VycmVudEJveCkge1xuICAgICAgdGhpcy5zdGF0ZS5yZWNvcmRzLmN1cnJlbnRCb3guYWN0b3JLZXlzLnB1c2goaWQpO1xuICAgIH1cbiAgICB0aGlzLnN0YXRlLnJlY29yZHMucHJldkFjdG9yID0gaWQ7XG4gIH1cbiAgYWN0aXZhdGlvbkNvdW50KHBhcnQpIHtcbiAgICBsZXQgaTtcbiAgICBsZXQgY291bnQgPSAwO1xuICAgIGlmICghcGFydCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnN0YXRlLnJlY29yZHMubWVzc2FnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLnJlY29yZHMubWVzc2FnZXNbaV0udHlwZSA9PT0gdGhpcy5MSU5FVFlQRS5BQ1RJVkVfU1RBUlQgJiYgdGhpcy5zdGF0ZS5yZWNvcmRzLm1lc3NhZ2VzW2ldLmZyb20gPT09IHBhcnQpIHtcbiAgICAgICAgY291bnQrKztcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnN0YXRlLnJlY29yZHMubWVzc2FnZXNbaV0udHlwZSA9PT0gdGhpcy5MSU5FVFlQRS5BQ1RJVkVfRU5EICYmIHRoaXMuc3RhdGUucmVjb3Jkcy5tZXNzYWdlc1tpXS5mcm9tID09PSBwYXJ0KSB7XG4gICAgICAgIGNvdW50LS07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb3VudDtcbiAgfVxuICBhZGRNZXNzYWdlKGlkRnJvbSwgaWRUbywgbWVzc2FnZSwgYW5zd2VyKSB7XG4gICAgdGhpcy5zdGF0ZS5yZWNvcmRzLm1lc3NhZ2VzLnB1c2goe1xuICAgICAgaWQ6IHRoaXMuc3RhdGUucmVjb3Jkcy5tZXNzYWdlcy5sZW5ndGgudG9TdHJpbmcoKSxcbiAgICAgIGZyb206IGlkRnJvbSxcbiAgICAgIHRvOiBpZFRvLFxuICAgICAgbWVzc2FnZTogbWVzc2FnZS50ZXh0LFxuICAgICAgd3JhcDogbWVzc2FnZS53cmFwID8/IHRoaXMuYXV0b1dyYXAoKSxcbiAgICAgIGFuc3dlclxuICAgIH0pO1xuICB9XG4gIGFkZFNpZ25hbChpZEZyb20sIGlkVG8sIG1lc3NhZ2UsIG1lc3NhZ2VUeXBlLCBhY3RpdmF0ZSA9IGZhbHNlLCBjZW50cmFsQ29ubmVjdGlvbikge1xuICAgIGlmIChtZXNzYWdlVHlwZSA9PT0gdGhpcy5MSU5FVFlQRS5BQ1RJVkVfRU5EKSB7XG4gICAgICBjb25zdCBjbnQgPSB0aGlzLmFjdGl2YXRpb25Db3VudChpZEZyb20gPz8gXCJcIik7XG4gICAgICBpZiAoY250IDwgMSkge1xuICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihcIlRyeWluZyB0byBpbmFjdGl2YXRlIGFuIGluYWN0aXZlIHBhcnRpY2lwYW50IChcIiArIGlkRnJvbSArIFwiKVwiKTtcbiAgICAgICAgZXJyb3IuaGFzaCA9IHtcbiAgICAgICAgICB0ZXh0OiBcIi0+Pi1cIixcbiAgICAgICAgICB0b2tlbjogXCItPj4tXCIsXG4gICAgICAgICAgbGluZTogXCIxXCIsXG4gICAgICAgICAgbG9jOiB7IGZpcnN0X2xpbmU6IDEsIGxhc3RfbGluZTogMSwgZmlyc3RfY29sdW1uOiAxLCBsYXN0X2NvbHVtbjogMSB9LFxuICAgICAgICAgIGV4cGVjdGVkOiBbXCInQUNUSVZFX1BBUlRJQ0lQQU5UJ1wiXVxuICAgICAgICB9O1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zdGF0ZS5yZWNvcmRzLm1lc3NhZ2VzLnB1c2goe1xuICAgICAgaWQ6IHRoaXMuc3RhdGUucmVjb3Jkcy5tZXNzYWdlcy5sZW5ndGgudG9TdHJpbmcoKSxcbiAgICAgIGZyb206IGlkRnJvbSxcbiAgICAgIHRvOiBpZFRvLFxuICAgICAgbWVzc2FnZTogbWVzc2FnZT8udGV4dCA/PyBcIlwiLFxuICAgICAgd3JhcDogbWVzc2FnZT8ud3JhcCA/PyB0aGlzLmF1dG9XcmFwKCksXG4gICAgICB0eXBlOiBtZXNzYWdlVHlwZSxcbiAgICAgIGFjdGl2YXRlLFxuICAgICAgY2VudHJhbENvbm5lY3Rpb246IGNlbnRyYWxDb25uZWN0aW9uID8/IDBcbiAgICB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBoYXNBdExlYXN0T25lQm94KCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJlY29yZHMuYm94ZXMubGVuZ3RoID4gMDtcbiAgfVxuICBoYXNBdExlYXN0T25lQm94V2l0aFRpdGxlKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJlY29yZHMuYm94ZXMuc29tZSgoYikgPT4gYi5uYW1lKTtcbiAgfVxuICBnZXRNZXNzYWdlcygpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5yZWNvcmRzLm1lc3NhZ2VzO1xuICB9XG4gIGdldEJveGVzKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJlY29yZHMuYm94ZXM7XG4gIH1cbiAgZ2V0QWN0b3JzKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJlY29yZHMuYWN0b3JzO1xuICB9XG4gIGdldENyZWF0ZWRBY3RvcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucmVjb3Jkcy5jcmVhdGVkQWN0b3JzO1xuICB9XG4gIGdldERlc3Ryb3llZEFjdG9ycygpIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5yZWNvcmRzLmRlc3Ryb3llZEFjdG9ycztcbiAgfVxuICBnZXRBY3RvcihpZCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnJlY29yZHMuYWN0b3JzLmdldChpZCk7XG4gIH1cbiAgZ2V0QWN0b3JLZXlzKCkge1xuICAgIHJldHVybiBbLi4udGhpcy5zdGF0ZS5yZWNvcmRzLmFjdG9ycy5rZXlzKCldO1xuICB9XG4gIGVuYWJsZVNlcXVlbmNlTnVtYmVycygpIHtcbiAgICB0aGlzLnN0YXRlLnJlY29yZHMuc2VxdWVuY2VOdW1iZXJzRW5hYmxlZCA9IHRydWU7XG4gIH1cbiAgZGlzYWJsZVNlcXVlbmNlTnVtYmVycygpIHtcbiAgICB0aGlzLnN0YXRlLnJlY29yZHMuc2VxdWVuY2VOdW1iZXJzRW5hYmxlZCA9IGZhbHNlO1xuICB9XG4gIHNob3dTZXF1ZW5jZU51bWJlcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUucmVjb3Jkcy5zZXF1ZW5jZU51bWJlcnNFbmFibGVkO1xuICB9XG4gIHNldFdyYXAod3JhcFNldHRpbmcpIHtcbiAgICB0aGlzLnN0YXRlLnJlY29yZHMud3JhcEVuYWJsZWQgPSB3cmFwU2V0dGluZztcbiAgfVxuICBleHRyYWN0V3JhcCh0ZXh0KSB7XG4gICAgaWYgKHRleHQgPT09IHZvaWQgMCkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICB0ZXh0ID0gdGV4dC50cmltKCk7XG4gICAgY29uc3Qgd3JhcCA9IC9eOj93cmFwOi8uZXhlYyh0ZXh0KSAhPT0gbnVsbCA/IHRydWUgOiAvXjo/bm93cmFwOi8uZXhlYyh0ZXh0KSAhPT0gbnVsbCA/IGZhbHNlIDogdm9pZCAwO1xuICAgIGNvbnN0IGNsZWFuZWRUZXh0ID0gKHdyYXAgPT09IHZvaWQgMCA/IHRleHQgOiB0ZXh0LnJlcGxhY2UoL146Pyg/Om5vKT93cmFwOi8sIFwiXCIpKS50cmltKCk7XG4gICAgcmV0dXJuIHsgY2xlYW5lZFRleHQsIHdyYXAgfTtcbiAgfVxuICBhdXRvV3JhcCgpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5yZWNvcmRzLndyYXBFbmFibGVkICE9PSB2b2lkIDApIHtcbiAgICAgIHJldHVybiB0aGlzLnN0YXRlLnJlY29yZHMud3JhcEVuYWJsZWQ7XG4gICAgfVxuICAgIHJldHVybiBnZXRDb25maWcyKCkuc2VxdWVuY2U/LndyYXAgPz8gZmFsc2U7XG4gIH1cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5zdGF0ZS5yZXNldCgpO1xuICAgIGNsZWFyKCk7XG4gIH1cbiAgcGFyc2VNZXNzYWdlKHN0cikge1xuICAgIGNvbnN0IHRyaW1tZWRTdHIgPSBzdHIudHJpbSgpO1xuICAgIGNvbnN0IHsgd3JhcCwgY2xlYW5lZFRleHQgfSA9IHRoaXMuZXh0cmFjdFdyYXAodHJpbW1lZFN0cik7XG4gICAgY29uc3QgbWVzc2FnZSA9IHtcbiAgICAgIHRleHQ6IGNsZWFuZWRUZXh0LFxuICAgICAgd3JhcFxuICAgIH07XG4gICAgbG9nLmRlYnVnKGBwYXJzZU1lc3NhZ2U6ICR7SlNPTi5zdHJpbmdpZnkobWVzc2FnZSl9YCk7XG4gICAgcmV0dXJuIG1lc3NhZ2U7XG4gIH1cbiAgLy8gV2UgZXhwZWN0IHRoZSBib3ggc3RhdGVtZW50IHRvIGJlIGNvbG9yIGZpcnN0IHRoZW4gZGVzY3JpcHRpb25cbiAgLy8gVGhlIGNvbG9yIGNhbiBiZSByZ2IscmdiYSxoc2wsaHNsYSwgb3IgY3NzIGNvZGUgbmFtZXMgICNoZXggY29kZXMgYXJlIG5vdCBzdXBwb3J0ZWQgZm9yIG5vdyBiZWNhdXNlIG9mIHRoZSB3YXkgdGhlIGNoYXIgIyBpcyBoYW5kbGVkXG4gIC8vIFdlIGV4dHJhY3QgZmlyc3Qgc2VnbWVudCBhcyBjb2xvciwgdGhlIHJlc3Qgb2YgdGhlIGxpbmUgaXMgY29uc2lkZXJlZCBhcyB0ZXh0XG4gIHBhcnNlQm94RGF0YShzdHIpIHtcbiAgICBjb25zdCBtYXRjaCA9IC9eKCg/OnJnYmE/fGhzbGE/KVxccypcXCguKlxcKXxcXHcqKSguKikkLy5leGVjKHN0cik7XG4gICAgbGV0IGNvbG9yID0gbWF0Y2g/LlsxXSA/IG1hdGNoWzFdLnRyaW0oKSA6IFwidHJhbnNwYXJlbnRcIjtcbiAgICBsZXQgdGl0bGUgPSBtYXRjaD8uWzJdID8gbWF0Y2hbMl0udHJpbSgpIDogdm9pZCAwO1xuICAgIGlmICh3aW5kb3c/LkNTUykge1xuICAgICAgaWYgKCF3aW5kb3cuQ1NTLnN1cHBvcnRzKFwiY29sb3JcIiwgY29sb3IpKSB7XG4gICAgICAgIGNvbG9yID0gXCJ0cmFuc3BhcmVudFwiO1xuICAgICAgICB0aXRsZSA9IHN0ci50cmltKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHN0eWxlID0gbmV3IE9wdGlvbigpLnN0eWxlO1xuICAgICAgc3R5bGUuY29sb3IgPSBjb2xvcjtcbiAgICAgIGlmIChzdHlsZS5jb2xvciAhPT0gY29sb3IpIHtcbiAgICAgICAgY29sb3IgPSBcInRyYW5zcGFyZW50XCI7XG4gICAgICAgIHRpdGxlID0gc3RyLnRyaW0oKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgeyB3cmFwLCBjbGVhbmVkVGV4dCB9ID0gdGhpcy5leHRyYWN0V3JhcCh0aXRsZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRleHQ6IGNsZWFuZWRUZXh0ID8gc2FuaXRpemVUZXh0KGNsZWFuZWRUZXh0LCBnZXRDb25maWcyKCkpIDogdm9pZCAwLFxuICAgICAgY29sb3IsXG4gICAgICB3cmFwXG4gICAgfTtcbiAgfVxuICBhZGROb3RlKGFjdG9yLCBwbGFjZW1lbnQsIG1lc3NhZ2UpIHtcbiAgICBjb25zdCBub3RlID0ge1xuICAgICAgYWN0b3IsXG4gICAgICBwbGFjZW1lbnQsXG4gICAgICBtZXNzYWdlOiBtZXNzYWdlLnRleHQsXG4gICAgICB3cmFwOiBtZXNzYWdlLndyYXAgPz8gdGhpcy5hdXRvV3JhcCgpXG4gICAgfTtcbiAgICBjb25zdCBhY3RvcnMgPSBbXS5jb25jYXQoYWN0b3IsIGFjdG9yKTtcbiAgICB0aGlzLnN0YXRlLnJlY29yZHMubm90ZXMucHVzaChub3RlKTtcbiAgICB0aGlzLnN0YXRlLnJlY29yZHMubWVzc2FnZXMucHVzaCh7XG4gICAgICBpZDogdGhpcy5zdGF0ZS5yZWNvcmRzLm1lc3NhZ2VzLmxlbmd0aC50b1N0cmluZygpLFxuICAgICAgZnJvbTogYWN0b3JzWzBdLFxuICAgICAgdG86IGFjdG9yc1sxXSxcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UudGV4dCxcbiAgICAgIHdyYXA6IG1lc3NhZ2Uud3JhcCA/PyB0aGlzLmF1dG9XcmFwKCksXG4gICAgICB0eXBlOiB0aGlzLkxJTkVUWVBFLk5PVEUsXG4gICAgICBwbGFjZW1lbnRcbiAgICB9KTtcbiAgfVxuICBhZGRMaW5rcyhhY3RvcklkLCB0ZXh0KSB7XG4gICAgY29uc3QgYWN0b3IgPSB0aGlzLmdldEFjdG9yKGFjdG9ySWQpO1xuICAgIHRyeSB7XG4gICAgICBsZXQgc2FuaXRpemVkVGV4dCA9IHNhbml0aXplVGV4dCh0ZXh0LnRleHQsIGdldENvbmZpZzIoKSk7XG4gICAgICBzYW5pdGl6ZWRUZXh0ID0gc2FuaXRpemVkVGV4dC5yZXBsYWNlKC8mZXF1YWxzOy9nLCBcIj1cIik7XG4gICAgICBzYW5pdGl6ZWRUZXh0ID0gc2FuaXRpemVkVGV4dC5yZXBsYWNlKC8mYW1wOy9nLCBcIiZcIik7XG4gICAgICBjb25zdCBsaW5rcyA9IEpTT04ucGFyc2Uoc2FuaXRpemVkVGV4dCk7XG4gICAgICB0aGlzLmluc2VydExpbmtzKGFjdG9yLCBsaW5rcyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nLmVycm9yKFwiZXJyb3Igd2hpbGUgcGFyc2luZyBhY3RvciBsaW5rIHRleHRcIiwgZSk7XG4gICAgfVxuICB9XG4gIGFkZEFMaW5rKGFjdG9ySWQsIHRleHQpIHtcbiAgICBjb25zdCBhY3RvciA9IHRoaXMuZ2V0QWN0b3IoYWN0b3JJZCk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGxpbmtzID0ge307XG4gICAgICBsZXQgc2FuaXRpemVkVGV4dCA9IHNhbml0aXplVGV4dCh0ZXh0LnRleHQsIGdldENvbmZpZzIoKSk7XG4gICAgICBjb25zdCBzZXAgPSBzYW5pdGl6ZWRUZXh0LmluZGV4T2YoXCJAXCIpO1xuICAgICAgc2FuaXRpemVkVGV4dCA9IHNhbml0aXplZFRleHQucmVwbGFjZSgvJmVxdWFsczsvZywgXCI9XCIpO1xuICAgICAgc2FuaXRpemVkVGV4dCA9IHNhbml0aXplZFRleHQucmVwbGFjZSgvJmFtcDsvZywgXCImXCIpO1xuICAgICAgY29uc3QgbGFiZWwgPSBzYW5pdGl6ZWRUZXh0LnNsaWNlKDAsIHNlcCAtIDEpLnRyaW0oKTtcbiAgICAgIGNvbnN0IGxpbmsgPSBzYW5pdGl6ZWRUZXh0LnNsaWNlKHNlcCArIDEpLnRyaW0oKTtcbiAgICAgIGxpbmtzW2xhYmVsXSA9IGxpbms7XG4gICAgICB0aGlzLmluc2VydExpbmtzKGFjdG9yLCBsaW5rcyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nLmVycm9yKFwiZXJyb3Igd2hpbGUgcGFyc2luZyBhY3RvciBsaW5rIHRleHRcIiwgZSk7XG4gICAgfVxuICB9XG4gIGluc2VydExpbmtzKGFjdG9yLCBsaW5rcykge1xuICAgIGlmIChhY3Rvci5saW5rcyA9PSBudWxsKSB7XG4gICAgICBhY3Rvci5saW5rcyA9IGxpbmtzO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGNvbnN0IGtleSBpbiBsaW5rcykge1xuICAgICAgICBhY3Rvci5saW5rc1trZXldID0gbGlua3Nba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgYWRkUHJvcGVydGllcyhhY3RvcklkLCB0ZXh0KSB7XG4gICAgY29uc3QgYWN0b3IgPSB0aGlzLmdldEFjdG9yKGFjdG9ySWQpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBzYW5pdGl6ZWRUZXh0ID0gc2FuaXRpemVUZXh0KHRleHQudGV4dCwgZ2V0Q29uZmlnMigpKTtcbiAgICAgIGNvbnN0IHByb3BlcnRpZXMgPSBKU09OLnBhcnNlKHNhbml0aXplZFRleHQpO1xuICAgICAgdGhpcy5pbnNlcnRQcm9wZXJ0aWVzKGFjdG9yLCBwcm9wZXJ0aWVzKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBsb2cuZXJyb3IoXCJlcnJvciB3aGlsZSBwYXJzaW5nIGFjdG9yIHByb3BlcnRpZXMgdGV4dFwiLCBlKTtcbiAgICB9XG4gIH1cbiAgaW5zZXJ0UHJvcGVydGllcyhhY3RvciwgcHJvcGVydGllcykge1xuICAgIGlmIChhY3Rvci5wcm9wZXJ0aWVzID09IG51bGwpIHtcbiAgICAgIGFjdG9yLnByb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKGNvbnN0IGtleSBpbiBwcm9wZXJ0aWVzKSB7XG4gICAgICAgIGFjdG9yLnByb3BlcnRpZXNba2V5XSA9IHByb3BlcnRpZXNba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgYm94RW5kKCkge1xuICAgIHRoaXMuc3RhdGUucmVjb3Jkcy5jdXJyZW50Qm94ID0gdm9pZCAwO1xuICB9XG4gIGFkZERldGFpbHMoYWN0b3JJZCwgdGV4dCkge1xuICAgIGNvbnN0IGFjdG9yID0gdGhpcy5nZXRBY3RvcihhY3RvcklkKTtcbiAgICBjb25zdCBlbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGV4dC50ZXh0KTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdGV4dDIgPSBlbGVtLmlubmVySFRNTDtcbiAgICAgIGNvbnN0IGRldGFpbHMgPSBKU09OLnBhcnNlKHRleHQyKTtcbiAgICAgIGlmIChkZXRhaWxzLnByb3BlcnRpZXMpIHtcbiAgICAgICAgdGhpcy5pbnNlcnRQcm9wZXJ0aWVzKGFjdG9yLCBkZXRhaWxzLnByb3BlcnRpZXMpO1xuICAgICAgfVxuICAgICAgaWYgKGRldGFpbHMubGlua3MpIHtcbiAgICAgICAgdGhpcy5pbnNlcnRMaW5rcyhhY3RvciwgZGV0YWlscy5saW5rcyk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nLmVycm9yKFwiZXJyb3Igd2hpbGUgcGFyc2luZyBhY3RvciBkZXRhaWxzIHRleHRcIiwgZSk7XG4gICAgfVxuICB9XG4gIGdldEFjdG9yUHJvcGVydHkoYWN0b3IsIGtleSkge1xuICAgIGlmIChhY3Rvcj8ucHJvcGVydGllcyAhPT0gdm9pZCAwKSB7XG4gICAgICByZXR1cm4gYWN0b3IucHJvcGVydGllc1trZXldO1xuICAgIH1cbiAgICByZXR1cm4gdm9pZCAwO1xuICB9XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55LCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVkdW5kYW50LXR5cGUtY29uc3RpdHVlbnRzXG4gIGFwcGx5KHBhcmFtKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocGFyYW0pKSB7XG4gICAgICBwYXJhbS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIHRoaXMuYXBwbHkoaXRlbSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3dpdGNoIChwYXJhbS50eXBlKSB7XG4gICAgICAgIGNhc2UgXCJzZXF1ZW5jZUluZGV4XCI6XG4gICAgICAgICAgdGhpcy5zdGF0ZS5yZWNvcmRzLm1lc3NhZ2VzLnB1c2goe1xuICAgICAgICAgICAgaWQ6IHRoaXMuc3RhdGUucmVjb3Jkcy5tZXNzYWdlcy5sZW5ndGgudG9TdHJpbmcoKSxcbiAgICAgICAgICAgIGZyb206IHZvaWQgMCxcbiAgICAgICAgICAgIHRvOiB2b2lkIDAsXG4gICAgICAgICAgICBtZXNzYWdlOiB7XG4gICAgICAgICAgICAgIHN0YXJ0OiBwYXJhbS5zZXF1ZW5jZUluZGV4LFxuICAgICAgICAgICAgICBzdGVwOiBwYXJhbS5zZXF1ZW5jZUluZGV4U3RlcCxcbiAgICAgICAgICAgICAgdmlzaWJsZTogcGFyYW0uc2VxdWVuY2VWaXNpYmxlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd3JhcDogZmFsc2UsXG4gICAgICAgICAgICB0eXBlOiBwYXJhbS5zaWduYWxUeXBlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJhZGRQYXJ0aWNpcGFudFwiOlxuICAgICAgICAgIHRoaXMuYWRkQWN0b3IocGFyYW0uYWN0b3IsIHBhcmFtLmFjdG9yLCBwYXJhbS5kZXNjcmlwdGlvbiwgcGFyYW0uZHJhdywgcGFyYW0uY29uZmlnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImNyZWF0ZVBhcnRpY2lwYW50XCI6XG4gICAgICAgICAgaWYgKHRoaXMuc3RhdGUucmVjb3Jkcy5hY3RvcnMuaGFzKHBhcmFtLmFjdG9yKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICBcIkl0IGlzIG5vdCBwb3NzaWJsZSB0byBoYXZlIGFjdG9ycyB3aXRoIHRoZSBzYW1lIGlkLCBldmVuIGlmIG9uZSBpcyBkZXN0cm95ZWQgYmVmb3JlIHRoZSBuZXh0IGlzIGNyZWF0ZWQuIFVzZSAnQVMnIGFsaWFzZXMgdG8gc2ltdWxhdGUgdGhlIGJlaGF2aW9yXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc3RhdGUucmVjb3Jkcy5sYXN0Q3JlYXRlZCA9IHBhcmFtLmFjdG9yO1xuICAgICAgICAgIHRoaXMuYWRkQWN0b3IocGFyYW0uYWN0b3IsIHBhcmFtLmFjdG9yLCBwYXJhbS5kZXNjcmlwdGlvbiwgcGFyYW0uZHJhdywgcGFyYW0uY29uZmlnKTtcbiAgICAgICAgICB0aGlzLnN0YXRlLnJlY29yZHMuY3JlYXRlZEFjdG9ycy5zZXQocGFyYW0uYWN0b3IsIHRoaXMuc3RhdGUucmVjb3Jkcy5tZXNzYWdlcy5sZW5ndGgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZGVzdHJveVBhcnRpY2lwYW50XCI6XG4gICAgICAgICAgdGhpcy5zdGF0ZS5yZWNvcmRzLmxhc3REZXN0cm95ZWQgPSBwYXJhbS5hY3RvcjtcbiAgICAgICAgICB0aGlzLnN0YXRlLnJlY29yZHMuZGVzdHJveWVkQWN0b3JzLnNldChwYXJhbS5hY3RvciwgdGhpcy5zdGF0ZS5yZWNvcmRzLm1lc3NhZ2VzLmxlbmd0aCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJhY3RpdmVTdGFydFwiOlxuICAgICAgICAgIHRoaXMuYWRkU2lnbmFsKHBhcmFtLmFjdG9yLCB2b2lkIDAsIHZvaWQgMCwgcGFyYW0uc2lnbmFsVHlwZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJjZW50cmFsQ29ubmVjdGlvblwiOlxuICAgICAgICAgIHRoaXMuYWRkU2lnbmFsKHBhcmFtLmFjdG9yLCB2b2lkIDAsIHZvaWQgMCwgcGFyYW0uc2lnbmFsVHlwZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJjZW50cmFsQ29ubmVjdGlvblJldmVyc2VcIjpcbiAgICAgICAgICB0aGlzLmFkZFNpZ25hbChwYXJhbS5hY3Rvciwgdm9pZCAwLCB2b2lkIDAsIHBhcmFtLnNpZ25hbFR5cGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiYWN0aXZlRW5kXCI6XG4gICAgICAgICAgdGhpcy5hZGRTaWduYWwocGFyYW0uYWN0b3IsIHZvaWQgMCwgdm9pZCAwLCBwYXJhbS5zaWduYWxUeXBlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImFkZE5vdGVcIjpcbiAgICAgICAgICB0aGlzLmFkZE5vdGUocGFyYW0uYWN0b3IsIHBhcmFtLnBsYWNlbWVudCwgcGFyYW0udGV4dCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJhZGRMaW5rc1wiOlxuICAgICAgICAgIHRoaXMuYWRkTGlua3MocGFyYW0uYWN0b3IsIHBhcmFtLnRleHQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiYWRkQUxpbmtcIjpcbiAgICAgICAgICB0aGlzLmFkZEFMaW5rKHBhcmFtLmFjdG9yLCBwYXJhbS50ZXh0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImFkZFByb3BlcnRpZXNcIjpcbiAgICAgICAgICB0aGlzLmFkZFByb3BlcnRpZXMocGFyYW0uYWN0b3IsIHBhcmFtLnRleHQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiYWRkRGV0YWlsc1wiOlxuICAgICAgICAgIHRoaXMuYWRkRGV0YWlscyhwYXJhbS5hY3RvciwgcGFyYW0udGV4dCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJhZGRNZXNzYWdlXCI6XG4gICAgICAgICAgaWYgKHRoaXMuc3RhdGUucmVjb3Jkcy5sYXN0Q3JlYXRlZCkge1xuICAgICAgICAgICAgaWYgKHBhcmFtLnRvICE9PSB0aGlzLnN0YXRlLnJlY29yZHMubGFzdENyZWF0ZWQpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgIFwiVGhlIGNyZWF0ZWQgcGFydGljaXBhbnQgXCIgKyB0aGlzLnN0YXRlLnJlY29yZHMubGFzdENyZWF0ZWQubmFtZSArIFwiIGRvZXMgbm90IGhhdmUgYW4gYXNzb2NpYXRlZCBjcmVhdGluZyBtZXNzYWdlIGFmdGVyIGl0cyBkZWNsYXJhdGlvbi4gUGxlYXNlIGNoZWNrIHRoZSBzZXF1ZW5jZSBkaWFncmFtLlwiXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLnN0YXRlLnJlY29yZHMubGFzdENyZWF0ZWQgPSB2b2lkIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnJlY29yZHMubGFzdERlc3Ryb3llZCkge1xuICAgICAgICAgICAgaWYgKHBhcmFtLnRvICE9PSB0aGlzLnN0YXRlLnJlY29yZHMubGFzdERlc3Ryb3llZCAmJiBwYXJhbS5mcm9tICE9PSB0aGlzLnN0YXRlLnJlY29yZHMubGFzdERlc3Ryb3llZCkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgXCJUaGUgZGVzdHJveWVkIHBhcnRpY2lwYW50IFwiICsgdGhpcy5zdGF0ZS5yZWNvcmRzLmxhc3REZXN0cm95ZWQubmFtZSArIFwiIGRvZXMgbm90IGhhdmUgYW4gYXNzb2NpYXRlZCBkZXN0cm95aW5nIG1lc3NhZ2UgYWZ0ZXIgaXRzIGRlY2xhcmF0aW9uLiBQbGVhc2UgY2hlY2sgdGhlIHNlcXVlbmNlIGRpYWdyYW0uXCJcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuc3RhdGUucmVjb3Jkcy5sYXN0RGVzdHJveWVkID0gdm9pZCAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmFkZFNpZ25hbChcbiAgICAgICAgICAgIHBhcmFtLmZyb20sXG4gICAgICAgICAgICBwYXJhbS50byxcbiAgICAgICAgICAgIHBhcmFtLm1zZyxcbiAgICAgICAgICAgIHBhcmFtLnNpZ25hbFR5cGUsXG4gICAgICAgICAgICBwYXJhbS5hY3RpdmF0ZSxcbiAgICAgICAgICAgIHBhcmFtLmNlbnRyYWxDb25uZWN0aW9uXG4gICAgICAgICAgKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImJveFN0YXJ0XCI6XG4gICAgICAgICAgdGhpcy5hZGRCb3gocGFyYW0uYm94RGF0YSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJib3hFbmRcIjpcbiAgICAgICAgICB0aGlzLmJveEVuZCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibG9vcFN0YXJ0XCI6XG4gICAgICAgICAgdGhpcy5hZGRTaWduYWwodm9pZCAwLCB2b2lkIDAsIHBhcmFtLmxvb3BUZXh0LCBwYXJhbS5zaWduYWxUeXBlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImxvb3BFbmRcIjpcbiAgICAgICAgICB0aGlzLmFkZFNpZ25hbCh2b2lkIDAsIHZvaWQgMCwgdm9pZCAwLCBwYXJhbS5zaWduYWxUeXBlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInJlY3RTdGFydFwiOlxuICAgICAgICAgIHRoaXMuYWRkU2lnbmFsKHZvaWQgMCwgdm9pZCAwLCBwYXJhbS5jb2xvciwgcGFyYW0uc2lnbmFsVHlwZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJyZWN0RW5kXCI6XG4gICAgICAgICAgdGhpcy5hZGRTaWduYWwodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgcGFyYW0uc2lnbmFsVHlwZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJvcHRTdGFydFwiOlxuICAgICAgICAgIHRoaXMuYWRkU2lnbmFsKHZvaWQgMCwgdm9pZCAwLCBwYXJhbS5vcHRUZXh0LCBwYXJhbS5zaWduYWxUeXBlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIm9wdEVuZFwiOlxuICAgICAgICAgIHRoaXMuYWRkU2lnbmFsKHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsIHBhcmFtLnNpZ25hbFR5cGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiYWx0U3RhcnRcIjpcbiAgICAgICAgICB0aGlzLmFkZFNpZ25hbCh2b2lkIDAsIHZvaWQgMCwgcGFyYW0uYWx0VGV4dCwgcGFyYW0uc2lnbmFsVHlwZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJlbHNlXCI6XG4gICAgICAgICAgdGhpcy5hZGRTaWduYWwodm9pZCAwLCB2b2lkIDAsIHBhcmFtLmFsdFRleHQsIHBhcmFtLnNpZ25hbFR5cGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiYWx0RW5kXCI6XG4gICAgICAgICAgdGhpcy5hZGRTaWduYWwodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgcGFyYW0uc2lnbmFsVHlwZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJzZXRBY2NUaXRsZVwiOlxuICAgICAgICAgIHNldEFjY1RpdGxlKHBhcmFtLnRleHQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwicGFyU3RhcnRcIjpcbiAgICAgICAgICB0aGlzLmFkZFNpZ25hbCh2b2lkIDAsIHZvaWQgMCwgcGFyYW0ucGFyVGV4dCwgcGFyYW0uc2lnbmFsVHlwZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJhbmRcIjpcbiAgICAgICAgICB0aGlzLmFkZFNpZ25hbCh2b2lkIDAsIHZvaWQgMCwgcGFyYW0ucGFyVGV4dCwgcGFyYW0uc2lnbmFsVHlwZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJwYXJFbmRcIjpcbiAgICAgICAgICB0aGlzLmFkZFNpZ25hbCh2b2lkIDAsIHZvaWQgMCwgdm9pZCAwLCBwYXJhbS5zaWduYWxUeXBlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImNyaXRpY2FsU3RhcnRcIjpcbiAgICAgICAgICB0aGlzLmFkZFNpZ25hbCh2b2lkIDAsIHZvaWQgMCwgcGFyYW0uY3JpdGljYWxUZXh0LCBwYXJhbS5zaWduYWxUeXBlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIm9wdGlvblwiOlxuICAgICAgICAgIHRoaXMuYWRkU2lnbmFsKHZvaWQgMCwgdm9pZCAwLCBwYXJhbS5vcHRpb25UZXh0LCBwYXJhbS5zaWduYWxUeXBlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImNyaXRpY2FsRW5kXCI6XG4gICAgICAgICAgdGhpcy5hZGRTaWduYWwodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgcGFyYW0uc2lnbmFsVHlwZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJicmVha1N0YXJ0XCI6XG4gICAgICAgICAgdGhpcy5hZGRTaWduYWwodm9pZCAwLCB2b2lkIDAsIHBhcmFtLmJyZWFrVGV4dCwgcGFyYW0uc2lnbmFsVHlwZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJicmVha0VuZFwiOlxuICAgICAgICAgIHRoaXMuYWRkU2lnbmFsKHZvaWQgMCwgdm9pZCAwLCB2b2lkIDAsIHBhcmFtLnNpZ25hbFR5cGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBnZXRDb25maWcoKSB7XG4gICAgcmV0dXJuIGdldENvbmZpZzIoKS5zZXF1ZW5jZTtcbiAgfVxufTtcblxuLy8gc3JjL2RpYWdyYW1zL3NlcXVlbmNlL3N0eWxlcy5qc1xudmFyIGdldFN0eWxlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKG9wdGlvbnMpID0+IHtcbiAgY29uc3QgZHJvcFNoYWRvdyA9IG9wdGlvbnMuZHJvcFNoYWRvdyA/PyBcIm5vbmVcIjtcbiAgY29uc3QgeyBsb29rIH0gPSBnZXRDb25maWcyKCk7XG4gIHJldHVybiBgLmFjdG9yIHtcbiAgICBzdHJva2U6ICR7b3B0aW9ucy5hY3RvckJvcmRlcn07XG4gICAgZmlsbDogJHtvcHRpb25zLmFjdG9yQmtnfTtcbiAgICBzdHJva2Utd2lkdGg6ICR7b3B0aW9ucy5zdHJva2VXaWR0aCA/PyAxfTtcbiAgfVxuXG4gIHJlY3QuYWN0b3Iub3V0ZXItcGF0aFtkYXRhLWxvb2s9XCJuZW9cIl0ge1xuICAgICAgZmlsdGVyOiAke2Ryb3BTaGFkb3d9O1xuICB9XG5cbiAgcmVjdC5ub3RlW2RhdGEtbG9vaz1cIm5lb1wiXSB7XG4gICAgICBzdHJva2U6JHtvcHRpb25zLm5vdGVCb3JkZXJDb2xvcn07XG4gICAgICBmaWxsOiR7b3B0aW9ucy5ub3RlQmtnQ29sb3J9O1xuICAgICAgZmlsdGVyOiAke2Ryb3BTaGFkb3d9O1xuICB9XG5cbiAgdGV4dC5hY3RvciA+IHRzcGFuIHtcbiAgICBmaWxsOiAke29wdGlvbnMuYWN0b3JUZXh0Q29sb3J9O1xuICAgIHN0cm9rZTogbm9uZTtcbiAgfVxuXG4gIC5hY3Rvci1saW5lIHtcbiAgICBzdHJva2U6ICR7b3B0aW9ucy5hY3RvckxpbmVDb2xvcn07XG4gIH1cblxuICAuaW5uZXJBcmMge1xuICAgIHN0cm9rZS13aWR0aDogMS41O1xuICAgIHN0cm9rZS1kYXNoYXJyYXk6IG5vbmU7XG4gIH1cblxuICAubWVzc2FnZUxpbmUwIHtcbiAgICBzdHJva2Utd2lkdGg6IDEuNTtcbiAgICBzdHJva2UtZGFzaGFycmF5OiBub25lO1xuICAgIHN0cm9rZTogJHtvcHRpb25zLnNpZ25hbENvbG9yfTtcbiAgfVxuXG4gIC5tZXNzYWdlTGluZTEge1xuICAgIHN0cm9rZS13aWR0aDogMS41O1xuICAgIHN0cm9rZS1kYXNoYXJyYXk6IDIsIDI7XG4gICAgc3Ryb2tlOiAke29wdGlvbnMuc2lnbmFsQ29sb3J9O1xuICB9XG5cbiAgW2lkJD1cIi1hcnJvd2hlYWRcIl0gcGF0aCB7XG4gICAgZmlsbDogJHtvcHRpb25zLnNpZ25hbENvbG9yfTtcbiAgICBzdHJva2U6ICR7b3B0aW9ucy5zaWduYWxDb2xvcn07XG4gIH1cblxuICAuc2VxdWVuY2VOdW1iZXIge1xuICAgIGZpbGw6ICR7b3B0aW9ucy5zZXF1ZW5jZU51bWJlckNvbG9yfTtcbiAgfVxuXG4gIFtpZCQ9XCItc2VxdWVuY2VudW1iZXJcIl0ge1xuICAgIGZpbGw6ICR7b3B0aW9ucy5zaWduYWxDb2xvcn07XG4gIH1cblxuICBbaWQkPVwiLWNyb3NzaGVhZFwiXSBwYXRoIHtcbiAgICBmaWxsOiAke29wdGlvbnMuc2lnbmFsQ29sb3J9O1xuICAgIHN0cm9rZTogJHtvcHRpb25zLnNpZ25hbENvbG9yfTtcbiAgfVxuXG4gIC5tZXNzYWdlVGV4dCB7XG4gICAgZmlsbDogJHtvcHRpb25zLnNpZ25hbFRleHRDb2xvcn07XG4gICAgc3Ryb2tlOiBub25lO1xuICB9XG5cbiAgLmxhYmVsQm94IHtcbiAgICBzdHJva2U6ICR7b3B0aW9ucy5sYWJlbEJveEJvcmRlckNvbG9yfTtcbiAgICBmaWxsOiAke29wdGlvbnMubGFiZWxCb3hCa2dDb2xvcn07XG4gICAgZmlsdGVyOiAke2xvb2sgPT09IFwibmVvXCIgPyBkcm9wU2hhZG93IDogXCJub25lXCJ9O1xuICB9XG5cbiAgLmxhYmVsVGV4dCwgLmxhYmVsVGV4dCA+IHRzcGFuIHtcbiAgICBmaWxsOiAke29wdGlvbnMubGFiZWxUZXh0Q29sb3J9O1xuICAgIHN0cm9rZTogbm9uZTtcbiAgfVxuXG4gIC5sb29wVGV4dCwgLmxvb3BUZXh0ID4gdHNwYW4ge1xuICAgIGZpbGw6ICR7b3B0aW9ucy5sb29wVGV4dENvbG9yfTtcbiAgICBzdHJva2U6IG5vbmU7XG4gIH1cblxuICAuc2VjdGlvblRpdGxlLCAuc2VjdGlvblRpdGxlID4gdHNwYW4ge1xuICAgIGZpbGw6ICR7b3B0aW9ucy5sb29wVGV4dENvbG9yfTtcbiAgICBzdHJva2U6IG5vbmU7XG4gIH1cblxuICAubG9vcExpbmUge1xuICAgIHN0cm9rZS13aWR0aDogMnB4O1xuICAgIHN0cm9rZS1kYXNoYXJyYXk6IDIsIDI7XG4gICAgc3Ryb2tlOiAke29wdGlvbnMubGFiZWxCb3hCb3JkZXJDb2xvcn07XG4gICAgZmlsbDogJHtvcHRpb25zLmxhYmVsQm94Qm9yZGVyQ29sb3J9O1xuICB9XG5cbiAgLm5vdGUge1xuICAgIC8vc3Ryb2tlOiAjZGVjYzkzO1xuICAgIHN0cm9rZTogJHtvcHRpb25zLm5vdGVCb3JkZXJDb2xvcn07XG4gICAgZmlsbDogJHtvcHRpb25zLm5vdGVCa2dDb2xvcn07XG4gIH1cblxuICAubm90ZVRleHQsIC5ub3RlVGV4dCA+IHRzcGFuIHtcbiAgICBmaWxsOiAke29wdGlvbnMubm90ZVRleHRDb2xvcn07XG4gICAgc3Ryb2tlOiBub25lO1xuICAgICR7b3B0aW9ucy5ub3RlRm9udFdlaWdodCA/IGBmb250LXdlaWdodDogJHtvcHRpb25zLm5vdGVGb250V2VpZ2h0fTtgIDogXCJcIn1cbiAgfVxuXG4gIC5hY3RpdmF0aW9uMCB7XG4gICAgZmlsbDogJHtvcHRpb25zLmFjdGl2YXRpb25Ca2dDb2xvcn07XG4gICAgc3Ryb2tlOiAke29wdGlvbnMuYWN0aXZhdGlvbkJvcmRlckNvbG9yfTtcbiAgfVxuXG4gIC5hY3RpdmF0aW9uMSB7XG4gICAgZmlsbDogJHtvcHRpb25zLmFjdGl2YXRpb25Ca2dDb2xvcn07XG4gICAgc3Ryb2tlOiAke29wdGlvbnMuYWN0aXZhdGlvbkJvcmRlckNvbG9yfTtcbiAgfVxuXG4gIC5hY3RpdmF0aW9uMiB7XG4gICAgZmlsbDogJHtvcHRpb25zLmFjdGl2YXRpb25Ca2dDb2xvcn07XG4gICAgc3Ryb2tlOiAke29wdGlvbnMuYWN0aXZhdGlvbkJvcmRlckNvbG9yfTtcbiAgfVxuXG4gIC5hY3RvclBvcHVwTWVudSB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICB9XG5cbiAgLmFjdG9yUG9wdXBNZW51UGFuZWwge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBmaWxsOiAke29wdGlvbnMuYWN0b3JCa2d9O1xuICAgIGJveC1zaGFkb3c6IDBweCA4cHggMTZweCAwcHggcmdiYSgwLDAsMCwwLjIpO1xuICAgIGZpbHRlcjogZHJvcC1zaGFkb3coM3B4IDVweCAycHggcmdiKDAgMCAwIC8gMC40KSk7XG59XG4gIC5hY3Rvci1tYW4gY2lyY2xlLCBsaW5lIHtcbiAgICBmaWxsOiAke29wdGlvbnMuYWN0b3JCa2d9O1xuICAgIHN0cm9rZS13aWR0aDogMnB4O1xuICB9XG5cbiAgZyByZWN0LnJlY3Qge1xuICAgIGZpbHRlcjogJHtkcm9wU2hhZG93fTtcbiAgICBzdHJva2U6ICR7b3B0aW9ucy5ub2RlQm9yZGVyfTtcbiAgfVxuYDtcbn0sIFwiZ2V0U3R5bGVzXCIpO1xudmFyIHN0eWxlc19kZWZhdWx0ID0gZ2V0U3R5bGVzO1xuXG4vLyBzcmMvZGlhZ3JhbXMvc2VxdWVuY2Uvc2VxdWVuY2VSZW5kZXJlci50c1xuaW1wb3J0IHsgc2VsZWN0IH0gZnJvbSBcImQzXCI7XG5cbi8vIHNyYy9kaWFncmFtcy9zZXF1ZW5jZS9zdmdEcmF3LmpzXG5pbXBvcnQgeyBzYW5pdGl6ZVVybCB9IGZyb20gXCJAYnJhaW50cmVlL3Nhbml0aXplLXVybFwiO1xudmFyIEFDVE9SX1RZUEVfV0lEVEggPSAxOCAqIDI7XG52YXIgVE9QX0FDVE9SX0NMQVNTID0gXCJhY3Rvci10b3BcIjtcbnZhciBCT1RUT01fQUNUT1JfQ0xBU1MgPSBcImFjdG9yLWJvdHRvbVwiO1xudmFyIEFDVE9SX0JPWF9DTEFTUyA9IFwiYWN0b3ItYm94XCI7XG52YXIgQUNUT1JfTUFOX0ZJR1VSRV9DTEFTUyA9IFwiYWN0b3ItbWFuXCI7XG52YXIgQ09MT1JfVEhFTUVTID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoW1wicmVkdXgtY29sb3JcIiwgXCJyZWR1eC1kYXJrLWNvbG9yXCJdKTtcbnZhciBkcmF3UmVjdDIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIHJlY3REYXRhKSB7XG4gIGNvbnN0IHJlY3RFbGVtZW50ID0gZHJhd1JlY3QoZWxlbSwgcmVjdERhdGEpO1xuICBpZiAoZ2V0Q29uZmlnKCkubG9vayA9PT0gXCJuZW9cIikge1xuICAgIHJlY3RFbGVtZW50LmF0dHIoXCJkYXRhLWxvb2tcIiwgXCJuZW9cIik7XG4gIH1cbiAgcmV0dXJuIHJlY3RFbGVtZW50O1xufSwgXCJkcmF3UmVjdFwiKTtcbnZhciBkcmF3UG9wdXAgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIGFjdG9yLCBtaW5NZW51V2lkdGgsIHRleHRBdHRycywgZm9yY2VNZW51cykge1xuICBpZiAoYWN0b3IubGlua3MgPT09IHZvaWQgMCB8fCBhY3Rvci5saW5rcyA9PT0gbnVsbCB8fCBPYmplY3Qua2V5cyhhY3Rvci5saW5rcykubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHsgaGVpZ2h0OiAwLCB3aWR0aDogMCB9O1xuICB9XG4gIGNvbnN0IGxpbmtzID0gYWN0b3IubGlua3M7XG4gIGNvbnN0IGFjdG9yQ250MiA9IGFjdG9yLmFjdG9yQ250O1xuICBjb25zdCByZWN0RGF0YSA9IGFjdG9yLnJlY3REYXRhO1xuICB2YXIgZGlzcGxheVZhbHVlID0gXCJub25lXCI7XG4gIGlmIChmb3JjZU1lbnVzKSB7XG4gICAgZGlzcGxheVZhbHVlID0gXCJibG9jayAhaW1wb3J0YW50XCI7XG4gIH1cbiAgY29uc3QgZyA9IGVsZW0uYXBwZW5kKFwiZ1wiKTtcbiAgZy5hdHRyKFwiaWRcIiwgXCJhY3RvclwiICsgYWN0b3JDbnQyICsgXCJfcG9wdXBcIik7XG4gIGcuYXR0cihcImNsYXNzXCIsIFwiYWN0b3JQb3B1cE1lbnVcIik7XG4gIGcuYXR0cihcImRpc3BsYXlcIiwgZGlzcGxheVZhbHVlKTtcbiAgdmFyIGFjdG9yQ2xhc3MgPSBcIlwiO1xuICBpZiAocmVjdERhdGEuY2xhc3MgIT09IHZvaWQgMCkge1xuICAgIGFjdG9yQ2xhc3MgPSBcIiBcIiArIHJlY3REYXRhLmNsYXNzO1xuICB9XG4gIGxldCBtZW51V2lkdGggPSByZWN0RGF0YS53aWR0aCA+IG1pbk1lbnVXaWR0aCA/IHJlY3REYXRhLndpZHRoIDogbWluTWVudVdpZHRoO1xuICBjb25zdCByZWN0RWxlbSA9IGcuYXBwZW5kKFwicmVjdFwiKTtcbiAgcmVjdEVsZW0uYXR0cihcImNsYXNzXCIsIFwiYWN0b3JQb3B1cE1lbnVQYW5lbFwiICsgYWN0b3JDbGFzcyk7XG4gIHJlY3RFbGVtLmF0dHIoXCJ4XCIsIHJlY3REYXRhLngpO1xuICByZWN0RWxlbS5hdHRyKFwieVwiLCByZWN0RGF0YS5oZWlnaHQpO1xuICByZWN0RWxlbS5hdHRyKFwiZmlsbFwiLCByZWN0RGF0YS5maWxsKTtcbiAgcmVjdEVsZW0uYXR0cihcInN0cm9rZVwiLCByZWN0RGF0YS5zdHJva2UpO1xuICByZWN0RWxlbS5hdHRyKFwid2lkdGhcIiwgbWVudVdpZHRoKTtcbiAgcmVjdEVsZW0uYXR0cihcImhlaWdodFwiLCByZWN0RGF0YS5oZWlnaHQpO1xuICByZWN0RWxlbS5hdHRyKFwicnhcIiwgcmVjdERhdGEucngpO1xuICByZWN0RWxlbS5hdHRyKFwicnlcIiwgcmVjdERhdGEucnkpO1xuICBpZiAobGlua3MgIT0gbnVsbCkge1xuICAgIHZhciBsaW5rWSA9IDIwO1xuICAgIGZvciAobGV0IGtleSBpbiBsaW5rcykge1xuICAgICAgdmFyIGxpbmtFbGVtID0gZy5hcHBlbmQoXCJhXCIpO1xuICAgICAgdmFyIHNhbml0aXplZExpbmsgPSBzYW5pdGl6ZVVybChsaW5rc1trZXldKTtcbiAgICAgIGxpbmtFbGVtLmF0dHIoXCJ4bGluazpocmVmXCIsIHNhbml0aXplZExpbmspO1xuICAgICAgbGlua0VsZW0uYXR0cihcInRhcmdldFwiLCBcIl9ibGFua1wiKTtcbiAgICAgIF9kcmF3TWVudUl0ZW1UZXh0Q2FuZGlkYXRlRnVuYyh0ZXh0QXR0cnMpKFxuICAgICAgICBrZXksXG4gICAgICAgIGxpbmtFbGVtLFxuICAgICAgICByZWN0RGF0YS54ICsgMTAsXG4gICAgICAgIHJlY3REYXRhLmhlaWdodCArIGxpbmtZLFxuICAgICAgICBtZW51V2lkdGgsXG4gICAgICAgIDIwLFxuICAgICAgICB7IGNsYXNzOiBcImFjdG9yXCIgfSxcbiAgICAgICAgdGV4dEF0dHJzXG4gICAgICApO1xuICAgICAgbGlua1kgKz0gMzA7XG4gICAgfVxuICB9XG4gIHJlY3RFbGVtLmF0dHIoXCJoZWlnaHRcIiwgbGlua1kpO1xuICByZXR1cm4geyBoZWlnaHQ6IHJlY3REYXRhLmhlaWdodCArIGxpbmtZLCB3aWR0aDogbWVudVdpZHRoIH07XG59LCBcImRyYXdQb3B1cFwiKTtcbnZhciBwb3B1cE1lbnVUb2dnbGUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHBvcElkKSB7XG4gIHJldHVybiBcInZhciBwdSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdcIiArIHBvcElkICsgXCInKTsgaWYgKHB1ICE9IG51bGwpIHsgcHUuc3R5bGUuZGlzcGxheSA9IHB1LnN0eWxlLmRpc3BsYXkgPT0gJ2Jsb2NrJyA/ICdub25lJyA6ICdibG9jayc7IH1cIjtcbn0sIFwicG9wdXBNZW51VG9nZ2xlXCIpO1xudmFyIGRyYXdLYXRleCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgZnVuY3Rpb24oZWxlbSwgdGV4dERhdGEsIG1zZ01vZGVsID0gbnVsbCkge1xuICBsZXQgdGV4dEVsZW0gPSBlbGVtLmFwcGVuZChcImZvcmVpZ25PYmplY3RcIik7XG4gIGNvbnN0IGxpbmVzU2FuaXRpemVkID0gYXdhaXQgcmVuZGVyS2F0ZXhTYW5pdGl6ZWQodGV4dERhdGEudGV4dCwgZ2V0Q29uZmlnKCkpO1xuICBjb25zdCBkaXZFbGVtID0gdGV4dEVsZW0uYXBwZW5kKFwieGh0bWw6ZGl2XCIpLmF0dHIoXCJzdHlsZVwiLCBcIndpZHRoOiBmaXQtY29udGVudDtcIikuYXR0cihcInhtbG5zXCIsIFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiKS5odG1sKGxpbmVzU2FuaXRpemVkKTtcbiAgY29uc3QgZGltID0gZGl2RWxlbS5ub2RlKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHRleHRFbGVtLmF0dHIoXCJoZWlnaHRcIiwgTWF0aC5yb3VuZChkaW0uaGVpZ2h0KSkuYXR0cihcIndpZHRoXCIsIE1hdGgucm91bmQoZGltLndpZHRoKSk7XG4gIGlmICh0ZXh0RGF0YS5jbGFzcyA9PT0gXCJub3RlVGV4dFwiKSB7XG4gICAgY29uc3QgcmVjdEVsZW0gPSBlbGVtLm5vZGUoKS5maXJzdENoaWxkO1xuICAgIHJlY3RFbGVtLnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBkaW0uaGVpZ2h0ICsgMiAqIHRleHREYXRhLnRleHRNYXJnaW4pO1xuICAgIGNvbnN0IHJlY3REaW0gPSByZWN0RWxlbS5nZXRCQm94KCk7XG4gICAgdGV4dEVsZW0uYXR0cihcInhcIiwgTWF0aC5yb3VuZChyZWN0RGltLnggKyByZWN0RGltLndpZHRoIC8gMiAtIGRpbS53aWR0aCAvIDIpKS5hdHRyKFwieVwiLCBNYXRoLnJvdW5kKHJlY3REaW0ueSArIHJlY3REaW0uaGVpZ2h0IC8gMiAtIGRpbS5oZWlnaHQgLyAyKSk7XG4gIH0gZWxzZSBpZiAobXNnTW9kZWwpIHtcbiAgICBsZXQgeyBzdGFydHgsIHN0b3B4LCBzdGFydHkgfSA9IG1zZ01vZGVsO1xuICAgIGlmIChzdGFydHggPiBzdG9weCkge1xuICAgICAgY29uc3QgdGVtcCA9IHN0YXJ0eDtcbiAgICAgIHN0YXJ0eCA9IHN0b3B4O1xuICAgICAgc3RvcHggPSB0ZW1wO1xuICAgIH1cbiAgICB0ZXh0RWxlbS5hdHRyKFwieFwiLCBNYXRoLnJvdW5kKHN0YXJ0eCArIE1hdGguYWJzKHN0YXJ0eCAtIHN0b3B4KSAvIDIgLSBkaW0ud2lkdGggLyAyKSk7XG4gICAgaWYgKHRleHREYXRhLmNsYXNzID09PSBcImxvb3BUZXh0XCIpIHtcbiAgICAgIHRleHRFbGVtLmF0dHIoXCJ5XCIsIE1hdGgucm91bmQoc3RhcnR5KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRleHRFbGVtLmF0dHIoXCJ5XCIsIE1hdGgucm91bmQoc3RhcnR5IC0gZGltLmhlaWdodCkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gW3RleHRFbGVtXTtcbn0sIFwiZHJhd0thdGV4XCIpO1xudmFyIGRyYXdUZXh0ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihlbGVtLCB0ZXh0RGF0YSkge1xuICBsZXQgcHJldlRleHRIZWlnaHQgPSAwO1xuICBsZXQgdGV4dEhlaWdodCA9IDA7XG4gIGNvbnN0IGxpbmVzID0gdGV4dERhdGEudGV4dC5zcGxpdChjb21tb25fZGVmYXVsdC5saW5lQnJlYWtSZWdleCk7XG4gIGNvbnN0IFtfdGV4dEZvbnRTaXplLCBfdGV4dEZvbnRTaXplUHhdID0gcGFyc2VGb250U2l6ZSh0ZXh0RGF0YS5mb250U2l6ZSk7XG4gIGxldCB0ZXh0RWxlbXMgPSBbXTtcbiAgbGV0IGR5ID0gMDtcbiAgbGV0IHlmdW5jID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiB0ZXh0RGF0YS55LCBcInlmdW5jXCIpO1xuICBpZiAodGV4dERhdGEudmFsaWduICE9PSB2b2lkIDAgJiYgdGV4dERhdGEudGV4dE1hcmdpbiAhPT0gdm9pZCAwICYmIHRleHREYXRhLnRleHRNYXJnaW4gPiAwKSB7XG4gICAgc3dpdGNoICh0ZXh0RGF0YS52YWxpZ24pIHtcbiAgICAgIGNhc2UgXCJ0b3BcIjpcbiAgICAgIGNhc2UgXCJzdGFydFwiOlxuICAgICAgICB5ZnVuYyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKCkgPT4gTWF0aC5yb3VuZCh0ZXh0RGF0YS55ICsgdGV4dERhdGEudGV4dE1hcmdpbiksIFwieWZ1bmNcIik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIm1pZGRsZVwiOlxuICAgICAgY2FzZSBcImNlbnRlclwiOlxuICAgICAgICB5ZnVuYyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKCkgPT4gTWF0aC5yb3VuZCh0ZXh0RGF0YS55ICsgKHByZXZUZXh0SGVpZ2h0ICsgdGV4dEhlaWdodCArIHRleHREYXRhLnRleHRNYXJnaW4pIC8gMiksIFwieWZ1bmNcIik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcImJvdHRvbVwiOlxuICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICB5ZnVuYyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKCkgPT4gTWF0aC5yb3VuZChcbiAgICAgICAgICB0ZXh0RGF0YS55ICsgKHByZXZUZXh0SGVpZ2h0ICsgdGV4dEhlaWdodCArIDIgKiB0ZXh0RGF0YS50ZXh0TWFyZ2luKSAtIHRleHREYXRhLnRleHRNYXJnaW5cbiAgICAgICAgKSwgXCJ5ZnVuY1wiKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGlmICh0ZXh0RGF0YS5hbmNob3IgIT09IHZvaWQgMCAmJiB0ZXh0RGF0YS50ZXh0TWFyZ2luICE9PSB2b2lkIDAgJiYgdGV4dERhdGEud2lkdGggIT09IHZvaWQgMCkge1xuICAgIHN3aXRjaCAodGV4dERhdGEuYW5jaG9yKSB7XG4gICAgICBjYXNlIFwibGVmdFwiOlxuICAgICAgY2FzZSBcInN0YXJ0XCI6XG4gICAgICAgIHRleHREYXRhLnggPSBNYXRoLnJvdW5kKHRleHREYXRhLnggKyB0ZXh0RGF0YS50ZXh0TWFyZ2luKTtcbiAgICAgICAgdGV4dERhdGEuYW5jaG9yID0gXCJzdGFydFwiO1xuICAgICAgICB0ZXh0RGF0YS5kb21pbmFudEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgICAgICAgdGV4dERhdGEuYWxpZ25tZW50QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJtaWRkbGVcIjpcbiAgICAgIGNhc2UgXCJjZW50ZXJcIjpcbiAgICAgICAgdGV4dERhdGEueCA9IE1hdGgucm91bmQodGV4dERhdGEueCArIHRleHREYXRhLndpZHRoIC8gMik7XG4gICAgICAgIHRleHREYXRhLmFuY2hvciA9IFwibWlkZGxlXCI7XG4gICAgICAgIHRleHREYXRhLmRvbWluYW50QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuICAgICAgICB0ZXh0RGF0YS5hbGlnbm1lbnRCYXNlbGluZSA9IFwibWlkZGxlXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInJpZ2h0XCI6XG4gICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgIHRleHREYXRhLnggPSBNYXRoLnJvdW5kKHRleHREYXRhLnggKyB0ZXh0RGF0YS53aWR0aCAtIHRleHREYXRhLnRleHRNYXJnaW4pO1xuICAgICAgICB0ZXh0RGF0YS5hbmNob3IgPSBcImVuZFwiO1xuICAgICAgICB0ZXh0RGF0YS5kb21pbmFudEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgICAgICAgdGV4dERhdGEuYWxpZ25tZW50QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgZm9yIChsZXQgW2ksIGxpbmVdIG9mIGxpbmVzLmVudHJpZXMoKSkge1xuICAgIGlmICh0ZXh0RGF0YS50ZXh0TWFyZ2luICE9PSB2b2lkIDAgJiYgdGV4dERhdGEudGV4dE1hcmdpbiA9PT0gMCAmJiBfdGV4dEZvbnRTaXplICE9PSB2b2lkIDApIHtcbiAgICAgIGR5ID0gaSAqIF90ZXh0Rm9udFNpemU7XG4gICAgfVxuICAgIGNvbnN0IHRleHRFbGVtID0gZWxlbS5hcHBlbmQoXCJ0ZXh0XCIpO1xuICAgIHRleHRFbGVtLmF0dHIoXCJ4XCIsIHRleHREYXRhLngpO1xuICAgIHRleHRFbGVtLmF0dHIoXCJ5XCIsIHlmdW5jKCkpO1xuICAgIGlmICh0ZXh0RGF0YS5hbmNob3IgIT09IHZvaWQgMCkge1xuICAgICAgdGV4dEVsZW0uYXR0cihcInRleHQtYW5jaG9yXCIsIHRleHREYXRhLmFuY2hvcikuYXR0cihcImRvbWluYW50LWJhc2VsaW5lXCIsIHRleHREYXRhLmRvbWluYW50QmFzZWxpbmUpLmF0dHIoXCJhbGlnbm1lbnQtYmFzZWxpbmVcIiwgdGV4dERhdGEuYWxpZ25tZW50QmFzZWxpbmUpO1xuICAgIH1cbiAgICBpZiAodGV4dERhdGEuZm9udEZhbWlseSAhPT0gdm9pZCAwKSB7XG4gICAgICB0ZXh0RWxlbS5zdHlsZShcImZvbnQtZmFtaWx5XCIsIHRleHREYXRhLmZvbnRGYW1pbHkpO1xuICAgIH1cbiAgICBpZiAoX3RleHRGb250U2l6ZVB4ICE9PSB2b2lkIDApIHtcbiAgICAgIHRleHRFbGVtLnN0eWxlKFwiZm9udC1zaXplXCIsIF90ZXh0Rm9udFNpemVQeCk7XG4gICAgfVxuICAgIGlmICh0ZXh0RGF0YS5mb250V2VpZ2h0ICE9PSB2b2lkIDApIHtcbiAgICAgIHRleHRFbGVtLnN0eWxlKFwiZm9udC13ZWlnaHRcIiwgdGV4dERhdGEuZm9udFdlaWdodCk7XG4gICAgfVxuICAgIGlmICh0ZXh0RGF0YS5maWxsICE9PSB2b2lkIDApIHtcbiAgICAgIHRleHRFbGVtLmF0dHIoXCJmaWxsXCIsIHRleHREYXRhLmZpbGwpO1xuICAgIH1cbiAgICBpZiAodGV4dERhdGEuY2xhc3MgIT09IHZvaWQgMCkge1xuICAgICAgdGV4dEVsZW0uYXR0cihcImNsYXNzXCIsIHRleHREYXRhLmNsYXNzKTtcbiAgICB9XG4gICAgaWYgKHRleHREYXRhLmR5ICE9PSB2b2lkIDApIHtcbiAgICAgIHRleHRFbGVtLmF0dHIoXCJkeVwiLCB0ZXh0RGF0YS5keSk7XG4gICAgfSBlbHNlIGlmIChkeSAhPT0gMCkge1xuICAgICAgdGV4dEVsZW0uYXR0cihcImR5XCIsIGR5KTtcbiAgICB9XG4gICAgY29uc3QgdGV4dCA9IGxpbmUgfHwgWkVST19XSURUSF9TUEFDRTtcbiAgICBpZiAodGV4dERhdGEudHNwYW4pIHtcbiAgICAgIGNvbnN0IHNwYW4gPSB0ZXh0RWxlbS5hcHBlbmQoXCJ0c3BhblwiKTtcbiAgICAgIHNwYW4uYXR0cihcInhcIiwgdGV4dERhdGEueCk7XG4gICAgICBpZiAodGV4dERhdGEuZmlsbCAhPT0gdm9pZCAwKSB7XG4gICAgICAgIHNwYW4uYXR0cihcImZpbGxcIiwgdGV4dERhdGEuZmlsbCk7XG4gICAgICB9XG4gICAgICBzcGFuLnRleHQodGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRleHRFbGVtLnRleHQodGV4dCk7XG4gICAgfVxuICAgIGlmICh0ZXh0RGF0YS52YWxpZ24gIT09IHZvaWQgMCAmJiB0ZXh0RGF0YS50ZXh0TWFyZ2luICE9PSB2b2lkIDAgJiYgdGV4dERhdGEudGV4dE1hcmdpbiA+IDApIHtcbiAgICAgIHRleHRIZWlnaHQgKz0gKHRleHRFbGVtLl9ncm91cHMgfHwgdGV4dEVsZW0pWzBdWzBdLmdldEJCb3goKS5oZWlnaHQ7XG4gICAgICBwcmV2VGV4dEhlaWdodCA9IHRleHRIZWlnaHQ7XG4gICAgfVxuICAgIHRleHRFbGVtcy5wdXNoKHRleHRFbGVtKTtcbiAgfVxuICByZXR1cm4gdGV4dEVsZW1zO1xufSwgXCJkcmF3VGV4dFwiKTtcbnZhciBkcmF3TGFiZWwgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIHR4dE9iamVjdCkge1xuICBmdW5jdGlvbiBnZW5Qb2ludHMoeCwgeSwgd2lkdGgsIGhlaWdodCwgY3V0KSB7XG4gICAgcmV0dXJuIHggKyBcIixcIiArIHkgKyBcIiBcIiArICh4ICsgd2lkdGgpICsgXCIsXCIgKyB5ICsgXCIgXCIgKyAoeCArIHdpZHRoKSArIFwiLFwiICsgKHkgKyBoZWlnaHQgLSBjdXQpICsgXCIgXCIgKyAoeCArIHdpZHRoIC0gY3V0ICogMS4yKSArIFwiLFwiICsgKHkgKyBoZWlnaHQpICsgXCIgXCIgKyB4ICsgXCIsXCIgKyAoeSArIGhlaWdodCk7XG4gIH1cbiAgX19uYW1lKGdlblBvaW50cywgXCJnZW5Qb2ludHNcIik7XG4gIGNvbnN0IHBvbHlnb24gPSBlbGVtLmFwcGVuZChcInBvbHlnb25cIik7XG4gIHBvbHlnb24uYXR0cihcInBvaW50c1wiLCBnZW5Qb2ludHModHh0T2JqZWN0LngsIHR4dE9iamVjdC55LCB0eHRPYmplY3Qud2lkdGgsIHR4dE9iamVjdC5oZWlnaHQsIDcpKTtcbiAgcG9seWdvbi5hdHRyKFwiY2xhc3NcIiwgXCJsYWJlbEJveFwiKTtcbiAgdHh0T2JqZWN0LnkgPSB0eHRPYmplY3QueSArIHR4dE9iamVjdC5oZWlnaHQgLyAyO1xuICBkcmF3VGV4dChlbGVtLCB0eHRPYmplY3QpO1xuICByZXR1cm4gcG9seWdvbjtcbn0sIFwiZHJhd0xhYmVsXCIpO1xudmFyIGFjdG9yQ250ID0gLTE7XG52YXIgZml4TGlmZUxpbmVIZWlnaHRzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZGlhZ3JhbTIsIGFjdG9ycywgYWN0b3JLZXlzLCBjb25mMikgPT4ge1xuICBpZiAoIWRpYWdyYW0yLnNlbGVjdCkge1xuICAgIHJldHVybjtcbiAgfVxuICBhY3RvcktleXMuZm9yRWFjaCgoYWN0b3JLZXkpID0+IHtcbiAgICBjb25zdCBhY3RvciA9IGFjdG9ycy5nZXQoYWN0b3JLZXkpO1xuICAgIGNvbnN0IGFjdG9yRE9NID0gZGlhZ3JhbTIuc2VsZWN0KFwiI2FjdG9yXCIgKyBhY3Rvci5hY3RvckNudCk7XG4gICAgaWYgKCFjb25mMi5taXJyb3JBY3RvcnMgJiYgYWN0b3Iuc3RvcHkpIHtcbiAgICAgIGFjdG9yRE9NLmF0dHIoXCJ5MlwiLCBhY3Rvci5zdG9weSArIGFjdG9yLmhlaWdodCAvIDIpO1xuICAgIH0gZWxzZSBpZiAoY29uZjIubWlycm9yQWN0b3JzKSB7XG4gICAgICBhY3RvckRPTS5hdHRyKFwieTJcIiwgYWN0b3Iuc3RvcHkpO1xuICAgIH1cbiAgfSk7XG59LCBcImZpeExpZmVMaW5lSGVpZ2h0c1wiKTtcbnZhciBkcmF3QWN0b3JUeXBlUGFydGljaXBhbnQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIGFjdG9yLCBjb25mMiwgaXNGb290ZXIsIGFjdG9ySW5kZXhNYXApIHtcbiAgY29uc3QgYWN0b3JZID0gaXNGb290ZXIgPyBhY3Rvci5zdG9weSA6IGFjdG9yLnN0YXJ0eTtcbiAgY29uc3QgY2VudGVyID0gYWN0b3IueCArIGFjdG9yLndpZHRoIC8gMjtcbiAgY29uc3QgY2VudGVyWSA9IGFjdG9yWSArIGFjdG9yLmhlaWdodDtcbiAgY29uc3QgeyBsb29rLCB0aGVtZSwgdGhlbWVWYXJpYWJsZXMgfSA9IGNvbmYyO1xuICBjb25zdCB7IGJrZ0NvbG9yQXJyYXksIGJvcmRlckNvbG9yQXJyYXkgfSA9IHRoZW1lVmFyaWFibGVzO1xuICBjb25zdCBib3hwbHVzTGluZUdyb3VwID0gZWxlbS5hcHBlbmQoXCJnXCIpLmxvd2VyKCk7XG4gIHZhciBnID0gYm94cGx1c0xpbmVHcm91cDtcbiAgaWYgKCFpc0Zvb3Rlcikge1xuICAgIGFjdG9yQ250Kys7XG4gICAgaWYgKE9iamVjdC5rZXlzKGFjdG9yLmxpbmtzIHx8IHt9KS5sZW5ndGggJiYgIWNvbmYyLmZvcmNlTWVudXMpIHtcbiAgICAgIGcuYXR0cihcIm9uY2xpY2tcIiwgcG9wdXBNZW51VG9nZ2xlKGBhY3RvciR7YWN0b3JDbnR9X3BvcHVwYCkpLmF0dHIoXCJjdXJzb3JcIiwgXCJwb2ludGVyXCIpO1xuICAgIH1cbiAgICBnLmFwcGVuZChcImxpbmVcIikuYXR0cihcImlkXCIsIFwiYWN0b3JcIiArIGFjdG9yQ250KS5hdHRyKFwieDFcIiwgY2VudGVyKS5hdHRyKFwieTFcIiwgY2VudGVyWSkuYXR0cihcIngyXCIsIGNlbnRlcikuYXR0cihcInkyXCIsIDJlMykuYXR0cihcImNsYXNzXCIsIFwiYWN0b3ItbGluZSAyMDBcIikuYXR0cihcInN0cm9rZS13aWR0aFwiLCBcIjAuNXB4XCIpLmF0dHIoXCJzdHJva2VcIiwgXCIjOTk5XCIpLmF0dHIoXCJuYW1lXCIsIGFjdG9yLm5hbWUpLmF0dHIoXCJkYXRhLWV0XCIsIFwibGlmZS1saW5lXCIpLmF0dHIoXCJkYXRhLWlkXCIsIGFjdG9yLm5hbWUpO1xuICAgIGcgPSBib3hwbHVzTGluZUdyb3VwLmFwcGVuZChcImdcIik7XG4gICAgYWN0b3IuYWN0b3JDbnQgPSBhY3RvckNudDtcbiAgICBpZiAoYWN0b3IubGlua3MgIT0gbnVsbCkge1xuICAgICAgZy5hdHRyKFwiaWRcIiwgXCJyb290LVwiICsgYWN0b3JDbnQpO1xuICAgIH1cbiAgICBpZiAobG9vayA9PT0gXCJuZW9cIikge1xuICAgICAgZy5hdHRyKFwiZGF0YS1sb29rXCIsIFwibmVvXCIpO1xuICAgIH1cbiAgfVxuICBjb25zdCByZWN0ID0gZ2V0Tm90ZVJlY3QoKTtcbiAgdmFyIGNzc2NsYXNzID0gXCJhY3RvclwiO1xuICBpZiAoYWN0b3IucHJvcGVydGllcz8uY2xhc3MpIHtcbiAgICBjc3NjbGFzcyA9IGFjdG9yLnByb3BlcnRpZXMuY2xhc3M7XG4gIH0gZWxzZSB7XG4gICAgcmVjdC5maWxsID0gXCIjZWFlYWVhXCI7XG4gIH1cbiAgaWYgKGlzRm9vdGVyKSB7XG4gICAgY3NzY2xhc3MgKz0gYCAke0JPVFRPTV9BQ1RPUl9DTEFTU31gO1xuICB9IGVsc2Uge1xuICAgIGNzc2NsYXNzICs9IGAgJHtUT1BfQUNUT1JfQ0xBU1N9YDtcbiAgfVxuICByZWN0LnggPSBhY3Rvci54O1xuICByZWN0LnkgPSBhY3Rvclk7XG4gIHJlY3Qud2lkdGggPSBhY3Rvci53aWR0aDtcbiAgcmVjdC5oZWlnaHQgPSBhY3Rvci5oZWlnaHQ7XG4gIHJlY3QuY2xhc3MgPSBjc3NjbGFzcztcbiAgcmVjdC5yeCA9IDM7XG4gIHJlY3QucnkgPSAzO1xuICByZWN0Lm5hbWUgPSBhY3Rvci5uYW1lO1xuICBpZiAobG9vayA9PT0gXCJuZW9cIikge1xuICAgIHJlY3QucnggPSA2O1xuICAgIHJlY3QucnkgPSA2O1xuICB9XG4gIGNvbnN0IHJlY3RFbGVtID0gZHJhd1JlY3QyKGcsIHJlY3QpO1xuICBjb25zdCBhY3RvckNvdW50ID0gYWN0b3JJbmRleE1hcC5nZXQoYWN0b3IubmFtZSkgPz8gMDtcbiAgaWYgKENPTE9SX1RIRU1FUy5oYXModGhlbWUpKSB7XG4gICAgcmVjdEVsZW0uc3R5bGUoXCJzdHJva2VcIiwgYm9yZGVyQ29sb3JBcnJheVthY3RvckNvdW50ICUgYm9yZGVyQ29sb3JBcnJheS5sZW5ndGhdKTtcbiAgICByZWN0RWxlbS5zdHlsZShcImZpbGxcIiwgYmtnQ29sb3JBcnJheVthY3RvckNvdW50ICUgYm9yZGVyQ29sb3JBcnJheS5sZW5ndGhdKTtcbiAgfVxuICBpZiAobG9vayA9PT0gXCJuZW9cIikge1xuICAgIHJlY3RFbGVtLmF0dHIoXCJmaWx0ZXJcIiwgXCJ1cmwoI2Ryb3Atc2hhZG93KVwiKTtcbiAgfVxuICBhY3Rvci5yZWN0RGF0YSA9IHJlY3Q7XG4gIGlmIChhY3Rvci5wcm9wZXJ0aWVzPy5pY29uKSB7XG4gICAgY29uc3QgaWNvblNyYyA9IGFjdG9yLnByb3BlcnRpZXMuaWNvbi50cmltKCk7XG4gICAgaWYgKGljb25TcmMuY2hhckF0KDApID09PSBcIkBcIikge1xuICAgICAgZHJhd0VtYmVkZGVkSW1hZ2UoZywgcmVjdC54ICsgcmVjdC53aWR0aCAtIDIwLCByZWN0LnkgKyAxMCwgaWNvblNyYy5zdWJzdHIoMSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkcmF3SW1hZ2UoZywgcmVjdC54ICsgcmVjdC53aWR0aCAtIDIwLCByZWN0LnkgKyAxMCwgaWNvblNyYyk7XG4gICAgfVxuICB9XG4gIGlmICghaXNGb290ZXIpIHtcbiAgICBnLmF0dHIoXCJkYXRhLWV0XCIsIFwicGFydGljaXBhbnRcIik7XG4gICAgZy5hdHRyKFwiZGF0YS10eXBlXCIsIFwicGFydGljaXBhbnRcIik7XG4gICAgZy5hdHRyKFwiZGF0YS1pZFwiLCBhY3Rvci5uYW1lKTtcbiAgfVxuICBfZHJhd1RleHRDYW5kaWRhdGVGdW5jKGNvbmYyLCBoYXNLYXRleChhY3Rvci5kZXNjcmlwdGlvbikpKFxuICAgIGFjdG9yLmRlc2NyaXB0aW9uLFxuICAgIGcsXG4gICAgcmVjdC54LFxuICAgIHJlY3QueSxcbiAgICByZWN0LndpZHRoLFxuICAgIHJlY3QuaGVpZ2h0LFxuICAgIHsgY2xhc3M6IGBhY3RvciAke0FDVE9SX0JPWF9DTEFTU31gIH0sXG4gICAgY29uZjJcbiAgKTtcbiAgbGV0IGhlaWdodCA9IGFjdG9yLmhlaWdodDtcbiAgaWYgKHJlY3RFbGVtLm5vZGUpIHtcbiAgICBjb25zdCBib3VuZHMyID0gcmVjdEVsZW0ubm9kZSgpLmdldEJCb3goKTtcbiAgICBhY3Rvci5oZWlnaHQgPSBib3VuZHMyLmhlaWdodDtcbiAgICBoZWlnaHQgPSBib3VuZHMyLmhlaWdodDtcbiAgfVxuICByZXR1cm4gaGVpZ2h0O1xufSwgXCJkcmF3QWN0b3JUeXBlUGFydGljaXBhbnRcIik7XG52YXIgZHJhd0FjdG9yVHlwZUNvbGxlY3Rpb25zID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihlbGVtLCBhY3RvciwgY29uZjIsIGlzRm9vdGVyLCBhY3RvckluZGV4TWFwKSB7XG4gIGNvbnN0IGFjdG9yWSA9IGlzRm9vdGVyID8gYWN0b3Iuc3RvcHkgOiBhY3Rvci5zdGFydHk7XG4gIGNvbnN0IGNlbnRlciA9IGFjdG9yLnggKyBhY3Rvci53aWR0aCAvIDI7XG4gIGNvbnN0IGNlbnRlclkgPSBhY3RvclkgKyBhY3Rvci5oZWlnaHQ7XG4gIGNvbnN0IHsgbG9vaywgdGhlbWUsIHRoZW1lVmFyaWFibGVzIH0gPSBjb25mMjtcbiAgY29uc3QgeyBia2dDb2xvckFycmF5LCBib3JkZXJDb2xvckFycmF5IH0gPSB0aGVtZVZhcmlhYmxlcztcbiAgY29uc3QgYm94cGx1c0xpbmVHcm91cCA9IGVsZW0uYXBwZW5kKFwiZ1wiKS5sb3dlcigpO1xuICB2YXIgZyA9IGJveHBsdXNMaW5lR3JvdXA7XG4gIGlmICghaXNGb290ZXIpIHtcbiAgICBhY3RvckNudCsrO1xuICAgIGlmIChPYmplY3Qua2V5cyhhY3Rvci5saW5rcyB8fCB7fSkubGVuZ3RoICYmICFjb25mMi5mb3JjZU1lbnVzKSB7XG4gICAgICBnLmF0dHIoXCJvbmNsaWNrXCIsIHBvcHVwTWVudVRvZ2dsZShgYWN0b3Ike2FjdG9yQ250fV9wb3B1cGApKS5hdHRyKFwiY3Vyc29yXCIsIFwicG9pbnRlclwiKTtcbiAgICB9XG4gICAgZy5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJpZFwiLCBcImFjdG9yXCIgKyBhY3RvckNudCkuYXR0cihcIngxXCIsIGNlbnRlcikuYXR0cihcInkxXCIsIGNlbnRlclkpLmF0dHIoXCJ4MlwiLCBjZW50ZXIpLmF0dHIoXCJ5MlwiLCAyZTMpLmF0dHIoXCJjbGFzc1wiLCBcImFjdG9yLWxpbmUgMjAwXCIpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgXCIwLjVweFwiKS5hdHRyKFwic3Ryb2tlXCIsIFwiIzk5OVwiKS5hdHRyKFwibmFtZVwiLCBhY3Rvci5uYW1lKS5hdHRyKFwiZGF0YS1ldFwiLCBcImxpZmUtbGluZVwiKS5hdHRyKFwiZGF0YS1pZFwiLCBhY3Rvci5uYW1lKTtcbiAgICBnID0gYm94cGx1c0xpbmVHcm91cC5hcHBlbmQoXCJnXCIpO1xuICAgIGFjdG9yLmFjdG9yQ250ID0gYWN0b3JDbnQ7XG4gICAgaWYgKGFjdG9yLmxpbmtzICE9IG51bGwpIHtcbiAgICAgIGcuYXR0cihcImlkXCIsIFwicm9vdC1cIiArIGFjdG9yQ250KTtcbiAgICB9XG4gICAgaWYgKGxvb2sgPT09IFwibmVvXCIpIHtcbiAgICAgIGcuYXR0cihcImRhdGEtbG9va1wiLCBcIm5lb1wiKTtcbiAgICB9XG4gIH1cbiAgY29uc3QgcmVjdCA9IGdldE5vdGVSZWN0KCk7XG4gIHZhciBjc3NjbGFzcyA9IFwiYWN0b3JcIjtcbiAgaWYgKGFjdG9yLnByb3BlcnRpZXM/LmNsYXNzKSB7XG4gICAgY3NzY2xhc3MgPSBhY3Rvci5wcm9wZXJ0aWVzLmNsYXNzO1xuICB9IGVsc2Uge1xuICAgIHJlY3QuZmlsbCA9IFwiI2VhZWFlYVwiO1xuICB9XG4gIGlmIChpc0Zvb3Rlcikge1xuICAgIGNzc2NsYXNzICs9IGAgJHtCT1RUT01fQUNUT1JfQ0xBU1N9YDtcbiAgfSBlbHNlIHtcbiAgICBjc3NjbGFzcyArPSBgICR7VE9QX0FDVE9SX0NMQVNTfWA7XG4gIH1cbiAgcmVjdC54ID0gYWN0b3IueDtcbiAgcmVjdC55ID0gYWN0b3JZO1xuICByZWN0LndpZHRoID0gYWN0b3Iud2lkdGg7XG4gIHJlY3QuaGVpZ2h0ID0gYWN0b3IuaGVpZ2h0O1xuICByZWN0LmNsYXNzID0gY3NzY2xhc3M7XG4gIHJlY3QubmFtZSA9IGFjdG9yLm5hbWU7XG4gIGNvbnN0IG9mZnNldCA9IDY7XG4gIGNvbnN0IHNoYWRvd1JlY3QgPSB7XG4gICAgLi4ucmVjdCxcbiAgICB4OiByZWN0LnggKyAoaXNGb290ZXIgPyAtb2Zmc2V0IDogLW9mZnNldCksXG4gICAgeTogcmVjdC55ICsgKGlzRm9vdGVyID8gK29mZnNldCA6ICtvZmZzZXQpLFxuICAgIGNsYXNzOiBcImFjdG9yXCJcbiAgfTtcbiAgY29uc3QgcmVjdEVsZW0gPSBkcmF3UmVjdDIoZywgcmVjdCk7XG4gIGNvbnN0IHN0YWNrZWRSZWN0ID0gZHJhd1JlY3QyKGcsIHNoYWRvd1JlY3QpO1xuICBhY3Rvci5yZWN0RGF0YSA9IHJlY3Q7XG4gIGlmIChsb29rID09PSBcIm5lb1wiKSB7XG4gICAgZy5hdHRyKFwiZmlsdGVyXCIsIFwidXJsKCNkcm9wLXNoYWRvdylcIik7XG4gIH1cbiAgY29uc3QgYWN0b3JDb3VudCA9IGFjdG9ySW5kZXhNYXAuZ2V0KGFjdG9yLm5hbWUpID8/IDA7XG4gIGlmIChDT0xPUl9USEVNRVMuaGFzKHRoZW1lKSkge1xuICAgIHJlY3RFbGVtLnN0eWxlKFwic3Ryb2tlXCIsIGJvcmRlckNvbG9yQXJyYXlbYWN0b3JDb3VudCAlIGJvcmRlckNvbG9yQXJyYXkubGVuZ3RoXSk7XG4gICAgcmVjdEVsZW0uc3R5bGUoXCJmaWxsXCIsIGJrZ0NvbG9yQXJyYXlbYWN0b3JDb3VudCAlIGJvcmRlckNvbG9yQXJyYXkubGVuZ3RoXSk7XG4gICAgc3RhY2tlZFJlY3Quc3R5bGUoXCJzdHJva2VcIiwgYm9yZGVyQ29sb3JBcnJheVthY3RvckNvdW50ICUgYm9yZGVyQ29sb3JBcnJheS5sZW5ndGhdKTtcbiAgICBzdGFja2VkUmVjdC5zdHlsZShcImZpbGxcIiwgYmtnQ29sb3JBcnJheVthY3RvckNvdW50ICUgYm9yZGVyQ29sb3JBcnJheS5sZW5ndGhdKTtcbiAgfVxuICBpZiAoYWN0b3IucHJvcGVydGllcz8uaWNvbikge1xuICAgIGNvbnN0IGljb25TcmMgPSBhY3Rvci5wcm9wZXJ0aWVzLmljb24udHJpbSgpO1xuICAgIGlmIChpY29uU3JjLmNoYXJBdCgwKSA9PT0gXCJAXCIpIHtcbiAgICAgIGRyYXdFbWJlZGRlZEltYWdlKGcsIHJlY3QueCArIHJlY3Qud2lkdGggLSAyMCwgcmVjdC55ICsgMTAsIGljb25TcmMuc3Vic3RyKDEpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZHJhd0ltYWdlKGcsIHJlY3QueCArIHJlY3Qud2lkdGggLSAyMCwgcmVjdC55ICsgMTAsIGljb25TcmMpO1xuICAgIH1cbiAgfVxuICBfZHJhd1RleHRDYW5kaWRhdGVGdW5jKGNvbmYyLCBoYXNLYXRleChhY3Rvci5kZXNjcmlwdGlvbikpKFxuICAgIGFjdG9yLmRlc2NyaXB0aW9uLFxuICAgIGcsXG4gICAgcmVjdC54IC0gb2Zmc2V0LFxuICAgIHJlY3QueSArIG9mZnNldCxcbiAgICByZWN0LndpZHRoLFxuICAgIHJlY3QuaGVpZ2h0LFxuICAgIHsgY2xhc3M6IGBhY3RvciAke0FDVE9SX0JPWF9DTEFTU31gIH0sXG4gICAgY29uZjJcbiAgKTtcbiAgbGV0IGhlaWdodCA9IGFjdG9yLmhlaWdodDtcbiAgaWYgKHJlY3RFbGVtLm5vZGUpIHtcbiAgICBjb25zdCBib3VuZHMyID0gcmVjdEVsZW0ubm9kZSgpLmdldEJCb3goKTtcbiAgICBhY3Rvci5oZWlnaHQgPSBib3VuZHMyLmhlaWdodDtcbiAgICBoZWlnaHQgPSBib3VuZHMyLmhlaWdodDtcbiAgfVxuICBpZiAoIWlzRm9vdGVyKSB7XG4gICAgZy5hdHRyKFwiZGF0YS1ldFwiLCBcInBhcnRpY2lwYW50XCIpO1xuICAgIGcuYXR0cihcImRhdGEtdHlwZVwiLCBcImNvbGxlY3Rpb25zXCIpO1xuICAgIGcuYXR0cihcImRhdGEtaWRcIiwgYWN0b3IubmFtZSk7XG4gIH1cbiAgcmV0dXJuIGhlaWdodDtcbn0sIFwiZHJhd0FjdG9yVHlwZUNvbGxlY3Rpb25zXCIpO1xudmFyIGRyYXdBY3RvclR5cGVRdWV1ZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbSwgYWN0b3IsIGNvbmYyLCBpc0Zvb3RlciwgYWN0b3JJbmRleE1hcCkge1xuICBjb25zdCBhY3RvclkgPSBpc0Zvb3RlciA/IGFjdG9yLnN0b3B5IDogYWN0b3Iuc3RhcnR5O1xuICBjb25zdCBjZW50ZXIgPSBhY3Rvci54ICsgYWN0b3Iud2lkdGggLyAyO1xuICBjb25zdCBjZW50ZXJZID0gYWN0b3JZICsgYWN0b3IuaGVpZ2h0O1xuICBjb25zdCB7IGxvb2ssIHRoZW1lLCB0aGVtZVZhcmlhYmxlcyB9ID0gY29uZjI7XG4gIGNvbnN0IHsgYmtnQ29sb3JBcnJheSwgYm9yZGVyQ29sb3JBcnJheSB9ID0gdGhlbWVWYXJpYWJsZXM7XG4gIGNvbnN0IGJveHBsdXNMaW5lR3JvdXAgPSBlbGVtLmFwcGVuZChcImdcIikubG93ZXIoKTtcbiAgbGV0IGcgPSBib3hwbHVzTGluZUdyb3VwO1xuICBpZiAoIWlzRm9vdGVyKSB7XG4gICAgYWN0b3JDbnQrKztcbiAgICBpZiAoT2JqZWN0LmtleXMoYWN0b3IubGlua3MgfHwge30pLmxlbmd0aCAmJiAhY29uZjIuZm9yY2VNZW51cykge1xuICAgICAgZy5hdHRyKFwib25jbGlja1wiLCBwb3B1cE1lbnVUb2dnbGUoYGFjdG9yJHthY3RvckNudH1fcG9wdXBgKSkuYXR0cihcImN1cnNvclwiLCBcInBvaW50ZXJcIik7XG4gICAgfVxuICAgIGcuYXBwZW5kKFwibGluZVwiKS5hdHRyKFwiaWRcIiwgXCJhY3RvclwiICsgYWN0b3JDbnQpLmF0dHIoXCJ4MVwiLCBjZW50ZXIpLmF0dHIoXCJ5MVwiLCBjZW50ZXJZKS5hdHRyKFwieDJcIiwgY2VudGVyKS5hdHRyKFwieTJcIiwgMmUzKS5hdHRyKFwiY2xhc3NcIiwgXCJhY3Rvci1saW5lIDIwMFwiKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIFwiMC41cHhcIikuYXR0cihcInN0cm9rZVwiLCBcIiM5OTlcIikuYXR0cihcIm5hbWVcIiwgYWN0b3IubmFtZSkuYXR0cihcImRhdGEtZXRcIiwgXCJsaWZlLWxpbmVcIikuYXR0cihcImRhdGEtaWRcIiwgYWN0b3IubmFtZSk7XG4gICAgZyA9IGJveHBsdXNMaW5lR3JvdXAuYXBwZW5kKFwiZ1wiKTtcbiAgICBhY3Rvci5hY3RvckNudCA9IGFjdG9yQ250O1xuICAgIGlmIChhY3Rvci5saW5rcyAhPSBudWxsKSB7XG4gICAgICBnLmF0dHIoXCJpZFwiLCBcInJvb3QtXCIgKyBhY3RvckNudCk7XG4gICAgfVxuICAgIGlmIChsb29rID09PSBcIm5lb1wiKSB7XG4gICAgICBnLmF0dHIoXCJkYXRhLWxvb2tcIiwgXCJuZW9cIik7XG4gICAgfVxuICB9XG4gIGNvbnN0IHJlY3QgPSBnZXROb3RlUmVjdCgpO1xuICBsZXQgY3NzY2xhc3MgPSBcImFjdG9yXCI7XG4gIGlmIChhY3Rvci5wcm9wZXJ0aWVzPy5jbGFzcykge1xuICAgIGNzc2NsYXNzID0gYWN0b3IucHJvcGVydGllcy5jbGFzcztcbiAgfSBlbHNlIHtcbiAgICByZWN0LmZpbGwgPSBcIiNlYWVhZWFcIjtcbiAgfVxuICBpZiAoaXNGb290ZXIpIHtcbiAgICBjc3NjbGFzcyArPSBgICR7Qk9UVE9NX0FDVE9SX0NMQVNTfWA7XG4gIH0gZWxzZSB7XG4gICAgY3NzY2xhc3MgKz0gYCAke1RPUF9BQ1RPUl9DTEFTU31gO1xuICB9XG4gIGcuYXR0cihcImNsYXNzXCIsIGNzc2NsYXNzKTtcbiAgcmVjdC54ID0gYWN0b3IueDtcbiAgcmVjdC55ID0gYWN0b3JZO1xuICByZWN0LndpZHRoID0gYWN0b3Iud2lkdGg7XG4gIHJlY3QuaGVpZ2h0ID0gYWN0b3IuaGVpZ2h0O1xuICByZWN0Lm5hbWUgPSBhY3Rvci5uYW1lO1xuICBjb25zdCByeSA9IHJlY3QuaGVpZ2h0IC8gMjtcbiAgY29uc3QgcnggPSByeSAvICgyLjUgKyByZWN0LmhlaWdodCAvIDUwKTtcbiAgY29uc3QgY3lsaW5kZXJHcm91cCA9IGcuYXBwZW5kKFwiZ1wiKTtcbiAgY29uc3QgY3lsaW5kZXJBcmMgPSBnLmFwcGVuZChcImdcIik7XG4gIGNvbnN0IGN5bGluZGVyUGF0aCA9IGBNICR7cmVjdC54fSwke3JlY3QueSArIHJ5fVxuICAgIGEgJHtyeH0sJHtyeX0gMCAwIDAgMCwke3JlY3QuaGVpZ2h0fVxuICAgIGggJHtyZWN0LndpZHRoIC0gMiAqIHJ4fVxuICAgIGEgJHtyeH0sJHtyeX0gMCAwIDAgMCwtJHtyZWN0LmhlaWdodH1cbiAgICBaXG4gIGA7XG4gIGN5bGluZGVyR3JvdXAuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBjeWxpbmRlclBhdGgpO1xuICBjeWxpbmRlckFyYy5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXG4gICAgXCJkXCIsXG4gICAgYE0gJHtyZWN0Lnh9LCR7cmVjdC55ICsgcnl9XG4gICAgICBhICR7cnh9LCR7cnl9IDAgMCAwIDAsJHtyZWN0LmhlaWdodH1gXG4gICk7XG4gIGN5bGluZGVyR3JvdXAuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7cnh9LCAkey0ocmVjdC5oZWlnaHQgLyAyKX0pYCk7XG4gIGN5bGluZGVyQXJjLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgke3JlY3Qud2lkdGggLSByeH0sICR7LXJlY3QuaGVpZ2h0IC8gMn0pYCk7XG4gIGFjdG9yLnJlY3REYXRhID0gcmVjdDtcbiAgaWYgKGxvb2sgPT09IFwibmVvXCIpIHtcbiAgICBjeWxpbmRlckdyb3VwLmF0dHIoXCJmaWx0ZXJcIiwgXCJ1cmwoI2Ryb3Atc2hhZG93KVwiKTtcbiAgfVxuICBjb25zdCBhY3RvckNvdW50ID0gYWN0b3JJbmRleE1hcC5nZXQoYWN0b3IubmFtZSkgPz8gMDtcbiAgaWYgKENPTE9SX1RIRU1FUy5oYXModGhlbWUpKSB7XG4gICAgY3lsaW5kZXJHcm91cC5zdHlsZShcInN0cm9rZVwiLCBib3JkZXJDb2xvckFycmF5W2FjdG9yQ291bnQgJSBib3JkZXJDb2xvckFycmF5Lmxlbmd0aF0pO1xuICAgIGN5bGluZGVyR3JvdXAuc3R5bGUoXCJmaWxsXCIsIGJrZ0NvbG9yQXJyYXlbYWN0b3JDb3VudCAlIGJvcmRlckNvbG9yQXJyYXkubGVuZ3RoXSk7XG4gICAgY3lsaW5kZXJBcmMuc3R5bGUoXCJzdHJva2VcIiwgYm9yZGVyQ29sb3JBcnJheVthY3RvckNvdW50ICUgYm9yZGVyQ29sb3JBcnJheS5sZW5ndGhdKTtcbiAgICBjeWxpbmRlckFyYy5zdHlsZShcImZpbGxcIiwgYmtnQ29sb3JBcnJheVthY3RvckNvdW50ICUgYm9yZGVyQ29sb3JBcnJheS5sZW5ndGhdKTtcbiAgfVxuICBpZiAoYWN0b3IucHJvcGVydGllcz8uaWNvbikge1xuICAgIGNvbnN0IGljb25TcmMgPSBhY3Rvci5wcm9wZXJ0aWVzLmljb24udHJpbSgpO1xuICAgIGNvbnN0IGljb25YID0gcmVjdC54ICsgcmVjdC53aWR0aCAtIDIwO1xuICAgIGNvbnN0IGljb25ZID0gcmVjdC55ICsgMTA7XG4gICAgaWYgKGljb25TcmMuY2hhckF0KDApID09PSBcIkBcIikge1xuICAgICAgZHJhd0VtYmVkZGVkSW1hZ2UoZywgaWNvblgsIGljb25ZLCBpY29uU3JjLnN1YnN0cigxKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRyYXdJbWFnZShnLCBpY29uWCwgaWNvblksIGljb25TcmMpO1xuICAgIH1cbiAgfVxuICBfZHJhd1RleHRDYW5kaWRhdGVGdW5jKGNvbmYyLCBoYXNLYXRleChhY3Rvci5kZXNjcmlwdGlvbikpKFxuICAgIGFjdG9yLmRlc2NyaXB0aW9uLFxuICAgIGcsXG4gICAgcmVjdC54LFxuICAgIHJlY3QueSxcbiAgICByZWN0LndpZHRoLFxuICAgIHJlY3QuaGVpZ2h0LFxuICAgIHsgY2xhc3M6IGBhY3RvciAke0FDVE9SX0JPWF9DTEFTU31gIH0sXG4gICAgY29uZjJcbiAgKTtcbiAgbGV0IGhlaWdodCA9IGFjdG9yLmhlaWdodDtcbiAgY29uc3QgbGFzdFBhdGggPSBjeWxpbmRlckdyb3VwLnNlbGVjdChcInBhdGg6bGFzdC1jaGlsZFwiKTtcbiAgaWYgKGxhc3RQYXRoLm5vZGUoKSkge1xuICAgIGNvbnN0IGJvdW5kczIgPSBsYXN0UGF0aC5ub2RlKCkuZ2V0QkJveCgpO1xuICAgIGFjdG9yLmhlaWdodCA9IGJvdW5kczIuaGVpZ2h0O1xuICAgIGhlaWdodCA9IGJvdW5kczIuaGVpZ2h0O1xuICB9XG4gIGlmICghaXNGb290ZXIpIHtcbiAgICBnLmF0dHIoXCJkYXRhLWV0XCIsIFwicGFydGljaXBhbnRcIik7XG4gICAgZy5hdHRyKFwiZGF0YS10eXBlXCIsIFwicXVldWVcIik7XG4gICAgZy5hdHRyKFwiZGF0YS1pZFwiLCBhY3Rvci5uYW1lKTtcbiAgfVxuICByZXR1cm4gaGVpZ2h0O1xufSwgXCJkcmF3QWN0b3JUeXBlUXVldWVcIik7XG52YXIgZHJhd0FjdG9yVHlwZUNvbnRyb2wgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIGFjdG9yLCBjb25mMiwgaXNGb290ZXIsIGRpYWdyYW1JZCwgYWN0b3JJbmRleE1hcCkge1xuICBjb25zdCBhY3RvclkgPSBpc0Zvb3RlciA/IGFjdG9yLnN0b3B5IDogYWN0b3Iuc3RhcnR5O1xuICBjb25zdCBjZW50ZXIgPSBhY3Rvci54ICsgYWN0b3Iud2lkdGggLyAyO1xuICBjb25zdCBjZW50ZXJZID0gYWN0b3JZICsgNzU7XG4gIGNvbnN0IHsgbG9vaywgdGhlbWUsIHRoZW1lVmFyaWFibGVzIH0gPSBjb25mMjtcbiAgY29uc3QgeyBia2dDb2xvckFycmF5LCBib3JkZXJDb2xvckFycmF5LCBhY3RvckJvcmRlciwgYWN0b3JCa2cgfSA9IHRoZW1lVmFyaWFibGVzO1xuICBjb25zdCBsaW5lID0gZWxlbS5hcHBlbmQoXCJnXCIpLmxvd2VyKCk7XG4gIGlmICghaXNGb290ZXIpIHtcbiAgICBhY3RvckNudCsrO1xuICAgIGxpbmUuYXBwZW5kKFwibGluZVwiKS5hdHRyKFwiaWRcIiwgXCJhY3RvclwiICsgYWN0b3JDbnQpLmF0dHIoXCJ4MVwiLCBjZW50ZXIpLmF0dHIoXCJ5MVwiLCBjZW50ZXJZKS5hdHRyKFwieDJcIiwgY2VudGVyKS5hdHRyKFwieTJcIiwgMmUzKS5hdHRyKFwiY2xhc3NcIiwgXCJhY3Rvci1saW5lIDIwMFwiKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIFwiMC41cHhcIikuYXR0cihcInN0cm9rZVwiLCBcIiM5OTlcIikuYXR0cihcIm5hbWVcIiwgYWN0b3IubmFtZSkuYXR0cihcImRhdGEtZXRcIiwgXCJsaWZlLWxpbmVcIikuYXR0cihcImRhdGEtaWRcIiwgYWN0b3IubmFtZSk7XG4gICAgYWN0b3IuYWN0b3JDbnQgPSBhY3RvckNudDtcbiAgfVxuICBjb25zdCBhY3RFbGVtID0gZWxlbS5hcHBlbmQoXCJnXCIpO1xuICBsZXQgY3NzQ2xhc3MgPSBBQ1RPUl9NQU5fRklHVVJFX0NMQVNTO1xuICBpZiAoaXNGb290ZXIpIHtcbiAgICBjc3NDbGFzcyArPSBgICR7Qk9UVE9NX0FDVE9SX0NMQVNTfWA7XG4gIH0gZWxzZSB7XG4gICAgY3NzQ2xhc3MgKz0gYCAke1RPUF9BQ1RPUl9DTEFTU31gO1xuICB9XG4gIGFjdEVsZW0uYXR0cihcImNsYXNzXCIsIGNzc0NsYXNzKTtcbiAgYWN0RWxlbS5hdHRyKFwibmFtZVwiLCBhY3Rvci5uYW1lKTtcbiAgY29uc3QgcmVjdCA9IGdldE5vdGVSZWN0KCk7XG4gIHJlY3QueCA9IGFjdG9yLng7XG4gIHJlY3QueSA9IGFjdG9yWTtcbiAgcmVjdC5maWxsID0gXCIjZWFlYWVhXCI7XG4gIHJlY3Qud2lkdGggPSBhY3Rvci53aWR0aDtcbiAgcmVjdC5oZWlnaHQgPSBhY3Rvci5oZWlnaHQ7XG4gIHJlY3QuY2xhc3MgPSBcImFjdG9yXCI7XG4gIGNvbnN0IGN4ID0gYWN0b3IueCArIGFjdG9yLndpZHRoIC8gMjtcbiAgY29uc3QgY3kgPSBhY3RvclkgKyAzMjtcbiAgY29uc3QgciA9IDIyO1xuICBhY3RFbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBkaWFncmFtSWQgKyBcIi1maWxsZWQtaGVhZC1jb250cm9sXCIpLmF0dHIoXCJyZWZYXCIsIDExKS5hdHRyKFwicmVmWVwiLCA1LjgpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAyMCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAyOCkuYXR0cihcIm9yaWVudFwiLCBcIjE3Mi41XCIpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMS4yKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSAxNC40IDUuNiBMIDcuMiAxMC40IEwgOC44IDUuNiBMIDcuMiAwLjggWlwiKTtcbiAgYWN0RWxlbS5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImN4XCIsIGN4KS5hdHRyKFwiY3lcIiwgY3kpLmF0dHIoXCJyXCIsIHIpLmF0dHIoXCJmaWx0ZXJcIiwgYCR7bG9vayA9PT0gXCJuZW9cIiA/IFwidXJsKCNkcm9wLXNoYWRvdylcIiA6IFwiXCJ9YCk7XG4gIGFjdEVsZW0uYXBwZW5kKFwibGluZVwiKS5hdHRyKFwibWFya2VyLWVuZFwiLCBcInVybCgjXCIgKyBkaWFncmFtSWQgKyBcIi1maWxsZWQtaGVhZC1jb250cm9sKVwiKS5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHtjeH0sICR7Y3kgLSByfSlgKTtcbiAgY29uc3QgYWN0b3JDb3VudCA9IGFjdG9ySW5kZXhNYXAuZ2V0KGFjdG9yLm5hbWUpID8/IDA7XG4gIGlmIChDT0xPUl9USEVNRVMuaGFzKHRoZW1lKSkge1xuICAgIGFjdEVsZW0uc3R5bGUoXCJzdHJva2VcIiwgYm9yZGVyQ29sb3JBcnJheVthY3RvckNvdW50ICUgYm9yZGVyQ29sb3JBcnJheS5sZW5ndGhdKTtcbiAgICBhY3RFbGVtLnN0eWxlKFwiZmlsbFwiLCBia2dDb2xvckFycmF5W2FjdG9yQ291bnQgJSBib3JkZXJDb2xvckFycmF5Lmxlbmd0aF0pO1xuICB9IGVsc2Uge1xuICAgIGFjdEVsZW0uc3R5bGUoXCJzdHJva2VcIiwgYWN0b3JCb3JkZXIpO1xuICAgIGFjdEVsZW0uc3R5bGUoXCJmaWxsXCIsIGFjdG9yQmtnKTtcbiAgfVxuICBjb25zdCBib3VuZHMyID0gYWN0RWxlbS5ub2RlKCkuZ2V0QkJveCgpO1xuICBhY3Rvci5oZWlnaHQgPSBib3VuZHMyLmhlaWdodCArIDIgKiAoY29uZjI/LnNlcXVlbmNlPy5sYWJlbEJveEhlaWdodCA/PyAwKTtcbiAgX2RyYXdUZXh0Q2FuZGlkYXRlRnVuYyhjb25mMiwgaGFzS2F0ZXgoYWN0b3IuZGVzY3JpcHRpb24pKShcbiAgICBhY3Rvci5kZXNjcmlwdGlvbixcbiAgICBhY3RFbGVtLFxuICAgIHJlY3QueCxcbiAgICByZWN0LnkgKyByICsgKCFpc0Zvb3RlciA/IDEyIDogNSksXG4gICAgcmVjdC53aWR0aCxcbiAgICByZWN0LmhlaWdodCxcbiAgICB7IGNsYXNzOiBgYWN0b3IgJHtBQ1RPUl9NQU5fRklHVVJFX0NMQVNTfWAgfSxcbiAgICBjb25mMlxuICApO1xuICBpZiAoIWlzRm9vdGVyKSB7XG4gICAgYWN0RWxlbS5hdHRyKFwiZGF0YS1ldFwiLCBcInBhcnRpY2lwYW50XCIpO1xuICAgIGFjdEVsZW0uYXR0cihcImRhdGEtdHlwZVwiLCBcImNvbnRyb2xcIik7XG4gICAgYWN0RWxlbS5hdHRyKFwiZGF0YS1pZFwiLCBhY3Rvci5uYW1lKTtcbiAgfVxuICByZXR1cm4gYWN0b3IuaGVpZ2h0O1xufSwgXCJkcmF3QWN0b3JUeXBlQ29udHJvbFwiKTtcbnZhciBkcmF3QWN0b3JUeXBlRW50aXR5ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihlbGVtLCBhY3RvciwgY29uZjIsIGlzRm9vdGVyLCBhY3RvckluZGV4TWFwKSB7XG4gIGNvbnN0IGFjdG9yWSA9IGlzRm9vdGVyID8gYWN0b3Iuc3RvcHkgOiBhY3Rvci5zdGFydHk7XG4gIGNvbnN0IGNlbnRlciA9IGFjdG9yLnggKyBhY3Rvci53aWR0aCAvIDI7XG4gIGNvbnN0IGNlbnRlclkgPSBhY3RvclkgKyA3NTtcbiAgY29uc3QgeyBsb29rLCB0aGVtZSwgdGhlbWVWYXJpYWJsZXMgfSA9IGNvbmYyO1xuICBjb25zdCB7IGJrZ0NvbG9yQXJyYXksIGJvcmRlckNvbG9yQXJyYXkgfSA9IHRoZW1lVmFyaWFibGVzO1xuICBjb25zdCBsaW5lID0gZWxlbS5hcHBlbmQoXCJnXCIpLmxvd2VyKCk7XG4gIGNvbnN0IGFjdEVsZW0gPSBlbGVtLmFwcGVuZChcImdcIik7XG4gIGxldCBjc3NDbGFzcyA9IFwiYWN0b3JcIjtcbiAgaWYgKGlzRm9vdGVyKSB7XG4gICAgY3NzQ2xhc3MgKz0gYCAke0JPVFRPTV9BQ1RPUl9DTEFTU31gO1xuICB9IGVsc2Uge1xuICAgIGNzc0NsYXNzICs9IGAgJHtUT1BfQUNUT1JfQ0xBU1N9YDtcbiAgfVxuICBhY3RFbGVtLmF0dHIoXCJjbGFzc1wiLCBjc3NDbGFzcyk7XG4gIGFjdEVsZW0uYXR0cihcIm5hbWVcIiwgYWN0b3IubmFtZSk7XG4gIGNvbnN0IHJlY3QgPSBnZXROb3RlUmVjdCgpO1xuICByZWN0LnggPSBhY3Rvci54O1xuICByZWN0LnkgPSBhY3Rvclk7XG4gIHJlY3QuZmlsbCA9IFwiI2VhZWFlYVwiO1xuICByZWN0LndpZHRoID0gYWN0b3Iud2lkdGg7XG4gIHJlY3QuaGVpZ2h0ID0gYWN0b3IuaGVpZ2h0O1xuICByZWN0LmNsYXNzID0gXCJhY3RvclwiO1xuICBjb25zdCBjeCA9IGFjdG9yLnggKyBhY3Rvci53aWR0aCAvIDI7XG4gIGNvbnN0IGN5ID0gYWN0b3JZICsgKCFpc0Zvb3RlciA/IDI1IDogMTApO1xuICBjb25zdCByID0gMjI7XG4gIGFjdEVsZW0uYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJjeFwiLCBjeCkuYXR0cihcImN5XCIsIGN5KS5hdHRyKFwiclwiLCByKS5hdHRyKFwid2lkdGhcIiwgYWN0b3Iud2lkdGgpLmF0dHIoXCJoZWlnaHRcIiwgYWN0b3IuaGVpZ2h0KTtcbiAgYWN0RWxlbS5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJ4MVwiLCBjeCAtIHIpLmF0dHIoXCJ4MlwiLCBjeCArIHIpLmF0dHIoXCJ5MVwiLCBjeSArIHIpLmF0dHIoXCJ5MlwiLCBjeSArIHIpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMik7XG4gIGlmIChsb29rID09PSBcIm5lb1wiKSB7XG4gICAgYWN0RWxlbS5hdHRyKFwiZmlsdGVyXCIsIFwidXJsKCNkcm9wLXNoYWRvdylcIik7XG4gIH1cbiAgY29uc3QgYWN0b3JDb3VudCA9IGFjdG9ySW5kZXhNYXAuZ2V0KGFjdG9yLm5hbWUpID8/IDA7XG4gIGlmIChDT0xPUl9USEVNRVMuaGFzKHRoZW1lKSkge1xuICAgIGFjdEVsZW0uc3R5bGUoXCJzdHJva2VcIiwgYm9yZGVyQ29sb3JBcnJheVthY3RvckNvdW50ICUgYm9yZGVyQ29sb3JBcnJheS5sZW5ndGhdKTtcbiAgICBhY3RFbGVtLnN0eWxlKFwiZmlsbFwiLCBia2dDb2xvckFycmF5W2FjdG9yQ291bnQgJSBib3JkZXJDb2xvckFycmF5Lmxlbmd0aF0pO1xuICB9XG4gIGNvbnN0IGJvdW5kczIgPSBhY3RFbGVtLm5vZGUoKS5nZXRCQm94KCk7XG4gIGFjdG9yLmhlaWdodCA9IGJvdW5kczIuaGVpZ2h0ICsgKGNvbmYyPy5zZXF1ZW5jZT8ubGFiZWxCb3hIZWlnaHQgPz8gMCk7XG4gIGlmICghaXNGb290ZXIpIHtcbiAgICBhY3RvckNudCsrO1xuICAgIGxpbmUuYXBwZW5kKFwibGluZVwiKS5hdHRyKFwiaWRcIiwgXCJhY3RvclwiICsgYWN0b3JDbnQpLmF0dHIoXCJ4MVwiLCBjZW50ZXIpLmF0dHIoXCJ5MVwiLCBjZW50ZXJZKS5hdHRyKFwieDJcIiwgY2VudGVyKS5hdHRyKFwieTJcIiwgMmUzKS5hdHRyKFwiY2xhc3NcIiwgXCJhY3Rvci1saW5lIDIwMFwiKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIFwiMC41cHhcIikuYXR0cihcInN0cm9rZVwiLCBcIiM5OTlcIikuYXR0cihcIm5hbWVcIiwgYWN0b3IubmFtZSkuYXR0cihcImRhdGEtZXRcIiwgXCJsaWZlLWxpbmVcIikuYXR0cihcImRhdGEtaWRcIiwgYWN0b3IubmFtZSk7XG4gICAgYWN0b3IuYWN0b3JDbnQgPSBhY3RvckNudDtcbiAgfVxuICBfZHJhd1RleHRDYW5kaWRhdGVGdW5jKGNvbmYyLCBoYXNLYXRleChhY3Rvci5kZXNjcmlwdGlvbikpKFxuICAgIGFjdG9yLmRlc2NyaXB0aW9uLFxuICAgIGFjdEVsZW0sXG4gICAgcmVjdC54LFxuICAgIHJlY3QueSArICghaXNGb290ZXIgPyAzMCA6IDE1KSxcbiAgICByZWN0LndpZHRoLFxuICAgIHJlY3QuaGVpZ2h0LFxuICAgIHsgY2xhc3M6IGBhY3RvciAke0FDVE9SX01BTl9GSUdVUkVfQ0xBU1N9YCB9LFxuICAgIGNvbmYyXG4gICk7XG4gIGlmICghaXNGb290ZXIpIHtcbiAgICBhY3RFbGVtLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgkezB9LCAke3IgLyAyIC0gNX0pYCk7XG4gICAgYWN0RWxlbS5hdHRyKFwiZGF0YS1ldFwiLCBcInBhcnRpY2lwYW50XCIpO1xuICAgIGFjdEVsZW0uYXR0cihcImRhdGEtdHlwZVwiLCBcImVudGl0eVwiKTtcbiAgICBhY3RFbGVtLmF0dHIoXCJkYXRhLWlkXCIsIGFjdG9yLm5hbWUpO1xuICB9IGVsc2Uge1xuICAgIGFjdEVsZW0uYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7MH0sICR7cn0pYCk7XG4gIH1cbiAgcmV0dXJuIGFjdG9yLmhlaWdodDtcbn0sIFwiZHJhd0FjdG9yVHlwZUVudGl0eVwiKTtcbnZhciBkcmF3QWN0b3JUeXBlRGF0YWJhc2UgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIGFjdG9yLCBjb25mMiwgaXNGb290ZXIsIGFjdG9ySW5kZXhNYXApIHtcbiAgY29uc3QgYWN0b3JZID0gaXNGb290ZXIgPyBhY3Rvci5zdG9weSA6IGFjdG9yLnN0YXJ0eTtcbiAgY29uc3QgY2VudGVyID0gYWN0b3IueCArIGFjdG9yLndpZHRoIC8gMjtcbiAgY29uc3QgY2VudGVyWSA9IGFjdG9yWSArIGFjdG9yLmhlaWdodCArIDIgKiBjb25mMi5ib3hUZXh0TWFyZ2luO1xuICBjb25zdCB7IHRoZW1lLCB0aGVtZVZhcmlhYmxlcywgbG9vayB9ID0gY29uZjI7XG4gIGNvbnN0IHsgYmtnQ29sb3JBcnJheSwgYm9yZGVyQ29sb3JBcnJheSwgYWN0b3JCb3JkZXIgfSA9IHRoZW1lVmFyaWFibGVzO1xuICBjb25zdCBib3hwbHVzTGluZUdyb3VwID0gZWxlbS5hcHBlbmQoXCJnXCIpLmxvd2VyKCk7XG4gIGxldCBnID0gYm94cGx1c0xpbmVHcm91cDtcbiAgaWYgKCFpc0Zvb3Rlcikge1xuICAgIGFjdG9yQ250Kys7XG4gICAgaWYgKE9iamVjdC5rZXlzKGFjdG9yLmxpbmtzIHx8IHt9KS5sZW5ndGggJiYgIWNvbmYyLmZvcmNlTWVudXMpIHtcbiAgICAgIGcuYXR0cihcIm9uY2xpY2tcIiwgcG9wdXBNZW51VG9nZ2xlKGBhY3RvciR7YWN0b3JDbnR9X3BvcHVwYCkpLmF0dHIoXCJjdXJzb3JcIiwgXCJwb2ludGVyXCIpO1xuICAgIH1cbiAgICBnLmFwcGVuZChcImxpbmVcIikuYXR0cihcImlkXCIsIFwiYWN0b3JcIiArIGFjdG9yQ250KS5hdHRyKFwieDFcIiwgY2VudGVyKS5hdHRyKFwieTFcIiwgY2VudGVyWSkuYXR0cihcIngyXCIsIGNlbnRlcikuYXR0cihcInkyXCIsIDJlMykuYXR0cihcImNsYXNzXCIsIFwiYWN0b3ItbGluZSAyMDBcIikuYXR0cihcInN0cm9rZS13aWR0aFwiLCBcIjAuNXB4XCIpLmF0dHIoXCJzdHJva2VcIiwgXCIjOTk5XCIpLmF0dHIoXCJuYW1lXCIsIGFjdG9yLm5hbWUpLmF0dHIoXCJkYXRhLWV0XCIsIFwibGlmZS1saW5lXCIpLmF0dHIoXCJkYXRhLWlkXCIsIGFjdG9yLm5hbWUpO1xuICAgIGcgPSBib3hwbHVzTGluZUdyb3VwLmFwcGVuZChcImdcIik7XG4gICAgYWN0b3IuYWN0b3JDbnQgPSBhY3RvckNudDtcbiAgICBpZiAoYWN0b3IubGlua3MgIT0gbnVsbCkge1xuICAgICAgZy5hdHRyKFwiaWRcIiwgXCJyb290LVwiICsgYWN0b3JDbnQpO1xuICAgIH1cbiAgICBpZiAobG9vayA9PT0gXCJuZW9cIikge1xuICAgICAgZy5hdHRyKFwiZGF0YS1sb29rXCIsIFwibmVvXCIpO1xuICAgIH1cbiAgfVxuICBjb25zdCByZWN0ID0gZ2V0Tm90ZVJlY3QoKTtcbiAgbGV0IGNzc2NsYXNzID0gXCJhY3RvclwiO1xuICBpZiAoYWN0b3IucHJvcGVydGllcz8uY2xhc3MpIHtcbiAgICBjc3NjbGFzcyA9IGFjdG9yLnByb3BlcnRpZXMuY2xhc3M7XG4gIH0gZWxzZSB7XG4gICAgcmVjdC5maWxsID0gXCIjZWFlYWVhXCI7XG4gIH1cbiAgaWYgKGlzRm9vdGVyKSB7XG4gICAgY3NzY2xhc3MgKz0gYCAke0JPVFRPTV9BQ1RPUl9DTEFTU31gO1xuICB9IGVsc2Uge1xuICAgIGNzc2NsYXNzICs9IGAgJHtUT1BfQUNUT1JfQ0xBU1N9YDtcbiAgfVxuICByZWN0LnggPSBhY3Rvci54O1xuICByZWN0LnkgPSBhY3Rvclk7XG4gIHJlY3Qud2lkdGggPSBhY3Rvci53aWR0aDtcbiAgcmVjdC5oZWlnaHQgPSBhY3Rvci5oZWlnaHQ7XG4gIHJlY3QuY2xhc3MgPSBjc3NjbGFzcztcbiAgcmVjdC5uYW1lID0gYWN0b3IubmFtZTtcbiAgcmVjdC54ID0gYWN0b3IueDtcbiAgcmVjdC55ID0gYWN0b3JZO1xuICBjb25zdCB3ID0gcmVjdC53aWR0aCAvIDM7XG4gIGNvbnN0IGggPSByZWN0LndpZHRoIC8gMztcbiAgY29uc3QgcnggPSB3IC8gMjtcbiAgY29uc3QgcnkgPSByeCAvICgyLjUgKyB3IC8gNTApO1xuICBjb25zdCBjeWxpbmRlckdyb3VwID0gZy5hcHBlbmQoXCJnXCIpO1xuICBjeWxpbmRlckdyb3VwLmF0dHIoXCJjbGFzc1wiLCBjc3NjbGFzcyk7XG4gIGNvbnN0IGQgPSBgXG4gIE0gJHtyZWN0Lnh9LCR7cmVjdC55ICsgcnl9XG4gIGEgJHtyeH0sJHtyeX0gMCAwIDAgJHt3fSwwXG4gIGEgJHtyeH0sJHtyeX0gMCAwIDAgLSR7d30sMFxuICBsIDAsJHtoIC0gMiAqIHJ5fVxuICBhICR7cnh9LCR7cnl9IDAgMCAwICR7d30sMFxuICBsIDAsLSR7aCAtIDIgKiByeX1cbmA7XG4gIGN5bGluZGVyR3JvdXAuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBkKTtcbiAgaWYgKGxvb2sgPT09IFwibmVvXCIpIHtcbiAgICBjeWxpbmRlckdyb3VwLmF0dHIoXCJmaWx0ZXJcIiwgXCJ1cmwoI2Ryb3Atc2hhZG93KVwiKTtcbiAgfVxuICBjb25zdCBhY3RvckNvdW50ID0gYWN0b3JJbmRleE1hcC5nZXQoYWN0b3IubmFtZSkgPz8gMDtcbiAgaWYgKENPTE9SX1RIRU1FUy5oYXModGhlbWUpKSB7XG4gICAgY3lsaW5kZXJHcm91cC5zdHlsZShcInN0cm9rZVwiLCBib3JkZXJDb2xvckFycmF5W2FjdG9yQ291bnQgJSBib3JkZXJDb2xvckFycmF5Lmxlbmd0aF0pO1xuICAgIGN5bGluZGVyR3JvdXAuc3R5bGUoXCJmaWxsXCIsIGJrZ0NvbG9yQXJyYXlbYWN0b3JDb3VudCAlIGJvcmRlckNvbG9yQXJyYXkubGVuZ3RoXSk7XG4gIH0gZWxzZSB7XG4gICAgY3lsaW5kZXJHcm91cC5zdHlsZShcInN0cm9rZVwiLCBhY3RvckJvcmRlcik7XG4gIH1cbiAgY3lsaW5kZXJHcm91cC5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHt3fSwgJHtyeX0pYCk7XG4gIGFjdG9yLnJlY3REYXRhID0gcmVjdDtcbiAgX2RyYXdUZXh0Q2FuZGlkYXRlRnVuYyhjb25mMiwgaGFzS2F0ZXgoYWN0b3IuZGVzY3JpcHRpb24pKShcbiAgICBhY3Rvci5kZXNjcmlwdGlvbixcbiAgICBnLFxuICAgIHJlY3QueCxcbiAgICByZWN0LnkgKyAzNSxcbiAgICByZWN0LndpZHRoLFxuICAgIHJlY3QuaGVpZ2h0LFxuICAgIHsgY2xhc3M6IGBhY3RvciAke0FDVE9SX0JPWF9DTEFTU31gIH0sXG4gICAgY29uZjJcbiAgKTtcbiAgY29uc3QgbGFzdFBhdGggPSBjeWxpbmRlckdyb3VwLnNlbGVjdChcInBhdGg6bGFzdC1jaGlsZFwiKTtcbiAgaWYgKGxhc3RQYXRoLm5vZGUoKSkge1xuICAgIGNvbnN0IGJvdW5kczIgPSBsYXN0UGF0aC5ub2RlKCkuZ2V0QkJveCgpO1xuICAgIGFjdG9yLmhlaWdodCA9IGJvdW5kczIuaGVpZ2h0ICsgKGNvbmYyLnNlcXVlbmNlLmxhYmVsQm94SGVpZ2h0ID8/IDApO1xuICB9XG4gIGlmICghaXNGb290ZXIpIHtcbiAgICBnLmF0dHIoXCJkYXRhLWV0XCIsIFwicGFydGljaXBhbnRcIik7XG4gICAgZy5hdHRyKFwiZGF0YS10eXBlXCIsIFwiZGF0YWJhc2VcIik7XG4gICAgZy5hdHRyKFwiZGF0YS1pZFwiLCBhY3Rvci5uYW1lKTtcbiAgfVxuICByZXR1cm4gYWN0b3IuaGVpZ2h0O1xufSwgXCJkcmF3QWN0b3JUeXBlRGF0YWJhc2VcIik7XG52YXIgZHJhd0FjdG9yVHlwZUJvdW5kYXJ5ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihlbGVtLCBhY3RvciwgY29uZjIsIGlzRm9vdGVyLCBhY3RvckluZGV4TWFwKSB7XG4gIGNvbnN0IGFjdG9yWSA9IGlzRm9vdGVyID8gYWN0b3Iuc3RvcHkgOiBhY3Rvci5zdGFydHk7XG4gIGNvbnN0IGNlbnRlciA9IGFjdG9yLnggKyBhY3Rvci53aWR0aCAvIDI7XG4gIGNvbnN0IGNlbnRlclkgPSBhY3RvclkgKyA4MDtcbiAgY29uc3QgcmFkaXVzID0gMjI7XG4gIGNvbnN0IGxpbmUgPSBlbGVtLmFwcGVuZChcImdcIikubG93ZXIoKTtcbiAgY29uc3QgeyBsb29rLCB0aGVtZSwgdGhlbWVWYXJpYWJsZXMgfSA9IGNvbmYyO1xuICBjb25zdCB7IGJrZ0NvbG9yQXJyYXksIGJvcmRlckNvbG9yQXJyYXksIGFjdG9yQm9yZGVyIH0gPSB0aGVtZVZhcmlhYmxlcztcbiAgaWYgKCFpc0Zvb3Rlcikge1xuICAgIGFjdG9yQ250Kys7XG4gICAgbGluZS5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJpZFwiLCBcImFjdG9yXCIgKyBhY3RvckNudCkuYXR0cihcIngxXCIsIGNlbnRlcikuYXR0cihcInkxXCIsIGNlbnRlclkpLmF0dHIoXCJ4MlwiLCBjZW50ZXIpLmF0dHIoXCJ5MlwiLCAyZTMpLmF0dHIoXCJjbGFzc1wiLCBcImFjdG9yLWxpbmUgMjAwXCIpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgXCIwLjVweFwiKS5hdHRyKFwic3Ryb2tlXCIsIFwiIzk5OVwiKS5hdHRyKFwibmFtZVwiLCBhY3Rvci5uYW1lKS5hdHRyKFwiZGF0YS1ldFwiLCBcImxpZmUtbGluZVwiKS5hdHRyKFwiZGF0YS1pZFwiLCBhY3Rvci5uYW1lKTtcbiAgICBhY3Rvci5hY3RvckNudCA9IGFjdG9yQ250O1xuICB9XG4gIGNvbnN0IGFjdEVsZW0gPSBlbGVtLmFwcGVuZChcImdcIik7XG4gIGxldCBjc3NDbGFzcyA9IEFDVE9SX01BTl9GSUdVUkVfQ0xBU1M7XG4gIGlmIChpc0Zvb3Rlcikge1xuICAgIGNzc0NsYXNzICs9IGAgJHtCT1RUT01fQUNUT1JfQ0xBU1N9YDtcbiAgfSBlbHNlIHtcbiAgICBjc3NDbGFzcyArPSBgICR7VE9QX0FDVE9SX0NMQVNTfWA7XG4gIH1cbiAgYWN0RWxlbS5hdHRyKFwiY2xhc3NcIiwgY3NzQ2xhc3MpO1xuICBhY3RFbGVtLmF0dHIoXCJuYW1lXCIsIGFjdG9yLm5hbWUpO1xuICBjb25zdCByZWN0ID0gZ2V0Tm90ZVJlY3QoKTtcbiAgcmVjdC54ID0gYWN0b3IueDtcbiAgcmVjdC55ID0gYWN0b3JZO1xuICByZWN0LmZpbGwgPSBcIiNlYWVhZWFcIjtcbiAgcmVjdC53aWR0aCA9IGFjdG9yLndpZHRoO1xuICByZWN0LmhlaWdodCA9IGFjdG9yLmhlaWdodDtcbiAgcmVjdC5jbGFzcyA9IFwiYWN0b3JcIjtcbiAgYWN0RWxlbS5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJpZFwiLCBcImFjdG9yLW1hbi10b3Jzb1wiICsgYWN0b3JDbnQpLmF0dHIoXCJ4MVwiLCBhY3Rvci54ICsgYWN0b3Iud2lkdGggLyAyIC0gcmFkaXVzICogMi41KS5hdHRyKFwieTFcIiwgYWN0b3JZICsgMTIpLmF0dHIoXCJ4MlwiLCBhY3Rvci54ICsgYWN0b3Iud2lkdGggLyAyIC0gMTUpLmF0dHIoXCJ5MlwiLCBhY3RvclkgKyAxMik7XG4gIGFjdEVsZW0uYXBwZW5kKFwibGluZVwiKS5hdHRyKFwiaWRcIiwgXCJhY3Rvci1tYW4tYXJtc1wiICsgYWN0b3JDbnQpLmF0dHIoXCJ4MVwiLCBhY3Rvci54ICsgYWN0b3Iud2lkdGggLyAyIC0gcmFkaXVzICogMi41KS5hdHRyKFwieTFcIiwgYWN0b3JZICsgMikuYXR0cihcIngyXCIsIGFjdG9yLnggKyBhY3Rvci53aWR0aCAvIDIgLSByYWRpdXMgKiAyLjUpLmF0dHIoXCJ5MlwiLCBhY3RvclkgKyAyMik7XG4gIGFjdEVsZW0uYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJjeFwiLCBhY3Rvci54ICsgYWN0b3Iud2lkdGggLyAyKS5hdHRyKFwiY3lcIiwgYWN0b3JZICsgMTIpLmF0dHIoXCJyXCIsIHJhZGl1cyk7XG4gIGlmIChsb29rID09PSBcIm5lb1wiKSB7XG4gICAgYWN0RWxlbS5hdHRyKFwiZmlsdGVyXCIsIFwidXJsKCNkcm9wLXNoYWRvdylcIik7XG4gIH1cbiAgY29uc3QgYWN0b3JDb3VudCA9IGFjdG9ySW5kZXhNYXAuZ2V0KGFjdG9yLm5hbWUpID8/IDA7XG4gIGlmIChDT0xPUl9USEVNRVMuaGFzKHRoZW1lKSkge1xuICAgIGFjdEVsZW0uc3R5bGUoXCJzdHJva2VcIiwgYm9yZGVyQ29sb3JBcnJheVthY3RvckNvdW50ICUgYm9yZGVyQ29sb3JBcnJheS5sZW5ndGhdKTtcbiAgICBhY3RFbGVtLnN0eWxlKFwiZmlsbFwiLCBia2dDb2xvckFycmF5W2FjdG9yQ291bnQgJSBib3JkZXJDb2xvckFycmF5Lmxlbmd0aF0pO1xuICB9IGVsc2Uge1xuICAgIGFjdEVsZW0uc3R5bGUoXCJzdHJva2VcIiwgYWN0b3JCb3JkZXIpO1xuICB9XG4gIGNvbnN0IGJvdW5kczIgPSBhY3RFbGVtLm5vZGUoKS5nZXRCQm94KCk7XG4gIGFjdG9yLmhlaWdodCA9IGJvdW5kczIuaGVpZ2h0ICsgKGNvbmYyLnNlcXVlbmNlLmxhYmVsQm94SGVpZ2h0ID8/IDApO1xuICBfZHJhd1RleHRDYW5kaWRhdGVGdW5jKGNvbmYyLCBoYXNLYXRleChhY3Rvci5kZXNjcmlwdGlvbikpKFxuICAgIGFjdG9yLmRlc2NyaXB0aW9uLFxuICAgIGFjdEVsZW0sXG4gICAgcmVjdC54LFxuICAgIHJlY3QueSArIDE1LFxuICAgIHJlY3Qud2lkdGgsXG4gICAgcmVjdC5oZWlnaHQsXG4gICAgeyBjbGFzczogYGFjdG9yICR7QUNUT1JfTUFOX0ZJR1VSRV9DTEFTU31gIH0sXG4gICAgY29uZjJcbiAgKTtcbiAgYWN0RWxlbS5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoMCwke3JhZGl1cyAvIDIgKyAxMH0pYCk7XG4gIGlmICghaXNGb290ZXIpIHtcbiAgICBhY3RFbGVtLmF0dHIoXCJkYXRhLWV0XCIsIFwicGFydGljaXBhbnRcIik7XG4gICAgYWN0RWxlbS5hdHRyKFwiZGF0YS10eXBlXCIsIFwiYm91bmRhcnlcIik7XG4gICAgYWN0RWxlbS5hdHRyKFwiZGF0YS1pZFwiLCBhY3Rvci5uYW1lKTtcbiAgfVxuICByZXR1cm4gYWN0b3IuaGVpZ2h0O1xufSwgXCJkcmF3QWN0b3JUeXBlQm91bmRhcnlcIik7XG52YXIgZHJhd0FjdG9yVHlwZUFjdG9yID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihlbGVtLCBhY3RvciwgY29uZjIsIGlzRm9vdGVyLCBhY3RvckluZGV4TWFwKSB7XG4gIGNvbnN0IGFjdG9yWSA9IGlzRm9vdGVyID8gYWN0b3Iuc3RvcHkgOiBhY3Rvci5zdGFydHk7XG4gIGNvbnN0IGNlbnRlciA9IGFjdG9yLnggKyBhY3Rvci53aWR0aCAvIDI7XG4gIGNvbnN0IGNlbnRlclkgPSBhY3RvclkgKyA4MDtcbiAgY29uc3QgeyBsb29rLCB0aGVtZSwgdGhlbWVWYXJpYWJsZXMgfSA9IGNvbmYyO1xuICBjb25zdCB7IGJrZ0NvbG9yQXJyYXksIGJvcmRlckNvbG9yQXJyYXksIGFjdG9yQm9yZGVyIH0gPSB0aGVtZVZhcmlhYmxlcztcbiAgY29uc3QgbGluZSA9IGVsZW0uYXBwZW5kKFwiZ1wiKS5sb3dlcigpO1xuICBpZiAoIWlzRm9vdGVyKSB7XG4gICAgYWN0b3JDbnQrKztcbiAgICBsaW5lLmFwcGVuZChcImxpbmVcIikuYXR0cihcImlkXCIsIFwiYWN0b3JcIiArIGFjdG9yQ250KS5hdHRyKFwieDFcIiwgY2VudGVyKS5hdHRyKFwieTFcIiwgY2VudGVyWSkuYXR0cihcIngyXCIsIGNlbnRlcikuYXR0cihcInkyXCIsIDJlMykuYXR0cihcImNsYXNzXCIsIFwiYWN0b3ItbGluZSAyMDBcIikuYXR0cihcInN0cm9rZS13aWR0aFwiLCBcIjAuNXB4XCIpLmF0dHIoXCJzdHJva2VcIiwgXCIjOTk5XCIpLmF0dHIoXCJuYW1lXCIsIGFjdG9yLm5hbWUpLmF0dHIoXCJkYXRhLWV0XCIsIFwibGlmZS1saW5lXCIpLmF0dHIoXCJkYXRhLWlkXCIsIGFjdG9yLm5hbWUpO1xuICAgIGFjdG9yLmFjdG9yQ250ID0gYWN0b3JDbnQ7XG4gIH1cbiAgY29uc3QgYWN0RWxlbSA9IGVsZW0uYXBwZW5kKFwiZ1wiKTtcbiAgbGV0IGNzc0NsYXNzID0gQUNUT1JfTUFOX0ZJR1VSRV9DTEFTUztcbiAgaWYgKGlzRm9vdGVyKSB7XG4gICAgY3NzQ2xhc3MgKz0gYCAke0JPVFRPTV9BQ1RPUl9DTEFTU31gO1xuICB9IGVsc2Uge1xuICAgIGNzc0NsYXNzICs9IGAgJHtUT1BfQUNUT1JfQ0xBU1N9YDtcbiAgfVxuICBhY3RFbGVtLmF0dHIoXCJjbGFzc1wiLCBjc3NDbGFzcyk7XG4gIGFjdEVsZW0uYXR0cihcIm5hbWVcIiwgYWN0b3IubmFtZSk7XG4gIGlmICghaXNGb290ZXIpIHtcbiAgICBhY3RFbGVtLmF0dHIoXCJkYXRhLWV0XCIsIFwicGFydGljaXBhbnRcIikuYXR0cihcImRhdGEtdHlwZVwiLCBcImFjdG9yXCIpLmF0dHIoXCJkYXRhLWlkXCIsIGFjdG9yLm5hbWUpO1xuICB9XG4gIGNvbnN0IHNjYWxlID0gbG9vayA9PT0gXCJuZW9cIiA/IDAuNSA6IDE7XG4gIGNvbnN0IGFkanVzdGVkQWN0b3JZID0gbG9vayA9PT0gXCJuZW9cIiA/IGFjdG9yWSArICgxIC0gc2NhbGUpICogMzAgOiBhY3Rvclk7XG4gIGFjdEVsZW0uYXBwZW5kKFwibGluZVwiKS5hdHRyKFwiaWRcIiwgXCJhY3Rvci1tYW4tdG9yc29cIiArIGFjdG9yQ250KS5hdHRyKFwieDFcIiwgY2VudGVyKS5hdHRyKFwieTFcIiwgYWRqdXN0ZWRBY3RvclkgKyAyNSAqIHNjYWxlKS5hdHRyKFwieDJcIiwgY2VudGVyKS5hdHRyKFwieTJcIiwgYWRqdXN0ZWRBY3RvclkgKyA0NSAqIHNjYWxlKTtcbiAgYWN0RWxlbS5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJpZFwiLCBcImFjdG9yLW1hbi1hcm1zXCIgKyBhY3RvckNudCkuYXR0cihcIngxXCIsIGNlbnRlciAtIEFDVE9SX1RZUEVfV0lEVEggLyAyICogc2NhbGUpLmF0dHIoXCJ5MVwiLCBhZGp1c3RlZEFjdG9yWSArIDMzICogc2NhbGUpLmF0dHIoXCJ4MlwiLCBjZW50ZXIgKyBBQ1RPUl9UWVBFX1dJRFRIIC8gMiAqIHNjYWxlKS5hdHRyKFwieTJcIiwgYWRqdXN0ZWRBY3RvclkgKyAzMyAqIHNjYWxlKTtcbiAgYWN0RWxlbS5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJ4MVwiLCBjZW50ZXIgLSBBQ1RPUl9UWVBFX1dJRFRIIC8gMiAqIHNjYWxlKS5hdHRyKFwieTFcIiwgYWRqdXN0ZWRBY3RvclkgKyA2MCAqIHNjYWxlKS5hdHRyKFwieDJcIiwgY2VudGVyKS5hdHRyKFwieTJcIiwgYWRqdXN0ZWRBY3RvclkgKyA0NSAqIHNjYWxlKTtcbiAgYWN0RWxlbS5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJ4MVwiLCBjZW50ZXIpLmF0dHIoXCJ5MVwiLCBhZGp1c3RlZEFjdG9yWSArIDQ1ICogc2NhbGUpLmF0dHIoXCJ4MlwiLCBjZW50ZXIgKyAoQUNUT1JfVFlQRV9XSURUSCAvIDIgLSAyKSAqIHNjYWxlKS5hdHRyKFwieTJcIiwgYWRqdXN0ZWRBY3RvclkgKyA2MCAqIHNjYWxlKTtcbiAgY29uc3QgY2lyY2xlID0gYWN0RWxlbS5hcHBlbmQoXCJjaXJjbGVcIik7XG4gIGNpcmNsZS5hdHRyKFwiY3hcIiwgYWN0b3IueCArIGFjdG9yLndpZHRoIC8gMik7XG4gIGNpcmNsZS5hdHRyKFwiY3lcIiwgYWRqdXN0ZWRBY3RvclkgKyAxMCAqIHNjYWxlKTtcbiAgY2lyY2xlLmF0dHIoXCJyXCIsIDE1ICogc2NhbGUpO1xuICBjaXJjbGUuYXR0cihcIndpZHRoXCIsIGFjdG9yLndpZHRoICogc2NhbGUpO1xuICBjaXJjbGUuYXR0cihcImhlaWdodFwiLCBhY3Rvci5oZWlnaHQgKiBzY2FsZSk7XG4gIGNvbnN0IGJvdW5kczIgPSBhY3RFbGVtLm5vZGUoKS5nZXRCQm94KCk7XG4gIGFjdG9yLmhlaWdodCA9IGJvdW5kczIuaGVpZ2h0O1xuICBjb25zdCByZWN0ID0gZ2V0Tm90ZVJlY3QoKTtcbiAgcmVjdC54ID0gYWN0b3IueDtcbiAgcmVjdC55ID0gYWRqdXN0ZWRBY3Rvclk7XG4gIHJlY3QuZmlsbCA9IFwiI2VhZWFlYVwiO1xuICByZWN0LndpZHRoID0gYWN0b3Iud2lkdGg7XG4gIHJlY3QuaGVpZ2h0ID0gYWN0b3IuaGVpZ2h0IC8gc2NhbGU7XG4gIHJlY3QuY2xhc3MgPSBcImFjdG9yXCI7XG4gIHJlY3QucnggPSAzO1xuICByZWN0LnJ5ID0gMztcbiAgY29uc3QgYWN0b3JDb3VudCA9IGFjdG9ySW5kZXhNYXAuZ2V0KGFjdG9yLm5hbWUpID8/IDA7XG4gIGlmIChDT0xPUl9USEVNRVMuaGFzKHRoZW1lKSkge1xuICAgIGFjdEVsZW0uc3R5bGUoXCJzdHJva2VcIiwgYm9yZGVyQ29sb3JBcnJheVthY3RvckNvdW50ICUgYm9yZGVyQ29sb3JBcnJheS5sZW5ndGhdKTtcbiAgICBhY3RFbGVtLnN0eWxlKFwiZmlsbFwiLCBia2dDb2xvckFycmF5W2FjdG9yQ291bnQgJSBib3JkZXJDb2xvckFycmF5Lmxlbmd0aF0pO1xuICB9IGVsc2Uge1xuICAgIGFjdEVsZW0uc3R5bGUoXCJzdHJva2VcIiwgYWN0b3JCb3JkZXIpO1xuICB9XG4gIF9kcmF3VGV4dENhbmRpZGF0ZUZ1bmMoY29uZjIsIGhhc0thdGV4KGFjdG9yLmRlc2NyaXB0aW9uKSkoXG4gICAgYWN0b3IuZGVzY3JpcHRpb24sXG4gICAgYWN0RWxlbSxcbiAgICByZWN0LngsXG4gICAgYWRqdXN0ZWRBY3RvclkgKyAzNSAqIHNjYWxlIC0gKGxvb2sgPT09IFwibmVvXCIgPyAxMCA6IDApLFxuICAgIHJlY3Qud2lkdGgsXG4gICAgcmVjdC5oZWlnaHQsXG4gICAgeyBjbGFzczogYGFjdG9yICR7QUNUT1JfTUFOX0ZJR1VSRV9DTEFTU31gIH0sXG4gICAgY29uZjJcbiAgKTtcbiAgcmV0dXJuIGFjdG9yLmhlaWdodDtcbn0sIFwiZHJhd0FjdG9yVHlwZUFjdG9yXCIpO1xudmFyIGRyYXdBY3RvciA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgZnVuY3Rpb24oZWxlbSwgYWN0b3IsIGNvbmYyLCBpc0Zvb3RlciwgZGlhZ3JhbUlkLCBkaWFnT2JqLCBhY3RvckluZGV4TWFwKSB7XG4gIGNvbnN0IHJlc29sdmVkQWN0b3JJbmRleE1hcCA9IGFjdG9ySW5kZXhNYXAgPz8gbmV3IE1hcChcbiAgICBbLi4uZGlhZ09iai5kYi5nZXRBY3RvcnMoKS52YWx1ZXMoKV0ubWFwKChwYXJ0aWNpcGFudCwgaW5kZXgpID0+IFtwYXJ0aWNpcGFudC5uYW1lLCBpbmRleF0pXG4gICk7XG4gIHN3aXRjaCAoYWN0b3IudHlwZSkge1xuICAgIGNhc2UgXCJhY3RvclwiOlxuICAgICAgcmV0dXJuIGF3YWl0IGRyYXdBY3RvclR5cGVBY3RvcihlbGVtLCBhY3RvciwgY29uZjIsIGlzRm9vdGVyLCByZXNvbHZlZEFjdG9ySW5kZXhNYXApO1xuICAgIGNhc2UgXCJwYXJ0aWNpcGFudFwiOlxuICAgICAgcmV0dXJuIGF3YWl0IGRyYXdBY3RvclR5cGVQYXJ0aWNpcGFudChlbGVtLCBhY3RvciwgY29uZjIsIGlzRm9vdGVyLCByZXNvbHZlZEFjdG9ySW5kZXhNYXApO1xuICAgIGNhc2UgXCJib3VuZGFyeVwiOlxuICAgICAgcmV0dXJuIGF3YWl0IGRyYXdBY3RvclR5cGVCb3VuZGFyeShlbGVtLCBhY3RvciwgY29uZjIsIGlzRm9vdGVyLCByZXNvbHZlZEFjdG9ySW5kZXhNYXApO1xuICAgIGNhc2UgXCJjb250cm9sXCI6XG4gICAgICByZXR1cm4gYXdhaXQgZHJhd0FjdG9yVHlwZUNvbnRyb2woXG4gICAgICAgIGVsZW0sXG4gICAgICAgIGFjdG9yLFxuICAgICAgICBjb25mMixcbiAgICAgICAgaXNGb290ZXIsXG4gICAgICAgIGRpYWdyYW1JZCxcbiAgICAgICAgcmVzb2x2ZWRBY3RvckluZGV4TWFwXG4gICAgICApO1xuICAgIGNhc2UgXCJlbnRpdHlcIjpcbiAgICAgIHJldHVybiBhd2FpdCBkcmF3QWN0b3JUeXBlRW50aXR5KGVsZW0sIGFjdG9yLCBjb25mMiwgaXNGb290ZXIsIHJlc29sdmVkQWN0b3JJbmRleE1hcCk7XG4gICAgY2FzZSBcImRhdGFiYXNlXCI6XG4gICAgICByZXR1cm4gYXdhaXQgZHJhd0FjdG9yVHlwZURhdGFiYXNlKGVsZW0sIGFjdG9yLCBjb25mMiwgaXNGb290ZXIsIHJlc29sdmVkQWN0b3JJbmRleE1hcCk7XG4gICAgY2FzZSBcImNvbGxlY3Rpb25zXCI6XG4gICAgICByZXR1cm4gYXdhaXQgZHJhd0FjdG9yVHlwZUNvbGxlY3Rpb25zKGVsZW0sIGFjdG9yLCBjb25mMiwgaXNGb290ZXIsIHJlc29sdmVkQWN0b3JJbmRleE1hcCk7XG4gICAgY2FzZSBcInF1ZXVlXCI6XG4gICAgICByZXR1cm4gYXdhaXQgZHJhd0FjdG9yVHlwZVF1ZXVlKGVsZW0sIGFjdG9yLCBjb25mMiwgaXNGb290ZXIsIHJlc29sdmVkQWN0b3JJbmRleE1hcCk7XG4gIH1cbn0sIFwiZHJhd0FjdG9yXCIpO1xudmFyIGRyYXdCb3ggPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIGJveCwgY29uZjIpIHtcbiAgY29uc3QgYm94cGx1c1RleHRHcm91cCA9IGVsZW0uYXBwZW5kKFwiZ1wiKTtcbiAgY29uc3QgZyA9IGJveHBsdXNUZXh0R3JvdXA7XG4gIGRyYXdCYWNrZ3JvdW5kUmVjdDIoZywgYm94KTtcbiAgaWYgKGJveC5uYW1lKSB7XG4gICAgX2RyYXdUZXh0Q2FuZGlkYXRlRnVuYyhjb25mMikoXG4gICAgICBib3gubmFtZSxcbiAgICAgIGcsXG4gICAgICBib3gueCxcbiAgICAgIGJveC55ICsgY29uZjIuYm94VGV4dE1hcmdpbiArIChib3gudGV4dE1heEhlaWdodCB8fCAwKSAvIDIsXG4gICAgICBib3gud2lkdGgsXG4gICAgICAwLFxuICAgICAgeyBjbGFzczogXCJ0ZXh0XCIgfSxcbiAgICAgIGNvbmYyXG4gICAgKTtcbiAgfVxuICBnLmxvd2VyKCk7XG59LCBcImRyYXdCb3hcIik7XG52YXIgYW5jaG9yRWxlbWVudCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbSkge1xuICByZXR1cm4gZWxlbS5hcHBlbmQoXCJnXCIpO1xufSwgXCJhbmNob3JFbGVtZW50XCIpO1xudmFyIGRyYXdBY3RpdmF0aW9uID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihfZWxlbSwgYm91bmRzMiwgdmVydGljYWxQb3MsIGNvbmYyLCBhY3RvckFjdGl2YXRpb25zMiwgZGlhZ09iaiwgYWN0b3JJbmRleE1hcCkge1xuICBjb25zdCB7IHRoZW1lLCB0aGVtZVZhcmlhYmxlcyB9ID0gY29uZjI7XG4gIGNvbnN0IHsgYmtnQ29sb3JBcnJheSwgYm9yZGVyQ29sb3JBcnJheSwgbWFpbkJrZyB9ID0gdGhlbWVWYXJpYWJsZXM7XG4gIGNvbnN0IHJlY3QgPSBnZXROb3RlUmVjdCgpO1xuICBjb25zdCBnID0gYm91bmRzMi5hbmNob3JlZDtcbiAgY29uc3QgYWN0b3IgPSBib3VuZHMyLmFjdG9yO1xuICByZWN0LnggPSBib3VuZHMyLnN0YXJ0eDtcbiAgcmVjdC55ID0gYm91bmRzMi5zdGFydHk7XG4gIHJlY3QuY2xhc3MgPSBcImFjdGl2YXRpb25cIiArIGFjdG9yQWN0aXZhdGlvbnMyICUgMztcbiAgcmVjdC53aWR0aCA9IGJvdW5kczIuc3RvcHggLSBib3VuZHMyLnN0YXJ0eDtcbiAgcmVjdC5oZWlnaHQgPSB2ZXJ0aWNhbFBvcyAtIGJvdW5kczIuc3RhcnR5O1xuICBjb25zdCByZWN0RWxlbSA9IGRyYXdSZWN0MihnLCByZWN0KTtcbiAgY29uc3QgcmVzb2x2ZWRBY3RvckluZGV4TWFwID0gYWN0b3JJbmRleE1hcCA/PyBuZXcgTWFwKFxuICAgIFsuLi5kaWFnT2JqLmRiLmdldEFjdG9ycygpLnZhbHVlcygpXS5tYXAoKHBhcnRpY2lwYW50LCBpbmRleCkgPT4gW3BhcnRpY2lwYW50Lm5hbWUsIGluZGV4XSlcbiAgKTtcbiAgY29uc3QgYWN0b3JDb3VudCA9IHJlc29sdmVkQWN0b3JJbmRleE1hcC5nZXQoYWN0b3IpID8/IDA7XG4gIGlmIChDT0xPUl9USEVNRVMuaGFzKHRoZW1lKSkge1xuICAgIHJlY3RFbGVtLnN0eWxlKFwic3Ryb2tlXCIsIGJvcmRlckNvbG9yQXJyYXlbYWN0b3JDb3VudCAlIGJvcmRlckNvbG9yQXJyYXkubGVuZ3RoXSk7XG4gICAgcmVjdEVsZW0uc3R5bGUoXCJmaWxsXCIsIGJrZ0NvbG9yQXJyYXlbYWN0b3JDb3VudCAlIGJvcmRlckNvbG9yQXJyYXkubGVuZ3RoXSA/PyBtYWluQmtnKTtcbiAgfVxufSwgXCJkcmF3QWN0aXZhdGlvblwiKTtcbnZhciBkcmF3TG9vcCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgZnVuY3Rpb24oZWxlbSwgbG9vcE1vZGVsLCBsYWJlbFRleHQsIGNvbmYyLCBtc2cpIHtcbiAgY29uc3Qge1xuICAgIGJveE1hcmdpbixcbiAgICBib3hUZXh0TWFyZ2luLFxuICAgIGxhYmVsQm94SGVpZ2h0LFxuICAgIGxhYmVsQm94V2lkdGgsXG4gICAgbWVzc2FnZUZvbnRGYW1pbHk6IGZvbnRGYW1pbHksXG4gICAgbWVzc2FnZUZvbnRTaXplOiBmb250U2l6ZSxcbiAgICBtZXNzYWdlRm9udFdlaWdodDogZm9udFdlaWdodFxuICB9ID0gY29uZjI7XG4gIGNvbnN0IGcgPSBlbGVtLmFwcGVuZChcImdcIikuYXR0cihcImRhdGEtZXRcIiwgXCJjb250cm9sLXN0cnVjdHVyZVwiKS5hdHRyKFwiZGF0YS1pZFwiLCBcImlcIiArIG1zZy5pZCk7XG4gIGNvbnN0IGRyYXdMb29wTGluZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oc3RhcnR4LCBzdGFydHksIHN0b3B4LCBzdG9weSkge1xuICAgIHJldHVybiBnLmFwcGVuZChcImxpbmVcIikuYXR0cihcIngxXCIsIHN0YXJ0eCkuYXR0cihcInkxXCIsIHN0YXJ0eSkuYXR0cihcIngyXCIsIHN0b3B4KS5hdHRyKFwieTJcIiwgc3RvcHkpLmF0dHIoXCJjbGFzc1wiLCBcImxvb3BMaW5lXCIpO1xuICB9LCBcImRyYXdMb29wTGluZVwiKTtcbiAgZHJhd0xvb3BMaW5lKGxvb3BNb2RlbC5zdGFydHgsIGxvb3BNb2RlbC5zdGFydHksIGxvb3BNb2RlbC5zdG9weCwgbG9vcE1vZGVsLnN0YXJ0eSk7XG4gIGRyYXdMb29wTGluZShsb29wTW9kZWwuc3RvcHgsIGxvb3BNb2RlbC5zdGFydHksIGxvb3BNb2RlbC5zdG9weCwgbG9vcE1vZGVsLnN0b3B5KTtcbiAgZHJhd0xvb3BMaW5lKGxvb3BNb2RlbC5zdGFydHgsIGxvb3BNb2RlbC5zdG9weSwgbG9vcE1vZGVsLnN0b3B4LCBsb29wTW9kZWwuc3RvcHkpO1xuICBkcmF3TG9vcExpbmUobG9vcE1vZGVsLnN0YXJ0eCwgbG9vcE1vZGVsLnN0YXJ0eSwgbG9vcE1vZGVsLnN0YXJ0eCwgbG9vcE1vZGVsLnN0b3B5KTtcbiAgaWYgKGxvb3BNb2RlbC5zZWN0aW9ucyAhPT0gdm9pZCAwKSB7XG4gICAgbG9vcE1vZGVsLnNlY3Rpb25zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgZHJhd0xvb3BMaW5lKGxvb3BNb2RlbC5zdGFydHgsIGl0ZW0ueSwgbG9vcE1vZGVsLnN0b3B4LCBpdGVtLnkpLnN0eWxlKFxuICAgICAgICBcInN0cm9rZS1kYXNoYXJyYXlcIixcbiAgICAgICAgXCIzLCAzXCJcbiAgICAgICk7XG4gICAgfSk7XG4gIH1cbiAgbGV0IHR4dCA9IGdldFRleHRPYmooKTtcbiAgdHh0LnRleHQgPSBsYWJlbFRleHQ7XG4gIHR4dC54ID0gbG9vcE1vZGVsLnN0YXJ0eDtcbiAgdHh0LnkgPSBsb29wTW9kZWwuc3RhcnR5O1xuICB0eHQuZm9udEZhbWlseSA9IGZvbnRGYW1pbHk7XG4gIHR4dC5mb250U2l6ZSA9IGZvbnRTaXplO1xuICB0eHQuZm9udFdlaWdodCA9IGZvbnRXZWlnaHQ7XG4gIHR4dC5hbmNob3IgPSBcIm1pZGRsZVwiO1xuICB0eHQudmFsaWduID0gXCJtaWRkbGVcIjtcbiAgdHh0LnRzcGFuID0gZmFsc2U7XG4gIHR4dC53aWR0aCA9IE1hdGgubWF4KGxhYmVsQm94V2lkdGggPz8gMCwgNTApO1xuICB0eHQuaGVpZ2h0ID0gbGFiZWxCb3hIZWlnaHQgKyAoY29uZjIubG9vayA9PT0gXCJuZW9cIiA/IDE1IDogMCkgfHwgMjA7XG4gIHR4dC50ZXh0TWFyZ2luID0gYm94VGV4dE1hcmdpbjtcbiAgdHh0LmNsYXNzID0gXCJsYWJlbFRleHRcIjtcbiAgZHJhd0xhYmVsKGcsIHR4dCk7XG4gIHR4dCA9IGdldFRleHRPYmoyKCk7XG4gIHR4dC50ZXh0ID0gbG9vcE1vZGVsLnRpdGxlO1xuICB0eHQueCA9IGxvb3BNb2RlbC5zdGFydHggKyBsYWJlbEJveFdpZHRoIC8gMiArIChsb29wTW9kZWwuc3RvcHggLSBsb29wTW9kZWwuc3RhcnR4KSAvIDI7XG4gIHR4dC55ID0gbG9vcE1vZGVsLnN0YXJ0eSArIGJveE1hcmdpbiArIGJveFRleHRNYXJnaW47XG4gIHR4dC5hbmNob3IgPSBcIm1pZGRsZVwiO1xuICB0eHQudmFsaWduID0gXCJtaWRkbGVcIjtcbiAgdHh0LnRleHRNYXJnaW4gPSBib3hUZXh0TWFyZ2luO1xuICB0eHQuY2xhc3MgPSBcImxvb3BUZXh0XCI7XG4gIHR4dC5mb250RmFtaWx5ID0gZm9udEZhbWlseTtcbiAgdHh0LmZvbnRTaXplID0gZm9udFNpemU7XG4gIHR4dC5mb250V2VpZ2h0ID0gZm9udFdlaWdodDtcbiAgdHh0LndyYXAgPSB0cnVlO1xuICBsZXQgdGV4dEVsZW0gPSBoYXNLYXRleCh0eHQudGV4dCkgPyBhd2FpdCBkcmF3S2F0ZXgoZywgdHh0LCBsb29wTW9kZWwpIDogZHJhd1RleHQoZywgdHh0KTtcbiAgaWYgKGxvb3BNb2RlbC5zZWN0aW9uVGl0bGVzICE9PSB2b2lkIDApIHtcbiAgICBmb3IgKGNvbnN0IFtpZHgsIGl0ZW1dIG9mIE9iamVjdC5lbnRyaWVzKGxvb3BNb2RlbC5zZWN0aW9uVGl0bGVzKSkge1xuICAgICAgaWYgKGl0ZW0ubWVzc2FnZSkge1xuICAgICAgICB0eHQudGV4dCA9IGl0ZW0ubWVzc2FnZTtcbiAgICAgICAgdHh0LnggPSBsb29wTW9kZWwuc3RhcnR4ICsgKGxvb3BNb2RlbC5zdG9weCAtIGxvb3BNb2RlbC5zdGFydHgpIC8gMjtcbiAgICAgICAgdHh0LnkgPSBsb29wTW9kZWwuc2VjdGlvbnNbaWR4XS55ICsgYm94TWFyZ2luICsgYm94VGV4dE1hcmdpbjtcbiAgICAgICAgdHh0LmNsYXNzID0gXCJzZWN0aW9uVGl0bGVcIjtcbiAgICAgICAgdHh0LmFuY2hvciA9IFwibWlkZGxlXCI7XG4gICAgICAgIHR4dC52YWxpZ24gPSBcIm1pZGRsZVwiO1xuICAgICAgICB0eHQudHNwYW4gPSBmYWxzZTtcbiAgICAgICAgdHh0LmZvbnRGYW1pbHkgPSBmb250RmFtaWx5O1xuICAgICAgICB0eHQuZm9udFNpemUgPSBmb250U2l6ZTtcbiAgICAgICAgdHh0LmZvbnRXZWlnaHQgPSBmb250V2VpZ2h0O1xuICAgICAgICB0eHQud3JhcCA9IGxvb3BNb2RlbC53cmFwO1xuICAgICAgICBpZiAoaGFzS2F0ZXgodHh0LnRleHQpKSB7XG4gICAgICAgICAgbG9vcE1vZGVsLnN0YXJ0eSA9IGxvb3BNb2RlbC5zZWN0aW9uc1tpZHhdLnk7XG4gICAgICAgICAgYXdhaXQgZHJhd0thdGV4KGcsIHR4dCwgbG9vcE1vZGVsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkcmF3VGV4dChnLCB0eHQpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzZWN0aW9uSGVpZ2h0ID0gTWF0aC5yb3VuZChcbiAgICAgICAgICB0ZXh0RWxlbS5tYXAoKHRlKSA9PiAodGUuX2dyb3VwcyB8fCB0ZSlbMF1bMF0uZ2V0QkJveCgpLmhlaWdodCkucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIpXG4gICAgICAgICk7XG4gICAgICAgIGxvb3BNb2RlbC5zZWN0aW9uc1tpZHhdLmhlaWdodCArPSBzZWN0aW9uSGVpZ2h0IC0gKGJveE1hcmdpbiArIGJveFRleHRNYXJnaW4pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBsb29wTW9kZWwuaGVpZ2h0ID0gTWF0aC5yb3VuZChsb29wTW9kZWwuc3RvcHkgLSBsb29wTW9kZWwuc3RhcnR5KTtcbiAgcmV0dXJuIGc7XG59LCBcImRyYXdMb29wXCIpO1xudmFyIGRyYXdCYWNrZ3JvdW5kUmVjdDIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIGJvdW5kczIpIHtcbiAgZHJhd0JhY2tncm91bmRSZWN0KGVsZW0sIGJvdW5kczIpO1xufSwgXCJkcmF3QmFja2dyb3VuZFJlY3RcIik7XG52YXIgaW5zZXJ0RGF0YWJhc2VJY29uID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihlbGVtLCBpZCkge1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwic3ltYm9sXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiLWRhdGFiYXNlXCIpLmF0dHIoXCJmaWxsLXJ1bGVcIiwgXCJldmVub2RkXCIpLmF0dHIoXCJjbGlwLXJ1bGVcIiwgXCJldmVub2RkXCIpLmFwcGVuZChcInBhdGhcIikuYXR0cihcInRyYW5zZm9ybVwiLCBcInNjYWxlKC41KVwiKS5hdHRyKFxuICAgIFwiZFwiLFxuICAgIFwiTTEyLjI1OC4wMDFsLjI1Ni4wMDQuMjU1LjAwNS4yNTMuMDA4LjI1MS4wMS4yNDkuMDEyLjI0Ny4wMTUuMjQ2LjAxNi4yNDIuMDE5LjI0MS4wMi4yMzkuMDIzLjIzNi4wMjQuMjMzLjAyNy4yMzEuMDI4LjIyOS4wMzEuMjI1LjAzMi4yMjMuMDM0LjIyLjAzNi4yMTcuMDM4LjIxNC4wNC4yMTEuMDQxLjIwOC4wNDMuMjA1LjA0NS4yMDEuMDQ2LjE5OC4wNDguMTk0LjA1LjE5MS4wNTEuMTg3LjA1My4xODMuMDU0LjE4LjA1Ni4xNzUuMDU3LjE3Mi4wNTkuMTY4LjA2LjE2My4wNjEuMTYuMDYzLjE1NS4wNjQuMTUuMDY2LjA3NC4wMzMuMDczLjAzMy4wNzEuMDM0LjA3LjAzNC4wNjkuMDM1LjA2OC4wMzUuMDY3LjAzNS4wNjYuMDM1LjA2NC4wMzYuMDY0LjAzNi4wNjIuMDM2LjA2LjAzNi4wNi4wMzcuMDU4LjAzNy4wNTguMDM3LjA1NS4wMzguMDU1LjAzOC4wNTMuMDM4LjA1Mi4wMzguMDUxLjAzOS4wNS4wMzkuMDQ4LjAzOS4wNDcuMDM5LjA0NS4wNC4wNDQuMDQuMDQzLjA0LjA0MS4wNC4wNC4wNDEuMDM5LjA0MS4wMzcuMDQxLjAzNi4wNDEuMDM0LjA0MS4wMzMuMDQyLjAzMi4wNDIuMDMuMDQyLjAyOS4wNDIuMDI3LjA0Mi4wMjYuMDQzLjAyNC4wNDMuMDIzLjA0My4wMjEuMDQzLjAyLjA0My4wMTguMDQ0LjAxNy4wNDMuMDE1LjA0NC4wMTMuMDQ0LjAxMi4wNDQuMDExLjA0NS4wMDkuMDQ0LjAwNy4wNDUuMDA2LjA0NS4wMDQuMDQ1LjAwMi4wNDUuMDAxLjA0NXYxN2wtLjAwMS4wNDUtLjAwMi4wNDUtLjAwNC4wNDUtLjAwNi4wNDUtLjAwNy4wNDUtLjAwOS4wNDQtLjAxMS4wNDUtLjAxMi4wNDQtLjAxMy4wNDQtLjAxNS4wNDQtLjAxNy4wNDMtLjAxOC4wNDQtLjAyLjA0My0uMDIxLjA0My0uMDIzLjA0My0uMDI0LjA0My0uMDI2LjA0My0uMDI3LjA0Mi0uMDI5LjA0Mi0uMDMuMDQyLS4wMzIuMDQyLS4wMzMuMDQyLS4wMzQuMDQxLS4wMzYuMDQxLS4wMzcuMDQxLS4wMzkuMDQxLS4wNC4wNDEtLjA0MS4wNC0uMDQzLjA0LS4wNDQuMDQtLjA0NS4wNC0uMDQ3LjAzOS0uMDQ4LjAzOS0uMDUuMDM5LS4wNTEuMDM5LS4wNTIuMDM4LS4wNTMuMDM4LS4wNTUuMDM4LS4wNTUuMDM4LS4wNTguMDM3LS4wNTguMDM3LS4wNi4wMzctLjA2LjAzNi0uMDYyLjAzNi0uMDY0LjAzNi0uMDY0LjAzNi0uMDY2LjAzNS0uMDY3LjAzNS0uMDY4LjAzNS0uMDY5LjAzNS0uMDcuMDM0LS4wNzEuMDM0LS4wNzMuMDMzLS4wNzQuMDMzLS4xNS4wNjYtLjE1NS4wNjQtLjE2LjA2My0uMTYzLjA2MS0uMTY4LjA2LS4xNzIuMDU5LS4xNzUuMDU3LS4xOC4wNTYtLjE4My4wNTQtLjE4Ny4wNTMtLjE5MS4wNTEtLjE5NC4wNS0uMTk4LjA0OC0uMjAxLjA0Ni0uMjA1LjA0NS0uMjA4LjA0My0uMjExLjA0MS0uMjE0LjA0LS4yMTcuMDM4LS4yMi4wMzYtLjIyMy4wMzQtLjIyNS4wMzItLjIyOS4wMzEtLjIzMS4wMjgtLjIzMy4wMjctLjIzNi4wMjQtLjIzOS4wMjMtLjI0MS4wMi0uMjQyLjAxOS0uMjQ2LjAxNi0uMjQ3LjAxNS0uMjQ5LjAxMi0uMjUxLjAxLS4yNTMuMDA4LS4yNTUuMDA1LS4yNTYuMDA0LS4yNTguMDAxLS4yNTgtLjAwMS0uMjU2LS4wMDQtLjI1NS0uMDA1LS4yNTMtLjAwOC0uMjUxLS4wMS0uMjQ5LS4wMTItLjI0Ny0uMDE1LS4yNDUtLjAxNi0uMjQzLS4wMTktLjI0MS0uMDItLjIzOC0uMDIzLS4yMzYtLjAyNC0uMjM0LS4wMjctLjIzMS0uMDI4LS4yMjgtLjAzMS0uMjI2LS4wMzItLjIyMy0uMDM0LS4yMi0uMDM2LS4yMTctLjAzOC0uMjE0LS4wNC0uMjExLS4wNDEtLjIwOC0uMDQzLS4yMDQtLjA0NS0uMjAxLS4wNDYtLjE5OC0uMDQ4LS4xOTUtLjA1LS4xOS0uMDUxLS4xODctLjA1My0uMTg0LS4wNTQtLjE3OS0uMDU2LS4xNzYtLjA1Ny0uMTcyLS4wNTktLjE2Ny0uMDYtLjE2NC0uMDYxLS4xNTktLjA2My0uMTU1LS4wNjQtLjE1MS0uMDY2LS4wNzQtLjAzMy0uMDcyLS4wMzMtLjA3Mi0uMDM0LS4wNy0uMDM0LS4wNjktLjAzNS0uMDY4LS4wMzUtLjA2Ny0uMDM1LS4wNjYtLjAzNS0uMDY0LS4wMzYtLjA2My0uMDM2LS4wNjItLjAzNi0uMDYxLS4wMzYtLjA2LS4wMzctLjA1OC0uMDM3LS4wNTctLjAzNy0uMDU2LS4wMzgtLjA1NS0uMDM4LS4wNTMtLjAzOC0uMDUyLS4wMzgtLjA1MS0uMDM5LS4wNDktLjAzOS0uMDQ5LS4wMzktLjA0Ni0uMDM5LS4wNDYtLjA0LS4wNDQtLjA0LS4wNDMtLjA0LS4wNDEtLjA0LS4wNC0uMDQxLS4wMzktLjA0MS0uMDM3LS4wNDEtLjAzNi0uMDQxLS4wMzQtLjA0MS0uMDMzLS4wNDItLjAzMi0uMDQyLS4wMy0uMDQyLS4wMjktLjA0Mi0uMDI3LS4wNDItLjAyNi0uMDQzLS4wMjQtLjA0My0uMDIzLS4wNDMtLjAyMS0uMDQzLS4wMi0uMDQzLS4wMTgtLjA0NC0uMDE3LS4wNDMtLjAxNS0uMDQ0LS4wMTMtLjA0NC0uMDEyLS4wNDQtLjAxMS0uMDQ1LS4wMDktLjA0NC0uMDA3LS4wNDUtLjAwNi0uMDQ1LS4wMDQtLjA0NS0uMDAyLS4wNDUtLjAwMS0uMDQ1di0xN2wuMDAxLS4wNDUuMDAyLS4wNDUuMDA0LS4wNDUuMDA2LS4wNDUuMDA3LS4wNDUuMDA5LS4wNDQuMDExLS4wNDUuMDEyLS4wNDQuMDEzLS4wNDQuMDE1LS4wNDQuMDE3LS4wNDMuMDE4LS4wNDQuMDItLjA0My4wMjEtLjA0My4wMjMtLjA0My4wMjQtLjA0My4wMjYtLjA0My4wMjctLjA0Mi4wMjktLjA0Mi4wMy0uMDQyLjAzMi0uMDQyLjAzMy0uMDQyLjAzNC0uMDQxLjAzNi0uMDQxLjAzNy0uMDQxLjAzOS0uMDQxLjA0LS4wNDEuMDQxLS4wNC4wNDMtLjA0LjA0NC0uMDQuMDQ2LS4wNC4wNDYtLjAzOS4wNDktLjAzOS4wNDktLjAzOS4wNTEtLjAzOS4wNTItLjAzOC4wNTMtLjAzOC4wNTUtLjAzOC4wNTYtLjAzOC4wNTctLjAzNy4wNTgtLjAzNy4wNi0uMDM3LjA2MS0uMDM2LjA2Mi0uMDM2LjA2My0uMDM2LjA2NC0uMDM2LjA2Ni0uMDM1LjA2Ny0uMDM1LjA2OC0uMDM1LjA2OS0uMDM1LjA3LS4wMzQuMDcyLS4wMzQuMDcyLS4wMzMuMDc0LS4wMzMuMTUxLS4wNjYuMTU1LS4wNjQuMTU5LS4wNjMuMTY0LS4wNjEuMTY3LS4wNi4xNzItLjA1OS4xNzYtLjA1Ny4xNzktLjA1Ni4xODQtLjA1NC4xODctLjA1My4xOS0uMDUxLjE5NS0uMDUuMTk4LS4wNDguMjAxLS4wNDYuMjA0LS4wNDUuMjA4LS4wNDMuMjExLS4wNDEuMjE0LS4wNC4yMTctLjAzOC4yMi0uMDM2LjIyMy0uMDM0LjIyNi0uMDMyLjIyOC0uMDMxLjIzMS0uMDI4LjIzNC0uMDI3LjIzNi0uMDI0LjIzOC0uMDIzLjI0MS0uMDIuMjQzLS4wMTkuMjQ1LS4wMTYuMjQ3LS4wMTUuMjQ5LS4wMTIuMjUxLS4wMS4yNTMtLjAwOC4yNTUtLjAwNS4yNTYtLjAwNC4yNTgtLjAwMS4yNTguMDAxem0tOS4yNTggMjAuNDk5di4wMWwuMDAxLjAyMS4wMDMuMDIxLjAwNC4wMjIuMDA1LjAyMS4wMDYuMDIyLjAwNy4wMjIuMDA5LjAyMy4wMS4wMjIuMDExLjAyMy4wMTIuMDIzLjAxMy4wMjMuMDE1LjAyMy4wMTYuMDI0LjAxNy4wMjMuMDE4LjAyNC4wMTkuMDI0LjAyMS4wMjQuMDIyLjAyNS4wMjMuMDI0LjAyNC4wMjUuMDUyLjA0OS4wNTYuMDUuMDYxLjA1MS4wNjYuMDUxLjA3LjA1MS4wNzUuMDUxLjA3OS4wNTIuMDg0LjA1Mi4wODguMDUyLjA5Mi4wNTIuMDk3LjA1Mi4xMDIuMDUxLjEwNS4wNTIuMTEuMDUyLjExNC4wNTEuMTE5LjA1MS4xMjMuMDUxLjEyNy4wNS4xMzEuMDUuMTM1LjA1LjEzOS4wNDguMTQ0LjA0OS4xNDcuMDQ3LjE1Mi4wNDcuMTU1LjA0Ny4xNi4wNDUuMTYzLjA0NS4xNjcuMDQzLjE3MS4wNDMuMTc2LjA0MS4xNzguMDQxLjE4My4wMzkuMTg3LjAzOS4xOS4wMzcuMTk0LjAzNS4xOTcuMDM1LjIwMi4wMzMuMjA0LjAzMS4yMDkuMDMuMjEyLjAyOS4yMTYuMDI3LjIxOS4wMjUuMjIyLjAyNC4yMjYuMDIxLjIzLjAyLjIzMy4wMTguMjM2LjAxNi4yNC4wMTUuMjQzLjAxMi4yNDYuMDEuMjQ5LjAwOC4yNTMuMDA1LjI1Ni4wMDQuMjU5LjAwMS4yNi0uMDAxLjI1Ny0uMDA0LjI1NC0uMDA1LjI1LS4wMDguMjQ3LS4wMTEuMjQ0LS4wMTIuMjQxLS4wMTQuMjM3LS4wMTYuMjMzLS4wMTguMjMxLS4wMjEuMjI2LS4wMjEuMjI0LS4wMjQuMjItLjAyNi4yMTYtLjAyNy4yMTItLjAyOC4yMS0uMDMxLjIwNS0uMDMxLjIwMi0uMDM0LjE5OC0uMDM0LjE5NC0uMDM2LjE5MS0uMDM3LjE4Ny0uMDM5LjE4My0uMDQuMTc5LS4wNC4xNzUtLjA0Mi4xNzItLjA0My4xNjgtLjA0NC4xNjMtLjA0NS4xNi0uMDQ2LjE1NS0uMDQ2LjE1Mi0uMDQ3LjE0OC0uMDQ4LjE0My0uMDQ5LjEzOS0uMDQ5LjEzNi0uMDUuMTMxLS4wNS4xMjYtLjA1LjEyMy0uMDUxLjExOC0uMDUyLjExNC0uMDUxLjExLS4wNTIuMTA2LS4wNTIuMTAxLS4wNTIuMDk2LS4wNTIuMDkyLS4wNTIuMDg4LS4wNTMuMDgzLS4wNTEuMDc5LS4wNTIuMDc0LS4wNTIuMDctLjA1MS4wNjUtLjA1MS4wNi0uMDUxLjA1Ni0uMDUuMDUxLS4wNS4wMjMtLjAyNC4wMjMtLjAyNS4wMjEtLjAyNC4wMi0uMDI0LjAxOS0uMDI0LjAxOC0uMDI0LjAxNy0uMDI0LjAxNS0uMDIzLjAxNC0uMDI0LjAxMy0uMDIzLjAxMi0uMDIzLjAxLS4wMjMuMDEtLjAyMi4wMDgtLjAyMi4wMDYtLjAyMi4wMDYtLjAyMi4wMDQtLjAyMi4wMDQtLjAyMS4wMDEtLjAyMS4wMDEtLjAyMXYtNC4xMjdsLS4wNzcuMDU1LS4wOC4wNTMtLjA4My4wNTQtLjA4NS4wNTMtLjA4Ny4wNTItLjA5LjA1Mi0uMDkzLjA1MS0uMDk1LjA1LS4wOTcuMDUtLjEuMDQ5LS4xMDIuMDQ5LS4xMDUuMDQ4LS4xMDYuMDQ3LS4xMDkuMDQ3LS4xMTEuMDQ2LS4xMTQuMDQ1LS4xMTUuMDQ1LS4xMTguMDQ0LS4xMi4wNDMtLjEyMi4wNDItLjEyNC4wNDItLjEyNi4wNDEtLjEyOC4wNC0uMTMuMDQtLjEzMi4wMzgtLjEzNC4wMzgtLjEzNS4wMzctLjEzOC4wMzctLjEzOS4wMzUtLjE0Mi4wMzUtLjE0My4wMzQtLjE0NC4wMzMtLjE0Ny4wMzItLjE0OC4wMzEtLjE1LjAzLS4xNTEuMDMtLjE1My4wMjktLjE1NC4wMjctLjE1Ni4wMjctLjE1OC4wMjYtLjE1OS4wMjUtLjE2MS4wMjQtLjE2Mi4wMjMtLjE2My4wMjItLjE2NS4wMjEtLjE2Ni4wMi0uMTY3LjAxOS0uMTY5LjAxOC0uMTY5LjAxNy0uMTcxLjAxNi0uMTczLjAxNS0uMTczLjAxNC0uMTc1LjAxMy0uMTc1LjAxMi0uMTc3LjAxMS0uMTc4LjAxLS4xNzkuMDA4LS4xNzkuMDA4LS4xODEuMDA2LS4xODIuMDA1LS4xODIuMDA0LS4xODQuMDAzLS4xODQuMDAyaC0uMzdsLS4xODQtLjAwMi0uMTg0LS4wMDMtLjE4Mi0uMDA0LS4xODItLjAwNS0uMTgxLS4wMDYtLjE3OS0uMDA4LS4xNzktLjAwOC0uMTc4LS4wMS0uMTc2LS4wMTEtLjE3Ni0uMDEyLS4xNzUtLjAxMy0uMTczLS4wMTQtLjE3Mi0uMDE1LS4xNzEtLjAxNi0uMTctLjAxNy0uMTY5LS4wMTgtLjE2Ny0uMDE5LS4xNjYtLjAyLS4xNjUtLjAyMS0uMTYzLS4wMjItLjE2Mi0uMDIzLS4xNjEtLjAyNC0uMTU5LS4wMjUtLjE1Ny0uMDI2LS4xNTYtLjAyNy0uMTU1LS4wMjctLjE1My0uMDI5LS4xNTEtLjAzLS4xNS0uMDMtLjE0OC0uMDMxLS4xNDYtLjAzMi0uMTQ1LS4wMzMtLjE0My0uMDM0LS4xNDEtLjAzNS0uMTQtLjAzNS0uMTM3LS4wMzctLjEzNi0uMDM3LS4xMzQtLjAzOC0uMTMyLS4wMzgtLjEzLS4wNC0uMTI4LS4wNC0uMTI2LS4wNDEtLjEyNC0uMDQyLS4xMjItLjA0Mi0uMTItLjA0NC0uMTE3LS4wNDMtLjExNi0uMDQ1LS4xMTMtLjA0NS0uMTEyLS4wNDYtLjEwOS0uMDQ3LS4xMDYtLjA0Ny0uMTA1LS4wNDgtLjEwMi0uMDQ5LS4xLS4wNDktLjA5Ny0uMDUtLjA5NS0uMDUtLjA5My0uMDUyLS4wOS0uMDUxLS4wODctLjA1Mi0uMDg1LS4wNTMtLjA4My0uMDU0LS4wOC0uMDU0LS4wNzctLjA1NHY0LjEyN3ptMC01LjY1NHYuMDExbC4wMDEuMDIxLjAwMy4wMjEuMDA0LjAyMS4wMDUuMDIyLjAwNi4wMjIuMDA3LjAyMi4wMDkuMDIyLjAxLjAyMi4wMTEuMDIzLjAxMi4wMjMuMDEzLjAyMy4wMTUuMDI0LjAxNi4wMjMuMDE3LjAyNC4wMTguMDI0LjAxOS4wMjQuMDIxLjAyNC4wMjIuMDI0LjAyMy4wMjUuMDI0LjAyNC4wNTIuMDUuMDU2LjA1LjA2MS4wNS4wNjYuMDUxLjA3LjA1MS4wNzUuMDUyLjA3OS4wNTEuMDg0LjA1Mi4wODguMDUyLjA5Mi4wNTIuMDk3LjA1Mi4xMDIuMDUyLjEwNS4wNTIuMTEuMDUxLjExNC4wNTEuMTE5LjA1Mi4xMjMuMDUuMTI3LjA1MS4xMzEuMDUuMTM1LjA0OS4xMzkuMDQ5LjE0NC4wNDguMTQ3LjA0OC4xNTIuMDQ3LjE1NS4wNDYuMTYuMDQ1LjE2My4wNDUuMTY3LjA0NC4xNzEuMDQyLjE3Ni4wNDIuMTc4LjA0LjE4My4wNC4xODcuMDM4LjE5LjAzNy4xOTQuMDM2LjE5Ny4wMzQuMjAyLjAzMy4yMDQuMDMyLjIwOS4wMy4yMTIuMDI4LjIxNi4wMjcuMjE5LjAyNS4yMjIuMDI0LjIyNi4wMjIuMjMuMDIuMjMzLjAxOC4yMzYuMDE2LjI0LjAxNC4yNDMuMDEyLjI0Ni4wMS4yNDkuMDA4LjI1My4wMDYuMjU2LjAwMy4yNTkuMDAxLjI2LS4wMDEuMjU3LS4wMDMuMjU0LS4wMDYuMjUtLjAwOC4yNDctLjAxLjI0NC0uMDEyLjI0MS0uMDE1LjIzNy0uMDE2LjIzMy0uMDE4LjIzMS0uMDIuMjI2LS4wMjIuMjI0LS4wMjQuMjItLjAyNS4yMTYtLjAyNy4yMTItLjAyOS4yMS0uMDMuMjA1LS4wMzIuMjAyLS4wMzMuMTk4LS4wMzUuMTk0LS4wMzYuMTkxLS4wMzcuMTg3LS4wMzkuMTgzLS4wMzkuMTc5LS4wNDEuMTc1LS4wNDIuMTcyLS4wNDMuMTY4LS4wNDQuMTYzLS4wNDUuMTYtLjA0NS4xNTUtLjA0Ny4xNTItLjA0Ny4xNDgtLjA0OC4xNDMtLjA0OC4xMzktLjA1LjEzNi0uMDQ5LjEzMS0uMDUuMTI2LS4wNTEuMTIzLS4wNTEuMTE4LS4wNTEuMTE0LS4wNTIuMTEtLjA1Mi4xMDYtLjA1Mi4xMDEtLjA1Mi4wOTYtLjA1Mi4wOTItLjA1Mi4wODgtLjA1Mi4wODMtLjA1Mi4wNzktLjA1Mi4wNzQtLjA1MS4wNy0uMDUyLjA2NS0uMDUxLjA2LS4wNS4wNTYtLjA1MS4wNTEtLjA0OS4wMjMtLjAyNS4wMjMtLjAyNC4wMjEtLjAyNS4wMi0uMDI0LjAxOS0uMDI0LjAxOC0uMDI0LjAxNy0uMDI0LjAxNS0uMDIzLjAxNC0uMDIzLjAxMy0uMDI0LjAxMi0uMDIyLjAxLS4wMjMuMDEtLjAyMy4wMDgtLjAyMi4wMDYtLjAyMi4wMDYtLjAyMi4wMDQtLjAyMS4wMDQtLjAyMi4wMDEtLjAyMS4wMDEtLjAyMXYtNC4xMzlsLS4wNzcuMDU0LS4wOC4wNTQtLjA4My4wNTQtLjA4NS4wNTItLjA4Ny4wNTMtLjA5LjA1MS0uMDkzLjA1MS0uMDk1LjA1MS0uMDk3LjA1LS4xLjA0OS0uMTAyLjA0OS0uMTA1LjA0OC0uMTA2LjA0Ny0uMTA5LjA0Ny0uMTExLjA0Ni0uMTE0LjA0NS0uMTE1LjA0NC0uMTE4LjA0NC0uMTIuMDQ0LS4xMjIuMDQyLS4xMjQuMDQyLS4xMjYuMDQxLS4xMjguMDQtLjEzLjAzOS0uMTMyLjAzOS0uMTM0LjAzOC0uMTM1LjAzNy0uMTM4LjAzNi0uMTM5LjAzNi0uMTQyLjAzNS0uMTQzLjAzMy0uMTQ0LjAzMy0uMTQ3LjAzMy0uMTQ4LjAzMS0uMTUuMDMtLjE1MS4wMy0uMTUzLjAyOC0uMTU0LjAyOC0uMTU2LjAyNy0uMTU4LjAyNi0uMTU5LjAyNS0uMTYxLjAyNC0uMTYyLjAyMy0uMTYzLjAyMi0uMTY1LjAyMS0uMTY2LjAyLS4xNjcuMDE5LS4xNjkuMDE4LS4xNjkuMDE3LS4xNzEuMDE2LS4xNzMuMDE1LS4xNzMuMDE0LS4xNzUuMDEzLS4xNzUuMDEyLS4xNzcuMDExLS4xNzguMDA5LS4xNzkuMDA5LS4xNzkuMDA3LS4xODEuMDA3LS4xODIuMDA1LS4xODIuMDA0LS4xODQuMDAzLS4xODQuMDAyaC0uMzdsLS4xODQtLjAwMi0uMTg0LS4wMDMtLjE4Mi0uMDA0LS4xODItLjAwNS0uMTgxLS4wMDctLjE3OS0uMDA3LS4xNzktLjAwOS0uMTc4LS4wMDktLjE3Ni0uMDExLS4xNzYtLjAxMi0uMTc1LS4wMTMtLjE3My0uMDE0LS4xNzItLjAxNS0uMTcxLS4wMTYtLjE3LS4wMTctLjE2OS0uMDE4LS4xNjctLjAxOS0uMTY2LS4wMi0uMTY1LS4wMjEtLjE2My0uMDIyLS4xNjItLjAyMy0uMTYxLS4wMjQtLjE1OS0uMDI1LS4xNTctLjAyNi0uMTU2LS4wMjctLjE1NS0uMDI4LS4xNTMtLjAyOC0uMTUxLS4wMy0uMTUtLjAzLS4xNDgtLjAzMS0uMTQ2LS4wMzMtLjE0NS0uMDMzLS4xNDMtLjAzMy0uMTQxLS4wMzUtLjE0LS4wMzYtLjEzNy0uMDM2LS4xMzYtLjAzNy0uMTM0LS4wMzgtLjEzMi0uMDM5LS4xMy0uMDM5LS4xMjgtLjA0LS4xMjYtLjA0MS0uMTI0LS4wNDItLjEyMi0uMDQzLS4xMi0uMDQzLS4xMTctLjA0NC0uMTE2LS4wNDQtLjExMy0uMDQ2LS4xMTItLjA0Ni0uMTA5LS4wNDYtLjEwNi0uMDQ3LS4xMDUtLjA0OC0uMTAyLS4wNDktLjEtLjA0OS0uMDk3LS4wNS0uMDk1LS4wNTEtLjA5My0uMDUxLS4wOS0uMDUxLS4wODctLjA1My0uMDg1LS4wNTItLjA4My0uMDU0LS4wOC0uMDU0LS4wNzctLjA1NHY0LjEzOXptMC01LjY2NnYuMDExbC4wMDEuMDIuMDAzLjAyMi4wMDQuMDIxLjAwNS4wMjIuMDA2LjAyMS4wMDcuMDIyLjAwOS4wMjMuMDEuMDIyLjAxMS4wMjMuMDEyLjAyMy4wMTMuMDIzLjAxNS4wMjMuMDE2LjAyNC4wMTcuMDI0LjAxOC4wMjMuMDE5LjAyNC4wMjEuMDI1LjAyMi4wMjQuMDIzLjAyNC4wMjQuMDI1LjA1Mi4wNS4wNTYuMDUuMDYxLjA1LjA2Ni4wNTEuMDcuMDUxLjA3NS4wNTIuMDc5LjA1MS4wODQuMDUyLjA4OC4wNTIuMDkyLjA1Mi4wOTcuMDUyLjEwMi4wNTIuMTA1LjA1MS4xMS4wNTIuMTE0LjA1MS4xMTkuMDUxLjEyMy4wNTEuMTI3LjA1LjEzMS4wNS4xMzUuMDUuMTM5LjA0OS4xNDQuMDQ4LjE0Ny4wNDguMTUyLjA0Ny4xNTUuMDQ2LjE2LjA0NS4xNjMuMDQ1LjE2Ny4wNDMuMTcxLjA0My4xNzYuMDQyLjE3OC4wNC4xODMuMDQuMTg3LjAzOC4xOS4wMzcuMTk0LjAzNi4xOTcuMDM0LjIwMi4wMzMuMjA0LjAzMi4yMDkuMDMuMjEyLjAyOC4yMTYuMDI3LjIxOS4wMjUuMjIyLjAyNC4yMjYuMDIxLjIzLjAyLjIzMy4wMTguMjM2LjAxNy4yNC4wMTQuMjQzLjAxMi4yNDYuMDEuMjQ5LjAwOC4yNTMuMDA2LjI1Ni4wMDMuMjU5LjAwMS4yNi0uMDAxLjI1Ny0uMDAzLjI1NC0uMDA2LjI1LS4wMDguMjQ3LS4wMS4yNDQtLjAxMy4yNDEtLjAxNC4yMzctLjAxNi4yMzMtLjAxOC4yMzEtLjAyLjIyNi0uMDIyLjIyNC0uMDI0LjIyLS4wMjUuMjE2LS4wMjcuMjEyLS4wMjkuMjEtLjAzLjIwNS0uMDMyLjIwMi0uMDMzLjE5OC0uMDM1LjE5NC0uMDM2LjE5MS0uMDM3LjE4Ny0uMDM5LjE4My0uMDM5LjE3OS0uMDQxLjE3NS0uMDQyLjE3Mi0uMDQzLjE2OC0uMDQ0LjE2My0uMDQ1LjE2LS4wNDUuMTU1LS4wNDcuMTUyLS4wNDcuMTQ4LS4wNDguMTQzLS4wNDkuMTM5LS4wNDkuMTM2LS4wNDkuMTMxLS4wNTEuMTI2LS4wNS4xMjMtLjA1MS4xMTgtLjA1Mi4xMTQtLjA1MS4xMS0uMDUyLjEwNi0uMDUyLjEwMS0uMDUyLjA5Ni0uMDUyLjA5Mi0uMDUyLjA4OC0uMDUyLjA4My0uMDUyLjA3OS0uMDUyLjA3NC0uMDUyLjA3LS4wNTEuMDY1LS4wNTEuMDYtLjA1MS4wNTYtLjA1LjA1MS0uMDQ5LjAyMy0uMDI1LjAyMy0uMDI1LjAyMS0uMDI0LjAyLS4wMjQuMDE5LS4wMjQuMDE4LS4wMjQuMDE3LS4wMjQuMDE1LS4wMjMuMDE0LS4wMjQuMDEzLS4wMjMuMDEyLS4wMjMuMDEtLjAyMi4wMS0uMDIzLjAwOC0uMDIyLjAwNi0uMDIyLjAwNi0uMDIyLjAwNC0uMDIyLjAwNC0uMDIxLjAwMS0uMDIxLjAwMS0uMDIxdi00LjE1M2wtLjA3Ny4wNTQtLjA4LjA1NC0uMDgzLjA1My0uMDg1LjA1My0uMDg3LjA1My0uMDkuMDUxLS4wOTMuMDUxLS4wOTUuMDUxLS4wOTcuMDUtLjEuMDQ5LS4xMDIuMDQ4LS4xMDUuMDQ4LS4xMDYuMDQ4LS4xMDkuMDQ2LS4xMTEuMDQ2LS4xMTQuMDQ2LS4xMTUuMDQ0LS4xMTguMDQ0LS4xMi4wNDMtLjEyMi4wNDMtLjEyNC4wNDItLjEyNi4wNDEtLjEyOC4wNC0uMTMuMDM5LS4xMzIuMDM5LS4xMzQuMDM4LS4xMzUuMDM3LS4xMzguMDM2LS4xMzkuMDM2LS4xNDIuMDM0LS4xNDMuMDM0LS4xNDQuMDMzLS4xNDcuMDMyLS4xNDguMDMyLS4xNS4wMy0uMTUxLjAzLS4xNTMuMDI4LS4xNTQuMDI4LS4xNTYuMDI3LS4xNTguMDI2LS4xNTkuMDI0LS4xNjEuMDI0LS4xNjIuMDIzLS4xNjMuMDIzLS4xNjUuMDIxLS4xNjYuMDItLjE2Ny4wMTktLjE2OS4wMTgtLjE2OS4wMTctLjE3MS4wMTYtLjE3My4wMTUtLjE3My4wMTQtLjE3NS4wMTMtLjE3NS4wMTItLjE3Ny4wMS0uMTc4LjAxLS4xNzkuMDA5LS4xNzkuMDA3LS4xODEuMDA2LS4xODIuMDA2LS4xODIuMDA0LS4xODQuMDAzLS4xODQuMDAxLS4xODUuMDAxLS4xODUtLjAwMS0uMTg0LS4wMDEtLjE4NC0uMDAzLS4xODItLjAwNC0uMTgyLS4wMDYtLjE4MS0uMDA2LS4xNzktLjAwNy0uMTc5LS4wMDktLjE3OC0uMDEtLjE3Ni0uMDEtLjE3Ni0uMDEyLS4xNzUtLjAxMy0uMTczLS4wMTQtLjE3Mi0uMDE1LS4xNzEtLjAxNi0uMTctLjAxNy0uMTY5LS4wMTgtLjE2Ny0uMDE5LS4xNjYtLjAyLS4xNjUtLjAyMS0uMTYzLS4wMjMtLjE2Mi0uMDIzLS4xNjEtLjAyNC0uMTU5LS4wMjQtLjE1Ny0uMDI2LS4xNTYtLjAyNy0uMTU1LS4wMjgtLjE1My0uMDI4LS4xNTEtLjAzLS4xNS0uMDMtLjE0OC0uMDMyLS4xNDYtLjAzMi0uMTQ1LS4wMzMtLjE0My0uMDM0LS4xNDEtLjAzNC0uMTQtLjAzNi0uMTM3LS4wMzYtLjEzNi0uMDM3LS4xMzQtLjAzOC0uMTMyLS4wMzktLjEzLS4wMzktLjEyOC0uMDQxLS4xMjYtLjA0MS0uMTI0LS4wNDEtLjEyMi0uMDQzLS4xMi0uMDQzLS4xMTctLjA0NC0uMTE2LS4wNDQtLjExMy0uMDQ2LS4xMTItLjA0Ni0uMTA5LS4wNDYtLjEwNi0uMDQ4LS4xMDUtLjA0OC0uMTAyLS4wNDgtLjEtLjA1LS4wOTctLjA0OS0uMDk1LS4wNTEtLjA5My0uMDUxLS4wOS0uMDUyLS4wODctLjA1Mi0uMDg1LS4wNTMtLjA4My0uMDUzLS4wOC0uMDU0LS4wNzctLjA1NHY0LjE1M3ptOC43NC04LjE3OWwtLjI1Ny4wMDQtLjI1NC4wMDUtLjI1LjAwOC0uMjQ3LjAxMS0uMjQ0LjAxMi0uMjQxLjAxNC0uMjM3LjAxNi0uMjMzLjAxOC0uMjMxLjAyMS0uMjI2LjAyMi0uMjI0LjAyMy0uMjIuMDI2LS4yMTYuMDI3LS4yMTIuMDI4LS4yMS4wMzEtLjIwNS4wMzItLjIwMi4wMzMtLjE5OC4wMzQtLjE5NC4wMzYtLjE5MS4wMzgtLjE4Ny4wMzgtLjE4My4wNC0uMTc5LjA0MS0uMTc1LjA0Mi0uMTcyLjA0My0uMTY4LjA0My0uMTYzLjA0NS0uMTYuMDQ2LS4xNTUuMDQ2LS4xNTIuMDQ4LS4xNDguMDQ4LS4xNDMuMDQ4LS4xMzkuMDQ5LS4xMzYuMDUtLjEzMS4wNS0uMTI2LjA1MS0uMTIzLjA1MS0uMTE4LjA1MS0uMTE0LjA1Mi0uMTEuMDUyLS4xMDYuMDUyLS4xMDEuMDUyLS4wOTYuMDUyLS4wOTIuMDUyLS4wODguMDUyLS4wODMuMDUyLS4wNzkuMDUyLS4wNzQuMDUxLS4wNy4wNTItLjA2NS4wNTEtLjA2LjA1LS4wNTYuMDUtLjA1MS4wNS0uMDIzLjAyNS0uMDIzLjAyNC0uMDIxLjAyNC0uMDIuMDI1LS4wMTkuMDI0LS4wMTguMDI0LS4wMTcuMDIzLS4wMTUuMDI0LS4wMTQuMDIzLS4wMTMuMDIzLS4wMTIuMDIzLS4wMS4wMjMtLjAxLjAyMi0uMDA4LjAyMi0uMDA2LjAyMy0uMDA2LjAyMS0uMDA0LjAyMi0uMDA0LjAyMS0uMDAxLjAyMS0uMDAxLjAyMS4wMDEuMDIxLjAwMS4wMjEuMDA0LjAyMS4wMDQuMDIyLjAwNi4wMjEuMDA2LjAyMy4wMDguMDIyLjAxLjAyMi4wMS4wMjMuMDEyLjAyMy4wMTMuMDIzLjAxNC4wMjMuMDE1LjAyNC4wMTcuMDIzLjAxOC4wMjQuMDE5LjAyNC4wMi4wMjUuMDIxLjAyNC4wMjMuMDI0LjAyMy4wMjUuMDUxLjA1LjA1Ni4wNS4wNi4wNS4wNjUuMDUxLjA3LjA1Mi4wNzQuMDUxLjA3OS4wNTIuMDgzLjA1Mi4wODguMDUyLjA5Mi4wNTIuMDk2LjA1Mi4xMDEuMDUyLjEwNi4wNTIuMTEuMDUyLjExNC4wNTIuMTE4LjA1MS4xMjMuMDUxLjEyNi4wNTEuMTMxLjA1LjEzNi4wNS4xMzkuMDQ5LjE0My4wNDguMTQ4LjA0OC4xNTIuMDQ4LjE1NS4wNDYuMTYuMDQ2LjE2My4wNDUuMTY4LjA0My4xNzIuMDQzLjE3NS4wNDIuMTc5LjA0MS4xODMuMDQuMTg3LjAzOC4xOTEuMDM4LjE5NC4wMzYuMTk4LjAzNC4yMDIuMDMzLjIwNS4wMzIuMjEuMDMxLjIxMi4wMjguMjE2LjAyNy4yMi4wMjYuMjI0LjAyMy4yMjYuMDIyLjIzMS4wMjEuMjMzLjAxOC4yMzcuMDE2LjI0MS4wMTQuMjQ0LjAxMi4yNDcuMDExLjI1LjAwOC4yNTQuMDA1LjI1Ny4wMDQuMjYuMDAxLjI2LS4wMDEuMjU3LS4wMDQuMjU0LS4wMDUuMjUtLjAwOC4yNDctLjAxMS4yNDQtLjAxMi4yNDEtLjAxNC4yMzctLjAxNi4yMzMtLjAxOC4yMzEtLjAyMS4yMjYtLjAyMi4yMjQtLjAyMy4yMi0uMDI2LjIxNi0uMDI3LjIxMi0uMDI4LjIxLS4wMzEuMjA1LS4wMzIuMjAyLS4wMzMuMTk4LS4wMzQuMTk0LS4wMzYuMTkxLS4wMzguMTg3LS4wMzguMTgzLS4wNC4xNzktLjA0MS4xNzUtLjA0Mi4xNzItLjA0My4xNjgtLjA0My4xNjMtLjA0NS4xNi0uMDQ2LjE1NS0uMDQ2LjE1Mi0uMDQ4LjE0OC0uMDQ4LjE0My0uMDQ4LjEzOS0uMDQ5LjEzNi0uMDUuMTMxLS4wNS4xMjYtLjA1MS4xMjMtLjA1MS4xMTgtLjA1MS4xMTQtLjA1Mi4xMS0uMDUyLjEwNi0uMDUyLjEwMS0uMDUyLjA5Ni0uMDUyLjA5Mi0uMDUyLjA4OC0uMDUyLjA4My0uMDUyLjA3OS0uMDUyLjA3NC0uMDUxLjA3LS4wNTIuMDY1LS4wNTEuMDYtLjA1LjA1Ni0uMDUuMDUxLS4wNS4wMjMtLjAyNS4wMjMtLjAyNC4wMjEtLjAyNC4wMi0uMDI1LjAxOS0uMDI0LjAxOC0uMDI0LjAxNy0uMDIzLjAxNS0uMDI0LjAxNC0uMDIzLjAxMy0uMDIzLjAxMi0uMDIzLjAxLS4wMjMuMDEtLjAyMi4wMDgtLjAyMi4wMDYtLjAyMy4wMDYtLjAyMS4wMDQtLjAyMi4wMDQtLjAyMS4wMDEtLjAyMS4wMDEtLjAyMS0uMDAxLS4wMjEtLjAwMS0uMDIxLS4wMDQtLjAyMS0uMDA0LS4wMjItLjAwNi0uMDIxLS4wMDYtLjAyMy0uMDA4LS4wMjItLjAxLS4wMjItLjAxLS4wMjMtLjAxMi0uMDIzLS4wMTMtLjAyMy0uMDE0LS4wMjMtLjAxNS0uMDI0LS4wMTctLjAyMy0uMDE4LS4wMjQtLjAxOS0uMDI0LS4wMi0uMDI1LS4wMjEtLjAyNC0uMDIzLS4wMjQtLjAyMy0uMDI1LS4wNTEtLjA1LS4wNTYtLjA1LS4wNi0uMDUtLjA2NS0uMDUxLS4wNy0uMDUyLS4wNzQtLjA1MS0uMDc5LS4wNTItLjA4My0uMDUyLS4wODgtLjA1Mi0uMDkyLS4wNTItLjA5Ni0uMDUyLS4xMDEtLjA1Mi0uMTA2LS4wNTItLjExLS4wNTItLjExNC0uMDUyLS4xMTgtLjA1MS0uMTIzLS4wNTEtLjEyNi0uMDUxLS4xMzEtLjA1LS4xMzYtLjA1LS4xMzktLjA0OS0uMTQzLS4wNDgtLjE0OC0uMDQ4LS4xNTItLjA0OC0uMTU1LS4wNDYtLjE2LS4wNDYtLjE2My0uMDQ1LS4xNjgtLjA0My0uMTcyLS4wNDMtLjE3NS0uMDQyLS4xNzktLjA0MS0uMTgzLS4wNC0uMTg3LS4wMzgtLjE5MS0uMDM4LS4xOTQtLjAzNi0uMTk4LS4wMzQtLjIwMi0uMDMzLS4yMDUtLjAzMi0uMjEtLjAzMS0uMjEyLS4wMjgtLjIxNi0uMDI3LS4yMi0uMDI2LS4yMjQtLjAyMy0uMjI2LS4wMjItLjIzMS0uMDIxLS4yMzMtLjAxOC0uMjM3LS4wMTYtLjI0MS0uMDE0LS4yNDQtLjAxMi0uMjQ3LS4wMTEtLjI1LS4wMDgtLjI1NC0uMDA1LS4yNTctLjAwNC0uMjYtLjAwMS0uMjYuMDAxelwiXG4gICk7XG59LCBcImluc2VydERhdGFiYXNlSWNvblwiKTtcbnZhciBpbnNlcnRDb21wdXRlckljb24gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIGlkKSB7XG4gIGVsZW0uYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJzeW1ib2xcIikuYXR0cihcImlkXCIsIGlkICsgXCItY29tcHV0ZXJcIikuYXR0cihcIndpZHRoXCIsIFwiMjRcIikuYXR0cihcImhlaWdodFwiLCBcIjI0XCIpLmFwcGVuZChcInBhdGhcIikuYXR0cihcInRyYW5zZm9ybVwiLCBcInNjYWxlKC41KVwiKS5hdHRyKFxuICAgIFwiZFwiLFxuICAgIFwiTTIgMnYxM2gyMHYtMTNoLTIwem0xOCAxMWgtMTZ2LTloMTZ2OXptLTEwLjIyOCA2bC40NjYtMWgzLjUyNGwuNDY3IDFoLTQuNDU3em0xNC4yMjggM2gtMjRsMi02aDIuMTA0bC0xLjMzIDRoMTguNDVsLTEuMjk3LTRoMi4wNzNsMiA2em0tNS0xMGgtMTR2LTdoMTR2N3pcIlxuICApO1xufSwgXCJpbnNlcnRDb21wdXRlckljb25cIik7XG52YXIgaW5zZXJ0Q2xvY2tJY29uID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihlbGVtLCBpZCkge1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwic3ltYm9sXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiLWNsb2NrXCIpLmF0dHIoXCJ3aWR0aFwiLCBcIjI0XCIpLmF0dHIoXCJoZWlnaHRcIiwgXCIyNFwiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJzY2FsZSguNSlcIikuYXR0cihcbiAgICBcImRcIixcbiAgICBcIk0xMiAyYzUuNTE0IDAgMTAgNC40ODYgMTAgMTBzLTQuNDg2IDEwLTEwIDEwLTEwLTQuNDg2LTEwLTEwIDQuNDg2LTEwIDEwLTEwem0wLTJjLTYuNjI3IDAtMTIgNS4zNzMtMTIgMTJzNS4zNzMgMTIgMTIgMTIgMTItNS4zNzMgMTItMTItNS4zNzMtMTItMTItMTJ6bTUuODQ4IDEyLjQ1OWMuMjAyLjAzOC4yMDIuMzMzLjAwMS4zNzItMS45MDcuMzYxLTYuMDQ1IDEuMTExLTYuNTQ3IDEuMTExLS43MTkgMC0xLjMwMS0uNTgyLTEuMzAxLTEuMzAxIDAtLjUxMi43Ny01LjQ0NyAxLjEyNS03LjQ0NS4wMzQtLjE5Mi4zMTItLjE4MS4zNDMuMDE0bC45ODUgNi4yMzggNS4zOTQgMS4wMTF6XCJcbiAgKTtcbn0sIFwiaW5zZXJ0Q2xvY2tJY29uXCIpO1xudmFyIGluc2VydEFycm93SGVhZCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbSwgaWQpIHtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIi1hcnJvd2hlYWRcIikuYXR0cihcInJlZlhcIiwgNy45KS5hdHRyKFwicmVmWVwiLCA1KS5hdHRyKFwibWFya2VyVW5pdHNcIiwgXCJ1c2VyU3BhY2VPblVzZVwiKS5hdHRyKFwibWFya2VyV2lkdGhcIiwgMTIpLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMTIpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvLXN0YXJ0LXJldmVyc2VcIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0gLTEgMCBMIDEwIDUgTCAwIDEwIHpcIik7XG59LCBcImluc2VydEFycm93SGVhZFwiKTtcbnZhciBpbnNlcnRBcnJvd0ZpbGxlZEhlYWQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIGlkKSB7XG4gIGVsZW0uYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCItZmlsbGVkLWhlYWRcIikuYXR0cihcInJlZlhcIiwgMTUuNSkuYXR0cihcInJlZllcIiwgNykuYXR0cihcIm1hcmtlcldpZHRoXCIsIDIwKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDI4KS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSAxOCw3IEw5LDEzIEwxNCw3IEw5LDEgWlwiKTtcbn0sIFwiaW5zZXJ0QXJyb3dGaWxsZWRIZWFkXCIpO1xudmFyIGluc2VydFNlcXVlbmNlTnVtYmVyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihlbGVtLCBpZCkge1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiLXNlcXVlbmNlbnVtYmVyXCIpLmF0dHIoXCJyZWZYXCIsIDE1KS5hdHRyKFwicmVmWVwiLCAxNSkuYXR0cihcIm1hcmtlcldpZHRoXCIsIDYwKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDQwKS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImN4XCIsIDE1KS5hdHRyKFwiY3lcIiwgMTUpLmF0dHIoXCJyXCIsIDYpO1xufSwgXCJpbnNlcnRTZXF1ZW5jZU51bWJlclwiKTtcbnZhciBpbnNlcnRBcnJvd0Nyb3NzSGVhZCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbSwgaWQpIHtcbiAgY29uc3QgZGVmcyA9IGVsZW0uYXBwZW5kKFwiZGVmc1wiKTtcbiAgY29uc3QgbWFya2VyID0gZGVmcy5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCItY3Jvc3NoZWFkXCIpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAxNSkuYXR0cihcIm1hcmtlckhlaWdodFwiLCA4KS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hdHRyKFwicmVmWFwiLCA0KS5hdHRyKFwicmVmWVwiLCA0LjUpO1xuICBtYXJrZXIuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZmlsbFwiLCBcIm5vbmVcIikuYXR0cihcInN0cm9rZVwiLCBcIiMwMDAwMDBcIikuc3R5bGUoXCJzdHJva2UtZGFzaGFycmF5XCIsIFwiMCwgMFwiKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIFwiMXB0XCIpLmF0dHIoXCJkXCIsIFwiTSAxLDIgTCA2LDcgTSA2LDIgTCAxLDdcIik7XG59LCBcImluc2VydEFycm93Q3Jvc3NIZWFkXCIpO1xudmFyIGluc2VydERyb3BTaGFkb3cgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIGNvbmYyKSB7XG4gIGNvbnN0IHsgdGhlbWUgfSA9IGNvbmYyO1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwiZmlsdGVyXCIpLmF0dHIoXCJpZFwiLCBcImRyb3Atc2hhZG93XCIpLmF0dHIoXCJoZWlnaHRcIiwgXCIxMzAlXCIpLmF0dHIoXCJ3aWR0aFwiLCBcIjEzMCVcIikuYXBwZW5kKFwiZmVEcm9wU2hhZG93XCIpLmF0dHIoXCJkeFwiLCBcIjRcIikuYXR0cihcImR5XCIsIFwiNFwiKS5hdHRyKFwic3RkRGV2aWF0aW9uXCIsIDApLmF0dHIoXCJmbG9vZC1vcGFjaXR5XCIsIFwiMC4wNlwiKS5hdHRyKFwiZmxvb2QtY29sb3JcIiwgYCR7dGhlbWUgPT09IFwicmVkdXhcIiB8fCB0aGVtZSA9PT0gXCJyZWR1eC1jb2xvclwiID8gXCIjMDAwMDAwXCIgOiBcIiNGRkZGRkZcIn1gKTtcbn0sIFwiaW5zZXJ0RHJvcFNoYWRvd1wiKTtcbnZhciBnZXRUZXh0T2JqMiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgeDogMCxcbiAgICB5OiAwLFxuICAgIGZpbGw6IHZvaWQgMCxcbiAgICBhbmNob3I6IHZvaWQgMCxcbiAgICBzdHlsZTogXCIjNjY2XCIsXG4gICAgd2lkdGg6IHZvaWQgMCxcbiAgICBoZWlnaHQ6IHZvaWQgMCxcbiAgICB0ZXh0TWFyZ2luOiAwLFxuICAgIHJ4OiAwLFxuICAgIHJ5OiAwLFxuICAgIHRzcGFuOiB0cnVlLFxuICAgIHZhbGlnbjogdm9pZCAwXG4gIH07XG59LCBcImdldFRleHRPYmpcIik7XG52YXIgZ2V0Tm90ZVJlY3QyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICB4OiAwLFxuICAgIHk6IDAsXG4gICAgZmlsbDogXCIjRURGMkFFXCIsXG4gICAgc3Ryb2tlOiBcIiM2NjZcIixcbiAgICB3aWR0aDogMTAwLFxuICAgIGFuY2hvcjogXCJzdGFydFwiLFxuICAgIGhlaWdodDogMTAwLFxuICAgIHJ4OiAwLFxuICAgIHJ5OiAwXG4gIH07XG59LCBcImdldE5vdGVSZWN0XCIpO1xudmFyIF9kcmF3VGV4dENhbmRpZGF0ZUZ1bmMgPSAvKiBAX19QVVJFX18gKi8gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBieVRleHQoY29udGVudCwgZywgeCwgeSwgd2lkdGgsIGhlaWdodCwgdGV4dEF0dHJzKSB7XG4gICAgY29uc3QgdGV4dCA9IGcuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwieFwiLCB4ICsgd2lkdGggLyAyKS5hdHRyKFwieVwiLCB5ICsgaGVpZ2h0IC8gMiArIDUpLnN0eWxlKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIikudGV4dChjb250ZW50KTtcbiAgICBfc2V0VGV4dEF0dHJzKHRleHQsIHRleHRBdHRycyk7XG4gIH1cbiAgX19uYW1lKGJ5VGV4dCwgXCJieVRleHRcIik7XG4gIGZ1bmN0aW9uIGJ5VHNwYW4oY29udGVudCwgZywgeCwgeSwgd2lkdGgsIGhlaWdodCwgdGV4dEF0dHJzLCBjb25mMikge1xuICAgIGNvbnN0IHsgYWN0b3JGb250U2l6ZSwgYWN0b3JGb250RmFtaWx5LCBhY3RvckZvbnRXZWlnaHQgfSA9IGNvbmYyO1xuICAgIGNvbnN0IFtfYWN0b3JGb250U2l6ZSwgX2FjdG9yRm9udFNpemVQeF0gPSBwYXJzZUZvbnRTaXplKGFjdG9yRm9udFNpemUpO1xuICAgIGNvbnN0IGxpbmVzID0gY29udGVudC5zcGxpdChjb21tb25fZGVmYXVsdC5saW5lQnJlYWtSZWdleCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZHkgPSBpICogX2FjdG9yRm9udFNpemUgLSBfYWN0b3JGb250U2l6ZSAqIChsaW5lcy5sZW5ndGggLSAxKSAvIDI7XG4gICAgICBjb25zdCB0ZXh0ID0gZy5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJ4XCIsIHggKyB3aWR0aCAvIDIpLmF0dHIoXCJ5XCIsIHkpLnN0eWxlKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIikuc3R5bGUoXCJmb250LXNpemVcIiwgX2FjdG9yRm9udFNpemVQeCkuc3R5bGUoXCJmb250LXdlaWdodFwiLCBhY3RvckZvbnRXZWlnaHQpLnN0eWxlKFwiZm9udC1mYW1pbHlcIiwgYWN0b3JGb250RmFtaWx5KTtcbiAgICAgIHRleHQuYXBwZW5kKFwidHNwYW5cIikuYXR0cihcInhcIiwgeCArIHdpZHRoIC8gMikuYXR0cihcImR5XCIsIGR5KS50ZXh0KGxpbmVzW2ldKTtcbiAgICAgIHRleHQuYXR0cihcInlcIiwgeSArIGhlaWdodCAvIDIpLmF0dHIoXCJkb21pbmFudC1iYXNlbGluZVwiLCBcImNlbnRyYWxcIikuYXR0cihcImFsaWdubWVudC1iYXNlbGluZVwiLCBcImNlbnRyYWxcIik7XG4gICAgICBfc2V0VGV4dEF0dHJzKHRleHQsIHRleHRBdHRycyk7XG4gICAgfVxuICB9XG4gIF9fbmFtZShieVRzcGFuLCBcImJ5VHNwYW5cIik7XG4gIGZ1bmN0aW9uIGJ5Rm8oY29udGVudCwgZywgeCwgeSwgd2lkdGgsIGhlaWdodCwgdGV4dEF0dHJzLCBjb25mMikge1xuICAgIGNvbnN0IHMgPSBnLmFwcGVuZChcInN3aXRjaFwiKTtcbiAgICBjb25zdCBmID0gcy5hcHBlbmQoXCJmb3JlaWduT2JqZWN0XCIpLmF0dHIoXCJ4XCIsIHgpLmF0dHIoXCJ5XCIsIHkpLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCkuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpO1xuICAgIGNvbnN0IHRleHQgPSBmLmFwcGVuZChcInhodG1sOmRpdlwiKS5zdHlsZShcImRpc3BsYXlcIiwgXCJ0YWJsZVwiKS5zdHlsZShcImhlaWdodFwiLCBcIjEwMCVcIikuc3R5bGUoXCJ3aWR0aFwiLCBcIjEwMCVcIik7XG4gICAgdGV4dC5hcHBlbmQoXCJkaXZcIikuc3R5bGUoXCJkaXNwbGF5XCIsIFwidGFibGUtY2VsbFwiKS5zdHlsZShcInRleHQtYWxpZ25cIiwgXCJjZW50ZXJcIikuc3R5bGUoXCJ2ZXJ0aWNhbC1hbGlnblwiLCBcIm1pZGRsZVwiKS50ZXh0KGNvbnRlbnQpO1xuICAgIGJ5VHNwYW4oY29udGVudCwgcywgeCwgeSwgd2lkdGgsIGhlaWdodCwgdGV4dEF0dHJzLCBjb25mMik7XG4gICAgX3NldFRleHRBdHRycyh0ZXh0LCB0ZXh0QXR0cnMpO1xuICB9XG4gIF9fbmFtZShieUZvLCBcImJ5Rm9cIik7XG4gIGFzeW5jIGZ1bmN0aW9uIGJ5S2F0ZXgoY29udGVudCwgZywgeCwgeSwgd2lkdGgsIGhlaWdodCwgdGV4dEF0dHJzLCBjb25mMikge1xuICAgIGNvbnN0IGRpbSA9IGF3YWl0IGNhbGN1bGF0ZU1hdGhNTERpbWVuc2lvbnMoY29udGVudCwgZ2V0Q29uZmlnKCkpO1xuICAgIGNvbnN0IHMgPSBnLmFwcGVuZChcInN3aXRjaFwiKTtcbiAgICBjb25zdCBmID0gcy5hcHBlbmQoXCJmb3JlaWduT2JqZWN0XCIpLmF0dHIoXCJ4XCIsIHggKyB3aWR0aCAvIDIgLSBkaW0ud2lkdGggLyAyKS5hdHRyKFwieVwiLCB5ICsgaGVpZ2h0IC8gMiAtIGRpbS5oZWlnaHQgLyAyKS5hdHRyKFwid2lkdGhcIiwgZGltLndpZHRoKS5hdHRyKFwiaGVpZ2h0XCIsIGRpbS5oZWlnaHQpO1xuICAgIGNvbnN0IHRleHQgPSBmLmFwcGVuZChcInhodG1sOmRpdlwiKS5zdHlsZShcImhlaWdodFwiLCBcIjEwMCVcIikuc3R5bGUoXCJ3aWR0aFwiLCBcIjEwMCVcIik7XG4gICAgdGV4dC5hcHBlbmQoXCJkaXZcIikuc3R5bGUoXCJ0ZXh0LWFsaWduXCIsIFwiY2VudGVyXCIpLnN0eWxlKFwidmVydGljYWwtYWxpZ25cIiwgXCJtaWRkbGVcIikuaHRtbChhd2FpdCByZW5kZXJLYXRleFNhbml0aXplZChjb250ZW50LCBnZXRDb25maWcoKSkpO1xuICAgIGJ5VHNwYW4oY29udGVudCwgcywgeCwgeSwgd2lkdGgsIGhlaWdodCwgdGV4dEF0dHJzLCBjb25mMik7XG4gICAgX3NldFRleHRBdHRycyh0ZXh0LCB0ZXh0QXR0cnMpO1xuICB9XG4gIF9fbmFtZShieUthdGV4LCBcImJ5S2F0ZXhcIik7XG4gIGZ1bmN0aW9uIF9zZXRUZXh0QXR0cnModG9UZXh0LCBmcm9tVGV4dEF0dHJzRGljdCkge1xuICAgIGZvciAoY29uc3Qga2V5IGluIGZyb21UZXh0QXR0cnNEaWN0KSB7XG4gICAgICBpZiAoZnJvbVRleHRBdHRyc0RpY3QuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICB0b1RleHQuYXR0cihrZXksIGZyb21UZXh0QXR0cnNEaWN0W2tleV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBfX25hbWUoX3NldFRleHRBdHRycywgXCJfc2V0VGV4dEF0dHJzXCIpO1xuICByZXR1cm4gZnVuY3Rpb24oY29uZjIsIGhhc0thdGV4MiA9IGZhbHNlKSB7XG4gICAgaWYgKGhhc0thdGV4Mikge1xuICAgICAgcmV0dXJuIGJ5S2F0ZXg7XG4gICAgfVxuICAgIHJldHVybiBjb25mMi50ZXh0UGxhY2VtZW50ID09PSBcImZvXCIgPyBieUZvIDogY29uZjIudGV4dFBsYWNlbWVudCA9PT0gXCJvbGRcIiA/IGJ5VGV4dCA6IGJ5VHNwYW47XG4gIH07XG59KSgpO1xudmFyIF9kcmF3TWVudUl0ZW1UZXh0Q2FuZGlkYXRlRnVuYyA9IC8qIEBfX1BVUkVfXyAqLyAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIGJ5VGV4dChjb250ZW50LCBnLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCB0ZXh0QXR0cnMpIHtcbiAgICBjb25zdCB0ZXh0ID0gZy5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJ4XCIsIHgpLmF0dHIoXCJ5XCIsIHkpLnN0eWxlKFwidGV4dC1hbmNob3JcIiwgXCJzdGFydFwiKS50ZXh0KGNvbnRlbnQpO1xuICAgIF9zZXRUZXh0QXR0cnModGV4dCwgdGV4dEF0dHJzKTtcbiAgfVxuICBfX25hbWUoYnlUZXh0LCBcImJ5VGV4dFwiKTtcbiAgZnVuY3Rpb24gYnlUc3Bhbihjb250ZW50LCBnLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCB0ZXh0QXR0cnMsIGNvbmYyKSB7XG4gICAgY29uc3QgeyBhY3RvckZvbnRTaXplLCBhY3RvckZvbnRGYW1pbHksIGFjdG9yRm9udFdlaWdodCB9ID0gY29uZjI7XG4gICAgY29uc3QgbGluZXMgPSBjb250ZW50LnNwbGl0KGNvbW1vbl9kZWZhdWx0LmxpbmVCcmVha1JlZ2V4KTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBkeSA9IGkgKiBhY3RvckZvbnRTaXplIC0gYWN0b3JGb250U2l6ZSAqIChsaW5lcy5sZW5ndGggLSAxKSAvIDI7XG4gICAgICBjb25zdCB0ZXh0ID0gZy5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJ4XCIsIHgpLmF0dHIoXCJ5XCIsIHkpLnN0eWxlKFwidGV4dC1hbmNob3JcIiwgXCJzdGFydFwiKS5zdHlsZShcImZvbnQtc2l6ZVwiLCBhY3RvckZvbnRTaXplKS5zdHlsZShcImZvbnQtd2VpZ2h0XCIsIGFjdG9yRm9udFdlaWdodCkuc3R5bGUoXCJmb250LWZhbWlseVwiLCBhY3RvckZvbnRGYW1pbHkpO1xuICAgICAgdGV4dC5hcHBlbmQoXCJ0c3BhblwiKS5hdHRyKFwieFwiLCB4KS5hdHRyKFwiZHlcIiwgZHkpLnRleHQobGluZXNbaV0pO1xuICAgICAgdGV4dC5hdHRyKFwieVwiLCB5ICsgaGVpZ2h0IC8gMikuYXR0cihcImRvbWluYW50LWJhc2VsaW5lXCIsIFwiY2VudHJhbFwiKS5hdHRyKFwiYWxpZ25tZW50LWJhc2VsaW5lXCIsIFwiY2VudHJhbFwiKTtcbiAgICAgIF9zZXRUZXh0QXR0cnModGV4dCwgdGV4dEF0dHJzKTtcbiAgICB9XG4gIH1cbiAgX19uYW1lKGJ5VHNwYW4sIFwiYnlUc3BhblwiKTtcbiAgZnVuY3Rpb24gYnlGbyhjb250ZW50LCBnLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCB0ZXh0QXR0cnMsIGNvbmYyKSB7XG4gICAgY29uc3QgcyA9IGcuYXBwZW5kKFwic3dpdGNoXCIpO1xuICAgIGNvbnN0IGYgPSBzLmFwcGVuZChcImZvcmVpZ25PYmplY3RcIikuYXR0cihcInhcIiwgeCkuYXR0cihcInlcIiwgeSkuYXR0cihcIndpZHRoXCIsIHdpZHRoKS5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCk7XG4gICAgY29uc3QgdGV4dCA9IGYuYXBwZW5kKFwieGh0bWw6ZGl2XCIpLnN0eWxlKFwiZGlzcGxheVwiLCBcInRhYmxlXCIpLnN0eWxlKFwiaGVpZ2h0XCIsIFwiMTAwJVwiKS5zdHlsZShcIndpZHRoXCIsIFwiMTAwJVwiKTtcbiAgICB0ZXh0LmFwcGVuZChcImRpdlwiKS5zdHlsZShcImRpc3BsYXlcIiwgXCJ0YWJsZS1jZWxsXCIpLnN0eWxlKFwidGV4dC1hbGlnblwiLCBcImNlbnRlclwiKS5zdHlsZShcInZlcnRpY2FsLWFsaWduXCIsIFwibWlkZGxlXCIpLnRleHQoY29udGVudCk7XG4gICAgYnlUc3Bhbihjb250ZW50LCBzLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCB0ZXh0QXR0cnMsIGNvbmYyKTtcbiAgICBfc2V0VGV4dEF0dHJzKHRleHQsIHRleHRBdHRycyk7XG4gIH1cbiAgX19uYW1lKGJ5Rm8sIFwiYnlGb1wiKTtcbiAgZnVuY3Rpb24gX3NldFRleHRBdHRycyh0b1RleHQsIGZyb21UZXh0QXR0cnNEaWN0KSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gZnJvbVRleHRBdHRyc0RpY3QpIHtcbiAgICAgIGlmIChmcm9tVGV4dEF0dHJzRGljdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIHRvVGV4dC5hdHRyKGtleSwgZnJvbVRleHRBdHRyc0RpY3Rba2V5XSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIF9fbmFtZShfc2V0VGV4dEF0dHJzLCBcIl9zZXRUZXh0QXR0cnNcIik7XG4gIHJldHVybiBmdW5jdGlvbihjb25mMikge1xuICAgIHJldHVybiBjb25mMi50ZXh0UGxhY2VtZW50ID09PSBcImZvXCIgPyBieUZvIDogY29uZjIudGV4dFBsYWNlbWVudCA9PT0gXCJvbGRcIiA/IGJ5VGV4dCA6IGJ5VHNwYW47XG4gIH07XG59KSgpO1xudmFyIGluc2VydFNvbGlkVG9wQXJyb3dIZWFkID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihlbGVtLCBpZCkge1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiLXNvbGlkVG9wQXJyb3dIZWFkXCIpLmF0dHIoXCJyZWZYXCIsIDcuOSkuYXR0cihcInJlZllcIiwgNy4yNSkuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIikuYXR0cihcIm1hcmtlcldpZHRoXCIsIDEyKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDEyKS5hdHRyKFwib3JpZW50XCIsIFwiYXV0by1zdGFydC1yZXZlcnNlXCIpLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNIDAgMCBMIDEwIDggTCAwIDggelwiKTtcbn0sIFwiaW5zZXJ0U29saWRUb3BBcnJvd0hlYWRcIik7XG52YXIgaW5zZXJ0U29saWRCb3R0b21BcnJvd0hlYWQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIGlkKSB7XG4gIGVsZW0uYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCItc29saWRCb3R0b21BcnJvd0hlYWRcIikuYXR0cihcInJlZlhcIiwgNy45KS5hdHRyKFwicmVmWVwiLCAwLjc1KS5hdHRyKFwibWFya2VyVW5pdHNcIiwgXCJ1c2VyU3BhY2VPblVzZVwiKS5hdHRyKFwibWFya2VyV2lkdGhcIiwgMTIpLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMTIpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvLXN0YXJ0LXJldmVyc2VcIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0gMCAwIEwgMTAgMCBMIDAgOCB6XCIpO1xufSwgXCJpbnNlcnRTb2xpZEJvdHRvbUFycm93SGVhZFwiKTtcbnZhciBpbnNlcnRTdGlja1RvcEFycm93SGVhZCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbSwgaWQpIHtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIi1zdGlja1RvcEFycm93SGVhZFwiKS5hdHRyKFwicmVmWFwiLCA3LjUpLmF0dHIoXCJyZWZZXCIsIDcpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInVzZXJTcGFjZU9uVXNlXCIpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAxMikuYXR0cihcIm1hcmtlckhlaWdodFwiLCAxMikuYXR0cihcIm9yaWVudFwiLCBcImF1dG8tc3RhcnQtcmV2ZXJzZVwiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSAwIDAgTCA3IDdcIikuYXR0cihcInN0cm9rZVwiLCBcImJsYWNrXCIpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMS41KS5hdHRyKFwiZmlsbFwiLCBcIm5vbmVcIik7XG59LCBcImluc2VydFN0aWNrVG9wQXJyb3dIZWFkXCIpO1xudmFyIGluc2VydFN0aWNrQm90dG9tQXJyb3dIZWFkID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihlbGVtLCBpZCkge1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiLXN0aWNrQm90dG9tQXJyb3dIZWFkXCIpLmF0dHIoXCJyZWZYXCIsIDcuNSkuYXR0cihcInJlZllcIiwgMCkuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIikuYXR0cihcIm1hcmtlcldpZHRoXCIsIDEyKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDEyKS5hdHRyKFwib3JpZW50XCIsIFwiYXV0by1zdGFydC1yZXZlcnNlXCIpLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNIDAgNyBMIDcgMFwiKS5hdHRyKFwic3Ryb2tlXCIsIFwiYmxhY2tcIikuYXR0cihcInN0cm9rZS13aWR0aFwiLCAxLjUpLmF0dHIoXCJmaWxsXCIsIFwibm9uZVwiKTtcbn0sIFwiaW5zZXJ0U3RpY2tCb3R0b21BcnJvd0hlYWRcIik7XG52YXIgc3ZnRHJhd19kZWZhdWx0ID0ge1xuICBkcmF3UmVjdDogZHJhd1JlY3QyLFxuICBkcmF3VGV4dCxcbiAgZHJhd0xhYmVsLFxuICBkcmF3QWN0b3IsXG4gIGRyYXdCb3gsXG4gIGRyYXdQb3B1cCxcbiAgYW5jaG9yRWxlbWVudCxcbiAgZHJhd0FjdGl2YXRpb24sXG4gIGRyYXdMb29wLFxuICBkcmF3QmFja2dyb3VuZFJlY3Q6IGRyYXdCYWNrZ3JvdW5kUmVjdDIsXG4gIGluc2VydEFycm93SGVhZCxcbiAgaW5zZXJ0QXJyb3dGaWxsZWRIZWFkLFxuICBpbnNlcnRTZXF1ZW5jZU51bWJlcixcbiAgaW5zZXJ0QXJyb3dDcm9zc0hlYWQsXG4gIGluc2VydERhdGFiYXNlSWNvbixcbiAgaW5zZXJ0Q29tcHV0ZXJJY29uLFxuICBpbnNlcnRDbG9ja0ljb24sXG4gIGdldFRleHRPYmo6IGdldFRleHRPYmoyLFxuICBnZXROb3RlUmVjdDogZ2V0Tm90ZVJlY3QyLFxuICBmaXhMaWZlTGluZUhlaWdodHMsXG4gIHNhbml0aXplVXJsLFxuICBpbnNlcnREcm9wU2hhZG93LFxuICBpbnNlcnRTb2xpZFRvcEFycm93SGVhZCxcbiAgaW5zZXJ0U29saWRCb3R0b21BcnJvd0hlYWQsXG4gIGluc2VydFN0aWNrVG9wQXJyb3dIZWFkLFxuICBpbnNlcnRTdGlja0JvdHRvbUFycm93SGVhZFxufTtcblxuLy8gc3JjL2RpYWdyYW1zL3NlcXVlbmNlL3NlcXVlbmNlUmVuZGVyZXIudHNcbnZhciBjb25mID0ge307XG52YXIgYm91bmRzID0ge1xuICBkYXRhOiB7XG4gICAgc3RhcnR4OiB2b2lkIDAsXG4gICAgc3RvcHg6IHZvaWQgMCxcbiAgICBzdGFydHk6IHZvaWQgMCxcbiAgICBzdG9weTogdm9pZCAwXG4gIH0sXG4gIHZlcnRpY2FsUG9zOiAwLFxuICBzZXF1ZW5jZUl0ZW1zOiBbXSxcbiAgYWN0aXZhdGlvbnM6IFtdLFxuICBtb2RlbHM6IHtcbiAgICBnZXRIZWlnaHQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gTWF0aC5tYXguYXBwbHkoXG4gICAgICAgIG51bGwsXG4gICAgICAgIHRoaXMuYWN0b3JzLmxlbmd0aCA9PT0gMCA/IFswXSA6IHRoaXMuYWN0b3JzLm1hcCgoYWN0b3IpID0+IGFjdG9yLmhlaWdodCB8fCAwKVxuICAgICAgKSArICh0aGlzLmxvb3BzLmxlbmd0aCA9PT0gMCA/IDAgOiB0aGlzLmxvb3BzLm1hcCgoaXQpID0+IGl0LmhlaWdodCB8fCAwKS5yZWR1Y2UoKGFjYywgaCkgPT4gYWNjICsgaCkpICsgKHRoaXMubWVzc2FnZXMubGVuZ3RoID09PSAwID8gMCA6IHRoaXMubWVzc2FnZXMubWFwKChpdCkgPT4gaXQuaGVpZ2h0IHx8IDApLnJlZHVjZSgoYWNjLCBoKSA9PiBhY2MgKyBoKSkgKyAodGhpcy5ub3Rlcy5sZW5ndGggPT09IDAgPyAwIDogdGhpcy5ub3Rlcy5tYXAoKGl0KSA9PiBpdC5oZWlnaHQgfHwgMCkucmVkdWNlKChhY2MsIGgpID0+IGFjYyArIGgpKTtcbiAgICB9LCBcImdldEhlaWdodFwiKSxcbiAgICBjbGVhcjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYWN0b3JzID0gW107XG4gICAgICB0aGlzLmJveGVzID0gW107XG4gICAgICB0aGlzLmxvb3BzID0gW107XG4gICAgICB0aGlzLm1lc3NhZ2VzID0gW107XG4gICAgICB0aGlzLm5vdGVzID0gW107XG4gICAgfSwgXCJjbGVhclwiKSxcbiAgICBhZGRCb3g6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oYm94TW9kZWwpIHtcbiAgICAgIHRoaXMuYm94ZXMucHVzaChib3hNb2RlbCk7XG4gICAgfSwgXCJhZGRCb3hcIiksXG4gICAgYWRkQWN0b3I6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oYWN0b3JNb2RlbCkge1xuICAgICAgdGhpcy5hY3RvcnMucHVzaChhY3Rvck1vZGVsKTtcbiAgICB9LCBcImFkZEFjdG9yXCIpLFxuICAgIGFkZExvb3A6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obG9vcE1vZGVsKSB7XG4gICAgICB0aGlzLmxvb3BzLnB1c2gobG9vcE1vZGVsKTtcbiAgICB9LCBcImFkZExvb3BcIiksXG4gICAgYWRkTWVzc2FnZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihtc2dNb2RlbCkge1xuICAgICAgdGhpcy5tZXNzYWdlcy5wdXNoKG1zZ01vZGVsKTtcbiAgICB9LCBcImFkZE1lc3NhZ2VcIiksXG4gICAgYWRkTm90ZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihub3RlTW9kZWwpIHtcbiAgICAgIHRoaXMubm90ZXMucHVzaChub3RlTW9kZWwpO1xuICAgIH0sIFwiYWRkTm90ZVwiKSxcbiAgICBsYXN0QWN0b3I6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5hY3RvcnNbdGhpcy5hY3RvcnMubGVuZ3RoIC0gMV07XG4gICAgfSwgXCJsYXN0QWN0b3JcIiksXG4gICAgbGFzdExvb3A6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5sb29wc1t0aGlzLmxvb3BzLmxlbmd0aCAtIDFdO1xuICAgIH0sIFwibGFzdExvb3BcIiksXG4gICAgbGFzdE1lc3NhZ2U6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5tZXNzYWdlc1t0aGlzLm1lc3NhZ2VzLmxlbmd0aCAtIDFdO1xuICAgIH0sIFwibGFzdE1lc3NhZ2VcIiksXG4gICAgbGFzdE5vdGU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5ub3Rlc1t0aGlzLm5vdGVzLmxlbmd0aCAtIDFdO1xuICAgIH0sIFwibGFzdE5vdGVcIiksXG4gICAgYWN0b3JzOiBbXSxcbiAgICBib3hlczogW10sXG4gICAgbG9vcHM6IFtdLFxuICAgIG1lc3NhZ2VzOiBbXSxcbiAgICBub3RlczogW11cbiAgfSxcbiAgaW5pdDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNlcXVlbmNlSXRlbXMgPSBbXTtcbiAgICB0aGlzLmFjdGl2YXRpb25zID0gW107XG4gICAgdGhpcy5tb2RlbHMuY2xlYXIoKTtcbiAgICB0aGlzLmRhdGEgPSB7XG4gICAgICBzdGFydHg6IHZvaWQgMCxcbiAgICAgIHN0b3B4OiB2b2lkIDAsXG4gICAgICBzdGFydHk6IHZvaWQgMCxcbiAgICAgIHN0b3B5OiB2b2lkIDBcbiAgICB9O1xuICAgIHRoaXMudmVydGljYWxQb3MgPSAwO1xuICAgIHNldENvbmYoZ2V0Q29uZmlnMigpKTtcbiAgfSwgXCJpbml0XCIpLFxuICB1cGRhdGVWYWw6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24ob2JqLCBrZXksIHZhbCwgZnVuKSB7XG4gICAgaWYgKG9ialtrZXldID09PSB2b2lkIDApIHtcbiAgICAgIG9ialtrZXldID0gdmFsO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmpba2V5XSA9IGZ1bih2YWwsIG9ialtrZXldKTtcbiAgICB9XG4gIH0sIFwidXBkYXRlVmFsXCIpLFxuICB1cGRhdGVCb3VuZHM6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oc3RhcnR4LCBzdGFydHksIHN0b3B4LCBzdG9weSkge1xuICAgIGNvbnN0IF9zZWxmID0gdGhpcztcbiAgICBsZXQgY250ID0gMDtcbiAgICBmdW5jdGlvbiB1cGRhdGVGbih0eXBlKSB7XG4gICAgICByZXR1cm4gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiB1cGRhdGVJdGVtQm91bmRzKGl0ZW0pIHtcbiAgICAgICAgY250Kys7XG4gICAgICAgIGNvbnN0IG4gPSBfc2VsZi5zZXF1ZW5jZUl0ZW1zLmxlbmd0aCAtIGNudCArIDE7XG4gICAgICAgIF9zZWxmLnVwZGF0ZVZhbChpdGVtLCBcInN0YXJ0eVwiLCBzdGFydHkgLSBuICogY29uZi5ib3hNYXJnaW4sIE1hdGgubWluKTtcbiAgICAgICAgX3NlbGYudXBkYXRlVmFsKGl0ZW0sIFwic3RvcHlcIiwgc3RvcHkgKyBuICogY29uZi5ib3hNYXJnaW4sIE1hdGgubWF4KTtcbiAgICAgICAgX3NlbGYudXBkYXRlVmFsKGJvdW5kcy5kYXRhLCBcInN0YXJ0eFwiLCBzdGFydHggLSBuICogY29uZi5ib3hNYXJnaW4sIE1hdGgubWluKTtcbiAgICAgICAgX3NlbGYudXBkYXRlVmFsKGJvdW5kcy5kYXRhLCBcInN0b3B4XCIsIHN0b3B4ICsgbiAqIGNvbmYuYm94TWFyZ2luLCBNYXRoLm1heCk7XG4gICAgICAgIGlmICghKHR5cGUgPT09IFwiYWN0aXZhdGlvblwiKSkge1xuICAgICAgICAgIF9zZWxmLnVwZGF0ZVZhbChpdGVtLCBcInN0YXJ0eFwiLCBzdGFydHggLSBuICogY29uZi5ib3hNYXJnaW4sIE1hdGgubWluKTtcbiAgICAgICAgICBfc2VsZi51cGRhdGVWYWwoaXRlbSwgXCJzdG9weFwiLCBzdG9weCArIG4gKiBjb25mLmJveE1hcmdpbiwgTWF0aC5tYXgpO1xuICAgICAgICAgIF9zZWxmLnVwZGF0ZVZhbChib3VuZHMuZGF0YSwgXCJzdGFydHlcIiwgc3RhcnR5IC0gbiAqIGNvbmYuYm94TWFyZ2luLCBNYXRoLm1pbik7XG4gICAgICAgICAgX3NlbGYudXBkYXRlVmFsKGJvdW5kcy5kYXRhLCBcInN0b3B5XCIsIHN0b3B5ICsgbiAqIGNvbmYuYm94TWFyZ2luLCBNYXRoLm1heCk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwidXBkYXRlSXRlbUJvdW5kc1wiKTtcbiAgICB9XG4gICAgX19uYW1lKHVwZGF0ZUZuLCBcInVwZGF0ZUZuXCIpO1xuICAgIHRoaXMuc2VxdWVuY2VJdGVtcy5mb3JFYWNoKHVwZGF0ZUZuKCkpO1xuICAgIHRoaXMuYWN0aXZhdGlvbnMuZm9yRWFjaCh1cGRhdGVGbihcImFjdGl2YXRpb25cIikpO1xuICB9LCBcInVwZGF0ZUJvdW5kc1wiKSxcbiAgaW5zZXJ0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHN0YXJ0eCwgc3RhcnR5LCBzdG9weCwgc3RvcHkpIHtcbiAgICBjb25zdCBfc3RhcnR4ID0gY29tbW9uX2RlZmF1bHQuZ2V0TWluKHN0YXJ0eCwgc3RvcHgpO1xuICAgIGNvbnN0IF9zdG9weCA9IGNvbW1vbl9kZWZhdWx0LmdldE1heChzdGFydHgsIHN0b3B4KTtcbiAgICBjb25zdCBfc3RhcnR5ID0gY29tbW9uX2RlZmF1bHQuZ2V0TWluKHN0YXJ0eSwgc3RvcHkpO1xuICAgIGNvbnN0IF9zdG9weSA9IGNvbW1vbl9kZWZhdWx0LmdldE1heChzdGFydHksIHN0b3B5KTtcbiAgICB0aGlzLnVwZGF0ZVZhbChib3VuZHMuZGF0YSwgXCJzdGFydHhcIiwgX3N0YXJ0eCwgTWF0aC5taW4pO1xuICAgIHRoaXMudXBkYXRlVmFsKGJvdW5kcy5kYXRhLCBcInN0YXJ0eVwiLCBfc3RhcnR5LCBNYXRoLm1pbik7XG4gICAgdGhpcy51cGRhdGVWYWwoYm91bmRzLmRhdGEsIFwic3RvcHhcIiwgX3N0b3B4LCBNYXRoLm1heCk7XG4gICAgdGhpcy51cGRhdGVWYWwoYm91bmRzLmRhdGEsIFwic3RvcHlcIiwgX3N0b3B5LCBNYXRoLm1heCk7XG4gICAgdGhpcy51cGRhdGVCb3VuZHMoX3N0YXJ0eCwgX3N0YXJ0eSwgX3N0b3B4LCBfc3RvcHkpO1xuICB9LCBcImluc2VydFwiKSxcbiAgbmV3QWN0aXZhdGlvbjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihtZXNzYWdlLCBkaWFncmFtMiwgYWN0b3JzKSB7XG4gICAgY29uc3QgYWN0b3JSZWN0ID0gYWN0b3JzLmdldChtZXNzYWdlLmZyb20pO1xuICAgIGNvbnN0IHN0YWNrZWRTaXplID0gYWN0b3JBY3RpdmF0aW9ucyhtZXNzYWdlLmZyb20pLmxlbmd0aCB8fCAwO1xuICAgIGNvbnN0IHggPSBhY3RvclJlY3QueCArIGFjdG9yUmVjdC53aWR0aCAvIDIgKyAoc3RhY2tlZFNpemUgLSAxKSAqIGNvbmYuYWN0aXZhdGlvbldpZHRoIC8gMjtcbiAgICB0aGlzLmFjdGl2YXRpb25zLnB1c2goe1xuICAgICAgc3RhcnR4OiB4LFxuICAgICAgc3RhcnR5OiB0aGlzLnZlcnRpY2FsUG9zICsgMixcbiAgICAgIHN0b3B4OiB4ICsgY29uZi5hY3RpdmF0aW9uV2lkdGgsXG4gICAgICBzdG9weTogdm9pZCAwLFxuICAgICAgYWN0b3I6IG1lc3NhZ2UuZnJvbSxcbiAgICAgIGFuY2hvcmVkOiBzdmdEcmF3X2RlZmF1bHQuYW5jaG9yRWxlbWVudChkaWFncmFtMilcbiAgICB9KTtcbiAgfSwgXCJuZXdBY3RpdmF0aW9uXCIpLFxuICBlbmRBY3RpdmF0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICBjb25zdCBsYXN0QWN0b3JBY3RpdmF0aW9uSWR4ID0gdGhpcy5hY3RpdmF0aW9ucy5tYXAoZnVuY3Rpb24oYWN0aXZhdGlvbikge1xuICAgICAgcmV0dXJuIGFjdGl2YXRpb24uYWN0b3I7XG4gICAgfSkubGFzdEluZGV4T2YobWVzc2FnZS5mcm9tKTtcbiAgICByZXR1cm4gdGhpcy5hY3RpdmF0aW9ucy5zcGxpY2UobGFzdEFjdG9yQWN0aXZhdGlvbklkeCwgMSlbMF07XG4gIH0sIFwiZW5kQWN0aXZhdGlvblwiKSxcbiAgY3JlYXRlTG9vcDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbih0aXRsZSA9IHsgbWVzc2FnZTogdm9pZCAwLCB3cmFwOiBmYWxzZSwgd2lkdGg6IHZvaWQgMCB9LCBmaWxsKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXJ0eDogdm9pZCAwLFxuICAgICAgc3RhcnR5OiB0aGlzLnZlcnRpY2FsUG9zLFxuICAgICAgc3RvcHg6IHZvaWQgMCxcbiAgICAgIHN0b3B5OiB2b2lkIDAsXG4gICAgICB0aXRsZTogdGl0bGUubWVzc2FnZSxcbiAgICAgIHdyYXA6IHRpdGxlLndyYXAsXG4gICAgICB3aWR0aDogdGl0bGUud2lkdGgsXG4gICAgICBoZWlnaHQ6IDAsXG4gICAgICBmaWxsXG4gICAgfTtcbiAgfSwgXCJjcmVhdGVMb29wXCIpLFxuICBuZXdMb29wOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHRpdGxlID0geyBtZXNzYWdlOiB2b2lkIDAsIHdyYXA6IGZhbHNlLCB3aWR0aDogdm9pZCAwIH0sIGZpbGwpIHtcbiAgICB0aGlzLnNlcXVlbmNlSXRlbXMucHVzaCh0aGlzLmNyZWF0ZUxvb3AodGl0bGUsIGZpbGwpKTtcbiAgfSwgXCJuZXdMb29wXCIpLFxuICBlbmRMb29wOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnNlcXVlbmNlSXRlbXMucG9wKCk7XG4gIH0sIFwiZW5kTG9vcFwiKSxcbiAgaXNMb29wT3ZlcmxhcDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5zZXF1ZW5jZUl0ZW1zLmxlbmd0aCA/IHRoaXMuc2VxdWVuY2VJdGVtc1t0aGlzLnNlcXVlbmNlSXRlbXMubGVuZ3RoIC0gMV0ub3ZlcmxhcCA6IGZhbHNlO1xuICB9LCBcImlzTG9vcE92ZXJsYXBcIiksXG4gIGFkZFNlY3Rpb25Ub0xvb3A6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obWVzc2FnZSkge1xuICAgIGNvbnN0IGxvb3AgPSB0aGlzLnNlcXVlbmNlSXRlbXMucG9wKCk7XG4gICAgbG9vcC5zZWN0aW9ucyA9IGxvb3Auc2VjdGlvbnMgfHwgW107XG4gICAgbG9vcC5zZWN0aW9uVGl0bGVzID0gbG9vcC5zZWN0aW9uVGl0bGVzIHx8IFtdO1xuICAgIGxvb3Auc2VjdGlvbnMucHVzaCh7IHk6IGJvdW5kcy5nZXRWZXJ0aWNhbFBvcygpLCBoZWlnaHQ6IDAgfSk7XG4gICAgbG9vcC5zZWN0aW9uVGl0bGVzLnB1c2gobWVzc2FnZSk7XG4gICAgdGhpcy5zZXF1ZW5jZUl0ZW1zLnB1c2gobG9vcCk7XG4gIH0sIFwiYWRkU2VjdGlvblRvTG9vcFwiKSxcbiAgc2F2ZVZlcnRpY2FsUG9zOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmlzTG9vcE92ZXJsYXAoKSkge1xuICAgICAgdGhpcy5zYXZlZFZlcnRpY2FsUG9zID0gdGhpcy52ZXJ0aWNhbFBvcztcbiAgICB9XG4gIH0sIFwic2F2ZVZlcnRpY2FsUG9zXCIpLFxuICByZXNldFZlcnRpY2FsUG9zOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLmlzTG9vcE92ZXJsYXAoKSkge1xuICAgICAgdGhpcy52ZXJ0aWNhbFBvcyA9IHRoaXMuc2F2ZWRWZXJ0aWNhbFBvcztcbiAgICB9XG4gIH0sIFwicmVzZXRWZXJ0aWNhbFBvc1wiKSxcbiAgYnVtcFZlcnRpY2FsUG9zOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGJ1bXApIHtcbiAgICB0aGlzLnZlcnRpY2FsUG9zID0gdGhpcy52ZXJ0aWNhbFBvcyArIGJ1bXA7XG4gICAgdGhpcy5kYXRhLnN0b3B5ID0gY29tbW9uX2RlZmF1bHQuZ2V0TWF4KHRoaXMuZGF0YS5zdG9weSwgdGhpcy52ZXJ0aWNhbFBvcyk7XG4gIH0sIFwiYnVtcFZlcnRpY2FsUG9zXCIpLFxuICBnZXRWZXJ0aWNhbFBvczogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy52ZXJ0aWNhbFBvcztcbiAgfSwgXCJnZXRWZXJ0aWNhbFBvc1wiKSxcbiAgZ2V0Qm91bmRzOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7IGJvdW5kczogdGhpcy5kYXRhLCBtb2RlbHM6IHRoaXMubW9kZWxzIH07XG4gIH0sIFwiZ2V0Qm91bmRzXCIpXG59O1xudmFyIGRyYXdOb3RlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyBmdW5jdGlvbihlbGVtLCBub3RlTW9kZWwsIGlkKSB7XG4gIGJvdW5kcy5idW1wVmVydGljYWxQb3MoY29uZi5ib3hNYXJnaW4pO1xuICBub3RlTW9kZWwuaGVpZ2h0ID0gY29uZi5ib3hNYXJnaW47XG4gIG5vdGVNb2RlbC5zdGFydHkgPSBib3VuZHMuZ2V0VmVydGljYWxQb3MoKTtcbiAgY29uc3QgcmVjdCA9IGdldE5vdGVSZWN0KCk7XG4gIHJlY3QueCA9IG5vdGVNb2RlbC5zdGFydHg7XG4gIHJlY3QueSA9IG5vdGVNb2RlbC5zdGFydHk7XG4gIHJlY3Qud2lkdGggPSBub3RlTW9kZWwud2lkdGggfHwgY29uZi53aWR0aDtcbiAgcmVjdC5jbGFzcyA9IFwibm90ZVwiO1xuICBjb25zdCBnID0gZWxlbS5hcHBlbmQoXCJnXCIpO1xuICBnLmF0dHIoXCJkYXRhLWV0XCIsIFwibm90ZVwiKTtcbiAgZy5hdHRyKFwiZGF0YS1pZFwiLCBcImlcIiArIGlkKTtcbiAgY29uc3QgcmVjdEVsZW0gPSBzdmdEcmF3X2RlZmF1bHQuZHJhd1JlY3QoZywgcmVjdCk7XG4gIGNvbnN0IHRleHRPYmogPSBnZXRUZXh0T2JqKCk7XG4gIHRleHRPYmoueCA9IG5vdGVNb2RlbC5zdGFydHg7XG4gIHRleHRPYmoueSA9IG5vdGVNb2RlbC5zdGFydHk7XG4gIHRleHRPYmoud2lkdGggPSByZWN0LndpZHRoO1xuICB0ZXh0T2JqLmR5ID0gXCIxZW1cIjtcbiAgdGV4dE9iai50ZXh0ID0gbm90ZU1vZGVsLm1lc3NhZ2U7XG4gIHRleHRPYmouY2xhc3MgPSBcIm5vdGVUZXh0XCI7XG4gIHRleHRPYmouZm9udEZhbWlseSA9IGNvbmYubm90ZUZvbnRGYW1pbHk7XG4gIHRleHRPYmouZm9udFNpemUgPSBjb25mLm5vdGVGb250U2l6ZTtcbiAgdGV4dE9iai5mb250V2VpZ2h0ID0gY29uZi5ub3RlRm9udFdlaWdodDtcbiAgdGV4dE9iai5hbmNob3IgPSBjb25mLm5vdGVBbGlnbjtcbiAgdGV4dE9iai50ZXh0TWFyZ2luID0gY29uZi5ub3RlTWFyZ2luO1xuICB0ZXh0T2JqLnZhbGlnbiA9IFwiY2VudGVyXCI7XG4gIGNvbnN0IHRleHRFbGVtID0gaGFzS2F0ZXgodGV4dE9iai50ZXh0KSA/IGF3YWl0IGRyYXdLYXRleChnLCB0ZXh0T2JqKSA6IGRyYXdUZXh0KGcsIHRleHRPYmopO1xuICBjb25zdCB0ZXh0SGVpZ2h0ID0gTWF0aC5yb3VuZChcbiAgICB0ZXh0RWxlbS5tYXAoKHRlKSA9PiAodGUuX2dyb3VwcyB8fCB0ZSlbMF1bMF0uZ2V0QkJveCgpLmhlaWdodCkucmVkdWNlKChhY2MsIGN1cnIpID0+IGFjYyArIGN1cnIpXG4gICk7XG4gIHJlY3RFbGVtLmF0dHIoXCJoZWlnaHRcIiwgdGV4dEhlaWdodCArIDIgKiBjb25mLm5vdGVNYXJnaW4pO1xuICBub3RlTW9kZWwuaGVpZ2h0ICs9IHRleHRIZWlnaHQgKyAyICogY29uZi5ub3RlTWFyZ2luO1xuICBib3VuZHMuYnVtcFZlcnRpY2FsUG9zKHRleHRIZWlnaHQgKyAyICogY29uZi5ub3RlTWFyZ2luKTtcbiAgbm90ZU1vZGVsLnN0b3B5ID0gbm90ZU1vZGVsLnN0YXJ0eSArIHRleHRIZWlnaHQgKyAyICogY29uZi5ub3RlTWFyZ2luO1xuICBub3RlTW9kZWwuc3RvcHggPSBub3RlTW9kZWwuc3RhcnR4ICsgcmVjdC53aWR0aDtcbiAgYm91bmRzLmluc2VydChub3RlTW9kZWwuc3RhcnR4LCBub3RlTW9kZWwuc3RhcnR5LCBub3RlTW9kZWwuc3RvcHgsIG5vdGVNb2RlbC5zdG9weSk7XG4gIGJvdW5kcy5tb2RlbHMuYWRkTm90ZShub3RlTW9kZWwpO1xufSwgXCJkcmF3Tm90ZVwiKTtcbnZhciBkcmF3Q2VudHJhbENvbm5lY3Rpb24gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIG1zZywgbXNnTW9kZWwsIGRpYWdPYmosIHN0YXJ0eCwgc3RvcHgsIGxpbmVTdGFydFkpIHtcbiAgY29uc3QgYWN0b3JzID0gZGlhZ09iai5kYi5nZXRBY3RvcnMoKTtcbiAgY29uc3QgZnJvbUFjdG9yID0gYWN0b3JzLmdldChtc2cuZnJvbSk7XG4gIGNvbnN0IHRvQWN0b3IgPSBhY3RvcnMuZ2V0KG1zZy50byk7XG4gIGNvbnN0IGlzQXV0b051bWJlck9uID0gbXNnTW9kZWwuc2VxdWVuY2VWaXNpYmxlO1xuICBsZXQgZnJvbUNlbnRlciA9IGZyb21BY3Rvci54ICsgZnJvbUFjdG9yLndpZHRoIC8gMjtcbiAgbGV0IHRvQ2VudGVyID0gdG9BY3Rvci54ICsgdG9BY3Rvci53aWR0aCAvIDI7XG4gIGNvbnN0IGlzTGVmdFRvUmlnaHQgPSBmcm9tQ2VudGVyIDw9IHRvQ2VudGVyO1xuICBjb25zdCBpc1JldmVyc2UgPSBpc1JldmVyc2VBcnJvd1R5cGUobXNnLCBkaWFnT2JqKTtcbiAgY29uc3QgZyA9IGVsZW0uYXBwZW5kKFwiZ1wiKTtcbiAgY29uc3QgQ0VOVFJBTF9DT05ORUNUSU9OX0NJUkNMRV9PRkZTRVQgPSAxNi41O1xuICBjb25zdCBnZXRDaXJjbGVPZmZzZXQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChpc0xlZnRUb1JpZ2h0MiwgaXNSZXZlcnNlMikgPT4ge1xuICAgIGNvbnN0IGJhc2VPZmZzZXQgPSBpc0xlZnRUb1JpZ2h0MiA/IENFTlRSQUxfQ09OTkVDVElPTl9DSVJDTEVfT0ZGU0VUIDogLUNFTlRSQUxfQ09OTkVDVElPTl9DSVJDTEVfT0ZGU0VUO1xuICAgIHJldHVybiBpc1JldmVyc2UyID8gLWJhc2VPZmZzZXQgOiBiYXNlT2Zmc2V0O1xuICB9LCBcImdldENpcmNsZU9mZnNldFwiKTtcbiAgY29uc3QgZHJhd0NpcmNsZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGN4KSA9PiB7XG4gICAgZy5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImN4XCIsIGN4KS5hdHRyKFwiY3lcIiwgbGluZVN0YXJ0WSkuYXR0cihcInJcIiwgNSkuYXR0cihcIndpZHRoXCIsIDEwKS5hdHRyKFwiaGVpZ2h0XCIsIDEwKTtcbiAgfSwgXCJkcmF3Q2lyY2xlXCIpO1xuICBjb25zdCB7IENFTlRSQUxfQ09OTkVDVElPTiwgQ0VOVFJBTF9DT05ORUNUSU9OX1JFVkVSU0UsIENFTlRSQUxfQ09OTkVDVElPTl9EVUFMIH0gPSBkaWFnT2JqLmRiLkxJTkVUWVBFO1xuICBpZiAoaXNBdXRvTnVtYmVyT24pIHtcbiAgICBzd2l0Y2ggKG1zZy5jZW50cmFsQ29ubmVjdGlvbikge1xuICAgICAgY2FzZSBDRU5UUkFMX0NPTk5FQ1RJT046XG4gICAgICAgIGlmIChpc1JldmVyc2UpIHtcbiAgICAgICAgICB0b0NlbnRlciArPSBnZXRDaXJjbGVPZmZzZXQoaXNMZWZ0VG9SaWdodCwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIENFTlRSQUxfQ09OTkVDVElPTl9SRVZFUlNFOlxuICAgICAgICBpZiAoIWlzUmV2ZXJzZSkge1xuICAgICAgICAgIGZyb21DZW50ZXIgKz0gZ2V0Q2lyY2xlT2Zmc2V0KGlzTGVmdFRvUmlnaHQsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQ0VOVFJBTF9DT05ORUNUSU9OX0RVQUw6XG4gICAgICAgIGlmIChpc1JldmVyc2UpIHtcbiAgICAgICAgICB0b0NlbnRlciArPSBnZXRDaXJjbGVPZmZzZXQoaXNMZWZ0VG9SaWdodCwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZnJvbUNlbnRlciArPSBnZXRDaXJjbGVPZmZzZXQoaXNMZWZ0VG9SaWdodCwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBzd2l0Y2ggKG1zZy5jZW50cmFsQ29ubmVjdGlvbikge1xuICAgIGNhc2UgQ0VOVFJBTF9DT05ORUNUSU9OOlxuICAgICAgZHJhd0NpcmNsZSh0b0NlbnRlcik7XG4gICAgICBicmVhaztcbiAgICBjYXNlIENFTlRSQUxfQ09OTkVDVElPTl9SRVZFUlNFOlxuICAgICAgZHJhd0NpcmNsZShmcm9tQ2VudGVyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgQ0VOVFJBTF9DT05ORUNUSU9OX0RVQUw6XG4gICAgICBkcmF3Q2lyY2xlKGZyb21DZW50ZXIpO1xuICAgICAgZHJhd0NpcmNsZSh0b0NlbnRlcik7XG4gICAgICBicmVhaztcbiAgfVxufSwgXCJkcmF3Q2VudHJhbENvbm5lY3Rpb25cIik7XG52YXIgbWVzc2FnZUZvbnQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChjbmYpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBmb250RmFtaWx5OiBjbmYubWVzc2FnZUZvbnRGYW1pbHksXG4gICAgZm9udFNpemU6IGNuZi5tZXNzYWdlRm9udFNpemUsXG4gICAgZm9udFdlaWdodDogY25mLm1lc3NhZ2VGb250V2VpZ2h0XG4gIH07XG59LCBcIm1lc3NhZ2VGb250XCIpO1xudmFyIG5vdGVGb250ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoY25mKSA9PiB7XG4gIHJldHVybiB7XG4gICAgZm9udEZhbWlseTogY25mLm5vdGVGb250RmFtaWx5LFxuICAgIGZvbnRTaXplOiBjbmYubm90ZUZvbnRTaXplLFxuICAgIGZvbnRXZWlnaHQ6IGNuZi5ub3RlRm9udFdlaWdodFxuICB9O1xufSwgXCJub3RlRm9udFwiKTtcbnZhciBhY3RvckZvbnQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChjbmYpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBmb250RmFtaWx5OiBjbmYuYWN0b3JGb250RmFtaWx5LFxuICAgIGZvbnRTaXplOiBjbmYuYWN0b3JGb250U2l6ZSxcbiAgICBmb250V2VpZ2h0OiBjbmYuYWN0b3JGb250V2VpZ2h0XG4gIH07XG59LCBcImFjdG9yRm9udFwiKTtcbmFzeW5jIGZ1bmN0aW9uIGJvdW5kTWVzc2FnZShfZGlhZ3JhbSwgbXNnTW9kZWwpIHtcbiAgYm91bmRzLmJ1bXBWZXJ0aWNhbFBvcygxMCk7XG4gIGNvbnN0IHsgc3RhcnR4LCBzdG9weCwgbWVzc2FnZSB9ID0gbXNnTW9kZWw7XG4gIGNvbnN0IGxpbmVzID0gY29tbW9uX2RlZmF1bHQuc3BsaXRCcmVha3MobWVzc2FnZSkubGVuZ3RoO1xuICBjb25zdCBpc0thdGV4TXNnID0gaGFzS2F0ZXgobWVzc2FnZSk7XG4gIGNvbnN0IHRleHREaW1zID0gaXNLYXRleE1zZyA/IGF3YWl0IGNhbGN1bGF0ZU1hdGhNTERpbWVuc2lvbnMobWVzc2FnZSwgZ2V0Q29uZmlnMigpKSA6IHV0aWxzX2RlZmF1bHQuY2FsY3VsYXRlVGV4dERpbWVuc2lvbnMobWVzc2FnZSwgbWVzc2FnZUZvbnQoY29uZikpO1xuICBpZiAoIWlzS2F0ZXhNc2cpIHtcbiAgICBjb25zdCBsaW5lSGVpZ2h0ID0gdGV4dERpbXMuaGVpZ2h0IC8gbGluZXM7XG4gICAgbXNnTW9kZWwuaGVpZ2h0ICs9IGxpbmVIZWlnaHQ7XG4gICAgYm91bmRzLmJ1bXBWZXJ0aWNhbFBvcyhsaW5lSGVpZ2h0KTtcbiAgfVxuICBsZXQgbGluZVN0YXJ0WTtcbiAgbGV0IHRvdGFsT2Zmc2V0ID0gdGV4dERpbXMuaGVpZ2h0IC0gMTA7XG4gIGNvbnN0IHRleHRXaWR0aCA9IHRleHREaW1zLndpZHRoO1xuICBpZiAoc3RhcnR4ID09PSBzdG9weCkge1xuICAgIGxpbmVTdGFydFkgPSBib3VuZHMuZ2V0VmVydGljYWxQb3MoKSArIHRvdGFsT2Zmc2V0O1xuICAgIGlmICghY29uZi5yaWdodEFuZ2xlcykge1xuICAgICAgdG90YWxPZmZzZXQgKz0gY29uZi5ib3hNYXJnaW47XG4gICAgICBsaW5lU3RhcnRZID0gYm91bmRzLmdldFZlcnRpY2FsUG9zKCkgKyB0b3RhbE9mZnNldDtcbiAgICB9XG4gICAgdG90YWxPZmZzZXQgKz0gMzA7XG4gICAgY29uc3QgZHggPSBjb21tb25fZGVmYXVsdC5nZXRNYXgodGV4dFdpZHRoIC8gMiwgY29uZi53aWR0aCAvIDIpO1xuICAgIGJvdW5kcy5pbnNlcnQoXG4gICAgICBzdGFydHggLSBkeCxcbiAgICAgIGJvdW5kcy5nZXRWZXJ0aWNhbFBvcygpIC0gMTAgKyB0b3RhbE9mZnNldCxcbiAgICAgIHN0b3B4ICsgZHgsXG4gICAgICBib3VuZHMuZ2V0VmVydGljYWxQb3MoKSArIDMwICsgdG90YWxPZmZzZXRcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIHRvdGFsT2Zmc2V0ICs9IGNvbmYuYm94TWFyZ2luO1xuICAgIGxpbmVTdGFydFkgPSBib3VuZHMuZ2V0VmVydGljYWxQb3MoKSArIHRvdGFsT2Zmc2V0O1xuICAgIGJvdW5kcy5pbnNlcnQoc3RhcnR4LCBsaW5lU3RhcnRZIC0gMTAsIHN0b3B4LCBsaW5lU3RhcnRZKTtcbiAgfVxuICBib3VuZHMuYnVtcFZlcnRpY2FsUG9zKHRvdGFsT2Zmc2V0KTtcbiAgbXNnTW9kZWwuaGVpZ2h0ICs9IHRvdGFsT2Zmc2V0O1xuICBtc2dNb2RlbC5zdG9weSA9IG1zZ01vZGVsLnN0YXJ0eSArIG1zZ01vZGVsLmhlaWdodDtcbiAgYm91bmRzLmluc2VydChtc2dNb2RlbC5mcm9tQm91bmRzLCBtc2dNb2RlbC5zdGFydHksIG1zZ01vZGVsLnRvQm91bmRzLCBtc2dNb2RlbC5zdG9weSk7XG4gIHJldHVybiBsaW5lU3RhcnRZO1xufVxuX19uYW1lKGJvdW5kTWVzc2FnZSwgXCJib3VuZE1lc3NhZ2VcIik7XG52YXIgZHJhd01lc3NhZ2UgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGFzeW5jIGZ1bmN0aW9uKGRpYWdyYW0yLCBtc2dNb2RlbCwgbGluZVN0YXJ0WSwgZGlhZ09iaiwgbXNnLCBkaWFncmFtSWQpIHtcbiAgY29uc3QgeyBzdGFydHgsIHN0b3B4LCBzdGFydHksIG1lc3NhZ2UsIHR5cGUsIHNlcXVlbmNlSW5kZXgsIHNlcXVlbmNlVmlzaWJsZSB9ID0gbXNnTW9kZWw7XG4gIGNvbnN0IHRleHREaW1zID0gdXRpbHNfZGVmYXVsdC5jYWxjdWxhdGVUZXh0RGltZW5zaW9ucyhtZXNzYWdlLCBtZXNzYWdlRm9udChjb25mKSk7XG4gIGNvbnN0IHRleHRPYmogPSBnZXRUZXh0T2JqKCk7XG4gIHRleHRPYmoueCA9IE1hdGgubWluKHN0YXJ0eCwgc3RvcHgpO1xuICB0ZXh0T2JqLnkgPSBzdGFydHkgKyAxMDtcbiAgdGV4dE9iai53aWR0aCA9IE1hdGguYWJzKHN0b3B4IC0gc3RhcnR4KTtcbiAgdGV4dE9iai5jbGFzcyA9IFwibWVzc2FnZVRleHRcIjtcbiAgdGV4dE9iai5keSA9IFwiMWVtXCI7XG4gIHRleHRPYmoudGV4dCA9IG1lc3NhZ2U7XG4gIHRleHRPYmouZm9udEZhbWlseSA9IGNvbmYubWVzc2FnZUZvbnRGYW1pbHk7XG4gIHRleHRPYmouZm9udFNpemUgPSBjb25mLm1lc3NhZ2VGb250U2l6ZTtcbiAgdGV4dE9iai5mb250V2VpZ2h0ID0gY29uZi5tZXNzYWdlRm9udFdlaWdodDtcbiAgdGV4dE9iai5hbmNob3IgPSBjb25mLm1lc3NhZ2VBbGlnbjtcbiAgdGV4dE9iai52YWxpZ24gPSBcImNlbnRlclwiO1xuICB0ZXh0T2JqLnRleHRNYXJnaW4gPSBjb25mLndyYXBQYWRkaW5nO1xuICB0ZXh0T2JqLnRzcGFuID0gZmFsc2U7XG4gIGlmIChoYXNLYXRleCh0ZXh0T2JqLnRleHQpKSB7XG4gICAgYXdhaXQgZHJhd0thdGV4KGRpYWdyYW0yLCB0ZXh0T2JqLCB7IHN0YXJ0eCwgc3RvcHgsIHN0YXJ0eTogbGluZVN0YXJ0WSB9KTtcbiAgfSBlbHNlIHtcbiAgICBkcmF3VGV4dChkaWFncmFtMiwgdGV4dE9iaik7XG4gIH1cbiAgY29uc3QgdGV4dFdpZHRoID0gdGV4dERpbXMud2lkdGg7XG4gIGxldCBsaW5lO1xuICBpZiAoc3RhcnR4ID09PSBzdG9weCkge1xuICAgIGNvbnN0IGlzQXV0b051bWJlck9uID0gc2VxdWVuY2VWaXNpYmxlIHx8IGNvbmYuc2hvd1NlcXVlbmNlTnVtYmVycztcbiAgICBjb25zdCBpc1JldmVyc2UgPSBpc1JldmVyc2VBcnJvd1R5cGUobXNnLCBkaWFnT2JqKTtcbiAgICBjb25zdCBpc0JpZGlyZWN0aW9uYWwgPSBpc0JpZGlyZWN0aW9uYWxBcnJvd1R5cGUobXNnLCBkaWFnT2JqKTtcbiAgICBjb25zdCBsaW5lU3RhcnRYID0gc3RhcnR4ICsgKGlzQXV0b051bWJlck9uICYmIChpc1JldmVyc2UgfHwgaXNCaWRpcmVjdGlvbmFsKSA/IDEwIDogMCk7XG4gICAgaWYgKGNvbmYucmlnaHRBbmdsZXMpIHtcbiAgICAgIGxpbmUgPSBkaWFncmFtMi5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXG4gICAgICAgIFwiZFwiLFxuICAgICAgICBgTSAgJHtsaW5lU3RhcnRYfSwke2xpbmVTdGFydFl9IEggJHtzdGFydHggKyBjb21tb25fZGVmYXVsdC5nZXRNYXgoY29uZi53aWR0aCAvIDIsIHRleHRXaWR0aCAvIDIpfSBWICR7bGluZVN0YXJ0WSArIDI1fSBIICR7c3RhcnR4fWBcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpbmUgPSBkaWFncmFtMi5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXG4gICAgICAgIFwiZFwiLFxuICAgICAgICBcIk0gXCIgKyBsaW5lU3RhcnRYICsgXCIsXCIgKyBsaW5lU3RhcnRZICsgXCIgQyBcIiArIChsaW5lU3RhcnRYICsgNjApICsgXCIsXCIgKyAobGluZVN0YXJ0WSAtIDEwKSArIFwiIFwiICsgKHN0YXJ0eCArIDYwKSArIFwiLFwiICsgKGxpbmVTdGFydFkgKyAzMCkgKyBcIiBcIiArIHN0YXJ0eCArIFwiLFwiICsgKGxpbmVTdGFydFkgKyAyMClcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChoYXNDZW50cmFsQ29ubmVjdGlvbihtc2csIGRpYWdPYmopKSB7XG4gICAgICBkcmF3Q2VudHJhbENvbm5lY3Rpb24oZGlhZ3JhbTIsIG1zZywgbXNnTW9kZWwsIGRpYWdPYmosIHN0YXJ0eCwgc3RvcHgsIGxpbmVTdGFydFkpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsaW5lID0gZGlhZ3JhbTIuYXBwZW5kKFwibGluZVwiKTtcbiAgICBsaW5lLmF0dHIoXCJ4MVwiLCBzdGFydHgpO1xuICAgIGxpbmUuYXR0cihcInkxXCIsIGxpbmVTdGFydFkpO1xuICAgIGxpbmUuYXR0cihcIngyXCIsIHN0b3B4KTtcbiAgICBsaW5lLmF0dHIoXCJ5MlwiLCBsaW5lU3RhcnRZKTtcbiAgICBpZiAoaGFzQ2VudHJhbENvbm5lY3Rpb24obXNnLCBkaWFnT2JqKSkge1xuICAgICAgZHJhd0NlbnRyYWxDb25uZWN0aW9uKGRpYWdyYW0yLCBtc2csIG1zZ01vZGVsLCBkaWFnT2JqLCBzdGFydHgsIHN0b3B4LCBsaW5lU3RhcnRZKTtcbiAgICB9XG4gIH1cbiAgaWYgKHR5cGUgPT09IGRpYWdPYmouZGIuTElORVRZUEUuRE9UVEVEIHx8IHR5cGUgPT09IGRpYWdPYmouZGIuTElORVRZUEUuRE9UVEVEX0NST1NTIHx8IHR5cGUgPT09IGRpYWdPYmouZGIuTElORVRZUEUuRE9UVEVEX1BPSU5UIHx8IHR5cGUgPT09IGRpYWdPYmouZGIuTElORVRZUEUuRE9UVEVEX09QRU4gfHwgdHlwZSA9PT0gZGlhZ09iai5kYi5MSU5FVFlQRS5CSURJUkVDVElPTkFMX0RPVFRFRCB8fCB0eXBlID09PSBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElEX1RPUF9ET1RURUQgfHwgdHlwZSA9PT0gZGlhZ09iai5kYi5MSU5FVFlQRS5TT0xJRF9CT1RUT01fRE9UVEVEIHx8IHR5cGUgPT09IGRpYWdPYmouZGIuTElORVRZUEUuU1RJQ0tfVE9QX0RPVFRFRCB8fCB0eXBlID09PSBkaWFnT2JqLmRiLkxJTkVUWVBFLlNUSUNLX0JPVFRPTV9ET1RURUQgfHwgdHlwZSA9PT0gZGlhZ09iai5kYi5MSU5FVFlQRS5TT0xJRF9BUlJPV19UT1BfUkVWRVJTRV9ET1RURUQgfHwgdHlwZSA9PT0gZGlhZ09iai5kYi5MSU5FVFlQRS5TT0xJRF9BUlJPV19CT1RUT01fUkVWRVJTRV9ET1RURUQgfHwgdHlwZSA9PT0gZGlhZ09iai5kYi5MSU5FVFlQRS5TVElDS19BUlJPV19UT1BfUkVWRVJTRV9ET1RURUQgfHwgdHlwZSA9PT0gZGlhZ09iai5kYi5MSU5FVFlQRS5TVElDS19BUlJPV19CT1RUT01fUkVWRVJTRV9ET1RURUQpIHtcbiAgICBsaW5lLnN0eWxlKFwic3Ryb2tlLWRhc2hhcnJheVwiLCBcIjMsIDNcIik7XG4gICAgbGluZS5hdHRyKFwiY2xhc3NcIiwgXCJtZXNzYWdlTGluZTFcIik7XG4gIH0gZWxzZSB7XG4gICAgbGluZS5hdHRyKFwiY2xhc3NcIiwgXCJtZXNzYWdlTGluZTBcIik7XG4gIH1cbiAgbGluZS5hdHRyKFwiZGF0YS1ldFwiLCBcIm1lc3NhZ2VcIik7XG4gIGxpbmUuYXR0cihcImRhdGEtaWRcIiwgXCJpXCIgKyBtc2dNb2RlbC5pZCk7XG4gIGxpbmUuYXR0cihcImRhdGEtZnJvbVwiLCBtc2dNb2RlbC5mcm9tKTtcbiAgbGluZS5hdHRyKFwiZGF0YS10b1wiLCBtc2dNb2RlbC50byk7XG4gIGxldCB1cmwgPSBcIlwiO1xuICBpZiAoY29uZi5hcnJvd01hcmtlckFic29sdXRlKSB7XG4gICAgdXJsID0gZ2V0VXJsKHRydWUpO1xuICB9XG4gIGxpbmUuYXR0cihcInN0cm9rZS13aWR0aFwiLCAyKTtcbiAgbGluZS5hdHRyKFwic3Ryb2tlXCIsIFwibm9uZVwiKTtcbiAgbGluZS5zdHlsZShcImZpbGxcIiwgXCJub25lXCIpO1xuICBpZiAodHlwZSA9PT0gZGlhZ09iai5kYi5MSU5FVFlQRS5TT0xJRF9UT1AgfHwgdHlwZSA9PT0gZGlhZ09iai5kYi5MSU5FVFlQRS5TT0xJRF9UT1BfRE9UVEVEKSB7XG4gICAgbGluZS5hdHRyKFwibWFya2VyLWVuZFwiLCBcInVybChcIiArIHVybCArIFwiI1wiICsgZGlhZ3JhbUlkICsgXCItc29saWRUb3BBcnJvd0hlYWQpXCIpO1xuICB9XG4gIGlmICh0eXBlID09PSBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElEX0JPVFRPTSB8fCB0eXBlID09PSBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElEX0JPVFRPTV9ET1RURUQpIHtcbiAgICBsaW5lLmF0dHIoXCJtYXJrZXItZW5kXCIsIFwidXJsKFwiICsgdXJsICsgXCIjXCIgKyBkaWFncmFtSWQgKyBcIi1zb2xpZEJvdHRvbUFycm93SGVhZClcIik7XG4gIH1cbiAgaWYgKHR5cGUgPT09IGRpYWdPYmouZGIuTElORVRZUEUuU1RJQ0tfVE9QIHx8IHR5cGUgPT09IGRpYWdPYmouZGIuTElORVRZUEUuU1RJQ0tfVE9QX0RPVFRFRCkge1xuICAgIGxpbmUuYXR0cihcIm1hcmtlci1lbmRcIiwgXCJ1cmwoXCIgKyB1cmwgKyBcIiNcIiArIGRpYWdyYW1JZCArIFwiLXN0aWNrVG9wQXJyb3dIZWFkKVwiKTtcbiAgfVxuICBpZiAodHlwZSA9PT0gZGlhZ09iai5kYi5MSU5FVFlQRS5TVElDS19CT1RUT00gfHwgdHlwZSA9PT0gZGlhZ09iai5kYi5MSU5FVFlQRS5TVElDS19CT1RUT01fRE9UVEVEKSB7XG4gICAgbGluZS5hdHRyKFwibWFya2VyLWVuZFwiLCBcInVybChcIiArIHVybCArIFwiI1wiICsgZGlhZ3JhbUlkICsgXCItc3RpY2tCb3R0b21BcnJvd0hlYWQpXCIpO1xuICB9XG4gIGlmICh0eXBlID09PSBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElEX0FSUk9XX1RPUF9SRVZFUlNFIHx8IHR5cGUgPT09IGRpYWdPYmouZGIuTElORVRZUEUuU09MSURfQVJST1dfVE9QX1JFVkVSU0VfRE9UVEVEKSB7XG4gICAgbGluZS5hdHRyKFwibWFya2VyLXN0YXJ0XCIsIFwidXJsKFwiICsgdXJsICsgXCIjXCIgKyBkaWFncmFtSWQgKyBcIi1zb2xpZEJvdHRvbUFycm93SGVhZClcIik7XG4gIH1cbiAgaWYgKHR5cGUgPT09IGRpYWdPYmouZGIuTElORVRZUEUuU09MSURfQVJST1dfQk9UVE9NX1JFVkVSU0UgfHwgdHlwZSA9PT0gZGlhZ09iai5kYi5MSU5FVFlQRS5TT0xJRF9BUlJPV19CT1RUT01fUkVWRVJTRV9ET1RURUQpIHtcbiAgICBsaW5lLmF0dHIoXCJtYXJrZXItc3RhcnRcIiwgXCJ1cmwoXCIgKyB1cmwgKyBcIiNcIiArIGRpYWdyYW1JZCArIFwiLXNvbGlkVG9wQXJyb3dIZWFkKVwiKTtcbiAgfVxuICBpZiAodHlwZSA9PT0gZGlhZ09iai5kYi5MSU5FVFlQRS5TVElDS19BUlJPV19UT1BfUkVWRVJTRSB8fCB0eXBlID09PSBkaWFnT2JqLmRiLkxJTkVUWVBFLlNUSUNLX0FSUk9XX1RPUF9SRVZFUlNFX0RPVFRFRCkge1xuICAgIGxpbmUuYXR0cihcIm1hcmtlci1zdGFydFwiLCBcInVybChcIiArIHVybCArIFwiI1wiICsgZGlhZ3JhbUlkICsgXCItc3RpY2tCb3R0b21BcnJvd0hlYWQpXCIpO1xuICB9XG4gIGlmICh0eXBlID09PSBkaWFnT2JqLmRiLkxJTkVUWVBFLlNUSUNLX0FSUk9XX0JPVFRPTV9SRVZFUlNFIHx8IHR5cGUgPT09IGRpYWdPYmouZGIuTElORVRZUEUuU1RJQ0tfQVJST1dfQk9UVE9NX1JFVkVSU0VfRE9UVEVEKSB7XG4gICAgbGluZS5hdHRyKFwibWFya2VyLXN0YXJ0XCIsIFwidXJsKFwiICsgdXJsICsgXCIjXCIgKyBkaWFncmFtSWQgKyBcIi1zdGlja1RvcEFycm93SGVhZClcIik7XG4gIH1cbiAgaWYgKHR5cGUgPT09IGRpYWdPYmouZGIuTElORVRZUEUuU09MSUQgfHwgdHlwZSA9PT0gZGlhZ09iai5kYi5MSU5FVFlQRS5ET1RURUQpIHtcbiAgICBsaW5lLmF0dHIoXCJtYXJrZXItZW5kXCIsIFwidXJsKFwiICsgdXJsICsgXCIjXCIgKyBkaWFncmFtSWQgKyBcIi1hcnJvd2hlYWQpXCIpO1xuICB9XG4gIGlmICh0eXBlID09PSBkaWFnT2JqLmRiLkxJTkVUWVBFLkJJRElSRUNUSU9OQUxfU09MSUQgfHwgdHlwZSA9PT0gZGlhZ09iai5kYi5MSU5FVFlQRS5CSURJUkVDVElPTkFMX0RPVFRFRCkge1xuICAgIGxpbmUuYXR0cihcIm1hcmtlci1zdGFydFwiLCBcInVybChcIiArIHVybCArIFwiI1wiICsgZGlhZ3JhbUlkICsgXCItYXJyb3doZWFkKVwiKTtcbiAgICBsaW5lLmF0dHIoXCJtYXJrZXItZW5kXCIsIFwidXJsKFwiICsgdXJsICsgXCIjXCIgKyBkaWFncmFtSWQgKyBcIi1hcnJvd2hlYWQpXCIpO1xuICB9XG4gIGlmICh0eXBlID09PSBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElEX1BPSU5UIHx8IHR5cGUgPT09IGRpYWdPYmouZGIuTElORVRZUEUuRE9UVEVEX1BPSU5UKSB7XG4gICAgbGluZS5hdHRyKFwibWFya2VyLWVuZFwiLCBcInVybChcIiArIHVybCArIFwiI1wiICsgZGlhZ3JhbUlkICsgXCItZmlsbGVkLWhlYWQpXCIpO1xuICB9XG4gIGlmICh0eXBlID09PSBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElEX0NST1NTIHx8IHR5cGUgPT09IGRpYWdPYmouZGIuTElORVRZUEUuRE9UVEVEX0NST1NTKSB7XG4gICAgbGluZS5hdHRyKFwibWFya2VyLWVuZFwiLCBcInVybChcIiArIHVybCArIFwiI1wiICsgZGlhZ3JhbUlkICsgXCItY3Jvc3NoZWFkKVwiKTtcbiAgfVxuICBpZiAoc2VxdWVuY2VWaXNpYmxlIHx8IGNvbmYuc2hvd1NlcXVlbmNlTnVtYmVycykge1xuICAgIGNvbnN0IGlzQmlkaXJlY3Rpb25hbCA9IHR5cGUgPT09IGRpYWdPYmouZGIuTElORVRZUEUuQklESVJFQ1RJT05BTF9TT0xJRCB8fCB0eXBlID09PSBkaWFnT2JqLmRiLkxJTkVUWVBFLkJJRElSRUNUSU9OQUxfRE9UVEVEO1xuICAgIGNvbnN0IGlzUmV2ZXJzZUFycm93VHlwZTIgPSB0eXBlID09PSBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElEX0FSUk9XX1RPUF9SRVZFUlNFIHx8IHR5cGUgPT09IGRpYWdPYmouZGIuTElORVRZUEUuU09MSURfQVJST1dfVE9QX1JFVkVSU0VfRE9UVEVEIHx8IHR5cGUgPT09IGRpYWdPYmouZGIuTElORVRZUEUuU09MSURfQVJST1dfQk9UVE9NX1JFVkVSU0UgfHwgdHlwZSA9PT0gZGlhZ09iai5kYi5MSU5FVFlQRS5TT0xJRF9BUlJPV19CT1RUT01fUkVWRVJTRV9ET1RURUQgfHwgdHlwZSA9PT0gZGlhZ09iai5kYi5MSU5FVFlQRS5TVElDS19BUlJPV19UT1BfUkVWRVJTRSB8fCB0eXBlID09PSBkaWFnT2JqLmRiLkxJTkVUWVBFLlNUSUNLX0FSUk9XX1RPUF9SRVZFUlNFX0RPVFRFRCB8fCB0eXBlID09PSBkaWFnT2JqLmRiLkxJTkVUWVBFLlNUSUNLX0FSUk9XX0JPVFRPTV9SRVZFUlNFIHx8IHR5cGUgPT09IGRpYWdPYmouZGIuTElORVRZUEUuU1RJQ0tfQVJST1dfQk9UVE9NX1JFVkVSU0VfRE9UVEVEO1xuICAgIGNvbnN0IFNFUVVFTkNFX05VTUJFUl9SQURJVVMgPSA2O1xuICAgIGNvbnN0IGhhc0NlbnRyYWxDb25uID0gaGFzQ2VudHJhbENvbm5lY3Rpb24obXNnLCBkaWFnT2JqKTtcbiAgICBsZXQgbGluZVN0YXJ0WCA9IHN0YXJ0eDtcbiAgICBsZXQgbGluZVN0b3BYID0gc3RvcHg7XG4gICAgaWYgKGlzQmlkaXJlY3Rpb25hbCkge1xuICAgICAgaWYgKHN0YXJ0eCA8IHN0b3B4KSB7XG4gICAgICAgIGxpbmVTdGFydFggPSBzdGFydHggKyBTRVFVRU5DRV9OVU1CRVJfUkFESVVTICogMjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpbmVTdGFydFggPSBzdGFydHggLSBTRVFVRU5DRV9OVU1CRVJfUkFESVVTICsgKGhhc0NlbnRyYWxDb25uID8gLTUgOiAwKTtcbiAgICAgICAgbGluZVN0YXJ0WCArPSBtc2c/LmNlbnRyYWxDb25uZWN0aW9uID09PSBkaWFnT2JqLmRiLkxJTkVUWVBFLkNFTlRSQUxfQ09OTkVDVElPTl9EVUFMIHx8IG1zZz8uY2VudHJhbENvbm5lY3Rpb24gPT09IGRpYWdPYmouZGIuTElORVRZUEUuQ0VOVFJBTF9DT05ORUNUSU9OX1JFVkVSU0UgPyAtNy41IDogMDtcbiAgICAgIH1cbiAgICAgIGxpbmUuYXR0cihcIngxXCIsIGxpbmVTdGFydFgpO1xuICAgIH0gZWxzZSBpZiAoaXNSZXZlcnNlQXJyb3dUeXBlMikge1xuICAgICAgaWYgKHN0b3B4ID4gc3RhcnR4KSB7XG4gICAgICAgIGxpbmVTdG9wWCA9IHN0b3B4IC0gMiAqIFNFUVVFTkNFX05VTUJFUl9SQURJVVM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaW5lU3RvcFggPSBzdG9weCAtIFNFUVVFTkNFX05VTUJFUl9SQURJVVM7XG4gICAgICAgIGxpbmVTdGFydFggKz0gbXNnPy5jZW50cmFsQ29ubmVjdGlvbiA9PT0gZGlhZ09iai5kYi5MSU5FVFlQRS5DRU5UUkFMX0NPTk5FQ1RJT05fRFVBTCB8fCBtc2c/LmNlbnRyYWxDb25uZWN0aW9uID09PSBkaWFnT2JqLmRiLkxJTkVUWVBFLkNFTlRSQUxfQ09OTkVDVElPTl9SRVZFUlNFID8gLTcuNSA6IDA7XG4gICAgICB9XG4gICAgICBsaW5lU3RvcFggKz0gaGFzQ2VudHJhbENvbm4gPyAxNSA6IDA7XG4gICAgICBsaW5lLmF0dHIoXCJ4MlwiLCBsaW5lU3RvcFgpO1xuICAgICAgbGluZS5hdHRyKFwieDFcIiwgbGluZVN0YXJ0WCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpbmUuYXR0cihcIngxXCIsIHN0YXJ0eCArIFNFUVVFTkNFX05VTUJFUl9SQURJVVMpO1xuICAgIH1cbiAgICBsZXQgYXV0b251bWJlclggPSAwO1xuICAgIGNvbnN0IGlzU2VsZk1lc3NhZ2UgPSBzdGFydHggPT09IHN0b3B4O1xuICAgIGNvbnN0IGlzTGVmdFRvUmlnaHQgPSBzdGFydHggPD0gc3RvcHg7XG4gICAgaWYgKGlzU2VsZk1lc3NhZ2UpIHtcbiAgICAgIGF1dG9udW1iZXJYID0gbXNnTW9kZWwuZnJvbUJvdW5kcyArIDE7XG4gICAgfSBlbHNlIGlmIChpc1JldmVyc2VBcnJvd1R5cGUyKSB7XG4gICAgICBhdXRvbnVtYmVyWCA9IGlzTGVmdFRvUmlnaHQgPyBtc2dNb2RlbC50b0JvdW5kcyAtIDEgOiBtc2dNb2RlbC5mcm9tQm91bmRzICsgMTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXV0b251bWJlclggPSBpc0xlZnRUb1JpZ2h0ID8gbXNnTW9kZWwuZnJvbUJvdW5kcyArIDEgOiBtc2dNb2RlbC50b0JvdW5kcyAtIDE7XG4gICAgfVxuICAgIGxldCBmb250U2l6ZSA9IFwiMTJweFwiO1xuICAgIGNvbnN0IHNlcXVlbmNlSW5kZXhMZW5ndGggPSBzZXF1ZW5jZUluZGV4LnRvU3RyaW5nKCkubGVuZ3RoO1xuICAgIGlmIChzZXF1ZW5jZUluZGV4TGVuZ3RoID4gNSkge1xuICAgICAgZm9udFNpemUgPSBcIjdweFwiO1xuICAgIH0gZWxzZSBpZiAoc2VxdWVuY2VJbmRleExlbmd0aCA+IDMpIHtcbiAgICAgIGZvbnRTaXplID0gXCI5cHhcIjtcbiAgICB9XG4gICAgZGlhZ3JhbTIuYXBwZW5kKFwibGluZVwiKS5hdHRyKFwieDFcIiwgYXV0b251bWJlclgpLmF0dHIoXCJ5MVwiLCBsaW5lU3RhcnRZKS5hdHRyKFwieDJcIiwgYXV0b251bWJlclgpLmF0dHIoXCJ5MlwiLCBsaW5lU3RhcnRZKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDApLmF0dHIoXCJtYXJrZXItc3RhcnRcIiwgXCJ1cmwoXCIgKyB1cmwgKyBcIiNcIiArIGRpYWdyYW1JZCArIFwiLXNlcXVlbmNlbnVtYmVyKVwiKTtcbiAgICBkaWFncmFtMi5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJ4XCIsIGF1dG9udW1iZXJYKS5hdHRyKFwieVwiLCBsaW5lU3RhcnRZICsgNCkuYXR0cihcImZvbnQtZmFtaWx5XCIsIFwic2Fucy1zZXJpZlwiKS5hdHRyKFwiZm9udC1zaXplXCIsIGZvbnRTaXplKS5hdHRyKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIikuYXR0cihcImNsYXNzXCIsIFwic2VxdWVuY2VOdW1iZXJcIikudGV4dChzZXF1ZW5jZUluZGV4KTtcbiAgfVxufSwgXCJkcmF3TWVzc2FnZVwiKTtcbnZhciBhZGRBY3RvclJlbmRlcmluZ0RhdGEgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGRpYWdyYW0yLCBhY3RvcnMsIGNyZWF0ZWRBY3RvcnMsIGFjdG9yS2V5cywgdmVydGljYWxQb3MsIG1lc3NhZ2VzLCBpc0Zvb3Rlcikge1xuICBsZXQgcHJldldpZHRoID0gMDtcbiAgbGV0IHByZXZNYXJnaW4gPSAwO1xuICBsZXQgcHJldkJveCA9IHZvaWQgMDtcbiAgbGV0IG1heEhlaWdodCA9IDA7XG4gIGZvciAoY29uc3QgYWN0b3JLZXkgb2YgYWN0b3JLZXlzKSB7XG4gICAgY29uc3QgYWN0b3IgPSBhY3RvcnMuZ2V0KGFjdG9yS2V5KTtcbiAgICBjb25zdCBib3ggPSBhY3Rvci5ib3g7XG4gICAgaWYgKHByZXZCb3ggJiYgcHJldkJveCAhPSBib3gpIHtcbiAgICAgIGlmICghaXNGb290ZXIpIHtcbiAgICAgICAgYm91bmRzLm1vZGVscy5hZGRCb3gocHJldkJveCk7XG4gICAgICB9XG4gICAgICBwcmV2TWFyZ2luICs9IGNvbmYuYm94TWFyZ2luICsgcHJldkJveC5tYXJnaW47XG4gICAgfVxuICAgIGlmIChib3ggJiYgYm94ICE9IHByZXZCb3gpIHtcbiAgICAgIGlmICghaXNGb290ZXIpIHtcbiAgICAgICAgYm94LnggPSBwcmV2V2lkdGggKyBwcmV2TWFyZ2luO1xuICAgICAgICBib3gueSA9IHZlcnRpY2FsUG9zO1xuICAgICAgfVxuICAgICAgcHJldk1hcmdpbiArPSBib3gubWFyZ2luO1xuICAgIH1cbiAgICBhY3Rvci53aWR0aCA9IGNvbW1vbl9kZWZhdWx0LmdldE1heChhY3Rvci53aWR0aCB8fCBjb25mLndpZHRoLCBjb25mLndpZHRoKTtcbiAgICBhY3Rvci5oZWlnaHQgPSBjb21tb25fZGVmYXVsdC5nZXRNYXgoYWN0b3IuaGVpZ2h0IHx8IGNvbmYuaGVpZ2h0LCBjb25mLmhlaWdodCk7XG4gICAgYWN0b3IubWFyZ2luID0gYWN0b3IubWFyZ2luIHx8IGNvbmYuYWN0b3JNYXJnaW47XG4gICAgbWF4SGVpZ2h0ID0gY29tbW9uX2RlZmF1bHQuZ2V0TWF4KG1heEhlaWdodCwgYWN0b3IuaGVpZ2h0KTtcbiAgICBpZiAoY3JlYXRlZEFjdG9ycy5nZXQoYWN0b3IubmFtZSkpIHtcbiAgICAgIHByZXZNYXJnaW4gKz0gYWN0b3Iud2lkdGggLyAyO1xuICAgIH1cbiAgICBhY3Rvci54ID0gcHJldldpZHRoICsgcHJldk1hcmdpbjtcbiAgICBhY3Rvci5zdGFydHkgPSBib3VuZHMuZ2V0VmVydGljYWxQb3MoKTtcbiAgICBib3VuZHMuaW5zZXJ0KGFjdG9yLngsIHZlcnRpY2FsUG9zLCBhY3Rvci54ICsgYWN0b3Iud2lkdGgsIGFjdG9yLmhlaWdodCk7XG4gICAgcHJldldpZHRoICs9IGFjdG9yLndpZHRoICsgcHJldk1hcmdpbjtcbiAgICBpZiAoYWN0b3IuYm94KSB7XG4gICAgICBhY3Rvci5ib3gud2lkdGggPSBwcmV2V2lkdGggKyBib3gubWFyZ2luIC0gYWN0b3IuYm94Lng7XG4gICAgfVxuICAgIHByZXZNYXJnaW4gPSBhY3Rvci5tYXJnaW47XG4gICAgcHJldkJveCA9IGFjdG9yLmJveDtcbiAgICBib3VuZHMubW9kZWxzLmFkZEFjdG9yKGFjdG9yKTtcbiAgfVxuICBpZiAocHJldkJveCAmJiAhaXNGb290ZXIpIHtcbiAgICBib3VuZHMubW9kZWxzLmFkZEJveChwcmV2Qm94KTtcbiAgfVxuICBib3VuZHMuYnVtcFZlcnRpY2FsUG9zKG1heEhlaWdodCk7XG59LCBcImFkZEFjdG9yUmVuZGVyaW5nRGF0YVwiKTtcbnZhciBkcmF3QWN0b3JzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyBmdW5jdGlvbihkaWFncmFtMiwgYWN0b3JzLCBhY3RvcktleXMsIGlzRm9vdGVyLCBkaWFncmFtSWQsIGRpYWdPYmosIGFjdG9ySW5kZXhNYXApIHtcbiAgaWYgKCFpc0Zvb3Rlcikge1xuICAgIGZvciAoY29uc3QgYWN0b3JLZXkgb2YgYWN0b3JLZXlzKSB7XG4gICAgICBjb25zdCBhY3RvciA9IGFjdG9ycy5nZXQoYWN0b3JLZXkpO1xuICAgICAgYXdhaXQgc3ZnRHJhd19kZWZhdWx0LmRyYXdBY3RvcihkaWFncmFtMiwgYWN0b3IsIGNvbmYsIGZhbHNlLCBkaWFncmFtSWQsIGRpYWdPYmosIGFjdG9ySW5kZXhNYXApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsZXQgbWF4SGVpZ2h0ID0gMDtcbiAgICBib3VuZHMuYnVtcFZlcnRpY2FsUG9zKGNvbmYuYm94TWFyZ2luICogMik7XG4gICAgZm9yIChjb25zdCBhY3RvcktleSBvZiBhY3RvcktleXMpIHtcbiAgICAgIGNvbnN0IGFjdG9yID0gYWN0b3JzLmdldChhY3RvcktleSk7XG4gICAgICBpZiAoIWFjdG9yLnN0b3B5KSB7XG4gICAgICAgIGFjdG9yLnN0b3B5ID0gYm91bmRzLmdldFZlcnRpY2FsUG9zKCk7XG4gICAgICB9XG4gICAgICBjb25zdCBoZWlnaHQgPSBhd2FpdCBzdmdEcmF3X2RlZmF1bHQuZHJhd0FjdG9yKFxuICAgICAgICBkaWFncmFtMixcbiAgICAgICAgYWN0b3IsXG4gICAgICAgIGNvbmYsXG4gICAgICAgIHRydWUsXG4gICAgICAgIGRpYWdyYW1JZCxcbiAgICAgICAgZGlhZ09iaixcbiAgICAgICAgYWN0b3JJbmRleE1hcFxuICAgICAgKTtcbiAgICAgIG1heEhlaWdodCA9IGNvbW1vbl9kZWZhdWx0LmdldE1heChtYXhIZWlnaHQsIGhlaWdodCk7XG4gICAgfVxuICAgIGJvdW5kcy5idW1wVmVydGljYWxQb3MobWF4SGVpZ2h0ICsgY29uZi5ib3hNYXJnaW4pO1xuICB9XG59LCBcImRyYXdBY3RvcnNcIik7XG52YXIgZHJhd0FjdG9yc1BvcHVwID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihkaWFncmFtMiwgYWN0b3JzLCBhY3RvcktleXMsIGRvYykge1xuICBsZXQgbWF4SGVpZ2h0ID0gMDtcbiAgbGV0IG1heFdpZHRoID0gMDtcbiAgZm9yIChjb25zdCBhY3RvcktleSBvZiBhY3RvcktleXMpIHtcbiAgICBjb25zdCBhY3RvciA9IGFjdG9ycy5nZXQoYWN0b3JLZXkpO1xuICAgIGNvbnN0IG1pbk1lbnVXaWR0aCA9IGdldFJlcXVpcmVkUG9wdXBXaWR0aChhY3Rvcik7XG4gICAgY29uc3QgbWVudURpbWVuc2lvbnMgPSBzdmdEcmF3X2RlZmF1bHQuZHJhd1BvcHVwKFxuICAgICAgZGlhZ3JhbTIsXG4gICAgICBhY3RvcixcbiAgICAgIG1pbk1lbnVXaWR0aCxcbiAgICAgIGNvbmYsXG4gICAgICBjb25mLmZvcmNlTWVudXMsXG4gICAgICBkb2NcbiAgICApO1xuICAgIGlmIChtZW51RGltZW5zaW9ucy5oZWlnaHQgPiBtYXhIZWlnaHQpIHtcbiAgICAgIG1heEhlaWdodCA9IG1lbnVEaW1lbnNpb25zLmhlaWdodDtcbiAgICB9XG4gICAgaWYgKG1lbnVEaW1lbnNpb25zLndpZHRoICsgYWN0b3IueCA+IG1heFdpZHRoKSB7XG4gICAgICBtYXhXaWR0aCA9IG1lbnVEaW1lbnNpb25zLndpZHRoICsgYWN0b3IueDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHsgbWF4SGVpZ2h0LCBtYXhXaWR0aCB9O1xufSwgXCJkcmF3QWN0b3JzUG9wdXBcIik7XG52YXIgc2V0Q29uZiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oY25mKSB7XG4gIGFzc2lnbldpdGhEZXB0aF9kZWZhdWx0KGNvbmYsIGNuZik7XG4gIGlmIChjbmYuZm9udEZhbWlseSkge1xuICAgIGNvbmYuYWN0b3JGb250RmFtaWx5ID0gY29uZi5ub3RlRm9udEZhbWlseSA9IGNvbmYubWVzc2FnZUZvbnRGYW1pbHkgPSBjbmYuZm9udEZhbWlseTtcbiAgfVxuICBpZiAoY25mLmZvbnRTaXplKSB7XG4gICAgY29uZi5hY3RvckZvbnRTaXplID0gY29uZi5ub3RlRm9udFNpemUgPSBjb25mLm1lc3NhZ2VGb250U2l6ZSA9IGNuZi5mb250U2l6ZTtcbiAgfVxuICBpZiAoY25mLmZvbnRXZWlnaHQpIHtcbiAgICBjb25mLmFjdG9yRm9udFdlaWdodCA9IGNvbmYubm90ZUZvbnRXZWlnaHQgPSBjb25mLm1lc3NhZ2VGb250V2VpZ2h0ID0gY25mLmZvbnRXZWlnaHQ7XG4gIH1cbn0sIFwic2V0Q29uZlwiKTtcbnZhciBhY3RvckFjdGl2YXRpb25zID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihhY3Rvcikge1xuICByZXR1cm4gYm91bmRzLmFjdGl2YXRpb25zLmZpbHRlcihmdW5jdGlvbihhY3RpdmF0aW9uKSB7XG4gICAgcmV0dXJuIGFjdGl2YXRpb24uYWN0b3IgPT09IGFjdG9yO1xuICB9KTtcbn0sIFwiYWN0b3JBY3RpdmF0aW9uc1wiKTtcbnZhciBhY3RpdmF0aW9uQm91bmRzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihhY3RvciwgYWN0b3JzKSB7XG4gIGNvbnN0IGFjdG9yT2JqID0gYWN0b3JzLmdldChhY3Rvcik7XG4gIGNvbnN0IGFjdGl2YXRpb25zID0gYWN0b3JBY3RpdmF0aW9ucyhhY3Rvcik7XG4gIGNvbnN0IGxlZnQgPSBhY3RpdmF0aW9ucy5yZWR1Y2UoXG4gICAgZnVuY3Rpb24oYWNjLCBhY3RpdmF0aW9uKSB7XG4gICAgICByZXR1cm4gY29tbW9uX2RlZmF1bHQuZ2V0TWluKGFjYywgYWN0aXZhdGlvbi5zdGFydHgpO1xuICAgIH0sXG4gICAgYWN0b3JPYmoueCArIGFjdG9yT2JqLndpZHRoIC8gMiAtIDFcbiAgKTtcbiAgY29uc3QgcmlnaHQgPSBhY3RpdmF0aW9ucy5yZWR1Y2UoXG4gICAgZnVuY3Rpb24oYWNjLCBhY3RpdmF0aW9uKSB7XG4gICAgICByZXR1cm4gY29tbW9uX2RlZmF1bHQuZ2V0TWF4KGFjYywgYWN0aXZhdGlvbi5zdG9weCk7XG4gICAgfSxcbiAgICBhY3Rvck9iai54ICsgYWN0b3JPYmoud2lkdGggLyAyICsgMVxuICApO1xuICByZXR1cm4gW2xlZnQsIHJpZ2h0XTtcbn0sIFwiYWN0aXZhdGlvbkJvdW5kc1wiKTtcbmZ1bmN0aW9uIGFkanVzdExvb3BIZWlnaHRGb3JXcmFwKGxvb3BXaWR0aHMsIG1zZywgcHJlTWFyZ2luLCBwb3N0TWFyZ2luLCBhZGRMb29wRm4pIHtcbiAgYm91bmRzLmJ1bXBWZXJ0aWNhbFBvcyhwcmVNYXJnaW4pO1xuICBsZXQgaGVpZ2h0QWRqdXN0ID0gcG9zdE1hcmdpbjtcbiAgaWYgKG1zZy5pZCAmJiBtc2cubWVzc2FnZSAmJiBsb29wV2lkdGhzW21zZy5pZF0pIHtcbiAgICBjb25zdCBsb29wV2lkdGggPSBsb29wV2lkdGhzW21zZy5pZF0ud2lkdGg7XG4gICAgY29uc3QgdGV4dENvbmYgPSBtZXNzYWdlRm9udChjb25mKTtcbiAgICBtc2cubWVzc2FnZSA9IHV0aWxzX2RlZmF1bHQud3JhcExhYmVsKGBbJHttc2cubWVzc2FnZX1dYCwgbG9vcFdpZHRoIC0gMiAqIGNvbmYud3JhcFBhZGRpbmcsIHRleHRDb25mKTtcbiAgICBtc2cud2lkdGggPSBsb29wV2lkdGg7XG4gICAgbXNnLndyYXAgPSB0cnVlO1xuICAgIGNvbnN0IHRleHREaW1zID0gdXRpbHNfZGVmYXVsdC5jYWxjdWxhdGVUZXh0RGltZW5zaW9ucyhtc2cubWVzc2FnZSwgdGV4dENvbmYpO1xuICAgIGNvbnN0IHRvdGFsT2Zmc2V0ID0gY29tbW9uX2RlZmF1bHQuZ2V0TWF4KHRleHREaW1zLmhlaWdodCwgY29uZi5sYWJlbEJveEhlaWdodCk7XG4gICAgaGVpZ2h0QWRqdXN0ID0gcG9zdE1hcmdpbiArIHRvdGFsT2Zmc2V0O1xuICAgIGxvZy5kZWJ1ZyhgJHt0b3RhbE9mZnNldH0gLSAke21zZy5tZXNzYWdlfWApO1xuICB9XG4gIGFkZExvb3BGbihtc2cpO1xuICBib3VuZHMuYnVtcFZlcnRpY2FsUG9zKGhlaWdodEFkanVzdCk7XG59XG5fX25hbWUoYWRqdXN0TG9vcEhlaWdodEZvcldyYXAsIFwiYWRqdXN0TG9vcEhlaWdodEZvcldyYXBcIik7XG5mdW5jdGlvbiBhZGp1c3RDcmVhdGVkRGVzdHJveWVkRGF0YShtc2csIG1zZ01vZGVsLCBsaW5lU3RhcnRZLCBpbmRleCwgYWN0b3JzLCBjcmVhdGVkQWN0b3JzLCBkZXN0cm95ZWRBY3RvcnMpIHtcbiAgZnVuY3Rpb24gcmVjZWl2ZXJBZGp1c3RtZW50KGFjdG9yLCBhZGp1c3RtZW50KSB7XG4gICAgaWYgKGFjdG9yLnggPCBhY3RvcnMuZ2V0KG1zZy5mcm9tKS54KSB7XG4gICAgICBib3VuZHMuaW5zZXJ0KFxuICAgICAgICBtc2dNb2RlbC5zdG9weCAtIGFkanVzdG1lbnQsXG4gICAgICAgIG1zZ01vZGVsLnN0YXJ0eSxcbiAgICAgICAgbXNnTW9kZWwuc3RhcnR4LFxuICAgICAgICBtc2dNb2RlbC5zdG9weSArIGFjdG9yLmhlaWdodCAvIDIgKyBjb25mLm5vdGVNYXJnaW5cbiAgICAgICk7XG4gICAgICBtc2dNb2RlbC5zdG9weCA9IG1zZ01vZGVsLnN0b3B4ICsgYWRqdXN0bWVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgYm91bmRzLmluc2VydChcbiAgICAgICAgbXNnTW9kZWwuc3RhcnR4LFxuICAgICAgICBtc2dNb2RlbC5zdGFydHksXG4gICAgICAgIG1zZ01vZGVsLnN0b3B4ICsgYWRqdXN0bWVudCxcbiAgICAgICAgbXNnTW9kZWwuc3RvcHkgKyBhY3Rvci5oZWlnaHQgLyAyICsgY29uZi5ub3RlTWFyZ2luXG4gICAgICApO1xuICAgICAgbXNnTW9kZWwuc3RvcHggPSBtc2dNb2RlbC5zdG9weCAtIGFkanVzdG1lbnQ7XG4gICAgfVxuICB9XG4gIF9fbmFtZShyZWNlaXZlckFkanVzdG1lbnQsIFwicmVjZWl2ZXJBZGp1c3RtZW50XCIpO1xuICBmdW5jdGlvbiBzZW5kZXJBZGp1c3RtZW50KGFjdG9yLCBhZGp1c3RtZW50KSB7XG4gICAgaWYgKGFjdG9yLnggPCBhY3RvcnMuZ2V0KG1zZy50bykueCkge1xuICAgICAgYm91bmRzLmluc2VydChcbiAgICAgICAgbXNnTW9kZWwuc3RhcnR4IC0gYWRqdXN0bWVudCxcbiAgICAgICAgbXNnTW9kZWwuc3RhcnR5LFxuICAgICAgICBtc2dNb2RlbC5zdG9weCxcbiAgICAgICAgbXNnTW9kZWwuc3RvcHkgKyBhY3Rvci5oZWlnaHQgLyAyICsgY29uZi5ub3RlTWFyZ2luXG4gICAgICApO1xuICAgICAgbXNnTW9kZWwuc3RhcnR4ID0gbXNnTW9kZWwuc3RhcnR4ICsgYWRqdXN0bWVudDtcbiAgICB9IGVsc2Uge1xuICAgICAgYm91bmRzLmluc2VydChcbiAgICAgICAgbXNnTW9kZWwuc3RvcHgsXG4gICAgICAgIG1zZ01vZGVsLnN0YXJ0eSxcbiAgICAgICAgbXNnTW9kZWwuc3RhcnR4ICsgYWRqdXN0bWVudCxcbiAgICAgICAgbXNnTW9kZWwuc3RvcHkgKyBhY3Rvci5oZWlnaHQgLyAyICsgY29uZi5ub3RlTWFyZ2luXG4gICAgICApO1xuICAgICAgbXNnTW9kZWwuc3RhcnR4ID0gbXNnTW9kZWwuc3RhcnR4IC0gYWRqdXN0bWVudDtcbiAgICB9XG4gIH1cbiAgX19uYW1lKHNlbmRlckFkanVzdG1lbnQsIFwic2VuZGVyQWRqdXN0bWVudFwiKTtcbiAgY29uc3QgYWN0b3JBcnJheSA9IFtcbiAgICBQQVJUSUNJUEFOVF9UWVBFLkFDVE9SLFxuICAgIFBBUlRJQ0lQQU5UX1RZUEUuQ09OVFJPTCxcbiAgICBQQVJUSUNJUEFOVF9UWVBFLkVOVElUWSxcbiAgICBQQVJUSUNJUEFOVF9UWVBFLkRBVEFCQVNFXG4gIF07XG4gIGlmIChjcmVhdGVkQWN0b3JzLmdldChtc2cudG8pID09IGluZGV4KSB7XG4gICAgY29uc3QgYWN0b3IgPSBhY3RvcnMuZ2V0KG1zZy50byk7XG4gICAgY29uc3QgYWRqdXN0bWVudCA9IGFjdG9yQXJyYXkuaW5jbHVkZXMoYWN0b3IudHlwZSkgPyBBQ1RPUl9UWVBFX1dJRFRIIC8gMiArIDMgOiBhY3Rvci53aWR0aCAvIDIgKyAzO1xuICAgIHJlY2VpdmVyQWRqdXN0bWVudChhY3RvciwgYWRqdXN0bWVudCk7XG4gICAgYWN0b3Iuc3RhcnR5ID0gbGluZVN0YXJ0WSAtIGFjdG9yLmhlaWdodCAvIDI7XG4gICAgYm91bmRzLmJ1bXBWZXJ0aWNhbFBvcyhhY3Rvci5oZWlnaHQgLyAyKTtcbiAgfSBlbHNlIGlmIChkZXN0cm95ZWRBY3RvcnMuZ2V0KG1zZy5mcm9tKSA9PSBpbmRleCkge1xuICAgIGNvbnN0IGFjdG9yID0gYWN0b3JzLmdldChtc2cuZnJvbSk7XG4gICAgaWYgKGNvbmYubWlycm9yQWN0b3JzKSB7XG4gICAgICBjb25zdCBhZGp1c3RtZW50ID0gYWN0b3JBcnJheS5pbmNsdWRlcyhhY3Rvci50eXBlKSA/IEFDVE9SX1RZUEVfV0lEVEggLyAyIDogYWN0b3Iud2lkdGggLyAyO1xuICAgICAgc2VuZGVyQWRqdXN0bWVudChhY3RvciwgYWRqdXN0bWVudCk7XG4gICAgfVxuICAgIGFjdG9yLnN0b3B5ID0gbGluZVN0YXJ0WSAtIGFjdG9yLmhlaWdodCAvIDI7XG4gICAgYm91bmRzLmJ1bXBWZXJ0aWNhbFBvcyhhY3Rvci5oZWlnaHQgLyAyKTtcbiAgfSBlbHNlIGlmIChkZXN0cm95ZWRBY3RvcnMuZ2V0KG1zZy50bykgPT0gaW5kZXgpIHtcbiAgICBjb25zdCBhY3RvciA9IGFjdG9ycy5nZXQobXNnLnRvKTtcbiAgICBpZiAoY29uZi5taXJyb3JBY3RvcnMpIHtcbiAgICAgIGNvbnN0IGFkanVzdG1lbnQgPSBhY3RvckFycmF5LmluY2x1ZGVzKGFjdG9yLnR5cGUpID8gQUNUT1JfVFlQRV9XSURUSCAvIDIgKyAzIDogYWN0b3Iud2lkdGggLyAyICsgMztcbiAgICAgIHJlY2VpdmVyQWRqdXN0bWVudChhY3RvciwgYWRqdXN0bWVudCk7XG4gICAgfVxuICAgIGFjdG9yLnN0b3B5ID0gbGluZVN0YXJ0WSAtIGFjdG9yLmhlaWdodCAvIDI7XG4gICAgYm91bmRzLmJ1bXBWZXJ0aWNhbFBvcyhhY3Rvci5oZWlnaHQgLyAyKTtcbiAgfVxufVxuX19uYW1lKGFkanVzdENyZWF0ZWREZXN0cm95ZWREYXRhLCBcImFkanVzdENyZWF0ZWREZXN0cm95ZWREYXRhXCIpO1xudmFyIGRyYXcgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGFzeW5jIGZ1bmN0aW9uKF90ZXh0LCBpZCwgX3ZlcnNpb24sIGRpYWdPYmopIHtcbiAgY29uc3QgeyBzZWN1cml0eUxldmVsLCBzZXF1ZW5jZSwgbG9vayB9ID0gZ2V0Q29uZmlnMigpO1xuICBjb25mID0gc2VxdWVuY2U7XG4gIGxldCBzYW5kYm94RWxlbWVudDtcbiAgaWYgKHNlY3VyaXR5TGV2ZWwgPT09IFwic2FuZGJveFwiKSB7XG4gICAgc2FuZGJveEVsZW1lbnQgPSBzZWxlY3QoXCIjaVwiICsgaWQpO1xuICB9XG4gIGNvbnN0IHJvb3QgPSBzZWN1cml0eUxldmVsID09PSBcInNhbmRib3hcIiA/IHNlbGVjdChzYW5kYm94RWxlbWVudC5ub2RlcygpWzBdLmNvbnRlbnREb2N1bWVudC5ib2R5KSA6IHNlbGVjdChcImJvZHlcIik7XG4gIGNvbnN0IGRvYyA9IHNlY3VyaXR5TGV2ZWwgPT09IFwic2FuZGJveFwiID8gc2FuZGJveEVsZW1lbnQubm9kZXMoKVswXS5jb250ZW50RG9jdW1lbnQgOiBkb2N1bWVudDtcbiAgYm91bmRzLmluaXQoKTtcbiAgbG9nLmRlYnVnKGRpYWdPYmouZGIpO1xuICBjb25zdCBkaWFncmFtMiA9IHNlY3VyaXR5TGV2ZWwgPT09IFwic2FuZGJveFwiID8gcm9vdC5zZWxlY3QoYFtpZD1cIiR7aWR9XCJdYCkgOiBzZWxlY3QoYFtpZD1cIiR7aWR9XCJdYCk7XG4gIGNvbnN0IGFjdG9ycyA9IGRpYWdPYmouZGIuZ2V0QWN0b3JzKCk7XG4gIGNvbnN0IGNyZWF0ZWRBY3RvcnMgPSBkaWFnT2JqLmRiLmdldENyZWF0ZWRBY3RvcnMoKTtcbiAgY29uc3QgZGVzdHJveWVkQWN0b3JzID0gZGlhZ09iai5kYi5nZXREZXN0cm95ZWRBY3RvcnMoKTtcbiAgY29uc3QgYm94ZXMgPSBkaWFnT2JqLmRiLmdldEJveGVzKCk7XG4gIGxldCBhY3RvcktleXMgPSBkaWFnT2JqLmRiLmdldEFjdG9yS2V5cygpO1xuICBjb25zdCBtZXNzYWdlcyA9IGRpYWdPYmouZGIuZ2V0TWVzc2FnZXMoKTtcbiAgY29uc3QgdGl0bGUgPSBkaWFnT2JqLmRiLmdldERpYWdyYW1UaXRsZSgpO1xuICBjb25zdCBoYXNCb3hlcyA9IGRpYWdPYmouZGIuaGFzQXRMZWFzdE9uZUJveCgpO1xuICBjb25zdCBoYXNCb3hUaXRsZXMgPSBkaWFnT2JqLmRiLmhhc0F0TGVhc3RPbmVCb3hXaXRoVGl0bGUoKTtcbiAgY29uc3QgbWF4TWVzc2FnZVdpZHRoUGVyQWN0b3IgPSBhd2FpdCBnZXRNYXhNZXNzYWdlV2lkdGhQZXJBY3RvcihhY3RvcnMsIG1lc3NhZ2VzLCBkaWFnT2JqKTtcbiAgY29uZi5oZWlnaHQgPSBhd2FpdCBjYWxjdWxhdGVBY3Rvck1hcmdpbnMoYWN0b3JzLCBtYXhNZXNzYWdlV2lkdGhQZXJBY3RvciwgYm94ZXMpO1xuICBzdmdEcmF3X2RlZmF1bHQuaW5zZXJ0Q29tcHV0ZXJJY29uKGRpYWdyYW0yLCBpZCk7XG4gIHN2Z0RyYXdfZGVmYXVsdC5pbnNlcnREYXRhYmFzZUljb24oZGlhZ3JhbTIsIGlkKTtcbiAgc3ZnRHJhd19kZWZhdWx0Lmluc2VydENsb2NrSWNvbihkaWFncmFtMiwgaWQpO1xuICBpZiAoaGFzQm94ZXMpIHtcbiAgICBib3VuZHMuYnVtcFZlcnRpY2FsUG9zKGNvbmYuYm94TWFyZ2luKTtcbiAgICBpZiAoaGFzQm94VGl0bGVzKSB7XG4gICAgICBib3VuZHMuYnVtcFZlcnRpY2FsUG9zKGJveGVzWzBdLnRleHRNYXhIZWlnaHQpO1xuICAgIH1cbiAgfVxuICBpZiAoY29uZi5oaWRlVW51c2VkUGFydGljaXBhbnRzID09PSB0cnVlKSB7XG4gICAgY29uc3QgbmV3QWN0b3JzID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTtcbiAgICBtZXNzYWdlcy5mb3JFYWNoKChtZXNzYWdlKSA9PiB7XG4gICAgICBuZXdBY3RvcnMuYWRkKG1lc3NhZ2UuZnJvbSk7XG4gICAgICBuZXdBY3RvcnMuYWRkKG1lc3NhZ2UudG8pO1xuICAgIH0pO1xuICAgIGFjdG9yS2V5cyA9IGFjdG9yS2V5cy5maWx0ZXIoKGFjdG9yS2V5KSA9PiBuZXdBY3RvcnMuaGFzKGFjdG9yS2V5KSk7XG4gIH1cbiAgY29uc3QgYWN0b3JJbmRleE1hcCA9IG5ldyBNYXAoXG4gICAgYWN0b3JLZXlzLm1hcCgoYWN0b3JLZXksIGluZGV4MikgPT4gW2FjdG9ycy5nZXQoYWN0b3JLZXkpPy5uYW1lID8/IGFjdG9yS2V5LCBpbmRleDJdKVxuICApO1xuICBhZGRBY3RvclJlbmRlcmluZ0RhdGEoZGlhZ3JhbTIsIGFjdG9ycywgY3JlYXRlZEFjdG9ycywgYWN0b3JLZXlzLCAwLCBtZXNzYWdlcywgZmFsc2UpO1xuICBjb25zdCBsb29wV2lkdGhzID0gYXdhaXQgY2FsY3VsYXRlTG9vcEJvdW5kcyhtZXNzYWdlcywgYWN0b3JzLCBtYXhNZXNzYWdlV2lkdGhQZXJBY3RvciwgZGlhZ09iaik7XG4gIHN2Z0RyYXdfZGVmYXVsdC5pbnNlcnRBcnJvd0hlYWQoZGlhZ3JhbTIsIGlkKTtcbiAgc3ZnRHJhd19kZWZhdWx0Lmluc2VydEFycm93Q3Jvc3NIZWFkKGRpYWdyYW0yLCBpZCk7XG4gIHN2Z0RyYXdfZGVmYXVsdC5pbnNlcnRBcnJvd0ZpbGxlZEhlYWQoZGlhZ3JhbTIsIGlkKTtcbiAgc3ZnRHJhd19kZWZhdWx0Lmluc2VydFNlcXVlbmNlTnVtYmVyKGRpYWdyYW0yLCBpZCk7XG4gIHN2Z0RyYXdfZGVmYXVsdC5pbnNlcnRTb2xpZFRvcEFycm93SGVhZChkaWFncmFtMiwgaWQpO1xuICBzdmdEcmF3X2RlZmF1bHQuaW5zZXJ0U29saWRCb3R0b21BcnJvd0hlYWQoZGlhZ3JhbTIsIGlkKTtcbiAgc3ZnRHJhd19kZWZhdWx0Lmluc2VydFN0aWNrVG9wQXJyb3dIZWFkKGRpYWdyYW0yLCBpZCk7XG4gIHN2Z0RyYXdfZGVmYXVsdC5pbnNlcnRTdGlja0JvdHRvbUFycm93SGVhZChkaWFncmFtMiwgaWQpO1xuICBpZiAobG9vayA9PT0gXCJuZW9cIikge1xuICAgIHN2Z0RyYXdfZGVmYXVsdC5pbnNlcnREcm9wU2hhZG93KGRpYWdyYW0yLCBjb25mKTtcbiAgfVxuICBmdW5jdGlvbiBhY3RpdmVFbmQobXNnLCB2ZXJ0aWNhbFBvcykge1xuICAgIGNvbnN0IGFjdGl2YXRpb25EYXRhID0gYm91bmRzLmVuZEFjdGl2YXRpb24obXNnKTtcbiAgICBpZiAoYWN0aXZhdGlvbkRhdGEuc3RhcnR5ICsgMTggPiB2ZXJ0aWNhbFBvcykge1xuICAgICAgYWN0aXZhdGlvbkRhdGEuc3RhcnR5ID0gdmVydGljYWxQb3MgLSA2O1xuICAgICAgdmVydGljYWxQb3MgKz0gMTI7XG4gICAgfVxuICAgIHN2Z0RyYXdfZGVmYXVsdC5kcmF3QWN0aXZhdGlvbihcbiAgICAgIGRpYWdyYW0yLFxuICAgICAgYWN0aXZhdGlvbkRhdGEsXG4gICAgICB2ZXJ0aWNhbFBvcyxcbiAgICAgIGNvbmYsXG4gICAgICBhY3RvckFjdGl2YXRpb25zKG1zZy5mcm9tKS5sZW5ndGgsXG4gICAgICBkaWFnT2JqLFxuICAgICAgYWN0b3JJbmRleE1hcFxuICAgICk7XG4gICAgYm91bmRzLmluc2VydChhY3RpdmF0aW9uRGF0YS5zdGFydHgsIHZlcnRpY2FsUG9zIC0gMTAsIGFjdGl2YXRpb25EYXRhLnN0b3B4LCB2ZXJ0aWNhbFBvcyk7XG4gIH1cbiAgX19uYW1lKGFjdGl2ZUVuZCwgXCJhY3RpdmVFbmRcIik7XG4gIGxldCBzZXF1ZW5jZUluZGV4ID0gMTtcbiAgbGV0IHNlcXVlbmNlSW5kZXhTdGVwID0gMTtcbiAgY29uc3QgbWVzc2FnZXNUb0RyYXcgPSBbXTtcbiAgY29uc3QgYmFja2dyb3VuZHMgPSBbXTtcbiAgbGV0IGluZGV4ID0gMDtcbiAgZm9yIChjb25zdCBtc2cgb2YgbWVzc2FnZXMpIHtcbiAgICBsZXQgbG9vcE1vZGVsLCBub3RlTW9kZWwsIG1zZ01vZGVsO1xuICAgIHN3aXRjaCAobXNnLnR5cGUpIHtcbiAgICAgIGNhc2UgZGlhZ09iai5kYi5MSU5FVFlQRS5OT1RFOlxuICAgICAgICBib3VuZHMucmVzZXRWZXJ0aWNhbFBvcygpO1xuICAgICAgICBub3RlTW9kZWwgPSBtc2cubm90ZU1vZGVsO1xuICAgICAgICBhd2FpdCBkcmF3Tm90ZShkaWFncmFtMiwgbm90ZU1vZGVsLCBtc2cuaWQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgZGlhZ09iai5kYi5MSU5FVFlQRS5BQ1RJVkVfU1RBUlQ6XG4gICAgICAgIGJvdW5kcy5uZXdBY3RpdmF0aW9uKG1zZywgZGlhZ3JhbTIsIGFjdG9ycyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkaWFnT2JqLmRiLkxJTkVUWVBFLkNFTlRSQUxfQ09OTkVDVElPTjpcbiAgICAgICAgYm91bmRzLm5ld0FjdGl2YXRpb24obXNnLCBkaWFncmFtMiwgYWN0b3JzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRpYWdPYmouZGIuTElORVRZUEUuQ0VOVFJBTF9DT05ORUNUSU9OX1JFVkVSU0U6XG4gICAgICAgIGJvdW5kcy5uZXdBY3RpdmF0aW9uKG1zZywgZGlhZ3JhbTIsIGFjdG9ycyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkaWFnT2JqLmRiLkxJTkVUWVBFLkFDVElWRV9FTkQ6XG4gICAgICAgIGFjdGl2ZUVuZChtc2csIGJvdW5kcy5nZXRWZXJ0aWNhbFBvcygpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRpYWdPYmouZGIuTElORVRZUEUuTE9PUF9TVEFSVDpcbiAgICAgICAgYWRqdXN0TG9vcEhlaWdodEZvcldyYXAoXG4gICAgICAgICAgbG9vcFdpZHRocyxcbiAgICAgICAgICBtc2csXG4gICAgICAgICAgY29uZi5ib3hNYXJnaW4sXG4gICAgICAgICAgY29uZi5ib3hNYXJnaW4gKyBjb25mLmJveFRleHRNYXJnaW4sXG4gICAgICAgICAgKG1lc3NhZ2UpID0+IGJvdW5kcy5uZXdMb29wKG1lc3NhZ2UpXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkaWFnT2JqLmRiLkxJTkVUWVBFLkxPT1BfRU5EOlxuICAgICAgICBsb29wTW9kZWwgPSBib3VuZHMuZW5kTG9vcCgpO1xuICAgICAgICBhd2FpdCBzdmdEcmF3X2RlZmF1bHQuZHJhd0xvb3AoZGlhZ3JhbTIsIGxvb3BNb2RlbCwgXCJsb29wXCIsIGNvbmYsIG1zZyk7XG4gICAgICAgIGJvdW5kcy5idW1wVmVydGljYWxQb3MobG9vcE1vZGVsLnN0b3B5IC0gYm91bmRzLmdldFZlcnRpY2FsUG9zKCkpO1xuICAgICAgICBib3VuZHMubW9kZWxzLmFkZExvb3AobG9vcE1vZGVsKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRpYWdPYmouZGIuTElORVRZUEUuUkVDVF9TVEFSVDpcbiAgICAgICAgYWRqdXN0TG9vcEhlaWdodEZvcldyYXAoXG4gICAgICAgICAgbG9vcFdpZHRocyxcbiAgICAgICAgICBtc2csXG4gICAgICAgICAgY29uZi5ib3hNYXJnaW4sXG4gICAgICAgICAgY29uZi5ib3hNYXJnaW4sXG4gICAgICAgICAgKG1lc3NhZ2UpID0+IGJvdW5kcy5uZXdMb29wKHZvaWQgMCwgbWVzc2FnZS5tZXNzYWdlKVxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgZGlhZ09iai5kYi5MSU5FVFlQRS5SRUNUX0VORDpcbiAgICAgICAgbG9vcE1vZGVsID0gYm91bmRzLmVuZExvb3AoKTtcbiAgICAgICAgYmFja2dyb3VuZHMucHVzaChsb29wTW9kZWwpO1xuICAgICAgICBib3VuZHMubW9kZWxzLmFkZExvb3AobG9vcE1vZGVsKTtcbiAgICAgICAgYm91bmRzLmJ1bXBWZXJ0aWNhbFBvcyhsb29wTW9kZWwuc3RvcHkgLSBib3VuZHMuZ2V0VmVydGljYWxQb3MoKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkaWFnT2JqLmRiLkxJTkVUWVBFLk9QVF9TVEFSVDpcbiAgICAgICAgYWRqdXN0TG9vcEhlaWdodEZvcldyYXAoXG4gICAgICAgICAgbG9vcFdpZHRocyxcbiAgICAgICAgICBtc2csXG4gICAgICAgICAgY29uZi5ib3hNYXJnaW4sXG4gICAgICAgICAgY29uZi5ib3hNYXJnaW4gKyBjb25mLmJveFRleHRNYXJnaW4sXG4gICAgICAgICAgKG1lc3NhZ2UpID0+IGJvdW5kcy5uZXdMb29wKG1lc3NhZ2UpXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkaWFnT2JqLmRiLkxJTkVUWVBFLk9QVF9FTkQ6XG4gICAgICAgIGxvb3BNb2RlbCA9IGJvdW5kcy5lbmRMb29wKCk7XG4gICAgICAgIGF3YWl0IHN2Z0RyYXdfZGVmYXVsdC5kcmF3TG9vcChkaWFncmFtMiwgbG9vcE1vZGVsLCBcIm9wdFwiLCBjb25mLCBtc2cpO1xuICAgICAgICBib3VuZHMuYnVtcFZlcnRpY2FsUG9zKGxvb3BNb2RlbC5zdG9weSAtIGJvdW5kcy5nZXRWZXJ0aWNhbFBvcygpKTtcbiAgICAgICAgYm91bmRzLm1vZGVscy5hZGRMb29wKGxvb3BNb2RlbCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkaWFnT2JqLmRiLkxJTkVUWVBFLkFMVF9TVEFSVDpcbiAgICAgICAgYWRqdXN0TG9vcEhlaWdodEZvcldyYXAoXG4gICAgICAgICAgbG9vcFdpZHRocyxcbiAgICAgICAgICBtc2csXG4gICAgICAgICAgY29uZi5ib3hNYXJnaW4sXG4gICAgICAgICAgY29uZi5ib3hNYXJnaW4gKyBjb25mLmJveFRleHRNYXJnaW4sXG4gICAgICAgICAgKG1lc3NhZ2UpID0+IGJvdW5kcy5uZXdMb29wKG1lc3NhZ2UpXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkaWFnT2JqLmRiLkxJTkVUWVBFLkFMVF9FTFNFOlxuICAgICAgICBhZGp1c3RMb29wSGVpZ2h0Rm9yV3JhcChcbiAgICAgICAgICBsb29wV2lkdGhzLFxuICAgICAgICAgIG1zZyxcbiAgICAgICAgICBjb25mLmJveE1hcmdpbiArIGNvbmYuYm94VGV4dE1hcmdpbixcbiAgICAgICAgICBjb25mLmJveE1hcmdpbixcbiAgICAgICAgICAobWVzc2FnZSkgPT4gYm91bmRzLmFkZFNlY3Rpb25Ub0xvb3AobWVzc2FnZSlcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRpYWdPYmouZGIuTElORVRZUEUuQUxUX0VORDpcbiAgICAgICAgbG9vcE1vZGVsID0gYm91bmRzLmVuZExvb3AoKTtcbiAgICAgICAgYXdhaXQgc3ZnRHJhd19kZWZhdWx0LmRyYXdMb29wKGRpYWdyYW0yLCBsb29wTW9kZWwsIFwiYWx0XCIsIGNvbmYsIG1zZyk7XG4gICAgICAgIGJvdW5kcy5idW1wVmVydGljYWxQb3MobG9vcE1vZGVsLnN0b3B5IC0gYm91bmRzLmdldFZlcnRpY2FsUG9zKCkpO1xuICAgICAgICBib3VuZHMubW9kZWxzLmFkZExvb3AobG9vcE1vZGVsKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRpYWdPYmouZGIuTElORVRZUEUuUEFSX1NUQVJUOlxuICAgICAgY2FzZSBkaWFnT2JqLmRiLkxJTkVUWVBFLlBBUl9PVkVSX1NUQVJUOlxuICAgICAgICBhZGp1c3RMb29wSGVpZ2h0Rm9yV3JhcChcbiAgICAgICAgICBsb29wV2lkdGhzLFxuICAgICAgICAgIG1zZyxcbiAgICAgICAgICBjb25mLmJveE1hcmdpbixcbiAgICAgICAgICBjb25mLmJveE1hcmdpbiArIGNvbmYuYm94VGV4dE1hcmdpbixcbiAgICAgICAgICAobWVzc2FnZSkgPT4gYm91bmRzLm5ld0xvb3AobWVzc2FnZSlcbiAgICAgICAgKTtcbiAgICAgICAgYm91bmRzLnNhdmVWZXJ0aWNhbFBvcygpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgZGlhZ09iai5kYi5MSU5FVFlQRS5QQVJfQU5EOlxuICAgICAgICBhZGp1c3RMb29wSGVpZ2h0Rm9yV3JhcChcbiAgICAgICAgICBsb29wV2lkdGhzLFxuICAgICAgICAgIG1zZyxcbiAgICAgICAgICBjb25mLmJveE1hcmdpbiArIGNvbmYuYm94VGV4dE1hcmdpbixcbiAgICAgICAgICBjb25mLmJveE1hcmdpbixcbiAgICAgICAgICAobWVzc2FnZSkgPT4gYm91bmRzLmFkZFNlY3Rpb25Ub0xvb3AobWVzc2FnZSlcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRpYWdPYmouZGIuTElORVRZUEUuUEFSX0VORDpcbiAgICAgICAgbG9vcE1vZGVsID0gYm91bmRzLmVuZExvb3AoKTtcbiAgICAgICAgYXdhaXQgc3ZnRHJhd19kZWZhdWx0LmRyYXdMb29wKGRpYWdyYW0yLCBsb29wTW9kZWwsIFwicGFyXCIsIGNvbmYsIG1zZyk7XG4gICAgICAgIGJvdW5kcy5idW1wVmVydGljYWxQb3MobG9vcE1vZGVsLnN0b3B5IC0gYm91bmRzLmdldFZlcnRpY2FsUG9zKCkpO1xuICAgICAgICBib3VuZHMubW9kZWxzLmFkZExvb3AobG9vcE1vZGVsKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRpYWdPYmouZGIuTElORVRZUEUuQVVUT05VTUJFUjpcbiAgICAgICAgc2VxdWVuY2VJbmRleCA9IG1zZy5tZXNzYWdlLnN0YXJ0IHx8IHNlcXVlbmNlSW5kZXg7XG4gICAgICAgIHNlcXVlbmNlSW5kZXhTdGVwID0gbXNnLm1lc3NhZ2Uuc3RlcCB8fCBzZXF1ZW5jZUluZGV4U3RlcDtcbiAgICAgICAgaWYgKG1zZy5tZXNzYWdlLnZpc2libGUpIHtcbiAgICAgICAgICBkaWFnT2JqLmRiLmVuYWJsZVNlcXVlbmNlTnVtYmVycygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRpYWdPYmouZGIuZGlzYWJsZVNlcXVlbmNlTnVtYmVycygpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkaWFnT2JqLmRiLkxJTkVUWVBFLkNSSVRJQ0FMX1NUQVJUOlxuICAgICAgICBhZGp1c3RMb29wSGVpZ2h0Rm9yV3JhcChcbiAgICAgICAgICBsb29wV2lkdGhzLFxuICAgICAgICAgIG1zZyxcbiAgICAgICAgICBjb25mLmJveE1hcmdpbixcbiAgICAgICAgICBjb25mLmJveE1hcmdpbiArIGNvbmYuYm94VGV4dE1hcmdpbixcbiAgICAgICAgICAobWVzc2FnZSkgPT4gYm91bmRzLm5ld0xvb3AobWVzc2FnZSlcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRpYWdPYmouZGIuTElORVRZUEUuQ1JJVElDQUxfT1BUSU9OOlxuICAgICAgICBhZGp1c3RMb29wSGVpZ2h0Rm9yV3JhcChcbiAgICAgICAgICBsb29wV2lkdGhzLFxuICAgICAgICAgIG1zZyxcbiAgICAgICAgICBjb25mLmJveE1hcmdpbiArIGNvbmYuYm94VGV4dE1hcmdpbixcbiAgICAgICAgICBjb25mLmJveE1hcmdpbixcbiAgICAgICAgICAobWVzc2FnZSkgPT4gYm91bmRzLmFkZFNlY3Rpb25Ub0xvb3AobWVzc2FnZSlcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRpYWdPYmouZGIuTElORVRZUEUuQ1JJVElDQUxfRU5EOlxuICAgICAgICBsb29wTW9kZWwgPSBib3VuZHMuZW5kTG9vcCgpO1xuICAgICAgICBhd2FpdCBzdmdEcmF3X2RlZmF1bHQuZHJhd0xvb3AoZGlhZ3JhbTIsIGxvb3BNb2RlbCwgXCJjcml0aWNhbFwiLCBjb25mLCBtc2cpO1xuICAgICAgICBib3VuZHMuYnVtcFZlcnRpY2FsUG9zKGxvb3BNb2RlbC5zdG9weSAtIGJvdW5kcy5nZXRWZXJ0aWNhbFBvcygpKTtcbiAgICAgICAgYm91bmRzLm1vZGVscy5hZGRMb29wKGxvb3BNb2RlbCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBkaWFnT2JqLmRiLkxJTkVUWVBFLkJSRUFLX1NUQVJUOlxuICAgICAgICBhZGp1c3RMb29wSGVpZ2h0Rm9yV3JhcChcbiAgICAgICAgICBsb29wV2lkdGhzLFxuICAgICAgICAgIG1zZyxcbiAgICAgICAgICBjb25mLmJveE1hcmdpbixcbiAgICAgICAgICBjb25mLmJveE1hcmdpbiArIGNvbmYuYm94VGV4dE1hcmdpbixcbiAgICAgICAgICAobWVzc2FnZSkgPT4gYm91bmRzLm5ld0xvb3AobWVzc2FnZSlcbiAgICAgICAgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRpYWdPYmouZGIuTElORVRZUEUuQlJFQUtfRU5EOlxuICAgICAgICBsb29wTW9kZWwgPSBib3VuZHMuZW5kTG9vcCgpO1xuICAgICAgICBhd2FpdCBzdmdEcmF3X2RlZmF1bHQuZHJhd0xvb3AoZGlhZ3JhbTIsIGxvb3BNb2RlbCwgXCJicmVha1wiLCBjb25mLCBtc2cpO1xuICAgICAgICBib3VuZHMuYnVtcFZlcnRpY2FsUG9zKGxvb3BNb2RlbC5zdG9weSAtIGJvdW5kcy5nZXRWZXJ0aWNhbFBvcygpKTtcbiAgICAgICAgYm91bmRzLm1vZGVscy5hZGRMb29wKGxvb3BNb2RlbCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBtc2dNb2RlbCA9IG1zZy5tc2dNb2RlbDtcbiAgICAgICAgICBtc2dNb2RlbC5zdGFydHkgPSBib3VuZHMuZ2V0VmVydGljYWxQb3MoKTtcbiAgICAgICAgICBtc2dNb2RlbC5zZXF1ZW5jZUluZGV4ID0gc2VxdWVuY2VJbmRleDtcbiAgICAgICAgICBtc2dNb2RlbC5zZXF1ZW5jZVZpc2libGUgPSBkaWFnT2JqLmRiLnNob3dTZXF1ZW5jZU51bWJlcnMoKTtcbiAgICAgICAgICBtc2dNb2RlbC5pZCA9IG1zZy5pZDtcbiAgICAgICAgICBtc2dNb2RlbC5mcm9tID0gbXNnLmZyb207XG4gICAgICAgICAgbXNnTW9kZWwudG8gPSBtc2cudG87XG4gICAgICAgICAgY29uc3QgbGluZVN0YXJ0WSA9IGF3YWl0IGJvdW5kTWVzc2FnZShkaWFncmFtMiwgbXNnTW9kZWwpO1xuICAgICAgICAgIGFkanVzdENyZWF0ZWREZXN0cm95ZWREYXRhKFxuICAgICAgICAgICAgbXNnLFxuICAgICAgICAgICAgbXNnTW9kZWwsXG4gICAgICAgICAgICBsaW5lU3RhcnRZLFxuICAgICAgICAgICAgaW5kZXgsXG4gICAgICAgICAgICBhY3RvcnMsXG4gICAgICAgICAgICBjcmVhdGVkQWN0b3JzLFxuICAgICAgICAgICAgZGVzdHJveWVkQWN0b3JzXG4gICAgICAgICAgKTtcbiAgICAgICAgICBtZXNzYWdlc1RvRHJhdy5wdXNoKHsgbWVzc2FnZU1vZGVsOiBtc2dNb2RlbCwgbGluZVN0YXJ0WSwgbXNnIH0pO1xuICAgICAgICAgIGJvdW5kcy5tb2RlbHMuYWRkTWVzc2FnZShtc2dNb2RlbCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBsb2cuZXJyb3IoXCJlcnJvciB3aGlsZSBkcmF3aW5nIG1lc3NhZ2VcIiwgZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKFtcbiAgICAgIGRpYWdPYmouZGIuTElORVRZUEUuU09MSURfT1BFTixcbiAgICAgIGRpYWdPYmouZGIuTElORVRZUEUuRE9UVEVEX09QRU4sXG4gICAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElELFxuICAgICAgZGlhZ09iai5kYi5MSU5FVFlQRS5TT0xJRF9UT1AsXG4gICAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElEX0JPVFRPTSxcbiAgICAgIGRpYWdPYmouZGIuTElORVRZUEUuU1RJQ0tfVE9QLFxuICAgICAgZGlhZ09iai5kYi5MSU5FVFlQRS5TVElDS19CT1RUT00sXG4gICAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElEX1RPUF9ET1RURUQsXG4gICAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElEX0JPVFRPTV9ET1RURUQsXG4gICAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLlNUSUNLX1RPUF9ET1RURUQsXG4gICAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLlNUSUNLX0JPVFRPTV9ET1RURUQsXG4gICAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElEX0FSUk9XX1RPUF9SRVZFUlNFLFxuICAgICAgZGlhZ09iai5kYi5MSU5FVFlQRS5TT0xJRF9BUlJPV19CT1RUT01fUkVWRVJTRSxcbiAgICAgIGRpYWdPYmouZGIuTElORVRZUEUuU1RJQ0tfQVJST1dfVE9QX1JFVkVSU0UsXG4gICAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLlNUSUNLX0FSUk9XX0JPVFRPTV9SRVZFUlNFLFxuICAgICAgZGlhZ09iai5kYi5MSU5FVFlQRS5TT0xJRF9BUlJPV19UT1BfUkVWRVJTRV9ET1RURUQsXG4gICAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElEX0FSUk9XX0JPVFRPTV9SRVZFUlNFX0RPVFRFRCxcbiAgICAgIGRpYWdPYmouZGIuTElORVRZUEUuU1RJQ0tfQVJST1dfVE9QX1JFVkVSU0VfRE9UVEVELFxuICAgICAgZGlhZ09iai5kYi5MSU5FVFlQRS5TVElDS19BUlJPV19CT1RUT01fUkVWRVJTRV9ET1RURUQsXG4gICAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLkRPVFRFRCxcbiAgICAgIGRpYWdPYmouZGIuTElORVRZUEUuU09MSURfQ1JPU1MsXG4gICAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLkRPVFRFRF9DUk9TUyxcbiAgICAgIGRpYWdPYmouZGIuTElORVRZUEUuU09MSURfUE9JTlQsXG4gICAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLkRPVFRFRF9QT0lOVCxcbiAgICAgIGRpYWdPYmouZGIuTElORVRZUEUuQklESVJFQ1RJT05BTF9TT0xJRCxcbiAgICAgIGRpYWdPYmouZGIuTElORVRZUEUuQklESVJFQ1RJT05BTF9ET1RURURcbiAgICBdLmluY2x1ZGVzKG1zZy50eXBlKSkge1xuICAgICAgc2VxdWVuY2VJbmRleCA9IE1hdGgucm91bmQoKHNlcXVlbmNlSW5kZXggKyBzZXF1ZW5jZUluZGV4U3RlcCkgKiAxMDApIC8gMTAwO1xuICAgIH1cbiAgICBpbmRleCsrO1xuICB9XG4gIGxvZy5kZWJ1ZyhcImNyZWF0ZWRBY3RvcnNcIiwgY3JlYXRlZEFjdG9ycyk7XG4gIGxvZy5kZWJ1ZyhcImRlc3Ryb3llZEFjdG9yc1wiLCBkZXN0cm95ZWRBY3RvcnMpO1xuICBhd2FpdCBkcmF3QWN0b3JzKGRpYWdyYW0yLCBhY3RvcnMsIGFjdG9yS2V5cywgZmFsc2UsIGlkLCBkaWFnT2JqLCBhY3RvckluZGV4TWFwKTtcbiAgZm9yIChjb25zdCBlIG9mIG1lc3NhZ2VzVG9EcmF3KSB7XG4gICAgYXdhaXQgZHJhd01lc3NhZ2UoZGlhZ3JhbTIsIGUubWVzc2FnZU1vZGVsLCBlLmxpbmVTdGFydFksIGRpYWdPYmosIGUubXNnLCBpZCk7XG4gIH1cbiAgaWYgKGNvbmYubWlycm9yQWN0b3JzKSB7XG4gICAgYXdhaXQgZHJhd0FjdG9ycyhkaWFncmFtMiwgYWN0b3JzLCBhY3RvcktleXMsIHRydWUsIGlkLCBkaWFnT2JqLCBhY3RvckluZGV4TWFwKTtcbiAgfVxuICBiYWNrZ3JvdW5kcy5mb3JFYWNoKChlKSA9PiBzdmdEcmF3X2RlZmF1bHQuZHJhd0JhY2tncm91bmRSZWN0KGRpYWdyYW0yLCBlKSk7XG4gIGZpeExpZmVMaW5lSGVpZ2h0cyhkaWFncmFtMiwgYWN0b3JzLCBhY3RvcktleXMsIGNvbmYpO1xuICBmb3IgKGNvbnN0IGJveDIgb2YgYm91bmRzLm1vZGVscy5ib3hlcykge1xuICAgIGJveDIuaGVpZ2h0ID0gYm91bmRzLmdldFZlcnRpY2FsUG9zKCkgLSBib3gyLnk7XG4gICAgYm91bmRzLmluc2VydChib3gyLngsIGJveDIueSwgYm94Mi54ICsgYm94Mi53aWR0aCwgYm94Mi5oZWlnaHQpO1xuICAgIGNvbnN0IGJveFBhZGRpbmcgPSBjb25mLmJveE1hcmdpbiAqIDI7XG4gICAgYm94Mi5zdGFydHggPSBib3gyLnggLSBib3hQYWRkaW5nO1xuICAgIGJveDIuc3RhcnR5ID0gYm94Mi55IC0gYm94UGFkZGluZyAqIDAuMjU7XG4gICAgYm94Mi5zdG9weCA9IGJveDIuc3RhcnR4ICsgYm94Mi53aWR0aCArIDIgKiBib3hQYWRkaW5nO1xuICAgIGJveDIuc3RvcHkgPSBib3gyLnN0YXJ0eSArIGJveDIuaGVpZ2h0ICsgYm94UGFkZGluZyAqIDAuNzU7XG4gICAgYm94Mi5zdHJva2UgPSBcInJnYigwLDAsMCwgMC41KVwiO1xuICAgIHN2Z0RyYXdfZGVmYXVsdC5kcmF3Qm94KGRpYWdyYW0yLCBib3gyLCBjb25mKTtcbiAgfVxuICBpZiAoaGFzQm94ZXMpIHtcbiAgICBib3VuZHMuYnVtcFZlcnRpY2FsUG9zKGNvbmYuYm94TWFyZ2luKTtcbiAgfVxuICBjb25zdCByZXF1aXJlZEJveFNpemUgPSBkcmF3QWN0b3JzUG9wdXAoZGlhZ3JhbTIsIGFjdG9ycywgYWN0b3JLZXlzLCBkb2MpO1xuICBjb25zdCB7IGJvdW5kczogYm94IH0gPSBib3VuZHMuZ2V0Qm91bmRzKCk7XG4gIGlmIChib3guc3RhcnR4ID09PSB2b2lkIDApIHtcbiAgICBib3guc3RhcnR4ID0gMDtcbiAgfVxuICBpZiAoYm94LnN0YXJ0eSA9PT0gdm9pZCAwKSB7XG4gICAgYm94LnN0YXJ0eSA9IDA7XG4gIH1cbiAgaWYgKGJveC5zdG9weCA9PT0gdm9pZCAwKSB7XG4gICAgYm94LnN0b3B4ID0gMDtcbiAgfVxuICBpZiAoYm94LnN0b3B5ID09PSB2b2lkIDApIHtcbiAgICBib3guc3RvcHkgPSAwO1xuICB9XG4gIGxldCBib3hIZWlnaHQgPSBib3guc3RvcHkgLSBib3guc3RhcnR5O1xuICBpZiAoYm94SGVpZ2h0IDwgcmVxdWlyZWRCb3hTaXplLm1heEhlaWdodCkge1xuICAgIGJveEhlaWdodCA9IHJlcXVpcmVkQm94U2l6ZS5tYXhIZWlnaHQ7XG4gIH1cbiAgbGV0IGhlaWdodCA9IGJveEhlaWdodCArIDIgKiBjb25mLmRpYWdyYW1NYXJnaW5ZO1xuICBpZiAoY29uZi5taXJyb3JBY3RvcnMpIHtcbiAgICBoZWlnaHQgPSBoZWlnaHQgLSBjb25mLmJveE1hcmdpbiArIGNvbmYuYm90dG9tTWFyZ2luQWRqO1xuICB9XG4gIGxldCBib3hXaWR0aCA9IGJveC5zdG9weCAtIGJveC5zdGFydHg7XG4gIGlmIChib3hXaWR0aCA8IHJlcXVpcmVkQm94U2l6ZS5tYXhXaWR0aCkge1xuICAgIGJveFdpZHRoID0gcmVxdWlyZWRCb3hTaXplLm1heFdpZHRoO1xuICB9XG4gIGNvbnN0IHdpZHRoID0gYm94V2lkdGggKyAyICogY29uZi5kaWFncmFtTWFyZ2luWDtcbiAgaWYgKHRpdGxlKSB7XG4gICAgZGlhZ3JhbTIuYXBwZW5kKFwidGV4dFwiKS50ZXh0KHRpdGxlKS5hdHRyKFwieFwiLCAoYm94LnN0b3B4IC0gYm94LnN0YXJ0eCkgLyAyIC0gMiAqIGNvbmYuZGlhZ3JhbU1hcmdpblgpLmF0dHIoXCJ5XCIsIC0yNSk7XG4gIH1cbiAgY29uZmlndXJlU3ZnU2l6ZShkaWFncmFtMiwgaGVpZ2h0LCB3aWR0aCwgY29uZi51c2VNYXhXaWR0aCk7XG4gIGNvbnN0IGV4dHJhVmVydEZvclRpdGxlID0gdGl0bGUgPyA0MCA6IDA7XG4gIGNvbnN0IGV4dHJhSGVpZ2h0Rm9yTmVvQWN0b3JzID0gYWN0b3JzLnNpemUgJiYgbG9vayA9PT0gXCJuZW9cIiA/IDMwIDogMDtcbiAgZGlhZ3JhbTIuYXR0cihcbiAgICBcInZpZXdCb3hcIixcbiAgICBib3guc3RhcnR4IC0gY29uZi5kaWFncmFtTWFyZ2luWCArIFwiIC1cIiArIChjb25mLmRpYWdyYW1NYXJnaW5ZICsgZXh0cmFWZXJ0Rm9yVGl0bGUpICsgXCIgXCIgKyB3aWR0aCArIFwiIFwiICsgKGhlaWdodCArIGV4dHJhVmVydEZvclRpdGxlICsgZXh0cmFIZWlnaHRGb3JOZW9BY3RvcnMpXG4gICk7XG4gIGxvZy5kZWJ1ZyhgbW9kZWxzOmAsIGJvdW5kcy5tb2RlbHMpO1xufSwgXCJkcmF3XCIpO1xuYXN5bmMgZnVuY3Rpb24gZ2V0TWF4TWVzc2FnZVdpZHRoUGVyQWN0b3IoYWN0b3JzLCBtZXNzYWdlcywgZGlhZ09iaikge1xuICBjb25zdCBtYXhNZXNzYWdlV2lkdGhQZXJBY3RvciA9IHt9O1xuICBmb3IgKGNvbnN0IG1zZyBvZiBtZXNzYWdlcykge1xuICAgIGlmIChhY3RvcnMuZ2V0KG1zZy50bykgJiYgYWN0b3JzLmdldChtc2cuZnJvbSkpIHtcbiAgICAgIGNvbnN0IGFjdG9yID0gYWN0b3JzLmdldChtc2cudG8pO1xuICAgICAgaWYgKG1zZy5wbGFjZW1lbnQgPT09IGRpYWdPYmouZGIuUExBQ0VNRU5ULkxFRlRPRiAmJiAhYWN0b3IucHJldkFjdG9yKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgaWYgKG1zZy5wbGFjZW1lbnQgPT09IGRpYWdPYmouZGIuUExBQ0VNRU5ULlJJR0hUT0YgJiYgIWFjdG9yLm5leHRBY3Rvcikge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGlzTm90ZSA9IG1zZy5wbGFjZW1lbnQgIT09IHZvaWQgMDtcbiAgICAgIGNvbnN0IGlzTWVzc2FnZSA9ICFpc05vdGU7XG4gICAgICBjb25zdCB0ZXh0Rm9udCA9IGlzTm90ZSA/IG5vdGVGb250KGNvbmYpIDogbWVzc2FnZUZvbnQoY29uZik7XG4gICAgICBjb25zdCB3cmFwcGVkTWVzc2FnZSA9IG1zZy53cmFwID8gdXRpbHNfZGVmYXVsdC53cmFwTGFiZWwobXNnLm1lc3NhZ2UsIGNvbmYud2lkdGggLSAyICogY29uZi53cmFwUGFkZGluZywgdGV4dEZvbnQpIDogbXNnLm1lc3NhZ2U7XG4gICAgICBjb25zdCBtZXNzYWdlRGltZW5zaW9ucyA9IGhhc0thdGV4KHdyYXBwZWRNZXNzYWdlKSA/IGF3YWl0IGNhbGN1bGF0ZU1hdGhNTERpbWVuc2lvbnMobXNnLm1lc3NhZ2UsIGdldENvbmZpZzIoKSkgOiB1dGlsc19kZWZhdWx0LmNhbGN1bGF0ZVRleHREaW1lbnNpb25zKHdyYXBwZWRNZXNzYWdlLCB0ZXh0Rm9udCk7XG4gICAgICBjb25zdCBtZXNzYWdlV2lkdGggPSBtZXNzYWdlRGltZW5zaW9ucy53aWR0aCArIDIgKiBjb25mLndyYXBQYWRkaW5nO1xuICAgICAgaWYgKGlzTWVzc2FnZSAmJiBtc2cuZnJvbSA9PT0gYWN0b3IubmV4dEFjdG9yKSB7XG4gICAgICAgIG1heE1lc3NhZ2VXaWR0aFBlckFjdG9yW21zZy50b10gPSBjb21tb25fZGVmYXVsdC5nZXRNYXgoXG4gICAgICAgICAgbWF4TWVzc2FnZVdpZHRoUGVyQWN0b3JbbXNnLnRvXSB8fCAwLFxuICAgICAgICAgIG1lc3NhZ2VXaWR0aFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIGlmIChpc01lc3NhZ2UgJiYgbXNnLmZyb20gPT09IGFjdG9yLnByZXZBY3Rvcikge1xuICAgICAgICBtYXhNZXNzYWdlV2lkdGhQZXJBY3Rvclttc2cuZnJvbV0gPSBjb21tb25fZGVmYXVsdC5nZXRNYXgoXG4gICAgICAgICAgbWF4TWVzc2FnZVdpZHRoUGVyQWN0b3JbbXNnLmZyb21dIHx8IDAsXG4gICAgICAgICAgbWVzc2FnZVdpZHRoXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKGlzTWVzc2FnZSAmJiBtc2cuZnJvbSA9PT0gbXNnLnRvKSB7XG4gICAgICAgIG1heE1lc3NhZ2VXaWR0aFBlckFjdG9yW21zZy5mcm9tXSA9IGNvbW1vbl9kZWZhdWx0LmdldE1heChcbiAgICAgICAgICBtYXhNZXNzYWdlV2lkdGhQZXJBY3Rvclttc2cuZnJvbV0gfHwgMCxcbiAgICAgICAgICBtZXNzYWdlV2lkdGggLyAyXG4gICAgICAgICk7XG4gICAgICAgIG1heE1lc3NhZ2VXaWR0aFBlckFjdG9yW21zZy50b10gPSBjb21tb25fZGVmYXVsdC5nZXRNYXgoXG4gICAgICAgICAgbWF4TWVzc2FnZVdpZHRoUGVyQWN0b3JbbXNnLnRvXSB8fCAwLFxuICAgICAgICAgIG1lc3NhZ2VXaWR0aCAvIDJcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBpZiAobXNnLnBsYWNlbWVudCA9PT0gZGlhZ09iai5kYi5QTEFDRU1FTlQuUklHSFRPRikge1xuICAgICAgICBtYXhNZXNzYWdlV2lkdGhQZXJBY3Rvclttc2cuZnJvbV0gPSBjb21tb25fZGVmYXVsdC5nZXRNYXgoXG4gICAgICAgICAgbWF4TWVzc2FnZVdpZHRoUGVyQWN0b3JbbXNnLmZyb21dIHx8IDAsXG4gICAgICAgICAgbWVzc2FnZVdpZHRoXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKG1zZy5wbGFjZW1lbnQgPT09IGRpYWdPYmouZGIuUExBQ0VNRU5ULkxFRlRPRikge1xuICAgICAgICBtYXhNZXNzYWdlV2lkdGhQZXJBY3RvclthY3Rvci5wcmV2QWN0b3JdID0gY29tbW9uX2RlZmF1bHQuZ2V0TWF4KFxuICAgICAgICAgIG1heE1lc3NhZ2VXaWR0aFBlckFjdG9yW2FjdG9yLnByZXZBY3Rvcl0gfHwgMCxcbiAgICAgICAgICBtZXNzYWdlV2lkdGhcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBpZiAobXNnLnBsYWNlbWVudCA9PT0gZGlhZ09iai5kYi5QTEFDRU1FTlQuT1ZFUikge1xuICAgICAgICBpZiAoYWN0b3IucHJldkFjdG9yKSB7XG4gICAgICAgICAgbWF4TWVzc2FnZVdpZHRoUGVyQWN0b3JbYWN0b3IucHJldkFjdG9yXSA9IGNvbW1vbl9kZWZhdWx0LmdldE1heChcbiAgICAgICAgICAgIG1heE1lc3NhZ2VXaWR0aFBlckFjdG9yW2FjdG9yLnByZXZBY3Rvcl0gfHwgMCxcbiAgICAgICAgICAgIG1lc3NhZ2VXaWR0aCAvIDJcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhY3Rvci5uZXh0QWN0b3IpIHtcbiAgICAgICAgICBtYXhNZXNzYWdlV2lkdGhQZXJBY3Rvclttc2cuZnJvbV0gPSBjb21tb25fZGVmYXVsdC5nZXRNYXgoXG4gICAgICAgICAgICBtYXhNZXNzYWdlV2lkdGhQZXJBY3Rvclttc2cuZnJvbV0gfHwgMCxcbiAgICAgICAgICAgIG1lc3NhZ2VXaWR0aCAvIDJcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGxvZy5kZWJ1ZyhcIm1heE1lc3NhZ2VXaWR0aFBlckFjdG9yOlwiLCBtYXhNZXNzYWdlV2lkdGhQZXJBY3Rvcik7XG4gIHJldHVybiBtYXhNZXNzYWdlV2lkdGhQZXJBY3Rvcjtcbn1cbl9fbmFtZShnZXRNYXhNZXNzYWdlV2lkdGhQZXJBY3RvciwgXCJnZXRNYXhNZXNzYWdlV2lkdGhQZXJBY3RvclwiKTtcbnZhciBnZXRSZXF1aXJlZFBvcHVwV2lkdGggPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGFjdG9yKSB7XG4gIGxldCByZXF1aXJlZFBvcHVwV2lkdGggPSAwO1xuICBjb25zdCB0ZXh0Rm9udCA9IGFjdG9yRm9udChjb25mKTtcbiAgZm9yIChjb25zdCBrZXkgaW4gYWN0b3IubGlua3MpIHtcbiAgICBjb25zdCBsYWJlbERpbWVuc2lvbnMgPSB1dGlsc19kZWZhdWx0LmNhbGN1bGF0ZVRleHREaW1lbnNpb25zKGtleSwgdGV4dEZvbnQpO1xuICAgIGNvbnN0IGxhYmVsV2lkdGggPSBsYWJlbERpbWVuc2lvbnMud2lkdGggKyAyICogY29uZi53cmFwUGFkZGluZyArIDIgKiBjb25mLmJveE1hcmdpbjtcbiAgICBpZiAocmVxdWlyZWRQb3B1cFdpZHRoIDwgbGFiZWxXaWR0aCkge1xuICAgICAgcmVxdWlyZWRQb3B1cFdpZHRoID0gbGFiZWxXaWR0aDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlcXVpcmVkUG9wdXBXaWR0aDtcbn0sIFwiZ2V0UmVxdWlyZWRQb3B1cFdpZHRoXCIpO1xuYXN5bmMgZnVuY3Rpb24gY2FsY3VsYXRlQWN0b3JNYXJnaW5zKGFjdG9ycywgYWN0b3JUb01lc3NhZ2VXaWR0aCwgYm94ZXMpIHtcbiAgbGV0IG1heEhlaWdodCA9IDA7XG4gIGZvciAoY29uc3QgcHJvcCBvZiBhY3RvcnMua2V5cygpKSB7XG4gICAgY29uc3QgYWN0b3IgPSBhY3RvcnMuZ2V0KHByb3ApO1xuICAgIGlmIChhY3Rvci53cmFwKSB7XG4gICAgICBhY3Rvci5kZXNjcmlwdGlvbiA9IHV0aWxzX2RlZmF1bHQud3JhcExhYmVsKFxuICAgICAgICBhY3Rvci5kZXNjcmlwdGlvbixcbiAgICAgICAgY29uZi53aWR0aCAtIDIgKiBjb25mLndyYXBQYWRkaW5nLFxuICAgICAgICBhY3RvckZvbnQoY29uZilcbiAgICAgICk7XG4gICAgfVxuICAgIGNvbnN0IGFjdERpbXMgPSBoYXNLYXRleChhY3Rvci5kZXNjcmlwdGlvbikgPyBhd2FpdCBjYWxjdWxhdGVNYXRoTUxEaW1lbnNpb25zKGFjdG9yLmRlc2NyaXB0aW9uLCBnZXRDb25maWcyKCkpIDogdXRpbHNfZGVmYXVsdC5jYWxjdWxhdGVUZXh0RGltZW5zaW9ucyhhY3Rvci5kZXNjcmlwdGlvbiwgYWN0b3JGb250KGNvbmYpKTtcbiAgICBhY3Rvci53aWR0aCA9IGFjdG9yLndyYXAgPyBjb25mLndpZHRoIDogY29tbW9uX2RlZmF1bHQuZ2V0TWF4KGNvbmYud2lkdGgsIGFjdERpbXMud2lkdGggKyAyICogY29uZi53cmFwUGFkZGluZyk7XG4gICAgYWN0b3IuaGVpZ2h0ID0gYWN0b3Iud3JhcCA/IGNvbW1vbl9kZWZhdWx0LmdldE1heChhY3REaW1zLmhlaWdodCwgY29uZi5oZWlnaHQpIDogY29uZi5oZWlnaHQ7XG4gICAgbWF4SGVpZ2h0ID0gY29tbW9uX2RlZmF1bHQuZ2V0TWF4KG1heEhlaWdodCwgYWN0b3IuaGVpZ2h0KTtcbiAgfVxuICBmb3IgKGNvbnN0IGFjdG9yS2V5IGluIGFjdG9yVG9NZXNzYWdlV2lkdGgpIHtcbiAgICBjb25zdCBhY3RvciA9IGFjdG9ycy5nZXQoYWN0b3JLZXkpO1xuICAgIGlmICghYWN0b3IpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBjb25zdCBuZXh0QWN0b3IgPSBhY3RvcnMuZ2V0KGFjdG9yLm5leHRBY3Rvcik7XG4gICAgaWYgKCFuZXh0QWN0b3IpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2VXaWR0aDIgPSBhY3RvclRvTWVzc2FnZVdpZHRoW2FjdG9yS2V5XTtcbiAgICAgIGNvbnN0IGFjdG9yV2lkdGgyID0gbWVzc2FnZVdpZHRoMiArIGNvbmYuYWN0b3JNYXJnaW4gLSBhY3Rvci53aWR0aCAvIDI7XG4gICAgICBhY3Rvci5tYXJnaW4gPSBjb21tb25fZGVmYXVsdC5nZXRNYXgoYWN0b3JXaWR0aDIsIGNvbmYuYWN0b3JNYXJnaW4pO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNvbnN0IG1lc3NhZ2VXaWR0aCA9IGFjdG9yVG9NZXNzYWdlV2lkdGhbYWN0b3JLZXldO1xuICAgIGNvbnN0IGFjdG9yV2lkdGggPSBtZXNzYWdlV2lkdGggKyBjb25mLmFjdG9yTWFyZ2luIC0gYWN0b3Iud2lkdGggLyAyIC0gbmV4dEFjdG9yLndpZHRoIC8gMjtcbiAgICBhY3Rvci5tYXJnaW4gPSBjb21tb25fZGVmYXVsdC5nZXRNYXgoYWN0b3JXaWR0aCwgY29uZi5hY3Rvck1hcmdpbik7XG4gIH1cbiAgbGV0IG1heEJveEhlaWdodCA9IDA7XG4gIGJveGVzLmZvckVhY2goKGJveCkgPT4ge1xuICAgIGNvbnN0IHRleHRGb250ID0gbWVzc2FnZUZvbnQoY29uZik7XG4gICAgbGV0IHRvdGFsV2lkdGggPSBib3guYWN0b3JLZXlzLnJlZHVjZSgodG90YWwsIGFLZXkpID0+IHtcbiAgICAgIHJldHVybiB0b3RhbCArPSBhY3RvcnMuZ2V0KGFLZXkpLndpZHRoICsgKGFjdG9ycy5nZXQoYUtleSkubWFyZ2luIHx8IDApO1xuICAgIH0sIDApO1xuICAgIGNvbnN0IHN0YW5kYXJkQm94UGFkZGluZyA9IGNvbmYuYm94TWFyZ2luICogODtcbiAgICB0b3RhbFdpZHRoICs9IHN0YW5kYXJkQm94UGFkZGluZztcbiAgICB0b3RhbFdpZHRoIC09IDIgKiBjb25mLmJveFRleHRNYXJnaW47XG4gICAgaWYgKGJveC53cmFwKSB7XG4gICAgICBib3gubmFtZSA9IHV0aWxzX2RlZmF1bHQud3JhcExhYmVsKGJveC5uYW1lLCB0b3RhbFdpZHRoIC0gMiAqIGNvbmYud3JhcFBhZGRpbmcsIHRleHRGb250KTtcbiAgICB9XG4gICAgY29uc3QgYm94TXNnRGltZW5zaW9ucyA9IHV0aWxzX2RlZmF1bHQuY2FsY3VsYXRlVGV4dERpbWVuc2lvbnMoYm94Lm5hbWUsIHRleHRGb250KTtcbiAgICBtYXhCb3hIZWlnaHQgPSBjb21tb25fZGVmYXVsdC5nZXRNYXgoYm94TXNnRGltZW5zaW9ucy5oZWlnaHQsIG1heEJveEhlaWdodCk7XG4gICAgY29uc3QgbWluV2lkdGggPSBjb21tb25fZGVmYXVsdC5nZXRNYXgodG90YWxXaWR0aCwgYm94TXNnRGltZW5zaW9ucy53aWR0aCArIDIgKiBjb25mLndyYXBQYWRkaW5nKTtcbiAgICBib3gubWFyZ2luID0gY29uZi5ib3hUZXh0TWFyZ2luO1xuICAgIGlmICh0b3RhbFdpZHRoIDwgbWluV2lkdGgpIHtcbiAgICAgIGNvbnN0IG1pc3NpbmcgPSAobWluV2lkdGggLSB0b3RhbFdpZHRoKSAvIDI7XG4gICAgICBib3gubWFyZ2luICs9IG1pc3Npbmc7XG4gICAgfVxuICB9KTtcbiAgYm94ZXMuZm9yRWFjaCgoYm94KSA9PiBib3gudGV4dE1heEhlaWdodCA9IG1heEJveEhlaWdodCk7XG4gIHJldHVybiBjb21tb25fZGVmYXVsdC5nZXRNYXgobWF4SGVpZ2h0LCBjb25mLmhlaWdodCk7XG59XG5fX25hbWUoY2FsY3VsYXRlQWN0b3JNYXJnaW5zLCBcImNhbGN1bGF0ZUFjdG9yTWFyZ2luc1wiKTtcbnZhciBidWlsZE5vdGVNb2RlbCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgZnVuY3Rpb24obXNnLCBhY3RvcnMsIGRpYWdPYmopIHtcbiAgY29uc3QgZnJvbUFjdG9yID0gYWN0b3JzLmdldChtc2cuZnJvbSk7XG4gIGNvbnN0IHRvQWN0b3IgPSBhY3RvcnMuZ2V0KG1zZy50byk7XG4gIGNvbnN0IHN0YXJ0eCA9IGZyb21BY3Rvci54O1xuICBjb25zdCBzdG9weCA9IHRvQWN0b3IueDtcbiAgY29uc3Qgc2hvdWxkV3JhcCA9IG1zZy53cmFwICYmIG1zZy5tZXNzYWdlO1xuICBsZXQgdGV4dERpbWVuc2lvbnMgPSBoYXNLYXRleChtc2cubWVzc2FnZSkgPyBhd2FpdCBjYWxjdWxhdGVNYXRoTUxEaW1lbnNpb25zKG1zZy5tZXNzYWdlLCBnZXRDb25maWcyKCkpIDogdXRpbHNfZGVmYXVsdC5jYWxjdWxhdGVUZXh0RGltZW5zaW9ucyhcbiAgICBzaG91bGRXcmFwID8gdXRpbHNfZGVmYXVsdC53cmFwTGFiZWwobXNnLm1lc3NhZ2UsIGNvbmYud2lkdGgsIG5vdGVGb250KGNvbmYpKSA6IG1zZy5tZXNzYWdlLFxuICAgIG5vdGVGb250KGNvbmYpXG4gICk7XG4gIGNvbnN0IG5vdGVNb2RlbCA9IHtcbiAgICB3aWR0aDogc2hvdWxkV3JhcCA/IGNvbmYud2lkdGggOiBjb21tb25fZGVmYXVsdC5nZXRNYXgoY29uZi53aWR0aCwgdGV4dERpbWVuc2lvbnMud2lkdGggKyAyICogY29uZi5ub3RlTWFyZ2luKSxcbiAgICBoZWlnaHQ6IDAsXG4gICAgc3RhcnR4OiBmcm9tQWN0b3IueCxcbiAgICBzdG9weDogMCxcbiAgICBzdGFydHk6IDAsXG4gICAgc3RvcHk6IDAsXG4gICAgbWVzc2FnZTogbXNnLm1lc3NhZ2VcbiAgfTtcbiAgaWYgKG1zZy5wbGFjZW1lbnQgPT09IGRpYWdPYmouZGIuUExBQ0VNRU5ULlJJR0hUT0YpIHtcbiAgICBub3RlTW9kZWwud2lkdGggPSBzaG91bGRXcmFwID8gY29tbW9uX2RlZmF1bHQuZ2V0TWF4KGNvbmYud2lkdGgsIHRleHREaW1lbnNpb25zLndpZHRoKSA6IGNvbW1vbl9kZWZhdWx0LmdldE1heChcbiAgICAgIGZyb21BY3Rvci53aWR0aCAvIDIgKyB0b0FjdG9yLndpZHRoIC8gMixcbiAgICAgIHRleHREaW1lbnNpb25zLndpZHRoICsgMiAqIGNvbmYubm90ZU1hcmdpblxuICAgICk7XG4gICAgbm90ZU1vZGVsLnN0YXJ0eCA9IHN0YXJ0eCArIChmcm9tQWN0b3Iud2lkdGggKyBjb25mLmFjdG9yTWFyZ2luKSAvIDI7XG4gIH0gZWxzZSBpZiAobXNnLnBsYWNlbWVudCA9PT0gZGlhZ09iai5kYi5QTEFDRU1FTlQuTEVGVE9GKSB7XG4gICAgbm90ZU1vZGVsLndpZHRoID0gc2hvdWxkV3JhcCA/IGNvbW1vbl9kZWZhdWx0LmdldE1heChjb25mLndpZHRoLCB0ZXh0RGltZW5zaW9ucy53aWR0aCArIDIgKiBjb25mLm5vdGVNYXJnaW4pIDogY29tbW9uX2RlZmF1bHQuZ2V0TWF4KFxuICAgICAgZnJvbUFjdG9yLndpZHRoIC8gMiArIHRvQWN0b3Iud2lkdGggLyAyLFxuICAgICAgdGV4dERpbWVuc2lvbnMud2lkdGggKyAyICogY29uZi5ub3RlTWFyZ2luXG4gICAgKTtcbiAgICBub3RlTW9kZWwuc3RhcnR4ID0gc3RhcnR4IC0gbm90ZU1vZGVsLndpZHRoICsgKGZyb21BY3Rvci53aWR0aCAtIGNvbmYuYWN0b3JNYXJnaW4pIC8gMjtcbiAgfSBlbHNlIGlmIChtc2cudG8gPT09IG1zZy5mcm9tKSB7XG4gICAgdGV4dERpbWVuc2lvbnMgPSB1dGlsc19kZWZhdWx0LmNhbGN1bGF0ZVRleHREaW1lbnNpb25zKFxuICAgICAgc2hvdWxkV3JhcCA/IHV0aWxzX2RlZmF1bHQud3JhcExhYmVsKG1zZy5tZXNzYWdlLCBjb21tb25fZGVmYXVsdC5nZXRNYXgoY29uZi53aWR0aCwgZnJvbUFjdG9yLndpZHRoKSwgbm90ZUZvbnQoY29uZikpIDogbXNnLm1lc3NhZ2UsXG4gICAgICBub3RlRm9udChjb25mKVxuICAgICk7XG4gICAgbm90ZU1vZGVsLndpZHRoID0gc2hvdWxkV3JhcCA/IGNvbW1vbl9kZWZhdWx0LmdldE1heChjb25mLndpZHRoLCBmcm9tQWN0b3Iud2lkdGgpIDogY29tbW9uX2RlZmF1bHQuZ2V0TWF4KGZyb21BY3Rvci53aWR0aCwgY29uZi53aWR0aCwgdGV4dERpbWVuc2lvbnMud2lkdGggKyAyICogY29uZi5ub3RlTWFyZ2luKTtcbiAgICBub3RlTW9kZWwuc3RhcnR4ID0gc3RhcnR4ICsgKGZyb21BY3Rvci53aWR0aCAtIG5vdGVNb2RlbC53aWR0aCkgLyAyO1xuICB9IGVsc2Uge1xuICAgIG5vdGVNb2RlbC53aWR0aCA9IE1hdGguYWJzKHN0YXJ0eCArIGZyb21BY3Rvci53aWR0aCAvIDIgLSAoc3RvcHggKyB0b0FjdG9yLndpZHRoIC8gMikpICsgY29uZi5hY3Rvck1hcmdpbjtcbiAgICBub3RlTW9kZWwuc3RhcnR4ID0gc3RhcnR4IDwgc3RvcHggPyBzdGFydHggKyBmcm9tQWN0b3Iud2lkdGggLyAyIC0gY29uZi5hY3Rvck1hcmdpbiAvIDIgOiBzdG9weCArIHRvQWN0b3Iud2lkdGggLyAyIC0gY29uZi5hY3Rvck1hcmdpbiAvIDI7XG4gIH1cbiAgaWYgKHNob3VsZFdyYXApIHtcbiAgICBub3RlTW9kZWwubWVzc2FnZSA9IHV0aWxzX2RlZmF1bHQud3JhcExhYmVsKFxuICAgICAgbXNnLm1lc3NhZ2UsXG4gICAgICBub3RlTW9kZWwud2lkdGggLSAyICogY29uZi53cmFwUGFkZGluZyxcbiAgICAgIG5vdGVGb250KGNvbmYpXG4gICAgKTtcbiAgfVxuICBsb2cuZGVidWcoXG4gICAgYE5NOlske25vdGVNb2RlbC5zdGFydHh9LCR7bm90ZU1vZGVsLnN0b3B4fSwke25vdGVNb2RlbC5zdGFydHl9LCR7bm90ZU1vZGVsLnN0b3B5fToke25vdGVNb2RlbC53aWR0aH0sJHtub3RlTW9kZWwuaGVpZ2h0fT0ke21zZy5tZXNzYWdlfV1gXG4gICk7XG4gIHJldHVybiBub3RlTW9kZWw7XG59LCBcImJ1aWxkTm90ZU1vZGVsXCIpO1xudmFyIENFTlRSQUxfQ09OTkVDVElPTl9CQVNFX09GRlNFVCA9IDQ7XG52YXIgQ0VOVFJBTF9DT05ORUNUSU9OX0JJRElSRUNUSU9OQUxfT0ZGU0VUID0gNjtcbnZhciBoYXNDZW50cmFsQ29ubmVjdGlvbiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obXNnLCBkaWFnT2JqKSB7XG4gIGNvbnN0IHsgQ0VOVFJBTF9DT05ORUNUSU9OLCBDRU5UUkFMX0NPTk5FQ1RJT05fUkVWRVJTRSwgQ0VOVFJBTF9DT05ORUNUSU9OX0RVQUwgfSA9IGRpYWdPYmouZGIuTElORVRZUEU7XG4gIHJldHVybiBbQ0VOVFJBTF9DT05ORUNUSU9OLCBDRU5UUkFMX0NPTk5FQ1RJT05fUkVWRVJTRSwgQ0VOVFJBTF9DT05ORUNUSU9OX0RVQUxdLmluY2x1ZGVzKFxuICAgIG1zZy5jZW50cmFsQ29ubmVjdGlvblxuICApO1xufSwgXCJoYXNDZW50cmFsQ29ubmVjdGlvblwiKTtcbnZhciBjYWxjdWxhdGVDZW50cmFsQ29ubmVjdGlvbk9mZnNldCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obXNnLCBkaWFnT2JqLCBpc0Fycm93VG9SaWdodCkge1xuICBjb25zdCB7XG4gICAgQ0VOVFJBTF9DT05ORUNUSU9OX1JFVkVSU0UsXG4gICAgQ0VOVFJBTF9DT05ORUNUSU9OX0RVQUwsXG4gICAgQklESVJFQ1RJT05BTF9TT0xJRCxcbiAgICBCSURJUkVDVElPTkFMX0RPVFRFRFxuICB9ID0gZGlhZ09iai5kYi5MSU5FVFlQRTtcbiAgbGV0IG9mZnNldCA9IDA7XG4gIGlmIChtc2cuY2VudHJhbENvbm5lY3Rpb24gPT09IENFTlRSQUxfQ09OTkVDVElPTl9SRVZFUlNFIHx8IG1zZy5jZW50cmFsQ29ubmVjdGlvbiA9PT0gQ0VOVFJBTF9DT05ORUNUSU9OX0RVQUwpIHtcbiAgICBvZmZzZXQgKz0gQ0VOVFJBTF9DT05ORUNUSU9OX0JBU0VfT0ZGU0VUO1xuICB9XG4gIGlmICgobXNnLmNlbnRyYWxDb25uZWN0aW9uID09PSBDRU5UUkFMX0NPTk5FQ1RJT05fUkVWRVJTRSB8fCBtc2cuY2VudHJhbENvbm5lY3Rpb24gPT09IENFTlRSQUxfQ09OTkVDVElPTl9EVUFMKSAmJiAobXNnLnR5cGUgPT09IEJJRElSRUNUSU9OQUxfU09MSUQgfHwgbXNnLnR5cGUgPT09IEJJRElSRUNUSU9OQUxfRE9UVEVEKSkge1xuICAgIG9mZnNldCArPSBpc0Fycm93VG9SaWdodCA/IDAgOiAtQ0VOVFJBTF9DT05ORUNUSU9OX0JJRElSRUNUSU9OQUxfT0ZGU0VUO1xuICB9XG4gIHJldHVybiBvZmZzZXQ7XG59LCBcImNhbGN1bGF0ZUNlbnRyYWxDb25uZWN0aW9uT2Zmc2V0XCIpO1xudmFyIGlzUmV2ZXJzZUFycm93VHlwZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obXNnLCBkaWFnT2JqKSB7XG4gIGNvbnN0IHtcbiAgICBTT0xJRF9BUlJPV19UT1BfUkVWRVJTRSxcbiAgICBTT0xJRF9BUlJPV19UT1BfUkVWRVJTRV9ET1RURUQsXG4gICAgU09MSURfQVJST1dfQk9UVE9NX1JFVkVSU0UsXG4gICAgU09MSURfQVJST1dfQk9UVE9NX1JFVkVSU0VfRE9UVEVELFxuICAgIFNUSUNLX0FSUk9XX1RPUF9SRVZFUlNFLFxuICAgIFNUSUNLX0FSUk9XX1RPUF9SRVZFUlNFX0RPVFRFRCxcbiAgICBTVElDS19BUlJPV19CT1RUT01fUkVWRVJTRSxcbiAgICBTVElDS19BUlJPV19CT1RUT01fUkVWRVJTRV9ET1RURURcbiAgfSA9IGRpYWdPYmouZGIuTElORVRZUEU7XG4gIHJldHVybiBbXG4gICAgU09MSURfQVJST1dfVE9QX1JFVkVSU0UsXG4gICAgU09MSURfQVJST1dfVE9QX1JFVkVSU0VfRE9UVEVELFxuICAgIFNPTElEX0FSUk9XX0JPVFRPTV9SRVZFUlNFLFxuICAgIFNPTElEX0FSUk9XX0JPVFRPTV9SRVZFUlNFX0RPVFRFRCxcbiAgICBTVElDS19BUlJPV19UT1BfUkVWRVJTRSxcbiAgICBTVElDS19BUlJPV19UT1BfUkVWRVJTRV9ET1RURUQsXG4gICAgU1RJQ0tfQVJST1dfQk9UVE9NX1JFVkVSU0UsXG4gICAgU1RJQ0tfQVJST1dfQk9UVE9NX1JFVkVSU0VfRE9UVEVEXG4gIF0uaW5jbHVkZXMobXNnLnR5cGUpO1xufSwgXCJpc1JldmVyc2VBcnJvd1R5cGVcIik7XG52YXIgaXNCaWRpcmVjdGlvbmFsQXJyb3dUeXBlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihtc2csIGRpYWdPYmopIHtcbiAgY29uc3QgeyBCSURJUkVDVElPTkFMX1NPTElELCBCSURJUkVDVElPTkFMX0RPVFRFRCB9ID0gZGlhZ09iai5kYi5MSU5FVFlQRTtcbiAgcmV0dXJuIFtCSURJUkVDVElPTkFMX1NPTElELCBCSURJUkVDVElPTkFMX0RPVFRFRF0uaW5jbHVkZXMobXNnLnR5cGUpO1xufSwgXCJpc0JpZGlyZWN0aW9uYWxBcnJvd1R5cGVcIik7XG52YXIgYnVpbGRNZXNzYWdlTW9kZWwgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKG1zZywgYWN0b3JzLCBkaWFnT2JqKSB7XG4gIGNvbnN0IHsgbG9vayB9ID0gZ2V0Q29uZmlnMigpO1xuICBpZiAoIVtcbiAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElEX09QRU4sXG4gICAgZGlhZ09iai5kYi5MSU5FVFlQRS5ET1RURURfT1BFTixcbiAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElELFxuICAgIGRpYWdPYmouZGIuTElORVRZUEUuU09MSURfVE9QLFxuICAgIGRpYWdPYmouZGIuTElORVRZUEUuU09MSURfQk9UVE9NLFxuICAgIGRpYWdPYmouZGIuTElORVRZUEUuU1RJQ0tfVE9QLFxuICAgIGRpYWdPYmouZGIuTElORVRZUEUuU1RJQ0tfQk9UVE9NLFxuICAgIGRpYWdPYmouZGIuTElORVRZUEUuU09MSURfVE9QX0RPVFRFRCxcbiAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElEX0JPVFRPTV9ET1RURUQsXG4gICAgZGlhZ09iai5kYi5MSU5FVFlQRS5TVElDS19UT1BfRE9UVEVELFxuICAgIGRpYWdPYmouZGIuTElORVRZUEUuU1RJQ0tfQk9UVE9NX0RPVFRFRCxcbiAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElEX0FSUk9XX1RPUF9SRVZFUlNFLFxuICAgIGRpYWdPYmouZGIuTElORVRZUEUuU09MSURfQVJST1dfQk9UVE9NX1JFVkVSU0UsXG4gICAgZGlhZ09iai5kYi5MSU5FVFlQRS5TVElDS19BUlJPV19UT1BfUkVWRVJTRSxcbiAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLlNUSUNLX0FSUk9XX0JPVFRPTV9SRVZFUlNFLFxuICAgIGRpYWdPYmouZGIuTElORVRZUEUuU09MSURfQVJST1dfVE9QX1JFVkVSU0VfRE9UVEVELFxuICAgIGRpYWdPYmouZGIuTElORVRZUEUuU09MSURfQVJST1dfQk9UVE9NX1JFVkVSU0VfRE9UVEVELFxuICAgIGRpYWdPYmouZGIuTElORVRZUEUuU1RJQ0tfQVJST1dfVE9QX1JFVkVSU0VfRE9UVEVELFxuICAgIGRpYWdPYmouZGIuTElORVRZUEUuU1RJQ0tfQVJST1dfQk9UVE9NX1JFVkVSU0VfRE9UVEVELFxuICAgIGRpYWdPYmouZGIuTElORVRZUEUuRE9UVEVELFxuICAgIGRpYWdPYmouZGIuTElORVRZUEUuU09MSURfQ1JPU1MsXG4gICAgZGlhZ09iai5kYi5MSU5FVFlQRS5ET1RURURfQ1JPU1MsXG4gICAgZGlhZ09iai5kYi5MSU5FVFlQRS5TT0xJRF9QT0lOVCxcbiAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLkRPVFRFRF9QT0lOVCxcbiAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLkJJRElSRUNUSU9OQUxfU09MSUQsXG4gICAgZGlhZ09iai5kYi5MSU5FVFlQRS5CSURJUkVDVElPTkFMX0RPVFRFRFxuICBdLmluY2x1ZGVzKG1zZy50eXBlKSkge1xuICAgIHJldHVybiB7fTtcbiAgfVxuICBjb25zdCBbZnJvbUxlZnQsIGZyb21SaWdodF0gPSBhY3RpdmF0aW9uQm91bmRzKG1zZy5mcm9tLCBhY3RvcnMpO1xuICBjb25zdCBbdG9MZWZ0LCB0b1JpZ2h0XSA9IGFjdGl2YXRpb25Cb3VuZHMobXNnLnRvLCBhY3RvcnMpO1xuICBjb25zdCBpc0Fycm93VG9SaWdodCA9IGZyb21MZWZ0IDw9IHRvTGVmdDtcbiAgbGV0IHN0YXJ0eCA9IGlzQXJyb3dUb1JpZ2h0ID8gZnJvbVJpZ2h0IDogZnJvbUxlZnQ7XG4gIGxldCBzdG9weCA9IGlzQXJyb3dUb1JpZ2h0ID8gdG9MZWZ0IDogdG9SaWdodDtcbiAgaWYgKGxvb2sgPT09IFwibmVvXCIpIHtcbiAgICBjb25zdCBvZmZzZXQgPSAzO1xuICAgIGlmIChtc2cudHlwZSAhPT0gZGlhZ09iai5kYi5MSU5FVFlQRS5TT0xJRF9PUEVOKSB7XG4gICAgICBzdG9weCArPSBpc0Fycm93VG9SaWdodCA/IC1vZmZzZXQgOiBvZmZzZXQ7XG4gICAgfVxuICAgIGlmIChtc2cudHlwZSA9PT0gZGlhZ09iai5kYi5MSU5FVFlQRS5CSURJUkVDVElPTkFMX1NPTElEIHx8IG1zZy50eXBlID09PSBkaWFnT2JqLmRiLkxJTkVUWVBFLkJJRElSRUNUSU9OQUxfRE9UVEVEKSB7XG4gICAgICBzdGFydHggKz0gaXNBcnJvd1RvUmlnaHQgPyBvZmZzZXQgOiAtb2Zmc2V0O1xuICAgIH1cbiAgfVxuICBzdGFydHggKz0gY2FsY3VsYXRlQ2VudHJhbENvbm5lY3Rpb25PZmZzZXQobXNnLCBkaWFnT2JqLCBpc0Fycm93VG9SaWdodCk7XG4gIGNvbnN0IGlzQXJyb3dUb0FjdGl2YXRpb24gPSBNYXRoLmFicyh0b0xlZnQgLSB0b1JpZ2h0KSA+IDI7XG4gIGNvbnN0IGFkanVzdFZhbHVlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgodmFsdWUpID0+IHtcbiAgICByZXR1cm4gaXNBcnJvd1RvUmlnaHQgPyAtdmFsdWUgOiB2YWx1ZTtcbiAgfSwgXCJhZGp1c3RWYWx1ZVwiKTtcbiAgaWYgKG1zZy5mcm9tID09PSBtc2cudG8pIHtcbiAgICBzdG9weCA9IHN0YXJ0eDtcbiAgfSBlbHNlIHtcbiAgICBpZiAobXNnLmFjdGl2YXRlICYmICFpc0Fycm93VG9BY3RpdmF0aW9uKSB7XG4gICAgICBzdG9weCArPSBhZGp1c3RWYWx1ZShjb25mLmFjdGl2YXRpb25XaWR0aCAvIDIgLSAxKTtcbiAgICB9XG4gICAgaWYgKCFbXG4gICAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElEX09QRU4sXG4gICAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLkRPVFRFRF9PUEVOLFxuICAgICAgZGlhZ09iai5kYi5MSU5FVFlQRS5TVElDS19UT1AsXG4gICAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLlNUSUNLX0JPVFRPTSxcbiAgICAgIGRpYWdPYmouZGIuTElORVRZUEUuU1RJQ0tfVE9QX0RPVFRFRCxcbiAgICAgIGRpYWdPYmouZGIuTElORVRZUEUuU1RJQ0tfQk9UVE9NX0RPVFRFRCxcbiAgICAgIGRpYWdPYmouZGIuTElORVRZUEUuU09MSURfQVJST1dfVE9QX1JFVkVSU0VfRE9UVEVELFxuICAgICAgZGlhZ09iai5kYi5MSU5FVFlQRS5TT0xJRF9BUlJPV19CT1RUT01fUkVWRVJTRV9ET1RURUQsXG4gICAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLlNUSUNLX0FSUk9XX1RPUF9SRVZFUlNFLFxuICAgICAgZGlhZ09iai5kYi5MSU5FVFlQRS5TVElDS19BUlJPV19CT1RUT01fUkVWRVJTRSxcbiAgICAgIGRpYWdPYmouZGIuTElORVRZUEUuU1RJQ0tfQVJST1dfVE9QX1JFVkVSU0VfRE9UVEVELFxuICAgICAgZGlhZ09iai5kYi5MSU5FVFlQRS5TVElDS19BUlJPV19CT1RUT01fUkVWRVJTRV9ET1RURUQsXG4gICAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElEX0FSUk9XX1RPUF9SRVZFUlNFLFxuICAgICAgZGlhZ09iai5kYi5MSU5FVFlQRS5TT0xJRF9BUlJPV19CT1RUT01fUkVWRVJTRVxuICAgIF0uaW5jbHVkZXMobXNnLnR5cGUpKSB7XG4gICAgICBzdG9weCArPSBhZGp1c3RWYWx1ZSgzKTtcbiAgICB9XG4gICAgaWYgKFtcbiAgICAgIGRpYWdPYmouZGIuTElORVRZUEUuQklESVJFQ1RJT05BTF9TT0xJRCxcbiAgICAgIGRpYWdPYmouZGIuTElORVRZUEUuQklESVJFQ1RJT05BTF9ET1RURUQsXG4gICAgICBkaWFnT2JqLmRiLkxJTkVUWVBFLlNPTElEX0FSUk9XX1RPUF9SRVZFUlNFX0RPVFRFRCxcbiAgICAgIGRpYWdPYmouZGIuTElORVRZUEUuU09MSURfQVJST1dfQk9UVE9NX1JFVkVSU0VfRE9UVEVELFxuICAgICAgZGlhZ09iai5kYi5MSU5FVFlQRS5TT0xJRF9BUlJPV19UT1BfUkVWRVJTRSxcbiAgICAgIGRpYWdPYmouZGIuTElORVRZUEUuU09MSURfQVJST1dfQk9UVE9NX1JFVkVSU0VcbiAgICBdLmluY2x1ZGVzKG1zZy50eXBlKSkge1xuICAgICAgc3RhcnR4IC09IGFkanVzdFZhbHVlKDMpO1xuICAgIH1cbiAgfVxuICBjb25zdCBhbGxCb3VuZHMgPSBbZnJvbUxlZnQsIGZyb21SaWdodCwgdG9MZWZ0LCB0b1JpZ2h0XTtcbiAgY29uc3QgYm91bmRlZFdpZHRoID0gTWF0aC5hYnMoc3RhcnR4IC0gc3RvcHgpO1xuICBpZiAobXNnLndyYXAgJiYgbXNnLm1lc3NhZ2UpIHtcbiAgICBtc2cubWVzc2FnZSA9IHV0aWxzX2RlZmF1bHQud3JhcExhYmVsKFxuICAgICAgbXNnLm1lc3NhZ2UsXG4gICAgICBjb21tb25fZGVmYXVsdC5nZXRNYXgoYm91bmRlZFdpZHRoICsgMiAqIGNvbmYud3JhcFBhZGRpbmcsIGNvbmYud2lkdGgpLFxuICAgICAgbWVzc2FnZUZvbnQoY29uZilcbiAgICApO1xuICB9XG4gIGNvbnN0IG1zZ0RpbXMgPSB1dGlsc19kZWZhdWx0LmNhbGN1bGF0ZVRleHREaW1lbnNpb25zKG1zZy5tZXNzYWdlLCBtZXNzYWdlRm9udChjb25mKSk7XG4gIHJldHVybiB7XG4gICAgd2lkdGg6IGNvbW1vbl9kZWZhdWx0LmdldE1heChcbiAgICAgIG1zZy53cmFwID8gMCA6IG1zZ0RpbXMud2lkdGggKyAyICogY29uZi53cmFwUGFkZGluZyxcbiAgICAgIGJvdW5kZWRXaWR0aCArIDIgKiBjb25mLndyYXBQYWRkaW5nLFxuICAgICAgY29uZi53aWR0aFxuICAgICksXG4gICAgaGVpZ2h0OiAwLFxuICAgIHN0YXJ0eCxcbiAgICBzdG9weCxcbiAgICBzdGFydHk6IDAsXG4gICAgc3RvcHk6IDAsXG4gICAgbWVzc2FnZTogbXNnLm1lc3NhZ2UsXG4gICAgdHlwZTogbXNnLnR5cGUsXG4gICAgd3JhcDogbXNnLndyYXAsXG4gICAgZnJvbUJvdW5kczogTWF0aC5taW4uYXBwbHkobnVsbCwgYWxsQm91bmRzKSxcbiAgICB0b0JvdW5kczogTWF0aC5tYXguYXBwbHkobnVsbCwgYWxsQm91bmRzKVxuICB9O1xufSwgXCJidWlsZE1lc3NhZ2VNb2RlbFwiKTtcbnZhciBjYWxjdWxhdGVMb29wQm91bmRzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyBmdW5jdGlvbihtZXNzYWdlcywgYWN0b3JzLCBfbWF4V2lkdGhQZXJBY3RvciwgZGlhZ09iaikge1xuICBjb25zdCBsb29wcyA9IHt9O1xuICBjb25zdCBzdGFjayA9IFtdO1xuICBsZXQgY3VycmVudCwgbm90ZU1vZGVsLCBtc2dNb2RlbDtcbiAgZm9yIChjb25zdCBtc2cgb2YgbWVzc2FnZXMpIHtcbiAgICBzd2l0Y2ggKG1zZy50eXBlKSB7XG4gICAgICBjYXNlIGRpYWdPYmouZGIuTElORVRZUEUuTE9PUF9TVEFSVDpcbiAgICAgIGNhc2UgZGlhZ09iai5kYi5MSU5FVFlQRS5BTFRfU1RBUlQ6XG4gICAgICBjYXNlIGRpYWdPYmouZGIuTElORVRZUEUuT1BUX1NUQVJUOlxuICAgICAgY2FzZSBkaWFnT2JqLmRiLkxJTkVUWVBFLlBBUl9TVEFSVDpcbiAgICAgIGNhc2UgZGlhZ09iai5kYi5MSU5FVFlQRS5QQVJfT1ZFUl9TVEFSVDpcbiAgICAgIGNhc2UgZGlhZ09iai5kYi5MSU5FVFlQRS5DUklUSUNBTF9TVEFSVDpcbiAgICAgIGNhc2UgZGlhZ09iai5kYi5MSU5FVFlQRS5CUkVBS19TVEFSVDpcbiAgICAgICAgc3RhY2sucHVzaCh7XG4gICAgICAgICAgaWQ6IG1zZy5pZCxcbiAgICAgICAgICBtc2c6IG1zZy5tZXNzYWdlLFxuICAgICAgICAgIGZyb206IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSLFxuICAgICAgICAgIHRvOiBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUixcbiAgICAgICAgICB3aWR0aDogMFxuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRpYWdPYmouZGIuTElORVRZUEUuQUxUX0VMU0U6XG4gICAgICBjYXNlIGRpYWdPYmouZGIuTElORVRZUEUuUEFSX0FORDpcbiAgICAgIGNhc2UgZGlhZ09iai5kYi5MSU5FVFlQRS5DUklUSUNBTF9PUFRJT046XG4gICAgICAgIGlmIChtc2cubWVzc2FnZSkge1xuICAgICAgICAgIGN1cnJlbnQgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgICBsb29wc1tjdXJyZW50LmlkXSA9IGN1cnJlbnQ7XG4gICAgICAgICAgbG9vcHNbbXNnLmlkXSA9IGN1cnJlbnQ7XG4gICAgICAgICAgc3RhY2sucHVzaChjdXJyZW50KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgZGlhZ09iai5kYi5MSU5FVFlQRS5MT09QX0VORDpcbiAgICAgIGNhc2UgZGlhZ09iai5kYi5MSU5FVFlQRS5BTFRfRU5EOlxuICAgICAgY2FzZSBkaWFnT2JqLmRiLkxJTkVUWVBFLk9QVF9FTkQ6XG4gICAgICBjYXNlIGRpYWdPYmouZGIuTElORVRZUEUuUEFSX0VORDpcbiAgICAgIGNhc2UgZGlhZ09iai5kYi5MSU5FVFlQRS5DUklUSUNBTF9FTkQ6XG4gICAgICBjYXNlIGRpYWdPYmouZGIuTElORVRZUEUuQlJFQUtfRU5EOlxuICAgICAgICBjdXJyZW50ID0gc3RhY2sucG9wKCk7XG4gICAgICAgIGxvb3BzW2N1cnJlbnQuaWRdID0gY3VycmVudDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRpYWdPYmouZGIuTElORVRZUEUuQUNUSVZFX1NUQVJUOlxuICAgICAgICB7XG4gICAgICAgICAgY29uc3QgYWN0b3JSZWN0ID0gYWN0b3JzLmdldChtc2cuZnJvbSA/IG1zZy5mcm9tIDogbXNnLnRvLmFjdG9yKTtcbiAgICAgICAgICBjb25zdCBzdGFja2VkU2l6ZSA9IGFjdG9yQWN0aXZhdGlvbnMobXNnLmZyb20gPyBtc2cuZnJvbSA6IG1zZy50by5hY3RvcikubGVuZ3RoO1xuICAgICAgICAgIGNvbnN0IHggPSBhY3RvclJlY3QueCArIGFjdG9yUmVjdC53aWR0aCAvIDIgKyAoc3RhY2tlZFNpemUgLSAxKSAqIGNvbmYuYWN0aXZhdGlvbldpZHRoIC8gMjtcbiAgICAgICAgICBjb25zdCB0b0FkZCA9IHtcbiAgICAgICAgICAgIHN0YXJ0eDogeCxcbiAgICAgICAgICAgIHN0b3B4OiB4ICsgY29uZi5hY3RpdmF0aW9uV2lkdGgsXG4gICAgICAgICAgICBhY3RvcjogbXNnLmZyb20sXG4gICAgICAgICAgICBlbmFibGVkOiB0cnVlXG4gICAgICAgICAgfTtcbiAgICAgICAgICBib3VuZHMuYWN0aXZhdGlvbnMucHVzaCh0b0FkZCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIGRpYWdPYmouZGIuTElORVRZUEUuQUNUSVZFX0VORDpcbiAgICAgICAge1xuICAgICAgICAgIGNvbnN0IGxhc3RBY3RvckFjdGl2YXRpb25JZHggPSBib3VuZHMuYWN0aXZhdGlvbnMubWFwKChhKSA9PiBhLmFjdG9yKS5sYXN0SW5kZXhPZihtc2cuZnJvbSk7XG4gICAgICAgICAgYm91bmRzLmFjdGl2YXRpb25zLnNwbGljZShsYXN0QWN0b3JBY3RpdmF0aW9uSWR4LCAxKS5zcGxpY2UoMCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNvbnN0IGlzTm90ZSA9IG1zZy5wbGFjZW1lbnQgIT09IHZvaWQgMDtcbiAgICBpZiAoaXNOb3RlKSB7XG4gICAgICBub3RlTW9kZWwgPSBhd2FpdCBidWlsZE5vdGVNb2RlbChtc2csIGFjdG9ycywgZGlhZ09iaik7XG4gICAgICBtc2cubm90ZU1vZGVsID0gbm90ZU1vZGVsO1xuICAgICAgc3RhY2suZm9yRWFjaCgoc3RrKSA9PiB7XG4gICAgICAgIGN1cnJlbnQgPSBzdGs7XG4gICAgICAgIGN1cnJlbnQuZnJvbSA9IGNvbW1vbl9kZWZhdWx0LmdldE1pbihjdXJyZW50LmZyb20sIG5vdGVNb2RlbC5zdGFydHgpO1xuICAgICAgICBjdXJyZW50LnRvID0gY29tbW9uX2RlZmF1bHQuZ2V0TWF4KGN1cnJlbnQudG8sIG5vdGVNb2RlbC5zdGFydHggKyBub3RlTW9kZWwud2lkdGgpO1xuICAgICAgICBjdXJyZW50LndpZHRoID0gY29tbW9uX2RlZmF1bHQuZ2V0TWF4KGN1cnJlbnQud2lkdGgsIE1hdGguYWJzKGN1cnJlbnQuZnJvbSAtIGN1cnJlbnQudG8pKSAtIGNvbmYubGFiZWxCb3hXaWR0aDtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBtc2dNb2RlbCA9IGJ1aWxkTWVzc2FnZU1vZGVsKG1zZywgYWN0b3JzLCBkaWFnT2JqKTtcbiAgICAgIG1zZy5tc2dNb2RlbCA9IG1zZ01vZGVsO1xuICAgICAgaWYgKG1zZ01vZGVsLnN0YXJ0eCAmJiBtc2dNb2RlbC5zdG9weCAmJiBzdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgIHN0YWNrLmZvckVhY2goKHN0aykgPT4ge1xuICAgICAgICAgIGN1cnJlbnQgPSBzdGs7XG4gICAgICAgICAgaWYgKG1zZ01vZGVsLnN0YXJ0eCA9PT0gbXNnTW9kZWwuc3RvcHgpIHtcbiAgICAgICAgICAgIGNvbnN0IGZyb20gPSBhY3RvcnMuZ2V0KG1zZy5mcm9tKTtcbiAgICAgICAgICAgIGNvbnN0IHRvID0gYWN0b3JzLmdldChtc2cudG8pO1xuICAgICAgICAgICAgY3VycmVudC5mcm9tID0gY29tbW9uX2RlZmF1bHQuZ2V0TWluKFxuICAgICAgICAgICAgICBmcm9tLnggLSBtc2dNb2RlbC53aWR0aCAvIDIsXG4gICAgICAgICAgICAgIGZyb20ueCAtIGZyb20ud2lkdGggLyAyLFxuICAgICAgICAgICAgICBjdXJyZW50LmZyb21cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjdXJyZW50LnRvID0gY29tbW9uX2RlZmF1bHQuZ2V0TWF4KFxuICAgICAgICAgICAgICB0by54ICsgbXNnTW9kZWwud2lkdGggLyAyLFxuICAgICAgICAgICAgICB0by54ICsgZnJvbS53aWR0aCAvIDIsXG4gICAgICAgICAgICAgIGN1cnJlbnQudG9cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjdXJyZW50LndpZHRoID0gY29tbW9uX2RlZmF1bHQuZ2V0TWF4KGN1cnJlbnQud2lkdGgsIE1hdGguYWJzKGN1cnJlbnQudG8gLSBjdXJyZW50LmZyb20pKSAtIGNvbmYubGFiZWxCb3hXaWR0aDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY3VycmVudC5mcm9tID0gY29tbW9uX2RlZmF1bHQuZ2V0TWluKG1zZ01vZGVsLnN0YXJ0eCwgY3VycmVudC5mcm9tKTtcbiAgICAgICAgICAgIGN1cnJlbnQudG8gPSBjb21tb25fZGVmYXVsdC5nZXRNYXgobXNnTW9kZWwuc3RvcHgsIGN1cnJlbnQudG8pO1xuICAgICAgICAgICAgY3VycmVudC53aWR0aCA9IGNvbW1vbl9kZWZhdWx0LmdldE1heChjdXJyZW50LndpZHRoLCBtc2dNb2RlbC53aWR0aCkgLSBjb25mLmxhYmVsQm94V2lkdGg7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgYm91bmRzLmFjdGl2YXRpb25zID0gW107XG4gIGxvZy5kZWJ1ZyhcIkxvb3AgdHlwZSB3aWR0aHM6XCIsIGxvb3BzKTtcbiAgcmV0dXJuIGxvb3BzO1xufSwgXCJjYWxjdWxhdGVMb29wQm91bmRzXCIpO1xudmFyIHNlcXVlbmNlUmVuZGVyZXJfZGVmYXVsdCA9IHtcbiAgYm91bmRzLFxuICBkcmF3QWN0b3JzLFxuICBkcmF3QWN0b3JzUG9wdXAsXG4gIHNldENvbmYsXG4gIGRyYXdcbn07XG5cbi8vIHNyYy9kaWFncmFtcy9zZXF1ZW5jZS9zZXF1ZW5jZURpYWdyYW0udHNcbnZhciBkaWFncmFtID0ge1xuICBwYXJzZXI6IHNlcXVlbmNlRGlhZ3JhbV9kZWZhdWx0LFxuICBnZXQgZGIoKSB7XG4gICAgcmV0dXJuIG5ldyBTZXF1ZW5jZURCKCk7XG4gIH0sXG4gIHJlbmRlcmVyOiBzZXF1ZW5jZVJlbmRlcmVyX2RlZmF1bHQsXG4gIHN0eWxlczogc3R5bGVzX2RlZmF1bHQsXG4gIGluaXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGNuZikgPT4ge1xuICAgIGlmICghY25mLnNlcXVlbmNlKSB7XG4gICAgICBjbmYuc2VxdWVuY2UgPSB7fTtcbiAgICB9XG4gICAgaWYgKGNuZi53cmFwKSB7XG4gICAgICBjbmYuc2VxdWVuY2Uud3JhcCA9IGNuZi53cmFwO1xuICAgICAgc2V0Q29uZmlnKHsgc2VxdWVuY2U6IHsgd3JhcDogY25mLndyYXAgfSB9KTtcbiAgICB9XG4gIH0sIFwiaW5pdFwiKVxufTtcbmV4cG9ydCB7XG4gIGRpYWdyYW1cbn07XG4iCiAgXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQSsyREE7QUFqMERBLElBQUksU0FBVSxRQUFRLEdBQUc7QUFBQSxFQUN2QixJQUFJLG9CQUFvQixPQUFPLFFBQVEsQ0FBQyxHQUFHLEdBQUcsSUFBSSxHQUFHO0FBQUEsSUFDbkQsS0FBSyxLQUFLLE1BQU0sQ0FBQyxHQUFHLElBQUksRUFBRSxPQUFRLEtBQUssR0FBRyxFQUFFLE1BQU07QUFBQTtBQUFBLElBQ2xELE9BQU87QUFBQSxLQUNOLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLEdBQUc7QUFBQSxFQUMxcUQsSUFBSSxVQUFVO0FBQUEsSUFDWix1QkFBdUIsT0FBTyxTQUFTLEtBQUssR0FBRyxJQUM1QyxPQUFPO0FBQUEsSUFDVixJQUFJLENBQUM7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QkFBNkIsSUFBSSwwQkFBMEIsSUFBSSw2QkFBNkIsSUFBSSwyQkFBMkIsSUFBSSw4QkFBOEIsSUFBSSwyQkFBMkIsSUFBSSw4QkFBOEIsSUFBSSxrQ0FBa0MsSUFBSSxxQ0FBcUMsSUFBSSxrQ0FBa0MsSUFBSSxxQ0FBcUMsSUFBSSw2QkFBNkIsSUFBSSxnQkFBZ0IsSUFBSSw4QkFBOEIsS0FBSyxlQUFlLEtBQUssZ0JBQWdCLEtBQUssZUFBZSxLQUFLLGdCQUFnQixLQUFLLE1BQU07QUFBQSxJQUNyZ0QsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFBQSxJQUM1NUIsK0JBQStCLE9BQU8sU0FBUyxTQUFTLENBQUMsUUFBUSxRQUFRLFVBQVUsSUFBSSxTQUFTLElBQUksSUFBSTtBQUFBLE1BQ3RHLElBQUksS0FBSyxHQUFHLFNBQVM7QUFBQSxNQUNyQixRQUFRO0FBQUEsYUFDRDtBQUFBLFVBQ0gsR0FBRyxNQUFNLEdBQUcsR0FBRztBQUFBLFVBQ2YsT0FBTyxHQUFHO0FBQUEsVUFDVjtBQUFBLGFBQ0c7QUFBQSxhQUNBO0FBQUEsVUFDSCxLQUFLLElBQUksQ0FBQztBQUFBLFVBQ1Y7QUFBQSxhQUNHO0FBQUEsYUFDQTtBQUFBLFVBQ0gsR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEdBQUc7QUFBQSxVQUN0QixLQUFLLElBQUksR0FBRyxLQUFLO0FBQUEsVUFDakI7QUFBQSxhQUNHO0FBQUEsYUFDQTtBQUFBLGFBQ0E7QUFBQSxhQUNBO0FBQUEsVUFDSCxLQUFLLElBQUksR0FBRztBQUFBLFVBQ1o7QUFBQSxhQUNHO0FBQUEsYUFDQTtBQUFBLGFBQ0E7QUFBQSxVQUNILEtBQUssSUFBSSxDQUFDO0FBQUEsVUFDVjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsSUFBSSxPQUFPO0FBQUEsVUFDZCxLQUFLLElBQUksR0FBRztBQUFBLFVBQ1o7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLEtBQUssR0FBRyxRQUFRLEVBQUUsTUFBTSxZQUFZLFNBQVMsR0FBRyxhQUFhLEdBQUcsS0FBSyxFQUFFLEVBQUUsQ0FBQztBQUFBLFVBQzdFLEdBQUcsS0FBSyxHQUFHLEtBQUssRUFBRSxNQUFNLFVBQVUsU0FBUyxHQUFHLEtBQUssR0FBRyxDQUFDO0FBQUEsVUFDdkQsS0FBSyxJQUFJLEdBQUcsS0FBSztBQUFBLFVBQ2pCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEVBQUUsTUFBTSxpQkFBaUIsZUFBZSxPQUFPLEdBQUcsS0FBSyxFQUFFLEdBQUcsbUJBQW1CLE9BQU8sR0FBRyxLQUFLLEVBQUUsR0FBRyxpQkFBaUIsTUFBTSxZQUFZLEdBQUcsU0FBUyxXQUFXO0FBQUEsVUFDdEs7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksRUFBRSxNQUFNLGlCQUFpQixlQUFlLE9BQU8sR0FBRyxLQUFLLEVBQUUsR0FBRyxtQkFBbUIsR0FBRyxpQkFBaUIsTUFBTSxZQUFZLEdBQUcsU0FBUyxXQUFXO0FBQUEsVUFDcko7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksRUFBRSxNQUFNLGlCQUFpQixpQkFBaUIsT0FBTyxZQUFZLEdBQUcsU0FBUyxXQUFXO0FBQUEsVUFDN0Y7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksRUFBRSxNQUFNLGlCQUFpQixpQkFBaUIsTUFBTSxZQUFZLEdBQUcsU0FBUyxXQUFXO0FBQUEsVUFDNUY7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksRUFBRSxNQUFNLGVBQWUsWUFBWSxHQUFHLFNBQVMsY0FBYyxPQUFPLEdBQUcsS0FBSyxHQUFHLE1BQU07QUFBQSxVQUM5RjtBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxFQUFFLE1BQU0sYUFBYSxZQUFZLEdBQUcsU0FBUyxZQUFZLE9BQU8sR0FBRyxLQUFLLEdBQUcsTUFBTTtBQUFBLFVBQzFGO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxnQkFBZ0IsR0FBRyxJQUFJLFVBQVUsQ0FBQyxDQUFDO0FBQUEsVUFDdEMsS0FBSyxJQUFJLEdBQUcsSUFBSSxVQUFVLENBQUM7QUFBQSxVQUMzQjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsZ0JBQWdCLEdBQUcsSUFBSSxVQUFVLENBQUMsQ0FBQztBQUFBLFVBQ3RDLEtBQUssSUFBSSxHQUFHLElBQUksVUFBVSxDQUFDO0FBQUEsVUFDM0I7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksR0FBRyxJQUFJLEtBQUs7QUFBQSxVQUNyQixHQUFHLFlBQVksS0FBSyxDQUFDO0FBQUEsVUFDckI7QUFBQSxhQUNHO0FBQUEsYUFDQTtBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsSUFBSSxLQUFLO0FBQUEsVUFDckIsR0FBRyxrQkFBa0IsS0FBSyxDQUFDO0FBQUEsVUFDM0I7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLEtBQUssR0FBRyxRQUFRLEVBQUUsTUFBTSxhQUFhLFVBQVUsR0FBRyxhQUFhLEdBQUcsS0FBSyxFQUFFLEdBQUcsWUFBWSxHQUFHLFNBQVMsV0FBVyxDQUFDO0FBQUEsVUFDbkgsR0FBRyxLQUFLLEdBQUcsS0FBSyxFQUFFLE1BQU0sV0FBVyxVQUFVLEdBQUcsS0FBSyxJQUFJLFlBQVksR0FBRyxTQUFTLFNBQVMsQ0FBQztBQUFBLFVBQzNGLEtBQUssSUFBSSxHQUFHLEtBQUs7QUFBQSxVQUNqQjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsS0FBSyxHQUFHLFFBQVEsRUFBRSxNQUFNLGFBQWEsT0FBTyxHQUFHLGFBQWEsR0FBRyxLQUFLLEVBQUUsR0FBRyxZQUFZLEdBQUcsU0FBUyxXQUFXLENBQUM7QUFBQSxVQUNoSCxHQUFHLEtBQUssR0FBRyxLQUFLLEVBQUUsTUFBTSxXQUFXLE9BQU8sR0FBRyxhQUFhLEdBQUcsS0FBSyxFQUFFLEdBQUcsWUFBWSxHQUFHLFNBQVMsU0FBUyxDQUFDO0FBQUEsVUFDekcsS0FBSyxJQUFJLEdBQUcsS0FBSztBQUFBLFVBQ2pCO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxLQUFLLEdBQUcsUUFBUSxFQUFFLE1BQU0sWUFBWSxTQUFTLEdBQUcsYUFBYSxHQUFHLEtBQUssRUFBRSxHQUFHLFlBQVksR0FBRyxTQUFTLFVBQVUsQ0FBQztBQUFBLFVBQ2hILEdBQUcsS0FBSyxHQUFHLEtBQUssRUFBRSxNQUFNLFVBQVUsU0FBUyxHQUFHLGFBQWEsR0FBRyxLQUFLLEVBQUUsR0FBRyxZQUFZLEdBQUcsU0FBUyxRQUFRLENBQUM7QUFBQSxVQUN6RyxLQUFLLElBQUksR0FBRyxLQUFLO0FBQUEsVUFDakI7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLEtBQUssR0FBRyxRQUFRLEVBQUUsTUFBTSxZQUFZLFNBQVMsR0FBRyxhQUFhLEdBQUcsS0FBSyxFQUFFLEdBQUcsWUFBWSxHQUFHLFNBQVMsVUFBVSxDQUFDO0FBQUEsVUFDaEgsR0FBRyxLQUFLLEdBQUcsS0FBSyxFQUFFLE1BQU0sVUFBVSxZQUFZLEdBQUcsU0FBUyxRQUFRLENBQUM7QUFBQSxVQUNuRSxLQUFLLElBQUksR0FBRyxLQUFLO0FBQUEsVUFDakI7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLEtBQUssR0FBRyxRQUFRLEVBQUUsTUFBTSxZQUFZLFNBQVMsR0FBRyxhQUFhLEdBQUcsS0FBSyxFQUFFLEdBQUcsWUFBWSxHQUFHLFNBQVMsVUFBVSxDQUFDO0FBQUEsVUFDaEgsR0FBRyxLQUFLLEdBQUcsS0FBSyxFQUFFLE1BQU0sVUFBVSxZQUFZLEdBQUcsU0FBUyxRQUFRLENBQUM7QUFBQSxVQUNuRSxLQUFLLElBQUksR0FBRyxLQUFLO0FBQUEsVUFDakI7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLEtBQUssR0FBRyxRQUFRLEVBQUUsTUFBTSxZQUFZLFNBQVMsR0FBRyxhQUFhLEdBQUcsS0FBSyxFQUFFLEdBQUcsWUFBWSxHQUFHLFNBQVMsZUFBZSxDQUFDO0FBQUEsVUFDckgsR0FBRyxLQUFLLEdBQUcsS0FBSyxFQUFFLE1BQU0sVUFBVSxZQUFZLEdBQUcsU0FBUyxRQUFRLENBQUM7QUFBQSxVQUNuRSxLQUFLLElBQUksR0FBRyxLQUFLO0FBQUEsVUFDakI7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLEtBQUssR0FBRyxRQUFRLEVBQUUsTUFBTSxpQkFBaUIsY0FBYyxHQUFHLGFBQWEsR0FBRyxLQUFLLEVBQUUsR0FBRyxZQUFZLEdBQUcsU0FBUyxlQUFlLENBQUM7QUFBQSxVQUMvSCxHQUFHLEtBQUssR0FBRyxLQUFLLEVBQUUsTUFBTSxlQUFlLFlBQVksR0FBRyxTQUFTLGFBQWEsQ0FBQztBQUFBLFVBQzdFLEtBQUssSUFBSSxHQUFHLEtBQUs7QUFBQSxVQUNqQjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsS0FBSyxHQUFHLFFBQVEsRUFBRSxNQUFNLGNBQWMsV0FBVyxHQUFHLGFBQWEsR0FBRyxLQUFLLEVBQUUsR0FBRyxZQUFZLEdBQUcsU0FBUyxZQUFZLENBQUM7QUFBQSxVQUN0SCxHQUFHLEtBQUssR0FBRyxLQUFLLEVBQUUsTUFBTSxZQUFZLFNBQVMsR0FBRyxhQUFhLEdBQUcsS0FBSyxFQUFFLEdBQUcsWUFBWSxHQUFHLFNBQVMsVUFBVSxDQUFDO0FBQUEsVUFDN0csS0FBSyxJQUFJLEdBQUcsS0FBSztBQUFBLFVBQ2pCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsS0FBSyxHQUFHLE9BQU8sQ0FBQyxFQUFFLE1BQU0sVUFBVSxZQUFZLEdBQUcsYUFBYSxHQUFHLEtBQUssRUFBRSxHQUFHLFlBQVksR0FBRyxTQUFTLGdCQUFnQixHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQUEsVUFDekk7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksR0FBRyxLQUFLLEdBQUcsT0FBTyxDQUFDLEVBQUUsTUFBTSxPQUFPLFNBQVMsR0FBRyxhQUFhLEdBQUcsS0FBSyxFQUFFLEdBQUcsWUFBWSxHQUFHLFNBQVMsUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQUEsVUFDM0g7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksR0FBRyxLQUFLLEdBQUcsT0FBTyxDQUFDLEVBQUUsTUFBTSxRQUFRLFNBQVMsR0FBRyxhQUFhLEdBQUcsS0FBSyxFQUFFLEdBQUcsWUFBWSxHQUFHLFNBQVMsU0FBUyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQUEsVUFDN0g7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLEtBQUssR0FBRyxPQUFPO0FBQUEsVUFDbEIsR0FBRyxLQUFLLEdBQUcsT0FBTztBQUFBLFVBQ2xCLEdBQUcsS0FBSyxHQUFHLGNBQWMsR0FBRyxhQUFhLEdBQUcsS0FBSyxFQUFFO0FBQUEsVUFDbkQsS0FBSyxJQUFJLEdBQUcsS0FBSztBQUFBLFVBQ2pCO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxLQUFLLEdBQUcsT0FBTztBQUFBLFVBQ2xCLEdBQUcsS0FBSyxHQUFHLE9BQU87QUFBQSxVQUNsQixLQUFLLElBQUksR0FBRyxLQUFLO0FBQUEsVUFDakI7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLEtBQUssR0FBRyxPQUFPO0FBQUEsVUFDbEIsR0FBRyxLQUFLLEdBQUcsT0FBTztBQUFBLFVBQ2xCLEdBQUcsS0FBSyxHQUFHLGNBQWMsR0FBRyxhQUFhLEdBQUcsS0FBSyxFQUFFO0FBQUEsVUFDbkQsS0FBSyxJQUFJLEdBQUcsS0FBSztBQUFBLFVBQ2pCO0FBQUEsYUFDRztBQUFBLGFBQ0E7QUFBQSxVQUNILEdBQUcsS0FBSyxHQUFHLE9BQU87QUFBQSxVQUNsQixHQUFHLEtBQUssR0FBRyxPQUFPO0FBQUEsVUFDbEIsS0FBSyxJQUFJLEdBQUcsS0FBSztBQUFBLFVBQ2pCO0FBQUEsYUFDRztBQUFBLFVBQ0gsR0FBRyxLQUFLLEdBQUcsT0FBTztBQUFBLFVBQ2xCLEtBQUssSUFBSSxHQUFHLEtBQUs7QUFBQSxVQUNqQjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsS0FBSyxHQUFHLE9BQU87QUFBQSxVQUNsQixHQUFHLEtBQUssR0FBRyxPQUFPO0FBQUEsVUFDbEIsR0FBRyxLQUFLLEdBQUcsY0FBYyxHQUFHLGFBQWEsR0FBRyxLQUFLLEVBQUU7QUFBQSxVQUNuRCxLQUFLLElBQUksR0FBRyxLQUFLO0FBQUEsVUFDakI7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLEtBQUssR0FBRyxPQUFPO0FBQUEsVUFDbEIsR0FBRyxLQUFLLEdBQUcsT0FBTztBQUFBLFVBQ2xCLEtBQUssSUFBSSxHQUFHLEtBQUs7QUFBQSxVQUNqQjtBQUFBLGFBQ0c7QUFBQSxVQUNILEdBQUcsS0FBSyxHQUFHLE9BQU87QUFBQSxVQUNsQixHQUFHLEtBQUssR0FBRyxPQUFPO0FBQUEsVUFDbEIsR0FBRyxLQUFLLEdBQUcsY0FBYyxHQUFHLGFBQWEsR0FBRyxLQUFLLEVBQUU7QUFBQSxVQUNuRCxLQUFLLElBQUksR0FBRyxLQUFLO0FBQUEsVUFDakI7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksQ0FBQyxHQUFHLEtBQUssSUFBSSxFQUFFLE1BQU0sV0FBVyxXQUFXLEdBQUcsS0FBSyxJQUFJLE9BQU8sR0FBRyxLQUFLLEdBQUcsT0FBTyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQUEsVUFDdkc7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLEtBQUssS0FBSyxDQUFDLEVBQUUsT0FBTyxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssRUFBRSxFQUFFLE1BQU0sR0FBRyxDQUFDO0FBQUEsVUFDekQsR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxHQUFHO0FBQUEsVUFDOUIsR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxHQUFHO0FBQUEsVUFDOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLElBQUksRUFBRSxNQUFNLFdBQVcsV0FBVyxHQUFHLFVBQVUsTUFBTSxPQUFPLEdBQUcsS0FBSyxHQUFHLE1BQU0sR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztBQUFBLFVBQ3BIO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLElBQUksRUFBRSxNQUFNLFlBQVksT0FBTyxHQUFHLEtBQUssR0FBRyxPQUFPLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFBQSxVQUNqRjtBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxJQUFJLEVBQUUsTUFBTSxZQUFZLE9BQU8sR0FBRyxLQUFLLEdBQUcsT0FBTyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQUEsVUFDakY7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksQ0FBQyxHQUFHLEtBQUssSUFBSSxFQUFFLE1BQU0saUJBQWlCLE9BQU8sR0FBRyxLQUFLLEdBQUcsT0FBTyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQUEsVUFDdEY7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksQ0FBQyxHQUFHLEtBQUssSUFBSSxFQUFFLE1BQU0sY0FBYyxPQUFPLEdBQUcsS0FBSyxHQUFHLE9BQU8sTUFBTSxHQUFHLElBQUksQ0FBQztBQUFBLFVBQ25GO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLElBQUksR0FBRyxHQUFHO0FBQUEsVUFDNUI7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksR0FBRztBQUFBLFVBQ1o7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksR0FBRyxVQUFVO0FBQUEsVUFDdEI7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksR0FBRyxVQUFVO0FBQUEsVUFDdEI7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUk7QUFBQSxZQUNQLEdBQUcsS0FBSztBQUFBLFlBQ1IsR0FBRyxLQUFLO0FBQUEsWUFDUixFQUFFLE1BQU0sY0FBYyxNQUFNLEdBQUcsS0FBSyxHQUFHLE9BQU8sSUFBSSxHQUFHLEtBQUssR0FBRyxPQUFPLFlBQVksR0FBRyxLQUFLLElBQUksS0FBSyxHQUFHLEtBQUssVUFBVSxLQUFLO0FBQUEsWUFDeEgsRUFBRSxNQUFNLGVBQWUsWUFBWSxHQUFHLFNBQVMsY0FBYyxPQUFPLEdBQUcsS0FBSyxHQUFHLE1BQU07QUFBQSxVQUN2RjtBQUFBLFVBQ0E7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUk7QUFBQSxZQUNQLEdBQUcsS0FBSztBQUFBLFlBQ1IsR0FBRyxLQUFLO0FBQUEsWUFDUixFQUFFLE1BQU0sY0FBYyxNQUFNLEdBQUcsS0FBSyxHQUFHLE9BQU8sSUFBSSxHQUFHLEtBQUssR0FBRyxPQUFPLFlBQVksR0FBRyxLQUFLLElBQUksS0FBSyxHQUFHLElBQUk7QUFBQSxZQUN4RyxFQUFFLE1BQU0sYUFBYSxZQUFZLEdBQUcsU0FBUyxZQUFZLE9BQU8sR0FBRyxLQUFLLEdBQUcsTUFBTTtBQUFBLFVBQ25GO0FBQUEsVUFDQTtBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSTtBQUFBLFlBQ1AsR0FBRyxLQUFLO0FBQUEsWUFDUixHQUFHLEtBQUs7QUFBQSxZQUNSLEVBQUUsTUFBTSxjQUFjLE1BQU0sR0FBRyxLQUFLLEdBQUcsT0FBTyxJQUFJLEdBQUcsS0FBSyxHQUFHLE9BQU8sWUFBWSxHQUFHLEtBQUssSUFBSSxLQUFLLEdBQUcsS0FBSyxVQUFVLE1BQU0sbUJBQW1CLEdBQUcsU0FBUyxtQkFBbUI7QUFBQSxZQUMzSyxFQUFFLE1BQU0scUJBQXFCLFlBQVksR0FBRyxTQUFTLG9CQUFvQixPQUFPLEdBQUcsS0FBSyxHQUFHLE1BQU07QUFBQSxVQUNuRztBQUFBLFVBQ0E7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUk7QUFBQSxZQUNQLEdBQUcsS0FBSztBQUFBLFlBQ1IsR0FBRyxLQUFLO0FBQUEsWUFDUixFQUFFLE1BQU0sY0FBYyxNQUFNLEdBQUcsS0FBSyxHQUFHLE9BQU8sSUFBSSxHQUFHLEtBQUssR0FBRyxPQUFPLFlBQVksR0FBRyxLQUFLLElBQUksS0FBSyxHQUFHLEtBQUssVUFBVSxPQUFPLG1CQUFtQixHQUFHLFNBQVMsMkJBQTJCO0FBQUEsWUFDcEwsRUFBRSxNQUFNLDRCQUE0QixZQUFZLEdBQUcsU0FBUyw0QkFBNEIsT0FBTyxHQUFHLEtBQUssR0FBRyxNQUFNO0FBQUEsVUFDbEg7QUFBQSxVQUNBO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJO0FBQUEsWUFDUCxHQUFHLEtBQUs7QUFBQSxZQUNSLEdBQUcsS0FBSztBQUFBLFlBQ1IsRUFBRSxNQUFNLGNBQWMsTUFBTSxHQUFHLEtBQUssR0FBRyxPQUFPLElBQUksR0FBRyxLQUFLLEdBQUcsT0FBTyxZQUFZLEdBQUcsS0FBSyxJQUFJLEtBQUssR0FBRyxLQUFLLFVBQVUsTUFBTSxtQkFBbUIsR0FBRyxTQUFTLHdCQUF3QjtBQUFBLFlBQ2hMLEVBQUUsTUFBTSxxQkFBcUIsWUFBWSxHQUFHLFNBQVMsb0JBQW9CLE9BQU8sR0FBRyxLQUFLLEdBQUcsTUFBTTtBQUFBLFlBQ2pHLEVBQUUsTUFBTSw0QkFBNEIsWUFBWSxHQUFHLFNBQVMsNEJBQTRCLE9BQU8sR0FBRyxLQUFLLEdBQUcsTUFBTTtBQUFBLFVBQ2xIO0FBQUEsVUFDQTtBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUUsTUFBTSxjQUFjLE1BQU0sR0FBRyxLQUFLLEdBQUcsT0FBTyxJQUFJLEdBQUcsS0FBSyxHQUFHLE9BQU8sWUFBWSxHQUFHLEtBQUssSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQUEsVUFDM0k7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUk7QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLE9BQU8sR0FBRyxLQUFLO0FBQUEsWUFDZixRQUFRLEdBQUc7QUFBQSxVQUNiO0FBQUEsVUFDQTtBQUFBLGFBQ0c7QUFBQSxVQUNILEtBQUssSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLO0FBQUEsVUFDekI7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksRUFBRSxNQUFNLGtCQUFrQixPQUFPLEdBQUcsSUFBSTtBQUFBLFVBQ2pEO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsU0FBUztBQUFBLFVBQ3JCO0FBQUEsYUFDRztBQUFBLFVBQ0gsS0FBSyxJQUFJLEdBQUcsYUFBYSxHQUFHLElBQUksS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQUEsVUFDbkQ7QUFBQTtBQUFBLE9BRUgsV0FBVztBQUFBLElBQ2QsT0FBTyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLElBQUksR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxLQUFLLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxLQUFLLEVBQUUsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEtBQUssRUFBRSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sS0FBSyxFQUFFLEdBQUcsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxLQUFLLEVBQUUsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsTUFBTSxLQUFLLEVBQUUsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEtBQUssS0FBSyxLQUFLLEdBQUcsRUFBRSxJQUFJLEtBQUssS0FBSyxLQUFLLEdBQUcsRUFBRSxJQUFJLEtBQUssS0FBSyxLQUFLLEdBQUcsRUFBRSxJQUFJLEtBQUssS0FBSyxLQUFLLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLEtBQUssS0FBSyxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksS0FBSyxLQUFLLEtBQUssR0FBRyxFQUFFLElBQUksS0FBSyxLQUFLLEtBQUssR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksS0FBSyxLQUFLLEtBQUssR0FBRyxFQUFFLElBQUksS0FBSyxLQUFLLEtBQUssR0FBRyxFQUFFLElBQUksS0FBSyxLQUFLLEtBQUssR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxLQUFLLEtBQUssS0FBSyxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxLQUFLLEVBQUUsR0FBRyxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEtBQUssRUFBRSxHQUFHLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sS0FBSyxFQUFFLEdBQUcsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxLQUFLLEtBQUssS0FBSyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUFBLElBQ2o2UCxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRTtBQUFBLElBQ2xULDRCQUE0QixPQUFPLFNBQVMsVUFBVSxDQUFDLEtBQUssTUFBTTtBQUFBLE1BQ2hFLElBQUksS0FBSyxhQUFhO0FBQUEsUUFDcEIsS0FBSyxNQUFNLEdBQUc7QUFBQSxNQUNoQixFQUFPO0FBQUEsUUFD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U0FBUyxRQUFRLFFBQVEsSUFBSTtBQUFBLFlBQ2xFLFFBQVEsS0FBSyxlQUFlLE9BQU8sU0FBUyxPQUFPLFFBQVEsRUFBRTtBQUFBLFlBQzdELFFBQVEsUUFBUSxlQUFlLE9BQU8sUUFBUSxPQUFPLFNBQVMsS0FBSyxJQUFJLEtBQUs7QUFBQTtBQUFBLFNBRS9FO0FBQUEsTUFDSDtBQUFBO0FBQUEsRUFFSjtBQUFBLEVBQ0EsT0FBTyxjQUFjLENBQUM7QUFBQSxFQUN0QixJQUFJLE1BQU0scUJBQXFCLEtBQUs7QUFBQSxFQUNwQyxPQUFPO0FBQUEsR0FDTixxQkFBcUI7QUFDeEIsSUFBSSwyQkFBMkI7QUFBQSxFQUM3QjtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFDRjtBQUdBLElBQUksVUFBVTtBQUFBLEVBQ1osUUFBUTtBQUFBLE1BQ0osRUFBRSxHQUFHO0FBQUEsSUFDUCxPQUFPLElBQUk7QUFBQTtBQUFBLEVBRWIsVUFBVTtBQUFBLEVBQ1YsUUFBUTtBQUFBLEVBQ1Isc0JBQXNCLE9BQU8sQ0FBQyxRQUFRO0FBQUEsSUFDcEMsSUFBSSxDQUFDLElBQUksVUFBVTtBQUFBLE1BQ2pCLElBQUksV0FBVyxDQUFDO0FBQUEsSUFDbEI7QUFBQSxJQUNBLElBQUksSUFBSSxNQUFNO0FBQUEsTUFDWixJQUFJLFNBQVMsT0FBTyxJQUFJO0FBQUEsTUFDeEIsV0FBVSxFQUFFLFVBQVUsRUFBRSxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7QUFBQSxJQUM1QztBQUFBLEtBQ0MsTUFBTTtBQUNYOyIsCiAgImRlYnVnSWQiOiAiNDNCNEExRjI1MTRFQTVCNjY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
