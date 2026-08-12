import {
  selectSvgElement
} from "./chunk-main-f3t3xmmb.js";
import {
  getIconStyles
} from "./chunk-main-0ekgv9a6.js";
import {
  JSON_SCHEMA,
  load
} from "./chunk-main-vzv70y3p.js";
import {
  insertCluster,
  insertNode,
  positionNode
} from "./chunk-main-xxv6x4s9.js";
import"./chunk-main-2se6cwec.js";
import"./chunk-main-4ceh9h9g.js";
import"./chunk-main-s8463nwg.js";
import"./chunk-main-wsp4jakw.js";
import"./chunk-main-vvfzntzy.js";
import"./chunk-main-ck580f0k.js";
import {
  darken_default,
  defaultConfig_default,
  getConfig2,
  is_dark_default,
  lighten_default,
  sanitizeText,
  setupGraphViewbox
} from "./chunk-main-aws590jt.js";
import {
  __name,
  log
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/kanban-definition-UN3LZRKU.mjs
var parser = function() {
  var o = /* @__PURE__ */ __name(function(k, v, o2, l) {
    for (o2 = o2 || {}, l = k.length;l--; o2[k[l]] = v)
      ;
    return o2;
  }, "o"), $V0 = [1, 4], $V1 = [1, 13], $V2 = [1, 12], $V3 = [1, 15], $V4 = [1, 16], $V5 = [1, 20], $V6 = [1, 19], $V7 = [6, 7, 8], $V8 = [1, 26], $V9 = [1, 24], $Va = [1, 25], $Vb = [6, 7, 11], $Vc = [1, 31], $Vd = [6, 7, 11, 24], $Ve = [1, 6, 13, 16, 17, 20, 23], $Vf = [1, 35], $Vg = [1, 36], $Vh = [1, 6, 7, 11, 13, 16, 17, 20, 23], $Vi = [1, 38];
  var parser2 = {
    trace: /* @__PURE__ */ __name(function trace() {}, "trace"),
    yy: {},
    symbols_: { error: 2, start: 3, mindMap: 4, spaceLines: 5, SPACELINE: 6, NL: 7, KANBAN: 8, document: 9, stop: 10, EOF: 11, statement: 12, SPACELIST: 13, node: 14, shapeData: 15, ICON: 16, CLASS: 17, nodeWithId: 18, nodeWithoutId: 19, NODE_DSTART: 20, NODE_DESCR: 21, NODE_DEND: 22, NODE_ID: 23, SHAPE_DATA: 24, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 6: "SPACELINE", 7: "NL", 8: "KANBAN", 11: "EOF", 13: "SPACELIST", 16: "ICON", 17: "CLASS", 20: "NODE_DSTART", 21: "NODE_DESCR", 22: "NODE_DEND", 23: "NODE_ID", 24: "SHAPE_DATA" },
    productions_: [0, [3, 1], [3, 2], [5, 1], [5, 2], [5, 2], [4, 2], [4, 3], [10, 1], [10, 1], [10, 1], [10, 2], [10, 2], [9, 3], [9, 2], [12, 3], [12, 2], [12, 2], [12, 2], [12, 1], [12, 2], [12, 1], [12, 1], [12, 1], [12, 1], [14, 1], [14, 1], [19, 3], [18, 1], [18, 4], [15, 2], [15, 1]],
    performAction: /* @__PURE__ */ __name(function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
      var $0 = $$.length - 1;
      switch (yystate) {
        case 6:
        case 7:
          return yy;
          break;
        case 8:
          yy.getLogger().trace("Stop NL ");
          break;
        case 9:
          yy.getLogger().trace("Stop EOF ");
          break;
        case 11:
          yy.getLogger().trace("Stop NL2 ");
          break;
        case 12:
          yy.getLogger().trace("Stop EOF2 ");
          break;
        case 15:
          yy.getLogger().info("Node: ", $$[$0 - 1].id);
          yy.addNode($$[$0 - 2].length, $$[$0 - 1].id, $$[$0 - 1].descr, $$[$0 - 1].type, $$[$0]);
          break;
        case 16:
          yy.getLogger().info("Node: ", $$[$0].id);
          yy.addNode($$[$0 - 1].length, $$[$0].id, $$[$0].descr, $$[$0].type);
          break;
        case 17:
          yy.getLogger().trace("Icon: ", $$[$0]);
          yy.decorateNode({ icon: $$[$0] });
          break;
        case 18:
        case 23:
          yy.decorateNode({ class: $$[$0] });
          break;
        case 19:
          yy.getLogger().trace("SPACELIST");
          break;
        case 20:
          yy.getLogger().trace("Node: ", $$[$0 - 1].id);
          yy.addNode(0, $$[$0 - 1].id, $$[$0 - 1].descr, $$[$0 - 1].type, $$[$0]);
          break;
        case 21:
          yy.getLogger().trace("Node: ", $$[$0].id);
          yy.addNode(0, $$[$0].id, $$[$0].descr, $$[$0].type);
          break;
        case 22:
          yy.decorateNode({ icon: $$[$0] });
          break;
        case 27:
          yy.getLogger().trace("node found ..", $$[$0 - 2]);
          this.$ = { id: $$[$0 - 1], descr: $$[$0 - 1], type: yy.getType($$[$0 - 2], $$[$0]) };
          break;
        case 28:
          this.$ = { id: $$[$0], descr: $$[$0], type: 0 };
          break;
        case 29:
          yy.getLogger().trace("node found ..", $$[$0 - 3]);
          this.$ = { id: $$[$0 - 3], descr: $$[$0 - 1], type: yy.getType($$[$0 - 2], $$[$0]) };
          break;
        case 30:
          this.$ = $$[$0 - 1] + $$[$0];
          break;
        case 31:
          this.$ = $$[$0];
          break;
      }
    }, "anonymous"),
    table: [{ 3: 1, 4: 2, 5: 3, 6: [1, 5], 8: $V0 }, { 1: [3] }, { 1: [2, 1] }, { 4: 6, 6: [1, 7], 7: [1, 8], 8: $V0 }, { 6: $V1, 7: [1, 10], 9: 9, 12: 11, 13: $V2, 14: 14, 16: $V3, 17: $V4, 18: 17, 19: 18, 20: $V5, 23: $V6 }, o($V7, [2, 3]), { 1: [2, 2] }, o($V7, [2, 4]), o($V7, [2, 5]), { 1: [2, 6], 6: $V1, 12: 21, 13: $V2, 14: 14, 16: $V3, 17: $V4, 18: 17, 19: 18, 20: $V5, 23: $V6 }, { 6: $V1, 9: 22, 12: 11, 13: $V2, 14: 14, 16: $V3, 17: $V4, 18: 17, 19: 18, 20: $V5, 23: $V6 }, { 6: $V8, 7: $V9, 10: 23, 11: $Va }, o($Vb, [2, 24], { 18: 17, 19: 18, 14: 27, 16: [1, 28], 17: [1, 29], 20: $V5, 23: $V6 }), o($Vb, [2, 19]), o($Vb, [2, 21], { 15: 30, 24: $Vc }), o($Vb, [2, 22]), o($Vb, [2, 23]), o($Vd, [2, 25]), o($Vd, [2, 26]), o($Vd, [2, 28], { 20: [1, 32] }), { 21: [1, 33] }, { 6: $V8, 7: $V9, 10: 34, 11: $Va }, { 1: [2, 7], 6: $V1, 12: 21, 13: $V2, 14: 14, 16: $V3, 17: $V4, 18: 17, 19: 18, 20: $V5, 23: $V6 }, o($Ve, [2, 14], { 7: $Vf, 11: $Vg }), o($Vh, [2, 8]), o($Vh, [2, 9]), o($Vh, [2, 10]), o($Vb, [2, 16], { 15: 37, 24: $Vc }), o($Vb, [2, 17]), o($Vb, [2, 18]), o($Vb, [2, 20], { 24: $Vi }), o($Vd, [2, 31]), { 21: [1, 39] }, { 22: [1, 40] }, o($Ve, [2, 13], { 7: $Vf, 11: $Vg }), o($Vh, [2, 11]), o($Vh, [2, 12]), o($Vb, [2, 15], { 24: $Vi }), o($Vd, [2, 30]), { 22: [1, 41] }, o($Vd, [2, 27]), o($Vd, [2, 29])],
    defaultActions: { 2: [2, 1], 6: [2, 2] },
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
            this.pushState("shapeData");
            yy_.yytext = "";
            return 24;
            break;
          case 1:
            this.pushState("shapeDataStr");
            return 24;
            break;
          case 2:
            this.popState();
            return 24;
            break;
          case 3:
            const re = /\n\s*/g;
            yy_.yytext = yy_.yytext.replace(re, "<br/>");
            return 24;
            break;
          case 4:
            return 24;
            break;
          case 5:
            this.popState();
            break;
          case 6:
            yy.getLogger().trace("Found comment", yy_.yytext);
            return 6;
            break;
          case 7:
            return 8;
            break;
          case 8:
            this.begin("CLASS");
            break;
          case 9:
            this.popState();
            return 17;
            break;
          case 10:
            this.popState();
            break;
          case 11:
            yy.getLogger().trace("Begin icon");
            this.begin("ICON");
            break;
          case 12:
            yy.getLogger().trace("SPACELINE");
            return 6;
            break;
          case 13:
            return 7;
            break;
          case 14:
            return 16;
            break;
          case 15:
            yy.getLogger().trace("end icon");
            this.popState();
            break;
          case 16:
            yy.getLogger().trace("Exploding node");
            this.begin("NODE");
            return 20;
            break;
          case 17:
            yy.getLogger().trace("Cloud");
            this.begin("NODE");
            return 20;
            break;
          case 18:
            yy.getLogger().trace("Explosion Bang");
            this.begin("NODE");
            return 20;
            break;
          case 19:
            yy.getLogger().trace("Cloud Bang");
            this.begin("NODE");
            return 20;
            break;
          case 20:
            this.begin("NODE");
            return 20;
            break;
          case 21:
            this.begin("NODE");
            return 20;
            break;
          case 22:
            this.begin("NODE");
            return 20;
            break;
          case 23:
            this.begin("NODE");
            return 20;
            break;
          case 24:
            return 13;
            break;
          case 25:
            return 23;
            break;
          case 26:
            return 11;
            break;
          case 27:
            this.begin("NSTR2");
            break;
          case 28:
            return "NODE_DESCR";
            break;
          case 29:
            this.popState();
            break;
          case 30:
            yy.getLogger().trace("Starting NSTR");
            this.begin("NSTR");
            break;
          case 31:
            yy.getLogger().trace("description:", yy_.yytext);
            return "NODE_DESCR";
            break;
          case 32:
            this.popState();
            break;
          case 33:
            this.popState();
            yy.getLogger().trace("node end ))");
            return "NODE_DEND";
            break;
          case 34:
            this.popState();
            yy.getLogger().trace("node end )");
            return "NODE_DEND";
            break;
          case 35:
            this.popState();
            yy.getLogger().trace("node end ...", yy_.yytext);
            return "NODE_DEND";
            break;
          case 36:
            this.popState();
            yy.getLogger().trace("node end ((");
            return "NODE_DEND";
            break;
          case 37:
            this.popState();
            yy.getLogger().trace("node end (-");
            return "NODE_DEND";
            break;
          case 38:
            this.popState();
            yy.getLogger().trace("node end (-");
            return "NODE_DEND";
            break;
          case 39:
            this.popState();
            yy.getLogger().trace("node end ((");
            return "NODE_DEND";
            break;
          case 40:
            this.popState();
            yy.getLogger().trace("node end ((");
            return "NODE_DEND";
            break;
          case 41:
            yy.getLogger().trace("Long description:", yy_.yytext);
            return 21;
            break;
          case 42:
            yy.getLogger().trace("Long description:", yy_.yytext);
            return 21;
            break;
        }
      }, "anonymous"),
      rules: [/^(?:@\{)/i, /^(?:["])/i, /^(?:["])/i, /^(?:[^\"]+)/i, /^(?:[^}^"]+)/i, /^(?:\})/i, /^(?:\s*%%.*)/i, /^(?:kanban\b)/i, /^(?::::)/i, /^(?:.+)/i, /^(?:\n)/i, /^(?:::icon\()/i, /^(?:[\s]+[\n])/i, /^(?:[\n]+)/i, /^(?:[^\)]+)/i, /^(?:\))/i, /^(?:-\))/i, /^(?:\(-)/i, /^(?:\)\))/i, /^(?:\))/i, /^(?:\(\()/i, /^(?:\{\{)/i, /^(?:\()/i, /^(?:\[)/i, /^(?:[\s]+)/i, /^(?:[^\(\[\n\)\{\}@]+)/i, /^(?:$)/i, /^(?:["][`])/i, /^(?:[^`"]+)/i, /^(?:[`]["])/i, /^(?:["])/i, /^(?:[^"]+)/i, /^(?:["])/i, /^(?:[\)]\))/i, /^(?:[\)])/i, /^(?:[\]])/i, /^(?:\}\})/i, /^(?:\(-)/i, /^(?:-\))/i, /^(?:\(\()/i, /^(?:\()/i, /^(?:[^\)\]\(\}]+)/i, /^(?:.+(?!\(\())/i],
      conditions: { shapeDataEndBracket: { rules: [], inclusive: false }, shapeDataStr: { rules: [2, 3], inclusive: false }, shapeData: { rules: [1, 4, 5], inclusive: false }, CLASS: { rules: [9, 10], inclusive: false }, ICON: { rules: [14, 15], inclusive: false }, NSTR2: { rules: [28, 29], inclusive: false }, NSTR: { rules: [31, 32], inclusive: false }, NODE: { rules: [27, 30, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42], inclusive: false }, INITIAL: { rules: [0, 6, 7, 8, 11, 12, 13, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26], inclusive: true } }
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
var kanban_default = parser;
var nodes = [];
var sections = [];
var cnt = 0;
var elements = {};
var clear = /* @__PURE__ */ __name(() => {
  nodes = [];
  sections = [];
  cnt = 0;
  elements = {};
}, "clear");
var getSection = /* @__PURE__ */ __name((level) => {
  if (nodes.length === 0) {
    return null;
  }
  const sectionLevel = nodes[0].level;
  let lastSection = null;
  for (let i = nodes.length - 1;i >= 0; i--) {
    if (nodes[i].level === sectionLevel && !lastSection) {
      lastSection = nodes[i];
    }
    if (nodes[i].level < sectionLevel) {
      throw new Error('Items without section detected, found section ("' + nodes[i].label + '")');
    }
  }
  if (level === lastSection?.level) {
    return null;
  }
  return lastSection;
}, "getSection");
var getSections = /* @__PURE__ */ __name(function() {
  return sections;
}, "getSections");
var getData = /* @__PURE__ */ __name(function() {
  const edges = [];
  const _nodes = [];
  const sections2 = getSections();
  const conf = getConfig2();
  for (const section of sections2) {
    const node = {
      id: section.id,
      label: sanitizeText(section.label ?? "", conf),
      labelType: "markdown",
      isGroup: true,
      ticket: section.ticket,
      shape: "kanbanSection",
      level: section.level,
      look: conf.look
    };
    _nodes.push(node);
    const children = nodes.filter((n) => n.parentId === section.id);
    for (const item of children) {
      const childNode = {
        id: item.id,
        parentId: section.id,
        label: sanitizeText(item.label ?? "", conf),
        labelType: "markdown",
        isGroup: false,
        ticket: item?.ticket,
        priority: item?.priority,
        assigned: item?.assigned,
        icon: item?.icon,
        shape: "kanbanItem",
        level: item.level,
        rx: 5,
        ry: 5,
        cssStyles: ["text-align: left"]
      };
      _nodes.push(childNode);
    }
  }
  return { nodes: _nodes, edges, other: {}, config: getConfig2() };
}, "getData");
var addNode = /* @__PURE__ */ __name((level, id, descr, type, shapeData) => {
  const conf = getConfig2();
  let padding = conf.mindmap?.padding ?? defaultConfig_default.mindmap.padding;
  switch (type) {
    case nodeType.ROUNDED_RECT:
    case nodeType.RECT:
    case nodeType.HEXAGON:
      padding *= 2;
  }
  const node = {
    id: sanitizeText(id, conf) || "kbn" + cnt++,
    level,
    label: sanitizeText(descr, conf),
    width: conf.mindmap?.maxNodeWidth ?? defaultConfig_default.mindmap.maxNodeWidth,
    padding,
    isGroup: false
  };
  if (shapeData !== undefined) {
    let yamlData;
    if (!shapeData.includes(`
`)) {
      yamlData = `{
` + shapeData + `
}`;
    } else {
      yamlData = shapeData + `
`;
    }
    const doc = load(yamlData, { schema: JSON_SCHEMA });
    if (doc.shape && (doc.shape !== doc.shape.toLowerCase() || doc.shape.includes("_"))) {
      throw new Error(`No such shape: ${doc.shape}. Shape names should be lowercase.`);
    }
    if (doc?.shape && doc.shape === "kanbanItem") {
      node.shape = doc?.shape;
    }
    if (doc?.label) {
      node.label = doc?.label;
    }
    if (doc?.icon) {
      node.icon = doc?.icon.toString();
    }
    if (doc?.assigned) {
      node.assigned = doc?.assigned.toString();
    }
    if (doc?.ticket) {
      node.ticket = doc?.ticket.toString();
    }
    if (doc?.priority) {
      node.priority = doc?.priority;
    }
  }
  const section = getSection(level);
  if (section) {
    node.parentId = section.id || "kbn" + cnt++;
  } else {
    sections.push(node);
  }
  nodes.push(node);
}, "addNode");
var nodeType = {
  DEFAULT: 0,
  NO_BORDER: 0,
  ROUNDED_RECT: 1,
  RECT: 2,
  CIRCLE: 3,
  CLOUD: 4,
  BANG: 5,
  HEXAGON: 6
};
var getType = /* @__PURE__ */ __name((startStr, endStr) => {
  log.debug("In get type", startStr, endStr);
  switch (startStr) {
    case "[":
      return nodeType.RECT;
    case "(":
      return endStr === ")" ? nodeType.ROUNDED_RECT : nodeType.CLOUD;
    case "((":
      return nodeType.CIRCLE;
    case ")":
      return nodeType.CLOUD;
    case "))":
      return nodeType.BANG;
    case "{{":
      return nodeType.HEXAGON;
    default:
      return nodeType.DEFAULT;
  }
}, "getType");
var setElementForId = /* @__PURE__ */ __name((id, element) => {
  elements[id] = element;
}, "setElementForId");
var decorateNode = /* @__PURE__ */ __name((decoration) => {
  if (!decoration) {
    return;
  }
  const config = getConfig2();
  const node = nodes[nodes.length - 1];
  if (decoration.icon) {
    node.icon = sanitizeText(decoration.icon, config);
  }
  if (decoration.class) {
    node.cssClasses = sanitizeText(decoration.class, config);
  }
}, "decorateNode");
var type2Str = /* @__PURE__ */ __name((type) => {
  switch (type) {
    case nodeType.DEFAULT:
      return "no-border";
    case nodeType.RECT:
      return "rect";
    case nodeType.ROUNDED_RECT:
      return "rounded-rect";
    case nodeType.CIRCLE:
      return "circle";
    case nodeType.CLOUD:
      return "cloud";
    case nodeType.BANG:
      return "bang";
    case nodeType.HEXAGON:
      return "hexgon";
    default:
      return "no-border";
  }
}, "type2Str");
var getLogger = /* @__PURE__ */ __name(() => log, "getLogger");
var getElementById = /* @__PURE__ */ __name((id) => elements[id], "getElementById");
var db = {
  clear,
  addNode,
  getSections,
  getData,
  nodeType,
  getType,
  setElementForId,
  decorateNode,
  type2Str,
  getLogger,
  getElementById
};
var kanbanDb_default = db;
var draw = /* @__PURE__ */ __name(async (text, id, _version, diagObj) => {
  log.debug(`Rendering kanban diagram
` + text);
  const db2 = diagObj.db;
  const data4Layout = db2.getData();
  const conf = getConfig2();
  conf.htmlLabels = false;
  const svg = selectSvgElement(id);
  for (const node of data4Layout.nodes) {
    node.domId = `${id}-${node.id}`;
  }
  const sectionsElem = svg.append("g");
  sectionsElem.attr("class", "sections");
  const nodesElem = svg.append("g");
  nodesElem.attr("class", "items");
  const sections2 = data4Layout.nodes.filter((node) => node.isGroup);
  let cnt2 = 0;
  const padding = 10;
  const sectionObjects = [];
  let maxLabelHeight = 25;
  for (const section of sections2) {
    const WIDTH = conf?.kanban?.sectionWidth || 200;
    cnt2 = cnt2 + 1;
    section.x = WIDTH * cnt2 + (cnt2 - 1) * padding / 2;
    section.width = WIDTH;
    section.y = 0;
    section.height = WIDTH * 3;
    section.rx = 5;
    section.ry = 5;
    section.cssClasses = section.cssClasses + " section-" + cnt2;
    const sectionObj = await insertCluster(sectionsElem, section);
    maxLabelHeight = Math.max(maxLabelHeight, sectionObj?.labelBBox?.height);
    sectionObjects.push(sectionObj);
  }
  let i = 0;
  for (const section of sections2) {
    const sectionObj = sectionObjects[i];
    i = i + 1;
    const WIDTH = conf?.kanban?.sectionWidth || 200;
    const top = -WIDTH * 3 / 2 + maxLabelHeight;
    let y = top;
    const sectionItems = data4Layout.nodes.filter((node) => node.parentId === section.id);
    for (const item of sectionItems) {
      if (item.isGroup) {
        throw new Error("Groups within groups are not allowed in Kanban diagrams");
      }
      item.x = section.x;
      item.width = WIDTH - 1.5 * padding;
      const nodeEl = await insertNode(nodesElem, item, { config: conf });
      const bbox = nodeEl.node().getBBox();
      item.y = y + bbox.height / 2;
      await positionNode(item);
      y = item.y + bbox.height / 2 + padding / 2;
    }
    const rect = sectionObj.cluster.select("rect");
    const height = Math.max(y - top + 3 * padding, 50) + (maxLabelHeight - 25);
    rect.attr("height", height);
  }
  setupGraphViewbox(undefined, svg, conf.mindmap?.padding ?? defaultConfig_default.kanban.padding, conf.mindmap?.useMaxWidth ?? defaultConfig_default.kanban.useMaxWidth);
}, "draw");
var kanbanRenderer_default = {
  draw
};
var genSections = /* @__PURE__ */ __name((options) => {
  let sections2 = "";
  for (let i = 0;i < options.THEME_COLOR_LIMIT; i++) {
    options["lineColor" + i] = options["lineColor" + i] || options["cScaleInv" + i];
    if (is_dark_default(options["lineColor" + i])) {
      options["lineColor" + i] = lighten_default(options["lineColor" + i], 20);
    } else {
      options["lineColor" + i] = darken_default(options["lineColor" + i], 20);
    }
  }
  const adjuster = /* @__PURE__ */ __name((color, level) => options.darkMode ? darken_default(color, level) : lighten_default(color, level), "adjuster");
  for (let i = 0;i < options.THEME_COLOR_LIMIT; i++) {
    const sw = "" + (17 - 3 * i);
    sections2 += `
    .section-${i - 1} rect, .section-${i - 1} path, .section-${i - 1} circle, .section-${i - 1} polygon, .section-${i - 1} path  {
      fill: ${adjuster(options["cScale" + i], 10)};
      stroke: ${adjuster(options["cScale" + i], 10)};

    }
    .section-${i - 1} text {
     fill: ${options["cScaleLabel" + i]};
    }
    .node-icon-${i - 1} {
      font-size: 40px;
      color: ${options["cScaleLabel" + i]};
    }
    .section-edge-${i - 1}{
      stroke: ${options["cScale" + i]};
    }
    .edge-depth-${i - 1}{
      stroke-width: ${sw};
    }
    .section-${i - 1} line {
      stroke: ${options["cScaleInv" + i]} ;
      stroke-width: 3;
    }

    .disabled, .disabled circle, .disabled text {
      fill: lightgray;
    }
    .disabled text {
      fill: #efefef;
    }

  .node rect,
  .node circle,
  .node ellipse,
  .node polygon,
  .node path {
    fill: ${options.background};
    stroke: ${options.nodeBorder};
    stroke-width: 1px;
  }

  .kanban-ticket-link {
    fill: ${options.background};
    stroke: ${options.nodeBorder};
    text-decoration: underline;
  }
    `;
  }
  return sections2;
}, "genSections");
var getStyles = /* @__PURE__ */ __name((options) => `
  .edge {
    stroke-width: 3;
  }
  ${genSections(options)}
  .section-root rect, .section-root path, .section-root circle, .section-root polygon  {
    fill: ${options.git0};
  }
  .section-root text {
    fill: ${options.gitBranchLabel0};
  }
  .icon-container {
    height:100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .edge {
    fill: none;
  }
  .cluster-label, .label {
    color: ${options.textColor};
    fill: ${options.textColor};
    }
  .kanban-label {
    dy: 1em;
    alignment-baseline: middle;
    text-anchor: middle;
    dominant-baseline: middle;
    text-align: center;
  }
    ${getIconStyles()}
`, "getStyles");
var styles_default = getStyles;
var diagram = {
  db: kanbanDb_default,
  renderer: kanbanRenderer_default,
  parser: kanban_default,
  styles: styles_default
};
export {
  diagram
};

//# debugId=8492E3F7273C889E64756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2thbmJhbi1kZWZpbml0aW9uLVVOM0xaUktVLm1qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJpbXBvcnQge1xuICBzZWxlY3RTdmdFbGVtZW50XG59IGZyb20gXCIuL2NodW5rLVdVNU1ZRzJHLm1qc1wiO1xuaW1wb3J0IHtcbiAgZ2V0SWNvblN0eWxlc1xufSBmcm9tIFwiLi9jaHVuay1GTUJEN1VDNC5tanNcIjtcbmltcG9ydCB7XG4gIEpTT05fU0NIRU1BLFxuICBsb2FkXG59IGZyb20gXCIuL2NodW5rLVhQVzQ1NzZJLm1qc1wiO1xuaW1wb3J0IHtcbiAgaW5zZXJ0Q2x1c3RlcixcbiAgaW5zZXJ0Tm9kZSxcbiAgcG9zaXRpb25Ob2RlXG59IGZyb20gXCIuL2NodW5rLTNPUElGR0RFLm1qc1wiO1xuaW1wb3J0IFwiLi9jaHVuay1MNVpUTERXVi5tanNcIjtcbmltcG9ydCBcIi4vY2h1bmstTlpLMkQ3R1UubWpzXCI7XG5pbXBvcnQgXCIuL2NodW5rLU81Q0JFTDZPLm1qc1wiO1xuaW1wb3J0IFwiLi9jaHVuay01WlFZSFhLVS5tanNcIjtcbmltcG9ydCB7XG4gIGRlZmF1bHRDb25maWdfZGVmYXVsdCxcbiAgZ2V0Q29uZmlnMiBhcyBnZXRDb25maWcsXG4gIHNhbml0aXplVGV4dCxcbiAgc2V0dXBHcmFwaFZpZXdib3hcbn0gZnJvbSBcIi4vY2h1bmstQ1NDSUhLN1EubWpzXCI7XG5pbXBvcnQge1xuICBfX25hbWUsXG4gIGxvZ1xufSBmcm9tIFwiLi9jaHVuay1BR0hSQjRKRi5tanNcIjtcblxuLy8gc3JjL2RpYWdyYW1zL2thbmJhbi9wYXJzZXIva2FuYmFuLmppc29uXG52YXIgcGFyc2VyID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgbyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oaywgdiwgbzIsIGwpIHtcbiAgICBmb3IgKG8yID0gbzIgfHwge30sIGwgPSBrLmxlbmd0aDsgbC0tOyBvMltrW2xdXSA9IHYpIDtcbiAgICByZXR1cm4gbzI7XG4gIH0sIFwib1wiKSwgJFYwID0gWzEsIDRdLCAkVjEgPSBbMSwgMTNdLCAkVjIgPSBbMSwgMTJdLCAkVjMgPSBbMSwgMTVdLCAkVjQgPSBbMSwgMTZdLCAkVjUgPSBbMSwgMjBdLCAkVjYgPSBbMSwgMTldLCAkVjcgPSBbNiwgNywgOF0sICRWOCA9IFsxLCAyNl0sICRWOSA9IFsxLCAyNF0sICRWYSA9IFsxLCAyNV0sICRWYiA9IFs2LCA3LCAxMV0sICRWYyA9IFsxLCAzMV0sICRWZCA9IFs2LCA3LCAxMSwgMjRdLCAkVmUgPSBbMSwgNiwgMTMsIDE2LCAxNywgMjAsIDIzXSwgJFZmID0gWzEsIDM1XSwgJFZnID0gWzEsIDM2XSwgJFZoID0gWzEsIDYsIDcsIDExLCAxMywgMTYsIDE3LCAyMCwgMjNdLCAkVmkgPSBbMSwgMzhdO1xuICB2YXIgcGFyc2VyMiA9IHtcbiAgICB0cmFjZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiB0cmFjZSgpIHtcbiAgICB9LCBcInRyYWNlXCIpLFxuICAgIHl5OiB7fSxcbiAgICBzeW1ib2xzXzogeyBcImVycm9yXCI6IDIsIFwic3RhcnRcIjogMywgXCJtaW5kTWFwXCI6IDQsIFwic3BhY2VMaW5lc1wiOiA1LCBcIlNQQUNFTElORVwiOiA2LCBcIk5MXCI6IDcsIFwiS0FOQkFOXCI6IDgsIFwiZG9jdW1lbnRcIjogOSwgXCJzdG9wXCI6IDEwLCBcIkVPRlwiOiAxMSwgXCJzdGF0ZW1lbnRcIjogMTIsIFwiU1BBQ0VMSVNUXCI6IDEzLCBcIm5vZGVcIjogMTQsIFwic2hhcGVEYXRhXCI6IDE1LCBcIklDT05cIjogMTYsIFwiQ0xBU1NcIjogMTcsIFwibm9kZVdpdGhJZFwiOiAxOCwgXCJub2RlV2l0aG91dElkXCI6IDE5LCBcIk5PREVfRFNUQVJUXCI6IDIwLCBcIk5PREVfREVTQ1JcIjogMjEsIFwiTk9ERV9ERU5EXCI6IDIyLCBcIk5PREVfSURcIjogMjMsIFwiU0hBUEVfREFUQVwiOiAyNCwgXCIkYWNjZXB0XCI6IDAsIFwiJGVuZFwiOiAxIH0sXG4gICAgdGVybWluYWxzXzogeyAyOiBcImVycm9yXCIsIDY6IFwiU1BBQ0VMSU5FXCIsIDc6IFwiTkxcIiwgODogXCJLQU5CQU5cIiwgMTE6IFwiRU9GXCIsIDEzOiBcIlNQQUNFTElTVFwiLCAxNjogXCJJQ09OXCIsIDE3OiBcIkNMQVNTXCIsIDIwOiBcIk5PREVfRFNUQVJUXCIsIDIxOiBcIk5PREVfREVTQ1JcIiwgMjI6IFwiTk9ERV9ERU5EXCIsIDIzOiBcIk5PREVfSURcIiwgMjQ6IFwiU0hBUEVfREFUQVwiIH0sXG4gICAgcHJvZHVjdGlvbnNfOiBbMCwgWzMsIDFdLCBbMywgMl0sIFs1LCAxXSwgWzUsIDJdLCBbNSwgMl0sIFs0LCAyXSwgWzQsIDNdLCBbMTAsIDFdLCBbMTAsIDFdLCBbMTAsIDFdLCBbMTAsIDJdLCBbMTAsIDJdLCBbOSwgM10sIFs5LCAyXSwgWzEyLCAzXSwgWzEyLCAyXSwgWzEyLCAyXSwgWzEyLCAyXSwgWzEyLCAxXSwgWzEyLCAyXSwgWzEyLCAxXSwgWzEyLCAxXSwgWzEyLCAxXSwgWzEyLCAxXSwgWzE0LCAxXSwgWzE0LCAxXSwgWzE5LCAzXSwgWzE4LCAxXSwgWzE4LCA0XSwgWzE1LCAyXSwgWzE1LCAxXV0sXG4gICAgcGVyZm9ybUFjdGlvbjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBhbm9ueW1vdXMoeXl0ZXh0LCB5eWxlbmcsIHl5bGluZW5vLCB5eSwgeXlzdGF0ZSwgJCQsIF8kKSB7XG4gICAgICB2YXIgJDAgPSAkJC5sZW5ndGggLSAxO1xuICAgICAgc3dpdGNoICh5eXN0YXRlKSB7XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgY2FzZSA3OlxuICAgICAgICAgIHJldHVybiB5eTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA4OlxuICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwiU3RvcCBOTCBcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTpcbiAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcIlN0b3AgRU9GIFwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMTpcbiAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcIlN0b3AgTkwyIFwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcIlN0b3AgRU9GMiBcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuaW5mbyhcIk5vZGU6IFwiLCAkJFskMCAtIDFdLmlkKTtcbiAgICAgICAgICB5eS5hZGROb2RlKCQkWyQwIC0gMl0ubGVuZ3RoLCAkJFskMCAtIDFdLmlkLCAkJFskMCAtIDFdLmRlc2NyLCAkJFskMCAtIDFdLnR5cGUsICQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuaW5mbyhcIk5vZGU6IFwiLCAkJFskMF0uaWQpO1xuICAgICAgICAgIHl5LmFkZE5vZGUoJCRbJDAgLSAxXS5sZW5ndGgsICQkWyQwXS5pZCwgJCRbJDBdLmRlc2NyLCAkJFskMF0udHlwZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkudHJhY2UoXCJJY29uOiBcIiwgJCRbJDBdKTtcbiAgICAgICAgICB5eS5kZWNvcmF0ZU5vZGUoeyBpY29uOiAkJFskMF0gfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTg6XG4gICAgICAgIGNhc2UgMjM6XG4gICAgICAgICAgeXkuZGVjb3JhdGVOb2RlKHsgY2xhc3M6ICQkWyQwXSB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxOTpcbiAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcIlNQQUNFTElTVFwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyMDpcbiAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcIk5vZGU6IFwiLCAkJFskMCAtIDFdLmlkKTtcbiAgICAgICAgICB5eS5hZGROb2RlKDAsICQkWyQwIC0gMV0uaWQsICQkWyQwIC0gMV0uZGVzY3IsICQkWyQwIC0gMV0udHlwZSwgJCRbJDBdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyMTpcbiAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcIk5vZGU6IFwiLCAkJFskMF0uaWQpO1xuICAgICAgICAgIHl5LmFkZE5vZGUoMCwgJCRbJDBdLmlkLCAkJFskMF0uZGVzY3IsICQkWyQwXS50eXBlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyMjpcbiAgICAgICAgICB5eS5kZWNvcmF0ZU5vZGUoeyBpY29uOiAkJFskMF0gfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjc6XG4gICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkudHJhY2UoXCJub2RlIGZvdW5kIC4uXCIsICQkWyQwIC0gMl0pO1xuICAgICAgICAgIHRoaXMuJCA9IHsgaWQ6ICQkWyQwIC0gMV0sIGRlc2NyOiAkJFskMCAtIDFdLCB0eXBlOiB5eS5nZXRUeXBlKCQkWyQwIC0gMl0sICQkWyQwXSkgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyODpcbiAgICAgICAgICB0aGlzLiQgPSB7IGlkOiAkJFskMF0sIGRlc2NyOiAkJFskMF0sIHR5cGU6IDAgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOTpcbiAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcIm5vZGUgZm91bmQgLi5cIiwgJCRbJDAgLSAzXSk7XG4gICAgICAgICAgdGhpcy4kID0geyBpZDogJCRbJDAgLSAzXSwgZGVzY3I6ICQkWyQwIC0gMV0sIHR5cGU6IHl5LmdldFR5cGUoJCRbJDAgLSAyXSwgJCRbJDBdKSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMwOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwIC0gMV0gKyAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzE6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0sIFwiYW5vbnltb3VzXCIpLFxuICAgIHRhYmxlOiBbeyAzOiAxLCA0OiAyLCA1OiAzLCA2OiBbMSwgNV0sIDg6ICRWMCB9LCB7IDE6IFszXSB9LCB7IDE6IFsyLCAxXSB9LCB7IDQ6IDYsIDY6IFsxLCA3XSwgNzogWzEsIDhdLCA4OiAkVjAgfSwgeyA2OiAkVjEsIDc6IFsxLCAxMF0sIDk6IDksIDEyOiAxMSwgMTM6ICRWMiwgMTQ6IDE0LCAxNjogJFYzLCAxNzogJFY0LCAxODogMTcsIDE5OiAxOCwgMjA6ICRWNSwgMjM6ICRWNiB9LCBvKCRWNywgWzIsIDNdKSwgeyAxOiBbMiwgMl0gfSwgbygkVjcsIFsyLCA0XSksIG8oJFY3LCBbMiwgNV0pLCB7IDE6IFsyLCA2XSwgNjogJFYxLCAxMjogMjEsIDEzOiAkVjIsIDE0OiAxNCwgMTY6ICRWMywgMTc6ICRWNCwgMTg6IDE3LCAxOTogMTgsIDIwOiAkVjUsIDIzOiAkVjYgfSwgeyA2OiAkVjEsIDk6IDIyLCAxMjogMTEsIDEzOiAkVjIsIDE0OiAxNCwgMTY6ICRWMywgMTc6ICRWNCwgMTg6IDE3LCAxOTogMTgsIDIwOiAkVjUsIDIzOiAkVjYgfSwgeyA2OiAkVjgsIDc6ICRWOSwgMTA6IDIzLCAxMTogJFZhIH0sIG8oJFZiLCBbMiwgMjRdLCB7IDE4OiAxNywgMTk6IDE4LCAxNDogMjcsIDE2OiBbMSwgMjhdLCAxNzogWzEsIDI5XSwgMjA6ICRWNSwgMjM6ICRWNiB9KSwgbygkVmIsIFsyLCAxOV0pLCBvKCRWYiwgWzIsIDIxXSwgeyAxNTogMzAsIDI0OiAkVmMgfSksIG8oJFZiLCBbMiwgMjJdKSwgbygkVmIsIFsyLCAyM10pLCBvKCRWZCwgWzIsIDI1XSksIG8oJFZkLCBbMiwgMjZdKSwgbygkVmQsIFsyLCAyOF0sIHsgMjA6IFsxLCAzMl0gfSksIHsgMjE6IFsxLCAzM10gfSwgeyA2OiAkVjgsIDc6ICRWOSwgMTA6IDM0LCAxMTogJFZhIH0sIHsgMTogWzIsIDddLCA2OiAkVjEsIDEyOiAyMSwgMTM6ICRWMiwgMTQ6IDE0LCAxNjogJFYzLCAxNzogJFY0LCAxODogMTcsIDE5OiAxOCwgMjA6ICRWNSwgMjM6ICRWNiB9LCBvKCRWZSwgWzIsIDE0XSwgeyA3OiAkVmYsIDExOiAkVmcgfSksIG8oJFZoLCBbMiwgOF0pLCBvKCRWaCwgWzIsIDldKSwgbygkVmgsIFsyLCAxMF0pLCBvKCRWYiwgWzIsIDE2XSwgeyAxNTogMzcsIDI0OiAkVmMgfSksIG8oJFZiLCBbMiwgMTddKSwgbygkVmIsIFsyLCAxOF0pLCBvKCRWYiwgWzIsIDIwXSwgeyAyNDogJFZpIH0pLCBvKCRWZCwgWzIsIDMxXSksIHsgMjE6IFsxLCAzOV0gfSwgeyAyMjogWzEsIDQwXSB9LCBvKCRWZSwgWzIsIDEzXSwgeyA3OiAkVmYsIDExOiAkVmcgfSksIG8oJFZoLCBbMiwgMTFdKSwgbygkVmgsIFsyLCAxMl0pLCBvKCRWYiwgWzIsIDE1XSwgeyAyNDogJFZpIH0pLCBvKCRWZCwgWzIsIDMwXSksIHsgMjI6IFsxLCA0MV0gfSwgbygkVmQsIFsyLCAyN10pLCBvKCRWZCwgWzIsIDI5XSldLFxuICAgIGRlZmF1bHRBY3Rpb25zOiB7IDI6IFsyLCAxXSwgNjogWzIsIDJdIH0sXG4gICAgcGFyc2VFcnJvcjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwYXJzZUVycm9yKHN0ciwgaGFzaCkge1xuICAgICAgaWYgKGhhc2gucmVjb3ZlcmFibGUpIHtcbiAgICAgICAgdGhpcy50cmFjZShzdHIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKHN0cik7XG4gICAgICAgIGVycm9yLmhhc2ggPSBoYXNoO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LCBcInBhcnNlRXJyb3JcIiksXG4gICAgcGFyc2U6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcGFyc2UoaW5wdXQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcywgc3RhY2sgPSBbMF0sIHRzdGFjayA9IFtdLCB2c3RhY2sgPSBbbnVsbF0sIGxzdGFjayA9IFtdLCB0YWJsZSA9IHRoaXMudGFibGUsIHl5dGV4dCA9IFwiXCIsIHl5bGluZW5vID0gMCwgeXlsZW5nID0gMCwgcmVjb3ZlcmluZyA9IDAsIFRFUlJPUiA9IDIsIEVPRiA9IDE7XG4gICAgICB2YXIgYXJncyA9IGxzdGFjay5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICB2YXIgbGV4ZXIyID0gT2JqZWN0LmNyZWF0ZSh0aGlzLmxleGVyKTtcbiAgICAgIHZhciBzaGFyZWRTdGF0ZSA9IHsgeXk6IHt9IH07XG4gICAgICBmb3IgKHZhciBrIGluIHRoaXMueXkpIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnl5LCBrKSkge1xuICAgICAgICAgIHNoYXJlZFN0YXRlLnl5W2tdID0gdGhpcy55eVtrXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGV4ZXIyLnNldElucHV0KGlucHV0LCBzaGFyZWRTdGF0ZS55eSk7XG4gICAgICBzaGFyZWRTdGF0ZS55eS5sZXhlciA9IGxleGVyMjtcbiAgICAgIHNoYXJlZFN0YXRlLnl5LnBhcnNlciA9IHRoaXM7XG4gICAgICBpZiAodHlwZW9mIGxleGVyMi55eWxsb2MgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBsZXhlcjIueXlsbG9jID0ge307XG4gICAgICB9XG4gICAgICB2YXIgeXlsb2MgPSBsZXhlcjIueXlsbG9jO1xuICAgICAgbHN0YWNrLnB1c2goeXlsb2MpO1xuICAgICAgdmFyIHJhbmdlcyA9IGxleGVyMi5vcHRpb25zICYmIGxleGVyMi5vcHRpb25zLnJhbmdlcztcbiAgICAgIGlmICh0eXBlb2Ygc2hhcmVkU3RhdGUueXkucGFyc2VFcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRoaXMucGFyc2VFcnJvciA9IHNoYXJlZFN0YXRlLnl5LnBhcnNlRXJyb3I7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBhcnNlRXJyb3IgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykucGFyc2VFcnJvcjtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHBvcFN0YWNrKG4pIHtcbiAgICAgICAgc3RhY2subGVuZ3RoID0gc3RhY2subGVuZ3RoIC0gMiAqIG47XG4gICAgICAgIHZzdGFjay5sZW5ndGggPSB2c3RhY2subGVuZ3RoIC0gbjtcbiAgICAgICAgbHN0YWNrLmxlbmd0aCA9IGxzdGFjay5sZW5ndGggLSBuO1xuICAgICAgfVxuICAgICAgX19uYW1lKHBvcFN0YWNrLCBcInBvcFN0YWNrXCIpO1xuICAgICAgZnVuY3Rpb24gbGV4KCkge1xuICAgICAgICB2YXIgdG9rZW47XG4gICAgICAgIHRva2VuID0gdHN0YWNrLnBvcCgpIHx8IGxleGVyMi5sZXgoKSB8fCBFT0Y7XG4gICAgICAgIGlmICh0eXBlb2YgdG9rZW4gIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICBpZiAodG9rZW4gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgdHN0YWNrID0gdG9rZW47XG4gICAgICAgICAgICB0b2tlbiA9IHRzdGFjay5wb3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdG9rZW4gPSBzZWxmLnN5bWJvbHNfW3Rva2VuXSB8fCB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICB9XG4gICAgICBfX25hbWUobGV4LCBcImxleFwiKTtcbiAgICAgIHZhciBzeW1ib2wsIHByZUVycm9yU3ltYm9sLCBzdGF0ZSwgYWN0aW9uLCBhLCByLCB5eXZhbCA9IHt9LCBwLCBsZW4sIG5ld1N0YXRlLCBleHBlY3RlZDtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHN0YXRlID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRBY3Rpb25zW3N0YXRlXSkge1xuICAgICAgICAgIGFjdGlvbiA9IHRoaXMuZGVmYXVsdEFjdGlvbnNbc3RhdGVdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChzeW1ib2wgPT09IG51bGwgfHwgdHlwZW9mIHN5bWJvbCA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBzeW1ib2wgPSBsZXgoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aW9uID0gdGFibGVbc3RhdGVdICYmIHRhYmxlW3N0YXRlXVtzeW1ib2xdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgYWN0aW9uID09PSBcInVuZGVmaW5lZFwiIHx8ICFhY3Rpb24ubGVuZ3RoIHx8ICFhY3Rpb25bMF0pIHtcbiAgICAgICAgICB2YXIgZXJyU3RyID0gXCJcIjtcbiAgICAgICAgICBleHBlY3RlZCA9IFtdO1xuICAgICAgICAgIGZvciAocCBpbiB0YWJsZVtzdGF0ZV0pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRlcm1pbmFsc19bcF0gJiYgcCA+IFRFUlJPUikge1xuICAgICAgICAgICAgICBleHBlY3RlZC5wdXNoKFwiJ1wiICsgdGhpcy50ZXJtaW5hbHNfW3BdICsgXCInXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobGV4ZXIyLnNob3dQb3NpdGlvbikge1xuICAgICAgICAgICAgZXJyU3RyID0gXCJQYXJzZSBlcnJvciBvbiBsaW5lIFwiICsgKHl5bGluZW5vICsgMSkgKyBcIjpcXG5cIiArIGxleGVyMi5zaG93UG9zaXRpb24oKSArIFwiXFxuRXhwZWN0aW5nIFwiICsgZXhwZWN0ZWQuam9pbihcIiwgXCIpICsgXCIsIGdvdCAnXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlcnJTdHIgPSBcIlBhcnNlIGVycm9yIG9uIGxpbmUgXCIgKyAoeXlsaW5lbm8gKyAxKSArIFwiOiBVbmV4cGVjdGVkIFwiICsgKHN5bWJvbCA9PSBFT0YgPyBcImVuZCBvZiBpbnB1dFwiIDogXCInXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wYXJzZUVycm9yKGVyclN0ciwge1xuICAgICAgICAgICAgdGV4dDogbGV4ZXIyLm1hdGNoLFxuICAgICAgICAgICAgdG9rZW46IHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCxcbiAgICAgICAgICAgIGxpbmU6IGxleGVyMi55eWxpbmVubyxcbiAgICAgICAgICAgIGxvYzogeXlsb2MsXG4gICAgICAgICAgICBleHBlY3RlZFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhY3Rpb25bMF0gaW5zdGFuY2VvZiBBcnJheSAmJiBhY3Rpb24ubGVuZ3RoID4gMSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcnNlIEVycm9yOiBtdWx0aXBsZSBhY3Rpb25zIHBvc3NpYmxlIGF0IHN0YXRlOiBcIiArIHN0YXRlICsgXCIsIHRva2VuOiBcIiArIHN5bWJvbCk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChhY3Rpb25bMF0pIHtcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBzdGFjay5wdXNoKHN5bWJvbCk7XG4gICAgICAgICAgICB2c3RhY2sucHVzaChsZXhlcjIueXl0ZXh0KTtcbiAgICAgICAgICAgIGxzdGFjay5wdXNoKGxleGVyMi55eWxsb2MpO1xuICAgICAgICAgICAgc3RhY2sucHVzaChhY3Rpb25bMV0pO1xuICAgICAgICAgICAgc3ltYm9sID0gbnVsbDtcbiAgICAgICAgICAgIGlmICghcHJlRXJyb3JTeW1ib2wpIHtcbiAgICAgICAgICAgICAgeXlsZW5nID0gbGV4ZXIyLnl5bGVuZztcbiAgICAgICAgICAgICAgeXl0ZXh0ID0gbGV4ZXIyLnl5dGV4dDtcbiAgICAgICAgICAgICAgeXlsaW5lbm8gPSBsZXhlcjIueXlsaW5lbm87XG4gICAgICAgICAgICAgIHl5bG9jID0gbGV4ZXIyLnl5bGxvYztcbiAgICAgICAgICAgICAgaWYgKHJlY292ZXJpbmcgPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVjb3ZlcmluZy0tO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzeW1ib2wgPSBwcmVFcnJvclN5bWJvbDtcbiAgICAgICAgICAgICAgcHJlRXJyb3JTeW1ib2wgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgbGVuID0gdGhpcy5wcm9kdWN0aW9uc19bYWN0aW9uWzFdXVsxXTtcbiAgICAgICAgICAgIHl5dmFsLiQgPSB2c3RhY2tbdnN0YWNrLmxlbmd0aCAtIGxlbl07XG4gICAgICAgICAgICB5eXZhbC5fJCA9IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5maXJzdF9saW5lLFxuICAgICAgICAgICAgICBsYXN0X2xpbmU6IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gMV0ubGFzdF9saW5lLFxuICAgICAgICAgICAgICBmaXJzdF9jb2x1bW46IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0uZmlyc3RfY29sdW1uLFxuICAgICAgICAgICAgICBsYXN0X2NvbHVtbjogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAxXS5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChyYW5nZXMpIHtcbiAgICAgICAgICAgICAgeXl2YWwuXyQucmFuZ2UgPSBbXG4gICAgICAgICAgICAgICAgbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5yYW5nZVswXSxcbiAgICAgICAgICAgICAgICBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIDFdLnJhbmdlWzFdXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByID0gdGhpcy5wZXJmb3JtQWN0aW9uLmFwcGx5KHl5dmFsLCBbXG4gICAgICAgICAgICAgIHl5dGV4dCxcbiAgICAgICAgICAgICAgeXlsZW5nLFxuICAgICAgICAgICAgICB5eWxpbmVubyxcbiAgICAgICAgICAgICAgc2hhcmVkU3RhdGUueXksXG4gICAgICAgICAgICAgIGFjdGlvblsxXSxcbiAgICAgICAgICAgICAgdnN0YWNrLFxuICAgICAgICAgICAgICBsc3RhY2tcbiAgICAgICAgICAgIF0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsZW4pIHtcbiAgICAgICAgICAgICAgc3RhY2sgPSBzdGFjay5zbGljZSgwLCAtMSAqIGxlbiAqIDIpO1xuICAgICAgICAgICAgICB2c3RhY2sgPSB2c3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgICBsc3RhY2sgPSBsc3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhY2sucHVzaCh0aGlzLnByb2R1Y3Rpb25zX1thY3Rpb25bMV1dWzBdKTtcbiAgICAgICAgICAgIHZzdGFjay5wdXNoKHl5dmFsLiQpO1xuICAgICAgICAgICAgbHN0YWNrLnB1c2goeXl2YWwuXyQpO1xuICAgICAgICAgICAgbmV3U3RhdGUgPSB0YWJsZVtzdGFja1tzdGFjay5sZW5ndGggLSAyXV1bc3RhY2tbc3RhY2subGVuZ3RoIC0gMV1dO1xuICAgICAgICAgICAgc3RhY2sucHVzaChuZXdTdGF0ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSwgXCJwYXJzZVwiKVxuICB9O1xuICB2YXIgbGV4ZXIgPSAvKiBAX19QVVJFX18gKi8gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZXhlcjIgPSB7XG4gICAgICBFT0Y6IDEsXG4gICAgICBwYXJzZUVycm9yOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBhcnNlRXJyb3Ioc3RyLCBoYXNoKSB7XG4gICAgICAgIGlmICh0aGlzLnl5LnBhcnNlcikge1xuICAgICAgICAgIHRoaXMueXkucGFyc2VyLnBhcnNlRXJyb3Ioc3RyLCBoYXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3RyKTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwYXJzZUVycm9yXCIpLFxuICAgICAgLy8gcmVzZXRzIHRoZSBsZXhlciwgc2V0cyBuZXcgaW5wdXRcbiAgICAgIHNldElucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGlucHV0LCB5eSkge1xuICAgICAgICB0aGlzLnl5ID0geXkgfHwgdGhpcy55eSB8fCB7fTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBpbnB1dDtcbiAgICAgICAgdGhpcy5fbW9yZSA9IHRoaXMuX2JhY2t0cmFjayA9IHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnl5bGluZW5vID0gdGhpcy55eWxlbmcgPSAwO1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2ggPSBcIlwiO1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrID0gW1wiSU5JVElBTFwiXTtcbiAgICAgICAgdGhpcy55eWxsb2MgPSB7XG4gICAgICAgICAgZmlyc3RfbGluZTogMSxcbiAgICAgICAgICBmaXJzdF9jb2x1bW46IDAsXG4gICAgICAgICAgbGFzdF9saW5lOiAxLFxuICAgICAgICAgIGxhc3RfY29sdW1uOiAwXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2UgPSBbMCwgMF07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vZmZzZXQgPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwic2V0SW5wdXRcIiksXG4gICAgICAvLyBjb25zdW1lcyBhbmQgcmV0dXJucyBvbmUgY2hhciBmcm9tIHRoZSBpbnB1dFxuICAgICAgaW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjaCA9IHRoaXMuX2lucHV0WzBdO1xuICAgICAgICB0aGlzLnl5dGV4dCArPSBjaDtcbiAgICAgICAgdGhpcy55eWxlbmcrKztcbiAgICAgICAgdGhpcy5vZmZzZXQrKztcbiAgICAgICAgdGhpcy5tYXRjaCArPSBjaDtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IGNoO1xuICAgICAgICB2YXIgbGluZXMgPSBjaC5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8rKztcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2xpbmUrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtbisrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2VbMV0rKztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pbnB1dCA9IHRoaXMuX2lucHV0LnNsaWNlKDEpO1xuICAgICAgICByZXR1cm4gY2g7XG4gICAgICB9LCBcImlucHV0XCIpLFxuICAgICAgLy8gdW5zaGlmdHMgb25lIGNoYXIgKG9yIGEgc3RyaW5nKSBpbnRvIHRoZSBpbnB1dFxuICAgICAgdW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oY2gpIHtcbiAgICAgICAgdmFyIGxlbiA9IGNoLmxlbmd0aDtcbiAgICAgICAgdmFyIGxpbmVzID0gY2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBjaCArIHRoaXMuX2lucHV0O1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMueXl0ZXh0LnN1YnN0cigwLCB0aGlzLnl5dGV4dC5sZW5ndGggLSBsZW4pO1xuICAgICAgICB0aGlzLm9mZnNldCAtPSBsZW47XG4gICAgICAgIHZhciBvbGRMaW5lcyA9IHRoaXMubWF0Y2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5tYXRjaCA9IHRoaXMubWF0Y2guc3Vic3RyKDAsIHRoaXMubWF0Y2gubGVuZ3RoIC0gMSk7XG4gICAgICAgIHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2hlZC5zdWJzdHIoMCwgdGhpcy5tYXRjaGVkLmxlbmd0aCAtIDEpO1xuICAgICAgICBpZiAobGluZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gLT0gbGluZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgciA9IHRoaXMueXlsbG9jLnJhbmdlO1xuICAgICAgICB0aGlzLnl5bGxvYyA9IHtcbiAgICAgICAgICBmaXJzdF9saW5lOiB0aGlzLnl5bGxvYy5maXJzdF9saW5lLFxuICAgICAgICAgIGxhc3RfbGluZTogdGhpcy55eWxpbmVubyArIDEsXG4gICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gKGxpbmVzLmxlbmd0aCA9PT0gb2xkTGluZXMubGVuZ3RoID8gdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uIDogMCkgKyBvbGRMaW5lc1tvbGRMaW5lcy5sZW5ndGggLSBsaW5lcy5sZW5ndGhdLmxlbmd0aCAtIGxpbmVzWzBdLmxlbmd0aCA6IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbiAtIGxlblxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlID0gW3JbMF0sIHJbMF0gKyB0aGlzLnl5bGVuZyAtIGxlbl07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy55eWxlbmcgPSB0aGlzLnl5dGV4dC5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJ1bnB1dFwiKSxcbiAgICAgIC8vIFdoZW4gY2FsbGVkIGZyb20gYWN0aW9uLCBjYWNoZXMgbWF0Y2hlZCB0ZXh0IGFuZCBhcHBlbmRzIGl0IG9uIG5leHQgYWN0aW9uXG4gICAgICBtb3JlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9tb3JlID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcIm1vcmVcIiksXG4gICAgICAvLyBXaGVuIGNhbGxlZCBmcm9tIGFjdGlvbiwgc2lnbmFscyB0aGUgbGV4ZXIgdGhhdCB0aGlzIHJ1bGUgZmFpbHMgdG8gbWF0Y2ggdGhlIGlucHV0LCBzbyB0aGUgbmV4dCBtYXRjaGluZyBydWxlIChyZWdleCkgc2hvdWxkIGJlIHRlc3RlZCBpbnN0ZWFkLlxuICAgICAgcmVqZWN0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2t0cmFja19sZXhlcikge1xuICAgICAgICAgIHRoaXMuX2JhY2t0cmFjayA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gWW91IGNhbiBvbmx5IGludm9rZSByZWplY3QoKSBpbiB0aGUgbGV4ZXIgd2hlbiB0aGUgbGV4ZXIgaXMgb2YgdGhlIGJhY2t0cmFja2luZyBwZXJzdWFzaW9uIChvcHRpb25zLmJhY2t0cmFja19sZXhlciA9IHRydWUpLlxcblwiICsgdGhpcy5zaG93UG9zaXRpb24oKSwge1xuICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgIHRva2VuOiBudWxsLFxuICAgICAgICAgICAgbGluZTogdGhpcy55eWxpbmVub1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJyZWplY3RcIiksXG4gICAgICAvLyByZXRhaW4gZmlyc3QgbiBjaGFyYWN0ZXJzIG9mIHRoZSBtYXRjaFxuICAgICAgbGVzczogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihuKSB7XG4gICAgICAgIHRoaXMudW5wdXQodGhpcy5tYXRjaC5zbGljZShuKSk7XG4gICAgICB9LCBcImxlc3NcIiksXG4gICAgICAvLyBkaXNwbGF5cyBhbHJlYWR5IG1hdGNoZWQgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICBwYXN0SW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwYXN0ID0gdGhpcy5tYXRjaGVkLnN1YnN0cigwLCB0aGlzLm1hdGNoZWQubGVuZ3RoIC0gdGhpcy5tYXRjaC5sZW5ndGgpO1xuICAgICAgICByZXR1cm4gKHBhc3QubGVuZ3RoID4gMjAgPyBcIi4uLlwiIDogXCJcIikgKyBwYXN0LnN1YnN0cigtMjApLnJlcGxhY2UoL1xcbi9nLCBcIlwiKTtcbiAgICAgIH0sIFwicGFzdElucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdXBjb21pbmcgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICB1cGNvbWluZ0lucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV4dCA9IHRoaXMubWF0Y2g7XG4gICAgICAgIGlmIChuZXh0Lmxlbmd0aCA8IDIwKSB7XG4gICAgICAgICAgbmV4dCArPSB0aGlzLl9pbnB1dC5zdWJzdHIoMCwgMjAgLSBuZXh0Lmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChuZXh0LnN1YnN0cigwLCAyMCkgKyAobmV4dC5sZW5ndGggPiAyMCA/IFwiLi4uXCIgOiBcIlwiKSkucmVwbGFjZSgvXFxuL2csIFwiXCIpO1xuICAgICAgfSwgXCJ1cGNvbWluZ0lucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdGhlIGNoYXJhY3RlciBwb3NpdGlvbiB3aGVyZSB0aGUgbGV4aW5nIGVycm9yIG9jY3VycmVkLCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgc2hvd1Bvc2l0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJlID0gdGhpcy5wYXN0SW5wdXQoKTtcbiAgICAgICAgdmFyIGMgPSBuZXcgQXJyYXkocHJlLmxlbmd0aCArIDEpLmpvaW4oXCItXCIpO1xuICAgICAgICByZXR1cm4gcHJlICsgdGhpcy51cGNvbWluZ0lucHV0KCkgKyBcIlxcblwiICsgYyArIFwiXlwiO1xuICAgICAgfSwgXCJzaG93UG9zaXRpb25cIiksXG4gICAgICAvLyB0ZXN0IHRoZSBsZXhlZCB0b2tlbjogcmV0dXJuIEZBTFNFIHdoZW4gbm90IGEgbWF0Y2gsIG90aGVyd2lzZSByZXR1cm4gdG9rZW5cbiAgICAgIHRlc3RfbWF0Y2g6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obWF0Y2gsIGluZGV4ZWRfcnVsZSkge1xuICAgICAgICB2YXIgdG9rZW4sIGxpbmVzLCBiYWNrdXA7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFja3RyYWNrX2xleGVyKSB7XG4gICAgICAgICAgYmFja3VwID0ge1xuICAgICAgICAgICAgeXlsaW5lbm86IHRoaXMueXlsaW5lbm8sXG4gICAgICAgICAgICB5eWxsb2M6IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogdGhpcy55eWxsb2MuZmlyc3RfbGluZSxcbiAgICAgICAgICAgICAgbGFzdF9saW5lOiB0aGlzLmxhc3RfbGluZSxcbiAgICAgICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgICAgIGxhc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHl5dGV4dDogdGhpcy55eXRleHQsXG4gICAgICAgICAgICBtYXRjaDogdGhpcy5tYXRjaCxcbiAgICAgICAgICAgIG1hdGNoZXM6IHRoaXMubWF0Y2hlcyxcbiAgICAgICAgICAgIG1hdGNoZWQ6IHRoaXMubWF0Y2hlZCxcbiAgICAgICAgICAgIHl5bGVuZzogdGhpcy55eWxlbmcsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgX21vcmU6IHRoaXMuX21vcmUsXG4gICAgICAgICAgICBfaW5wdXQ6IHRoaXMuX2lucHV0LFxuICAgICAgICAgICAgeXk6IHRoaXMueXksXG4gICAgICAgICAgICBjb25kaXRpb25TdGFjazogdGhpcy5jb25kaXRpb25TdGFjay5zbGljZSgwKSxcbiAgICAgICAgICAgIGRvbmU6IHRoaXMuZG9uZVxuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICAgIGJhY2t1cC55eWxsb2MucmFuZ2UgPSB0aGlzLnl5bGxvYy5yYW5nZS5zbGljZSgwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMgPSBtYXRjaFswXS5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gKz0gbGluZXMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueXlsbG9jID0ge1xuICAgICAgICAgIGZpcnN0X2xpbmU6IHRoaXMueXlsbG9jLmxhc3RfbGluZSxcbiAgICAgICAgICBsYXN0X2xpbmU6IHRoaXMueXlsaW5lbm8gKyAxLFxuICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubGVuZ3RoIC0gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubWF0Y2goL1xccj9cXG4/LylbMF0ubGVuZ3RoIDogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4gKyBtYXRjaFswXS5sZW5ndGhcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy55eXRleHQgKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2ggKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2hlcyA9IG1hdGNoO1xuICAgICAgICB0aGlzLnl5bGVuZyA9IHRoaXMueXl0ZXh0Lmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZSA9IFt0aGlzLm9mZnNldCwgdGhpcy5vZmZzZXQgKz0gdGhpcy55eWxlbmddO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX21vcmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fYmFja3RyYWNrID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2lucHV0ID0gdGhpcy5faW5wdXQuc2xpY2UobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IG1hdGNoWzBdO1xuICAgICAgICB0b2tlbiA9IHRoaXMucGVyZm9ybUFjdGlvbi5jYWxsKHRoaXMsIHRoaXMueXksIHRoaXMsIGluZGV4ZWRfcnVsZSwgdGhpcy5jb25kaXRpb25TdGFja1t0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgaWYgKHRoaXMuZG9uZSAmJiB0aGlzLl9pbnB1dCkge1xuICAgICAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9iYWNrdHJhY2spIHtcbiAgICAgICAgICBmb3IgKHZhciBrIGluIGJhY2t1cCkge1xuICAgICAgICAgICAgdGhpc1trXSA9IGJhY2t1cFtrXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sIFwidGVzdF9tYXRjaFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIGluIGlucHV0XG4gICAgICBuZXh0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuRU9GO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5faW5wdXQpIHtcbiAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0b2tlbiwgbWF0Y2gsIHRlbXBNYXRjaCwgaW5kZXg7XG4gICAgICAgIGlmICghdGhpcy5fbW9yZSkge1xuICAgICAgICAgIHRoaXMueXl0ZXh0ID0gXCJcIjtcbiAgICAgICAgICB0aGlzLm1hdGNoID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcnVsZXMgPSB0aGlzLl9jdXJyZW50UnVsZXMoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRlbXBNYXRjaCA9IHRoaXMuX2lucHV0Lm1hdGNoKHRoaXMucnVsZXNbcnVsZXNbaV1dKTtcbiAgICAgICAgICBpZiAodGVtcE1hdGNoICYmICghbWF0Y2ggfHwgdGVtcE1hdGNoWzBdLmxlbmd0aCA+IG1hdGNoWzBdLmxlbmd0aCkpIHtcbiAgICAgICAgICAgIG1hdGNoID0gdGVtcE1hdGNoO1xuICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIpIHtcbiAgICAgICAgICAgICAgdG9rZW4gPSB0aGlzLnRlc3RfbWF0Y2godGVtcE1hdGNoLCBydWxlc1tpXSk7XG4gICAgICAgICAgICAgIGlmICh0b2tlbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmFja3RyYWNrKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMub3B0aW9ucy5mbGV4KSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICB0b2tlbiA9IHRoaXMudGVzdF9tYXRjaChtYXRjaCwgcnVsZXNbaW5kZXhdKTtcbiAgICAgICAgICBpZiAodG9rZW4gIT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5faW5wdXQgPT09IFwiXCIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5FT0Y7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gVW5yZWNvZ25pemVkIHRleHQuXFxuXCIgKyB0aGlzLnNob3dQb3NpdGlvbigpLCB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgdG9rZW46IG51bGwsXG4gICAgICAgICAgICBsaW5lOiB0aGlzLnl5bGluZW5vXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibmV4dFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIHRoYXQgaGFzIGEgdG9rZW5cbiAgICAgIGxleDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBsZXgoKSB7XG4gICAgICAgIHZhciByID0gdGhpcy5uZXh0KCk7XG4gICAgICAgIGlmIChyKSB7XG4gICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubGV4KCk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibGV4XCIpLFxuICAgICAgLy8gYWN0aXZhdGVzIGEgbmV3IGxleGVyIGNvbmRpdGlvbiBzdGF0ZSAocHVzaGVzIHRoZSBuZXcgbGV4ZXIgY29uZGl0aW9uIHN0YXRlIG9udG8gdGhlIGNvbmRpdGlvbiBzdGFjaylcbiAgICAgIGJlZ2luOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGJlZ2luKGNvbmRpdGlvbikge1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrLnB1c2goY29uZGl0aW9uKTtcbiAgICAgIH0sIFwiYmVnaW5cIiksXG4gICAgICAvLyBwb3AgdGhlIHByZXZpb3VzbHkgYWN0aXZlIGxleGVyIGNvbmRpdGlvbiBzdGF0ZSBvZmYgdGhlIGNvbmRpdGlvbiBzdGFja1xuICAgICAgcG9wU3RhdGU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcG9wU3RhdGUoKSB7XG4gICAgICAgIHZhciBuID0gdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxO1xuICAgICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFjay5wb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1swXTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwb3BTdGF0ZVwiKSxcbiAgICAgIC8vIHByb2R1Y2UgdGhlIGxleGVyIHJ1bGUgc2V0IHdoaWNoIGlzIGFjdGl2ZSBmb3IgdGhlIGN1cnJlbnRseSBhY3RpdmUgbGV4ZXIgY29uZGl0aW9uIHN0YXRlXG4gICAgICBfY3VycmVudFJ1bGVzOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIF9jdXJyZW50UnVsZXMoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAmJiB0aGlzLmNvbmRpdGlvblN0YWNrW3RoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25zW3RoaXMuY29uZGl0aW9uU3RhY2tbdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxXV0ucnVsZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uc1tcIklOSVRJQUxcIl0ucnVsZXM7XG4gICAgICAgIH1cbiAgICAgIH0sIFwiX2N1cnJlbnRSdWxlc1wiKSxcbiAgICAgIC8vIHJldHVybiB0aGUgY3VycmVudGx5IGFjdGl2ZSBsZXhlciBjb25kaXRpb24gc3RhdGU7IHdoZW4gYW4gaW5kZXggYXJndW1lbnQgaXMgcHJvdmlkZWQgaXQgcHJvZHVjZXMgdGhlIE4tdGggcHJldmlvdXMgY29uZGl0aW9uIHN0YXRlLCBpZiBhdmFpbGFibGVcbiAgICAgIHRvcFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHRvcFN0YXRlKG4pIHtcbiAgICAgICAgbiA9IHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMSAtIE1hdGguYWJzKG4gfHwgMCk7XG4gICAgICAgIGlmIChuID49IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1tuXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gXCJJTklUSUFMXCI7XG4gICAgICAgIH1cbiAgICAgIH0sIFwidG9wU3RhdGVcIiksXG4gICAgICAvLyBhbGlhcyBmb3IgYmVnaW4oY29uZGl0aW9uKVxuICAgICAgcHVzaFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHB1c2hTdGF0ZShjb25kaXRpb24pIHtcbiAgICAgICAgdGhpcy5iZWdpbihjb25kaXRpb24pO1xuICAgICAgfSwgXCJwdXNoU3RhdGVcIiksXG4gICAgICAvLyByZXR1cm4gdGhlIG51bWJlciBvZiBzdGF0ZXMgY3VycmVudGx5IG9uIHRoZSBzdGFja1xuICAgICAgc3RhdGVTdGFja1NpemU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gc3RhdGVTdGFja1NpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aDtcbiAgICAgIH0sIFwic3RhdGVTdGFja1NpemVcIiksXG4gICAgICBvcHRpb25zOiB7IFwiY2FzZS1pbnNlbnNpdGl2ZVwiOiB0cnVlIH0sXG4gICAgICBwZXJmb3JtQWN0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGFub255bW91cyh5eSwgeXlfLCAkYXZvaWRpbmdfbmFtZV9jb2xsaXNpb25zLCBZWV9TVEFSVCkge1xuICAgICAgICB2YXIgWVlTVEFURSA9IFlZX1NUQVJUO1xuICAgICAgICBzd2l0Y2ggKCRhdm9pZGluZ19uYW1lX2NvbGxpc2lvbnMpIHtcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcInNoYXBlRGF0YVwiKTtcbiAgICAgICAgICAgIHl5Xy55eXRleHQgPSBcIlwiO1xuICAgICAgICAgICAgcmV0dXJuIDI0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJzaGFwZURhdGFTdHJcIik7XG4gICAgICAgICAgICByZXR1cm4gMjQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gMjQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBjb25zdCByZSA9IC9cXG5cXHMqL2c7XG4gICAgICAgICAgICB5eV8ueXl0ZXh0ID0geXlfLnl5dGV4dC5yZXBsYWNlKHJlLCBcIjxici8+XCIpO1xuICAgICAgICAgICAgcmV0dXJuIDI0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgcmV0dXJuIDI0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkudHJhY2UoXCJGb3VuZCBjb21tZW50XCIsIHl5Xy55eXRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIDY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICByZXR1cm4gODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJDTEFTU1wiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiAxNztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkudHJhY2UoXCJCZWdpbiBpY29uXCIpO1xuICAgICAgICAgICAgdGhpcy5iZWdpbihcIklDT05cIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkudHJhY2UoXCJTUEFDRUxJTkVcIik7XG4gICAgICAgICAgICByZXR1cm4gNjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgICByZXR1cm4gNztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTQ6XG4gICAgICAgICAgICByZXR1cm4gMTY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkudHJhY2UoXCJlbmQgaWNvblwiKTtcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcIkV4cGxvZGluZyBub2RlXCIpO1xuICAgICAgICAgICAgdGhpcy5iZWdpbihcIk5PREVcIik7XG4gICAgICAgICAgICByZXR1cm4gMjA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE3OlxuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkudHJhY2UoXCJDbG91ZFwiKTtcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJOT0RFXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDIwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxODpcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwiRXhwbG9zaW9uIEJhbmdcIik7XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiTk9ERVwiKTtcbiAgICAgICAgICAgIHJldHVybiAyMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTk6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcIkNsb3VkIEJhbmdcIik7XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiTk9ERVwiKTtcbiAgICAgICAgICAgIHJldHVybiAyMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiTk9ERVwiKTtcbiAgICAgICAgICAgIHJldHVybiAyMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjE6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiTk9ERVwiKTtcbiAgICAgICAgICAgIHJldHVybiAyMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjI6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiTk9ERVwiKTtcbiAgICAgICAgICAgIHJldHVybiAyMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjM6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiTk9ERVwiKTtcbiAgICAgICAgICAgIHJldHVybiAyMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjQ6XG4gICAgICAgICAgICByZXR1cm4gMTM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI1OlxuICAgICAgICAgICAgcmV0dXJuIDIzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyNjpcbiAgICAgICAgICAgIHJldHVybiAxMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjc6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiTlNUUjJcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI4OlxuICAgICAgICAgICAgcmV0dXJuIFwiTk9ERV9ERVNDUlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzA6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcIlN0YXJ0aW5nIE5TVFJcIik7XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiTlNUUlwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzE6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcImRlc2NyaXB0aW9uOlwiLCB5eV8ueXl0ZXh0KTtcbiAgICAgICAgICAgIHJldHVybiBcIk5PREVfREVTQ1JcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzI6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDMzOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkudHJhY2UoXCJub2RlIGVuZCApKVwiKTtcbiAgICAgICAgICAgIHJldHVybiBcIk5PREVfREVORFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNDpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwibm9kZSBlbmQgKVwiKTtcbiAgICAgICAgICAgIHJldHVybiBcIk5PREVfREVORFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwibm9kZSBlbmQgLi4uXCIsIHl5Xy55eXRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIFwiTk9ERV9ERU5EXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM2OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkudHJhY2UoXCJub2RlIGVuZCAoKFwiKTtcbiAgICAgICAgICAgIHJldHVybiBcIk5PREVfREVORFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwibm9kZSBlbmQgKC1cIik7XG4gICAgICAgICAgICByZXR1cm4gXCJOT0RFX0RFTkRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzg6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcIm5vZGUgZW5kICgtXCIpO1xuICAgICAgICAgICAgcmV0dXJuIFwiTk9ERV9ERU5EXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM5OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkudHJhY2UoXCJub2RlIGVuZCAoKFwiKTtcbiAgICAgICAgICAgIHJldHVybiBcIk5PREVfREVORFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0MDpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwibm9kZSBlbmQgKChcIik7XG4gICAgICAgICAgICByZXR1cm4gXCJOT0RFX0RFTkRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDE6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcIkxvbmcgZGVzY3JpcHRpb246XCIsIHl5Xy55eXRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIDIxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0MjpcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwiTG9uZyBkZXNjcmlwdGlvbjpcIiwgeXlfLnl5dGV4dCk7XG4gICAgICAgICAgICByZXR1cm4gMjE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSwgXCJhbm9ueW1vdXNcIiksXG4gICAgICBydWxlczogWy9eKD86QFxceykvaSwgL14oPzpbXCJdKS9pLCAvXig/OltcIl0pL2ksIC9eKD86W15cXFwiXSspL2ksIC9eKD86W159XlwiXSspL2ksIC9eKD86XFx9KS9pLCAvXig/OlxccyolJS4qKS9pLCAvXig/OmthbmJhblxcYikvaSwgL14oPzo6OjopL2ksIC9eKD86LispL2ksIC9eKD86XFxuKS9pLCAvXig/Ojo6aWNvblxcKCkvaSwgL14oPzpbXFxzXStbXFxuXSkvaSwgL14oPzpbXFxuXSspL2ksIC9eKD86W15cXCldKykvaSwgL14oPzpcXCkpL2ksIC9eKD86LVxcKSkvaSwgL14oPzpcXCgtKS9pLCAvXig/OlxcKVxcKSkvaSwgL14oPzpcXCkpL2ksIC9eKD86XFwoXFwoKS9pLCAvXig/Olxce1xceykvaSwgL14oPzpcXCgpL2ksIC9eKD86XFxbKS9pLCAvXig/OltcXHNdKykvaSwgL14oPzpbXlxcKFxcW1xcblxcKVxce1xcfUBdKykvaSwgL14oPzokKS9pLCAvXig/OltcIl1bYF0pL2ksIC9eKD86W15gXCJdKykvaSwgL14oPzpbYF1bXCJdKS9pLCAvXig/OltcIl0pL2ksIC9eKD86W15cIl0rKS9pLCAvXig/OltcIl0pL2ksIC9eKD86W1xcKV1cXCkpL2ksIC9eKD86W1xcKV0pL2ksIC9eKD86W1xcXV0pL2ksIC9eKD86XFx9XFx9KS9pLCAvXig/OlxcKC0pL2ksIC9eKD86LVxcKSkvaSwgL14oPzpcXChcXCgpL2ksIC9eKD86XFwoKS9pLCAvXig/OlteXFwpXFxdXFwoXFx9XSspL2ksIC9eKD86LisoPyFcXChcXCgpKS9pXSxcbiAgICAgIGNvbmRpdGlvbnM6IHsgXCJzaGFwZURhdGFFbmRCcmFja2V0XCI6IHsgXCJydWxlc1wiOiBbXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJzaGFwZURhdGFTdHJcIjogeyBcInJ1bGVzXCI6IFsyLCAzXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJzaGFwZURhdGFcIjogeyBcInJ1bGVzXCI6IFsxLCA0LCA1XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJDTEFTU1wiOiB7IFwicnVsZXNcIjogWzksIDEwXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJJQ09OXCI6IHsgXCJydWxlc1wiOiBbMTQsIDE1XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJOU1RSMlwiOiB7IFwicnVsZXNcIjogWzI4LCAyOV0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiTlNUUlwiOiB7IFwicnVsZXNcIjogWzMxLCAzMl0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiTk9ERVwiOiB7IFwicnVsZXNcIjogWzI3LCAzMCwgMzMsIDM0LCAzNSwgMzYsIDM3LCAzOCwgMzksIDQwLCA0MSwgNDJdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIklOSVRJQUxcIjogeyBcInJ1bGVzXCI6IFswLCA2LCA3LCA4LCAxMSwgMTIsIDEzLCAxNiwgMTcsIDE4LCAxOSwgMjAsIDIxLCAyMiwgMjMsIDI0LCAyNSwgMjZdLCBcImluY2x1c2l2ZVwiOiB0cnVlIH0gfVxuICAgIH07XG4gICAgcmV0dXJuIGxleGVyMjtcbiAgfSkoKTtcbiAgcGFyc2VyMi5sZXhlciA9IGxleGVyO1xuICBmdW5jdGlvbiBQYXJzZXIoKSB7XG4gICAgdGhpcy55eSA9IHt9O1xuICB9XG4gIF9fbmFtZShQYXJzZXIsIFwiUGFyc2VyXCIpO1xuICBQYXJzZXIucHJvdG90eXBlID0gcGFyc2VyMjtcbiAgcGFyc2VyMi5QYXJzZXIgPSBQYXJzZXI7XG4gIHJldHVybiBuZXcgUGFyc2VyKCk7XG59KSgpO1xucGFyc2VyLnBhcnNlciA9IHBhcnNlcjtcbnZhciBrYW5iYW5fZGVmYXVsdCA9IHBhcnNlcjtcblxuLy8gc3JjL2RpYWdyYW1zL2thbmJhbi9rYW5iYW5EYi50c1xudmFyIG5vZGVzID0gW107XG52YXIgc2VjdGlvbnMgPSBbXTtcbnZhciBjbnQgPSAwO1xudmFyIGVsZW1lbnRzID0ge307XG52YXIgY2xlYXIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCgpID0+IHtcbiAgbm9kZXMgPSBbXTtcbiAgc2VjdGlvbnMgPSBbXTtcbiAgY250ID0gMDtcbiAgZWxlbWVudHMgPSB7fTtcbn0sIFwiY2xlYXJcIik7XG52YXIgZ2V0U2VjdGlvbiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGxldmVsKSA9PiB7XG4gIGlmIChub2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBzZWN0aW9uTGV2ZWwgPSBub2Rlc1swXS5sZXZlbDtcbiAgbGV0IGxhc3RTZWN0aW9uID0gbnVsbDtcbiAgZm9yIChsZXQgaSA9IG5vZGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKG5vZGVzW2ldLmxldmVsID09PSBzZWN0aW9uTGV2ZWwgJiYgIWxhc3RTZWN0aW9uKSB7XG4gICAgICBsYXN0U2VjdGlvbiA9IG5vZGVzW2ldO1xuICAgIH1cbiAgICBpZiAobm9kZXNbaV0ubGV2ZWwgPCBzZWN0aW9uTGV2ZWwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSXRlbXMgd2l0aG91dCBzZWN0aW9uIGRldGVjdGVkLCBmb3VuZCBzZWN0aW9uIChcIicgKyBub2Rlc1tpXS5sYWJlbCArICdcIiknKTtcbiAgICB9XG4gIH1cbiAgaWYgKGxldmVsID09PSBsYXN0U2VjdGlvbj8ubGV2ZWwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gbGFzdFNlY3Rpb247XG59LCBcImdldFNlY3Rpb25cIik7XG52YXIgZ2V0U2VjdGlvbnMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gc2VjdGlvbnM7XG59LCBcImdldFNlY3Rpb25zXCIpO1xudmFyIGdldERhdGEgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICBjb25zdCBlZGdlcyA9IFtdO1xuICBjb25zdCBfbm9kZXMgPSBbXTtcbiAgY29uc3Qgc2VjdGlvbnMyID0gZ2V0U2VjdGlvbnMoKTtcbiAgY29uc3QgY29uZiA9IGdldENvbmZpZygpO1xuICBmb3IgKGNvbnN0IHNlY3Rpb24gb2Ygc2VjdGlvbnMyKSB7XG4gICAgY29uc3Qgbm9kZSA9IHtcbiAgICAgIGlkOiBzZWN0aW9uLmlkLFxuICAgICAgbGFiZWw6IHNhbml0aXplVGV4dChzZWN0aW9uLmxhYmVsID8/IFwiXCIsIGNvbmYpLFxuICAgICAgbGFiZWxUeXBlOiBcIm1hcmtkb3duXCIsXG4gICAgICBpc0dyb3VwOiB0cnVlLFxuICAgICAgdGlja2V0OiBzZWN0aW9uLnRpY2tldCxcbiAgICAgIHNoYXBlOiBcImthbmJhblNlY3Rpb25cIixcbiAgICAgIGxldmVsOiBzZWN0aW9uLmxldmVsLFxuICAgICAgbG9vazogY29uZi5sb29rXG4gICAgfTtcbiAgICBfbm9kZXMucHVzaChub2RlKTtcbiAgICBjb25zdCBjaGlsZHJlbiA9IG5vZGVzLmZpbHRlcigobikgPT4gbi5wYXJlbnRJZCA9PT0gc2VjdGlvbi5pZCk7XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIGNoaWxkcmVuKSB7XG4gICAgICBjb25zdCBjaGlsZE5vZGUgPSB7XG4gICAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgICBwYXJlbnRJZDogc2VjdGlvbi5pZCxcbiAgICAgICAgbGFiZWw6IHNhbml0aXplVGV4dChpdGVtLmxhYmVsID8/IFwiXCIsIGNvbmYpLFxuICAgICAgICBsYWJlbFR5cGU6IFwibWFya2Rvd25cIixcbiAgICAgICAgaXNHcm91cDogZmFsc2UsXG4gICAgICAgIHRpY2tldDogaXRlbT8udGlja2V0LFxuICAgICAgICBwcmlvcml0eTogaXRlbT8ucHJpb3JpdHksXG4gICAgICAgIGFzc2lnbmVkOiBpdGVtPy5hc3NpZ25lZCxcbiAgICAgICAgaWNvbjogaXRlbT8uaWNvbixcbiAgICAgICAgc2hhcGU6IFwia2FuYmFuSXRlbVwiLFxuICAgICAgICBsZXZlbDogaXRlbS5sZXZlbCxcbiAgICAgICAgcng6IDUsXG4gICAgICAgIHJ5OiA1LFxuICAgICAgICBjc3NTdHlsZXM6IFtcInRleHQtYWxpZ246IGxlZnRcIl1cbiAgICAgIH07XG4gICAgICBfbm9kZXMucHVzaChjaGlsZE5vZGUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4geyBub2RlczogX25vZGVzLCBlZGdlcywgb3RoZXI6IHt9LCBjb25maWc6IGdldENvbmZpZygpIH07XG59LCBcImdldERhdGFcIik7XG52YXIgYWRkTm9kZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGxldmVsLCBpZCwgZGVzY3IsIHR5cGUsIHNoYXBlRGF0YSkgPT4ge1xuICBjb25zdCBjb25mID0gZ2V0Q29uZmlnKCk7XG4gIGxldCBwYWRkaW5nID0gY29uZi5taW5kbWFwPy5wYWRkaW5nID8/IGRlZmF1bHRDb25maWdfZGVmYXVsdC5taW5kbWFwLnBhZGRpbmc7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2Ugbm9kZVR5cGUuUk9VTkRFRF9SRUNUOlxuICAgIGNhc2Ugbm9kZVR5cGUuUkVDVDpcbiAgICBjYXNlIG5vZGVUeXBlLkhFWEFHT046XG4gICAgICBwYWRkaW5nICo9IDI7XG4gIH1cbiAgY29uc3Qgbm9kZSA9IHtcbiAgICBpZDogc2FuaXRpemVUZXh0KGlkLCBjb25mKSB8fCBcImtiblwiICsgY250KyssXG4gICAgbGV2ZWwsXG4gICAgbGFiZWw6IHNhbml0aXplVGV4dChkZXNjciwgY29uZiksXG4gICAgd2lkdGg6IGNvbmYubWluZG1hcD8ubWF4Tm9kZVdpZHRoID8/IGRlZmF1bHRDb25maWdfZGVmYXVsdC5taW5kbWFwLm1heE5vZGVXaWR0aCxcbiAgICBwYWRkaW5nLFxuICAgIGlzR3JvdXA6IGZhbHNlXG4gIH07XG4gIGlmIChzaGFwZURhdGEgIT09IHZvaWQgMCkge1xuICAgIGxldCB5YW1sRGF0YTtcbiAgICBpZiAoIXNoYXBlRGF0YS5pbmNsdWRlcyhcIlxcblwiKSkge1xuICAgICAgeWFtbERhdGEgPSBcIntcXG5cIiArIHNoYXBlRGF0YSArIFwiXFxufVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICB5YW1sRGF0YSA9IHNoYXBlRGF0YSArIFwiXFxuXCI7XG4gICAgfVxuICAgIGNvbnN0IGRvYyA9IGxvYWQoeWFtbERhdGEsIHsgc2NoZW1hOiBKU09OX1NDSEVNQSB9KTtcbiAgICBpZiAoZG9jLnNoYXBlICYmIChkb2Muc2hhcGUgIT09IGRvYy5zaGFwZS50b0xvd2VyQ2FzZSgpIHx8IGRvYy5zaGFwZS5pbmNsdWRlcyhcIl9cIikpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHN1Y2ggc2hhcGU6ICR7ZG9jLnNoYXBlfS4gU2hhcGUgbmFtZXMgc2hvdWxkIGJlIGxvd2VyY2FzZS5gKTtcbiAgICB9XG4gICAgaWYgKGRvYz8uc2hhcGUgJiYgZG9jLnNoYXBlID09PSBcImthbmJhbkl0ZW1cIikge1xuICAgICAgbm9kZS5zaGFwZSA9IGRvYz8uc2hhcGU7XG4gICAgfVxuICAgIGlmIChkb2M/LmxhYmVsKSB7XG4gICAgICBub2RlLmxhYmVsID0gZG9jPy5sYWJlbDtcbiAgICB9XG4gICAgaWYgKGRvYz8uaWNvbikge1xuICAgICAgbm9kZS5pY29uID0gZG9jPy5pY29uLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmIChkb2M/LmFzc2lnbmVkKSB7XG4gICAgICBub2RlLmFzc2lnbmVkID0gZG9jPy5hc3NpZ25lZC50b1N0cmluZygpO1xuICAgIH1cbiAgICBpZiAoZG9jPy50aWNrZXQpIHtcbiAgICAgIG5vZGUudGlja2V0ID0gZG9jPy50aWNrZXQudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgaWYgKGRvYz8ucHJpb3JpdHkpIHtcbiAgICAgIG5vZGUucHJpb3JpdHkgPSBkb2M/LnByaW9yaXR5O1xuICAgIH1cbiAgfVxuICBjb25zdCBzZWN0aW9uID0gZ2V0U2VjdGlvbihsZXZlbCk7XG4gIGlmIChzZWN0aW9uKSB7XG4gICAgbm9kZS5wYXJlbnRJZCA9IHNlY3Rpb24uaWQgfHwgXCJrYm5cIiArIGNudCsrO1xuICB9IGVsc2Uge1xuICAgIHNlY3Rpb25zLnB1c2gobm9kZSk7XG4gIH1cbiAgbm9kZXMucHVzaChub2RlKTtcbn0sIFwiYWRkTm9kZVwiKTtcbnZhciBub2RlVHlwZSA9IHtcbiAgREVGQVVMVDogMCxcbiAgTk9fQk9SREVSOiAwLFxuICBST1VOREVEX1JFQ1Q6IDEsXG4gIFJFQ1Q6IDIsXG4gIENJUkNMRTogMyxcbiAgQ0xPVUQ6IDQsXG4gIEJBTkc6IDUsXG4gIEhFWEFHT046IDZcbn07XG52YXIgZ2V0VHlwZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHN0YXJ0U3RyLCBlbmRTdHIpID0+IHtcbiAgbG9nLmRlYnVnKFwiSW4gZ2V0IHR5cGVcIiwgc3RhcnRTdHIsIGVuZFN0cik7XG4gIHN3aXRjaCAoc3RhcnRTdHIpIHtcbiAgICBjYXNlIFwiW1wiOlxuICAgICAgcmV0dXJuIG5vZGVUeXBlLlJFQ1Q7XG4gICAgY2FzZSBcIihcIjpcbiAgICAgIHJldHVybiBlbmRTdHIgPT09IFwiKVwiID8gbm9kZVR5cGUuUk9VTkRFRF9SRUNUIDogbm9kZVR5cGUuQ0xPVUQ7XG4gICAgY2FzZSBcIigoXCI6XG4gICAgICByZXR1cm4gbm9kZVR5cGUuQ0lSQ0xFO1xuICAgIGNhc2UgXCIpXCI6XG4gICAgICByZXR1cm4gbm9kZVR5cGUuQ0xPVUQ7XG4gICAgY2FzZSBcIikpXCI6XG4gICAgICByZXR1cm4gbm9kZVR5cGUuQkFORztcbiAgICBjYXNlIFwie3tcIjpcbiAgICAgIHJldHVybiBub2RlVHlwZS5IRVhBR09OO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbm9kZVR5cGUuREVGQVVMVDtcbiAgfVxufSwgXCJnZXRUeXBlXCIpO1xudmFyIHNldEVsZW1lbnRGb3JJZCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGlkLCBlbGVtZW50KSA9PiB7XG4gIGVsZW1lbnRzW2lkXSA9IGVsZW1lbnQ7XG59LCBcInNldEVsZW1lbnRGb3JJZFwiKTtcbnZhciBkZWNvcmF0ZU5vZGUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChkZWNvcmF0aW9uKSA9PiB7XG4gIGlmICghZGVjb3JhdGlvbikge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgY29uc3Qgbm9kZSA9IG5vZGVzW25vZGVzLmxlbmd0aCAtIDFdO1xuICBpZiAoZGVjb3JhdGlvbi5pY29uKSB7XG4gICAgbm9kZS5pY29uID0gc2FuaXRpemVUZXh0KGRlY29yYXRpb24uaWNvbiwgY29uZmlnKTtcbiAgfVxuICBpZiAoZGVjb3JhdGlvbi5jbGFzcykge1xuICAgIG5vZGUuY3NzQ2xhc3NlcyA9IHNhbml0aXplVGV4dChkZWNvcmF0aW9uLmNsYXNzLCBjb25maWcpO1xuICB9XG59LCBcImRlY29yYXRlTm9kZVwiKTtcbnZhciB0eXBlMlN0ciA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKHR5cGUpID0+IHtcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSBub2RlVHlwZS5ERUZBVUxUOlxuICAgICAgcmV0dXJuIFwibm8tYm9yZGVyXCI7XG4gICAgY2FzZSBub2RlVHlwZS5SRUNUOlxuICAgICAgcmV0dXJuIFwicmVjdFwiO1xuICAgIGNhc2Ugbm9kZVR5cGUuUk9VTkRFRF9SRUNUOlxuICAgICAgcmV0dXJuIFwicm91bmRlZC1yZWN0XCI7XG4gICAgY2FzZSBub2RlVHlwZS5DSVJDTEU6XG4gICAgICByZXR1cm4gXCJjaXJjbGVcIjtcbiAgICBjYXNlIG5vZGVUeXBlLkNMT1VEOlxuICAgICAgcmV0dXJuIFwiY2xvdWRcIjtcbiAgICBjYXNlIG5vZGVUeXBlLkJBTkc6XG4gICAgICByZXR1cm4gXCJiYW5nXCI7XG4gICAgY2FzZSBub2RlVHlwZS5IRVhBR09OOlxuICAgICAgcmV0dXJuIFwiaGV4Z29uXCI7XG4gICAgLy8gY3NwZWxsOiBkaXNhYmxlLWxpbmVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFwibm8tYm9yZGVyXCI7XG4gIH1cbn0sIFwidHlwZTJTdHJcIik7XG52YXIgZ2V0TG9nZ2VyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiBsb2csIFwiZ2V0TG9nZ2VyXCIpO1xudmFyIGdldEVsZW1lbnRCeUlkID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoaWQpID0+IGVsZW1lbnRzW2lkXSwgXCJnZXRFbGVtZW50QnlJZFwiKTtcbnZhciBkYiA9IHtcbiAgY2xlYXIsXG4gIGFkZE5vZGUsXG4gIGdldFNlY3Rpb25zLFxuICBnZXREYXRhLFxuICBub2RlVHlwZSxcbiAgZ2V0VHlwZSxcbiAgc2V0RWxlbWVudEZvcklkLFxuICBkZWNvcmF0ZU5vZGUsXG4gIHR5cGUyU3RyLFxuICBnZXRMb2dnZXIsXG4gIGdldEVsZW1lbnRCeUlkXG59O1xudmFyIGthbmJhbkRiX2RlZmF1bHQgPSBkYjtcblxuLy8gc3JjL2RpYWdyYW1zL2thbmJhbi9rYW5iYW5SZW5kZXJlci50c1xudmFyIGRyYXcgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGFzeW5jICh0ZXh0LCBpZCwgX3ZlcnNpb24sIGRpYWdPYmopID0+IHtcbiAgbG9nLmRlYnVnKFwiUmVuZGVyaW5nIGthbmJhbiBkaWFncmFtXFxuXCIgKyB0ZXh0KTtcbiAgY29uc3QgZGIyID0gZGlhZ09iai5kYjtcbiAgY29uc3QgZGF0YTRMYXlvdXQgPSBkYjIuZ2V0RGF0YSgpO1xuICBjb25zdCBjb25mID0gZ2V0Q29uZmlnKCk7XG4gIGNvbmYuaHRtbExhYmVscyA9IGZhbHNlO1xuICBjb25zdCBzdmcgPSBzZWxlY3RTdmdFbGVtZW50KGlkKTtcbiAgZm9yIChjb25zdCBub2RlIG9mIGRhdGE0TGF5b3V0Lm5vZGVzKSB7XG4gICAgbm9kZS5kb21JZCA9IGAke2lkfS0ke25vZGUuaWR9YDtcbiAgfVxuICBjb25zdCBzZWN0aW9uc0VsZW0gPSBzdmcuYXBwZW5kKFwiZ1wiKTtcbiAgc2VjdGlvbnNFbGVtLmF0dHIoXCJjbGFzc1wiLCBcInNlY3Rpb25zXCIpO1xuICBjb25zdCBub2Rlc0VsZW0gPSBzdmcuYXBwZW5kKFwiZ1wiKTtcbiAgbm9kZXNFbGVtLmF0dHIoXCJjbGFzc1wiLCBcIml0ZW1zXCIpO1xuICBjb25zdCBzZWN0aW9uczIgPSBkYXRhNExheW91dC5ub2Rlcy5maWx0ZXIoXG4gICAgLy8gVE9ETzogVHlwZVNjcmlwdCA1LjUgd2lsbCBpbmZlciB0aGlzIHByZWRpY2F0ZSBhdXRvbWF0aWNhbGx5XG4gICAgKG5vZGUpID0+IG5vZGUuaXNHcm91cFxuICApO1xuICBsZXQgY250MiA9IDA7XG4gIGNvbnN0IHBhZGRpbmcgPSAxMDtcbiAgY29uc3Qgc2VjdGlvbk9iamVjdHMgPSBbXTtcbiAgbGV0IG1heExhYmVsSGVpZ2h0ID0gMjU7XG4gIGZvciAoY29uc3Qgc2VjdGlvbiBvZiBzZWN0aW9uczIpIHtcbiAgICBjb25zdCBXSURUSCA9IGNvbmY/LmthbmJhbj8uc2VjdGlvbldpZHRoIHx8IDIwMDtcbiAgICBjbnQyID0gY250MiArIDE7XG4gICAgc2VjdGlvbi54ID0gV0lEVEggKiBjbnQyICsgKGNudDIgLSAxKSAqIHBhZGRpbmcgLyAyO1xuICAgIHNlY3Rpb24ud2lkdGggPSBXSURUSDtcbiAgICBzZWN0aW9uLnkgPSAwO1xuICAgIHNlY3Rpb24uaGVpZ2h0ID0gV0lEVEggKiAzO1xuICAgIHNlY3Rpb24ucnggPSA1O1xuICAgIHNlY3Rpb24ucnkgPSA1O1xuICAgIHNlY3Rpb24uY3NzQ2xhc3NlcyA9IHNlY3Rpb24uY3NzQ2xhc3NlcyArIFwiIHNlY3Rpb24tXCIgKyBjbnQyO1xuICAgIGNvbnN0IHNlY3Rpb25PYmogPSBhd2FpdCBpbnNlcnRDbHVzdGVyKHNlY3Rpb25zRWxlbSwgc2VjdGlvbik7XG4gICAgbWF4TGFiZWxIZWlnaHQgPSBNYXRoLm1heChtYXhMYWJlbEhlaWdodCwgc2VjdGlvbk9iaj8ubGFiZWxCQm94Py5oZWlnaHQpO1xuICAgIHNlY3Rpb25PYmplY3RzLnB1c2goc2VjdGlvbk9iaik7XG4gIH1cbiAgbGV0IGkgPSAwO1xuICBmb3IgKGNvbnN0IHNlY3Rpb24gb2Ygc2VjdGlvbnMyKSB7XG4gICAgY29uc3Qgc2VjdGlvbk9iaiA9IHNlY3Rpb25PYmplY3RzW2ldO1xuICAgIGkgPSBpICsgMTtcbiAgICBjb25zdCBXSURUSCA9IGNvbmY/LmthbmJhbj8uc2VjdGlvbldpZHRoIHx8IDIwMDtcbiAgICBjb25zdCB0b3AgPSAtV0lEVEggKiAzIC8gMiArIG1heExhYmVsSGVpZ2h0O1xuICAgIGxldCB5ID0gdG9wO1xuICAgIGNvbnN0IHNlY3Rpb25JdGVtcyA9IGRhdGE0TGF5b3V0Lm5vZGVzLmZpbHRlcigobm9kZSkgPT4gbm9kZS5wYXJlbnRJZCA9PT0gc2VjdGlvbi5pZCk7XG4gICAgZm9yIChjb25zdCBpdGVtIG9mIHNlY3Rpb25JdGVtcykge1xuICAgICAgaWYgKGl0ZW0uaXNHcm91cCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHcm91cHMgd2l0aGluIGdyb3VwcyBhcmUgbm90IGFsbG93ZWQgaW4gS2FuYmFuIGRpYWdyYW1zXCIpO1xuICAgICAgfVxuICAgICAgaXRlbS54ID0gc2VjdGlvbi54O1xuICAgICAgaXRlbS53aWR0aCA9IFdJRFRIIC0gMS41ICogcGFkZGluZztcbiAgICAgIGNvbnN0IG5vZGVFbCA9IGF3YWl0IGluc2VydE5vZGUobm9kZXNFbGVtLCBpdGVtLCB7IGNvbmZpZzogY29uZiB9KTtcbiAgICAgIGNvbnN0IGJib3ggPSBub2RlRWwubm9kZSgpLmdldEJCb3goKTtcbiAgICAgIGl0ZW0ueSA9IHkgKyBiYm94LmhlaWdodCAvIDI7XG4gICAgICBhd2FpdCBwb3NpdGlvbk5vZGUoaXRlbSk7XG4gICAgICB5ID0gaXRlbS55ICsgYmJveC5oZWlnaHQgLyAyICsgcGFkZGluZyAvIDI7XG4gICAgfVxuICAgIGNvbnN0IHJlY3QgPSBzZWN0aW9uT2JqLmNsdXN0ZXIuc2VsZWN0KFwicmVjdFwiKTtcbiAgICBjb25zdCBoZWlnaHQgPSBNYXRoLm1heCh5IC0gdG9wICsgMyAqIHBhZGRpbmcsIDUwKSArIChtYXhMYWJlbEhlaWdodCAtIDI1KTtcbiAgICByZWN0LmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcbiAgfVxuICBzZXR1cEdyYXBoVmlld2JveChcbiAgICB2b2lkIDAsXG4gICAgc3ZnLFxuICAgIGNvbmYubWluZG1hcD8ucGFkZGluZyA/PyBkZWZhdWx0Q29uZmlnX2RlZmF1bHQua2FuYmFuLnBhZGRpbmcsXG4gICAgY29uZi5taW5kbWFwPy51c2VNYXhXaWR0aCA/PyBkZWZhdWx0Q29uZmlnX2RlZmF1bHQua2FuYmFuLnVzZU1heFdpZHRoXG4gICk7XG59LCBcImRyYXdcIik7XG52YXIga2FuYmFuUmVuZGVyZXJfZGVmYXVsdCA9IHtcbiAgZHJhd1xufTtcblxuLy8gc3JjL2RpYWdyYW1zL2thbmJhbi9zdHlsZXMudHNcbmltcG9ydCB7IGRhcmtlbiwgbGlnaHRlbiwgaXNEYXJrIH0gZnJvbSBcImtocm9tYVwiO1xudmFyIGdlblNlY3Rpb25zID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgob3B0aW9ucykgPT4ge1xuICBsZXQgc2VjdGlvbnMyID0gXCJcIjtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcHRpb25zLlRIRU1FX0NPTE9SX0xJTUlUOyBpKyspIHtcbiAgICBvcHRpb25zW1wibGluZUNvbG9yXCIgKyBpXSA9IG9wdGlvbnNbXCJsaW5lQ29sb3JcIiArIGldIHx8IG9wdGlvbnNbXCJjU2NhbGVJbnZcIiArIGldO1xuICAgIGlmIChpc0Rhcmsob3B0aW9uc1tcImxpbmVDb2xvclwiICsgaV0pKSB7XG4gICAgICBvcHRpb25zW1wibGluZUNvbG9yXCIgKyBpXSA9IGxpZ2h0ZW4ob3B0aW9uc1tcImxpbmVDb2xvclwiICsgaV0sIDIwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0aW9uc1tcImxpbmVDb2xvclwiICsgaV0gPSBkYXJrZW4ob3B0aW9uc1tcImxpbmVDb2xvclwiICsgaV0sIDIwKTtcbiAgICB9XG4gIH1cbiAgY29uc3QgYWRqdXN0ZXIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChjb2xvciwgbGV2ZWwpID0+IG9wdGlvbnMuZGFya01vZGUgPyBkYXJrZW4oY29sb3IsIGxldmVsKSA6IGxpZ2h0ZW4oY29sb3IsIGxldmVsKSwgXCJhZGp1c3RlclwiKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcHRpb25zLlRIRU1FX0NPTE9SX0xJTUlUOyBpKyspIHtcbiAgICBjb25zdCBzdyA9IFwiXCIgKyAoMTcgLSAzICogaSk7XG4gICAgc2VjdGlvbnMyICs9IGBcbiAgICAuc2VjdGlvbi0ke2kgLSAxfSByZWN0LCAuc2VjdGlvbi0ke2kgLSAxfSBwYXRoLCAuc2VjdGlvbi0ke2kgLSAxfSBjaXJjbGUsIC5zZWN0aW9uLSR7aSAtIDF9IHBvbHlnb24sIC5zZWN0aW9uLSR7aSAtIDF9IHBhdGggIHtcbiAgICAgIGZpbGw6ICR7YWRqdXN0ZXIob3B0aW9uc1tcImNTY2FsZVwiICsgaV0sIDEwKX07XG4gICAgICBzdHJva2U6ICR7YWRqdXN0ZXIob3B0aW9uc1tcImNTY2FsZVwiICsgaV0sIDEwKX07XG5cbiAgICB9XG4gICAgLnNlY3Rpb24tJHtpIC0gMX0gdGV4dCB7XG4gICAgIGZpbGw6ICR7b3B0aW9uc1tcImNTY2FsZUxhYmVsXCIgKyBpXX07XG4gICAgfVxuICAgIC5ub2RlLWljb24tJHtpIC0gMX0ge1xuICAgICAgZm9udC1zaXplOiA0MHB4O1xuICAgICAgY29sb3I6ICR7b3B0aW9uc1tcImNTY2FsZUxhYmVsXCIgKyBpXX07XG4gICAgfVxuICAgIC5zZWN0aW9uLWVkZ2UtJHtpIC0gMX17XG4gICAgICBzdHJva2U6ICR7b3B0aW9uc1tcImNTY2FsZVwiICsgaV19O1xuICAgIH1cbiAgICAuZWRnZS1kZXB0aC0ke2kgLSAxfXtcbiAgICAgIHN0cm9rZS13aWR0aDogJHtzd307XG4gICAgfVxuICAgIC5zZWN0aW9uLSR7aSAtIDF9IGxpbmUge1xuICAgICAgc3Ryb2tlOiAke29wdGlvbnNbXCJjU2NhbGVJbnZcIiArIGldfSA7XG4gICAgICBzdHJva2Utd2lkdGg6IDM7XG4gICAgfVxuXG4gICAgLmRpc2FibGVkLCAuZGlzYWJsZWQgY2lyY2xlLCAuZGlzYWJsZWQgdGV4dCB7XG4gICAgICBmaWxsOiBsaWdodGdyYXk7XG4gICAgfVxuICAgIC5kaXNhYmxlZCB0ZXh0IHtcbiAgICAgIGZpbGw6ICNlZmVmZWY7XG4gICAgfVxuXG4gIC5ub2RlIHJlY3QsXG4gIC5ub2RlIGNpcmNsZSxcbiAgLm5vZGUgZWxsaXBzZSxcbiAgLm5vZGUgcG9seWdvbixcbiAgLm5vZGUgcGF0aCB7XG4gICAgZmlsbDogJHtvcHRpb25zLmJhY2tncm91bmR9O1xuICAgIHN0cm9rZTogJHtvcHRpb25zLm5vZGVCb3JkZXJ9O1xuICAgIHN0cm9rZS13aWR0aDogMXB4O1xuICB9XG5cbiAgLmthbmJhbi10aWNrZXQtbGluayB7XG4gICAgZmlsbDogJHtvcHRpb25zLmJhY2tncm91bmR9O1xuICAgIHN0cm9rZTogJHtvcHRpb25zLm5vZGVCb3JkZXJ9O1xuICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lO1xuICB9XG4gICAgYDtcbiAgfVxuICByZXR1cm4gc2VjdGlvbnMyO1xufSwgXCJnZW5TZWN0aW9uc1wiKTtcbnZhciBnZXRTdHlsZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChvcHRpb25zKSA9PiBgXG4gIC5lZGdlIHtcbiAgICBzdHJva2Utd2lkdGg6IDM7XG4gIH1cbiAgJHtnZW5TZWN0aW9ucyhvcHRpb25zKX1cbiAgLnNlY3Rpb24tcm9vdCByZWN0LCAuc2VjdGlvbi1yb290IHBhdGgsIC5zZWN0aW9uLXJvb3QgY2lyY2xlLCAuc2VjdGlvbi1yb290IHBvbHlnb24gIHtcbiAgICBmaWxsOiAke29wdGlvbnMuZ2l0MH07XG4gIH1cbiAgLnNlY3Rpb24tcm9vdCB0ZXh0IHtcbiAgICBmaWxsOiAke29wdGlvbnMuZ2l0QnJhbmNoTGFiZWwwfTtcbiAgfVxuICAuaWNvbi1jb250YWluZXIge1xuICAgIGhlaWdodDoxMDAlO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgfVxuICAuZWRnZSB7XG4gICAgZmlsbDogbm9uZTtcbiAgfVxuICAuY2x1c3Rlci1sYWJlbCwgLmxhYmVsIHtcbiAgICBjb2xvcjogJHtvcHRpb25zLnRleHRDb2xvcn07XG4gICAgZmlsbDogJHtvcHRpb25zLnRleHRDb2xvcn07XG4gICAgfVxuICAua2FuYmFuLWxhYmVsIHtcbiAgICBkeTogMWVtO1xuICAgIGFsaWdubWVudC1iYXNlbGluZTogbWlkZGxlO1xuICAgIHRleHQtYW5jaG9yOiBtaWRkbGU7XG4gICAgZG9taW5hbnQtYmFzZWxpbmU6IG1pZGRsZTtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIH1cbiAgICAke2dldEljb25TdHlsZXMoKX1cbmAsIFwiZ2V0U3R5bGVzXCIpO1xudmFyIHN0eWxlc19kZWZhdWx0ID0gZ2V0U3R5bGVzO1xuXG4vLyBzcmMvZGlhZ3JhbXMva2FuYmFuL2thbmJhbi1kZWZpbml0aW9uLnRzXG52YXIgZGlhZ3JhbSA9IHtcbiAgZGI6IGthbmJhbkRiX2RlZmF1bHQsXG4gIHJlbmRlcmVyOiBrYW5iYW5SZW5kZXJlcl9kZWZhdWx0LFxuICBwYXJzZXI6IGthbmJhbl9kZWZhdWx0LFxuICBzdHlsZXM6IHN0eWxlc19kZWZhdWx0XG59O1xuZXhwb3J0IHtcbiAgZGlhZ3JhbVxufTtcbiIKICBdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUErQkEsSUFBSSxTQUFVLFFBQVEsR0FBRztBQUFBLEVBQ3ZCLElBQUksb0JBQW9CLE9BQU8sUUFBUSxDQUFDLEdBQUcsR0FBRyxJQUFJLEdBQUc7QUFBQSxJQUNuRCxLQUFLLEtBQUssTUFBTSxDQUFDLEdBQUcsSUFBSSxFQUFFLE9BQVEsS0FBSyxHQUFHLEVBQUUsTUFBTTtBQUFBO0FBQUEsSUFDbEQsT0FBTztBQUFBLEtBQ04sR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRTtBQUFBLEVBQzNWLElBQUksVUFBVTtBQUFBLElBQ1osdUJBQXVCLE9BQU8sU0FBUyxLQUFLLEdBQUcsSUFDNUMsT0FBTztBQUFBLElBQ1YsSUFBSSxDQUFDO0FBQUEsSUFDTCxVQUFVLEVBQUUsT0FBUyxHQUFHLE9BQVMsR0FBRyxTQUFXLEdBQUcsWUFBYyxHQUFHLFdBQWEsR0FBRyxJQUFNLEdBQUcsUUFBVSxHQUFHLFVBQVksR0FBRyxNQUFRLElBQUksS0FBTyxJQUFJLFdBQWEsSUFBSSxXQUFhLElBQUksTUFBUSxJQUFJLFdBQWEsSUFBSSxNQUFRLElBQUksT0FBUyxJQUFJLFlBQWMsSUFBSSxlQUFpQixJQUFJLGFBQWUsSUFBSSxZQUFjLElBQUksV0FBYSxJQUFJLFNBQVcsSUFBSSxZQUFjLElBQUksU0FBVyxHQUFHLE1BQVEsRUFBRTtBQUFBLElBQzdYLFlBQVksRUFBRSxHQUFHLFNBQVMsR0FBRyxhQUFhLEdBQUcsTUFBTSxHQUFHLFVBQVUsSUFBSSxPQUFPLElBQUksYUFBYSxJQUFJLFFBQVEsSUFBSSxTQUFTLElBQUksZUFBZSxJQUFJLGNBQWMsSUFBSSxhQUFhLElBQUksV0FBVyxJQUFJLGFBQWE7QUFBQSxJQUMzTSxjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FB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QUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUFBLElBQy95QyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQUEsSUFDdkMsNEJBQTRCLE9BQU8sU0FBUyxVQUFVLENBQUMsS0FBSyxNQUFNO0FBQUEsTUFDaEUsSUFBSSxLQUFLLGFBQWE7QUFBQSxRQUNwQixLQUFLLE1BQU0sR0FBRztBQUFBLE1BQ2hCLEVBQU87QUFBQSxRQUNMLElBQUksUUFBUSxJQUFJLE1BQU0sR0FBRztBQUFBLFFBQ3pCLE1BQU0sT0FBTztBQUFBLFFBQ2IsTUFBTTtBQUFBO0FBQUEsT0FFUCxZQUFZO0FBQUEsSUFDZix1QkFBdUIsT0FBTyxTQUFTLEtBQUssQ0FBQyxPQUFPO0FBQUEsTUFDbEQsSUFBSSxPQUFPLE1BQU0sUUFBUSxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxHQUFHLFFBQVEsS0FBSyxPQUFPLFNBQVMsSUFBSSxXQUFXLEdBQUcsU0FBUyxHQUFHLGFBQWEsR0FBRyxTQUFTLEdBQUcsTUFBTTtBQUFBLE1BQ3RLLElBQUksT0FBTyxPQUFPLE1BQU0sS0FBSyxXQUFXLENBQUM7QUFBQSxNQUN6QyxJQUFJLFNBQVMsT0FBTyxPQUFPLEtBQUssS0FBSztBQUFBLE1BQ3JDLElBQUksY0FBYyxFQUFFLElBQUksQ0FBQyxFQUFFO0FBQUEsTUFDM0IsU0FBUyxLQUFLLEtBQUssSUFBSTtBQUFBLFFBQ3JCLElBQUksT0FBTyxVQUFVLGVBQWUsS0FBSyxLQUFLLElBQUksQ0FBQyxHQUFHO0FBQUEsVUFDcEQsWUFBWSxHQUFHLEtBQUssS0FBSyxHQUFHO0FBQUEsUUFDOUI7QUFBQSxNQUNGO0FBQUEsTUFDQSxPQUFPLFNBQVMsT0FBTyxZQUFZLEVBQUU7QUFBQSxNQUNyQyxZQUFZLEdBQUcsUUFBUTtBQUFBLE1BQ3ZCLFlBQVksR0FBRyxTQUFTO0FBQUEsTUFDeEIsSUFBSSxPQUFPLE9BQU8sVUFBVSxhQUFhO0FBQUEsUUFDdkMsT0FBTyxTQUFTLENBQUM7QUFBQSxNQUNuQjtBQUFBLE1BQ0EsSUFBSSxRQUFRLE9BQU87QUFBQSxNQUNuQixPQUFPLEtBQUssS0FBSztBQUFBLE1BQ2pCLElBQUksU0FBUyxPQUFPLFdBQVcsT0FBTyxRQUFRO0FBQUEsTUFDOUMsSUFBSSxPQUFPLFlBQVksR0FBRyxlQUFlLFlBQVk7QUFBQSxRQUNuRCxLQUFLLGFBQWEsWUFBWSxHQUFHO0FBQUEsTUFDbkMsRUFBTztBQUFBLFFBQ0wsS0FBSyxhQUFhLE9BQU8sZUFBZSxJQUFJLEVBQUU7QUFBQTtBQUFBLE1BRWhELFNBQVMsUUFBUSxDQUFDLEdBQUc7QUFBQSxRQUNuQixNQUFNLFNBQVMsTUFBTSxTQUFTLElBQUk7QUFBQSxRQUNsQyxPQUFPLFNBQVMsT0FBTyxTQUFTO0FBQUEsUUFDaEMsT0FBTyxTQUFTLE9BQU8sU0FBUztBQUFBO0FBQUEsTUFFbEMsT0FBTyxVQUFVLFVBQVU7QUFBQSxNQUMzQixTQUFTLEdBQUcsR0FBRztBQUFBLFFBQ2IsSUFBSTtBQUFBLFFBQ0osUUFBUSxPQUFPLElBQUksS0FBSyxPQUFPLElBQUksS0FBSztBQUFBLFFBQ3hDLElBQUksT0FBTyxVQUFVLFVBQVU7QUFBQSxVQUM3QixJQUFJLGlCQUFpQixPQUFPO0FBQUEsWUFDMUIsU0FBUztBQUFBLFlBQ1QsUUFBUSxPQUFPLElBQUk7QUFBQSxVQUNyQjtBQUFBLFVBQ0EsUUFBUSxLQUFLLFNBQVMsVUFBVTtBQUFBLFFBQ2xDO0FBQUEsUUFDQSxPQUFPO0FBQUE7QUFBQSxNQUVULE9BQU8sS0FBSyxLQUFLO0FBQUEsTUFDakIsSUFBSSxRQUFRLGdCQUFnQixPQUFPLFFBQVEsR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEdBQUcsS0FBSyxVQUFVO0FBQUEsTUFDL0UsT0FBTyxNQUFNO0FBQUEsUUFDWCxRQUFRLE1BQU0sTUFBTSxTQUFTO0FBQUEsUUFDN0IsSUFBSSxLQUFLLGVBQWUsUUFBUTtBQUFBLFVBQzlCLFNBQVMsS0FBSyxlQUFlO0FBQUEsUUFDL0IsRUFBTztBQUFBLFVBQ0wsSUFBSSxXQUFXLFFBQVEsT0FBTyxVQUFVLGFBQWE7QUFBQSxZQUNuRCxTQUFTLElBQUk7QUFBQSxVQUNmO0FBQUEsVUFDQSxTQUFTLE1BQU0sVUFBVSxNQUFNLE9BQU87QUFBQTtBQUFBLFFBRXhDLElBQUksT0FBTyxXQUFXLGVBQWUsQ0FBQyxPQUFPLFVBQVUsQ0FBQyxPQUFPLElBQUk7QUFBQSxVQUNqRSxJQUFJLFNBQVM7QUFBQSxVQUNiLFdBQVcsQ0FBQztBQUFBLFVBQ1osS0FBSyxLQUFLLE1BQU0sUUFBUTtBQUFBLFlBQ3RCLElBQUksS0FBSyxXQUFXLE1BQU0sSUFBSSxRQUFRO0FBQUEsY0FDcEMsU0FBUyxLQUFLLE1BQU0sS0FBSyxXQUFXLEtBQUssR0FBRztBQUFBLFlBQzlDO0FBQUEsVUFDRjtBQUFBLFVBQ0EsSUFBSSxPQUFPLGNBQWM7QUFBQSxZQUN2QixTQUFTLDBCQUEwQixXQUFXLEtBQUs7QUFBQSxJQUFRLE9BQU8sYUFBYSxJQUFJO0FBQUEsY0FBaUIsU0FBUyxLQUFLLElBQUksSUFBSSxhQUFhLEtBQUssV0FBVyxXQUFXLFVBQVU7QUFBQSxVQUM5SyxFQUFPO0FBQUEsWUFDTCxTQUFTLDBCQUEwQixXQUFXLEtBQUssbUJBQW1CLFVBQVUsTUFBTSxpQkFBaUIsT0FBTyxLQUFLLFdBQVcsV0FBVyxVQUFVO0FBQUE7QUFBQSxVQUVySixLQUFLLFdBQVcsUUFBUTtBQUFBLFlBQ3RCLE1BQU0sT0FBTztBQUFBLFlBQ2IsT0FBTyxLQUFLLFdBQVcsV0FBVztBQUFBLFlBQ2xDLE1BQU0sT0FBTztBQUFBLFlBQ2IsS0FBSztBQUFBLFlBQ0w7QUFBQSxVQUNGLENBQUM7QUFBQSxRQUNIO0FBQUEsUUFDQSxJQUFJLE9BQU8sY0FBYyxTQUFTLE9BQU8sU0FBUyxHQUFHO0FBQUEsVUFDbkQsTUFBTSxJQUFJLE1BQU0sc0RBQXNELFFBQVEsY0FBYyxNQUFNO0FBQUEsUUFDcEc7QUFBQSxRQUNBLFFBQVEsT0FBTztBQUFBLGVBQ1I7QUFBQSxZQUNILE1BQU0sS0FBSyxNQUFNO0FBQUEsWUFDakIsT0FBTyxLQUFLLE9BQU8sTUFBTTtBQUFBLFlBQ3pCLE9BQU8sS0FBSyxPQUFPLE1BQU07QUFBQSxZQUN6QixNQUFNLEtBQUssT0FBTyxFQUFFO0FBQUEsWUFDcEIsU0FBUztBQUFBLFlBQ1QsSUFBSSxDQUFDLGdCQUFnQjtBQUFBLGNBQ25CLFNBQVMsT0FBTztBQUFBLGNBQ2hCLFNBQVMsT0FBTztBQUFBLGNBQ2hCLFdBQVcsT0FBTztBQUFBLGNBQ2xCLFFBQVEsT0FBTztBQUFBLGNBQ2YsSUFBSSxhQUFhLEdBQUc7QUFBQSxnQkFDbEI7QUFBQSxjQUNGO0FBQUEsWUFDRixFQUFPO0FBQUEsY0FDTCxTQUFTO0FBQUEsY0FDVCxpQkFBaUI7QUFBQTtBQUFBLFlBRW5CO0FBQUEsZUFDRztBQUFBLFlBQ0gsTUFBTSxLQUFLLGFBQWEsT0FBTyxJQUFJO0FBQUEsWUFDbkMsTUFBTSxJQUFJLE9BQU8sT0FBTyxTQUFTO0FBQUEsWUFDakMsTUFBTSxLQUFLO0FBQUEsY0FDVCxZQUFZLE9BQU8sT0FBTyxVQUFVLE9BQU8sSUFBSTtBQUFBLGNBQy9DLFdBQVcsT0FBTyxPQUFPLFNBQVMsR0FBRztBQUFBLGNBQ3JDLGNBQWMsT0FBTyxPQUFPLFVBQVUsT0FBTyxJQUFJO0FBQUEsY0FDakQsYUFBYSxPQUFPLE9BQU8sU0FBUyxHQUFHO0FBQUEsWUFDekM7QUFBQSxZQUNBLElBQUksUUFBUTtBQUFBLGNBQ1YsTUFBTSxHQUFHLFFBQVE7QUFBQSxnQkFDZixPQUFPLE9BQU8sVUFBVSxPQUFPLElBQUksTUFBTTtBQUFBLGdCQUN6QyxPQUFPLE9BQU8sU0FBUyxHQUFHLE1BQU07QUFBQSxjQUNsQztBQUFBLFlBQ0Y7QUFBQSxZQUNBLElBQUksS0FBSyxjQUFjLE1BQU0sT0FBTztBQUFBLGNBQ2xDO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBLFlBQVk7QUFBQSxjQUNaLE9BQU87QUFBQSxjQUNQO0FBQUEsY0FDQTtBQUFBLFlBQ0YsRUFBRSxPQUFPLElBQUksQ0FBQztBQUFBLFlBQ2QsSUFBSSxPQUFPLE1BQU0sYUFBYTtBQUFBLGNBQzVCLE9BQU87QUFBQSxZQUNUO0FBQUEsWUFDQSxJQUFJLEtBQUs7QUFBQSxjQUNQLFFBQVEsTUFBTSxNQUFNLEdBQUcsS0FBSyxNQUFNLENBQUM7QUFBQSxjQUNuQyxTQUFTLE9BQU8sTUFBTSxHQUFHLEtBQUssR0FBRztBQUFBLGNBQ2pDLFNBQVMsT0FBTyxNQUFNLEdBQUcsS0FBSyxHQUFHO0FBQUEsWUFDbkM7QUFBQSxZQUNBLE1BQU0sS0FBSyxLQUFLLGFBQWEsT0FBTyxJQUFJLEVBQUU7QUFBQSxZQUMxQyxPQUFPLEtBQUssTUFBTSxDQUFDO0FBQUEsWUFDbkIsT0FBTyxLQUFLLE1BQU0sRUFBRTtBQUFBLFlBQ3BCLFdBQVcsTUFBTSxNQUFNLE1BQU0sU0FBUyxJQUFJLE1BQU0sTUFBTSxTQUFTO0FBQUEsWUFDL0QsTUFBTSxLQUFLLFFBQVE7QUFBQSxZQUNuQjtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQTtBQUFBLE1BRWI7QUFBQSxNQUNBLE9BQU87QUFBQSxPQUNOLE9BQU87QUFBQSxFQUNaO0FBQUEsRUFDQSxJQUFJLHdCQUF5QixRQUFRLEdBQUc7QUFBQSxJQUN0QyxJQUFJLFNBQVM7QUFBQSxNQUNYLEtBQUs7QUFBQSxNQUNMLDRCQUE0QixPQUFPLFNBQVMsVUFBVSxDQUFDLEtBQUssTUFBTTtBQUFBLFFBQ2hFLElBQUksS0FBSyxHQUFHLFFBQVE7QUFBQSxVQUNsQixLQUFLLEdBQUcsT0FBTyxXQUFXLEtBQUssSUFBSTtBQUFBLFFBQ3JDLEVBQU87QUFBQSxVQUNMLE1BQU0sSUFBSSxNQUFNLEdBQUc7QUFBQTtBQUFBLFNBRXBCLFlBQVk7QUFBQSxNQUVmLDBCQUEwQixPQUFPLFFBQVEsQ0FBQyxPQUFPLElBQUk7QUFBQSxRQUNuRCxLQUFLLEtBQUssTUFBTSxLQUFLLE1BQU0sQ0FBQztBQUFBLFFBQzVCLEtBQUssU0FBUztBQUFBLFFBQ2QsS0FBSyxRQUFRLEtBQUssYUFBYSxLQUFLLE9BQU87QUFBQSxRQUMzQyxLQUFLLFdBQVcsS0FBSyxTQUFTO0FBQUEsUUFDOUIsS0FBSyxTQUFTLEtBQUssVUFBVSxLQUFLLFFBQVE7QUFBQSxRQUMxQyxLQUFLLGlCQUFpQixDQUFDLFNBQVM7QUFBQSxRQUNoQyxLQUFLLFNBQVM7QUFBQSxVQUNaLFlBQVk7QUFBQSxVQUNaLGNBQWM7QUFBQSxVQUNkLFdBQVc7QUFBQSxVQUNYLGFBQWE7QUFBQSxRQUNmO0FBQUEsUUFDQSxJQUFJLEtBQUssUUFBUSxRQUFRO0FBQUEsVUFDdkIsS0FBSyxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUM7QUFBQSxRQUMzQjtBQUFBLFFBQ0EsS0FBSyxTQUFTO0FBQUEsUUFDZCxPQUFPO0FBQUEsU0FDTixVQUFVO0FBQUEsTUFFYix1QkFBdUIsT0FBTyxRQUFRLEdBQUc7QUFBQSxRQUN2QyxJQUFJLEtBQUssS0FBSyxPQUFPO0FBQUEsUUFDckIsS0FBSyxVQUFVO0FBQUEsUUFDZixLQUFLO0FBQUEsUUFDTCxLQUFLO0FBQUEsUUFDTCxLQUFLLFNBQVM7QUFBQSxRQUNkLEtBQUssV0FBVztBQUFBLFFBQ2hCLElBQUksUUFBUSxHQUFHLE1BQU0saUJBQWlCO0FBQUEsUUFDdEMsSUFBSSxPQUFPO0FBQUEsVUFDVCxLQUFLO0FBQUEsVUFDTCxLQUFLLE9BQU87QUFBQSxRQUNkLEVBQU87QUFBQSxVQUNMLEtBQUssT0FBTztBQUFBO0FBQUEsUUFFZCxJQUFJLEtBQUssUUFBUSxRQUFRO0FBQUEsVUFDdkIsS0FBSyxPQUFPLE1BQU07QUFBQSxRQUNwQjtBQUFBLFFBQ0EsS0FBSyxTQUFTLEtBQUssT0FBTyxNQUFNLENBQUM7QUFBQSxRQUNqQyxPQUFPO0FBQUEsU0FDTixPQUFPO0FBQUEsTUFFVix1QkFBdUIsT0FBTyxRQUFRLENBQUMsSUFBSTtBQUFBLFFBQ3pDLElBQUksTUFBTSxHQUFHO0FBQUEsUUFDYixJQUFJLFFBQVEsR0FBRyxNQUFNLGVBQWU7QUFBQSxRQUNwQyxLQUFLLFNBQVMsS0FBSyxLQUFLO0FBQUEsUUFDeEIsS0FBSyxTQUFTLEtBQUssT0FBTyxPQUFPLEdBQUcsS0FBSyxPQUFPLFNBQVMsR0FBRztBQUFBLFFBQzVELEtBQUssVUFBVTtBQUFBLFFBQ2YsSUFBSSxXQUFXLEtBQUssTUFBTSxNQUFNLGVBQWU7QUFBQSxRQUMvQyxLQUFLLFFBQVEsS0FBSyxNQUFNLE9BQU8sR0FBRyxLQUFLLE1BQU0sU0FBUyxDQUFDO0FBQUEsUUFDdkQsS0FBSyxVQUFVLEtBQUssUUFBUSxPQUFPLEdBQUcsS0FBSyxRQUFRLFNBQVMsQ0FBQztBQUFBLFFBQzdELElBQUksTUFBTSxTQUFTLEdBQUc7QUFBQSxVQUNwQixLQUFLLFlBQVksTUFBTSxTQUFTO0FBQUEsUUFDbEM7QUFBQSxRQUNBLElBQUksSUFBSSxLQUFLLE9BQU87QUFBQSxRQUNwQixLQUFLLFNBQVM7QUFBQSxVQUNaLFlBQVksS0FBSyxPQUFPO0FBQUEsVUFDeEIsV0FBVyxLQUFLLFdBQVc7QUFBQSxVQUMzQixjQUFjLEtBQUssT0FBTztBQUFBLFVBQzFCLGFBQWEsU0FBUyxNQUFNLFdBQVcsU0FBUyxTQUFTLEtBQUssT0FBTyxlQUFlLEtBQUssU0FBUyxTQUFTLFNBQVMsTUFBTSxRQUFRLFNBQVMsTUFBTSxHQUFHLFNBQVMsS0FBSyxPQUFPLGVBQWU7QUFBQSxRQUMxTDtBQUFBLFFBQ0EsSUFBSSxLQUFLLFFBQVEsUUFBUTtBQUFBLFVBQ3ZCLEtBQUssT0FBTyxRQUFRLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxLQUFLLFNBQVMsR0FBRztBQUFBLFFBQ3JEO0FBQUEsUUFDQSxLQUFLLFNBQVMsS0FBSyxPQUFPO0FBQUEsUUFDMUIsT0FBTztBQUFBLFNBQ04sT0FBTztBQUFBLE1BRVYsc0JBQXNCLE9BQU8sUUFBUSxHQUFHO0FBQUEsUUFDdEMsS0FBSyxRQUFRO0FBQUEsUUFDYixPQUFPO0FBQUEsU0FDTixNQUFNO0FBQUEsTUFFVCx3QkFBd0IsT0FBTyxRQUFRLEdBQUc7QUFBQSxRQUN4QyxJQUFJLEtBQUssUUFBUSxpQkFBaUI7QUFBQSxVQUNoQyxLQUFLLGFBQWE7QUFBQSxRQUNwQixFQUFPO0FBQUEsVUFDTCxPQUFPLEtBQUssV0FBVyw0QkFBNEIsS0FBSyxXQUFXLEtBQUs7QUFBQSxJQUFxSSxLQUFLLGFBQWEsR0FBRztBQUFBLFlBQ2hPLE1BQU07QUFBQSxZQUNOLE9BQU87QUFBQSxZQUNQLE1BQU0sS0FBSztBQUFBLFVBQ2IsQ0FBQztBQUFBO0FBQUEsUUFFSCxPQUFPO0FBQUEsU0FDTixRQUFRO0FBQUEsTUFFWCxzQkFBc0IsT0FBTyxRQUFRLENBQUMsR0FBRztBQUFBLFFBQ3ZDLEtBQUssTUFBTSxLQUFLLE1BQU0sTUFBTSxDQUFDLENBQUM7QUFBQSxTQUM3QixNQUFNO0FBQUEsTUFFVCwyQkFBMkIsT0FBTyxRQUFRLEdBQUc7QUFBQSxRQUMzQyxJQUFJLE9BQU8sS0FBSyxRQUFRLE9BQU8sR0FBRyxLQUFLLFFBQVEsU0FBUyxLQUFLLE1BQU0sTUFBTTtBQUFBLFFBQ3pFLFFBQVEsS0FBSyxTQUFTLEtBQUssUUFBUSxNQUFNLEtBQUssT0FBTyxHQUFHLEVBQUUsUUFBUSxPQUFPLEVBQUU7QUFBQSxTQUMxRSxXQUFXO0FBQUEsTUFFZCwrQkFBK0IsT0FBTyxRQUFRLEdBQUc7QUFBQSxRQUMvQyxJQUFJLE9BQU8sS0FBSztBQUFBLFFBQ2hCLElBQUksS0FBSyxTQUFTLElBQUk7QUFBQSxVQUNwQixRQUFRLEtBQUssT0FBTyxPQUFPLEdBQUcsS0FBSyxLQUFLLE1BQU07QUFBQSxRQUNoRDtBQUFBLFFBQ0EsUUFBUSxLQUFLLE9BQU8sR0FBRyxFQUFFLEtBQUssS0FBSyxTQUFTLEtBQUssUUFBUSxLQUFLLFFBQVEsT0FBTyxFQUFFO0FBQUEsU0FDOUUsZUFBZTtBQUFBLE1BRWxCLDhCQUE4QixPQUFPLFFBQVEsR0FBRztBQUFBLFFBQzlDLElBQUksTUFBTSxLQUFLLFVBQVU7QUFBQSxRQUN6QixJQUFJLElBQUksSUFBSSxNQUFNLElBQUksU0FBUyxDQUFDLEVBQUUsS0FBSyxHQUFHO0FBQUEsUUFDMUMsT0FBTyxNQUFNLEtBQUssY0FBYyxJQUFJO0FBQUEsSUFBTyxJQUFJO0FBQUEsU0FDOUMsY0FBYztBQUFBLE1BRWpCLDRCQUE0QixPQUFPLFFBQVEsQ0FBQyxPQUFPLGNBQWM7QUFBQSxRQUMvRCxJQUFJLE9BQU8sT0FBTztBQUFBLFFBQ2xCLElBQUksS0FBSyxRQUFRLGlCQUFpQjtBQUFBLFVBQ2hDLFNBQVM7QUFBQSxZQUNQLFVBQVUsS0FBSztBQUFBLFlBQ2YsUUFBUTtBQUFBLGNBQ04sWUFBWSxLQUFLLE9BQU87QUFBQSxjQUN4QixXQUFXLEtBQUs7QUFBQSxjQUNoQixjQUFjLEtBQUssT0FBTztBQUFBLGNBQzFCLGFBQWEsS0FBSyxPQUFPO0FBQUEsWUFDM0I7QUFBQSxZQUNBLFFBQVEsS0FBSztBQUFBLFlBQ2IsT0FBTyxLQUFLO0FBQUEsWUFDWixTQUFTLEtBQUs7QUFBQSxZQUNkLFNBQVMsS0FBSztBQUFBLFlBQ2QsUUFBUSxLQUFLO0FBQUEsWUFDYixRQUFRLEtBQUs7QUFBQSxZQUNiLE9BQU8sS0FBSztBQUFBLFlBQ1osUUFBUSxLQUFLO0FBQUEsWUFDYixJQUFJLEtBQUs7QUFBQSxZQUNULGdCQUFnQixLQUFLLGVBQWUsTUFBTSxDQUFDO0FBQUEsWUFDM0MsTUFBTSxLQUFLO0FBQUEsVUFDYjtBQUFBLFVBQ0EsSUFBSSxLQUFLLFFBQVEsUUFBUTtBQUFBLFlBQ3ZCLE9BQU8sT0FBTyxRQUFRLEtBQUssT0FBTyxNQUFNLE1BQU0sQ0FBQztBQUFBLFVBQ2pEO0FBQUEsUUFDRjtBQUFBLFFBQ0EsUUFBUSxNQUFNLEdBQUcsTUFBTSxpQkFBaUI7QUFBQSxRQUN4QyxJQUFJLE9BQU87QUFBQSxVQUNULEtBQUssWUFBWSxNQUFNO0FBQUEsUUFDekI7QUFBQSxRQUNBLEtBQUssU0FBUztBQUFBLFVBQ1osWUFBWSxLQUFLLE9BQU87QUFBQSxVQUN4QixXQUFXLEtBQUssV0FBVztBQUFBLFVBQzNCLGNBQWMsS0FBSyxPQUFPO0FBQUEsVUFDMUIsYUFBYSxRQUFRLE1BQU0sTUFBTSxTQUFTLEdBQUcsU0FBUyxNQUFNLE1BQU0sU0FBUyxHQUFHLE1BQU0sUUFBUSxFQUFFLEdBQUcsU0FBUyxLQUFLLE9BQU8sY0FBYyxNQUFNLEdBQUc7QUFBQSxRQUMvSTtBQUFBLFFBQ0EsS0FBSyxVQUFVLE1BQU07QUFBQSxRQUNyQixLQUFLLFNBQVMsTUFBTTtBQUFBLFFBQ3BCLEtBQUssVUFBVTtBQUFBLFFBQ2YsS0FBSyxTQUFTLEtBQUssT0FBTztBQUFBLFFBQzFCLElBQUksS0FBSyxRQUFRLFFBQVE7QUFBQSxVQUN2QixLQUFLLE9BQU8sUUFBUSxDQUFDLEtBQUssUUFBUSxLQUFLLFVBQVUsS0FBSyxNQUFNO0FBQUEsUUFDOUQ7QUFBQSxRQUNBLEtBQUssUUFBUTtBQUFBLFFBQ2IsS0FBSyxhQUFhO0FBQUEsUUFDbEIsS0FBSyxTQUFTLEtBQUssT0FBTyxNQUFNLE1BQU0sR0FBRyxNQUFNO0FBQUEsUUFDL0MsS0FBSyxXQUFXLE1BQU07QUFBQSxRQUN0QixRQUFRLEtBQUssY0FBYyxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sY0FBYyxLQUFLLGVBQWUsS0FBSyxlQUFlLFNBQVMsRUFBRTtBQUFBLFFBQ3RILElBQUksS0FBSyxRQUFRLEtBQUssUUFBUTtBQUFBLFVBQzVCLEtBQUssT0FBTztBQUFBLFFBQ2Q7QUFBQSxRQUNBLElBQUksT0FBTztBQUFBLFVBQ1QsT0FBTztBQUFBLFFBQ1QsRUFBTyxTQUFJLEtBQUssWUFBWTtBQUFBLFVBQzFCLFNBQVMsS0FBSyxRQUFRO0FBQUEsWUFDcEIsS0FBSyxLQUFLLE9BQU87QUFBQSxVQUNuQjtBQUFBLFVBQ0EsT0FBTztBQUFBLFFBQ1Q7QUFBQSxRQUNBLE9BQU87QUFBQSxTQUNOLFlBQVk7QUFBQSxNQUVmLHNCQUFzQixPQUFPLFFBQVEsR0FBRztBQUFBLFFBQ3RDLElBQUksS0FBSyxNQUFNO0FBQUEsVUFDYixPQUFPLEtBQUs7QUFBQSxRQUNkO0FBQUEsUUFDQSxJQUFJLENBQUMsS0FBSyxRQUFRO0FBQUEsVUFDaEIsS0FBSyxPQUFPO0FBQUEsUUFDZDtBQUFBLFFBQ0EsSUFBSSxPQUFPLE9BQU8sV0FBVztBQUFBLFFBQzdCLElBQUksQ0FBQyxLQUFLLE9BQU87QUFBQSxVQUNmLEtBQUssU0FBUztBQUFBLFVBQ2QsS0FBSyxRQUFRO0FBQUEsUUFDZjtBQUFBLFFBQ0EsSUFBSSxRQUFRLEtBQUssY0FBYztBQUFBLFFBQy9CLFNBQVMsSUFBSSxFQUFHLElBQUksTUFBTSxRQUFRLEtBQUs7QUFBQSxVQUNyQyxZQUFZLEtBQUssT0FBTyxNQUFNLEtBQUssTUFBTSxNQUFNLEdBQUc7QUFBQSxVQUNsRCxJQUFJLGNBQWMsQ0FBQyxTQUFTLFVBQVUsR0FBRyxTQUFTLE1BQU0sR0FBRyxTQUFTO0FBQUEsWUFDbEUsUUFBUTtBQUFBLFlBQ1IsUUFBUTtBQUFBLFlBQ1IsSUFBSSxLQUFLLFFBQVEsaUJBQWlCO0FBQUEsY0FDaEMsUUFBUSxLQUFLLFdBQVcsV0FBVyxNQUFNLEVBQUU7QUFBQSxjQUMzQyxJQUFJLFVBQVUsT0FBTztBQUFBLGdCQUNuQixPQUFPO0FBQUEsY0FDVCxFQUFPLFNBQUksS0FBSyxZQUFZO0FBQUEsZ0JBQzFCLFFBQVE7QUFBQSxnQkFDUjtBQUFBLGNBQ0YsRUFBTztBQUFBLGdCQUNMLE9BQU87QUFBQTtBQUFBLFlBRVgsRUFBTyxTQUFJLENBQUMsS0FBSyxRQUFRLE1BQU07QUFBQSxjQUM3QjtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLFFBQ0EsSUFBSSxPQUFPO0FBQUEsVUFDVCxRQUFRLEtBQUssV0FBVyxPQUFPLE1BQU0sTUFBTTtBQUFBLFVBQzNDLElBQUksVUFBVSxPQUFPO0FBQUEsWUFDbkIsT0FBTztBQUFBLFVBQ1Q7QUFBQSxVQUNBLE9BQU87QUFBQSxRQUNUO0FBQUEsUUFDQSxJQUFJLEtBQUssV0FBVyxJQUFJO0FBQUEsVUFDdEIsT0FBTyxLQUFLO0FBQUEsUUFDZCxFQUFPO0FBQUEsVUFDTCxPQUFPLEtBQUssV0FBVyw0QkFBNEIsS0FBSyxXQUFXLEtBQUs7QUFBQSxJQUEyQixLQUFLLGFBQWEsR0FBRztBQUFBLFlBQ3RILE1BQU07QUFBQSxZQUNOLE9BQU87QUFBQSxZQUNQLE1BQU0sS0FBSztBQUFBLFVBQ2IsQ0FBQztBQUFBO0FBQUEsU0FFRixNQUFNO0FBQUEsTUFFVCxxQkFBcUIsT0FBTyxTQUFTLEdBQUcsR0FBRztBQUFBLFFBQ3pDLElBQUksSUFBSSxLQUFLLEtBQUs7QUFBQSxRQUNsQixJQUFJLEdBQUc7QUFBQSxVQUNMLE9BQU87QUFBQSxRQUNULEVBQU87QUFBQSxVQUNMLE9BQU8sS0FBSyxJQUFJO0FBQUE7QUFBQSxTQUVqQixLQUFLO0FBQUEsTUFFUix1QkFBdUIsT0FBTyxTQUFTLEtBQUssQ0FBQyxXQUFXO0FBQUEsUUFDdEQsS0FBSyxlQUFlLEtBQUssU0FBUztBQUFBLFNBQ2pDLE9BQU87QUFBQSxNQUVWLDBCQUEwQixPQUFPLFNBQVMsUUFBUSxHQUFHO0FBQUEsUUFDbkQsSUFBSSxJQUFJLEtBQUssZUFBZSxTQUFTO0FBQUEsUUFDckMsSUFBSSxJQUFJLEdBQUc7QUFBQSxVQUNULE9BQU8sS0FBSyxlQUFlLElBQUk7QUFBQSxRQUNqQyxFQUFPO0FBQUEsVUFDTCxPQUFPLEtBQUssZUFBZTtBQUFBO0FBQUEsU0FFNUIsVUFBVTtBQUFBLE1BRWIsK0JBQStCLE9BQU8sU0FBUyxhQUFhLEdBQUc7QUFBQSxRQUM3RCxJQUFJLEtBQUssZUFBZSxVQUFVLEtBQUssZUFBZSxLQUFLLGVBQWUsU0FBUyxJQUFJO0FBQUEsVUFDckYsT0FBTyxLQUFLLFdBQVcsS0FBSyxlQUFlLEtBQUssZUFBZSxTQUFTLElBQUk7QUFBQSxRQUM5RSxFQUFPO0FBQUEsVUFDTCxPQUFPLEtBQUssV0FBVyxXQUFXO0FBQUE7QUFBQSxTQUVuQyxlQUFlO0FBQUEsTUFFbEIsMEJBQTBCLE9BQU8sU0FBUyxRQUFRLENBQUMsR0FBRztBQUFBLFFBQ3BELElBQUksS0FBSyxlQUFlLFNBQVMsSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDO0FBQUEsUUFDcEQsSUFBSSxLQUFLLEdBQUc7QUFBQSxVQUNWLE9BQU8sS0FBSyxlQUFlO0FBQUEsUUFDN0IsRUFBTztBQUFBLFVBQ0wsT0FBTztBQUFBO0FBQUEsU0FFUixVQUFVO0FBQUEsTUFFYiwyQkFBMkIsT0FBTyxTQUFTLFNBQVMsQ0FBQyxXQUFXO0FBQUEsUUFDOUQsS0FBSyxNQUFNLFNBQVM7QUFBQSxTQUNuQixXQUFXO0FBQUEsTUFFZCxnQ0FBZ0MsT0FBTyxTQUFTLGNBQWMsR0FBRztBQUFBLFFBQy9ELE9BQU8sS0FBSyxlQUFlO0FBQUEsU0FDMUIsZ0JBQWdCO0FBQUEsTUFDbkIsU0FBUyxFQUFFLG9CQUFvQixLQUFLO0FBQUEsTUFDcEMsK0JBQStCLE9BQU8sU0FBUyxTQUFTLENBQUMsSUFBSSxLQUFLLDJCQUEyQixVQUFVO0FBQUEsUUFDckcsSUFBSSxVQUFVO0FBQUEsUUFDZCxRQUFRO0FBQUEsZUFDRDtBQUFBLFlBQ0gsS0FBSyxVQUFVLFdBQVc7QUFBQSxZQUMxQixJQUFJLFNBQVM7QUFBQSxZQUNiLE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsS0FBSyxVQUFVLGNBQWM7QUFBQSxZQUM3QixPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILEtBQUssU0FBUztBQUFBLFlBQ2QsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxNQUFNLEtBQUs7QUFBQSxZQUNYLElBQUksU0FBUyxJQUFJLE9BQU8sUUFBUSxJQUFJLE9BQU87QUFBQSxZQUMzQyxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsS0FBSyxTQUFTO0FBQUEsWUFDZDtBQUFBLGVBQ0c7QUFBQSxZQUNILEdBQUcsVUFBVSxFQUFFLE1BQU0saUJBQWlCLElBQUksTUFBTTtBQUFBLFlBQ2hELE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxLQUFLLE1BQU0sT0FBTztBQUFBLFlBQ2xCO0FBQUEsZUFDRztBQUFBLFlBQ0gsS0FBSyxTQUFTO0FBQUEsWUFDZCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILEtBQUssU0FBUztBQUFBLFlBQ2Q7QUFBQSxlQUNHO0FBQUEsWUFDSCxHQUFHLFVBQVUsRUFBRSxNQUFNLFlBQVk7QUFBQSxZQUNqQyxLQUFLLE1BQU0sTUFBTTtBQUFBLFlBQ2pCO0FBQUEsZUFDRztBQUFBLFlBQ0gsR0FBRyxVQUFVLEVBQUUsTUFBTSxXQUFXO0FBQUEsWUFDaEMsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsR0FBRyxVQUFVLEVBQUUsTUFBTSxVQUFVO0FBQUEsWUFDL0IsS0FBSyxTQUFTO0FBQUEsWUFDZDtBQUFBLGVBQ0c7QUFBQSxZQUNILEdBQUcsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCO0FBQUEsWUFDckMsS0FBSyxNQUFNLE1BQU07QUFBQSxZQUNqQixPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILEdBQUcsVUFBVSxFQUFFLE1BQU0sT0FBTztBQUFBLFlBQzVCLEtBQUssTUFBTSxNQUFNO0FBQUEsWUFDakIsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxHQUFHLFVBQVUsRUFBRSxNQUFNLGdCQUFnQjtBQUFBLFlBQ3JDLEtBQUssTUFBTSxNQUFNO0FBQUEsWUFDakIsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxHQUFHLFVBQVUsRUFBRSxNQUFNLFlBQVk7QUFBQSxZQUNqQyxLQUFLLE1BQU0sTUFBTTtBQUFBLFlBQ2pCLE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsS0FBSyxNQUFNLE1BQU07QUFBQSxZQUNqQixPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILEtBQUssTUFBTSxNQUFNO0FBQUEsWUFDakIsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxLQUFLLE1BQU0sTUFBTTtBQUFBLFlBQ2pCLE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsS0FBSyxNQUFNLE1BQU07QUFBQSxZQUNqQixPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILEtBQUssTUFBTSxPQUFPO0FBQUEsWUFDbEI7QUFBQSxlQUNHO0FBQUEsWUFDSCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILEtBQUssU0FBUztBQUFBLFlBQ2Q7QUFBQSxlQUNHO0FBQUEsWUFDSCxHQUFHLFVBQVUsRUFBRSxNQUFNLGVBQWU7QUFBQSxZQUNwQyxLQUFLLE1BQU0sTUFBTTtBQUFBLFlBQ2pCO0FBQUEsZUFDRztBQUFBLFlBQ0gsR0FBRyxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsSUFBSSxNQUFNO0FBQUEsWUFDL0MsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxLQUFLLFNBQVM7QUFBQSxZQUNkO0FBQUEsZUFDRztBQUFBLFlBQ0gsS0FBSyxTQUFTO0FBQUEsWUFDZCxHQUFHLFVBQVUsRUFBRSxNQUFNLGFBQWE7QUFBQSxZQUNsQyxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILEtBQUssU0FBUztBQUFBLFlBQ2QsR0FBRyxVQUFVLEVBQUUsTUFBTSxZQUFZO0FBQUEsWUFDakMsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxLQUFLLFNBQVM7QUFBQSxZQUNkLEdBQUcsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLElBQUksTUFBTTtBQUFBLFlBQy9DLE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsS0FBSyxTQUFTO0FBQUEsWUFDZCxHQUFHLFVBQVUsRUFBRSxNQUFNLGFBQWE7QUFBQSxZQUNsQyxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILEtBQUssU0FBUztBQUFBLFlBQ2QsR0FBRyxVQUFVLEVBQUUsTUFBTSxhQUFhO0FBQUEsWUFDbEMsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxLQUFLLFNBQVM7QUFBQSxZQUNkLEdBQUcsVUFBVSxFQUFFLE1BQU0sYUFBYTtBQUFBLFlBQ2xDLE9BQU87QUFBQSxZQUNQO0FBQUEsZUFDRztBQUFBLFlBQ0gsS0FBSyxTQUFTO0FBQUEsWUFDZCxHQUFHLFVBQVUsRUFBRSxNQUFNLGFBQWE7QUFBQSxZQUNsQyxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILEtBQUssU0FBUztBQUFBLFlBQ2QsR0FBRyxVQUFVLEVBQUUsTUFBTSxhQUFhO0FBQUEsWUFDbEMsT0FBTztBQUFBLFlBQ1A7QUFBQSxlQUNHO0FBQUEsWUFDSCxHQUFHLFVBQVUsRUFBRSxNQUFNLHFCQUFxQixJQUFJLE1BQU07QUFBQSxZQUNwRCxPQUFPO0FBQUEsWUFDUDtBQUFBLGVBQ0c7QUFBQSxZQUNILEdBQUcsVUFBVSxFQUFFLE1BQU0scUJBQXFCLElBQUksTUFBTTtBQUFBLFlBQ3BELE9BQU87QUFBQSxZQUNQO0FBQUE7QUFBQSxTQUVILFdBQVc7QUFBQSxNQUNkLE9BQU8sQ0FBQyxhQUFhLGFBQWEsYUFBYSxnQkFBZ0IsaUJBQWlCLFlBQVksaUJBQWlCLGtCQUFrQixhQUFhLFlBQVksWUFBWSxrQkFBa0IsbUJBQW1CLGVBQWUsZ0JBQWdCLFlBQVksYUFBYSxhQUFhLGNBQWMsWUFBWSxjQUFjLGNBQWMsWUFBWSxZQUFZLGVBQWUsMkJBQTJCLFdBQVcsZ0JBQWdCLGdCQUFnQixnQkFBZ0IsYUFBYSxlQUFlLGFBQWEsZ0JBQWdCLGNBQWMsY0FBYyxjQUFjLGFBQWEsYUFBYSxjQUFjLFlBQVksc0JBQXNCLGtCQUFrQjtBQUFBLE1BQ2hvQixZQUFZLEVBQUUscUJBQXVCLEVBQUUsT0FBUyxDQUFDLEdBQUcsV0FBYSxNQUFNLEdBQUcsY0FBZ0IsRUFBRSxPQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsV0FBYSxNQUFNLEdBQUcsV0FBYSxFQUFFLE9BQVMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLFdBQWEsTUFBTSxHQUFHLE9BQVMsRUFBRSxPQUFTLENBQUMsR0FBRyxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcsTUFBUSxFQUFFLE9BQVMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxXQUFhLE1BQU0sR0FBRyxPQUFTLEVBQUUsT0FBUyxDQUFDLElBQUksRUFBRSxHQUFHLFdBQWEsTUFBTSxHQUFHLE1BQVEsRUFBRSxPQUFTLENBQUMsSUFBSSxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcsTUFBUSxFQUFFLE9BQVMsQ0FBQyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLFdBQWEsTUFBTSxHQUFHLFNBQVcsRUFBRSxPQUFTLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxXQUFhLEtBQUssRUFBRTtBQUFBLElBQ3RsQjtBQUFBLElBQ0EsT0FBTztBQUFBLElBQ047QUFBQSxFQUNILFFBQVEsUUFBUTtBQUFBLEVBQ2hCLFNBQVMsTUFBTSxHQUFHO0FBQUEsSUFDaEIsS0FBSyxLQUFLLENBQUM7QUFBQTtBQUFBLEVBRWIsT0FBTyxRQUFRLFFBQVE7QUFBQSxFQUN2QixPQUFPLFlBQVk7QUFBQSxFQUNuQixRQUFRLFNBQVM7QUFBQSxFQUNqQixPQUFPLElBQUk7QUFBQSxFQUNWO0FBQ0gsT0FBTyxTQUFTO0FBQ2hCLElBQUksaUJBQWlCO0FBR3JCLElBQUksUUFBUSxDQUFDO0FBQ2IsSUFBSSxXQUFXLENBQUM7QUFDaEIsSUFBSSxNQUFNO0FBQ1YsSUFBSSxXQUFXLENBQUM7QUFDaEIsSUFBSSx3QkFBd0IsT0FBTyxNQUFNO0FBQUEsRUFDdkMsUUFBUSxDQUFDO0FBQUEsRUFDVCxXQUFXLENBQUM7QUFBQSxFQUNaLE1BQU07QUFBQSxFQUNOLFdBQVcsQ0FBQztBQUFBLEdBQ1gsT0FBTztBQUNWLElBQUksNkJBQTZCLE9BQU8sQ0FBQyxVQUFVO0FBQUEsRUFDakQsSUFBSSxNQUFNLFdBQVcsR0FBRztBQUFBLElBQ3RCLE9BQU87QUFBQSxFQUNUO0FBQUEsRUFDQSxNQUFNLGVBQWUsTUFBTSxHQUFHO0FBQUEsRUFDOUIsSUFBSSxjQUFjO0FBQUEsRUFDbEIsU0FBUyxJQUFJLE1BQU0sU0FBUyxFQUFHLEtBQUssR0FBRyxLQUFLO0FBQUEsSUFDMUMsSUFBSSxNQUFNLEdBQUcsVUFBVSxnQkFBZ0IsQ0FBQyxhQUFhO0FBQUEsTUFDbkQsY0FBYyxNQUFNO0FBQUEsSUFDdEI7QUFBQSxJQUNBLElBQUksTUFBTSxHQUFHLFFBQVEsY0FBYztBQUFBLE1BQ2pDLE1BQU0sSUFBSSxNQUFNLHFEQUFxRCxNQUFNLEdBQUcsUUFBUSxJQUFJO0FBQUEsSUFDNUY7QUFBQSxFQUNGO0FBQUEsRUFDQSxJQUFJLFVBQVUsYUFBYSxPQUFPO0FBQUEsSUFDaEMsT0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLE9BQU87QUFBQSxHQUNOLFlBQVk7QUFDZixJQUFJLDhCQUE4QixPQUFPLFFBQVEsR0FBRztBQUFBLEVBQ2xELE9BQU87QUFBQSxHQUNOLGFBQWE7QUFDaEIsSUFBSSwwQkFBMEIsT0FBTyxRQUFRLEdBQUc7QUFBQSxFQUM5QyxNQUFNLFFBQVEsQ0FBQztBQUFBLEVBQ2YsTUFBTSxTQUFTLENBQUM7QUFBQSxFQUNoQixNQUFNLFlBQVksWUFBWTtBQUFBLEVBQzlCLE1BQU0sT0FBTyxXQUFVO0FBQUEsRUFDdkIsV0FBVyxXQUFXLFdBQVc7QUFBQSxJQUMvQixNQUFNLE9BQU87QUFBQSxNQUNYLElBQUksUUFBUTtBQUFBLE1BQ1osT0FBTyxhQUFhLFFBQVEsU0FBUyxJQUFJLElBQUk7QUFBQSxNQUM3QyxXQUFXO0FBQUEsTUFDWCxTQUFTO0FBQUEsTUFDVCxRQUFRLFFBQVE7QUFBQSxNQUNoQixPQUFPO0FBQUEsTUFDUCxPQUFPLFFBQVE7QUFBQSxNQUNmLE1BQU0sS0FBSztBQUFBLElBQ2I7QUFBQSxJQUNBLE9BQU8sS0FBSyxJQUFJO0FBQUEsSUFDaEIsTUFBTSxXQUFXLE1BQU0sT0FBTyxDQUFDLE1BQU0sRUFBRSxhQUFhLFFBQVEsRUFBRTtBQUFBLElBQzlELFdBQVcsUUFBUSxVQUFVO0FBQUEsTUFDM0IsTUFBTSxZQUFZO0FBQUEsUUFDaEIsSUFBSSxLQUFLO0FBQUEsUUFDVCxVQUFVLFFBQVE7QUFBQSxRQUNsQixPQUFPLGFBQWEsS0FBSyxTQUFTLElBQUksSUFBSTtBQUFBLFFBQzFDLFdBQVc7QUFBQSxRQUNYLFNBQVM7QUFBQSxRQUNULFFBQVEsTUFBTTtBQUFBLFFBQ2QsVUFBVSxNQUFNO0FBQUEsUUFDaEIsVUFBVSxNQUFNO0FBQUEsUUFDaEIsTUFBTSxNQUFNO0FBQUEsUUFDWixPQUFPO0FBQUEsUUFDUCxPQUFPLEtBQUs7QUFBQSxRQUNaLElBQUk7QUFBQSxRQUNKLElBQUk7QUFBQSxRQUNKLFdBQVcsQ0FBQyxrQkFBa0I7QUFBQSxNQUNoQztBQUFBLE1BQ0EsT0FBTyxLQUFLLFNBQVM7QUFBQSxJQUN2QjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU8sRUFBRSxPQUFPLFFBQVEsT0FBTyxPQUFPLENBQUMsR0FBRyxRQUFRLFdBQVUsRUFBRTtBQUFBLEdBQzdELFNBQVM7QUFDWixJQUFJLDBCQUEwQixPQUFPLENBQUMsT0FBTyxJQUFJLE9BQU8sTUFBTSxjQUFjO0FBQUEsRUFDMUUsTUFBTSxPQUFPLFdBQVU7QUFBQSxFQUN2QixJQUFJLFVBQVUsS0FBSyxTQUFTLFdBQVcsc0JBQXNCLFFBQVE7QUFBQSxFQUNyRSxRQUFRO0FBQUEsU0FDRCxTQUFTO0FBQUEsU0FDVCxTQUFTO0FBQUEsU0FDVCxTQUFTO0FBQUEsTUFDWixXQUFXO0FBQUE7QUFBQSxFQUVmLE1BQU0sT0FBTztBQUFBLElBQ1gsSUFBSSxhQUFhLElBQUksSUFBSSxLQUFLLFFBQVE7QUFBQSxJQUN0QztBQUFBLElBQ0EsT0FBTyxhQUFhLE9BQU8sSUFBSTtBQUFBLElBQy9CLE9BQU8sS0FBSyxTQUFTLGdCQUFnQixzQkFBc0IsUUFBUTtBQUFBLElBQ25FO0FBQUEsSUFDQSxTQUFTO0FBQUEsRUFDWDtBQUFBLEVBQ0EsSUFBSSxjQUFtQixXQUFHO0FBQUEsSUFDeEIsSUFBSTtBQUFBLElBQ0osSUFBSSxDQUFDLFVBQVUsU0FBUztBQUFBLENBQUksR0FBRztBQUFBLE1BQzdCLFdBQVc7QUFBQSxJQUFRLFlBQVk7QUFBQTtBQUFBLElBQ2pDLEVBQU87QUFBQSxNQUNMLFdBQVcsWUFBWTtBQUFBO0FBQUE7QUFBQSxJQUV6QixNQUFNLE1BQU0sS0FBSyxVQUFVLEVBQUUsUUFBUSxZQUFZLENBQUM7QUFBQSxJQUNsRCxJQUFJLElBQUksVUFBVSxJQUFJLFVBQVUsSUFBSSxNQUFNLFlBQVksS0FBSyxJQUFJLE1BQU0sU0FBUyxHQUFHLElBQUk7QUFBQSxNQUNuRixNQUFNLElBQUksTUFBTSxrQkFBa0IsSUFBSSx5Q0FBeUM7QUFBQSxJQUNqRjtBQUFBLElBQ0EsSUFBSSxLQUFLLFNBQVMsSUFBSSxVQUFVLGNBQWM7QUFBQSxNQUM1QyxLQUFLLFFBQVEsS0FBSztBQUFBLElBQ3BCO0FBQUEsSUFDQSxJQUFJLEtBQUssT0FBTztBQUFBLE1BQ2QsS0FBSyxRQUFRLEtBQUs7QUFBQSxJQUNwQjtBQUFBLElBQ0EsSUFBSSxLQUFLLE1BQU07QUFBQSxNQUNiLEtBQUssT0FBTyxLQUFLLEtBQUssU0FBUztBQUFBLElBQ2pDO0FBQUEsSUFDQSxJQUFJLEtBQUssVUFBVTtBQUFBLE1BQ2pCLEtBQUssV0FBVyxLQUFLLFNBQVMsU0FBUztBQUFBLElBQ3pDO0FBQUEsSUFDQSxJQUFJLEtBQUssUUFBUTtBQUFBLE1BQ2YsS0FBSyxTQUFTLEtBQUssT0FBTyxTQUFTO0FBQUEsSUFDckM7QUFBQSxJQUNBLElBQUksS0FBSyxVQUFVO0FBQUEsTUFDakIsS0FBSyxXQUFXLEtBQUs7QUFBQSxJQUN2QjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU0sVUFBVSxXQUFXLEtBQUs7QUFBQSxFQUNoQyxJQUFJLFNBQVM7QUFBQSxJQUNYLEtBQUssV0FBVyxRQUFRLE1BQU0sUUFBUTtBQUFBLEVBQ3hDLEVBQU87QUFBQSxJQUNMLFNBQVMsS0FBSyxJQUFJO0FBQUE7QUFBQSxFQUVwQixNQUFNLEtBQUssSUFBSTtBQUFBLEdBQ2QsU0FBUztBQUNaLElBQUksV0FBVztBQUFBLEVBQ2IsU0FBUztBQUFBLEVBQ1QsV0FBVztBQUFBLEVBQ1gsY0FBYztBQUFBLEVBQ2QsTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLEVBQ1IsT0FBTztBQUFBLEVBQ1AsTUFBTTtBQUFBLEVBQ04sU0FBUztBQUNYO0FBQ0EsSUFBSSwwQkFBMEIsT0FBTyxDQUFDLFVBQVUsV0FBVztBQUFBLEVBQ3pELElBQUksTUFBTSxlQUFlLFVBQVUsTUFBTTtBQUFBLEVBQ3pDLFFBQVE7QUFBQSxTQUNEO0FBQUEsTUFDSCxPQUFPLFNBQVM7QUFBQSxTQUNiO0FBQUEsTUFDSCxPQUFPLFdBQVcsTUFBTSxTQUFTLGVBQWUsU0FBUztBQUFBLFNBQ3REO0FBQUEsTUFDSCxPQUFPLFNBQVM7QUFBQSxTQUNiO0FBQUEsTUFDSCxPQUFPLFNBQVM7QUFBQSxTQUNiO0FBQUEsTUFDSCxPQUFPLFNBQVM7QUFBQSxTQUNiO0FBQUEsTUFDSCxPQUFPLFNBQVM7QUFBQTtBQUFBLE1BRWhCLE9BQU8sU0FBUztBQUFBO0FBQUEsR0FFbkIsU0FBUztBQUNaLElBQUksa0NBQWtDLE9BQU8sQ0FBQyxJQUFJLFlBQVk7QUFBQSxFQUM1RCxTQUFTLE1BQU07QUFBQSxHQUNkLGlCQUFpQjtBQUNwQixJQUFJLCtCQUErQixPQUFPLENBQUMsZUFBZTtBQUFBLEVBQ3hELElBQUksQ0FBQyxZQUFZO0FBQUEsSUFDZjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU0sU0FBUyxXQUFVO0FBQUEsRUFDekIsTUFBTSxPQUFPLE1BQU0sTUFBTSxTQUFTO0FBQUEsRUFDbEMsSUFBSSxXQUFXLE1BQU07QUFBQSxJQUNuQixLQUFLLE9BQU8sYUFBYSxXQUFXLE1BQU0sTUFBTTtBQUFBLEVBQ2xEO0FBQUEsRUFDQSxJQUFJLFdBQVcsT0FBTztBQUFBLElBQ3BCLEtBQUssYUFBYSxhQUFhLFdBQVcsT0FBTyxNQUFNO0FBQUEsRUFDekQ7QUFBQSxHQUNDLGNBQWM7QUFDakIsSUFBSSwyQkFBMkIsT0FBTyxDQUFDLFNBQVM7QUFBQSxFQUM5QyxRQUFRO0FBQUEsU0FDRCxTQUFTO0FBQUEsTUFDWixPQUFPO0FBQUEsU0FDSixTQUFTO0FBQUEsTUFDWixPQUFPO0FBQUEsU0FDSixTQUFTO0FBQUEsTUFDWixPQUFPO0FBQUEsU0FDSixTQUFTO0FBQUEsTUFDWixPQUFPO0FBQUEsU0FDSixTQUFTO0FBQUEsTUFDWixPQUFPO0FBQUEsU0FDSixTQUFTO0FBQUEsTUFDWixPQUFPO0FBQUEsU0FDSixTQUFTO0FBQUEsTUFDWixPQUFPO0FBQUE7QUFBQSxNQUdQLE9BQU87QUFBQTtBQUFBLEdBRVYsVUFBVTtBQUNiLElBQUksNEJBQTRCLE9BQU8sTUFBTSxLQUFLLFdBQVc7QUFDN0QsSUFBSSxpQ0FBaUMsT0FBTyxDQUFDLE9BQU8sU0FBUyxLQUFLLGdCQUFnQjtBQUNsRixJQUFJLEtBQUs7QUFBQSxFQUNQO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGO0FBQ0EsSUFBSSxtQkFBbUI7QUFHdkIsSUFBSSx1QkFBdUIsT0FBTyxPQUFPLE1BQU0sSUFBSSxVQUFVLFlBQVk7QUFBQSxFQUN2RSxJQUFJLE1BQU07QUFBQSxJQUErQixJQUFJO0FBQUEsRUFDN0MsTUFBTSxNQUFNLFFBQVE7QUFBQSxFQUNwQixNQUFNLGNBQWMsSUFBSSxRQUFRO0FBQUEsRUFDaEMsTUFBTSxPQUFPLFdBQVU7QUFBQSxFQUN2QixLQUFLLGFBQWE7QUFBQSxFQUNsQixNQUFNLE1BQU0saUJBQWlCLEVBQUU7QUFBQSxFQUMvQixXQUFXLFFBQVEsWUFBWSxPQUFPO0FBQUEsSUFDcEMsS0FBSyxRQUFRLEdBQUcsTUFBTSxLQUFLO0FBQUEsRUFDN0I7QUFBQSxFQUNBLE1BQU0sZUFBZSxJQUFJLE9BQU8sR0FBRztBQUFBLEVBQ25DLGFBQWEsS0FBSyxTQUFTLFVBQVU7QUFBQSxFQUNyQyxNQUFNLFlBQVksSUFBSSxPQUFPLEdBQUc7QUFBQSxFQUNoQyxVQUFVLEtBQUssU0FBUyxPQUFPO0FBQUEsRUFDL0IsTUFBTSxZQUFZLFlBQVksTUFBTSxPQUVsQyxDQUFDLFNBQVMsS0FBSyxPQUNqQjtBQUFBLEVBQ0EsSUFBSSxPQUFPO0FBQUEsRUFDWCxNQUFNLFVBQVU7QUFBQSxFQUNoQixNQUFNLGlCQUFpQixDQUFDO0FBQUEsRUFDeEIsSUFBSSxpQkFBaUI7QUFBQSxFQUNyQixXQUFXLFdBQVcsV0FBVztBQUFBLElBQy9CLE1BQU0sUUFBUSxNQUFNLFFBQVEsZ0JBQWdCO0FBQUEsSUFDNUMsT0FBTyxPQUFPO0FBQUEsSUFDZCxRQUFRLElBQUksUUFBUSxRQUFRLE9BQU8sS0FBSyxVQUFVO0FBQUEsSUFDbEQsUUFBUSxRQUFRO0FBQUEsSUFDaEIsUUFBUSxJQUFJO0FBQUEsSUFDWixRQUFRLFNBQVMsUUFBUTtBQUFBLElBQ3pCLFFBQVEsS0FBSztBQUFBLElBQ2IsUUFBUSxLQUFLO0FBQUEsSUFDYixRQUFRLGFBQWEsUUFBUSxhQUFhLGNBQWM7QUFBQSxJQUN4RCxNQUFNLGFBQWEsTUFBTSxjQUFjLGNBQWMsT0FBTztBQUFBLElBQzVELGlCQUFpQixLQUFLLElBQUksZ0JBQWdCLFlBQVksV0FBVyxNQUFNO0FBQUEsSUFDdkUsZUFBZSxLQUFLLFVBQVU7QUFBQSxFQUNoQztBQUFBLEVBQ0EsSUFBSSxJQUFJO0FBQUEsRUFDUixXQUFXLFdBQVcsV0FBVztBQUFBLElBQy9CLE1BQU0sYUFBYSxlQUFlO0FBQUEsSUFDbEMsSUFBSSxJQUFJO0FBQUEsSUFDUixNQUFNLFFBQVEsTUFBTSxRQUFRLGdCQUFnQjtBQUFBLElBQzVDLE1BQU0sTUFBTSxDQUFDLFFBQVEsSUFBSSxJQUFJO0FBQUEsSUFDN0IsSUFBSSxJQUFJO0FBQUEsSUFDUixNQUFNLGVBQWUsWUFBWSxNQUFNLE9BQU8sQ0FBQyxTQUFTLEtBQUssYUFBYSxRQUFRLEVBQUU7QUFBQSxJQUNwRixXQUFXLFFBQVEsY0FBYztBQUFBLE1BQy9CLElBQUksS0FBSyxTQUFTO0FBQUEsUUFDaEIsTUFBTSxJQUFJLE1BQU0seURBQXlEO0FBQUEsTUFDM0U7QUFBQSxNQUNBLEtBQUssSUFBSSxRQUFRO0FBQUEsTUFDakIsS0FBSyxRQUFRLFFBQVEsTUFBTTtBQUFBLE1BQzNCLE1BQU0sU0FBUyxNQUFNLFdBQVcsV0FBVyxNQUFNLEVBQUUsUUFBUSxLQUFLLENBQUM7QUFBQSxNQUNqRSxNQUFNLE9BQU8sT0FBTyxLQUFLLEVBQUUsUUFBUTtBQUFBLE1BQ25DLEtBQUssSUFBSSxJQUFJLEtBQUssU0FBUztBQUFBLE1BQzNCLE1BQU0sYUFBYSxJQUFJO0FBQUEsTUFDdkIsSUFBSSxLQUFLLElBQUksS0FBSyxTQUFTLElBQUksVUFBVTtBQUFBLElBQzNDO0FBQUEsSUFDQSxNQUFNLE9BQU8sV0FBVyxRQUFRLE9BQU8sTUFBTTtBQUFBLElBQzdDLE1BQU0sU0FBUyxLQUFLLElBQUksSUFBSSxNQUFNLElBQUksU0FBUyxFQUFFLEtBQUssaUJBQWlCO0FBQUEsSUFDdkUsS0FBSyxLQUFLLFVBQVUsTUFBTTtBQUFBLEVBQzVCO0FBQUEsRUFDQSxrQkFDTyxXQUNMLEtBQ0EsS0FBSyxTQUFTLFdBQVcsc0JBQXNCLE9BQU8sU0FDdEQsS0FBSyxTQUFTLGVBQWUsc0JBQXNCLE9BQU8sV0FDNUQ7QUFBQSxHQUNDLE1BQU07QUFDVCxJQUFJLHlCQUF5QjtBQUFBLEVBQzNCO0FBQ0Y7QUFJQSxJQUFJLDhCQUE4QixPQUFPLENBQUMsWUFBWTtBQUFBLEVBQ3BELElBQUksWUFBWTtBQUFBLEVBQ2hCLFNBQVMsSUFBSSxFQUFHLElBQUksUUFBUSxtQkFBbUIsS0FBSztBQUFBLElBQ2xELFFBQVEsY0FBYyxLQUFLLFFBQVEsY0FBYyxNQUFNLFFBQVEsY0FBYztBQUFBLElBQzdFLElBQUksZ0JBQU8sUUFBUSxjQUFjLEVBQUUsR0FBRztBQUFBLE1BQ3BDLFFBQVEsY0FBYyxLQUFLLGdCQUFRLFFBQVEsY0FBYyxJQUFJLEVBQUU7QUFBQSxJQUNqRSxFQUFPO0FBQUEsTUFDTCxRQUFRLGNBQWMsS0FBSyxlQUFPLFFBQVEsY0FBYyxJQUFJLEVBQUU7QUFBQTtBQUFBLEVBRWxFO0FBQUEsRUFDQSxNQUFNLDJCQUEyQixPQUFPLENBQUMsT0FBTyxVQUFVLFFBQVEsV0FBVyxlQUFPLE9BQU8sS0FBSyxJQUFJLGdCQUFRLE9BQU8sS0FBSyxHQUFHLFVBQVU7QUFBQSxFQUNySSxTQUFTLElBQUksRUFBRyxJQUFJLFFBQVEsbUJBQW1CLEtBQUs7QUFBQSxJQUNsRCxNQUFNLEtBQUssTUFBTSxLQUFLLElBQUk7QUFBQSxJQUMxQixhQUFhO0FBQUEsZUFDRixJQUFJLG9CQUFvQixJQUFJLG9CQUFvQixJQUFJLHNCQUFzQixJQUFJLHVCQUF1QixJQUFJO0FBQUEsY0FDMUcsU0FBUyxRQUFRLFdBQVcsSUFBSSxFQUFFO0FBQUEsZ0JBQ2hDLFNBQVMsUUFBUSxXQUFXLElBQUksRUFBRTtBQUFBO0FBQUE7QUFBQSxlQUduQyxJQUFJO0FBQUEsYUFDTixRQUFRLGdCQUFnQjtBQUFBO0FBQUEsaUJBRXBCLElBQUk7QUFBQTtBQUFBLGVBRU4sUUFBUSxnQkFBZ0I7QUFBQTtBQUFBLG9CQUVuQixJQUFJO0FBQUEsZ0JBQ1IsUUFBUSxXQUFXO0FBQUE7QUFBQSxrQkFFakIsSUFBSTtBQUFBLHNCQUNBO0FBQUE7QUFBQSxlQUVQLElBQUk7QUFBQSxnQkFDSCxRQUFRLGNBQWM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQWdCMUIsUUFBUTtBQUFBLGNBQ04sUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsWUFLVixRQUFRO0FBQUEsY0FDTixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFJcEI7QUFBQSxFQUNBLE9BQU87QUFBQSxHQUNOLGFBQWE7QUFDaEIsSUFBSSw0QkFBNEIsT0FBTyxDQUFDLFlBQVk7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUloRCxZQUFZLE9BQU87QUFBQTtBQUFBLFlBRVgsUUFBUTtBQUFBO0FBQUE7QUFBQSxZQUdSLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsYUFZUCxRQUFRO0FBQUEsWUFDVCxRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BU2QsY0FBYztBQUFBLEdBQ2pCLFdBQVc7QUFDZCxJQUFJLGlCQUFpQjtBQUdyQixJQUFJLFVBQVU7QUFBQSxFQUNaLElBQUk7QUFBQSxFQUNKLFVBQVU7QUFBQSxFQUNWLFFBQVE7QUFBQSxFQUNSLFFBQVE7QUFDVjsiLAogICJkZWJ1Z0lkIjogIjg0OTJFM0Y3MjczQzg4OUU2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
