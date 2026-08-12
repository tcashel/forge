import {
  selectSvgElement
} from "./chunk-main-f3t3xmmb.js";
import {
  at
} from "./chunk-main-2se6cwec.js";
import {
  parseFontSize
} from "./chunk-main-vvfzntzy.js";
import"./chunk-main-ck580f0k.js";
import {
  clear,
  common_default,
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
  __name
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/ishikawaDiagram-YF4QCWOH.mjs
var parser = function() {
  var o = /* @__PURE__ */ __name(function(k, v, o2, l) {
    for (o2 = o2 || {}, l = k.length;l--; o2[k[l]] = v)
      ;
    return o2;
  }, "o"), $V0 = [1, 4], $V1 = [1, 14], $V2 = [1, 12], $V3 = [1, 13], $V4 = [6, 7, 8], $V5 = [1, 20], $V6 = [1, 18], $V7 = [1, 19], $V8 = [6, 7, 11], $V9 = [1, 6, 13, 14], $Va = [1, 23], $Vb = [1, 24], $Vc = [1, 6, 7, 11, 13, 14];
  var parser2 = {
    trace: /* @__PURE__ */ __name(function trace() {}, "trace"),
    yy: {},
    symbols_: { error: 2, start: 3, ishikawa: 4, spaceLines: 5, SPACELINE: 6, NL: 7, ISHIKAWA: 8, document: 9, stop: 10, EOF: 11, statement: 12, SPACELIST: 13, TEXT: 14, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 6: "SPACELINE", 7: "NL", 8: "ISHIKAWA", 11: "EOF", 13: "SPACELIST", 14: "TEXT" },
    productions_: [0, [3, 1], [3, 2], [5, 1], [5, 2], [5, 2], [4, 2], [4, 3], [10, 1], [10, 1], [10, 1], [10, 2], [10, 2], [9, 3], [9, 2], [12, 2], [12, 1], [12, 1], [12, 1]],
    performAction: /* @__PURE__ */ __name(function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
      var $0 = $$.length - 1;
      switch (yystate) {
        case 6:
        case 7:
          return yy;
          break;
        case 15:
          yy.addNode($$[$0 - 1].length, $$[$0].trim());
          break;
        case 16:
          yy.addNode(0, $$[$0].trim());
          break;
      }
    }, "anonymous"),
    table: [{ 3: 1, 4: 2, 5: 3, 6: [1, 5], 8: $V0 }, { 1: [3] }, { 1: [2, 1] }, { 4: 6, 6: [1, 7], 7: [1, 8], 8: $V0 }, { 6: $V1, 7: [1, 10], 9: 9, 12: 11, 13: $V2, 14: $V3 }, o($V4, [2, 3]), { 1: [2, 2] }, o($V4, [2, 4]), o($V4, [2, 5]), { 1: [2, 6], 6: $V1, 12: 15, 13: $V2, 14: $V3 }, { 6: $V1, 9: 16, 12: 11, 13: $V2, 14: $V3 }, { 6: $V5, 7: $V6, 10: 17, 11: $V7 }, o($V8, [2, 18], { 14: [1, 21] }), o($V8, [2, 16]), o($V8, [2, 17]), { 6: $V5, 7: $V6, 10: 22, 11: $V7 }, { 1: [2, 7], 6: $V1, 12: 15, 13: $V2, 14: $V3 }, o($V9, [2, 14], { 7: $Va, 11: $Vb }), o($Vc, [2, 8]), o($Vc, [2, 9]), o($Vc, [2, 10]), o($V8, [2, 15]), o($V9, [2, 13], { 7: $Va, 11: $Vb }), o($Vc, [2, 11]), o($Vc, [2, 12])],
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
            return 6;
            break;
          case 1:
            return 8;
            break;
          case 2:
            return 8;
            break;
          case 3:
            return 6;
            break;
          case 4:
            return 7;
            break;
          case 5:
            return 13;
            break;
          case 6:
            return 14;
            break;
          case 7:
            return 11;
            break;
        }
      }, "anonymous"),
      rules: [/^(?:\s*%%.*)/i, /^(?:ishikawa-beta\b)/i, /^(?:ishikawa\b)/i, /^(?:[\s]+[\n])/i, /^(?:[\n]+)/i, /^(?:[\s]+)/i, /^(?:[^\n]+)/i, /^(?:$)/i],
      conditions: { INITIAL: { rules: [0, 1, 2, 3, 4, 5, 6, 7], inclusive: true } }
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
var ishikawa_default = parser;
var IshikawaDB = class {
  constructor() {
    this.stack = [];
    this.clear = this.clear.bind(this);
    this.addNode = this.addNode.bind(this);
    this.getRoot = this.getRoot.bind(this);
  }
  static {
    __name(this, "IshikawaDB");
  }
  clear() {
    this.root = undefined;
    this.stack = [];
    this.baseLevel = undefined;
    clear();
  }
  getRoot() {
    return this.root;
  }
  addNode(rawLevel, text) {
    const label = common_default.sanitizeText(text, getConfig2());
    if (!this.root) {
      this.root = { text: label, children: [] };
      this.stack = [{ level: 0, node: this.root }];
      setDiagramTitle(label);
      return;
    }
    this.baseLevel ??= rawLevel;
    let level = rawLevel - this.baseLevel + 1;
    if (level <= 0) {
      level = 1;
    }
    while (this.stack.length > 1 && this.stack[this.stack.length - 1].level >= level) {
      this.stack.pop();
    }
    const parent = this.stack[this.stack.length - 1].node;
    const node = { text: label, children: [] };
    parent.children.push(node);
    this.stack.push({ level, node });
  }
  getAccTitle() {
    return getAccTitle();
  }
  setAccTitle(title) {
    setAccTitle(title);
  }
  getAccDescription() {
    return getAccDescription();
  }
  setAccDescription(description) {
    setAccDescription(description);
  }
  getDiagramTitle() {
    return getDiagramTitle();
  }
  setDiagramTitle(title) {
    setDiagramTitle(title);
  }
};
var FONT_SIZE_DEFAULT = 14;
var SPINE_BASE_LENGTH = 250;
var BONE_STUB = 30;
var BONE_BASE = 60;
var BONE_PER_CHILD = 5;
var ANGLE = 82 * Math.PI / 180;
var COS_A = Math.cos(ANGLE);
var SIN_A = Math.sin(ANGLE);
var applyPaddedViewBox = /* @__PURE__ */ __name((svgEl, pad, maxW) => {
  const bbox = svgEl.node().getBBox();
  const w = bbox.width + pad * 2;
  const h = bbox.height + pad * 2;
  configureSvgSize(svgEl, h, w, maxW);
  svgEl.attr("viewBox", `${bbox.x - pad} ${bbox.y - pad} ${w} ${h}`);
}, "applyPaddedViewBox");
var draw = /* @__PURE__ */ __name((_text, id, _version, diagram2) => {
  const db = diagram2.db;
  const root = db.getRoot();
  if (!root) {
    return;
  }
  const drawConfig = getConfig2();
  const { look, handDrawnSeed, themeVariables } = drawConfig;
  const fontSize = parseFontSize(drawConfig.fontSize)[0] ?? FONT_SIZE_DEFAULT;
  const isHandDrawn = look === "handDrawn";
  const causes = root.children ?? [];
  const padding = drawConfig.ishikawa?.diagramPadding ?? 20;
  const useMaxWidth = drawConfig.ishikawa?.useMaxWidth ?? false;
  const svg = selectSvgElement(id);
  const g = svg.append("g").attr("class", "ishikawa");
  const roughSvg = isHandDrawn ? at.svg(svg.node()) : undefined;
  const roughContext = roughSvg ? {
    roughSvg,
    seed: handDrawnSeed ?? 0,
    lineColor: themeVariables?.lineColor ?? "#333",
    fillColor: themeVariables?.mainBkg ?? "#fff"
  } : undefined;
  const markerId = `ishikawa-arrow-${id}`;
  if (!isHandDrawn) {
    g.append("defs").append("marker").attr("id", markerId).attr("viewBox", "0 0 10 10").attr("refX", 0).attr("refY", 5).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto").append("path").attr("d", "M 10 0 L 0 5 L 10 10 Z").attr("class", "ishikawa-arrow");
  }
  let spineX = 0;
  let spineY = SPINE_BASE_LENGTH;
  const spineLine = isHandDrawn ? undefined : drawLine(g, spineX, spineY, spineX, spineY, "ishikawa-spine");
  drawHead(g, spineX, spineY, root.text, fontSize, roughContext);
  if (!causes.length) {
    if (isHandDrawn) {
      drawLine(g, spineX, spineY, spineX, spineY, "ishikawa-spine", roughContext);
    }
    applyPaddedViewBox(svg, padding, useMaxWidth);
    return;
  }
  spineX -= 20;
  const upperCauses = causes.filter((_, i) => i % 2 === 0);
  const lowerCauses = causes.filter((_, i) => i % 2 === 1);
  const upperStats = sideStats(upperCauses);
  const lowerStats = sideStats(lowerCauses);
  const descendantTotal = upperStats.total + lowerStats.total;
  let upperLen = SPINE_BASE_LENGTH;
  let lowerLen = SPINE_BASE_LENGTH;
  if (descendantTotal > 0) {
    const pool = SPINE_BASE_LENGTH * 2;
    const minLen = SPINE_BASE_LENGTH * 0.3;
    upperLen = Math.max(minLen, pool * (upperStats.total / descendantTotal));
    lowerLen = Math.max(minLen, pool * (lowerStats.total / descendantTotal));
  }
  const minSpacing = fontSize * 2;
  upperLen = Math.max(upperLen, upperStats.max * minSpacing);
  lowerLen = Math.max(lowerLen, lowerStats.max * minSpacing);
  spineY = Math.max(upperLen, SPINE_BASE_LENGTH);
  if (spineLine) {
    spineLine.attr("y1", spineY).attr("y2", spineY);
  }
  g.select(".ishikawa-head-group").attr("transform", `translate(0,${spineY})`);
  const pairCount = Math.ceil(causes.length / 2);
  for (let p = 0;p < pairCount; p++) {
    const pg = g.append("g").attr("class", "ishikawa-pair");
    for (const [cause, dir, len] of [
      [causes[p * 2], -1, upperLen],
      [causes[p * 2 + 1], 1, lowerLen]
    ]) {
      if (cause) {
        drawBranch(pg, cause, spineX, spineY, dir, len, fontSize, roughContext);
      }
    }
    spineX = pg.selectAll("text").nodes().reduce((left, n) => Math.min(left, n.getBBox().x), Infinity);
  }
  if (isHandDrawn) {
    drawLine(g, spineX, spineY, 0, spineY, "ishikawa-spine", roughContext);
  } else {
    spineLine.attr("x1", spineX);
    const markerUrl = `url(#${markerId})`;
    g.selectAll("line.ishikawa-branch, line.ishikawa-sub-branch").attr("marker-start", markerUrl);
  }
  applyPaddedViewBox(svg, padding, useMaxWidth);
}, "draw");
var sideStats = /* @__PURE__ */ __name((nodes) => {
  const countDescendants = /* @__PURE__ */ __name((node) => node.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0), "countDescendants");
  return nodes.reduce((stats, node) => {
    const descendants = countDescendants(node);
    stats.total += descendants;
    stats.max = Math.max(stats.max, descendants);
    return stats;
  }, { total: 0, max: 0 });
}, "sideStats");
var drawHead = /* @__PURE__ */ __name((svg, x, y, label, fontSize, roughContext) => {
  const maxChars = Math.max(6, Math.floor(110 / (fontSize * 0.6)));
  const headGroup = svg.append("g").attr("class", "ishikawa-head-group").attr("transform", `translate(${x},${y})`);
  const textEl = drawMultilineText(headGroup, wrapText(label, maxChars), 0, 0, "ishikawa-head-label", "start", fontSize);
  const tb = textEl.node().getBBox();
  const w = Math.max(60, tb.width + 6);
  const h = Math.max(40, tb.height * 2 + 40);
  const headPath = `M 0 ${-h / 2} L 0 ${h / 2} Q ${w * 2.4} 0 0 ${-h / 2} Z`;
  if (roughContext) {
    const roughNode = roughContext.roughSvg.path(headPath, {
      roughness: 1.5,
      seed: roughContext.seed,
      fill: roughContext.fillColor,
      fillStyle: "hachure",
      fillWeight: 2.5,
      hachureGap: 5,
      stroke: roughContext.lineColor,
      strokeWidth: 2
    });
    headGroup.insert(() => roughNode, ":first-child").attr("class", "ishikawa-head");
  } else {
    headGroup.insert("path", ":first-child").attr("class", "ishikawa-head").attr("d", headPath);
  }
  textEl.attr("transform", `translate(${(w - tb.width) / 2 - tb.x + 3},${-tb.y - tb.height / 2})`);
}, "drawHead");
var flattenTree = /* @__PURE__ */ __name((children, direction) => {
  const entries = [];
  const yOrder = [];
  const walk = /* @__PURE__ */ __name((nodes, pid, depth) => {
    const ordered = direction === -1 ? [...nodes].reverse() : nodes;
    for (const child of ordered) {
      const idx = entries.length;
      const gc = child.children ?? [];
      entries.push({
        depth,
        text: wrapText(child.text, 15),
        parentIndex: pid,
        childCount: gc.length
      });
      if (depth % 2 === 0) {
        yOrder.push(idx);
        if (gc.length) {
          walk(gc, idx, depth + 1);
        }
      } else {
        if (gc.length) {
          walk(gc, idx, depth + 1);
        }
        yOrder.push(idx);
      }
    }
  }, "walk");
  walk(children, -1, 2);
  return { entries, yOrder };
}, "flattenTree");
var drawCauseLabel = /* @__PURE__ */ __name((svg, text, x, y, direction, fontSize, roughContext) => {
  const lg = svg.append("g").attr("class", "ishikawa-label-group");
  const lt = drawMultilineText(lg, text, x, y + 11 * direction, "ishikawa-label cause", "middle", fontSize);
  const tb = lt.node().getBBox();
  if (roughContext) {
    const roughNode = roughContext.roughSvg.rectangle(tb.x - 20, tb.y - 2, tb.width + 40, tb.height + 4, {
      roughness: 1.5,
      seed: roughContext.seed,
      fill: roughContext.fillColor,
      fillStyle: "hachure",
      fillWeight: 2.5,
      hachureGap: 5,
      stroke: roughContext.lineColor,
      strokeWidth: 2
    });
    lg.insert(() => roughNode, ":first-child").attr("class", "ishikawa-label-box");
  } else {
    lg.insert("rect", ":first-child").attr("class", "ishikawa-label-box").attr("x", tb.x - 20).attr("y", tb.y - 2).attr("width", tb.width + 40).attr("height", tb.height + 4);
  }
}, "drawCauseLabel");
var drawArrowMarker = /* @__PURE__ */ __name((g, x, y, dx, dy, roughContext) => {
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) {
    return;
  }
  const ux = dx / len;
  const uy = dy / len;
  const s = 6;
  const px = -uy * s;
  const py = ux * s;
  const tipX = x;
  const tipY = y;
  const d = `M ${tipX} ${tipY} L ${tipX - ux * s * 2 + px} ${tipY - uy * s * 2 + py} L ${tipX - ux * s * 2 - px} ${tipY - uy * s * 2 - py} Z`;
  const roughNode = roughContext.roughSvg.path(d, {
    roughness: 1,
    seed: roughContext.seed,
    fill: roughContext.lineColor,
    fillStyle: "solid",
    stroke: roughContext.lineColor,
    strokeWidth: 1
  });
  g.append(() => roughNode);
}, "drawArrowMarker");
var drawBranch = /* @__PURE__ */ __name((svg, node, startX, startY, direction, length, fontSize, roughContext) => {
  const children = node.children ?? [];
  const lineLen = length * (children.length ? 1 : 0.2);
  const dx = -COS_A * lineLen;
  const dy = SIN_A * lineLen * direction;
  const endX = startX + dx;
  const endY = startY + dy;
  drawLine(svg, startX, startY, endX, endY, "ishikawa-branch", roughContext);
  if (roughContext) {
    drawArrowMarker(svg, startX, startY, startX - endX, startY - endY, roughContext);
  }
  drawCauseLabel(svg, node.text, endX, endY, direction, fontSize, roughContext);
  if (!children.length) {
    return;
  }
  const { entries, yOrder } = flattenTree(children, direction);
  const entryCount = entries.length;
  const ys = new Array(entryCount);
  for (const [slot, entryIdx] of yOrder.entries()) {
    ys[entryIdx] = startY + dy * ((slot + 1) / (entryCount + 1));
  }
  const bones = /* @__PURE__ */ new Map;
  bones.set(-1, {
    x0: startX,
    y0: startY,
    x1: endX,
    y1: endY,
    childCount: children.length,
    childrenDrawn: 0
  });
  const diagonalX = -COS_A;
  const diagonalY = SIN_A * direction;
  const oddLabel = direction < 0 ? "ishikawa-label up" : "ishikawa-label down";
  for (const [i, e] of entries.entries()) {
    const y = ys[i];
    const par = bones.get(e.parentIndex);
    const grp = svg.append("g").attr("class", "ishikawa-sub-group");
    let bx0 = 0;
    let by0 = 0;
    let bx1 = 0;
    if (e.depth % 2 === 0) {
      const dyP = par.y1 - par.y0;
      bx0 = lerp(par.x0, par.x1, dyP ? (y - par.y0) / dyP : 0.5);
      by0 = y;
      bx1 = bx0 - (e.childCount > 0 ? BONE_BASE + e.childCount * BONE_PER_CHILD : BONE_STUB);
      drawLine(grp, bx0, y, bx1, y, "ishikawa-sub-branch", roughContext);
      if (roughContext) {
        drawArrowMarker(grp, bx0, y, 1, 0, roughContext);
      }
      drawMultilineText(grp, e.text, bx1, y, "ishikawa-label align", "end", fontSize);
    } else {
      const k = par.childrenDrawn++;
      bx0 = lerp(par.x0, par.x1, (par.childCount - k) / (par.childCount + 1));
      by0 = par.y0;
      bx1 = bx0 + diagonalX * ((y - by0) / diagonalY);
      drawLine(grp, bx0, by0, bx1, y, "ishikawa-sub-branch", roughContext);
      if (roughContext) {
        drawArrowMarker(grp, bx0, by0, bx0 - bx1, by0 - y, roughContext);
      }
      drawMultilineText(grp, e.text, bx1, y, oddLabel, "end", fontSize);
    }
    if (e.childCount > 0) {
      bones.set(i, {
        x0: bx0,
        y0: by0,
        x1: bx1,
        y1: y,
        childCount: e.childCount,
        childrenDrawn: 0
      });
    }
  }
}, "drawBranch");
var splitLines = /* @__PURE__ */ __name((text) => text.split(/<br\s*\/?>|\n/), "splitLines");
var wrapText = /* @__PURE__ */ __name((text, maxChars) => {
  if (text.length <= maxChars) {
    return text;
  }
  const lines = [];
  for (const word of text.split(/\s+/)) {
    const last = lines.length - 1;
    if (last >= 0 && lines[last].length + 1 + word.length <= maxChars) {
      lines[last] += " " + word;
    } else {
      lines.push(word);
    }
  }
  return lines.join(`
`);
}, "wrapText");
var drawMultilineText = /* @__PURE__ */ __name((g, text, x, y, cls, anchor, fontSize) => {
  const lines = splitLines(text);
  const lh = fontSize * 1.05;
  const el = g.append("text").attr("class", cls).attr("text-anchor", anchor).attr("x", x).attr("y", y - (lines.length - 1) * lh / 2);
  for (const [i, line] of lines.entries()) {
    el.append("tspan").attr("x", x).attr("dy", i === 0 ? 0 : lh).text(line);
  }
  return el;
}, "drawMultilineText");
var lerp = /* @__PURE__ */ __name((a, b, t) => a + (b - a) * t, "lerp");
var drawLine = /* @__PURE__ */ __name((g, x1, y1, x2, y2, cls, roughContext) => {
  if (roughContext) {
    const roughNode = roughContext.roughSvg.line(x1, y1, x2, y2, {
      roughness: 1.5,
      seed: roughContext.seed,
      stroke: roughContext.lineColor,
      strokeWidth: 2
    });
    g.append(() => roughNode).attr("class", cls);
    return;
  }
  return g.append("line").attr("class", cls).attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);
}, "drawLine");
var renderer = { draw };
var getStyles = /* @__PURE__ */ __name((options) => `
.ishikawa .ishikawa-spine,
.ishikawa .ishikawa-branch,
.ishikawa .ishikawa-sub-branch {
  stroke: ${options.lineColor};
  stroke-width: 2;
  fill: none;
}

.ishikawa .ishikawa-sub-branch {
  stroke-width: 1;
}

.ishikawa .ishikawa-arrow {
  fill: ${options.lineColor};
}

.ishikawa .ishikawa-head {
  fill: ${options.mainBkg};
  stroke: ${options.lineColor};
  stroke-width: 2;
}

.ishikawa .ishikawa-label-box {
  fill: ${options.mainBkg};
  stroke: ${options.lineColor};
  stroke-width: 2;
}

.ishikawa text {
  font-family: ${options.fontFamily};
  font-size: ${options.fontSize};
  fill: ${options.textColor};
}

.ishikawa .ishikawa-head-label {
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
  font-size: 14px;
}

.ishikawa .ishikawa-label {
  text-anchor: end;
}

.ishikawa .ishikawa-label.cause {
  text-anchor: middle;
  dominant-baseline: middle;
}

.ishikawa .ishikawa-label.align {
  text-anchor: end;
  dominant-baseline: middle;
}

.ishikawa .ishikawa-label.up {
  dominant-baseline: baseline;
}

.ishikawa .ishikawa-label.down {
  dominant-baseline: hanging;
}
`, "getStyles");
var ishikawaStyles_default = getStyles;
var diagram = {
  parser: ishikawa_default,
  get db() {
    return new IshikawaDB;
  },
  renderer,
  styles: ishikawaStyles_default
};
export {
  diagram
};

