import {
  getDiagramElement
} from "./chunk-main-h8a1r6rk.js";
import {
  setupViewPortForSVG
} from "./chunk-main-snyzap23.js";
import {
  render
} from "./chunk-main-3qqx6zcj.js";
import {
  generateId,
  utils_default
} from "./chunk-main-vvfzntzy.js";
import {
  clear,
  common_default,
  getAccDescription,
  getAccTitle,
  getConfig2,
  getDiagramTitle,
  setAccDescription,
  setAccTitle,
  setDiagramTitle
} from "./chunk-main-aws590jt.js";
import {
  __name,
  log
} from "./chunk-main-vcnyggwp.js";

// node_modules/mermaid/dist/chunks/mermaid.core/chunk-AQP2D5EJ.mjs
var parser = function() {
  var o = /* @__PURE__ */ __name(function(k, v, o2, l) {
    for (o2 = o2 || {}, l = k.length;l--; o2[k[l]] = v)
      ;
    return o2;
  }, "o"), $V0 = [1, 2], $V1 = [1, 3], $V2 = [1, 4], $V3 = [2, 4], $V4 = [1, 9], $V5 = [1, 11], $V6 = [1, 16], $V7 = [1, 17], $V8 = [1, 18], $V9 = [1, 19], $Va = [1, 33], $Vb = [1, 20], $Vc = [1, 21], $Vd = [1, 22], $Ve = [1, 23], $Vf = [1, 24], $Vg = [1, 26], $Vh = [1, 27], $Vi = [1, 28], $Vj = [1, 29], $Vk = [1, 30], $Vl = [1, 31], $Vm = [1, 32], $Vn = [1, 35], $Vo = [1, 36], $Vp = [1, 37], $Vq = [1, 38], $Vr = [1, 34], $Vs = [1, 4, 5, 16, 17, 19, 21, 22, 24, 25, 26, 27, 28, 29, 33, 35, 37, 38, 41, 45, 48, 51, 52, 53, 54, 57], $Vt = [1, 4, 5, 14, 15, 16, 17, 19, 21, 22, 24, 25, 26, 27, 28, 29, 33, 35, 37, 38, 39, 40, 41, 45, 48, 51, 52, 53, 54, 57], $Vu = [4, 5, 16, 17, 19, 21, 22, 24, 25, 26, 27, 28, 29, 33, 35, 37, 38, 41, 45, 48, 51, 52, 53, 54, 57];
  var parser2 = {
    trace: /* @__PURE__ */ __name(function trace() {}, "trace"),
    yy: {},
    symbols_: { error: 2, start: 3, SPACE: 4, NL: 5, SD: 6, document: 7, line: 8, statement: 9, classDefStatement: 10, styleStatement: 11, cssClassStatement: 12, idStatement: 13, DESCR: 14, "-->": 15, HIDE_EMPTY: 16, scale: 17, WIDTH: 18, COMPOSIT_STATE: 19, STRUCT_START: 20, STRUCT_STOP: 21, STATE_DESCR: 22, AS: 23, ID: 24, FORK: 25, JOIN: 26, CHOICE: 27, CONCURRENT: 28, note: 29, notePosition: 30, NOTE_TEXT: 31, direction: 32, acc_title: 33, acc_title_value: 34, acc_descr: 35, acc_descr_value: 36, acc_descr_multiline_value: 37, CLICK: 38, STRING: 39, HREF: 40, classDef: 41, CLASSDEF_ID: 42, CLASSDEF_STYLEOPTS: 43, DEFAULT: 44, style: 45, STYLE_IDS: 46, STYLEDEF_STYLEOPTS: 47, class: 48, CLASSENTITY_IDS: 49, STYLECLASS: 50, direction_tb: 51, direction_bt: 52, direction_rl: 53, direction_lr: 54, eol: 55, ";": 56, EDGE_STATE: 57, STYLE_SEPARATOR: 58, left_of: 59, right_of: 60, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 4: "SPACE", 5: "NL", 6: "SD", 14: "DESCR", 15: "-->", 16: "HIDE_EMPTY", 17: "scale", 18: "WIDTH", 19: "COMPOSIT_STATE", 20: "STRUCT_START", 21: "STRUCT_STOP", 22: "STATE_DESCR", 23: "AS", 24: "ID", 25: "FORK", 26: "JOIN", 27: "CHOICE", 28: "CONCURRENT", 29: "note", 31: "NOTE_TEXT", 33: "acc_title", 34: "acc_title_value", 35: "acc_descr", 36: "acc_descr_value", 37: "acc_descr_multiline_value", 38: "CLICK", 39: "STRING", 40: "HREF", 41: "classDef", 42: "CLASSDEF_ID", 43: "CLASSDEF_STYLEOPTS", 44: "DEFAULT", 45: "style", 46: "STYLE_IDS", 47: "STYLEDEF_STYLEOPTS", 48: "class", 49: "CLASSENTITY_IDS", 50: "STYLECLASS", 51: "direction_tb", 52: "direction_bt", 53: "direction_rl", 54: "direction_lr", 56: ";", 57: "EDGE_STATE", 58: "STYLE_SEPARATOR", 59: "left_of", 60: "right_of" },
    productions_: [0, [3, 2], [3, 2], [3, 2], [7, 0], [7, 2], [8, 2], [8, 1], [8, 1], [9, 1], [9, 1], [9, 1], [9, 1], [9, 2], [9, 3], [9, 4], [9, 1], [9, 2], [9, 1], [9, 4], [9, 3], [9, 6], [9, 1], [9, 1], [9, 1], [9, 1], [9, 4], [9, 4], [9, 1], [9, 2], [9, 2], [9, 1], [9, 5], [9, 5], [10, 3], [10, 3], [11, 3], [12, 3], [32, 1], [32, 1], [32, 1], [32, 1], [55, 1], [55, 1], [13, 1], [13, 1], [13, 3], [13, 3], [30, 1], [30, 1]],
    performAction: /* @__PURE__ */ __name(function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
      var $0 = $$.length - 1;
      switch (yystate) {
        case 3:
          yy.setRootDoc($$[$0]);
          return $$[$0];
          break;
        case 4:
          this.$ = [];
          break;
        case 5:
          if ($$[$0] != "nl") {
            $$[$0 - 1].push($$[$0]);
            this.$ = $$[$0 - 1];
          }
          break;
        case 6:
        case 7:
          this.$ = $$[$0];
          break;
        case 8:
          this.$ = "nl";
          break;
        case 12:
          this.$ = $$[$0];
          break;
        case 13:
          const stateStmt = $$[$0 - 1];
          stateStmt.description = yy.trimColon($$[$0]);
          this.$ = stateStmt;
          break;
        case 14:
          this.$ = { stmt: "relation", state1: $$[$0 - 2], state2: $$[$0] };
          break;
        case 15:
          const relDescription = yy.trimColon($$[$0]);
          this.$ = { stmt: "relation", state1: $$[$0 - 3], state2: $$[$0 - 1], description: relDescription };
          break;
        case 19:
          this.$ = { stmt: "state", id: $$[$0 - 3], type: "default", description: "", doc: $$[$0 - 1] };
          break;
        case 20:
          var id = $$[$0];
          var description = $$[$0 - 2].trim();
          if ($$[$0].match(":")) {
            var parts = $$[$0].split(":");
            id = parts[0];
            description = [description, parts[1]];
          }
          this.$ = { stmt: "state", id, type: "default", description };
          break;
        case 21:
          this.$ = { stmt: "state", id: $$[$0 - 3], type: "default", description: $$[$0 - 5], doc: $$[$0 - 1] };
          break;
        case 22:
          this.$ = { stmt: "state", id: $$[$0], type: "fork" };
          break;
        case 23:
          this.$ = { stmt: "state", id: $$[$0], type: "join" };
          break;
        case 24:
          this.$ = { stmt: "state", id: $$[$0], type: "choice" };
          break;
        case 25:
          this.$ = { stmt: "state", id: yy.getDividerId(), type: "divider" };
          break;
        case 26:
          this.$ = { stmt: "state", id: $$[$0 - 1].trim(), note: { position: $$[$0 - 2].trim(), text: $$[$0].trim() } };
          break;
        case 29:
          this.$ = $$[$0].trim();
          yy.setAccTitle(this.$);
          break;
        case 30:
        case 31:
          this.$ = $$[$0].trim();
          yy.setAccDescription(this.$);
          break;
        case 32:
          this.$ = {
            stmt: "click",
            id: $$[$0 - 3],
            url: $$[$0 - 2],
            tooltip: $$[$0 - 1]
          };
          break;
        case 33:
          this.$ = {
            stmt: "click",
            id: $$[$0 - 3],
            url: $$[$0 - 1],
            tooltip: ""
          };
          break;
        case 34:
        case 35:
          this.$ = { stmt: "classDef", id: $$[$0 - 1].trim(), classes: $$[$0].trim() };
          break;
        case 36:
          this.$ = { stmt: "style", id: $$[$0 - 1].trim(), styleClass: $$[$0].trim() };
          break;
        case 37:
          this.$ = { stmt: "applyClass", id: $$[$0 - 1].trim(), styleClass: $$[$0].trim() };
          break;
        case 38:
          yy.setDirection("TB");
          this.$ = { stmt: "dir", value: "TB" };
          break;
        case 39:
          yy.setDirection("BT");
          this.$ = { stmt: "dir", value: "BT" };
          break;
        case 40:
          yy.setDirection("RL");
          this.$ = { stmt: "dir", value: "RL" };
          break;
        case 41:
          yy.setDirection("LR");
          this.$ = { stmt: "dir", value: "LR" };
          break;
        case 44:
        case 45:
          this.$ = { stmt: "state", id: $$[$0].trim(), type: "default", description: "" };
          break;
        case 46:
          this.$ = { stmt: "state", id: $$[$0 - 2].trim(), classes: [$$[$0].trim()], type: "default", description: "" };
          break;
        case 47:
          this.$ = { stmt: "state", id: $$[$0 - 2].trim(), classes: [$$[$0].trim()], type: "default", description: "" };
          break;
      }
    }, "anonymous"),
    table: [{ 3: 1, 4: $V0, 5: $V1, 6: $V2 }, { 1: [3] }, { 3: 5, 4: $V0, 5: $V1, 6: $V2 }, { 3: 6, 4: $V0, 5: $V1, 6: $V2 }, o([1, 4, 5, 16, 17, 19, 22, 24, 25, 26, 27, 28, 29, 33, 35, 37, 38, 41, 45, 48, 51, 52, 53, 54, 57], $V3, { 7: 7 }), { 1: [2, 1] }, { 1: [2, 2] }, { 1: [2, 3], 4: $V4, 5: $V5, 8: 8, 9: 10, 10: 12, 11: 13, 12: 14, 13: 15, 16: $V6, 17: $V7, 19: $V8, 22: $V9, 24: $Va, 25: $Vb, 26: $Vc, 27: $Vd, 28: $Ve, 29: $Vf, 32: 25, 33: $Vg, 35: $Vh, 37: $Vi, 38: $Vj, 41: $Vk, 45: $Vl, 48: $Vm, 51: $Vn, 52: $Vo, 53: $Vp, 54: $Vq, 57: $Vr }, o($Vs, [2, 5]), { 9: 39, 10: 12, 11: 13, 12: 14, 13: 15, 16: $V6, 17: $V7, 19: $V8, 22: $V9, 24: $Va, 25: $Vb, 26: $Vc, 27: $Vd, 28: $Ve, 29: $Vf, 32: 25, 33: $Vg, 35: $Vh, 37: $Vi, 38: $Vj, 41: $Vk, 45: $Vl, 48: $Vm, 51: $Vn, 52: $Vo, 53: $Vp, 54: $Vq, 57: $Vr }, o($Vs, [2, 7]), o($Vs, [2, 8]), o($Vs, [2, 9]), o($Vs, [2, 10]), o($Vs, [2, 11]), o($Vs, [2, 12], { 14: [1, 40], 15: [1, 41] }), o($Vs, [2, 16]), { 18: [1, 42] }, o($Vs, [2, 18], { 20: [1, 43] }), { 23: [1, 44] }, o($Vs, [2, 22]), o($Vs, [2, 23]), o($Vs, [2, 24]), o($Vs, [2, 25]), { 30: 45, 31: [1, 46], 59: [1, 47], 60: [1, 48] }, o($Vs, [2, 28]), { 34: [1, 49] }, { 36: [1, 50] }, o($Vs, [2, 31]), { 13: 51, 24: $Va, 57: $Vr }, { 42: [1, 52], 44: [1, 53] }, { 46: [1, 54] }, { 49: [1, 55] }, o($Vt, [2, 44], { 58: [1, 56] }), o($Vt, [2, 45], { 58: [1, 57] }), o($Vs, [2, 38]), o($Vs, [2, 39]), o($Vs, [2, 40]), o($Vs, [2, 41]), o($Vs, [2, 6]), o($Vs, [2, 13]), { 13: 58, 24: $Va, 57: $Vr }, o($Vs, [2, 17]), o($Vu, $V3, { 7: 59 }), { 24: [1, 60] }, { 24: [1, 61] }, { 23: [1, 62] }, { 24: [2, 48] }, { 24: [2, 49] }, o($Vs, [2, 29]), o($Vs, [2, 30]), { 39: [1, 63], 40: [1, 64] }, { 43: [1, 65] }, { 43: [1, 66] }, { 47: [1, 67] }, { 50: [1, 68] }, { 24: [1, 69] }, { 24: [1, 70] }, o($Vs, [2, 14], { 14: [1, 71] }), { 4: $V4, 5: $V5, 8: 8, 9: 10, 10: 12, 11: 13, 12: 14, 13: 15, 16: $V6, 17: $V7, 19: $V8, 21: [1, 72], 22: $V9, 24: $Va, 25: $Vb, 26: $Vc, 27: $Vd, 28: $Ve, 29: $Vf, 32: 25, 33: $Vg, 35: $Vh, 37: $Vi, 38: $Vj, 41: $Vk, 45: $Vl, 48: $Vm, 51: $Vn, 52: $Vo, 53: $Vp, 54: $Vq, 57: $Vr }, o($Vs, [2, 20], { 20: [1, 73] }), { 31: [1, 74] }, { 24: [1, 75] }, { 39: [1, 76] }, { 39: [1, 77] }, o($Vs, [2, 34]), o($Vs, [2, 35]), o($Vs, [2, 36]), o($Vs, [2, 37]), o($Vt, [2, 46]), o($Vt, [2, 47]), o($Vs, [2, 15]), o($Vs, [2, 19]), o($Vu, $V3, { 7: 78 }), o($Vs, [2, 26]), o($Vs, [2, 27]), { 5: [1, 79] }, { 5: [1, 80] }, { 4: $V4, 5: $V5, 8: 8, 9: 10, 10: 12, 11: 13, 12: 14, 13: 15, 16: $V6, 17: $V7, 19: $V8, 21: [1, 81], 22: $V9, 24: $Va, 25: $Vb, 26: $Vc, 27: $Vd, 28: $Ve, 29: $Vf, 32: 25, 33: $Vg, 35: $Vh, 37: $Vi, 38: $Vj, 41: $Vk, 45: $Vl, 48: $Vm, 51: $Vn, 52: $Vo, 53: $Vp, 54: $Vq, 57: $Vr }, o($Vs, [2, 32]), o($Vs, [2, 33]), o($Vs, [2, 21])],
    defaultActions: { 5: [2, 1], 6: [2, 2], 47: [2, 48], 48: [2, 49] },
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
        function processId() {
          const idx = yy_.yytext.indexOf("%%");
          if (idx === 0) {
            return false;
          }
          if (idx > 0) {
            const before = yy_.yytext.slice(0, idx);
            const after = yy_.yytext.slice(idx);
            if (after) {
              yy.lexer.unput(after);
            }
            yy_.yytext = before;
          }
          return true;
        }
        __name(processId, "processId");
        var YYSTATE = YY_START;
        switch ($avoiding_name_collisions) {
          case 0:
            return 38;
            break;
          case 1:
            return 40;
            break;
          case 2:
            return 39;
            break;
          case 3:
            return 44;
            break;
          case 4:
            return 51;
            break;
          case 5:
            return 52;
            break;
          case 6:
            return 53;
            break;
          case 7:
            return 54;
            break;
          case 8:
            return 5;
            break;
          case 9:
            break;
          case 10:
            break;
          case 11:
            break;
          case 12:
            break;
          case 13:
            this.pushState("SCALE");
            return 17;
            break;
          case 14:
            return 18;
            break;
          case 15:
            this.popState();
            break;
          case 16:
            this.begin("acc_title");
            return 33;
            break;
          case 17:
            this.popState();
            return "acc_title_value";
            break;
          case 18:
            this.begin("acc_descr");
            return 35;
            break;
          case 19:
            this.popState();
            return "acc_descr_value";
            break;
          case 20:
            this.begin("acc_descr_multiline");
            break;
          case 21:
            this.popState();
            break;
          case 22:
            return "acc_descr_multiline_value";
            break;
          case 23:
            this.pushState("CLASSDEF");
            return 41;
            break;
          case 24:
            this.popState();
            this.pushState("CLASSDEFID");
            return "DEFAULT_CLASSDEF_ID";
            break;
          case 25:
            this.popState();
            this.pushState("CLASSDEFID");
            return 42;
            break;
          case 26:
            this.popState();
            return 43;
            break;
          case 27:
            this.pushState("CLASS");
            return 48;
            break;
          case 28:
            this.popState();
            this.pushState("CLASS_STYLE");
            return 49;
            break;
          case 29:
            this.popState();
            return 50;
            break;
          case 30:
            this.pushState("STYLE");
            return 45;
            break;
          case 31:
            this.popState();
            this.pushState("STYLEDEF_STYLES");
            return 46;
            break;
          case 32:
            this.popState();
            return 47;
            break;
          case 33:
            this.pushState("SCALE");
            return 17;
            break;
          case 34:
            return 18;
            break;
          case 35:
            this.popState();
            break;
          case 36:
            this.pushState("STATE");
            break;
          case 37:
            this.popState();
            yy_.yytext = yy_.yytext.slice(0, -8).trim();
            return 25;
            break;
          case 38:
            this.popState();
            yy_.yytext = yy_.yytext.slice(0, -8).trim();
            return 26;
            break;
          case 39:
            this.popState();
            yy_.yytext = yy_.yytext.slice(0, -10).trim();
            return 27;
            break;
          case 40:
            this.popState();
            yy_.yytext = yy_.yytext.slice(0, -8).trim();
            return 25;
            break;
          case 41:
            this.popState();
            yy_.yytext = yy_.yytext.slice(0, -8).trim();
            return 26;
            break;
          case 42:
            this.popState();
            yy_.yytext = yy_.yytext.slice(0, -10).trim();
            return 27;
            break;
          case 43:
            return 51;
            break;
          case 44:
            return 52;
            break;
          case 45:
            return 53;
            break;
          case 46:
            return 54;
            break;
          case 47:
            this.pushState("STATE_STRING");
            break;
          case 48:
            this.pushState("STATE_ID");
            return "AS";
            break;
          case 49:
            if (!processId())
              return;
            this.popState();
            return "ID";
            break;
          case 50:
            this.popState();
            break;
          case 51:
            return "STATE_DESCR";
            break;
          case 52:
            return 19;
            break;
          case 53:
            this.popState();
            break;
          case 54:
            this.popState();
            this.pushState("struct");
            return 20;
            break;
          case 55:
            this.popState();
            return 21;
            break;
          case 56:
            break;
          case 57:
            this.begin("NOTE");
            return 29;
            break;
          case 58:
            this.popState();
            this.pushState("NOTE_ID");
            return 59;
            break;
          case 59:
            this.popState();
            this.pushState("NOTE_ID");
            return 60;
            break;
          case 60:
            this.popState();
            this.pushState("FLOATING_NOTE");
            break;
          case 61:
            this.popState();
            this.pushState("FLOATING_NOTE_ID");
            return "AS";
            break;
          case 62:
            break;
          case 63:
            return "NOTE_TEXT";
            break;
          case 64:
            if (!processId())
              return;
            this.popState();
            return "ID";
            break;
          case 65:
            if (!processId())
              return;
            this.popState();
            this.pushState("NOTE_TEXT");
            return 24;
            break;
          case 66:
            this.popState();
            yy_.yytext = yy_.yytext.substr(2).trim();
            return 31;
            break;
          case 67:
            this.popState();
            yy_.yytext = yy_.yytext.slice(0, -8).trim();
            return 31;
            break;
          case 68:
            return 6;
            break;
          case 69:
            return 6;
            break;
          case 70:
            return 16;
            break;
          case 71:
            return 57;
            break;
          case 72:
            if (!processId())
              return;
            return 24;
            break;
          case 73:
            yy_.yytext = yy_.yytext.trim();
            return 14;
            break;
          case 74:
            return 15;
            break;
          case 75:
            return 28;
            break;
          case 76:
            return 58;
            break;
          case 77:
            return 5;
            break;
          case 78:
            return "INVALID";
            break;
        }
      }, "anonymous"),
      rules: [/^(?:click\b)/i, /^(?:href\b)/i, /^(?:"[^"]*")/i, /^(?:default\b)/i, /^(?:.*direction\s+TB[^\n]*)/i, /^(?:.*direction\s+BT[^\n]*)/i, /^(?:.*direction\s+RL[^\n]*)/i, /^(?:.*direction\s+LR[^\n]*)/i, /^(?:[\n]+)/i, /^(?:[\s]+)/i, /^(?:((?!\n)\s)+)/i, /^(?:#[^\n]*)/i, /^(?:%%(?!\{)[^\n]*)/i, /^(?:scale\s+)/i, /^(?:\d+)/i, /^(?:\s+width\b)/i, /^(?:accTitle\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*\{\s*)/i, /^(?:[\}])/i, /^(?:[^\}]*)/i, /^(?:classDef\s+)/i, /^(?:DEFAULT\s+)/i, /^(?:\w+\s+)/i, /^(?:[^\n]*)/i, /^(?:class\s+)/i, /^(?:(\w+)+((,\s*\w+)*))/i, /^(?:[^\n]*)/i, /^(?:style\s+)/i, /^(?:[\w,]+\s+)/i, /^(?:[^\n]*)/i, /^(?:scale\s+)/i, /^(?:\d+)/i, /^(?:\s+width\b)/i, /^(?:state\s+)/i, /^(?:.*<<fork>>)/i, /^(?:.*<<join>>)/i, /^(?:.*<<choice>>)/i, /^(?:.*\[\[fork\]\])/i, /^(?:.*\[\[join\]\])/i, /^(?:.*\[\[choice\]\])/i, /^(?:.*direction\s+TB[^\n]*)/i, /^(?:.*direction\s+BT[^\n]*)/i, /^(?:.*direction\s+RL[^\n]*)/i, /^(?:.*direction\s+LR[^\n]*)/i, /^(?:["])/i, /^(?:\s*as\s+)/i, /^(?:[^\n\{]*)/i, /^(?:["])/i, /^(?:[^"]*)/i, /^(?:[^\n\s\{]+)/i, /^(?:\n)/i, /^(?:\{)/i, /^(?:\})/i, /^(?:[\n])/i, /^(?:note\s+)/i, /^(?:left of\b)/i, /^(?:right of\b)/i, /^(?:")/i, /^(?:\s*as\s*)/i, /^(?:["])/i, /^(?:[^"]*)/i, /^(?:[^\n]*)/i, /^(?:\s*[^:\n\s\-]+)/i, /^(?:\s*:[^:\n;]+)/i, /^(?:[\s\S]*?\n\s*end note\b)/i, /^(?:stateDiagram\s+)/i, /^(?:stateDiagram-v2\s+)/i, /^(?:hide empty description\b)/i, /^(?:\[\*\])/i, /^(?:[^:\n\s\-\{]+)/i, /^(?:\s*:(?:[^:\n;]|:[^:\n;])+)/i, /^(?:-->)/i, /^(?:--)/i, /^(?::::)/i, /^(?:$)/i, /^(?:.)/i],
      conditions: { LINE: { rules: [10, 11, 12], inclusive: false }, struct: { rules: [10, 11, 12, 23, 27, 30, 36, 43, 44, 45, 46, 55, 56, 57, 71, 72, 73, 74, 75, 76], inclusive: false }, FLOATING_NOTE_ID: { rules: [64], inclusive: false }, FLOATING_NOTE: { rules: [61, 62, 63], inclusive: false }, NOTE_TEXT: { rules: [66, 67], inclusive: false }, NOTE_ID: { rules: [65], inclusive: false }, NOTE: { rules: [58, 59, 60], inclusive: false }, STYLEDEF_STYLEOPTS: { rules: [], inclusive: false }, STYLEDEF_STYLES: { rules: [32], inclusive: false }, STYLE_IDS: { rules: [], inclusive: false }, STYLE: { rules: [31], inclusive: false }, CLASS_STYLE: { rules: [29], inclusive: false }, CLASS: { rules: [28], inclusive: false }, CLASSDEFID: { rules: [26], inclusive: false }, CLASSDEF: { rules: [24, 25], inclusive: false }, acc_descr_multiline: { rules: [21, 22], inclusive: false }, acc_descr: { rules: [19], inclusive: false }, acc_title: { rules: [17], inclusive: false }, SCALE: { rules: [14, 15, 34, 35], inclusive: false }, ALIAS: { rules: [], inclusive: false }, STATE_ID: { rules: [49], inclusive: false }, STATE_STRING: { rules: [50, 51], inclusive: false }, FORK_STATE: { rules: [], inclusive: false }, STATE: { rules: [10, 11, 12, 37, 38, 39, 40, 41, 42, 47, 48, 52, 53, 54], inclusive: false }, ID: { rules: [10, 11, 12], inclusive: false }, INITIAL: { rules: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 16, 18, 20, 23, 27, 30, 33, 36, 54, 57, 68, 69, 70, 71, 72, 73, 74, 76, 77, 78], inclusive: true } }
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
var stateDiagram_default = parser;
var DEFAULT_DIAGRAM_DIRECTION = "TB";
var DEFAULT_NESTED_DOC_DIR = "TB";
var STMT_DIRECTION = "dir";
var STMT_STATE = "state";
var STMT_ROOT = "root";
var STMT_RELATION = "relation";
var STMT_CLASSDEF = "classDef";
var STMT_STYLEDEF = "style";
var STMT_APPLYCLASS = "applyClass";
var DEFAULT_STATE_TYPE = "default";
var DIVIDER_TYPE = "divider";
var G_EDGE_STYLE = "fill:none";
var G_EDGE_ARROWHEADSTYLE = "fill: #333";
var G_EDGE_LABELPOS = "c";
var G_EDGE_LABELTYPE = "markdown";
var G_EDGE_THICKNESS = "normal";
var SHAPE_STATE = "rect";
var SHAPE_STATE_WITH_DESC = "rectWithTitle";
var SHAPE_START = "stateStart";
var SHAPE_END = "stateEnd";
var SHAPE_DIVIDER = "divider";
var SHAPE_GROUP = "roundedWithTitle";
var SHAPE_NOTE = "note";
var SHAPE_NOTEGROUP = "noteGroup";
var CSS_DIAGRAM = "statediagram";
var CSS_STATE = "state";
var CSS_DIAGRAM_STATE = `${CSS_DIAGRAM}-${CSS_STATE}`;
var CSS_EDGE = "transition";
var CSS_NOTE = "note";
var CSS_NOTE_EDGE = "note-edge";
var CSS_EDGE_NOTE_EDGE = `${CSS_EDGE} ${CSS_NOTE_EDGE}`;
var CSS_DIAGRAM_NOTE = `${CSS_DIAGRAM}-${CSS_NOTE}`;
var CSS_CLUSTER = "cluster";
var CSS_DIAGRAM_CLUSTER = `${CSS_DIAGRAM}-${CSS_CLUSTER}`;
var CSS_CLUSTER_ALT = "cluster-alt";
var CSS_DIAGRAM_CLUSTER_ALT = `${CSS_DIAGRAM}-${CSS_CLUSTER_ALT}`;
var PARENT = "parent";
var NOTE = "note";
var DOMID_STATE = "state";
var DOMID_TYPE_SPACER = "----";
var NOTE_ID = `${DOMID_TYPE_SPACER}${NOTE}`;
var PARENT_ID = `${DOMID_TYPE_SPACER}${PARENT}`;
var getDir = /* @__PURE__ */ __name((parsedItem, defaultDir = DEFAULT_NESTED_DOC_DIR) => {
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
  log.info("Drawing state diagram (v2)", id);
  const { securityLevel, state: conf, layout } = getConfig2();
  diag.db.extract(diag.db.getRootDocV2());
  const data4Layout = diag.db.getData();
  const svg = getDiagramElement(id, securityLevel);
  data4Layout.type = diag.type;
  data4Layout.layoutAlgorithm = layout;
  data4Layout.nodeSpacing = conf?.nodeSpacing || 50;
  data4Layout.rankSpacing = conf?.rankSpacing || 50;
  const config = getConfig2();
  if (config.look === "neo") {
    data4Layout.markers = ["barbNeo"];
  } else {
    data4Layout.markers = ["barb"];
  }
  data4Layout.diagramId = id;
  await render(data4Layout, svg);
  const padding = 8;
  try {
    const links = typeof diag.db.getLinks === "function" ? diag.db.getLinks() : /* @__PURE__ */ new Map;
    links.forEach((linkInfo, key) => {
      const stateId = typeof key === "string" ? key : typeof key?.id === "string" ? key.id : "";
      if (!stateId) {
        log.warn("⚠️ Invalid or missing stateId from key:", JSON.stringify(key));
        return;
      }
      const allNodes = svg.node()?.querySelectorAll("g");
      let matchedElem;
      allNodes?.forEach((g) => {
        const text2 = g.textContent?.trim();
        if (text2 === stateId) {
          matchedElem = g;
        }
      });
      if (!matchedElem) {
        log.warn("⚠️ Could not find node matching text:", stateId);
        return;
      }
      const parent = matchedElem.parentNode;
      if (!parent) {
        log.warn("⚠️ Node has no parent, cannot wrap:", stateId);
        return;
      }
      const a = document.createElementNS("http://www.w3.org/2000/svg", "a");
      const cleanedUrl = linkInfo.url.replace(/^"+|"+$/g, "");
      a.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", cleanedUrl);
      a.setAttribute("target", "_blank");
      if (linkInfo.tooltip) {
        const tooltip = linkInfo.tooltip.replace(/^"+|"+$/g, "");
        a.setAttribute("title", tooltip);
      }
      parent.replaceChild(a, matchedElem);
      a.appendChild(matchedElem);
      log.info("\uD83D\uDD17 Wrapped node in <a> tag for:", stateId, linkInfo.url);
    });
  } catch (err) {
    log.error("❌ Error injecting clickable links:", err);
  }
  utils_default.insertTitle(svg, "statediagramTitleText", conf?.titleTopMargin ?? 25, diag.db.getDiagramTitle());
  setupViewPortForSVG(svg, padding, CSS_DIAGRAM, conf?.useMaxWidth ?? true);
}, "draw");
var stateRenderer_v3_unified_default = {
  getClasses,
  draw,
  getDir
};
var nodeDb = /* @__PURE__ */ new Map;
var graphItemCount = 0;
function stateDomId(itemId = "", counter = 0, type = "", typeSpacer = DOMID_TYPE_SPACER) {
  const typeStr = type !== null && type.length > 0 ? `${typeSpacer}${type}` : "";
  return `${DOMID_STATE}-${itemId}${typeStr}-${counter}`;
}
__name(stateDomId, "stateDomId");
var setupDoc = /* @__PURE__ */ __name((parentParsedItem, doc, diagramStates, nodes, edges, altFlag, look, classes) => {
  log.trace("items", doc);
  doc.forEach((item) => {
    switch (item.stmt) {
      case STMT_STATE:
        dataFetcher(parentParsedItem, item, diagramStates, nodes, edges, altFlag, look, classes);
        break;
      case DEFAULT_STATE_TYPE:
        dataFetcher(parentParsedItem, item, diagramStates, nodes, edges, altFlag, look, classes);
        break;
      case STMT_RELATION:
        {
          dataFetcher(parentParsedItem, item.state1, diagramStates, nodes, edges, altFlag, look, classes);
          dataFetcher(parentParsedItem, item.state2, diagramStates, nodes, edges, altFlag, look, classes);
          const isNeo = look === "neo";
          const edgeData = {
            id: "edge" + graphItemCount,
            start: item.state1.id,
            end: item.state2.id,
            arrowhead: "normal",
            arrowTypeEnd: isNeo ? "arrow_barb_neo" : "arrow_barb",
            style: G_EDGE_STYLE,
            labelStyle: "",
            label: common_default.sanitizeText(item.description ?? "", getConfig2()),
            arrowheadStyle: G_EDGE_ARROWHEADSTYLE,
            labelpos: G_EDGE_LABELPOS,
            labelType: G_EDGE_LABELTYPE,
            thickness: G_EDGE_THICKNESS,
            classes: CSS_EDGE,
            look
          };
          edges.push(edgeData);
          graphItemCount++;
        }
        break;
    }
  });
}, "setupDoc");
var getDir2 = /* @__PURE__ */ __name((parsedItem, defaultDir = DEFAULT_NESTED_DOC_DIR) => {
  let dir = defaultDir;
  if (parsedItem.doc) {
    for (const parsedItemDoc of parsedItem.doc) {
      if (parsedItemDoc.stmt === "dir") {
        dir = parsedItemDoc.value;
      }
    }
  }
  return dir;
}, "getDir");
function insertOrUpdateNode(nodes, nodeData, classes) {
  if (!nodeData.id || nodeData.id === "</join></fork>" || nodeData.id === "</choice>") {
    return;
  }
  if (nodeData.cssClasses) {
    if (!Array.isArray(nodeData.cssCompiledStyles)) {
      nodeData.cssCompiledStyles = [];
    }
    nodeData.cssClasses.split(" ").forEach((cssClass) => {
      const classDef = classes.get(cssClass);
      if (classDef) {
        nodeData.cssCompiledStyles = [...nodeData.cssCompiledStyles ?? [], ...classDef.styles];
      }
    });
  }
  const existingNodeData = nodes.find((node) => node.id === nodeData.id);
  if (existingNodeData) {
    Object.assign(existingNodeData, nodeData);
  } else {
    nodes.push(nodeData);
  }
}
__name(insertOrUpdateNode, "insertOrUpdateNode");
function getClassesFromDbInfo(dbInfoItem) {
  return dbInfoItem?.classes?.join(" ") ?? "";
}
__name(getClassesFromDbInfo, "getClassesFromDbInfo");
function getStylesFromDbInfo(dbInfoItem) {
  return dbInfoItem?.styles ?? [];
}
__name(getStylesFromDbInfo, "getStylesFromDbInfo");
var dataFetcher = /* @__PURE__ */ __name((parent, parsedItem, diagramStates, nodes, edges, altFlag, look, classes) => {
  const itemId = parsedItem.id;
  const dbState = diagramStates.get(itemId);
  const classStr = getClassesFromDbInfo(dbState);
  const style = getStylesFromDbInfo(dbState);
  const config = getConfig2();
  log.info("dataFetcher parsedItem", parsedItem, dbState, style);
  if (itemId !== "root") {
    let shape = SHAPE_STATE;
    if (parsedItem.start === true) {
      shape = SHAPE_START;
    } else if (parsedItem.start === false) {
      shape = SHAPE_END;
    }
    if (parsedItem.type !== DEFAULT_STATE_TYPE) {
      shape = parsedItem.type;
    }
    if (!nodeDb.get(itemId)) {
      nodeDb.set(itemId, {
        id: itemId,
        shape,
        description: common_default.sanitizeText(itemId, config),
        cssClasses: `${classStr} ${CSS_DIAGRAM_STATE}`,
        cssStyles: style
      });
    }
    const newNode = nodeDb.get(itemId);
    if (parsedItem.description) {
      if (Array.isArray(newNode.description)) {
        newNode.shape = SHAPE_STATE_WITH_DESC;
        newNode.description.push(parsedItem.description);
      } else {
        if (newNode.description?.length && newNode.description.length > 0) {
          newNode.shape = SHAPE_STATE_WITH_DESC;
          if (newNode.description === itemId) {
            newNode.description = [parsedItem.description];
          } else {
            newNode.description = [newNode.description, parsedItem.description];
          }
        } else {
          newNode.shape = SHAPE_STATE;
          newNode.description = parsedItem.description;
        }
      }
      newNode.description = common_default.sanitizeTextOrArray(newNode.description, config);
    }
    if (newNode.description?.length === 1 && newNode.shape === SHAPE_STATE_WITH_DESC) {
      if (newNode.type === "group") {
        newNode.shape = SHAPE_GROUP;
      } else {
        newNode.shape = SHAPE_STATE;
      }
    }
    if (!newNode.type && parsedItem.doc) {
      log.info("Setting cluster for XCX", itemId, getDir2(parsedItem));
      newNode.type = "group";
      newNode.isGroup = true;
      newNode.dir = getDir2(parsedItem);
      newNode.shape = parsedItem.type === DIVIDER_TYPE ? SHAPE_DIVIDER : SHAPE_GROUP;
      newNode.cssClasses = `${newNode.cssClasses} ${CSS_DIAGRAM_CLUSTER} ${altFlag ? CSS_DIAGRAM_CLUSTER_ALT : ""}`;
    }
    const nodeData = {
      labelStyle: "",
      shape: newNode.shape,
      label: newNode.description,
      cssClasses: newNode.cssClasses,
      cssCompiledStyles: [],
      cssStyles: newNode.cssStyles,
      id: itemId,
      dir: newNode.dir,
      domId: stateDomId(itemId, graphItemCount),
      type: newNode.type,
      isGroup: newNode.type === "group",
      padding: 8,
      rx: 10,
      ry: 10,
      look,
      labelType: "markdown"
    };
    if (nodeData.shape === SHAPE_DIVIDER) {
      nodeData.label = "";
    }
    if (parent && parent.id !== "root") {
      log.trace("Setting node ", itemId, " to be child of its parent ", parent.id);
      nodeData.parentId = parent.id;
    }
    nodeData.centerLabel = true;
    if (parsedItem.note) {
      const noteData = {
        labelStyle: "",
        shape: SHAPE_NOTE,
        label: parsedItem.note.text,
        labelType: "markdown",
        cssClasses: CSS_DIAGRAM_NOTE,
        cssStyles: [],
        cssCompiledStyles: [],
        id: itemId + NOTE_ID + "-" + graphItemCount,
        domId: stateDomId(itemId, graphItemCount, NOTE),
        type: newNode.type,
        isGroup: newNode.type === "group",
        padding: config.flowchart?.padding,
        look,
        position: parsedItem.note.position
      };
      const parentNodeId = itemId + PARENT_ID;
      const groupData = {
        labelStyle: "",
        shape: SHAPE_NOTEGROUP,
        label: parsedItem.note.text,
        cssClasses: newNode.cssClasses,
        cssStyles: [],
        id: itemId + PARENT_ID,
        domId: stateDomId(itemId, graphItemCount, PARENT),
        type: "group",
        isGroup: true,
        padding: 16,
        look,
        position: parsedItem.note.position
      };
      graphItemCount++;
      groupData.id = parentNodeId;
      noteData.parentId = parentNodeId;
      insertOrUpdateNode(nodes, groupData, classes);
      insertOrUpdateNode(nodes, noteData, classes);
      insertOrUpdateNode(nodes, nodeData, classes);
      let from = itemId;
      let to = noteData.id;
      if (parsedItem.note.position === "left of") {
        from = noteData.id;
        to = itemId;
      }
      edges.push({
        id: from + "-" + to,
        start: from,
        end: to,
        arrowhead: "none",
        arrowTypeEnd: "",
        style: G_EDGE_STYLE,
        labelStyle: "",
        classes: CSS_EDGE_NOTE_EDGE,
        arrowheadStyle: G_EDGE_ARROWHEADSTYLE,
        labelpos: G_EDGE_LABELPOS,
        labelType: G_EDGE_LABELTYPE,
        thickness: G_EDGE_THICKNESS,
        look
      });
    } else {
      insertOrUpdateNode(nodes, nodeData, classes);
    }
  }
  if (parsedItem.doc) {
    log.trace("Adding nodes children ");
    setupDoc(parsedItem, parsedItem.doc, diagramStates, nodes, edges, !altFlag, look, classes);
  }
}, "dataFetcher");
var reset = /* @__PURE__ */ __name(() => {
  nodeDb.clear();
  graphItemCount = 0;
}, "reset");
var CONSTANTS = {
  START_NODE: "[*]",
  START_TYPE: "start",
  END_NODE: "[*]",
  END_TYPE: "end",
  COLOR_KEYWORD: "color",
  FILL_KEYWORD: "fill",
  BG_FILL: "bgFill",
  STYLECLASS_SEP: ","
};
var newClassesList = /* @__PURE__ */ __name(() => /* @__PURE__ */ new Map, "newClassesList");
var newDoc = /* @__PURE__ */ __name(() => ({
  relations: [],
  states: /* @__PURE__ */ new Map,
  documents: {}
}), "newDoc");
var clone = /* @__PURE__ */ __name((o) => JSON.parse(JSON.stringify(o)), "clone");
var StateDB = class {
  constructor(version) {
    this.version = version;
    this.nodes = [];
    this.edges = [];
    this.rootDoc = [];
    this.classes = newClassesList();
    this.documents = { root: newDoc() };
    this.currentDocument = this.documents.root;
    this.startEndCount = 0;
    this.dividerCnt = 0;
    this.links = /* @__PURE__ */ new Map;
    this.getAccTitle = getAccTitle;
    this.setAccTitle = setAccTitle;
    this.getAccDescription = getAccDescription;
    this.setAccDescription = setAccDescription;
    this.setDiagramTitle = setDiagramTitle;
    this.getDiagramTitle = getDiagramTitle;
    this.clear();
    this.setRootDoc = this.setRootDoc.bind(this);
    this.getDividerId = this.getDividerId.bind(this);
    this.setDirection = this.setDirection.bind(this);
    this.trimColon = this.trimColon.bind(this);
  }
  static {
    __name(this, "StateDB");
  }
  static {
    this.relationType = {
      AGGREGATION: 0,
      EXTENSION: 1,
      COMPOSITION: 2,
      DEPENDENCY: 3
    };
  }
  extract(statements) {
    this.clear(true);
    for (const item of Array.isArray(statements) ? statements : statements.doc) {
      switch (item.stmt) {
        case STMT_STATE:
          this.addState(item.id.trim(), item.type, item.doc, item.description, item.note);
          break;
        case STMT_RELATION:
          this.addRelation(item.state1, item.state2, item.description);
          break;
        case STMT_CLASSDEF:
          this.addStyleClass(item.id.trim(), item.classes);
          break;
        case STMT_STYLEDEF:
          this.handleStyleDef(item);
          break;
        case STMT_APPLYCLASS:
          this.setCssClass(item.id.trim(), item.styleClass);
          break;
        case "click":
          this.addLink(item.id, item.url, item.tooltip);
          break;
      }
    }
    const diagramStates = this.getStates();
    const config = getConfig2();
    reset();
    dataFetcher(undefined, this.getRootDocV2(), diagramStates, this.nodes, this.edges, true, config.look, this.classes);
    for (const node of this.nodes) {
      if (!Array.isArray(node.label)) {
        continue;
      }
      node.description = node.label.slice(1);
      if (node.isGroup && node.description.length > 0) {
        throw new Error(`Group nodes can only have label. Remove the additional description for node [${node.id}]`);
      }
      node.label = node.label[0];
    }
  }
  handleStyleDef(item) {
    const ids = item.id.trim().split(",");
    const styles = item.styleClass.split(",");
    for (const id of ids) {
      let state = this.getState(id);
      if (!state) {
        const trimmedId = id.trim();
        this.addState(trimmedId);
        state = this.getState(trimmedId);
      }
      if (state) {
        state.styles = styles.map((s) => s.replace(/;/g, "")?.trim());
      }
    }
  }
  setRootDoc(o) {
    log.info("Setting root doc", o);
    this.rootDoc = o;
    if (this.version === 1) {
      this.extract(o);
    } else {
      this.extract(this.getRootDocV2());
    }
  }
  docTranslator(parent, node, first) {
    if (node.stmt === STMT_RELATION) {
      this.docTranslator(parent, node.state1, true);
      this.docTranslator(parent, node.state2, false);
      return;
    }
    if (node.stmt === STMT_STATE) {
      if (node.id === CONSTANTS.START_NODE) {
        node.id = parent.id + (first ? "_start" : "_end");
        node.start = first;
      } else {
        node.id = node.id.trim();
      }
    }
    if (node.stmt !== STMT_ROOT && node.stmt !== STMT_STATE || !node.doc) {
      return;
    }
    const doc = [];
    let currentDoc = [];
    for (const stmt of node.doc) {
      if (stmt.type === DIVIDER_TYPE) {
        const newNode = clone(stmt);
        newNode.doc = clone(currentDoc);
        doc.push(newNode);
        currentDoc = [];
      } else {
        currentDoc.push(stmt);
      }
    }
    if (doc.length > 0 && currentDoc.length > 0) {
      const newNode = {
        stmt: STMT_STATE,
        id: generateId(),
        type: "divider",
        doc: clone(currentDoc)
      };
      doc.push(clone(newNode));
      node.doc = doc;
    }
    node.doc.forEach((docNode) => this.docTranslator(node, docNode, true));
  }
  getRootDocV2() {
    this.docTranslator({ id: STMT_ROOT, stmt: STMT_ROOT }, { id: STMT_ROOT, stmt: STMT_ROOT, doc: this.rootDoc }, true);
    return { id: STMT_ROOT, doc: this.rootDoc };
  }
  addState(id, type = DEFAULT_STATE_TYPE, doc = undefined, descr = undefined, note = undefined, classes = undefined, styles = undefined, textStyles = undefined) {
    const trimmedId = id?.trim();
    if (!this.currentDocument.states.has(trimmedId)) {
      log.info("Adding state ", trimmedId, descr);
      this.currentDocument.states.set(trimmedId, {
        stmt: STMT_STATE,
        id: trimmedId,
        descriptions: [],
        type,
        doc,
        note,
        classes: [],
        styles: [],
        textStyles: []
      });
    } else {
      const state = this.currentDocument.states.get(trimmedId);
      if (!state) {
        throw new Error(`State not found: ${trimmedId}`);
      }
      if (!state.doc) {
        state.doc = doc;
      }
      if (!state.type) {
        state.type = type;
      }
    }
    if (descr) {
      log.info("Setting state description", trimmedId, descr);
      const descriptions = Array.isArray(descr) ? descr : [descr];
      descriptions.forEach((des) => this.addDescription(trimmedId, des.trim()));
    }
    if (note) {
      const doc2 = this.currentDocument.states.get(trimmedId);
      if (!doc2) {
        throw new Error(`State not found: ${trimmedId}`);
      }
      doc2.note = note;
      doc2.note.text = common_default.sanitizeText(doc2.note.text, getConfig2());
    }
    if (classes) {
      log.info("Setting state classes", trimmedId, classes);
      const classesList = Array.isArray(classes) ? classes : [classes];
      classesList.forEach((cssClass) => this.setCssClass(trimmedId, cssClass.trim()));
    }
    if (styles) {
      log.info("Setting state styles", trimmedId, styles);
      const stylesList = Array.isArray(styles) ? styles : [styles];
      stylesList.forEach((style) => this.setStyle(trimmedId, style.trim()));
    }
    if (textStyles) {
      log.info("Setting state styles", trimmedId, styles);
      const textStylesList = Array.isArray(textStyles) ? textStyles : [textStyles];
      textStylesList.forEach((textStyle) => this.setTextStyle(trimmedId, textStyle.trim()));
    }
  }
  clear(saveCommon) {
    this.nodes = [];
    this.edges = [];
    this.documents = { root: newDoc() };
    this.currentDocument = this.documents.root;
    this.startEndCount = 0;
    this.classes = newClassesList();
    if (!saveCommon) {
      this.links = /* @__PURE__ */ new Map;
      clear();
    }
  }
  getState(id) {
    return this.currentDocument.states.get(id);
  }
  getStates() {
    return this.currentDocument.states;
  }
  logDocuments() {
    log.info("Documents = ", this.documents);
  }
  getRelations() {
    return this.currentDocument.relations;
  }
  addLink(stateId, url, tooltip) {
    this.links.set(stateId, { url, tooltip });
    log.warn("Adding link", stateId, url, tooltip);
  }
  getLinks() {
    return this.links;
  }
  startIdIfNeeded(id = "") {
    if (id === CONSTANTS.START_NODE) {
      this.startEndCount++;
      return `${CONSTANTS.START_TYPE}${this.startEndCount}`;
    }
    return id;
  }
  startTypeIfNeeded(id = "", type = DEFAULT_STATE_TYPE) {
    return id === CONSTANTS.START_NODE ? CONSTANTS.START_TYPE : type;
  }
  endIdIfNeeded(id = "") {
    if (id === CONSTANTS.END_NODE) {
      this.startEndCount++;
      return `${CONSTANTS.END_TYPE}${this.startEndCount}`;
    }
    return id;
  }
  endTypeIfNeeded(id = "", type = DEFAULT_STATE_TYPE) {
    return id === CONSTANTS.END_NODE ? CONSTANTS.END_TYPE : type;
  }
  addRelationObjs(item1, item2, relationTitle = "") {
    const id1 = this.startIdIfNeeded(item1.id.trim());
    const type1 = this.startTypeIfNeeded(item1.id.trim(), item1.type);
    const id2 = this.startIdIfNeeded(item2.id.trim());
    const type2 = this.startTypeIfNeeded(item2.id.trim(), item2.type);
    this.addState(id1, type1, item1.doc, item1.description, item1.note, item1.classes, item1.styles, item1.textStyles);
    this.addState(id2, type2, item2.doc, item2.description, item2.note, item2.classes, item2.styles, item2.textStyles);
    this.currentDocument.relations.push({
      id1,
      id2,
      relationTitle: common_default.sanitizeText(relationTitle, getConfig2())
    });
  }
  addRelation(item1, item2, title) {
    if (typeof item1 === "object" && typeof item2 === "object") {
      this.addRelationObjs(item1, item2, title);
    } else if (typeof item1 === "string" && typeof item2 === "string") {
      const id1 = this.startIdIfNeeded(item1.trim());
      const type1 = this.startTypeIfNeeded(item1);
      const id2 = this.endIdIfNeeded(item2.trim());
      const type2 = this.endTypeIfNeeded(item2);
      this.addState(id1, type1);
      this.addState(id2, type2);
      this.currentDocument.relations.push({
        id1,
        id2,
        relationTitle: title ? common_default.sanitizeText(title, getConfig2()) : undefined
      });
    }
  }
  addDescription(id, descr) {
    const theState = this.currentDocument.states.get(id);
    const _descr = descr.startsWith(":") ? descr.replace(":", "").trim() : descr;
    theState?.descriptions?.push(common_default.sanitizeText(_descr, getConfig2()));
  }
  cleanupLabel(label) {
    return label.startsWith(":") ? label.slice(2).trim() : label.trim();
  }
  getDividerId() {
    this.dividerCnt++;
    return `divider-id-${this.dividerCnt}`;
  }
  addStyleClass(id, styleAttributes = "") {
    if (!this.classes.has(id)) {
      this.classes.set(id, { id, styles: [], textStyles: [] });
    }
    const foundClass = this.classes.get(id);
    if (styleAttributes && foundClass) {
      styleAttributes.split(CONSTANTS.STYLECLASS_SEP).forEach((attrib) => {
        const fixedAttrib = attrib.replace(/([^;]*);/, "$1").trim();
        if (RegExp(CONSTANTS.COLOR_KEYWORD).exec(attrib)) {
          const newStyle1 = fixedAttrib.replace(CONSTANTS.FILL_KEYWORD, CONSTANTS.BG_FILL);
          const newStyle2 = newStyle1.replace(CONSTANTS.COLOR_KEYWORD, CONSTANTS.FILL_KEYWORD);
          foundClass.textStyles.push(newStyle2);
        }
        foundClass.styles.push(fixedAttrib);
      });
    }
  }
  getClasses() {
    return this.classes;
  }
  setCssClass(itemIds, cssClassName) {
    itemIds.split(",").forEach((id) => {
      let foundState = this.getState(id);
      if (!foundState) {
        const trimmedId = id.trim();
        this.addState(trimmedId);
        foundState = this.getState(trimmedId);
      }
      foundState?.classes?.push(cssClassName);
    });
  }
  setStyle(itemId, styleText) {
    this.getState(itemId)?.styles?.push(styleText);
  }
  setTextStyle(itemId, cssClassName) {
    this.getState(itemId)?.textStyles?.push(cssClassName);
  }
  getDirectionStatement() {
    return this.rootDoc.find((doc) => doc.stmt === STMT_DIRECTION);
  }
  getDirection() {
    return this.getDirectionStatement()?.value ?? DEFAULT_DIAGRAM_DIRECTION;
  }
  setDirection(dir) {
    const doc = this.getDirectionStatement();
    if (doc) {
      doc.value = dir;
    } else {
      this.rootDoc.unshift({ stmt: STMT_DIRECTION, value: dir });
    }
  }
  trimColon(str) {
    return str.startsWith(":") ? str.slice(1).trim() : str.trim();
  }
  getData() {
    const config = getConfig2();
    return {
      nodes: this.nodes,
      edges: this.edges,
      other: {},
      config,
      direction: getDir(this.getRootDocV2())
    };
  }
  getConfig() {
    return getConfig2().state;
  }
};
var getStyles = /* @__PURE__ */ __name((options) => `
defs [id$="-barbEnd"] {
    fill: ${options.transitionColor};
    stroke: ${options.transitionColor};
  }
g.stateGroup text {
  fill: ${options.nodeBorder};
  stroke: none;
  font-size: 10px;
}
g.stateGroup text {
  fill: ${options.textColor};
  stroke: none;
  font-size: 10px;

}
g.stateGroup .state-title {
  font-weight: bolder;
  fill: ${options.stateLabelColor};
}

g.stateGroup rect {
  fill: ${options.mainBkg};
  stroke: ${options.nodeBorder};
}

g.stateGroup line {
  stroke: ${options.lineColor};
  stroke-width: ${options.strokeWidth || 1};
}

.transition {
  stroke: ${options.transitionColor};
  stroke-width: ${options.strokeWidth || 1};
  fill: none;
}

.stateGroup .composit {
  fill: ${options.background};
  border-bottom: 1px
}

.stateGroup .alt-composit {
  fill: #e0e0e0;
  border-bottom: 1px
}

.state-note {
  stroke: ${options.noteBorderColor};
  fill: ${options.noteBkgColor};

  text {
    fill: ${options.noteTextColor};
    stroke: none;
    font-size: 10px;
  }
}

.stateLabel .box {
  stroke: none;
  stroke-width: 0;
  fill: ${options.mainBkg};
  opacity: 0.5;
}

.edgeLabel .label rect {
  fill: ${options.labelBackgroundColor};
  opacity: 0.5;
}
.edgeLabel {
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
.edgeLabel .label text {
  fill: ${options.transitionLabelColor || options.tertiaryTextColor};
}
.label div .edgeLabel {
  color: ${options.transitionLabelColor || options.tertiaryTextColor};
}

.stateLabel text {
  fill: ${options.stateLabelColor};
  font-size: 10px;
  font-weight: bold;
}

.node circle.state-start {
  fill: ${options.specialStateColor};
  stroke: ${options.specialStateColor};
}

.node .fork-join {
  fill: ${options.specialStateColor};
  stroke: ${options.specialStateColor};
}

.node circle.state-end {
  fill: ${options.innerEndBackground};
  stroke: ${options.background};
  stroke-width: 1.5
}
.end-state-inner {
  fill: ${options.compositeBackground || options.background};
  // stroke: ${options.background};
  stroke-width: 1.5
}

.node rect {
  fill: ${options.stateBkg || options.mainBkg};
  stroke: ${options.stateBorder || options.nodeBorder};
  stroke-width: ${options.strokeWidth || 1}px;
}
.node polygon {
  fill: ${options.mainBkg};
  stroke: ${options.stateBorder || options.nodeBorder};;
  stroke-width: ${options.strokeWidth || 1}px;
}
[id$="-barbEnd"] {
  fill: ${options.lineColor};
}

.statediagram-cluster rect {
  fill: ${options.compositeTitleBackground};
  stroke: ${options.stateBorder || options.nodeBorder};
  stroke-width: ${options.strokeWidth || 1}px;
}

.cluster-label, .nodeLabel {
  color: ${options.stateLabelColor};
  // line-height: 1;
}

.statediagram-cluster rect.outer {
  rx: 5px;
  ry: 5px;
}
.statediagram-state .divider {
  stroke: ${options.stateBorder || options.nodeBorder};
}

.statediagram-state .title-state {
  rx: 5px;
  ry: 5px;
}
.statediagram-cluster.statediagram-cluster .inner {
  fill: ${options.compositeBackground || options.background};
}
.statediagram-cluster.statediagram-cluster-alt .inner {
  fill: ${options.altBackground ? options.altBackground : "#efefef"};
}

.statediagram-cluster .inner {
  rx:0;
  ry:0;
}

.statediagram-state rect.basic {
  rx: 5px;
  ry: 5px;
}
.statediagram-state rect.divider {
  stroke-dasharray: 10,10;
  fill: ${options.altBackground ? options.altBackground : "#efefef"};
}

.note-edge {
  stroke-dasharray: 5;
}

.statediagram-note rect {
  fill: ${options.noteBkgColor};
  stroke: ${options.noteBorderColor};
  stroke-width: 1px;
  rx: 0;
  ry: 0;
}
.statediagram-note rect {
  fill: ${options.noteBkgColor};
  stroke: ${options.noteBorderColor};
  stroke-width: 1px;
  rx: 0;
  ry: 0;
}

.statediagram-note text {
  fill: ${options.noteTextColor};
}

.statediagram-note .nodeLabel {
  color: ${options.noteTextColor};
}
.statediagram .edgeLabel {
  color: red; // ${options.noteTextColor};
}

[id$="-dependencyStart"], [id$="-dependencyEnd"] {
  fill: ${options.lineColor};
  stroke: ${options.lineColor};
  stroke-width: ${options.strokeWidth || 1};
}

.statediagramTitleText {
  text-anchor: middle;
  font-size: 18px;
  fill: ${options.textColor};
}

[data-look="neo"].statediagram-cluster rect {
  fill: ${options.mainBkg};
  stroke: ${options.useGradient ? "url(" + options.svgId + "-gradient)" : options.stateBorder || options.nodeBorder};
  stroke-width: ${options.strokeWidth ?? 1};
}
[data-look="neo"].statediagram-cluster rect.outer {
  rx: ${options.radius}px;
  ry: ${options.radius}px;
  filter: ${options.dropShadow ? options.dropShadow.replace("url(#drop-shadow)", `url(${options.svgId}-drop-shadow)`) : "none"}
}
`, "getStyles");
var styles_default = getStyles;

export { stateDiagram_default, stateRenderer_v3_unified_default, StateDB, styles_default };

//# debugId=F485DD2A1FF14A4464756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2NodW5rLUFRUDJENUVKLm1qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJpbXBvcnQge1xuICBnZXREaWFncmFtRWxlbWVudFxufSBmcm9tIFwiLi9jaHVuay01NUlBQ0VCNi5tanNcIjtcbmltcG9ydCB7XG4gIHNldHVwVmlld1BvcnRGb3JTVkdcbn0gZnJvbSBcIi4vY2h1bmstMkozM1dUTUgubWpzXCI7XG5pbXBvcnQge1xuICByZW5kZXJcbn0gZnJvbSBcIi4vY2h1bmstTFpYRURaQ0EubWpzXCI7XG5pbXBvcnQge1xuICBnZW5lcmF0ZUlkLFxuICB1dGlsc19kZWZhdWx0XG59IGZyb20gXCIuL2NodW5rLTVaUVlIWEtVLm1qc1wiO1xuaW1wb3J0IHtcbiAgY2xlYXIsXG4gIGNvbW1vbl9kZWZhdWx0LFxuICBnZXRBY2NEZXNjcmlwdGlvbixcbiAgZ2V0QWNjVGl0bGUsXG4gIGdldENvbmZpZzIgYXMgZ2V0Q29uZmlnLFxuICBnZXREaWFncmFtVGl0bGUsXG4gIHNldEFjY0Rlc2NyaXB0aW9uLFxuICBzZXRBY2NUaXRsZSxcbiAgc2V0RGlhZ3JhbVRpdGxlXG59IGZyb20gXCIuL2NodW5rLUNTQ0lISzdRLm1qc1wiO1xuaW1wb3J0IHtcbiAgX19uYW1lLFxuICBsb2dcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIHNyYy9kaWFncmFtcy9zdGF0ZS9wYXJzZXIvc3RhdGVEaWFncmFtLmppc29uXG52YXIgcGFyc2VyID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgbyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oaywgdiwgbzIsIGwpIHtcbiAgICBmb3IgKG8yID0gbzIgfHwge30sIGwgPSBrLmxlbmd0aDsgbC0tOyBvMltrW2xdXSA9IHYpIDtcbiAgICByZXR1cm4gbzI7XG4gIH0sIFwib1wiKSwgJFYwID0gWzEsIDJdLCAkVjEgPSBbMSwgM10sICRWMiA9IFsxLCA0XSwgJFYzID0gWzIsIDRdLCAkVjQgPSBbMSwgOV0sICRWNSA9IFsxLCAxMV0sICRWNiA9IFsxLCAxNl0sICRWNyA9IFsxLCAxN10sICRWOCA9IFsxLCAxOF0sICRWOSA9IFsxLCAxOV0sICRWYSA9IFsxLCAzM10sICRWYiA9IFsxLCAyMF0sICRWYyA9IFsxLCAyMV0sICRWZCA9IFsxLCAyMl0sICRWZSA9IFsxLCAyM10sICRWZiA9IFsxLCAyNF0sICRWZyA9IFsxLCAyNl0sICRWaCA9IFsxLCAyN10sICRWaSA9IFsxLCAyOF0sICRWaiA9IFsxLCAyOV0sICRWayA9IFsxLCAzMF0sICRWbCA9IFsxLCAzMV0sICRWbSA9IFsxLCAzMl0sICRWbiA9IFsxLCAzNV0sICRWbyA9IFsxLCAzNl0sICRWcCA9IFsxLCAzN10sICRWcSA9IFsxLCAzOF0sICRWciA9IFsxLCAzNF0sICRWcyA9IFsxLCA0LCA1LCAxNiwgMTcsIDE5LCAyMSwgMjIsIDI0LCAyNSwgMjYsIDI3LCAyOCwgMjksIDMzLCAzNSwgMzcsIDM4LCA0MSwgNDUsIDQ4LCA1MSwgNTIsIDUzLCA1NCwgNTddLCAkVnQgPSBbMSwgNCwgNSwgMTQsIDE1LCAxNiwgMTcsIDE5LCAyMSwgMjIsIDI0LCAyNSwgMjYsIDI3LCAyOCwgMjksIDMzLCAzNSwgMzcsIDM4LCAzOSwgNDAsIDQxLCA0NSwgNDgsIDUxLCA1MiwgNTMsIDU0LCA1N10sICRWdSA9IFs0LCA1LCAxNiwgMTcsIDE5LCAyMSwgMjIsIDI0LCAyNSwgMjYsIDI3LCAyOCwgMjksIDMzLCAzNSwgMzcsIDM4LCA0MSwgNDUsIDQ4LCA1MSwgNTIsIDUzLCA1NCwgNTddO1xuICB2YXIgcGFyc2VyMiA9IHtcbiAgICB0cmFjZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiB0cmFjZSgpIHtcbiAgICB9LCBcInRyYWNlXCIpLFxuICAgIHl5OiB7fSxcbiAgICBzeW1ib2xzXzogeyBcImVycm9yXCI6IDIsIFwic3RhcnRcIjogMywgXCJTUEFDRVwiOiA0LCBcIk5MXCI6IDUsIFwiU0RcIjogNiwgXCJkb2N1bWVudFwiOiA3LCBcImxpbmVcIjogOCwgXCJzdGF0ZW1lbnRcIjogOSwgXCJjbGFzc0RlZlN0YXRlbWVudFwiOiAxMCwgXCJzdHlsZVN0YXRlbWVudFwiOiAxMSwgXCJjc3NDbGFzc1N0YXRlbWVudFwiOiAxMiwgXCJpZFN0YXRlbWVudFwiOiAxMywgXCJERVNDUlwiOiAxNCwgXCItLT5cIjogMTUsIFwiSElERV9FTVBUWVwiOiAxNiwgXCJzY2FsZVwiOiAxNywgXCJXSURUSFwiOiAxOCwgXCJDT01QT1NJVF9TVEFURVwiOiAxOSwgXCJTVFJVQ1RfU1RBUlRcIjogMjAsIFwiU1RSVUNUX1NUT1BcIjogMjEsIFwiU1RBVEVfREVTQ1JcIjogMjIsIFwiQVNcIjogMjMsIFwiSURcIjogMjQsIFwiRk9SS1wiOiAyNSwgXCJKT0lOXCI6IDI2LCBcIkNIT0lDRVwiOiAyNywgXCJDT05DVVJSRU5UXCI6IDI4LCBcIm5vdGVcIjogMjksIFwibm90ZVBvc2l0aW9uXCI6IDMwLCBcIk5PVEVfVEVYVFwiOiAzMSwgXCJkaXJlY3Rpb25cIjogMzIsIFwiYWNjX3RpdGxlXCI6IDMzLCBcImFjY190aXRsZV92YWx1ZVwiOiAzNCwgXCJhY2NfZGVzY3JcIjogMzUsIFwiYWNjX2Rlc2NyX3ZhbHVlXCI6IDM2LCBcImFjY19kZXNjcl9tdWx0aWxpbmVfdmFsdWVcIjogMzcsIFwiQ0xJQ0tcIjogMzgsIFwiU1RSSU5HXCI6IDM5LCBcIkhSRUZcIjogNDAsIFwiY2xhc3NEZWZcIjogNDEsIFwiQ0xBU1NERUZfSURcIjogNDIsIFwiQ0xBU1NERUZfU1RZTEVPUFRTXCI6IDQzLCBcIkRFRkFVTFRcIjogNDQsIFwic3R5bGVcIjogNDUsIFwiU1RZTEVfSURTXCI6IDQ2LCBcIlNUWUxFREVGX1NUWUxFT1BUU1wiOiA0NywgXCJjbGFzc1wiOiA0OCwgXCJDTEFTU0VOVElUWV9JRFNcIjogNDksIFwiU1RZTEVDTEFTU1wiOiA1MCwgXCJkaXJlY3Rpb25fdGJcIjogNTEsIFwiZGlyZWN0aW9uX2J0XCI6IDUyLCBcImRpcmVjdGlvbl9ybFwiOiA1MywgXCJkaXJlY3Rpb25fbHJcIjogNTQsIFwiZW9sXCI6IDU1LCBcIjtcIjogNTYsIFwiRURHRV9TVEFURVwiOiA1NywgXCJTVFlMRV9TRVBBUkFUT1JcIjogNTgsIFwibGVmdF9vZlwiOiA1OSwgXCJyaWdodF9vZlwiOiA2MCwgXCIkYWNjZXB0XCI6IDAsIFwiJGVuZFwiOiAxIH0sXG4gICAgdGVybWluYWxzXzogeyAyOiBcImVycm9yXCIsIDQ6IFwiU1BBQ0VcIiwgNTogXCJOTFwiLCA2OiBcIlNEXCIsIDE0OiBcIkRFU0NSXCIsIDE1OiBcIi0tPlwiLCAxNjogXCJISURFX0VNUFRZXCIsIDE3OiBcInNjYWxlXCIsIDE4OiBcIldJRFRIXCIsIDE5OiBcIkNPTVBPU0lUX1NUQVRFXCIsIDIwOiBcIlNUUlVDVF9TVEFSVFwiLCAyMTogXCJTVFJVQ1RfU1RPUFwiLCAyMjogXCJTVEFURV9ERVNDUlwiLCAyMzogXCJBU1wiLCAyNDogXCJJRFwiLCAyNTogXCJGT1JLXCIsIDI2OiBcIkpPSU5cIiwgMjc6IFwiQ0hPSUNFXCIsIDI4OiBcIkNPTkNVUlJFTlRcIiwgMjk6IFwibm90ZVwiLCAzMTogXCJOT1RFX1RFWFRcIiwgMzM6IFwiYWNjX3RpdGxlXCIsIDM0OiBcImFjY190aXRsZV92YWx1ZVwiLCAzNTogXCJhY2NfZGVzY3JcIiwgMzY6IFwiYWNjX2Rlc2NyX3ZhbHVlXCIsIDM3OiBcImFjY19kZXNjcl9tdWx0aWxpbmVfdmFsdWVcIiwgMzg6IFwiQ0xJQ0tcIiwgMzk6IFwiU1RSSU5HXCIsIDQwOiBcIkhSRUZcIiwgNDE6IFwiY2xhc3NEZWZcIiwgNDI6IFwiQ0xBU1NERUZfSURcIiwgNDM6IFwiQ0xBU1NERUZfU1RZTEVPUFRTXCIsIDQ0OiBcIkRFRkFVTFRcIiwgNDU6IFwic3R5bGVcIiwgNDY6IFwiU1RZTEVfSURTXCIsIDQ3OiBcIlNUWUxFREVGX1NUWUxFT1BUU1wiLCA0ODogXCJjbGFzc1wiLCA0OTogXCJDTEFTU0VOVElUWV9JRFNcIiwgNTA6IFwiU1RZTEVDTEFTU1wiLCA1MTogXCJkaXJlY3Rpb25fdGJcIiwgNTI6IFwiZGlyZWN0aW9uX2J0XCIsIDUzOiBcImRpcmVjdGlvbl9ybFwiLCA1NDogXCJkaXJlY3Rpb25fbHJcIiwgNTY6IFwiO1wiLCA1NzogXCJFREdFX1NUQVRFXCIsIDU4OiBcIlNUWUxFX1NFUEFSQVRPUlwiLCA1OTogXCJsZWZ0X29mXCIsIDYwOiBcInJpZ2h0X29mXCIgfSxcbiAgICBwcm9kdWN0aW9uc186IFswLCBbMywgMl0sIFszLCAyXSwgWzMsIDJdLCBbNywgMF0sIFs3LCAyXSwgWzgsIDJdLCBbOCwgMV0sIFs4LCAxXSwgWzksIDFdLCBbOSwgMV0sIFs5LCAxXSwgWzksIDFdLCBbOSwgMl0sIFs5LCAzXSwgWzksIDRdLCBbOSwgMV0sIFs5LCAyXSwgWzksIDFdLCBbOSwgNF0sIFs5LCAzXSwgWzksIDZdLCBbOSwgMV0sIFs5LCAxXSwgWzksIDFdLCBbOSwgMV0sIFs5LCA0XSwgWzksIDRdLCBbOSwgMV0sIFs5LCAyXSwgWzksIDJdLCBbOSwgMV0sIFs5LCA1XSwgWzksIDVdLCBbMTAsIDNdLCBbMTAsIDNdLCBbMTEsIDNdLCBbMTIsIDNdLCBbMzIsIDFdLCBbMzIsIDFdLCBbMzIsIDFdLCBbMzIsIDFdLCBbNTUsIDFdLCBbNTUsIDFdLCBbMTMsIDFdLCBbMTMsIDFdLCBbMTMsIDNdLCBbMTMsIDNdLCBbMzAsIDFdLCBbMzAsIDFdXSxcbiAgICBwZXJmb3JtQWN0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGFub255bW91cyh5eXRleHQsIHl5bGVuZywgeXlsaW5lbm8sIHl5LCB5eXN0YXRlLCAkJCwgXyQpIHtcbiAgICAgIHZhciAkMCA9ICQkLmxlbmd0aCAtIDE7XG4gICAgICBzd2l0Y2ggKHl5c3RhdGUpIHtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIHl5LnNldFJvb3REb2MoJCRbJDBdKTtcbiAgICAgICAgICByZXR1cm4gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgdGhpcy4kID0gW107XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICBpZiAoJCRbJDBdICE9IFwibmxcIikge1xuICAgICAgICAgICAgJCRbJDAgLSAxXS5wdXNoKCQkWyQwXSk7XG4gICAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDFdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgdGhpcy4kID0gXCJubFwiO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICBjb25zdCBzdGF0ZVN0bXQgPSAkJFskMCAtIDFdO1xuICAgICAgICAgIHN0YXRlU3RtdC5kZXNjcmlwdGlvbiA9IHl5LnRyaW1Db2xvbigkJFskMF0pO1xuICAgICAgICAgIHRoaXMuJCA9IHN0YXRlU3RtdDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNDpcbiAgICAgICAgICB0aGlzLiQgPSB7IHN0bXQ6IFwicmVsYXRpb25cIiwgc3RhdGUxOiAkJFskMCAtIDJdLCBzdGF0ZTI6ICQkWyQwXSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgIGNvbnN0IHJlbERlc2NyaXB0aW9uID0geXkudHJpbUNvbG9uKCQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0geyBzdG10OiBcInJlbGF0aW9uXCIsIHN0YXRlMTogJCRbJDAgLSAzXSwgc3RhdGUyOiAkJFskMCAtIDFdLCBkZXNjcmlwdGlvbjogcmVsRGVzY3JpcHRpb24gfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOTpcbiAgICAgICAgICB0aGlzLiQgPSB7IHN0bXQ6IFwic3RhdGVcIiwgaWQ6ICQkWyQwIC0gM10sIHR5cGU6IFwiZGVmYXVsdFwiLCBkZXNjcmlwdGlvbjogXCJcIiwgZG9jOiAkJFskMCAtIDFdIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgdmFyIGlkID0gJCRbJDBdO1xuICAgICAgICAgIHZhciBkZXNjcmlwdGlvbiA9ICQkWyQwIC0gMl0udHJpbSgpO1xuICAgICAgICAgIGlmICgkJFskMF0ubWF0Y2goXCI6XCIpKSB7XG4gICAgICAgICAgICB2YXIgcGFydHMgPSAkJFskMF0uc3BsaXQoXCI6XCIpO1xuICAgICAgICAgICAgaWQgPSBwYXJ0c1swXTtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gW2Rlc2NyaXB0aW9uLCBwYXJ0c1sxXV07XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuJCA9IHsgc3RtdDogXCJzdGF0ZVwiLCBpZCwgdHlwZTogXCJkZWZhdWx0XCIsIGRlc2NyaXB0aW9uIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjE6XG4gICAgICAgICAgdGhpcy4kID0geyBzdG10OiBcInN0YXRlXCIsIGlkOiAkJFskMCAtIDNdLCB0eXBlOiBcImRlZmF1bHRcIiwgZGVzY3JpcHRpb246ICQkWyQwIC0gNV0sIGRvYzogJCRbJDAgLSAxXSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDIyOlxuICAgICAgICAgIHRoaXMuJCA9IHsgc3RtdDogXCJzdGF0ZVwiLCBpZDogJCRbJDBdLCB0eXBlOiBcImZvcmtcIiB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDIzOlxuICAgICAgICAgIHRoaXMuJCA9IHsgc3RtdDogXCJzdGF0ZVwiLCBpZDogJCRbJDBdLCB0eXBlOiBcImpvaW5cIiB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI0OlxuICAgICAgICAgIHRoaXMuJCA9IHsgc3RtdDogXCJzdGF0ZVwiLCBpZDogJCRbJDBdLCB0eXBlOiBcImNob2ljZVwiIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjU6XG4gICAgICAgICAgdGhpcy4kID0geyBzdG10OiBcInN0YXRlXCIsIGlkOiB5eS5nZXREaXZpZGVySWQoKSwgdHlwZTogXCJkaXZpZGVyXCIgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyNjpcbiAgICAgICAgICB0aGlzLiQgPSB7IHN0bXQ6IFwic3RhdGVcIiwgaWQ6ICQkWyQwIC0gMV0udHJpbSgpLCBub3RlOiB7IHBvc2l0aW9uOiAkJFskMCAtIDJdLnRyaW0oKSwgdGV4dDogJCRbJDBdLnRyaW0oKSB9IH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjk6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdLnRyaW0oKTtcbiAgICAgICAgICB5eS5zZXRBY2NUaXRsZSh0aGlzLiQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMwOlxuICAgICAgICBjYXNlIDMxOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS50cmltKCk7XG4gICAgICAgICAgeXkuc2V0QWNjRGVzY3JpcHRpb24odGhpcy4kKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzMjpcbiAgICAgICAgICB0aGlzLiQgPSB7XG4gICAgICAgICAgICBzdG10OiBcImNsaWNrXCIsXG4gICAgICAgICAgICBpZDogJCRbJDAgLSAzXSxcbiAgICAgICAgICAgIHVybDogJCRbJDAgLSAyXSxcbiAgICAgICAgICAgIHRvb2x0aXA6ICQkWyQwIC0gMV1cbiAgICAgICAgICB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMzOlxuICAgICAgICAgIHRoaXMuJCA9IHtcbiAgICAgICAgICAgIHN0bXQ6IFwiY2xpY2tcIixcbiAgICAgICAgICAgIGlkOiAkJFskMCAtIDNdLFxuICAgICAgICAgICAgdXJsOiAkJFskMCAtIDFdLFxuICAgICAgICAgICAgdG9vbHRpcDogXCJcIlxuICAgICAgICAgIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzQ6XG4gICAgICAgIGNhc2UgMzU6XG4gICAgICAgICAgdGhpcy4kID0geyBzdG10OiBcImNsYXNzRGVmXCIsIGlkOiAkJFskMCAtIDFdLnRyaW0oKSwgY2xhc3NlczogJCRbJDBdLnRyaW0oKSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDM2OlxuICAgICAgICAgIHRoaXMuJCA9IHsgc3RtdDogXCJzdHlsZVwiLCBpZDogJCRbJDAgLSAxXS50cmltKCksIHN0eWxlQ2xhc3M6ICQkWyQwXS50cmltKCkgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgICB0aGlzLiQgPSB7IHN0bXQ6IFwiYXBwbHlDbGFzc1wiLCBpZDogJCRbJDAgLSAxXS50cmltKCksIHN0eWxlQ2xhc3M6ICQkWyQwXS50cmltKCkgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzODpcbiAgICAgICAgICB5eS5zZXREaXJlY3Rpb24oXCJUQlwiKTtcbiAgICAgICAgICB0aGlzLiQgPSB7IHN0bXQ6IFwiZGlyXCIsIHZhbHVlOiBcIlRCXCIgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOTpcbiAgICAgICAgICB5eS5zZXREaXJlY3Rpb24oXCJCVFwiKTtcbiAgICAgICAgICB0aGlzLiQgPSB7IHN0bXQ6IFwiZGlyXCIsIHZhbHVlOiBcIkJUXCIgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0MDpcbiAgICAgICAgICB5eS5zZXREaXJlY3Rpb24oXCJSTFwiKTtcbiAgICAgICAgICB0aGlzLiQgPSB7IHN0bXQ6IFwiZGlyXCIsIHZhbHVlOiBcIlJMXCIgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0MTpcbiAgICAgICAgICB5eS5zZXREaXJlY3Rpb24oXCJMUlwiKTtcbiAgICAgICAgICB0aGlzLiQgPSB7IHN0bXQ6IFwiZGlyXCIsIHZhbHVlOiBcIkxSXCIgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0NDpcbiAgICAgICAgY2FzZSA0NTpcbiAgICAgICAgICB0aGlzLiQgPSB7IHN0bXQ6IFwic3RhdGVcIiwgaWQ6ICQkWyQwXS50cmltKCksIHR5cGU6IFwiZGVmYXVsdFwiLCBkZXNjcmlwdGlvbjogXCJcIiB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ2OlxuICAgICAgICAgIHRoaXMuJCA9IHsgc3RtdDogXCJzdGF0ZVwiLCBpZDogJCRbJDAgLSAyXS50cmltKCksIGNsYXNzZXM6IFskJFskMF0udHJpbSgpXSwgdHlwZTogXCJkZWZhdWx0XCIsIGRlc2NyaXB0aW9uOiBcIlwiIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDc6XG4gICAgICAgICAgdGhpcy4kID0geyBzdG10OiBcInN0YXRlXCIsIGlkOiAkJFskMCAtIDJdLnRyaW0oKSwgY2xhc3NlczogWyQkWyQwXS50cmltKCldLCB0eXBlOiBcImRlZmF1bHRcIiwgZGVzY3JpcHRpb246IFwiXCIgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9LCBcImFub255bW91c1wiKSxcbiAgICB0YWJsZTogW3sgMzogMSwgNDogJFYwLCA1OiAkVjEsIDY6ICRWMiB9LCB7IDE6IFszXSB9LCB7IDM6IDUsIDQ6ICRWMCwgNTogJFYxLCA2OiAkVjIgfSwgeyAzOiA2LCA0OiAkVjAsIDU6ICRWMSwgNjogJFYyIH0sIG8oWzEsIDQsIDUsIDE2LCAxNywgMTksIDIyLCAyNCwgMjUsIDI2LCAyNywgMjgsIDI5LCAzMywgMzUsIDM3LCAzOCwgNDEsIDQ1LCA0OCwgNTEsIDUyLCA1MywgNTQsIDU3XSwgJFYzLCB7IDc6IDcgfSksIHsgMTogWzIsIDFdIH0sIHsgMTogWzIsIDJdIH0sIHsgMTogWzIsIDNdLCA0OiAkVjQsIDU6ICRWNSwgODogOCwgOTogMTAsIDEwOiAxMiwgMTE6IDEzLCAxMjogMTQsIDEzOiAxNSwgMTY6ICRWNiwgMTc6ICRWNywgMTk6ICRWOCwgMjI6ICRWOSwgMjQ6ICRWYSwgMjU6ICRWYiwgMjY6ICRWYywgMjc6ICRWZCwgMjg6ICRWZSwgMjk6ICRWZiwgMzI6IDI1LCAzMzogJFZnLCAzNTogJFZoLCAzNzogJFZpLCAzODogJFZqLCA0MTogJFZrLCA0NTogJFZsLCA0ODogJFZtLCA1MTogJFZuLCA1MjogJFZvLCA1MzogJFZwLCA1NDogJFZxLCA1NzogJFZyIH0sIG8oJFZzLCBbMiwgNV0pLCB7IDk6IDM5LCAxMDogMTIsIDExOiAxMywgMTI6IDE0LCAxMzogMTUsIDE2OiAkVjYsIDE3OiAkVjcsIDE5OiAkVjgsIDIyOiAkVjksIDI0OiAkVmEsIDI1OiAkVmIsIDI2OiAkVmMsIDI3OiAkVmQsIDI4OiAkVmUsIDI5OiAkVmYsIDMyOiAyNSwgMzM6ICRWZywgMzU6ICRWaCwgMzc6ICRWaSwgMzg6ICRWaiwgNDE6ICRWaywgNDU6ICRWbCwgNDg6ICRWbSwgNTE6ICRWbiwgNTI6ICRWbywgNTM6ICRWcCwgNTQ6ICRWcSwgNTc6ICRWciB9LCBvKCRWcywgWzIsIDddKSwgbygkVnMsIFsyLCA4XSksIG8oJFZzLCBbMiwgOV0pLCBvKCRWcywgWzIsIDEwXSksIG8oJFZzLCBbMiwgMTFdKSwgbygkVnMsIFsyLCAxMl0sIHsgMTQ6IFsxLCA0MF0sIDE1OiBbMSwgNDFdIH0pLCBvKCRWcywgWzIsIDE2XSksIHsgMTg6IFsxLCA0Ml0gfSwgbygkVnMsIFsyLCAxOF0sIHsgMjA6IFsxLCA0M10gfSksIHsgMjM6IFsxLCA0NF0gfSwgbygkVnMsIFsyLCAyMl0pLCBvKCRWcywgWzIsIDIzXSksIG8oJFZzLCBbMiwgMjRdKSwgbygkVnMsIFsyLCAyNV0pLCB7IDMwOiA0NSwgMzE6IFsxLCA0Nl0sIDU5OiBbMSwgNDddLCA2MDogWzEsIDQ4XSB9LCBvKCRWcywgWzIsIDI4XSksIHsgMzQ6IFsxLCA0OV0gfSwgeyAzNjogWzEsIDUwXSB9LCBvKCRWcywgWzIsIDMxXSksIHsgMTM6IDUxLCAyNDogJFZhLCA1NzogJFZyIH0sIHsgNDI6IFsxLCA1Ml0sIDQ0OiBbMSwgNTNdIH0sIHsgNDY6IFsxLCA1NF0gfSwgeyA0OTogWzEsIDU1XSB9LCBvKCRWdCwgWzIsIDQ0XSwgeyA1ODogWzEsIDU2XSB9KSwgbygkVnQsIFsyLCA0NV0sIHsgNTg6IFsxLCA1N10gfSksIG8oJFZzLCBbMiwgMzhdKSwgbygkVnMsIFsyLCAzOV0pLCBvKCRWcywgWzIsIDQwXSksIG8oJFZzLCBbMiwgNDFdKSwgbygkVnMsIFsyLCA2XSksIG8oJFZzLCBbMiwgMTNdKSwgeyAxMzogNTgsIDI0OiAkVmEsIDU3OiAkVnIgfSwgbygkVnMsIFsyLCAxN10pLCBvKCRWdSwgJFYzLCB7IDc6IDU5IH0pLCB7IDI0OiBbMSwgNjBdIH0sIHsgMjQ6IFsxLCA2MV0gfSwgeyAyMzogWzEsIDYyXSB9LCB7IDI0OiBbMiwgNDhdIH0sIHsgMjQ6IFsyLCA0OV0gfSwgbygkVnMsIFsyLCAyOV0pLCBvKCRWcywgWzIsIDMwXSksIHsgMzk6IFsxLCA2M10sIDQwOiBbMSwgNjRdIH0sIHsgNDM6IFsxLCA2NV0gfSwgeyA0MzogWzEsIDY2XSB9LCB7IDQ3OiBbMSwgNjddIH0sIHsgNTA6IFsxLCA2OF0gfSwgeyAyNDogWzEsIDY5XSB9LCB7IDI0OiBbMSwgNzBdIH0sIG8oJFZzLCBbMiwgMTRdLCB7IDE0OiBbMSwgNzFdIH0pLCB7IDQ6ICRWNCwgNTogJFY1LCA4OiA4LCA5OiAxMCwgMTA6IDEyLCAxMTogMTMsIDEyOiAxNCwgMTM6IDE1LCAxNjogJFY2LCAxNzogJFY3LCAxOTogJFY4LCAyMTogWzEsIDcyXSwgMjI6ICRWOSwgMjQ6ICRWYSwgMjU6ICRWYiwgMjY6ICRWYywgMjc6ICRWZCwgMjg6ICRWZSwgMjk6ICRWZiwgMzI6IDI1LCAzMzogJFZnLCAzNTogJFZoLCAzNzogJFZpLCAzODogJFZqLCA0MTogJFZrLCA0NTogJFZsLCA0ODogJFZtLCA1MTogJFZuLCA1MjogJFZvLCA1MzogJFZwLCA1NDogJFZxLCA1NzogJFZyIH0sIG8oJFZzLCBbMiwgMjBdLCB7IDIwOiBbMSwgNzNdIH0pLCB7IDMxOiBbMSwgNzRdIH0sIHsgMjQ6IFsxLCA3NV0gfSwgeyAzOTogWzEsIDc2XSB9LCB7IDM5OiBbMSwgNzddIH0sIG8oJFZzLCBbMiwgMzRdKSwgbygkVnMsIFsyLCAzNV0pLCBvKCRWcywgWzIsIDM2XSksIG8oJFZzLCBbMiwgMzddKSwgbygkVnQsIFsyLCA0Nl0pLCBvKCRWdCwgWzIsIDQ3XSksIG8oJFZzLCBbMiwgMTVdKSwgbygkVnMsIFsyLCAxOV0pLCBvKCRWdSwgJFYzLCB7IDc6IDc4IH0pLCBvKCRWcywgWzIsIDI2XSksIG8oJFZzLCBbMiwgMjddKSwgeyA1OiBbMSwgNzldIH0sIHsgNTogWzEsIDgwXSB9LCB7IDQ6ICRWNCwgNTogJFY1LCA4OiA4LCA5OiAxMCwgMTA6IDEyLCAxMTogMTMsIDEyOiAxNCwgMTM6IDE1LCAxNjogJFY2LCAxNzogJFY3LCAxOTogJFY4LCAyMTogWzEsIDgxXSwgMjI6ICRWOSwgMjQ6ICRWYSwgMjU6ICRWYiwgMjY6ICRWYywgMjc6ICRWZCwgMjg6ICRWZSwgMjk6ICRWZiwgMzI6IDI1LCAzMzogJFZnLCAzNTogJFZoLCAzNzogJFZpLCAzODogJFZqLCA0MTogJFZrLCA0NTogJFZsLCA0ODogJFZtLCA1MTogJFZuLCA1MjogJFZvLCA1MzogJFZwLCA1NDogJFZxLCA1NzogJFZyIH0sIG8oJFZzLCBbMiwgMzJdKSwgbygkVnMsIFsyLCAzM10pLCBvKCRWcywgWzIsIDIxXSldLFxuICAgIGRlZmF1bHRBY3Rpb25zOiB7IDU6IFsyLCAxXSwgNjogWzIsIDJdLCA0NzogWzIsIDQ4XSwgNDg6IFsyLCA0OV0gfSxcbiAgICBwYXJzZUVycm9yOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBhcnNlRXJyb3Ioc3RyLCBoYXNoKSB7XG4gICAgICBpZiAoaGFzaC5yZWNvdmVyYWJsZSkge1xuICAgICAgICB0aGlzLnRyYWNlKHN0cik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3Ioc3RyKTtcbiAgICAgICAgZXJyb3IuaGFzaCA9IGhhc2g7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sIFwicGFyc2VFcnJvclwiKSxcbiAgICBwYXJzZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwYXJzZShpbnB1dCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLCBzdGFjayA9IFswXSwgdHN0YWNrID0gW10sIHZzdGFjayA9IFtudWxsXSwgbHN0YWNrID0gW10sIHRhYmxlID0gdGhpcy50YWJsZSwgeXl0ZXh0ID0gXCJcIiwgeXlsaW5lbm8gPSAwLCB5eWxlbmcgPSAwLCByZWNvdmVyaW5nID0gMCwgVEVSUk9SID0gMiwgRU9GID0gMTtcbiAgICAgIHZhciBhcmdzID0gbHN0YWNrLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIHZhciBsZXhlcjIgPSBPYmplY3QuY3JlYXRlKHRoaXMubGV4ZXIpO1xuICAgICAgdmFyIHNoYXJlZFN0YXRlID0geyB5eToge30gfTtcbiAgICAgIGZvciAodmFyIGsgaW4gdGhpcy55eSkge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMueXksIGspKSB7XG4gICAgICAgICAgc2hhcmVkU3RhdGUueXlba10gPSB0aGlzLnl5W2tdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsZXhlcjIuc2V0SW5wdXQoaW5wdXQsIHNoYXJlZFN0YXRlLnl5KTtcbiAgICAgIHNoYXJlZFN0YXRlLnl5LmxleGVyID0gbGV4ZXIyO1xuICAgICAgc2hhcmVkU3RhdGUueXkucGFyc2VyID0gdGhpcztcbiAgICAgIGlmICh0eXBlb2YgbGV4ZXIyLnl5bGxvYyA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGxleGVyMi55eWxsb2MgPSB7fTtcbiAgICAgIH1cbiAgICAgIHZhciB5eWxvYyA9IGxleGVyMi55eWxsb2M7XG4gICAgICBsc3RhY2sucHVzaCh5eWxvYyk7XG4gICAgICB2YXIgcmFuZ2VzID0gbGV4ZXIyLm9wdGlvbnMgJiYgbGV4ZXIyLm9wdGlvbnMucmFuZ2VzO1xuICAgICAgaWYgKHR5cGVvZiBzaGFyZWRTdGF0ZS55eS5wYXJzZUVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhpcy5wYXJzZUVycm9yID0gc2hhcmVkU3RhdGUueXkucGFyc2VFcnJvcjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGFyc2VFcnJvciA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKS5wYXJzZUVycm9yO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gcG9wU3RhY2sobikge1xuICAgICAgICBzdGFjay5sZW5ndGggPSBzdGFjay5sZW5ndGggLSAyICogbjtcbiAgICAgICAgdnN0YWNrLmxlbmd0aCA9IHZzdGFjay5sZW5ndGggLSBuO1xuICAgICAgICBsc3RhY2subGVuZ3RoID0gbHN0YWNrLmxlbmd0aCAtIG47XG4gICAgICB9XG4gICAgICBfX25hbWUocG9wU3RhY2ssIFwicG9wU3RhY2tcIik7XG4gICAgICBmdW5jdGlvbiBsZXgoKSB7XG4gICAgICAgIHZhciB0b2tlbjtcbiAgICAgICAgdG9rZW4gPSB0c3RhY2sucG9wKCkgfHwgbGV4ZXIyLmxleCgpIHx8IEVPRjtcbiAgICAgICAgaWYgKHR5cGVvZiB0b2tlbiAhPT0gXCJudW1iZXJcIikge1xuICAgICAgICAgIGlmICh0b2tlbiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICB0c3RhY2sgPSB0b2tlbjtcbiAgICAgICAgICAgIHRva2VuID0gdHN0YWNrLnBvcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0b2tlbiA9IHNlbGYuc3ltYm9sc19bdG9rZW5dIHx8IHRva2VuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgIH1cbiAgICAgIF9fbmFtZShsZXgsIFwibGV4XCIpO1xuICAgICAgdmFyIHN5bWJvbCwgcHJlRXJyb3JTeW1ib2wsIHN0YXRlLCBhY3Rpb24sIGEsIHIsIHl5dmFsID0ge30sIHAsIGxlbiwgbmV3U3RhdGUsIGV4cGVjdGVkO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgc3RhdGUgPSBzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKHRoaXMuZGVmYXVsdEFjdGlvbnNbc3RhdGVdKSB7XG4gICAgICAgICAgYWN0aW9uID0gdGhpcy5kZWZhdWx0QWN0aW9uc1tzdGF0ZV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHN5bWJvbCA9PT0gbnVsbCB8fCB0eXBlb2Ygc3ltYm9sID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHN5bWJvbCA9IGxleCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhY3Rpb24gPSB0YWJsZVtzdGF0ZV0gJiYgdGFibGVbc3RhdGVdW3N5bWJvbF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBhY3Rpb24gPT09IFwidW5kZWZpbmVkXCIgfHwgIWFjdGlvbi5sZW5ndGggfHwgIWFjdGlvblswXSkge1xuICAgICAgICAgIHZhciBlcnJTdHIgPSBcIlwiO1xuICAgICAgICAgIGV4cGVjdGVkID0gW107XG4gICAgICAgICAgZm9yIChwIGluIHRhYmxlW3N0YXRlXSkge1xuICAgICAgICAgICAgaWYgKHRoaXMudGVybWluYWxzX1twXSAmJiBwID4gVEVSUk9SKSB7XG4gICAgICAgICAgICAgIGV4cGVjdGVkLnB1c2goXCInXCIgKyB0aGlzLnRlcm1pbmFsc19bcF0gKyBcIidcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChsZXhlcjIuc2hvd1Bvc2l0aW9uKSB7XG4gICAgICAgICAgICBlcnJTdHIgPSBcIlBhcnNlIGVycm9yIG9uIGxpbmUgXCIgKyAoeXlsaW5lbm8gKyAxKSArIFwiOlxcblwiICsgbGV4ZXIyLnNob3dQb3NpdGlvbigpICsgXCJcXG5FeHBlY3RpbmcgXCIgKyBleHBlY3RlZC5qb2luKFwiLCBcIikgKyBcIiwgZ290ICdcIiArICh0aGlzLnRlcm1pbmFsc19bc3ltYm9sXSB8fCBzeW1ib2wpICsgXCInXCI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVyclN0ciA9IFwiUGFyc2UgZXJyb3Igb24gbGluZSBcIiArICh5eWxpbmVubyArIDEpICsgXCI6IFVuZXhwZWN0ZWQgXCIgKyAoc3ltYm9sID09IEVPRiA/IFwiZW5kIG9mIGlucHV0XCIgOiBcIidcIiArICh0aGlzLnRlcm1pbmFsc19bc3ltYm9sXSB8fCBzeW1ib2wpICsgXCInXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnBhcnNlRXJyb3IoZXJyU3RyLCB7XG4gICAgICAgICAgICB0ZXh0OiBsZXhlcjIubWF0Y2gsXG4gICAgICAgICAgICB0b2tlbjogdGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sLFxuICAgICAgICAgICAgbGluZTogbGV4ZXIyLnl5bGluZW5vLFxuICAgICAgICAgICAgbG9jOiB5eWxvYyxcbiAgICAgICAgICAgIGV4cGVjdGVkXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFjdGlvblswXSBpbnN0YW5jZW9mIEFycmF5ICYmIGFjdGlvbi5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyc2UgRXJyb3I6IG11bHRpcGxlIGFjdGlvbnMgcG9zc2libGUgYXQgc3RhdGU6IFwiICsgc3RhdGUgKyBcIiwgdG9rZW46IFwiICsgc3ltYm9sKTtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKGFjdGlvblswXSkge1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHN0YWNrLnB1c2goc3ltYm9sKTtcbiAgICAgICAgICAgIHZzdGFjay5wdXNoKGxleGVyMi55eXRleHQpO1xuICAgICAgICAgICAgbHN0YWNrLnB1c2gobGV4ZXIyLnl5bGxvYyk7XG4gICAgICAgICAgICBzdGFjay5wdXNoKGFjdGlvblsxXSk7XG4gICAgICAgICAgICBzeW1ib2wgPSBudWxsO1xuICAgICAgICAgICAgaWYgKCFwcmVFcnJvclN5bWJvbCkge1xuICAgICAgICAgICAgICB5eWxlbmcgPSBsZXhlcjIueXlsZW5nO1xuICAgICAgICAgICAgICB5eXRleHQgPSBsZXhlcjIueXl0ZXh0O1xuICAgICAgICAgICAgICB5eWxpbmVubyA9IGxleGVyMi55eWxpbmVubztcbiAgICAgICAgICAgICAgeXlsb2MgPSBsZXhlcjIueXlsbG9jO1xuICAgICAgICAgICAgICBpZiAocmVjb3ZlcmluZyA+IDApIHtcbiAgICAgICAgICAgICAgICByZWNvdmVyaW5nLS07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHN5bWJvbCA9IHByZUVycm9yU3ltYm9sO1xuICAgICAgICAgICAgICBwcmVFcnJvclN5bWJvbCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBsZW4gPSB0aGlzLnByb2R1Y3Rpb25zX1thY3Rpb25bMV1dWzFdO1xuICAgICAgICAgICAgeXl2YWwuJCA9IHZzdGFja1t2c3RhY2subGVuZ3RoIC0gbGVuXTtcbiAgICAgICAgICAgIHl5dmFsLl8kID0ge1xuICAgICAgICAgICAgICBmaXJzdF9saW5lOiBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIChsZW4gfHwgMSldLmZpcnN0X2xpbmUsXG4gICAgICAgICAgICAgIGxhc3RfbGluZTogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAxXS5sYXN0X2xpbmUsXG4gICAgICAgICAgICAgIGZpcnN0X2NvbHVtbjogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgICAgIGxhc3RfY29sdW1uOiBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIDFdLmxhc3RfY29sdW1uXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHJhbmdlcykge1xuICAgICAgICAgICAgICB5eXZhbC5fJC5yYW5nZSA9IFtcbiAgICAgICAgICAgICAgICBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIChsZW4gfHwgMSldLnJhbmdlWzBdLFxuICAgICAgICAgICAgICAgIGxzdGFja1tsc3RhY2subGVuZ3RoIC0gMV0ucmFuZ2VbMV1cbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHIgPSB0aGlzLnBlcmZvcm1BY3Rpb24uYXBwbHkoeXl2YWwsIFtcbiAgICAgICAgICAgICAgeXl0ZXh0LFxuICAgICAgICAgICAgICB5eWxlbmcsXG4gICAgICAgICAgICAgIHl5bGluZW5vLFxuICAgICAgICAgICAgICBzaGFyZWRTdGF0ZS55eSxcbiAgICAgICAgICAgICAgYWN0aW9uWzFdLFxuICAgICAgICAgICAgICB2c3RhY2ssXG4gICAgICAgICAgICAgIGxzdGFja1xuICAgICAgICAgICAgXS5jb25jYXQoYXJncykpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgIHJldHVybiByO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxlbikge1xuICAgICAgICAgICAgICBzdGFjayA9IHN0YWNrLnNsaWNlKDAsIC0xICogbGVuICogMik7XG4gICAgICAgICAgICAgIHZzdGFjayA9IHZzdGFjay5zbGljZSgwLCAtMSAqIGxlbik7XG4gICAgICAgICAgICAgIGxzdGFjayA9IGxzdGFjay5zbGljZSgwLCAtMSAqIGxlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdGFjay5wdXNoKHRoaXMucHJvZHVjdGlvbnNfW2FjdGlvblsxXV1bMF0pO1xuICAgICAgICAgICAgdnN0YWNrLnB1c2goeXl2YWwuJCk7XG4gICAgICAgICAgICBsc3RhY2sucHVzaCh5eXZhbC5fJCk7XG4gICAgICAgICAgICBuZXdTdGF0ZSA9IHRhYmxlW3N0YWNrW3N0YWNrLmxlbmd0aCAtIDJdXVtzdGFja1tzdGFjay5sZW5ndGggLSAxXV07XG4gICAgICAgICAgICBzdGFjay5wdXNoKG5ld1N0YXRlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LCBcInBhcnNlXCIpXG4gIH07XG4gIHZhciBsZXhlciA9IC8qIEBfX1BVUkVfXyAqLyAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxleGVyMiA9IHtcbiAgICAgIEVPRjogMSxcbiAgICAgIHBhcnNlRXJyb3I6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcGFyc2VFcnJvcihzdHIsIGhhc2gpIHtcbiAgICAgICAgaWYgKHRoaXMueXkucGFyc2VyKSB7XG4gICAgICAgICAgdGhpcy55eS5wYXJzZXIucGFyc2VFcnJvcihzdHIsIGhhc2gpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihzdHIpO1xuICAgICAgICB9XG4gICAgICB9LCBcInBhcnNlRXJyb3JcIiksXG4gICAgICAvLyByZXNldHMgdGhlIGxleGVyLCBzZXRzIG5ldyBpbnB1dFxuICAgICAgc2V0SW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oaW5wdXQsIHl5KSB7XG4gICAgICAgIHRoaXMueXkgPSB5eSB8fCB0aGlzLnl5IHx8IHt9O1xuICAgICAgICB0aGlzLl9pbnB1dCA9IGlucHV0O1xuICAgICAgICB0aGlzLl9tb3JlID0gdGhpcy5fYmFja3RyYWNrID0gdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICAgIHRoaXMueXlsaW5lbm8gPSB0aGlzLnl5bGVuZyA9IDA7XG4gICAgICAgIHRoaXMueXl0ZXh0ID0gdGhpcy5tYXRjaGVkID0gdGhpcy5tYXRjaCA9IFwiXCI7XG4gICAgICAgIHRoaXMuY29uZGl0aW9uU3RhY2sgPSBbXCJJTklUSUFMXCJdO1xuICAgICAgICB0aGlzLnl5bGxvYyA9IHtcbiAgICAgICAgICBmaXJzdF9saW5lOiAxLFxuICAgICAgICAgIGZpcnN0X2NvbHVtbjogMCxcbiAgICAgICAgICBsYXN0X2xpbmU6IDEsXG4gICAgICAgICAgbGFzdF9jb2x1bW46IDBcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZSA9IFswLCAwXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9mZnNldCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJzZXRJbnB1dFwiKSxcbiAgICAgIC8vIGNvbnN1bWVzIGFuZCByZXR1cm5zIG9uZSBjaGFyIGZyb20gdGhlIGlucHV0XG4gICAgICBpbnB1dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNoID0gdGhpcy5faW5wdXRbMF07XG4gICAgICAgIHRoaXMueXl0ZXh0ICs9IGNoO1xuICAgICAgICB0aGlzLnl5bGVuZysrO1xuICAgICAgICB0aGlzLm9mZnNldCsrO1xuICAgICAgICB0aGlzLm1hdGNoICs9IGNoO1xuICAgICAgICB0aGlzLm1hdGNoZWQgKz0gY2g7XG4gICAgICAgIHZhciBsaW5lcyA9IGNoLm1hdGNoKC8oPzpcXHJcXG4/fFxcbikuKi9nKTtcbiAgICAgICAgaWYgKGxpbmVzKSB7XG4gICAgICAgICAgdGhpcy55eWxpbmVubysrO1xuICAgICAgICAgIHRoaXMueXlsbG9jLmxhc3RfbGluZSsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMueXlsbG9jLmxhc3RfY29sdW1uKys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZVsxXSsrO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2lucHV0ID0gdGhpcy5faW5wdXQuc2xpY2UoMSk7XG4gICAgICAgIHJldHVybiBjaDtcbiAgICAgIH0sIFwiaW5wdXRcIiksXG4gICAgICAvLyB1bnNoaWZ0cyBvbmUgY2hhciAob3IgYSBzdHJpbmcpIGludG8gdGhlIGlucHV0XG4gICAgICB1bnB1dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihjaCkge1xuICAgICAgICB2YXIgbGVuID0gY2gubGVuZ3RoO1xuICAgICAgICB2YXIgbGluZXMgPSBjaC5zcGxpdCgvKD86XFxyXFxuP3xcXG4pL2cpO1xuICAgICAgICB0aGlzLl9pbnB1dCA9IGNoICsgdGhpcy5faW5wdXQ7XG4gICAgICAgIHRoaXMueXl0ZXh0ID0gdGhpcy55eXRleHQuc3Vic3RyKDAsIHRoaXMueXl0ZXh0Lmxlbmd0aCAtIGxlbik7XG4gICAgICAgIHRoaXMub2Zmc2V0IC09IGxlbjtcbiAgICAgICAgdmFyIG9sZExpbmVzID0gdGhpcy5tYXRjaC5zcGxpdCgvKD86XFxyXFxuP3xcXG4pL2cpO1xuICAgICAgICB0aGlzLm1hdGNoID0gdGhpcy5tYXRjaC5zdWJzdHIoMCwgdGhpcy5tYXRjaC5sZW5ndGggLSAxKTtcbiAgICAgICAgdGhpcy5tYXRjaGVkID0gdGhpcy5tYXRjaGVkLnN1YnN0cigwLCB0aGlzLm1hdGNoZWQubGVuZ3RoIC0gMSk7XG4gICAgICAgIGlmIChsaW5lcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgdGhpcy55eWxpbmVubyAtPSBsaW5lcy5sZW5ndGggLSAxO1xuICAgICAgICB9XG4gICAgICAgIHZhciByID0gdGhpcy55eWxsb2MucmFuZ2U7XG4gICAgICAgIHRoaXMueXlsbG9jID0ge1xuICAgICAgICAgIGZpcnN0X2xpbmU6IHRoaXMueXlsbG9jLmZpcnN0X2xpbmUsXG4gICAgICAgICAgbGFzdF9saW5lOiB0aGlzLnl5bGluZW5vICsgMSxcbiAgICAgICAgICBmaXJzdF9jb2x1bW46IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbixcbiAgICAgICAgICBsYXN0X2NvbHVtbjogbGluZXMgPyAobGluZXMubGVuZ3RoID09PSBvbGRMaW5lcy5sZW5ndGggPyB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4gOiAwKSArIG9sZExpbmVzW29sZExpbmVzLmxlbmd0aCAtIGxpbmVzLmxlbmd0aF0ubGVuZ3RoIC0gbGluZXNbMF0ubGVuZ3RoIDogdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uIC0gbGVuXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2UgPSBbclswXSwgclswXSArIHRoaXMueXlsZW5nIC0gbGVuXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnl5bGVuZyA9IHRoaXMueXl0ZXh0Lmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcInVucHV0XCIpLFxuICAgICAgLy8gV2hlbiBjYWxsZWQgZnJvbSBhY3Rpb24sIGNhY2hlcyBtYXRjaGVkIHRleHQgYW5kIGFwcGVuZHMgaXQgb24gbmV4dCBhY3Rpb25cbiAgICAgIG1vcmU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX21vcmUgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwibW9yZVwiKSxcbiAgICAgIC8vIFdoZW4gY2FsbGVkIGZyb20gYWN0aW9uLCBzaWduYWxzIHRoZSBsZXhlciB0aGF0IHRoaXMgcnVsZSBmYWlscyB0byBtYXRjaCB0aGUgaW5wdXQsIHNvIHRoZSBuZXh0IG1hdGNoaW5nIHJ1bGUgKHJlZ2V4KSBzaG91bGQgYmUgdGVzdGVkIGluc3RlYWQuXG4gICAgICByZWplY3Q6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFja3RyYWNrX2xleGVyKSB7XG4gICAgICAgICAgdGhpcy5fYmFja3RyYWNrID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZUVycm9yKFwiTGV4aWNhbCBlcnJvciBvbiBsaW5lIFwiICsgKHRoaXMueXlsaW5lbm8gKyAxKSArIFwiLiBZb3UgY2FuIG9ubHkgaW52b2tlIHJlamVjdCgpIGluIHRoZSBsZXhlciB3aGVuIHRoZSBsZXhlciBpcyBvZiB0aGUgYmFja3RyYWNraW5nIHBlcnN1YXNpb24gKG9wdGlvbnMuYmFja3RyYWNrX2xleGVyID0gdHJ1ZSkuXFxuXCIgKyB0aGlzLnNob3dQb3NpdGlvbigpLCB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgdG9rZW46IG51bGwsXG4gICAgICAgICAgICBsaW5lOiB0aGlzLnl5bGluZW5vXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcInJlamVjdFwiKSxcbiAgICAgIC8vIHJldGFpbiBmaXJzdCBuIGNoYXJhY3RlcnMgb2YgdGhlIG1hdGNoXG4gICAgICBsZXNzOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgdGhpcy51bnB1dCh0aGlzLm1hdGNoLnNsaWNlKG4pKTtcbiAgICAgIH0sIFwibGVzc1wiKSxcbiAgICAgIC8vIGRpc3BsYXlzIGFscmVhZHkgbWF0Y2hlZCBpbnB1dCwgaS5lLiBmb3IgZXJyb3IgbWVzc2FnZXNcbiAgICAgIHBhc3RJbnB1dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBhc3QgPSB0aGlzLm1hdGNoZWQuc3Vic3RyKDAsIHRoaXMubWF0Y2hlZC5sZW5ndGggLSB0aGlzLm1hdGNoLmxlbmd0aCk7XG4gICAgICAgIHJldHVybiAocGFzdC5sZW5ndGggPiAyMCA/IFwiLi4uXCIgOiBcIlwiKSArIHBhc3Quc3Vic3RyKC0yMCkucmVwbGFjZSgvXFxuL2csIFwiXCIpO1xuICAgICAgfSwgXCJwYXN0SW5wdXRcIiksXG4gICAgICAvLyBkaXNwbGF5cyB1cGNvbWluZyBpbnB1dCwgaS5lLiBmb3IgZXJyb3IgbWVzc2FnZXNcbiAgICAgIHVwY29taW5nSW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXh0ID0gdGhpcy5tYXRjaDtcbiAgICAgICAgaWYgKG5leHQubGVuZ3RoIDwgMjApIHtcbiAgICAgICAgICBuZXh0ICs9IHRoaXMuX2lucHV0LnN1YnN0cigwLCAyMCAtIG5leHQubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKG5leHQuc3Vic3RyKDAsIDIwKSArIChuZXh0Lmxlbmd0aCA+IDIwID8gXCIuLi5cIiA6IFwiXCIpKS5yZXBsYWNlKC9cXG4vZywgXCJcIik7XG4gICAgICB9LCBcInVwY29taW5nSW5wdXRcIiksXG4gICAgICAvLyBkaXNwbGF5cyB0aGUgY2hhcmFjdGVyIHBvc2l0aW9uIHdoZXJlIHRoZSBsZXhpbmcgZXJyb3Igb2NjdXJyZWQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICBzaG93UG9zaXRpb246IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwcmUgPSB0aGlzLnBhc3RJbnB1dCgpO1xuICAgICAgICB2YXIgYyA9IG5ldyBBcnJheShwcmUubGVuZ3RoICsgMSkuam9pbihcIi1cIik7XG4gICAgICAgIHJldHVybiBwcmUgKyB0aGlzLnVwY29taW5nSW5wdXQoKSArIFwiXFxuXCIgKyBjICsgXCJeXCI7XG4gICAgICB9LCBcInNob3dQb3NpdGlvblwiKSxcbiAgICAgIC8vIHRlc3QgdGhlIGxleGVkIHRva2VuOiByZXR1cm4gRkFMU0Ugd2hlbiBub3QgYSBtYXRjaCwgb3RoZXJ3aXNlIHJldHVybiB0b2tlblxuICAgICAgdGVzdF9tYXRjaDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihtYXRjaCwgaW5kZXhlZF9ydWxlKSB7XG4gICAgICAgIHZhciB0b2tlbiwgbGluZXMsIGJhY2t1cDtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIpIHtcbiAgICAgICAgICBiYWNrdXAgPSB7XG4gICAgICAgICAgICB5eWxpbmVubzogdGhpcy55eWxpbmVubyxcbiAgICAgICAgICAgIHl5bGxvYzoge1xuICAgICAgICAgICAgICBmaXJzdF9saW5lOiB0aGlzLnl5bGxvYy5maXJzdF9saW5lLFxuICAgICAgICAgICAgICBsYXN0X2xpbmU6IHRoaXMubGFzdF9saW5lLFxuICAgICAgICAgICAgICBmaXJzdF9jb2x1bW46IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbixcbiAgICAgICAgICAgICAgbGFzdF9jb2x1bW46IHRoaXMueXlsbG9jLmxhc3RfY29sdW1uXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeXl0ZXh0OiB0aGlzLnl5dGV4dCxcbiAgICAgICAgICAgIG1hdGNoOiB0aGlzLm1hdGNoLFxuICAgICAgICAgICAgbWF0Y2hlczogdGhpcy5tYXRjaGVzLFxuICAgICAgICAgICAgbWF0Y2hlZDogdGhpcy5tYXRjaGVkLFxuICAgICAgICAgICAgeXlsZW5nOiB0aGlzLnl5bGVuZyxcbiAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICBfbW9yZTogdGhpcy5fbW9yZSxcbiAgICAgICAgICAgIF9pbnB1dDogdGhpcy5faW5wdXQsXG4gICAgICAgICAgICB5eTogdGhpcy55eSxcbiAgICAgICAgICAgIGNvbmRpdGlvblN0YWNrOiB0aGlzLmNvbmRpdGlvblN0YWNrLnNsaWNlKDApLFxuICAgICAgICAgICAgZG9uZTogdGhpcy5kb25lXG4gICAgICAgICAgfTtcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgICAgYmFja3VwLnl5bGxvYy5yYW5nZSA9IHRoaXMueXlsbG9jLnJhbmdlLnNsaWNlKDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsaW5lcyA9IG1hdGNoWzBdLm1hdGNoKC8oPzpcXHJcXG4/fFxcbikuKi9nKTtcbiAgICAgICAgaWYgKGxpbmVzKSB7XG4gICAgICAgICAgdGhpcy55eWxpbmVubyArPSBsaW5lcy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy55eWxsb2MgPSB7XG4gICAgICAgICAgZmlyc3RfbGluZTogdGhpcy55eWxsb2MubGFzdF9saW5lLFxuICAgICAgICAgIGxhc3RfbGluZTogdGhpcy55eWxpbmVubyArIDEsXG4gICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtbixcbiAgICAgICAgICBsYXN0X2NvbHVtbjogbGluZXMgPyBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXS5sZW5ndGggLSBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXS5tYXRjaCgvXFxyP1xcbj8vKVswXS5sZW5ndGggOiB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtbiArIG1hdGNoWzBdLmxlbmd0aFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnl5dGV4dCArPSBtYXRjaFswXTtcbiAgICAgICAgdGhpcy5tYXRjaCArPSBtYXRjaFswXTtcbiAgICAgICAgdGhpcy5tYXRjaGVzID0gbWF0Y2g7XG4gICAgICAgIHRoaXMueXlsZW5nID0gdGhpcy55eXRleHQubGVuZ3RoO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlID0gW3RoaXMub2Zmc2V0LCB0aGlzLm9mZnNldCArPSB0aGlzLnl5bGVuZ107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbW9yZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9iYWNrdHJhY2sgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSB0aGlzLl9pbnB1dC5zbGljZShtYXRjaFswXS5sZW5ndGgpO1xuICAgICAgICB0aGlzLm1hdGNoZWQgKz0gbWF0Y2hbMF07XG4gICAgICAgIHRva2VuID0gdGhpcy5wZXJmb3JtQWN0aW9uLmNhbGwodGhpcywgdGhpcy55eSwgdGhpcywgaW5kZXhlZF9ydWxlLCB0aGlzLmNvbmRpdGlvblN0YWNrW3RoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMV0pO1xuICAgICAgICBpZiAodGhpcy5kb25lICYmIHRoaXMuX2lucHV0KSB7XG4gICAgICAgICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JhY2t0cmFjaykge1xuICAgICAgICAgIGZvciAodmFyIGsgaW4gYmFja3VwKSB7XG4gICAgICAgICAgICB0aGlzW2tdID0gYmFja3VwW2tdO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSwgXCJ0ZXN0X21hdGNoXCIpLFxuICAgICAgLy8gcmV0dXJuIG5leHQgbWF0Y2ggaW4gaW5wdXRcbiAgICAgIG5leHQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5FT0Y7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9pbnB1dCkge1xuICAgICAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRva2VuLCBtYXRjaCwgdGVtcE1hdGNoLCBpbmRleDtcbiAgICAgICAgaWYgKCF0aGlzLl9tb3JlKSB7XG4gICAgICAgICAgdGhpcy55eXRleHQgPSBcIlwiO1xuICAgICAgICAgIHRoaXMubWF0Y2ggPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIHZhciBydWxlcyA9IHRoaXMuX2N1cnJlbnRSdWxlcygpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdGVtcE1hdGNoID0gdGhpcy5faW5wdXQubWF0Y2godGhpcy5ydWxlc1tydWxlc1tpXV0pO1xuICAgICAgICAgIGlmICh0ZW1wTWF0Y2ggJiYgKCFtYXRjaCB8fCB0ZW1wTWF0Y2hbMF0ubGVuZ3RoID4gbWF0Y2hbMF0ubGVuZ3RoKSkge1xuICAgICAgICAgICAgbWF0Y2ggPSB0ZW1wTWF0Y2g7XG4gICAgICAgICAgICBpbmRleCA9IGk7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2t0cmFja19sZXhlcikge1xuICAgICAgICAgICAgICB0b2tlbiA9IHRoaXMudGVzdF9tYXRjaCh0ZW1wTWF0Y2gsIHJ1bGVzW2ldKTtcbiAgICAgICAgICAgICAgaWYgKHRva2VuICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9iYWNrdHJhY2spIHtcbiAgICAgICAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5vcHRpb25zLmZsZXgpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgIHRva2VuID0gdGhpcy50ZXN0X21hdGNoKG1hdGNoLCBydWxlc1tpbmRleF0pO1xuICAgICAgICAgIGlmICh0b2tlbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9pbnB1dCA9PT0gXCJcIikge1xuICAgICAgICAgIHJldHVybiB0aGlzLkVPRjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZUVycm9yKFwiTGV4aWNhbCBlcnJvciBvbiBsaW5lIFwiICsgKHRoaXMueXlsaW5lbm8gKyAxKSArIFwiLiBVbnJlY29nbml6ZWQgdGV4dC5cXG5cIiArIHRoaXMuc2hvd1Bvc2l0aW9uKCksIHtcbiAgICAgICAgICAgIHRleHQ6IFwiXCIsXG4gICAgICAgICAgICB0b2tlbjogbnVsbCxcbiAgICAgICAgICAgIGxpbmU6IHRoaXMueXlsaW5lbm9cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJuZXh0XCIpLFxuICAgICAgLy8gcmV0dXJuIG5leHQgbWF0Y2ggdGhhdCBoYXMgYSB0b2tlblxuICAgICAgbGV4OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGxleCgpIHtcbiAgICAgICAgdmFyIHIgPSB0aGlzLm5leHQoKTtcbiAgICAgICAgaWYgKHIpIHtcbiAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5sZXgoKTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJsZXhcIiksXG4gICAgICAvLyBhY3RpdmF0ZXMgYSBuZXcgbGV4ZXIgY29uZGl0aW9uIHN0YXRlIChwdXNoZXMgdGhlIG5ldyBsZXhlciBjb25kaXRpb24gc3RhdGUgb250byB0aGUgY29uZGl0aW9uIHN0YWNrKVxuICAgICAgYmVnaW46IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gYmVnaW4oY29uZGl0aW9uKSB7XG4gICAgICAgIHRoaXMuY29uZGl0aW9uU3RhY2sucHVzaChjb25kaXRpb24pO1xuICAgICAgfSwgXCJiZWdpblwiKSxcbiAgICAgIC8vIHBvcCB0aGUgcHJldmlvdXNseSBhY3RpdmUgbGV4ZXIgY29uZGl0aW9uIHN0YXRlIG9mZiB0aGUgY29uZGl0aW9uIHN0YWNrXG4gICAgICBwb3BTdGF0ZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwb3BTdGF0ZSgpIHtcbiAgICAgICAgdmFyIG4gPSB0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDE7XG4gICAgICAgIGlmIChuID4gMCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrLnBvcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrWzBdO1xuICAgICAgICB9XG4gICAgICB9LCBcInBvcFN0YXRlXCIpLFxuICAgICAgLy8gcHJvZHVjZSB0aGUgbGV4ZXIgcnVsZSBzZXQgd2hpY2ggaXMgYWN0aXZlIGZvciB0aGUgY3VycmVudGx5IGFjdGl2ZSBsZXhlciBjb25kaXRpb24gc3RhdGVcbiAgICAgIF9jdXJyZW50UnVsZXM6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gX2N1cnJlbnRSdWxlcygpIHtcbiAgICAgICAgaWYgKHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoICYmIHRoaXMuY29uZGl0aW9uU3RhY2tbdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxXSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvbnNbdGhpcy5jb25kaXRpb25TdGFja1t0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDFdXS5ydWxlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25zW1wiSU5JVElBTFwiXS5ydWxlcztcbiAgICAgICAgfVxuICAgICAgfSwgXCJfY3VycmVudFJ1bGVzXCIpLFxuICAgICAgLy8gcmV0dXJuIHRoZSBjdXJyZW50bHkgYWN0aXZlIGxleGVyIGNvbmRpdGlvbiBzdGF0ZTsgd2hlbiBhbiBpbmRleCBhcmd1bWVudCBpcyBwcm92aWRlZCBpdCBwcm9kdWNlcyB0aGUgTi10aCBwcmV2aW91cyBjb25kaXRpb24gc3RhdGUsIGlmIGF2YWlsYWJsZVxuICAgICAgdG9wU3RhdGU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gdG9wU3RhdGUobikge1xuICAgICAgICBuID0gdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxIC0gTWF0aC5hYnMobiB8fCAwKTtcbiAgICAgICAgaWYgKG4gPj0gMCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrW25dO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBcIklOSVRJQUxcIjtcbiAgICAgICAgfVxuICAgICAgfSwgXCJ0b3BTdGF0ZVwiKSxcbiAgICAgIC8vIGFsaWFzIGZvciBiZWdpbihjb25kaXRpb24pXG4gICAgICBwdXNoU3RhdGU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcHVzaFN0YXRlKGNvbmRpdGlvbikge1xuICAgICAgICB0aGlzLmJlZ2luKGNvbmRpdGlvbik7XG4gICAgICB9LCBcInB1c2hTdGF0ZVwiKSxcbiAgICAgIC8vIHJldHVybiB0aGUgbnVtYmVyIG9mIHN0YXRlcyBjdXJyZW50bHkgb24gdGhlIHN0YWNrXG4gICAgICBzdGF0ZVN0YWNrU2l6ZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBzdGF0ZVN0YWNrU2l6ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoO1xuICAgICAgfSwgXCJzdGF0ZVN0YWNrU2l6ZVwiKSxcbiAgICAgIG9wdGlvbnM6IHsgXCJjYXNlLWluc2Vuc2l0aXZlXCI6IHRydWUgfSxcbiAgICAgIHBlcmZvcm1BY3Rpb246IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gYW5vbnltb3VzKHl5LCB5eV8sICRhdm9pZGluZ19uYW1lX2NvbGxpc2lvbnMsIFlZX1NUQVJUKSB7XG4gICAgICAgIGZ1bmN0aW9uIHByb2Nlc3NJZCgpIHtcbiAgICAgICAgICBjb25zdCBpZHggPSB5eV8ueXl0ZXh0LmluZGV4T2YoXCIlJVwiKTtcbiAgICAgICAgICBpZiAoaWR4ID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpZHggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBiZWZvcmUgPSB5eV8ueXl0ZXh0LnNsaWNlKDAsIGlkeCk7XG4gICAgICAgICAgICBjb25zdCBhZnRlciA9IHl5Xy55eXRleHQuc2xpY2UoaWR4KTtcbiAgICAgICAgICAgIGlmIChhZnRlcikge1xuICAgICAgICAgICAgICB5eS5sZXhlci51bnB1dChhZnRlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB5eV8ueXl0ZXh0ID0gYmVmb3JlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBfX25hbWUocHJvY2Vzc0lkLCBcInByb2Nlc3NJZFwiKTtcbiAgICAgICAgdmFyIFlZU1RBVEUgPSBZWV9TVEFSVDtcbiAgICAgICAgc3dpdGNoICgkYXZvaWRpbmdfbmFtZV9jb2xsaXNpb25zKSB7XG4gICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgcmV0dXJuIDM4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgcmV0dXJuIDQwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIDM5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIDQ0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIDUxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgcmV0dXJuIDUyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgcmV0dXJuIDUzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgcmV0dXJuIDU0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgcmV0dXJuIDU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMTpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJTQ0FMRVwiKTtcbiAgICAgICAgICAgIHJldHVybiAxNztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTQ6XG4gICAgICAgICAgICByZXR1cm4gMTg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJhY2NfdGl0bGVcIik7XG4gICAgICAgICAgICByZXR1cm4gMzM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE3OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIFwiYWNjX3RpdGxlX3ZhbHVlXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE4OlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImFjY19kZXNjclwiKTtcbiAgICAgICAgICAgIHJldHVybiAzNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTk6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gXCJhY2NfZGVzY3JfdmFsdWVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiYWNjX2Rlc2NyX211bHRpbGluZVwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjE6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDIyOlxuICAgICAgICAgICAgcmV0dXJuIFwiYWNjX2Rlc2NyX211bHRpbGluZV92YWx1ZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyMzpcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiQ0xBU1NERUZcIik7XG4gICAgICAgICAgICByZXR1cm4gNDE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI0OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJDTEFTU0RFRklEXCIpO1xuICAgICAgICAgICAgcmV0dXJuIFwiREVGQVVMVF9DTEFTU0RFRl9JRFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyNTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiQ0xBU1NERUZJRFwiKTtcbiAgICAgICAgICAgIHJldHVybiA0MjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjY6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gNDM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJDTEFTU1wiKTtcbiAgICAgICAgICAgIHJldHVybiA0ODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjg6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIkNMQVNTX1NUWUxFXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDQ5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiA1MDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzA6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIlNUWUxFXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDQ1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzMTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiU1RZTEVERUZfU1RZTEVTXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDQ2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzMjpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiA0NztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzM6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIlNDQUxFXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDE3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNDpcbiAgICAgICAgICAgIHJldHVybiAxODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzU6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM2OlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJTVEFURVwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzc6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB5eV8ueXl0ZXh0ID0geXlfLnl5dGV4dC5zbGljZSgwLCAtOCkudHJpbSgpO1xuICAgICAgICAgICAgcmV0dXJuIDI1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzODpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHl5Xy55eXRleHQgPSB5eV8ueXl0ZXh0LnNsaWNlKDAsIC04KS50cmltKCk7XG4gICAgICAgICAgICByZXR1cm4gMjY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM5OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgeXlfLnl5dGV4dCA9IHl5Xy55eXRleHQuc2xpY2UoMCwgLTEwKS50cmltKCk7XG4gICAgICAgICAgICByZXR1cm4gMjc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQwOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgeXlfLnl5dGV4dCA9IHl5Xy55eXRleHQuc2xpY2UoMCwgLTgpLnRyaW0oKTtcbiAgICAgICAgICAgIHJldHVybiAyNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDE6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB5eV8ueXl0ZXh0ID0geXlfLnl5dGV4dC5zbGljZSgwLCAtOCkudHJpbSgpO1xuICAgICAgICAgICAgcmV0dXJuIDI2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0MjpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHl5Xy55eXRleHQgPSB5eV8ueXl0ZXh0LnNsaWNlKDAsIC0xMCkudHJpbSgpO1xuICAgICAgICAgICAgcmV0dXJuIDI3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0MzpcbiAgICAgICAgICAgIHJldHVybiA1MTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDQ6XG4gICAgICAgICAgICByZXR1cm4gNTI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ1OlxuICAgICAgICAgICAgcmV0dXJuIDUzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0NjpcbiAgICAgICAgICAgIHJldHVybiA1NDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDc6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIlNUQVRFX1NUUklOR1wiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDg6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIlNUQVRFX0lEXCIpO1xuICAgICAgICAgICAgcmV0dXJuIFwiQVNcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDk6XG4gICAgICAgICAgICBpZiAoIXByb2Nlc3NJZCgpKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gXCJJRFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1MDpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTE6XG4gICAgICAgICAgICByZXR1cm4gXCJTVEFURV9ERVNDUlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1MjpcbiAgICAgICAgICAgIHJldHVybiAxOTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTM6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU0OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJzdHJ1Y3RcIik7XG4gICAgICAgICAgICByZXR1cm4gMjA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU1OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIDIxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1NjpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTc6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiTk9URVwiKTtcbiAgICAgICAgICAgIHJldHVybiAyOTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTg6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIk5PVEVfSURcIik7XG4gICAgICAgICAgICByZXR1cm4gNTk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU5OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJOT1RFX0lEXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDYwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2MDpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiRkxPQVRJTkdfTk9URVwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjE6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIkZMT0FUSU5HX05PVEVfSURcIik7XG4gICAgICAgICAgICByZXR1cm4gXCJBU1wiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2MjpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjM6XG4gICAgICAgICAgICByZXR1cm4gXCJOT1RFX1RFWFRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjQ6XG4gICAgICAgICAgICBpZiAoIXByb2Nlc3NJZCgpKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gXCJJRFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2NTpcbiAgICAgICAgICAgIGlmICghcHJvY2Vzc0lkKCkpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiTk9URV9URVhUXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDI0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2NjpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHl5Xy55eXRleHQgPSB5eV8ueXl0ZXh0LnN1YnN0cigyKS50cmltKCk7XG4gICAgICAgICAgICByZXR1cm4gMzE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDY3OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgeXlfLnl5dGV4dCA9IHl5Xy55eXRleHQuc2xpY2UoMCwgLTgpLnRyaW0oKTtcbiAgICAgICAgICAgIHJldHVybiAzMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjg6XG4gICAgICAgICAgICByZXR1cm4gNjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjk6XG4gICAgICAgICAgICByZXR1cm4gNjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzA6XG4gICAgICAgICAgICByZXR1cm4gMTY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDcxOlxuICAgICAgICAgICAgcmV0dXJuIDU3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3MjpcbiAgICAgICAgICAgIGlmICghcHJvY2Vzc0lkKCkpIHJldHVybjtcbiAgICAgICAgICAgIHJldHVybiAyNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzM6XG4gICAgICAgICAgICB5eV8ueXl0ZXh0ID0geXlfLnl5dGV4dC50cmltKCk7XG4gICAgICAgICAgICByZXR1cm4gMTQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDc0OlxuICAgICAgICAgICAgcmV0dXJuIDE1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3NTpcbiAgICAgICAgICAgIHJldHVybiAyODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzY6XG4gICAgICAgICAgICByZXR1cm4gNTg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDc3OlxuICAgICAgICAgICAgcmV0dXJuIDU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDc4OlxuICAgICAgICAgICAgcmV0dXJuIFwiSU5WQUxJRFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0sIFwiYW5vbnltb3VzXCIpLFxuICAgICAgcnVsZXM6IFsvXig/OmNsaWNrXFxiKS9pLCAvXig/OmhyZWZcXGIpL2ksIC9eKD86XCJbXlwiXSpcIikvaSwgL14oPzpkZWZhdWx0XFxiKS9pLCAvXig/Oi4qZGlyZWN0aW9uXFxzK1RCW15cXG5dKikvaSwgL14oPzouKmRpcmVjdGlvblxccytCVFteXFxuXSopL2ksIC9eKD86LipkaXJlY3Rpb25cXHMrUkxbXlxcbl0qKS9pLCAvXig/Oi4qZGlyZWN0aW9uXFxzK0xSW15cXG5dKikvaSwgL14oPzpbXFxuXSspL2ksIC9eKD86W1xcc10rKS9pLCAvXig/OigoPyFcXG4pXFxzKSspL2ksIC9eKD86I1teXFxuXSopL2ksIC9eKD86JSUoPyFcXHspW15cXG5dKikvaSwgL14oPzpzY2FsZVxccyspL2ksIC9eKD86XFxkKykvaSwgL14oPzpcXHMrd2lkdGhcXGIpL2ksIC9eKD86YWNjVGl0bGVcXHMqOlxccyopL2ksIC9eKD86KD8hXFxufHwpKlteXFxuXSopL2ksIC9eKD86YWNjRGVzY3JcXHMqOlxccyopL2ksIC9eKD86KD8hXFxufHwpKlteXFxuXSopL2ksIC9eKD86YWNjRGVzY3JcXHMqXFx7XFxzKikvaSwgL14oPzpbXFx9XSkvaSwgL14oPzpbXlxcfV0qKS9pLCAvXig/OmNsYXNzRGVmXFxzKykvaSwgL14oPzpERUZBVUxUXFxzKykvaSwgL14oPzpcXHcrXFxzKykvaSwgL14oPzpbXlxcbl0qKS9pLCAvXig/OmNsYXNzXFxzKykvaSwgL14oPzooXFx3KykrKCgsXFxzKlxcdyspKikpL2ksIC9eKD86W15cXG5dKikvaSwgL14oPzpzdHlsZVxccyspL2ksIC9eKD86W1xcdyxdK1xccyspL2ksIC9eKD86W15cXG5dKikvaSwgL14oPzpzY2FsZVxccyspL2ksIC9eKD86XFxkKykvaSwgL14oPzpcXHMrd2lkdGhcXGIpL2ksIC9eKD86c3RhdGVcXHMrKS9pLCAvXig/Oi4qPDxmb3JrPj4pL2ksIC9eKD86Lio8PGpvaW4+PikvaSwgL14oPzouKjw8Y2hvaWNlPj4pL2ksIC9eKD86LipcXFtcXFtmb3JrXFxdXFxdKS9pLCAvXig/Oi4qXFxbXFxbam9pblxcXVxcXSkvaSwgL14oPzouKlxcW1xcW2Nob2ljZVxcXVxcXSkvaSwgL14oPzouKmRpcmVjdGlvblxccytUQlteXFxuXSopL2ksIC9eKD86LipkaXJlY3Rpb25cXHMrQlRbXlxcbl0qKS9pLCAvXig/Oi4qZGlyZWN0aW9uXFxzK1JMW15cXG5dKikvaSwgL14oPzouKmRpcmVjdGlvblxccytMUlteXFxuXSopL2ksIC9eKD86W1wiXSkvaSwgL14oPzpcXHMqYXNcXHMrKS9pLCAvXig/OlteXFxuXFx7XSopL2ksIC9eKD86W1wiXSkvaSwgL14oPzpbXlwiXSopL2ksIC9eKD86W15cXG5cXHNcXHtdKykvaSwgL14oPzpcXG4pL2ksIC9eKD86XFx7KS9pLCAvXig/OlxcfSkvaSwgL14oPzpbXFxuXSkvaSwgL14oPzpub3RlXFxzKykvaSwgL14oPzpsZWZ0IG9mXFxiKS9pLCAvXig/OnJpZ2h0IG9mXFxiKS9pLCAvXig/OlwiKS9pLCAvXig/Olxccyphc1xccyopL2ksIC9eKD86W1wiXSkvaSwgL14oPzpbXlwiXSopL2ksIC9eKD86W15cXG5dKikvaSwgL14oPzpcXHMqW146XFxuXFxzXFwtXSspL2ksIC9eKD86XFxzKjpbXjpcXG47XSspL2ksIC9eKD86W1xcc1xcU10qP1xcblxccyplbmQgbm90ZVxcYikvaSwgL14oPzpzdGF0ZURpYWdyYW1cXHMrKS9pLCAvXig/OnN0YXRlRGlhZ3JhbS12MlxccyspL2ksIC9eKD86aGlkZSBlbXB0eSBkZXNjcmlwdGlvblxcYikvaSwgL14oPzpcXFtcXCpcXF0pL2ksIC9eKD86W146XFxuXFxzXFwtXFx7XSspL2ksIC9eKD86XFxzKjooPzpbXjpcXG47XXw6W146XFxuO10pKykvaSwgL14oPzotLT4pL2ksIC9eKD86LS0pL2ksIC9eKD86Ojo6KS9pLCAvXig/OiQpL2ksIC9eKD86LikvaV0sXG4gICAgICBjb25kaXRpb25zOiB7IFwiTElORVwiOiB7IFwicnVsZXNcIjogWzEwLCAxMSwgMTJdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcInN0cnVjdFwiOiB7IFwicnVsZXNcIjogWzEwLCAxMSwgMTIsIDIzLCAyNywgMzAsIDM2LCA0MywgNDQsIDQ1LCA0NiwgNTUsIDU2LCA1NywgNzEsIDcyLCA3MywgNzQsIDc1LCA3Nl0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiRkxPQVRJTkdfTk9URV9JRFwiOiB7IFwicnVsZXNcIjogWzY0XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJGTE9BVElOR19OT1RFXCI6IHsgXCJydWxlc1wiOiBbNjEsIDYyLCA2M10sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiTk9URV9URVhUXCI6IHsgXCJydWxlc1wiOiBbNjYsIDY3XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJOT1RFX0lEXCI6IHsgXCJydWxlc1wiOiBbNjVdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIk5PVEVcIjogeyBcInJ1bGVzXCI6IFs1OCwgNTksIDYwXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJTVFlMRURFRl9TVFlMRU9QVFNcIjogeyBcInJ1bGVzXCI6IFtdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIlNUWUxFREVGX1NUWUxFU1wiOiB7IFwicnVsZXNcIjogWzMyXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJTVFlMRV9JRFNcIjogeyBcInJ1bGVzXCI6IFtdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIlNUWUxFXCI6IHsgXCJydWxlc1wiOiBbMzFdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIkNMQVNTX1NUWUxFXCI6IHsgXCJydWxlc1wiOiBbMjldLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIkNMQVNTXCI6IHsgXCJydWxlc1wiOiBbMjhdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIkNMQVNTREVGSURcIjogeyBcInJ1bGVzXCI6IFsyNl0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiQ0xBU1NERUZcIjogeyBcInJ1bGVzXCI6IFsyNCwgMjVdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImFjY19kZXNjcl9tdWx0aWxpbmVcIjogeyBcInJ1bGVzXCI6IFsyMSwgMjJdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImFjY19kZXNjclwiOiB7IFwicnVsZXNcIjogWzE5XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJhY2NfdGl0bGVcIjogeyBcInJ1bGVzXCI6IFsxN10sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiU0NBTEVcIjogeyBcInJ1bGVzXCI6IFsxNCwgMTUsIDM0LCAzNV0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiQUxJQVNcIjogeyBcInJ1bGVzXCI6IFtdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIlNUQVRFX0lEXCI6IHsgXCJydWxlc1wiOiBbNDldLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIlNUQVRFX1NUUklOR1wiOiB7IFwicnVsZXNcIjogWzUwLCA1MV0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiRk9SS19TVEFURVwiOiB7IFwicnVsZXNcIjogW10sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiU1RBVEVcIjogeyBcInJ1bGVzXCI6IFsxMCwgMTEsIDEyLCAzNywgMzgsIDM5LCA0MCwgNDEsIDQyLCA0NywgNDgsIDUyLCA1MywgNTRdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIklEXCI6IHsgXCJydWxlc1wiOiBbMTAsIDExLCAxMl0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiSU5JVElBTFwiOiB7IFwicnVsZXNcIjogWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDExLCAxMiwgMTMsIDE2LCAxOCwgMjAsIDIzLCAyNywgMzAsIDMzLCAzNiwgNTQsIDU3LCA2OCwgNjksIDcwLCA3MSwgNzIsIDczLCA3NCwgNzYsIDc3LCA3OF0sIFwiaW5jbHVzaXZlXCI6IHRydWUgfSB9XG4gICAgfTtcbiAgICByZXR1cm4gbGV4ZXIyO1xuICB9KSgpO1xuICBwYXJzZXIyLmxleGVyID0gbGV4ZXI7XG4gIGZ1bmN0aW9uIFBhcnNlcigpIHtcbiAgICB0aGlzLnl5ID0ge307XG4gIH1cbiAgX19uYW1lKFBhcnNlciwgXCJQYXJzZXJcIik7XG4gIFBhcnNlci5wcm90b3R5cGUgPSBwYXJzZXIyO1xuICBwYXJzZXIyLlBhcnNlciA9IFBhcnNlcjtcbiAgcmV0dXJuIG5ldyBQYXJzZXIoKTtcbn0pKCk7XG5wYXJzZXIucGFyc2VyID0gcGFyc2VyO1xudmFyIHN0YXRlRGlhZ3JhbV9kZWZhdWx0ID0gcGFyc2VyO1xuXG4vLyBzcmMvZGlhZ3JhbXMvc3RhdGUvc3RhdGVDb21tb24udHNcbnZhciBERUZBVUxUX0RJQUdSQU1fRElSRUNUSU9OID0gXCJUQlwiO1xudmFyIERFRkFVTFRfTkVTVEVEX0RPQ19ESVIgPSBcIlRCXCI7XG52YXIgU1RNVF9ESVJFQ1RJT04gPSBcImRpclwiO1xudmFyIFNUTVRfU1RBVEUgPSBcInN0YXRlXCI7XG52YXIgU1RNVF9ST09UID0gXCJyb290XCI7XG52YXIgU1RNVF9SRUxBVElPTiA9IFwicmVsYXRpb25cIjtcbnZhciBTVE1UX0NMQVNTREVGID0gXCJjbGFzc0RlZlwiO1xudmFyIFNUTVRfU1RZTEVERUYgPSBcInN0eWxlXCI7XG52YXIgU1RNVF9BUFBMWUNMQVNTID0gXCJhcHBseUNsYXNzXCI7XG52YXIgREVGQVVMVF9TVEFURV9UWVBFID0gXCJkZWZhdWx0XCI7XG52YXIgRElWSURFUl9UWVBFID0gXCJkaXZpZGVyXCI7XG52YXIgR19FREdFX1NUWUxFID0gXCJmaWxsOm5vbmVcIjtcbnZhciBHX0VER0VfQVJST1dIRUFEU1RZTEUgPSBcImZpbGw6ICMzMzNcIjtcbnZhciBHX0VER0VfTEFCRUxQT1MgPSBcImNcIjtcbnZhciBHX0VER0VfTEFCRUxUWVBFID0gXCJtYXJrZG93blwiO1xudmFyIEdfRURHRV9USElDS05FU1MgPSBcIm5vcm1hbFwiO1xudmFyIFNIQVBFX1NUQVRFID0gXCJyZWN0XCI7XG52YXIgU0hBUEVfU1RBVEVfV0lUSF9ERVNDID0gXCJyZWN0V2l0aFRpdGxlXCI7XG52YXIgU0hBUEVfU1RBUlQgPSBcInN0YXRlU3RhcnRcIjtcbnZhciBTSEFQRV9FTkQgPSBcInN0YXRlRW5kXCI7XG52YXIgU0hBUEVfRElWSURFUiA9IFwiZGl2aWRlclwiO1xudmFyIFNIQVBFX0dST1VQID0gXCJyb3VuZGVkV2l0aFRpdGxlXCI7XG52YXIgU0hBUEVfTk9URSA9IFwibm90ZVwiO1xudmFyIFNIQVBFX05PVEVHUk9VUCA9IFwibm90ZUdyb3VwXCI7XG52YXIgQ1NTX0RJQUdSQU0gPSBcInN0YXRlZGlhZ3JhbVwiO1xudmFyIENTU19TVEFURSA9IFwic3RhdGVcIjtcbnZhciBDU1NfRElBR1JBTV9TVEFURSA9IGAke0NTU19ESUFHUkFNfS0ke0NTU19TVEFURX1gO1xudmFyIENTU19FREdFID0gXCJ0cmFuc2l0aW9uXCI7XG52YXIgQ1NTX05PVEUgPSBcIm5vdGVcIjtcbnZhciBDU1NfTk9URV9FREdFID0gXCJub3RlLWVkZ2VcIjtcbnZhciBDU1NfRURHRV9OT1RFX0VER0UgPSBgJHtDU1NfRURHRX0gJHtDU1NfTk9URV9FREdFfWA7XG52YXIgQ1NTX0RJQUdSQU1fTk9URSA9IGAke0NTU19ESUFHUkFNfS0ke0NTU19OT1RFfWA7XG52YXIgQ1NTX0NMVVNURVIgPSBcImNsdXN0ZXJcIjtcbnZhciBDU1NfRElBR1JBTV9DTFVTVEVSID0gYCR7Q1NTX0RJQUdSQU19LSR7Q1NTX0NMVVNURVJ9YDtcbnZhciBDU1NfQ0xVU1RFUl9BTFQgPSBcImNsdXN0ZXItYWx0XCI7XG52YXIgQ1NTX0RJQUdSQU1fQ0xVU1RFUl9BTFQgPSBgJHtDU1NfRElBR1JBTX0tJHtDU1NfQ0xVU1RFUl9BTFR9YDtcbnZhciBQQVJFTlQgPSBcInBhcmVudFwiO1xudmFyIE5PVEUgPSBcIm5vdGVcIjtcbnZhciBET01JRF9TVEFURSA9IFwic3RhdGVcIjtcbnZhciBET01JRF9UWVBFX1NQQUNFUiA9IFwiLS0tLVwiO1xudmFyIE5PVEVfSUQgPSBgJHtET01JRF9UWVBFX1NQQUNFUn0ke05PVEV9YDtcbnZhciBQQVJFTlRfSUQgPSBgJHtET01JRF9UWVBFX1NQQUNFUn0ke1BBUkVOVH1gO1xuXG4vLyBzcmMvZGlhZ3JhbXMvc3RhdGUvc3RhdGVSZW5kZXJlci12My11bmlmaWVkLnRzXG52YXIgZ2V0RGlyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgocGFyc2VkSXRlbSwgZGVmYXVsdERpciA9IERFRkFVTFRfTkVTVEVEX0RPQ19ESVIpID0+IHtcbiAgaWYgKCFwYXJzZWRJdGVtLmRvYykge1xuICAgIHJldHVybiBkZWZhdWx0RGlyO1xuICB9XG4gIGxldCBkaXIgPSBkZWZhdWx0RGlyO1xuICBmb3IgKGNvbnN0IHBhcnNlZEl0ZW1Eb2Mgb2YgcGFyc2VkSXRlbS5kb2MpIHtcbiAgICBpZiAocGFyc2VkSXRlbURvYy5zdG10ID09PSBcImRpclwiKSB7XG4gICAgICBkaXIgPSBwYXJzZWRJdGVtRG9jLnZhbHVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZGlyO1xufSwgXCJnZXREaXJcIik7XG52YXIgZ2V0Q2xhc3NlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24odGV4dCwgZGlhZ3JhbU9iaikge1xuICByZXR1cm4gZGlhZ3JhbU9iai5kYi5nZXRDbGFzc2VzKCk7XG59LCBcImdldENsYXNzZXNcIik7XG52YXIgZHJhdyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgZnVuY3Rpb24odGV4dCwgaWQsIF92ZXJzaW9uLCBkaWFnKSB7XG4gIGxvZy5pbmZvKFwiUkVGMDpcIik7XG4gIGxvZy5pbmZvKFwiRHJhd2luZyBzdGF0ZSBkaWFncmFtICh2MilcIiwgaWQpO1xuICBjb25zdCB7IHNlY3VyaXR5TGV2ZWwsIHN0YXRlOiBjb25mLCBsYXlvdXQgfSA9IGdldENvbmZpZygpO1xuICBkaWFnLmRiLmV4dHJhY3QoZGlhZy5kYi5nZXRSb290RG9jVjIoKSk7XG4gIGNvbnN0IGRhdGE0TGF5b3V0ID0gZGlhZy5kYi5nZXREYXRhKCk7XG4gIGNvbnN0IHN2ZyA9IGdldERpYWdyYW1FbGVtZW50KGlkLCBzZWN1cml0eUxldmVsKTtcbiAgZGF0YTRMYXlvdXQudHlwZSA9IGRpYWcudHlwZTtcbiAgZGF0YTRMYXlvdXQubGF5b3V0QWxnb3JpdGhtID0gbGF5b3V0O1xuICBkYXRhNExheW91dC5ub2RlU3BhY2luZyA9IGNvbmY/Lm5vZGVTcGFjaW5nIHx8IDUwO1xuICBkYXRhNExheW91dC5yYW5rU3BhY2luZyA9IGNvbmY/LnJhbmtTcGFjaW5nIHx8IDUwO1xuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgaWYgKGNvbmZpZy5sb29rID09PSBcIm5lb1wiKSB7XG4gICAgZGF0YTRMYXlvdXQubWFya2VycyA9IFtcImJhcmJOZW9cIl07XG4gIH0gZWxzZSB7XG4gICAgZGF0YTRMYXlvdXQubWFya2VycyA9IFtcImJhcmJcIl07XG4gIH1cbiAgZGF0YTRMYXlvdXQuZGlhZ3JhbUlkID0gaWQ7XG4gIGF3YWl0IHJlbmRlcihkYXRhNExheW91dCwgc3ZnKTtcbiAgY29uc3QgcGFkZGluZyA9IDg7XG4gIHRyeSB7XG4gICAgY29uc3QgbGlua3MgPSB0eXBlb2YgZGlhZy5kYi5nZXRMaW5rcyA9PT0gXCJmdW5jdGlvblwiID8gZGlhZy5kYi5nZXRMaW5rcygpIDogLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICBsaW5rcy5mb3JFYWNoKChsaW5rSW5mbywga2V5KSA9PiB7XG4gICAgICBjb25zdCBzdGF0ZUlkID0gdHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIiA/IGtleSA6IHR5cGVvZiBrZXk/LmlkID09PSBcInN0cmluZ1wiID8ga2V5LmlkIDogXCJcIjtcbiAgICAgIGlmICghc3RhdGVJZCkge1xuICAgICAgICBsb2cud2FybihcIlxcdTI2QTBcXHVGRTBGIEludmFsaWQgb3IgbWlzc2luZyBzdGF0ZUlkIGZyb20ga2V5OlwiLCBKU09OLnN0cmluZ2lmeShrZXkpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgYWxsTm9kZXMgPSBzdmcubm9kZSgpPy5xdWVyeVNlbGVjdG9yQWxsKFwiZ1wiKTtcbiAgICAgIGxldCBtYXRjaGVkRWxlbTtcbiAgICAgIGFsbE5vZGVzPy5mb3JFYWNoKChnKSA9PiB7XG4gICAgICAgIGNvbnN0IHRleHQyID0gZy50ZXh0Q29udGVudD8udHJpbSgpO1xuICAgICAgICBpZiAodGV4dDIgPT09IHN0YXRlSWQpIHtcbiAgICAgICAgICBtYXRjaGVkRWxlbSA9IGc7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYgKCFtYXRjaGVkRWxlbSkge1xuICAgICAgICBsb2cud2FybihcIlxcdTI2QTBcXHVGRTBGIENvdWxkIG5vdCBmaW5kIG5vZGUgbWF0Y2hpbmcgdGV4dDpcIiwgc3RhdGVJZCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHBhcmVudCA9IG1hdGNoZWRFbGVtLnBhcmVudE5vZGU7XG4gICAgICBpZiAoIXBhcmVudCkge1xuICAgICAgICBsb2cud2FybihcIlxcdTI2QTBcXHVGRTBGIE5vZGUgaGFzIG5vIHBhcmVudCwgY2Fubm90IHdyYXA6XCIsIHN0YXRlSWQpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJhXCIpO1xuICAgICAgY29uc3QgY2xlYW5lZFVybCA9IGxpbmtJbmZvLnVybC5yZXBsYWNlKC9eXCIrfFwiKyQvZywgXCJcIik7XG4gICAgICBhLnNldEF0dHJpYnV0ZU5TKFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiLCBcInhsaW5rOmhyZWZcIiwgY2xlYW5lZFVybCk7XG4gICAgICBhLnNldEF0dHJpYnV0ZShcInRhcmdldFwiLCBcIl9ibGFua1wiKTtcbiAgICAgIGlmIChsaW5rSW5mby50b29sdGlwKSB7XG4gICAgICAgIGNvbnN0IHRvb2x0aXAgPSBsaW5rSW5mby50b29sdGlwLnJlcGxhY2UoL15cIit8XCIrJC9nLCBcIlwiKTtcbiAgICAgICAgYS5zZXRBdHRyaWJ1dGUoXCJ0aXRsZVwiLCB0b29sdGlwKTtcbiAgICAgIH1cbiAgICAgIHBhcmVudC5yZXBsYWNlQ2hpbGQoYSwgbWF0Y2hlZEVsZW0pO1xuICAgICAgYS5hcHBlbmRDaGlsZChtYXRjaGVkRWxlbSk7XG4gICAgICBsb2cuaW5mbyhcIlxcdXsxRjUxN30gV3JhcHBlZCBub2RlIGluIDxhPiB0YWcgZm9yOlwiLCBzdGF0ZUlkLCBsaW5rSW5mby51cmwpO1xuICAgIH0pO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBsb2cuZXJyb3IoXCJcXHUyNzRDIEVycm9yIGluamVjdGluZyBjbGlja2FibGUgbGlua3M6XCIsIGVycik7XG4gIH1cbiAgdXRpbHNfZGVmYXVsdC5pbnNlcnRUaXRsZShcbiAgICBzdmcsXG4gICAgXCJzdGF0ZWRpYWdyYW1UaXRsZVRleHRcIixcbiAgICBjb25mPy50aXRsZVRvcE1hcmdpbiA/PyAyNSxcbiAgICBkaWFnLmRiLmdldERpYWdyYW1UaXRsZSgpXG4gICk7XG4gIHNldHVwVmlld1BvcnRGb3JTVkcoc3ZnLCBwYWRkaW5nLCBDU1NfRElBR1JBTSwgY29uZj8udXNlTWF4V2lkdGggPz8gdHJ1ZSk7XG59LCBcImRyYXdcIik7XG52YXIgc3RhdGVSZW5kZXJlcl92M191bmlmaWVkX2RlZmF1bHQgPSB7XG4gIGdldENsYXNzZXMsXG4gIGRyYXcsXG4gIGdldERpclxufTtcblxuLy8gc3JjL2RpYWdyYW1zL3N0YXRlL2RhdGFGZXRjaGVyLnRzXG52YXIgbm9kZURiID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbnZhciBncmFwaEl0ZW1Db3VudCA9IDA7XG5mdW5jdGlvbiBzdGF0ZURvbUlkKGl0ZW1JZCA9IFwiXCIsIGNvdW50ZXIgPSAwLCB0eXBlID0gXCJcIiwgdHlwZVNwYWNlciA9IERPTUlEX1RZUEVfU1BBQ0VSKSB7XG4gIGNvbnN0IHR5cGVTdHIgPSB0eXBlICE9PSBudWxsICYmIHR5cGUubGVuZ3RoID4gMCA/IGAke3R5cGVTcGFjZXJ9JHt0eXBlfWAgOiBcIlwiO1xuICByZXR1cm4gYCR7RE9NSURfU1RBVEV9LSR7aXRlbUlkfSR7dHlwZVN0cn0tJHtjb3VudGVyfWA7XG59XG5fX25hbWUoc3RhdGVEb21JZCwgXCJzdGF0ZURvbUlkXCIpO1xudmFyIHNldHVwRG9jID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgocGFyZW50UGFyc2VkSXRlbSwgZG9jLCBkaWFncmFtU3RhdGVzLCBub2RlcywgZWRnZXMsIGFsdEZsYWcsIGxvb2ssIGNsYXNzZXMpID0+IHtcbiAgbG9nLnRyYWNlKFwiaXRlbXNcIiwgZG9jKTtcbiAgZG9jLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICBzd2l0Y2ggKGl0ZW0uc3RtdCkge1xuICAgICAgY2FzZSBTVE1UX1NUQVRFOlxuICAgICAgICBkYXRhRmV0Y2hlcihwYXJlbnRQYXJzZWRJdGVtLCBpdGVtLCBkaWFncmFtU3RhdGVzLCBub2RlcywgZWRnZXMsIGFsdEZsYWcsIGxvb2ssIGNsYXNzZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgREVGQVVMVF9TVEFURV9UWVBFOlxuICAgICAgICBkYXRhRmV0Y2hlcihwYXJlbnRQYXJzZWRJdGVtLCBpdGVtLCBkaWFncmFtU3RhdGVzLCBub2RlcywgZWRnZXMsIGFsdEZsYWcsIGxvb2ssIGNsYXNzZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgU1RNVF9SRUxBVElPTjpcbiAgICAgICAge1xuICAgICAgICAgIGRhdGFGZXRjaGVyKFxuICAgICAgICAgICAgcGFyZW50UGFyc2VkSXRlbSxcbiAgICAgICAgICAgIGl0ZW0uc3RhdGUxLFxuICAgICAgICAgICAgZGlhZ3JhbVN0YXRlcyxcbiAgICAgICAgICAgIG5vZGVzLFxuICAgICAgICAgICAgZWRnZXMsXG4gICAgICAgICAgICBhbHRGbGFnLFxuICAgICAgICAgICAgbG9vayxcbiAgICAgICAgICAgIGNsYXNzZXNcbiAgICAgICAgICApO1xuICAgICAgICAgIGRhdGFGZXRjaGVyKFxuICAgICAgICAgICAgcGFyZW50UGFyc2VkSXRlbSxcbiAgICAgICAgICAgIGl0ZW0uc3RhdGUyLFxuICAgICAgICAgICAgZGlhZ3JhbVN0YXRlcyxcbiAgICAgICAgICAgIG5vZGVzLFxuICAgICAgICAgICAgZWRnZXMsXG4gICAgICAgICAgICBhbHRGbGFnLFxuICAgICAgICAgICAgbG9vayxcbiAgICAgICAgICAgIGNsYXNzZXNcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnN0IGlzTmVvID0gbG9vayA9PT0gXCJuZW9cIjtcbiAgICAgICAgICBjb25zdCBlZGdlRGF0YSA9IHtcbiAgICAgICAgICAgIGlkOiBcImVkZ2VcIiArIGdyYXBoSXRlbUNvdW50LFxuICAgICAgICAgICAgc3RhcnQ6IGl0ZW0uc3RhdGUxLmlkLFxuICAgICAgICAgICAgZW5kOiBpdGVtLnN0YXRlMi5pZCxcbiAgICAgICAgICAgIGFycm93aGVhZDogXCJub3JtYWxcIixcbiAgICAgICAgICAgIGFycm93VHlwZUVuZDogaXNOZW8gPyBcImFycm93X2JhcmJfbmVvXCIgOiBcImFycm93X2JhcmJcIixcbiAgICAgICAgICAgIHN0eWxlOiBHX0VER0VfU1RZTEUsXG4gICAgICAgICAgICBsYWJlbFN0eWxlOiBcIlwiLFxuICAgICAgICAgICAgbGFiZWw6IGNvbW1vbl9kZWZhdWx0LnNhbml0aXplVGV4dChpdGVtLmRlc2NyaXB0aW9uID8/IFwiXCIsIGdldENvbmZpZygpKSxcbiAgICAgICAgICAgIGFycm93aGVhZFN0eWxlOiBHX0VER0VfQVJST1dIRUFEU1RZTEUsXG4gICAgICAgICAgICBsYWJlbHBvczogR19FREdFX0xBQkVMUE9TLFxuICAgICAgICAgICAgbGFiZWxUeXBlOiBHX0VER0VfTEFCRUxUWVBFLFxuICAgICAgICAgICAgdGhpY2tuZXNzOiBHX0VER0VfVEhJQ0tORVNTLFxuICAgICAgICAgICAgY2xhc3NlczogQ1NTX0VER0UsXG4gICAgICAgICAgICBsb29rXG4gICAgICAgICAgfTtcbiAgICAgICAgICBlZGdlcy5wdXNoKGVkZ2VEYXRhKTtcbiAgICAgICAgICBncmFwaEl0ZW1Db3VudCsrO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSk7XG59LCBcInNldHVwRG9jXCIpO1xudmFyIGdldERpcjIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChwYXJzZWRJdGVtLCBkZWZhdWx0RGlyID0gREVGQVVMVF9ORVNURURfRE9DX0RJUikgPT4ge1xuICBsZXQgZGlyID0gZGVmYXVsdERpcjtcbiAgaWYgKHBhcnNlZEl0ZW0uZG9jKSB7XG4gICAgZm9yIChjb25zdCBwYXJzZWRJdGVtRG9jIG9mIHBhcnNlZEl0ZW0uZG9jKSB7XG4gICAgICBpZiAocGFyc2VkSXRlbURvYy5zdG10ID09PSBcImRpclwiKSB7XG4gICAgICAgIGRpciA9IHBhcnNlZEl0ZW1Eb2MudmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBkaXI7XG59LCBcImdldERpclwiKTtcbmZ1bmN0aW9uIGluc2VydE9yVXBkYXRlTm9kZShub2Rlcywgbm9kZURhdGEsIGNsYXNzZXMpIHtcbiAgaWYgKCFub2RlRGF0YS5pZCB8fCBub2RlRGF0YS5pZCA9PT0gXCI8L2pvaW4+PC9mb3JrPlwiIHx8IG5vZGVEYXRhLmlkID09PSBcIjwvY2hvaWNlPlwiKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChub2RlRGF0YS5jc3NDbGFzc2VzKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KG5vZGVEYXRhLmNzc0NvbXBpbGVkU3R5bGVzKSkge1xuICAgICAgbm9kZURhdGEuY3NzQ29tcGlsZWRTdHlsZXMgPSBbXTtcbiAgICB9XG4gICAgbm9kZURhdGEuY3NzQ2xhc3Nlcy5zcGxpdChcIiBcIikuZm9yRWFjaCgoY3NzQ2xhc3MpID0+IHtcbiAgICAgIGNvbnN0IGNsYXNzRGVmID0gY2xhc3Nlcy5nZXQoY3NzQ2xhc3MpO1xuICAgICAgaWYgKGNsYXNzRGVmKSB7XG4gICAgICAgIG5vZGVEYXRhLmNzc0NvbXBpbGVkU3R5bGVzID0gWy4uLm5vZGVEYXRhLmNzc0NvbXBpbGVkU3R5bGVzID8/IFtdLCAuLi5jbGFzc0RlZi5zdHlsZXNdO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGNvbnN0IGV4aXN0aW5nTm9kZURhdGEgPSBub2Rlcy5maW5kKChub2RlKSA9PiBub2RlLmlkID09PSBub2RlRGF0YS5pZCk7XG4gIGlmIChleGlzdGluZ05vZGVEYXRhKSB7XG4gICAgT2JqZWN0LmFzc2lnbihleGlzdGluZ05vZGVEYXRhLCBub2RlRGF0YSk7XG4gIH0gZWxzZSB7XG4gICAgbm9kZXMucHVzaChub2RlRGF0YSk7XG4gIH1cbn1cbl9fbmFtZShpbnNlcnRPclVwZGF0ZU5vZGUsIFwiaW5zZXJ0T3JVcGRhdGVOb2RlXCIpO1xuZnVuY3Rpb24gZ2V0Q2xhc3Nlc0Zyb21EYkluZm8oZGJJbmZvSXRlbSkge1xuICByZXR1cm4gZGJJbmZvSXRlbT8uY2xhc3Nlcz8uam9pbihcIiBcIikgPz8gXCJcIjtcbn1cbl9fbmFtZShnZXRDbGFzc2VzRnJvbURiSW5mbywgXCJnZXRDbGFzc2VzRnJvbURiSW5mb1wiKTtcbmZ1bmN0aW9uIGdldFN0eWxlc0Zyb21EYkluZm8oZGJJbmZvSXRlbSkge1xuICByZXR1cm4gZGJJbmZvSXRlbT8uc3R5bGVzID8/IFtdO1xufVxuX19uYW1lKGdldFN0eWxlc0Zyb21EYkluZm8sIFwiZ2V0U3R5bGVzRnJvbURiSW5mb1wiKTtcbnZhciBkYXRhRmV0Y2hlciA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHBhcmVudCwgcGFyc2VkSXRlbSwgZGlhZ3JhbVN0YXRlcywgbm9kZXMsIGVkZ2VzLCBhbHRGbGFnLCBsb29rLCBjbGFzc2VzKSA9PiB7XG4gIGNvbnN0IGl0ZW1JZCA9IHBhcnNlZEl0ZW0uaWQ7XG4gIGNvbnN0IGRiU3RhdGUgPSBkaWFncmFtU3RhdGVzLmdldChpdGVtSWQpO1xuICBjb25zdCBjbGFzc1N0ciA9IGdldENsYXNzZXNGcm9tRGJJbmZvKGRiU3RhdGUpO1xuICBjb25zdCBzdHlsZSA9IGdldFN0eWxlc0Zyb21EYkluZm8oZGJTdGF0ZSk7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICBsb2cuaW5mbyhcImRhdGFGZXRjaGVyIHBhcnNlZEl0ZW1cIiwgcGFyc2VkSXRlbSwgZGJTdGF0ZSwgc3R5bGUpO1xuICBpZiAoaXRlbUlkICE9PSBcInJvb3RcIikge1xuICAgIGxldCBzaGFwZSA9IFNIQVBFX1NUQVRFO1xuICAgIGlmIChwYXJzZWRJdGVtLnN0YXJ0ID09PSB0cnVlKSB7XG4gICAgICBzaGFwZSA9IFNIQVBFX1NUQVJUO1xuICAgIH0gZWxzZSBpZiAocGFyc2VkSXRlbS5zdGFydCA9PT0gZmFsc2UpIHtcbiAgICAgIHNoYXBlID0gU0hBUEVfRU5EO1xuICAgIH1cbiAgICBpZiAocGFyc2VkSXRlbS50eXBlICE9PSBERUZBVUxUX1NUQVRFX1RZUEUpIHtcbiAgICAgIHNoYXBlID0gcGFyc2VkSXRlbS50eXBlO1xuICAgIH1cbiAgICBpZiAoIW5vZGVEYi5nZXQoaXRlbUlkKSkge1xuICAgICAgbm9kZURiLnNldChpdGVtSWQsIHtcbiAgICAgICAgaWQ6IGl0ZW1JZCxcbiAgICAgICAgc2hhcGUsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBjb21tb25fZGVmYXVsdC5zYW5pdGl6ZVRleHQoaXRlbUlkLCBjb25maWcpLFxuICAgICAgICBjc3NDbGFzc2VzOiBgJHtjbGFzc1N0cn0gJHtDU1NfRElBR1JBTV9TVEFURX1gLFxuICAgICAgICBjc3NTdHlsZXM6IHN0eWxlXG4gICAgICB9KTtcbiAgICB9XG4gICAgY29uc3QgbmV3Tm9kZSA9IG5vZGVEYi5nZXQoaXRlbUlkKTtcbiAgICBpZiAocGFyc2VkSXRlbS5kZXNjcmlwdGlvbikge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkobmV3Tm9kZS5kZXNjcmlwdGlvbikpIHtcbiAgICAgICAgbmV3Tm9kZS5zaGFwZSA9IFNIQVBFX1NUQVRFX1dJVEhfREVTQztcbiAgICAgICAgbmV3Tm9kZS5kZXNjcmlwdGlvbi5wdXNoKHBhcnNlZEl0ZW0uZGVzY3JpcHRpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG5ld05vZGUuZGVzY3JpcHRpb24/Lmxlbmd0aCAmJiBuZXdOb2RlLmRlc2NyaXB0aW9uLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBuZXdOb2RlLnNoYXBlID0gU0hBUEVfU1RBVEVfV0lUSF9ERVNDO1xuICAgICAgICAgIGlmIChuZXdOb2RlLmRlc2NyaXB0aW9uID09PSBpdGVtSWQpIHtcbiAgICAgICAgICAgIG5ld05vZGUuZGVzY3JpcHRpb24gPSBbcGFyc2VkSXRlbS5kZXNjcmlwdGlvbl07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ld05vZGUuZGVzY3JpcHRpb24gPSBbbmV3Tm9kZS5kZXNjcmlwdGlvbiwgcGFyc2VkSXRlbS5kZXNjcmlwdGlvbl07XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5ld05vZGUuc2hhcGUgPSBTSEFQRV9TVEFURTtcbiAgICAgICAgICBuZXdOb2RlLmRlc2NyaXB0aW9uID0gcGFyc2VkSXRlbS5kZXNjcmlwdGlvbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbmV3Tm9kZS5kZXNjcmlwdGlvbiA9IGNvbW1vbl9kZWZhdWx0LnNhbml0aXplVGV4dE9yQXJyYXkobmV3Tm9kZS5kZXNjcmlwdGlvbiwgY29uZmlnKTtcbiAgICB9XG4gICAgaWYgKG5ld05vZGUuZGVzY3JpcHRpb24/Lmxlbmd0aCA9PT0gMSAmJiBuZXdOb2RlLnNoYXBlID09PSBTSEFQRV9TVEFURV9XSVRIX0RFU0MpIHtcbiAgICAgIGlmIChuZXdOb2RlLnR5cGUgPT09IFwiZ3JvdXBcIikge1xuICAgICAgICBuZXdOb2RlLnNoYXBlID0gU0hBUEVfR1JPVVA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXdOb2RlLnNoYXBlID0gU0hBUEVfU1RBVEU7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghbmV3Tm9kZS50eXBlICYmIHBhcnNlZEl0ZW0uZG9jKSB7XG4gICAgICBsb2cuaW5mbyhcIlNldHRpbmcgY2x1c3RlciBmb3IgWENYXCIsIGl0ZW1JZCwgZ2V0RGlyMihwYXJzZWRJdGVtKSk7XG4gICAgICBuZXdOb2RlLnR5cGUgPSBcImdyb3VwXCI7XG4gICAgICBuZXdOb2RlLmlzR3JvdXAgPSB0cnVlO1xuICAgICAgbmV3Tm9kZS5kaXIgPSBnZXREaXIyKHBhcnNlZEl0ZW0pO1xuICAgICAgbmV3Tm9kZS5zaGFwZSA9IHBhcnNlZEl0ZW0udHlwZSA9PT0gRElWSURFUl9UWVBFID8gU0hBUEVfRElWSURFUiA6IFNIQVBFX0dST1VQO1xuICAgICAgbmV3Tm9kZS5jc3NDbGFzc2VzID0gYCR7bmV3Tm9kZS5jc3NDbGFzc2VzfSAke0NTU19ESUFHUkFNX0NMVVNURVJ9ICR7YWx0RmxhZyA/IENTU19ESUFHUkFNX0NMVVNURVJfQUxUIDogXCJcIn1gO1xuICAgIH1cbiAgICBjb25zdCBub2RlRGF0YSA9IHtcbiAgICAgIGxhYmVsU3R5bGU6IFwiXCIsXG4gICAgICBzaGFwZTogbmV3Tm9kZS5zaGFwZSxcbiAgICAgIGxhYmVsOiBuZXdOb2RlLmRlc2NyaXB0aW9uLFxuICAgICAgY3NzQ2xhc3NlczogbmV3Tm9kZS5jc3NDbGFzc2VzLFxuICAgICAgY3NzQ29tcGlsZWRTdHlsZXM6IFtdLFxuICAgICAgY3NzU3R5bGVzOiBuZXdOb2RlLmNzc1N0eWxlcyxcbiAgICAgIGlkOiBpdGVtSWQsXG4gICAgICBkaXI6IG5ld05vZGUuZGlyLFxuICAgICAgZG9tSWQ6IHN0YXRlRG9tSWQoaXRlbUlkLCBncmFwaEl0ZW1Db3VudCksXG4gICAgICB0eXBlOiBuZXdOb2RlLnR5cGUsXG4gICAgICBpc0dyb3VwOiBuZXdOb2RlLnR5cGUgPT09IFwiZ3JvdXBcIixcbiAgICAgIHBhZGRpbmc6IDgsXG4gICAgICByeDogMTAsXG4gICAgICByeTogMTAsXG4gICAgICBsb29rLFxuICAgICAgbGFiZWxUeXBlOiBcIm1hcmtkb3duXCJcbiAgICB9O1xuICAgIGlmIChub2RlRGF0YS5zaGFwZSA9PT0gU0hBUEVfRElWSURFUikge1xuICAgICAgbm9kZURhdGEubGFiZWwgPSBcIlwiO1xuICAgIH1cbiAgICBpZiAocGFyZW50ICYmIHBhcmVudC5pZCAhPT0gXCJyb290XCIpIHtcbiAgICAgIGxvZy50cmFjZShcIlNldHRpbmcgbm9kZSBcIiwgaXRlbUlkLCBcIiB0byBiZSBjaGlsZCBvZiBpdHMgcGFyZW50IFwiLCBwYXJlbnQuaWQpO1xuICAgICAgbm9kZURhdGEucGFyZW50SWQgPSBwYXJlbnQuaWQ7XG4gICAgfVxuICAgIG5vZGVEYXRhLmNlbnRlckxhYmVsID0gdHJ1ZTtcbiAgICBpZiAocGFyc2VkSXRlbS5ub3RlKSB7XG4gICAgICBjb25zdCBub3RlRGF0YSA9IHtcbiAgICAgICAgbGFiZWxTdHlsZTogXCJcIixcbiAgICAgICAgc2hhcGU6IFNIQVBFX05PVEUsXG4gICAgICAgIGxhYmVsOiBwYXJzZWRJdGVtLm5vdGUudGV4dCxcbiAgICAgICAgbGFiZWxUeXBlOiBcIm1hcmtkb3duXCIsXG4gICAgICAgIGNzc0NsYXNzZXM6IENTU19ESUFHUkFNX05PVEUsXG4gICAgICAgIC8vIHVzZUh0bWxMYWJlbHM6IGZhbHNlLFxuICAgICAgICBjc3NTdHlsZXM6IFtdLFxuICAgICAgICBjc3NDb21waWxlZFN0eWxlczogW10sXG4gICAgICAgIGlkOiBpdGVtSWQgKyBOT1RFX0lEICsgXCItXCIgKyBncmFwaEl0ZW1Db3VudCxcbiAgICAgICAgZG9tSWQ6IHN0YXRlRG9tSWQoaXRlbUlkLCBncmFwaEl0ZW1Db3VudCwgTk9URSksXG4gICAgICAgIHR5cGU6IG5ld05vZGUudHlwZSxcbiAgICAgICAgaXNHcm91cDogbmV3Tm9kZS50eXBlID09PSBcImdyb3VwXCIsXG4gICAgICAgIHBhZGRpbmc6IGNvbmZpZy5mbG93Y2hhcnQ/LnBhZGRpbmcsXG4gICAgICAgIGxvb2ssXG4gICAgICAgIHBvc2l0aW9uOiBwYXJzZWRJdGVtLm5vdGUucG9zaXRpb25cbiAgICAgIH07XG4gICAgICBjb25zdCBwYXJlbnROb2RlSWQgPSBpdGVtSWQgKyBQQVJFTlRfSUQ7XG4gICAgICBjb25zdCBncm91cERhdGEgPSB7XG4gICAgICAgIGxhYmVsU3R5bGU6IFwiXCIsXG4gICAgICAgIHNoYXBlOiBTSEFQRV9OT1RFR1JPVVAsXG4gICAgICAgIGxhYmVsOiBwYXJzZWRJdGVtLm5vdGUudGV4dCxcbiAgICAgICAgY3NzQ2xhc3NlczogbmV3Tm9kZS5jc3NDbGFzc2VzLFxuICAgICAgICBjc3NTdHlsZXM6IFtdLFxuICAgICAgICBpZDogaXRlbUlkICsgUEFSRU5UX0lELFxuICAgICAgICBkb21JZDogc3RhdGVEb21JZChpdGVtSWQsIGdyYXBoSXRlbUNvdW50LCBQQVJFTlQpLFxuICAgICAgICB0eXBlOiBcImdyb3VwXCIsXG4gICAgICAgIGlzR3JvdXA6IHRydWUsXG4gICAgICAgIHBhZGRpbmc6IDE2LFxuICAgICAgICAvL2dldENvbmZpZygpLmZsb3djaGFydC5wYWRkaW5nXG4gICAgICAgIGxvb2ssXG4gICAgICAgIHBvc2l0aW9uOiBwYXJzZWRJdGVtLm5vdGUucG9zaXRpb25cbiAgICAgIH07XG4gICAgICBncmFwaEl0ZW1Db3VudCsrO1xuICAgICAgZ3JvdXBEYXRhLmlkID0gcGFyZW50Tm9kZUlkO1xuICAgICAgbm90ZURhdGEucGFyZW50SWQgPSBwYXJlbnROb2RlSWQ7XG4gICAgICBpbnNlcnRPclVwZGF0ZU5vZGUobm9kZXMsIGdyb3VwRGF0YSwgY2xhc3Nlcyk7XG4gICAgICBpbnNlcnRPclVwZGF0ZU5vZGUobm9kZXMsIG5vdGVEYXRhLCBjbGFzc2VzKTtcbiAgICAgIGluc2VydE9yVXBkYXRlTm9kZShub2Rlcywgbm9kZURhdGEsIGNsYXNzZXMpO1xuICAgICAgbGV0IGZyb20gPSBpdGVtSWQ7XG4gICAgICBsZXQgdG8gPSBub3RlRGF0YS5pZDtcbiAgICAgIGlmIChwYXJzZWRJdGVtLm5vdGUucG9zaXRpb24gPT09IFwibGVmdCBvZlwiKSB7XG4gICAgICAgIGZyb20gPSBub3RlRGF0YS5pZDtcbiAgICAgICAgdG8gPSBpdGVtSWQ7XG4gICAgICB9XG4gICAgICBlZGdlcy5wdXNoKHtcbiAgICAgICAgaWQ6IGZyb20gKyBcIi1cIiArIHRvLFxuICAgICAgICBzdGFydDogZnJvbSxcbiAgICAgICAgZW5kOiB0byxcbiAgICAgICAgYXJyb3doZWFkOiBcIm5vbmVcIixcbiAgICAgICAgYXJyb3dUeXBlRW5kOiBcIlwiLFxuICAgICAgICBzdHlsZTogR19FREdFX1NUWUxFLFxuICAgICAgICBsYWJlbFN0eWxlOiBcIlwiLFxuICAgICAgICBjbGFzc2VzOiBDU1NfRURHRV9OT1RFX0VER0UsXG4gICAgICAgIGFycm93aGVhZFN0eWxlOiBHX0VER0VfQVJST1dIRUFEU1RZTEUsXG4gICAgICAgIGxhYmVscG9zOiBHX0VER0VfTEFCRUxQT1MsXG4gICAgICAgIGxhYmVsVHlwZTogR19FREdFX0xBQkVMVFlQRSxcbiAgICAgICAgdGhpY2tuZXNzOiBHX0VER0VfVEhJQ0tORVNTLFxuICAgICAgICBsb29rXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaW5zZXJ0T3JVcGRhdGVOb2RlKG5vZGVzLCBub2RlRGF0YSwgY2xhc3Nlcyk7XG4gICAgfVxuICB9XG4gIGlmIChwYXJzZWRJdGVtLmRvYykge1xuICAgIGxvZy50cmFjZShcIkFkZGluZyBub2RlcyBjaGlsZHJlbiBcIik7XG4gICAgc2V0dXBEb2MocGFyc2VkSXRlbSwgcGFyc2VkSXRlbS5kb2MsIGRpYWdyYW1TdGF0ZXMsIG5vZGVzLCBlZGdlcywgIWFsdEZsYWcsIGxvb2ssIGNsYXNzZXMpO1xuICB9XG59LCBcImRhdGFGZXRjaGVyXCIpO1xudmFyIHJlc2V0ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiB7XG4gIG5vZGVEYi5jbGVhcigpO1xuICBncmFwaEl0ZW1Db3VudCA9IDA7XG59LCBcInJlc2V0XCIpO1xuXG4vLyBzcmMvZGlhZ3JhbXMvc3RhdGUvc3RhdGVEYi50c1xudmFyIENPTlNUQU5UUyA9IHtcbiAgU1RBUlRfTk9ERTogXCJbKl1cIixcbiAgU1RBUlRfVFlQRTogXCJzdGFydFwiLFxuICBFTkRfTk9ERTogXCJbKl1cIixcbiAgRU5EX1RZUEU6IFwiZW5kXCIsXG4gIENPTE9SX0tFWVdPUkQ6IFwiY29sb3JcIixcbiAgRklMTF9LRVlXT1JEOiBcImZpbGxcIixcbiAgQkdfRklMTDogXCJiZ0ZpbGxcIixcbiAgU1RZTEVDTEFTU19TRVA6IFwiLFwiXG59O1xudmFyIG5ld0NsYXNzZXNMaXN0ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBcIm5ld0NsYXNzZXNMaXN0XCIpO1xudmFyIG5ld0RvYyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKCkgPT4gKHtcbiAgcmVsYXRpb25zOiBbXSxcbiAgc3RhdGVzOiAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLFxuICBkb2N1bWVudHM6IHt9XG59KSwgXCJuZXdEb2NcIik7XG52YXIgY2xvbmUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChvKSA9PiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG8pKSwgXCJjbG9uZVwiKTtcbnZhciBTdGF0ZURCID0gY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcih2ZXJzaW9uKSB7XG4gICAgdGhpcy52ZXJzaW9uID0gdmVyc2lvbjtcbiAgICB0aGlzLm5vZGVzID0gW107XG4gICAgdGhpcy5lZGdlcyA9IFtdO1xuICAgIHRoaXMucm9vdERvYyA9IFtdO1xuICAgIHRoaXMuY2xhc3NlcyA9IG5ld0NsYXNzZXNMaXN0KCk7XG4gICAgdGhpcy5kb2N1bWVudHMgPSB7IHJvb3Q6IG5ld0RvYygpIH07XG4gICAgdGhpcy5jdXJyZW50RG9jdW1lbnQgPSB0aGlzLmRvY3VtZW50cy5yb290O1xuICAgIHRoaXMuc3RhcnRFbmRDb3VudCA9IDA7XG4gICAgdGhpcy5kaXZpZGVyQ250ID0gMDtcbiAgICB0aGlzLmxpbmtzID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbiAgICB0aGlzLmdldEFjY1RpdGxlID0gZ2V0QWNjVGl0bGU7XG4gICAgdGhpcy5zZXRBY2NUaXRsZSA9IHNldEFjY1RpdGxlO1xuICAgIHRoaXMuZ2V0QWNjRGVzY3JpcHRpb24gPSBnZXRBY2NEZXNjcmlwdGlvbjtcbiAgICB0aGlzLnNldEFjY0Rlc2NyaXB0aW9uID0gc2V0QWNjRGVzY3JpcHRpb247XG4gICAgdGhpcy5zZXREaWFncmFtVGl0bGUgPSBzZXREaWFncmFtVGl0bGU7XG4gICAgdGhpcy5nZXREaWFncmFtVGl0bGUgPSBnZXREaWFncmFtVGl0bGU7XG4gICAgdGhpcy5jbGVhcigpO1xuICAgIHRoaXMuc2V0Um9vdERvYyA9IHRoaXMuc2V0Um9vdERvYy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZ2V0RGl2aWRlcklkID0gdGhpcy5nZXREaXZpZGVySWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLnNldERpcmVjdGlvbiA9IHRoaXMuc2V0RGlyZWN0aW9uLmJpbmQodGhpcyk7XG4gICAgdGhpcy50cmltQ29sb24gPSB0aGlzLnRyaW1Db2xvbi5iaW5kKHRoaXMpO1xuICB9XG4gIHN0YXRpYyB7XG4gICAgX19uYW1lKHRoaXMsIFwiU3RhdGVEQlwiKTtcbiAgfVxuICBzdGF0aWMge1xuICAgIHRoaXMucmVsYXRpb25UeXBlID0ge1xuICAgICAgQUdHUkVHQVRJT046IDAsXG4gICAgICBFWFRFTlNJT046IDEsXG4gICAgICBDT01QT1NJVElPTjogMixcbiAgICAgIERFUEVOREVOQ1k6IDNcbiAgICB9O1xuICB9XG4gIC8qKlxuICAgKiBDb252ZXJ0IGFsbCBvZiB0aGUgc3RhdGVtZW50cyAoc3RtdHMpIHRoYXQgd2VyZSBwYXJzZWQgaW50byBzdGF0ZXMgYW5kIHJlbGF0aW9uc2hpcHMuXG4gICAqIFRoaXMgaXMgZG9uZSBiZWNhdXNlIGEgc3RhdGUgZGlhZ3JhbSBtYXkgaGF2ZSBuZXN0ZWQgc2VjdGlvbnMsXG4gICAqIHdoZXJlIGVhY2ggc2VjdGlvbiBpcyBhICdkb2N1bWVudCcgYW5kIGhhcyBpdHMgb3duIHNldCBvZiBzdGF0ZW1lbnRzLlxuICAgKiBFeDogdGhlIHNlY3Rpb24gd2l0aGluIGEgZm9yayBoYXMgaXRzIG93biBzdGF0ZW1lbnRzLCBhbmQgaW5jb21pbmcgYW5kIG91dGdvaW5nIHN0YXRlbWVudHNcbiAgICogcmVmZXIgdG8gdGhlIGZvcmsgYXMgYSB3aG9sZSAoZG9jdW1lbnQpLlxuICAgKiBTZWUgdGhlIHBhcnNlciBncmFtbWFyOiAgdGhlIGRlZmluaXRpb24gb2YgYSBkb2N1bWVudCBpcyBhIGRvY3VtZW50IHRoZW4gYSAnbGluZScsIHdoZXJlIGEgbGluZSBjYW4gYmUgYSBzdGF0ZW1lbnQuXG4gICAqIFRoaXMgd2lsbCBwdXNoIHRoZSBzdGF0ZW1lbnQgaW50byB0aGUgbGlzdCBvZiBzdGF0ZW1lbnRzIGZvciB0aGUgY3VycmVudCBkb2N1bWVudC5cbiAgICovXG4gIGV4dHJhY3Qoc3RhdGVtZW50cykge1xuICAgIHRoaXMuY2xlYXIodHJ1ZSk7XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIEFycmF5LmlzQXJyYXkoc3RhdGVtZW50cykgPyBzdGF0ZW1lbnRzIDogc3RhdGVtZW50cy5kb2MpIHtcbiAgICAgIHN3aXRjaCAoaXRlbS5zdG10KSB7XG4gICAgICAgIGNhc2UgU1RNVF9TVEFURTpcbiAgICAgICAgICB0aGlzLmFkZFN0YXRlKGl0ZW0uaWQudHJpbSgpLCBpdGVtLnR5cGUsIGl0ZW0uZG9jLCBpdGVtLmRlc2NyaXB0aW9uLCBpdGVtLm5vdGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFNUTVRfUkVMQVRJT046XG4gICAgICAgICAgdGhpcy5hZGRSZWxhdGlvbihpdGVtLnN0YXRlMSwgaXRlbS5zdGF0ZTIsIGl0ZW0uZGVzY3JpcHRpb24pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFNUTVRfQ0xBU1NERUY6XG4gICAgICAgICAgdGhpcy5hZGRTdHlsZUNsYXNzKGl0ZW0uaWQudHJpbSgpLCBpdGVtLmNsYXNzZXMpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFNUTVRfU1RZTEVERUY6XG4gICAgICAgICAgdGhpcy5oYW5kbGVTdHlsZURlZihpdGVtKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBTVE1UX0FQUExZQ0xBU1M6XG4gICAgICAgICAgdGhpcy5zZXRDc3NDbGFzcyhpdGVtLmlkLnRyaW0oKSwgaXRlbS5zdHlsZUNsYXNzKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImNsaWNrXCI6XG4gICAgICAgICAgdGhpcy5hZGRMaW5rKGl0ZW0uaWQsIGl0ZW0udXJsLCBpdGVtLnRvb2x0aXApO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBkaWFncmFtU3RhdGVzID0gdGhpcy5nZXRTdGF0ZXMoKTtcbiAgICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgICByZXNldCgpO1xuICAgIGRhdGFGZXRjaGVyKFxuICAgICAgdm9pZCAwLFxuICAgICAgdGhpcy5nZXRSb290RG9jVjIoKSxcbiAgICAgIGRpYWdyYW1TdGF0ZXMsXG4gICAgICB0aGlzLm5vZGVzLFxuICAgICAgdGhpcy5lZGdlcyxcbiAgICAgIHRydWUsXG4gICAgICBjb25maWcubG9vayxcbiAgICAgIHRoaXMuY2xhc3Nlc1xuICAgICk7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIHRoaXMubm9kZXMpIHtcbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShub2RlLmxhYmVsKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIG5vZGUuZGVzY3JpcHRpb24gPSBub2RlLmxhYmVsLnNsaWNlKDEpO1xuICAgICAgaWYgKG5vZGUuaXNHcm91cCAmJiBub2RlLmRlc2NyaXB0aW9uLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBHcm91cCBub2RlcyBjYW4gb25seSBoYXZlIGxhYmVsLiBSZW1vdmUgdGhlIGFkZGl0aW9uYWwgZGVzY3JpcHRpb24gZm9yIG5vZGUgWyR7bm9kZS5pZH1dYFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgbm9kZS5sYWJlbCA9IG5vZGUubGFiZWxbMF07XG4gICAgfVxuICB9XG4gIGhhbmRsZVN0eWxlRGVmKGl0ZW0pIHtcbiAgICBjb25zdCBpZHMgPSBpdGVtLmlkLnRyaW0oKS5zcGxpdChcIixcIik7XG4gICAgY29uc3Qgc3R5bGVzID0gaXRlbS5zdHlsZUNsYXNzLnNwbGl0KFwiLFwiKTtcbiAgICBmb3IgKGNvbnN0IGlkIG9mIGlkcykge1xuICAgICAgbGV0IHN0YXRlID0gdGhpcy5nZXRTdGF0ZShpZCk7XG4gICAgICBpZiAoIXN0YXRlKSB7XG4gICAgICAgIGNvbnN0IHRyaW1tZWRJZCA9IGlkLnRyaW0oKTtcbiAgICAgICAgdGhpcy5hZGRTdGF0ZSh0cmltbWVkSWQpO1xuICAgICAgICBzdGF0ZSA9IHRoaXMuZ2V0U3RhdGUodHJpbW1lZElkKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdGF0ZSkge1xuICAgICAgICBzdGF0ZS5zdHlsZXMgPSBzdHlsZXMubWFwKChzKSA9PiBzLnJlcGxhY2UoLzsvZywgXCJcIik/LnRyaW0oKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHNldFJvb3REb2Mobykge1xuICAgIGxvZy5pbmZvKFwiU2V0dGluZyByb290IGRvY1wiLCBvKTtcbiAgICB0aGlzLnJvb3REb2MgPSBvO1xuICAgIGlmICh0aGlzLnZlcnNpb24gPT09IDEpIHtcbiAgICAgIHRoaXMuZXh0cmFjdChvKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5leHRyYWN0KHRoaXMuZ2V0Um9vdERvY1YyKCkpO1xuICAgIH1cbiAgfVxuICBkb2NUcmFuc2xhdG9yKHBhcmVudCwgbm9kZSwgZmlyc3QpIHtcbiAgICBpZiAobm9kZS5zdG10ID09PSBTVE1UX1JFTEFUSU9OKSB7XG4gICAgICB0aGlzLmRvY1RyYW5zbGF0b3IocGFyZW50LCBub2RlLnN0YXRlMSwgdHJ1ZSk7XG4gICAgICB0aGlzLmRvY1RyYW5zbGF0b3IocGFyZW50LCBub2RlLnN0YXRlMiwgZmFsc2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAobm9kZS5zdG10ID09PSBTVE1UX1NUQVRFKSB7XG4gICAgICBpZiAobm9kZS5pZCA9PT0gQ09OU1RBTlRTLlNUQVJUX05PREUpIHtcbiAgICAgICAgbm9kZS5pZCA9IHBhcmVudC5pZCArIChmaXJzdCA/IFwiX3N0YXJ0XCIgOiBcIl9lbmRcIik7XG4gICAgICAgIG5vZGUuc3RhcnQgPSBmaXJzdDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGUuaWQgPSBub2RlLmlkLnRyaW0oKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG5vZGUuc3RtdCAhPT0gU1RNVF9ST09UICYmIG5vZGUuc3RtdCAhPT0gU1RNVF9TVEFURSB8fCAhbm9kZS5kb2MpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZG9jID0gW107XG4gICAgbGV0IGN1cnJlbnREb2MgPSBbXTtcbiAgICBmb3IgKGNvbnN0IHN0bXQgb2Ygbm9kZS5kb2MpIHtcbiAgICAgIGlmIChzdG10LnR5cGUgPT09IERJVklERVJfVFlQRSkge1xuICAgICAgICBjb25zdCBuZXdOb2RlID0gY2xvbmUoc3RtdCk7XG4gICAgICAgIG5ld05vZGUuZG9jID0gY2xvbmUoY3VycmVudERvYyk7XG4gICAgICAgIGRvYy5wdXNoKG5ld05vZGUpO1xuICAgICAgICBjdXJyZW50RG9jID0gW107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjdXJyZW50RG9jLnB1c2goc3RtdCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChkb2MubGVuZ3RoID4gMCAmJiBjdXJyZW50RG9jLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG5ld05vZGUgPSB7XG4gICAgICAgIHN0bXQ6IFNUTVRfU1RBVEUsXG4gICAgICAgIGlkOiBnZW5lcmF0ZUlkKCksXG4gICAgICAgIHR5cGU6IFwiZGl2aWRlclwiLFxuICAgICAgICBkb2M6IGNsb25lKGN1cnJlbnREb2MpXG4gICAgICB9O1xuICAgICAgZG9jLnB1c2goY2xvbmUobmV3Tm9kZSkpO1xuICAgICAgbm9kZS5kb2MgPSBkb2M7XG4gICAgfVxuICAgIG5vZGUuZG9jLmZvckVhY2goKGRvY05vZGUpID0+IHRoaXMuZG9jVHJhbnNsYXRvcihub2RlLCBkb2NOb2RlLCB0cnVlKSk7XG4gIH1cbiAgZ2V0Um9vdERvY1YyKCkge1xuICAgIHRoaXMuZG9jVHJhbnNsYXRvcihcbiAgICAgIHsgaWQ6IFNUTVRfUk9PVCwgc3RtdDogU1RNVF9ST09UIH0sXG4gICAgICB7IGlkOiBTVE1UX1JPT1QsIHN0bXQ6IFNUTVRfUk9PVCwgZG9jOiB0aGlzLnJvb3REb2MgfSxcbiAgICAgIHRydWVcbiAgICApO1xuICAgIHJldHVybiB7IGlkOiBTVE1UX1JPT1QsIGRvYzogdGhpcy5yb290RG9jIH07XG4gIH1cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIGNhbGxlZCBieSBwYXJzZXIgd2hlbiBhIG5vZGUgZGVmaW5pdGlvbiBoYXMgYmVlbiBmb3VuZC5cbiAgICpcbiAgICogQHBhcmFtIGRlc2NyIC0gZGVzY3JpcHRpb24gZm9yIHRoZSBzdGF0ZS4gQ2FuIGJlIGEgc3RyaW5nIG9yIGEgbGlzdCBvciBzdHJpbmdzXG4gICAqIEBwYXJhbSBjbGFzc2VzIC0gY2xhc3Mgc3R5bGVzIHRvIGFwcGx5IHRvIHRoaXMgc3RhdGUuIENhbiBiZSBhIHN0cmluZyAoMSBzdHlsZSkgb3IgYW4gYXJyYXkgb2Ygc3R5bGVzLiBJZiBpdCdzIGp1c3QgMSBjbGFzcywgY29udmVydCBpdCB0byBhbiBhcnJheSBvZiB0aGF0IDEgY2xhc3MuXG4gICAqIEBwYXJhbSBzdHlsZXMgLSBzdHlsZXMgdG8gYXBwbHkgdG8gdGhpcyBzdGF0ZS4gQ2FuIGJlIGEgc3RyaW5nICgxIHN0eWxlKSBvciBhbiBhcnJheSBvZiBzdHlsZXMuIElmIGl0J3MganVzdCAxIHN0eWxlLCBjb252ZXJ0IGl0IHRvIGFuIGFycmF5IG9mIHRoYXQgMSBzdHlsZS5cbiAgICogQHBhcmFtIHRleHRTdHlsZXMgLSB0ZXh0IHN0eWxlcyB0byBhcHBseSB0byB0aGlzIHN0YXRlLiBDYW4gYmUgYSBzdHJpbmcgKDEgdGV4dCB0ZXN0KSBvciBhbiBhcnJheSBvZiB0ZXh0IHN0eWxlcy4gSWYgaXQncyBqdXN0IDEgdGV4dCBzdHlsZSwgY29udmVydCBpdCB0byBhbiBhcnJheSBvZiB0aGF0IDEgdGV4dCBzdHlsZS5cbiAgICovXG4gIGFkZFN0YXRlKGlkLCB0eXBlID0gREVGQVVMVF9TVEFURV9UWVBFLCBkb2MgPSB2b2lkIDAsIGRlc2NyID0gdm9pZCAwLCBub3RlID0gdm9pZCAwLCBjbGFzc2VzID0gdm9pZCAwLCBzdHlsZXMgPSB2b2lkIDAsIHRleHRTdHlsZXMgPSB2b2lkIDApIHtcbiAgICBjb25zdCB0cmltbWVkSWQgPSBpZD8udHJpbSgpO1xuICAgIGlmICghdGhpcy5jdXJyZW50RG9jdW1lbnQuc3RhdGVzLmhhcyh0cmltbWVkSWQpKSB7XG4gICAgICBsb2cuaW5mbyhcIkFkZGluZyBzdGF0ZSBcIiwgdHJpbW1lZElkLCBkZXNjcik7XG4gICAgICB0aGlzLmN1cnJlbnREb2N1bWVudC5zdGF0ZXMuc2V0KHRyaW1tZWRJZCwge1xuICAgICAgICBzdG10OiBTVE1UX1NUQVRFLFxuICAgICAgICBpZDogdHJpbW1lZElkLFxuICAgICAgICBkZXNjcmlwdGlvbnM6IFtdLFxuICAgICAgICB0eXBlLFxuICAgICAgICBkb2MsXG4gICAgICAgIG5vdGUsXG4gICAgICAgIGNsYXNzZXM6IFtdLFxuICAgICAgICBzdHlsZXM6IFtdLFxuICAgICAgICB0ZXh0U3R5bGVzOiBbXVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5jdXJyZW50RG9jdW1lbnQuc3RhdGVzLmdldCh0cmltbWVkSWQpO1xuICAgICAgaWYgKCFzdGF0ZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFN0YXRlIG5vdCBmb3VuZDogJHt0cmltbWVkSWR9YCk7XG4gICAgICB9XG4gICAgICBpZiAoIXN0YXRlLmRvYykge1xuICAgICAgICBzdGF0ZS5kb2MgPSBkb2M7XG4gICAgICB9XG4gICAgICBpZiAoIXN0YXRlLnR5cGUpIHtcbiAgICAgICAgc3RhdGUudHlwZSA9IHR5cGU7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChkZXNjcikge1xuICAgICAgbG9nLmluZm8oXCJTZXR0aW5nIHN0YXRlIGRlc2NyaXB0aW9uXCIsIHRyaW1tZWRJZCwgZGVzY3IpO1xuICAgICAgY29uc3QgZGVzY3JpcHRpb25zID0gQXJyYXkuaXNBcnJheShkZXNjcikgPyBkZXNjciA6IFtkZXNjcl07XG4gICAgICBkZXNjcmlwdGlvbnMuZm9yRWFjaCgoZGVzKSA9PiB0aGlzLmFkZERlc2NyaXB0aW9uKHRyaW1tZWRJZCwgZGVzLnRyaW0oKSkpO1xuICAgIH1cbiAgICBpZiAobm90ZSkge1xuICAgICAgY29uc3QgZG9jMiA9IHRoaXMuY3VycmVudERvY3VtZW50LnN0YXRlcy5nZXQodHJpbW1lZElkKTtcbiAgICAgIGlmICghZG9jMikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFN0YXRlIG5vdCBmb3VuZDogJHt0cmltbWVkSWR9YCk7XG4gICAgICB9XG4gICAgICBkb2MyLm5vdGUgPSBub3RlO1xuICAgICAgZG9jMi5ub3RlLnRleHQgPSBjb21tb25fZGVmYXVsdC5zYW5pdGl6ZVRleHQoZG9jMi5ub3RlLnRleHQsIGdldENvbmZpZygpKTtcbiAgICB9XG4gICAgaWYgKGNsYXNzZXMpIHtcbiAgICAgIGxvZy5pbmZvKFwiU2V0dGluZyBzdGF0ZSBjbGFzc2VzXCIsIHRyaW1tZWRJZCwgY2xhc3Nlcyk7XG4gICAgICBjb25zdCBjbGFzc2VzTGlzdCA9IEFycmF5LmlzQXJyYXkoY2xhc3NlcykgPyBjbGFzc2VzIDogW2NsYXNzZXNdO1xuICAgICAgY2xhc3Nlc0xpc3QuZm9yRWFjaCgoY3NzQ2xhc3MpID0+IHRoaXMuc2V0Q3NzQ2xhc3ModHJpbW1lZElkLCBjc3NDbGFzcy50cmltKCkpKTtcbiAgICB9XG4gICAgaWYgKHN0eWxlcykge1xuICAgICAgbG9nLmluZm8oXCJTZXR0aW5nIHN0YXRlIHN0eWxlc1wiLCB0cmltbWVkSWQsIHN0eWxlcyk7XG4gICAgICBjb25zdCBzdHlsZXNMaXN0ID0gQXJyYXkuaXNBcnJheShzdHlsZXMpID8gc3R5bGVzIDogW3N0eWxlc107XG4gICAgICBzdHlsZXNMaXN0LmZvckVhY2goKHN0eWxlKSA9PiB0aGlzLnNldFN0eWxlKHRyaW1tZWRJZCwgc3R5bGUudHJpbSgpKSk7XG4gICAgfVxuICAgIGlmICh0ZXh0U3R5bGVzKSB7XG4gICAgICBsb2cuaW5mbyhcIlNldHRpbmcgc3RhdGUgc3R5bGVzXCIsIHRyaW1tZWRJZCwgc3R5bGVzKTtcbiAgICAgIGNvbnN0IHRleHRTdHlsZXNMaXN0ID0gQXJyYXkuaXNBcnJheSh0ZXh0U3R5bGVzKSA/IHRleHRTdHlsZXMgOiBbdGV4dFN0eWxlc107XG4gICAgICB0ZXh0U3R5bGVzTGlzdC5mb3JFYWNoKCh0ZXh0U3R5bGUpID0+IHRoaXMuc2V0VGV4dFN0eWxlKHRyaW1tZWRJZCwgdGV4dFN0eWxlLnRyaW0oKSkpO1xuICAgIH1cbiAgfVxuICBjbGVhcihzYXZlQ29tbW9uKSB7XG4gICAgdGhpcy5ub2RlcyA9IFtdO1xuICAgIHRoaXMuZWRnZXMgPSBbXTtcbiAgICB0aGlzLmRvY3VtZW50cyA9IHsgcm9vdDogbmV3RG9jKCkgfTtcbiAgICB0aGlzLmN1cnJlbnREb2N1bWVudCA9IHRoaXMuZG9jdW1lbnRzLnJvb3Q7XG4gICAgdGhpcy5zdGFydEVuZENvdW50ID0gMDtcbiAgICB0aGlzLmNsYXNzZXMgPSBuZXdDbGFzc2VzTGlzdCgpO1xuICAgIGlmICghc2F2ZUNvbW1vbikge1xuICAgICAgdGhpcy5saW5rcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgICBjbGVhcigpO1xuICAgIH1cbiAgfVxuICBnZXRTdGF0ZShpZCkge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnREb2N1bWVudC5zdGF0ZXMuZ2V0KGlkKTtcbiAgfVxuICBnZXRTdGF0ZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuY3VycmVudERvY3VtZW50LnN0YXRlcztcbiAgfVxuICBsb2dEb2N1bWVudHMoKSB7XG4gICAgbG9nLmluZm8oXCJEb2N1bWVudHMgPSBcIiwgdGhpcy5kb2N1bWVudHMpO1xuICB9XG4gIGdldFJlbGF0aW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50RG9jdW1lbnQucmVsYXRpb25zO1xuICB9XG4gIC8qKlxuICAgKiBBZGRzIGEgY2xpY2thYmxlIGxpbmsgdG8gYSBzdGF0ZS5cbiAgICovXG4gIGFkZExpbmsoc3RhdGVJZCwgdXJsLCB0b29sdGlwKSB7XG4gICAgdGhpcy5saW5rcy5zZXQoc3RhdGVJZCwgeyB1cmwsIHRvb2x0aXAgfSk7XG4gICAgbG9nLndhcm4oXCJBZGRpbmcgbGlua1wiLCBzdGF0ZUlkLCB1cmwsIHRvb2x0aXApO1xuICB9XG4gIC8qKlxuICAgKiBHZXQgYWxsIHJlZ2lzdGVyZWQgbGlua3MuXG4gICAqL1xuICBnZXRMaW5rcygpIHtcbiAgICByZXR1cm4gdGhpcy5saW5rcztcbiAgfVxuICAvKipcbiAgICogSWYgdGhlIGlkIGlzIGEgc3RhcnQgbm9kZSAoIFsqXSApLCB0aGVuIHJldHVybiBhIG5ldyBpZCBjb25zdHJ1Y3RlZCBmcm9tXG4gICAqIHRoZSBzdGFydCBub2RlIG5hbWUgYW5kIHRoZSBjdXJyZW50IHN0YXJ0IG5vZGUgY291bnQuXG4gICAqIGVsc2UgcmV0dXJuIHRoZSBnaXZlbiBpZFxuICAgKi9cbiAgc3RhcnRJZElmTmVlZGVkKGlkID0gXCJcIikge1xuICAgIGlmIChpZCA9PT0gQ09OU1RBTlRTLlNUQVJUX05PREUpIHtcbiAgICAgIHRoaXMuc3RhcnRFbmRDb3VudCsrO1xuICAgICAgcmV0dXJuIGAke0NPTlNUQU5UUy5TVEFSVF9UWVBFfSR7dGhpcy5zdGFydEVuZENvdW50fWA7XG4gICAgfVxuICAgIHJldHVybiBpZDtcbiAgfVxuICAvKipcbiAgICogSWYgdGhlIGlkIGlzIGEgc3RhcnQgbm9kZSAoIFsqXSApLCB0aGVuIHJldHVybiB0aGUgc3RhcnQgdHlwZSAoJ3N0YXJ0JylcbiAgICogZWxzZSByZXR1cm4gdGhlIGdpdmVuIHR5cGVcbiAgICovXG4gIHN0YXJ0VHlwZUlmTmVlZGVkKGlkID0gXCJcIiwgdHlwZSA9IERFRkFVTFRfU1RBVEVfVFlQRSkge1xuICAgIHJldHVybiBpZCA9PT0gQ09OU1RBTlRTLlNUQVJUX05PREUgPyBDT05TVEFOVFMuU1RBUlRfVFlQRSA6IHR5cGU7XG4gIH1cbiAgLyoqXG4gICAqIElmIHRoZSBpZCBpcyBhbiBlbmQgbm9kZSAoIFsqXSApLCB0aGVuIHJldHVybiBhIG5ldyBpZCBjb25zdHJ1Y3RlZCBmcm9tXG4gICAqIHRoZSBlbmQgbm9kZSBuYW1lIGFuZCB0aGUgY3VycmVudCBzdGFydF9lbmQgbm9kZSBjb3VudC5cbiAgICogZWxzZSByZXR1cm4gdGhlIGdpdmVuIGlkXG4gICAqL1xuICBlbmRJZElmTmVlZGVkKGlkID0gXCJcIikge1xuICAgIGlmIChpZCA9PT0gQ09OU1RBTlRTLkVORF9OT0RFKSB7XG4gICAgICB0aGlzLnN0YXJ0RW5kQ291bnQrKztcbiAgICAgIHJldHVybiBgJHtDT05TVEFOVFMuRU5EX1RZUEV9JHt0aGlzLnN0YXJ0RW5kQ291bnR9YDtcbiAgICB9XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIC8qKlxuICAgKiBJZiB0aGUgaWQgaXMgYW4gZW5kIG5vZGUgKCBbKl0gKSwgdGhlbiByZXR1cm4gdGhlIGVuZCB0eXBlXG4gICAqIGVsc2UgcmV0dXJuIHRoZSBnaXZlbiB0eXBlXG4gICAqXG4gICAqL1xuICBlbmRUeXBlSWZOZWVkZWQoaWQgPSBcIlwiLCB0eXBlID0gREVGQVVMVF9TVEFURV9UWVBFKSB7XG4gICAgcmV0dXJuIGlkID09PSBDT05TVEFOVFMuRU5EX05PREUgPyBDT05TVEFOVFMuRU5EX1RZUEUgOiB0eXBlO1xuICB9XG4gIGFkZFJlbGF0aW9uT2JqcyhpdGVtMSwgaXRlbTIsIHJlbGF0aW9uVGl0bGUgPSBcIlwiKSB7XG4gICAgY29uc3QgaWQxID0gdGhpcy5zdGFydElkSWZOZWVkZWQoaXRlbTEuaWQudHJpbSgpKTtcbiAgICBjb25zdCB0eXBlMSA9IHRoaXMuc3RhcnRUeXBlSWZOZWVkZWQoaXRlbTEuaWQudHJpbSgpLCBpdGVtMS50eXBlKTtcbiAgICBjb25zdCBpZDIgPSB0aGlzLnN0YXJ0SWRJZk5lZWRlZChpdGVtMi5pZC50cmltKCkpO1xuICAgIGNvbnN0IHR5cGUyID0gdGhpcy5zdGFydFR5cGVJZk5lZWRlZChpdGVtMi5pZC50cmltKCksIGl0ZW0yLnR5cGUpO1xuICAgIHRoaXMuYWRkU3RhdGUoXG4gICAgICBpZDEsXG4gICAgICB0eXBlMSxcbiAgICAgIGl0ZW0xLmRvYyxcbiAgICAgIGl0ZW0xLmRlc2NyaXB0aW9uLFxuICAgICAgaXRlbTEubm90ZSxcbiAgICAgIGl0ZW0xLmNsYXNzZXMsXG4gICAgICBpdGVtMS5zdHlsZXMsXG4gICAgICBpdGVtMS50ZXh0U3R5bGVzXG4gICAgKTtcbiAgICB0aGlzLmFkZFN0YXRlKFxuICAgICAgaWQyLFxuICAgICAgdHlwZTIsXG4gICAgICBpdGVtMi5kb2MsXG4gICAgICBpdGVtMi5kZXNjcmlwdGlvbixcbiAgICAgIGl0ZW0yLm5vdGUsXG4gICAgICBpdGVtMi5jbGFzc2VzLFxuICAgICAgaXRlbTIuc3R5bGVzLFxuICAgICAgaXRlbTIudGV4dFN0eWxlc1xuICAgICk7XG4gICAgdGhpcy5jdXJyZW50RG9jdW1lbnQucmVsYXRpb25zLnB1c2goe1xuICAgICAgaWQxLFxuICAgICAgaWQyLFxuICAgICAgcmVsYXRpb25UaXRsZTogY29tbW9uX2RlZmF1bHQuc2FuaXRpemVUZXh0KHJlbGF0aW9uVGl0bGUsIGdldENvbmZpZygpKVxuICAgIH0pO1xuICB9XG4gIC8qKlxuICAgKiBBZGQgYSByZWxhdGlvbiBiZXR3ZWVuIHR3byBpdGVtcy4gIFRoZSBpdGVtcyBtYXkgYmUgZnVsbCBvYmplY3RzIG9yIGp1c3QgdGhlIHN0cmluZyBpZCBvZiBhIHN0YXRlLlxuICAgKi9cbiAgYWRkUmVsYXRpb24oaXRlbTEsIGl0ZW0yLCB0aXRsZSkge1xuICAgIGlmICh0eXBlb2YgaXRlbTEgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIGl0ZW0yID09PSBcIm9iamVjdFwiKSB7XG4gICAgICB0aGlzLmFkZFJlbGF0aW9uT2JqcyhpdGVtMSwgaXRlbTIsIHRpdGxlKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBpdGVtMSA9PT0gXCJzdHJpbmdcIiAmJiB0eXBlb2YgaXRlbTIgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGNvbnN0IGlkMSA9IHRoaXMuc3RhcnRJZElmTmVlZGVkKGl0ZW0xLnRyaW0oKSk7XG4gICAgICBjb25zdCB0eXBlMSA9IHRoaXMuc3RhcnRUeXBlSWZOZWVkZWQoaXRlbTEpO1xuICAgICAgY29uc3QgaWQyID0gdGhpcy5lbmRJZElmTmVlZGVkKGl0ZW0yLnRyaW0oKSk7XG4gICAgICBjb25zdCB0eXBlMiA9IHRoaXMuZW5kVHlwZUlmTmVlZGVkKGl0ZW0yKTtcbiAgICAgIHRoaXMuYWRkU3RhdGUoaWQxLCB0eXBlMSk7XG4gICAgICB0aGlzLmFkZFN0YXRlKGlkMiwgdHlwZTIpO1xuICAgICAgdGhpcy5jdXJyZW50RG9jdW1lbnQucmVsYXRpb25zLnB1c2goe1xuICAgICAgICBpZDEsXG4gICAgICAgIGlkMixcbiAgICAgICAgcmVsYXRpb25UaXRsZTogdGl0bGUgPyBjb21tb25fZGVmYXVsdC5zYW5pdGl6ZVRleHQodGl0bGUsIGdldENvbmZpZygpKSA6IHZvaWQgMFxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIGFkZERlc2NyaXB0aW9uKGlkLCBkZXNjcikge1xuICAgIGNvbnN0IHRoZVN0YXRlID0gdGhpcy5jdXJyZW50RG9jdW1lbnQuc3RhdGVzLmdldChpZCk7XG4gICAgY29uc3QgX2Rlc2NyID0gZGVzY3Iuc3RhcnRzV2l0aChcIjpcIikgPyBkZXNjci5yZXBsYWNlKFwiOlwiLCBcIlwiKS50cmltKCkgOiBkZXNjcjtcbiAgICB0aGVTdGF0ZT8uZGVzY3JpcHRpb25zPy5wdXNoKGNvbW1vbl9kZWZhdWx0LnNhbml0aXplVGV4dChfZGVzY3IsIGdldENvbmZpZygpKSk7XG4gIH1cbiAgY2xlYW51cExhYmVsKGxhYmVsKSB7XG4gICAgcmV0dXJuIGxhYmVsLnN0YXJ0c1dpdGgoXCI6XCIpID8gbGFiZWwuc2xpY2UoMikudHJpbSgpIDogbGFiZWwudHJpbSgpO1xuICB9XG4gIGdldERpdmlkZXJJZCgpIHtcbiAgICB0aGlzLmRpdmlkZXJDbnQrKztcbiAgICByZXR1cm4gYGRpdmlkZXItaWQtJHt0aGlzLmRpdmlkZXJDbnR9YDtcbiAgfVxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIHBhcnNlciBjb21lcyBhY3Jvc3MgYSAoc3R5bGUpIGNsYXNzIGRlZmluaXRpb25cbiAgICogQGV4YW1wbGUgY2xhc3NEZWYgbXktc3R5bGUgZmlsbDojZjk2O1xuICAgKlxuICAgKiBAcGFyYW0gaWQgLSB0aGUgaWQgb2YgdGhpcyAoc3R5bGUpIGNsYXNzXG4gICAqIEBwYXJhbSBzdHlsZUF0dHJpYnV0ZXMgLSB0aGUgc3RyaW5nIHdpdGggMSBvciBtb3JlIHN0eWxlIGF0dHJpYnV0ZXMgKGVhY2ggc2VwYXJhdGVkIGJ5IGEgY29tbWEpXG4gICAqL1xuICBhZGRTdHlsZUNsYXNzKGlkLCBzdHlsZUF0dHJpYnV0ZXMgPSBcIlwiKSB7XG4gICAgaWYgKCF0aGlzLmNsYXNzZXMuaGFzKGlkKSkge1xuICAgICAgdGhpcy5jbGFzc2VzLnNldChpZCwgeyBpZCwgc3R5bGVzOiBbXSwgdGV4dFN0eWxlczogW10gfSk7XG4gICAgfVxuICAgIGNvbnN0IGZvdW5kQ2xhc3MgPSB0aGlzLmNsYXNzZXMuZ2V0KGlkKTtcbiAgICBpZiAoc3R5bGVBdHRyaWJ1dGVzICYmIGZvdW5kQ2xhc3MpIHtcbiAgICAgIHN0eWxlQXR0cmlidXRlcy5zcGxpdChDT05TVEFOVFMuU1RZTEVDTEFTU19TRVApLmZvckVhY2goKGF0dHJpYikgPT4ge1xuICAgICAgICBjb25zdCBmaXhlZEF0dHJpYiA9IGF0dHJpYi5yZXBsYWNlKC8oW147XSopOy8sIFwiJDFcIikudHJpbSgpO1xuICAgICAgICBpZiAoUmVnRXhwKENPTlNUQU5UUy5DT0xPUl9LRVlXT1JEKS5leGVjKGF0dHJpYikpIHtcbiAgICAgICAgICBjb25zdCBuZXdTdHlsZTEgPSBmaXhlZEF0dHJpYi5yZXBsYWNlKENPTlNUQU5UUy5GSUxMX0tFWVdPUkQsIENPTlNUQU5UUy5CR19GSUxMKTtcbiAgICAgICAgICBjb25zdCBuZXdTdHlsZTIgPSBuZXdTdHlsZTEucmVwbGFjZShDT05TVEFOVFMuQ09MT1JfS0VZV09SRCwgQ09OU1RBTlRTLkZJTExfS0VZV09SRCk7XG4gICAgICAgICAgZm91bmRDbGFzcy50ZXh0U3R5bGVzLnB1c2gobmV3U3R5bGUyKTtcbiAgICAgICAgfVxuICAgICAgICBmb3VuZENsYXNzLnN0eWxlcy5wdXNoKGZpeGVkQXR0cmliKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBnZXRDbGFzc2VzKCkge1xuICAgIHJldHVybiB0aGlzLmNsYXNzZXM7XG4gIH1cbiAgLyoqXG4gICAqIEFkZCBhIChzdHlsZSkgY2xhc3Mgb3IgY3NzIGNsYXNzIHRvIGEgc3RhdGUgd2l0aCB0aGUgZ2l2ZW4gaWQuXG4gICAqIElmIHRoZSBzdGF0ZSBpc24ndCBhbHJlYWR5IGluIHRoZSBsaXN0IG9mIGtub3duIHN0YXRlcywgYWRkIGl0LlxuICAgKiBNaWdodCBiZSBjYWxsZWQgYnkgcGFyc2VyIHdoZW4gYSBzdHlsZSBjbGFzcyBvciBDU1MgY2xhc3Mgc2hvdWxkIGJlIGFwcGxpZWQgdG8gYSBzdGF0ZVxuICAgKlxuICAgKiBAcGFyYW0gaXRlbUlkcyAtIFRoZSBpZCBvciBhIGxpc3Qgb2YgaWRzIG9mIHRoZSBpdGVtKHMpIHRvIGFwcGx5IHRoZSBjc3MgY2xhc3MgdG9cbiAgICogQHBhcmFtIGNzc0NsYXNzTmFtZSAtIENTUyBjbGFzcyBuYW1lXG4gICAqL1xuICBzZXRDc3NDbGFzcyhpdGVtSWRzLCBjc3NDbGFzc05hbWUpIHtcbiAgICBpdGVtSWRzLnNwbGl0KFwiLFwiKS5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgbGV0IGZvdW5kU3RhdGUgPSB0aGlzLmdldFN0YXRlKGlkKTtcbiAgICAgIGlmICghZm91bmRTdGF0ZSkge1xuICAgICAgICBjb25zdCB0cmltbWVkSWQgPSBpZC50cmltKCk7XG4gICAgICAgIHRoaXMuYWRkU3RhdGUodHJpbW1lZElkKTtcbiAgICAgICAgZm91bmRTdGF0ZSA9IHRoaXMuZ2V0U3RhdGUodHJpbW1lZElkKTtcbiAgICAgIH1cbiAgICAgIGZvdW5kU3RhdGU/LmNsYXNzZXM/LnB1c2goY3NzQ2xhc3NOYW1lKTtcbiAgICB9KTtcbiAgfVxuICAvKipcbiAgICogQWRkIGEgc3R5bGUgdG8gYSBzdGF0ZSB3aXRoIHRoZSBnaXZlbiBpZC5cbiAgICogQGV4YW1wbGUgc3R5bGUgc3RhdGVJZCBmaWxsOiNmOWYsc3Ryb2tlOiMzMzMsc3Ryb2tlLXdpZHRoOjRweFxuICAgKiAgIHdoZXJlICdzdHlsZScgaXMgdGhlIGtleXdvcmRcbiAgICogICBzdGF0ZUlkIGlzIHRoZSBpZCBvZiBhIHN0YXRlXG4gICAqICAgdGhlIHJlc3Qgb2YgdGhlIHN0cmluZyBpcyB0aGUgc3R5bGVUZXh0IChhbGwgb2YgdGhlIGF0dHJpYnV0ZXMgdG8gYmUgYXBwbGllZCB0byB0aGUgc3RhdGUpXG4gICAqXG4gICAqIEBwYXJhbSBpdGVtSWQgLSBUaGUgaWQgb2YgaXRlbSB0byBhcHBseSB0aGUgc3R5bGUgdG9cbiAgICogQHBhcmFtIHN0eWxlVGV4dCAtIHRoZSB0ZXh0IG9mIHRoZSBhdHRyaWJ1dGVzIGZvciB0aGUgc3R5bGVcbiAgICovXG4gIHNldFN0eWxlKGl0ZW1JZCwgc3R5bGVUZXh0KSB7XG4gICAgdGhpcy5nZXRTdGF0ZShpdGVtSWQpPy5zdHlsZXM/LnB1c2goc3R5bGVUZXh0KTtcbiAgfVxuICAvKipcbiAgICogQWRkIGEgdGV4dCBzdHlsZSB0byBhIHN0YXRlIHdpdGggdGhlIGdpdmVuIGlkXG4gICAqXG4gICAqIEBwYXJhbSBpdGVtSWQgLSBUaGUgaWQgb2YgaXRlbSB0byBhcHBseSB0aGUgY3NzIGNsYXNzIHRvXG4gICAqIEBwYXJhbSBjc3NDbGFzc05hbWUgLSBDU1MgY2xhc3MgbmFtZVxuICAgKi9cbiAgc2V0VGV4dFN0eWxlKGl0ZW1JZCwgY3NzQ2xhc3NOYW1lKSB7XG4gICAgdGhpcy5nZXRTdGF0ZShpdGVtSWQpPy50ZXh0U3R5bGVzPy5wdXNoKGNzc0NsYXNzTmFtZSk7XG4gIH1cbiAgLyoqXG4gICAqIEZpbmRzIHRoZSBkaXJlY3Rpb24gc3RhdGVtZW50IGluIHRoZSByb290IGRvY3VtZW50LlxuICAgKiBAcmV0dXJucyB0aGUgZGlyZWN0aW9uIHN0YXRlbWVudCBpZiBwcmVzZW50XG4gICAqL1xuICBnZXREaXJlY3Rpb25TdGF0ZW1lbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMucm9vdERvYy5maW5kKChkb2MpID0+IGRvYy5zdG10ID09PSBTVE1UX0RJUkVDVElPTik7XG4gIH1cbiAgZ2V0RGlyZWN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldERpcmVjdGlvblN0YXRlbWVudCgpPy52YWx1ZSA/PyBERUZBVUxUX0RJQUdSQU1fRElSRUNUSU9OO1xuICB9XG4gIHNldERpcmVjdGlvbihkaXIpIHtcbiAgICBjb25zdCBkb2MgPSB0aGlzLmdldERpcmVjdGlvblN0YXRlbWVudCgpO1xuICAgIGlmIChkb2MpIHtcbiAgICAgIGRvYy52YWx1ZSA9IGRpcjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yb290RG9jLnVuc2hpZnQoeyBzdG10OiBTVE1UX0RJUkVDVElPTiwgdmFsdWU6IGRpciB9KTtcbiAgICB9XG4gIH1cbiAgdHJpbUNvbG9uKHN0cikge1xuICAgIHJldHVybiBzdHIuc3RhcnRzV2l0aChcIjpcIikgPyBzdHIuc2xpY2UoMSkudHJpbSgpIDogc3RyLnRyaW0oKTtcbiAgfVxuICBnZXREYXRhKCkge1xuICAgIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICAgIHJldHVybiB7XG4gICAgICBub2RlczogdGhpcy5ub2RlcyxcbiAgICAgIGVkZ2VzOiB0aGlzLmVkZ2VzLFxuICAgICAgb3RoZXI6IHt9LFxuICAgICAgY29uZmlnLFxuICAgICAgZGlyZWN0aW9uOiBnZXREaXIodGhpcy5nZXRSb290RG9jVjIoKSlcbiAgICB9O1xuICB9XG4gIGdldENvbmZpZygpIHtcbiAgICByZXR1cm4gZ2V0Q29uZmlnKCkuc3RhdGU7XG4gIH1cbn07XG5cbi8vIHNyYy9kaWFncmFtcy9zdGF0ZS9zdHlsZXMuanNcbnZhciBnZXRTdHlsZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChvcHRpb25zKSA9PiBgXG5kZWZzIFtpZCQ9XCItYmFyYkVuZFwiXSB7XG4gICAgZmlsbDogJHtvcHRpb25zLnRyYW5zaXRpb25Db2xvcn07XG4gICAgc3Ryb2tlOiAke29wdGlvbnMudHJhbnNpdGlvbkNvbG9yfTtcbiAgfVxuZy5zdGF0ZUdyb3VwIHRleHQge1xuICBmaWxsOiAke29wdGlvbnMubm9kZUJvcmRlcn07XG4gIHN0cm9rZTogbm9uZTtcbiAgZm9udC1zaXplOiAxMHB4O1xufVxuZy5zdGF0ZUdyb3VwIHRleHQge1xuICBmaWxsOiAke29wdGlvbnMudGV4dENvbG9yfTtcbiAgc3Ryb2tlOiBub25lO1xuICBmb250LXNpemU6IDEwcHg7XG5cbn1cbmcuc3RhdGVHcm91cCAuc3RhdGUtdGl0bGUge1xuICBmb250LXdlaWdodDogYm9sZGVyO1xuICBmaWxsOiAke29wdGlvbnMuc3RhdGVMYWJlbENvbG9yfTtcbn1cblxuZy5zdGF0ZUdyb3VwIHJlY3Qge1xuICBmaWxsOiAke29wdGlvbnMubWFpbkJrZ307XG4gIHN0cm9rZTogJHtvcHRpb25zLm5vZGVCb3JkZXJ9O1xufVxuXG5nLnN0YXRlR3JvdXAgbGluZSB7XG4gIHN0cm9rZTogJHtvcHRpb25zLmxpbmVDb2xvcn07XG4gIHN0cm9rZS13aWR0aDogJHtvcHRpb25zLnN0cm9rZVdpZHRoIHx8IDF9O1xufVxuXG4udHJhbnNpdGlvbiB7XG4gIHN0cm9rZTogJHtvcHRpb25zLnRyYW5zaXRpb25Db2xvcn07XG4gIHN0cm9rZS13aWR0aDogJHtvcHRpb25zLnN0cm9rZVdpZHRoIHx8IDF9O1xuICBmaWxsOiBub25lO1xufVxuXG4uc3RhdGVHcm91cCAuY29tcG9zaXQge1xuICBmaWxsOiAke29wdGlvbnMuYmFja2dyb3VuZH07XG4gIGJvcmRlci1ib3R0b206IDFweFxufVxuXG4uc3RhdGVHcm91cCAuYWx0LWNvbXBvc2l0IHtcbiAgZmlsbDogI2UwZTBlMDtcbiAgYm9yZGVyLWJvdHRvbTogMXB4XG59XG5cbi5zdGF0ZS1ub3RlIHtcbiAgc3Ryb2tlOiAke29wdGlvbnMubm90ZUJvcmRlckNvbG9yfTtcbiAgZmlsbDogJHtvcHRpb25zLm5vdGVCa2dDb2xvcn07XG5cbiAgdGV4dCB7XG4gICAgZmlsbDogJHtvcHRpb25zLm5vdGVUZXh0Q29sb3J9O1xuICAgIHN0cm9rZTogbm9uZTtcbiAgICBmb250LXNpemU6IDEwcHg7XG4gIH1cbn1cblxuLnN0YXRlTGFiZWwgLmJveCB7XG4gIHN0cm9rZTogbm9uZTtcbiAgc3Ryb2tlLXdpZHRoOiAwO1xuICBmaWxsOiAke29wdGlvbnMubWFpbkJrZ307XG4gIG9wYWNpdHk6IDAuNTtcbn1cblxuLmVkZ2VMYWJlbCAubGFiZWwgcmVjdCB7XG4gIGZpbGw6ICR7b3B0aW9ucy5sYWJlbEJhY2tncm91bmRDb2xvcn07XG4gIG9wYWNpdHk6IDAuNTtcbn1cbi5lZGdlTGFiZWwge1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAke29wdGlvbnMuZWRnZUxhYmVsQmFja2dyb3VuZH07XG4gIHAge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICR7b3B0aW9ucy5lZGdlTGFiZWxCYWNrZ3JvdW5kfTtcbiAgfVxuICByZWN0IHtcbiAgICBvcGFjaXR5OiAwLjU7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogJHtvcHRpb25zLmVkZ2VMYWJlbEJhY2tncm91bmR9O1xuICAgIGZpbGw6ICR7b3B0aW9ucy5lZGdlTGFiZWxCYWNrZ3JvdW5kfTtcbiAgfVxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG59XG4uZWRnZUxhYmVsIC5sYWJlbCB0ZXh0IHtcbiAgZmlsbDogJHtvcHRpb25zLnRyYW5zaXRpb25MYWJlbENvbG9yIHx8IG9wdGlvbnMudGVydGlhcnlUZXh0Q29sb3J9O1xufVxuLmxhYmVsIGRpdiAuZWRnZUxhYmVsIHtcbiAgY29sb3I6ICR7b3B0aW9ucy50cmFuc2l0aW9uTGFiZWxDb2xvciB8fCBvcHRpb25zLnRlcnRpYXJ5VGV4dENvbG9yfTtcbn1cblxuLnN0YXRlTGFiZWwgdGV4dCB7XG4gIGZpbGw6ICR7b3B0aW9ucy5zdGF0ZUxhYmVsQ29sb3J9O1xuICBmb250LXNpemU6IDEwcHg7XG4gIGZvbnQtd2VpZ2h0OiBib2xkO1xufVxuXG4ubm9kZSBjaXJjbGUuc3RhdGUtc3RhcnQge1xuICBmaWxsOiAke29wdGlvbnMuc3BlY2lhbFN0YXRlQ29sb3J9O1xuICBzdHJva2U6ICR7b3B0aW9ucy5zcGVjaWFsU3RhdGVDb2xvcn07XG59XG5cbi5ub2RlIC5mb3JrLWpvaW4ge1xuICBmaWxsOiAke29wdGlvbnMuc3BlY2lhbFN0YXRlQ29sb3J9O1xuICBzdHJva2U6ICR7b3B0aW9ucy5zcGVjaWFsU3RhdGVDb2xvcn07XG59XG5cbi5ub2RlIGNpcmNsZS5zdGF0ZS1lbmQge1xuICBmaWxsOiAke29wdGlvbnMuaW5uZXJFbmRCYWNrZ3JvdW5kfTtcbiAgc3Ryb2tlOiAke29wdGlvbnMuYmFja2dyb3VuZH07XG4gIHN0cm9rZS13aWR0aDogMS41XG59XG4uZW5kLXN0YXRlLWlubmVyIHtcbiAgZmlsbDogJHtvcHRpb25zLmNvbXBvc2l0ZUJhY2tncm91bmQgfHwgb3B0aW9ucy5iYWNrZ3JvdW5kfTtcbiAgLy8gc3Ryb2tlOiAke29wdGlvbnMuYmFja2dyb3VuZH07XG4gIHN0cm9rZS13aWR0aDogMS41XG59XG5cbi5ub2RlIHJlY3Qge1xuICBmaWxsOiAke29wdGlvbnMuc3RhdGVCa2cgfHwgb3B0aW9ucy5tYWluQmtnfTtcbiAgc3Ryb2tlOiAke29wdGlvbnMuc3RhdGVCb3JkZXIgfHwgb3B0aW9ucy5ub2RlQm9yZGVyfTtcbiAgc3Ryb2tlLXdpZHRoOiAke29wdGlvbnMuc3Ryb2tlV2lkdGggfHwgMX1weDtcbn1cbi5ub2RlIHBvbHlnb24ge1xuICBmaWxsOiAke29wdGlvbnMubWFpbkJrZ307XG4gIHN0cm9rZTogJHtvcHRpb25zLnN0YXRlQm9yZGVyIHx8IG9wdGlvbnMubm9kZUJvcmRlcn07O1xuICBzdHJva2Utd2lkdGg6ICR7b3B0aW9ucy5zdHJva2VXaWR0aCB8fCAxfXB4O1xufVxuW2lkJD1cIi1iYXJiRW5kXCJdIHtcbiAgZmlsbDogJHtvcHRpb25zLmxpbmVDb2xvcn07XG59XG5cbi5zdGF0ZWRpYWdyYW0tY2x1c3RlciByZWN0IHtcbiAgZmlsbDogJHtvcHRpb25zLmNvbXBvc2l0ZVRpdGxlQmFja2dyb3VuZH07XG4gIHN0cm9rZTogJHtvcHRpb25zLnN0YXRlQm9yZGVyIHx8IG9wdGlvbnMubm9kZUJvcmRlcn07XG4gIHN0cm9rZS13aWR0aDogJHtvcHRpb25zLnN0cm9rZVdpZHRoIHx8IDF9cHg7XG59XG5cbi5jbHVzdGVyLWxhYmVsLCAubm9kZUxhYmVsIHtcbiAgY29sb3I6ICR7b3B0aW9ucy5zdGF0ZUxhYmVsQ29sb3J9O1xuICAvLyBsaW5lLWhlaWdodDogMTtcbn1cblxuLnN0YXRlZGlhZ3JhbS1jbHVzdGVyIHJlY3Qub3V0ZXIge1xuICByeDogNXB4O1xuICByeTogNXB4O1xufVxuLnN0YXRlZGlhZ3JhbS1zdGF0ZSAuZGl2aWRlciB7XG4gIHN0cm9rZTogJHtvcHRpb25zLnN0YXRlQm9yZGVyIHx8IG9wdGlvbnMubm9kZUJvcmRlcn07XG59XG5cbi5zdGF0ZWRpYWdyYW0tc3RhdGUgLnRpdGxlLXN0YXRlIHtcbiAgcng6IDVweDtcbiAgcnk6IDVweDtcbn1cbi5zdGF0ZWRpYWdyYW0tY2x1c3Rlci5zdGF0ZWRpYWdyYW0tY2x1c3RlciAuaW5uZXIge1xuICBmaWxsOiAke29wdGlvbnMuY29tcG9zaXRlQmFja2dyb3VuZCB8fCBvcHRpb25zLmJhY2tncm91bmR9O1xufVxuLnN0YXRlZGlhZ3JhbS1jbHVzdGVyLnN0YXRlZGlhZ3JhbS1jbHVzdGVyLWFsdCAuaW5uZXIge1xuICBmaWxsOiAke29wdGlvbnMuYWx0QmFja2dyb3VuZCA/IG9wdGlvbnMuYWx0QmFja2dyb3VuZCA6IFwiI2VmZWZlZlwifTtcbn1cblxuLnN0YXRlZGlhZ3JhbS1jbHVzdGVyIC5pbm5lciB7XG4gIHJ4OjA7XG4gIHJ5OjA7XG59XG5cbi5zdGF0ZWRpYWdyYW0tc3RhdGUgcmVjdC5iYXNpYyB7XG4gIHJ4OiA1cHg7XG4gIHJ5OiA1cHg7XG59XG4uc3RhdGVkaWFncmFtLXN0YXRlIHJlY3QuZGl2aWRlciB7XG4gIHN0cm9rZS1kYXNoYXJyYXk6IDEwLDEwO1xuICBmaWxsOiAke29wdGlvbnMuYWx0QmFja2dyb3VuZCA/IG9wdGlvbnMuYWx0QmFja2dyb3VuZCA6IFwiI2VmZWZlZlwifTtcbn1cblxuLm5vdGUtZWRnZSB7XG4gIHN0cm9rZS1kYXNoYXJyYXk6IDU7XG59XG5cbi5zdGF0ZWRpYWdyYW0tbm90ZSByZWN0IHtcbiAgZmlsbDogJHtvcHRpb25zLm5vdGVCa2dDb2xvcn07XG4gIHN0cm9rZTogJHtvcHRpb25zLm5vdGVCb3JkZXJDb2xvcn07XG4gIHN0cm9rZS13aWR0aDogMXB4O1xuICByeDogMDtcbiAgcnk6IDA7XG59XG4uc3RhdGVkaWFncmFtLW5vdGUgcmVjdCB7XG4gIGZpbGw6ICR7b3B0aW9ucy5ub3RlQmtnQ29sb3J9O1xuICBzdHJva2U6ICR7b3B0aW9ucy5ub3RlQm9yZGVyQ29sb3J9O1xuICBzdHJva2Utd2lkdGg6IDFweDtcbiAgcng6IDA7XG4gIHJ5OiAwO1xufVxuXG4uc3RhdGVkaWFncmFtLW5vdGUgdGV4dCB7XG4gIGZpbGw6ICR7b3B0aW9ucy5ub3RlVGV4dENvbG9yfTtcbn1cblxuLnN0YXRlZGlhZ3JhbS1ub3RlIC5ub2RlTGFiZWwge1xuICBjb2xvcjogJHtvcHRpb25zLm5vdGVUZXh0Q29sb3J9O1xufVxuLnN0YXRlZGlhZ3JhbSAuZWRnZUxhYmVsIHtcbiAgY29sb3I6IHJlZDsgLy8gJHtvcHRpb25zLm5vdGVUZXh0Q29sb3J9O1xufVxuXG5baWQkPVwiLWRlcGVuZGVuY3lTdGFydFwiXSwgW2lkJD1cIi1kZXBlbmRlbmN5RW5kXCJdIHtcbiAgZmlsbDogJHtvcHRpb25zLmxpbmVDb2xvcn07XG4gIHN0cm9rZTogJHtvcHRpb25zLmxpbmVDb2xvcn07XG4gIHN0cm9rZS13aWR0aDogJHtvcHRpb25zLnN0cm9rZVdpZHRoIHx8IDF9O1xufVxuXG4uc3RhdGVkaWFncmFtVGl0bGVUZXh0IHtcbiAgdGV4dC1hbmNob3I6IG1pZGRsZTtcbiAgZm9udC1zaXplOiAxOHB4O1xuICBmaWxsOiAke29wdGlvbnMudGV4dENvbG9yfTtcbn1cblxuW2RhdGEtbG9vaz1cIm5lb1wiXS5zdGF0ZWRpYWdyYW0tY2x1c3RlciByZWN0IHtcbiAgZmlsbDogJHtvcHRpb25zLm1haW5Ca2d9O1xuICBzdHJva2U6ICR7b3B0aW9ucy51c2VHcmFkaWVudCA/IFwidXJsKFwiICsgb3B0aW9ucy5zdmdJZCArIFwiLWdyYWRpZW50KVwiIDogb3B0aW9ucy5zdGF0ZUJvcmRlciB8fCBvcHRpb25zLm5vZGVCb3JkZXJ9O1xuICBzdHJva2Utd2lkdGg6ICR7b3B0aW9ucy5zdHJva2VXaWR0aCA/PyAxfTtcbn1cbltkYXRhLWxvb2s9XCJuZW9cIl0uc3RhdGVkaWFncmFtLWNsdXN0ZXIgcmVjdC5vdXRlciB7XG4gIHJ4OiAke29wdGlvbnMucmFkaXVzfXB4O1xuICByeTogJHtvcHRpb25zLnJhZGl1c31weDtcbiAgZmlsdGVyOiAke29wdGlvbnMuZHJvcFNoYWRvdyA/IG9wdGlvbnMuZHJvcFNoYWRvdy5yZXBsYWNlKFwidXJsKCNkcm9wLXNoYWRvdylcIiwgYHVybCgke29wdGlvbnMuc3ZnSWR9LWRyb3Atc2hhZG93KWApIDogXCJub25lXCJ9XG59XG5gLCBcImdldFN0eWxlc1wiKTtcbnZhciBzdHlsZXNfZGVmYXVsdCA9IGdldFN0eWxlcztcblxuZXhwb3J0IHtcbiAgc3RhdGVEaWFncmFtX2RlZmF1bHQsXG4gIHN0YXRlUmVuZGVyZXJfdjNfdW5pZmllZF9kZWZhdWx0LFxuICBTdGF0ZURCLFxuICBzdHlsZXNfZGVm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LEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFD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R0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxLQUFLLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxLQUFLLEVBQUUsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLEtBQUssRUFBRSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUss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QUcsYUFBZSxFQUFFLE9BQVMsQ0FBQyxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcsT0FBUyxFQUFFLE9BQVMsQ0FBQyxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcsWUFBYyxFQUFFLE9BQVMsQ0FBQyxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcsVUFBWSxFQUFFLE9BQVMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxXQUFhLE1BQU0sR0FBRyxxQkFBdUIsRUFBRSxPQUFTLENBQUMsSUFBSSxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcsV0FBYSxFQUFFLE9BQVMsQ0FBQyxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcsV0FBYSxFQUFFLE9BQVMsQ0FBQyxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcsT0FBUyxFQUFFLE9BQVMsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcsT0FBUyxFQUFFLE9BQVMsQ0FBQyxHQUFHLFdBQWEsTUFBTSxHQUFHLFVBQVksRUFBRSxPQUFTLENBQUMsRUFBRSxHQUFHLFdBQWEsTUFBTSxHQUFHLGNBQWdCLEVBQUUsT0FBUyxDQUFDLElBQUksRUFBRSxHQUFHLFdBQWEsTUFBTSxHQUFHLFlBQWMsRUFBRSxPQUFTLENBQUMsR0FBRyxXQUFhLE1BQU0sR0FBRyxPQUFTLEVBQUUsT0FBUyxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLFdBQWEsTUFBTSxHQUFHLElBQU0sRUFBRSxPQUFTLENBQUMsSUFBSSxJQUFJLEVBQUUsR0FBRyxXQUFhLE1BQU0sR0FBRyxTQUFXLEVBQUUsT0FBUyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJ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QUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQVFoRCxRQUFRO0FBQUEsWUFDTixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBTVYsUUFBUTtBQUFBLFlBQ04sUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFVBT1YsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBLFdBSVAsUUFBUTtBQUFBO0FBQUE7QUFBQSxtQkFHQSxRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsVUFJakIsUUFBUTtBQUFBLFlBQ04sUUFBUTtBQUFBLGtCQUNGLFFBQVEsZUFBZTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQU0vQixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsVUFJUixRQUFRO0FBQUEsWUFDTixRQUFRLGNBQWMsU0FBUyxRQUFRLFFBQVEsZUFBZSxRQUFRLGVBQWUsUUFBUTtBQUFBLGtCQUN2RixRQUFRLGVBQWU7QUFBQTtBQUFBO0FBQUEsUUFHakMsUUFBUTtBQUFBLFFBQ1IsUUFBUTtBQUFBLFlBQ0osUUFBUSxhQUFhLFFBQVEsV0FBVyxRQUFRLHFCQUFxQixPQUFPLFFBQVEsb0JBQW9CLElBQUk7QUFBQTtBQUFBLEdBRXJILFdBQVc7QUFDZCxJQUFJLGlCQUFpQjsiLAogICJkZWJ1Z0lkIjogIkY0ODVERDJBMUZGMTRBNDQ2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
