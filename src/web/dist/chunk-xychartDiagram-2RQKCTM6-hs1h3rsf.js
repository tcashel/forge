import {
  selectSvgElement
} from "./chunk-main-f3t3xmmb.js";
import {
  computeDimensionOfText
} from "./chunk-main-wsp4jakw.js";
import {
  cleanAndMerge
} from "./chunk-main-vvfzntzy.js";
import"./chunk-main-ck580f0k.js";
import {
  clear,
  configureSvgSize,
  defaultConfig_default,
  getAccDescription,
  getAccTitle,
  getConfig,
  getDiagramTitle,
  getThemeVariables3,
  sanitizeText,
  setAccDescription,
  setAccTitle,
  setDiagramTitle
} from "./chunk-main-aws590jt.js";
import {
  __name,
  band,
  line_default,
  linear,
  log
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/xychartDiagram-2RQKCTM6.mjs
var parser = function() {
  var o = /* @__PURE__ */ __name(function(k, v, o2, l) {
    for (o2 = o2 || {}, l = k.length;l--; o2[k[l]] = v)
      ;
    return o2;
  }, "o"), $V0 = [1, 10, 12, 14, 16, 18, 19, 21, 23], $V1 = [2, 6], $V2 = [1, 3], $V3 = [1, 5], $V4 = [1, 6], $V5 = [1, 7], $V6 = [1, 5, 10, 12, 14, 16, 18, 19, 21, 23, 34, 35, 36], $V7 = [1, 25], $V8 = [1, 26], $V9 = [1, 28], $Va = [1, 29], $Vb = [1, 30], $Vc = [1, 31], $Vd = [1, 32], $Ve = [1, 33], $Vf = [1, 34], $Vg = [1, 35], $Vh = [1, 36], $Vi = [1, 37], $Vj = [1, 43], $Vk = [1, 42], $Vl = [1, 47], $Vm = [1, 50], $Vn = [1, 10, 12, 14, 16, 18, 19, 21, 23, 34, 35, 36], $Vo = [1, 10, 12, 14, 16, 18, 19, 21, 23, 24, 26, 27, 28, 34, 35, 36], $Vp = [1, 10, 12, 14, 16, 18, 19, 21, 23, 24, 26, 27, 28, 34, 35, 36, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50], $Vq = [1, 64];
  var parser2 = {
    trace: /* @__PURE__ */ __name(function trace() {}, "trace"),
    yy: {},
    symbols_: { error: 2, start: 3, eol: 4, XYCHART: 5, chartConfig: 6, document: 7, CHART_ORIENTATION: 8, statement: 9, title: 10, text: 11, X_AXIS: 12, parseXAxis: 13, Y_AXIS: 14, parseYAxis: 15, LINE: 16, plotData: 17, BAR: 18, acc_title: 19, acc_title_value: 20, acc_descr: 21, acc_descr_value: 22, acc_descr_multiline_value: 23, SQUARE_BRACES_START: 24, commaSeparatedNumbers: 25, SQUARE_BRACES_END: 26, NUMBER_WITH_DECIMAL: 27, COMMA: 28, xAxisData: 29, bandData: 30, ARROW_DELIMITER: 31, commaSeparatedTexts: 32, yAxisData: 33, NEWLINE: 34, SEMI: 35, EOF: 36, alphaNum: 37, STR: 38, MD_STR: 39, alphaNumToken: 40, AMP: 41, NUM: 42, ALPHA: 43, PLUS: 44, EQUALS: 45, MULT: 46, DOT: 47, BRKT: 48, MINUS: 49, UNDERSCORE: 50, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 5: "XYCHART", 8: "CHART_ORIENTATION", 10: "title", 12: "X_AXIS", 14: "Y_AXIS", 16: "LINE", 18: "BAR", 19: "acc_title", 20: "acc_title_value", 21: "acc_descr", 22: "acc_descr_value", 23: "acc_descr_multiline_value", 24: "SQUARE_BRACES_START", 26: "SQUARE_BRACES_END", 27: "NUMBER_WITH_DECIMAL", 28: "COMMA", 31: "ARROW_DELIMITER", 34: "NEWLINE", 35: "SEMI", 36: "EOF", 38: "STR", 39: "MD_STR", 41: "AMP", 42: "NUM", 43: "ALPHA", 44: "PLUS", 45: "EQUALS", 46: "MULT", 47: "DOT", 48: "BRKT", 49: "MINUS", 50: "UNDERSCORE" },
    productions_: [0, [3, 2], [3, 3], [3, 2], [3, 1], [6, 1], [7, 0], [7, 2], [9, 2], [9, 2], [9, 2], [9, 2], [9, 2], [9, 3], [9, 2], [9, 3], [9, 2], [9, 2], [9, 1], [17, 3], [25, 3], [25, 1], [13, 1], [13, 2], [13, 1], [29, 1], [29, 3], [30, 3], [32, 3], [32, 1], [15, 1], [15, 2], [15, 1], [33, 3], [4, 1], [4, 1], [4, 1], [11, 1], [11, 1], [11, 1], [37, 1], [37, 2], [40, 1], [40, 1], [40, 1], [40, 1], [40, 1], [40, 1], [40, 1], [40, 1], [40, 1], [40, 1]],
    performAction: /* @__PURE__ */ __name(function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
      var $0 = $$.length - 1;
      switch (yystate) {
        case 5:
          yy.setOrientation($$[$0]);
          break;
        case 9:
          yy.setDiagramTitle($$[$0].text.trim());
          break;
        case 12:
          yy.setLineData({ text: "", type: "text" }, $$[$0]);
          break;
        case 13:
          yy.setLineData($$[$0 - 1], $$[$0]);
          break;
        case 14:
          yy.setBarData({ text: "", type: "text" }, $$[$0]);
          break;
        case 15:
          yy.setBarData($$[$0 - 1], $$[$0]);
          break;
        case 16:
          this.$ = $$[$0].trim();
          yy.setAccTitle(this.$);
          break;
        case 17:
        case 18:
          this.$ = $$[$0].trim();
          yy.setAccDescription(this.$);
          break;
        case 19:
          this.$ = $$[$0 - 1];
          break;
        case 20:
          this.$ = [Number($$[$0 - 2]), ...$$[$0]];
          break;
        case 21:
          this.$ = [Number($$[$0])];
          break;
        case 22:
          yy.setXAxisTitle($$[$0]);
          break;
        case 23:
          yy.setXAxisTitle($$[$0 - 1]);
          break;
        case 24:
          yy.setXAxisTitle({ type: "text", text: "" });
          break;
        case 25:
          yy.setXAxisBand($$[$0]);
          break;
        case 26:
          yy.setXAxisRangeData(Number($$[$0 - 2]), Number($$[$0]));
          break;
        case 27:
          this.$ = $$[$0 - 1];
          break;
        case 28:
          this.$ = [$$[$0 - 2], ...$$[$0]];
          break;
        case 29:
          this.$ = [$$[$0]];
          break;
        case 30:
          yy.setYAxisTitle($$[$0]);
          break;
        case 31:
          yy.setYAxisTitle($$[$0 - 1]);
          break;
        case 32:
          yy.setYAxisTitle({ type: "text", text: "" });
          break;
        case 33:
          yy.setYAxisRangeData(Number($$[$0 - 2]), Number($$[$0]));
          break;
        case 37:
          this.$ = { text: $$[$0], type: "text" };
          break;
        case 38:
          this.$ = { text: $$[$0], type: "text" };
          break;
        case 39:
          this.$ = { text: $$[$0], type: "markdown" };
          break;
        case 40:
          this.$ = $$[$0];
          break;
        case 41:
          this.$ = $$[$0 - 1] + "" + $$[$0];
          break;
      }
    }, "anonymous"),
    table: [o($V0, $V1, { 3: 1, 4: 2, 7: 4, 5: $V2, 34: $V3, 35: $V4, 36: $V5 }), { 1: [3] }, o($V0, $V1, { 4: 2, 7: 4, 3: 8, 5: $V2, 34: $V3, 35: $V4, 36: $V5 }), o($V0, $V1, { 4: 2, 7: 4, 6: 9, 3: 10, 5: $V2, 8: [1, 11], 34: $V3, 35: $V4, 36: $V5 }), { 1: [2, 4], 9: 12, 10: [1, 13], 12: [1, 14], 14: [1, 15], 16: [1, 16], 18: [1, 17], 19: [1, 18], 21: [1, 19], 23: [1, 20] }, o($V6, [2, 34]), o($V6, [2, 35]), o($V6, [2, 36]), { 1: [2, 1] }, o($V0, $V1, { 4: 2, 7: 4, 3: 21, 5: $V2, 34: $V3, 35: $V4, 36: $V5 }), { 1: [2, 3] }, o($V6, [2, 5]), o($V0, [2, 7], { 4: 22, 34: $V3, 35: $V4, 36: $V5 }), { 11: 23, 37: 24, 38: $V7, 39: $V8, 40: 27, 41: $V9, 42: $Va, 43: $Vb, 44: $Vc, 45: $Vd, 46: $Ve, 47: $Vf, 48: $Vg, 49: $Vh, 50: $Vi }, { 11: 39, 13: 38, 24: $Vj, 27: $Vk, 29: 40, 30: 41, 37: 24, 38: $V7, 39: $V8, 40: 27, 41: $V9, 42: $Va, 43: $Vb, 44: $Vc, 45: $Vd, 46: $Ve, 47: $Vf, 48: $Vg, 49: $Vh, 50: $Vi }, { 11: 45, 15: 44, 27: $Vl, 33: 46, 37: 24, 38: $V7, 39: $V8, 40: 27, 41: $V9, 42: $Va, 43: $Vb, 44: $Vc, 45: $Vd, 46: $Ve, 47: $Vf, 48: $Vg, 49: $Vh, 50: $Vi }, { 11: 49, 17: 48, 24: $Vm, 37: 24, 38: $V7, 39: $V8, 40: 27, 41: $V9, 42: $Va, 43: $Vb, 44: $Vc, 45: $Vd, 46: $Ve, 47: $Vf, 48: $Vg, 49: $Vh, 50: $Vi }, { 11: 52, 17: 51, 24: $Vm, 37: 24, 38: $V7, 39: $V8, 40: 27, 41: $V9, 42: $Va, 43: $Vb, 44: $Vc, 45: $Vd, 46: $Ve, 47: $Vf, 48: $Vg, 49: $Vh, 50: $Vi }, { 20: [1, 53] }, { 22: [1, 54] }, o($Vn, [2, 18]), { 1: [2, 2] }, o($Vn, [2, 8]), o($Vn, [2, 9]), o($Vo, [2, 37], { 40: 55, 41: $V9, 42: $Va, 43: $Vb, 44: $Vc, 45: $Vd, 46: $Ve, 47: $Vf, 48: $Vg, 49: $Vh, 50: $Vi }), o($Vo, [2, 38]), o($Vo, [2, 39]), o($Vp, [2, 40]), o($Vp, [2, 42]), o($Vp, [2, 43]), o($Vp, [2, 44]), o($Vp, [2, 45]), o($Vp, [2, 46]), o($Vp, [2, 47]), o($Vp, [2, 48]), o($Vp, [2, 49]), o($Vp, [2, 50]), o($Vp, [2, 51]), o($Vn, [2, 10]), o($Vn, [2, 22], { 30: 41, 29: 56, 24: $Vj, 27: $Vk }), o($Vn, [2, 24]), o($Vn, [2, 25]), { 31: [1, 57] }, { 11: 59, 32: 58, 37: 24, 38: $V7, 39: $V8, 40: 27, 41: $V9, 42: $Va, 43: $Vb, 44: $Vc, 45: $Vd, 46: $Ve, 47: $Vf, 48: $Vg, 49: $Vh, 50: $Vi }, o($Vn, [2, 11]), o($Vn, [2, 30], { 33: 60, 27: $Vl }), o($Vn, [2, 32]), { 31: [1, 61] }, o($Vn, [2, 12]), { 17: 62, 24: $Vm }, { 25: 63, 27: $Vq }, o($Vn, [2, 14]), { 17: 65, 24: $Vm }, o($Vn, [2, 16]), o($Vn, [2, 17]), o($Vp, [2, 41]), o($Vn, [2, 23]), { 27: [1, 66] }, { 26: [1, 67] }, { 26: [2, 29], 28: [1, 68] }, o($Vn, [2, 31]), { 27: [1, 69] }, o($Vn, [2, 13]), { 26: [1, 70] }, { 26: [2, 21], 28: [1, 71] }, o($Vn, [2, 15]), o($Vn, [2, 26]), o($Vn, [2, 27]), { 11: 59, 32: 72, 37: 24, 38: $V7, 39: $V8, 40: 27, 41: $V9, 42: $Va, 43: $Vb, 44: $Vc, 45: $Vd, 46: $Ve, 47: $Vf, 48: $Vg, 49: $Vh, 50: $Vi }, o($Vn, [2, 33]), o($Vn, [2, 19]), { 25: 73, 27: $Vq }, { 26: [2, 28] }, { 26: [2, 20] }],
    defaultActions: { 8: [2, 1], 10: [2, 3], 21: [2, 2], 72: [2, 28], 73: [2, 20] },
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
            this.popState();
            return 34;
            break;
          case 3:
            this.popState();
            return 34;
            break;
          case 4:
            return 34;
            break;
          case 5:
            break;
          case 6:
            return 10;
            break;
          case 7:
            this.pushState("acc_title");
            return 19;
            break;
          case 8:
            this.popState();
            return "acc_title_value";
            break;
          case 9:
            this.pushState("acc_descr");
            return 21;
            break;
          case 10:
            this.popState();
            return "acc_descr_value";
            break;
          case 11:
            this.pushState("acc_descr_multiline");
            break;
          case 12:
            this.popState();
            break;
          case 13:
            return "acc_descr_multiline_value";
            break;
          case 14:
            return 5;
            break;
          case 15:
            return 5;
            break;
          case 16:
            return 8;
            break;
          case 17:
            this.pushState("axis_data");
            return "X_AXIS";
            break;
          case 18:
            this.pushState("axis_data");
            return "Y_AXIS";
            break;
          case 19:
            this.pushState("axis_band_data");
            return 24;
            break;
          case 20:
            return 31;
            break;
          case 21:
            this.pushState("data");
            return 16;
            break;
          case 22:
            this.pushState("data");
            return 18;
            break;
          case 23:
            this.pushState("data_inner");
            return 24;
            break;
          case 24:
            return 27;
            break;
          case 25:
            this.popState();
            return 26;
            break;
          case 26:
            this.popState();
            break;
          case 27:
            this.pushState("string");
            break;
          case 28:
            this.popState();
            break;
          case 29:
            return "STR";
            break;
          case 30:
            return 24;
            break;
          case 31:
            return 26;
            break;
          case 32:
            return 43;
            break;
          case 33:
            return "COLON";
            break;
          case 34:
            return 44;
            break;
          case 35:
            return 28;
            break;
          case 36:
            return 45;
            break;
          case 37:
            return 46;
            break;
          case 38:
            return 48;
            break;
          case 39:
            return 50;
            break;
          case 40:
            return 47;
            break;
          case 41:
            return 41;
            break;
          case 42:
            return 49;
            break;
          case 43:
            return 42;
            break;
          case 44:
            break;
          case 45:
            return 35;
            break;
          case 46:
            return 36;
            break;
        }
      }, "anonymous"),
      rules: [/^(?:%%(?!\{)[^\n]*)/i, /^(?:[^\}]%%[^\n]*)/i, /^(?:(\r?\n))/i, /^(?:(\r?\n))/i, /^(?:[\n\r]+)/i, /^(?:%%[^\n]*)/i, /^(?:title\b)/i, /^(?:accTitle\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*\{\s*)/i, /^(?:\})/i, /^(?:[^\}]*)/i, /^(?:xychart-beta\b)/i, /^(?:xychart\b)/i, /^(?:(?:vertical|horizontal))/i, /^(?:x-axis\b)/i, /^(?:y-axis\b)/i, /^(?:\[)/i, /^(?:-->)/i, /^(?:line\b)/i, /^(?:bar\b)/i, /^(?:\[)/i, /^(?:[+-]?(?:\d+(?:\.\d+)?|\.\d+))/i, /^(?:\])/i, /^(?:(?:`\)                                    \{ this\.pushState\(md_string\); \}\n<md_string>\(\?:\(\?!`"\)\.\)\+                  \{ return MD_STR; \}\n<md_string>\(\?:`))/i, /^(?:["])/i, /^(?:["])/i, /^(?:[^"]*)/i, /^(?:\[)/i, /^(?:\])/i, /^(?:[A-Za-z]+)/i, /^(?::)/i, /^(?:\+)/i, /^(?:,)/i, /^(?:=)/i, /^(?:\*)/i, /^(?:#)/i, /^(?:[\_])/i, /^(?:\.)/i, /^(?:&)/i, /^(?:-)/i, /^(?:[0-9]+)/i, /^(?:\s+)/i, /^(?:;)/i, /^(?:$)/i],
      conditions: { data_inner: { rules: [0, 1, 4, 5, 6, 7, 9, 11, 14, 15, 16, 17, 18, 21, 22, 24, 25, 26, 27, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46], inclusive: true }, data: { rules: [0, 1, 3, 4, 5, 6, 7, 9, 11, 14, 15, 16, 17, 18, 21, 22, 23, 26, 27, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46], inclusive: true }, axis_band_data: { rules: [0, 1, 4, 5, 6, 7, 9, 11, 14, 15, 16, 17, 18, 21, 22, 25, 26, 27, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46], inclusive: true }, axis_data: { rules: [0, 1, 2, 4, 5, 6, 7, 9, 11, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 26, 27, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46], inclusive: true }, acc_descr_multiline: { rules: [12, 13], inclusive: false }, acc_descr: { rules: [10], inclusive: false }, acc_title: { rules: [8], inclusive: false }, title: { rules: [], inclusive: false }, md_string: { rules: [], inclusive: false }, string: { rules: [28, 29], inclusive: false }, INITIAL: { rules: [0, 1, 4, 5, 6, 7, 9, 11, 14, 15, 16, 17, 18, 21, 22, 26, 27, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46], inclusive: true } }
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
var xychart_default = parser;
function isBarPlot(data) {
  return data.type === "bar";
}
__name(isBarPlot, "isBarPlot");
function isBandAxisData(data) {
  return data.type === "band";
}
__name(isBandAxisData, "isBandAxisData");
function isLinearAxisData(data) {
  return data.type === "linear";
}
__name(isLinearAxisData, "isLinearAxisData");
var TextDimensionCalculatorWithFont = class {
  constructor(parentGroup) {
    this.parentGroup = parentGroup;
  }
  static {
    __name(this, "TextDimensionCalculatorWithFont");
  }
  getMaxDimension(texts, fontSize) {
    if (!this.parentGroup) {
      return {
        width: texts.reduce((acc, cur) => Math.max(cur.length, acc), 0) * fontSize,
        height: fontSize
      };
    }
    const dimension = {
      width: 0,
      height: 0
    };
    const elem = this.parentGroup.append("g").attr("visibility", "hidden").attr("font-size", fontSize);
    for (const t of texts) {
      const bbox = computeDimensionOfText(elem, 1, t);
      const width = bbox ? bbox.width : t.length * fontSize;
      const height = bbox ? bbox.height : fontSize;
      dimension.width = Math.max(dimension.width, width);
      dimension.height = Math.max(dimension.height, height);
    }
    elem.remove();
    return dimension;
  }
};
var BAR_WIDTH_TO_TICK_WIDTH_RATIO = 0.7;
var MAX_OUTER_PADDING_PERCENT_FOR_WRT_LABEL = 0.2;
var BaseAxis = class {
  constructor(axisConfig, title, textDimensionCalculator, axisThemeConfig) {
    this.axisConfig = axisConfig;
    this.title = title;
    this.textDimensionCalculator = textDimensionCalculator;
    this.axisThemeConfig = axisThemeConfig;
    this.boundingRect = { x: 0, y: 0, width: 0, height: 0 };
    this.axisPosition = "left";
    this.showTitle = false;
    this.showLabel = false;
    this.showTick = false;
    this.showAxisLine = false;
    this.outerPadding = 0;
    this.titleTextHeight = 0;
    this.labelTextHeight = 0;
    this.range = [0, 10];
    this.boundingRect = { x: 0, y: 0, width: 0, height: 0 };
    this.axisPosition = "left";
  }
  static {
    __name(this, "BaseAxis");
  }
  setRange(range) {
    this.range = range;
    if (this.axisPosition === "left" || this.axisPosition === "right") {
      this.boundingRect.height = range[1] - range[0];
    } else {
      this.boundingRect.width = range[1] - range[0];
    }
    this.recalculateScale();
  }
  getRange() {
    return [this.range[0] + this.outerPadding, this.range[1] - this.outerPadding];
  }
  setAxisPosition(axisPosition) {
    this.axisPosition = axisPosition;
    this.setRange(this.range);
  }
  getTickDistance() {
    const range = this.getRange();
    return Math.abs(range[0] - range[1]) / this.getTickValues().length;
  }
  getAxisOuterPadding() {
    return this.outerPadding;
  }
  getLabelDimension() {
    return this.textDimensionCalculator.getMaxDimension(this.getTickValues().map((tick) => tick.toString()), this.axisConfig.labelFontSize);
  }
  recalculateOuterPaddingToDrawBar() {
    if (BAR_WIDTH_TO_TICK_WIDTH_RATIO * this.getTickDistance() > this.outerPadding * 2) {
      this.outerPadding = Math.floor(BAR_WIDTH_TO_TICK_WIDTH_RATIO * this.getTickDistance() / 2);
    }
    this.recalculateScale();
  }
  calculateSpaceIfDrawnHorizontally(availableSpace) {
    let availableHeight = availableSpace.height;
    if (this.axisConfig.showAxisLine && availableHeight > this.axisConfig.axisLineWidth) {
      availableHeight -= this.axisConfig.axisLineWidth;
      this.showAxisLine = true;
    }
    if (this.axisConfig.showLabel) {
      const spaceRequired = this.getLabelDimension();
      const maxPadding = MAX_OUTER_PADDING_PERCENT_FOR_WRT_LABEL * availableSpace.width;
      this.outerPadding = Math.min(spaceRequired.width / 2, maxPadding);
      const heightRequired = spaceRequired.height + this.axisConfig.labelPadding * 2;
      this.labelTextHeight = spaceRequired.height;
      if (heightRequired <= availableHeight) {
        availableHeight -= heightRequired;
        this.showLabel = true;
      }
    }
    if (this.axisConfig.showTick && availableHeight >= this.axisConfig.tickLength) {
      this.showTick = true;
      availableHeight -= this.axisConfig.tickLength;
    }
    if (this.axisConfig.showTitle && this.title) {
      const spaceRequired = this.textDimensionCalculator.getMaxDimension([this.title], this.axisConfig.titleFontSize);
      const heightRequired = spaceRequired.height + this.axisConfig.titlePadding * 2;
      this.titleTextHeight = spaceRequired.height;
      if (heightRequired <= availableHeight) {
        availableHeight -= heightRequired;
        this.showTitle = true;
      }
    }
    this.boundingRect.width = availableSpace.width;
    this.boundingRect.height = availableSpace.height - availableHeight;
  }
  calculateSpaceIfDrawnVertical(availableSpace) {
    let availableWidth = availableSpace.width;
    if (this.axisConfig.showAxisLine && availableWidth > this.axisConfig.axisLineWidth) {
      availableWidth -= this.axisConfig.axisLineWidth;
      this.showAxisLine = true;
    }
    if (this.axisConfig.showLabel) {
      const spaceRequired = this.getLabelDimension();
      const maxPadding = MAX_OUTER_PADDING_PERCENT_FOR_WRT_LABEL * availableSpace.height;
      this.outerPadding = Math.min(spaceRequired.height / 2, maxPadding);
      const widthRequired = spaceRequired.width + this.axisConfig.labelPadding * 2;
      if (widthRequired <= availableWidth) {
        availableWidth -= widthRequired;
        this.showLabel = true;
      }
    }
    if (this.axisConfig.showTick && availableWidth >= this.axisConfig.tickLength) {
      this.showTick = true;
      availableWidth -= this.axisConfig.tickLength;
    }
    if (this.axisConfig.showTitle && this.title) {
      const spaceRequired = this.textDimensionCalculator.getMaxDimension([this.title], this.axisConfig.titleFontSize);
      const widthRequired = spaceRequired.height + this.axisConfig.titlePadding * 2;
      this.titleTextHeight = spaceRequired.height;
      if (widthRequired <= availableWidth) {
        availableWidth -= widthRequired;
        this.showTitle = true;
      }
    }
    this.boundingRect.width = availableSpace.width - availableWidth;
    this.boundingRect.height = availableSpace.height;
  }
  calculateSpace(availableSpace) {
    if (this.axisPosition === "left" || this.axisPosition === "right") {
      this.calculateSpaceIfDrawnVertical(availableSpace);
    } else {
      this.calculateSpaceIfDrawnHorizontally(availableSpace);
    }
    this.recalculateScale();
    return {
      width: this.boundingRect.width,
      height: this.boundingRect.height
    };
  }
  setBoundingBoxXY(point) {
    this.boundingRect.x = point.x;
    this.boundingRect.y = point.y;
  }
  getDrawableElementsForLeftAxis() {
    const drawableElement = [];
    if (this.showAxisLine) {
      const x = this.boundingRect.x + this.boundingRect.width - this.axisConfig.axisLineWidth / 2;
      drawableElement.push({
        type: "path",
        groupTexts: ["left-axis", "axisl-line"],
        data: [
          {
            path: `M ${x},${this.boundingRect.y} L ${x},${this.boundingRect.y + this.boundingRect.height} `,
            strokeFill: this.axisThemeConfig.axisLineColor,
            strokeWidth: this.axisConfig.axisLineWidth
          }
        ]
      });
    }
    if (this.showLabel) {
      drawableElement.push({
        type: "text",
        groupTexts: ["left-axis", "label"],
        data: this.getTickValues().map((tick) => ({
          text: tick.toString(),
          x: this.boundingRect.x + this.boundingRect.width - (this.showLabel ? this.axisConfig.labelPadding : 0) - (this.showTick ? this.axisConfig.tickLength : 0) - (this.showAxisLine ? this.axisConfig.axisLineWidth : 0),
          y: this.getScaleValue(tick),
          fill: this.axisThemeConfig.labelColor,
          fontSize: this.axisConfig.labelFontSize,
          rotation: 0,
          verticalPos: "middle",
          horizontalPos: "right"
        }))
      });
    }
    if (this.showTick) {
      const x = this.boundingRect.x + this.boundingRect.width - (this.showAxisLine ? this.axisConfig.axisLineWidth : 0);
      drawableElement.push({
        type: "path",
        groupTexts: ["left-axis", "ticks"],
        data: this.getTickValues().map((tick) => ({
          path: `M ${x},${this.getScaleValue(tick)} L ${x - this.axisConfig.tickLength},${this.getScaleValue(tick)}`,
          strokeFill: this.axisThemeConfig.tickColor,
          strokeWidth: this.axisConfig.tickWidth
        }))
      });
    }
    if (this.showTitle) {
      drawableElement.push({
        type: "text",
        groupTexts: ["left-axis", "title"],
        data: [
          {
            text: this.title,
            x: this.boundingRect.x + this.axisConfig.titlePadding,
            y: this.boundingRect.y + this.boundingRect.height / 2,
            fill: this.axisThemeConfig.titleColor,
            fontSize: this.axisConfig.titleFontSize,
            rotation: 270,
            verticalPos: "top",
            horizontalPos: "center"
          }
        ]
      });
    }
    return drawableElement;
  }
  getDrawableElementsForBottomAxis() {
    const drawableElement = [];
    if (this.showAxisLine) {
      const y = this.boundingRect.y + this.axisConfig.axisLineWidth / 2;
      drawableElement.push({
        type: "path",
        groupTexts: ["bottom-axis", "axis-line"],
        data: [
          {
            path: `M ${this.boundingRect.x},${y} L ${this.boundingRect.x + this.boundingRect.width},${y}`,
            strokeFill: this.axisThemeConfig.axisLineColor,
            strokeWidth: this.axisConfig.axisLineWidth
          }
        ]
      });
    }
    if (this.showLabel) {
      drawableElement.push({
        type: "text",
        groupTexts: ["bottom-axis", "label"],
        data: this.getTickValues().map((tick) => ({
          text: tick.toString(),
          x: this.getScaleValue(tick),
          y: this.boundingRect.y + this.axisConfig.labelPadding + (this.showTick ? this.axisConfig.tickLength : 0) + (this.showAxisLine ? this.axisConfig.axisLineWidth : 0),
          fill: this.axisThemeConfig.labelColor,
          fontSize: this.axisConfig.labelFontSize,
          rotation: 0,
          verticalPos: "top",
          horizontalPos: "center"
        }))
      });
    }
    if (this.showTick) {
      const y = this.boundingRect.y + (this.showAxisLine ? this.axisConfig.axisLineWidth : 0);
      drawableElement.push({
        type: "path",
        groupTexts: ["bottom-axis", "ticks"],
        data: this.getTickValues().map((tick) => ({
          path: `M ${this.getScaleValue(tick)},${y} L ${this.getScaleValue(tick)},${y + this.axisConfig.tickLength}`,
          strokeFill: this.axisThemeConfig.tickColor,
          strokeWidth: this.axisConfig.tickWidth
        }))
      });
    }
    if (this.showTitle) {
      drawableElement.push({
        type: "text",
        groupTexts: ["bottom-axis", "title"],
        data: [
          {
            text: this.title,
            x: this.range[0] + (this.range[1] - this.range[0]) / 2,
            y: this.boundingRect.y + this.boundingRect.height - this.axisConfig.titlePadding - this.titleTextHeight,
            fill: this.axisThemeConfig.titleColor,
            fontSize: this.axisConfig.titleFontSize,
            rotation: 0,
            verticalPos: "top",
            horizontalPos: "center"
          }
        ]
      });
    }
    return drawableElement;
  }
  getDrawableElementsForTopAxis() {
    const drawableElement = [];
    if (this.showAxisLine) {
      const y = this.boundingRect.y + this.boundingRect.height - this.axisConfig.axisLineWidth / 2;
      drawableElement.push({
        type: "path",
        groupTexts: ["top-axis", "axis-line"],
        data: [
          {
            path: `M ${this.boundingRect.x},${y} L ${this.boundingRect.x + this.boundingRect.width},${y}`,
            strokeFill: this.axisThemeConfig.axisLineColor,
            strokeWidth: this.axisConfig.axisLineWidth
          }
        ]
      });
    }
    if (this.showLabel) {
      drawableElement.push({
        type: "text",
        groupTexts: ["top-axis", "label"],
        data: this.getTickValues().map((tick) => ({
          text: tick.toString(),
          x: this.getScaleValue(tick),
          y: this.boundingRect.y + (this.showTitle ? this.titleTextHeight + this.axisConfig.titlePadding * 2 : 0) + this.axisConfig.labelPadding,
          fill: this.axisThemeConfig.labelColor,
          fontSize: this.axisConfig.labelFontSize,
          rotation: 0,
          verticalPos: "top",
          horizontalPos: "center"
        }))
      });
    }
    if (this.showTick) {
      const y = this.boundingRect.y;
      drawableElement.push({
        type: "path",
        groupTexts: ["top-axis", "ticks"],
        data: this.getTickValues().map((tick) => ({
          path: `M ${this.getScaleValue(tick)},${y + this.boundingRect.height - (this.showAxisLine ? this.axisConfig.axisLineWidth : 0)} L ${this.getScaleValue(tick)},${y + this.boundingRect.height - this.axisConfig.tickLength - (this.showAxisLine ? this.axisConfig.axisLineWidth : 0)}`,
          strokeFill: this.axisThemeConfig.tickColor,
          strokeWidth: this.axisConfig.tickWidth
        }))
      });
    }
    if (this.showTitle) {
      drawableElement.push({
        type: "text",
        groupTexts: ["top-axis", "title"],
        data: [
          {
            text: this.title,
            x: this.boundingRect.x + this.boundingRect.width / 2,
            y: this.boundingRect.y + this.axisConfig.titlePadding,
            fill: this.axisThemeConfig.titleColor,
            fontSize: this.axisConfig.titleFontSize,
            rotation: 0,
            verticalPos: "top",
            horizontalPos: "center"
          }
        ]
      });
    }
    return drawableElement;
  }
  getDrawableElements() {
    if (this.axisPosition === "left") {
      return this.getDrawableElementsForLeftAxis();
    }
    if (this.axisPosition === "right") {
      throw Error("Drawing of right axis is not implemented");
    }
    if (this.axisPosition === "bottom") {
      return this.getDrawableElementsForBottomAxis();
    }
    if (this.axisPosition === "top") {
      return this.getDrawableElementsForTopAxis();
    }
    return [];
  }
};
var BandAxis = class extends BaseAxis {
  static {
    __name(this, "BandAxis");
  }
  constructor(axisConfig, axisThemeConfig, categories, title, textDimensionCalculator) {
    super(axisConfig, title, textDimensionCalculator, axisThemeConfig);
    this.categories = categories;
    this.scale = band().domain(this.categories).range(this.getRange());
  }
  setRange(range) {
    super.setRange(range);
  }
  recalculateScale() {
    this.scale = band().domain(this.categories).range(this.getRange()).paddingInner(1).paddingOuter(0).align(0.5);
    log.trace("BandAxis axis final categories, range: ", this.categories, this.getRange());
  }
  getTickValues() {
    return this.categories;
  }
  getScaleValue(value) {
    return this.scale(value) ?? this.getRange()[0];
  }
};
var LinearAxis = class extends BaseAxis {
  static {
    __name(this, "LinearAxis");
  }
  constructor(axisConfig, axisThemeConfig, domain, title, textDimensionCalculator) {
    super(axisConfig, title, textDimensionCalculator, axisThemeConfig);
    this.domain = domain;
    this.scale = linear().domain(this.domain).range(this.getRange());
  }
  getTickValues() {
    return this.scale.ticks();
  }
  recalculateScale() {
    const domain = [...this.domain];
    if (this.axisPosition === "left") {
      domain.reverse();
    }
    this.scale = linear().domain(domain).range(this.getRange());
  }
  getScaleValue(value) {
    return this.scale(value);
  }
};
function getAxis(data, axisConfig, axisThemeConfig, tmpSVGGroup2) {
  const textDimensionCalculator = new TextDimensionCalculatorWithFont(tmpSVGGroup2);
  if (isBandAxisData(data)) {
    return new BandAxis(axisConfig, axisThemeConfig, data.categories, data.title, textDimensionCalculator);
  }
  return new LinearAxis(axisConfig, axisThemeConfig, [data.min, data.max], data.title, textDimensionCalculator);
}
__name(getAxis, "getAxis");
var ChartTitle = class {
  constructor(textDimensionCalculator, chartConfig, chartData, chartThemeConfig) {
    this.textDimensionCalculator = textDimensionCalculator;
    this.chartConfig = chartConfig;
    this.chartData = chartData;
    this.chartThemeConfig = chartThemeConfig;
    this.boundingRect = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
    this.showChartTitle = false;
  }
  static {
    __name(this, "ChartTitle");
  }
  setBoundingBoxXY(point) {
    this.boundingRect.x = point.x;
    this.boundingRect.y = point.y;
  }
  calculateSpace(availableSpace) {
    const titleDimension = this.textDimensionCalculator.getMaxDimension([this.chartData.title], this.chartConfig.titleFontSize);
    const widthRequired = Math.max(titleDimension.width, availableSpace.width);
    const heightRequired = titleDimension.height + 2 * this.chartConfig.titlePadding;
    if (titleDimension.width <= widthRequired && titleDimension.height <= heightRequired && this.chartConfig.showTitle && this.chartData.title) {
      this.boundingRect.width = widthRequired;
      this.boundingRect.height = heightRequired;
      this.showChartTitle = true;
    }
    return {
      width: this.boundingRect.width,
      height: this.boundingRect.height
    };
  }
  getDrawableElements() {
    const drawableElem = [];
    if (this.showChartTitle) {
      drawableElem.push({
        groupTexts: ["chart-title"],
        type: "text",
        data: [
          {
            fontSize: this.chartConfig.titleFontSize,
            text: this.chartData.title,
            verticalPos: "middle",
            horizontalPos: "center",
            x: this.boundingRect.x + this.boundingRect.width / 2,
            y: this.boundingRect.y + this.boundingRect.height / 2,
            fill: this.chartThemeConfig.titleColor,
            rotation: 0
          }
        ]
      });
    }
    return drawableElem;
  }
};
function getChartTitleComponent(chartConfig, chartData, chartThemeConfig, tmpSVGGroup2) {
  const textDimensionCalculator = new TextDimensionCalculatorWithFont(tmpSVGGroup2);
  return new ChartTitle(textDimensionCalculator, chartConfig, chartData, chartThemeConfig);
}
__name(getChartTitleComponent, "getChartTitleComponent");
var LinePlot = class {
  constructor(plotData, xAxis, yAxis, orientation, plotIndex2) {
    this.plotData = plotData;
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.orientation = orientation;
    this.plotIndex = plotIndex2;
  }
  static {
    __name(this, "LinePlot");
  }
  getDrawableElement() {
    const finalData = this.plotData.data.map((d) => [
      this.xAxis.getScaleValue(d[0]),
      this.yAxis.getScaleValue(d[1])
    ]);
    let path;
    if (this.orientation === "horizontal") {
      path = line_default().y((d) => d[0]).x((d) => d[1])(finalData);
    } else {
      path = line_default().x((d) => d[0]).y((d) => d[1])(finalData);
    }
    if (!path) {
      return [];
    }
    return [
      {
        groupTexts: ["plot", `line-plot-${this.plotIndex}`],
        type: "path",
        data: [
          {
            path,
            strokeFill: this.plotData.strokeFill,
            strokeWidth: this.plotData.strokeWidth
          }
        ]
      }
    ];
  }
};
var BarPlot = class {
  constructor(barData, boundingRect, xAxis, yAxis, orientation, plotIndex2) {
    this.barData = barData;
    this.boundingRect = boundingRect;
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.orientation = orientation;
    this.plotIndex = plotIndex2;
  }
  static {
    __name(this, "BarPlot");
  }
  getDrawableElement() {
    const finalData = this.barData.data.map((d) => [
      this.xAxis.getScaleValue(d[0]),
      this.yAxis.getScaleValue(d[1])
    ]);
    const barPaddingPercent = 0.05;
    const barWidth = Math.min(this.xAxis.getAxisOuterPadding() * 2, this.xAxis.getTickDistance()) * (1 - barPaddingPercent);
    const barWidthHalf = barWidth / 2;
    if (this.orientation === "horizontal") {
      return [
        {
          groupTexts: ["plot", `bar-plot-${this.plotIndex}`],
          type: "rect",
          data: finalData.map((data) => ({
            x: this.boundingRect.x,
            y: data[0] - barWidthHalf,
            height: barWidth,
            width: data[1] - this.boundingRect.x,
            fill: this.barData.fill,
            strokeWidth: 0,
            strokeFill: this.barData.fill
          }))
        }
      ];
    }
    return [
      {
        groupTexts: ["plot", `bar-plot-${this.plotIndex}`],
        type: "rect",
        data: finalData.map((data) => ({
          x: data[0] - barWidthHalf,
          y: data[1],
          width: barWidth,
          height: this.boundingRect.y + this.boundingRect.height - data[1],
          fill: this.barData.fill,
          strokeWidth: 0,
          strokeFill: this.barData.fill
        }))
      }
    ];
  }
};
var BasePlot = class {
  constructor(chartConfig, chartData, chartThemeConfig) {
    this.chartConfig = chartConfig;
    this.chartData = chartData;
    this.chartThemeConfig = chartThemeConfig;
    this.boundingRect = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };
  }
  static {
    __name(this, "BasePlot");
  }
  setAxes(xAxis, yAxis) {
    this.xAxis = xAxis;
    this.yAxis = yAxis;
  }
  setBoundingBoxXY(point) {
    this.boundingRect.x = point.x;
    this.boundingRect.y = point.y;
  }
  calculateSpace(availableSpace) {
    this.boundingRect.width = availableSpace.width;
    this.boundingRect.height = availableSpace.height;
    return {
      width: this.boundingRect.width,
      height: this.boundingRect.height
    };
  }
  getDrawableElements() {
    if (!(this.xAxis && this.yAxis)) {
      throw Error("Axes must be passed to render Plots");
    }
    const drawableElem = [];
    for (const [i, plot] of this.chartData.plots.entries()) {
      switch (plot.type) {
        case "line":
          {
            const linePlot = new LinePlot(plot, this.xAxis, this.yAxis, this.chartConfig.chartOrientation, i);
            drawableElem.push(...linePlot.getDrawableElement());
          }
          break;
        case "bar":
          {
            const barPlot = new BarPlot(plot, this.boundingRect, this.xAxis, this.yAxis, this.chartConfig.chartOrientation, i);
            drawableElem.push(...barPlot.getDrawableElement());
          }
          break;
      }
    }
    return drawableElem;
  }
};
function getPlotComponent(chartConfig, chartData, chartThemeConfig) {
  return new BasePlot(chartConfig, chartData, chartThemeConfig);
}
__name(getPlotComponent, "getPlotComponent");
var Orchestrator = class {
  constructor(chartConfig, chartData, chartThemeConfig, tmpSVGGroup2) {
    this.chartConfig = chartConfig;
    this.chartData = chartData;
    this.componentStore = {
      title: getChartTitleComponent(chartConfig, chartData, chartThemeConfig, tmpSVGGroup2),
      plot: getPlotComponent(chartConfig, chartData, chartThemeConfig),
      xAxis: getAxis(chartData.xAxis, chartConfig.xAxis, {
        titleColor: chartThemeConfig.xAxisTitleColor,
        labelColor: chartThemeConfig.xAxisLabelColor,
        tickColor: chartThemeConfig.xAxisTickColor,
        axisLineColor: chartThemeConfig.xAxisLineColor
      }, tmpSVGGroup2),
      yAxis: getAxis(chartData.yAxis, chartConfig.yAxis, {
        titleColor: chartThemeConfig.yAxisTitleColor,
        labelColor: chartThemeConfig.yAxisLabelColor,
        tickColor: chartThemeConfig.yAxisTickColor,
        axisLineColor: chartThemeConfig.yAxisLineColor
      }, tmpSVGGroup2)
    };
  }
  static {
    __name(this, "Orchestrator");
  }
  calculateVerticalSpace() {
    let availableWidth = this.chartConfig.width;
    let availableHeight = this.chartConfig.height;
    let plotX = 0;
    let plotY = 0;
    let chartWidth = Math.floor(availableWidth * this.chartConfig.plotReservedSpacePercent / 100);
    let chartHeight = Math.floor(availableHeight * this.chartConfig.plotReservedSpacePercent / 100);
    let spaceUsed = this.componentStore.plot.calculateSpace({
      width: chartWidth,
      height: chartHeight
    });
    availableWidth -= spaceUsed.width;
    availableHeight -= spaceUsed.height;
    spaceUsed = this.componentStore.title.calculateSpace({
      width: this.chartConfig.width,
      height: availableHeight
    });
    plotY = spaceUsed.height;
    availableHeight -= spaceUsed.height;
    this.componentStore.xAxis.setAxisPosition("bottom");
    spaceUsed = this.componentStore.xAxis.calculateSpace({
      width: availableWidth,
      height: availableHeight
    });
    availableHeight -= spaceUsed.height;
    this.componentStore.yAxis.setAxisPosition("left");
    spaceUsed = this.componentStore.yAxis.calculateSpace({
      width: availableWidth,
      height: availableHeight
    });
    plotX = spaceUsed.width;
    availableWidth -= spaceUsed.width;
    if (availableWidth > 0) {
      chartWidth += availableWidth;
      availableWidth = 0;
    }
    if (availableHeight > 0) {
      chartHeight += availableHeight;
      availableHeight = 0;
    }
    this.componentStore.plot.calculateSpace({
      width: chartWidth,
      height: chartHeight
    });
    this.componentStore.plot.setBoundingBoxXY({ x: plotX, y: plotY });
    this.componentStore.xAxis.setRange([plotX, plotX + chartWidth]);
    this.componentStore.xAxis.setBoundingBoxXY({ x: plotX, y: plotY + chartHeight });
    this.componentStore.yAxis.setRange([plotY, plotY + chartHeight]);
    this.componentStore.yAxis.setBoundingBoxXY({ x: 0, y: plotY });
    if (this.chartData.plots.some((p) => isBarPlot(p))) {
      this.componentStore.xAxis.recalculateOuterPaddingToDrawBar();
    }
  }
  calculateHorizontalSpace() {
    let availableWidth = this.chartConfig.width;
    let availableHeight = this.chartConfig.height;
    let titleYEnd = 0;
    let plotX = 0;
    let plotY = 0;
    let chartWidth = Math.floor(availableWidth * this.chartConfig.plotReservedSpacePercent / 100);
    let chartHeight = Math.floor(availableHeight * this.chartConfig.plotReservedSpacePercent / 100);
    let spaceUsed = this.componentStore.plot.calculateSpace({
      width: chartWidth,
      height: chartHeight
    });
    availableWidth -= spaceUsed.width;
    availableHeight -= spaceUsed.height;
    spaceUsed = this.componentStore.title.calculateSpace({
      width: this.chartConfig.width,
      height: availableHeight
    });
    titleYEnd = spaceUsed.height;
    availableHeight -= spaceUsed.height;
    this.componentStore.xAxis.setAxisPosition("left");
    spaceUsed = this.componentStore.xAxis.calculateSpace({
      width: availableWidth,
      height: availableHeight
    });
    availableWidth -= spaceUsed.width;
    plotX = spaceUsed.width;
    this.componentStore.yAxis.setAxisPosition("top");
    spaceUsed = this.componentStore.yAxis.calculateSpace({
      width: availableWidth,
      height: availableHeight
    });
    availableHeight -= spaceUsed.height;
    plotY = titleYEnd + spaceUsed.height;
    if (availableWidth > 0) {
      chartWidth += availableWidth;
      availableWidth = 0;
    }
    if (availableHeight > 0) {
      chartHeight += availableHeight;
      availableHeight = 0;
    }
    this.componentStore.plot.calculateSpace({
      width: chartWidth,
      height: chartHeight
    });
    this.componentStore.plot.setBoundingBoxXY({ x: plotX, y: plotY });
    this.componentStore.yAxis.setRange([plotX, plotX + chartWidth]);
    this.componentStore.yAxis.setBoundingBoxXY({ x: plotX, y: titleYEnd });
    this.componentStore.xAxis.setRange([plotY, plotY + chartHeight]);
    this.componentStore.xAxis.setBoundingBoxXY({ x: 0, y: plotY });
    if (this.chartData.plots.some((p) => isBarPlot(p))) {
      this.componentStore.xAxis.recalculateOuterPaddingToDrawBar();
    }
  }
  calculateSpace() {
    if (this.chartConfig.chartOrientation === "horizontal") {
      this.calculateHorizontalSpace();
    } else {
      this.calculateVerticalSpace();
    }
  }
  getDrawableElement() {
    this.calculateSpace();
    const drawableElem = [];
    this.componentStore.plot.setAxes(this.componentStore.xAxis, this.componentStore.yAxis);
    for (const component of Object.values(this.componentStore)) {
      drawableElem.push(...component.getDrawableElements());
    }
    return drawableElem;
  }
};
var XYChartBuilder = class {
  static {
    __name(this, "XYChartBuilder");
  }
  static build(config, chartData, chartThemeConfig, tmpSVGGroup2) {
    const orchestrator = new Orchestrator(config, chartData, chartThemeConfig, tmpSVGGroup2);
    return orchestrator.getDrawableElement();
  }
};
var plotIndex = 0;
var tmpSVGGroup;
var xyChartConfig = getChartDefaultConfig();
var xyChartThemeConfig = getChartDefaultThemeConfig();
var xyChartData = getChartDefaultData();
var plotColorPalette = xyChartThemeConfig.plotColorPalette.split(",").map((color) => color.trim());
var hasSetXAxis = false;
var hasSetYAxis = false;
function getChartDefaultThemeConfig() {
  const defaultThemeVariables = getThemeVariables3();
  const config = getConfig();
  return cleanAndMerge(defaultThemeVariables.xyChart, config.themeVariables.xyChart);
}
__name(getChartDefaultThemeConfig, "getChartDefaultThemeConfig");
function getChartDefaultConfig() {
  const config = getConfig();
  return cleanAndMerge(defaultConfig_default.xyChart, config.xyChart);
}
__name(getChartDefaultConfig, "getChartDefaultConfig");
function getChartDefaultData() {
  return {
    yAxis: {
      type: "linear",
      title: "",
      min: Infinity,
      max: -Infinity
    },
    xAxis: {
      type: "band",
      title: "",
      categories: []
    },
    title: "",
    plots: []
  };
}
__name(getChartDefaultData, "getChartDefaultData");
function textSanitizer(text) {
  const config = getConfig();
  return sanitizeText(text.trim(), config);
}
__name(textSanitizer, "textSanitizer");
function setTmpSVGG(SVGG) {
  tmpSVGGroup = SVGG;
}
__name(setTmpSVGG, "setTmpSVGG");
function setOrientation(orientation) {
  if (orientation === "horizontal") {
    xyChartConfig.chartOrientation = "horizontal";
  } else {
    xyChartConfig.chartOrientation = "vertical";
  }
}
__name(setOrientation, "setOrientation");
function setXAxisTitle(title) {
  xyChartData.xAxis.title = textSanitizer(title.text);
}
__name(setXAxisTitle, "setXAxisTitle");
function setXAxisRangeData(min, max) {
  xyChartData.xAxis = { type: "linear", title: xyChartData.xAxis.title, min, max };
  hasSetXAxis = true;
}
__name(setXAxisRangeData, "setXAxisRangeData");
function setXAxisBand(categories) {
  xyChartData.xAxis = {
    type: "band",
    title: xyChartData.xAxis.title,
    categories: categories.map((c) => textSanitizer(c.text))
  };
  hasSetXAxis = true;
}
__name(setXAxisBand, "setXAxisBand");
function setYAxisTitle(title) {
  xyChartData.yAxis.title = textSanitizer(title.text);
}
__name(setYAxisTitle, "setYAxisTitle");
function setYAxisRangeData(min, max) {
  xyChartData.yAxis = { type: "linear", title: xyChartData.yAxis.title, min, max };
  hasSetYAxis = true;
}
__name(setYAxisRangeData, "setYAxisRangeData");
function setYAxisRangeFromPlotData(data) {
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const prevMinValue = isLinearAxisData(xyChartData.yAxis) ? xyChartData.yAxis.min : Infinity;
  const prevMaxValue = isLinearAxisData(xyChartData.yAxis) ? xyChartData.yAxis.max : -Infinity;
  xyChartData.yAxis = {
    type: "linear",
    title: xyChartData.yAxis.title,
    min: Math.min(prevMinValue, minValue),
    max: Math.max(prevMaxValue, maxValue)
  };
}
__name(setYAxisRangeFromPlotData, "setYAxisRangeFromPlotData");
function transformDataWithoutCategory(data) {
  let retData = [];
  if (data.length === 0) {
    return retData;
  }
  if (!hasSetXAxis) {
    const prevMinValue = isLinearAxisData(xyChartData.xAxis) ? xyChartData.xAxis.min : Infinity;
    const prevMaxValue = isLinearAxisData(xyChartData.xAxis) ? xyChartData.xAxis.max : -Infinity;
    setXAxisRangeData(Math.min(prevMinValue, 1), Math.max(prevMaxValue, data.length));
  }
  if (!hasSetYAxis) {
    setYAxisRangeFromPlotData(data);
  }
  if (isBandAxisData(xyChartData.xAxis)) {
    retData = xyChartData.xAxis.categories.map((c, i) => [c, data[i]]);
  }
  if (isLinearAxisData(xyChartData.xAxis)) {
    const min = xyChartData.xAxis.min;
    const max = xyChartData.xAxis.max;
    const step = (max - min) / (data.length - 1);
    const categories = [];
    for (let i = min;i <= max; i += step) {
      categories.push(`${i}`);
    }
    retData = categories.map((c, i) => [c, data[i]]);
  }
  return retData;
}
__name(transformDataWithoutCategory, "transformDataWithoutCategory");
function getPlotColorFromPalette(plotIndex2) {
  return plotColorPalette[plotIndex2 === 0 ? 0 : plotIndex2 % plotColorPalette.length];
}
__name(getPlotColorFromPalette, "getPlotColorFromPalette");
function setLineData(title, data) {
  const plotData = transformDataWithoutCategory(data);
  xyChartData.plots.push({
    type: "line",
    strokeFill: getPlotColorFromPalette(plotIndex),
    strokeWidth: 2,
    data: plotData
  });
  plotIndex++;
}
__name(setLineData, "setLineData");
function setBarData(title, data) {
  const plotData = transformDataWithoutCategory(data);
  xyChartData.plots.push({
    type: "bar",
    fill: getPlotColorFromPalette(plotIndex),
    data: plotData
  });
  plotIndex++;
}
__name(setBarData, "setBarData");
function getDrawableElem() {
  if (xyChartData.plots.length === 0) {
    throw Error("No Plot to render, please provide a plot with some data");
  }
  xyChartData.title = getDiagramTitle();
  return XYChartBuilder.build(xyChartConfig, xyChartData, xyChartThemeConfig, tmpSVGGroup);
}
__name(getDrawableElem, "getDrawableElem");
function getChartThemeConfig() {
  return xyChartThemeConfig;
}
__name(getChartThemeConfig, "getChartThemeConfig");
function getChartConfig() {
  return xyChartConfig;
}
__name(getChartConfig, "getChartConfig");
function getXYChartData() {
  return xyChartData;
}
__name(getXYChartData, "getXYChartData");
var clear2 = /* @__PURE__ */ __name(function() {
  clear();
  plotIndex = 0;
  xyChartConfig = getChartDefaultConfig();
  xyChartData = getChartDefaultData();
  xyChartThemeConfig = getChartDefaultThemeConfig();
  plotColorPalette = xyChartThemeConfig.plotColorPalette.split(",").map((color) => color.trim());
  hasSetXAxis = false;
  hasSetYAxis = false;
}, "clear");
var xychartDb_default = {
  getDrawableElem,
  clear: clear2,
  setAccTitle,
  getAccTitle,
  setDiagramTitle,
  getDiagramTitle,
  getAccDescription,
  setAccDescription,
  setOrientation,
  setXAxisTitle,
  setXAxisRangeData,
  setXAxisBand,
  setYAxisTitle,
  setYAxisRangeData,
  setLineData,
  setBarData,
  setTmpSVGG,
  getChartThemeConfig,
  getChartConfig,
  getXYChartData
};
var draw = /* @__PURE__ */ __name((txt, id, _version, diagObj) => {
  const db = diagObj.db;
  const themeConfig = db.getChartThemeConfig();
  const chartConfig = db.getChartConfig();
  const labelData = db.getXYChartData().plots[0].data.map((data) => data[1]);
  function getDominantBaseLine(horizontalPos) {
    return horizontalPos === "top" ? "text-before-edge" : "middle";
  }
  __name(getDominantBaseLine, "getDominantBaseLine");
  function getTextAnchor(verticalPos) {
    return verticalPos === "left" ? "start" : verticalPos === "right" ? "end" : "middle";
  }
  __name(getTextAnchor, "getTextAnchor");
  function getTextTransformation(data) {
    return `translate(${data.x}, ${data.y}) rotate(${data.rotation || 0})`;
  }
  __name(getTextTransformation, "getTextTransformation");
  log.debug(`Rendering xychart chart
` + txt);
  const svg = selectSvgElement(id);
  const group = svg.append("g").attr("class", "main");
  const background = group.append("rect").attr("width", chartConfig.width).attr("height", chartConfig.height).attr("class", "background");
  configureSvgSize(svg, chartConfig.height, chartConfig.width, true);
  svg.attr("viewBox", `0 0 ${chartConfig.width} ${chartConfig.height}`);
  background.attr("fill", themeConfig.backgroundColor);
  db.setTmpSVGG(svg.append("g").attr("class", "mermaid-tmp-group"));
  const shapes = db.getDrawableElem();
  const groups = {};
  function getGroup(gList) {
    let elem = group;
    let prefix = "";
    for (const [i] of gList.entries()) {
      let parent = group;
      if (i > 0 && groups[prefix]) {
        parent = groups[prefix];
      }
      prefix += gList[i];
      elem = groups[prefix];
      if (!elem) {
        elem = groups[prefix] = parent.append("g").attr("class", gList[i]);
      }
    }
    return elem;
  }
  __name(getGroup, "getGroup");
  for (const shape of shapes) {
    if (shape.data.length === 0) {
      continue;
    }
    const shapeGroup = getGroup(shape.groupTexts);
    switch (shape.type) {
      case "rect":
        shapeGroup.selectAll("rect").data(shape.data).enter().append("rect").attr("x", (data) => data.x).attr("y", (data) => data.y).attr("width", (data) => data.width).attr("height", (data) => data.height).attr("fill", (data) => data.fill).attr("stroke", (data) => data.strokeFill).attr("stroke-width", (data) => data.strokeWidth);
        if (chartConfig.showDataLabel) {
          const showDataLabelOutsideBar = chartConfig.showDataLabelOutsideBar;
          if (chartConfig.chartOrientation === "horizontal") {
            let fitsHorizontally2 = function(item, fontSize) {
              const { data, label } = item;
              const textWidth = fontSize * label.length * charWidthFactor;
              return textWidth <= data.width - rightMargin;
            };
            var fitsHorizontally = fitsHorizontally2;
            __name(fitsHorizontally2, "fitsHorizontally");
            const charWidthFactor = 0.7;
            const rightMargin = 10;
            const validItems = shape.data.map((d, i) => ({ data: d, label: labelData[i].toString() })).filter((item) => item.data.width > 0 && item.data.height > 0);
            const candidateFontSizes = validItems.map((item) => {
              const { data } = item;
              let fontSize = data.height * 0.7;
              while (!fitsHorizontally2(item, fontSize) && fontSize > 0) {
                fontSize -= 1;
              }
              return fontSize;
            });
            const uniformFontSize = Math.floor(Math.min(...candidateFontSizes));
            const determineLabelXPosition = /* @__PURE__ */ __name((item) => {
              if (showDataLabelOutsideBar) {
                return item.data.x + item.data.width + rightMargin;
              } else {
                return item.data.x + item.data.width - rightMargin;
              }
            }, "determineLabelXPosition");
            shapeGroup.selectAll("text").data(validItems).enter().append("text").attr("x", determineLabelXPosition).attr("y", (item) => item.data.y + item.data.height / 2).attr("text-anchor", showDataLabelOutsideBar ? "start" : "end").attr("dominant-baseline", "middle").attr("fill", themeConfig.dataLabelColor).attr("font-size", `${uniformFontSize}px`).text((item) => item.label);
          } else {
            let fitsInBar2 = function(item, fontSize, yOffset2) {
              const { data, label } = item;
              const charWidthFactor = 0.7;
              const textWidth = fontSize * label.length * charWidthFactor;
              const centerX = data.x + data.width / 2;
              const leftEdge = centerX - textWidth / 2;
              const rightEdge = centerX + textWidth / 2;
              const horizontalFits = leftEdge >= data.x && rightEdge <= data.x + data.width;
              const verticalFits = data.y + yOffset2 + fontSize <= data.y + data.height;
              return horizontalFits && verticalFits;
            };
            var fitsInBar = fitsInBar2;
            __name(fitsInBar2, "fitsInBar");
            const yOffset = 10;
            const validItems = shape.data.map((d, i) => ({ data: d, label: labelData[i].toString() })).filter((item) => item.data.width > 0 && item.data.height > 0);
            const candidateFontSizes = validItems.map((item) => {
              const { data, label } = item;
              let fontSize = data.width / (label.length * 0.7);
              while (!fitsInBar2(item, fontSize, yOffset) && fontSize > 0) {
                fontSize -= 1;
              }
              return fontSize;
            });
            const uniformFontSize = Math.floor(Math.min(...candidateFontSizes));
            const determineLabelYPosition = /* @__PURE__ */ __name((item) => {
              if (showDataLabelOutsideBar) {
                return item.data.y - yOffset;
              } else {
                return item.data.y + yOffset;
              }
            }, "determineLabelYPosition");
            shapeGroup.selectAll("text").data(validItems).enter().append("text").attr("x", (item) => item.data.x + item.data.width / 2).attr("y", determineLabelYPosition).attr("text-anchor", "middle").attr("dominant-baseline", showDataLabelOutsideBar ? "auto" : "hanging").attr("fill", themeConfig.dataLabelColor).attr("font-size", `${uniformFontSize}px`).text((item) => item.label);
          }
        }
        break;
      case "text":
        shapeGroup.selectAll("text").data(shape.data).enter().append("text").attr("x", 0).attr("y", 0).attr("fill", (data) => data.fill).attr("font-size", (data) => data.fontSize).attr("dominant-baseline", (data) => getDominantBaseLine(data.verticalPos)).attr("text-anchor", (data) => getTextAnchor(data.horizontalPos)).attr("transform", (data) => getTextTransformation(data)).text((data) => data.text);
        break;
      case "path":
        shapeGroup.selectAll("path").data(shape.data).enter().append("path").attr("d", (data) => data.path).attr("fill", (data) => data.fill ? data.fill : "none").attr("stroke", (data) => data.strokeFill).attr("stroke-width", (data) => data.strokeWidth);
        break;
    }
  }
}, "draw");
var xychartRenderer_default = {
  draw
};
var diagram = {
  parser: xychart_default,
  db: xychartDb_default,
  renderer: xychartRenderer_default
};
export {
  diagram
};

//# debugId=265E69B15396F6C964756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL3h5Y2hhcnREaWFncmFtLTJSUUtDVE02Lm1qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJpbXBvcnQge1xuICBzZWxlY3RTdmdFbGVtZW50XG59IGZyb20gXCIuL2NodW5rLVdVNU1ZRzJHLm1qc1wiO1xuaW1wb3J0IHtcbiAgY29tcHV0ZURpbWVuc2lvbk9mVGV4dFxufSBmcm9tIFwiLi9jaHVuay1PNUNCRUw2Ty5tanNcIjtcbmltcG9ydCB7XG4gIGNsZWFuQW5kTWVyZ2Vcbn0gZnJvbSBcIi4vY2h1bmstNVpRWUhYS1UubWpzXCI7XG5pbXBvcnQge1xuICBjbGVhcixcbiAgY29uZmlndXJlU3ZnU2l6ZSxcbiAgZGVmYXVsdENvbmZpZ19kZWZhdWx0LFxuICBnZXRBY2NEZXNjcmlwdGlvbixcbiAgZ2V0QWNjVGl0bGUsXG4gIGdldENvbmZpZyxcbiAgZ2V0RGlhZ3JhbVRpdGxlLFxuICBnZXRUaGVtZVZhcmlhYmxlcyxcbiAgc2FuaXRpemVUZXh0LFxuICBzZXRBY2NEZXNjcmlwdGlvbixcbiAgc2V0QWNjVGl0bGUsXG4gIHNldERpYWdyYW1UaXRsZVxufSBmcm9tIFwiLi9jaHVuay1DU0NJSEs3US5tanNcIjtcbmltcG9ydCB7XG4gIF9fbmFtZSxcbiAgbG9nXG59IGZyb20gXCIuL2NodW5rLUFHSFJCNEpGLm1qc1wiO1xuXG4vLyBzcmMvZGlhZ3JhbXMveHljaGFydC9wYXJzZXIveHljaGFydC5qaXNvblxudmFyIHBhcnNlciA9IChmdW5jdGlvbigpIHtcbiAgdmFyIG8gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGssIHYsIG8yLCBsKSB7XG4gICAgZm9yIChvMiA9IG8yIHx8IHt9LCBsID0gay5sZW5ndGg7IGwtLTsgbzJba1tsXV0gPSB2KSA7XG4gICAgcmV0dXJuIG8yO1xuICB9LCBcIm9cIiksICRWMCA9IFsxLCAxMCwgMTIsIDE0LCAxNiwgMTgsIDE5LCAyMSwgMjNdLCAkVjEgPSBbMiwgNl0sICRWMiA9IFsxLCAzXSwgJFYzID0gWzEsIDVdLCAkVjQgPSBbMSwgNl0sICRWNSA9IFsxLCA3XSwgJFY2ID0gWzEsIDUsIDEwLCAxMiwgMTQsIDE2LCAxOCwgMTksIDIxLCAyMywgMzQsIDM1LCAzNl0sICRWNyA9IFsxLCAyNV0sICRWOCA9IFsxLCAyNl0sICRWOSA9IFsxLCAyOF0sICRWYSA9IFsxLCAyOV0sICRWYiA9IFsxLCAzMF0sICRWYyA9IFsxLCAzMV0sICRWZCA9IFsxLCAzMl0sICRWZSA9IFsxLCAzM10sICRWZiA9IFsxLCAzNF0sICRWZyA9IFsxLCAzNV0sICRWaCA9IFsxLCAzNl0sICRWaSA9IFsxLCAzN10sICRWaiA9IFsxLCA0M10sICRWayA9IFsxLCA0Ml0sICRWbCA9IFsxLCA0N10sICRWbSA9IFsxLCA1MF0sICRWbiA9IFsxLCAxMCwgMTIsIDE0LCAxNiwgMTgsIDE5LCAyMSwgMjMsIDM0LCAzNSwgMzZdLCAkVm8gPSBbMSwgMTAsIDEyLCAxNCwgMTYsIDE4LCAxOSwgMjEsIDIzLCAyNCwgMjYsIDI3LCAyOCwgMzQsIDM1LCAzNl0sICRWcCA9IFsxLCAxMCwgMTIsIDE0LCAxNiwgMTgsIDE5LCAyMSwgMjMsIDI0LCAyNiwgMjcsIDI4LCAzNCwgMzUsIDM2LCA0MSwgNDIsIDQzLCA0NCwgNDUsIDQ2LCA0NywgNDgsIDQ5LCA1MF0sICRWcSA9IFsxLCA2NF07XG4gIHZhciBwYXJzZXIyID0ge1xuICAgIHRyYWNlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHRyYWNlKCkge1xuICAgIH0sIFwidHJhY2VcIiksXG4gICAgeXk6IHt9LFxuICAgIHN5bWJvbHNfOiB7IFwiZXJyb3JcIjogMiwgXCJzdGFydFwiOiAzLCBcImVvbFwiOiA0LCBcIlhZQ0hBUlRcIjogNSwgXCJjaGFydENvbmZpZ1wiOiA2LCBcImRvY3VtZW50XCI6IDcsIFwiQ0hBUlRfT1JJRU5UQVRJT05cIjogOCwgXCJzdGF0ZW1lbnRcIjogOSwgXCJ0aXRsZVwiOiAxMCwgXCJ0ZXh0XCI6IDExLCBcIlhfQVhJU1wiOiAxMiwgXCJwYXJzZVhBeGlzXCI6IDEzLCBcIllfQVhJU1wiOiAxNCwgXCJwYXJzZVlBeGlzXCI6IDE1LCBcIkxJTkVcIjogMTYsIFwicGxvdERhdGFcIjogMTcsIFwiQkFSXCI6IDE4LCBcImFjY190aXRsZVwiOiAxOSwgXCJhY2NfdGl0bGVfdmFsdWVcIjogMjAsIFwiYWNjX2Rlc2NyXCI6IDIxLCBcImFjY19kZXNjcl92YWx1ZVwiOiAyMiwgXCJhY2NfZGVzY3JfbXVsdGlsaW5lX3ZhbHVlXCI6IDIzLCBcIlNRVUFSRV9CUkFDRVNfU1RBUlRcIjogMjQsIFwiY29tbWFTZXBhcmF0ZWROdW1iZXJzXCI6IDI1LCBcIlNRVUFSRV9CUkFDRVNfRU5EXCI6IDI2LCBcIk5VTUJFUl9XSVRIX0RFQ0lNQUxcIjogMjcsIFwiQ09NTUFcIjogMjgsIFwieEF4aXNEYXRhXCI6IDI5LCBcImJhbmREYXRhXCI6IDMwLCBcIkFSUk9XX0RFTElNSVRFUlwiOiAzMSwgXCJjb21tYVNlcGFyYXRlZFRleHRzXCI6IDMyLCBcInlBeGlzRGF0YVwiOiAzMywgXCJORVdMSU5FXCI6IDM0LCBcIlNFTUlcIjogMzUsIFwiRU9GXCI6IDM2LCBcImFscGhhTnVtXCI6IDM3LCBcIlNUUlwiOiAzOCwgXCJNRF9TVFJcIjogMzksIFwiYWxwaGFOdW1Ub2tlblwiOiA0MCwgXCJBTVBcIjogNDEsIFwiTlVNXCI6IDQyLCBcIkFMUEhBXCI6IDQzLCBcIlBMVVNcIjogNDQsIFwiRVFVQUxTXCI6IDQ1LCBcIk1VTFRcIjogNDYsIFwiRE9UXCI6IDQ3LCBcIkJSS1RcIjogNDgsIFwiTUlOVVNcIjogNDksIFwiVU5ERVJTQ09SRVwiOiA1MCwgXCIkYWNjZXB0XCI6IDAsIFwiJGVuZFwiOiAxIH0sXG4gICAgdGVybWluYWxzXzogeyAyOiBcImVycm9yXCIsIDU6IFwiWFlDSEFSVFwiLCA4OiBcIkNIQVJUX09SSUVOVEFUSU9OXCIsIDEwOiBcInRpdGxlXCIsIDEyOiBcIlhfQVhJU1wiLCAxNDogXCJZX0FYSVNcIiwgMTY6IFwiTElORVwiLCAxODogXCJCQVJcIiwgMTk6IFwiYWNjX3RpdGxlXCIsIDIwOiBcImFjY190aXRsZV92YWx1ZVwiLCAyMTogXCJhY2NfZGVzY3JcIiwgMjI6IFwiYWNjX2Rlc2NyX3ZhbHVlXCIsIDIzOiBcImFjY19kZXNjcl9tdWx0aWxpbmVfdmFsdWVcIiwgMjQ6IFwiU1FVQVJFX0JSQUNFU19TVEFSVFwiLCAyNjogXCJTUVVBUkVfQlJBQ0VTX0VORFwiLCAyNzogXCJOVU1CRVJfV0lUSF9ERUNJTUFMXCIsIDI4OiBcIkNPTU1BXCIsIDMxOiBcIkFSUk9XX0RFTElNSVRFUlwiLCAzNDogXCJORVdMSU5FXCIsIDM1OiBcIlNFTUlcIiwgMzY6IFwiRU9GXCIsIDM4OiBcIlNUUlwiLCAzOTogXCJNRF9TVFJcIiwgNDE6IFwiQU1QXCIsIDQyOiBcIk5VTVwiLCA0MzogXCJBTFBIQVwiLCA0NDogXCJQTFVTXCIsIDQ1OiBcIkVRVUFMU1wiLCA0NjogXCJNVUxUXCIsIDQ3OiBcIkRPVFwiLCA0ODogXCJCUktUXCIsIDQ5OiBcIk1JTlVTXCIsIDUwOiBcIlVOREVSU0NPUkVcIiB9LFxuICAgIHByb2R1Y3Rpb25zXzogWzAsIFszLCAyXSwgWzMsIDNdLCBbMywgMl0sIFszLCAxXSwgWzYsIDFdLCBbNywgMF0sIFs3LCAyXSwgWzksIDJdLCBbOSwgMl0sIFs5LCAyXSwgWzksIDJdLCBbOSwgMl0sIFs5LCAzXSwgWzksIDJdLCBbOSwgM10sIFs5LCAyXSwgWzksIDJdLCBbOSwgMV0sIFsxNywgM10sIFsyNSwgM10sIFsyNSwgMV0sIFsxMywgMV0sIFsxMywgMl0sIFsxMywgMV0sIFsyOSwgMV0sIFsyOSwgM10sIFszMCwgM10sIFszMiwgM10sIFszMiwgMV0sIFsxNSwgMV0sIFsxNSwgMl0sIFsxNSwgMV0sIFszMywgM10sIFs0LCAxXSwgWzQsIDFdLCBbNCwgMV0sIFsxMSwgMV0sIFsxMSwgMV0sIFsxMSwgMV0sIFszNywgMV0sIFszNywgMl0sIFs0MCwgMV0sIFs0MCwgMV0sIFs0MCwgMV0sIFs0MCwgMV0sIFs0MCwgMV0sIFs0MCwgMV0sIFs0MCwgMV0sIFs0MCwgMV0sIFs0MCwgMV0sIFs0MCwgMV1dLFxuICAgIHBlcmZvcm1BY3Rpb246IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gYW5vbnltb3VzKHl5dGV4dCwgeXlsZW5nLCB5eWxpbmVubywgeXksIHl5c3RhdGUsICQkLCBfJCkge1xuICAgICAgdmFyICQwID0gJCQubGVuZ3RoIC0gMTtcbiAgICAgIHN3aXRjaCAoeXlzdGF0ZSkge1xuICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgeXkuc2V0T3JpZW50YXRpb24oJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA5OlxuICAgICAgICAgIHl5LnNldERpYWdyYW1UaXRsZSgkJFskMF0udGV4dC50cmltKCkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgIHl5LnNldExpbmVEYXRhKHsgdGV4dDogXCJcIiwgdHlwZTogXCJ0ZXh0XCIgfSwgJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICB5eS5zZXRMaW5lRGF0YSgkJFskMCAtIDFdLCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgIHl5LnNldEJhckRhdGEoeyB0ZXh0OiBcIlwiLCB0eXBlOiBcInRleHRcIiB9LCAkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgIHl5LnNldEJhckRhdGEoJCRbJDAgLSAxXSwgJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF0udHJpbSgpO1xuICAgICAgICAgIHl5LnNldEFjY1RpdGxlKHRoaXMuJCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTc6XG4gICAgICAgIGNhc2UgMTg6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdLnRyaW0oKTtcbiAgICAgICAgICB5eS5zZXRBY2NEZXNjcmlwdGlvbih0aGlzLiQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE5OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgdGhpcy4kID0gW051bWJlcigkJFskMCAtIDJdKSwgLi4uJCRbJDBdXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyMTpcbiAgICAgICAgICB0aGlzLiQgPSBbTnVtYmVyKCQkWyQwXSldO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDIyOlxuICAgICAgICAgIHl5LnNldFhBeGlzVGl0bGUoJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyMzpcbiAgICAgICAgICB5eS5zZXRYQXhpc1RpdGxlKCQkWyQwIC0gMV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI0OlxuICAgICAgICAgIHl5LnNldFhBeGlzVGl0bGUoeyB0eXBlOiBcInRleHRcIiwgdGV4dDogXCJcIiB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyNTpcbiAgICAgICAgICB5eS5zZXRYQXhpc0JhbmQoJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyNjpcbiAgICAgICAgICB5eS5zZXRYQXhpc1JhbmdlRGF0YShOdW1iZXIoJCRbJDAgLSAyXSksIE51bWJlcigkJFskMF0pKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyNzpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDFdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI4OlxuICAgICAgICAgIHRoaXMuJCA9IFskJFskMCAtIDJdLCAuLi4kJFskMF1dO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI5OlxuICAgICAgICAgIHRoaXMuJCA9IFskJFskMF1dO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMwOlxuICAgICAgICAgIHl5LnNldFlBeGlzVGl0bGUoJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzMTpcbiAgICAgICAgICB5eS5zZXRZQXhpc1RpdGxlKCQkWyQwIC0gMV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMyOlxuICAgICAgICAgIHl5LnNldFlBeGlzVGl0bGUoeyB0eXBlOiBcInRleHRcIiwgdGV4dDogXCJcIiB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzMzpcbiAgICAgICAgICB5eS5zZXRZQXhpc1JhbmdlRGF0YShOdW1iZXIoJCRbJDAgLSAyXSksIE51bWJlcigkJFskMF0pKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgICB0aGlzLiQgPSB7IHRleHQ6ICQkWyQwXSwgdHlwZTogXCJ0ZXh0XCIgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzODpcbiAgICAgICAgICB0aGlzLiQgPSB7IHRleHQ6ICQkWyQwXSwgdHlwZTogXCJ0ZXh0XCIgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzOTpcbiAgICAgICAgICB0aGlzLiQgPSB7IHRleHQ6ICQkWyQwXSwgdHlwZTogXCJtYXJrZG93blwiIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQxOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMV0gKyBcIlwiICsgJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0sIFwiYW5vbnltb3VzXCIpLFxuICAgIHRhYmxlOiBbbygkVjAsICRWMSwgeyAzOiAxLCA0OiAyLCA3OiA0LCA1OiAkVjIsIDM0OiAkVjMsIDM1OiAkVjQsIDM2OiAkVjUgfSksIHsgMTogWzNdIH0sIG8oJFYwLCAkVjEsIHsgNDogMiwgNzogNCwgMzogOCwgNTogJFYyLCAzNDogJFYzLCAzNTogJFY0LCAzNjogJFY1IH0pLCBvKCRWMCwgJFYxLCB7IDQ6IDIsIDc6IDQsIDY6IDksIDM6IDEwLCA1OiAkVjIsIDg6IFsxLCAxMV0sIDM0OiAkVjMsIDM1OiAkVjQsIDM2OiAkVjUgfSksIHsgMTogWzIsIDRdLCA5OiAxMiwgMTA6IFsxLCAxM10sIDEyOiBbMSwgMTRdLCAxNDogWzEsIDE1XSwgMTY6IFsxLCAxNl0sIDE4OiBbMSwgMTddLCAxOTogWzEsIDE4XSwgMjE6IFsxLCAxOV0sIDIzOiBbMSwgMjBdIH0sIG8oJFY2LCBbMiwgMzRdKSwgbygkVjYsIFsyLCAzNV0pLCBvKCRWNiwgWzIsIDM2XSksIHsgMTogWzIsIDFdIH0sIG8oJFYwLCAkVjEsIHsgNDogMiwgNzogNCwgMzogMjEsIDU6ICRWMiwgMzQ6ICRWMywgMzU6ICRWNCwgMzY6ICRWNSB9KSwgeyAxOiBbMiwgM10gfSwgbygkVjYsIFsyLCA1XSksIG8oJFYwLCBbMiwgN10sIHsgNDogMjIsIDM0OiAkVjMsIDM1OiAkVjQsIDM2OiAkVjUgfSksIHsgMTE6IDIzLCAzNzogMjQsIDM4OiAkVjcsIDM5OiAkVjgsIDQwOiAyNywgNDE6ICRWOSwgNDI6ICRWYSwgNDM6ICRWYiwgNDQ6ICRWYywgNDU6ICRWZCwgNDY6ICRWZSwgNDc6ICRWZiwgNDg6ICRWZywgNDk6ICRWaCwgNTA6ICRWaSB9LCB7IDExOiAzOSwgMTM6IDM4LCAyNDogJFZqLCAyNzogJFZrLCAyOTogNDAsIDMwOiA0MSwgMzc6IDI0LCAzODogJFY3LCAzOTogJFY4LCA0MDogMjcsIDQxOiAkVjksIDQyOiAkVmEsIDQzOiAkVmIsIDQ0OiAkVmMsIDQ1OiAkVmQsIDQ2OiAkVmUsIDQ3OiAkVmYsIDQ4OiAkVmcsIDQ5OiAkVmgsIDUwOiAkVmkgfSwgeyAxMTogNDUsIDE1OiA0NCwgMjc6ICRWbCwgMzM6IDQ2LCAzNzogMjQsIDM4OiAkVjcsIDM5OiAkVjgsIDQwOiAyNywgNDE6ICRWOSwgNDI6ICRWYSwgNDM6ICRWYiwgNDQ6ICRWYywgNDU6ICRWZCwgNDY6ICRWZSwgNDc6ICRWZiwgNDg6ICRWZywgNDk6ICRWaCwgNTA6ICRWaSB9LCB7IDExOiA0OSwgMTc6IDQ4LCAyNDogJFZtLCAzNzogMjQsIDM4OiAkVjcsIDM5OiAkVjgsIDQwOiAyNywgNDE6ICRWOSwgNDI6ICRWYSwgNDM6ICRWYiwgNDQ6ICRWYywgNDU6ICRWZCwgNDY6ICRWZSwgNDc6ICRWZiwgNDg6ICRWZywgNDk6ICRWaCwgNTA6ICRWaSB9LCB7IDExOiA1MiwgMTc6IDUxLCAyNDogJFZtLCAzNzogMjQsIDM4OiAkVjcsIDM5OiAkVjgsIDQwOiAyNywgNDE6ICRWOSwgNDI6ICRWYSwgNDM6ICRWYiwgNDQ6ICRWYywgNDU6ICRWZCwgNDY6ICRWZSwgNDc6ICRWZiwgNDg6ICRWZywgNDk6ICRWaCwgNTA6ICRWaSB9LCB7IDIwOiBbMSwgNTNdIH0sIHsgMjI6IFsxLCA1NF0gfSwgbygkVm4sIFsyLCAxOF0pLCB7IDE6IFsyLCAyXSB9LCBvKCRWbiwgWzIsIDhdKSwgbygkVm4sIFsyLCA5XSksIG8oJFZvLCBbMiwgMzddLCB7IDQwOiA1NSwgNDE6ICRWOSwgNDI6ICRWYSwgNDM6ICRWYiwgNDQ6ICRWYywgNDU6ICRWZCwgNDY6ICRWZSwgNDc6ICRWZiwgNDg6ICRWZywgNDk6ICRWaCwgNTA6ICRWaSB9KSwgbygkVm8sIFsyLCAzOF0pLCBvKCRWbywgWzIsIDM5XSksIG8oJFZwLCBbMiwgNDBdKSwgbygkVnAsIFsyLCA0Ml0pLCBvKCRWcCwgWzIsIDQzXSksIG8oJFZwLCBbMiwgNDRdKSwgbygkVnAsIFsyLCA0NV0pLCBvKCRWcCwgWzIsIDQ2XSksIG8oJFZwLCBbMiwgNDddKSwgbygkVnAsIFsyLCA0OF0pLCBvKCRWcCwgWzIsIDQ5XSksIG8oJFZwLCBbMiwgNTBdKSwgbygkVnAsIFsyLCA1MV0pLCBvKCRWbiwgWzIsIDEwXSksIG8oJFZuLCBbMiwgMjJdLCB7IDMwOiA0MSwgMjk6IDU2LCAyNDogJFZqLCAyNzogJFZrIH0pLCBvKCRWbiwgWzIsIDI0XSksIG8oJFZuLCBbMiwgMjVdKSwgeyAzMTogWzEsIDU3XSB9LCB7IDExOiA1OSwgMzI6IDU4LCAzNzogMjQsIDM4OiAkVjcsIDM5OiAkVjgsIDQwOiAyNywgNDE6ICRWOSwgNDI6ICRWYSwgNDM6ICRWYiwgNDQ6ICRWYywgNDU6ICRWZCwgNDY6ICRWZSwgNDc6ICRWZiwgNDg6ICRWZywgNDk6ICRWaCwgNTA6ICRWaSB9LCBvKCRWbiwgWzIsIDExXSksIG8oJFZuLCBbMiwgMzBdLCB7IDMzOiA2MCwgMjc6ICRWbCB9KSwgbygkVm4sIFsyLCAzMl0pLCB7IDMxOiBbMSwgNjFdIH0sIG8oJFZuLCBbMiwgMTJdKSwgeyAxNzogNjIsIDI0OiAkVm0gfSwgeyAyNTogNjMsIDI3OiAkVnEgfSwgbygkVm4sIFsyLCAxNF0pLCB7IDE3OiA2NSwgMjQ6ICRWbSB9LCBvKCRWbiwgWzIsIDE2XSksIG8oJFZuLCBbMiwgMTddKSwgbygkVnAsIFsyLCA0MV0pLCBvKCRWbiwgWzIsIDIzXSksIHsgMjc6IFsxLCA2Nl0gfSwgeyAyNjogWzEsIDY3XSB9LCB7IDI2OiBbMiwgMjldLCAyODogWzEsIDY4XSB9LCBvKCRWbiwgWzIsIDMxXSksIHsgMjc6IFsxLCA2OV0gfSwgbygkVm4sIFsyLCAxM10pLCB7IDI2OiBbMSwgNzBdIH0sIHsgMjY6IFsyLCAyMV0sIDI4OiBbMSwgNzFdIH0sIG8oJFZuLCBbMiwgMTVdKSwgbygkVm4sIFsyLCAyNl0pLCBvKCRWbiwgWzIsIDI3XSksIHsgMTE6IDU5LCAzMjogNzIsIDM3OiAyNCwgMzg6ICRWNywgMzk6ICRWOCwgNDA6IDI3LCA0MTogJFY5LCA0MjogJFZhLCA0MzogJFZiLCA0NDogJFZjLCA0NTogJFZkLCA0NjogJFZlLCA0NzogJFZmLCA0ODogJFZnLCA0OTogJFZoLCA1MDogJFZpIH0sIG8oJFZuLCBbMiwgMzNdKSwgbygkVm4sIFsyLCAxOV0pLCB7IDI1OiA3MywgMjc6ICRWcSB9LCB7IDI2OiBbMiwgMjhdIH0sIHsgMjY6IFsyLCAyMF0gfV0sXG4gICAgZGVmYXVsdEFjdGlvbnM6IHsgODogWzIsIDFdLCAxMDogWzIsIDNdLCAyMTogWzIsIDJdLCA3MjogWzIsIDI4XSwgNzM6IFsyLCAyMF0gfSxcbiAgICBwYXJzZUVycm9yOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBhcnNlRXJyb3Ioc3RyLCBoYXNoKSB7XG4gICAgICBpZiAoaGFzaC5yZWNvdmVyYWJsZSkge1xuICAgICAgICB0aGlzLnRyYWNlKHN0cik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgZXJyb3IgPSBuZXcgRXJyb3Ioc3RyKTtcbiAgICAgICAgZXJyb3IuaGFzaCA9IGhhc2g7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0sIFwicGFyc2VFcnJvclwiKSxcbiAgICBwYXJzZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwYXJzZShpbnB1dCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLCBzdGFjayA9IFswXSwgdHN0YWNrID0gW10sIHZzdGFjayA9IFtudWxsXSwgbHN0YWNrID0gW10sIHRhYmxlID0gdGhpcy50YWJsZSwgeXl0ZXh0ID0gXCJcIiwgeXlsaW5lbm8gPSAwLCB5eWxlbmcgPSAwLCByZWNvdmVyaW5nID0gMCwgVEVSUk9SID0gMiwgRU9GID0gMTtcbiAgICAgIHZhciBhcmdzID0gbHN0YWNrLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgIHZhciBsZXhlcjIgPSBPYmplY3QuY3JlYXRlKHRoaXMubGV4ZXIpO1xuICAgICAgdmFyIHNoYXJlZFN0YXRlID0geyB5eToge30gfTtcbiAgICAgIGZvciAodmFyIGsgaW4gdGhpcy55eSkge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRoaXMueXksIGspKSB7XG4gICAgICAgICAgc2hhcmVkU3RhdGUueXlba10gPSB0aGlzLnl5W2tdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsZXhlcjIuc2V0SW5wdXQoaW5wdXQsIHNoYXJlZFN0YXRlLnl5KTtcbiAgICAgIHNoYXJlZFN0YXRlLnl5LmxleGVyID0gbGV4ZXIyO1xuICAgICAgc2hhcmVkU3RhdGUueXkucGFyc2VyID0gdGhpcztcbiAgICAgIGlmICh0eXBlb2YgbGV4ZXIyLnl5bGxvYyA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGxleGVyMi55eWxsb2MgPSB7fTtcbiAgICAgIH1cbiAgICAgIHZhciB5eWxvYyA9IGxleGVyMi55eWxsb2M7XG4gICAgICBsc3RhY2sucHVzaCh5eWxvYyk7XG4gICAgICB2YXIgcmFuZ2VzID0gbGV4ZXIyLm9wdGlvbnMgJiYgbGV4ZXIyLm9wdGlvbnMucmFuZ2VzO1xuICAgICAgaWYgKHR5cGVvZiBzaGFyZWRTdGF0ZS55eS5wYXJzZUVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhpcy5wYXJzZUVycm9yID0gc2hhcmVkU3RhdGUueXkucGFyc2VFcnJvcjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucGFyc2VFcnJvciA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKS5wYXJzZUVycm9yO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gcG9wU3RhY2sobikge1xuICAgICAgICBzdGFjay5sZW5ndGggPSBzdGFjay5sZW5ndGggLSAyICogbjtcbiAgICAgICAgdnN0YWNrLmxlbmd0aCA9IHZzdGFjay5sZW5ndGggLSBuO1xuICAgICAgICBsc3RhY2subGVuZ3RoID0gbHN0YWNrLmxlbmd0aCAtIG47XG4gICAgICB9XG4gICAgICBfX25hbWUocG9wU3RhY2ssIFwicG9wU3RhY2tcIik7XG4gICAgICBmdW5jdGlvbiBsZXgoKSB7XG4gICAgICAgIHZhciB0b2tlbjtcbiAgICAgICAgdG9rZW4gPSB0c3RhY2sucG9wKCkgfHwgbGV4ZXIyLmxleCgpIHx8IEVPRjtcbiAgICAgICAgaWYgKHR5cGVvZiB0b2tlbiAhPT0gXCJudW1iZXJcIikge1xuICAgICAgICAgIGlmICh0b2tlbiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgICAgICB0c3RhY2sgPSB0b2tlbjtcbiAgICAgICAgICAgIHRva2VuID0gdHN0YWNrLnBvcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0b2tlbiA9IHNlbGYuc3ltYm9sc19bdG9rZW5dIHx8IHRva2VuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgIH1cbiAgICAgIF9fbmFtZShsZXgsIFwibGV4XCIpO1xuICAgICAgdmFyIHN5bWJvbCwgcHJlRXJyb3JTeW1ib2wsIHN0YXRlLCBhY3Rpb24sIGEsIHIsIHl5dmFsID0ge30sIHAsIGxlbiwgbmV3U3RhdGUsIGV4cGVjdGVkO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgc3RhdGUgPSBzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKHRoaXMuZGVmYXVsdEFjdGlvbnNbc3RhdGVdKSB7XG4gICAgICAgICAgYWN0aW9uID0gdGhpcy5kZWZhdWx0QWN0aW9uc1tzdGF0ZV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHN5bWJvbCA9PT0gbnVsbCB8fCB0eXBlb2Ygc3ltYm9sID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIHN5bWJvbCA9IGxleCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhY3Rpb24gPSB0YWJsZVtzdGF0ZV0gJiYgdGFibGVbc3RhdGVdW3N5bWJvbF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBhY3Rpb24gPT09IFwidW5kZWZpbmVkXCIgfHwgIWFjdGlvbi5sZW5ndGggfHwgIWFjdGlvblswXSkge1xuICAgICAgICAgIHZhciBlcnJTdHIgPSBcIlwiO1xuICAgICAgICAgIGV4cGVjdGVkID0gW107XG4gICAgICAgICAgZm9yIChwIGluIHRhYmxlW3N0YXRlXSkge1xuICAgICAgICAgICAgaWYgKHRoaXMudGVybWluYWxzX1twXSAmJiBwID4gVEVSUk9SKSB7XG4gICAgICAgICAgICAgIGV4cGVjdGVkLnB1c2goXCInXCIgKyB0aGlzLnRlcm1pbmFsc19bcF0gKyBcIidcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChsZXhlcjIuc2hvd1Bvc2l0aW9uKSB7XG4gICAgICAgICAgICBlcnJTdHIgPSBcIlBhcnNlIGVycm9yIG9uIGxpbmUgXCIgKyAoeXlsaW5lbm8gKyAxKSArIFwiOlxcblwiICsgbGV4ZXIyLnNob3dQb3NpdGlvbigpICsgXCJcXG5FeHBlY3RpbmcgXCIgKyBleHBlY3RlZC5qb2luKFwiLCBcIikgKyBcIiwgZ290ICdcIiArICh0aGlzLnRlcm1pbmFsc19bc3ltYm9sXSB8fCBzeW1ib2wpICsgXCInXCI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVyclN0ciA9IFwiUGFyc2UgZXJyb3Igb24gbGluZSBcIiArICh5eWxpbmVubyArIDEpICsgXCI6IFVuZXhwZWN0ZWQgXCIgKyAoc3ltYm9sID09IEVPRiA/IFwiZW5kIG9mIGlucHV0XCIgOiBcIidcIiArICh0aGlzLnRlcm1pbmFsc19bc3ltYm9sXSB8fCBzeW1ib2wpICsgXCInXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnBhcnNlRXJyb3IoZXJyU3RyLCB7XG4gICAgICAgICAgICB0ZXh0OiBsZXhlcjIubWF0Y2gsXG4gICAgICAgICAgICB0b2tlbjogdGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sLFxuICAgICAgICAgICAgbGluZTogbGV4ZXIyLnl5bGluZW5vLFxuICAgICAgICAgICAgbG9jOiB5eWxvYyxcbiAgICAgICAgICAgIGV4cGVjdGVkXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFjdGlvblswXSBpbnN0YW5jZW9mIEFycmF5ICYmIGFjdGlvbi5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGFyc2UgRXJyb3I6IG11bHRpcGxlIGFjdGlvbnMgcG9zc2libGUgYXQgc3RhdGU6IFwiICsgc3RhdGUgKyBcIiwgdG9rZW46IFwiICsgc3ltYm9sKTtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKGFjdGlvblswXSkge1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHN0YWNrLnB1c2goc3ltYm9sKTtcbiAgICAgICAgICAgIHZzdGFjay5wdXNoKGxleGVyMi55eXRleHQpO1xuICAgICAgICAgICAgbHN0YWNrLnB1c2gobGV4ZXIyLnl5bGxvYyk7XG4gICAgICAgICAgICBzdGFjay5wdXNoKGFjdGlvblsxXSk7XG4gICAgICAgICAgICBzeW1ib2wgPSBudWxsO1xuICAgICAgICAgICAgaWYgKCFwcmVFcnJvclN5bWJvbCkge1xuICAgICAgICAgICAgICB5eWxlbmcgPSBsZXhlcjIueXlsZW5nO1xuICAgICAgICAgICAgICB5eXRleHQgPSBsZXhlcjIueXl0ZXh0O1xuICAgICAgICAgICAgICB5eWxpbmVubyA9IGxleGVyMi55eWxpbmVubztcbiAgICAgICAgICAgICAgeXlsb2MgPSBsZXhlcjIueXlsbG9jO1xuICAgICAgICAgICAgICBpZiAocmVjb3ZlcmluZyA+IDApIHtcbiAgICAgICAgICAgICAgICByZWNvdmVyaW5nLS07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHN5bWJvbCA9IHByZUVycm9yU3ltYm9sO1xuICAgICAgICAgICAgICBwcmVFcnJvclN5bWJvbCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBsZW4gPSB0aGlzLnByb2R1Y3Rpb25zX1thY3Rpb25bMV1dWzFdO1xuICAgICAgICAgICAgeXl2YWwuJCA9IHZzdGFja1t2c3RhY2subGVuZ3RoIC0gbGVuXTtcbiAgICAgICAgICAgIHl5dmFsLl8kID0ge1xuICAgICAgICAgICAgICBmaXJzdF9saW5lOiBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIChsZW4gfHwgMSldLmZpcnN0X2xpbmUsXG4gICAgICAgICAgICAgIGxhc3RfbGluZTogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAxXS5sYXN0X2xpbmUsXG4gICAgICAgICAgICAgIGZpcnN0X2NvbHVtbjogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgICAgIGxhc3RfY29sdW1uOiBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIDFdLmxhc3RfY29sdW1uXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHJhbmdlcykge1xuICAgICAgICAgICAgICB5eXZhbC5fJC5yYW5nZSA9IFtcbiAgICAgICAgICAgICAgICBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIChsZW4gfHwgMSldLnJhbmdlWzBdLFxuICAgICAgICAgICAgICAgIGxzdGFja1tsc3RhY2subGVuZ3RoIC0gMV0ucmFuZ2VbMV1cbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHIgPSB0aGlzLnBlcmZvcm1BY3Rpb24uYXBwbHkoeXl2YWwsIFtcbiAgICAgICAgICAgICAgeXl0ZXh0LFxuICAgICAgICAgICAgICB5eWxlbmcsXG4gICAgICAgICAgICAgIHl5bGluZW5vLFxuICAgICAgICAgICAgICBzaGFyZWRTdGF0ZS55eSxcbiAgICAgICAgICAgICAgYWN0aW9uWzFdLFxuICAgICAgICAgICAgICB2c3RhY2ssXG4gICAgICAgICAgICAgIGxzdGFja1xuICAgICAgICAgICAgXS5jb25jYXQoYXJncykpO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgIHJldHVybiByO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxlbikge1xuICAgICAgICAgICAgICBzdGFjayA9IHN0YWNrLnNsaWNlKDAsIC0xICogbGVuICogMik7XG4gICAgICAgICAgICAgIHZzdGFjayA9IHZzdGFjay5zbGljZSgwLCAtMSAqIGxlbik7XG4gICAgICAgICAgICAgIGxzdGFjayA9IGxzdGFjay5zbGljZSgwLCAtMSAqIGxlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdGFjay5wdXNoKHRoaXMucHJvZHVjdGlvbnNfW2FjdGlvblsxXV1bMF0pO1xuICAgICAgICAgICAgdnN0YWNrLnB1c2goeXl2YWwuJCk7XG4gICAgICAgICAgICBsc3RhY2sucHVzaCh5eXZhbC5fJCk7XG4gICAgICAgICAgICBuZXdTdGF0ZSA9IHRhYmxlW3N0YWNrW3N0YWNrLmxlbmd0aCAtIDJdXVtzdGFja1tzdGFjay5sZW5ndGggLSAxXV07XG4gICAgICAgICAgICBzdGFjay5wdXNoKG5ld1N0YXRlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LCBcInBhcnNlXCIpXG4gIH07XG4gIHZhciBsZXhlciA9IC8qIEBfX1BVUkVfXyAqLyAoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxleGVyMiA9IHtcbiAgICAgIEVPRjogMSxcbiAgICAgIHBhcnNlRXJyb3I6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcGFyc2VFcnJvcihzdHIsIGhhc2gpIHtcbiAgICAgICAgaWYgKHRoaXMueXkucGFyc2VyKSB7XG4gICAgICAgICAgdGhpcy55eS5wYXJzZXIucGFyc2VFcnJvcihzdHIsIGhhc2gpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihzdHIpO1xuICAgICAgICB9XG4gICAgICB9LCBcInBhcnNlRXJyb3JcIiksXG4gICAgICAvLyByZXNldHMgdGhlIGxleGVyLCBzZXRzIG5ldyBpbnB1dFxuICAgICAgc2V0SW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oaW5wdXQsIHl5KSB7XG4gICAgICAgIHRoaXMueXkgPSB5eSB8fCB0aGlzLnl5IHx8IHt9O1xuICAgICAgICB0aGlzLl9pbnB1dCA9IGlucHV0O1xuICAgICAgICB0aGlzLl9tb3JlID0gdGhpcy5fYmFja3RyYWNrID0gdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICAgIHRoaXMueXlsaW5lbm8gPSB0aGlzLnl5bGVuZyA9IDA7XG4gICAgICAgIHRoaXMueXl0ZXh0ID0gdGhpcy5tYXRjaGVkID0gdGhpcy5tYXRjaCA9IFwiXCI7XG4gICAgICAgIHRoaXMuY29uZGl0aW9uU3RhY2sgPSBbXCJJTklUSUFMXCJdO1xuICAgICAgICB0aGlzLnl5bGxvYyA9IHtcbiAgICAgICAgICBmaXJzdF9saW5lOiAxLFxuICAgICAgICAgIGZpcnN0X2NvbHVtbjogMCxcbiAgICAgICAgICBsYXN0X2xpbmU6IDEsXG4gICAgICAgICAgbGFzdF9jb2x1bW46IDBcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZSA9IFswLCAwXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9mZnNldCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJzZXRJbnB1dFwiKSxcbiAgICAgIC8vIGNvbnN1bWVzIGFuZCByZXR1cm5zIG9uZSBjaGFyIGZyb20gdGhlIGlucHV0XG4gICAgICBpbnB1dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNoID0gdGhpcy5faW5wdXRbMF07XG4gICAgICAgIHRoaXMueXl0ZXh0ICs9IGNoO1xuICAgICAgICB0aGlzLnl5bGVuZysrO1xuICAgICAgICB0aGlzLm9mZnNldCsrO1xuICAgICAgICB0aGlzLm1hdGNoICs9IGNoO1xuICAgICAgICB0aGlzLm1hdGNoZWQgKz0gY2g7XG4gICAgICAgIHZhciBsaW5lcyA9IGNoLm1hdGNoKC8oPzpcXHJcXG4/fFxcbikuKi9nKTtcbiAgICAgICAgaWYgKGxpbmVzKSB7XG4gICAgICAgICAgdGhpcy55eWxpbmVubysrO1xuICAgICAgICAgIHRoaXMueXlsbG9jLmxhc3RfbGluZSsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMueXlsbG9jLmxhc3RfY29sdW1uKys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZVsxXSsrO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2lucHV0ID0gdGhpcy5faW5wdXQuc2xpY2UoMSk7XG4gICAgICAgIHJldHVybiBjaDtcbiAgICAgIH0sIFwiaW5wdXRcIiksXG4gICAgICAvLyB1bnNoaWZ0cyBvbmUgY2hhciAob3IgYSBzdHJpbmcpIGludG8gdGhlIGlucHV0XG4gICAgICB1bnB1dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihjaCkge1xuICAgICAgICB2YXIgbGVuID0gY2gubGVuZ3RoO1xuICAgICAgICB2YXIgbGluZXMgPSBjaC5zcGxpdCgvKD86XFxyXFxuP3xcXG4pL2cpO1xuICAgICAgICB0aGlzLl9pbnB1dCA9IGNoICsgdGhpcy5faW5wdXQ7XG4gICAgICAgIHRoaXMueXl0ZXh0ID0gdGhpcy55eXRleHQuc3Vic3RyKDAsIHRoaXMueXl0ZXh0Lmxlbmd0aCAtIGxlbik7XG4gICAgICAgIHRoaXMub2Zmc2V0IC09IGxlbjtcbiAgICAgICAgdmFyIG9sZExpbmVzID0gdGhpcy5tYXRjaC5zcGxpdCgvKD86XFxyXFxuP3xcXG4pL2cpO1xuICAgICAgICB0aGlzLm1hdGNoID0gdGhpcy5tYXRjaC5zdWJzdHIoMCwgdGhpcy5tYXRjaC5sZW5ndGggLSAxKTtcbiAgICAgICAgdGhpcy5tYXRjaGVkID0gdGhpcy5tYXRjaGVkLnN1YnN0cigwLCB0aGlzLm1hdGNoZWQubGVuZ3RoIC0gMSk7XG4gICAgICAgIGlmIChsaW5lcy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgdGhpcy55eWxpbmVubyAtPSBsaW5lcy5sZW5ndGggLSAxO1xuICAgICAgICB9XG4gICAgICAgIHZhciByID0gdGhpcy55eWxsb2MucmFuZ2U7XG4gICAgICAgIHRoaXMueXlsbG9jID0ge1xuICAgICAgICAgIGZpcnN0X2xpbmU6IHRoaXMueXlsbG9jLmZpcnN0X2xpbmUsXG4gICAgICAgICAgbGFzdF9saW5lOiB0aGlzLnl5bGluZW5vICsgMSxcbiAgICAgICAgICBmaXJzdF9jb2x1bW46IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbixcbiAgICAgICAgICBsYXN0X2NvbHVtbjogbGluZXMgPyAobGluZXMubGVuZ3RoID09PSBvbGRMaW5lcy5sZW5ndGggPyB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4gOiAwKSArIG9sZExpbmVzW29sZExpbmVzLmxlbmd0aCAtIGxpbmVzLmxlbmd0aF0ubGVuZ3RoIC0gbGluZXNbMF0ubGVuZ3RoIDogdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uIC0gbGVuXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2UgPSBbclswXSwgclswXSArIHRoaXMueXlsZW5nIC0gbGVuXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnl5bGVuZyA9IHRoaXMueXl0ZXh0Lmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcInVucHV0XCIpLFxuICAgICAgLy8gV2hlbiBjYWxsZWQgZnJvbSBhY3Rpb24sIGNhY2hlcyBtYXRjaGVkIHRleHQgYW5kIGFwcGVuZHMgaXQgb24gbmV4dCBhY3Rpb25cbiAgICAgIG1vcmU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX21vcmUgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwibW9yZVwiKSxcbiAgICAgIC8vIFdoZW4gY2FsbGVkIGZyb20gYWN0aW9uLCBzaWduYWxzIHRoZSBsZXhlciB0aGF0IHRoaXMgcnVsZSBmYWlscyB0byBtYXRjaCB0aGUgaW5wdXQsIHNvIHRoZSBuZXh0IG1hdGNoaW5nIHJ1bGUgKHJlZ2V4KSBzaG91bGQgYmUgdGVzdGVkIGluc3RlYWQuXG4gICAgICByZWplY3Q6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFja3RyYWNrX2xleGVyKSB7XG4gICAgICAgICAgdGhpcy5fYmFja3RyYWNrID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZUVycm9yKFwiTGV4aWNhbCBlcnJvciBvbiBsaW5lIFwiICsgKHRoaXMueXlsaW5lbm8gKyAxKSArIFwiLiBZb3UgY2FuIG9ubHkgaW52b2tlIHJlamVjdCgpIGluIHRoZSBsZXhlciB3aGVuIHRoZSBsZXhlciBpcyBvZiB0aGUgYmFja3RyYWNraW5nIHBlcnN1YXNpb24gKG9wdGlvbnMuYmFja3RyYWNrX2xleGVyID0gdHJ1ZSkuXFxuXCIgKyB0aGlzLnNob3dQb3NpdGlvbigpLCB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgdG9rZW46IG51bGwsXG4gICAgICAgICAgICBsaW5lOiB0aGlzLnl5bGluZW5vXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcInJlamVjdFwiKSxcbiAgICAgIC8vIHJldGFpbiBmaXJzdCBuIGNoYXJhY3RlcnMgb2YgdGhlIG1hdGNoXG4gICAgICBsZXNzOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKG4pIHtcbiAgICAgICAgdGhpcy51bnB1dCh0aGlzLm1hdGNoLnNsaWNlKG4pKTtcbiAgICAgIH0sIFwibGVzc1wiKSxcbiAgICAgIC8vIGRpc3BsYXlzIGFscmVhZHkgbWF0Y2hlZCBpbnB1dCwgaS5lLiBmb3IgZXJyb3IgbWVzc2FnZXNcbiAgICAgIHBhc3RJbnB1dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBhc3QgPSB0aGlzLm1hdGNoZWQuc3Vic3RyKDAsIHRoaXMubWF0Y2hlZC5sZW5ndGggLSB0aGlzLm1hdGNoLmxlbmd0aCk7XG4gICAgICAgIHJldHVybiAocGFzdC5sZW5ndGggPiAyMCA/IFwiLi4uXCIgOiBcIlwiKSArIHBhc3Quc3Vic3RyKC0yMCkucmVwbGFjZSgvXFxuL2csIFwiXCIpO1xuICAgICAgfSwgXCJwYXN0SW5wdXRcIiksXG4gICAgICAvLyBkaXNwbGF5cyB1cGNvbWluZyBpbnB1dCwgaS5lLiBmb3IgZXJyb3IgbWVzc2FnZXNcbiAgICAgIHVwY29taW5nSW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXh0ID0gdGhpcy5tYXRjaDtcbiAgICAgICAgaWYgKG5leHQubGVuZ3RoIDwgMjApIHtcbiAgICAgICAgICBuZXh0ICs9IHRoaXMuX2lucHV0LnN1YnN0cigwLCAyMCAtIG5leHQubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKG5leHQuc3Vic3RyKDAsIDIwKSArIChuZXh0Lmxlbmd0aCA+IDIwID8gXCIuLi5cIiA6IFwiXCIpKS5yZXBsYWNlKC9cXG4vZywgXCJcIik7XG4gICAgICB9LCBcInVwY29taW5nSW5wdXRcIiksXG4gICAgICAvLyBkaXNwbGF5cyB0aGUgY2hhcmFjdGVyIHBvc2l0aW9uIHdoZXJlIHRoZSBsZXhpbmcgZXJyb3Igb2NjdXJyZWQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICBzaG93UG9zaXRpb246IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwcmUgPSB0aGlzLnBhc3RJbnB1dCgpO1xuICAgICAgICB2YXIgYyA9IG5ldyBBcnJheShwcmUubGVuZ3RoICsgMSkuam9pbihcIi1cIik7XG4gICAgICAgIHJldHVybiBwcmUgKyB0aGlzLnVwY29taW5nSW5wdXQoKSArIFwiXFxuXCIgKyBjICsgXCJeXCI7XG4gICAgICB9LCBcInNob3dQb3NpdGlvblwiKSxcbiAgICAgIC8vIHRlc3QgdGhlIGxleGVkIHRva2VuOiByZXR1cm4gRkFMU0Ugd2hlbiBub3QgYSBtYXRjaCwgb3RoZXJ3aXNlIHJldHVybiB0b2tlblxuICAgICAgdGVzdF9tYXRjaDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihtYXRjaCwgaW5kZXhlZF9ydWxlKSB7XG4gICAgICAgIHZhciB0b2tlbiwgbGluZXMsIGJhY2t1cDtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIpIHtcbiAgICAgICAgICBiYWNrdXAgPSB7XG4gICAgICAgICAgICB5eWxpbmVubzogdGhpcy55eWxpbmVubyxcbiAgICAgICAgICAgIHl5bGxvYzoge1xuICAgICAgICAgICAgICBmaXJzdF9saW5lOiB0aGlzLnl5bGxvYy5maXJzdF9saW5lLFxuICAgICAgICAgICAgICBsYXN0X2xpbmU6IHRoaXMubGFzdF9saW5lLFxuICAgICAgICAgICAgICBmaXJzdF9jb2x1bW46IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbixcbiAgICAgICAgICAgICAgbGFzdF9jb2x1bW46IHRoaXMueXlsbG9jLmxhc3RfY29sdW1uXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeXl0ZXh0OiB0aGlzLnl5dGV4dCxcbiAgICAgICAgICAgIG1hdGNoOiB0aGlzLm1hdGNoLFxuICAgICAgICAgICAgbWF0Y2hlczogdGhpcy5tYXRjaGVzLFxuICAgICAgICAgICAgbWF0Y2hlZDogdGhpcy5tYXRjaGVkLFxuICAgICAgICAgICAgeXlsZW5nOiB0aGlzLnl5bGVuZyxcbiAgICAgICAgICAgIG9mZnNldDogdGhpcy5vZmZzZXQsXG4gICAgICAgICAgICBfbW9yZTogdGhpcy5fbW9yZSxcbiAgICAgICAgICAgIF9pbnB1dDogdGhpcy5faW5wdXQsXG4gICAgICAgICAgICB5eTogdGhpcy55eSxcbiAgICAgICAgICAgIGNvbmRpdGlvblN0YWNrOiB0aGlzLmNvbmRpdGlvblN0YWNrLnNsaWNlKDApLFxuICAgICAgICAgICAgZG9uZTogdGhpcy5kb25lXG4gICAgICAgICAgfTtcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgICAgYmFja3VwLnl5bGxvYy5yYW5nZSA9IHRoaXMueXlsbG9jLnJhbmdlLnNsaWNlKDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsaW5lcyA9IG1hdGNoWzBdLm1hdGNoKC8oPzpcXHJcXG4/fFxcbikuKi9nKTtcbiAgICAgICAgaWYgKGxpbmVzKSB7XG4gICAgICAgICAgdGhpcy55eWxpbmVubyArPSBsaW5lcy5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy55eWxsb2MgPSB7XG4gICAgICAgICAgZmlyc3RfbGluZTogdGhpcy55eWxsb2MubGFzdF9saW5lLFxuICAgICAgICAgIGxhc3RfbGluZTogdGhpcy55eWxpbmVubyArIDEsXG4gICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtbixcbiAgICAgICAgICBsYXN0X2NvbHVtbjogbGluZXMgPyBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXS5sZW5ndGggLSBsaW5lc1tsaW5lcy5sZW5ndGggLSAxXS5tYXRjaCgvXFxyP1xcbj8vKVswXS5sZW5ndGggOiB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtbiArIG1hdGNoWzBdLmxlbmd0aFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnl5dGV4dCArPSBtYXRjaFswXTtcbiAgICAgICAgdGhpcy5tYXRjaCArPSBtYXRjaFswXTtcbiAgICAgICAgdGhpcy5tYXRjaGVzID0gbWF0Y2g7XG4gICAgICAgIHRoaXMueXlsZW5nID0gdGhpcy55eXRleHQubGVuZ3RoO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlID0gW3RoaXMub2Zmc2V0LCB0aGlzLm9mZnNldCArPSB0aGlzLnl5bGVuZ107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbW9yZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9iYWNrdHJhY2sgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSB0aGlzLl9pbnB1dC5zbGljZShtYXRjaFswXS5sZW5ndGgpO1xuICAgICAgICB0aGlzLm1hdGNoZWQgKz0gbWF0Y2hbMF07XG4gICAgICAgIHRva2VuID0gdGhpcy5wZXJmb3JtQWN0aW9uLmNhbGwodGhpcywgdGhpcy55eSwgdGhpcywgaW5kZXhlZF9ydWxlLCB0aGlzLmNvbmRpdGlvblN0YWNrW3RoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMV0pO1xuICAgICAgICBpZiAodGhpcy5kb25lICYmIHRoaXMuX2lucHV0KSB7XG4gICAgICAgICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JhY2t0cmFjaykge1xuICAgICAgICAgIGZvciAodmFyIGsgaW4gYmFja3VwKSB7XG4gICAgICAgICAgICB0aGlzW2tdID0gYmFja3VwW2tdO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSwgXCJ0ZXN0X21hdGNoXCIpLFxuICAgICAgLy8gcmV0dXJuIG5leHQgbWF0Y2ggaW4gaW5wdXRcbiAgICAgIG5leHQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5FT0Y7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9pbnB1dCkge1xuICAgICAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRva2VuLCBtYXRjaCwgdGVtcE1hdGNoLCBpbmRleDtcbiAgICAgICAgaWYgKCF0aGlzLl9tb3JlKSB7XG4gICAgICAgICAgdGhpcy55eXRleHQgPSBcIlwiO1xuICAgICAgICAgIHRoaXMubWF0Y2ggPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIHZhciBydWxlcyA9IHRoaXMuX2N1cnJlbnRSdWxlcygpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdGVtcE1hdGNoID0gdGhpcy5faW5wdXQubWF0Y2godGhpcy5ydWxlc1tydWxlc1tpXV0pO1xuICAgICAgICAgIGlmICh0ZW1wTWF0Y2ggJiYgKCFtYXRjaCB8fCB0ZW1wTWF0Y2hbMF0ubGVuZ3RoID4gbWF0Y2hbMF0ubGVuZ3RoKSkge1xuICAgICAgICAgICAgbWF0Y2ggPSB0ZW1wTWF0Y2g7XG4gICAgICAgICAgICBpbmRleCA9IGk7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2t0cmFja19sZXhlcikge1xuICAgICAgICAgICAgICB0b2tlbiA9IHRoaXMudGVzdF9tYXRjaCh0ZW1wTWF0Y2gsIHJ1bGVzW2ldKTtcbiAgICAgICAgICAgICAgaWYgKHRva2VuICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9iYWNrdHJhY2spIHtcbiAgICAgICAgICAgICAgICBtYXRjaCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5vcHRpb25zLmZsZXgpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgIHRva2VuID0gdGhpcy50ZXN0X21hdGNoKG1hdGNoLCBydWxlc1tpbmRleF0pO1xuICAgICAgICAgIGlmICh0b2tlbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9pbnB1dCA9PT0gXCJcIikge1xuICAgICAgICAgIHJldHVybiB0aGlzLkVPRjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZUVycm9yKFwiTGV4aWNhbCBlcnJvciBvbiBsaW5lIFwiICsgKHRoaXMueXlsaW5lbm8gKyAxKSArIFwiLiBVbnJlY29nbml6ZWQgdGV4dC5cXG5cIiArIHRoaXMuc2hvd1Bvc2l0aW9uKCksIHtcbiAgICAgICAgICAgIHRleHQ6IFwiXCIsXG4gICAgICAgICAgICB0b2tlbjogbnVsbCxcbiAgICAgICAgICAgIGxpbmU6IHRoaXMueXlsaW5lbm9cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJuZXh0XCIpLFxuICAgICAgLy8gcmV0dXJuIG5leHQgbWF0Y2ggdGhhdCBoYXMgYSB0b2tlblxuICAgICAgbGV4OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGxleCgpIHtcbiAgICAgICAgdmFyIHIgPSB0aGlzLm5leHQoKTtcbiAgICAgICAgaWYgKHIpIHtcbiAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5sZXgoKTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJsZXhcIiksXG4gICAgICAvLyBhY3RpdmF0ZXMgYSBuZXcgbGV4ZXIgY29uZGl0aW9uIHN0YXRlIChwdXNoZXMgdGhlIG5ldyBsZXhlciBjb25kaXRpb24gc3RhdGUgb250byB0aGUgY29uZGl0aW9uIHN0YWNrKVxuICAgICAgYmVnaW46IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gYmVnaW4oY29uZGl0aW9uKSB7XG4gICAgICAgIHRoaXMuY29uZGl0aW9uU3RhY2sucHVzaChjb25kaXRpb24pO1xuICAgICAgfSwgXCJiZWdpblwiKSxcbiAgICAgIC8vIHBvcCB0aGUgcHJldmlvdXNseSBhY3RpdmUgbGV4ZXIgY29uZGl0aW9uIHN0YXRlIG9mZiB0aGUgY29uZGl0aW9uIHN0YWNrXG4gICAgICBwb3BTdGF0ZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwb3BTdGF0ZSgpIHtcbiAgICAgICAgdmFyIG4gPSB0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDE7XG4gICAgICAgIGlmIChuID4gMCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrLnBvcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrWzBdO1xuICAgICAgICB9XG4gICAgICB9LCBcInBvcFN0YXRlXCIpLFxuICAgICAgLy8gcHJvZHVjZSB0aGUgbGV4ZXIgcnVsZSBzZXQgd2hpY2ggaXMgYWN0aXZlIGZvciB0aGUgY3VycmVudGx5IGFjdGl2ZSBsZXhlciBjb25kaXRpb24gc3RhdGVcbiAgICAgIF9jdXJyZW50UnVsZXM6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gX2N1cnJlbnRSdWxlcygpIHtcbiAgICAgICAgaWYgKHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoICYmIHRoaXMuY29uZGl0aW9uU3RhY2tbdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxXSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvbnNbdGhpcy5jb25kaXRpb25TdGFja1t0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDFdXS5ydWxlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25zW1wiSU5JVElBTFwiXS5ydWxlcztcbiAgICAgICAgfVxuICAgICAgfSwgXCJfY3VycmVudFJ1bGVzXCIpLFxuICAgICAgLy8gcmV0dXJuIHRoZSBjdXJyZW50bHkgYWN0aXZlIGxleGVyIGNvbmRpdGlvbiBzdGF0ZTsgd2hlbiBhbiBpbmRleCBhcmd1bWVudCBpcyBwcm92aWRlZCBpdCBwcm9kdWNlcyB0aGUgTi10aCBwcmV2aW91cyBjb25kaXRpb24gc3RhdGUsIGlmIGF2YWlsYWJsZVxuICAgICAgdG9wU3RhdGU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gdG9wU3RhdGUobikge1xuICAgICAgICBuID0gdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxIC0gTWF0aC5hYnMobiB8fCAwKTtcbiAgICAgICAgaWYgKG4gPj0gMCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrW25dO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBcIklOSVRJQUxcIjtcbiAgICAgICAgfVxuICAgICAgfSwgXCJ0b3BTdGF0ZVwiKSxcbiAgICAgIC8vIGFsaWFzIGZvciBiZWdpbihjb25kaXRpb24pXG4gICAgICBwdXNoU3RhdGU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcHVzaFN0YXRlKGNvbmRpdGlvbikge1xuICAgICAgICB0aGlzLmJlZ2luKGNvbmRpdGlvbik7XG4gICAgICB9LCBcInB1c2hTdGF0ZVwiKSxcbiAgICAgIC8vIHJldHVybiB0aGUgbnVtYmVyIG9mIHN0YXRlcyBjdXJyZW50bHkgb24gdGhlIHN0YWNrXG4gICAgICBzdGF0ZVN0YWNrU2l6ZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBzdGF0ZVN0YWNrU2l6ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoO1xuICAgICAgfSwgXCJzdGF0ZVN0YWNrU2l6ZVwiKSxcbiAgICAgIG9wdGlvbnM6IHsgXCJjYXNlLWluc2Vuc2l0aXZlXCI6IHRydWUgfSxcbiAgICAgIHBlcmZvcm1BY3Rpb246IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gYW5vbnltb3VzKHl5LCB5eV8sICRhdm9pZGluZ19uYW1lX2NvbGxpc2lvbnMsIFlZX1NUQVJUKSB7XG4gICAgICAgIHZhciBZWVNUQVRFID0gWVlfU1RBUlQ7XG4gICAgICAgIHN3aXRjaCAoJGF2b2lkaW5nX25hbWVfY29sbGlzaW9ucykge1xuICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiAzNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiAzNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiAzNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgIHJldHVybiAxMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiYWNjX3RpdGxlXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDE5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIFwiYWNjX3RpdGxlX3ZhbHVlXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcImFjY19kZXNjclwiKTtcbiAgICAgICAgICAgIHJldHVybiAyMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gXCJhY2NfZGVzY3JfdmFsdWVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTE6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcImFjY19kZXNjcl9tdWx0aWxpbmVcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICAgIHJldHVybiBcImFjY19kZXNjcl9tdWx0aWxpbmVfdmFsdWVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTQ6XG4gICAgICAgICAgICByZXR1cm4gNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgICByZXR1cm4gNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICByZXR1cm4gODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcImF4aXNfZGF0YVwiKTtcbiAgICAgICAgICAgIHJldHVybiBcIlhfQVhJU1wiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxODpcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiYXhpc19kYXRhXCIpO1xuICAgICAgICAgICAgcmV0dXJuIFwiWV9BWElTXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE5OlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJheGlzX2JhbmRfZGF0YVwiKTtcbiAgICAgICAgICAgIHJldHVybiAyNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgICByZXR1cm4gMzE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDIxOlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJkYXRhXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDE2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyMjpcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiZGF0YVwiKTtcbiAgICAgICAgICAgIHJldHVybiAxODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjM6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcImRhdGFfaW5uZXJcIik7XG4gICAgICAgICAgICByZXR1cm4gMjQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI0OlxuICAgICAgICAgICAgcmV0dXJuIDI3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyNTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiAyNjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjY6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJzdHJpbmdcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI4OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOTpcbiAgICAgICAgICAgIHJldHVybiBcIlNUUlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzMDpcbiAgICAgICAgICAgIHJldHVybiAyNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzE6XG4gICAgICAgICAgICByZXR1cm4gMjY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDMyOlxuICAgICAgICAgICAgcmV0dXJuIDQzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzMzpcbiAgICAgICAgICAgIHJldHVybiBcIkNPTE9OXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM0OlxuICAgICAgICAgICAgcmV0dXJuIDQ0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNTpcbiAgICAgICAgICAgIHJldHVybiAyODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzY6XG4gICAgICAgICAgICByZXR1cm4gNDU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM3OlxuICAgICAgICAgICAgcmV0dXJuIDQ2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzODpcbiAgICAgICAgICAgIHJldHVybiA0ODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzk6XG4gICAgICAgICAgICByZXR1cm4gNTA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQwOlxuICAgICAgICAgICAgcmV0dXJuIDQ3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0MTpcbiAgICAgICAgICAgIHJldHVybiA0MTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDI6XG4gICAgICAgICAgICByZXR1cm4gNDk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQzOlxuICAgICAgICAgICAgcmV0dXJuIDQyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0NDpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDU6XG4gICAgICAgICAgICByZXR1cm4gMzU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ2OlxuICAgICAgICAgICAgcmV0dXJuIDM2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0sIFwiYW5vbnltb3VzXCIpLFxuICAgICAgcnVsZXM6IFsvXig/OiUlKD8hXFx7KVteXFxuXSopL2ksIC9eKD86W15cXH1dJSVbXlxcbl0qKS9pLCAvXig/OihcXHI/XFxuKSkvaSwgL14oPzooXFxyP1xcbikpL2ksIC9eKD86W1xcblxccl0rKS9pLCAvXig/OiUlW15cXG5dKikvaSwgL14oPzp0aXRsZVxcYikvaSwgL14oPzphY2NUaXRsZVxccyo6XFxzKikvaSwgL14oPzooPyFcXG58fCkqW15cXG5dKikvaSwgL14oPzphY2NEZXNjclxccyo6XFxzKikvaSwgL14oPzooPyFcXG58fCkqW15cXG5dKikvaSwgL14oPzphY2NEZXNjclxccypcXHtcXHMqKS9pLCAvXig/OlxcfSkvaSwgL14oPzpbXlxcfV0qKS9pLCAvXig/Onh5Y2hhcnQtYmV0YVxcYikvaSwgL14oPzp4eWNoYXJ0XFxiKS9pLCAvXig/Oig/OnZlcnRpY2FsfGhvcml6b250YWwpKS9pLCAvXig/OngtYXhpc1xcYikvaSwgL14oPzp5LWF4aXNcXGIpL2ksIC9eKD86XFxbKS9pLCAvXig/Oi0tPikvaSwgL14oPzpsaW5lXFxiKS9pLCAvXig/OmJhclxcYikvaSwgL14oPzpcXFspL2ksIC9eKD86WystXT8oPzpcXGQrKD86XFwuXFxkKyk/fFxcLlxcZCspKS9pLCAvXig/OlxcXSkvaSwgL14oPzooPzpgXFwpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFx7IHRoaXNcXC5wdXNoU3RhdGVcXChtZF9zdHJpbmdcXCk7IFxcfVxcbjxtZF9zdHJpbmc+XFwoXFw/OlxcKFxcPyFgXCJcXClcXC5cXClcXCsgICAgICAgICAgICAgICAgICBcXHsgcmV0dXJuIE1EX1NUUjsgXFx9XFxuPG1kX3N0cmluZz5cXChcXD86YCkpL2ksIC9eKD86W1wiXSkvaSwgL14oPzpbXCJdKS9pLCAvXig/OlteXCJdKikvaSwgL14oPzpcXFspL2ksIC9eKD86XFxdKS9pLCAvXig/OltBLVphLXpdKykvaSwgL14oPzo6KS9pLCAvXig/OlxcKykvaSwgL14oPzosKS9pLCAvXig/Oj0pL2ksIC9eKD86XFwqKS9pLCAvXig/OiMpL2ksIC9eKD86W1xcX10pL2ksIC9eKD86XFwuKS9pLCAvXig/OiYpL2ksIC9eKD86LSkvaSwgL14oPzpbMC05XSspL2ksIC9eKD86XFxzKykvaSwgL14oPzo7KS9pLCAvXig/OiQpL2ldLFxuICAgICAgY29uZGl0aW9uczogeyBcImRhdGFfaW5uZXJcIjogeyBcInJ1bGVzXCI6IFswLCAxLCA0LCA1LCA2LCA3LCA5LCAxMSwgMTQsIDE1LCAxNiwgMTcsIDE4LCAyMSwgMjIsIDI0LCAyNSwgMjYsIDI3LCAzMCwgMzEsIDMyLCAzMywgMzQsIDM1LCAzNiwgMzcsIDM4LCAzOSwgNDAsIDQxLCA0MiwgNDMsIDQ0LCA0NSwgNDZdLCBcImluY2x1c2l2ZVwiOiB0cnVlIH0sIFwiZGF0YVwiOiB7IFwicnVsZXNcIjogWzAsIDEsIDMsIDQsIDUsIDYsIDcsIDksIDExLCAxNCwgMTUsIDE2LCAxNywgMTgsIDIxLCAyMiwgMjMsIDI2LCAyNywgMzAsIDMxLCAzMiwgMzMsIDM0LCAzNSwgMzYsIDM3LCAzOCwgMzksIDQwLCA0MSwgNDIsIDQzLCA0NCwgNDUsIDQ2XSwgXCJpbmNsdXNpdmVcIjogdHJ1ZSB9LCBcImF4aXNfYmFuZF9kYXRhXCI6IHsgXCJydWxlc1wiOiBbMCwgMSwgNCwgNSwgNiwgNywgOSwgMTEsIDE0LCAxNSwgMTYsIDE3LCAxOCwgMjEsIDIyLCAyNSwgMjYsIDI3LCAzMCwgMzEsIDMyLCAzMywgMzQsIDM1LCAzNiwgMzcsIDM4LCAzOSwgNDAsIDQxLCA0MiwgNDMsIDQ0LCA0NSwgNDZdLCBcImluY2x1c2l2ZVwiOiB0cnVlIH0sIFwiYXhpc19kYXRhXCI6IHsgXCJydWxlc1wiOiBbMCwgMSwgMiwgNCwgNSwgNiwgNywgOSwgMTEsIDE0LCAxNSwgMTYsIDE3LCAxOCwgMTksIDIwLCAyMSwgMjIsIDI0LCAyNiwgMjcsIDMwLCAzMSwgMzIsIDMzLCAzNCwgMzUsIDM2LCAzNywgMzgsIDM5LCA0MCwgNDEsIDQyLCA0MywgNDQsIDQ1LCA0Nl0sIFwiaW5jbHVzaXZlXCI6IHRydWUgfSwgXCJhY2NfZGVzY3JfbXVsdGlsaW5lXCI6IHsgXCJydWxlc1wiOiBbMTIsIDEzXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJhY2NfZGVzY3JcIjogeyBcInJ1bGVzXCI6IFsxMF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiYWNjX3RpdGxlXCI6IHsgXCJydWxlc1wiOiBbOF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwidGl0bGVcIjogeyBcInJ1bGVzXCI6IFtdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIm1kX3N0cmluZ1wiOiB7IFwicnVsZXNcIjogW10sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwic3RyaW5nXCI6IHsgXCJydWxlc1wiOiBbMjgsIDI5XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJJTklUSUFMXCI6IHsgXCJydWxlc1wiOiBbMCwgMSwgNCwgNSwgNiwgNywgOSwgMTEsIDE0LCAxNSwgMTYsIDE3LCAxOCwgMjEsIDIyLCAyNiwgMjcsIDMwLCAzMSwgMzIsIDMzLCAzNCwgMzUsIDM2LCAzNywgMzgsIDM5LCA0MCwgNDEsIDQyLCA0MywgNDQsIDQ1LCA0Nl0sIFwiaW5jbHVzaXZlXCI6IHRydWUgfSB9XG4gICAgfTtcbiAgICByZXR1cm4gbGV4ZXIyO1xuICB9KSgpO1xuICBwYXJzZXIyLmxleGVyID0gbGV4ZXI7XG4gIGZ1bmN0aW9uIFBhcnNlcigpIHtcbiAgICB0aGlzLnl5ID0ge307XG4gIH1cbiAgX19uYW1lKFBhcnNlciwgXCJQYXJzZXJcIik7XG4gIFBhcnNlci5wcm90b3R5cGUgPSBwYXJzZXIyO1xuICBwYXJzZXIyLlBhcnNlciA9IFBhcnNlcjtcbiAgcmV0dXJuIG5ldyBQYXJzZXIoKTtcbn0pKCk7XG5wYXJzZXIucGFyc2VyID0gcGFyc2VyO1xudmFyIHh5Y2hhcnRfZGVmYXVsdCA9IHBhcnNlcjtcblxuLy8gc3JjL2RpYWdyYW1zL3h5Y2hhcnQvY2hhcnRCdWlsZGVyL2ludGVyZmFjZXMudHNcbmZ1bmN0aW9uIGlzQmFyUGxvdChkYXRhKSB7XG4gIHJldHVybiBkYXRhLnR5cGUgPT09IFwiYmFyXCI7XG59XG5fX25hbWUoaXNCYXJQbG90LCBcImlzQmFyUGxvdFwiKTtcbmZ1bmN0aW9uIGlzQmFuZEF4aXNEYXRhKGRhdGEpIHtcbiAgcmV0dXJuIGRhdGEudHlwZSA9PT0gXCJiYW5kXCI7XG59XG5fX25hbWUoaXNCYW5kQXhpc0RhdGEsIFwiaXNCYW5kQXhpc0RhdGFcIik7XG5mdW5jdGlvbiBpc0xpbmVhckF4aXNEYXRhKGRhdGEpIHtcbiAgcmV0dXJuIGRhdGEudHlwZSA9PT0gXCJsaW5lYXJcIjtcbn1cbl9fbmFtZShpc0xpbmVhckF4aXNEYXRhLCBcImlzTGluZWFyQXhpc0RhdGFcIik7XG5cbi8vIHNyYy9kaWFncmFtcy94eWNoYXJ0L2NoYXJ0QnVpbGRlci90ZXh0RGltZW5zaW9uQ2FsY3VsYXRvci50c1xudmFyIFRleHREaW1lbnNpb25DYWxjdWxhdG9yV2l0aEZvbnQgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKHBhcmVudEdyb3VwKSB7XG4gICAgdGhpcy5wYXJlbnRHcm91cCA9IHBhcmVudEdyb3VwO1xuICB9XG4gIHN0YXRpYyB7XG4gICAgX19uYW1lKHRoaXMsIFwiVGV4dERpbWVuc2lvbkNhbGN1bGF0b3JXaXRoRm9udFwiKTtcbiAgfVxuICBnZXRNYXhEaW1lbnNpb24odGV4dHMsIGZvbnRTaXplKSB7XG4gICAgaWYgKCF0aGlzLnBhcmVudEdyb3VwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB3aWR0aDogdGV4dHMucmVkdWNlKChhY2MsIGN1cikgPT4gTWF0aC5tYXgoY3VyLmxlbmd0aCwgYWNjKSwgMCkgKiBmb250U2l6ZSxcbiAgICAgICAgaGVpZ2h0OiBmb250U2l6ZVxuICAgICAgfTtcbiAgICB9XG4gICAgY29uc3QgZGltZW5zaW9uID0ge1xuICAgICAgd2lkdGg6IDAsXG4gICAgICBoZWlnaHQ6IDBcbiAgICB9O1xuICAgIGNvbnN0IGVsZW0gPSB0aGlzLnBhcmVudEdyb3VwLmFwcGVuZChcImdcIikuYXR0cihcInZpc2liaWxpdHlcIiwgXCJoaWRkZW5cIikuYXR0cihcImZvbnQtc2l6ZVwiLCBmb250U2l6ZSk7XG4gICAgZm9yIChjb25zdCB0IG9mIHRleHRzKSB7XG4gICAgICBjb25zdCBiYm94ID0gY29tcHV0ZURpbWVuc2lvbk9mVGV4dChlbGVtLCAxLCB0KTtcbiAgICAgIGNvbnN0IHdpZHRoID0gYmJveCA/IGJib3gud2lkdGggOiB0Lmxlbmd0aCAqIGZvbnRTaXplO1xuICAgICAgY29uc3QgaGVpZ2h0ID0gYmJveCA/IGJib3guaGVpZ2h0IDogZm9udFNpemU7XG4gICAgICBkaW1lbnNpb24ud2lkdGggPSBNYXRoLm1heChkaW1lbnNpb24ud2lkdGgsIHdpZHRoKTtcbiAgICAgIGRpbWVuc2lvbi5oZWlnaHQgPSBNYXRoLm1heChkaW1lbnNpb24uaGVpZ2h0LCBoZWlnaHQpO1xuICAgIH1cbiAgICBlbGVtLnJlbW92ZSgpO1xuICAgIHJldHVybiBkaW1lbnNpb247XG4gIH1cbn07XG5cbi8vIHNyYy9kaWFncmFtcy94eWNoYXJ0L2NoYXJ0QnVpbGRlci9jb21wb25lbnRzL2F4aXMvYmFuZEF4aXMudHNcbmltcG9ydCB7IHNjYWxlQmFuZCB9IGZyb20gXCJkM1wiO1xuXG4vLyBzcmMvZGlhZ3JhbXMveHljaGFydC9jaGFydEJ1aWxkZXIvY29tcG9uZW50cy9heGlzL2Jhc2VBeGlzLnRzXG52YXIgQkFSX1dJRFRIX1RPX1RJQ0tfV0lEVEhfUkFUSU8gPSAwLjc7XG52YXIgTUFYX09VVEVSX1BBRERJTkdfUEVSQ0VOVF9GT1JfV1JUX0xBQkVMID0gMC4yO1xudmFyIEJhc2VBeGlzID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihheGlzQ29uZmlnLCB0aXRsZSwgdGV4dERpbWVuc2lvbkNhbGN1bGF0b3IsIGF4aXNUaGVtZUNvbmZpZykge1xuICAgIHRoaXMuYXhpc0NvbmZpZyA9IGF4aXNDb25maWc7XG4gICAgdGhpcy50aXRsZSA9IHRpdGxlO1xuICAgIHRoaXMudGV4dERpbWVuc2lvbkNhbGN1bGF0b3IgPSB0ZXh0RGltZW5zaW9uQ2FsY3VsYXRvcjtcbiAgICB0aGlzLmF4aXNUaGVtZUNvbmZpZyA9IGF4aXNUaGVtZUNvbmZpZztcbiAgICB0aGlzLmJvdW5kaW5nUmVjdCA9IHsgeDogMCwgeTogMCwgd2lkdGg6IDAsIGhlaWdodDogMCB9O1xuICAgIHRoaXMuYXhpc1Bvc2l0aW9uID0gXCJsZWZ0XCI7XG4gICAgdGhpcy5zaG93VGl0bGUgPSBmYWxzZTtcbiAgICB0aGlzLnNob3dMYWJlbCA9IGZhbHNlO1xuICAgIHRoaXMuc2hvd1RpY2sgPSBmYWxzZTtcbiAgICB0aGlzLnNob3dBeGlzTGluZSA9IGZhbHNlO1xuICAgIHRoaXMub3V0ZXJQYWRkaW5nID0gMDtcbiAgICB0aGlzLnRpdGxlVGV4dEhlaWdodCA9IDA7XG4gICAgdGhpcy5sYWJlbFRleHRIZWlnaHQgPSAwO1xuICAgIHRoaXMucmFuZ2UgPSBbMCwgMTBdO1xuICAgIHRoaXMuYm91bmRpbmdSZWN0ID0geyB4OiAwLCB5OiAwLCB3aWR0aDogMCwgaGVpZ2h0OiAwIH07XG4gICAgdGhpcy5heGlzUG9zaXRpb24gPSBcImxlZnRcIjtcbiAgfVxuICBzdGF0aWMge1xuICAgIF9fbmFtZSh0aGlzLCBcIkJhc2VBeGlzXCIpO1xuICB9XG4gIHNldFJhbmdlKHJhbmdlKSB7XG4gICAgdGhpcy5yYW5nZSA9IHJhbmdlO1xuICAgIGlmICh0aGlzLmF4aXNQb3NpdGlvbiA9PT0gXCJsZWZ0XCIgfHwgdGhpcy5heGlzUG9zaXRpb24gPT09IFwicmlnaHRcIikge1xuICAgICAgdGhpcy5ib3VuZGluZ1JlY3QuaGVpZ2h0ID0gcmFuZ2VbMV0gLSByYW5nZVswXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5ib3VuZGluZ1JlY3Qud2lkdGggPSByYW5nZVsxXSAtIHJhbmdlWzBdO1xuICAgIH1cbiAgICB0aGlzLnJlY2FsY3VsYXRlU2NhbGUoKTtcbiAgfVxuICBnZXRSYW5nZSgpIHtcbiAgICByZXR1cm4gW3RoaXMucmFuZ2VbMF0gKyB0aGlzLm91dGVyUGFkZGluZywgdGhpcy5yYW5nZVsxXSAtIHRoaXMub3V0ZXJQYWRkaW5nXTtcbiAgfVxuICBzZXRBeGlzUG9zaXRpb24oYXhpc1Bvc2l0aW9uKSB7XG4gICAgdGhpcy5heGlzUG9zaXRpb24gPSBheGlzUG9zaXRpb247XG4gICAgdGhpcy5zZXRSYW5nZSh0aGlzLnJhbmdlKTtcbiAgfVxuICBnZXRUaWNrRGlzdGFuY2UoKSB7XG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzLmdldFJhbmdlKCk7XG4gICAgcmV0dXJuIE1hdGguYWJzKHJhbmdlWzBdIC0gcmFuZ2VbMV0pIC8gdGhpcy5nZXRUaWNrVmFsdWVzKCkubGVuZ3RoO1xuICB9XG4gIGdldEF4aXNPdXRlclBhZGRpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMub3V0ZXJQYWRkaW5nO1xuICB9XG4gIGdldExhYmVsRGltZW5zaW9uKCkge1xuICAgIHJldHVybiB0aGlzLnRleHREaW1lbnNpb25DYWxjdWxhdG9yLmdldE1heERpbWVuc2lvbihcbiAgICAgIHRoaXMuZ2V0VGlja1ZhbHVlcygpLm1hcCgodGljaykgPT4gdGljay50b1N0cmluZygpKSxcbiAgICAgIHRoaXMuYXhpc0NvbmZpZy5sYWJlbEZvbnRTaXplXG4gICAgKTtcbiAgfVxuICByZWNhbGN1bGF0ZU91dGVyUGFkZGluZ1RvRHJhd0JhcigpIHtcbiAgICBpZiAoQkFSX1dJRFRIX1RPX1RJQ0tfV0lEVEhfUkFUSU8gKiB0aGlzLmdldFRpY2tEaXN0YW5jZSgpID4gdGhpcy5vdXRlclBhZGRpbmcgKiAyKSB7XG4gICAgICB0aGlzLm91dGVyUGFkZGluZyA9IE1hdGguZmxvb3IoQkFSX1dJRFRIX1RPX1RJQ0tfV0lEVEhfUkFUSU8gKiB0aGlzLmdldFRpY2tEaXN0YW5jZSgpIC8gMik7XG4gICAgfVxuICAgIHRoaXMucmVjYWxjdWxhdGVTY2FsZSgpO1xuICB9XG4gIGNhbGN1bGF0ZVNwYWNlSWZEcmF3bkhvcml6b250YWxseShhdmFpbGFibGVTcGFjZSkge1xuICAgIGxldCBhdmFpbGFibGVIZWlnaHQgPSBhdmFpbGFibGVTcGFjZS5oZWlnaHQ7XG4gICAgaWYgKHRoaXMuYXhpc0NvbmZpZy5zaG93QXhpc0xpbmUgJiYgYXZhaWxhYmxlSGVpZ2h0ID4gdGhpcy5heGlzQ29uZmlnLmF4aXNMaW5lV2lkdGgpIHtcbiAgICAgIGF2YWlsYWJsZUhlaWdodCAtPSB0aGlzLmF4aXNDb25maWcuYXhpc0xpbmVXaWR0aDtcbiAgICAgIHRoaXMuc2hvd0F4aXNMaW5lID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHRoaXMuYXhpc0NvbmZpZy5zaG93TGFiZWwpIHtcbiAgICAgIGNvbnN0IHNwYWNlUmVxdWlyZWQgPSB0aGlzLmdldExhYmVsRGltZW5zaW9uKCk7XG4gICAgICBjb25zdCBtYXhQYWRkaW5nID0gTUFYX09VVEVSX1BBRERJTkdfUEVSQ0VOVF9GT1JfV1JUX0xBQkVMICogYXZhaWxhYmxlU3BhY2Uud2lkdGg7XG4gICAgICB0aGlzLm91dGVyUGFkZGluZyA9IE1hdGgubWluKHNwYWNlUmVxdWlyZWQud2lkdGggLyAyLCBtYXhQYWRkaW5nKTtcbiAgICAgIGNvbnN0IGhlaWdodFJlcXVpcmVkID0gc3BhY2VSZXF1aXJlZC5oZWlnaHQgKyB0aGlzLmF4aXNDb25maWcubGFiZWxQYWRkaW5nICogMjtcbiAgICAgIHRoaXMubGFiZWxUZXh0SGVpZ2h0ID0gc3BhY2VSZXF1aXJlZC5oZWlnaHQ7XG4gICAgICBpZiAoaGVpZ2h0UmVxdWlyZWQgPD0gYXZhaWxhYmxlSGVpZ2h0KSB7XG4gICAgICAgIGF2YWlsYWJsZUhlaWdodCAtPSBoZWlnaHRSZXF1aXJlZDtcbiAgICAgICAgdGhpcy5zaG93TGFiZWwgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5heGlzQ29uZmlnLnNob3dUaWNrICYmIGF2YWlsYWJsZUhlaWdodCA+PSB0aGlzLmF4aXNDb25maWcudGlja0xlbmd0aCkge1xuICAgICAgdGhpcy5zaG93VGljayA9IHRydWU7XG4gICAgICBhdmFpbGFibGVIZWlnaHQgLT0gdGhpcy5heGlzQ29uZmlnLnRpY2tMZW5ndGg7XG4gICAgfVxuICAgIGlmICh0aGlzLmF4aXNDb25maWcuc2hvd1RpdGxlICYmIHRoaXMudGl0bGUpIHtcbiAgICAgIGNvbnN0IHNwYWNlUmVxdWlyZWQgPSB0aGlzLnRleHREaW1lbnNpb25DYWxjdWxhdG9yLmdldE1heERpbWVuc2lvbihcbiAgICAgICAgW3RoaXMudGl0bGVdLFxuICAgICAgICB0aGlzLmF4aXNDb25maWcudGl0bGVGb250U2l6ZVxuICAgICAgKTtcbiAgICAgIGNvbnN0IGhlaWdodFJlcXVpcmVkID0gc3BhY2VSZXF1aXJlZC5oZWlnaHQgKyB0aGlzLmF4aXNDb25maWcudGl0bGVQYWRkaW5nICogMjtcbiAgICAgIHRoaXMudGl0bGVUZXh0SGVpZ2h0ID0gc3BhY2VSZXF1aXJlZC5oZWlnaHQ7XG4gICAgICBpZiAoaGVpZ2h0UmVxdWlyZWQgPD0gYXZhaWxhYmxlSGVpZ2h0KSB7XG4gICAgICAgIGF2YWlsYWJsZUhlaWdodCAtPSBoZWlnaHRSZXF1aXJlZDtcbiAgICAgICAgdGhpcy5zaG93VGl0bGUgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmJvdW5kaW5nUmVjdC53aWR0aCA9IGF2YWlsYWJsZVNwYWNlLndpZHRoO1xuICAgIHRoaXMuYm91bmRpbmdSZWN0LmhlaWdodCA9IGF2YWlsYWJsZVNwYWNlLmhlaWdodCAtIGF2YWlsYWJsZUhlaWdodDtcbiAgfVxuICBjYWxjdWxhdGVTcGFjZUlmRHJhd25WZXJ0aWNhbChhdmFpbGFibGVTcGFjZSkge1xuICAgIGxldCBhdmFpbGFibGVXaWR0aCA9IGF2YWlsYWJsZVNwYWNlLndpZHRoO1xuICAgIGlmICh0aGlzLmF4aXNDb25maWcuc2hvd0F4aXNMaW5lICYmIGF2YWlsYWJsZVdpZHRoID4gdGhpcy5heGlzQ29uZmlnLmF4aXNMaW5lV2lkdGgpIHtcbiAgICAgIGF2YWlsYWJsZVdpZHRoIC09IHRoaXMuYXhpc0NvbmZpZy5heGlzTGluZVdpZHRoO1xuICAgICAgdGhpcy5zaG93QXhpc0xpbmUgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAodGhpcy5heGlzQ29uZmlnLnNob3dMYWJlbCkge1xuICAgICAgY29uc3Qgc3BhY2VSZXF1aXJlZCA9IHRoaXMuZ2V0TGFiZWxEaW1lbnNpb24oKTtcbiAgICAgIGNvbnN0IG1heFBhZGRpbmcgPSBNQVhfT1VURVJfUEFERElOR19QRVJDRU5UX0ZPUl9XUlRfTEFCRUwgKiBhdmFpbGFibGVTcGFjZS5oZWlnaHQ7XG4gICAgICB0aGlzLm91dGVyUGFkZGluZyA9IE1hdGgubWluKHNwYWNlUmVxdWlyZWQuaGVpZ2h0IC8gMiwgbWF4UGFkZGluZyk7XG4gICAgICBjb25zdCB3aWR0aFJlcXVpcmVkID0gc3BhY2VSZXF1aXJlZC53aWR0aCArIHRoaXMuYXhpc0NvbmZpZy5sYWJlbFBhZGRpbmcgKiAyO1xuICAgICAgaWYgKHdpZHRoUmVxdWlyZWQgPD0gYXZhaWxhYmxlV2lkdGgpIHtcbiAgICAgICAgYXZhaWxhYmxlV2lkdGggLT0gd2lkdGhSZXF1aXJlZDtcbiAgICAgICAgdGhpcy5zaG93TGFiZWwgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAodGhpcy5heGlzQ29uZmlnLnNob3dUaWNrICYmIGF2YWlsYWJsZVdpZHRoID49IHRoaXMuYXhpc0NvbmZpZy50aWNrTGVuZ3RoKSB7XG4gICAgICB0aGlzLnNob3dUaWNrID0gdHJ1ZTtcbiAgICAgIGF2YWlsYWJsZVdpZHRoIC09IHRoaXMuYXhpc0NvbmZpZy50aWNrTGVuZ3RoO1xuICAgIH1cbiAgICBpZiAodGhpcy5heGlzQ29uZmlnLnNob3dUaXRsZSAmJiB0aGlzLnRpdGxlKSB7XG4gICAgICBjb25zdCBzcGFjZVJlcXVpcmVkID0gdGhpcy50ZXh0RGltZW5zaW9uQ2FsY3VsYXRvci5nZXRNYXhEaW1lbnNpb24oXG4gICAgICAgIFt0aGlzLnRpdGxlXSxcbiAgICAgICAgdGhpcy5heGlzQ29uZmlnLnRpdGxlRm9udFNpemVcbiAgICAgICk7XG4gICAgICBjb25zdCB3aWR0aFJlcXVpcmVkID0gc3BhY2VSZXF1aXJlZC5oZWlnaHQgKyB0aGlzLmF4aXNDb25maWcudGl0bGVQYWRkaW5nICogMjtcbiAgICAgIHRoaXMudGl0bGVUZXh0SGVpZ2h0ID0gc3BhY2VSZXF1aXJlZC5oZWlnaHQ7XG4gICAgICBpZiAod2lkdGhSZXF1aXJlZCA8PSBhdmFpbGFibGVXaWR0aCkge1xuICAgICAgICBhdmFpbGFibGVXaWR0aCAtPSB3aWR0aFJlcXVpcmVkO1xuICAgICAgICB0aGlzLnNob3dUaXRsZSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuYm91bmRpbmdSZWN0LndpZHRoID0gYXZhaWxhYmxlU3BhY2Uud2lkdGggLSBhdmFpbGFibGVXaWR0aDtcbiAgICB0aGlzLmJvdW5kaW5nUmVjdC5oZWlnaHQgPSBhdmFpbGFibGVTcGFjZS5oZWlnaHQ7XG4gIH1cbiAgY2FsY3VsYXRlU3BhY2UoYXZhaWxhYmxlU3BhY2UpIHtcbiAgICBpZiAodGhpcy5heGlzUG9zaXRpb24gPT09IFwibGVmdFwiIHx8IHRoaXMuYXhpc1Bvc2l0aW9uID09PSBcInJpZ2h0XCIpIHtcbiAgICAgIHRoaXMuY2FsY3VsYXRlU3BhY2VJZkRyYXduVmVydGljYWwoYXZhaWxhYmxlU3BhY2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNhbGN1bGF0ZVNwYWNlSWZEcmF3bkhvcml6b250YWxseShhdmFpbGFibGVTcGFjZSk7XG4gICAgfVxuICAgIHRoaXMucmVjYWxjdWxhdGVTY2FsZSgpO1xuICAgIHJldHVybiB7XG4gICAgICB3aWR0aDogdGhpcy5ib3VuZGluZ1JlY3Qud2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMuYm91bmRpbmdSZWN0LmhlaWdodFxuICAgIH07XG4gIH1cbiAgc2V0Qm91bmRpbmdCb3hYWShwb2ludCkge1xuICAgIHRoaXMuYm91bmRpbmdSZWN0LnggPSBwb2ludC54O1xuICAgIHRoaXMuYm91bmRpbmdSZWN0LnkgPSBwb2ludC55O1xuICB9XG4gIGdldERyYXdhYmxlRWxlbWVudHNGb3JMZWZ0QXhpcygpIHtcbiAgICBjb25zdCBkcmF3YWJsZUVsZW1lbnQgPSBbXTtcbiAgICBpZiAodGhpcy5zaG93QXhpc0xpbmUpIHtcbiAgICAgIGNvbnN0IHggPSB0aGlzLmJvdW5kaW5nUmVjdC54ICsgdGhpcy5ib3VuZGluZ1JlY3Qud2lkdGggLSB0aGlzLmF4aXNDb25maWcuYXhpc0xpbmVXaWR0aCAvIDI7XG4gICAgICBkcmF3YWJsZUVsZW1lbnQucHVzaCh7XG4gICAgICAgIHR5cGU6IFwicGF0aFwiLFxuICAgICAgICBncm91cFRleHRzOiBbXCJsZWZ0LWF4aXNcIiwgXCJheGlzbC1saW5lXCJdLFxuICAgICAgICBkYXRhOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgcGF0aDogYE0gJHt4fSwke3RoaXMuYm91bmRpbmdSZWN0Lnl9IEwgJHt4fSwke3RoaXMuYm91bmRpbmdSZWN0LnkgKyB0aGlzLmJvdW5kaW5nUmVjdC5oZWlnaHR9IGAsXG4gICAgICAgICAgICBzdHJva2VGaWxsOiB0aGlzLmF4aXNUaGVtZUNvbmZpZy5heGlzTGluZUNvbG9yLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IHRoaXMuYXhpc0NvbmZpZy5heGlzTGluZVdpZHRoXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuc2hvd0xhYmVsKSB7XG4gICAgICBkcmF3YWJsZUVsZW1lbnQucHVzaCh7XG4gICAgICAgIHR5cGU6IFwidGV4dFwiLFxuICAgICAgICBncm91cFRleHRzOiBbXCJsZWZ0LWF4aXNcIiwgXCJsYWJlbFwiXSxcbiAgICAgICAgZGF0YTogdGhpcy5nZXRUaWNrVmFsdWVzKCkubWFwKCh0aWNrKSA9PiAoe1xuICAgICAgICAgIHRleHQ6IHRpY2sudG9TdHJpbmcoKSxcbiAgICAgICAgICB4OiB0aGlzLmJvdW5kaW5nUmVjdC54ICsgdGhpcy5ib3VuZGluZ1JlY3Qud2lkdGggLSAodGhpcy5zaG93TGFiZWwgPyB0aGlzLmF4aXNDb25maWcubGFiZWxQYWRkaW5nIDogMCkgLSAodGhpcy5zaG93VGljayA/IHRoaXMuYXhpc0NvbmZpZy50aWNrTGVuZ3RoIDogMCkgLSAodGhpcy5zaG93QXhpc0xpbmUgPyB0aGlzLmF4aXNDb25maWcuYXhpc0xpbmVXaWR0aCA6IDApLFxuICAgICAgICAgIHk6IHRoaXMuZ2V0U2NhbGVWYWx1ZSh0aWNrKSxcbiAgICAgICAgICBmaWxsOiB0aGlzLmF4aXNUaGVtZUNvbmZpZy5sYWJlbENvbG9yLFxuICAgICAgICAgIGZvbnRTaXplOiB0aGlzLmF4aXNDb25maWcubGFiZWxGb250U2l6ZSxcbiAgICAgICAgICByb3RhdGlvbjogMCxcbiAgICAgICAgICB2ZXJ0aWNhbFBvczogXCJtaWRkbGVcIixcbiAgICAgICAgICBob3Jpem9udGFsUG9zOiBcInJpZ2h0XCJcbiAgICAgICAgfSkpXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuc2hvd1RpY2spIHtcbiAgICAgIGNvbnN0IHggPSB0aGlzLmJvdW5kaW5nUmVjdC54ICsgdGhpcy5ib3VuZGluZ1JlY3Qud2lkdGggLSAodGhpcy5zaG93QXhpc0xpbmUgPyB0aGlzLmF4aXNDb25maWcuYXhpc0xpbmVXaWR0aCA6IDApO1xuICAgICAgZHJhd2FibGVFbGVtZW50LnB1c2goe1xuICAgICAgICB0eXBlOiBcInBhdGhcIixcbiAgICAgICAgZ3JvdXBUZXh0czogW1wibGVmdC1heGlzXCIsIFwidGlja3NcIl0sXG4gICAgICAgIGRhdGE6IHRoaXMuZ2V0VGlja1ZhbHVlcygpLm1hcCgodGljaykgPT4gKHtcbiAgICAgICAgICBwYXRoOiBgTSAke3h9LCR7dGhpcy5nZXRTY2FsZVZhbHVlKHRpY2spfSBMICR7eCAtIHRoaXMuYXhpc0NvbmZpZy50aWNrTGVuZ3RofSwke3RoaXMuZ2V0U2NhbGVWYWx1ZSh0aWNrKX1gLFxuICAgICAgICAgIHN0cm9rZUZpbGw6IHRoaXMuYXhpc1RoZW1lQ29uZmlnLnRpY2tDb2xvcixcbiAgICAgICAgICBzdHJva2VXaWR0aDogdGhpcy5heGlzQ29uZmlnLnRpY2tXaWR0aFxuICAgICAgICB9KSlcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5zaG93VGl0bGUpIHtcbiAgICAgIGRyYXdhYmxlRWxlbWVudC5wdXNoKHtcbiAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gICAgICAgIGdyb3VwVGV4dHM6IFtcImxlZnQtYXhpc1wiLCBcInRpdGxlXCJdLFxuICAgICAgICBkYXRhOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgdGV4dDogdGhpcy50aXRsZSxcbiAgICAgICAgICAgIHg6IHRoaXMuYm91bmRpbmdSZWN0LnggKyB0aGlzLmF4aXNDb25maWcudGl0bGVQYWRkaW5nLFxuICAgICAgICAgICAgeTogdGhpcy5ib3VuZGluZ1JlY3QueSArIHRoaXMuYm91bmRpbmdSZWN0LmhlaWdodCAvIDIsXG4gICAgICAgICAgICBmaWxsOiB0aGlzLmF4aXNUaGVtZUNvbmZpZy50aXRsZUNvbG9yLFxuICAgICAgICAgICAgZm9udFNpemU6IHRoaXMuYXhpc0NvbmZpZy50aXRsZUZvbnRTaXplLFxuICAgICAgICAgICAgcm90YXRpb246IDI3MCxcbiAgICAgICAgICAgIHZlcnRpY2FsUG9zOiBcInRvcFwiLFxuICAgICAgICAgICAgaG9yaXpvbnRhbFBvczogXCJjZW50ZXJcIlxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBkcmF3YWJsZUVsZW1lbnQ7XG4gIH1cbiAgZ2V0RHJhd2FibGVFbGVtZW50c0ZvckJvdHRvbUF4aXMoKSB7XG4gICAgY29uc3QgZHJhd2FibGVFbGVtZW50ID0gW107XG4gICAgaWYgKHRoaXMuc2hvd0F4aXNMaW5lKSB7XG4gICAgICBjb25zdCB5ID0gdGhpcy5ib3VuZGluZ1JlY3QueSArIHRoaXMuYXhpc0NvbmZpZy5heGlzTGluZVdpZHRoIC8gMjtcbiAgICAgIGRyYXdhYmxlRWxlbWVudC5wdXNoKHtcbiAgICAgICAgdHlwZTogXCJwYXRoXCIsXG4gICAgICAgIGdyb3VwVGV4dHM6IFtcImJvdHRvbS1heGlzXCIsIFwiYXhpcy1saW5lXCJdLFxuICAgICAgICBkYXRhOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgcGF0aDogYE0gJHt0aGlzLmJvdW5kaW5nUmVjdC54fSwke3l9IEwgJHt0aGlzLmJvdW5kaW5nUmVjdC54ICsgdGhpcy5ib3VuZGluZ1JlY3Qud2lkdGh9LCR7eX1gLFxuICAgICAgICAgICAgc3Ryb2tlRmlsbDogdGhpcy5heGlzVGhlbWVDb25maWcuYXhpc0xpbmVDb2xvcixcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiB0aGlzLmF4aXNDb25maWcuYXhpc0xpbmVXaWR0aFxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnNob3dMYWJlbCkge1xuICAgICAgZHJhd2FibGVFbGVtZW50LnB1c2goe1xuICAgICAgICB0eXBlOiBcInRleHRcIixcbiAgICAgICAgZ3JvdXBUZXh0czogW1wiYm90dG9tLWF4aXNcIiwgXCJsYWJlbFwiXSxcbiAgICAgICAgZGF0YTogdGhpcy5nZXRUaWNrVmFsdWVzKCkubWFwKCh0aWNrKSA9PiAoe1xuICAgICAgICAgIHRleHQ6IHRpY2sudG9TdHJpbmcoKSxcbiAgICAgICAgICB4OiB0aGlzLmdldFNjYWxlVmFsdWUodGljayksXG4gICAgICAgICAgeTogdGhpcy5ib3VuZGluZ1JlY3QueSArIHRoaXMuYXhpc0NvbmZpZy5sYWJlbFBhZGRpbmcgKyAodGhpcy5zaG93VGljayA/IHRoaXMuYXhpc0NvbmZpZy50aWNrTGVuZ3RoIDogMCkgKyAodGhpcy5zaG93QXhpc0xpbmUgPyB0aGlzLmF4aXNDb25maWcuYXhpc0xpbmVXaWR0aCA6IDApLFxuICAgICAgICAgIGZpbGw6IHRoaXMuYXhpc1RoZW1lQ29uZmlnLmxhYmVsQ29sb3IsXG4gICAgICAgICAgZm9udFNpemU6IHRoaXMuYXhpc0NvbmZpZy5sYWJlbEZvbnRTaXplLFxuICAgICAgICAgIHJvdGF0aW9uOiAwLFxuICAgICAgICAgIHZlcnRpY2FsUG9zOiBcInRvcFwiLFxuICAgICAgICAgIGhvcml6b250YWxQb3M6IFwiY2VudGVyXCJcbiAgICAgICAgfSkpXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuc2hvd1RpY2spIHtcbiAgICAgIGNvbnN0IHkgPSB0aGlzLmJvdW5kaW5nUmVjdC55ICsgKHRoaXMuc2hvd0F4aXNMaW5lID8gdGhpcy5heGlzQ29uZmlnLmF4aXNMaW5lV2lkdGggOiAwKTtcbiAgICAgIGRyYXdhYmxlRWxlbWVudC5wdXNoKHtcbiAgICAgICAgdHlwZTogXCJwYXRoXCIsXG4gICAgICAgIGdyb3VwVGV4dHM6IFtcImJvdHRvbS1heGlzXCIsIFwidGlja3NcIl0sXG4gICAgICAgIGRhdGE6IHRoaXMuZ2V0VGlja1ZhbHVlcygpLm1hcCgodGljaykgPT4gKHtcbiAgICAgICAgICBwYXRoOiBgTSAke3RoaXMuZ2V0U2NhbGVWYWx1ZSh0aWNrKX0sJHt5fSBMICR7dGhpcy5nZXRTY2FsZVZhbHVlKHRpY2spfSwke3kgKyB0aGlzLmF4aXNDb25maWcudGlja0xlbmd0aH1gLFxuICAgICAgICAgIHN0cm9rZUZpbGw6IHRoaXMuYXhpc1RoZW1lQ29uZmlnLnRpY2tDb2xvcixcbiAgICAgICAgICBzdHJva2VXaWR0aDogdGhpcy5heGlzQ29uZmlnLnRpY2tXaWR0aFxuICAgICAgICB9KSlcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5zaG93VGl0bGUpIHtcbiAgICAgIGRyYXdhYmxlRWxlbWVudC5wdXNoKHtcbiAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gICAgICAgIGdyb3VwVGV4dHM6IFtcImJvdHRvbS1heGlzXCIsIFwidGl0bGVcIl0sXG4gICAgICAgIGRhdGE6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiB0aGlzLnRpdGxlLFxuICAgICAgICAgICAgeDogdGhpcy5yYW5nZVswXSArICh0aGlzLnJhbmdlWzFdIC0gdGhpcy5yYW5nZVswXSkgLyAyLFxuICAgICAgICAgICAgeTogdGhpcy5ib3VuZGluZ1JlY3QueSArIHRoaXMuYm91bmRpbmdSZWN0LmhlaWdodCAtIHRoaXMuYXhpc0NvbmZpZy50aXRsZVBhZGRpbmcgLSB0aGlzLnRpdGxlVGV4dEhlaWdodCxcbiAgICAgICAgICAgIGZpbGw6IHRoaXMuYXhpc1RoZW1lQ29uZmlnLnRpdGxlQ29sb3IsXG4gICAgICAgICAgICBmb250U2l6ZTogdGhpcy5heGlzQ29uZmlnLnRpdGxlRm9udFNpemUsXG4gICAgICAgICAgICByb3RhdGlvbjogMCxcbiAgICAgICAgICAgIHZlcnRpY2FsUG9zOiBcInRvcFwiLFxuICAgICAgICAgICAgaG9yaXpvbnRhbFBvczogXCJjZW50ZXJcIlxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBkcmF3YWJsZUVsZW1lbnQ7XG4gIH1cbiAgZ2V0RHJhd2FibGVFbGVtZW50c0ZvclRvcEF4aXMoKSB7XG4gICAgY29uc3QgZHJhd2FibGVFbGVtZW50ID0gW107XG4gICAgaWYgKHRoaXMuc2hvd0F4aXNMaW5lKSB7XG4gICAgICBjb25zdCB5ID0gdGhpcy5ib3VuZGluZ1JlY3QueSArIHRoaXMuYm91bmRpbmdSZWN0LmhlaWdodCAtIHRoaXMuYXhpc0NvbmZpZy5heGlzTGluZVdpZHRoIC8gMjtcbiAgICAgIGRyYXdhYmxlRWxlbWVudC5wdXNoKHtcbiAgICAgICAgdHlwZTogXCJwYXRoXCIsXG4gICAgICAgIGdyb3VwVGV4dHM6IFtcInRvcC1heGlzXCIsIFwiYXhpcy1saW5lXCJdLFxuICAgICAgICBkYXRhOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgcGF0aDogYE0gJHt0aGlzLmJvdW5kaW5nUmVjdC54fSwke3l9IEwgJHt0aGlzLmJvdW5kaW5nUmVjdC54ICsgdGhpcy5ib3VuZGluZ1JlY3Qud2lkdGh9LCR7eX1gLFxuICAgICAgICAgICAgc3Ryb2tlRmlsbDogdGhpcy5heGlzVGhlbWVDb25maWcuYXhpc0xpbmVDb2xvcixcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiB0aGlzLmF4aXNDb25maWcuYXhpc0xpbmVXaWR0aFxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnNob3dMYWJlbCkge1xuICAgICAgZHJhd2FibGVFbGVtZW50LnB1c2goe1xuICAgICAgICB0eXBlOiBcInRleHRcIixcbiAgICAgICAgZ3JvdXBUZXh0czogW1widG9wLWF4aXNcIiwgXCJsYWJlbFwiXSxcbiAgICAgICAgZGF0YTogdGhpcy5nZXRUaWNrVmFsdWVzKCkubWFwKCh0aWNrKSA9PiAoe1xuICAgICAgICAgIHRleHQ6IHRpY2sudG9TdHJpbmcoKSxcbiAgICAgICAgICB4OiB0aGlzLmdldFNjYWxlVmFsdWUodGljayksXG4gICAgICAgICAgeTogdGhpcy5ib3VuZGluZ1JlY3QueSArICh0aGlzLnNob3dUaXRsZSA/IHRoaXMudGl0bGVUZXh0SGVpZ2h0ICsgdGhpcy5heGlzQ29uZmlnLnRpdGxlUGFkZGluZyAqIDIgOiAwKSArIHRoaXMuYXhpc0NvbmZpZy5sYWJlbFBhZGRpbmcsXG4gICAgICAgICAgZmlsbDogdGhpcy5heGlzVGhlbWVDb25maWcubGFiZWxDb2xvcixcbiAgICAgICAgICBmb250U2l6ZTogdGhpcy5heGlzQ29uZmlnLmxhYmVsRm9udFNpemUsXG4gICAgICAgICAgcm90YXRpb246IDAsXG4gICAgICAgICAgdmVydGljYWxQb3M6IFwidG9wXCIsXG4gICAgICAgICAgaG9yaXpvbnRhbFBvczogXCJjZW50ZXJcIlxuICAgICAgICB9KSlcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5zaG93VGljaykge1xuICAgICAgY29uc3QgeSA9IHRoaXMuYm91bmRpbmdSZWN0Lnk7XG4gICAgICBkcmF3YWJsZUVsZW1lbnQucHVzaCh7XG4gICAgICAgIHR5cGU6IFwicGF0aFwiLFxuICAgICAgICBncm91cFRleHRzOiBbXCJ0b3AtYXhpc1wiLCBcInRpY2tzXCJdLFxuICAgICAgICBkYXRhOiB0aGlzLmdldFRpY2tWYWx1ZXMoKS5tYXAoKHRpY2spID0+ICh7XG4gICAgICAgICAgcGF0aDogYE0gJHt0aGlzLmdldFNjYWxlVmFsdWUodGljayl9LCR7eSArIHRoaXMuYm91bmRpbmdSZWN0LmhlaWdodCAtICh0aGlzLnNob3dBeGlzTGluZSA/IHRoaXMuYXhpc0NvbmZpZy5heGlzTGluZVdpZHRoIDogMCl9IEwgJHt0aGlzLmdldFNjYWxlVmFsdWUodGljayl9LCR7eSArIHRoaXMuYm91bmRpbmdSZWN0LmhlaWdodCAtIHRoaXMuYXhpc0NvbmZpZy50aWNrTGVuZ3RoIC0gKHRoaXMuc2hvd0F4aXNMaW5lID8gdGhpcy5heGlzQ29uZmlnLmF4aXNMaW5lV2lkdGggOiAwKX1gLFxuICAgICAgICAgIHN0cm9rZUZpbGw6IHRoaXMuYXhpc1RoZW1lQ29uZmlnLnRpY2tDb2xvcixcbiAgICAgICAgICBzdHJva2VXaWR0aDogdGhpcy5heGlzQ29uZmlnLnRpY2tXaWR0aFxuICAgICAgICB9KSlcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5zaG93VGl0bGUpIHtcbiAgICAgIGRyYXdhYmxlRWxlbWVudC5wdXNoKHtcbiAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXG4gICAgICAgIGdyb3VwVGV4dHM6IFtcInRvcC1heGlzXCIsIFwidGl0bGVcIl0sXG4gICAgICAgIGRhdGE6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiB0aGlzLnRpdGxlLFxuICAgICAgICAgICAgeDogdGhpcy5ib3VuZGluZ1JlY3QueCArIHRoaXMuYm91bmRpbmdSZWN0LndpZHRoIC8gMixcbiAgICAgICAgICAgIHk6IHRoaXMuYm91bmRpbmdSZWN0LnkgKyB0aGlzLmF4aXNDb25maWcudGl0bGVQYWRkaW5nLFxuICAgICAgICAgICAgZmlsbDogdGhpcy5heGlzVGhlbWVDb25maWcudGl0bGVDb2xvcixcbiAgICAgICAgICAgIGZvbnRTaXplOiB0aGlzLmF4aXNDb25maWcudGl0bGVGb250U2l6ZSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiAwLFxuICAgICAgICAgICAgdmVydGljYWxQb3M6IFwidG9wXCIsXG4gICAgICAgICAgICBob3Jpem9udGFsUG9zOiBcImNlbnRlclwiXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGRyYXdhYmxlRWxlbWVudDtcbiAgfVxuICBnZXREcmF3YWJsZUVsZW1lbnRzKCkge1xuICAgIGlmICh0aGlzLmF4aXNQb3NpdGlvbiA9PT0gXCJsZWZ0XCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldERyYXdhYmxlRWxlbWVudHNGb3JMZWZ0QXhpcygpO1xuICAgIH1cbiAgICBpZiAodGhpcy5heGlzUG9zaXRpb24gPT09IFwicmlnaHRcIikge1xuICAgICAgdGhyb3cgRXJyb3IoXCJEcmF3aW5nIG9mIHJpZ2h0IGF4aXMgaXMgbm90IGltcGxlbWVudGVkXCIpO1xuICAgIH1cbiAgICBpZiAodGhpcy5heGlzUG9zaXRpb24gPT09IFwiYm90dG9tXCIpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldERyYXdhYmxlRWxlbWVudHNGb3JCb3R0b21BeGlzKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLmF4aXNQb3NpdGlvbiA9PT0gXCJ0b3BcIikge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0RHJhd2FibGVFbGVtZW50c0ZvclRvcEF4aXMoKTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMveHljaGFydC9jaGFydEJ1aWxkZXIvY29tcG9uZW50cy9heGlzL2JhbmRBeGlzLnRzXG52YXIgQmFuZEF4aXMgPSBjbGFzcyBleHRlbmRzIEJhc2VBeGlzIHtcbiAgc3RhdGljIHtcbiAgICBfX25hbWUodGhpcywgXCJCYW5kQXhpc1wiKTtcbiAgfVxuICBjb25zdHJ1Y3RvcihheGlzQ29uZmlnLCBheGlzVGhlbWVDb25maWcsIGNhdGVnb3JpZXMsIHRpdGxlLCB0ZXh0RGltZW5zaW9uQ2FsY3VsYXRvcikge1xuICAgIHN1cGVyKGF4aXNDb25maWcsIHRpdGxlLCB0ZXh0RGltZW5zaW9uQ2FsY3VsYXRvciwgYXhpc1RoZW1lQ29uZmlnKTtcbiAgICB0aGlzLmNhdGVnb3JpZXMgPSBjYXRlZ29yaWVzO1xuICAgIHRoaXMuc2NhbGUgPSBzY2FsZUJhbmQoKS5kb21haW4odGhpcy5jYXRlZ29yaWVzKS5yYW5nZSh0aGlzLmdldFJhbmdlKCkpO1xuICB9XG4gIHNldFJhbmdlKHJhbmdlKSB7XG4gICAgc3VwZXIuc2V0UmFuZ2UocmFuZ2UpO1xuICB9XG4gIHJlY2FsY3VsYXRlU2NhbGUoKSB7XG4gICAgdGhpcy5zY2FsZSA9IHNjYWxlQmFuZCgpLmRvbWFpbih0aGlzLmNhdGVnb3JpZXMpLnJhbmdlKHRoaXMuZ2V0UmFuZ2UoKSkucGFkZGluZ0lubmVyKDEpLnBhZGRpbmdPdXRlcigwKS5hbGlnbigwLjUpO1xuICAgIGxvZy50cmFjZShcIkJhbmRBeGlzIGF4aXMgZmluYWwgY2F0ZWdvcmllcywgcmFuZ2U6IFwiLCB0aGlzLmNhdGVnb3JpZXMsIHRoaXMuZ2V0UmFuZ2UoKSk7XG4gIH1cbiAgZ2V0VGlja1ZhbHVlcygpIHtcbiAgICByZXR1cm4gdGhpcy5jYXRlZ29yaWVzO1xuICB9XG4gIGdldFNjYWxlVmFsdWUodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5zY2FsZSh2YWx1ZSkgPz8gdGhpcy5nZXRSYW5nZSgpWzBdO1xuICB9XG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMveHljaGFydC9jaGFydEJ1aWxkZXIvY29tcG9uZW50cy9heGlzL2xpbmVhckF4aXMudHNcbmltcG9ydCB7IHNjYWxlTGluZWFyIH0gZnJvbSBcImQzXCI7XG52YXIgTGluZWFyQXhpcyA9IGNsYXNzIGV4dGVuZHMgQmFzZUF4aXMge1xuICBzdGF0aWMge1xuICAgIF9fbmFtZSh0aGlzLCBcIkxpbmVhckF4aXNcIik7XG4gIH1cbiAgY29uc3RydWN0b3IoYXhpc0NvbmZpZywgYXhpc1RoZW1lQ29uZmlnLCBkb21haW4sIHRpdGxlLCB0ZXh0RGltZW5zaW9uQ2FsY3VsYXRvcikge1xuICAgIHN1cGVyKGF4aXNDb25maWcsIHRpdGxlLCB0ZXh0RGltZW5zaW9uQ2FsY3VsYXRvciwgYXhpc1RoZW1lQ29uZmlnKTtcbiAgICB0aGlzLmRvbWFpbiA9IGRvbWFpbjtcbiAgICB0aGlzLnNjYWxlID0gc2NhbGVMaW5lYXIoKS5kb21haW4odGhpcy5kb21haW4pLnJhbmdlKHRoaXMuZ2V0UmFuZ2UoKSk7XG4gIH1cbiAgZ2V0VGlja1ZhbHVlcygpIHtcbiAgICByZXR1cm4gdGhpcy5zY2FsZS50aWNrcygpO1xuICB9XG4gIHJlY2FsY3VsYXRlU2NhbGUoKSB7XG4gICAgY29uc3QgZG9tYWluID0gWy4uLnRoaXMuZG9tYWluXTtcbiAgICBpZiAodGhpcy5heGlzUG9zaXRpb24gPT09IFwibGVmdFwiKSB7XG4gICAgICBkb21haW4ucmV2ZXJzZSgpO1xuICAgIH1cbiAgICB0aGlzLnNjYWxlID0gc2NhbGVMaW5lYXIoKS5kb21haW4oZG9tYWluKS5yYW5nZSh0aGlzLmdldFJhbmdlKCkpO1xuICB9XG4gIGdldFNjYWxlVmFsdWUodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5zY2FsZSh2YWx1ZSk7XG4gIH1cbn07XG5cbi8vIHNyYy9kaWFncmFtcy94eWNoYXJ0L2NoYXJ0QnVpbGRlci9jb21wb25lbnRzL2F4aXMvaW5kZXgudHNcbmZ1bmN0aW9uIGdldEF4aXMoZGF0YSwgYXhpc0NvbmZpZywgYXhpc1RoZW1lQ29uZmlnLCB0bXBTVkdHcm91cDIpIHtcbiAgY29uc3QgdGV4dERpbWVuc2lvbkNhbGN1bGF0b3IgPSBuZXcgVGV4dERpbWVuc2lvbkNhbGN1bGF0b3JXaXRoRm9udCh0bXBTVkdHcm91cDIpO1xuICBpZiAoaXNCYW5kQXhpc0RhdGEoZGF0YSkpIHtcbiAgICByZXR1cm4gbmV3IEJhbmRBeGlzKFxuICAgICAgYXhpc0NvbmZpZyxcbiAgICAgIGF4aXNUaGVtZUNvbmZpZyxcbiAgICAgIGRhdGEuY2F0ZWdvcmllcyxcbiAgICAgIGRhdGEudGl0bGUsXG4gICAgICB0ZXh0RGltZW5zaW9uQ2FsY3VsYXRvclxuICAgICk7XG4gIH1cbiAgcmV0dXJuIG5ldyBMaW5lYXJBeGlzKFxuICAgIGF4aXNDb25maWcsXG4gICAgYXhpc1RoZW1lQ29uZmlnLFxuICAgIFtkYXRhLm1pbiwgZGF0YS5tYXhdLFxuICAgIGRhdGEudGl0bGUsXG4gICAgdGV4dERpbWVuc2lvbkNhbGN1bGF0b3JcbiAgKTtcbn1cbl9fbmFtZShnZXRBeGlzLCBcImdldEF4aXNcIik7XG5cbi8vIHNyYy9kaWFncmFtcy94eWNoYXJ0L2NoYXJ0QnVpbGRlci9jb21wb25lbnRzL2NoYXJ0VGl0bGUudHNcbnZhciBDaGFydFRpdGxlID0gY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcih0ZXh0RGltZW5zaW9uQ2FsY3VsYXRvciwgY2hhcnRDb25maWcsIGNoYXJ0RGF0YSwgY2hhcnRUaGVtZUNvbmZpZykge1xuICAgIHRoaXMudGV4dERpbWVuc2lvbkNhbGN1bGF0b3IgPSB0ZXh0RGltZW5zaW9uQ2FsY3VsYXRvcjtcbiAgICB0aGlzLmNoYXJ0Q29uZmlnID0gY2hhcnRDb25maWc7XG4gICAgdGhpcy5jaGFydERhdGEgPSBjaGFydERhdGE7XG4gICAgdGhpcy5jaGFydFRoZW1lQ29uZmlnID0gY2hhcnRUaGVtZUNvbmZpZztcbiAgICB0aGlzLmJvdW5kaW5nUmVjdCA9IHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwLFxuICAgICAgd2lkdGg6IDAsXG4gICAgICBoZWlnaHQ6IDBcbiAgICB9O1xuICAgIHRoaXMuc2hvd0NoYXJ0VGl0bGUgPSBmYWxzZTtcbiAgfVxuICBzdGF0aWMge1xuICAgIF9fbmFtZSh0aGlzLCBcIkNoYXJ0VGl0bGVcIik7XG4gIH1cbiAgc2V0Qm91bmRpbmdCb3hYWShwb2ludCkge1xuICAgIHRoaXMuYm91bmRpbmdSZWN0LnggPSBwb2ludC54O1xuICAgIHRoaXMuYm91bmRpbmdSZWN0LnkgPSBwb2ludC55O1xuICB9XG4gIGNhbGN1bGF0ZVNwYWNlKGF2YWlsYWJsZVNwYWNlKSB7XG4gICAgY29uc3QgdGl0bGVEaW1lbnNpb24gPSB0aGlzLnRleHREaW1lbnNpb25DYWxjdWxhdG9yLmdldE1heERpbWVuc2lvbihcbiAgICAgIFt0aGlzLmNoYXJ0RGF0YS50aXRsZV0sXG4gICAgICB0aGlzLmNoYXJ0Q29uZmlnLnRpdGxlRm9udFNpemVcbiAgICApO1xuICAgIGNvbnN0IHdpZHRoUmVxdWlyZWQgPSBNYXRoLm1heCh0aXRsZURpbWVuc2lvbi53aWR0aCwgYXZhaWxhYmxlU3BhY2Uud2lkdGgpO1xuICAgIGNvbnN0IGhlaWdodFJlcXVpcmVkID0gdGl0bGVEaW1lbnNpb24uaGVpZ2h0ICsgMiAqIHRoaXMuY2hhcnRDb25maWcudGl0bGVQYWRkaW5nO1xuICAgIGlmICh0aXRsZURpbWVuc2lvbi53aWR0aCA8PSB3aWR0aFJlcXVpcmVkICYmIHRpdGxlRGltZW5zaW9uLmhlaWdodCA8PSBoZWlnaHRSZXF1aXJlZCAmJiB0aGlzLmNoYXJ0Q29uZmlnLnNob3dUaXRsZSAmJiB0aGlzLmNoYXJ0RGF0YS50aXRsZSkge1xuICAgICAgdGhpcy5ib3VuZGluZ1JlY3Qud2lkdGggPSB3aWR0aFJlcXVpcmVkO1xuICAgICAgdGhpcy5ib3VuZGluZ1JlY3QuaGVpZ2h0ID0gaGVpZ2h0UmVxdWlyZWQ7XG4gICAgICB0aGlzLnNob3dDaGFydFRpdGxlID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoOiB0aGlzLmJvdW5kaW5nUmVjdC53aWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5ib3VuZGluZ1JlY3QuaGVpZ2h0XG4gICAgfTtcbiAgfVxuICBnZXREcmF3YWJsZUVsZW1lbnRzKCkge1xuICAgIGNvbnN0IGRyYXdhYmxlRWxlbSA9IFtdO1xuICAgIGlmICh0aGlzLnNob3dDaGFydFRpdGxlKSB7XG4gICAgICBkcmF3YWJsZUVsZW0ucHVzaCh7XG4gICAgICAgIGdyb3VwVGV4dHM6IFtcImNoYXJ0LXRpdGxlXCJdLFxuICAgICAgICB0eXBlOiBcInRleHRcIixcbiAgICAgICAgZGF0YTogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGZvbnRTaXplOiB0aGlzLmNoYXJ0Q29uZmlnLnRpdGxlRm9udFNpemUsXG4gICAgICAgICAgICB0ZXh0OiB0aGlzLmNoYXJ0RGF0YS50aXRsZSxcbiAgICAgICAgICAgIHZlcnRpY2FsUG9zOiBcIm1pZGRsZVwiLFxuICAgICAgICAgICAgaG9yaXpvbnRhbFBvczogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIHg6IHRoaXMuYm91bmRpbmdSZWN0LnggKyB0aGlzLmJvdW5kaW5nUmVjdC53aWR0aCAvIDIsXG4gICAgICAgICAgICB5OiB0aGlzLmJvdW5kaW5nUmVjdC55ICsgdGhpcy5ib3VuZGluZ1JlY3QuaGVpZ2h0IC8gMixcbiAgICAgICAgICAgIGZpbGw6IHRoaXMuY2hhcnRUaGVtZUNvbmZpZy50aXRsZUNvbG9yLFxuICAgICAgICAgICAgcm90YXRpb246IDBcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZHJhd2FibGVFbGVtO1xuICB9XG59O1xuZnVuY3Rpb24gZ2V0Q2hhcnRUaXRsZUNvbXBvbmVudChjaGFydENvbmZpZywgY2hhcnREYXRhLCBjaGFydFRoZW1lQ29uZmlnLCB0bXBTVkdHcm91cDIpIHtcbiAgY29uc3QgdGV4dERpbWVuc2lvbkNhbGN1bGF0b3IgPSBuZXcgVGV4dERpbWVuc2lvbkNhbGN1bGF0b3JXaXRoRm9udCh0bXBTVkdHcm91cDIpO1xuICByZXR1cm4gbmV3IENoYXJ0VGl0bGUodGV4dERpbWVuc2lvbkNhbGN1bGF0b3IsIGNoYXJ0Q29uZmlnLCBjaGFydERhdGEsIGNoYXJ0VGhlbWVDb25maWcpO1xufVxuX19uYW1lKGdldENoYXJ0VGl0bGVDb21wb25lbnQsIFwiZ2V0Q2hhcnRUaXRsZUNvbXBvbmVudFwiKTtcblxuLy8gc3JjL2RpYWdyYW1zL3h5Y2hhcnQvY2hhcnRCdWlsZGVyL2NvbXBvbmVudHMvcGxvdC9saW5lUGxvdC50c1xuaW1wb3J0IHsgbGluZSB9IGZyb20gXCJkM1wiO1xudmFyIExpbmVQbG90ID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihwbG90RGF0YSwgeEF4aXMsIHlBeGlzLCBvcmllbnRhdGlvbiwgcGxvdEluZGV4Mikge1xuICAgIHRoaXMucGxvdERhdGEgPSBwbG90RGF0YTtcbiAgICB0aGlzLnhBeGlzID0geEF4aXM7XG4gICAgdGhpcy55QXhpcyA9IHlBeGlzO1xuICAgIHRoaXMub3JpZW50YXRpb24gPSBvcmllbnRhdGlvbjtcbiAgICB0aGlzLnBsb3RJbmRleCA9IHBsb3RJbmRleDI7XG4gIH1cbiAgc3RhdGljIHtcbiAgICBfX25hbWUodGhpcywgXCJMaW5lUGxvdFwiKTtcbiAgfVxuICBnZXREcmF3YWJsZUVsZW1lbnQoKSB7XG4gICAgY29uc3QgZmluYWxEYXRhID0gdGhpcy5wbG90RGF0YS5kYXRhLm1hcCgoZCkgPT4gW1xuICAgICAgdGhpcy54QXhpcy5nZXRTY2FsZVZhbHVlKGRbMF0pLFxuICAgICAgdGhpcy55QXhpcy5nZXRTY2FsZVZhbHVlKGRbMV0pXG4gICAgXSk7XG4gICAgbGV0IHBhdGg7XG4gICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09IFwiaG9yaXpvbnRhbFwiKSB7XG4gICAgICBwYXRoID0gbGluZSgpLnkoKGQpID0+IGRbMF0pLngoKGQpID0+IGRbMV0pKGZpbmFsRGF0YSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhdGggPSBsaW5lKCkueCgoZCkgPT4gZFswXSkueSgoZCkgPT4gZFsxXSkoZmluYWxEYXRhKTtcbiAgICB9XG4gICAgaWYgKCFwYXRoKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiBbXG4gICAgICB7XG4gICAgICAgIGdyb3VwVGV4dHM6IFtcInBsb3RcIiwgYGxpbmUtcGxvdC0ke3RoaXMucGxvdEluZGV4fWBdLFxuICAgICAgICB0eXBlOiBcInBhdGhcIixcbiAgICAgICAgZGF0YTogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHBhdGgsXG4gICAgICAgICAgICBzdHJva2VGaWxsOiB0aGlzLnBsb3REYXRhLnN0cm9rZUZpbGwsXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogdGhpcy5wbG90RGF0YS5zdHJva2VXaWR0aFxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIF07XG4gIH1cbn07XG5cbi8vIHNyYy9kaWFncmFtcy94eWNoYXJ0L2NoYXJ0QnVpbGRlci9jb21wb25lbnRzL3Bsb3QvYmFyUGxvdC50c1xudmFyIEJhclBsb3QgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKGJhckRhdGEsIGJvdW5kaW5nUmVjdCwgeEF4aXMsIHlBeGlzLCBvcmllbnRhdGlvbiwgcGxvdEluZGV4Mikge1xuICAgIHRoaXMuYmFyRGF0YSA9IGJhckRhdGE7XG4gICAgdGhpcy5ib3VuZGluZ1JlY3QgPSBib3VuZGluZ1JlY3Q7XG4gICAgdGhpcy54QXhpcyA9IHhBeGlzO1xuICAgIHRoaXMueUF4aXMgPSB5QXhpcztcbiAgICB0aGlzLm9yaWVudGF0aW9uID0gb3JpZW50YXRpb247XG4gICAgdGhpcy5wbG90SW5kZXggPSBwbG90SW5kZXgyO1xuICB9XG4gIHN0YXRpYyB7XG4gICAgX19uYW1lKHRoaXMsIFwiQmFyUGxvdFwiKTtcbiAgfVxuICBnZXREcmF3YWJsZUVsZW1lbnQoKSB7XG4gICAgY29uc3QgZmluYWxEYXRhID0gdGhpcy5iYXJEYXRhLmRhdGEubWFwKChkKSA9PiBbXG4gICAgICB0aGlzLnhBeGlzLmdldFNjYWxlVmFsdWUoZFswXSksXG4gICAgICB0aGlzLnlBeGlzLmdldFNjYWxlVmFsdWUoZFsxXSlcbiAgICBdKTtcbiAgICBjb25zdCBiYXJQYWRkaW5nUGVyY2VudCA9IDAuMDU7XG4gICAgY29uc3QgYmFyV2lkdGggPSBNYXRoLm1pbih0aGlzLnhBeGlzLmdldEF4aXNPdXRlclBhZGRpbmcoKSAqIDIsIHRoaXMueEF4aXMuZ2V0VGlja0Rpc3RhbmNlKCkpICogKDEgLSBiYXJQYWRkaW5nUGVyY2VudCk7XG4gICAgY29uc3QgYmFyV2lkdGhIYWxmID0gYmFyV2lkdGggLyAyO1xuICAgIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSBcImhvcml6b250YWxcIikge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAge1xuICAgICAgICAgIGdyb3VwVGV4dHM6IFtcInBsb3RcIiwgYGJhci1wbG90LSR7dGhpcy5wbG90SW5kZXh9YF0sXG4gICAgICAgICAgdHlwZTogXCJyZWN0XCIsXG4gICAgICAgICAgZGF0YTogZmluYWxEYXRhLm1hcCgoZGF0YSkgPT4gKHtcbiAgICAgICAgICAgIHg6IHRoaXMuYm91bmRpbmdSZWN0LngsXG4gICAgICAgICAgICB5OiBkYXRhWzBdIC0gYmFyV2lkdGhIYWxmLFxuICAgICAgICAgICAgaGVpZ2h0OiBiYXJXaWR0aCxcbiAgICAgICAgICAgIHdpZHRoOiBkYXRhWzFdIC0gdGhpcy5ib3VuZGluZ1JlY3QueCxcbiAgICAgICAgICAgIGZpbGw6IHRoaXMuYmFyRGF0YS5maWxsLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDAsXG4gICAgICAgICAgICBzdHJva2VGaWxsOiB0aGlzLmJhckRhdGEuZmlsbFxuICAgICAgICAgIH0pKVxuICAgICAgICB9XG4gICAgICBdO1xuICAgIH1cbiAgICByZXR1cm4gW1xuICAgICAge1xuICAgICAgICBncm91cFRleHRzOiBbXCJwbG90XCIsIGBiYXItcGxvdC0ke3RoaXMucGxvdEluZGV4fWBdLFxuICAgICAgICB0eXBlOiBcInJlY3RcIixcbiAgICAgICAgZGF0YTogZmluYWxEYXRhLm1hcCgoZGF0YSkgPT4gKHtcbiAgICAgICAgICB4OiBkYXRhWzBdIC0gYmFyV2lkdGhIYWxmLFxuICAgICAgICAgIHk6IGRhdGFbMV0sXG4gICAgICAgICAgd2lkdGg6IGJhcldpZHRoLFxuICAgICAgICAgIGhlaWdodDogdGhpcy5ib3VuZGluZ1JlY3QueSArIHRoaXMuYm91bmRpbmdSZWN0LmhlaWdodCAtIGRhdGFbMV0sXG4gICAgICAgICAgZmlsbDogdGhpcy5iYXJEYXRhLmZpbGwsXG4gICAgICAgICAgc3Ryb2tlV2lkdGg6IDAsXG4gICAgICAgICAgc3Ryb2tlRmlsbDogdGhpcy5iYXJEYXRhLmZpbGxcbiAgICAgICAgfSkpXG4gICAgICB9XG4gICAgXTtcbiAgfVxufTtcblxuLy8gc3JjL2RpYWdyYW1zL3h5Y2hhcnQvY2hhcnRCdWlsZGVyL2NvbXBvbmVudHMvcGxvdC9pbmRleC50c1xudmFyIEJhc2VQbG90ID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihjaGFydENvbmZpZywgY2hhcnREYXRhLCBjaGFydFRoZW1lQ29uZmlnKSB7XG4gICAgdGhpcy5jaGFydENvbmZpZyA9IGNoYXJ0Q29uZmlnO1xuICAgIHRoaXMuY2hhcnREYXRhID0gY2hhcnREYXRhO1xuICAgIHRoaXMuY2hhcnRUaGVtZUNvbmZpZyA9IGNoYXJ0VGhlbWVDb25maWc7XG4gICAgdGhpcy5ib3VuZGluZ1JlY3QgPSB7XG4gICAgICB4OiAwLFxuICAgICAgeTogMCxcbiAgICAgIHdpZHRoOiAwLFxuICAgICAgaGVpZ2h0OiAwXG4gICAgfTtcbiAgfVxuICBzdGF0aWMge1xuICAgIF9fbmFtZSh0aGlzLCBcIkJhc2VQbG90XCIpO1xuICB9XG4gIHNldEF4ZXMoeEF4aXMsIHlBeGlzKSB7XG4gICAgdGhpcy54QXhpcyA9IHhBeGlzO1xuICAgIHRoaXMueUF4aXMgPSB5QXhpcztcbiAgfVxuICBzZXRCb3VuZGluZ0JveFhZKHBvaW50KSB7XG4gICAgdGhpcy5ib3VuZGluZ1JlY3QueCA9IHBvaW50Lng7XG4gICAgdGhpcy5ib3VuZGluZ1JlY3QueSA9IHBvaW50Lnk7XG4gIH1cbiAgY2FsY3VsYXRlU3BhY2UoYXZhaWxhYmxlU3BhY2UpIHtcbiAgICB0aGlzLmJvdW5kaW5nUmVjdC53aWR0aCA9IGF2YWlsYWJsZVNwYWNlLndpZHRoO1xuICAgIHRoaXMuYm91bmRpbmdSZWN0LmhlaWdodCA9IGF2YWlsYWJsZVNwYWNlLmhlaWdodDtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IHRoaXMuYm91bmRpbmdSZWN0LndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLmJvdW5kaW5nUmVjdC5oZWlnaHRcbiAgICB9O1xuICB9XG4gIGdldERyYXdhYmxlRWxlbWVudHMoKSB7XG4gICAgaWYgKCEodGhpcy54QXhpcyAmJiB0aGlzLnlBeGlzKSkge1xuICAgICAgdGhyb3cgRXJyb3IoXCJBeGVzIG11c3QgYmUgcGFzc2VkIHRvIHJlbmRlciBQbG90c1wiKTtcbiAgICB9XG4gICAgY29uc3QgZHJhd2FibGVFbGVtID0gW107XG4gICAgZm9yIChjb25zdCBbaSwgcGxvdF0gb2YgdGhpcy5jaGFydERhdGEucGxvdHMuZW50cmllcygpKSB7XG4gICAgICBzd2l0Y2ggKHBsb3QudHlwZSkge1xuICAgICAgICBjYXNlIFwibGluZVwiOlxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IGxpbmVQbG90ID0gbmV3IExpbmVQbG90KFxuICAgICAgICAgICAgICBwbG90LFxuICAgICAgICAgICAgICB0aGlzLnhBeGlzLFxuICAgICAgICAgICAgICB0aGlzLnlBeGlzLFxuICAgICAgICAgICAgICB0aGlzLmNoYXJ0Q29uZmlnLmNoYXJ0T3JpZW50YXRpb24sXG4gICAgICAgICAgICAgIGlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBkcmF3YWJsZUVsZW0ucHVzaCguLi5saW5lUGxvdC5nZXREcmF3YWJsZUVsZW1lbnQoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiYmFyXCI6XG4gICAgICAgICAge1xuICAgICAgICAgICAgY29uc3QgYmFyUGxvdCA9IG5ldyBCYXJQbG90KFxuICAgICAgICAgICAgICBwbG90LFxuICAgICAgICAgICAgICB0aGlzLmJvdW5kaW5nUmVjdCxcbiAgICAgICAgICAgICAgdGhpcy54QXhpcyxcbiAgICAgICAgICAgICAgdGhpcy55QXhpcyxcbiAgICAgICAgICAgICAgdGhpcy5jaGFydENvbmZpZy5jaGFydE9yaWVudGF0aW9uLFxuICAgICAgICAgICAgICBpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgZHJhd2FibGVFbGVtLnB1c2goLi4uYmFyUGxvdC5nZXREcmF3YWJsZUVsZW1lbnQoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZHJhd2FibGVFbGVtO1xuICB9XG59O1xuZnVuY3Rpb24gZ2V0UGxvdENvbXBvbmVudChjaGFydENvbmZpZywgY2hhcnREYXRhLCBjaGFydFRoZW1lQ29uZmlnKSB7XG4gIHJldHVybiBuZXcgQmFzZVBsb3QoY2hhcnRDb25maWcsIGNoYXJ0RGF0YSwgY2hhcnRUaGVtZUNvbmZpZyk7XG59XG5fX25hbWUoZ2V0UGxvdENvbXBvbmVudCwgXCJnZXRQbG90Q29tcG9uZW50XCIpO1xuXG4vLyBzcmMvZGlhZ3JhbXMveHljaGFydC9jaGFydEJ1aWxkZXIvb3JjaGVzdHJhdG9yLnRzXG52YXIgT3JjaGVzdHJhdG9yID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihjaGFydENvbmZpZywgY2hhcnREYXRhLCBjaGFydFRoZW1lQ29uZmlnLCB0bXBTVkdHcm91cDIpIHtcbiAgICB0aGlzLmNoYXJ0Q29uZmlnID0gY2hhcnRDb25maWc7XG4gICAgdGhpcy5jaGFydERhdGEgPSBjaGFydERhdGE7XG4gICAgdGhpcy5jb21wb25lbnRTdG9yZSA9IHtcbiAgICAgIHRpdGxlOiBnZXRDaGFydFRpdGxlQ29tcG9uZW50KGNoYXJ0Q29uZmlnLCBjaGFydERhdGEsIGNoYXJ0VGhlbWVDb25maWcsIHRtcFNWR0dyb3VwMiksXG4gICAgICBwbG90OiBnZXRQbG90Q29tcG9uZW50KGNoYXJ0Q29uZmlnLCBjaGFydERhdGEsIGNoYXJ0VGhlbWVDb25maWcpLFxuICAgICAgeEF4aXM6IGdldEF4aXMoXG4gICAgICAgIGNoYXJ0RGF0YS54QXhpcyxcbiAgICAgICAgY2hhcnRDb25maWcueEF4aXMsXG4gICAgICAgIHtcbiAgICAgICAgICB0aXRsZUNvbG9yOiBjaGFydFRoZW1lQ29uZmlnLnhBeGlzVGl0bGVDb2xvcixcbiAgICAgICAgICBsYWJlbENvbG9yOiBjaGFydFRoZW1lQ29uZmlnLnhBeGlzTGFiZWxDb2xvcixcbiAgICAgICAgICB0aWNrQ29sb3I6IGNoYXJ0VGhlbWVDb25maWcueEF4aXNUaWNrQ29sb3IsXG4gICAgICAgICAgYXhpc0xpbmVDb2xvcjogY2hhcnRUaGVtZUNvbmZpZy54QXhpc0xpbmVDb2xvclxuICAgICAgICB9LFxuICAgICAgICB0bXBTVkdHcm91cDJcbiAgICAgICksXG4gICAgICB5QXhpczogZ2V0QXhpcyhcbiAgICAgICAgY2hhcnREYXRhLnlBeGlzLFxuICAgICAgICBjaGFydENvbmZpZy55QXhpcyxcbiAgICAgICAge1xuICAgICAgICAgIHRpdGxlQ29sb3I6IGNoYXJ0VGhlbWVDb25maWcueUF4aXNUaXRsZUNvbG9yLFxuICAgICAgICAgIGxhYmVsQ29sb3I6IGNoYXJ0VGhlbWVDb25maWcueUF4aXNMYWJlbENvbG9yLFxuICAgICAgICAgIHRpY2tDb2xvcjogY2hhcnRUaGVtZUNvbmZpZy55QXhpc1RpY2tDb2xvcixcbiAgICAgICAgICBheGlzTGluZUNvbG9yOiBjaGFydFRoZW1lQ29uZmlnLnlBeGlzTGluZUNvbG9yXG4gICAgICAgIH0sXG4gICAgICAgIHRtcFNWR0dyb3VwMlxuICAgICAgKVxuICAgIH07XG4gIH1cbiAgc3RhdGljIHtcbiAgICBfX25hbWUodGhpcywgXCJPcmNoZXN0cmF0b3JcIik7XG4gIH1cbiAgY2FsY3VsYXRlVmVydGljYWxTcGFjZSgpIHtcbiAgICBsZXQgYXZhaWxhYmxlV2lkdGggPSB0aGlzLmNoYXJ0Q29uZmlnLndpZHRoO1xuICAgIGxldCBhdmFpbGFibGVIZWlnaHQgPSB0aGlzLmNoYXJ0Q29uZmlnLmhlaWdodDtcbiAgICBsZXQgcGxvdFggPSAwO1xuICAgIGxldCBwbG90WSA9IDA7XG4gICAgbGV0IGNoYXJ0V2lkdGggPSBNYXRoLmZsb29yKGF2YWlsYWJsZVdpZHRoICogdGhpcy5jaGFydENvbmZpZy5wbG90UmVzZXJ2ZWRTcGFjZVBlcmNlbnQgLyAxMDApO1xuICAgIGxldCBjaGFydEhlaWdodCA9IE1hdGguZmxvb3IoXG4gICAgICBhdmFpbGFibGVIZWlnaHQgKiB0aGlzLmNoYXJ0Q29uZmlnLnBsb3RSZXNlcnZlZFNwYWNlUGVyY2VudCAvIDEwMFxuICAgICk7XG4gICAgbGV0IHNwYWNlVXNlZCA9IHRoaXMuY29tcG9uZW50U3RvcmUucGxvdC5jYWxjdWxhdGVTcGFjZSh7XG4gICAgICB3aWR0aDogY2hhcnRXaWR0aCxcbiAgICAgIGhlaWdodDogY2hhcnRIZWlnaHRcbiAgICB9KTtcbiAgICBhdmFpbGFibGVXaWR0aCAtPSBzcGFjZVVzZWQud2lkdGg7XG4gICAgYXZhaWxhYmxlSGVpZ2h0IC09IHNwYWNlVXNlZC5oZWlnaHQ7XG4gICAgc3BhY2VVc2VkID0gdGhpcy5jb21wb25lbnRTdG9yZS50aXRsZS5jYWxjdWxhdGVTcGFjZSh7XG4gICAgICB3aWR0aDogdGhpcy5jaGFydENvbmZpZy53aWR0aCxcbiAgICAgIGhlaWdodDogYXZhaWxhYmxlSGVpZ2h0XG4gICAgfSk7XG4gICAgcGxvdFkgPSBzcGFjZVVzZWQuaGVpZ2h0O1xuICAgIGF2YWlsYWJsZUhlaWdodCAtPSBzcGFjZVVzZWQuaGVpZ2h0O1xuICAgIHRoaXMuY29tcG9uZW50U3RvcmUueEF4aXMuc2V0QXhpc1Bvc2l0aW9uKFwiYm90dG9tXCIpO1xuICAgIHNwYWNlVXNlZCA9IHRoaXMuY29tcG9uZW50U3RvcmUueEF4aXMuY2FsY3VsYXRlU3BhY2Uoe1xuICAgICAgd2lkdGg6IGF2YWlsYWJsZVdpZHRoLFxuICAgICAgaGVpZ2h0OiBhdmFpbGFibGVIZWlnaHRcbiAgICB9KTtcbiAgICBhdmFpbGFibGVIZWlnaHQgLT0gc3BhY2VVc2VkLmhlaWdodDtcbiAgICB0aGlzLmNvbXBvbmVudFN0b3JlLnlBeGlzLnNldEF4aXNQb3NpdGlvbihcImxlZnRcIik7XG4gICAgc3BhY2VVc2VkID0gdGhpcy5jb21wb25lbnRTdG9yZS55QXhpcy5jYWxjdWxhdGVTcGFjZSh7XG4gICAgICB3aWR0aDogYXZhaWxhYmxlV2lkdGgsXG4gICAgICBoZWlnaHQ6IGF2YWlsYWJsZUhlaWdodFxuICAgIH0pO1xuICAgIHBsb3RYID0gc3BhY2VVc2VkLndpZHRoO1xuICAgIGF2YWlsYWJsZVdpZHRoIC09IHNwYWNlVXNlZC53aWR0aDtcbiAgICBpZiAoYXZhaWxhYmxlV2lkdGggPiAwKSB7XG4gICAgICBjaGFydFdpZHRoICs9IGF2YWlsYWJsZVdpZHRoO1xuICAgICAgYXZhaWxhYmxlV2lkdGggPSAwO1xuICAgIH1cbiAgICBpZiAoYXZhaWxhYmxlSGVpZ2h0ID4gMCkge1xuICAgICAgY2hhcnRIZWlnaHQgKz0gYXZhaWxhYmxlSGVpZ2h0O1xuICAgICAgYXZhaWxhYmxlSGVpZ2h0ID0gMDtcbiAgICB9XG4gICAgdGhpcy5jb21wb25lbnRTdG9yZS5wbG90LmNhbGN1bGF0ZVNwYWNlKHtcbiAgICAgIHdpZHRoOiBjaGFydFdpZHRoLFxuICAgICAgaGVpZ2h0OiBjaGFydEhlaWdodFxuICAgIH0pO1xuICAgIHRoaXMuY29tcG9uZW50U3RvcmUucGxvdC5zZXRCb3VuZGluZ0JveFhZKHsgeDogcGxvdFgsIHk6IHBsb3RZIH0pO1xuICAgIHRoaXMuY29tcG9uZW50U3RvcmUueEF4aXMuc2V0UmFuZ2UoW3Bsb3RYLCBwbG90WCArIGNoYXJ0V2lkdGhdKTtcbiAgICB0aGlzLmNvbXBvbmVudFN0b3JlLnhBeGlzLnNldEJvdW5kaW5nQm94WFkoeyB4OiBwbG90WCwgeTogcGxvdFkgKyBjaGFydEhlaWdodCB9KTtcbiAgICB0aGlzLmNvbXBvbmVudFN0b3JlLnlBeGlzLnNldFJhbmdlKFtwbG90WSwgcGxvdFkgKyBjaGFydEhlaWdodF0pO1xuICAgIHRoaXMuY29tcG9uZW50U3RvcmUueUF4aXMuc2V0Qm91bmRpbmdCb3hYWSh7IHg6IDAsIHk6IHBsb3RZIH0pO1xuICAgIGlmICh0aGlzLmNoYXJ0RGF0YS5wbG90cy5zb21lKChwKSA9PiBpc0JhclBsb3QocCkpKSB7XG4gICAgICB0aGlzLmNvbXBvbmVudFN0b3JlLnhBeGlzLnJlY2FsY3VsYXRlT3V0ZXJQYWRkaW5nVG9EcmF3QmFyKCk7XG4gICAgfVxuICB9XG4gIGNhbGN1bGF0ZUhvcml6b250YWxTcGFjZSgpIHtcbiAgICBsZXQgYXZhaWxhYmxlV2lkdGggPSB0aGlzLmNoYXJ0Q29uZmlnLndpZHRoO1xuICAgIGxldCBhdmFpbGFibGVIZWlnaHQgPSB0aGlzLmNoYXJ0Q29uZmlnLmhlaWdodDtcbiAgICBsZXQgdGl0bGVZRW5kID0gMDtcbiAgICBsZXQgcGxvdFggPSAwO1xuICAgIGxldCBwbG90WSA9IDA7XG4gICAgbGV0IGNoYXJ0V2lkdGggPSBNYXRoLmZsb29yKGF2YWlsYWJsZVdpZHRoICogdGhpcy5jaGFydENvbmZpZy5wbG90UmVzZXJ2ZWRTcGFjZVBlcmNlbnQgLyAxMDApO1xuICAgIGxldCBjaGFydEhlaWdodCA9IE1hdGguZmxvb3IoXG4gICAgICBhdmFpbGFibGVIZWlnaHQgKiB0aGlzLmNoYXJ0Q29uZmlnLnBsb3RSZXNlcnZlZFNwYWNlUGVyY2VudCAvIDEwMFxuICAgICk7XG4gICAgbGV0IHNwYWNlVXNlZCA9IHRoaXMuY29tcG9uZW50U3RvcmUucGxvdC5jYWxjdWxhdGVTcGFjZSh7XG4gICAgICB3aWR0aDogY2hhcnRXaWR0aCxcbiAgICAgIGhlaWdodDogY2hhcnRIZWlnaHRcbiAgICB9KTtcbiAgICBhdmFpbGFibGVXaWR0aCAtPSBzcGFjZVVzZWQud2lkdGg7XG4gICAgYXZhaWxhYmxlSGVpZ2h0IC09IHNwYWNlVXNlZC5oZWlnaHQ7XG4gICAgc3BhY2VVc2VkID0gdGhpcy5jb21wb25lbnRTdG9yZS50aXRsZS5jYWxjdWxhdGVTcGFjZSh7XG4gICAgICB3aWR0aDogdGhpcy5jaGFydENvbmZpZy53aWR0aCxcbiAgICAgIGhlaWdodDogYXZhaWxhYmxlSGVpZ2h0XG4gICAgfSk7XG4gICAgdGl0bGVZRW5kID0gc3BhY2VVc2VkLmhlaWdodDtcbiAgICBhdmFpbGFibGVIZWlnaHQgLT0gc3BhY2VVc2VkLmhlaWdodDtcbiAgICB0aGlzLmNvbXBvbmVudFN0b3JlLnhBeGlzLnNldEF4aXNQb3NpdGlvbihcImxlZnRcIik7XG4gICAgc3BhY2VVc2VkID0gdGhpcy5jb21wb25lbnRTdG9yZS54QXhpcy5jYWxjdWxhdGVTcGFjZSh7XG4gICAgICB3aWR0aDogYXZhaWxhYmxlV2lkdGgsXG4gICAgICBoZWlnaHQ6IGF2YWlsYWJsZUhlaWdodFxuICAgIH0pO1xuICAgIGF2YWlsYWJsZVdpZHRoIC09IHNwYWNlVXNlZC53aWR0aDtcbiAgICBwbG90WCA9IHNwYWNlVXNlZC53aWR0aDtcbiAgICB0aGlzLmNvbXBvbmVudFN0b3JlLnlBeGlzLnNldEF4aXNQb3NpdGlvbihcInRvcFwiKTtcbiAgICBzcGFjZVVzZWQgPSB0aGlzLmNvbXBvbmVudFN0b3JlLnlBeGlzLmNhbGN1bGF0ZVNwYWNlKHtcbiAgICAgIHdpZHRoOiBhdmFpbGFibGVXaWR0aCxcbiAgICAgIGhlaWdodDogYXZhaWxhYmxlSGVpZ2h0XG4gICAgfSk7XG4gICAgYXZhaWxhYmxlSGVpZ2h0IC09IHNwYWNlVXNlZC5oZWlnaHQ7XG4gICAgcGxvdFkgPSB0aXRsZVlFbmQgKyBzcGFjZVVzZWQuaGVpZ2h0O1xuICAgIGlmIChhdmFpbGFibGVXaWR0aCA+IDApIHtcbiAgICAgIGNoYXJ0V2lkdGggKz0gYXZhaWxhYmxlV2lkdGg7XG4gICAgICBhdmFpbGFibGVXaWR0aCA9IDA7XG4gICAgfVxuICAgIGlmIChhdmFpbGFibGVIZWlnaHQgPiAwKSB7XG4gICAgICBjaGFydEhlaWdodCArPSBhdmFpbGFibGVIZWlnaHQ7XG4gICAgICBhdmFpbGFibGVIZWlnaHQgPSAwO1xuICAgIH1cbiAgICB0aGlzLmNvbXBvbmVudFN0b3JlLnBsb3QuY2FsY3VsYXRlU3BhY2Uoe1xuICAgICAgd2lkdGg6IGNoYXJ0V2lkdGgsXG4gICAgICBoZWlnaHQ6IGNoYXJ0SGVpZ2h0XG4gICAgfSk7XG4gICAgdGhpcy5jb21wb25lbnRTdG9yZS5wbG90LnNldEJvdW5kaW5nQm94WFkoeyB4OiBwbG90WCwgeTogcGxvdFkgfSk7XG4gICAgdGhpcy5jb21wb25lbnRTdG9yZS55QXhpcy5zZXRSYW5nZShbcGxvdFgsIHBsb3RYICsgY2hhcnRXaWR0aF0pO1xuICAgIHRoaXMuY29tcG9uZW50U3RvcmUueUF4aXMuc2V0Qm91bmRpbmdCb3hYWSh7IHg6IHBsb3RYLCB5OiB0aXRsZVlFbmQgfSk7XG4gICAgdGhpcy5jb21wb25lbnRTdG9yZS54QXhpcy5zZXRSYW5nZShbcGxvdFksIHBsb3RZICsgY2hhcnRIZWlnaHRdKTtcbiAgICB0aGlzLmNvbXBvbmVudFN0b3JlLnhBeGlzLnNldEJvdW5kaW5nQm94WFkoeyB4OiAwLCB5OiBwbG90WSB9KTtcbiAgICBpZiAodGhpcy5jaGFydERhdGEucGxvdHMuc29tZSgocCkgPT4gaXNCYXJQbG90KHApKSkge1xuICAgICAgdGhpcy5jb21wb25lbnRTdG9yZS54QXhpcy5yZWNhbGN1bGF0ZU91dGVyUGFkZGluZ1RvRHJhd0JhcigpO1xuICAgIH1cbiAgfVxuICBjYWxjdWxhdGVTcGFjZSgpIHtcbiAgICBpZiAodGhpcy5jaGFydENvbmZpZy5jaGFydE9yaWVudGF0aW9uID09PSBcImhvcml6b250YWxcIikge1xuICAgICAgdGhpcy5jYWxjdWxhdGVIb3Jpem9udGFsU3BhY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYWxjdWxhdGVWZXJ0aWNhbFNwYWNlKCk7XG4gICAgfVxuICB9XG4gIGdldERyYXdhYmxlRWxlbWVudCgpIHtcbiAgICB0aGlzLmNhbGN1bGF0ZVNwYWNlKCk7XG4gICAgY29uc3QgZHJhd2FibGVFbGVtID0gW107XG4gICAgdGhpcy5jb21wb25lbnRTdG9yZS5wbG90LnNldEF4ZXModGhpcy5jb21wb25lbnRTdG9yZS54QXhpcywgdGhpcy5jb21wb25lbnRTdG9yZS55QXhpcyk7XG4gICAgZm9yIChjb25zdCBjb21wb25lbnQgb2YgT2JqZWN0LnZhbHVlcyh0aGlzLmNvbXBvbmVudFN0b3JlKSkge1xuICAgICAgZHJhd2FibGVFbGVtLnB1c2goLi4uY29tcG9uZW50LmdldERyYXdhYmxlRWxlbWVudHMoKSk7XG4gICAgfVxuICAgIHJldHVybiBkcmF3YWJsZUVsZW07XG4gIH1cbn07XG5cbi8vIHNyYy9kaWFncmFtcy94eWNoYXJ0L2NoYXJ0QnVpbGRlci9pbmRleC50c1xudmFyIFhZQ2hhcnRCdWlsZGVyID0gY2xhc3Mge1xuICBzdGF0aWMge1xuICAgIF9fbmFtZSh0aGlzLCBcIlhZQ2hhcnRCdWlsZGVyXCIpO1xuICB9XG4gIHN0YXRpYyBidWlsZChjb25maWcsIGNoYXJ0RGF0YSwgY2hhcnRUaGVtZUNvbmZpZywgdG1wU1ZHR3JvdXAyKSB7XG4gICAgY29uc3Qgb3JjaGVzdHJhdG9yID0gbmV3IE9yY2hlc3RyYXRvcihjb25maWcsIGNoYXJ0RGF0YSwgY2hhcnRUaGVtZUNvbmZpZywgdG1wU1ZHR3JvdXAyKTtcbiAgICByZXR1cm4gb3JjaGVzdHJhdG9yLmdldERyYXdhYmxlRWxlbWVudCgpO1xuICB9XG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMveHljaGFydC94eWNoYXJ0RGIudHNcbnZhciBwbG90SW5kZXggPSAwO1xudmFyIHRtcFNWR0dyb3VwO1xudmFyIHh5Q2hhcnRDb25maWcgPSBnZXRDaGFydERlZmF1bHRDb25maWcoKTtcbnZhciB4eUNoYXJ0VGhlbWVDb25maWcgPSBnZXRDaGFydERlZmF1bHRUaGVtZUNvbmZpZygpO1xudmFyIHh5Q2hhcnREYXRhID0gZ2V0Q2hhcnREZWZhdWx0RGF0YSgpO1xudmFyIHBsb3RDb2xvclBhbGV0dGUgPSB4eUNoYXJ0VGhlbWVDb25maWcucGxvdENvbG9yUGFsZXR0ZS5zcGxpdChcIixcIikubWFwKChjb2xvcikgPT4gY29sb3IudHJpbSgpKTtcbnZhciBoYXNTZXRYQXhpcyA9IGZhbHNlO1xudmFyIGhhc1NldFlBeGlzID0gZmFsc2U7XG5mdW5jdGlvbiBnZXRDaGFydERlZmF1bHRUaGVtZUNvbmZpZygpIHtcbiAgY29uc3QgZGVmYXVsdFRoZW1lVmFyaWFibGVzID0gZ2V0VGhlbWVWYXJpYWJsZXMoKTtcbiAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIHJldHVybiBjbGVhbkFuZE1lcmdlKGRlZmF1bHRUaGVtZVZhcmlhYmxlcy54eUNoYXJ0LCBjb25maWcudGhlbWVWYXJpYWJsZXMueHlDaGFydCk7XG59XG5fX25hbWUoZ2V0Q2hhcnREZWZhdWx0VGhlbWVDb25maWcsIFwiZ2V0Q2hhcnREZWZhdWx0VGhlbWVDb25maWdcIik7XG5mdW5jdGlvbiBnZXRDaGFydERlZmF1bHRDb25maWcoKSB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICByZXR1cm4gY2xlYW5BbmRNZXJnZShcbiAgICBkZWZhdWx0Q29uZmlnX2RlZmF1bHQueHlDaGFydCxcbiAgICBjb25maWcueHlDaGFydFxuICApO1xufVxuX19uYW1lKGdldENoYXJ0RGVmYXVsdENvbmZpZywgXCJnZXRDaGFydERlZmF1bHRDb25maWdcIik7XG5mdW5jdGlvbiBnZXRDaGFydERlZmF1bHREYXRhKCkge1xuICByZXR1cm4ge1xuICAgIHlBeGlzOiB7XG4gICAgICB0eXBlOiBcImxpbmVhclwiLFxuICAgICAgdGl0bGU6IFwiXCIsXG4gICAgICBtaW46IEluZmluaXR5LFxuICAgICAgbWF4OiAtSW5maW5pdHlcbiAgICB9LFxuICAgIHhBeGlzOiB7XG4gICAgICB0eXBlOiBcImJhbmRcIixcbiAgICAgIHRpdGxlOiBcIlwiLFxuICAgICAgY2F0ZWdvcmllczogW11cbiAgICB9LFxuICAgIHRpdGxlOiBcIlwiLFxuICAgIHBsb3RzOiBbXVxuICB9O1xufVxuX19uYW1lKGdldENoYXJ0RGVmYXVsdERhdGEsIFwiZ2V0Q2hhcnREZWZhdWx0RGF0YVwiKTtcbmZ1bmN0aW9uIHRleHRTYW5pdGl6ZXIodGV4dCkge1xuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgcmV0dXJuIHNhbml0aXplVGV4dCh0ZXh0LnRyaW0oKSwgY29uZmlnKTtcbn1cbl9fbmFtZSh0ZXh0U2FuaXRpemVyLCBcInRleHRTYW5pdGl6ZXJcIik7XG5mdW5jdGlvbiBzZXRUbXBTVkdHKFNWR0cpIHtcbiAgdG1wU1ZHR3JvdXAgPSBTVkdHO1xufVxuX19uYW1lKHNldFRtcFNWR0csIFwic2V0VG1wU1ZHR1wiKTtcbmZ1bmN0aW9uIHNldE9yaWVudGF0aW9uKG9yaWVudGF0aW9uKSB7XG4gIGlmIChvcmllbnRhdGlvbiA9PT0gXCJob3Jpem9udGFsXCIpIHtcbiAgICB4eUNoYXJ0Q29uZmlnLmNoYXJ0T3JpZW50YXRpb24gPSBcImhvcml6b250YWxcIjtcbiAgfSBlbHNlIHtcbiAgICB4eUNoYXJ0Q29uZmlnLmNoYXJ0T3JpZW50YXRpb24gPSBcInZlcnRpY2FsXCI7XG4gIH1cbn1cbl9fbmFtZShzZXRPcmllbnRhdGlvbiwgXCJzZXRPcmllbnRhdGlvblwiKTtcbmZ1bmN0aW9uIHNldFhBeGlzVGl0bGUodGl0bGUpIHtcbiAgeHlDaGFydERhdGEueEF4aXMudGl0bGUgPSB0ZXh0U2FuaXRpemVyKHRpdGxlLnRleHQpO1xufVxuX19uYW1lKHNldFhBeGlzVGl0bGUsIFwic2V0WEF4aXNUaXRsZVwiKTtcbmZ1bmN0aW9uIHNldFhBeGlzUmFuZ2VEYXRhKG1pbiwgbWF4KSB7XG4gIHh5Q2hhcnREYXRhLnhBeGlzID0geyB0eXBlOiBcImxpbmVhclwiLCB0aXRsZTogeHlDaGFydERhdGEueEF4aXMudGl0bGUsIG1pbiwgbWF4IH07XG4gIGhhc1NldFhBeGlzID0gdHJ1ZTtcbn1cbl9fbmFtZShzZXRYQXhpc1JhbmdlRGF0YSwgXCJzZXRYQXhpc1JhbmdlRGF0YVwiKTtcbmZ1bmN0aW9uIHNldFhBeGlzQmFuZChjYXRlZ29yaWVzKSB7XG4gIHh5Q2hhcnREYXRhLnhBeGlzID0ge1xuICAgIHR5cGU6IFwiYmFuZFwiLFxuICAgIHRpdGxlOiB4eUNoYXJ0RGF0YS54QXhpcy50aXRsZSxcbiAgICBjYXRlZ29yaWVzOiBjYXRlZ29yaWVzLm1hcCgoYykgPT4gdGV4dFNhbml0aXplcihjLnRleHQpKVxuICB9O1xuICBoYXNTZXRYQXhpcyA9IHRydWU7XG59XG5fX25hbWUoc2V0WEF4aXNCYW5kLCBcInNldFhBeGlzQmFuZFwiKTtcbmZ1bmN0aW9uIHNldFlBeGlzVGl0bGUodGl0bGUpIHtcbiAgeHlDaGFydERhdGEueUF4aXMudGl0bGUgPSB0ZXh0U2FuaXRpemVyKHRpdGxlLnRleHQpO1xufVxuX19uYW1lKHNldFlBeGlzVGl0bGUsIFwic2V0WUF4aXNUaXRsZVwiKTtcbmZ1bmN0aW9uIHNldFlBeGlzUmFuZ2VEYXRhKG1pbiwgbWF4KSB7XG4gIHh5Q2hhcnREYXRhLnlBeGlzID0geyB0eXBlOiBcImxpbmVhclwiLCB0aXRsZTogeHlDaGFydERhdGEueUF4aXMudGl0bGUsIG1pbiwgbWF4IH07XG4gIGhhc1NldFlBeGlzID0gdHJ1ZTtcbn1cbl9fbmFtZShzZXRZQXhpc1JhbmdlRGF0YSwgXCJzZXRZQXhpc1JhbmdlRGF0YVwiKTtcbmZ1bmN0aW9uIHNldFlBeGlzUmFuZ2VGcm9tUGxvdERhdGEoZGF0YSkge1xuICBjb25zdCBtaW5WYWx1ZSA9IE1hdGgubWluKC4uLmRhdGEpO1xuICBjb25zdCBtYXhWYWx1ZSA9IE1hdGgubWF4KC4uLmRhdGEpO1xuICBjb25zdCBwcmV2TWluVmFsdWUgPSBpc0xpbmVhckF4aXNEYXRhKHh5Q2hhcnREYXRhLnlBeGlzKSA/IHh5Q2hhcnREYXRhLnlBeGlzLm1pbiA6IEluZmluaXR5O1xuICBjb25zdCBwcmV2TWF4VmFsdWUgPSBpc0xpbmVhckF4aXNEYXRhKHh5Q2hhcnREYXRhLnlBeGlzKSA/IHh5Q2hhcnREYXRhLnlBeGlzLm1heCA6IC1JbmZpbml0eTtcbiAgeHlDaGFydERhdGEueUF4aXMgPSB7XG4gICAgdHlwZTogXCJsaW5lYXJcIixcbiAgICB0aXRsZTogeHlDaGFydERhdGEueUF4aXMudGl0bGUsXG4gICAgbWluOiBNYXRoLm1pbihwcmV2TWluVmFsdWUsIG1pblZhbHVlKSxcbiAgICBtYXg6IE1hdGgubWF4KHByZXZNYXhWYWx1ZSwgbWF4VmFsdWUpXG4gIH07XG59XG5fX25hbWUoc2V0WUF4aXNSYW5nZUZyb21QbG90RGF0YSwgXCJzZXRZQXhpc1JhbmdlRnJvbVBsb3REYXRhXCIpO1xuZnVuY3Rpb24gdHJhbnNmb3JtRGF0YVdpdGhvdXRDYXRlZ29yeShkYXRhKSB7XG4gIGxldCByZXREYXRhID0gW107XG4gIGlmIChkYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiByZXREYXRhO1xuICB9XG4gIGlmICghaGFzU2V0WEF4aXMpIHtcbiAgICBjb25zdCBwcmV2TWluVmFsdWUgPSBpc0xpbmVhckF4aXNEYXRhKHh5Q2hhcnREYXRhLnhBeGlzKSA/IHh5Q2hhcnREYXRhLnhBeGlzLm1pbiA6IEluZmluaXR5O1xuICAgIGNvbnN0IHByZXZNYXhWYWx1ZSA9IGlzTGluZWFyQXhpc0RhdGEoeHlDaGFydERhdGEueEF4aXMpID8geHlDaGFydERhdGEueEF4aXMubWF4IDogLUluZmluaXR5O1xuICAgIHNldFhBeGlzUmFuZ2VEYXRhKE1hdGgubWluKHByZXZNaW5WYWx1ZSwgMSksIE1hdGgubWF4KHByZXZNYXhWYWx1ZSwgZGF0YS5sZW5ndGgpKTtcbiAgfVxuICBpZiAoIWhhc1NldFlBeGlzKSB7XG4gICAgc2V0WUF4aXNSYW5nZUZyb21QbG90RGF0YShkYXRhKTtcbiAgfVxuICBpZiAoaXNCYW5kQXhpc0RhdGEoeHlDaGFydERhdGEueEF4aXMpKSB7XG4gICAgcmV0RGF0YSA9IHh5Q2hhcnREYXRhLnhBeGlzLmNhdGVnb3JpZXMubWFwKChjLCBpKSA9PiBbYywgZGF0YVtpXV0pO1xuICB9XG4gIGlmIChpc0xpbmVhckF4aXNEYXRhKHh5Q2hhcnREYXRhLnhBeGlzKSkge1xuICAgIGNvbnN0IG1pbiA9IHh5Q2hhcnREYXRhLnhBeGlzLm1pbjtcbiAgICBjb25zdCBtYXggPSB4eUNoYXJ0RGF0YS54QXhpcy5tYXg7XG4gICAgY29uc3Qgc3RlcCA9IChtYXggLSBtaW4pIC8gKGRhdGEubGVuZ3RoIC0gMSk7XG4gICAgY29uc3QgY2F0ZWdvcmllcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSBtaW47IGkgPD0gbWF4OyBpICs9IHN0ZXApIHtcbiAgICAgIGNhdGVnb3JpZXMucHVzaChgJHtpfWApO1xuICAgIH1cbiAgICByZXREYXRhID0gY2F0ZWdvcmllcy5tYXAoKGMsIGkpID0+IFtjLCBkYXRhW2ldXSk7XG4gIH1cbiAgcmV0dXJuIHJldERhdGE7XG59XG5fX25hbWUodHJhbnNmb3JtRGF0YVdpdGhvdXRDYXRlZ29yeSwgXCJ0cmFuc2Zvcm1EYXRhV2l0aG91dENhdGVnb3J5XCIpO1xuZnVuY3Rpb24gZ2V0UGxvdENvbG9yRnJvbVBhbGV0dGUocGxvdEluZGV4Mikge1xuICByZXR1cm4gcGxvdENvbG9yUGFsZXR0ZVtwbG90SW5kZXgyID09PSAwID8gMCA6IHBsb3RJbmRleDIgJSBwbG90Q29sb3JQYWxldHRlLmxlbmd0aF07XG59XG5fX25hbWUoZ2V0UGxvdENvbG9yRnJvbVBhbGV0dGUsIFwiZ2V0UGxvdENvbG9yRnJvbVBhbGV0dGVcIik7XG5mdW5jdGlvbiBzZXRMaW5lRGF0YSh0aXRsZSwgZGF0YSkge1xuICBjb25zdCBwbG90RGF0YSA9IHRyYW5zZm9ybURhdGFXaXRob3V0Q2F0ZWdvcnkoZGF0YSk7XG4gIHh5Q2hhcnREYXRhLnBsb3RzLnB1c2goe1xuICAgIHR5cGU6IFwibGluZVwiLFxuICAgIHN0cm9rZUZpbGw6IGdldFBsb3RDb2xvckZyb21QYWxldHRlKHBsb3RJbmRleCksXG4gICAgc3Ryb2tlV2lkdGg6IDIsXG4gICAgZGF0YTogcGxvdERhdGFcbiAgfSk7XG4gIHBsb3RJbmRleCsrO1xufVxuX19uYW1lKHNldExpbmVEYXRhLCBcInNldExpbmVEYXRhXCIpO1xuZnVuY3Rpb24gc2V0QmFyRGF0YSh0aXRsZSwgZGF0YSkge1xuICBjb25zdCBwbG90RGF0YSA9IHRyYW5zZm9ybURhdGFXaXRob3V0Q2F0ZWdvcnkoZGF0YSk7XG4gIHh5Q2hhcnREYXRhLnBsb3RzLnB1c2goe1xuICAgIHR5cGU6IFwiYmFyXCIsXG4gICAgZmlsbDogZ2V0UGxvdENvbG9yRnJvbVBhbGV0dGUocGxvdEluZGV4KSxcbiAgICBkYXRhOiBwbG90RGF0YVxuICB9KTtcbiAgcGxvdEluZGV4Kys7XG59XG5fX25hbWUoc2V0QmFyRGF0YSwgXCJzZXRCYXJEYXRhXCIpO1xuZnVuY3Rpb24gZ2V0RHJhd2FibGVFbGVtKCkge1xuICBpZiAoeHlDaGFydERhdGEucGxvdHMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3cgRXJyb3IoXCJObyBQbG90IHRvIHJlbmRlciwgcGxlYXNlIHByb3ZpZGUgYSBwbG90IHdpdGggc29tZSBkYXRhXCIpO1xuICB9XG4gIHh5Q2hhcnREYXRhLnRpdGxlID0gZ2V0RGlhZ3JhbVRpdGxlKCk7XG4gIHJldHVybiBYWUNoYXJ0QnVpbGRlci5idWlsZCh4eUNoYXJ0Q29uZmlnLCB4eUNoYXJ0RGF0YSwgeHlDaGFydFRoZW1lQ29uZmlnLCB0bXBTVkdHcm91cCk7XG59XG5fX25hbWUoZ2V0RHJhd2FibGVFbGVtLCBcImdldERyYXdhYmxlRWxlbVwiKTtcbmZ1bmN0aW9uIGdldENoYXJ0VGhlbWVDb25maWcoKSB7XG4gIHJldHVybiB4eUNoYXJ0VGhlbWVDb25maWc7XG59XG5fX25hbWUoZ2V0Q2hhcnRUaGVtZUNvbmZpZywgXCJnZXRDaGFydFRoZW1lQ29uZmlnXCIpO1xuZnVuY3Rpb24gZ2V0Q2hhcnRDb25maWcoKSB7XG4gIHJldHVybiB4eUNoYXJ0Q29uZmlnO1xufVxuX19uYW1lKGdldENoYXJ0Q29uZmlnLCBcImdldENoYXJ0Q29uZmlnXCIpO1xuZnVuY3Rpb24gZ2V0WFlDaGFydERhdGEoKSB7XG4gIHJldHVybiB4eUNoYXJ0RGF0YTtcbn1cbl9fbmFtZShnZXRYWUNoYXJ0RGF0YSwgXCJnZXRYWUNoYXJ0RGF0YVwiKTtcbnZhciBjbGVhcjIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICBjbGVhcigpO1xuICBwbG90SW5kZXggPSAwO1xuICB4eUNoYXJ0Q29uZmlnID0gZ2V0Q2hhcnREZWZhdWx0Q29uZmlnKCk7XG4gIHh5Q2hhcnREYXRhID0gZ2V0Q2hhcnREZWZhdWx0RGF0YSgpO1xuICB4eUNoYXJ0VGhlbWVDb25maWcgPSBnZXRDaGFydERlZmF1bHRUaGVtZUNvbmZpZygpO1xuICBwbG90Q29sb3JQYWxldHRlID0geHlDaGFydFRoZW1lQ29uZmlnLnBsb3RDb2xvclBhbGV0dGUuc3BsaXQoXCIsXCIpLm1hcCgoY29sb3IpID0+IGNvbG9yLnRyaW0oKSk7XG4gIGhhc1NldFhBeGlzID0gZmFsc2U7XG4gIGhhc1NldFlBeGlzID0gZmFsc2U7XG59LCBcImNsZWFyXCIpO1xudmFyIHh5Y2hhcnREYl9kZWZhdWx0ID0ge1xuICBnZXREcmF3YWJsZUVsZW0sXG4gIGNsZWFyOiBjbGVhcjIsXG4gIHNldEFjY1RpdGxlLFxuICBnZXRBY2NUaXRsZSxcbiAgc2V0RGlhZ3JhbVRpdGxlLFxuICBnZXREaWFncmFtVGl0bGUsXG4gIGdldEFjY0Rlc2NyaXB0aW9uLFxuICBzZXRBY2NEZXNjcmlwdGlvbixcbiAgc2V0T3JpZW50YXRpb24sXG4gIHNldFhBeGlzVGl0bGUsXG4gIHNldFhBeGlzUmFuZ2VEYXRhLFxuICBzZXRYQXhpc0JhbmQsXG4gIHNldFlBeGlzVGl0bGUsXG4gIHNldFlBeGlzUmFuZ2VEYXRhLFxuICBzZXRMaW5lRGF0YSxcbiAgc2V0QmFyRGF0YSxcbiAgc2V0VG1wU1ZHRyxcbiAgZ2V0Q2hhcnRUaGVtZUNvbmZpZyxcbiAgZ2V0Q2hhcnRDb25maWcsXG4gIGdldFhZQ2hhcnREYXRhXG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMveHljaGFydC94eWNoYXJ0UmVuZGVyZXIudHNcbnZhciBkcmF3ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgodHh0LCBpZCwgX3ZlcnNpb24sIGRpYWdPYmopID0+IHtcbiAgY29uc3QgZGIgPSBkaWFnT2JqLmRiO1xuICBjb25zdCB0aGVtZUNvbmZpZyA9IGRiLmdldENoYXJ0VGhlbWVDb25maWcoKTtcbiAgY29uc3QgY2hhcnRDb25maWcgPSBkYi5nZXRDaGFydENvbmZpZygpO1xuICBjb25zdCBsYWJlbERhdGEgPSBkYi5nZXRYWUNoYXJ0RGF0YSgpLnBsb3RzWzBdLmRhdGEubWFwKChkYXRhKSA9PiBkYXRhWzFdKTtcbiAgZnVuY3Rpb24gZ2V0RG9taW5hbnRCYXNlTGluZShob3Jpem9udGFsUG9zKSB7XG4gICAgcmV0dXJuIGhvcml6b250YWxQb3MgPT09IFwidG9wXCIgPyBcInRleHQtYmVmb3JlLWVkZ2VcIiA6IFwibWlkZGxlXCI7XG4gIH1cbiAgX19uYW1lKGdldERvbWluYW50QmFzZUxpbmUsIFwiZ2V0RG9taW5hbnRCYXNlTGluZVwiKTtcbiAgZnVuY3Rpb24gZ2V0VGV4dEFuY2hvcih2ZXJ0aWNhbFBvcykge1xuICAgIHJldHVybiB2ZXJ0aWNhbFBvcyA9PT0gXCJsZWZ0XCIgPyBcInN0YXJ0XCIgOiB2ZXJ0aWNhbFBvcyA9PT0gXCJyaWdodFwiID8gXCJlbmRcIiA6IFwibWlkZGxlXCI7XG4gIH1cbiAgX19uYW1lKGdldFRleHRBbmNob3IsIFwiZ2V0VGV4dEFuY2hvclwiKTtcbiAgZnVuY3Rpb24gZ2V0VGV4dFRyYW5zZm9ybWF0aW9uKGRhdGEpIHtcbiAgICByZXR1cm4gYHRyYW5zbGF0ZSgke2RhdGEueH0sICR7ZGF0YS55fSkgcm90YXRlKCR7ZGF0YS5yb3RhdGlvbiB8fCAwfSlgO1xuICB9XG4gIF9fbmFtZShnZXRUZXh0VHJhbnNmb3JtYXRpb24sIFwiZ2V0VGV4dFRyYW5zZm9ybWF0aW9uXCIpO1xuICBsb2cuZGVidWcoXCJSZW5kZXJpbmcgeHljaGFydCBjaGFydFxcblwiICsgdHh0KTtcbiAgY29uc3Qgc3ZnID0gc2VsZWN0U3ZnRWxlbWVudChpZCk7XG4gIGNvbnN0IGdyb3VwID0gc3ZnLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwibWFpblwiKTtcbiAgY29uc3QgYmFja2dyb3VuZCA9IGdyb3VwLmFwcGVuZChcInJlY3RcIikuYXR0cihcIndpZHRoXCIsIGNoYXJ0Q29uZmlnLndpZHRoKS5hdHRyKFwiaGVpZ2h0XCIsIGNoYXJ0Q29uZmlnLmhlaWdodCkuYXR0cihcImNsYXNzXCIsIFwiYmFja2dyb3VuZFwiKTtcbiAgY29uZmlndXJlU3ZnU2l6ZShzdmcsIGNoYXJ0Q29uZmlnLmhlaWdodCwgY2hhcnRDb25maWcud2lkdGgsIHRydWUpO1xuICBzdmcuYXR0cihcInZpZXdCb3hcIiwgYDAgMCAke2NoYXJ0Q29uZmlnLndpZHRofSAke2NoYXJ0Q29uZmlnLmhlaWdodH1gKTtcbiAgYmFja2dyb3VuZC5hdHRyKFwiZmlsbFwiLCB0aGVtZUNvbmZpZy5iYWNrZ3JvdW5kQ29sb3IpO1xuICBkYi5zZXRUbXBTVkdHKHN2Zy5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1lcm1haWQtdG1wLWdyb3VwXCIpKTtcbiAgY29uc3Qgc2hhcGVzID0gZGIuZ2V0RHJhd2FibGVFbGVtKCk7XG4gIGNvbnN0IGdyb3VwcyA9IHt9O1xuICBmdW5jdGlvbiBnZXRHcm91cChnTGlzdCkge1xuICAgIGxldCBlbGVtID0gZ3JvdXA7XG4gICAgbGV0IHByZWZpeCA9IFwiXCI7XG4gICAgZm9yIChjb25zdCBbaV0gb2YgZ0xpc3QuZW50cmllcygpKSB7XG4gICAgICBsZXQgcGFyZW50ID0gZ3JvdXA7XG4gICAgICBpZiAoaSA+IDAgJiYgZ3JvdXBzW3ByZWZpeF0pIHtcbiAgICAgICAgcGFyZW50ID0gZ3JvdXBzW3ByZWZpeF07XG4gICAgICB9XG4gICAgICBwcmVmaXggKz0gZ0xpc3RbaV07XG4gICAgICBlbGVtID0gZ3JvdXBzW3ByZWZpeF07XG4gICAgICBpZiAoIWVsZW0pIHtcbiAgICAgICAgZWxlbSA9IGdyb3Vwc1twcmVmaXhdID0gcGFyZW50LmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIGdMaXN0W2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVsZW07XG4gIH1cbiAgX19uYW1lKGdldEdyb3VwLCBcImdldEdyb3VwXCIpO1xuICBmb3IgKGNvbnN0IHNoYXBlIG9mIHNoYXBlcykge1xuICAgIGlmIChzaGFwZS5kYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNvbnN0IHNoYXBlR3JvdXAgPSBnZXRHcm91cChzaGFwZS5ncm91cFRleHRzKTtcbiAgICBzd2l0Y2ggKHNoYXBlLnR5cGUpIHtcbiAgICAgIGNhc2UgXCJyZWN0XCI6XG4gICAgICAgIHNoYXBlR3JvdXAuc2VsZWN0QWxsKFwicmVjdFwiKS5kYXRhKHNoYXBlLmRhdGEpLmVudGVyKCkuYXBwZW5kKFwicmVjdFwiKS5hdHRyKFwieFwiLCAoZGF0YSkgPT4gZGF0YS54KS5hdHRyKFwieVwiLCAoZGF0YSkgPT4gZGF0YS55KS5hdHRyKFwid2lkdGhcIiwgKGRhdGEpID0+IGRhdGEud2lkdGgpLmF0dHIoXCJoZWlnaHRcIiwgKGRhdGEpID0+IGRhdGEuaGVpZ2h0KS5hdHRyKFwiZmlsbFwiLCAoZGF0YSkgPT4gZGF0YS5maWxsKS5hdHRyKFwic3Ryb2tlXCIsIChkYXRhKSA9PiBkYXRhLnN0cm9rZUZpbGwpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgKGRhdGEpID0+IGRhdGEuc3Ryb2tlV2lkdGgpO1xuICAgICAgICBpZiAoY2hhcnRDb25maWcuc2hvd0RhdGFMYWJlbCkge1xuICAgICAgICAgIGNvbnN0IHNob3dEYXRhTGFiZWxPdXRzaWRlQmFyID0gY2hhcnRDb25maWcuc2hvd0RhdGFMYWJlbE91dHNpZGVCYXI7XG4gICAgICAgICAgaWYgKGNoYXJ0Q29uZmlnLmNoYXJ0T3JpZW50YXRpb24gPT09IFwiaG9yaXpvbnRhbFwiKSB7XG4gICAgICAgICAgICBsZXQgZml0c0hvcml6b250YWxseTIgPSBmdW5jdGlvbihpdGVtLCBmb250U2l6ZSkge1xuICAgICAgICAgICAgICBjb25zdCB7IGRhdGEsIGxhYmVsIH0gPSBpdGVtO1xuICAgICAgICAgICAgICBjb25zdCB0ZXh0V2lkdGggPSBmb250U2l6ZSAqIGxhYmVsLmxlbmd0aCAqIGNoYXJXaWR0aEZhY3RvcjtcbiAgICAgICAgICAgICAgcmV0dXJuIHRleHRXaWR0aCA8PSBkYXRhLndpZHRoIC0gcmlnaHRNYXJnaW47XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIGZpdHNIb3Jpem9udGFsbHkgPSBmaXRzSG9yaXpvbnRhbGx5MjtcbiAgICAgICAgICAgIF9fbmFtZShmaXRzSG9yaXpvbnRhbGx5MiwgXCJmaXRzSG9yaXpvbnRhbGx5XCIpO1xuICAgICAgICAgICAgY29uc3QgY2hhcldpZHRoRmFjdG9yID0gMC43O1xuICAgICAgICAgICAgY29uc3QgcmlnaHRNYXJnaW4gPSAxMDtcbiAgICAgICAgICAgIGNvbnN0IHZhbGlkSXRlbXMgPSBzaGFwZS5kYXRhLm1hcCgoZCwgaSkgPT4gKHsgZGF0YTogZCwgbGFiZWw6IGxhYmVsRGF0YVtpXS50b1N0cmluZygpIH0pKS5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uZGF0YS53aWR0aCA+IDAgJiYgaXRlbS5kYXRhLmhlaWdodCA+IDApO1xuICAgICAgICAgICAgY29uc3QgY2FuZGlkYXRlRm9udFNpemVzID0gdmFsaWRJdGVtcy5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgeyBkYXRhIH0gPSBpdGVtO1xuICAgICAgICAgICAgICBsZXQgZm9udFNpemUgPSBkYXRhLmhlaWdodCAqIDAuNztcbiAgICAgICAgICAgICAgd2hpbGUgKCFmaXRzSG9yaXpvbnRhbGx5MihpdGVtLCBmb250U2l6ZSkgJiYgZm9udFNpemUgPiAwKSB7XG4gICAgICAgICAgICAgICAgZm9udFNpemUgLT0gMTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gZm9udFNpemU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHVuaWZvcm1Gb250U2l6ZSA9IE1hdGguZmxvb3IoTWF0aC5taW4oLi4uY2FuZGlkYXRlRm9udFNpemVzKSk7XG4gICAgICAgICAgICBjb25zdCBkZXRlcm1pbmVMYWJlbFhQb3NpdGlvbiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgaWYgKHNob3dEYXRhTGFiZWxPdXRzaWRlQmFyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZGF0YS54ICsgaXRlbS5kYXRhLndpZHRoICsgcmlnaHRNYXJnaW47XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZGF0YS54ICsgaXRlbS5kYXRhLndpZHRoIC0gcmlnaHRNYXJnaW47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIFwiZGV0ZXJtaW5lTGFiZWxYUG9zaXRpb25cIik7XG4gICAgICAgICAgICBzaGFwZUdyb3VwLnNlbGVjdEFsbChcInRleHRcIikuZGF0YSh2YWxpZEl0ZW1zKS5lbnRlcigpLmFwcGVuZChcInRleHRcIikuYXR0cihcInhcIiwgZGV0ZXJtaW5lTGFiZWxYUG9zaXRpb24pLmF0dHIoXCJ5XCIsIChpdGVtKSA9PiBpdGVtLmRhdGEueSArIGl0ZW0uZGF0YS5oZWlnaHQgLyAyKS5hdHRyKFwidGV4dC1hbmNob3JcIiwgc2hvd0RhdGFMYWJlbE91dHNpZGVCYXIgPyBcInN0YXJ0XCIgOiBcImVuZFwiKS5hdHRyKFwiZG9taW5hbnQtYmFzZWxpbmVcIiwgXCJtaWRkbGVcIikuYXR0cihcImZpbGxcIiwgdGhlbWVDb25maWcuZGF0YUxhYmVsQ29sb3IpLmF0dHIoXCJmb250LXNpemVcIiwgYCR7dW5pZm9ybUZvbnRTaXplfXB4YCkudGV4dCgoaXRlbSkgPT4gaXRlbS5sYWJlbCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxldCBmaXRzSW5CYXIyID0gZnVuY3Rpb24oaXRlbSwgZm9udFNpemUsIHlPZmZzZXQyKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHsgZGF0YSwgbGFiZWwgfSA9IGl0ZW07XG4gICAgICAgICAgICAgIGNvbnN0IGNoYXJXaWR0aEZhY3RvciA9IDAuNztcbiAgICAgICAgICAgICAgY29uc3QgdGV4dFdpZHRoID0gZm9udFNpemUgKiBsYWJlbC5sZW5ndGggKiBjaGFyV2lkdGhGYWN0b3I7XG4gICAgICAgICAgICAgIGNvbnN0IGNlbnRlclggPSBkYXRhLnggKyBkYXRhLndpZHRoIC8gMjtcbiAgICAgICAgICAgICAgY29uc3QgbGVmdEVkZ2UgPSBjZW50ZXJYIC0gdGV4dFdpZHRoIC8gMjtcbiAgICAgICAgICAgICAgY29uc3QgcmlnaHRFZGdlID0gY2VudGVyWCArIHRleHRXaWR0aCAvIDI7XG4gICAgICAgICAgICAgIGNvbnN0IGhvcml6b250YWxGaXRzID0gbGVmdEVkZ2UgPj0gZGF0YS54ICYmIHJpZ2h0RWRnZSA8PSBkYXRhLnggKyBkYXRhLndpZHRoO1xuICAgICAgICAgICAgICBjb25zdCB2ZXJ0aWNhbEZpdHMgPSBkYXRhLnkgKyB5T2Zmc2V0MiArIGZvbnRTaXplIDw9IGRhdGEueSArIGRhdGEuaGVpZ2h0O1xuICAgICAgICAgICAgICByZXR1cm4gaG9yaXpvbnRhbEZpdHMgJiYgdmVydGljYWxGaXRzO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBmaXRzSW5CYXIgPSBmaXRzSW5CYXIyO1xuICAgICAgICAgICAgX19uYW1lKGZpdHNJbkJhcjIsIFwiZml0c0luQmFyXCIpO1xuICAgICAgICAgICAgY29uc3QgeU9mZnNldCA9IDEwO1xuICAgICAgICAgICAgY29uc3QgdmFsaWRJdGVtcyA9IHNoYXBlLmRhdGEubWFwKChkLCBpKSA9PiAoeyBkYXRhOiBkLCBsYWJlbDogbGFiZWxEYXRhW2ldLnRvU3RyaW5nKCkgfSkpLmZpbHRlcigoaXRlbSkgPT4gaXRlbS5kYXRhLndpZHRoID4gMCAmJiBpdGVtLmRhdGEuaGVpZ2h0ID4gMCk7XG4gICAgICAgICAgICBjb25zdCBjYW5kaWRhdGVGb250U2l6ZXMgPSB2YWxpZEl0ZW1zLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCB7IGRhdGEsIGxhYmVsIH0gPSBpdGVtO1xuICAgICAgICAgICAgICBsZXQgZm9udFNpemUgPSBkYXRhLndpZHRoIC8gKGxhYmVsLmxlbmd0aCAqIDAuNyk7XG4gICAgICAgICAgICAgIHdoaWxlICghZml0c0luQmFyMihpdGVtLCBmb250U2l6ZSwgeU9mZnNldCkgJiYgZm9udFNpemUgPiAwKSB7XG4gICAgICAgICAgICAgICAgZm9udFNpemUgLT0gMTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gZm9udFNpemU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHVuaWZvcm1Gb250U2l6ZSA9IE1hdGguZmxvb3IoTWF0aC5taW4oLi4uY2FuZGlkYXRlRm9udFNpemVzKSk7XG4gICAgICAgICAgICBjb25zdCBkZXRlcm1pbmVMYWJlbFlQb3NpdGlvbiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgaWYgKHNob3dEYXRhTGFiZWxPdXRzaWRlQmFyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0uZGF0YS55IC0geU9mZnNldDtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5kYXRhLnkgKyB5T2Zmc2V0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBcImRldGVybWluZUxhYmVsWVBvc2l0aW9uXCIpO1xuICAgICAgICAgICAgc2hhcGVHcm91cC5zZWxlY3RBbGwoXCJ0ZXh0XCIpLmRhdGEodmFsaWRJdGVtcykuZW50ZXIoKS5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJ4XCIsIChpdGVtKSA9PiBpdGVtLmRhdGEueCArIGl0ZW0uZGF0YS53aWR0aCAvIDIpLmF0dHIoXCJ5XCIsIGRldGVybWluZUxhYmVsWVBvc2l0aW9uKS5hdHRyKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIikuYXR0cihcImRvbWluYW50LWJhc2VsaW5lXCIsIHNob3dEYXRhTGFiZWxPdXRzaWRlQmFyID8gXCJhdXRvXCIgOiBcImhhbmdpbmdcIikuYXR0cihcImZpbGxcIiwgdGhlbWVDb25maWcuZGF0YUxhYmVsQ29sb3IpLmF0dHIoXCJmb250LXNpemVcIiwgYCR7dW5pZm9ybUZvbnRTaXplfXB4YCkudGV4dCgoaXRlbSkgPT4gaXRlbS5sYWJlbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInRleHRcIjpcbiAgICAgICAgc2hhcGVHcm91cC5zZWxlY3RBbGwoXCJ0ZXh0XCIpLmRhdGEoc2hhcGUuZGF0YSkuZW50ZXIoKS5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJ4XCIsIDApLmF0dHIoXCJ5XCIsIDApLmF0dHIoXCJmaWxsXCIsIChkYXRhKSA9PiBkYXRhLmZpbGwpLmF0dHIoXCJmb250LXNpemVcIiwgKGRhdGEpID0+IGRhdGEuZm9udFNpemUpLmF0dHIoXCJkb21pbmFudC1iYXNlbGluZVwiLCAoZGF0YSkgPT4gZ2V0RG9taW5hbnRCYXNlTGluZShkYXRhLnZlcnRpY2FsUG9zKSkuYXR0cihcInRleHQtYW5jaG9yXCIsIChkYXRhKSA9PiBnZXRUZXh0QW5jaG9yKGRhdGEuaG9yaXpvbnRhbFBvcykpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgKGRhdGEpID0+IGdldFRleHRUcmFuc2Zvcm1hdGlvbihkYXRhKSkudGV4dCgoZGF0YSkgPT4gZGF0YS50ZXh0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwicGF0aFwiOlxuICAgICAgICBzaGFwZUdyb3VwLnNlbGVjdEFsbChcInBhdGhcIikuZGF0YShzaGFwZS5kYXRhKS5lbnRlcigpLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgKGRhdGEpID0+IGRhdGEucGF0aCkuYXR0cihcImZpbGxcIiwgKGRhdGEpID0+IGRhdGEuZmlsbCA/IGRhdGEuZmlsbCA6IFwibm9uZVwiKS5hdHRyKFwic3Ryb2tlXCIsIChkYXRhKSA9PiBkYXRhLnN0cm9rZUZpbGwpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgKGRhdGEpID0+IGRhdGEuc3Ryb2tlV2lkdGgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn0sIFwiZHJhd1wiKTtcbnZhciB4eWNoYXJ0UmVuZGVyZXJfZGVmYXVsdCA9IHtcbiAgZHJhd1xufTtcblxuLy8gc3JjL2RpYWdyYW1zL3h5Y2hhcnQveHljaGFydERpYWdyYW0udHNcbnZhciBkaWFncmFtID0ge1xuICBwYXJzZXI6IHh5Y2hhcnRfZGVmYXVsdCxcbiAgZGI6IHh5Y2hhcnREYl9kZWZhdWx0LFxuICByZW5kZXJlcjogeHljaGFydFJlbmRlcmVyX2RlZmF1bHRcbn07XG5leHBvcnQge1xuICBkaWFncmFtXG59O1xuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZCQSxJQUFJLFNBQVUsUUFBUSxHQUFHO0FBQUEsRUFDdkIsSUFBSSxvQkFBb0IsT0FBTyxRQUFRLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRztBQUFBLElBQ25ELEtBQUssS0FBSyxNQUFNLENBQUMsR0FBRyxJQUFJLEVBQUUsT0FBUSxLQUFLLEdBQUcsRUFBRSxNQUFNO0FBQUE7QUFBQSxJQUNsRCxPQUFPO0FBQUEsS0FDTixHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFO0FBQUEsRUFDN3BCLElBQUksVUFBVTtBQUFBLElBQ1osdUJBQXVCLE9BQU8sU0FBUyxLQUFLLEdBQUcsSUFDNUMsT0FBTztBQUFBLElBQ1YsSUFBSSxDQUFDO0FBQUEsSUFDTCxVQUFVLEVBQUUsT0FBUyxHQUFHLE9BQVMsR0FBRyxLQUFPLEdBQUcsU0FBVyxHQUFHLGFBQWUsR0FBRyxVQUFZLEdBQUcsbUJBQXFCLEdBQUcsV0FBYSxHQUFHLE9BQVMsSUFBSSxNQUFRLElBQUksUUFBVSxJQUFJLFlBQWMsSUFBSSxRQUFVLElBQUksWUFBYyxJQUFJLE1BQVEsSUFBSSxVQUFZLElBQUksS0FBTyxJQUFJLFdBQWEsSUFBSSxpQkFBbUIsSUFBSSxXQUFhLElBQUksaUJBQW1CLElBQUksMkJBQTZCLElBQUkscUJBQXVCLElBQUksdUJBQXlCLElBQUksbUJBQXFCLElBQUkscUJBQXVCLElBQUksT0FBUyxJQUFJLFdBQWEsSUFBSSxVQUFZLElBQUksaUJBQW1CLElBQUkscUJBQXVCLElBQUksV0FBYSxJQUFJLFNBQVcsSUFBSSxNQUFRLElBQUksS0FBTyxJQUFJLFVBQVksSUFBSSxLQUFPLElBQUksUUFBVSxJQUFJLGVBQWlCLElBQUksS0FBTyxJQUFJLEtBQU8sSUFBSSxPQUFTLElBQUksTUFBUSxJQUFJLFFBQVUsSUFBSSxNQUFRLElBQUksS0FBTyxJQUFJLE1BQVEsSUFBSSxPQUFTLElBQUksWUFBYyxJQUFJLFNBQVcsR0FBRyxNQUFRLEVBQUU7QUFBQSxJQUM5MEIsWUFBWSxFQUFFLEdBQUcsU0FBUyxHQUFHLFdBQVcsR0FBRyxxQkFBcUIsSUFBSSxTQUFTLElBQUksVUFBVSxJQUFJLFVBQVUsSUFBSSxRQUFRLElBQUksT0FBTyxJQUFJLGFBQWEsSUFBSSxtQkFBbUIsSUFBSSxhQUFhLElBQUksbUJBQW1CLElBQUksNkJBQTZCLElBQUksdUJBQXVCLElBQUkscUJBQXFCLElBQUksdUJBQXVCLElBQUksU0FBUyxJQUFJLG1CQUFtQixJQUFJLFdBQVcsSUFBSSxRQUFRLElBQUksT0FBTyxJQUFJLE9BQU8sSUFBSSxVQUFVLElBQUksT0FBTyxJQUFJLE9BQU8sSUFBSSxTQUFTLElBQUksUUFBUSxJQUFJLFVBQVUsSUFBSSxRQUFRLElBQUksT0FBTyxJQUFJLFFBQVEsSUFBSSxTQUFTLElBQUksYUFBYTtBQUFBLElBQ2ppQixjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdB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S0FBSyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssS0FBSyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMs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QUcsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsV0FBYSxLQUFLLEdBQUcsV0FBYSxFQUFFLE9BQVMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxXQUFhLEtBQUssR0FBRyxxQkFBdUIsRUFBRSxPQUFTLENBQUMsSUFBSSxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcsV0FBYSxFQUFFLE9BQVMsQ0FBQyxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcsV0FBYSxFQUFFLE9BQVMsQ0FBQyxDQUFDLEdBQUcsV0FBYSxNQUFNLEdBQUcsT0FBUyxFQUFFLE9BQVMsQ0FBQyxHQUFHLFdBQWEsTUFBTSxHQUFHLFdBQWEsRUFBRSxPQUFTLENBQUMsR0FBRyxXQUFhLE1BQU0sR0FBRyxRQUFVLEVBQUUsT0FBUyxDQUFDLElBQUksRUFBRSxHQUFHLFdBQWEsTUFBTSxHQUFHLFNBQVcsRUFBRSxPQUFTLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLFdBQWEsS0FBSyxFQUFFO0FBQUEsSUFDOXRDO0FBQUEsSUFD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