//# debugId=05412BB634D469D964756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2lzaGlrYXdhRGlhZ3JhbS1ZRjRRQ1dPSC5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiaW1wb3J0IHtcbiAgc2VsZWN0U3ZnRWxlbWVudFxufSBmcm9tIFwiLi9jaHVuay1XVTVNWUcyRy5tanNcIjtcbmltcG9ydCB7XG4gIHBhcnNlRm9udFNpemVcbn0gZnJvbSBcIi4vY2h1bmstNVpRWUhYS1UubWpzXCI7XG5pbXBvcnQge1xuICBjbGVhcixcbiAgY29tbW9uX2RlZmF1bHQsXG4gIGNvbmZpZ3VyZVN2Z1NpemUsXG4gIGdldEFjY0Rlc2NyaXB0aW9uLFxuICBnZXRBY2NUaXRsZSxcbiAgZ2V0Q29uZmlnMiBhcyBnZXRDb25maWcsXG4gIGdldERpYWdyYW1UaXRsZSxcbiAgc2V0QWNjRGVzY3JpcHRpb24sXG4gIHNldEFjY1RpdGxlLFxuICBzZXREaWFncmFtVGl0bGVcbn0gZnJvbSBcIi4vY2h1bmstQ1NDSUhLN1EubWpzXCI7XG5pbXBvcnQge1xuICBfX25hbWVcbn0gZnJvbSBcIi4vY2h1bmstQUdIUkI0SkYubWpzXCI7XG5cbi8vIHNyYy9kaWFncmFtcy9pc2hpa2F3YS9wYXJzZXIvaXNoaWthd2Euamlzb25cbnZhciBwYXJzZXIgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBvID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihrLCB2LCBvMiwgbCkge1xuICAgIGZvciAobzIgPSBvMiB8fCB7fSwgbCA9IGsubGVuZ3RoOyBsLS07IG8yW2tbbF1dID0gdikgO1xuICAgIHJldHVybiBvMjtcbiAgfSwgXCJvXCIpLCAkVjAgPSBbMSwgNF0sICRWMSA9IFsxLCAxNF0sICRWMiA9IFsxLCAxMl0sICRWMyA9IFsxLCAxM10sICRWNCA9IFs2LCA3LCA4XSwgJFY1ID0gWzEsIDIwXSwgJFY2ID0gWzEsIDE4XSwgJFY3ID0gWzEsIDE5XSwgJFY4ID0gWzYsIDcsIDExXSwgJFY5ID0gWzEsIDYsIDEzLCAxNF0sICRWYSA9IFsxLCAyM10sICRWYiA9IFsxLCAyNF0sICRWYyA9IFsxLCA2LCA3LCAxMSwgMTMsIDE0XTtcbiAgdmFyIHBhcnNlcjIgPSB7XG4gICAgdHJhY2U6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gdHJhY2UoKSB7XG4gICAgfSwgXCJ0cmFjZVwiKSxcbiAgICB5eToge30sXG4gICAgc3ltYm9sc186IHsgXCJlcnJvclwiOiAyLCBcInN0YXJ0XCI6IDMsIFwiaXNoaWthd2FcIjogNCwgXCJzcGFjZUxpbmVzXCI6IDUsIFwiU1BBQ0VMSU5FXCI6IDYsIFwiTkxcIjogNywgXCJJU0hJS0FXQVwiOiA4LCBcImRvY3VtZW50XCI6IDksIFwic3RvcFwiOiAxMCwgXCJFT0ZcIjogMTEsIFwic3RhdGVtZW50XCI6IDEyLCBcIlNQQUNFTElTVFwiOiAxMywgXCJURVhUXCI6IDE0LCBcIiRhY2NlcHRcIjogMCwgXCIkZW5kXCI6IDEgfSxcbiAgICB0ZXJtaW5hbHNfOiB7IDI6IFwiZXJyb3JcIiwgNjogXCJTUEFDRUxJTkVcIiwgNzogXCJOTFwiLCA4OiBcIklTSElLQVdBXCIsIDExOiBcIkVPRlwiLCAxMzogXCJTUEFDRUxJU1RcIiwgMTQ6IFwiVEVYVFwiIH0sXG4gICAgcHJvZHVjdGlvbnNfOiBbMCwgWzMsIDFdLCBbMywgMl0sIFs1LCAxXSwgWzUsIDJdLCBbNSwgMl0sIFs0LCAyXSwgWzQsIDNdLCBbMTAsIDFdLCBbMTAsIDFdLCBbMTAsIDFdLCBbMTAsIDJdLCBbMTAsIDJdLCBbOSwgM10sIFs5LCAyXSwgWzEyLCAyXSwgWzEyLCAxXSwgWzEyLCAxXSwgWzEyLCAxXV0sXG4gICAgcGVyZm9ybUFjdGlvbjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBhbm9ueW1vdXMoeXl0ZXh0LCB5eWxlbmcsIHl5bGluZW5vLCB5eSwgeXlzdGF0ZSwgJCQsIF8kKSB7XG4gICAgICB2YXIgJDAgPSAkJC5sZW5ndGggLSAxO1xuICAgICAgc3dpdGNoICh5eXN0YXRlKSB7XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgY2FzZSA3OlxuICAgICAgICAgIHJldHVybiB5eTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNTpcbiAgICAgICAgICB5eS5hZGROb2RlKCQkWyQwIC0gMV0ubGVuZ3RoLCAkJFskMF0udHJpbSgpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICB5eS5hZGROb2RlKDAsICQkWyQwXS50cmltKCkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0sIFwiYW5vbnltb3VzXCIpLFxuICAgIHRhYmxlOiBbeyAzOiAxLCA0OiAyLCA1OiAzLCA2OiBbMSwgNV0sIDg6ICRWMCB9LCB7IDE6IFszXSB9LCB7IDE6IFsyLCAxXSB9LCB7IDQ6IDYsIDY6IFsxLCA3XSwgNzogWzEsIDhdLCA4OiAkVjAgfSwgeyA2OiAkVjEsIDc6IFsxLCAxMF0sIDk6IDksIDEyOiAxMSwgMTM6ICRWMiwgMTQ6ICRWMyB9LCBvKCRWNCwgWzIsIDNdKSwgeyAxOiBbMiwgMl0gfSwgbygkVjQsIFsyLCA0XSksIG8oJFY0LCBbMiwgNV0pLCB7IDE6IFsyLCA2XSwgNjogJFYxLCAxMjogMTUsIDEzOiAkVjIsIDE0OiAkVjMgfSwgeyA2OiAkVjEsIDk6IDE2LCAxMjogMTEsIDEzOiAkVjIsIDE0OiAkVjMgfSwgeyA2OiAkVjUsIDc6ICRWNiwgMTA6IDE3LCAxMTogJFY3IH0sIG8oJFY4LCBbMiwgMThdLCB7IDE0OiBbMSwgMjFdIH0pLCBvKCRWOCwgWzIsIDE2XSksIG8oJFY4LCBbMiwgMTddKSwgeyA2OiAkVjUsIDc6ICRWNiwgMTA6IDIyLCAxMTogJFY3IH0sIHsgMTogWzIsIDddLCA2OiAkVjEsIDEyOiAxNSwgMTM6ICRWMiwgMTQ6ICRWMyB9LCBvKCRWOSwgWzIsIDE0XSwgeyA3OiAkVmEsIDExOiAkVmIgfSksIG8oJFZjLCBbMiwgOF0pLCBvKCRWYywgWzIsIDldKSwgbygkVmMsIFsyLCAxMF0pLCBvKCRWOCwgWzIsIDE1XSksIG8oJFY5LCBbMiwgMTNdLCB7IDc6ICRWYSwgMTE6ICRWYiB9KSwgbygkVmMsIFsyLCAxMV0pLCBvKCRWYywgWzIsIDEyXSldLFxuICAgIGRlZmF1bHRBY3Rpb25zOiB7IDI6IFsyLCAxXSwgNjogWzIsIDJdIH0sXG4gICAgcGFyc2VFcnJvcjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwYXJzZUVycm9yKHN0ciwgaGFzaCkge1xuICAgICAgaWYgKGhhc2gucmVjb3ZlcmFibGUpIHtcbiAgICAgICAgdGhpcy50cmFjZShzdHIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKHN0cik7XG4gICAgICAgIGVycm9yLmhhc2ggPSBoYXNoO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LCBcInBhcnNlRXJyb3JcIiksXG4gICAgcGFyc2U6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcGFyc2UoaW5wdXQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcywgc3RhY2sgPSBbMF0sIHRzdGFjayA9IFtdLCB2c3RhY2sgPSBbbnVsbF0sIGxzdGFjayA9IFtdLCB0YWJsZSA9IHRoaXMudGFibGUsIHl5dGV4dCA9IFwiXCIsIHl5bGluZW5vID0gMCwgeXlsZW5nID0gMCwgcmVjb3ZlcmluZyA9IDAsIFRFUlJPUiA9IDIsIEVPRiA9IDE7XG4gICAgICB2YXIgYXJncyA9IGxzdGFjay5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICB2YXIgbGV4ZXIyID0gT2JqZWN0LmNyZWF0ZSh0aGlzLmxleGVyKTtcbiAgICAgIHZhciBzaGFyZWRTdGF0ZSA9IHsgeXk6IHt9IH07XG4gICAgICBmb3IgKHZhciBrIGluIHRoaXMueXkpIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnl5LCBrKSkge1xuICAgICAgICAgIHNoYXJlZFN0YXRlLnl5W2tdID0gdGhpcy55eVtrXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGV4ZXIyLnNldElucHV0KGlucHV0LCBzaGFyZWRTdGF0ZS55eSk7XG4gICAgICBzaGFyZWRTdGF0ZS55eS5sZXhlciA9IGxleGVyMjtcbiAgICAgIHNoYXJlZFN0YXRlLnl5LnBhcnNlciA9IHRoaXM7XG4gICAgICBpZiAodHlwZW9mIGxleGVyMi55eWxsb2MgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBsZXhlcjIueXlsbG9jID0ge307XG4gICAgICB9XG4gICAgICB2YXIgeXlsb2MgPSBsZXhlcjIueXlsbG9jO1xuICAgICAgbHN0YWNrLnB1c2goeXlsb2MpO1xuICAgICAgdmFyIHJhbmdlcyA9IGxleGVyMi5vcHRpb25zICYmIGxleGVyMi5vcHRpb25zLnJhbmdlcztcbiAgICAgIGlmICh0eXBlb2Ygc2hhcmVkU3RhdGUueXkucGFyc2VFcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRoaXMucGFyc2VFcnJvciA9IHNoYXJlZFN0YXRlLnl5LnBhcnNlRXJyb3I7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBhcnNlRXJyb3IgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykucGFyc2VFcnJvcjtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHBvcFN0YWNrKG4pIHtcbiAgICAgICAgc3RhY2subGVuZ3RoID0gc3RhY2subGVuZ3RoIC0gMiAqIG47XG4gICAgICAgIHZzdGFjay5sZW5ndGggPSB2c3RhY2subGVuZ3RoIC0gbjtcbiAgICAgICAgbHN0YWNrLmxlbmd0aCA9IGxzdGFjay5sZW5ndGggLSBuO1xuICAgICAgfVxuICAgICAgX19uYW1lKHBvcFN0YWNrLCBcInBvcFN0YWNrXCIpO1xuICAgICAgZnVuY3Rpb24gbGV4KCkge1xuICAgICAgICB2YXIgdG9rZW47XG4gICAgICAgIHRva2VuID0gdHN0YWNrLnBvcCgpIHx8IGxleGVyMi5sZXgoKSB8fCBFT0Y7XG4gICAgICAgIGlmICh0eXBlb2YgdG9rZW4gIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICBpZiAodG9rZW4gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgdHN0YWNrID0gdG9rZW47XG4gICAgICAgICAgICB0b2tlbiA9IHRzdGFjay5wb3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdG9rZW4gPSBzZWxmLnN5bWJvbHNfW3Rva2VuXSB8fCB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICB9XG4gICAgICBfX25hbWUobGV4LCBcImxleFwiKTtcbiAgICAgIHZhciBzeW1ib2wsIHByZUVycm9yU3ltYm9sLCBzdGF0ZSwgYWN0aW9uLCBhLCByLCB5eXZhbCA9IHt9LCBwLCBsZW4sIG5ld1N0YXRlLCBleHBlY3RlZDtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHN0YXRlID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRBY3Rpb25zW3N0YXRlXSkge1xuICAgICAgICAgIGFjdGlvbiA9IHRoaXMuZGVmYXVsdEFjdGlvbnNbc3RhdGVdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChzeW1ib2wgPT09IG51bGwgfHwgdHlwZW9mIHN5bWJvbCA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBzeW1ib2wgPSBsZXgoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aW9uID0gdGFibGVbc3RhdGVdICYmIHRhYmxlW3N0YXRlXVtzeW1ib2xdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgYWN0aW9uID09PSBcInVuZGVmaW5lZFwiIHx8ICFhY3Rpb24ubGVuZ3RoIHx8ICFhY3Rpb25bMF0pIHtcbiAgICAgICAgICB2YXIgZXJyU3RyID0gXCJcIjtcbiAgICAgICAgICBleHBlY3RlZCA9IFtdO1xuICAgICAgICAgIGZvciAocCBpbiB0YWJsZVtzdGF0ZV0pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRlcm1pbmFsc19bcF0gJiYgcCA+IFRFUlJPUikge1xuICAgICAgICAgICAgICBleHBlY3RlZC5wdXNoKFwiJ1wiICsgdGhpcy50ZXJtaW5hbHNfW3BdICsgXCInXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobGV4ZXIyLnNob3dQb3NpdGlvbikge1xuICAgICAgICAgICAgZXJyU3RyID0gXCJQYXJzZSBlcnJvciBvbiBsaW5lIFwiICsgKHl5bGluZW5vICsgMSkgKyBcIjpcXG5cIiArIGxleGVyMi5zaG93UG9zaXRpb24oKSArIFwiXFxuRXhwZWN0aW5nIFwiICsgZXhwZWN0ZWQuam9pbihcIiwgXCIpICsgXCIsIGdvdCAnXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlcnJTdHIgPSBcIlBhcnNlIGVycm9yIG9uIGxpbmUgXCIgKyAoeXlsaW5lbm8gKyAxKSArIFwiOiBVbmV4cGVjdGVkIFwiICsgKHN5bWJvbCA9PSBFT0YgPyBcImVuZCBvZiBpbnB1dFwiIDogXCInXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wYXJzZUVycm9yKGVyclN0ciwge1xuICAgICAgICAgICAgdGV4dDogbGV4ZXIyLm1hdGNoLFxuICAgICAgICAgICAgdG9rZW46IHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCxcbiAgICAgICAgICAgIGxpbmU6IGxleGVyMi55eWxpbmVubyxcbiAgICAgICAgICAgIGxvYzogeXlsb2MsXG4gICAgICAgICAgICBleHBlY3RlZFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhY3Rpb25bMF0gaW5zdGFuY2VvZiBBcnJheSAmJiBhY3Rpb24ubGVuZ3RoID4gMSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcnNlIEVycm9yOiBtdWx0aXBsZSBhY3Rpb25zIHBvc3NpYmxlIGF0IHN0YXRlOiBcIiArIHN0YXRlICsgXCIsIHRva2VuOiBcIiArIHN5bWJvbCk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChhY3Rpb25bMF0pIHtcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBzdGFjay5wdXNoKHN5bWJvbCk7XG4gICAgICAgICAgICB2c3RhY2sucHVzaChsZXhlcjIueXl0ZXh0KTtcbiAgICAgICAgICAgIGxzdGFjay5wdXNoKGxleGVyMi55eWxsb2MpO1xuICAgICAgICAgICAgc3RhY2sucHVzaChhY3Rpb25bMV0pO1xuICAgICAgICAgICAgc3ltYm9sID0gbnVsbDtcbiAgICAgICAgICAgIGlmICghcHJlRXJyb3JTeW1ib2wpIHtcbiAgICAgICAgICAgICAgeXlsZW5nID0gbGV4ZXIyLnl5bGVuZztcbiAgICAgICAgICAgICAgeXl0ZXh0ID0gbGV4ZXIyLnl5dGV4dDtcbiAgICAgICAgICAgICAgeXlsaW5lbm8gPSBsZXhlcjIueXlsaW5lbm87XG4gICAgICAgICAgICAgIHl5bG9jID0gbGV4ZXIyLnl5bGxvYztcbiAgICAgICAgICAgICAgaWYgKHJlY292ZXJpbmcgPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVjb3ZlcmluZy0tO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzeW1ib2wgPSBwcmVFcnJvclN5bWJvbDtcbiAgICAgICAgICAgICAgcHJlRXJyb3JTeW1ib2wgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgbGVuID0gdGhpcy5wcm9kdWN0aW9uc19bYWN0aW9uWzFdXVsxXTtcbiAgICAgICAgICAgIHl5dmFsLiQgPSB2c3RhY2tbdnN0YWNrLmxlbmd0aCAtIGxlbl07XG4gICAgICAgICAgICB5eXZhbC5fJCA9IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5maXJzdF9saW5lLFxuICAgICAgICAgICAgICBsYXN0X2xpbmU6IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gMV0ubGFzdF9saW5lLFxuICAgICAgICAgICAgICBmaXJzdF9jb2x1bW46IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0uZmlyc3RfY29sdW1uLFxuICAgICAgICAgICAgICBsYXN0X2NvbHVtbjogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAxXS5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChyYW5nZXMpIHtcbiAgICAgICAgICAgICAgeXl2YWwuXyQucmFuZ2UgPSBbXG4gICAgICAgICAgICAgICAgbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5yYW5nZVswXSxcbiAgICAgICAgICAgICAgICBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIDFdLnJhbmdlWzFdXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByID0gdGhpcy5wZXJmb3JtQWN0aW9uLmFwcGx5KHl5dmFsLCBbXG4gICAgICAgICAgICAgIHl5dGV4dCxcbiAgICAgICAgICAgICAgeXlsZW5nLFxuICAgICAgICAgICAgICB5eWxpbmVubyxcbiAgICAgICAgICAgICAgc2hhcmVkU3RhdGUueXksXG4gICAgICAgICAgICAgIGFjdGlvblsxXSxcbiAgICAgICAgICAgICAgdnN0YWNrLFxuICAgICAgICAgICAgICBsc3RhY2tcbiAgICAgICAgICAgIF0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsZW4pIHtcbiAgICAgICAgICAgICAgc3RhY2sgPSBzdGFjay5zbGljZSgwLCAtMSAqIGxlbiAqIDIpO1xuICAgICAgICAgICAgICB2c3RhY2sgPSB2c3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgICBsc3RhY2sgPSBsc3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhY2sucHVzaCh0aGlzLnByb2R1Y3Rpb25zX1thY3Rpb25bMV1dWzBdKTtcbiAgICAgICAgICAgIHZzdGFjay5wdXNoKHl5dmFsLiQpO1xuICAgICAgICAgICAgbHN0YWNrLnB1c2goeXl2YWwuXyQpO1xuICAgICAgICAgICAgbmV3U3RhdGUgPSB0YWJsZVtzdGFja1tzdGFjay5sZW5ndGggLSAyXV1bc3RhY2tbc3RhY2subGVuZ3RoIC0gMV1dO1xuICAgICAgICAgICAgc3RhY2sucHVzaChuZXdTdGF0ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSwgXCJwYXJzZVwiKVxuICB9O1xuICB2YXIgbGV4ZXIgPSAvKiBAX19QVVJFX18gKi8gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZXhlcjIgPSB7XG4gICAgICBFT0Y6IDEsXG4gICAgICBwYXJzZUVycm9yOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBhcnNlRXJyb3Ioc3RyLCBoYXNoKSB7XG4gICAgICAgIGlmICh0aGlzLnl5LnBhcnNlcikge1xuICAgICAgICAgIHRoaXMueXkucGFyc2VyLnBhcnNlRXJyb3Ioc3RyLCBoYXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3RyKTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwYXJzZUVycm9yXCIpLFxuICAgICAgLy8gcmVzZXRzIHRoZSBsZXhlciwgc2V0cyBuZXcgaW5wdXRcbiAgICAgIHNldElucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGlucHV0LCB5eSkge1xuICAgICAgICB0aGlzLnl5ID0geXkgfHwgdGhpcy55eSB8fCB7fTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBpbnB1dDtcbiAgICAgICAgdGhpcy5fbW9yZSA9IHRoaXMuX2JhY2t0cmFjayA9IHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnl5bGluZW5vID0gdGhpcy55eWxlbmcgPSAwO1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2ggPSBcIlwiO1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrID0gW1wiSU5JVElBTFwiXTtcbiAgICAgICAgdGhpcy55eWxsb2MgPSB7XG4gICAgICAgICAgZmlyc3RfbGluZTogMSxcbiAgICAgICAgICBmaXJzdF9jb2x1bW46IDAsXG4gICAgICAgICAgbGFzdF9saW5lOiAxLFxuICAgICAgICAgIGxhc3RfY29sdW1uOiAwXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2UgPSBbMCwgMF07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vZmZzZXQgPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwic2V0SW5wdXRcIiksXG4gICAgICAvLyBjb25zdW1lcyBhbmQgcmV0dXJucyBvbmUgY2hhciBmcm9tIHRoZSBpbnB1dFxuICAgICAgaW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjaCA9IHRoaXMuX2lucHV0WzBdO1xuICAgICAgICB0aGlzLnl5dGV4dCArPSBjaDtcbiAgICAgICAgdGhpcy55eWxlbmcrKztcbiAgICAgICAgdGhpcy5vZmZzZXQrKztcbiAgICAgICAgdGhpcy5tYXRjaCArPSBjaDtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IGNoO1xuICAgICAgICB2YXIgbGluZXMgPSBjaC5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8rKztcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2xpbmUrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtbisrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2VbMV0rKztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pbnB1dCA9IHRoaXMuX2lucHV0LnNsaWNlKDEpO1xuICAgICAgICByZXR1cm4gY2g7XG4gICAgICB9LCBcImlucHV0XCIpLFxuICAgICAgLy8gdW5zaGlmdHMgb25lIGNoYXIgKG9yIGEgc3RyaW5nKSBpbnRvIHRoZSBpbnB1dFxuICAgICAgdW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oY2gpIHtcbiAgICAgICAgdmFyIGxlbiA9IGNoLmxlbmd0aDtcbiAgICAgICAgdmFyIGxpbmVzID0gY2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBjaCArIHRoaXMuX2lucHV0O1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMueXl0ZXh0LnN1YnN0cigwLCB0aGlzLnl5dGV4dC5sZW5ndGggLSBsZW4pO1xuICAgICAgICB0aGlzLm9mZnNldCAtPSBsZW47XG4gICAgICAgIHZhciBvbGRMaW5lcyA9IHRoaXMubWF0Y2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5tYXRjaCA9IHRoaXMubWF0Y2guc3Vic3RyKDAsIHRoaXMubWF0Y2gubGVuZ3RoIC0gMSk7XG4gICAgICAgIHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2hlZC5zdWJzdHIoMCwgdGhpcy5tYXRjaGVkLmxlbmd0aCAtIDEpO1xuICAgICAgICBpZiAobGluZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gLT0gbGluZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgciA9IHRoaXMueXlsbG9jLnJhbmdlO1xuICAgICAgICB0aGlzLnl5bGxvYyA9IHtcbiAgICAgICAgICBmaXJzdF9saW5lOiB0aGlzLnl5bGxvYy5maXJzdF9saW5lLFxuICAgICAgICAgIGxhc3RfbGluZTogdGhpcy55eWxpbmVubyArIDEsXG4gICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gKGxpbmVzLmxlbmd0aCA9PT0gb2xkTGluZXMubGVuZ3RoID8gdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uIDogMCkgKyBvbGRMaW5lc1tvbGRMaW5lcy5sZW5ndGggLSBsaW5lcy5sZW5ndGhdLmxlbmd0aCAtIGxpbmVzWzBdLmxlbmd0aCA6IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbiAtIGxlblxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlID0gW3JbMF0sIHJbMF0gKyB0aGlzLnl5bGVuZyAtIGxlbl07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy55eWxlbmcgPSB0aGlzLnl5dGV4dC5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJ1bnB1dFwiKSxcbiAgICAgIC8vIFdoZW4gY2FsbGVkIGZyb20gYWN0aW9uLCBjYWNoZXMgbWF0Y2hlZCB0ZXh0IGFuZCBhcHBlbmRzIGl0IG9uIG5leHQgYWN0aW9uXG4gICAgICBtb3JlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9tb3JlID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcIm1vcmVcIiksXG4gICAgICAvLyBXaGVuIGNhbGxlZCBmcm9tIGFjdGlvbiwgc2lnbmFscyB0aGUgbGV4ZXIgdGhhdCB0aGlzIHJ1bGUgZmFpbHMgdG8gbWF0Y2ggdGhlIGlucHV0LCBzbyB0aGUgbmV4dCBtYXRjaGluZyBydWxlIChyZWdleCkgc2hvdWxkIGJlIHRlc3RlZCBpbnN0ZWFkLlxuICAgICAgcmVqZWN0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2t0cmFja19sZXhlcikge1xuICAgICAgICAgIHRoaXMuX2JhY2t0cmFjayA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gWW91IGNhbiBvbmx5IGludm9rZSByZWplY3QoKSBpbiB0aGUgbGV4ZXIgd2hlbiB0aGUgbGV4ZXIgaXMgb2YgdGhlIGJhY2t0cmFja2luZyBwZXJzdWFzaW9uIChvcHRpb25zLmJhY2t0cmFja19sZXhlciA9IHRydWUpLlxcblwiICsgdGhpcy5zaG93UG9zaXRpb24oKSwge1xuICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgIHRva2VuOiBudWxsLFxuICAgICAgICAgICAgbGluZTogdGhpcy55eWxpbmVub1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJyZWplY3RcIiksXG4gICAgICAvLyByZXRhaW4gZmlyc3QgbiBjaGFyYWN0ZXJzIG9mIHRoZSBtYXRjaFxuICAgICAgbGVzczogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihuKSB7XG4gICAgICAgIHRoaXMudW5wdXQodGhpcy5tYXRjaC5zbGljZShuKSk7XG4gICAgICB9LCBcImxlc3NcIiksXG4gICAgICAvLyBkaXNwbGF5cyBhbHJlYWR5IG1hdGNoZWQgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICBwYXN0SW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwYXN0ID0gdGhpcy5tYXRjaGVkLnN1YnN0cigwLCB0aGlzLm1hdGNoZWQubGVuZ3RoIC0gdGhpcy5tYXRjaC5sZW5ndGgpO1xuICAgICAgICByZXR1cm4gKHBhc3QubGVuZ3RoID4gMjAgPyBcIi4uLlwiIDogXCJcIikgKyBwYXN0LnN1YnN0cigtMjApLnJlcGxhY2UoL1xcbi9nLCBcIlwiKTtcbiAgICAgIH0sIFwicGFzdElucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdXBjb21pbmcgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICB1cGNvbWluZ0lucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV4dCA9IHRoaXMubWF0Y2g7XG4gICAgICAgIGlmIChuZXh0Lmxlbmd0aCA8IDIwKSB7XG4gICAgICAgICAgbmV4dCArPSB0aGlzLl9pbnB1dC5zdWJzdHIoMCwgMjAgLSBuZXh0Lmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChuZXh0LnN1YnN0cigwLCAyMCkgKyAobmV4dC5sZW5ndGggPiAyMCA/IFwiLi4uXCIgOiBcIlwiKSkucmVwbGFjZSgvXFxuL2csIFwiXCIpO1xuICAgICAgfSwgXCJ1cGNvbWluZ0lucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdGhlIGNoYXJhY3RlciBwb3NpdGlvbiB3aGVyZSB0aGUgbGV4aW5nIGVycm9yIG9jY3VycmVkLCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgc2hvd1Bvc2l0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJlID0gdGhpcy5wYXN0SW5wdXQoKTtcbiAgICAgICAgdmFyIGMgPSBuZXcgQXJyYXkocHJlLmxlbmd0aCArIDEpLmpvaW4oXCItXCIpO1xuICAgICAgICByZXR1cm4gcHJlICsgdGhpcy51cGNvbWluZ0lucHV0KCkgKyBcIlxcblwiICsgYyArIFwiXlwiO1xuICAgICAgfSwgXCJzaG93UG9zaXRpb25cIiksXG4gICAgICAvLyB0ZXN0IHRoZSBsZXhlZCB0b2tlbjogcmV0dXJuIEZBTFNFIHdoZW4gbm90IGEgbWF0Y2gsIG90aGVyd2lzZSByZXR1cm4gdG9rZW5cbiAgICAgIHRlc3RfbWF0Y2g6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obWF0Y2gsIGluZGV4ZWRfcnVsZSkge1xuICAgICAgICB2YXIgdG9rZW4sIGxpbmVzLCBiYWNrdXA7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFja3RyYWNrX2xleGVyKSB7XG4gICAgICAgICAgYmFja3VwID0ge1xuICAgICAgICAgICAgeXlsaW5lbm86IHRoaXMueXlsaW5lbm8sXG4gICAgICAgICAgICB5eWxsb2M6IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogdGhpcy55eWxsb2MuZmlyc3RfbGluZSxcbiAgICAgICAgICAgICAgbGFzdF9saW5lOiB0aGlzLmxhc3RfbGluZSxcbiAgICAgICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgICAgIGxhc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHl5dGV4dDogdGhpcy55eXRleHQsXG4gICAgICAgICAgICBtYXRjaDogdGhpcy5tYXRjaCxcbiAgICAgICAgICAgIG1hdGNoZXM6IHRoaXMubWF0Y2hlcyxcbiAgICAgICAgICAgIG1hdGNoZWQ6IHRoaXMubWF0Y2hlZCxcbiAgICAgICAgICAgIHl5bGVuZzogdGhpcy55eWxlbmcsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgX21vcmU6IHRoaXMuX21vcmUsXG4gICAgICAgICAgICBfaW5wdXQ6IHRoaXMuX2lucHV0LFxuICAgICAgICAgICAgeXk6IHRoaXMueXksXG4gICAgICAgICAgICBjb25kaXRpb25TdGFjazogdGhpcy5jb25kaXRpb25TdGFjay5zbGljZSgwKSxcbiAgICAgICAgICAgIGRvbmU6IHRoaXMuZG9uZVxuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICAgIGJhY2t1cC55eWxsb2MucmFuZ2UgPSB0aGlzLnl5bGxvYy5yYW5nZS5zbGljZSgwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMgPSBtYXRjaFswXS5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gKz0gbGluZXMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueXlsbG9jID0ge1xuICAgICAgICAgIGZpcnN0X2xpbmU6IHRoaXMueXlsbG9jLmxhc3RfbGluZSxcbiAgICAgICAgICBsYXN0X2xpbmU6IHRoaXMueXlsaW5lbm8gKyAxLFxuICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubGVuZ3RoIC0gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubWF0Y2goL1xccj9cXG4/LylbMF0ubGVuZ3RoIDogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4gKyBtYXRjaFswXS5sZW5ndGhcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy55eXRleHQgKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2ggKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2hlcyA9IG1hdGNoO1xuICAgICAgICB0aGlzLnl5bGVuZyA9IHRoaXMueXl0ZXh0Lmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZSA9IFt0aGlzLm9mZnNldCwgdGhpcy5vZmZzZXQgKz0gdGhpcy55eWxlbmddO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX21vcmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fYmFja3RyYWNrID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2lucHV0ID0gdGhpcy5faW5wdXQuc2xpY2UobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IG1hdGNoWzBdO1xuICAgICAgICB0b2tlbiA9IHRoaXMucGVyZm9ybUFjdGlvbi5jYWxsKHRoaXMsIHRoaXMueXksIHRoaXMsIGluZGV4ZWRfcnVsZSwgdGhpcy5jb25kaXRpb25TdGFja1t0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgaWYgKHRoaXMuZG9uZSAmJiB0aGlzLl9pbnB1dCkge1xuICAgICAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9iYWNrdHJhY2spIHtcbiAgICAgICAgICBmb3IgKHZhciBrIGluIGJhY2t1cCkge1xuICAgICAgICAgICAgdGhpc1trXSA9IGJhY2t1cFtrXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sIFwidGVzdF9tYXRjaFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIGluIGlucHV0XG4gICAgICBuZXh0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuRU9GO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5faW5wdXQpIHtcbiAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0b2tlbiwgbWF0Y2gsIHRlbXBNYXRjaCwgaW5kZXg7XG4gICAgICAgIGlmICghdGhpcy5fbW9yZSkge1xuICAgICAgICAgIHRoaXMueXl0ZXh0ID0gXCJcIjtcbiAgICAgICAgICB0aGlzLm1hdGNoID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcnVsZXMgPSB0aGlzLl9jdXJyZW50UnVsZXMoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRlbXBNYXRjaCA9IHRoaXMuX2lucHV0Lm1hdGNoKHRoaXMucnVsZXNbcnVsZXNbaV1dKTtcbiAgICAgICAgICBpZiAodGVtcE1hdGNoICYmICghbWF0Y2ggfHwgdGVtcE1hdGNoWzBdLmxlbmd0aCA+IG1hdGNoWzBdLmxlbmd0aCkpIHtcbiAgICAgICAgICAgIG1hdGNoID0gdGVtcE1hdGNoO1xuICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIpIHtcbiAgICAgICAgICAgICAgdG9rZW4gPSB0aGlzLnRlc3RfbWF0Y2godGVtcE1hdGNoLCBydWxlc1tpXSk7XG4gICAgICAgICAgICAgIGlmICh0b2tlbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmFja3RyYWNrKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMub3B0aW9ucy5mbGV4KSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICB0b2tlbiA9IHRoaXMudGVzdF9tYXRjaChtYXRjaCwgcnVsZXNbaW5kZXhdKTtcbiAgICAgICAgICBpZiAodG9rZW4gIT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5faW5wdXQgPT09IFwiXCIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5FT0Y7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gVW5yZWNvZ25pemVkIHRleHQuXFxuXCIgKyB0aGlzLnNob3dQb3NpdGlvbigpLCB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgdG9rZW46IG51bGwsXG4gICAgICAgICAgICBsaW5lOiB0aGlzLnl5bGluZW5vXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibmV4dFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIHRoYXQgaGFzIGEgdG9rZW5cbiAgICAgIGxleDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBsZXgoKSB7XG4gICAgICAgIHZhciByID0gdGhpcy5uZXh0KCk7XG4gICAgICAgIGlmIChyKSB7XG4gICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubGV4KCk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibGV4XCIpLFxuICAgICAgLy8gYWN0aXZhdGVzIGEgbmV3IGxleGVyIGNvbmRpdGlvbiBzdGF0ZSAocHVzaGVzIHRoZSBuZXcgbGV4ZXIgY29uZGl0aW9uIHN0YXRlIG9udG8gdGhlIGNvbmRpdGlvbiBzdGFjaylcbiAgICAgIGJlZ2luOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGJlZ2luKGNvbmRpdGlvbikge1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrLnB1c2goY29uZGl0aW9uKTtcbiAgICAgIH0sIFwiYmVnaW5cIiksXG4gICAgICAvLyBwb3AgdGhlIHByZXZpb3VzbHkgYWN0aXZlIGxleGVyIGNvbmRpdGlvbiBzdGF0ZSBvZmYgdGhlIGNvbmRpdGlvbiBzdGFja1xuICAgICAgcG9wU3RhdGU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcG9wU3RhdGUoKSB7XG4gICAgICAgIHZhciBuID0gdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxO1xuICAgICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFjay5wb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1swXTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwb3BTdGF0ZVwiKSxcbiAgICAgIC8vIHByb2R1Y2UgdGhlIGxleGVyIHJ1bGUgc2V0IHdoaWNoIGlzIGFjdGl2ZSBmb3IgdGhlIGN1cnJlbnRseSBhY3RpdmUgbGV4ZXIgY29uZGl0aW9uIHN0YXRlXG4gICAgICBfY3VycmVudFJ1bGVzOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIF9jdXJyZW50UnVsZXMoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAmJiB0aGlzLmNvbmRpdGlvblN0YWNrW3RoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25zW3RoaXMuY29uZGl0aW9uU3RhY2tbdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxXV0ucnVsZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uc1tcIklOSVRJQUxcIl0ucnVsZXM7XG4gICAgICAgIH1cbiAgICAgIH0sIFwiX2N1cnJlbnRSdWxlc1wiKSxcbiAgICAgIC8vIHJldHVybiB0aGUgY3VycmVudGx5IGFjdGl2ZSBsZXhlciBjb25kaXRpb24gc3RhdGU7IHdoZW4gYW4gaW5kZXggYXJndW1lbnQgaXMgcHJvdmlkZWQgaXQgcHJvZHVjZXMgdGhlIE4tdGggcHJldmlvdXMgY29uZGl0aW9uIHN0YXRlLCBpZiBhdmFpbGFibGVcbiAgICAgIHRvcFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHRvcFN0YXRlKG4pIHtcbiAgICAgICAgbiA9IHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMSAtIE1hdGguYWJzKG4gfHwgMCk7XG4gICAgICAgIGlmIChuID49IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1tuXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gXCJJTklUSUFMXCI7XG4gICAgICAgIH1cbiAgICAgIH0sIFwidG9wU3RhdGVcIiksXG4gICAgICAvLyBhbGlhcyBmb3IgYmVnaW4oY29uZGl0aW9uKVxuICAgICAgcHVzaFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHB1c2hTdGF0ZShjb25kaXRpb24pIHtcbiAgICAgICAgdGhpcy5iZWdpbihjb25kaXRpb24pO1xuICAgICAgfSwgXCJwdXNoU3RhdGVcIiksXG4gICAgICAvLyByZXR1cm4gdGhlIG51bWJlciBvZiBzdGF0ZXMgY3VycmVudGx5IG9uIHRoZSBzdGFja1xuICAgICAgc3RhdGVTdGFja1NpemU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gc3RhdGVTdGFja1NpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aDtcbiAgICAgIH0sIFwic3RhdGVTdGFja1NpemVcIiksXG4gICAgICBvcHRpb25zOiB7IFwiY2FzZS1pbnNlbnNpdGl2ZVwiOiB0cnVlIH0sXG4gICAgICBwZXJmb3JtQWN0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGFub255bW91cyh5eSwgeXlfLCAkYXZvaWRpbmdfbmFtZV9jb2xsaXNpb25zLCBZWV9TVEFSVCkge1xuICAgICAgICB2YXIgWVlTVEFURSA9IFlZX1NUQVJUO1xuICAgICAgICBzd2l0Y2ggKCRhdm9pZGluZ19uYW1lX2NvbGxpc2lvbnMpIHtcbiAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICByZXR1cm4gNjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHJldHVybiA4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgcmV0dXJuIDg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gNjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHJldHVybiA3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgcmV0dXJuIDEzO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgcmV0dXJuIDE0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgcmV0dXJuIDExO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0sIFwiYW5vbnltb3VzXCIpLFxuICAgICAgcnVsZXM6IFsvXig/OlxccyolJS4qKS9pLCAvXig/OmlzaGlrYXdhLWJldGFcXGIpL2ksIC9eKD86aXNoaWthd2FcXGIpL2ksIC9eKD86W1xcc10rW1xcbl0pL2ksIC9eKD86W1xcbl0rKS9pLCAvXig/OltcXHNdKykvaSwgL14oPzpbXlxcbl0rKS9pLCAvXig/OiQpL2ldLFxuICAgICAgY29uZGl0aW9uczogeyBcIklOSVRJQUxcIjogeyBcInJ1bGVzXCI6IFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3XSwgXCJpbmNsdXNpdmVcIjogdHJ1ZSB9IH1cbiAgICB9O1xuICAgIHJldHVybiBsZXhlcjI7XG4gIH0pKCk7XG4gIHBhcnNlcjIubGV4ZXIgPSBsZXhlcjtcbiAgZnVuY3Rpb24gUGFyc2VyKCkge1xuICAgIHRoaXMueXkgPSB7fTtcbiAgfVxuICBfX25hbWUoUGFyc2VyLCBcIlBhcnNlclwiKTtcbiAgUGFyc2VyLnByb3RvdHlwZSA9IHBhcnNlcjI7XG4gIHBhcnNlcjIuUGFyc2VyID0gUGFyc2VyO1xuICByZXR1cm4gbmV3IFBhcnNlcigpO1xufSkoKTtcbnBhcnNlci5wYXJzZXIgPSBwYXJzZXI7XG52YXIgaXNoaWthd2FfZGVmYXVsdCA9IHBhcnNlcjtcblxuLy8gc3JjL2RpYWdyYW1zL2lzaGlrYXdhL2lzaGlrYXdhRGIudHNcbnZhciBJc2hpa2F3YURCID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0YWNrID0gW107XG4gICAgdGhpcy5jbGVhciA9IHRoaXMuY2xlYXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLmFkZE5vZGUgPSB0aGlzLmFkZE5vZGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLmdldFJvb3QgPSB0aGlzLmdldFJvb3QuYmluZCh0aGlzKTtcbiAgfVxuICBzdGF0aWMge1xuICAgIF9fbmFtZSh0aGlzLCBcIklzaGlrYXdhREJcIik7XG4gIH1cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5yb290ID0gdm9pZCAwO1xuICAgIHRoaXMuc3RhY2sgPSBbXTtcbiAgICB0aGlzLmJhc2VMZXZlbCA9IHZvaWQgMDtcbiAgICBjbGVhcigpO1xuICB9XG4gIGdldFJvb3QoKSB7XG4gICAgcmV0dXJuIHRoaXMucm9vdDtcbiAgfVxuICBhZGROb2RlKHJhd0xldmVsLCB0ZXh0KSB7XG4gICAgY29uc3QgbGFiZWwgPSBjb21tb25fZGVmYXVsdC5zYW5pdGl6ZVRleHQodGV4dCwgZ2V0Q29uZmlnKCkpO1xuICAgIGlmICghdGhpcy5yb290KSB7XG4gICAgICB0aGlzLnJvb3QgPSB7IHRleHQ6IGxhYmVsLCBjaGlsZHJlbjogW10gfTtcbiAgICAgIHRoaXMuc3RhY2sgPSBbeyBsZXZlbDogMCwgbm9kZTogdGhpcy5yb290IH1dO1xuICAgICAgc2V0RGlhZ3JhbVRpdGxlKGxhYmVsKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5iYXNlTGV2ZWwgPz89IHJhd0xldmVsO1xuICAgIGxldCBsZXZlbCA9IHJhd0xldmVsIC0gdGhpcy5iYXNlTGV2ZWwgKyAxO1xuICAgIGlmIChsZXZlbCA8PSAwKSB7XG4gICAgICBsZXZlbCA9IDE7XG4gICAgfVxuICAgIHdoaWxlICh0aGlzLnN0YWNrLmxlbmd0aCA+IDEgJiYgdGhpcy5zdGFja1t0aGlzLnN0YWNrLmxlbmd0aCAtIDFdLmxldmVsID49IGxldmVsKSB7XG4gICAgICB0aGlzLnN0YWNrLnBvcCgpO1xuICAgIH1cbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLnN0YWNrW3RoaXMuc3RhY2subGVuZ3RoIC0gMV0ubm9kZTtcbiAgICBjb25zdCBub2RlID0geyB0ZXh0OiBsYWJlbCwgY2hpbGRyZW46IFtdIH07XG4gICAgcGFyZW50LmNoaWxkcmVuLnB1c2gobm9kZSk7XG4gICAgdGhpcy5zdGFjay5wdXNoKHsgbGV2ZWwsIG5vZGUgfSk7XG4gIH1cbiAgZ2V0QWNjVGl0bGUoKSB7XG4gICAgcmV0dXJuIGdldEFjY1RpdGxlKCk7XG4gIH1cbiAgc2V0QWNjVGl0bGUodGl0bGUpIHtcbiAgICBzZXRBY2NUaXRsZSh0aXRsZSk7XG4gIH1cbiAgZ2V0QWNjRGVzY3JpcHRpb24oKSB7XG4gICAgcmV0dXJuIGdldEFjY0Rlc2NyaXB0aW9uKCk7XG4gIH1cbiAgc2V0QWNjRGVzY3JpcHRpb24oZGVzY3JpcHRpb24pIHtcbiAgICBzZXRBY2NEZXNjcmlwdGlvbihkZXNjcmlwdGlvbik7XG4gIH1cbiAgZ2V0RGlhZ3JhbVRpdGxlKCkge1xuICAgIHJldHVybiBnZXREaWFncmFtVGl0bGUoKTtcbiAgfVxuICBzZXREaWFncmFtVGl0bGUodGl0bGUpIHtcbiAgICBzZXREaWFncmFtVGl0bGUodGl0bGUpO1xuICB9XG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMvaXNoaWthd2EvaXNoaWthd2FSZW5kZXJlci50c1xuaW1wb3J0IHJvdWdoIGZyb20gXCJyb3VnaGpzXCI7XG52YXIgRk9OVF9TSVpFX0RFRkFVTFQgPSAxNDtcbnZhciBTUElORV9CQVNFX0xFTkdUSCA9IDI1MDtcbnZhciBCT05FX1NUVUIgPSAzMDtcbnZhciBCT05FX0JBU0UgPSA2MDtcbnZhciBCT05FX1BFUl9DSElMRCA9IDU7XG52YXIgQU5HTEUgPSA4MiAqIE1hdGguUEkgLyAxODA7XG52YXIgQ09TX0EgPSBNYXRoLmNvcyhBTkdMRSk7XG52YXIgU0lOX0EgPSBNYXRoLnNpbihBTkdMRSk7XG52YXIgYXBwbHlQYWRkZWRWaWV3Qm94ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoc3ZnRWwsIHBhZCwgbWF4VykgPT4ge1xuICBjb25zdCBiYm94ID0gc3ZnRWwubm9kZSgpLmdldEJCb3goKTtcbiAgY29uc3QgdyA9IGJib3gud2lkdGggKyBwYWQgKiAyO1xuICBjb25zdCBoID0gYmJveC5oZWlnaHQgKyBwYWQgKiAyO1xuICBjb25maWd1cmVTdmdTaXplKHN2Z0VsLCBoLCB3LCBtYXhXKTtcbiAgc3ZnRWwuYXR0cihcInZpZXdCb3hcIiwgYCR7YmJveC54IC0gcGFkfSAke2Jib3gueSAtIHBhZH0gJHt3fSAke2h9YCk7XG59LCBcImFwcGx5UGFkZGVkVmlld0JveFwiKTtcbnZhciBkcmF3ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoX3RleHQsIGlkLCBfdmVyc2lvbiwgZGlhZ3JhbTIpID0+IHtcbiAgY29uc3QgZGIgPSBkaWFncmFtMi5kYjtcbiAgY29uc3Qgcm9vdCA9IGRiLmdldFJvb3QoKTtcbiAgaWYgKCFyb290KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGRyYXdDb25maWcgPSBnZXRDb25maWcoKTtcbiAgY29uc3QgeyBsb29rLCBoYW5kRHJhd25TZWVkLCB0aGVtZVZhcmlhYmxlcyB9ID0gZHJhd0NvbmZpZztcbiAgY29uc3QgZm9udFNpemUgPSBwYXJzZUZvbnRTaXplKGRyYXdDb25maWcuZm9udFNpemUpWzBdID8/IEZPTlRfU0laRV9ERUZBVUxUO1xuICBjb25zdCBpc0hhbmREcmF3biA9IGxvb2sgPT09IFwiaGFuZERyYXduXCI7XG4gIGNvbnN0IGNhdXNlcyA9IHJvb3QuY2hpbGRyZW4gPz8gW107XG4gIGNvbnN0IHBhZGRpbmcgPSBkcmF3Q29uZmlnLmlzaGlrYXdhPy5kaWFncmFtUGFkZGluZyA/PyAyMDtcbiAgY29uc3QgdXNlTWF4V2lkdGggPSBkcmF3Q29uZmlnLmlzaGlrYXdhPy51c2VNYXhXaWR0aCA/PyBmYWxzZTtcbiAgY29uc3Qgc3ZnID0gc2VsZWN0U3ZnRWxlbWVudChpZCk7XG4gIGNvbnN0IGcgPSBzdmcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJpc2hpa2F3YVwiKTtcbiAgY29uc3Qgcm91Z2hTdmcgPSBpc0hhbmREcmF3biA/IHJvdWdoLnN2Zyhzdmcubm9kZSgpKSA6IHZvaWQgMDtcbiAgY29uc3Qgcm91Z2hDb250ZXh0ID0gcm91Z2hTdmcgPyB7XG4gICAgcm91Z2hTdmcsXG4gICAgc2VlZDogaGFuZERyYXduU2VlZCA/PyAwLFxuICAgIGxpbmVDb2xvcjogdGhlbWVWYXJpYWJsZXM/LmxpbmVDb2xvciA/PyBcIiMzMzNcIixcbiAgICBmaWxsQ29sb3I6IHRoZW1lVmFyaWFibGVzPy5tYWluQmtnID8/IFwiI2ZmZlwiXG4gIH0gOiB2b2lkIDA7XG4gIGNvbnN0IG1hcmtlcklkID0gYGlzaGlrYXdhLWFycm93LSR7aWR9YDtcbiAgaWYgKCFpc0hhbmREcmF3bikge1xuICAgIGcuYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIG1hcmtlcklkKS5hdHRyKFwidmlld0JveFwiLCBcIjAgMCAxMCAxMFwiKS5hdHRyKFwicmVmWFwiLCAwKS5hdHRyKFwicmVmWVwiLCA1KS5hdHRyKFwibWFya2VyV2lkdGhcIiwgNikuYXR0cihcIm1hcmtlckhlaWdodFwiLCA2KS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSAxMCAwIEwgMCA1IEwgMTAgMTAgWlwiKS5hdHRyKFwiY2xhc3NcIiwgXCJpc2hpa2F3YS1hcnJvd1wiKTtcbiAgfVxuICBsZXQgc3BpbmVYID0gMDtcbiAgbGV0IHNwaW5lWSA9IFNQSU5FX0JBU0VfTEVOR1RIO1xuICBjb25zdCBzcGluZUxpbmUgPSBpc0hhbmREcmF3biA/IHZvaWQgMCA6IGRyYXdMaW5lKGcsIHNwaW5lWCwgc3BpbmVZLCBzcGluZVgsIHNwaW5lWSwgXCJpc2hpa2F3YS1zcGluZVwiKTtcbiAgZHJhd0hlYWQoZywgc3BpbmVYLCBzcGluZVksIHJvb3QudGV4dCwgZm9udFNpemUsIHJvdWdoQ29udGV4dCk7XG4gIGlmICghY2F1c2VzLmxlbmd0aCkge1xuICAgIGlmIChpc0hhbmREcmF3bikge1xuICAgICAgZHJhd0xpbmUoZywgc3BpbmVYLCBzcGluZVksIHNwaW5lWCwgc3BpbmVZLCBcImlzaGlrYXdhLXNwaW5lXCIsIHJvdWdoQ29udGV4dCk7XG4gICAgfVxuICAgIGFwcGx5UGFkZGVkVmlld0JveChzdmcsIHBhZGRpbmcsIHVzZU1heFdpZHRoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgc3BpbmVYIC09IDIwO1xuICBjb25zdCB1cHBlckNhdXNlcyA9IGNhdXNlcy5maWx0ZXIoKF8sIGkpID0+IGkgJSAyID09PSAwKTtcbiAgY29uc3QgbG93ZXJDYXVzZXMgPSBjYXVzZXMuZmlsdGVyKChfLCBpKSA9PiBpICUgMiA9PT0gMSk7XG4gIGNvbnN0IHVwcGVyU3RhdHMgPSBzaWRlU3RhdHModXBwZXJDYXVzZXMpO1xuICBjb25zdCBsb3dlclN0YXRzID0gc2lkZVN0YXRzKGxvd2VyQ2F1c2VzKTtcbiAgY29uc3QgZGVzY2VuZGFudFRvdGFsID0gdXBwZXJTdGF0cy50b3RhbCArIGxvd2VyU3RhdHMudG90YWw7XG4gIGxldCB1cHBlckxlbiA9IFNQSU5FX0JBU0VfTEVOR1RIO1xuICBsZXQgbG93ZXJMZW4gPSBTUElORV9CQVNFX0xFTkdUSDtcbiAgaWYgKGRlc2NlbmRhbnRUb3RhbCA+IDApIHtcbiAgICBjb25zdCBwb29sID0gU1BJTkVfQkFTRV9MRU5HVEggKiAyO1xuICAgIGNvbnN0IG1pbkxlbiA9IFNQSU5FX0JBU0VfTEVOR1RIICogMC4zO1xuICAgIHVwcGVyTGVuID0gTWF0aC5tYXgobWluTGVuLCBwb29sICogKHVwcGVyU3RhdHMudG90YWwgLyBkZXNjZW5kYW50VG90YWwpKTtcbiAgICBsb3dlckxlbiA9IE1hdGgubWF4KG1pbkxlbiwgcG9vbCAqIChsb3dlclN0YXRzLnRvdGFsIC8gZGVzY2VuZGFudFRvdGFsKSk7XG4gIH1cbiAgY29uc3QgbWluU3BhY2luZyA9IGZvbnRTaXplICogMjtcbiAgdXBwZXJMZW4gPSBNYXRoLm1heCh1cHBlckxlbiwgdXBwZXJTdGF0cy5tYXggKiBtaW5TcGFjaW5nKTtcbiAgbG93ZXJMZW4gPSBNYXRoLm1heChsb3dlckxlbiwgbG93ZXJTdGF0cy5tYXggKiBtaW5TcGFjaW5nKTtcbiAgc3BpbmVZID0gTWF0aC5tYXgodXBwZXJMZW4sIFNQSU5FX0JBU0VfTEVOR1RIKTtcbiAgaWYgKHNwaW5lTGluZSkge1xuICAgIHNwaW5lTGluZS5hdHRyKFwieTFcIiwgc3BpbmVZKS5hdHRyKFwieTJcIiwgc3BpbmVZKTtcbiAgfVxuICBnLnNlbGVjdChcIi5pc2hpa2F3YS1oZWFkLWdyb3VwXCIpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgwLCR7c3BpbmVZfSlgKTtcbiAgY29uc3QgcGFpckNvdW50ID0gTWF0aC5jZWlsKGNhdXNlcy5sZW5ndGggLyAyKTtcbiAgZm9yIChsZXQgcCA9IDA7IHAgPCBwYWlyQ291bnQ7IHArKykge1xuICAgIGNvbnN0IHBnID0gZy5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImlzaGlrYXdhLXBhaXJcIik7XG4gICAgZm9yIChjb25zdCBbY2F1c2UsIGRpciwgbGVuXSBvZiBbXG4gICAgICBbY2F1c2VzW3AgKiAyXSwgLTEsIHVwcGVyTGVuXSxcbiAgICAgIFtjYXVzZXNbcCAqIDIgKyAxXSwgMSwgbG93ZXJMZW5dXG4gICAgXSkge1xuICAgICAgaWYgKGNhdXNlKSB7XG4gICAgICAgIGRyYXdCcmFuY2gocGcsIGNhdXNlLCBzcGluZVgsIHNwaW5lWSwgZGlyLCBsZW4sIGZvbnRTaXplLCByb3VnaENvbnRleHQpO1xuICAgICAgfVxuICAgIH1cbiAgICBzcGluZVggPSBwZy5zZWxlY3RBbGwoXCJ0ZXh0XCIpLm5vZGVzKCkucmVkdWNlKChsZWZ0LCBuKSA9PiBNYXRoLm1pbihsZWZ0LCBuLmdldEJCb3goKS54KSwgSW5maW5pdHkpO1xuICB9XG4gIGlmIChpc0hhbmREcmF3bikge1xuICAgIGRyYXdMaW5lKGcsIHNwaW5lWCwgc3BpbmVZLCAwLCBzcGluZVksIFwiaXNoaWthd2Etc3BpbmVcIiwgcm91Z2hDb250ZXh0KTtcbiAgfSBlbHNlIHtcbiAgICBzcGluZUxpbmUuYXR0cihcIngxXCIsIHNwaW5lWCk7XG4gICAgY29uc3QgbWFya2VyVXJsID0gYHVybCgjJHttYXJrZXJJZH0pYDtcbiAgICBnLnNlbGVjdEFsbChcImxpbmUuaXNoaWthd2EtYnJhbmNoLCBsaW5lLmlzaGlrYXdhLXN1Yi1icmFuY2hcIikuYXR0cihcIm1hcmtlci1zdGFydFwiLCBtYXJrZXJVcmwpO1xuICB9XG4gIGFwcGx5UGFkZGVkVmlld0JveChzdmcsIHBhZGRpbmcsIHVzZU1heFdpZHRoKTtcbn0sIFwiZHJhd1wiKTtcbnZhciBzaWRlU3RhdHMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChub2RlcykgPT4ge1xuICBjb25zdCBjb3VudERlc2NlbmRhbnRzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgobm9kZSkgPT4gbm9kZS5jaGlsZHJlbi5yZWR1Y2UoKHN1bSwgY2hpbGQpID0+IHN1bSArIDEgKyBjb3VudERlc2NlbmRhbnRzKGNoaWxkKSwgMCksIFwiY291bnREZXNjZW5kYW50c1wiKTtcbiAgcmV0dXJuIG5vZGVzLnJlZHVjZShcbiAgICAoc3RhdHMsIG5vZGUpID0+IHtcbiAgICAgIGNvbnN0IGRlc2NlbmRhbnRzID0gY291bnREZXNjZW5kYW50cyhub2RlKTtcbiAgICAgIHN0YXRzLnRvdGFsICs9IGRlc2NlbmRhbnRzO1xuICAgICAgc3RhdHMubWF4ID0gTWF0aC5tYXgoc3RhdHMubWF4LCBkZXNjZW5kYW50cyk7XG4gICAgICByZXR1cm4gc3RhdHM7XG4gICAgfSxcbiAgICB7IHRvdGFsOiAwLCBtYXg6IDAgfVxuICApO1xufSwgXCJzaWRlU3RhdHNcIik7XG52YXIgZHJhd0hlYWQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChzdmcsIHgsIHksIGxhYmVsLCBmb250U2l6ZSwgcm91Z2hDb250ZXh0KSA9PiB7XG4gIGNvbnN0IG1heENoYXJzID0gTWF0aC5tYXgoNiwgTWF0aC5mbG9vcigxMTAgLyAoZm9udFNpemUgKiAwLjYpKSk7XG4gIGNvbnN0IGhlYWRHcm91cCA9IHN2Zy5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImlzaGlrYXdhLWhlYWQtZ3JvdXBcIikuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7eH0sJHt5fSlgKTtcbiAgY29uc3QgdGV4dEVsID0gZHJhd011bHRpbGluZVRleHQoXG4gICAgaGVhZEdyb3VwLFxuICAgIHdyYXBUZXh0KGxhYmVsLCBtYXhDaGFycyksXG4gICAgMCxcbiAgICAwLFxuICAgIFwiaXNoaWthd2EtaGVhZC1sYWJlbFwiLFxuICAgIFwic3RhcnRcIixcbiAgICBmb250U2l6ZVxuICApO1xuICBjb25zdCB0YiA9IHRleHRFbC5ub2RlKCkuZ2V0QkJveCgpO1xuICBjb25zdCB3ID0gTWF0aC5tYXgoNjAsIHRiLndpZHRoICsgNik7XG4gIGNvbnN0IGggPSBNYXRoLm1heCg0MCwgdGIuaGVpZ2h0ICogMiArIDQwKTtcbiAgY29uc3QgaGVhZFBhdGggPSBgTSAwICR7LWggLyAyfSBMIDAgJHtoIC8gMn0gUSAke3cgKiAyLjR9IDAgMCAkey1oIC8gMn0gWmA7XG4gIGlmIChyb3VnaENvbnRleHQpIHtcbiAgICBjb25zdCByb3VnaE5vZGUgPSByb3VnaENvbnRleHQucm91Z2hTdmcucGF0aChoZWFkUGF0aCwge1xuICAgICAgcm91Z2huZXNzOiAxLjUsXG4gICAgICBzZWVkOiByb3VnaENvbnRleHQuc2VlZCxcbiAgICAgIGZpbGw6IHJvdWdoQ29udGV4dC5maWxsQ29sb3IsXG4gICAgICBmaWxsU3R5bGU6IFwiaGFjaHVyZVwiLFxuICAgICAgZmlsbFdlaWdodDogMi41LFxuICAgICAgaGFjaHVyZUdhcDogNSxcbiAgICAgIHN0cm9rZTogcm91Z2hDb250ZXh0LmxpbmVDb2xvcixcbiAgICAgIHN0cm9rZVdpZHRoOiAyXG4gICAgfSk7XG4gICAgaGVhZEdyb3VwLmluc2VydCgoKSA9PiByb3VnaE5vZGUsIFwiOmZpcnN0LWNoaWxkXCIpLmF0dHIoXCJjbGFzc1wiLCBcImlzaGlrYXdhLWhlYWRcIik7XG4gIH0gZWxzZSB7XG4gICAgaGVhZEdyb3VwLmluc2VydChcInBhdGhcIiwgXCI6Zmlyc3QtY2hpbGRcIikuYXR0cihcImNsYXNzXCIsIFwiaXNoaWthd2EtaGVhZFwiKS5hdHRyKFwiZFwiLCBoZWFkUGF0aCk7XG4gIH1cbiAgdGV4dEVsLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgkeyh3IC0gdGIud2lkdGgpIC8gMiAtIHRiLnggKyAzfSwkey10Yi55IC0gdGIuaGVpZ2h0IC8gMn0pYCk7XG59LCBcImRyYXdIZWFkXCIpO1xudmFyIGZsYXR0ZW5UcmVlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoY2hpbGRyZW4sIGRpcmVjdGlvbikgPT4ge1xuICBjb25zdCBlbnRyaWVzID0gW107XG4gIGNvbnN0IHlPcmRlciA9IFtdO1xuICBjb25zdCB3YWxrID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgobm9kZXMsIHBpZCwgZGVwdGgpID0+IHtcbiAgICBjb25zdCBvcmRlcmVkID0gZGlyZWN0aW9uID09PSAtMSA/IFsuLi5ub2Rlc10ucmV2ZXJzZSgpIDogbm9kZXM7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBvcmRlcmVkKSB7XG4gICAgICBjb25zdCBpZHggPSBlbnRyaWVzLmxlbmd0aDtcbiAgICAgIGNvbnN0IGdjID0gY2hpbGQuY2hpbGRyZW4gPz8gW107XG4gICAgICBlbnRyaWVzLnB1c2goe1xuICAgICAgICBkZXB0aCxcbiAgICAgICAgdGV4dDogd3JhcFRleHQoY2hpbGQudGV4dCwgMTUpLFxuICAgICAgICBwYXJlbnRJbmRleDogcGlkLFxuICAgICAgICBjaGlsZENvdW50OiBnYy5sZW5ndGhcbiAgICAgIH0pO1xuICAgICAgaWYgKGRlcHRoICUgMiA9PT0gMCkge1xuICAgICAgICB5T3JkZXIucHVzaChpZHgpO1xuICAgICAgICBpZiAoZ2MubGVuZ3RoKSB7XG4gICAgICAgICAgd2FsayhnYywgaWR4LCBkZXB0aCArIDEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZ2MubGVuZ3RoKSB7XG4gICAgICAgICAgd2FsayhnYywgaWR4LCBkZXB0aCArIDEpO1xuICAgICAgICB9XG4gICAgICAgIHlPcmRlci5wdXNoKGlkeCk7XG4gICAgICB9XG4gICAgfVxuICB9LCBcIndhbGtcIik7XG4gIHdhbGsoY2hpbGRyZW4sIC0xLCAyKTtcbiAgcmV0dXJuIHsgZW50cmllcywgeU9yZGVyIH07XG59LCBcImZsYXR0ZW5UcmVlXCIpO1xudmFyIGRyYXdDYXVzZUxhYmVsID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoc3ZnLCB0ZXh0LCB4LCB5LCBkaXJlY3Rpb24sIGZvbnRTaXplLCByb3VnaENvbnRleHQpID0+IHtcbiAgY29uc3QgbGcgPSBzdmcuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJpc2hpa2F3YS1sYWJlbC1ncm91cFwiKTtcbiAgY29uc3QgbHQgPSBkcmF3TXVsdGlsaW5lVGV4dChcbiAgICBsZyxcbiAgICB0ZXh0LFxuICAgIHgsXG4gICAgeSArIDExICogZGlyZWN0aW9uLFxuICAgIFwiaXNoaWthd2EtbGFiZWwgY2F1c2VcIixcbiAgICBcIm1pZGRsZVwiLFxuICAgIGZvbnRTaXplXG4gICk7XG4gIGNvbnN0IHRiID0gbHQubm9kZSgpLmdldEJCb3goKTtcbiAgaWYgKHJvdWdoQ29udGV4dCkge1xuICAgIGNvbnN0IHJvdWdoTm9kZSA9IHJvdWdoQ29udGV4dC5yb3VnaFN2Zy5yZWN0YW5nbGUoXG4gICAgICB0Yi54IC0gMjAsXG4gICAgICB0Yi55IC0gMixcbiAgICAgIHRiLndpZHRoICsgNDAsXG4gICAgICB0Yi5oZWlnaHQgKyA0LFxuICAgICAge1xuICAgICAgICByb3VnaG5lc3M6IDEuNSxcbiAgICAgICAgc2VlZDogcm91Z2hDb250ZXh0LnNlZWQsXG4gICAgICAgIGZpbGw6IHJvdWdoQ29udGV4dC5maWxsQ29sb3IsXG4gICAgICAgIGZpbGxTdHlsZTogXCJoYWNodXJlXCIsXG4gICAgICAgIGZpbGxXZWlnaHQ6IDIuNSxcbiAgICAgICAgaGFjaHVyZUdhcDogNSxcbiAgICAgICAgc3Ryb2tlOiByb3VnaENvbnRleHQubGluZUNvbG9yLFxuICAgICAgICBzdHJva2VXaWR0aDogMlxuICAgICAgfVxuICAgICk7XG4gICAgbGcuaW5zZXJ0KCgpID0+IHJvdWdoTm9kZSwgXCI6Zmlyc3QtY2hpbGRcIikuYXR0cihcImNsYXNzXCIsIFwiaXNoaWthd2EtbGFiZWwtYm94XCIpO1xuICB9IGVsc2Uge1xuICAgIGxnLmluc2VydChcInJlY3RcIiwgXCI6Zmlyc3QtY2hpbGRcIikuYXR0cihcImNsYXNzXCIsIFwiaXNoaWthd2EtbGFiZWwtYm94XCIpLmF0dHIoXCJ4XCIsIHRiLnggLSAyMCkuYXR0cihcInlcIiwgdGIueSAtIDIpLmF0dHIoXCJ3aWR0aFwiLCB0Yi53aWR0aCArIDQwKS5hdHRyKFwiaGVpZ2h0XCIsIHRiLmhlaWdodCArIDQpO1xuICB9XG59LCBcImRyYXdDYXVzZUxhYmVsXCIpO1xudmFyIGRyYXdBcnJvd01hcmtlciA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGcsIHgsIHksIGR4LCBkeSwgcm91Z2hDb250ZXh0KSA9PiB7XG4gIGNvbnN0IGxlbiA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gIGlmIChsZW4gPT09IDApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgdXggPSBkeCAvIGxlbjtcbiAgY29uc3QgdXkgPSBkeSAvIGxlbjtcbiAgY29uc3QgcyA9IDY7XG4gIGNvbnN0IHB4ID0gLXV5ICogcztcbiAgY29uc3QgcHkgPSB1eCAqIHM7XG4gIGNvbnN0IHRpcFggPSB4O1xuICBjb25zdCB0aXBZID0geTtcbiAgY29uc3QgZCA9IGBNICR7dGlwWH0gJHt0aXBZfSBMICR7dGlwWCAtIHV4ICogcyAqIDIgKyBweH0gJHt0aXBZIC0gdXkgKiBzICogMiArIHB5fSBMICR7dGlwWCAtIHV4ICogcyAqIDIgLSBweH0gJHt0aXBZIC0gdXkgKiBzICogMiAtIHB5fSBaYDtcbiAgY29uc3Qgcm91Z2hOb2RlID0gcm91Z2hDb250ZXh0LnJvdWdoU3ZnLnBhdGgoZCwge1xuICAgIHJvdWdobmVzczogMSxcbiAgICBzZWVkOiByb3VnaENvbnRleHQuc2VlZCxcbiAgICBmaWxsOiByb3VnaENvbnRleHQubGluZUNvbG9yLFxuICAgIGZpbGxTdHlsZTogXCJzb2xpZFwiLFxuICAgIHN0cm9rZTogcm91Z2hDb250ZXh0LmxpbmVDb2xvcixcbiAgICBzdHJva2VXaWR0aDogMVxuICB9KTtcbiAgZy5hcHBlbmQoKCkgPT4gcm91Z2hOb2RlKTtcbn0sIFwiZHJhd0Fycm93TWFya2VyXCIpO1xudmFyIGRyYXdCcmFuY2ggPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChzdmcsIG5vZGUsIHN0YXJ0WCwgc3RhcnRZLCBkaXJlY3Rpb24sIGxlbmd0aCwgZm9udFNpemUsIHJvdWdoQ29udGV4dCkgPT4ge1xuICBjb25zdCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4gPz8gW107XG4gIGNvbnN0IGxpbmVMZW4gPSBsZW5ndGggKiAoY2hpbGRyZW4ubGVuZ3RoID8gMSA6IDAuMik7XG4gIGNvbnN0IGR4ID0gLUNPU19BICogbGluZUxlbjtcbiAgY29uc3QgZHkgPSBTSU5fQSAqIGxpbmVMZW4gKiBkaXJlY3Rpb247XG4gIGNvbnN0IGVuZFggPSBzdGFydFggKyBkeDtcbiAgY29uc3QgZW5kWSA9IHN0YXJ0WSArIGR5O1xuICBkcmF3TGluZShzdmcsIHN0YXJ0WCwgc3RhcnRZLCBlbmRYLCBlbmRZLCBcImlzaGlrYXdhLWJyYW5jaFwiLCByb3VnaENvbnRleHQpO1xuICBpZiAocm91Z2hDb250ZXh0KSB7XG4gICAgZHJhd0Fycm93TWFya2VyKHN2Zywgc3RhcnRYLCBzdGFydFksIHN0YXJ0WCAtIGVuZFgsIHN0YXJ0WSAtIGVuZFksIHJvdWdoQ29udGV4dCk7XG4gIH1cbiAgZHJhd0NhdXNlTGFiZWwoc3ZnLCBub2RlLnRleHQsIGVuZFgsIGVuZFksIGRpcmVjdGlvbiwgZm9udFNpemUsIHJvdWdoQ29udGV4dCk7XG4gIGlmICghY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHsgZW50cmllcywgeU9yZGVyIH0gPSBmbGF0dGVuVHJlZShjaGlsZHJlbiwgZGlyZWN0aW9uKTtcbiAgY29uc3QgZW50cnlDb3VudCA9IGVudHJpZXMubGVuZ3RoO1xuICBjb25zdCB5cyA9IG5ldyBBcnJheShlbnRyeUNvdW50KTtcbiAgZm9yIChjb25zdCBbc2xvdCwgZW50cnlJZHhdIG9mIHlPcmRlci5lbnRyaWVzKCkpIHtcbiAgICB5c1tlbnRyeUlkeF0gPSBzdGFydFkgKyBkeSAqICgoc2xvdCArIDEpIC8gKGVudHJ5Q291bnQgKyAxKSk7XG4gIH1cbiAgY29uc3QgYm9uZXMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICBib25lcy5zZXQoLTEsIHtcbiAgICB4MDogc3RhcnRYLFxuICAgIHkwOiBzdGFydFksXG4gICAgeDE6IGVuZFgsXG4gICAgeTE6IGVuZFksXG4gICAgY2hpbGRDb3VudDogY2hpbGRyZW4ubGVuZ3RoLFxuICAgIGNoaWxkcmVuRHJhd246IDBcbiAgfSk7XG4gIGNvbnN0IGRpYWdvbmFsWCA9IC1DT1NfQTtcbiAgY29uc3QgZGlhZ29uYWxZID0gU0lOX0EgKiBkaXJlY3Rpb247XG4gIGNvbnN0IG9kZExhYmVsID0gZGlyZWN0aW9uIDwgMCA/IFwiaXNoaWthd2EtbGFiZWwgdXBcIiA6IFwiaXNoaWthd2EtbGFiZWwgZG93blwiO1xuICBmb3IgKGNvbnN0IFtpLCBlXSBvZiBlbnRyaWVzLmVudHJpZXMoKSkge1xuICAgIGNvbnN0IHkgPSB5c1tpXTtcbiAgICBjb25zdCBwYXIgPSBib25lcy5nZXQoZS5wYXJlbnRJbmRleCk7XG4gICAgY29uc3QgZ3JwID0gc3ZnLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwiaXNoaWthd2Etc3ViLWdyb3VwXCIpO1xuICAgIGxldCBieDAgPSAwO1xuICAgIGxldCBieTAgPSAwO1xuICAgIGxldCBieDEgPSAwO1xuICAgIGlmIChlLmRlcHRoICUgMiA9PT0gMCkge1xuICAgICAgY29uc3QgZHlQID0gcGFyLnkxIC0gcGFyLnkwO1xuICAgICAgYngwID0gbGVycChwYXIueDAsIHBhci54MSwgZHlQID8gKHkgLSBwYXIueTApIC8gZHlQIDogMC41KTtcbiAgICAgIGJ5MCA9IHk7XG4gICAgICBieDEgPSBieDAgLSAoZS5jaGlsZENvdW50ID4gMCA/IEJPTkVfQkFTRSArIGUuY2hpbGRDb3VudCAqIEJPTkVfUEVSX0NISUxEIDogQk9ORV9TVFVCKTtcbiAgICAgIGRyYXdMaW5lKGdycCwgYngwLCB5LCBieDEsIHksIFwiaXNoaWthd2Etc3ViLWJyYW5jaFwiLCByb3VnaENvbnRleHQpO1xuICAgICAgaWYgKHJvdWdoQ29udGV4dCkge1xuICAgICAgICBkcmF3QXJyb3dNYXJrZXIoZ3JwLCBieDAsIHksIDEsIDAsIHJvdWdoQ29udGV4dCk7XG4gICAgICB9XG4gICAgICBkcmF3TXVsdGlsaW5lVGV4dChncnAsIGUudGV4dCwgYngxLCB5LCBcImlzaGlrYXdhLWxhYmVsIGFsaWduXCIsIFwiZW5kXCIsIGZvbnRTaXplKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgayA9IHBhci5jaGlsZHJlbkRyYXduKys7XG4gICAgICBieDAgPSBsZXJwKHBhci54MCwgcGFyLngxLCAocGFyLmNoaWxkQ291bnQgLSBrKSAvIChwYXIuY2hpbGRDb3VudCArIDEpKTtcbiAgICAgIGJ5MCA9IHBhci55MDtcbiAgICAgIGJ4MSA9IGJ4MCArIGRpYWdvbmFsWCAqICgoeSAtIGJ5MCkgLyBkaWFnb25hbFkpO1xuICAgICAgZHJhd0xpbmUoZ3JwLCBieDAsIGJ5MCwgYngxLCB5LCBcImlzaGlrYXdhLXN1Yi1icmFuY2hcIiwgcm91Z2hDb250ZXh0KTtcbiAgICAgIGlmIChyb3VnaENvbnRleHQpIHtcbiAgICAgICAgZHJhd0Fycm93TWFya2VyKGdycCwgYngwLCBieTAsIGJ4MCAtIGJ4MSwgYnkwIC0geSwgcm91Z2hDb250ZXh0KTtcbiAgICAgIH1cbiAgICAgIGRyYXdNdWx0aWxpbmVUZXh0KGdycCwgZS50ZXh0LCBieDEsIHksIG9kZExhYmVsLCBcImVuZFwiLCBmb250U2l6ZSk7XG4gICAgfVxuICAgIGlmIChlLmNoaWxkQ291bnQgPiAwKSB7XG4gICAgICBib25lcy5zZXQoaSwge1xuICAgICAgICB4MDogYngwLFxuICAgICAgICB5MDogYnkwLFxuICAgICAgICB4MTogYngxLFxuICAgICAgICB5MTogeSxcbiAgICAgICAgY2hpbGRDb3VudDogZS5jaGlsZENvdW50LFxuICAgICAgICBjaGlsZHJlbkRyYXduOiAwXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn0sIFwiZHJhd0JyYW5jaFwiKTtcbnZhciBzcGxpdExpbmVzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgodGV4dCkgPT4gdGV4dC5zcGxpdCgvPGJyXFxzKlxcLz8+fFxcbi8pLCBcInNwbGl0TGluZXNcIik7XG52YXIgd3JhcFRleHQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCh0ZXh0LCBtYXhDaGFycykgPT4ge1xuICBpZiAodGV4dC5sZW5ndGggPD0gbWF4Q2hhcnMpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuICBjb25zdCBsaW5lcyA9IFtdO1xuICBmb3IgKGNvbnN0IHdvcmQgb2YgdGV4dC5zcGxpdCgvXFxzKy8pKSB7XG4gICAgY29uc3QgbGFzdCA9IGxpbmVzLmxlbmd0aCAtIDE7XG4gICAgaWYgKGxhc3QgPj0gMCAmJiBsaW5lc1tsYXN0XS5sZW5ndGggKyAxICsgd29yZC5sZW5ndGggPD0gbWF4Q2hhcnMpIHtcbiAgICAgIGxpbmVzW2xhc3RdICs9IFwiIFwiICsgd29yZDtcbiAgICB9IGVsc2Uge1xuICAgICAgbGluZXMucHVzaCh3b3JkKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGxpbmVzLmpvaW4oXCJcXG5cIik7XG59LCBcIndyYXBUZXh0XCIpO1xudmFyIGRyYXdNdWx0aWxpbmVUZXh0ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZywgdGV4dCwgeCwgeSwgY2xzLCBhbmNob3IsIGZvbnRTaXplKSA9PiB7XG4gIGNvbnN0IGxpbmVzID0gc3BsaXRMaW5lcyh0ZXh0KTtcbiAgY29uc3QgbGggPSBmb250U2l6ZSAqIDEuMDU7XG4gIGNvbnN0IGVsID0gZy5hcHBlbmQoXCJ0ZXh0XCIpLmF0dHIoXCJjbGFzc1wiLCBjbHMpLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBhbmNob3IpLmF0dHIoXCJ4XCIsIHgpLmF0dHIoXCJ5XCIsIHkgLSAobGluZXMubGVuZ3RoIC0gMSkgKiBsaCAvIDIpO1xuICBmb3IgKGNvbnN0IFtpLCBsaW5lXSBvZiBsaW5lcy5lbnRyaWVzKCkpIHtcbiAgICBlbC5hcHBlbmQoXCJ0c3BhblwiKS5hdHRyKFwieFwiLCB4KS5hdHRyKFwiZHlcIiwgaSA9PT0gMCA/IDAgOiBsaCkudGV4dChsaW5lKTtcbiAgfVxuICByZXR1cm4gZWw7XG59LCBcImRyYXdNdWx0aWxpbmVUZXh0XCIpO1xudmFyIGxlcnAgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChhLCBiLCB0KSA9PiBhICsgKGIgLSBhKSAqIHQsIFwibGVycFwiKTtcbnZhciBkcmF3TGluZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGcsIHgxLCB5MSwgeDIsIHkyLCBjbHMsIHJvdWdoQ29udGV4dCkgPT4ge1xuICBpZiAocm91Z2hDb250ZXh0KSB7XG4gICAgY29uc3Qgcm91Z2hOb2RlID0gcm91Z2hDb250ZXh0LnJvdWdoU3ZnLmxpbmUoeDEsIHkxLCB4MiwgeTIsIHtcbiAgICAgIHJvdWdobmVzczogMS41LFxuICAgICAgc2VlZDogcm91Z2hDb250ZXh0LnNlZWQsXG4gICAgICBzdHJva2U6IHJvdWdoQ29udGV4dC5saW5lQ29sb3IsXG4gICAgICBzdHJva2VXaWR0aDogMlxuICAgIH0pO1xuICAgIGcuYXBwZW5kKCgpID0+IHJvdWdoTm9kZSkuYXR0cihcImNsYXNzXCIsIGNscyk7XG4gICAgcmV0dXJuIHZvaWQgMDtcbiAgfVxuICByZXR1cm4gZy5hcHBlbmQoXCJsaW5lXCIpLmF0dHIoXCJjbGFzc1wiLCBjbHMpLmF0dHIoXCJ4MVwiLCB4MSkuYXR0cihcInkxXCIsIHkxKS5hdHRyKFwieDJcIiwgeDIpLmF0dHIoXCJ5MlwiLCB5Mik7XG59LCBcImRyYXdMaW5lXCIpO1xudmFyIHJlbmRlcmVyID0geyBkcmF3IH07XG5cbi8vIHNyYy9kaWFncmFtcy9pc2hpa2F3YS9pc2hpa2F3YVN0eWxlcy50c1xudmFyIGdldFN0eWxlcyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKG9wdGlvbnMpID0+IGBcbi5pc2hpa2F3YSAuaXNoaWthd2Etc3BpbmUsXG4uaXNoaWthd2EgLmlzaGlrYXdhLWJyYW5jaCxcbi5pc2hpa2F3YSAuaXNoaWthd2Etc3ViLWJyYW5jaCB7XG4gIHN0cm9rZTogJHtvcHRpb25zLmxpbmVDb2xvcn07XG4gIHN0cm9rZS13aWR0aDogMjtcbiAgZmlsbDogbm9uZTtcbn1cblxuLmlzaGlrYXdhIC5pc2hpa2F3YS1zdWItYnJhbmNoIHtcbiAgc3Ryb2tlLXdpZHRoOiAxO1xufVxuXG4uaXNoaWthd2EgLmlzaGlrYXdhLWFycm93IHtcbiAgZmlsbDogJHtvcHRpb25zLmxpbmVDb2xvcn07XG59XG5cbi5pc2hpa2F3YSAuaXNoaWthd2EtaGVhZCB7XG4gIGZpbGw6ICR7b3B0aW9ucy5tYWluQmtnfTtcbiAgc3Ryb2tlOiAke29wdGlvbnMubGluZUNvbG9yfTtcbiAgc3Ryb2tlLXdpZHRoOiAyO1xufVxuXG4uaXNoaWthd2EgLmlzaGlrYXdhLWxhYmVsLWJveCB7XG4gIGZpbGw6ICR7b3B0aW9ucy5tYWluQmtnfTtcbiAgc3Ryb2tlOiAke29wdGlvbnMubGluZUNvbG9yfTtcbiAgc3Ryb2tlLXdpZHRoOiAyO1xufVxuXG4uaXNoaWthd2EgdGV4dCB7XG4gIGZvbnQtZmFtaWx5OiAke29wdGlvbnMuZm9udEZhbWlseX07XG4gIGZvbnQtc2l6ZTogJHtvcHRpb25zLmZvbnRTaXplfTtcbiAgZmlsbDogJHtvcHRpb25zLnRleHRDb2xvcn07XG59XG5cbi5pc2hpa2F3YSAuaXNoaWthd2EtaGVhZC1sYWJlbCB7XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG4gIHRleHQtYW5jaG9yOiBtaWRkbGU7XG4gIGRvbWluYW50LWJhc2VsaW5lOiBtaWRkbGU7XG4gIGZvbnQtc2l6ZTogMTRweDtcbn1cblxuLmlzaGlrYXdhIC5pc2hpa2F3YS1sYWJlbCB7XG4gIHRleHQtYW5jaG9yOiBlbmQ7XG59XG5cbi5pc2hpa2F3YSAuaXNoaWthd2EtbGFiZWwuY2F1c2Uge1xuICB0ZXh0LWFuY2hvcjogbWlkZGxlO1xuICBkb21pbmFudC1iYXNlbGluZTogbWlkZGxlO1xufVxuXG4uaXNoaWthd2EgLmlzaGlrYXdhLWxhYmVsLmFsaWduIHtcbiAgdGV4dC1hbmNob3I6IGVuZDtcbiAgZG9taW5hbnQtYmFzZWxpbmU6IG1pZGRsZTtcbn1cblxuLmlzaGlrYXdhIC5pc2hpa2F3YS1sYWJlbC51cCB7XG4gIGRvbWluYW50LWJhc2VsaW5lOiBiYXNlbGluZTtcbn1cblxuLmlzaGlrYXdhIC5pc2hpa2F3YS1sYWJlbC5kb3duIHtcbiAgZG9taW5hbnQtYmFzZWxpbmU6IGhhbmdpbmc7XG59XG5gLCBcImdldFN0eWxlc1wiKTtcbnZhciBpc2hpa2F3YVN0eWxlc19kZWZhdWx0ID0gZ2V0U3R5bGVzO1xuXG4vLyBzcmMvZGlhZ3JhbXMvaXNoaWthd2EvaXNoaWthd2FEaWFncmFtLnRzXG52YXIgZGlhZ3JhbSA9IHtcbiAgcGFyc2VyOiBpc2hpa2F3YV9kZWZhdWx0LFxuICBnZXQgZGIoKSB7XG4gICAgcmV0dXJuIG5ldyBJc2hpa2F3YURCKCk7XG4gIH0sXG4gIHJlbmRlcmVyLFxuICBzdHlsZXM6IGlzaGlrYXdhU3R5bGVzX2RlZmF1bHRcbn07XG5leHBvcnQge1xuICBkaWFncmFtXG59O1xuIgogIF0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVCQSxJQUFJLFNBQVUsUUFBUSxHQUFHO0FBQUEsRUFDdkIsSUFBSSxvQkFBb0IsT0FBTyxRQUFRLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRztBQUFBLElBQ25ELEtBQUssS0FBSyxNQUFNLENBQUMsR0FBRyxJQUFJLEVBQUUsT0FBUSxLQUFLLEdBQUcsRUFBRSxNQUFNO0FBQUE7QUFBQSxJQUNsRCxPQUFPO0FBQUEsS0FDTixHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxH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RyxDQUFDLEdBQUcsR0FBRyxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxLQUFLLEdBQUcsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQUEsSUFDdHJCLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFBQSxJQUN2Qyw0QkFBNEIsT0FBTyxTQUFTLFVBQVUsQ0FBQyxLQUFLLE1BQU07QUFBQSxN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LElBQUksV0FBVyxFQUFFLEtBQUs7QUFHdEIsSUFBSSw0QkFBNEIsT0FBTyxDQUFDLFlBQVk7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQUl4QyxRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsVUFVVixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsVUFJUixRQUFRO0FBQUEsWUFDTixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQUtWLFFBQVE7QUFBQSxZQUNOLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUtILFFBQVE7QUFBQSxlQUNWLFFBQVE7QUFBQSxVQUNiLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQStCZixXQUFXO0FBQ2QsSUFBSSx5QkFBeUI7QUFHN0IsSUFBSSxVQUFVO0FBQUEsRUFDWixRQUFRO0FBQUEsTUFDSixFQUFFLEdBQUc7QUFBQSxJQUNQLE9BQU8sSUFBSTtBQUFBO0FBQUEsRUFFYjtBQUFBLEVBQ0EsUUFBUTtBQUNWOyIsCiAgImRlYnVnSWQiOiAiMDU0MTJCQjYzNEQ0NjlEOTY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
