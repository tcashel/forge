import {
  getIconStyles
} from "./chunk-main-0ekgv9a6.js";
import {
  drawBackgroundRect,
  drawRect,
  drawText,
  getNoteRect
} from "./chunk-main-sxwy6e53.js";
import"./chunk-main-ck580f0k.js";
import {
  clear,
  configureSvgSize,
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
  arc_default,
  select_default
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/journeyDiagram-JHISSGLW.mjs
var parser = function() {
  var o = /* @__PURE__ */ __name(function(k, v, o2, l) {
    for (o2 = o2 || {}, l = k.length;l--; o2[k[l]] = v)
      ;
    return o2;
  }, "o"), $V0 = [6, 8, 10, 11, 12, 14, 16, 17, 18], $V1 = [1, 9], $V2 = [1, 10], $V3 = [1, 11], $V4 = [1, 12], $V5 = [1, 13], $V6 = [1, 14];
  var parser2 = {
    trace: /* @__PURE__ */ __name(function trace() {}, "trace"),
    yy: {},
    symbols_: { error: 2, start: 3, journey: 4, document: 5, EOF: 6, line: 7, SPACE: 8, statement: 9, NEWLINE: 10, title: 11, acc_title: 12, acc_title_value: 13, acc_descr: 14, acc_descr_value: 15, acc_descr_multiline_value: 16, section: 17, taskName: 18, taskData: 19, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 4: "journey", 6: "EOF", 8: "SPACE", 10: "NEWLINE", 11: "title", 12: "acc_title", 13: "acc_title_value", 14: "acc_descr", 15: "acc_descr_value", 16: "acc_descr_multiline_value", 17: "section", 18: "taskName", 19: "taskData" },
    productions_: [0, [3, 3], [5, 0], [5, 2], [7, 2], [7, 1], [7, 1], [7, 1], [9, 1], [9, 2], [9, 2], [9, 1], [9, 1], [9, 2]],
    performAction: /* @__PURE__ */ __name(function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
      var $0 = $$.length - 1;
      switch (yystate) {
        case 1:
          return $$[$0 - 1];
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
          yy.setDiagramTitle($$[$0].substr(6));
          this.$ = $$[$0].substr(6);
          break;
        case 9:
          this.$ = $$[$0].trim();
          yy.setAccTitle(this.$);
          break;
        case 10:
        case 11:
          this.$ = $$[$0].trim();
          yy.setAccDescription(this.$);
          break;
        case 12:
          yy.addSection($$[$0].substr(8));
          this.$ = $$[$0].substr(8);
          break;
        case 13:
          yy.addTask($$[$0 - 1], $$[$0]);
          this.$ = "task";
          break;
      }
    }, "anonymous"),
    table: [{ 3: 1, 4: [1, 2] }, { 1: [3] }, o($V0, [2, 2], { 5: 3 }), { 6: [1, 4], 7: 5, 8: [1, 6], 9: 7, 10: [1, 8], 11: $V1, 12: $V2, 14: $V3, 16: $V4, 17: $V5, 18: $V6 }, o($V0, [2, 7], { 1: [2, 1] }), o($V0, [2, 3]), { 9: 15, 11: $V1, 12: $V2, 14: $V3, 16: $V4, 17: $V5, 18: $V6 }, o($V0, [2, 5]), o($V0, [2, 6]), o($V0, [2, 8]), { 13: [1, 16] }, { 15: [1, 17] }, o($V0, [2, 11]), o($V0, [2, 12]), { 19: [1, 18] }, o($V0, [2, 4]), o($V0, [2, 9]), o($V0, [2, 10]), o($V0, [2, 13])],
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
            return 10;
            break;
          case 3:
            break;
          case 4:
            break;
          case 5:
            return 4;
            break;
          case 6:
            return 11;
            break;
          case 7:
            this.begin("acc_title");
            return 12;
            break;
          case 8:
            this.popState();
            return "acc_title_value";
            break;
          case 9:
            this.begin("acc_descr");
            return 14;
            break;
          case 10:
            this.popState();
            return "acc_descr_value";
            break;
          case 11:
            this.begin("acc_descr_multiline");
            break;
          case 12:
            this.popState();
            break;
          case 13:
            return "acc_descr_multiline_value";
            break;
          case 14:
            return 17;
            break;
          case 15:
            return 18;
            break;
          case 16:
            return 19;
            break;
          case 17:
            return ":";
            break;
          case 18:
            return 6;
            break;
          case 19:
            return "INVALID";
            break;
        }
      }, "anonymous"),
      rules: [/^(?:%(?!\{)[^\n]*)/i, /^(?:[^\}]%%[^\n]*)/i, /^(?:[\n]+)/i, /^(?:\s+)/i, /^(?:#[^\n]*)/i, /^(?:journey\b)/i, /^(?:title\s[^#\n;]+)/i, /^(?:accTitle\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*:\s*)/i, /^(?:(?!\n||)*[^\n]*)/i, /^(?:accDescr\s*\{\s*)/i, /^(?:[\}])/i, /^(?:[^\}]*)/i, /^(?:section\s[^#:\n;]+)/i, /^(?:[^#:\n;]+)/i, /^(?::[^#\n;]+)/i, /^(?::)/i, /^(?:$)/i, /^(?:.)/i],
      conditions: { acc_descr_multiline: { rules: [12, 13], inclusive: false }, acc_descr: { rules: [10], inclusive: false }, acc_title: { rules: [8], inclusive: false }, INITIAL: { rules: [0, 1, 2, 3, 4, 5, 6, 7, 9, 11, 14, 15, 16, 17, 18, 19], inclusive: true } }
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
var journey_default = parser;
var currentSection = "";
var sections = [];
var tasks = [];
var rawTasks = [];
var clear2 = /* @__PURE__ */ __name(function() {
  sections.length = 0;
  tasks.length = 0;
  currentSection = "";
  rawTasks.length = 0;
  clear();
}, "clear");
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
var updateActors = /* @__PURE__ */ __name(function() {
  const tempActors = [];
  tasks.forEach((task) => {
    if (task.people) {
      tempActors.push(...task.people);
    }
  });
  const unique = new Set(tempActors);
  return [...unique].sort();
}, "updateActors");
var addTask = /* @__PURE__ */ __name(function(descr, taskData) {
  const pieces = taskData.substr(1).split(":");
  let score = 0;
  let peeps = [];
  if (pieces.length === 1) {
    score = Number(pieces[0]);
    peeps = [];
  } else {
    score = Number(pieces[0]);
    peeps = pieces[1].split(",");
  }
  const peopleList = peeps.map((s) => s.trim());
  const rawTask = {
    section: currentSection,
    type: currentSection,
    people: peopleList,
    task: descr,
    score
  };
  rawTasks.push(rawTask);
}, "addTask");
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
var getActors = /* @__PURE__ */ __name(function() {
  return updateActors();
}, "getActors");
var journeyDb_default = {
  getConfig: /* @__PURE__ */ __name(() => getConfig2().journey, "getConfig"),
  clear: clear2,
  setDiagramTitle,
  getDiagramTitle,
  setAccTitle,
  getAccTitle,
  setAccDescription,
  getAccDescription,
  addSection,
  getSections,
  getTasks,
  addTask,
  addTaskOrg,
  getActors
};
var getStyles = /* @__PURE__ */ __name((options) => `.label {
    font-family: ${options.fontFamily};
    color: ${options.textColor};
  }
  .mouth {
    stroke: #666;
  }

  line {
    stroke: ${options.textColor}
  }

  .legend {
    fill: ${options.textColor};
    font-family: ${options.fontFamily};
  }

  .label text {
    fill: #333;
  }
  .label {
    color: ${options.textColor}
  }

  .face {
    ${options.faceColor ? `fill: ${options.faceColor}` : "fill: #FFF8DC"};
    stroke: #999;
  }

  .node rect,
  .node circle,
  .node ellipse,
  .node polygon,
  .node path {
    fill: ${options.mainBkg};
    stroke: ${options.nodeBorder};
    stroke-width: 1px;
  }

  .node .label {
    text-align: center;
  }
  .node.clickable {
    cursor: pointer;
  }

  .arrowheadPath {
    fill: ${options.arrowheadColor};
  }

  .edgePath .path {
    stroke: ${options.lineColor};
    stroke-width: 1.5px;
  }

  .flowchart-link {
    stroke: ${options.lineColor};
    fill: none;
  }

  .edgeLabel {
    background-color: ${options.edgeLabelBackground};
    rect {
      opacity: 0.5;
    }
    text-align: center;
  }

  .cluster rect {
  }

  .cluster text {
    fill: ${options.titleColor};
  }

  div.mermaidTooltip {
    position: absolute;
    text-align: center;
    max-width: 200px;
    padding: 2px;
    font-family: ${options.fontFamily};
    font-size: 12px;
    background: ${options.tertiaryColor};
    border: 1px solid ${options.border2};
    border-radius: 2px;
    pointer-events: none;
    z-index: 100;
  }

  .task-type-0, .section-type-0  {
    ${options.fillType0 ? `fill: ${options.fillType0}` : ""};
  }
  .task-type-1, .section-type-1  {
    ${options.fillType0 ? `fill: ${options.fillType1}` : ""};
  }
  .task-type-2, .section-type-2  {
    ${options.fillType0 ? `fill: ${options.fillType2}` : ""};
  }
  .task-type-3, .section-type-3  {
    ${options.fillType0 ? `fill: ${options.fillType3}` : ""};
  }
  .task-type-4, .section-type-4  {
    ${options.fillType0 ? `fill: ${options.fillType4}` : ""};
  }
  .task-type-5, .section-type-5  {
    ${options.fillType0 ? `fill: ${options.fillType5}` : ""};
  }
  .task-type-6, .section-type-6  {
    ${options.fillType0 ? `fill: ${options.fillType6}` : ""};
  }
  .task-type-7, .section-type-7  {
    ${options.fillType0 ? `fill: ${options.fillType7}` : ""};
  }

  .actor-0 {
    ${options.actor0 ? `fill: ${options.actor0}` : ""};
  }
  .actor-1 {
    ${options.actor1 ? `fill: ${options.actor1}` : ""};
  }
  .actor-2 {
    ${options.actor2 ? `fill: ${options.actor2}` : ""};
  }
  .actor-3 {
    ${options.actor3 ? `fill: ${options.actor3}` : ""};
  }
  .actor-4 {
    ${options.actor4 ? `fill: ${options.actor4}` : ""};
  }
  .actor-5 {
    ${options.actor5 ? `fill: ${options.actor5}` : ""};
  }
  ${getIconStyles()}
`, "getStyles");
var styles_default = getStyles;
var drawRect2 = /* @__PURE__ */ __name(function(elem, rectData) {
  return drawRect(elem, rectData);
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
var drawText2 = /* @__PURE__ */ __name(function(elem, textData) {
  return drawText(elem, textData);
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
  drawText2(elem, txtObject);
}, "drawLabel");
var drawSection = /* @__PURE__ */ __name(function(elem, section, conf2) {
  const g = elem.append("g");
  const rect = getNoteRect();
  rect.x = section.x;
  rect.y = section.y;
  rect.fill = section.fill;
  rect.width = conf2.width * section.taskCount + conf2.diagramMarginX * (section.taskCount - 1);
  rect.height = conf2.height;
  rect.class = "journey-section section-type-" + section.num;
  rect.rx = 3;
  rect.ry = 3;
  drawRect2(g, rect);
  _drawTextCandidateFunc(conf2)(section.text, g, rect.x, rect.y, rect.width, rect.height, { class: "journey-section section-type-" + section.num }, conf2, section.colour);
}, "drawSection");
var taskCount = -1;
var drawTask = /* @__PURE__ */ __name(function(elem, task, conf2, diagramId) {
  const center = task.x + conf2.width / 2;
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
  rect.width = conf2.width;
  rect.height = conf2.height;
  rect.class = "task task-type-" + task.num;
  rect.rx = 3;
  rect.ry = 3;
  drawRect2(g, rect);
  let xPos = task.x + 14;
  task.people.forEach((person) => {
    const colour = task.actors[person].color;
    const circle = {
      cx: xPos,
      cy: task.y,
      r: 7,
      fill: colour,
      stroke: "#000",
      title: person,
      pos: task.actors[person].position
    };
    drawCircle(g, circle);
    xPos += 10;
  });
  _drawTextCandidateFunc(conf2)(task.task, g, rect.x, rect.y, rect.width, rect.height, { class: "task" }, conf2, task.colour);
}, "drawTask");
var drawBackgroundRect2 = /* @__PURE__ */ __name(function(elem, bounds2) {
  drawBackgroundRect(elem, bounds2);
}, "drawBackgroundRect");
var _drawTextCandidateFunc = /* @__PURE__ */ function() {
  function byText(content, g, x, y, width, height, textAttrs, colour) {
    const text = g.append("text").attr("x", x + width / 2).attr("y", y + height / 2 + 5).style("font-color", colour).style("text-anchor", "middle").text(content);
    _setTextAttrs(text, textAttrs);
  }
  __name(byText, "byText");
  function byTspan(content, g, x, y, width, height, textAttrs, conf2, colour) {
    const { taskFontSize, taskFontFamily } = conf2;
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
  function byFo(content, g, x, y, width, height, textAttrs, conf2) {
    const body = g.append("switch");
    const f = body.append("foreignObject").attr("x", x).attr("y", y).attr("width", width).attr("height", height).attr("position", "fixed");
    const text = f.append("xhtml:div").style("display", "table").style("height", "100%").style("width", "100%");
    text.append("div").attr("class", "label").style("display", "table-cell").style("text-align", "center").style("vertical-align", "middle").text(content);
    byTspan(content, body, x, y, width, height, textAttrs, conf2);
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
  return function(conf2) {
    return conf2.textPlacement === "fo" ? byFo : conf2.textPlacement === "old" ? byText : byTspan;
  };
}();
var initGraphics = /* @__PURE__ */ __name(function(graphics, id) {
  taskCount = -1;
  graphics.append("defs").append("marker").attr("id", id + "-arrowhead").attr("refX", 5).attr("refY", 2).attr("markerWidth", 6).attr("markerHeight", 4).attr("orient", "auto").append("path").attr("d", "M 0,0 V 4 L6,2 Z");
}, "initGraphics");
var svgDraw_default = {
  drawRect: drawRect2,
  drawCircle,
  drawSection,
  drawText: drawText2,
  drawLabel,
  drawTask,
  drawBackgroundRect: drawBackgroundRect2,
  initGraphics
};
var setConf = /* @__PURE__ */ __name(function(cnf) {
  const keys = Object.keys(cnf);
  keys.forEach(function(key) {
    conf[key] = cnf[key];
  });
}, "setConf");
var actors = {};
var maxWidth = 0;
function drawActorLegend(diagram2) {
  const conf2 = getConfig2().journey;
  const maxLabelWidth = conf2.maxLabelWidth;
  maxWidth = 0;
  let yPos = 60;
  Object.keys(actors).forEach((person) => {
    const colour = actors[person].color;
    const circleData = {
      cx: 20,
      cy: yPos,
      r: 7,
      fill: colour,
      stroke: "#000",
      pos: actors[person].position
    };
    svgDraw_default.drawCircle(diagram2, circleData);
    let measureText = diagram2.append("text").attr("visibility", "hidden").text(person);
    const fullTextWidth = measureText.node().getBoundingClientRect().width;
    measureText.remove();
    let lines = [];
    if (fullTextWidth <= maxLabelWidth) {
      lines = [person];
    } else {
      const words = person.split(" ");
      let currentLine = "";
      measureText = diagram2.append("text").attr("visibility", "hidden");
      words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        measureText.text(testLine);
        const textWidth = measureText.node().getBoundingClientRect().width;
        if (textWidth > maxLabelWidth) {
          if (currentLine) {
            lines.push(currentLine);
          }
          currentLine = word;
          measureText.text(word);
          if (measureText.node().getBoundingClientRect().width > maxLabelWidth) {
            let brokenWord = "";
            for (const char of word) {
              brokenWord += char;
              measureText.text(brokenWord + "-");
              if (measureText.node().getBoundingClientRect().width > maxLabelWidth) {
                lines.push(brokenWord.slice(0, -1) + "-");
                brokenWord = char;
              }
            }
            currentLine = brokenWord;
          }
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) {
        lines.push(currentLine);
      }
      measureText.remove();
    }
    lines.forEach((line, index) => {
      const labelData = {
        x: 40,
        y: yPos + 7 + index * 20,
        fill: "#666",
        text: line,
        textMargin: conf2.boxTextMargin ?? 5
      };
      const textElement = svgDraw_default.drawText(diagram2, labelData);
      const lineWidth = textElement.node().getBoundingClientRect().width;
      if (lineWidth > maxWidth && lineWidth > conf2.leftMargin - lineWidth) {
        maxWidth = lineWidth;
      }
    });
    yPos += Math.max(20, lines.length * 20);
  });
}
__name(drawActorLegend, "drawActorLegend");
var conf = getConfig2().journey;
var leftMargin = 0;
var draw = /* @__PURE__ */ __name(function(text, id, version, diagObj) {
  const configObject = getConfig2();
  const titleColor = configObject.journey.titleColor;
  const titleFontSize = configObject.journey.titleFontSize;
  const titleFontFamily = configObject.journey.titleFontFamily;
  const securityLevel = configObject.securityLevel;
  let sandboxElement;
  if (securityLevel === "sandbox") {
    sandboxElement = select_default("#i" + id);
  }
  const root = securityLevel === "sandbox" ? select_default(sandboxElement.nodes()[0].contentDocument.body) : select_default("body");
  bounds.init();
  const diagram2 = root.select("#" + id);
  svgDraw_default.initGraphics(diagram2, id);
  const tasks2 = diagObj.db.getTasks();
  const title = diagObj.db.getDiagramTitle();
  const actorNames = diagObj.db.getActors();
  for (const member in actors) {
    delete actors[member];
  }
  let actorPos = 0;
  actorNames.forEach((actorName) => {
    actors[actorName] = {
      color: conf.actorColours[actorPos % conf.actorColours.length],
      position: actorPos
    };
    actorPos++;
  });
  drawActorLegend(diagram2);
  leftMargin = conf.leftMargin + maxWidth;
  bounds.insert(0, 0, leftMargin, Object.keys(actors).length * 50);
  drawTasks(diagram2, tasks2, 0, id);
  const box = bounds.getBounds();
  if (title) {
    diagram2.append("text").text(title).attr("x", leftMargin).attr("font-size", titleFontSize).attr("font-weight", "bold").attr("y", 25).attr("fill", titleColor).attr("font-family", titleFontFamily);
  }
  const height = box.stopy - box.starty + 2 * conf.diagramMarginY;
  const width = leftMargin + box.stopx + 2 * conf.diagramMarginX;
  configureSvgSize(diagram2, height, width, conf.useMaxWidth);
  diagram2.append("line").attr("x1", leftMargin).attr("y1", conf.height * 4).attr("x2", width - leftMargin - 4).attr("y2", conf.height * 4).attr("stroke-width", 4).attr("stroke", "black").attr("marker-end", "url(#" + id + "-arrowhead)");
  const extraVertForTitle = title ? 70 : 0;
  diagram2.attr("viewBox", `${box.startx} -25 ${width} ${height + extraVertForTitle}`);
  diagram2.attr("preserveAspectRatio", "xMinYMin meet");
  diagram2.attr("height", height + extraVertForTitle + 25);
}, "draw");
var bounds = {
  data: {
    startx: undefined,
    stopx: undefined,
    starty: undefined,
    stopy: undefined
  },
  verticalPos: 0,
  sequenceItems: [],
  init: /* @__PURE__ */ __name(function() {
    this.sequenceItems = [];
    this.data = {
      startx: undefined,
      stopx: undefined,
      starty: undefined,
      stopy: undefined
    };
    this.verticalPos = 0;
  }, "init"),
  updateVal: /* @__PURE__ */ __name(function(obj, key, val, fun) {
    if (obj[key] === undefined) {
      obj[key] = val;
    } else {
      obj[key] = fun(val, obj[key]);
    }
  }, "updateVal"),
  updateBounds: /* @__PURE__ */ __name(function(startx, starty, stopx, stopy) {
    const conf2 = getConfig2().journey;
    const _self = this;
    let cnt = 0;
    function updateFn(type) {
      return /* @__PURE__ */ __name(function updateItemBounds(item) {
        cnt++;
        const n = _self.sequenceItems.length - cnt + 1;
        _self.updateVal(item, "starty", starty - n * conf2.boxMargin, Math.min);
        _self.updateVal(item, "stopy", stopy + n * conf2.boxMargin, Math.max);
        _self.updateVal(bounds.data, "startx", startx - n * conf2.boxMargin, Math.min);
        _self.updateVal(bounds.data, "stopx", stopx + n * conf2.boxMargin, Math.max);
        if (!(type === "activation")) {
          _self.updateVal(item, "startx", startx - n * conf2.boxMargin, Math.min);
          _self.updateVal(item, "stopx", stopx + n * conf2.boxMargin, Math.max);
          _self.updateVal(bounds.data, "starty", starty - n * conf2.boxMargin, Math.min);
          _self.updateVal(bounds.data, "stopy", stopy + n * conf2.boxMargin, Math.max);
        }
      }, "updateItemBounds");
    }
    __name(updateFn, "updateFn");
    this.sequenceItems.forEach(updateFn());
  }, "updateBounds"),
  insert: /* @__PURE__ */ __name(function(startx, starty, stopx, stopy) {
    const _startx = Math.min(startx, stopx);
    const _stopx = Math.max(startx, stopx);
    const _starty = Math.min(starty, stopy);
    const _stopy = Math.max(starty, stopy);
    this.updateVal(bounds.data, "startx", _startx, Math.min);
    this.updateVal(bounds.data, "starty", _starty, Math.min);
    this.updateVal(bounds.data, "stopx", _stopx, Math.max);
    this.updateVal(bounds.data, "stopy", _stopy, Math.max);
    this.updateBounds(_startx, _starty, _stopx, _stopy);
  }, "insert"),
  bumpVerticalPos: /* @__PURE__ */ __name(function(bump) {
    this.verticalPos = this.verticalPos + bump;
    this.data.stopy = this.verticalPos;
  }, "bumpVerticalPos"),
  getVerticalPos: /* @__PURE__ */ __name(function() {
    return this.verticalPos;
  }, "getVerticalPos"),
  getBounds: /* @__PURE__ */ __name(function() {
    return this.data;
  }, "getBounds")
};
var fills = conf.sectionFills;
var textColours = conf.sectionColours;
var drawTasks = /* @__PURE__ */ __name(function(diagram2, tasks2, verticalPos, diagramId) {
  const conf2 = getConfig2().journey;
  let lastSection = "";
  const sectionVHeight = conf2.height * 2 + conf2.diagramMarginY;
  const taskPos = verticalPos + sectionVHeight;
  let sectionNumber = 0;
  let fill = "#CCC";
  let colour = "black";
  let num = 0;
  for (const [i, task] of tasks2.entries()) {
    if (lastSection !== task.section) {
      fill = fills[sectionNumber % fills.length];
      num = sectionNumber % fills.length;
      colour = textColours[sectionNumber % textColours.length];
      let taskInSectionCount = 0;
      const currentSection2 = task.section;
      for (let taskIndex = i;taskIndex < tasks2.length; taskIndex++) {
        if (tasks2[taskIndex].section == currentSection2) {
          taskInSectionCount = taskInSectionCount + 1;
        } else {
          break;
        }
      }
      const section = {
        x: i * conf2.taskMargin + i * conf2.width + leftMargin,
        y: 50,
        text: task.section,
        fill,
        num,
        colour,
        taskCount: taskInSectionCount
      };
      svgDraw_default.drawSection(diagram2, section, conf2);
      lastSection = task.section;
      sectionNumber++;
    }
    const taskActors = task.people.reduce((acc, actorName) => {
      if (actors[actorName]) {
        acc[actorName] = actors[actorName];
      }
      return acc;
    }, {});
    task.x = i * conf2.taskMargin + i * conf2.width + leftMargin;
    task.y = taskPos;
    task.width = conf2.diagramMarginX;
    task.height = conf2.diagramMarginY;
    task.colour = colour;
    task.fill = fill;
    task.num = num;
    task.actors = taskActors;
    svgDraw_default.drawTask(diagram2, task, conf2, diagramId);
    bounds.insert(task.x, task.y, task.x + task.width + conf2.taskMargin, 300 + 5 * 30);
  }
}, "drawTasks");
var journeyRenderer_default = {
  setConf,
  draw
};
var diagram = {
  parser: journey_default,
  db: journeyDb_default,
  renderer: journeyRenderer_default,
  styles: styles_default,
  init: /* @__PURE__ */ __name((cnf) => {
    journeyRenderer_default.setConf(cnf.journey);
    journeyDb_default.clear();
  }, "init")
};
export {
  diagram
};

//# debugId=EE2380391ABABB5364756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2pvdXJuZXlEaWFncmFtLUpISVNTR0xXLm1qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsKICAgICJpbXBvcnQge1xuICBnZXRJY29uU3R5bGVzXG59IGZyb20gXCIuL2NodW5rLUZNQkQ3VUM0Lm1qc1wiO1xuaW1wb3J0IHtcbiAgZHJhd0JhY2tncm91bmRSZWN0LFxuICBkcmF3UmVjdCxcbiAgZHJhd1RleHQsXG4gIGdldE5vdGVSZWN0XG59IGZyb20gXCIuL2NodW5rLU5EMkdVSEFNLm1qc1wiO1xuaW1wb3J0IHtcbiAgY2xlYXIsXG4gIGNvbmZpZ3VyZVN2Z1NpemUsXG4gIGdldEFjY0Rlc2NyaXB0aW9uLFxuICBnZXRBY2NUaXRsZSxcbiAgZ2V0Q29uZmlnMiBhcyBnZXRDb25maWcsXG4gIGdldERpYWdyYW1UaXRsZSxcbiAgc2V0QWNjRGVzY3JpcHRpb24sXG4gIHNldEFjY1RpdGxlLFxuICBzZXREaWFncmFtVGl0bGVcbn0gZnJvbSBcIi4vY2h1bmstQ1NDSUhLN1EubWpzXCI7XG5pbXBvcnQge1xuICBfX25hbWVcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIHNyYy9kaWFncmFtcy91c2VyLWpvdXJuZXkvcGFyc2VyL2pvdXJuZXkuamlzb25cbnZhciBwYXJzZXIgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBvID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihrLCB2LCBvMiwgbCkge1xuICAgIGZvciAobzIgPSBvMiB8fCB7fSwgbCA9IGsubGVuZ3RoOyBsLS07IG8yW2tbbF1dID0gdikgO1xuICAgIHJldHVybiBvMjtcbiAgfSwgXCJvXCIpLCAkVjAgPSBbNiwgOCwgMTAsIDExLCAxMiwgMTQsIDE2LCAxNywgMThdLCAkVjEgPSBbMSwgOV0sICRWMiA9IFsxLCAxMF0sICRWMyA9IFsxLCAxMV0sICRWNCA9IFsxLCAxMl0sICRWNSA9IFsxLCAxM10sICRWNiA9IFsxLCAxNF07XG4gIHZhciBwYXJzZXIyID0ge1xuICAgIHRyYWNlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHRyYWNlKCkge1xuICAgIH0sIFwidHJhY2VcIiksXG4gICAgeXk6IHt9LFxuICAgIHN5bWJvbHNfOiB7IFwiZXJyb3JcIjogMiwgXCJzdGFydFwiOiAzLCBcImpvdXJuZXlcIjogNCwgXCJkb2N1bWVudFwiOiA1LCBcIkVPRlwiOiA2LCBcImxpbmVcIjogNywgXCJTUEFDRVwiOiA4LCBcInN0YXRlbWVudFwiOiA5LCBcIk5FV0xJTkVcIjogMTAsIFwidGl0bGVcIjogMTEsIFwiYWNjX3RpdGxlXCI6IDEyLCBcImFjY190aXRsZV92YWx1ZVwiOiAxMywgXCJhY2NfZGVzY3JcIjogMTQsIFwiYWNjX2Rlc2NyX3ZhbHVlXCI6IDE1LCBcImFjY19kZXNjcl9tdWx0aWxpbmVfdmFsdWVcIjogMTYsIFwic2VjdGlvblwiOiAxNywgXCJ0YXNrTmFtZVwiOiAxOCwgXCJ0YXNrRGF0YVwiOiAxOSwgXCIkYWNjZXB0XCI6IDAsIFwiJGVuZFwiOiAxIH0sXG4gICAgdGVybWluYWxzXzogeyAyOiBcImVycm9yXCIsIDQ6IFwiam91cm5leVwiLCA2OiBcIkVPRlwiLCA4OiBcIlNQQUNFXCIsIDEwOiBcIk5FV0xJTkVcIiwgMTE6IFwidGl0bGVcIiwgMTI6IFwiYWNjX3RpdGxlXCIsIDEzOiBcImFjY190aXRsZV92YWx1ZVwiLCAxNDogXCJhY2NfZGVzY3JcIiwgMTU6IFwiYWNjX2Rlc2NyX3ZhbHVlXCIsIDE2OiBcImFjY19kZXNjcl9tdWx0aWxpbmVfdmFsdWVcIiwgMTc6IFwic2VjdGlvblwiLCAxODogXCJ0YXNrTmFtZVwiLCAxOTogXCJ0YXNrRGF0YVwiIH0sXG4gICAgcHJvZHVjdGlvbnNfOiBbMCwgWzMsIDNdLCBbNSwgMF0sIFs1LCAyXSwgWzcsIDJdLCBbNywgMV0sIFs3LCAxXSwgWzcsIDFdLCBbOSwgMV0sIFs5LCAyXSwgWzksIDJdLCBbOSwgMV0sIFs5LCAxXSwgWzksIDJdXSxcbiAgICBwZXJmb3JtQWN0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGFub255bW91cyh5eXRleHQsIHl5bGVuZywgeXlsaW5lbm8sIHl5LCB5eXN0YXRlLCAkJCwgXyQpIHtcbiAgICAgIHZhciAkMCA9ICQkLmxlbmd0aCAtIDE7XG4gICAgICBzd2l0Y2ggKHl5c3RhdGUpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIHJldHVybiAkJFskMCAtIDFdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgdGhpcy4kID0gW107XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAkJFskMCAtIDFdLnB1c2goJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMCAtIDFdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgIGNhc2UgNTpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgY2FzZSA3OlxuICAgICAgICAgIHRoaXMuJCA9IFtdO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgeXkuc2V0RGlhZ3JhbVRpdGxlKCQkWyQwXS5zdWJzdHIoNikpO1xuICAgICAgICAgIHRoaXMuJCA9ICQkWyQwXS5zdWJzdHIoNik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgOTpcbiAgICAgICAgICB0aGlzLiQgPSAkJFskMF0udHJpbSgpO1xuICAgICAgICAgIHl5LnNldEFjY1RpdGxlKHRoaXMuJCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTA6XG4gICAgICAgIGNhc2UgMTE6XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdLnRyaW0oKTtcbiAgICAgICAgICB5eS5zZXRBY2NEZXNjcmlwdGlvbih0aGlzLiQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgIHl5LmFkZFNlY3Rpb24oJCRbJDBdLnN1YnN0cig4KSk7XG4gICAgICAgICAgdGhpcy4kID0gJCRbJDBdLnN1YnN0cig4KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICB5eS5hZGRUYXNrKCQkWyQwIC0gMV0sICQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gXCJ0YXNrXCI7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSwgXCJhbm9ueW1vdXNcIiksXG4gICAgdGFibGU6IFt7IDM6IDEsIDQ6IFsxLCAyXSB9LCB7IDE6IFszXSB9LCBvKCRWMCwgWzIsIDJdLCB7IDU6IDMgfSksIHsgNjogWzEsIDRdLCA3OiA1LCA4OiBbMSwgNl0sIDk6IDcsIDEwOiBbMSwgOF0sIDExOiAkVjEsIDEyOiAkVjIsIDE0OiAkVjMsIDE2OiAkVjQsIDE3OiAkVjUsIDE4OiAkVjYgfSwgbygkVjAsIFsyLCA3XSwgeyAxOiBbMiwgMV0gfSksIG8oJFYwLCBbMiwgM10pLCB7IDk6IDE1LCAxMTogJFYxLCAxMjogJFYyLCAxNDogJFYzLCAxNjogJFY0LCAxNzogJFY1LCAxODogJFY2IH0sIG8oJFYwLCBbMiwgNV0pLCBvKCRWMCwgWzIsIDZdKSwgbygkVjAsIFsyLCA4XSksIHsgMTM6IFsxLCAxNl0gfSwgeyAxNTogWzEsIDE3XSB9LCBvKCRWMCwgWzIsIDExXSksIG8oJFYwLCBbMiwgMTJdKSwgeyAxOTogWzEsIDE4XSB9LCBvKCRWMCwgWzIsIDRdKSwgbygkVjAsIFsyLCA5XSksIG8oJFYwLCBbMiwgMTBdKSwgbygkVjAsIFsyLCAxM10pXSxcbiAgICBkZWZhdWx0QWN0aW9uczoge30sXG4gICAgcGFyc2VFcnJvcjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwYXJzZUVycm9yKHN0ciwgaGFzaCkge1xuICAgICAgaWYgKGhhc2gucmVjb3ZlcmFibGUpIHtcbiAgICAgICAgdGhpcy50cmFjZShzdHIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKHN0cik7XG4gICAgICAgIGVycm9yLmhhc2ggPSBoYXNoO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LCBcInBhcnNlRXJyb3JcIiksXG4gICAgcGFyc2U6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcGFyc2UoaW5wdXQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcywgc3RhY2sgPSBbMF0sIHRzdGFjayA9IFtdLCB2c3RhY2sgPSBbbnVsbF0sIGxzdGFjayA9IFtdLCB0YWJsZSA9IHRoaXMudGFibGUsIHl5dGV4dCA9IFwiXCIsIHl5bGluZW5vID0gMCwgeXlsZW5nID0gMCwgcmVjb3ZlcmluZyA9IDAsIFRFUlJPUiA9IDIsIEVPRiA9IDE7XG4gICAgICB2YXIgYXJncyA9IGxzdGFjay5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICB2YXIgbGV4ZXIyID0gT2JqZWN0LmNyZWF0ZSh0aGlzLmxleGVyKTtcbiAgICAgIHZhciBzaGFyZWRTdGF0ZSA9IHsgeXk6IHt9IH07XG4gICAgICBmb3IgKHZhciBrIGluIHRoaXMueXkpIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnl5LCBrKSkge1xuICAgICAgICAgIHNoYXJlZFN0YXRlLnl5W2tdID0gdGhpcy55eVtrXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGV4ZXIyLnNldElucHV0KGlucHV0LCBzaGFyZWRTdGF0ZS55eSk7XG4gICAgICBzaGFyZWRTdGF0ZS55eS5sZXhlciA9IGxleGVyMjtcbiAgICAgIHNoYXJlZFN0YXRlLnl5LnBhcnNlciA9IHRoaXM7XG4gICAgICBpZiAodHlwZW9mIGxleGVyMi55eWxsb2MgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBsZXhlcjIueXlsbG9jID0ge307XG4gICAgICB9XG4gICAgICB2YXIgeXlsb2MgPSBsZXhlcjIueXlsbG9jO1xuICAgICAgbHN0YWNrLnB1c2goeXlsb2MpO1xuICAgICAgdmFyIHJhbmdlcyA9IGxleGVyMi5vcHRpb25zICYmIGxleGVyMi5vcHRpb25zLnJhbmdlcztcbiAgICAgIGlmICh0eXBlb2Ygc2hhcmVkU3RhdGUueXkucGFyc2VFcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRoaXMucGFyc2VFcnJvciA9IHNoYXJlZFN0YXRlLnl5LnBhcnNlRXJyb3I7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBhcnNlRXJyb3IgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykucGFyc2VFcnJvcjtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHBvcFN0YWNrKG4pIHtcbiAgICAgICAgc3RhY2subGVuZ3RoID0gc3RhY2subGVuZ3RoIC0gMiAqIG47XG4gICAgICAgIHZzdGFjay5sZW5ndGggPSB2c3RhY2subGVuZ3RoIC0gbjtcbiAgICAgICAgbHN0YWNrLmxlbmd0aCA9IGxzdGFjay5sZW5ndGggLSBuO1xuICAgICAgfVxuICAgICAgX19uYW1lKHBvcFN0YWNrLCBcInBvcFN0YWNrXCIpO1xuICAgICAgZnVuY3Rpb24gbGV4KCkge1xuICAgICAgICB2YXIgdG9rZW47XG4gICAgICAgIHRva2VuID0gdHN0YWNrLnBvcCgpIHx8IGxleGVyMi5sZXgoKSB8fCBFT0Y7XG4gICAgICAgIGlmICh0eXBlb2YgdG9rZW4gIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICBpZiAodG9rZW4gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgdHN0YWNrID0gdG9rZW47XG4gICAgICAgICAgICB0b2tlbiA9IHRzdGFjay5wb3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdG9rZW4gPSBzZWxmLnN5bWJvbHNfW3Rva2VuXSB8fCB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICB9XG4gICAgICBfX25hbWUobGV4LCBcImxleFwiKTtcbiAgICAgIHZhciBzeW1ib2wsIHByZUVycm9yU3ltYm9sLCBzdGF0ZSwgYWN0aW9uLCBhLCByLCB5eXZhbCA9IHt9LCBwLCBsZW4sIG5ld1N0YXRlLCBleHBlY3RlZDtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHN0YXRlID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRBY3Rpb25zW3N0YXRlXSkge1xuICAgICAgICAgIGFjdGlvbiA9IHRoaXMuZGVmYXVsdEFjdGlvbnNbc3RhdGVdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChzeW1ib2wgPT09IG51bGwgfHwgdHlwZW9mIHN5bWJvbCA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBzeW1ib2wgPSBsZXgoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aW9uID0gdGFibGVbc3RhdGVdICYmIHRhYmxlW3N0YXRlXVtzeW1ib2xdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgYWN0aW9uID09PSBcInVuZGVmaW5lZFwiIHx8ICFhY3Rpb24ubGVuZ3RoIHx8ICFhY3Rpb25bMF0pIHtcbiAgICAgICAgICB2YXIgZXJyU3RyID0gXCJcIjtcbiAgICAgICAgICBleHBlY3RlZCA9IFtdO1xuICAgICAgICAgIGZvciAocCBpbiB0YWJsZVtzdGF0ZV0pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRlcm1pbmFsc19bcF0gJiYgcCA+IFRFUlJPUikge1xuICAgICAgICAgICAgICBleHBlY3RlZC5wdXNoKFwiJ1wiICsgdGhpcy50ZXJtaW5hbHNfW3BdICsgXCInXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobGV4ZXIyLnNob3dQb3NpdGlvbikge1xuICAgICAgICAgICAgZXJyU3RyID0gXCJQYXJzZSBlcnJvciBvbiBsaW5lIFwiICsgKHl5bGluZW5vICsgMSkgKyBcIjpcXG5cIiArIGxleGVyMi5zaG93UG9zaXRpb24oKSArIFwiXFxuRXhwZWN0aW5nIFwiICsgZXhwZWN0ZWQuam9pbihcIiwgXCIpICsgXCIsIGdvdCAnXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlcnJTdHIgPSBcIlBhcnNlIGVycm9yIG9uIGxpbmUgXCIgKyAoeXlsaW5lbm8gKyAxKSArIFwiOiBVbmV4cGVjdGVkIFwiICsgKHN5bWJvbCA9PSBFT0YgPyBcImVuZCBvZiBpbnB1dFwiIDogXCInXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wYXJzZUVycm9yKGVyclN0ciwge1xuICAgICAgICAgICAgdGV4dDogbGV4ZXIyLm1hdGNoLFxuICAgICAgICAgICAgdG9rZW46IHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCxcbiAgICAgICAgICAgIGxpbmU6IGxleGVyMi55eWxpbmVubyxcbiAgICAgICAgICAgIGxvYzogeXlsb2MsXG4gICAgICAgICAgICBleHBlY3RlZFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhY3Rpb25bMF0gaW5zdGFuY2VvZiBBcnJheSAmJiBhY3Rpb24ubGVuZ3RoID4gMSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcnNlIEVycm9yOiBtdWx0aXBsZSBhY3Rpb25zIHBvc3NpYmxlIGF0IHN0YXRlOiBcIiArIHN0YXRlICsgXCIsIHRva2VuOiBcIiArIHN5bWJvbCk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChhY3Rpb25bMF0pIHtcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBzdGFjay5wdXNoKHN5bWJvbCk7XG4gICAgICAgICAgICB2c3RhY2sucHVzaChsZXhlcjIueXl0ZXh0KTtcbiAgICAgICAgICAgIGxzdGFjay5wdXNoKGxleGVyMi55eWxsb2MpO1xuICAgICAgICAgICAgc3RhY2sucHVzaChhY3Rpb25bMV0pO1xuICAgICAgICAgICAgc3ltYm9sID0gbnVsbDtcbiAgICAgICAgICAgIGlmICghcHJlRXJyb3JTeW1ib2wpIHtcbiAgICAgICAgICAgICAgeXlsZW5nID0gbGV4ZXIyLnl5bGVuZztcbiAgICAgICAgICAgICAgeXl0ZXh0ID0gbGV4ZXIyLnl5dGV4dDtcbiAgICAgICAgICAgICAgeXlsaW5lbm8gPSBsZXhlcjIueXlsaW5lbm87XG4gICAgICAgICAgICAgIHl5bG9jID0gbGV4ZXIyLnl5bGxvYztcbiAgICAgICAgICAgICAgaWYgKHJlY292ZXJpbmcgPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVjb3ZlcmluZy0tO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzeW1ib2wgPSBwcmVFcnJvclN5bWJvbDtcbiAgICAgICAgICAgICAgcHJlRXJyb3JTeW1ib2wgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgbGVuID0gdGhpcy5wcm9kdWN0aW9uc19bYWN0aW9uWzFdXVsxXTtcbiAgICAgICAgICAgIHl5dmFsLiQgPSB2c3RhY2tbdnN0YWNrLmxlbmd0aCAtIGxlbl07XG4gICAgICAgICAgICB5eXZhbC5fJCA9IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5maXJzdF9saW5lLFxuICAgICAgICAgICAgICBsYXN0X2xpbmU6IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gMV0ubGFzdF9saW5lLFxuICAgICAgICAgICAgICBmaXJzdF9jb2x1bW46IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0uZmlyc3RfY29sdW1uLFxuICAgICAgICAgICAgICBsYXN0X2NvbHVtbjogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAxXS5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChyYW5nZXMpIHtcbiAgICAgICAgICAgICAgeXl2YWwuXyQucmFuZ2UgPSBbXG4gICAgICAgICAgICAgICAgbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5yYW5nZVswXSxcbiAgICAgICAgICAgICAgICBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIDFdLnJhbmdlWzFdXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByID0gdGhpcy5wZXJmb3JtQWN0aW9uLmFwcGx5KHl5dmFsLCBbXG4gICAgICAgICAgICAgIHl5dGV4dCxcbiAgICAgICAgICAgICAgeXlsZW5nLFxuICAgICAgICAgICAgICB5eWxpbmVubyxcbiAgICAgICAgICAgICAgc2hhcmVkU3RhdGUueXksXG4gICAgICAgICAgICAgIGFjdGlvblsxXSxcbiAgICAgICAgICAgICAgdnN0YWNrLFxuICAgICAgICAgICAgICBsc3RhY2tcbiAgICAgICAgICAgIF0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsZW4pIHtcbiAgICAgICAgICAgICAgc3RhY2sgPSBzdGFjay5zbGljZSgwLCAtMSAqIGxlbiAqIDIpO1xuICAgICAgICAgICAgICB2c3RhY2sgPSB2c3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgICBsc3RhY2sgPSBsc3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhY2sucHVzaCh0aGlzLnByb2R1Y3Rpb25zX1thY3Rpb25bMV1dWzBdKTtcbiAgICAgICAgICAgIHZzdGFjay5wdXNoKHl5dmFsLiQpO1xuICAgICAgICAgICAgbHN0YWNrLnB1c2goeXl2YWwuXyQpO1xuICAgICAgICAgICAgbmV3U3RhdGUgPSB0YWJsZVtzdGFja1tzdGFjay5sZW5ndGggLSAyXV1bc3RhY2tbc3RhY2subGVuZ3RoIC0gMV1dO1xuICAgICAgICAgICAgc3RhY2sucHVzaChuZXdTdGF0ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSwgXCJwYXJzZVwiKVxuICB9O1xuICB2YXIgbGV4ZXIgPSAvKiBAX19QVVJFX18gKi8gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZXhlcjIgPSB7XG4gICAgICBFT0Y6IDEsXG4gICAgICBwYXJzZUVycm9yOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBhcnNlRXJyb3Ioc3RyLCBoYXNoKSB7XG4gICAgICAgIGlmICh0aGlzLnl5LnBhcnNlcikge1xuICAgICAgICAgIHRoaXMueXkucGFyc2VyLnBhcnNlRXJyb3Ioc3RyLCBoYXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3RyKTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwYXJzZUVycm9yXCIpLFxuICAgICAgLy8gcmVzZXRzIHRoZSBsZXhlciwgc2V0cyBuZXcgaW5wdXRcbiAgICAgIHNldElucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGlucHV0LCB5eSkge1xuICAgICAgICB0aGlzLnl5ID0geXkgfHwgdGhpcy55eSB8fCB7fTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBpbnB1dDtcbiAgICAgICAgdGhpcy5fbW9yZSA9IHRoaXMuX2JhY2t0cmFjayA9IHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnl5bGluZW5vID0gdGhpcy55eWxlbmcgPSAwO1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2ggPSBcIlwiO1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrID0gW1wiSU5JVElBTFwiXTtcbiAgICAgICAgdGhpcy55eWxsb2MgPSB7XG4gICAgICAgICAgZmlyc3RfbGluZTogMSxcbiAgICAgICAgICBmaXJzdF9jb2x1bW46IDAsXG4gICAgICAgICAgbGFzdF9saW5lOiAxLFxuICAgICAgICAgIGxhc3RfY29sdW1uOiAwXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2UgPSBbMCwgMF07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vZmZzZXQgPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwic2V0SW5wdXRcIiksXG4gICAgICAvLyBjb25zdW1lcyBhbmQgcmV0dXJucyBvbmUgY2hhciBmcm9tIHRoZSBpbnB1dFxuICAgICAgaW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjaCA9IHRoaXMuX2lucHV0WzBdO1xuICAgICAgICB0aGlzLnl5dGV4dCArPSBjaDtcbiAgICAgICAgdGhpcy55eWxlbmcrKztcbiAgICAgICAgdGhpcy5vZmZzZXQrKztcbiAgICAgICAgdGhpcy5tYXRjaCArPSBjaDtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IGNoO1xuICAgICAgICB2YXIgbGluZXMgPSBjaC5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8rKztcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2xpbmUrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtbisrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2VbMV0rKztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pbnB1dCA9IHRoaXMuX2lucHV0LnNsaWNlKDEpO1xuICAgICAgICByZXR1cm4gY2g7XG4gICAgICB9LCBcImlucHV0XCIpLFxuICAgICAgLy8gdW5zaGlmdHMgb25lIGNoYXIgKG9yIGEgc3RyaW5nKSBpbnRvIHRoZSBpbnB1dFxuICAgICAgdW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oY2gpIHtcbiAgICAgICAgdmFyIGxlbiA9IGNoLmxlbmd0aDtcbiAgICAgICAgdmFyIGxpbmVzID0gY2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBjaCArIHRoaXMuX2lucHV0O1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMueXl0ZXh0LnN1YnN0cigwLCB0aGlzLnl5dGV4dC5sZW5ndGggLSBsZW4pO1xuICAgICAgICB0aGlzLm9mZnNldCAtPSBsZW47XG4gICAgICAgIHZhciBvbGRMaW5lcyA9IHRoaXMubWF0Y2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5tYXRjaCA9IHRoaXMubWF0Y2guc3Vic3RyKDAsIHRoaXMubWF0Y2gubGVuZ3RoIC0gMSk7XG4gICAgICAgIHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2hlZC5zdWJzdHIoMCwgdGhpcy5tYXRjaGVkLmxlbmd0aCAtIDEpO1xuICAgICAgICBpZiAobGluZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gLT0gbGluZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgciA9IHRoaXMueXlsbG9jLnJhbmdlO1xuICAgICAgICB0aGlzLnl5bGxvYyA9IHtcbiAgICAgICAgICBmaXJzdF9saW5lOiB0aGlzLnl5bGxvYy5maXJzdF9saW5lLFxuICAgICAgICAgIGxhc3RfbGluZTogdGhpcy55eWxpbmVubyArIDEsXG4gICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gKGxpbmVzLmxlbmd0aCA9PT0gb2xkTGluZXMubGVuZ3RoID8gdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uIDogMCkgKyBvbGRMaW5lc1tvbGRMaW5lcy5sZW5ndGggLSBsaW5lcy5sZW5ndGhdLmxlbmd0aCAtIGxpbmVzWzBdLmxlbmd0aCA6IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbiAtIGxlblxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlID0gW3JbMF0sIHJbMF0gKyB0aGlzLnl5bGVuZyAtIGxlbl07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy55eWxlbmcgPSB0aGlzLnl5dGV4dC5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJ1bnB1dFwiKSxcbiAgICAgIC8vIFdoZW4gY2FsbGVkIGZyb20gYWN0aW9uLCBjYWNoZXMgbWF0Y2hlZCB0ZXh0IGFuZCBhcHBlbmRzIGl0IG9uIG5leHQgYWN0aW9uXG4gICAgICBtb3JlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9tb3JlID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcIm1vcmVcIiksXG4gICAgICAvLyBXaGVuIGNhbGxlZCBmcm9tIGFjdGlvbiwgc2lnbmFscyB0aGUgbGV4ZXIgdGhhdCB0aGlzIHJ1bGUgZmFpbHMgdG8gbWF0Y2ggdGhlIGlucHV0LCBzbyB0aGUgbmV4dCBtYXRjaGluZyBydWxlIChyZWdleCkgc2hvdWxkIGJlIHRlc3RlZCBpbnN0ZWFkLlxuICAgICAgcmVqZWN0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2t0cmFja19sZXhlcikge1xuICAgICAgICAgIHRoaXMuX2JhY2t0cmFjayA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gWW91IGNhbiBvbmx5IGludm9rZSByZWplY3QoKSBpbiB0aGUgbGV4ZXIgd2hlbiB0aGUgbGV4ZXIgaXMgb2YgdGhlIGJhY2t0cmFja2luZyBwZXJzdWFzaW9uIChvcHRpb25zLmJhY2t0cmFja19sZXhlciA9IHRydWUpLlxcblwiICsgdGhpcy5zaG93UG9zaXRpb24oKSwge1xuICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgIHRva2VuOiBudWxsLFxuICAgICAgICAgICAgbGluZTogdGhpcy55eWxpbmVub1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJyZWplY3RcIiksXG4gICAgICAvLyByZXRhaW4gZmlyc3QgbiBjaGFyYWN0ZXJzIG9mIHRoZSBtYXRjaFxuICAgICAgbGVzczogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihuKSB7XG4gICAgICAgIHRoaXMudW5wdXQodGhpcy5tYXRjaC5zbGljZShuKSk7XG4gICAgICB9LCBcImxlc3NcIiksXG4gICAgICAvLyBkaXNwbGF5cyBhbHJlYWR5IG1hdGNoZWQgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICBwYXN0SW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwYXN0ID0gdGhpcy5tYXRjaGVkLnN1YnN0cigwLCB0aGlzLm1hdGNoZWQubGVuZ3RoIC0gdGhpcy5tYXRjaC5sZW5ndGgpO1xuICAgICAgICByZXR1cm4gKHBhc3QubGVuZ3RoID4gMjAgPyBcIi4uLlwiIDogXCJcIikgKyBwYXN0LnN1YnN0cigtMjApLnJlcGxhY2UoL1xcbi9nLCBcIlwiKTtcbiAgICAgIH0sIFwicGFzdElucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdXBjb21pbmcgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICB1cGNvbWluZ0lucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV4dCA9IHRoaXMubWF0Y2g7XG4gICAgICAgIGlmIChuZXh0Lmxlbmd0aCA8IDIwKSB7XG4gICAgICAgICAgbmV4dCArPSB0aGlzLl9pbnB1dC5zdWJzdHIoMCwgMjAgLSBuZXh0Lmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChuZXh0LnN1YnN0cigwLCAyMCkgKyAobmV4dC5sZW5ndGggPiAyMCA/IFwiLi4uXCIgOiBcIlwiKSkucmVwbGFjZSgvXFxuL2csIFwiXCIpO1xuICAgICAgfSwgXCJ1cGNvbWluZ0lucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdGhlIGNoYXJhY3RlciBwb3NpdGlvbiB3aGVyZSB0aGUgbGV4aW5nIGVycm9yIG9jY3VycmVkLCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgc2hvd1Bvc2l0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJlID0gdGhpcy5wYXN0SW5wdXQoKTtcbiAgICAgICAgdmFyIGMgPSBuZXcgQXJyYXkocHJlLmxlbmd0aCArIDEpLmpvaW4oXCItXCIpO1xuICAgICAgICByZXR1cm4gcHJlICsgdGhpcy51cGNvbWluZ0lucHV0KCkgKyBcIlxcblwiICsgYyArIFwiXlwiO1xuICAgICAgfSwgXCJzaG93UG9zaXRpb25cIiksXG4gICAgICAvLyB0ZXN0IHRoZSBsZXhlZCB0b2tlbjogcmV0dXJuIEZBTFNFIHdoZW4gbm90IGEgbWF0Y2gsIG90aGVyd2lzZSByZXR1cm4gdG9rZW5cbiAgICAgIHRlc3RfbWF0Y2g6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obWF0Y2gsIGluZGV4ZWRfcnVsZSkge1xuICAgICAgICB2YXIgdG9rZW4sIGxpbmVzLCBiYWNrdXA7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFja3RyYWNrX2xleGVyKSB7XG4gICAgICAgICAgYmFja3VwID0ge1xuICAgICAgICAgICAgeXlsaW5lbm86IHRoaXMueXlsaW5lbm8sXG4gICAgICAgICAgICB5eWxsb2M6IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogdGhpcy55eWxsb2MuZmlyc3RfbGluZSxcbiAgICAgICAgICAgICAgbGFzdF9saW5lOiB0aGlzLmxhc3RfbGluZSxcbiAgICAgICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgICAgIGxhc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHl5dGV4dDogdGhpcy55eXRleHQsXG4gICAgICAgICAgICBtYXRjaDogdGhpcy5tYXRjaCxcbiAgICAgICAgICAgIG1hdGNoZXM6IHRoaXMubWF0Y2hlcyxcbiAgICAgICAgICAgIG1hdGNoZWQ6IHRoaXMubWF0Y2hlZCxcbiAgICAgICAgICAgIHl5bGVuZzogdGhpcy55eWxlbmcsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgX21vcmU6IHRoaXMuX21vcmUsXG4gICAgICAgICAgICBfaW5wdXQ6IHRoaXMuX2lucHV0LFxuICAgICAgICAgICAgeXk6IHRoaXMueXksXG4gICAgICAgICAgICBjb25kaXRpb25TdGFjazogdGhpcy5jb25kaXRpb25TdGFjay5zbGljZSgwKSxcbiAgICAgICAgICAgIGRvbmU6IHRoaXMuZG9uZVxuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICAgIGJhY2t1cC55eWxsb2MucmFuZ2UgPSB0aGlzLnl5bGxvYy5yYW5nZS5zbGljZSgwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMgPSBtYXRjaFswXS5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gKz0gbGluZXMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueXlsbG9jID0ge1xuICAgICAgICAgIGZpcnN0X2xpbmU6IHRoaXMueXlsbG9jLmxhc3RfbGluZSxcbiAgICAgICAgICBsYXN0X2xpbmU6IHRoaXMueXlsaW5lbm8gKyAxLFxuICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubGVuZ3RoIC0gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubWF0Y2goL1xccj9cXG4/LylbMF0ubGVuZ3RoIDogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4gKyBtYXRjaFswXS5sZW5ndGhcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy55eXRleHQgKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2ggKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2hlcyA9IG1hdGNoO1xuICAgICAgICB0aGlzLnl5bGVuZyA9IHRoaXMueXl0ZXh0Lmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZSA9IFt0aGlzLm9mZnNldCwgdGhpcy5vZmZzZXQgKz0gdGhpcy55eWxlbmddO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX21vcmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fYmFja3RyYWNrID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2lucHV0ID0gdGhpcy5faW5wdXQuc2xpY2UobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IG1hdGNoWzBdO1xuICAgICAgICB0b2tlbiA9IHRoaXMucGVyZm9ybUFjdGlvbi5jYWxsKHRoaXMsIHRoaXMueXksIHRoaXMsIGluZGV4ZWRfcnVsZSwgdGhpcy5jb25kaXRpb25TdGFja1t0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgaWYgKHRoaXMuZG9uZSAmJiB0aGlzLl9pbnB1dCkge1xuICAgICAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9iYWNrdHJhY2spIHtcbiAgICAgICAgICBmb3IgKHZhciBrIGluIGJhY2t1cCkge1xuICAgICAgICAgICAgdGhpc1trXSA9IGJhY2t1cFtrXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sIFwidGVzdF9tYXRjaFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIGluIGlucHV0XG4gICAgICBuZXh0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuRU9GO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5faW5wdXQpIHtcbiAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0b2tlbiwgbWF0Y2gsIHRlbXBNYXRjaCwgaW5kZXg7XG4gICAgICAgIGlmICghdGhpcy5fbW9yZSkge1xuICAgICAgICAgIHRoaXMueXl0ZXh0ID0gXCJcIjtcbiAgICAgICAgICB0aGlzLm1hdGNoID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcnVsZXMgPSB0aGlzLl9jdXJyZW50UnVsZXMoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRlbXBNYXRjaCA9IHRoaXMuX2lucHV0Lm1hdGNoKHRoaXMucnVsZXNbcnVsZXNbaV1dKTtcbiAgICAgICAgICBpZiAodGVtcE1hdGNoICYmICghbWF0Y2ggfHwgdGVtcE1hdGNoWzBdLmxlbmd0aCA+IG1hdGNoWzBdLmxlbmd0aCkpIHtcbiAgICAgICAgICAgIG1hdGNoID0gdGVtcE1hdGNoO1xuICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIpIHtcbiAgICAgICAgICAgICAgdG9rZW4gPSB0aGlzLnRlc3RfbWF0Y2godGVtcE1hdGNoLCBydWxlc1tpXSk7XG4gICAgICAgICAgICAgIGlmICh0b2tlbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmFja3RyYWNrKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMub3B0aW9ucy5mbGV4KSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICB0b2tlbiA9IHRoaXMudGVzdF9tYXRjaChtYXRjaCwgcnVsZXNbaW5kZXhdKTtcbiAgICAgICAgICBpZiAodG9rZW4gIT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5faW5wdXQgPT09IFwiXCIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5FT0Y7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gVW5yZWNvZ25pemVkIHRleHQuXFxuXCIgKyB0aGlzLnNob3dQb3NpdGlvbigpLCB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgdG9rZW46IG51bGwsXG4gICAgICAgICAgICBsaW5lOiB0aGlzLnl5bGluZW5vXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibmV4dFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIHRoYXQgaGFzIGEgdG9rZW5cbiAgICAgIGxleDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBsZXgoKSB7XG4gICAgICAgIHZhciByID0gdGhpcy5uZXh0KCk7XG4gICAgICAgIGlmIChyKSB7XG4gICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubGV4KCk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibGV4XCIpLFxuICAgICAgLy8gYWN0aXZhdGVzIGEgbmV3IGxleGVyIGNvbmRpdGlvbiBzdGF0ZSAocHVzaGVzIHRoZSBuZXcgbGV4ZXIgY29uZGl0aW9uIHN0YXRlIG9udG8gdGhlIGNvbmRpdGlvbiBzdGFjaylcbiAgICAgIGJlZ2luOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGJlZ2luKGNvbmRpdGlvbikge1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrLnB1c2goY29uZGl0aW9uKTtcbiAgICAgIH0sIFwiYmVnaW5cIiksXG4gICAgICAvLyBwb3AgdGhlIHByZXZpb3VzbHkgYWN0aXZlIGxleGVyIGNvbmRpdGlvbiBzdGF0ZSBvZmYgdGhlIGNvbmRpdGlvbiBzdGFja1xuICAgICAgcG9wU3RhdGU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcG9wU3RhdGUoKSB7XG4gICAgICAgIHZhciBuID0gdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxO1xuICAgICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFjay5wb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1swXTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwb3BTdGF0ZVwiKSxcbiAgICAgIC8vIHByb2R1Y2UgdGhlIGxleGVyIHJ1bGUgc2V0IHdoaWNoIGlzIGFjdGl2ZSBmb3IgdGhlIGN1cnJlbnRseSBhY3RpdmUgbGV4ZXIgY29uZGl0aW9uIHN0YXRlXG4gICAgICBfY3VycmVudFJ1bGVzOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIF9jdXJyZW50UnVsZXMoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAmJiB0aGlzLmNvbmRpdGlvblN0YWNrW3RoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25zW3RoaXMuY29uZGl0aW9uU3RhY2tbdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxXV0ucnVsZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uc1tcIklOSVRJQUxcIl0ucnVsZXM7XG4gICAgICAgIH1cbiAgICAgIH0sIFwiX2N1cnJlbnRSdWxlc1wiKSxcbiAgICAgIC8vIHJldHVybiB0aGUgY3VycmVudGx5IGFjdGl2ZSBsZXhlciBjb25kaXRpb24gc3RhdGU7IHdoZW4gYW4gaW5kZXggYXJndW1lbnQgaXMgcHJvdmlkZWQgaXQgcHJvZHVjZXMgdGhlIE4tdGggcHJldmlvdXMgY29uZGl0aW9uIHN0YXRlLCBpZiBhdmFpbGFibGVcbiAgICAgIHRvcFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHRvcFN0YXRlKG4pIHtcbiAgICAgICAgbiA9IHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMSAtIE1hdGguYWJzKG4gfHwgMCk7XG4gICAgICAgIGlmIChuID49IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1tuXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gXCJJTklUSUFMXCI7XG4gICAgICAgIH1cbiAgICAgIH0sIFwidG9wU3RhdGVcIiksXG4gICAgICAvLyBhbGlhcyBmb3IgYmVnaW4oY29uZGl0aW9uKVxuICAgICAgcHVzaFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHB1c2hTdGF0ZShjb25kaXRpb24pIHtcbiAgICAgICAgdGhpcy5iZWdpbihjb25kaXRpb24pO1xuICAgICAgfSwgXCJwdXNoU3RhdGVcIiksXG4gICAgICAvLyByZXR1cm4gdGhlIG51bWJlciBvZiBzdGF0ZXMgY3VycmVudGx5IG9uIHRoZSBzdGFja1xuICAgICAgc3RhdGVTdGFja1NpemU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gc3RhdGVTdGFja1NpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aDtcbiAgICAgIH0sIFwic3RhdGVTdGFja1NpemVcIiksXG4gICAgICBvcHRpb25zOiB7IFwiY2FzZS1pbnNlbnNpdGl2ZVwiOiB0cnVlIH0sXG4gICAgICBwZXJmb3JtQWN0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGFub255bW91cyh5eSwgeXlfLCAkYXZvaWRpbmdfbmFtZV9jb2xsaXNpb25zLCBZWV9TVEFSVCkge1xuICAgICAgICB2YXIgWVlTVEFURSA9IFlZX1NUQVJUO1xuICAgICAgICBzd2l0Y2ggKCRhdm9pZGluZ19uYW1lX2NvbGxpc2lvbnMpIHtcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICByZXR1cm4gMTA7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICByZXR1cm4gNDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgIHJldHVybiAxMTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJhY2NfdGl0bGVcIik7XG4gICAgICAgICAgICByZXR1cm4gMTI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gXCJhY2NfdGl0bGVfdmFsdWVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgIHRoaXMuYmVnaW4oXCJhY2NfZGVzY3JcIik7XG4gICAgICAgICAgICByZXR1cm4gMTQ7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgcmV0dXJuIFwiYWNjX2Rlc2NyX3ZhbHVlXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgICAgdGhpcy5iZWdpbihcImFjY19kZXNjcl9tdWx0aWxpbmVcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICAgIHJldHVybiBcImFjY19kZXNjcl9tdWx0aWxpbmVfdmFsdWVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTQ6XG4gICAgICAgICAgICByZXR1cm4gMTc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgICAgcmV0dXJuIDE4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgIHJldHVybiAxOTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgICByZXR1cm4gXCI6XCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE4OlxuICAgICAgICAgICAgcmV0dXJuIDY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE5OlxuICAgICAgICAgICAgcmV0dXJuIFwiSU5WQUxJRFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0sIFwiYW5vbnltb3VzXCIpLFxuICAgICAgcnVsZXM6IFsvXig/OiUoPyFcXHspW15cXG5dKikvaSwgL14oPzpbXlxcfV0lJVteXFxuXSopL2ksIC9eKD86W1xcbl0rKS9pLCAvXig/OlxccyspL2ksIC9eKD86I1teXFxuXSopL2ksIC9eKD86am91cm5leVxcYikvaSwgL14oPzp0aXRsZVxcc1teI1xcbjtdKykvaSwgL14oPzphY2NUaXRsZVxccyo6XFxzKikvaSwgL14oPzooPyFcXG58fCkqW15cXG5dKikvaSwgL14oPzphY2NEZXNjclxccyo6XFxzKikvaSwgL14oPzooPyFcXG58fCkqW15cXG5dKikvaSwgL14oPzphY2NEZXNjclxccypcXHtcXHMqKS9pLCAvXig/OltcXH1dKS9pLCAvXig/OlteXFx9XSopL2ksIC9eKD86c2VjdGlvblxcc1teIzpcXG47XSspL2ksIC9eKD86W14jOlxcbjtdKykvaSwgL14oPzo6W14jXFxuO10rKS9pLCAvXig/OjopL2ksIC9eKD86JCkvaSwgL14oPzouKS9pXSxcbiAgICAgIGNvbmRpdGlvbnM6IHsgXCJhY2NfZGVzY3JfbXVsdGlsaW5lXCI6IHsgXCJydWxlc1wiOiBbMTIsIDEzXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJhY2NfZGVzY3JcIjogeyBcInJ1bGVzXCI6IFsxMF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiYWNjX3RpdGxlXCI6IHsgXCJydWxlc1wiOiBbOF0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiSU5JVElBTFwiOiB7IFwicnVsZXNcIjogWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDksIDExLCAxNCwgMTUsIDE2LCAxNywgMTgsIDE5XSwgXCJpbmNsdXNpdmVcIjogdHJ1ZSB9IH1cbiAgICB9O1xuICAgIHJldHVybiBsZXhlcjI7XG4gIH0pKCk7XG4gIHBhcnNlcjIubGV4ZXIgPSBsZXhlcjtcbiAgZnVuY3Rpb24gUGFyc2VyKCkge1xuICAgIHRoaXMueXkgPSB7fTtcbiAgfVxuICBfX25hbWUoUGFyc2VyLCBcIlBhcnNlclwiKTtcbiAgUGFyc2VyLnByb3RvdHlwZSA9IHBhcnNlcjI7XG4gIHBhcnNlcjIuUGFyc2VyID0gUGFyc2VyO1xuICByZXR1cm4gbmV3IFBhcnNlcigpO1xufSkoKTtcbnBhcnNlci5wYXJzZXIgPSBwYXJzZXI7XG52YXIgam91cm5leV9kZWZhdWx0ID0gcGFyc2VyO1xuXG4vLyBzcmMvZGlhZ3JhbXMvdXNlci1qb3VybmV5L2pvdXJuZXlEYi5qc1xudmFyIGN1cnJlbnRTZWN0aW9uID0gXCJcIjtcbnZhciBzZWN0aW9ucyA9IFtdO1xudmFyIHRhc2tzID0gW107XG52YXIgcmF3VGFza3MgPSBbXTtcbnZhciBjbGVhcjIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICBzZWN0aW9ucy5sZW5ndGggPSAwO1xuICB0YXNrcy5sZW5ndGggPSAwO1xuICBjdXJyZW50U2VjdGlvbiA9IFwiXCI7XG4gIHJhd1Rhc2tzLmxlbmd0aCA9IDA7XG4gIGNsZWFyKCk7XG59LCBcImNsZWFyXCIpO1xudmFyIGFkZFNlY3Rpb24gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHR4dCkge1xuICBjdXJyZW50U2VjdGlvbiA9IHR4dDtcbiAgc2VjdGlvbnMucHVzaCh0eHQpO1xufSwgXCJhZGRTZWN0aW9uXCIpO1xudmFyIGdldFNlY3Rpb25zID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHNlY3Rpb25zO1xufSwgXCJnZXRTZWN0aW9uc1wiKTtcbnZhciBnZXRUYXNrcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gIGxldCBhbGxJdGVtc1Byb2Nlc3NlZCA9IGNvbXBpbGVUYXNrcygpO1xuICBjb25zdCBtYXhEZXB0aCA9IDEwMDtcbiAgbGV0IGl0ZXJhdGlvbkNvdW50ID0gMDtcbiAgd2hpbGUgKCFhbGxJdGVtc1Byb2Nlc3NlZCAmJiBpdGVyYXRpb25Db3VudCA8IG1heERlcHRoKSB7XG4gICAgYWxsSXRlbXNQcm9jZXNzZWQgPSBjb21waWxlVGFza3MoKTtcbiAgICBpdGVyYXRpb25Db3VudCsrO1xuICB9XG4gIHRhc2tzLnB1c2goLi4ucmF3VGFza3MpO1xuICByZXR1cm4gdGFza3M7XG59LCBcImdldFRhc2tzXCIpO1xudmFyIHVwZGF0ZUFjdG9ycyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gIGNvbnN0IHRlbXBBY3RvcnMgPSBbXTtcbiAgdGFza3MuZm9yRWFjaCgodGFzaykgPT4ge1xuICAgIGlmICh0YXNrLnBlb3BsZSkge1xuICAgICAgdGVtcEFjdG9ycy5wdXNoKC4uLnRhc2sucGVvcGxlKTtcbiAgICB9XG4gIH0pO1xuICBjb25zdCB1bmlxdWUgPSBuZXcgU2V0KHRlbXBBY3RvcnMpO1xuICByZXR1cm4gWy4uLnVuaXF1ZV0uc29ydCgpO1xufSwgXCJ1cGRhdGVBY3RvcnNcIik7XG52YXIgYWRkVGFzayA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZGVzY3IsIHRhc2tEYXRhKSB7XG4gIGNvbnN0IHBpZWNlcyA9IHRhc2tEYXRhLnN1YnN0cigxKS5zcGxpdChcIjpcIik7XG4gIGxldCBzY29yZSA9IDA7XG4gIGxldCBwZWVwcyA9IFtdO1xuICBpZiAocGllY2VzLmxlbmd0aCA9PT0gMSkge1xuICAgIHNjb3JlID0gTnVtYmVyKHBpZWNlc1swXSk7XG4gICAgcGVlcHMgPSBbXTtcbiAgfSBlbHNlIHtcbiAgICBzY29yZSA9IE51bWJlcihwaWVjZXNbMF0pO1xuICAgIHBlZXBzID0gcGllY2VzWzFdLnNwbGl0KFwiLFwiKTtcbiAgfVxuICBjb25zdCBwZW9wbGVMaXN0ID0gcGVlcHMubWFwKChzKSA9PiBzLnRyaW0oKSk7XG4gIGNvbnN0IHJhd1Rhc2sgPSB7XG4gICAgc2VjdGlvbjogY3VycmVudFNlY3Rpb24sXG4gICAgdHlwZTogY3VycmVudFNlY3Rpb24sXG4gICAgcGVvcGxlOiBwZW9wbGVMaXN0LFxuICAgIHRhc2s6IGRlc2NyLFxuICAgIHNjb3JlXG4gIH07XG4gIHJhd1Rhc2tzLnB1c2gocmF3VGFzayk7XG59LCBcImFkZFRhc2tcIik7XG52YXIgYWRkVGFza09yZyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZGVzY3IpIHtcbiAgY29uc3QgbmV3VGFzayA9IHtcbiAgICBzZWN0aW9uOiBjdXJyZW50U2VjdGlvbixcbiAgICB0eXBlOiBjdXJyZW50U2VjdGlvbixcbiAgICBkZXNjcmlwdGlvbjogZGVzY3IsXG4gICAgdGFzazogZGVzY3IsXG4gICAgY2xhc3NlczogW11cbiAgfTtcbiAgdGFza3MucHVzaChuZXdUYXNrKTtcbn0sIFwiYWRkVGFza09yZ1wiKTtcbnZhciBjb21waWxlVGFza3MgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICBjb25zdCBjb21waWxlVGFzayA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24ocG9zKSB7XG4gICAgcmV0dXJuIHJhd1Rhc2tzW3Bvc10ucHJvY2Vzc2VkO1xuICB9LCBcImNvbXBpbGVUYXNrXCIpO1xuICBsZXQgYWxsUHJvY2Vzc2VkID0gdHJ1ZTtcbiAgZm9yIChjb25zdCBbaSwgcmF3VGFza10gb2YgcmF3VGFza3MuZW50cmllcygpKSB7XG4gICAgY29tcGlsZVRhc2soaSk7XG4gICAgYWxsUHJvY2Vzc2VkID0gYWxsUHJvY2Vzc2VkICYmIHJhd1Rhc2sucHJvY2Vzc2VkO1xuICB9XG4gIHJldHVybiBhbGxQcm9jZXNzZWQ7XG59LCBcImNvbXBpbGVUYXNrc1wiKTtcbnZhciBnZXRBY3RvcnMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdXBkYXRlQWN0b3JzKCk7XG59LCBcImdldEFjdG9yc1wiKTtcbnZhciBqb3VybmV5RGJfZGVmYXVsdCA9IHtcbiAgZ2V0Q29uZmlnOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKCgpID0+IGdldENvbmZpZygpLmpvdXJuZXksIFwiZ2V0Q29uZmlnXCIpLFxuICBjbGVhcjogY2xlYXIyLFxuICBzZXREaWFncmFtVGl0bGUsXG4gIGdldERpYWdyYW1UaXRsZSxcbiAgc2V0QWNjVGl0bGUsXG4gIGdldEFjY1RpdGxlLFxuICBzZXRBY2NEZXNjcmlwdGlvbixcbiAgZ2V0QWNjRGVzY3JpcHRpb24sXG4gIGFkZFNlY3Rpb24sXG4gIGdldFNlY3Rpb25zLFxuICBnZXRUYXNrcyxcbiAgYWRkVGFzayxcbiAgYWRkVGFza09yZyxcbiAgZ2V0QWN0b3JzXG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMvdXNlci1qb3VybmV5L3N0eWxlcy5qc1xudmFyIGdldFN0eWxlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKG9wdGlvbnMpID0+IGAubGFiZWwge1xuICAgIGZvbnQtZmFtaWx5OiAke29wdGlvbnMuZm9udEZhbWlseX07XG4gICAgY29sb3I6ICR7b3B0aW9ucy50ZXh0Q29sb3J9O1xuICB9XG4gIC5tb3V0aCB7XG4gICAgc3Ryb2tlOiAjNjY2O1xuICB9XG5cbiAgbGluZSB7XG4gICAgc3Ryb2tlOiAke29wdGlvbnMudGV4dENvbG9yfVxuICB9XG5cbiAgLmxlZ2VuZCB7XG4gICAgZmlsbDogJHtvcHRpb25zLnRleHRDb2xvcn07XG4gICAgZm9udC1mYW1pbHk6ICR7b3B0aW9ucy5mb250RmFtaWx5fTtcbiAgfVxuXG4gIC5sYWJlbCB0ZXh0IHtcbiAgICBmaWxsOiAjMzMzO1xuICB9XG4gIC5sYWJlbCB7XG4gICAgY29sb3I6ICR7b3B0aW9ucy50ZXh0Q29sb3J9XG4gIH1cblxuICAuZmFjZSB7XG4gICAgJHtvcHRpb25zLmZhY2VDb2xvciA/IGBmaWxsOiAke29wdGlvbnMuZmFjZUNvbG9yfWAgOiBcImZpbGw6ICNGRkY4RENcIn07XG4gICAgc3Ryb2tlOiAjOTk5O1xuICB9XG5cbiAgLm5vZGUgcmVjdCxcbiAgLm5vZGUgY2lyY2xlLFxuICAubm9kZSBlbGxpcHNlLFxuICAubm9kZSBwb2x5Z29uLFxuICAubm9kZSBwYXRoIHtcbiAgICBmaWxsOiAke29wdGlvbnMubWFpbkJrZ307XG4gICAgc3Ryb2tlOiAke29wdGlvbnMubm9kZUJvcmRlcn07XG4gICAgc3Ryb2tlLXdpZHRoOiAxcHg7XG4gIH1cblxuICAubm9kZSAubGFiZWwge1xuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgfVxuICAubm9kZS5jbGlja2FibGUge1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgfVxuXG4gIC5hcnJvd2hlYWRQYXRoIHtcbiAgICBmaWxsOiAke29wdGlvbnMuYXJyb3doZWFkQ29sb3J9O1xuICB9XG5cbiAgLmVkZ2VQYXRoIC5wYXRoIHtcbiAgICBzdHJva2U6ICR7b3B0aW9ucy5saW5lQ29sb3J9O1xuICAgIHN0cm9rZS13aWR0aDogMS41cHg7XG4gIH1cblxuICAuZmxvd2NoYXJ0LWxpbmsge1xuICAgIHN0cm9rZTogJHtvcHRpb25zLmxpbmVDb2xvcn07XG4gICAgZmlsbDogbm9uZTtcbiAgfVxuXG4gIC5lZGdlTGFiZWwge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICR7b3B0aW9ucy5lZGdlTGFiZWxCYWNrZ3JvdW5kfTtcbiAgICByZWN0IHtcbiAgICAgIG9wYWNpdHk6IDAuNTtcbiAgICB9XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICB9XG5cbiAgLmNsdXN0ZXIgcmVjdCB7XG4gIH1cblxuICAuY2x1c3RlciB0ZXh0IHtcbiAgICBmaWxsOiAke29wdGlvbnMudGl0bGVDb2xvcn07XG4gIH1cblxuICBkaXYubWVybWFpZFRvb2x0aXAge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgbWF4LXdpZHRoOiAyMDBweDtcbiAgICBwYWRkaW5nOiAycHg7XG4gICAgZm9udC1mYW1pbHk6ICR7b3B0aW9ucy5mb250RmFtaWx5fTtcbiAgICBmb250LXNpemU6IDEycHg7XG4gICAgYmFja2dyb3VuZDogJHtvcHRpb25zLnRlcnRpYXJ5Q29sb3J9O1xuICAgIGJvcmRlcjogMXB4IHNvbGlkICR7b3B0aW9ucy5ib3JkZXIyfTtcbiAgICBib3JkZXItcmFkaXVzOiAycHg7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICAgei1pbmRleDogMTAwO1xuICB9XG5cbiAgLnRhc2stdHlwZS0wLCAuc2VjdGlvbi10eXBlLTAgIHtcbiAgICAke29wdGlvbnMuZmlsbFR5cGUwID8gYGZpbGw6ICR7b3B0aW9ucy5maWxsVHlwZTB9YCA6IFwiXCJ9O1xuICB9XG4gIC50YXNrLXR5cGUtMSwgLnNlY3Rpb24tdHlwZS0xICB7XG4gICAgJHtvcHRpb25zLmZpbGxUeXBlMCA/IGBmaWxsOiAke29wdGlvbnMuZmlsbFR5cGUxfWAgOiBcIlwifTtcbiAgfVxuICAudGFzay10eXBlLTIsIC5zZWN0aW9uLXR5cGUtMiAge1xuICAgICR7b3B0aW9ucy5maWxsVHlwZTAgPyBgZmlsbDogJHtvcHRpb25zLmZpbGxUeXBlMn1gIDogXCJcIn07XG4gIH1cbiAgLnRhc2stdHlwZS0zLCAuc2VjdGlvbi10eXBlLTMgIHtcbiAgICAke29wdGlvbnMuZmlsbFR5cGUwID8gYGZpbGw6ICR7b3B0aW9ucy5maWxsVHlwZTN9YCA6IFwiXCJ9O1xuICB9XG4gIC50YXNrLXR5cGUtNCwgLnNlY3Rpb24tdHlwZS00ICB7XG4gICAgJHtvcHRpb25zLmZpbGxUeXBlMCA/IGBmaWxsOiAke29wdGlvbnMuZmlsbFR5cGU0fWAgOiBcIlwifTtcbiAgfVxuICAudGFzay10eXBlLTUsIC5zZWN0aW9uLXR5cGUtNSAge1xuICAgICR7b3B0aW9ucy5maWxsVHlwZTAgPyBgZmlsbDogJHtvcHRpb25zLmZpbGxUeXBlNX1gIDogXCJcIn07XG4gIH1cbiAgLnRhc2stdHlwZS02LCAuc2VjdGlvbi10eXBlLTYgIHtcbiAgICAke29wdGlvbnMuZmlsbFR5cGUwID8gYGZpbGw6ICR7b3B0aW9ucy5maWxsVHlwZTZ9YCA6IFwiXCJ9O1xuICB9XG4gIC50YXNrLXR5cGUtNywgLnNlY3Rpb24tdHlwZS03ICB7XG4gICAgJHtvcHRpb25zLmZpbGxUeXBlMCA/IGBmaWxsOiAke29wdGlvbnMuZmlsbFR5cGU3fWAgOiBcIlwifTtcbiAgfVxuXG4gIC5hY3Rvci0wIHtcbiAgICAke29wdGlvbnMuYWN0b3IwID8gYGZpbGw6ICR7b3B0aW9ucy5hY3RvcjB9YCA6IFwiXCJ9O1xuICB9XG4gIC5hY3Rvci0xIHtcbiAgICAke29wdGlvbnMuYWN0b3IxID8gYGZpbGw6ICR7b3B0aW9ucy5hY3RvcjF9YCA6IFwiXCJ9O1xuICB9XG4gIC5hY3Rvci0yIHtcbiAgICAke29wdGlvbnMuYWN0b3IyID8gYGZpbGw6ICR7b3B0aW9ucy5hY3RvcjJ9YCA6IFwiXCJ9O1xuICB9XG4gIC5hY3Rvci0zIHtcbiAgICAke29wdGlvbnMuYWN0b3IzID8gYGZpbGw6ICR7b3B0aW9ucy5hY3RvcjN9YCA6IFwiXCJ9O1xuICB9XG4gIC5hY3Rvci00IHtcbiAgICAke29wdGlvbnMuYWN0b3I0ID8gYGZpbGw6ICR7b3B0aW9ucy5hY3RvcjR9YCA6IFwiXCJ9O1xuICB9XG4gIC5hY3Rvci01IHtcbiAgICAke29wdGlvbnMuYWN0b3I1ID8gYGZpbGw6ICR7b3B0aW9ucy5hY3RvcjV9YCA6IFwiXCJ9O1xuICB9XG4gICR7Z2V0SWNvblN0eWxlcygpfVxuYCwgXCJnZXRTdHlsZXNcIik7XG52YXIgc3R5bGVzX2RlZmF1bHQgPSBnZXRTdHlsZXM7XG5cbi8vIHNyYy9kaWFncmFtcy91c2VyLWpvdXJuZXkvam91cm5leVJlbmRlcmVyLnRzXG5pbXBvcnQgeyBzZWxlY3QgfSBmcm9tIFwiZDNcIjtcblxuLy8gc3JjL2RpYWdyYW1zL3VzZXItam91cm5leS9zdmdEcmF3LmpzXG5pbXBvcnQgeyBhcmMgYXMgZDNhcmMgfSBmcm9tIFwiZDNcIjtcbnZhciBkcmF3UmVjdDIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIHJlY3REYXRhKSB7XG4gIHJldHVybiBkcmF3UmVjdChlbGVtLCByZWN0RGF0YSk7XG59LCBcImRyYXdSZWN0XCIpO1xudmFyIGRyYXdGYWNlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihlbGVtZW50LCBmYWNlRGF0YSkge1xuICBjb25zdCByYWRpdXMgPSAxNTtcbiAgY29uc3QgY2lyY2xlRWxlbWVudCA9IGVsZW1lbnQuYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJjeFwiLCBmYWNlRGF0YS5jeCkuYXR0cihcImN5XCIsIGZhY2VEYXRhLmN5KS5hdHRyKFwiY2xhc3NcIiwgXCJmYWNlXCIpLmF0dHIoXCJyXCIsIHJhZGl1cykuYXR0cihcInN0cm9rZS13aWR0aFwiLCAyKS5hdHRyKFwib3ZlcmZsb3dcIiwgXCJ2aXNpYmxlXCIpO1xuICBjb25zdCBmYWNlID0gZWxlbWVudC5hcHBlbmQoXCJnXCIpO1xuICBmYWNlLmFwcGVuZChcImNpcmNsZVwiKS5hdHRyKFwiY3hcIiwgZmFjZURhdGEuY3ggLSByYWRpdXMgLyAzKS5hdHRyKFwiY3lcIiwgZmFjZURhdGEuY3kgLSByYWRpdXMgLyAzKS5hdHRyKFwiclwiLCAxLjUpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMikuYXR0cihcImZpbGxcIiwgXCIjNjY2XCIpLmF0dHIoXCJzdHJva2VcIiwgXCIjNjY2XCIpO1xuICBmYWNlLmFwcGVuZChcImNpcmNsZVwiKS5hdHRyKFwiY3hcIiwgZmFjZURhdGEuY3ggKyByYWRpdXMgLyAzKS5hdHRyKFwiY3lcIiwgZmFjZURhdGEuY3kgLSByYWRpdXMgLyAzKS5hdHRyKFwiclwiLCAxLjUpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgMikuYXR0cihcImZpbGxcIiwgXCIjNjY2XCIpLmF0dHIoXCJzdHJva2VcIiwgXCIjNjY2XCIpO1xuICBmdW5jdGlvbiBzbWlsZShmYWNlMikge1xuICAgIGNvbnN0IGFyYyA9IGQzYXJjKCkuc3RhcnRBbmdsZShNYXRoLlBJIC8gMikuZW5kQW5nbGUoMyAqIChNYXRoLlBJIC8gMikpLmlubmVyUmFkaXVzKHJhZGl1cyAvIDIpLm91dGVyUmFkaXVzKHJhZGl1cyAvIDIuMik7XG4gICAgZmFjZTIuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtb3V0aFwiKS5hdHRyKFwiZFwiLCBhcmMpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBmYWNlRGF0YS5jeCArIFwiLFwiICsgKGZhY2VEYXRhLmN5ICsgMikgKyBcIilcIik7XG4gIH1cbiAgX19uYW1lKHNtaWxlLCBcInNtaWxlXCIpO1xuICBmdW5jdGlvbiBzYWQoZmFjZTIpIHtcbiAgICBjb25zdCBhcmMgPSBkM2FyYygpLnN0YXJ0QW5nbGUoMyAqIE1hdGguUEkgLyAyKS5lbmRBbmdsZSg1ICogKE1hdGguUEkgLyAyKSkuaW5uZXJSYWRpdXMocmFkaXVzIC8gMikub3V0ZXJSYWRpdXMocmFkaXVzIC8gMi4yKTtcbiAgICBmYWNlMi5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1vdXRoXCIpLmF0dHIoXCJkXCIsIGFyYykuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIGZhY2VEYXRhLmN4ICsgXCIsXCIgKyAoZmFjZURhdGEuY3kgKyA3KSArIFwiKVwiKTtcbiAgfVxuICBfX25hbWUoc2FkLCBcInNhZFwiKTtcbiAgZnVuY3Rpb24gYW1iaXZhbGVudChmYWNlMikge1xuICAgIGZhY2UyLmFwcGVuZChcImxpbmVcIikuYXR0cihcImNsYXNzXCIsIFwibW91dGhcIikuYXR0cihcInN0cm9rZVwiLCAyKS5hdHRyKFwieDFcIiwgZmFjZURhdGEuY3ggLSA1KS5hdHRyKFwieTFcIiwgZmFjZURhdGEuY3kgKyA3KS5hdHRyKFwieDJcIiwgZmFjZURhdGEuY3ggKyA1KS5hdHRyKFwieTJcIiwgZmFjZURhdGEuY3kgKyA3KS5hdHRyKFwiY2xhc3NcIiwgXCJtb3V0aFwiKS5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIFwiMXB4XCIpLmF0dHIoXCJzdHJva2VcIiwgXCIjNjY2XCIpO1xuICB9XG4gIF9fbmFtZShhbWJpdmFsZW50LCBcImFtYml2YWxlbnRcIik7XG4gIGlmIChmYWNlRGF0YS5zY29yZSA+IDMpIHtcbiAgICBzbWlsZShmYWNlKTtcbiAgfSBlbHNlIGlmIChmYWNlRGF0YS5zY29yZSA8IDMpIHtcbiAgICBzYWQoZmFjZSk7XG4gIH0gZWxzZSB7XG4gICAgYW1iaXZhbGVudChmYWNlKTtcbiAgfVxuICByZXR1cm4gY2lyY2xlRWxlbWVudDtcbn0sIFwiZHJhd0ZhY2VcIik7XG52YXIgZHJhd0NpcmNsZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbWVudCwgY2lyY2xlRGF0YSkge1xuICBjb25zdCBjaXJjbGVFbGVtZW50ID0gZWxlbWVudC5hcHBlbmQoXCJjaXJjbGVcIik7XG4gIGNpcmNsZUVsZW1lbnQuYXR0cihcImN4XCIsIGNpcmNsZURhdGEuY3gpO1xuICBjaXJjbGVFbGVtZW50LmF0dHIoXCJjeVwiLCBjaXJjbGVEYXRhLmN5KTtcbiAgY2lyY2xlRWxlbWVudC5hdHRyKFwiY2xhc3NcIiwgXCJhY3Rvci1cIiArIGNpcmNsZURhdGEucG9zKTtcbiAgY2lyY2xlRWxlbWVudC5hdHRyKFwiZmlsbFwiLCBjaXJjbGVEYXRhLmZpbGwpO1xuICBjaXJjbGVFbGVtZW50LmF0dHIoXCJzdHJva2VcIiwgY2lyY2xlRGF0YS5zdHJva2UpO1xuICBjaXJjbGVFbGVtZW50LmF0dHIoXCJyXCIsIGNpcmNsZURhdGEucik7XG4gIGlmIChjaXJjbGVFbGVtZW50LmNsYXNzICE9PSB2b2lkIDApIHtcbiAgICBjaXJjbGVFbGVtZW50LmF0dHIoXCJjbGFzc1wiLCBjaXJjbGVFbGVtZW50LmNsYXNzKTtcbiAgfVxuICBpZiAoY2lyY2xlRGF0YS50aXRsZSAhPT0gdm9pZCAwKSB7XG4gICAgY2lyY2xlRWxlbWVudC5hcHBlbmQoXCJ0aXRsZVwiKS50ZXh0KGNpcmNsZURhdGEudGl0bGUpO1xuICB9XG4gIHJldHVybiBjaXJjbGVFbGVtZW50O1xufSwgXCJkcmF3Q2lyY2xlXCIpO1xudmFyIGRyYXdUZXh0MiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbSwgdGV4dERhdGEpIHtcbiAgcmV0dXJuIGRyYXdUZXh0KGVsZW0sIHRleHREYXRhKTtcbn0sIFwiZHJhd1RleHRcIik7XG52YXIgZHJhd0xhYmVsID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihlbGVtLCB0eHRPYmplY3QpIHtcbiAgZnVuY3Rpb24gZ2VuUG9pbnRzKHgsIHksIHdpZHRoLCBoZWlnaHQsIGN1dCkge1xuICAgIHJldHVybiB4ICsgXCIsXCIgKyB5ICsgXCIgXCIgKyAoeCArIHdpZHRoKSArIFwiLFwiICsgeSArIFwiIFwiICsgKHggKyB3aWR0aCkgKyBcIixcIiArICh5ICsgaGVpZ2h0IC0gY3V0KSArIFwiIFwiICsgKHggKyB3aWR0aCAtIGN1dCAqIDEuMikgKyBcIixcIiArICh5ICsgaGVpZ2h0KSArIFwiIFwiICsgeCArIFwiLFwiICsgKHkgKyBoZWlnaHQpO1xuICB9XG4gIF9fbmFtZShnZW5Qb2ludHMsIFwiZ2VuUG9pbnRzXCIpO1xuICBjb25zdCBwb2x5Z29uID0gZWxlbS5hcHBlbmQoXCJwb2x5Z29uXCIpO1xuICBwb2x5Z29uLmF0dHIoXCJwb2ludHNcIiwgZ2VuUG9pbnRzKHR4dE9iamVjdC54LCB0eHRPYmplY3QueSwgNTAsIDIwLCA3KSk7XG4gIHBvbHlnb24uYXR0cihcImNsYXNzXCIsIFwibGFiZWxCb3hcIik7XG4gIHR4dE9iamVjdC55ID0gdHh0T2JqZWN0LnkgKyB0eHRPYmplY3QubGFiZWxNYXJnaW47XG4gIHR4dE9iamVjdC54ID0gdHh0T2JqZWN0LnggKyAwLjUgKiB0eHRPYmplY3QubGFiZWxNYXJnaW47XG4gIGRyYXdUZXh0MihlbGVtLCB0eHRPYmplY3QpO1xufSwgXCJkcmF3TGFiZWxcIik7XG52YXIgZHJhd1NlY3Rpb24gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIHNlY3Rpb24sIGNvbmYyKSB7XG4gIGNvbnN0IGcgPSBlbGVtLmFwcGVuZChcImdcIik7XG4gIGNvbnN0IHJlY3QgPSBnZXROb3RlUmVjdCgpO1xuICByZWN0LnggPSBzZWN0aW9uLng7XG4gIHJlY3QueSA9IHNlY3Rpb24ueTtcbiAgcmVjdC5maWxsID0gc2VjdGlvbi5maWxsO1xuICByZWN0LndpZHRoID0gY29uZjIud2lkdGggKiBzZWN0aW9uLnRhc2tDb3VudCArIC8vIHdpZHRoIG9mIHRoZSB0YXNrc1xuICBjb25mMi5kaWFncmFtTWFyZ2luWCAqIChzZWN0aW9uLnRhc2tDb3VudCAtIDEpO1xuICByZWN0LmhlaWdodCA9IGNvbmYyLmhlaWdodDtcbiAgcmVjdC5jbGFzcyA9IFwiam91cm5leS1zZWN0aW9uIHNlY3Rpb24tdHlwZS1cIiArIHNlY3Rpb24ubnVtO1xuICByZWN0LnJ4ID0gMztcbiAgcmVjdC5yeSA9IDM7XG4gIGRyYXdSZWN0MihnLCByZWN0KTtcbiAgX2RyYXdUZXh0Q2FuZGlkYXRlRnVuYyhjb25mMikoXG4gICAgc2VjdGlvbi50ZXh0LFxuICAgIGcsXG4gICAgcmVjdC54LFxuICAgIHJlY3QueSxcbiAgICByZWN0LndpZHRoLFxuICAgIHJlY3QuaGVpZ2h0LFxuICAgIHsgY2xhc3M6IFwiam91cm5leS1zZWN0aW9uIHNlY3Rpb24tdHlwZS1cIiArIHNlY3Rpb24ubnVtIH0sXG4gICAgY29uZjIsXG4gICAgc2VjdGlvbi5jb2xvdXJcbiAgKTtcbn0sIFwiZHJhd1NlY3Rpb25cIik7XG52YXIgdGFza0NvdW50ID0gLTE7XG52YXIgZHJhd1Rhc2sgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGVsZW0sIHRhc2ssIGNvbmYyLCBkaWFncmFtSWQpIHtcbiAgY29uc3QgY2VudGVyID0gdGFzay54ICsgY29uZjIud2lkdGggLyAyO1xuICBjb25zdCBnID0gZWxlbS5hcHBlbmQoXCJnXCIpO1xuICB0YXNrQ291bnQrKztcbiAgY29uc3QgbWF4SGVpZ2h0ID0gMzAwICsgNSAqIDMwO1xuICBnLmFwcGVuZChcImxpbmVcIikuYXR0cihcImlkXCIsIGRpYWdyYW1JZCArIFwiLXRhc2tcIiArIHRhc2tDb3VudCkuYXR0cihcIngxXCIsIGNlbnRlcikuYXR0cihcInkxXCIsIHRhc2sueSkuYXR0cihcIngyXCIsIGNlbnRlcikuYXR0cihcInkyXCIsIG1heEhlaWdodCkuYXR0cihcImNsYXNzXCIsIFwidGFzay1saW5lXCIpLmF0dHIoXCJzdHJva2Utd2lkdGhcIiwgXCIxcHhcIikuYXR0cihcInN0cm9rZS1kYXNoYXJyYXlcIiwgXCI0IDJcIikuYXR0cihcInN0cm9rZVwiLCBcIiM2NjZcIik7XG4gIGRyYXdGYWNlKGcsIHtcbiAgICBjeDogY2VudGVyLFxuICAgIGN5OiAzMDAgKyAoNSAtIHRhc2suc2NvcmUpICogMzAsXG4gICAgc2NvcmU6IHRhc2suc2NvcmVcbiAgfSk7XG4gIGNvbnN0IHJlY3QgPSBnZXROb3RlUmVjdCgpO1xuICByZWN0LnggPSB0YXNrLng7XG4gIHJlY3QueSA9IHRhc2sueTtcbiAgcmVjdC5maWxsID0gdGFzay5maWxsO1xuICByZWN0LndpZHRoID0gY29uZjIud2lkdGg7XG4gIHJlY3QuaGVpZ2h0ID0gY29uZjIuaGVpZ2h0O1xuICByZWN0LmNsYXNzID0gXCJ0YXNrIHRhc2stdHlwZS1cIiArIHRhc2subnVtO1xuICByZWN0LnJ4ID0gMztcbiAgcmVjdC5yeSA9IDM7XG4gIGRyYXdSZWN0MihnLCByZWN0KTtcbiAgbGV0IHhQb3MgPSB0YXNrLnggKyAxNDtcbiAgdGFzay5wZW9wbGUuZm9yRWFjaCgocGVyc29uKSA9PiB7XG4gICAgY29uc3QgY29sb3VyID0gdGFzay5hY3RvcnNbcGVyc29uXS5jb2xvcjtcbiAgICBjb25zdCBjaXJjbGUgPSB7XG4gICAgICBjeDogeFBvcyxcbiAgICAgIGN5OiB0YXNrLnksXG4gICAgICByOiA3LFxuICAgICAgZmlsbDogY29sb3VyLFxuICAgICAgc3Ryb2tlOiBcIiMwMDBcIixcbiAgICAgIHRpdGxlOiBwZXJzb24sXG4gICAgICBwb3M6IHRhc2suYWN0b3JzW3BlcnNvbl0ucG9zaXRpb25cbiAgICB9O1xuICAgIGRyYXdDaXJjbGUoZywgY2lyY2xlKTtcbiAgICB4UG9zICs9IDEwO1xuICB9KTtcbiAgX2RyYXdUZXh0Q2FuZGlkYXRlRnVuYyhjb25mMikoXG4gICAgdGFzay50YXNrLFxuICAgIGcsXG4gICAgcmVjdC54LFxuICAgIHJlY3QueSxcbiAgICByZWN0LndpZHRoLFxuICAgIHJlY3QuaGVpZ2h0LFxuICAgIHsgY2xhc3M6IFwidGFza1wiIH0sXG4gICAgY29uZjIsXG4gICAgdGFzay5jb2xvdXJcbiAgKTtcbn0sIFwiZHJhd1Rhc2tcIik7XG52YXIgZHJhd0JhY2tncm91bmRSZWN0MiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oZWxlbSwgYm91bmRzMikge1xuICBkcmF3QmFja2dyb3VuZFJlY3QoZWxlbSwgYm91bmRzMik7XG59LCBcImRyYXdCYWNrZ3JvdW5kUmVjdFwiKTtcbnZhciBfZHJhd1RleHRDYW5kaWRhdGVGdW5jID0gLyogQF9fUFVSRV9fICovIChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gYnlUZXh0KGNvbnRlbnQsIGcsIHgsIHksIHdpZHRoLCBoZWlnaHQsIHRleHRBdHRycywgY29sb3VyKSB7XG4gICAgY29uc3QgdGV4dCA9IGcuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwieFwiLCB4ICsgd2lkdGggLyAyKS5hdHRyKFwieVwiLCB5ICsgaGVpZ2h0IC8gMiArIDUpLnN0eWxlKFwiZm9udC1jb2xvclwiLCBjb2xvdXIpLnN0eWxlKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIikudGV4dChjb250ZW50KTtcbiAgICBfc2V0VGV4dEF0dHJzKHRleHQsIHRleHRBdHRycyk7XG4gIH1cbiAgX19uYW1lKGJ5VGV4dCwgXCJieVRleHRcIik7XG4gIGZ1bmN0aW9uIGJ5VHNwYW4oY29udGVudCwgZywgeCwgeSwgd2lkdGgsIGhlaWdodCwgdGV4dEF0dHJzLCBjb25mMiwgY29sb3VyKSB7XG4gICAgY29uc3QgeyB0YXNrRm9udFNpemUsIHRhc2tGb250RmFtaWx5IH0gPSBjb25mMjtcbiAgICBjb25zdCBsaW5lcyA9IGNvbnRlbnQuc3BsaXQoLzxiclxccypcXC8/Pi9naSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZHkgPSBpICogdGFza0ZvbnRTaXplIC0gdGFza0ZvbnRTaXplICogKGxpbmVzLmxlbmd0aCAtIDEpIC8gMjtcbiAgICAgIGNvbnN0IHRleHQgPSBnLmFwcGVuZChcInRleHRcIikuYXR0cihcInhcIiwgeCArIHdpZHRoIC8gMikuYXR0cihcInlcIiwgeSkuYXR0cihcImZpbGxcIiwgY29sb3VyKS5zdHlsZShcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpLnN0eWxlKFwiZm9udC1zaXplXCIsIHRhc2tGb250U2l6ZSkuc3R5bGUoXCJmb250LWZhbWlseVwiLCB0YXNrRm9udEZhbWlseSk7XG4gICAgICB0ZXh0LmFwcGVuZChcInRzcGFuXCIpLmF0dHIoXCJ4XCIsIHggKyB3aWR0aCAvIDIpLmF0dHIoXCJkeVwiLCBkeSkudGV4dChsaW5lc1tpXSk7XG4gICAgICB0ZXh0LmF0dHIoXCJ5XCIsIHkgKyBoZWlnaHQgLyAyKS5hdHRyKFwiZG9taW5hbnQtYmFzZWxpbmVcIiwgXCJjZW50cmFsXCIpLmF0dHIoXCJhbGlnbm1lbnQtYmFzZWxpbmVcIiwgXCJjZW50cmFsXCIpO1xuICAgICAgX3NldFRleHRBdHRycyh0ZXh0LCB0ZXh0QXR0cnMpO1xuICAgIH1cbiAgfVxuICBfX25hbWUoYnlUc3BhbiwgXCJieVRzcGFuXCIpO1xuICBmdW5jdGlvbiBieUZvKGNvbnRlbnQsIGcsIHgsIHksIHdpZHRoLCBoZWlnaHQsIHRleHRBdHRycywgY29uZjIpIHtcbiAgICBjb25zdCBib2R5ID0gZy5hcHBlbmQoXCJzd2l0Y2hcIik7XG4gICAgY29uc3QgZiA9IGJvZHkuYXBwZW5kKFwiZm9yZWlnbk9iamVjdFwiKS5hdHRyKFwieFwiLCB4KS5hdHRyKFwieVwiLCB5KS5hdHRyKFwid2lkdGhcIiwgd2lkdGgpLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KS5hdHRyKFwicG9zaXRpb25cIiwgXCJmaXhlZFwiKTtcbiAgICBjb25zdCB0ZXh0ID0gZi5hcHBlbmQoXCJ4aHRtbDpkaXZcIikuc3R5bGUoXCJkaXNwbGF5XCIsIFwidGFibGVcIikuc3R5bGUoXCJoZWlnaHRcIiwgXCIxMDAlXCIpLnN0eWxlKFwid2lkdGhcIiwgXCIxMDAlXCIpO1xuICAgIHRleHQuYXBwZW5kKFwiZGl2XCIpLmF0dHIoXCJjbGFzc1wiLCBcImxhYmVsXCIpLnN0eWxlKFwiZGlzcGxheVwiLCBcInRhYmxlLWNlbGxcIikuc3R5bGUoXCJ0ZXh0LWFsaWduXCIsIFwiY2VudGVyXCIpLnN0eWxlKFwidmVydGljYWwtYWxpZ25cIiwgXCJtaWRkbGVcIikudGV4dChjb250ZW50KTtcbiAgICBieVRzcGFuKGNvbnRlbnQsIGJvZHksIHgsIHksIHdpZHRoLCBoZWlnaHQsIHRleHRBdHRycywgY29uZjIpO1xuICAgIF9zZXRUZXh0QXR0cnModGV4dCwgdGV4dEF0dHJzKTtcbiAgfVxuICBfX25hbWUoYnlGbywgXCJieUZvXCIpO1xuICBmdW5jdGlvbiBfc2V0VGV4dEF0dHJzKHRvVGV4dCwgZnJvbVRleHRBdHRyc0RpY3QpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBmcm9tVGV4dEF0dHJzRGljdCkge1xuICAgICAgaWYgKGtleSBpbiBmcm9tVGV4dEF0dHJzRGljdCkge1xuICAgICAgICB0b1RleHQuYXR0cihrZXksIGZyb21UZXh0QXR0cnNEaWN0W2tleV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBfX25hbWUoX3NldFRleHRBdHRycywgXCJfc2V0VGV4dEF0dHJzXCIpO1xuICByZXR1cm4gZnVuY3Rpb24oY29uZjIpIHtcbiAgICByZXR1cm4gY29uZjIudGV4dFBsYWNlbWVudCA9PT0gXCJmb1wiID8gYnlGbyA6IGNvbmYyLnRleHRQbGFjZW1lbnQgPT09IFwib2xkXCIgPyBieVRleHQgOiBieVRzcGFuO1xuICB9O1xufSkoKTtcbnZhciBpbml0R3JhcGhpY3MgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGdyYXBoaWNzLCBpZCkge1xuICB0YXNrQ291bnQgPSAtMTtcbiAgZ3JhcGhpY3MuYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCItYXJyb3doZWFkXCIpLmF0dHIoXCJyZWZYXCIsIDUpLmF0dHIoXCJyZWZZXCIsIDIpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCA2KS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDQpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNIDAsMCBWIDQgTDYsMiBaXCIpO1xufSwgXCJpbml0R3JhcGhpY3NcIik7XG52YXIgc3ZnRHJhd19kZWZhdWx0ID0ge1xuICBkcmF3UmVjdDogZHJhd1JlY3QyLFxuICBkcmF3Q2lyY2xlLFxuICBkcmF3U2VjdGlvbixcbiAgZHJhd1RleHQ6IGRyYXdUZXh0MixcbiAgZHJhd0xhYmVsLFxuICBkcmF3VGFzayxcbiAgZHJhd0JhY2tncm91bmRSZWN0OiBkcmF3QmFja2dyb3VuZFJlY3QyLFxuICBpbml0R3JhcGhpY3Ncbn07XG5cbi8vIHNyYy9kaWFncmFtcy91c2VyLWpvdXJuZXkvam91cm5leVJlbmRlcmVyLnRzXG52YXIgc2V0Q29uZiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oY25mKSB7XG4gIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhjbmYpO1xuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgY29uZltrZXldID0gY25mW2tleV07XG4gIH0pO1xufSwgXCJzZXRDb25mXCIpO1xudmFyIGFjdG9ycyA9IHt9O1xudmFyIG1heFdpZHRoID0gMDtcbmZ1bmN0aW9uIGRyYXdBY3RvckxlZ2VuZChkaWFncmFtMikge1xuICBjb25zdCBjb25mMiA9IGdldENvbmZpZygpLmpvdXJuZXk7XG4gIGNvbnN0IG1heExhYmVsV2lkdGggPSBjb25mMi5tYXhMYWJlbFdpZHRoO1xuICBtYXhXaWR0aCA9IDA7XG4gIGxldCB5UG9zID0gNjA7XG4gIE9iamVjdC5rZXlzKGFjdG9ycykuZm9yRWFjaCgocGVyc29uKSA9PiB7XG4gICAgY29uc3QgY29sb3VyID0gYWN0b3JzW3BlcnNvbl0uY29sb3I7XG4gICAgY29uc3QgY2lyY2xlRGF0YSA9IHtcbiAgICAgIGN4OiAyMCxcbiAgICAgIGN5OiB5UG9zLFxuICAgICAgcjogNyxcbiAgICAgIGZpbGw6IGNvbG91cixcbiAgICAgIHN0cm9rZTogXCIjMDAwXCIsXG4gICAgICBwb3M6IGFjdG9yc1twZXJzb25dLnBvc2l0aW9uXG4gICAgfTtcbiAgICBzdmdEcmF3X2RlZmF1bHQuZHJhd0NpcmNsZShkaWFncmFtMiwgY2lyY2xlRGF0YSk7XG4gICAgbGV0IG1lYXN1cmVUZXh0ID0gZGlhZ3JhbTIuYXBwZW5kKFwidGV4dFwiKS5hdHRyKFwidmlzaWJpbGl0eVwiLCBcImhpZGRlblwiKS50ZXh0KHBlcnNvbik7XG4gICAgY29uc3QgZnVsbFRleHRXaWR0aCA9IG1lYXN1cmVUZXh0Lm5vZGUoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgICBtZWFzdXJlVGV4dC5yZW1vdmUoKTtcbiAgICBsZXQgbGluZXMgPSBbXTtcbiAgICBpZiAoZnVsbFRleHRXaWR0aCA8PSBtYXhMYWJlbFdpZHRoKSB7XG4gICAgICBsaW5lcyA9IFtwZXJzb25dO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB3b3JkcyA9IHBlcnNvbi5zcGxpdChcIiBcIik7XG4gICAgICBsZXQgY3VycmVudExpbmUgPSBcIlwiO1xuICAgICAgbWVhc3VyZVRleHQgPSBkaWFncmFtMi5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJ2aXNpYmlsaXR5XCIsIFwiaGlkZGVuXCIpO1xuICAgICAgd29yZHMuZm9yRWFjaCgod29yZCkgPT4ge1xuICAgICAgICBjb25zdCB0ZXN0TGluZSA9IGN1cnJlbnRMaW5lID8gYCR7Y3VycmVudExpbmV9ICR7d29yZH1gIDogd29yZDtcbiAgICAgICAgbWVhc3VyZVRleHQudGV4dCh0ZXN0TGluZSk7XG4gICAgICAgIGNvbnN0IHRleHRXaWR0aCA9IG1lYXN1cmVUZXh0Lm5vZGUoKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgICAgICAgaWYgKHRleHRXaWR0aCA+IG1heExhYmVsV2lkdGgpIHtcbiAgICAgICAgICBpZiAoY3VycmVudExpbmUpIHtcbiAgICAgICAgICAgIGxpbmVzLnB1c2goY3VycmVudExpbmUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjdXJyZW50TGluZSA9IHdvcmQ7XG4gICAgICAgICAgbWVhc3VyZVRleHQudGV4dCh3b3JkKTtcbiAgICAgICAgICBpZiAobWVhc3VyZVRleHQubm9kZSgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoID4gbWF4TGFiZWxXaWR0aCkge1xuICAgICAgICAgICAgbGV0IGJyb2tlbldvcmQgPSBcIlwiO1xuICAgICAgICAgICAgZm9yIChjb25zdCBjaGFyIG9mIHdvcmQpIHtcbiAgICAgICAgICAgICAgYnJva2VuV29yZCArPSBjaGFyO1xuICAgICAgICAgICAgICBtZWFzdXJlVGV4dC50ZXh0KGJyb2tlbldvcmQgKyBcIi1cIik7XG4gICAgICAgICAgICAgIGlmIChtZWFzdXJlVGV4dC5ub2RlKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGggPiBtYXhMYWJlbFdpZHRoKSB7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChicm9rZW5Xb3JkLnNsaWNlKDAsIC0xKSArIFwiLVwiKTtcbiAgICAgICAgICAgICAgICBicm9rZW5Xb3JkID0gY2hhcjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3VycmVudExpbmUgPSBicm9rZW5Xb3JkO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjdXJyZW50TGluZSA9IHRlc3RMaW5lO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmIChjdXJyZW50TGluZSkge1xuICAgICAgICBsaW5lcy5wdXNoKGN1cnJlbnRMaW5lKTtcbiAgICAgIH1cbiAgICAgIG1lYXN1cmVUZXh0LnJlbW92ZSgpO1xuICAgIH1cbiAgICBsaW5lcy5mb3JFYWNoKChsaW5lLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgbGFiZWxEYXRhID0ge1xuICAgICAgICB4OiA0MCxcbiAgICAgICAgeTogeVBvcyArIDcgKyBpbmRleCAqIDIwLFxuICAgICAgICBmaWxsOiBcIiM2NjZcIixcbiAgICAgICAgdGV4dDogbGluZSxcbiAgICAgICAgdGV4dE1hcmdpbjogY29uZjIuYm94VGV4dE1hcmdpbiA/PyA1XG4gICAgICB9O1xuICAgICAgY29uc3QgdGV4dEVsZW1lbnQgPSBzdmdEcmF3X2RlZmF1bHQuZHJhd1RleHQoZGlhZ3JhbTIsIGxhYmVsRGF0YSk7XG4gICAgICBjb25zdCBsaW5lV2lkdGggPSB0ZXh0RWxlbWVudC5ub2RlKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICBpZiAobGluZVdpZHRoID4gbWF4V2lkdGggJiYgbGluZVdpZHRoID4gY29uZjIubGVmdE1hcmdpbiAtIGxpbmVXaWR0aCkge1xuICAgICAgICBtYXhXaWR0aCA9IGxpbmVXaWR0aDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB5UG9zICs9IE1hdGgubWF4KDIwLCBsaW5lcy5sZW5ndGggKiAyMCk7XG4gIH0pO1xufVxuX19uYW1lKGRyYXdBY3RvckxlZ2VuZCwgXCJkcmF3QWN0b3JMZWdlbmRcIik7XG52YXIgY29uZiA9IGdldENvbmZpZygpLmpvdXJuZXk7XG52YXIgbGVmdE1hcmdpbiA9IDA7XG52YXIgZHJhdyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24odGV4dCwgaWQsIHZlcnNpb24sIGRpYWdPYmopIHtcbiAgY29uc3QgY29uZmlnT2JqZWN0ID0gZ2V0Q29uZmlnKCk7XG4gIGNvbnN0IHRpdGxlQ29sb3IgPSBjb25maWdPYmplY3Quam91cm5leS50aXRsZUNvbG9yO1xuICBjb25zdCB0aXRsZUZvbnRTaXplID0gY29uZmlnT2JqZWN0LmpvdXJuZXkudGl0bGVGb250U2l6ZTtcbiAgY29uc3QgdGl0bGVGb250RmFtaWx5ID0gY29uZmlnT2JqZWN0LmpvdXJuZXkudGl0bGVGb250RmFtaWx5O1xuICBjb25zdCBzZWN1cml0eUxldmVsID0gY29uZmlnT2JqZWN0LnNlY3VyaXR5TGV2ZWw7XG4gIGxldCBzYW5kYm94RWxlbWVudDtcbiAgaWYgKHNlY3VyaXR5TGV2ZWwgPT09IFwic2FuZGJveFwiKSB7XG4gICAgc2FuZGJveEVsZW1lbnQgPSBzZWxlY3QoXCIjaVwiICsgaWQpO1xuICB9XG4gIGNvbnN0IHJvb3QgPSBzZWN1cml0eUxldmVsID09PSBcInNhbmRib3hcIiA/IHNlbGVjdChzYW5kYm94RWxlbWVudC5ub2RlcygpWzBdLmNvbnRlbnREb2N1bWVudC5ib2R5KSA6IHNlbGVjdChcImJvZHlcIik7XG4gIGJvdW5kcy5pbml0KCk7XG4gIGNvbnN0IGRpYWdyYW0yID0gcm9vdC5zZWxlY3QoXCIjXCIgKyBpZCk7XG4gIHN2Z0RyYXdfZGVmYXVsdC5pbml0R3JhcGhpY3MoZGlhZ3JhbTIsIGlkKTtcbiAgY29uc3QgdGFza3MyID0gZGlhZ09iai5kYi5nZXRUYXNrcygpO1xuICBjb25zdCB0aXRsZSA9IGRpYWdPYmouZGIuZ2V0RGlhZ3JhbVRpdGxlKCk7XG4gIGNvbnN0IGFjdG9yTmFtZXMgPSBkaWFnT2JqLmRiLmdldEFjdG9ycygpO1xuICBmb3IgKGNvbnN0IG1lbWJlciBpbiBhY3RvcnMpIHtcbiAgICBkZWxldGUgYWN0b3JzW21lbWJlcl07XG4gIH1cbiAgbGV0IGFjdG9yUG9zID0gMDtcbiAgYWN0b3JOYW1lcy5mb3JFYWNoKChhY3Rvck5hbWUpID0+IHtcbiAgICBhY3RvcnNbYWN0b3JOYW1lXSA9IHtcbiAgICAgIGNvbG9yOiBjb25mLmFjdG9yQ29sb3Vyc1thY3RvclBvcyAlIGNvbmYuYWN0b3JDb2xvdXJzLmxlbmd0aF0sXG4gICAgICBwb3NpdGlvbjogYWN0b3JQb3NcbiAgICB9O1xuICAgIGFjdG9yUG9zKys7XG4gIH0pO1xuICBkcmF3QWN0b3JMZWdlbmQoZGlhZ3JhbTIpO1xuICBsZWZ0TWFyZ2luID0gY29uZi5sZWZ0TWFyZ2luICsgbWF4V2lkdGg7XG4gIGJvdW5kcy5pbnNlcnQoMCwgMCwgbGVmdE1hcmdpbiwgT2JqZWN0LmtleXMoYWN0b3JzKS5sZW5ndGggKiA1MCk7XG4gIGRyYXdUYXNrcyhkaWFncmFtMiwgdGFza3MyLCAwLCBpZCk7XG4gIGNvbnN0IGJveCA9IGJvdW5kcy5nZXRCb3VuZHMoKTtcbiAgaWYgKHRpdGxlKSB7XG4gICAgZGlhZ3JhbTIuYXBwZW5kKFwidGV4dFwiKS50ZXh0KHRpdGxlKS5hdHRyKFwieFwiLCBsZWZ0TWFyZ2luKS5hdHRyKFwiZm9udC1zaXplXCIsIHRpdGxlRm9udFNpemUpLmF0dHIoXCJmb250LXdlaWdodFwiLCBcImJvbGRcIikuYXR0cihcInlcIiwgMjUpLmF0dHIoXCJmaWxsXCIsIHRpdGxlQ29sb3IpLmF0dHIoXCJmb250LWZhbWlseVwiLCB0aXRsZUZvbnRGYW1pbHkpO1xuICB9XG4gIGNvbnN0IGhlaWdodCA9IGJveC5zdG9weSAtIGJveC5zdGFydHkgKyAyICogY29uZi5kaWFncmFtTWFyZ2luWTtcbiAgY29uc3Qgd2lkdGggPSBsZWZ0TWFyZ2luICsgYm94LnN0b3B4ICsgMiAqIGNvbmYuZGlhZ3JhbU1hcmdpblg7XG4gIGNvbmZpZ3VyZVN2Z1NpemUoZGlhZ3JhbTIsIGhlaWdodCwgd2lkdGgsIGNvbmYudXNlTWF4V2lkdGgpO1xuICBkaWFncmFtMi5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJ4MVwiLCBsZWZ0TWFyZ2luKS5hdHRyKFwieTFcIiwgY29uZi5oZWlnaHQgKiA0KS5hdHRyKFwieDJcIiwgd2lkdGggLSBsZWZ0TWFyZ2luIC0gNCkuYXR0cihcInkyXCIsIGNvbmYuaGVpZ2h0ICogNCkuYXR0cihcInN0cm9rZS13aWR0aFwiLCA0KS5hdHRyKFwic3Ryb2tlXCIsIFwiYmxhY2tcIikuYXR0cihcIm1hcmtlci1lbmRcIiwgXCJ1cmwoI1wiICsgaWQgKyBcIi1hcnJvd2hlYWQpXCIpO1xuICBjb25zdCBleHRyYVZlcnRGb3JUaXRsZSA9IHRpdGxlID8gNzAgOiAwO1xuICBkaWFncmFtMi5hdHRyKFwidmlld0JveFwiLCBgJHtib3guc3RhcnR4fSAtMjUgJHt3aWR0aH0gJHtoZWlnaHQgKyBleHRyYVZlcnRGb3JUaXRsZX1gKTtcbiAgZGlhZ3JhbTIuYXR0cihcInByZXNlcnZlQXNwZWN0UmF0aW9cIiwgXCJ4TWluWU1pbiBtZWV0XCIpO1xuICBkaWFncmFtMi5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCArIGV4dHJhVmVydEZvclRpdGxlICsgMjUpO1xufSwgXCJkcmF3XCIpO1xudmFyIGJvdW5kcyA9IHtcbiAgZGF0YToge1xuICAgIHN0YXJ0eDogdm9pZCAwLFxuICAgIHN0b3B4OiB2b2lkIDAsXG4gICAgc3RhcnR5OiB2b2lkIDAsXG4gICAgc3RvcHk6IHZvaWQgMFxuICB9LFxuICB2ZXJ0aWNhbFBvczogMCxcbiAgc2VxdWVuY2VJdGVtczogW10sXG4gIGluaXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXF1ZW5jZUl0ZW1zID0gW107XG4gICAgdGhpcy5kYXRhID0ge1xuICAgICAgc3RhcnR4OiB2b2lkIDAsXG4gICAgICBzdG9weDogdm9pZCAwLFxuICAgICAgc3RhcnR5OiB2b2lkIDAsXG4gICAgICBzdG9weTogdm9pZCAwXG4gICAgfTtcbiAgICB0aGlzLnZlcnRpY2FsUG9zID0gMDtcbiAgfSwgXCJpbml0XCIpLFxuICB1cGRhdGVWYWw6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24ob2JqLCBrZXksIHZhbCwgZnVuKSB7XG4gICAgaWYgKG9ialtrZXldID09PSB2b2lkIDApIHtcbiAgICAgIG9ialtrZXldID0gdmFsO1xuICAgIH0gZWxzZSB7XG4gICAgICBvYmpba2V5XSA9IGZ1bih2YWwsIG9ialtrZXldKTtcbiAgICB9XG4gIH0sIFwidXBkYXRlVmFsXCIpLFxuICB1cGRhdGVCb3VuZHM6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oc3RhcnR4LCBzdGFydHksIHN0b3B4LCBzdG9weSkge1xuICAgIGNvbnN0IGNvbmYyID0gZ2V0Q29uZmlnKCkuam91cm5leTtcbiAgICBjb25zdCBfc2VsZiA9IHRoaXM7XG4gICAgbGV0IGNudCA9IDA7XG4gICAgZnVuY3Rpb24gdXBkYXRlRm4odHlwZSkge1xuICAgICAgcmV0dXJuIC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gdXBkYXRlSXRlbUJvdW5kcyhpdGVtKSB7XG4gICAgICAgIGNudCsrO1xuICAgICAgICBjb25zdCBuID0gX3NlbGYuc2VxdWVuY2VJdGVtcy5sZW5ndGggLSBjbnQgKyAxO1xuICAgICAgICBfc2VsZi51cGRhdGVWYWwoaXRlbSwgXCJzdGFydHlcIiwgc3RhcnR5IC0gbiAqIGNvbmYyLmJveE1hcmdpbiwgTWF0aC5taW4pO1xuICAgICAgICBfc2VsZi51cGRhdGVWYWwoaXRlbSwgXCJzdG9weVwiLCBzdG9weSArIG4gKiBjb25mMi5ib3hNYXJnaW4sIE1hdGgubWF4KTtcbiAgICAgICAgX3NlbGYudXBkYXRlVmFsKGJvdW5kcy5kYXRhLCBcInN0YXJ0eFwiLCBzdGFydHggLSBuICogY29uZjIuYm94TWFyZ2luLCBNYXRoLm1pbik7XG4gICAgICAgIF9zZWxmLnVwZGF0ZVZhbChib3VuZHMuZGF0YSwgXCJzdG9weFwiLCBzdG9weCArIG4gKiBjb25mMi5ib3hNYXJnaW4sIE1hdGgubWF4KTtcbiAgICAgICAgaWYgKCEodHlwZSA9PT0gXCJhY3RpdmF0aW9uXCIpKSB7XG4gICAgICAgICAgX3NlbGYudXBkYXRlVmFsKGl0ZW0sIFwic3RhcnR4XCIsIHN0YXJ0eCAtIG4gKiBjb25mMi5ib3hNYXJnaW4sIE1hdGgubWluKTtcbiAgICAgICAgICBfc2VsZi51cGRhdGVWYWwoaXRlbSwgXCJzdG9weFwiLCBzdG9weCArIG4gKiBjb25mMi5ib3hNYXJnaW4sIE1hdGgubWF4KTtcbiAgICAgICAgICBfc2VsZi51cGRhdGVWYWwoYm91bmRzLmRhdGEsIFwic3RhcnR5XCIsIHN0YXJ0eSAtIG4gKiBjb25mMi5ib3hNYXJnaW4sIE1hdGgubWluKTtcbiAgICAgICAgICBfc2VsZi51cGRhdGVWYWwoYm91bmRzLmRhdGEsIFwic3RvcHlcIiwgc3RvcHkgKyBuICogY29uZjIuYm94TWFyZ2luLCBNYXRoLm1heCk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwidXBkYXRlSXRlbUJvdW5kc1wiKTtcbiAgICB9XG4gICAgX19uYW1lKHVwZGF0ZUZuLCBcInVwZGF0ZUZuXCIpO1xuICAgIHRoaXMuc2VxdWVuY2VJdGVtcy5mb3JFYWNoKHVwZGF0ZUZuKCkpO1xuICB9LCBcInVwZGF0ZUJvdW5kc1wiKSxcbiAgaW5zZXJ0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKHN0YXJ0eCwgc3RhcnR5LCBzdG9weCwgc3RvcHkpIHtcbiAgICBjb25zdCBfc3RhcnR4ID0gTWF0aC5taW4oc3RhcnR4LCBzdG9weCk7XG4gICAgY29uc3QgX3N0b3B4ID0gTWF0aC5tYXgoc3RhcnR4LCBzdG9weCk7XG4gICAgY29uc3QgX3N0YXJ0eSA9IE1hdGgubWluKHN0YXJ0eSwgc3RvcHkpO1xuICAgIGNvbnN0IF9zdG9weSA9IE1hdGgubWF4KHN0YXJ0eSwgc3RvcHkpO1xuICAgIHRoaXMudXBkYXRlVmFsKGJvdW5kcy5kYXRhLCBcInN0YXJ0eFwiLCBfc3RhcnR4LCBNYXRoLm1pbik7XG4gICAgdGhpcy51cGRhdGVWYWwoYm91bmRzLmRhdGEsIFwic3RhcnR5XCIsIF9zdGFydHksIE1hdGgubWluKTtcbiAgICB0aGlzLnVwZGF0ZVZhbChib3VuZHMuZGF0YSwgXCJzdG9weFwiLCBfc3RvcHgsIE1hdGgubWF4KTtcbiAgICB0aGlzLnVwZGF0ZVZhbChib3VuZHMuZGF0YSwgXCJzdG9weVwiLCBfc3RvcHksIE1hdGgubWF4KTtcbiAgICB0aGlzLnVwZGF0ZUJvdW5kcyhfc3RhcnR4LCBfc3RhcnR5LCBfc3RvcHgsIF9zdG9weSk7XG4gIH0sIFwiaW5zZXJ0XCIpLFxuICBidW1wVmVydGljYWxQb3M6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oYnVtcCkge1xuICAgIHRoaXMudmVydGljYWxQb3MgPSB0aGlzLnZlcnRpY2FsUG9zICsgYnVtcDtcbiAgICB0aGlzLmRhdGEuc3RvcHkgPSB0aGlzLnZlcnRpY2FsUG9zO1xuICB9LCBcImJ1bXBWZXJ0aWNhbFBvc1wiKSxcbiAgZ2V0VmVydGljYWxQb3M6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMudmVydGljYWxQb3M7XG4gIH0sIFwiZ2V0VmVydGljYWxQb3NcIiksXG4gIGdldEJvdW5kczogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhO1xuICB9LCBcImdldEJvdW5kc1wiKVxufTtcbnZhciBmaWxscyA9IGNvbmYuc2VjdGlvbkZpbGxzO1xudmFyIHRleHRDb2xvdXJzID0gY29uZi5zZWN0aW9uQ29sb3VycztcbnZhciBkcmF3VGFza3MgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGRpYWdyYW0yLCB0YXNrczIsIHZlcnRpY2FsUG9zLCBkaWFncmFtSWQpIHtcbiAgY29uc3QgY29uZjIgPSBnZXRDb25maWcoKS5qb3VybmV5O1xuICBsZXQgbGFzdFNlY3Rpb24gPSBcIlwiO1xuICBjb25zdCBzZWN0aW9uVkhlaWdodCA9IGNvbmYyLmhlaWdodCAqIDIgKyBjb25mMi5kaWFncmFtTWFyZ2luWTtcbiAgY29uc3QgdGFza1BvcyA9IHZlcnRpY2FsUG9zICsgc2VjdGlvblZIZWlnaHQ7XG4gIGxldCBzZWN0aW9uTnVtYmVyID0gMDtcbiAgbGV0IGZpbGwgPSBcIiNDQ0NcIjtcbiAgbGV0IGNvbG91ciA9IFwiYmxhY2tcIjtcbiAgbGV0IG51bSA9IDA7XG4gIGZvciAoY29uc3QgW2ksIHRhc2tdIG9mIHRhc2tzMi5lbnRyaWVzKCkpIHtcbiAgICBpZiAobGFzdFNlY3Rpb24gIT09IHRhc2suc2VjdGlvbikge1xuICAgICAgZmlsbCA9IGZpbGxzW3NlY3Rpb25OdW1iZXIgJSBmaWxscy5sZW5ndGhdO1xuICAgICAgbnVtID0gc2VjdGlvbk51bWJlciAlIGZpbGxzLmxlbmd0aDtcbiAgICAgIGNvbG91ciA9IHRleHRDb2xvdXJzW3NlY3Rpb25OdW1iZXIgJSB0ZXh0Q29sb3Vycy5sZW5ndGhdO1xuICAgICAgbGV0IHRhc2tJblNlY3Rpb25Db3VudCA9IDA7XG4gICAgICBjb25zdCBjdXJyZW50U2VjdGlvbjIgPSB0YXNrLnNlY3Rpb247XG4gICAgICBmb3IgKGxldCB0YXNrSW5kZXggPSBpOyB0YXNrSW5kZXggPCB0YXNrczIubGVuZ3RoOyB0YXNrSW5kZXgrKykge1xuICAgICAgICBpZiAodGFza3MyW3Rhc2tJbmRleF0uc2VjdGlvbiA9PSBjdXJyZW50U2VjdGlvbjIpIHtcbiAgICAgICAgICB0YXNrSW5TZWN0aW9uQ291bnQgPSB0YXNrSW5TZWN0aW9uQ291bnQgKyAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBzZWN0aW9uID0ge1xuICAgICAgICB4OiBpICogY29uZjIudGFza01hcmdpbiArIGkgKiBjb25mMi53aWR0aCArIGxlZnRNYXJnaW4sXG4gICAgICAgIHk6IDUwLFxuICAgICAgICB0ZXh0OiB0YXNrLnNlY3Rpb24sXG4gICAgICAgIGZpbGwsXG4gICAgICAgIG51bSxcbiAgICAgICAgY29sb3VyLFxuICAgICAgICB0YXNrQ291bnQ6IHRhc2tJblNlY3Rpb25Db3VudFxuICAgICAgfTtcbiAgICAgIHN2Z0RyYXdfZGVmYXVsdC5kcmF3U2VjdGlvbihkaWFncmFtMiwgc2VjdGlvbiwgY29uZjIpO1xuICAgICAgbGFzdFNlY3Rpb24gPSB0YXNrLnNlY3Rpb247XG4gICAgICBzZWN0aW9uTnVtYmVyKys7XG4gICAgfVxuICAgIGNvbnN0IHRhc2tBY3RvcnMgPSB0YXNrLnBlb3BsZS5yZWR1Y2UoKGFjYywgYWN0b3JOYW1lKSA9PiB7XG4gICAgICBpZiAoYWN0b3JzW2FjdG9yTmFtZV0pIHtcbiAgICAgICAgYWNjW2FjdG9yTmFtZV0gPSBhY3RvcnNbYWN0b3JOYW1lXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhY2M7XG4gICAgfSwge30pO1xuICAgIHRhc2sueCA9IGkgKiBjb25mMi50YXNrTWFyZ2luICsgaSAqIGNvbmYyLndpZHRoICsgbGVmdE1hcmdpbjtcbiAgICB0YXNrLnkgPSB0YXNrUG9zO1xuICAgIHRhc2sud2lkdGggPSBjb25mMi5kaWFncmFtTWFyZ2luWDtcbiAgICB0YXNrLmhlaWdodCA9IGNvbmYyLmRpYWdyYW1NYXJnaW5ZO1xuICAgIHRhc2suY29sb3VyID0gY29sb3VyO1xuICAgIHRhc2suZmlsbCA9IGZpbGw7XG4gICAgdGFzay5udW0gPSBudW07XG4gICAgdGFzay5hY3RvcnMgPSB0YXNrQWN0b3JzO1xuICAgIHN2Z0RyYXdfZGVmYXVsdC5kcmF3VGFzayhkaWFncmFtMiwgdGFzaywgY29uZjIsIGRpYWdyYW1JZCk7XG4gICAgYm91bmRzLmluc2VydCh0YXNrLngsIHRhc2sueSwgdGFzay54ICsgdGFzay53aWR0aCArIGNvbmYyLnRhc2tNYXJnaW4sIDMwMCArIDUgKiAzMCk7XG4gIH1cbn0sIFwiZHJhd1Rhc2tzXCIpO1xudmFyIGpvdXJuZXlSZW5kZXJlcl9kZWZhdWx0ID0ge1xuICBzZXRDb25mLFxuICBkcmF3XG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMvdXNlci1qb3VybmV5L2pvdXJuZXlEaWFncmFtLnRzXG52YXIgZGlhZ3JhbSA9IHtcbiAgcGFyc2VyOiBqb3VybmV5X2RlZmF1bHQsXG4gIGRiOiBqb3VybmV5RGJfZGVmYXVsdCxcbiAgcmVuZGVyZXI6IGpvdXJuZXlSZW5kZXJlcl9kZWZhdWx0LFxuICBzdHlsZXM6IHN0eWxlc19kZWZhdWx0LFxuICBpbml0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKChjbmYpID0+IHtcbiAgICBqb3VybmV5UmVuZGVyZXJfZGVmYXVsdC5zZXRDb25mKGNuZi5qb3VybmV5KTtcbiAgICBqb3VybmV5RGJfZGVmYXVsdC5jbGVhcigpO1xuICB9LCBcImluaXRcIilcbn07XG5leHBvcnQge1xuICBkaWFncmFtXG59O1xuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5QkEsSUFBSSxTQUFVLFFBQVEsR0FBRztBQUFBLEVBQ3ZCLElBQUksb0JBQW9CLE9BQU8sUUFBUSxDQUFDLEdBQUcsR0FBRyxJQUFJLEdBQUc7QUFBQSxJQUNuRCxLQUFL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RyxXQUFXLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQztBQUFBLFVBQzlCLEtBQUssSUFBSSxHQUFHLElBQUksT0FBTyxDQUFDO0FBQUEsVUFDeEI7QUFBQSxhQUNHO0FBQUEsVUFDSCxHQUFHLFFBQVEsR0FBRyxLQUFLLElBQUksR0FBRyxHQUFHO0FBQUEsVUFDN0IsS0FBSyxJQUFJO0FBQUEsVUFDVDtBQUFBO0FBQUEsT0FFSCxXQUFXO0FBQUEsSUFDZCxPQUFPLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcs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QjtBQUFBLFFBQzVDLEVBQU87QUFBQSxVQUNMO0FBQUE7QUFBQSxNQUVKO0FBQUEsTUFDQSxNQUFNLFVBQVU7QUFBQSxRQUNkLEdBQUcsSUFBSSxNQUFNLGFBQWEsSUFBSSxNQUFNLFFBQVE7QUFBQSxRQUM1QyxHQUFHO0FBQUEsUUFDSCxNQUFNLEtBQUs7QUFBQSxRQUNYO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBLFdBQVc7QUFBQSxNQUNiO0FBQUEsTUFDQSxnQkFBZ0IsWUFBWSxVQUFVLFNBQVMsS0FBSztBQUFBLE1BQ3BELGNBQWMsS0FBSztBQUFBLE1BQ25CO0FBQUEsSUFDRjtBQUFBLElBQ0EsTUFBTSxhQUFhLEtBQUssT0FBTyxPQUFPLENBQUMsS0FBSyxjQUFjO0FBQUEsTUFDeEQsSUFBSSxPQUFPLFlBQVk7QUFBQSxRQUNyQixJQUFJLGFBQWEsT0FBTztBQUFBLE1BQzFCO0FBQUEsTUFDQSxPQUFPO0FBQUEsT0FDTixDQUFDLENBQUM7QUFBQSxJQUNMLEtBQUssSUFBSSxJQUFJLE1BQU0sYUFBYSxJQUFJLE1BQU0sUUFBUTtBQUFBLElBQ2xELEtBQUssSUFBSTtBQUFBLElBQ1QsS0FBSyxRQUFRLE1BQU07QUFBQSxJQUNuQixLQUFLLFNBQVMsTUFBTTtBQUFBLElBQ3BCLEtBQUssU0FBUztBQUFBLElBQ2QsS0FBSyxPQUFPO0FBQUEsSUFDWixLQUFLLE1BQU07QUFBQSxJQUNYLEtBQUssU0FBUztBQUFBLElBQ2QsZ0JBQWdCLFNBQVMsVUFBVSxNQUFNLE9BQU8sU0FBUztBQUFBLElBQ3pELE9BQU8sT0FBTyxLQUFLLEdBQUcsS0FBSyxHQUFHLEtBQUssSUFBSSxLQUFLLFFBQVEsTUFBTSxZQUFZLE1BQU0sSUFBSSxFQUFFO0FBQUEsRUFDcEY7QUFBQSxHQUNDLFdBQVc7QUFDZCxJQUFJLDBCQUEwQjtBQUFBLEVBQzVCO0FBQUEsRUFDQTtBQUNGO0FBR0EsSUFBSSxVQUFVO0FBQUEsRUFDWixRQUFRO0FBQUEsRUFDUixJQUFJO0FBQUEsRUFDSixVQUFVO0FBQUEsRUFDVixRQUFRO0FBQUEsRUFDUixzQkFBc0IsT0FBTyxDQUFDLFFBQVE7QUFBQSxJQUNwQyx3QkFBd0IsUUFBUSxJQUFJLE9BQU87QUFBQSxJQUMzQyxrQkFBa0IsTUFBTTtBQUFBLEtBQ3ZCLE1BQU07QUFDWDsiLAogICJkZWJ1Z0lkIjogIkVFMjM4MDM5MUFCQUJCNTM2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
