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
import"./chunk-main-vvfzntzy.js";
import"./chunk-main-ck580f0k.js";
import {
  darken_default,
  defaultConfig_default,
  getConfig,
  getConfig2,
  getUserDefinedConfig,
  is_dark_default,
  lighten_default,
  sanitizeText
} from "./chunk-main-aws590jt.js";
import {
  __name,
  log
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-g8wf8be2.js";
// node_modules/uuid/dist/rng.js
var rnds8 = new Uint8Array(16);
function rng() {
  return crypto.getRandomValues(rnds8);
}

// node_modules/uuid/dist/stringify.js
var byteToHex = [];
for (let i = 0;i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// node_modules/uuid/dist/v4.js
function v4(options, buf, offset) {
  if (!buf && !options && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return _v4(options, buf, offset);
}
function _v4(options, buf, offset) {
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i = 0;i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;
// node_modules/mermaid/dist/chunks/mermaid.core/mindmap-definition-RKZ34NQL.mjs
var parser = function() {
  var o = /* @__PURE__ */ __name(function(k, v, o2, l) {
    for (o2 = o2 || {}, l = k.length;l--; o2[k[l]] = v)
      ;
    return o2;
  }, "o"), $V0 = [1, 4], $V1 = [1, 13], $V2 = [1, 12], $V3 = [1, 15], $V4 = [1, 16], $V5 = [1, 20], $V6 = [1, 19], $V7 = [6, 7, 8], $V8 = [1, 26], $V9 = [1, 24], $Va = [1, 25], $Vb = [6, 7, 11], $Vc = [1, 6, 13, 15, 16, 19, 22], $Vd = [1, 33], $Ve = [1, 34], $Vf = [1, 6, 7, 11, 13, 15, 16, 19, 22];
  var parser2 = {
    trace: /* @__PURE__ */ __name(function trace() {}, "trace"),
    yy: {},
    symbols_: { error: 2, start: 3, mindMap: 4, spaceLines: 5, SPACELINE: 6, NL: 7, MINDMAP: 8, document: 9, stop: 10, EOF: 11, statement: 12, SPACELIST: 13, node: 14, ICON: 15, CLASS: 16, nodeWithId: 17, nodeWithoutId: 18, NODE_DSTART: 19, NODE_DESCR: 20, NODE_DEND: 21, NODE_ID: 22, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 6: "SPACELINE", 7: "NL", 8: "MINDMAP", 11: "EOF", 13: "SPACELIST", 15: "ICON", 16: "CLASS", 19: "NODE_DSTART", 20: "NODE_DESCR", 21: "NODE_DEND", 22: "NODE_ID" },
    productions_: [0, [3, 1], [3, 2], [5, 1], [5, 2], [5, 2], [4, 2], [4, 3], [10, 1], [10, 1], [10, 1], [10, 2], [10, 2], [9, 3], [9, 2], [12, 2], [12, 2], [12, 2], [12, 1], [12, 1], [12, 1], [12, 1], [12, 1], [14, 1], [14, 1], [18, 3], [17, 1], [17, 4]],
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
          yy.getLogger().info("Node: ", $$[$0].id);
          yy.addNode($$[$0 - 1].length, $$[$0].id, $$[$0].descr, $$[$0].type);
          break;
        case 16:
          yy.getLogger().trace("Icon: ", $$[$0]);
          yy.decorateNode({ icon: $$[$0] });
          break;
        case 17:
        case 21:
          yy.decorateNode({ class: $$[$0] });
          break;
        case 18:
          yy.getLogger().trace("SPACELIST");
          break;
        case 19:
          yy.getLogger().trace("Node: ", $$[$0].id);
          yy.addNode(0, $$[$0].id, $$[$0].descr, $$[$0].type);
          break;
        case 20:
          yy.decorateNode({ icon: $$[$0] });
          break;
        case 25:
          yy.getLogger().trace("node found ..", $$[$0 - 2]);
          this.$ = { id: $$[$0 - 1], descr: $$[$0 - 1], type: yy.getType($$[$0 - 2], $$[$0]) };
          break;
        case 26:
          this.$ = { id: $$[$0], descr: $$[$0], type: yy.nodeType.DEFAULT };
          break;
        case 27:
          yy.getLogger().trace("node found ..", $$[$0 - 3]);
          this.$ = { id: $$[$0 - 3], descr: $$[$0 - 1], type: yy.getType($$[$0 - 2], $$[$0]) };
          break;
      }
    }, "anonymous"),
    table: [{ 3: 1, 4: 2, 5: 3, 6: [1, 5], 8: $V0 }, { 1: [3] }, { 1: [2, 1] }, { 4: 6, 6: [1, 7], 7: [1, 8], 8: $V0 }, { 6: $V1, 7: [1, 10], 9: 9, 12: 11, 13: $V2, 14: 14, 15: $V3, 16: $V4, 17: 17, 18: 18, 19: $V5, 22: $V6 }, o($V7, [2, 3]), { 1: [2, 2] }, o($V7, [2, 4]), o($V7, [2, 5]), { 1: [2, 6], 6: $V1, 12: 21, 13: $V2, 14: 14, 15: $V3, 16: $V4, 17: 17, 18: 18, 19: $V5, 22: $V6 }, { 6: $V1, 9: 22, 12: 11, 13: $V2, 14: 14, 15: $V3, 16: $V4, 17: 17, 18: 18, 19: $V5, 22: $V6 }, { 6: $V8, 7: $V9, 10: 23, 11: $Va }, o($Vb, [2, 22], { 17: 17, 18: 18, 14: 27, 15: [1, 28], 16: [1, 29], 19: $V5, 22: $V6 }), o($Vb, [2, 18]), o($Vb, [2, 19]), o($Vb, [2, 20]), o($Vb, [2, 21]), o($Vb, [2, 23]), o($Vb, [2, 24]), o($Vb, [2, 26], { 19: [1, 30] }), { 20: [1, 31] }, { 6: $V8, 7: $V9, 10: 32, 11: $Va }, { 1: [2, 7], 6: $V1, 12: 21, 13: $V2, 14: 14, 15: $V3, 16: $V4, 17: 17, 18: 18, 19: $V5, 22: $V6 }, o($Vc, [2, 14], { 7: $Vd, 11: $Ve }), o($Vf, [2, 8]), o($Vf, [2, 9]), o($Vf, [2, 10]), o($Vb, [2, 15]), o($Vb, [2, 16]), o($Vb, [2, 17]), { 20: [1, 35] }, { 21: [1, 36] }, o($Vc, [2, 13], { 7: $Vd, 11: $Ve }), o($Vf, [2, 11]), o($Vf, [2, 12]), { 21: [1, 37] }, o($Vb, [2, 25]), o($Vb, [2, 27])],
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
            yy.getLogger().trace("Found comment", yy_.yytext);
            return 6;
            break;
          case 1:
            return 8;
            break;
          case 2:
            this.begin("CLASS");
            break;
          case 3:
            this.popState();
            return 16;
            break;
          case 4:
            this.popState();
            break;
          case 5:
            yy.getLogger().trace("Begin icon");
            this.begin("ICON");
            break;
          case 6:
            yy.getLogger().trace("SPACELINE");
            return 6;
            break;
          case 7:
            return 7;
            break;
          case 8:
            return 15;
            break;
          case 9:
            yy.getLogger().trace("end icon");
            this.popState();
            break;
          case 10:
            yy.getLogger().trace("Exploding node");
            this.begin("NODE");
            return 19;
            break;
          case 11:
            yy.getLogger().trace("Cloud");
            this.begin("NODE");
            return 19;
            break;
          case 12:
            yy.getLogger().trace("Explosion Bang");
            this.begin("NODE");
            return 19;
            break;
          case 13:
            yy.getLogger().trace("Cloud Bang");
            this.begin("NODE");
            return 19;
            break;
          case 14:
            this.begin("NODE");
            return 19;
            break;
          case 15:
            this.begin("NODE");
            return 19;
            break;
          case 16:
            this.begin("NODE");
            return 19;
            break;
          case 17:
            this.begin("NODE");
            return 19;
            break;
          case 18:
            return 13;
            break;
          case 19:
            return 22;
            break;
          case 20:
            return 11;
            break;
          case 21:
            this.begin("NSTR2");
            break;
          case 22:
            return "NODE_DESCR";
            break;
          case 23:
            this.popState();
            break;
          case 24:
            yy.getLogger().trace("Starting NSTR");
            this.begin("NSTR");
            break;
          case 25:
            yy.getLogger().trace("description:", yy_.yytext);
            return "NODE_DESCR";
            break;
          case 26:
            this.popState();
            break;
          case 27:
            this.popState();
            yy.getLogger().trace("node end ))");
            return "NODE_DEND";
            break;
          case 28:
            this.popState();
            yy.getLogger().trace("node end )");
            return "NODE_DEND";
            break;
          case 29:
            this.popState();
            yy.getLogger().trace("node end ...", yy_.yytext);
            return "NODE_DEND";
            break;
          case 30:
            this.popState();
            yy.getLogger().trace("node end ((");
            return "NODE_DEND";
            break;
          case 31:
            this.popState();
            yy.getLogger().trace("node end (-");
            return "NODE_DEND";
            break;
          case 32:
            this.popState();
            yy.getLogger().trace("node end (-");
            return "NODE_DEND";
            break;
          case 33:
            this.popState();
            yy.getLogger().trace("node end ((");
            return "NODE_DEND";
            break;
          case 34:
            this.popState();
            yy.getLogger().trace("node end ((");
            return "NODE_DEND";
            break;
          case 35:
            yy.getLogger().trace("Long description:", yy_.yytext);
            return 20;
            break;
          case 36:
            yy.getLogger().trace("Long description:", yy_.yytext);
            return 20;
            break;
        }
      }, "anonymous"),
      rules: [/^(?:\s*%%.*)/i, /^(?:mindmap\b)/i, /^(?::::)/i, /^(?:.+)/i, /^(?:\n)/i, /^(?:::icon\()/i, /^(?:[\s]+[\n])/i, /^(?:[\n]+)/i, /^(?:[^\)]+)/i, /^(?:\))/i, /^(?:-\))/i, /^(?:\(-)/i, /^(?:\)\))/i, /^(?:\))/i, /^(?:\(\()/i, /^(?:\{\{)/i, /^(?:\()/i, /^(?:\[)/i, /^(?:[\s]+)/i, /^(?:[^\(\[\n\)\{\}]+)/i, /^(?:$)/i, /^(?:["][`])/i, /^(?:[^`"]+)/i, /^(?:[`]["])/i, /^(?:["])/i, /^(?:[^"]+)/i, /^(?:["])/i, /^(?:[\)]\))/i, /^(?:[\)])/i, /^(?:[\]])/i, /^(?:\}\})/i, /^(?:\(-)/i, /^(?:-\))/i, /^(?:\(\()/i, /^(?:\()/i, /^(?:[^\)\]\(\}]+)/i, /^(?:.+(?!\(\())/i],
      conditions: { CLASS: { rules: [3, 4], inclusive: false }, ICON: { rules: [8, 9], inclusive: false }, NSTR2: { rules: [22, 23], inclusive: false }, NSTR: { rules: [25, 26], inclusive: false }, NODE: { rules: [21, 24, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36], inclusive: false }, INITIAL: { rules: [0, 1, 2, 5, 6, 7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], inclusive: true } }
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
var mindmap_default = parser;
var MAX_SECTIONS = 12;
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
var MindmapDB = class {
  constructor() {
    this.nodes = [];
    this.count = 0;
    this.elements = {};
    this.getLogger = this.getLogger.bind(this);
    this.nodeType = nodeType;
    this.clear();
    this.getType = this.getType.bind(this);
    this.getElementById = this.getElementById.bind(this);
    this.getParent = this.getParent.bind(this);
    this.getMindmap = this.getMindmap.bind(this);
    this.addNode = this.addNode.bind(this);
    this.decorateNode = this.decorateNode.bind(this);
  }
  static {
    __name(this, "MindmapDB");
  }
  clear() {
    this.nodes = [];
    this.count = 0;
    this.elements = {};
    this.baseLevel = undefined;
  }
  getParent(level) {
    for (let i = this.nodes.length - 1;i >= 0; i--) {
      if (this.nodes[i].level < level) {
        return this.nodes[i];
      }
    }
    return null;
  }
  getMindmap() {
    return this.nodes.length > 0 ? this.nodes[0] : null;
  }
  addNode(level, id, descr, type) {
    log.info("addNode", level, id, descr, type);
    let isRoot = false;
    if (this.nodes.length === 0) {
      this.baseLevel = level;
      level = 0;
      isRoot = true;
    } else if (this.baseLevel !== undefined) {
      level = level - this.baseLevel;
      isRoot = false;
    }
    const conf = getConfig2();
    let padding = conf.mindmap?.padding ?? defaultConfig_default.mindmap.padding;
    switch (type) {
      case this.nodeType.ROUNDED_RECT:
      case this.nodeType.RECT:
      case this.nodeType.HEXAGON:
        padding *= 2;
        break;
    }
    const node = {
      id: this.count++,
      nodeId: sanitizeText(id, conf),
      level,
      descr: sanitizeText(descr, conf),
      type,
      children: [],
      width: conf.mindmap?.maxNodeWidth ?? defaultConfig_default.mindmap.maxNodeWidth,
      padding,
      isRoot
    };
    const parent = this.getParent(level);
    if (parent) {
      parent.children.push(node);
      this.nodes.push(node);
    } else {
      if (isRoot) {
        this.nodes.push(node);
      } else {
        throw new Error(`There can be only one root. No parent could be found for ("${node.descr}")`);
      }
    }
  }
  getType(startStr, endStr) {
    log.debug("In get type", startStr, endStr);
    switch (startStr) {
      case "[":
        return this.nodeType.RECT;
      case "(":
        return endStr === ")" ? this.nodeType.ROUNDED_RECT : this.nodeType.CLOUD;
      case "((":
        return this.nodeType.CIRCLE;
      case ")":
        return this.nodeType.CLOUD;
      case "))":
        return this.nodeType.BANG;
      case "{{":
        return this.nodeType.HEXAGON;
      default:
        return this.nodeType.DEFAULT;
    }
  }
  setElementForId(id, element) {
    this.elements[id] = element;
  }
  getElementById(id) {
    return this.elements[id];
  }
  decorateNode(decoration) {
    if (!decoration) {
      return;
    }
    const config = getConfig2();
    const node = this.nodes[this.nodes.length - 1];
    if (decoration.icon) {
      node.icon = sanitizeText(decoration.icon, config);
    }
    if (decoration.class) {
      node.class = sanitizeText(decoration.class, config);
    }
  }
  type2Str(type) {
    switch (type) {
      case this.nodeType.DEFAULT:
        return "no-border";
      case this.nodeType.RECT:
        return "rect";
      case this.nodeType.ROUNDED_RECT:
        return "rounded-rect";
      case this.nodeType.CIRCLE:
        return "circle";
      case this.nodeType.CLOUD:
        return "cloud";
      case this.nodeType.BANG:
        return "bang";
      case this.nodeType.HEXAGON:
        return "hexgon";
      default:
        return "no-border";
    }
  }
  assignSections(node, sectionNumber) {
    if (node.level === 0) {
      node.section = undefined;
    } else {
      node.section = sectionNumber;
    }
    if (node.children) {
      for (const [index, child] of node.children.entries()) {
        const childSectionNumber = node.level === 0 ? index % (MAX_SECTIONS - 1) : sectionNumber;
        this.assignSections(child, childSectionNumber);
      }
    }
  }
  flattenNodes(node, processedNodes) {
    const conf = getConfig2();
    const cssClasses = ["mindmap-node"];
    if (node.isRoot === true) {
      cssClasses.push("section-root", "section--1");
    } else if (node.section !== undefined) {
      cssClasses.push(`section-${node.section}`);
    }
    if (node.class) {
      cssClasses.push(node.class);
    }
    const classes = cssClasses.join(" ");
    const getShapeFromType = /* @__PURE__ */ __name((type) => {
      const theme = conf.theme?.toLowerCase() ?? "";
      const isReduxTheme = theme.includes("redux");
      switch (type) {
        case nodeType.CIRCLE:
          return "mindmapCircle";
        case nodeType.RECT:
          return "rect";
        case nodeType.ROUNDED_RECT:
          return "rounded";
        case nodeType.CLOUD:
          return "cloud";
        case nodeType.BANG:
          return "bang";
        case nodeType.HEXAGON:
          return "hexagon";
        case nodeType.DEFAULT:
          return isReduxTheme ? "rounded" : "defaultMindmapNode";
        case nodeType.NO_BORDER:
        default:
          return "rect";
      }
    }, "getShapeFromType");
    const processedNode = {
      id: node.id.toString(),
      domId: "node_" + node.id.toString(),
      label: node.descr,
      labelType: "markdown",
      isGroup: false,
      shape: getShapeFromType(node.type),
      width: node.width,
      height: node.height ?? 0,
      padding: node.padding,
      cssClasses: classes,
      cssStyles: [],
      look: conf.look,
      icon: node.icon,
      x: node.x,
      y: node.y,
      level: node.level,
      nodeId: node.nodeId,
      type: node.type,
      section: node.section
    };
    processedNodes.push(processedNode);
    if (node.children) {
      for (const child of node.children) {
        this.flattenNodes(child, processedNodes);
      }
    }
  }
  generateEdges(node, edges) {
    if (!node.children) {
      return;
    }
    const conf = getConfig2();
    for (const child of node.children) {
      let edgeClasses = "edge";
      if (child.section !== undefined) {
        edgeClasses += ` section-edge-${child.section}`;
      }
      const edgeDepth = node.level + 1;
      edgeClasses += ` edge-depth-${edgeDepth}`;
      const edge = {
        id: `edge_${node.id}_${child.id}`,
        start: node.id.toString(),
        end: child.id.toString(),
        type: "normal",
        curve: "basis",
        thickness: "normal",
        look: conf.look,
        classes: edgeClasses,
        depth: node.level,
        section: child.section
      };
      edges.push(edge);
      this.generateEdges(child, edges);
    }
  }
  getData() {
    const mindmapRoot = this.getMindmap();
    const config = getConfig2();
    const userDefinedConfig = getUserDefinedConfig();
    const hasUserDefinedLayout = userDefinedConfig.layout !== undefined;
    const finalConfig = config;
    if (!hasUserDefinedLayout) {
      finalConfig.layout = "cose-bilkent";
    }
    if (!mindmapRoot) {
      return {
        nodes: [],
        edges: [],
        config: finalConfig
      };
    }
    log.debug("getData: mindmapRoot", mindmapRoot, config);
    this.assignSections(mindmapRoot);
    const processedNodes = [];
    const processedEdges = [];
    this.flattenNodes(mindmapRoot, processedNodes);
    this.generateEdges(mindmapRoot, processedEdges);
    log.debug(`getData: processed ${processedNodes.length} nodes and ${processedEdges.length} edges`);
    const shapes = /* @__PURE__ */ new Map;
    for (const node of processedNodes) {
      shapes.set(node.id, {
        shape: node.shape,
        width: node.width,
        height: node.height,
        padding: node.padding
      });
    }
    return {
      nodes: processedNodes,
      edges: processedEdges,
      config: finalConfig,
      rootNode: mindmapRoot,
      markers: ["point"],
      direction: "TB",
      nodeSpacing: 50,
      rankSpacing: 50,
      shapes: Object.fromEntries(shapes),
      type: "mindmap",
      diagramId: "mindmap-" + v4_default()
    };
  }
  getLogger() {
    return log;
  }
};
var draw = /* @__PURE__ */ __name(async (text, id, _version, diagObj) => {
  log.debug(`Rendering mindmap diagram
` + text);
  const db = diagObj.db;
  const data4Layout = db.getData();
  const svg = getDiagramElement(id, data4Layout.config.securityLevel);
  data4Layout.type = diagObj.type;
  data4Layout.layoutAlgorithm = getRegisteredLayoutAlgorithm(data4Layout.config.layout, {
    fallback: "cose-bilkent"
  });
  data4Layout.diagramId = id;
  const mm = db.getMindmap();
  if (!mm) {
    return;
  }
  data4Layout.nodes.forEach((node) => {
    if (node.shape === "rounded") {
      node.radius = 15;
      node.taper = 15;
      node.stroke = "none";
      node.width = 0;
      node.padding = 15;
    } else if (node.shape === "circle") {
      node.padding = 10;
    } else if (node.shape === "rect") {
      node.width = 0;
      node.padding = 10;
    } else if (node.shape === "hexagon") {
      node.width = 0;
      node.height = 0;
    }
  });
  await render(data4Layout, svg);
  const { themeVariables } = getConfig();
  const { useGradient, gradientStart, gradientStop } = themeVariables;
  if (useGradient && gradientStart && gradientStop) {
    const svgId = svg.attr("id");
    const gradient = svg.append("defs").append("linearGradient").attr("id", `${svgId}-gradient`).attr("gradientUnits", "objectBoundingBox").attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", gradientStart).attr("stop-opacity", 1);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", gradientStop).attr("stop-opacity", 1);
  }
  setupViewPortForSVG(svg, data4Layout.config.mindmap?.padding ?? defaultConfig_default.mindmap.padding, "mindmapDiagram", data4Layout.config.mindmap?.useMaxWidth ?? defaultConfig_default.mindmap.useMaxWidth);
}, "draw");
var mindmapRenderer_default = {
  draw
};
var genSections = /* @__PURE__ */ __name((options) => {
  const { theme, look } = options;
  let sections = "";
  for (let i = 0;i < options.THEME_COLOR_LIMIT; i++) {
    options["lineColor" + i] = options["lineColor" + i] || options["cScaleInv" + i];
    if (is_dark_default(options["lineColor" + i])) {
      options["lineColor" + i] = lighten_default(options["lineColor" + i], 20);
    } else {
      options["lineColor" + i] = darken_default(options["lineColor" + i], 20);
    }
  }
  for (let i = 0;i < options.THEME_COLOR_LIMIT; i++) {
    const sw = "" + (look === "neo" ? Math.max(10 - (i - 1) * 2, 2) : 17 - 3 * i);
    sections += `
    .section-${i - 1} rect, .section-${i - 1} path, .section-${i - 1} circle, .section-${i - 1} polygon, .section-${i - 1} path  {
      fill: ${options["cScale" + i]};
    }
    .section-${i - 1} text {
     fill: ${options["cScaleLabel" + i]};
    }
     .section-${i - 1} span {
     color: ${options["cScaleLabel" + i]};
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
    [data-look="neo"].mindmap-node.section-${i - 1} rect, [data-look="neo"].mindmap-node.section-${i - 1} path, [data-look="neo"].mindmap-node.section-${i - 1} circle, [data-look="neo"].mindmap-node.section-${i - 1} polygon {
      fill: ${theme === "redux" || theme === "redux-dark" || theme === "neutral" ? options.mainBkg : options["cScale" + i]};
      stroke: ${theme === "redux" || theme === "redux-dark" ? options.nodeBorder : options["cScale" + i]};
      stroke-width: ${options.strokeWidth ?? 2}px;
    }
    [data-look="neo"].section-edge-${i - 1}{
      stroke: ${theme?.includes("redux") || theme === "neo-dark" ? options.nodeBorder : options["cScale" + i]};
    }
    [data-look="neo"].mindmap-node.section-${i - 1} text {
     fill: ${theme === "redux" || theme === "redux-dark" ? options.nodeBorder : options["cScaleLabel" + (theme === "neutral" ? 1 : i)]};
    }
    `;
  }
  return sections;
}, "genSections");
var genGradient = /* @__PURE__ */ __name((THEME_COLOR_LIMIT, svgId, mainBkg) => {
  let sections = "";
  for (let i = 0;i < THEME_COLOR_LIMIT; i++) {
    sections += `
    [data-look="neo"].mindmap-node.section-${i - 1} rect, [data-look="neo"].mindmap-node.section-${i - 1} path, [data-look="neo"].mindmap-node.section-${i - 1} circle, [data-look="neo"].mindmap-node.section-${i - 1} polygon {
      stroke: url(${svgId}-gradient);
      fill: ${mainBkg};
    }
    .section-${i - 1} line {
      stroke-width: 0;
    }`;
  }
  return sections;
}, "genGradient");
var getStyles = /* @__PURE__ */ __name((options) => {
  const { theme } = options;
  const svgId = options.svgId;
  const scopedDropShadow = options.dropShadow ? options.dropShadow.replace("url(#drop-shadow)", `url(${svgId}-drop-shadow)`) : "none";
  return `
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
  .section-root span {
    color: ${theme?.includes("redux") ? options.nodeBorder : options.gitBranchLabel0};
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
  .mindmap-node-label {
    dy: 1em;
    alignment-baseline: middle;
    text-anchor: middle;
    dominant-baseline: middle;
    text-align: center;
  }
  [data-look="neo"].mindmap-node  {
    filter: ${scopedDropShadow};
  }
  [data-look="neo"].mindmap-node.section-root rect, [data-look="neo"].mindmap-node.section-root path, [data-look="neo"].mindmap-node.section-root circle, [data-look="neo"].mindmap-node.section-root polygon  {
    fill: ${theme?.includes("redux") ? options.mainBkg : options.git0};
  }
  [data-look="neo"].mindmap-node.section-root .text-inner-tspan {
    fill:  ${theme?.includes("redux") ? options.nodeBorder : options["cScaleLabel" + (theme === "neutral" ? 1 : 0)]};
  }
  ${options.useGradient && svgId && options.mainBkg ? genGradient(options.THEME_COLOR_LIMIT, svgId, options.mainBkg) : ""}
`;
}, "getStyles");
var styles_default = getStyles;
var diagram = {
  get db() {
    return new MindmapDB;
  },
  renderer: mindmapRenderer_default,
  parser: mindmap_default,
  styles: styles_default
};
export {
  diagram
};

//# debugId=EFC08FF3CB2B541164756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9ybmcuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9zdHJpbmdpZnkuanMiLCAiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC92NC5qcyIsICIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbWVybWFpZC9kaXN0L2NodW5rcy9tZXJtYWlkLmNvcmUvbWluZG1hcC1kZWZpbml0aW9uLVJLWjM0TlFMLm1qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJjb25zdCBybmRzOCA9IG5ldyBVaW50OEFycmF5KDE2KTtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJuZygpIHtcbiAgICByZXR1cm4gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhybmRzOCk7XG59XG4iLAogICAgImltcG9ydCB2YWxpZGF0ZSBmcm9tICcuL3ZhbGlkYXRlLmpzJztcbmNvbnN0IGJ5dGVUb0hleCA9IFtdO1xuZm9yIChsZXQgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICAgIGJ5dGVUb0hleC5wdXNoKChpICsgMHgxMDApLnRvU3RyaW5nKDE2KS5zbGljZSgxKSk7XG59XG5leHBvcnQgZnVuY3Rpb24gdW5zYWZlU3RyaW5naWZ5KGFyciwgb2Zmc2V0ID0gMCkge1xuICAgIHJldHVybiAoYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAwXV0gK1xuICAgICAgICBieXRlVG9IZXhbYXJyW29mZnNldCArIDFdXSArXG4gICAgICAgIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMl1dICtcbiAgICAgICAgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAzXV0gK1xuICAgICAgICAnLScgK1xuICAgICAgICBieXRlVG9IZXhbYXJyW29mZnNldCArIDRdXSArXG4gICAgICAgIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgNV1dICtcbiAgICAgICAgJy0nICtcbiAgICAgICAgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA2XV0gK1xuICAgICAgICBieXRlVG9IZXhbYXJyW29mZnNldCArIDddXSArXG4gICAgICAgICctJyArXG4gICAgICAgIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgOF1dICtcbiAgICAgICAgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA5XV0gK1xuICAgICAgICAnLScgK1xuICAgICAgICBieXRlVG9IZXhbYXJyW29mZnNldCArIDEwXV0gK1xuICAgICAgICBieXRlVG9IZXhbYXJyW29mZnNldCArIDExXV0gK1xuICAgICAgICBieXRlVG9IZXhbYXJyW29mZnNldCArIDEyXV0gK1xuICAgICAgICBieXRlVG9IZXhbYXJyW29mZnNldCArIDEzXV0gK1xuICAgICAgICBieXRlVG9IZXhbYXJyW29mZnNldCArIDE0XV0gK1xuICAgICAgICBieXRlVG9IZXhbYXJyW29mZnNldCArIDE1XV0pLnRvTG93ZXJDYXNlKCk7XG59XG5mdW5jdGlvbiBzdHJpbmdpZnkoYXJyLCBvZmZzZXQgPSAwKSB7XG4gICAgY29uc3QgdXVpZCA9IHVuc2FmZVN0cmluZ2lmeShhcnIsIG9mZnNldCk7XG4gICAgaWYgKCF2YWxpZGF0ZSh1dWlkKSkge1xuICAgICAgICB0aHJvdyBUeXBlRXJyb3IoJ1N0cmluZ2lmaWVkIFVVSUQgaXMgaW52YWxpZCcpO1xuICAgIH1cbiAgICByZXR1cm4gdXVpZDtcbn1cbmV4cG9ydCBkZWZhdWx0IHN0cmluZ2lmeTtcbiIsCiAgICAiaW1wb3J0IHJuZyBmcm9tICcuL3JuZy5qcyc7XG5pbXBvcnQgeyB1bnNhZmVTdHJpbmdpZnkgfSBmcm9tICcuL3N0cmluZ2lmeS5qcyc7XG5mdW5jdGlvbiB2NChvcHRpb25zLCBidWYsIG9mZnNldCkge1xuICAgIGlmICghYnVmICYmICFvcHRpb25zICYmIGNyeXB0by5yYW5kb21VVUlEKSB7XG4gICAgICAgIHJldHVybiBjcnlwdG8ucmFuZG9tVVVJRCgpO1xuICAgIH1cbiAgICByZXR1cm4gX3Y0KG9wdGlvbnMsIGJ1Ziwgb2Zmc2V0KTtcbn1cbmZ1bmN0aW9uIF92NChvcHRpb25zLCBidWYsIG9mZnNldCkge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIGNvbnN0IHJuZHMgPSBvcHRpb25zLnJhbmRvbSA/PyBvcHRpb25zLnJuZz8uKCkgPz8gcm5nKCk7XG4gICAgaWYgKHJuZHMubGVuZ3RoIDwgMTYpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSYW5kb20gYnl0ZXMgbGVuZ3RoIG11c3QgYmUgPj0gMTYnKTtcbiAgICB9XG4gICAgcm5kc1s2XSA9IChybmRzWzZdICYgMHgwZikgfCAweDQwO1xuICAgIHJuZHNbOF0gPSAocm5kc1s4XSAmIDB4M2YpIHwgMHg4MDtcbiAgICBpZiAoYnVmKSB7XG4gICAgICAgIG9mZnNldCA9IG9mZnNldCB8fCAwO1xuICAgICAgICBpZiAob2Zmc2V0IDwgMCB8fCBvZmZzZXQgKyAxNiA+IGJ1Zi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBVVUlEIGJ5dGUgcmFuZ2UgJHtvZmZzZXR9OiR7b2Zmc2V0ICsgMTV9IGlzIG91dCBvZiBidWZmZXIgYm91bmRzYCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjsgKytpKSB7XG4gICAgICAgICAgICBidWZbb2Zmc2V0ICsgaV0gPSBybmRzW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBidWY7XG4gICAgfVxuICAgIHJldHVybiB1bnNhZmVTdHJpbmdpZnkocm5kcyk7XG59XG5leHBvcnQgZGVmYXVsdCB2NDtcbiIsCiAgICAiaW1wb3J0IHtcbiAgZ2V0RGlhZ3JhbUVsZW1lbnRcbn0gZnJvbSBcIi4vY2h1bmstNTVJQUNFQjYubWpzXCI7XG5pbXBvcnQge1xuICBzZXR1cFZpZXdQb3J0Rm9yU1ZHXG59IGZyb20gXCIuL2NodW5rLTJKMzNXVE1ILm1qc1wiO1xuaW1wb3J0IHtcbiAgZ2V0UmVnaXN0ZXJlZExheW91dEFsZ29yaXRobSxcbiAgcmVuZGVyXG59IGZyb20gXCIuL2NodW5rLUxaWEVEWkNBLm1qc1wiO1xuaW1wb3J0IFwiLi9jaHVuay1LU0NTNU42QS5tanNcIjtcbmltcG9ydCBcIi4vY2h1bmstQlNKUDdDQlAubWpzXCI7XG5pbXBvcnQgXCIuL2NodW5rLTNPUElGR0RFLm1qc1wiO1xuaW1wb3J0IFwiLi9jaHVuay1MNVpUTERXVi5tanNcIjtcbmltcG9ydCBcIi4vY2h1bmstTlpLMkQ3R1UubWpzXCI7XG5pbXBvcnQgXCIuL2NodW5rLU81Q0JFTDZPLm1qc1wiO1xuaW1wb3J0IFwiLi9jaHVuay01WlFZSFhLVS5tanNcIjtcbmltcG9ydCB7XG4gIGRlZmF1bHRDb25maWdfZGVmYXVsdCxcbiAgZ2V0Q29uZmlnLFxuICBnZXRDb25maWcyLFxuICBnZXRVc2VyRGVmaW5lZENvbmZpZyxcbiAgc2FuaXRpemVUZXh0XG59IGZyb20gXCIuL2NodW5rLUNTQ0lISzdRLm1qc1wiO1xuaW1wb3J0IHtcbiAgX19uYW1lLFxuICBsb2dcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIHNyYy9kaWFncmFtcy9taW5kbWFwL3BhcnNlci9taW5kbWFwLmppc29uXG52YXIgcGFyc2VyID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgbyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oaywgdiwgbzIsIGwpIHtcbiAgICBmb3IgKG8yID0gbzIgfHwge30sIGwgPSBrLmxlbmd0aDsgbC0tOyBvMltrW2xdXSA9IHYpIDtcbiAgICByZXR1cm4gbzI7XG4gIH0sIFwib1wiKSwgJFYwID0gWzEsIDRdLCAkVjEgPSBbMSwgMTNdLCAkVjIgPSBbMSwgMTJdLCAkVjMgPSBbMSwgMTVdLCAkVjQgPSBbMSwgMTZdLCAkVjUgPSBbMSwgMjBdLCAkVjYgPSBbMSwgMTldLCAkVjcgPSBbNiwgNywgOF0sICRWOCA9IFsxLCAyNl0sICRWOSA9IFsxLCAyNF0sICRWYSA9IFsxLCAyNV0sICRWYiA9IFs2LCA3LCAxMV0sICRWYyA9IFsxLCA2LCAxMywgMTUsIDE2LCAxOSwgMjJdLCAkVmQgPSBbMSwgMzNdLCAkVmUgPSBbMSwgMzRdLCAkVmYgPSBbMSwgNiwgNywgMTEsIDEzLCAxNSwgMTYsIDE5LCAyMl07XG4gIHZhciBwYXJzZXIyID0ge1xuICAgIHRyYWNlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHRyYWNlKCkge1xuICAgIH0sIFwidHJhY2VcIiksXG4gICAgeXk6IHt9LFxuICAgIHN5bWJvbHNfOiB7IFwiZXJyb3JcIjogMiwgXCJzdGFydFwiOiAzLCBcIm1pbmRNYXBcIjogNCwgXCJzcGFjZUxpbmVzXCI6IDUsIFwiU1BBQ0VMSU5FXCI6IDYsIFwiTkxcIjogNywgXCJNSU5ETUFQXCI6IDgsIFwiZG9jdW1lbnRcIjogOSwgXCJzdG9wXCI6IDEwLCBcIkVPRlwiOiAxMSwgXCJzdGF0ZW1lbnRcIjogMTIsIFwiU1BBQ0VMSVNUXCI6IDEzLCBcIm5vZGVcIjogMTQsIFwiSUNPTlwiOiAxNSwgXCJDTEFTU1wiOiAxNiwgXCJub2RlV2l0aElkXCI6IDE3LCBcIm5vZGVXaXRob3V0SWRcIjogMTgsIFwiTk9ERV9EU1RBUlRcIjogMTksIFwiTk9ERV9ERVNDUlwiOiAyMCwgXCJOT0RFX0RFTkRcIjogMjEsIFwiTk9ERV9JRFwiOiAyMiwgXCIkYWNjZXB0XCI6IDAsIFwiJGVuZFwiOiAxIH0sXG4gICAgdGVybWluYWxzXzogeyAyOiBcImVycm9yXCIsIDY6IFwiU1BBQ0VMSU5FXCIsIDc6IFwiTkxcIiwgODogXCJNSU5ETUFQXCIsIDExOiBcIkVPRlwiLCAxMzogXCJTUEFDRUxJU1RcIiwgMTU6IFwiSUNPTlwiLCAxNjogXCJDTEFTU1wiLCAxOTogXCJOT0RFX0RTVEFSVFwiLCAyMDogXCJOT0RFX0RFU0NSXCIsIDIxOiBcIk5PREVfREVORFwiLCAyMjogXCJOT0RFX0lEXCIgfSxcbiAgICBwcm9kdWN0aW9uc186IFswLCBbMywgMV0sIFszLCAyXSwgWzUsIDFdLCBbNSwgMl0sIFs1LCAyXSwgWzQsIDJdLCBbNCwgM10sIFsxMCwgMV0sIFsxMCwgMV0sIFsxMCwgMV0sIFsxMCwgMl0sIFsxMCwgMl0sIFs5LCAzXSwgWzksIDJdLCBbMTIsIDJdLCBbMTIsIDJdLCBbMTIsIDJdLCBbMTIsIDFdLCBbMTIsIDFdLCBbMTIsIDFdLCBbMTIsIDFdLCBbMTIsIDFdLCBbMTQsIDFdLCBbMTQsIDFdLCBbMTgsIDNdLCBbMTcsIDFdLCBbMTcsIDRdXSxcbiAgICBwZXJmb3JtQWN0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGFub255bW91cyh5eXRleHQsIHl5bGVuZywgeXlsaW5lbm8sIHl5LCB5eXN0YXRlLCAkJCwgXyQpIHtcbiAgICAgIHZhciAkMCA9ICQkLmxlbmd0aCAtIDE7XG4gICAgICBzd2l0Y2ggKHl5c3RhdGUpIHtcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgcmV0dXJuIHl5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkudHJhY2UoXCJTdG9wIE5MIFwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA5OlxuICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwiU3RvcCBFT0YgXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDExOlxuICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwiU3RvcCBOTDIgXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwiU3RvcCBFT0YyIFwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNTpcbiAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5pbmZvKFwiTm9kZTogXCIsICQkWyQwXS5pZCk7XG4gICAgICAgICAgeXkuYWRkTm9kZSgkJFskMCAtIDFdLmxlbmd0aCwgJCRbJDBdLmlkLCAkJFskMF0uZGVzY3IsICQkWyQwXS50eXBlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcIkljb246IFwiLCAkJFskMF0pO1xuICAgICAgICAgIHl5LmRlY29yYXRlTm9kZSh7IGljb246ICQkWyQwXSB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNzpcbiAgICAgICAgY2FzZSAyMTpcbiAgICAgICAgICB5eS5kZWNvcmF0ZU5vZGUoeyBjbGFzczogJCRbJDBdIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE4OlxuICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwiU1BBQ0VMSVNUXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE5OlxuICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwiTm9kZTogXCIsICQkWyQwXS5pZCk7XG4gICAgICAgICAgeXkuYWRkTm9kZSgwLCAkJFskMF0uaWQsICQkWyQwXS5kZXNjciwgJCRbJDBdLnR5cGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDIwOlxuICAgICAgICAgIHl5LmRlY29yYXRlTm9kZSh7IGljb246ICQkWyQwXSB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyNTpcbiAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcIm5vZGUgZm91bmQgLi5cIiwgJCRbJDAgLSAyXSk7XG4gICAgICAgICAgdGhpcy4kID0geyBpZDogJCRbJDAgLSAxXSwgZGVzY3I6ICQkWyQwIC0gMV0sIHR5cGU6IHl5LmdldFR5cGUoJCRbJDAgLSAyXSwgJCRbJDBdKSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI2OlxuICAgICAgICAgIHRoaXMuJCA9IHsgaWQ6ICQkWyQwXSwgZGVzY3I6ICQkWyQwXSwgdHlwZTogeXkubm9kZVR5cGUuREVGQVVMVCB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwibm9kZSBmb3VuZCAuLlwiLCAkJFskMCAtIDNdKTtcbiAgICAgICAgICB0aGlzLiQgPSB7IGlkOiAkJFskMCAtIDNdLCBkZXNjcjogJCRbJDAgLSAxXSwgdHlwZTogeXkuZ2V0VHlwZSgkJFskMCAtIDJdLCAkJFskMF0pIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSwgXCJhbm9ueW1vdXNcIiksXG4gICAgdGFibGU6IFt7IDM6IDEsIDQ6IDIsIDU6IDMsIDY6IFsxLCA1XSwgODogJFYwIH0sIHsgMTogWzNdIH0sIHsgMTogWzIsIDFdIH0sIHsgNDogNiwgNjogWzEsIDddLCA3OiBbMSwgOF0sIDg6ICRWMCB9LCB7IDY6ICRWMSwgNzogWzEsIDEwXSwgOTogOSwgMTI6IDExLCAxMzogJFYyLCAxNDogMTQsIDE1OiAkVjMsIDE2OiAkVjQsIDE3OiAxNywgMTg6IDE4LCAxOTogJFY1LCAyMjogJFY2IH0sIG8oJFY3LCBbMiwgM10pLCB7IDE6IFsyLCAyXSB9LCBvKCRWNywgWzIsIDRdKSwgbygkVjcsIFsyLCA1XSksIHsgMTogWzIsIDZdLCA2OiAkVjEsIDEyOiAyMSwgMTM6ICRWMiwgMTQ6IDE0LCAxNTogJFYzLCAxNjogJFY0LCAxNzogMTcsIDE4OiAxOCwgMTk6ICRWNSwgMjI6ICRWNiB9LCB7IDY6ICRWMSwgOTogMjIsIDEyOiAxMSwgMTM6ICRWMiwgMTQ6IDE0LCAxNTogJFYzLCAxNjogJFY0LCAxNzogMTcsIDE4OiAxOCwgMTk6ICRWNSwgMjI6ICRWNiB9LCB7IDY6ICRWOCwgNzogJFY5LCAxMDogMjMsIDExOiAkVmEgfSwgbygkVmIsIFsyLCAyMl0sIHsgMTc6IDE3LCAxODogMTgsIDE0OiAyNywgMTU6IFsxLCAyOF0sIDE2OiBbMSwgMjldLCAxOTogJFY1LCAyMjogJFY2IH0pLCBvKCRWYiwgWzIsIDE4XSksIG8oJFZiLCBbMiwgMTldKSwgbygkVmIsIFsyLCAyMF0pLCBvKCRWYiwgWzIsIDIxXSksIG8oJFZiLCBbMiwgMjNdKSwgbygkVmIsIFsyLCAyNF0pLCBvKCRWYiwgWzIsIDI2XSwgeyAxOTogWzEsIDMwXSB9KSwgeyAyMDogWzEsIDMxXSB9LCB7IDY6ICRWOCwgNzogJFY5LCAxMDogMzIsIDExOiAkVmEgfSwgeyAxOiBbMiwgN10sIDY6ICRWMSwgMTI6IDIxLCAxMzogJFYyLCAxNDogMTQsIDE1OiAkVjMsIDE2OiAkVjQsIDE3OiAxNywgMTg6IDE4LCAxOTogJFY1LCAyMjogJFY2IH0sIG8oJFZjLCBbMiwgMTRdLCB7IDc6ICRWZCwgMTE6ICRWZSB9KSwgbygkVmYsIFsyLCA4XSksIG8oJFZmLCBbMiwgOV0pLCBvKCRWZiwgWzIsIDEwXSksIG8oJFZiLCBbMiwgMTVdKSwgbygkVmIsIFsyLCAxNl0pLCBvKCRWYiwgWzIsIDE3XSksIHsgMjA6IFsxLCAzNV0gfSwgeyAyMTogWzEsIDM2XSB9LCBvKCRWYywgWzIsIDEzXSwgeyA3OiAkVmQsIDExOiAkVmUgfSksIG8oJFZmLCBbMiwgMTFdKSwgbygkVmYsIFsyLCAxMl0pLCB7IDIxOiBbMSwgMzddIH0sIG8oJFZiLCBbMiwgMjVdKSwgbygkVmIsIFsyLCAyN10pXSxcbiAgICBkZWZhdWx0QWN0aW9uczogeyAyOiBbMiwgMV0sIDY6IFsyLCAyXSB9LFxuICAgIHBhcnNlRXJyb3I6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcGFyc2VFcnJvcihzdHIsIGhhc2gpIHtcbiAgICAgIGlmIChoYXNoLnJlY292ZXJhYmxlKSB7XG4gICAgICAgIHRoaXMudHJhY2Uoc3RyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcihzdHIpO1xuICAgICAgICBlcnJvci5oYXNoID0gaGFzaDtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSwgXCJwYXJzZUVycm9yXCIpLFxuICAgIHBhcnNlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBhcnNlKGlucHV0KSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsIHN0YWNrID0gWzBdLCB0c3RhY2sgPSBbXSwgdnN0YWNrID0gW251bGxdLCBsc3RhY2sgPSBbXSwgdGFibGUgPSB0aGlzLnRhYmxlLCB5eXRleHQgPSBcIlwiLCB5eWxpbmVubyA9IDAsIHl5bGVuZyA9IDAsIHJlY292ZXJpbmcgPSAwLCBURVJST1IgPSAyLCBFT0YgPSAxO1xuICAgICAgdmFyIGFyZ3MgPSBsc3RhY2suc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgdmFyIGxleGVyMiA9IE9iamVjdC5jcmVhdGUodGhpcy5sZXhlcik7XG4gICAgICB2YXIgc2hhcmVkU3RhdGUgPSB7IHl5OiB7fSB9O1xuICAgICAgZm9yICh2YXIgayBpbiB0aGlzLnl5KSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy55eSwgaykpIHtcbiAgICAgICAgICBzaGFyZWRTdGF0ZS55eVtrXSA9IHRoaXMueXlba107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxleGVyMi5zZXRJbnB1dChpbnB1dCwgc2hhcmVkU3RhdGUueXkpO1xuICAgICAgc2hhcmVkU3RhdGUueXkubGV4ZXIgPSBsZXhlcjI7XG4gICAgICBzaGFyZWRTdGF0ZS55eS5wYXJzZXIgPSB0aGlzO1xuICAgICAgaWYgKHR5cGVvZiBsZXhlcjIueXlsbG9jID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgbGV4ZXIyLnl5bGxvYyA9IHt9O1xuICAgICAgfVxuICAgICAgdmFyIHl5bG9jID0gbGV4ZXIyLnl5bGxvYztcbiAgICAgIGxzdGFjay5wdXNoKHl5bG9jKTtcbiAgICAgIHZhciByYW5nZXMgPSBsZXhlcjIub3B0aW9ucyAmJiBsZXhlcjIub3B0aW9ucy5yYW5nZXM7XG4gICAgICBpZiAodHlwZW9mIHNoYXJlZFN0YXRlLnl5LnBhcnNlRXJyb3IgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICB0aGlzLnBhcnNlRXJyb3IgPSBzaGFyZWRTdGF0ZS55eS5wYXJzZUVycm9yO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wYXJzZUVycm9yID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpLnBhcnNlRXJyb3I7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBwb3BTdGFjayhuKSB7XG4gICAgICAgIHN0YWNrLmxlbmd0aCA9IHN0YWNrLmxlbmd0aCAtIDIgKiBuO1xuICAgICAgICB2c3RhY2subGVuZ3RoID0gdnN0YWNrLmxlbmd0aCAtIG47XG4gICAgICAgIGxzdGFjay5sZW5ndGggPSBsc3RhY2subGVuZ3RoIC0gbjtcbiAgICAgIH1cbiAgICAgIF9fbmFtZShwb3BTdGFjaywgXCJwb3BTdGFja1wiKTtcbiAgICAgIGZ1bmN0aW9uIGxleCgpIHtcbiAgICAgICAgdmFyIHRva2VuO1xuICAgICAgICB0b2tlbiA9IHRzdGFjay5wb3AoKSB8fCBsZXhlcjIubGV4KCkgfHwgRU9GO1xuICAgICAgICBpZiAodHlwZW9mIHRva2VuICE9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgaWYgKHRva2VuIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIHRzdGFjayA9IHRva2VuO1xuICAgICAgICAgICAgdG9rZW4gPSB0c3RhY2sucG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRva2VuID0gc2VsZi5zeW1ib2xzX1t0b2tlbl0gfHwgdG9rZW47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgfVxuICAgICAgX19uYW1lKGxleCwgXCJsZXhcIik7XG4gICAgICB2YXIgc3ltYm9sLCBwcmVFcnJvclN5bWJvbCwgc3RhdGUsIGFjdGlvbiwgYSwgciwgeXl2YWwgPSB7fSwgcCwgbGVuLCBuZXdTdGF0ZSwgZXhwZWN0ZWQ7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBzdGF0ZSA9IHN0YWNrW3N0YWNrLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAodGhpcy5kZWZhdWx0QWN0aW9uc1tzdGF0ZV0pIHtcbiAgICAgICAgICBhY3Rpb24gPSB0aGlzLmRlZmF1bHRBY3Rpb25zW3N0YXRlXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoc3ltYm9sID09PSBudWxsIHx8IHR5cGVvZiBzeW1ib2wgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgc3ltYm9sID0gbGV4KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFjdGlvbiA9IHRhYmxlW3N0YXRlXSAmJiB0YWJsZVtzdGF0ZV1bc3ltYm9sXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGFjdGlvbiA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhYWN0aW9uLmxlbmd0aCB8fCAhYWN0aW9uWzBdKSB7XG4gICAgICAgICAgdmFyIGVyclN0ciA9IFwiXCI7XG4gICAgICAgICAgZXhwZWN0ZWQgPSBbXTtcbiAgICAgICAgICBmb3IgKHAgaW4gdGFibGVbc3RhdGVdKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50ZXJtaW5hbHNfW3BdICYmIHAgPiBURVJST1IpIHtcbiAgICAgICAgICAgICAgZXhwZWN0ZWQucHVzaChcIidcIiArIHRoaXMudGVybWluYWxzX1twXSArIFwiJ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGxleGVyMi5zaG93UG9zaXRpb24pIHtcbiAgICAgICAgICAgIGVyclN0ciA9IFwiUGFyc2UgZXJyb3Igb24gbGluZSBcIiArICh5eWxpbmVubyArIDEpICsgXCI6XFxuXCIgKyBsZXhlcjIuc2hvd1Bvc2l0aW9uKCkgKyBcIlxcbkV4cGVjdGluZyBcIiArIGV4cGVjdGVkLmpvaW4oXCIsIFwiKSArIFwiLCBnb3QgJ1wiICsgKHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCkgKyBcIidcIjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyU3RyID0gXCJQYXJzZSBlcnJvciBvbiBsaW5lIFwiICsgKHl5bGluZW5vICsgMSkgKyBcIjogVW5leHBlY3RlZCBcIiArIChzeW1ib2wgPT0gRU9GID8gXCJlbmQgb2YgaW5wdXRcIiA6IFwiJ1wiICsgKHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCkgKyBcIidcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMucGFyc2VFcnJvcihlcnJTdHIsIHtcbiAgICAgICAgICAgIHRleHQ6IGxleGVyMi5tYXRjaCxcbiAgICAgICAgICAgIHRva2VuOiB0aGlzLnRlcm1pbmFsc19bc3ltYm9sXSB8fCBzeW1ib2wsXG4gICAgICAgICAgICBsaW5lOiBsZXhlcjIueXlsaW5lbm8sXG4gICAgICAgICAgICBsb2M6IHl5bG9jLFxuICAgICAgICAgICAgZXhwZWN0ZWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYWN0aW9uWzBdIGluc3RhbmNlb2YgQXJyYXkgJiYgYWN0aW9uLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXJzZSBFcnJvcjogbXVsdGlwbGUgYWN0aW9ucyBwb3NzaWJsZSBhdCBzdGF0ZTogXCIgKyBzdGF0ZSArIFwiLCB0b2tlbjogXCIgKyBzeW1ib2wpO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAoYWN0aW9uWzBdKSB7XG4gICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgc3RhY2sucHVzaChzeW1ib2wpO1xuICAgICAgICAgICAgdnN0YWNrLnB1c2gobGV4ZXIyLnl5dGV4dCk7XG4gICAgICAgICAgICBsc3RhY2sucHVzaChsZXhlcjIueXlsbG9jKTtcbiAgICAgICAgICAgIHN0YWNrLnB1c2goYWN0aW9uWzFdKTtcbiAgICAgICAgICAgIHN5bWJvbCA9IG51bGw7XG4gICAgICAgICAgICBpZiAoIXByZUVycm9yU3ltYm9sKSB7XG4gICAgICAgICAgICAgIHl5bGVuZyA9IGxleGVyMi55eWxlbmc7XG4gICAgICAgICAgICAgIHl5dGV4dCA9IGxleGVyMi55eXRleHQ7XG4gICAgICAgICAgICAgIHl5bGluZW5vID0gbGV4ZXIyLnl5bGluZW5vO1xuICAgICAgICAgICAgICB5eWxvYyA9IGxleGVyMi55eWxsb2M7XG4gICAgICAgICAgICAgIGlmIChyZWNvdmVyaW5nID4gMCkge1xuICAgICAgICAgICAgICAgIHJlY292ZXJpbmctLTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc3ltYm9sID0gcHJlRXJyb3JTeW1ib2w7XG4gICAgICAgICAgICAgIHByZUVycm9yU3ltYm9sID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIGxlbiA9IHRoaXMucHJvZHVjdGlvbnNfW2FjdGlvblsxXV1bMV07XG4gICAgICAgICAgICB5eXZhbC4kID0gdnN0YWNrW3ZzdGFjay5sZW5ndGggLSBsZW5dO1xuICAgICAgICAgICAgeXl2YWwuXyQgPSB7XG4gICAgICAgICAgICAgIGZpcnN0X2xpbmU6IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0uZmlyc3RfbGluZSxcbiAgICAgICAgICAgICAgbGFzdF9saW5lOiBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIDFdLmxhc3RfbGluZSxcbiAgICAgICAgICAgICAgZmlyc3RfY29sdW1uOiBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIChsZW4gfHwgMSldLmZpcnN0X2NvbHVtbixcbiAgICAgICAgICAgICAgbGFzdF9jb2x1bW46IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gMV0ubGFzdF9jb2x1bW5cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAocmFuZ2VzKSB7XG4gICAgICAgICAgICAgIHl5dmFsLl8kLnJhbmdlID0gW1xuICAgICAgICAgICAgICAgIGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0ucmFuZ2VbMF0sXG4gICAgICAgICAgICAgICAgbHN0YWNrW2xzdGFjay5sZW5ndGggLSAxXS5yYW5nZVsxXVxuICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgciA9IHRoaXMucGVyZm9ybUFjdGlvbi5hcHBseSh5eXZhbCwgW1xuICAgICAgICAgICAgICB5eXRleHQsXG4gICAgICAgICAgICAgIHl5bGVuZyxcbiAgICAgICAgICAgICAgeXlsaW5lbm8sXG4gICAgICAgICAgICAgIHNoYXJlZFN0YXRlLnl5LFxuICAgICAgICAgICAgICBhY3Rpb25bMV0sXG4gICAgICAgICAgICAgIHZzdGFjayxcbiAgICAgICAgICAgICAgbHN0YWNrXG4gICAgICAgICAgICBdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGVuKSB7XG4gICAgICAgICAgICAgIHN0YWNrID0gc3RhY2suc2xpY2UoMCwgLTEgKiBsZW4gKiAyKTtcbiAgICAgICAgICAgICAgdnN0YWNrID0gdnN0YWNrLnNsaWNlKDAsIC0xICogbGVuKTtcbiAgICAgICAgICAgICAgbHN0YWNrID0gbHN0YWNrLnNsaWNlKDAsIC0xICogbGVuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0YWNrLnB1c2godGhpcy5wcm9kdWN0aW9uc19bYWN0aW9uWzFdXVswXSk7XG4gICAgICAgICAgICB2c3RhY2sucHVzaCh5eXZhbC4kKTtcbiAgICAgICAgICAgIGxzdGFjay5wdXNoKHl5dmFsLl8kKTtcbiAgICAgICAgICAgIG5ld1N0YXRlID0gdGFibGVbc3RhY2tbc3RhY2subGVuZ3RoIC0gMl1dW3N0YWNrW3N0YWNrLmxlbmd0aCAtIDFdXTtcbiAgICAgICAgICAgIHN0YWNrLnB1c2gobmV3U3RhdGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sIFwicGFyc2VcIilcbiAgfTtcbiAgdmFyIGxleGVyID0gLyogQF9fUFVSRV9fICovIChmdW5jdGlvbigpIHtcbiAgICB2YXIgbGV4ZXIyID0ge1xuICAgICAgRU9GOiAxLFxuICAgICAgcGFyc2VFcnJvcjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwYXJzZUVycm9yKHN0ciwgaGFzaCkge1xuICAgICAgICBpZiAodGhpcy55eS5wYXJzZXIpIHtcbiAgICAgICAgICB0aGlzLnl5LnBhcnNlci5wYXJzZUVycm9yKHN0ciwgaGFzaCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKHN0cik7XG4gICAgICAgIH1cbiAgICAgIH0sIFwicGFyc2VFcnJvclwiKSxcbiAgICAgIC8vIHJlc2V0cyB0aGUgbGV4ZXIsIHNldHMgbmV3IGlucHV0XG4gICAgICBzZXRJbnB1dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihpbnB1dCwgeXkpIHtcbiAgICAgICAgdGhpcy55eSA9IHl5IHx8IHRoaXMueXkgfHwge307XG4gICAgICAgIHRoaXMuX2lucHV0ID0gaW5wdXQ7XG4gICAgICAgIHRoaXMuX21vcmUgPSB0aGlzLl9iYWNrdHJhY2sgPSB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy55eWxpbmVubyA9IHRoaXMueXlsZW5nID0gMDtcbiAgICAgICAgdGhpcy55eXRleHQgPSB0aGlzLm1hdGNoZWQgPSB0aGlzLm1hdGNoID0gXCJcIjtcbiAgICAgICAgdGhpcy5jb25kaXRpb25TdGFjayA9IFtcIklOSVRJQUxcIl07XG4gICAgICAgIHRoaXMueXlsbG9jID0ge1xuICAgICAgICAgIGZpcnN0X2xpbmU6IDEsXG4gICAgICAgICAgZmlyc3RfY29sdW1uOiAwLFxuICAgICAgICAgIGxhc3RfbGluZTogMSxcbiAgICAgICAgICBsYXN0X2NvbHVtbjogMFxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlID0gWzAsIDBdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub2Zmc2V0ID0gMDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcInNldElucHV0XCIpLFxuICAgICAgLy8gY29uc3VtZXMgYW5kIHJldHVybnMgb25lIGNoYXIgZnJvbSB0aGUgaW5wdXRcbiAgICAgIGlucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY2ggPSB0aGlzLl9pbnB1dFswXTtcbiAgICAgICAgdGhpcy55eXRleHQgKz0gY2g7XG4gICAgICAgIHRoaXMueXlsZW5nKys7XG4gICAgICAgIHRoaXMub2Zmc2V0Kys7XG4gICAgICAgIHRoaXMubWF0Y2ggKz0gY2g7XG4gICAgICAgIHRoaXMubWF0Y2hlZCArPSBjaDtcbiAgICAgICAgdmFyIGxpbmVzID0gY2gubWF0Y2goLyg/Olxcclxcbj98XFxuKS4qL2cpO1xuICAgICAgICBpZiAobGluZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGluZW5vKys7XG4gICAgICAgICAgdGhpcy55eWxsb2MubGFzdF9saW5lKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MubGFzdF9jb2x1bW4rKztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlWzFdKys7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faW5wdXQgPSB0aGlzLl9pbnB1dC5zbGljZSgxKTtcbiAgICAgICAgcmV0dXJuIGNoO1xuICAgICAgfSwgXCJpbnB1dFwiKSxcbiAgICAgIC8vIHVuc2hpZnRzIG9uZSBjaGFyIChvciBhIHN0cmluZykgaW50byB0aGUgaW5wdXRcbiAgICAgIHVucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGNoKSB7XG4gICAgICAgIHZhciBsZW4gPSBjaC5sZW5ndGg7XG4gICAgICAgIHZhciBsaW5lcyA9IGNoLnNwbGl0KC8oPzpcXHJcXG4/fFxcbikvZyk7XG4gICAgICAgIHRoaXMuX2lucHV0ID0gY2ggKyB0aGlzLl9pbnB1dDtcbiAgICAgICAgdGhpcy55eXRleHQgPSB0aGlzLnl5dGV4dC5zdWJzdHIoMCwgdGhpcy55eXRleHQubGVuZ3RoIC0gbGVuKTtcbiAgICAgICAgdGhpcy5vZmZzZXQgLT0gbGVuO1xuICAgICAgICB2YXIgb2xkTGluZXMgPSB0aGlzLm1hdGNoLnNwbGl0KC8oPzpcXHJcXG4/fFxcbikvZyk7XG4gICAgICAgIHRoaXMubWF0Y2ggPSB0aGlzLm1hdGNoLnN1YnN0cigwLCB0aGlzLm1hdGNoLmxlbmd0aCAtIDEpO1xuICAgICAgICB0aGlzLm1hdGNoZWQgPSB0aGlzLm1hdGNoZWQuc3Vic3RyKDAsIHRoaXMubWF0Y2hlZC5sZW5ndGggLSAxKTtcbiAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICB0aGlzLnl5bGluZW5vIC09IGxpbmVzLmxlbmd0aCAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHIgPSB0aGlzLnl5bGxvYy5yYW5nZTtcbiAgICAgICAgdGhpcy55eWxsb2MgPSB7XG4gICAgICAgICAgZmlyc3RfbGluZTogdGhpcy55eWxsb2MuZmlyc3RfbGluZSxcbiAgICAgICAgICBsYXN0X2xpbmU6IHRoaXMueXlsaW5lbm8gKyAxLFxuICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uLFxuICAgICAgICAgIGxhc3RfY29sdW1uOiBsaW5lcyA/IChsaW5lcy5sZW5ndGggPT09IG9sZExpbmVzLmxlbmd0aCA/IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbiA6IDApICsgb2xkTGluZXNbb2xkTGluZXMubGVuZ3RoIC0gbGluZXMubGVuZ3RoXS5sZW5ndGggLSBsaW5lc1swXS5sZW5ndGggOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4gLSBsZW5cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZSA9IFtyWzBdLCByWzBdICsgdGhpcy55eWxlbmcgLSBsZW5dO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueXlsZW5nID0gdGhpcy55eXRleHQubGVuZ3RoO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwidW5wdXRcIiksXG4gICAgICAvLyBXaGVuIGNhbGxlZCBmcm9tIGFjdGlvbiwgY2FjaGVzIG1hdGNoZWQgdGV4dCBhbmQgYXBwZW5kcyBpdCBvbiBuZXh0IGFjdGlvblxuICAgICAgbW9yZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fbW9yZSA9IHRydWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJtb3JlXCIpLFxuICAgICAgLy8gV2hlbiBjYWxsZWQgZnJvbSBhY3Rpb24sIHNpZ25hbHMgdGhlIGxleGVyIHRoYXQgdGhpcyBydWxlIGZhaWxzIHRvIG1hdGNoIHRoZSBpbnB1dCwgc28gdGhlIG5leHQgbWF0Y2hpbmcgcnVsZSAocmVnZXgpIHNob3VsZCBiZSB0ZXN0ZWQgaW5zdGVhZC5cbiAgICAgIHJlamVjdDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIpIHtcbiAgICAgICAgICB0aGlzLl9iYWNrdHJhY2sgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRXJyb3IoXCJMZXhpY2FsIGVycm9yIG9uIGxpbmUgXCIgKyAodGhpcy55eWxpbmVubyArIDEpICsgXCIuIFlvdSBjYW4gb25seSBpbnZva2UgcmVqZWN0KCkgaW4gdGhlIGxleGVyIHdoZW4gdGhlIGxleGVyIGlzIG9mIHRoZSBiYWNrdHJhY2tpbmcgcGVyc3Vhc2lvbiAob3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIgPSB0cnVlKS5cXG5cIiArIHRoaXMuc2hvd1Bvc2l0aW9uKCksIHtcbiAgICAgICAgICAgIHRleHQ6IFwiXCIsXG4gICAgICAgICAgICB0b2tlbjogbnVsbCxcbiAgICAgICAgICAgIGxpbmU6IHRoaXMueXlsaW5lbm9cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwicmVqZWN0XCIpLFxuICAgICAgLy8gcmV0YWluIGZpcnN0IG4gY2hhcmFjdGVycyBvZiB0aGUgbWF0Y2hcbiAgICAgIGxlc3M6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obikge1xuICAgICAgICB0aGlzLnVucHV0KHRoaXMubWF0Y2guc2xpY2UobikpO1xuICAgICAgfSwgXCJsZXNzXCIpLFxuICAgICAgLy8gZGlzcGxheXMgYWxyZWFkeSBtYXRjaGVkIGlucHV0LCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgcGFzdElucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGFzdCA9IHRoaXMubWF0Y2hlZC5zdWJzdHIoMCwgdGhpcy5tYXRjaGVkLmxlbmd0aCAtIHRoaXMubWF0Y2gubGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuIChwYXN0Lmxlbmd0aCA+IDIwID8gXCIuLi5cIiA6IFwiXCIpICsgcGFzdC5zdWJzdHIoLTIwKS5yZXBsYWNlKC9cXG4vZywgXCJcIik7XG4gICAgICB9LCBcInBhc3RJbnB1dFwiKSxcbiAgICAgIC8vIGRpc3BsYXlzIHVwY29taW5nIGlucHV0LCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgdXBjb21pbmdJbnB1dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG5leHQgPSB0aGlzLm1hdGNoO1xuICAgICAgICBpZiAobmV4dC5sZW5ndGggPCAyMCkge1xuICAgICAgICAgIG5leHQgKz0gdGhpcy5faW5wdXQuc3Vic3RyKDAsIDIwIC0gbmV4dC5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAobmV4dC5zdWJzdHIoMCwgMjApICsgKG5leHQubGVuZ3RoID4gMjAgPyBcIi4uLlwiIDogXCJcIikpLnJlcGxhY2UoL1xcbi9nLCBcIlwiKTtcbiAgICAgIH0sIFwidXBjb21pbmdJbnB1dFwiKSxcbiAgICAgIC8vIGRpc3BsYXlzIHRoZSBjaGFyYWN0ZXIgcG9zaXRpb24gd2hlcmUgdGhlIGxleGluZyBlcnJvciBvY2N1cnJlZCwgaS5lLiBmb3IgZXJyb3IgbWVzc2FnZXNcbiAgICAgIHNob3dQb3NpdGlvbjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHByZSA9IHRoaXMucGFzdElucHV0KCk7XG4gICAgICAgIHZhciBjID0gbmV3IEFycmF5KHByZS5sZW5ndGggKyAxKS5qb2luKFwiLVwiKTtcbiAgICAgICAgcmV0dXJuIHByZSArIHRoaXMudXBjb21pbmdJbnB1dCgpICsgXCJcXG5cIiArIGMgKyBcIl5cIjtcbiAgICAgIH0sIFwic2hvd1Bvc2l0aW9uXCIpLFxuICAgICAgLy8gdGVzdCB0aGUgbGV4ZWQgdG9rZW46IHJldHVybiBGQUxTRSB3aGVuIG5vdCBhIG1hdGNoLCBvdGhlcndpc2UgcmV0dXJuIHRva2VuXG4gICAgICB0ZXN0X21hdGNoOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKG1hdGNoLCBpbmRleGVkX3J1bGUpIHtcbiAgICAgICAgdmFyIHRva2VuLCBsaW5lcywgYmFja3VwO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2t0cmFja19sZXhlcikge1xuICAgICAgICAgIGJhY2t1cCA9IHtcbiAgICAgICAgICAgIHl5bGluZW5vOiB0aGlzLnl5bGluZW5vLFxuICAgICAgICAgICAgeXlsbG9jOiB7XG4gICAgICAgICAgICAgIGZpcnN0X2xpbmU6IHRoaXMueXlsbG9jLmZpcnN0X2xpbmUsXG4gICAgICAgICAgICAgIGxhc3RfbGluZTogdGhpcy5sYXN0X2xpbmUsXG4gICAgICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uLFxuICAgICAgICAgICAgICBsYXN0X2NvbHVtbjogdGhpcy55eWxsb2MubGFzdF9jb2x1bW5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB5eXRleHQ6IHRoaXMueXl0ZXh0LFxuICAgICAgICAgICAgbWF0Y2g6IHRoaXMubWF0Y2gsXG4gICAgICAgICAgICBtYXRjaGVzOiB0aGlzLm1hdGNoZXMsXG4gICAgICAgICAgICBtYXRjaGVkOiB0aGlzLm1hdGNoZWQsXG4gICAgICAgICAgICB5eWxlbmc6IHRoaXMueXlsZW5nLFxuICAgICAgICAgICAgb2Zmc2V0OiB0aGlzLm9mZnNldCxcbiAgICAgICAgICAgIF9tb3JlOiB0aGlzLl9tb3JlLFxuICAgICAgICAgICAgX2lucHV0OiB0aGlzLl9pbnB1dCxcbiAgICAgICAgICAgIHl5OiB0aGlzLnl5LFxuICAgICAgICAgICAgY29uZGl0aW9uU3RhY2s6IHRoaXMuY29uZGl0aW9uU3RhY2suc2xpY2UoMCksXG4gICAgICAgICAgICBkb25lOiB0aGlzLmRvbmVcbiAgICAgICAgICB9O1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgICBiYWNrdXAueXlsbG9jLnJhbmdlID0gdGhpcy55eWxsb2MucmFuZ2Uuc2xpY2UoMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxpbmVzID0gbWF0Y2hbMF0ubWF0Y2goLyg/Olxcclxcbj98XFxuKS4qL2cpO1xuICAgICAgICBpZiAobGluZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGluZW5vICs9IGxpbmVzLmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnl5bGxvYyA9IHtcbiAgICAgICAgICBmaXJzdF9saW5lOiB0aGlzLnl5bGxvYy5sYXN0X2xpbmUsXG4gICAgICAgICAgbGFzdF9saW5lOiB0aGlzLnl5bGluZW5vICsgMSxcbiAgICAgICAgICBmaXJzdF9jb2x1bW46IHRoaXMueXlsbG9jLmxhc3RfY29sdW1uLFxuICAgICAgICAgIGxhc3RfY29sdW1uOiBsaW5lcyA/IGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdLmxlbmd0aCAtIGxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdLm1hdGNoKC9cXHI/XFxuPy8pWzBdLmxlbmd0aCA6IHRoaXMueXlsbG9jLmxhc3RfY29sdW1uICsgbWF0Y2hbMF0ubGVuZ3RoXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMueXl0ZXh0ICs9IG1hdGNoWzBdO1xuICAgICAgICB0aGlzLm1hdGNoICs9IG1hdGNoWzBdO1xuICAgICAgICB0aGlzLm1hdGNoZXMgPSBtYXRjaDtcbiAgICAgICAgdGhpcy55eWxlbmcgPSB0aGlzLnl5dGV4dC5sZW5ndGg7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2UgPSBbdGhpcy5vZmZzZXQsIHRoaXMub2Zmc2V0ICs9IHRoaXMueXlsZW5nXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9tb3JlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2JhY2t0cmFjayA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9pbnB1dCA9IHRoaXMuX2lucHV0LnNsaWNlKG1hdGNoWzBdLmxlbmd0aCk7XG4gICAgICAgIHRoaXMubWF0Y2hlZCArPSBtYXRjaFswXTtcbiAgICAgICAgdG9rZW4gPSB0aGlzLnBlcmZvcm1BY3Rpb24uY2FsbCh0aGlzLCB0aGlzLnl5LCB0aGlzLCBpbmRleGVkX3J1bGUsIHRoaXMuY29uZGl0aW9uU3RhY2tbdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxXSk7XG4gICAgICAgIGlmICh0aGlzLmRvbmUgJiYgdGhpcy5faW5wdXQpIHtcbiAgICAgICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmFja3RyYWNrKSB7XG4gICAgICAgICAgZm9yICh2YXIgayBpbiBiYWNrdXApIHtcbiAgICAgICAgICAgIHRoaXNba10gPSBiYWNrdXBba107XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LCBcInRlc3RfbWF0Y2hcIiksXG4gICAgICAvLyByZXR1cm4gbmV4dCBtYXRjaCBpbiBpbnB1dFxuICAgICAgbmV4dDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLkVPRjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuX2lucHV0KSB7XG4gICAgICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdG9rZW4sIG1hdGNoLCB0ZW1wTWF0Y2gsIGluZGV4O1xuICAgICAgICBpZiAoIXRoaXMuX21vcmUpIHtcbiAgICAgICAgICB0aGlzLnl5dGV4dCA9IFwiXCI7XG4gICAgICAgICAgdGhpcy5tYXRjaCA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJ1bGVzID0gdGhpcy5fY3VycmVudFJ1bGVzKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcnVsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0ZW1wTWF0Y2ggPSB0aGlzLl9pbnB1dC5tYXRjaCh0aGlzLnJ1bGVzW3J1bGVzW2ldXSk7XG4gICAgICAgICAgaWYgKHRlbXBNYXRjaCAmJiAoIW1hdGNoIHx8IHRlbXBNYXRjaFswXS5sZW5ndGggPiBtYXRjaFswXS5sZW5ndGgpKSB7XG4gICAgICAgICAgICBtYXRjaCA9IHRlbXBNYXRjaDtcbiAgICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFja3RyYWNrX2xleGVyKSB7XG4gICAgICAgICAgICAgIHRva2VuID0gdGhpcy50ZXN0X21hdGNoKHRlbXBNYXRjaCwgcnVsZXNbaV0pO1xuICAgICAgICAgICAgICBpZiAodG9rZW4gIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JhY2t0cmFjaykge1xuICAgICAgICAgICAgICAgIG1hdGNoID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLm9wdGlvbnMuZmxleCkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1hdGNoKSB7XG4gICAgICAgICAgdG9rZW4gPSB0aGlzLnRlc3RfbWF0Y2gobWF0Y2gsIHJ1bGVzW2luZGV4XSk7XG4gICAgICAgICAgaWYgKHRva2VuICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRva2VuO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2lucHV0ID09PSBcIlwiKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuRU9GO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLnBhcnNlRXJyb3IoXCJMZXhpY2FsIGVycm9yIG9uIGxpbmUgXCIgKyAodGhpcy55eWxpbmVubyArIDEpICsgXCIuIFVucmVjb2duaXplZCB0ZXh0LlxcblwiICsgdGhpcy5zaG93UG9zaXRpb24oKSwge1xuICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgIHRva2VuOiBudWxsLFxuICAgICAgICAgICAgbGluZTogdGhpcy55eWxpbmVub1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9LCBcIm5leHRcIiksXG4gICAgICAvLyByZXR1cm4gbmV4dCBtYXRjaCB0aGF0IGhhcyBhIHRva2VuXG4gICAgICBsZXg6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gbGV4KCkge1xuICAgICAgICB2YXIgciA9IHRoaXMubmV4dCgpO1xuICAgICAgICBpZiAocikge1xuICAgICAgICAgIHJldHVybiByO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmxleCgpO1xuICAgICAgICB9XG4gICAgICB9LCBcImxleFwiKSxcbiAgICAgIC8vIGFjdGl2YXRlcyBhIG5ldyBsZXhlciBjb25kaXRpb24gc3RhdGUgKHB1c2hlcyB0aGUgbmV3IGxleGVyIGNvbmRpdGlvbiBzdGF0ZSBvbnRvIHRoZSBjb25kaXRpb24gc3RhY2spXG4gICAgICBiZWdpbjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBiZWdpbihjb25kaXRpb24pIHtcbiAgICAgICAgdGhpcy5jb25kaXRpb25TdGFjay5wdXNoKGNvbmRpdGlvbik7XG4gICAgICB9LCBcImJlZ2luXCIpLFxuICAgICAgLy8gcG9wIHRoZSBwcmV2aW91c2x5IGFjdGl2ZSBsZXhlciBjb25kaXRpb24gc3RhdGUgb2ZmIHRoZSBjb25kaXRpb24gc3RhY2tcbiAgICAgIHBvcFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBvcFN0YXRlKCkge1xuICAgICAgICB2YXIgbiA9IHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMTtcbiAgICAgICAgaWYgKG4gPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uU3RhY2sucG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uU3RhY2tbMF07XG4gICAgICAgIH1cbiAgICAgIH0sIFwicG9wU3RhdGVcIiksXG4gICAgICAvLyBwcm9kdWNlIHRoZSBsZXhlciBydWxlIHNldCB3aGljaCBpcyBhY3RpdmUgZm9yIHRoZSBjdXJyZW50bHkgYWN0aXZlIGxleGVyIGNvbmRpdGlvbiBzdGF0ZVxuICAgICAgX2N1cnJlbnRSdWxlczogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBfY3VycmVudFJ1bGVzKCkge1xuICAgICAgICBpZiAodGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggJiYgdGhpcy5jb25kaXRpb25TdGFja1t0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uc1t0aGlzLmNvbmRpdGlvblN0YWNrW3RoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMV1dLnJ1bGVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvbnNbXCJJTklUSUFMXCJdLnJ1bGVzO1xuICAgICAgICB9XG4gICAgICB9LCBcIl9jdXJyZW50UnVsZXNcIiksXG4gICAgICAvLyByZXR1cm4gdGhlIGN1cnJlbnRseSBhY3RpdmUgbGV4ZXIgY29uZGl0aW9uIHN0YXRlOyB3aGVuIGFuIGluZGV4IGFyZ3VtZW50IGlzIHByb3ZpZGVkIGl0IHByb2R1Y2VzIHRoZSBOLXRoIHByZXZpb3VzIGNvbmRpdGlvbiBzdGF0ZSwgaWYgYXZhaWxhYmxlXG4gICAgICB0b3BTdGF0ZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiB0b3BTdGF0ZShuKSB7XG4gICAgICAgIG4gPSB0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDEgLSBNYXRoLmFicyhuIHx8IDApO1xuICAgICAgICBpZiAobiA+PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uU3RhY2tbbl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFwiSU5JVElBTFwiO1xuICAgICAgICB9XG4gICAgICB9LCBcInRvcFN0YXRlXCIpLFxuICAgICAgLy8gYWxpYXMgZm9yIGJlZ2luKGNvbmRpdGlvbilcbiAgICAgIHB1c2hTdGF0ZTogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwdXNoU3RhdGUoY29uZGl0aW9uKSB7XG4gICAgICAgIHRoaXMuYmVnaW4oY29uZGl0aW9uKTtcbiAgICAgIH0sIFwicHVzaFN0YXRlXCIpLFxuICAgICAgLy8gcmV0dXJuIHRoZSBudW1iZXIgb2Ygc3RhdGVzIGN1cnJlbnRseSBvbiB0aGUgc3RhY2tcbiAgICAgIHN0YXRlU3RhY2tTaXplOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHN0YXRlU3RhY2tTaXplKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGg7XG4gICAgICB9LCBcInN0YXRlU3RhY2tTaXplXCIpLFxuICAgICAgb3B0aW9uczogeyBcImNhc2UtaW5zZW5zaXRpdmVcIjogdHJ1ZSB9LFxuICAgICAgcGVyZm9ybUFjdGlvbjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBhbm9ueW1vdXMoeXksIHl5XywgJGF2b2lkaW5nX25hbWVfY29sbGlzaW9ucywgWVlfU1RBUlQpIHtcbiAgICAgICAgdmFyIFlZU1RBVEUgPSBZWV9TVEFSVDtcbiAgICAgICAgc3dpdGNoICgkYXZvaWRpbmdfbmFtZV9jb2xsaXNpb25zKSB7XG4gICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkudHJhY2UoXCJGb3VuZCBjb21tZW50XCIsIHl5Xy55eXRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIDY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICByZXR1cm4gODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJDTEFTU1wiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiAxNjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwiQmVnaW4gaWNvblwiKTtcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJJQ09OXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkudHJhY2UoXCJTUEFDRUxJTkVcIik7XG4gICAgICAgICAgICByZXR1cm4gNjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgIHJldHVybiA3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgcmV0dXJuIDE1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkudHJhY2UoXCJlbmQgaWNvblwiKTtcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcIkV4cGxvZGluZyBub2RlXCIpO1xuICAgICAgICAgICAgdGhpcy5iZWdpbihcIk5PREVcIik7XG4gICAgICAgICAgICByZXR1cm4gMTk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkudHJhY2UoXCJDbG91ZFwiKTtcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJOT0RFXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDE5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwiRXhwbG9zaW9uIEJhbmdcIik7XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiTk9ERVwiKTtcbiAgICAgICAgICAgIHJldHVybiAxOTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcIkNsb3VkIEJhbmdcIik7XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiTk9ERVwiKTtcbiAgICAgICAgICAgIHJldHVybiAxOTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTQ6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiTk9ERVwiKTtcbiAgICAgICAgICAgIHJldHVybiAxOTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiTk9ERVwiKTtcbiAgICAgICAgICAgIHJldHVybiAxOTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiTk9ERVwiKTtcbiAgICAgICAgICAgIHJldHVybiAxOTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiTk9ERVwiKTtcbiAgICAgICAgICAgIHJldHVybiAxOTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTg6XG4gICAgICAgICAgICByZXR1cm4gMTM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE5OlxuICAgICAgICAgICAgcmV0dXJuIDIyO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyMDpcbiAgICAgICAgICAgIHJldHVybiAxMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjE6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiTlNUUjJcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDIyOlxuICAgICAgICAgICAgcmV0dXJuIFwiTk9ERV9ERVNDUlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyMzpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjQ6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcIlN0YXJ0aW5nIE5TVFJcIik7XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiTlNUUlwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjU6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcImRlc2NyaXB0aW9uOlwiLCB5eV8ueXl0ZXh0KTtcbiAgICAgICAgICAgIHJldHVybiBcIk5PREVfREVTQ1JcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjY6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkudHJhY2UoXCJub2RlIGVuZCApKVwiKTtcbiAgICAgICAgICAgIHJldHVybiBcIk5PREVfREVORFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyODpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwibm9kZSBlbmQgKVwiKTtcbiAgICAgICAgICAgIHJldHVybiBcIk5PREVfREVORFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwibm9kZSBlbmQgLi4uXCIsIHl5Xy55eXRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIFwiTk9ERV9ERU5EXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDMwOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkudHJhY2UoXCJub2RlIGVuZCAoKFwiKTtcbiAgICAgICAgICAgIHJldHVybiBcIk5PREVfREVORFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzMTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwibm9kZSBlbmQgKC1cIik7XG4gICAgICAgICAgICByZXR1cm4gXCJOT0RFX0RFTkRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzI6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcIm5vZGUgZW5kICgtXCIpO1xuICAgICAgICAgICAgcmV0dXJuIFwiTk9ERV9ERU5EXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDMzOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkudHJhY2UoXCJub2RlIGVuZCAoKFwiKTtcbiAgICAgICAgICAgIHJldHVybiBcIk5PREVfREVORFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNDpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwibm9kZSBlbmQgKChcIik7XG4gICAgICAgICAgICByZXR1cm4gXCJOT0RFX0RFTkRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzU6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS50cmFjZShcIkxvbmcgZGVzY3JpcHRpb246XCIsIHl5Xy55eXRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIDIwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNjpcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLnRyYWNlKFwiTG9uZyBkZXNjcmlwdGlvbjpcIiwgeXlfLnl5dGV4dCk7XG4gICAgICAgICAgICByZXR1cm4gMjA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSwgXCJhbm9ueW1vdXNcIiksXG4gICAgICBydWxlczogWy9eKD86XFxzKiUlLiopL2ksIC9eKD86bWluZG1hcFxcYikvaSwgL14oPzo6OjopL2ksIC9eKD86LispL2ksIC9eKD86XFxuKS9pLCAvXig/Ojo6aWNvblxcKCkvaSwgL14oPzpbXFxzXStbXFxuXSkvaSwgL14oPzpbXFxuXSspL2ksIC9eKD86W15cXCldKykvaSwgL14oPzpcXCkpL2ksIC9eKD86LVxcKSkvaSwgL14oPzpcXCgtKS9pLCAvXig/OlxcKVxcKSkvaSwgL14oPzpcXCkpL2ksIC9eKD86XFwoXFwoKS9pLCAvXig/Olxce1xceykvaSwgL14oPzpcXCgpL2ksIC9eKD86XFxbKS9pLCAvXig/OltcXHNdKykvaSwgL14oPzpbXlxcKFxcW1xcblxcKVxce1xcfV0rKS9pLCAvXig/OiQpL2ksIC9eKD86W1wiXVtgXSkvaSwgL14oPzpbXmBcIl0rKS9pLCAvXig/OltgXVtcIl0pL2ksIC9eKD86W1wiXSkvaSwgL14oPzpbXlwiXSspL2ksIC9eKD86W1wiXSkvaSwgL14oPzpbXFwpXVxcKSkvaSwgL14oPzpbXFwpXSkvaSwgL14oPzpbXFxdXSkvaSwgL14oPzpcXH1cXH0pL2ksIC9eKD86XFwoLSkvaSwgL14oPzotXFwpKS9pLCAvXig/OlxcKFxcKCkvaSwgL14oPzpcXCgpL2ksIC9eKD86W15cXClcXF1cXChcXH1dKykvaSwgL14oPzouKyg/IVxcKFxcKCkpL2ldLFxuICAgICAgY29uZGl0aW9uczogeyBcIkNMQVNTXCI6IHsgXCJydWxlc1wiOiBbMywgNF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiSUNPTlwiOiB7IFwicnVsZXNcIjogWzgsIDldLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIk5TVFIyXCI6IHsgXCJydWxlc1wiOiBbMjIsIDIzXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJOU1RSXCI6IHsgXCJydWxlc1wiOiBbMjUsIDI2XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJOT0RFXCI6IHsgXCJydWxlc1wiOiBbMjEsIDI0LCAyNywgMjgsIDI5LCAzMCwgMzEsIDMyLCAzMywgMzQsIDM1LCAzNl0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiSU5JVElBTFwiOiB7IFwicnVsZXNcIjogWzAsIDEsIDIsIDUsIDYsIDcsIDEwLCAxMSwgMTIsIDEzLCAxNCwgMTUsIDE2LCAxNywgMTgsIDE5LCAyMF0sIFwiaW5jbHVzaXZlXCI6IHRydWUgfSB9XG4gICAgfTtcbiAgICByZXR1cm4gbGV4ZXIyO1xuICB9KSgpO1xuICBwYXJzZXIyLmxleGVyID0gbGV4ZXI7XG4gIGZ1bmN0aW9uIFBhcnNlcigpIHtcbiAgICB0aGlzLnl5ID0ge307XG4gIH1cbiAgX19uYW1lKFBhcnNlciwgXCJQYXJzZXJcIik7XG4gIFBhcnNlci5wcm90b3R5cGUgPSBwYXJzZXIyO1xuICBwYXJzZXIyLlBhcnNlciA9IFBhcnNlcjtcbiAgcmV0dXJuIG5ldyBQYXJzZXIoKTtcbn0pKCk7XG5wYXJzZXIucGFyc2VyID0gcGFyc2VyO1xudmFyIG1pbmRtYXBfZGVmYXVsdCA9IHBhcnNlcjtcblxuLy8gc3JjL2RpYWdyYW1zL21pbmRtYXAvbWluZG1hcERiLnRzXG5pbXBvcnQgeyB2NCB9IGZyb20gXCJ1dWlkXCI7XG5cbi8vIHNyYy9kaWFncmFtcy9taW5kbWFwL3N2Z0RyYXcudHNcbnZhciBNQVhfU0VDVElPTlMgPSAxMjtcblxuLy8gc3JjL2RpYWdyYW1zL21pbmRtYXAvbWluZG1hcERiLnRzXG52YXIgbm9kZVR5cGUgPSB7XG4gIERFRkFVTFQ6IDAsXG4gIE5PX0JPUkRFUjogMCxcbiAgUk9VTkRFRF9SRUNUOiAxLFxuICBSRUNUOiAyLFxuICBDSVJDTEU6IDMsXG4gIENMT1VEOiA0LFxuICBCQU5HOiA1LFxuICBIRVhBR09OOiA2XG59O1xudmFyIE1pbmRtYXBEQiA9IGNsYXNzIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5ub2RlcyA9IFtdO1xuICAgIHRoaXMuY291bnQgPSAwO1xuICAgIHRoaXMuZWxlbWVudHMgPSB7fTtcbiAgICB0aGlzLmdldExvZ2dlciA9IHRoaXMuZ2V0TG9nZ2VyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5ub2RlVHlwZSA9IG5vZGVUeXBlO1xuICAgIHRoaXMuY2xlYXIoKTtcbiAgICB0aGlzLmdldFR5cGUgPSB0aGlzLmdldFR5cGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLmdldEVsZW1lbnRCeUlkID0gdGhpcy5nZXRFbGVtZW50QnlJZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZ2V0UGFyZW50ID0gdGhpcy5nZXRQYXJlbnQuYmluZCh0aGlzKTtcbiAgICB0aGlzLmdldE1pbmRtYXAgPSB0aGlzLmdldE1pbmRtYXAuYmluZCh0aGlzKTtcbiAgICB0aGlzLmFkZE5vZGUgPSB0aGlzLmFkZE5vZGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLmRlY29yYXRlTm9kZSA9IHRoaXMuZGVjb3JhdGVOb2RlLmJpbmQodGhpcyk7XG4gIH1cbiAgc3RhdGljIHtcbiAgICBfX25hbWUodGhpcywgXCJNaW5kbWFwREJcIik7XG4gIH1cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5ub2RlcyA9IFtdO1xuICAgIHRoaXMuY291bnQgPSAwO1xuICAgIHRoaXMuZWxlbWVudHMgPSB7fTtcbiAgICB0aGlzLmJhc2VMZXZlbCA9IHZvaWQgMDtcbiAgfVxuICBnZXRQYXJlbnQobGV2ZWwpIHtcbiAgICBmb3IgKGxldCBpID0gdGhpcy5ub2Rlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgaWYgKHRoaXMubm9kZXNbaV0ubGV2ZWwgPCBsZXZlbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ub2Rlc1tpXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgZ2V0TWluZG1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5ub2Rlcy5sZW5ndGggPiAwID8gdGhpcy5ub2Rlc1swXSA6IG51bGw7XG4gIH1cbiAgYWRkTm9kZShsZXZlbCwgaWQsIGRlc2NyLCB0eXBlKSB7XG4gICAgbG9nLmluZm8oXCJhZGROb2RlXCIsIGxldmVsLCBpZCwgZGVzY3IsIHR5cGUpO1xuICAgIGxldCBpc1Jvb3QgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5ub2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuYmFzZUxldmVsID0gbGV2ZWw7XG4gICAgICBsZXZlbCA9IDA7XG4gICAgICBpc1Jvb3QgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAodGhpcy5iYXNlTGV2ZWwgIT09IHZvaWQgMCkge1xuICAgICAgbGV2ZWwgPSBsZXZlbCAtIHRoaXMuYmFzZUxldmVsO1xuICAgICAgaXNSb290ID0gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGNvbmYgPSBnZXRDb25maWcyKCk7XG4gICAgbGV0IHBhZGRpbmcgPSBjb25mLm1pbmRtYXA/LnBhZGRpbmcgPz8gZGVmYXVsdENvbmZpZ19kZWZhdWx0Lm1pbmRtYXAucGFkZGluZztcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgdGhpcy5ub2RlVHlwZS5ST1VOREVEX1JFQ1Q6XG4gICAgICBjYXNlIHRoaXMubm9kZVR5cGUuUkVDVDpcbiAgICAgIGNhc2UgdGhpcy5ub2RlVHlwZS5IRVhBR09OOlxuICAgICAgICBwYWRkaW5nICo9IDI7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjb25zdCBub2RlID0ge1xuICAgICAgaWQ6IHRoaXMuY291bnQrKyxcbiAgICAgIG5vZGVJZDogc2FuaXRpemVUZXh0KGlkLCBjb25mKSxcbiAgICAgIGxldmVsLFxuICAgICAgZGVzY3I6IHNhbml0aXplVGV4dChkZXNjciwgY29uZiksXG4gICAgICB0eXBlLFxuICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgd2lkdGg6IGNvbmYubWluZG1hcD8ubWF4Tm9kZVdpZHRoID8/IGRlZmF1bHRDb25maWdfZGVmYXVsdC5taW5kbWFwLm1heE5vZGVXaWR0aCxcbiAgICAgIHBhZGRpbmcsXG4gICAgICBpc1Jvb3RcbiAgICB9O1xuICAgIGNvbnN0IHBhcmVudCA9IHRoaXMuZ2V0UGFyZW50KGxldmVsKTtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICBwYXJlbnQuY2hpbGRyZW4ucHVzaChub2RlKTtcbiAgICAgIHRoaXMubm9kZXMucHVzaChub2RlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGlzUm9vdCkge1xuICAgICAgICB0aGlzLm5vZGVzLnB1c2gobm9kZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFRoZXJlIGNhbiBiZSBvbmx5IG9uZSByb290LiBObyBwYXJlbnQgY291bGQgYmUgZm91bmQgZm9yIChcIiR7bm9kZS5kZXNjcn1cIilgXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGdldFR5cGUoc3RhcnRTdHIsIGVuZFN0cikge1xuICAgIGxvZy5kZWJ1ZyhcIkluIGdldCB0eXBlXCIsIHN0YXJ0U3RyLCBlbmRTdHIpO1xuICAgIHN3aXRjaCAoc3RhcnRTdHIpIHtcbiAgICAgIGNhc2UgXCJbXCI6XG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVUeXBlLlJFQ1Q7XG4gICAgICBjYXNlIFwiKFwiOlxuICAgICAgICByZXR1cm4gZW5kU3RyID09PSBcIilcIiA/IHRoaXMubm9kZVR5cGUuUk9VTkRFRF9SRUNUIDogdGhpcy5ub2RlVHlwZS5DTE9VRDtcbiAgICAgIGNhc2UgXCIoKFwiOlxuICAgICAgICByZXR1cm4gdGhpcy5ub2RlVHlwZS5DSVJDTEU7XG4gICAgICBjYXNlIFwiKVwiOlxuICAgICAgICByZXR1cm4gdGhpcy5ub2RlVHlwZS5DTE9VRDtcbiAgICAgIGNhc2UgXCIpKVwiOlxuICAgICAgICByZXR1cm4gdGhpcy5ub2RlVHlwZS5CQU5HO1xuICAgICAgY2FzZSBcInt7XCI6XG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVUeXBlLkhFWEFHT047XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gdGhpcy5ub2RlVHlwZS5ERUZBVUxUO1xuICAgIH1cbiAgfVxuICBzZXRFbGVtZW50Rm9ySWQoaWQsIGVsZW1lbnQpIHtcbiAgICB0aGlzLmVsZW1lbnRzW2lkXSA9IGVsZW1lbnQ7XG4gIH1cbiAgZ2V0RWxlbWVudEJ5SWQoaWQpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50c1tpZF07XG4gIH1cbiAgZGVjb3JhdGVOb2RlKGRlY29yYXRpb24pIHtcbiAgICBpZiAoIWRlY29yYXRpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnMigpO1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLm5vZGVzW3RoaXMubm9kZXMubGVuZ3RoIC0gMV07XG4gICAgaWYgKGRlY29yYXRpb24uaWNvbikge1xuICAgICAgbm9kZS5pY29uID0gc2FuaXRpemVUZXh0KGRlY29yYXRpb24uaWNvbiwgY29uZmlnKTtcbiAgICB9XG4gICAgaWYgKGRlY29yYXRpb24uY2xhc3MpIHtcbiAgICAgIG5vZGUuY2xhc3MgPSBzYW5pdGl6ZVRleHQoZGVjb3JhdGlvbi5jbGFzcywgY29uZmlnKTtcbiAgICB9XG4gIH1cbiAgdHlwZTJTdHIodHlwZSkge1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSB0aGlzLm5vZGVUeXBlLkRFRkFVTFQ6XG4gICAgICAgIHJldHVybiBcIm5vLWJvcmRlclwiO1xuICAgICAgY2FzZSB0aGlzLm5vZGVUeXBlLlJFQ1Q6XG4gICAgICAgIHJldHVybiBcInJlY3RcIjtcbiAgICAgIGNhc2UgdGhpcy5ub2RlVHlwZS5ST1VOREVEX1JFQ1Q6XG4gICAgICAgIHJldHVybiBcInJvdW5kZWQtcmVjdFwiO1xuICAgICAgY2FzZSB0aGlzLm5vZGVUeXBlLkNJUkNMRTpcbiAgICAgICAgcmV0dXJuIFwiY2lyY2xlXCI7XG4gICAgICBjYXNlIHRoaXMubm9kZVR5cGUuQ0xPVUQ6XG4gICAgICAgIHJldHVybiBcImNsb3VkXCI7XG4gICAgICBjYXNlIHRoaXMubm9kZVR5cGUuQkFORzpcbiAgICAgICAgcmV0dXJuIFwiYmFuZ1wiO1xuICAgICAgY2FzZSB0aGlzLm5vZGVUeXBlLkhFWEFHT046XG4gICAgICAgIHJldHVybiBcImhleGdvblwiO1xuICAgICAgLy8gY3NwZWxsOiBkaXNhYmxlLWxpbmVcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBcIm5vLWJvcmRlclwiO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogQXNzaWduIHNlY3Rpb24gbnVtYmVycyB0byBub2RlcyBiYXNlZCBvbiB0aGVpciBwb3NpdGlvbiByZWxhdGl2ZSB0byByb290XG4gICAqIEBwYXJhbSBub2RlIC0gVGhlIG1pbmRtYXAgbm9kZSB0byBwcm9jZXNzXG4gICAqIEBwYXJhbSBzZWN0aW9uTnVtYmVyIC0gVGhlIHNlY3Rpb24gbnVtYmVyIHRvIGFzc2lnbiAodW5kZWZpbmVkIGZvciByb290KVxuICAgKi9cbiAgYXNzaWduU2VjdGlvbnMobm9kZSwgc2VjdGlvbk51bWJlcikge1xuICAgIGlmIChub2RlLmxldmVsID09PSAwKSB7XG4gICAgICBub2RlLnNlY3Rpb24gPSB2b2lkIDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGUuc2VjdGlvbiA9IHNlY3Rpb25OdW1iZXI7XG4gICAgfVxuICAgIGlmIChub2RlLmNoaWxkcmVuKSB7XG4gICAgICBmb3IgKGNvbnN0IFtpbmRleCwgY2hpbGRdIG9mIG5vZGUuY2hpbGRyZW4uZW50cmllcygpKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkU2VjdGlvbk51bWJlciA9IG5vZGUubGV2ZWwgPT09IDAgPyBpbmRleCAlIChNQVhfU0VDVElPTlMgLSAxKSA6IHNlY3Rpb25OdW1iZXI7XG4gICAgICAgIHRoaXMuYXNzaWduU2VjdGlvbnMoY2hpbGQsIGNoaWxkU2VjdGlvbk51bWJlcik7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBDb252ZXJ0IG1pbmRtYXAgdHJlZSBzdHJ1Y3R1cmUgdG8gZmxhdCBhcnJheSBvZiBub2Rlc1xuICAgKiBAcGFyYW0gbm9kZSAtIFRoZSBtaW5kbWFwIG5vZGUgdG8gcHJvY2Vzc1xuICAgKiBAcGFyYW0gcHJvY2Vzc2VkTm9kZXMgLSBBcnJheSB0byBjb2xsZWN0IHByb2Nlc3NlZCBub2Rlc1xuICAgKi9cbiAgZmxhdHRlbk5vZGVzKG5vZGUsIHByb2Nlc3NlZE5vZGVzKSB7XG4gICAgY29uc3QgY29uZiA9IGdldENvbmZpZzIoKTtcbiAgICBjb25zdCBjc3NDbGFzc2VzID0gW1wibWluZG1hcC1ub2RlXCJdO1xuICAgIGlmIChub2RlLmlzUm9vdCA9PT0gdHJ1ZSkge1xuICAgICAgY3NzQ2xhc3Nlcy5wdXNoKFwic2VjdGlvbi1yb290XCIsIFwic2VjdGlvbi0tMVwiKTtcbiAgICB9IGVsc2UgaWYgKG5vZGUuc2VjdGlvbiAhPT0gdm9pZCAwKSB7XG4gICAgICBjc3NDbGFzc2VzLnB1c2goYHNlY3Rpb24tJHtub2RlLnNlY3Rpb259YCk7XG4gICAgfVxuICAgIGlmIChub2RlLmNsYXNzKSB7XG4gICAgICBjc3NDbGFzc2VzLnB1c2gobm9kZS5jbGFzcyk7XG4gICAgfVxuICAgIGNvbnN0IGNsYXNzZXMgPSBjc3NDbGFzc2VzLmpvaW4oXCIgXCIpO1xuICAgIGNvbnN0IGdldFNoYXBlRnJvbVR5cGUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCh0eXBlKSA9PiB7XG4gICAgICBjb25zdCB0aGVtZSA9IGNvbmYudGhlbWU/LnRvTG93ZXJDYXNlKCkgPz8gXCJcIjtcbiAgICAgIGNvbnN0IGlzUmVkdXhUaGVtZSA9IHRoZW1lLmluY2x1ZGVzKFwicmVkdXhcIik7XG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSBub2RlVHlwZS5DSVJDTEU6XG4gICAgICAgICAgcmV0dXJuIFwibWluZG1hcENpcmNsZVwiO1xuICAgICAgICBjYXNlIG5vZGVUeXBlLlJFQ1Q6XG4gICAgICAgICAgcmV0dXJuIFwicmVjdFwiO1xuICAgICAgICBjYXNlIG5vZGVUeXBlLlJPVU5ERURfUkVDVDpcbiAgICAgICAgICByZXR1cm4gXCJyb3VuZGVkXCI7XG4gICAgICAgIGNhc2Ugbm9kZVR5cGUuQ0xPVUQ6XG4gICAgICAgICAgcmV0dXJuIFwiY2xvdWRcIjtcbiAgICAgICAgY2FzZSBub2RlVHlwZS5CQU5HOlxuICAgICAgICAgIHJldHVybiBcImJhbmdcIjtcbiAgICAgICAgY2FzZSBub2RlVHlwZS5IRVhBR09OOlxuICAgICAgICAgIHJldHVybiBcImhleGFnb25cIjtcbiAgICAgICAgY2FzZSBub2RlVHlwZS5ERUZBVUxUOlxuICAgICAgICAgIHJldHVybiBpc1JlZHV4VGhlbWUgPyBcInJvdW5kZWRcIiA6IFwiZGVmYXVsdE1pbmRtYXBOb2RlXCI7XG4gICAgICAgIGNhc2Ugbm9kZVR5cGUuTk9fQk9SREVSOlxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBcInJlY3RcIjtcbiAgICAgIH1cbiAgICB9LCBcImdldFNoYXBlRnJvbVR5cGVcIik7XG4gICAgY29uc3QgcHJvY2Vzc2VkTm9kZSA9IHtcbiAgICAgIGlkOiBub2RlLmlkLnRvU3RyaW5nKCksXG4gICAgICBkb21JZDogXCJub2RlX1wiICsgbm9kZS5pZC50b1N0cmluZygpLFxuICAgICAgbGFiZWw6IG5vZGUuZGVzY3IsXG4gICAgICBsYWJlbFR5cGU6IFwibWFya2Rvd25cIixcbiAgICAgIGlzR3JvdXA6IGZhbHNlLFxuICAgICAgc2hhcGU6IGdldFNoYXBlRnJvbVR5cGUobm9kZS50eXBlKSxcbiAgICAgIHdpZHRoOiBub2RlLndpZHRoLFxuICAgICAgaGVpZ2h0OiBub2RlLmhlaWdodCA/PyAwLFxuICAgICAgcGFkZGluZzogbm9kZS5wYWRkaW5nLFxuICAgICAgY3NzQ2xhc3NlczogY2xhc3NlcyxcbiAgICAgIGNzc1N0eWxlczogW10sXG4gICAgICBsb29rOiBjb25mLmxvb2ssXG4gICAgICBpY29uOiBub2RlLmljb24sXG4gICAgICB4OiBub2RlLngsXG4gICAgICB5OiBub2RlLnksXG4gICAgICAvLyBNaW5kbWFwLXNwZWNpZmljIHByb3BlcnRpZXNcbiAgICAgIGxldmVsOiBub2RlLmxldmVsLFxuICAgICAgbm9kZUlkOiBub2RlLm5vZGVJZCxcbiAgICAgIHR5cGU6IG5vZGUudHlwZSxcbiAgICAgIHNlY3Rpb246IG5vZGUuc2VjdGlvblxuICAgIH07XG4gICAgcHJvY2Vzc2VkTm9kZXMucHVzaChwcm9jZXNzZWROb2RlKTtcbiAgICBpZiAobm9kZS5jaGlsZHJlbikge1xuICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgIHRoaXMuZmxhdHRlbk5vZGVzKGNoaWxkLCBwcm9jZXNzZWROb2Rlcyk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBHZW5lcmF0ZSBlZGdlcyBmcm9tIHBhcmVudC1jaGlsZCByZWxhdGlvbnNoaXBzIGluIG1pbmRtYXAgdHJlZVxuICAgKiBAcGFyYW0gbm9kZSAtIFRoZSBtaW5kbWFwIG5vZGUgdG8gcHJvY2Vzc1xuICAgKiBAcGFyYW0gZWRnZXMgLSBBcnJheSB0byBjb2xsZWN0IGVkZ2VzXG4gICAqL1xuICBnZW5lcmF0ZUVkZ2VzKG5vZGUsIGVkZ2VzKSB7XG4gICAgaWYgKCFub2RlLmNoaWxkcmVuKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGNvbmYgPSBnZXRDb25maWcyKCk7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICBsZXQgZWRnZUNsYXNzZXMgPSBcImVkZ2VcIjtcbiAgICAgIGlmIChjaGlsZC5zZWN0aW9uICE9PSB2b2lkIDApIHtcbiAgICAgICAgZWRnZUNsYXNzZXMgKz0gYCBzZWN0aW9uLWVkZ2UtJHtjaGlsZC5zZWN0aW9ufWA7XG4gICAgICB9XG4gICAgICBjb25zdCBlZGdlRGVwdGggPSBub2RlLmxldmVsICsgMTtcbiAgICAgIGVkZ2VDbGFzc2VzICs9IGAgZWRnZS1kZXB0aC0ke2VkZ2VEZXB0aH1gO1xuICAgICAgY29uc3QgZWRnZSA9IHtcbiAgICAgICAgaWQ6IGBlZGdlXyR7bm9kZS5pZH1fJHtjaGlsZC5pZH1gLFxuICAgICAgICBzdGFydDogbm9kZS5pZC50b1N0cmluZygpLFxuICAgICAgICBlbmQ6IGNoaWxkLmlkLnRvU3RyaW5nKCksXG4gICAgICAgIHR5cGU6IFwibm9ybWFsXCIsXG4gICAgICAgIGN1cnZlOiBcImJhc2lzXCIsXG4gICAgICAgIHRoaWNrbmVzczogXCJub3JtYWxcIixcbiAgICAgICAgbG9vazogY29uZi5sb29rLFxuICAgICAgICBjbGFzc2VzOiBlZGdlQ2xhc3NlcyxcbiAgICAgICAgLy8gU3RvcmUgbWluZG1hcC1zcGVjaWZpYyBkYXRhXG4gICAgICAgIGRlcHRoOiBub2RlLmxldmVsLFxuICAgICAgICBzZWN0aW9uOiBjaGlsZC5zZWN0aW9uXG4gICAgICB9O1xuICAgICAgZWRnZXMucHVzaChlZGdlKTtcbiAgICAgIHRoaXMuZ2VuZXJhdGVFZGdlcyhjaGlsZCwgZWRnZXMpO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogR2V0IHN0cnVjdHVyZWQgZGF0YSBmb3IgbGF5b3V0IGFsZ29yaXRobXNcbiAgICogRm9sbG93aW5nIHRoZSBwYXR0ZXJuIGVzdGFibGlzaGVkIGJ5IEVSIGRpYWdyYW1zXG4gICAqIEByZXR1cm5zIFN0cnVjdHVyZWQgZGF0YSBjb250YWluaW5nIG5vZGVzLCBlZGdlcywgYW5kIGNvbmZpZ1xuICAgKi9cbiAgZ2V0RGF0YSgpIHtcbiAgICBjb25zdCBtaW5kbWFwUm9vdCA9IHRoaXMuZ2V0TWluZG1hcCgpO1xuICAgIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZzIoKTtcbiAgICBjb25zdCB1c2VyRGVmaW5lZENvbmZpZyA9IGdldFVzZXJEZWZpbmVkQ29uZmlnKCk7XG4gICAgY29uc3QgaGFzVXNlckRlZmluZWRMYXlvdXQgPSB1c2VyRGVmaW5lZENvbmZpZy5sYXlvdXQgIT09IHZvaWQgMDtcbiAgICBjb25zdCBmaW5hbENvbmZpZyA9IGNvbmZpZztcbiAgICBpZiAoIWhhc1VzZXJEZWZpbmVkTGF5b3V0KSB7XG4gICAgICBmaW5hbENvbmZpZy5sYXlvdXQgPSBcImNvc2UtYmlsa2VudFwiO1xuICAgIH1cbiAgICBpZiAoIW1pbmRtYXBSb290KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBub2RlczogW10sXG4gICAgICAgIGVkZ2VzOiBbXSxcbiAgICAgICAgY29uZmlnOiBmaW5hbENvbmZpZ1xuICAgICAgfTtcbiAgICB9XG4gICAgbG9nLmRlYnVnKFwiZ2V0RGF0YTogbWluZG1hcFJvb3RcIiwgbWluZG1hcFJvb3QsIGNvbmZpZyk7XG4gICAgdGhpcy5hc3NpZ25TZWN0aW9ucyhtaW5kbWFwUm9vdCk7XG4gICAgY29uc3QgcHJvY2Vzc2VkTm9kZXMgPSBbXTtcbiAgICBjb25zdCBwcm9jZXNzZWRFZGdlcyA9IFtdO1xuICAgIHRoaXMuZmxhdHRlbk5vZGVzKG1pbmRtYXBSb290LCBwcm9jZXNzZWROb2Rlcyk7XG4gICAgdGhpcy5nZW5lcmF0ZUVkZ2VzKG1pbmRtYXBSb290LCBwcm9jZXNzZWRFZGdlcyk7XG4gICAgbG9nLmRlYnVnKFxuICAgICAgYGdldERhdGE6IHByb2Nlc3NlZCAke3Byb2Nlc3NlZE5vZGVzLmxlbmd0aH0gbm9kZXMgYW5kICR7cHJvY2Vzc2VkRWRnZXMubGVuZ3RofSBlZGdlc2BcbiAgICApO1xuICAgIGNvbnN0IHNoYXBlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIHByb2Nlc3NlZE5vZGVzKSB7XG4gICAgICBzaGFwZXMuc2V0KG5vZGUuaWQsIHtcbiAgICAgICAgc2hhcGU6IG5vZGUuc2hhcGUsXG4gICAgICAgIHdpZHRoOiBub2RlLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IG5vZGUuaGVpZ2h0LFxuICAgICAgICBwYWRkaW5nOiBub2RlLnBhZGRpbmdcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgbm9kZXM6IHByb2Nlc3NlZE5vZGVzLFxuICAgICAgZWRnZXM6IHByb2Nlc3NlZEVkZ2VzLFxuICAgICAgY29uZmlnOiBmaW5hbENvbmZpZyxcbiAgICAgIC8vIFN0b3JlIHRoZSByb290IG5vZGUgZm9yIG1pbmRtYXAtc3BlY2lmaWMgbGF5b3V0IGFsZ29yaXRobXNcbiAgICAgIHJvb3ROb2RlOiBtaW5kbWFwUm9vdCxcbiAgICAgIC8vIFByb3BlcnRpZXMgcmVxdWlyZWQgYnkgZGFncmUgbGF5b3V0IGFsZ29yaXRobVxuICAgICAgbWFya2VyczogW1wicG9pbnRcIl0sXG4gICAgICAvLyBNaW5kbWFwcyBkb24ndCB1c2UgbWFya2Vyc1xuICAgICAgZGlyZWN0aW9uOiBcIlRCXCIsXG4gICAgICAvLyBUb3AtdG8tYm90dG9tIGRpcmVjdGlvbiBmb3IgbWluZG1hcHNcbiAgICAgIG5vZGVTcGFjaW5nOiA1MCxcbiAgICAgIC8vIERlZmF1bHQgc3BhY2luZyBiZXR3ZWVuIG5vZGVzXG4gICAgICByYW5rU3BhY2luZzogNTAsXG4gICAgICAvLyBEZWZhdWx0IHNwYWNpbmcgYmV0d2VlbiByYW5rc1xuICAgICAgLy8gQWRkIHNoYXBlcyBmb3IgRUxLIGNvbXBhdGliaWxpdHlcbiAgICAgIHNoYXBlczogT2JqZWN0LmZyb21FbnRyaWVzKHNoYXBlcyksXG4gICAgICAvLyBBZGRpdGlvbmFsIHByb3BlcnRpZXMgdGhhdCBsYXlvdXQgYWxnb3JpdGhtcyBtaWdodCBleHBlY3RcbiAgICAgIHR5cGU6IFwibWluZG1hcFwiLFxuICAgICAgZGlhZ3JhbUlkOiBcIm1pbmRtYXAtXCIgKyB2NCgpXG4gICAgfTtcbiAgfVxuICAvLyBFeHBvc2UgbG9nZ2VyIHRvIGdyYW1tYXJcbiAgZ2V0TG9nZ2VyKCkge1xuICAgIHJldHVybiBsb2c7XG4gIH1cbn07XG5cbi8vIHNyYy9kaWFncmFtcy9taW5kbWFwL21pbmRtYXBSZW5kZXJlci50c1xudmFyIGRyYXcgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGFzeW5jICh0ZXh0LCBpZCwgX3ZlcnNpb24sIGRpYWdPYmopID0+IHtcbiAgbG9nLmRlYnVnKFwiUmVuZGVyaW5nIG1pbmRtYXAgZGlhZ3JhbVxcblwiICsgdGV4dCk7XG4gIGNvbnN0IGRiID0gZGlhZ09iai5kYjtcbiAgY29uc3QgZGF0YTRMYXlvdXQgPSBkYi5nZXREYXRhKCk7XG4gIGNvbnN0IHN2ZyA9IGdldERpYWdyYW1FbGVtZW50KGlkLCBkYXRhNExheW91dC5jb25maWcuc2VjdXJpdHlMZXZlbCk7XG4gIGRhdGE0TGF5b3V0LnR5cGUgPSBkaWFnT2JqLnR5cGU7XG4gIGRhdGE0TGF5b3V0LmxheW91dEFsZ29yaXRobSA9IGdldFJlZ2lzdGVyZWRMYXlvdXRBbGdvcml0aG0oZGF0YTRMYXlvdXQuY29uZmlnLmxheW91dCwge1xuICAgIGZhbGxiYWNrOiBcImNvc2UtYmlsa2VudFwiXG4gIH0pO1xuICBkYXRhNExheW91dC5kaWFncmFtSWQgPSBpZDtcbiAgY29uc3QgbW0gPSBkYi5nZXRNaW5kbWFwKCk7XG4gIGlmICghbW0pIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZGF0YTRMYXlvdXQubm9kZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgIGlmIChub2RlLnNoYXBlID09PSBcInJvdW5kZWRcIikge1xuICAgICAgbm9kZS5yYWRpdXMgPSAxNTtcbiAgICAgIG5vZGUudGFwZXIgPSAxNTtcbiAgICAgIG5vZGUuc3Ryb2tlID0gXCJub25lXCI7XG4gICAgICBub2RlLndpZHRoID0gMDtcbiAgICAgIG5vZGUucGFkZGluZyA9IDE1O1xuICAgIH0gZWxzZSBpZiAobm9kZS5zaGFwZSA9PT0gXCJjaXJjbGVcIikge1xuICAgICAgbm9kZS5wYWRkaW5nID0gMTA7XG4gICAgfSBlbHNlIGlmIChub2RlLnNoYXBlID09PSBcInJlY3RcIikge1xuICAgICAgbm9kZS53aWR0aCA9IDA7XG4gICAgICBub2RlLnBhZGRpbmcgPSAxMDtcbiAgICB9IGVsc2UgaWYgKG5vZGUuc2hhcGUgPT09IFwiaGV4YWdvblwiKSB7XG4gICAgICBub2RlLndpZHRoID0gMDtcbiAgICAgIG5vZGUuaGVpZ2h0ID0gMDtcbiAgICB9XG4gIH0pO1xuICBhd2FpdCByZW5kZXIoZGF0YTRMYXlvdXQsIHN2Zyk7XG4gIGNvbnN0IHsgdGhlbWVWYXJpYWJsZXMgfSA9IGdldENvbmZpZygpO1xuICBjb25zdCB7IHVzZUdyYWRpZW50LCBncmFkaWVudFN0YXJ0LCBncmFkaWVudFN0b3AgfSA9IHRoZW1lVmFyaWFibGVzO1xuICBpZiAodXNlR3JhZGllbnQgJiYgZ3JhZGllbnRTdGFydCAmJiBncmFkaWVudFN0b3ApIHtcbiAgICBjb25zdCBzdmdJZCA9IHN2Zy5hdHRyKFwiaWRcIik7XG4gICAgY29uc3QgZ3JhZGllbnQgPSBzdmcuYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJsaW5lYXJHcmFkaWVudFwiKS5hdHRyKFwiaWRcIiwgYCR7c3ZnSWR9LWdyYWRpZW50YCkuYXR0cihcImdyYWRpZW50VW5pdHNcIiwgXCJvYmplY3RCb3VuZGluZ0JveFwiKS5hdHRyKFwieDFcIiwgXCIwJVwiKS5hdHRyKFwieTFcIiwgXCIwJVwiKS5hdHRyKFwieDJcIiwgXCIxMDAlXCIpLmF0dHIoXCJ5MlwiLCBcIjAlXCIpO1xuICAgIGdyYWRpZW50LmFwcGVuZChcInN0b3BcIikuYXR0cihcIm9mZnNldFwiLCBcIjAlXCIpLmF0dHIoXCJzdG9wLWNvbG9yXCIsIGdyYWRpZW50U3RhcnQpLmF0dHIoXCJzdG9wLW9wYWNpdHlcIiwgMSk7XG4gICAgZ3JhZGllbnQuYXBwZW5kKFwic3RvcFwiKS5hdHRyKFwib2Zmc2V0XCIsIFwiMTAwJVwiKS5hdHRyKFwic3RvcC1jb2xvclwiLCBncmFkaWVudFN0b3ApLmF0dHIoXCJzdG9wLW9wYWNpdHlcIiwgMSk7XG4gIH1cbiAgc2V0dXBWaWV3UG9ydEZvclNWRyhcbiAgICBzdmcsXG4gICAgZGF0YTRMYXlvdXQuY29uZmlnLm1pbmRtYXA/LnBhZGRpbmcgPz8gZGVmYXVsdENvbmZpZ19kZWZhdWx0Lm1pbmRtYXAucGFkZGluZyxcbiAgICBcIm1pbmRtYXBEaWFncmFtXCIsXG4gICAgZGF0YTRMYXlvdXQuY29uZmlnLm1pbmRtYXA/LnVzZU1heFdpZHRoID8/IGRlZmF1bHRDb25maWdfZGVmYXVsdC5taW5kbWFwLnVzZU1heFdpZHRoXG4gICk7XG59LCBcImRyYXdcIik7XG52YXIgbWluZG1hcFJlbmRlcmVyX2RlZmF1bHQgPSB7XG4gIGRyYXdcbn07XG5cbi8vIHNyYy9kaWFncmFtcy9taW5kbWFwL3N0eWxlcy50c1xuaW1wb3J0IHsgZGFya2VuLCBsaWdodGVuLCBpc0RhcmsgfSBmcm9tIFwia2hyb21hXCI7XG52YXIgZ2VuU2VjdGlvbnMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChvcHRpb25zKSA9PiB7XG4gIGNvbnN0IHsgdGhlbWUsIGxvb2sgfSA9IG9wdGlvbnM7XG4gIGxldCBzZWN0aW9ucyA9IFwiXCI7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgb3B0aW9ucy5USEVNRV9DT0xPUl9MSU1JVDsgaSsrKSB7XG4gICAgb3B0aW9uc1tcImxpbmVDb2xvclwiICsgaV0gPSBvcHRpb25zW1wibGluZUNvbG9yXCIgKyBpXSB8fCBvcHRpb25zW1wiY1NjYWxlSW52XCIgKyBpXTtcbiAgICBpZiAoaXNEYXJrKG9wdGlvbnNbXCJsaW5lQ29sb3JcIiArIGldKSkge1xuICAgICAgb3B0aW9uc1tcImxpbmVDb2xvclwiICsgaV0gPSBsaWdodGVuKG9wdGlvbnNbXCJsaW5lQ29sb3JcIiArIGldLCAyMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdGlvbnNbXCJsaW5lQ29sb3JcIiArIGldID0gZGFya2VuKG9wdGlvbnNbXCJsaW5lQ29sb3JcIiArIGldLCAyMCk7XG4gICAgfVxuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgb3B0aW9ucy5USEVNRV9DT0xPUl9MSU1JVDsgaSsrKSB7XG4gICAgY29uc3Qgc3cgPSBcIlwiICsgKGxvb2sgPT09IFwibmVvXCIgPyBNYXRoLm1heCgxMCAtIChpIC0gMSkgKiAyLCAyKSA6IDE3IC0gMyAqIGkpO1xuICAgIHNlY3Rpb25zICs9IGBcbiAgICAuc2VjdGlvbi0ke2kgLSAxfSByZWN0LCAuc2VjdGlvbi0ke2kgLSAxfSBwYXRoLCAuc2VjdGlvbi0ke2kgLSAxfSBjaXJjbGUsIC5zZWN0aW9uLSR7aSAtIDF9IHBvbHlnb24sIC5zZWN0aW9uLSR7aSAtIDF9IHBhdGggIHtcbiAgICAgIGZpbGw6ICR7b3B0aW9uc1tcImNTY2FsZVwiICsgaV19O1xuICAgIH1cbiAgICAuc2VjdGlvbi0ke2kgLSAxfSB0ZXh0IHtcbiAgICAgZmlsbDogJHtvcHRpb25zW1wiY1NjYWxlTGFiZWxcIiArIGldfTtcbiAgICB9XG4gICAgIC5zZWN0aW9uLSR7aSAtIDF9IHNwYW4ge1xuICAgICBjb2xvcjogJHtvcHRpb25zW1wiY1NjYWxlTGFiZWxcIiArIGldfTtcbiAgICB9XG4gICAgLm5vZGUtaWNvbi0ke2kgLSAxfSB7XG4gICAgICBmb250LXNpemU6IDQwcHg7XG4gICAgICBjb2xvcjogJHtvcHRpb25zW1wiY1NjYWxlTGFiZWxcIiArIGldfTtcbiAgICB9XG4gICAgLnNlY3Rpb24tZWRnZS0ke2kgLSAxfXtcbiAgICAgIHN0cm9rZTogJHtvcHRpb25zW1wiY1NjYWxlXCIgKyBpXX07XG4gICAgfVxuICAgIC5lZGdlLWRlcHRoLSR7aSAtIDF9e1xuICAgICAgc3Ryb2tlLXdpZHRoOiAke3N3fTtcbiAgICB9XG4gICAgLnNlY3Rpb24tJHtpIC0gMX0gbGluZSB7XG4gICAgICBzdHJva2U6ICR7b3B0aW9uc1tcImNTY2FsZUludlwiICsgaV19IDtcbiAgICAgIHN0cm9rZS13aWR0aDogMztcbiAgICB9XG5cbiAgICAuZGlzYWJsZWQsIC5kaXNhYmxlZCBjaXJjbGUsIC5kaXNhYmxlZCB0ZXh0IHtcbiAgICAgIGZpbGw6IGxpZ2h0Z3JheTtcbiAgICB9XG4gICAgLmRpc2FibGVkIHRleHQge1xuICAgICAgZmlsbDogI2VmZWZlZjtcbiAgICB9XG4gICAgW2RhdGEtbG9vaz1cIm5lb1wiXS5taW5kbWFwLW5vZGUuc2VjdGlvbi0ke2kgLSAxfSByZWN0LCBbZGF0YS1sb29rPVwibmVvXCJdLm1pbmRtYXAtbm9kZS5zZWN0aW9uLSR7aSAtIDF9IHBhdGgsIFtkYXRhLWxvb2s9XCJuZW9cIl0ubWluZG1hcC1ub2RlLnNlY3Rpb24tJHtpIC0gMX0gY2lyY2xlLCBbZGF0YS1sb29rPVwibmVvXCJdLm1pbmRtYXAtbm9kZS5zZWN0aW9uLSR7aSAtIDF9IHBvbHlnb24ge1xuICAgICAgZmlsbDogJHt0aGVtZSA9PT0gXCJyZWR1eFwiIHx8IHRoZW1lID09PSBcInJlZHV4LWRhcmtcIiB8fCB0aGVtZSA9PT0gXCJuZXV0cmFsXCIgPyBvcHRpb25zLm1haW5Ca2cgOiBvcHRpb25zW1wiY1NjYWxlXCIgKyBpXX07XG4gICAgICBzdHJva2U6ICR7dGhlbWUgPT09IFwicmVkdXhcIiB8fCB0aGVtZSA9PT0gXCJyZWR1eC1kYXJrXCIgPyBvcHRpb25zLm5vZGVCb3JkZXIgOiBvcHRpb25zW1wiY1NjYWxlXCIgKyBpXX07XG4gICAgICBzdHJva2Utd2lkdGg6ICR7b3B0aW9ucy5zdHJva2VXaWR0aCA/PyAyfXB4O1xuICAgIH1cbiAgICBbZGF0YS1sb29rPVwibmVvXCJdLnNlY3Rpb24tZWRnZS0ke2kgLSAxfXtcbiAgICAgIHN0cm9rZTogJHt0aGVtZT8uaW5jbHVkZXMoXCJyZWR1eFwiKSB8fCB0aGVtZSA9PT0gXCJuZW8tZGFya1wiID8gb3B0aW9ucy5ub2RlQm9yZGVyIDogb3B0aW9uc1tcImNTY2FsZVwiICsgaV19O1xuICAgIH1cbiAgICBbZGF0YS1sb29rPVwibmVvXCJdLm1pbmRtYXAtbm9kZS5zZWN0aW9uLSR7aSAtIDF9IHRleHQge1xuICAgICBmaWxsOiAke3RoZW1lID09PSBcInJlZHV4XCIgfHwgdGhlbWUgPT09IFwicmVkdXgtZGFya1wiID8gb3B0aW9ucy5ub2RlQm9yZGVyIDogb3B0aW9uc1tcImNTY2FsZUxhYmVsXCIgKyAodGhlbWUgPT09IFwibmV1dHJhbFwiID8gMSA6IGkpXX07XG4gICAgfVxuICAgIGA7XG4gIH1cbiAgcmV0dXJuIHNlY3Rpb25zO1xufSwgXCJnZW5TZWN0aW9uc1wiKTtcbnZhciBnZW5HcmFkaWVudCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKFRIRU1FX0NPTE9SX0xJTUlULCBzdmdJZCwgbWFpbkJrZykgPT4ge1xuICBsZXQgc2VjdGlvbnMgPSBcIlwiO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IFRIRU1FX0NPTE9SX0xJTUlUOyBpKyspIHtcbiAgICBzZWN0aW9ucyArPSBgXG4gICAgW2RhdGEtbG9vaz1cIm5lb1wiXS5taW5kbWFwLW5vZGUuc2VjdGlvbi0ke2kgLSAxfSByZWN0LCBbZGF0YS1sb29rPVwibmVvXCJdLm1pbmRtYXAtbm9kZS5zZWN0aW9uLSR7aSAtIDF9IHBhdGgsIFtkYXRhLWxvb2s9XCJuZW9cIl0ubWluZG1hcC1ub2RlLnNlY3Rpb24tJHtpIC0gMX0gY2lyY2xlLCBbZGF0YS1sb29rPVwibmVvXCJdLm1pbmRtYXAtbm9kZS5zZWN0aW9uLSR7aSAtIDF9IHBvbHlnb24ge1xuICAgICAgc3Ryb2tlOiB1cmwoJHtzdmdJZH0tZ3JhZGllbnQpO1xuICAgICAgZmlsbDogJHttYWluQmtnfTtcbiAgICB9XG4gICAgLnNlY3Rpb24tJHtpIC0gMX0gbGluZSB7XG4gICAgICBzdHJva2Utd2lkdGg6IDA7XG4gICAgfWA7XG4gIH1cbiAgcmV0dXJuIHNlY3Rpb25zO1xufSwgXCJnZW5HcmFkaWVudFwiKTtcbnZhciBnZXRTdHlsZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChvcHRpb25zKSA9PiB7XG4gIGNvbnN0IHsgdGhlbWUgfSA9IG9wdGlvbnM7XG4gIGNvbnN0IHN2Z0lkID0gb3B0aW9ucy5zdmdJZDtcbiAgY29uc3Qgc2NvcGVkRHJvcFNoYWRvdyA9IG9wdGlvbnMuZHJvcFNoYWRvdyA/IG9wdGlvbnMuZHJvcFNoYWRvdy5yZXBsYWNlKFwidXJsKCNkcm9wLXNoYWRvdylcIiwgYHVybCgke3N2Z0lkfS1kcm9wLXNoYWRvdylgKSA6IFwibm9uZVwiO1xuICByZXR1cm4gYFxuICAuZWRnZSB7XG4gICAgc3Ryb2tlLXdpZHRoOiAzO1xuICB9XG4gICR7Z2VuU2VjdGlvbnMob3B0aW9ucyl9XG4gIC5zZWN0aW9uLXJvb3QgcmVjdCwgLnNlY3Rpb24tcm9vdCBwYXRoLCAuc2VjdGlvbi1yb290IGNpcmNsZSwgLnNlY3Rpb24tcm9vdCBwb2x5Z29uICB7XG4gICAgZmlsbDogJHtvcHRpb25zLmdpdDB9O1xuICB9XG4gIC5zZWN0aW9uLXJvb3QgdGV4dCB7XG4gICAgZmlsbDogJHtvcHRpb25zLmdpdEJyYW5jaExhYmVsMH07XG4gIH1cbiAgLnNlY3Rpb24tcm9vdCBzcGFuIHtcbiAgICBjb2xvcjogJHt0aGVtZT8uaW5jbHVkZXMoXCJyZWR1eFwiKSA/IG9wdGlvbnMubm9kZUJvcmRlciA6IG9wdGlvbnMuZ2l0QnJhbmNoTGFiZWwwfTtcbiAgfVxuICAuaWNvbi1jb250YWluZXIge1xuICAgIGhlaWdodDoxMDAlO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgfVxuICAuZWRnZSB7XG4gICAgZmlsbDogbm9uZTtcbiAgfVxuICAubWluZG1hcC1ub2RlLWxhYmVsIHtcbiAgICBkeTogMWVtO1xuICAgIGFsaWdubWVudC1iYXNlbGluZTogbWlkZGxlO1xuICAgIHRleHQtYW5jaG9yOiBtaWRkbGU7XG4gICAgZG9taW5hbnQtYmFzZWxpbmU6IG1pZGRsZTtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIH1cbiAgW2RhdGEtbG9vaz1cIm5lb1wiXS5taW5kbWFwLW5vZGUgIHtcbiAgICBmaWx0ZXI6ICR7c2NvcGVkRHJvcFNoYWRvd307XG4gIH1cbiAgW2RhdGEtbG9vaz1cIm5lb1wiXS5taW5kbWFwLW5vZGUuc2VjdGlvbi1yb290IHJlY3QsIFtkYXRhLWxvb2s9XCJuZW9cIl0ubWluZG1hcC1ub2RlLnNlY3Rpb24tcm9vdCBwYXRoLCBbZGF0YS1sb29rPVwibmVvXCJdLm1pbmRtYXAtbm9kZS5zZWN0aW9uLXJvb3QgY2lyY2xlLCBbZGF0YS1sb29rPVwibmVvXCJdLm1pbmRtYXAtbm9kZS5zZWN0aW9uLXJvb3QgcG9seWdvbiAge1xuICAgIGZpbGw6ICR7dGhlbWU/LmluY2x1ZGVzKFwicmVkdXhcIikgPyBvcHRpb25zLm1haW5Ca2cgOiBvcHRpb25zLmdpdDB9O1xuICB9XG4gIFtkYXRhLWxvb2s9XCJuZW9cIl0ubWluZG1hcC1ub2RlLnNlY3Rpb24tcm9vdCAudGV4dC1pbm5lci10c3BhbiB7XG4gICAgZmlsbDogICR7dGhlbWU/LmluY2x1ZGVzKFwicmVkdXhcIikgPyBvcHRpb25zLm5vZGVCb3JkZXIgOiBvcHRpb25zW1wiY1NjYWxlTGFiZWxcIiArICh0aGVtZSA9PT0gXCJuZXV0cmFsXCIgPyAxIDogMCldfTtcbiAgfVxuICAke29wdGlvbnMudXNlR3JhZGllbnQgJiYgc3ZnSWQgJiYgb3B0aW9ucy5tYWluQmtnID8gZ2VuR3JhZGllbnQob3B0aW9ucy5USEVNRV9DT0xPUl9MSU1JVCwgc3ZnSWQsIG9wdGlvbnMubWFpbkJrZykgOiBcIlwifVxuYDtcbn0sIFwiZ2V0U3R5bGVzXCIpO1xudmFyIHN0eWxlc19kZWZhdWx0ID0gZ2V0U3R5bGVzO1xuXG4vLyBzcmMvZGlhZ3JhbXMvbWluZG1hcC9taW5kbWFwLWRlZmluaXRpb24udHNcbnZhciBkaWFncmFtID0ge1xuICBnZXQgZGIoKSB7XG4gICAgcmV0dXJuIG5ldyBNaW5kbWFwREIoKTtcbiAgfSxcbiAgcmVuZGVyZXI6IG1pbmRtYXBSZW5kZXJlcl9kZWZhdWx0LFxuICBwYXJzZXI6IG1pbmRtYXBfZGVmYXVsdCxcbiAgc3R5bGVzOiBzdHlsZXNfZGVmYXVsdFxufTtcbmV4cG9ydCB7XG4gIGRpYWdyYW1cbn07XG4iCiAgXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBQU0sUUFBUSxJQUFJLFdBQVcsRUFBRTtBQUMvQixTQUF3QixHQUFHLEdBQUc7QUFBQSxFQUMxQixPQUFPLE9BQU8sZ0JBQWdCLEtBQUs7QUFBQTs7O0FDRHZDLElBQU0sWUFBWSxDQUFDO0FBQ25CLFNBQVMsSUFBSSxFQUFHLElBQUksS0FBSyxFQUFFLEdBQUc7QUFBQSxFQUMxQixVQUFVLE1BQU0sSUFBSSxLQUFPLFNBQVMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3BEO0FBQ08sU0FBUyxlQUFlLENBQUMsS0FBSyxTQUFTLEdBQUc7QUFBQSxFQUM3QyxRQUFRLFVBQVUsSUFBSSxTQUFTLE1BQzNCLFVBQVUsSUFBSSxTQUFTLE1BQ3ZCLFVBQVUsSUFBSSxTQUFTLE1BQ3ZCLFVBQVUsSUFBSSxTQUFTLE1BQ3ZCLE1BQ0EsVUFBVSxJQUFJLFNBQVMsTUFDdkIsVUFBVSxJQUFJLFNBQVMsTUFDdkIsTUFDQSxVQUFVLElBQUksU0FBUyxNQUN2QixVQUFVLElBQUksU0FBUyxNQUN2QixNQUNBLFVBQVUsSUFBSSxTQUFTLE1BQ3ZCLFVBQVUsSUFBSSxTQUFTLE1BQ3ZCLE1BQ0EsVUFBVSxJQUFJLFNBQVMsT0FDdkIsVUFBVSxJQUFJLFNBQVMsT0FDdkIsVUFBVSxJQUFJLFNBQVMsT0FDdkIsVUFBVSxJQUFJLFNBQVMsT0FDdkIsVUFBVSxJQUFJLFNBQVMsT0FDdkIsVUFBVSxJQUFJLFNB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SSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksSUFB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
