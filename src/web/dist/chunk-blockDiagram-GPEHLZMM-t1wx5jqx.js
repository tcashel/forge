import {
  Graph
} from "./chunk-main-g8v87zdn.js";
import {
  getIconStyles
} from "./chunk-main-0ekgv9a6.js";
import {
  computeLabelTransform,
  getLineFunctionsWithOffset
} from "./chunk-main-h1tqf3mz.js";
import {
  configureLabelImages,
  getSubGraphTitleMargins
} from "./chunk-main-s8463nwg.js";
import {
  createText
} from "./chunk-main-wsp4jakw.js";
import {
  clone,
  decodeEntities,
  getStylesFromArray,
  utils_default
} from "./chunk-main-vvfzntzy.js";
import"./chunk-main-ck580f0k.js";
import {
  channel_default,
  clear,
  common_default,
  configureSvgSize,
  getConfig,
  getConfig2,
  getEffectiveHtmlLabels,
  getUrl,
  rgba_default,
  sanitizeText
} from "./chunk-main-aws590jt.js";
import {
  __name,
  basis_default,
  line_default,
  log,
  select_default
} from "./chunk-main-vcnyggwp.js";
import"./chunk-main-g8wf8be2.js";

// node_modules/mermaid/dist/chunks/mermaid.core/blockDiagram-GPEHLZMM.mjs
var parser = function() {
  var o = /* @__PURE__ */ __name(function(k, v, o2, l) {
    for (o2 = o2 || {}, l = k.length;l--; o2[k[l]] = v)
      ;
    return o2;
  }, "o"), $V0 = [1, 15], $V1 = [1, 7], $V2 = [1, 13], $V3 = [1, 14], $V4 = [1, 19], $V5 = [1, 16], $V6 = [1, 17], $V7 = [1, 18], $V8 = [8, 30], $V9 = [8, 10, 21, 28, 29, 30, 31, 39, 43, 46], $Va = [1, 23], $Vb = [1, 24], $Vc = [8, 10, 15, 16, 21, 28, 29, 30, 31, 39, 43, 46], $Vd = [8, 10, 15, 16, 21, 27, 28, 29, 30, 31, 39, 43, 46], $Ve = [1, 49];
  var parser2 = {
    trace: /* @__PURE__ */ __name(function trace() {}, "trace"),
    yy: {},
    symbols_: { error: 2, spaceLines: 3, SPACELINE: 4, NL: 5, separator: 6, SPACE: 7, EOF: 8, start: 9, BLOCK_DIAGRAM_KEY: 10, document: 11, stop: 12, statement: 13, link: 14, LINK: 15, START_LINK: 16, LINK_LABEL: 17, STR: 18, nodeStatement: 19, columnsStatement: 20, SPACE_BLOCK: 21, blockStatement: 22, classDefStatement: 23, cssClassStatement: 24, styleStatement: 25, node: 26, SIZE: 27, COLUMNS: 28, "id-block": 29, end: 30, NODE_ID: 31, nodeShapeNLabel: 32, dirList: 33, DIR: 34, NODE_DSTART: 35, NODE_DEND: 36, BLOCK_ARROW_START: 37, BLOCK_ARROW_END: 38, classDef: 39, CLASSDEF_ID: 40, CLASSDEF_STYLEOPTS: 41, DEFAULT: 42, class: 43, CLASSENTITY_IDS: 44, STYLECLASS: 45, style: 46, STYLE_ENTITY_IDS: 47, STYLE_DEFINITION_DATA: 48, $accept: 0, $end: 1 },
    terminals_: { 2: "error", 4: "SPACELINE", 5: "NL", 7: "SPACE", 8: "EOF", 10: "BLOCK_DIAGRAM_KEY", 15: "LINK", 16: "START_LINK", 17: "LINK_LABEL", 18: "STR", 21: "SPACE_BLOCK", 27: "SIZE", 28: "COLUMNS", 29: "id-block", 30: "end", 31: "NODE_ID", 34: "DIR", 35: "NODE_DSTART", 36: "NODE_DEND", 37: "BLOCK_ARROW_START", 38: "BLOCK_ARROW_END", 39: "classDef", 40: "CLASSDEF_ID", 41: "CLASSDEF_STYLEOPTS", 42: "DEFAULT", 43: "class", 44: "CLASSENTITY_IDS", 45: "STYLECLASS", 46: "style", 47: "STYLE_ENTITY_IDS", 48: "STYLE_DEFINITION_DATA" },
    productions_: [0, [3, 1], [3, 2], [3, 2], [6, 1], [6, 1], [6, 1], [9, 3], [12, 1], [12, 1], [12, 2], [12, 2], [11, 1], [11, 2], [14, 1], [14, 4], [13, 1], [13, 1], [13, 1], [13, 1], [13, 1], [13, 1], [13, 1], [19, 3], [19, 2], [19, 1], [20, 1], [22, 4], [22, 3], [26, 1], [26, 2], [33, 1], [33, 2], [32, 3], [32, 4], [23, 3], [23, 3], [24, 3], [25, 3]],
    performAction: /* @__PURE__ */ __name(function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
      var $0 = $$.length - 1;
      switch (yystate) {
        case 4:
          yy.getLogger().debug("Rule: separator (NL) ");
          break;
        case 5:
          yy.getLogger().debug("Rule: separator (Space) ");
          break;
        case 6:
          yy.getLogger().debug("Rule: separator (EOF) ");
          break;
        case 7:
          yy.getLogger().debug("Rule: hierarchy: ", $$[$0 - 1]);
          yy.setHierarchy($$[$0 - 1]);
          break;
        case 8:
          yy.getLogger().debug("Stop NL ");
          break;
        case 9:
          yy.getLogger().debug("Stop EOF ");
          break;
        case 10:
          yy.getLogger().debug("Stop NL2 ");
          break;
        case 11:
          yy.getLogger().debug("Stop EOF2 ");
          break;
        case 12:
          yy.getLogger().debug("Rule: statement: ", $$[$0]);
          typeof $$[$0].length === "number" ? this.$ = $$[$0] : this.$ = [$$[$0]];
          break;
        case 13:
          yy.getLogger().debug("Rule: statement #2: ", $$[$0 - 1]);
          this.$ = [$$[$0 - 1]].concat($$[$0]);
          break;
        case 14:
          yy.getLogger().debug("Rule: link: ", $$[$0], yytext);
          this.$ = { edgeTypeStr: $$[$0], label: "" };
          break;
        case 15:
          yy.getLogger().debug("Rule: LABEL link: ", $$[$0 - 3], $$[$0 - 1], $$[$0]);
          this.$ = { edgeTypeStr: $$[$0], label: $$[$0 - 1] };
          break;
        case 18:
          const num = parseInt($$[$0]);
          const spaceId = yy.generateId();
          this.$ = { id: spaceId, type: "space", label: "", width: num, children: [] };
          break;
        case 23:
          yy.getLogger().debug("Rule: (nodeStatement link node) ", $$[$0 - 2], $$[$0 - 1], $$[$0], " typestr: ", $$[$0 - 1].edgeTypeStr);
          const edgeData = yy.edgeStrToEdgeData($$[$0 - 1].edgeTypeStr);
          const startEdgeData = yy.edgeStrToEdgeStartData($$[$0 - 1].edgeTypeStr);
          const lineThickness = yy.edgeStrToThickness($$[$0 - 1].edgeTypeStr);
          const linePattern = yy.edgeStrToPattern($$[$0 - 1].edgeTypeStr);
          this.$ = [
            { id: $$[$0 - 2].id, label: $$[$0 - 2].label, type: $$[$0 - 2].type, directions: $$[$0 - 2].directions },
            { id: $$[$0 - 2].id + "-" + $$[$0].id, start: $$[$0 - 2].id, end: $$[$0].id, label: $$[$0 - 1].label, type: "edge", thickness: lineThickness, pattern: linePattern, directions: $$[$0].directions, arrowTypeEnd: edgeData, arrowTypeStart: startEdgeData },
            { id: $$[$0].id, label: $$[$0].label, type: yy.typeStr2Type($$[$0].typeStr), directions: $$[$0].directions }
          ];
          break;
        case 24:
          yy.getLogger().debug("Rule: nodeStatement (abc88 node size) ", $$[$0 - 1], $$[$0]);
          this.$ = { id: $$[$0 - 1].id, label: $$[$0 - 1].label, type: yy.typeStr2Type($$[$0 - 1].typeStr), directions: $$[$0 - 1].directions, widthInColumns: parseInt($$[$0], 10) };
          break;
        case 25:
          yy.getLogger().debug("Rule: nodeStatement (node) ", $$[$0]);
          this.$ = { id: $$[$0].id, label: $$[$0].label, type: yy.typeStr2Type($$[$0].typeStr), directions: $$[$0].directions, widthInColumns: 1 };
          break;
        case 26:
          yy.getLogger().debug("APA123", this ? this : "na");
          yy.getLogger().debug("COLUMNS: ", $$[$0]);
          this.$ = { type: "column-setting", columns: $$[$0] === "auto" ? -1 : parseInt($$[$0]) };
          break;
        case 27:
          yy.getLogger().debug("Rule: id-block statement : ", $$[$0 - 2], $$[$0 - 1]);
          const id2 = yy.generateId();
          this.$ = { ...$$[$0 - 2], type: "composite", children: $$[$0 - 1] };
          break;
        case 28:
          yy.getLogger().debug("Rule: blockStatement : ", $$[$0 - 2], $$[$0 - 1], $$[$0]);
          const id = yy.generateId();
          this.$ = { id, type: "composite", label: "", children: $$[$0 - 1] };
          break;
        case 29:
          yy.getLogger().debug("Rule: node (NODE_ID separator): ", $$[$0]);
          this.$ = { id: $$[$0] };
          break;
        case 30:
          yy.getLogger().debug("Rule: node (NODE_ID nodeShapeNLabel separator): ", $$[$0 - 1], $$[$0]);
          this.$ = { id: $$[$0 - 1], label: $$[$0].label, typeStr: $$[$0].typeStr, directions: $$[$0].directions };
          break;
        case 31:
          yy.getLogger().debug("Rule: dirList: ", $$[$0]);
          this.$ = [$$[$0]];
          break;
        case 32:
          yy.getLogger().debug("Rule: dirList: ", $$[$0 - 1], $$[$0]);
          this.$ = [$$[$0 - 1]].concat($$[$0]);
          break;
        case 33:
          yy.getLogger().debug("Rule: nodeShapeNLabel: ", $$[$0 - 2], $$[$0 - 1], $$[$0]);
          this.$ = { typeStr: $$[$0 - 2] + $$[$0], label: $$[$0 - 1] };
          break;
        case 34:
          yy.getLogger().debug("Rule: BLOCK_ARROW nodeShapeNLabel: ", $$[$0 - 3], $$[$0 - 2], " #3:", $$[$0 - 1], $$[$0]);
          this.$ = { typeStr: $$[$0 - 3] + $$[$0], label: $$[$0 - 2], directions: $$[$0 - 1] };
          break;
        case 35:
        case 36:
          this.$ = { type: "classDef", id: $$[$0 - 1].trim(), css: $$[$0].trim() };
          break;
        case 37:
          this.$ = { type: "applyClass", id: $$[$0 - 1].trim(), styleClass: $$[$0].trim() };
          break;
        case 38:
          this.$ = { type: "applyStyles", id: $$[$0 - 1].trim(), stylesStr: $$[$0].trim() };
          break;
      }
    }, "anonymous"),
    table: [{ 9: 1, 10: [1, 2] }, { 1: [3] }, { 10: $V0, 11: 3, 13: 4, 19: 5, 20: 6, 21: $V1, 22: 8, 23: 9, 24: 10, 25: 11, 26: 12, 28: $V2, 29: $V3, 31: $V4, 39: $V5, 43: $V6, 46: $V7 }, { 8: [1, 20] }, o($V8, [2, 12], { 13: 4, 19: 5, 20: 6, 22: 8, 23: 9, 24: 10, 25: 11, 26: 12, 11: 21, 10: $V0, 21: $V1, 28: $V2, 29: $V3, 31: $V4, 39: $V5, 43: $V6, 46: $V7 }), o($V9, [2, 16], { 14: 22, 15: $Va, 16: $Vb }), o($V9, [2, 17]), o($V9, [2, 18]), o($V9, [2, 19]), o($V9, [2, 20]), o($V9, [2, 21]), o($V9, [2, 22]), o($Vc, [2, 25], { 27: [1, 25] }), o($V9, [2, 26]), { 19: 26, 26: 12, 31: $V4 }, { 10: $V0, 11: 27, 13: 4, 19: 5, 20: 6, 21: $V1, 22: 8, 23: 9, 24: 10, 25: 11, 26: 12, 28: $V2, 29: $V3, 31: $V4, 39: $V5, 43: $V6, 46: $V7 }, { 40: [1, 28], 42: [1, 29] }, { 44: [1, 30] }, { 47: [1, 31] }, o($Vd, [2, 29], { 32: 32, 35: [1, 33], 37: [1, 34] }), { 1: [2, 7] }, o($V8, [2, 13]), { 26: 35, 31: $V4 }, { 31: [2, 14] }, { 17: [1, 36] }, o($Vc, [2, 24]), { 10: $V0, 11: 37, 13: 4, 14: 22, 15: $Va, 16: $Vb, 19: 5, 20: 6, 21: $V1, 22: 8, 23: 9, 24: 10, 25: 11, 26: 12, 28: $V2, 29: $V3, 31: $V4, 39: $V5, 43: $V6, 46: $V7 }, { 30: [1, 38] }, { 41: [1, 39] }, { 41: [1, 40] }, { 45: [1, 41] }, { 48: [1, 42] }, o($Vd, [2, 30]), { 18: [1, 43] }, { 18: [1, 44] }, o($Vc, [2, 23]), { 18: [1, 45] }, { 30: [1, 46] }, o($V9, [2, 28]), o($V9, [2, 35]), o($V9, [2, 36]), o($V9, [2, 37]), o($V9, [2, 38]), { 36: [1, 47] }, { 33: 48, 34: $Ve }, { 15: [1, 50] }, o($V9, [2, 27]), o($Vd, [2, 33]), { 38: [1, 51] }, { 33: 52, 34: $Ve, 38: [2, 31] }, { 31: [2, 15] }, o($Vd, [2, 34]), { 38: [2, 32] }],
    defaultActions: { 20: [2, 7], 23: [2, 14], 50: [2, 15], 52: [2, 32] },
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
            yy.getLogger().debug("Found block-beta");
            return 10;
            break;
          case 1:
            yy.getLogger().debug("Found id-block");
            return 29;
            break;
          case 2:
            yy.getLogger().debug("Found block");
            return 10;
            break;
          case 3:
            yy.getLogger().debug(".", yy_.yytext);
            break;
          case 4:
            yy.getLogger().debug("_", yy_.yytext);
            break;
          case 5:
            return 5;
            break;
          case 6:
            yy_.yytext = -1;
            return 28;
            break;
          case 7:
            yy_.yytext = yy_.yytext.replace(/columns\s+/, "");
            yy.getLogger().debug("COLUMNS (LEX)", yy_.yytext);
            return 28;
            break;
          case 8:
            this.pushState("md_string");
            break;
          case 9:
            return "MD_STR";
            break;
          case 10:
            this.popState();
            break;
          case 11:
            this.pushState("string");
            break;
          case 12:
            yy.getLogger().debug("LEX: POPPING STR:", yy_.yytext);
            this.popState();
            break;
          case 13:
            yy.getLogger().debug("LEX: STR end:", yy_.yytext);
            return "STR";
            break;
          case 14:
            yy_.yytext = yy_.yytext.replace(/space\:/, "");
            yy.getLogger().debug("SPACE NUM (LEX)", yy_.yytext);
            return 21;
            break;
          case 15:
            yy_.yytext = "1";
            yy.getLogger().debug("COLUMNS (LEX)", yy_.yytext);
            return 21;
            break;
          case 16:
            return 42;
            break;
          case 17:
            return "LINKSTYLE";
            break;
          case 18:
            return "INTERPOLATE";
            break;
          case 19:
            this.pushState("CLASSDEF");
            return 39;
            break;
          case 20:
            this.popState();
            this.pushState("CLASSDEFID");
            return "DEFAULT_CLASSDEF_ID";
            break;
          case 21:
            this.popState();
            this.pushState("CLASSDEFID");
            return 40;
            break;
          case 22:
            this.popState();
            return 41;
            break;
          case 23:
            this.pushState("CLASS");
            return 43;
            break;
          case 24:
            this.popState();
            this.pushState("CLASS_STYLE");
            return 44;
            break;
          case 25:
            this.popState();
            return 45;
            break;
          case 26:
            this.pushState("STYLE_STMNT");
            return 46;
            break;
          case 27:
            this.popState();
            this.pushState("STYLE_DEFINITION");
            return 47;
            break;
          case 28:
            this.popState();
            return 48;
            break;
          case 29:
            this.pushState("acc_title");
            return "acc_title";
            break;
          case 30:
            this.popState();
            return "acc_title_value";
            break;
          case 31:
            this.pushState("acc_descr");
            return "acc_descr";
            break;
          case 32:
            this.popState();
            return "acc_descr_value";
            break;
          case 33:
            this.pushState("acc_descr_multiline");
            break;
          case 34:
            this.popState();
            break;
          case 35:
            return "acc_descr_multiline_value";
            break;
          case 36:
            return 30;
            break;
          case 37:
            this.popState();
            yy.getLogger().debug("Lex: ((");
            return "NODE_DEND";
            break;
          case 38:
            this.popState();
            yy.getLogger().debug("Lex: ((");
            return "NODE_DEND";
            break;
          case 39:
            this.popState();
            yy.getLogger().debug("Lex: ))");
            return "NODE_DEND";
            break;
          case 40:
            this.popState();
            yy.getLogger().debug("Lex: ((");
            return "NODE_DEND";
            break;
          case 41:
            this.popState();
            yy.getLogger().debug("Lex: ((");
            return "NODE_DEND";
            break;
          case 42:
            this.popState();
            yy.getLogger().debug("Lex: (-");
            return "NODE_DEND";
            break;
          case 43:
            this.popState();
            yy.getLogger().debug("Lex: -)");
            return "NODE_DEND";
            break;
          case 44:
            this.popState();
            yy.getLogger().debug("Lex: ((");
            return "NODE_DEND";
            break;
          case 45:
            this.popState();
            yy.getLogger().debug("Lex: ]]");
            return "NODE_DEND";
            break;
          case 46:
            this.popState();
            yy.getLogger().debug("Lex: (");
            return "NODE_DEND";
            break;
          case 47:
            this.popState();
            yy.getLogger().debug("Lex: ])");
            return "NODE_DEND";
            break;
          case 48:
            this.popState();
            yy.getLogger().debug("Lex: /]");
            return "NODE_DEND";
            break;
          case 49:
            this.popState();
            yy.getLogger().debug("Lex: /]");
            return "NODE_DEND";
            break;
          case 50:
            this.popState();
            yy.getLogger().debug("Lex: )]");
            return "NODE_DEND";
            break;
          case 51:
            this.popState();
            yy.getLogger().debug("Lex: )");
            return "NODE_DEND";
            break;
          case 52:
            this.popState();
            yy.getLogger().debug("Lex: ]>");
            return "NODE_DEND";
            break;
          case 53:
            this.popState();
            yy.getLogger().debug("Lex: ]");
            return "NODE_DEND";
            break;
          case 54:
            yy.getLogger().debug("Lexa: -)");
            this.pushState("NODE");
            return 35;
            break;
          case 55:
            yy.getLogger().debug("Lexa: (-");
            this.pushState("NODE");
            return 35;
            break;
          case 56:
            yy.getLogger().debug("Lexa: ))");
            this.pushState("NODE");
            return 35;
            break;
          case 57:
            yy.getLogger().debug("Lexa: )");
            this.pushState("NODE");
            return 35;
            break;
          case 58:
            yy.getLogger().debug("Lex: (((");
            this.pushState("NODE");
            return 35;
            break;
          case 59:
            yy.getLogger().debug("Lexa: )");
            this.pushState("NODE");
            return 35;
            break;
          case 60:
            yy.getLogger().debug("Lexa: )");
            this.pushState("NODE");
            return 35;
            break;
          case 61:
            yy.getLogger().debug("Lexa: )");
            this.pushState("NODE");
            return 35;
            break;
          case 62:
            yy.getLogger().debug("Lexc: >");
            this.pushState("NODE");
            return 35;
            break;
          case 63:
            yy.getLogger().debug("Lexa: ([");
            this.pushState("NODE");
            return 35;
            break;
          case 64:
            yy.getLogger().debug("Lexa: )");
            this.pushState("NODE");
            return 35;
            break;
          case 65:
            this.pushState("NODE");
            return 35;
            break;
          case 66:
            this.pushState("NODE");
            return 35;
            break;
          case 67:
            this.pushState("NODE");
            return 35;
            break;
          case 68:
            this.pushState("NODE");
            return 35;
            break;
          case 69:
            this.pushState("NODE");
            return 35;
            break;
          case 70:
            this.pushState("NODE");
            return 35;
            break;
          case 71:
            this.pushState("NODE");
            return 35;
            break;
          case 72:
            yy.getLogger().debug("Lexa: [");
            this.pushState("NODE");
            return 35;
            break;
          case 73:
            this.pushState("BLOCK_ARROW");
            yy.getLogger().debug("LEX ARR START");
            return 37;
            break;
          case 74:
            yy.getLogger().debug("Lex: NODE_ID", yy_.yytext);
            return 31;
            break;
          case 75:
            yy.getLogger().debug("Lex: EOF", yy_.yytext);
            return 8;
            break;
          case 76:
            this.pushState("md_string");
            break;
          case 77:
            this.pushState("md_string");
            break;
          case 78:
            return "NODE_DESCR";
            break;
          case 79:
            this.popState();
            break;
          case 80:
            yy.getLogger().debug("Lex: Starting string");
            this.pushState("string");
            break;
          case 81:
            yy.getLogger().debug("LEX ARR: Starting string");
            this.pushState("string");
            break;
          case 82:
            yy.getLogger().debug("LEX: NODE_DESCR:", yy_.yytext);
            return "NODE_DESCR";
            break;
          case 83:
            yy.getLogger().debug("LEX POPPING");
            this.popState();
            break;
          case 84:
            yy.getLogger().debug("Lex: =>BAE");
            this.pushState("ARROW_DIR");
            break;
          case 85:
            yy_.yytext = yy_.yytext.replace(/^,\s*/, "");
            yy.getLogger().debug("Lex (right): dir:", yy_.yytext);
            return "DIR";
            break;
          case 86:
            yy_.yytext = yy_.yytext.replace(/^,\s*/, "");
            yy.getLogger().debug("Lex (left):", yy_.yytext);
            return "DIR";
            break;
          case 87:
            yy_.yytext = yy_.yytext.replace(/^,\s*/, "");
            yy.getLogger().debug("Lex (x):", yy_.yytext);
            return "DIR";
            break;
          case 88:
            yy_.yytext = yy_.yytext.replace(/^,\s*/, "");
            yy.getLogger().debug("Lex (y):", yy_.yytext);
            return "DIR";
            break;
          case 89:
            yy_.yytext = yy_.yytext.replace(/^,\s*/, "");
            yy.getLogger().debug("Lex (up):", yy_.yytext);
            return "DIR";
            break;
          case 90:
            yy_.yytext = yy_.yytext.replace(/^,\s*/, "");
            yy.getLogger().debug("Lex (down):", yy_.yytext);
            return "DIR";
            break;
          case 91:
            yy_.yytext = "]>";
            yy.getLogger().debug("Lex (ARROW_DIR end):", yy_.yytext);
            this.popState();
            this.popState();
            return "BLOCK_ARROW_END";
            break;
          case 92:
            yy.getLogger().debug("Lex: LINK", "#" + yy_.yytext + "#");
            return 15;
            break;
          case 93:
            yy.getLogger().debug("Lex: LINK", yy_.yytext);
            return 15;
            break;
          case 94:
            yy.getLogger().debug("Lex: LINK", yy_.yytext);
            return 15;
            break;
          case 95:
            yy.getLogger().debug("Lex: LINK", yy_.yytext);
            return 15;
            break;
          case 96:
            yy.getLogger().debug("Lex: START_LINK", yy_.yytext);
            this.pushState("LLABEL");
            return 16;
            break;
          case 97:
            yy.getLogger().debug("Lex: START_LINK", yy_.yytext);
            this.pushState("LLABEL");
            return 16;
            break;
          case 98:
            yy.getLogger().debug("Lex: START_LINK", yy_.yytext);
            this.pushState("LLABEL");
            return 16;
            break;
          case 99:
            this.pushState("md_string");
            break;
          case 100:
            yy.getLogger().debug("Lex: Starting string");
            this.pushState("string");
            return "LINK_LABEL";
            break;
          case 101:
            this.popState();
            yy.getLogger().debug("Lex: LINK", "#" + yy_.yytext + "#");
            return 15;
            break;
          case 102:
            this.popState();
            yy.getLogger().debug("Lex: LINK", yy_.yytext);
            return 15;
            break;
          case 103:
            this.popState();
            yy.getLogger().debug("Lex: LINK", yy_.yytext);
            return 15;
            break;
          case 104:
            yy.getLogger().debug("Lex: COLON", yy_.yytext);
            yy_.yytext = yy_.yytext.slice(1);
            return 27;
            break;
        }
      }, "anonymous"),
      rules: [/^(?:block-beta\b)/, /^(?:block:)/, /^(?:block\b)/, /^(?:[\s]+)/, /^(?:[\n]+)/, /^(?:((\u000D\u000A)|(\u000A)))/, /^(?:columns\s+auto\b)/, /^(?:columns\s+[\d]+)/, /^(?:["][`])/, /^(?:[^`"]+)/, /^(?:[`]["])/, /^(?:["])/, /^(?:["])/, /^(?:[^"]*)/, /^(?:space[:]\d+)/, /^(?:space\b)/, /^(?:default\b)/, /^(?:linkStyle\b)/, /^(?:interpolate\b)/, /^(?:classDef\s+)/, /^(?:DEFAULT\s+)/, /^(?:\w+\s+)/, /^(?:[^\n]*)/, /^(?:class\s+)/, /^(?:(\w+)+((,\s*\w+)*))/, /^(?:[^\n]*)/, /^(?:style\s+)/, /^(?:(\w+)+((,\s*\w+)*))/, /^(?:[^\n]*)/, /^(?:accTitle\s*:\s*)/, /^(?:(?!\n||)*[^\n]*)/, /^(?:accDescr\s*:\s*)/, /^(?:(?!\n||)*[^\n]*)/, /^(?:accDescr\s*\{\s*)/, /^(?:[\}])/, /^(?:[^\}]*)/, /^(?:end\b\s*)/, /^(?:\(\(\()/, /^(?:\)\)\))/, /^(?:[\)]\))/, /^(?:\}\})/, /^(?:\})/, /^(?:\(-)/, /^(?:-\))/, /^(?:\(\()/, /^(?:\]\])/, /^(?:\()/, /^(?:\]\))/, /^(?:\\\])/, /^(?:\/\])/, /^(?:\)\])/, /^(?:[\)])/, /^(?:\]>)/, /^(?:[\]])/, /^(?:-\))/, /^(?:\(-)/, /^(?:\)\))/, /^(?:\))/, /^(?:\(\(\()/, /^(?:\(\()/, /^(?:\{\{)/, /^(?:\{)/, /^(?:>)/, /^(?:\(\[)/, /^(?:\()/, /^(?:\[\[)/, /^(?:\[\|)/, /^(?:\[\()/, /^(?:\)\)\))/, /^(?:\[\\)/, /^(?:\[\/)/, /^(?:\[\\)/, /^(?:\[)/, /^(?:<\[)/, /^(?:[^\(\[\n\-\)\{\}\s\<\>:=]+)/, /^(?:$)/, /^(?:["][`])/, /^(?:["][`])/, /^(?:[^`"]+)/, /^(?:[`]["])/, /^(?:["])/, /^(?:["])/, /^(?:[^"]+)/, /^(?:["])/, /^(?:\]>\s*\()/, /^(?:,?\s*right\s*)/, /^(?:,?\s*left\s*)/, /^(?:,?\s*x\s*)/, /^(?:,?\s*y\s*)/, /^(?:,?\s*up\s*)/, /^(?:,?\s*down\s*)/, /^(?:\)\s*)/, /^(?:\s*[xo<]?--+[-xo>]\s*)/, /^(?:\s*[xo<]?==+[=xo>]\s*)/, /^(?:\s*[xo<]?-?\.+-[xo>]?\s*)/, /^(?:\s*~~[\~]+\s*)/, /^(?:\s*[xo<]?--\s*)/, /^(?:\s*[xo<]?==\s*)/, /^(?:\s*[xo<]?-\.\s*)/, /^(?:["][`])/, /^(?:["])/, /^(?:\s*[xo<]?--+[-xo>]\s*)/, /^(?:\s*[xo<]?==+[=xo>]\s*)/, /^(?:\s*[xo<]?-?\.+-[xo>]?\s*)/, /^(?::\d+)/],
      conditions: { STYLE_DEFINITION: { rules: [28], inclusive: false }, STYLE_STMNT: { rules: [27], inclusive: false }, CLASSDEFID: { rules: [22], inclusive: false }, CLASSDEF: { rules: [20, 21], inclusive: false }, CLASS_STYLE: { rules: [25], inclusive: false }, CLASS: { rules: [24], inclusive: false }, LLABEL: { rules: [99, 100, 101, 102, 103], inclusive: false }, ARROW_DIR: { rules: [85, 86, 87, 88, 89, 90, 91], inclusive: false }, BLOCK_ARROW: { rules: [76, 81, 84], inclusive: false }, NODE: { rules: [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 77, 80], inclusive: false }, md_string: { rules: [9, 10, 78, 79], inclusive: false }, space: { rules: [], inclusive: false }, string: { rules: [12, 13, 82, 83], inclusive: false }, acc_descr_multiline: { rules: [34, 35], inclusive: false }, acc_descr: { rules: [32], inclusive: false }, acc_title: { rules: [30], inclusive: false }, INITIAL: { rules: [0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 14, 15, 16, 17, 18, 19, 23, 26, 29, 31, 33, 36, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 92, 93, 94, 95, 96, 97, 98, 104], inclusive: true } }
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
var block_default = parser;
var blockDatabase = /* @__PURE__ */ new Map;
var edgeList = [];
var edgeCount = /* @__PURE__ */ new Map;
var COLOR_KEYWORD = "color";
var FILL_KEYWORD = "fill";
var BG_FILL = "bgFill";
var STYLECLASS_SEP = ",";
var config = getConfig2();
var classes = /* @__PURE__ */ new Map;
var diagramId = "";
var sanitizeText2 = /* @__PURE__ */ __name((txt) => common_default.sanitizeText(txt, config), "sanitizeText");
var addStyleClass = /* @__PURE__ */ __name(function(id, styleAttributes = "") {
  let foundClass = classes.get(id);
  if (!foundClass) {
    foundClass = { id, styles: [], textStyles: [] };
    classes.set(id, foundClass);
  }
  if (styleAttributes !== undefined && styleAttributes !== null) {
    styleAttributes.split(STYLECLASS_SEP).forEach((attrib) => {
      const fixedAttrib = attrib.replace(/([^;]*);/, "$1").trim();
      if (RegExp(COLOR_KEYWORD).exec(attrib)) {
        const newStyle1 = fixedAttrib.replace(FILL_KEYWORD, BG_FILL);
        const newStyle2 = newStyle1.replace(COLOR_KEYWORD, FILL_KEYWORD);
        foundClass.textStyles.push(newStyle2);
      }
      foundClass.styles.push(fixedAttrib);
    });
  }
}, "addStyleClass");
var addStyle2Node = /* @__PURE__ */ __name(function(id, styles = "") {
  const foundBlock = blockDatabase.get(id);
  if (styles !== undefined && styles !== null) {
    foundBlock.styles = styles.split(STYLECLASS_SEP);
  }
}, "addStyle2Node");
var setCssClass = /* @__PURE__ */ __name(function(itemIds, cssClassName) {
  itemIds.split(",").forEach(function(id) {
    let foundBlock = blockDatabase.get(id);
    if (foundBlock === undefined) {
      const trimmedId = id.trim();
      foundBlock = { id: trimmedId, type: "na", children: [] };
      blockDatabase.set(trimmedId, foundBlock);
    }
    if (!foundBlock.classes) {
      foundBlock.classes = [];
    }
    foundBlock.classes.push(cssClassName);
  });
}, "setCssClass");
var populateBlockDatabase = /* @__PURE__ */ __name((_blockList, parent) => {
  const blockList = _blockList.flat();
  const children = [];
  const columnSettingBlock = blockList.find((b) => b?.type === "column-setting");
  const column = columnSettingBlock?.columns ?? -1;
  for (const block of blockList) {
    if (typeof column === "number" && column > 0 && block.type !== "column-setting" && typeof block.widthInColumns === "number" && block.widthInColumns > column) {
      log.warn(`Block ${block.id} width ${block.widthInColumns} exceeds configured column width ${column}`);
    }
    if (block.label) {
      block.label = sanitizeText2(block.label);
    }
    if (block.type === "classDef") {
      addStyleClass(block.id, block.css);
      continue;
    }
    if (block.type === "applyClass") {
      setCssClass(block.id, block?.styleClass ?? "");
      continue;
    }
    if (block.type === "applyStyles") {
      if (block?.stylesStr) {
        addStyle2Node(block.id, block?.stylesStr);
      }
      continue;
    }
    if (block.type === "column-setting") {
      parent.columns = block.columns ?? -1;
    } else if (block.type === "edge") {
      const count = (edgeCount.get(block.id) ?? 0) + 1;
      edgeCount.set(block.id, count);
      block.id = count + "-" + block.id;
      edgeList.push(block);
    } else {
      if (!block.label) {
        if (block.type === "composite") {
          block.label = "";
        } else {
          block.label = block.id;
        }
      }
      const existingBlock = blockDatabase.get(block.id);
      if (existingBlock === undefined) {
        blockDatabase.set(block.id, block);
      } else {
        if (block.type !== "na") {
          existingBlock.type = block.type;
        }
        if (block.label !== block.id) {
          existingBlock.label = block.label;
        }
      }
      if (block.children) {
        populateBlockDatabase(block.children, block);
      }
      if (block.type === "space") {
        const w = block.width ?? 1;
        for (let j = 0;j < w; j++) {
          const newBlock = clone(block);
          newBlock.id = newBlock.id + "-" + j;
          blockDatabase.set(newBlock.id, newBlock);
          children.push(newBlock);
        }
      } else if (existingBlock === undefined) {
        children.push(block);
      }
    }
  }
  parent.children = children;
}, "populateBlockDatabase");
var blocks = [];
var rootBlock = { id: "root", type: "composite", children: [], columns: -1 };
var clear2 = /* @__PURE__ */ __name(() => {
  log.debug("Clear called");
  clear();
  rootBlock = { id: "root", type: "composite", children: [], columns: -1 };
  blockDatabase = /* @__PURE__ */ new Map([["root", rootBlock]]);
  blocks = [];
  classes = /* @__PURE__ */ new Map;
  edgeList = [];
  edgeCount = /* @__PURE__ */ new Map;
  diagramId = "";
}, "clear");
function typeStr2Type(typeStr) {
  log.debug("typeStr2Type", typeStr);
  switch (typeStr) {
    case "[]":
      return "square";
    case "()":
      log.debug("we have a round");
      return "round";
    case "(())":
      return "circle";
    case ">]":
      return "rect_left_inv_arrow";
    case "{}":
      return "diamond";
    case "{{}}":
      return "hexagon";
    case "([])":
      return "stadium";
    case "[[]]":
      return "subroutine";
    case "[()]":
      return "cylinder";
    case "((()))":
      return "doublecircle";
    case "[//]":
      return "lean_right";
    case "[\\\\]":
      return "lean_left";
    case "[/\\]":
      return "trapezoid";
    case "[\\/]":
      return "inv_trapezoid";
    case "<[]>":
      return "block_arrow";
    default:
      return "na";
  }
}
__name(typeStr2Type, "typeStr2Type");
function edgeTypeStr2Type(typeStr) {
  log.debug("typeStr2Type", typeStr);
  switch (typeStr) {
    case "==":
      return "thick";
    default:
      return "normal";
  }
}
__name(edgeTypeStr2Type, "edgeTypeStr2Type");
function edgeStrToEdgeData(typeStr) {
  const lastChar = typeStr.trim().slice(-1);
  switch (lastChar) {
    case "x":
      return "arrow_cross";
    case "o":
      return "arrow_circle";
    case ">":
      return "arrow_point";
    default:
      return "";
  }
}
__name(edgeStrToEdgeData, "edgeStrToEdgeData");
function edgeStrToEdgeStartData(typeStr) {
  const firstChar = typeStr.trim().charAt(0);
  switch (firstChar) {
    case "x":
      return "arrow_cross";
    case "o":
      return "arrow_circle";
    case "<":
      return "arrow_point";
    default:
      return "arrow_open";
  }
}
__name(edgeStrToEdgeStartData, "edgeStrToEdgeStartData");
function edgeStrToThickness(typeStr) {
  return typeStr.includes("==") ? "thick" : "normal";
}
__name(edgeStrToThickness, "edgeStrToThickness");
function edgeStrToPattern(typeStr) {
  if (typeStr.includes(".-")) {
    return "dotted";
  }
  return "solid";
}
__name(edgeStrToPattern, "edgeStrToPattern");
var cnt = 0;
var generateId = /* @__PURE__ */ __name(() => {
  cnt++;
  return "id-" + Math.random().toString(36).substr(2, 12) + "-" + cnt;
}, "generateId");
var setHierarchy = /* @__PURE__ */ __name((block) => {
  rootBlock.children = block;
  populateBlockDatabase(block, rootBlock);
  blocks = rootBlock.children;
}, "setHierarchy");
var getColumns = /* @__PURE__ */ __name((blockId) => {
  const block = blockDatabase.get(blockId);
  if (!block) {
    return -1;
  }
  if (block.columns) {
    return block.columns;
  }
  if (!block.children) {
    return -1;
  }
  return block.children.length;
}, "getColumns");
var getBlocksFlat = /* @__PURE__ */ __name(() => {
  return [...blockDatabase.values()];
}, "getBlocksFlat");
var getBlocks = /* @__PURE__ */ __name(() => {
  return blocks || [];
}, "getBlocks");
var getEdges = /* @__PURE__ */ __name(() => {
  return edgeList;
}, "getEdges");
var getBlock = /* @__PURE__ */ __name((id) => {
  return blockDatabase.get(id);
}, "getBlock");
var setBlock = /* @__PURE__ */ __name((block) => {
  blockDatabase.set(block.id, block);
}, "setBlock");
var setDiagramId = /* @__PURE__ */ __name((id) => {
  diagramId = id;
}, "setDiagramId");
var getDiagramId = /* @__PURE__ */ __name(() => diagramId, "getDiagramId");
var getLogger = /* @__PURE__ */ __name(() => log, "getLogger");
var getClasses = /* @__PURE__ */ __name(function() {
  return classes;
}, "getClasses");
var db = {
  getConfig: /* @__PURE__ */ __name(() => getConfig().block, "getConfig"),
  typeStr2Type,
  edgeTypeStr2Type,
  edgeStrToEdgeData,
  edgeStrToEdgeStartData,
  edgeStrToThickness,
  edgeStrToPattern,
  getLogger,
  getBlocksFlat,
  getBlocks,
  getEdges,
  setHierarchy,
  getBlock,
  setBlock,
  getColumns,
  getClasses,
  clear: clear2,
  generateId,
  setDiagramId,
  getDiagramId
};
var blockDB_default = db;
var fade = /* @__PURE__ */ __name((color, opacity) => {
  const channel2 = channel_default;
  const r = channel2(color, "r");
  const g = channel2(color, "g");
  const b = channel2(color, "b");
  return rgba_default(r, g, b, opacity);
}, "fade");
var getStyles = /* @__PURE__ */ __name((options) => `.label {
    font-family: ${options.fontFamily};
    color: ${options.nodeTextColor || options.textColor};
  }
  .cluster-label text {
    fill: ${options.titleColor};
  }
  .cluster-label span,p {
    color: ${options.titleColor};
  }



  .label text,span,p {
    fill: ${options.nodeTextColor || options.textColor};
    color: ${options.nodeTextColor || options.textColor};
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
  .flowchart-label text {
    text-anchor: middle;
  }
  // .flowchart-label .text-outer-tspan {
  //   text-anchor: middle;
  // }
  // .flowchart-label .text-inner-tspan {
  //   text-anchor: start;
  // }

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
    stroke-width: 2.0px;
  }

  .flowchart-link {
    stroke: ${options.lineColor};
    fill: none;
  }

  .edgeLabel {
    background-color: ${options.edgeLabelBackground};
    /*
     * This is for backward compatibility with existing code that didn't
     * add a \`<p>\` around edge labels.
     *
     * TODO: We should probably remove this in a future release.
     */
    p {
      margin: 0;
      padding: 0;
      display: inline;
    }
    rect {
      opacity: 0.5;
      background-color: ${options.edgeLabelBackground};
      fill: ${options.edgeLabelBackground};
    }
    text-align: center;
  }

  /* For html labels only */
  .labelBkg {
    background-color: ${options.edgeLabelBackground};
  }

  .node .cluster {
    // fill: ${fade(options.mainBkg, 0.5)};
    fill: ${fade(options.clusterBkg, 0.5)};
    stroke: ${fade(options.clusterBorder, 0.2)};
    box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
    stroke-width: 1px;
  }

  .cluster text {
    fill: ${options.titleColor};
  }

  .cluster span,p {
    color: ${options.titleColor};
  }
  /* .cluster div {
    color: ${options.titleColor};
  } */

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

  .flowchartTitleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${options.textColor};
  }
  ${getIconStyles()}
`, "getStyles");
var styles_default = getStyles;
var insertMarkers = /* @__PURE__ */ __name((elem, markerArray, type, id) => {
  markerArray.forEach((markerName) => {
    markers[markerName](elem, type, id);
  });
}, "insertMarkers");
var extension = /* @__PURE__ */ __name((elem, type, id) => {
  log.trace("Making markers for ", id);
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-extensionStart").attr("class", "marker extension " + type).attr("refX", 18).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 1,7 L18,13 V 1 Z");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-extensionEnd").attr("class", "marker extension " + type).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 1,1 V 13 L18,7 Z");
}, "extension");
var composition = /* @__PURE__ */ __name((elem, type, id) => {
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-compositionStart").attr("class", "marker composition " + type).attr("refX", 18).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-compositionEnd").attr("class", "marker composition " + type).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
}, "composition");
var aggregation = /* @__PURE__ */ __name((elem, type, id) => {
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-aggregationStart").attr("class", "marker aggregation " + type).attr("refX", 18).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-aggregationEnd").attr("class", "marker aggregation " + type).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
}, "aggregation");
var dependency = /* @__PURE__ */ __name((elem, type, id) => {
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-dependencyStart").attr("class", "marker dependency " + type).attr("refX", 6).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 5,7 L9,13 L1,7 L9,1 Z");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-dependencyEnd").attr("class", "marker dependency " + type).attr("refX", 13).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L14,7 L9,1 Z");
}, "dependency");
var lollipop = /* @__PURE__ */ __name((elem, type, id) => {
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-lollipopStart").attr("class", "marker lollipop " + type).attr("refX", 13).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("circle").attr("stroke", "black").attr("fill", "transparent").attr("cx", 7).attr("cy", 7).attr("r", 6);
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-lollipopEnd").attr("class", "marker lollipop " + type).attr("refX", 1).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("circle").attr("stroke", "black").attr("fill", "transparent").attr("cx", 7).attr("cy", 7).attr("r", 6);
}, "lollipop");
var point = /* @__PURE__ */ __name((elem, type, id) => {
  elem.append("marker").attr("id", id + "_" + type + "-pointEnd").attr("class", "marker " + type).attr("viewBox", "0 0 10 10").attr("refX", 6).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto").append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
  elem.append("marker").attr("id", id + "_" + type + "-pointStart").attr("class", "marker " + type).attr("viewBox", "0 0 10 10").attr("refX", 4.5).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto").append("path").attr("d", "M 0 5 L 10 10 L 10 0 z").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
}, "point");
var circle = /* @__PURE__ */ __name((elem, type, id) => {
  elem.append("marker").attr("id", id + "_" + type + "-circleEnd").attr("class", "marker " + type).attr("viewBox", "0 0 10 10").attr("refX", 11).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("circle").attr("cx", "5").attr("cy", "5").attr("r", "5").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
  elem.append("marker").attr("id", id + "_" + type + "-circleStart").attr("class", "marker " + type).attr("viewBox", "0 0 10 10").attr("refX", -1).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("circle").attr("cx", "5").attr("cy", "5").attr("r", "5").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
}, "circle");
var cross = /* @__PURE__ */ __name((elem, type, id) => {
  elem.append("marker").attr("id", id + "_" + type + "-crossEnd").attr("class", "marker cross " + type).attr("viewBox", "0 0 11 11").attr("refX", 12).attr("refY", 5.2).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("path").attr("d", "M 1,1 l 9,9 M 10,1 l -9,9").attr("class", "arrowMarkerPath").style("stroke-width", 2).style("stroke-dasharray", "1,0");
  elem.append("marker").attr("id", id + "_" + type + "-crossStart").attr("class", "marker cross " + type).attr("viewBox", "0 0 11 11").attr("refX", -1).attr("refY", 5.2).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("path").attr("d", "M 1,1 l 9,9 M 10,1 l -9,9").attr("class", "arrowMarkerPath").style("stroke-width", 2).style("stroke-dasharray", "1,0");
}, "cross");
var barb = /* @__PURE__ */ __name((elem, type, id) => {
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-barbEnd").attr("refX", 19).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 14).attr("markerUnits", "strokeWidth").attr("orient", "auto").append("path").attr("d", "M 19,7 L9,13 L14,7 L9,1 Z");
}, "barb");
var markers = {
  extension,
  composition,
  aggregation,
  dependency,
  lollipop,
  point,
  circle,
  cross,
  barb
};
var markers_default = insertMarkers;
var padding = getConfig2()?.block?.padding ?? 8;
function calculateBlockPosition(columns, position) {
  if (columns === 0 || !Number.isInteger(columns)) {
    throw new Error("Columns must be an integer !== 0.");
  }
  if (position < 0 || !Number.isInteger(position)) {
    throw new Error("Position must be a non-negative integer." + position);
  }
  if (columns < 0) {
    return { px: position, py: 0 };
  }
  if (columns === 1) {
    return { px: 0, py: position };
  }
  const px = position % columns;
  const py = Math.floor(position / columns);
  return { px, py };
}
__name(calculateBlockPosition, "calculateBlockPosition");
var getMaxChildSize = /* @__PURE__ */ __name((block) => {
  let maxWidth = 0;
  let maxHeight = 0;
  for (const child of block.children) {
    const { width, height, x, y } = child.size ?? { width: 0, height: 0, x: 0, y: 0 };
    log.debug("getMaxChildSize abc95 child:", child.id, "width:", width, "height:", height, "x:", x, "y:", y, child.type);
    if (child.type === "space") {
      continue;
    }
    const normalizedWidth = width / (child.widthInColumns ?? 1);
    if (normalizedWidth > maxWidth) {
      maxWidth = normalizedWidth;
    }
    if (height > maxHeight) {
      maxHeight = height;
    }
  }
  return { width: maxWidth, height: maxHeight };
}, "getMaxChildSize");
function setBlockSizes(block, db2, siblingWidth = 0, siblingHeight = 0) {
  log.debug("setBlockSizes abc95 (start)", block.id, block?.size?.x, "block width =", block?.size, "siblingWidth", siblingWidth);
  if (!block?.size?.width) {
    block.size = {
      width: siblingWidth,
      height: siblingHeight,
      x: 0,
      y: 0
    };
  }
  let maxWidth = 0;
  let maxHeight = 0;
  if (block.children?.length > 0) {
    for (const child of block.children) {
      setBlockSizes(child, db2);
    }
    const childSize = getMaxChildSize(block);
    maxWidth = childSize.width;
    maxHeight = childSize.height;
    log.debug("setBlockSizes abc95 maxWidth of", block.id, ":s children is ", maxWidth, maxHeight);
    for (const child of block.children) {
      if (child.size) {
        log.debug(`abc95 Setting size of children of ${block.id} id=${child.id} ${maxWidth} ${maxHeight} ${JSON.stringify(child.size)}`);
        child.size.width = maxWidth * (child.widthInColumns ?? 1) + padding * ((child.widthInColumns ?? 1) - 1);
        child.size.height = maxHeight;
        child.size.x = 0;
        child.size.y = 0;
        log.debug(`abc95 updating size of ${block.id} children child:${child.id} maxWidth:${maxWidth} maxHeight:${maxHeight}`);
      }
    }
    for (const child of block.children) {
      setBlockSizes(child, db2, maxWidth, maxHeight);
    }
    const columns = block.columns ?? -1;
    let numItems = 0;
    for (const child of block.children) {
      numItems += child.widthInColumns ?? 1;
    }
    let xSize = block.children.length;
    if (columns > 0 && columns < numItems) {
      xSize = columns;
    }
    const ySize = Math.ceil(numItems / xSize);
    let width = xSize * (maxWidth + padding) + padding;
    let height = ySize * (maxHeight + padding) + padding;
    if (width < siblingWidth) {
      log.debug(`Detected to small sibling: abc95 ${block.id} siblingWidth ${siblingWidth} siblingHeight ${siblingHeight} width ${width}`);
      width = siblingWidth;
      height = siblingHeight;
      const childWidth = (siblingWidth - xSize * padding - padding) / xSize;
      const childHeight = (siblingHeight - ySize * padding - padding) / ySize;
      log.debug("Size indata abc88", block.id, "childWidth", childWidth, "maxWidth", maxWidth);
      log.debug("Size indata abc88", block.id, "childHeight", childHeight, "maxHeight", maxHeight);
      log.debug("Size indata abc88 xSize", xSize, "padding", padding);
      for (const child of block.children) {
        if (child.size) {
          child.size.width = childWidth;
          child.size.height = childHeight;
          child.size.x = 0;
          child.size.y = 0;
        }
      }
    }
    log.debug(`abc95 (finale calc) ${block.id} xSize ${xSize} ySize ${ySize} columns ${columns}${block.children.length} width=${Math.max(width, block.size?.width || 0)}`);
    if (width < (block?.size?.width || 0)) {
      width = block?.size?.width || 0;
      const num = columns > 0 ? Math.min(block.children.length, columns) : block.children.length;
      if (num > 0) {
        const childWidth = (width - num * padding - padding) / num;
        log.debug("abc95 (growing to fit) width", block.id, width, block.size?.width, childWidth);
        for (const child of block.children) {
          if (child.size) {
            child.size.width = childWidth;
          }
        }
      }
    }
    block.size = {
      width,
      height,
      x: 0,
      y: 0
    };
  }
  log.debug("setBlockSizes abc94 (done)", block.id, block?.size?.x, block?.size?.width, block?.size?.y, block?.size?.height);
}
__name(setBlockSizes, "setBlockSizes");
function layoutBlocks(block, db2) {
  log.debug(`abc85 layout blocks (=>layoutBlocks) ${block.id} x: ${block?.size?.x} y: ${block?.size?.y} width: ${block?.size?.width}`);
  const columns = block.columns ?? -1;
  log.debug("layoutBlocks columns abc95", block.id, "=>", columns, block);
  if (block.children && block.children.length > 0) {
    const width = block?.children[0]?.size?.width ?? 0;
    const widthOfChildren = block.children.length * width + (block.children.length - 1) * padding;
    log.debug("widthOfChildren 88", widthOfChildren, "posX");
    const rowHeights = /* @__PURE__ */ new Map;
    {
      let colPos = 0;
      for (const child of block.children) {
        if (!child.size) {
          continue;
        }
        const { py } = calculateBlockPosition(columns, colPos);
        const currentMax = rowHeights.get(py) ?? 0;
        if (child.size.height > currentMax) {
          rowHeights.set(py, child.size.height);
        }
        let filled = child?.widthInColumns ?? 1;
        if (columns > 0) {
          filled = Math.min(filled, columns - colPos % columns);
        }
        colPos += filled;
      }
    }
    const rowYOffsets = /* @__PURE__ */ new Map;
    {
      let offset = 0;
      const rows = [...rowHeights.keys()].sort((a, b) => a - b);
      for (const row of rows) {
        rowYOffsets.set(row, offset);
        offset += (rowHeights.get(row) ?? 0) + padding;
      }
    }
    let columnPos = 0;
    log.debug("abc91 block?.size?.x", block.id, block?.size?.x);
    let startingPosX = block?.size?.x ? block?.size?.x + (-block?.size?.width / 2 || 0) : -padding;
    let rowPos = 0;
    for (const child of block.children) {
      const parent = block;
      if (!child.size) {
        continue;
      }
      const { width: width2, height } = child.size;
      const { px, py } = calculateBlockPosition(columns, columnPos);
      if (py != rowPos) {
        rowPos = py;
        startingPosX = block?.size?.x ? block?.size?.x + (-block?.size?.width / 2 || 0) : -padding;
        log.debug("New row in layout for block", block.id, " and child ", child.id, rowPos);
      }
      log.debug(`abc89 layout blocks (child) id: ${child.id} Pos: ${columnPos} (px, py) ${px},${py} (${parent?.size?.x},${parent?.size?.y}) parent: ${parent.id} width: ${width2}${padding}`);
      if (parent.size) {
        const halfWidth = width2 / 2;
        child.size.x = startingPosX + padding + halfWidth;
        log.debug(`abc91 layout blocks (calc) px, pyid:${child.id} startingPos=X${startingPosX} new startingPosX${child.size.x} ${halfWidth} padding=${padding} width=${width2} halfWidth=${halfWidth} => x:${child.size.x} y:${child.size.y} ${child.widthInColumns} (width * (child?.w || 1)) / 2 ${width2 * (child?.widthInColumns ?? 1) / 2}`);
        startingPosX = child.size.x + halfWidth;
        const rowYOffset = rowYOffsets.get(py) ?? 0;
        const rowHeight = rowHeights.get(py) ?? height;
        child.size.y = parent.size.y - parent.size.height / 2 + rowYOffset + rowHeight / 2 + padding;
        log.debug(`abc88 layout blocks (calc) px, pyid:${child.id}startingPosX${startingPosX}${padding}${halfWidth}=>x:${child.size.x}y:${child.size.y}${child.widthInColumns}(width * (child?.w || 1)) / 2${width2 * (child?.widthInColumns ?? 1) / 2}`);
      }
      if (child.children) {
        layoutBlocks(child, db2);
      }
      let columnsFilled = child?.widthInColumns ?? 1;
      if (columns > 0) {
        columnsFilled = Math.min(columnsFilled, columns - columnPos % columns);
      }
      columnPos += columnsFilled;
      log.debug("abc88 columnsPos", child, columnPos);
    }
  }
  log.debug(`layout blocks (<==layoutBlocks) ${block.id} x: ${block?.size?.x} y: ${block?.size?.y} width: ${block?.size?.width}`);
}
__name(layoutBlocks, "layoutBlocks");
function findBounds(block, { minX, minY, maxX, maxY } = { minX: 0, minY: 0, maxX: 0, maxY: 0 }) {
  if (block.size && block.id !== "root") {
    const { x, y, width, height } = block.size;
    if (x - width / 2 < minX) {
      minX = x - width / 2;
    }
    if (y - height / 2 < minY) {
      minY = y - height / 2;
    }
    if (x + width / 2 > maxX) {
      maxX = x + width / 2;
    }
    if (y + height / 2 > maxY) {
      maxY = y + height / 2;
    }
  }
  if (block.children) {
    for (const child of block.children) {
      ({ minX, minY, maxX, maxY } = findBounds(child, { minX, minY, maxX, maxY }));
    }
  }
  return { minX, minY, maxX, maxY };
}
__name(findBounds, "findBounds");
function layout(db2) {
  const root = db2.getBlock("root");
  if (!root) {
    return;
  }
  setBlockSizes(root, db2, 0, 0);
  layoutBlocks(root, db2);
  log.debug("getBlocks", JSON.stringify(root, null, 2));
  const { minX, minY, maxX, maxY } = findBounds(root);
  const height = maxY - minY;
  const width = maxX - minX;
  return { x: minX, y: minY, width, height };
}
__name(layout, "layout");
var createLabel = /* @__PURE__ */ __name(async (element, _vertexText, style, isTitle = false, isNode = false) => {
  let vertexText = _vertexText || "";
  if (typeof vertexText === "object") {
    vertexText = vertexText[0];
  }
  const config2 = getConfig2();
  const useHtmlLabels = getEffectiveHtmlLabels(config2);
  return await createText(element, vertexText, {
    style,
    isTitle,
    useHtmlLabels,
    markdown: false,
    isNode,
    width: Number.POSITIVE_INFINITY
  }, config2);
}, "createLabel");
var createLabel_default = createLabel;
var addEdgeMarkers = /* @__PURE__ */ __name((svgPath, edge, url, id, diagramType) => {
  if (edge.arrowTypeStart) {
    addEdgeMarker(svgPath, "start", edge.arrowTypeStart, url, id, diagramType);
  }
  if (edge.arrowTypeEnd) {
    addEdgeMarker(svgPath, "end", edge.arrowTypeEnd, url, id, diagramType);
  }
}, "addEdgeMarkers");
var arrowTypesMap = {
  arrow_cross: "cross",
  arrow_point: "point",
  arrow_barb: "barb",
  arrow_circle: "circle",
  aggregation: "aggregation",
  extension: "extension",
  composition: "composition",
  dependency: "dependency",
  lollipop: "lollipop"
};
var addEdgeMarker = /* @__PURE__ */ __name((svgPath, position, arrowType, url, id, diagramType) => {
  const endMarkerType = arrowTypesMap[arrowType];
  if (!endMarkerType) {
    log.warn(`Unknown arrow type: ${arrowType}`);
    return;
  }
  const suffix = position === "start" ? "Start" : "End";
  svgPath.attr(`marker-${position}`, `url(${url}#${id}_${diagramType}-${endMarkerType}${suffix})`);
}, "addEdgeMarker");
var edgeLabels = {};
var terminalLabels = {};
var insertEdgeLabel = /* @__PURE__ */ __name(async (elem, edge) => {
  const config2 = getConfig2();
  const useHtmlLabels = getEffectiveHtmlLabels(config2);
  const edgeLabel = elem.insert("g").attr("class", "edgeLabel");
  const label = edgeLabel.insert("g").attr("class", "label");
  const isMarkdown = edge.labelType === "markdown";
  const labelElement = await createText(elem, edge.label, {
    style: edge.labelStyle,
    useHtmlLabels,
    addSvgBackground: isMarkdown,
    isNode: false,
    markdown: isMarkdown,
    width: isMarkdown ? undefined : Number.POSITIVE_INFINITY
  }, config2);
  label.node().appendChild(labelElement);
  let bbox = labelElement.getBBox();
  let transformBbox = bbox;
  if (useHtmlLabels) {
    const div = labelElement.children[0];
    const dv = select_default(labelElement);
    bbox = div.getBoundingClientRect();
    transformBbox = bbox;
    dv.attr("width", bbox.width);
    dv.attr("height", bbox.height);
  } else {
    const textEl = select_default(labelElement).select("text").node();
    if (textEl && typeof textEl.getBBox === "function") {
      transformBbox = textEl.getBBox();
    }
  }
  label.attr("transform", computeLabelTransform(transformBbox, useHtmlLabels));
  edgeLabels[edge.id] = edgeLabel;
  edge.width = bbox.width;
  edge.height = bbox.height;
  let fo;
  if (edge.startLabelLeft) {
    const startEdgeLabelLeft = elem.insert("g").attr("class", "edgeTerminals");
    const inner = startEdgeLabelLeft.insert("g").attr("class", "inner");
    const startLabelElement = await createLabel_default(inner, edge.startLabelLeft, edge.labelStyle);
    fo = startLabelElement;
    let slBox = startLabelElement.getBBox();
    if (useHtmlLabels) {
      const div = startLabelElement.children[0];
      const dv = select_default(startLabelElement);
      slBox = div.getBoundingClientRect();
      dv.attr("width", slBox.width);
      dv.attr("height", slBox.height);
    }
    inner.attr("transform", computeLabelTransform(slBox, useHtmlLabels));
    if (!terminalLabels[edge.id]) {
      terminalLabels[edge.id] = {};
    }
    terminalLabels[edge.id].startLeft = startEdgeLabelLeft;
    setTerminalWidth(fo, edge.startLabelLeft);
  }
  if (edge.startLabelRight) {
    const startEdgeLabelRight = elem.insert("g").attr("class", "edgeTerminals");
    const inner = startEdgeLabelRight.insert("g").attr("class", "inner");
    const startLabelElement = await createLabel_default(inner, edge.startLabelRight, edge.labelStyle);
    fo = startLabelElement;
    let slBox = startLabelElement.getBBox();
    if (useHtmlLabels) {
      const div = startLabelElement.children[0];
      const dv = select_default(startLabelElement);
      slBox = div.getBoundingClientRect();
      dv.attr("width", slBox.width);
      dv.attr("height", slBox.height);
    }
    inner.attr("transform", computeLabelTransform(slBox, useHtmlLabels));
    if (!terminalLabels[edge.id]) {
      terminalLabels[edge.id] = {};
    }
    terminalLabels[edge.id].startRight = startEdgeLabelRight;
    setTerminalWidth(fo, edge.startLabelRight);
  }
  if (edge.endLabelLeft) {
    const endEdgeLabelLeft = elem.insert("g").attr("class", "edgeTerminals");
    const inner = endEdgeLabelLeft.insert("g").attr("class", "inner");
    const endLabelElement = await createLabel_default(endEdgeLabelLeft, edge.endLabelLeft, edge.labelStyle);
    fo = endLabelElement;
    let slBox = endLabelElement.getBBox();
    if (useHtmlLabels) {
      const div = endLabelElement.children[0];
      const dv = select_default(endLabelElement);
      slBox = div.getBoundingClientRect();
      dv.attr("width", slBox.width);
      dv.attr("height", slBox.height);
    }
    inner.attr("transform", computeLabelTransform(slBox, useHtmlLabels));
    if (!terminalLabels[edge.id]) {
      terminalLabels[edge.id] = {};
    }
    terminalLabels[edge.id].endLeft = endEdgeLabelLeft;
    setTerminalWidth(fo, edge.endLabelLeft);
  }
  if (edge.endLabelRight) {
    const endEdgeLabelRight = elem.insert("g").attr("class", "edgeTerminals");
    const inner = endEdgeLabelRight.insert("g").attr("class", "inner");
    const endLabelElement = await createLabel_default(endEdgeLabelRight, edge.endLabelRight, edge.labelStyle);
    fo = endLabelElement;
    let slBox = endLabelElement.getBBox();
    if (useHtmlLabels) {
      const div = endLabelElement.children[0];
      const dv = select_default(endLabelElement);
      slBox = div.getBoundingClientRect();
      dv.attr("width", slBox.width);
      dv.attr("height", slBox.height);
    }
    inner.attr("transform", computeLabelTransform(slBox, useHtmlLabels));
    if (!terminalLabels[edge.id]) {
      terminalLabels[edge.id] = {};
    }
    terminalLabels[edge.id].endRight = endEdgeLabelRight;
    setTerminalWidth(fo, edge.endLabelRight);
  }
  return labelElement;
}, "insertEdgeLabel");
function setTerminalWidth(fo, value) {
  if (getEffectiveHtmlLabels(getConfig2()) && fo) {
    fo.style.width = value.length * 9 + "px";
    fo.style.height = "12px";
  }
}
__name(setTerminalWidth, "setTerminalWidth");
var positionEdgeLabel = /* @__PURE__ */ __name((edge, paths) => {
  log.debug("Moving label abc88 ", edge.id, edge.label, edgeLabels[edge.id], paths);
  let path = paths.updatedPath ? paths.updatedPath : paths.originalPath;
  const siteConfig = getConfig2();
  const { subGraphTitleTotalMargin } = getSubGraphTitleMargins(siteConfig);
  if (edge.label) {
    const el = edgeLabels[edge.id];
    let x = edge.x;
    let y = edge.y;
    if (path) {
      const pos = utils_default.calcLabelPosition(path);
      log.debug("Moving label " + edge.label + " from (", x, ",", y, ") to (", pos.x, ",", pos.y, ") abc88");
      if (paths.updatedPath) {
        x = pos.x;
        y = pos.y;
      }
    }
    el.attr("transform", `translate(${x}, ${y + subGraphTitleTotalMargin / 2})`);
  }
  if (edge.startLabelLeft) {
    const el = terminalLabels[edge.id].startLeft;
    let x = edge.x;
    let y = edge.y;
    if (path) {
      const pos = utils_default.calcTerminalLabelPosition(edge.arrowTypeStart ? 10 : 0, "start_left", path);
      x = pos.x;
      y = pos.y;
    }
    el.attr("transform", `translate(${x}, ${y})`);
  }
  if (edge.startLabelRight) {
    const el = terminalLabels[edge.id].startRight;
    let x = edge.x;
    let y = edge.y;
    if (path) {
      const pos = utils_default.calcTerminalLabelPosition(edge.arrowTypeStart ? 10 : 0, "start_right", path);
      x = pos.x;
      y = pos.y;
    }
    el.attr("transform", `translate(${x}, ${y})`);
  }
  if (edge.endLabelLeft) {
    const el = terminalLabels[edge.id].endLeft;
    let x = edge.x;
    let y = edge.y;
    if (path) {
      const pos = utils_default.calcTerminalLabelPosition(edge.arrowTypeEnd ? 10 : 0, "end_left", path);
      x = pos.x;
      y = pos.y;
    }
    el.attr("transform", `translate(${x}, ${y})`);
  }
  if (edge.endLabelRight) {
    const el = terminalLabels[edge.id].endRight;
    let x = edge.x;
    let y = edge.y;
    if (path) {
      const pos = utils_default.calcTerminalLabelPosition(edge.arrowTypeEnd ? 10 : 0, "end_right", path);
      x = pos.x;
      y = pos.y;
    }
    el.attr("transform", `translate(${x}, ${y})`);
  }
}, "positionEdgeLabel");
var outsideNode = /* @__PURE__ */ __name((node, point2) => {
  const x = node.x;
  const y = node.y;
  const dx = Math.abs(point2.x - x);
  const dy = Math.abs(point2.y - y);
  const w = node.width / 2;
  const h = node.height / 2;
  if (dx >= w || dy >= h) {
    return true;
  }
  return false;
}, "outsideNode");
var intersection = /* @__PURE__ */ __name((node, outsidePoint, insidePoint) => {
  log.debug(`intersection calc abc89:
  outsidePoint: ${JSON.stringify(outsidePoint)}
  insidePoint : ${JSON.stringify(insidePoint)}
  node        : x:${node.x} y:${node.y} w:${node.width} h:${node.height}`);
  const x = node.x;
  const y = node.y;
  const dx = Math.abs(x - insidePoint.x);
  const w = node.width / 2;
  let r = insidePoint.x < outsidePoint.x ? w - dx : w + dx;
  const h = node.height / 2;
  const Q = Math.abs(outsidePoint.y - insidePoint.y);
  const R = Math.abs(outsidePoint.x - insidePoint.x);
  if (Math.abs(y - outsidePoint.y) * w > Math.abs(x - outsidePoint.x) * h) {
    let q = insidePoint.y < outsidePoint.y ? outsidePoint.y - h - y : y - h - outsidePoint.y;
    r = R * q / Q;
    const res = {
      x: insidePoint.x < outsidePoint.x ? insidePoint.x + r : insidePoint.x - R + r,
      y: insidePoint.y < outsidePoint.y ? insidePoint.y + Q - q : insidePoint.y - Q + q
    };
    if (r === 0) {
      res.x = outsidePoint.x;
      res.y = outsidePoint.y;
    }
    if (R === 0) {
      res.x = outsidePoint.x;
    }
    if (Q === 0) {
      res.y = outsidePoint.y;
    }
    log.debug(`abc89 topp/bott calc, Q ${Q}, q ${q}, R ${R}, r ${r}`, res);
    return res;
  } else {
    if (insidePoint.x < outsidePoint.x) {
      r = outsidePoint.x - w - x;
    } else {
      r = x - w - outsidePoint.x;
    }
    let q = Q * r / R;
    let _x = insidePoint.x < outsidePoint.x ? insidePoint.x + R - r : insidePoint.x - R + r;
    let _y = insidePoint.y < outsidePoint.y ? insidePoint.y + q : insidePoint.y - q;
    log.debug(`sides calc abc89, Q ${Q}, q ${q}, R ${R}, r ${r}`, { _x, _y });
    if (r === 0) {
      _x = outsidePoint.x;
      _y = outsidePoint.y;
    }
    if (R === 0) {
      _x = outsidePoint.x;
    }
    if (Q === 0) {
      _y = outsidePoint.y;
    }
    return { x: _x, y: _y };
  }
}, "intersection");
var cutPathAtIntersect = /* @__PURE__ */ __name((_points, boundaryNode) => {
  log.debug("abc88 cutPathAtIntersect", _points, boundaryNode);
  let points = [];
  let lastPointOutside = _points[0];
  let isInside = false;
  _points.forEach((point2) => {
    if (!outsideNode(boundaryNode, point2) && !isInside) {
      const inter = intersection(boundaryNode, lastPointOutside, point2);
      let pointPresent = false;
      points.forEach((p) => {
        pointPresent = pointPresent || p.x === inter.x && p.y === inter.y;
      });
      if (!points.some((e) => e.x === inter.x && e.y === inter.y)) {
        points.push(inter);
      }
      isInside = true;
    } else {
      lastPointOutside = point2;
      if (!isInside) {
        points.push(point2);
      }
    }
  });
  return points;
}, "cutPathAtIntersect");
var insertEdge = /* @__PURE__ */ __name(function(elem, e, edge, clusterDb, diagramType, graph, id) {
  let points = edge.points;
  log.debug("abc88 InsertEdge: edge=", edge, "e=", e);
  let pointsHasChanged = false;
  const tail = graph.node(e.v);
  var head = graph.node(e.w);
  if (head?.intersect && tail?.intersect) {
    points = points.slice(1, edge.points.length - 1);
    points.unshift(tail.intersect(points[0]));
    points.push(head.intersect(points[points.length - 1]));
  }
  if (edge.toCluster) {
    log.debug("to cluster abc88", clusterDb[edge.toCluster]);
    points = cutPathAtIntersect(edge.points, clusterDb[edge.toCluster].node);
    pointsHasChanged = true;
  }
  if (edge.fromCluster) {
    log.debug("from cluster abc88", clusterDb[edge.fromCluster]);
    points = cutPathAtIntersect(points.reverse(), clusterDb[edge.fromCluster].node).reverse();
    pointsHasChanged = true;
  }
  const lineData = points.filter((p) => !Number.isNaN(p.y));
  let curve = basis_default;
  if (edge.curve && (diagramType === "graph" || diagramType === "flowchart")) {
    curve = edge.curve;
  }
  const { x, y } = getLineFunctionsWithOffset(edge);
  const lineFunction = line_default().x(x).y(y).curve(curve);
  let strokeClasses;
  switch (edge.thickness) {
    case "normal":
      strokeClasses = "edge-thickness-normal";
      break;
    case "thick":
      strokeClasses = "edge-thickness-thick";
      break;
    case "invisible":
      strokeClasses = "edge-thickness-thick";
      break;
    default:
      strokeClasses = "";
  }
  switch (edge.pattern) {
    case "solid":
      strokeClasses += " edge-pattern-solid";
      break;
    case "dotted":
      strokeClasses += " edge-pattern-dotted";
      break;
    case "dashed":
      strokeClasses += " edge-pattern-dashed";
      break;
  }
  const svgPath = elem.append("path").attr("d", lineFunction(lineData)).attr("id", edge.id).attr("class", " " + strokeClasses + (edge.classes ? " " + edge.classes : "")).attr("style", edge.style);
  let url = "";
  if (getConfig2().flowchart.arrowMarkerAbsolute || getConfig2().state.arrowMarkerAbsolute) {
    url = getUrl(true);
  }
  addEdgeMarkers(svgPath, edge, url, id, diagramType);
  let paths = {};
  if (pointsHasChanged) {
    paths.updatedPath = points;
  }
  paths.originalPath = edge.points;
  return paths;
}, "insertEdge");
var expandAndDeduplicateDirections = /* @__PURE__ */ __name((directions) => {
  const uniqueDirections = /* @__PURE__ */ new Set;
  for (const direction of directions) {
    switch (direction) {
      case "x":
        uniqueDirections.add("right");
        uniqueDirections.add("left");
        break;
      case "y":
        uniqueDirections.add("up");
        uniqueDirections.add("down");
        break;
      default:
        uniqueDirections.add(direction);
        break;
    }
  }
  return uniqueDirections;
}, "expandAndDeduplicateDirections");
var getArrowPoints = /* @__PURE__ */ __name((duplicatedDirections, bbox, node, totalWidth) => {
  const directions = expandAndDeduplicateDirections(duplicatedDirections);
  const f = 2;
  const height = bbox.height + 2 * node.padding;
  const midpoint = height / f;
  const width = totalWidth ?? bbox.width + 2 * midpoint + node.padding;
  const padding2 = node.padding / 2;
  if (directions.has("right") && directions.has("left") && directions.has("up") && directions.has("down")) {
    return [
      { x: 0, y: 0 },
      { x: midpoint, y: 0 },
      { x: width / 2, y: 2 * padding2 },
      { x: width - midpoint, y: 0 },
      { x: width, y: 0 },
      { x: width, y: -height / 3 },
      { x: width + 2 * padding2, y: -height / 2 },
      { x: width, y: -2 * height / 3 },
      { x: width, y: -height },
      { x: width - midpoint, y: -height },
      { x: width / 2, y: -height - 2 * padding2 },
      { x: midpoint, y: -height },
      { x: 0, y: -height },
      { x: 0, y: -2 * height / 3 },
      { x: -2 * padding2, y: -height / 2 },
      { x: 0, y: -height / 3 }
    ];
  }
  if (directions.has("right") && directions.has("left") && directions.has("up")) {
    return [
      { x: midpoint, y: 0 },
      { x: width - midpoint, y: 0 },
      { x: width, y: -height / 2 },
      { x: width - midpoint, y: -height },
      { x: midpoint, y: -height },
      { x: 0, y: -height / 2 }
    ];
  }
  if (directions.has("right") && directions.has("left") && directions.has("down")) {
    return [
      { x: 0, y: 0 },
      { x: midpoint, y: -height },
      { x: width - midpoint, y: -height },
      { x: width, y: 0 }
    ];
  }
  if (directions.has("right") && directions.has("up") && directions.has("down")) {
    return [
      { x: 0, y: 0 },
      { x: width, y: -midpoint },
      { x: width, y: -height + midpoint },
      { x: 0, y: -height }
    ];
  }
  if (directions.has("left") && directions.has("up") && directions.has("down")) {
    return [
      { x: width, y: 0 },
      { x: 0, y: -midpoint },
      { x: 0, y: -height + midpoint },
      { x: width, y: -height }
    ];
  }
  if (directions.has("right") && directions.has("left")) {
    return [
      { x: midpoint, y: 0 },
      { x: midpoint, y: -padding2 },
      { x: width - midpoint, y: -padding2 },
      { x: width - midpoint, y: 0 },
      { x: width, y: -height / 2 },
      { x: width - midpoint, y: -height },
      { x: width - midpoint, y: -height + padding2 },
      { x: midpoint, y: -height + padding2 },
      { x: midpoint, y: -height },
      { x: 0, y: -height / 2 }
    ];
  }
  if (directions.has("up") && directions.has("down")) {
    return [
      { x: width / 2, y: 0 },
      { x: 0, y: -padding2 },
      { x: midpoint, y: -padding2 },
      { x: midpoint, y: -height + padding2 },
      { x: 0, y: -height + padding2 },
      { x: width / 2, y: -height },
      { x: width, y: -height + padding2 },
      { x: width - midpoint, y: -height + padding2 },
      { x: width - midpoint, y: -padding2 },
      { x: width, y: -padding2 }
    ];
  }
  if (directions.has("right") && directions.has("up")) {
    return [
      { x: 0, y: 0 },
      { x: width, y: -midpoint },
      { x: 0, y: -height }
    ];
  }
  if (directions.has("right") && directions.has("down")) {
    return [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: 0, y: -height }
    ];
  }
  if (directions.has("left") && directions.has("up")) {
    return [
      { x: width, y: 0 },
      { x: 0, y: -midpoint },
      { x: width, y: -height }
    ];
  }
  if (directions.has("left") && directions.has("down")) {
    return [
      { x: width, y: 0 },
      { x: 0, y: 0 },
      { x: width, y: -height }
    ];
  }
  if (directions.has("right")) {
    return [
      { x: midpoint, y: -padding2 },
      { x: midpoint, y: -padding2 },
      { x: width - midpoint, y: -padding2 },
      { x: width - midpoint, y: 0 },
      { x: width, y: -height / 2 },
      { x: width - midpoint, y: -height },
      { x: width - midpoint, y: -height + padding2 },
      { x: midpoint, y: -height + padding2 },
      { x: midpoint, y: -height + padding2 }
    ];
  }
  if (directions.has("left")) {
    return [
      { x: midpoint, y: 0 },
      { x: midpoint, y: -padding2 },
      { x: width - midpoint, y: -padding2 },
      { x: width - midpoint, y: -height + padding2 },
      { x: midpoint, y: -height + padding2 },
      { x: midpoint, y: -height },
      { x: 0, y: -height / 2 }
    ];
  }
  if (directions.has("up")) {
    return [
      { x: midpoint, y: -padding2 },
      { x: midpoint, y: -height + padding2 },
      { x: 0, y: -height + padding2 },
      { x: width / 2, y: -height },
      { x: width, y: -height + padding2 },
      { x: width - midpoint, y: -height + padding2 },
      { x: width - midpoint, y: -padding2 }
    ];
  }
  if (directions.has("down")) {
    return [
      { x: width / 2, y: 0 },
      { x: 0, y: -padding2 },
      { x: midpoint, y: -padding2 },
      { x: midpoint, y: -height + padding2 },
      { x: width - midpoint, y: -height + padding2 },
      { x: width - midpoint, y: -padding2 },
      { x: width, y: -padding2 }
    ];
  }
  return [{ x: 0, y: 0 }];
}, "getArrowPoints");
function intersectNode(node, point2) {
  return node.intersect(point2);
}
__name(intersectNode, "intersectNode");
var intersect_node_default = intersectNode;
function intersectEllipse(node, rx, ry, point2) {
  var cx = node.x;
  var cy = node.y;
  var px = cx - point2.x;
  var py = cy - point2.y;
  var det = Math.sqrt(rx * rx * py * py + ry * ry * px * px);
  var dx = Math.abs(rx * ry * px / det);
  if (point2.x < cx) {
    dx = -dx;
  }
  var dy = Math.abs(rx * ry * py / det);
  if (point2.y < cy) {
    dy = -dy;
  }
  return { x: cx + dx, y: cy + dy };
}
__name(intersectEllipse, "intersectEllipse");
var intersect_ellipse_default = intersectEllipse;
function intersectCircle(node, rx, point2) {
  return intersect_ellipse_default(node, rx, rx, point2);
}
__name(intersectCircle, "intersectCircle");
var intersect_circle_default = intersectCircle;
function intersectLine(p1, p2, q1, q2) {
  var a1, a2, b1, b2, c1, c2;
  var r1, r2, r3, r4;
  var denom, offset, num;
  var x, y;
  a1 = p2.y - p1.y;
  b1 = p1.x - p2.x;
  c1 = p2.x * p1.y - p1.x * p2.y;
  r3 = a1 * q1.x + b1 * q1.y + c1;
  r4 = a1 * q2.x + b1 * q2.y + c1;
  if (r3 !== 0 && r4 !== 0 && sameSign(r3, r4)) {
    return;
  }
  a2 = q2.y - q1.y;
  b2 = q1.x - q2.x;
  c2 = q2.x * q1.y - q1.x * q2.y;
  r1 = a2 * p1.x + b2 * p1.y + c2;
  r2 = a2 * p2.x + b2 * p2.y + c2;
  if (r1 !== 0 && r2 !== 0 && sameSign(r1, r2)) {
    return;
  }
  denom = a1 * b2 - a2 * b1;
  if (denom === 0) {
    return;
  }
  offset = Math.abs(denom / 2);
  num = b1 * c2 - b2 * c1;
  x = num < 0 ? (num - offset) / denom : (num + offset) / denom;
  num = a2 * c1 - a1 * c2;
  y = num < 0 ? (num - offset) / denom : (num + offset) / denom;
  return { x, y };
}
__name(intersectLine, "intersectLine");
function sameSign(r1, r2) {
  return r1 * r2 > 0;
}
__name(sameSign, "sameSign");
var intersect_line_default = intersectLine;
var intersect_polygon_default = intersectPolygon;
function intersectPolygon(node, polyPoints, point2) {
  var x1 = node.x;
  var y1 = node.y;
  var intersections = [];
  var minX = Number.POSITIVE_INFINITY;
  var minY = Number.POSITIVE_INFINITY;
  if (typeof polyPoints.forEach === "function") {
    polyPoints.forEach(function(entry) {
      minX = Math.min(minX, entry.x);
      minY = Math.min(minY, entry.y);
    });
  } else {
    minX = Math.min(minX, polyPoints.x);
    minY = Math.min(minY, polyPoints.y);
  }
  var left = x1 - node.width / 2 - minX;
  var top = y1 - node.height / 2 - minY;
  for (var i = 0;i < polyPoints.length; i++) {
    var p1 = polyPoints[i];
    var p2 = polyPoints[i < polyPoints.length - 1 ? i + 1 : 0];
    var intersect = intersect_line_default(node, point2, { x: left + p1.x, y: top + p1.y }, { x: left + p2.x, y: top + p2.y });
    if (intersect) {
      intersections.push(intersect);
    }
  }
  if (!intersections.length) {
    return node;
  }
  if (intersections.length > 1) {
    intersections.sort(function(p, q) {
      var pdx = p.x - point2.x;
      var pdy = p.y - point2.y;
      var distp = Math.sqrt(pdx * pdx + pdy * pdy);
      var qdx = q.x - point2.x;
      var qdy = q.y - point2.y;
      var distq = Math.sqrt(qdx * qdx + qdy * qdy);
      return distp < distq ? -1 : distp === distq ? 0 : 1;
    });
  }
  return intersections[0];
}
__name(intersectPolygon, "intersectPolygon");
var intersectRect = /* @__PURE__ */ __name((node, point2) => {
  var x = node.x;
  var y = node.y;
  var dx = point2.x - x;
  var dy = point2.y - y;
  var w = node.width / 2;
  var h = node.height / 2;
  var sx, sy;
  if (Math.abs(dy) * w > Math.abs(dx) * h) {
    if (dy < 0) {
      h = -h;
    }
    sx = dy === 0 ? 0 : h * dx / dy;
    sy = h;
  } else {
    if (dx < 0) {
      w = -w;
    }
    sx = w;
    sy = dx === 0 ? 0 : w * dy / dx;
  }
  return { x: x + sx, y: y + sy };
}, "intersectRect");
var intersect_rect_default = intersectRect;
var intersect_default = {
  node: intersect_node_default,
  circle: intersect_circle_default,
  ellipse: intersect_ellipse_default,
  polygon: intersect_polygon_default,
  rect: intersect_rect_default
};
var labelHelper = /* @__PURE__ */ __name(async (parent, node, _classes, isNode) => {
  const config2 = getConfig2();
  let classes2;
  const useHtmlLabels = node.useHtmlLabels || getEffectiveHtmlLabels(config2);
  if (!_classes) {
    classes2 = "node default";
  } else {
    classes2 = _classes;
  }
  const shapeSvg = parent.insert("g").attr("class", classes2).attr("id", node.domId || node.id);
  const label = shapeSvg.insert("g").attr("class", "label").attr("style", node.labelStyle);
  let labelText;
  if (node.labelText === undefined) {
    labelText = "";
  } else {
    labelText = typeof node.labelText === "string" ? node.labelText : node.labelText[0];
  }
  let text;
  if (node.labelType === "markdown") {
    text = createText(label, sanitizeText(decodeEntities(labelText), config2), {
      useHtmlLabels,
      width: node.width || config2.flowchart.wrappingWidth,
      classes: "markdown-node-label"
    }, config2);
  } else {
    text = await createLabel_default(label, sanitizeText(decodeEntities(labelText), config2), node.labelStyle, false, isNode);
  }
  let bbox = text.getBBox();
  const halfPadding = node.padding / 2;
  if (getEffectiveHtmlLabels(config2)) {
    const div = text.children[0];
    const dv = select_default(text);
    await configureLabelImages(div, labelText);
    bbox = div.getBoundingClientRect();
    dv.attr("width", bbox.width);
    dv.attr("height", bbox.height);
  }
  if (useHtmlLabels) {
    label.attr("transform", "translate(" + -bbox.width / 2 + ", " + -bbox.height / 2 + ")");
  } else {
    label.attr("transform", "translate(0, " + -bbox.height / 2 + ")");
  }
  if (node.centerLabel) {
    label.attr("transform", "translate(" + -bbox.width / 2 + ", " + -bbox.height / 2 + ")");
  }
  label.insert("rect", ":first-child");
  return { shapeSvg, bbox, halfPadding, label };
}, "labelHelper");
var updateNodeBounds = /* @__PURE__ */ __name((node, element) => {
  const bbox = element.node().getBBox();
  node.width = bbox.width;
  node.height = bbox.height;
}, "updateNodeBounds");
function insertPolygonShape(parent, w, h, points) {
  return parent.insert("polygon", ":first-child").attr("points", points.map(function(d) {
    return d.x + "," + d.y;
  }).join(" ")).attr("class", "label-container").attr("transform", "translate(" + -w / 2 + "," + h / 2 + ")");
}
__name(insertPolygonShape, "insertPolygonShape");
var note = /* @__PURE__ */ __name(async (parent, node) => {
  const useHtmlLabels = node.useHtmlLabels || getEffectiveHtmlLabels(getConfig2());
  if (!useHtmlLabels) {
    node.centerLabel = true;
  }
  const { shapeSvg, bbox, halfPadding } = await labelHelper(parent, node, "node " + node.classes, true);
  log.info("Classes = ", node.classes);
  const rect2 = shapeSvg.insert("rect", ":first-child");
  rect2.attr("rx", node.rx).attr("ry", node.ry).attr("x", -bbox.width / 2 - halfPadding).attr("y", -bbox.height / 2 - halfPadding).attr("width", bbox.width + node.padding).attr("height", bbox.height + node.padding);
  updateNodeBounds(node, rect2);
  node.intersect = function(point2) {
    return intersect_default.rect(node, point2);
  };
  return shapeSvg;
}, "note");
var note_default = note;
var formatClass = /* @__PURE__ */ __name((str) => {
  if (str) {
    return " " + str;
  }
  return "";
}, "formatClass");
var getClassesFromNode = /* @__PURE__ */ __name((node, otherClasses) => {
  return `${otherClasses ? otherClasses : "node default"}${formatClass(node.classes)} ${formatClass(node.class)}`;
}, "getClassesFromNode");
var question = /* @__PURE__ */ __name(async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, getClassesFromNode(node, undefined), true);
  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const s = w + h;
  const points = [
    { x: s / 2, y: 0 },
    { x: s, y: -s / 2 },
    { x: s / 2, y: -s },
    { x: 0, y: -s / 2 }
  ];
  log.info("Question main (Circle)");
  const questionElem = insertPolygonShape(shapeSvg, s, s, points);
  questionElem.attr("style", node.style);
  updateNodeBounds(node, questionElem);
  node.intersect = function(point2) {
    log.warn("Intersect called");
    return intersect_default.polygon(node, points, point2);
  };
  return shapeSvg;
}, "question");
var choice = /* @__PURE__ */ __name((parent, node) => {
  const shapeSvg = parent.insert("g").attr("class", "node default").attr("id", node.domId || node.id);
  const s = 28;
  const points = [
    { x: 0, y: s / 2 },
    { x: s / 2, y: 0 },
    { x: 0, y: -s / 2 },
    { x: -s / 2, y: 0 }
  ];
  const choice2 = shapeSvg.insert("polygon", ":first-child").attr("points", points.map(function(d) {
    return d.x + "," + d.y;
  }).join(" "));
  choice2.attr("class", "state-start").attr("r", 7).attr("width", 28).attr("height", 28);
  node.width = 28;
  node.height = 28;
  node.intersect = function(point2) {
    return intersect_default.circle(node, 14, point2);
  };
  return shapeSvg;
}, "choice");
var hexagon = /* @__PURE__ */ __name(async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, getClassesFromNode(node, undefined), true);
  const f = 4;
  const h = node.positioned ? node.height : bbox.height + node.padding;
  const m = h / f;
  const w = node.positioned ? node.width : bbox.width + 2 * m + node.padding;
  const points = [
    { x: m, y: 0 },
    { x: w - m, y: 0 },
    { x: w, y: -h / 2 },
    { x: w - m, y: -h },
    { x: m, y: -h },
    { x: 0, y: -h / 2 }
  ];
  const hex = insertPolygonShape(shapeSvg, w, h, points);
  hex.attr("style", node.style);
  updateNodeBounds(node, hex);
  node.intersect = function(point2) {
    return intersect_default.polygon(node, points, point2);
  };
  return shapeSvg;
}, "hexagon");
var block_arrow = /* @__PURE__ */ __name(async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, undefined, true);
  const f = 2;
  const h = bbox.height + 2 * node.padding;
  const m = h / f;
  const naturalW = bbox.width + 2 * m + node.padding;
  const isSpanning = node.positioned && (node.widthInColumns ?? 1) > 1 && node.width > naturalW;
  const w = isSpanning ? node.width : naturalW;
  const points = getArrowPoints(node.directions, bbox, node, w);
  const blockArrow = insertPolygonShape(shapeSvg, w, h, points);
  blockArrow.attr("style", node.style);
  updateNodeBounds(node, blockArrow);
  node.intersect = function(point2) {
    return intersect_default.polygon(node, points, point2);
  };
  return shapeSvg;
}, "block_arrow");
var rect_left_inv_arrow = /* @__PURE__ */ __name(async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, getClassesFromNode(node, undefined), true);
  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: -h / 2, y: 0 },
    { x: w, y: 0 },
    { x: w, y: -h },
    { x: -h / 2, y: -h },
    { x: 0, y: -h / 2 }
  ];
  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr("style", node.style);
  node.width = w + h;
  node.height = h;
  node.intersect = function(point2) {
    return intersect_default.polygon(node, points, point2);
  };
  return shapeSvg;
}, "rect_left_inv_arrow");
var lean_right = /* @__PURE__ */ __name(async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, getClassesFromNode(node), true);
  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: -2 * h / 6, y: 0 },
    { x: w - h / 6, y: 0 },
    { x: w + 2 * h / 6, y: -h },
    { x: h / 6, y: -h }
  ];
  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr("style", node.style);
  updateNodeBounds(node, el);
  node.intersect = function(point2) {
    return intersect_default.polygon(node, points, point2);
  };
  return shapeSvg;
}, "lean_right");
var lean_left = /* @__PURE__ */ __name(async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, getClassesFromNode(node, undefined), true);
  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: 2 * h / 6, y: 0 },
    { x: w + h / 6, y: 0 },
    { x: w - 2 * h / 6, y: -h },
    { x: -h / 6, y: -h }
  ];
  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr("style", node.style);
  updateNodeBounds(node, el);
  node.intersect = function(point2) {
    return intersect_default.polygon(node, points, point2);
  };
  return shapeSvg;
}, "lean_left");
var trapezoid = /* @__PURE__ */ __name(async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, getClassesFromNode(node, undefined), true);
  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: -2 * h / 6, y: 0 },
    { x: w + 2 * h / 6, y: 0 },
    { x: w - h / 6, y: -h },
    { x: h / 6, y: -h }
  ];
  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr("style", node.style);
  updateNodeBounds(node, el);
  node.intersect = function(point2) {
    return intersect_default.polygon(node, points, point2);
  };
  return shapeSvg;
}, "trapezoid");
var inv_trapezoid = /* @__PURE__ */ __name(async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, getClassesFromNode(node, undefined), true);
  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: h / 6, y: 0 },
    { x: w - h / 6, y: 0 },
    { x: w + 2 * h / 6, y: -h },
    { x: -2 * h / 6, y: -h }
  ];
  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr("style", node.style);
  updateNodeBounds(node, el);
  node.intersect = function(point2) {
    return intersect_default.polygon(node, points, point2);
  };
  return shapeSvg;
}, "inv_trapezoid");
var rect_right_inv_arrow = /* @__PURE__ */ __name(async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, getClassesFromNode(node, undefined), true);
  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: 0, y: 0 },
    { x: w + h / 2, y: 0 },
    { x: w, y: -h / 2 },
    { x: w + h / 2, y: -h },
    { x: 0, y: -h }
  ];
  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr("style", node.style);
  updateNodeBounds(node, el);
  node.intersect = function(point2) {
    return intersect_default.polygon(node, points, point2);
  };
  return shapeSvg;
}, "rect_right_inv_arrow");
var cylinder = /* @__PURE__ */ __name(async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, getClassesFromNode(node, undefined), true);
  const w = bbox.width + node.padding;
  const rx = w / 2;
  const ry = rx / (2.5 + w / 50);
  const h = bbox.height + ry + node.padding;
  const shape = "M 0," + ry + " a " + rx + "," + ry + " 0,0,0 " + w + " 0 a " + rx + "," + ry + " 0,0,0 " + -w + " 0 l 0," + h + " a " + rx + "," + ry + " 0,0,0 " + w + " 0 l 0," + -h;
  const el = shapeSvg.attr("label-offset-y", ry).insert("path", ":first-child").attr("style", node.style).attr("d", shape).attr("transform", "translate(" + -w / 2 + "," + -(h / 2 + ry) + ")");
  updateNodeBounds(node, el);
  node.intersect = function(point2) {
    const pos = intersect_default.rect(node, point2);
    const x = pos.x - node.x;
    if (rx != 0 && (Math.abs(x) < node.width / 2 || Math.abs(x) == node.width / 2 && Math.abs(pos.y - node.y) > node.height / 2 - ry)) {
      let y = ry * ry * (1 - x * x / (rx * rx));
      if (y != 0) {
        y = Math.sqrt(y);
      }
      y = ry - y;
      if (point2.y - node.y > 0) {
        y = -y;
      }
      pos.y += y;
    }
    return pos;
  };
  return shapeSvg;
}, "cylinder");
var rect = /* @__PURE__ */ __name(async (parent, node) => {
  const { shapeSvg, bbox, halfPadding } = await labelHelper(parent, node, "node " + node.classes + " " + node.class, true);
  const rect2 = shapeSvg.insert("rect", ":first-child");
  const totalWidth = node.positioned ? node.width : bbox.width + node.padding;
  const totalHeight = node.positioned ? node.height : bbox.height + node.padding;
  const x = node.positioned ? -totalWidth / 2 : -bbox.width / 2 - halfPadding;
  const y = node.positioned ? -totalHeight / 2 : -bbox.height / 2 - halfPadding;
  rect2.attr("class", "basic label-container").attr("style", node.style).attr("rx", node.rx).attr("ry", node.ry).attr("x", x).attr("y", y).attr("width", totalWidth).attr("height", totalHeight);
  if (node.props) {
    const propKeys = new Set(Object.keys(node.props));
    if (node.props.borders) {
      applyNodePropertyBorders(rect2, node.props.borders, totalWidth, totalHeight);
      propKeys.delete("borders");
    }
    propKeys.forEach((propKey) => {
      log.warn(`Unknown node property ${propKey}`);
    });
  }
  updateNodeBounds(node, rect2);
  node.intersect = function(point2) {
    return intersect_default.rect(node, point2);
  };
  return shapeSvg;
}, "rect");
var composite = /* @__PURE__ */ __name(async (parent, node) => {
  const { shapeSvg, bbox, halfPadding } = await labelHelper(parent, node, "node " + node.classes, true);
  const rect2 = shapeSvg.insert("rect", ":first-child");
  const totalWidth = node.positioned ? node.width : bbox.width + node.padding;
  const totalHeight = node.positioned ? node.height : bbox.height + node.padding;
  const x = node.positioned ? -totalWidth / 2 : -bbox.width / 2 - halfPadding;
  const y = node.positioned ? -totalHeight / 2 : -bbox.height / 2 - halfPadding;
  rect2.attr("class", "basic cluster composite label-container").attr("style", node.style).attr("rx", node.rx).attr("ry", node.ry).attr("x", x).attr("y", y).attr("width", totalWidth).attr("height", totalHeight);
  if (node.props) {
    const propKeys = new Set(Object.keys(node.props));
    if (node.props.borders) {
      applyNodePropertyBorders(rect2, node.props.borders, totalWidth, totalHeight);
      propKeys.delete("borders");
    }
    propKeys.forEach((propKey) => {
      log.warn(`Unknown node property ${propKey}`);
    });
  }
  updateNodeBounds(node, rect2);
  node.intersect = function(point2) {
    return intersect_default.rect(node, point2);
  };
  return shapeSvg;
}, "composite");
var labelRect = /* @__PURE__ */ __name(async (parent, node) => {
  const { shapeSvg } = await labelHelper(parent, node, "label", true);
  log.trace("Classes = ", node.class);
  const rect2 = shapeSvg.insert("rect", ":first-child");
  const totalWidth = 0;
  const totalHeight = 0;
  rect2.attr("width", totalWidth).attr("height", totalHeight);
  shapeSvg.attr("class", "label edgeLabel");
  if (node.props) {
    const propKeys = new Set(Object.keys(node.props));
    if (node.props.borders) {
      applyNodePropertyBorders(rect2, node.props.borders, totalWidth, totalHeight);
      propKeys.delete("borders");
    }
    propKeys.forEach((propKey) => {
      log.warn(`Unknown node property ${propKey}`);
    });
  }
  updateNodeBounds(node, rect2);
  node.intersect = function(point2) {
    return intersect_default.rect(node, point2);
  };
  return shapeSvg;
}, "labelRect");
function applyNodePropertyBorders(rect2, borders, totalWidth, totalHeight) {
  const strokeDashArray = [];
  const addBorder = /* @__PURE__ */ __name((length) => {
    strokeDashArray.push(length, 0);
  }, "addBorder");
  const skipBorder = /* @__PURE__ */ __name((length) => {
    strokeDashArray.push(0, length);
  }, "skipBorder");
  if (borders.includes("t")) {
    log.debug("add top border");
    addBorder(totalWidth);
  } else {
    skipBorder(totalWidth);
  }
  if (borders.includes("r")) {
    log.debug("add right border");
    addBorder(totalHeight);
  } else {
    skipBorder(totalHeight);
  }
  if (borders.includes("b")) {
    log.debug("add bottom border");
    addBorder(totalWidth);
  } else {
    skipBorder(totalWidth);
  }
  if (borders.includes("l")) {
    log.debug("add left border");
    addBorder(totalHeight);
  } else {
    skipBorder(totalHeight);
  }
  rect2.attr("stroke-dasharray", strokeDashArray.join(" "));
}
__name(applyNodePropertyBorders, "applyNodePropertyBorders");
var rectWithTitle = /* @__PURE__ */ __name(async (parent, node) => {
  let classes2;
  if (!node.classes) {
    classes2 = "node default";
  } else {
    classes2 = "node " + node.classes;
  }
  const shapeSvg = parent.insert("g").attr("class", classes2).attr("id", node.domId || node.id);
  const rect2 = shapeSvg.insert("rect", ":first-child");
  const innerLine = shapeSvg.insert("line");
  const label = shapeSvg.insert("g").attr("class", "label");
  const text2 = node.labelText.flat ? node.labelText.flat() : node.labelText;
  let title = "";
  if (typeof text2 === "object") {
    title = text2[0];
  } else {
    title = text2;
  }
  log.info("Label text abc79", title, text2, typeof text2 === "object");
  const text = await createLabel_default(label, title, node.labelStyle, true, true);
  let bbox = { width: 0, height: 0 };
  if (getEffectiveHtmlLabels(getConfig2())) {
    const div = text.children[0];
    const dv = select_default(text);
    bbox = div.getBoundingClientRect();
    dv.attr("width", bbox.width);
    dv.attr("height", bbox.height);
  }
  log.info("Text 2", text2);
  const textRows = text2.slice(1, text2.length);
  let titleBox = text.getBBox();
  const descr = await createLabel_default(label, textRows.join ? textRows.join("<br/>") : textRows, node.labelStyle, true, true);
  if (getEffectiveHtmlLabels(getConfig2())) {
    const div = descr.children[0];
    const dv = select_default(descr);
    bbox = div.getBoundingClientRect();
    dv.attr("width", bbox.width);
    dv.attr("height", bbox.height);
  }
  const halfPadding = node.padding / 2;
  select_default(descr).attr("transform", "translate( " + (bbox.width > titleBox.width ? 0 : (titleBox.width - bbox.width) / 2) + ", " + (titleBox.height + halfPadding + 5) + ")");
  select_default(text).attr("transform", "translate( " + (bbox.width < titleBox.width ? 0 : -(titleBox.width - bbox.width) / 2) + ", 0)");
  bbox = label.node().getBBox();
  label.attr("transform", "translate(" + -bbox.width / 2 + ", " + (-bbox.height / 2 - halfPadding + 3) + ")");
  rect2.attr("class", "outer title-state").attr("x", -bbox.width / 2 - halfPadding).attr("y", -bbox.height / 2 - halfPadding).attr("width", bbox.width + node.padding).attr("height", bbox.height + node.padding);
  innerLine.attr("class", "divider").attr("x1", -bbox.width / 2 - halfPadding).attr("x2", bbox.width / 2 + halfPadding).attr("y1", -bbox.height / 2 - halfPadding + titleBox.height + halfPadding).attr("y2", -bbox.height / 2 - halfPadding + titleBox.height + halfPadding);
  updateNodeBounds(node, rect2);
  node.intersect = function(point2) {
    return intersect_default.rect(node, point2);
  };
  return shapeSvg;
}, "rectWithTitle");
var stadium = /* @__PURE__ */ __name(async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, getClassesFromNode(node, undefined), true);
  const h = bbox.height + node.padding;
  const w = bbox.width + h / 4 + node.padding;
  const rect2 = shapeSvg.insert("rect", ":first-child").attr("style", node.style).attr("rx", h / 2).attr("ry", h / 2).attr("x", -w / 2).attr("y", -h / 2).attr("width", w).attr("height", h);
  updateNodeBounds(node, rect2);
  node.intersect = function(point2) {
    return intersect_default.rect(node, point2);
  };
  return shapeSvg;
}, "stadium");
var circle2 = /* @__PURE__ */ __name(async (parent, node) => {
  const { shapeSvg, bbox, halfPadding } = await labelHelper(parent, node, getClassesFromNode(node, undefined), true);
  const circle3 = shapeSvg.insert("circle", ":first-child");
  circle3.attr("style", node.style).attr("rx", node.rx).attr("ry", node.ry).attr("r", bbox.width / 2 + halfPadding).attr("width", bbox.width + node.padding).attr("height", bbox.height + node.padding);
  log.info("Circle main");
  updateNodeBounds(node, circle3);
  node.intersect = function(point2) {
    log.info("Circle intersect", node, bbox.width / 2 + halfPadding, point2);
    return intersect_default.circle(node, bbox.width / 2 + halfPadding, point2);
  };
  return shapeSvg;
}, "circle");
var doublecircle = /* @__PURE__ */ __name(async (parent, node) => {
  const { shapeSvg, bbox, halfPadding } = await labelHelper(parent, node, getClassesFromNode(node, undefined), true);
  const gap = 5;
  const circleGroup = shapeSvg.insert("g", ":first-child");
  const outerCircle = circleGroup.insert("circle");
  const innerCircle = circleGroup.insert("circle");
  circleGroup.attr("class", node.class);
  outerCircle.attr("style", node.style).attr("rx", node.rx).attr("ry", node.ry).attr("r", bbox.width / 2 + halfPadding + gap).attr("width", bbox.width + node.padding + gap * 2).attr("height", bbox.height + node.padding + gap * 2);
  innerCircle.attr("style", node.style).attr("rx", node.rx).attr("ry", node.ry).attr("r", bbox.width / 2 + halfPadding).attr("width", bbox.width + node.padding).attr("height", bbox.height + node.padding);
  log.info("DoubleCircle main");
  updateNodeBounds(node, outerCircle);
  node.intersect = function(point2) {
    log.info("DoubleCircle intersect", node, bbox.width / 2 + halfPadding + gap, point2);
    return intersect_default.circle(node, bbox.width / 2 + halfPadding + gap, point2);
  };
  return shapeSvg;
}, "doublecircle");
var subroutine = /* @__PURE__ */ __name(async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, getClassesFromNode(node, undefined), true);
  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: -h },
    { x: 0, y: -h },
    { x: 0, y: 0 },
    { x: -8, y: 0 },
    { x: w + 8, y: 0 },
    { x: w + 8, y: -h },
    { x: -8, y: -h },
    { x: -8, y: 0 }
  ];
  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr("style", node.style);
  updateNodeBounds(node, el);
  node.intersect = function(point2) {
    return intersect_default.polygon(node, points, point2);
  };
  return shapeSvg;
}, "subroutine");
var start = /* @__PURE__ */ __name((parent, node) => {
  const shapeSvg = parent.insert("g").attr("class", "node default").attr("id", node.domId || node.id);
  const circle3 = shapeSvg.insert("circle", ":first-child");
  circle3.attr("class", "state-start").attr("r", 7).attr("width", 14).attr("height", 14);
  updateNodeBounds(node, circle3);
  node.intersect = function(point2) {
    return intersect_default.circle(node, 7, point2);
  };
  return shapeSvg;
}, "start");
var forkJoin = /* @__PURE__ */ __name((parent, node, dir) => {
  const shapeSvg = parent.insert("g").attr("class", "node default").attr("id", node.domId || node.id);
  let width = 70;
  let height = 10;
  if (dir === "LR") {
    width = 10;
    height = 70;
  }
  const shape = shapeSvg.append("rect").attr("x", -1 * width / 2).attr("y", -1 * height / 2).attr("width", width).attr("height", height).attr("class", "fork-join");
  updateNodeBounds(node, shape);
  node.height = node.height + node.padding / 2;
  node.width = node.width + node.padding / 2;
  node.intersect = function(point2) {
    return intersect_default.rect(node, point2);
  };
  return shapeSvg;
}, "forkJoin");
var end = /* @__PURE__ */ __name((parent, node) => {
  const shapeSvg = parent.insert("g").attr("class", "node default").attr("id", node.domId || node.id);
  const innerCircle = shapeSvg.insert("circle", ":first-child");
  const circle3 = shapeSvg.insert("circle", ":first-child");
  circle3.attr("class", "state-start").attr("r", 7).attr("width", 14).attr("height", 14);
  innerCircle.attr("class", "state-end").attr("r", 5).attr("width", 10).attr("height", 10);
  updateNodeBounds(node, circle3);
  node.intersect = function(point2) {
    return intersect_default.circle(node, 7, point2);
  };
  return shapeSvg;
}, "end");
var class_box = /* @__PURE__ */ __name(async (parent, node) => {
  const halfPadding = node.padding / 2;
  const rowPadding = 4;
  const lineHeight = 8;
  let classes2;
  if (!node.classes) {
    classes2 = "node default";
  } else {
    classes2 = "node " + node.classes;
  }
  const shapeSvg = parent.insert("g").attr("class", classes2).attr("id", node.domId || node.id);
  const rect2 = shapeSvg.insert("rect", ":first-child");
  const topLine = shapeSvg.insert("line");
  const bottomLine = shapeSvg.insert("line");
  let maxWidth = 0;
  let maxHeight = rowPadding;
  const labelContainer = shapeSvg.insert("g").attr("class", "label");
  let verticalPos = 0;
  const hasInterface = node.classData.annotations?.[0];
  const interfaceLabelText = node.classData.annotations[0] ? "«" + node.classData.annotations[0] + "»" : "";
  const interfaceLabel = await createLabel_default(labelContainer, interfaceLabelText, node.labelStyle, true, true);
  let interfaceBBox = interfaceLabel.getBBox();
  if (getEffectiveHtmlLabels(getConfig2())) {
    const div = interfaceLabel.children[0];
    const dv = select_default(interfaceLabel);
    interfaceBBox = div.getBoundingClientRect();
    dv.attr("width", interfaceBBox.width);
    dv.attr("height", interfaceBBox.height);
  }
  if (node.classData.annotations[0]) {
    maxHeight += interfaceBBox.height + rowPadding;
    maxWidth += interfaceBBox.width;
  }
  let classTitleString = node.classData.label;
  if (node.classData.type !== undefined && node.classData.type !== "") {
    if (getEffectiveHtmlLabels(getConfig2())) {
      classTitleString += "&lt;" + node.classData.type + "&gt;";
    } else {
      classTitleString += "<" + node.classData.type + ">";
    }
  }
  const classTitleLabel = await createLabel_default(labelContainer, classTitleString, node.labelStyle, true, true);
  select_default(classTitleLabel).attr("class", "classTitle");
  let classTitleBBox = classTitleLabel.getBBox();
  if (getEffectiveHtmlLabels(getConfig2())) {
    const div = classTitleLabel.children[0];
    const dv = select_default(classTitleLabel);
    classTitleBBox = div.getBoundingClientRect();
    dv.attr("width", classTitleBBox.width);
    dv.attr("height", classTitleBBox.height);
  }
  maxHeight += classTitleBBox.height + rowPadding;
  if (classTitleBBox.width > maxWidth) {
    maxWidth = classTitleBBox.width;
  }
  const classAttributes = [];
  node.classData.members.forEach(async (member) => {
    const parsedInfo = member.getDisplayDetails();
    let parsedText = parsedInfo.displayText;
    if (getEffectiveHtmlLabels(getConfig2())) {
      parsedText = parsedText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    const lbl = await createLabel_default(labelContainer, parsedText, parsedInfo.cssStyle ? parsedInfo.cssStyle : node.labelStyle, true, true);
    let bbox = lbl.getBBox();
    if (getEffectiveHtmlLabels(getConfig2())) {
      const div = lbl.children[0];
      const dv = select_default(lbl);
      bbox = div.getBoundingClientRect();
      dv.attr("width", bbox.width);
      dv.attr("height", bbox.height);
    }
    if (bbox.width > maxWidth) {
      maxWidth = bbox.width;
    }
    maxHeight += bbox.height + rowPadding;
    classAttributes.push(lbl);
  });
  maxHeight += lineHeight;
  const classMethods = [];
  node.classData.methods.forEach(async (member) => {
    const parsedInfo = member.getDisplayDetails();
    let displayText = parsedInfo.displayText;
    if (getEffectiveHtmlLabels(getConfig2())) {
      displayText = displayText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    const lbl = await createLabel_default(labelContainer, displayText, parsedInfo.cssStyle ? parsedInfo.cssStyle : node.labelStyle, true, true);
    let bbox = lbl.getBBox();
    if (getEffectiveHtmlLabels(getConfig2())) {
      const div = lbl.children[0];
      const dv = select_default(lbl);
      bbox = div.getBoundingClientRect();
      dv.attr("width", bbox.width);
      dv.attr("height", bbox.height);
    }
    if (bbox.width > maxWidth) {
      maxWidth = bbox.width;
    }
    maxHeight += bbox.height + rowPadding;
    classMethods.push(lbl);
  });
  maxHeight += lineHeight;
  if (hasInterface) {
    let diffX2 = (maxWidth - interfaceBBox.width) / 2;
    select_default(interfaceLabel).attr("transform", "translate( " + (-1 * maxWidth / 2 + diffX2) + ", " + -1 * maxHeight / 2 + ")");
    verticalPos = interfaceBBox.height + rowPadding;
  }
  let diffX = (maxWidth - classTitleBBox.width) / 2;
  select_default(classTitleLabel).attr("transform", "translate( " + (-1 * maxWidth / 2 + diffX) + ", " + (-1 * maxHeight / 2 + verticalPos) + ")");
  verticalPos += classTitleBBox.height + rowPadding;
  topLine.attr("class", "divider").attr("x1", -maxWidth / 2 - halfPadding).attr("x2", maxWidth / 2 + halfPadding).attr("y1", -maxHeight / 2 - halfPadding + lineHeight + verticalPos).attr("y2", -maxHeight / 2 - halfPadding + lineHeight + verticalPos);
  verticalPos += lineHeight;
  classAttributes.forEach((lbl) => {
    select_default(lbl).attr("transform", "translate( " + -maxWidth / 2 + ", " + (-1 * maxHeight / 2 + verticalPos + lineHeight / 2) + ")");
    const memberBBox = lbl?.getBBox();
    verticalPos += (memberBBox?.height ?? 0) + rowPadding;
  });
  verticalPos += lineHeight;
  bottomLine.attr("class", "divider").attr("x1", -maxWidth / 2 - halfPadding).attr("x2", maxWidth / 2 + halfPadding).attr("y1", -maxHeight / 2 - halfPadding + lineHeight + verticalPos).attr("y2", -maxHeight / 2 - halfPadding + lineHeight + verticalPos);
  verticalPos += lineHeight;
  classMethods.forEach((lbl) => {
    select_default(lbl).attr("transform", "translate( " + -maxWidth / 2 + ", " + (-1 * maxHeight / 2 + verticalPos) + ")");
    const memberBBox = lbl?.getBBox();
    verticalPos += (memberBBox?.height ?? 0) + rowPadding;
  });
  rect2.attr("style", node.style).attr("class", "outer title-state").attr("x", -maxWidth / 2 - halfPadding).attr("y", -(maxHeight / 2) - halfPadding).attr("width", maxWidth + node.padding).attr("height", maxHeight + node.padding);
  updateNodeBounds(node, rect2);
  node.intersect = function(point2) {
    return intersect_default.rect(node, point2);
  };
  return shapeSvg;
}, "class_box");
var shapes = {
  rhombus: question,
  composite,
  question,
  rect,
  labelRect,
  rectWithTitle,
  choice,
  circle: circle2,
  doublecircle,
  stadium,
  hexagon,
  block_arrow,
  rect_left_inv_arrow,
  lean_right,
  lean_left,
  trapezoid,
  inv_trapezoid,
  rect_right_inv_arrow,
  cylinder,
  start,
  end,
  note: note_default,
  subroutine,
  fork: forkJoin,
  join: forkJoin,
  class_box
};
var nodeElems = {};
var insertNode = /* @__PURE__ */ __name(async (elem, node, renderOptions) => {
  let newEl;
  let el;
  if (node.link) {
    let target;
    if (getConfig2().securityLevel === "sandbox") {
      target = "_top";
    } else if (node.linkTarget) {
      target = node.linkTarget || "_blank";
    }
    newEl = elem.insert("svg:a").attr("xlink:href", node.link).attr("target", target);
    el = await shapes[node.shape](newEl, node, renderOptions);
  } else {
    el = await shapes[node.shape](elem, node, renderOptions);
    newEl = el;
  }
  if (node.tooltip) {
    el.attr("title", node.tooltip);
  }
  if (node.class) {
    el.attr("class", "node default " + node.class);
  }
  nodeElems[node.id] = newEl;
  if (node.haveCallback) {
    nodeElems[node.id].attr("class", nodeElems[node.id].attr("class") + " clickable");
  }
  return newEl;
}, "insertNode");
var positionNode = /* @__PURE__ */ __name((node) => {
  const el = nodeElems[node.id];
  log.trace("Transforming node", node.diff, node, "translate(" + (node.x - node.width / 2 - 5) + ", " + node.width / 2 + ")");
  const padding2 = 8;
  const diff = node.diff || 0;
  if (node.clusterNode) {
    el.attr("transform", "translate(" + (node.x + diff - node.width / 2) + ", " + (node.y - node.height / 2 - padding2) + ")");
  } else {
    el.attr("transform", "translate(" + node.x + ", " + node.y + ")");
  }
  return diff;
}, "positionNode");
function getNodeFromBlock(block, db2, positioned = false) {
  const vertex = block;
  let classStr = "default";
  if ((vertex?.classes?.length || 0) > 0) {
    classStr = (vertex?.classes ?? []).join(" ");
  }
  classStr = classStr + " flowchart-label";
  let radius = 0;
  let shape = "";
  let padding2;
  switch (vertex.type) {
    case "round":
      radius = 5;
      shape = "rect";
      break;
    case "composite":
      radius = 0;
      shape = "composite";
      padding2 = 0;
      break;
    case "square":
      shape = "rect";
      break;
    case "diamond":
      shape = "question";
      break;
    case "hexagon":
      shape = "hexagon";
      break;
    case "block_arrow":
      shape = "block_arrow";
      break;
    case "odd":
      shape = "rect_left_inv_arrow";
      break;
    case "lean_right":
      shape = "lean_right";
      break;
    case "lean_left":
      shape = "lean_left";
      break;
    case "trapezoid":
      shape = "trapezoid";
      break;
    case "inv_trapezoid":
      shape = "inv_trapezoid";
      break;
    case "rect_left_inv_arrow":
      shape = "rect_left_inv_arrow";
      break;
    case "circle":
      shape = "circle";
      break;
    case "ellipse":
      shape = "ellipse";
      break;
    case "stadium":
      shape = "stadium";
      break;
    case "subroutine":
      shape = "subroutine";
      break;
    case "cylinder":
      shape = "cylinder";
      break;
    case "group":
      shape = "rect";
      break;
    case "doublecircle":
      shape = "doublecircle";
      break;
    default:
      shape = "rect";
  }
  const styles = getStylesFromArray(vertex?.styles ?? []);
  const vertexText = vertex.label;
  const bounds = vertex.size ?? { width: 0, height: 0, x: 0, y: 0 };
  const dbDiagramId = db2.getDiagramId();
  const node = {
    labelStyle: styles.labelStyle,
    shape,
    labelText: vertexText,
    rx: radius,
    ry: radius,
    class: classStr,
    style: styles.style,
    id: vertex.id,
    domId: dbDiagramId ? `${dbDiagramId}-${vertex.id}` : vertex.id,
    directions: vertex.directions,
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    positioned,
    intersect: undefined,
    type: vertex.type,
    padding: padding2 ?? getConfig()?.block?.padding ?? 0,
    widthInColumns: vertex.widthInColumns ?? 1
  };
  return node;
}
__name(getNodeFromBlock, "getNodeFromBlock");
async function calculateBlockSize(elem, block, db2) {
  const node = getNodeFromBlock(block, db2, false);
  if (node.type === "group") {
    return;
  }
  const config2 = getConfig();
  const nodeEl = await insertNode(elem, node, { config: config2 });
  const boundingBox = nodeEl.node().getBBox();
  const obj = db2.getBlock(node.id);
  obj.size = { width: boundingBox.width, height: boundingBox.height, x: 0, y: 0, node: nodeEl };
  db2.setBlock(obj);
  nodeEl.remove();
}
__name(calculateBlockSize, "calculateBlockSize");
async function insertBlockPositioned(elem, block, db2) {
  const node = getNodeFromBlock(block, db2, true);
  const obj = db2.getBlock(node.id);
  if (obj.type !== "space") {
    const config2 = getConfig();
    await insertNode(elem, node, { config: config2 });
    block.intersect = node?.intersect;
    positionNode(node);
  }
}
__name(insertBlockPositioned, "insertBlockPositioned");
async function performOperations(elem, blocks2, db2, operation) {
  for (const block of blocks2) {
    await operation(elem, block, db2);
    if (block.children) {
      await performOperations(elem, block.children, db2, operation);
    }
  }
}
__name(performOperations, "performOperations");
async function calculateBlockSizes(elem, blocks2, db2) {
  await performOperations(elem, blocks2, db2, calculateBlockSize);
}
__name(calculateBlockSizes, "calculateBlockSizes");
async function insertBlocks(elem, blocks2, db2) {
  await performOperations(elem, blocks2, db2, insertBlockPositioned);
}
__name(insertBlocks, "insertBlocks");
async function insertEdges(elem, edges, blocks2, db2, id) {
  const g = new Graph({
    multigraph: true,
    compound: true
  });
  g.setGraph({
    rankdir: "TB",
    nodesep: 10,
    ranksep: 10,
    marginx: 8,
    marginy: 8
  });
  for (const block of blocks2) {
    if (block.size) {
      g.setNode(block.id, {
        width: block.size.width,
        height: block.size.height,
        intersect: block.intersect
      });
    }
  }
  for (const edge of edges) {
    if (edge.start && edge.end) {
      const startBlock = db2.getBlock(edge.start);
      const endBlock = db2.getBlock(edge.end);
      if (startBlock?.size && endBlock?.size) {
        const start2 = startBlock.size;
        const end2 = endBlock.size;
        const points = [
          { x: start2.x, y: start2.y },
          { x: start2.x + (end2.x - start2.x) / 2, y: start2.y + (end2.y - start2.y) / 2 },
          { x: end2.x, y: end2.y }
        ];
        const prefixedEdgeId = id ? `${id}-${edge.id}` : edge.id;
        const thicknessClass = edge.thickness === "thick" ? "edge-thickness-thick" : "edge-thickness-normal";
        const patternClass = edge.pattern === "dotted" ? "edge-pattern-dotted" : "edge-pattern-solid";
        const dynamicClasses = `${thicknessClass} ${patternClass} flowchart-link LS-a1 LE-b1`;
        insertEdge(elem, { v: edge.start, w: edge.end, name: prefixedEdgeId }, {
          ...edge,
          id: prefixedEdgeId,
          arrowTypeEnd: edge.arrowTypeEnd,
          arrowTypeStart: edge.arrowTypeStart,
          points,
          classes: dynamicClasses
        }, undefined, "block", g, id);
        if (edge.label) {
          await insertEdgeLabel(elem, {
            ...edge,
            label: edge.label,
            labelStyle: "stroke: #333; stroke-width: 1.5px;fill:none;",
            arrowTypeEnd: edge.arrowTypeEnd,
            arrowTypeStart: edge.arrowTypeStart,
            points,
            classes: dynamicClasses
          });
          positionEdgeLabel({ ...edge, x: points[1].x, y: points[1].y }, {
            originalPath: points
          });
        }
      }
    }
  }
}
__name(insertEdges, "insertEdges");
var getClasses2 = /* @__PURE__ */ __name(function(text, diagObj) {
  return diagObj.db.getClasses();
}, "getClasses");
var draw = /* @__PURE__ */ __name(async function(text, id, _version, diagObj) {
  const { securityLevel, block: conf } = getConfig();
  const db2 = diagObj.db;
  db2.setDiagramId(id);
  let sandboxElement;
  if (securityLevel === "sandbox") {
    sandboxElement = select_default("#i" + id);
  }
  const root = securityLevel === "sandbox" ? select_default(sandboxElement.nodes()[0].contentDocument.body) : select_default("body");
  const svg = securityLevel === "sandbox" ? root.select(`[id="${id}"]`) : select_default(`[id="${id}"]`);
  const markers2 = ["point", "circle", "cross"];
  markers_default(svg, markers2, diagObj.type, id);
  const bl = db2.getBlocks();
  const blArr = db2.getBlocksFlat();
  const edges = db2.getEdges();
  const nodes = svg.insert("g").attr("class", "block");
  await calculateBlockSizes(nodes, bl, db2);
  const bounds = layout(db2);
  await insertBlocks(nodes, bl, db2);
  await insertEdges(nodes, edges, blArr, db2, id);
  if (bounds) {
    const bounds2 = bounds;
    const magicFactor = Math.max(1, Math.round(0.125 * (bounds2.width / bounds2.height)));
    const height = bounds2.height + magicFactor + 10;
    const width = bounds2.width + 10;
    const { useMaxWidth } = conf;
    configureSvgSize(svg, height, width, !!useMaxWidth);
    log.debug("Here Bounds", bounds, bounds2);
    svg.attr("viewBox", `${bounds2.x - 5} ${bounds2.y - 5} ${bounds2.width + 10} ${bounds2.height + 10}`);
  }
}, "draw");
var blockRenderer_default = {
  draw,
  getClasses: getClasses2
};
var diagram = {
  parser: block_default,
  db: blockDB_default,
  renderer: blockRenderer_default,
  styles: styles_default
};
export {
  diagram
};

//# debugId=54CCDF452C9B8F8664756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21lcm1haWQvZGlzdC9jaHVua3MvbWVybWFpZC5jb3JlL2Jsb2NrRGlhZ3JhbS1HUEVITFpNTS5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiaW1wb3J0IHtcbiAgZ2V0SWNvblN0eWxlc1xufSBmcm9tIFwiLi9jaHVuay1GTUJEN1VDNC5tanNcIjtcbmltcG9ydCB7XG4gIGNvbXB1dGVMYWJlbFRyYW5zZm9ybSxcbiAgZ2V0TGluZUZ1bmN0aW9uc1dpdGhPZmZzZXRcbn0gZnJvbSBcIi4vY2h1bmstQlNKUDdDQlAubWpzXCI7XG5pbXBvcnQge1xuICBjb25maWd1cmVMYWJlbEltYWdlcyxcbiAgZ2V0U3ViR3JhcGhUaXRsZU1hcmdpbnNcbn0gZnJvbSBcIi4vY2h1bmstTDVaVExEV1YubWpzXCI7XG5pbXBvcnQge1xuICBjcmVhdGVUZXh0XG59IGZyb20gXCIuL2NodW5rLU81Q0JFTDZPLm1qc1wiO1xuaW1wb3J0IHtcbiAgZGVjb2RlRW50aXRpZXMsXG4gIGdldFN0eWxlc0Zyb21BcnJheSxcbiAgdXRpbHNfZGVmYXVsdFxufSBmcm9tIFwiLi9jaHVuay01WlFZSFhLVS5tanNcIjtcbmltcG9ydCB7XG4gIGNsZWFyLFxuICBjb21tb25fZGVmYXVsdCxcbiAgY29uZmlndXJlU3ZnU2l6ZSxcbiAgZ2V0Q29uZmlnLFxuICBnZXRDb25maWcyLFxuICBnZXRFZmZlY3RpdmVIdG1sTGFiZWxzLFxuICBnZXRVcmwsXG4gIHNhbml0aXplVGV4dFxufSBmcm9tIFwiLi9jaHVuay1DU0NJSEs3US5tanNcIjtcbmltcG9ydCB7XG4gIF9fbmFtZSxcbiAgbG9nXG59IGZyb20gXCIuL2NodW5rLUFHSFJCNEpGLm1qc1wiO1xuXG4vLyBzcmMvZGlhZ3JhbXMvYmxvY2svcGFyc2VyL2Jsb2NrLmppc29uXG52YXIgcGFyc2VyID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgbyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oaywgdiwgbzIsIGwpIHtcbiAgICBmb3IgKG8yID0gbzIgfHwge30sIGwgPSBrLmxlbmd0aDsgbC0tOyBvMltrW2xdXSA9IHYpIDtcbiAgICByZXR1cm4gbzI7XG4gIH0sIFwib1wiKSwgJFYwID0gWzEsIDE1XSwgJFYxID0gWzEsIDddLCAkVjIgPSBbMSwgMTNdLCAkVjMgPSBbMSwgMTRdLCAkVjQgPSBbMSwgMTldLCAkVjUgPSBbMSwgMTZdLCAkVjYgPSBbMSwgMTddLCAkVjcgPSBbMSwgMThdLCAkVjggPSBbOCwgMzBdLCAkVjkgPSBbOCwgMTAsIDIxLCAyOCwgMjksIDMwLCAzMSwgMzksIDQzLCA0Nl0sICRWYSA9IFsxLCAyM10sICRWYiA9IFsxLCAyNF0sICRWYyA9IFs4LCAxMCwgMTUsIDE2LCAyMSwgMjgsIDI5LCAzMCwgMzEsIDM5LCA0MywgNDZdLCAkVmQgPSBbOCwgMTAsIDE1LCAxNiwgMjEsIDI3LCAyOCwgMjksIDMwLCAzMSwgMzksIDQzLCA0Nl0sICRWZSA9IFsxLCA0OV07XG4gIHZhciBwYXJzZXIyID0ge1xuICAgIHRyYWNlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHRyYWNlKCkge1xuICAgIH0sIFwidHJhY2VcIiksXG4gICAgeXk6IHt9LFxuICAgIHN5bWJvbHNfOiB7IFwiZXJyb3JcIjogMiwgXCJzcGFjZUxpbmVzXCI6IDMsIFwiU1BBQ0VMSU5FXCI6IDQsIFwiTkxcIjogNSwgXCJzZXBhcmF0b3JcIjogNiwgXCJTUEFDRVwiOiA3LCBcIkVPRlwiOiA4LCBcInN0YXJ0XCI6IDksIFwiQkxPQ0tfRElBR1JBTV9LRVlcIjogMTAsIFwiZG9jdW1lbnRcIjogMTEsIFwic3RvcFwiOiAxMiwgXCJzdGF0ZW1lbnRcIjogMTMsIFwibGlua1wiOiAxNCwgXCJMSU5LXCI6IDE1LCBcIlNUQVJUX0xJTktcIjogMTYsIFwiTElOS19MQUJFTFwiOiAxNywgXCJTVFJcIjogMTgsIFwibm9kZVN0YXRlbWVudFwiOiAxOSwgXCJjb2x1bW5zU3RhdGVtZW50XCI6IDIwLCBcIlNQQUNFX0JMT0NLXCI6IDIxLCBcImJsb2NrU3RhdGVtZW50XCI6IDIyLCBcImNsYXNzRGVmU3RhdGVtZW50XCI6IDIzLCBcImNzc0NsYXNzU3RhdGVtZW50XCI6IDI0LCBcInN0eWxlU3RhdGVtZW50XCI6IDI1LCBcIm5vZGVcIjogMjYsIFwiU0laRVwiOiAyNywgXCJDT0xVTU5TXCI6IDI4LCBcImlkLWJsb2NrXCI6IDI5LCBcImVuZFwiOiAzMCwgXCJOT0RFX0lEXCI6IDMxLCBcIm5vZGVTaGFwZU5MYWJlbFwiOiAzMiwgXCJkaXJMaXN0XCI6IDMzLCBcIkRJUlwiOiAzNCwgXCJOT0RFX0RTVEFSVFwiOiAzNSwgXCJOT0RFX0RFTkRcIjogMzYsIFwiQkxPQ0tfQVJST1dfU1RBUlRcIjogMzcsIFwiQkxPQ0tfQVJST1dfRU5EXCI6IDM4LCBcImNsYXNzRGVmXCI6IDM5LCBcIkNMQVNTREVGX0lEXCI6IDQwLCBcIkNMQVNTREVGX1NUWUxFT1BUU1wiOiA0MSwgXCJERUZBVUxUXCI6IDQyLCBcImNsYXNzXCI6IDQzLCBcIkNMQVNTRU5USVRZX0lEU1wiOiA0NCwgXCJTVFlMRUNMQVNTXCI6IDQ1LCBcInN0eWxlXCI6IDQ2LCBcIlNUWUxFX0VOVElUWV9JRFNcIjogNDcsIFwiU1RZTEVfREVGSU5JVElPTl9EQVRBXCI6IDQ4LCBcIiRhY2NlcHRcIjogMCwgXCIkZW5kXCI6IDEgfSxcbiAgICB0ZXJtaW5hbHNfOiB7IDI6IFwiZXJyb3JcIiwgNDogXCJTUEFDRUxJTkVcIiwgNTogXCJOTFwiLCA3OiBcIlNQQUNFXCIsIDg6IFwiRU9GXCIsIDEwOiBcIkJMT0NLX0RJQUdSQU1fS0VZXCIsIDE1OiBcIkxJTktcIiwgMTY6IFwiU1RBUlRfTElOS1wiLCAxNzogXCJMSU5LX0xBQkVMXCIsIDE4OiBcIlNUUlwiLCAyMTogXCJTUEFDRV9CTE9DS1wiLCAyNzogXCJTSVpFXCIsIDI4OiBcIkNPTFVNTlNcIiwgMjk6IFwiaWQtYmxvY2tcIiwgMzA6IFwiZW5kXCIsIDMxOiBcIk5PREVfSURcIiwgMzQ6IFwiRElSXCIsIDM1OiBcIk5PREVfRFNUQVJUXCIsIDM2OiBcIk5PREVfREVORFwiLCAzNzogXCJCTE9DS19BUlJPV19TVEFSVFwiLCAzODogXCJCTE9DS19BUlJPV19FTkRcIiwgMzk6IFwiY2xhc3NEZWZcIiwgNDA6IFwiQ0xBU1NERUZfSURcIiwgNDE6IFwiQ0xBU1NERUZfU1RZTEVPUFRTXCIsIDQyOiBcIkRFRkFVTFRcIiwgNDM6IFwiY2xhc3NcIiwgNDQ6IFwiQ0xBU1NFTlRJVFlfSURTXCIsIDQ1OiBcIlNUWUxFQ0xBU1NcIiwgNDY6IFwic3R5bGVcIiwgNDc6IFwiU1RZTEVfRU5USVRZX0lEU1wiLCA0ODogXCJTVFlMRV9ERUZJTklUSU9OX0RBVEFcIiB9LFxuICAgIHByb2R1Y3Rpb25zXzogWzAsIFszLCAxXSwgWzMsIDJdLCBbMywgMl0sIFs2LCAxXSwgWzYsIDFdLCBbNiwgMV0sIFs5LCAzXSwgWzEyLCAxXSwgWzEyLCAxXSwgWzEyLCAyXSwgWzEyLCAyXSwgWzExLCAxXSwgWzExLCAyXSwgWzE0LCAxXSwgWzE0LCA0XSwgWzEzLCAxXSwgWzEzLCAxXSwgWzEzLCAxXSwgWzEzLCAxXSwgWzEzLCAxXSwgWzEzLCAxXSwgWzEzLCAxXSwgWzE5LCAzXSwgWzE5LCAyXSwgWzE5LCAxXSwgWzIwLCAxXSwgWzIyLCA0XSwgWzIyLCAzXSwgWzI2LCAxXSwgWzI2LCAyXSwgWzMzLCAxXSwgWzMzLCAyXSwgWzMyLCAzXSwgWzMyLCA0XSwgWzIzLCAzXSwgWzIzLCAzXSwgWzI0LCAzXSwgWzI1LCAzXV0sXG4gICAgcGVyZm9ybUFjdGlvbjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBhbm9ueW1vdXMoeXl0ZXh0LCB5eWxlbmcsIHl5bGluZW5vLCB5eSwgeXlzdGF0ZSwgJCQsIF8kKSB7XG4gICAgICB2YXIgJDAgPSAkJC5sZW5ndGggLSAxO1xuICAgICAgc3dpdGNoICh5eXN0YXRlKSB7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIlJ1bGU6IHNlcGFyYXRvciAoTkwpIFwiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSA1OlxuICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiUnVsZTogc2VwYXJhdG9yIChTcGFjZSkgXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJSdWxlOiBzZXBhcmF0b3IgKEVPRikgXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJSdWxlOiBoaWVyYXJjaHk6IFwiLCAkJFskMCAtIDFdKTtcbiAgICAgICAgICB5eS5zZXRIaWVyYXJjaHkoJCRbJDAgLSAxXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgODpcbiAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIlN0b3AgTkwgXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJTdG9wIEVPRiBcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJTdG9wIE5MMiBcIik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTE6XG4gICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJTdG9wIEVPRjIgXCIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiUnVsZTogc3RhdGVtZW50OiBcIiwgJCRbJDBdKTtcbiAgICAgICAgICB0eXBlb2YgJCRbJDBdLmxlbmd0aCA9PT0gXCJudW1iZXJcIiA/IHRoaXMuJCA9ICQkWyQwXSA6IHRoaXMuJCA9IFskJFskMF1dO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiUnVsZTogc3RhdGVtZW50ICMyOiBcIiwgJCRbJDAgLSAxXSk7XG4gICAgICAgICAgdGhpcy4kID0gWyQkWyQwIC0gMV1dLmNvbmNhdCgkJFskMF0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiUnVsZTogbGluazogXCIsICQkWyQwXSwgeXl0ZXh0KTtcbiAgICAgICAgICB0aGlzLiQgPSB7IGVkZ2VUeXBlU3RyOiAkJFskMF0sIGxhYmVsOiBcIlwiIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJSdWxlOiBMQUJFTCBsaW5rOiBcIiwgJCRbJDAgLSAzXSwgJCRbJDAgLSAxXSwgJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSB7IGVkZ2VUeXBlU3RyOiAkJFskMF0sIGxhYmVsOiAkJFskMCAtIDFdIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMTg6XG4gICAgICAgICAgY29uc3QgbnVtID0gcGFyc2VJbnQoJCRbJDBdKTtcbiAgICAgICAgICBjb25zdCBzcGFjZUlkID0geXkuZ2VuZXJhdGVJZCgpO1xuICAgICAgICAgIHRoaXMuJCA9IHsgaWQ6IHNwYWNlSWQsIHR5cGU6IFwic3BhY2VcIiwgbGFiZWw6IFwiXCIsIHdpZHRoOiBudW0sIGNoaWxkcmVuOiBbXSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDIzOlxuICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiUnVsZTogKG5vZGVTdGF0ZW1lbnQgbGluayBub2RlKSBcIiwgJCRbJDAgLSAyXSwgJCRbJDAgLSAxXSwgJCRbJDBdLCBcIiB0eXBlc3RyOiBcIiwgJCRbJDAgLSAxXS5lZGdlVHlwZVN0cik7XG4gICAgICAgICAgY29uc3QgZWRnZURhdGEgPSB5eS5lZGdlU3RyVG9FZGdlRGF0YSgkJFskMCAtIDFdLmVkZ2VUeXBlU3RyKTtcbiAgICAgICAgICBjb25zdCBzdGFydEVkZ2VEYXRhID0geXkuZWRnZVN0clRvRWRnZVN0YXJ0RGF0YSgkJFskMCAtIDFdLmVkZ2VUeXBlU3RyKTtcbiAgICAgICAgICBjb25zdCBsaW5lVGhpY2tuZXNzID0geXkuZWRnZVN0clRvVGhpY2tuZXNzKCQkWyQwIC0gMV0uZWRnZVR5cGVTdHIpO1xuICAgICAgICAgIGNvbnN0IGxpbmVQYXR0ZXJuID0geXkuZWRnZVN0clRvUGF0dGVybigkJFskMCAtIDFdLmVkZ2VUeXBlU3RyKTtcbiAgICAgICAgICB0aGlzLiQgPSBbXG4gICAgICAgICAgICB7IGlkOiAkJFskMCAtIDJdLmlkLCBsYWJlbDogJCRbJDAgLSAyXS5sYWJlbCwgdHlwZTogJCRbJDAgLSAyXS50eXBlLCBkaXJlY3Rpb25zOiAkJFskMCAtIDJdLmRpcmVjdGlvbnMgfSxcbiAgICAgICAgICAgIHsgaWQ6ICQkWyQwIC0gMl0uaWQgKyBcIi1cIiArICQkWyQwXS5pZCwgc3RhcnQ6ICQkWyQwIC0gMl0uaWQsIGVuZDogJCRbJDBdLmlkLCBsYWJlbDogJCRbJDAgLSAxXS5sYWJlbCwgdHlwZTogXCJlZGdlXCIsIHRoaWNrbmVzczogbGluZVRoaWNrbmVzcywgcGF0dGVybjogbGluZVBhdHRlcm4sIGRpcmVjdGlvbnM6ICQkWyQwXS5kaXJlY3Rpb25zLCBhcnJvd1R5cGVFbmQ6IGVkZ2VEYXRhLCBhcnJvd1R5cGVTdGFydDogc3RhcnRFZGdlRGF0YSB9LFxuICAgICAgICAgICAgeyBpZDogJCRbJDBdLmlkLCBsYWJlbDogJCRbJDBdLmxhYmVsLCB0eXBlOiB5eS50eXBlU3RyMlR5cGUoJCRbJDBdLnR5cGVTdHIpLCBkaXJlY3Rpb25zOiAkJFskMF0uZGlyZWN0aW9ucyB9XG4gICAgICAgICAgXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyNDpcbiAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIlJ1bGU6IG5vZGVTdGF0ZW1lbnQgKGFiYzg4IG5vZGUgc2l6ZSkgXCIsICQkWyQwIC0gMV0sICQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0geyBpZDogJCRbJDAgLSAxXS5pZCwgbGFiZWw6ICQkWyQwIC0gMV0ubGFiZWwsIHR5cGU6IHl5LnR5cGVTdHIyVHlwZSgkJFskMCAtIDFdLnR5cGVTdHIpLCBkaXJlY3Rpb25zOiAkJFskMCAtIDFdLmRpcmVjdGlvbnMsIHdpZHRoSW5Db2x1bW5zOiBwYXJzZUludCgkJFskMF0sIDEwKSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI1OlxuICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiUnVsZTogbm9kZVN0YXRlbWVudCAobm9kZSkgXCIsICQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0geyBpZDogJCRbJDBdLmlkLCBsYWJlbDogJCRbJDBdLmxhYmVsLCB0eXBlOiB5eS50eXBlU3RyMlR5cGUoJCRbJDBdLnR5cGVTdHIpLCBkaXJlY3Rpb25zOiAkJFskMF0uZGlyZWN0aW9ucywgd2lkdGhJbkNvbHVtbnM6IDEgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyNjpcbiAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkFQQTEyM1wiLCB0aGlzID8gdGhpcyA6IFwibmFcIik7XG4gICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJDT0xVTU5TOiBcIiwgJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSB7IHR5cGU6IFwiY29sdW1uLXNldHRpbmdcIiwgY29sdW1uczogJCRbJDBdID09PSBcImF1dG9cIiA/IC0xIDogcGFyc2VJbnQoJCRbJDBdKSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiUnVsZTogaWQtYmxvY2sgc3RhdGVtZW50IDogXCIsICQkWyQwIC0gMl0sICQkWyQwIC0gMV0pO1xuICAgICAgICAgIGNvbnN0IGlkMiA9IHl5LmdlbmVyYXRlSWQoKTtcbiAgICAgICAgICB0aGlzLiQgPSB7IC4uLiQkWyQwIC0gMl0sIHR5cGU6IFwiY29tcG9zaXRlXCIsIGNoaWxkcmVuOiAkJFskMCAtIDFdIH07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMjg6XG4gICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJSdWxlOiBibG9ja1N0YXRlbWVudCA6IFwiLCAkJFskMCAtIDJdLCAkJFskMCAtIDFdLCAkJFskMF0pO1xuICAgICAgICAgIGNvbnN0IGlkID0geXkuZ2VuZXJhdGVJZCgpO1xuICAgICAgICAgIHRoaXMuJCA9IHsgaWQsIHR5cGU6IFwiY29tcG9zaXRlXCIsIGxhYmVsOiBcIlwiLCBjaGlsZHJlbjogJCRbJDAgLSAxXSB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDI5OlxuICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiUnVsZTogbm9kZSAoTk9ERV9JRCBzZXBhcmF0b3IpOiBcIiwgJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSB7IGlkOiAkJFskMF0gfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzMDpcbiAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIlJ1bGU6IG5vZGUgKE5PREVfSUQgbm9kZVNoYXBlTkxhYmVsIHNlcGFyYXRvcik6IFwiLCAkJFskMCAtIDFdLCAkJFskMF0pO1xuICAgICAgICAgIHRoaXMuJCA9IHsgaWQ6ICQkWyQwIC0gMV0sIGxhYmVsOiAkJFskMF0ubGFiZWwsIHR5cGVTdHI6ICQkWyQwXS50eXBlU3RyLCBkaXJlY3Rpb25zOiAkJFskMF0uZGlyZWN0aW9ucyB9O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIDMxOlxuICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiUnVsZTogZGlyTGlzdDogXCIsICQkWyQwXSk7XG4gICAgICAgICAgdGhpcy4kID0gWyQkWyQwXV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzI6XG4gICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJSdWxlOiBkaXJMaXN0OiBcIiwgJCRbJDAgLSAxXSwgJCRbJDBdKTtcbiAgICAgICAgICB0aGlzLiQgPSBbJCRbJDAgLSAxXV0uY29uY2F0KCQkWyQwXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgMzM6XG4gICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJSdWxlOiBub2RlU2hhcGVOTGFiZWw6IFwiLCAkJFskMCAtIDJdLCAkJFskMCAtIDFdLCAkJFskMF0pO1xuICAgICAgICAgIHRoaXMuJCA9IHsgdHlwZVN0cjogJCRbJDAgLSAyXSArICQkWyQwXSwgbGFiZWw6ICQkWyQwIC0gMV0gfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzNDpcbiAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIlJ1bGU6IEJMT0NLX0FSUk9XIG5vZGVTaGFwZU5MYWJlbDogXCIsICQkWyQwIC0gM10sICQkWyQwIC0gMl0sIFwiICMzOlwiLCAkJFskMCAtIDFdLCAkJFskMF0pO1xuICAgICAgICAgIHRoaXMuJCA9IHsgdHlwZVN0cjogJCRbJDAgLSAzXSArICQkWyQwXSwgbGFiZWw6ICQkWyQwIC0gMl0sIGRpcmVjdGlvbnM6ICQkWyQwIC0gMV0gfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzNTpcbiAgICAgICAgY2FzZSAzNjpcbiAgICAgICAgICB0aGlzLiQgPSB7IHR5cGU6IFwiY2xhc3NEZWZcIiwgaWQ6ICQkWyQwIC0gMV0udHJpbSgpLCBjc3M6ICQkWyQwXS50cmltKCkgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgICB0aGlzLiQgPSB7IHR5cGU6IFwiYXBwbHlDbGFzc1wiLCBpZDogJCRbJDAgLSAxXS50cmltKCksIHN0eWxlQ2xhc3M6ICQkWyQwXS50cmltKCkgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAzODpcbiAgICAgICAgICB0aGlzLiQgPSB7IHR5cGU6IFwiYXBwbHlTdHlsZXNcIiwgaWQ6ICQkWyQwIC0gMV0udHJpbSgpLCBzdHlsZXNTdHI6ICQkWyQwXS50cmltKCkgfTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9LCBcImFub255bW91c1wiKSxcbiAgICB0YWJsZTogW3sgOTogMSwgMTA6IFsxLCAyXSB9LCB7IDE6IFszXSB9LCB7IDEwOiAkVjAsIDExOiAzLCAxMzogNCwgMTk6IDUsIDIwOiA2LCAyMTogJFYxLCAyMjogOCwgMjM6IDksIDI0OiAxMCwgMjU6IDExLCAyNjogMTIsIDI4OiAkVjIsIDI5OiAkVjMsIDMxOiAkVjQsIDM5OiAkVjUsIDQzOiAkVjYsIDQ2OiAkVjcgfSwgeyA4OiBbMSwgMjBdIH0sIG8oJFY4LCBbMiwgMTJdLCB7IDEzOiA0LCAxOTogNSwgMjA6IDYsIDIyOiA4LCAyMzogOSwgMjQ6IDEwLCAyNTogMTEsIDI2OiAxMiwgMTE6IDIxLCAxMDogJFYwLCAyMTogJFYxLCAyODogJFYyLCAyOTogJFYzLCAzMTogJFY0LCAzOTogJFY1LCA0MzogJFY2LCA0NjogJFY3IH0pLCBvKCRWOSwgWzIsIDE2XSwgeyAxNDogMjIsIDE1OiAkVmEsIDE2OiAkVmIgfSksIG8oJFY5LCBbMiwgMTddKSwgbygkVjksIFsyLCAxOF0pLCBvKCRWOSwgWzIsIDE5XSksIG8oJFY5LCBbMiwgMjBdKSwgbygkVjksIFsyLCAyMV0pLCBvKCRWOSwgWzIsIDIyXSksIG8oJFZjLCBbMiwgMjVdLCB7IDI3OiBbMSwgMjVdIH0pLCBvKCRWOSwgWzIsIDI2XSksIHsgMTk6IDI2LCAyNjogMTIsIDMxOiAkVjQgfSwgeyAxMDogJFYwLCAxMTogMjcsIDEzOiA0LCAxOTogNSwgMjA6IDYsIDIxOiAkVjEsIDIyOiA4LCAyMzogOSwgMjQ6IDEwLCAyNTogMTEsIDI2OiAxMiwgMjg6ICRWMiwgMjk6ICRWMywgMzE6ICRWNCwgMzk6ICRWNSwgNDM6ICRWNiwgNDY6ICRWNyB9LCB7IDQwOiBbMSwgMjhdLCA0MjogWzEsIDI5XSB9LCB7IDQ0OiBbMSwgMzBdIH0sIHsgNDc6IFsxLCAzMV0gfSwgbygkVmQsIFsyLCAyOV0sIHsgMzI6IDMyLCAzNTogWzEsIDMzXSwgMzc6IFsxLCAzNF0gfSksIHsgMTogWzIsIDddIH0sIG8oJFY4LCBbMiwgMTNdKSwgeyAyNjogMzUsIDMxOiAkVjQgfSwgeyAzMTogWzIsIDE0XSB9LCB7IDE3OiBbMSwgMzZdIH0sIG8oJFZjLCBbMiwgMjRdKSwgeyAxMDogJFYwLCAxMTogMzcsIDEzOiA0LCAxNDogMjIsIDE1OiAkVmEsIDE2OiAkVmIsIDE5OiA1LCAyMDogNiwgMjE6ICRWMSwgMjI6IDgsIDIzOiA5LCAyNDogMTAsIDI1OiAxMSwgMjY6IDEyLCAyODogJFYyLCAyOTogJFYzLCAzMTogJFY0LCAzOTogJFY1LCA0MzogJFY2LCA0NjogJFY3IH0sIHsgMzA6IFsxLCAzOF0gfSwgeyA0MTogWzEsIDM5XSB9LCB7IDQxOiBbMSwgNDBdIH0sIHsgNDU6IFsxLCA0MV0gfSwgeyA0ODogWzEsIDQyXSB9LCBvKCRWZCwgWzIsIDMwXSksIHsgMTg6IFsxLCA0M10gfSwgeyAxODogWzEsIDQ0XSB9LCBvKCRWYywgWzIsIDIzXSksIHsgMTg6IFsxLCA0NV0gfSwgeyAzMDogWzEsIDQ2XSB9LCBvKCRWOSwgWzIsIDI4XSksIG8oJFY5LCBbMiwgMzVdKSwgbygkVjksIFsyLCAzNl0pLCBvKCRWOSwgWzIsIDM3XSksIG8oJFY5LCBbMiwgMzhdKSwgeyAzNjogWzEsIDQ3XSB9LCB7IDMzOiA0OCwgMzQ6ICRWZSB9LCB7IDE1OiBbMSwgNTBdIH0sIG8oJFY5LCBbMiwgMjddKSwgbygkVmQsIFsyLCAzM10pLCB7IDM4OiBbMSwgNTFdIH0sIHsgMzM6IDUyLCAzNDogJFZlLCAzODogWzIsIDMxXSB9LCB7IDMxOiBbMiwgMTVdIH0sIG8oJFZkLCBbMiwgMzRdKSwgeyAzODogWzIsIDMyXSB9XSxcbiAgICBkZWZhdWx0QWN0aW9uczogeyAyMDogWzIsIDddLCAyMzogWzIsIDE0XSwgNTA6IFsyLCAxNV0sIDUyOiBbMiwgMzJdIH0sXG4gICAgcGFyc2VFcnJvcjogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBwYXJzZUVycm9yKHN0ciwgaGFzaCkge1xuICAgICAgaWYgKGhhc2gucmVjb3ZlcmFibGUpIHtcbiAgICAgICAgdGhpcy50cmFjZShzdHIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKHN0cik7XG4gICAgICAgIGVycm9yLmhhc2ggPSBoYXNoO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9LCBcInBhcnNlRXJyb3JcIiksXG4gICAgcGFyc2U6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcGFyc2UoaW5wdXQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcywgc3RhY2sgPSBbMF0sIHRzdGFjayA9IFtdLCB2c3RhY2sgPSBbbnVsbF0sIGxzdGFjayA9IFtdLCB0YWJsZSA9IHRoaXMudGFibGUsIHl5dGV4dCA9IFwiXCIsIHl5bGluZW5vID0gMCwgeXlsZW5nID0gMCwgcmVjb3ZlcmluZyA9IDAsIFRFUlJPUiA9IDIsIEVPRiA9IDE7XG4gICAgICB2YXIgYXJncyA9IGxzdGFjay5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICB2YXIgbGV4ZXIyID0gT2JqZWN0LmNyZWF0ZSh0aGlzLmxleGVyKTtcbiAgICAgIHZhciBzaGFyZWRTdGF0ZSA9IHsgeXk6IHt9IH07XG4gICAgICBmb3IgKHZhciBrIGluIHRoaXMueXkpIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnl5LCBrKSkge1xuICAgICAgICAgIHNoYXJlZFN0YXRlLnl5W2tdID0gdGhpcy55eVtrXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGV4ZXIyLnNldElucHV0KGlucHV0LCBzaGFyZWRTdGF0ZS55eSk7XG4gICAgICBzaGFyZWRTdGF0ZS55eS5sZXhlciA9IGxleGVyMjtcbiAgICAgIHNoYXJlZFN0YXRlLnl5LnBhcnNlciA9IHRoaXM7XG4gICAgICBpZiAodHlwZW9mIGxleGVyMi55eWxsb2MgPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBsZXhlcjIueXlsbG9jID0ge307XG4gICAgICB9XG4gICAgICB2YXIgeXlsb2MgPSBsZXhlcjIueXlsbG9jO1xuICAgICAgbHN0YWNrLnB1c2goeXlsb2MpO1xuICAgICAgdmFyIHJhbmdlcyA9IGxleGVyMi5vcHRpb25zICYmIGxleGVyMi5vcHRpb25zLnJhbmdlcztcbiAgICAgIGlmICh0eXBlb2Ygc2hhcmVkU3RhdGUueXkucGFyc2VFcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHRoaXMucGFyc2VFcnJvciA9IHNoYXJlZFN0YXRlLnl5LnBhcnNlRXJyb3I7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnBhcnNlRXJyb3IgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykucGFyc2VFcnJvcjtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHBvcFN0YWNrKG4pIHtcbiAgICAgICAgc3RhY2subGVuZ3RoID0gc3RhY2subGVuZ3RoIC0gMiAqIG47XG4gICAgICAgIHZzdGFjay5sZW5ndGggPSB2c3RhY2subGVuZ3RoIC0gbjtcbiAgICAgICAgbHN0YWNrLmxlbmd0aCA9IGxzdGFjay5sZW5ndGggLSBuO1xuICAgICAgfVxuICAgICAgX19uYW1lKHBvcFN0YWNrLCBcInBvcFN0YWNrXCIpO1xuICAgICAgZnVuY3Rpb24gbGV4KCkge1xuICAgICAgICB2YXIgdG9rZW47XG4gICAgICAgIHRva2VuID0gdHN0YWNrLnBvcCgpIHx8IGxleGVyMi5sZXgoKSB8fCBFT0Y7XG4gICAgICAgIGlmICh0eXBlb2YgdG9rZW4gIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICBpZiAodG9rZW4gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgdHN0YWNrID0gdG9rZW47XG4gICAgICAgICAgICB0b2tlbiA9IHRzdGFjay5wb3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdG9rZW4gPSBzZWxmLnN5bWJvbHNfW3Rva2VuXSB8fCB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICB9XG4gICAgICBfX25hbWUobGV4LCBcImxleFwiKTtcbiAgICAgIHZhciBzeW1ib2wsIHByZUVycm9yU3ltYm9sLCBzdGF0ZSwgYWN0aW9uLCBhLCByLCB5eXZhbCA9IHt9LCBwLCBsZW4sIG5ld1N0YXRlLCBleHBlY3RlZDtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHN0YXRlID0gc3RhY2tbc3RhY2subGVuZ3RoIC0gMV07XG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHRBY3Rpb25zW3N0YXRlXSkge1xuICAgICAgICAgIGFjdGlvbiA9IHRoaXMuZGVmYXVsdEFjdGlvbnNbc3RhdGVdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChzeW1ib2wgPT09IG51bGwgfHwgdHlwZW9mIHN5bWJvbCA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICBzeW1ib2wgPSBsZXgoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aW9uID0gdGFibGVbc3RhdGVdICYmIHRhYmxlW3N0YXRlXVtzeW1ib2xdO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgYWN0aW9uID09PSBcInVuZGVmaW5lZFwiIHx8ICFhY3Rpb24ubGVuZ3RoIHx8ICFhY3Rpb25bMF0pIHtcbiAgICAgICAgICB2YXIgZXJyU3RyID0gXCJcIjtcbiAgICAgICAgICBleHBlY3RlZCA9IFtdO1xuICAgICAgICAgIGZvciAocCBpbiB0YWJsZVtzdGF0ZV0pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnRlcm1pbmFsc19bcF0gJiYgcCA+IFRFUlJPUikge1xuICAgICAgICAgICAgICBleHBlY3RlZC5wdXNoKFwiJ1wiICsgdGhpcy50ZXJtaW5hbHNfW3BdICsgXCInXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobGV4ZXIyLnNob3dQb3NpdGlvbikge1xuICAgICAgICAgICAgZXJyU3RyID0gXCJQYXJzZSBlcnJvciBvbiBsaW5lIFwiICsgKHl5bGluZW5vICsgMSkgKyBcIjpcXG5cIiArIGxleGVyMi5zaG93UG9zaXRpb24oKSArIFwiXFxuRXhwZWN0aW5nIFwiICsgZXhwZWN0ZWQuam9pbihcIiwgXCIpICsgXCIsIGdvdCAnXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlcnJTdHIgPSBcIlBhcnNlIGVycm9yIG9uIGxpbmUgXCIgKyAoeXlsaW5lbm8gKyAxKSArIFwiOiBVbmV4cGVjdGVkIFwiICsgKHN5bWJvbCA9PSBFT0YgPyBcImVuZCBvZiBpbnB1dFwiIDogXCInXCIgKyAodGhpcy50ZXJtaW5hbHNfW3N5bWJvbF0gfHwgc3ltYm9sKSArIFwiJ1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5wYXJzZUVycm9yKGVyclN0ciwge1xuICAgICAgICAgICAgdGV4dDogbGV4ZXIyLm1hdGNoLFxuICAgICAgICAgICAgdG9rZW46IHRoaXMudGVybWluYWxzX1tzeW1ib2xdIHx8IHN5bWJvbCxcbiAgICAgICAgICAgIGxpbmU6IGxleGVyMi55eWxpbmVubyxcbiAgICAgICAgICAgIGxvYzogeXlsb2MsXG4gICAgICAgICAgICBleHBlY3RlZFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhY3Rpb25bMF0gaW5zdGFuY2VvZiBBcnJheSAmJiBhY3Rpb24ubGVuZ3RoID4gMSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhcnNlIEVycm9yOiBtdWx0aXBsZSBhY3Rpb25zIHBvc3NpYmxlIGF0IHN0YXRlOiBcIiArIHN0YXRlICsgXCIsIHRva2VuOiBcIiArIHN5bWJvbCk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChhY3Rpb25bMF0pIHtcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBzdGFjay5wdXNoKHN5bWJvbCk7XG4gICAgICAgICAgICB2c3RhY2sucHVzaChsZXhlcjIueXl0ZXh0KTtcbiAgICAgICAgICAgIGxzdGFjay5wdXNoKGxleGVyMi55eWxsb2MpO1xuICAgICAgICAgICAgc3RhY2sucHVzaChhY3Rpb25bMV0pO1xuICAgICAgICAgICAgc3ltYm9sID0gbnVsbDtcbiAgICAgICAgICAgIGlmICghcHJlRXJyb3JTeW1ib2wpIHtcbiAgICAgICAgICAgICAgeXlsZW5nID0gbGV4ZXIyLnl5bGVuZztcbiAgICAgICAgICAgICAgeXl0ZXh0ID0gbGV4ZXIyLnl5dGV4dDtcbiAgICAgICAgICAgICAgeXlsaW5lbm8gPSBsZXhlcjIueXlsaW5lbm87XG4gICAgICAgICAgICAgIHl5bG9jID0gbGV4ZXIyLnl5bGxvYztcbiAgICAgICAgICAgICAgaWYgKHJlY292ZXJpbmcgPiAwKSB7XG4gICAgICAgICAgICAgICAgcmVjb3ZlcmluZy0tO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzeW1ib2wgPSBwcmVFcnJvclN5bWJvbDtcbiAgICAgICAgICAgICAgcHJlRXJyb3JTeW1ib2wgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgbGVuID0gdGhpcy5wcm9kdWN0aW9uc19bYWN0aW9uWzFdXVsxXTtcbiAgICAgICAgICAgIHl5dmFsLiQgPSB2c3RhY2tbdnN0YWNrLmxlbmd0aCAtIGxlbl07XG4gICAgICAgICAgICB5eXZhbC5fJCA9IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5maXJzdF9saW5lLFxuICAgICAgICAgICAgICBsYXN0X2xpbmU6IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gMV0ubGFzdF9saW5lLFxuICAgICAgICAgICAgICBmaXJzdF9jb2x1bW46IGxzdGFja1tsc3RhY2subGVuZ3RoIC0gKGxlbiB8fCAxKV0uZmlyc3RfY29sdW1uLFxuICAgICAgICAgICAgICBsYXN0X2NvbHVtbjogbHN0YWNrW2xzdGFjay5sZW5ndGggLSAxXS5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChyYW5nZXMpIHtcbiAgICAgICAgICAgICAgeXl2YWwuXyQucmFuZ2UgPSBbXG4gICAgICAgICAgICAgICAgbHN0YWNrW2xzdGFjay5sZW5ndGggLSAobGVuIHx8IDEpXS5yYW5nZVswXSxcbiAgICAgICAgICAgICAgICBsc3RhY2tbbHN0YWNrLmxlbmd0aCAtIDFdLnJhbmdlWzFdXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByID0gdGhpcy5wZXJmb3JtQWN0aW9uLmFwcGx5KHl5dmFsLCBbXG4gICAgICAgICAgICAgIHl5dGV4dCxcbiAgICAgICAgICAgICAgeXlsZW5nLFxuICAgICAgICAgICAgICB5eWxpbmVubyxcbiAgICAgICAgICAgICAgc2hhcmVkU3RhdGUueXksXG4gICAgICAgICAgICAgIGFjdGlvblsxXSxcbiAgICAgICAgICAgICAgdnN0YWNrLFxuICAgICAgICAgICAgICBsc3RhY2tcbiAgICAgICAgICAgIF0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsZW4pIHtcbiAgICAgICAgICAgICAgc3RhY2sgPSBzdGFjay5zbGljZSgwLCAtMSAqIGxlbiAqIDIpO1xuICAgICAgICAgICAgICB2c3RhY2sgPSB2c3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgICBsc3RhY2sgPSBsc3RhY2suc2xpY2UoMCwgLTEgKiBsZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhY2sucHVzaCh0aGlzLnByb2R1Y3Rpb25zX1thY3Rpb25bMV1dWzBdKTtcbiAgICAgICAgICAgIHZzdGFjay5wdXNoKHl5dmFsLiQpO1xuICAgICAgICAgICAgbHN0YWNrLnB1c2goeXl2YWwuXyQpO1xuICAgICAgICAgICAgbmV3U3RhdGUgPSB0YWJsZVtzdGFja1tzdGFjay5sZW5ndGggLSAyXV1bc3RhY2tbc3RhY2subGVuZ3RoIC0gMV1dO1xuICAgICAgICAgICAgc3RhY2sucHVzaChuZXdTdGF0ZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSwgXCJwYXJzZVwiKVxuICB9O1xuICB2YXIgbGV4ZXIgPSAvKiBAX19QVVJFX18gKi8gKGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZXhlcjIgPSB7XG4gICAgICBFT0Y6IDEsXG4gICAgICBwYXJzZUVycm9yOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHBhcnNlRXJyb3Ioc3RyLCBoYXNoKSB7XG4gICAgICAgIGlmICh0aGlzLnl5LnBhcnNlcikge1xuICAgICAgICAgIHRoaXMueXkucGFyc2VyLnBhcnNlRXJyb3Ioc3RyLCBoYXNoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3Ioc3RyKTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwYXJzZUVycm9yXCIpLFxuICAgICAgLy8gcmVzZXRzIHRoZSBsZXhlciwgc2V0cyBuZXcgaW5wdXRcbiAgICAgIHNldElucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKGlucHV0LCB5eSkge1xuICAgICAgICB0aGlzLnl5ID0geXkgfHwgdGhpcy55eSB8fCB7fTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBpbnB1dDtcbiAgICAgICAgdGhpcy5fbW9yZSA9IHRoaXMuX2JhY2t0cmFjayA9IHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnl5bGluZW5vID0gdGhpcy55eWxlbmcgPSAwO1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2ggPSBcIlwiO1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrID0gW1wiSU5JVElBTFwiXTtcbiAgICAgICAgdGhpcy55eWxsb2MgPSB7XG4gICAgICAgICAgZmlyc3RfbGluZTogMSxcbiAgICAgICAgICBmaXJzdF9jb2x1bW46IDAsXG4gICAgICAgICAgbGFzdF9saW5lOiAxLFxuICAgICAgICAgIGxhc3RfY29sdW1uOiAwXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2UgPSBbMCwgMF07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vZmZzZXQgPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH0sIFwic2V0SW5wdXRcIiksXG4gICAgICAvLyBjb25zdW1lcyBhbmQgcmV0dXJucyBvbmUgY2hhciBmcm9tIHRoZSBpbnB1dFxuICAgICAgaW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjaCA9IHRoaXMuX2lucHV0WzBdO1xuICAgICAgICB0aGlzLnl5dGV4dCArPSBjaDtcbiAgICAgICAgdGhpcy55eWxlbmcrKztcbiAgICAgICAgdGhpcy5vZmZzZXQrKztcbiAgICAgICAgdGhpcy5tYXRjaCArPSBjaDtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IGNoO1xuICAgICAgICB2YXIgbGluZXMgPSBjaC5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8rKztcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2xpbmUrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtbisrO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucmFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy55eWxsb2MucmFuZ2VbMV0rKztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pbnB1dCA9IHRoaXMuX2lucHV0LnNsaWNlKDEpO1xuICAgICAgICByZXR1cm4gY2g7XG4gICAgICB9LCBcImlucHV0XCIpLFxuICAgICAgLy8gdW5zaGlmdHMgb25lIGNoYXIgKG9yIGEgc3RyaW5nKSBpbnRvIHRoZSBpbnB1dFxuICAgICAgdW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oY2gpIHtcbiAgICAgICAgdmFyIGxlbiA9IGNoLmxlbmd0aDtcbiAgICAgICAgdmFyIGxpbmVzID0gY2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5faW5wdXQgPSBjaCArIHRoaXMuX2lucHV0O1xuICAgICAgICB0aGlzLnl5dGV4dCA9IHRoaXMueXl0ZXh0LnN1YnN0cigwLCB0aGlzLnl5dGV4dC5sZW5ndGggLSBsZW4pO1xuICAgICAgICB0aGlzLm9mZnNldCAtPSBsZW47XG4gICAgICAgIHZhciBvbGRMaW5lcyA9IHRoaXMubWF0Y2guc3BsaXQoLyg/Olxcclxcbj98XFxuKS9nKTtcbiAgICAgICAgdGhpcy5tYXRjaCA9IHRoaXMubWF0Y2guc3Vic3RyKDAsIHRoaXMubWF0Y2gubGVuZ3RoIC0gMSk7XG4gICAgICAgIHRoaXMubWF0Y2hlZCA9IHRoaXMubWF0Y2hlZC5zdWJzdHIoMCwgdGhpcy5tYXRjaGVkLmxlbmd0aCAtIDEpO1xuICAgICAgICBpZiAobGluZXMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gLT0gbGluZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgciA9IHRoaXMueXlsbG9jLnJhbmdlO1xuICAgICAgICB0aGlzLnl5bGxvYyA9IHtcbiAgICAgICAgICBmaXJzdF9saW5lOiB0aGlzLnl5bGxvYy5maXJzdF9saW5lLFxuICAgICAgICAgIGxhc3RfbGluZTogdGhpcy55eWxpbmVubyArIDEsXG4gICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gKGxpbmVzLmxlbmd0aCA9PT0gb2xkTGluZXMubGVuZ3RoID8gdGhpcy55eWxsb2MuZmlyc3RfY29sdW1uIDogMCkgKyBvbGRMaW5lc1tvbGRMaW5lcy5sZW5ndGggLSBsaW5lcy5sZW5ndGhdLmxlbmd0aCAtIGxpbmVzWzBdLmxlbmd0aCA6IHRoaXMueXlsbG9jLmZpcnN0X2NvbHVtbiAtIGxlblxuICAgICAgICB9O1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJhbmdlcykge1xuICAgICAgICAgIHRoaXMueXlsbG9jLnJhbmdlID0gW3JbMF0sIHJbMF0gKyB0aGlzLnl5bGVuZyAtIGxlbl07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy55eWxlbmcgPSB0aGlzLnl5dGV4dC5sZW5ndGg7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJ1bnB1dFwiKSxcbiAgICAgIC8vIFdoZW4gY2FsbGVkIGZyb20gYWN0aW9uLCBjYWNoZXMgbWF0Y2hlZCB0ZXh0IGFuZCBhcHBlbmRzIGl0IG9uIG5leHQgYWN0aW9uXG4gICAgICBtb3JlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl9tb3JlID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBcIm1vcmVcIiksXG4gICAgICAvLyBXaGVuIGNhbGxlZCBmcm9tIGFjdGlvbiwgc2lnbmFscyB0aGUgbGV4ZXIgdGhhdCB0aGlzIHJ1bGUgZmFpbHMgdG8gbWF0Y2ggdGhlIGlucHV0LCBzbyB0aGUgbmV4dCBtYXRjaGluZyBydWxlIChyZWdleCkgc2hvdWxkIGJlIHRlc3RlZCBpbnN0ZWFkLlxuICAgICAgcmVqZWN0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2t0cmFja19sZXhlcikge1xuICAgICAgICAgIHRoaXMuX2JhY2t0cmFjayA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gWW91IGNhbiBvbmx5IGludm9rZSByZWplY3QoKSBpbiB0aGUgbGV4ZXIgd2hlbiB0aGUgbGV4ZXIgaXMgb2YgdGhlIGJhY2t0cmFja2luZyBwZXJzdWFzaW9uIChvcHRpb25zLmJhY2t0cmFja19sZXhlciA9IHRydWUpLlxcblwiICsgdGhpcy5zaG93UG9zaXRpb24oKSwge1xuICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgIHRva2VuOiBudWxsLFxuICAgICAgICAgICAgbGluZTogdGhpcy55eWxpbmVub1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgXCJyZWplY3RcIiksXG4gICAgICAvLyByZXRhaW4gZmlyc3QgbiBjaGFyYWN0ZXJzIG9mIHRoZSBtYXRjaFxuICAgICAgbGVzczogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihuKSB7XG4gICAgICAgIHRoaXMudW5wdXQodGhpcy5tYXRjaC5zbGljZShuKSk7XG4gICAgICB9LCBcImxlc3NcIiksXG4gICAgICAvLyBkaXNwbGF5cyBhbHJlYWR5IG1hdGNoZWQgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICBwYXN0SW5wdXQ6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwYXN0ID0gdGhpcy5tYXRjaGVkLnN1YnN0cigwLCB0aGlzLm1hdGNoZWQubGVuZ3RoIC0gdGhpcy5tYXRjaC5sZW5ndGgpO1xuICAgICAgICByZXR1cm4gKHBhc3QubGVuZ3RoID4gMjAgPyBcIi4uLlwiIDogXCJcIikgKyBwYXN0LnN1YnN0cigtMjApLnJlcGxhY2UoL1xcbi9nLCBcIlwiKTtcbiAgICAgIH0sIFwicGFzdElucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdXBjb21pbmcgaW5wdXQsIGkuZS4gZm9yIGVycm9yIG1lc3NhZ2VzXG4gICAgICB1cGNvbWluZ0lucHV0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbmV4dCA9IHRoaXMubWF0Y2g7XG4gICAgICAgIGlmIChuZXh0Lmxlbmd0aCA8IDIwKSB7XG4gICAgICAgICAgbmV4dCArPSB0aGlzLl9pbnB1dC5zdWJzdHIoMCwgMjAgLSBuZXh0Lmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChuZXh0LnN1YnN0cigwLCAyMCkgKyAobmV4dC5sZW5ndGggPiAyMCA/IFwiLi4uXCIgOiBcIlwiKSkucmVwbGFjZSgvXFxuL2csIFwiXCIpO1xuICAgICAgfSwgXCJ1cGNvbWluZ0lucHV0XCIpLFxuICAgICAgLy8gZGlzcGxheXMgdGhlIGNoYXJhY3RlciBwb3NpdGlvbiB3aGVyZSB0aGUgbGV4aW5nIGVycm9yIG9jY3VycmVkLCBpLmUuIGZvciBlcnJvciBtZXNzYWdlc1xuICAgICAgc2hvd1Bvc2l0aW9uOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJlID0gdGhpcy5wYXN0SW5wdXQoKTtcbiAgICAgICAgdmFyIGMgPSBuZXcgQXJyYXkocHJlLmxlbmd0aCArIDEpLmpvaW4oXCItXCIpO1xuICAgICAgICByZXR1cm4gcHJlICsgdGhpcy51cGNvbWluZ0lucHV0KCkgKyBcIlxcblwiICsgYyArIFwiXlwiO1xuICAgICAgfSwgXCJzaG93UG9zaXRpb25cIiksXG4gICAgICAvLyB0ZXN0IHRoZSBsZXhlZCB0b2tlbjogcmV0dXJuIEZBTFNFIHdoZW4gbm90IGEgbWF0Y2gsIG90aGVyd2lzZSByZXR1cm4gdG9rZW5cbiAgICAgIHRlc3RfbWF0Y2g6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24obWF0Y2gsIGluZGV4ZWRfcnVsZSkge1xuICAgICAgICB2YXIgdG9rZW4sIGxpbmVzLCBiYWNrdXA7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuYmFja3RyYWNrX2xleGVyKSB7XG4gICAgICAgICAgYmFja3VwID0ge1xuICAgICAgICAgICAgeXlsaW5lbm86IHRoaXMueXlsaW5lbm8sXG4gICAgICAgICAgICB5eWxsb2M6IHtcbiAgICAgICAgICAgICAgZmlyc3RfbGluZTogdGhpcy55eWxsb2MuZmlyc3RfbGluZSxcbiAgICAgICAgICAgICAgbGFzdF9saW5lOiB0aGlzLmxhc3RfbGluZSxcbiAgICAgICAgICAgICAgZmlyc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5maXJzdF9jb2x1bW4sXG4gICAgICAgICAgICAgIGxhc3RfY29sdW1uOiB0aGlzLnl5bGxvYy5sYXN0X2NvbHVtblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHl5dGV4dDogdGhpcy55eXRleHQsXG4gICAgICAgICAgICBtYXRjaDogdGhpcy5tYXRjaCxcbiAgICAgICAgICAgIG1hdGNoZXM6IHRoaXMubWF0Y2hlcyxcbiAgICAgICAgICAgIG1hdGNoZWQ6IHRoaXMubWF0Y2hlZCxcbiAgICAgICAgICAgIHl5bGVuZzogdGhpcy55eWxlbmcsXG4gICAgICAgICAgICBvZmZzZXQ6IHRoaXMub2Zmc2V0LFxuICAgICAgICAgICAgX21vcmU6IHRoaXMuX21vcmUsXG4gICAgICAgICAgICBfaW5wdXQ6IHRoaXMuX2lucHV0LFxuICAgICAgICAgICAgeXk6IHRoaXMueXksXG4gICAgICAgICAgICBjb25kaXRpb25TdGFjazogdGhpcy5jb25kaXRpb25TdGFjay5zbGljZSgwKSxcbiAgICAgICAgICAgIGRvbmU6IHRoaXMuZG9uZVxuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICAgIGJhY2t1cC55eWxsb2MucmFuZ2UgPSB0aGlzLnl5bGxvYy5yYW5nZS5zbGljZSgwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGluZXMgPSBtYXRjaFswXS5tYXRjaCgvKD86XFxyXFxuP3xcXG4pLiovZyk7XG4gICAgICAgIGlmIChsaW5lcykge1xuICAgICAgICAgIHRoaXMueXlsaW5lbm8gKz0gbGluZXMubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueXlsbG9jID0ge1xuICAgICAgICAgIGZpcnN0X2xpbmU6IHRoaXMueXlsbG9jLmxhc3RfbGluZSxcbiAgICAgICAgICBsYXN0X2xpbmU6IHRoaXMueXlsaW5lbm8gKyAxLFxuICAgICAgICAgIGZpcnN0X2NvbHVtbjogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4sXG4gICAgICAgICAgbGFzdF9jb2x1bW46IGxpbmVzID8gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubGVuZ3RoIC0gbGluZXNbbGluZXMubGVuZ3RoIC0gMV0ubWF0Y2goL1xccj9cXG4/LylbMF0ubGVuZ3RoIDogdGhpcy55eWxsb2MubGFzdF9jb2x1bW4gKyBtYXRjaFswXS5sZW5ndGhcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy55eXRleHQgKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2ggKz0gbWF0Y2hbMF07XG4gICAgICAgIHRoaXMubWF0Y2hlcyA9IG1hdGNoO1xuICAgICAgICB0aGlzLnl5bGVuZyA9IHRoaXMueXl0ZXh0Lmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yYW5nZXMpIHtcbiAgICAgICAgICB0aGlzLnl5bGxvYy5yYW5nZSA9IFt0aGlzLm9mZnNldCwgdGhpcy5vZmZzZXQgKz0gdGhpcy55eWxlbmddO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX21vcmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fYmFja3RyYWNrID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2lucHV0ID0gdGhpcy5faW5wdXQuc2xpY2UobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgICAgdGhpcy5tYXRjaGVkICs9IG1hdGNoWzBdO1xuICAgICAgICB0b2tlbiA9IHRoaXMucGVyZm9ybUFjdGlvbi5jYWxsKHRoaXMsIHRoaXMueXksIHRoaXMsIGluZGV4ZWRfcnVsZSwgdGhpcy5jb25kaXRpb25TdGFja1t0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgaWYgKHRoaXMuZG9uZSAmJiB0aGlzLl9pbnB1dCkge1xuICAgICAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgIHJldHVybiB0b2tlbjtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9iYWNrdHJhY2spIHtcbiAgICAgICAgICBmb3IgKHZhciBrIGluIGJhY2t1cCkge1xuICAgICAgICAgICAgdGhpc1trXSA9IGJhY2t1cFtrXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0sIFwidGVzdF9tYXRjaFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIGluIGlucHV0XG4gICAgICBuZXh0OiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuRU9GO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5faW5wdXQpIHtcbiAgICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0b2tlbiwgbWF0Y2gsIHRlbXBNYXRjaCwgaW5kZXg7XG4gICAgICAgIGlmICghdGhpcy5fbW9yZSkge1xuICAgICAgICAgIHRoaXMueXl0ZXh0ID0gXCJcIjtcbiAgICAgICAgICB0aGlzLm1hdGNoID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcnVsZXMgPSB0aGlzLl9jdXJyZW50UnVsZXMoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHRlbXBNYXRjaCA9IHRoaXMuX2lucHV0Lm1hdGNoKHRoaXMucnVsZXNbcnVsZXNbaV1dKTtcbiAgICAgICAgICBpZiAodGVtcE1hdGNoICYmICghbWF0Y2ggfHwgdGVtcE1hdGNoWzBdLmxlbmd0aCA+IG1hdGNoWzBdLmxlbmd0aCkpIHtcbiAgICAgICAgICAgIG1hdGNoID0gdGVtcE1hdGNoO1xuICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5iYWNrdHJhY2tfbGV4ZXIpIHtcbiAgICAgICAgICAgICAgdG9rZW4gPSB0aGlzLnRlc3RfbWF0Y2godGVtcE1hdGNoLCBydWxlc1tpXSk7XG4gICAgICAgICAgICAgIGlmICh0b2tlbiAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmFja3RyYWNrKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMub3B0aW9ucy5mbGV4KSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICB0b2tlbiA9IHRoaXMudGVzdF9tYXRjaChtYXRjaCwgcnVsZXNbaW5kZXhdKTtcbiAgICAgICAgICBpZiAodG9rZW4gIT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdG9rZW47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5faW5wdXQgPT09IFwiXCIpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5FT0Y7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucGFyc2VFcnJvcihcIkxleGljYWwgZXJyb3Igb24gbGluZSBcIiArICh0aGlzLnl5bGluZW5vICsgMSkgKyBcIi4gVW5yZWNvZ25pemVkIHRleHQuXFxuXCIgKyB0aGlzLnNob3dQb3NpdGlvbigpLCB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgdG9rZW46IG51bGwsXG4gICAgICAgICAgICBsaW5lOiB0aGlzLnl5bGluZW5vXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibmV4dFwiKSxcbiAgICAgIC8vIHJldHVybiBuZXh0IG1hdGNoIHRoYXQgaGFzIGEgdG9rZW5cbiAgICAgIGxleDogLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbiBsZXgoKSB7XG4gICAgICAgIHZhciByID0gdGhpcy5uZXh0KCk7XG4gICAgICAgIGlmIChyKSB7XG4gICAgICAgICAgcmV0dXJuIHI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubGV4KCk7XG4gICAgICAgIH1cbiAgICAgIH0sIFwibGV4XCIpLFxuICAgICAgLy8gYWN0aXZhdGVzIGEgbmV3IGxleGVyIGNvbmRpdGlvbiBzdGF0ZSAocHVzaGVzIHRoZSBuZXcgbGV4ZXIgY29uZGl0aW9uIHN0YXRlIG9udG8gdGhlIGNvbmRpdGlvbiBzdGFjaylcbiAgICAgIGJlZ2luOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIGJlZ2luKGNvbmRpdGlvbikge1xuICAgICAgICB0aGlzLmNvbmRpdGlvblN0YWNrLnB1c2goY29uZGl0aW9uKTtcbiAgICAgIH0sIFwiYmVnaW5cIiksXG4gICAgICAvLyBwb3AgdGhlIHByZXZpb3VzbHkgYWN0aXZlIGxleGVyIGNvbmRpdGlvbiBzdGF0ZSBvZmYgdGhlIGNvbmRpdGlvbiBzdGFja1xuICAgICAgcG9wU3RhdGU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gcG9wU3RhdGUoKSB7XG4gICAgICAgIHZhciBuID0gdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxO1xuICAgICAgICBpZiAobiA+IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFjay5wb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1swXTtcbiAgICAgICAgfVxuICAgICAgfSwgXCJwb3BTdGF0ZVwiKSxcbiAgICAgIC8vIHByb2R1Y2UgdGhlIGxleGVyIHJ1bGUgc2V0IHdoaWNoIGlzIGFjdGl2ZSBmb3IgdGhlIGN1cnJlbnRseSBhY3RpdmUgbGV4ZXIgY29uZGl0aW9uIHN0YXRlXG4gICAgICBfY3VycmVudFJ1bGVzOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIF9jdXJyZW50UnVsZXMoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aCAmJiB0aGlzLmNvbmRpdGlvblN0YWNrW3RoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25zW3RoaXMuY29uZGl0aW9uU3RhY2tbdGhpcy5jb25kaXRpb25TdGFjay5sZW5ndGggLSAxXV0ucnVsZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuY29uZGl0aW9uc1tcIklOSVRJQUxcIl0ucnVsZXM7XG4gICAgICAgIH1cbiAgICAgIH0sIFwiX2N1cnJlbnRSdWxlc1wiKSxcbiAgICAgIC8vIHJldHVybiB0aGUgY3VycmVudGx5IGFjdGl2ZSBsZXhlciBjb25kaXRpb24gc3RhdGU7IHdoZW4gYW4gaW5kZXggYXJndW1lbnQgaXMgcHJvdmlkZWQgaXQgcHJvZHVjZXMgdGhlIE4tdGggcHJldmlvdXMgY29uZGl0aW9uIHN0YXRlLCBpZiBhdmFpbGFibGVcbiAgICAgIHRvcFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHRvcFN0YXRlKG4pIHtcbiAgICAgICAgbiA9IHRoaXMuY29uZGl0aW9uU3RhY2subGVuZ3RoIC0gMSAtIE1hdGguYWJzKG4gfHwgMCk7XG4gICAgICAgIGlmIChuID49IDApIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5jb25kaXRpb25TdGFja1tuXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gXCJJTklUSUFMXCI7XG4gICAgICAgIH1cbiAgICAgIH0sIFwidG9wU3RhdGVcIiksXG4gICAgICAvLyBhbGlhcyBmb3IgYmVnaW4oY29uZGl0aW9uKVxuICAgICAgcHVzaFN0YXRlOiAvKiBAX19QVVJFX18gKi8gX19uYW1lKGZ1bmN0aW9uIHB1c2hTdGF0ZShjb25kaXRpb24pIHtcbiAgICAgICAgdGhpcy5iZWdpbihjb25kaXRpb24pO1xuICAgICAgfSwgXCJwdXNoU3RhdGVcIiksXG4gICAgICAvLyByZXR1cm4gdGhlIG51bWJlciBvZiBzdGF0ZXMgY3VycmVudGx5IG9uIHRoZSBzdGFja1xuICAgICAgc3RhdGVTdGFja1NpemU6IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gc3RhdGVTdGFja1NpemUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbmRpdGlvblN0YWNrLmxlbmd0aDtcbiAgICAgIH0sIFwic3RhdGVTdGFja1NpemVcIiksXG4gICAgICBvcHRpb25zOiB7fSxcbiAgICAgIHBlcmZvcm1BY3Rpb246IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24gYW5vbnltb3VzKHl5LCB5eV8sICRhdm9pZGluZ19uYW1lX2NvbGxpc2lvbnMsIFlZX1NUQVJUKSB7XG4gICAgICAgIHZhciBZWVNUQVRFID0gWVlfU1RBUlQ7XG4gICAgICAgIHN3aXRjaCAoJGF2b2lkaW5nX25hbWVfY29sbGlzaW9ucykge1xuICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiRm91bmQgYmxvY2stYmV0YVwiKTtcbiAgICAgICAgICAgIHJldHVybiAxMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiRm91bmQgaWQtYmxvY2tcIik7XG4gICAgICAgICAgICByZXR1cm4gMjk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkZvdW5kIGJsb2NrXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDEwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCIuXCIsIHl5Xy55eXRleHQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJfXCIsIHl5Xy55eXRleHQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgcmV0dXJuIDU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICB5eV8ueXl0ZXh0ID0gLTE7XG4gICAgICAgICAgICByZXR1cm4gMjg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICB5eV8ueXl0ZXh0ID0geXlfLnl5dGV4dC5yZXBsYWNlKC9jb2x1bW5zXFxzKy8sIFwiXCIpO1xuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJDT0xVTU5TIChMRVgpXCIsIHl5Xy55eXRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIDI4O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJtZF9zdHJpbmdcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICByZXR1cm4gXCJNRF9TVFJcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJzdHJpbmdcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJMRVg6IFBPUFBJTkcgU1RSOlwiLCB5eV8ueXl0ZXh0KTtcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxFWDogU1RSIGVuZDpcIiwgeXlfLnl5dGV4dCk7XG4gICAgICAgICAgICByZXR1cm4gXCJTVFJcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTQ6XG4gICAgICAgICAgICB5eV8ueXl0ZXh0ID0geXlfLnl5dGV4dC5yZXBsYWNlKC9zcGFjZVxcOi8sIFwiXCIpO1xuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJTUEFDRSBOVU0gKExFWClcIiwgeXlfLnl5dGV4dCk7XG4gICAgICAgICAgICByZXR1cm4gMjE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgICAgeXlfLnl5dGV4dCA9IFwiMVwiO1xuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJDT0xVTU5TIChMRVgpXCIsIHl5Xy55eXRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIDIxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgIHJldHVybiA0MjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgICByZXR1cm4gXCJMSU5LU1RZTEVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTg6XG4gICAgICAgICAgICByZXR1cm4gXCJJTlRFUlBPTEFURVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxOTpcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiQ0xBU1NERUZcIik7XG4gICAgICAgICAgICByZXR1cm4gMzk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDIwOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJDTEFTU0RFRklEXCIpO1xuICAgICAgICAgICAgcmV0dXJuIFwiREVGQVVMVF9DTEFTU0RFRl9JRFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyMTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiQ0xBU1NERUZJRFwiKTtcbiAgICAgICAgICAgIHJldHVybiA0MDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjI6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gNDE7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDIzOlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJDTEFTU1wiKTtcbiAgICAgICAgICAgIHJldHVybiA0MztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjQ6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIkNMQVNTX1NUWUxFXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDQ0O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyNTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiA0NTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjY6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIlNUWUxFX1NUTU5UXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDQ2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAyNzpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiU1RZTEVfREVGSU5JVElPTlwiKTtcbiAgICAgICAgICAgIHJldHVybiA0NztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMjg6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gNDg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDI5OlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJhY2NfdGl0bGVcIik7XG4gICAgICAgICAgICByZXR1cm4gXCJhY2NfdGl0bGVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzA6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gXCJhY2NfdGl0bGVfdmFsdWVcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzE6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcImFjY19kZXNjclwiKTtcbiAgICAgICAgICAgIHJldHVybiBcImFjY19kZXNjclwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzMjpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiBcImFjY19kZXNjcl92YWx1ZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzMzpcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiYWNjX2Rlc2NyX211bHRpbGluZVwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzQ6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDM1OlxuICAgICAgICAgICAgcmV0dXJuIFwiYWNjX2Rlc2NyX211bHRpbGluZV92YWx1ZVwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAzNjpcbiAgICAgICAgICAgIHJldHVybiAzMDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzc6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleDogKChcIik7XG4gICAgICAgICAgICByZXR1cm4gXCJOT0RFX0RFTkRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzg6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleDogKChcIik7XG4gICAgICAgICAgICByZXR1cm4gXCJOT0RFX0RFTkRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMzk6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleDogKSlcIik7XG4gICAgICAgICAgICByZXR1cm4gXCJOT0RFX0RFTkRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleDogKChcIik7XG4gICAgICAgICAgICByZXR1cm4gXCJOT0RFX0RFTkRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDE6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleDogKChcIik7XG4gICAgICAgICAgICByZXR1cm4gXCJOT0RFX0RFTkRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDI6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleDogKC1cIik7XG4gICAgICAgICAgICByZXR1cm4gXCJOT0RFX0RFTkRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDM6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleDogLSlcIik7XG4gICAgICAgICAgICByZXR1cm4gXCJOT0RFX0RFTkRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDQ6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleDogKChcIik7XG4gICAgICAgICAgICByZXR1cm4gXCJOT0RFX0RFTkRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDU6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleDogXV1cIik7XG4gICAgICAgICAgICByZXR1cm4gXCJOT0RFX0RFTkRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNDY6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleDogKFwiKTtcbiAgICAgICAgICAgIHJldHVybiBcIk5PREVfREVORFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0NzpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiTGV4OiBdKVwiKTtcbiAgICAgICAgICAgIHJldHVybiBcIk5PREVfREVORFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0ODpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiTGV4OiAvXVwiKTtcbiAgICAgICAgICAgIHJldHVybiBcIk5PREVfREVORFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA0OTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiTGV4OiAvXVwiKTtcbiAgICAgICAgICAgIHJldHVybiBcIk5PREVfREVORFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1MDpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiTGV4OiApXVwiKTtcbiAgICAgICAgICAgIHJldHVybiBcIk5PREVfREVORFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1MTpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiTGV4OiApXCIpO1xuICAgICAgICAgICAgcmV0dXJuIFwiTk9ERV9ERU5EXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDUyOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJMZXg6IF0+XCIpO1xuICAgICAgICAgICAgcmV0dXJuIFwiTk9ERV9ERU5EXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDUzOlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJMZXg6IF1cIik7XG4gICAgICAgICAgICByZXR1cm4gXCJOT0RFX0RFTkRcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTQ6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleGE6IC0pXCIpO1xuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJOT0RFXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDM1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA1NTpcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiTGV4YTogKC1cIik7XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIk5PREVcIik7XG4gICAgICAgICAgICByZXR1cm4gMzU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU2OlxuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJMZXhhOiApKVwiKTtcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiTk9ERVwiKTtcbiAgICAgICAgICAgIHJldHVybiAzNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTc6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleGE6IClcIik7XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIk5PREVcIik7XG4gICAgICAgICAgICByZXR1cm4gMzU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDU4OlxuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJMZXg6ICgoKFwiKTtcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiTk9ERVwiKTtcbiAgICAgICAgICAgIHJldHVybiAzNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNTk6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleGE6IClcIik7XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIk5PREVcIik7XG4gICAgICAgICAgICByZXR1cm4gMzU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDYwOlxuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJMZXhhOiApXCIpO1xuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJOT0RFXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDM1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2MTpcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiTGV4YTogKVwiKTtcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiTk9ERVwiKTtcbiAgICAgICAgICAgIHJldHVybiAzNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjI6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleGM6ID5cIik7XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIk5PREVcIik7XG4gICAgICAgICAgICByZXR1cm4gMzU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDYzOlxuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJMZXhhOiAoW1wiKTtcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiTk9ERVwiKTtcbiAgICAgICAgICAgIHJldHVybiAzNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjQ6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleGE6IClcIik7XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIk5PREVcIik7XG4gICAgICAgICAgICByZXR1cm4gMzU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDY1OlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJOT0RFXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDM1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2NjpcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiTk9ERVwiKTtcbiAgICAgICAgICAgIHJldHVybiAzNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNjc6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIk5PREVcIik7XG4gICAgICAgICAgICByZXR1cm4gMzU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDY4OlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJOT0RFXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDM1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA2OTpcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiTk9ERVwiKTtcbiAgICAgICAgICAgIHJldHVybiAzNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzA6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIk5PREVcIik7XG4gICAgICAgICAgICByZXR1cm4gMzU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDcxOlxuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJOT0RFXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDM1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3MjpcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiTGV4YTogW1wiKTtcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiTk9ERVwiKTtcbiAgICAgICAgICAgIHJldHVybiAzNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzM6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIkJMT0NLX0FSUk9XXCIpO1xuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJMRVggQVJSIFNUQVJUXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDM3O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3NDpcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiTGV4OiBOT0RFX0lEXCIsIHl5Xy55eXRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIDMxO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA3NTpcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiTGV4OiBFT0ZcIiwgeXlfLnl5dGV4dCk7XG4gICAgICAgICAgICByZXR1cm4gODtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzY6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIm1kX3N0cmluZ1wiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzc6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIm1kX3N0cmluZ1wiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgNzg6XG4gICAgICAgICAgICByZXR1cm4gXCJOT0RFX0RFU0NSXCI7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDc5OlxuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4MDpcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiTGV4OiBTdGFydGluZyBzdHJpbmdcIik7XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcInN0cmluZ1wiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgODE6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxFWCBBUlI6IFN0YXJ0aW5nIHN0cmluZ1wiKTtcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwic3RyaW5nXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4MjpcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiTEVYOiBOT0RFX0RFU0NSOlwiLCB5eV8ueXl0ZXh0KTtcbiAgICAgICAgICAgIHJldHVybiBcIk5PREVfREVTQ1JcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgODM6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxFWCBQT1BQSU5HXCIpO1xuICAgICAgICAgICAgdGhpcy5wb3BTdGF0ZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4NDpcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiTGV4OiA9PkJBRVwiKTtcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiQVJST1dfRElSXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4NTpcbiAgICAgICAgICAgIHl5Xy55eXRleHQgPSB5eV8ueXl0ZXh0LnJlcGxhY2UoL14sXFxzKi8sIFwiXCIpO1xuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJMZXggKHJpZ2h0KTogZGlyOlwiLCB5eV8ueXl0ZXh0KTtcbiAgICAgICAgICAgIHJldHVybiBcIkRJUlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4NjpcbiAgICAgICAgICAgIHl5Xy55eXRleHQgPSB5eV8ueXl0ZXh0LnJlcGxhY2UoL14sXFxzKi8sIFwiXCIpO1xuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJMZXggKGxlZnQpOlwiLCB5eV8ueXl0ZXh0KTtcbiAgICAgICAgICAgIHJldHVybiBcIkRJUlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4NzpcbiAgICAgICAgICAgIHl5Xy55eXRleHQgPSB5eV8ueXl0ZXh0LnJlcGxhY2UoL14sXFxzKi8sIFwiXCIpO1xuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJMZXggKHgpOlwiLCB5eV8ueXl0ZXh0KTtcbiAgICAgICAgICAgIHJldHVybiBcIkRJUlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4ODpcbiAgICAgICAgICAgIHl5Xy55eXRleHQgPSB5eV8ueXl0ZXh0LnJlcGxhY2UoL14sXFxzKi8sIFwiXCIpO1xuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJMZXggKHkpOlwiLCB5eV8ueXl0ZXh0KTtcbiAgICAgICAgICAgIHJldHVybiBcIkRJUlwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA4OTpcbiAgICAgICAgICAgIHl5Xy55eXRleHQgPSB5eV8ueXl0ZXh0LnJlcGxhY2UoL14sXFxzKi8sIFwiXCIpO1xuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJMZXggKHVwKTpcIiwgeXlfLnl5dGV4dCk7XG4gICAgICAgICAgICByZXR1cm4gXCJESVJcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTA6XG4gICAgICAgICAgICB5eV8ueXl0ZXh0ID0geXlfLnl5dGV4dC5yZXBsYWNlKC9eLFxccyovLCBcIlwiKTtcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiTGV4IChkb3duKTpcIiwgeXlfLnl5dGV4dCk7XG4gICAgICAgICAgICByZXR1cm4gXCJESVJcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTE6XG4gICAgICAgICAgICB5eV8ueXl0ZXh0ID0gXCJdPlwiO1xuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJMZXggKEFSUk9XX0RJUiBlbmQpOlwiLCB5eV8ueXl0ZXh0KTtcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHJldHVybiBcIkJMT0NLX0FSUk9XX0VORFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA5MjpcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiTGV4OiBMSU5LXCIsIFwiI1wiICsgeXlfLnl5dGV4dCArIFwiI1wiKTtcbiAgICAgICAgICAgIHJldHVybiAxNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTM6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleDogTElOS1wiLCB5eV8ueXl0ZXh0KTtcbiAgICAgICAgICAgIHJldHVybiAxNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTQ6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleDogTElOS1wiLCB5eV8ueXl0ZXh0KTtcbiAgICAgICAgICAgIHJldHVybiAxNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTU6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleDogTElOS1wiLCB5eV8ueXl0ZXh0KTtcbiAgICAgICAgICAgIHJldHVybiAxNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTY6XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleDogU1RBUlRfTElOS1wiLCB5eV8ueXl0ZXh0KTtcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwiTExBQkVMXCIpO1xuICAgICAgICAgICAgcmV0dXJuIDE2O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSA5NzpcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiTGV4OiBTVEFSVF9MSU5LXCIsIHl5Xy55eXRleHQpO1xuICAgICAgICAgICAgdGhpcy5wdXNoU3RhdGUoXCJMTEFCRUxcIik7XG4gICAgICAgICAgICByZXR1cm4gMTY7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDk4OlxuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJMZXg6IFNUQVJUX0xJTktcIiwgeXlfLnl5dGV4dCk7XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIkxMQUJFTFwiKTtcbiAgICAgICAgICAgIHJldHVybiAxNjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgOTk6XG4gICAgICAgICAgICB0aGlzLnB1c2hTdGF0ZShcIm1kX3N0cmluZ1wiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTAwOlxuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJMZXg6IFN0YXJ0aW5nIHN0cmluZ1wiKTtcbiAgICAgICAgICAgIHRoaXMucHVzaFN0YXRlKFwic3RyaW5nXCIpO1xuICAgICAgICAgICAgcmV0dXJuIFwiTElOS19MQUJFTFwiO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMDE6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleDogTElOS1wiLCBcIiNcIiArIHl5Xy55eXRleHQgKyBcIiNcIik7XG4gICAgICAgICAgICByZXR1cm4gMTU7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIDEwMjpcbiAgICAgICAgICAgIHRoaXMucG9wU3RhdGUoKTtcbiAgICAgICAgICAgIHl5LmdldExvZ2dlcigpLmRlYnVnKFwiTGV4OiBMSU5LXCIsIHl5Xy55eXRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIDE1O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMDM6XG4gICAgICAgICAgICB0aGlzLnBvcFN0YXRlKCk7XG4gICAgICAgICAgICB5eS5nZXRMb2dnZXIoKS5kZWJ1ZyhcIkxleDogTElOS1wiLCB5eV8ueXl0ZXh0KTtcbiAgICAgICAgICAgIHJldHVybiAxNTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTA0OlxuICAgICAgICAgICAgeXkuZ2V0TG9nZ2VyKCkuZGVidWcoXCJMZXg6IENPTE9OXCIsIHl5Xy55eXRleHQpO1xuICAgICAgICAgICAgeXlfLnl5dGV4dCA9IHl5Xy55eXRleHQuc2xpY2UoMSk7XG4gICAgICAgICAgICByZXR1cm4gMjc7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfSwgXCJhbm9ueW1vdXNcIiksXG4gICAgICBydWxlczogWy9eKD86YmxvY2stYmV0YVxcYikvLCAvXig/OmJsb2NrOikvLCAvXig/OmJsb2NrXFxiKS8sIC9eKD86W1xcc10rKS8sIC9eKD86W1xcbl0rKS8sIC9eKD86KChcXHUwMDBEXFx1MDAwQSl8KFxcdTAwMEEpKSkvLCAvXig/OmNvbHVtbnNcXHMrYXV0b1xcYikvLCAvXig/OmNvbHVtbnNcXHMrW1xcZF0rKS8sIC9eKD86W1wiXVtgXSkvLCAvXig/OlteYFwiXSspLywgL14oPzpbYF1bXCJdKS8sIC9eKD86W1wiXSkvLCAvXig/OltcIl0pLywgL14oPzpbXlwiXSopLywgL14oPzpzcGFjZVs6XVxcZCspLywgL14oPzpzcGFjZVxcYikvLCAvXig/OmRlZmF1bHRcXGIpLywgL14oPzpsaW5rU3R5bGVcXGIpLywgL14oPzppbnRlcnBvbGF0ZVxcYikvLCAvXig/OmNsYXNzRGVmXFxzKykvLCAvXig/OkRFRkFVTFRcXHMrKS8sIC9eKD86XFx3K1xccyspLywgL14oPzpbXlxcbl0qKS8sIC9eKD86Y2xhc3NcXHMrKS8sIC9eKD86KFxcdyspKygoLFxccypcXHcrKSopKS8sIC9eKD86W15cXG5dKikvLCAvXig/OnN0eWxlXFxzKykvLCAvXig/OihcXHcrKSsoKCxcXHMqXFx3KykqKSkvLCAvXig/OlteXFxuXSopLywgL14oPzphY2NUaXRsZVxccyo6XFxzKikvLCAvXig/Oig/IVxcbnx8KSpbXlxcbl0qKS8sIC9eKD86YWNjRGVzY3JcXHMqOlxccyopLywgL14oPzooPyFcXG58fCkqW15cXG5dKikvLCAvXig/OmFjY0Rlc2NyXFxzKlxce1xccyopLywgL14oPzpbXFx9XSkvLCAvXig/OlteXFx9XSopLywgL14oPzplbmRcXGJcXHMqKS8sIC9eKD86XFwoXFwoXFwoKS8sIC9eKD86XFwpXFwpXFwpKS8sIC9eKD86W1xcKV1cXCkpLywgL14oPzpcXH1cXH0pLywgL14oPzpcXH0pLywgL14oPzpcXCgtKS8sIC9eKD86LVxcKSkvLCAvXig/OlxcKFxcKCkvLCAvXig/OlxcXVxcXSkvLCAvXig/OlxcKCkvLCAvXig/OlxcXVxcKSkvLCAvXig/OlxcXFxcXF0pLywgL14oPzpcXC9cXF0pLywgL14oPzpcXClcXF0pLywgL14oPzpbXFwpXSkvLCAvXig/OlxcXT4pLywgL14oPzpbXFxdXSkvLCAvXig/Oi1cXCkpLywgL14oPzpcXCgtKS8sIC9eKD86XFwpXFwpKS8sIC9eKD86XFwpKS8sIC9eKD86XFwoXFwoXFwoKS8sIC9eKD86XFwoXFwoKS8sIC9eKD86XFx7XFx7KS8sIC9eKD86XFx7KS8sIC9eKD86PikvLCAvXig/OlxcKFxcWykvLCAvXig/OlxcKCkvLCAvXig/OlxcW1xcWykvLCAvXig/OlxcW1xcfCkvLCAvXig/OlxcW1xcKCkvLCAvXig/OlxcKVxcKVxcKSkvLCAvXig/OlxcW1xcXFwpLywgL14oPzpcXFtcXC8pLywgL14oPzpcXFtcXFxcKS8sIC9eKD86XFxbKS8sIC9eKD86PFxcWykvLCAvXig/OlteXFwoXFxbXFxuXFwtXFwpXFx7XFx9XFxzXFw8XFw+Oj1dKykvLCAvXig/OiQpLywgL14oPzpbXCJdW2BdKS8sIC9eKD86W1wiXVtgXSkvLCAvXig/OlteYFwiXSspLywgL14oPzpbYF1bXCJdKS8sIC9eKD86W1wiXSkvLCAvXig/OltcIl0pLywgL14oPzpbXlwiXSspLywgL14oPzpbXCJdKS8sIC9eKD86XFxdPlxccypcXCgpLywgL14oPzosP1xccypyaWdodFxccyopLywgL14oPzosP1xccypsZWZ0XFxzKikvLCAvXig/Oiw/XFxzKnhcXHMqKS8sIC9eKD86LD9cXHMqeVxccyopLywgL14oPzosP1xccyp1cFxccyopLywgL14oPzosP1xccypkb3duXFxzKikvLCAvXig/OlxcKVxccyopLywgL14oPzpcXHMqW3hvPF0/LS0rWy14bz5dXFxzKikvLCAvXig/OlxccypbeG88XT89PStbPXhvPl1cXHMqKS8sIC9eKD86XFxzKlt4bzxdPy0/XFwuKy1beG8+XT9cXHMqKS8sIC9eKD86XFxzKn5+W1xcfl0rXFxzKikvLCAvXig/OlxccypbeG88XT8tLVxccyopLywgL14oPzpcXHMqW3hvPF0/PT1cXHMqKS8sIC9eKD86XFxzKlt4bzxdPy1cXC5cXHMqKS8sIC9eKD86W1wiXVtgXSkvLCAvXig/OltcIl0pLywgL14oPzpcXHMqW3hvPF0/LS0rWy14bz5dXFxzKikvLCAvXig/OlxccypbeG88XT89PStbPXhvPl1cXHMqKS8sIC9eKD86XFxzKlt4bzxdPy0/XFwuKy1beG8+XT9cXHMqKS8sIC9eKD86OlxcZCspL10sXG4gICAgICBjb25kaXRpb25zOiB7IFwiU1RZTEVfREVGSU5JVElPTlwiOiB7IFwicnVsZXNcIjogWzI4XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJTVFlMRV9TVE1OVFwiOiB7IFwicnVsZXNcIjogWzI3XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJDTEFTU0RFRklEXCI6IHsgXCJydWxlc1wiOiBbMjJdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIkNMQVNTREVGXCI6IHsgXCJydWxlc1wiOiBbMjAsIDIxXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJDTEFTU19TVFlMRVwiOiB7IFwicnVsZXNcIjogWzI1XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJDTEFTU1wiOiB7IFwicnVsZXNcIjogWzI0XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJMTEFCRUxcIjogeyBcInJ1bGVzXCI6IFs5OSwgMTAwLCAxMDEsIDEwMiwgMTAzXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJBUlJPV19ESVJcIjogeyBcInJ1bGVzXCI6IFs4NSwgODYsIDg3LCA4OCwgODksIDkwLCA5MV0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiQkxPQ0tfQVJST1dcIjogeyBcInJ1bGVzXCI6IFs3NiwgODEsIDg0XSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJOT0RFXCI6IHsgXCJydWxlc1wiOiBbMzcsIDM4LCAzOSwgNDAsIDQxLCA0MiwgNDMsIDQ0LCA0NSwgNDYsIDQ3LCA0OCwgNDksIDUwLCA1MSwgNTIsIDUzLCA3NywgODBdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcIm1kX3N0cmluZ1wiOiB7IFwicnVsZXNcIjogWzksIDEwLCA3OCwgNzldLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcInNwYWNlXCI6IHsgXCJydWxlc1wiOiBbXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJzdHJpbmdcIjogeyBcInJ1bGVzXCI6IFsxMiwgMTMsIDgyLCA4M10sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiYWNjX2Rlc2NyX211bHRpbGluZVwiOiB7IFwicnVsZXNcIjogWzM0LCAzNV0sIFwiaW5jbHVzaXZlXCI6IGZhbHNlIH0sIFwiYWNjX2Rlc2NyXCI6IHsgXCJydWxlc1wiOiBbMzJdLCBcImluY2x1c2l2ZVwiOiBmYWxzZSB9LCBcImFjY190aXRsZVwiOiB7IFwicnVsZXNcIjogWzMwXSwgXCJpbmNsdXNpdmVcIjogZmFsc2UgfSwgXCJJTklUSUFMXCI6IHsgXCJydWxlc1wiOiBbMCwgMSwgMiwgMywgNCwgNSwgNiwgNywgOCwgMTEsIDE0LCAxNSwgMTYsIDE3LCAxOCwgMTksIDIzLCAyNiwgMjksIDMxLCAzMywgMzYsIDU0LCA1NSwgNTYsIDU3LCA1OCwgNTksIDYwLCA2MSwgNjIsIDYzLCA2NCwgNjUsIDY2LCA2NywgNjgsIDY5LCA3MCwgNzEsIDcyLCA3MywgNzQsIDc1LCA5MiwgOTMsIDk0LCA5NSwgOTYsIDk3LCA5OCwgMTA0XSwgXCJpbmNsdXNpdmVcIjogdHJ1ZSB9IH1cbiAgICB9O1xuICAgIHJldHVybiBsZXhlcjI7XG4gIH0pKCk7XG4gIHBhcnNlcjIubGV4ZXIgPSBsZXhlcjtcbiAgZnVuY3Rpb24gUGFyc2VyKCkge1xuICAgIHRoaXMueXkgPSB7fTtcbiAgfVxuICBfX25hbWUoUGFyc2VyLCBcIlBhcnNlclwiKTtcbiAgUGFyc2VyLnByb3RvdHlwZSA9IHBhcnNlcjI7XG4gIHBhcnNlcjIuUGFyc2VyID0gUGFyc2VyO1xuICByZXR1cm4gbmV3IFBhcnNlcigpO1xufSkoKTtcbnBhcnNlci5wYXJzZXIgPSBwYXJzZXI7XG52YXIgYmxvY2tfZGVmYXVsdCA9IHBhcnNlcjtcblxuLy8gc3JjL2RpYWdyYW1zL2Jsb2NrL2Jsb2NrREIudHNcbmltcG9ydCB7IGNsb25lIH0gZnJvbSBcImVzLXRvb2xraXQvY29tcGF0XCI7XG52YXIgYmxvY2tEYXRhYmFzZSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG52YXIgZWRnZUxpc3QgPSBbXTtcbnZhciBlZGdlQ291bnQgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xudmFyIENPTE9SX0tFWVdPUkQgPSBcImNvbG9yXCI7XG52YXIgRklMTF9LRVlXT1JEID0gXCJmaWxsXCI7XG52YXIgQkdfRklMTCA9IFwiYmdGaWxsXCI7XG52YXIgU1RZTEVDTEFTU19TRVAgPSBcIixcIjtcbnZhciBjb25maWcgPSBnZXRDb25maWcyKCk7XG52YXIgY2xhc3NlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG52YXIgZGlhZ3JhbUlkID0gXCJcIjtcbnZhciBzYW5pdGl6ZVRleHQyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgodHh0KSA9PiBjb21tb25fZGVmYXVsdC5zYW5pdGl6ZVRleHQodHh0LCBjb25maWcpLCBcInNhbml0aXplVGV4dFwiKTtcbnZhciBhZGRTdHlsZUNsYXNzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihpZCwgc3R5bGVBdHRyaWJ1dGVzID0gXCJcIikge1xuICBsZXQgZm91bmRDbGFzcyA9IGNsYXNzZXMuZ2V0KGlkKTtcbiAgaWYgKCFmb3VuZENsYXNzKSB7XG4gICAgZm91bmRDbGFzcyA9IHsgaWQsIHN0eWxlczogW10sIHRleHRTdHlsZXM6IFtdIH07XG4gICAgY2xhc3Nlcy5zZXQoaWQsIGZvdW5kQ2xhc3MpO1xuICB9XG4gIGlmIChzdHlsZUF0dHJpYnV0ZXMgIT09IHZvaWQgMCAmJiBzdHlsZUF0dHJpYnV0ZXMgIT09IG51bGwpIHtcbiAgICBzdHlsZUF0dHJpYnV0ZXMuc3BsaXQoU1RZTEVDTEFTU19TRVApLmZvckVhY2goKGF0dHJpYikgPT4ge1xuICAgICAgY29uc3QgZml4ZWRBdHRyaWIgPSBhdHRyaWIucmVwbGFjZSgvKFteO10qKTsvLCBcIiQxXCIpLnRyaW0oKTtcbiAgICAgIGlmIChSZWdFeHAoQ09MT1JfS0VZV09SRCkuZXhlYyhhdHRyaWIpKSB7XG4gICAgICAgIGNvbnN0IG5ld1N0eWxlMSA9IGZpeGVkQXR0cmliLnJlcGxhY2UoRklMTF9LRVlXT1JELCBCR19GSUxMKTtcbiAgICAgICAgY29uc3QgbmV3U3R5bGUyID0gbmV3U3R5bGUxLnJlcGxhY2UoQ09MT1JfS0VZV09SRCwgRklMTF9LRVlXT1JEKTtcbiAgICAgICAgZm91bmRDbGFzcy50ZXh0U3R5bGVzLnB1c2gobmV3U3R5bGUyKTtcbiAgICAgIH1cbiAgICAgIGZvdW5kQ2xhc3Muc3R5bGVzLnB1c2goZml4ZWRBdHRyaWIpO1xuICAgIH0pO1xuICB9XG59LCBcImFkZFN0eWxlQ2xhc3NcIik7XG52YXIgYWRkU3R5bGUyTm9kZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoZnVuY3Rpb24oaWQsIHN0eWxlcyA9IFwiXCIpIHtcbiAgY29uc3QgZm91bmRCbG9jayA9IGJsb2NrRGF0YWJhc2UuZ2V0KGlkKTtcbiAgaWYgKHN0eWxlcyAhPT0gdm9pZCAwICYmIHN0eWxlcyAhPT0gbnVsbCkge1xuICAgIGZvdW5kQmxvY2suc3R5bGVzID0gc3R5bGVzLnNwbGl0KFNUWUxFQ0xBU1NfU0VQKTtcbiAgfVxufSwgXCJhZGRTdHlsZTJOb2RlXCIpO1xudmFyIHNldENzc0NsYXNzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihpdGVtSWRzLCBjc3NDbGFzc05hbWUpIHtcbiAgaXRlbUlkcy5zcGxpdChcIixcIikuZm9yRWFjaChmdW5jdGlvbihpZCkge1xuICAgIGxldCBmb3VuZEJsb2NrID0gYmxvY2tEYXRhYmFzZS5nZXQoaWQpO1xuICAgIGlmIChmb3VuZEJsb2NrID09PSB2b2lkIDApIHtcbiAgICAgIGNvbnN0IHRyaW1tZWRJZCA9IGlkLnRyaW0oKTtcbiAgICAgIGZvdW5kQmxvY2sgPSB7IGlkOiB0cmltbWVkSWQsIHR5cGU6IFwibmFcIiwgY2hpbGRyZW46IFtdIH07XG4gICAgICBibG9ja0RhdGFiYXNlLnNldCh0cmltbWVkSWQsIGZvdW5kQmxvY2spO1xuICAgIH1cbiAgICBpZiAoIWZvdW5kQmxvY2suY2xhc3Nlcykge1xuICAgICAgZm91bmRCbG9jay5jbGFzc2VzID0gW107XG4gICAgfVxuICAgIGZvdW5kQmxvY2suY2xhc3Nlcy5wdXNoKGNzc0NsYXNzTmFtZSk7XG4gIH0pO1xufSwgXCJzZXRDc3NDbGFzc1wiKTtcbnZhciBwb3B1bGF0ZUJsb2NrRGF0YWJhc2UgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChfYmxvY2tMaXN0LCBwYXJlbnQpID0+IHtcbiAgY29uc3QgYmxvY2tMaXN0ID0gX2Jsb2NrTGlzdC5mbGF0KCk7XG4gIGNvbnN0IGNoaWxkcmVuID0gW107XG4gIGNvbnN0IGNvbHVtblNldHRpbmdCbG9jayA9IGJsb2NrTGlzdC5maW5kKChiKSA9PiBiPy50eXBlID09PSBcImNvbHVtbi1zZXR0aW5nXCIpO1xuICBjb25zdCBjb2x1bW4gPSBjb2x1bW5TZXR0aW5nQmxvY2s/LmNvbHVtbnMgPz8gLTE7XG4gIGZvciAoY29uc3QgYmxvY2sgb2YgYmxvY2tMaXN0KSB7XG4gICAgaWYgKHR5cGVvZiBjb2x1bW4gPT09IFwibnVtYmVyXCIgJiYgY29sdW1uID4gMCAmJiBibG9jay50eXBlICE9PSBcImNvbHVtbi1zZXR0aW5nXCIgJiYgdHlwZW9mIGJsb2NrLndpZHRoSW5Db2x1bW5zID09PSBcIm51bWJlclwiICYmIGJsb2NrLndpZHRoSW5Db2x1bW5zID4gY29sdW1uKSB7XG4gICAgICBsb2cud2FybihcbiAgICAgICAgYEJsb2NrICR7YmxvY2suaWR9IHdpZHRoICR7YmxvY2sud2lkdGhJbkNvbHVtbnN9IGV4Y2VlZHMgY29uZmlndXJlZCBjb2x1bW4gd2lkdGggJHtjb2x1bW59YFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGJsb2NrLmxhYmVsKSB7XG4gICAgICBibG9jay5sYWJlbCA9IHNhbml0aXplVGV4dDIoYmxvY2subGFiZWwpO1xuICAgIH1cbiAgICBpZiAoYmxvY2sudHlwZSA9PT0gXCJjbGFzc0RlZlwiKSB7XG4gICAgICBhZGRTdHlsZUNsYXNzKGJsb2NrLmlkLCBibG9jay5jc3MpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChibG9jay50eXBlID09PSBcImFwcGx5Q2xhc3NcIikge1xuICAgICAgc2V0Q3NzQ2xhc3MoYmxvY2suaWQsIGJsb2NrPy5zdHlsZUNsYXNzID8/IFwiXCIpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChibG9jay50eXBlID09PSBcImFwcGx5U3R5bGVzXCIpIHtcbiAgICAgIGlmIChibG9jaz8uc3R5bGVzU3RyKSB7XG4gICAgICAgIGFkZFN0eWxlMk5vZGUoYmxvY2suaWQsIGJsb2NrPy5zdHlsZXNTdHIpO1xuICAgICAgfVxuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGlmIChibG9jay50eXBlID09PSBcImNvbHVtbi1zZXR0aW5nXCIpIHtcbiAgICAgIHBhcmVudC5jb2x1bW5zID0gYmxvY2suY29sdW1ucyA/PyAtMTtcbiAgICB9IGVsc2UgaWYgKGJsb2NrLnR5cGUgPT09IFwiZWRnZVwiKSB7XG4gICAgICBjb25zdCBjb3VudCA9IChlZGdlQ291bnQuZ2V0KGJsb2NrLmlkKSA/PyAwKSArIDE7XG4gICAgICBlZGdlQ291bnQuc2V0KGJsb2NrLmlkLCBjb3VudCk7XG4gICAgICBibG9jay5pZCA9IGNvdW50ICsgXCItXCIgKyBibG9jay5pZDtcbiAgICAgIGVkZ2VMaXN0LnB1c2goYmxvY2spO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWJsb2NrLmxhYmVsKSB7XG4gICAgICAgIGlmIChibG9jay50eXBlID09PSBcImNvbXBvc2l0ZVwiKSB7XG4gICAgICAgICAgYmxvY2subGFiZWwgPSBcIlwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJsb2NrLmxhYmVsID0gYmxvY2suaWQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGV4aXN0aW5nQmxvY2sgPSBibG9ja0RhdGFiYXNlLmdldChibG9jay5pZCk7XG4gICAgICBpZiAoZXhpc3RpbmdCbG9jayA9PT0gdm9pZCAwKSB7XG4gICAgICAgIGJsb2NrRGF0YWJhc2Uuc2V0KGJsb2NrLmlkLCBibG9jayk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoYmxvY2sudHlwZSAhPT0gXCJuYVwiKSB7XG4gICAgICAgICAgZXhpc3RpbmdCbG9jay50eXBlID0gYmxvY2sudHlwZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYmxvY2subGFiZWwgIT09IGJsb2NrLmlkKSB7XG4gICAgICAgICAgZXhpc3RpbmdCbG9jay5sYWJlbCA9IGJsb2NrLmxhYmVsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoYmxvY2suY2hpbGRyZW4pIHtcbiAgICAgICAgcG9wdWxhdGVCbG9ja0RhdGFiYXNlKGJsb2NrLmNoaWxkcmVuLCBibG9jayk7XG4gICAgICB9XG4gICAgICBpZiAoYmxvY2sudHlwZSA9PT0gXCJzcGFjZVwiKSB7XG4gICAgICAgIGNvbnN0IHcgPSBibG9jay53aWR0aCA/PyAxO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHc7IGorKykge1xuICAgICAgICAgIGNvbnN0IG5ld0Jsb2NrID0gY2xvbmUoYmxvY2spO1xuICAgICAgICAgIG5ld0Jsb2NrLmlkID0gbmV3QmxvY2suaWQgKyBcIi1cIiArIGo7XG4gICAgICAgICAgYmxvY2tEYXRhYmFzZS5zZXQobmV3QmxvY2suaWQsIG5ld0Jsb2NrKTtcbiAgICAgICAgICBjaGlsZHJlbi5wdXNoKG5ld0Jsb2NrKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChleGlzdGluZ0Jsb2NrID09PSB2b2lkIDApIHtcbiAgICAgICAgY2hpbGRyZW4ucHVzaChibG9jayk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHBhcmVudC5jaGlsZHJlbiA9IGNoaWxkcmVuO1xufSwgXCJwb3B1bGF0ZUJsb2NrRGF0YWJhc2VcIik7XG52YXIgYmxvY2tzID0gW107XG52YXIgcm9vdEJsb2NrID0geyBpZDogXCJyb290XCIsIHR5cGU6IFwiY29tcG9zaXRlXCIsIGNoaWxkcmVuOiBbXSwgY29sdW1uczogLTEgfTtcbnZhciBjbGVhcjIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCgpID0+IHtcbiAgbG9nLmRlYnVnKFwiQ2xlYXIgY2FsbGVkXCIpO1xuICBjbGVhcigpO1xuICByb290QmxvY2sgPSB7IGlkOiBcInJvb3RcIiwgdHlwZTogXCJjb21wb3NpdGVcIiwgY2hpbGRyZW46IFtdLCBjb2x1bW5zOiAtMSB9O1xuICBibG9ja0RhdGFiYXNlID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoW1tcInJvb3RcIiwgcm9vdEJsb2NrXV0pO1xuICBibG9ja3MgPSBbXTtcbiAgY2xhc3NlcyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIGVkZ2VMaXN0ID0gW107XG4gIGVkZ2VDb3VudCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIGRpYWdyYW1JZCA9IFwiXCI7XG59LCBcImNsZWFyXCIpO1xuZnVuY3Rpb24gdHlwZVN0cjJUeXBlKHR5cGVTdHIpIHtcbiAgbG9nLmRlYnVnKFwidHlwZVN0cjJUeXBlXCIsIHR5cGVTdHIpO1xuICBzd2l0Y2ggKHR5cGVTdHIpIHtcbiAgICBjYXNlIFwiW11cIjpcbiAgICAgIHJldHVybiBcInNxdWFyZVwiO1xuICAgIGNhc2UgXCIoKVwiOlxuICAgICAgbG9nLmRlYnVnKFwid2UgaGF2ZSBhIHJvdW5kXCIpO1xuICAgICAgcmV0dXJuIFwicm91bmRcIjtcbiAgICBjYXNlIFwiKCgpKVwiOlxuICAgICAgcmV0dXJuIFwiY2lyY2xlXCI7XG4gICAgY2FzZSBcIj5dXCI6XG4gICAgICByZXR1cm4gXCJyZWN0X2xlZnRfaW52X2Fycm93XCI7XG4gICAgY2FzZSBcInt9XCI6XG4gICAgICByZXR1cm4gXCJkaWFtb25kXCI7XG4gICAgY2FzZSBcInt7fX1cIjpcbiAgICAgIHJldHVybiBcImhleGFnb25cIjtcbiAgICBjYXNlIFwiKFtdKVwiOlxuICAgICAgcmV0dXJuIFwic3RhZGl1bVwiO1xuICAgIGNhc2UgXCJbW11dXCI6XG4gICAgICByZXR1cm4gXCJzdWJyb3V0aW5lXCI7XG4gICAgY2FzZSBcIlsoKV1cIjpcbiAgICAgIHJldHVybiBcImN5bGluZGVyXCI7XG4gICAgY2FzZSBcIigoKCkpKVwiOlxuICAgICAgcmV0dXJuIFwiZG91YmxlY2lyY2xlXCI7XG4gICAgY2FzZSBcIlsvL11cIjpcbiAgICAgIHJldHVybiBcImxlYW5fcmlnaHRcIjtcbiAgICBjYXNlIFwiW1xcXFxcXFxcXVwiOlxuICAgICAgcmV0dXJuIFwibGVhbl9sZWZ0XCI7XG4gICAgY2FzZSBcIlsvXFxcXF1cIjpcbiAgICAgIHJldHVybiBcInRyYXBlem9pZFwiO1xuICAgIGNhc2UgXCJbXFxcXC9dXCI6XG4gICAgICByZXR1cm4gXCJpbnZfdHJhcGV6b2lkXCI7XG4gICAgY2FzZSBcIjxbXT5cIjpcbiAgICAgIHJldHVybiBcImJsb2NrX2Fycm93XCI7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBcIm5hXCI7XG4gIH1cbn1cbl9fbmFtZSh0eXBlU3RyMlR5cGUsIFwidHlwZVN0cjJUeXBlXCIpO1xuZnVuY3Rpb24gZWRnZVR5cGVTdHIyVHlwZSh0eXBlU3RyKSB7XG4gIGxvZy5kZWJ1ZyhcInR5cGVTdHIyVHlwZVwiLCB0eXBlU3RyKTtcbiAgc3dpdGNoICh0eXBlU3RyKSB7XG4gICAgY2FzZSBcIj09XCI6XG4gICAgICByZXR1cm4gXCJ0aGlja1wiO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gXCJub3JtYWxcIjtcbiAgfVxufVxuX19uYW1lKGVkZ2VUeXBlU3RyMlR5cGUsIFwiZWRnZVR5cGVTdHIyVHlwZVwiKTtcbmZ1bmN0aW9uIGVkZ2VTdHJUb0VkZ2VEYXRhKHR5cGVTdHIpIHtcbiAgY29uc3QgbGFzdENoYXIgPSB0eXBlU3RyLnRyaW0oKS5zbGljZSgtMSk7XG4gIHN3aXRjaCAobGFzdENoYXIpIHtcbiAgICBjYXNlIFwieFwiOlxuICAgICAgcmV0dXJuIFwiYXJyb3dfY3Jvc3NcIjtcbiAgICBjYXNlIFwib1wiOlxuICAgICAgcmV0dXJuIFwiYXJyb3dfY2lyY2xlXCI7XG4gICAgY2FzZSBcIj5cIjpcbiAgICAgIHJldHVybiBcImFycm93X3BvaW50XCI7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBcIlwiO1xuICB9XG59XG5fX25hbWUoZWRnZVN0clRvRWRnZURhdGEsIFwiZWRnZVN0clRvRWRnZURhdGFcIik7XG5mdW5jdGlvbiBlZGdlU3RyVG9FZGdlU3RhcnREYXRhKHR5cGVTdHIpIHtcbiAgY29uc3QgZmlyc3RDaGFyID0gdHlwZVN0ci50cmltKCkuY2hhckF0KDApO1xuICBzd2l0Y2ggKGZpcnN0Q2hhcikge1xuICAgIGNhc2UgXCJ4XCI6XG4gICAgICByZXR1cm4gXCJhcnJvd19jcm9zc1wiO1xuICAgIGNhc2UgXCJvXCI6XG4gICAgICByZXR1cm4gXCJhcnJvd19jaXJjbGVcIjtcbiAgICBjYXNlIFwiPFwiOlxuICAgICAgcmV0dXJuIFwiYXJyb3dfcG9pbnRcIjtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFwiYXJyb3dfb3BlblwiO1xuICB9XG59XG5fX25hbWUoZWRnZVN0clRvRWRnZVN0YXJ0RGF0YSwgXCJlZGdlU3RyVG9FZGdlU3RhcnREYXRhXCIpO1xuZnVuY3Rpb24gZWRnZVN0clRvVGhpY2tuZXNzKHR5cGVTdHIpIHtcbiAgcmV0dXJuIHR5cGVTdHIuaW5jbHVkZXMoXCI9PVwiKSA/IFwidGhpY2tcIiA6IFwibm9ybWFsXCI7XG59XG5fX25hbWUoZWRnZVN0clRvVGhpY2tuZXNzLCBcImVkZ2VTdHJUb1RoaWNrbmVzc1wiKTtcbmZ1bmN0aW9uIGVkZ2VTdHJUb1BhdHRlcm4odHlwZVN0cikge1xuICBpZiAodHlwZVN0ci5pbmNsdWRlcyhcIi4tXCIpKSB7XG4gICAgcmV0dXJuIFwiZG90dGVkXCI7XG4gIH1cbiAgcmV0dXJuIFwic29saWRcIjtcbn1cbl9fbmFtZShlZGdlU3RyVG9QYXR0ZXJuLCBcImVkZ2VTdHJUb1BhdHRlcm5cIik7XG52YXIgY250ID0gMDtcbnZhciBnZW5lcmF0ZUlkID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiB7XG4gIGNudCsrO1xuICByZXR1cm4gXCJpZC1cIiArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCAxMikgKyBcIi1cIiArIGNudDtcbn0sIFwiZ2VuZXJhdGVJZFwiKTtcbnZhciBzZXRIaWVyYXJjaHkgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChibG9jaykgPT4ge1xuICByb290QmxvY2suY2hpbGRyZW4gPSBibG9jaztcbiAgcG9wdWxhdGVCbG9ja0RhdGFiYXNlKGJsb2NrLCByb290QmxvY2spO1xuICBibG9ja3MgPSByb290QmxvY2suY2hpbGRyZW47XG59LCBcInNldEhpZXJhcmNoeVwiKTtcbnZhciBnZXRDb2x1bW5zID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoYmxvY2tJZCkgPT4ge1xuICBjb25zdCBibG9jayA9IGJsb2NrRGF0YWJhc2UuZ2V0KGJsb2NrSWQpO1xuICBpZiAoIWJsb2NrKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG4gIGlmIChibG9jay5jb2x1bW5zKSB7XG4gICAgcmV0dXJuIGJsb2NrLmNvbHVtbnM7XG4gIH1cbiAgaWYgKCFibG9jay5jaGlsZHJlbikge1xuICAgIHJldHVybiAtMTtcbiAgfVxuICByZXR1cm4gYmxvY2suY2hpbGRyZW4ubGVuZ3RoO1xufSwgXCJnZXRDb2x1bW5zXCIpO1xudmFyIGdldEJsb2Nrc0ZsYXQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCgpID0+IHtcbiAgcmV0dXJuIFsuLi5ibG9ja0RhdGFiYXNlLnZhbHVlcygpXTtcbn0sIFwiZ2V0QmxvY2tzRmxhdFwiKTtcbnZhciBnZXRCbG9ja3MgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKCgpID0+IHtcbiAgcmV0dXJuIGJsb2NrcyB8fCBbXTtcbn0sIFwiZ2V0QmxvY2tzXCIpO1xudmFyIGdldEVkZ2VzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiB7XG4gIHJldHVybiBlZGdlTGlzdDtcbn0sIFwiZ2V0RWRnZXNcIik7XG52YXIgZ2V0QmxvY2sgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChpZCkgPT4ge1xuICByZXR1cm4gYmxvY2tEYXRhYmFzZS5nZXQoaWQpO1xufSwgXCJnZXRCbG9ja1wiKTtcbnZhciBzZXRCbG9jayA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGJsb2NrKSA9PiB7XG4gIGJsb2NrRGF0YWJhc2Uuc2V0KGJsb2NrLmlkLCBibG9jayk7XG59LCBcInNldEJsb2NrXCIpO1xudmFyIHNldERpYWdyYW1JZCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGlkKSA9PiB7XG4gIGRpYWdyYW1JZCA9IGlkO1xufSwgXCJzZXREaWFncmFtSWRcIik7XG52YXIgZ2V0RGlhZ3JhbUlkID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiBkaWFncmFtSWQsIFwiZ2V0RGlhZ3JhbUlkXCIpO1xudmFyIGdldExvZ2dlciA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKCkgPT4gbG9nLCBcImdldExvZ2dlclwiKTtcbnZhciBnZXRDbGFzc2VzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGNsYXNzZXM7XG59LCBcImdldENsYXNzZXNcIik7XG52YXIgZGIgPSB7XG4gIGdldENvbmZpZzogLyogQF9fUFVSRV9fICovIF9fbmFtZSgoKSA9PiBnZXRDb25maWcoKS5ibG9jaywgXCJnZXRDb25maWdcIiksXG4gIHR5cGVTdHIyVHlwZSxcbiAgZWRnZVR5cGVTdHIyVHlwZSxcbiAgZWRnZVN0clRvRWRnZURhdGEsXG4gIGVkZ2VTdHJUb0VkZ2VTdGFydERhdGEsXG4gIGVkZ2VTdHJUb1RoaWNrbmVzcyxcbiAgZWRnZVN0clRvUGF0dGVybixcbiAgZ2V0TG9nZ2VyLFxuICBnZXRCbG9ja3NGbGF0LFxuICBnZXRCbG9ja3MsXG4gIGdldEVkZ2VzLFxuICBzZXRIaWVyYXJjaHksXG4gIGdldEJsb2NrLFxuICBzZXRCbG9jayxcbiAgZ2V0Q29sdW1ucyxcbiAgZ2V0Q2xhc3NlcyxcbiAgY2xlYXI6IGNsZWFyMixcbiAgZ2VuZXJhdGVJZCxcbiAgc2V0RGlhZ3JhbUlkLFxuICBnZXREaWFncmFtSWRcbn07XG52YXIgYmxvY2tEQl9kZWZhdWx0ID0gZGI7XG5cbi8vIHNyYy9kaWFncmFtcy9ibG9jay9zdHlsZXMudHNcbmltcG9ydCAqIGFzIGtocm9tYSBmcm9tIFwia2hyb21hXCI7XG52YXIgZmFkZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGNvbG9yLCBvcGFjaXR5KSA9PiB7XG4gIGNvbnN0IGNoYW5uZWwyID0ga2hyb21hLmNoYW5uZWw7XG4gIGNvbnN0IHIgPSBjaGFubmVsMihjb2xvciwgXCJyXCIpO1xuICBjb25zdCBnID0gY2hhbm5lbDIoY29sb3IsIFwiZ1wiKTtcbiAgY29uc3QgYiA9IGNoYW5uZWwyKGNvbG9yLCBcImJcIik7XG4gIHJldHVybiBraHJvbWEucmdiYShyLCBnLCBiLCBvcGFjaXR5KTtcbn0sIFwiZmFkZVwiKTtcbnZhciBnZXRTdHlsZXMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChvcHRpb25zKSA9PiBgLmxhYmVsIHtcbiAgICBmb250LWZhbWlseTogJHtvcHRpb25zLmZvbnRGYW1pbHl9O1xuICAgIGNvbG9yOiAke29wdGlvbnMubm9kZVRleHRDb2xvciB8fCBvcHRpb25zLnRleHRDb2xvcn07XG4gIH1cbiAgLmNsdXN0ZXItbGFiZWwgdGV4dCB7XG4gICAgZmlsbDogJHtvcHRpb25zLnRpdGxlQ29sb3J9O1xuICB9XG4gIC5jbHVzdGVyLWxhYmVsIHNwYW4scCB7XG4gICAgY29sb3I6ICR7b3B0aW9ucy50aXRsZUNvbG9yfTtcbiAgfVxuXG5cblxuICAubGFiZWwgdGV4dCxzcGFuLHAge1xuICAgIGZpbGw6ICR7b3B0aW9ucy5ub2RlVGV4dENvbG9yIHx8IG9wdGlvbnMudGV4dENvbG9yfTtcbiAgICBjb2xvcjogJHtvcHRpb25zLm5vZGVUZXh0Q29sb3IgfHwgb3B0aW9ucy50ZXh0Q29sb3J9O1xuICB9XG5cbiAgLm5vZGUgcmVjdCxcbiAgLm5vZGUgY2lyY2xlLFxuICAubm9kZSBlbGxpcHNlLFxuICAubm9kZSBwb2x5Z29uLFxuICAubm9kZSBwYXRoIHtcbiAgICBmaWxsOiAke29wdGlvbnMubWFpbkJrZ307XG4gICAgc3Ryb2tlOiAke29wdGlvbnMubm9kZUJvcmRlcn07XG4gICAgc3Ryb2tlLXdpZHRoOiAxcHg7XG4gIH1cbiAgLmZsb3djaGFydC1sYWJlbCB0ZXh0IHtcbiAgICB0ZXh0LWFuY2hvcjogbWlkZGxlO1xuICB9XG4gIC8vIC5mbG93Y2hhcnQtbGFiZWwgLnRleHQtb3V0ZXItdHNwYW4ge1xuICAvLyAgIHRleHQtYW5jaG9yOiBtaWRkbGU7XG4gIC8vIH1cbiAgLy8gLmZsb3djaGFydC1sYWJlbCAudGV4dC1pbm5lci10c3BhbiB7XG4gIC8vICAgdGV4dC1hbmNob3I6IHN0YXJ0O1xuICAvLyB9XG5cbiAgLm5vZGUgLmxhYmVsIHtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIH1cbiAgLm5vZGUuY2xpY2thYmxlIHtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gIH1cblxuICAuYXJyb3doZWFkUGF0aCB7XG4gICAgZmlsbDogJHtvcHRpb25zLmFycm93aGVhZENvbG9yfTtcbiAgfVxuXG4gIC5lZGdlUGF0aCAucGF0aCB7XG4gICAgc3Ryb2tlOiAke29wdGlvbnMubGluZUNvbG9yfTtcbiAgICBzdHJva2Utd2lkdGg6IDIuMHB4O1xuICB9XG5cbiAgLmZsb3djaGFydC1saW5rIHtcbiAgICBzdHJva2U6ICR7b3B0aW9ucy5saW5lQ29sb3J9O1xuICAgIGZpbGw6IG5vbmU7XG4gIH1cblxuICAuZWRnZUxhYmVsIHtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke29wdGlvbnMuZWRnZUxhYmVsQmFja2dyb3VuZH07XG4gICAgLypcbiAgICAgKiBUaGlzIGlzIGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IHdpdGggZXhpc3RpbmcgY29kZSB0aGF0IGRpZG4ndFxuICAgICAqIGFkZCBhIFxcYDxwPlxcYCBhcm91bmQgZWRnZSBsYWJlbHMuXG4gICAgICpcbiAgICAgKiBUT0RPOiBXZSBzaG91bGQgcHJvYmFibHkgcmVtb3ZlIHRoaXMgaW4gYSBmdXR1cmUgcmVsZWFzZS5cbiAgICAgKi9cbiAgICBwIHtcbiAgICAgIG1hcmdpbjogMDtcbiAgICAgIHBhZGRpbmc6IDA7XG4gICAgICBkaXNwbGF5OiBpbmxpbmU7XG4gICAgfVxuICAgIHJlY3Qge1xuICAgICAgb3BhY2l0eTogMC41O1xuICAgICAgYmFja2dyb3VuZC1jb2xvcjogJHtvcHRpb25zLmVkZ2VMYWJlbEJhY2tncm91bmR9O1xuICAgICAgZmlsbDogJHtvcHRpb25zLmVkZ2VMYWJlbEJhY2tncm91bmR9O1xuICAgIH1cbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIH1cblxuICAvKiBGb3IgaHRtbCBsYWJlbHMgb25seSAqL1xuICAubGFiZWxCa2cge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICR7b3B0aW9ucy5lZGdlTGFiZWxCYWNrZ3JvdW5kfTtcbiAgfVxuXG4gIC5ub2RlIC5jbHVzdGVyIHtcbiAgICAvLyBmaWxsOiAke2ZhZGUob3B0aW9ucy5tYWluQmtnLCAwLjUpfTtcbiAgICBmaWxsOiAke2ZhZGUob3B0aW9ucy5jbHVzdGVyQmtnLCAwLjUpfTtcbiAgICBzdHJva2U6ICR7ZmFkZShvcHRpb25zLmNsdXN0ZXJCb3JkZXIsIDAuMil9O1xuICAgIGJveC1zaGFkb3c6IHJnYmEoNTAsIDUwLCA5MywgMC4yNSkgMHB4IDEzcHggMjdweCAtNXB4LCByZ2JhKDAsIDAsIDAsIDAuMykgMHB4IDhweCAxNnB4IC04cHg7XG4gICAgc3Ryb2tlLXdpZHRoOiAxcHg7XG4gIH1cblxuICAuY2x1c3RlciB0ZXh0IHtcbiAgICBmaWxsOiAke29wdGlvbnMudGl0bGVDb2xvcn07XG4gIH1cblxuICAuY2x1c3RlciBzcGFuLHAge1xuICAgIGNvbG9yOiAke29wdGlvbnMudGl0bGVDb2xvcn07XG4gIH1cbiAgLyogLmNsdXN0ZXIgZGl2IHtcbiAgICBjb2xvcjogJHtvcHRpb25zLnRpdGxlQ29sb3J9O1xuICB9ICovXG5cbiAgZGl2Lm1lcm1haWRUb29sdGlwIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgIG1heC13aWR0aDogMjAwcHg7XG4gICAgcGFkZGluZzogMnB4O1xuICAgIGZvbnQtZmFtaWx5OiAke29wdGlvbnMuZm9udEZhbWlseX07XG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGJhY2tncm91bmQ6ICR7b3B0aW9ucy50ZXJ0aWFyeUNvbG9yfTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAke29wdGlvbnMuYm9yZGVyMn07XG4gICAgYm9yZGVyLXJhZGl1czogMnB4O1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICAgIHotaW5kZXg6IDEwMDtcbiAgfVxuXG4gIC5mbG93Y2hhcnRUaXRsZVRleHQge1xuICAgIHRleHQtYW5jaG9yOiBtaWRkbGU7XG4gICAgZm9udC1zaXplOiAxOHB4O1xuICAgIGZpbGw6ICR7b3B0aW9ucy50ZXh0Q29sb3J9O1xuICB9XG4gICR7Z2V0SWNvblN0eWxlcygpfVxuYCwgXCJnZXRTdHlsZXNcIik7XG52YXIgc3R5bGVzX2RlZmF1bHQgPSBnZXRTdHlsZXM7XG5cbi8vIHNyYy9kaWFncmFtcy9ibG9jay9ibG9ja1JlbmRlcmVyLnRzXG5pbXBvcnQgeyBzZWxlY3QgYXMgZDNzZWxlY3QgfSBmcm9tIFwiZDNcIjtcblxuLy8gc3JjL2RhZ3JlLXdyYXBwZXIvbWFya2Vycy5qc1xudmFyIGluc2VydE1hcmtlcnMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChlbGVtLCBtYXJrZXJBcnJheSwgdHlwZSwgaWQpID0+IHtcbiAgbWFya2VyQXJyYXkuZm9yRWFjaCgobWFya2VyTmFtZSkgPT4ge1xuICAgIG1hcmtlcnNbbWFya2VyTmFtZV0oZWxlbSwgdHlwZSwgaWQpO1xuICB9KTtcbn0sIFwiaW5zZXJ0TWFya2Vyc1wiKTtcbnZhciBleHRlbnNpb24gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChlbGVtLCB0eXBlLCBpZCkgPT4ge1xuICBsb2cudHJhY2UoXCJNYWtpbmcgbWFya2VycyBmb3IgXCIsIGlkKTtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1leHRlbnNpb25TdGFydFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgZXh0ZW5zaW9uIFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgMTgpLmF0dHIoXCJyZWZZXCIsIDcpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAxOTApLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMjQwKS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSAxLDcgTDE4LDEzIFYgMSBaXCIpO1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLWV4dGVuc2lvbkVuZFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgZXh0ZW5zaW9uIFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgMSkuYXR0cihcInJlZllcIiwgNykuYXR0cihcIm1hcmtlcldpZHRoXCIsIDIwKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDI4KS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSAxLDEgViAxMyBMMTgsNyBaXCIpO1xufSwgXCJleHRlbnNpb25cIik7XG52YXIgY29tcG9zaXRpb24gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChlbGVtLCB0eXBlLCBpZCkgPT4ge1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLWNvbXBvc2l0aW9uU3RhcnRcIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIGNvbXBvc2l0aW9uIFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgMTgpLmF0dHIoXCJyZWZZXCIsIDcpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAxOTApLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMjQwKS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSAxOCw3IEw5LDEzIEwxLDcgTDksMSBaXCIpO1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLWNvbXBvc2l0aW9uRW5kXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hcmtlciBjb21wb3NpdGlvbiBcIiArIHR5cGUpLmF0dHIoXCJyZWZYXCIsIDEpLmF0dHIoXCJyZWZZXCIsIDcpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAyMCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAyOCkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0gMTgsNyBMOSwxMyBMMSw3IEw5LDEgWlwiKTtcbn0sIFwiY29tcG9zaXRpb25cIik7XG52YXIgYWdncmVnYXRpb24gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChlbGVtLCB0eXBlLCBpZCkgPT4ge1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLWFnZ3JlZ2F0aW9uU3RhcnRcIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIGFnZ3JlZ2F0aW9uIFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgMTgpLmF0dHIoXCJyZWZZXCIsIDcpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAxOTApLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMjQwKS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSAxOCw3IEw5LDEzIEwxLDcgTDksMSBaXCIpO1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLWFnZ3JlZ2F0aW9uRW5kXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hcmtlciBhZ2dyZWdhdGlvbiBcIiArIHR5cGUpLmF0dHIoXCJyZWZYXCIsIDEpLmF0dHIoXCJyZWZZXCIsIDcpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAyMCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAyOCkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0gMTgsNyBMOSwxMyBMMSw3IEw5LDEgWlwiKTtcbn0sIFwiYWdncmVnYXRpb25cIik7XG52YXIgZGVwZW5kZW5jeSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGVsZW0sIHR5cGUsIGlkKSA9PiB7XG4gIGVsZW0uYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCJfXCIgKyB0eXBlICsgXCItZGVwZW5kZW5jeVN0YXJ0XCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hcmtlciBkZXBlbmRlbmN5IFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgNikuYXR0cihcInJlZllcIiwgNykuYXR0cihcIm1hcmtlcldpZHRoXCIsIDE5MCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAyNDApLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNIDUsNyBMOSwxMyBMMSw3IEw5LDEgWlwiKTtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1kZXBlbmRlbmN5RW5kXCIpLmF0dHIoXCJjbGFzc1wiLCBcIm1hcmtlciBkZXBlbmRlbmN5IFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgMTMpLmF0dHIoXCJyZWZZXCIsIDcpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAyMCkuYXR0cihcIm1hcmtlckhlaWdodFwiLCAyOCkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiZFwiLCBcIk0gMTgsNyBMOSwxMyBMMTQsNyBMOSwxIFpcIik7XG59LCBcImRlcGVuZGVuY3lcIik7XG52YXIgbG9sbGlwb3AgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChlbGVtLCB0eXBlLCBpZCkgPT4ge1xuICBlbGVtLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLWxvbGxpcG9wU3RhcnRcIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIGxvbGxpcG9wIFwiICsgdHlwZSkuYXR0cihcInJlZlhcIiwgMTMpLmF0dHIoXCJyZWZZXCIsIDcpLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCAxOTApLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMjQwKS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcInN0cm9rZVwiLCBcImJsYWNrXCIpLmF0dHIoXCJmaWxsXCIsIFwidHJhbnNwYXJlbnRcIikuYXR0cihcImN4XCIsIDcpLmF0dHIoXCJjeVwiLCA3KS5hdHRyKFwiclwiLCA2KTtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1sb2xsaXBvcEVuZFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgbG9sbGlwb3AgXCIgKyB0eXBlKS5hdHRyKFwicmVmWFwiLCAxKS5hdHRyKFwicmVmWVwiLCA3KS5hdHRyKFwibWFya2VyV2lkdGhcIiwgMTkwKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDI0MCkuYXR0cihcIm9yaWVudFwiLCBcImF1dG9cIikuYXBwZW5kKFwiY2lyY2xlXCIpLmF0dHIoXCJzdHJva2VcIiwgXCJibGFja1wiKS5hdHRyKFwiZmlsbFwiLCBcInRyYW5zcGFyZW50XCIpLmF0dHIoXCJjeFwiLCA3KS5hdHRyKFwiY3lcIiwgNykuYXR0cihcInJcIiwgNik7XG59LCBcImxvbGxpcG9wXCIpO1xudmFyIHBvaW50ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZWxlbSwgdHlwZSwgaWQpID0+IHtcbiAgZWxlbS5hcHBlbmQoXCJtYXJrZXJcIikuYXR0cihcImlkXCIsIGlkICsgXCJfXCIgKyB0eXBlICsgXCItcG9pbnRFbmRcIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIFwiICsgdHlwZSkuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMTAgMTBcIikuYXR0cihcInJlZlhcIiwgNikuYXR0cihcInJlZllcIiwgNSkuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIikuYXR0cihcIm1hcmtlcldpZHRoXCIsIDEyKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDEyKS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSAwIDAgTCAxMCA1IEwgMCAxMCB6XCIpLmF0dHIoXCJjbGFzc1wiLCBcImFycm93TWFya2VyUGF0aFwiKS5zdHlsZShcInN0cm9rZS13aWR0aFwiLCAxKS5zdHlsZShcInN0cm9rZS1kYXNoYXJyYXlcIiwgXCIxLDBcIik7XG4gIGVsZW0uYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLXBvaW50U3RhcnRcIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIFwiICsgdHlwZSkuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMTAgMTBcIikuYXR0cihcInJlZlhcIiwgNC41KS5hdHRyKFwicmVmWVwiLCA1KS5hdHRyKFwibWFya2VyVW5pdHNcIiwgXCJ1c2VyU3BhY2VPblVzZVwiKS5hdHRyKFwibWFya2VyV2lkdGhcIiwgMTIpLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMTIpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNIDAgNSBMIDEwIDEwIEwgMTAgMCB6XCIpLmF0dHIoXCJjbGFzc1wiLCBcImFycm93TWFya2VyUGF0aFwiKS5zdHlsZShcInN0cm9rZS13aWR0aFwiLCAxKS5zdHlsZShcInN0cm9rZS1kYXNoYXJyYXlcIiwgXCIxLDBcIik7XG59LCBcInBvaW50XCIpO1xudmFyIGNpcmNsZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGVsZW0sIHR5cGUsIGlkKSA9PiB7XG4gIGVsZW0uYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLWNpcmNsZUVuZFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgXCIgKyB0eXBlKS5hdHRyKFwidmlld0JveFwiLCBcIjAgMCAxMCAxMFwiKS5hdHRyKFwicmVmWFwiLCAxMSkuYXR0cihcInJlZllcIiwgNSkuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIikuYXR0cihcIm1hcmtlcldpZHRoXCIsIDExKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDExKS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImN4XCIsIFwiNVwiKS5hdHRyKFwiY3lcIiwgXCI1XCIpLmF0dHIoXCJyXCIsIFwiNVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJhcnJvd01hcmtlclBhdGhcIikuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgMSkuc3R5bGUoXCJzdHJva2UtZGFzaGFycmF5XCIsIFwiMSwwXCIpO1xuICBlbGVtLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1jaXJjbGVTdGFydFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgXCIgKyB0eXBlKS5hdHRyKFwidmlld0JveFwiLCBcIjAgMCAxMCAxMFwiKS5hdHRyKFwicmVmWFwiLCAtMSkuYXR0cihcInJlZllcIiwgNSkuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIikuYXR0cihcIm1hcmtlcldpZHRoXCIsIDExKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDExKS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJjaXJjbGVcIikuYXR0cihcImN4XCIsIFwiNVwiKS5hdHRyKFwiY3lcIiwgXCI1XCIpLmF0dHIoXCJyXCIsIFwiNVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJhcnJvd01hcmtlclBhdGhcIikuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgMSkuc3R5bGUoXCJzdHJva2UtZGFzaGFycmF5XCIsIFwiMSwwXCIpO1xufSwgXCJjaXJjbGVcIik7XG52YXIgY3Jvc3MgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChlbGVtLCB0eXBlLCBpZCkgPT4ge1xuICBlbGVtLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1jcm9zc0VuZFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJtYXJrZXIgY3Jvc3MgXCIgKyB0eXBlKS5hdHRyKFwidmlld0JveFwiLCBcIjAgMCAxMSAxMVwiKS5hdHRyKFwicmVmWFwiLCAxMikuYXR0cihcInJlZllcIiwgNS4yKS5hdHRyKFwibWFya2VyVW5pdHNcIiwgXCJ1c2VyU3BhY2VPblVzZVwiKS5hdHRyKFwibWFya2VyV2lkdGhcIiwgMTEpLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMTEpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNIDEsMSBsIDksOSBNIDEwLDEgbCAtOSw5XCIpLmF0dHIoXCJjbGFzc1wiLCBcImFycm93TWFya2VyUGF0aFwiKS5zdHlsZShcInN0cm9rZS13aWR0aFwiLCAyKS5zdHlsZShcInN0cm9rZS1kYXNoYXJyYXlcIiwgXCIxLDBcIik7XG4gIGVsZW0uYXBwZW5kKFwibWFya2VyXCIpLmF0dHIoXCJpZFwiLCBpZCArIFwiX1wiICsgdHlwZSArIFwiLWNyb3NzU3RhcnRcIikuYXR0cihcImNsYXNzXCIsIFwibWFya2VyIGNyb3NzIFwiICsgdHlwZSkuYXR0cihcInZpZXdCb3hcIiwgXCIwIDAgMTEgMTFcIikuYXR0cihcInJlZlhcIiwgLTEpLmF0dHIoXCJyZWZZXCIsIDUuMikuYXR0cihcIm1hcmtlclVuaXRzXCIsIFwidXNlclNwYWNlT25Vc2VcIikuYXR0cihcIm1hcmtlcldpZHRoXCIsIDExKS5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDExKS5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKS5hcHBlbmQoXCJwYXRoXCIpLmF0dHIoXCJkXCIsIFwiTSAxLDEgbCA5LDkgTSAxMCwxIGwgLTksOVwiKS5hdHRyKFwiY2xhc3NcIiwgXCJhcnJvd01hcmtlclBhdGhcIikuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgMikuc3R5bGUoXCJzdHJva2UtZGFzaGFycmF5XCIsIFwiMSwwXCIpO1xufSwgXCJjcm9zc1wiKTtcbnZhciBiYXJiID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZWxlbSwgdHlwZSwgaWQpID0+IHtcbiAgZWxlbS5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcIm1hcmtlclwiKS5hdHRyKFwiaWRcIiwgaWQgKyBcIl9cIiArIHR5cGUgKyBcIi1iYXJiRW5kXCIpLmF0dHIoXCJyZWZYXCIsIDE5KS5hdHRyKFwicmVmWVwiLCA3KS5hdHRyKFwibWFya2VyV2lkdGhcIiwgMjApLmF0dHIoXCJtYXJrZXJIZWlnaHRcIiwgMTQpLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInN0cm9rZVdpZHRoXCIpLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgXCJNIDE5LDcgTDksMTMgTDE0LDcgTDksMSBaXCIpO1xufSwgXCJiYXJiXCIpO1xudmFyIG1hcmtlcnMgPSB7XG4gIGV4dGVuc2lvbixcbiAgY29tcG9zaXRpb24sXG4gIGFnZ3JlZ2F0aW9uLFxuICBkZXBlbmRlbmN5LFxuICBsb2xsaXBvcCxcbiAgcG9pbnQsXG4gIGNpcmNsZSxcbiAgY3Jvc3MsXG4gIGJhcmJcbn07XG52YXIgbWFya2Vyc19kZWZhdWx0ID0gaW5zZXJ0TWFya2VycztcblxuLy8gc3JjL2RpYWdyYW1zL2Jsb2NrL2xheW91dC50c1xudmFyIHBhZGRpbmcgPSBnZXRDb25maWcyKCk/LmJsb2NrPy5wYWRkaW5nID8/IDg7XG5mdW5jdGlvbiBjYWxjdWxhdGVCbG9ja1Bvc2l0aW9uKGNvbHVtbnMsIHBvc2l0aW9uKSB7XG4gIGlmIChjb2x1bW5zID09PSAwIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKGNvbHVtbnMpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiQ29sdW1ucyBtdXN0IGJlIGFuIGludGVnZXIgIT09IDAuXCIpO1xuICB9XG4gIGlmIChwb3NpdGlvbiA8IDAgfHwgIU51bWJlci5pc0ludGVnZXIocG9zaXRpb24pKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiUG9zaXRpb24gbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLlwiICsgcG9zaXRpb24pO1xuICB9XG4gIGlmIChjb2x1bW5zIDwgMCkge1xuICAgIHJldHVybiB7IHB4OiBwb3NpdGlvbiwgcHk6IDAgfTtcbiAgfVxuICBpZiAoY29sdW1ucyA9PT0gMSkge1xuICAgIHJldHVybiB7IHB4OiAwLCBweTogcG9zaXRpb24gfTtcbiAgfVxuICBjb25zdCBweCA9IHBvc2l0aW9uICUgY29sdW1ucztcbiAgY29uc3QgcHkgPSBNYXRoLmZsb29yKHBvc2l0aW9uIC8gY29sdW1ucyk7XG4gIHJldHVybiB7IHB4LCBweSB9O1xufVxuX19uYW1lKGNhbGN1bGF0ZUJsb2NrUG9zaXRpb24sIFwiY2FsY3VsYXRlQmxvY2tQb3NpdGlvblwiKTtcbnZhciBnZXRNYXhDaGlsZFNpemUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChibG9jaykgPT4ge1xuICBsZXQgbWF4V2lkdGggPSAwO1xuICBsZXQgbWF4SGVpZ2h0ID0gMDtcbiAgZm9yIChjb25zdCBjaGlsZCBvZiBibG9jay5jaGlsZHJlbikge1xuICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCwgeCwgeSB9ID0gY2hpbGQuc2l6ZSA/PyB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAsIHg6IDAsIHk6IDAgfTtcbiAgICBsb2cuZGVidWcoXG4gICAgICBcImdldE1heENoaWxkU2l6ZSBhYmM5NSBjaGlsZDpcIixcbiAgICAgIGNoaWxkLmlkLFxuICAgICAgXCJ3aWR0aDpcIixcbiAgICAgIHdpZHRoLFxuICAgICAgXCJoZWlnaHQ6XCIsXG4gICAgICBoZWlnaHQsXG4gICAgICBcIng6XCIsXG4gICAgICB4LFxuICAgICAgXCJ5OlwiLFxuICAgICAgeSxcbiAgICAgIGNoaWxkLnR5cGVcbiAgICApO1xuICAgIGlmIChjaGlsZC50eXBlID09PSBcInNwYWNlXCIpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBjb25zdCBub3JtYWxpemVkV2lkdGggPSB3aWR0aCAvIChjaGlsZC53aWR0aEluQ29sdW1ucyA/PyAxKTtcbiAgICBpZiAobm9ybWFsaXplZFdpZHRoID4gbWF4V2lkdGgpIHtcbiAgICAgIG1heFdpZHRoID0gbm9ybWFsaXplZFdpZHRoO1xuICAgIH1cbiAgICBpZiAoaGVpZ2h0ID4gbWF4SGVpZ2h0KSB7XG4gICAgICBtYXhIZWlnaHQgPSBoZWlnaHQ7XG4gICAgfVxuICB9XG4gIHJldHVybiB7IHdpZHRoOiBtYXhXaWR0aCwgaGVpZ2h0OiBtYXhIZWlnaHQgfTtcbn0sIFwiZ2V0TWF4Q2hpbGRTaXplXCIpO1xuZnVuY3Rpb24gc2V0QmxvY2tTaXplcyhibG9jaywgZGIyLCBzaWJsaW5nV2lkdGggPSAwLCBzaWJsaW5nSGVpZ2h0ID0gMCkge1xuICBsb2cuZGVidWcoXG4gICAgXCJzZXRCbG9ja1NpemVzIGFiYzk1IChzdGFydClcIixcbiAgICBibG9jay5pZCxcbiAgICBibG9jaz8uc2l6ZT8ueCxcbiAgICBcImJsb2NrIHdpZHRoID1cIixcbiAgICBibG9jaz8uc2l6ZSxcbiAgICBcInNpYmxpbmdXaWR0aFwiLFxuICAgIHNpYmxpbmdXaWR0aFxuICApO1xuICBpZiAoIWJsb2NrPy5zaXplPy53aWR0aCkge1xuICAgIGJsb2NrLnNpemUgPSB7XG4gICAgICB3aWR0aDogc2libGluZ1dpZHRoLFxuICAgICAgaGVpZ2h0OiBzaWJsaW5nSGVpZ2h0LFxuICAgICAgeDogMCxcbiAgICAgIHk6IDBcbiAgICB9O1xuICB9XG4gIGxldCBtYXhXaWR0aCA9IDA7XG4gIGxldCBtYXhIZWlnaHQgPSAwO1xuICBpZiAoYmxvY2suY2hpbGRyZW4/Lmxlbmd0aCA+IDApIHtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGJsb2NrLmNoaWxkcmVuKSB7XG4gICAgICBzZXRCbG9ja1NpemVzKGNoaWxkLCBkYjIpO1xuICAgIH1cbiAgICBjb25zdCBjaGlsZFNpemUgPSBnZXRNYXhDaGlsZFNpemUoYmxvY2spO1xuICAgIG1heFdpZHRoID0gY2hpbGRTaXplLndpZHRoO1xuICAgIG1heEhlaWdodCA9IGNoaWxkU2l6ZS5oZWlnaHQ7XG4gICAgbG9nLmRlYnVnKFwic2V0QmxvY2tTaXplcyBhYmM5NSBtYXhXaWR0aCBvZlwiLCBibG9jay5pZCwgXCI6cyBjaGlsZHJlbiBpcyBcIiwgbWF4V2lkdGgsIG1heEhlaWdodCk7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBibG9jay5jaGlsZHJlbikge1xuICAgICAgaWYgKGNoaWxkLnNpemUpIHtcbiAgICAgICAgbG9nLmRlYnVnKFxuICAgICAgICAgIGBhYmM5NSBTZXR0aW5nIHNpemUgb2YgY2hpbGRyZW4gb2YgJHtibG9jay5pZH0gaWQ9JHtjaGlsZC5pZH0gJHttYXhXaWR0aH0gJHttYXhIZWlnaHR9ICR7SlNPTi5zdHJpbmdpZnkoY2hpbGQuc2l6ZSl9YFxuICAgICAgICApO1xuICAgICAgICBjaGlsZC5zaXplLndpZHRoID0gbWF4V2lkdGggKiAoY2hpbGQud2lkdGhJbkNvbHVtbnMgPz8gMSkgKyBwYWRkaW5nICogKChjaGlsZC53aWR0aEluQ29sdW1ucyA/PyAxKSAtIDEpO1xuICAgICAgICBjaGlsZC5zaXplLmhlaWdodCA9IG1heEhlaWdodDtcbiAgICAgICAgY2hpbGQuc2l6ZS54ID0gMDtcbiAgICAgICAgY2hpbGQuc2l6ZS55ID0gMDtcbiAgICAgICAgbG9nLmRlYnVnKFxuICAgICAgICAgIGBhYmM5NSB1cGRhdGluZyBzaXplIG9mICR7YmxvY2suaWR9IGNoaWxkcmVuIGNoaWxkOiR7Y2hpbGQuaWR9IG1heFdpZHRoOiR7bWF4V2lkdGh9IG1heEhlaWdodDoke21heEhlaWdodH1gXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgYmxvY2suY2hpbGRyZW4pIHtcbiAgICAgIHNldEJsb2NrU2l6ZXMoY2hpbGQsIGRiMiwgbWF4V2lkdGgsIG1heEhlaWdodCk7XG4gICAgfVxuICAgIGNvbnN0IGNvbHVtbnMgPSBibG9jay5jb2x1bW5zID8/IC0xO1xuICAgIGxldCBudW1JdGVtcyA9IDA7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBibG9jay5jaGlsZHJlbikge1xuICAgICAgbnVtSXRlbXMgKz0gY2hpbGQud2lkdGhJbkNvbHVtbnMgPz8gMTtcbiAgICB9XG4gICAgbGV0IHhTaXplID0gYmxvY2suY2hpbGRyZW4ubGVuZ3RoO1xuICAgIGlmIChjb2x1bW5zID4gMCAmJiBjb2x1bW5zIDwgbnVtSXRlbXMpIHtcbiAgICAgIHhTaXplID0gY29sdW1ucztcbiAgICB9XG4gICAgY29uc3QgeVNpemUgPSBNYXRoLmNlaWwobnVtSXRlbXMgLyB4U2l6ZSk7XG4gICAgbGV0IHdpZHRoID0geFNpemUgKiAobWF4V2lkdGggKyBwYWRkaW5nKSArIHBhZGRpbmc7XG4gICAgbGV0IGhlaWdodCA9IHlTaXplICogKG1heEhlaWdodCArIHBhZGRpbmcpICsgcGFkZGluZztcbiAgICBpZiAod2lkdGggPCBzaWJsaW5nV2lkdGgpIHtcbiAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgYERldGVjdGVkIHRvIHNtYWxsIHNpYmxpbmc6IGFiYzk1ICR7YmxvY2suaWR9IHNpYmxpbmdXaWR0aCAke3NpYmxpbmdXaWR0aH0gc2libGluZ0hlaWdodCAke3NpYmxpbmdIZWlnaHR9IHdpZHRoICR7d2lkdGh9YFxuICAgICAgKTtcbiAgICAgIHdpZHRoID0gc2libGluZ1dpZHRoO1xuICAgICAgaGVpZ2h0ID0gc2libGluZ0hlaWdodDtcbiAgICAgIGNvbnN0IGNoaWxkV2lkdGggPSAoc2libGluZ1dpZHRoIC0geFNpemUgKiBwYWRkaW5nIC0gcGFkZGluZykgLyB4U2l6ZTtcbiAgICAgIGNvbnN0IGNoaWxkSGVpZ2h0ID0gKHNpYmxpbmdIZWlnaHQgLSB5U2l6ZSAqIHBhZGRpbmcgLSBwYWRkaW5nKSAvIHlTaXplO1xuICAgICAgbG9nLmRlYnVnKFwiU2l6ZSBpbmRhdGEgYWJjODhcIiwgYmxvY2suaWQsIFwiY2hpbGRXaWR0aFwiLCBjaGlsZFdpZHRoLCBcIm1heFdpZHRoXCIsIG1heFdpZHRoKTtcbiAgICAgIGxvZy5kZWJ1ZyhcIlNpemUgaW5kYXRhIGFiYzg4XCIsIGJsb2NrLmlkLCBcImNoaWxkSGVpZ2h0XCIsIGNoaWxkSGVpZ2h0LCBcIm1heEhlaWdodFwiLCBtYXhIZWlnaHQpO1xuICAgICAgbG9nLmRlYnVnKFwiU2l6ZSBpbmRhdGEgYWJjODggeFNpemVcIiwgeFNpemUsIFwicGFkZGluZ1wiLCBwYWRkaW5nKTtcbiAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgYmxvY2suY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKGNoaWxkLnNpemUpIHtcbiAgICAgICAgICBjaGlsZC5zaXplLndpZHRoID0gY2hpbGRXaWR0aDtcbiAgICAgICAgICBjaGlsZC5zaXplLmhlaWdodCA9IGNoaWxkSGVpZ2h0O1xuICAgICAgICAgIGNoaWxkLnNpemUueCA9IDA7XG4gICAgICAgICAgY2hpbGQuc2l6ZS55ID0gMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBsb2cuZGVidWcoXG4gICAgICBgYWJjOTUgKGZpbmFsZSBjYWxjKSAke2Jsb2NrLmlkfSB4U2l6ZSAke3hTaXplfSB5U2l6ZSAke3lTaXplfSBjb2x1bW5zICR7Y29sdW1uc30ke2Jsb2NrLmNoaWxkcmVuLmxlbmd0aH0gd2lkdGg9JHtNYXRoLm1heCh3aWR0aCwgYmxvY2suc2l6ZT8ud2lkdGggfHwgMCl9YFxuICAgICk7XG4gICAgaWYgKHdpZHRoIDwgKGJsb2NrPy5zaXplPy53aWR0aCB8fCAwKSkge1xuICAgICAgd2lkdGggPSBibG9jaz8uc2l6ZT8ud2lkdGggfHwgMDtcbiAgICAgIGNvbnN0IG51bSA9IGNvbHVtbnMgPiAwID8gTWF0aC5taW4oYmxvY2suY2hpbGRyZW4ubGVuZ3RoLCBjb2x1bW5zKSA6IGJsb2NrLmNoaWxkcmVuLmxlbmd0aDtcbiAgICAgIGlmIChudW0gPiAwKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkV2lkdGggPSAod2lkdGggLSBudW0gKiBwYWRkaW5nIC0gcGFkZGluZykgLyBudW07XG4gICAgICAgIGxvZy5kZWJ1ZyhcImFiYzk1IChncm93aW5nIHRvIGZpdCkgd2lkdGhcIiwgYmxvY2suaWQsIHdpZHRoLCBibG9jay5zaXplPy53aWR0aCwgY2hpbGRXaWR0aCk7XG4gICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgYmxvY2suY2hpbGRyZW4pIHtcbiAgICAgICAgICBpZiAoY2hpbGQuc2l6ZSkge1xuICAgICAgICAgICAgY2hpbGQuc2l6ZS53aWR0aCA9IGNoaWxkV2lkdGg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGJsb2NrLnNpemUgPSB7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwXG4gICAgfTtcbiAgfVxuICBsb2cuZGVidWcoXG4gICAgXCJzZXRCbG9ja1NpemVzIGFiYzk0IChkb25lKVwiLFxuICAgIGJsb2NrLmlkLFxuICAgIGJsb2NrPy5zaXplPy54LFxuICAgIGJsb2NrPy5zaXplPy53aWR0aCxcbiAgICBibG9jaz8uc2l6ZT8ueSxcbiAgICBibG9jaz8uc2l6ZT8uaGVpZ2h0XG4gICk7XG59XG5fX25hbWUoc2V0QmxvY2tTaXplcywgXCJzZXRCbG9ja1NpemVzXCIpO1xuZnVuY3Rpb24gbGF5b3V0QmxvY2tzKGJsb2NrLCBkYjIpIHtcbiAgbG9nLmRlYnVnKFxuICAgIGBhYmM4NSBsYXlvdXQgYmxvY2tzICg9PmxheW91dEJsb2NrcykgJHtibG9jay5pZH0geDogJHtibG9jaz8uc2l6ZT8ueH0geTogJHtibG9jaz8uc2l6ZT8ueX0gd2lkdGg6ICR7YmxvY2s/LnNpemU/LndpZHRofWBcbiAgKTtcbiAgY29uc3QgY29sdW1ucyA9IGJsb2NrLmNvbHVtbnMgPz8gLTE7XG4gIGxvZy5kZWJ1ZyhcImxheW91dEJsb2NrcyBjb2x1bW5zIGFiYzk1XCIsIGJsb2NrLmlkLCBcIj0+XCIsIGNvbHVtbnMsIGJsb2NrKTtcbiAgaWYgKGJsb2NrLmNoaWxkcmVuICYmIC8vIGZpbmQgbWF4IHdpZHRoIG9mIGNoaWxkcmVuXG4gIGJsb2NrLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICBjb25zdCB3aWR0aCA9IGJsb2NrPy5jaGlsZHJlblswXT8uc2l6ZT8ud2lkdGggPz8gMDtcbiAgICBjb25zdCB3aWR0aE9mQ2hpbGRyZW4gPSBibG9jay5jaGlsZHJlbi5sZW5ndGggKiB3aWR0aCArIChibG9jay5jaGlsZHJlbi5sZW5ndGggLSAxKSAqIHBhZGRpbmc7XG4gICAgbG9nLmRlYnVnKFwid2lkdGhPZkNoaWxkcmVuIDg4XCIsIHdpZHRoT2ZDaGlsZHJlbiwgXCJwb3NYXCIpO1xuICAgIGNvbnN0IHJvd0hlaWdodHMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpO1xuICAgIHtcbiAgICAgIGxldCBjb2xQb3MgPSAwO1xuICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBibG9jay5jaGlsZHJlbikge1xuICAgICAgICBpZiAoIWNoaWxkLnNpemUpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IHB5IH0gPSBjYWxjdWxhdGVCbG9ja1Bvc2l0aW9uKGNvbHVtbnMsIGNvbFBvcyk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRNYXggPSByb3dIZWlnaHRzLmdldChweSkgPz8gMDtcbiAgICAgICAgaWYgKGNoaWxkLnNpemUuaGVpZ2h0ID4gY3VycmVudE1heCkge1xuICAgICAgICAgIHJvd0hlaWdodHMuc2V0KHB5LCBjaGlsZC5zaXplLmhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGZpbGxlZCA9IGNoaWxkPy53aWR0aEluQ29sdW1ucyA/PyAxO1xuICAgICAgICBpZiAoY29sdW1ucyA+IDApIHtcbiAgICAgICAgICBmaWxsZWQgPSBNYXRoLm1pbihmaWxsZWQsIGNvbHVtbnMgLSBjb2xQb3MgJSBjb2x1bW5zKTtcbiAgICAgICAgfVxuICAgICAgICBjb2xQb3MgKz0gZmlsbGVkO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByb3dZT2Zmc2V0cyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gICAge1xuICAgICAgbGV0IG9mZnNldCA9IDA7XG4gICAgICBjb25zdCByb3dzID0gWy4uLnJvd0hlaWdodHMua2V5cygpXS5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gICAgICBmb3IgKGNvbnN0IHJvdyBvZiByb3dzKSB7XG4gICAgICAgIHJvd1lPZmZzZXRzLnNldChyb3csIG9mZnNldCk7XG4gICAgICAgIG9mZnNldCArPSAocm93SGVpZ2h0cy5nZXQocm93KSA/PyAwKSArIHBhZGRpbmc7XG4gICAgICB9XG4gICAgfVxuICAgIGxldCBjb2x1bW5Qb3MgPSAwO1xuICAgIGxvZy5kZWJ1ZyhcImFiYzkxIGJsb2NrPy5zaXplPy54XCIsIGJsb2NrLmlkLCBibG9jaz8uc2l6ZT8ueCk7XG4gICAgbGV0IHN0YXJ0aW5nUG9zWCA9IGJsb2NrPy5zaXplPy54ID8gYmxvY2s/LnNpemU/LnggKyAoLWJsb2NrPy5zaXplPy53aWR0aCAvIDIgfHwgMCkgOiAtcGFkZGluZztcbiAgICBsZXQgcm93UG9zID0gMDtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGJsb2NrLmNoaWxkcmVuKSB7XG4gICAgICBjb25zdCBwYXJlbnQgPSBibG9jaztcbiAgICAgIGlmICghY2hpbGQuc2l6ZSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHsgd2lkdGg6IHdpZHRoMiwgaGVpZ2h0IH0gPSBjaGlsZC5zaXplO1xuICAgICAgY29uc3QgeyBweCwgcHkgfSA9IGNhbGN1bGF0ZUJsb2NrUG9zaXRpb24oY29sdW1ucywgY29sdW1uUG9zKTtcbiAgICAgIGlmIChweSAhPSByb3dQb3MpIHtcbiAgICAgICAgcm93UG9zID0gcHk7XG4gICAgICAgIHN0YXJ0aW5nUG9zWCA9IGJsb2NrPy5zaXplPy54ID8gYmxvY2s/LnNpemU/LnggKyAoLWJsb2NrPy5zaXplPy53aWR0aCAvIDIgfHwgMCkgOiAtcGFkZGluZztcbiAgICAgICAgbG9nLmRlYnVnKFwiTmV3IHJvdyBpbiBsYXlvdXQgZm9yIGJsb2NrXCIsIGJsb2NrLmlkLCBcIiBhbmQgY2hpbGQgXCIsIGNoaWxkLmlkLCByb3dQb3MpO1xuICAgICAgfVxuICAgICAgbG9nLmRlYnVnKFxuICAgICAgICBgYWJjODkgbGF5b3V0IGJsb2NrcyAoY2hpbGQpIGlkOiAke2NoaWxkLmlkfSBQb3M6ICR7Y29sdW1uUG9zfSAocHgsIHB5KSAke3B4fSwke3B5fSAoJHtwYXJlbnQ/LnNpemU/Lnh9LCR7cGFyZW50Py5zaXplPy55fSkgcGFyZW50OiAke3BhcmVudC5pZH0gd2lkdGg6ICR7d2lkdGgyfSR7cGFkZGluZ31gXG4gICAgICApO1xuICAgICAgaWYgKHBhcmVudC5zaXplKSB7XG4gICAgICAgIGNvbnN0IGhhbGZXaWR0aCA9IHdpZHRoMiAvIDI7XG4gICAgICAgIGNoaWxkLnNpemUueCA9IHN0YXJ0aW5nUG9zWCArIHBhZGRpbmcgKyBoYWxmV2lkdGg7XG4gICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICBgYWJjOTEgbGF5b3V0IGJsb2NrcyAoY2FsYykgcHgsIHB5aWQ6JHtjaGlsZC5pZH0gc3RhcnRpbmdQb3M9WCR7c3RhcnRpbmdQb3NYfSBuZXcgc3RhcnRpbmdQb3NYJHtjaGlsZC5zaXplLnh9ICR7aGFsZldpZHRofSBwYWRkaW5nPSR7cGFkZGluZ30gd2lkdGg9JHt3aWR0aDJ9IGhhbGZXaWR0aD0ke2hhbGZXaWR0aH0gPT4geDoke2NoaWxkLnNpemUueH0geToke2NoaWxkLnNpemUueX0gJHtjaGlsZC53aWR0aEluQ29sdW1uc30gKHdpZHRoICogKGNoaWxkPy53IHx8IDEpKSAvIDIgJHt3aWR0aDIgKiAoY2hpbGQ/LndpZHRoSW5Db2x1bW5zID8/IDEpIC8gMn1gXG4gICAgICAgICk7XG4gICAgICAgIHN0YXJ0aW5nUG9zWCA9IGNoaWxkLnNpemUueCArIGhhbGZXaWR0aDtcbiAgICAgICAgY29uc3Qgcm93WU9mZnNldCA9IHJvd1lPZmZzZXRzLmdldChweSkgPz8gMDtcbiAgICAgICAgY29uc3Qgcm93SGVpZ2h0ID0gcm93SGVpZ2h0cy5nZXQocHkpID8/IGhlaWdodDtcbiAgICAgICAgY2hpbGQuc2l6ZS55ID0gcGFyZW50LnNpemUueSAtIHBhcmVudC5zaXplLmhlaWdodCAvIDIgKyByb3dZT2Zmc2V0ICsgcm93SGVpZ2h0IC8gMiArIHBhZGRpbmc7XG4gICAgICAgIGxvZy5kZWJ1ZyhcbiAgICAgICAgICBgYWJjODggbGF5b3V0IGJsb2NrcyAoY2FsYykgcHgsIHB5aWQ6JHtjaGlsZC5pZH1zdGFydGluZ1Bvc1gke3N0YXJ0aW5nUG9zWH0ke3BhZGRpbmd9JHtoYWxmV2lkdGh9PT54OiR7Y2hpbGQuc2l6ZS54fXk6JHtjaGlsZC5zaXplLnl9JHtjaGlsZC53aWR0aEluQ29sdW1uc30od2lkdGggKiAoY2hpbGQ/LncgfHwgMSkpIC8gMiR7d2lkdGgyICogKGNoaWxkPy53aWR0aEluQ29sdW1ucyA/PyAxKSAvIDJ9YFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgaWYgKGNoaWxkLmNoaWxkcmVuKSB7XG4gICAgICAgIGxheW91dEJsb2NrcyhjaGlsZCwgZGIyKTtcbiAgICAgIH1cbiAgICAgIGxldCBjb2x1bW5zRmlsbGVkID0gY2hpbGQ/LndpZHRoSW5Db2x1bW5zID8/IDE7XG4gICAgICBpZiAoY29sdW1ucyA+IDApIHtcbiAgICAgICAgY29sdW1uc0ZpbGxlZCA9IE1hdGgubWluKGNvbHVtbnNGaWxsZWQsIGNvbHVtbnMgLSBjb2x1bW5Qb3MgJSBjb2x1bW5zKTtcbiAgICAgIH1cbiAgICAgIGNvbHVtblBvcyArPSBjb2x1bW5zRmlsbGVkO1xuICAgICAgbG9nLmRlYnVnKFwiYWJjODggY29sdW1uc1Bvc1wiLCBjaGlsZCwgY29sdW1uUG9zKTtcbiAgICB9XG4gIH1cbiAgbG9nLmRlYnVnKFxuICAgIGBsYXlvdXQgYmxvY2tzICg8PT1sYXlvdXRCbG9ja3MpICR7YmxvY2suaWR9IHg6ICR7YmxvY2s/LnNpemU/Lnh9IHk6ICR7YmxvY2s/LnNpemU/Lnl9IHdpZHRoOiAke2Jsb2NrPy5zaXplPy53aWR0aH1gXG4gICk7XG59XG5fX25hbWUobGF5b3V0QmxvY2tzLCBcImxheW91dEJsb2Nrc1wiKTtcbmZ1bmN0aW9uIGZpbmRCb3VuZHMoYmxvY2ssIHsgbWluWCwgbWluWSwgbWF4WCwgbWF4WSB9ID0geyBtaW5YOiAwLCBtaW5ZOiAwLCBtYXhYOiAwLCBtYXhZOiAwIH0pIHtcbiAgaWYgKGJsb2NrLnNpemUgJiYgYmxvY2suaWQgIT09IFwicm9vdFwiKSB7XG4gICAgY29uc3QgeyB4LCB5LCB3aWR0aCwgaGVpZ2h0IH0gPSBibG9jay5zaXplO1xuICAgIGlmICh4IC0gd2lkdGggLyAyIDwgbWluWCkge1xuICAgICAgbWluWCA9IHggLSB3aWR0aCAvIDI7XG4gICAgfVxuICAgIGlmICh5IC0gaGVpZ2h0IC8gMiA8IG1pblkpIHtcbiAgICAgIG1pblkgPSB5IC0gaGVpZ2h0IC8gMjtcbiAgICB9XG4gICAgaWYgKHggKyB3aWR0aCAvIDIgPiBtYXhYKSB7XG4gICAgICBtYXhYID0geCArIHdpZHRoIC8gMjtcbiAgICB9XG4gICAgaWYgKHkgKyBoZWlnaHQgLyAyID4gbWF4WSkge1xuICAgICAgbWF4WSA9IHkgKyBoZWlnaHQgLyAyO1xuICAgIH1cbiAgfVxuICBpZiAoYmxvY2suY2hpbGRyZW4pIHtcbiAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGJsb2NrLmNoaWxkcmVuKSB7XG4gICAgICAoeyBtaW5YLCBtaW5ZLCBtYXhYLCBtYXhZIH0gPSBmaW5kQm91bmRzKGNoaWxkLCB7IG1pblgsIG1pblksIG1heFgsIG1heFkgfSkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4geyBtaW5YLCBtaW5ZLCBtYXhYLCBtYXhZIH07XG59XG5fX25hbWUoZmluZEJvdW5kcywgXCJmaW5kQm91bmRzXCIpO1xuZnVuY3Rpb24gbGF5b3V0KGRiMikge1xuICBjb25zdCByb290ID0gZGIyLmdldEJsb2NrKFwicm9vdFwiKTtcbiAgaWYgKCFyb290KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHNldEJsb2NrU2l6ZXMocm9vdCwgZGIyLCAwLCAwKTtcbiAgbGF5b3V0QmxvY2tzKHJvb3QsIGRiMik7XG4gIGxvZy5kZWJ1ZyhcImdldEJsb2Nrc1wiLCBKU09OLnN0cmluZ2lmeShyb290LCBudWxsLCAyKSk7XG4gIGNvbnN0IHsgbWluWCwgbWluWSwgbWF4WCwgbWF4WSB9ID0gZmluZEJvdW5kcyhyb290KTtcbiAgY29uc3QgaGVpZ2h0ID0gbWF4WSAtIG1pblk7XG4gIGNvbnN0IHdpZHRoID0gbWF4WCAtIG1pblg7XG4gIHJldHVybiB7IHg6IG1pblgsIHk6IG1pblksIHdpZHRoLCBoZWlnaHQgfTtcbn1cbl9fbmFtZShsYXlvdXQsIFwibGF5b3V0XCIpO1xuXG4vLyBzcmMvZGlhZ3JhbXMvYmxvY2svcmVuZGVySGVscGVycy50c1xuaW1wb3J0ICogYXMgZ3JhcGhsaWIgZnJvbSBcImRhZ3JlLWQzLWVzL3NyYy9ncmFwaGxpYi9pbmRleC5qc1wiO1xuXG4vLyBzcmMvZGFncmUtd3JhcHBlci9jcmVhdGVMYWJlbC5qc1xudmFyIGNyZWF0ZUxhYmVsID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAoZWxlbWVudCwgX3ZlcnRleFRleHQsIHN0eWxlLCBpc1RpdGxlID0gZmFsc2UsIGlzTm9kZSA9IGZhbHNlKSA9PiB7XG4gIGxldCB2ZXJ0ZXhUZXh0ID0gX3ZlcnRleFRleHQgfHwgXCJcIjtcbiAgaWYgKHR5cGVvZiB2ZXJ0ZXhUZXh0ID09PSBcIm9iamVjdFwiKSB7XG4gICAgdmVydGV4VGV4dCA9IHZlcnRleFRleHRbMF07XG4gIH1cbiAgY29uc3QgY29uZmlnMiA9IGdldENvbmZpZzIoKTtcbiAgY29uc3QgdXNlSHRtbExhYmVscyA9IGdldEVmZmVjdGl2ZUh0bWxMYWJlbHMoY29uZmlnMik7XG4gIHJldHVybiBhd2FpdCBjcmVhdGVUZXh0KFxuICAgIGVsZW1lbnQsXG4gICAgdmVydGV4VGV4dCxcbiAgICB7XG4gICAgICBzdHlsZSxcbiAgICAgIGlzVGl0bGUsXG4gICAgICB1c2VIdG1sTGFiZWxzLFxuICAgICAgbWFya2Rvd246IGZhbHNlLFxuICAgICAgaXNOb2RlLFxuICAgICAgd2lkdGg6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWVxuICAgIH0sXG4gICAgY29uZmlnMlxuICApO1xufSwgXCJjcmVhdGVMYWJlbFwiKTtcbnZhciBjcmVhdGVMYWJlbF9kZWZhdWx0ID0gY3JlYXRlTGFiZWw7XG5cbi8vIHNyYy9kYWdyZS13cmFwcGVyL2VkZ2VzLmpzXG5pbXBvcnQgeyBsaW5lLCBjdXJ2ZUJhc2lzLCBzZWxlY3QgfSBmcm9tIFwiZDNcIjtcblxuLy8gc3JjL2RhZ3JlLXdyYXBwZXIvZWRnZU1hcmtlci50c1xudmFyIGFkZEVkZ2VNYXJrZXJzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoc3ZnUGF0aCwgZWRnZSwgdXJsLCBpZCwgZGlhZ3JhbVR5cGUpID0+IHtcbiAgaWYgKGVkZ2UuYXJyb3dUeXBlU3RhcnQpIHtcbiAgICBhZGRFZGdlTWFya2VyKHN2Z1BhdGgsIFwic3RhcnRcIiwgZWRnZS5hcnJvd1R5cGVTdGFydCwgdXJsLCBpZCwgZGlhZ3JhbVR5cGUpO1xuICB9XG4gIGlmIChlZGdlLmFycm93VHlwZUVuZCkge1xuICAgIGFkZEVkZ2VNYXJrZXIoc3ZnUGF0aCwgXCJlbmRcIiwgZWRnZS5hcnJvd1R5cGVFbmQsIHVybCwgaWQsIGRpYWdyYW1UeXBlKTtcbiAgfVxufSwgXCJhZGRFZGdlTWFya2Vyc1wiKTtcbnZhciBhcnJvd1R5cGVzTWFwID0ge1xuICBhcnJvd19jcm9zczogXCJjcm9zc1wiLFxuICBhcnJvd19wb2ludDogXCJwb2ludFwiLFxuICBhcnJvd19iYXJiOiBcImJhcmJcIixcbiAgYXJyb3dfY2lyY2xlOiBcImNpcmNsZVwiLFxuICBhZ2dyZWdhdGlvbjogXCJhZ2dyZWdhdGlvblwiLFxuICBleHRlbnNpb246IFwiZXh0ZW5zaW9uXCIsXG4gIGNvbXBvc2l0aW9uOiBcImNvbXBvc2l0aW9uXCIsXG4gIGRlcGVuZGVuY3k6IFwiZGVwZW5kZW5jeVwiLFxuICBsb2xsaXBvcDogXCJsb2xsaXBvcFwiXG59O1xudmFyIGFkZEVkZ2VNYXJrZXIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChzdmdQYXRoLCBwb3NpdGlvbiwgYXJyb3dUeXBlLCB1cmwsIGlkLCBkaWFncmFtVHlwZSkgPT4ge1xuICBjb25zdCBlbmRNYXJrZXJUeXBlID0gYXJyb3dUeXBlc01hcFthcnJvd1R5cGVdO1xuICBpZiAoIWVuZE1hcmtlclR5cGUpIHtcbiAgICBsb2cud2FybihgVW5rbm93biBhcnJvdyB0eXBlOiAke2Fycm93VHlwZX1gKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3Qgc3VmZml4ID0gcG9zaXRpb24gPT09IFwic3RhcnRcIiA/IFwiU3RhcnRcIiA6IFwiRW5kXCI7XG4gIHN2Z1BhdGguYXR0cihgbWFya2VyLSR7cG9zaXRpb259YCwgYHVybCgke3VybH0jJHtpZH1fJHtkaWFncmFtVHlwZX0tJHtlbmRNYXJrZXJUeXBlfSR7c3VmZml4fSlgKTtcbn0sIFwiYWRkRWRnZU1hcmtlclwiKTtcblxuLy8gc3JjL2RhZ3JlLXdyYXBwZXIvZWRnZXMuanNcbnZhciBlZGdlTGFiZWxzID0ge307XG52YXIgdGVybWluYWxMYWJlbHMgPSB7fTtcbnZhciBpbnNlcnRFZGdlTGFiZWwgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGFzeW5jIChlbGVtLCBlZGdlKSA9PiB7XG4gIGNvbnN0IGNvbmZpZzIgPSBnZXRDb25maWcyKCk7XG4gIGNvbnN0IHVzZUh0bWxMYWJlbHMgPSBnZXRFZmZlY3RpdmVIdG1sTGFiZWxzKGNvbmZpZzIpO1xuICBjb25zdCBlZGdlTGFiZWwgPSBlbGVtLmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIFwiZWRnZUxhYmVsXCIpO1xuICBjb25zdCBsYWJlbCA9IGVkZ2VMYWJlbC5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImxhYmVsXCIpO1xuICBjb25zdCBpc01hcmtkb3duID0gZWRnZS5sYWJlbFR5cGUgPT09IFwibWFya2Rvd25cIjtcbiAgY29uc3QgbGFiZWxFbGVtZW50ID0gYXdhaXQgY3JlYXRlVGV4dChcbiAgICBlbGVtLFxuICAgIGVkZ2UubGFiZWwsXG4gICAge1xuICAgICAgc3R5bGU6IGVkZ2UubGFiZWxTdHlsZSxcbiAgICAgIHVzZUh0bWxMYWJlbHMsXG4gICAgICAvLyBUT0RPOiBUaGUgb2xkIGNvZGUgb25seSBzZXQgYWRkU3ZnQmFja2dyb3VuZCB3aGVuIHVzaW5nIG1hcmtkb3duLCBidXRcbiAgICAgIC8vIHRoaXMgZnVuY3Rpb24gaXMgb25seSB1c2VkIGJ5IGJsb2NrIGRpYWdyYW1zIHdoaWNoIG5ldmVyIHVzZSBtYXJrZG93bi5cbiAgICAgIGFkZFN2Z0JhY2tncm91bmQ6IGlzTWFya2Rvd24sXG4gICAgICBpc05vZGU6IGZhbHNlLFxuICAgICAgbWFya2Rvd246IGlzTWFya2Rvd24sXG4gICAgICAvLyBJZiB1c2luZyBtYXJrZG93biwgd3JhcCB1c2luZyBkZWZhdWx0IHdpZHRoXG4gICAgICB3aWR0aDogaXNNYXJrZG93biA/IHZvaWQgMCA6IE51bWJlci5QT1NJVElWRV9JTkZJTklUWVxuICAgIH0sXG4gICAgY29uZmlnMlxuICApO1xuICBsYWJlbC5ub2RlKCkuYXBwZW5kQ2hpbGQobGFiZWxFbGVtZW50KTtcbiAgbGV0IGJib3ggPSBsYWJlbEVsZW1lbnQuZ2V0QkJveCgpO1xuICBsZXQgdHJhbnNmb3JtQmJveCA9IGJib3g7XG4gIGlmICh1c2VIdG1sTGFiZWxzKSB7XG4gICAgY29uc3QgZGl2ID0gbGFiZWxFbGVtZW50LmNoaWxkcmVuWzBdO1xuICAgIGNvbnN0IGR2ID0gc2VsZWN0KGxhYmVsRWxlbWVudCk7XG4gICAgYmJveCA9IGRpdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB0cmFuc2Zvcm1CYm94ID0gYmJveDtcbiAgICBkdi5hdHRyKFwid2lkdGhcIiwgYmJveC53aWR0aCk7XG4gICAgZHYuYXR0cihcImhlaWdodFwiLCBiYm94LmhlaWdodCk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgdGV4dEVsID0gc2VsZWN0KGxhYmVsRWxlbWVudCkuc2VsZWN0KFwidGV4dFwiKS5ub2RlKCk7XG4gICAgaWYgKHRleHRFbCAmJiB0eXBlb2YgdGV4dEVsLmdldEJCb3ggPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdHJhbnNmb3JtQmJveCA9IHRleHRFbC5nZXRCQm94KCk7XG4gICAgfVxuICB9XG4gIGxhYmVsLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgY29tcHV0ZUxhYmVsVHJhbnNmb3JtKHRyYW5zZm9ybUJib3gsIHVzZUh0bWxMYWJlbHMpKTtcbiAgZWRnZUxhYmVsc1tlZGdlLmlkXSA9IGVkZ2VMYWJlbDtcbiAgZWRnZS53aWR0aCA9IGJib3gud2lkdGg7XG4gIGVkZ2UuaGVpZ2h0ID0gYmJveC5oZWlnaHQ7XG4gIGxldCBmbztcbiAgaWYgKGVkZ2Uuc3RhcnRMYWJlbExlZnQpIHtcbiAgICBjb25zdCBzdGFydEVkZ2VMYWJlbExlZnQgPSBlbGVtLmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIFwiZWRnZVRlcm1pbmFsc1wiKTtcbiAgICBjb25zdCBpbm5lciA9IHN0YXJ0RWRnZUxhYmVsTGVmdC5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImlubmVyXCIpO1xuICAgIGNvbnN0IHN0YXJ0TGFiZWxFbGVtZW50ID0gYXdhaXQgY3JlYXRlTGFiZWxfZGVmYXVsdChpbm5lciwgZWRnZS5zdGFydExhYmVsTGVmdCwgZWRnZS5sYWJlbFN0eWxlKTtcbiAgICBmbyA9IHN0YXJ0TGFiZWxFbGVtZW50O1xuICAgIGxldCBzbEJveCA9IHN0YXJ0TGFiZWxFbGVtZW50LmdldEJCb3goKTtcbiAgICBpZiAodXNlSHRtbExhYmVscykge1xuICAgICAgY29uc3QgZGl2ID0gc3RhcnRMYWJlbEVsZW1lbnQuY2hpbGRyZW5bMF07XG4gICAgICBjb25zdCBkdiA9IHNlbGVjdChzdGFydExhYmVsRWxlbWVudCk7XG4gICAgICBzbEJveCA9IGRpdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGR2LmF0dHIoXCJ3aWR0aFwiLCBzbEJveC53aWR0aCk7XG4gICAgICBkdi5hdHRyKFwiaGVpZ2h0XCIsIHNsQm94LmhlaWdodCk7XG4gICAgfVxuICAgIGlubmVyLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgY29tcHV0ZUxhYmVsVHJhbnNmb3JtKHNsQm94LCB1c2VIdG1sTGFiZWxzKSk7XG4gICAgaWYgKCF0ZXJtaW5hbExhYmVsc1tlZGdlLmlkXSkge1xuICAgICAgdGVybWluYWxMYWJlbHNbZWRnZS5pZF0gPSB7fTtcbiAgICB9XG4gICAgdGVybWluYWxMYWJlbHNbZWRnZS5pZF0uc3RhcnRMZWZ0ID0gc3RhcnRFZGdlTGFiZWxMZWZ0O1xuICAgIHNldFRlcm1pbmFsV2lkdGgoZm8sIGVkZ2Uuc3RhcnRMYWJlbExlZnQpO1xuICB9XG4gIGlmIChlZGdlLnN0YXJ0TGFiZWxSaWdodCkge1xuICAgIGNvbnN0IHN0YXJ0RWRnZUxhYmVsUmlnaHQgPSBlbGVtLmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIFwiZWRnZVRlcm1pbmFsc1wiKTtcbiAgICBjb25zdCBpbm5lciA9IHN0YXJ0RWRnZUxhYmVsUmlnaHQuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJpbm5lclwiKTtcbiAgICBjb25zdCBzdGFydExhYmVsRWxlbWVudCA9IGF3YWl0IGNyZWF0ZUxhYmVsX2RlZmF1bHQoaW5uZXIsIGVkZ2Uuc3RhcnRMYWJlbFJpZ2h0LCBlZGdlLmxhYmVsU3R5bGUpO1xuICAgIGZvID0gc3RhcnRMYWJlbEVsZW1lbnQ7XG4gICAgbGV0IHNsQm94ID0gc3RhcnRMYWJlbEVsZW1lbnQuZ2V0QkJveCgpO1xuICAgIGlmICh1c2VIdG1sTGFiZWxzKSB7XG4gICAgICBjb25zdCBkaXYgPSBzdGFydExhYmVsRWxlbWVudC5jaGlsZHJlblswXTtcbiAgICAgIGNvbnN0IGR2ID0gc2VsZWN0KHN0YXJ0TGFiZWxFbGVtZW50KTtcbiAgICAgIHNsQm94ID0gZGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgZHYuYXR0cihcIndpZHRoXCIsIHNsQm94LndpZHRoKTtcbiAgICAgIGR2LmF0dHIoXCJoZWlnaHRcIiwgc2xCb3guaGVpZ2h0KTtcbiAgICB9XG4gICAgaW5uZXIuYXR0cihcInRyYW5zZm9ybVwiLCBjb21wdXRlTGFiZWxUcmFuc2Zvcm0oc2xCb3gsIHVzZUh0bWxMYWJlbHMpKTtcbiAgICBpZiAoIXRlcm1pbmFsTGFiZWxzW2VkZ2UuaWRdKSB7XG4gICAgICB0ZXJtaW5hbExhYmVsc1tlZGdlLmlkXSA9IHt9O1xuICAgIH1cbiAgICB0ZXJtaW5hbExhYmVsc1tlZGdlLmlkXS5zdGFydFJpZ2h0ID0gc3RhcnRFZGdlTGFiZWxSaWdodDtcbiAgICBzZXRUZXJtaW5hbFdpZHRoKGZvLCBlZGdlLnN0YXJ0TGFiZWxSaWdodCk7XG4gIH1cbiAgaWYgKGVkZ2UuZW5kTGFiZWxMZWZ0KSB7XG4gICAgY29uc3QgZW5kRWRnZUxhYmVsTGVmdCA9IGVsZW0uaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJlZGdlVGVybWluYWxzXCIpO1xuICAgIGNvbnN0IGlubmVyID0gZW5kRWRnZUxhYmVsTGVmdC5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImlubmVyXCIpO1xuICAgIGNvbnN0IGVuZExhYmVsRWxlbWVudCA9IGF3YWl0IGNyZWF0ZUxhYmVsX2RlZmF1bHQoZW5kRWRnZUxhYmVsTGVmdCwgZWRnZS5lbmRMYWJlbExlZnQsIGVkZ2UubGFiZWxTdHlsZSk7XG4gICAgZm8gPSBlbmRMYWJlbEVsZW1lbnQ7XG4gICAgbGV0IHNsQm94ID0gZW5kTGFiZWxFbGVtZW50LmdldEJCb3goKTtcbiAgICBpZiAodXNlSHRtbExhYmVscykge1xuICAgICAgY29uc3QgZGl2ID0gZW5kTGFiZWxFbGVtZW50LmNoaWxkcmVuWzBdO1xuICAgICAgY29uc3QgZHYgPSBzZWxlY3QoZW5kTGFiZWxFbGVtZW50KTtcbiAgICAgIHNsQm94ID0gZGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgZHYuYXR0cihcIndpZHRoXCIsIHNsQm94LndpZHRoKTtcbiAgICAgIGR2LmF0dHIoXCJoZWlnaHRcIiwgc2xCb3guaGVpZ2h0KTtcbiAgICB9XG4gICAgaW5uZXIuYXR0cihcInRyYW5zZm9ybVwiLCBjb21wdXRlTGFiZWxUcmFuc2Zvcm0oc2xCb3gsIHVzZUh0bWxMYWJlbHMpKTtcbiAgICBpZiAoIXRlcm1pbmFsTGFiZWxzW2VkZ2UuaWRdKSB7XG4gICAgICB0ZXJtaW5hbExhYmVsc1tlZGdlLmlkXSA9IHt9O1xuICAgIH1cbiAgICB0ZXJtaW5hbExhYmVsc1tlZGdlLmlkXS5lbmRMZWZ0ID0gZW5kRWRnZUxhYmVsTGVmdDtcbiAgICBzZXRUZXJtaW5hbFdpZHRoKGZvLCBlZGdlLmVuZExhYmVsTGVmdCk7XG4gIH1cbiAgaWYgKGVkZ2UuZW5kTGFiZWxSaWdodCkge1xuICAgIGNvbnN0IGVuZEVkZ2VMYWJlbFJpZ2h0ID0gZWxlbS5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImVkZ2VUZXJtaW5hbHNcIik7XG4gICAgY29uc3QgaW5uZXIgPSBlbmRFZGdlTGFiZWxSaWdodC5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImlubmVyXCIpO1xuICAgIGNvbnN0IGVuZExhYmVsRWxlbWVudCA9IGF3YWl0IGNyZWF0ZUxhYmVsX2RlZmF1bHQoXG4gICAgICBlbmRFZGdlTGFiZWxSaWdodCxcbiAgICAgIGVkZ2UuZW5kTGFiZWxSaWdodCxcbiAgICAgIGVkZ2UubGFiZWxTdHlsZVxuICAgICk7XG4gICAgZm8gPSBlbmRMYWJlbEVsZW1lbnQ7XG4gICAgbGV0IHNsQm94ID0gZW5kTGFiZWxFbGVtZW50LmdldEJCb3goKTtcbiAgICBpZiAodXNlSHRtbExhYmVscykge1xuICAgICAgY29uc3QgZGl2ID0gZW5kTGFiZWxFbGVtZW50LmNoaWxkcmVuWzBdO1xuICAgICAgY29uc3QgZHYgPSBzZWxlY3QoZW5kTGFiZWxFbGVtZW50KTtcbiAgICAgIHNsQm94ID0gZGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgZHYuYXR0cihcIndpZHRoXCIsIHNsQm94LndpZHRoKTtcbiAgICAgIGR2LmF0dHIoXCJoZWlnaHRcIiwgc2xCb3guaGVpZ2h0KTtcbiAgICB9XG4gICAgaW5uZXIuYXR0cihcInRyYW5zZm9ybVwiLCBjb21wdXRlTGFiZWxUcmFuc2Zvcm0oc2xCb3gsIHVzZUh0bWxMYWJlbHMpKTtcbiAgICBpZiAoIXRlcm1pbmFsTGFiZWxzW2VkZ2UuaWRdKSB7XG4gICAgICB0ZXJtaW5hbExhYmVsc1tlZGdlLmlkXSA9IHt9O1xuICAgIH1cbiAgICB0ZXJtaW5hbExhYmVsc1tlZGdlLmlkXS5lbmRSaWdodCA9IGVuZEVkZ2VMYWJlbFJpZ2h0O1xuICAgIHNldFRlcm1pbmFsV2lkdGgoZm8sIGVkZ2UuZW5kTGFiZWxSaWdodCk7XG4gIH1cbiAgcmV0dXJuIGxhYmVsRWxlbWVudDtcbn0sIFwiaW5zZXJ0RWRnZUxhYmVsXCIpO1xuZnVuY3Rpb24gc2V0VGVybWluYWxXaWR0aChmbywgdmFsdWUpIHtcbiAgaWYgKGdldEVmZmVjdGl2ZUh0bWxMYWJlbHMoZ2V0Q29uZmlnMigpKSAmJiBmbykge1xuICAgIGZvLnN0eWxlLndpZHRoID0gdmFsdWUubGVuZ3RoICogOSArIFwicHhcIjtcbiAgICBmby5zdHlsZS5oZWlnaHQgPSBcIjEycHhcIjtcbiAgfVxufVxuX19uYW1lKHNldFRlcm1pbmFsV2lkdGgsIFwic2V0VGVybWluYWxXaWR0aFwiKTtcbnZhciBwb3NpdGlvbkVkZ2VMYWJlbCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGVkZ2UsIHBhdGhzKSA9PiB7XG4gIGxvZy5kZWJ1ZyhcIk1vdmluZyBsYWJlbCBhYmM4OCBcIiwgZWRnZS5pZCwgZWRnZS5sYWJlbCwgZWRnZUxhYmVsc1tlZGdlLmlkXSwgcGF0aHMpO1xuICBsZXQgcGF0aCA9IHBhdGhzLnVwZGF0ZWRQYXRoID8gcGF0aHMudXBkYXRlZFBhdGggOiBwYXRocy5vcmlnaW5hbFBhdGg7XG4gIGNvbnN0IHNpdGVDb25maWcgPSBnZXRDb25maWcyKCk7XG4gIGNvbnN0IHsgc3ViR3JhcGhUaXRsZVRvdGFsTWFyZ2luIH0gPSBnZXRTdWJHcmFwaFRpdGxlTWFyZ2lucyhzaXRlQ29uZmlnKTtcbiAgaWYgKGVkZ2UubGFiZWwpIHtcbiAgICBjb25zdCBlbCA9IGVkZ2VMYWJlbHNbZWRnZS5pZF07XG4gICAgbGV0IHggPSBlZGdlLng7XG4gICAgbGV0IHkgPSBlZGdlLnk7XG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIGNvbnN0IHBvcyA9IHV0aWxzX2RlZmF1bHQuY2FsY0xhYmVsUG9zaXRpb24ocGF0aCk7XG4gICAgICBsb2cuZGVidWcoXG4gICAgICAgIFwiTW92aW5nIGxhYmVsIFwiICsgZWRnZS5sYWJlbCArIFwiIGZyb20gKFwiLFxuICAgICAgICB4LFxuICAgICAgICBcIixcIixcbiAgICAgICAgeSxcbiAgICAgICAgXCIpIHRvIChcIixcbiAgICAgICAgcG9zLngsXG4gICAgICAgIFwiLFwiLFxuICAgICAgICBwb3MueSxcbiAgICAgICAgXCIpIGFiYzg4XCJcbiAgICAgICk7XG4gICAgICBpZiAocGF0aHMudXBkYXRlZFBhdGgpIHtcbiAgICAgICAgeCA9IHBvcy54O1xuICAgICAgICB5ID0gcG9zLnk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgke3h9LCAke3kgKyBzdWJHcmFwaFRpdGxlVG90YWxNYXJnaW4gLyAyfSlgKTtcbiAgfVxuICBpZiAoZWRnZS5zdGFydExhYmVsTGVmdCkge1xuICAgIGNvbnN0IGVsID0gdGVybWluYWxMYWJlbHNbZWRnZS5pZF0uc3RhcnRMZWZ0O1xuICAgIGxldCB4ID0gZWRnZS54O1xuICAgIGxldCB5ID0gZWRnZS55O1xuICAgIGlmIChwYXRoKSB7XG4gICAgICBjb25zdCBwb3MgPSB1dGlsc19kZWZhdWx0LmNhbGNUZXJtaW5hbExhYmVsUG9zaXRpb24oZWRnZS5hcnJvd1R5cGVTdGFydCA/IDEwIDogMCwgXCJzdGFydF9sZWZ0XCIsIHBhdGgpO1xuICAgICAgeCA9IHBvcy54O1xuICAgICAgeSA9IHBvcy55O1xuICAgIH1cbiAgICBlbC5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHt4fSwgJHt5fSlgKTtcbiAgfVxuICBpZiAoZWRnZS5zdGFydExhYmVsUmlnaHQpIHtcbiAgICBjb25zdCBlbCA9IHRlcm1pbmFsTGFiZWxzW2VkZ2UuaWRdLnN0YXJ0UmlnaHQ7XG4gICAgbGV0IHggPSBlZGdlLng7XG4gICAgbGV0IHkgPSBlZGdlLnk7XG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIGNvbnN0IHBvcyA9IHV0aWxzX2RlZmF1bHQuY2FsY1Rlcm1pbmFsTGFiZWxQb3NpdGlvbihcbiAgICAgICAgZWRnZS5hcnJvd1R5cGVTdGFydCA/IDEwIDogMCxcbiAgICAgICAgXCJzdGFydF9yaWdodFwiLFxuICAgICAgICBwYXRoXG4gICAgICApO1xuICAgICAgeCA9IHBvcy54O1xuICAgICAgeSA9IHBvcy55O1xuICAgIH1cbiAgICBlbC5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHt4fSwgJHt5fSlgKTtcbiAgfVxuICBpZiAoZWRnZS5lbmRMYWJlbExlZnQpIHtcbiAgICBjb25zdCBlbCA9IHRlcm1pbmFsTGFiZWxzW2VkZ2UuaWRdLmVuZExlZnQ7XG4gICAgbGV0IHggPSBlZGdlLng7XG4gICAgbGV0IHkgPSBlZGdlLnk7XG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIGNvbnN0IHBvcyA9IHV0aWxzX2RlZmF1bHQuY2FsY1Rlcm1pbmFsTGFiZWxQb3NpdGlvbihlZGdlLmFycm93VHlwZUVuZCA/IDEwIDogMCwgXCJlbmRfbGVmdFwiLCBwYXRoKTtcbiAgICAgIHggPSBwb3MueDtcbiAgICAgIHkgPSBwb3MueTtcbiAgICB9XG4gICAgZWwuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7eH0sICR7eX0pYCk7XG4gIH1cbiAgaWYgKGVkZ2UuZW5kTGFiZWxSaWdodCkge1xuICAgIGNvbnN0IGVsID0gdGVybWluYWxMYWJlbHNbZWRnZS5pZF0uZW5kUmlnaHQ7XG4gICAgbGV0IHggPSBlZGdlLng7XG4gICAgbGV0IHkgPSBlZGdlLnk7XG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIGNvbnN0IHBvcyA9IHV0aWxzX2RlZmF1bHQuY2FsY1Rlcm1pbmFsTGFiZWxQb3NpdGlvbihlZGdlLmFycm93VHlwZUVuZCA/IDEwIDogMCwgXCJlbmRfcmlnaHRcIiwgcGF0aCk7XG4gICAgICB4ID0gcG9zLng7XG4gICAgICB5ID0gcG9zLnk7XG4gICAgfVxuICAgIGVsLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgke3h9LCAke3l9KWApO1xuICB9XG59LCBcInBvc2l0aW9uRWRnZUxhYmVsXCIpO1xudmFyIG91dHNpZGVOb2RlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgobm9kZSwgcG9pbnQyKSA9PiB7XG4gIGNvbnN0IHggPSBub2RlLng7XG4gIGNvbnN0IHkgPSBub2RlLnk7XG4gIGNvbnN0IGR4ID0gTWF0aC5hYnMocG9pbnQyLnggLSB4KTtcbiAgY29uc3QgZHkgPSBNYXRoLmFicyhwb2ludDIueSAtIHkpO1xuICBjb25zdCB3ID0gbm9kZS53aWR0aCAvIDI7XG4gIGNvbnN0IGggPSBub2RlLmhlaWdodCAvIDI7XG4gIGlmIChkeCA+PSB3IHx8IGR5ID49IGgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59LCBcIm91dHNpZGVOb2RlXCIpO1xudmFyIGludGVyc2VjdGlvbiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKG5vZGUsIG91dHNpZGVQb2ludCwgaW5zaWRlUG9pbnQpID0+IHtcbiAgbG9nLmRlYnVnKGBpbnRlcnNlY3Rpb24gY2FsYyBhYmM4OTpcbiAgb3V0c2lkZVBvaW50OiAke0pTT04uc3RyaW5naWZ5KG91dHNpZGVQb2ludCl9XG4gIGluc2lkZVBvaW50IDogJHtKU09OLnN0cmluZ2lmeShpbnNpZGVQb2ludCl9XG4gIG5vZGUgICAgICAgIDogeDoke25vZGUueH0geToke25vZGUueX0gdzoke25vZGUud2lkdGh9IGg6JHtub2RlLmhlaWdodH1gKTtcbiAgY29uc3QgeCA9IG5vZGUueDtcbiAgY29uc3QgeSA9IG5vZGUueTtcbiAgY29uc3QgZHggPSBNYXRoLmFicyh4IC0gaW5zaWRlUG9pbnQueCk7XG4gIGNvbnN0IHcgPSBub2RlLndpZHRoIC8gMjtcbiAgbGV0IHIgPSBpbnNpZGVQb2ludC54IDwgb3V0c2lkZVBvaW50LnggPyB3IC0gZHggOiB3ICsgZHg7XG4gIGNvbnN0IGggPSBub2RlLmhlaWdodCAvIDI7XG4gIGNvbnN0IFEgPSBNYXRoLmFicyhvdXRzaWRlUG9pbnQueSAtIGluc2lkZVBvaW50LnkpO1xuICBjb25zdCBSID0gTWF0aC5hYnMob3V0c2lkZVBvaW50LnggLSBpbnNpZGVQb2ludC54KTtcbiAgaWYgKE1hdGguYWJzKHkgLSBvdXRzaWRlUG9pbnQueSkgKiB3ID4gTWF0aC5hYnMoeCAtIG91dHNpZGVQb2ludC54KSAqIGgpIHtcbiAgICBsZXQgcSA9IGluc2lkZVBvaW50LnkgPCBvdXRzaWRlUG9pbnQueSA/IG91dHNpZGVQb2ludC55IC0gaCAtIHkgOiB5IC0gaCAtIG91dHNpZGVQb2ludC55O1xuICAgIHIgPSBSICogcSAvIFE7XG4gICAgY29uc3QgcmVzID0ge1xuICAgICAgeDogaW5zaWRlUG9pbnQueCA8IG91dHNpZGVQb2ludC54ID8gaW5zaWRlUG9pbnQueCArIHIgOiBpbnNpZGVQb2ludC54IC0gUiArIHIsXG4gICAgICB5OiBpbnNpZGVQb2ludC55IDwgb3V0c2lkZVBvaW50LnkgPyBpbnNpZGVQb2ludC55ICsgUSAtIHEgOiBpbnNpZGVQb2ludC55IC0gUSArIHFcbiAgICB9O1xuICAgIGlmIChyID09PSAwKSB7XG4gICAgICByZXMueCA9IG91dHNpZGVQb2ludC54O1xuICAgICAgcmVzLnkgPSBvdXRzaWRlUG9pbnQueTtcbiAgICB9XG4gICAgaWYgKFIgPT09IDApIHtcbiAgICAgIHJlcy54ID0gb3V0c2lkZVBvaW50Lng7XG4gICAgfVxuICAgIGlmIChRID09PSAwKSB7XG4gICAgICByZXMueSA9IG91dHNpZGVQb2ludC55O1xuICAgIH1cbiAgICBsb2cuZGVidWcoYGFiYzg5IHRvcHAvYm90dCBjYWxjLCBRICR7UX0sIHEgJHtxfSwgUiAke1J9LCByICR7cn1gLCByZXMpO1xuICAgIHJldHVybiByZXM7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGluc2lkZVBvaW50LnggPCBvdXRzaWRlUG9pbnQueCkge1xuICAgICAgciA9IG91dHNpZGVQb2ludC54IC0gdyAtIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHIgPSB4IC0gdyAtIG91dHNpZGVQb2ludC54O1xuICAgIH1cbiAgICBsZXQgcSA9IFEgKiByIC8gUjtcbiAgICBsZXQgX3ggPSBpbnNpZGVQb2ludC54IDwgb3V0c2lkZVBvaW50LnggPyBpbnNpZGVQb2ludC54ICsgUiAtIHIgOiBpbnNpZGVQb2ludC54IC0gUiArIHI7XG4gICAgbGV0IF95ID0gaW5zaWRlUG9pbnQueSA8IG91dHNpZGVQb2ludC55ID8gaW5zaWRlUG9pbnQueSArIHEgOiBpbnNpZGVQb2ludC55IC0gcTtcbiAgICBsb2cuZGVidWcoYHNpZGVzIGNhbGMgYWJjODksIFEgJHtRfSwgcSAke3F9LCBSICR7Un0sIHIgJHtyfWAsIHsgX3gsIF95IH0pO1xuICAgIGlmIChyID09PSAwKSB7XG4gICAgICBfeCA9IG91dHNpZGVQb2ludC54O1xuICAgICAgX3kgPSBvdXRzaWRlUG9pbnQueTtcbiAgICB9XG4gICAgaWYgKFIgPT09IDApIHtcbiAgICAgIF94ID0gb3V0c2lkZVBvaW50Lng7XG4gICAgfVxuICAgIGlmIChRID09PSAwKSB7XG4gICAgICBfeSA9IG91dHNpZGVQb2ludC55O1xuICAgIH1cbiAgICByZXR1cm4geyB4OiBfeCwgeTogX3kgfTtcbiAgfVxufSwgXCJpbnRlcnNlY3Rpb25cIik7XG52YXIgY3V0UGF0aEF0SW50ZXJzZWN0ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoX3BvaW50cywgYm91bmRhcnlOb2RlKSA9PiB7XG4gIGxvZy5kZWJ1ZyhcImFiYzg4IGN1dFBhdGhBdEludGVyc2VjdFwiLCBfcG9pbnRzLCBib3VuZGFyeU5vZGUpO1xuICBsZXQgcG9pbnRzID0gW107XG4gIGxldCBsYXN0UG9pbnRPdXRzaWRlID0gX3BvaW50c1swXTtcbiAgbGV0IGlzSW5zaWRlID0gZmFsc2U7XG4gIF9wb2ludHMuZm9yRWFjaCgocG9pbnQyKSA9PiB7XG4gICAgaWYgKCFvdXRzaWRlTm9kZShib3VuZGFyeU5vZGUsIHBvaW50MikgJiYgIWlzSW5zaWRlKSB7XG4gICAgICBjb25zdCBpbnRlciA9IGludGVyc2VjdGlvbihib3VuZGFyeU5vZGUsIGxhc3RQb2ludE91dHNpZGUsIHBvaW50Mik7XG4gICAgICBsZXQgcG9pbnRQcmVzZW50ID0gZmFsc2U7XG4gICAgICBwb2ludHMuZm9yRWFjaCgocCkgPT4ge1xuICAgICAgICBwb2ludFByZXNlbnQgPSBwb2ludFByZXNlbnQgfHwgcC54ID09PSBpbnRlci54ICYmIHAueSA9PT0gaW50ZXIueTtcbiAgICAgIH0pO1xuICAgICAgaWYgKCFwb2ludHMuc29tZSgoZSkgPT4gZS54ID09PSBpbnRlci54ICYmIGUueSA9PT0gaW50ZXIueSkpIHtcbiAgICAgICAgcG9pbnRzLnB1c2goaW50ZXIpO1xuICAgICAgfVxuICAgICAgaXNJbnNpZGUgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBsYXN0UG9pbnRPdXRzaWRlID0gcG9pbnQyO1xuICAgICAgaWYgKCFpc0luc2lkZSkge1xuICAgICAgICBwb2ludHMucHVzaChwb2ludDIpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gIHJldHVybiBwb2ludHM7XG59LCBcImN1dFBhdGhBdEludGVyc2VjdFwiKTtcbnZhciBpbnNlcnRFZGdlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbihlbGVtLCBlLCBlZGdlLCBjbHVzdGVyRGIsIGRpYWdyYW1UeXBlLCBncmFwaCwgaWQpIHtcbiAgbGV0IHBvaW50cyA9IGVkZ2UucG9pbnRzO1xuICBsb2cuZGVidWcoXCJhYmM4OCBJbnNlcnRFZGdlOiBlZGdlPVwiLCBlZGdlLCBcImU9XCIsIGUpO1xuICBsZXQgcG9pbnRzSGFzQ2hhbmdlZCA9IGZhbHNlO1xuICBjb25zdCB0YWlsID0gZ3JhcGgubm9kZShlLnYpO1xuICB2YXIgaGVhZCA9IGdyYXBoLm5vZGUoZS53KTtcbiAgaWYgKGhlYWQ/LmludGVyc2VjdCAmJiB0YWlsPy5pbnRlcnNlY3QpIHtcbiAgICBwb2ludHMgPSBwb2ludHMuc2xpY2UoMSwgZWRnZS5wb2ludHMubGVuZ3RoIC0gMSk7XG4gICAgcG9pbnRzLnVuc2hpZnQodGFpbC5pbnRlcnNlY3QocG9pbnRzWzBdKSk7XG4gICAgcG9pbnRzLnB1c2goaGVhZC5pbnRlcnNlY3QocG9pbnRzW3BvaW50cy5sZW5ndGggLSAxXSkpO1xuICB9XG4gIGlmIChlZGdlLnRvQ2x1c3Rlcikge1xuICAgIGxvZy5kZWJ1ZyhcInRvIGNsdXN0ZXIgYWJjODhcIiwgY2x1c3RlckRiW2VkZ2UudG9DbHVzdGVyXSk7XG4gICAgcG9pbnRzID0gY3V0UGF0aEF0SW50ZXJzZWN0KGVkZ2UucG9pbnRzLCBjbHVzdGVyRGJbZWRnZS50b0NsdXN0ZXJdLm5vZGUpO1xuICAgIHBvaW50c0hhc0NoYW5nZWQgPSB0cnVlO1xuICB9XG4gIGlmIChlZGdlLmZyb21DbHVzdGVyKSB7XG4gICAgbG9nLmRlYnVnKFwiZnJvbSBjbHVzdGVyIGFiYzg4XCIsIGNsdXN0ZXJEYltlZGdlLmZyb21DbHVzdGVyXSk7XG4gICAgcG9pbnRzID0gY3V0UGF0aEF0SW50ZXJzZWN0KHBvaW50cy5yZXZlcnNlKCksIGNsdXN0ZXJEYltlZGdlLmZyb21DbHVzdGVyXS5ub2RlKS5yZXZlcnNlKCk7XG4gICAgcG9pbnRzSGFzQ2hhbmdlZCA9IHRydWU7XG4gIH1cbiAgY29uc3QgbGluZURhdGEgPSBwb2ludHMuZmlsdGVyKChwKSA9PiAhTnVtYmVyLmlzTmFOKHAueSkpO1xuICBsZXQgY3VydmUgPSBjdXJ2ZUJhc2lzO1xuICBpZiAoZWRnZS5jdXJ2ZSAmJiAoZGlhZ3JhbVR5cGUgPT09IFwiZ3JhcGhcIiB8fCBkaWFncmFtVHlwZSA9PT0gXCJmbG93Y2hhcnRcIikpIHtcbiAgICBjdXJ2ZSA9IGVkZ2UuY3VydmU7XG4gIH1cbiAgY29uc3QgeyB4LCB5IH0gPSBnZXRMaW5lRnVuY3Rpb25zV2l0aE9mZnNldChlZGdlKTtcbiAgY29uc3QgbGluZUZ1bmN0aW9uID0gbGluZSgpLngoeCkueSh5KS5jdXJ2ZShjdXJ2ZSk7XG4gIGxldCBzdHJva2VDbGFzc2VzO1xuICBzd2l0Y2ggKGVkZ2UudGhpY2tuZXNzKSB7XG4gICAgY2FzZSBcIm5vcm1hbFwiOlxuICAgICAgc3Ryb2tlQ2xhc3NlcyA9IFwiZWRnZS10aGlja25lc3Mtbm9ybWFsXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwidGhpY2tcIjpcbiAgICAgIHN0cm9rZUNsYXNzZXMgPSBcImVkZ2UtdGhpY2tuZXNzLXRoaWNrXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiaW52aXNpYmxlXCI6XG4gICAgICBzdHJva2VDbGFzc2VzID0gXCJlZGdlLXRoaWNrbmVzcy10aGlja1wiO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHN0cm9rZUNsYXNzZXMgPSBcIlwiO1xuICB9XG4gIHN3aXRjaCAoZWRnZS5wYXR0ZXJuKSB7XG4gICAgY2FzZSBcInNvbGlkXCI6XG4gICAgICBzdHJva2VDbGFzc2VzICs9IFwiIGVkZ2UtcGF0dGVybi1zb2xpZFwiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImRvdHRlZFwiOlxuICAgICAgc3Ryb2tlQ2xhc3NlcyArPSBcIiBlZGdlLXBhdHRlcm4tZG90dGVkXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiZGFzaGVkXCI6XG4gICAgICBzdHJva2VDbGFzc2VzICs9IFwiIGVkZ2UtcGF0dGVybi1kYXNoZWRcIjtcbiAgICAgIGJyZWFrO1xuICB9XG4gIGNvbnN0IHN2Z1BhdGggPSBlbGVtLmFwcGVuZChcInBhdGhcIikuYXR0cihcImRcIiwgbGluZUZ1bmN0aW9uKGxpbmVEYXRhKSkuYXR0cihcImlkXCIsIGVkZ2UuaWQpLmF0dHIoXCJjbGFzc1wiLCBcIiBcIiArIHN0cm9rZUNsYXNzZXMgKyAoZWRnZS5jbGFzc2VzID8gXCIgXCIgKyBlZGdlLmNsYXNzZXMgOiBcIlwiKSkuYXR0cihcInN0eWxlXCIsIGVkZ2Uuc3R5bGUpO1xuICBsZXQgdXJsID0gXCJcIjtcbiAgaWYgKGdldENvbmZpZzIoKS5mbG93Y2hhcnQuYXJyb3dNYXJrZXJBYnNvbHV0ZSB8fCBnZXRDb25maWcyKCkuc3RhdGUuYXJyb3dNYXJrZXJBYnNvbHV0ZSkge1xuICAgIHVybCA9IGdldFVybCh0cnVlKTtcbiAgfVxuICBhZGRFZGdlTWFya2VycyhzdmdQYXRoLCBlZGdlLCB1cmwsIGlkLCBkaWFncmFtVHlwZSk7XG4gIGxldCBwYXRocyA9IHt9O1xuICBpZiAocG9pbnRzSGFzQ2hhbmdlZCkge1xuICAgIHBhdGhzLnVwZGF0ZWRQYXRoID0gcG9pbnRzO1xuICB9XG4gIHBhdGhzLm9yaWdpbmFsUGF0aCA9IGVkZ2UucG9pbnRzO1xuICByZXR1cm4gcGF0aHM7XG59LCBcImluc2VydEVkZ2VcIik7XG5cbi8vIHNyYy9kYWdyZS13cmFwcGVyL25vZGVzLmpzXG5pbXBvcnQgeyBzZWxlY3QgYXMgc2VsZWN0MyB9IGZyb20gXCJkM1wiO1xuXG4vLyBzcmMvZGFncmUtd3JhcHBlci9ibG9ja0Fycm93SGVscGVyLnRzXG52YXIgZXhwYW5kQW5kRGVkdXBsaWNhdGVEaXJlY3Rpb25zID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZGlyZWN0aW9ucykgPT4ge1xuICBjb25zdCB1bmlxdWVEaXJlY3Rpb25zID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTtcbiAgZm9yIChjb25zdCBkaXJlY3Rpb24gb2YgZGlyZWN0aW9ucykge1xuICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XG4gICAgICBjYXNlIFwieFwiOlxuICAgICAgICB1bmlxdWVEaXJlY3Rpb25zLmFkZChcInJpZ2h0XCIpO1xuICAgICAgICB1bmlxdWVEaXJlY3Rpb25zLmFkZChcImxlZnRcIik7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInlcIjpcbiAgICAgICAgdW5pcXVlRGlyZWN0aW9ucy5hZGQoXCJ1cFwiKTtcbiAgICAgICAgdW5pcXVlRGlyZWN0aW9ucy5hZGQoXCJkb3duXCIpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHVuaXF1ZURpcmVjdGlvbnMuYWRkKGRpcmVjdGlvbik7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdW5pcXVlRGlyZWN0aW9ucztcbn0sIFwiZXhwYW5kQW5kRGVkdXBsaWNhdGVEaXJlY3Rpb25zXCIpO1xudmFyIGdldEFycm93UG9pbnRzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoZHVwbGljYXRlZERpcmVjdGlvbnMsIGJib3gsIG5vZGUsIHRvdGFsV2lkdGgpID0+IHtcbiAgY29uc3QgZGlyZWN0aW9ucyA9IGV4cGFuZEFuZERlZHVwbGljYXRlRGlyZWN0aW9ucyhkdXBsaWNhdGVkRGlyZWN0aW9ucyk7XG4gIGNvbnN0IGYgPSAyO1xuICBjb25zdCBoZWlnaHQgPSBiYm94LmhlaWdodCArIDIgKiBub2RlLnBhZGRpbmc7XG4gIGNvbnN0IG1pZHBvaW50ID0gaGVpZ2h0IC8gZjtcbiAgY29uc3Qgd2lkdGggPSB0b3RhbFdpZHRoID8/IGJib3gud2lkdGggKyAyICogbWlkcG9pbnQgKyBub2RlLnBhZGRpbmc7XG4gIGNvbnN0IHBhZGRpbmcyID0gbm9kZS5wYWRkaW5nIC8gMjtcbiAgaWYgKGRpcmVjdGlvbnMuaGFzKFwicmlnaHRcIikgJiYgZGlyZWN0aW9ucy5oYXMoXCJsZWZ0XCIpICYmIGRpcmVjdGlvbnMuaGFzKFwidXBcIikgJiYgZGlyZWN0aW9ucy5oYXMoXCJkb3duXCIpKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIC8vIEJvdHRvbVxuICAgICAgeyB4OiAwLCB5OiAwIH0sXG4gICAgICB7IHg6IG1pZHBvaW50LCB5OiAwIH0sXG4gICAgICB7IHg6IHdpZHRoIC8gMiwgeTogMiAqIHBhZGRpbmcyIH0sXG4gICAgICB7IHg6IHdpZHRoIC0gbWlkcG9pbnQsIHk6IDAgfSxcbiAgICAgIHsgeDogd2lkdGgsIHk6IDAgfSxcbiAgICAgIC8vIFJpZ2h0XG4gICAgICB7IHg6IHdpZHRoLCB5OiAtaGVpZ2h0IC8gMyB9LFxuICAgICAgeyB4OiB3aWR0aCArIDIgKiBwYWRkaW5nMiwgeTogLWhlaWdodCAvIDIgfSxcbiAgICAgIHsgeDogd2lkdGgsIHk6IC0yICogaGVpZ2h0IC8gMyB9LFxuICAgICAgeyB4OiB3aWR0aCwgeTogLWhlaWdodCB9LFxuICAgICAgLy8gVG9wXG4gICAgICB7IHg6IHdpZHRoIC0gbWlkcG9pbnQsIHk6IC1oZWlnaHQgfSxcbiAgICAgIHsgeDogd2lkdGggLyAyLCB5OiAtaGVpZ2h0IC0gMiAqIHBhZGRpbmcyIH0sXG4gICAgICB7IHg6IG1pZHBvaW50LCB5OiAtaGVpZ2h0IH0sXG4gICAgICAvLyBMZWZ0XG4gICAgICB7IHg6IDAsIHk6IC1oZWlnaHQgfSxcbiAgICAgIHsgeDogMCwgeTogLTIgKiBoZWlnaHQgLyAzIH0sXG4gICAgICB7IHg6IC0yICogcGFkZGluZzIsIHk6IC1oZWlnaHQgLyAyIH0sXG4gICAgICB7IHg6IDAsIHk6IC1oZWlnaHQgLyAzIH1cbiAgICBdO1xuICB9XG4gIGlmIChkaXJlY3Rpb25zLmhhcyhcInJpZ2h0XCIpICYmIGRpcmVjdGlvbnMuaGFzKFwibGVmdFwiKSAmJiBkaXJlY3Rpb25zLmhhcyhcInVwXCIpKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHsgeDogbWlkcG9pbnQsIHk6IDAgfSxcbiAgICAgIHsgeDogd2lkdGggLSBtaWRwb2ludCwgeTogMCB9LFxuICAgICAgeyB4OiB3aWR0aCwgeTogLWhlaWdodCAvIDIgfSxcbiAgICAgIHsgeDogd2lkdGggLSBtaWRwb2ludCwgeTogLWhlaWdodCB9LFxuICAgICAgeyB4OiBtaWRwb2ludCwgeTogLWhlaWdodCB9LFxuICAgICAgeyB4OiAwLCB5OiAtaGVpZ2h0IC8gMiB9XG4gICAgXTtcbiAgfVxuICBpZiAoZGlyZWN0aW9ucy5oYXMoXCJyaWdodFwiKSAmJiBkaXJlY3Rpb25zLmhhcyhcImxlZnRcIikgJiYgZGlyZWN0aW9ucy5oYXMoXCJkb3duXCIpKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHsgeDogMCwgeTogMCB9LFxuICAgICAgeyB4OiBtaWRwb2ludCwgeTogLWhlaWdodCB9LFxuICAgICAgeyB4OiB3aWR0aCAtIG1pZHBvaW50LCB5OiAtaGVpZ2h0IH0sXG4gICAgICB7IHg6IHdpZHRoLCB5OiAwIH1cbiAgICBdO1xuICB9XG4gIGlmIChkaXJlY3Rpb25zLmhhcyhcInJpZ2h0XCIpICYmIGRpcmVjdGlvbnMuaGFzKFwidXBcIikgJiYgZGlyZWN0aW9ucy5oYXMoXCJkb3duXCIpKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHsgeDogMCwgeTogMCB9LFxuICAgICAgeyB4OiB3aWR0aCwgeTogLW1pZHBvaW50IH0sXG4gICAgICB7IHg6IHdpZHRoLCB5OiAtaGVpZ2h0ICsgbWlkcG9pbnQgfSxcbiAgICAgIHsgeDogMCwgeTogLWhlaWdodCB9XG4gICAgXTtcbiAgfVxuICBpZiAoZGlyZWN0aW9ucy5oYXMoXCJsZWZ0XCIpICYmIGRpcmVjdGlvbnMuaGFzKFwidXBcIikgJiYgZGlyZWN0aW9ucy5oYXMoXCJkb3duXCIpKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHsgeDogd2lkdGgsIHk6IDAgfSxcbiAgICAgIHsgeDogMCwgeTogLW1pZHBvaW50IH0sXG4gICAgICB7IHg6IDAsIHk6IC1oZWlnaHQgKyBtaWRwb2ludCB9LFxuICAgICAgeyB4OiB3aWR0aCwgeTogLWhlaWdodCB9XG4gICAgXTtcbiAgfVxuICBpZiAoZGlyZWN0aW9ucy5oYXMoXCJyaWdodFwiKSAmJiBkaXJlY3Rpb25zLmhhcyhcImxlZnRcIikpIHtcbiAgICByZXR1cm4gW1xuICAgICAgeyB4OiBtaWRwb2ludCwgeTogMCB9LFxuICAgICAgeyB4OiBtaWRwb2ludCwgeTogLXBhZGRpbmcyIH0sXG4gICAgICB7IHg6IHdpZHRoIC0gbWlkcG9pbnQsIHk6IC1wYWRkaW5nMiB9LFxuICAgICAgeyB4OiB3aWR0aCAtIG1pZHBvaW50LCB5OiAwIH0sXG4gICAgICB7IHg6IHdpZHRoLCB5OiAtaGVpZ2h0IC8gMiB9LFxuICAgICAgeyB4OiB3aWR0aCAtIG1pZHBvaW50LCB5OiAtaGVpZ2h0IH0sXG4gICAgICB7IHg6IHdpZHRoIC0gbWlkcG9pbnQsIHk6IC1oZWlnaHQgKyBwYWRkaW5nMiB9LFxuICAgICAgeyB4OiBtaWRwb2ludCwgeTogLWhlaWdodCArIHBhZGRpbmcyIH0sXG4gICAgICB7IHg6IG1pZHBvaW50LCB5OiAtaGVpZ2h0IH0sXG4gICAgICB7IHg6IDAsIHk6IC1oZWlnaHQgLyAyIH1cbiAgICBdO1xuICB9XG4gIGlmIChkaXJlY3Rpb25zLmhhcyhcInVwXCIpICYmIGRpcmVjdGlvbnMuaGFzKFwiZG93blwiKSkge1xuICAgIHJldHVybiBbXG4gICAgICAvLyBCb3R0b20gY2VudGVyXG4gICAgICB7IHg6IHdpZHRoIC8gMiwgeTogMCB9LFxuICAgICAgLy8gTGVmdCBwb250IG9mIGJvdHRvbSBhcnJvd1xuICAgICAgeyB4OiAwLCB5OiAtcGFkZGluZzIgfSxcbiAgICAgIHsgeDogbWlkcG9pbnQsIHk6IC1wYWRkaW5nMiB9LFxuICAgICAgLy8gTGVmdCB0b3Agb3ZlciB2ZXJ0aWNhbCBzZWN0aW9uXG4gICAgICB7IHg6IG1pZHBvaW50LCB5OiAtaGVpZ2h0ICsgcGFkZGluZzIgfSxcbiAgICAgIHsgeDogMCwgeTogLWhlaWdodCArIHBhZGRpbmcyIH0sXG4gICAgICAvLyBUb3Agb2YgYXJyb3dcbiAgICAgIHsgeDogd2lkdGggLyAyLCB5OiAtaGVpZ2h0IH0sXG4gICAgICB7IHg6IHdpZHRoLCB5OiAtaGVpZ2h0ICsgcGFkZGluZzIgfSxcbiAgICAgIC8vIFRvcCBvZiByaWdodCB2ZXJ0aWNhbCBiYXJcbiAgICAgIHsgeDogd2lkdGggLSBtaWRwb2ludCwgeTogLWhlaWdodCArIHBhZGRpbmcyIH0sXG4gICAgICB7IHg6IHdpZHRoIC0gbWlkcG9pbnQsIHk6IC1wYWRkaW5nMiB9LFxuICAgICAgeyB4OiB3aWR0aCwgeTogLXBhZGRpbmcyIH1cbiAgICBdO1xuICB9XG4gIGlmIChkaXJlY3Rpb25zLmhhcyhcInJpZ2h0XCIpICYmIGRpcmVjdGlvbnMuaGFzKFwidXBcIikpIHtcbiAgICByZXR1cm4gW1xuICAgICAgeyB4OiAwLCB5OiAwIH0sXG4gICAgICB7IHg6IHdpZHRoLCB5OiAtbWlkcG9pbnQgfSxcbiAgICAgIHsgeDogMCwgeTogLWhlaWdodCB9XG4gICAgXTtcbiAgfVxuICBpZiAoZGlyZWN0aW9ucy5oYXMoXCJyaWdodFwiKSAmJiBkaXJlY3Rpb25zLmhhcyhcImRvd25cIikpIHtcbiAgICByZXR1cm4gW1xuICAgICAgeyB4OiAwLCB5OiAwIH0sXG4gICAgICB7IHg6IHdpZHRoLCB5OiAwIH0sXG4gICAgICB7IHg6IDAsIHk6IC1oZWlnaHQgfVxuICAgIF07XG4gIH1cbiAgaWYgKGRpcmVjdGlvbnMuaGFzKFwibGVmdFwiKSAmJiBkaXJlY3Rpb25zLmhhcyhcInVwXCIpKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHsgeDogd2lkdGgsIHk6IDAgfSxcbiAgICAgIHsgeDogMCwgeTogLW1pZHBvaW50IH0sXG4gICAgICB7IHg6IHdpZHRoLCB5OiAtaGVpZ2h0IH1cbiAgICBdO1xuICB9XG4gIGlmIChkaXJlY3Rpb25zLmhhcyhcImxlZnRcIikgJiYgZGlyZWN0aW9ucy5oYXMoXCJkb3duXCIpKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHsgeDogd2lkdGgsIHk6IDAgfSxcbiAgICAgIHsgeDogMCwgeTogMCB9LFxuICAgICAgeyB4OiB3aWR0aCwgeTogLWhlaWdodCB9XG4gICAgXTtcbiAgfVxuICBpZiAoZGlyZWN0aW9ucy5oYXMoXCJyaWdodFwiKSkge1xuICAgIHJldHVybiBbXG4gICAgICB7IHg6IG1pZHBvaW50LCB5OiAtcGFkZGluZzIgfSxcbiAgICAgIHsgeDogbWlkcG9pbnQsIHk6IC1wYWRkaW5nMiB9LFxuICAgICAgeyB4OiB3aWR0aCAtIG1pZHBvaW50LCB5OiAtcGFkZGluZzIgfSxcbiAgICAgIHsgeDogd2lkdGggLSBtaWRwb2ludCwgeTogMCB9LFxuICAgICAgeyB4OiB3aWR0aCwgeTogLWhlaWdodCAvIDIgfSxcbiAgICAgIHsgeDogd2lkdGggLSBtaWRwb2ludCwgeTogLWhlaWdodCB9LFxuICAgICAgeyB4OiB3aWR0aCAtIG1pZHBvaW50LCB5OiAtaGVpZ2h0ICsgcGFkZGluZzIgfSxcbiAgICAgIC8vIHRvcCBsZWZ0IGNvcm5lciBvZiBhcnJvd1xuICAgICAgeyB4OiBtaWRwb2ludCwgeTogLWhlaWdodCArIHBhZGRpbmcyIH0sXG4gICAgICB7IHg6IG1pZHBvaW50LCB5OiAtaGVpZ2h0ICsgcGFkZGluZzIgfVxuICAgIF07XG4gIH1cbiAgaWYgKGRpcmVjdGlvbnMuaGFzKFwibGVmdFwiKSkge1xuICAgIHJldHVybiBbXG4gICAgICB7IHg6IG1pZHBvaW50LCB5OiAwIH0sXG4gICAgICB7IHg6IG1pZHBvaW50LCB5OiAtcGFkZGluZzIgfSxcbiAgICAgIC8vIFR3byBwb2ludHMsIHRoZSByaWdodCBjb3JuZXJzXG4gICAgICB7IHg6IHdpZHRoIC0gbWlkcG9pbnQsIHk6IC1wYWRkaW5nMiB9LFxuICAgICAgeyB4OiB3aWR0aCAtIG1pZHBvaW50LCB5OiAtaGVpZ2h0ICsgcGFkZGluZzIgfSxcbiAgICAgIHsgeDogbWlkcG9pbnQsIHk6IC1oZWlnaHQgKyBwYWRkaW5nMiB9LFxuICAgICAgeyB4OiBtaWRwb2ludCwgeTogLWhlaWdodCB9LFxuICAgICAgeyB4OiAwLCB5OiAtaGVpZ2h0IC8gMiB9XG4gICAgXTtcbiAgfVxuICBpZiAoZGlyZWN0aW9ucy5oYXMoXCJ1cFwiKSkge1xuICAgIHJldHVybiBbXG4gICAgICAvLyBCb3R0b20gY2VudGVyXG4gICAgICB7IHg6IG1pZHBvaW50LCB5OiAtcGFkZGluZzIgfSxcbiAgICAgIC8vIExlZnQgdG9wIG92ZXIgdmVydGljYWwgc2VjdGlvblxuICAgICAgeyB4OiBtaWRwb2ludCwgeTogLWhlaWdodCArIHBhZGRpbmcyIH0sXG4gICAgICB7IHg6IDAsIHk6IC1oZWlnaHQgKyBwYWRkaW5nMiB9LFxuICAgICAgLy8gVG9wIG9mIGFycm93XG4gICAgICB7IHg6IHdpZHRoIC8gMiwgeTogLWhlaWdodCB9LFxuICAgICAgeyB4OiB3aWR0aCwgeTogLWhlaWdodCArIHBhZGRpbmcyIH0sXG4gICAgICAvLyBUb3Agb2YgcmlnaHQgdmVydGljYWwgYmFyXG4gICAgICB7IHg6IHdpZHRoIC0gbWlkcG9pbnQsIHk6IC1oZWlnaHQgKyBwYWRkaW5nMiB9LFxuICAgICAgeyB4OiB3aWR0aCAtIG1pZHBvaW50LCB5OiAtcGFkZGluZzIgfVxuICAgIF07XG4gIH1cbiAgaWYgKGRpcmVjdGlvbnMuaGFzKFwiZG93blwiKSkge1xuICAgIHJldHVybiBbXG4gICAgICAvLyBCb3R0b20gY2VudGVyXG4gICAgICB7IHg6IHdpZHRoIC8gMiwgeTogMCB9LFxuICAgICAgLy8gTGVmdCBwb250IG9mIGJvdHRvbSBhcnJvd1xuICAgICAgeyB4OiAwLCB5OiAtcGFkZGluZzIgfSxcbiAgICAgIHsgeDogbWlkcG9pbnQsIHk6IC1wYWRkaW5nMiB9LFxuICAgICAgLy8gTGVmdCB0b3Agb3ZlciB2ZXJ0aWNhbCBzZWN0aW9uXG4gICAgICB7IHg6IG1pZHBvaW50LCB5OiAtaGVpZ2h0ICsgcGFkZGluZzIgfSxcbiAgICAgIHsgeDogd2lkdGggLSBtaWRwb2ludCwgeTogLWhlaWdodCArIHBhZGRpbmcyIH0sXG4gICAgICB7IHg6IHdpZHRoIC0gbWlkcG9pbnQsIHk6IC1wYWRkaW5nMiB9LFxuICAgICAgeyB4OiB3aWR0aCwgeTogLXBhZGRpbmcyIH1cbiAgICBdO1xuICB9XG4gIHJldHVybiBbeyB4OiAwLCB5OiAwIH1dO1xufSwgXCJnZXRBcnJvd1BvaW50c1wiKTtcblxuLy8gc3JjL2RhZ3JlLXdyYXBwZXIvaW50ZXJzZWN0L2ludGVyc2VjdC1ub2RlLmpzXG5mdW5jdGlvbiBpbnRlcnNlY3ROb2RlKG5vZGUsIHBvaW50Mikge1xuICByZXR1cm4gbm9kZS5pbnRlcnNlY3QocG9pbnQyKTtcbn1cbl9fbmFtZShpbnRlcnNlY3ROb2RlLCBcImludGVyc2VjdE5vZGVcIik7XG52YXIgaW50ZXJzZWN0X25vZGVfZGVmYXVsdCA9IGludGVyc2VjdE5vZGU7XG5cbi8vIHNyYy9kYWdyZS13cmFwcGVyL2ludGVyc2VjdC9pbnRlcnNlY3QtZWxsaXBzZS5qc1xuZnVuY3Rpb24gaW50ZXJzZWN0RWxsaXBzZShub2RlLCByeCwgcnksIHBvaW50Mikge1xuICB2YXIgY3ggPSBub2RlLng7XG4gIHZhciBjeSA9IG5vZGUueTtcbiAgdmFyIHB4ID0gY3ggLSBwb2ludDIueDtcbiAgdmFyIHB5ID0gY3kgLSBwb2ludDIueTtcbiAgdmFyIGRldCA9IE1hdGguc3FydChyeCAqIHJ4ICogcHkgKiBweSArIHJ5ICogcnkgKiBweCAqIHB4KTtcbiAgdmFyIGR4ID0gTWF0aC5hYnMocnggKiByeSAqIHB4IC8gZGV0KTtcbiAgaWYgKHBvaW50Mi54IDwgY3gpIHtcbiAgICBkeCA9IC1keDtcbiAgfVxuICB2YXIgZHkgPSBNYXRoLmFicyhyeCAqIHJ5ICogcHkgLyBkZXQpO1xuICBpZiAocG9pbnQyLnkgPCBjeSkge1xuICAgIGR5ID0gLWR5O1xuICB9XG4gIHJldHVybiB7IHg6IGN4ICsgZHgsIHk6IGN5ICsgZHkgfTtcbn1cbl9fbmFtZShpbnRlcnNlY3RFbGxpcHNlLCBcImludGVyc2VjdEVsbGlwc2VcIik7XG52YXIgaW50ZXJzZWN0X2VsbGlwc2VfZGVmYXVsdCA9IGludGVyc2VjdEVsbGlwc2U7XG5cbi8vIHNyYy9kYWdyZS13cmFwcGVyL2ludGVyc2VjdC9pbnRlcnNlY3QtY2lyY2xlLmpzXG5mdW5jdGlvbiBpbnRlcnNlY3RDaXJjbGUobm9kZSwgcngsIHBvaW50Mikge1xuICByZXR1cm4gaW50ZXJzZWN0X2VsbGlwc2VfZGVmYXVsdChub2RlLCByeCwgcngsIHBvaW50Mik7XG59XG5fX25hbWUoaW50ZXJzZWN0Q2lyY2xlLCBcImludGVyc2VjdENpcmNsZVwiKTtcbnZhciBpbnRlcnNlY3RfY2lyY2xlX2RlZmF1bHQgPSBpbnRlcnNlY3RDaXJjbGU7XG5cbi8vIHNyYy9kYWdyZS13cmFwcGVyL2ludGVyc2VjdC9pbnRlcnNlY3QtbGluZS5qc1xuZnVuY3Rpb24gaW50ZXJzZWN0TGluZShwMSwgcDIsIHExLCBxMikge1xuICB2YXIgYTEsIGEyLCBiMSwgYjIsIGMxLCBjMjtcbiAgdmFyIHIxLCByMiwgcjMsIHI0O1xuICB2YXIgZGVub20sIG9mZnNldCwgbnVtO1xuICB2YXIgeCwgeTtcbiAgYTEgPSBwMi55IC0gcDEueTtcbiAgYjEgPSBwMS54IC0gcDIueDtcbiAgYzEgPSBwMi54ICogcDEueSAtIHAxLnggKiBwMi55O1xuICByMyA9IGExICogcTEueCArIGIxICogcTEueSArIGMxO1xuICByNCA9IGExICogcTIueCArIGIxICogcTIueSArIGMxO1xuICBpZiAocjMgIT09IDAgJiYgcjQgIT09IDAgJiYgc2FtZVNpZ24ocjMsIHI0KSkge1xuICAgIHJldHVybjtcbiAgfVxuICBhMiA9IHEyLnkgLSBxMS55O1xuICBiMiA9IHExLnggLSBxMi54O1xuICBjMiA9IHEyLnggKiBxMS55IC0gcTEueCAqIHEyLnk7XG4gIHIxID0gYTIgKiBwMS54ICsgYjIgKiBwMS55ICsgYzI7XG4gIHIyID0gYTIgKiBwMi54ICsgYjIgKiBwMi55ICsgYzI7XG4gIGlmIChyMSAhPT0gMCAmJiByMiAhPT0gMCAmJiBzYW1lU2lnbihyMSwgcjIpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGRlbm9tID0gYTEgKiBiMiAtIGEyICogYjE7XG4gIGlmIChkZW5vbSA9PT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuICBvZmZzZXQgPSBNYXRoLmFicyhkZW5vbSAvIDIpO1xuICBudW0gPSBiMSAqIGMyIC0gYjIgKiBjMTtcbiAgeCA9IG51bSA8IDAgPyAobnVtIC0gb2Zmc2V0KSAvIGRlbm9tIDogKG51bSArIG9mZnNldCkgLyBkZW5vbTtcbiAgbnVtID0gYTIgKiBjMSAtIGExICogYzI7XG4gIHkgPSBudW0gPCAwID8gKG51bSAtIG9mZnNldCkgLyBkZW5vbSA6IChudW0gKyBvZmZzZXQpIC8gZGVub207XG4gIHJldHVybiB7IHgsIHkgfTtcbn1cbl9fbmFtZShpbnRlcnNlY3RMaW5lLCBcImludGVyc2VjdExpbmVcIik7XG5mdW5jdGlvbiBzYW1lU2lnbihyMSwgcjIpIHtcbiAgcmV0dXJuIHIxICogcjIgPiAwO1xufVxuX19uYW1lKHNhbWVTaWduLCBcInNhbWVTaWduXCIpO1xudmFyIGludGVyc2VjdF9saW5lX2RlZmF1bHQgPSBpbnRlcnNlY3RMaW5lO1xuXG4vLyBzcmMvZGFncmUtd3JhcHBlci9pbnRlcnNlY3QvaW50ZXJzZWN0LXBvbHlnb24uanNcbnZhciBpbnRlcnNlY3RfcG9seWdvbl9kZWZhdWx0ID0gaW50ZXJzZWN0UG9seWdvbjtcbmZ1bmN0aW9uIGludGVyc2VjdFBvbHlnb24obm9kZSwgcG9seVBvaW50cywgcG9pbnQyKSB7XG4gIHZhciB4MSA9IG5vZGUueDtcbiAgdmFyIHkxID0gbm9kZS55O1xuICB2YXIgaW50ZXJzZWN0aW9ucyA9IFtdO1xuICB2YXIgbWluWCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgdmFyIG1pblkgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFk7XG4gIGlmICh0eXBlb2YgcG9seVBvaW50cy5mb3JFYWNoID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBwb2x5UG9pbnRzLmZvckVhY2goZnVuY3Rpb24oZW50cnkpIHtcbiAgICAgIG1pblggPSBNYXRoLm1pbihtaW5YLCBlbnRyeS54KTtcbiAgICAgIG1pblkgPSBNYXRoLm1pbihtaW5ZLCBlbnRyeS55KTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBtaW5YID0gTWF0aC5taW4obWluWCwgcG9seVBvaW50cy54KTtcbiAgICBtaW5ZID0gTWF0aC5taW4obWluWSwgcG9seVBvaW50cy55KTtcbiAgfVxuICB2YXIgbGVmdCA9IHgxIC0gbm9kZS53aWR0aCAvIDIgLSBtaW5YO1xuICB2YXIgdG9wID0geTEgLSBub2RlLmhlaWdodCAvIDIgLSBtaW5ZO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHBvbHlQb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcDEgPSBwb2x5UG9pbnRzW2ldO1xuICAgIHZhciBwMiA9IHBvbHlQb2ludHNbaSA8IHBvbHlQb2ludHMubGVuZ3RoIC0gMSA/IGkgKyAxIDogMF07XG4gICAgdmFyIGludGVyc2VjdCA9IGludGVyc2VjdF9saW5lX2RlZmF1bHQoXG4gICAgICBub2RlLFxuICAgICAgcG9pbnQyLFxuICAgICAgeyB4OiBsZWZ0ICsgcDEueCwgeTogdG9wICsgcDEueSB9LFxuICAgICAgeyB4OiBsZWZ0ICsgcDIueCwgeTogdG9wICsgcDIueSB9XG4gICAgKTtcbiAgICBpZiAoaW50ZXJzZWN0KSB7XG4gICAgICBpbnRlcnNlY3Rpb25zLnB1c2goaW50ZXJzZWN0KTtcbiAgICB9XG4gIH1cbiAgaWYgKCFpbnRlcnNlY3Rpb25zLmxlbmd0aCkge1xuICAgIHJldHVybiBub2RlO1xuICB9XG4gIGlmIChpbnRlcnNlY3Rpb25zLmxlbmd0aCA+IDEpIHtcbiAgICBpbnRlcnNlY3Rpb25zLnNvcnQoZnVuY3Rpb24ocCwgcSkge1xuICAgICAgdmFyIHBkeCA9IHAueCAtIHBvaW50Mi54O1xuICAgICAgdmFyIHBkeSA9IHAueSAtIHBvaW50Mi55O1xuICAgICAgdmFyIGRpc3RwID0gTWF0aC5zcXJ0KHBkeCAqIHBkeCArIHBkeSAqIHBkeSk7XG4gICAgICB2YXIgcWR4ID0gcS54IC0gcG9pbnQyLng7XG4gICAgICB2YXIgcWR5ID0gcS55IC0gcG9pbnQyLnk7XG4gICAgICB2YXIgZGlzdHEgPSBNYXRoLnNxcnQocWR4ICogcWR4ICsgcWR5ICogcWR5KTtcbiAgICAgIHJldHVybiBkaXN0cCA8IGRpc3RxID8gLTEgOiBkaXN0cCA9PT0gZGlzdHEgPyAwIDogMTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gaW50ZXJzZWN0aW9uc1swXTtcbn1cbl9fbmFtZShpbnRlcnNlY3RQb2x5Z29uLCBcImludGVyc2VjdFBvbHlnb25cIik7XG5cbi8vIHNyYy9kYWdyZS13cmFwcGVyL2ludGVyc2VjdC9pbnRlcnNlY3QtcmVjdC5qc1xudmFyIGludGVyc2VjdFJlY3QgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChub2RlLCBwb2ludDIpID0+IHtcbiAgdmFyIHggPSBub2RlLng7XG4gIHZhciB5ID0gbm9kZS55O1xuICB2YXIgZHggPSBwb2ludDIueCAtIHg7XG4gIHZhciBkeSA9IHBvaW50Mi55IC0geTtcbiAgdmFyIHcgPSBub2RlLndpZHRoIC8gMjtcbiAgdmFyIGggPSBub2RlLmhlaWdodCAvIDI7XG4gIHZhciBzeCwgc3k7XG4gIGlmIChNYXRoLmFicyhkeSkgKiB3ID4gTWF0aC5hYnMoZHgpICogaCkge1xuICAgIGlmIChkeSA8IDApIHtcbiAgICAgIGggPSAtaDtcbiAgICB9XG4gICAgc3ggPSBkeSA9PT0gMCA/IDAgOiBoICogZHggLyBkeTtcbiAgICBzeSA9IGg7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGR4IDwgMCkge1xuICAgICAgdyA9IC13O1xuICAgIH1cbiAgICBzeCA9IHc7XG4gICAgc3kgPSBkeCA9PT0gMCA/IDAgOiB3ICogZHkgLyBkeDtcbiAgfVxuICByZXR1cm4geyB4OiB4ICsgc3gsIHk6IHkgKyBzeSB9O1xufSwgXCJpbnRlcnNlY3RSZWN0XCIpO1xudmFyIGludGVyc2VjdF9yZWN0X2RlZmF1bHQgPSBpbnRlcnNlY3RSZWN0O1xuXG4vLyBzcmMvZGFncmUtd3JhcHBlci9pbnRlcnNlY3QvaW5kZXguanNcbnZhciBpbnRlcnNlY3RfZGVmYXVsdCA9IHtcbiAgbm9kZTogaW50ZXJzZWN0X25vZGVfZGVmYXVsdCxcbiAgY2lyY2xlOiBpbnRlcnNlY3RfY2lyY2xlX2RlZmF1bHQsXG4gIGVsbGlwc2U6IGludGVyc2VjdF9lbGxpcHNlX2RlZmF1bHQsXG4gIHBvbHlnb246IGludGVyc2VjdF9wb2x5Z29uX2RlZmF1bHQsXG4gIHJlY3Q6IGludGVyc2VjdF9yZWN0X2RlZmF1bHRcbn07XG5cbi8vIHNyYy9kYWdyZS13cmFwcGVyL3NoYXBlcy91dGlsLmpzXG5pbXBvcnQgeyBzZWxlY3QgYXMgc2VsZWN0MiB9IGZyb20gXCJkM1wiO1xudmFyIGxhYmVsSGVscGVyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAocGFyZW50LCBub2RlLCBfY2xhc3NlcywgaXNOb2RlKSA9PiB7XG4gIGNvbnN0IGNvbmZpZzIgPSBnZXRDb25maWcyKCk7XG4gIGxldCBjbGFzc2VzMjtcbiAgY29uc3QgdXNlSHRtbExhYmVscyA9IG5vZGUudXNlSHRtbExhYmVscyB8fCBnZXRFZmZlY3RpdmVIdG1sTGFiZWxzKGNvbmZpZzIpO1xuICBpZiAoIV9jbGFzc2VzKSB7XG4gICAgY2xhc3NlczIgPSBcIm5vZGUgZGVmYXVsdFwiO1xuICB9IGVsc2Uge1xuICAgIGNsYXNzZXMyID0gX2NsYXNzZXM7XG4gIH1cbiAgY29uc3Qgc2hhcGVTdmcgPSBwYXJlbnQuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgY2xhc3NlczIpLmF0dHIoXCJpZFwiLCBub2RlLmRvbUlkIHx8IG5vZGUuaWQpO1xuICBjb25zdCBsYWJlbCA9IHNoYXBlU3ZnLmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIFwibGFiZWxcIikuYXR0cihcInN0eWxlXCIsIG5vZGUubGFiZWxTdHlsZSk7XG4gIGxldCBsYWJlbFRleHQ7XG4gIGlmIChub2RlLmxhYmVsVGV4dCA9PT0gdm9pZCAwKSB7XG4gICAgbGFiZWxUZXh0ID0gXCJcIjtcbiAgfSBlbHNlIHtcbiAgICBsYWJlbFRleHQgPSB0eXBlb2Ygbm9kZS5sYWJlbFRleHQgPT09IFwic3RyaW5nXCIgPyBub2RlLmxhYmVsVGV4dCA6IG5vZGUubGFiZWxUZXh0WzBdO1xuICB9XG4gIGxldCB0ZXh0O1xuICBpZiAobm9kZS5sYWJlbFR5cGUgPT09IFwibWFya2Rvd25cIikge1xuICAgIHRleHQgPSBjcmVhdGVUZXh0KFxuICAgICAgbGFiZWwsXG4gICAgICBzYW5pdGl6ZVRleHQoZGVjb2RlRW50aXRpZXMobGFiZWxUZXh0KSwgY29uZmlnMiksXG4gICAgICB7XG4gICAgICAgIHVzZUh0bWxMYWJlbHMsXG4gICAgICAgIHdpZHRoOiBub2RlLndpZHRoIHx8IGNvbmZpZzIuZmxvd2NoYXJ0LndyYXBwaW5nV2lkdGgsXG4gICAgICAgIGNsYXNzZXM6IFwibWFya2Rvd24tbm9kZS1sYWJlbFwiXG4gICAgICB9LFxuICAgICAgY29uZmlnMlxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgdGV4dCA9IGF3YWl0IGNyZWF0ZUxhYmVsX2RlZmF1bHQoXG4gICAgICBsYWJlbCxcbiAgICAgIHNhbml0aXplVGV4dChkZWNvZGVFbnRpdGllcyhsYWJlbFRleHQpLCBjb25maWcyKSxcbiAgICAgIG5vZGUubGFiZWxTdHlsZSxcbiAgICAgIGZhbHNlLFxuICAgICAgaXNOb2RlXG4gICAgKTtcbiAgfVxuICBsZXQgYmJveCA9IHRleHQuZ2V0QkJveCgpO1xuICBjb25zdCBoYWxmUGFkZGluZyA9IG5vZGUucGFkZGluZyAvIDI7XG4gIGlmIChnZXRFZmZlY3RpdmVIdG1sTGFiZWxzKGNvbmZpZzIpKSB7XG4gICAgY29uc3QgZGl2ID0gdGV4dC5jaGlsZHJlblswXTtcbiAgICBjb25zdCBkdiA9IHNlbGVjdDIodGV4dCk7XG4gICAgYXdhaXQgY29uZmlndXJlTGFiZWxJbWFnZXMoZGl2LCBsYWJlbFRleHQpO1xuICAgIGJib3ggPSBkaXYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgZHYuYXR0cihcIndpZHRoXCIsIGJib3gud2lkdGgpO1xuICAgIGR2LmF0dHIoXCJoZWlnaHRcIiwgYmJveC5oZWlnaHQpO1xuICB9XG4gIGlmICh1c2VIdG1sTGFiZWxzKSB7XG4gICAgbGFiZWwuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIC1iYm94LndpZHRoIC8gMiArIFwiLCBcIiArIC1iYm94LmhlaWdodCAvIDIgKyBcIilcIik7XG4gIH0gZWxzZSB7XG4gICAgbGFiZWwuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLCBcIiArIC1iYm94LmhlaWdodCAvIDIgKyBcIilcIik7XG4gIH1cbiAgaWYgKG5vZGUuY2VudGVyTGFiZWwpIHtcbiAgICBsYWJlbC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgLWJib3gud2lkdGggLyAyICsgXCIsIFwiICsgLWJib3guaGVpZ2h0IC8gMiArIFwiKVwiKTtcbiAgfVxuICBsYWJlbC5pbnNlcnQoXCJyZWN0XCIsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICByZXR1cm4geyBzaGFwZVN2ZywgYmJveCwgaGFsZlBhZGRpbmcsIGxhYmVsIH07XG59LCBcImxhYmVsSGVscGVyXCIpO1xudmFyIHVwZGF0ZU5vZGVCb3VuZHMgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChub2RlLCBlbGVtZW50KSA9PiB7XG4gIGNvbnN0IGJib3ggPSBlbGVtZW50Lm5vZGUoKS5nZXRCQm94KCk7XG4gIG5vZGUud2lkdGggPSBiYm94LndpZHRoO1xuICBub2RlLmhlaWdodCA9IGJib3guaGVpZ2h0O1xufSwgXCJ1cGRhdGVOb2RlQm91bmRzXCIpO1xuZnVuY3Rpb24gaW5zZXJ0UG9seWdvblNoYXBlKHBhcmVudCwgdywgaCwgcG9pbnRzKSB7XG4gIHJldHVybiBwYXJlbnQuaW5zZXJ0KFwicG9seWdvblwiLCBcIjpmaXJzdC1jaGlsZFwiKS5hdHRyKFxuICAgIFwicG9pbnRzXCIsXG4gICAgcG9pbnRzLm1hcChmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gZC54ICsgXCIsXCIgKyBkLnk7XG4gICAgfSkuam9pbihcIiBcIilcbiAgKS5hdHRyKFwiY2xhc3NcIiwgXCJsYWJlbC1jb250YWluZXJcIikuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIC13IC8gMiArIFwiLFwiICsgaCAvIDIgKyBcIilcIik7XG59XG5fX25hbWUoaW5zZXJ0UG9seWdvblNoYXBlLCBcImluc2VydFBvbHlnb25TaGFwZVwiKTtcblxuLy8gc3JjL2RhZ3JlLXdyYXBwZXIvc2hhcGVzL25vdGUuanNcbnZhciBub3RlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAocGFyZW50LCBub2RlKSA9PiB7XG4gIGNvbnN0IHVzZUh0bWxMYWJlbHMgPSBub2RlLnVzZUh0bWxMYWJlbHMgfHwgZ2V0RWZmZWN0aXZlSHRtbExhYmVscyhnZXRDb25maWcyKCkpO1xuICBpZiAoIXVzZUh0bWxMYWJlbHMpIHtcbiAgICBub2RlLmNlbnRlckxhYmVsID0gdHJ1ZTtcbiAgfVxuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94LCBoYWxmUGFkZGluZyB9ID0gYXdhaXQgbGFiZWxIZWxwZXIoXG4gICAgcGFyZW50LFxuICAgIG5vZGUsXG4gICAgXCJub2RlIFwiICsgbm9kZS5jbGFzc2VzLFxuICAgIHRydWVcbiAgKTtcbiAgbG9nLmluZm8oXCJDbGFzc2VzID0gXCIsIG5vZGUuY2xhc3Nlcyk7XG4gIGNvbnN0IHJlY3QyID0gc2hhcGVTdmcuaW5zZXJ0KFwicmVjdFwiLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgcmVjdDIuYXR0cihcInJ4XCIsIG5vZGUucngpLmF0dHIoXCJyeVwiLCBub2RlLnJ5KS5hdHRyKFwieFwiLCAtYmJveC53aWR0aCAvIDIgLSBoYWxmUGFkZGluZykuYXR0cihcInlcIiwgLWJib3guaGVpZ2h0IC8gMiAtIGhhbGZQYWRkaW5nKS5hdHRyKFwid2lkdGhcIiwgYmJveC53aWR0aCArIG5vZGUucGFkZGluZykuYXR0cihcImhlaWdodFwiLCBiYm94LmhlaWdodCArIG5vZGUucGFkZGluZyk7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgcmVjdDIpO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50Mikge1xuICAgIHJldHVybiBpbnRlcnNlY3RfZGVmYXVsdC5yZWN0KG5vZGUsIHBvaW50Mik7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn0sIFwibm90ZVwiKTtcbnZhciBub3RlX2RlZmF1bHQgPSBub3RlO1xuXG4vLyBzcmMvZGFncmUtd3JhcHBlci9ub2Rlcy5qc1xudmFyIGZvcm1hdENsYXNzID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgoc3RyKSA9PiB7XG4gIGlmIChzdHIpIHtcbiAgICByZXR1cm4gXCIgXCIgKyBzdHI7XG4gIH1cbiAgcmV0dXJuIFwiXCI7XG59LCBcImZvcm1hdENsYXNzXCIpO1xudmFyIGdldENsYXNzZXNGcm9tTm9kZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKG5vZGUsIG90aGVyQ2xhc3NlcykgPT4ge1xuICByZXR1cm4gYCR7b3RoZXJDbGFzc2VzID8gb3RoZXJDbGFzc2VzIDogXCJub2RlIGRlZmF1bHRcIn0ke2Zvcm1hdENsYXNzKG5vZGUuY2xhc3Nlcyl9ICR7Zm9ybWF0Q2xhc3MoXG4gICAgbm9kZS5jbGFzc1xuICApfWA7XG59LCBcImdldENsYXNzZXNGcm9tTm9kZVwiKTtcbnZhciBxdWVzdGlvbiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgKHBhcmVudCwgbm9kZSkgPT4ge1xuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94IH0gPSBhd2FpdCBsYWJlbEhlbHBlcihcbiAgICBwYXJlbnQsXG4gICAgbm9kZSxcbiAgICBnZXRDbGFzc2VzRnJvbU5vZGUobm9kZSwgdm9pZCAwKSxcbiAgICB0cnVlXG4gICk7XG4gIGNvbnN0IHcgPSBiYm94LndpZHRoICsgbm9kZS5wYWRkaW5nO1xuICBjb25zdCBoID0gYmJveC5oZWlnaHQgKyBub2RlLnBhZGRpbmc7XG4gIGNvbnN0IHMgPSB3ICsgaDtcbiAgY29uc3QgcG9pbnRzID0gW1xuICAgIHsgeDogcyAvIDIsIHk6IDAgfSxcbiAgICB7IHg6IHMsIHk6IC1zIC8gMiB9LFxuICAgIHsgeDogcyAvIDIsIHk6IC1zIH0sXG4gICAgeyB4OiAwLCB5OiAtcyAvIDIgfVxuICBdO1xuICBsb2cuaW5mbyhcIlF1ZXN0aW9uIG1haW4gKENpcmNsZSlcIik7XG4gIGNvbnN0IHF1ZXN0aW9uRWxlbSA9IGluc2VydFBvbHlnb25TaGFwZShzaGFwZVN2ZywgcywgcywgcG9pbnRzKTtcbiAgcXVlc3Rpb25FbGVtLmF0dHIoXCJzdHlsZVwiLCBub2RlLnN0eWxlKTtcbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCBxdWVzdGlvbkVsZW0pO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50Mikge1xuICAgIGxvZy53YXJuKFwiSW50ZXJzZWN0IGNhbGxlZFwiKTtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihub2RlLCBwb2ludHMsIHBvaW50Mik7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn0sIFwicXVlc3Rpb25cIik7XG52YXIgY2hvaWNlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgocGFyZW50LCBub2RlKSA9PiB7XG4gIGNvbnN0IHNoYXBlU3ZnID0gcGFyZW50Lmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIFwibm9kZSBkZWZhdWx0XCIpLmF0dHIoXCJpZFwiLCBub2RlLmRvbUlkIHx8IG5vZGUuaWQpO1xuICBjb25zdCBzID0gMjg7XG4gIGNvbnN0IHBvaW50cyA9IFtcbiAgICB7IHg6IDAsIHk6IHMgLyAyIH0sXG4gICAgeyB4OiBzIC8gMiwgeTogMCB9LFxuICAgIHsgeDogMCwgeTogLXMgLyAyIH0sXG4gICAgeyB4OiAtcyAvIDIsIHk6IDAgfVxuICBdO1xuICBjb25zdCBjaG9pY2UyID0gc2hhcGVTdmcuaW5zZXJ0KFwicG9seWdvblwiLCBcIjpmaXJzdC1jaGlsZFwiKS5hdHRyKFxuICAgIFwicG9pbnRzXCIsXG4gICAgcG9pbnRzLm1hcChmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gZC54ICsgXCIsXCIgKyBkLnk7XG4gICAgfSkuam9pbihcIiBcIilcbiAgKTtcbiAgY2hvaWNlMi5hdHRyKFwiY2xhc3NcIiwgXCJzdGF0ZS1zdGFydFwiKS5hdHRyKFwiclwiLCA3KS5hdHRyKFwid2lkdGhcIiwgMjgpLmF0dHIoXCJoZWlnaHRcIiwgMjgpO1xuICBub2RlLndpZHRoID0gMjg7XG4gIG5vZGUuaGVpZ2h0ID0gMjg7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQyKSB7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LmNpcmNsZShub2RlLCAxNCwgcG9pbnQyKTtcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufSwgXCJjaG9pY2VcIik7XG52YXIgaGV4YWdvbiA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgKHBhcmVudCwgbm9kZSkgPT4ge1xuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94IH0gPSBhd2FpdCBsYWJlbEhlbHBlcihcbiAgICBwYXJlbnQsXG4gICAgbm9kZSxcbiAgICBnZXRDbGFzc2VzRnJvbU5vZGUobm9kZSwgdm9pZCAwKSxcbiAgICB0cnVlXG4gICk7XG4gIGNvbnN0IGYgPSA0O1xuICBjb25zdCBoID0gbm9kZS5wb3NpdGlvbmVkID8gbm9kZS5oZWlnaHQgOiBiYm94LmhlaWdodCArIG5vZGUucGFkZGluZztcbiAgY29uc3QgbSA9IGggLyBmO1xuICBjb25zdCB3ID0gbm9kZS5wb3NpdGlvbmVkID8gbm9kZS53aWR0aCA6IGJib3gud2lkdGggKyAyICogbSArIG5vZGUucGFkZGluZztcbiAgY29uc3QgcG9pbnRzID0gW1xuICAgIHsgeDogbSwgeTogMCB9LFxuICAgIHsgeDogdyAtIG0sIHk6IDAgfSxcbiAgICB7IHg6IHcsIHk6IC1oIC8gMiB9LFxuICAgIHsgeDogdyAtIG0sIHk6IC1oIH0sXG4gICAgeyB4OiBtLCB5OiAtaCB9LFxuICAgIHsgeDogMCwgeTogLWggLyAyIH1cbiAgXTtcbiAgY29uc3QgaGV4ID0gaW5zZXJ0UG9seWdvblNoYXBlKHNoYXBlU3ZnLCB3LCBoLCBwb2ludHMpO1xuICBoZXguYXR0cihcInN0eWxlXCIsIG5vZGUuc3R5bGUpO1xuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIGhleCk7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQyKSB7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnBvbHlnb24obm9kZSwgcG9pbnRzLCBwb2ludDIpO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59LCBcImhleGFnb25cIik7XG52YXIgYmxvY2tfYXJyb3cgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGFzeW5jIChwYXJlbnQsIG5vZGUpID0+IHtcbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCB9ID0gYXdhaXQgbGFiZWxIZWxwZXIocGFyZW50LCBub2RlLCB2b2lkIDAsIHRydWUpO1xuICBjb25zdCBmID0gMjtcbiAgY29uc3QgaCA9IGJib3guaGVpZ2h0ICsgMiAqIG5vZGUucGFkZGluZztcbiAgY29uc3QgbSA9IGggLyBmO1xuICBjb25zdCBuYXR1cmFsVyA9IGJib3gud2lkdGggKyAyICogbSArIG5vZGUucGFkZGluZztcbiAgY29uc3QgaXNTcGFubmluZyA9IG5vZGUucG9zaXRpb25lZCAmJiAobm9kZS53aWR0aEluQ29sdW1ucyA/PyAxKSA+IDEgJiYgbm9kZS53aWR0aCA+IG5hdHVyYWxXO1xuICBjb25zdCB3ID0gaXNTcGFubmluZyA/IG5vZGUud2lkdGggOiBuYXR1cmFsVztcbiAgY29uc3QgcG9pbnRzID0gZ2V0QXJyb3dQb2ludHMobm9kZS5kaXJlY3Rpb25zLCBiYm94LCBub2RlLCB3KTtcbiAgY29uc3QgYmxvY2tBcnJvdyA9IGluc2VydFBvbHlnb25TaGFwZShzaGFwZVN2ZywgdywgaCwgcG9pbnRzKTtcbiAgYmxvY2tBcnJvdy5hdHRyKFwic3R5bGVcIiwgbm9kZS5zdHlsZSk7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgYmxvY2tBcnJvdyk7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQyKSB7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnBvbHlnb24obm9kZSwgcG9pbnRzLCBwb2ludDIpO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59LCBcImJsb2NrX2Fycm93XCIpO1xudmFyIHJlY3RfbGVmdF9pbnZfYXJyb3cgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGFzeW5jIChwYXJlbnQsIG5vZGUpID0+IHtcbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCB9ID0gYXdhaXQgbGFiZWxIZWxwZXIoXG4gICAgcGFyZW50LFxuICAgIG5vZGUsXG4gICAgZ2V0Q2xhc3Nlc0Zyb21Ob2RlKG5vZGUsIHZvaWQgMCksXG4gICAgdHJ1ZVxuICApO1xuICBjb25zdCB3ID0gYmJveC53aWR0aCArIG5vZGUucGFkZGluZztcbiAgY29uc3QgaCA9IGJib3guaGVpZ2h0ICsgbm9kZS5wYWRkaW5nO1xuICBjb25zdCBwb2ludHMgPSBbXG4gICAgeyB4OiAtaCAvIDIsIHk6IDAgfSxcbiAgICB7IHg6IHcsIHk6IDAgfSxcbiAgICB7IHg6IHcsIHk6IC1oIH0sXG4gICAgeyB4OiAtaCAvIDIsIHk6IC1oIH0sXG4gICAgeyB4OiAwLCB5OiAtaCAvIDIgfVxuICBdO1xuICBjb25zdCBlbCA9IGluc2VydFBvbHlnb25TaGFwZShzaGFwZVN2ZywgdywgaCwgcG9pbnRzKTtcbiAgZWwuYXR0cihcInN0eWxlXCIsIG5vZGUuc3R5bGUpO1xuICBub2RlLndpZHRoID0gdyArIGg7XG4gIG5vZGUuaGVpZ2h0ID0gaDtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludDIpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihub2RlLCBwb2ludHMsIHBvaW50Mik7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn0sIFwicmVjdF9sZWZ0X2ludl9hcnJvd1wiKTtcbnZhciBsZWFuX3JpZ2h0ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAocGFyZW50LCBub2RlKSA9PiB7XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3ggfSA9IGF3YWl0IGxhYmVsSGVscGVyKHBhcmVudCwgbm9kZSwgZ2V0Q2xhc3Nlc0Zyb21Ob2RlKG5vZGUpLCB0cnVlKTtcbiAgY29uc3QgdyA9IGJib3gud2lkdGggKyBub2RlLnBhZGRpbmc7XG4gIGNvbnN0IGggPSBiYm94LmhlaWdodCArIG5vZGUucGFkZGluZztcbiAgY29uc3QgcG9pbnRzID0gW1xuICAgIHsgeDogLTIgKiBoIC8gNiwgeTogMCB9LFxuICAgIHsgeDogdyAtIGggLyA2LCB5OiAwIH0sXG4gICAgeyB4OiB3ICsgMiAqIGggLyA2LCB5OiAtaCB9LFxuICAgIHsgeDogaCAvIDYsIHk6IC1oIH1cbiAgXTtcbiAgY29uc3QgZWwgPSBpbnNlcnRQb2x5Z29uU2hhcGUoc2hhcGVTdmcsIHcsIGgsIHBvaW50cyk7XG4gIGVsLmF0dHIoXCJzdHlsZVwiLCBub2RlLnN0eWxlKTtcbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCBlbCk7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQyKSB7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnBvbHlnb24obm9kZSwgcG9pbnRzLCBwb2ludDIpO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59LCBcImxlYW5fcmlnaHRcIik7XG52YXIgbGVhbl9sZWZ0ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAocGFyZW50LCBub2RlKSA9PiB7XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3ggfSA9IGF3YWl0IGxhYmVsSGVscGVyKFxuICAgIHBhcmVudCxcbiAgICBub2RlLFxuICAgIGdldENsYXNzZXNGcm9tTm9kZShub2RlLCB2b2lkIDApLFxuICAgIHRydWVcbiAgKTtcbiAgY29uc3QgdyA9IGJib3gud2lkdGggKyBub2RlLnBhZGRpbmc7XG4gIGNvbnN0IGggPSBiYm94LmhlaWdodCArIG5vZGUucGFkZGluZztcbiAgY29uc3QgcG9pbnRzID0gW1xuICAgIHsgeDogMiAqIGggLyA2LCB5OiAwIH0sXG4gICAgeyB4OiB3ICsgaCAvIDYsIHk6IDAgfSxcbiAgICB7IHg6IHcgLSAyICogaCAvIDYsIHk6IC1oIH0sXG4gICAgeyB4OiAtaCAvIDYsIHk6IC1oIH1cbiAgXTtcbiAgY29uc3QgZWwgPSBpbnNlcnRQb2x5Z29uU2hhcGUoc2hhcGVTdmcsIHcsIGgsIHBvaW50cyk7XG4gIGVsLmF0dHIoXCJzdHlsZVwiLCBub2RlLnN0eWxlKTtcbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCBlbCk7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQyKSB7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnBvbHlnb24obm9kZSwgcG9pbnRzLCBwb2ludDIpO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59LCBcImxlYW5fbGVmdFwiKTtcbnZhciB0cmFwZXpvaWQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGFzeW5jIChwYXJlbnQsIG5vZGUpID0+IHtcbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCB9ID0gYXdhaXQgbGFiZWxIZWxwZXIoXG4gICAgcGFyZW50LFxuICAgIG5vZGUsXG4gICAgZ2V0Q2xhc3Nlc0Zyb21Ob2RlKG5vZGUsIHZvaWQgMCksXG4gICAgdHJ1ZVxuICApO1xuICBjb25zdCB3ID0gYmJveC53aWR0aCArIG5vZGUucGFkZGluZztcbiAgY29uc3QgaCA9IGJib3guaGVpZ2h0ICsgbm9kZS5wYWRkaW5nO1xuICBjb25zdCBwb2ludHMgPSBbXG4gICAgeyB4OiAtMiAqIGggLyA2LCB5OiAwIH0sXG4gICAgeyB4OiB3ICsgMiAqIGggLyA2LCB5OiAwIH0sXG4gICAgeyB4OiB3IC0gaCAvIDYsIHk6IC1oIH0sXG4gICAgeyB4OiBoIC8gNiwgeTogLWggfVxuICBdO1xuICBjb25zdCBlbCA9IGluc2VydFBvbHlnb25TaGFwZShzaGFwZVN2ZywgdywgaCwgcG9pbnRzKTtcbiAgZWwuYXR0cihcInN0eWxlXCIsIG5vZGUuc3R5bGUpO1xuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIGVsKTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludDIpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihub2RlLCBwb2ludHMsIHBvaW50Mik7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn0sIFwidHJhcGV6b2lkXCIpO1xudmFyIGludl90cmFwZXpvaWQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGFzeW5jIChwYXJlbnQsIG5vZGUpID0+IHtcbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCB9ID0gYXdhaXQgbGFiZWxIZWxwZXIoXG4gICAgcGFyZW50LFxuICAgIG5vZGUsXG4gICAgZ2V0Q2xhc3Nlc0Zyb21Ob2RlKG5vZGUsIHZvaWQgMCksXG4gICAgdHJ1ZVxuICApO1xuICBjb25zdCB3ID0gYmJveC53aWR0aCArIG5vZGUucGFkZGluZztcbiAgY29uc3QgaCA9IGJib3guaGVpZ2h0ICsgbm9kZS5wYWRkaW5nO1xuICBjb25zdCBwb2ludHMgPSBbXG4gICAgeyB4OiBoIC8gNiwgeTogMCB9LFxuICAgIHsgeDogdyAtIGggLyA2LCB5OiAwIH0sXG4gICAgeyB4OiB3ICsgMiAqIGggLyA2LCB5OiAtaCB9LFxuICAgIHsgeDogLTIgKiBoIC8gNiwgeTogLWggfVxuICBdO1xuICBjb25zdCBlbCA9IGluc2VydFBvbHlnb25TaGFwZShzaGFwZVN2ZywgdywgaCwgcG9pbnRzKTtcbiAgZWwuYXR0cihcInN0eWxlXCIsIG5vZGUuc3R5bGUpO1xuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIGVsKTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludDIpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucG9seWdvbihub2RlLCBwb2ludHMsIHBvaW50Mik7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn0sIFwiaW52X3RyYXBlem9pZFwiKTtcbnZhciByZWN0X3JpZ2h0X2ludl9hcnJvdyA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgKHBhcmVudCwgbm9kZSkgPT4ge1xuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94IH0gPSBhd2FpdCBsYWJlbEhlbHBlcihcbiAgICBwYXJlbnQsXG4gICAgbm9kZSxcbiAgICBnZXRDbGFzc2VzRnJvbU5vZGUobm9kZSwgdm9pZCAwKSxcbiAgICB0cnVlXG4gICk7XG4gIGNvbnN0IHcgPSBiYm94LndpZHRoICsgbm9kZS5wYWRkaW5nO1xuICBjb25zdCBoID0gYmJveC5oZWlnaHQgKyBub2RlLnBhZGRpbmc7XG4gIGNvbnN0IHBvaW50cyA9IFtcbiAgICB7IHg6IDAsIHk6IDAgfSxcbiAgICB7IHg6IHcgKyBoIC8gMiwgeTogMCB9LFxuICAgIHsgeDogdywgeTogLWggLyAyIH0sXG4gICAgeyB4OiB3ICsgaCAvIDIsIHk6IC1oIH0sXG4gICAgeyB4OiAwLCB5OiAtaCB9XG4gIF07XG4gIGNvbnN0IGVsID0gaW5zZXJ0UG9seWdvblNoYXBlKHNoYXBlU3ZnLCB3LCBoLCBwb2ludHMpO1xuICBlbC5hdHRyKFwic3R5bGVcIiwgbm9kZS5zdHlsZSk7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgZWwpO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50Mikge1xuICAgIHJldHVybiBpbnRlcnNlY3RfZGVmYXVsdC5wb2x5Z29uKG5vZGUsIHBvaW50cywgcG9pbnQyKTtcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufSwgXCJyZWN0X3JpZ2h0X2ludl9hcnJvd1wiKTtcbnZhciBjeWxpbmRlciA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgKHBhcmVudCwgbm9kZSkgPT4ge1xuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94IH0gPSBhd2FpdCBsYWJlbEhlbHBlcihcbiAgICBwYXJlbnQsXG4gICAgbm9kZSxcbiAgICBnZXRDbGFzc2VzRnJvbU5vZGUobm9kZSwgdm9pZCAwKSxcbiAgICB0cnVlXG4gICk7XG4gIGNvbnN0IHcgPSBiYm94LndpZHRoICsgbm9kZS5wYWRkaW5nO1xuICBjb25zdCByeCA9IHcgLyAyO1xuICBjb25zdCByeSA9IHJ4IC8gKDIuNSArIHcgLyA1MCk7XG4gIGNvbnN0IGggPSBiYm94LmhlaWdodCArIHJ5ICsgbm9kZS5wYWRkaW5nO1xuICBjb25zdCBzaGFwZSA9IFwiTSAwLFwiICsgcnkgKyBcIiBhIFwiICsgcnggKyBcIixcIiArIHJ5ICsgXCIgMCwwLDAgXCIgKyB3ICsgXCIgMCBhIFwiICsgcnggKyBcIixcIiArIHJ5ICsgXCIgMCwwLDAgXCIgKyAtdyArIFwiIDAgbCAwLFwiICsgaCArIFwiIGEgXCIgKyByeCArIFwiLFwiICsgcnkgKyBcIiAwLDAsMCBcIiArIHcgKyBcIiAwIGwgMCxcIiArIC1oO1xuICBjb25zdCBlbCA9IHNoYXBlU3ZnLmF0dHIoXCJsYWJlbC1vZmZzZXQteVwiLCByeSkuaW5zZXJ0KFwicGF0aFwiLCBcIjpmaXJzdC1jaGlsZFwiKS5hdHRyKFwic3R5bGVcIiwgbm9kZS5zdHlsZSkuYXR0cihcImRcIiwgc2hhcGUpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyAtdyAvIDIgKyBcIixcIiArIC0oaCAvIDIgKyByeSkgKyBcIilcIik7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgZWwpO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50Mikge1xuICAgIGNvbnN0IHBvcyA9IGludGVyc2VjdF9kZWZhdWx0LnJlY3Qobm9kZSwgcG9pbnQyKTtcbiAgICBjb25zdCB4ID0gcG9zLnggLSBub2RlLng7XG4gICAgaWYgKHJ4ICE9IDAgJiYgKE1hdGguYWJzKHgpIDwgbm9kZS53aWR0aCAvIDIgfHwgTWF0aC5hYnMoeCkgPT0gbm9kZS53aWR0aCAvIDIgJiYgTWF0aC5hYnMocG9zLnkgLSBub2RlLnkpID4gbm9kZS5oZWlnaHQgLyAyIC0gcnkpKSB7XG4gICAgICBsZXQgeSA9IHJ5ICogcnkgKiAoMSAtIHggKiB4IC8gKHJ4ICogcngpKTtcbiAgICAgIGlmICh5ICE9IDApIHtcbiAgICAgICAgeSA9IE1hdGguc3FydCh5KTtcbiAgICAgIH1cbiAgICAgIHkgPSByeSAtIHk7XG4gICAgICBpZiAocG9pbnQyLnkgLSBub2RlLnkgPiAwKSB7XG4gICAgICAgIHkgPSAteTtcbiAgICAgIH1cbiAgICAgIHBvcy55ICs9IHk7XG4gICAgfVxuICAgIHJldHVybiBwb3M7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn0sIFwiY3lsaW5kZXJcIik7XG52YXIgcmVjdCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgKHBhcmVudCwgbm9kZSkgPT4ge1xuICBjb25zdCB7IHNoYXBlU3ZnLCBiYm94LCBoYWxmUGFkZGluZyB9ID0gYXdhaXQgbGFiZWxIZWxwZXIoXG4gICAgcGFyZW50LFxuICAgIG5vZGUsXG4gICAgXCJub2RlIFwiICsgbm9kZS5jbGFzc2VzICsgXCIgXCIgKyBub2RlLmNsYXNzLFxuICAgIHRydWVcbiAgKTtcbiAgY29uc3QgcmVjdDIgPSBzaGFwZVN2Zy5pbnNlcnQoXCJyZWN0XCIsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICBjb25zdCB0b3RhbFdpZHRoID0gbm9kZS5wb3NpdGlvbmVkID8gbm9kZS53aWR0aCA6IGJib3gud2lkdGggKyBub2RlLnBhZGRpbmc7XG4gIGNvbnN0IHRvdGFsSGVpZ2h0ID0gbm9kZS5wb3NpdGlvbmVkID8gbm9kZS5oZWlnaHQgOiBiYm94LmhlaWdodCArIG5vZGUucGFkZGluZztcbiAgY29uc3QgeCA9IG5vZGUucG9zaXRpb25lZCA/IC10b3RhbFdpZHRoIC8gMiA6IC1iYm94LndpZHRoIC8gMiAtIGhhbGZQYWRkaW5nO1xuICBjb25zdCB5ID0gbm9kZS5wb3NpdGlvbmVkID8gLXRvdGFsSGVpZ2h0IC8gMiA6IC1iYm94LmhlaWdodCAvIDIgLSBoYWxmUGFkZGluZztcbiAgcmVjdDIuYXR0cihcImNsYXNzXCIsIFwiYmFzaWMgbGFiZWwtY29udGFpbmVyXCIpLmF0dHIoXCJzdHlsZVwiLCBub2RlLnN0eWxlKS5hdHRyKFwicnhcIiwgbm9kZS5yeCkuYXR0cihcInJ5XCIsIG5vZGUucnkpLmF0dHIoXCJ4XCIsIHgpLmF0dHIoXCJ5XCIsIHkpLmF0dHIoXCJ3aWR0aFwiLCB0b3RhbFdpZHRoKS5hdHRyKFwiaGVpZ2h0XCIsIHRvdGFsSGVpZ2h0KTtcbiAgaWYgKG5vZGUucHJvcHMpIHtcbiAgICBjb25zdCBwcm9wS2V5cyA9IG5ldyBTZXQoT2JqZWN0LmtleXMobm9kZS5wcm9wcykpO1xuICAgIGlmIChub2RlLnByb3BzLmJvcmRlcnMpIHtcbiAgICAgIGFwcGx5Tm9kZVByb3BlcnR5Qm9yZGVycyhyZWN0Miwgbm9kZS5wcm9wcy5ib3JkZXJzLCB0b3RhbFdpZHRoLCB0b3RhbEhlaWdodCk7XG4gICAgICBwcm9wS2V5cy5kZWxldGUoXCJib3JkZXJzXCIpO1xuICAgIH1cbiAgICBwcm9wS2V5cy5mb3JFYWNoKChwcm9wS2V5KSA9PiB7XG4gICAgICBsb2cud2FybihgVW5rbm93biBub2RlIHByb3BlcnR5ICR7cHJvcEtleX1gKTtcbiAgICB9KTtcbiAgfVxuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIHJlY3QyKTtcbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludDIpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0X2RlZmF1bHQucmVjdChub2RlLCBwb2ludDIpO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59LCBcInJlY3RcIik7XG52YXIgY29tcG9zaXRlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAocGFyZW50LCBub2RlKSA9PiB7XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3gsIGhhbGZQYWRkaW5nIH0gPSBhd2FpdCBsYWJlbEhlbHBlcihcbiAgICBwYXJlbnQsXG4gICAgbm9kZSxcbiAgICBcIm5vZGUgXCIgKyBub2RlLmNsYXNzZXMsXG4gICAgdHJ1ZVxuICApO1xuICBjb25zdCByZWN0MiA9IHNoYXBlU3ZnLmluc2VydChcInJlY3RcIiwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gIGNvbnN0IHRvdGFsV2lkdGggPSBub2RlLnBvc2l0aW9uZWQgPyBub2RlLndpZHRoIDogYmJveC53aWR0aCArIG5vZGUucGFkZGluZztcbiAgY29uc3QgdG90YWxIZWlnaHQgPSBub2RlLnBvc2l0aW9uZWQgPyBub2RlLmhlaWdodCA6IGJib3guaGVpZ2h0ICsgbm9kZS5wYWRkaW5nO1xuICBjb25zdCB4ID0gbm9kZS5wb3NpdGlvbmVkID8gLXRvdGFsV2lkdGggLyAyIDogLWJib3gud2lkdGggLyAyIC0gaGFsZlBhZGRpbmc7XG4gIGNvbnN0IHkgPSBub2RlLnBvc2l0aW9uZWQgPyAtdG90YWxIZWlnaHQgLyAyIDogLWJib3guaGVpZ2h0IC8gMiAtIGhhbGZQYWRkaW5nO1xuICByZWN0Mi5hdHRyKFwiY2xhc3NcIiwgXCJiYXNpYyBjbHVzdGVyIGNvbXBvc2l0ZSBsYWJlbC1jb250YWluZXJcIikuYXR0cihcInN0eWxlXCIsIG5vZGUuc3R5bGUpLmF0dHIoXCJyeFwiLCBub2RlLnJ4KS5hdHRyKFwicnlcIiwgbm9kZS5yeSkuYXR0cihcInhcIiwgeCkuYXR0cihcInlcIiwgeSkuYXR0cihcIndpZHRoXCIsIHRvdGFsV2lkdGgpLmF0dHIoXCJoZWlnaHRcIiwgdG90YWxIZWlnaHQpO1xuICBpZiAobm9kZS5wcm9wcykge1xuICAgIGNvbnN0IHByb3BLZXlzID0gbmV3IFNldChPYmplY3Qua2V5cyhub2RlLnByb3BzKSk7XG4gICAgaWYgKG5vZGUucHJvcHMuYm9yZGVycykge1xuICAgICAgYXBwbHlOb2RlUHJvcGVydHlCb3JkZXJzKHJlY3QyLCBub2RlLnByb3BzLmJvcmRlcnMsIHRvdGFsV2lkdGgsIHRvdGFsSGVpZ2h0KTtcbiAgICAgIHByb3BLZXlzLmRlbGV0ZShcImJvcmRlcnNcIik7XG4gICAgfVxuICAgIHByb3BLZXlzLmZvckVhY2goKHByb3BLZXkpID0+IHtcbiAgICAgIGxvZy53YXJuKGBVbmtub3duIG5vZGUgcHJvcGVydHkgJHtwcm9wS2V5fWApO1xuICAgIH0pO1xuICB9XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgcmVjdDIpO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50Mikge1xuICAgIHJldHVybiBpbnRlcnNlY3RfZGVmYXVsdC5yZWN0KG5vZGUsIHBvaW50Mik7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn0sIFwiY29tcG9zaXRlXCIpO1xudmFyIGxhYmVsUmVjdCA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgKHBhcmVudCwgbm9kZSkgPT4ge1xuICBjb25zdCB7IHNoYXBlU3ZnIH0gPSBhd2FpdCBsYWJlbEhlbHBlcihwYXJlbnQsIG5vZGUsIFwibGFiZWxcIiwgdHJ1ZSk7XG4gIGxvZy50cmFjZShcIkNsYXNzZXMgPSBcIiwgbm9kZS5jbGFzcyk7XG4gIGNvbnN0IHJlY3QyID0gc2hhcGVTdmcuaW5zZXJ0KFwicmVjdFwiLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgY29uc3QgdG90YWxXaWR0aCA9IDA7XG4gIGNvbnN0IHRvdGFsSGVpZ2h0ID0gMDtcbiAgcmVjdDIuYXR0cihcIndpZHRoXCIsIHRvdGFsV2lkdGgpLmF0dHIoXCJoZWlnaHRcIiwgdG90YWxIZWlnaHQpO1xuICBzaGFwZVN2Zy5hdHRyKFwiY2xhc3NcIiwgXCJsYWJlbCBlZGdlTGFiZWxcIik7XG4gIGlmIChub2RlLnByb3BzKSB7XG4gICAgY29uc3QgcHJvcEtleXMgPSBuZXcgU2V0KE9iamVjdC5rZXlzKG5vZGUucHJvcHMpKTtcbiAgICBpZiAobm9kZS5wcm9wcy5ib3JkZXJzKSB7XG4gICAgICBhcHBseU5vZGVQcm9wZXJ0eUJvcmRlcnMocmVjdDIsIG5vZGUucHJvcHMuYm9yZGVycywgdG90YWxXaWR0aCwgdG90YWxIZWlnaHQpO1xuICAgICAgcHJvcEtleXMuZGVsZXRlKFwiYm9yZGVyc1wiKTtcbiAgICB9XG4gICAgcHJvcEtleXMuZm9yRWFjaCgocHJvcEtleSkgPT4ge1xuICAgICAgbG9nLndhcm4oYFVua25vd24gbm9kZSBwcm9wZXJ0eSAke3Byb3BLZXl9YCk7XG4gICAgfSk7XG4gIH1cbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCByZWN0Mik7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQyKSB7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnJlY3Qobm9kZSwgcG9pbnQyKTtcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufSwgXCJsYWJlbFJlY3RcIik7XG5mdW5jdGlvbiBhcHBseU5vZGVQcm9wZXJ0eUJvcmRlcnMocmVjdDIsIGJvcmRlcnMsIHRvdGFsV2lkdGgsIHRvdGFsSGVpZ2h0KSB7XG4gIGNvbnN0IHN0cm9rZURhc2hBcnJheSA9IFtdO1xuICBjb25zdCBhZGRCb3JkZXIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChsZW5ndGgpID0+IHtcbiAgICBzdHJva2VEYXNoQXJyYXkucHVzaChsZW5ndGgsIDApO1xuICB9LCBcImFkZEJvcmRlclwiKTtcbiAgY29uc3Qgc2tpcEJvcmRlciA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKGxlbmd0aCkgPT4ge1xuICAgIHN0cm9rZURhc2hBcnJheS5wdXNoKDAsIGxlbmd0aCk7XG4gIH0sIFwic2tpcEJvcmRlclwiKTtcbiAgaWYgKGJvcmRlcnMuaW5jbHVkZXMoXCJ0XCIpKSB7XG4gICAgbG9nLmRlYnVnKFwiYWRkIHRvcCBib3JkZXJcIik7XG4gICAgYWRkQm9yZGVyKHRvdGFsV2lkdGgpO1xuICB9IGVsc2Uge1xuICAgIHNraXBCb3JkZXIodG90YWxXaWR0aCk7XG4gIH1cbiAgaWYgKGJvcmRlcnMuaW5jbHVkZXMoXCJyXCIpKSB7XG4gICAgbG9nLmRlYnVnKFwiYWRkIHJpZ2h0IGJvcmRlclwiKTtcbiAgICBhZGRCb3JkZXIodG90YWxIZWlnaHQpO1xuICB9IGVsc2Uge1xuICAgIHNraXBCb3JkZXIodG90YWxIZWlnaHQpO1xuICB9XG4gIGlmIChib3JkZXJzLmluY2x1ZGVzKFwiYlwiKSkge1xuICAgIGxvZy5kZWJ1ZyhcImFkZCBib3R0b20gYm9yZGVyXCIpO1xuICAgIGFkZEJvcmRlcih0b3RhbFdpZHRoKTtcbiAgfSBlbHNlIHtcbiAgICBza2lwQm9yZGVyKHRvdGFsV2lkdGgpO1xuICB9XG4gIGlmIChib3JkZXJzLmluY2x1ZGVzKFwibFwiKSkge1xuICAgIGxvZy5kZWJ1ZyhcImFkZCBsZWZ0IGJvcmRlclwiKTtcbiAgICBhZGRCb3JkZXIodG90YWxIZWlnaHQpO1xuICB9IGVsc2Uge1xuICAgIHNraXBCb3JkZXIodG90YWxIZWlnaHQpO1xuICB9XG4gIHJlY3QyLmF0dHIoXCJzdHJva2UtZGFzaGFycmF5XCIsIHN0cm9rZURhc2hBcnJheS5qb2luKFwiIFwiKSk7XG59XG5fX25hbWUoYXBwbHlOb2RlUHJvcGVydHlCb3JkZXJzLCBcImFwcGx5Tm9kZVByb3BlcnR5Qm9yZGVyc1wiKTtcbnZhciByZWN0V2l0aFRpdGxlID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAocGFyZW50LCBub2RlKSA9PiB7XG4gIGxldCBjbGFzc2VzMjtcbiAgaWYgKCFub2RlLmNsYXNzZXMpIHtcbiAgICBjbGFzc2VzMiA9IFwibm9kZSBkZWZhdWx0XCI7XG4gIH0gZWxzZSB7XG4gICAgY2xhc3NlczIgPSBcIm5vZGUgXCIgKyBub2RlLmNsYXNzZXM7XG4gIH1cbiAgY29uc3Qgc2hhcGVTdmcgPSBwYXJlbnQuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgY2xhc3NlczIpLmF0dHIoXCJpZFwiLCBub2RlLmRvbUlkIHx8IG5vZGUuaWQpO1xuICBjb25zdCByZWN0MiA9IHNoYXBlU3ZnLmluc2VydChcInJlY3RcIiwgXCI6Zmlyc3QtY2hpbGRcIik7XG4gIGNvbnN0IGlubmVyTGluZSA9IHNoYXBlU3ZnLmluc2VydChcImxpbmVcIik7XG4gIGNvbnN0IGxhYmVsID0gc2hhcGVTdmcuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJsYWJlbFwiKTtcbiAgY29uc3QgdGV4dDIgPSBub2RlLmxhYmVsVGV4dC5mbGF0ID8gbm9kZS5sYWJlbFRleHQuZmxhdCgpIDogbm9kZS5sYWJlbFRleHQ7XG4gIGxldCB0aXRsZSA9IFwiXCI7XG4gIGlmICh0eXBlb2YgdGV4dDIgPT09IFwib2JqZWN0XCIpIHtcbiAgICB0aXRsZSA9IHRleHQyWzBdO1xuICB9IGVsc2Uge1xuICAgIHRpdGxlID0gdGV4dDI7XG4gIH1cbiAgbG9nLmluZm8oXCJMYWJlbCB0ZXh0IGFiYzc5XCIsIHRpdGxlLCB0ZXh0MiwgdHlwZW9mIHRleHQyID09PSBcIm9iamVjdFwiKTtcbiAgY29uc3QgdGV4dCA9IGF3YWl0IGNyZWF0ZUxhYmVsX2RlZmF1bHQobGFiZWwsIHRpdGxlLCBub2RlLmxhYmVsU3R5bGUsIHRydWUsIHRydWUpO1xuICBsZXQgYmJveCA9IHsgd2lkdGg6IDAsIGhlaWdodDogMCB9O1xuICBpZiAoZ2V0RWZmZWN0aXZlSHRtbExhYmVscyhnZXRDb25maWcyKCkpKSB7XG4gICAgY29uc3QgZGl2ID0gdGV4dC5jaGlsZHJlblswXTtcbiAgICBjb25zdCBkdiA9IHNlbGVjdDModGV4dCk7XG4gICAgYmJveCA9IGRpdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBkdi5hdHRyKFwid2lkdGhcIiwgYmJveC53aWR0aCk7XG4gICAgZHYuYXR0cihcImhlaWdodFwiLCBiYm94LmhlaWdodCk7XG4gIH1cbiAgbG9nLmluZm8oXCJUZXh0IDJcIiwgdGV4dDIpO1xuICBjb25zdCB0ZXh0Um93cyA9IHRleHQyLnNsaWNlKDEsIHRleHQyLmxlbmd0aCk7XG4gIGxldCB0aXRsZUJveCA9IHRleHQuZ2V0QkJveCgpO1xuICBjb25zdCBkZXNjciA9IGF3YWl0IGNyZWF0ZUxhYmVsX2RlZmF1bHQoXG4gICAgbGFiZWwsXG4gICAgdGV4dFJvd3Muam9pbiA/IHRleHRSb3dzLmpvaW4oXCI8YnIvPlwiKSA6IHRleHRSb3dzLFxuICAgIG5vZGUubGFiZWxTdHlsZSxcbiAgICB0cnVlLFxuICAgIHRydWVcbiAgKTtcbiAgaWYgKGdldEVmZmVjdGl2ZUh0bWxMYWJlbHMoZ2V0Q29uZmlnMigpKSkge1xuICAgIGNvbnN0IGRpdiA9IGRlc2NyLmNoaWxkcmVuWzBdO1xuICAgIGNvbnN0IGR2ID0gc2VsZWN0MyhkZXNjcik7XG4gICAgYmJveCA9IGRpdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBkdi5hdHRyKFwid2lkdGhcIiwgYmJveC53aWR0aCk7XG4gICAgZHYuYXR0cihcImhlaWdodFwiLCBiYm94LmhlaWdodCk7XG4gIH1cbiAgY29uc3QgaGFsZlBhZGRpbmcgPSBub2RlLnBhZGRpbmcgLyAyO1xuICBzZWxlY3QzKGRlc2NyKS5hdHRyKFxuICAgIFwidHJhbnNmb3JtXCIsXG4gICAgXCJ0cmFuc2xhdGUoIFwiICsgLy8gKHRpdGxlQm94LndpZHRoIC0gYmJveC53aWR0aCkgLyAyICtcbiAgICAoYmJveC53aWR0aCA+IHRpdGxlQm94LndpZHRoID8gMCA6ICh0aXRsZUJveC53aWR0aCAtIGJib3gud2lkdGgpIC8gMikgKyBcIiwgXCIgKyAodGl0bGVCb3guaGVpZ2h0ICsgaGFsZlBhZGRpbmcgKyA1KSArIFwiKVwiXG4gICk7XG4gIHNlbGVjdDModGV4dCkuYXR0cihcbiAgICBcInRyYW5zZm9ybVwiLFxuICAgIFwidHJhbnNsYXRlKCBcIiArIC8vICh0aXRsZUJveC53aWR0aCAtIGJib3gud2lkdGgpIC8gMiArXG4gICAgKGJib3gud2lkdGggPCB0aXRsZUJveC53aWR0aCA/IDAgOiAtKHRpdGxlQm94LndpZHRoIC0gYmJveC53aWR0aCkgLyAyKSArIFwiLCAwKVwiXG4gICk7XG4gIGJib3ggPSBsYWJlbC5ub2RlKCkuZ2V0QkJveCgpO1xuICBsYWJlbC5hdHRyKFxuICAgIFwidHJhbnNmb3JtXCIsXG4gICAgXCJ0cmFuc2xhdGUoXCIgKyAtYmJveC53aWR0aCAvIDIgKyBcIiwgXCIgKyAoLWJib3guaGVpZ2h0IC8gMiAtIGhhbGZQYWRkaW5nICsgMykgKyBcIilcIlxuICApO1xuICByZWN0Mi5hdHRyKFwiY2xhc3NcIiwgXCJvdXRlciB0aXRsZS1zdGF0ZVwiKS5hdHRyKFwieFwiLCAtYmJveC53aWR0aCAvIDIgLSBoYWxmUGFkZGluZykuYXR0cihcInlcIiwgLWJib3guaGVpZ2h0IC8gMiAtIGhhbGZQYWRkaW5nKS5hdHRyKFwid2lkdGhcIiwgYmJveC53aWR0aCArIG5vZGUucGFkZGluZykuYXR0cihcImhlaWdodFwiLCBiYm94LmhlaWdodCArIG5vZGUucGFkZGluZyk7XG4gIGlubmVyTGluZS5hdHRyKFwiY2xhc3NcIiwgXCJkaXZpZGVyXCIpLmF0dHIoXCJ4MVwiLCAtYmJveC53aWR0aCAvIDIgLSBoYWxmUGFkZGluZykuYXR0cihcIngyXCIsIGJib3gud2lkdGggLyAyICsgaGFsZlBhZGRpbmcpLmF0dHIoXCJ5MVwiLCAtYmJveC5oZWlnaHQgLyAyIC0gaGFsZlBhZGRpbmcgKyB0aXRsZUJveC5oZWlnaHQgKyBoYWxmUGFkZGluZykuYXR0cihcInkyXCIsIC1iYm94LmhlaWdodCAvIDIgLSBoYWxmUGFkZGluZyArIHRpdGxlQm94LmhlaWdodCArIGhhbGZQYWRkaW5nKTtcbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCByZWN0Mik7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQyKSB7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnJlY3Qobm9kZSwgcG9pbnQyKTtcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufSwgXCJyZWN0V2l0aFRpdGxlXCIpO1xudmFyIHN0YWRpdW0gPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGFzeW5jIChwYXJlbnQsIG5vZGUpID0+IHtcbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCB9ID0gYXdhaXQgbGFiZWxIZWxwZXIoXG4gICAgcGFyZW50LFxuICAgIG5vZGUsXG4gICAgZ2V0Q2xhc3Nlc0Zyb21Ob2RlKG5vZGUsIHZvaWQgMCksXG4gICAgdHJ1ZVxuICApO1xuICBjb25zdCBoID0gYmJveC5oZWlnaHQgKyBub2RlLnBhZGRpbmc7XG4gIGNvbnN0IHcgPSBiYm94LndpZHRoICsgaCAvIDQgKyBub2RlLnBhZGRpbmc7XG4gIGNvbnN0IHJlY3QyID0gc2hhcGVTdmcuaW5zZXJ0KFwicmVjdFwiLCBcIjpmaXJzdC1jaGlsZFwiKS5hdHRyKFwic3R5bGVcIiwgbm9kZS5zdHlsZSkuYXR0cihcInJ4XCIsIGggLyAyKS5hdHRyKFwicnlcIiwgaCAvIDIpLmF0dHIoXCJ4XCIsIC13IC8gMikuYXR0cihcInlcIiwgLWggLyAyKS5hdHRyKFwid2lkdGhcIiwgdykuYXR0cihcImhlaWdodFwiLCBoKTtcbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCByZWN0Mik7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQyKSB7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnJlY3Qobm9kZSwgcG9pbnQyKTtcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufSwgXCJzdGFkaXVtXCIpO1xudmFyIGNpcmNsZTIgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGFzeW5jIChwYXJlbnQsIG5vZGUpID0+IHtcbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCwgaGFsZlBhZGRpbmcgfSA9IGF3YWl0IGxhYmVsSGVscGVyKFxuICAgIHBhcmVudCxcbiAgICBub2RlLFxuICAgIGdldENsYXNzZXNGcm9tTm9kZShub2RlLCB2b2lkIDApLFxuICAgIHRydWVcbiAgKTtcbiAgY29uc3QgY2lyY2xlMyA9IHNoYXBlU3ZnLmluc2VydChcImNpcmNsZVwiLCBcIjpmaXJzdC1jaGlsZFwiKTtcbiAgY2lyY2xlMy5hdHRyKFwic3R5bGVcIiwgbm9kZS5zdHlsZSkuYXR0cihcInJ4XCIsIG5vZGUucngpLmF0dHIoXCJyeVwiLCBub2RlLnJ5KS5hdHRyKFwiclwiLCBiYm94LndpZHRoIC8gMiArIGhhbGZQYWRkaW5nKS5hdHRyKFwid2lkdGhcIiwgYmJveC53aWR0aCArIG5vZGUucGFkZGluZykuYXR0cihcImhlaWdodFwiLCBiYm94LmhlaWdodCArIG5vZGUucGFkZGluZyk7XG4gIGxvZy5pbmZvKFwiQ2lyY2xlIG1haW5cIik7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgY2lyY2xlMyk7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQyKSB7XG4gICAgbG9nLmluZm8oXCJDaXJjbGUgaW50ZXJzZWN0XCIsIG5vZGUsIGJib3gud2lkdGggLyAyICsgaGFsZlBhZGRpbmcsIHBvaW50Mik7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LmNpcmNsZShub2RlLCBiYm94LndpZHRoIC8gMiArIGhhbGZQYWRkaW5nLCBwb2ludDIpO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59LCBcImNpcmNsZVwiKTtcbnZhciBkb3VibGVjaXJjbGUgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKGFzeW5jIChwYXJlbnQsIG5vZGUpID0+IHtcbiAgY29uc3QgeyBzaGFwZVN2ZywgYmJveCwgaGFsZlBhZGRpbmcgfSA9IGF3YWl0IGxhYmVsSGVscGVyKFxuICAgIHBhcmVudCxcbiAgICBub2RlLFxuICAgIGdldENsYXNzZXNGcm9tTm9kZShub2RlLCB2b2lkIDApLFxuICAgIHRydWVcbiAgKTtcbiAgY29uc3QgZ2FwID0gNTtcbiAgY29uc3QgY2lyY2xlR3JvdXAgPSBzaGFwZVN2Zy5pbnNlcnQoXCJnXCIsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICBjb25zdCBvdXRlckNpcmNsZSA9IGNpcmNsZUdyb3VwLmluc2VydChcImNpcmNsZVwiKTtcbiAgY29uc3QgaW5uZXJDaXJjbGUgPSBjaXJjbGVHcm91cC5pbnNlcnQoXCJjaXJjbGVcIik7XG4gIGNpcmNsZUdyb3VwLmF0dHIoXCJjbGFzc1wiLCBub2RlLmNsYXNzKTtcbiAgb3V0ZXJDaXJjbGUuYXR0cihcInN0eWxlXCIsIG5vZGUuc3R5bGUpLmF0dHIoXCJyeFwiLCBub2RlLnJ4KS5hdHRyKFwicnlcIiwgbm9kZS5yeSkuYXR0cihcInJcIiwgYmJveC53aWR0aCAvIDIgKyBoYWxmUGFkZGluZyArIGdhcCkuYXR0cihcIndpZHRoXCIsIGJib3gud2lkdGggKyBub2RlLnBhZGRpbmcgKyBnYXAgKiAyKS5hdHRyKFwiaGVpZ2h0XCIsIGJib3guaGVpZ2h0ICsgbm9kZS5wYWRkaW5nICsgZ2FwICogMik7XG4gIGlubmVyQ2lyY2xlLmF0dHIoXCJzdHlsZVwiLCBub2RlLnN0eWxlKS5hdHRyKFwicnhcIiwgbm9kZS5yeCkuYXR0cihcInJ5XCIsIG5vZGUucnkpLmF0dHIoXCJyXCIsIGJib3gud2lkdGggLyAyICsgaGFsZlBhZGRpbmcpLmF0dHIoXCJ3aWR0aFwiLCBiYm94LndpZHRoICsgbm9kZS5wYWRkaW5nKS5hdHRyKFwiaGVpZ2h0XCIsIGJib3guaGVpZ2h0ICsgbm9kZS5wYWRkaW5nKTtcbiAgbG9nLmluZm8oXCJEb3VibGVDaXJjbGUgbWFpblwiKTtcbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCBvdXRlckNpcmNsZSk7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQyKSB7XG4gICAgbG9nLmluZm8oXCJEb3VibGVDaXJjbGUgaW50ZXJzZWN0XCIsIG5vZGUsIGJib3gud2lkdGggLyAyICsgaGFsZlBhZGRpbmcgKyBnYXAsIHBvaW50Mik7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LmNpcmNsZShub2RlLCBiYm94LndpZHRoIC8gMiArIGhhbGZQYWRkaW5nICsgZ2FwLCBwb2ludDIpO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59LCBcImRvdWJsZWNpcmNsZVwiKTtcbnZhciBzdWJyb3V0aW5lID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAocGFyZW50LCBub2RlKSA9PiB7XG4gIGNvbnN0IHsgc2hhcGVTdmcsIGJib3ggfSA9IGF3YWl0IGxhYmVsSGVscGVyKFxuICAgIHBhcmVudCxcbiAgICBub2RlLFxuICAgIGdldENsYXNzZXNGcm9tTm9kZShub2RlLCB2b2lkIDApLFxuICAgIHRydWVcbiAgKTtcbiAgY29uc3QgdyA9IGJib3gud2lkdGggKyBub2RlLnBhZGRpbmc7XG4gIGNvbnN0IGggPSBiYm94LmhlaWdodCArIG5vZGUucGFkZGluZztcbiAgY29uc3QgcG9pbnRzID0gW1xuICAgIHsgeDogMCwgeTogMCB9LFxuICAgIHsgeDogdywgeTogMCB9LFxuICAgIHsgeDogdywgeTogLWggfSxcbiAgICB7IHg6IDAsIHk6IC1oIH0sXG4gICAgeyB4OiAwLCB5OiAwIH0sXG4gICAgeyB4OiAtOCwgeTogMCB9LFxuICAgIHsgeDogdyArIDgsIHk6IDAgfSxcbiAgICB7IHg6IHcgKyA4LCB5OiAtaCB9LFxuICAgIHsgeDogLTgsIHk6IC1oIH0sXG4gICAgeyB4OiAtOCwgeTogMCB9XG4gIF07XG4gIGNvbnN0IGVsID0gaW5zZXJ0UG9seWdvblNoYXBlKHNoYXBlU3ZnLCB3LCBoLCBwb2ludHMpO1xuICBlbC5hdHRyKFwic3R5bGVcIiwgbm9kZS5zdHlsZSk7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgZWwpO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50Mikge1xuICAgIHJldHVybiBpbnRlcnNlY3RfZGVmYXVsdC5wb2x5Z29uKG5vZGUsIHBvaW50cywgcG9pbnQyKTtcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufSwgXCJzdWJyb3V0aW5lXCIpO1xudmFyIHN0YXJ0ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgocGFyZW50LCBub2RlKSA9PiB7XG4gIGNvbnN0IHNoYXBlU3ZnID0gcGFyZW50Lmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIFwibm9kZSBkZWZhdWx0XCIpLmF0dHIoXCJpZFwiLCBub2RlLmRvbUlkIHx8IG5vZGUuaWQpO1xuICBjb25zdCBjaXJjbGUzID0gc2hhcGVTdmcuaW5zZXJ0KFwiY2lyY2xlXCIsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICBjaXJjbGUzLmF0dHIoXCJjbGFzc1wiLCBcInN0YXRlLXN0YXJ0XCIpLmF0dHIoXCJyXCIsIDcpLmF0dHIoXCJ3aWR0aFwiLCAxNCkuYXR0cihcImhlaWdodFwiLCAxNCk7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgY2lyY2xlMyk7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQyKSB7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LmNpcmNsZShub2RlLCA3LCBwb2ludDIpO1xuICB9O1xuICByZXR1cm4gc2hhcGVTdmc7XG59LCBcInN0YXJ0XCIpO1xudmFyIGZvcmtKb2luID0gLyogQF9fUFVSRV9fICovIF9fbmFtZSgocGFyZW50LCBub2RlLCBkaXIpID0+IHtcbiAgY29uc3Qgc2hhcGVTdmcgPSBwYXJlbnQuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJub2RlIGRlZmF1bHRcIikuYXR0cihcImlkXCIsIG5vZGUuZG9tSWQgfHwgbm9kZS5pZCk7XG4gIGxldCB3aWR0aCA9IDcwO1xuICBsZXQgaGVpZ2h0ID0gMTA7XG4gIGlmIChkaXIgPT09IFwiTFJcIikge1xuICAgIHdpZHRoID0gMTA7XG4gICAgaGVpZ2h0ID0gNzA7XG4gIH1cbiAgY29uc3Qgc2hhcGUgPSBzaGFwZVN2Zy5hcHBlbmQoXCJyZWN0XCIpLmF0dHIoXCJ4XCIsIC0xICogd2lkdGggLyAyKS5hdHRyKFwieVwiLCAtMSAqIGhlaWdodCAvIDIpLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCkuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpLmF0dHIoXCJjbGFzc1wiLCBcImZvcmstam9pblwiKTtcbiAgdXBkYXRlTm9kZUJvdW5kcyhub2RlLCBzaGFwZSk7XG4gIG5vZGUuaGVpZ2h0ID0gbm9kZS5oZWlnaHQgKyBub2RlLnBhZGRpbmcgLyAyO1xuICBub2RlLndpZHRoID0gbm9kZS53aWR0aCArIG5vZGUucGFkZGluZyAvIDI7XG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQyKSB7XG4gICAgcmV0dXJuIGludGVyc2VjdF9kZWZhdWx0LnJlY3Qobm9kZSwgcG9pbnQyKTtcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufSwgXCJmb3JrSm9pblwiKTtcbnZhciBlbmQgPSAvKiBAX19QVVJFX18gKi8gX19uYW1lKChwYXJlbnQsIG5vZGUpID0+IHtcbiAgY29uc3Qgc2hhcGVTdmcgPSBwYXJlbnQuaW5zZXJ0KFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgXCJub2RlIGRlZmF1bHRcIikuYXR0cihcImlkXCIsIG5vZGUuZG9tSWQgfHwgbm9kZS5pZCk7XG4gIGNvbnN0IGlubmVyQ2lyY2xlID0gc2hhcGVTdmcuaW5zZXJ0KFwiY2lyY2xlXCIsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICBjb25zdCBjaXJjbGUzID0gc2hhcGVTdmcuaW5zZXJ0KFwiY2lyY2xlXCIsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICBjaXJjbGUzLmF0dHIoXCJjbGFzc1wiLCBcInN0YXRlLXN0YXJ0XCIpLmF0dHIoXCJyXCIsIDcpLmF0dHIoXCJ3aWR0aFwiLCAxNCkuYXR0cihcImhlaWdodFwiLCAxNCk7XG4gIGlubmVyQ2lyY2xlLmF0dHIoXCJjbGFzc1wiLCBcInN0YXRlLWVuZFwiKS5hdHRyKFwiclwiLCA1KS5hdHRyKFwid2lkdGhcIiwgMTApLmF0dHIoXCJoZWlnaHRcIiwgMTApO1xuICB1cGRhdGVOb2RlQm91bmRzKG5vZGUsIGNpcmNsZTMpO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50Mikge1xuICAgIHJldHVybiBpbnRlcnNlY3RfZGVmYXVsdC5jaXJjbGUobm9kZSwgNywgcG9pbnQyKTtcbiAgfTtcbiAgcmV0dXJuIHNoYXBlU3ZnO1xufSwgXCJlbmRcIik7XG52YXIgY2xhc3NfYm94ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyAocGFyZW50LCBub2RlKSA9PiB7XG4gIGNvbnN0IGhhbGZQYWRkaW5nID0gbm9kZS5wYWRkaW5nIC8gMjtcbiAgY29uc3Qgcm93UGFkZGluZyA9IDQ7XG4gIGNvbnN0IGxpbmVIZWlnaHQgPSA4O1xuICBsZXQgY2xhc3NlczI7XG4gIGlmICghbm9kZS5jbGFzc2VzKSB7XG4gICAgY2xhc3NlczIgPSBcIm5vZGUgZGVmYXVsdFwiO1xuICB9IGVsc2Uge1xuICAgIGNsYXNzZXMyID0gXCJub2RlIFwiICsgbm9kZS5jbGFzc2VzO1xuICB9XG4gIGNvbnN0IHNoYXBlU3ZnID0gcGFyZW50Lmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIGNsYXNzZXMyKS5hdHRyKFwiaWRcIiwgbm9kZS5kb21JZCB8fCBub2RlLmlkKTtcbiAgY29uc3QgcmVjdDIgPSBzaGFwZVN2Zy5pbnNlcnQoXCJyZWN0XCIsIFwiOmZpcnN0LWNoaWxkXCIpO1xuICBjb25zdCB0b3BMaW5lID0gc2hhcGVTdmcuaW5zZXJ0KFwibGluZVwiKTtcbiAgY29uc3QgYm90dG9tTGluZSA9IHNoYXBlU3ZnLmluc2VydChcImxpbmVcIik7XG4gIGxldCBtYXhXaWR0aCA9IDA7XG4gIGxldCBtYXhIZWlnaHQgPSByb3dQYWRkaW5nO1xuICBjb25zdCBsYWJlbENvbnRhaW5lciA9IHNoYXBlU3ZnLmluc2VydChcImdcIikuYXR0cihcImNsYXNzXCIsIFwibGFiZWxcIik7XG4gIGxldCB2ZXJ0aWNhbFBvcyA9IDA7XG4gIGNvbnN0IGhhc0ludGVyZmFjZSA9IG5vZGUuY2xhc3NEYXRhLmFubm90YXRpb25zPy5bMF07XG4gIGNvbnN0IGludGVyZmFjZUxhYmVsVGV4dCA9IG5vZGUuY2xhc3NEYXRhLmFubm90YXRpb25zWzBdID8gXCJcXHhBQlwiICsgbm9kZS5jbGFzc0RhdGEuYW5ub3RhdGlvbnNbMF0gKyBcIlxceEJCXCIgOiBcIlwiO1xuICBjb25zdCBpbnRlcmZhY2VMYWJlbCA9IGF3YWl0IGNyZWF0ZUxhYmVsX2RlZmF1bHQoXG4gICAgbGFiZWxDb250YWluZXIsXG4gICAgaW50ZXJmYWNlTGFiZWxUZXh0LFxuICAgIG5vZGUubGFiZWxTdHlsZSxcbiAgICB0cnVlLFxuICAgIHRydWVcbiAgKTtcbiAgbGV0IGludGVyZmFjZUJCb3ggPSBpbnRlcmZhY2VMYWJlbC5nZXRCQm94KCk7XG4gIGlmIChnZXRFZmZlY3RpdmVIdG1sTGFiZWxzKGdldENvbmZpZzIoKSkpIHtcbiAgICBjb25zdCBkaXYgPSBpbnRlcmZhY2VMYWJlbC5jaGlsZHJlblswXTtcbiAgICBjb25zdCBkdiA9IHNlbGVjdDMoaW50ZXJmYWNlTGFiZWwpO1xuICAgIGludGVyZmFjZUJCb3ggPSBkaXYuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgZHYuYXR0cihcIndpZHRoXCIsIGludGVyZmFjZUJCb3gud2lkdGgpO1xuICAgIGR2LmF0dHIoXCJoZWlnaHRcIiwgaW50ZXJmYWNlQkJveC5oZWlnaHQpO1xuICB9XG4gIGlmIChub2RlLmNsYXNzRGF0YS5hbm5vdGF0aW9uc1swXSkge1xuICAgIG1heEhlaWdodCArPSBpbnRlcmZhY2VCQm94LmhlaWdodCArIHJvd1BhZGRpbmc7XG4gICAgbWF4V2lkdGggKz0gaW50ZXJmYWNlQkJveC53aWR0aDtcbiAgfVxuICBsZXQgY2xhc3NUaXRsZVN0cmluZyA9IG5vZGUuY2xhc3NEYXRhLmxhYmVsO1xuICBpZiAobm9kZS5jbGFzc0RhdGEudHlwZSAhPT0gdm9pZCAwICYmIG5vZGUuY2xhc3NEYXRhLnR5cGUgIT09IFwiXCIpIHtcbiAgICBpZiAoZ2V0RWZmZWN0aXZlSHRtbExhYmVscyhnZXRDb25maWcyKCkpKSB7XG4gICAgICBjbGFzc1RpdGxlU3RyaW5nICs9IFwiJmx0O1wiICsgbm9kZS5jbGFzc0RhdGEudHlwZSArIFwiJmd0O1wiO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbGFzc1RpdGxlU3RyaW5nICs9IFwiPFwiICsgbm9kZS5jbGFzc0RhdGEudHlwZSArIFwiPlwiO1xuICAgIH1cbiAgfVxuICBjb25zdCBjbGFzc1RpdGxlTGFiZWwgPSBhd2FpdCBjcmVhdGVMYWJlbF9kZWZhdWx0KFxuICAgIGxhYmVsQ29udGFpbmVyLFxuICAgIGNsYXNzVGl0bGVTdHJpbmcsXG4gICAgbm9kZS5sYWJlbFN0eWxlLFxuICAgIHRydWUsXG4gICAgdHJ1ZVxuICApO1xuICBzZWxlY3QzKGNsYXNzVGl0bGVMYWJlbCkuYXR0cihcImNsYXNzXCIsIFwiY2xhc3NUaXRsZVwiKTtcbiAgbGV0IGNsYXNzVGl0bGVCQm94ID0gY2xhc3NUaXRsZUxhYmVsLmdldEJCb3goKTtcbiAgaWYgKGdldEVmZmVjdGl2ZUh0bWxMYWJlbHMoZ2V0Q29uZmlnMigpKSkge1xuICAgIGNvbnN0IGRpdiA9IGNsYXNzVGl0bGVMYWJlbC5jaGlsZHJlblswXTtcbiAgICBjb25zdCBkdiA9IHNlbGVjdDMoY2xhc3NUaXRsZUxhYmVsKTtcbiAgICBjbGFzc1RpdGxlQkJveCA9IGRpdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBkdi5hdHRyKFwid2lkdGhcIiwgY2xhc3NUaXRsZUJCb3gud2lkdGgpO1xuICAgIGR2LmF0dHIoXCJoZWlnaHRcIiwgY2xhc3NUaXRsZUJCb3guaGVpZ2h0KTtcbiAgfVxuICBtYXhIZWlnaHQgKz0gY2xhc3NUaXRsZUJCb3guaGVpZ2h0ICsgcm93UGFkZGluZztcbiAgaWYgKGNsYXNzVGl0bGVCQm94LndpZHRoID4gbWF4V2lkdGgpIHtcbiAgICBtYXhXaWR0aCA9IGNsYXNzVGl0bGVCQm94LndpZHRoO1xuICB9XG4gIGNvbnN0IGNsYXNzQXR0cmlidXRlcyA9IFtdO1xuICBub2RlLmNsYXNzRGF0YS5tZW1iZXJzLmZvckVhY2goYXN5bmMgKG1lbWJlcikgPT4ge1xuICAgIGNvbnN0IHBhcnNlZEluZm8gPSBtZW1iZXIuZ2V0RGlzcGxheURldGFpbHMoKTtcbiAgICBsZXQgcGFyc2VkVGV4dCA9IHBhcnNlZEluZm8uZGlzcGxheVRleHQ7XG4gICAgaWYgKGdldEVmZmVjdGl2ZUh0bWxMYWJlbHMoZ2V0Q29uZmlnMigpKSkge1xuICAgICAgcGFyc2VkVGV4dCA9IHBhcnNlZFRleHQucmVwbGFjZSgvPC9nLCBcIiZsdDtcIikucmVwbGFjZSgvPi9nLCBcIiZndDtcIik7XG4gICAgfVxuICAgIGNvbnN0IGxibCA9IGF3YWl0IGNyZWF0ZUxhYmVsX2RlZmF1bHQoXG4gICAgICBsYWJlbENvbnRhaW5lcixcbiAgICAgIHBhcnNlZFRleHQsXG4gICAgICBwYXJzZWRJbmZvLmNzc1N0eWxlID8gcGFyc2VkSW5mby5jc3NTdHlsZSA6IG5vZGUubGFiZWxTdHlsZSxcbiAgICAgIHRydWUsXG4gICAgICB0cnVlXG4gICAgKTtcbiAgICBsZXQgYmJveCA9IGxibC5nZXRCQm94KCk7XG4gICAgaWYgKGdldEVmZmVjdGl2ZUh0bWxMYWJlbHMoZ2V0Q29uZmlnMigpKSkge1xuICAgICAgY29uc3QgZGl2ID0gbGJsLmNoaWxkcmVuWzBdO1xuICAgICAgY29uc3QgZHYgPSBzZWxlY3QzKGxibCk7XG4gICAgICBiYm94ID0gZGl2LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgZHYuYXR0cihcIndpZHRoXCIsIGJib3gud2lkdGgpO1xuICAgICAgZHYuYXR0cihcImhlaWdodFwiLCBiYm94LmhlaWdodCk7XG4gICAgfVxuICAgIGlmIChiYm94LndpZHRoID4gbWF4V2lkdGgpIHtcbiAgICAgIG1heFdpZHRoID0gYmJveC53aWR0aDtcbiAgICB9XG4gICAgbWF4SGVpZ2h0ICs9IGJib3guaGVpZ2h0ICsgcm93UGFkZGluZztcbiAgICBjbGFzc0F0dHJpYnV0ZXMucHVzaChsYmwpO1xuICB9KTtcbiAgbWF4SGVpZ2h0ICs9IGxpbmVIZWlnaHQ7XG4gIGNvbnN0IGNsYXNzTWV0aG9kcyA9IFtdO1xuICBub2RlLmNsYXNzRGF0YS5tZXRob2RzLmZvckVhY2goYXN5bmMgKG1lbWJlcikgPT4ge1xuICAgIGNvbnN0IHBhcnNlZEluZm8gPSBtZW1iZXIuZ2V0RGlzcGxheURldGFpbHMoKTtcbiAgICBsZXQgZGlzcGxheVRleHQgPSBwYXJzZWRJbmZvLmRpc3BsYXlUZXh0O1xuICAgIGlmIChnZXRFZmZlY3RpdmVIdG1sTGFiZWxzKGdldENvbmZpZzIoKSkpIHtcbiAgICAgIGRpc3BsYXlUZXh0ID0gZGlzcGxheVRleHQucmVwbGFjZSgvPC9nLCBcIiZsdDtcIikucmVwbGFjZSgvPi9nLCBcIiZndDtcIik7XG4gICAgfVxuICAgIGNvbnN0IGxibCA9IGF3YWl0IGNyZWF0ZUxhYmVsX2RlZmF1bHQoXG4gICAgICBsYWJlbENvbnRhaW5lcixcbiAgICAgIGRpc3BsYXlUZXh0LFxuICAgICAgcGFyc2VkSW5mby5jc3NTdHlsZSA/IHBhcnNlZEluZm8uY3NzU3R5bGUgOiBub2RlLmxhYmVsU3R5bGUsXG4gICAgICB0cnVlLFxuICAgICAgdHJ1ZVxuICAgICk7XG4gICAgbGV0IGJib3ggPSBsYmwuZ2V0QkJveCgpO1xuICAgIGlmIChnZXRFZmZlY3RpdmVIdG1sTGFiZWxzKGdldENvbmZpZzIoKSkpIHtcbiAgICAgIGNvbnN0IGRpdiA9IGxibC5jaGlsZHJlblswXTtcbiAgICAgIGNvbnN0IGR2ID0gc2VsZWN0MyhsYmwpO1xuICAgICAgYmJveCA9IGRpdi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGR2LmF0dHIoXCJ3aWR0aFwiLCBiYm94LndpZHRoKTtcbiAgICAgIGR2LmF0dHIoXCJoZWlnaHRcIiwgYmJveC5oZWlnaHQpO1xuICAgIH1cbiAgICBpZiAoYmJveC53aWR0aCA+IG1heFdpZHRoKSB7XG4gICAgICBtYXhXaWR0aCA9IGJib3gud2lkdGg7XG4gICAgfVxuICAgIG1heEhlaWdodCArPSBiYm94LmhlaWdodCArIHJvd1BhZGRpbmc7XG4gICAgY2xhc3NNZXRob2RzLnB1c2gobGJsKTtcbiAgfSk7XG4gIG1heEhlaWdodCArPSBsaW5lSGVpZ2h0O1xuICBpZiAoaGFzSW50ZXJmYWNlKSB7XG4gICAgbGV0IGRpZmZYMiA9IChtYXhXaWR0aCAtIGludGVyZmFjZUJCb3gud2lkdGgpIC8gMjtcbiAgICBzZWxlY3QzKGludGVyZmFjZUxhYmVsKS5hdHRyKFxuICAgICAgXCJ0cmFuc2Zvcm1cIixcbiAgICAgIFwidHJhbnNsYXRlKCBcIiArICgtMSAqIG1heFdpZHRoIC8gMiArIGRpZmZYMikgKyBcIiwgXCIgKyAtMSAqIG1heEhlaWdodCAvIDIgKyBcIilcIlxuICAgICk7XG4gICAgdmVydGljYWxQb3MgPSBpbnRlcmZhY2VCQm94LmhlaWdodCArIHJvd1BhZGRpbmc7XG4gIH1cbiAgbGV0IGRpZmZYID0gKG1heFdpZHRoIC0gY2xhc3NUaXRsZUJCb3gud2lkdGgpIC8gMjtcbiAgc2VsZWN0MyhjbGFzc1RpdGxlTGFiZWwpLmF0dHIoXG4gICAgXCJ0cmFuc2Zvcm1cIixcbiAgICBcInRyYW5zbGF0ZSggXCIgKyAoLTEgKiBtYXhXaWR0aCAvIDIgKyBkaWZmWCkgKyBcIiwgXCIgKyAoLTEgKiBtYXhIZWlnaHQgLyAyICsgdmVydGljYWxQb3MpICsgXCIpXCJcbiAgKTtcbiAgdmVydGljYWxQb3MgKz0gY2xhc3NUaXRsZUJCb3guaGVpZ2h0ICsgcm93UGFkZGluZztcbiAgdG9wTGluZS5hdHRyKFwiY2xhc3NcIiwgXCJkaXZpZGVyXCIpLmF0dHIoXCJ4MVwiLCAtbWF4V2lkdGggLyAyIC0gaGFsZlBhZGRpbmcpLmF0dHIoXCJ4MlwiLCBtYXhXaWR0aCAvIDIgKyBoYWxmUGFkZGluZykuYXR0cihcInkxXCIsIC1tYXhIZWlnaHQgLyAyIC0gaGFsZlBhZGRpbmcgKyBsaW5lSGVpZ2h0ICsgdmVydGljYWxQb3MpLmF0dHIoXCJ5MlwiLCAtbWF4SGVpZ2h0IC8gMiAtIGhhbGZQYWRkaW5nICsgbGluZUhlaWdodCArIHZlcnRpY2FsUG9zKTtcbiAgdmVydGljYWxQb3MgKz0gbGluZUhlaWdodDtcbiAgY2xhc3NBdHRyaWJ1dGVzLmZvckVhY2goKGxibCkgPT4ge1xuICAgIHNlbGVjdDMobGJsKS5hdHRyKFxuICAgICAgXCJ0cmFuc2Zvcm1cIixcbiAgICAgIFwidHJhbnNsYXRlKCBcIiArIC1tYXhXaWR0aCAvIDIgKyBcIiwgXCIgKyAoLTEgKiBtYXhIZWlnaHQgLyAyICsgdmVydGljYWxQb3MgKyBsaW5lSGVpZ2h0IC8gMikgKyBcIilcIlxuICAgICk7XG4gICAgY29uc3QgbWVtYmVyQkJveCA9IGxibD8uZ2V0QkJveCgpO1xuICAgIHZlcnRpY2FsUG9zICs9IChtZW1iZXJCQm94Py5oZWlnaHQgPz8gMCkgKyByb3dQYWRkaW5nO1xuICB9KTtcbiAgdmVydGljYWxQb3MgKz0gbGluZUhlaWdodDtcbiAgYm90dG9tTGluZS5hdHRyKFwiY2xhc3NcIiwgXCJkaXZpZGVyXCIpLmF0dHIoXCJ4MVwiLCAtbWF4V2lkdGggLyAyIC0gaGFsZlBhZGRpbmcpLmF0dHIoXCJ4MlwiLCBtYXhXaWR0aCAvIDIgKyBoYWxmUGFkZGluZykuYXR0cihcInkxXCIsIC1tYXhIZWlnaHQgLyAyIC0gaGFsZlBhZGRpbmcgKyBsaW5lSGVpZ2h0ICsgdmVydGljYWxQb3MpLmF0dHIoXCJ5MlwiLCAtbWF4SGVpZ2h0IC8gMiAtIGhhbGZQYWRkaW5nICsgbGluZUhlaWdodCArIHZlcnRpY2FsUG9zKTtcbiAgdmVydGljYWxQb3MgKz0gbGluZUhlaWdodDtcbiAgY2xhc3NNZXRob2RzLmZvckVhY2goKGxibCkgPT4ge1xuICAgIHNlbGVjdDMobGJsKS5hdHRyKFxuICAgICAgXCJ0cmFuc2Zvcm1cIixcbiAgICAgIFwidHJhbnNsYXRlKCBcIiArIC1tYXhXaWR0aCAvIDIgKyBcIiwgXCIgKyAoLTEgKiBtYXhIZWlnaHQgLyAyICsgdmVydGljYWxQb3MpICsgXCIpXCJcbiAgICApO1xuICAgIGNvbnN0IG1lbWJlckJCb3ggPSBsYmw/LmdldEJCb3goKTtcbiAgICB2ZXJ0aWNhbFBvcyArPSAobWVtYmVyQkJveD8uaGVpZ2h0ID8/IDApICsgcm93UGFkZGluZztcbiAgfSk7XG4gIHJlY3QyLmF0dHIoXCJzdHlsZVwiLCBub2RlLnN0eWxlKS5hdHRyKFwiY2xhc3NcIiwgXCJvdXRlciB0aXRsZS1zdGF0ZVwiKS5hdHRyKFwieFwiLCAtbWF4V2lkdGggLyAyIC0gaGFsZlBhZGRpbmcpLmF0dHIoXCJ5XCIsIC0obWF4SGVpZ2h0IC8gMikgLSBoYWxmUGFkZGluZykuYXR0cihcIndpZHRoXCIsIG1heFdpZHRoICsgbm9kZS5wYWRkaW5nKS5hdHRyKFwiaGVpZ2h0XCIsIG1heEhlaWdodCArIG5vZGUucGFkZGluZyk7XG4gIHVwZGF0ZU5vZGVCb3VuZHMobm9kZSwgcmVjdDIpO1xuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50Mikge1xuICAgIHJldHVybiBpbnRlcnNlY3RfZGVmYXVsdC5yZWN0KG5vZGUsIHBvaW50Mik7XG4gIH07XG4gIHJldHVybiBzaGFwZVN2Zztcbn0sIFwiY2xhc3NfYm94XCIpO1xudmFyIHNoYXBlcyA9IHtcbiAgcmhvbWJ1czogcXVlc3Rpb24sXG4gIGNvbXBvc2l0ZSxcbiAgcXVlc3Rpb24sXG4gIHJlY3QsXG4gIGxhYmVsUmVjdCxcbiAgcmVjdFdpdGhUaXRsZSxcbiAgY2hvaWNlLFxuICBjaXJjbGU6IGNpcmNsZTIsXG4gIGRvdWJsZWNpcmNsZSxcbiAgc3RhZGl1bSxcbiAgaGV4YWdvbixcbiAgYmxvY2tfYXJyb3csXG4gIHJlY3RfbGVmdF9pbnZfYXJyb3csXG4gIGxlYW5fcmlnaHQsXG4gIGxlYW5fbGVmdCxcbiAgdHJhcGV6b2lkLFxuICBpbnZfdHJhcGV6b2lkLFxuICByZWN0X3JpZ2h0X2ludl9hcnJvdyxcbiAgY3lsaW5kZXIsXG4gIHN0YXJ0LFxuICBlbmQsXG4gIG5vdGU6IG5vdGVfZGVmYXVsdCxcbiAgc3Vicm91dGluZSxcbiAgZm9yazogZm9ya0pvaW4sXG4gIGpvaW46IGZvcmtKb2luLFxuICBjbGFzc19ib3hcbn07XG52YXIgbm9kZUVsZW1zID0ge307XG52YXIgaW5zZXJ0Tm9kZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoYXN5bmMgKGVsZW0sIG5vZGUsIHJlbmRlck9wdGlvbnMpID0+IHtcbiAgbGV0IG5ld0VsO1xuICBsZXQgZWw7XG4gIGlmIChub2RlLmxpbmspIHtcbiAgICBsZXQgdGFyZ2V0O1xuICAgIGlmIChnZXRDb25maWcyKCkuc2VjdXJpdHlMZXZlbCA9PT0gXCJzYW5kYm94XCIpIHtcbiAgICAgIHRhcmdldCA9IFwiX3RvcFwiO1xuICAgIH0gZWxzZSBpZiAobm9kZS5saW5rVGFyZ2V0KSB7XG4gICAgICB0YXJnZXQgPSBub2RlLmxpbmtUYXJnZXQgfHwgXCJfYmxhbmtcIjtcbiAgICB9XG4gICAgbmV3RWwgPSBlbGVtLmluc2VydChcInN2ZzphXCIpLmF0dHIoXCJ4bGluazpocmVmXCIsIG5vZGUubGluaykuYXR0cihcInRhcmdldFwiLCB0YXJnZXQpO1xuICAgIGVsID0gYXdhaXQgc2hhcGVzW25vZGUuc2hhcGVdKG5ld0VsLCBub2RlLCByZW5kZXJPcHRpb25zKTtcbiAgfSBlbHNlIHtcbiAgICBlbCA9IGF3YWl0IHNoYXBlc1tub2RlLnNoYXBlXShlbGVtLCBub2RlLCByZW5kZXJPcHRpb25zKTtcbiAgICBuZXdFbCA9IGVsO1xuICB9XG4gIGlmIChub2RlLnRvb2x0aXApIHtcbiAgICBlbC5hdHRyKFwidGl0bGVcIiwgbm9kZS50b29sdGlwKTtcbiAgfVxuICBpZiAobm9kZS5jbGFzcykge1xuICAgIGVsLmF0dHIoXCJjbGFzc1wiLCBcIm5vZGUgZGVmYXVsdCBcIiArIG5vZGUuY2xhc3MpO1xuICB9XG4gIG5vZGVFbGVtc1tub2RlLmlkXSA9IG5ld0VsO1xuICBpZiAobm9kZS5oYXZlQ2FsbGJhY2spIHtcbiAgICBub2RlRWxlbXNbbm9kZS5pZF0uYXR0cihcImNsYXNzXCIsIG5vZGVFbGVtc1tub2RlLmlkXS5hdHRyKFwiY2xhc3NcIikgKyBcIiBjbGlja2FibGVcIik7XG4gIH1cbiAgcmV0dXJuIG5ld0VsO1xufSwgXCJpbnNlcnROb2RlXCIpO1xudmFyIHBvc2l0aW9uTm9kZSA9IC8qIEBfX1BVUkVfXyAqLyBfX25hbWUoKG5vZGUpID0+IHtcbiAgY29uc3QgZWwgPSBub2RlRWxlbXNbbm9kZS5pZF07XG4gIGxvZy50cmFjZShcbiAgICBcIlRyYW5zZm9ybWluZyBub2RlXCIsXG4gICAgbm9kZS5kaWZmLFxuICAgIG5vZGUsXG4gICAgXCJ0cmFuc2xhdGUoXCIgKyAobm9kZS54IC0gbm9kZS53aWR0aCAvIDIgLSA1KSArIFwiLCBcIiArIG5vZGUud2lkdGggLyAyICsgXCIpXCJcbiAgKTtcbiAgY29uc3QgcGFkZGluZzIgPSA4O1xuICBjb25zdCBkaWZmID0gbm9kZS5kaWZmIHx8IDA7XG4gIGlmIChub2RlLmNsdXN0ZXJOb2RlKSB7XG4gICAgZWwuYXR0cihcbiAgICAgIFwidHJhbnNmb3JtXCIsXG4gICAgICBcInRyYW5zbGF0ZShcIiArIChub2RlLnggKyBkaWZmIC0gbm9kZS53aWR0aCAvIDIpICsgXCIsIFwiICsgKG5vZGUueSAtIG5vZGUuaGVpZ2h0IC8gMiAtIHBhZGRpbmcyKSArIFwiKVwiXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBlbC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbm9kZS54ICsgXCIsIFwiICsgbm9kZS55ICsgXCIpXCIpO1xuICB9XG4gIHJldHVybiBkaWZmO1xufSwgXCJwb3NpdGlvbk5vZGVcIik7XG5cbi8vIHNyYy9kaWFncmFtcy9ibG9jay9yZW5kZXJIZWxwZXJzLnRzXG5mdW5jdGlvbiBnZXROb2RlRnJvbUJsb2NrKGJsb2NrLCBkYjIsIHBvc2l0aW9uZWQgPSBmYWxzZSkge1xuICBjb25zdCB2ZXJ0ZXggPSBibG9jaztcbiAgbGV0IGNsYXNzU3RyID0gXCJkZWZhdWx0XCI7XG4gIGlmICgodmVydGV4Py5jbGFzc2VzPy5sZW5ndGggfHwgMCkgPiAwKSB7XG4gICAgY2xhc3NTdHIgPSAodmVydGV4Py5jbGFzc2VzID8/IFtdKS5qb2luKFwiIFwiKTtcbiAgfVxuICBjbGFzc1N0ciA9IGNsYXNzU3RyICsgXCIgZmxvd2NoYXJ0LWxhYmVsXCI7XG4gIGxldCByYWRpdXMgPSAwO1xuICBsZXQgc2hhcGUgPSBcIlwiO1xuICBsZXQgcGFkZGluZzI7XG4gIHN3aXRjaCAodmVydGV4LnR5cGUpIHtcbiAgICBjYXNlIFwicm91bmRcIjpcbiAgICAgIHJhZGl1cyA9IDU7XG4gICAgICBzaGFwZSA9IFwicmVjdFwiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImNvbXBvc2l0ZVwiOlxuICAgICAgcmFkaXVzID0gMDtcbiAgICAgIHNoYXBlID0gXCJjb21wb3NpdGVcIjtcbiAgICAgIHBhZGRpbmcyID0gMDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJzcXVhcmVcIjpcbiAgICAgIHNoYXBlID0gXCJyZWN0XCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiZGlhbW9uZFwiOlxuICAgICAgc2hhcGUgPSBcInF1ZXN0aW9uXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiaGV4YWdvblwiOlxuICAgICAgc2hhcGUgPSBcImhleGFnb25cIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJibG9ja19hcnJvd1wiOlxuICAgICAgc2hhcGUgPSBcImJsb2NrX2Fycm93XCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwib2RkXCI6XG4gICAgICBzaGFwZSA9IFwicmVjdF9sZWZ0X2ludl9hcnJvd1wiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImxlYW5fcmlnaHRcIjpcbiAgICAgIHNoYXBlID0gXCJsZWFuX3JpZ2h0XCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwibGVhbl9sZWZ0XCI6XG4gICAgICBzaGFwZSA9IFwibGVhbl9sZWZ0XCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwidHJhcGV6b2lkXCI6XG4gICAgICBzaGFwZSA9IFwidHJhcGV6b2lkXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiaW52X3RyYXBlem9pZFwiOlxuICAgICAgc2hhcGUgPSBcImludl90cmFwZXpvaWRcIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJyZWN0X2xlZnRfaW52X2Fycm93XCI6XG4gICAgICBzaGFwZSA9IFwicmVjdF9sZWZ0X2ludl9hcnJvd1wiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImNpcmNsZVwiOlxuICAgICAgc2hhcGUgPSBcImNpcmNsZVwiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImVsbGlwc2VcIjpcbiAgICAgIHNoYXBlID0gXCJlbGxpcHNlXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwic3RhZGl1bVwiOlxuICAgICAgc2hhcGUgPSBcInN0YWRpdW1cIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJzdWJyb3V0aW5lXCI6XG4gICAgICBzaGFwZSA9IFwic3Vicm91dGluZVwiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImN5bGluZGVyXCI6XG4gICAgICBzaGFwZSA9IFwiY3lsaW5kZXJcIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJncm91cFwiOlxuICAgICAgc2hhcGUgPSBcInJlY3RcIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJkb3VibGVjaXJjbGVcIjpcbiAgICAgIHNoYXBlID0gXCJkb3VibGVjaXJjbGVcIjtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBzaGFwZSA9IFwicmVjdFwiO1xuICB9XG4gIGNvbnN0IHN0eWxlcyA9IGdldFN0eWxlc0Zyb21BcnJheSh2ZXJ0ZXg/LnN0eWxlcyA/PyBbXSk7XG4gIGNvbnN0IHZlcnRleFRleHQgPSB2ZXJ0ZXgubGFiZWw7XG4gIGNvbnN0IGJvdW5kcyA9IHZlcnRleC5zaXplID8/IHsgd2lkdGg6IDAsIGhlaWdodDogMCwgeDogMCwgeTogMCB9O1xuICBjb25zdCBkYkRpYWdyYW1JZCA9IGRiMi5nZXREaWFncmFtSWQoKTtcbiAgY29uc3Qgbm9kZSA9IHtcbiAgICBsYWJlbFN0eWxlOiBzdHlsZXMubGFiZWxTdHlsZSxcbiAgICBzaGFwZSxcbiAgICBsYWJlbFRleHQ6IHZlcnRleFRleHQsXG4gICAgcng6IHJhZGl1cyxcbiAgICByeTogcmFkaXVzLFxuICAgIGNsYXNzOiBjbGFzc1N0cixcbiAgICBzdHlsZTogc3R5bGVzLnN0eWxlLFxuICAgIGlkOiB2ZXJ0ZXguaWQsXG4gICAgZG9tSWQ6IGRiRGlhZ3JhbUlkID8gYCR7ZGJEaWFncmFtSWR9LSR7dmVydGV4LmlkfWAgOiB2ZXJ0ZXguaWQsXG4gICAgZGlyZWN0aW9uczogdmVydGV4LmRpcmVjdGlvbnMsXG4gICAgd2lkdGg6IGJvdW5kcy53aWR0aCxcbiAgICBoZWlnaHQ6IGJvdW5kcy5oZWlnaHQsXG4gICAgeDogYm91bmRzLngsXG4gICAgeTogYm91bmRzLnksXG4gICAgcG9zaXRpb25lZCxcbiAgICBpbnRlcnNlY3Q6IHZvaWQgMCxcbiAgICB0eXBlOiB2ZXJ0ZXgudHlwZSxcbiAgICBwYWRkaW5nOiBwYWRkaW5nMiA/PyBnZXRDb25maWcoKT8uYmxvY2s/LnBhZGRpbmcgPz8gMCxcbiAgICB3aWR0aEluQ29sdW1uczogdmVydGV4LndpZHRoSW5Db2x1bW5zID8/IDFcbiAgfTtcbiAgcmV0dXJuIG5vZGU7XG59XG5fX25hbWUoZ2V0Tm9kZUZyb21CbG9jaywgXCJnZXROb2RlRnJvbUJsb2NrXCIpO1xuYXN5bmMgZnVuY3Rpb24gY2FsY3VsYXRlQmxvY2tTaXplKGVsZW0sIGJsb2NrLCBkYjIpIHtcbiAgY29uc3Qgbm9kZSA9IGdldE5vZGVGcm9tQmxvY2soYmxvY2ssIGRiMiwgZmFsc2UpO1xuICBpZiAobm9kZS50eXBlID09PSBcImdyb3VwXCIpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgY29uZmlnMiA9IGdldENvbmZpZygpO1xuICBjb25zdCBub2RlRWwgPSBhd2FpdCBpbnNlcnROb2RlKGVsZW0sIG5vZGUsIHsgY29uZmlnOiBjb25maWcyIH0pO1xuICBjb25zdCBib3VuZGluZ0JveCA9IG5vZGVFbC5ub2RlKCkuZ2V0QkJveCgpO1xuICBjb25zdCBvYmogPSBkYjIuZ2V0QmxvY2sobm9kZS5pZCk7XG4gIG9iai5zaXplID0geyB3aWR0aDogYm91bmRpbmdCb3gud2lkdGgsIGhlaWdodDogYm91bmRpbmdCb3guaGVpZ2h0LCB4OiAwLCB5OiAwLCBub2RlOiBub2RlRWwgfTtcbiAgZGIyLnNldEJsb2NrKG9iaik7XG4gIG5vZGVFbC5yZW1vdmUoKTtcbn1cbl9fbmFtZShjYWxjdWxhdGVCbG9ja1NpemUsIFwiY2FsY3VsYXRlQmxvY2tTaXplXCIpO1xuYXN5bmMgZnVuY3Rpb24gaW5zZXJ0QmxvY2tQb3NpdGlvbmVkKGVsZW0sIGJsb2NrLCBkYjIpIHtcbiAgY29uc3Qgbm9kZSA9IGdldE5vZGVGcm9tQmxvY2soYmxvY2ssIGRiMiwgdHJ1ZSk7XG4gIGNvbnN0IG9iaiA9IGRiMi5nZXRCbG9jayhub2RlLmlkKTtcbiAgaWYgKG9iai50eXBlICE9PSBcInNwYWNlXCIpIHtcbiAgICBjb25zdCBjb25maWcyID0gZ2V0Q29uZmlnKCk7XG4gICAgYXdhaXQgaW5zZXJ0Tm9kZShlbGVtLCBub2RlLCB7IGNvbmZpZzogY29uZmlnMiB9KTtcbiAgICBibG9jay5pbnRlcnNlY3QgPSBub2RlPy5pbnRlcnNlY3Q7XG4gICAgcG9zaXRpb25Ob2RlKG5vZGUpO1xuICB9XG59XG5fX25hbWUoaW5zZXJ0QmxvY2tQb3NpdGlvbmVkLCBcImluc2VydEJsb2NrUG9zaXRpb25lZFwiKTtcbmFzeW5jIGZ1bmN0aW9uIHBlcmZvcm1PcGVyYXRpb25zKGVsZW0sIGJsb2NrczIsIGRiMiwgb3BlcmF0aW9uKSB7XG4gIGZvciAoY29uc3QgYmxvY2sgb2YgYmxvY2tzMikge1xuICAgIGF3YWl0IG9wZXJhdGlvbihlbGVtLCBibG9jaywgZGIyKTtcbiAgICBpZiAoYmxvY2suY2hpbGRyZW4pIHtcbiAgICAgIGF3YWl0IHBlcmZvcm1PcGVyYXRpb25zKGVsZW0sIGJsb2NrLmNoaWxkcmVuLCBkYjIsIG9wZXJhdGlvbik7XG4gICAgfVxuICB9XG59XG5fX25hbWUocGVyZm9ybU9wZXJhdGlvbnMsIFwicGVyZm9ybU9wZXJhdGlvbnNcIik7XG5hc3luYyBmdW5jdGlvbiBjYWxjdWxhdGVCbG9ja1NpemVzKGVsZW0sIGJsb2NrczIsIGRiMikge1xuICBhd2FpdCBwZXJmb3JtT3BlcmF0aW9ucyhlbGVtLCBibG9ja3MyLCBkYjIsIGNhbGN1bGF0ZUJsb2NrU2l6ZSk7XG59XG5fX25hbWUoY2FsY3VsYXRlQmxvY2tTaXplcywgXCJjYWxjdWxhdGVCbG9ja1NpemVzXCIpO1xuYXN5bmMgZnVuY3Rpb24gaW5zZXJ0QmxvY2tzKGVsZW0sIGJsb2NrczIsIGRiMikge1xuICBhd2FpdCBwZXJmb3JtT3BlcmF0aW9ucyhlbGVtLCBibG9ja3MyLCBkYjIsIGluc2VydEJsb2NrUG9zaXRpb25lZCk7XG59XG5fX25hbWUoaW5zZXJ0QmxvY2tzLCBcImluc2VydEJsb2Nrc1wiKTtcbmFzeW5jIGZ1bmN0aW9uIGluc2VydEVkZ2VzKGVsZW0sIGVkZ2VzLCBibG9ja3MyLCBkYjIsIGlkKSB7XG4gIGNvbnN0IGcgPSBuZXcgZ3JhcGhsaWIuR3JhcGgoe1xuICAgIG11bHRpZ3JhcGg6IHRydWUsXG4gICAgY29tcG91bmQ6IHRydWVcbiAgfSk7XG4gIGcuc2V0R3JhcGgoe1xuICAgIHJhbmtkaXI6IFwiVEJcIixcbiAgICBub2Rlc2VwOiAxMCxcbiAgICByYW5rc2VwOiAxMCxcbiAgICBtYXJnaW54OiA4LFxuICAgIG1hcmdpbnk6IDhcbiAgfSk7XG4gIGZvciAoY29uc3QgYmxvY2sgb2YgYmxvY2tzMikge1xuICAgIGlmIChibG9jay5zaXplKSB7XG4gICAgICBnLnNldE5vZGUoYmxvY2suaWQsIHtcbiAgICAgICAgd2lkdGg6IGJsb2NrLnNpemUud2lkdGgsXG4gICAgICAgIGhlaWdodDogYmxvY2suc2l6ZS5oZWlnaHQsXG4gICAgICAgIGludGVyc2VjdDogYmxvY2suaW50ZXJzZWN0XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBlZGdlIG9mIGVkZ2VzKSB7XG4gICAgaWYgKGVkZ2Uuc3RhcnQgJiYgZWRnZS5lbmQpIHtcbiAgICAgIGNvbnN0IHN0YXJ0QmxvY2sgPSBkYjIuZ2V0QmxvY2soZWRnZS5zdGFydCk7XG4gICAgICBjb25zdCBlbmRCbG9jayA9IGRiMi5nZXRCbG9jayhlZGdlLmVuZCk7XG4gICAgICBpZiAoc3RhcnRCbG9jaz8uc2l6ZSAmJiBlbmRCbG9jaz8uc2l6ZSkge1xuICAgICAgICBjb25zdCBzdGFydDIgPSBzdGFydEJsb2NrLnNpemU7XG4gICAgICAgIGNvbnN0IGVuZDIgPSBlbmRCbG9jay5zaXplO1xuICAgICAgICBjb25zdCBwb2ludHMgPSBbXG4gICAgICAgICAgeyB4OiBzdGFydDIueCwgeTogc3RhcnQyLnkgfSxcbiAgICAgICAgICB7IHg6IHN0YXJ0Mi54ICsgKGVuZDIueCAtIHN0YXJ0Mi54KSAvIDIsIHk6IHN0YXJ0Mi55ICsgKGVuZDIueSAtIHN0YXJ0Mi55KSAvIDIgfSxcbiAgICAgICAgICB7IHg6IGVuZDIueCwgeTogZW5kMi55IH1cbiAgICAgICAgXTtcbiAgICAgICAgY29uc3QgcHJlZml4ZWRFZGdlSWQgPSBpZCA/IGAke2lkfS0ke2VkZ2UuaWR9YCA6IGVkZ2UuaWQ7XG4gICAgICAgIGNvbnN0IHRoaWNrbmVzc0NsYXNzID0gZWRnZS50aGlja25lc3MgPT09IFwidGhpY2tcIiA/IFwiZWRnZS10aGlja25lc3MtdGhpY2tcIiA6IFwiZWRnZS10aGlja25lc3Mtbm9ybWFsXCI7XG4gICAgICAgIGNvbnN0IHBhdHRlcm5DbGFzcyA9IGVkZ2UucGF0dGVybiA9PT0gXCJkb3R0ZWRcIiA/IFwiZWRnZS1wYXR0ZXJuLWRvdHRlZFwiIDogXCJlZGdlLXBhdHRlcm4tc29saWRcIjtcbiAgICAgICAgY29uc3QgZHluYW1pY0NsYXNzZXMgPSBgJHt0aGlja25lc3NDbGFzc30gJHtwYXR0ZXJuQ2xhc3N9IGZsb3djaGFydC1saW5rIExTLWExIExFLWIxYDtcbiAgICAgICAgaW5zZXJ0RWRnZShcbiAgICAgICAgICBlbGVtLFxuICAgICAgICAgIHsgdjogZWRnZS5zdGFydCwgdzogZWRnZS5lbmQsIG5hbWU6IHByZWZpeGVkRWRnZUlkIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgLi4uZWRnZSxcbiAgICAgICAgICAgIGlkOiBwcmVmaXhlZEVkZ2VJZCxcbiAgICAgICAgICAgIGFycm93VHlwZUVuZDogZWRnZS5hcnJvd1R5cGVFbmQsXG4gICAgICAgICAgICBhcnJvd1R5cGVTdGFydDogZWRnZS5hcnJvd1R5cGVTdGFydCxcbiAgICAgICAgICAgIHBvaW50cyxcbiAgICAgICAgICAgIGNsYXNzZXM6IGR5bmFtaWNDbGFzc2VzXG4gICAgICAgICAgfSxcbiAgICAgICAgICB2b2lkIDAsXG4gICAgICAgICAgXCJibG9ja1wiLFxuICAgICAgICAgIGcsXG4gICAgICAgICAgaWRcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKGVkZ2UubGFiZWwpIHtcbiAgICAgICAgICBhd2FpdCBpbnNlcnRFZGdlTGFiZWwoZWxlbSwge1xuICAgICAgICAgICAgLi4uZWRnZSxcbiAgICAgICAgICAgIGxhYmVsOiBlZGdlLmxhYmVsLFxuICAgICAgICAgICAgbGFiZWxTdHlsZTogXCJzdHJva2U6ICMzMzM7IHN0cm9rZS13aWR0aDogMS41cHg7ZmlsbDpub25lO1wiLFxuICAgICAgICAgICAgYXJyb3dUeXBlRW5kOiBlZGdlLmFycm93VHlwZUVuZCxcbiAgICAgICAgICAgIGFycm93VHlwZVN0YXJ0OiBlZGdlLmFycm93VHlwZVN0YXJ0LFxuICAgICAgICAgICAgcG9pbnRzLFxuICAgICAgICAgICAgY2xhc3NlczogZHluYW1pY0NsYXNzZXNcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBwb3NpdGlvbkVkZ2VMYWJlbChcbiAgICAgICAgICAgIHsgLi4uZWRnZSwgeDogcG9pbnRzWzFdLngsIHk6IHBvaW50c1sxXS55IH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG9yaWdpbmFsUGF0aDogcG9pbnRzXG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuX19uYW1lKGluc2VydEVkZ2VzLCBcImluc2VydEVkZ2VzXCIpO1xuXG4vLyBzcmMvZGlhZ3JhbXMvYmxvY2svYmxvY2tSZW5kZXJlci50c1xudmFyIGdldENsYXNzZXMyID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShmdW5jdGlvbih0ZXh0LCBkaWFnT2JqKSB7XG4gIHJldHVybiBkaWFnT2JqLmRiLmdldENsYXNzZXMoKTtcbn0sIFwiZ2V0Q2xhc3Nlc1wiKTtcbnZhciBkcmF3ID0gLyogQF9fUFVSRV9fICovIF9fbmFtZShhc3luYyBmdW5jdGlvbih0ZXh0LCBpZCwgX3ZlcnNpb24sIGRpYWdPYmopIHtcbiAgY29uc3QgeyBzZWN1cml0eUxldmVsLCBibG9jazogY29uZiB9ID0gZ2V0Q29uZmlnKCk7XG4gIGNvbnN0IGRiMiA9IGRpYWdPYmouZGI7XG4gIGRiMi5zZXREaWFncmFtSWQoaWQpO1xuICBsZXQgc2FuZGJveEVsZW1lbnQ7XG4gIGlmIChzZWN1cml0eUxldmVsID09PSBcInNhbmRib3hcIikge1xuICAgIHNhbmRib3hFbGVtZW50ID0gZDNzZWxlY3QoXCIjaVwiICsgaWQpO1xuICB9XG4gIGNvbnN0IHJvb3QgPSBzZWN1cml0eUxldmVsID09PSBcInNhbmRib3hcIiA/IGQzc2VsZWN0KHNhbmRib3hFbGVtZW50Lm5vZGVzKClbMF0uY29udGVudERvY3VtZW50LmJvZHkpIDogZDNzZWxlY3QoXCJib2R5XCIpO1xuICBjb25zdCBzdmcgPSBzZWN1cml0eUxldmVsID09PSBcInNhbmRib3hcIiA/IHJvb3Quc2VsZWN0KGBbaWQ9XCIke2lkfVwiXWApIDogZDNzZWxlY3QoYFtpZD1cIiR7aWR9XCJdYCk7XG4gIGNvbnN0IG1hcmtlcnMyID0gW1wicG9pbnRcIiwgXCJjaXJjbGVcIiwgXCJjcm9zc1wiXTtcbiAgbWFya2Vyc19kZWZhdWx0KHN2ZywgbWFya2VyczIsIGRpYWdPYmoudHlwZSwgaWQpO1xuICBjb25zdCBibCA9IGRiMi5nZXRCbG9ja3MoKTtcbiAgY29uc3QgYmxBcnIgPSBkYjIuZ2V0QmxvY2tzRmxhdCgpO1xuICBjb25zdCBlZGdlcyA9IGRiMi5nZXRFZGdlcygpO1xuICBjb25zdCBub2RlcyA9IHN2Zy5pbnNlcnQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImJsb2NrXCIpO1xuICBhd2FpdCBjYWxjdWxhdGVCbG9ja1NpemVzKG5vZGVzLCBibCwgZGIyKTtcbiAgY29uc3QgYm91bmRzID0gbGF5b3V0KGRiMik7XG4gIGF3YWl0IGluc2VydEJsb2Nrcyhub2RlcywgYmwsIGRiMik7XG4gIGF3YWl0IGluc2VydEVkZ2VzKG5vZGVzLCBlZGdlcywgYmxBcnIsIGRiMiwgaWQpO1xuICBpZiAoYm91bmRzKSB7XG4gICAgY29uc3QgYm91bmRzMiA9IGJvdW5kcztcbiAgICBjb25zdCBtYWdpY0ZhY3RvciA9IE1hdGgubWF4KDEsIE1hdGgucm91bmQoMC4xMjUgKiAoYm91bmRzMi53aWR0aCAvIGJvdW5kczIuaGVpZ2h0KSkpO1xuICAgIGNvbnN0IGhlaWdodCA9IGJvdW5kczIuaGVpZ2h0ICsgbWFnaWNGYWN0b3IgKyAxMDtcbiAgICBjb25zdCB3aWR0aCA9IGJvdW5kczIud2lkdGggKyAxMDtcbiAgICBjb25zdCB7IHVzZU1heFdpZHRoIH0gPSBjb25mO1xuICAgIGNvbmZpZ3VyZVN2Z1NpemUoc3ZnLCBoZWlnaHQsIHdpZHRoLCAhIXVzZU1heFdpZHRoKTtcbiAgICBsb2cuZGVidWcoXCJIZXJlIEJvdW5kc1wiLCBib3VuZHMsIGJvdW5kczIpO1xuICAgIHN2Zy5hdHRyKFxuICAgICAgXCJ2aWV3Qm94XCIsXG4gICAgICBgJHtib3VuZHMyLnggLSA1fSAke2JvdW5kczIueSAtIDV9ICR7Ym91bmRzMi53aWR0aCArIDEwfSAke2JvdW5kczIuaGVpZ2h0ICsgMTB9YFxuICAgICk7XG4gIH1cbn0sIFwiZHJhd1wiKTtcbnZhciBibG9ja1JlbmRlcmVyX2RlZmF1bHQgPSB7XG4gIGRyYXcsXG4gIGdldENsYXNzZXM6IGdldENsYXNzZXMyXG59O1xuXG4vLyBzcmMvZGlhZ3JhbXMvYmxvY2svYmxvY2tEaWFncmFtLnRzXG52YXIgZGlhZ3JhbSA9IHtcbiAgcGFyc2VyOiBibG9ja19kZWZhdWx0LFxuICBkYjogYmxvY2tEQl9kZWZhdWx0LFxuICByZW5kZXJlcjogYmxvY2tSZW5kZXJlcl9kZWZhdWx0LFxuICBzdHlsZXM6IHN0eWxlc19kZWZhdWx0XG59O1xuZXhwb3J0IHtcbiAgZGlhZ3JhbVxufTtcbiIKICBdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQ0EsSUFBSSxTQUFVLFFBQVEsR0FBRztBQUFBLEVBQ3ZCLElBQUksb0JBQW9CLE9BQU8sUUFBUSxDQUFDLEdBQUcsR0FBRyxJQUFJLEdBQUc7QUFBQSxJQUNuRCxLQUFLLEtBQUssTUFBTSxDQUFDLEdBQUcsSUFBSSxFQUFFLE9BQVEsS0FBSyxHQUFHLEVBQUUsTUFBTTtBQUFBO0FBQUEsSUFDbEQsT0FBTztBQUFBLEtBQ04sR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcs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LEtBQUssR0FBRyxLQUFLLEdBQUcsWUFBWSxHQUFHLElBQUksS0FBSyxFQUFFO0FBQUEsVUFDaEY7QUFBQSxhQUNHO0FBQUEsVUFDSCxLQUFLLElBQUksRUFBRSxNQUFNLGVBQWUsSUFBSSxHQUFHLEtBQUssR0FBRyxLQUFLLEdBQUcsV0FBVyxHQUFHLElBQUksS0FBSyxFQUFFO0FBQUEsVUFDaEY7QUFBQTtBQUFBLE9BRUgsV0FBVztBQUFBLElBQ2QsT0FBTyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxLQUFLLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEtBQUssSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksS0FBSyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksS0FBSyxJQUFJLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxLQUFLLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLElBQUksSUFBSSxJQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdB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QUksS0FBSyxLQUFLLEtBQUssR0FBRyxHQUFHLFdBQWEsTUFBTSxHQUFHLFdBQWEsRUFBRSxPQUFTLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxHQUFHLFdBQWEsTUFBTSxHQUFHLGFBQWUsRUFBRSxPQUFTLENBQUMsSUFBSSxJQUFJLEVBQUUsR0FBRyxXQUFhLE1BQU0sR0FBRyxNQUFRLEVBQUUsT0FBUyxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUUsR0FBRyxXQUFhLE1BQU0sR0FBRyxXQUFhLEVBQUUsT0FBUyxDQUFDLEdBQUcsSUFBSSxJQUFJLEVBQUUsR0FBRyxXQUFhLE1BQU0sR0FBRyxPQUFTLEVBQUUsT0FBUyxDQUFDLEdBQUcsV0FBYSxNQUFNLEdBQUcsUUFBVSxFQUFFLE9BQVMsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLEdBQUcsV0FBYSxNQUFNLEdBQUcscUJBQXVCLEVBQUUsT0FBUyxDQUFDLElBQUksRUFBRSxHQUFHLFdBQWEsTUFBTSxHQUFHLFdBQWEsRUFBRSxPQUFTLENBQUMsRUFBRSxHQUFHLFdBQWEsTUFBTSxHQUFHLFdBQWEsRUFBRSxPQUFTLENBQUMsRUFBRSxHQUFHLFdBQWEsTUFBTSxHQUFHLFNBQVcsRUFBRSxPQUFTLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksR0FBRyxHQUFHLFdBQWEsS0FBSyxFQUFFO0FBQUEsSUFDanVDO0FBQUEsSUFDQSxPQUFPO0FBQUEsSUFDTjtBQUFBLEVBQ0gsUUFBUSxRQUFRO0FBQUEsRUFDaEIsU0FBUyxNQUFNLEdBQUc7QUFBQSxJQUNoQixLQUFLLEtBQUssQ0FBQztBQUFBO0FBQUEsRUFFYixPQUFPLFFBQVEsUUFBUTtBQUFBLEVBQ3ZCLE9BQU8sWUFBWTtBQUFBLEVBQ25CLFFBQVEsU0FBUztBQUFBLEVBQ2pCLE9BQU8sSUFBSTtBQUFBLEVBQ1Y7QUFDSCxPQUFPLFNBQVM7QUFDaEIsSUFBSSxnQkFBZ0I7QUFJcEIsSUFBSSxnQ0FBZ0MsSUFBSTtBQUN4QyxJQUFJLFdBQVcsQ0FBQztBQUNoQixJQUFJLDRCQUE0QixJQUFJO0FBQ3BDLElBQUksZ0JBQWdCO0FBQ3BCLElBQUksZUFBZTtBQUNuQixJQUFJLFVBQVU7QUFDZCxJQUFJLGlCQUFpQjtBQUNyQixJQUFJLFNBQVMsV0FBVztBQUN4QixJQUFJLDBCQUEwQixJQUFJO0FBQ2xDLElBQUksWUFBWTtBQUNoQixJQUFJLGdDQUFnQyxPQUFPLENBQUMsUUFBUSxlQUFlLGFBQWEsS0FBSyxNQUFNLEdBQUcsY0FBYztBQUM1RyxJQUFJLGdDQUFnQyxPQUFPLFFBQVEsQ0FBQyxJQUFJLGtCQUFrQixJQUFJO0FBQUEsRUFDNUUsSUFBSSxhQUFhLFFBQVEsSUFBSSxFQUFFO0FBQUEsRUFDL0IsSUFBSSxDQUFDLFlBQVk7QUFBQSxJQUNmLGFBQWEsRUFBRSxJQUFJLFFBQVEsQ0FBQyxHQUFHLFlBQVksQ0FBQyxFQUFFO0FBQUEsSUFDOUMsUUFBUSxJQUFJLElBQUksVUFBVTtBQUFBLEVBQzVCO0FBQUEsRUFDQSxJQUFJLG9CQUF5QixhQUFLLG9CQUFvQixNQUFNO0FBQUEsSUFDMUQsZ0JBQWdCLE1BQU0sY0FBYyxFQUFFLFFBQVEsQ0FBQyxXQUFXO0FBQUEsTUFDeEQsTUFBTSxjQUFjLE9BQU8sUUFBUSxZQUFZLElBQUksRUFBRSxLQUFLO0FBQUEsTUFDMUQsSUFBSSxPQUFPLGFBQWEsRUFBRSxLQUFLLE1BQU0sR0FBRztBQUFBLFFBQ3RDLE1BQU0sWUFBWSxZQUFZLFFBQVEsY0FBYyxPQUFPO0FBQUEsUUFDM0QsTUFBTSxZQUFZLFVBQVUsUUFBUSxlQUFlLFlBQVk7QUFBQSxRQUMvRCxXQUFXLFdBQVcsS0FBSyxTQUFTO0FBQUEsTUFDdEM7QUFBQSxNQUNBLFdBQVcsT0FBTyxLQUFLLFdBQVc7QUFBQSxLQUNuQztBQUFBLEVBQ0g7QUFBQSxHQUNDLGVBQWU7QUFDbEIsSUFBSSxnQ0FBZ0MsT0FBTyxRQUFRLENBQUMsSUFBSSxTQUFTLElBQUk7QUFBQSxFQUNuRSxNQUFNLGFBQWEsY0FBYyxJQUFJLEVBQUU7QUFBQSxFQUN2QyxJQUFJLFdBQWdCLGFBQUssV0FBVyxNQUFNO0FBQUEsSUFDeEMsV0FBVyxTQUFTLE9BQU8sTUFBTSxjQUFjO0FBQUEsRUFDakQ7QUFBQSxHQUNDLGVBQWU7QUFDbEIsSUFBSSw4QkFBOEIsT0FBTyxRQUFRLENBQUMsU0FBUyxjQUFjO0FBQUEsRUFDdkUsUUFBUSxNQUFNLEdBQUcsRUFBRSxRQUFRLFFBQVEsQ0FBQyxJQUFJO0FBQUEsSUFDdEMsSUFBSSxhQUFhLGNBQWMsSUFBSSxFQUFFO0FBQUEsSUFDckMsSUFBSSxlQUFvQixXQUFHO0FBQUEsTUFDekIsTUFBTSxZQUFZLEdBQUcsS0FBSztBQUFBLE1BQzFCLGFBQWEsRUFBRSxJQUFJLFdBQVcsTUFBTSxNQUFNLFVBQVUsQ0FBQyxFQUFFO0FBQUEsTUFDdkQsY0FBYyxJQUFJLFdBQVcsVUFBVTtBQUFBLElBQ3pDO0FBQUEsSUFDQSxJQUFJLENBQUMsV0FBVyxTQUFTO0FBQUEsTUFDdkIsV0FBVyxVQUFVLENBQUM7QUFBQSxJQUN4QjtBQUFBLElBQ0EsV0FBVyxRQUFRLEtBQUssWUFBWTtBQUFBLEdBQ3JDO0FBQUEsR0FDQSxhQUFhO0FBQ2hCLElBQUksd0NBQXdDLE9BQU8sQ0FBQyxZQUFZLFdBQVc7QUFBQSxFQUN6RSxNQUFNLFlBQVksV0FBVyxLQUFLO0FBQUEsRUFDbEMsTUFBTSxXQUFXLENBQUM7QUFBQSxFQUNsQixNQUFNLHFCQUFxQixVQUFVLEtBQUssQ0FBQyxNQUFNLEdBQUcsU0FBUyxnQkFBZ0I7QUFBQSxFQUM3RSxNQUFNLFNBQVMsb0JBQW9CLFdBQVc7QUFBQSxFQUM5QyxXQUFXLFNBQVMsV0FBVztBQUFBLElBQzdCLElBQUksT0FBTyxXQUFXLFlBQVksU0FBUyxLQUFLLE1BQU0sU0FBUyxvQkFBb0IsT0FBTyxNQUFNLG1CQUFtQixZQUFZLE1BQU0saUJBQWlCLFFBQVE7QUFBQSxNQUM1SixJQUFJLEtBQ0YsU0FBUyxNQUFNLFlBQVksTUFBTSxrREFBa0QsUUFDckY7QUFBQSxJQUNGO0FBQUEsSUFDQSxJQUFJLE1BQU0sT0FBTztBQUFBLE1BQ2YsTUFBTSxRQUFRLGNBQWMsTUFBTSxLQUFLO0FBQUEsSUFDekM7QUFBQSxJQUNBLElBQUksTUFBTSxTQUFTLFlBQVk7QUFBQSxNQUM3QixjQUFjLE1BQU0sSUFBSSxNQUFNLEdBQUc7QUFBQSxNQUNqQztBQUFBLElBQ0Y7QUFBQSxJQUNBLElBQUksTUFBTSxTQUFTLGNBQWM7QUFBQSxNQUMvQixZQUFZLE1BQU0sSUFBSSxPQUFPLGNBQWMsRUFBRTtBQUFBLE1BQzdDO0FBQUEsSUFDRjtBQUFBLElBQ0EsSUFBSSxNQUFNLFNBQVMsZUFBZTtBQUFBLE1BQ2hDLElBQUksT0FBTyxXQUFXO0FBQUEsUUFDcEIsY0FBYyxNQUFNLElBQUksT0FBTyxTQUFTO0FBQUEsTUFDMUM7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsSUFBSSxNQUFNLFNBQVMsa0JBQWtCO0FBQUEsTUFDbkMsT0FBTyxVQUFVLE1BQU0sV0FBVztBQUFBLElBQ3BDLEVBQU8sU0FBSSxNQUFNLFNBQVMsUUFBUTtBQUFBLE1BQ2hDLE1BQU0sU0FBUyxVQUFVLElBQUksTUFBTSxFQUFFLEtBQUssS0FBSztBQUFBLE1BQy9DLFVBQVUsSUFBSSxNQUFNLElBQUksS0FBSztBQUFBLE1BQzdCLE1BQU0sS0FBSyxRQUFRLE1BQU0sTUFBTTtBQUFBLE1BQy9CLFNBQVMsS0FBSyxLQUFLO0FBQUEsSUFDckIsRUFBTztBQUFBLE1BQ0wsSUFBSSxDQUFDLE1BQU0sT0FBTztBQUFBLFFBQ2hCLElBQUksTUFBTSxTQUFTLGFBQWE7QUFBQSxVQUM5QixNQUFNLFFBQVE7QUFBQSxRQUNoQixFQUFPO0FBQUEsVUFDTCxNQUFNLFFBQVEsTUFBTTtBQUFBO0FBQUEsTUFFeEI7QUFBQSxNQUNBLE1BQU0sZ0JBQWdCLGNBQWMsSUFBSSxNQUFNLEVBQUU7QUFBQSxNQUNoRCxJQUFJLGtCQUF1QixXQUFHO0FBQUEsUUFDNUIsY0FBYyxJQUFJLE1BQU0sSUFBSSxLQUFLO0FBQUEsTUFDbkMsRUFBTztBQUFBLFFBQ0wsSUFBSSxNQUFNLFNBQVMsTUFBTTtBQUFBLFVBQ3ZCLGNBQWMsT0FBTyxNQUFNO0FBQUEsUUFDN0I7QUFBQSxRQUNBLElBQUksTUFBTSxVQUFVLE1BQU0sSUFBSTtBQUFBLFVBQzVCLGNBQWMsUUFBUSxNQUFNO0FBQUEsUUFDOUI7QUFBQTtBQUFBLE1BRUYsSUFBSSxNQUFNLFVBQVU7QUFBQSxRQUNsQixzQkFBc0IsTUFBTSxVQUFVLEtBQUs7QUFBQSxNQUM3QztBQUFBLE1BQ0EsSUFBSSxNQUFNLFNBQVMsU0FBUztBQUFBLFFBQzFCLE1BQU0sSUFBSSxNQUFNLFNBQVM7QUFBQSxRQUN6QixTQUFTLElBQUksRUFBRyxJQUFJLEdBQUcsS0FBSztBQUFBLFVBQzFCLE1BQU0sV0FBVyxNQUFNLEtBQUs7QUFBQSxVQUM1QixTQUFTLEtBQUssU0FBUyxLQUFLLE1BQU07QUFBQSxVQUNsQyxjQUFjLElBQUksU0FBUyxJQUFJLFFBQVE7QUFBQSxVQUN2QyxTQUFTLEtBQUssUUFBUTtBQUFBLFFBQ3hCO0FBQUEsTUFDRixFQUFPLFNBQUksa0JBQXVCLFdBQUc7QUFBQSxRQUNuQyxTQUFTLEtBQUssS0FBSztBQUFBLE1BQ3JCO0FBQUE7QUFBQSxFQUVKO0FBQUEsRUFDQSxPQUFPLFdBQVc7QUFBQSxHQUNqQix1QkFBdUI7QUFDMUIsSUFBSSxTQUFTLENBQUM7QUFDZCxJQUFJLFlBQVksRUFBRSxJQUFJLFFBQVEsTUFBTSxhQUFhLFVBQVUsQ0FBQyxHQUFHLFNBQVMsR0FBRztBQUMzRSxJQUFJLHlCQUF5QixPQUFPLE1BQU07QUFBQSxFQUN4QyxJQUFJLE1BQU0sY0FBYztBQUFBLEVBQ3hCLE1BQU07QUFBQSxFQUNOLFlBQVksRUFBRSxJQUFJLFFBQVEsTUFBTSxhQUFhLFVBQVUsQ0FBQyxHQUFHLFNBQVMsR0FBRztBQUFBLEVBQ3ZFLGdDQUFnQyxJQUFJLElBQUksQ0FBQyxDQUFDLFFBQVEsU0FBUyxDQUFDLENBQUM7QUFBQSxFQUM3RCxTQUFTLENBQUM7QUFBQSxFQUNWLDBCQUEwQixJQUFJO0FBQUEsRUFDOUIsV0FBVyxDQUFDO0FBQUEsRUFDWiw0QkFBNEIsSUFBSTtBQUFBLEVBQ2hDLFlBQVk7QUFBQSxHQUNYLE9BQU87QUFDVixTQUFTLFlBQVksQ0FBQyxTQUFTO0FBQUEsRUFDN0IsSUFBSSxNQUFNLGdCQUFnQixPQUFPO0FBQUEsRUFDakMsUUFBUTtBQUFBLFNBQ0Q7QUFBQSxNQUNILE9BQU87QUFBQSxTQUNKO0FBQUEsTUFDSCxJQUFJLE1BQU0saUJBQWlCO0FBQUEsTUFDM0IsT0FBTztBQUFBLFNBQ0o7QUFBQSxNQUNILE9BQU87QUFBQSxTQUNKO0FBQUEsTUFDSCxPQUFPO0FBQUEsU0FDSjtBQUFBLE1BQ0gsT0FBTztBQUFBLFNBQ0o7QUFBQSxNQUNILE9BQU87QUFBQSxTQUNKO0FBQUEsTUFDSCxPQUFPO0FBQUEsU0FDSjtBQUFBLE1BQ0gsT0FBTztBQUFBLFNBQ0o7QUFBQSxNQUNILE9BQU87QUFBQSxTQUNKO0FBQUEsTUFDSCxPQUFPO0FBQUEsU0FDSjtBQUFBLE1BQ0gsT0FBTztBQUFBLFNBQ0o7QUFBQSxNQUNILE9BQU87QUFBQSxTQUNKO0FBQUEsTUFDSCxPQUFPO0FBQUEsU0FDSjtBQUFBLE1BQ0gsT0FBTztBQUFBLFNBQ0o7QUFBQSxNQUNILE9BQU87QUFBQTtBQUFBLE1BRVAsT0FBTztBQUFBO0FBQUE7QUFHYixPQUFPLGNBQWMsY0FBYztBQUNuQyxTQUFTLGdCQUFnQixDQUFDLFNBQVM7QUFBQSxFQUNqQyxJQUFJLE1BQU0sZ0JBQWdCLE9BQU87QUFBQSxFQUNqQyxRQUFRO0FBQUEsU0FDRDtBQUFBLE1BQ0gsT0FBTztBQUFBO0FBQUEsTUFFUCxPQUFPO0FBQUE7QUFBQTtBQUdiLE9BQU8sa0JBQWtCLGtCQUFrQjtBQUMzQyxTQUFTLGlCQUFpQixDQUFDLFNBQVM7QUFBQSxFQUNsQyxNQUFNLFdBQVcsUUFBUSxLQUFLLEVBQUUsTUFBTSxFQUFFO0FBQUEsRUFDeEMsUUFBUTtBQUFBLFNBQ0Q7QUFBQSxNQUNILE9BQU87QUFBQSxTQUNKO0FBQUEsTUFDSCxPQUFPO0FBQUEsU0FDSjtBQUFBLE1BQ0gsT0FBTztBQUFBO0FBQUEsTUFFUCxPQUFPO0FBQUE7QUFBQTtBQUdiLE9BQU8sbUJBQW1CLG1CQUFtQjtBQUM3QyxTQUFTLHNCQUFzQixDQUFDLFNBQVM7QUFBQSxFQUN2QyxNQUFNLFlBQVksUUFBUSxLQUFLLEVBQUUsT0FBTyxDQUFDO0FBQUEsRUFDekMsUUFBUTtBQUFBLFNBQ0Q7QUFBQSxNQUNILE9BQU87QUFBQSxTQUNKO0FBQUEsTUFDSCxPQUFPO0FBQUEsU0FDSjtBQUFBLE1BQ0gsT0FBTztBQUFBO0FBQUEsTUFFUCxPQUFPO0FBQUE7QUFBQTtBQUdiLE9BQU8sd0JBQXdCLHdCQUF3QjtBQUN2RCxTQUFTLGtCQUFrQixDQUFDLFNBQVM7QUFBQSxFQUNuQyxPQUFPLFFBQVEsU0FBUyxJQUFJLElBQUksVUFBVTtBQUFBO0FBRTVDLE9BQU8sb0JBQW9CLG9CQUFvQjtBQUMvQyxTQUFTLGdCQUFnQixDQUFDLFNBQVM7QUFBQSxFQUNqQyxJQUFJLFFBQVEsU0FBUyxJQUFJLEdBQUc7QUFBQSxJQUMxQixPQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsT0FBTztBQUFBO0FBRVQsT0FBTyxrQkFBa0Isa0JBQWtCO0FBQzNDLElBQUksTUFBTTtBQUNWLElBQUksNkJBQTZCLE9BQU8sTUFBTTtBQUFBLEVBQzVDO0FBQUEsRUFDQSxPQUFPLFFBQVEsS0FBSyxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsT0FBTyxHQUFHLEVBQUUsSUFBSSxNQUFNO0FBQUEsR0FDL0QsWUFBWTtBQUNmLElBQUksK0JBQStCLE9BQU8sQ0FBQyxVQUFVO0FBQUEsRUFDbkQsVUFBVSxXQUFXO0FBQUEsRUFDckIsc0JBQXNCLE9BQU8sU0FBUztBQUFBLEVBQ3RDLFNBQVMsVUFBVTtBQUFBLEdBQ2xCLGNBQWM7QUFDakIsSUFBSSw2QkFBNkIsT0FBTyxDQUFDLFlBQVk7QUFBQSxFQUNuRCxNQUFNLFFBQVEsY0FBYyxJQUFJLE9BQU87QUFBQSxFQUN2QyxJQUFJLENBQUMsT0FBTztBQUFBLElBQ1YsT0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLElBQUksTUFBTSxTQUFTO0FBQUEsSUFDakIsT0FBTyxNQUFNO0FBQUEsRUFDZjtBQUFBLEVBQ0EsSUFBSSxDQUFDLE1BQU0sVUFBVTtBQUFBLElBQ25CLE9BQU87QUFBQSxFQUNUO0FBQUEsRUFDQSxPQUFPLE1BQU0sU0FBUztBQUFBLEdBQ3JCLFlBQVk7QUFDZixJQUFJLGdDQUFnQyxPQUFPLE1BQU07QUFBQSxFQUMvQyxPQUFPLENBQUMsR0FBRyxjQUFjLE9BQU8sQ0FBQztBQUFBLEdBQ2hDLGVBQWU7QUFDbEIsSUFBSSw0QkFBNEIsT0FBTyxNQUFNO0FBQUEsRUFDM0MsT0FBTyxVQUFVLENBQUM7QUFBQSxHQUNqQixXQUFXO0FBQ2QsSUFBSSwyQkFBMkIsT0FBTyxNQUFNO0FBQUEsRUFDMUMsT0FBTztBQUFBLEdBQ04sVUFBVTtBQUNiLElBQUksMkJBQTJCLE9BQU8sQ0FBQyxPQUFPO0FBQUEsRUFDNUMsT0FBTyxjQUFjLElBQUksRUFBRTtBQUFBLEdBQzFCLFVBQVU7QUFDYixJQUFJLDJCQUEyQixPQUFPLENBQUMsVUFBVTtBQUFBLEVBQy9DLGNBQWMsSUFBSSxNQUFNLElBQUksS0FBSztBQUFBLEdBQ2hDLFVBQVU7QUFDYixJQUFJLCtCQUErQixPQUFPLENBQUMsT0FBTztBQUFBLEVBQ2hELFlBQVk7QUFBQSxHQUNYLGNBQWM7QUFDakIsSUFBSSwrQkFBK0IsT0FBTyxNQUFNLFdBQVcsY0FBYztBQUN6RSxJQUFJLDRCQUE0QixPQUFPLE1BQU0sS0FBSyxXQUFXO0FBQzdELElBQUksNkJBQTZCLE9BQU8sUUFBUSxHQUFHO0FBQUEsRUFDakQsT0FBTztBQUFBLEdBQ04sWUFBWTtBQUNmLElBQUksS0FBSztBQUFBLEVBQ1AsMkJBQTJCLE9BQU8sTUFBTSxVQUFVLEVBQUUsT0FBTyxXQUFXO0FBQUEsRUFDdEU7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0EsT0FBTztBQUFBLEVBQ1A7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGO0FBQ0EsSUFBSSxrQkFBa0I7QUFJdEIsSUFBSSx1QkFBdUIsT0FBTyxDQUFDLE9BQU8sWUFBWTtBQUFBLEVBQ3BELE1BQU0sV0FBa0I7QUFBQSxFQUN4QixNQUFNLElBQUksU0FBUyxPQUFPLEdBQUc7QUFBQSxFQUM3QixNQUFNLElBQUksU0FBUyxPQUFPLEdBQUc7QUFBQSxFQUM3QixNQUFNLElBQUksU0FBUyxPQUFPLEdBQUc7QUFBQSxFQUM3QixPQUFjLGFBQUssR0FBRyxHQUFHLEdBQUcsT0FBTztBQUFBLEdBQ2xDLE1BQU07QUFDVCxJQUFJLDRCQUE0QixPQUFPLENBQUMsWUFBWTtBQUFBLG1CQUNqQyxRQUFRO0FBQUEsYUFDZCxRQUFRLGlCQUFpQixRQUFRO0FBQUE7QUFBQTtBQUFBLFlBR2xDLFFBQVE7QUFBQTtBQUFBO0FBQUEsYUFHUCxRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBTVQsUUFBUSxpQkFBaUIsUUFBUTtBQUFBLGFBQ2hDLFFBQVEsaUJBQWlCLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBUWxDLFFBQVE7QUFBQSxjQUNOLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsWUFxQlYsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBLGNBSU4sUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FLUixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSx3QkFLRSxRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSwwQkFjTixRQUFRO0FBQUEsY0FDcEIsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQU9FLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQUlqQixLQUFLLFFBQVEsU0FBUyxHQUFHO0FBQUEsWUFDNUIsS0FBSyxRQUFRLFlBQVksR0FBRztBQUFBLGNBQzFCLEtBQUssUUFBUSxlQUFlLEdBQUc7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsWUFNakMsUUFBUTtBQUFBO0FBQUE7QUFBQTtBQUFBLGFBSVAsUUFBUTtBQUFBO0FBQUE7QUFBQSxhQUdSLFFBQVE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQVFGLFFBQVE7QUFBQTtBQUFBLGtCQUVULFFBQVE7QUFBQSx3QkFDRixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFlBU3BCLFFBQVE7QUFBQTtBQUFBLElBRWhCLGNBQWM7QUFBQSxHQUNmLFdBQVc7QUFDZCxJQUFJLGlCQUFpQjtBQU1yQixJQUFJLGdDQUFnQyxPQUFPLENBQUMsTUFBTSxhQUFhLE1BQU0sT0FBTztBQUFBLEVBQzFFLFlBQVksUUFBUSxDQUFDLGVBQWU7QUFBQSxJQUNsQyxRQUFRLFlBQVksTUFBTSxNQUFNLEVBQUU7QUFBQSxHQUNuQztBQUFBLEdBQ0EsZUFBZTtBQUNsQixJQUFJLDRCQUE0QixPQUFPLENBQUMsTUFBTSxNQUFNLE9BQU87QUFBQSxFQUN6RCxJQUFJLE1BQU0sdUJBQXVCLEVBQUU7QUFBQSxFQUNuQyxLQUFLLE9BQU8sTUFBTSxFQUFFLE9BQU8sUUFBUSxFQUFFLEtBQUssTUFBTSxLQUFLLE1BQU0sT0FBTyxpQkFBaUIsRUFBRSxLQUFLLFNBQVMsc0JBQXNCLElBQUksRUFBRSxLQUFLLFFBQVEsRUFBRSxFQUFFLEtBQUssUUFBUSxDQUFDLEVBQUUsS0FBSyxlQUFlLEdBQUcsRUFBRSxLQUFLLGdCQUFnQixHQUFHLEVBQUUsS0FBSyxVQUFVLE1BQU0sRUFBRSxPQUFPLE1BQU0sRUFBRSxLQUFLLEtBQUssb0JBQW9CO0FBQUEsRUFDdlIsS0FBSyxPQUFPLE1BQU0sRUFBRSxPQUFPLFFBQVEsRUFBRSxLQUFLLE1BQU0sS0FBSyxNQUFNLE9BQU8sZUFBZSxFQUFFLEtBQUssU0FBUyxzQkFBc0IsSUFBSSxFQUFFLEtBQUssUUFBUSxDQUFDLEVBQUUsS0FBSyxRQUFRLENBQUMsRUFBRSxLQUFLLGVBQWUsRUFBRSxFQUFFLEtBQUssZ0JBQWdCLEVBQUUsRUFBRSxLQUFLLFVBQVUsTUFBTSxFQUFFLE9BQU8sTUFBTSxFQUFFLEtBQUssS0FBSyxvQkFBb0I7QUFBQSxHQUNqUixXQUFXO0FBQ2QsSUFBSSw4QkFBOEIsT0FBTyxDQUFDLE1BQU0sTUFBTSxPQUFPO0FBQUEsRUFDM0QsS0FBSyxPQUFPLE1BQU0sRUFBRSxPQUFPLFFBQVEsRUFBRSxLQUFLLE1BQU0sS0FBSyxNQUFNLE9BQU8sbUJBQW1CLEVBQUUsS0FBSyxTQUFTLHdCQUF3QixJQUFJLEVBQUUsS0FBSyxRQUFRLEVBQUUsRUFBRSxLQUFLLFFBQVEsQ0FBQyxFQUFFLEtBQUssZUFBZSxHQUFHLEVBQUUsS0FBSyxnQkFBZ0IsR0FBRyxFQUFFLEtBQUssVUFBVSxNQUFNLEVBQUUsT0FBTyxNQUFNLEVBQUUsS0FBSyxLQUFLLDBCQUEwQjtBQUFBLEVBQ2pTLEtBQUssT0FBTyxNQUFNLEVBQUUsT0FBTyxRQUFRLEVBQUUsS0FBSyxNQUFNLEtBQUssTUFBTSxPQUFPLGlCQUFpQixFQUFFLEtBQUssU0FBUyx3QkFBd0IsSUFBSSxFQUFFLEtBQUssUUFBUSxDQUFDLEVBQUUsS0FBSyxRQUFRLENBQUMsRUFBRSxLQUFLLGVBQWUsRUFBRSxFQUFFLEtBQUssZ0JBQWdCLEVBQUUsRUFBRSxLQUFLLFVBQVUsTUFBTSxFQUFFLE9BQU8sTUFBTSxFQUFFLEtBQUssS0FBSywwQkFBMEI7QUFBQSxHQUMzUixhQUFhO0FBQ2hCLElBQUksOEJBQThCLE9BQU8sQ0FBQyxNQUFNLE1BQU0sT0FBTztBQUFBLEVBQzNELEtBQUssT0FBTyxNQUFNLEVBQUUsT0FBTyxRQUFRLEVBQUUsS0FBSyxNQUFNLEtBQUssTUFBTSxPQUFPLG1CQUFtQixFQUFFLEtBQUssU0FBUyx3QkFBd0IsSUFBSSxFQUFFLEtBQUssUUFBUSxFQUFFLEVBQUUsS0FBSyxRQUFRLENBQUMsRUFBRSxLQUFLLGVBQWUsR0FBRyxFQUFFLEtBQUssZ0JBQWdCLEdBQUcsRUFBRSxLQUFLLFVBQVUsTUFBTSxFQUFFLE9BQU8sTUFBTSxFQUFFLEtBQUssS0FBSywwQkFBMEI7QUFBQSxFQUNqUyxLQUFLLE9BQU8sTUFBTSxFQUFFLE9BQU8sUUFBUSxFQUFFLEtBQUssTUFBTSxLQUFLLE1BQU0sT0FBTyxpQkFBaUIsRUFBRSxLQUFLLFNBQVMsd0JBQXdCLElBQUksRUFBRSxLQUFLLFFBQVEsQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLEVBQUUsS0FBSyxlQUFlLEVBQUUsRUFBRSxLQUFLLGdCQUFnQixFQUFFLEVBQUUsS0FBSyxVQUFVLE1BQU0sRUFBRSxPQUFPLE1BQU0sRUFBRSxLQUFLLEtBQUssMEJBQTBCO0FBQUEsR0FDM1IsYUFBYTtBQUNoQixJQUFJLDZCQUE2QixPQUFPLENBQUMsTUFBTSxNQUFNLE9BQU87QUFBQSxFQUMxRCxLQUFLLE9BQU8sTUFBTSxFQUFFLE9BQU8sUUFBUSxFQUFFLEtBQUssTUFBTSxLQUFLLE1BQU0sT0FBTyxrQkFBa0IsRUFBRSxLQUFLLFNBQVMsdUJBQXVCLElBQUksRUFBRSxLQUFLLFFBQVEsQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLEVBQUUsS0FBSyxlQUFlLEdBQUcsRUFBRSxLQUFLLGdCQUFnQixHQUFHLEVBQUUsS0FBSyxVQUFVLE1BQU0sRUFBRSxPQUFPLE1BQU0sRUFBRSxLQUFLLEtBQUsseUJBQXlCO0FBQUEsRUFDN1IsS0FBSyxPQUFPLE1BQU0sRUFBRSxPQUFPLFFBQVEsRUFBRSxLQUFLLE1BQU0sS0FBSyxNQUFNLE9BQU8sZ0JBQWdCLEVBQUUsS0FBSyxTQUFTLHVCQUF1QixJQUFJLEVBQUUsS0FBSyxRQUFRLEVBQUUsRUFBRSxLQUFLLFFBQVEsQ0FBQyxFQUFFLEtBQUssZUFBZSxFQUFFLEVBQUUsS0FBSyxnQkFBZ0IsRUFBRSxFQUFFLEtBQUssVUFBVSxNQUFNLEVBQUUsT0FBTyxNQUFNLEVBQUUsS0FBSyxLQUFLLDJCQUEyQjtBQUFBLEdBQzNSLFlBQVk7QUFDZixJQUFJLDJCQUEyQixPQUFPLENBQUMsTUFBTSxNQUFNLE9BQU87QUFBQSxFQUN4RCxLQUFLLE9BQU8sTUFBTSxFQUFFLE9BQU8sUUFBUSxFQUFFLEtBQUssTUFBTSxLQUFLLE1BQU0sT0FBTyxnQkFBZ0IsRUFBRSxLQUFLLFNBQVMscUJBQXFCLElBQUksRUFBRSxLQUFLLFFBQVEsRUFBRSxFQUFFLEtBQUssUUFBUSxDQUFDLEVBQUUsS0FBSyxlQUFlLEdBQUcsRUFBRSxLQUFLLGdCQUFnQixHQUFHLEVBQUUsS0FBSyxVQUFVLE1BQU0sRUFBRSxPQUFPLFFBQVEsRUFBRSxLQUFLLFVBQVUsT0FBTyxFQUFFLEtBQUssUUFBUSxhQUFhLEVBQUUsS0FBSyxNQUFNLENBQUMsRUFBRSxLQUFLLE1BQU0sQ0FBQyxFQUFFLEtBQUssS0FBSyxDQUFDO0FBQUEsRUFDcFYsS0FBSyxPQUFPLE1BQU0sRUFBRSxPQUFPLFFBQVEsRUFBRSxLQUFLLE1BQU0sS0FBSyxNQUFNLE9BQU8sY0FBYyxFQUFFLEtBQUssU0FBUyxxQkFBcUIsSUFBSSxFQUFFLEtBQUssUUFBUSxDQUFDLEVBQUUsS0FBSyxRQUFRLENBQUMsRUFBRSxLQUFLLGVBQWUsR0FBRyxFQUFFLEtBQUssZ0JBQWdCLEdBQUcsRUFBRSxLQUFLLFVBQVUsTUFBTSxFQUFFLE9BQU8sUUFBUSxFQUFFLEtBQUssVUFBVSxPQUFPLEVBQUUsS0FBSyxRQUFRLGFBQWEsRUFBRSxLQUFLLE1BQU0sQ0FBQyxFQUFFLEtBQUssTUFBTSxDQUFDLEVBQUUsS0FBSyxLQUFLLENBQUM7QUFBQSxHQUNoVixVQUFVO0FBQ2IsSUFBSSx3QkFBd0IsT0FBTyxDQUFDLE1BQU0sTUFBTSxPQUFPO0FBQUEsRUFDckQsS0FBSyxPQUFPLFFBQVEsRUFBRSxLQUFLLE1BQU0sS0FBSyxNQUFNLE9BQU8sV0FBVyxFQUFFLEtBQUssU0FBUyxZQUFZLElBQUksRUFBRSxLQUFLLFdBQVcsV0FBVyxFQUFFLEtBQUssUUFBUSxDQUFDLEVBQUUsS0FBSyxRQUFRLENBQUMsRUFBRSxLQUFLLGVBQWUsZ0JBQWdCLEVBQUUsS0FBSyxlQUFlLEVBQUUsRUFBRSxLQUFLLGdCQUFnQixFQUFFLEVBQUUsS0FBSyxVQUFVLE1BQU0sRUFBRSxPQUFPLE1BQU0sRUFBRSxLQUFLLEtBQUssdUJBQXVCLEVBQUUsS0FBSyxTQUFTLGlCQUFpQixFQUFFLE1BQU0sZ0JBQWdCLENBQUMsRUFBRSxNQUFNLG9CQUFvQixLQUFLO0FBQUEsRUFDdFosS0FBSyxPQUFPLFFBQVEsRUFBRSxLQUFLLE1BQU0sS0FBSyxNQUFNLE9BQU8sYUFBYSxFQUFFLEtBQUssU0FBUyxZQUFZLElBQUksRUFBRSxLQUFLLFdBQVcsV0FBVyxFQUFFLEtBQUssUUFBUSxHQUFHLEVBQUUsS0FBSyxRQUFRLENBQUMsRUFBRSxLQUFLLGVBQWUsZ0JBQWdCLEVBQUUsS0FBSyxlQUFlLEVBQUUsRUFBRSxLQUFLLGdCQUFnQixFQUFFLEVBQUUsS0FBSyxVQUFVLE1BQU0sRUFBRSxPQUFPLE1BQU0sRUFBRSxLQUFLLEtBQUssd0JBQXdCLEVBQUUsS0FBSyxTQUFTLGlCQUFpQixFQUFFLE1BQU0sZ0JBQWdCLENBQUMsRUFBRSxNQUFNLG9CQUFvQixLQUFLO0FBQUEsR0FDMVosT0FBTztBQUNWLElBQUkseUJBQXlCLE9BQU8sQ0FBQyxNQUFNLE1BQU0sT0FBTztBQUFBLEVBQ3RELEtBQUssT0FBTyxRQUFRLEVBQUUsS0FBSyxNQUFNLEtBQUssTUFBTSxPQUFPLFlBQVksRUFBRSxLQUFLLFNBQVMsWUFBWSxJQUFJLEVBQUUsS0FBSyxXQUFXLFdBQVcsRUFBRSxLQUFLLFFBQVEsRUFBRSxFQUFFLEtBQUssUUFBUSxDQUFDLEVBQUUsS0FBSyxlQUFlLGdCQUFnQixFQUFFLEtBQUssZUFBZSxFQUFFLEVBQUUsS0FBSyxnQkFBZ0IsRUFBRSxFQUFFLEtBQUssVUFBVSxNQUFNLEVBQUUsT0FBTyxRQUFRLEVBQUUsS0FBSyxNQUFNLEdBQUcsRUFBRSxLQUFLLE1BQU0sR0FBRyxFQUFFLEtBQUssS0FBSyxHQUFHLEVBQUUsS0FBSyxTQUFTLGlCQUFpQixFQUFFLE1BQU0sZ0JBQWdCLENBQUMsRUFBRSxNQUFNLG9CQUFvQixLQUFLO0FBQUEsRUFDdGEsS0FBSyxPQUFPLFFBQVEsRUFBRSxLQUFLLE1BQU0sS0FBSyxNQUFNLE9BQU8sY0FBYyxFQUFFLEtBQUssU0FBUyxZQUFZLElBQUksRUFBRSxLQUFLLFdBQVcsV0FBVyxFQUFFLEtBQUssUUFBUSxFQUFFLEVBQUUsS0FBSyxRQUFRLENBQUMsRUFBRSxLQUFLLGVBQWUsZ0JBQWdCLEVBQUUsS0FBSyxlQUFlLEVBQUUsRUFBRSxLQUFLLGdCQUFnQixFQUFFLEVBQUUsS0FBSyxVQUFVLE1BQU0sRUFBRSxPQUFPLFFBQVEsRUFBRSxLQUFLLE1BQU0sR0FBRyxFQUFFLEtBQUssTUFBTSxHQUFHLEVBQUUsS0FBSyxLQUFLLEdBQUcsRUFBRSxLQUFLLFNBQVMsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQyxFQUFFLE1BQU0sb0JBQW9CLEtBQUs7QUFBQSxHQUN2YSxRQUFRO0FBQ1gsSUFBSSx3QkFBd0IsT0FBTyxDQUFDLE1BQU0sTUFBTSxPQUFPO0FBQUEsRUFDckQsS0FBSyxPQUFPLFFBQVEsRUFBRSxLQUFLLE1BQU0sS0FBSyxNQUFNLE9BQU8sV0FBVyxFQUFFLEtBQUssU0FBUyxrQkFBa0IsSUFBSSxFQUFFLEtBQUssV0FBVyxXQUFXLEVBQUUsS0FBSyxRQUFRLEVBQUUsRUFBRSxLQUFLLFFBQVEsR0FBRyxFQUFFLEtBQUssZUFBZSxnQkFBZ0IsRUFBRSxLQUFLLGVBQWUsRUFBRSxFQUFFLEtBQUssZ0JBQWdCLEVBQUUsRUFBRSxLQUFLLFVBQVUsTUFBTSxFQUFFLE9BQU8sTUFBTSxFQUFFLEtBQUssS0FBSywyQkFBMkIsRUFBRSxLQUFLLFNBQVMsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQyxFQUFFLE1BQU0sb0JBQW9CLEtBQUs7QUFBQSxFQUNuYSxLQUFLLE9BQU8sUUFBUSxFQUFFLEtBQUssTUFBTSxLQUFLLE1BQU0sT0FBTyxhQUFhLEVBQUUsS0FBSyxTQUFTLGtCQUFrQixJQUFJLEVBQUUsS0FBSyxXQUFXLFdBQVcsRUFBRSxLQUFLLFFBQVEsRUFBRSxFQUFFLEtBQUssUUFBUSxHQUFHLEVBQUUsS0FBSyxlQUFlLGdCQUFnQixFQUFFLEtBQUssZUFBZSxFQUFFLEVBQUUsS0FBSyxnQkFBZ0IsRUFBRSxFQUFFLEtBQUssVUFBVSxNQUFNLEVBQUUsT0FBTyxNQUFNLEVBQUUsS0FBSyxLQUFLLDJCQUEyQixFQUFFLEtBQUssU0FBUyxpQkFBaUIsRUFBRSxNQUFNLGdCQUFnQixDQUFDLEVBQUUsTUFBTSxvQkFBb0IsS0FBSztBQUFBLEdBQ3BhLE9BQU87QUFDVixJQUFJLHVCQUF1QixPQUFPLENBQUMsTUFBTSxNQUFNLE9BQU87QUFBQSxFQUNwRCxLQUFLLE9BQU8sTUFBTSxFQUFFLE9BQU8sUUFBUSxFQUFFLEtBQUssTUFBTSxLQUFLLE1BQU0sT0FBTyxVQUFVLEVBQUUsS0FBSyxRQUFRLEVBQUUsRUFBRSxLQUFLLFFBQVEsQ0FBQyxFQUFFLEtBQUssZUFBZSxFQUFFLEVBQUUsS0FBSyxnQkFBZ0IsRUFBRSxFQUFFLEtBQUssZUFBZSxhQUFhLEVBQUUsS0FBSyxVQUFVLE1BQU0sRUFBRSxPQUFPLE1BQU0sRUFBRSxLQUFLLEtBQUssMkJBQTJCO0FBQUEsR0FDN1EsTUFBTTtBQUNULElBQUksVUFBVTtBQUFBLEVBQ1o7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUNGO0FBQ0EsSUFBSSxrQkFBa0I7QUFHdEIsSUFBSSxVQUFVLFdBQVcsR0FBRyxPQUFPLFdBQVc7QUFDOUMsU0FBUyxzQkFBc0IsQ0FBQyxTQUFTLFVBQVU7QUFBQSxFQUNqRCxJQUFJLFlBQVksS0FBSyxDQUFDLE9BQU8sVUFBVSxPQUFPLEdBQUc7QUFBQSxJQUMvQyxNQUFNLElBQUksTUFBTSxtQ0FBbUM7QUFBQSxFQUNyRDtBQUFBLEVBQ0EsSUFBSSxXQUFXLEtBQUssQ0FBQyxPQUFPLFVBQVUsUUFBUSxHQUFHO0FBQUEsSUFDL0MsTUFBTSxJQUFJLE1BQU0sNkNBQTZDLFFBQVE7QUFBQSxFQUN2RTtBQUFBLEVBQ0EsSUFBSSxVQUFVLEdBQUc7QUFBQSxJQUNmLE9BQU8sRUFBRSxJQUFJLFVBQVUsSUFBSSxFQUFFO0FBQUEsRUFDL0I7QUFBQSxFQUNBLElBQUksWUFBWSxHQUFHO0FBQUEsSUFDakIsT0FBTyxFQUFFLElBQUksR0FBRyxJQUFJLFNBQVM7QUFBQSxFQUMvQjtBQUFBLEVBQ0EsTUFBTSxLQUFLLFdBQVc7QUFBQSxFQUN0QixNQUFNLEtBQUssS0FBSyxNQUFNLFdBQVcsT0FBTztBQUFBLEVBQ3hDLE9BQU8sRUFBRSxJQUFJLEdBQUc7QUFBQTtBQUVsQixPQUFPLHdCQUF3Qix3QkFBd0I7QUFDdkQsSUFBSSxrQ0FBa0MsT0FBTyxDQUFDLFVBQVU7QUFBQSxFQUN0RCxJQUFJLFdBQVc7QUFBQSxFQUNmLElBQUksWUFBWTtBQUFBLEVBQ2hCLFdBQVcsU0FBUyxNQUFNLFVBQVU7QUFBQSxJQUNsQyxRQUFRLE9BQU8sUUFBUSxHQUFHLE1BQU0sTUFBTSxRQUFRLEVBQUUsT0FBTyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFFO0FBQUEsSUFDaEYsSUFBSSxNQUNGLGdDQUNBLE1BQU0sSUFDTixVQUNBLE9BQ0EsV0FDQSxRQUNBLE1BQ0EsR0FDQSxNQUNBLEdBQ0EsTUFBTSxJQUNSO0FBQUEsSUFDQSxJQUFJLE1BQU0sU0FBUyxTQUFTO0FBQUEsTUFDMUI7QUFBQSxJQUNGO0FBQUEsSUFDQSxNQUFNLGtCQUFrQixTQUFTLE1BQU0sa0JBQWtCO0FBQUEsSUFDekQsSUFBSSxrQkFBa0IsVUFBVTtBQUFBLE1BQzlCLFdBQVc7QUFBQSxJQUNiO0FBQUEsSUFDQSxJQUFJLFNBQVMsV0FBVztBQUFBLE1BQ3RCLFlBQVk7QUFBQSxJQUNkO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTyxFQUFFLE9BQU8sVUFBVSxRQUFRLFVBQVU7QUFBQSxHQUMzQyxpQkFBaUI7QUFDcEIsU0FBUyxhQUFhLENBQUMsT0FBTyxLQUFLLGVBQWUsR0FBRyxnQkFBZ0IsR0FBRztBQUFBLEVBQ3RFLElBQUksTUFDRiwrQkFDQSxNQUFNLElBQ04sT0FBTyxNQUFNLEdBQ2IsaUJBQ0EsT0FBTyxNQUNQLGdCQUNBLFlBQ0Y7QUFBQSxFQUNBLElBQUksQ0FBQyxPQUFPLE1BQU0sT0FBTztBQUFBLElBQ3ZCLE1BQU0sT0FBTztBQUFBLE1BQ1gsT0FBTztBQUFBLE1BQ1AsUUFBUTtBQUFBLE1BQ1IsR0FBRztBQUFBLE1BQ0gsR0FBRztBQUFBLElBQ0w7QUFBQSxFQUNGO0FBQUEsRUFDQSxJQUFJLFdBQVc7QUFBQSxFQUNmLElBQUksWUFBWTtBQUFBLEVBQ2hCLElBQUksTUFBTSxVQUFVLFNBQVMsR0FBRztBQUFBLElBQzlCLFdBQVcsU0FBUyxNQUFNLFVBQVU7QUFBQSxNQUNsQyxjQUFjLE9BQU8sR0FBRztBQUFBLElBQzFCO0FBQUEsSUFDQSxNQUFNLFlBQVksZ0JBQWdCLEtBQUs7QUFBQSxJQUN2QyxXQUFXLFVBQVU7QUFBQSxJQUNyQixZQUFZLFVBQVU7QUFBQSxJQUN0QixJQUFJLE1BQU0sbUNBQW1DLE1BQU0sSUFBSSxtQkFBbUIsVUFBVSxTQUFTO0FBQUEsSUFDN0YsV0FBVyxTQUFTLE1BQU0sVUFBVTtBQUFBLE1BQ2xDLElBQUksTUFBTSxNQUFNO0FBQUEsUUFDZCxJQUFJLE1BQ0YscUNBQXFDLE1BQU0sU0FBUyxNQUFNLE1BQU0sWUFBWSxhQUFhLEtBQUssVUFBVSxNQUFNLElBQUksR0FDcEg7QUFBQSxRQUNBLE1BQU0sS0FBSyxRQUFRLFlBQVksTUFBTSxrQkFBa0IsS0FBSyxZQUFZLE1BQU0sa0JBQWtCLEtBQUs7QUFBQSxRQUNyRyxNQUFNLEtBQUssU0FBUztBQUFBLFFBQ3BCLE1BQU0sS0FBSyxJQUFJO0FBQUEsUUFDZixNQUFNLEtBQUssSUFBSTtBQUFBLFFBQ2YsSUFBSSxNQUNGLDBCQUEwQixNQUFNLHFCQUFxQixNQUFNLGVBQWUsc0JBQXNCLFdBQ2xHO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVcsU0FBUyxNQUFNLFVBQVU7QUFBQSxNQUNsQyxjQUFjLE9BQU8sS0FBSyxVQUFVLFNBQVM7QUFBQSxJQUMvQztBQUFBLElBQ0EsTUFBTSxVQUFVLE1BQU0sV0FBVztBQUFBLElBQ2pDLElBQUksV0FBVztBQUFBLElBQ2YsV0FBVyxTQUFTLE1BQU0sVUFBVTtBQUFBLE1BQ2xDLFlBQVksTUFBTSxrQkFBa0I7QUFBQSxJQUN0QztBQUFBLElBQ0EsSUFBSSxRQUFRLE1BQU0sU0FBUztBQUFBLElBQzNCLElBQUksVUFBVSxLQUFLLFVBQVUsVUFBVTtBQUFBLE1BQ3JDLFFBQVE7QUFBQSxJQUNWO0FBQUEsSUFDQSxNQUFNLFFBQVEsS0FBSyxLQUFLLFdBQVcsS0FBSztBQUFBLElBQ3hDLElBQUksUUFBUSxTQUFTLFdBQVcsV0FBVztBQUFBLElBQzNDLElBQUksU0FBUyxTQUFTLFlBQVksV0FBVztBQUFBLElBQzdDLElBQUksUUFBUSxjQUFjO0FBQUEsTUFDeEIsSUFBSSxNQUNGLG9DQUFvQyxNQUFNLG1CQUFtQiw4QkFBOEIsdUJBQXVCLE9BQ3BIO0FBQUEsTUFDQSxRQUFRO0FBQUEsTUFDUixTQUFTO0FBQUEsTUFDVCxNQUFNLGNBQWMsZUFBZSxRQUFRLFVBQVUsV0FBVztBQUFBLE1BQ2hFLE1BQU0sZUFBZSxnQkFBZ0IsUUFBUSxVQUFVLFdBQVc7QUFBQSxNQUNsRSxJQUFJLE1BQU0scUJBQXFCLE1BQU0sSUFBSSxjQUFjLFlBQVksWUFBWSxRQUFRO0FBQUEsTUFDdkYsSUFBSSxNQUFNLHFCQUFxQixNQUFNLElBQUksZUFBZSxhQUFhLGFBQWEsU0FBUztBQUFBLE1BQzNGLElBQUksTUFBTSwyQkFBMkIsT0FBTyxXQUFXLE9BQU87QUFBQSxNQUM5RCxXQUFXLFNBQVMsTUFBTSxVQUFVO0FBQUEsUUFDbEMsSUFBSSxNQUFNLE1BQU07QUFBQSxVQUNkLE1BQU0sS0FBSyxRQUFRO0FBQUEsVUFDbkIsTUFBTSxLQUFLLFNBQVM7QUFBQSxVQUNwQixNQUFNLEtBQUssSUFBSTtBQUFBLFVBQ2YsTUFBTSxLQUFLLElBQUk7QUFBQSxRQUNqQjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsSUFDQSxJQUFJLE1BQ0YsdUJBQXVCLE1BQU0sWUFBWSxlQUFlLGlCQUFpQixVQUFVLE1BQU0sU0FBUyxnQkFBZ0IsS0FBSyxJQUFJLE9BQU8sTUFBTSxNQUFNLFNBQVMsQ0FBQyxHQUMxSjtBQUFBLElBQ0EsSUFBSSxTQUFTLE9BQU8sTUFBTSxTQUFTLElBQUk7QUFBQSxNQUNyQyxRQUFRLE9BQU8sTUFBTSxTQUFTO0FBQUEsTUFDOUIsTUFBTSxNQUFNLFVBQVUsSUFBSSxLQUFLLElBQUksTUFBTSxTQUFTLFFBQVEsT0FBTyxJQUFJLE1BQU0sU0FBUztBQUFBLE1BQ3BGLElBQUksTUFBTSxHQUFHO0FBQUEsUUFDWCxNQUFNLGNBQWMsUUFBUSxNQUFNLFVBQVUsV0FBVztBQUFBLFFBQ3ZELElBQUksTUFBTSxnQ0FBZ0MsTUFBTSxJQUFJLE9BQU8sTUFBTSxNQUFNLE9BQU8sVUFBVTtBQUFBLFFBQ3hGLFdBQVcsU0FBUyxNQUFNLFVBQVU7QUFBQSxVQUNsQyxJQUFJLE1BQU0sTUFBTTtBQUFBLFlBQ2QsTUFBTSxLQUFLLFFBQVE7QUFBQSxVQUNyQjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsTUFBTSxPQUFPO0FBQUEsTUFDWDtBQUFBLE1BQ0E7QUFBQSxNQUNBLEdBQUc7QUFBQSxNQUNILEdBQUc7QUFBQSxJQUNMO0FBQUEsRUFDRjtBQUFBLEVBQ0EsSUFBSSxNQUNGLDhCQUNBLE1BQU0sSUFDTixPQUFPLE1BQU0sR0FDYixPQUFPLE1BQU0sT0FDYixPQUFPLE1BQU0sR0FDYixPQUFPLE1BQU0sTUFDZjtBQUFBO0FBRUYsT0FBTyxlQUFlLGVBQWU7QUFDckMsU0FBUyxZQUFZLENBQUMsT0FBTyxLQUFLO0FBQUEsRUFDaEMsSUFBSSxNQUNGLHdDQUF3QyxNQUFNLFNBQVMsT0FBTyxNQUFNLFFBQVEsT0FBTyxNQUFNLFlBQVksT0FBTyxNQUFNLE9BQ3BIO0FBQUEsRUFDQSxNQUFNLFVBQVUsTUFBTSxXQUFXO0FBQUEsRUFDakMsSUFBSSxNQUFNLDhCQUE4QixNQUFNLElBQUksTUFBTSxTQUFTLEtBQUs7QUFBQSxFQUN0RSxJQUFJLE1BQU0sWUFDVixNQUFNLFNBQVMsU0FBUyxHQUFHO0FBQUEsSUFDekIsTUFBTSxRQUFRLE9BQU8sU0FBUyxJQUFJLE1BQU0sU0FBUztBQUFBLElBQ2pELE1BQU0sa0JBQWtCLE1BQU0sU0FBUyxTQUFTLFNBQVMsTUFBTSxTQUFTLFNBQVMsS0FBSztBQUFBLElBQ3RGLElBQUksTUFBTSxzQkFBc0IsaUJBQWlCLE1BQU07QUFBQSxJQUN2RCxNQUFNLDZCQUE2QixJQUFJO0FBQUEsSUFDdkM7QUFBQSxNQUNFLElBQUksU0FBUztBQUFBLE1BQ2IsV0FBVyxTQUFTLE1BQU0sVUFBVTtBQUFBLFFBQ2xDLElBQUksQ0FBQyxNQUFNLE1BQU07QUFBQSxVQUNmO0FBQUEsUUFDRjtBQUFBLFFBQ0EsUUFBUSxPQUFPLHVCQUF1QixTQUFTLE1BQU07QUFBQSxRQUNyRCxNQUFNLGFBQWEsV0FBVyxJQUFJLEVBQUUsS0FBSztBQUFBLFFBQ3pDLElBQUksTUFBTSxLQUFLLFNBQVMsWUFBWTtBQUFBLFVBQ2xDLFdBQVcsSUFBSSxJQUFJLE1BQU0sS0FBSyxNQUFNO0FBQUEsUUFDdEM7QUFBQSxRQUNBLElBQUksU0FBUyxPQUFPLGtCQUFrQjtBQUFBLFFBQ3RDLElBQUksVUFBVSxHQUFHO0FBQUEsVUFDZixTQUFTLEtBQUssSUFBSSxRQUFRLFVBQVUsU0FBUyxPQUFPO0FBQUEsUUFDdEQ7QUFBQSxRQUNBLFVBQVU7QUFBQSxNQUNaO0FBQUEsSUFDRjtBQUFBLElBQ0EsTUFBTSw4QkFBOEIsSUFBSTtBQUFBLElBQ3hDO0FBQUEsTUFDRSxJQUFJLFNBQVM7QUFBQSxNQUNiLE1BQU0sT0FBTyxDQUFDLEdBQUcsV0FBVyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQztBQUFBLE1BQ3hELFdBQVcsT0FBTyxNQUFNO0FBQUEsUUFDdEIsWUFBWSxJQUFJLEtBQUssTUFBTTtBQUFBLFFBQzNCLFdBQVcsV0FBVyxJQUFJLEdBQUcsS0FBSyxLQUFLO0FBQUEsTUFDekM7QUFBQSxJQUNGO0FBQUEsSUFDQSxJQUFJLFlBQVk7QUFBQSxJQUNoQixJQUFJLE1BQU0sd0JBQXdCLE1BQU0sSUFBSSxPQUFPLE1BQU0sQ0FBQztBQUFBLElBQzFELElBQUksZUFBZSxPQUFPLE1BQU0sSUFBSSxPQUFPLE1BQU0sS0FBSyxDQUFDLE9BQU8sTUFBTSxRQUFRLEtBQUssS0FBSyxDQUFDO0FBQUEsSUFDdkYsSUFBSSxTQUFTO0FBQUEsSUFDYixXQUFXLFNBQVMsTUFBTSxVQUFVO0FBQUEsTUFDbEMsTUFBTSxTQUFTO0FBQUEsTUFDZixJQUFJLENBQUMsTUFBTSxNQUFNO0FBQUEsUUFDZjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFFBQVEsT0FBTyxRQUFRLFdBQVcsTUFBTTtBQUFBLE1BQ3hDLFFBQVEsSUFBSSxPQUFPLHVCQUF1QixTQUFTLFNBQVM7QUFBQSxNQUM1RCxJQUFJLE1BQU0sUUFBUTtBQUFBLFFBQ2hCLFNBQVM7QUFBQSxRQUNULGVBQWUsT0FBTyxNQUFNLElBQUksT0FBTyxNQUFNLEtBQUssQ0FBQyxPQUFPLE1BQU0sUUFBUSxLQUFLLEtBQUssQ0FBQztBQUFBLFFBQ25GLElBQUksTUFBTSwrQkFBK0IsTUFBTSxJQUFJLGVBQWUsTUFBTSxJQUFJLE1BQU07QUFBQSxNQUNwRjtBQUFBLE1BQ0EsSUFBSSxNQUNGLG1DQUFtQyxNQUFNLFdBQVcsc0JBQXNCLE1BQU0sT0FBTyxRQUFRLE1BQU0sS0FBSyxRQUFRLE1BQU0sY0FBYyxPQUFPLGFBQWEsU0FBUyxTQUNySztBQUFBLE1BQ0EsSUFBSSxPQUFPLE1BQU07QUFBQSxRQUNmLE1BQU0sWUFBWSxTQUFTO0FBQUEsUUFDM0IsTUFBTSxLQUFLLElBQUksZUFBZSxVQUFVO0FBQUEsUUFDeEMsSUFBSSxNQUNGLHVDQUF1QyxNQUFNLG1CQUFtQixnQ0FBZ0MsTUFBTSxLQUFLLEtBQUsscUJBQXFCLGlCQUFpQixvQkFBb0Isa0JBQWtCLE1BQU0sS0FBSyxPQUFPLE1BQU0sS0FBSyxLQUFLLE1BQU0sZ0RBQWdELFVBQVUsT0FBTyxrQkFBa0IsS0FBSyxHQUM5VDtBQUFBLFFBQ0EsZUFBZSxNQUFNLEtBQUssSUFBSTtBQUFBLFFBQzlCLE1BQU0sYUFBYSxZQUFZLElBQUksRUFBRSxLQUFLO0FBQUEsUUFDMUMsTUFBTSxZQUFZLFdBQVcsSUFBSSxFQUFFLEtBQUs7QUFBQSxRQUN4QyxNQUFNLEtBQUssSUFBSSxPQUFPLEtBQUssSUFBSSxPQUFPLEtBQUssU0FBUyxJQUFJLGFBQWEsWUFBWSxJQUFJO0FBQUEsUUFDckYsSUFBSSxNQUNGLHVDQUF1QyxNQUFNLGlCQUFpQixlQUFlLFVBQVUsZ0JBQWdCLE1BQU0sS0FBSyxNQUFNLE1BQU0sS0FBSyxJQUFJLE1BQU0sOENBQThDLFVBQVUsT0FBTyxrQkFBa0IsS0FBSyxHQUNyTztBQUFBLE1BQ0Y7QUFBQSxNQUNBLElBQUksTUFBTSxVQUFVO0FBQUEsUUFDbEIsYUFBYSxPQUFPLEdBQUc7QUFBQSxNQUN6QjtBQUFBLE1BQ0EsSUFBSSxnQkFBZ0IsT0FBTyxrQkFBa0I7QUFBQSxNQUM3QyxJQUFJLFVBQVUsR0FBRztBQUFBLFFBQ2YsZ0JBQWdCLEtBQUssSUFBSSxlQUFlLFVBQVUsWUFBWSxPQUFPO0FBQUEsTUFDdkU7QUFBQSxNQUNBLGFBQWE7QUFBQSxNQUNiLElBQUksTUFBTSxvQkFBb0IsT0FBTyxTQUFTO0FBQUEsSUFDaEQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxJQUFJLE1BQ0YsbUNBQW1DLE1BQU0sU0FBUyxPQUFPLE1BQU0sUUFBUSxPQUFPLE1BQU0sWUFBWSxPQUFPLE1BQU0sT0FDL0c7QUFBQTtBQUVGLE9BQU8sY0FBYyxjQUFjO0FBQ25DLFNBQVMsVUFBVSxDQUFDLFNBQVMsTUFBTSxNQUFNLE1BQU0sU0FBUyxFQUFFLE1BQU0sR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLE1BQU0sRUFBRSxHQUFHO0FBQUEsRUFDOUYsSUFBSSxNQUFNLFFBQVEsTUFBTSxPQUFPLFFBQVE7QUFBQSxJQUNyQyxRQUFRLEdBQUcsR0FBRyxPQUFPLFdBQVcsTUFBTTtBQUFBLElBQ3RDLElBQUksSUFBSSxRQUFRLElBQUksTUFBTTtBQUFBLE1BQ3hCLE9BQU8sSUFBSSxRQUFRO0FBQUEsSUFDckI7QUFBQSxJQUNBLElBQUksSUFBSSxTQUFTLElBQUksTUFBTTtBQUFBLE1BQ3pCLE9BQU8sSUFBSSxTQUFTO0FBQUEsSUFDdEI7QUFBQSxJQUNBLElBQUksSUFBSSxRQUFRLElBQUksTUFBTTtBQUFBLE1BQ3hCLE9BQU8sSUFBSSxRQUFRO0FBQUEsSUFDckI7QUFBQSxJQUNBLElBQUksSUFBSSxTQUFTLElBQUksTUFBTTtBQUFBLE1BQ3pCLE9BQU8sSUFBSSxTQUFTO0FBQUEsSUFDdEI7QUFBQSxFQUNGO0FBQUEsRUFDQSxJQUFJLE1BQU0sVUFBVTtBQUFBLElBQ2xCLFdBQVcsU0FBUyxNQUFNLFVBQVU7QUFBQSxPQUNqQyxFQUFFLE1BQU0sTUFBTSxNQUFNLEtBQUssSUFBSSxXQUFXLE9BQU8sRUFBRSxNQUFNLE1BQU0sTUFBTSxLQUFLLENBQUM7QUFBQSxJQUM1RTtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU8sRUFBRSxNQUFNLE1BQU0sTUFBTSxLQUFLO0FBQUE7QUFFbEMsT0FBTyxZQUFZLFlBQVk7QUFDL0IsU0FBUyxNQUFNLENBQUMsS0FBSztBQUFBLEVBQ25CLE1BQU0sT0FBTyxJQUFJLFNBQVMsTUFBTTtBQUFBLEVBQ2hDLElBQUksQ0FBQyxNQUFNO0FBQUEsSUFDVDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGNBQWMsTUFBTSxLQUFLLEdBQUcsQ0FBQztBQUFBLEVBQzdCLGFBQWEsTUFBTSxHQUFHO0FBQUEsRUFDdEIsSUFBSSxNQUFNLGFBQWEsS0FBSyxVQUFVLE1BQU0sTUFBTSxDQUFDLENBQUM7QUFBQSxFQUNwRCxRQUFRLE1BQU0sTUFBTSxNQUFNLFNBQVMsV0FBVyxJQUFJO0FBQUEsRUFDbEQsTUFBTSxTQUFTLE9BQU87QUFBQSxFQUN0QixNQUFNLFFBQVEsT0FBTztBQUFBLEVBQ3JCLE9BQU8sRUFBRSxHQUFHLE1BQU0sR0FBRyxNQUFNLE9BQU8sT0FBTztBQUFBO0FBRTNDLE9BQU8sUUFBUSxRQUFRO0FBTXZCLElBQUksOEJBQThCLE9BQU8sT0FBTyxTQUFTLGFBQWEsT0FBTyxVQUFVLE9BQU8sU0FBUyxVQUFVO0FBQUEsRUFDL0csSUFBSSxhQUFhLGVBQWU7QUFBQSxFQUNoQyxJQUFJLE9BQU8sZUFBZSxVQUFVO0FBQUEsSUFDbEMsYUFBYSxXQUFXO0FBQUEsRUFDMUI7QUFBQSxFQUNBLE1BQU0sVUFBVSxXQUFXO0FBQUEsRUFDM0IsTUFBTSxnQkFBZ0IsdUJBQXVCLE9BQU87QUFBQSxFQUNwRCxPQUFPLE1BQU0sV0FDWCxTQUNBLFlBQ0E7QUFBQSxJQUNFO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBLFVBQVU7QUFBQSxJQUNWO0FBQUEsSUFDQSxPQUFPLE9BQU87QUFBQSxFQUNoQixHQUNBLE9BQ0Y7QUFBQSxHQUNDLGFBQWE7QUFDaEIsSUFBSSxzQkFBc0I7QUFNMUIsSUFBSSxpQ0FBaUMsT0FBTyxDQUFDLFNBQVMsTUFBTSxLQUFLLElBQUksZ0JBQWdCO0FBQUEsRUFDbkYsSUFBSSxLQUFLLGdCQUFnQjtBQUFBLElBQ3ZCLGNBQWMsU0FBUyxTQUFTLEtBQUssZ0JBQWdCLEtBQUssSUFBSSxXQUFXO0FBQUEsRUFDM0U7QUFBQSxFQUNBLElBQUksS0FBSyxjQUFjO0FBQUEsSUFDckIsY0FBYyxTQUFTLE9BQU8sS0FBSyxjQUFjLEtBQUssSUFBSSxXQUFXO0FBQUEsRUFDdkU7QUFBQSxHQUNDLGdCQUFnQjtBQUNuQixJQUFJLGdCQUFnQjtBQUFBLEVBQ2xCLGFBQWE7QUFBQSxFQUNiLGFBQWE7QUFBQSxFQUNiLFlBQVk7QUFBQSxFQUNaLGNBQWM7QUFBQSxFQUNkLGFBQWE7QUFBQSxFQUNiLFdBQVc7QUFBQSxFQUNYLGFBQWE7QUFBQSxFQUNiLFlBQVk7QUFBQSxFQUNaLFVBQVU7QUFDWjtBQUNBLElBQUksZ0NBQWdDLE9BQU8sQ0FBQyxTQUFTLFVBQVUsV0FBVyxLQUFLLElBQUksZ0JBQWdCO0FBQUEsRUFDakcsTUFBTSxnQkFBZ0IsY0FBYztBQUFBLEVBQ3BDLElBQUksQ0FBQyxlQUFlO0FBQUEsSUFDbEIsSUFBSSxLQUFLLHVCQUF1QixXQUFXO0FBQUEsSUFDM0M7QUFBQSxFQUNGO0FBQUEsRUFDQSxNQUFNLFNBQVMsYUFBYSxVQUFVLFVBQVU7QUFBQSxFQUNoRCxRQUFRLEtBQUssVUFBVSxZQUFZLE9BQU8sT0FBTyxNQUFNLGVBQWUsZ0JBQWdCLFNBQVM7QUFBQSxHQUM5RixlQUFlO0FBR2xCLElBQUksYUFBYSxDQUFDO0FBQ2xCLElBQUksaUJBQWlCLENBQUM7QUFDdEIsSUFBSSxrQ0FBa0MsT0FBTyxPQUFPLE1BQU0sU0FBUztBQUFBLEVBQ2pFLE1BQU0sVUFBVSxXQUFXO0FBQUEsRUFDM0IsTUFBTSxnQkFBZ0IsdUJBQXVCLE9BQU87QUFBQSxFQUNwRCxNQUFNLFlBQVksS0FBSyxPQUFPLEdBQUcsRUFBRSxLQUFLLFNBQVMsV0FBVztBQUFBLEVBQzVELE1BQU0sUUFBUSxVQUFVLE9BQU8sR0FBRyxFQUFFLEtBQUssU0FBUyxPQUFPO0FBQUEsRUFDekQsTUFBTSxhQUFhLEtBQUssY0FBYztBQUFBLEVBQ3RDLE1BQU0sZUFBZSxNQUFNLFdBQ3pCLE1BQ0EsS0FBSyxPQUNMO0FBQUEsSUFDRSxPQUFPLEtBQUs7QUFBQSxJQUNaO0FBQUEsSUFHQSxrQkFBa0I7QUFBQSxJQUNsQixRQUFRO0FBQUEsSUFDUixVQUFVO0FBQUEsSUFFVixPQUFPLGFBQWtCLFlBQUksT0FBTztBQUFBLEVBQ3RDLEdBQ0EsT0FDRjtBQUFBLEVBQ0EsTUFBTSxLQUFLLEVBQUUsWUFBWSxZQUFZO0FBQUEsRUFDckMsSUFBSSxPQUFPLGFBQWEsUUFBUTtBQUFBLEVBQ2hDLElBQUksZ0JBQWdCO0FBQUEsRUFDcEIsSUFBSSxlQUFlO0FBQUEsSUFDakIsTUFBTSxNQUFNLGFBQWEsU0FBUztBQUFBLElBQ2xDLE1BQU0sS0FBSyxlQUFPLFlBQVk7QUFBQSxJQUM5QixPQUFPLElBQUksc0JBQXNCO0FBQUEsSUFDakMsZ0JBQWdCO0FBQUEsSUFDaEIsR0FBRyxLQUFLLFNBQVMsS0FBSyxLQUFLO0FBQUEsSUFDM0IsR0FBRyxLQUFLLFVBQVUsS0FBSyxNQUFNO0FBQUEsRUFDL0IsRUFBTztBQUFBLElBQ0wsTUFBTSxTQUFTLGVBQU8sWUFBWSxFQUFFLE9BQU8sTUFBTSxFQUFFLEtBQUs7QUFBQSxJQUN4RCxJQUFJLFVBQVUsT0FBTyxPQUFPLFlBQVksWUFBWTtBQUFBLE1BQ2xELGdCQUFnQixPQUFPLFFBQVE7QUFBQSxJQUNqQztBQUFBO0FBQUEsRUFFRixNQUFNLEtBQUssYUFBYSxzQkFBc0IsZUFBZSxhQUFhLENBQUM7QUFBQSxFQUMzRSxXQUFXLEtBQUssTUFBTTtBQUFBLEVBQ3RCLEtBQUssUUFBUSxLQUFLO0FBQUEsRUFDbEIsS0FBSyxTQUFTLEtBQUs7QUFBQSxFQUNuQixJQUFJO0FBQUEsRUFDSixJQUFJLEtBQUssZ0JBQWdCO0FBQUEsSUFDdkIsTUFBTSxxQkFBcUIsS0FBSyxPQUFPLEdBQUcsRUFBRSxLQUFLLFNBQVMsZUFBZTtBQUFBLElBQ3pFLE1BQU0sUUFBUSxtQkFBbUIsT0FBTyxHQUFHLEVBQUUsS0FBSyxTQUFTLE9BQU87QUFBQSxJQUNsRSxNQUFNLG9CQUFvQixNQUFNLG9CQUFvQixPQUFPLEtBQUssZ0JBQWdCLEtBQUssVUFBVTtBQUFBLElBQy9GLEtBQUs7QUFBQSxJQUNMLElBQUksUUFBUSxrQkFBa0IsUUFBUTtBQUFBLElBQ3RDLElBQUksZUFBZTtBQUFBLE1BQ2pCLE1BQU0sTUFBTSxrQkFBa0IsU0FBUztBQUFBLE1BQ3ZDLE1BQU0sS0FBSyxlQUFPLGlCQUFpQjtBQUFBLE1BQ25DLFFBQVEsSUFBSSxzQkFBc0I7QUFBQSxNQUNsQyxHQUFHLEtBQUssU0FBUyxNQUFNLEtBQUs7QUFBQSxNQUM1QixHQUFHLEtBQUssVUFBVSxNQUFNLE1BQU07QUFBQSxJQUNoQztBQUFBLElBQ0EsTUFBTSxLQUFLLGFBQWEsc0JBQXNCLE9BQU8sYUFBYSxDQUFDO0FBQUEsSUFDbkUsSUFBSSxDQUFDLGVBQWUsS0FBSyxLQUFLO0FBQUEsTUFDNUIsZUFBZSxLQUFLLE1BQU0sQ0FBQztBQUFBLElBQzdCO0FBQUEsSUFDQSxlQUFlLEtBQUssSUFBSSxZQUFZO0FBQUEsSUFDcEMsaUJBQWlCLElBQUksS0FBSyxjQUFjO0FBQUEsRUFDMUM7QUFBQSxFQUNBLElBQUksS0FBSyxpQkFBaUI7QUFBQSxJQUN4QixNQUFNLHNCQUFzQixLQUFLLE9BQU8sR0FBRyxFQUFFLEtBQUssU0FBUyxlQUFlO0FBQUEsSUFDMUUsTUFBTSxRQUFRLG9CQUFvQixPQUFPLEdBQUcsRUFBRSxLQUFLLFNBQVMsT0FBTztBQUFBLElBQ25FLE1BQU0sb0JBQW9CLE1BQU0sb0JBQW9CLE9BQU8sS0FBSyxpQkFBaUIsS0FBSyxVQUFVO0FBQUEsSUFDaEcsS0FBSztBQUFBLElBQ0wsSUFBSSxRQUFRLGtCQUFrQixRQUFRO0FBQUEsSUFDdEMsSUFBSSxlQUFlO0FBQUEsTUFDakIsTUFBTSxNQUFNLGtCQUFrQixTQUFTO0FBQUEsTUFDdkMsTUFBTSxLQUFLLGVBQU8saUJBQWlCO0FBQUEsTUFDbkMsUUFBUSxJQUFJLHNCQUFzQjtBQUFBLE1BQ2xDLEdBQUcsS0FBSyxTQUFTLE1BQU0sS0FBSztBQUFBLE1BQzVCLEdBQUcsS0FBSyxVQUFVLE1BQU0sTUFBTTtBQUFBLElBQ2hDO0FBQUEsSUFDQSxNQUFNLEtBQUssYUFBYSxzQkFBc0IsT0FBTyxhQUFhLENBQUM7QUFBQSxJQUNuRSxJQUFJLENBQUMsZUFBZSxLQUFLLEtBQUs7QUFBQSxNQUM1QixlQUFlLEtBQUssTUFBTSxDQUFDO0FBQUEsSUFDN0I7QUFBQSxJQUNBLGVBQWUsS0FBSyxJQUFJLGFBQWE7QUFBQSxJQUNyQyxpQkFBaUIsSUFBSSxLQUFLLGVBQWU7QUFBQSxFQUMzQztBQUFBLEVBQ0EsSUFBSSxLQUFLLGNBQWM7QUFBQSxJQUNyQixNQUFNLG1CQUFtQixLQUFLLE9BQU8sR0FBRyxFQUFFLEtBQUssU0FBUyxlQUFlO0FBQUEsSUFDdkUsTUFBTSxRQUFRLGlCQUFpQixPQUFPLEdBQUcsRUFBRSxLQUFLLFNBQVMsT0FBTztBQUFBLElBQ2hFLE1BQU0sa0JBQWtCLE1BQU0sb0JBQW9CLGtCQUFrQixLQUFLLGNBQWMsS0FBSyxVQUFVO0FBQUEsSUFDdEcsS0FBSztBQUFBLElBQ0wsSUFBSSxRQUFRLGdCQUFnQixRQUFRO0FBQUEsSUFDcEMsSUFBSSxlQUFlO0FBQUEsTUFDakIsTUFBTSxNQUFNLGdCQUFnQixTQUFTO0FBQUEsTUFDckMsTUFBTSxLQUFLLGVBQU8sZUFBZTtBQUFBLE1BQ2pDLFFBQVEsSUFBSSxzQkFBc0I7QUFBQSxNQUNsQyxHQUFHLEtBQUssU0FBUyxNQUFNLEtBQUs7QUFBQSxNQUM1QixHQUFHLEtBQUssVUFBVSxNQUFNLE1BQU07QUFBQSxJQUNoQztBQUFBLElBQ0EsTUFBTSxLQUFLLGFBQWEsc0JBQXNCLE9BQU8sYUFBYSxDQUFDO0FBQUEsSUFDbkUsSUFBSSxDQUFDLGVBQWUsS0FBSyxLQUFLO0FBQUEsTUFDNUIsZUFBZSxLQUFLLE1BQU0sQ0FBQztBQUFBLElBQzdCO0FBQUEsSUFDQSxlQUFlLEtBQUssSUFBSSxVQUFVO0FBQUEsSUFDbEMsaUJBQWlCLElBQUksS0FBSyxZQUFZO0FBQUEsRUFDeEM7QUFBQSxFQUNBLElBQUksS0FBSyxlQUFlO0FBQUEsSUFDdEIsTUFBTSxvQkFBb0IsS0FBSyxPQUFPLEdBQUcsRUFBRSxLQUFLLFNBQVMsZUFBZTtBQUFBLElBQ3hFLE1BQU0sUUFBUSxrQkFBa0IsT0FBTyxHQUFHLEVBQUUsS0FBSyxTQUFTLE9BQU87QUFBQSxJQUNqRSxNQUFNLGtCQUFrQixNQUFNLG9CQUM1QixtQkFDQSxLQUFLLGVBQ0wsS0FBSyxVQUNQO0FBQUEsSUFDQSxLQUFLO0FBQUEsSUFDTCxJQUFJLFFBQVEsZ0JBQWdCLFFBQVE7QUFBQSxJQUNwQyxJQUFJLGVBQWU7QUFBQSxNQUNqQixNQUFNLE1BQU0sZ0JBQWdCLFNBQVM7QUFBQSxNQUNyQyxNQUFNLEtBQUssZUFBTyxlQUFlO0FBQUEsTUFDakMsUUFBUSxJQUFJLHNCQUFzQjtBQUFBLE1BQ2xDLEdBQUcsS0FBSyxTQUFTLE1BQU0sS0FBSztBQUFBLE1BQzVCLEdBQUcsS0FBSyxVQUFVLE1BQU0sTUFBTTtBQUFBLElBQ2hDO0FBQUEsSUFDQSxNQUFNLEtBQUssYUFBYSxzQkFBc0IsT0FBTyxhQUFhLENBQUM7QUFBQSxJQUNuRSxJQUFJLENBQUMsZUFBZSxLQUFLLEtBQUs7QUFBQSxNQUM1QixlQUFlLEtBQUssTUFBTSxDQUFDO0FBQUEsSUFDN0I7QUFBQSxJQUNBLGVBQWUsS0FBSyxJQUFJLFdBQVc7QUFBQSxJQUNuQyxpQkFBaUIsSUFBSSxLQUFLLGFBQWE7QUFBQSxFQUN6QztBQUFBLEVBQ0EsT0FBTztBQUFBLEdBQ04saUJBQWlCO0FBQ3BCLFNBQVMsZ0JBQWdCLENBQUMsSUFBSSxPQUFPO0FBQUEsRUFDbkMsSUFBSSx1QkFBdUIsV0FBVyxDQUFDLEtBQUssSUFBSTtBQUFBLElBQzlDLEdBQUcsTUFBTSxRQUFRLE1BQU0sU0FBUyxJQUFJO0FBQUEsSUFDcEMsR0FBRyxNQUFNLFNBQVM7QUFBQSxFQUNwQjtBQUFBO0FBRUYsT0FBTyxrQkFBa0Isa0JBQWtCO0FBQzNDLElBQUksb0NBQW9DLE9BQU8sQ0FBQyxNQUFNLFVBQVU7QUFBQSxFQUM5RCxJQUFJLE1BQU0sdUJBQXVCLEtBQUssSUFBSSxLQUFLLE9BQU8sV0FBVyxLQUFLLEtBQUssS0FBSztBQUFBLEVBQ2hGLElBQUksT0FBTyxNQUFNLGNBQWMsTUFBTSxjQUFjLE1BQU07QUFBQSxFQUN6RCxNQUFNLGFBQWEsV0FBVztBQUFBLEVBQzlCLFFBQVEsNkJBQTZCLHdCQUF3QixVQUFVO0FBQUEsRUFDdkUsSUFBSSxLQUFLLE9BQU87QUFBQSxJQUNkLE1BQU0sS0FBSyxXQUFXLEtBQUs7QUFBQSxJQUMzQixJQUFJLElBQUksS0FBSztBQUFBLElBQ2IsSUFBSSxJQUFJLEtBQUs7QUFBQSxJQUNiLElBQUksTUFBTTtBQUFBLE1BQ1IsTUFBTSxNQUFNLGNBQWMsa0JBQWtCLElBQUk7QUFBQSxNQUNoRCxJQUFJLE1BQ0Ysa0JBQWtCLEtBQUssUUFBUSxXQUMvQixHQUNBLEtBQ0EsR0FDQSxVQUNBLElBQUksR0FDSixLQUNBLElBQUksR0FDSixTQUNGO0FBQUEsTUFDQSxJQUFJLE1BQU0sYUFBYTtBQUFBLFFBQ3JCLElBQUksSUFBSTtBQUFBLFFBQ1IsSUFBSSxJQUFJO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxJQUNBLEdBQUcsS0FBSyxhQUFhLGFBQWEsTUFBTSxJQUFJLDJCQUEyQixJQUFJO0FBQUEsRUFDN0U7QUFBQSxFQUNBLElBQUksS0FBSyxnQkFBZ0I7QUFBQSxJQUN2QixNQUFNLEtBQUssZUFBZSxLQUFLLElBQUk7QUFBQSxJQUNuQyxJQUFJLElBQUksS0FBSztBQUFBLElBQ2IsSUFBSSxJQUFJLEtBQUs7QUFBQSxJQUNiLElBQUksTUFBTTtBQUFBLE1BQ1IsTUFBTSxNQUFNLGNBQWMsMEJBQTBCLEtBQUssaUJBQWlCLEtBQUssR0FBRyxjQUFjLElBQUk7QUFBQSxNQUNwRyxJQUFJLElBQUk7QUFBQSxNQUNSLElBQUksSUFBSTtBQUFBLElBQ1Y7QUFBQSxJQUNBLEdBQUcsS0FBSyxhQUFhLGFBQWEsTUFBTSxJQUFJO0FBQUEsRUFDOUM7QUFBQSxFQUNBLElBQUksS0FBSyxpQkFBaUI7QUFBQSxJQUN4QixNQUFNLEtBQUssZUFBZSxLQUFLLElBQUk7QUFBQSxJQUNuQyxJQUFJLElBQUksS0FBSztBQUFBLElBQ2IsSUFBSSxJQUFJLEtBQUs7QUFBQSxJQUNiLElBQUksTUFBTTtBQUFBLE1BQ1IsTUFBTSxNQUFNLGNBQWMsMEJBQ3hCLEtBQUssaUJBQWlCLEtBQUssR0FDM0IsZUFDQSxJQUNGO0FBQUEsTUFDQSxJQUFJLElBQUk7QUFBQSxNQUNSLElBQUksSUFBSTtBQUFBLElBQ1Y7QUFBQSxJQUNBLEdBQUcsS0FBSyxhQUFhLGFBQWEsTUFBTSxJQUFJO0FBQUEsRUFDOUM7QUFBQSxFQUNBLElBQUksS0FBSyxjQUFjO0FBQUEsSUFDckIsTUFBTSxLQUFLLGVBQWUsS0FBSyxJQUFJO0FBQUEsSUFDbkMsSUFBSSxJQUFJLEtBQUs7QUFBQSxJQUNiLElBQUksSUFBSSxLQUFLO0FBQUEsSUFDYixJQUFJLE1BQU07QUFBQSxNQUNSLE1BQU0sTUFBTSxjQUFjLDBCQUEwQixLQUFLLGVBQWUsS0FBSyxHQUFHLFlBQVksSUFBSTtBQUFBLE1BQ2hHLElBQUksSUFBSTtBQUFBLE1BQ1IsSUFBSSxJQUFJO0FBQUEsSUFDVjtBQUFBLElBQ0EsR0FBRyxLQUFLLGFBQWEsYUFBYSxNQUFNLElBQUk7QUFBQSxFQUM5QztBQUFBLEVBQ0EsSUFBSSxLQUFLLGVBQWU7QUFBQSxJQUN0QixNQUFNLEtBQUssZUFBZSxLQUFLLElBQUk7QUFBQSxJQUNuQyxJQUFJLElBQUksS0FBSztBQUFBLElBQ2IsSUFBSSxJQUFJLEtBQUs7QUFBQSxJQUNiLElBQUksTUFBTTtBQUFBLE1BQ1IsTUFBTSxNQUFNLGNBQWMsMEJBQTBCLEtBQUssZUFBZSxLQUFLLEdBQUcsYUFBYSxJQUFJO0FBQUEsTUFDakcsSUFBSSxJQUFJO0FBQUEsTUFDUixJQUFJLElBQUk7QUFBQSxJQUNWO0FBQUEsSUFDQSxHQUFHLEtBQUssYUFBYSxhQUFhLE1BQU0sSUFBSTtBQUFBLEVBQzlDO0FBQUEsR0FDQyxtQkFBbUI7QUFDdEIsSUFBSSw4QkFBOEIsT0FBTyxDQUFDLE1BQU0sV0FBVztBQUFBLEVBQ3pELE1BQU0sSUFBSSxLQUFLO0FBQUEsRUFDZixNQUFNLElBQUksS0FBSztBQUFBLEVBQ2YsTUFBTSxLQUFLLEtBQUssSUFBSSxPQUFPLElBQUksQ0FBQztBQUFBLEVBQ2hDLE1BQU0sS0FBSyxLQUFLLElBQUksT0FBTyxJQUFJLENBQUM7QUFBQSxFQUNoQyxNQUFNLElBQUksS0FBSyxRQUFRO0FBQUEsRUFDdkIsTUFBTSxJQUFJLEtBQUssU0FBUztBQUFBLEVBQ3hCLElBQUksTUFBTSxLQUFLLE1BQU0sR0FBRztBQUFBLElBQ3RCLE9BQU87QUFBQSxFQUNUO0FBQUEsRUFDQSxPQUFPO0FBQUEsR0FDTixhQUFhO0FBQ2hCLElBQUksK0JBQStCLE9BQU8sQ0FBQyxNQUFNLGNBQWMsZ0JBQWdCO0FBQUEsRUFDN0UsSUFBSSxNQUFNO0FBQUEsa0JBQ00sS0FBSyxVQUFVLFlBQVk7QUFBQSxrQkFDM0IsS0FBSyxVQUFVLFdBQVc7QUFBQSxvQkFDeEIsS0FBSyxPQUFPLEtBQUssT0FBTyxLQUFLLFdBQVcsS0FBSyxRQUFRO0FBQUEsRUFDdkUsTUFBTSxJQUFJLEtBQUs7QUFBQSxFQUNmLE1BQU0sSUFBSSxLQUFLO0FBQUEsRUFDZixNQUFNLEtBQUssS0FBSyxJQUFJLElBQUksWUFBWSxDQUFDO0FBQUEsRUFDckMsTUFBTSxJQUFJLEtBQUssUUFBUTtBQUFBLEVBQ3ZCLElBQUksSUFBSSxZQUFZLElBQUksYUFBYSxJQUFJLElBQUksS0FBSyxJQUFJO0FBQUEsRUFDdEQsTUFBTSxJQUFJLEtBQUssU0FBUztBQUFBLEVBQ3hCLE1BQU0sSUFBSSxLQUFLLElBQUksYUFBYSxJQUFJLFlBQVksQ0FBQztBQUFBLEVBQ2pELE1BQU0sSUFBSSxLQUFLLElBQUksYUFBYSxJQUFJLFlBQVksQ0FBQztBQUFBLEVBQ2pELElBQUksS0FBSyxJQUFJLElBQUksYUFBYSxDQUFDLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxhQUFhLENBQUMsSUFBSSxHQUFHO0FBQUEsSUFDdkUsSUFBSSxJQUFJLFlBQVksSUFBSSxhQUFhLElBQUksYUFBYSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksYUFBYTtBQUFBLElBQ3ZGLElBQUksSUFBSSxJQUFJO0FBQUEsSUFDWixNQUFNLE1BQU07QUFBQSxNQUNWLEdBQUcsWUFBWSxJQUFJLGFBQWEsSUFBSSxZQUFZLElBQUksSUFBSSxZQUFZLElBQUksSUFBSTtBQUFBLE1BQzVFLEdBQUcsWUFBWSxJQUFJLGFBQWEsSUFBSSxZQUFZLElBQUksSUFBSSxJQUFJLFlBQVksSUFBSSxJQUFJO0FBQUEsSUFDbEY7QUFBQSxJQUNBLElBQUksTUFBTSxHQUFHO0FBQUEsTUFDWCxJQUFJLElBQUksYUFBYTtBQUFBLE1BQ3JCLElBQUksSUFBSSxhQUFhO0FBQUEsSUFDdkI7QUFBQSxJQUNBLElBQUksTUFBTSxHQUFHO0FBQUEsTUFDWCxJQUFJLElBQUksYUFBYTtBQUFBLElBQ3ZCO0FBQUEsSUFDQSxJQUFJLE1BQU0sR0FBRztBQUFBLE1BQ1gsSUFBSSxJQUFJLGFBQWE7QUFBQSxJQUN2QjtBQUFBLElBQ0EsSUFBSSxNQUFNLDJCQUEyQixRQUFRLFFBQVEsUUFBUSxLQUFLLEdBQUc7QUFBQSxJQUNyRSxPQUFPO0FBQUEsRUFDVCxFQUFPO0FBQUEsSUFDTCxJQUFJLFlBQVksSUFBSSxhQUFhLEdBQUc7QUFBQSxNQUNsQyxJQUFJLGFBQWEsSUFBSSxJQUFJO0FBQUEsSUFDM0IsRUFBTztBQUFBLE1BQ0wsSUFBSSxJQUFJLElBQUksYUFBYTtBQUFBO0FBQUEsSUFFM0IsSUFBSSxJQUFJLElBQUksSUFBSTtBQUFBLElBQ2hCLElBQUksS0FBSyxZQUFZLElBQUksYUFBYSxJQUFJLFlBQVksSUFBSSxJQUFJLElBQUksWUFBWSxJQUFJLElBQUk7QUFBQSxJQUN0RixJQUFJLEtBQUssWUFBWSxJQUFJLGFBQWEsSUFBSSxZQUFZLElBQUksSUFBSSxZQUFZLElBQUk7QUFBQSxJQUM5RSxJQUFJLE1BQU0sdUJBQXVCLFFBQVEsUUFBUSxRQUFRLEtBQUssRUFBRSxJQUFJLEdBQUcsQ0FBQztBQUFBLElBQ3hFLElBQUksTUFBTSxHQUFHO0FBQUEsTUFDWCxLQUFLLGFBQWE7QUFBQSxNQUNsQixLQUFLLGFBQWE7QUFBQSxJQUNwQjtBQUFBLElBQ0EsSUFBSSxNQUFNLEdBQUc7QUFBQSxNQUNYLEtBQUssYUFBYTtBQUFBLElBQ3BCO0FBQUEsSUFDQSxJQUFJLE1BQU0sR0FBRztBQUFBLE1BQ1gsS0FBSyxhQUFhO0FBQUEsSUFDcEI7QUFBQSxJQUNBLE9BQU8sRUFBRSxHQUFHLElBQUksR0FBRyxHQUFHO0FBQUE7QUFBQSxHQUV2QixjQUFjO0FBQ2pCLElBQUkscUNBQXFDLE9BQU8sQ0FBQyxTQUFTLGlCQUFpQjtBQUFBLEVBQ3pFLElBQUksTUFBTSw0QkFBNEIsU0FBUyxZQUFZO0FBQUEsRUFDM0QsSUFBSSxTQUFTLENBQUM7QUFBQSxFQUNkLElBQUksbUJBQW1CLFFBQVE7QUFBQSxFQUMvQixJQUFJLFdBQVc7QUFBQSxFQUNmLFFBQVEsUUFBUSxDQUFDLFdBQVc7QUFBQSxJQUMxQixJQUFJLENBQUMsWUFBWSxjQUFjLE1BQU0sS0FBSyxDQUFDLFVBQVU7QUFBQSxNQUNuRCxNQUFNLFFBQVEsYUFBYSxjQUFjLGtCQUFrQixNQUFNO0FBQUEsTUFDakUsSUFBSSxlQUFlO0FBQUEsTUFDbkIsT0FBTyxRQUFRLENBQUMsTUFBTTtBQUFBLFFBQ3BCLGVBQWUsZ0JBQWdCLEVBQUUsTUFBTSxNQUFNLEtBQUssRUFBRSxNQUFNLE1BQU07QUFBQSxPQUNqRTtBQUFBLE1BQ0QsSUFBSSxDQUFDLE9BQU8sS0FBSyxDQUFDLE1BQU0sRUFBRSxNQUFNLE1BQU0sS0FBSyxFQUFFLE1BQU0sTUFBTSxDQUFDLEdBQUc7QUFBQSxRQUMzRCxPQUFPLEtBQUssS0FBSztBQUFBLE1BQ25CO0FBQUEsTUFDQSxXQUFXO0FBQUEsSUFDYixFQUFPO0FBQUEsTUFDTCxtQkFBbUI7QUFBQSxNQUNuQixJQUFJLENBQUMsVUFBVTtBQUFBLFFBQ2IsT0FBTyxLQUFLLE1BQU07QUFBQSxNQUNwQjtBQUFBO0FBQUEsR0FFSDtBQUFBLEVBQ0QsT0FBTztBQUFBLEdBQ04sb0JBQW9CO0FBQ3ZCLElBQUksNkJBQTZCLE9BQU8sUUFBUSxDQUFDLE1BQU0sR0FBRyxNQUFNLFdBQVcsYUFBYSxPQUFPLElBQUk7QUFBQSxFQUNqRyxJQUFJLFNBQVMsS0FBSztBQUFBLEVBQ2xCLElBQUksTUFBTSwyQkFBMkIsTUFBTSxNQUFNLENBQUM7QUFBQSxFQUNsRCxJQUFJLG1CQUFtQjtBQUFBLEVBQ3ZCLE1BQU0sT0FBTyxNQUFNLEtBQUssRUFBRSxDQUFDO0FBQUEsRUFDM0IsSUFBSSxPQUFPLE1BQU0sS0FBSyxFQUFFLENBQUM7QUFBQSxFQUN6QixJQUFJLE1BQU0sYUFBYSxNQUFNLFdBQVc7QUFBQSxJQUN0QyxTQUFTLE9BQU8sTUFBTSxHQUFHLEtBQUssT0FBTyxTQUFTLENBQUM7QUFBQSxJQUMvQyxPQUFPLFFBQVEsS0FBSyxVQUFVLE9BQU8sRUFBRSxDQUFDO0FBQUEsSUFDeEMsT0FBTyxLQUFLLEtBQUssVUFBVSxPQUFPLE9BQU8sU0FBUyxFQUFFLENBQUM7QUFBQSxFQUN2RDtBQUFBLEVBQ0EsSUFBSSxLQUFLLFdBQVc7QUFBQSxJQUNsQixJQUFJLE1BQU0sb0JBQW9CLFVBQVUsS0FBSyxVQUFVO0FBQUEsSUFDdkQsU0FBUyxtQkFBbUIsS0FBSyxRQUFRLFVBQVUsS0FBSyxXQUFXLElBQUk7QUFBQSxJQUN2RSxtQkFBbUI7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsSUFBSSxLQUFLLGFBQWE7QUFBQSxJQUNwQixJQUFJLE1BQU0sc0JBQXNCLFVBQVUsS0FBSyxZQUFZO0FBQUEsSUFDM0QsU0FBUyxtQkFBbUIsT0FBTyxRQUFRLEdBQUcsVUFBVSxLQUFLLGFBQWEsSUFBSSxFQUFFLFFBQVE7QUFBQSxJQUN4RixtQkFBbUI7QUFBQSxFQUNyQjtBQUFBLEVBQ0EsTUFBTSxXQUFXLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFBQSxFQUN4RCxJQUFJLFFBQVE7QUFBQSxFQUNaLElBQUksS0FBSyxVQUFVLGdCQUFnQixXQUFXLGdCQUFnQixjQUFjO0FBQUEsSUFDMUUsUUFBUSxLQUFLO0FBQUEsRUFDZjtBQUFBLEVBQ0EsUUFBUSxHQUFHLE1BQU0sMkJBQTJCLElBQUk7QUFBQSxFQUNoRCxNQUFNLGVBQWUsYUFBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLE1BQU0sS0FBSztBQUFBLEVBQ2pELElBQUk7QUFBQSxFQUNKLFFBQVEsS0FBSztBQUFBLFNBQ047QUFBQSxNQUNILGdCQUFnQjtBQUFBLE1BQ2hCO0FBQUEsU0FDRztBQUFBLE1BQ0gsZ0JBQWdCO0FBQUEsTUFDaEI7QUFBQSxTQUNHO0FBQUEsTUFDSCxnQkFBZ0I7QUFBQSxNQUNoQjtBQUFBO0FBQUEsTUFFQSxnQkFBZ0I7QUFBQTtBQUFBLEVBRXBCLFFBQVEsS0FBSztBQUFBLFNBQ047QUFBQSxNQUNILGlCQUFpQjtBQUFBLE1BQ2pCO0FBQUEsU0FDRztBQUFBLE1BQ0gsaUJBQWlCO0FBQUEsTUFDakI7QUFBQSxTQUNHO0FBQUEsTUFDSCxpQkFBaUI7QUFBQSxNQUNqQjtBQUFBO0FBQUEsRUFFSixNQUFNLFVBQVUsS0FBSyxPQUFPLE1BQU0sRUFBRSxLQUFLLEtBQUssYUFBYSxRQUFRLENBQUMsRUFBRSxLQUFLLE1BQU0sS0FBSyxFQUFFLEVBQUUsS0FBSyxTQUFTLE1BQU0saUJBQWlCLEtBQUssVUFBVSxNQUFNLEtBQUssVUFBVSxHQUFHLEVBQUUsS0FBSyxTQUFTLEtBQUssS0FBSztBQUFBLEVBQ2hNLElBQUksTUFBTTtBQUFBLEVBQ1YsSUFBSSxXQUFXLEVBQUUsVUFBVSx1QkFBdUIsV0FBVyxFQUFFLE1BQU0scUJBQXFCO0FBQUEsSUFDeEYsTUFBTSxPQUFPLElBQUk7QUFBQSxFQUNuQjtBQUFBLEVBQ0EsZUFBZSxTQUFTLE1BQU0sS0FBSyxJQUFJLFdBQVc7QUFBQSxFQUNsRCxJQUFJLFFBQVEsQ0FBQztBQUFBLEVBQ2IsSUFBSSxrQkFBa0I7QUFBQSxJQUNwQixNQUFNLGNBQWM7QUFBQSxFQUN0QjtBQUFBLEVBQ0EsTUFBTSxlQUFlLEtBQUs7QUFBQSxFQUMxQixPQUFPO0FBQUEsR0FDTixZQUFZO0FBTWYsSUFBSSxpREFBaUQsT0FBTyxDQUFDLGVBQWU7QUFBQSxFQUMxRSxNQUFNLG1DQUFtQyxJQUFJO0FBQUEsRUFDN0MsV0FBVyxhQUFhLFlBQVk7QUFBQSxJQUNsQyxRQUFRO0FBQUEsV0FDRDtBQUFBLFFBQ0gsaUJBQWlCLElBQUksT0FBTztBQUFBLFFBQzVCLGlCQUFpQixJQUFJLE1BQU07QUFBQSxRQUMzQjtBQUFBLFdBQ0c7QUFBQSxRQUNILGlCQUFpQixJQUFJLElBQUk7QUFBQSxRQUN6QixpQkFBaUIsSUFBSSxNQUFNO0FBQUEsUUFDM0I7QUFBQTtBQUFBLFFBRUEsaUJBQWlCLElBQUksU0FBUztBQUFBLFFBQzlCO0FBQUE7QUFBQSxFQUVOO0FBQUEsRUFDQSxPQUFPO0FBQUEsR0FDTixnQ0FBZ0M7QUFDbkMsSUFBSSxpQ0FBaUMsT0FBTyxDQUFDLHNCQUFzQixNQUFNLE1BQU0sZUFBZTtBQUFBLEVBQzVGLE1BQU0sYUFBYSwrQkFBK0Isb0JBQW9CO0FBQUEsRUFDdEUsTUFBTSxJQUFJO0FBQUEsRUFDVixNQUFNLFNBQVMsS0FBSyxTQUFTLElBQUksS0FBSztBQUFBLEVBQ3RDLE1BQU0sV0FBVyxTQUFTO0FBQUEsRUFDMUIsTUFBTSxRQUFRLGNBQWMsS0FBSyxRQUFRLElBQUksV0FBVyxLQUFLO0FBQUEsRUFDN0QsTUFBTSxXQUFXLEtBQUssVUFBVTtBQUFBLEVBQ2hDLElBQUksV0FBVyxJQUFJLE9BQU8sS0FBSyxXQUFXLElBQUksTUFBTSxLQUFLLFdBQVcsSUFBSSxJQUFJLEtBQUssV0FBVyxJQUFJLE1BQU0sR0FBRztBQUFBLElBQ3ZHLE9BQU87QUFBQSxNQUVMLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRTtBQUFBLE1BQ2IsRUFBRSxHQUFHLFVBQVUsR0FBRyxFQUFFO0FBQUEsTUFDcEIsRUFBRSxHQUFHLFFBQVEsR0FBRyxHQUFHLElBQUksU0FBUztBQUFBLE1BQ2hDLEVBQUUsR0FBRyxRQUFRLFVBQVUsR0FBRyxFQUFFO0FBQUEsTUFDNUIsRUFBRSxHQUFHLE9BQU8sR0FBRyxFQUFFO0FBQUEsTUFFakIsRUFBRSxHQUFHLE9BQU8sR0FBRyxDQUFDLFNBQVMsRUFBRTtBQUFBLE1BQzNCLEVBQUUsR0FBRyxRQUFRLElBQUksVUFBVSxHQUFHLENBQUMsU0FBUyxFQUFFO0FBQUEsTUFDMUMsRUFBRSxHQUFHLE9BQU8sR0FBRyxLQUFLLFNBQVMsRUFBRTtBQUFBLE1BQy9CLEVBQUUsR0FBRyxPQUFPLEdBQUcsQ0FBQyxPQUFPO0FBQUEsTUFFdkIsRUFBRSxHQUFHLFFBQVEsVUFBVSxHQUFHLENBQUMsT0FBTztBQUFBLE1BQ2xDLEVBQUUsR0FBRyxRQUFRLEdBQUcsR0FBRyxDQUFDLFNBQVMsSUFBSSxTQUFTO0FBQUEsTUFDMUMsRUFBRSxHQUFHLFVBQVUsR0FBRyxDQUFDLE9BQU87QUFBQSxNQUUxQixFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTztBQUFBLE1BQ25CLEVBQUUsR0FBRyxHQUFHLEdBQUcsS0FBSyxTQUFTLEVBQUU7QUFBQSxNQUMzQixFQUFFLEdBQUcsS0FBSyxVQUFVLEdBQUcsQ0FBQyxTQUFTLEVBQUU7QUFBQSxNQUNuQyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsU0FBUyxFQUFFO0FBQUEsSUFDekI7QUFBQSxFQUNGO0FBQUEsRUFDQSxJQUFJLFdBQVcsSUFBSSxPQUFPLEtBQUssV0FBVyxJQUFJLE1BQU0sS0FBSyxXQUFXLElBQUksSUFBSSxHQUFHO0FBQUEsSUFDN0UsT0FBTztBQUFBLE1BQ0wsRUFBRSxHQUFHLFVBQVUsR0FBRyxFQUFFO0FBQUEsTUFDcEIsRUFBRSxHQUFHLFFBQVEsVUFBVSxHQUFHLEVBQUU7QUFBQSxNQUM1QixFQUFFLEdBQUcsT0FBTyxHQUFHLENBQUMsU0FBUyxFQUFFO0FBQUEsTUFDM0IsRUFBRSxHQUFHLFFBQVEsVUFBVSxHQUFHLENBQUMsT0FBTztBQUFBLE1BQ2xDLEVBQUUsR0FBRyxVQUFVLEdBQUcsQ0FBQyxPQUFPO0FBQUEsTUFDMUIsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsRUFBRTtBQUFBLElBQ3pCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsSUFBSSxXQUFXLElBQUksT0FBTyxLQUFLLFdBQVcsSUFBSSxNQUFNLEtBQUssV0FBVyxJQUFJLE1BQU0sR0FBRztBQUFBLElBQy9FLE9BQU87QUFBQSxNQUNMLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRTtBQUFBLE1BQ2IsRUFBRSxHQUFHLFVBQVUsR0FBRyxDQUFDLE9BQU87QUFBQSxNQUMxQixFQUFFLEdBQUcsUUFBUSxVQUFVLEdBQUcsQ0FBQyxPQUFPO0FBQUEsTUFDbEMsRUFBRSxHQUFHLE9BQU8sR0FBRyxFQUFFO0FBQUEsSUFDbkI7QUFBQSxFQUNGO0FBQUEsRUFDQSxJQUFJLFdBQVcsSUFBSSxPQUFPLEtBQUssV0FBVyxJQUFJLElBQUksS0FBSyxXQUFXLElBQUksTUFBTSxHQUFHO0FBQUEsSUFDN0UsT0FBTztBQUFBLE1BQ0wsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFO0FBQUEsTUFDYixFQUFFLEdBQUcsT0FBTyxHQUFHLENBQUMsU0FBUztBQUFBLE1BQ3pCLEVBQUUsR0FBRyxPQUFPLEdBQUcsQ0FBQyxTQUFTLFNBQVM7QUFBQSxNQUNsQyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTztBQUFBLElBQ3JCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsSUFBSSxXQUFXLElBQUksTUFBTSxLQUFLLFdBQVcsSUFBSSxJQUFJLEtBQUssV0FBVyxJQUFJLE1BQU0sR0FBRztBQUFBLElBQzVFLE9BQU87QUFBQSxNQUNMLEVBQUUsR0FBRyxPQUFPLEdBQUcsRUFBRTtBQUFBLE1BQ2pCLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxTQUFTO0FBQUEsTUFDckIsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsU0FBUztBQUFBLE1BQzlCLEVBQUUsR0FBRyxPQUFPLEdBQUcsQ0FBQyxPQUFPO0FBQUEsSUFDekI7QUFBQSxFQUNGO0FBQUEsRUFDQSxJQUFJLFdBQVcsSUFBSSxPQUFPLEtBQUssV0FBVyxJQUFJLE1BQU0sR0FBRztBQUFBLElBQ3JELE9BQU87QUFBQSxNQUNMLEVBQUUsR0FBRyxVQUFVLEdBQUcsRUFBRTtBQUFBLE1BQ3BCLEVBQUUsR0FBRyxVQUFVLEdBQUcsQ0FBQyxTQUFTO0FBQUEsTUFDNUIsRUFBRSxHQUFHLFFBQVEsVUFBVSxHQUFHLENBQUMsU0FBUztBQUFBLE1BQ3BDLEVBQUUsR0FBRyxRQUFRLFVBQVUsR0FBRyxFQUFFO0FBQUEsTUFDNUIsRUFBRSxHQUFHLE9BQU8sR0FBRyxDQUFDLFNBQVMsRUFBRTtBQUFBLE1BQzNCLEVBQUUsR0FBRyxRQUFRLFVBQVUsR0FBRyxDQUFDLE9BQU87QUFBQSxNQUNsQyxFQUFFLEdBQUcsUUFBUSxVQUFVLEdBQUcsQ0FBQyxTQUFTLFNBQVM7QUFBQSxNQUM3QyxFQUFFLEdBQUcsVUFBVSxHQUFHLENBQUMsU0FBUyxTQUFTO0FBQUEsTUFDckMsRUFBRSxHQUFHLFVBQVUsR0FBRyxDQUFDLE9BQU87QUFBQSxNQUMxQixFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsU0FBUyxFQUFFO0FBQUEsSUFDekI7QUFBQSxFQUNGO0FBQUEsRUFDQSxJQUFJLFdBQVcsSUFBSSxJQUFJLEtBQUssV0FBVyxJQUFJLE1BQU0sR0FBRztBQUFBLElBQ2xELE9BQU87QUFBQSxNQUVMLEVBQUUsR0FBRyxRQUFRLEdBQUcsR0FBRyxFQUFFO0FBQUEsTUFFckIsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVM7QUFBQSxNQUNyQixFQUFFLEdBQUcsVUFBVSxHQUFHLENBQUMsU0FBUztBQUFBLE1BRTVCLEVBQUUsR0FBRyxVQUFVLEdBQUcsQ0FBQyxTQUFTLFNBQVM7QUFBQSxNQUNyQyxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsU0FBUyxTQUFTO0FBQUEsTUFFOUIsRUFBRSxHQUFHLFFBQVEsR0FBRyxHQUFHLENBQUMsT0FBTztBQUFBLE1BQzNCLEVBQUUsR0FBRyxPQUFPLEdBQUcsQ0FBQyxTQUFTLFNBQVM7QUFBQSxNQUVsQyxFQUFFLEdBQUcsUUFBUSxVQUFVLEdBQUcsQ0FBQyxTQUFTLFNBQVM7QUFBQSxNQUM3QyxFQUFFLEdBQUcsUUFBUSxVQUFVLEdBQUcsQ0FBQyxTQUFTO0FBQUEsTUFDcEMsRUFBRSxHQUFHLE9BQU8sR0FBRyxDQUFDLFNBQVM7QUFBQSxJQUMzQjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLElBQUksV0FBVyxJQUFJLE9BQU8sS0FBSyxXQUFXLElBQUksSUFBSSxHQUFHO0FBQUEsSUFDbkQsT0FBTztBQUFBLE1BQ0wsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFO0FBQUEsTUFDYixFQUFFLEdBQUcsT0FBTyxHQUFHLENBQUMsU0FBUztBQUFBLE1BQ3pCLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPO0FBQUEsSUFDckI7QUFBQSxFQUNGO0FBQUEsRUFDQSxJQUFJLFdBQVcsSUFBSSxPQUFPLEtBQUssV0FBVyxJQUFJLE1BQU0sR0FBRztBQUFBLElBQ3JELE9BQU87QUFBQSxNQUNMLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRTtBQUFBLE1BQ2IsRUFBRSxHQUFHLE9BQU8sR0FBRyxFQUFFO0FBQUEsTUFDakIsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU87QUFBQSxJQUNyQjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLElBQUksV0FBVyxJQUFJLE1BQU0sS0FBSyxXQUFXLElBQUksSUFBSSxHQUFHO0FBQUEsSUFDbEQsT0FBTztBQUFBLE1BQ0wsRUFBRSxHQUFHLE9BQU8sR0FBRyxFQUFFO0FBQUEsTUFDakIsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVM7QUFBQSxNQUNyQixFQUFFLEdBQUcsT0FBTyxHQUFHLENBQUMsT0FBTztBQUFBLElBQ3pCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsSUFBSSxXQUFXLElBQUksTUFBTSxLQUFLLFdBQVcsSUFBSSxNQUFNLEdBQUc7QUFBQSxJQUNwRCxPQUFPO0FBQUEsTUFDTCxFQUFFLEdBQUcsT0FBTyxHQUFHLEVBQUU7QUFBQSxNQUNqQixFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUU7QUFBQSxNQUNiLEVBQUUsR0FBRyxPQUFPLEdBQUcsQ0FBQyxPQUFPO0FBQUEsSUFDekI7QUFBQSxFQUNGO0FBQUEsRUFDQSxJQUFJLFdBQVcsSUFBSSxPQUFPLEdBQUc7QUFBQSxJQUMzQixPQUFPO0FBQUEsTUFDTCxFQUFFLEdBQUcsVUFBVSxHQUFHLENBQUMsU0FBUztBQUFBLE1BQzVCLEVBQUUsR0FBRyxVQUFVLEdBQUcsQ0FBQyxTQUFTO0FBQUEsTUFDNUIsRUFBRSxHQUFHLFFBQVEsVUFBVSxHQUFHLENBQUMsU0FBUztBQUFBLE1BQ3BDLEVBQUUsR0FBRyxRQUFRLFVBQVUsR0FBRyxFQUFFO0FBQUEsTUFDNUIsRUFBRSxHQUFHLE9BQU8sR0FBRyxDQUFDLFNBQVMsRUFBRTtBQUFBLE1BQzNCLEVBQUUsR0FBRyxRQUFRLFVBQVUsR0FBRyxDQUFDLE9BQU87QUFBQSxNQUNsQyxFQUFFLEdBQUcsUUFBUSxVQUFVLEdBQUcsQ0FBQyxTQUFTLFNBQVM7QUFBQSxNQUU3QyxFQUFFLEdBQUcsVUFBVSxHQUFHLENBQUMsU0FBUyxTQUFTO0FBQUEsTUFDckMsRUFBRSxHQUFHLFVBQVUsR0FBRyxDQUFDLFNBQVMsU0FBUztBQUFBLElBQ3ZDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsSUFBSSxXQUFXLElBQUksTUFBTSxHQUFHO0FBQUEsSUFDMUIsT0FBTztBQUFBLE1BQ0wsRUFBRSxHQUFHLFVBQVUsR0FBRyxFQUFFO0FBQUEsTUFDcEIsRUFBRSxHQUFHLFVBQVUsR0FBRyxDQUFDLFNBQVM7QUFBQSxNQUU1QixFQUFFLEdBQUcsUUFBUSxVQUFVLEdBQUcsQ0FBQyxTQUFTO0FBQUEsTUFDcEMsRUFBRSxHQUFHLFFBQVEsVUFBVSxHQUFHLENBQUMsU0FBUyxTQUFTO0FBQUEsTUFDN0MsRUFBRSxHQUFHLFVBQVUsR0FBRyxDQUFDLFNBQVMsU0FBUztBQUFBLE1BQ3JDLEVBQUUsR0FBRyxVQUFVLEdBQUcsQ0FBQyxPQUFPO0FBQUEsTUFDMUIsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsRUFBRTtBQUFBLElBQ3pCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsSUFBSSxXQUFXLElBQUksSUFBSSxHQUFHO0FBQUEsSUFDeEIsT0FBTztBQUFBLE1BRUwsRUFBRSxHQUFHLFVBQVUsR0FBRyxDQUFDLFNBQVM7QUFBQSxNQUU1QixFQUFFLEdBQUcsVUFBVSxHQUFHLENBQUMsU0FBUyxTQUFTO0FBQUEsTUFDckMsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsU0FBUztBQUFBLE1BRTlCLEVBQUUsR0FBRyxRQUFRLEdBQUcsR0FBRyxDQUFDLE9BQU87QUFBQSxNQUMzQixFQUFFLEdBQUcsT0FBTyxHQUFHLENBQUMsU0FBUyxTQUFTO0FBQUEsTUFFbEMsRUFBRSxHQUFHLFFBQVEsVUFBVSxHQUFHLENBQUMsU0FBUyxTQUFTO0FBQUEsTUFDN0MsRUFBRSxHQUFHLFFBQVEsVUFBVSxHQUFHLENBQUMsU0FBUztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsSUFBSSxXQUFXLElBQUksTUFBTSxHQUFHO0FBQUEsSUFDMUIsT0FBTztBQUFBLE1BRUwsRUFBRSxHQUFHLFFBQVEsR0FBRyxHQUFHLEVBQUU7QUFBQSxNQUVyQixFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsU0FBUztBQUFBLE1BQ3JCLEVBQUUsR0FBRyxVQUFVLEdBQUcsQ0FBQyxTQUFTO0FBQUEsTUFFNUIsRUFBRSxHQUFHLFVBQVUsR0FBRyxDQUFDLFNBQVMsU0FBUztBQUFBLE1BQ3JDLEVBQUUsR0FBRyxRQUFRLFVBQVUsR0FBRyxDQUFDLFNBQVMsU0FBUztBQUFBLE1BQzdDLEVBQUUsR0FBRyxRQUFRLFVBQVUsR0FBRyxDQUFDLFNBQVM7QUFBQSxNQUNwQyxFQUFFLEdBQUcsT0FBTyxHQUFHLENBQUMsU0FBUztBQUFBLElBQzNCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQUEsR0FDckIsZ0JBQWdCO0FBR25CLFNBQVMsYUFBYSxDQUFDLE1BQU0sUUFBUTtBQUFBLEVBQ25DLE9BQU8sS0FBSyxVQUFVLE1BQU07QUFBQTtBQUU5QixPQUFPLGVBQWUsZUFBZTtBQUNyQyxJQUFJLHlCQUF5QjtBQUc3QixTQUFTLGdCQUFnQixDQUFDLE1BQU0sSUFBSSxJQUFJLFFBQVE7QUFBQSxFQUM5QyxJQUFJLEtBQUssS0FBSztBQUFBLEVBQ2QsSUFBSSxLQUFLLEtBQUs7QUFBQSxFQUNkLElBQUksS0FBSyxLQUFLLE9BQU87QUFBQSxFQUNyQixJQUFJLEtBQUssS0FBSyxPQUFPO0FBQUEsRUFDckIsSUFBSSxNQUFNLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEVBQUU7QUFBQSxFQUN6RCxJQUFJLEtBQUssS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLEdBQUc7QUFBQSxFQUNwQyxJQUFJLE9BQU8sSUFBSSxJQUFJO0FBQUEsSUFDakIsS0FBSyxDQUFDO0FBQUEsRUFDUjtBQUFBLEVBQ0EsSUFBSSxLQUFLLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxHQUFHO0FBQUEsRUFDcEMsSUFBSSxPQUFPLElBQUksSUFBSTtBQUFBLElBQ2pCLEtBQUssQ0FBQztBQUFBLEVBQ1I7QUFBQSxFQUNBLE9BQU8sRUFBRSxHQUFHLEtBQUssSUFBSSxHQUFHLEtBQUssR0FBRztBQUFBO0FBRWxDLE9BQU8sa0JBQWtCLGtCQUFrQjtBQUMzQyxJQUFJLDRCQUE0QjtBQUdoQyxTQUFTLGVBQWUsQ0FBQyxNQUFNLElBQUksUUFBUTtBQUFBLEVBQ3pDLE9BQU8sMEJBQTBCLE1BQU0sSUFBSSxJQUFJLE1BQU07QUFBQTtBQUV2RCxPQUFPLGlCQUFpQixpQkFBaUI7QUFDekMsSUFBSSwyQkFBMkI7QUFHL0IsU0FBUyxhQUFhLENBQUMsSUFBSSxJQUFJLElBQUksSUFBSTtBQUFBLEVBQ3JDLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJO0FBQUEsRUFDeEIsSUFBSSxJQUFJLElBQUksSUFBSTtBQUFBLEVBQ2hCLElBQUksT0FBTyxRQUFRO0FBQUEsRUFDbkIsSUFBSSxHQUFHO0FBQUEsRUFDUCxLQUFLLEdBQUcsSUFBSSxHQUFHO0FBQUEsRUFDZixLQUFLLEdBQUcsSUFBSSxHQUFHO0FBQUEsRUFDZixLQUFLLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUc7QUFBQSxFQUM3QixLQUFLLEtBQUssR0FBRyxJQUFJLEtBQUssR0FBRyxJQUFJO0FBQUEsRUFDN0IsS0FBSyxLQUFLLEdBQUcsSUFBSSxLQUFLLEdBQUcsSUFBSTtBQUFBLEVBQzdCLElBQUksT0FBTyxLQUFLLE9BQU8sS0FBSyxTQUFTLElBQUksRUFBRSxHQUFHO0FBQUEsSUFDNUM7QUFBQSxFQUNGO0FBQUEsRUFDQSxLQUFLLEdBQUcsSUFBSSxHQUFHO0FBQUEsRUFDZixLQUFLLEdBQUcsSUFBSSxHQUFHO0FBQUEsRUFDZixLQUFLLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUc7QUFBQSxFQUM3QixLQUFLLEtBQUssR0FBRyxJQUFJLEtBQUssR0FBRyxJQUFJO0FBQUEsRUFDN0IsS0FBSyxLQUFLLEdBQUcsSUFBSSxLQUFLLEdBQUcsSUFBSTtBQUFBLEVBQzdCLElBQUksT0FBTyxLQUFLLE9BQU8sS0FBSyxTQUFTLElBQUksRUFBRSxHQUFHO0FBQUEsSUFDNUM7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRLEtBQUssS0FBSyxLQUFLO0FBQUEsRUFDdkIsSUFBSSxVQUFVLEdBQUc7QUFBQSxJQUNmO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUyxLQUFLLElBQUksUUFBUSxDQUFDO0FBQUEsRUFDM0IsTUFBTSxLQUFLLEtBQUssS0FBSztBQUFBLEVBQ3JCLElBQUksTUFBTSxLQUFLLE1BQU0sVUFBVSxTQUFTLE1BQU0sVUFBVTtBQUFBLEVBQ3hELE1BQU0sS0FBSyxLQUFLLEtBQUs7QUFBQSxFQUNyQixJQUFJLE1BQU0sS0FBSyxNQUFNLFVBQVUsU0FBUyxNQUFNLFVBQVU7QUFBQSxFQUN4RCxPQUFPLEVBQUUsR0FBRyxFQUFFO0FBQUE7QUFFaEIsT0FBTyxlQUFlLGVBQWU7QUFDckMsU0FBUyxRQUFRLENBQUMsSUFBSSxJQUFJO0FBQUEsRUFDeEIsT0FBTyxLQUFLLEtBQUs7QUFBQTtBQUVuQixPQUFPLFVBQVUsVUFBVTtBQUMzQixJQUFJLHlCQUF5QjtBQUc3QixJQUFJLDRCQUE0QjtBQUNoQyxTQUFTLGdCQUFnQixDQUFDLE1BQU0sWUFBWSxRQUFRO0FBQUEsRUFDbEQsSUFBSSxLQUFLLEtBQUs7QUFBQSxFQUNkLElBQUksS0FBSyxLQUFLO0FBQUEsRUFDZCxJQUFJLGdCQUFnQixDQUFDO0FBQUEsRUFDckIsSUFBSSxPQUFPLE9BQU87QUFBQSxFQUNsQixJQUFJLE9BQU8sT0FBTztBQUFBLEVBQ2xCLElBQUksT0FBTyxXQUFXLFlBQVksWUFBWTtBQUFBLElBQzVDLFdBQVcsUUFBUSxRQUFRLENBQUMsT0FBTztBQUFBLE1BQ2pDLE9BQU8sS0FBSyxJQUFJLE1BQU0sTUFBTSxDQUFDO0FBQUEsTUFDN0IsT0FBTyxLQUFLLElBQUksTUFBTSxNQUFNLENBQUM7QUFBQSxLQUM5QjtBQUFBLEVBQ0gsRUFBTztBQUFBLElBQ0wsT0FBTyxLQUFLLElBQUksTUFBTSxXQUFXLENBQUM7QUFBQSxJQUNsQyxPQUFPLEtBQUssSUFBSSxNQUFNLFdBQVcsQ0FBQztBQUFBO0FBQUEsRUFFcEMsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUk7QUFBQSxFQUNqQyxJQUFJLE1BQU0sS0FBSyxLQUFLLFNBQVMsSUFBSTtBQUFBLEVBQ2pDLFNBQVMsSUFBSSxFQUFHLElBQUksV0FBVyxRQUFRLEtBQUs7QUFBQSxJQUMxQyxJQUFJLEtBQUssV0FBVztBQUFBLElBQ3BCLElBQUksS0FBSyxXQUFXLElBQUksV0FBVyxTQUFTLElBQUksSUFBSSxJQUFJO0FBQUEsSUFDeEQsSUFBSSxZQUFZLHVCQUNkLE1BQ0EsUUFDQSxFQUFFLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsRUFBRSxHQUNoQyxFQUFFLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsRUFBRSxDQUNsQztBQUFBLElBQ0EsSUFBSSxXQUFXO0FBQUEsTUFDYixjQUFjLEtBQUssU0FBUztBQUFBLElBQzlCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsSUFBSSxDQUFDLGNBQWMsUUFBUTtBQUFBLElBQ3pCLE9BQU87QUFBQSxFQUNUO0FBQUEsRUFDQSxJQUFJLGNBQWMsU0FBUyxHQUFHO0FBQUEsSUFDNUIsY0FBYyxLQUFLLFFBQVEsQ0FBQyxHQUFHLEdBQUc7QUFBQSxNQUNoQyxJQUFJLE1BQU0sRUFBRSxJQUFJLE9BQU87QUFBQSxNQUN2QixJQUFJLE1BQU0sRUFBRSxJQUFJLE9BQU87QUFBQSxNQUN2QixJQUFJLFFBQVEsS0FBSyxLQUFLLE1BQU0sTUFBTSxNQUFNLEdBQUc7QUFBQSxNQUMzQyxJQUFJLE1BQU0sRUFBRSxJQUFJLE9BQU87QUFBQSxNQUN2QixJQUFJLE1BQU0sRUFBRSxJQUFJLE9BQU87QUFBQSxNQUN2QixJQUFJLFFBQVEsS0FBSyxLQUFLLE1BQU0sTUFBTSxNQUFNLEdBQUc7QUFBQSxNQUMzQyxPQUFPLFFBQVEsUUFBUSxLQUFLLFVBQVUsUUFBUSxJQUFJO0FBQUEsS0FDbkQ7QUFBQSxFQUNIO0FBQUEsRUFDQSxPQUFPLGNBQWM7QUFBQTtBQUV2QixPQUFPLGtCQUFrQixrQkFBa0I7QUFHM0MsSUFBSSxnQ0FBZ0MsT0FBTyxDQUFDLE1BQU0sV0FBVztBQUFBLEVBQzNELElBQUksSUFBSSxLQUFLO0FBQUEsRUFDYixJQUFJLElBQUksS0FBSztBQUFBLEVBQ2IsSUFBSSxLQUFLLE9BQU8sSUFBSTtBQUFBLEVBQ3BCLElBQUksS0FBSyxPQUFPLElBQUk7QUFBQSxFQUNwQixJQUFJLElBQUksS0FBSyxRQUFRO0FBQUEsRUFDckIsSUFBSSxJQUFJLEtBQUssU0FBUztBQUFBLEVBQ3RCLElBQUksSUFBSTtBQUFBLEVBQ1IsSUFBSSxLQUFLLElBQUksRUFBRSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQUUsSUFBSSxHQUFHO0FBQUEsSUFDdkMsSUFBSSxLQUFLLEdBQUc7QUFBQSxNQUNWLElBQUksQ0FBQztBQUFBLElBQ1A7QUFBQSxJQUNBLEtBQUssT0FBTyxJQUFJLElBQUksSUFBSSxLQUFLO0FBQUEsSUFDN0IsS0FBSztBQUFBLEVBQ1AsRUFBTztBQUFBLElBQ0wsSUFBSSxLQUFLLEdBQUc7QUFBQSxNQUNWLElBQUksQ0FBQztBQUFBLElBQ1A7QUFBQSxJQUNBLEtBQUs7QUFBQSxJQUNMLEtBQUssT0FBTyxJQUFJLElBQUksSUFBSSxLQUFLO0FBQUE7QUFBQSxFQUUvQixPQUFPLEVBQUUsR0FBRyxJQUFJLElBQUksR0FBRyxJQUFJLEdBQUc7QUFBQSxHQUM3QixlQUFlO0FBQ2xCLElBQUkseUJBQXlCO0FBRzdCLElBQUksb0JBQW9CO0FBQUEsRUFDdEIsTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLEVBQ1IsU0FBUztBQUFBLEVBQ1QsU0FBUztBQUFBLEVBQ1QsTUFBTTtBQUNSO0FBSUEsSUFBSSw4QkFBOEIsT0FBTyxPQUFPLFFBQVEsTUFBTSxVQUFVLFdBQVc7QUFBQSxFQUNqRixNQUFNLFVBQVUsV0FBVztBQUFBLEVBQzNCLElBQUk7QUFBQSxFQUNKLE1BQU0sZ0JBQWdCLEtBQUssaUJBQWlCLHVCQUF1QixPQUFPO0FBQUEsRUFDMUUsSUFBSSxDQUFDLFVBQVU7QUFBQSxJQUNiLFdBQVc7QUFBQSxFQUNiLEVBQU87QUFBQSxJQUNMLFdBQVc7QUFBQTtBQUFBLEVBRWIsTUFBTSxXQUFXLE9BQU8sT0FBTyxHQUFHLEVBQUUsS0FBSyxTQUFTLFFBQVEsRUFBRSxLQUFLLE1BQU0sS0FBSyxTQUFTLEtBQUssRUFBRTtBQUFBLEVBQzVGLE1BQU0sUUFBUSxTQUFTLE9BQU8sR0FBRyxFQUFFLEtBQUssU0FBUyxPQUFPLEVBQUUsS0FBSyxTQUFTLEtBQUssVUFBVTtBQUFBLEVBQ3ZGLElBQUk7QUFBQSxFQUNKLElBQUksS0FBSyxjQUFtQixXQUFHO0FBQUEsSUFDN0IsWUFBWTtBQUFBLEVBQ2QsRUFBTztBQUFBLElBQ0wsWUFBWSxPQUFPLEtBQUssY0FBYyxXQUFXLEtBQUssWUFBWSxLQUFLLFVBQVU7QUFBQTtBQUFBLEVBRW5GLElBQUk7QUFBQSxFQUNKLElBQUksS0FBSyxjQUFjLFlBQVk7QUFBQSxJQUNqQyxPQUFPLFdBQ0wsT0FDQSxhQUFhLGVBQWUsU0FBUyxHQUFHLE9BQU8sR0FDL0M7QUFBQSxNQUNFO0FBQUEsTUFDQSxPQUFPLEtBQUssU0FBUyxRQUFRLFVBQVU7QUFBQSxNQUN2QyxTQUFTO0FBQUEsSUFDWCxHQUNBLE9BQ0Y7QUFBQSxFQUNGLEVBQU87QUFBQSxJQUNMLE9BQU8sTUFBTSxvQkFDWCxPQUNBLGFBQWEsZUFBZSxTQUFTLEdBQUcsT0FBTyxHQUMvQyxLQUFLLFlBQ0wsT0FDQSxNQUNGO0FBQUE7QUFBQSxFQUVGLElBQUksT0FBTyxLQUFLLFFBQVE7QUFBQSxFQUN4QixNQUFNLGNBQWMsS0FBSyxVQUFVO0FBQUEsRUFDbkMsSUFBSSx1QkFBdUIsT0FBTyxHQUFHO0FBQUEsSUFDbkMsTUFBTSxNQUFNLEtBQUssU0FBUztBQUFBLElBQzFCLE1BQU0sS0FBSyxlQUFRLElBQUk7QUFBQSxJQUN2QixNQUFNLHFCQUFxQixLQUFLLFNBQVM7QUFBQSxJQUN6QyxPQUFPLElBQUksc0JBQXNCO0FBQUEsSUFDakMsR0FBRyxLQUFLLFNBQVMsS0FBSyxLQUFLO0FBQUEsSUFDM0IsR0FBRyxLQUFLLFVBQVUsS0FBSyxNQUFNO0FBQUEsRUFDL0I7QUFBQSxFQUNBLElBQUksZUFBZTtBQUFBLElBQ2pCLE1BQU0sS0FBSyxhQUFhLGVBQWUsQ0FBQyxLQUFLLFFBQVEsSUFBSSxPQUFPLENBQUMsS0FBSyxTQUFTLElBQUksR0FBRztBQUFBLEVBQ3hGLEVBQU87QUFBQSxJQUNMLE1BQU0sS0FBSyxhQUFhLGtCQUFrQixDQUFDLEtBQUssU0FBUyxJQUFJLEdBQUc7QUFBQTtBQUFBLEVBRWxFLElBQUksS0FBSyxhQUFhO0FBQUEsSUFDcEIsTUFBTSxLQUFLLGFBQWEsZUFBZSxDQUFDLEtBQUssUUFBUSxJQUFJLE9BQU8sQ0FBQyxLQUFLLFNBQVMsSUFBSSxHQUFHO0FBQUEsRUFDeEY7QUFBQSxFQUNBLE1BQU0sT0FBTyxRQUFRLGNBQWM7QUFBQSxFQUNuQyxPQUFPLEVBQUUsVUFBVSxNQUFNLGFBQWEsTUFBTTtBQUFBLEdBQzNDLGFBQWE7QUFDaEIsSUFBSSxtQ0FBbUMsT0FBTyxDQUFDLE1BQU0sWUFBWTtBQUFBLEVBQy9ELE1BQU0sT0FBTyxRQUFRLEtBQUssRUFBRSxRQUFRO0FBQUEsRUFDcEMsS0FBSyxRQUFRLEtBQUs7QUFBQSxFQUNsQixLQUFLLFNBQVMsS0FBSztBQUFBLEdBQ2xCLGtCQUFrQjtBQUNyQixTQUFTLGtCQUFrQixDQUFDLFFBQVEsR0FBRyxHQUFHLFFBQVE7QUFBQSxFQUNoRCxPQUFPLE9BQU8sT0FBTyxXQUFXLGNBQWMsRUFBRSxLQUM5QyxVQUNBLE9BQU8sSUFBSSxRQUFRLENBQUMsR0FBRztBQUFBLElBQ3JCLE9BQU8sRUFBRSxJQUFJLE1BQU0sRUFBRTtBQUFBLEdBQ3RCLEVBQUUsS0FBSyxHQUFHLENBQ2IsRUFBRSxLQUFLLFNBQVMsaUJBQWlCLEVBQUUsS0FBSyxhQUFhLGVBQWUsQ0FBQyxJQUFJLElBQUksTUFBTSxJQUFJLElBQUksR0FBRztBQUFBO0FBRWhHLE9BQU8sb0JBQW9CLG9CQUFvQjtBQUcvQyxJQUFJLHVCQUF1QixPQUFPLE9BQU8sUUFBUSxTQUFTO0FBQUEsRUFDeEQsTUFBTSxnQkFBZ0IsS0FBSyxpQkFBaUIsdUJBQXVCLFdBQVcsQ0FBQztBQUFBLEVBQy9FLElBQUksQ0FBQyxlQUFlO0FBQUEsSUFDbEIsS0FBSyxjQUFjO0FBQUEsRUFDckI7QUFBQSxFQUNBLFFBQVEsVUFBVSxNQUFNLGdCQUFnQixNQUFNLFlBQzVDLFFBQ0EsTUFDQSxVQUFVLEtBQUssU0FDZixJQUNGO0FBQUEsRUFDQSxJQUFJLEtBQUssY0FBYyxLQUFLLE9BQU87QUFBQSxFQUNuQyxNQUFNLFFBQVEsU0FBUyxPQUFPLFFBQVEsY0FBYztBQUFBLEVBQ3BELE1BQU0sS0FBSyxNQUFNLEtBQUssRUFBRSxFQUFFLEtBQUssTUFBTSxLQUFLLEVBQUUsRUFBRSxLQUFLLEtBQUssQ0FBQyxLQUFLLFFBQVEsSUFBSSxXQUFXLEVBQUUsS0FBSyxLQUFLLENBQUMsS0FBSyxTQUFTLElBQUksV0FBVyxFQUFFLEtBQUssU0FBUyxLQUFLLFFBQVEsS0FBSyxPQUFPLEVBQUUsS0FBSyxVQUFVLEtBQUssU0FBUyxLQUFLLE9BQU87QUFBQSxFQUNuTixpQkFBaUIsTUFBTSxLQUFLO0FBQUEsRUFDNUIsS0FBSyxZQUFZLFFBQVEsQ0FBQyxRQUFRO0FBQUEsSUFDaEMsT0FBTyxrQkFBa0IsS0FBSyxNQUFNLE1BQU07QUFBQTtBQUFBLEVBRTVDLE9BQU87QUFBQSxHQUNOLE1BQU07QUFDVCxJQUFJLGVBQWU7QUFHbkIsSUFBSSw4QkFBOEIsT0FBTyxDQUFDLFFBQVE7QUFBQSxFQUNoRCxJQUFJLEtBQUs7QUFBQSxJQUNQLE9BQU8sTUFBTTtBQUFBLEVBQ2Y7QUFBQSxFQUNBLE9BQU87QUFBQSxHQUNOLGFBQWE7QUFDaEIsSUFBSSxxQ0FBcUMsT0FBTyxDQUFDLE1BQU0saUJBQWlCO0FBQUEsRUFDdEUsT0FBTyxHQUFHLGVBQWUsZUFBZSxpQkFBaUIsWUFBWSxLQUFLLE9BQU8sS0FBSyxZQUNwRixLQUFLLEtBQ1A7QUFBQSxHQUNDLG9CQUFvQjtBQUN2QixJQUFJLDJCQUEyQixPQUFPLE9BQU8sUUFBUSxTQUFTO0FBQUEsRUFDNUQsUUFBUSxVQUFVLFNBQVMsTUFBTSxZQUMvQixRQUNBLE1BQ0EsbUJBQW1CLE1BQVcsU0FBQyxHQUMvQixJQUNGO0FBQUEsRUFDQSxNQUFNLElBQUksS0FBSyxRQUFRLEtBQUs7QUFBQSxFQUM1QixNQUFNLElBQUksS0FBSyxTQUFTLEtBQUs7QUFBQSxFQUM3QixNQUFNLElBQUksSUFBSTtBQUFBLEVBQ2QsTUFBTSxTQUFTO0FBQUEsSUFDYixFQUFFLEdBQUcsSUFBSSxHQUFHLEdBQUcsRUFBRTtBQUFBLElBQ2pCLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUU7QUFBQSxJQUNsQixFQUFFLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFO0FBQUEsSUFDbEIsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksRUFBRTtBQUFBLEVBQ3BCO0FBQUEsRUFDQSxJQUFJLEtBQUssd0JBQXdCO0FBQUEsRUFDakMsTUFBTSxlQUFlLG1CQUFtQixVQUFVLEdBQUcsR0FBRyxNQUFNO0FBQUEsRUFDOUQsYUFBYSxLQUFLLFNBQVMsS0FBSyxLQUFLO0FBQUEsRUFDckMsaUJBQWlCLE1BQU0sWUFBWTtBQUFBLEVBQ25DLEtBQUssWUFBWSxRQUFRLENBQUMsUUFBUTtBQUFBLElBQ2hDLElBQUksS0FBSyxrQkFBa0I7QUFBQSxJQUMzQixPQUFPLGtCQUFrQixRQUFRLE1BQU0sUUFBUSxNQUFNO0FBQUE7QUFBQSxFQUV2RCxPQUFPO0FBQUEsR0FDTixVQUFVO0FBQ2IsSUFBSSx5QkFBeUIsT0FBTyxDQUFDLFFBQVEsU0FBUztBQUFBLEVBQ3BELE1BQU0sV0FBVyxPQUFPLE9BQU8sR0FBRyxFQUFFLEtBQUssU0FBUyxjQUFjLEVBQUUsS0FBSyxNQUFNLEtBQUssU0FBUyxLQUFLLEVBQUU7QUFBQSxFQUNsRyxNQUFNLElBQUk7QUFBQSxFQUNWLE1BQU0sU0FBUztBQUFBLElBQ2IsRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFJLEVBQUU7QUFBQSxJQUNqQixFQUFFLEdBQUcsSUFBSSxHQUFHLEdBQUcsRUFBRTtBQUFBLElBQ2pCLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUU7QUFBQSxJQUNsQixFQUFFLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxFQUFFO0FBQUEsRUFDcEI7QUFBQSxFQUNBLE1BQU0sVUFBVSxTQUFTLE9BQU8sV0FBVyxjQUFjLEVBQUUsS0FDekQsVUFDQSxPQUFPLElBQUksUUFBUSxDQUFDLEdBQUc7QUFBQSxJQUNyQixPQUFPLEVBQUUsSUFBSSxNQUFNLEVBQUU7QUFBQSxHQUN0QixFQUFFLEtBQUssR0FBRyxDQUNiO0FBQUEsRUFDQSxRQUFRLEtBQUssU0FBUyxhQUFhLEVBQUUsS0FBSyxLQUFLLENBQUMsRUFBRSxLQUFLLFNBQVMsRUFBRSxFQUFFLEtBQUssVUFBVSxFQUFFO0FBQUEsRUFDckYsS0FBSyxRQUFRO0FBQUEsRUFDYixLQUFLLFNBQVM7QUFBQSxFQUNkLEtBQUssWUFBWSxRQUFRLENBQUMsUUFBUTtBQUFBLElBQ2hDLE9BQU8sa0JBQWtCLE9BQU8sTUFBTSxJQUFJLE1BQU07QUFBQTtBQUFBLEVBRWxELE9BQU87QUFBQSxHQUNOLFFBQVE7QUFDWCxJQUFJLDBCQUEwQixPQUFPLE9BQU8sUUFBUSxTQUFTO0FBQUEsRUFDM0QsUUFBUSxVQUFVLFNBQVMsTUFBTSxZQUMvQixRQUNBLE1BQ0EsbUJBQW1CLE1BQVcsU0FBQyxHQUMvQixJQUNGO0FBQUEsRUFDQSxNQUFNLElBQUk7QUFBQSxFQUNWLE1BQU0sSUFBSSxLQUFLLGFBQWEsS0FBSyxTQUFTLEtBQUssU0FBUyxLQUFLO0FBQUEsRUFDN0QsTUFBTSxJQUFJLElBQUk7QUFBQSxFQUNkLE1BQU0sSUFBSSxLQUFLLGFBQWEsS0FBSyxRQUFRLEtBQUssUUFBUSxJQUFJLElBQUksS0FBSztBQUFBLEVBQ25FLE1BQU0sU0FBUztBQUFBLElBQ2IsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFO0FBQUEsSUFDYixFQUFFLEdBQUcsSUFBSSxHQUFHLEdBQUcsRUFBRTtBQUFBLElBQ2pCLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUU7QUFBQSxJQUNsQixFQUFFLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFO0FBQUEsSUFDbEIsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLEVBQUU7QUFBQSxJQUNkLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUU7QUFBQSxFQUNwQjtBQUFBLEVBQ0EsTUFBTSxNQUFNLG1CQUFtQixVQUFVLEdBQUcsR0FBRyxNQUFNO0FBQUEsRUFDckQsSUFBSSxLQUFLLFNBQVMsS0FBSyxLQUFLO0FBQUEsRUFDNUIsaUJBQWlCLE1BQU0sR0FBRztBQUFBLEVBQzFCLEtBQUssWUFBWSxRQUFRLENBQUMsUUFBUTtBQUFBLElBQ2hDLE9BQU8sa0JBQWtCLFFBQVEsTUFBTSxRQUFRLE1BQU07QUFBQTtBQUFBLEVBRXZELE9BQU87QUFBQSxHQUNOLFNBQVM7QUFDWixJQUFJLDhCQUE4QixPQUFPLE9BQU8sUUFBUSxTQUFTO0FBQUEsRUFDL0QsUUFBUSxVQUFVLFNBQVMsTUFBTSxZQUFZLFFBQVEsTUFBVyxXQUFHLElBQUk7QUFBQSxFQUN2RSxNQUFNLElBQUk7QUFBQSxFQUNWLE1BQU0sSUFBSSxLQUFLLFNBQVMsSUFBSSxLQUFLO0FBQUEsRUFDakMsTUFBTSxJQUFJLElBQUk7QUFBQSxFQUNkLE1BQU0sV0FBVyxLQUFLLFFBQVEsSUFBSSxJQUFJLEtBQUs7QUFBQSxFQUMzQyxNQUFNLGFBQWEsS0FBSyxlQUFlLEtBQUssa0JBQWtCLEtBQUssS0FBSyxLQUFLLFFBQVE7QUFBQSxFQUNyRixNQUFNLElBQUksYUFBYSxLQUFLLFFBQVE7QUFBQSxFQUNwQyxNQUFNLFNBQVMsZUFBZSxLQUFLLFlBQVksTUFBTSxNQUFNLENBQUM7QUFBQSxFQUM1RCxNQUFNLGFBQWEsbUJBQW1CLFVBQVUsR0FBRyxHQUFHLE1BQU07QUFBQSxFQUM1RCxXQUFXLEtBQUssU0FBUyxLQUFLLEtBQUs7QUFBQSxFQUNuQyxpQkFBaUIsTUFBTSxVQUFVO0FBQUEsRUFDakMsS0FBSyxZQUFZLFFBQVEsQ0FBQyxRQUFRO0FBQUEsSUFDaEMsT0FBTyxrQkFBa0IsUUFBUSxNQUFNLFFBQVEsTUFBTTtBQUFBO0FBQUEsRUFFdkQsT0FBTztBQUFBLEdBQ04sYUFBYTtBQUNoQixJQUFJLHNDQUFzQyxPQUFPLE9BQU8sUUFBUSxTQUFTO0FBQUEsRUFDdkUsUUFBUSxVQUFVLFNBQVMsTUFBTSxZQUMvQixRQUNBLE1BQ0EsbUJBQW1CLE1BQVcsU0FBQyxHQUMvQixJQUNGO0FBQUEsRUFDQSxNQUFNLElBQUksS0FBSyxRQUFRLEtBQUs7QUFBQSxFQUM1QixNQUFNLElBQUksS0FBSyxTQUFTLEtBQUs7QUFBQSxFQUM3QixNQUFNLFNBQVM7QUFBQSxJQUNiLEVBQUUsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLEVBQUU7QUFBQSxJQUNsQixFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUU7QUFBQSxJQUNiLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxFQUFFO0FBQUEsSUFDZCxFQUFFLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7QUFBQSxJQUNuQixFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxFQUFFO0FBQUEsRUFDcEI7QUFBQSxFQUNBLE1BQU0sS0FBSyxtQkFBbUIsVUFBVSxHQUFHLEdBQUcsTUFBTTtBQUFBLEVBQ3BELEdBQUcsS0FBSyxTQUFTLEtBQUssS0FBSztBQUFBLEVBQzNCLEtBQUssUUFBUSxJQUFJO0FBQUEsRUFDakIsS0FBSyxTQUFTO0FBQUEsRUFDZCxLQUFLLFlBQVksUUFBUSxDQUFDLFFBQVE7QUFBQSxJQUNoQyxPQUFPLGtCQUFrQixRQUFRLE1BQU0sUUFBUSxNQUFNO0FBQUE7QUFBQSxFQUV2RCxPQUFPO0FBQUEsR0FDTixxQkFBcUI7QUFDeEIsSUFBSSw2QkFBNkIsT0FBTyxPQUFPLFFBQVEsU0FBUztBQUFBLEVBQzlELFFBQVEsVUFBVSxTQUFTLE1BQU0sWUFBWSxRQUFRLE1BQU0sbUJBQW1CLElBQUksR0FBRyxJQUFJO0FBQUEsRUFDekYsTUFBTSxJQUFJLEtBQUssUUFBUSxLQUFLO0FBQUEsRUFDNUIsTUFBTSxJQUFJLEtBQUssU0FBUyxLQUFLO0FBQUEsRUFDN0IsTUFBTSxTQUFTO0FBQUEsSUFDYixFQUFFLEdBQUcsS0FBSyxJQUFJLEdBQUcsR0FBRyxFQUFFO0FBQUEsSUFDdEIsRUFBRSxHQUFHLElBQUksSUFBSSxHQUFHLEdBQUcsRUFBRTtBQUFBLElBQ3JCLEVBQUUsR0FBRyxJQUFJLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFO0FBQUEsSUFDMUIsRUFBRSxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtBQUFBLEVBQ3BCO0FBQUEsRUFDQSxNQUFNLEtBQUssbUJBQW1CLFVBQVUsR0FBRyxHQUFHLE1BQU07QUFBQSxFQUNwRCxHQUFHLEtBQUssU0FBUyxLQUFLLEtBQUs7QUFBQSxFQUMzQixpQkFBaUIsTUFBTSxFQUFFO0FBQUEsRUFDekIsS0FBSyxZQUFZLFFBQVEsQ0FBQyxRQUFRO0FBQUEsSUFDaEMsT0FBTyxrQkFBa0IsUUFBUSxNQUFNLFFBQVEsTUFBTTtBQUFBO0FBQUEsRUFFdkQsT0FBTztBQUFBLEdBQ04sWUFBWTtBQUNmLElBQUksNEJBQTRCLE9BQU8sT0FBTyxRQUFRLFNBQVM7QUFBQSxFQUM3RCxRQUFRLFVBQVUsU0FBUyxNQUFNLFlBQy9CLFFBQ0EsTUFDQSxtQkFBbUIsTUFBVyxTQUFDLEdBQy9CLElBQ0Y7QUFBQSxFQUNBLE1BQU0sSUFBSSxLQUFLLFFBQVEsS0FBSztBQUFBLEVBQzVCLE1BQU0sSUFBSSxLQUFLLFNBQVMsS0FBSztBQUFBLEVBQzdCLE1BQU0sU0FBUztBQUFBLElBQ2IsRUFBRSxHQUFHLElBQUksSUFBSSxHQUFHLEdBQUcsRUFBRTtBQUFBLElBQ3JCLEVBQUUsR0FBRyxJQUFJLElBQUksR0FBRyxHQUFHLEVBQUU7QUFBQSxJQUNyQixFQUFFLEdBQUcsSUFBSSxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtBQUFBLElBQzFCLEVBQUUsR0FBRyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtBQUFBLEVBQ3JCO0FBQUEsRUFDQSxNQUFNLEtBQUssbUJBQW1CLFVBQVUsR0FBRyxHQUFHLE1BQU07QUFBQSxFQUNwRCxHQUFHLEtBQUssU0FBUyxLQUFLLEtBQUs7QUFBQSxFQUMzQixpQkFBaUIsTUFBTSxFQUFFO0FBQUEsRUFDekIsS0FBSyxZQUFZLFFBQVEsQ0FBQyxRQUFRO0FBQUEsSUFDaEMsT0FBTyxrQkFBa0IsUUFBUSxNQUFNLFFBQVEsTUFBTTtBQUFBO0FBQUEsRUFFdkQsT0FBTztBQUFBLEdBQ04sV0FBVztBQUNkLElBQUksNEJBQTRCLE9BQU8sT0FBTyxRQUFRLFNBQVM7QUFBQSxFQUM3RCxRQUFRLFVBQVUsU0FBUyxNQUFNLFlBQy9CLFFBQ0EsTUFDQSxtQkFBbUIsTUFBVyxTQUFDLEdBQy9CLElBQ0Y7QUFBQSxFQUNBLE1BQU0sSUFBSSxLQUFLLFFBQVEsS0FBSztBQUFBLEVBQzVCLE1BQU0sSUFBSSxLQUFLLFNBQVMsS0FBSztBQUFBLEVBQzdCLE1BQU0sU0FBUztBQUFBLElBQ2IsRUFBRSxHQUFHLEtBQUssSUFBSSxHQUFHLEdBQUcsRUFBRTtBQUFBLElBQ3RCLEVBQUUsR0FBRyxJQUFJLElBQUksSUFBSSxHQUFHLEdBQUcsRUFBRTtBQUFBLElBQ3pCLEVBQUUsR0FBRyxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtBQUFBLElBQ3RCLEVBQUUsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7QUFBQSxFQUNwQjtBQUFBLEVBQ0EsTUFBTSxLQUFLLG1CQUFtQixVQUFVLEdBQUcsR0FBRyxNQUFNO0FBQUEsRUFDcEQsR0FBRyxLQUFLLFNBQVMsS0FBSyxLQUFLO0FBQUEsRUFDM0IsaUJBQWlCLE1BQU0sRUFBRTtBQUFBLEVBQ3pCLEtBQUssWUFBWSxRQUFRLENBQUMsUUFBUTtBQUFBLElBQ2hDLE9BQU8sa0JBQWtCLFFBQVEsTUFBTSxRQUFRLE1BQU07QUFBQTtBQUFBLEVBRXZELE9BQU87QUFBQSxHQUNOLFdBQVc7QUFDZCxJQUFJLGdDQUFnQyxPQUFPLE9BQU8sUUFBUSxTQUFTO0FBQUEsRUFDakUsUUFBUSxVQUFVLFNBQVMsTUFBTSxZQUMvQixRQUNBLE1BQ0EsbUJBQW1CLE1BQVcsU0FBQyxHQUMvQixJQUNGO0FBQUEsRUFDQSxNQUFNLElBQUksS0FBSyxRQUFRLEtBQUs7QUFBQSxFQUM1QixNQUFNLElBQUksS0FBSyxTQUFTLEtBQUs7QUFBQSxFQUM3QixNQUFNLFNBQVM7QUFBQSxJQUNiLEVBQUUsR0FBRyxJQUFJLEdBQUcsR0FBRyxFQUFFO0FBQUEsSUFDakIsRUFBRSxHQUFHLElBQUksSUFBSSxHQUFHLEdBQUcsRUFBRTtBQUFBLElBQ3JCLEVBQUUsR0FBRyxJQUFJLElBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFO0FBQUEsSUFDMUIsRUFBRSxHQUFHLEtBQUssSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFO0FBQUEsRUFDekI7QUFBQSxFQUNBLE1BQU0sS0FBSyxtQkFBbUIsVUFBVSxHQUFHLEdBQUcsTUFBTTtBQUFBLEVBQ3BELEdBQUcsS0FBSyxTQUFTLEtBQUssS0FBSztBQUFBLEVBQzNCLGlCQUFpQixNQUFNLEVBQUU7QUFBQSxFQUN6QixLQUFLLFlBQVksUUFBUSxDQUFDLFFBQVE7QUFBQSxJQUNoQyxPQUFPLGtCQUFrQixRQUFRLE1BQU0sUUFBUSxNQUFNO0FBQUE7QUFBQSxFQUV2RCxPQUFPO0FBQUEsR0FDTixlQUFlO0FBQ2xCLElBQUksdUNBQXVDLE9BQU8sT0FBTyxRQUFRLFNBQVM7QUFBQSxFQUN4RSxRQUFRLFVBQVUsU0FBUyxNQUFNLFlBQy9CLFFBQ0EsTUFDQSxtQkFBbUIsTUFBVyxTQUFDLEdBQy9CLElBQ0Y7QUFBQSxFQUNBLE1BQU0sSUFBSSxLQUFLLFFBQVEsS0FBSztBQUFBLEVBQzVCLE1BQU0sSUFBSSxLQUFLLFNBQVMsS0FBSztBQUFBLEVBQzdCLE1BQU0sU0FBUztBQUFBLElBQ2IsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFO0FBQUEsSUFDYixFQUFFLEdBQUcsSUFBSSxJQUFJLEdBQUcsR0FBRyxFQUFFO0FBQUEsSUFDckIsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksRUFBRTtBQUFBLElBQ2xCLEVBQUUsR0FBRyxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtBQUFBLElBQ3RCLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxFQUFFO0FBQUEsRUFDaEI7QUFBQSxFQUNBLE1BQU0sS0FBSyxtQkFBbUIsVUFBVSxHQUFHLEdBQUcsTUFBTTtBQUFBLEVBQ3BELEdBQUcsS0FBSyxTQUFTLEtBQUssS0FBSztBQUFBLEVBQzNCLGlCQUFpQixNQUFNLEVBQUU7QUFBQSxFQUN6QixLQUFLLFlBQVksUUFBUSxDQUFDLFFBQVE7QUFBQSxJQUNoQyxPQUFPLGtCQUFrQixRQUFRLE1BQU0sUUFBUSxNQUFNO0FBQUE7QUFBQSxFQUV2RCxPQUFPO0FBQUEsR0FDTixzQkFBc0I7QUFDekIsSUFBSSwyQkFBMkIsT0FBTyxPQUFPLFFBQVEsU0FBUztBQUFBLEVBQzVELFFBQVEsVUFBVSxTQUFTLE1BQU0sWUFDL0IsUUFDQSxNQUNBLG1CQUFtQixNQUFXLFNBQUMsR0FDL0IsSUFDRjtBQUFBLEVBQ0EsTUFBTSxJQUFJLEtBQUssUUFBUSxLQUFLO0FBQUEsRUFDNUIsTUFBTSxLQUFLLElBQUk7QUFBQSxFQUNmLE1BQU0sS0FBSyxNQUFNLE1BQU0sSUFBSTtBQUFBLEVBQzNCLE1BQU0sSUFBSSxLQUFLLFNBQVMsS0FBSyxLQUFLO0FBQUEsRUFDbEMsTUFBTSxRQUFRLFNBQVMsS0FBSyxRQUFRLEtBQUssTUFBTSxLQUFLLFlBQVksSUFBSSxVQUFVLEtBQUssTUFBTSxLQUFLLFlBQVksQ0FBQyxJQUFJLFlBQVksSUFBSSxRQUFRLEtBQUssTUFBTSxLQUFLLFlBQVksSUFBSSxZQUFZLENBQUM7QUFBQSxFQUNwTCxNQUFNLEtBQUssU0FBUyxLQUFLLGtCQUFrQixFQUFFLEVBQUUsT0FBTyxRQUFRLGNBQWMsRUFBRSxLQUFLLFNBQVMsS0FBSyxLQUFLLEVBQUUsS0FBSyxLQUFLLEtBQUssRUFBRSxLQUFLLGFBQWEsZUFBZSxDQUFDLElBQUksSUFBSSxNQUFNLEVBQUUsSUFBSSxJQUFJLE1BQU0sR0FBRztBQUFBLEVBQzVMLGlCQUFpQixNQUFNLEVBQUU7QUFBQSxFQUN6QixLQUFLLFlBQVksUUFBUSxDQUFDLFFBQVE7QUFBQSxJQUNoQyxNQUFNLE1BQU0sa0JBQWtCLEtBQUssTUFBTSxNQUFNO0FBQUEsSUFDL0MsTUFBTSxJQUFJLElBQUksSUFBSSxLQUFLO0FBQUEsSUFDdkIsSUFBSSxNQUFNLE1BQU0sS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsS0FBSyxLQUFLLElBQUksQ0FBQyxLQUFLLEtBQUssUUFBUSxLQUFLLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksS0FBSztBQUFBLE1BQ2pJLElBQUksSUFBSSxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssS0FBSztBQUFBLE1BQ3JDLElBQUksS0FBSyxHQUFHO0FBQUEsUUFDVixJQUFJLEtBQUssS0FBSyxDQUFDO0FBQUEsTUFDakI7QUFBQSxNQUNBLElBQUksS0FBSztBQUFBLE1BQ1QsSUFBSSxPQUFPLElBQUksS0FBSyxJQUFJLEdBQUc7QUFBQSxRQUN6QixJQUFJLENBQUM7QUFBQSxNQUNQO0FBQUEsTUFDQSxJQUFJLEtBQUs7QUFBQSxJQUNYO0FBQUEsSUFDQSxPQUFPO0FBQUE7QUFBQSxFQUVULE9BQU87QUFBQSxHQUNOLFVBQVU7QUFDYixJQUFJLHVCQUF1QixPQUFPLE9BQU8sUUFBUSxTQUFTO0FBQUEsRUFDeEQsUUFBUSxVQUFVLE1BQU0sZ0JBQWdCLE1BQU0sWUFDNUMsUUFDQSxNQUNBLFVBQVUsS0FBSyxVQUFVLE1BQU0sS0FBSyxPQUNwQyxJQUNGO0FBQUEsRUFDQSxNQUFNLFFBQVEsU0FBUyxPQUFPLFFBQVEsY0FBYztBQUFBLEVBQ3BELE1BQU0sYUFBYSxLQUFLLGFBQWEsS0FBSyxRQUFRLEtBQUssUUFBUSxLQUFLO0FBQUEsRUFDcEUsTUFBTSxjQUFjLEtBQUssYUFBYSxLQUFLLFNBQVMsS0FBSyxTQUFTLEtBQUs7QUFBQSxFQUN2RSxNQUFNLElBQUksS0FBSyxhQUFhLENBQUMsYUFBYSxJQUFJLENBQUMsS0FBSyxRQUFRLElBQUk7QUFBQSxFQUNoRSxNQUFNLElBQUksS0FBSyxhQUFhLENBQUMsY0FBYyxJQUFJLENBQUMsS0FBSyxTQUFTLElBQUk7QUFBQSxFQUNsRSxNQUFNLEtBQUssU0FBUyx1QkFBdUIsRUFBRSxLQUFLLFNBQVMsS0FBSyxLQUFLLEVBQUUsS0FBSyxNQUFNLEtBQUssRUFBRSxFQUFFLEtBQUssTUFBTSxLQUFLLEVBQUUsRUFBRSxLQUFLLEtBQUssQ0FBQyxFQUFFLEtBQUssS0FBSyxDQUFDLEVBQUUsS0FBSyxTQUFTLFVBQVUsRUFBRSxLQUFLLFVBQVUsV0FBVztBQUFBLEVBQzdMLElBQUksS0FBSyxPQUFPO0FBQUEsSUFDZCxNQUFNLFdBQVcsSUFBSSxJQUFJLE9BQU8sS0FBSyxLQUFLLEtBQUssQ0FBQztBQUFBLElBQ2hELElBQUksS0FBSyxNQUFNLFNBQVM7QUFBQSxNQUN0Qix5QkFBeUIsT0FBTyxLQUFLLE1BQU0sU0FBUyxZQUFZLFdBQVc7QUFBQSxNQUMzRSxTQUFTLE9BQU8sU0FBUztBQUFBLElBQzNCO0FBQUEsSUFDQSxTQUFTLFFBQVEsQ0FBQyxZQUFZO0FBQUEsTUFDNUIsSUFBSSxLQUFLLHlCQUF5QixTQUFTO0FBQUEsS0FDNUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxpQkFBaUIsTUFBTSxLQUFLO0FBQUEsRUFDNUIsS0FBSyxZQUFZLFFBQVEsQ0FBQyxRQUFRO0FBQUEsSUFDaEMsT0FBTyxrQkFBa0IsS0FBSyxNQUFNLE1BQU07QUFBQTtBQUFBLEVBRTVDLE9BQU87QUFBQSxHQUNOLE1BQU07QUFDVCxJQUFJLDRCQUE0QixPQUFPLE9BQU8sUUFBUSxTQUFTO0FBQUEsRUFDN0QsUUFBUSxVQUFVLE1BQU0sZ0JBQWdCLE1BQU0sWUFDNUMsUUFDQSxNQUNBLFVBQVUsS0FBSyxTQUNmLElBQ0Y7QUFBQSxFQUNBLE1BQU0sUUFBUSxTQUFTLE9BQU8sUUFBUSxjQUFjO0FBQUEsRUFDcEQsTUFBTSxhQUFhLEtBQUssYUFBYSxLQUFLLFFBQVEsS0FBSyxRQUFRLEtBQUs7QUFBQSxFQUNwRSxNQUFNLGNBQWMsS0FBSyxhQUFhLEtBQUssU0FBUyxLQUFLLFNBQVMsS0FBSztBQUFBLEVBQ3ZFLE1BQU0sSUFBSSxLQUFLLGFBQWEsQ0FBQyxhQUFhLElBQUksQ0FBQyxLQUFLLFFBQVEsSUFBSTtBQUFBLEVBQ2hFLE1BQU0sSUFBSSxLQUFLLGFBQWEsQ0FBQyxjQUFjLElBQUksQ0FBQyxLQUFLLFNBQVMsSUFBSTtBQUFBLEVBQ2xFLE1BQU0sS0FBSyxTQUFTLHlDQUF5QyxFQUFFLEtBQUssU0FBUyxLQUFLLEtBQUssRUFBRSxLQUFLLE1BQU0sS0FBSyxFQUFFLEVBQUUsS0FBSyxNQUFNLEtBQUssRUFBRSxFQUFFLEtBQUssS0FBSyxDQUFDLEVBQUUsS0FBSyxLQUFLLENBQUMsRUFBRSxLQUFLLFNBQVMsVUFBVSxFQUFFLEtBQUssVUFBVSxXQUFXO0FBQUEsRUFDL00sSUFBSSxLQUFLLE9BQU87QUFBQSxJQUNkLE1BQU0sV0FBVyxJQUFJLElBQUksT0FBTyxLQUFLLEtBQUssS0FBSyxDQUFDO0FBQUEsSUFDaEQsSUFBSSxLQUFLLE1BQU0sU0FBUztBQUFBLE1BQ3RCLHlCQUF5QixPQUFPLEtBQUssTUFBTSxTQUFTLFlBQVksV0FBVztBQUFBLE1BQzNFLFNBQVMsT0FBTyxTQUFTO0FBQUEsSUFDM0I7QUFBQSxJQUNBLFNBQVMsUUFBUSxDQUFDLFlBQVk7QUFBQSxNQUM1QixJQUFJLEtBQUsseUJBQXlCLFNBQVM7QUFBQSxLQUM1QztBQUFBLEVBQ0g7QUFBQSxFQUNBLGlCQUFpQixNQUFNLEtBQUs7QUFBQSxFQUM1QixLQUFLLFlBQVksUUFBUSxDQUFDLFFBQVE7QUFBQSxJQUNoQyxPQUFPLGtCQUFrQixLQUFLLE1BQU0sTUFBTTtBQUFBO0FBQUEsRUFFNUMsT0FBTztBQUFBLEdBQ04sV0FBVztBQUNkLElBQUksNEJBQTRCLE9BQU8sT0FBTyxRQUFRLFNBQVM7QUFBQSxFQUM3RCxRQUFRLGFBQWEsTUFBTSxZQUFZLFFBQVEsTUFBTSxTQUFTLElBQUk7QUFBQSxFQUNsRSxJQUFJLE1BQU0sY0FBYyxLQUFLLEtBQUs7QUFBQSxFQUNsQyxNQUFNLFFBQVEsU0FBUyxPQUFPLFFBQVEsY0FBYztBQUFBLEVBQ3BELE1BQU0sYUFBYTtBQUFBLEVBQ25CLE1BQU0sY0FBYztBQUFBLEVBQ3BCLE1BQU0sS0FBSyxTQUFTLFVBQVUsRUFBRSxLQUFLLFVBQVUsV0FBVztBQUFBLEVBQzFELFNBQVMsS0FBSyxTQUFTLGlCQUFpQjtBQUFBLEVBQ3hDLElBQUksS0FBSyxPQUFPO0FBQUEsSUFDZCxNQUFNLFdBQVcsSUFBSSxJQUFJLE9BQU8sS0FBSyxLQUFLLEtBQUssQ0FBQztBQUFBLElBQ2hELElBQUksS0FBSyxNQUFNLFNBQVM7QUFBQSxNQUN0Qix5QkFBeUIsT0FBTyxLQUFLLE1BQU0sU0FBUyxZQUFZLFdBQVc7QUFBQSxNQUMzRSxTQUFTLE9BQU8sU0FBUztBQUFBLElBQzNCO0FBQUEsSUFDQSxTQUFTLFFBQVEsQ0FBQyxZQUFZO0FBQUEsTUFDNUIsSUFBSSxLQUFLLHlCQUF5QixTQUFTO0FBQUEsS0FDNUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxpQkFBaUIsTUFBTSxLQUFLO0FBQUEsRUFDNUIsS0FBSyxZQUFZLFFBQVEsQ0FBQyxRQUFRO0FBQUEsSUFDaEMsT0FBTyxrQkFBa0IsS0FBSyxNQUFNLE1BQU07QUFBQTtBQUFBLEVBRTVDLE9BQU87QUFBQSxHQUNOLFdBQVc7QUFDZCxTQUFTLHdCQUF3QixDQUFDLE9BQU8sU0FBUyxZQUFZLGFBQWE7QUFBQSxFQUN6RSxNQUFNLGtCQUFrQixDQUFDO0FBQUEsRUFDekIsTUFBTSw0QkFBNEIsT0FBTyxDQUFDLFdBQVc7QUFBQSxJQUNuRCxnQkFBZ0IsS0FBSyxRQUFRLENBQUM7QUFBQSxLQUM3QixXQUFXO0FBQUEsRUFDZCxNQUFNLDZCQUE2QixPQUFPLENBQUMsV0FBVztBQUFBLElBQ3BELGdCQUFnQixLQUFLLEdBQUcsTUFBTTtBQUFBLEtBQzdCLFlBQVk7QUFBQSxFQUNmLElBQUksUUFBUSxTQUFTLEdBQUcsR0FBRztBQUFBLElBQ3pCLElBQUksTUFBTSxnQkFBZ0I7QUFBQSxJQUMxQixVQUFVLFVBQVU7QUFBQSxFQUN0QixFQUFPO0FBQUEsSUFDTCxXQUFXLFVBQVU7QUFBQTtBQUFBLEVBRXZCLElBQUksUUFBUSxTQUFTLEdBQUcsR0FBRztBQUFBLElBQ3pCLElBQUksTUFBTSxrQkFBa0I7QUFBQSxJQUM1QixVQUFVLFdBQVc7QUFBQSxFQUN2QixFQUFPO0FBQUEsSUFDTCxXQUFXLFdBQVc7QUFBQTtBQUFBLEVBRXhCLElBQUksUUFBUSxTQUFTLEdBQUcsR0FBRztBQUFBLElBQ3pCLElBQUksTUFBTSxtQkFBbUI7QUFBQSxJQUM3QixVQUFVLFVBQVU7QUFBQSxFQUN0QixFQUFPO0FBQUEsSUFDTCxXQUFXLFVBQVU7QUFBQTtBQUFBLEVBRXZCLElBQUksUUFBUSxTQUFTLEdBQUcsR0FBRztBQUFBLElBQ3pCLElBQUksTUFBTSxpQkFBaUI7QUFBQSxJQUMzQixVQUFVLFdBQVc7QUFBQSxFQUN2QixFQUFPO0FBQUEsSUFDTCxXQUFXLFdBQVc7QUFBQTtBQUFBLEVBRXhCLE1BQU0sS0FBSyxvQkFBb0IsZ0JBQWdCLEtBQUssR0FBRyxDQUFDO0FBQUE7QUFFMUQsT0FBTywwQkFBMEIsMEJBQTBCO0FBQzNELElBQUksZ0NBQWdDLE9BQU8sT0FBTyxRQUFRLFNBQVM7QUFBQSxFQUNqRSxJQUFJO0FBQUEsRUFDSixJQUFJLENBQUMsS0FBSyxTQUFTO0FBQUEsSUFDakIsV0FBVztBQUFBLEVBQ2IsRUFBTztBQUFBLElBQ0wsV0FBVyxVQUFVLEtBQUs7QUFBQTtBQUFBLEVBRTVCLE1BQU0sV0FBVyxPQUFPLE9BQU8sR0FBRyxFQUFFLEtBQUssU0FBUyxRQUFRLEVBQUUsS0FBSyxNQUFNLEtBQUssU0FBUyxLQUFLLEVBQUU7QUFBQSxFQUM1RixNQUFNLFFBQVEsU0FBUyxPQUFPLFFBQVEsY0FBYztBQUFBLEVBQ3BELE1BQU0sWUFBWSxTQUFTLE9BQU8sTUFBTTtBQUFBLEVBQ3hDLE1BQU0sUUFBUSxTQUFTLE9BQU8sR0FBRyxFQUFFLEtBQUssU0FBUyxPQUFPO0FBQUEsRUFDeEQsTUFBTSxRQUFRLEtBQUssVUFBVSxPQUFPLEtBQUssVUFBVSxLQUFLLElBQUksS0FBSztBQUFBLEVBQ2pFLElBQUksUUFBUTtBQUFBLEVBQ1osSUFBSSxPQUFPLFVBQVUsVUFBVTtBQUFBLElBQzdCLFFBQVEsTUFBTTtBQUFBLEVBQ2hCLEVBQU87QUFBQSxJQUNMLFFBQVE7QUFBQTtBQUFBLEVBRVYsSUFBSSxLQUFLLG9CQUFvQixPQUFPLE9BQU8sT0FBTyxVQUFVLFFBQVE7QUFBQSxFQUNwRSxNQUFNLE9BQU8sTUFBTSxvQkFBb0IsT0FBTyxPQUFPLEtBQUssWUFBWSxNQUFNLElBQUk7QUFBQSxFQUNoRixJQUFJLE9BQU8sRUFBRSxPQUFPLEdBQUcsUUFBUSxFQUFFO0FBQUEsRUFDakMsSUFBSSx1QkFBdUIsV0FBVyxDQUFDLEdBQUc7QUFBQSxJQUN4QyxNQUFNLE1BQU0sS0FBSyxTQUFTO0FBQUEsSUFDMUIsTUFBTSxLQUFLLGVBQVEsSUFBSTtBQUFBLElBQ3ZCLE9BQU8sSUFBSSxzQkFBc0I7QUFBQSxJQUNqQyxHQUFHLEtBQUssU0FBUyxLQUFLLEtBQUs7QUFBQSxJQUMzQixHQUFHLEtBQUssVUFBVSxLQUFLLE1BQU07QUFBQSxFQUMvQjtBQUFBLEVBQ0EsSUFBSSxLQUFLLFVBQVUsS0FBSztBQUFBLEVBQ3hCLE1BQU0sV0FBVyxNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU07QUFBQSxFQUM1QyxJQUFJLFdBQVcsS0FBSyxRQUFRO0FBQUEsRUFDNUIsTUFBTSxRQUFRLE1BQU0sb0JBQ2xCLE9BQ0EsU0FBUyxPQUFPLFNBQVMsS0FBSyxPQUFPLElBQUksVUFDekMsS0FBSyxZQUNMLE1BQ0EsSUFDRjtBQUFBLEVBQ0EsSUFBSSx1QkFBdUIsV0FBVyxDQUFDLEdBQUc7QUFBQSxJQUN4QyxNQUFNLE1BQU0sTUFBTSxTQUFTO0FBQUEsSUFDM0IsTUFBTSxLQUFLLGVBQVEsS0FBSztBQUFBLElBQ3hCLE9BQU8sSUFBSSxzQkFBc0I7QUFBQSxJQUNqQyxHQUFHLEtBQUssU0FBUyxLQUFLLEtBQUs7QUFBQSxJQUMzQixHQUFHLEtBQUssVUFBVSxLQUFLLE1BQU07QUFBQSxFQUMvQjtBQUFBLEVBQ0EsTUFBTSxjQUFjLEtBQUssVUFBVTtBQUFBLEVBQ25DLGVBQVEsS0FBSyxFQUFFLEtBQ2IsYUFDQSxpQkFDQyxLQUFLLFFBQVEsU0FBUyxRQUFRLEtBQUssU0FBUyxRQUFRLEtBQUssU0FBUyxLQUFLLFFBQVEsU0FBUyxTQUFTLGNBQWMsS0FBSyxHQUN2SDtBQUFBLEVBQ0EsZUFBUSxJQUFJLEVBQUUsS0FDWixhQUNBLGlCQUNDLEtBQUssUUFBUSxTQUFTLFFBQVEsSUFBSSxFQUFFLFNBQVMsUUFBUSxLQUFLLFNBQVMsS0FBSyxNQUMzRTtBQUFBLEVBQ0EsT0FBTyxNQUFNLEtBQUssRUFBRSxRQUFRO0FBQUEsRUFDNUIsTUFBTSxLQUNKLGFBQ0EsZUFBZSxDQUFDLEtBQUssUUFBUSxJQUFJLFFBQVEsQ0FBQyxLQUFLLFNBQVMsSUFBSSxjQUFjLEtBQUssR0FDakY7QUFBQSxFQUNBLE1BQU0sS0FBSyxTQUFTLG1CQUFtQixFQUFFLEtBQUssS0FBSyxDQUFDLEtBQUssUUFBUSxJQUFJLFdBQVcsRUFBRSxLQUFLLEtBQUssQ0FBQyxLQUFLLFNBQVMsSUFBSSxXQUFXLEVBQUUsS0FBSyxTQUFTLEtBQUssUUFBUSxLQUFLLE9BQU8sRUFBRSxLQUFLLFVBQVUsS0FBSyxTQUFTLEtBQUssT0FBTztBQUFBLEVBQzlNLFVBQVUsS0FBSyxTQUFTLFNBQVMsRUFBRSxLQUFLLE1BQU0sQ0FBQyxLQUFLLFFBQVEsSUFBSSxXQUFXLEVBQUUsS0FBSyxNQUFNLEtBQUssUUFBUSxJQUFJLFdBQVcsRUFBRSxLQUFLLE1BQU0sQ0FBQyxLQUFLLFNBQVMsSUFBSSxjQUFjLFNBQVMsU0FBUyxXQUFXLEVBQUUsS0FBSyxNQUFNLENBQUMsS0FBSyxTQUFTLElBQUksY0FBYyxTQUFTLFNBQVMsV0FBVztBQUFBLEVBQzFRLGlCQUFpQixNQUFNLEtBQUs7QUFBQSxFQUM1QixLQUFLLFlBQVksUUFBUSxDQUFDLFFBQVE7QUFBQSxJQUNoQyxPQUFPLGtCQUFrQixLQUFLLE1BQU0sTUFBTTtBQUFBO0FBQUEsRUFFNUMsT0FBTztBQUFBLEdBQ04sZUFBZTtBQUNsQixJQUFJLDBCQUEwQixPQUFPLE9BQU8sUUFBUSxTQUFTO0FBQUEsRUFDM0QsUUFBUSxVQUFVLFNBQVMsTUFBTSxZQUMvQixRQUNBLE1BQ0EsbUJBQW1CLE1BQVcsU0FBQyxHQUMvQixJQUNGO0FBQUEsRUFDQSxNQUFNLElBQUksS0FBSyxTQUFTLEtBQUs7QUFBQSxFQUM3QixNQUFNLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxLQUFLO0FBQUEsRUFDcEMsTUFBTSxRQUFRLFNBQVMsT0FBTyxRQUFRLGNBQWMsRUFBRSxLQUFLLFNBQVMsS0FBSyxLQUFLLEVBQUUsS0FBSyxNQUFNLElBQUksQ0FBQyxFQUFFLEtBQUssTUFBTSxJQUFJLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLFNBQVMsQ0FBQyxFQUFFLEtBQUssVUFBVSxDQUFDO0FBQUEsRUFDekwsaUJBQWlCLE1BQU0sS0FBSztBQUFBLEVBQzVCLEtBQUssWUFBWSxRQUFRLENBQUMsUUFBUTtBQUFBLElBQ2hDLE9BQU8sa0JBQWtCLEtBQUssTUFBTSxNQUFNO0FBQUE7QUFBQSxFQUU1QyxPQUFPO0FBQUEsR0FDTixTQUFTO0FBQ1osSUFBSSwwQkFBMEIsT0FBTyxPQUFPLFFBQVEsU0FBUztBQUFBLEVBQzNELFFBQVEsVUFBVSxNQUFNLGdCQUFnQixNQUFNLFlBQzVDLFFBQ0EsTUFDQSxtQkFBbUIsTUFBVyxTQUFDLEdBQy9CLElBQ0Y7QUFBQSxFQUNBLE1BQU0sVUFBVSxTQUFTLE9BQU8sVUFBVSxjQUFjO0FBQUEsRUFDeEQsUUFBUSxLQUFLLFNBQVMsS0FBSyxLQUFLLEVBQUUsS0FBSyxNQUFNLEtBQUssRUFBRSxFQUFFLEtBQUssTUFBTSxLQUFLLEVBQUUsRUFBRSxLQUFLLEtBQUssS0FBSyxRQUFRLElBQUksV0FBVyxFQUFFLEtBQUssU0FBUyxLQUFLLFFBQVEsS0FBSyxPQUFPLEVBQUUsS0FBSyxVQUFVLEtBQUssU0FBUyxLQUFLLE9BQU87QUFBQSxFQUNwTSxJQUFJLEtBQUssYUFBYTtBQUFBLEVBQ3RCLGlCQUFpQixNQUFNLE9BQU87QUFBQSxFQUM5QixLQUFLLFlBQVksUUFBUSxDQUFDLFFBQVE7QUFBQSxJQUNoQyxJQUFJLEtBQUssb0JBQW9CLE1BQU0sS0FBSyxRQUFRLElBQUksYUFBYSxNQUFNO0FBQUEsSUFDdkUsT0FBTyxrQkFBa0IsT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLGFBQWEsTUFBTTtBQUFBO0FBQUEsRUFFNUUsT0FBTztBQUFBLEdBQ04sUUFBUTtBQUNYLElBQUksK0JBQStCLE9BQU8sT0FBTyxRQUFRLFNBQVM7QUFBQSxFQUNoRSxRQUFRLFVBQVUsTUFBTSxnQkFBZ0IsTUFBTSxZQUM1QyxRQUNBLE1BQ0EsbUJBQW1CLE1BQVcsU0FBQyxHQUMvQixJQUNGO0FBQUEsRUFDQSxNQUFNLE1BQU07QUFBQSxFQUNaLE1BQU0sY0FBYyxTQUFTLE9BQU8sS0FBSyxjQUFjO0FBQUEsRUFDdkQsTUFBTSxjQUFjLFlBQVksT0FBTyxRQUFRO0FBQUEsRUFDL0MsTUFBTSxjQUFjLFlBQVksT0FBTyxRQUFRO0FBQUEsRUFDL0MsWUFBWSxLQUFLLFNBQVMsS0FBSyxLQUFLO0FBQUEsRUFDcEMsWUFBWSxLQUFLLFNBQVMsS0FBSyxLQUFLLEVBQUUsS0FBSyxNQUFNLEtBQUssRUFBRSxFQUFFLEtBQUssTUFBTSxLQUFLLEVBQUUsRUFBRSxLQUFLLEtBQUssS0FBSyxRQUFRLElBQUksY0FBYyxHQUFHLEVBQUUsS0FBSyxTQUFTLEtBQUssUUFBUSxLQUFLLFVBQVUsTUFBTSxDQUFDLEVBQUUsS0FBSyxVQUFVLEtBQUssU0FBUyxLQUFLLFVBQVUsTUFBTSxDQUFDO0FBQUEsRUFDbE8sWUFBWSxLQUFLLFNBQVMsS0FBSyxLQUFLLEVBQUUsS0FBSyxNQUFNLEtBQUssRUFBRSxFQUFFLEtBQUssTUFBTSxLQUFLLEVBQUUsRUFBRSxLQUFLLEtBQUssS0FBSyxRQUFRLElBQUksV0FBVyxFQUFFLEtBQUssU0FBUyxLQUFLLFFBQVEsS0FBSyxPQUFPLEVBQUUsS0FBSyxVQUFVLEtBQUssU0FBUyxLQUFLLE9BQU87QUFBQSxFQUN4TSxJQUFJLEtBQUssbUJBQW1CO0FBQUEsRUFDNUIsaUJBQWlCLE1BQU0sV0FBVztBQUFBLEVBQ2xDLEtBQUssWUFBWSxRQUFRLENBQUMsUUFBUTtBQUFBLElBQ2hDLElBQUksS0FBSywwQkFBMEIsTUFBTSxLQUFLLFFBQVEsSUFBSSxjQUFjLEtBQUssTUFBTTtBQUFBLElBQ25GLE9BQU8sa0JBQWtCLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxjQUFjLEtBQUssTUFBTTtBQUFBO0FBQUEsRUFFbEYsT0FBTztBQUFBLEdBQ04sY0FBYztBQUNqQixJQUFJLDZCQUE2QixPQUFPLE9BQU8sUUFBUSxTQUFTO0FBQUEsRUFDOUQsUUFBUSxVQUFVLFNBQVMsTUFBTSxZQUMvQixRQUNBLE1BQ0EsbUJBQW1CLE1BQVcsU0FBQyxHQUMvQixJQUNGO0FBQUEsRUFDQSxNQUFNLElBQUksS0FBSyxRQUFRLEtBQUs7QUFBQSxFQUM1QixNQUFNLElBQUksS0FBSyxTQUFTLEtBQUs7QUFBQSxFQUM3QixNQUFNLFNBQVM7QUFBQSxJQUNiLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRTtBQUFBLElBQ2IsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFO0FBQUEsSUFDYixFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsRUFBRTtBQUFBLElBQ2QsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLEVBQUU7QUFBQSxJQUNkLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRTtBQUFBLElBQ2IsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFO0FBQUEsSUFDZCxFQUFFLEdBQUcsSUFBSSxHQUFHLEdBQUcsRUFBRTtBQUFBLElBQ2pCLEVBQUUsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7QUFBQSxJQUNsQixFQUFFLEdBQUcsSUFBSSxHQUFHLENBQUMsRUFBRTtBQUFBLElBQ2YsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFO0FBQUEsRUFDaEI7QUFBQSxFQUNBLE1BQU0sS0FBSyxtQkFBbUIsVUFBVSxHQUFHLEdBQUcsTUFBTTtBQUFBLEVBQ3BELEdBQUcsS0FBSyxTQUFTLEtBQUssS0FBSztBQUFBLEVBQzNCLGlCQUFpQixNQUFNLEVBQUU7QUFBQSxFQUN6QixLQUFLLFlBQVksUUFBUSxDQUFDLFFBQVE7QUFBQSxJQUNoQyxPQUFPLGtCQUFrQixRQUFRLE1BQU0sUUFBUSxNQUFNO0FBQUE7QUFBQSxFQUV2RCxPQUFPO0FBQUEsR0FDTixZQUFZO0FBQ2YsSUFBSSx3QkFBd0IsT0FBTyxDQUFDLFFBQVEsU0FBUztBQUFBLEVBQ25ELE1BQU0sV0FBVyxPQUFPLE9BQU8sR0FBRyxFQUFFLEtBQUssU0FBUyxjQUFjLEVBQUUsS0FBSyxNQUFNLEtBQUssU0FBUyxLQUFLLEVBQUU7QUFBQSxFQUNsRyxNQUFNLFVBQVUsU0FBUyxPQUFPLFVBQVUsY0FBYztBQUFBLEVBQ3hELFFBQVEsS0FBSyxTQUFTLGFBQWEsRUFBRSxLQUFLLEtBQUssQ0FBQyxFQUFFLEtBQUssU0FBUyxFQUFFLEVBQUUsS0FBSyxVQUFVLEVBQUU7QUFBQSxFQUNyRixpQkFBaUIsTUFBTSxPQUFPO0FBQUEsRUFDOUIsS0FBSyxZQUFZLFFBQVEsQ0FBQyxRQUFRO0FBQUEsSUFDaEMsT0FBTyxrQkFBa0IsT0FBTyxNQUFNLEdBQUcsTUFBTTtBQUFBO0FBQUEsRUFFakQsT0FBTztBQUFBLEdBQ04sT0FBTztBQUNWLElBQUksMkJBQTJCLE9BQU8sQ0FBQyxRQUFRLE1BQU0sUUFBUTtBQUFBLEVBQzNELE1BQU0sV0FBVyxPQUFPLE9BQU8sR0FBRyxFQUFFLEtBQUssU0FBUyxjQUFjLEVBQUUsS0FBSyxNQUFNLEtBQUssU0FBUyxLQUFLLEVBQUU7QUFBQSxFQUNsRyxJQUFJLFFBQVE7QUFBQSxFQUNaLElBQUksU0FBUztBQUFBLEVBQ2IsSUFBSSxRQUFRLE1BQU07QUFBQSxJQUNoQixRQUFRO0FBQUEsSUFDUixTQUFTO0FBQUEsRUFDWDtBQUFBLEVBQ0EsTUFBTSxRQUFRLFNBQVMsT0FBTyxNQUFNLEVBQUUsS0FBSyxLQUFLLEtBQUssUUFBUSxDQUFDLEVBQUUsS0FBSyxLQUFLLEtBQUssU0FBUyxDQUFDLEVBQUUsS0FBSyxTQUFTLEtBQUssRUFBRSxLQUFLLFVBQVUsTUFBTSxFQUFFLEtBQUssU0FBUyxXQUFXO0FBQUEsRUFDaEssaUJBQWlCLE1BQU0sS0FBSztBQUFBLEVBQzVCLEtBQUssU0FBUyxLQUFLLFNBQVMsS0FBSyxVQUFVO0FBQUEsRUFDM0MsS0FBSyxRQUFRLEtBQUssUUFBUSxLQUFLLFVBQVU7QUFBQSxFQUN6QyxLQUFLLFlBQVksUUFBUSxDQUFDLFFBQVE7QUFBQSxJQUNoQyxPQUFPLGtCQUFrQixLQUFLLE1BQU0sTUFBTTtBQUFBO0FBQUEsRUFFNUMsT0FBTztBQUFBLEdBQ04sVUFBVTtBQUNiLElBQUksc0JBQXNCLE9BQU8sQ0FBQyxRQUFRLFNBQVM7QUFBQSxFQUNqRCxNQUFNLFdBQVcsT0FBTyxPQUFPLEdBQUcsRUFBRSxLQUFLLFNBQVMsY0FBYyxFQUFFLEtBQUssTUFBTSxLQUFLLFNBQVMsS0FBSyxFQUFFO0FBQUEsRUFDbEcsTUFBTSxjQUFjLFNBQVMsT0FBTyxVQUFVLGNBQWM7QUFBQSxFQUM1RCxNQUFNLFVBQVUsU0FBUyxPQUFPLFVBQVUsY0FBYztBQUFBLEVBQ3hELFFBQVEsS0FBSyxTQUFTLGFBQWEsRUFBRSxLQUFLLEtBQUssQ0FBQyxFQUFFLEtBQUssU0FBUyxFQUFFLEVBQUUsS0FBSyxVQUFVLEVBQUU7QUFBQSxFQUNyRixZQUFZLEtBQUssU0FBUyxXQUFXLEVBQUUsS0FBSyxLQUFLLENBQUMsRUFBRSxLQUFLLFNBQVMsRUFBRSxFQUFFLEtBQUssVUFBVSxFQUFFO0FBQUEsRUFDdkYsaUJBQWlCLE1BQU0sT0FBTztBQUFBLEVBQzlCLEtBQUssWUFBWSxRQUFRLENBQUMsUUFBUTtBQUFBLElBQ2hDLE9BQU8sa0JBQWtCLE9BQU8sTUFBTSxHQUFHLE1BQU07QUFBQTtBQUFBLEVBRWpELE9BQU87QUFBQSxHQUNOLEtBQUs7QUFDUixJQUFJLDRCQUE0QixPQUFPLE9BQU8sUUFBUSxTQUFTO0FBQUEsRUFDN0QsTUFBTSxjQUFjLEtBQUssVUFBVTtBQUFBLEVBQ25DLE1BQU0sYUFBYTtBQUFBLEVBQ25CLE1BQU0sYUFBYTtBQUFBLEVBQ25CLElBQUk7QUFBQSxFQUNKLElBQUksQ0FBQyxLQUFLLFNBQVM7QUFBQSxJQUNqQixXQUFXO0FBQUEsRUFDYixFQUFPO0FBQUEsSUFDTCxXQUFXLFVBQVUsS0FBSztBQUFBO0FBQUEsRUFFNUIsTUFBTSxXQUFXLE9BQU8sT0FBTyxHQUFHLEVBQUUsS0FBSyxTQUFTLFFBQVEsRUFBRSxLQUFLLE1BQU0sS0FBSyxTQUFTLEtBQUssRUFBRTtBQUFBLEVBQzVGLE1BQU0sUUFBUSxTQUFTLE9BQU8sUUFBUSxjQUFjO0FBQUEsRUFDcEQsTUFBTSxVQUFVLFNBQVMsT0FBTyxNQUFNO0FBQUEsRUFDdEMsTUFBTSxhQUFhLFNBQVMsT0FBTyxNQUFNO0FBQUEsRUFDekMsSUFBSSxXQUFXO0FBQUEsRUFDZixJQUFJLFlBQVk7QUFBQSxFQUNoQixNQUFNLGlCQUFpQixTQUFTLE9BQU8sR0FBRyxFQUFFLEtBQUssU0FBUyxPQUFPO0FBQUEsRUFDakUsSUFBSSxjQUFjO0FBQUEsRUFDbEIsTUFBTSxlQUFlLEtBQUssVUFBVSxjQUFjO0FBQUEsRUFDbEQsTUFBTSxxQkFBcUIsS0FBSyxVQUFVLFlBQVksS0FBSyxNQUFTLEtBQUssVUFBVSxZQUFZLEtBQUssTUFBUztBQUFBLEVBQzdHLE1BQU0saUJBQWlCLE1BQU0sb0JBQzNCLGdCQUNBLG9CQUNBLEtBQUssWUFDTCxNQUNBLElBQ0Y7QUFBQSxFQUNBLElBQUksZ0JBQWdCLGVBQWUsUUFBUTtBQUFBLEVBQzNDLElBQUksdUJBQXVCLFdBQVcsQ0FBQyxHQUFHO0FBQUEsSUFDeEMsTUFBTSxNQUFNLGVBQWUsU0FBUztBQUFBLElBQ3BDLE1BQU0sS0FBSyxlQUFRLGNBQWM7QUFBQSxJQUNqQyxnQkFBZ0IsSUFBSSxzQkFBc0I7QUFBQSxJQUMxQyxHQUFHLEtBQUssU0FBUyxjQUFjLEtBQUs7QUFBQSxJQUNwQyxHQUFHLEtBQUssVUFBVSxjQUFjLE1BQU07QUFBQSxFQUN4QztBQUFBLEVBQ0EsSUFBSSxLQUFLLFVBQVUsWUFBWSxJQUFJO0FBQUEsSUFDakMsYUFBYSxjQUFjLFNBQVM7QUFBQSxJQUNwQyxZQUFZLGNBQWM7QUFBQSxFQUM1QjtBQUFBLEVBQ0EsSUFBSSxtQkFBbUIsS0FBSyxVQUFVO0FBQUEsRUFDdEMsSUFBSSxLQUFLLFVBQVUsU0FBYyxhQUFLLEtBQUssVUFBVSxTQUFTLElBQUk7QUFBQSxJQUNoRSxJQUFJLHVCQUF1QixXQUFXLENBQUMsR0FBRztBQUFBLE1BQ3hDLG9CQUFvQixTQUFTLEtBQUssVUFBVSxPQUFPO0FBQUEsSUFDckQsRUFBTztBQUFBLE1BQ0wsb0JBQW9CLE1BQU0sS0FBSyxVQUFVLE9BQU87QUFBQTtBQUFBLEVBRXBEO0FBQUEsRUFDQSxNQUFNLGtCQUFrQixNQUFNLG9CQUM1QixnQkFDQSxrQkFDQSxLQUFLLFlBQ0wsTUFDQSxJQUNGO0FBQUEsRUFDQSxlQUFRLGVBQWUsRUFBRSxLQUFLLFNBQVMsWUFBWTtBQUFBLEVBQ25ELElBQUksaUJBQWlCLGdCQUFnQixRQUFRO0FBQUEsRUFDN0MsSUFBSSx1QkFBdUIsV0FBVyxDQUFDLEdBQUc7QUFBQSxJQUN4QyxNQUFNLE1BQU0sZ0JBQWdCLFNBQVM7QUFBQSxJQUNyQyxNQUFNLEtBQUssZUFBUSxlQUFlO0FBQUEsSUFDbEMsaUJBQWlCLElBQUksc0JBQXNCO0FBQUEsSUFDM0MsR0FBRyxLQUFLLFNBQVMsZUFBZSxLQUFLO0FBQUEsSUFDckMsR0FBRyxLQUFLLFVBQVUsZUFBZSxNQUFNO0FBQUEsRUFDekM7QUFBQSxFQUNBLGFBQWEsZUFBZSxTQUFTO0FBQUEsRUFDckMsSUFBSSxlQUFlLFFBQVEsVUFBVTtBQUFBLElBQ25DLFdBQVcsZUFBZTtBQUFBLEVBQzVCO0FBQUEsRUFDQSxNQUFNLGtCQUFrQixDQUFDO0FBQUEsRUFDekIsS0FBSyxVQUFVLFFBQVEsUUFBUSxPQUFPLFdBQVc7QUFBQSxJQUMvQyxNQUFNLGFBQWEsT0FBTyxrQkFBa0I7QUFBQSxJQUM1QyxJQUFJLGFBQWEsV0FBVztBQUFBLElBQzVCLElBQUksdUJBQXVCLFdBQVcsQ0FBQyxHQUFHO0FBQUEsTUFDeEMsYUFBYSxXQUFXLFFBQVEsTUFBTSxNQUFNLEVBQUUsUUFBUSxNQUFNLE1BQU07QUFBQSxJQUNwRTtBQUFBLElBQ0EsTUFBTSxNQUFNLE1BQU0sb0JBQ2hCLGdCQUNBLFlBQ0EsV0FBVyxXQUFXLFdBQVcsV0FBVyxLQUFLLFlBQ2pELE1BQ0EsSUFDRjtBQUFBLElBQ0EsSUFBSSxPQUFPLElBQUksUUFBUTtBQUFBLElBQ3ZCLElBQUksdUJBQXVCLFdBQVcsQ0FBQyxHQUFHO0FBQUEsTUFDeEMsTUFBTSxNQUFNLElBQUksU0FBUztBQUFBLE1BQ3pCLE1BQU0sS0FBSyxlQUFRLEdBQUc7QUFBQSxNQUN0QixPQUFPLElBQUksc0JBQXNCO0FBQUEsTUFDakMsR0FBRyxLQUFLLFNBQVMsS0FBSyxLQUFLO0FBQUEsTUFDM0IsR0FBRyxLQUFLLFVBQVUsS0FBSyxNQUFNO0FBQUEsSUFDL0I7QUFBQSxJQUNBLElBQUksS0FBSyxRQUFRLFVBQVU7QUFBQSxNQUN6QixXQUFXLEtBQUs7QUFBQSxJQUNsQjtBQUFBLElBQ0EsYUFBYSxLQUFLLFNBQVM7QUFBQSxJQUMzQixnQkFBZ0IsS0FBSyxHQUFHO0FBQUEsR0FDekI7QUFBQSxFQUNELGFBQWE7QUFBQSxFQUNiLE1BQU0sZUFBZSxDQUFDO0FBQUEsRUFDdEIsS0FBSyxVQUFVLFFBQVEsUUFBUSxPQUFPLFdBQVc7QUFBQSxJQUMvQyxNQUFNLGFBQWEsT0FBTyxrQkFBa0I7QUFBQSxJQUM1QyxJQUFJLGNBQWMsV0FBVztBQUFBLElBQzdCLElBQUksdUJBQXVCLFdBQVcsQ0FBQyxHQUFHO0FBQUEsTUFDeEMsY0FBYyxZQUFZLFFBQVEsTUFBTSxNQUFNLEVBQUUsUUFBUSxNQUFNLE1BQU07QUFBQSxJQUN0RTtBQUFBLElBQ0EsTUFBTSxNQUFNLE1BQU0sb0JBQ2hCLGdCQUNBLGFBQ0EsV0FBVyxXQUFXLFdBQVcsV0FBVyxLQUFLLFlBQ2pELE1BQ0EsSUFDRjtBQUFBLElBQ0EsSUFBSSxPQUFPLElBQUksUUFBUTtBQUFBLElBQ3ZCLElBQUksdUJBQXVCLFdBQVcsQ0FBQyxHQUFHO0FBQUEsTUFDeEMsTUFBTSxNQUFNLElBQUksU0FBUztBQUFBLE1BQ3pCLE1BQU0sS0FBSyxlQUFRLEdBQUc7QUFBQSxNQUN0QixPQUFPLElBQUksc0JBQXNCO0FBQUEsTUFDakMsR0FBRyxLQUFLLFNBQVMsS0FBSyxLQUFLO0FBQUEsTUFDM0IsR0FBRyxLQUFLLFVBQVUsS0FBSyxNQUFNO0FBQUEsSUFDL0I7QUFBQSxJQUNBLElBQUksS0FBSyxRQUFRLFVBQVU7QUFBQSxNQUN6QixXQUFXLEtBQUs7QUFBQSxJQUNsQjtBQUFBLElBQ0EsYUFBYSxLQUFLLFNBQVM7QUFBQSxJQUMzQixhQUFhLEtBQUssR0FBRztBQUFBLEdBQ3RCO0FBQUEsRUFDRCxhQUFhO0FBQUEsRUFDYixJQUFJLGNBQWM7QUFBQSxJQUNoQixJQUFJLFVBQVUsV0FBVyxjQUFjLFNBQVM7QUFBQSxJQUNoRCxlQUFRLGNBQWMsRUFBRSxLQUN0QixhQUNBLGlCQUFpQixLQUFLLFdBQVcsSUFBSSxVQUFVLE9BQU8sS0FBSyxZQUFZLElBQUksR0FDN0U7QUFBQSxJQUNBLGNBQWMsY0FBYyxTQUFTO0FBQUEsRUFDdkM7QUFBQSxFQUNBLElBQUksU0FBUyxXQUFXLGVBQWUsU0FBUztBQUFBLEVBQ2hELGVBQVEsZUFBZSxFQUFFLEtBQ3ZCLGFBQ0EsaUJBQWlCLEtBQUssV0FBVyxJQUFJLFNBQVMsUUFBUSxLQUFLLFlBQVksSUFBSSxlQUFlLEdBQzVGO0FBQUEsRUFDQSxlQUFlLGVBQWUsU0FBUztBQUFBLEVBQ3ZDLFFBQVEsS0FBSyxTQUFTLFNBQVMsRUFBRSxLQUFLLE1BQU0sQ0FBQyxXQUFXLElBQUksV0FBVyxFQUFFLEtBQUssTUFBTSxXQUFXLElBQUksV0FBVyxFQUFFLEtBQUssTUFBTSxDQUFDLFlBQVksSUFBSSxjQUFjLGFBQWEsV0FBVyxFQUFFLEtBQUssTUFBTSxDQUFDLFlBQVksSUFBSSxjQUFjLGFBQWEsV0FBVztBQUFBLEVBQ3RQLGVBQWU7QUFBQSxFQUNmLGdCQUFnQixRQUFRLENBQUMsUUFBUTtBQUFBLElBQy9CLGVBQVEsR0FBRyxFQUFFLEtBQ1gsYUFDQSxnQkFBZ0IsQ0FBQyxXQUFXLElBQUksUUFBUSxLQUFLLFlBQVksSUFBSSxjQUFjLGFBQWEsS0FBSyxHQUMvRjtBQUFBLElBQ0EsTUFBTSxhQUFhLEtBQUssUUFBUTtBQUFBLElBQ2hDLGdCQUFnQixZQUFZLFVBQVUsS0FBSztBQUFBLEdBQzVDO0FBQUEsRUFDRCxlQUFlO0FBQUEsRUFDZixXQUFXLEtBQUssU0FBUyxTQUFTLEVBQUUsS0FBSyxNQUFNLENBQUMsV0FBVyxJQUFJLFdBQVcsRUFBRSxLQUFLLE1BQU0sV0FBVyxJQUFJLFdBQVcsRUFBRSxLQUFLLE1BQU0sQ0FBQyxZQUFZLElBQUksY0FBYyxhQUFhLFdBQVcsRUFBRSxLQUFLLE1BQU0sQ0FBQyxZQUFZLElBQUksY0FBYyxhQUFhLFdBQVc7QUFBQSxFQUN6UCxlQUFlO0FBQUEsRUFDZixhQUFhLFFBQVEsQ0FBQyxRQUFRO0FBQUEsSUFDNUIsZUFBUSxHQUFHLEVBQUUsS0FDWCxhQUNBLGdCQUFnQixDQUFDLFdBQVcsSUFBSSxRQUFRLEtBQUssWUFBWSxJQUFJLGVBQWUsR0FDOUU7QUFBQSxJQUNBLE1BQU0sYUFBYSxLQUFLLFFBQVE7QUFBQSxJQUNoQyxnQkFBZ0IsWUFBWSxVQUFVLEtBQUs7QUFBQSxHQUM1QztBQUFBLEVBQ0QsTUFBTSxLQUFLLFNBQVMsS0FBSyxLQUFLLEVBQUUsS0FBSyxTQUFTLG1CQUFtQixFQUFFLEtBQUssS0FBSyxDQUFDLFdBQVcsSUFBSSxXQUFXLEVBQUUsS0FBSyxLQUFLLEVBQUUsWUFBWSxLQUFLLFdBQVcsRUFBRSxLQUFLLFNBQVMsV0FBVyxLQUFLLE9BQU8sRUFBRSxLQUFLLFVBQVUsWUFBWSxLQUFLLE9BQU87QUFBQSxFQUNsTyxpQkFBaUIsTUFBTSxLQUFLO0FBQUEsRUFDNUIsS0FBSyxZQUFZLFFBQVEsQ0FBQyxRQUFRO0FBQUEsSUFDaEMsT0FBTyxrQkFBa0IsS0FBSyxNQUFNLE1BQU07QUFBQTtBQUFBLEVBRTVDLE9BQU87QUFBQSxHQUNOLFdBQVc7QUFDZCxJQUFJLFNBQVM7QUFBQSxFQUNYLFNBQVM7QUFBQSxFQUNUO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBLFFBQVE7QUFBQSxFQUNSO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQSxNQUFNO0FBQUEsRUFDTjtBQUFBLEVBQ0EsTUFBTTtBQUFBLEVBQ04sTUFBTTtBQUFBLEVBQ047QUFDRjtBQUNBLElBQUksWUFBWSxDQUFDO0FBQ2pCLElBQUksNkJBQTZCLE9BQU8sT0FBTyxNQUFNLE1BQU0sa0JBQWtCO0FBQUEsRUFDM0UsSUFBSTtBQUFBLEVBQ0osSUFBSTtBQUFBLEVBQ0osSUFBSSxLQUFLLE1BQU07QUFBQSxJQUNiLElBQUk7QUFBQSxJQUNKLElBQUksV0FBVyxFQUFFLGtCQUFrQixXQUFXO0FBQUEsTUFDNUMsU0FBUztBQUFBLElBQ1gsRUFBTyxTQUFJLEtBQUssWUFBWTtBQUFBLE1BQzFCLFNBQVMsS0FBSyxjQUFjO0FBQUEsSUFDOUI7QUFBQSxJQUNBLFFBQVEsS0FBSyxPQUFPLE9BQU8sRUFBRSxLQUFLLGNBQWMsS0FBSyxJQUFJLEVBQUUsS0FBSyxVQUFVLE1BQU07QUFBQSxJQUNoRixLQUFLLE1BQU0sT0FBTyxLQUFLLE9BQU8sT0FBTyxNQUFNLGFBQWE7QUFBQSxFQUMxRCxFQUFPO0FBQUEsSUFDTCxLQUFLLE1BQU0sT0FBTyxLQUFLLE9BQU8sTUFBTSxNQUFNLGFBQWE7QUFBQSxJQUN2RCxRQUFRO0FBQUE7QUFBQSxFQUVWLElBQUksS0FBSyxTQUFTO0FBQUEsSUFDaEIsR0FBRyxLQUFLLFNBQVMsS0FBSyxPQUFPO0FBQUEsRUFDL0I7QUFBQSxFQUNBLElBQUksS0FBSyxPQUFPO0FBQUEsSUFDZCxHQUFHLEtBQUssU0FBUyxrQkFBa0IsS0FBSyxLQUFLO0FBQUEsRUFDL0M7QUFBQSxFQUNBLFVBQVUsS0FBSyxNQUFNO0FBQUEsRUFDckIsSUFBSSxLQUFLLGNBQWM7QUFBQSxJQUNyQixVQUFVLEtBQUssSUFBSSxLQUFLLFNBQVMsVUFBVSxLQUFLLElBQUksS0FBSyxPQUFPLElBQUksWUFBWTtBQUFBLEVBQ2xGO0FBQUEsRUFDQSxPQUFPO0FBQUEsR0FDTixZQUFZO0FBQ2YsSUFBSSwrQkFBK0IsT0FBTyxDQUFDLFNBQVM7QUFBQSxFQUNsRCxNQUFNLEtBQUssVUFBVSxLQUFLO0FBQUEsRUFDMUIsSUFBSSxNQUNGLHFCQUNBLEtBQUssTUFDTCxNQUNBLGdCQUFnQixLQUFLLElBQUksS0FBSyxRQUFRLElBQUksS0FBSyxPQUFPLEtBQUssUUFBUSxJQUFJLEdBQ3pFO0FBQUEsRUFDQSxNQUFNLFdBQVc7QUFBQSxFQUNqQixNQUFNLE9BQU8sS0FBSyxRQUFRO0FBQUEsRUFDMUIsSUFBSSxLQUFLLGFBQWE7QUFBQSxJQUNwQixHQUFHLEtBQ0QsYUFDQSxnQkFBZ0IsS0FBSyxJQUFJLE9BQU8sS0FBSyxRQUFRLEtBQUssUUFBUSxLQUFLLElBQUksS0FBSyxTQUFTLElBQUksWUFBWSxHQUNuRztBQUFBLEVBQ0YsRUFBTztBQUFBLElBQ0wsR0FBRyxLQUFLLGFBQWEsZUFBZSxLQUFLLElBQUksT0FBTyxLQUFLLElBQUksR0FBRztBQUFBO0FBQUEsRUFFbEUsT0FBTztBQUFBLEdBQ04sY0FBYztBQUdqQixTQUFTLGdCQUFnQixDQUFDLE9BQU8sS0FBSyxhQUFhLE9BQU87QUFBQSxFQUN4RCxNQUFNLFNBQVM7QUFBQSxFQUNmLElBQUksV0FBVztBQUFBLEVBQ2YsS0FBSyxRQUFRLFNBQVMsVUFBVSxLQUFLLEdBQUc7QUFBQSxJQUN0QyxZQUFZLFFBQVEsV0FBVyxDQUFDLEdBQUcsS0FBSyxHQUFHO0FBQUEsRUFDN0M7QUFBQSxFQUNBLFdBQVcsV0FBVztBQUFBLEVBQ3RCLElBQUksU0FBUztBQUFBLEVBQ2IsSUFBSSxRQUFRO0FBQUEsRUFDWixJQUFJO0FBQUEsRUFDSixRQUFRLE9BQU87QUFBQSxTQUNSO0FBQUEsTUFDSCxTQUFTO0FBQUEsTUFDVCxRQUFRO0FBQUEsTUFDUjtBQUFBLFNBQ0c7QUFBQSxNQUNILFNBQVM7QUFBQSxNQUNULFFBQVE7QUFBQSxNQUNSLFdBQVc7QUFBQSxNQUNYO0FBQUEsU0FDRztBQUFBLE1BQ0gsUUFBUTtBQUFBLE1BQ1I7QUFBQSxTQUNHO0FBQUEsTUFDSCxRQUFRO0FBQUEsTUFDUjtBQUFBLFNBQ0c7QUFBQSxNQUNILFFBQVE7QUFBQSxNQUNSO0FBQUEsU0FDRztBQUFBLE1BQ0gsUUFBUTtBQUFBLE1BQ1I7QUFBQSxTQUNHO0FBQUEsTUFDSCxRQUFRO0FBQUEsTUFDUjtBQUFBLFNBQ0c7QUFBQSxNQUNILFFBQVE7QUFBQSxNQUNSO0FBQUEsU0FDRztBQUFBLE1BQ0gsUUFBUTtBQUFBLE1BQ1I7QUFBQSxTQUNHO0FBQUEsTUFDSCxRQUFRO0FBQUEsTUFDUjtBQUFBLFNBQ0c7QUFBQSxNQUNILFFBQVE7QUFBQSxNQUNSO0FBQUEsU0FDRztBQUFBLE1BQ0gsUUFBUTtBQUFBLE1BQ1I7QUFBQSxTQUNHO0FBQUEsTUFDSCxRQUFRO0FBQUEsTUFDUjtBQUFBLFNBQ0c7QUFBQSxNQUNILFFBQVE7QUFBQSxNQUNSO0FBQUEsU0FDRztBQUFBLE1BQ0gsUUFBUTtBQUFBLE1BQ1I7QUFBQSxTQUNHO0FBQUEsTUFDSCxRQUFRO0FBQUEsTUFDUjtBQUFBLFNBQ0c7QUFBQSxNQUNILFFBQVE7QUFBQSxNQUNSO0FBQUEsU0FDRztBQUFBLE1BQ0gsUUFBUTtBQUFBLE1BQ1I7QUFBQSxTQUNHO0FBQUEsTUFDSCxRQUFRO0FBQUEsTUFDUjtBQUFBO0FBQUEsTUFFQSxRQUFRO0FBQUE7QUFBQSxFQUVaLE1BQU0sU0FBUyxtQkFBbUIsUUFBUSxVQUFVLENBQUMsQ0FBQztBQUFBLEVBQ3RELE1BQU0sYUFBYSxPQUFPO0FBQUEsRUFDMUIsTUFBTSxTQUFTLE9BQU8sUUFBUSxFQUFFLE9BQU8sR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRTtBQUFBLEVBQ2hFLE1BQU0sY0FBYyxJQUFJLGFBQWE7QUFBQSxFQUNyQyxNQUFNLE9BQU87QUFBQSxJQUNYLFlBQVksT0FBTztBQUFBLElBQ25CO0FBQUEsSUFDQSxXQUFXO0FBQUEsSUFDWCxJQUFJO0FBQUEsSUFDSixJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxPQUFPLE9BQU87QUFBQSxJQUNkLElBQUksT0FBTztBQUFBLElBQ1gsT0FBTyxjQUFjLEdBQUcsZUFBZSxPQUFPLE9BQU8sT0FBTztBQUFBLElBQzVELFlBQVksT0FBTztBQUFBLElBQ25CLE9BQU8sT0FBTztBQUFBLElBQ2QsUUFBUSxPQUFPO0FBQUEsSUFDZixHQUFHLE9BQU87QUFBQSxJQUNWLEdBQUcsT0FBTztBQUFBLElBQ1Y7QUFBQSxJQUNBLFdBQWdCO0FBQUEsSUFDaEIsTUFBTSxPQUFPO0FBQUEsSUFDYixTQUFTLFlBQVksVUFBVSxHQUFHLE9BQU8sV0FBVztBQUFBLElBQ3BELGdCQUFnQixPQUFPLGtCQUFrQjtBQUFBLEVBQzNDO0FBQUEsRUFDQSxPQUFPO0FBQUE7QUFFVCxPQUFPLGtCQUFrQixrQkFBa0I7QUFDM0MsZUFBZSxrQkFBa0IsQ0FBQyxNQUFNLE9BQU8sS0FBSztBQUFBLEVBQ2xELE1BQU0sT0FBTyxpQkFBaUIsT0FBTyxLQUFLLEtBQUs7QUFBQSxFQUMvQyxJQUFJLEtBQUssU0FBUyxTQUFTO0FBQUEsSUFDekI7QUFBQSxFQUNGO0FBQUEsRUFDQSxNQUFNLFVBQVUsVUFBVTtBQUFBLEVBQzFCLE1BQU0sU0FBUyxNQUFNLFdBQVcsTUFBTSxNQUFNLEVBQUUsUUFBUSxRQUFRLENBQUM7QUFBQSxFQUMvRCxNQUFNLGNBQWMsT0FBTyxLQUFLLEVBQUUsUUFBUTtBQUFBLEVBQzFDLE1BQU0sTUFBTSxJQUFJLFNBQVMsS0FBSyxFQUFFO0FBQUEsRUFDaEMsSUFBSSxPQUFPLEVBQUUsT0FBTyxZQUFZLE9BQU8sUUFBUSxZQUFZLFFBQVEsR0FBRyxHQUFHLEdBQUcsR0FBRyxNQUFNLE9BQU87QUFBQSxFQUM1RixJQUFJLFNBQVMsR0FBRztBQUFBLEVBQ2hCLE9BQU8sT0FBTztBQUFBO0FBRWhCLE9BQU8sb0JBQW9CLG9CQUFvQjtBQUMvQyxlQUFlLHFCQUFxQixDQUFDLE1BQU0sT0FBTyxLQUFLO0FBQUEsRUFDckQsTUFBTSxPQUFPLGlCQUFpQixPQUFPLEtBQUssSUFBSTtBQUFBLEVBQzlDLE1BQU0sTUFBTSxJQUFJLFNBQVMsS0FBSyxFQUFFO0FBQUEsRUFDaEMsSUFBSSxJQUFJLFNBQVMsU0FBUztBQUFBLElBQ3hCLE1BQU0sVUFBVSxVQUFVO0FBQUEsSUFDMUIsTUFBTSxXQUFXLE1BQU0sTUFBTSxFQUFFLFFBQVEsUUFBUSxDQUFDO0FBQUEsSUFDaEQsTUFBTSxZQUFZLE1BQU07QUFBQSxJQUN4QixhQUFhLElBQUk7QUFBQSxFQUNuQjtBQUFBO0FBRUYsT0FBTyx1QkFBdUIsdUJBQXVCO0FBQ3JELGVBQWUsaUJBQWlCLENBQUMsTUFBTSxTQUFTLEtBQUssV0FBVztBQUFBLEVBQzlELFdBQVcsU0FBUyxTQUFTO0FBQUEsSUFDM0IsTUFBTSxVQUFVLE1BQU0sT0FBTyxHQUFHO0FBQUEsSUFDaEMsSUFBSSxNQUFNLFVBQVU7QUFBQSxNQUNsQixNQUFNLGtCQUFrQixNQUFNLE1BQU0sVUFBVSxLQUFLLFNBQVM7QUFBQSxJQUM5RDtBQUFBLEVBQ0Y7QUFBQTtBQUVGLE9BQU8sbUJBQW1CLG1CQUFtQjtBQUM3QyxlQUFlLG1CQUFtQixDQUFDLE1BQU0sU0FBUyxLQUFLO0FBQUEsRUFDckQsTUFBTSxrQkFBa0IsTUFBTSxTQUFTLEtBQUssa0JBQWtCO0FBQUE7QUFFaEUsT0FBTyxxQkFBcUIscUJBQXFCO0FBQ2pELGVBQWUsWUFBWSxDQUFDLE1BQU0sU0FBUyxLQUFLO0FBQUEsRUFDOUMsTUFBTSxrQkFBa0IsTUFBTSxTQUFTLEtBQUsscUJBQXFCO0FBQUE7QUFFbkUsT0FBTyxjQUFjLGNBQWM7QUFDbkMsZUFBZSxXQUFXLENBQUMsTUFBTSxPQUFPLFNBQVMsS0FBSyxJQUFJO0FBQUEsRUFDeEQsTUFBTSxJQUFJLElBQWEsTUFBTTtBQUFBLElBQzNCLFlBQVk7QUFBQSxJQUNaLFVBQVU7QUFBQSxFQUNaLENBQUM7QUFBQSxFQUNELEVBQUUsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLElBQ1QsU0FBUztBQUFBLEVBQ1gsQ0FBQztBQUFBLEVBQ0QsV0FBVyxTQUFTLFNBQVM7QUFBQSxJQUMzQixJQUFJLE1BQU0sTUFBTTtBQUFBLE1BQ2QsRUFBRSxRQUFRLE1BQU0sSUFBSTtBQUFBLFFBQ2xCLE9BQU8sTUFBTSxLQUFLO0FBQUEsUUFDbEIsUUFBUSxNQUFNLEtBQUs7QUFBQSxRQUNuQixXQUFXLE1BQU07QUFBQSxNQUNuQixDQUFDO0FBQUEsSUFDSDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFdBQVcsUUFBUSxPQUFPO0FBQUEsSUFDeEIsSUFBSSxLQUFLLFNBQVMsS0FBSyxLQUFLO0FBQUEsTUFDMUIsTUFBTSxhQUFhLElBQUksU0FBUyxLQUFLLEtBQUs7QUFBQSxNQUMxQyxNQUFNLFdBQVcsSUFBSSxTQUFTLEtBQUssR0FBRztBQUFBLE1BQ3RDLElBQUksWUFBWSxRQUFRLFVBQVUsTUFBTTtBQUFBLFFBQ3RDLE1BQU0sU0FBUyxXQUFXO0FBQUEsUUFDMUIsTUFBTSxPQUFPLFNBQVM7QUFBQSxRQUN0QixNQUFNLFNBQVM7QUFBQSxVQUNiLEVBQUUsR0FBRyxPQUFPLEdBQUcsR0FBRyxPQUFPLEVBQUU7QUFBQSxVQUMzQixFQUFFLEdBQUcsT0FBTyxLQUFLLEtBQUssSUFBSSxPQUFPLEtBQUssR0FBRyxHQUFHLE9BQU8sS0FBSyxLQUFLLElBQUksT0FBTyxLQUFLLEVBQUU7QUFBQSxVQUMvRSxFQUFFLEdBQUcsS0FBSyxHQUFHLEdBQUcsS0FBSyxFQUFFO0FBQUEsUUFDekI7QUFBQSxRQUNBLE1BQU0saUJBQWlCLEtBQUssR0FBRyxNQUFNLEtBQUssT0FBTyxLQUFLO0FBQUEsUUFDdEQsTUFBTSxpQkFBaUIsS0FBSyxjQUFjLFVBQVUseUJBQXlCO0FBQUEsUUFDN0UsTUFBTSxlQUFlLEtBQUssWUFBWSxXQUFXLHdCQUF3QjtBQUFBLFFBQ3pFLE1BQU0saUJBQWlCLEdBQUcsa0JBQWtCO0FBQUEsUUFDNUMsV0FDRSxNQUNBLEVBQUUsR0FBRyxLQUFLLE9BQU8sR0FBRyxLQUFLLEtBQUssTUFBTSxlQUFlLEdBQ25EO0FBQUEsYUFDSztBQUFBLFVBQ0gsSUFBSTtBQUFBLFVBQ0osY0FBYyxLQUFLO0FBQUEsVUFDbkIsZ0JBQWdCLEtBQUs7QUFBQSxVQUNyQjtBQUFBLFVBQ0EsU0FBUztBQUFBLFFBQ1gsR0FDSyxXQUNMLFNBQ0EsR0FDQSxFQUNGO0FBQUEsUUFDQSxJQUFJLEtBQUssT0FBTztBQUFBLFVBQ2QsTUFBTSxnQkFBZ0IsTUFBTTtBQUFBLGVBQ3ZCO0FBQUEsWUFDSCxPQUFPLEtBQUs7QUFBQSxZQUNaLFlBQVk7QUFBQSxZQUNaLGNBQWMsS0FBSztBQUFBLFlBQ25CLGdCQUFnQixLQUFLO0FBQUEsWUFDckI7QUFBQSxZQUNBLFNBQVM7QUFBQSxVQUNYLENBQUM7QUFBQSxVQUNELGtCQUNFLEtBQUssTUFBTSxHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsT0FBTyxHQUFHLEVBQUUsR0FDMUM7QUFBQSxZQUNFLGNBQWM7QUFBQSxVQUNoQixDQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBO0FBRUYsT0FBTyxhQUFhLGFBQWE7QUFHakMsSUFBSSw4QkFBOEIsT0FBTyxRQUFRLENBQUMsTUFBTSxTQUFTO0FBQUEsRUFDL0QsT0FBTyxRQUFRLEdBQUcsV0FBVztBQUFBLEdBQzVCLFlBQVk7QUFDZixJQUFJLHVCQUF1QixPQUFPLGNBQWMsQ0FBQyxNQUFNLElBQUksVUFBVSxTQUFTO0FBQUEsRUFDNUUsUUFBUSxlQUFlLE9BQU8sU0FBUyxVQUFVO0FBQUEsRUFDakQsTUFBTSxNQUFNLFFBQVE7QUFBQSxFQUNwQixJQUFJLGFBQWEsRUFBRTtBQUFBLEVBQ25CLElBQUk7QUFBQSxFQUNKLElBQUksa0JBQWtCLFdBQVc7QUFBQSxJQUMvQixpQkFBaUIsZUFBUyxPQUFPLEVBQUU7QUFBQSxFQUNyQztBQUFBLEVBQ0EsTUFBTSxPQUFPLGtCQUFrQixZQUFZLGVBQVMsZUFBZSxNQUFNLEVBQUUsR0FBRyxnQkFBZ0IsSUFBSSxJQUFJLGVBQVMsTUFBTTtBQUFBLEVBQ3JILE1BQU0sTUFBTSxrQkFBa0IsWUFBWSxLQUFLLE9BQU8sUUFBUSxNQUFNLElBQUksZUFBUyxRQUFRLE1BQU07QUFBQSxFQUMvRixNQUFNLFdBQVcsQ0FBQyxTQUFTLFVBQVUsT0FBTztBQUFBLEVBQzVDLGdCQUFnQixLQUFLLFVBQVUsUUFBUSxNQUFNLEVBQUU7QUFBQSxFQUMvQyxNQUFNLEtBQUssSUFBSSxVQUFVO0FBQUEsRUFDekIsTUFBTSxRQUFRLElBQUksY0FBYztBQUFBLEVBQ2hDLE1BQU0sUUFBUSxJQUFJLFNBQVM7QUFBQSxFQUMzQixNQUFNLFFBQVEsSUFBSSxPQUFPLEdBQUcsRUFBRSxLQUFLLFNBQVMsT0FBTztBQUFBLEVBQ25ELE1BQU0sb0JBQW9CLE9BQU8sSUFBSSxHQUFHO0FBQUEsRUFDeEMsTUFBTSxTQUFTLE9BQU8sR0FBRztBQUFBLEVBQ3pCLE1BQU0sYUFBYSxPQUFPLElBQUksR0FBRztBQUFBLEVBQ2pDLE1BQU0sWUFBWSxPQUFPLE9BQU8sT0FBTyxLQUFLLEVBQUU7QUFBQSxFQUM5QyxJQUFJLFFBQVE7QUFBQSxJQUNWLE1BQU0sVUFBVTtBQUFBLElBQ2hCLE1BQU0sY0FBYyxLQUFLLElBQUksR0FBRyxLQUFLLE1BQU0sU0FBUyxRQUFRLFFBQVEsUUFBUSxPQUFPLENBQUM7QUFBQSxJQUNwRixNQUFNLFNBQVMsUUFBUSxTQUFTLGNBQWM7QUFBQSxJQUM5QyxNQUFNLFFBQVEsUUFBUSxRQUFRO0FBQUEsSUFDOUIsUUFBUSxnQkFBZ0I7QUFBQSxJQUN4QixpQkFBaUIsS0FBSyxRQUFRLE9BQU8sQ0FBQyxDQUFDLFdBQVc7QUFBQSxJQUNsRCxJQUFJLE1BQU0sZUFBZSxRQUFRLE9BQU87QUFBQSxJQUN4QyxJQUFJLEtBQ0YsV0FDQSxHQUFHLFFBQVEsSUFBSSxLQUFLLFFBQVEsSUFBSSxLQUFLLFFBQVEsUUFBUSxNQUFNLFFBQVEsU0FBUyxJQUM5RTtBQUFBLEVBQ0Y7QUFBQSxHQUNDLE1BQU07QUFDVCxJQUFJLHdCQUF3QjtBQUFBLEVBQzFCO0FBQUEsRUFDQSxZQUFZO0FBQ2Q7QUFHQSxJQUFJLFVBQVU7QUFBQSxFQUNaLFFBQVE7QUFBQSxFQUNSLElBQUk7QUFBQSxFQUNKLFVBQVU7QUFBQSxFQUNWLFFBQVE7QUFDVjsiLAogICJkZWJ1Z0lkIjogIjU0Q0NERjQ1MkM5QjhGODY2NDc1NkUyMTY0NzU2RTIxIiwKICAibmFtZXMiOiBbXQp9
