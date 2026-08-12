import {
  selectSvgElement
} from "./chunk-main-f3t3xmmb.js";
import {
  parseFontSize
} from "./chunk-main-vvfzntzy.js";
import"./chunk-main-ck580f0k.js";
import {
  clear,
  commonDb_exports,
  darken_default,
  getConfig,
  getConfig2,
  is_dark_default,
  lighten_default,
  setupGraphViewbox
} from "./chunk-main-aws590jt.js";
import {
  __export,
  __name,
  arc_default,
  log,
  select_default
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/timeline-definition-PNZ67QCA.mjs
var parser = function() {
  var o = /* @__PURE__ */ __name(function(k, v, o2, l) {
    for (o2 = o2 || {}, l = k.length;l--; o2[k[l]] = v)
      ;
    return o2;
  }, "o"), $V0 = [6, 11, 13, 14, 15, 17, 19, 20, 23, 24], $V1 = [1, 12], $V2 = [1, 13], $V3 = [1, 14], $V4 = [1, 15], $V5 = [1, 16], $V6 = [1, 19], $V7 = [1, 20];
  var parser2 = {
    trace: /* @__PURE__ */ __name(function trace() {}, "trace"),
    yy: {},
    symbols_: { error: 2, start: 3, timeline_header: 4, document: 5, EOF: 6, timeline: 7, timeline_lr: 8, timeline_td: 9, line: 10, SPACE: 11, statement: 12, NEWLINE: 13, title: 14, acc_title: 15, acc_title_value: 16, acc_descr: 17, acc_descr_value: 18, acc_descr_multiline_value: 19, section: 20, period_statement: 21, event_statement: 22, period: 23, event: 24, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 6: "EOF", 7: "timeline", 8: "timeline_lr", 9: "timeline_td", 11: "SPACE", 13: "NEWLINE", 14: "title", 15: "acc_title", 16: "acc_title_value", 17: "acc_descr", 18: "acc_descr_value", 19: "acc_descr_multiline_value", 20: "section", 23: "period", 24: "event" },
    productions_: [0, [3, 3], [4, 1], [4, 1], [4, 1], [5, 0], [5, 2], [10, 2], [10, 1], [10, 1], [10, 1], [12, 1], [12, 2], [12, 2], [12, 1], [12, 1], [12, 1], [12, 1], [21, 1], [22, 1]],
    performAction: /* @__PURE__ */ __name(function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
      var $0 = $$.length - 1;
      switch (yystate) {
        case 1:
          return $$[$0 - 1];
          break;
        case 3:
          yy.setDirection("LR");
          break;
        case 4:
          yy.setDirection("TD");
          break;
        case 5:
          this.$ = [];
          break;
        case 6:
          $$[$0 - 1].push($$[$0]);
          this.$ = $$[$0 - 1];
          break;
        case 7:
        case 8:
          this.$ = $$[$0];
          break;
        case 9:
        case 10:
          this.$ = [];
          break;
        case 11:
          yy.getCommonDb().setDiagramTitle($$[$0].substr(6));
          this.$ = $$[$0].substr(6);
          break;
        case 12:
          this.$ = $$[$0].trim();
          yy.getCommonDb().setAccTitle(this.$);
          break;
        case 13:
        case 14:
          this.$ = $$[$0].trim();
          yy.getCommonDb().setAccDescription(this.$);
          break;
        case 15:
          yy.addSection($$[$0].substr(8));
          this.$ = $$[$0].substr(8);
          break;
        case 18:
          yy.addTask($$[$0], 0, "");
          this.$ = $$[$0];
          break;
        case 19:
          yy.addEvent($$[$0].substr(2));
          this.$ = $$[$0];
          break;
      }
    }, "anonymous"),
    table: [{ 3: 1, 4: 2, 7: [1, 3], 8: [1, 4], 9: [1, 5] }, { 1: [3] }, o($V0, [2, 5], { 5: 6 }), o($V0, [2, 2]), o($V0, [2, 3]), o($V0, [2, 4]), { 6: [1, 7], 10: 8, 11: [1, 9], 12: 10, 13: [1, 11], 14: $V1, 15: $V2, 17: $V3, 19: $V4, 20: $V5, 21: 17, 22: 18, 23: $V6, 24: $V7 }, o($V0, [2, 10], { 1: [2, 1] }), o($V0, [2, 6]), { 12: 21, 14: $V1, 15: $V2, 17: $V3, 19: $V4, 20: $V5, 21: 17, 22: 18, 23: $V6, 24: $V7 }, o($V0, [2, 8]), o($V0, [2, 9]), o($V0, [2, 11]), { 16: [1, 22] }, { 18: [1, 23] }, o($V0, [2, 14]), o($V0, [2, 15]), o($V0, [2, 16]), o($V0, [2, 17]), o($V0, [2, 18]), o($V0, [2, 19]), o($V0, [2, 7]), o($V0, [2, 12]), o($V0, [2, 13])],
    defaultActions: {},
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
            return 13;
            break;
          case 3:
            break;
          case 4:
            break;
          case 5:
            return 8;
            break;
          case 6:
            return 9;
            break;
          case 7:
            return 7;
            break;
          case 8:
            return 14;
            break;
          case 9:
            this.begin("acc_title");
            return 15;
            break;
          case 10:
            this.popState();
            return "acc_title_value";
            break;
          case 11:
            this.begin("acc_descr");
            return 17;
            break;
          case 12:
            this.popState();
            return "acc_descr_value";
            break;
          case 13:
            this.begin("acc_descr_multiline");
            break;
          case 14:
            this.popState();
            break;
          case 15:
            return "acc_descr_multiline_value";
            break;
          case 16:
            return 20;
            break;
          case 17:
            return 24;
            break;
          case 18:
            return 23;
            break;
          case 19:
            return 6;
            break;
          case 20:
            return "INVALID";
            break;
        }
      }, "anonymous"),
      rules: [/^(?:%(?!\{)[^\n]*)/i, /^(?:[^\}]%%[^\n]*)/i, /^(?:[\n]+)/i, /^(?:\s+)/i, /^(?:#[^\n]*)/i, /^(?:timeline[ \t]+LR\b)/i, /^(?:timeline[ \t]+TD\b)/i, /^(?:timeline\b)/i, /^(?:title\s[^\n]+)/i, /^(?:accTitle\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*\{\s*)/i, /^(?:[\}])/i, /^(?:[^\}]*)/i, /^(?:section\s[^:\n]+)/i, /^(?::\s(?:[^:\n]|:(?!\s))+)/i, /^(?:[^#:\n]+)/i, /^(?:$)/i, /^(?:.)/i],
      conditions: { acc_descr_multiline: { rules: [14, 15], inclusive: false }, acc_descr: { rules: [12], inclusive: false }, acc_title: { rules: [10], inclusive: false }, INITIAL: { rules: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 13, 16, 17, 18, 19, 20], inclusive: true } }
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
var timeline_default = parser;
var timelineDb_exports = {};
__export(timelineDb_exports, {
  addEvent: () => addEvent,
  addSection: () => addSection,
  addTask: () => addTask,
  addTaskOrg: () => addTaskOrg,
  clear: () => clear2,
  default: () => timelineDb_default,
  getCommonDb: () => getCommonDb,
  getDirection: () => getDirection,
  getSections: () => getSections,
  getTasks: () => getTasks,
  setDirection: () => setDirection
});
var currentSection = "";
var currentTaskId = 0;
var direction = "LR";
var sections = [];
var tasks = [];
var rawTasks = [];
var getCommonDb = /* @__PURE__ */ __name(() => commonDb_exports, "getCommonDb");
var clear2 = /* @__PURE__ */ __name(function() {
  sections.length = 0;
  tasks.length = 0;
  currentSection = "";
  rawTasks.length = 0;
  direction = "LR";
  clear();
}, "clear");
var setDirection = /* @__PURE__ */ __name(function(dir) {
  direction = dir;
}, "setDirection");
var getDirection = /* @__PURE__ */ __name(function() {
  return direction;
}, "getDirection");
var addSection = /* @__PURE__ */ __name(function(txt) {
  currentSection = txt;
  sections.push(txt);
}, "addSection");
var getSections = /* @__PURE__ */ __name(function() {
  return sections;
}, "getSections");
var getTasks = /* @__PURE__ */ __name(function() {
  let allItemsProcessed = compileTasks();
  const maxDepth = 100;
  let iterationCount = 0;
  while (!allItemsProcessed && iterationCount < maxDepth) {
    allItemsProcessed = compileTasks();
    iterationCount++;
  }
  tasks.push(...rawTasks);
  return tasks;
}, "getTasks");
var addTask = /* @__PURE__ */ __name(function(period, length, event) {
  const rawTask = {
    id: currentTaskId++,
    section: currentSection,
    type: currentSection,
    task: period,
    score: length ? length : 0,
    events: event ? [event] : []
  };
  rawTasks.push(rawTask);
}, "addTask");
var addEvent = /* @__PURE__ */ __name(function(event) {
  const currentTask = rawTasks.find((task) => task.id === currentTaskId - 1);
  currentTask.events.push(event);
}, "addEvent");
var addTaskOrg = /* @__PURE__ */ __name(function(descr) {
  const newTask = {
    section: currentSection,
    type: currentSection,
    description: descr,
    task: descr,
    classes: []
  };
  tasks.push(newTask);
}, "addTaskOrg");
var compileTasks = /* @__PURE__ */ __name(function() {
  const compileTask = /* @__PURE__ */ __name(function(pos) {
    return rawTasks[pos].processed;
  }, "compileTask");
  let allProcessed = true;
  for (const [i, rawTask] of rawTasks.entries()) {
    compileTask(i);
    allProcessed = allProcessed && rawTask.processed;
  }
  return allProcessed;
}, "compileTasks");
var timelineDb_default = {
  clear: clear2,
  getCommonDb,
  getDirection,
  setDirection,
  addSection,
  getSections,
  getTasks,
  addTask,
  addTaskOrg,
  addEvent
};
var nodeCount = 0;
var drawRect = /* @__PURE__ */ __name(function(elem, rectData) {
  const rectElem = elem.append("rect");
  rectElem.attr("x", rectData.x);
  rectElem.attr("y", rectData.y);
  rectElem.attr("fill", rectData.fill);
  rectElem.attr("stroke", rectData.stroke);
  rectElem.attr("width", rectData.width);
  rectElem.attr("height", rectData.height);
  rectElem.attr("rx", rectData.rx);
  rectElem.attr("ry", rectData.ry);
  if (rectData.class !== undefined) {
    rectElem.attr("class", rectData.class);
  }
  return rectElem;
}, "drawRect");
var drawFace = /* @__PURE__ */ __name(function(element, faceData) {
  const radius = 15;
  const circleElement = element.append("circle").attr("cx", faceData.cx).attr("cy", faceData.cy).attr("class", "face").attr("r", radius).attr("stroke-width", 2).attr("overflow", "visible");
  const face = element.append("g");
  face.append("circle").attr("cx", faceData.cx - radius / 3).attr("cy", faceData.cy - radius / 3).attr("r", 1.5).attr("stroke-width", 2).attr("fill", "#666").attr("stroke", "#666");
  face.append("circle").attr("cx", faceData.cx + radius / 3).attr("cy", faceData.cy - radius / 3).attr("r", 1.5).attr("stroke-width", 2).attr("fill", "#666").attr("stroke", "#666");
  function smile(face2) {
    const arc = arc_default().startAngle(Math.PI / 2).endAngle(3 * (Math.PI / 2)).innerRadius(radius / 2).outerRadius(radius / 2.2);
    face2.append("path").attr("class", "mouth").attr("d", arc).attr("transform", "translate(" + faceData.cx + "," + (faceData.cy + 2) + ")");
  }
  __name(smile, "smile");
  function sad(face2) {
    const arc = arc_default().startAngle(3 * Math.PI / 2).endAngle(5 * (Math.PI / 2)).innerRadius(radius / 2).outerRadius(radius / 2.2);
    face2.append("path").attr("class", "mouth").attr("d", arc).attr("transform", "translate(" + faceData.cx + "," + (faceData.cy + 7) + ")");
  }
  __name(sad, "sad");
  function ambivalent(face2) {
    face2.append("line").attr("class", "mouth").attr("stroke", 2).attr("x1", faceData.cx - 5).attr("y1", faceData.cy + 7).attr("x2", faceData.cx + 5).attr("y2", faceData.cy + 7).attr("class", "mouth").attr("stroke-width", "1px").attr("stroke", "#666");
  }
  __name(ambivalent, "ambivalent");
  if (faceData.score > 3) {
    smile(face);
  } else if (faceData.score < 3) {
    sad(face);
  } else {
    ambivalent(face);
  }
  return circleElement;
}, "drawFace");
var drawCircle = /* @__PURE__ */ __name(function(element, circleData) {
  const circleElement = element.append("circle");
  circleElement.attr("cx", circleData.cx);
  circleElement.attr("cy", circleData.cy);
  circleElement.attr("class", "actor-" + circleData.pos);
  circleElement.attr("fill", circleData.fill);
  circleElement.attr("stroke", circleData.stroke);
  circleElement.attr("r", circleData.r);
  if (circleElement.class !== undefined) {
    circleElement.attr("class", circleElement.class);
  }
  if (circleData.title !== undefined) {
    circleElement.append("title").text(circleData.title);
  }
  return circleElement;
}, "drawCircle");
var drawText = /* @__PURE__ */ __name(function(elem, textData) {
  const nText = textData.text.replace(/<br\s*\/?>/gi, " ");
  const textElem = elem.append("text");
  textElem.attr("x", textData.x);
  textElem.attr("y", textData.y);
  textElem.attr("class", "legend");
  textElem.style("text-anchor", textData.anchor);
  if (textData.class !== undefined) {
    textElem.attr("class", textData.class);
  }
  const span = textElem.append("tspan");
  span.attr("x", textData.x + textData.textMargin * 2);
  span.text(nText);
  return textElem;
}, "drawText");
var drawLabel = /* @__PURE__ */ __name(function(elem, txtObject) {
  function genPoints(x, y, width, height, cut) {
    return x + "," + y + " " + (x + width) + "," + y + " " + (x + width) + "," + (y + height - cut) + " " + (x + width - cut * 1.2) + "," + (y + height) + " " + x + "," + (y + height);
  }
  __name(genPoints, "genPoints");
  const polygon = elem.append("polygon");
  polygon.attr("points", genPoints(txtObject.x, txtObject.y, 50, 20, 7));
  polygon.attr("class", "labelBox");
  txtObject.y = txtObject.y + txtObject.labelMargin;
  txtObject.x = txtObject.x + 0.5 * txtObject.labelMargin;
  drawText(elem, txtObject);
}, "drawLabel");
var drawSection = /* @__PURE__ */ __name(function(elem, section, conf) {
  const g = elem.append("g");
  const rect = getNoteRect();
  rect.x = section.x;
  rect.y = section.y;
  rect.fill = section.fill;
  rect.width = conf.width;
  rect.height = conf.height;
  rect.class = "journey-section section-type-" + section.num;
  rect.rx = 3;
  rect.ry = 3;
  drawRect(g, rect);
  _drawTextCandidateFunc(conf)(section.text, g, rect.x, rect.y, rect.width, rect.height, { class: "journey-section section-type-" + section.num }, conf, section.colour);
}, "drawSection");
var taskCount = -1;
var drawTask = /* @__PURE__ */ __name(function(elem, task, conf, diagramId) {
  const center = task.x + conf.width / 2;
  const g = elem.append("g");
  taskCount++;
  const maxHeight = 300 + 5 * 30;
  g.append("line").attr("id", diagramId + "-task" + taskCount).attr("x1", center).attr("y1", task.y).attr("x2", center).attr("y2", maxHeight).attr("class", "task-line").attr("stroke-width", "1px").attr("stroke-dasharray", "4 2").attr("stroke", "#666");
  drawFace(g, {
    cx: center,
    cy: 300 + (5 - task.score) * 30,
    score: task.score
  });
  const rect = getNoteRect();
  rect.x = task.x;
  rect.y = task.y;
  rect.fill = task.fill;
  rect.width = conf.width;
  rect.height = conf.height;
  rect.class = "task task-type-" + task.num;
  rect.rx = 3;
  rect.ry = 3;
  drawRect(g, rect);
  _drawTextCandidateFunc(conf)(task.task, g, rect.x, rect.y, rect.width, rect.height, { class: "task" }, conf, task.colour);
}, "drawTask");
var drawBackgroundRect = /* @__PURE__ */ __name(function(elem, bounds) {
  const rectElem = drawRect(elem, {
    x: bounds.startx,
    y: bounds.starty,
    width: bounds.stopx - bounds.startx,
    height: bounds.stopy - bounds.starty,
    fill: bounds.fill,
    class: "rect"
  });
  rectElem.lower();
}, "drawBackgroundRect");
var getTextObj = /* @__PURE__ */ __name(function() {
  return {
    x: 0,
    y: 0,
    fill: undefined,
    "text-anchor": "start",
    width: 100,
    height: 100,
    textMargin: 0,
    rx: 0,
    ry: 0
  };
}, "getTextObj");
var getNoteRect = /* @__PURE__ */ __name(function() {
  return {
    x: 0,
    y: 0,
    width: 100,
    anchor: "start",
    height: 100,
    rx: 0,
    ry: 0
  };
}, "getNoteRect");
var _drawTextCandidateFunc = /* @__PURE__ */ function() {
  function byText(content, g, x, y, width, height, textAttrs, colour) {
    const text = g.append("text").attr("x", x + width / 2).attr("y", y + height / 2 + 5).style("font-color", colour).style("text-anchor", "middle").text(content);
    _setTextAttrs(text, textAttrs);
  }
  __name(byText, "byText");
  function byTspan(content, g, x, y, width, height, textAttrs, conf, colour) {
    const { taskFontSize, taskFontFamily } = conf;
    const lines = content.split(/<br\s*\/?>/gi);
    for (let i = 0;i < lines.length; i++) {
      const dy = i * taskFontSize - taskFontSize * (lines.length - 1) / 2;
      const text = g.append("text").attr("x", x + width / 2).attr("y", y).attr("fill", colour).style("text-anchor", "middle").style("font-size", taskFontSize).style("font-family", taskFontFamily);
      text.append("tspan").attr("x", x + width / 2).attr("dy", dy).text(lines[i]);
      text.attr("y", y + height / 2).attr("dominant-baseline", "central").attr("alignment-baseline", "central");
      _setTextAttrs(text, textAttrs);
    }
  }
  __name(byTspan, "byTspan");
  function byFo(content, g, x, y, width, height, textAttrs, conf) {
    const body = g.append("switch");
    const f = body.append("foreignObject").attr("x", x).attr("y", y).attr("width", width).attr("height", height).attr("position", "fixed");
    const text = f.append("xhtml:div").style("display", "table").style("height", "100%").style("width", "100%");
    text.append("div").attr("class", "label").style("display", "table-cell").style("text-align", "center").style("vertical-align", "middle").text(content);
    byTspan(content, body, x, y, width, height, textAttrs, conf);
    _setTextAttrs(text, textAttrs);
  }
  __name(byFo, "byFo");
  function _setTextAttrs(toText, fromTextAttrsDict) {
    for (const key in fromTextAttrsDict) {
      if (key in fromTextAttrsDict) {
        toText.attr(key, fromTextAttrsDict[key]);
      }
    }
  }
  __name(_setTextAttrs, "_setTextAttrs");
  return function(conf) {
    return conf.textPlacement === "fo" ? byFo : conf.textPlacement === "old" ? byText : byTspan;
  };
}();
var initGraphics = /* @__PURE__ */ __name(function(graphics, id) {
  nodeCount = 0;
  taskCount = -1;
  graphics.append("defs").append("marker").attr("id", id + "-arrowhead").attr("refX", 5).attr("refY", 2).attr("markerWidth", 6).attr("markerHeight", 4).attr("orient", "auto").append("path").attr("d", "M 0,0 V 4 L6,2 Z");
}, "initGraphics");
function wrap(text, width) {
  text.each(function() {
    var text2 = select_default(this), words = text2.text().split(/(\s+|<br>)/).reverse(), word, line = [], lineHeight = 1.1, y = text2.attr("y"), dy = parseFloat(text2.attr("dy")), tspan = text2.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    for (let j = 0;j < words.length; j++) {
      word = words[words.length - 1 - j];
      line.push(word);
      tspan.text(line.join(" ").trim());
      if (tspan.node().getComputedTextLength() > width || word === "<br>") {
        line.pop();
        tspan.text(line.join(" ").trim());
        if (word === "<br>") {
          line = [""];
        } else {
          line = [word];
        }
        tspan = text2.append("tspan").attr("x", 0).attr("y", y).attr("dy", lineHeight + "em").text(word);
      }
    }
  });
}
__name(wrap, "wrap");
var drawNode = /* @__PURE__ */ __name(function(elem, node, fullSection, conf, diagramId, isEvent = false) {
  const { theme, look } = conf;
  const isReduxTheme = theme?.includes("redux");
  const maxSections = conf?.themeVariables?.THEME_COLOR_LIMIT ?? 12;
  const section = fullSection % maxSections - 1;
  const nodeElem = elem.append("g");
  node.section = section;
  nodeElem.attr("class", (node.class ? node.class + " " : "") + "timeline-node " + ("section-" + section));
  const bkgElem = nodeElem.append("g");
  const textElem = nodeElem.append("g");
  const txt = textElem.append("text").text(node.descr).attr("dy", "1em").attr("alignment-baseline", "middle").attr("dominant-baseline", "middle").attr("text-anchor", "middle").call(wrap, node.width);
  const bbox = txt.node().getBBox();
  const fontSize = conf.fontSize?.replace ? conf.fontSize.replace("px", "") : conf.fontSize;
  node.height = bbox.height + fontSize * 1.1 * 0.5 + node.padding;
  node.height = Math.max(node.height, node.maxHeight);
  node.width = node.width + 2 * node.padding;
  textElem.attr("transform", "translate(" + node.width / 2 + ", " + node.padding / 2 + ")");
  if (isReduxTheme) {
    textElem.attr("transform", `translate(${node.width / 2}, ${isEvent ? node.padding / 2 + 3 : node.padding})`);
  }
  defaultBkg(bkgElem, node, section, diagramId, conf);
  if (look === "neo") {
    nodeElem.attr("data-look", `neo`);
    if (isReduxTheme) {
      const isDark2 = theme.includes("dark");
      const rootSvgNode = elem.node()?.ownerSVGElement ?? elem.node();
      const rootSvg = select_default(rootSvgNode);
      const svgId = rootSvg.attr("id") ?? "";
      const dropShadowId = svgId ? `${svgId}-drop-shadow` : "drop-shadow";
      if (rootSvg.select(`#${dropShadowId}`).empty()) {
        const existingDefs = rootSvg.select("defs");
        const defsEl = existingDefs.empty() ? rootSvg.append("defs") : existingDefs;
        defsEl.append("filter").attr("id", dropShadowId).attr("height", "130%").attr("width", "130%").append("feDropShadow").attr("dx", "4").attr("dy", "4").attr("stdDeviation", 0).attr("flood-opacity", isDark2 ? "0.2" : "0.06").attr("flood-color", isDark2 ? "#FFFFFF" : "#000000");
      }
    }
  }
  return node;
}, "drawNode");
var getVirtualNodeHeight = /* @__PURE__ */ __name(function(elem, node, conf) {
  const textElem = elem.append("g");
  const txt = textElem.append("text").text(node.descr).attr("dy", "1em").attr("alignment-baseline", "middle").attr("dominant-baseline", "middle").attr("text-anchor", "middle").call(wrap, node.width);
  const bbox = txt.node().getBBox();
  const fontSize = conf.fontSize?.replace ? conf.fontSize.replace("px", "") : conf.fontSize;
  textElem.remove();
  return bbox.height + fontSize * 1.1 * 0.5 + node.padding;
}, "getVirtualNodeHeight");
var defaultBkg = /* @__PURE__ */ __name(function(elem, node, section, diagramId, config) {
  const { theme } = config;
  const r = theme?.includes("redux") ? 0 : 5;
  const rd = 5;
  const d = r > 0 ? `M0 ${node.height - rd} v${-node.height + 2 * rd} q0,-${r},${r},-${r} h${node.width - 2 * rd} q${r},0,${r},${r} v${node.height - rd} H0 Z` : `M0 ${node.height - rd} v${-(node.height - rd)} h${node.width} v${node.height} H0 Z`;
  elem.append("path").attr("id", diagramId + "-node-" + nodeCount++).attr("class", "node-bkg node-" + node.type).attr("d", d);
  if (!theme?.includes("redux")) {
    elem.append("line").attr("class", "node-line-" + section).attr("x1", 0).attr("y1", node.height).attr("x2", node.width).attr("y2", node.height);
  }
}, "defaultBkg");
var svgDraw_default = {
  drawRect,
  drawCircle,
  drawSection,
  drawText,
  drawLabel,
  drawTask,
  drawBackgroundRect,
  getTextObj,
  getNoteRect,
  initGraphics,
  drawNode,
  getVirtualNodeHeight
};
var draw = /* @__PURE__ */ __name(function(text, id, version, diagObj) {
  const conf = getConfig2();
  const { look, theme, themeVariables } = conf;
  const { useGradient, gradientStart, gradientStop } = themeVariables;
  const LEFT_MARGIN = conf.timeline?.leftMargin ?? 50;
  log.debug("timeline", diagObj.db);
  const securityLevel = conf.securityLevel;
  let sandboxElement;
  if (securityLevel === "sandbox") {
    sandboxElement = select_default("#i" + id);
  }
  const root = securityLevel === "sandbox" ? select_default(sandboxElement.nodes()[0].contentDocument.body) : select_default("body");
  const svg = root.select("#" + id);
  svg.append("g");
  const tasks2 = diagObj.db.getTasks();
  const title = diagObj.db.getCommonDb().getDiagramTitle();
  log.debug("task", tasks2);
  svgDraw_default.initGraphics(svg, id);
  const sections2 = diagObj.db.getSections();
  log.debug("sections", sections2);
  let maxSectionHeight = 0;
  let maxTaskHeight = 0;
  let depthY = 0;
  let sectionBeginY = 0;
  let masterX = 50 + LEFT_MARGIN;
  let masterY = 50;
  sectionBeginY = 50;
  let sectionNumber = 0;
  let hasSections = true;
  sections2.forEach(function(section) {
    const sectionNode = {
      number: sectionNumber,
      descr: section,
      section: sectionNumber,
      width: 150,
      padding: 20,
      maxHeight: maxSectionHeight
    };
    const sectionHeight = svgDraw_default.getVirtualNodeHeight(svg, sectionNode, conf);
    log.debug("sectionHeight before draw", sectionHeight);
    maxSectionHeight = Math.max(maxSectionHeight, sectionHeight + 20);
  });
  let maxEventCount = 0;
  let maxEventLineLength = 0;
  log.debug("tasks.length", tasks2.length);
  for (const [i, task] of tasks2.entries()) {
    const taskNode = {
      number: i,
      descr: task,
      section: task.section,
      width: 150,
      padding: 20,
      maxHeight: maxTaskHeight
    };
    const taskHeight = svgDraw_default.getVirtualNodeHeight(svg, taskNode, conf);
    log.debug("taskHeight before draw", taskHeight);
    maxTaskHeight = Math.max(maxTaskHeight, taskHeight + 20);
    maxEventCount = Math.max(maxEventCount, task.events.length);
    let maxEventLineLengthTemp = 0;
    for (const event of task.events) {
      const eventNode = {
        descr: event,
        section: task.section,
        number: task.section,
        width: 150,
        padding: 20,
        maxHeight: 50
      };
      maxEventLineLengthTemp += svgDraw_default.getVirtualNodeHeight(svg, eventNode, conf);
    }
    if (task.events.length > 0) {
      maxEventLineLengthTemp += (task.events.length - 1) * 10;
    }
    maxEventLineLength = Math.max(maxEventLineLength, maxEventLineLengthTemp);
  }
  log.debug("maxSectionHeight before draw", maxSectionHeight);
  log.debug("maxTaskHeight before draw", maxTaskHeight);
  if (sections2 && sections2.length > 0) {
    sections2.forEach((section) => {
      const tasksForSection = tasks2.filter((task) => task.section === section);
      const sectionNode = {
        number: sectionNumber,
        descr: section,
        section: sectionNumber,
        width: 200 * Math.max(tasksForSection.length, 1) - 50,
        padding: 20,
        maxHeight: maxSectionHeight
      };
      log.debug("sectionNode", sectionNode);
      const sectionNodeWrapper = svg.append("g");
      const node = svgDraw_default.drawNode(sectionNodeWrapper, sectionNode, sectionNumber, conf, id);
      log.debug("sectionNode output", node);
      sectionNodeWrapper.attr("transform", `translate(${masterX}, ${sectionBeginY})`);
      masterY += maxSectionHeight + 50;
      if (tasksForSection.length > 0) {
        drawTasks(svg, tasksForSection, sectionNumber, masterX, masterY, maxTaskHeight, conf, maxEventCount, maxEventLineLength, maxSectionHeight, false, id);
      }
      masterX += 200 * Math.max(tasksForSection.length, 1);
      masterY = sectionBeginY;
      sectionNumber++;
    });
  } else {
    hasSections = false;
    drawTasks(svg, tasks2, sectionNumber, masterX, masterY, maxTaskHeight, conf, maxEventCount, maxEventLineLength, maxSectionHeight, true, id);
  }
  const box = svg.node().getBBox();
  log.debug("bounds", box);
  if (title) {
    svg.append("text").text(title).attr("x", look === "neo" ? box.x * 2 + LEFT_MARGIN : box.width / 2 - LEFT_MARGIN).attr("font-size", "4ex").attr("font-weight", "bold").attr("y", 20);
  }
  depthY = hasSections ? maxSectionHeight + maxTaskHeight + 150 : maxTaskHeight + 100;
  const lineWrapper = svg.append("g").attr("class", "lineWrapper");
  lineWrapper.append("line").attr("x1", LEFT_MARGIN).attr("y1", depthY).attr("x2", box.width + 3 * LEFT_MARGIN).attr("y2", depthY).attr("stroke-width", 4).attr("stroke", "black").attr("marker-end", `url(#${id}-arrowhead)`);
  if (look === "neo" && useGradient && theme !== "neutral") {
    const existingDefs = svg.select("defs");
    const defsEl = existingDefs.empty() ? svg.append("defs") : existingDefs;
    const gradient = defsEl.append("linearGradient").attr("id", svg.attr("id") + "-gradient").attr("gradientUnits", "objectBoundingBox").attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", gradientStart).attr("stop-opacity", 1);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", gradientStop).attr("stop-opacity", 1);
  }
  setupGraphViewbox(undefined, svg, conf.timeline?.padding ?? 50, conf.timeline?.useMaxWidth ?? false);
}, "draw");
var drawTasks = /* @__PURE__ */ __name(function(diagram2, tasks2, sectionColor, masterX, masterY, maxTaskHeight, conf, maxEventCount, maxEventLineLength, maxSectionHeight, isWithoutSections, diagramId) {
  for (const task of tasks2) {
    const taskNode = {
      descr: task.task,
      section: sectionColor,
      number: sectionColor,
      width: 150,
      padding: 20,
      maxHeight: maxTaskHeight
    };
    log.debug("taskNode", taskNode);
    const taskWrapper = diagram2.append("g").attr("class", "taskWrapper");
    const node = svgDraw_default.drawNode(taskWrapper, taskNode, sectionColor, conf, diagramId);
    const taskHeight = node.height;
    log.debug("taskHeight after draw", taskHeight);
    taskWrapper.attr("transform", `translate(${masterX}, ${masterY})`);
    maxTaskHeight = Math.max(maxTaskHeight, taskHeight);
    if (task.events) {
      const lineWrapper = diagram2.append("g").attr("class", "lineWrapper");
      let lineLength = maxTaskHeight;
      masterY += 100;
      lineLength = lineLength + drawEvents(diagram2, task.events, sectionColor, masterX, masterY, conf, diagramId);
      masterY -= 100;
      lineWrapper.append("line").attr("x1", masterX + 190 / 2).attr("y1", masterY + maxTaskHeight).attr("x2", masterX + 190 / 2).attr("y2", masterY + maxTaskHeight + 100 + maxEventLineLength + 100).attr("stroke-width", 2).attr("stroke", "black").attr("marker-end", `url(#${diagramId}-arrowhead)`).attr("stroke-dasharray", "5,5");
    }
    masterX = masterX + 200;
    if (isWithoutSections && !conf.timeline?.disableMulticolor) {
      sectionColor++;
    }
  }
  masterY = masterY - 10;
}, "drawTasks");
var drawEvents = /* @__PURE__ */ __name(function(diagram2, events, sectionColor, masterX, masterY, conf, diagramId) {
  let maxEventHeight = 0;
  const eventBeginY = masterY;
  masterY = masterY + 100;
  for (const event of events) {
    const eventNode = {
      descr: event,
      section: sectionColor,
      number: sectionColor,
      width: 150,
      padding: 20,
      maxHeight: 50
    };
    log.debug("eventNode", eventNode);
    const eventWrapper = diagram2.append("g").attr("class", "eventWrapper");
    const node = svgDraw_default.drawNode(eventWrapper, eventNode, sectionColor, conf, diagramId, true);
    const eventHeight = node.height;
    maxEventHeight = maxEventHeight + eventHeight;
    eventWrapper.attr("transform", `translate(${masterX}, ${masterY})`);
    masterY = masterY + 10 + eventHeight;
  }
  masterY = eventBeginY;
  return maxEventHeight;
}, "drawEvents");
var timelineRenderer_default = {
  setConf: /* @__PURE__ */ __name(() => {}, "setConf"),
  draw
};
var NODE_WIDTH = 200;
var NODE_PADDING = 5;
var NODE_TOTAL_WIDTH = NODE_WIDTH + NODE_PADDING * 2;
var EVENT_WIDTH = NODE_WIDTH + 100;
var EVENT_TOTAL_WIDTH = EVENT_WIDTH + NODE_PADDING * 2;
var EVENT_SPACING = 10;
var EVENT_VERTICAL_GAP = 0;
var SECTION_TASK_GAP = 20;
var TASK_AXIS_GAP = 20;
var TASK_VERTICAL_GAP = 30;
var EVENT_AXIS_GAP = 50;
var draw2 = /* @__PURE__ */ __name(function(text, id, version, diagObj) {
  const conf = getConfig2();
  const LEFT_MARGIN = conf.timeline?.leftMargin ?? 50;
  log.debug("timeline", diagObj.db);
  const svg = selectSvgElement(id);
  svg.append("g");
  const tasks2 = diagObj.db.getTasks();
  const title = diagObj.db.getCommonDb().getDiagramTitle();
  log.debug("task", tasks2);
  svgDraw_default.initGraphics(svg);
  const sections2 = diagObj.db.getSections();
  log.debug("sections", sections2);
  let maxSectionHeight = 0;
  let maxTaskHeight = 0;
  const masterX = 50 + LEFT_MARGIN;
  let masterY = 50;
  const contentTopY = masterY;
  const sectionBeginX = masterX;
  const leftWidth = NODE_TOTAL_WIDTH + TASK_AXIS_GAP;
  const rightWidth = EVENT_TOTAL_WIDTH + EVENT_AXIS_GAP;
  const axisX = sectionBeginX + leftWidth;
  let sectionNumber = 0;
  const hasSections = sections2 && sections2.length > 0;
  const timelineX = hasSections ? axisX : masterX + leftWidth;
  const sectionWidth = Math.max(50, leftWidth + rightWidth - NODE_PADDING * 2);
  sections2.forEach(function(section) {
    const sectionNode = {
      number: sectionNumber,
      descr: section,
      section: sectionNumber,
      width: sectionWidth,
      padding: NODE_PADDING,
      maxHeight: maxSectionHeight
    };
    const sectionHeight = svgDraw_default.getVirtualNodeHeight(svg, sectionNode, conf);
    log.debug("sectionHeight before draw", sectionHeight);
    maxSectionHeight = Math.max(maxSectionHeight, sectionHeight);
  });
  let maxEventStackHeight = 0;
  log.debug("tasks.length", tasks2.length);
  for (const [i, task] of tasks2.entries()) {
    const taskNode = {
      number: i,
      descr: task,
      section: task.section,
      width: NODE_WIDTH,
      padding: NODE_PADDING,
      maxHeight: maxTaskHeight
    };
    const taskHeight = svgDraw_default.getVirtualNodeHeight(svg, taskNode, conf);
    log.debug("taskHeight before draw", taskHeight);
    maxTaskHeight = Math.max(maxTaskHeight, taskHeight);
    let maxEventStackHeightTemp = 0;
    for (const event of task.events) {
      const eventNode = {
        descr: event,
        section: task.section,
        number: task.section,
        width: EVENT_WIDTH,
        padding: NODE_PADDING,
        maxHeight: 50
      };
      maxEventStackHeightTemp += svgDraw_default.getVirtualNodeHeight(svg, eventNode, conf);
    }
    if (task.events.length > 0) {
      maxEventStackHeightTemp += (task.events.length - 1) * EVENT_SPACING;
    }
    maxEventStackHeight = Math.max(maxEventStackHeight, maxEventStackHeightTemp) + EVENT_VERTICAL_GAP;
  }
  log.debug("maxSectionHeight before draw", maxSectionHeight);
  log.debug("maxTaskHeight before draw", maxTaskHeight);
  const taskBlockHeight = Math.max(maxTaskHeight, maxEventStackHeight);
  const taskSpacing = taskBlockHeight + TASK_VERTICAL_GAP;
  if (hasSections) {
    sections2.forEach((section) => {
      const tasksForSection = tasks2.filter((task) => task.section === section);
      const sectionNode = {
        number: sectionNumber,
        descr: section,
        section: sectionNumber,
        width: sectionWidth,
        padding: NODE_PADDING,
        maxHeight: maxSectionHeight
      };
      log.debug("sectionNode", sectionNode);
      const sectionNodeWrapper = svg.append("g");
      const node = svgDraw_default.drawNode(sectionNodeWrapper, sectionNode, sectionNumber, conf);
      log.debug("sectionNode output", node);
      const sectionX = timelineX - leftWidth;
      sectionNodeWrapper.attr("transform", `translate(${sectionX}, ${masterY})`);
      const taskStartY = masterY + node.height + SECTION_TASK_GAP;
      if (tasksForSection.length > 0) {
        drawTasks2(svg, tasksForSection, sectionNumber, timelineX, taskStartY, maxTaskHeight, conf, taskSpacing, false);
      }
      const taskCount2 = tasksForSection.length;
      const sectionHeight = node.height + SECTION_TASK_GAP + taskSpacing * Math.max(taskCount2, 1) - (taskCount2 > 0 ? TASK_VERTICAL_GAP * 2 : 0);
      masterY += sectionHeight;
      sectionNumber++;
    });
  } else {
    drawTasks2(svg, tasks2, sectionNumber, timelineX, masterY, maxTaskHeight, conf, taskSpacing, true);
  }
  let box = svg.node()?.getBBox();
  if (!box) {
    throw new Error("bbox not found");
  }
  log.debug("bounds", box);
  if (title) {
    svg.append("text").text(title).attr("x", box.width / 2 - LEFT_MARGIN).attr("font-size", "4ex").attr("font-weight", "bold").attr("y", 20);
    box = svg.node()?.getBBox();
    if (!box) {
      throw new Error("bbox not found");
    }
    log.debug("bounds after title", box);
  }
  const [fontSize] = parseFontSize(conf.fontSize);
  const arrowTopOffset = (fontSize ?? 16) * 2;
  const arrowBottomPadding = (fontSize ?? 16) * 0.5 + 20;
  const lineWrapper = svg.append("g").attr("class", "lineWrapper");
  lineWrapper.append("line").attr("x1", timelineX).attr("y1", contentTopY - arrowTopOffset).attr("x2", timelineX).attr("y2", box.y + box.height + arrowBottomPadding).attr("stroke-width", 4).attr("stroke", "black").attr("marker-end", "url(#arrowhead)");
  lineWrapper.lower();
  setupGraphViewbox(undefined, svg, conf.timeline?.padding ?? 50, conf.timeline?.useMaxWidth ?? false);
}, "draw");
var drawTasks2 = /* @__PURE__ */ __name(function(diagram2, tasks2, sectionColor, timelineX, masterY, maxTaskHeight, conf, taskSpacing, isWithoutSections) {
  for (const task of tasks2) {
    const taskNode = {
      descr: task.task,
      section: sectionColor,
      number: sectionColor,
      width: NODE_WIDTH,
      padding: NODE_PADDING,
      maxHeight: maxTaskHeight
    };
    log.debug("taskNode", taskNode);
    const taskWrapper = diagram2.append("g").attr("class", "taskWrapper");
    const node = svgDraw_default.drawNode(taskWrapper, taskNode, sectionColor, conf);
    const taskHeight = node.height;
    log.debug("taskHeight after draw", taskHeight);
    const taskX = timelineX - TASK_AXIS_GAP - node.width;
    taskWrapper.attr("transform", `translate(${taskX}, ${masterY})`);
    maxTaskHeight = Math.max(maxTaskHeight, taskHeight);
    if (task.events && task.events.length > 0) {
      const eventsStartY = masterY;
      const eventsX = timelineX + EVENT_AXIS_GAP;
      drawEvents2(diagram2, task.events, sectionColor, timelineX, eventsX, eventsStartY, conf);
    }
    masterY = masterY + taskSpacing;
    if (isWithoutSections && !conf.timeline?.disableMulticolor) {
      sectionColor++;
    }
  }
}, "drawTasks");
var drawEvents2 = /* @__PURE__ */ __name(function(diagram2, events, sectionColor, axisX, eventsX, startY, conf) {
  let currentY = startY;
  for (const event of events) {
    const eventNode = {
      descr: event,
      section: sectionColor,
      number: sectionColor,
      width: EVENT_WIDTH,
      padding: NODE_PADDING,
      maxHeight: 0
    };
    log.debug("eventNode", eventNode);
    const eventWrapper = diagram2.append("g").attr("class", "eventWrapper");
    const node = svgDraw_default.drawNode(eventWrapper, eventNode, sectionColor, conf);
    const eventHeight = node.height;
    eventWrapper.attr("transform", `translate(${eventsX}, ${currentY})`);
    const lineWrapper = diagram2.append("g").attr("class", "lineWrapper");
    const lineY = currentY + eventHeight / 2;
    lineWrapper.append("line").attr("x1", axisX).attr("y1", lineY).attr("x2", eventsX).attr("y2", lineY).attr("stroke-width", 2).attr("stroke", "black").attr("marker-end", "url(#arrowhead)").attr("stroke-dasharray", "5,5");
    currentY = currentY + eventHeight + EVENT_SPACING;
  }
  return currentY - startY;
}, "drawEvents");
var timelineRendererVertical_default = {
  setConf: /* @__PURE__ */ __name(() => {}, "setConf"),
  draw: draw2
};
var genReduxSections = /* @__PURE__ */ __name((options) => {
  const { theme } = getConfig();
  const isDarkTheme = theme?.includes("dark");
  const isColorTheme = theme?.includes("color");
  const rawSvgId = options.svgId?.replace(/^#/, "") ?? "";
  const scopedDropShadow = rawSvgId ? `url(#${rawSvgId}-drop-shadow)` : options.dropShadow ?? "none";
  let sections2 = "";
  for (let i = 0;i < options.THEME_COLOR_LIMIT; i++) {
    const sw = `${17 - 3 * i}`;
    const color = isColorTheme ? options.borderColorArray[i] : options.mainBkg;
    const stroke = isColorTheme ? options.borderColorArray[i] : options.nodeBorder;
    sections2 += `
    .section-${i - 1} rect,
    .section-${i - 1} path,
    .section-${i - 1} circle {
      fill: ${isDarkTheme && isColorTheme ? options.mainBkg : color};
      stroke: ${stroke};
      stroke-width: ${options.strokeWidth};
      filter: ${scopedDropShadow};
    }

    .section-${i - 1} text {
      fill: ${options.nodeBorder};
      font-weight: ${options.fontWeight}
    }

    .node-icon-${i - 1} {
      font-size: 40px;
      color: ${options["cScaleLabel" + i]};
    }

    .section-edge-${i - 1} {
      stroke: ${options["cScale" + i]};
    }

    .edge-depth-${i - 1} {
      stroke-width: ${sw};
    }

    .section-${i - 1} line {
      stroke: ${options["cScaleInv" + i]};
      stroke-width: 3;
    }

    .lineWrapper line {
      stroke: ${options.nodeBorder};
      stroke-width:${options.strokeWidth}
    }

    .disabled,
    .disabled circle,
    .disabled text {
      fill: ${options.tertiaryColor ?? "lightgray"};
    }

    .disabled text {
      fill: ${options.clusterBorder ?? "#efefef"};
    }
    `;
  }
  return sections2;
}, "genReduxSections");
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
  for (let i = 0;i < options.THEME_COLOR_LIMIT; i++) {
    const sw = "" + (17 - 3 * i);
    sections2 += `
    .section-${i - 1} rect, .section-${i - 1} path, .section-${i - 1} circle, .section-${i - 1} path  {
      fill: ${options["cScale" + i]};
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

    .lineWrapper line{
      stroke: ${options["cScaleLabel" + i]} ;
    }

    .disabled, .disabled circle, .disabled text {
      fill: ${options.tertiaryColor ?? "lightgray"};
    }
    .disabled text {
      fill: ${options.clusterBorder ?? "#efefef"};
    }
    `;
  }
  return sections2;
}, "genSections");
var getStyles = /* @__PURE__ */ __name((options) => {
  const { theme } = getConfig();
  const isReduxTheme = theme?.includes("redux");
  const isNeutralTheme = theme === "neutral";
  const rawSvgId = options.svgId?.replace(/^#/, "") ?? "";
  let gradientSections = "";
  if (options.useGradient && rawSvgId && options.THEME_COLOR_LIMIT && !isNeutralTheme) {
    for (let i = 0;i < options.THEME_COLOR_LIMIT; i++) {
      gradientSections += `
      .section-${i - 1}[data-look="neo"] rect,
      .section-${i - 1}[data-look="neo"] path,
      .section-${i - 1}[data-look="neo"] circle {
        fill: ${options.mainBkg};
        stroke: url(#${rawSvgId}-gradient);
        stroke-width: 2;
      }
      .section-${i - 1}[data-look="neo"] line {
        stroke: url(#${rawSvgId}-gradient);
        stroke-width: 2;
      }`;
    }
  }
  return `
  .edge {
    stroke-width: 3;
  }
  ${isReduxTheme ? genReduxSections(options) : genSections(options)}
  ${gradientSections}
  .section-root rect, .section-root path, .section-root circle  {
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
  .eventWrapper  {
   filter: brightness(120%);
  }
`;
}, "getStyles");
var styles_default = getStyles;
var rendererSelector = {
  setConf: /* @__PURE__ */ __name(() => {}, "setConf"),
  draw: /* @__PURE__ */ __name((text, id, version, diagObj) => {
    const direction2 = diagObj?.db?.getDirection?.() ?? "LR";
    if (direction2 === "TD") {
      return timelineRendererVertical_default.draw(text, id, version, diagObj);
    }
    return timelineRenderer_default.draw(text, id, version, diagObj);
  }, "draw")
};
var diagram = {
  db: timelineDb_exports,
  renderer: rendererSelector,
  parser: timeline_default,
  styles: styles_default
};
export {
  diagram
};

//# debugId=05DD46A7071E089964756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL3RpbWVsaW5lLWRlZmluaXRpb24tUE5aNjdRQ0EubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWwogICAgImltcG9ydCB7XG4gIHNlbGVjdFN2Z0VsZW1lbnRcbn0gZnJvbSBcIi4vY2h1bmstV1U1TVlHMkcubWpzXCI7XG5pbXBvcnQge1xuICBwYXJzZUZvbnRTaXplXG59IGZyb20gXCIuL2NodW5rLTVaUVlIWEtVLm1qc1wiO1xuaW1wb3J0IHtcbiAgY2xlYXIsXG4gIGNvbW1vbkRiX2V4cG9ydHMsXG4gIGdldENvbmZpZyxcbiAgZ2V0Q29uZmlnMixcbiAgc2V0dXBHcmFwaFZpZXdib3hcbn0gZnJvbSBcIi4vY2h1bmstQ1NDSUhLN1EubWpzXCI7XG5pbXBvcnQge1xuICBfX2V4cG9ydCxcbiAgX19uYW1lLFxuICBsb2dcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIHNyYy9kaWFncmFtcy90aW1lbGluZS9wYXJzZXIvdGltZWxpbmUuamlzb25cbnZhciBwYXJzZXIgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBvID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihrLCB2LCBvMiwgbCkge1xuICAgIGZvciAobzIgPSBvMiB8fCB7fSwgbCA9IGsubGVuZ3RoOyBsLS07IG8yW2tbbF1dID0gdikgO1xuICAgIHJldHVybiBvMjtcbiAgfSwgXCJvXCIpLCAkVjAgPSBbNiwgMTEsIDEzLCAxNCwgMTUsIDE3LCAxOSwgMjAsIDIzLCAyNF0sICRWMSA9IFsxLCAxMl0sICRWMiA9IFsxLCAxM10sICRWMyA9IFsxLCAxNF0sICRWNCA9IFsxLCAxNV0sICRWNSA9IFsxLCAxNl0sICRWNiA9IFsxLCAxOV0sICRWNyA9IFsxLCAyMF07XG4gIHZhciBwYXJzZXIyID0ge1xuICAgIHRyYWNlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHRyYWNlKCkge1xuICAgIH0sIFwidHJhY2VcIiksXG4gICAgeXk6IHt9LFxuICAgIHN5bWJvbHNfOiB7IFwiZXJyb3JcIjogMiwgXCJzdGFydFwiOiAzLCBcInRpbWVsaW5lX2hlYWRlclwiOiA0LCBcImRvY3VtZW50XCI6IDUsIFwiRU9GXCI6IDYsIFwidGltZWxpbmVcIjogNywgXCJ0aW1lbGluZV9sclwiOiA4LCBcInRpbWVsaW5lX3RkXCI6IDksIFwibGluZVwiOiAxMCwgXCJTUEFDRVwiOiAxMSwgXCJzdGF0ZW1lbnRcIjogMTIsIFwiTkVXTElORVwiOiAxMywgXCJ0aXRsZVwiOiAxNCwgXCJhY2NfdGl0bGVcIjogMTUsIFwiYWNjX3RpdGxlX3ZhbHVlXCI6IDE2LCBcImFjY19kZXNjclwiOiAxNywgXCJhY2NfZGVzY3JfdmFsdWVcIjogMTgsIFwiYWNjX2Rlc2NyX211bHRpbGluZV92YWx1ZVwiOiAxOSwgXCJzZWN0aW9uXCI6IDIwLCBcInBlcmlvZF9zdGF0ZW1lbnRcIjogMjEsIFwiZXZlbnRfc3RhdGVtZW50XCI6IDIyLCBcInBlcmlvZFwiOiAyMywgXCJldmVudFwiOiAyNCwgXCIkYWNjZXB0XCI6IDAsIFwiJGVuZFwiOiAxIH0sXG4gICAgdGVybWluYWxzXzogeyAyOiBcImVycm9yXCIsIDY6IFwiRU9GXCIsIDc6IFwidGltZWxpbmVcIiwgODogXCJ0aW1lbGluZV9sclwiLCA5OiBcInRpbWVsaW5lX3RkXCIsIDExOiBcIlNQQUNFXCIsIDEzOiBcIk5FV0xJTkVcIiwgMTQ6IFwidGl0bGVcIiwgMTU6IFwiYWNjX3RpdGxlXCIsIDE2OiBcImFjY190aXRsZV92YWx1ZVwiLCAxNzogXCJhY2NfZGVzY3JcIiwgMTg6IFwiYWNjX2Rlc2NyX3ZhbHVlXCIsIDE5OiBcImFjY19kZXNjcl9tdWx0aWxpbmVfdmFsdWVcIiwgMjA6IFwic2VjdGlvblwiLCAyMzogXCJwZXJpb2RcIiwgMjQ6IFwiZXZlbnRcIiB9LFxuICAgIHByb2R1Y3Rpb25zXzogWzAsIFszLCAzXSwgWzQsIDFdLCBbNCwgMV0sIFs0LCAxXSwgWzUsIDBdLCBbNSwgMl0sIFsxMCwgMl0sIFsxMCwgMV0sIFsxMCwgMV0sIFsxMCwgMV0sIFsxMiwgMV0sIFsxMiwgMl0sIFsxMiwgMl0sIFsxMiwgMV0sIFsxMiwgMV0sIFsxMiwgMV0sIFsxMiwgMV0sIFsyMSwgMV0sIFsyMiwgMV1dLFxuICAgIHBlcmZvcm1BY3Rpb246IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gYW5vbnltb3VzKHl5dGV4dCwgeXlsZW5nLCB5eWxpbmVubywgeXksIHl5c3RhdGUsICQkLCBfJCkge1xuICAgICAgdmFyICQwID0gJCQubGVuZ3RoIC0gMTtcbiAgICAgIHN3aXRjaCAoeXlzdGF0ZSkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgcmV0dXJuICQkWyQwIC0gMV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICB5eS5zZXREaXJlY3Rpb24oXCJMUlwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHl5LnNldERpcmVjdGlvbihcIlREXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgdGhpcy4kID0gW107XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAkJFskMCAtIDFdLnB1c2goJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDFdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc6XG4gICAgICAgIGNhc2UgODpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTpcbiAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICB0aGlzLiQgPSBbXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMTpcbiAgICAgICAgICB5eS5nZXRDb21tb25EYigpLnNldERpYWdyYW1UaXRsZSgkJFskMF0uc3Vic3RyKDYpKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF0uc3Vic3RyKDYpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS50cmltKCk7XG4gICAgICAgICAgeXkuZ2V0Q29tbW9uRGIoKS5zZXRBY2NUaXRsZSh0aGlzLiQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEzOlxuICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS50cmltKCk7XG4gICAgICAgICAgeXkuZ2V0Q29tbW9uRGIoKS5zZXRBY2NEZXNjcmlwdGlvbih0aGlzLiQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgIHl5LmFkZFNlY3Rpb24oJCRbJDBdLnN1YnN0cig4KSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdLnN1YnN0cig4KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxODpcbiAgICAgICAgICB5eS5hZGRUYXNrKCQkWyQwXSwgMCwgXCJcIik7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE5OlxuICAgICAgICAgIHl5LmFkZEV2ZW50KCQkWyQwXS5zdWJzdHIoMikpO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9LCBcImFub255bW91c1wiKSxcbiAgICB0YWJsZTogW3sgMzogMSwgNDogMiwgNzogWzEsIDNdLCA4OiBbMSwgNF0sIDk6IFsxLCA1XSB9LCB7IDE6IFszXSB9LCBvKCRWMCwgWzIsIDVdLCB7IDU6IDYgfSksIG8oJFYwLCBbMiwgMl0pLCBvKCRWMCwgWzIsIDNdKSwgbygkVjAsIFsyLCA0XSksIHsgNjogWzEsIDddLCAxMDogOCwgMTE6IFsxLCA5XSwgMTI6IDEwLCAxMzogWzEsIDExXSwgMTQ6ICRWMSwgMTU6ICRWMiwgMTc6ICRWMywgMTk6ICRWNCwgMjA6ICRWNSwgMjE6IDE3LCAyMjogMTgsIDIzOiAkVjYsIDI0OiAkVjcgfSwgbygkVjAsIFsyLCAxMF0sIHsgMTogWzIsIDFdIH0pLCBvKCRWMCwgWzIsIDZdKSwgeyAxMjogMjEsIDE0OiAkVjEsIDE1OiAkVjIsIDE3OiAkVjMsIDE5OiAkVjQsIDIwOiAkVjUsIDIxOiAxNywgMjI6IDE4LCAyMzogJFY2LCAyNDogJFY3IH0sIG8oJFYwLCBbMiwgOF0pLCBvKCRWMCwgWzIsIDldKSwgbygkVjAsIFsyLCAxMV0pLCB7IDE2OiBbMSwgMjJdIH0sIHsgMTg6IFsxLCAyM10gfSwgbygkVjAsIFsyLCAxNF0pLCBvKCRWMCwgWzIsIDE1XSksIG8oJFYwLCBbMiwgMTZdKSwgbygkVjAsIFsyLCAxN10pLCBvKCRWMCwgWzIsIDE4XSksIG8oJFYwLCBbMiwgMTldKSwgbygkVjAsIFsyLCA3XSksIG8oJFYwLCBbMiwgMTJdKSwgbygkVjAsIFsyLCAxM10pXSxcbiAgICBkZWZhdWx0QWN0aW9uczoge30sXG4gICAgcGFyc2VFcnJvcjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwYXJzZUVycm9yKHN0ciwgaGFzaCkge1xuICAgICAgaWYgKGhhc2gucmVjb3ZlcmFibGUpIHtcbiAgICAgICAgdGhpcy50cmFjZShzdHIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKHN0cik7XG4gICAgICAgIGVycm9yLmhhc2ggPSBoYXNoO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LCBcInBhcnNlRXJyb3JcIiksXG4gICAgcGFyc2U6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcGFyc2UoaW5wdXQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcywgc3RhY2sgPSBbMF0sIHRzdGFjayA9IFtdLCB2c3RhY2sgPSBbbnVsbF0sIGxzdGFjayA9IFtdLCB0YWJsZSA9IHRoaXMudGFibGUsIHl5dGV4dCA9IFwiXCIsIHl5bGluZW5vID0gMCwgeXlsZW5nID0gMCwgcmVjb3ZlcmluZyA9IDAsIFRFUlJPUiA9IDIsIEVPRiA9IDE7XG4gICAgICB2YXIgYXJncyA9IGxzdGFjay5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICB2YXIgbGV4ZXIyID0gT2JqZWN0LmNyZWF0ZSh0aGlzLmxleGVyKTtcbiAgICAgIHZhciBzaGFyZWRTdGF0ZSA9IHsgeXk6IHt9IH07XG4gICAgICBmb3IgKHZhciBrIGluIHRoaXMueXkpIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnl5LCBrKSkge1xuICAgICAgICAgIHNoYXJlZFN0YXRlLnl5W2tdID0gdGhpcy55eVtrXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGV4ZXIyLnNldElucHV0KGlucHV0LCBzaGFyZWRTdGF0ZS55eSk7XG4gICAgICBzaGFyZWRTdGF0ZS55eS5sZXhlciA9IGxleGVyMjtcbiAgICAgIHNoYXJlZFN0YXRlLnl5LnBhcnNlciA9IHRoaXM7XG4gICAgICBpZiAodHlwZW9mIGxleGVyMi55eWxsb2MgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBsZXhlcjIueXlsbG9jID0ge307XG4gICAgICB9XG4gICAgICB2YXIgeXlsb2MgPSBsZXhlcjIueXlsbG9jO1xuICAgICAgbHN0YWNrLnB1c2goeXlsb2MpO1xuICAgICAgdmFyIHJhbmdlcyA9IGxleGVyMi5vcHRpb25zICYmIGxleGVyMi5vcHRpb25zLnJhbmdlcztcbiAgICAgIGlmICh0eXBlb2Ygc2hhcmVkU3RhdGUueXkucGFyc2VFcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRoaXMucGFyc2VFcnJvciA9IHNoYXJlZFN0YXRlLnl5LnBhcnNlRXJyb3I7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBhcnNlRXJyb3IgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykucGFyc2VFcnJvcjtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHBvcFN0YWNrKG4pIHtcbiAgICAgICAgc3RhY2subGVuZ3RoID0gc3RhY2subGVuZ3RoIC0gMiAqIG47XG4gICAgICAgIHZzdGFjay5sZW5ndGggPSB2c3RhY2subGVuZ3RoIC0gbjtcbiAgICAgICAgbHN0YWNrLmxlbmd0aCA9IGxzdGFjay5sZW5ndGggLSBuO1xuICAgICAgfVxuICAgICAgX19uYW1lKHBvcFN0YWNrLCBcInBvcFN0YWNrXCIpO1xuICAgICAgZnVuY3Rpb24gbGV4KCkge1xuICAgICAgICB2YXIgdG9rZW47XG4gICAgICAgIHRva2VuID0gdHN0YWNrLnBvcCgpIHx8IGxleGVyMi5sZXgoKSB8fCBFT0Y7XG4gICAgICAgIGlmICh0eXBlb2YgdG9rZW4gIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICBpZiAodG9rZW4gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgdHN0YWNrID0gdG9rZW47XG4gICAgICAgICAgICB0b2tlbiA9IHRzdGFjay5wb3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdG9rZW4gPSBzZWxmLnN5bWJvbHNfW3Rva2VuXSB8fCB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICB9XG4gICAgICBfX25hbWUobGV4LCBcImxleFwiKTtcbiAgICAgIHZhciBzeW1ib2wsIHByZUVycm9yU3ltYm9sLCBzdGF0ZSwgYWN0aW9uLCBhLCByLCB5eXZhbCA9IHt9LCBwLCBsZW4sIG5ld1N0YXRlLCBleHBlY3RlZDtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHN0YXRlID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRBY3Rpb25zW3N0YXRlXSkge1xuICAgICAgICAgIGFjdGlvbiA9IHRoaXMuZGVmYXVsdEFjdGlvbnNbc3RhdGVdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChzeW1ib2wgPT09IG51bGwgfHwgdHlwZW9mIHN5bWJvbCA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBzeW1ib2wgPSBsZXgoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aW9uID0gdGFibGVbc3RhdGVdICYmIHRhYmxlW3N0YXRlXVtzeW1ib2xdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgYWN0aW9uID09PSBcInVuZGVmaW5lZFwiIHx8ICFhY3Rpb24ubGVuZ3RoIHx8ICFhY3Rpb25bMF0pIHtcbiAgICAgICAgICB2YXIgZXJyU3RyID0gXCJcIjtcbiAgICAgICAgICBleHBlY3RlZCA9IFtdO1xuICAgICAgICAgIGZvciAocCBpbiB0YWJsZVtzdGF0ZV0pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRlcm1pbmFsc19bcF0gJiYgcCA+IFRFUlJPUikge1xuICAgICAgICAgICAgICBleHBlY3RlZC5wdXNoKFwiJ1wiICsgdGhpcy50ZXJtaW5hbHNfW3BdICsgXCInXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobGV4ZXIyLnNob3dQb3NpdGlvbikge1xuICAgICAgICAgICAgZXJyU3RyID0gXCJQYXJzZSBlcnJvciBvbiBsaW5lIFwiICsgKHl5bGluZW5vICsgMSkgKyBcIjpcXG5cIiArIGxleGVyMi5zaG93UG9zaXRpb24oKSArIFwiXFxuRXhwZWN0aW5nIFwiICsgZXhwZWN0ZWQuam9pbihcIiwgXCIpICsgXCIsIGdvdCAnXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlcnJTdHIgPSBcIlBhcnNlIGVycm9yIG9uIGxpbmUgXCIgKyAoeXlsaW5lbm8gKyAxKSArIFwiOiBVbmV4cGVjdGVkIFwiICsgKHN5bWJvbCA9PSBFT0YgPyBcImVuZCBvZiBpbnB1dFwiIDogXCInXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wYXJzZUVycm9yKGVyclN0ciwge1xuICAgICAgICAgICAgdGV4dDogbGV4ZXIyLm1hdGNoLFxuICAgICAgICAgICAgdG9rZW46IHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCxcbiAgICAgICAgICAgIGxpbmU6IGxleGVyMi55eWxpbmVubyxcbiAgICAgICAgICAgIGxvYzogeXlsb2MsXG4gICAgICAgICAgICBleHBlY3RlZFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhY3Rpb25bMF0gaW5zdGFuY2VvZiBBcnJheSAmJiBhY3Rpb24ubGVuZ3RoID4gMSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcnNlIEVycm9yOiBtdWx0aXBsZSBhY3Rpb25zIHBvc3NpYmxlIGF0IHN0YXRlOiBcIiArIHN0YXRlICsgXCIsIHRva2VuOiBcIiArIHN5bWJvbCk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChhY3Rpb25bMF0pIHtcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBzdGFjay5wdXNoKHN5bWJvbCk7XG4gICAgICAgICAgICB2c3RhY2sucHVzaChsZXhlcjIueXl0ZXh0KTtcbiAgICAgICAgICAgIGxzdGFjay5wdXNoKGxleGVyMi55eWxsb2MpO1xuICAgICAgICAgICAgc3RhY2sucHVzaChhY3Rpb25bMV0pO1xuICAgICAgICAgICAgc3ltYm9sID0gbnVsbDtcbiAgICAgICAgICAgIGlmICghcHJlRXJyb3JTeW1ib2wpIHtcbiAgICAgICAgICAgICAgeXlsZW5nID0gbGV4ZXIyLnl5bGVuZztcbiAgICAgICAgICAgICAgeXl0ZXh0ID0gbGV4ZXIyLnl5dGV4dDtcbiAgICAgICAgICAgICAgeXlsaW5lbm8gPSBsZXhlcjIueXlsaW5lbm87XG4gICAgICAgICAgICAgIHl5bG9jID0gbGV4ZXIyLnl5bGxvYztcbiAgICAgICAgICAgICAgaWYgKHJlY292ZXJpbmcgPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVjb3ZlcmluZy0tO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzeW1ib2wgPSBwcmVFcnJvclN5bWJvbDtcbiAgICAgICAgICAgICAgcHJlRXJyb3JTeW1ib2wgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgbGVuID0gdGhpcy5wcm9kdWN0aW9uc19bYWN0aW9uWzFdXVsxXTtcbiAgICAgICAgICAgIHl5dmFsLiQgPSB2c3RhY2tbdnN0YWNrLmxlbmd0aCAtIGxlbl07XG4gICAgICAgICAgICB5eXZhbC5fJCA9IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5maXJzdF9saW5lLFxuICAgICAgICAgICAgICBsYXN0X2xpbmU6IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gMV0ubGFzdF9saW5lLFxuICAgICAgICAgICAgICBmaXJzdF9jb2x1bW46IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0uZmlyc3RfY29sdW1uLFxuICAgICAgICAgICAgICBsYXN0X2NvbHVtbjogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAxXS5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChyYW5nZXMpIHtcbiAgICAgICAgICAgICAgeXl2YWwuXyQucmFuZ2UgPSBbXG4gICAgICAgICAgICAgICAgbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5yYW5nZVswXSxcbiAgICAgICAgICAgICAgICBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIDFdLnJhbmdlWzFdXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByID0gdGhpcy5wZXJmb3JtQWN0aW9uLmFwcGx5KHl5dmFsLCBbXG4gICAgICAgICAgICAgIHl5dGV4dCxcbiAgICAgICAgICAgICAgeXlsZW5nLFxuICAgICAgICAgICAgICB5eWxpbmVubyxcbiAgICAgICAgICAgICAgc2hhcmVkU3RhdGUueXksXG4gICAgICAgICAgICAgIGFjdGlvblsxXSxcbiAgICAgICAgICAgICAgdnN0YWNrLFxuICAgICAgICAgICAgICBsc3RhY2tcbiAgICAgICAgICAgIF0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsZW4pIHtcbiAgICAgICAgICAgICAgc3RhY2sgPSBzdGFjay5zbGljZSgwLCAtMSAqIGxlbiAqIDIpO1xuICAgICAgICAgICAgICB2c3RhY2sgPSB2c3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgICBsc3RhY2sgPSBsc3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhY2sucHVzaCh0aGlzLnByb2R1Y3Rpb25zX1thY3Rpb25bMV1dWzBdKTtcbiAgICAgICAgICAgIHZzdGFjay5wdXNoKHl5dmFsLiQpO1xuICAgICAgICAgICAgbHN0YWNrLnB1c2goeXl2YWwuXyQpO1xuICAgICAgICAgICAgbmV3U3RhdGUgPSB0YWJsZVtzdGFja1tzdGFjay5sZW5ndGggLSAyXV1bc3RhY2tbc3RhY2subGVuZ3RoIC0gMV1dO1xuICAgICAgICAgICAgc3RhY2sucHVzaChuZXdTdGF0ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSwgXCJwYXJzZVwiKVxuICB9O1xuICB2YXIgbGV4ZXIgPSAvKiBAX19QVVJFX18gKi8gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZXhlcjIgPSB7XG4gICAgICBFT0Y6IDEsXG4gICAgICBwYXJzZUVycm9yOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBhcnNlRXJyb3Ioc3RyLCBoYXNoKSB7XG4gICAgICAgIGlmICh0aGlzLnl5LnBhcnNlcikge1xuICAgICAgICAgIHRoaXMueXkucGFyc2VyLnBhcnNlRXJyb3Ioc3RyLCBoYXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3RyKTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwYXJzZUVycm9yXCIpLFxuICAgICAgLy8gcmVzZXRzIHRoZSBsZXhlciwgc2V0cyBuZXcgaW5wdXRcbiAgICAgIHNldElucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGlucHV0LCB5eSkge1xuICAgICAgICB0aGlzLnl5ID0geXkgfHwgdGhpcy55eSB8fCB7fTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBpbnB1dDtcbiAgICAgICAgdGhpcy5fbW9yZSA9IHRoaXMuX2JhY2t0cmFjayA9IHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnl5bGluZW5vID0gdGhpcy55eWxlbmcgPSAwO1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2ggPSBcIlwiO1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrID0gW1wiSU5JVElBTFwiXTtcbiAgICAgICAgdGhpcy55eWxsb2MgPSB7XG4gICAgICAgICAgZmlyc3RfbGluZTogMSxcbiAgICAgICAgICBmaXJzdF9jb2x1bW46IDAsXG4gICAgICAgICAgbGFzdF9saW5lOiAxLFxuICAgICAgICAgIGxhc3RfY29sdW1uOiAwXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2UgPSBbMCwgMF07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vZmZzZXQgPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwic2V0SW5wdXRcIiksXG4gICAgICAvLyBjb25zdW1lcyBhbmQgcmV0dXJucyBvbmUgY2hhciBmcm9tIHRoZSBpbnB1dFxuICAgICAgaW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjaCA9IHRoaXMuX2lucHV0WzBdO1xuICAgICAgICB0aGlzLnl5dGV4dCArPSBjaDtcbiAgICAgICAgdGhpcy55eWxlbmcrKztcbiAgICAgICAgdGhpcy5vZmZzZXQrKztcbiAgICAgICAgdGhpcy5tYXRjaCArPSBjaDtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IGNoO1xuICAgICAgICB2YXIgbGluZXMgPSBjaC5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8rKztcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2xpbmUrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtbisrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2VbMV0rKztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pbnB1dCA9IHRoaXMuX2lucHV0LnNsaWNlKDEpO1xuICAgICAgICByZXR1cm4gY2g7XG4gICAgICB9LCBcImlucHV0XCIpLFxuICAgICAgLy8gdW5zaGlmdHMgb25lIGNoYXIgKG9yIGEgc3RyaW5nKSBpbnRvIHRoZSBpbnB1dFxuICAgICAgdW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oY2gpIHtcbiAgICAgICAgdmFyIGxlbiA9IGNoLmxlbmd0aDtcbiAgICAgICAgdmFyIGxpbmVzID0gY2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBjaCArIHRoaXMuX2lucHV0O1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMueXl0ZXh0LnN1YnN0cigwLCB0aGlzLnl5dGV4dC5sZW5ndGggLSBsZW4pO1xuICAgICAgICB0aGlzLm9mZnNldCAtPSBsZW47XG4gICAgICAgIHZhciBvbGRMaW5lcyA9IHRoaXMubWF0Y2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5tYXRjaCA9IHRoaXMubWF0Y2guc3Vic3RyKDAsIHRoaXMubWF0Y2gubGVuZ3RoIC0gMSk7XG4gICAgICAgIHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2hlZC5zdWJzdHIoMCwgdGhpcy5tYXRjaGVkLmxlbmd0aCAtIDEpO1xuICAgICAgICBpZiAobGluZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gLT0gbGluZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgciA9IHRoaXMueXlsbG9jLnJhbmdlO1xuICAgICAgICB0aGlzLnl5bGxvYyA9IHtcbiAgICAgICAgICBmaXJzdF9saW5lOiB0aGlzLnl5bGxvYy5maXJzdF9saW5lLFxuICAgICAgICAgIGxhc3RfbGluZTogdGhpcy55eWxpbmVubyArIDEsXG4gICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gKGxpbmVzLmxlbmd0aCA9PT0gb2xkTGluZXMubGVuZ3RoID8gdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uIDogMCkgKyBvbGRMaW5lc1tvbGRMaW5lcy5sZW5ndGggLSBsaW5lcy5sZW5ndGhdLmxlbmd0aCAtIGxpbmVzWzBdLmxlbmd0aCA6IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbiAtIGxlblxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlID0gW3JbMF0sIHJbMF0gKyB0aGlzLnl5bGVuZyAtIGxlbl07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy55eWxlbmcgPSB0aGlzLnl5dGV4dC5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJ1bnB1dFwiKSxcbiAgICAgIC8vIFdoZW4gY2FsbGVkIGZyb20gYWN0aW9uLCBjYWNoZXMgbWF0Y2hlZCB0ZXh0IGFuZCBhcHBlbmRzIGl0IG9uIG5leHQgYWN0aW9uXG4gICAgICBtb3JlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9tb3JlID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcIm1vcmVcIiksXG4gICAgICAvLyBXaGVuIGNhbGxlZCBmcm9tIGFjdGlvbiwgc2lnbmFscyB0aGUgbGV4ZXIgdGhhdCB0aGlzIHJ1bGUgZmFpbHMgdG8gbWF0Y2ggdGhlIGlucHV0LCBzbyB0aGUgbmV4dCBtYXRjaGluZyBydWxlIChyZWdleCkgc2hvdWxkIGJlIHRlc3RlZCBpbnN0ZWFkLlxuICAgICAgcmVqZWN0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2t0cmFja19sZXhlcikge1xuICAgICAgICAgIHRoaXMuX2JhY2t0cmFjayA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gWW91IGNhbiBvbmx5IGludm9rZSByZWplY3QoKSBpbiB0aGUgbGV4ZXIgd2hlbiB0aGUgbGV4ZXIgaXMgb2YgdGhlIGJhY2t0cmFja2luZyBwZXJzdWFzaW9uIChvcHRpb25zLmJhY2t0cmFja19sZXhlciA9IHRydWUpLlxcblwiICsgdGhpcy5zaG93UG9zaXRpb24oKSwge1xuICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgIHRva2VuOiBudWxsLFxuICAgICAgICAgICAgbGluZTogdGhpcy55eWxpbmVub1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJyZWplY3RcIiksXG4gICAgICAvLyByZXRhaW4gZmlyc3QgbiBjaGFyYWN0ZXJzIG9mIHRoZSBtYXRjaFxuICAgICAgbGVzczogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihuKSB7XG4gICAgICAgIHRoaXMudW5wdXQodGhpcy5tYXRjaC5zbGljZShuKSk7XG4gICAgICB9LCBcImxlc3NcIiksXG4gICAgICAvLyBkaXNwbGF5cyBhbHJlYWR5IG1hdGNoZWQgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICBwYXN0SW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwYXN0ID0gdGhpcy5tYXRjaGVkLnN1YnN0cigwLCB0aGlzLm1hdGNoZWQubGVuZ3RoIC0gdGhpcy5tYXRjaC5sZW5ndGgpO1xuICAgICAgICByZXR1cm4gKHBhc3QubGVuZ3RoID4gMjAgPyBcIi4uLlwiIDogXCJcIikgKyBwYXN0LnN1YnN0cigtMjApLnJlcGxhY2UoL1xcbi9nLCBcIlwiKTtcbiAgICAgIH0sIFwicGFzdElucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdXBjb21pbmcgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICB1cGNvbWluZ0lucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV4dCA9IHRoaXMubWF0Y2g7XG4gICAgICAgIGlmIChuZXh0Lmxlbmd0aCA8IDIwKSB7XG4gICAgICAgICAgbmV4dCArPSB0aGlzLl9pbnB1dC5zdWJzdHIoMCwgMjAgLSBuZXh0Lmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChuZXh0LnN1YnN0cigwLCAyMCkgKyAobmV4dC5sZW5ndGggPiAyMCA/IFwiLi4uXCIgOiBcIlwiKSkucmVwbGFjZSgvXFxuL2csIFwiXCIpO1xuICAgICAgfSwgXCJ1cGNvbWluZ0lucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdGhlIGNoYXJhY3RlciBwb3NpdGlvbiB3aGVyZSB0aGUgbGV4aW5nIGVycm9yIG9jY3VycmVkLCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgc2hvd1Bvc2l0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJlID0gdGhpcy5wYXN0SW5wdXQoKTtcbiAgICAgICAgdmFyIGMgPSBuZXcgQXJyYXkocHJlLmxlbmd0aCArIDEpLmpvaW4oXCItXCIpO1xuICAgICAgICByZXR1cm4gcHJlICsgdGhpcy51cGNvbWluZ0lucHV0KCkgKyBcIlxcblwiICsgYyArIFwiXlwiO1xuICAgICAgfSwgXCJzaG93UG9zaXRpb25cIiksXG4gICAgICAvLyB0ZXN0IHRoZSBsZXhlZCB0b2tlbjogcmV0dXJuIEZBTFNFIHdoZW4gbm90IGEgbWF0Y2gsIG90aGVyd2lzZSByZXR1cm4gdG9rZW5cbiAgICAgIHRlc3RfbWF0Y2g6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obWF0Y2gsIGluZGV4ZWRfcnVsZSkge1xuICAgICAgICB2YXIgdG9rZW4sIGxpbmVzLCBiYWNrdXA7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFja3RyYWNrX2xleGVyKSB7XG4gICAgICAgICAgYmFja3VwID0ge1xuICAgICAgICAgICAgeXlsaW5lbm86IHRoaXMueXlsaW5lbm8sXG4gICAgICAgICAgICB5eWxsb2M6IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogdGhpcy55eWxsb2MuZmlyc3RfbGluZSxcbiAgICAgICAgICAgICAgbGFzdF9saW5lOiB0aGlzLmxhc3RfbGluZSxcbiAgICAgICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgICAgIGxhc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHl5dGV4dDogdGhpcy55eXRleHQsXG4gICAgICAgICAgICBtYXRjaDogdGhpcy5tYXRjaCxcbiAgICAgICAgICAgIG1hdGNoZXM6IHRoaXMubWF0Y2hlcyxcbiAgICAgICAgICAgIG1hdGNoZWQ6IHRoaXMubWF0Y2hlZCxcbiAgICAgICAgICAgIHl5bGVuZzogdGhpcy55eWxlbmcsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgX21vcmU6IHRoaXMuX21vcmUsXG4gICAgICAgICAgICBfaW5wdXQ6IHRoaXMuX2lucHV0LFxuICAgICAgICAgICAgeXk6IHRoaXMueXksXG4gICAgICAgICAgICBjb25kaXRpb25TdGFjazogdGhpcy5jb25kaXRpb25TdGFjay5zbGljZSgwKSxcbiAgICAgICAgICAgIGRvbmU6IHRoaXMuZG9uZVxuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICAgIGJhY2t1cC55eWxsb2MucmFuZ2UgPSB0aGlzLnl5bGxvYy5yYW5nZS5zbGljZSgwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMgPSBtYXRjaFswXS5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gKz0gbGluZXMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueXlsbG9jID0ge1xuICAgICAgICAgIGZpcnN0X2xpbmU6IHRoaXMueXlsbG9jLmxhc3RfbGluZSxcbiAgICAgICAgICBsYXN0X2xpbmU6IHRoaXMueXlsaW5lbm8gKyAxLFxuICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubGVuZ3RoIC0gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubWF0Y2goL1xccj9cXG4/LylbMF0ubGVuZ3RoIDogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4gKyBtYXRjaFswXS5sZW5ndGhcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy55eXRleHQgKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2ggKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2hlcyA9IG1hdGNoO1xuICAgICAgICB0aGlzLnl5bGVuZyA9IHRoaXMueXl0ZXh0Lmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZSA9IFt0aGlzLm9mZnNldCwgdGhpcy5vZmZzZXQgKz0gdGhpcy55eWxlbmddO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX21vcmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fYmFja3RyYWNrID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2lucHV0ID0gdGhpcy5faW5wdXQuc2xpY2UobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IG1hdGNoWzBdO1xuICAgICAgICB0b2tlbiA9IHRoaXMucGVyZm9ybUFjdGlvbi5jYWxsKHRoaXMsIHRoaXMueXksIHRoaXMsIGluZGV4ZWRfcnVsZSwgdGhpcy5jb25kaXRpb25TdGFja1t0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgaWYgKHRoaXMuZG9uZSAmJiB0aGlzLl9pbnB1dCkge1xuICAgICAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9iYWNrdHJhY2spIHtcbiAgICAgICAgICBmb3IgKHZhciBrIGluIGJhY2t1cCkge1xuICAgICAgICAgICAgdGhpc1trXSA9IGJhY2t1cFtrXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sIFwidGVzdF9tYXRjaFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIGluIGlucHV0XG4gICAgICBuZXh0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuRU9GO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5faW5wdXQpIHtcbiAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0b2tlbiwgbWF0Y2gsIHRlbXBNYXRjaCwgaW5kZXg7XG4gICAgICAgIGlmICghdGhpcy5fbW9yZSkge1xuICAgICAgICAgIHRoaXMueXl0ZXh0ID0gXCJcIjtcbiAgICAgICAgICB0aGlzLm1hdGNoID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcnVsZXMgPSB0aGlzLl9jdXJyZW50UnVsZXMoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRlbXBNYXRjaCA9IHRoaXMuX2lucHV0Lm1hdGNoKHRoaXMucnVsZXNbcnVsZXNbaV1dKTtcbiAgICAgICAgICBpZiAodGVtcE1hdGNoICYmICghbWF0Y2ggfHwgdGVtcE1hdGNoWzBdLmxlbmd0aCA+IG1hdGNoWzBdLmxlbmd0aCkpIHtcbiAgICAgICAgICAgIG1hdGNoID0gdGVtcE1hdGNoO1xuICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIpIHtcbiAgICAgICAgICAgICAgdG9rZW4gPSB0aGlzLnRlc3RfbWF0Y2godGVtcE1hdGNoLCBydWxlc1tpXSk7XG4gICAgICAgICAgICAgIGlmICh0b2tlbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmFja3RyYWNrKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMub3B0aW9ucy5mbGV4KSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICB0b2tlbiA9IHRoaXMudGVzdF9tYXRjaChtYXRjaCwgcnVsZXNbaW5kZXhdKTtcbiAgICAgICAgICBpZiAodG9rZW4gIT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5faW5wdXQgPT09IFwiXCIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5FT0Y7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gVW5yZWNvZ25pemVkIHRleHQuXFxuXCIgKyB0aGlzLnNob3dQb3NpdGlvbigpLCB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgdG9rZW46IG51bGwsXG4gICAgICAgICAgICBsaW5lOiB0aGlzLnl5bGluZW5vXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibmV4dFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIHRoYXQgaGFzIGEgdG9rZW5cbiAgICAgIGxleDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBsZXgoKSB7XG4gICAgICAgIHZhciByID0gdGhpcy5uZXh0KCk7XG4gICAgICAgIGlmIChyKSB7XG4gICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubGV4KCk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibGV4XCIpLFxuICAgICAgLy8gYWN0aXZhdGVzIGEgbmV3IGxleGVyIGNvbmRpdGlvbiBzdGF0ZSAocHVzaGVzIHRoZSBuZXcgbGV4ZXIgY29uZGl0aW9uIHN0YXRlIG9udG8gdGhlIGNvbmRpdGlvbiBzdGFjaylcbiAgICAgIGJlZ2luOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGJlZ2luKGNvbmRpdGlvbikge1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrLnB1c2goY29uZGl0aW9uKTtcbiAgICAgIH0sIFwiYmVnaW5cIiksXG4gICAgICAvLyBwb3AgdGhlIHByZXZpb3VzbHkgYWN0aXZlIGxleGVyIGNvbmRpdGlvbiBzdGF0ZSBvZmYgdGhlIGNvbmRpdGlvbiBzdGFja1xuICAgICAgcG9wU3RhdGU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcG9wU3RhdGUoKSB7XG4gICAgICAgIHZhciBuID0gdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxO1xuICAgICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFjay5wb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1swXTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwb3BTdGF0ZVwiKSxcbiAgICAgIC8vIHByb2R1Y2UgdGhlIGxleGVyIHJ1bGUgc2V0IHdoaWNoIGlzIGFjdGl2ZSBmb3IgdGhlIGN1cnJlbnRseSBhY3RpdmUgbGV4ZXIgY29uZGl0aW9uIHN0YXRlXG4gICAgICBfY3VycmVudFJ1bGVzOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIF9jdXJyZW50UnVsZXMoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAmJiB0aGlzLmNvbmRpdGlvblN0YWNrW3RoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25zW3RoaXMuY29uZGl0aW9uU3RhY2tbdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxXV0ucnVsZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uc1tcIklOSVRJQUxcIl0ucnVsZXM7XG4gICAgICAgIH1cbiAgICAgIH0sIFwiX2N1cnJlbnRSdWxlc1wiKSxcbiAgICAgIC8vIHJldHVybiB0aGUgY3VycmVudGx5IGFjdGl2ZSBsZXhlciBjb25kaXRpb24gc3RhdGU7IHdoZW4gYW4gaW5kZXggYXJndW1lbnQgaXMgcHJvdmlkZWQgaXQgcHJvZHVjZXMgdGhlIE4tdGggcHJldmlvdXMgY29uZGl0aW9uIHN0YXRlLCBpZiBhdmFpbGFibGVcbiAgICAgIHRvcFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHRvcFN0YXRlKG4pIHtcbiAgICAgICAgbiA9IHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMSAtIE1hdGguYWJzKG4gfHwgMCk7XG4gICAgICAgIGlmIChuID49IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1tuXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gXCJJTklUSUFMXCI7XG4gICAgICAgIH1cbiAgICAgIH0sIFwidG9wU3RhdGVcIiksXG4gICAgICAvLyBhbGlhcyBmb3IgYmVnaW4oY29uZGl0aW9uKVxuICAgICAgcHVzaFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHB1c2hTdGF0ZShjb25kaXRpb24pIHtcbiAgICAgICAgdGhpcy5iZWdpbihjb25kaXRpb24pO1xuICAgICAgfSwgXCJwdXNoU3RhdGVcIiksXG4gICAgICAvLyByZXR1cm4gdGhlIG51bWJlciBvZiBzdGF0ZXMgY3VycmVudGx5IG9uIHRoZSBzdGFja1xuICAgICAgc3RhdGVTdGFja1NpemU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gc3RhdGVTdGFja1NpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aDtcbiAgICAgIH0sIFwic3RhdGVTdGFja1NpemVcIiksXG4gICAgICBvcHRpb25zOiB7IFwiY2FzZS1pbnNlbnNpdGl2ZVwiOiB0cnVlIH0sXG4gICAgICBwZXJmb3JtQWN0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGFub255bW91cyh5eSwgeXlfLCAkYXZvaWRpbmdfbmFtZV9jb2xsaXNpb25zLCBZWV9TVEFSVCkge1xuICAgICAgICB2YXIgWVlTVEFURSA9IFlZX1NUQVJUO1xuICAgICAgICBzd2l0Y2ggKCRhdm9pZGluZ19uYW1lX2NvbGxpc2lvbnMpIHtcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gMTM7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICByZXR1cm4gODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgIHJldHVybiA5O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgcmV0dXJuIDc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICByZXR1cm4gMTQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICB0aGlzLmJlZ2luKFwiYWNjX3RpdGxlXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDE1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiBcImFjY190aXRsZV92YWx1ZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMTpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJhY2NfZGVzY3JcIik7XG4gICAgICAgICAgICByZXR1cm4gMTc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIFwiYWNjX2Rlc2NyX3ZhbHVlXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImFjY19kZXNjcl9tdWx0aWxpbmVcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxNTpcbiAgICAgICAgICAgIHJldHVybiBcImFjY19kZXNjcl9tdWx0aWxpbmVfdmFsdWVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICByZXR1cm4gMjA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE3OlxuICAgICAgICAgICAgcmV0dXJuIDI0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxODpcbiAgICAgICAgICAgIHJldHVybiAyMztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTk6XG4gICAgICAgICAgICByZXR1cm4gNjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgICByZXR1cm4gXCJJTlZBTElEXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSwgXCJhbm9ueW1vdXNcIiksXG4gICAgICBydWxlczogWy9eKD86JSg/IVxceylbXlxcbl0qKS9pLCAvXig/OlteXFx9XSUlW15cXG5dKikvaSwgL14oPzpbXFxuXSspL2ksIC9eKD86XFxzKykvaSwgL14oPzojW15cXG5dKikvaSwgL14oPzp0aW1lbGluZVsgXFx0XStMUlxcYikvaSwgL14oPzp0aW1lbGluZVsgXFx0XStURFxcYikvaSwgL14oPzp0aW1lbGluZVxcYikvaSwgL14oPzp0aXRsZVxcc1teXFxuXSspL2ksIC9eKD86YWNjVGl0bGVcXHMqOlxccyopL2ksIC9eKD86KD8hXFxufHwpKlteXFxuXSopL2ksIC9eKD86YWNjRGVzY3JcXHMqOlxccyopL2ksIC9eKD86KD8hXFxufHwpKlteXFxuXSopL2ksIC9eKD86YWNjRGVzY3JcXHMqXFx7XFxzKikvaSwgL14oPzpbXFx9XSkvaSwgL14oPzpbXlxcfV0qKS9pLCAvXig/OnNlY3Rpb25cXHNbXjpcXG5dKykvaSwgL14oPzo6XFxzKD86W146XFxuXXw6KD8hXFxzKSkrKS9pLCAvXig/OlteIzpcXG5dKykvaSwgL14oPzokKS9pLCAvXig/Oi4pL2ldLFxuICAgICAgY29uZGl0aW9uczogeyBcImFjY19kZXNjcl9tdWx0aWxpbmVcIjogeyBcInJ1bGVzXCI6IFsxNCwgMTVdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImFjY19kZXNjclwiOiB7IFwicnVsZXNcIjogWzEyXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJhY2NfdGl0bGVcIjogeyBcInJ1bGVzXCI6IFsxMF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiSU5JVElBTFwiOiB7IFwicnVsZXNcIjogWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDExLCAxMywgMTYsIDE3LCAxOCwgMTksIDIwXSwgXCJpbmNsdXNpdmVcIjogdHJ1ZSB9IH1cbiAgICB9O1xuICAgIHJldHVybiBsZXhlcjI7XG4gIH0pKCk7XG4gIHBhcnNlcjIubGV4ZXIgPSBsZXhlcjtcbiAgZnVuY3Rpb24gUGFyc2VyKCkge1xuICAgIHRoaXMueXkgPSB7fTtcbiAgfVxuICBfX25hbWUoUGFyc2VyLCBcIlBhcnNlclwiKTtcbiAgUGFyc2VyLnByb3RvdHlwZSA9IHBhcnNlcjI7XG4gIHBhcnNlcjIuUGFyc2VyID0gUGFyc2VyO1xuICByZXR1cm4gbmV3IFBhcnNlcigpO1xufSkoKTtcbnBhcnNlci5wYXJzZXIgPSBwYXJzZXI7XG52YXIgdGltZWxpbmVfZGVmYXVsdCA9IHBhcnNlcjtcblxuLy8gc3JjL2RpYWdyYW1zL3RpbWVsaW5lL3RpbWVsaW5lRGIuanNcbnZhciB0aW1lbGluZURiX2V4cG9ydHMgPSB7fTtcbl9fZXhwb3J0KHRpbWVsaW5lRGJfZXhwb3J0cywge1xuICBhZGRFdmVudDogKCkgPT4gYWRkRXZlbnQsXG4gIGFkZFNlY3Rpb246ICgpID0+IGFkZFNlY3Rpb24sXG4gIGFkZFRhc2s6ICgpID0+IGFkZFRhc2ssXG4gIGFkZFRhc2tPcmc6ICgpID0+IGFkZFRhc2tPcmcsXG4gIGNsZWFyOiAoKSA9PiBjbGVhcjIsXG4gIGRlZmF1bHQ6ICgpID0+IHRpbWVsaW5lRGJfZGVmYXVsdCxcbiAgZ2V0Q29tbW9uRGI6ICgpID0+IGdldENvbW1vbkRiLFxuICBnZXREaXJlY3Rpb246ICgpID0+IGdldERpcmVjdGlvbixcbiAgZ2V0U2VjdGlvbnM6ICgpID0+IGdldFNlY3Rpb25zLFxuICBnZXRUYXNrczogKCkgPT4gZ2V0VGFza3MsXG4gIHNldERpcmVjdGlvbjogKCkgPT4gc2V0RGlyZWN0aW9uXG59KTtcbnZhciBjdXJyZW50U2VjdGlvbiA9IFwiXCI7XG52YXIgY3VycmVudFRhc2tJZCA9IDA7XG52YXIgZGlyZWN0aW9uID0gXCJMUlwiO1xudmFyIHNlY3Rpb25zID0gW107XG52YXIgdGFza3MgPSBbXTtcbnZhciByYXdUYXNrcyA9IFtdO1xudmFyIGdldENvbW1vbkRiID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiBjb21tb25EYl9leHBvcnRzLCBcImdldENvbW1vbkRiXCIpO1xudmFyIGNsZWFyMiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gIHNlY3Rpb25zLmxlbmd0aCA9IDA7XG4gIHRhc2tzLmxlbmd0aCA9IDA7XG4gIGN1cnJlbnRTZWN0aW9uID0gXCJcIjtcbiAgcmF3VGFza3MubGVuZ3RoID0gMDtcbiAgZGlyZWN0aW9uID0gXCJMUlwiO1xuICBjbGVhcigpO1xufSwgXCJjbGVhclwiKTtcbnZhciBzZXREaXJlY3Rpb24gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGRpcikge1xuICBkaXJlY3Rpb24gPSBkaXI7XG59LCBcInNldERpcmVjdGlvblwiKTtcbnZhciBnZXREaXJlY3Rpb24gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZGlyZWN0aW9uO1xufSwgXCJnZXREaXJlY3Rpb25cIik7XG52YXIgYWRkU2VjdGlvbiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24odHh0KSB7XG4gIGN1cnJlbnRTZWN0aW9uID0gdHh0O1xuICBzZWN0aW9ucy5wdXNoKHR4dCk7XG59LCBcImFkZFNlY3Rpb25cIik7XG52YXIgZ2V0U2VjdGlvbnMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gc2VjdGlvbnM7XG59LCBcImdldFNlY3Rpb25zXCIpO1xudmFyIGdldFRhc2tzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgbGV0IGFsbEl0ZW1zUHJvY2Vzc2VkID0gY29tcGlsZVRhc2tzKCk7XG4gIGNvbnN0IG1heERlcHRoID0gMTAwO1xuICBsZXQgaXRlcmF0aW9uQ291bnQgPSAwO1xuICB3aGlsZSAoIWFsbEl0ZW1zUHJvY2Vzc2VkICYmIGl0ZXJhdGlvbkNvdW50IDwgbWF4RGVwdGgpIHtcbiAgICBhbGxJdGVtc1Byb2Nlc3NlZCA9IGNvbXBpbGVUYXNrcygpO1xuICAgIGl0ZXJhdGlvbkNvdW50Kys7XG4gIH1cbiAgdGFza3MucHVzaCguLi5yYXdUYXNrcyk7XG4gIHJldHVybiB0YXNrcztcbn0sIFwiZ2V0VGFza3NcIik7XG52YXIgYWRkVGFzayA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24ocGVyaW9kLCBsZW5ndGgsIGV2ZW50KSB7XG4gIGNvbnN0IHJhd1Rhc2sgPSB7XG4gICAgaWQ6IGN1cnJlbnRUYXNrSWQrKyxcbiAgICBzZWN0aW9uOiBjdXJyZW50U2VjdGlvbixcbiAgICB0eXBlOiBjdXJyZW50U2VjdGlvbixcbiAgICB0YXNrOiBwZXJpb2QsXG4gICAgc2NvcmU6IGxlbmd0aCA/IGxlbmd0aCA6IDAsXG4gICAgLy9pZiBldmVudCBpcyBkZWZpbmVkLCB0aGVuIGFkZCBpdCB0aGUgZXZlbnRzIGFycmF5XG4gICAgZXZlbnRzOiBldmVudCA/IFtldmVudF0gOiBbXVxuICB9O1xuICByYXdUYXNrcy5wdXNoKHJhd1Rhc2spO1xufSwgXCJhZGRUYXNrXCIpO1xudmFyIGFkZEV2ZW50ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihldmVudCkge1xuICBjb25zdCBjdXJyZW50VGFzayA9IHJhd1Rhc2tzLmZpbmQoKHRhc2spID0+IHRhc2suaWQgPT09IGN1cnJlbnRUYXNrSWQgLSAxKTtcbiAgY3VycmVudFRhc2suZXZlbnRzLnB1c2goZXZlbnQpO1xufSwgXCJhZGRFdmVudFwiKTtcbnZhciBhZGRUYXNrT3JnID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihkZXNjcikge1xuICBjb25zdCBuZXdUYXNrID0ge1xuICAgIHNlY3Rpb246IGN1cnJlbnRTZWN0aW9uLFxuICAgIHR5cGU6IGN1cnJlbnRTZWN0aW9uLFxuICAgIGRlc2NyaXB0aW9uOiBkZXNjcixcbiAgICB0YXNrOiBkZXNjcixcbiAgICBjbGFzc2VzOiBbXVxuICB9O1xuICB0YXNrcy5wdXNoKG5ld1Rhc2spO1xufSwgXCJhZGRUYXNrT3JnXCIpO1xudmFyIGNvbXBpbGVUYXNrcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gIGNvbnN0IGNvbXBpbGVUYXNrID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihwb3MpIHtcbiAgICByZXR1cm4gcmF3VGFza3NbcG9zXS5wcm9jZXNzZWQ7XG4gIH0sIFwiY29tcGlsZVRhc2tcIik7XG4gIGxldCBhbGxQcm9jZXNzZWQgPSB0cnVlO1xuICBmb3IgKGNvbnN0IFtpLCByYXdUYXNrXSBvZiByYXdUYXNrcy5lbnRyaWVzKCkpIHtcbiAgICBjb21waWxlVGFzayhpKTtcbiAgICBhbGxQcm9jZXNzZWQgPSBhbGxQcm9jZXNzZWQgJiYgcmF3VGFzay5wcm9jZXNzZWQ7XG4gIH1cbiAgcmV0dXJuIGFsbFByb2Nlc3NlZDtcbn0sIFwiY29tcGlsZVRhc2tzXCIpO1xudmFyIHRpbWVsaW5lRGJfZGVmYXVsdCA9IHtcbiAgY2xlYXI6IGNsZWFyMixcbiAgZ2V0Q29tbW9uRGIsXG4gIGdldERpcmVjdGlvbixcbiAgc2V0RGlyZWN0aW9uLFxuICBhZGRTZWN0aW9uLFxuICBnZXRTZWN0aW9ucyxcbiAgZ2V0VGFza3MsXG4gIGFkZFRhc2ssXG4gIGFkZFRhc2tPcmcsXG4gIGFkZEV2ZW50XG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMvdGltZWxpbmUvdGltZWxpbmVSZW5kZXJlci50c1xuaW1wb3J0IHsgc2VsZWN0IGFzIHNlbGVjdDIgfSBmcm9tIFwiZDNcIjtcblxuLy8gc3JjL2RpYWdyYW1zL3RpbWVsaW5lL3N2Z0RyYXcuanNcbmltcG9ydCB7IGFyYyBhcyBkM2FyYywgc2VsZWN0IH0gZnJvbSBcImQzXCI7XG52YXIgbm9kZUNvdW50ID0gMDtcbnZhciBkcmF3UmVjdCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbSwgcmVjdERhdGEpIHtcbiAgY29uc3QgcmVjdEVsZW0gPSBlbGVtLmFwcGVuZChcInJlY3RcIik7XG4gIHJlY3RFbGVtLmF0dHIoXCJ4XCIsIHJlY3REYXRhLngpO1xuICByZWN0RWxlbS5hdHRyKFwieVwiLCByZWN0RGF0YS55KTtcbiAgcmVjdEVsZW0uYXR0cihcImZpbGxcIiwgcmVjdERhdGEuZmlsbCk7XG4gIHJlY3RFbGVtLmF0dHIoXCJzdHJva2VcIiwgcmVjdERhdGEuc3Ryb2tlKTtcbiAgcmVjdEVsZW0uYXR0cihcIndpZHRoXCIsIHJlY3REYXRhLndpZHRoKTtcbiAgcmVjdEVsZW0uYXR0cihcImhlaWdodFwiLCByZWN0RGF0YS5oZWlnaHQpO1xuICByZWN0RWxlbS5hdHRyKFwicnhcIiwgcmVjdERhdGEucngpO1xuICByZWN0RWxlbS5hdHRyKFwicnlcIiwgcmVjdERhdGEucnkpO1xuICBpZiAocmVjdERhdGEuY2xhc3MgIT09IHZvaWQgMCkge1xuICAgIHJlY3RFbGVtLmF0dHIoXCJjbGFzc1wiLCByZWN0RGF0YS5jbGFzcyk7XG4gIH1cbiAgcmV0dXJuIHJlY3RFbGVtO1xufSwgXCJkcmF3UmVjdFwiKTtcbnZhciBkcmF3RmFjZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbWVudCwgZmFjZURhdGEpIHtcbiAgY29uc3QgcmFkaXVzID0gMTU7XG4gIGNvbnN0IGNpcmNsZUVsZW1lbnQgPSBlbGVtZW50LmFwcGVuZChcImNpcmNsZVwiKS5hdHRyKFwiY3hcIiwgZmFjZURhdGEuY3gpLmF0dHIoXCJjeVwiLCBmYWNlRGF0YS5jeSkuYXR0cihcImNsYXNzXCIsIFwiZmFjZVwiKS5hdHRyKFwiclwiLCByYWRpdXMpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMikuYXR0cihcIm92ZXJmbG93XCIsIFwidmlzaWJsZVwiKTtcbiAgY29uc3QgZmFjZSA9IGVsZW1lbnQuYXBwZW5kKFwiZ1wiKTtcbiAgZmFjZS5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImN4XCIsIGZhY2VEYXRhLmN4IC0gcmFkaXVzIC8gMykuYXR0cihcImN5XCIsIGZhY2VEYXRhLmN5IC0gcmFkaXVzIC8gMykuYXR0cihcInJcIiwgMS41KS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDIpLmF0dHIoXCJmaWxsXCIsIFwiIzY2NlwiKS5hdHRyKFwic3Ryb2tlXCIsIFwiIzY2NlwiKTtcbiAgZmFjZS5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImN4XCIsIGZhY2VEYXRhLmN4ICsgcmFkaXVzIC8gMykuYXR0cihcImN5XCIsIGZhY2VEYXRhLmN5IC0gcmFkaXVzIC8gMykuYXR0cihcInJcIiwgMS41KS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDIpLmF0dHIoXCJmaWxsXCIsIFwiIzY2NlwiKS5hdHRyKFwic3Ryb2tlXCIsIFwiIzY2NlwiKTtcbiAgZnVuY3Rpb24gc21pbGUoZmFjZTIpIHtcbiAgICBjb25zdCBhcmMgPSBkM2FyYygpLnN0YXJ0QW5nbGUoTWF0aC5QSSAvIDIpLmVuZEFuZ2xlKDMgKiAoTWF0aC5QSSAvIDIpKS5pbm5lclJhZGl1cyhyYWRpdXMgLyAyKS5vdXRlclJhZGl1cyhyYWRpdXMgLyAyLjIpO1xuICAgIGZhY2UyLmFwcGVuZChcInBhdGhcIikuYXR0cihcImNsYXNzXCIsIFwibW91dGhcIikuYXR0cihcImRcIiwgYXJjKS5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgZmFjZURhdGEuY3ggKyBcIixcIiArIChmYWNlRGF0YS5jeSArIDIpICsgXCIpXCIpO1xuICB9XG4gIF9fbmFtZShzbWlsZSwgXCJzbWlsZVwiKTtcbiAgZnVuY3Rpb24gc2FkKGZhY2UyKSB7XG4gICAgY29uc3QgYXJjID0gZDNhcmMoKS5zdGFydEFuZ2xlKDMgKiBNYXRoLlBJIC8gMikuZW5kQW5nbGUoNSAqIChNYXRoLlBJIC8gMikpLmlubmVyUmFkaXVzKHJhZGl1cyAvIDIpLm91dGVyUmFkaXVzKHJhZGl1cyAvIDIuMik7XG4gICAgZmFjZTIuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtb3V0aFwiKS5hdHRyKFwiZFwiLCBhcmMpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBmYWNlRGF0YS5jeCArIFwiLFwiICsgKGZhY2VEYXRhLmN5ICsgNykgKyBcIilcIik7XG4gIH1cbiAgX19uYW1lKHNhZCwgXCJzYWRcIik7XG4gIGZ1bmN0aW9uIGFtYml2YWxlbnQoZmFjZTIpIHtcbiAgICBmYWNlMi5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1vdXRoXCIpLmF0dHIoXCJzdHJva2VcIiwgMikuYXR0cihcIngxXCIsIGZhY2VEYXRhLmN4IC0gNSkuYXR0cihcInkxXCIsIGZhY2VEYXRhLmN5ICsgNykuYXR0cihcIngyXCIsIGZhY2VEYXRhLmN4ICsgNSkuYXR0cihcInkyXCIsIGZhY2VEYXRhLmN5ICsgNykuYXR0cihcImNsYXNzXCIsIFwibW91dGhcIikuYXR0cihcInN0cm9rZS13aWR0aFwiLCBcIjFweFwiKS5hdHRyKFwic3Ryb2tlXCIsIFwiIzY2NlwiKTtcbiAgfVxuICBfX25hbWUoYW1iaXZhbGVudCwgXCJhbWJpdmFsZW50XCIpO1xuICBpZiAoZmFjZURhdGEuc2NvcmUgPiAzKSB7XG4gICAgc21pbGUoZmFjZSk7XG4gIH0gZWxzZSBpZiAoZmFjZURhdGEuc2NvcmUgPCAzKSB7XG4gICAgc2FkKGZhY2UpO1xuICB9IGVsc2Uge1xuICAgIGFtYml2YWxlbnQoZmFjZSk7XG4gIH1cbiAgcmV0dXJuIGNpcmNsZUVsZW1lbnQ7XG59LCBcImRyYXdGYWNlXCIpO1xudmFyIGRyYXdDaXJjbGUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW1lbnQsIGNpcmNsZURhdGEpIHtcbiAgY29uc3QgY2lyY2xlRWxlbWVudCA9IGVsZW1lbnQuYXBwZW5kKFwiY2lyY2xlXCIpO1xuICBjaXJjbGVFbGVtZW50LmF0dHIoXCJjeFwiLCBjaXJjbGVEYXRhLmN4KTtcbiAgY2lyY2xlRWxlbWVudC5hdHRyKFwiY3lcIiwgY2lyY2xlRGF0YS5jeSk7XG4gIGNpcmNsZUVsZW1lbnQuYXR0cihcImNsYXNzXCIsIFwiYWN0b3ItXCIgKyBjaXJjbGVEYXRhLnBvcyk7XG4gIGNpcmNsZUVsZW1lbnQuYXR0cihcImZpbGxcIiwgY2lyY2xlRGF0YS5maWxsKTtcbiAgY2lyY2xlRWxlbWVudC5hdHRyKFwic3Ryb2tlXCIsIGNpcmNsZURhdGEuc3Ryb2tlKTtcbiAgY2lyY2xlRWxlbWVudC5hdHRyKFwiclwiLCBjaXJjbGVEYXRhLnIpO1xuICBpZiAoY2lyY2xlRWxlbWVudC5jbGFzcyAhPT0gdm9pZCAwKSB7XG4gICAgY2lyY2xlRWxlbWVudC5hdHRyKFwiY2xhc3NcIiwgY2lyY2xlRWxlbWVudC5jbGFzcyk7XG4gIH1cbiAgaWYgKGNpcmNsZURhdGEudGl0bGUgIT09IHZvaWQgMCkge1xuICAgIGNpcmNsZUVsZW1lbnQuYXBwZW5kKFwidGl0bGVcIikudGV4dChjaXJjbGVEYXRhLnRpdGxlKTtcbiAgfVxuICByZXR1cm4gY2lyY2xlRWxlbWVudDtcbn0sIFwiZHJhd0NpcmNsZVwiKTtcbnZhciBkcmF3VGV4dCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbSwgdGV4dERhdGEpIHtcbiAgY29uc3QgblRleHQgPSB0ZXh0RGF0YS50ZXh0LnJlcGxhY2UoLzxiclxccypcXC8/Pi9naSwgXCIgXCIpO1xuICBjb25zdCB0ZXh0RWxlbSA9IGVsZW0uYXBwZW5kKFwidGV4dFwiKTtcbiAgdGV4dEVsZW0uYXR0cihcInhcIiwgdGV4dERhdGEueCk7XG4gIHRleHRFbGVtLmF0dHIoXCJ5XCIsIHRleHREYXRhLnkpO1xuICB0ZXh0RWxlbS5hdHRyKFwiY2xhc3NcIiwgXCJsZWdlbmRcIik7XG4gIHRleHRFbGVtLnN0eWxlKFwidGV4dC1hbmNob3JcIiwgdGV4dERhdGEuYW5jaG9yKTtcbiAgaWYgKHRleHREYXRhLmNsYXNzICE9PSB2b2lkIDApIHtcbiAgICB0ZXh0RWxlbS5hdHRyKFwiY2xhc3NcIiwgdGV4dERhdGEuY2xhc3MpO1xuICB9XG4gIGNvbnN0IHNwYW4gPSB0ZXh0RWxlbS5hcHBlbmQoXCJ0c3BhblwiKTtcbiAgc3Bhbi5hdHRyKFwieFwiLCB0ZXh0RGF0YS54ICsgdGV4dERhdGEudGV4dE1hcmdpbiAqIDIpO1xuICBzcGFuLnRleHQoblRleHQpO1xuICByZXR1cm4gdGV4dEVsZW07XG59LCBcImRyYXdUZXh0XCIpO1xudmFyIGRyYXdMYWJlbCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbSwgdHh0T2JqZWN0KSB7XG4gIGZ1bmN0aW9uIGdlblBvaW50cyh4LCB5LCB3aWR0aCwgaGVpZ2h0LCBjdXQpIHtcbiAgICByZXR1cm4geCArIFwiLFwiICsgeSArIFwiIFwiICsgKHggKyB3aWR0aCkgKyBcIixcIiArIHkgKyBcIiBcIiArICh4ICsgd2lkdGgpICsgXCIsXCIgKyAoeSArIGhlaWdodCAtIGN1dCkgKyBcIiBcIiArICh4ICsgd2lkdGggLSBjdXQgKiAxLjIpICsgXCIsXCIgKyAoeSArIGhlaWdodCkgKyBcIiBcIiArIHggKyBcIixcIiArICh5ICsgaGVpZ2h0KTtcbiAgfVxuICBfX25hbWUoZ2VuUG9pbnRzLCBcImdlblBvaW50c1wiKTtcbiAgY29uc3QgcG9seWdvbiA9IGVsZW0uYXBwZW5kKFwicG9seWdvblwiKTtcbiAgcG9seWdvbi5hdHRyKFwicG9pbnRzXCIsIGdlblBvaW50cyh0eHRPYmplY3QueCwgdHh0T2JqZWN0LnksIDUwLCAyMCwgNykpO1xuICBwb2x5Z29uLmF0dHIoXCJjbGFzc1wiLCBcImxhYmVsQm94XCIpO1xuICB0eHRPYmplY3QueSA9IHR4dE9iamVjdC55ICsgdHh0T2JqZWN0LmxhYmVsTWFyZ2luO1xuICB0eHRPYmplY3QueCA9IHR4dE9iamVjdC54ICsgMC41ICogdHh0T2JqZWN0LmxhYmVsTWFyZ2luO1xuICBkcmF3VGV4dChlbGVtLCB0eHRPYmplY3QpO1xufSwgXCJkcmF3TGFiZWxcIik7XG52YXIgZHJhd1NlY3Rpb24gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIHNlY3Rpb24sIGNvbmYpIHtcbiAgY29uc3QgZyA9IGVsZW0uYXBwZW5kKFwiZ1wiKTtcbiAgY29uc3QgcmVjdCA9IGdldE5vdGVSZWN0KCk7XG4gIHJlY3QueCA9IHNlY3Rpb24ueDtcbiAgcmVjdC55ID0gc2VjdGlvbi55O1xuICByZWN0LmZpbGwgPSBzZWN0aW9uLmZpbGw7XG4gIHJlY3Qud2lkdGggPSBjb25mLndpZHRoO1xuICByZWN0LmhlaWdodCA9IGNvbmYuaGVpZ2h0O1xuICByZWN0LmNsYXNzID0gXCJqb3VybmV5LXNlY3Rpb24gc2VjdGlvbi10eXBlLVwiICsgc2VjdGlvbi5udW07XG4gIHJlY3QucnggPSAzO1xuICByZWN0LnJ5ID0gMztcbiAgZHJhd1JlY3QoZywgcmVjdCk7XG4gIF9kcmF3VGV4dENhbmRpZGF0ZUZ1bmMoY29uZikoXG4gICAgc2VjdGlvbi50ZXh0LFxuICAgIGcsXG4gICAgcmVjdC54LFxuICAgIHJlY3QueSxcbiAgICByZWN0LndpZHRoLFxuICAgIHJlY3QuaGVpZ2h0LFxuICAgIHsgY2xhc3M6IFwiam91cm5leS1zZWN0aW9uIHNlY3Rpb24tdHlwZS1cIiArIHNlY3Rpb24ubnVtIH0sXG4gICAgY29uZixcbiAgICBzZWN0aW9uLmNvbG91clxuICApO1xufSwgXCJkcmF3U2VjdGlvblwiKTtcbnZhciB0YXNrQ291bnQgPSAtMTtcbnZhciBkcmF3VGFzayA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbSwgdGFzaywgY29uZiwgZGlhZ3JhbUlkKSB7XG4gIGNvbnN0IGNlbnRlciA9IHRhc2sueCArIGNvbmYud2lkdGggLyAyO1xuICBjb25zdCBnID0gZWxlbS5hcHBlbmQoXCJnXCIpO1xuICB0YXNrQ291bnQrKztcbiAgY29uc3QgbWF4SGVpZ2h0ID0gMzAwICsgNSAqIDMwO1xuICBnLmFwcGVuZChcImxpbmVcIikuYXR0cihcImlkXCIsIGRpYWdyYW1JZCArIFwiLXRhc2tcIiArIHRhc2tDb3VudCkuYXR0cihcIngxXCIsIGNlbnRlcikuYXR0cihcInkxXCIsIHRhc2sueSkuYXR0cihcIngyXCIsIGNlbnRlcikuYXR0cihcInkyXCIsIG1heEhlaWdodCkuYXR0cihcImNsYXNzXCIsIFwidGFzay1saW5lXCIpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgXCIxcHhcIikuYXR0cihcInN0cm9rZS1kYXNoYXJyYXlcIiwgXCI0IDJcIikuYXR0cihcInN0cm9rZVwiLCBcIiM2NjZcIik7XG4gIGRyYXdGYWNlKGcsIHtcbiAgICBjeDogY2VudGVyLFxuICAgIGN5OiAzMDAgKyAoNSAtIHRhc2suc2NvcmUpICogMzAsXG4gICAgc2NvcmU6IHRhc2suc2NvcmVcbiAgfSk7XG4gIGNvbnN0IHJlY3QgPSBnZXROb3RlUmVjdCgpO1xuICByZWN0LnggPSB0YXNrLng7XG4gIHJlY3QueSA9IHRhc2sueTtcbiAgcmVjdC5maWxsID0gdGFzay5maWxsO1xuICByZWN0LndpZHRoID0gY29uZi53aWR0aDtcbiAgcmVjdC5oZWlnaHQgPSBjb25mLmhlaWdodDtcbiAgcmVjdC5jbGFzcyA9IFwidGFzayB0YXNrLXR5cGUtXCIgKyB0YXNrLm51bTtcbiAgcmVjdC5yeCA9IDM7XG4gIHJlY3QucnkgPSAzO1xuICBkcmF3UmVjdChnLCByZWN0KTtcbiAgX2RyYXdUZXh0Q2FuZGlkYXRlRnVuYyhjb25mKShcbiAgICB0YXNrLnRhc2ssXG4gICAgZyxcbiAgICByZWN0LngsXG4gICAgcmVjdC55LFxuICAgIHJlY3Qud2lkdGgsXG4gICAgcmVjdC5oZWlnaHQsXG4gICAgeyBjbGFzczogXCJ0YXNrXCIgfSxcbiAgICBjb25mLFxuICAgIHRhc2suY29sb3VyXG4gICk7XG59LCBcImRyYXdUYXNrXCIpO1xudmFyIGRyYXdCYWNrZ3JvdW5kUmVjdCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbSwgYm91bmRzKSB7XG4gIGNvbnN0IHJlY3RFbGVtID0gZHJhd1JlY3QoZWxlbSwge1xuICAgIHg6IGJvdW5kcy5zdGFydHgsXG4gICAgeTogYm91bmRzLnN0YXJ0eSxcbiAgICB3aWR0aDogYm91bmRzLnN0b3B4IC0gYm91bmRzLnN0YXJ0eCxcbiAgICBoZWlnaHQ6IGJvdW5kcy5zdG9weSAtIGJvdW5kcy5zdGFydHksXG4gICAgZmlsbDogYm91bmRzLmZpbGwsXG4gICAgY2xhc3M6IFwicmVjdFwiXG4gIH0pO1xuICByZWN0RWxlbS5sb3dlcigpO1xufSwgXCJkcmF3QmFja2dyb3VuZFJlY3RcIik7XG52YXIgZ2V0VGV4dE9iaiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgeDogMCxcbiAgICB5OiAwLFxuICAgIGZpbGw6IHZvaWQgMCxcbiAgICBcInRleHQtYW5jaG9yXCI6IFwic3RhcnRcIixcbiAgICB3aWR0aDogMTAwLFxuICAgIGhlaWdodDogMTAwLFxuICAgIHRleHRNYXJnaW46IDAsXG4gICAgcng6IDAsXG4gICAgcnk6IDBcbiAgfTtcbn0sIFwiZ2V0VGV4dE9ialwiKTtcbnZhciBnZXROb3RlUmVjdCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gIHJldHVybiB7XG4gICAgeDogMCxcbiAgICB5OiAwLFxuICAgIHdpZHRoOiAxMDAsXG4gICAgYW5jaG9yOiBcInN0YXJ0XCIsXG4gICAgaGVpZ2h0OiAxMDAsXG4gICAgcng6IDAsXG4gICAgcnk6IDBcbiAgfTtcbn0sIFwiZ2V0Tm90ZVJlY3RcIik7XG52YXIgX2RyYXdUZXh0Q2FuZGlkYXRlRnVuYyA9IC8qIEBfX1BVUkVfXyAqLyAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIGJ5VGV4dChjb250ZW50LCBnLCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCB0ZXh0QXR0cnMsIGNvbG91cikge1xuICAgIGNvbnN0IHRleHQgPSBnLmFwcGVuZChcInRleHRcIikuYXR0cihcInhcIiwgeCArIHdpZHRoIC8gMikuYXR0cihcInlcIiwgeSArIGhlaWdodCAvIDIgKyA1KS5zdHlsZShcImZvbnQtY29sb3JcIiwgY29sb3VyKS5zdHlsZShcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpLnRleHQoY29udGVudCk7XG4gICAgX3NldFRleHRBdHRycyh0ZXh0LCB0ZXh0QXR0cnMpO1xuICB9XG4gIF9fbmFtZShieVRleHQsIFwiYnlUZXh0XCIpO1xuICBmdW5jdGlvbiBieVRzcGFuKGNvbnRlbnQsIGcsIHgsIHksIHdpZHRoLCBoZWlnaHQsIHRleHRBdHRycywgY29uZiwgY29sb3VyKSB7XG4gICAgY29uc3QgeyB0YXNrRm9udFNpemUsIHRhc2tGb250RmFtaWx5IH0gPSBjb25mO1xuICAgIGNvbnN0IGxpbmVzID0gY29udGVudC5zcGxpdCgvPGJyXFxzKlxcLz8+L2dpKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBkeSA9IGkgKiB0YXNrRm9udFNpemUgLSB0YXNrRm9udFNpemUgKiAobGluZXMubGVuZ3RoIC0gMSkgLyAyO1xuICAgICAgY29uc3QgdGV4dCA9IGcuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwieFwiLCB4ICsgd2lkdGggLyAyKS5hdHRyKFwieVwiLCB5KS5hdHRyKFwiZmlsbFwiLCBjb2xvdXIpLnN0eWxlKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIikuc3R5bGUoXCJmb250LXNpemVcIiwgdGFza0ZvbnRTaXplKS5zdHlsZShcImZvbnQtZmFtaWx5XCIsIHRhc2tGb250RmFtaWx5KTtcbiAgICAgIHRleHQuYXBwZW5kKFwidHNwYW5cIikuYXR0cihcInhcIiwgeCArIHdpZHRoIC8gMikuYXR0cihcImR5XCIsIGR5KS50ZXh0KGxpbmVzW2ldKTtcbiAgICAgIHRleHQuYXR0cihcInlcIiwgeSArIGhlaWdodCAvIDIpLmF0dHIoXCJkb21pbmFudC1iYXNlbGluZVwiLCBcImNlbnRyYWxcIikuYXR0cihcImFsaWdubWVudC1iYXNlbGluZVwiLCBcImNlbnRyYWxcIik7XG4gICAgICBfc2V0VGV4dEF0dHJzKHRleHQsIHRleHRBdHRycyk7XG4gICAgfVxuICB9XG4gIF9fbmFtZShieVRzcGFuLCBcImJ5VHNwYW5cIik7XG4gIGZ1bmN0aW9uIGJ5Rm8oY29udGVudCwgZywgeCwgeSwgd2lkdGgsIGhlaWdodCwgdGV4dEF0dHJzLCBjb25mKSB7XG4gICAgY29uc3QgYm9keSA9IGcuYXBwZW5kKFwic3dpdGNoXCIpO1xuICAgIGNvbnN0IGYgPSBib2R5LmFwcGVuZChcImZvcmVpZ25PYmplY3RcIikuYXR0cihcInhcIiwgeCkuYXR0cihcInlcIiwgeSkuYXR0cihcIndpZHRoXCIsIHdpZHRoKS5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCkuYXR0cihcInBvc2l0aW9uXCIsIFwiZml4ZWRcIik7XG4gICAgY29uc3QgdGV4dCA9IGYuYXBwZW5kKFwieGh0bWw6ZGl2XCIpLnN0eWxlKFwiZGlzcGxheVwiLCBcInRhYmxlXCIpLnN0eWxlKFwiaGVpZ2h0XCIsIFwiMTAwJVwiKS5zdHlsZShcIndpZHRoXCIsIFwiMTAwJVwiKTtcbiAgICB0ZXh0LmFwcGVuZChcImRpdlwiKS5hdHRyKFwiY2xhc3NcIiwgXCJsYWJlbFwiKS5zdHlsZShcImRpc3BsYXlcIiwgXCJ0YWJsZS1jZWxsXCIpLnN0eWxlKFwidGV4dC1hbGlnblwiLCBcImNlbnRlclwiKS5zdHlsZShcInZlcnRpY2FsLWFsaWduXCIsIFwibWlkZGxlXCIpLnRleHQoY29udGVudCk7XG4gICAgYnlUc3Bhbihjb250ZW50LCBib2R5LCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCB0ZXh0QXR0cnMsIGNvbmYpO1xuICAgIF9zZXRUZXh0QXR0cnModGV4dCwgdGV4dEF0dHJzKTtcbiAgfVxuICBfX25hbWUoYnlGbywgXCJieUZvXCIpO1xuICBmdW5jdGlvbiBfc2V0VGV4dEF0dHJzKHRvVGV4dCwgZnJvbVRleHRBdHRyc0RpY3QpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBmcm9tVGV4dEF0dHJzRGljdCkge1xuICAgICAgaWYgKGtleSBpbiBmcm9tVGV4dEF0dHJzRGljdCkge1xuICAgICAgICB0b1RleHQuYXR0cihrZXksIGZyb21UZXh0QXR0cnNEaWN0W2tleV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBfX25hbWUoX3NldFRleHRBdHRycywgXCJfc2V0VGV4dEF0dHJzXCIpO1xuICByZXR1cm4gZnVuY3Rpb24oY29uZikge1xuICAgIHJldHVybiBjb25mLnRleHRQbGFjZW1lbnQgPT09IFwiZm9cIiA/IGJ5Rm8gOiBjb25mLnRleHRQbGFjZW1lbnQgPT09IFwib2xkXCIgPyBieVRleHQgOiBieVRzcGFuO1xuICB9O1xufSkoKTtcbnZhciBpbml0R3JhcGhpY3MgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGdyYXBoaWNzLCBpZCkge1xuICBub2RlQ291bnQgPSAwO1xuICB0YXNrQ291bnQgPSAtMTtcbiAgZ3JhcGhpY3MuYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCItYXJyb3doZWFkXCIpLmF0dHIoXCJyZWZYXCIsIDUpLmF0dHIoXCJyZWZZXCIsIDIpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCA2KS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDQpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNIDAsMCBWIDQgTDYsMiBaXCIpO1xufSwgXCJpbml0R3JhcGhpY3NcIik7XG5mdW5jdGlvbiB3cmFwKHRleHQsIHdpZHRoKSB7XG4gIHRleHQuZWFjaChmdW5jdGlvbigpIHtcbiAgICB2YXIgdGV4dDIgPSBzZWxlY3QodGhpcyksIHdvcmRzID0gdGV4dDIudGV4dCgpLnNwbGl0KC8oXFxzK3w8YnI+KS8pLnJldmVyc2UoKSwgd29yZCwgbGluZSA9IFtdLCBsaW5lSGVpZ2h0ID0gMS4xLCB5ID0gdGV4dDIuYXR0cihcInlcIiksIGR5ID0gcGFyc2VGbG9hdCh0ZXh0Mi5hdHRyKFwiZHlcIikpLCB0c3BhbiA9IHRleHQyLnRleHQobnVsbCkuYXBwZW5kKFwidHNwYW5cIikuYXR0cihcInhcIiwgMCkuYXR0cihcInlcIiwgeSkuYXR0cihcImR5XCIsIGR5ICsgXCJlbVwiKTtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHdvcmRzLmxlbmd0aDsgaisrKSB7XG4gICAgICB3b3JkID0gd29yZHNbd29yZHMubGVuZ3RoIC0gMSAtIGpdO1xuICAgICAgbGluZS5wdXNoKHdvcmQpO1xuICAgICAgdHNwYW4udGV4dChsaW5lLmpvaW4oXCIgXCIpLnRyaW0oKSk7XG4gICAgICBpZiAodHNwYW4ubm9kZSgpLmdldENvbXB1dGVkVGV4dExlbmd0aCgpID4gd2lkdGggfHwgd29yZCA9PT0gXCI8YnI+XCIpIHtcbiAgICAgICAgbGluZS5wb3AoKTtcbiAgICAgICAgdHNwYW4udGV4dChsaW5lLmpvaW4oXCIgXCIpLnRyaW0oKSk7XG4gICAgICAgIGlmICh3b3JkID09PSBcIjxicj5cIikge1xuICAgICAgICAgIGxpbmUgPSBbXCJcIl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGluZSA9IFt3b3JkXTtcbiAgICAgICAgfVxuICAgICAgICB0c3BhbiA9IHRleHQyLmFwcGVuZChcInRzcGFuXCIpLmF0dHIoXCJ4XCIsIDApLmF0dHIoXCJ5XCIsIHkpLmF0dHIoXCJkeVwiLCBsaW5lSGVpZ2h0ICsgXCJlbVwiKS50ZXh0KHdvcmQpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5fX25hbWUod3JhcCwgXCJ3cmFwXCIpO1xudmFyIGRyYXdOb2RlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihlbGVtLCBub2RlLCBmdWxsU2VjdGlvbiwgY29uZiwgZGlhZ3JhbUlkLCBpc0V2ZW50ID0gZmFsc2UpIHtcbiAgY29uc3QgeyB0aGVtZSwgbG9vayB9ID0gY29uZjtcbiAgY29uc3QgaXNSZWR1eFRoZW1lID0gdGhlbWU/LmluY2x1ZGVzKFwicmVkdXhcIik7XG4gIGNvbnN0IG1heFNlY3Rpb25zID0gY29uZj8udGhlbWVWYXJpYWJsZXM/LlRIRU1FX0NPTE9SX0xJTUlUID8/IDEyO1xuICBjb25zdCBzZWN0aW9uID0gZnVsbFNlY3Rpb24gJSBtYXhTZWN0aW9ucyAtIDE7XG4gIGNvbnN0IG5vZGVFbGVtID0gZWxlbS5hcHBlbmQoXCJnXCIpO1xuICBub2RlLnNlY3Rpb24gPSBzZWN0aW9uO1xuICBub2RlRWxlbS5hdHRyKFxuICAgIFwiY2xhc3NcIixcbiAgICAobm9kZS5jbGFzcyA/IG5vZGUuY2xhc3MgKyBcIiBcIiA6IFwiXCIpICsgXCJ0aW1lbGluZS1ub2RlIFwiICsgKFwic2VjdGlvbi1cIiArIHNlY3Rpb24pXG4gICk7XG4gIGNvbnN0IGJrZ0VsZW0gPSBub2RlRWxlbS5hcHBlbmQoXCJnXCIpO1xuICBjb25zdCB0ZXh0RWxlbSA9IG5vZGVFbGVtLmFwcGVuZChcImdcIik7XG4gIGNvbnN0IHR4dCA9IHRleHRFbGVtLmFwcGVuZChcInRleHRcIikudGV4dChub2RlLmRlc2NyKS5hdHRyKFwiZHlcIiwgXCIxZW1cIikuYXR0cihcImFsaWdubWVudC1iYXNlbGluZVwiLCBcIm1pZGRsZVwiKS5hdHRyKFwiZG9taW5hbnQtYmFzZWxpbmVcIiwgXCJtaWRkbGVcIikuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpLmNhbGwod3JhcCwgbm9kZS53aWR0aCk7XG4gIGNvbnN0IGJib3ggPSB0eHQubm9kZSgpLmdldEJCb3goKTtcbiAgY29uc3QgZm9udFNpemUgPSBjb25mLmZvbnRTaXplPy5yZXBsYWNlID8gY29uZi5mb250U2l6ZS5yZXBsYWNlKFwicHhcIiwgXCJcIikgOiBjb25mLmZvbnRTaXplO1xuICBub2RlLmhlaWdodCA9IGJib3guaGVpZ2h0ICsgZm9udFNpemUgKiAxLjEgKiAwLjUgKyBub2RlLnBhZGRpbmc7XG4gIG5vZGUuaGVpZ2h0ID0gTWF0aC5tYXgobm9kZS5oZWlnaHQsIG5vZGUubWF4SGVpZ2h0KTtcbiAgbm9kZS53aWR0aCA9IG5vZGUud2lkdGggKyAyICogbm9kZS5wYWRkaW5nO1xuICB0ZXh0RWxlbS5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbm9kZS53aWR0aCAvIDIgKyBcIiwgXCIgKyBub2RlLnBhZGRpbmcgLyAyICsgXCIpXCIpO1xuICBpZiAoaXNSZWR1eFRoZW1lKSB7XG4gICAgdGV4dEVsZW0uYXR0cihcbiAgICAgIFwidHJhbnNmb3JtXCIsXG4gICAgICBgdHJhbnNsYXRlKCR7bm9kZS53aWR0aCAvIDJ9LCAke2lzRXZlbnQgPyBub2RlLnBhZGRpbmcgLyAyICsgMyA6IG5vZGUucGFkZGluZ30pYFxuICAgICk7XG4gIH1cbiAgZGVmYXVsdEJrZyhia2dFbGVtLCBub2RlLCBzZWN0aW9uLCBkaWFncmFtSWQsIGNvbmYpO1xuICBpZiAobG9vayA9PT0gXCJuZW9cIikge1xuICAgIG5vZGVFbGVtLmF0dHIoXCJkYXRhLWxvb2tcIiwgYG5lb2ApO1xuICAgIGlmIChpc1JlZHV4VGhlbWUpIHtcbiAgICAgIGNvbnN0IGlzRGFyazIgPSB0aGVtZS5pbmNsdWRlcyhcImRhcmtcIik7XG4gICAgICBjb25zdCByb290U3ZnTm9kZSA9IGVsZW0ubm9kZSgpPy5vd25lclNWR0VsZW1lbnQgPz8gZWxlbS5ub2RlKCk7XG4gICAgICBjb25zdCByb290U3ZnID0gc2VsZWN0KHJvb3RTdmdOb2RlKTtcbiAgICAgIGNvbnN0IHN2Z0lkID0gcm9vdFN2Zy5hdHRyKFwiaWRcIikgPz8gXCJcIjtcbiAgICAgIGNvbnN0IGRyb3BTaGFkb3dJZCA9IHN2Z0lkID8gYCR7c3ZnSWR9LWRyb3Atc2hhZG93YCA6IFwiZHJvcC1zaGFkb3dcIjtcbiAgICAgIGlmIChyb290U3ZnLnNlbGVjdChgIyR7ZHJvcFNoYWRvd0lkfWApLmVtcHR5KCkpIHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdEZWZzID0gcm9vdFN2Zy5zZWxlY3QoXCJkZWZzXCIpO1xuICAgICAgICBjb25zdCBkZWZzRWwgPSBleGlzdGluZ0RlZnMuZW1wdHkoKSA/IHJvb3RTdmcuYXBwZW5kKFwiZGVmc1wiKSA6IGV4aXN0aW5nRGVmcztcbiAgICAgICAgZGVmc0VsLmFwcGVuZChcImZpbHRlclwiKS5hdHRyKFwiaWRcIiwgZHJvcFNoYWRvd0lkKS5hdHRyKFwiaGVpZ2h0XCIsIFwiMTMwJVwiKS5hdHRyKFwid2lkdGhcIiwgXCIxMzAlXCIpLmFwcGVuZChcImZlRHJvcFNoYWRvd1wiKS5hdHRyKFwiZHhcIiwgXCI0XCIpLmF0dHIoXCJkeVwiLCBcIjRcIikuYXR0cihcInN0ZERldmlhdGlvblwiLCAwKS5hdHRyKFwiZmxvb2Qtb3BhY2l0eVwiLCBpc0RhcmsyID8gXCIwLjJcIiA6IFwiMC4wNlwiKS5hdHRyKFwiZmxvb2QtY29sb3JcIiwgaXNEYXJrMiA/IFwiI0ZGRkZGRlwiIDogXCIjMDAwMDAwXCIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbm9kZTtcbn0sIFwiZHJhd05vZGVcIik7XG52YXIgZ2V0VmlydHVhbE5vZGVIZWlnaHQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIG5vZGUsIGNvbmYpIHtcbiAgY29uc3QgdGV4dEVsZW0gPSBlbGVtLmFwcGVuZChcImdcIik7XG4gIGNvbnN0IHR4dCA9IHRleHRFbGVtLmFwcGVuZChcInRleHRcIikudGV4dChub2RlLmRlc2NyKS5hdHRyKFwiZHlcIiwgXCIxZW1cIikuYXR0cihcImFsaWdubWVudC1iYXNlbGluZVwiLCBcIm1pZGRsZVwiKS5hdHRyKFwiZG9taW5hbnQtYmFzZWxpbmVcIiwgXCJtaWRkbGVcIikuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpLmNhbGwod3JhcCwgbm9kZS53aWR0aCk7XG4gIGNvbnN0IGJib3ggPSB0eHQubm9kZSgpLmdldEJCb3goKTtcbiAgY29uc3QgZm9udFNpemUgPSBjb25mLmZvbnRTaXplPy5yZXBsYWNlID8gY29uZi5mb250U2l6ZS5yZXBsYWNlKFwicHhcIiwgXCJcIikgOiBjb25mLmZvbnRTaXplO1xuICB0ZXh0RWxlbS5yZW1vdmUoKTtcbiAgcmV0dXJuIGJib3guaGVpZ2h0ICsgZm9udFNpemUgKiAxLjEgKiAwLjUgKyBub2RlLnBhZGRpbmc7XG59LCBcImdldFZpcnR1YWxOb2RlSGVpZ2h0XCIpO1xudmFyIGRlZmF1bHRCa2cgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIG5vZGUsIHNlY3Rpb24sIGRpYWdyYW1JZCwgY29uZmlnKSB7XG4gIGNvbnN0IHsgdGhlbWUgfSA9IGNvbmZpZztcbiAgY29uc3QgciA9IHRoZW1lPy5pbmNsdWRlcyhcInJlZHV4XCIpID8gMCA6IDU7XG4gIGNvbnN0IHJkID0gNTtcbiAgY29uc3QgZCA9IHIgPiAwID8gYE0wICR7bm9kZS5oZWlnaHQgLSByZH0gdiR7LW5vZGUuaGVpZ2h0ICsgMiAqIHJkfSBxMCwtJHtyfSwke3J9LC0ke3J9IGgke25vZGUud2lkdGggLSAyICogcmR9IHEke3J9LDAsJHtyfSwke3J9IHYke25vZGUuaGVpZ2h0IC0gcmR9IEgwIFpgIDogYE0wICR7bm9kZS5oZWlnaHQgLSByZH0gdiR7LShub2RlLmhlaWdodCAtIHJkKX0gaCR7bm9kZS53aWR0aH0gdiR7bm9kZS5oZWlnaHR9IEgwIFpgO1xuICBlbGVtLmFwcGVuZChcInBhdGhcIikuYXR0cihcImlkXCIsIGRpYWdyYW1JZCArIFwiLW5vZGUtXCIgKyBub2RlQ291bnQrKykuYXR0cihcImNsYXNzXCIsIFwibm9kZS1ia2cgbm9kZS1cIiArIG5vZGUudHlwZSkuYXR0cihcImRcIiwgZCk7XG4gIGlmICghdGhlbWU/LmluY2x1ZGVzKFwicmVkdXhcIikpIHtcbiAgICBlbGVtLmFwcGVuZChcImxpbmVcIikuYXR0cihcImNsYXNzXCIsIFwibm9kZS1saW5lLVwiICsgc2VjdGlvbikuYXR0cihcIngxXCIsIDApLmF0dHIoXCJ5MVwiLCBub2RlLmhlaWdodCkuYXR0cihcIngyXCIsIG5vZGUud2lkdGgpLmF0dHIoXCJ5MlwiLCBub2RlLmhlaWdodCk7XG4gIH1cbn0sIFwiZGVmYXVsdEJrZ1wiKTtcbnZhciBzdmdEcmF3X2RlZmF1bHQgPSB7XG4gIGRyYXdSZWN0LFxuICBkcmF3Q2lyY2xlLFxuICBkcmF3U2VjdGlvbixcbiAgZHJhd1RleHQsXG4gIGRyYXdMYWJlbCxcbiAgZHJhd1Rhc2ssXG4gIGRyYXdCYWNrZ3JvdW5kUmVjdCxcbiAgZ2V0VGV4dE9iaixcbiAgZ2V0Tm90ZVJlY3QsXG4gIGluaXRHcmFwaGljcyxcbiAgZHJhd05vZGUsXG4gIGdldFZpcnR1YWxOb2RlSGVpZ2h0XG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMvdGltZWxpbmUvdGltZWxpbmVSZW5kZXJlci50c1xudmFyIGRyYXcgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHRleHQsIGlkLCB2ZXJzaW9uLCBkaWFnT2JqKSB7XG4gIGNvbnN0IGNvbmYgPSBnZXRDb25maWcyKCk7XG4gIGNvbnN0IHsgbG9vaywgdGhlbWUsIHRoZW1lVmFyaWFibGVzIH0gPSBjb25mO1xuICBjb25zdCB7IHVzZUdyYWRpZW50LCBncmFkaWVudFN0YXJ0LCBncmFkaWVudFN0b3AgfSA9IHRoZW1lVmFyaWFibGVzO1xuICBjb25zdCBMRUZUX01BUkdJTiA9IGNvbmYudGltZWxpbmU/LmxlZnRNYXJnaW4gPz8gNTA7XG4gIGxvZy5kZWJ1ZyhcInRpbWVsaW5lXCIsIGRpYWdPYmouZGIpO1xuICBjb25zdCBzZWN1cml0eUxldmVsID0gY29uZi5zZWN1cml0eUxldmVsO1xuICBsZXQgc2FuZGJveEVsZW1lbnQ7XG4gIGlmIChzZWN1cml0eUxldmVsID09PSBcInNhbmRib3hcIikge1xuICAgIHNhbmRib3hFbGVtZW50ID0gc2VsZWN0MihcIiNpXCIgKyBpZCk7XG4gIH1cbiAgY29uc3Qgcm9vdCA9IHNlY3VyaXR5TGV2ZWwgPT09IFwic2FuZGJveFwiID8gc2VsZWN0MihzYW5kYm94RWxlbWVudC5ub2RlcygpWzBdLmNvbnRlbnREb2N1bWVudC5ib2R5KSA6IHNlbGVjdDIoXCJib2R5XCIpO1xuICBjb25zdCBzdmcgPSByb290LnNlbGVjdChcIiNcIiArIGlkKTtcbiAgc3ZnLmFwcGVuZChcImdcIik7XG4gIGNvbnN0IHRhc2tzMiA9IGRpYWdPYmouZGIuZ2V0VGFza3MoKTtcbiAgY29uc3QgdGl0bGUgPSBkaWFnT2JqLmRiLmdldENvbW1vbkRiKCkuZ2V0RGlhZ3JhbVRpdGxlKCk7XG4gIGxvZy5kZWJ1ZyhcInRhc2tcIiwgdGFza3MyKTtcbiAgc3ZnRHJhd19kZWZhdWx0LmluaXRHcmFwaGljcyhzdmcsIGlkKTtcbiAgY29uc3Qgc2VjdGlvbnMyID0gZGlhZ09iai5kYi5nZXRTZWN0aW9ucygpO1xuICBsb2cuZGVidWcoXCJzZWN0aW9uc1wiLCBzZWN0aW9uczIpO1xuICBsZXQgbWF4U2VjdGlvbkhlaWdodCA9IDA7XG4gIGxldCBtYXhUYXNrSGVpZ2h0ID0gMDtcbiAgbGV0IGRlcHRoWSA9IDA7XG4gIGxldCBzZWN0aW9uQmVnaW5ZID0gMDtcbiAgbGV0IG1hc3RlclggPSA1MCArIExFRlRfTUFSR0lOO1xuICBsZXQgbWFzdGVyWSA9IDUwO1xuICBzZWN0aW9uQmVnaW5ZID0gNTA7XG4gIGxldCBzZWN0aW9uTnVtYmVyID0gMDtcbiAgbGV0IGhhc1NlY3Rpb25zID0gdHJ1ZTtcbiAgc2VjdGlvbnMyLmZvckVhY2goZnVuY3Rpb24oc2VjdGlvbikge1xuICAgIGNvbnN0IHNlY3Rpb25Ob2RlID0ge1xuICAgICAgbnVtYmVyOiBzZWN0aW9uTnVtYmVyLFxuICAgICAgZGVzY3I6IHNlY3Rpb24sXG4gICAgICBzZWN0aW9uOiBzZWN0aW9uTnVtYmVyLFxuICAgICAgd2lkdGg6IDE1MCxcbiAgICAgIHBhZGRpbmc6IDIwLFxuICAgICAgbWF4SGVpZ2h0OiBtYXhTZWN0aW9uSGVpZ2h0XG4gICAgfTtcbiAgICBjb25zdCBzZWN0aW9uSGVpZ2h0ID0gc3ZnRHJhd19kZWZhdWx0LmdldFZpcnR1YWxOb2RlSGVpZ2h0KHN2Zywgc2VjdGlvbk5vZGUsIGNvbmYpO1xuICAgIGxvZy5kZWJ1ZyhcInNlY3Rpb25IZWlnaHQgYmVmb3JlIGRyYXdcIiwgc2VjdGlvbkhlaWdodCk7XG4gICAgbWF4U2VjdGlvbkhlaWdodCA9IE1hdGgubWF4KG1heFNlY3Rpb25IZWlnaHQsIHNlY3Rpb25IZWlnaHQgKyAyMCk7XG4gIH0pO1xuICBsZXQgbWF4RXZlbnRDb3VudCA9IDA7XG4gIGxldCBtYXhFdmVudExpbmVMZW5ndGggPSAwO1xuICBsb2cuZGVidWcoXCJ0YXNrcy5sZW5ndGhcIiwgdGFza3MyLmxlbmd0aCk7XG4gIGZvciAoY29uc3QgW2ksIHRhc2tdIG9mIHRhc2tzMi5lbnRyaWVzKCkpIHtcbiAgICBjb25zdCB0YXNrTm9kZSA9IHtcbiAgICAgIG51bWJlcjogaSxcbiAgICAgIGRlc2NyOiB0YXNrLFxuICAgICAgc2VjdGlvbjogdGFzay5zZWN0aW9uLFxuICAgICAgd2lkdGg6IDE1MCxcbiAgICAgIHBhZGRpbmc6IDIwLFxuICAgICAgbWF4SGVpZ2h0OiBtYXhUYXNrSGVpZ2h0XG4gICAgfTtcbiAgICBjb25zdCB0YXNrSGVpZ2h0ID0gc3ZnRHJhd19kZWZhdWx0LmdldFZpcnR1YWxOb2RlSGVpZ2h0KHN2ZywgdGFza05vZGUsIGNvbmYpO1xuICAgIGxvZy5kZWJ1ZyhcInRhc2tIZWlnaHQgYmVmb3JlIGRyYXdcIiwgdGFza0hlaWdodCk7XG4gICAgbWF4VGFza0hlaWdodCA9IE1hdGgubWF4KG1heFRhc2tIZWlnaHQsIHRhc2tIZWlnaHQgKyAyMCk7XG4gICAgbWF4RXZlbnRDb3VudCA9IE1hdGgubWF4KG1heEV2ZW50Q291bnQsIHRhc2suZXZlbnRzLmxlbmd0aCk7XG4gICAgbGV0IG1heEV2ZW50TGluZUxlbmd0aFRlbXAgPSAwO1xuICAgIGZvciAoY29uc3QgZXZlbnQgb2YgdGFzay5ldmVudHMpIHtcbiAgICAgIGNvbnN0IGV2ZW50Tm9kZSA9IHtcbiAgICAgICAgZGVzY3I6IGV2ZW50LFxuICAgICAgICBzZWN0aW9uOiB0YXNrLnNlY3Rpb24sXG4gICAgICAgIG51bWJlcjogdGFzay5zZWN0aW9uLFxuICAgICAgICB3aWR0aDogMTUwLFxuICAgICAgICBwYWRkaW5nOiAyMCxcbiAgICAgICAgbWF4SGVpZ2h0OiA1MFxuICAgICAgfTtcbiAgICAgIG1heEV2ZW50TGluZUxlbmd0aFRlbXAgKz0gc3ZnRHJhd19kZWZhdWx0LmdldFZpcnR1YWxOb2RlSGVpZ2h0KHN2ZywgZXZlbnROb2RlLCBjb25mKTtcbiAgICB9XG4gICAgaWYgKHRhc2suZXZlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgIG1heEV2ZW50TGluZUxlbmd0aFRlbXAgKz0gKHRhc2suZXZlbnRzLmxlbmd0aCAtIDEpICogMTA7XG4gICAgfVxuICAgIG1heEV2ZW50TGluZUxlbmd0aCA9IE1hdGgubWF4KG1heEV2ZW50TGluZUxlbmd0aCwgbWF4RXZlbnRMaW5lTGVuZ3RoVGVtcCk7XG4gIH1cbiAgbG9nLmRlYnVnKFwibWF4U2VjdGlvbkhlaWdodCBiZWZvcmUgZHJhd1wiLCBtYXhTZWN0aW9uSGVpZ2h0KTtcbiAgbG9nLmRlYnVnKFwibWF4VGFza0hlaWdodCBiZWZvcmUgZHJhd1wiLCBtYXhUYXNrSGVpZ2h0KTtcbiAgaWYgKHNlY3Rpb25zMiAmJiBzZWN0aW9uczIubGVuZ3RoID4gMCkge1xuICAgIHNlY3Rpb25zMi5mb3JFYWNoKChzZWN0aW9uKSA9PiB7XG4gICAgICBjb25zdCB0YXNrc0ZvclNlY3Rpb24gPSB0YXNrczIuZmlsdGVyKCh0YXNrKSA9PiB0YXNrLnNlY3Rpb24gPT09IHNlY3Rpb24pO1xuICAgICAgY29uc3Qgc2VjdGlvbk5vZGUgPSB7XG4gICAgICAgIG51bWJlcjogc2VjdGlvbk51bWJlcixcbiAgICAgICAgZGVzY3I6IHNlY3Rpb24sXG4gICAgICAgIHNlY3Rpb246IHNlY3Rpb25OdW1iZXIsXG4gICAgICAgIHdpZHRoOiAyMDAgKiBNYXRoLm1heCh0YXNrc0ZvclNlY3Rpb24ubGVuZ3RoLCAxKSAtIDUwLFxuICAgICAgICBwYWRkaW5nOiAyMCxcbiAgICAgICAgbWF4SGVpZ2h0OiBtYXhTZWN0aW9uSGVpZ2h0XG4gICAgICB9O1xuICAgICAgbG9nLmRlYnVnKFwic2VjdGlvbk5vZGVcIiwgc2VjdGlvbk5vZGUpO1xuICAgICAgY29uc3Qgc2VjdGlvbk5vZGVXcmFwcGVyID0gc3ZnLmFwcGVuZChcImdcIik7XG4gICAgICBjb25zdCBub2RlID0gc3ZnRHJhd19kZWZhdWx0LmRyYXdOb2RlKHNlY3Rpb25Ob2RlV3JhcHBlciwgc2VjdGlvbk5vZGUsIHNlY3Rpb25OdW1iZXIsIGNvbmYsIGlkKTtcbiAgICAgIGxvZy5kZWJ1ZyhcInNlY3Rpb25Ob2RlIG91dHB1dFwiLCBub2RlKTtcbiAgICAgIHNlY3Rpb25Ob2RlV3JhcHBlci5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHttYXN0ZXJYfSwgJHtzZWN0aW9uQmVnaW5ZfSlgKTtcbiAgICAgIG1hc3RlclkgKz0gbWF4U2VjdGlvbkhlaWdodCArIDUwO1xuICAgICAgaWYgKHRhc2tzRm9yU2VjdGlvbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIGRyYXdUYXNrcyhcbiAgICAgICAgICBzdmcsXG4gICAgICAgICAgdGFza3NGb3JTZWN0aW9uLFxuICAgICAgICAgIHNlY3Rpb25OdW1iZXIsXG4gICAgICAgICAgbWFzdGVyWCxcbiAgICAgICAgICBtYXN0ZXJZLFxuICAgICAgICAgIG1heFRhc2tIZWlnaHQsXG4gICAgICAgICAgY29uZixcbiAgICAgICAgICBtYXhFdmVudENvdW50LFxuICAgICAgICAgIG1heEV2ZW50TGluZUxlbmd0aCxcbiAgICAgICAgICBtYXhTZWN0aW9uSGVpZ2h0LFxuICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgIGlkXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBtYXN0ZXJYICs9IDIwMCAqIE1hdGgubWF4KHRhc2tzRm9yU2VjdGlvbi5sZW5ndGgsIDEpO1xuICAgICAgbWFzdGVyWSA9IHNlY3Rpb25CZWdpblk7XG4gICAgICBzZWN0aW9uTnVtYmVyKys7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgaGFzU2VjdGlvbnMgPSBmYWxzZTtcbiAgICBkcmF3VGFza3MoXG4gICAgICBzdmcsXG4gICAgICB0YXNrczIsXG4gICAgICBzZWN0aW9uTnVtYmVyLFxuICAgICAgbWFzdGVyWCxcbiAgICAgIG1hc3RlclksXG4gICAgICBtYXhUYXNrSGVpZ2h0LFxuICAgICAgY29uZixcbiAgICAgIG1heEV2ZW50Q291bnQsXG4gICAgICBtYXhFdmVudExpbmVMZW5ndGgsXG4gICAgICBtYXhTZWN0aW9uSGVpZ2h0LFxuICAgICAgdHJ1ZSxcbiAgICAgIGlkXG4gICAgKTtcbiAgfVxuICBjb25zdCBib3ggPSBzdmcubm9kZSgpLmdldEJCb3goKTtcbiAgbG9nLmRlYnVnKFwiYm91bmRzXCIsIGJveCk7XG4gIGlmICh0aXRsZSkge1xuICAgIHN2Zy5hcHBlbmQoXCJ0ZXh0XCIpLnRleHQodGl0bGUpLmF0dHIoXCJ4XCIsIGxvb2sgPT09IFwibmVvXCIgPyBib3gueCAqIDIgKyBMRUZUX01BUkdJTiA6IGJveC53aWR0aCAvIDIgLSBMRUZUX01BUkdJTikuYXR0cihcImZvbnQtc2l6ZVwiLCBcIjRleFwiKS5hdHRyKFwiZm9udC13ZWlnaHRcIiwgXCJib2xkXCIpLmF0dHIoXCJ5XCIsIDIwKTtcbiAgfVxuICBkZXB0aFkgPSBoYXNTZWN0aW9ucyA/IG1heFNlY3Rpb25IZWlnaHQgKyBtYXhUYXNrSGVpZ2h0ICsgMTUwIDogbWF4VGFza0hlaWdodCArIDEwMDtcbiAgY29uc3QgbGluZVdyYXBwZXIgPSBzdmcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJsaW5lV3JhcHBlclwiKTtcbiAgbGluZVdyYXBwZXIuYXBwZW5kKFwibGluZVwiKS5hdHRyKFwieDFcIiwgTEVGVF9NQVJHSU4pLmF0dHIoXCJ5MVwiLCBkZXB0aFkpLmF0dHIoXCJ4MlwiLCBib3gud2lkdGggKyAzICogTEVGVF9NQVJHSU4pLmF0dHIoXCJ5MlwiLCBkZXB0aFkpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgNCkuYXR0cihcInN0cm9rZVwiLCBcImJsYWNrXCIpLmF0dHIoXCJtYXJrZXItZW5kXCIsIGB1cmwoIyR7aWR9LWFycm93aGVhZClgKTtcbiAgaWYgKGxvb2sgPT09IFwibmVvXCIgJiYgdXNlR3JhZGllbnQgJiYgdGhlbWUgIT09IFwibmV1dHJhbFwiKSB7XG4gICAgY29uc3QgZXhpc3RpbmdEZWZzID0gc3ZnLnNlbGVjdChcImRlZnNcIik7XG4gICAgY29uc3QgZGVmc0VsID0gZXhpc3RpbmdEZWZzLmVtcHR5KCkgPyBzdmcuYXBwZW5kKFwiZGVmc1wiKSA6IGV4aXN0aW5nRGVmcztcbiAgICBjb25zdCBncmFkaWVudCA9IGRlZnNFbC5hcHBlbmQoXCJsaW5lYXJHcmFkaWVudFwiKS5hdHRyKFwiaWRcIiwgc3ZnLmF0dHIoXCJpZFwiKSArIFwiLWdyYWRpZW50XCIpLmF0dHIoXCJncmFkaWVudFVuaXRzXCIsIFwib2JqZWN0Qm91bmRpbmdCb3hcIikuYXR0cihcIngxXCIsIFwiMCVcIikuYXR0cihcInkxXCIsIFwiMCVcIikuYXR0cihcIngyXCIsIFwiMTAwJVwiKS5hdHRyKFwieTJcIiwgXCIwJVwiKTtcbiAgICBncmFkaWVudC5hcHBlbmQoXCJzdG9wXCIpLmF0dHIoXCJvZmZzZXRcIiwgXCIwJVwiKS5hdHRyKFwic3RvcC1jb2xvclwiLCBncmFkaWVudFN0YXJ0KS5hdHRyKFwic3RvcC1vcGFjaXR5XCIsIDEpO1xuICAgIGdyYWRpZW50LmFwcGVuZChcInN0b3BcIikuYXR0cihcIm9mZnNldFwiLCBcIjEwMCVcIikuYXR0cihcInN0b3AtY29sb3JcIiwgZ3JhZGllbnRTdG9wKS5hdHRyKFwic3RvcC1vcGFjaXR5XCIsIDEpO1xuICB9XG4gIHNldHVwR3JhcGhWaWV3Ym94KFxuICAgIHZvaWQgMCxcbiAgICBzdmcsXG4gICAgY29uZi50aW1lbGluZT8ucGFkZGluZyA/PyA1MCxcbiAgICBjb25mLnRpbWVsaW5lPy51c2VNYXhXaWR0aCA/PyBmYWxzZVxuICApO1xufSwgXCJkcmF3XCIpO1xudmFyIGRyYXdUYXNrcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZGlhZ3JhbTIsIHRhc2tzMiwgc2VjdGlvbkNvbG9yLCBtYXN0ZXJYLCBtYXN0ZXJZLCBtYXhUYXNrSGVpZ2h0LCBjb25mLCBtYXhFdmVudENvdW50LCBtYXhFdmVudExpbmVMZW5ndGgsIG1heFNlY3Rpb25IZWlnaHQsIGlzV2l0aG91dFNlY3Rpb25zLCBkaWFncmFtSWQpIHtcbiAgZm9yIChjb25zdCB0YXNrIG9mIHRhc2tzMikge1xuICAgIGNvbnN0IHRhc2tOb2RlID0ge1xuICAgICAgZGVzY3I6IHRhc2sudGFzayxcbiAgICAgIHNlY3Rpb246IHNlY3Rpb25Db2xvcixcbiAgICAgIG51bWJlcjogc2VjdGlvbkNvbG9yLFxuICAgICAgd2lkdGg6IDE1MCxcbiAgICAgIHBhZGRpbmc6IDIwLFxuICAgICAgbWF4SGVpZ2h0OiBtYXhUYXNrSGVpZ2h0XG4gICAgfTtcbiAgICBsb2cuZGVidWcoXCJ0YXNrTm9kZVwiLCB0YXNrTm9kZSk7XG4gICAgY29uc3QgdGFza1dyYXBwZXIgPSBkaWFncmFtMi5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcInRhc2tXcmFwcGVyXCIpO1xuICAgIGNvbnN0IG5vZGUgPSBzdmdEcmF3X2RlZmF1bHQuZHJhd05vZGUodGFza1dyYXBwZXIsIHRhc2tOb2RlLCBzZWN0aW9uQ29sb3IsIGNvbmYsIGRpYWdyYW1JZCk7XG4gICAgY29uc3QgdGFza0hlaWdodCA9IG5vZGUuaGVpZ2h0O1xuICAgIGxvZy5kZWJ1ZyhcInRhc2tIZWlnaHQgYWZ0ZXIgZHJhd1wiLCB0YXNrSGVpZ2h0KTtcbiAgICB0YXNrV3JhcHBlci5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHttYXN0ZXJYfSwgJHttYXN0ZXJZfSlgKTtcbiAgICBtYXhUYXNrSGVpZ2h0ID0gTWF0aC5tYXgobWF4VGFza0hlaWdodCwgdGFza0hlaWdodCk7XG4gICAgaWYgKHRhc2suZXZlbnRzKSB7XG4gICAgICBjb25zdCBsaW5lV3JhcHBlciA9IGRpYWdyYW0yLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwibGluZVdyYXBwZXJcIik7XG4gICAgICBsZXQgbGluZUxlbmd0aCA9IG1heFRhc2tIZWlnaHQ7XG4gICAgICBtYXN0ZXJZICs9IDEwMDtcbiAgICAgIGxpbmVMZW5ndGggPSBsaW5lTGVuZ3RoICsgZHJhd0V2ZW50cyhkaWFncmFtMiwgdGFzay5ldmVudHMsIHNlY3Rpb25Db2xvciwgbWFzdGVyWCwgbWFzdGVyWSwgY29uZiwgZGlhZ3JhbUlkKTtcbiAgICAgIG1hc3RlclkgLT0gMTAwO1xuICAgICAgbGluZVdyYXBwZXIuYXBwZW5kKFwibGluZVwiKS5hdHRyKFwieDFcIiwgbWFzdGVyWCArIDE5MCAvIDIpLmF0dHIoXCJ5MVwiLCBtYXN0ZXJZICsgbWF4VGFza0hlaWdodCkuYXR0cihcIngyXCIsIG1hc3RlclggKyAxOTAgLyAyKS5hdHRyKFwieTJcIiwgbWFzdGVyWSArIG1heFRhc2tIZWlnaHQgKyAxMDAgKyBtYXhFdmVudExpbmVMZW5ndGggKyAxMDApLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMikuYXR0cihcInN0cm9rZVwiLCBcImJsYWNrXCIpLmF0dHIoXCJtYXJrZXItZW5kXCIsIGB1cmwoIyR7ZGlhZ3JhbUlkfS1hcnJvd2hlYWQpYCkuYXR0cihcInN0cm9rZS1kYXNoYXJyYXlcIiwgXCI1LDVcIik7XG4gICAgfVxuICAgIG1hc3RlclggPSBtYXN0ZXJYICsgMjAwO1xuICAgIGlmIChpc1dpdGhvdXRTZWN0aW9ucyAmJiAhY29uZi50aW1lbGluZT8uZGlzYWJsZU11bHRpY29sb3IpIHtcbiAgICAgIHNlY3Rpb25Db2xvcisrO1xuICAgIH1cbiAgfVxuICBtYXN0ZXJZID0gbWFzdGVyWSAtIDEwO1xufSwgXCJkcmF3VGFza3NcIik7XG52YXIgZHJhd0V2ZW50cyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZGlhZ3JhbTIsIGV2ZW50cywgc2VjdGlvbkNvbG9yLCBtYXN0ZXJYLCBtYXN0ZXJZLCBjb25mLCBkaWFncmFtSWQpIHtcbiAgbGV0IG1heEV2ZW50SGVpZ2h0ID0gMDtcbiAgY29uc3QgZXZlbnRCZWdpblkgPSBtYXN0ZXJZO1xuICBtYXN0ZXJZID0gbWFzdGVyWSArIDEwMDtcbiAgZm9yIChjb25zdCBldmVudCBvZiBldmVudHMpIHtcbiAgICBjb25zdCBldmVudE5vZGUgPSB7XG4gICAgICBkZXNjcjogZXZlbnQsXG4gICAgICBzZWN0aW9uOiBzZWN0aW9uQ29sb3IsXG4gICAgICBudW1iZXI6IHNlY3Rpb25Db2xvcixcbiAgICAgIHdpZHRoOiAxNTAsXG4gICAgICBwYWRkaW5nOiAyMCxcbiAgICAgIG1heEhlaWdodDogNTBcbiAgICB9O1xuICAgIGxvZy5kZWJ1ZyhcImV2ZW50Tm9kZVwiLCBldmVudE5vZGUpO1xuICAgIGNvbnN0IGV2ZW50V3JhcHBlciA9IGRpYWdyYW0yLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwiZXZlbnRXcmFwcGVyXCIpO1xuICAgIGNvbnN0IG5vZGUgPSBzdmdEcmF3X2RlZmF1bHQuZHJhd05vZGUoZXZlbnRXcmFwcGVyLCBldmVudE5vZGUsIHNlY3Rpb25Db2xvciwgY29uZiwgZGlhZ3JhbUlkLCB0cnVlKTtcbiAgICBjb25zdCBldmVudEhlaWdodCA9IG5vZGUuaGVpZ2h0O1xuICAgIG1heEV2ZW50SGVpZ2h0ID0gbWF4RXZlbnRIZWlnaHQgKyBldmVudEhlaWdodDtcbiAgICBldmVudFdyYXBwZXIuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7bWFzdGVyWH0sICR7bWFzdGVyWX0pYCk7XG4gICAgbWFzdGVyWSA9IG1hc3RlclkgKyAxMCArIGV2ZW50SGVpZ2h0O1xuICB9XG4gIG1hc3RlclkgPSBldmVudEJlZ2luWTtcbiAgcmV0dXJuIG1heEV2ZW50SGVpZ2h0O1xufSwgXCJkcmF3RXZlbnRzXCIpO1xudmFyIHRpbWVsaW5lUmVuZGVyZXJfZGVmYXVsdCA9IHtcbiAgc2V0Q29uZjogLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiB7XG4gIH0sIFwic2V0Q29uZlwiKSxcbiAgZHJhd1xufTtcblxuLy8gc3JjL2RpYWdyYW1zL3RpbWVsaW5lL3RpbWVsaW5lUmVuZGVyZXJWZXJ0aWNhbC50c1xudmFyIE5PREVfV0lEVEggPSAyMDA7XG52YXIgTk9ERV9QQURESU5HID0gNTtcbnZhciBOT0RFX1RPVEFMX1dJRFRIID0gTk9ERV9XSURUSCArIE5PREVfUEFERElORyAqIDI7XG52YXIgRVZFTlRfV0lEVEggPSBOT0RFX1dJRFRIICsgMTAwO1xudmFyIEVWRU5UX1RPVEFMX1dJRFRIID0gRVZFTlRfV0lEVEggKyBOT0RFX1BBRERJTkcgKiAyO1xudmFyIEVWRU5UX1NQQUNJTkcgPSAxMDtcbnZhciBFVkVOVF9WRVJUSUNBTF9HQVAgPSAwO1xudmFyIFNFQ1RJT05fVEFTS19HQVAgPSAyMDtcbnZhciBUQVNLX0FYSVNfR0FQID0gMjA7XG52YXIgVEFTS19WRVJUSUNBTF9HQVAgPSAzMDtcbnZhciBFVkVOVF9BWElTX0dBUCA9IDUwO1xudmFyIGRyYXcyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbih0ZXh0LCBpZCwgdmVyc2lvbiwgZGlhZ09iaikge1xuICBjb25zdCBjb25mID0gZ2V0Q29uZmlnMigpO1xuICBjb25zdCBMRUZUX01BUkdJTiA9IGNvbmYudGltZWxpbmU/LmxlZnRNYXJnaW4gPz8gNTA7XG4gIGxvZy5kZWJ1ZyhcInRpbWVsaW5lXCIsIGRpYWdPYmouZGIpO1xuICBjb25zdCBzdmcgPSBzZWxlY3RTdmdFbGVtZW50KGlkKTtcbiAgc3ZnLmFwcGVuZChcImdcIik7XG4gIGNvbnN0IHRhc2tzMiA9IGRpYWdPYmouZGIuZ2V0VGFza3MoKTtcbiAgY29uc3QgdGl0bGUgPSBkaWFnT2JqLmRiLmdldENvbW1vbkRiKCkuZ2V0RGlhZ3JhbVRpdGxlKCk7XG4gIGxvZy5kZWJ1ZyhcInRhc2tcIiwgdGFza3MyKTtcbiAgc3ZnRHJhd19kZWZhdWx0LmluaXRHcmFwaGljcyhzdmcpO1xuICBjb25zdCBzZWN0aW9uczIgPSBkaWFnT2JqLmRiLmdldFNlY3Rpb25zKCk7XG4gIGxvZy5kZWJ1ZyhcInNlY3Rpb25zXCIsIHNlY3Rpb25zMik7XG4gIGxldCBtYXhTZWN0aW9uSGVpZ2h0ID0gMDtcbiAgbGV0IG1heFRhc2tIZWlnaHQgPSAwO1xuICBjb25zdCBtYXN0ZXJYID0gNTAgKyBMRUZUX01BUkdJTjtcbiAgbGV0IG1hc3RlclkgPSA1MDtcbiAgY29uc3QgY29udGVudFRvcFkgPSBtYXN0ZXJZO1xuICBjb25zdCBzZWN0aW9uQmVnaW5YID0gbWFzdGVyWDtcbiAgY29uc3QgbGVmdFdpZHRoID0gTk9ERV9UT1RBTF9XSURUSCArIFRBU0tfQVhJU19HQVA7XG4gIGNvbnN0IHJpZ2h0V2lkdGggPSBFVkVOVF9UT1RBTF9XSURUSCArIEVWRU5UX0FYSVNfR0FQO1xuICBjb25zdCBheGlzWCA9IHNlY3Rpb25CZWdpblggKyBsZWZ0V2lkdGg7XG4gIGxldCBzZWN0aW9uTnVtYmVyID0gMDtcbiAgY29uc3QgaGFzU2VjdGlvbnMgPSBzZWN0aW9uczIgJiYgc2VjdGlvbnMyLmxlbmd0aCA+IDA7XG4gIGNvbnN0IHRpbWVsaW5lWCA9IGhhc1NlY3Rpb25zID8gYXhpc1ggOiBtYXN0ZXJYICsgbGVmdFdpZHRoO1xuICBjb25zdCBzZWN0aW9uV2lkdGggPSBNYXRoLm1heCg1MCwgbGVmdFdpZHRoICsgcmlnaHRXaWR0aCAtIE5PREVfUEFERElORyAqIDIpO1xuICBzZWN0aW9uczIuZm9yRWFjaChmdW5jdGlvbihzZWN0aW9uKSB7XG4gICAgY29uc3Qgc2VjdGlvbk5vZGUgPSB7XG4gICAgICBudW1iZXI6IHNlY3Rpb25OdW1iZXIsXG4gICAgICBkZXNjcjogc2VjdGlvbixcbiAgICAgIHNlY3Rpb246IHNlY3Rpb25OdW1iZXIsXG4gICAgICB3aWR0aDogc2VjdGlvbldpZHRoLFxuICAgICAgcGFkZGluZzogTk9ERV9QQURESU5HLFxuICAgICAgbWF4SGVpZ2h0OiBtYXhTZWN0aW9uSGVpZ2h0XG4gICAgfTtcbiAgICBjb25zdCBzZWN0aW9uSGVpZ2h0ID0gc3ZnRHJhd19kZWZhdWx0LmdldFZpcnR1YWxOb2RlSGVpZ2h0KHN2Zywgc2VjdGlvbk5vZGUsIGNvbmYpO1xuICAgIGxvZy5kZWJ1ZyhcInNlY3Rpb25IZWlnaHQgYmVmb3JlIGRyYXdcIiwgc2VjdGlvbkhlaWdodCk7XG4gICAgbWF4U2VjdGlvbkhlaWdodCA9IE1hdGgubWF4KG1heFNlY3Rpb25IZWlnaHQsIHNlY3Rpb25IZWlnaHQpO1xuICB9KTtcbiAgbGV0IG1heEV2ZW50U3RhY2tIZWlnaHQgPSAwO1xuICBsb2cuZGVidWcoXCJ0YXNrcy5sZW5ndGhcIiwgdGFza3MyLmxlbmd0aCk7XG4gIGZvciAoY29uc3QgW2ksIHRhc2tdIG9mIHRhc2tzMi5lbnRyaWVzKCkpIHtcbiAgICBjb25zdCB0YXNrTm9kZSA9IHtcbiAgICAgIG51bWJlcjogaSxcbiAgICAgIGRlc2NyOiB0YXNrLFxuICAgICAgc2VjdGlvbjogdGFzay5zZWN0aW9uLFxuICAgICAgd2lkdGg6IE5PREVfV0lEVEgsXG4gICAgICBwYWRkaW5nOiBOT0RFX1BBRERJTkcsXG4gICAgICBtYXhIZWlnaHQ6IG1heFRhc2tIZWlnaHRcbiAgICB9O1xuICAgIGNvbnN0IHRhc2tIZWlnaHQgPSBzdmdEcmF3X2RlZmF1bHQuZ2V0VmlydHVhbE5vZGVIZWlnaHQoc3ZnLCB0YXNrTm9kZSwgY29uZik7XG4gICAgbG9nLmRlYnVnKFwidGFza0hlaWdodCBiZWZvcmUgZHJhd1wiLCB0YXNrSGVpZ2h0KTtcbiAgICBtYXhUYXNrSGVpZ2h0ID0gTWF0aC5tYXgobWF4VGFza0hlaWdodCwgdGFza0hlaWdodCk7XG4gICAgbGV0IG1heEV2ZW50U3RhY2tIZWlnaHRUZW1wID0gMDtcbiAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIHRhc2suZXZlbnRzKSB7XG4gICAgICBjb25zdCBldmVudE5vZGUgPSB7XG4gICAgICAgIGRlc2NyOiBldmVudCxcbiAgICAgICAgc2VjdGlvbjogdGFzay5zZWN0aW9uLFxuICAgICAgICBudW1iZXI6IHRhc2suc2VjdGlvbixcbiAgICAgICAgd2lkdGg6IEVWRU5UX1dJRFRILFxuICAgICAgICBwYWRkaW5nOiBOT0RFX1BBRERJTkcsXG4gICAgICAgIG1heEhlaWdodDogNTBcbiAgICAgIH07XG4gICAgICBtYXhFdmVudFN0YWNrSGVpZ2h0VGVtcCArPSBzdmdEcmF3X2RlZmF1bHQuZ2V0VmlydHVhbE5vZGVIZWlnaHQoc3ZnLCBldmVudE5vZGUsIGNvbmYpO1xuICAgIH1cbiAgICBpZiAodGFzay5ldmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgbWF4RXZlbnRTdGFja0hlaWdodFRlbXAgKz0gKHRhc2suZXZlbnRzLmxlbmd0aCAtIDEpICogRVZFTlRfU1BBQ0lORztcbiAgICB9XG4gICAgbWF4RXZlbnRTdGFja0hlaWdodCA9IE1hdGgubWF4KG1heEV2ZW50U3RhY2tIZWlnaHQsIG1heEV2ZW50U3RhY2tIZWlnaHRUZW1wKSArIEVWRU5UX1ZFUlRJQ0FMX0dBUDtcbiAgfVxuICBsb2cuZGVidWcoXCJtYXhTZWN0aW9uSGVpZ2h0IGJlZm9yZSBkcmF3XCIsIG1heFNlY3Rpb25IZWlnaHQpO1xuICBsb2cuZGVidWcoXCJtYXhUYXNrSGVpZ2h0IGJlZm9yZSBkcmF3XCIsIG1heFRhc2tIZWlnaHQpO1xuICBjb25zdCB0YXNrQmxvY2tIZWlnaHQgPSBNYXRoLm1heChtYXhUYXNrSGVpZ2h0LCBtYXhFdmVudFN0YWNrSGVpZ2h0KTtcbiAgY29uc3QgdGFza1NwYWNpbmcgPSB0YXNrQmxvY2tIZWlnaHQgKyBUQVNLX1ZFUlRJQ0FMX0dBUDtcbiAgaWYgKGhhc1NlY3Rpb25zKSB7XG4gICAgc2VjdGlvbnMyLmZvckVhY2goKHNlY3Rpb24pID0+IHtcbiAgICAgIGNvbnN0IHRhc2tzRm9yU2VjdGlvbiA9IHRhc2tzMi5maWx0ZXIoKHRhc2spID0+IHRhc2suc2VjdGlvbiA9PT0gc2VjdGlvbik7XG4gICAgICBjb25zdCBzZWN0aW9uTm9kZSA9IHtcbiAgICAgICAgbnVtYmVyOiBzZWN0aW9uTnVtYmVyLFxuICAgICAgICBkZXNjcjogc2VjdGlvbixcbiAgICAgICAgc2VjdGlvbjogc2VjdGlvbk51bWJlcixcbiAgICAgICAgd2lkdGg6IHNlY3Rpb25XaWR0aCxcbiAgICAgICAgcGFkZGluZzogTk9ERV9QQURESU5HLFxuICAgICAgICBtYXhIZWlnaHQ6IG1heFNlY3Rpb25IZWlnaHRcbiAgICAgIH07XG4gICAgICBsb2cuZGVidWcoXCJzZWN0aW9uTm9kZVwiLCBzZWN0aW9uTm9kZSk7XG4gICAgICBjb25zdCBzZWN0aW9uTm9kZVdyYXBwZXIgPSBzdmcuYXBwZW5kKFwiZ1wiKTtcbiAgICAgIGNvbnN0IG5vZGUgPSBzdmdEcmF3X2RlZmF1bHQuZHJhd05vZGUoc2VjdGlvbk5vZGVXcmFwcGVyLCBzZWN0aW9uTm9kZSwgc2VjdGlvbk51bWJlciwgY29uZik7XG4gICAgICBsb2cuZGVidWcoXCJzZWN0aW9uTm9kZSBvdXRwdXRcIiwgbm9kZSk7XG4gICAgICBjb25zdCBzZWN0aW9uWCA9IHRpbWVsaW5lWCAtIGxlZnRXaWR0aDtcbiAgICAgIHNlY3Rpb25Ob2RlV3JhcHBlci5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHtzZWN0aW9uWH0sICR7bWFzdGVyWX0pYCk7XG4gICAgICBjb25zdCB0YXNrU3RhcnRZID0gbWFzdGVyWSArIG5vZGUuaGVpZ2h0ICsgU0VDVElPTl9UQVNLX0dBUDtcbiAgICAgIGlmICh0YXNrc0ZvclNlY3Rpb24ubGVuZ3RoID4gMCkge1xuICAgICAgICBkcmF3VGFza3MyKFxuICAgICAgICAgIHN2ZyxcbiAgICAgICAgICB0YXNrc0ZvclNlY3Rpb24sXG4gICAgICAgICAgc2VjdGlvbk51bWJlcixcbiAgICAgICAgICB0aW1lbGluZVgsXG4gICAgICAgICAgdGFza1N0YXJ0WSxcbiAgICAgICAgICBtYXhUYXNrSGVpZ2h0LFxuICAgICAgICAgIGNvbmYsXG4gICAgICAgICAgdGFza1NwYWNpbmcsXG4gICAgICAgICAgZmFsc2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHRhc2tDb3VudDIgPSB0YXNrc0ZvclNlY3Rpb24ubGVuZ3RoO1xuICAgICAgY29uc3Qgc2VjdGlvbkhlaWdodCA9IG5vZGUuaGVpZ2h0ICsgU0VDVElPTl9UQVNLX0dBUCArIHRhc2tTcGFjaW5nICogTWF0aC5tYXgodGFza0NvdW50MiwgMSkgLSAodGFza0NvdW50MiA+IDAgPyBUQVNLX1ZFUlRJQ0FMX0dBUCAqIDIgOiAwKTtcbiAgICAgIG1hc3RlclkgKz0gc2VjdGlvbkhlaWdodDtcbiAgICAgIHNlY3Rpb25OdW1iZXIrKztcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBkcmF3VGFza3MyKFxuICAgICAgc3ZnLFxuICAgICAgdGFza3MyLFxuICAgICAgc2VjdGlvbk51bWJlcixcbiAgICAgIHRpbWVsaW5lWCxcbiAgICAgIG1hc3RlclksXG4gICAgICBtYXhUYXNrSGVpZ2h0LFxuICAgICAgY29uZixcbiAgICAgIHRhc2tTcGFjaW5nLFxuICAgICAgdHJ1ZVxuICAgICk7XG4gIH1cbiAgbGV0IGJveCA9IHN2Zy5ub2RlKCk/LmdldEJCb3goKTtcbiAgaWYgKCFib3gpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJiYm94IG5vdCBmb3VuZFwiKTtcbiAgfVxuICBsb2cuZGVidWcoXCJib3VuZHNcIiwgYm94KTtcbiAgaWYgKHRpdGxlKSB7XG4gICAgc3ZnLmFwcGVuZChcInRleHRcIikudGV4dCh0aXRsZSkuYXR0cihcInhcIiwgYm94LndpZHRoIC8gMiAtIExFRlRfTUFSR0lOKS5hdHRyKFwiZm9udC1zaXplXCIsIFwiNGV4XCIpLmF0dHIoXCJmb250LXdlaWdodFwiLCBcImJvbGRcIikuYXR0cihcInlcIiwgMjApO1xuICAgIGJveCA9IHN2Zy5ub2RlKCk/LmdldEJCb3goKTtcbiAgICBpZiAoIWJveCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYmJveCBub3QgZm91bmRcIik7XG4gICAgfVxuICAgIGxvZy5kZWJ1ZyhcImJvdW5kcyBhZnRlciB0aXRsZVwiLCBib3gpO1xuICB9XG4gIGNvbnN0IFtmb250U2l6ZV0gPSBwYXJzZUZvbnRTaXplKGNvbmYuZm9udFNpemUpO1xuICBjb25zdCBhcnJvd1RvcE9mZnNldCA9IChmb250U2l6ZSA/PyAxNikgKiAyO1xuICBjb25zdCBhcnJvd0JvdHRvbVBhZGRpbmcgPSAoZm9udFNpemUgPz8gMTYpICogMC41ICsgMjA7XG4gIGNvbnN0IGxpbmVXcmFwcGVyID0gc3ZnLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwibGluZVdyYXBwZXJcIik7XG4gIGxpbmVXcmFwcGVyLmFwcGVuZChcImxpbmVcIikuYXR0cihcIngxXCIsIHRpbWVsaW5lWCkuYXR0cihcInkxXCIsIGNvbnRlbnRUb3BZIC0gYXJyb3dUb3BPZmZzZXQpLmF0dHIoXCJ4MlwiLCB0aW1lbGluZVgpLmF0dHIoXCJ5MlwiLCBib3gueSArIGJveC5oZWlnaHQgKyBhcnJvd0JvdHRvbVBhZGRpbmcpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgNCkuYXR0cihcInN0cm9rZVwiLCBcImJsYWNrXCIpLmF0dHIoXCJtYXJrZXItZW5kXCIsIFwidXJsKCNhcnJvd2hlYWQpXCIpO1xuICBsaW5lV3JhcHBlci5sb3dlcigpO1xuICBzZXR1cEdyYXBoVmlld2JveChcbiAgICB2b2lkIDAsXG4gICAgc3ZnLFxuICAgIGNvbmYudGltZWxpbmU/LnBhZGRpbmcgPz8gNTAsXG4gICAgY29uZi50aW1lbGluZT8udXNlTWF4V2lkdGggPz8gZmFsc2VcbiAgKTtcbn0sIFwiZHJhd1wiKTtcbnZhciBkcmF3VGFza3MyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihkaWFncmFtMiwgdGFza3MyLCBzZWN0aW9uQ29sb3IsIHRpbWVsaW5lWCwgbWFzdGVyWSwgbWF4VGFza0hlaWdodCwgY29uZiwgdGFza1NwYWNpbmcsIGlzV2l0aG91dFNlY3Rpb25zKSB7XG4gIGZvciAoY29uc3QgdGFzayBvZiB0YXNrczIpIHtcbiAgICBjb25zdCB0YXNrTm9kZSA9IHtcbiAgICAgIGRlc2NyOiB0YXNrLnRhc2ssXG4gICAgICBzZWN0aW9uOiBzZWN0aW9uQ29sb3IsXG4gICAgICBudW1iZXI6IHNlY3Rpb25Db2xvcixcbiAgICAgIHdpZHRoOiBOT0RFX1dJRFRILFxuICAgICAgcGFkZGluZzogTk9ERV9QQURESU5HLFxuICAgICAgbWF4SGVpZ2h0OiBtYXhUYXNrSGVpZ2h0XG4gICAgfTtcbiAgICBsb2cuZGVidWcoXCJ0YXNrTm9kZVwiLCB0YXNrTm9kZSk7XG4gICAgY29uc3QgdGFza1dyYXBwZXIgPSBkaWFncmFtMi5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcInRhc2tXcmFwcGVyXCIpO1xuICAgIGNvbnN0IG5vZGUgPSBzdmdEcmF3X2RlZmF1bHQuZHJhd05vZGUodGFza1dyYXBwZXIsIHRhc2tOb2RlLCBzZWN0aW9uQ29sb3IsIGNvbmYpO1xuICAgIGNvbnN0IHRhc2tIZWlnaHQgPSBub2RlLmhlaWdodDtcbiAgICBsb2cuZGVidWcoXCJ0YXNrSGVpZ2h0IGFmdGVyIGRyYXdcIiwgdGFza0hlaWdodCk7XG4gICAgY29uc3QgdGFza1ggPSB0aW1lbGluZVggLSBUQVNLX0FYSVNfR0FQIC0gbm9kZS53aWR0aDtcbiAgICB0YXNrV3JhcHBlci5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHt0YXNrWH0sICR7bWFzdGVyWX0pYCk7XG4gICAgbWF4VGFza0hlaWdodCA9IE1hdGgubWF4KG1heFRhc2tIZWlnaHQsIHRhc2tIZWlnaHQpO1xuICAgIGlmICh0YXNrLmV2ZW50cyAmJiB0YXNrLmV2ZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBldmVudHNTdGFydFkgPSBtYXN0ZXJZO1xuICAgICAgY29uc3QgZXZlbnRzWCA9IHRpbWVsaW5lWCArIEVWRU5UX0FYSVNfR0FQO1xuICAgICAgZHJhd0V2ZW50czIoZGlhZ3JhbTIsIHRhc2suZXZlbnRzLCBzZWN0aW9uQ29sb3IsIHRpbWVsaW5lWCwgZXZlbnRzWCwgZXZlbnRzU3RhcnRZLCBjb25mKTtcbiAgICB9XG4gICAgbWFzdGVyWSA9IG1hc3RlclkgKyB0YXNrU3BhY2luZztcbiAgICBpZiAoaXNXaXRob3V0U2VjdGlvbnMgJiYgIWNvbmYudGltZWxpbmU/LmRpc2FibGVNdWx0aWNvbG9yKSB7XG4gICAgICBzZWN0aW9uQ29sb3IrKztcbiAgICB9XG4gIH1cbn0sIFwiZHJhd1Rhc2tzXCIpO1xudmFyIGRyYXdFdmVudHMyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihkaWFncmFtMiwgZXZlbnRzLCBzZWN0aW9uQ29sb3IsIGF4aXNYLCBldmVudHNYLCBzdGFydFksIGNvbmYpIHtcbiAgbGV0IGN1cnJlbnRZID0gc3RhcnRZO1xuICBmb3IgKGNvbnN0IGV2ZW50IG9mIGV2ZW50cykge1xuICAgIGNvbnN0IGV2ZW50Tm9kZSA9IHtcbiAgICAgIGRlc2NyOiBldmVudCxcbiAgICAgIHNlY3Rpb246IHNlY3Rpb25Db2xvcixcbiAgICAgIG51bWJlcjogc2VjdGlvbkNvbG9yLFxuICAgICAgd2lkdGg6IEVWRU5UX1dJRFRILFxuICAgICAgcGFkZGluZzogTk9ERV9QQURESU5HLFxuICAgICAgbWF4SGVpZ2h0OiAwXG4gICAgfTtcbiAgICBsb2cuZGVidWcoXCJldmVudE5vZGVcIiwgZXZlbnROb2RlKTtcbiAgICBjb25zdCBldmVudFdyYXBwZXIgPSBkaWFncmFtMi5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImV2ZW50V3JhcHBlclwiKTtcbiAgICBjb25zdCBub2RlID0gc3ZnRHJhd19kZWZhdWx0LmRyYXdOb2RlKGV2ZW50V3JhcHBlciwgZXZlbnROb2RlLCBzZWN0aW9uQ29sb3IsIGNvbmYpO1xuICAgIGNvbnN0IGV2ZW50SGVpZ2h0ID0gbm9kZS5oZWlnaHQ7XG4gICAgZXZlbnRXcmFwcGVyLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgke2V2ZW50c1h9LCAke2N1cnJlbnRZfSlgKTtcbiAgICBjb25zdCBsaW5lV3JhcHBlciA9IGRpYWdyYW0yLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwibGluZVdyYXBwZXJcIik7XG4gICAgY29uc3QgbGluZVkgPSBjdXJyZW50WSArIGV2ZW50SGVpZ2h0IC8gMjtcbiAgICBsaW5lV3JhcHBlci5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJ4MVwiLCBheGlzWCkuYXR0cihcInkxXCIsIGxpbmVZKS5hdHRyKFwieDJcIiwgZXZlbnRzWCkuYXR0cihcInkyXCIsIGxpbmVZKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIDIpLmF0dHIoXCJzdHJva2VcIiwgXCJibGFja1wiKS5hdHRyKFwibWFya2VyLWVuZFwiLCBcInVybCgjYXJyb3doZWFkKVwiKS5hdHRyKFwic3Ryb2tlLWRhc2hhcnJheVwiLCBcIjUsNVwiKTtcbiAgICBjdXJyZW50WSA9IGN1cnJlbnRZICsgZXZlbnRIZWlnaHQgKyBFVkVOVF9TUEFDSU5HO1xuICB9XG4gIHJldHVybiBjdXJyZW50WSAtIHN0YXJ0WTtcbn0sIFwiZHJhd0V2ZW50c1wiKTtcbnZhciB0aW1lbGluZVJlbmRlcmVyVmVydGljYWxfZGVmYXVsdCA9IHtcbiAgc2V0Q29uZjogLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiB7XG4gIH0sIFwic2V0Q29uZlwiKSxcbiAgZHJhdzogZHJhdzJcbn07XG5cbi8vIHNyYy9kaWFncmFtcy90aW1lbGluZS9zdHlsZXMuanNcbmltcG9ydCB7IGRhcmtlbiwgbGlnaHRlbiwgaXNEYXJrIH0gZnJvbSBcImtocm9tYVwiO1xudmFyIGdlblJlZHV4U2VjdGlvbnMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChvcHRpb25zKSA9PiB7XG4gIGNvbnN0IHsgdGhlbWUgfSA9IGdldENvbmZpZygpO1xuICBjb25zdCBpc0RhcmtUaGVtZSA9IHRoZW1lPy5pbmNsdWRlcyhcImRhcmtcIik7XG4gIGNvbnN0IGlzQ29sb3JUaGVtZSA9IHRoZW1lPy5pbmNsdWRlcyhcImNvbG9yXCIpO1xuICBjb25zdCByYXdTdmdJZCA9IG9wdGlvbnMuc3ZnSWQ/LnJlcGxhY2UoL14jLywgXCJcIikgPz8gXCJcIjtcbiAgY29uc3Qgc2NvcGVkRHJvcFNoYWRvdyA9IHJhd1N2Z0lkID8gYHVybCgjJHtyYXdTdmdJZH0tZHJvcC1zaGFkb3cpYCA6IG9wdGlvbnMuZHJvcFNoYWRvdyA/PyBcIm5vbmVcIjtcbiAgbGV0IHNlY3Rpb25zMiA9IFwiXCI7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgb3B0aW9ucy5USEVNRV9DT0xPUl9MSU1JVDsgaSsrKSB7XG4gICAgY29uc3Qgc3cgPSBgJHsxNyAtIDMgKiBpfWA7XG4gICAgY29uc3QgY29sb3IgPSBpc0NvbG9yVGhlbWUgPyBvcHRpb25zLmJvcmRlckNvbG9yQXJyYXlbaV0gOiBvcHRpb25zLm1haW5Ca2c7XG4gICAgY29uc3Qgc3Ryb2tlID0gaXNDb2xvclRoZW1lID8gb3B0aW9ucy5ib3JkZXJDb2xvckFycmF5W2ldIDogb3B0aW9ucy5ub2RlQm9yZGVyO1xuICAgIHNlY3Rpb25zMiArPSBgXG4gICAgLnNlY3Rpb24tJHtpIC0gMX0gcmVjdCxcbiAgICAuc2VjdGlvbi0ke2kgLSAxfSBwYXRoLFxuICAgIC5zZWN0aW9uLSR7aSAtIDF9IGNpcmNsZSB7XG4gICAgICBmaWxsOiAke2lzRGFya1RoZW1lICYmIGlzQ29sb3JUaGVtZSA/IG9wdGlvbnMubWFpbkJrZyA6IGNvbG9yfTtcbiAgICAgIHN0cm9rZTogJHtzdHJva2V9O1xuICAgICAgc3Ryb2tlLXdpZHRoOiAke29wdGlvbnMuc3Ryb2tlV2lkdGh9O1xuICAgICAgZmlsdGVyOiAke3Njb3BlZERyb3BTaGFkb3d9O1xuICAgIH1cblxuICAgIC5zZWN0aW9uLSR7aSAtIDF9IHRleHQge1xuICAgICAgZmlsbDogJHtvcHRpb25zLm5vZGVCb3JkZXJ9O1xuICAgICAgZm9udC13ZWlnaHQ6ICR7b3B0aW9ucy5mb250V2VpZ2h0fVxuICAgIH1cblxuICAgIC5ub2RlLWljb24tJHtpIC0gMX0ge1xuICAgICAgZm9udC1zaXplOiA0MHB4O1xuICAgICAgY29sb3I6ICR7b3B0aW9uc1tcImNTY2FsZUxhYmVsXCIgKyBpXX07XG4gICAgfVxuXG4gICAgLnNlY3Rpb24tZWRnZS0ke2kgLSAxfSB7XG4gICAgICBzdHJva2U6ICR7b3B0aW9uc1tcImNTY2FsZVwiICsgaV19O1xuICAgIH1cblxuICAgIC5lZGdlLWRlcHRoLSR7aSAtIDF9IHtcbiAgICAgIHN0cm9rZS13aWR0aDogJHtzd307XG4gICAgfVxuXG4gICAgLnNlY3Rpb24tJHtpIC0gMX0gbGluZSB7XG4gICAgICBzdHJva2U6ICR7b3B0aW9uc1tcImNTY2FsZUludlwiICsgaV19O1xuICAgICAgc3Ryb2tlLXdpZHRoOiAzO1xuICAgIH1cblxuICAgIC5saW5lV3JhcHBlciBsaW5lIHtcbiAgICAgIHN0cm9rZTogJHtvcHRpb25zLm5vZGVCb3JkZXJ9O1xuICAgICAgc3Ryb2tlLXdpZHRoOiR7b3B0aW9ucy5zdHJva2VXaWR0aH1cbiAgICB9XG5cbiAgICAuZGlzYWJsZWQsXG4gICAgLmRpc2FibGVkIGNpcmNsZSxcbiAgICAuZGlzYWJsZWQgdGV4dCB7XG4gICAgICBmaWxsOiAke29wdGlvbnMudGVydGlhcnlDb2xvciA/PyBcImxpZ2h0Z3JheVwifTtcbiAgICB9XG5cbiAgICAuZGlzYWJsZWQgdGV4dCB7XG4gICAgICBmaWxsOiAke29wdGlvbnMuY2x1c3RlckJvcmRlciA/PyBcIiNlZmVmZWZcIn07XG4gICAgfVxuICAgIGA7XG4gIH1cbiAgcmV0dXJuIHNlY3Rpb25zMjtcbn0sIFwiZ2VuUmVkdXhTZWN0aW9uc1wiKTtcbnZhciBnZW5TZWN0aW9ucyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKG9wdGlvbnMpID0+IHtcbiAgbGV0IHNlY3Rpb25zMiA9IFwiXCI7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgb3B0aW9ucy5USEVNRV9DT0xPUl9MSU1JVDsgaSsrKSB7XG4gICAgb3B0aW9uc1tcImxpbmVDb2xvclwiICsgaV0gPSBvcHRpb25zW1wibGluZUNvbG9yXCIgKyBpXSB8fCBvcHRpb25zW1wiY1NjYWxlSW52XCIgKyBpXTtcbiAgICBpZiAoaXNEYXJrKG9wdGlvbnNbXCJsaW5lQ29sb3JcIiArIGldKSkge1xuICAgICAgb3B0aW9uc1tcImxpbmVDb2xvclwiICsgaV0gPSBsaWdodGVuKG9wdGlvbnNbXCJsaW5lQ29sb3JcIiArIGldLCAyMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG9wdGlvbnNbXCJsaW5lQ29sb3JcIiArIGldID0gZGFya2VuKG9wdGlvbnNbXCJsaW5lQ29sb3JcIiArIGldLCAyMCk7XG4gICAgfVxuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgb3B0aW9ucy5USEVNRV9DT0xPUl9MSU1JVDsgaSsrKSB7XG4gICAgY29uc3Qgc3cgPSBcIlwiICsgKDE3IC0gMyAqIGkpO1xuICAgIHNlY3Rpb25zMiArPSBgXG4gICAgLnNlY3Rpb24tJHtpIC0gMX0gcmVjdCwgLnNlY3Rpb24tJHtpIC0gMX0gcGF0aCwgLnNlY3Rpb24tJHtpIC0gMX0gY2lyY2xlLCAuc2VjdGlvbi0ke2kgLSAxfSBwYXRoICB7XG4gICAgICBmaWxsOiAke29wdGlvbnNbXCJjU2NhbGVcIiArIGldfTtcbiAgICB9XG4gICAgLnNlY3Rpb24tJHtpIC0gMX0gdGV4dCB7XG4gICAgIGZpbGw6ICR7b3B0aW9uc1tcImNTY2FsZUxhYmVsXCIgKyBpXX07XG4gICAgfVxuICAgIC5ub2RlLWljb24tJHtpIC0gMX0ge1xuICAgICAgZm9udC1zaXplOiA0MHB4O1xuICAgICAgY29sb3I6ICR7b3B0aW9uc1tcImNTY2FsZUxhYmVsXCIgKyBpXX07XG4gICAgfVxuICAgIC5zZWN0aW9uLWVkZ2UtJHtpIC0gMX17XG4gICAgICBzdHJva2U6ICR7b3B0aW9uc1tcImNTY2FsZVwiICsgaV19O1xuICAgIH1cbiAgICAuZWRnZS1kZXB0aC0ke2kgLSAxfXtcbiAgICAgIHN0cm9rZS13aWR0aDogJHtzd307XG4gICAgfVxuICAgIC5zZWN0aW9uLSR7aSAtIDF9IGxpbmUge1xuICAgICAgc3Ryb2tlOiAke29wdGlvbnNbXCJjU2NhbGVJbnZcIiArIGldfSA7XG4gICAgICBzdHJva2Utd2lkdGg6IDM7XG4gICAgfVxuXG4gICAgLmxpbmVXcmFwcGVyIGxpbmV7XG4gICAgICBzdHJva2U6ICR7b3B0aW9uc1tcImNTY2FsZUxhYmVsXCIgKyBpXX0gO1xuICAgIH1cblxuICAgIC5kaXNhYmxlZCwgLmRpc2FibGVkIGNpcmNsZSwgLmRpc2FibGVkIHRleHQge1xuICAgICAgZmlsbDogJHtvcHRpb25zLnRlcnRpYXJ5Q29sb3IgPz8gXCJsaWdodGdyYXlcIn07XG4gICAgfVxuICAgIC5kaXNhYmxlZCB0ZXh0IHtcbiAgICAgIGZpbGw6ICR7b3B0aW9ucy5jbHVzdGVyQm9yZGVyID8/IFwiI2VmZWZlZlwifTtcbiAgICB9XG4gICAgYDtcbiAgfVxuICByZXR1cm4gc2VjdGlvbnMyO1xufSwgXCJnZW5TZWN0aW9uc1wiKTtcbnZhciBnZXRTdHlsZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChvcHRpb25zKSA9PiB7XG4gIGNvbnN0IHsgdGhlbWUgfSA9IGdldENvbmZpZygpO1xuICBjb25zdCBpc1JlZHV4VGhlbWUgPSB0aGVtZT8uaW5jbHVkZXMoXCJyZWR1eFwiKTtcbiAgY29uc3QgaXNOZXV0cmFsVGhlbWUgPSB0aGVtZSA9PT0gXCJuZXV0cmFsXCI7XG4gIGNvbnN0IHJhd1N2Z0lkID0gb3B0aW9ucy5zdmdJZD8ucmVwbGFjZSgvXiMvLCBcIlwiKSA/PyBcIlwiO1xuICBsZXQgZ3JhZGllbnRTZWN0aW9ucyA9IFwiXCI7XG4gIGlmIChvcHRpb25zLnVzZUdyYWRpZW50ICYmIHJhd1N2Z0lkICYmIG9wdGlvbnMuVEhFTUVfQ09MT1JfTElNSVQgJiYgIWlzTmV1dHJhbFRoZW1lKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvcHRpb25zLlRIRU1FX0NPTE9SX0xJTUlUOyBpKyspIHtcbiAgICAgIGdyYWRpZW50U2VjdGlvbnMgKz0gYFxuICAgICAgLnNlY3Rpb24tJHtpIC0gMX1bZGF0YS1sb29rPVwibmVvXCJdIHJlY3QsXG4gICAgICAuc2VjdGlvbi0ke2kgLSAxfVtkYXRhLWxvb2s9XCJuZW9cIl0gcGF0aCxcbiAgICAgIC5zZWN0aW9uLSR7aSAtIDF9W2RhdGEtbG9vaz1cIm5lb1wiXSBjaXJjbGUge1xuICAgICAgICBmaWxsOiAke29wdGlvbnMubWFpbkJrZ307XG4gICAgICAgIHN0cm9rZTogdXJsKCMke3Jhd1N2Z0lkfS1ncmFkaWVudCk7XG4gICAgICAgIHN0cm9rZS13aWR0aDogMjtcbiAgICAgIH1cbiAgICAgIC5zZWN0aW9uLSR7aSAtIDF9W2RhdGEtbG9vaz1cIm5lb1wiXSBsaW5lIHtcbiAgICAgICAgc3Ryb2tlOiB1cmwoIyR7cmF3U3ZnSWR9LWdyYWRpZW50KTtcbiAgICAgICAgc3Ryb2tlLXdpZHRoOiAyO1xuICAgICAgfWA7XG4gICAgfVxuICB9XG4gIHJldHVybiBgXG4gIC5lZGdlIHtcbiAgICBzdHJva2Utd2lkdGg6IDM7XG4gIH1cbiAgJHtpc1JlZHV4VGhlbWUgPyBnZW5SZWR1eFNlY3Rpb25zKG9wdGlvbnMpIDogZ2VuU2VjdGlvbnMob3B0aW9ucyl9XG4gICR7Z3JhZGllbnRTZWN0aW9uc31cbiAgLnNlY3Rpb24tcm9vdCByZWN0LCAuc2VjdGlvbi1yb290IHBhdGgsIC5zZWN0aW9uLXJvb3QgY2lyY2xlICB7XG4gICAgZmlsbDogJHtvcHRpb25zLmdpdDB9O1xuICB9XG4gIC5zZWN0aW9uLXJvb3QgdGV4dCB7XG4gICAgZmlsbDogJHtvcHRpb25zLmdpdEJyYW5jaExhYmVsMH07XG4gIH1cbiAgLmljb24tY29udGFpbmVyIHtcbiAgICBoZWlnaHQ6MTAwJTtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIH1cbiAgLmVkZ2Uge1xuICAgIGZpbGw6IG5vbmU7XG4gIH1cbiAgLmV2ZW50V3JhcHBlciAge1xuICAgZmlsdGVyOiBicmlnaHRuZXNzKDEyMCUpO1xuICB9XG5gO1xufSwgXCJnZXRTdHlsZXNcIik7XG52YXIgc3R5bGVzX2RlZmF1bHQgPSBnZXRTdHlsZXM7XG5cbi8vIHNyYy9kaWFncmFtcy90aW1lbGluZS90aW1lbGluZS1kZWZpbml0aW9uLnRzXG52YXIgcmVuZGVyZXJTZWxlY3RvciA9IHtcbiAgc2V0Q29uZjogLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiB7XG4gIH0sIFwic2V0Q29uZlwiKSxcbiAgZHJhdzogLyogQF9fUFVSRV9fICovIF9fbmFtZSgodGV4dCwgaWQsIHZlcnNpb24sIGRpYWdPYmopID0+IHtcbiAgICBjb25zdCBkaXJlY3Rpb24yID0gZGlhZ09iaj8uZGI/LmdldERpcmVjdGlvbj8uKCkgPz8gXCJMUlwiO1xuICAgIGlmIChkaXJlY3Rpb24yID09PSBcIlREXCIpIHtcbiAgICAgIHJldHVybiB0aW1lbGluZVJlbmRlcmVyVmVydGljYWxfZGVmYXVsdC5kcmF3KHRleHQsIGlkLCB2ZXJzaW9uLCBkaWFnT2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIHRpbWVsaW5lUmVuZGVyZXJfZGVmYXVsdC5kcmF3KHRleHQsIGlkLCB2ZXJzaW9uLCBkaWFnT2JqKTtcbiAgfSwgXCJkcmF3XCIpXG59O1xudmFyIGRpYWdyYW0gPSB7XG4gIGRiOiB0aW1lbGluZURiX2V4cG9ydHMsXG4gIHJlbmRlcmVyOiByZW5kZXJlclNlbGVjdG9yLFxuICBwYXJzZXI6IHRpbWVsaW5lX2RlZmF1bHQsXG4gIHN0eWxlczogc3R5bGVzX2RlZmF1bHRcbn07XG5leHBvcnQge1xuICBkaWFncmFtXG59O1xuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBLElBQUksU0FBVSxRQUFRLEdBQUc7QUFBQSxFQUN2QixJQUFJLG9CQUFv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LENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFL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Q0gsUUFBUSxjQUFjO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxnQkFLdEIsUUFBUSxnQkFBZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQSxjQUkxQixRQUFRLGlCQUFpQjtBQUFBO0FBQUE7QUFBQSxjQUd6QixRQUFRLGlCQUFpQjtBQUFBO0FBQUE7QUFBQSxFQUdyQztBQUFBLEVBQ0EsT0FBTztBQUFBLEdBQ04sYUFBYTtBQUNoQixJQUFJLDRCQUE0QixPQUFPLENBQUMsWUFBWTtBQUFBLEVBQ2xELFFBQVEsVUFBVSxVQUFVO0FBQUEsRUFDNUIsTUFBTSxlQUFlLE9BQU8sU0FBUyxPQUFPO0FBQUEsRUFDNUMsTUFBTSxpQkFBaUIsVUFBVTtBQUFBLEVBQ2pDLE1BQU0sV0FBVyxRQUFRLE9BQU8sUUFBUSxNQUFNLEVBQUUsS0FBSztBQUFBLEVBQ3JELElBQUksbUJBQW1CO0FBQUEsRUFDdkIsSUFBSSxRQUFRLGVBQWUsWUFBWSxRQUFRLHFCQUFxQixDQUFDLGdCQUFnQjtBQUFBLElBQ25GLFNBQVMsSUFBSSxFQUFHLElBQUksUUFBUSxtQkFBbUIsS0FBSztBQUFBLE1BQ2xELG9CQUFvQjtBQUFBLGlCQUNULElBQUk7QUFBQSxpQkFDSixJQUFJO0FBQUEsaUJBQ0osSUFBSTtBQUFBLGdCQUNMLFFBQVE7QUFBQSx1QkFDRDtBQUFBO0FBQUE7QUFBQSxpQkFHTixJQUFJO0FBQUEsdUJBQ0U7QUFBQTtBQUFBO0FBQUEsSUFHbkI7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFJTCxlQUFlLGlCQUFpQixPQUFPLElBQUksWUFBWSxPQUFPO0FBQUEsSUFDOUQ7QUFBQTtBQUFBLFlBRVEsUUFBUTtBQUFBO0FBQUE7QUFBQSxZQUdSLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FlakIsV0FBVztBQUNkLElBQUksaUJBQWlCO0FBR3JCLElBQUksbUJBQW1CO0FBQUEsRUFDckIseUJBQXlCLE9BQU8sTUFBTSxJQUNuQyxTQUFTO0FBQUEsRUFDWixzQkFBc0IsT0FBTyxDQUFDLE1BQU0sSUFBSSxTQUFTLFlBQVk7QUFBQSxJQUMzRCxNQUFNLGFBQWEsU0FBUyxJQUFJLGVBQWUsS0FBSztBQUFBLElBQ3BELElBQUksZUFBZSxNQUFNO0FBQUEsTUFDdkIsT0FBTyxpQ0FBaUMsS0FBSyxNQUFNLElBQUksU0FBUyxPQUFPO0FBQUEsSUFDekU7QUFBQSxJQUNBLE9BQU8seUJBQXlCLEtBQUssTUFBTSxJQUFJLFNBQVMsT0FBTztBQUFBLEtBQzlELE1BQU07QUFDWDtBQUNBLElBQUksVUFBVTtBQUFBLEVBQ1osSUFBSTtBQUFBLEVBQ0osVUFBVTtBQUFBLEVBQ1YsUUFBUTtBQUFBLEVBQ1IsUUFBUTtBQUNWOyIsCiAgImRlYnVnSWQiOiAiMDVERDQ2QTcwNzFFMDg5OTY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
